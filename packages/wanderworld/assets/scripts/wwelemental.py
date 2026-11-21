"""Helpers for Wanderworld's four elementals (make_earth_elemental.py, make_fire_elemental.py,
make_water_elemental.py, make_air_elemental.py): built on wwblend's Model, metaballs, hard parts and bake,
with what those creatures need that smooth metaballs don't give.

- `Elemental.shapes[group]` (co, normal) -> offset moves each vertex of a group's skin before it's thinned
  (cracks, ripples, spiral grooves); `Elemental.paint` (point, colour) -> colour repaints a face by where it
  is (soil in the cracks, foam, streaks of dust).
- `chunk()`: a faceted boulder, the convex hull of points scattered in an ellipsoid; `tongue()`: a flat,
  wavy, tapering tongue of flame or water along a curve; `band()`: a thin twisting ribbon (a band of wind).
- `Elemental.reshape[group]` (mesh) reshapes a group's whole skin at once (plates of rock); `Elemental.sharp`
  (degrees) shades the edges sharper than that hard.
- `Elemental.rig_own()`: a skeleton of the creature's own, `(name, parent, head, tail)` in Blender's space,
  parents first; actions then key with this module's `Animator`, whose poses are each bone's own turn
  from its parent (in the creature's rest space), with "_move" ({bone: (x, y, z)}, Blender's space,
  metres) and "_scale" ({bone: s or (sx, sy, sz)}, along the bone's own axes).
- `Elemental.weigh` (co) -> {bone: weight} weighs the metaball skin, and `part(..., weights=fn)` one hard
  part, in place of bone heat or one bone (flames and water that bend along chains of bones):
  `nearest()` gives weights by distance to a few bones.
"""

import math
import os
import random

import bmesh
import bpy
from mathutils import Quaternion, Vector

import wwblend


