"""Goblin (SRD: Small humanoid): about a metre tall, big-headed and long-eared, in a patched, tattered
tunic, with a notched scimitar. Writes assets/models/goblin.glb. Run (BLENDER: your Blender executable):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_goblin.py
"""

import math
import os
import sys

import bpy
from mathutils import Quaternion

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wwblend import Model, Vector, at, humanoid_actions, humanoid_body, humanoid_joints, shade  # noqa: E402

bpy.ops.wm.read_factory_settings(use_empty=True)

SKIN = 0x7D9446
DARK = shade(SKIN, 0.78)
TUNIC = 0x6B5238
PATCH = 0x8C7050
ROPE = 0x8A7350
WRAP = 0x9A8A68
LEATHER = 0x3A2A1E
BONE = 0xE4DAC0
TEETH = 0xD8CCA0
STEEL = 0xA8ADB0
p = {
    "leg": 0.42,
    "torso": 0.3,
    "neck": 0.05,
    "shoulders": 0.22,
    "hips": 0.12,
    "arm": 0.38,
    "thick": 1.0,
    "chest": (0.11, 0.08),
    "waist": (0.085, 0.065),
    "hunch": 0.07,
    "hand": 1.45,
    "foot": 1.4,
    "claws": True,
}
m = Model("goblin", resolution=0.008, faces=5200)
m.group("head", resolution=0.0052, faces=5200, bone="Head")
m.rig(humanoid_joints(p))
b = humanoid_body(m, p, {"skin": SKIN, "shirt": TUNIC, "limbs": TUNIC, "legs": SKIN, "nails": 0x3A3428})
s, t, arm_y, sx, hx = b["s"], b["t"], b["arm_y"], b["sx"], b["hx"]
waist_x, waist_z = p["waist"]
hy = b["head_y"] + 0.09
hz = p["hunch"] + 0.02


def head_ell(c, across, up, depth, colour=SKIN, negative=False):
    m.ellipsoid(at(*c), (across, depth, up), colour, negative, group="head")


def head_ball(c, r, colour=SKIN, negative=False):
    m.ball(at(*c), r, colour, negative, group="head")


def head_cap(a, c, r, colour=SKIN, negative=False):
    m.capsule(at(*a), at(*c), r, colour, negative, group="head")


# ── The head, meshed finer than the body ──
# A big skull with a bump behind, wide cheeks and cheekbones, a heavy scowling brow with a wrinkled
# forehead over it, a long hooked nose with nostrils, folds down to a wide mouth with lips, a small chin.
head_ell((0, hy + 0.025, hz - 0.02), 0.112, 0.108, 0.11)
head_ell((0, hy + 0.04, hz - 0.07), 0.09, 0.085, 0.07)
head_ell((0, hy - 0.045, hz + 0.02), 0.106, 0.062, 0.092)
head_ell((0, hy - 0.09, hz + 0.05), 0.048, 0.03, 0.04)
head_ell((0, hy + 0.038, hz + 0.074), 0.085, 0.02, 0.028, shade(SKIN, 0.9))
for sign in (1, -1):
    head_ball((sign * 0.065, hy - 0.005, hz + 0.06), 0.032)
    head_ball((sign * 0.03, hy + 0.03, hz + 0.086), 0.015, shade(SKIN, 0.9))
    # Eye sockets, a heavy upper lid over each, a bag under it.
    head_ball((sign * 0.044, hy + 0.012, hz + 0.1), 0.021, DARK, negative=True)
    head_ell((sign * 0.044, hy + 0.026, hz + 0.094), 0.025, 0.009, 0.016, shade(SKIN, 0.95))
    head_cap((sign * 0.03, hy - 0.009, hz + 0.099), (sign * 0.06, hy - 0.006, hz + 0.09), 0.006)
    # The folds from the nose to the corners of the mouth.
    head_cap((sign * 0.024, hy - 0.022, hz + 0.106), (sign * 0.05, hy - 0.062, hz + 0.09), 0.007)
    head_ball((sign * 0.012, hy - 0.04, hz + 0.128), 0.0065, 0x2A1A14, negative=True)
    head_ball((sign * 0.05, hy - 0.075, hz + 0.095), 0.008, 0x3A1814, negative=True)
