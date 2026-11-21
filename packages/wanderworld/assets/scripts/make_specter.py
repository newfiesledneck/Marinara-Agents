"""Specter (SRD: Medium undead): a darker, angrier spirit than a ghost, about 1.9 metres to the peak of its
hood, hovering hunched forward over its prey. A deep hood of black shroud with nothing in it but the
shadow of a skull and two pale glowing eyes; tattered black shrouds over bony shoulders; long arms ending
in skeletal clawed hands, the sleeves hanging in shreds; and below the waist a body that comes apart into
shredded dark wisps streaming down and back. Writes assets/models/specter.glb. Run (BLENDER: your Blender
executable):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_specter.py

It stands on the people's skeleton (the legs' bones are there, unseen, down to the ground), so the game
moves it with the people's clips; its wisps are held mostly by the pelvis and a little by the thighs. The
game should draw it a little translucent with glowing eyes: it's baked here in its colours like any other
model.
"""

import math
import os
import random
import sys

import bpy
from mathutils import Quaternion

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wwblend import Vector, at, humanoid_actions  # noqa: E402
from wwundead import Spine, Undead, fbm, lift, reweight, stooped, write  # noqa: E402

bpy.ops.wm.read_factory_settings(use_empty=True)
rnd = random.Random(13)

SHROUD = 0x1C1C22
SHROUD_2 = 0x26262E
SHROUD_EDGE = 0x34343E
VOID = 0x040406
BONE = 0x4C4A50
BONE_DARK = 0x323036
CLAW = 0x141416
EYE = 0xCFEFFF
EYE_CORE = 0xFFFFFF


def paint(q, colour):
    """Shrouds in two blacks, a little lighter at the worn edges low down; bone ashen and smudged."""
    if colour == SHROUD:
        n = fbm(q, 5) + 0.4 * fbm(q, 18)
        return SHROUD if n > -0.1 else SHROUD_2 if n > -0.5 else SHROUD_EDGE
    if colour == BONE:
        return BONE if fbm(q, 14) > -0.25 else BONE_DARK
    return colour


p = {
    "leg": 1.05,
    "torso": 0.52,
    "neck": 0.05,
    "shoulders": 0.4,
    "hips": 0.18,
    "arm": 0.72,
    "thick": 0.6,
    "chest": (0.15, 0.1),
    "waist": (0.11, 0.08),
    "hunch": 0.24,
    "hand": 1.05,
    "foot": 0.9,
    "fingers": 2.1,
    "toes": 1.0,
    "claws": True,
}
hips = p["leg"]
SPINE = [(0, 1.12, -0.01), (0, 1.3, 0.03), (0, 1.45, 0.1), (0, 1.555, 0.19), (0, 1.6, 0.255)]
SHOULDER = (1.5, 0.1)

m = Undead("specter", resolution=0.011, faces=5200)
m.paint = paint
m.glow = {EYE, EYE_CORE}
m.floor = 0.36
m.group("head", resolution=0.006, faces=2600, bone="Head")
b = stooped(m, p, SPINE, SHOULDER, {"skin": BONE, "limbs": SHROUD, "forearms": BONE, "nails": CLAW})
sx, ay, az, h = b["sx"], SHOULDER[0], SHOULDER[1], b["h"]
# The legs left out: the body comes apart into wisps below the waist.
m.elements[:] = [e for e in m.elements if not ((e[1][0] if e[0] != "CAPSULE" else (e[1][0] + e[1][1]) / 2).z < hips + 0.02 and abs((e[1][0] if e[0] != "CAPSULE" else (e[1][0] + e[1][1]) / 2).x) < sx * 0.8)]
m.parts[:] = [q for q in m.parts if not q[3].startswith(("thigh", "calf", "foot", "ball"))]
spine = Spine([(0, hips, 0)] + SPINE)
X = Vector((1, 0, 0))


def ell(c, across, up, depth, colour=SHROUD, negative=False, group="body"):
    m.ellipsoid(at(*c), (across, depth, up), colour, negative, group=group)


def ball(c, r, colour=SHROUD, negative=False, group="body"):
    m.ball(at(*c), r, colour, negative, group=group)


def cap(a, c, r, colour=SHROUD, negative=False, group="body"):
    m.capsule(at(*a), at(*c), r, colour, negative, group=group)


def folds(co, normal):
    angle = math.atan2(co.x, co.y)
    return normal * (0.008 * math.sin(angle * 8 + 2 * fbm(co, 3)) + 0.003 * fbm(co, 22))


m.shapes["body"] = folds
m.shapes["head"] = lambda co, n: n * (0.003 * math.sin(math.atan2(co.x, co.y) * 6 + co.z * 20) + 0.001 * fbm(co, 40))

