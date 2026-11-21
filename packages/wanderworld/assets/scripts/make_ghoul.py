"""Ghoul (SRD: Medium undead): a stooped, emaciated corpse-eater about 1.6 metres tall, ashen grey-green
skin stretched over its ribs, spine, collarbones and knuckles, a skull-like head with sunken cheeks, pointed
ears, pale yellow eyes glowing deep in dark sockets, a flat nose of slits and a wide mouth of jagged teeth;
very long clawed fingers, long clawed toes, a few lank strands of hair and a tattered loincloth on a rope.
Writes assets/models/ghoul.glb. Run (BLENDER: your Blender executable):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_ghoul.py
"""

import math
import os
import sys

import bpy

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wwblend import STIFF, THRESHOLD, Model, Vector, at, humanoid_actions, humanoid_body, humanoid_joints, shade  # noqa: E402

bpy.ops.wm.read_factory_settings(use_empty=True)

SKIN = 0x8E9584
BONY = shade(SKIN, 1.1)
HOLLOW = shade(SKIN, 0.78)
SOCKET = 0x221E1A
MOUTH = 0x2A1414
GUMS = 0x5E3A3A
TEETH = 0xC9BD92
CLAW = 0x3A3228
EYE = 0xF6EC9C
GLOW = 0xFFFBD8
RAG = 0x5C5446
RAG_DARK = 0x463F35
ROPE = 0x4A4034
p = {
    "leg": 0.84,
    "torso": 0.56,
    "neck": 0.05,
    "shoulders": 0.3,
    "hips": 0.17,
    "arm": 0.7,
    "thick": 0.72,
    "chest": (0.13, 0.09),
    "waist": (0.09, 0.064),
    "hunch": 0.3,
    "hand": 1.25,
    "foot": 1.15,
    "fingers": 1.9,
    "toes": 1.6,
}
m = Model("ghoul", resolution=0.0075, faces=7000)
m.group("head", resolution=0.0045, faces=5200, bone="Head")
m.rig(humanoid_joints(p))
b = humanoid_body(m, p, {"skin": SKIN})
s, t, arm_y, sx, hx, chest_y, h, f = b["s"], b["t"], b["arm_y"], b["sx"], b["hx"], b["chest_y"], b["h"], b["f"]
hips, torso, hunch = p["leg"], p["torso"], p["hunch"]
(chest_x, chest_z), (waist_x, waist_z) = p["chest"], p["waist"]
hy = b["head_y"] + 0.075
hz = hunch + 0.035


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
    while inside(o + d * far) and far < 0.6:
        near, far = far, far + 0.006
    for _ in range(10):
        mid = (near + far) / 2
        near, far = (mid, far) if inside(o + d * mid) else (near, mid)
    return o + d * near, d


H = {"group": "head"}


def hp(x, y, z):
    """A point on the head, from its centre."""
    return (x, hy + y, hz + z)


# ── The head: a narrow skull, a heavy brow over deep dark sockets, cheekbones over hollow cheeks and
# temples, a flat nose of two slits, a wide mouth of jagged teeth and a pointed chin. The shapes first;
# the hollows are cut where the skin turns out to be, and the eyes and teeth set by what's left. ──
ell(hp(0, 0.03, -0.025), 0.072, 0.08, 0.092, **H)
ell(hp(0, -0.035, 0.03), 0.045, 0.06, 0.06, **H)
ell(hp(0, -0.082, 0.032), 0.038, 0.03, 0.054, **H)
ell(hp(0, -0.1, 0.056), 0.017, 0.016, 0.022, **H)
# (A brow knotted in a scowl: higher at the sides.)
for sign in (1, -1):
    cap(hp(0, 0.024, 0.052), hp(sign * 0.056, 0.036, 0.03), 0.014, **H)
cap(hp(0, 0.016, 0.07), hp(0, -0.018, 0.082), 0.006, BONY, **H)
ell(hp(0, -0.026, 0.08), 0.013, 0.008, 0.008, **H)


def on_head(x, y, direction=(0, 0, 1), depth=0.0):
    """Where the head's skin is, straight out from (x, y) on the head's middle; `depth` in from there."""
    q, d = surface(hp(x * 0.5, y, 0.0), direction, "head")
    return q - d * depth


cuts = []
for sign in (1, -1):
    cuts.append((on_head(sign * 0.029, 0.007, (sign * 0.15, 0, 1), 0.006), 0.022, SOCKET))
    cuts.append((on_head(sign * 0.03, -0.054, (sign * 0.9, 0, 1), -0.002), 0.017, HOLLOW))
    cuts.append((on_head(sign * 0.05, 0.03, (sign * 1, 0, 0.4), -0.007), 0.014, HOLLOW))
    cuts.append((on_head(sign * 0.007, -0.031, (sign * 0.1, -0.3, 1), 0.001), 0.0045, SOCKET))
cheeks = [on_head(sign * 0.03, -0.012, (sign * 1, 0, 0.8), 0.007) for sign in (1, -1)]
mouth = [on_head(x, -0.06, (x * 12, 0, 1), 0.0) for x in (-0.042, -0.028, -0.014, 0.0, 0.014, 0.028, 0.042)]
for q, r, colour in cuts:
    m.ball(q, r, colour, True, group="head")
