"""Goblin (SRD: Small humanoid): about a metre tall, wiry and stooped, bare but for a leather loincloth, a
strap across its chest, bracers and wrapped feet; a long bony face with a hooked nose, deep-set eyes and a
crooked grin, big ears swept back, long clawed fingers and toes, and a notched scimitar. Writes
assets/models/goblin.glb. Run (BLENDER: your Blender executable):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_goblin.py
"""

import math
import os
import sys

import bpy
from mathutils import Matrix, Quaternion

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wwblend import Model, Vector, at, humanoid_actions, humanoid_body, humanoid_joints, shade  # noqa: E402

bpy.ops.wm.read_factory_settings(use_empty=True)

SKIN = 0x8E9A4E
DARK = shade(SKIN, 0.72)
LIPS = shade(SKIN, 0.78)
LEATHER = 0x5A3A26
STRAP = 0x4A3020
CLOTH = 0x6A3A28
BRASS = 0xA88A40
BONE = 0xE4DAC0
TEETH = 0xC9B98A
STEEL = 0xA8ADB0
p = {
    "leg": 0.44,
    "torso": 0.3,
    "neck": 0.045,
    "shoulders": 0.22,
    "hips": 0.12,
    "arm": 0.42,
    "thick": 1.05,
    "chest": (0.106, 0.08),
    "waist": (0.076, 0.064),
    "belly": 0.042,
    "hunch": 0.12,
    "hand": 1.55,
    "foot": 1.55,
    "fingers": 1.5,
    "toes": 1.7,
    "claws": True,
}
m = Model("goblin", resolution=0.0055, faces=8000)
m.group("head", resolution=0.0042, faces=6500, bone="Head")
m.rig(humanoid_joints(p))
b = humanoid_body(m, p, {"skin": SKIN, "nails": 0x2E2A22})
s, t, arm_y, sx, hx, chest_y = b["s"], b["t"], b["arm_y"], b["sx"], b["hx"], b["chest_y"]
hips = p["leg"]
(chest_x, chest_z), (waist_x, waist_z) = p["chest"], p["waist"]
hunch = p["hunch"]
hy = b["head_y"] + 0.075
hz = hunch + 0.015


def ell(c, across, up, depth, colour=SKIN, negative=False, group="body"):
    m.ellipsoid(at(*c), (across, depth, up), colour, negative, group=group)


def ball(c, r, colour=SKIN, negative=False, group="body"):
    m.ball(at(*c), r, colour, negative, group=group)


def cap(a, c, r, colour=SKIN, negative=False, group="body"):
    m.capsule(at(*a), at(*c), r, colour, negative, group=group)


H = {"group": "head"}

# ── The head: small for the body and long, a sloping forehead under a bony crown, a heavy brow over
# deep-set eyes, hollow cheeks under sharp cheekbones, a long hooked nose drooping at the tip, a jutting
# jaw with a thin-lipped, crooked grin, a pointed chin. ──
ell((0, hy + 0.02, hz - 0.025), 0.07, 0.078, 0.078, **H)
ell((0, hy + 0.03, hz - 0.065), 0.058, 0.064, 0.05, **H)
ell((0, hy + 0.04, hz + 0.022), 0.056, 0.036, 0.042, **H)
ell((0, hy + 0.021, hz + 0.05), 0.058, 0.012, 0.018, shade(SKIN, 0.88), **H)
ell((0, hy - 0.04, hz + 0.03), 0.054, 0.038, 0.058, **H)
ball((0, hy - 0.08, hz + 0.058), 0.017, **H)
for sign in (1, -1):
    ball((sign * 0.045, hy - 0.006, hz + 0.038), 0.021, **H)
    # Sockets sunk under the brow, a scowl's knot by the nose, heavy upper lids and bags beneath.
    ball((sign * 0.03, hy + 0.006, hz + 0.07), 0.013, DARK, negative=True, **H)
    ball((sign * 0.015, hy + 0.017, hz + 0.068), 0.009, shade(SKIN, 0.86), **H)
    ell((sign * 0.031, hy + 0.0135, hz + 0.063), 0.0155, 0.0058, 0.011, shade(SKIN, 0.9), **H)
    cap((sign * 0.02, hy - 0.006, hz + 0.066), (sign * 0.042, hy - 0.004, hz + 0.061), 0.0042, **H)
    # Crow's feet, and deep folds from the nose to the corners of the mouth.
    for k in range(2):
        cap((sign * 0.045, hy + 0.006 - k * 0.008, hz + 0.052), (sign * 0.056, hy + 0.01 - k * 0.013, hz + 0.04), 0.0025, shade(SKIN, 0.9), **H)
    cap((sign * 0.016, hy - 0.025, hz + 0.086), (sign * 0.036, hy - 0.062, hz + 0.073), 0.005, shade(SKIN, 0.9), **H)
    ball((sign * 0.013, hy - 0.037, hz + 0.087), 0.0085, shade(SKIN, 0.94), **H)
    ball((sign * 0.008, hy - 0.043, hz + 0.093), 0.0035, 0x241810, negative=True, **H)
    ball((sign * 0.034, hy - 0.068, hz + 0.074), 0.005, 0x2A1410, negative=True, **H)
