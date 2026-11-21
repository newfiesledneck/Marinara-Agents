"""Troll (SRD: Large giant): a tall, gangly brute about 2.4 metres tall even stooped, with a hunched back,
sagging shoulders and arms that hang past its knees to huge clawed hands; mossy green-grey warty hide, a
long drooping nose, small eyes sunk under a heavy brow, a wide underbite of crooked teeth and tusks, a
matted mass of dark hair, great three-toed clawed feet and a tattered loincloth. Writes
assets/models/troll.glb. Run (BLENDER: your Blender executable):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_troll.py
"""

import math
import os
import random
import sys

import bpy

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wwblend import STIFF, THRESHOLD, Model, Vector, at, humanoid_actions, humanoid_body, humanoid_joints, shade  # noqa: E402

bpy.ops.wm.read_factory_settings(use_empty=True)

SKIN = 0x6C7A5A
BELLY = 0x8A8C6C
BACK = shade(SKIN, 0.82)
WART = 0x56623F
WART_PALE = 0x8E9468
LIPS = 0x5A5440
SOCKET = 0x1E1A14
MOUTH = 0x2A1612
TEETH = 0xCFC196
TUSK = 0xD8CCA4
EYE = 0xC8902C
PUPIL = 0x140C06
HAIR = 0x262E1E
HAIR_DARK = 0x1A2014
HIDE = 0x4E3E2C
HIDE_DARK = 0x3E3022
ROPE = 0x3A3022
p = {
    "leg": 1.25,
    "torso": 0.9,
    "neck": -0.02,
    "shoulders": 0.62,
    "hips": 0.3,
    "arm": 1.3,
    "thick": 1.02,
    "chest": (0.22, 0.155),
    "waist": (0.15, 0.115),
    "hunch": 0.48,
    "hand": 1.6,
    "foot": 1.5,
    "fingers": 1.6,
    "toes": 1.4,
    "claws": True,
}
m = Model("troll", resolution=0.012, faces=6500)
m.group("head", resolution=0.0075, faces=5200, bone="Head")
m.rig(humanoid_joints(p))
b = humanoid_body(m, p, {"skin": SKIN, "nails": 0x2A2420})
s, t, arm_y, sx, hx, chest_y, h, f = b["s"], b["t"], b["arm_y"], b["sx"], b["hx"], b["chest_y"], b["h"], b["f"]
hips, torso, hunch = p["leg"], p["torso"], p["hunch"]
(chest_x, chest_z), (waist_x, waist_z) = p["chest"], p["waist"]
hy = b["head_y"] + 0.11
hz = hunch + 0.06


def ell(c, across, up, depth, colour=SKIN, negative=False, group="body"):
    m.ellipsoid(at(*c), (across, depth, up), colour, negative, group=group)


def ball(c, r, colour=SKIN, negative=False, group="body"):
    m.ball(at(*c), r, colour, negative, group=group)


def cap(a, c, r, colour=SKIN, negative=False, group="body"):
    m.capsule(at(*a), at(*c), r, colour, negative, group=group)


def surface(origin, direction, group="body"):
    """Where a ray from `origin` (inside the skin, game coordinates) along `direction` leaves the metaball
    skin built so far, in Blender coordinates; and the ray's direction."""
    elements = [e for e in m.elements if e[4] == group]

    def inside(q):
        return STIFF * sum((-1 if e[3] else 1) * m._field(q, e) for e in elements) > THRESHOLD

    o, d = at(*origin), at(*direction).normalized()
    near, far = 0.0, 0.0
    while inside(o + d * far) and far < 1.0:
        near, far = far, far + 0.008
    for _ in range(10):
        mid = (near + far) / 2
        near, far = (mid, far) if inside(o + d * mid) else (near, mid)
    return o + d * near, d


H = {"group": "head"}


def hp(x, y, z):
    """A point on the head, from its centre."""
    return (x, hy + y, hz + z)


def on_head(x, y, direction=(0, 0, 1), depth=0.0):
    """Where the head's skin is, straight out from (x, y) on the head's middle; `depth` in from there."""
    q, d = surface(hp(x * 0.5, y, 0.0), direction, "head")
    return q - d * depth


