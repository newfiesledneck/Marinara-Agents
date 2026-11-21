"""Ogre (SRD: Large giant): nearly three metres of fat and muscle, pot-bellied and stooped, with a small
bald head sunk between massive shoulders, a heavy brow over small dull eyes, a broad flat nose and an
underbite with two lower tusks, a topknot of lank hair and warty olive skin; a hide skirt trimmed with
fur on a belt under the belly, a pelt over one shoulder, a cord of teeth, iron wrist bands and a spiked
greatclub. Writes assets/models/ogre.glb. Run (BLENDER: your Blender executable):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_ogre.py
"""

import math
import os
import sys

import bpy
from mathutils import Matrix

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wwblend import STIFF, THRESHOLD, Model, Vector, at, humanoid_actions, humanoid_body, humanoid_joints, shade  # noqa: E402

bpy.ops.wm.read_factory_settings(use_empty=True)

SKIN = 0x9A8F62
DARK = shade(SKIN, 0.68)
WART = shade(SKIN, 0.8)
LIPS = shade(SKIN, 0.78)
HIDE = 0x76583A
HIDE_DARK = 0x5E452C
FUR = 0x4A3B2C
FUR_LIGHT = 0x6A5740
STRAP = 0x3E2C1E
IRON = 0x55585C
RIVET = 0x7A7C7E
BONE = 0xE0D4B4
TEETH = 0xD8CCA4
HAIR = 0x2A2018
WOOD = 0x6A4A2C
p = {
    "leg": 1.26,
    "torso": 1.02,
    "neck": 0.06,
    "shoulders": 0.84,
    "hips": 0.46,
    "arm": 1.08,
    "thick": 1.95,
    "chest": (0.48, 0.37),
    "waist": (0.45, 0.37),
    "belly": 0.36,
    "hunch": 0.2,
    "hand": 2.3,
    "foot": 2.0,
}
m = Model("ogre", resolution=0.017, faces=6200)
m.group("head", resolution=0.0095, faces=4000, bone="Head")
m.rig(humanoid_joints(p))
b = humanoid_body(m, p, {"skin": SKIN, "nails": 0x4A3E2A})
s, t, arm_y, sx, hx, chest_y, knee = b["s"], b["t"], b["arm_y"], b["sx"], b["hx"], b["chest_y"], b["knee"]
hips = p["leg"]
(chest_x, chest_z), (waist_x, waist_z) = p["chest"], p["waist"]
hunch = p["hunch"]
elbow, wrist = p["arm"] * 0.52, p["arm"]
# The head is shaped in a goblin-sized frame (a skull about 0.1 across) and scaled up by K.
K = 2.0
hy = b["head_y"] + 0.06 * K
hz = hunch + 0.045 * K
PITCH = 0.28  # the head bowed forward a little: a glare from under the brow


def ell(c, across, up, depth, colour=SKIN, negative=False, group="body"):
    m.ellipsoid(at(*c), (across, depth, up), colour, negative, group=group)


def ball(c, r, colour=SKIN, negative=False, group="body"):
    m.ball(at(*c), r, colour, negative, group=group)


def cap(a, c, r, colour=SKIN, negative=False, group="body"):
    m.capsule(at(*a), at(*c), r, colour, negative, group=group)


def hp(x, y, z):
    """A point on the head, from the goblin-sized frame (bowed by PITCH)."""
    y, z = y * math.cos(PITCH) - z * math.sin(PITCH), z * math.cos(PITCH) + y * math.sin(PITCH)
    return (x * K, hy + y * K, hz + z * K)


def hell(c, across, up, depth, colour=SKIN, negative=False):
    ell(hp(*c), across * K, up * K, depth * K, colour, negative, "head")


def hball(c, r, colour=SKIN, negative=False):
    ball(hp(*c), r * K, colour, negative, "head")


def hcap(a, c, r, colour=SKIN, negative=False):
    cap(hp(*a), hp(*c), r * K, colour, negative, "head")


