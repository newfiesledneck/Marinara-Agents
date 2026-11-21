"""Helpers for Wanderworld creatures that aren't two-legged (a mimic, a shambling mound, a walking shrub):
a skeleton of the creature's own in place of the people's, and actions keyed on it. Built on wwblend's
Model, metaballs, hard parts and bake; see make_mimic.py for one put together.

A skeleton is a list of bones, `(name, parent, head, tail)` in Blender's space (`wwblend.at()` turns the
game's (x, up, forward) into it), parents before their children. An action is `[(frame, pose), ...]`, the
first pose and the last the same, so it loops; a pose is `{bone: Quaternion}`, each the whole turn the
bone makes in the creature's own space from where it rests (a bone not named turns with its parent), and
`{"@bone": Vector}` moves a bone by that much (the game keeps a bone's turns and places, not its scale).

Also here: `surface()`, where a ray from inside comes out of a model's metaball skin (to put leaves and
vines on it), and `rope()`, one smooth tube along a path (a vine, a root, a tendril).
"""

import math

import bmesh
import bpy
from mathutils import Quaternion, Vector

import wwblend
from wwblend import Model


class Creature(Model):
    def rig(self, bones):
        """The armature from `bones` ([(name, parent, head, tail)])."""
        self.bones = [(name, parent) for name, parent, _head, _tail in bones]
        self.joints = {name: Vector(head) for name, _parent, head, _tail in bones}
        self.tails = {name: Vector(tail) for name, _parent, _head, tail in bones}
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
        return rig

    def finish(self, actions, bake=None):
        # ponytail: wwblend.Model.finish keys its actions with wwblend.Animator, which walks the people's
        # skeleton; this swaps in CreatureAnimator for the call rather than copying finish(). If finish()
        # ever takes an animator, pass it there instead.
        saved = wwblend.Animator
        wwblend.Animator = CreatureAnimator
        try:
            super().finish(actions, bake)
        finally:
            wwblend.Animator = saved

    # ── Poses ──

    def direction(self, bone):
        return (self.tails[bone] - self.joints[bone]).normalized()

    def aim(self, bone, towards):
        """The turn that points `bone` along `towards` (Blender's space)."""
        return self.direction(bone).rotation_difference(Vector(towards).normalized())

    def chain(self, bones, directions):
        """A pose for a chain of bones, each pointed along its direction (`None`: as its parent turns)."""
        return {b: self.aim(b, d) for b, d in zip(bones, directions) if d is not None}

    def leg(self, upper, lower, hip, foot, pole):
        """A pose for a two-bone leg whose upper bone starts at `hip` (where it is in this pose), reaching
        for `foot`, its knee bending towards `pole` (Blender's space): a little inverse kinematics."""
        hip, foot, pole = Vector(hip), Vector(foot), Vector(pole)
        l1 = (self.joints[lower] - self.joints[upper]).length
        l2 = (self.tails[lower] - self.joints[lower]).length
        reach = foot - hip
        d = max(1e-4, min(reach.length, (l1 + l2) * 0.999))
        along = reach.normalized()
        # The knee: along the reach by a, out towards the pole by h.
        a = (l1 * l1 - l2 * l2 + d * d) / (2 * d)
        h = math.sqrt(max(0.0, l1 * l1 - a * a))
        out = pole - along * pole.dot(along)
        out = out.normalized() if out.length > 1e-6 else Vector((0, 0, 1))
        knee = hip + along * a + out * h
        end = hip + along * d
        return {upper: self.aim(upper, knee - hip), lower: self.aim(lower, end - knee)}


def _fcurves(action):
    """An action's curves (Blender 4.4 on keeps them in layers, slots and channel bags)."""
    if hasattr(action, "layers") and len(action.layers):
        for layer in action.layers:
            for strip in layer.strips:
                for bag in strip.channelbags:
                    yield from bag.fcurves
    elif hasattr(action, "fcurves"):
        yield from action.fcurves