# ── The body: broad bony shoulders hunched under the shroud, a narrow waist, and the shroud below it
# falling into a tapering, trailing mass that the wisps come away from. ──
spine.body(
    m,
    [
        (0.0, 0.14, 0.11, 0.0, SHROUD),
        (0.25, 0.13, 0.1, 0.0, SHROUD),
        (0.5, 0.16, 0.11, 0.004, SHROUD),
        (0.7, 0.17, 0.115, -0.01, SHROUD),
        (0.85, 0.11, 0.09, -0.01, SHROUD),
        (1.0, 0.07, 0.07, -0.01, SHROUD),
    ],
)
for sign in (1, -1):
    c, run, front = spine.along(0.72)
    cap(tuple(c + X * sign * 0.06), (sign * sx, ay + 0.01, az), 0.06)
    ball((sign * (sx - 0.01), ay + 0.03, az - 0.01), 0.055)
tail = Spine([(0, hips + 0.03, 0.0), (0.0, hips - 0.17, -0.03), (0.02, hips - 0.36, -0.1), (-0.02, hips - 0.52, -0.22), (0.01, hips - 0.62, -0.38)])
tail.body(m, [(0.0, 0.14, 0.11, 0.0, SHROUD), (0.3, 0.15, 0.12, 0.0, SHROUD), (0.6, 0.1, 0.085, 0.0, SHROUD), (0.85, 0.05, 0.045, 0.0, SHROUD), (1.0, 0.018, 0.016, 0.0, SHROUD)])

# ── The hood: a deep cowl of shroud, peaked and drawn forward, hollow; in its dark the shadow of a skull
# and two pale burning eyes. ──
HC = Vector((0, SPINE[-1][1] + 0.1, SPINE[-1][2] + 0.03))
LEAN = Quaternion((1, 0, 0), math.radians(-12))


def hp(x, y, z):
    return at(*HC) + LEAN @ at(x, y, z)


def hell(c, across, up, depth, colour=SHROUD, negative=False):
    m.ellipsoid(hp(*c), (across, depth, up), colour, negative, group="head")


def hball(c, r, colour=SHROUD, negative=False):
    m.ball(hp(*c), r, colour, negative, group="head")


hell((0, 0.02, -0.01), 0.118, 0.14, 0.14)
hell((0, 0.1, -0.035), 0.075, 0.07, 0.085)
hball((0, 0.165, 0.03), 0.028)
hball((0, 0.158, 0.075), 0.017)
hell((0, 0.0, 0.09), 0.1, 0.135, 0.075)
# The hood's point, drooping back.
m.capsule(hp(0, 0.12, -0.07), hp(0, 0.085, -0.15), 0.045, SHROUD, group="head")
m.capsule(hp(0, 0.085, -0.15), hp(0, 0.035, -0.2), 0.024, SHROUD, group="head")
hell((0, -0.11, -0.07), 0.13, 0.11, 0.09)
for sign in (1, -1):
    hell((sign * 0.1, -0.1, 0.02), 0.05, 0.1, 0.08)
    # (The cowl's side walls, thick enough to stay whole round the hollow.)
    hell((sign * 0.098, -0.015, 0.06), 0.036, 0.115, 0.095)
hell((0, -0.03, 0.17), 0.06, 0.095, 0.075, VOID, True)
hell((0, -0.02, 0.06), 0.058, 0.085, 0.07, VOID, True)


def F(x, y, z):
    return hp(x, y - 0.015, z - 0.012)


skull = [
    ("ell", F(0, 0.02, 0.0), (0.06, 0.07, 0.07), SHROUD),
    ("ell", F(0, -0.035, 0.035), (0.04, 0.035, 0.04), BONE_DARK),
    ("ell", F(0, -0.075, 0.035), (0.03, 0.03, 0.02), BONE_DARK),
    ("cap", F(-0.04, 0.0, 0.055), F(0.04, 0.0, 0.055), 0.011, BONE_DARK),
    ("-ball", F(0.024, -0.016, 0.062), 0.016, VOID),
    ("-ball", F(-0.024, -0.016, 0.062), 0.016, VOID),
    ("-ell", F(0, -0.04, 0.072), (0.007, 0.01, 0.012), VOID),
]
for sign in (1, -1):
    skull.append(("ball", F(sign * 0.038, -0.035, 0.045), 0.012, BONE_DARK))
m.piece(skull, "Head", resolution=0.004, faces=700)
for sign in (1, -1):
    # The eyes: slanted, narrowed points of cold light, a white core in each.
    centre = F(sign * 0.024, -0.017, 0.06)
    m.sphere(centre + LEAN @ at(0, 0, 0.004), (0.0145, 0.006, 0.0075), EYE, "Head", segments=10, rings=6)
    m.sphere(centre + LEAN @ at(0, 0, 0.009), (0.007, 0.003, 0.0038), EYE_CORE, "Head", segments=8, rings=5)
for k in range(8):
    x = -0.021 + k * 0.006
    root = F(x, -0.062, 0.05 - abs(x) * 0.4)
    m.cone(root, root + LEAN @ at(0, -0.014, 0.002), 0.0032, BONE_DARK, "Head", segments=4)