class Elemental(wwblend.Model):
    def __init__(self, name, resolution=0.02, faces=6000):
        super().__init__(name, resolution, faces)
        self.shapes = {}
        self.paint = None
        self.weigh = None
        self.part_weights = {}
        self.own = False
        self.reshape = {}  # group: fn(mesh), after `shapes`, for what needs the whole skin at once
        self.sharp = None  # degrees: edges sharper than this shade hard (plates of rock)

    # ── The skin ──

    def _meta_mesh(self, group):
        settings = self.groups[group]
        faces = settings["faces"]
        settings["faces"] = 10**9  # (thinned below, after the skin is shaped)
        body = super()._meta_mesh(group)
        settings["faces"] = faces
        mesh = body.data
        shape = self.shapes.get(group)
        if shape is not None:
            for v in mesh.vertices:
                v.co += shape(v.co.copy(), v.normal.copy())
            mesh.update()
        if group in self.reshape:
            self.reshape[group](mesh)
            mesh.update()
        if len(mesh.polygons) > faces:
            decimate = body.modifiers.new("Decimate", "DECIMATE")
            decimate.ratio = faces / len(mesh.polygons)
            depsgraph = bpy.context.evaluated_depsgraph_get()
            reduced = bpy.data.meshes.new_from_object(body.evaluated_get(depsgraph))
            body.modifiers.clear()
            body.data = reduced
            bpy.data.meshes.remove(mesh)
        return body

    def _face_colour(self, p, group):
        colour = super()._face_colour(p, group)
        return colour if self.paint is None else self.paint(p, colour)

    # ── Hard parts with weights of their own ──

    def part(self, bm, colour, bone, smooth=True, weights=None):
        """A hard part from a bmesh (freed here), all on `bone`, or weighed vertex by vertex by `weights`
        (co) -> {bone: weight}."""
        self._add_bm(bm, colour, bone, smooth)
        if weights is not None:
            self.part_weights[len(self.parts) - 1] = weights

    # ── A skeleton of its own ──

    def rig_own(self, bones):
        self.own = True
        self.bone_list = [(name, parent) for name, parent, _h, _t in bones]
        self.joints = {name: Vector(head) for name, _p, head, _t in bones}
        self.tails = {name: Vector(tail) for name, _p, _h, tail in bones}
        armature = bpy.data.armatures.new(f"{self.name}-rig")
        rig = bpy.data.objects.new(f"{self.name}-rig", armature)
        bpy.context.scene.collection.objects.link(rig)
        bpy.context.view_layer.objects.active = rig
        bpy.ops.object.mode_set(mode="EDIT")
        for name, parent, head, tail in bones:
            bone = armature.edit_bones.new(name)
            bone.head, bone.tail = Vector(head), Vector(tail)
            if parent:
                bone.parent = armature.edit_bones[parent]
            direction = (bone.tail - bone.head).normalized()
            bone.align_roll(Vector((0, 0, 1)) if abs(direction.z) < 0.5 else Vector((0, -1, 0)))
        bpy.ops.object.mode_set(mode="OBJECT")
        self.armature = rig
        # (Every metaball group on one bone, so bone heat is skipped; `weigh` weighs the skin after.)
        for settings in self.groups.values():
            if settings["bone"] is None:
                settings["bone"] = bones[0][0]
        return rig

    def nearest(self, co, names, power=3.0, top=3, soft=0.03):
        """Weights for the point `co` from the bones `names`, by how near it is to each bone's length."""
        found = []
        for name in names:
            d = wwblend._segment_distance(Vector(co), self.joints[name], self.tails[name])
            found.append((1.0 / (d + soft) ** power, name))
        found.sort(reverse=True)
        found = found[:top]
        total = sum(w for w, _n in found)
        return {n: w / total for w, n in found}

    def along(self, co, names):
        """Weights along a chain `names` for a point on a part that follows it: the bone whose length
        it is nearest, blended with the next one over the last fifth of each bone."""
        co = Vector(co)
        best, at_bone, u_best = None, 0, 0.0
        for i, name in enumerate(names):
            a, b = self.joints[name], self.tails[name]
            ab = b - a
            u = max(0.0, min(1.0, (co - a).dot(ab) / max(1e-9, ab.length_squared)))
            d = (co - (a + ab * u)).length
            if best is None or d < best:
                best, at_bone, u_best = d, i, u
        if u_best > 0.8 and at_bone + 1 < len(names):
            k = (u_best - 0.8) / 0.4
            return {names[at_bone]: 1 - k, names[at_bone + 1]: k}
        if u_best < 0.2 and at_bone > 0:
            k = (0.2 - u_best) / 0.4
            return {names[at_bone]: 1 - k, names[at_bone - 1]: k}
        return {names[at_bone]: 1.0}

    # ── Putting it together ──

    def finish(self, actions, bake=None):
        # ponytail: wwblend.Model.finish keys actions with wwblend.Animator (the people's skeleton) and
        # weighs by bone heat or one bone; this swaps in this module's Animator for the call and weighs
        # again after, writing the .glb a second time. Ceiling: two exports. Upgrade path: `animator` and
        # `weights` arguments on Model.finish().
        saved = wwblend.Animator
        if self.own:
            wwblend.Animator = Animator
        try:
            super().finish(actions, bake)
        finally:
            wwblend.Animator = saved
        if self.weigh is not None or self.part_weights:
            self._reweigh()
        if self.sharp is not None:
            mesh = next(o for o in self.armature.children if o.type == "MESH").data
            mesh.set_sharp_from_angle(angle=math.radians(self.sharp))
        if self.weigh is not None or self.part_weights or self.sharp is not None:
            export(self)

    def _reweigh(self):
        obj = next(o for o in self.armature.children if o.type == "MESH")
        part_sizes = [len(p[0]) for p in self.parts]
        meta = len(obj.data.vertices) - sum(part_sizes)
        owner = [None] * meta
        for i, n in enumerate(part_sizes):
            owner += [i] * n
        assert len(owner) == len(obj.data.vertices), "vertices moved: can't weigh the parts"
        groups = {g.name: g for g in obj.vertex_groups}
        for v in obj.data.vertices:
            i = owner[v.index]
            fn = self.weigh if i is None else self.part_weights.get(i)
            if fn is None:
                continue
            here = fn(v.co.copy())
            for g in v.groups[:]:
                obj.vertex_groups[g.group].remove([v.index])
            for bone, w in here.items():
                if w > 0.001:
                    groups[bone].add([v.index], w, "REPLACE")