for k in range(3):
    y = hy + 0.046 + k * 0.01
    cap((-0.036 + k * 0.004, y, hz + 0.045 - k * 0.006), (0.036 - k * 0.004, y, hz + 0.045 - k * 0.006), 0.0032, shade(SKIN, 0.9), **H)
# The nose: broad where it meets the face, a thin bony ridge with a hump, a narrow tip that hooks down.
ell((0, hy - 0.028, hz + 0.08), 0.021, 0.02, 0.02, shade(SKIN, 0.95), **H)
cap((0, hy + 0.012, hz + 0.066), (0, hy - 0.018, hz + 0.097), 0.0072, shade(SKIN, 0.95), **H)
ball((0, hy - 0.004, hz + 0.087), 0.0082, shade(SKIN, 0.95), **H)
ell((0, hy - 0.031, hz + 0.099), 0.0085, 0.014, 0.0105, shade(SKIN, 0.93), **H)
cap((-0.032, hy - 0.062, hz + 0.08), (0.032, hy - 0.062, hz + 0.08), 0.0085, 0x24120E, negative=True, **H)
cap((-0.03, hy - 0.054, hz + 0.082), (0.03, hy - 0.054, hz + 0.082), 0.004, LIPS, **H)
cap((-0.026, hy - 0.07, hz + 0.08), (0.026, hy - 0.07, hz + 0.08), 0.004, LIPS, **H)
for c, r in (((0.048, hy + 0.03, hz + 0.03), 0.004), ((-0.04, hy - 0.05, hz + 0.065), 0.0035), ((0.005, hy - 0.006, hz + 0.093), 0.003)):
    ball(c, r, DARK, **H)

for sign in (1, -1):
    # Small amber eyes deep in their sockets, under the lids.
    eye = at(sign * 0.03, hy + 0.004, hz + 0.06)
    m.sphere(eye, (0.011, 0.009, 0.0095), 0xD9A030, "Head")
    m.sphere(eye + Vector((sign * 0.001, -0.0085, 0)), (0.0045, 0.0025, 0.005), 0x120C08, "Head", segments=8, rings=6)
    m.sphere(eye + Vector((sign * 0.003, -0.0095, 0.003)), (0.0016, 0.001, 0.0016), 0xFFF4DC, "Head", segments=6, rings=4)
    # Big ears swept up and back, thin, darker inside; a nick out of the left.
    base, tip = at(sign * 0.06, hy + 0.008, hz - 0.012), at(sign * 0.18, hy + 0.078, hz - 0.072)
    facing = Vector((sign * 0.4, -1, 0.15)).normalized()
    m.leaf(base, tip, 0.078, 0.009, SKIN, "Head", facing, bend=(0, 0.012, -0.012), notch=0.55 if sign > 0 else None)
    inner = at(sign * 0.068, hy + 0.01, hz - 0.008) + facing * 0.0035
    m.leaf(inner, inner + (tip - base) * 0.74, 0.044, 0.004, 0x8C5A4C, "Head", facing, bend=(0, 0.008, -0.008))