# ── Shrouds: a tattered mantle over the shoulders, long torn sleeves, strips streaming from the waist and
# down the back, and shredded wisps trailing off the end of it all. ──
N = 30
cols = []
c, run, front = spine.along(0.86)
for i in range(N):
    phi = 2 * math.pi * i / N
    dx, dz = math.sin(phi), math.cos(phi)
    backness = (1 - dz) / 2
    fold = 1 + 0.12 * math.sin(6 * phi + 0.4)
    length = (0.26 + 0.34 * backness) * (0.4 + 0.6 * rnd.random()) * (0.55 if rnd.random() < 0.3 else 1.0)
    col = []
    for j in range(8):
        w = j / 7
        flare = math.sqrt(w)
        rx = 0.1 + (0.27 * fold - 0.1) * flare
        rz = 0.09 + (0.18 * fold - 0.09) * flare
        col.append(at(c.x + rx * dx, c.y - 0.02 - length * w, c.z + rz * dz - 0.03 * w - 0.12 * backness * w * w))
    cols.append(col)
m.sheet(cols, SHROUD, "spine_03", thick=0.006, closed=True)

cols = []
for i in range(N):
    phi = 2 * math.pi * i / N
    dx, dz = math.sin(phi), math.cos(phi)
    backness = (1 - dz) / 2
    fold = 1 + 0.2 * math.sin(7 * phi) + 0.07 * math.sin(15 * phi)
    length = (0.48 + 0.3 * backness) * (0.3 + 0.7 * rnd.random() ** 0.7) * (0.55 if rnd.random() < 0.3 else 1.0)
    col = []
    for j in range(10):
        w = j / 9
        f = 1 + (fold - 1) * min(1.0, w * 2.5)
        rx = (0.15 + 0.08 * w) * f
        rz = (0.12 + 0.07 * w) * f
        col.append(at(rx * dx, hips + 0.05 - length * w, rz * dz - (0.04 + 0.35 * backness) * w * w))
    cols.append(col)
m.sheet(cols, SHROUD, "pelvis", thick=0.006, closed=True)

for k in range(26):
    u = rnd.uniform(0.15, 0.85)
    centre, run, front = tail.along(u)
    angle = rnd.uniform(0, 2 * math.pi)
    radius = 0.13 * (1 - u) + 0.02
    out = Vector((math.cos(angle), 0, math.sin(angle)))
    top = at(*(centre + out * radius * 0.95))
    m.strip(top, at(out.x * 0.2, -1.0, out.z * 0.15 - 0.8), at(-out.z, 0, out.x), rnd.uniform(0.3, 0.7), rnd.uniform(0.05, 0.11), SHROUD_2 if k % 3 else SHROUD, "pelvis", curl=0.06, rnd=rnd)
for k in range(22):
    centre, run, front = tail.along(0.55 + 0.4 * (k % 4) / 3)
    angle = 2 * math.pi * k / 22 + rnd.uniform(-0.2, 0.2)
    tip = at(*centre)
    pts = [tip]
    for j in range(1, 7):
        w = j / 6
        reach = 0.3 + 0.25 * ((k * 7) % 5) / 4
        pts.append(tip + Vector((0.1 * math.cos(angle) * w, reach * w + 0.04 * math.sin(angle + w * 4), -0.12 * w + 0.1 * w * w + 0.05 * math.sin(angle) * w)))
    m.sweep(pts, (0.02, 0.001), SHROUD_2 if k % 2 else SHROUD, "pelvis", segments=4, flat=0.35)
for side, sign in (("l", 1), ("r", -1)):
    # The sleeve torn to shreds below the arm, longest towards the elbow; then the bare bony forearm.
    columns = []
    for k in range(10):
        u = k / 9
        x = sx + p["arm"] * (0.05 + 0.55 * u)
        top = at(sign * x, ay - 0.03, az + 0.01 * math.sin(k * 2.0))
        length = (0.12 + 0.26 * math.sin(math.pi * (0.2 + 0.8 * u))) * (0.45 + 0.55 * rnd.random()) * (0.6 if k % 3 == 1 else 1.0)
        columns.append([top + at(sign * 0.1 * w * length, -length * w, -0.04 * w * w + 0.012 * math.sin(k * 1.7 + w * 3)) for w in (j / 6 for j in range(7))])
    m.sheet(columns, SHROUD, f"upperarm_{side}", thick=0.005)

m.finish(humanoid_actions(arm_down=58, walk_swing=8), bake={"size": 512, "ao": 0.12, "mottle": 0.1, "mottle_scale": 30, "dirt": 0.0})

low = 0.3


def mostly_pelvis(co, here):
    if co.z >= hips + 0.02 or abs(co.x) > sx + 0.05:
        return None
    k = max(0.0, min(1.0, (co.z - low) / (hips - low))) ** 1.5
    lean = max(0.0, min(1.0, 0.5 + co.x / 0.16))
    thigh = 0.3 * k
    return {"pelvis": 1 - thigh, "thigh_l": thigh * lean, "thigh_r": thigh * (1 - lean)}


reweight(m, mostly_pelvis)
lift(m, {"Idle": [(1, (0, 0, 0)), (30, (0, 0.03, 0)), (60, (0, 0, 0))], "Walk": [(1, (0, 0, 0)), (16, (0, 0.02, 0)), (31, (0, 0, 0))], "Attack": [(1, (0, 0, 0)), (10, (0, 0.05, 0)), (26, (0, 0, 0))]})
write(m)
