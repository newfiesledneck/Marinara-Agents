"""Shared helpers for the true giants (make_hill_giant.py, make_stone_giant.py, make_frost_giant.py and
make_fire_giant.py), on top of wwblend.py.

A giant is a person grown huge, so its body starts from the player's base avatar (a snapshot of
make_avatar.py's avatar-male.glb, kept as assets/models/giant-base.glb): a well-built human mesh already
weighted to the people's skeleton. `Giant` loads it, mixes its body shape keys, raises its arms into the people's T-pose, and then
re-proportions it bone by bone (`proportion`): each bone's part of the skin is scaled along the bone and
across it, about where the bone now starts, blended by the skin weights so the joins stay smooth. Bumps
and dents (`bump`, `push`, `noise`) give it a giant's face and build, the hands close into fists, and the
mesh is reduced to the giant's budget.

Its clothes and armour are shells of the skin itself (`shell`): the faces of a region copied, lifted off
along their normals, hemmed with a ragged edge and weighted exactly as the skin under them, so they move
with it. Small rigid things (buckles, rivets, beads, braids, horns, the weapon) are wwblend's hard parts,
each on one bone. `finish` puts it all in one mesh with one baked texture and writes the .glb, rigged to
a skeleton laid out from the re-proportioned joints.
"""

import math
import os
import sys

import bmesh
import bpy
import numpy as np
from mathutils import Matrix, Quaternion, Vector, noise

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import wwblend as ww  # noqa: E402
from wwblend import BONES, at  # noqa: E402

# The body every giant starts from: a snapshot of the player's base avatar (make_avatar.py's avatar-male.glb,
# rig, weights and body shape keys and all), kept as assets/models/giant-base.glb so the giants don't change
# whenever the avatar does. (WW_GIANT_BASE: another copy to start from instead.)
AVATAR = os.environ.get("WW_GIANT_BASE") or os.path.join(ww.MODELS, "giant-base.glb")
NAMES = [name for name, _ in BONES]
log = ww._log
# The avatar's materials: each giant colours each of them (`Giant.colour_body`).
AVATAR_PARTS = ["skin", "underwear", "eye_white", "iris", "eyebrows", "lips", "nails"]
# Which proportion moves each bone's start from its parent's: (the offset's x, up, front-back factors).
SEGMENT = {
    "spine_01": "torso",
    "spine_02": "torso",
    "spine_03": "torso",
    "neck_01": "neck",
    "Head": "neck",
    "clavicle_l": "shoulders",
    "clavicle_r": "shoulders",
    "upperarm_l": "shoulders",
    "upperarm_r": "shoulders",
    "lowerarm_l": "arm",
    "lowerarm_r": "arm",
    "hand_l": "arm",
    "hand_r": "arm",
    "thigh_l": "hips",
    "thigh_r": "hips",
    "calf_l": "leg",
    "calf_r": "leg",
    "foot_l": "leg",
    "foot_r": "leg",
    "ball_l": "foot",
    "ball_r": "foot",
}
TAILS = {"Head": "head", "hand_l": "hand", "hand_r": "hand", "ball_l": "foot", "ball_r": "foot"}


def smooth(lo, hi, x):
    """0 below `lo`, 1 above `hi`, smoothly between (either way round)."""
    t = np.clip((np.asarray(x, dtype=np.float64) - lo) / (hi - lo), 0.0, 1.0)
    return t * t * (3 - 2 * t)


def gauss(P, c, radii):
    """A soft blob: 1 at `c`, falling off over `radii` (x, y, z; or one number)."""
    d = (P - np.asarray(c, dtype=np.float64)) / np.asarray(radii, dtype=np.float64)
    return np.exp(-np.sum(d * d, axis=1))


def weights_of(obj):
    """{bone: (N,) weights} from the object's vertex groups."""
    n = len(obj.data.vertices)
    names = {g.index: g.name for g in obj.vertex_groups}
    out = {name: np.zeros(n) for name in names.values()}
    for v in obj.data.vertices:
        for g in v.groups:
            out[names[g.group]][v.index] = g.weight
    return out


def apply_modifiers(obj):
    depsgraph = bpy.context.evaluated_depsgraph_get()
    reduced = bpy.data.meshes.new_from_object(obj.evaluated_get(depsgraph))
    old = obj.data
    obj.modifiers.clear()
    obj.data = reduced
    bpy.data.meshes.remove(old)


def xfz(B):
    """Across (to the left), forward and up, for an (N, 3) array of Blender points."""
    return B[:, 0], -B[:, 1], B[:, 2]


def vnoise(P, scale, seed=0.0):
    """Smooth noise (about -1 to 1) at each of the points, blobs about `scale` across."""
    off = Vector((seed * 7.31, seed * 3.17, seed * 5.53))
    return np.array([noise.noise(Vector(p) / scale + off) for p in P])


def cells(P, scale, seed=0.0):
    """For each point, which patch it's in (0-1, a patch about `scale` across) and how far it lies from
    the patch's edge (0 on the edge)."""
    off = Vector((seed * 7.31, seed * 3.17, seed * 5.53))
    ids, edges = [], []
    for p in P:
        d, pts = noise.voronoi(Vector(p) / scale + off, distance_metric="DISTANCE")
        ids.append((math.sin(pts[0].x * 12.9898 + pts[0].y * 78.233 + pts[0].z * 37.719) * 43758.5453) % 1.0)
        edges.append((d[1] - d[0]) * scale)
    return np.array(ids), np.array(edges)


def G(x, up, fwd):
    """A point given as the game's code gives it (x to the left, up, forward), as a numpy array."""
    return np.array(at(x, up, fwd), dtype=np.float64)


