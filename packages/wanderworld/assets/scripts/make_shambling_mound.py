"""Shambling mound (SRD: Large plant): a hulking heap of rotting vegetation about 2.4 m tall, roughly the
shape of a stooped giant: a lumpy mass of moss, mulch and dead leaves bound in writhing vines, a hunched
head-mass with only a dark hollow where a face would be and two faint glints deep inside it, long arms
of twisted vine that end in whipping tendrils, and two stumpy legs like rotten trunks splaying into roots.
Its own skeleton (hips, spine, chest, head-mass, two three-bone vine arms, two two-bone legs) and actions:
Idle (heaving, swaying), Walk and Run (a dragging lurch) and Attack (a vine arm whipped up over its head
and slammed down). Writes assets/models/shambling_mound.glb. Run (BLENDER: your Blender executable):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_shambling_mound.py
"""

import math
import os
import random
import sys

import bpy

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wwblend import Vector, at, shade, turn  # noqa: E402
from wwcreature import Creature, rope, surface  # noqa: E402

bpy.ops.wm.read_factory_settings(use_empty=True)
random.seed(11)

MOSS = 0x4E6B2E
MOSS_DARK = 0x34481E
OLIVE = 0x6B6A34
ROT = 0x4A3A22
MUD = 0x33281A
VINE = 0x5A6A2A
VINE_DARK = 0x3C4A1C
LEAF = 0x5F7F2F
LEAF_DEAD = 0x8A7A3A
FUNGUS = 0x9A7A4A
HOLLOW = 0x0E0A06
GRASS = 0x7A7440
GLINT = 0xD8E870

m = Creature("shambling_mound", resolution=0.028, faces=7000)

# ── The skeleton ──
SHOULDER, ELBOW, WRIST, HAND = (0.6, 1.82, 0.06), (0.86, 1.28, 0.12), (0.96, 0.74, 0.14), (1.0, 0.3, 0.16)
HIP, KNEE, ANKLE = (0.28, 0.86, 0.0), (0.31, 0.46, 0.03), (0.33, 0.1, 0.03)
bones = [
    ("Root", None, at(0, 0, 0), at(0, 0, 0.4)),
    ("Hips", "Root", at(0, 0.9, 0), at(0, 1.3, 0.02)),
    ("Spine", "Hips", at(0, 1.3, 0.02), at(0, 1.68, 0.08)),
    ("Chest", "Spine", at(0, 1.68, 0.08), at(0, 1.95, 0.18)),
    ("Head", "Chest", at(0, 1.95, 0.18), at(0, 2.35, 0.3)),
]
for side, sx in (("L", 1), ("R", -1)):

    def j(p):
        return at(sx * p[0], p[1], p[2])

    bones += [
        (f"Arm{side}1", "Chest", j(SHOULDER), j(ELBOW)),
        (f"Arm{side}2", f"Arm{side}1", j(ELBOW), j(WRIST)),
        (f"Arm{side}3", f"Arm{side}2", j(WRIST), j(HAND)),
        (f"Leg{side}1", "Hips", j(HIP), j(KNEE)),
        (f"Leg{side}2", f"Leg{side}1", j(KNEE), j(ANKLE)),
    ]
m.rig(bones)


def ell(c, across, up, depth, colour, negative=False):
    m.ellipsoid(at(*c), (across, depth, up), colour, negative)


def ball(c, r, colour, negative=False):
    m.ball(at(*c), r, colour, negative)


def cap(a, b, r, colour):
    m.capsule(at(*a), at(*b), r, colour)