def export(model):
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(
        filepath=os.path.join(wwblend.MODELS, f"{model.name}.glb"),
        export_format="GLB",
        export_animations=True,
        export_animation_mode="NLA_TRACKS",
        export_skins=True,
        export_yup=True,
        export_normals=True,
        export_texcoords=True,
        export_materials="EXPORT",
    )
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(wwblend.BUILD, f"{model.name}.blend"), compress=True)


# ── Shapes ──


def chunk(m, centre, radii, bone, colour, rng, points=18, turn=None, flat=0.12, weights=None, boxy=False):
    """A faceted boulder: the hull of `points` scattered over an ellipsoid (`radii` in Blender's axes), or
    with `boxy` a block with its corners and edges broken off at random (a slab of rock), turned by `turn`
    (a Quaternion) and set at `centre`; near-flat neighbouring facets merged into larger planes (`flat`,
    radians). `colour` is a hex, or (centre, normal) -> hex for each facet."""
    bm = bmesh.new()
    r = Vector(radii)
    if boxy:
        for sx in (-1, 1):
            for sy in (-1, 1):
                for sz in (-1, 1):
                    corner = Vector((sx * r.x, sy * r.y, sz * r.z))
                    cut = rng.uniform(0.12, 0.55)
                    for axis in range(3):
                        q = corner.copy()
                        q[axis] *= 1 - cut * rng.uniform(0.4, 1.3)
                        q += Vector((rng.uniform(-0.17, 0.17) * r.x, rng.uniform(-0.17, 0.17) * r.y, rng.uniform(-0.17, 0.17) * r.z))
                        bm.verts.new(q)
        # (More points just inside the block's faces, so its big planes break into rugged facets.)
        for _ in range(points if points > 8 else 0):
            d = Vector((rng.uniform(-1, 1), rng.uniform(-1, 1), rng.uniform(-1, 1)))
            k = max(abs(d.x), abs(d.y), abs(d.z))
            d = d / k * rng.uniform(0.86, 0.99)
            bm.verts.new(Vector((d.x * r.x, d.y * r.y, d.z * r.z)))
        # (Sheared and tapered at random, so no two blocks are square.)
        shear = [[1 if i == j else rng.uniform(-0.3, 0.3) for j in range(3)] for i in range(3)]
        taper = rng.uniform(-0.35, 0.35)
        for v in bm.verts:
            c = v.co.copy()
            c = Vector([sum(shear[i][j] * c[j] for j in range(3)) for i in range(3)])
            k = 1 - taper * c.z / r.z
            v.co = Vector((c.x * k, c.y * k, c.z))
    else:
        for _ in range(points):
            d = Vector((rng.gauss(0, 1), rng.gauss(0, 1), rng.gauss(0, 1))).normalized()
            k = rng.uniform(0.72, 1.0)
            bm.verts.new(Vector((d.x * r.x, d.y * r.y, d.z * r.z)) * k)
    hull = bmesh.ops.convex_hull(bm, input=bm.verts[:])
    loose = {g for g in hull["geom_interior"] + hull["geom_unused"] if isinstance(g, bmesh.types.BMVert)}
    bmesh.ops.delete(bm, geom=list(loose), context="VERTS")
    bmesh.ops.dissolve_limit(bm, angle_limit=flat, verts=bm.verts[:], edges=bm.edges[:])
    if turn is not None:
        bmesh.ops.rotate(bm, cent=(0, 0, 0), matrix=turn.to_matrix(), verts=bm.verts)
    bmesh.ops.translate(bm, vec=Vector(centre), verts=bm.verts)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    if callable(colour):
        bm.normal_update()
        colours = [colour(f.calc_center_median(), f.normal.copy()) for f in bm.faces]
    else:
        colours = colour
    m.part(bm, colours, bone, smooth=False, weights=weights)


def frame_along(points):
    """Tangents and a normal carried along a polyline without twisting."""
    n = len(points)
    tangents = [(points[min(i + 1, n - 1)] - points[max(i - 1, 0)]).normalized() for i in range(n)]
    normal = tangents[0].orthogonal().normalized()
    normals = []
    for t in tangents:
        normal = (normal - t * normal.dot(t)).normalized()
        normals.append(normal)
    return tangents, normals