# ── The head: small for the body and pushed forward, a low bald dome, a heavy shelf of brow over small
# deep-set eyes, a broad flat nose, fat cheeks and jowls, and a jutting lower jaw whose lip and tusks
# stand out past the upper. ──
hell((0, 0.026, -0.034), 0.08, 0.074, 0.084)
hell((0, -0.034, 0.002), 0.108, 0.066, 0.088)
hell((0, -0.074, 0.032), 0.1, 0.046, 0.076)
hell((0, -0.1, 0.066), 0.054, 0.03, 0.034)
hell((0, -0.106, -0.012), 0.096, 0.044, 0.07)
hell((0, 0.032, 0.066), 0.09, 0.027, 0.036, shade(SKIN, 0.88))
for sign in (1, -1):
    hball((sign * 0.03, 0.026, 0.088), 0.021, shade(SKIN, 0.86))
    hball((sign * 0.064, 0.038, 0.064), 0.021, shade(SKIN, 0.9))
    hball((sign * 0.066, -0.016, 0.054), 0.035)
    hball((sign * 0.035, 0.006, 0.092), 0.017, DARK, negative=True)
    hell((sign * 0.036, 0.015, 0.088), 0.022, 0.01, 0.014, shade(SKIN, 0.86))
    hell((sign * 0.038, -0.006, 0.09), 0.021, 0.009, 0.013, shade(SKIN, 0.92))
    hball((sign * 0.027, -0.03, 0.112), 0.018, shade(SKIN, 0.95))
    hball((sign * 0.013, -0.04, 0.119), 0.006, 0x241810, negative=True)
    hball((sign * 0.06, -0.068, 0.088), 0.008, 0x2A1410, negative=True)
    hcap((sign * 0.026, -0.04, 0.104), (sign * 0.062, -0.075, 0.08), 0.007, shade(SKIN, 0.9))
hcap((0, 0.014, 0.097), (0, -0.018, 0.114), 0.016, shade(SKIN, 0.95))
hell((0, -0.03, 0.121), 0.034, 0.022, 0.024, shade(SKIN, 0.95))
hcap((-0.056, -0.064, 0.098), (0.056, -0.064, 0.098), 0.008, 0x24120E, negative=True)
hell((0, -0.077, 0.108), 0.056, 0.011, 0.02, LIPS)

for sign in (1, -1):
    # Small dull yellow eyes in the shadow of the brow.
    eye = at(*hp(sign * 0.035, 0.005, 0.085))
    m.sphere(eye, (0.0095 * K, 0.008 * K, 0.008 * K), 0xB09C60, "Head", segments=10, rings=8)
    m.sphere(eye + Vector((sign * 0.001, -0.0075 * K, 0)), (0.004 * K, 0.0025 * K, 0.0045 * K), 0x1A1008, "Head", segments=8, rings=6)
    # Smallish ears, low and set back, a little pointed.
    base, tip = at(*hp(sign * 0.092, -0.004, -0.012)), at(*hp(sign * 0.165, 0.03, -0.045))
    facing = Vector((sign * 0.25, -1, 0.1)).normalized()
    m.leaf(base, tip, 0.075 * K, 0.014 * K, SKIN, "Head", facing, bend=(0, 0.01 * K, -0.012 * K), notch=0.55 if sign < 0 else None, steps=7, cup=0.4, inner=shade(SKIN, 0.75))
    # Two thick lower tusks standing up past the upper lip.
    root = at(*hp(sign * 0.04, -0.074, 0.112))
    m.cone(root, root + Vector((sign * 0.008 * K, -0.004 * K, 0.052 * K)), 0.013 * K, BONE, "Head", segments=7)
for x in (-0.018, 0.0, 0.018):
    root = at(*hp(x, -0.072, 0.114))
    m.cone(root, root + Vector((0, -0.002 * K, 0.014 * K)), 0.0065 * K, TEETH, "Head", segments=5)
# A topknot of lank black hair, bound with a cord, its tail down the back of the head.
knot = at(*hp(0, 0.1, -0.04))
m.sphere(knot, (0.026 * K, 0.026 * K, 0.03 * K), HAIR, "Head", segments=8, rings=6)
m.ring(knot + Vector((0, 0, -0.016 * K)), 0.018 * K, 0.004 * K, STRAP, "Head", segments=10)
m.strand([knot + Vector((0, 0.01 * K, 0.01 * K)), at(*hp(0.01, 0.13, -0.08)), at(*hp(0.0, 0.08, -0.12)), at(*hp(-0.01, 0.0, -0.13))], 0.017 * K, 0.005 * K, HAIR, "Head", segments=6)
for sign in (1, -1):
    m.strand([at(*hp(sign * 0.07, 0.04, -0.04)), at(*hp(sign * 0.09, -0.02, -0.06)), at(*hp(sign * 0.095, -0.07, -0.06))], 0.005 * K, 0.002 * K, HAIR, "Head", segments=4)

