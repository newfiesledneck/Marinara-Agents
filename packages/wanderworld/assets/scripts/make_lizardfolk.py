"""Lizardfolk (SRD: Medium humanoid): a tall, heavily muscled reptile, green-scaled with a darker back and
pale yellow plates down its belly and throat, a long crocodile snout lined with teeth, eyes set high on
the sides of the head, a red-orange crest of spines from the crown down the back and along a thick tail;
a hide loincloth, a bone necklace, armbands, a heavy wooden club and a spiked wooden shield. Writes
assets/models/lizardfolk.glb. Run (BLENDER: your Blender executable):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_lizardfolk.py
"""

import math
import os
import sys

import bpy

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wwblend import STIFF, THRESHOLD, Model, Vector, at, humanoid_actions, humanoid_body, humanoid_joints, shade  # noqa: E402

bpy.ops.wm.read_factory_settings(use_empty=True)

SCALES = 0x4E7A3C
BACK = shade(SCALES, 0.72)
DARK = shade(SCALES, 0.62)
BELLY = 0xC6B878
CREST = 0xC4502A
CREST_TIP = 0xE0843A
EYE = 0xD8B030
TEETH = 0xE8E0C4
HIDE = 0x6A5238
STRAP = 0x3A2A1E
BAND = 0xA27C48
BONE = 0xE6DCC2
WOOD = 0x5A3E24
NAILS = 0x1E2416
p = {
    "leg": 0.92,
    "torso": 0.66,
    "neck": 0.15,
    "shoulders": 0.44,
    "hips": 0.24,
    "arm": 0.66,
    "thick": 1.2,
    "chest": (0.22, 0.17),
    "waist": (0.19, 0.15),
    "hunch": 0.14,
    "hand": 1.15,
    "foot": 1.4,
    "toes": 1.5,
    "fingers": 1.1,
    "claws": True,
}
m = Model("lizardfolk", resolution=0.011, faces=6200)
m.group("head", resolution=0.0075, faces=3500, bone="Head")
m.group("tail", resolution=0.014, faces=1200, bone="pelvis")
m.rig(humanoid_joints(p))
b = humanoid_body(m, p, {"skin": SCALES, "nails": NAILS})
s, t, arm_y, sx, hx, chest_y = b["s"], b["t"], b["arm_y"], b["sx"], b["hx"], b["chest_y"]
hips = p["leg"]
(chest_x, chest_z), (waist_x, waist_z) = p["chest"], p["waist"]
hunch = p["hunch"]
# The head is laid out at HS times these sizes: big and heavy on the thick neck.
HS = 1.3
hy = b["head_y"] + 0.055 * HS
hz = hunch + 0.02


def ell(c, across, up, depth, colour=SCALES, negative=False, group="body"):
    m.ellipsoid(at(*c), (across, depth, up), colour, negative, group=group)


def ball(c, r, colour=SCALES, negative=False, group="body"):
    m.ball(at(*c), r, colour, negative, group=group)


def cap(a, c, r, colour=SCALES, negative=False, group="body"):
    m.capsule(at(*a), at(*c), r, colour, negative, group=group)


def hd(x, dy, dz):
    return (x * HS, hy + dy * HS, hz + dz * HS)


def hell(c, across, up, depth, colour=SCALES, negative=False):
    ell(hd(*c), across * HS, up * HS, depth * HS, colour, negative, "head")


def hball(c, r, colour=SCALES, negative=False):
    ball(hd(*c), r * HS, colour, negative, "head")


def hcap(a, c, r, colour=SCALES, negative=False):
    cap(hd(*a), hd(*c), r * HS, colour, negative, "head")


def hat(x, dy, dz):
    return at(*hd(x, dy, dz))


def field(q, group="body"):
    """A group's metaball field at q (game coordinates): the skin is where it falls to THRESHOLD."""
    point = at(*q)
    return sum(STIFF * m._field(point, e) * (-1 if e[3] else 1) for e in m.elements if e[4] == group)


def on_skin(q, direction, lift=0.0, group="body"):
    """Where a line in from outside through q, along `direction`, leaves the skin on the far side of q."""
    d = Vector(direction).normalized()
    q = Vector(q) - d * 0.25
    inside = False
    for _ in range(500):
        if field(q, group) > THRESHOLD:
            inside = True
        elif inside:
            return Vector(q + d * lift)
        q += d * 0.002
    return Vector(q)