# ── The mass: hips, a bulging trunk, hulking shoulders, the head-mass sunk forward between them, and a
# skirt of sodden clumps hanging over the legs. ──
ell((0, 0.98, 0), 0.46, 0.3, 0.38, ROT)
ell((0, 1.36, 0.04), 0.56, 0.4, 0.46, MOSS)
ell((0, 1.76, 0.06), 0.62, 0.3, 0.46, MOSS_DARK)
ell((0, 2.02, 0.28), 0.3, 0.26, 0.28, MOSS)
for sx in (1, -1):
    ball((sx * 0.5, 1.9, 0.02), 0.29, OLIVE)
    ball((sx * 0.28, 2.04, -0.02), 0.22, MOSS_DARK)
for k in range(12):
    a = 2 * math.pi * (k + 0.5) / 12
    if abs(math.sin(a)) < 0.3:
        continue  # (nothing hangs between the legs, so they swing free)
    ell((math.sin(a) * 0.4, 0.74 + random.uniform(-0.05, 0.05), math.cos(a) * 0.32), 0.15, 0.24, 0.14, random.choice((ROT, MUD, MOSS_DARK)))
# Lumps of moss, mulch and rot all over it.
for k in range(110):
    a = random.uniform(0, 2 * math.pi)
    y = random.uniform(0.8, 2.2)
    rx = 0.44 if y < 1.15 else (0.52 if y < 1.55 else 0.58)
    if y > 1.95:
        rx = 0.3
        if math.cos(a) > 0.5:
            continue  # (not over the face)
    centre = (math.sin(a) * rx * 0.92, y, (0.28 if y > 1.95 else 0.05) + math.cos(a) * rx * 0.78)
    ball(centre, random.uniform(0.09, 0.19), random.choice((MOSS, MOSS_DARK, OLIVE, ROT, MUD, GRASS)))
# The face: only a deep dark hollow under an overhang of mulch.
ell((0, 2.0, 0.5), 0.17, 0.14, 0.17, HOLLOW, negative=True)
ell((0, 2.18, 0.42), 0.24, 0.08, 0.12, ROT)

# The vine arms: thick at the shoulder, twisted thinner to the wrist, clumps of moss on them.
for sx in (1, -1):

    def jp(p, sx=sx):
        return (sx * p[0], p[1], p[2])

    cap(jp(SHOULDER), jp(ELBOW), 0.16, MOSS_DARK)
    ball(jp(ELBOW), 0.14, ROT)
    cap(jp(ELBOW), jp(WRIST), 0.115, VINE_DARK)
    cap(jp(WRIST), jp((0.98, 0.56, 0.15)), 0.08, VINE_DARK)
    for t in (0.25, 0.6):
        ball(jp((SHOULDER[0] + (ELBOW[0] - SHOULDER[0]) * t, SHOULDER[1] + (ELBOW[1] - SHOULDER[1]) * t, 0.1)), 0.13, random.choice((MOSS, OLIVE)))
    for k in range(7):
        t = random.uniform(0.05, 1.0)
        a, b = (SHOULDER, ELBOW) if k < 4 else (ELBOW, WRIST)
        c = [a[i] + (b[i] - a[i]) * t for i in range(3)]
        ang = random.uniform(0, 2 * math.pi)
        r = 0.12 if k < 4 else 0.085
        ball(jp((c[0] + math.cos(ang) * r * 0.6, c[1], c[2] + math.sin(ang) * r * 0.6)), random.uniform(0.06, 0.1), random.choice((MOSS, OLIVE, MOSS_DARK, ROT)))
    # The legs: stumpy rotten trunks, splaying into roots on the ground.
    cap(jp(HIP), jp(KNEE), 0.21, ROT)
    cap(jp(KNEE), jp((0.33, 0.22, 0.03)), 0.19, MUD)
    ell(jp((0.34, 0.1, 0.07)), 0.25, 0.08, 0.28, MUD)

# ── Hard parts, placed on its skin ──


def bone_at(y):
    return "Hips" if y < 1.18 else "Spine" if y < 1.58 else "Chest" if y < 1.97 else "Head"


def centre_at(y):
    """The middle of the mass at height y: it leans forward into the head-mass at the top."""
    t = min(1.0, max(0.0, (y - 1.75) / 0.3))
    return at(0, y, 0.05 + 0.23 * t * t * (3 - 2 * t))


