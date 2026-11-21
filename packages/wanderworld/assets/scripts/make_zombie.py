"""Zombie (SRD: Medium undead): the shambling corpse of a peasant about 1.75 metres tall, slightly hunched,
its head lolling to one side and forward. Grey-green mottled rotting skin with bruised and blackened
patches, sunken eyes clouded over, a sagging slack jaw hanging open on broken teeth, a rotted nose, a few
greasy strands of hair; torn, filthy peasant clothes (a linen shirt ripped open over a wound in its side
that shows the ribs, one sleeve torn away, trousers ragged below the knee) and bare, dirty feet.
Writes assets/models/zombie.glb. Run (BLENDER: your Blender executable):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_zombie.py
"""

import math
import os
import random
import sys

import bpy
from mathutils import Quaternion

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wwblend import Vector, at, humanoid_actions  # noqa: E402
from wwundead import Spine, Undead, fbm, stooped, surface  # noqa: E402

bpy.ops.wm.read_factory_settings(use_empty=True)
random.seed(11)

SKIN = 0x62685A
SKIN_PALE = 0x7A7E6E
ROT = 0x444C34
BRUISE = 0x544C50
DARKSKIN = 0x52584A
SOCKET = 0x2A2026
MOUTH = 0x1C0E10
LIP = 0x4E4248
WOUND = 0x3E1814
FLESH = 0x6A2C24
BONE = 0xA8987A
TEETH = 0x857650
TEETH_DARK = 0x5A4A32
EYE = 0x8E8A72
EYE_DIM = 0x6E6C5C
HAIR = 0x2C2822
SHIRT = 0x6A6250
SHIRT_DIRTY = 0x4C4536
BLOOD = 0x3E1E18
TROUSERS = 0x463C2E
TROUSERS_DARK = 0x30291F
ROPE = 0x4A3E2C
WOUND_AT = at(0.11, 1.2, 0.02)


def paint(q, colour):
    """Mottled rot on the skin, filth and old blood on the clothes."""
    if colour == SKIN:
        n = fbm(q, 4) + 0.35 * fbm(q, 15)
        if n > 0.42:
            return SKIN_PALE
        if n < -0.45:
            return ROT
        if -0.3 < n < -0.2:
            return BRUISE
        return SKIN if n > -0.12 else DARKSKIN
    if colour in (SHIRT, TROUSERS):
        dark = SHIRT_DIRTY if colour == SHIRT else TROUSERS_DARK
        near = (q - WOUND_AT).length
        if near < 0.1 + 0.05 * fbm(q, 20):
            return BLOOD
        # (Old blood run down the front from the mouth.)
        if colour == SHIRT and abs(q.x - 0.02 + 0.02 * fbm(q, 9)) < 0.035 and q.y < 0 and q.z > 1.12 + 0.08 * fbm(q, 13):
            return BLOOD
        n = fbm(q, 5) + 0.35 * fbm(q, 17)
        return dark if n < -0.15 else colour
    return colour


p = {
    "leg": 0.92,
    "torso": 0.56,
    "neck": 0.06,
    "shoulders": 0.37,
    "hips": 0.19,
    "arm": 0.62,
    "thick": 0.86,
    "chest": (0.15, 0.1),
    "waist": (0.12, 0.08),
    "hunch": 0.16,
    "hand": 1.08,
    "foot": 0.88,
    "fingers": 1.25,
    "toes": 1.05,
}
SPINE = [(0, 1.01, -0.005), (0, 1.18, 0.0), (0, 1.33, 0.035), (0, 1.445, 0.095), (0, 1.5, 0.15)]
SHOULDER = (1.405, 0.055)

m = Undead("zombie", resolution=0.009, faces=5600)
m.paint = paint
m.group("head", resolution=0.0045, faces=3900, bone="Head")
m.group("shirt", resolution=0.009, faces=2600, bone=None)
m.group("trousers", resolution=0.009, faces=1900, bone=None)
b = stooped(m, p, SPINE, SHOULDER, {"skin": SKIN, "feet": SKIN})
s, t, sx, hx, h, f = b["s"], b["t"], b["sx"], b["hx"], b["h"], b["f"]
hips = p["leg"]
ay, az = SHOULDER
spine = Spine([(0, hips, 0)] + SPINE)
X = Vector((1, 0, 0))


def ell(c, across, up, depth, colour=SKIN, negative=False, group="body"):
    m.ellipsoid(at(*c), (across, depth, up), colour, negative, group=group)