def lathe(m, a, b, radii, colour, bone, around=10, rough=0.0, grooves=0.0, seed=0.0, flat=1.0, cap=None, smooth=True, bend=None):
    """A hard part turned round the line from `a` to `b` (a log, a haft, a blade's grip), its radius going
    through `radii` evenly from end to end, roughened by noise (`rough`, against the radius) and furrowed
    along its length (`grooves`: bark), squashed across by `flat`. `cap`: the colour of its end faces (cut
    wood), else its own. `bend`: an offset added along it, growing with the square of the distance (a
    sagging branch). Returns the ring centres."""
    a, b = Vector(a), Vector(b)
    axis = b - a
    length = axis.length
    z = axis.normalized()
    x = z.orthogonal().normalized()
    y = z.cross(x)
    bm = bmesh.new()
    rings, centres = [], []
    n = len(radii)
    off = Vector((seed * 3.1, seed * 1.7, seed * 2.3))
    for i, r in enumerate(radii):
        t = i / (n - 1)
        c = a + axis * t + (Vector(bend) * t * t if bend is not None else Vector())
        centres.append(c)
        ring = []
        for j in range(around):
            ang = 2 * math.pi * j / around
            k = 1.0
            if rough:
                k += rough * noise.noise(Vector((math.cos(ang) * 1.5, math.sin(ang) * 1.5, t * length / max(r * 3, 1e-3))) + off)
            if grooves:
                k += grooves * (abs(math.sin(ang * around / 4 + 2.5 * noise.noise(Vector((t * 4, j * 0.3, 0)) + off))) - 0.6)
            ring.append(bm.verts.new(c + (x * math.cos(ang) * flat + y * math.sin(ang)) * r * k))
        rings.append(ring)
    colours = []
    for r0, r1 in zip(rings, rings[1:]):
        for j in range(around):
            bm.faces.new((r0[j], r0[(j + 1) % around], r1[(j + 1) % around], r1[j]))
            colours.append(colour)
    for ring, centre, flip in ((rings[0], centres[0], True), (rings[-1], centres[-1], False)):
        hub = bm.verts.new(centre)
        for j in range(around):
            f = (ring[j], ring[(j + 1) % around], hub)
            bm.faces.new(tuple(reversed(f)) if flip else f)
            colours.append(cap if cap is not None else colour)
    m._add_bm(bm, colours, bone, smooth)
    return centres


def flap(m, top, out, width, length, thick, colour, bone, flare=0.15, jag=0.25, seed=0, columns=4, rows=4, curve=0.0):
    """A hanging flap of hide or cloth (a slab `thick` deep): from `top` (the middle of its upper edge)
    hanging `length` down, its broad side facing `out`, flaring outwards (`flare`, against its length)
    towards the bottom, curved round the body by `curve`, its lower edge torn raggedly (`jag`). `colour`:
    a colour, or `colour(t)` for how far down (0-1) each row of it is (soot creeping up a hem)."""
    rng = np.random.default_rng(seed)
    top, out = Vector(top), Vector(out).normalized()
    side = Vector((0, 0, 1)).cross(out).normalized()
    cuts = 1 - jag * rng.random(columns + 1)
    bm = bmesh.new()
    grid = []
    for i in range(rows + 1):
        row = []
        for j in range(columns + 1):
            u = j / columns - 0.5
            t = i / rows * cuts[j]
            p = top + side * u * width * (1 + 0.15 * t) - Vector((0, 0, length * t)) + out * (flare * length * t * t - curve * width * u * u)
            row.append((bm.verts.new(p + out * thick / 2), bm.verts.new(p - out * thick / 2)))
        grid.append(row)
    shade_of = colour if callable(colour) else (lambda t: colour)
    colours = []
    for i in range(rows):
        for j in range(columns):
            a, b, c, d = grid[i][j], grid[i][j + 1], grid[i + 1][j + 1], grid[i + 1][j]
            bm.faces.new((a[0], d[0], c[0], b[0]))
            bm.faces.new((a[1], b[1], c[1], d[1]))
            colours += [shade_of((i + 0.5) / rows)] * 2
    for i in range(rows):
        for j in (0, columns):
            a, d = grid[i][j], grid[i + 1][j]
            f = (a[0], a[1], d[1], d[0])
            bm.faces.new(f if j == 0 else tuple(reversed(f)))
            colours.append(shade_of((i + 0.5) / rows))
    for j in range(columns):
        for row, flip, t in ((grid[0], False, 0.0), (grid[-1], True, 1.0)):
            a, b = row[j], row[j + 1]
            f = (a[0], b[0], b[1], a[1])
            bm.faces.new(tuple(reversed(f)) if flip else f)
            colours.append(shade_of(t))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    m._add_bm(bm, colours, bone)


def slab(m, outer, inner, origin, u, v, t_inner, t_outer, colour, bone, edge=None):
    """A flat piece with a bevelled edge (a blade): `outer` and `inner` outlines (as many (a, b) points
    each, going round the same way; the inner one inside the outer) laid out from `origin` along `u` and
    `v`; the inner part `t_inner` thick and the outer edge `t_outer`. `edge`: the bevel's colour (a honed
    edge), else its own."""
    origin, u, v = Vector(origin), Vector(u), Vector(v)
    n = u.cross(v).normalized()
    bm = bmesh.new()

    def place(points, t):
        front = [bm.verts.new(origin + u * a + v * b + n * t / 2) for a, b in points]
        back = [bm.verts.new(origin + u * a + v * b - n * t / 2) for a, b in points]
        return front, back

    fi, bi = place(inner, t_inner)
    fo, bo = place(outer, t_outer)
    colours = []
    bm.faces.new(fi)
    bm.faces.new(list(reversed(bi)))
    colours += [colour, colour]
    k = len(outer)
    for i in range(k):
        j = (i + 1) % k
        bm.faces.new((fo[i], fo[j], fi[j], fi[i]))
        bm.faces.new((bi[i], bi[j], bo[j], bo[i]))
        bm.faces.new((bo[i], bo[j], fo[j], fo[i]))
        colours += [edge or colour] * 3
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    m._add_bm(bm, colours, bone, smooth=False)