head_cap((-0.05, hy + 0.066, hz + 0.07), (0.05, hy + 0.066, hz + 0.07), 0.0055, shade(SKIN, 0.92))
head_cap((-0.034, hy + 0.081, hz + 0.058), (0.034, hy + 0.081, hz + 0.058), 0.005, shade(SKIN, 0.92))
head_cap((0, hy + 0.022, hz + 0.09), (0, hy - 0.004, hz + 0.13), 0.016, shade(SKIN, 0.93))
head_ball((0, hy - 0.022, hz + 0.142), 0.019, shade(SKIN, 0.93))
head_ball((0, hy - 0.036, hz + 0.137), 0.013, shade(SKIN, 0.93))
head_cap((-0.048, hy - 0.068, hz + 0.104), (0.048, hy - 0.068, hz + 0.104), 0.011, 0x3A1814, negative=True)
head_cap((-0.045, hy - 0.056, hz + 0.108), (0.045, hy - 0.056, hz + 0.108), 0.0075, shade(SKIN, 0.9))
head_cap((-0.038, hy - 0.08, hz + 0.098), (0.038, hy - 0.08, hz + 0.098), 0.0068, shade(SKIN, 0.9))
for c, r in (((0.07, hy + 0.03, hz + 0.07), 0.006), ((-0.055, hy - 0.06, hz + 0.085), 0.005), ((0.012, hy - 0.01, hz + 0.138), 0.005)):
    head_ball(c, r, DARK)

for sign in (1, -1):
    # Yellow eyes with round pupils and a glint, set in their sockets under the lids.
    eye = at(sign * 0.044, hy + 0.01, hz + 0.088)
    m.sphere(eye, (0.019, 0.016, 0.017), 0xE6C840, "Head")
    m.sphere(eye + Vector((sign * 0.002, -0.0145, 0)), (0.0075, 0.004, 0.0085), 0x1A1410, "Head", segments=8, rings=6)
    m.sphere(eye + Vector((sign * 0.006, -0.0165, 0.004)), (0.0026, 0.0015, 0.0026), 0xFFF8E8, "Head", segments=6, rings=4)
    # Long ears sweeping out and back, drooping at the tips, a pinker inside; a nick out of the left.
    base, tip = at(sign * 0.09, hy + 0.015, hz - 0.01), at(sign * 0.27, hy + 0.072, hz - 0.085)
    facing = (sign * 0.2, -1, 0.35)
    m.leaf(base, tip, 0.11, 0.014, SKIN, "Head", facing, bend=(0, 0, -0.035), notch=0.55 if sign > 0 else None)
    inner = at(sign * 0.1, hy + 0.017, hz - 0.003)
    m.leaf(inner, inner + (tip - base) * 0.72, 0.064, 0.006, 0xA86A5C, "Head", facing, bend=(0, 0, -0.02))
    # Lower fangs past the lip, a row of crooked upper teeth inside.
    m.cone(at(sign * 0.033, hy - 0.083, hz + 0.1), at(sign * 0.036, hy - 0.05, hz + 0.108), 0.0095, TEETH, "Head", segments=6)
for i, x in enumerate((-0.026, -0.013, 0.0, 0.016, 0.028)):
    if i == 2:
        continue  # (one missing)
    m.box(at(x, hy - 0.064, hz + 0.097), (0.0075, 0.005, 0.009), TEETH, "Head", Quaternion((0, 1, 0), (i - 2) * 0.12))
# A brass ring through the right ear.
m.ring(at(-0.115, hy + 0.012, hz - 0.02), 0.012, 0.0024, 0xC09840, "Head", axis=(0.3, 0.4, 0.1))

# ── The body's own touches: knobbly knees and elbows, a neckline, holes worn in the tunic ──
m.ellipsoid(at(0, arm_y - 0.035, p["chest"][1] * 0.75 + p["hunch"] * 0.25), (0.03, 0.012, 0.04), SKIN)
for c in ((0.07, b["chest_y"] - 0.02, 0.05), (-0.06, b["chest_y"] + 0.03, -0.06), (0.02, p["leg"] + 0.08, -0.06)):
    m.ball(at(*c), 0.009, 0x1E1610, negative=True)
for sign in (1, -1):
    m.ball(at(sign * hx, b["knee"] + 0.01, 0.022 * s), 0.026 * t, SKIN)
    m.ball(at(sign * (sx + p["arm"] * 0.52), arm_y, -0.018 * s), 0.022 * t, SKIN)

# ── Clothes and gear ──
# A tattered hem round the tunic, patches with stitches front and back, ragged sleeve ends.
for i in range(10):
    a = (i + 0.3 * (i % 3)) / 10 * 2 * math.pi
    x, z = math.sin(a) * waist_x * 1.06, math.cos(a) * waist_z * 1.1
    top = at(x, p["leg"] + 0.045 * s, z)
    out = Vector((math.sin(a), -math.cos(a), 0))
    drop = (0.035, 0.06, 0.045, 0.07)[(i * 3) % 4]
    m.cone(top, top + Vector((0, 0, -drop)) + out * 0.006, 0.03, shade(TUNIC, 0.88 + 0.07 * (i % 3)), "pelvis", segments=7, flat=0.18, facing=out)
