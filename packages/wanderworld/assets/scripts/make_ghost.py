"""Ghost (SRD: Medium undead): the pale spirit of a dead person, hovering a quarter of a metre off the
ground, about 1.8 metres to the top of its head. A gaunt face with hollow dark eyes drooping in grief, the
jaw dropped open in a moan; long hair falling down its back and drifting up as if under water; a flowing
gown with ragged sleeves, a torn shroud down its back and a torn overskirt, its lower body fading into a
long wispy tail trailing behind instead of legs. Pale blue-white all over. Writes assets/models/ghost.glb. Run (BLENDER: your Blender executable):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_ghost.py

It stands on the people's skeleton (the legs' bones are there, unseen, down to the ground), so the game
moves it with the people's clips; its tail is held mostly by the pelvis and a little by the thighs, so a
walk barely stirs it. The game should draw it translucent with a faint glow (see the report in the
package notes): it's baked here in its colours like any other model.
"""

import math
import os
import random
import sys

import bpy
from mathutils import Quaternion

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wwblend import Vector, at, humanoid_actions, humanoid_body, humanoid_joints  # noqa: E402
from wwundead import Spine, Undead, fbm, lift, reweight, surface, write  # noqa: E402

bpy.ops.wm.read_factory_settings(use_empty=True)
random.seed(3)

ROBE = 0xB4C6D2
ROBE_SHADE = 0x8EA4B6
ROBE_DARK = 0x6A8298
SKIN = 0xC4D2DA
SKIN_SHADE = 0x9AAEBC
SOCKET = 0x16202C
MOUTH = 0x1A2632
HAIR = 0x8098AE
HAIR_DARK = 0x5E7690
TEETH = 0xB0C0C8


def paint(q, colour):
    """Shadowed folds and a fading, darker tail; streaked hair."""
    if colour == ROBE:
        n = 0.5 * fbm(q, 3) - max(0.0, 0.8 - q.z) * 1.2
        return ROBE if n > -0.2 else ROBE_SHADE if n > -0.55 else ROBE_DARK
    if colour == SKIN:
        return SKIN if fbm(q, 5) > -0.45 else SKIN_SHADE
    return colour


p = {
    "leg": 1.02,
    "torso": 0.5,
    "neck": 0.05,
    "shoulders": 0.32,
    "hips": 0.17,
    "arm": 0.6,
    "thick": 0.66,
    "chest": (0.12, 0.08),
    "waist": (0.09, 0.065),
    "hunch": 0.06,
    "hand": 0.88,
    "foot": 0.9,
    "fingers": 1.55,
    "toes": 1.0,
}
hips = p["leg"]
J = humanoid_joints(p)
m = Undead("ghost", resolution=0.01, faces=6500)
m.paint = paint
m.floor = 0.32
m.group("head", resolution=0.0045, faces=3800, bone="Head")
m.rig(J)
# The arms and hands from humanoid_body; its torso, neck and legs left out (a gown and a tail instead).
n0, p0 = len(m.elements), len(m.parts)
b = humanoid_body(m, p, {"skin": SKIN})
m.elements[n0:] = [e for e in m.elements[n0:] if abs((e[1][0] if e[0] != "CAPSULE" else (e[1][0] + e[1][1]) / 2).x) > b["sx"] * 0.7]
m.parts[p0:] = [q for q in m.parts[p0:] if q[3].startswith("hand_")]
s, sx, arm_y, h = b["s"], b["sx"], b["arm_y"], b["h"]


def game(v):
    return (v.x, v.z, -v.y)


spine = Spine([game(J[n]) for n in ("pelvis", "spine_01", "spine_02", "spine_03", "neck_01", "Head")])
X = Vector((1, 0, 0))


def ell(c, across, up, depth, colour=ROBE, negative=False, group="body"):
    m.ellipsoid(at(*c), (across, depth, up), colour, negative, group=group)


def ball(c, r, colour=ROBE, negative=False, group="body"):
    m.ball(at(*c), r, colour, negative, group=group)