# ── The head: a low sloping skull, a heavy brow knotted over small sunken eyes, a long nose drooping
# over a wide mouth, a heavy jutting jaw with tusks standing up past the upper lip. ──
ell(hp(0, 0.04, -0.045), 0.105, 0.1, 0.12, **H)
ell(hp(0, -0.05, 0.035), 0.09, 0.085, 0.1, **H)
ell(hp(0, -0.125, 0.055), 0.098, 0.045, 0.095, **H)
ell(hp(0, -0.15, 0.11), 0.055, 0.032, 0.04, **H)
ell(hp(0, 0.028, 0.08), 0.098, 0.026, 0.045, shade(SKIN, 0.94), **H)
for sign in (1, -1):
    cap(hp(0, 0.02, 0.11), hp(sign * 0.07, 0.04, 0.09), 0.016, shade(SKIN, 0.94), **H)
    ball(hp(sign * 0.068, -0.03, 0.075), 0.02, **H)
# Matted hair: a mass over the crown and the back of the skull, and on it clumps lying back and down, a
# few falling over the brow and longer locks lying down the back of the head.
ell(hp(0, 0.065, -0.07), 0.11, 0.085, 0.118, HAIR, **H)
rng = random.Random(7)
clumps = []
for ring_, (lift, count) in enumerate(((0.95, 5), (0.6, 8), (0.25, 10), (-0.15, 9))):
    for i in range(count):
        a0 = math.pi * (0.15 + 0.7 * (i + 0.5 * (ring_ % 2)) / count) * 2 - math.pi
        direction = (math.sin(a0) * (1 - abs(lift) * 0.6), lift, math.cos(a0) * (1 - abs(lift) * 0.6) - 0.35)
        q, d = surface(hp(0, 0.03, -0.05), direction, "head")
        if (q - at(*hp(0, 0, 0))).dot(at(0, 0, 1)) > 0.07:
            continue  # (not over the face)
        flow = (at(0, -1, -0.8) - d * at(0, -1, -0.8).dot(d)).normalized()
        long_ = 0.035 + rng.random() * 0.03
        clumps.append((q - d * 0.012 - flow * long_ * 0.3, q - d * 0.014 + flow * long_, 0.021 + rng.random() * 0.008))
for side in (-1, 1):
    q, d = surface(hp(side * 0.04, 0.05, 0.0), (side * 0.5, 0.6, 0.5), "head")
    clumps.append((q - d * 0.012, q - d * 0.01 + at(side * 0.02, -0.05, 0.03), 0.018))
for i, (x, length) in enumerate(((-0.08, 0.06), (-0.04, 0.09), (0.0, 0.08), (0.04, 0.1), (0.08, 0.06))):
    q, d = surface(hp(x * 0.5, -0.02, -0.04), (x * 6, -0.1, -1), "head")
    clumps.append((q - d * 0.016 + at(0, 0.04, 0), q - d * 0.004 + at(x * 0.3, -length, -0.03), 0.024 - 0.003 * (i % 2)))
for i, (a, c, r) in enumerate(clumps):
    m.capsule(a, c, r, HAIR_DARK if i % 3 == 0 else HAIR, group="head")
# The nose: long and drooping, narrow across and deep, from a bony bridge between the eyes down past the
# mouth to a hooked point, with flared wings at its root.
for (y, z, across, up, depth) in ((0.005, 0.11, 0.028, 0.03, 0.022), (-0.035, 0.145, 0.019, 0.03, 0.028), (-0.075, 0.172, 0.017, 0.028, 0.028), (-0.108, 0.183, 0.012, 0.022, 0.018)):
    ell(hp(0, y, z), across, up, depth, **H)
ball(hp(0, -0.132, 0.172), 0.0065, **H)
for sign in (1, -1):
    ell(hp(sign * 0.02, -0.092, 0.148), 0.017, 0.012, 0.02, **H)

cuts = []
for sign in (1, -1):
    cuts.append((on_head(sign * 0.045, 0.0, (sign * 0.25, 0, 1), 0.008), 0.024, SOCKET))
    cuts.append((on_head(sign * 0.012, -0.12, (sign * 0.3, -1, 1.2), 0.0), 0.008, SOCKET))
mouth = [on_head(x, -0.112, (x * 7, 0, 1), 0.0) for x in (-0.085, -0.06, -0.03, 0.0, 0.03, 0.06, 0.085)]
for q, r, colour in cuts:
    m.ball(q, r, colour, True, group="head")
for a, c in zip(mouth, mouth[1:]):
    m.capsule(a, c, 0.012, MOUTH, True, group="head")