def ball(c, r, colour=SKIN, negative=False, group="body"):
    m.ball(at(*c) if not isinstance(c, Vector) else c, r, colour, negative, group=group)


def cap(a, c, r, colour=SKIN, negative=False, group="body"):
    m.capsule(at(*a), at(*c), r, colour, negative, group=group)


# Rotting, lumpy skin; cloth hanging in creases.
def rot_skin(co, normal):
    return normal * (0.0035 * fbm(co, 22) + 0.0014 * fbm(co, 80) - (0.004 if fbm(co, 9) < -0.5 else 0.0))


def creases(co, normal):
    folds = math.sin(co.x * 70 + 9 * fbm(co, 6)) * 0.5 + fbm(Vector((co.x * 3, co.y * 3, co.z * 0.6)), 10)
    return normal * (0.0045 * folds + 0.002 * fbm(co, 50))


m.shapes["body"] = rot_skin
m.shapes["head"] = lambda co, n: n * (0.0012 * fbm(co, 70) + 0.0009 * fbm(co, 160))
m.shapes["shirt"] = creases
m.shapes["trousers"] = creases

# ── The body: a lean, sagging torso along the stooped spine, a sunken belly, bony shoulders. ──
KEYS = [
    (0.0, 0.13, 0.088, 0.0, SKIN),
    (0.12, 0.122, 0.08, 0.004, SKIN),
    (0.26, 0.112, 0.074, -0.004, SKIN),
    (0.4, 0.138, 0.09, 0.006, SKIN),
    (0.55, 0.15, 0.098, 0.004, SKIN),
    (0.68, 0.14, 0.094, -0.008, SKIN),
    (0.8, 0.09, 0.075, -0.01, SKIN),
    (0.9, 0.044, 0.044, -0.006, SKIN),
    (1.0, 0.04, 0.04, -0.012, SKIN),
]
spine.body(m, KEYS)
for sign in (1, -1):
    c, run, front = spine.along(0.68)
    cap(tuple(c + X * sign * 0.05 - front * 0.01), (sign * sx, ay + 0.004, az), 0.04)
    ball((sign * sx, ay + 0.02, az), 0.032, SKIN)
    c, run, front = spine.along(0.86)
    cap(tuple(c + X * sign * 0.015), (sign * (sx - 0.03), ay + 0.025, az - 0.01), 0.022)
    # Collarbones and the crests of the hips showing through.
    c, run, front = spine.along(0.8)
    cap(tuple(c + front * 0.06 + X * sign * 0.01), (sign * (sx - 0.02), ay + 0.02, az + 0.03), 0.011, SKIN_PALE)
    ball((sign * hx, b["knee"] + 0.01, 0.022), 0.035, SKIN)
    ell((sign * (hx + 0.005), hips - 0.14, 0.008), 0.05, 0.14, 0.052)
    ell((sign * hx, b["knee"] - 0.1, -0.018), 0.035, 0.085, 0.037)
    # The cords of the neck, from behind each ear down to the notch at the top of the breastbone.
    c, run, front = spine.along(0.8)
    cap((sign * 0.046, SPINE[-1][1] + 0.03, SPINE[-1][2] - 0.01), tuple(c + front * 0.05 + X * sign * 0.014), 0.0115)
c, run, front = spine.along(0.9)
ball(tuple(c + front * 0.04), 0.012)

# The wound in its left side: a pit of dark flesh through the skin, two ribs bare across it.
ball(WOUND_AT + at(0.012, 0, 0), 0.05, WOUND, True)
ball(WOUND_AT + at(0.03, 0, 0), 0.035, FLESH, True)
for k, dy in enumerate((0.022, -0.016)):
    q0 = WOUND_AT + at(0.0, dy, 0.04)
    q1 = WOUND_AT + at(0.02, dy - 0.012, -0.045)
    m.capsule(q0, q1, 0.0075, BONE)
for k in range(3):
    q0 = WOUND_AT + at(0.01, 0.04 - 0.035 * k, 0.03 - 0.02 * k)
    m.capsule(q0, q0 + at(0.008, -0.03, -0.012), 0.005, FLESH)

# ── The head, lolling to its right and forward: a skull under thin, shrunken skin, the jaw hanging slack
# on broken teeth behind receded lips, the eyes sunk in their sockets, the nose rotted away. ──
HC = Vector((0.0, SPINE[-1][1] + 0.108, SPINE[-1][2] + 0.01))
LOLL = Quaternion((0, 1, 0), math.radians(-11)) @ Quaternion((1, 0, 0), math.radians(6))