def skin(a, y, out=0.0, tilt=0.0):
    """A point on the skin of the body mass, round from the front by angle a at height y."""
    direction = at(math.sin(a), tilt, math.cos(a))
    p = surface(m, centre_at(y), direction)
    return p + direction.normalized() * out


def vine(points, r0, r1, bone, colour=VINE, sides=5):
    rope(m, points, r0, r1, colour, bone, sides)


def wavy(start, end, steps, wobble, bend=(0, 0, 0)):
    """Points from start to end, wandering by `wobble` and sagging along `bend`."""
    start, end, bend = Vector(start), Vector(end), Vector(bend)
    phase = random.uniform(0, 6.3)
    side = (end - start).orthogonal().normalized()
    other = (end - start).normalized().cross(side)
    return [
        start.lerp(end, t) + bend * math.sin(t * math.pi) + (side * math.sin(phase + t * 7) + other * math.cos(phase + t * 5)) * wobble * t
        for t in (k / steps for k in range(steps + 1))
    ]


# Vines winding round the mass.
for k in range(10):
    a0 = random.uniform(0, 2 * math.pi)
    y0 = random.uniform(0.95, 1.9)
    sweep = random.uniform(1.4, 2.4) * random.choice((1, -1))
    rise = random.uniform(-0.35, 0.35)
    points = [skin(a0 + sweep * u / 14, y0 + rise * u / 14, out=-0.004) for u in range(15)]
    vine(points, random.uniform(0.026, 0.036), 0.018, bone_at(y0 + rise / 2), random.choice((VINE, VINE_DARK)))
# Vines and strands of moss hanging off it.
for k in range(34):
    a = random.uniform(0, 2 * math.pi)
    y = random.uniform(1.0, 2.0)
    root = skin(a, y, out=-0.02)
    out = (root - centre_at(y)).normalized()
    length = random.uniform(0.3, 0.75)
    end = root + out * 0.1 + Vector((0, 0, -length))
    vine(wavy(root, end, 5, 0.04, out * 0.06), random.uniform(0.02, 0.035), 0.006, bone_at(y), random.choice((VINE, VINE_DARK, MOSS_DARK, GRASS)), sides=4)
# Big rotting leaves stuck all over it.
for k in range(110):
    a = random.uniform(0, 2 * math.pi)
    y = random.uniform(0.6, 2.25)
    if y > 1.9 and math.cos(a) > 0.6:
        continue  # (the face stays a hollow)
    root = skin(a, y, out=-0.03)
    out = (root - centre_at(y)).normalized()
    size = random.uniform(0.18, 0.32)
    tip = root + out * size * 0.35 + Vector((random.uniform(-0.08, 0.08), random.uniform(-0.08, 0.08), -size * 0.9))
    m.leaf(root, tip, size * 0.5, 0.01, random.choice((LEAF, LEAF_DEAD, OLIVE, shade(LEAF, 0.75), ROT)), bone_at(y), out, bend=out * size * 0.15, steps=3)
# Shelf fungus on its flanks.
for sx in (1, -1):
    for k in range(3):
        root = skin(sx * random.uniform(1.0, 2.2), 1.5 + k * 0.13, out=-0.005)
        m.sphere(root, (0.08, 0.08, 0.024), shade(FUNGUS, 1 - 0.08 * k), "Spine" if k < 2 else "Chest", segments=8, rings=4)
# Glints deep in the hollow.
for sx in (1, -1):
    m.sphere(at(sx * 0.07, 2.01, 0.42), (0.024, 0.018, 0.018), GLINT, "Head", segments=6, rings=4)