def cap(a, c, r, colour=ROBE, negative=False, group="body"):
    m.capsule(at(*a), at(*c), r, colour, negative, group=group)


# Folds in the gown hanging down from the waist, more of them lower down; soft ripples on the arms.
def folds(co, normal):
    if co.z > hips + 0.05:
        return normal * 0.0015 * fbm(co, 30)
    angle = math.atan2(co.x, co.y + 0.1 * (hips - co.z))
    depth = min(1.0, (hips + 0.05 - co.z) / 0.3)
    return normal * depth * (0.009 * math.sin(angle * 7 + 1.5 * math.sin(co.z * 6)) + 0.0015 * fbm(co, 25))


m.shapes["body"] = folds
m.shapes["head"] = lambda co, n: n * 0.0008 * fbm(co, 90)

# ── The body: a slender torso in the gown, the bones of the upper chest and neck showing above it; the
# gown flowing down into a long tail that curls back and away to nothing. ──
spine.body(
    m,
    [
        (0.0, 0.14, 0.1, 0.0, ROBE),
        (0.2, 0.11, 0.074, 0.0, ROBE),
        (0.45, 0.122, 0.082, 0.006, ROBE),
        (0.62, 0.126, 0.086, 0.004, ROBE),
        (0.74, 0.104, 0.076, -0.008, ROBE),
        (0.84, 0.052, 0.05, -0.006, SKIN),
        (1.0, 0.036, 0.036, -0.006, SKIN),
    ],
)
tail = Spine([(0, hips + 0.02, 0.0), (0.01, hips - 0.18, -0.01), (0.0, hips - 0.38, -0.06), (-0.03, hips - 0.55, -0.17), (0.02, hips - 0.68, -0.32), (0.06, hips - 0.74, -0.5), (0.04, hips - 0.76, -0.62)])
tail.body(
    m,
    [
        (0.0, 0.14, 0.1, 0.0, ROBE),
        (0.18, 0.14, 0.11, 0.0, ROBE),
        (0.36, 0.13, 0.1, 0.0, ROBE),
        (0.55, 0.1, 0.08, 0.0, ROBE),
        (0.75, 0.07, 0.06, 0.0, ROBE),
        (0.9, 0.035, 0.03, 0.0, ROBE),
        (1.0, 0.014, 0.012, 0.0, ROBE),
    ],
)
for sign in (1, -1):
    c, run, front = spine.along(0.72)
    cap(tuple(c + X * sign * 0.05), (sign * sx, arm_y + 0.004, 0), 0.042)
    # Collarbones and the cords of the neck standing out.
    c, run, front = spine.along(0.8)
    cap(tuple(c + front * 0.045 + X * sign * 0.01), (sign * (sx - 0.02), arm_y + 0.022, 0.02), 0.009, SKIN)
    cap((sign * 0.034, J["Head"].z + 0.02, J["Head"].y * -1 - 0.01), tuple(c + front * 0.04 + X * sign * 0.012), 0.009, SKIN)
    # Wide sleeves, flaring to the wrist, open at the end.
    el, wr = p["arm"] * 0.52, p["arm"]
    cap((sign * sx, arm_y, 0), (sign * (sx + el), arm_y - 0.004, 0), 0.031, ROBE)
    cap((sign * (sx + el), arm_y - 0.004, 0), (sign * (sx + wr - 0.04), arm_y - 0.01, 0), 0.037, ROBE)
    ball((sign * (sx + wr - 0.035), arm_y - 0.012, 0), 0.046, ROBE)
    ball((sign * (sx + wr + 0.0), arm_y - 0.012, 0), 0.037, ROBE, True)
# A low neckline.
c, run, front = spine.along(0.72)
ell(tuple(c + front * 0.075 + Vector((0, 0.02, 0))), 0.07, 0.05, 0.04, SKIN, True)

# ── The head: a skull under thin skin, gaunt, the jaw dropped open in a moan. ──
HC = Vector(game(J["Head"])) + Vector((0, 0.11, 0.0))
TILT = Quaternion((0, 1, 0), math.radians(6)) @ Quaternion((1, 0, 0), math.radians(-5))