for q in cheeks:
    m.ball(q, 0.011, BONY, group="head")
for a, c in zip(mouth, mouth[1:]):
    m.capsule(a, c, 0.0115, MOUTH, True, group="head")
# Darkness inside the mouth and at the back of each socket (a cut shows the skin's colour).
# (Small cuts just behind the skin, which take its colour without cutting much deeper.)
for x in (-0.03, -0.015, 0.0, 0.015, 0.03):
    q, d = surface(hp(x * 0.5, -0.06, 0.0), (x * 12, 0, 1), "head")
    m.ball(q - d * 0.003, 0.011, MOUTH, True, group="head")
for sign in (1, -1):
    q, d = surface(hp(sign * 0.024, 0.007, 0.0), (sign * 0.15, 0, 1), "head")
    m.ball(q - d * 0.003, 0.013, SOCKET, True, group="head")

for sign in (1, -1):
    # Small pale yellow eyes glowing at the bottom of the sockets, a bright point in each.
    eye, d = surface(hp(sign * 0.024, 0.007, 0.0), (sign * 0.15, 0, 1), "head")
    eye = eye - d * 0.002
    m.sphere(eye, (0.0072, 0.0055, 0.0062), EYE, "Head", segments=10, rings=8)
    m.sphere(eye + d * 0.0048 + Vector((0, 0, 0.0005)), (0.0028, 0.0012, 0.0028), GLOW, "Head", segments=6, rings=4)
    # Pointed ears swept back and up, cupped.
    base, tip = at(*hp(sign * 0.07, 0.0, -0.01)), at(*hp(sign * 0.15, 0.07, -0.075))
    m.leaf(base, tip, 0.06, 0.01, SKIN, "Head", Vector((sign, -0.4, 0.1)).normalized(), bend=(0, 0.01, 0.01), notch=0.55 if sign < 0 else None, steps=8, cup=0.4, inner=0x6E605A)
# Jagged teeth along the curve of the mouth, rooted in the lips: the upper row longer, pointing down,
# with longer fangs at the corners; the lower row pointing up.
for row, (y, dy, lengths) in enumerate(((-0.045, -1, (0.009, 0.016, 0.01, 0.012, 0.009, 0.013, 0.017, 0.01)), (-0.075, 1, (0.008, 0.011, 0.007, 0.009, 0.01, 0.007, 0.012, 0.008)))):
    for i, length in enumerate(lengths):
        x = -0.035 + i * 0.01
        root, d = surface(hp(x * 0.5, y, 0.0), (x * 12, 0, 1), "head")
        root = root - d * 0.005 + Vector((0, 0, dy * 0.004))
        m.cone(root, root + d * 0.002 + Vector((x * 0.1, 0, dy * length)), 0.0034 + length * 0.12, TEETH, "Head", segments=5)

# ── The body: gaunt; a hunched upper back with the shoulder blades showing, sinewy neck, knobbed
# shoulders, elbows, wrists and knees, the crests of the hips and a hollow belly. ──
# (The stoop: a rounded upper back that runs up into the base of the neck, so the head hangs forward.)
ell((0, arm_y - 0.03, hunch * 0.3 - chest_z * 0.45), sx * 0.75, 0.15, chest_z * 0.9)
ell((0, arm_y + 0.04, hunch * 0.42), 0.075, 0.07, 0.075)
# The chest leans forward with it; the hips are one piece with the thighs, not two knobs under a waist.
ell((0, arm_y - 0.04, hunch * 0.33), chest_x * 0.82, 0.09, chest_z * 0.85)
ell((0, hips - 0.01, 0.0), hx + 0.055, 0.075, waist_z * 1.15)
for sign in (1, -1):
    ell((sign * 0.06, arm_y - 0.07, hunch * 0.2 - chest_z * 0.82), 0.045, 0.06, 0.02, BONY)
    ball((sign * sx, arm_y + 0.022, 0.0), 0.03 * s, BONY)
    ell((sign * (sx + 0.025), arm_y + 0.004, 0.0), 0.05, 0.03, 0.032)
    elbow, wrist = p["arm"] * 0.52, p["arm"]
    ball((sign * (sx + elbow), arm_y, -0.012), 0.026, BONY)
    ball((sign * (sx + wrist - 0.01), arm_y, 0.0), 0.021, BONY)
    ball((sign * hx, b["knee"] + 0.01, 0.022), 0.033, BONY)
    # Bony ankles and the tendons over each foot.
    ball((sign * (hx + 0.03), 0.085 * s, 0.0), 0.014, BONY)
    ball((sign * (hx - 0.028), 0.09 * s, 0.0), 0.013, BONY)
    for toe in range(3):
        tx = sign * hx + (toe - 1) * 0.03 * f
        cap((sign * hx + (toe - 1) * 0.012, 0.08 * s, 0.02), (tx, 0.035 * f, 0.11 * f), 0.009)
    # Stringy thighs tapering to the knee, and a lean calf behind each shin.
    ell((sign * (hx + 0.008), hips - 0.13, 0.008), 0.044, 0.13, 0.046)
    ell((sign * hx, b["knee"] - 0.1, -0.016), 0.03, 0.08, 0.033)