# The arms: vines twisting round them, moss hanging off them, and long whipping tendrils off each end.
for side, sx in (("L", 1), ("R", -1)):
    for seg, (a, b, r) in enumerate(((SHOULDER, ELBOW, 0.16), (ELBOW, WRIST, 0.115))):
        pa, pb = at(sx * a[0], a[1], a[2]), at(sx * b[0], b[1], b[2])
        axis = (pb - pa).normalized()
        side_a = axis.cross(Vector((0, 1, 0))).normalized()
        side_b = axis.cross(side_a)
        for twist in (0, 2.1, 4.2):
            points = []
            for u in range(8):
                t = u / 7
                ang = twist + t * 2.6 * sx
                points.append(pa.lerp(pb, t) + (side_a * math.cos(ang) + side_b * math.sin(ang)) * r * 0.97)
            vine(points, 0.035, 0.03, f"Arm{side}{seg + 1}", random.choice((VINE, GRASS)))
        for k in range(6):
            t, ang = random.uniform(0.1, 0.95), random.uniform(0, 2 * math.pi)
            out = side_a * math.cos(ang) + side_b * math.sin(ang)
            root = pa.lerp(pb, t) + out * r * 0.85
            size = random.uniform(0.14, 0.24)
            m.leaf(root, root + out * size * 0.4 + Vector((0, 0, -size * 0.85)), size * 0.5, 0.01, random.choice((LEAF, LEAF_DEAD, OLIVE)), f"Arm{side}{seg + 1}", out, steps=3)
        for k in range(4):
            root = pa.lerp(pb, random.uniform(0.2, 0.9)) + side_b * r * random.choice((-0.9, 0.9))
            vine(wavy(root, root + Vector((0, 0, -random.uniform(0.2, 0.45))), 4, 0.03), 0.02, 0.005, f"Arm{side}{seg + 1}", random.choice((MOSS_DARK, GRASS)), sides=4)
    wrist = at(sx * 0.97, 0.62, 0.15)
    for k in range(4):
        a = k / 4 * 2 * math.pi + 0.4
        spread = Vector((math.cos(a), math.sin(a), 0)) * 0.05
        end = wrist + spread * 4 + Vector((sx * 0.06, -0.06, -0.5 - random.uniform(0, 0.07)))
        vine(wavy(wrist + spread, end, 7, 0.07, spread * 1.5), 0.045, 0.01, f"Arm{side}3", random.choice((VINE, VINE_DARK)), sides=5)
    # Roots splaying from each foot over the ground.
    foot = at(sx * 0.34, 0.08, 0.07)
    for k in range(6):
        a = -1.2 + 2.4 * k / 5
        d = Vector((math.sin(a) * sx * 0.6 + sx * 0.4, -math.cos(a), 0)).normalized()
        vine([foot + d * 0.15 + Vector((0, 0, 0.05)), foot + d * 0.28 + Vector((0, 0, 0.025)), foot + d * 0.4 + Vector((0, 0, 0.012))], 0.045, 0.014, f"Leg{side}2", MUD)


# ── Actions ──


def pose(hips=(0, 0, 0), lift=0.0, spine=(0, 0), head=(0, 0), legs=(0, 0), knees=(6, 6), arms=None):
    """Hips turned (pitch, roll, twist) and raised `lift`; the spine and head bent (forward, aside) on top;
    legs swung (forward below 0) with knees bent; arms {side: (swing, out, whip)}: swung forward (below 0)
    and out from the body, each segment lagging by `whip`."""
    pitch, roll, twist = hips
    h = turn("z", twist) @ turn("x", pitch) @ turn("y", roll)
    s = h @ turn("x", spine[0]) @ turn("y", spine[1])
    c = s @ turn("x", spine[0] * 0.6)
    p = {"Hips": h, "@Hips": Vector((0, 0, lift)), "Spine": s, "Chest": c, "Head": c @ turn("x", head[0]) @ turn("y", head[1])}
    for side, sign, swing, knee in (("L", 1, legs[0], knees[0]), ("R", -1, legs[1], knees[1])):
        thigh = turn("z", twist * 0.3) @ turn("x", swing)
        p[f"Leg{side}1"] = thigh
        p[f"Leg{side}2"] = thigh @ turn("x", knee)
    arms = arms or {}
    for side, sign in (("L", 1), ("R", -1)):
        swing, out, whip = arms.get(side, (0, 0, 0))
        base = c @ turn("y", sign * -out)
        p[f"Arm{side}1"] = base @ turn("x", swing)
        p[f"Arm{side}2"] = base @ turn("x", swing + whip)
        p[f"Arm{side}3"] = base @ turn("x", swing + whip * 2.2)
    return p