def hp(x, y, z):
    return at(*HC) + TILT @ at(x, y, z)


HINGE = (0, -0.042, -0.006)
OPEN = Quaternion((1, 0, 0), math.radians(26))


def jp(x, y, z):
    return at(*HC) + TILT @ (OPEN @ at(x - HINGE[0], y - HINGE[1], z - HINGE[2]) + at(*HINGE))


def hell(c, across, up, depth, colour=SKIN, negative=False, pt=hp):
    m.ellipsoid(pt(*c), (across, depth, up), colour, negative, group="head")


def hball(c, r, colour=SKIN, negative=False, pt=hp):
    m.ball(pt(*c), r, colour, negative, group="head")


def hcap(a, c, r, colour=SKIN, negative=False, pt=hp):
    m.capsule(pt(*a), pt(*c), r, colour, negative, group="head")


hell((0, 0.03, -0.022), 0.07, 0.084, 0.094)
hell((0, 0.036, 0.035), 0.062, 0.06, 0.052)
hell((0, -0.012, -0.07), 0.055, 0.05, 0.035)
for sign in (1, -1):
    hcap((sign * 0.05, 0.004, 0.072), (0, 0.009, 0.086), 0.011)
hell((0, -0.052, 0.056), 0.038, 0.034, 0.034)
hell((0, -0.074, 0.064), 0.03, 0.014, 0.024)
hcap((0, -0.012, 0.087), (0, -0.04, 0.098), 0.0075)
hell((0, -0.045, 0.094), 0.012, 0.011, 0.012)
for sign in (1, -1):
    hball((sign * 0.044, -0.036, 0.062), 0.0145)
    hcap((sign * 0.048, -0.036, 0.055), (sign * 0.062, -0.03, 0.0), 0.0072)
    hcap((sign * 0.034, -0.03, 0.078), (sign * 0.02, -0.06, 0.07), 0.0092)
jaw = []
for k in range(9):
    phi = math.radians(-90 + 180 * k / 8)
    jaw.append((0.045 * math.sin(phi), -0.108 + 0.004 * abs(math.sin(phi)), 0.07 * math.cos(phi)))
for a, c in zip(jaw, jaw[1:]):
    hcap(a, c, 0.011, pt=jp)
hball((0, -0.112, 0.068), 0.013, pt=jp)
for sign in (1, -1):
    hcap((sign * 0.045, -0.107, 0.0), (sign * 0.054, -0.048, -0.01), 0.0105, pt=jp)
for sign in (1, -1):
    # Sockets drooping at their outer corners, as in grief.
    hball((sign * 0.024, -0.012, 0.088), 0.018, SKIN_SHADE, True)
    hball((sign * 0.036, -0.024, 0.084), 0.017, SKIN_SHADE, True)
    hball((sign * 0.024, -0.014, 0.076), 0.014, SOCKET, True)
    hball((sign * 0.034, -0.025, 0.073), 0.013, SOCKET, True)
    hball((sign * 0.087, 0.002, 0.022), 0.018, SKIN_SHADE, True)
    hball((sign * 0.05, -0.066, 0.06), 0.015, SKIN_SHADE, True)
    # The sides of the face drawn down over the dropped jaw, so only the front of the mouth gapes.
    hell((sign * 0.046, -0.078, 0.018), 0.018, 0.042, 0.034, SKIN_SHADE)
hell((0, -0.05, 0.1), 0.008, 0.01, 0.012, MOUTH, True)
for k in range(7):
    phi = math.radians(-62 + 124 * k / 6)
    a = (0.03 * math.sin(phi), -0.08, 0.026 + 0.042 * math.cos(phi))
    if k:
        hcap(prev, a, 0.0045, SKIN_SHADE)
    prev = a