def hp(x, y, z):
    """A point on the head from its centre (game axes), turned with the head's loll (Blender's space)."""
    return at(*HC) + LOLL @ at(x, y, z)


HINGE = (0, -0.042, -0.006)
OPEN = Quaternion((1, 0, 0), math.radians(22))


def jp(x, y, z):
    """A point on the jaw, hanging open about its hinge."""
    return at(*HC) + LOLL @ (OPEN @ at(x - HINGE[0], y - HINGE[1], z - HINGE[2]) + at(*HINGE))


def hell(c, across, up, depth, colour=SKIN, negative=False, pt=hp):
    m.ellipsoid(pt(*c), (across, depth, up), colour, negative, group="head")


def hball(c, r, colour=SKIN, negative=False, pt=hp):
    m.ball(pt(*c), r, colour, negative, group="head")


def hcap(a, c, r, colour=SKIN, negative=False, pt=hp):
    m.capsule(pt(*a), pt(*c), r, colour, negative, group="head")


hell((0, 0.03, -0.022), 0.075, 0.086, 0.097)
hell((0, 0.036, 0.035), 0.065, 0.062, 0.053)
hell((0, -0.012, -0.072), 0.058, 0.052, 0.036)
for sign in (1, -1):
    hcap((sign * 0.053, 0.004, 0.072), (0, 0.01, 0.088), 0.0125)
hell((0, -0.052, 0.058), 0.042, 0.032, 0.036)
hell((0, -0.073, 0.066), 0.032, 0.014, 0.024)
hcap((0, -0.012, 0.088), (0, -0.032, 0.096), 0.0068)
hell((0, -0.04, 0.096), 0.011, 0.013, 0.01, DARKSKIN)
for sign in (1, -1):
    hball((sign * 0.046, -0.036, 0.062), 0.0155, SKIN_PALE)
    hcap((sign * 0.05, -0.036, 0.055), (sign * 0.064, -0.03, 0.0), 0.0075)
    hball((sign * 0.053, -0.05, -0.018), 0.013)
    hcap((sign * 0.036, -0.03, 0.078), (sign * 0.02, -0.06, 0.07), 0.0095)
# The jaw: a U of bone under the skin from the chin back to the hinges, hanging open.
jaw = []
for k in range(9):
    phi = math.radians(-90 + 180 * k / 8)
    jaw.append((0.048 * math.sin(phi), -0.104 + 0.004 * abs(math.sin(phi)), 0.072 * math.cos(phi)))
for a, c in zip(jaw, jaw[1:]):
    hcap(a, c, 0.0115, pt=jp)
hball((0, -0.107, 0.071), 0.0145, pt=jp)
for sign in (1, -1):
    hcap((sign * 0.048, -0.103, 0.0), (sign * 0.055, -0.048, -0.01), 0.011, pt=jp)
# Hollows: deep sockets, sunken temples and cheeks, the nose rotted to a hole.
for sign in (1, -1):
    hball((sign * 0.03, -0.016, 0.09), 0.0235, SOCKET, True)
    hball((sign * 0.089, 0.002, 0.022), 0.019, DARKSKIN, True)
    hball((sign * 0.052, -0.068, 0.062), 0.016, DARKSKIN, True)
hell((0, -0.047, 0.101), 0.0085, 0.013, 0.013, MOUTH, True)
# Receded lips round the teeth, the lower on the jaw.
for pt, y in ((hp, -0.079),):
    arc = []
    for k in range(7):
        phi = math.radians(-62 + 124 * k / 6)
        arc.append((0.031 * math.sin(phi), y, 0.026 + 0.043 * math.cos(phi)))
    for a, c in zip(arc, arc[1:]):
        hcap(a, c, 0.0042, LIP, pt=pt)
# The darkness inside the mouth and behind the eyes.
m.sphere(hp(0, -0.09, 0.03), (0.03, 0.032, 0.032), MOUTH, "Head", segments=10, rings=6)
for sign, look in ((1, (0.002, -0.002)), (-1, (-0.002, 0.003))):
    centre = hp(sign * 0.028, -0.017, 0.064)
    m.sphere(centre + LOLL @ at(0, 0, -0.008), (0.017, 0.012, 0.016), SOCKET, "Head", segments=8, rings=5)
    # Small eyes sunk in the sockets, clouded over, not quite looking the same way.
    m.sphere(centre + LOLL @ at(0, -0.002, 0.0), (0.0092, 0.0088, 0.0092), EYE if sign > 0 else EYE_DIM, "Head", segments=10, rings=7)
    m.sphere(centre + LOLL @ at(look[0], look[1] - 0.002, 0.0088), (0.0032, 0.0032, 0.0012), 0x5A584A, "Head", segments=6, rings=4)
    # Heavy, half-shut upper lids.
    m.sphere(centre + LOLL @ at(0, 0.0045, 0.003), (0.0115, 0.0068, 0.0102), BRUISE, "Head", segments=10, rings=6)
    # Ears, the left one torn.
    base, tip = hp(sign * 0.074, -0.035, -0.012), hp(sign * 0.082, 0.012 if sign < 0 else -0.004, -0.022)
    m.leaf(base, tip, 0.07 if sign < 0 else 0.05, 0.01, SKIN, "Head", LOLL @ Vector((sign, 0.25, 0.15)).normalized(), bend=(0, 0.004, 0.006), notch=0.45 if sign > 0 else None, steps=6, cup=0.4, inner=DARKSKIN)