class CreatureAnimator:
    """wwblend.Animator for a skeleton of the creature's own (the parents read from the rig)."""

    def __init__(self, rig):
        self.rig = rig
        self.bones = [(b.name, b.parent.name if b.parent else None) for b in rig.data.bones]
        self.rest = {b.name: b.matrix_local.to_quaternion() for b in rig.data.bones}

    def local(self, pose):
        world, rotations, places = {}, {}, {}
        for name, parent in self.bones:
            world[name] = pose.get(name, world[parent] if parent else Quaternion())
        for name, parent in self.bones:
            above = world[parent] if parent else Quaternion()
            delta = above.inverted() @ world[name]
            rotations[name] = self.rest[name].inverted() @ delta @ self.rest[name]
            moved = Vector(pose.get(f"@{name}", (0, 0, 0)))
            # (A pose bone's place is in its own resting axes, after its parent's turn.)
            places[name] = (above @ self.rest[name]).inverted() @ moved
        return rotations, places

    def key_all(self, actions):
        rig = self.rig
        rig.animation_data_create()
        for name, frames in actions.items():
            action = bpy.data.actions.new(name)
            rig.animation_data.action = action
            last = {}
            for frame, pose in frames:
                rotations, places = self.local(pose)
                for bone, q in rotations.items():
                    # (The shorter way round from the last key: q and -q are the same turn.)
                    if bone in last and last[bone].dot(q) < 0:
                        q = -q
                    last[bone] = q
                    pb = rig.pose.bones[bone]
                    pb.rotation_mode = "QUATERNION"
                    pb.rotation_quaternion = q
                    pb.location = places[bone]
                    pb.keyframe_insert("rotation_quaternion", frame=frame, group=bone)
                    pb.keyframe_insert("location", frame=frame, group=bone)
            # Each curve repeats, so its ends meet smoothly when the game loops the action.
            for curve in _fcurves(action):
                curve.modifiers.new("CYCLES")
                curve.update()
            track = rig.animation_data.nla_tracks.new()
            track.name = name
            track.strips.new(name, int(frames[0][0]), action)
            rig.animation_data.action = None
        for pb in rig.pose.bones:
            pb.rotation_quaternion = Quaternion()
            pb.location = (0, 0, 0)


def field(m, p, group="body"):
    """How strongly the metaballs of `group` hold the point p: at least wwblend.THRESHOLD is inside."""
    total = 0.0
    for element in m.elements:
        if element[4] == group:
            f = wwblend.STIFF * m._field(p, element)
            total += -f if element[3] else f
    return total


def surface(m, origin, direction, group="body", step=0.008, reach=3.0):
    """Where a ray from `origin` (inside the body) along `direction` comes out of its skin."""
    origin, direction = Vector(origin), Vector(direction).normalized()
    d = 0.0
    while d < reach and field(m, origin + direction * (d + step), group) >= wwblend.THRESHOLD:
        d += step
    return origin + direction * d


def rope(m, points, r0, r1, colour, bone, sides=5):
    """One smooth tube along `points` (a vine, a root, a tendril), from radius r0 to r1, closed at its root
    and drawn to a point past its end: cheaper than `Model.strand`, which joins straight tubes with balls."""
    points = [Vector(p) for p in points]
    n = len(points)
    bm = bmesh.new()
    tangent = (points[1] - points[0]).normalized()
    normal = tangent.orthogonal().normalized()
    rings = []
    for i, p in enumerate(points):
        ahead = points[min(i + 1, n - 1)] - points[max(i - 1, 0)]
        new_tangent = ahead.normalized()
        # (Carried along the bends, so the tube doesn't twist.)
        normal = (normal - new_tangent * normal.dot(new_tangent)).normalized()
        tangent = new_tangent
        binormal = tangent.cross(normal)
        r = r0 + (r1 - r0) * i / (n - 1)
        rings.append([bm.verts.new(p + (normal * math.cos(a) + binormal * math.sin(a)) * r) for a in (2 * math.pi * k / sides for k in range(sides))])
    bm.faces.new(list(reversed(rings[0])))
    for a, b in zip(rings, rings[1:]):
        for k in range(sides):
            bm.faces.new((a[k], a[(k + 1) % sides], b[(k + 1) % sides], b[k]))
    tip = bm.verts.new(points[-1] + tangent * r1 * 1.5)
    for k in range(sides):
        bm.faces.new((rings[-1][k], rings[-1][(k + 1) % sides], tip))
    m._add_bm(bm, colour, bone, smooth=True)