# ── The body: a fat neck sunk into massive sloping shoulders, a stooped back, heavy sagging chest, a
# pot belly that hangs over the belt, thick arms with huge forearms, short heavy legs. ──
for sign in (1, -1):
    ell((sign * 0.17 * s, arm_y + 0.07 * s, hunch * 0.35), 0.17 * s, 0.1 * s, 0.15 * s)
    ell((sign * (sx + 0.02 * s), arm_y + 0.02 * s, 0.0), 0.15 * s, 0.13 * s, 0.14 * s)
    ell((sign * 0.15 * s, chest_y + 0.12 * s, hunch * 0.2 + chest_z * 0.78), 0.16 * s, 0.11 * s, 0.09 * s)
    ell((sign * 0.27 * s, hips + 0.14 * s, 0.02), 0.11 * s, 0.13 * s, 0.17 * s)
    ell((sign * (sx + elbow * 0.5), arm_y + 0.015 * s, 0.01), elbow * 0.34, 0.085 * s, 0.09 * s)
    ell((sign * (sx + elbow + 0.13 * s), arm_y + 0.005 * s, 0.0), 0.15 * s, 0.09 * s, 0.085 * s)
    ball((sign * hx, knee + 0.01 * s, 0.05 * s), 0.07 * s)
    ell((sign * (hx + 0.035 * s), (hips + knee) / 2 + 0.03 * s, 0.01), 0.17 * s, 0.24 * s, 0.165 * s)
    ell((sign * hx, knee - 0.13 * s, -0.04 * s), 0.105 * s, 0.14 * s, 0.1 * s)
    ell((sign * hx, b["f"] * 0.12, 0.0), 0.075 * s, 0.07 * s, 0.075 * s)
ell((0, chest_y + 0.18 * s, -0.14 * s), 0.34 * s, 0.24 * s, 0.17 * s)
ell((0, chest_y + 0.1 * s, 0.04 * s), 0.4 * s, 0.3 * s, 0.31 * s)
ell((0, hips + 0.15 * s, 0.17 * s), 0.34 * s, 0.26 * s, 0.29 * s)
ball((0, hips + 0.17 * s, 0.17 * s + 0.29 * s * 0.98), 0.018 * s, DARK, negative=True)
# A heavy trunk all the way round: broad lats under the arms, thick flanks and a fat lower back, so the
# chest runs into the belly with no waist.
for sign in (1, -1):
    ell((sign * 0.28 * s, chest_y + 0.08 * s, -0.05 * s), 0.15 * s, 0.26 * s, 0.2 * s)
    ell((sign * 0.3 * s, hips + 0.3 * s, 0.02 * s), 0.15 * s, 0.22 * s, 0.24 * s)
    ell((sign * 0.14 * s, hips + 0.25 * s, -0.17 * s), 0.17 * s, 0.2 * s, 0.13 * s)
# A pelt over the left shoulder, lying on it like skin over muscle (so it moves with it).
ell((0.6 * sx, arm_y + 0.13 * s, hunch * 0.3), 0.2 * s, 0.11 * s, 0.22 * s, FUR)
ell((0.55 * sx, chest_y + 0.2 * s, hunch * 0.2 + chest_z * 0.95), 0.19 * s, 0.16 * s, 0.08 * s, FUR_LIGHT)
ell((0.6 * sx, chest_y + 0.2 * s, -0.25 * s), 0.21 * s, 0.17 * s, 0.09 * s, FUR)
ell((sx + 0.05 * s, arm_y + 0.08 * s, 0.0), 0.15 * s, 0.07 * s, 0.17 * s, FUR_LIGHT)


# ── Fitting gear to the skin: the metaball field, to find the body's surface and its normal. ──
BODY = [e for e in m.elements if e[4] == "body"]


HEAD = [e for e in m.elements if e[4] == "head"]


def field(q, elements=BODY):
    return sum((-1 if e[3] else 1) * STIFF * m._field(q, e) for e in elements)


def seat(centre, towards, r, colour, group="body"):
    """A small lump (a wart) of radius r sat on the skin where a ray from `centre` towards `towards`
    (game coordinates) leaves it, sunk a little so it joins the skin rather than floating."""
    c, d = at(*centre), at(*towards) - at(*centre)
    d.normalize()
    q, step, elements = c, 0.004, BODY if group == "body" else HEAD
    while field(q + d * step, elements) >= THRESHOLD:
        q = q + d * step
    m.ball(q - d * r * 0.35, r, colour, group=group)


