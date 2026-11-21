"""Shared helpers for Wanderworld's Blender asset scripts (the make_*.py files beside this one).

A make script builds one asset in an empty scene and ends with `Model.finish()`. Run one headless, with
BLENDER set to your Blender executable:

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_goblin.py

It writes assets/models/<name>.glb (rigged, with its own Idle, Walk and Attack actions) and
assets/build/<name>.blend (to open in Blender; not committed). `node scripts/build-wanderworld-people.mjs
--bestiary` then packs every model into the game's kit.

Positions are given as the game's code gives them, (x, up, forward) in metres with x towards the
creature's left; `at()` turns them into Blender's (+Z up, facing -Y). The glTF export turns them back.
"""

import math
import os

import bmesh
import bpy
import numpy as np
from mathutils import Matrix, Quaternion, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
MODELS = os.path.join(os.path.dirname(HERE), "models")
BUILD = os.path.join(os.path.dirname(HERE), "build")

THRESHOLD = 0.6  # Blender's metaball default
STIFF = 4.0  # stiffer than the default 2: shapes join smoothly without reaching across gaps
# A lone metaball's surface lies at this times its radius, for STIFF.
SURFACE = math.sqrt(1 - (THRESHOLD / STIFF) ** (1 / 3))

# The people's skeleton (Quaternius's universal rig, Unreal mannequin names), so a model moves with the
# people's animations in the game: each bone and its parent.
BONES = [
    ("pelvis", None),
    ("spine_01", "pelvis"),
    ("spine_02", "spine_01"),
    ("spine_03", "spine_02"),
    ("neck_01", "spine_03"),
    ("Head", "neck_01"),
]
for _s in ("l", "r"):
    BONES += [
        (f"clavicle_{_s}", "spine_03"),
        (f"upperarm_{_s}", f"clavicle_{_s}"),
        (f"lowerarm_{_s}", f"upperarm_{_s}"),
        (f"hand_{_s}", f"lowerarm_{_s}"),
        (f"thigh_{_s}", "pelvis"),
        (f"calf_{_s}", f"thigh_{_s}"),
        (f"foot_{_s}", f"calf_{_s}"),
        (f"ball_{_s}", f"foot_{_s}"),
    ]


def at(x, up, fwd):
    """A point from the game's (x, up, forward) to Blender's (x, -forward, up)."""
    return Vector((x, -fwd, up))


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.context.scene.render.fps = 30


def hex_rgb(hex_colour):
    return (((hex_colour >> 16) & 255) / 255, ((hex_colour >> 8) & 255) / 255, (hex_colour & 255) / 255)


def shade(hex_colour, k):
    r, g, b = (min(255, round(c * 255 * k)) for c in hex_rgb(hex_colour))
    return (r << 16) | (g << 8) | b


