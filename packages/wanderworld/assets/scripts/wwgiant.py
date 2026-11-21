"""Shared helpers for the true giants (make_hill_giant.py, make_stone_giant.py, make_frost_giant.py and
make_fire_giant.py), on top of wwblend.py.

A giant is a person grown huge, so its body starts from the player's base avatar (assets/models/
avatar-male.glb, made by make_avatar.py): a well-built human mesh already weighted to the people's
skeleton. `Giant` loads it, mixes its body shape keys, raises its arms into the people's T-pose, and then
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
from types import SimpleNamespace

import bmesh
import bpy
import numpy as np
from mathutils import Matrix, Quaternion, Vector, noise
from mathutils.bvhtree import BVHTree

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import wwavatar as wa  # noqa: E402
import wwblend as ww  # noqa: E402
from wwblend import BONES, at, turn  # noqa: E402

AVATAR = os.path.join(ww.MODELS, "avatar-male.glb")
NAMES = [name for name, _ in BONES]
PARENT = dict(BONES)
log = ww._log
# The avatar's materials, in its order: what each becomes on a giant (see `Giant.colours`).
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
    return wa.smooth(lo, hi, x)


def gauss(P, c, radii):
    return wa.gauss(P, c, radii)


def G(x, up, fwd):
    """A point given as the game's code gives it (x to the left, up, forward), as a numpy array."""
    return np.array(at(x, up, fwd), dtype=np.float64)


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
        for key in blocks[1:]:
            key.value = keys.get(key.name, 0.0)
        bpy.ops.object.select_all(action="DESELECT")
        body.select_set(True)
        bpy.context.view_layer.objects.active = body
        bpy.ops.object.shape_key_remove(all=True, apply_mix=True)
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
        mod = next(md for md in body.modifiers if md.type == "ARMATURE")
        bpy.ops.object.modifier_apply(modifier=mod.name)
        body.parent = None
        body.matrix_world = body.matrix_world.copy()
        mesh = body.data
        mesh.transform(body.matrix_world)
        body.matrix_world = Matrix()
        bpy.data.objects.remove(rig)
        # The glTF's split seams joined up again.
        bm = bmesh.new()
        bm.from_mesh(mesh)
        bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
        bm.to_mesh(mesh)
        bm.free()
        if mesh.has_custom_normals:
            bpy.ops.mesh.customdata_custom_splitnormals_clear()
        mesh.update()
        self.body = body
        self.shells = []  # (object) skinned pieces cut from the skin
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
        w = wa.weights_of(obj)
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

    def curl_hand(self, side, angles=(80, 95, 55), thumb=(30, 40)):
        """Closes a hand into a fist: each finger bent at its three knuckles by `angles` (degrees) towards
        the palm, and the thumb across it."""
        sign = 1 if side == "l" else -1
        P = self.P()
        wrist = np.array(self.joints[f"hand_{side}"])
        tip = np.array(self.joints[f"hand_{side}.tail"])
        W = self.W()
        hand = W[:, NAMES.index(f"hand_{side}")] > 0.5
        out = sign * (P[:, 0] - wrist[0])  # how far past the wrist, along the arm
        length = out[hand].max()
        top = P[hand, 2].max()
        bottom = P[hand, 2].min()
        # The thumb: forward of the palm (towards -y) and nearer the wrist; the fingers are the rest.
        front = P[hand, 1].min()
        thumb_mask = hand & (P[:, 1] < front + 0.38 * (P[hand, 1].max() - front)) & (out < 0.62 * length) & (out > 0.25 * length)
        fingers = hand & ~thumb_mask
        mid_z = bottom + 0.3 * (top - bottom)
        Q = P.copy()
        for frac, angle in reversed(list(zip((0.5, 0.71, 0.86), angles))):
            pivot = np.array((wrist[0] + sign * frac * length, 0.0, mid_z))
            t = smooth(-0.015, 0.015, out - frac * length) * fingers
            a = np.radians(angle) * t
            # Towards the palm (down, -z): about the front-back axis, the fingertips going down and in.
            ca, sa = np.cos(a), np.sin(a)
            dx, dz = Q[:, 0] - pivot[0], Q[:, 2] - pivot[2]
            Q[:, 0] = pivot[0] + dx * ca + sign * dz * sa
            Q[:, 2] = pivot[2] + dz * ca - sign * dx * sa
        self.set_P(Q)
        return thumb_mask

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
            moved = np.array(J1[name]) + (P - np.array(h0)) @ A.T
            out += w[:, None] * moved
        total = W.sum(axis=1, keepdims=True)
        total[total == 0] = 1
        out /= total
        low = out[:, 2].min()
        out[:, 2] -= low
        for k in J1:
            J1[k] = Vector(J1[k]) - Vector((0, 0, low))
        self.set_P(out)
        self.joints = J1
        self.S = S
        log(f"proportioned: {out[:, 2].max():.2f} m")

    def reduce(self, vertices):
        """Fewer faces, down to about `vertices` (the skin weights carried over)."""
        n = len(self.body.data.vertices)
        if n <= vertices:
            return
        mod = self.body.modifiers.new("Decimate", "DECIMATE")
        mod.ratio = vertices / n
        mod.use_collapse_triangulate = False
        wa._apply(self.body)
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
        for v in bm.verts:
            amount = lift
            if bumps:
                q = Vector(v[base]) / bumps[1]
                amount += bumps[0] * (0.5 + 0.5 * noise.noise(q) + 0.35 * noise.noise(q * 2.7))
            v.co += normals[v] * amount
        for _ in range(smooth_rounds):
            bmesh.ops.smooth_vert(bm, verts=[v for v in bm.verts if not v.is_boundary], factor=0.5, use_axis_x=True, use_axis_y=True, use_axis_z=True)
        layer = bm.faces.layers.int.new("colour")
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
            low = [e for e in bm.edges if e.is_boundary and e.link_faces[0].calc_center_median().z > (e.verts[0].co.z + e.verts[1].co.z) / 2]
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
        obj = bpy.data.objects.new(mesh.name, mesh)
        bpy.context.scene.collection.objects.link(obj)
        for g in body.vertex_groups:
            obj.vertex_groups.new(name=g.name)
        self.shells.append(obj)
        if cut is not None:
            self.cuts.append((region, cut))
        return obj
