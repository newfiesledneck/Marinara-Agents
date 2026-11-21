"""Helpers for Wanderworld beasts on skeletons of their own (make_basilisk.py, make_gelatinous_cube.py): a
Creature from wwcreature (its own bones, poses as whole turns and "@bone" moves, legs reaching for their feet)
with wwtentacle's hooks for a rougher skin (`shapes`, `paint`), and a few more:

- `solids[group]`: a function giving (verts, faces) to skin that group with instead of metaballs (a rounded
  block of jelly); it still takes the group's colours, shapes, thinning and bone heat.
- `detail`: colours whose faces get twice the texture's share, as a head does (small things looked at).
- `weigh(colours, fn)`: after bone heat, the vertices of those colours take the weights fn(point) gives.
- `split[suffix] = colours`: those faces go into a mesh of their own, `<name>-<suffix>`, on the same rig and
  the same material, for the game to draw differently (inside a translucent body, glowing eyes).
- Poses may also scale a bone, `"%bone": (x, y, z)` along its own axes (y runs along the bone), and
  `place()` works out where every bone's head is in a pose, so a leg can reach from where its hip went.
"""

import math
import os

import bmesh
import bpy
from mathutils import Quaternion, Vector

import wwblend
import wwcreature
import wwtentacle


class Beast(wwcreature.Creature, wwtentacle.Creature):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.solids = {}
        self.detail = set()
        self.weights = []  # (colours, fn)
        self.split = {}

    def weigh(self, colours, fn):
        self.weights.append((set(colours), fn))

    # ── Skins ──

    def _meta_mesh(self, group):
        build = self.solids.get(group)
        if build is None:
            return super()._meta_mesh(group)
        verts, faces = build()
        mesh = bpy.data.meshes.new(f"{self.name}-{group}")
        mesh.from_pydata([tuple(v) for v in verts], [], faces)
        mesh.validate()
        mesh.update()
        body = bpy.data.objects.new(f"{self.name}-{group}-skin", mesh)
        bpy.context.scene.collection.objects.link(body)
        shape = self.shapes.get(group)
        if shape is not None:
            for v in mesh.vertices:
                v.co += shape(v.co.copy(), v.normal.copy())
            mesh.update()
        faces_max = self.groups[group]["faces"]
        if len(mesh.polygons) > faces_max:
            decimate = body.modifiers.new("Decimate", "DECIMATE")
            decimate.ratio = faces_max / len(mesh.polygons)
            reduced = bpy.data.meshes.new_from_object(body.evaluated_get(bpy.context.evaluated_depsgraph_get()))
            body.modifiers.clear()
            body.data = reduced
            bpy.data.meshes.remove(mesh)
        return body

    def _bake(self, obj, **kwargs):
        if self.detail:
            cells = {self.palette.index(c) for c in self.detail if c in self.palette.colours}
            mesh = obj.data
            part = mesh.attributes["part"].data
            for poly, cell in zip(mesh.polygons, mesh.attributes["cell"].data):
                if cell.value in cells:
                    part[poly.index].value = 1
        super()._bake(obj, **kwargs)

    # ── Putting it together ──

    def finish(self, actions, bake=None):
        # (Model.finish, past wwcreature's, with BeastAnimator keying: it adds scaling to CreatureAnimator.)
        saved = wwblend.Animator
        wwblend.Animator = BeastAnimator
        try:
            wwblend.Model.finish(self, actions, bake)
        finally:
            wwblend.Animator = saved
        if not (self.weights or self.split):
            return
        rig = self.armature
        obj = next(o for o in rig.children if o.type == "MESH")
        mesh = obj.data
        cell_of = [c.value for c in mesh.attributes["cell"].data]
        colour_of = [self.palette.colours[c] for c in cell_of]
        for colours, fn in self.weights:
            chosen = {v for poly in mesh.polygons if colour_of[poly.index] in colours for v in poly.vertices}
            for i in chosen:
                for g in obj.vertex_groups:
                    g.remove([i])
                for bone, w in fn(mesh.vertices[i].co.copy()).items():
                    if w > 0.001:
                        obj.vertex_groups[bone].add([i], w, "REPLACE")
        for suffix, colours in self.split.items():
            bpy.ops.object.select_all(action="DESELECT")
            obj.select_set(True)
            bpy.context.view_layer.objects.active = obj
            bpy.ops.object.mode_set(mode="EDIT")
            bm = bmesh.from_edit_mesh(mesh)
            cell = bm.faces.layers.int.get("cell")
            wanted = {self.palette.index(c) for c in colours if c in self.palette.colours}
            for v in bm.verts:
                v.select = False
            for e in bm.edges:
                e.select = False
            for f in bm.faces:
                f.select = f[cell] in wanted
            bm.select_flush_mode()
            bmesh.update_edit_mesh(mesh)
            bpy.ops.mesh.separate(type="SELECTED")
            bpy.ops.object.mode_set(mode="OBJECT")
            part = next(o for o in rig.children if o.type == "MESH" and o is not obj and not o.name.startswith(f"{self.name}-"))
            part.name = part.data.name = f"{self.name}-{suffix}"
        export(self)
        print(f"{self.name}: meshes " + ", ".join(f"{o.name} {len(o.data.vertices)}" for o in rig.children if o.type == "MESH"))

    # ── Poses ──

    def place(self, pose):
        """Where each bone's head is in `pose` (whole turns and "@bone" moves; Blender's space)."""
        world, heads = {}, {}
        for name, parent in self.bones:
            world[name] = pose.get(name, world[parent] if parent else Quaternion())
            moved = Vector(pose.get(f"@{name}", (0, 0, 0)))
            if parent is None:
                heads[name] = self.joints[name] + moved
            else:
                heads[name] = heads[parent] + world[parent] @ (self.joints[name] - self.joints[parent]) + moved
        return heads, world