class Palette:
    """Flat colours in one small texture, each colour a square cell: a face is coloured by putting all
    its texture coordinates at its colour's cell. (One texture, so the game draws a model at once.)"""

    CELLS = 8
    SIZE = 512

    def __init__(self):
        self.colours = []

    def index(self, hex_colour):
        if hex_colour not in self.colours:
            assert len(self.colours) < self.CELLS * self.CELLS, "too many colours for the palette"
            self.colours.append(hex_colour)
        return self.colours.index(hex_colour)

    def uv(self, i):
        return ((i % self.CELLS + 0.5) / self.CELLS, 1 - (i // self.CELLS + 0.5) / self.CELLS)

    def material(self, name):
        size, cell = self.SIZE, self.SIZE // self.CELLS
        pixels = np.ones((size, size, 4), dtype=np.float32)
        for i, hex_colour in enumerate(self.colours):
            cx, cy = i % self.CELLS, i // self.CELLS
            # (Image rows run bottom to top: v = 0 is row 0.)
            rows = slice(size - (cy + 1) * cell, size - cy * cell)
            pixels[rows, cx * cell : (cx + 1) * cell, :3] = hex_rgb(hex_colour)
        image = bpy.data.images.new(f"{name}-palette", size, size)
        image.pixels.foreach_set(pixels.ravel())
        image.file_format = "PNG"
        image.pack()
        material = bpy.data.materials.new(name)
        material.use_nodes = True
        nodes = material.node_tree.nodes
        bsdf = nodes.get("Principled BSDF")
        texture = nodes.new("ShaderNodeTexImage")
        texture.image = image
        texture.interpolation = "Closest"
        material.node_tree.links.new(texture.outputs["Color"], bsdf.inputs["Base Color"])
        bsdf.inputs["Roughness"].default_value = 1.0
        return material


def _segment_distance(p, a, b):
    ab = b - a
    t = 0.0 if ab.length_squared == 0 else max(0.0, min(1.0, (p - a).dot(ab) / ab.length_squared))
    return (p - (a + ab * t)).length


class Model:
    """One creature: a smooth body of metaballs (skinned to the rig by Blender's automatic weights) and
    hard parts (eyes, horns, armour, a weapon), each wholly on one bone, all in one mesh with one
    palette texture."""

    def __init__(self, name, resolution=0.012, faces=6000):
        reset()
        self.name = name
        self.palette = Palette()
        self.resolution = resolution
        self.target_faces = faces
        self.elements = []  # the body: (kind, data, colour, negative)
        self.parts = []  # hard parts: (verts, faces, colour, bone, smooth)
        self.joints = {}

    # ── The body: metaballs, each with the colour its part of the skin takes ──

    def ball(self, centre, r, colour, negative=False):
        self.elements.append(("BALL", (Vector(centre), r), colour, negative))

    def capsule(self, a, b, r, colour, negative=False):
        self.elements.append(("CAPSULE", (Vector(a), Vector(b), r), colour, negative))

    def ellipsoid(self, centre, radii, colour, negative=False):
        self.elements.append(("ELLIPSOID", (Vector(centre), Vector(radii)), colour, negative))

    def _body_mesh(self):
        meta = bpy.data.metaballs.new(f"{self.name}-body")
        meta.resolution = self.resolution
        meta.threshold = THRESHOLD
        holder = bpy.data.objects.new(f"{self.name}-meta", meta)
        bpy.context.scene.collection.objects.link(holder)
        for kind, data, _colour, negative in self.elements:
            e = meta.elements.new(type=kind)
            e.stiffness = STIFF
            e.use_negative = negative
            if kind == "BALL":
                centre, r = data
                e.co, e.radius = centre, r / SURFACE
            elif kind == "CAPSULE":
                a, b, r = data
                e.co = (a + b) / 2
                e.radius = r / SURFACE
                e.size_x = (b - a).length / 2
                e.rotation = Vector((1, 0, 0)).rotation_difference((b - a).normalized())
            else:
                centre, radii = data
                e.co = centre
                e.radius = 1 / SURFACE
                e.size_x, e.size_y, e.size_z = radii
        depsgraph = bpy.context.evaluated_depsgraph_get()
        mesh = bpy.data.meshes.new_from_object(holder.evaluated_get(depsgraph))
        bpy.data.objects.remove(holder)
        body = bpy.data.objects.new(f"{self.name}-skin", mesh)
        bpy.context.scene.collection.objects.link(body)
        # Fewer faces: a model has to stay cheap for a crowd of them on a phone.
        if len(mesh.polygons) > self.target_faces:
            decimate = body.modifiers.new("Decimate", "DECIMATE")
            decimate.ratio = self.target_faces / len(mesh.polygons)
            depsgraph = bpy.context.evaluated_depsgraph_get()
            reduced = bpy.data.meshes.new_from_object(body.evaluated_get(depsgraph))
            body.modifiers.clear()
            body.data = reduced
            bpy.data.meshes.remove(mesh)
        return body

    def _field(self, p, element):
        """How strongly a metaball element holds the point p (0 outside its reach)."""
        kind, data, _colour, _negative = element
        if kind == "BALL":
            centre, r = data
            x = (p - centre).length / (r / SURFACE)
        elif kind == "CAPSULE":
            a, b, r = data
            x = _segment_distance(p, a, b) / (r / SURFACE)
        else:
            centre, radii = data
            d = p - centre
            x = math.sqrt(sum((d[i] / (radii[i] / SURFACE)) ** 2 for i in range(3)))
        return 0.0 if x >= 1 else (1 - x * x) ** 3

    def _face_colour(self, p):
        """The colour of the skin at p: what a carving (negative) element gives inside it, else the
        element that holds it most."""
        best, colour = 0.0, None
        for element in self.elements:
            f = self._field(p, element)
            if element[3]:
                if f > 0.35:
                    return element[2]
                continue
            if f > best:
                best, colour = f, element[2]
        return colour if colour is not None else self.elements[0][2]

    # ── Hard parts ──

    def _add_bm(self, bm, colour, bone, smooth=True):
        bm.verts.ensure_lookup_table()
        verts = [v.co.copy() for v in bm.verts]
        faces = [[v.index for v in f.verts] for f in bm.faces]
        bm.free()
        self.parts.append((verts, faces, colour, bone, smooth))

    @staticmethod
    def _placed(bm, scale=(1, 1, 1), rotation=None, centre=(0, 0, 0)):
        bmesh.ops.scale(bm, vec=Vector(scale), verts=bm.verts)
        if rotation is not None:
            bmesh.ops.rotate(bm, cent=Vector((0, 0, 0)), matrix=rotation.to_matrix(), verts=bm.verts)
        bmesh.ops.translate(bm, vec=Vector(centre), verts=bm.verts)
        return bm

    def sphere(self, centre, radii, colour, bone, segments=12, rings=8, smooth=True):
        bm = bmesh.new()
        bmesh.ops.create_uvsphere(bm, u_segments=segments, v_segments=rings, radius=1)
        self._add_bm(self._placed(bm, radii, None, centre), colour, bone, smooth)

    def cone(self, base, tip, r, colour, bone, segments=8, flat=1.0, facing=None, smooth=True):
        """A cone from its base (radius r) to a point; `flat` squashes it across (an ear, a blade), its
        broad side facing `facing` when given."""
        base, tip = Vector(base), Vector(tip)
        bm = bmesh.new()
        length = (tip - base).length
        bmesh.ops.create_cone(bm, cap_ends=True, segments=segments, radius1=r, radius2=0, depth=length)
        bmesh.ops.translate(bm, vec=Vector((0, 0, length / 2)), verts=bm.verts)
        bmesh.ops.scale(bm, vec=Vector((1, flat, 1)), verts=bm.verts)
        z = (tip - base).normalized()
        if facing is None:
            rotation = Vector((0, 0, 1)).rotation_difference(z)
        else:
            # (Squashed along local y: so local y is the way the broad side faces.)
            y = Vector(facing) - z * Vector(facing).dot(z)
            y.normalize()
            x = y.cross(z)
            rotation = Matrix((x, y, z)).transposed().to_quaternion()
        self._add_bm(self._placed(bm, (1, 1, 1), rotation, base), colour, bone, smooth)

    def tube(self, a, b, ra, rb, colour, bone, segments=8, smooth=True):
        a, b = Vector(a), Vector(b)
        bm = bmesh.new()
        length = (b - a).length
        bmesh.ops.create_cone(bm, cap_ends=True, segments=segments, radius1=ra, radius2=rb, depth=length)
        bmesh.ops.translate(bm, vec=Vector((0, 0, length / 2)), verts=bm.verts)
        rotation = Vector((0, 0, 1)).rotation_difference((b - a).normalized())
        self._add_bm(self._placed(bm, (1, 1, 1), rotation, a), colour, bone, smooth)

    def box(self, centre, size, colour, bone, rotation=None, smooth=False):
        bm = bmesh.new()
        bmesh.ops.create_cube(bm, size=1)
        self._add_bm(self._placed(bm, size, rotation, centre), colour, bone, smooth)

    def ring(self, centre, radius, thickness, colour, bone, scale=(1, 1, 1), axis=(0, 0, 1), segments=16):
        """A torus round `axis` (a belt round the waist, a band round a wrist)."""
        bm = bmesh.new()
        for i in range(segments):
            a0 = 2 * math.pi * i / segments
            for j in range(6):
                b0 = 2 * math.pi * j / 6
                bm.verts.new(
                    (
                        (radius + thickness * math.cos(b0)) * math.cos(a0),
                        (radius + thickness * math.cos(b0)) * math.sin(a0),
                        thickness * math.sin(b0),
                    )
                )
        bm.verts.ensure_lookup_table()
        for i in range(segments):
            for j in range(6):
                a, b = i * 6 + j, i * 6 + (j + 1) % 6
                c, d = ((i + 1) % segments) * 6 + (j + 1) % 6, ((i + 1) % segments) * 6 + j
                bm.faces.new((bm.verts[a], bm.verts[b], bm.verts[c], bm.verts[d]))
        rotation = Vector((0, 0, 1)).rotation_difference(Vector(axis).normalized())
        self._add_bm(self._placed(bm, scale, rotation, centre), colour, bone)

    def weapon(self, parts, grip, tilt):
        """A weapon in the right hand: `parts` ([(maker, args)]) are made with the grip at the origin and
        the weapon running forward (-Y); it's turned by `tilt` about the up axis (below 0: towards where
        the fingers point, so it's held forward and down as the people's clips hold a hand) and put at
        `grip`."""
        rotation = Quaternion((0, 0, 1), tilt)
        start = len(self.parts)
        for maker, args in parts:
            maker(*args)
        for i in range(start, len(self.parts)):
            verts, faces, colour, bone, smooth = self.parts[i]
            moved = [rotation @ v + Vector(grip) for v in verts]
            self.parts[i] = (moved, faces, colour, "hand_r", smooth)

    # ── The rig ──

    def rig(self, joints):
        """The armature, from `joints`: each bone's head (and `<bone>.tail` where its tail isn't its
        first child's head). Rolled so each bone's local axes are predictable for animating."""
        self.joints = {k: Vector(v) for k, v in joints.items()}
        armature = bpy.data.armatures.new(f"{self.name}-rig")
        rig = bpy.data.objects.new(f"{self.name}-rig", armature)
        bpy.context.scene.collection.objects.link(rig)
        bpy.context.view_layer.objects.active = rig
        bpy.ops.object.mode_set(mode="EDIT")
        children = {}
        for name, parent in BONES:
            children.setdefault(parent, []).append(name)
        for name, parent in BONES:
            bone = armature.edit_bones.new(name)
            bone.head = self.joints[name]
            tail = self.joints.get(f"{name}.tail")
            if tail is None:
                tail = self.joints[children[name][0]]
            bone.tail = tail
            if parent:
                bone.parent = armature.edit_bones[parent]
            # Arms and feet (lying flat) roll their Z up; the rest (standing) roll their Z forward.
            direction = (bone.tail - bone.head).normalized()
            bone.align_roll(Vector((0, 0, 1)) if abs(direction.z) < 0.5 else Vector((0, -1, 0)))
        bpy.ops.object.mode_set(mode="OBJECT")
        self.armature = rig
        return rig

    # ── Putting it together ──

    def finish(self, actions):
        """Builds the mesh, skins it, keys `actions` ({name: frames}, see `Animator`), and writes the
        .glb and the .blend."""
        body = self._body_mesh()
        rig = self.armature
        # Blender's automatic weights for the body (bone heat).
        bpy.ops.object.select_all(action="DESELECT")
        body.select_set(True)
        rig.select_set(True)
        bpy.context.view_layer.objects.active = rig
        bpy.ops.object.parent_set(type="ARMATURE_AUTO")
        names = [b.name for b in rig.data.bones]
        group_bone = {g.index: g.name for g in body.vertex_groups}
        body_weights = []
        for v in body.data.vertices:
            weights = {group_bone[g.group]: g.weight for g in v.groups if g.weight > 0.001}
            if not weights:
                # (Bone heat can miss a vertex: it follows the nearest bone instead.)
                nearest = min(
                    names,
                    key=lambda n: _segment_distance(v.co, rig.data.bones[n].head_local, rig.data.bones[n].tail_local),
                )
                weights = {nearest: 1.0}
            body_weights.append(weights)
        body_verts = [v.co.copy() for v in body.data.vertices]
        body_faces = [list(p.vertices) for p in body.data.polygons]
        body_colours = [self._face_colour(Vector(p.center)) for p in body.data.polygons]
        bpy.data.objects.remove(body)

        # One mesh: the body, then the hard parts.
        verts, faces, colours, smooth, weights = list(body_verts), list(body_faces), list(body_colours), [True] * len(body_faces), list(body_weights)
        for part_verts, part_faces, colour, bone, part_smooth in self.parts:
            offset = len(verts)
            verts += part_verts
            weights += [{bone: 1.0}] * len(part_verts)
            for f in part_faces:
                faces.append([i + offset for i in f])
                colours.append(colour)
                smooth.append(part_smooth)
        mesh = bpy.data.meshes.new(self.name)
        mesh.from_pydata([tuple(v) for v in verts], [], faces)
        mesh.polygons.foreach_set("use_smooth", smooth)
        uv = mesh.uv_layers.new(name="UVMap")
        for poly, colour in zip(mesh.polygons, colours):
            u, v = self.palette.uv(self.palette.index(colour))
            for loop in poly.loop_indices:
                uv.data[loop].uv = (u, v)
        mesh.materials.append(self.palette.material(self.name))
        obj = bpy.data.objects.new(self.name, mesh)
        bpy.context.scene.collection.objects.link(obj)
        groups = {n: obj.vertex_groups.new(name=n) for n in names}
        for i, w in enumerate(weights):
            for bone, value in w.items():
                groups[bone].add([i], value, "REPLACE")
        obj.parent = rig
        obj.modifiers.new("Armature", "ARMATURE").object = rig

        Animator(rig).key_all(actions)
        # Everything is built in place at 1 unit = 1 metre with its feet at the origin; apply the objects'
        # transforms anyway, so nothing but the rig's bones moves the mesh.
        bpy.ops.object.select_all(action="DESELECT")
        for o in (obj, rig):
            o.select_set(True)
        bpy.context.view_layer.objects.active = rig
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
        os.makedirs(MODELS, exist_ok=True)
        os.makedirs(BUILD, exist_ok=True)
        bpy.ops.export_scene.gltf(
            filepath=os.path.join(MODELS, f"{self.name}.glb"),
            export_format="GLB",
            export_animations=True,
            export_animation_mode="NLA_TRACKS",
            export_skins=True,
            export_yup=True,
            export_normals=True,
            export_texcoords=True,
            export_materials="EXPORT",
        )
        bpy.ops.wm.save_as_mainfile(filepath=os.path.join(BUILD, f"{self.name}.blend"), compress=True)
        print(f"{self.name}: {len(verts)} vertices, {len(faces)} faces, {len(self.palette.colours)} colours")


class Animator:
    """Keys actions from poses given as turns in the creature's own space: {bone: Quaternion}, each the
    whole turn the bone makes from where it rests (a child not named turns with its parent). Each action
    goes on an NLA track of its own, so the glTF export writes them all."""

    def __init__(self, rig):
        self.rig = rig
        self.rest = {b.name: b.matrix_local.to_quaternion() for b in rig.data.bones}

    def turns(self, pose):
        world = {}
        for name, parent in BONES:
            world[name] = pose.get(name, world[parent] if parent else Quaternion())
        local = {}
        for name, parent in BONES:
            delta = (world[parent].inverted() if parent else Quaternion()) @ world[name]
            local[name] = self.rest[name].inverted() @ delta @ self.rest[name]
        return local

    def key_all(self, actions):
        rig = self.rig
        rig.animation_data_create()
        for name, frames in actions.items():
            action = bpy.data.actions.new(name)
            rig.animation_data.action = action
            for frame, pose in frames:
                for bone, q in self.turns(pose).items():
                    pb = rig.pose.bones[bone]
                    pb.rotation_mode = "QUATERNION"
                    pb.rotation_quaternion = q
                    pb.keyframe_insert("rotation_quaternion", frame=frame, group=bone)
            track = rig.animation_data.nla_tracks.new()
            track.name = name
            track.strips.new(name, int(frames[0][0]), action)
            rig.animation_data.action = None
        for pb in rig.pose.bones:
            pb.rotation_quaternion = Quaternion()


def turn(axis, degrees):
    """A turn about an axis in the creature's own space ("x": its left, "y": backwards, "z": up)."""
    vector = {"x": (1, 0, 0), "y": (0, 1, 0), "z": (0, 0, 1)}[axis]
    return Quaternion(vector, math.radians(degrees))


def humanoid_actions(arm_down=72, walk_swing=24, step=30):
    """Idle, Walk and Attack for a two-legged creature on the people's skeleton (the game uses the
    people's own animations instead; these are for the model on its own)."""

    def arms(swing_l=0.0, swing_r=0.0, bend=12):
        # Arms down at the sides (a turn about the front-back axis), then swung forwards (below 0) or
        # back; the forearms bend forwards at the elbow by `bend`.
        return {
            "upperarm_l": turn("x", swing_l) @ turn("y", arm_down),
            "upperarm_r": turn("x", swing_r) @ turn("y", -arm_down),
            "lowerarm_l": turn("x", swing_l - bend) @ turn("y", arm_down),
            "lowerarm_r": turn("x", swing_r - bend) @ turn("y", -arm_down),
        }

    def legs(swing):
        # Swing forward is a turn about the left axis by a negative angle (the foot goes to -Y).
        knee_l = max(0.0, -swing) * 0.8 + 6
        knee_r = max(0.0, swing) * 0.8 + 6
        return {
            "thigh_l": turn("x", -swing),
            "thigh_r": turn("x", swing),
            "calf_l": turn("x", -swing + knee_l),
            "calf_r": turn("x", swing + knee_r),
            # (Feet kept nearly level.)
            "foot_l": turn("x", -swing * 0.3),
            "foot_r": turn("x", swing * 0.3),
        }

    idle = []
    for frame, breath in ((1, 0), (30, 1), (60, 0)):
        pose = arms(bend=10 + breath * 3)
        pose["spine_02"] = turn("x", -2 * breath)
        idle.append((frame, pose))
    walk = []
    for i in range(5):
        phase = math.sin(i / 4 * 2 * math.pi)
        pose = {**legs(walk_swing * phase), **arms(swing_l=18 * phase, swing_r=-18 * phase)}
        walk.append((1 + i * step / 4, pose))
    # Attack: the right arm swung up over the shoulder, then chopped down and forwards.
    attack = []
    for frame, swing, twist in ((1, -10, 0), (10, -160, 15), (16, -45, -20), (26, -10, 0)):
        pose = arms()
        pose["upperarm_r"] = turn("x", swing) @ turn("y", -arm_down)
        pose["lowerarm_r"] = turn("x", swing - 15) @ turn("y", -arm_down)
        pose["spine_02"] = turn("z", twist)
        attack.append((frame, pose))
    return {"Idle": idle, "Walk": walk, "Attack": attack}


# ── Two-legged creatures ─────────────────────────────────────────────────────────────────────────────


def humanoid_joints(p):
    """The people's skeleton laid out for a body's proportions, in metres (as bestiary.js gives them):
    `leg` (hip height), `torso` (hips to the base of the neck), `neck`, `shoulders` and `hips` (between
    the joints), `arm` (shoulder to wrist), `hunch` (how far forward the head sits), `hand`, `foot`. In a
    T-pose, arms out along x."""
    s = p["leg"] / 0.9
    hips, torso, hunch = p["leg"], p["torso"], p["hunch"]
    arm_y = hips + torso * 0.88
    head_y = hips + torso + p["neck"] - hunch * 0.45
    sx, hx = p["shoulders"] / 2, p["hips"] / 2
    h, f = p["hand"] * s, p["foot"] * s
    joints = {
        "pelvis": at(0, hips, 0),
        "spine_01": at(0, hips + torso * 0.15, 0),
        "spine_02": at(0, hips + torso * 0.5, hunch * 0.15),
        "spine_03": at(0, hips + torso * 0.75, hunch * 0.3),
        "neck_01": at(0, hips + torso - hunch * 0.25, hunch * 0.6),
        "Head": at(0, head_y, hunch),
        "Head.tail": at(0, head_y + 0.2 * s, hunch),
    }
    for side, sign in (("l", 1), ("r", -1)):
        joints.update(
            {
                f"clavicle_{side}": at(sign * 0.03 * s, arm_y - 0.02 * s, hunch * 0.3),
                f"upperarm_{side}": at(sign * sx, arm_y, 0),
                f"lowerarm_{side}": at(sign * (sx + p["arm"] * 0.52), arm_y, 0),
                f"hand_{side}": at(sign * (sx + p["arm"]), arm_y, 0),
                f"hand_{side}.tail": at(sign * (sx + p["arm"] + 0.1 * h), arm_y, 0),
                f"thigh_{side}": at(sign * hx, hips - 0.04 * s, 0),
                f"calf_{side}": at(sign * hx, hips * 0.52, 0),
                f"foot_{side}": at(sign * hx, 0.085 * s, 0),
                f"ball_{side}": at(sign * hx, 0.025 * s, 0.11 * f),
                f"ball_{side}.tail": at(sign * hx, 0.025 * s, 0.18 * f),
            }
        )
    return joints


def humanoid_body(m, p, c):
    """The parts every two-legged body shares, as metaballs (torso, neck, arms, palms, legs, feet) and
    hard parts (fingers, toes, claws), from the proportions `p` (see humanoid_joints; also `thick`,
    `chest` and `waist` as [across, front to back] radii, `belly`, `claws`) and colours `c` (`skin`, and
    where they differ `shirt`, `limbs` (upper arms), `forearms`, `legs`, `shins`, `feet`, `nails`).
    Returns the measures a creature's own parts are placed by."""
    s = p["leg"] / 0.9
    t = p["thick"] * s
    hips, torso, hunch = p["leg"], p["torso"], p["hunch"]
    chest_y = hips + torso * 0.5
    arm_y = hips + torso * 0.88
    head_y = hips + torso + p["neck"] - hunch * 0.45
    knee, ankle = hips * 0.52, 0.085 * s
    sx, hx = p["shoulders"] / 2, p["hips"] / 2
    (chest_x, chest_z), (waist_x, waist_z) = p["chest"], p["waist"]
    skin = c["skin"]
    shirt = c.get("shirt", skin)

    def ell(centre, radii, colour):  # radii as (across, up, front to back)
        m.ellipsoid(centre, (radii[0], radii[2], radii[1]), colour)

    ell(at(0, hips + 0.02 * s, 0), (waist_x * 1.05, 0.09 * s, waist_z * 1.05), c.get("legs", skin))
    ell(at(0, (hips + chest_y) / 2, 0), (waist_x * 0.95, (chest_y - hips) * 0.62, waist_z), shirt)
    if p.get("belly"):
        ell(at(0, hips + torso * 0.22, waist_z * 0.35), (waist_x * 0.95, p["belly"] * 0.9, p["belly"]), shirt)
    ell(at(0, chest_y + torso * 0.18, hunch * 0.2), (chest_x, torso * 0.32, chest_z), shirt)
    ell(at(0, arm_y - 0.01 * s, hunch * 0.22), (sx * 0.92, 0.05 * s * p["thick"], chest_z * 0.7), shirt)
    m.capsule(at(0, arm_y - 0.05 * s, hunch * 0.4), at(0, head_y, hunch), 0.065 * t, skin)
    h, f = p["hand"] * s, p["foot"] * s
    for side, sign in (("l", 1), ("r", -1)):

        def x(offset):
            return sign * (sx + offset)

        elbow, wrist = p["arm"] * 0.52, p["arm"]
        m.ball(at(x(0.02 * s), arm_y, 0), 0.062 * t, c.get("limbs", skin))
        m.capsule(at(x(0.02 * s), arm_y, 0), at(x(elbow), arm_y, 0), 0.048 * t, c.get("limbs", skin))
        m.ball(at(x(elbow + p["arm"] * 0.1), arm_y, 0), 0.044 * t, c.get("forearms", skin))
        m.capsule(at(x(elbow), arm_y, 0), at(x(wrist), arm_y, 0), 0.033 * t, c.get("forearms", skin))
        # A palm, and fingers and a thumb as hard parts (too fine for metaballs), with claws if it has them.
        ell(at(x(wrist + 0.045 * h), arm_y, 0), (0.05 * h, 0.022 * h, 0.042 * h), skin)
        bone = f"hand_{side}"
        for i in range(4):
            z = (i - 1.5) * 0.022 * h
            base = at(x(wrist + 0.075 * h), arm_y - 0.004 * h, z)
            tip = at(x(wrist + 0.15 * h), arm_y - 0.022 * h, z * 1.1)
            m.tube(base, tip, 0.012 * h, 0.009 * h, skin, bone, segments=6)
            m.sphere(tip, (0.009 * h,) * 3, skin, bone, segments=6, rings=4)
            if p.get("claws"):
                m.cone(tip, tip + Vector((sign * 0.035 * h, 0, -0.02 * h)), 0.008 * h, c.get("nails", 0x2A2420), bone, segments=5)
        m.tube(at(x(wrist + 0.03 * h), arm_y, 0.03 * h), at(x(wrist + 0.07 * h), arm_y - 0.012 * h, 0.075 * h), 0.013 * h, 0.01 * h, skin, bone, segments=6)
        # Legs: a full thigh, a calf with its muscle behind; a foot with three toes.
        legs, shins = c.get("legs", skin), c.get("shins", c.get("legs", skin))
        m.ball(at(sign * hx, hips - 0.05 * s, 0), 0.085 * t, legs)
        m.capsule(at(sign * hx, hips - 0.03 * s, 0), at(sign * hx, knee, 0), 0.068 * t, legs)
        m.capsule(at(sign * hx, knee, 0), at(sign * hx, ankle + 0.03 * s, 0), 0.044 * t, shins)
        m.ball(at(sign * hx, knee - 0.12 * s, -0.02 * t), 0.052 * t, shins)
        feet = c.get("feet", skin)
        if p.get("hooves"):
            m.tube(at(sign * hx, 0, 0.01 * f), at(sign * hx, 0.1 * f, 0.01 * f), 0.075 * f, 0.06 * f, p["hooves"], f"foot_{side}", segments=10, smooth=False)
        else:
            ell(at(sign * hx, 0.045 * f, 0.045 * f), (0.055 * f, 0.042 * f, 0.105 * f), feet)
            for toe in range(3):
                tx = sign * hx + (toe - 1) * 0.03 * f
                tip = at(tx, 0.02 * f, 0.155 * f)
                m.sphere(at(tx, 0.022 * f, 0.135 * f), (0.019 * f, 0.03 * f, 0.018 * f), feet, f"ball_{side}", segments=6, rings=4)
                if p.get("claws"):
                    m.cone(tip, tip + Vector((0, -0.035 * f, -0.012 * f)), 0.009 * f, c.get("nails", 0x2A2420), f"ball_{side}", segments=5)
    return {"s": s, "t": t, "arm_y": arm_y, "head_y": head_y, "sx": sx, "hx": hx, "chest_y": chest_y, "knee": knee, "h": h, "f": f}