# Then what lies on the skin: ribs arching round the chest (the lower ones starting wider apart, so the
# breastbone shows between them), the knobs of the spine, the collarbones. Placed where the skin is first.
centre_y, centre_z = chest_y + torso * 0.18, hunch * 0.2
ribs = []
for k in range(5):
    y0 = centre_y + 0.025 - k * 0.034
    for sign in (1, -1):
        points = []
        for j in range(7):
            theta = 0.28 + 0.07 * k + j * (1.75 - 0.07 * k) / 6
            q, d = surface((0, y0 + 0.035 * theta / 2, centre_z), (sign * math.sin(theta), 0, math.cos(theta)))
            points.append(q - d * 0.0025)
        ribs.append(points)
spine = []
for k in range(13):
    y = hips + 0.06 + k * (arm_y + 0.06 - hips - 0.06) / 12
    z = hunch * 0.3 * min(1.0, (y - hips) / (torso * 0.75)) + 0.0
    q, d = surface((0, y, z), (0, 0, -1))
    spine.append(q - d * 0.005)
collar = []
for sign in (1, -1):
    a, da = surface((sign * 0.02, arm_y - 0.03, centre_z), (0, -0.15, 1))
    c, dc = surface((sign * 0.06, arm_y - 0.01, centre_z), (sign * 0.5, 0.15, 1))
    collar.append((a - da * 0.003, c - dc * 0.003))
for points in ribs:
    for a, c in zip(points, points[1:]):
        m.capsule(a, c, 0.0056, BONY)
for q in spine:
    m.ball(q, 0.0095, BONY)
for a, c in collar:
    m.capsule(a, c, 0.0085, BONY)

# Long curved claws on the fingers, the thumbs and the toes (as humanoid_body lays the fingers out).
reach, length = p["fingers"], p["toes"]
for side, sign in (("l", 1), ("r", -1)):

    def x(offset):
        return sign * (sx + offset)

    wrist = p["arm"]
    for i in range(4):
        z = (i - 1.5) * 0.022 * h
        knuckle = at(x(wrist + (0.075 + 0.045 * reach) * h), arm_y - 0.012 * h, z * 1.08)
        tip = knuckle + Vector((sign * 0.035 * reach * h, 0, -0.022 * reach * h))
        bend = tip + Vector((sign * 0.03 * h, 0, -0.025 * h))
        m.tube(tip, bend, 0.0075 * h, 0.005 * h, CLAW, f"hand_{side}", segments=5)
        m.cone(bend, bend + Vector((sign * 0.012 * h, 0, -0.035 * h)), 0.005 * h, CLAW, f"hand_{side}", segments=5)
    thumb = at(x(wrist + 0.07 * h), arm_y - 0.012 * h, 0.075 * h)
    m.cone(thumb, thumb + Vector((sign * 0.03 * h, -0.02 * h, -0.02 * h)), 0.008 * h, CLAW, f"hand_{side}", segments=5)
    for toe in range(3):
        tx = sign * hx + (toe - 1) * 0.03 * f
        tip = at(tx * 1.03, 0.014 * f, (0.12 + 0.04 * length) * f)
        m.cone(tip, tip + Vector((0, -0.04 * f, -0.016 * f)), 0.009 * f, CLAW, f"ball_{side}", segments=5)

# ── Rags: a rope round the waist, a torn loincloth hanging front and back, and a strip at the hip. ──
belt_y = hips + 0.035 * s
m.ring(at(0, belt_y, 0.0), 1, 0.1, ROPE, "pelvis", scale=(waist_x * 1.25, waist_z * 1.35, 0.11))
m.leaf(at(0.005, belt_y, waist_z * 1.3), at(0.02, hips - 0.21, waist_z * 1.25 + 0.015), 0.13, 0.006, RAG, "pelvis", (0, -1, 0), notch=0.7, steps=8)
m.leaf(at(-0.03, belt_y - 0.01, waist_z * 1.32), at(-0.045, hips - 0.15, waist_z * 1.3 + 0.012), 0.07, 0.006, RAG_DARK, "pelvis", (0, -1, 0), notch=0.4, steps=6)
m.leaf(at(0, belt_y, -waist_z * 1.3), at(-0.01, hips - 0.24, -waist_z * 1.3 - 0.02), 0.14, 0.006, RAG_DARK, "pelvis", (0, 1, 0), notch=0.6, steps=8)
m.leaf(at(waist_x * 1.2, belt_y, 0.01), at(waist_x * 1.3, hips - 0.17, 0.0), 0.05, 0.005, RAG, "pelvis", (1, 0, 0), steps=6)

m.finish(humanoid_actions(arm_down=70), bake={"size": 512, "ao": 0.07, "mottle": 0.17, "mottle_scale": 45, "dirt": 0.2})
