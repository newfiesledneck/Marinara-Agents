"""Troll (SRD: Large giant): a tall, gangly brute about 2.3 metres tall even stooped, bent over with its back
rounded, its head carried low and forward on a short thick neck, and arms that hang past its knees to huge clawed hands; mossy green-grey warty hide, a
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
BACK = shade(SKIN, 0.9)
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
    "arm": 1.16,
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
# The stoop, as the rest pose itself: the spine curves forward and down from the hips (spine_01, spine_02,
# spine_03, neck_01, Head), and the shoulders hang from the bent upper back, rolled forward, so the long
# arms reach past the knees. (The game turns the bones from this pose, so the stoop stays when it walks and
# strikes.)
SPINE = [(0, 1.38, -0.01), (0, 1.6, 0.04), (0, 1.77, 0.15), (0, 1.88, 0.3), (0, 1.9, 0.43)]
SHOULDER = (1.76, 0.21)  # (up, forward)

m = Model("troll", resolution=0.012, faces=6500)
m.group("head", resolution=0.0075, faces=5200, bone="Head")


def stooped(spine, shoulder, colours):
    """The people's skeleton laid out bent over, and humanoid_body's limbs built on it: its arms moved to
    hang from `shoulder`, its own upright torso and neck left out (built below, along the curved spine)."""
    joints = humanoid_joints(p)
    s = p["leg"] / 0.9
    for name, q in zip(("spine_01", "spine_02", "spine_03", "neck_01", "Head"), spine):
        joints[name] = at(*q)
    joints["Head.tail"] = joints["Head"] + Vector((0, 0, 0.2 * s))
    arm_y = p["leg"] + p["torso"] * 0.88
    shift = at(0, shoulder[0] - arm_y, shoulder[1])
    for side, sign in (("l", 1), ("r", -1)):
        for name in (f"upperarm_{side}", f"lowerarm_{side}", f"hand_{side}", f"hand_{side}.tail"):
            joints[name] = joints[name] + shift
        joints[f"clavicle_{side}"] = at(sign * 0.03 * s, shoulder[0] - 0.01 * s, spine[2][2])
    m.rig(joints)
    n0, p0 = len(m.elements), len(m.parts)
    b = humanoid_body(m, p, colours)
    kept = m.elements[:n0]
    for kind, data, colour, negative, group in m.elements[n0:]:
        centre = (data[0] + data[1]) / 2 if kind == "CAPSULE" else data[0]
        if abs(centre.x) < 1e-6:
            continue  # (the upright torso and neck)
        if abs(centre.x) > b["sx"] * 0.75 and abs(centre.z - arm_y) < 0.15 * s:
            data = (data[0] + shift, data[1] + shift, data[2]) if kind == "CAPSULE" else (data[0] + shift, data[1])
        kept.append((kind, data, colour, negative, group))
    m.elements[:] = kept
    for i in range(p0, len(m.parts)):
        verts, faces, colour, bone, smooth = m.parts[i]
        if bone.startswith("hand_"):
            m.parts[i] = ([v + shift for v in verts], faces, colour, bone, smooth)
    return b


b = stooped(SPINE, SHOULDER, {"skin": SKIN, "nails": 0x2A2420})
s, t, sx, hx, h, f = b["s"], b["t"], b["sx"], b["hx"], b["h"], b["f"]
hips = p["leg"]
ay, az = SHOULDER  # where the arms hang from
hy = SPINE[-1][1] + 0.11
hz = SPINE[-1][2] + 0.06


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


def _curve(points, per=12):
    """A smooth line through `points` (game coordinates), and the length along it at each of its points."""
    pts = [Vector(q) for q in points]
    pts = [pts[0] * 2 - pts[1]] + pts + [pts[-1] * 2 - pts[-2]]
    out = []
    for i in range(1, len(pts) - 2):
        p0, p1, p2, p3 = pts[i - 1], pts[i], pts[i + 1], pts[i + 2]
        for k in range(per):
            u = k / per
            out.append(0.5 * (2 * p1 + (p2 - p0) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (3 * p1 - p0 - 3 * p2 + p3) * u**3))
    out.append(pts[-2])
    lengths = [0.0]
    for a, c in zip(out, out[1:]):
        lengths.append(lengths[-1] + (c - a).length)
    return out, lengths


# The spine's curve, from the pelvis to the head.
CURVE = _curve([(0, hips, 0)] + SPINE)
X = Vector((1, 0, 0))


def along(u):
    """The spine at `u` (0 at the pelvis, 1 at the head, by length): its point, the way it runs and the way
    its front faces (game coordinates)."""
    out, lengths = CURVE
    target = max(0.0, min(1.0, u)) * lengths[-1]
    i = next((k for k in range(1, len(lengths)) if lengths[k] >= target), len(lengths) - 1)
    a, c = out[i - 1], out[i]
    w = (target - lengths[i - 1]) / max(1e-9, lengths[i] - lengths[i - 1])
    run = (c - a).normalized()
    return a.lerp(c, w), run, Vector((0, -run.z, run.y))


def body_along(keys):
    """A body along the spine: `keys` [(u, half width, half depth, pushed forward by, colour)], and between
    them a round profile from the side, wider across, so the back curves with the spine."""
    total = CURVE[1][-1]
    u = 0.0
    while u <= 1.0:
        i = next((k for k in range(1, len(keys)) if keys[k][0] >= u), len(keys) - 1)
        k0, k1 = keys[i - 1], keys[i]
        w = max(0.0, min(1.0, (u - k0[0]) / max(1e-9, k1[0] - k0[0])))
        across, depth, push = (k0[n] + (k1[n] - k0[n]) * w for n in (1, 2, 3))
        centre, run, front = along(u)
        ell(tuple(centre + front * push), across, depth, depth, k0[4] if w < 0.5 else k1[4])
        u += depth * 0.7 / total


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
ell(hp(0, 0.075, -0.088), 0.108, 0.08, 0.105, HAIR, **H)
rng = random.Random(7)
clumps = []
for ring_, (lift, count) in enumerate(((0.95, 5), (0.6, 8), (0.25, 10), (-0.15, 9))):
    for i in range(count):
        a0 = math.pi * (0.15 + 0.7 * (i + 0.5 * (ring_ % 2)) / count) * 2 - math.pi
        direction = (math.sin(a0) * (1 - abs(lift) * 0.6), lift, math.cos(a0) * (1 - abs(lift) * 0.6) - 0.35)
        q, d = surface(hp(0, 0.03, -0.05), direction, "head")
        if (q - at(*hp(0, 0, 0))).dot(at(0, 0, 1)) > 0.03:
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
# ── The body: big and heavy, bent over. The torso leans forward from the hips and rounds over into a
# short thick neck: a sagging pot belly, a deep chest, the upper back broadest and humped, the shoulders
# rolled forward off it; long sinewy arms with heavy forearms, knobbed elbows and knees, thin shins. ──
body_along(
    [
        (0.0, 0.205, 0.15, 0.0, SKIN),
        (0.12, 0.2, 0.158, 0.015, SKIN),
        (0.26, 0.21, 0.168, 0.03, SKIN),
        (0.42, 0.235, 0.175, 0.012, SKIN),
        (0.56, 0.25, 0.175, -0.006, SKIN),
        (0.68, 0.225, 0.165, -0.02, SKIN),
        (0.8, 0.16, 0.13, -0.012, SKIN),
        (0.9, 0.11, 0.105, 0.0, SKIN),
        (1.0, 0.095, 0.095, 0.0, SKIN),
    ]
)
c, run, front = along(0.24)
ell(tuple(c + front * 0.075), 0.17, 0.15, 0.12, BELLY)
c, run, front = along(0.62)
ell(tuple(c - front * 0.06), 0.2, 0.15, 0.125, BACK)
for sign in (1, -1):
    # Slabs of chest, and the shoulders: from the upper back out to each shoulder joint, with the heavy
    # muscle from the neck down to them.
    c, run, front = along(0.5)
    ell(tuple(c + front * 0.11 + X * sign * 0.1), 0.1, 0.07, 0.065)
    c, run, front = along(0.64)
    cap(tuple(c + X * sign * 0.1), (sign * sx, ay + 0.01, az), 0.085)
    c, run, front = along(0.84)
    cap(tuple(c + X * sign * 0.04), (sign * (sx - 0.04), ay + 0.045, az - 0.02), 0.055)
    ell((sign * (sx + 0.03), ay, az), 0.11, 0.08, 0.085)
    elbow, wrist = p["arm"] * 0.52, p["arm"]
    ell((sign * (sx + elbow * 0.45), ay + 0.005, az), elbow * 0.3, 0.05, 0.052)
    ball((sign * (sx + elbow), ay, az - 0.03), 0.05)
    ell((sign * (sx + elbow + 0.18), ay + 0.01, az + 0.005), 0.19, 0.068, 0.07)
    ball((sign * (sx + wrist - 0.02), ay, az), 0.042)
    ball((sign * hx, b["knee"] + 0.01, 0.04), 0.06)
    ell((sign * (hx + 0.012), hips - 0.18, 0.014), 0.088, 0.22, 0.09)
    ell((sign * hx, b["knee"] - 0.15, -0.03), 0.055, 0.13, 0.06)
    ball((sign * (hx + 0.05), 0.085 * s, 0.0), 0.028)
    ball((sign * (hx - 0.045), 0.09 * s, 0.0), 0.026)

# Faint ribs down the sides of the chest, square to the spine, set on the skin.
ribs = []
for k in range(3):
    centre, run, front = along(0.5 - k * 0.07)
    for sign in (1, -1):
        points = []
        for j in range(5):
            theta = 0.8 + j * 0.2
            q, d = surface(tuple(centre - run * 0.02 * (4 - j) / 4), tuple(X * sign * math.sin(theta) + front * math.cos(theta)))
            points.append(q - d * 0.006)
        ribs.append(points)
for points in ribs:
    for a, c in zip(points, points[1:]):
        m.capsule(a, c, 0.011, shade(SKIN, 1.05))

# Warts over the back, shoulders, arms and head, set on the skin where it is.
warts = []
for _ in range(40):
    centre, run, front = along(rng.uniform(0.15, 0.85))
    a0 = rng.uniform(-2.4, 2.4)
    q, d = surface(tuple(centre), tuple(-front * math.cos(a0) + X * math.sin(a0) + run * rng.uniform(-0.2, 0.3)))
    warts.append((q - d * 0.006, rng.uniform(0.011, 0.02)))
for _ in range(24):
    sign = rng.choice((1, -1))
    u = rng.uniform(0.05, p["arm"] - 0.05)
    a0 = rng.uniform(0, 2 * math.pi)
    q, d = surface((sign * (sx + u), ay, az), (0, math.cos(a0), math.sin(a0)))
    warts.append((q - d * 0.005, rng.uniform(0.009, 0.016)))
for q, r in warts:
    m.ball(q, r, rng.choice((WART, WART, WART_PALE)))
head_warts = []
for x, y, direction in ((0.07, 0.04, (1, 0.3, 0.6)), (-0.08, -0.03, (-1, 0, 0.5)), (0.04, -0.07, (0.8, -0.2, 1)), (-0.05, 0.07, (-0.5, 1, 0.4)), (0.0, -0.09, (0.1, 0.2, 1)), (0.08, -0.08, (1, -0.3, 0.6))):
    head_warts.append(on_head(x, y, direction, 0.004))
for q in head_warts:
    m.ball(q, 0.011, WART, group="head")

# ── A tattered hide loincloth on a rope: ragged flaps front and back and a strip at each hip. ──
belt_y = hips + 0.03 * s
waist_x, waist_z = 0.165, 0.118
m.ring(at(0, belt_y, 0.0), 1, 0.1, ROPE, "pelvis", scale=(waist_x * 1.3, waist_z * 1.45, 0.16))
m.leaf(at(0.0, belt_y, waist_z * 1.35), at(0.03, hips - 0.34, waist_z * 1.3 + 0.03), 0.26, 0.012, HIDE, "pelvis", (0, -1, 0), notch=0.65, steps=8)
m.leaf(at(-0.06, belt_y - 0.02, waist_z * 1.38), at(-0.09, hips - 0.24, waist_z * 1.38 + 0.02), 0.13, 0.01, HIDE_DARK, "pelvis", (0, -1, 0), notch=0.45, steps=6)
m.leaf(at(0.0, belt_y, -waist_z * 1.35), at(-0.02, hips - 0.38, -waist_z * 1.35 - 0.04), 0.3, 0.012, HIDE_DARK, "pelvis", (0, 1, 0), notch=0.55, steps=8)
for sign in (1, -1):
    m.leaf(at(sign * waist_x * 1.3, belt_y, 0.02), at(sign * waist_x * 1.4, hips - 0.26, 0.0), 0.1, 0.01, HIDE, "pelvis", (sign, 0, 0), notch=0.6 if sign > 0 else None, steps=6)

m.finish(humanoid_actions(arm_down=76), bake={"size": 512, "ao": 0.1, "mottle": 0.16, "mottle_scale": 35, "dirt": 0.3})