# Broken, uneven teeth, some gone.
for row in range(2):
    for k in range(14):
        if (row, k) in ((0, 2), (0, 8), (0, 9), (1, 4), (1, 5), (1, 11)):
            continue
        phi = math.radians(-70 + 140 * k / 13)
        x, z = 0.03 * math.sin(phi), 0.034 + 0.047 * math.cos(phi)
        length = 0.012 + 0.006 * random.random() - (0.003 if abs(phi) > 0.8 else 0)
        colour = TEETH if random.random() > 0.35 else TEETH_DARK
        if row == 0:
            root = hp(x, -0.078, z)
            tip = root + LOLL @ at(0, -length, 0)
        else:
            root = jp(x * 1.02, -0.095, z * 0.99)
            tip = root + LOLL @ OPEN @ at(0, length, 0)
        m.tube(root, tip, 0.0037, 0.0029, colour, "Head", segments=4, smooth=False)


def on_head(direction):
    q, d = surface(m, hp(0, 0.02, -0.02), LOLL @ at(*direction), "head")
    return q, d


# A few lank strands of hair left on the back and sides of a balding scalp, hanging close.
for k in range(46):
    a = random.uniform(-1.9, 1.9)
    e = random.uniform(0.0, 0.95)
    root, d = on_head((math.sin(a) * math.cos(e), math.sin(e), -math.cos(a) * math.cos(e)))
    root = root - d * 0.003
    length = random.uniform(0.05, 0.16)
    pts = [root]
    for j in range(1, 6):
        w = j / 5
        sag = Vector((0, 0, -length * w))
        pts.append(root + d * (0.006 * w + 0.012 * w * w) + sag + Vector((0.004 * math.sin(k + j * 2.1), 0.004 * math.cos(k * 1.3 + j), 0)))
    m.sweep(pts, (0.0028, 0.0008), HAIR, "Head", segments=3)

# ── Clothes: a filthy linen shirt, ripped open over the wound and at the collar, one sleeve torn off and
# the other ragged at the elbow, hanging out over trousers torn off below the knee; a cord for a belt. ──
SH = {"group": "shirt"}
for u, across, depth, push in ((0.05, 0.142, 0.1, 0.0), (0.15, 0.135, 0.094, 0.006), (0.28, 0.128, 0.09, 0.0), (0.42, 0.15, 0.1, 0.008), (0.55, 0.162, 0.108, 0.006), (0.68, 0.152, 0.104, -0.006), (0.78, 0.11, 0.09, -0.012)):
    c, run, front = spine.along(u)
    ell(tuple(c + front * push), across, depth * 1.02, depth, SHIRT, **SH)
c, run, front = spine.along(0.0)
ell(tuple(c + Vector((0, -0.07, 0.0))), 0.148, 0.06, 0.104, SHIRT, **SH)
for sign in (1, -1):
    c, run, front = spine.along(0.7)
    cap(tuple(c + X * sign * 0.05), (sign * sx, ay + 0.006, az), 0.054, SHIRT, **SH)
    ball((sign * sx, ay + 0.012, az), 0.05, SHIRT, **SH)