# (Small cuts just behind the skin, which take its colour without cutting much deeper.)
for x in (-0.06, -0.03, 0.0, 0.03, 0.06):
    q, d = surface(hp(x * 0.5, -0.112, 0.0), (x * 7, 0, 1), "head")
    m.ball(q - d * 0.003, 0.011, MOUTH, True, group="head")
for sign in (1, -1):
    q, d = surface(hp(sign * 0.035, 0.0, 0.0), (sign * 0.25, 0, 1), "head")
    m.ball(q - d * 0.004, 0.016, SOCKET, True, group="head")

for sign in (1, -1):
    # Small amber eyes deep under the brow.
    eye, d = surface(hp(sign * 0.035, 0.0, 0.0), (sign * 0.25, 0, 1), "head")
    eye = eye - d * 0.003
    m.sphere(eye, (0.011, 0.008, 0.009), EYE, "Head", segments=10, rings=8)
    m.sphere(eye + d * 0.0075, (0.0045, 0.002, 0.0055), PUPIL, "Head", segments=8, rings=6)
    # Pointed ears, long and drooping back, cupped.
    base, tip = at(*hp(sign * 0.1, -0.01, -0.03)), at(*hp(sign * 0.2, -0.04, -0.13))
    m.leaf(base, tip, 0.08, 0.016, SKIN, "Head", Vector((sign, -0.5, 0.2)).normalized(), bend=(0, 0.01, -0.03), notch=0.5 if sign > 0 else None, steps=8, cup=0.35, inner=0x6A5848)
    # Tusks from the lower jaw, up past the upper lip, splayed a little.
    root, d = surface(hp(sign * 0.03, -0.128, 0.0), (sign * 0.45, 0, 1), "head")
    root = root - d * 0.01
    m.cone(root, root + d * 0.012 + Vector((sign * 0.008, 0, 0.055)), 0.014, TUSK, "Head", segments=7)
# Crooked teeth along the upper lip, uneven and leaning every way.
for i, (x, length, lean) in enumerate(((-0.05, 0.016, 0.004), (-0.028, 0.022, -0.003), (-0.01, 0.014, 0.005), (0.012, 0.02, -0.004), (0.032, 0.013, 0.003), (0.05, 0.018, -0.002))):
    root, d = surface(hp(x * 0.5, -0.1, 0.0), (x * 7, 0, 1), "head")
    root = root - d * 0.006 + Vector((0, 0, -0.004))
    m.cone(root, root + d * 0.004 + Vector((lean, 0, -length)), 0.006, TEETH, "Head", segments=5)
# ── The body: a hump of a back with the neck coming forward out of it, sagging shoulders, a lean chest
# over a sagging belly, long sinewy arms with heavy forearms, knobbed elbows and knees, thin shins. ──
ell((0, arm_y, hunch * 0.28 - chest_z * 0.35), sx * 0.62, 0.22, chest_z * 1.05, BACK)
ell((0, arm_y + 0.05, hunch * 0.45), 0.12, 0.1, 0.11, BACK)
ell((0, arm_y - 0.07, hunch * 0.33), chest_x * 0.9, 0.13, chest_z * 0.85)
ell((0, hips + 0.12, waist_z * 0.4), waist_x * 0.95, 0.11, waist_z * 0.8, BELLY)
for sign in (1, -1):
    # Broad, sloping shoulders: the muscle from the neck down to each.
    cap((sign * 0.06, arm_y + 0.06, hunch * 0.35), (sign * (sx - 0.03), arm_y + 0.02, 0.0), 0.062, BACK)
ell((0, hips - 0.01, 0.0), hx + 0.08, 0.1, waist_z * 1.1)
for sign in (1, -1):
    ell((sign * 0.1, arm_y - 0.1, hunch * 0.33 + chest_z * 0.6), 0.11, 0.05, 0.03)
    ell((sign * (sx + 0.03), arm_y + 0.0, 0.0), 0.11, 0.08, 0.085, BACK)
    elbow, wrist = p["arm"] * 0.52, p["arm"]
    ell((sign * (sx + elbow * 0.45), arm_y + 0.005, 0.0), elbow * 0.3, 0.05, 0.052)
    ball((sign * (sx + elbow), arm_y, -0.03), 0.05)
    ell((sign * (sx + elbow + 0.18), arm_y + 0.01, 0.005), 0.19, 0.068, 0.07)
    ball((sign * (sx + wrist - 0.02), arm_y, 0.0), 0.042)
    ball((sign * hx, b["knee"] + 0.01, 0.04), 0.06)
    ell((sign * (hx + 0.01), hips - 0.2, 0.012), 0.07, 0.2, 0.075)
    ell((sign * hx, b["knee"] - 0.15, -0.03), 0.055, 0.13, 0.06)
    ball((sign * (hx + 0.05), 0.085 * s, 0.0), 0.028)
    ball((sign * (hx - 0.045), 0.09 * s, 0.0), 0.026)