m.sphere(hp(0, -0.095, 0.018), (0.026, 0.03, 0.038), MOUTH, "Head", segments=10, rings=6)
for sign in (1, -1):
    centre = hp(sign * 0.028, -0.02, 0.056)
    m.sphere(centre, (0.015, 0.011, 0.014), SOCKET, "Head", segments=8, rings=5)
for k in range(10):
    if k in (3, 6):
        continue
    phi = math.radians(-55 + 110 * k / 9)
    root = hp(0.028 * math.sin(phi), -0.078, 0.032 + 0.042 * math.cos(phi))
    m.tube(root, root + TILT @ at(0, -0.01, 0), 0.0035, 0.0028, TEETH, "Head", segments=4, smooth=False)

# ── Long hair: a mass over the scalp, and locks from it falling down the back and over the shoulders or
# drifting up and back as if under water. ──
hell((0, 0.046, -0.034), 0.08, 0.086, 0.098, HAIR)
hell((0, -0.01, -0.07), 0.078, 0.08, 0.07, HAIR)
hell((0, -0.1, -0.09), 0.07, 0.1, 0.045, HAIR)
for sign in (1, -1):
    hell((sign * 0.07, -0.05, -0.03), 0.022, 0.09, 0.05, HAIR)
for k in range(46):
    a = random.uniform(-2.2, 2.2) if k >= 8 else (1 if k % 2 else -1) * random.uniform(1.2, 1.55)
    e = random.uniform(-0.35, 1.0)
    falls = k % 3 != 0 or k < 8
    root, d = surface(m, hp(0, 0.04, -0.03), TILT @ at(math.sin(a) * math.cos(e), math.sin(e), -math.cos(a) * math.cos(e)), "head")
    root = root - d * 0.006
    length = random.uniform(0.3, 0.52) if falls else random.uniform(0.22, 0.38)
    phase = random.uniform(0, 6.28)
    back = Vector((0, 1, 0))
    pts = [root]
    for j in range(1, 9):
        w = j / 8
        rise = -0.85 * w if falls else 0.3 * w * w - 0.2 * w
        drift = d * (0.025 * w) + back * (length * w * (0.3 if falls else 0.8) * (-0.15 if k < 8 else 1.0)) + Vector((0, 0, length * rise))
        wave = Vector((math.sin(phase + w * 5), 0.3 * math.cos(phase + w * 3), 0)) * 0.03 * w
        pts.append(root + drift + wave + Vector((d.x * 0.06 * w, 0, 0)))
    m.sweep(pts, (0.017, 0.0015), HAIR if k % 3 else HAIR_DARK, "Head", segments=5, flat=0.32, up=d)

# ── Tatters: torn strips of the gown streaming down and back from the skirt and the tail, from the ends
# of the sleeves, and thin wisps trailing off the tail's end. ──
rnd = random.Random(8)

# A torn shroud hanging from the shoulders down the back, streaming behind.
columns = []
for i in range(11):
    u = i / 10
    x = (u - 0.5) * 2 * (sx + 0.02)
    edge = abs(u - 0.5) * 2
    length = (0.75 - 0.3 * edge) * (0.5 + 0.5 * rnd.random()) * (0.6 if rnd.random() < 0.3 else 1.0)
    column = []
    for j in range(9):
        w = j / 8
        column.append(at(x * (1 + 0.25 * w), arm_y + 0.03 - 0.02 * edge - length * w, -0.07 - 0.03 * (1 - edge) - 0.14 * w * w - 0.03 * math.sin(i * 1.9 + w * 5) * w))
    columns.append(column)
m.sheet(columns, ROBE_SHADE, "spine_03", thick=0.004)