def smooth_path(controls, n):
    """n + 1 points along a Catmull-Rom curve through `controls`."""
    pts = [Vector(c) for c in controls]
    pts = [pts[0] * 2 - pts[1]] + pts + [pts[-1] * 2 - pts[-2]]
    out = []
    segs = len(pts) - 3
    for k in range(n + 1):
        s = k / n * segs
        i = min(int(s), segs - 1)
        u = s - i
        p0, p1, p2, p3 = pts[i], pts[i + 1], pts[i + 2], pts[i + 3]
        out.append(0.5 * (2 * p1 + (p2 - p0) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (3 * p1 - p0 - 3 * p2 + p3) * u**3))
    return out


def tongue(m, controls, width, thick, facing, colours, bone, steps=10, sides=6, profile=None, wobble=0.0, rng=None, weights=None, smooth=True):
    """A flat tongue (of flame, of water) along the curve through `controls`: `width` across at most and
    `thick` deep, its broad side facing `facing` (a vector, or a function of the point along it), drawn to
    a point at its end. `profile` (u) -> share of the width (default: swelling from the root, widest a
    third along, tapering to the tip); `wobble` ripples its edges. `colours`: [(u, hex)], each from u on."""
    pts = smooth_path(controls, steps)
    tangents, _normals = frame_along(pts)
    rng = rng or random.Random(1)
    phase = rng.uniform(0, 6.28)
    if profile is None:

        def profile(u):
            return (0.55 + 0.45 * math.sin(min(1.0, u / 0.33) * math.pi / 2)) * (1 - u) ** 0.85

    bm = bmesh.new()
    rings = []
    for i, (p, t) in enumerate(zip(pts[:-1], tangents[:-1])):
        u = i / steps
        f = facing(p) if callable(facing) else Vector(facing)
        nrm = (f - t * f.dot(t)).normalized()
        side = nrm.cross(t)
        w = width / 2 * profile(u) * (1 + wobble * math.sin(phase + u * 9))
        d = thick / 2 * profile(u) ** 0.7
        ring = []
        for k in range(sides):
            a = 2 * math.pi * k / sides
            # (A lens: sharp at its two edges, rounded front and back.)
            ring.append(bm.verts.new(p + side * math.cos(a) * w + nrm * math.sin(a) * d * (1 - 0.3 * abs(math.cos(a)))))
        rings.append(ring)
    tip = bm.verts.new(pts[-1])
    face_colours = []

    def colour_at(u):
        c = colours[0][1]
        for u0, hex_ in colours:
            if u >= u0:
                c = hex_
        return c

    bm.faces.new(list(reversed(rings[0])))
    face_colours.append(colour_at(0))
    for i, (a, b) in enumerate(zip(rings, rings[1:])):
        for k in range(sides):
            bm.faces.new((a[k], a[(k + 1) % sides], b[(k + 1) % sides], b[k]))
            face_colours.append(colour_at((i + 0.5) / steps))
    for k in range(sides):
        bm.faces.new((rings[-1][k], rings[-1][(k + 1) % sides], tip))
        face_colours.append(colour_at(1.0))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    m.part(bm, face_colours, bone, smooth=smooth, weights=weights)
    return pts


def band(m, path, width, thick, axis_at, colours, bone, weights=None, taper=True):
    """A thin ribbon along `path` (points), standing `width` tall along `axis_at(p)` (the way across it at
    each point), `thick` deep; tapered to nothing over its first and last fifth or so. `colours`: (u) -> hex for each piece."""
    bm = bmesh.new()
    n = len(path)
    tangents, _ = frame_along(path)
    rings = []
    for i, (p, t) in enumerate(zip(path, tangents)):
        u = i / (n - 1)
        up = Vector(axis_at(p))
        up = (up - t * up.dot(t)).normalized()
        out = t.cross(up)
        k = min(1.0, u / 0.18, (1 - u) / 0.18) ** 0.7 if taper else 1.0
        w, d = width / 2 * max(0.05, k), thick / 2 * max(0.2, k)
        rings.append([bm.verts.new(p + up * w), bm.verts.new(p + out * d), bm.verts.new(p - up * w), bm.verts.new(p - out * d)])
    cols = []
    for i, (a, b) in enumerate(zip(rings, rings[1:])):
        for k in range(4):
            bm.faces.new((a[k], a[(k + 1) % 4], b[(k + 1) % 4], b[k]))
            cols.append(colours((i + 0.5) / (n - 1)))
    bm.faces.new(list(reversed(rings[0])))
    cols.append(colours(0.0))
    bm.faces.new(rings[-1])
    cols.append(colours(1.0))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    m.part(bm, cols, bone, smooth=True, weights=weights)