# Crooked teeth: a jagged row above, a few below, two longer fangs.
for i, (x, drop, tilt) in enumerate(((-0.022, 0.012, -0.002), (-0.007, 0.009, 0.001), (0.01, 0.013, 0.002), (0.024, 0.008, 0.0))):
    top = at(x, hy - 0.055, hz + 0.08 - abs(x) * 0.3)
    m.cone(top, top + Vector((tilt, -0.002, -drop)), 0.0062, TEETH, "Head", segments=6)
for x, rise in ((-0.029, 0.021), (-0.004, 0.008), (0.03, 0.023)):
    root = at(x, hy - 0.072, hz + 0.078 - abs(x) * 0.3)
    m.cone(root, root + Vector((0, -0.003, rise)), 0.0065 if abs(x) > 0.02 else 0.005, shade(TEETH, 0.92), "Head", segments=6)

# ── The body: wiry, ribs and collarbones showing, a pot belly, shoulder blades and the knobs of the
# spine behind, sinewy arms, bony knees and ankles, tendons down the neck. ──
rib_y, rib_r = chest_y + p["torso"] * 0.18, p["torso"] * 0.32
for i in range(4):
    y = rib_y + 0.032 - i * 0.026
    k = math.sqrt(max(0.0, 1 - ((y - rib_y) / rib_r) ** 2))
    for sign in (1, -1):
        points = []
        for a in (22, 58, 94, 128):
            r = math.radians(a)
            front_drop = 0.012 * (1 - a / 128)
            points.append((sign * math.sin(r) * chest_x * k * 0.93, y - front_drop, hunch * 0.2 + math.cos(r) * chest_z * k * 0.93))
        for a0, a1 in zip(points, points[1:]):
            cap(a0, a1, 0.0034)
for sign in (1, -1):
    cap((sign * 0.012, arm_y - 0.004, hunch * 0.2 + chest_z * 0.95), (sign * sx * 0.85, arm_y + 0.012, 0.02), 0.0065)
    ell((sign * 0.04, rib_y + 0.02, hunch * 0.2 + chest_z * 0.78), 0.034, 0.022, 0.018)
    ell((sign * 0.042, rib_y + 0.015, hunch * 0.2 - chest_z * 0.8), 0.03, 0.04, 0.012)
    cap((sign * 0.03, b["head_y"] - 0.005, hunch * 0.85), (sign * 0.01, arm_y - 0.012, hunch * 0.2 + chest_z * 0.9), 0.0075)
    ball((sign * 0.062, hips + 0.03, waist_z * 0.55), 0.013)
    # Arms: a lean biceps, the point of the elbow, the bone at the wrist.
    elbow, wrist = p["arm"] * 0.52, p["arm"]
    ell((sign * (sx + elbow * 0.5), arm_y + 0.004, 0.012), elbow * 0.22, 0.016, 0.017)
    ball((sign * (sx + elbow), arm_y, -0.017), 0.012)
    ball((sign * (sx + wrist - 0.012), arm_y + 0.004, -0.012), 0.009)
    # Legs: kneecaps, the bones of the ankle.
    ball((sign * hx, b["knee"] + 0.008, 0.024), 0.015)
    for side_off in (-0.018, 0.018):
        ball((sign * hx + side_off, 0.058, 0.0), 0.0095)
ell((0, b["head_y"] - 0.04, hunch * 0.5), 0.03, 0.04, 0.032)
for i in range(6):
    y = arm_y + 0.012 - i * 0.034
    ball((0, y, hunch * (0.35 - i * 0.05) - chest_z * 0.95 + 0.004), 0.0068)
ball((0, hips + 0.07, waist_z * 0.55 + 0.035), 0.004, DARK, negative=True)