chest_front = p["chest"][1] * 0.92 + p["hunch"] * 0.2
for z_sign, (x, y) in ((1, (0.035, b["chest_y"] + 0.065)), (-1, (-0.03, b["chest_y"] + 0.04))):
    rot = Quaternion((0, 1, 0), 0.2 * z_sign) @ Quaternion((1, 0, 0), -0.25 * z_sign)
    centre = at(x, y, z_sign * chest_front)
    m.box(centre, (0.05, 0.007, 0.044), PATCH, "spine_03", rot)
    for j in range(4):
        for edge in (-1, 1):
            stitch = centre + rot @ Vector((edge * 0.026, -z_sign * 0.004, -0.018 + j * 0.012))
            m.box(stitch, (0.008, 0.003, 0.0022), 0x2A1E14, "spine_03", rot)
for side, sign in (("l", 1), ("r", -1)):
    m.ring(at(sign * (sx + p["arm"] * 0.5), arm_y, 0), 0.05 * t, 0.007, shade(TUNIC, 0.82), f"upperarm_{side}", axis=(1, 0, 0))
    m.ring(at(sign * (sx + p["arm"] * 0.9), arm_y, 0), 0.03, 0.009, WRAP, f"lowerarm_{side}", axis=(1, 0, 0))
    # Cloth wrapped round each shin, and black toenails.
    for k in range(3):
        m.ring(at(sign * hx, 0.085 * s + 0.035 + k * 0.03, 0), 0.044 * t * 0.95, 0.0065, shade(WRAP, 1 - 0.06 * k), f"calf_{side}")
    f = b["f"]
    for toe in range(3):
        tx = sign * hx + (toe - 1) * 0.03 * f
        m.sphere(at(tx, 0.03 * f, 0.15 * f), (0.012 * f, 0.008 * f, 0.006 * f), 0x2E2A22, f"ball_{side}", segments=6, rings=4)

# A rope belt knotted at the side, its ends hanging; a pouch with its flap; the loincloth, frayed.
belt_y = p["leg"] + 0.035 * s
m.ring(at(0, belt_y, 0), 1, 0.11, ROPE, "pelvis", scale=(waist_x * 1.08, waist_z * 1.14, s * 0.25))
knot = at(-waist_x * 0.75, belt_y, waist_z * 0.85)
m.sphere(knot, (0.011, 0.011, 0.011), shade(ROPE, 0.9), "pelvis")
for dx in (-0.006, 0.007):
    m.strand([knot, knot + Vector((dx, -0.004, -0.03)), knot + Vector((dx * 1.6, -0.002, -0.065))], 0.0045, 0.003, ROPE, "pelvis")
pouch = at(waist_x * 0.85, belt_y - 0.035, waist_z * 0.55)
m.box(pouch, (0.042, 0.03, 0.048), 0x5A4430, "pelvis")
m.box(pouch + Vector((0, -0.002, 0.016)), (0.046, 0.034, 0.02), shade(0x5A4430, 0.82), "pelvis")
m.sphere(pouch + Vector((0, -0.019, 0.008)), (0.004, 0.003, 0.004), BONE, "pelvis", segments=6, rings=4)
for sign, colour in ((1, 0x5A4430), (-1, shade(0x5A4430, 0.85))):
    flap = at(0, p["leg"] - 0.055, sign * waist_z * 1.08)
    m.box(flap, (waist_x * 1.05, 0.01, 0.12), colour, "pelvis")
    for k in range(3):
        end = flap + Vector(((k - 1) * waist_x * 0.35, 0, -0.06))
        m.cone(end, end + Vector((0, 0, -0.025 - 0.008 * k)), 0.016, colour, "pelvis", segments=5, flat=0.3, facing=(0, -sign, 0))

# A cord round the neck hung with teeth.
cord_y = arm_y + 0.012
m.ring(at(0, cord_y, p["hunch"] * 0.33), 0.052, 0.0025, LEATHER, "spine_03", scale=(1, 0.95, 1), axis=(0, -0.35, 1))
for u in (-0.55, -0.25, 0.05, 0.32):
    tooth = at(u * 0.06, cord_y - 0.012 - (1 - u * u) * 0.008, p["hunch"] * 0.33 + 0.045)
    m.cone(tooth, tooth + Vector((0, -0.004, -0.022)), 0.005, BONE, "spine_03", segments=5)

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

m.finish(humanoid_actions(arm_down=72), bake={"size": 512, "ao": 0.08, "mottle": 0.12, "mottle_scale": 70, "dirt": 0.18})