def paint(c, across, up, depth, colour, group="body"):
    """Colours the skin inside an ellipsoid (out to 0.79 of these radii) without changing its shape: a
    metaball and a carving one alike cancel out, and the carving one's colour wins inside it. (A clean
    edge, where colouring by the strongest metaball leaves ragged patches.)"""
    ell(c, across / 0.79, up / 0.79, depth / 0.79, SCALES, False, group)
    ell(c, across / 0.79, up / 0.79, depth / 0.79, colour, True, group)


# ── The head: a heavy skull, a long flat crocodile snout ending in a rounded tip with nostrils on top, a
# deep lower jaw, eyes set high on the sides in raised sockets, a pale throat. ──
hell((0, 0.02, -0.025), 0.072, 0.066, 0.08)
hell((0, -0.025, -0.005), 0.078, 0.054, 0.078)
hell((0, 0.002, 0.08), 0.056, 0.04, 0.07)
hell((0, -0.008, 0.16), 0.043, 0.03, 0.06)
hell((0, -0.012, 0.225), 0.035, 0.025, 0.04)
hell((0, -0.012, 0.256), 0.028, 0.02, 0.02)
hcap((0, 0.04, 0.0), (0, 0.006, 0.25), 0.015)
hell((0, -0.048, 0.06), 0.06, 0.022, 0.08)
hell((0, -0.046, 0.16), 0.038, 0.017, 0.07)
hell((0, -0.044, 0.225), 0.03, 0.014, 0.035)
hell((0, -0.06, 0.1), 0.04, 0.01, 0.1, BELLY)
hell((0, -0.066, -0.01), 0.06, 0.034, 0.06, BELLY)
for sign in (1, -1):
    # Raised sockets high on the sides, a bony brow over each.
    hball((sign * 0.05, 0.045, 0.045), 0.026)
    hcap((sign * 0.03, 0.06, 0.07), (sign * 0.062, 0.066, 0.03), 0.012, DARK)
    # Jaw muscles behind the mouth; the mouth itself, a long line curving up at its back.
    hball((sign * 0.06, -0.03, 0.0), 0.04)
    hcap((sign * 0.074, -0.022, -0.01), (sign * 0.056, -0.032, 0.07), 0.0055, 0x1A1E12, negative=True)
    hcap((sign * 0.056, -0.032, 0.07), (sign * 0.031, -0.032, 0.262), 0.005, 0x1A1E12, negative=True)
    hball((sign * 0.011, 0.002, 0.258), 0.0055, 0x141A10, negative=True)
    # Bumpy scale ridges along the top of the snout.
    for i in range(3):
        hball((sign * 0.022, 0.03 - i * 0.01, 0.06 + i * 0.05), 0.012, DARK)

for sign in (1, -1):
    # Eyes set into the sockets, golden with slit pupils, under a heavy lid.
    out = Vector((sign * 0.85, -0.45, 0.25)).normalized()
    skin = on_skin(hd(sign * 0.05, 0.045, 0.045), Vector((sign * 0.85, 0.25, 0.45)), group="head")
    r = 0.0165 * HS
    eye = at(*skin) - out * r * 0.45
    m.sphere(eye, (r, r, r * 0.92), EYE, "Head", segments=12, rings=8)
    m.sphere(eye + out * r * 0.9, (0.0035 * HS, 0.0035 * HS, 0.012 * HS), 0x10140A, "Head", segments=8, rings=6)
    m.sphere(eye + out * r * 0.95 + Vector((0, 0, 0.006)), (0.002,) * 3, 0xFFF4DC, "Head", segments=6, rings=4)
    m.sphere(eye + Vector((0, 0, r * 0.5)), (r * 1.12, r * 1.12, r * 0.62), DARK, "Head", segments=12, rings=6)
    # Rows of teeth: the upper pointing down, the lower up between them.
    for i in range(7):
        dz = 0.07 + i * 0.03
        width = 0.054 - (dz - 0.07) * 0.12
        root = hat(sign * width, -0.03, dz)
        length = (0.014 if i in (2, 6) else 0.009) * HS
        m.cone(root, root + Vector((sign * 0.001, 0, -length)), 0.0045 * HS, TEETH, "Head", segments=5)
        if i < 6:
            root = hat(sign * (width - 0.003), -0.036, dz + 0.015)
            m.cone(root, root + Vector((0, 0, 0.008 * HS)), 0.004 * HS, TEETH, "Head", segments=5)