# Faint ribs down the sides of the chest, set on the skin.
ribs = []
for k in range(3):
    y0 = chest_y + 0.02 - k * 0.07
    for sign in (1, -1):
        points = []
        for j in range(5):
            theta = 0.7 + j * 0.22
            q, d = surface((0, y0 + 0.03 * j / 4, hunch * 0.2), (sign * math.sin(theta), 0, math.cos(theta)))
            points.append(q - d * 0.006)
        ribs.append(points)
for points in ribs:
    for a, c in zip(points, points[1:]):
        m.capsule(a, c, 0.011, shade(SKIN, 1.05))

# Warts over the back, shoulders, arms and head, set on the skin where it is.
warts = []
for _ in range(40):
    y = rng.uniform(hips + 0.1, arm_y + 0.08)
    a0 = rng.uniform(-2.6, 2.6)
    q, d = surface((0, y, hunch * 0.25), (math.sin(a0), rng.uniform(-0.2, 0.4), -math.cos(a0) * (1 if abs(a0) < 1.6 else 0.6)))
    warts.append((q - d * 0.006, rng.uniform(0.011, 0.02)))
for _ in range(24):
    sign = rng.choice((1, -1))
    u = rng.uniform(0.05, p["arm"] - 0.05)
    a0 = rng.uniform(0, 2 * math.pi)
    q, d = surface((sign * (sx + u), arm_y, 0.0), (0, math.cos(a0), math.sin(a0)))
    warts.append((q - d * 0.005, rng.uniform(0.009, 0.016)))
for q, r in warts:
    m.ball(q, r, rng.choice((WART, WART_PALE, WART)))
head_warts = []
for x, y, direction in ((0.07, 0.04, (1, 0.3, 0.6)), (-0.08, -0.03, (-1, 0, 0.5)), (0.04, -0.07, (0.8, -0.2, 1)), (-0.05, 0.07, (-0.5, 1, 0.4)), (0.0, -0.09, (0.1, 0.2, 1)), (0.08, -0.08, (1, -0.3, 0.6))):
    head_warts.append(on_head(x, y, direction, 0.004))
for q in head_warts:
    m.ball(q, 0.011, WART, group="head")

# ── A tattered hide loincloth on a rope: ragged flaps front and back and a strip at each hip. ──
belt_y = hips + 0.03 * s
m.ring(at(0, belt_y, 0.0), 1, 0.1, ROPE, "pelvis", scale=(waist_x * 1.3, waist_z * 1.45, 0.16))
m.leaf(at(0.0, belt_y, waist_z * 1.35), at(0.03, hips - 0.34, waist_z * 1.3 + 0.03), 0.26, 0.012, HIDE, "pelvis", (0, -1, 0), notch=0.65, steps=8)
m.leaf(at(-0.06, belt_y - 0.02, waist_z * 1.38), at(-0.09, hips - 0.24, waist_z * 1.38 + 0.02), 0.13, 0.01, HIDE_DARK, "pelvis", (0, -1, 0), notch=0.45, steps=6)
m.leaf(at(0.0, belt_y, -waist_z * 1.35), at(-0.02, hips - 0.38, -waist_z * 1.35 - 0.04), 0.3, 0.012, HIDE_DARK, "pelvis", (0, 1, 0), notch=0.55, steps=8)
for sign in (1, -1):
    m.leaf(at(sign * waist_x * 1.3, belt_y, 0.02), at(sign * waist_x * 1.4, hips - 0.26, 0.0), 0.1, 0.01, HIDE, "pelvis", (sign, 0, 0), notch=0.6 if sign > 0 else None, steps=6)

m.finish(humanoid_actions(arm_down=76), bake={"size": 512, "ao": 0.1, "mottle": 0.16, "mottle_scale": 35, "dirt": 0.3})
