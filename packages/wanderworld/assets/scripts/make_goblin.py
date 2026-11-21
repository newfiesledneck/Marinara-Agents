"""Goblin (SRD: Small humanoid): about a metre tall, big-headed and long-eared, in a ragged tunic, with a
scimitar. Writes assets/models/goblin.glb. Run (BLENDER: your Blender executable):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_goblin.py
"""

import os
import sys

import bpy
from mathutils import Quaternion

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wwblend import Model, Vector, at, humanoid_actions, humanoid_body, humanoid_joints, shade  # noqa: E402

bpy.ops.wm.read_factory_settings(use_empty=True)

SKIN = 0x7D9446
TUNIC = 0x6B5238
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
m = Model("goblin", resolution=0.009, faces=5000)
m.rig(humanoid_joints(p))
b = humanoid_body(m, p, {"skin": SKIN, "shirt": TUNIC, "limbs": TUNIC, "legs": SKIN, "nails": 0x3A3428})
s, arm_y, sx = b["s"], b["arm_y"], b["sx"]
hy = b["head_y"] + 0.09
hz = p["hunch"] + 0.02

# The head: a big skull, wide at the cheeks, a heavy brow, a long hooked nose, a pointed chin, the eyes
# set in sockets and a wide mouth cut in.
m.ellipsoid(at(0, hy + 0.025, hz - 0.015), (0.112, 0.112, 0.108), SKIN)
m.ellipsoid(at(0, hy - 0.045, hz + 0.02), (0.108, 0.095, 0.065), SKIN)
m.ellipsoid(at(0, hy + 0.035, hz + 0.075), (0.082, 0.03, 0.02), shade(SKIN, 0.85))
m.capsule(at(0, hy + 0.01, hz + 0.095), at(0, hy - 0.02, hz + 0.145), 0.019, shade(SKIN, 0.92))
m.ball(at(0, hy - 0.035, hz + 0.15), 0.016, shade(SKIN, 0.92))
m.ball(at(0, hy - 0.095, hz + 0.055), 0.028, SKIN)
for sign in (1, -1):
    m.ball(at(sign * 0.06, hy - 0.045, hz + 0.055), 0.04, SKIN)
    m.ball(at(sign * 0.044, hy + 0.012, hz + 0.1), 0.02, 0x241A12, negative=True)
m.capsule(at(-0.05, hy - 0.07, hz + 0.1), at(0.05, hy - 0.07, hz + 0.1), 0.008, 0x2A1A14, negative=True)

for sign in (1, -1):
    eye = at(sign * 0.044, hy + 0.01, hz + 0.088)
    m.sphere(eye, (0.019, 0.016, 0.017), 0xE6C840, "Head")
    m.sphere(eye + Vector((sign * 0.002, -0.014, 0)), (0.008, 0.005, 0.009), 0x1A1410, "Head", segments=8, rings=6)
    # Ears sweeping out and back, broad side forwards, with a pinker inside.
    base, tip = at(sign * 0.09, hy + 0.015, hz - 0.01), at(sign * 0.27, hy + 0.075, hz - 0.085)
    m.cone(base, tip, 0.05, SKIN, "Head", segments=10, flat=0.22, facing=(sign * 0.2, -1, 0.35))
    inner = at(sign * 0.1, hy + 0.017, hz - 0.002)
    m.cone(inner, inner + (tip - base) * 0.72, 0.032, 0xA86A5C, "Head", segments=10, flat=0.15, facing=(sign * 0.2, -1, 0.35))
    m.cone(at(sign * 0.04, hy - 0.076, hz + 0.1), at(sign * 0.042, hy - 0.044, hz + 0.108), 0.009, 0xECE4CC, "Head", segments=5)
# A few dark wisps of hair.
for x, z in ((-0.03, -0.04), (0.02, -0.02), (0.05, -0.06)):
    m.cone(at(x, hy + 0.12, hz + z), at(x * 1.6, hy + 0.17, hz + z - 0.06), 0.012, 0x2A2418, "Head", segments=5)

# Rags: a rope belt with a pouch, a loincloth front and back, wraps on the wrists.
waist_x, waist_z = p["waist"]
m.ring(at(0, p["leg"] + 0.03 * s, 0), 1, 0.11, 0x8A7350, "pelvis", scale=(waist_x * 1.05, waist_z * 1.1, s * 0.25))
m.box(at(waist_x * 0.85, p["leg"] - 0.005, waist_z * 0.6), (0.045, 0.03, 0.05), 0x5A4430, "pelvis")
for sign, colour in ((1, 0x5A4430), (-1, shade(0x5A4430, 0.85))):
    m.box(at(0, p["leg"] - 0.06, sign * waist_z * 1.05), (waist_x * 1.1, 0.012, 0.13), colour, "pelvis")
for side, sign in (("l", 1), ("r", -1)):
    m.ring(at(sign * (sx + p["arm"] * 0.9), arm_y, 0), 0.03, 0.009, 0x9A8A68, f"lowerarm_{side}", axis=(1, 0, 0))

# A scimitar: a wrapped grip, a short guard, a blade that curves back and widens towards its point.
STEEL, GRIP = 0xA8ADB0, 0x4A3424
k = 0.62
scimitar = [
    (m.tube, (Vector((0, 0.05 * k, 0)), Vector((0, -0.05 * k, 0)), 0.015 * k, 0.015 * k, GRIP, "hand_r")),
    (m.box, (Vector((0, -0.06 * k, 0)), (0.12 * k, 0.025 * k, 0.022 * k), 0x6A5A3A, "hand_r")),
]
for i in range(4):
    u0, u1 = i / 4, (i + 1) / 4
    a = Vector((0.12 * k * u0 * u0, -(0.075 + 0.65 * u0) * k, 0))
    c = Vector((0.12 * k * u1 * u1, -(0.075 + 0.65 * u1) * k, 0))
    mid, length = (a + c) / 2, (c - a).length * 1.08
    width = (0.045 + i * 0.008) * k
    angle = Vector((0, -1, 0)).angle(c - a) * (1 if (c - a).x > 0 else -1)
    scimitar.append((m.box, (mid, (width, length, 0.01 * k), STEEL, "hand_r", Quaternion((0, 0, 1), angle))))
end = Vector((0.12 * k, -(0.075 + 0.65) * k, 0))
scimitar.append((m.cone, (end, end + Vector((0.05 * k, -0.06 * k, 0)), 0.035 * k, STEEL, "hand_r", 4, 0.3, (0, 0, 1), False)))
m.weapon(scimitar, at(-(sx + p["arm"] + 0.06 * b["h"]), arm_y - 0.014 * b["h"], 0), tilt=-0.5)

m.finish(humanoid_actions(arm_down=72))