def export(model):
    """Writes the model's .glb and .blend again, as `Model.finish()` does."""
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


class BeastAnimator(wwcreature.CreatureAnimator):
    """CreatureAnimator with "%bone": (x, y, z) scaling a bone along its own axes; bones scaled in any
    action are keyed in all of them (unscaled where not named), so no action leaves another's behind."""

    def key_all(self, actions):
        rig = self.rig
        rig.animation_data_create()
        scaled = sorted({k[1:] for frames in actions.values() for _f, p in frames for k in p if k.startswith("%")})
        for name, frames in actions.items():
            action = bpy.data.actions.new(name)
            rig.animation_data.action = action
            last = {}
            for frame, pose in frames:
                rotations, places = self.local(pose)
                for bone, q in rotations.items():
                    if bone in last and last[bone].dot(q) < 0:
                        q = -q
                    last[bone] = q
                    pb = rig.pose.bones[bone]
                    pb.rotation_mode = "QUATERNION"
                    pb.rotation_quaternion = q
                    pb.location = places[bone]
                    pb.keyframe_insert("rotation_quaternion", frame=frame, group=bone)
                    pb.keyframe_insert("location", frame=frame, group=bone)
                for bone in scaled:
                    pb = rig.pose.bones[bone]
                    pb.scale = pose.get(f"%{bone}", (1, 1, 1))
                    pb.keyframe_insert("scale", frame=frame, group=bone)
            for curve in wwcreature._fcurves(action):
                curve.modifiers.new("CYCLES")
                curve.update()
            track = rig.animation_data.nla_tracks.new()
            track.name = name
            track.strips.new(name, int(frames[0][0]), action)
            rig.animation_data.action = None
        for pb in rig.pose.bones:
            pb.rotation_quaternion = Quaternion()
            pb.location = (0, 0, 0)
            pb.scale = (1, 1, 1)


def smooth(e0, e1, x):
    """0 below e0, 1 above e1, smoothly between."""
    t = max(0.0, min(1.0, (x - e0) / (e1 - e0)))
    return t * t * (3 - 2 * t)


def transform(m, start, rotation=None, offset=(0, 0, 0), bone=None, scale=1.0):
    """Turns (about the origin), scales and moves the hard parts added since `start` (len(m.parts) before
    them), and puts them on `bone` if given: build a thing where it's easy, then place it."""
    rotation = rotation or Quaternion()
    offset = Vector(offset)
    for i in range(start, len(m.parts)):
        verts, faces, colour, b, smooth_ = m.parts[i]
        m.parts[i] = ([rotation @ (Vector(v) * scale) + offset for v in verts], faces, colour, bone or b, smooth_)


def lathe(m, profile, colour, bone, segments=10, axis=None, centre=(0, 0, 0), smooth_=True):
    """A turned shape: `profile` [(radius, height)] spun round the up axis (a coin, a helmet, a pommel),
    closed at both ends, then pointed along `axis` and put at `centre`."""
    bm = bmesh.new()
    rings = []
    for r, h in profile:
        rings.append([bm.verts.new((r * math.cos(2 * math.pi * k / segments), r * math.sin(2 * math.pi * k / segments), h)) for k in range(segments)])
    bm.faces.new(list(reversed(rings[0])))
    for a, b in zip(rings, rings[1:]):
        for k in range(segments):
            bm.faces.new((a[k], a[(k + 1) % segments], b[(k + 1) % segments], b[k]))
    bm.faces.new(rings[-1])
    rotation = Vector((0, 0, 1)).rotation_difference(Vector(axis).normalized()) if axis else None
    m._add_bm(m._placed(bm, (1, 1, 1), rotation, centre), colour, bone, smooth_)


def loft(m, rings, colours, bone, smooth_=True, cap=None):
    """A closed hull through `rings` (each a list of points, all the same length, in order round): a head
    or a jaw with flat planes and hard edges that metaballs can't give. `colours` is one colour, a list with
    one for each side of a ring (the faces between point k and k + 1 take colours[k]), or a function of
    (k, i, the face's middle) for the face from point k of ring i; `cap` colours the two ends, if given."""
    bm = bmesh.new()
    vs = [[bm.verts.new(Vector(p)) for p in ring] for ring in rings]
    n = len(rings[0])
    face_colours = []
    if callable(colours):
        pick = colours
    elif isinstance(colours, list):
        pick = lambda k, i, p: colours[k]  # noqa: E731
    else:
        pick = lambda k, i, p: colours  # noqa: E731
    for i, (a, b) in enumerate(zip(vs, vs[1:])):
        for k in range(n):
            face = bm.faces.new((a[k], a[(k + 1) % n], b[(k + 1) % n], b[k]))
            face_colours.append(pick(k, i, face.calc_center_median()))
    for ring in (vs[0], vs[-1]):
        centre = bm.verts.new(sum((v.co for v in ring), Vector()) / n)
        for k in range(n):
            bm.faces.new((ring[k], ring[(k + 1) % n], centre))
            face_colours.append(cap if cap is not None else pick(k, 0, centre.co))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    m._add_bm(bm, face_colours, bone, smooth_)