# ── Gear: a leather loincloth on a belt with a brass buckle and a pouch, a strap across the chest, bracers,
# wrapped feet, a cord of teeth. ──
belt_y = hips + 0.035 * s
m.ring(at(0, belt_y, 0.004), 1, 0.11, STRAP, "pelvis", scale=(waist_x * 1.18, waist_z * 1.28, s * 0.22))
m.box(at(0, belt_y, waist_z * 1.3), (0.026, 0.006, 0.022), BRASS, "pelvis")
m.box(at(0, belt_y, waist_z * 1.31), (0.014, 0.006, 0.01), STRAP, "pelvis")
for sign, colour in ((1, CLOTH), (-1, shade(CLOTH, 0.85))):
    top, bottom = at(0, belt_y + 0.004, sign * waist_z * 1.22), at(0.004, hips - 0.14, sign * (waist_z * 1.18 + 0.012))
    m.leaf(top, bottom, 0.11, 0.006, colour, "pelvis", (0, -sign, 0))
pouch = at(waist_x * 1.05, belt_y - 0.03, waist_z * 0.3)
m.box(pouch, (0.03, 0.04, 0.045), LEATHER, "pelvis")
m.box(pouch + Vector((0.002, 0, 0.015)), (0.034, 0.044, 0.018), shade(LEATHER, 0.82), "pelvis")


def strap(points, bone_of, width=0.016, thick=0.005):
    """A flat strap along `points` (game coordinates), lying on the body: its broad side faces out."""
    pts = [at(*q) for q in points]
    for a, c in zip(pts, pts[1:]):
        mid = (a + c) / 2
        y = (c - a).normalized()
        out = Vector((mid.x, mid.y + hunch * 0.2, 0))
        z = (out - y * out.dot(y)).normalized()
        x = y.cross(z)
        rot = Matrix((x, y, z)).transposed().to_quaternion()
        m.box(mid, (width, (c - a).length * 1.06, thick), STRAP, bone_of(mid), rot)


strap(
    [
        (0.05, hips + 0.04, -waist_z * 1.1),
        (-0.01, chest_y, -chest_z * 1.02 + hunch * 0.15),
        (-0.05, arm_y + 0.008, -chest_z * 0.7 + hunch * 0.2),
        (-0.07, arm_y + 0.03, 0.0),
        (-0.048, arm_y + 0.006, chest_z * 0.85 + hunch * 0.2),
        (-0.012, rib_y + 0.015, chest_z * 1.04 + hunch * 0.2),
        (0.03, chest_y - 0.025, waist_z * 1.05 + 0.02),
        (0.056, hips + 0.045, waist_z * 1.15),
    ],
    lambda q: "spine_03" if q.z > chest_y else "spine_01",
)
m.box(at(-0.016, rib_y + 0.008, chest_z * 1.07 + hunch * 0.2), (0.022, 0.006, 0.02), BRASS, "spine_03", Quaternion((0, 1, 0), 0.5))
for side, sign in (("l", 1), ("r", -1)):
    elbow, wrist = p["arm"] * 0.52, p["arm"]
    m.tube(at(sign * (sx + elbow + 0.05), arm_y, 0), at(sign * (sx + wrist - 0.015), arm_y, 0), 0.023, 0.019, LEATHER, f"lowerarm_{side}", segments=10)
    for u in (0.3, 0.75):
        m.ring(at(sign * (sx + elbow + 0.05 + (wrist - elbow - 0.065) * u), arm_y, 0), 0.023 - u * 0.004, 0.0035, STRAP, f"lowerarm_{side}", axis=(1, 0, 0))
    # Feet wrapped in strips of leather over the ankle and arch, the toes bare.
    f = b["f"]
    for k in range(3):
        m.ring(at(sign * hx, 0.05 + k * 0.022, 0.004), 0.026 - k * 0.002, 0.0055, shade(LEATHER, 1 - 0.07 * k), f"calf_{side}")
    m.ring(at(sign * hx, 0.035 * f, 0.07 * f), 1, 0.12, shade(LEATHER, 0.9), f"foot_{side}", scale=(0.058 * f, 0.03, 0.045 * f), axis=(0, 1, 0))