# The gown's torn overskirt, hanging in deep folds from the waist and trailing behind, its hem in long
# ragged points.
cols = []
N = 32
for i in range(N):
    phi = 2 * math.pi * i / N
    dx, dz = math.sin(phi), math.cos(phi)
    backness = (1 - dz) / 2
    fold = 1 + 0.2 * math.sin(7 * phi + 0.6) + 0.08 * math.sin(13 * phi)
    length = (0.5 + 0.3 * backness) * (0.35 + 0.65 * rnd.random() ** 0.7) * (0.6 if rnd.random() < 0.3 else 1.0)
    col = []
    for j in range(10):
        w = j / 9
        f = 1 + (fold - 1) * min(1.0, w * 2.5)
        rx = (0.15 + 0.07 * w) * f
        rz = (0.12 + 0.07 * w) * f
        col.append(at(rx * dx, hips + 0.03 - length * w, rz * dz - (0.04 + 0.3 * backness) * w * w))
    cols.append(col)
m.sheet(cols, ROBE, "pelvis", thick=0.005, closed=True)

for k in range(10):
    u = rnd.uniform(0.35, 0.7)
    centre, run, front = tail.along(u)
    angle = rnd.uniform(0, 2 * math.pi)
    radius = 0.15 * (1 - u) + 0.02
    out = Vector((math.cos(angle), 0, math.sin(angle)))
    top = at(*(centre + out * radius * 0.95))
    direction = at(out.x * 0.15, -1.0, out.z * 0.1 - 0.7)
    m.strip(top, direction, at(-out.z, 0, out.x), rnd.uniform(0.25, 0.5), rnd.uniform(0.09, 0.14), ROBE if k % 3 else ROBE_SHADE, "pelvis", curl=0.04, rnd=rnd)
for k in range(9):
    centre, run, front = tail.along(0.86 + 0.02 * k / 8)
    angle = 2 * math.pi * k / 9
    tip = at(*centre)
    pts = [tip]
    for j in range(1, 7):
        w = j / 6
        pts.append(tip + Vector((0.06 * math.cos(angle) * w, 0.32 * w + 0.03 * math.sin(angle + w * 4), 0.04 * math.sin(angle) * w + 0.05 * w * w)))
    m.sweep(pts, (0.014, 0.001), ROBE_SHADE, "pelvis", segments=4, flat=0.4)
for side, sign in (("l", 1), ("r", -1)):
    wr = p["arm"]
    # The sleeve's torn lower edge hanging from under the forearm, longest at the wrist.
    columns = []
    for k in range(9):
        u = k / 8
        x = sx + p["arm"] * (0.5 + 0.5 * u)
        top = at(sign * x, arm_y - 0.028 - 0.01 * u, 0.0)
        length = (0.06 + 0.2 * u) * (0.55 + 0.45 * rnd.random()) * (0.6 if k % 3 == 1 else 1.0)
        columns.append([top + at(sign * 0.12 * w * length, -length * w, -0.03 * w * w + 0.012 * math.sin(k * 1.7 + w * 3)) for w in (j / 5 for j in range(6))])
    m.sheet(columns, ROBE, f"lowerarm_{side}", thick=0.004)

m.finish(humanoid_actions(arm_down=62, walk_swing=8), bake={"size": 512, "ao": 0.1, "mottle": 0.08, "mottle_scale": 30, "dirt": 0.0})

# The tail, held mostly by the pelvis and a little by each thigh, fading to the pelvis alone at its end.
low = 0.25


def mostly_pelvis(co, here):
    if co.z >= hips + 0.02 or abs(co.x) > sx + 0.06:
        return None
    k = max(0.0, min(1.0, (co.z - low) / (hips - low))) ** 1.5
    lean = max(0.0, min(1.0, 0.5 + co.x / 0.16))
    thigh = 0.3 * k
    return {"pelvis": 1 - thigh, "thigh_l": thigh * lean, "thigh_r": thigh * (1 - lean)}


reweight(m, mostly_pelvis)
# Hovering: a slow rise and fall on its own actions (it already floats clear of the ground at rest).
lift(m, {"Idle": [(1, (0, 0, 0)), (30, (0, 0.035, 0)), (60, (0, 0, 0))], "Walk": [(1, (0, 0, 0)), (16, (0, 0.02, 0)), (31, (0, 0, 0))], "Attack": [(1, (0, 0, 0)), (10, (0, 0.04, 0)), (26, (0, 0, 0))]})
write(m)
