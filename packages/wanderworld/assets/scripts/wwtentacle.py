"""Helpers for the Wanderworld creatures that aren't built like people (make_grick.py, make_otyugh.py,
make_roper.py): a skeleton of the creature's own in place of the people's, tentacles as chains of bones
with a tapering skin along them, and actions keyed from functions of time so they loop cleanly, with
moves and scaling as well as turns.

A pose here is {bone: Quaternion} like wwblend's, but each turn is the bone's own, from its parent (in the
creature's rest space): `compose()` adds them up the chain into the whole turns wwblend's Animator keys.
A pose may also hold "_move" ({bone: (x, y, z)} in Blender's space, metres) and "_scale" ({bone: s}).
"""

import math

import bpy
from mathutils import Quaternion, Vector

import wwblend


class Creature(wwblend.Model):
    """wwblend's Model with two hooks for a rougher hide than smooth metaballs give: `shapes[group]`
    (co, normal) -> offset moves each vertex of that group's skin before it's thinned (folds, cracks,
    warts, strata), and `paint` (point, colour) -> colour repaints a face's colour by where it is
    (filth, sores, streaks)."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.shapes = {}
        self.paint = None

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


def cap(model, centre, r, thick, pointing, half, colour, bone):
    """A thick shell of a sphere round `centre`: the part within `half` degrees of `pointing` (an eyelid)."""
    import bmesh

    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=14, v_segments=10, radius=r)
    geom = bm.verts[:] + bm.edges[:] + bm.faces[:]
    bmesh.ops.bisect_plane(bm, geom=geom, dist=1e-5, plane_co=(0, 0, r * math.cos(math.radians(half))), plane_no=(0, 0, 1), clear_inner=True)
    # (A copy of the shell pulled in to make its inside, joined to the outside round the rim.)
    new = bmesh.ops.extrude_face_region(bm, geom=bm.faces[:], use_keep_orig=True)
    for v in (g for g in new["geom"] if isinstance(g, bmesh.types.BMVert)):
        v.co *= (r - thick) / r
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    rotation = Vector((0, 0, 1)).rotation_difference(Vector(pointing).normalized())
    bmesh.ops.rotate(bm, cent=(0, 0, 0), matrix=rotation.to_matrix(), verts=bm.verts)
    bmesh.ops.translate(bm, vec=Vector(centre), verts=bm.verts)
    model._add_bm(bm, colour, bone)


def glossy(model, roughness):
    """After `finish()`: a wet sheen (`roughness` below 1) on the model's one material, written again to the
    .glb and the .blend with the same settings as `finish()`."""
    import os

    mesh = model.armature.children[0]
    bsdf = mesh.data.materials[0].node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Roughness"].default_value = roughness
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


def skeleton(model, bones, joints, still=("Root",)):
    """Builds `model`'s armature from the creature's own `bones` ([(name, parent)], parents first) and
    `joints` (each bone's head, and `<bone>.tail` where its tail isn't its first child's head). The bones
    in `still` hold no skin (a root on the ground, moved only to move the whole creature)."""
    # ponytail: wwblend's Model.rig() and Model.finish() read the people's skeleton from its module-level
    # BONES and key actions with its Animator; this swaps in the creature's own for this Blender run (each
    # run is a process of its own). Ceiling: one skeleton per run. Upgrade path: a `bones` argument on
    # Model.rig() and an `animator` one on Model.finish() in wwblend.py.
    wwblend.BONES = list(bones)
    wwblend.Animator = Animator
    rig = model.rig(joints)
    for name in still:
        rig.data.bones[name].use_deform = False
    return rig


def turn(axis, degrees):
    """A turn about `axis` (a vector in Blender's space) by `degrees`."""
    return Quaternion(Vector(axis).normalized(), math.radians(degrees))


def compose(own):
    """The whole turn of every bone from each bone's own turn ({bone: Quaternion}, from its parent)."""
    world = {}
    for name, parent in wwblend.BONES:
        base = world[parent] if parent else Quaternion()
        world[name] = base @ own.get(name, Quaternion())
    return world


def add(own, name, q):
    """Adds the turn `q` to `name`'s own turn in `own` (after what's there)."""
    own[name] = own.get(name, Quaternion()) @ q


def directions(joints, names):
    """Which way each bone of the chain `names` points at rest (its head to the next one's, or its tail)."""
    return {
        name: (joints[after] if after else joints[f"{name}.tail"]) - joints[name]
        for name, after in zip(names, list(names[1:]) + [None])
    }


def aim(own, names, rest, target, f):
    """Turns the chain `names` (`rest`: from `directions()`) so it lies straight along `target`, by f (0:
    as it rests, 1: all the way; or a list, one for each bone, so the tip can lag): the first bone turns to
    the target and each after it to the one before."""
    way = Vector(target).normalized()
    for i, name in enumerate(names):
        k = f[i] if isinstance(f, (list, tuple)) else f
        add(own, name, Quaternion().slerp(rest[name].normalized().rotation_difference(way), k))
        way = rest[name].normalized()


def curve(controls, n):
    """n + 1 points along the Bézier curve through `controls` (its ends) and pulled towards the rest."""
    controls = [Vector(c) for c in controls]
    out = []
    for i in range(n + 1):
        u = i / n
        pts = list(controls)
        while len(pts) > 1:
            pts = [a.lerp(b, u) for a, b in zip(pts, pts[1:])]
        out.append(pts[0])
    return out


def chain(bones, joints, prefix, controls, parent, count=5):
    """`count` bones, `<prefix>_01` onwards, along the curve `controls` from `parent`; returns their
    names. (Equal lengths along the curve: the curve is sampled finely and cut by length.)"""
    points = even(curve(controls, 64), count)
    names = []
    for i in range(count):
        name = f"{prefix}_{i + 1:02d}"
        bones.append((name, names[-1] if names else parent))
        joints[name] = points[i]
        names.append(name)
    joints[f"{names[-1]}.tail"] = points[-1]
    return names


def even(points, n):
    """n + 1 points along a polyline, evenly spaced by length."""
    lengths = [0.0]
    for a, b in zip(points, points[1:]):
        lengths.append(lengths[-1] + (b - a).length)
    total = lengths[-1]
    out, j = [], 0
    for i in range(n + 1):
        d = total * i / n
        while j < len(points) - 2 and lengths[j + 1] < d:
            j += 1
        span = lengths[j + 1] - lengths[j]
        u = 0.0 if span == 0 else (d - lengths[j]) / span
        out.append(points[j].lerp(points[j + 1], min(1.0, u)))
    return out


def tube(model, controls, r0, r1, colour, pieces=14, colour_tip=None, power=1.0):
    """A skin along the curve `controls`, tapering from r0 to r1 (capsules joined smoothly, metaballs of
    the body, so bone heat skins it along its chain); `colour_tip` takes over the last third."""
    points = even(curve(controls, 64), pieces)
    for i in range(pieces):
        u = (i + 0.5) / pieces
        r = r0 + (r1 - r0) * u**power
        c = colour if colour_tip is None or u < 0.66 else colour_tip
        model.capsule(points[i], points[i + 1], r, c)
    return points


def loop(frames, step, pose_at):
    """Keys for a looping action `frames` long: pose_at(u) for u from 0 to 1 every `step` frames, the
    last the same as the first."""
    return [(1 + f, pose_at((f % frames) / frames)) for f in range(0, frames + 1, step)]


def wave(u, cycles=1.0, phase=0.0):
    """A sine wave over a loop (u: 0-1), `cycles` times round, shifted by `phase` (in turns)."""
    return math.sin(2 * math.pi * (u * cycles + phase))


def ease(x):
    """0 to 1, smoothly (x clamped to 0-1)."""
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


class Animator(wwblend.Animator):
    """wwblend's Animator for a pose of own turns (see `compose()`), with moves and scaling. Keys are
    linear: actions are keyed densely from functions of time, so they loop without easing at the seam.
    Every bone moved or scaled in any action is keyed in all of them, so one action never leaves another's
    move or scale behind."""

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
                own = {k: v for k, v in pose.items() if not k.startswith("_")}
                for bone, q in self.turns(compose(own)).items():
                    # (The nearer of q and -q to the last key, so a linear key never turns the long way.)
                    if bone in last and last[bone].dot(q) < 0:
                        q = -q
                    last[bone] = q
                    pb = rig.pose.bones[bone]
                    pb.rotation_mode = "QUATERNION"
                    pb.rotation_quaternion = q
                    pb.keyframe_insert("rotation_quaternion", frame=frame, group=bone)
                for bone in moved:
                    pb = rig.pose.bones[bone]
                    pb.location = self.rest[bone].inverted() @ Vector(pose.get("_move", {}).get(bone, (0, 0, 0)))
                    pb.keyframe_insert("location", frame=frame, group=bone)
                for bone in scaled:
                    pb = rig.pose.bones[bone]
                    s = pose.get("_scale", {}).get(bone, 1.0)
                    pb.scale = (s, s, s)
                    pb.keyframe_insert("scale", frame=frame, group=bone)
            track = rig.animation_data.nla_tracks.new()
            track.name = name
            track.strips.new(name, int(frames[0][0]), action)
            rig.animation_data.action = None
        for pb in rig.pose.bones:
            pb.rotation_quaternion = Quaternion()
            pb.location = (0, 0, 0)
            pb.scale = (1, 1, 1)