cord_y = arm_y + 0.016
m.ring(at(0, cord_y, hunch * 0.3), 0.046, 0.0022, 0x6A4A30, "spine_03", axis=(0, -0.45, 1))
for u, size in ((-0.45, 0.018), (0.0, 0.03), (0.45, 0.018)):
    tooth = at(u * 0.05, cord_y - 0.02 - (1 - u * u) * 0.006, hunch * 0.3 + 0.044)
    m.cone(tooth, tooth + Vector((0, -0.004, -size)), 0.0055, BONE, "spine_03", segments=6)

# ── The scimitar: a leather-wrapped grip and a pommel, a short guard, a blade that curves back and
# widens towards its point, darker along its back, chipped and spotted with rust. ──
k = 0.62
GRIP, GUARD, RUST = 0x4A3424, 0x6A5A3A, 0x7A4A2A
scimitar = [
    (m.tube, (Vector((0, 0.05 * k, 0)), Vector((0, -0.05 * k, 0)), 0.015 * k, 0.015 * k, GRIP, "hand_r")),
    (m.sphere, (Vector((0, 0.06 * k, 0)), (0.02 * k,) * 3, GUARD, "hand_r")),
    (m.box, (Vector((0, -0.06 * k, 0)), (0.12 * k, 0.025 * k, 0.022 * k), GUARD, "hand_r")),
]
for y in (-0.03, 0.0, 0.03):
    scimitar.append((m.ring, (Vector((0, y * k, 0)), 0.016 * k, 0.0035 * k, 0x2A1E14, "hand_r", (1, 1, 1), (0, 1, 0), 10)))
for dx in (-0.06, 0.06):
    scimitar.append((m.sphere, (Vector((dx * k, -0.06 * k, 0)), (0.016 * k,) * 3, GUARD, "hand_r")))
for i in range(4):
    u0, u1 = i / 4, (i + 1) / 4
    a = Vector((0.12 * k * u0 * u0, -(0.075 + 0.65 * u0) * k, 0))
    c = Vector((0.12 * k * u1 * u1, -(0.075 + 0.65 * u1) * k, 0))
    mid, length = (a + c) / 2, (c - a).length * 1.08
    width = (0.045 + i * 0.008) * k
    angle = Vector((0, -1, 0)).angle(c - a) * (1 if (c - a).x > 0 else -1)
    turn = Quaternion((0, 0, 1), angle)
    scimitar.append((m.box, (mid, (width, length, 0.01 * k), STEEL, "hand_r", turn)))
    scimitar.append((m.box, (mid + turn @ Vector((width * 0.38, 0, 0)), (width * 0.24, length, 0.012 * k), shade(STEEL, 0.78), "hand_r", turn)))
    if i in (1, 2):
        chip = mid + turn @ Vector((-width * 0.5, 0.01 * k * (i - 1.5), 0))
        scimitar.append((m.box, (chip, (0.012 * k, 0.02 * k, 0.013 * k), 0x3A3A3A, "hand_r", turn @ Quaternion((0, 0, 1), 0.7))))
        scimitar.append((m.sphere, (mid + turn @ Vector((width * 0.05, 0.03 * k, 0.005 * k)), (0.01 * k, 0.014 * k, 0.003 * k), RUST, "hand_r")))
end = Vector((0.12 * k, -(0.075 + 0.65) * k, 0))
scimitar.append((m.cone, (end, end + Vector((0.05 * k, -0.06 * k, 0)), 0.035 * k, STEEL, "hand_r", 4, 0.3, (0, 0, 1), False)))
m.weapon(scimitar, at(-(sx + p["arm"] + 0.06 * b["h"]), arm_y - 0.014 * b["h"], 0), tilt=-0.5)

m.finish(humanoid_actions(arm_down=72), bake={"size": 512, "ao": 0.05, "mottle": 0.14, "mottle_scale": 95, "dirt": 0.2})