# The crest: a row of spines swept back from the brow over the crown and down the back of the head,
# lowest at the brow.
CREST_HEAD = 7
for i in range(CREST_HEAD):
    u = i / (CREST_HEAD - 1)
    base = at(*on_skin(hd(0, 0.0, 0.05 - u * 0.15), Vector((0, 1, -0.5 * u)), group="head"))
    height = (0.03 + 0.04 * math.sin(min(1.0, u * 1.3) * math.pi * 0.5)) * HS
    tip = base + Vector((0, height * 1.2, height))
    colour = CREST if i % 2 == 0 else shade(CREST, 0.88)
    m.leaf(base + Vector((0, -0.012, -0.01)), tip, 0.045 * HS, 0.007, colour, "Head", (1, 0, 0), bend=(0, 0.01, -0.006), steps=6)

# ── The body: broad and heavily muscled: big shoulders and chest, thick arms and thighs, a thick neck,
# darker scales down the back, pale plates down the belly and throat. ──
cap((0, arm_y - 0.06, hunch * 0.4), (0, b["head_y"] + 0.02, hunch + 0.01), 0.075)
ell((0, b["head_y"] - 0.03, hunch - 0.03), 0.075, 0.09, 0.075)
front = hunch * 0.2 + chest_z
for sign in (1, -1):
    ell((sign * 0.095, chest_y + 0.16, front - 0.05), 0.11, 0.06, 0.04)
    ell((sign * (sx + 0.02), arm_y + 0.015, 0.0), 0.085, 0.075, 0.08)
    ell((sign * 0.12, arm_y + 0.06, -0.01), 0.11, 0.05, 0.075)
    ell((sign * (sx + p["arm"] * 0.27), arm_y + 0.01, 0.01), 0.12, 0.058, 0.058)
    ell((sign * (sx + p["arm"] * 0.66), arm_y + 0.006, 0.0), 0.11, 0.05, 0.05)
    ell((sign * (hx + 0.008), (hips + b["knee"]) / 2 + 0.06, 0.02), 0.096, 0.17, 0.098)
    ell((sign * hx, b["knee"] - 0.11, -0.035), 0.072, 0.11, 0.07)
    ell((sign * hx, b["knee"] + 0.01, 0.04), 0.05, 0.05, 0.04)
# A thick, barrel-like waist; darker scales down the back.
ell((0, hips + 0.2, 0.01), waist_x * 1.0, 0.16, waist_z * 1.1)
paint((0, chest_y + 0.1, hunch * 0.2 - chest_z), chest_x * 0.75, 0.26, 0.09, BACK)
paint((0, hips + 0.16, -waist_z * 1.05), waist_x * 0.7, 0.2, 0.08, BACK)
# Pale belly plates in rows from the groin to the collarbone, and on up the throat.
# (The skin's front is found first, then the plates laid on it: a smooth strip from the groin up the
# chest and the throat, raised a little, creased across into plates.)
strip = []
for i in range(14):
    u = i / 13
    up = hips + 0.06 + u * (arm_y - 0.03 - hips - 0.06)
    strip.append((on_skin((0, up, 0), (0, 0, 1)), waist_x * 0.55 + (chest_x * 0.62 - waist_x * 0.55) * u, (0, 0, 1)))
neck_a, neck_b = Vector((arm_y - 0.01, hunch * 0.42)), Vector((b["head_y"] + 0.0, hunch + 0.01))
for i in range(5):
    up, fwd = neck_a + (neck_b - neck_a) * (0.1 + i * 0.2)
    strip.append((on_skin((0, up, fwd), (0, -0.35, 1)), 0.052, (0, -0.35, 1)))
for n, (surface, across, out) in enumerate(strip):
    out = Vector(out).normalized()
    ell(tuple(surface - out * 0.014), across, 0.03, 0.024)
    paint(tuple(surface), across * 0.68, 0.045, 0.07, BELLY)
    if n % 2 == 1 and n < len(strip) - 1:
        cap((-across * 0.8, surface.y, surface.z), (across * 0.8, surface.y, surface.z), 0.0045, shade(BELLY, 0.86), negative=True)