idle = []
for k in range(5):
    u = k / 4
    s = math.sin(u * 2 * math.pi)
    c = math.cos(u * 2 * math.pi)
    idle.append(
        (
            1 + 89 * u,
            pose(
                hips=(0, 1.5 * c, 2 * s),
                lift=0.012 * s,
                spine=(4 + 2.5 * s, 0),
                head=(3 + 2 * s, 4 * c),
                arms={"L": (3 * s, 2 + 2 * c, 4 * s), "R": (-3 * s, 2 - 2 * c, -4 * s)},
            ),
        )
    )
idle[-1] = (90, idle[0][1])


def gait(frames, swing, lean, lurch, arm_swing, bob):
    keys = []
    for k in range(9):
        u = k / 8
        s = math.sin(u * 2 * math.pi)
        c = math.cos(u * 2 * math.pi)
        keys.append(
            (
                1 + (frames - 1) * u,
                pose(
                    hips=(lean * 0.4, lurch * s, lurch * 0.8 * s),
                    lift=bob * abs(c) - bob * 0.5,
                    spine=(lean, -lurch * 0.6 * s),
                    head=(6 - 3 * abs(c), lurch * 0.8 * s),
                    legs=(-swing * s, swing * s),
                    knees=(8 + max(0, s) * swing * 0.9, 8 + max(0, -s) * swing * 0.9),
                    arms={"L": (arm_swing * s, 6, 10 * c), "R": (-arm_swing * s, 6, -10 * c)},
                ),
            )
        )
    keys[-1] = (frames, keys[0][1])
    return keys


walk = gait(42, swing=18, lean=6, lurch=6, arm_swing=14, bob=0.04)
run = gait(26, swing=28, lean=14, lurch=8, arm_swing=26, bob=0.07)

# Attack: the right vine-arm drawn up and back over the head, then whipped down in front to the ground,
# its end lagging and cracking after.
rest = {"L": (0, 4, 0), "R": (0, 4, 0)}
attack = [
    (1, pose(spine=(4, 0), arms=rest)),
    (9, pose(hips=(-4, 0, -14), spine=(-6, -4), head=(-4, 0), arms={"L": (-15, 10, -5), "R": (-170, 12, 25)})),
    (13, pose(hips=(-5, 0, -16), spine=(-8, -4), head=(-4, 0), arms={"L": (-15, 10, -5), "R": (-205, 10, 15)})),
    (18, pose(hips=(4, 0, 12), spine=(9, 4), head=(6, 0), legs=(-10, 6), arms={"L": (10, 8, 5), "R": (-95, 6, -30)})),
    (22, pose(hips=(5, 0, 14), spine=(11, 4), head=(8, 0), legs=(-10, 6), arms={"L": (12, 8, 5), "R": (-62, 4, 15)})),
    (28, pose(hips=(3, 0, 5), spine=(8, 0), head=(4, 0), legs=(-4, 2), arms={"L": (5, 6, 2), "R": (-25, 4, 6)})),
    (34, pose(spine=(4, 0), arms=rest)),
]

m.finish(
    {"Idle": idle, "Walk": walk, "Run": run, "Attack": attack},
    bake={"size": 512, "ao": 0.18, "mottle": 0.18, "mottle_scale": 22, "dirt": 0.35},
)