# The left sleeve, to a ragged end past the elbow.
el = p["arm"] * 0.52
cap((sx, ay, az), (sx + el + 0.04, ay, az), 0.05 * t + 0.012, SHIRT, **SH)
# Tears: the collar ripped open down the chest, a hole over the wound, a rip at the back and the belly.
c, run, front = spine.along(0.86)
ell(tuple(c + front * 0.07 + Vector((0, -0.04, 0))), 0.05, 0.1, 0.06, SKIN, True, **SH)
ball(tuple(Vector((0.13, 1.2, 0.02))), 0.075, SKIN, True, **SH)
ball((-0.06, 1.25, -0.13), 0.045, SKIN, True, **SH)
ball((-0.08, 0.98, 0.1), 0.04, SKIN, True, **SH)
ball((sx + el + 0.07, ay + 0.03, az + 0.03), 0.04, SKIN, True, **SH)
ball((sx + el + 0.07, ay - 0.03, az - 0.02), 0.035, SKIN, True, **SH)
# The right sleeve torn away, its stump ragged at the shoulder: a bite bared on that upper arm.
ball((-(sx + 0.075), ay + 0.04, az), 0.05, SKIN, True, **SH)
ball((-(sx + 0.15), ay + 0.004, az + 0.036), 0.024, WOUND, True)
ball((-(sx + 0.15), ay + 0.004, az + 0.048), 0.016, FLESH, True)
for sign in (1, -1):
    # Bony elbows and wrists, and the tendons of the forearm.
    el = p["arm"] * 0.52
    ball((sign * (sx + el), ay, az - 0.014), 0.026, SKIN_PALE)
    ball((sign * (sx + p["arm"] - 0.01), ay + 0.004, az - 0.008), 0.019, SKIN_PALE)
    cap((sign * (sx + el + 0.03), ay + 0.022, az + 0.004), (sign * (sx + p["arm"] - 0.04), ay + 0.016, az + 0.006), 0.009)

TR = {"group": "trousers"}
ell((0, hips + 0.03, 0.0), 0.138, 0.1, 0.098, TROUSERS, **TR)
for sign, low in ((1, 0.2), (-1, 0.31)):
    cap((sign * hx, hips - 0.02, 0), (sign * hx, b["knee"], 0.004), 0.08 * t + 0.014, TROUSERS, **TR)
    cap((sign * hx, b["knee"], 0.004), (sign * hx, low, 0.0), 0.058 * t + 0.016, TROUSERS, **TR)
    ball((sign * hx, b["knee"] - 0.1, -0.018), 0.05, TROUSERS, **TR)
# A rip at the left knee.
ball((hx + 0.01, b["knee"] + 0.01, 0.07), 0.035, SKIN, True, **TR)
belt = [at(0.142 * math.sin(2 * math.pi * k / 16), hips + 0.075 - 0.012 * math.cos(2 * math.pi * k / 16), 0.104 * math.cos(2 * math.pi * k / 16)) for k in range(17)]
m.sweep(belt, (0.007, 0.007), ROPE, "pelvis", segments=5, tip=False)
m.sweep([at(0.06, hips + 0.07, 0.1), at(0.065, hips + 0.02, 0.11), at(0.07, hips - 0.06, 0.105)], (0.006, 0.004), ROPE, "pelvis", segments=4)

rnd = random.Random(4)


def tatters(bone, top_at, n, length, colour, thick=0.004):
    """A ragged edge of cloth hanging below a seam: `top_at(i)` gives each column's top and the way out."""
    columns = []
    for i in range(n):
        top, out = top_at(i)
        L = length * (0.3 + 0.7 * rnd.random()) * (0.5 if i % 3 == 0 else 1.0)
        columns.append([top + Vector((0, 0, -L * j / 4)) + out * (0.004 * j + 0.005 * math.sin(i * 2.3 + j)) for j in range(5)])
    m.sheet(columns, colour, bone, thick=thick)


def hem(i, n=20, y=None, rx=0.148, rz=0.106):
    phi = 2 * math.pi * i / (n - 1) - math.pi * 0.95
    return at(rx * math.sin(phi), y, rz * math.cos(phi) + 0.0), at(math.sin(phi), 0, math.cos(phi)).normalized()


# The shirt's ragged hem round the hips, and the trousers' ends round the shins.
tatters("pelvis", lambda i: hem(i, 20, hips - 0.085, 0.132, 0.095), 20, 0.09, SHIRT)
for sign, low in ((1, 0.2), (-1, 0.31)):
    r = 0.058 * t + 0.017

    def shin(i, sign=sign, low=low, r=r):
        phi = 2 * math.pi * i / 10
        return at(sign * hx + r * math.sin(phi), low + 0.02, r * math.cos(phi)), at(math.sin(phi), 0, math.cos(phi)).normalized()

    tatters(f"calf_{sign > 0 and 'l' or 'r'}", shin, 11, 0.07, TROUSERS)

m.finish(humanoid_actions(arm_down=74, walk_swing=18), bake={"size": 512, "ao": 0.1, "mottle": 0.18, "mottle_scale": 40, "dirt": 0.3})