# The crest goes on down the neck and the back, getting lower.
CREST_BACK = 9
for i in range(CREST_BACK):
    u = i / (CREST_BACK - 1)
    up = b["head_y"] - 0.04 - u * (b["head_y"] - 0.04 - hips - 0.1)
    base = at(*on_skin((0, up, 0.1), (0, 0, -1)))
    bone = "neck_01" if up > arm_y + 0.02 else ("spine_03" if up > chest_y + 0.08 else ("spine_02" if up > hips + 0.22 else "spine_01"))
    height = 0.075 - u * 0.04
    m.cone(base + Vector((0, -0.012, 0)), base + Vector((0, height * 0.75, height)), 0.024 - u * 0.008, CREST if i % 2 == 0 else shade(CREST, 0.88), bone, segments=6, flat=0.3, facing=(1, 0, 0))

# ── The tail: thick at the root, long, sweeping down to just off the ground, pale beneath, its crest
# dwindling to a row of dark scutes. ──
TAIL = 10


def along(u, drop=0.0):
    return (0.12 * u**2.2, hips - 0.05 - 0.95 * u + 0.18 * u * u - drop, -waist_z * 0.45 - 0.95 * u)


for i in range(TAIL):
    u0, u1 = i / TAIL, (i + 1) / TAIL
    r0, r1 = 0.105 * (1 - u0) ** 0.85 + 0.012, 0.105 * (1 - u1) ** 0.85 + 0.012
    cap(along(u0), along(u1), (r0 + r1) / 2, group="tail")
    cap(along(u0, r0 * 0.42), along(u1, r1 * 0.42), (r0 + r1) / 2 * 0.64, BELLY, group="tail")
    c = Vector(at(*along((u0 + u1) / 2)))
    height = 0.05 * (1 - u0) + 0.01
    colour = CREST if u0 < 0.45 else DARK
    m.cone(c + Vector((0, 0, r0 * 0.75)), c + Vector((0, height * 0.7, r0 * 0.75 + height)), 0.02 * (1 - u0) + 0.006, colour, "pelvis", segments=6, flat=0.35, facing=(1, 0, 0))

# ── Gear: a belt with hide flaps before and behind and at the sides, a cord necklace hung with bones and
# fangs, leather armbands, a wrapped wrist. ──
belt_y = hips + 0.04 * s
m.ring(at(0, belt_y, 0.0), 1, 0.12, STRAP, "pelvis", scale=(waist_x * 1.1, waist_z * 1.18, s * 0.3))
for sign, colour, length, width in ((1, HIDE, 0.3, 0.2), (-1, shade(HIDE, 0.82), 0.27, 0.22)):
    top, bottom = at(0, belt_y, sign * waist_z * 1.16), at(0.01, hips - length, sign * (waist_z * 1.12 + 0.02))
    m.leaf(top, bottom, width, 0.01, colour, "pelvis", (0, -sign, 0), notch=0.6, steps=8)
for sign in (1, -1):
    m.leaf(at(sign * waist_x * 1.02, belt_y, 0.01), at(sign * waist_x * 1.08, hips - 0.14, 0.0), 0.15, 0.008, shade(HIDE, 0.9), "pelvis", (sign, 0, 0), notch=0.4, steps=6)
# The necklace: a cord round the base of the neck, with bones and fangs hanging on the chest.
cord = []
for i in range(11):
    a = math.pi * (i / 10)
    x = math.cos(a) * 0.15
    q = on_skin((x, arm_y + 0.02 - math.sin(a) * 0.09, 0.0), (x * 0.4, 0.15, 1), lift=0.006)
    cord.append(at(*q))
m.strand(cord, 0.005, 0.005, STRAP, "spine_03", segments=5)
for i, x in enumerate((-0.09, -0.06, -0.03, 0.0, 0.03, 0.06, 0.09)):
    a = math.acos(max(-1, min(1, x / 0.15)))
    root = at(*on_skin((x, arm_y + 0.02 - math.sin(a) * 0.09, 0.0), (x * 0.4, 0.15, 1), lift=0.01))
    length = 0.06 if i == 3 else (0.045 if i % 2 == 0 else 0.035)
    tip = root + Vector((0, -0.015, -length))
    if i % 2 == 0:
        m.cone(root, tip, 0.009 if i == 3 else 0.007, BONE, "spine_03", segments=6)
    else:
        m.tube(root, tip, 0.006, 0.006, BONE, "spine_03", segments=5)
        m.sphere(tip, (0.009, 0.007, 0.007), BONE, "spine_03", segments=6, rings=4)