def braid(m, points, r, colour, bone, shade_colour=None, tie=None):
    """A plaited braid along `points`: lobes of radius `r` (tapering a little) set alternately to either
    side, a tie of `tie` colour near its end and a loose tuft below it."""
    points = [Vector(p) for p in points]
    lengths = [0.0]
    for a, b in zip(points, points[1:]):
        lengths.append(lengths[-1] + (b - a).length)
    total = lengths[-1]

    def at_length(s):
        for i in range(len(points) - 1):
            if s <= lengths[i + 1] or i == len(points) - 2:
                t = (s - lengths[i]) / max(lengths[i + 1] - lengths[i], 1e-6)
                return points[i].lerp(points[i + 1], min(1.0, t)), (points[i + 1] - points[i]).normalized()

    s, k = 0.0, 0
    while s < total * 0.84:
        p, d = at_length(s)
        side = d.cross(Vector((0, 0, 1)) if abs(d.z) < 0.9 else Vector((1, 0, 0))).normalized()
        rr = r * (1 - 0.3 * s / total)
        p = p + side * rr * 0.35 * (1 if k % 2 else -1)
        m.sphere(p, (rr * 0.95, rr * 0.95, rr * 1.5), colour if k % 2 or shade_colour is None else shade_colour, bone, segments=6, rings=4)
        s += rr * 0.85
        k += 1
    p, d = at_length(total * 0.86)
    if tie is not None:
        m.tube(p - d * r * 0.4, p + d * r * 0.4, r * 0.85, r * 0.85, tie, bone, segments=8)
    end, _ = at_length(total)
    m.cone(p, end, r * 0.7, colour, bone, segments=6)