# ── Actions ──


def turn(axis, degrees):
    """A turn about `axis` (a vector in Blender's space) by `degrees`."""
    return Quaternion(Vector(axis).normalized(), math.radians(degrees))


def add(own, name, q):
    own[name] = own.get(name, Quaternion()) @ q


def loop(frames, step, pose_at):
    """Keys for a looping action `frames` long: pose_at(u) for u from 0 to 1 every `step` frames, the last
    the same as the first."""
    return [(1 + f, pose_at((f % frames) / frames)) for f in range(0, frames + 1, step)]


def wave(u, cycles=1.0, phase=0.0):
    return math.sin(2 * math.pi * (u * cycles + phase))


def ease(x):
    x = max(0.0, min(1.0, x))
    return x * x * (3 - 2 * x)


def keys(points, x):
    """The value at x along [(x, value)], eased between keys (an attack's timing)."""
    if x <= points[0][0]:
        return points[0][1]
    for (x0, v0), (x1, v1) in zip(points, points[1:]):
        if x <= x1:
            return v0 + (v1 - v0) * ease((x - x0) / (x1 - x0))
    return points[-1][1]


class Animator:
    """Keys actions on a skeleton of the creature's own from poses of each bone's own turn (see the
    module's notes), linear keys every few frames, every bone moved or scaled in any action keyed in all."""

    def __init__(self, rig):
        self.rig = rig
        self.bones = [(b.name, b.parent.name if b.parent else None) for b in rig.data.bones]
        self.rest = {b.name: b.matrix_local.to_quaternion() for b in rig.data.bones}

    def key_all(self, actions):
        rig = self.rig
        rig.animation_data_create()
        bpy.context.preferences.edit.keyframe_new_interpolation_type = "LINEAR"
        moved = sorted({b for frames in actions.values() for _f, p in frames for b in p.get("_move", {})})
        scaled = sorted({b for frames in actions.values() for _f, p in frames for b in p.get("_scale", {})})
        for name, frames in actions.items():
            action = bpy.data.actions.new(name)
            rig.animation_data.action = action
            last = {}
            for frame, pose in frames:
                world = {}
                for bone, parent in self.bones:
                    above = world[parent] if parent else Quaternion()
                    own = pose.get(bone, Quaternion())
                    world[bone] = above @ own
                    rest = self.rest[bone]
                    q = rest.inverted() @ own @ rest
                    if bone in last and last[bone].dot(q) < 0:
                        q = -q
                    last[bone] = q
                    pb = rig.pose.bones[bone]
                    pb.rotation_mode = "QUATERNION"
                    pb.rotation_quaternion = q
                    pb.keyframe_insert("rotation_quaternion", frame=frame, group=bone)
                    if bone in moved:
                        d = Vector(pose.get("_move", {}).get(bone, (0, 0, 0)))
                        pb.location = (above @ rest).inverted() @ d
                        pb.keyframe_insert("location", frame=frame, group=bone)
                    if bone in scaled:
                        s = pose.get("_scale", {}).get(bone, 1.0)
                        pb.scale = (s, s, s) if isinstance(s, (int, float)) else s
                        pb.keyframe_insert("scale", frame=frame, group=bone)
            track = rig.animation_data.nla_tracks.new()
            track.name = name
            track.strips.new(name, int(frames[0][0]), action)
            rig.animation_data.action = None
        for pb in rig.pose.bones:
            pb.rotation_quaternion = Quaternion()
            pb.location = (0, 0, 0)
            pb.scale = (1, 1, 1)