def surface(q, d, lift):
    """Where a ray from q (Blender coordinates) along d crosses the skin, lifted off it by `lift`."""
    d = Vector(d).normalized()
    step = 0.006
    if field(q) >= THRESHOLD:
        while field(q + d * step) >= THRESHOLD:
            q = q + d * step
    else:
        for _ in range(200):
            q = q - d * step
            if field(q) >= THRESHOLD:
                break
    return q + d * (step / 2 + lift)


def normal(q):
    e = 0.004
    g = Vector(
        (
            field(q + Vector((e, 0, 0))) - field(q - Vector((e, 0, 0))),
            field(q + Vector((0, e, 0))) - field(q - Vector((0, e, 0))),
            field(q + Vector((0, 0, e))) - field(q - Vector((0, 0, e))),
        )
    )
    return -g.normalized() if g.length > 0 else Vector((0, 0, 1))


# Warts, sat on the skin (the gear below doesn't need to know of them).
for towards in ((0.2 * s, chest_y + 0.3, 0.3), (-0.34 * s, chest_y - 0.1, 0.3), (0.12 * s, hips + 0.25, 0.6), (-0.2 * s, arm_y + 0.05, -0.3)):
    seat((0, towards[1], 0), towards, 0.018 * s, WART)
for towards in (hp(0.052, 0.062, 0.05), hp(-0.07, -0.036, 0.062), hp(0.06, 0.0, 0.03), hp(-0.04, 0.09, 0.01)):
    seat(hp(0, 0.0, 0.0), towards, 0.006 * K, WART, "head")


def radial(q, centre_fwd=0.0):
    """Outwards from the body's middle, level."""
    d = Vector((q.x, q.y + centre_fwd, 0))
    return d.normalized() if d.length > 1e-6 else Vector((0, -1, 0))


def strap(points, bone_of, width, thick, colour=STRAP, lift=0.006, dirs=None, piece=0.07, frames=False):
    """A flat strap through `points` (game coordinates, inside the body), laid on the skin: each point
    is pushed out along its direction (`dirs`, else level from the middle) to the surface."""
    raw = [at(*q) for q in points]
    pts = []
    for i, (a, c) in enumerate(zip(raw, raw[1:])):
        da = Vector(dirs[i]) if dirs else radial(a, -hunch * 0.2)
        dc = Vector(dirs[i + 1]) if dirs else radial(c, -hunch * 0.2)
        n = max(1, math.ceil((c - a).length / piece))
        for j in range(n + (1 if i == len(raw) - 2 else 0)):
            u = j / n
            pts.append(surface(a.lerp(c, u), da.lerp(dc, u), lift + thick / 2))
    made = []
    for a, c in zip(pts, pts[1:]):
        mid = (a + c) / 2
        y = (c - a).normalized()
        z = normal(mid - normal(mid) * (lift + thick / 2))
        z = (z - y * z.dot(y)).normalized()
        x = y.cross(z)
        rot = Matrix((x, y, z)).transposed().to_quaternion()
        m.box(mid, (width, (c - a).length * 1.12, thick), colour, bone_of(mid), rot)
        made.append((mid, x, y, z))
    return (pts, made) if frames else pts


def chest_bone(q):
    return "spine_03" if q.z > chest_y + 0.1 else ("spine_02" if q.z > hips + 0.3 else "spine_01")


# The belt, low under the overhanging belly in front and higher behind.
belt_y = hips + 0.02 * s
ring = []
for i in range(25):
    a = 2 * math.pi * i / 24
    ring.append((math.sin(a) * 0.05, belt_y + 0.07 * s * (1 - math.cos(a)) / 2 - 0.03 * s, math.cos(a) * 0.05))
belt = strap(ring, lambda q: "pelvis", 0.075 * s, 0.022 * s, STRAP, lift=0.004, dirs=[radial(at(*q)) for q in ring], piece=0.12)
front = belt[0]
m.box(front + Vector((0, -0.012 * s, 0)), (0.07 * s, 0.014 * s, 0.07 * s), IRON, "pelvis")