for side, sign in (("l", 1), ("r", -1)):
    m.ring(at(sign * (sx + p["arm"] * 0.3), arm_y + 0.006, 0.006), 0.068, 0.012, BAND, f"upperarm_{side}", axis=(1, 0, 0), segments=14)
    m.ring(at(sign * (sx + p["arm"] * 0.37), arm_y + 0.006, 0.006), 0.064, 0.008, STRAP, f"upperarm_{side}", axis=(1, 0, 0), segments=14)
for k in range(3):
    m.ring(at(-(sx + p["arm"] * 0.86 + k * 0.035), arm_y, 0), 0.043 - k * 0.002, 0.009, shade(HIDE, 1 - 0.08 * (k % 2)), "lowerarm_r", axis=(1, 0, 0), segments=12)

# ── The shield on the back of the left forearm (bestiary's size): wooden planks in a hide-bound rim, a
# bone boss and six bone spikes. ──
r = 0.24 * s
x = sx + p["arm"] * 0.75
y0 = arm_y + 0.044 * t + 0.022 * s
centre = at(x, y0, 0)
m.tube(centre - Vector((0, 0, 0.015 * s)), centre + Vector((0, 0, 0.015 * s)), r, r, WOOD, "lowerarm_l", segments=20, smooth=False)
for i in range(-2, 3):
    width = 2 * math.sqrt(max(0.0, r * r - (i * r * 0.36) ** 2)) * 0.96
    m.box(centre + Vector((i * r * 0.36 + r * 0.18, 0, 0.0155 * s)), (0.008, width * 0.98, 0.003), shade(WOOD, 0.7), "lowerarm_l")
m.ring(centre, r, 0.016 * s, STRAP, "lowerarm_l", segments=24)
m.sphere(centre + Vector((0, 0, 0.016 * s)), (r * 0.22, r * 0.22, r * 0.12), BONE, "lowerarm_l", segments=12, rings=6)
for i in range(6):
    a = i / 6 * math.pi * 2
    base = centre + Vector((math.cos(a) * r * 0.62, math.sin(a) * r * 0.62, 0.015 * s))
    m.cone(base, base + Vector((0, 0, 0.08 * s)), 0.018 * s, BONE, "lowerarm_l", segments=6)

# ── The club (bestiary's at 1.1): a heavy haft thickening to a knotted head, bound at the grip. ──
k = s * 1.1
length = 0.75 * k
club = [
    (m.tube, (Vector((0, 0.1 * k, 0)), Vector((0, -length, 0)), 0.025 * k, 0.065 * k, WOOD, "hand_r", 8)),
    (m.sphere, (Vector((0, -length, 0)), (0.068 * k,) * 3, WOOD, "hand_r", 10, 6)),
    (m.sphere, (Vector((0.05 * k, -length * 0.7, 0.02 * k)), (0.03 * k,) * 3, shade(WOOD, 0.8), "hand_r", 8, 5)),
    (m.sphere, (Vector((-0.04 * k, -length * 0.5, -0.03 * k)), (0.025 * k,) * 3, shade(WOOD, 0.8), "hand_r", 8, 5)),
    (m.sphere, (Vector((0.02 * k, -length * 1.02, 0.05 * k)), (0.03 * k,) * 3, shade(WOOD, 0.85), "hand_r", 8, 5)),
    (m.tube, (Vector((0, 0.09 * k, 0)), Vector((0, -0.06 * k, 0)), 0.03 * k, 0.031 * k, STRAP, "hand_r", 8)),
]
m.weapon(club, at(-(sx + p["arm"] + 0.06 * b["h"]), arm_y - 0.014 * b["h"], 0), tilt=-0.9)

m.finish(humanoid_actions(arm_down=72), bake={"size": 512, "ao": 0.1, "mottle": 0.12, "mottle_scale": 45, "dirt": 0.3})
