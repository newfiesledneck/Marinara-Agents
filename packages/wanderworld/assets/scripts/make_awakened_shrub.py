"""Awakened shrub (SRD: Small plant): an ordinary bush given sense and legs, about a metre tall: a round
leafy body with a few red berries on a short woody trunk that splits into three gnarled roots it waddles
on, and two twiggy arms ending in thorny fingers that rake. Its own skeleton (a body, two two-bone arms,
three two-bone root legs) and actions: Idle (swaying), Hidden (a plain bush, arms tucked into its leaves,
perfectly still), Walk and Run (a rocking waddle on its roots) and Attack (both arms raked down in front).
Writes assets/models/awakened_shrub.glb. Run (BLENDER: your Blender executable):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_awakened_shrub.py
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
random.seed(5)

LEAF = 0x4F7A2E
LEAF_LIGHT = 0x6E9A3A
LEAF_DARK = 0x355A22
BARK = 0x5E4429
BARK_DARK = 0x3E2C1C
BERRY = 0xA8322A

m = Creature("awakened_shrub", resolution=0.016, faces=2400)
m.group("foliage", resolution=0.018, faces=2600, bone="Body")
m.groups["body"]["bone"] = "Body"  # (the trunk: held by the body, as the leaves are)

# ── The skeleton ──
TRUNK = 0.26  # where the roots split from the trunk
CENTRE = (0, 0.64, 0)  # the middle of the leaves
LEGS = {"FL": 0.75, "FR": -0.75, "B": math.pi}  # each root leg's angle round from the front (to the left)
SHOULDER, ELBOW, HAND = (0.26, 0.6, 0.05), (0.45, 0.5, 0.1), (0.59, 0.4, 0.15)


def round_from(angle, r, up):
    return at(math.sin(angle) * r, up, math.cos(angle) * r)


bones = [
    ("Root", None, at(0, 0, 0), at(0, 0, 0.2)),
    ("Body", "Root", at(0, TRUNK, 0), at(0, 0.95, 0)),
]
for side, sx in (("L", 1), ("R", -1)):
    bones += [
        (f"Arm{side}1", "Body", at(sx * SHOULDER[0], *SHOULDER[1:]), at(sx * ELBOW[0], *ELBOW[1:])),
        (f"Arm{side}2", f"Arm{side}1", at(sx * ELBOW[0], *ELBOW[1:]), at(sx * HAND[0], *HAND[1:])),
    ]
for name, angle in LEGS.items():
    hip, knee, toe = round_from(angle, 0.06, TRUNK - 0.02), round_from(angle, 0.2, 0.16), round_from(angle, 0.31, 0.02)
    bones += [(f"Leg{name}1", "Body", hip, knee), (f"Leg{name}2", f"Leg{name}1", knee, toe)]
m.rig(bones)

# ── The leaves: a round lumpy bush, a little wider than tall, thick with leaves and a few berries. ──
F = {"group": "foliage"}
m.ellipsoid(at(*CENTRE), (0.33, 0.3, 0.29), LEAF_DARK, **F)
for k in range(64):
    a = random.uniform(0, 2 * math.pi)
    up = random.uniform(-0.75, 0.95)
    d = Vector((math.cos(a) * math.sqrt(1 - up * up), math.sin(a) * math.sqrt(1 - up * up), up))
    c = at(*CENTRE) + Vector((d.x * 0.31, d.y * 0.28, d.z * 0.28))
    m.ball(c, random.uniform(0.065, 0.11), random.choice((LEAF, LEAF_DARK, LEAF_LIGHT)), **F)

# The trunk under it, its branches reaching up into the leaves, and the roots it walks on.
m.capsule(at(0, TRUNK - 0.03, 0), at(0, 0.42, 0.0), 0.055, BARK)
m.ball(at(0, TRUNK - 0.01, 0), 0.07, BARK_DARK)
for k in range(4):
    a = k * math.pi / 2 + 0.6
    base = at(0, 0.36, 0)
    rope(m, [base, base + Vector((math.cos(a) * 0.08, math.sin(a) * 0.08, 0.12)), base + Vector((math.cos(a) * 0.17, math.sin(a) * 0.17, 0.2))], 0.03, 0.012, BARK, "Body", 5)
for name, angle in LEGS.items():
    upper, lower = f"Leg{name}1", f"Leg{name}2"
    hip, knee, toe = m.joints[upper], m.joints[lower], m.tails[lower]
    arch = Vector((0, 0, 0.02))
    rope(m, [hip, hip.lerp(knee, 0.5) + arch, knee], 0.05, 0.04, BARK, upper, 6)
    m.sphere(knee, (0.04,) * 3, BARK, upper, segments=6, rings=4)
    rope(m, [knee, knee.lerp(toe, 0.5) + arch * 0.5, toe], 0.04, 0.022, BARK_DARK, lower, 6)
    # Rootlets off each foot.
    out = (toe - at(0, 0, 0)).normalized()
    for k in (-1, 1):
        side = out.cross(Vector((0, 0, 1))) * k
        start = knee.lerp(toe, 0.7)
        rope(m, [start, start + (out + side) * 0.05 + Vector((0, 0, -0.02)), start + (out + side * 1.4) * 0.09 + Vector((0, 0, -0.035))], 0.014, 0.005, BARK_DARK, lower, 4)

# The twig arms: thin and crooked, with three thorny fingers and a sprig of leaves.
for side, sx in (("L", 1), ("R", -1)):
    s, e, h = (at(sx * p[0], p[1], p[2]) for p in (SHOULDER, ELBOW, HAND))
    rope(m, [s, s.lerp(e, 0.5) + Vector((0, 0, 0.015)), e], 0.036, 0.028, BARK, f"Arm{side}1", 6)
    m.sphere(e, (0.03,) * 3, BARK, f"Arm{side}1", segments=6, rings=4)
    rope(m, [e, e.lerp(h, 0.5) + Vector((0, -0.01, 0.01)), h], 0.028, 0.02, BARK, f"Arm{side}2", 6)
    # A broken-off twig at the elbow.
    rope(m, [e, e + Vector((0, 0.01, 0.06)) + (h - e) * 0.2], 0.012, 0.004, BARK_DARK, f"Arm{side}1", 4)
    forward = (h - e).normalized()
    for k in (-1, 0, 1):
        spread = Vector((0, -0.035 * k, 0.025 * k))
        tip = h + forward * 0.09 + spread + Vector((0, -0.03, -0.04))
        rope(m, [h, h + forward * 0.05 + spread * 0.6, tip], 0.014, 0.004, BARK_DARK, f"Arm{side}2", 4)
    for k in range(3):
        root = s.lerp(e, 0.4 + 0.25 * k)
        m.leaf(root, root + Vector((sx * 0.02, -0.03, 0.08)), 0.05, 0.006, LEAF_LIGHT, f"Arm{side}1", (0, -1, 0.3), steps=3)

# Leaves all over the bush, and berries among them.
centre = at(*CENTRE)
for k in range(380):
    a = random.uniform(0, 2 * math.pi)
    up = random.uniform(-0.55, 1.0)
    d = Vector((math.cos(a) * math.sqrt(1 - up * up), math.sin(a) * math.sqrt(1 - up * up), up))
    root = surface(m, centre, d, group="foliage") - d * 0.02
    size = random.uniform(0.09, 0.14)
    # Lying over the bush like shingles, drooping a little, its tip lifted off the leaves under it.
    v = Vector((random.uniform(-1, 1), random.uniform(-1, 1), random.uniform(-1, 1) - 0.6))
    along = (v - d * v.dot(d)).normalized()
    tip = root + (along * 0.85 + d * 0.4).normalized() * size
    colour = random.choice((LEAF, LEAF_LIGHT, LEAF_DARK, shade(LEAF_LIGHT, 1.12)))
    m.leaf(root, tip, size * 0.62, 0.006, colour, "Body", d, bend=d * size * 0.12, steps=3)
for k in range(9):
    a = random.uniform(0, 2 * math.pi)
    up = random.uniform(-0.2, 0.8)
    d = Vector((math.cos(a) * math.sqrt(1 - up * up), math.sin(a) * math.sqrt(1 - up * up), up))
    p = surface(m, centre, d, group="foliage") + d * 0.008
    for j in range(3):
        m.sphere(p + Vector((random.uniform(-0.02, 0.02), random.uniform(-0.02, 0.02), random.uniform(-0.02, 0.01))), (0.017,) * 3, BERRY if j else shade(BERRY, 0.8), "Body", segments=6, rings=4)


# ── Actions ──


def pose(lift=0.0, pitch=0.0, roll=0.0, twist=0.0, feet=None, arms=None):
    """The bush raised `lift`, leaning by `pitch` (forward, above 0), `roll` and `twist`; each root reaching
    for its foot in `feet` ({leg: (x, up, forward)}; None: where it rests, turned with the body); arms
    {side: (upper, lower)} each pointed along (x towards the side, up, forward), or tucked in ("tuck")."""
    body = turn("z", twist) @ turn("x", pitch) @ turn("y", roll)
    p = {"Body": body, "@Body": Vector((0, 0, lift))}
    base = m.joints["Body"]
    for name, angle in LEGS.items():
        upper, lower = f"Leg{name}1", f"Leg{name}2"
        if feet is None:
            continue
        hip = base + body @ (m.joints[upper] - base) + Vector((0, 0, lift))
        p.update(m.leg(upper, lower, hip, at(*feet[name]), round_from(angle, 1, 0.8)))
    for side, sx in (("L", 1), ("R", -1)):
        arm = (arms or {}).get(side)
        if arm is None:
            continue
        if arm == "tuck":
            # Folded in among the leaves, as a bush has no arms.
            arm = ((-0.9, 0.35, -0.1), (-0.2, 1, -0.3))
        (ux, uy, uf), (lx, ly, lf) = arm
        p[f"Arm{side}1"] = body @ m.aim(f"Arm{side}1", at(sx * ux, uy, uf))
        p[f"Arm{side}2"] = body @ m.aim(f"Arm{side}2", at(sx * lx, ly, lf))
    return p


REST_FEET = {name: (math.sin(a) * 0.31, 0.02, math.cos(a) * 0.31) for name, a in LEGS.items()}


def arms_at(swing_l, swing_r, lift=0.0):
    """The arms hanging a little out, swung forward (above 0) or back, and raised by `lift`."""
    return {
        "L": ((1, -0.5 + lift, 0.25 + swing_l), (0.8, -0.75 + lift, 0.35 + swing_l * 1.3)),
        "R": ((1, -0.5 + lift, 0.25 + swing_r), (0.8, -0.75 + lift, 0.35 + swing_r * 1.3)),
    }


idle = []
for k in range(5):
    u = k / 4
    s, c = math.sin(u * 2 * math.pi), math.cos(u * 2 * math.pi)
    idle.append((1 + 59 * u, pose(lift=0.006 * s, pitch=1.5 * s, roll=2.5 * c, feet=REST_FEET, arms=arms_at(0.1 * s, -0.1 * s, 0.05 * c))))
idle[-1] = (60, idle[0][1])
still = pose(feet=REST_FEET, arms={"L": "tuck", "R": "tuck"})
hidden = [(1, still), (30, still)]


def gait(frames, stride, rise, rock, bob, swing):
    """A waddle: the bush rocks onto one side and the other while each root steps in turn."""
    keys = []
    order = {"FL": 0.0, "FR": 0.5, "B": 0.25}
    for k in range(13):
        u = k / 12
        feet = {}
        for name, angle in LEGS.items():
            v = (u + order[name]) % 1
            if v < 0.7:
                along, up = stride * (0.5 - v / 0.7), 0.0
            else:
                w = (v - 0.7) / 0.3
                along, up = stride * (-0.5 + w), rise * math.sin(w * math.pi)
            x, y, f = REST_FEET[name]
            feet[name] = (x, y + up, f + along)
        s = math.sin(u * 2 * math.pi)
        keys.append(
            (
                1 + (frames - 1) * u,
                pose(
                    lift=bob * abs(math.cos(u * 2 * math.pi)) - bob * 0.3,
                    pitch=3 + rock * 0.2,
                    roll=rock * s,
                    twist=rock * 0.5 * s,
                    feet=feet,
                    arms=arms_at(swing * s, -swing * s, 0.1),
                ),
            )
        )
    keys[-1] = (frames, keys[0][1])
    return keys


walk = gait(24, stride=0.14, rise=0.06, rock=9, bob=0.025, swing=0.25)
run = gait(15, stride=0.22, rise=0.09, rock=13, bob=0.045, swing=0.45)

# Attack: both arms drawn up and back, then raked down across the front as the bush lunges.
up = {"L": ((0.6, 0.8, -0.1), (0.3, 1, 0.3)), "R": ((0.6, 0.8, -0.1), (0.3, 1, 0.3))}
high = {"L": ((0.5, 0.75, 0.45), (0.2, 0.6, 1)), "R": ((0.5, 0.75, 0.45), (0.2, 0.6, 1))}
rake = {"L": ((0.4, -0.2, 1), (0.05, -1, 0.4)), "R": ((0.4, -0.2, 1), (0.05, -1, 0.4))}
low = {"L": ((0.5, -0.6, 0.6), (0.2, -1, -0.1)), "R": ((0.5, -0.6, 0.6), (0.2, -1, -0.1))}
rest_arms = arms_at(0, 0)
attack = [
    (1, pose(feet=REST_FEET, arms=rest_arms)),
    (8, pose(lift=0.02, pitch=-8, feet=REST_FEET, arms=up)),
    (12, pose(lift=0.03, pitch=-4, feet=REST_FEET, arms=high)),
    (16, pose(pitch=14, feet=REST_FEET, arms=rake)),
    (20, pose(pitch=12, feet=REST_FEET, arms=low)),
    (28, pose(feet=REST_FEET, arms=rest_arms)),
]

m.finish(
    {"Idle": idle, "Hidden": hidden, "Walk": walk, "Run": run, "Attack": attack},
    bake={"size": 512, "ao": 0.06, "mottle": 0.14, "mottle_scale": 60, "dirt": 0.2},
)