# A hide skirt of ragged flaps hanging from the belt, with a fur trim along its top; the front and back
# flaps longer.
for i in range(12):
    a = 2 * math.pi * (i + 0.5) / 12
    q = belt[round(a / (2 * math.pi) * (len(belt) - 1))]
    out = radial(q)
    length = (0.42 if abs(math.cos(a)) > 0.8 else 0.33) * s * (1 + 0.08 * math.sin(i * 2.7))
    top = q + out * 0.01 * s - Vector((0, 0, 0.02 * s))
    bottom = top + out * 0.05 * s - Vector((0, 0, length))
    colour = HIDE if i % 2 else HIDE_DARK
    m.leaf(top, bottom, 0.3 * s, 0.012 * s, colour, "pelvis", out, steps=6)
for i in range(30):
    q = belt[round(i / 30 * (len(belt) - 1))]
    out = radial(q)
    root = q + out * 0.012 * s - Vector((0, 0, 0.03 * s))
    tip = root + out * 0.05 * s - Vector((0, 0, (0.09 + 0.03 * (i % 3)) * s))
    m.cone(root, tip, 0.04 * s, FUR if i % 2 else FUR_LIGHT, "pelvis", segments=5, flat=0.55, facing=out)

# A shaggy pelt over the left shoulder (see the body above), its ragged lower edges tufted; a strap
# across the chest to the right side holds it.
UP = Vector((0, 0, 1))
for x, y, z, sz in ((0.62, -0.12, 0.28, 1.0), (0.4, -0.08, 0.3, 0.8), (0.62, -0.14, -0.26, 1.0), (0.9, -0.02, 0.22, 0.8), (0.9, -0.02, -0.2, 0.8)):
    for k in range(4):
        u = (k - 1.5) / 1.5
        inner = at(x * sx + u * 0.08 * s, arm_y + y * s, z * 0.4)
        # (Level rays near the shoulder would run out along the T-posed arm: those tilt up.)
        ray = radial(inner, -hunch * 0.2) + UP * (1.2 if x > 0.8 else 0.0)
        root = surface(inner, ray, -0.01 * s)
        tip = root + radial(root, -hunch * 0.2) * 0.03 * s - UP * (0.08 + 0.03 * (k % 2)) * s * sz
        m.cone(root, tip, 0.04 * s, FUR if k % 2 else FUR_LIGHT, chest_bone(root), segments=5, flat=0.6, facing=radial(root, -hunch * 0.2))
# Over the top of the arm the tufts lie along it, towards the elbow (downwards once the arm hangs).
for k in range(6):
    ang = math.radians(-75 + 30 * k)
    d = Vector((0, -math.sin(ang), math.cos(ang)))
    root = surface(at(sx + 0.17 * s, arm_y, 0), d, -0.01 * s)
    m.cone(root, root + Vector((0.1 * s, 0, 0)) + d * 0.025 * s, 0.045 * s, FUR if k % 2 else FUR_LIGHT, "upperarm_l", segments=5, flat=0.6, facing=d)
strap(
    [
        (0.5 * sx, chest_y + 0.08 * s, 0.2),
        (0.05 * s, chest_y - 0.02 * s, 0.2),
        (-0.2 * s, chest_y - 0.14 * s, 0.2),
        (-0.32 * s, chest_y - 0.18 * s, 0.0),
        (-0.2 * s, chest_y - 0.1 * s, -0.2),
        (0.05 * s, chest_y + 0.02 * s, -0.2),
        (0.5 * sx, chest_y + 0.12 * s, -0.2),
    ],
    chest_bone,
    0.06 * s,
    0.016 * s,
)

# A cord of teeth and finger bones round the thick neck, sagging low on the chest in front.
necklace = []
for i in range(17):
    a = math.radians(-160 + 20 * i)
    necklace.append((math.sin(a) * 0.12 * s, arm_y + 0.1 * s - 0.2 * s * (1 + math.cos(a)) / 2, math.cos(a) * 0.1 * s + hunch * 0.4))
dirs = [(radial(at(*q), -hunch * 0.4) + UP * (0.3 + 1.1 * (1 - math.cos(math.radians(-160 + 20 * i))) / 2)).normalized() for i, q in enumerate(necklace)]
cord, frames = strap(necklace, chest_bone, 0.014 * s, 0.012 * s, STRAP, dirs=dirs, piece=0.06, frames=True)
for i, (mid, x, y, z) in enumerate(frames):
    if z.y > -0.6 or i % 2:
        continue
    tooth = mid + z * 0.006 * s
    m.cone(tooth, tooth + Vector((0, 0, -(0.08 if i % 4 else 0.06) * s)) + z * 0.012 * s, 0.017 * s, BONE if i % 3 else TEETH, "spine_03", segments=5)