class Giant:
    """One giant: the avatar's body, re-proportioned and dressed, with hard parts from a wwblend.Model."""

    def __init__(self, name, keys):
        self.name = name
        ww.reset()
        self.m = ww.Model(name)  # (for its palette and hard parts; its metaballs go unused)
        bpy.ops.import_scene.gltf(filepath=AVATAR)
        scene = bpy.context.scene
        rig = next(o for o in scene.objects if o.type == "ARMATURE")
        body = max((o for o in scene.objects if o.type == "MESH"), key=lambda o: len(o.data.vertices))
        for o in [o for o in scene.objects if o.type == "MESH" and o is not body]:
            bpy.data.objects.remove(o)
        # The body shape keys, mixed into the mesh.
        blocks = body.data.shape_keys.key_blocks
        n = len(body.data.vertices)

        def co(block):
            out = np.empty(n * 3)
            block.data.foreach_get("co", out)
            return out

        basis = co(blocks[0])
        mixed = basis + sum((co(blocks[k]) - basis) * v for k, v in keys.items())
        body.shape_key_clear()
        body.data.vertices.foreach_set("co", mixed)
        body.data.update()
        # Into a T-pose: the arms raised from the avatar's A-pose to straight out along x.
        if rig.animation_data:
            for track in list(rig.animation_data.nla_tracks):
                rig.animation_data.nla_tracks.remove(track)
            rig.animation_data.action = None
        for pb in rig.pose.bones:
            pb.rotation_mode = "QUATERNION"
            pb.rotation_quaternion = Quaternion()
            pb.location = (0, 0, 0)
            pb.scale = (1, 1, 1)
        for side, sign in (("l", 1), ("r", -1)):
            bone = rig.data.bones[f"upperarm_{side}"]
            d0 = (bone.tail_local - bone.head_local).normalized()
            q = d0.rotation_difference(Vector((sign, 0, 0)))
            rest = bone.matrix_local.to_quaternion()
            rig.pose.bones[f"upperarm_{side}"].rotation_quaternion = rest.inverted() @ q @ rest
        bpy.context.view_layer.update()
        mw = rig.matrix_world
        self.joints = {}
        for pb in rig.pose.bones:
            self.joints[pb.name] = mw @ pb.head
            self.joints[f"{pb.name}.tail"] = mw @ pb.tail
        # (Skinned by hand, each vertex by its weights: the bones' moves from rest to the T-pose.)
        for md in list(body.modifiers):
            body.modifiers.remove(md)
        body.parent = None
        mesh = body.data
        mesh.transform(body.matrix_world)
        body.matrix_world = Matrix()
        P = np.empty(len(mesh.vertices) * 3)
        mesh.vertices.foreach_get("co", P)
        P = np.c_[P.reshape(-1, 3), np.ones(len(mesh.vertices))]
        weights = weights_of(body)
        out = np.zeros((len(P), 3))
        total = np.zeros(len(P))
        for pb in rig.pose.bones:
            w = weights.get(pb.name)
            if w is None or not w.any():
                continue
            M = np.array(mw @ pb.matrix @ pb.bone.matrix_local.inverted() @ mw.inverted())
            out += w[:, None] * (P @ M.T)[:, :3]
            total += w
        total[total == 0] = 1
        mesh.vertices.foreach_set("co", (out / total[:, None]).ravel())
        mesh.update()
        bpy.data.objects.remove(rig)
        # The glTF's split seams joined up again.
        bm = bmesh.new()
        bm.from_mesh(mesh)
        bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
        bm.to_mesh(mesh)
        bm.free()
        if "custom_normal" in mesh.attributes:
            mesh.attributes.remove(mesh.attributes["custom_normal"])
        mesh.update()
        self.body = body
        self.shells = []  # (object) skinned pieces cut from the skin
        self.cuts = []  # (region, over): skin taken out from under a shell
        self.edges = {}  # shell name: points round its edge
        log(f"base body: {len(mesh.vertices)} vertices")

    # ── Reading and writing the skin ──

    def P(self, obj=None):
        mesh = (obj or self.body).data
        P = np.empty(len(mesh.vertices) * 3)
        mesh.vertices.foreach_get("co", P)
        return P.reshape(-1, 3)

    def N(self, obj=None):
        mesh = (obj or self.body).data
        N = np.empty(len(mesh.vertices) * 3)
        mesh.vertices.foreach_get("normal", N)
        return N.reshape(-1, 3)

    def set_P(self, P, obj=None):
        mesh = (obj or self.body).data
        mesh.vertices.foreach_set("co", np.asarray(P, dtype=np.float64).ravel())
        mesh.update()

    def W(self, obj=None):
        """The skin weights as an (N, bones) array in NAMES order."""
        obj = obj or self.body
        w = weights_of(obj)
        n = len(obj.data.vertices)
        return np.stack([w.get(name, np.zeros(n)) for name in NAMES], axis=1)

    # ── Shaping the body (on the avatar's scale, before `proportion`) ──

    def bump(self, centre, radii, amount, facing=None):
        """Raises the skin (or sinks it, below 0) along its normals by `amount` at `centre` (game
        coordinates), falling off over `radii` (across, up, front to back). `facing`: only where the skin
        faces that way (a game-coordinate direction), so a brow is raised and not the eye under it."""
        P, N = self.P(), self.N()
        c = G(*centre)
        r = np.array((radii[0], radii[2], radii[1]), dtype=np.float64)
        g = gauss(P, c, r)
        if facing is not None:
            g *= smooth(-0.2, 0.6, N @ G(*facing) / np.linalg.norm(G(*facing)))
        self.set_P(P + N * (amount * g)[:, None])

    def push(self, centre, radii, move):
        """Moves the skin by `move` (game x, up, forward) at `centre`, falling off over `radii`."""
        P = self.P()
        r = np.array((radii[0], radii[2], radii[1]), dtype=np.float64)
        g = gauss(P, G(*centre), r)
        self.set_P(P + g[:, None] * G(*move)[None, :])

    def noise(self, amount, scale, where=None, kind="fractal"):
        """Rough skin: displaced along its normals by noise `amount` metres deep, `scale` metres across.
        `where(P)`: a 0-1 mask. `kind` "cells" gives stone-like plates with creases between them."""
        P, N = self.P(), self.N()
        mask = np.ones(len(P)) if where is None else where(P)
        out = np.zeros(len(P))
        for i, p in enumerate(P):
            if mask[i] <= 0:
                continue
            q = Vector(p) / scale
            if kind == "cells":
                d, _ = noise.voronoi(q, distance_metric="DISTANCE", exponent=2.5)
                out[i] = amount * (smooth(0.0, 0.3, np.array(d[1] - d[0])).item() - 0.5) * mask[i]
            else:
                out[i] = amount * noise.fractal(q, 0.6, 2.0, 3) * mask[i]
        self.set_P(P + N * out[:, None])

    def carve(self, where, depth):
        """Cuts grooves into the skin (or raises ridges, below 0): `where(B)` (0-1 each) sunk `depth`."""
        P, N = self.P(), self.N()
        self.set_P(P - N * (depth * np.clip(where(P), 0, 1))[:, None])

    def curl_hand(self, side, angles=(80, 95, 55), thumb=55):
        """Closes a hand into a fist (before `proportion`): each finger bent at its three knuckles by
        `angles` (degrees) towards the palm, and the thumb turned under it by `thumb`. (Measured on the
        avatar's hand, palm down in the T-pose: the fingers part from the palm 0.09 m past the wrist, their
        middle knuckles at 0.126 and the last at 0.15; the thumb lies forward of the palm and below it.)"""
        sign = 1 if side == "l" else -1
        P = self.P()
        wrist = np.array(self.joints[f"hand_{side}"])
        hand = self.W()[:, NAMES.index(f"hand_{side}")] > 0.5
        out = sign * (P[:, 0] - wrist[0])  # how far past the wrist, along the arm
        dy, dz = P[:, 1] - wrist[1], P[:, 2] - wrist[2]
        thumb_mask = hand & (dy < -0.049) & (out > 0.03) & (out < 0.13) & (dz < -0.012)
        fingers = hand & ~thumb_mask & (out > 0.07)
        Q = P.copy()
        for knuckle, angle in reversed(list(zip((0.09, 0.126, 0.15), angles))):
            pivot = np.array((wrist[0] + sign * knuckle, 0.0, wrist[2] - 0.014))
            a = np.radians(angle) * smooth(-0.008, 0.008, out - knuckle) * fingers
            ca, sa = np.cos(a), np.sin(a)
            dx, dzz = Q[:, 0] - pivot[0], Q[:, 2] - pivot[2]
            Q[:, 0] = pivot[0] + dx * ca + sign * dzz * sa
            Q[:, 2] = pivot[2] + dzz * ca - sign * dx * sa
        # The thumb, about the line along the hand at its root, under the palm and in towards the fingers.
        pivot_y, pivot_z = wrist[1] - 0.04, wrist[2] - 0.015
        a = np.radians(thumb) * smooth(0.03, 0.07, out) * thumb_mask
        ca, sa = np.cos(a), np.sin(a)
        y, z = Q[:, 1] - pivot_y, Q[:, 2] - pivot_z
        Q[:, 1] = pivot_y + y * ca - z * sa
        Q[:, 2] = pivot_z + y * sa + z * ca
        self.set_P(Q)

    def proportion(self, height, p):
        """Re-proportions the body bone by bone and scales it to stand `height` metres to the top of its
        head. `p`: factors against a person's, each 1 when not given: `torso`, `neck`, `shoulders`, `arm`,
        `hips`, `leg`, `foot`, `head`, `hand` (lengths and widths), and `thick` {bone: (across, front to
        back)} for how thick each bone's part of the body is."""
        J0 = self.joints
        top0 = self.P()[:, 2].max()
        S = height / top0
        f = {k: p.get(k, 1.0) for k in ("torso", "neck", "shoulders", "arm", "hips", "leg", "foot", "head", "hand")}

        def grow(offset, kind):
            o = Vector(offset)
            if kind in ("torso", "neck"):
                return Vector((o.x, o.y, o.z * f[kind])) * S
            if kind in ("shoulders", "hips"):
                return Vector((o.x * f[kind], o.y, o.z)) * S
            return o * f[kind] * S

        J1 = {"pelvis": J0["pelvis"] * S}
        for name, parent in BONES:
            if parent:
                J1[name] = J1[parent] + grow(J0[name] - J0[parent], SEGMENT[name])
        for name, kind in TAILS.items():
            J1[f"{name}.tail"] = J1[name] + (J0[f"{name}.tail"] - J0[name]) * f[kind] * S
        J1["pelvis.tail"] = J1["spine_01"]
        P = self.P()
        W = self.W()
        thick = p.get("thick", {})
        self.moves = {}
        out = np.zeros_like(P)
        for j, name in enumerate(NAMES):
            w = W[:, j]
            if not w.any():
                continue
            h0 = Vector(J0[name])
            t0 = J0.get(f"{name}.tail")
            child = [c for c, par in BONES if par == name]
            if name in TAILS or name == "pelvis":
                t0, t1 = J0[f"{name}.tail"], J1[f"{name}.tail"]
            else:
                t0, t1 = J0[child[0]], J1[child[0]]
            u0 = (Vector(t0) - h0).normalized()
            u1 = (Vector(t1) - Vector(J1[name])).normalized()
            L = (Vector(t1) - Vector(J1[name])).length / max((Vector(t0) - h0).length, 1e-6)
            across = Vector((1, 0, 0)) if abs(u0.z) > 0.7 or abs(u0.y) > 0.7 else Vector((0, 0, 1))
            v = (across - u0 * across.dot(u0)).normalized()
            wv = u0.cross(v)
            tv, tw = thick.get(name, (1.0, 1.0))
            k = f["head"] if name == "Head" else (f["hand"] if name.startswith("hand") else 1.0)
            tv, tw = tv * S * k, tw * S * k
            A = np.outer(u0, u0) * L + np.outer(v, v) * tv + np.outer(wv, wv) * tw
            R = np.array(u0.rotation_difference(u1).to_matrix())
            A = R @ A
            self.moves[name] = (np.array(h0), np.array(J1[name]), A)
            moved = np.array(J1[name]) + (P - np.array(h0)) @ A.T
            out += w[:, None] * moved
        total = W.sum(axis=1, keepdims=True)
        total[total == 0] = 1
        out /= total
        # Stood on the ground, and scaled once more so its head comes to `height` after all.
        low = out[:, 2].min()
        k = height / (out[:, 2].max() - low)
        drop = np.array((0, 0, low))
        out = (out - drop) * k
        for name in J1:
            J1[name] = (Vector(J1[name]) - Vector(drop)) * k
        self.set_P(out)
        for name, (h0, h1, A) in self.moves.items():
            self.moves[name] = (h0, (h1 - drop) * k, A * k)
        S *= k
        self.joints = J1
        self.S = S
        log(f"proportioned: {out[:, 2].max():.2f} m")

    def map(self, point, bone):
        """Where a point given on a person's scale (game coordinates, before `proportion`) is after it, as
        `bone` moves it (a Vector, Blender coordinates)."""
        h0, h1, A = self.moves[bone]
        return Vector(h1 + A @ (G(*point) - h0))

    def scale_of(self, bone):
        """How much `bone` grew (across it)."""
        return float(np.cbrt(abs(np.linalg.det(self.moves[bone][2]))))

    def reduce(self, vertices):
        """Fewer faces, down to about `vertices` (the skin weights carried over)."""
        n = len(self.body.data.vertices)
        if n <= vertices:
            return
        mod = self.body.modifiers.new("Decimate", "DECIMATE")
        mod.ratio = vertices / n
        mod.use_collapse_triangulate = False
        apply_modifiers(self.body)
        log(f"reduced: {len(self.body.data.vertices)} vertices")

    # ── Where things are: every vertex keeps where it was on the avatar (`base`), so regions and anchors
    # are given on a person's scale and in a person's T-pose, whatever the giant's proportions. ──

    def keep_base(self):
        P = self.P()
        mesh = self.body.data
        attr = mesh.attributes.new("base", "FLOAT_VECTOR", "POINT")
        attr.data.foreach_set("vector", P.ravel())

    def base(self, obj=None):
        mesh = (obj or self.body).data
        B = np.empty(len(mesh.vertices) * 3)
        mesh.attributes["base"].data.foreach_get("vector", B)
        return B.reshape(-1, 3)

    def anchor(self, point):
        """Where a point on a person's body (game coordinates, avatar scale) is on the giant: the nearest
        vertex's (position, normal, strongest bone)."""
        B = self.base()
        i = int(np.argmin(np.linalg.norm(B - G(*point), axis=1)))
        v = self.body.data.vertices[i]
        W = self.W()
        return Vector(v.co), Vector(v.normal), NAMES[int(np.argmax(W[i]))]

    # ── Clothes and armour: shells of the skin ──

    def masks(self, region, obj=None):
        return np.clip(np.asarray(region(self.base(obj), self.P(obj)), dtype=np.float64), 0.0, 1.0)

    def shell(self, region, lift, colour, smooth_rounds=0, rim=1.2, bumps=None, fringe=None, cut=None, under=None):
        """A garment or a plate: the skin's faces where `region(B, P)` (B: where each vertex was on the
        avatar, P: where it is now; 0-1 each) is over a half, lifted `lift` metres off the skin along its
        normals, smoothed `smooth_rounds` times (a plate rather than the muscle under it), with its edge
        turned in towards the skin (`rim`, against `lift`) so it shows a thickness. `colour`: a colour, or
        `colour(b, p, n)` for each face (where its middle was on the avatar, where it is, its normal).
        `bumps` (depth, size): lumps over it (fur, padding). `fringe` (length, jitter): a ragged fringe
        hanging from its lower edge. `cut`: the skin under it, where the region is over this, taken out.
        `under`: a colour for the turned-in edge (its underside)."""
        body = self.body
        mask = self.masks(region)
        bm = bmesh.new()
        bm.from_mesh(body.data)
        bm.normal_update()
        bm.verts.ensure_lookup_table()
        normals = {v: v.normal.copy() for v in bm.verts}
        drop = [f for f in bm.faces if np.mean([mask[v.index] for v in f.verts]) <= 0.5]
        bmesh.ops.delete(bm, geom=drop, context="FACES_ONLY")
        bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context="VERTS")
        if not bm.faces:
            bm.free()
            return None
        base = bm.verts.layers.float_vector.get("base")
        # The edge first evened out (a run of faces leaves it jagged), and the lift eased in from it, so
        # the shell lies down onto the skin there rather than standing up in a saw-toothed wall.
        edge = [v for v in bm.verts if v.is_boundary]
        for _ in range(3):
            moved = {}
            for v in edge:
                around = [e.other_vert(v).co for e in v.link_edges if e.is_boundary]
                if len(around) == 2:
                    moved[v] = v.co * 0.5 + (around[0] + around[1]) * 0.25
            for v, co in moved.items():
                v.co = co
        depth = {v: 0 for v in edge}
        ring = edge
        while ring:
            nxt = []
            for v in ring:
                for e in v.link_edges:
                    o = e.other_vert(v)
                    if o not in depth:
                        depth[o] = depth[v] + 1
                        nxt.append(o)
            ring = nxt
        for v in bm.verts:
            ease = min(1.0, 0.45 + 0.28 * depth.get(v, 9))
            amount = lift
            if bumps:
                q = Vector(v[base]) / bumps[1]
                amount += bumps[0] * (0.5 + 0.5 * noise.noise(q) + 0.35 * noise.noise(q * 2.7))
            v.co += normals[v] * amount * ease
            v.co.z = max(v.co.z, 0.0)  # (a boot's sole stays on the ground)
        for _ in range(smooth_rounds):
            bmesh.ops.smooth_vert(bm, verts=[v for v in bm.verts if not v.is_boundary], factor=0.5, use_axis_x=True, use_axis_y=True, use_axis_z=True)
        layer = bm.faces.layers.int.get("colour") or bm.faces.layers.int.new("colour")
        bm.normal_update()
        for f in bm.faces:
            b = sum((Vector(v[base]) for v in f.verts), Vector()) / len(f.verts)
            f[layer] = colour if isinstance(colour, int) else colour(b, f.calc_center_median(), f.normal)
        edge_colour = under if under is not None else (colour if isinstance(colour, int) else None)
        def neighbour_colour(f, orig, k):
            e = next((e for e in f.edges if e.verts[0] in orig and e.verts[1] in orig), None)
            other = [g for g in (e.link_faces if e else []) if g is not f]
            return ww.shade(other[0][layer], k) if other else f[layer]

        boundary = [e for e in bm.edges if e.is_boundary]
        orig = set(bm.verts)
        deform = bm.verts.layers.deform.active
        group_names = [g.name for g in body.vertex_groups]
        ring = []
        for v in {v for e in boundary for v in e.verts}:
            weights = v[deform] if deform else {}
            bone = group_names[max(weights.items(), key=lambda kv: kv[1])[0]] if weights else "pelvis"
            ring.append((v.co.copy(), normals[v].copy(), bone))
        ring.sort(key=lambda item: (math.atan2(item[0].y, item[0].x), item[0].z))
        if rim and boundary:
            new = bmesh.ops.extrude_edge_only(bm, edges=boundary)["geom"]
            for v in (g for g in new if isinstance(g, bmesh.types.BMVert)):
                twin = next(e.other_vert(v) for e in v.link_edges if e.other_vert(v) in orig)
                v.co = twin.co - normals[twin] * lift * rim
                normals[v] = normals[twin]
            for f in (g for g in new if isinstance(g, bmesh.types.BMFace)):
                f[layer] = edge_colour if edge_colour is not None else neighbour_colour(f, orig, 0.6)
        if fringe:
            orig = set(bm.verts)
            rng = np.random.default_rng(len(bm.verts))
            # (Not from the arms: out in the T-pose they'd hang straight down from them.)
            arms = {i for i, name in enumerate(group_names) if name.split("_")[0] in ("upperarm", "lowerarm", "hand")}

            def on_arm(v):
                w = v[deform] if deform else {}
                return bool(w) and max(w.items(), key=lambda kv: kv[1])[0] in arms

            low = [e for e in bm.edges if e.is_boundary and e.link_faces[0].calc_center_median().z > (e.verts[0].co.z + e.verts[1].co.z) / 2 and not (on_arm(e.verts[0]) or on_arm(e.verts[1]))]
            new = bmesh.ops.extrude_edge_only(bm, edges=low)["geom"]
            verts = [g for g in new if isinstance(g, bmesh.types.BMVert)]
            for v in verts:
                twin = next(e.other_vert(v) for e in v.link_edges if e.other_vert(v) in orig)
                n = normals.get(twin, Vector((0, 0, 0)))
                length = fringe[0] * (1 + fringe[1] * (rng.random() * 2 - 1))
                v.co = twin.co + Vector((0, 0, -length)) + n * length * 0.25
            for f in (g for g in new if isinstance(g, bmesh.types.BMFace)):
                f[layer] = fringe[2] if len(fringe) > 2 else neighbour_colour(f, orig, 0.85)
        mesh = bpy.data.meshes.new(f"{self.name}-shell")
        bm.to_mesh(mesh)
        bm.free()
        if "skin" in mesh.attributes:
            mesh.attributes["skin"].data.foreach_set("value", [0.0] * len(mesh.polygons))
        obj = bpy.data.objects.new(mesh.name, mesh)
        bpy.context.scene.collection.objects.link(obj)
        for g in body.vertex_groups:
            obj.vertex_groups.new(name=g.name)
        self.shells.append(obj)
        self.edges[obj.name] = ring
        if cut is not None:
            self.cuts.append((region, cut))
        return obj

    def edge_of(self, obj, every=1):
        """Points round a shell's edge (where it meets the skin, before its edge is turned in): [(position,
        normal, strongest bone)], every `every`th."""
        return self.edges.get(obj.name, [])[::every]

    def rivets(self, points, r, colour, out=0.0):
        """Small domed heads at `points` ([(position, normal, bone)]), raised `out` along each normal."""
        for p, n, bone in points:
            self.m.sphere(p + n * out, (r, r, r), colour, bone, segments=6, rings=4)

    # ── Putting it together ──

    def _hard_parts(self):
        """wwblend's hard parts (each wholly on one bone) as one mesh object."""
        verts, faces, colours, smooth, bones, heads = [], [], [], [], [], []
        for part_verts, part_faces, colour, bone, part_smooth in self.m.parts:
            offset = len(verts)
            verts += [tuple(v) for v in part_verts]
            bones += [bone] * len(part_verts)
            for n, f in enumerate(part_faces):
                faces.append([i + offset for i in f])
                colours.append(colour[n] if isinstance(colour, list) else colour)
                smooth.append(part_smooth)
                heads.append(1 if bone == "Head" else 2)
        mesh = bpy.data.meshes.new(f"{self.name}-parts")
        mesh.from_pydata(verts, [], faces)
        mesh.polygons.foreach_set("use_smooth", smooth)
        mesh.attributes.new("colour", "INT", "FACE").data.foreach_set("value", colours)
        mesh.attributes.new("part", "INT", "FACE").data.foreach_set("value", heads)
        mesh.validate()
        mesh.update()
        obj = bpy.data.objects.new(mesh.name, mesh)
        bpy.context.scene.collection.objects.link(obj)
        groups = {n: obj.vertex_groups.new(name=n) for n in NAMES}
        for i, bone in enumerate(bones):
            groups[bone].add([i], 1.0, "REPLACE")
        return obj

    def colour_body(self, colours):
        """Colours the skin's faces: `colours` maps each of the avatar's parts (AVATAR_PARTS) to a colour,
        or to `colour(b, p, n)` per face (see `shell`)."""
        mesh = self.body.data
        B = self.base()
        layer = mesh.attributes.get("colour") or mesh.attributes.new("colour", "INT", "FACE")
        values = []
        names = [m.name.split(".")[0] if m else "skin" for m in mesh.materials]
        for poly in mesh.polygons:
            part = names[poly.material_index] if poly.material_index < len(names) else "skin"
            c = colours.get(part, colours["skin"])
            if not isinstance(c, int):
                b = Vector(B[list(poly.vertices)].mean(axis=0))
                c = c(b, Vector(poly.center), Vector(poly.normal))
            values.append(c)
        layer.data.foreach_set("value", values)
        is_skin = mesh.attributes.get("skin") or mesh.attributes.new("skin", "FLOAT", "FACE")
        is_skin.data.foreach_set("value", [1.0 if names[p.material_index] == "skin" else 0.0 for p in mesh.polygons])

    def _bake(self, obj, size=512, ao=0.12, mottle=0.1, mottle_scale=55.0, dirt=0.22, head_scale=2.0, streaks=None):
        """Paints a texture of the model's own: its palette colours, mottled a little (`mottle`, spots
        about 1/`mottle_scale` metres across), darker towards the ground up to `dirt` metres, and shaded
        where it's tucked in (ambient occlusion reaching `ao` metres). Baked by Cycles onto new texture
        coordinates; the palette's are dropped, so the model still has one texture.

        (wwblend's `Model._bake`, with one thing more: `streaks` {scale, amount, width, distortion, colour}
        veins the faces whose `skin` attribute is 1 with thin wavy bands broken by noise, blending towards
        `colour`: a stone giant's darker streaks.)"""
        scene = bpy.context.scene
        scene.render.engine = "CYCLES"
        scene.cycles.device = "CPU"
        scene.cycles.samples = 48
        if scene.world is None:
            scene.world = bpy.data.worlds.new("World")
        scene.world.light_settings.distance = ao
        mesh = obj.data
        # (By name: adding a layer leaves Python's handles on the others pointing at nothing.)
        mesh.uv_layers.new(name="Bake")
        mesh.uv_layers.active = mesh.uv_layers["Bake"]
        bpy.ops.object.select_all(action="DESELECT")
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.mode_set(mode="EDIT")
        bpy.ops.mesh.select_all(action="SELECT")
        # Few, large islands (a bumpy mesh unwrapped at a low angle falls into thousands of crumbs), the
        # head and what's on it twice as wide as the rest, since a face is what's looked at; then packed
        # apart by more than the bake spreads each island past its edge.
        bpy.ops.uv.smart_project(angle_limit=math.radians(85), island_margin=0.0)
        bm = bmesh.from_edit_mesh(mesh)
        uv = bm.loops.layers.uv.active
        part = bm.faces.layers.int.get("part")
        for face in bm.faces:
            if face[part] == 1:
                for loop in face.loops:
                    loop[uv].uv *= head_scale
        bmesh.update_edit_mesh(mesh)
        bpy.ops.uv.pack_islands(rotate=True, margin=0.008)
        log("unwrapped")
        bpy.ops.object.mode_set(mode="OBJECT")

        # The colour to bake: the palette (by its own coordinates), times a mottle, times the dirt.
        material = mesh.materials[0]
        nodes, links = material.node_tree.nodes, material.node_tree.links
        bsdf = nodes.get("Principled BSDF")
        palette = next(n for n in nodes if n.type == "TEX_IMAGE")
        by_palette = nodes.new("ShaderNodeUVMap")
        by_palette.uv_map = "UVMap"
        links.new(by_palette.outputs["UV"], palette.inputs["Vector"])
        coords = nodes.new("ShaderNodeTexCoord")
        noise = nodes.new("ShaderNodeTexNoise")
        noise.inputs["Scale"].default_value = mottle_scale
        noise.inputs["Detail"].default_value = 3.0
        links.new(coords.outputs["Object"], noise.inputs["Vector"])
        spots = nodes.new("ShaderNodeMapRange")
        spots.inputs["To Min"].default_value = 1 - mottle
        spots.inputs["To Max"].default_value = 1 + mottle
        links.new(noise.outputs["Fac"], spots.inputs["Value"])
        height = nodes.new("ShaderNodeSeparateXYZ")
        links.new(coords.outputs["Object"], height.inputs["Vector"])
        grime = nodes.new("ShaderNodeMapRange")
        grime.inputs["From Max"].default_value = dirt
        grime.inputs["To Min"].default_value = 0.72
        grime.inputs["To Max"].default_value = 1.0
        links.new(height.outputs["Z"], grime.inputs["Value"])
        colour_in = palette.outputs["Color"]
        if streaks:
            wave = nodes.new("ShaderNodeTexWave")
            wave.wave_type = "BANDS"
            wave.bands_direction = "DIAGONAL"
            wave.inputs["Scale"].default_value = streaks.get("scale", 3.0)
            wave.inputs["Distortion"].default_value = streaks.get("distortion", 6.0)
            wave.inputs["Detail"].default_value = 3.0
            wave.inputs["Detail Scale"].default_value = 1.5
            links.new(coords.outputs["Object"], wave.inputs["Vector"])
            line = nodes.new("ShaderNodeMapRange")
            line.inputs["From Min"].default_value = 1 - streaks.get("width", 0.12)
            line.inputs["To Max"].default_value = streaks.get("amount", 0.5)
            links.new(wave.outputs["Fac"], line.inputs["Value"])
            skin = nodes.new("ShaderNodeAttribute")
            skin.attribute_type = "GEOMETRY"
            skin.attribute_name = "skin"
            mask = nodes.new("ShaderNodeMath")
            mask.operation = "MULTIPLY"
            links.new(line.outputs["Result"], mask.inputs[0])
            links.new(skin.outputs["Fac"], mask.inputs[1])
            mix = nodes.new("ShaderNodeMix")
            mix.data_type = "RGBA"
            ins = [s for s in mix.inputs if s.type == "RGBA"]
            links.new(mask.outputs["Value"], mix.inputs["Factor"])
            links.new(palette.outputs["Color"], ins[0])
            ins[1].default_value = (*[c**2.2 for c in ww.hex_rgb(streaks.get("colour", 0x202020))], 1.0)
            colour_in = next(s for s in mix.outputs if s.type == "RGBA")
        mottled = nodes.new("ShaderNodeVectorMath")
        mottled.operation = "SCALE"
        links.new(colour_in, mottled.inputs[0])
        links.new(spots.outputs["Result"], mottled.inputs["Scale"])
        dirty = nodes.new("ShaderNodeVectorMath")
        dirty.operation = "SCALE"
        links.new(mottled.outputs["Vector"], dirty.inputs[0])
        links.new(grime.outputs["Result"], dirty.inputs["Scale"])
        links.new(dirty.outputs["Vector"], bsdf.inputs["Base Color"])

        def target(label, colour_space):
            image = bpy.data.images.new(f"{self.name}-{label}", size, size, alpha=False)
            image.colorspace_settings.name = colour_space
            node = nodes.new("ShaderNodeTexImage")
            node.image = image
            nodes.active = node
            return image

        colour_image = target("colour", "sRGB")
        bpy.ops.object.bake(type="DIFFUSE", pass_filter={"COLOR"}, margin=2, use_clear=True)
        log("colour baked")
        ao_image = target("ao", "Non-Color")
        bpy.ops.object.bake(type="AO", margin=2, use_clear=True)
        colour = np.array(colour_image.pixels[:], dtype=np.float32).reshape(size, size, 4)
        occlusion = np.array(ao_image.pixels[:], dtype=np.float32).reshape(size, size, 4)[..., :1]
        colour[..., :3] *= 0.42 + 0.58 * occlusion**0.9
        final = bpy.data.images.new(f"{self.name}-texture", size, size, alpha=False)
        final.pixels.foreach_set(colour.ravel())
        final.file_format = "PNG"
        final.pack()

        # The model's material is now that texture alone, on the new coordinates.
        for node in list(nodes):
            if node.type not in ("BSDF_PRINCIPLED", "OUTPUT_MATERIAL"):
                nodes.remove(node)
        texture = nodes.new("ShaderNodeTexImage")
        texture.image = final
        links.new(texture.outputs["Color"], bsdf.inputs["Base Color"])
        mesh.uv_layers.remove(mesh.uv_layers["UVMap"])
        for image in (colour_image, ao_image):
            bpy.data.images.remove(image)

    def finish(self, actions, bake=None):
        body = self.body
        mesh = body.data
        # The skin taken out from under shells that hide it.
        for region, over in self.cuts:
            mask = self.masks(region)
            bm = bmesh.new()
            bm.from_mesh(mesh)
            bm.verts.ensure_lookup_table()
            gone = [f for f in bm.faces if min(mask[v.index] for v in f.verts) > over]
            bmesh.ops.delete(bm, geom=gone, context="FACES")
            bm.to_mesh(mesh)
            bm.free()
        # The head and what's on it gets more of the texture.
        W = self.W()
        head = W[:, NAMES.index("Head")] > 0.5
        mesh.attributes.new("part", "INT", "FACE").data.foreach_set("value", [1 if head[list(p.vertices)].mean() > 0.5 else 0 for p in mesh.polygons])
        for obj in self.shells:
            W = self.W(obj)
            h = W[:, NAMES.index("Head")] > 0.5
            obj.data.attributes.new("part", "INT", "FACE").data.foreach_set("value", [1 if h[list(p.vertices)].mean() > 0.5 else 2 for p in obj.data.polygons])
            for poly in obj.data.polygons:
                poly.use_smooth = True
        parts = self._hard_parts()
        bpy.ops.object.select_all(action="DESELECT")
        for obj in [body, *self.shells, parts]:
            obj.select_set(True)
        bpy.context.view_layer.objects.active = body
        bpy.ops.object.join()
        obj = body
        mesh = obj.data
        if "base" in mesh.attributes:
            mesh.attributes.remove(mesh.attributes["base"])
        while len(mesh.uv_layers):
            mesh.uv_layers.remove(mesh.uv_layers[0])
        mesh.materials.clear()
        colours = [a.value for a in mesh.attributes["colour"].data]
        palette = self.m.palette
        cells = [palette.index(c) for c in colours]
        mesh.attributes.new("cell", "INT", "FACE").data.foreach_set("value", cells)
        uv = mesh.uv_layers.new(name="UVMap")
        for poly, cell in zip(mesh.polygons, cells):
            u, v = palette.uv(cell)
            for loop in poly.loop_indices:
                uv.data[loop].uv = (u, v)
        mesh.materials.append(palette.material(self.name))
        mesh.polygons.foreach_set("material_index", [0] * len(mesh.polygons))
        mesh.update()
        log(f"one mesh: {len(mesh.vertices)} vertices")
        if bake is not None and not os.environ.get("WW_NO_BAKE"):
            self._bake(obj, **bake)
            log("baked")
        for name in ("colour", "part", "cell", "skin"):
            if name in mesh.attributes:
                mesh.attributes.remove(mesh.attributes[name])
        rig = self.m.rig({k: Vector(v) for k, v in self.joints.items()})
        obj.parent = rig
        for md in list(obj.modifiers):
            obj.modifiers.remove(md)
        obj.modifiers.new("Armature", "ARMATURE").object = rig
        ww.Animator(rig).key_all(actions)
        bpy.ops.object.select_all(action="DESELECT")
        for o in (obj, rig):
            o.select_set(True)
        bpy.context.view_layer.objects.active = rig
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
        os.makedirs(ww.MODELS, exist_ok=True)
        os.makedirs(ww.BUILD, exist_ok=True)
        bpy.ops.export_scene.gltf(
            filepath=os.path.join(ww.MODELS, f"{self.name}.glb"),
            export_format="GLB",
            export_animations=True,
            export_animation_mode="NLA_TRACKS",
            export_skins=True,
            export_yup=True,
            export_normals=True,
            export_texcoords=True,
            export_materials="EXPORT",
        )
        bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ww.BUILD, f"{self.name}.blend"), compress=True)
        top = max(v.co.z for v in mesh.vertices)
        print(f"{self.name}: {len(mesh.vertices)} vertices, {len(mesh.polygons)} faces, {len(palette.colours)} colours, {top:.2f} m tall")
        return obj, rig