# Iron bands round the wrists, riveted.
for side, sign in (("l", 1), ("r", -1)):
    x = sign * (sx + wrist - 0.1 * s)
    centre = at(x, arm_y, 0)
    r = max((surface(centre, d, 0.0) - centre).length for d in ((0, 0, 1), (0, -1, 0), (0, 0, -1), (0, 1, 0)))
    m.tube(centre + Vector((-sign * 0.06 * s, 0, 0)), centre + Vector((sign * 0.06 * s, 0, 0)), r + 0.012 * s, r + 0.012 * s, IRON, f"lowerarm_{side}", segments=12)
    for k in range(6):
        a = 2 * math.pi * k / 6
        # (Half sunk in the band's face, which lies at r + 0.012 s.)
        m.sphere(centre + Vector((0, math.cos(a), math.sin(a))) * (r + 0.014 * s), (0.011 * s,) * 3, RIVET, f"lowerarm_{side}", segments=6, rings=4)

# ── The greatclub: a gnarled trunk thickening to a knotted head, a leather-wrapped grip, iron bands and
# spikes driven through. ──
# (Short enough, and held forward enough, that its head stays off the ground as the arm hangs and swings.)
k = s * 1.3
length = 0.64 * k
GRIP = 0x3E2C1E
club = [
    (m.strand, ([Vector((0, 0.1 * k, 0)), Vector((0.004 * k, -0.22 * k, 0)), Vector((-0.006 * k, -0.44 * k, 0.004 * k)), Vector((0, -length, 0))], 0.026 * k, 0.062 * k, WOOD, "hand_r", 10)),
    (m.sphere, (Vector((0, -length, 0)), (0.07 * k, 0.085 * k, 0.07 * k), WOOD, "hand_r", 12, 8)),
    (m.sphere, (Vector((0, 0.1 * k, 0)), (0.032 * k,) * 3, GRIP, "hand_r", 8, 6)),
    (m.tube, (Vector((0, 0.08 * k, 0)), Vector((0, -0.12 * k, 0)), 0.03 * k, 0.031 * k, GRIP, "hand_r", 10)),
    (m.sphere, (Vector((0.045 * k, -length * 0.62, 0.01 * k)), (0.03 * k,) * 3, shade(WOOD, 0.8), "hand_r", 8, 6)),
    (m.sphere, (Vector((-0.04 * k, -length * 0.45, -0.02 * k)), (0.025 * k,) * 3, shade(WOOD, 0.8), "hand_r", 8, 6)),
    (m.sphere, (Vector((0.02 * k, -length * 0.95, 0.055 * k)), (0.035 * k,) * 3, shade(WOOD, 0.85), "hand_r", 8, 6)),
]
for yy, rr in ((0.72, 0.058), (0.86, 0.066)):
    club.append((m.ring, (Vector((0, -length * yy, 0)), rr * k, 0.008 * k, IRON, "hand_r", (1, 1, 1), (0, 1, 0), 14)))
for i in range(9):
    a = 2 * math.pi * i / 9 + (0.35 if i % 2 else 0)
    yy = -length * (0.78 + 0.1 * (i % 3))
    rr = 0.055 * k
    d = Vector((math.cos(a), 0, math.sin(a)))
    club.append((m.cone, (Vector((0, yy, 0)) + d * rr, Vector((0, yy, 0)) + d * rr * 2.3, 0.014 * k, IRON, "hand_r", 5)))
club.append((m.cone, (Vector((0, -length - 0.07 * k, 0)), Vector((0, -length - 0.14 * k, 0)), 0.014 * k, IRON, "hand_r", 5)))
m.weapon(club, at(-(sx + p["arm"] + 0.06 * b["h"]), arm_y - 0.014 * b["h"], 0), tilt=-0.42)

m.finish(humanoid_actions(arm_down=74), bake={"size": 512, "ao": 0.2, "mottle": 0.12, "mottle_scale": 28, "dirt": 0.5})
mesh = bpy.data.objects["ogre"]
print(f"ogre: {max((mesh.matrix_world @ v.co).z for v in mesh.data.vertices):.2f} m tall (rest pose)")
