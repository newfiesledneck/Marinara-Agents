"""Goblin (SRD: Small humanoid): about a metre tall, stocky and muscled, with a big head, wide ears, a
heavy scowling brow over red eyes, a broad nose and an underbite full of fangs; leather straps crossed on
its chest, shoulder pads, bracers, wrapped shins, a tattered loincloth and a notched scimitar. Writes
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

SKIN = 0x8A9A5B
DARK = shade(SKIN, 0.7)
LIPS = shade(SKIN, 0.8)
LEATHER = 0x5E4430
STRAP = 0x4A3424
CLOTH = 0x7A3428
METAL = 0x6E6A64
BONE = 0xDCD2B8
TEETH = 0xD8CCA8
STEEL = 0xA8ADB0
p = {
    "leg": 0.36,
    "torso": 0.3,
    "neck": 0.03,
    "shoulders": 0.26,
    "hips": 0.15,
    "arm": 0.36,
    "thick": 1.5,
    "chest": (0.12, 0.085),
    "waist": (0.1, 0.076),
    "hunch": 0.06,
    "hand": 1.9,
    "foot": 1.5,
}
m = Model("goblin", resolution=0.0065, faces=6500)
m.group("head", resolution=0.005, faces=5000, bone="Head")
m.rig(humanoid_joints(p))
b = humanoid_body(m, p, {"skin": SKIN, "legs": SKIN, "shins": LEATHER, "nails": 0x3A3428})
s, t, arm_y, sx, hx, chest_y = b["s"], b["t"], b["arm_y"], b["sx"], b["hx"], b["chest_y"]
hips = p["leg"]
(chest_x, chest_z), (waist_x, waist_z) = p["chest"], p["waist"]
hunch = p["hunch"]
hy = b["head_y"] + 0.1
hz = hunch + 0.02


def ell(c, across, up, depth, colour=SKIN, negative=False, group="body"):
    m.ellipsoid(at(*c), (across, depth, up), colour, negative, group=group)


def ball(c, r, colour=SKIN, negative=False, group="body"):
    m.ball(at(*c), r, colour, negative, group=group)


def cap(a, c, r, colour=SKIN, negative=False, group="body"):
    m.capsule(at(*a), at(*c), r, colour, negative, group=group)


H = {"group": "head"}

# ── The head: big for the body; a broad skull, a heavy brow knotted in a scowl over deep-set eyes, strong
# cheekbones, a short broad nose, and a jutting jaw whose lower lip and fangs stand out past the upper. ──
ell((0, hy + 0.025, hz - 0.02), 0.1, 0.1, 0.098, **H)
ell((0, hy - 0.035, hz + 0.02), 0.098, 0.06, 0.085, **H)
ell((0, hy - 0.07, hz + 0.045), 0.076, 0.036, 0.062, **H)
ball((0, hy - 0.09, hz + 0.07), 0.025, **H)
ell((0, hy + 0.032, hz + 0.068), 0.086, 0.022, 0.03, shade(SKIN, 0.9), **H)
for sign in (1, -1):
    ball((sign * 0.024, hy + 0.013, hz + 0.09), 0.017, shade(SKIN, 0.9), **H)
    ball((sign * 0.062, hy - 0.004, hz + 0.054), 0.03, **H)
    ball((sign * 0.04, hy + 0.004, hz + 0.088), 0.018, DARK, negative=True, **H)
    ell((sign * 0.042, hy + 0.012, hz + 0.082), 0.025, 0.011, 0.016, shade(SKIN, 0.9), **H)
    cap((sign * 0.024, hy - 0.026, hz + 0.1), (sign * 0.05, hy - 0.066, hz + 0.088), 0.0065, shade(SKIN, 0.9), **H)
    ball((sign * 0.026, hy - 0.036, hz + 0.104), 0.016, shade(SKIN, 0.95), **H)
    ball((sign * 0.012, hy - 0.044, hz + 0.106), 0.005, 0x241810, negative=True, **H)
    ball((sign * 0.05, hy - 0.07, hz + 0.094), 0.008, 0x2A1410, negative=True, **H)
for k in range(2):
    y = hy + 0.06 + k * 0.014
    cap((-0.045, y, hz + 0.065 - k * 0.01), (0.045, y, hz + 0.065 - k * 0.01), 0.0045, shade(SKIN, 0.9), **H)
cap((0, hy + 0.012, hz + 0.094), (0, hy - 0.022, hz + 0.122), 0.014, shade(SKIN, 0.95), **H)
ell((0, hy - 0.03, hz + 0.124), 0.03, 0.021, 0.024, shade(SKIN, 0.95), **H)
cap((-0.05, hy - 0.06, hz + 0.098), (0.05, hy - 0.06, hz + 0.098), 0.008, 0x24120E, negative=True, **H)
ell((0, hy - 0.073, hz + 0.104), 0.046, 0.01, 0.018, LIPS, **H)

for sign in (1, -1):
    # Red eyes under the scowling brow.
    eye = at(sign * 0.04, hy + 0.004, hz + 0.078)
    m.sphere(eye, (0.015, 0.011, 0.013), 0xC2432C, "Head", segments=10, rings=8)
    m.sphere(eye + Vector((sign * 0.001, -0.012, 0)), (0.006, 0.003, 0.0065), 0x140A06, "Head", segments=8, rings=6)
    m.sphere(eye + Vector((sign * 0.004, -0.0135, 0.004)), (0.002, 0.0012, 0.002), 0xFFF0DC, "Head", segments=6, rings=4)
    # Wide ears standing out to the sides, pink inside; a nick out of the left.
    base, tip = at(sign * 0.088, hy + 0.012, hz - 0.012), at(sign * 0.29, hy + 0.045, hz - 0.045)
    facing = Vector((sign * 0.15, -1, 0.12)).normalized()
    m.leaf(base, tip, 0.135, 0.016, SKIN, "Head", facing, bend=(0, 0.015, -0.025), notch=0.6 if sign > 0 else None, steps=8, cup=0.38, inner=0xC48A80)
    # Big lower fangs standing up past the upper lip.
    root = at(sign * 0.036, hy - 0.071, hz + 0.11)
    m.cone(root, root + Vector((sign * 0.003, -0.004, 0.038)), 0.011, TEETH, "Head", segments=6)
for x in (-0.017, 0.0, 0.017):
    root = at(x, hy - 0.069, hz + 0.111)
    m.cone(root, root + Vector((0, -0.003, 0.016)), 0.0065, TEETH, "Head", segments=5)

# ── The body: broad shoulders and chest, a muscled belly, a waist that runs into the hips, thick
# forearms. ──
ell((0, hips + 0.05, 0.0), waist_x * 1.08, 0.06, waist_z * 1.05)
for sign in (1, -1):
    ell((sign * 0.05, chest_y + 0.075, hunch * 0.2 + chest_z * 0.72), 0.05, 0.035, 0.026)
    ell((sign * (sx + 0.01), arm_y + 0.01, 0.0), 0.05, 0.045, 0.045)
    ell((sign * 0.06, arm_y + 0.025, hunch * 0.2), 0.05, 0.025, 0.04)
    elbow, wrist = p["arm"] * 0.52, p["arm"]
    ell((sign * (sx + elbow * 0.5), arm_y + 0.006, 0.01), elbow * 0.3, 0.028, 0.03)
    ell((sign * (sx + elbow + 0.04), arm_y, 0.0), 0.05, 0.034, 0.034)
    ball((sign * hx, b["knee"] + 0.006, 0.03), 0.022)
    ell((sign * (hx + 0.008), (hips + b["knee"]) / 2, 0.01), 0.05, 0.075, 0.05)
    ell((sign * hx, b["knee"] - 0.05, -0.012), 0.035, 0.05, 0.035)
    for row in range(3):
        ball((sign * 0.022, hips + 0.06 + row * 0.045, waist_z * 0.95), 0.019, shade(SKIN, 0.97))

# ── Gear: straps crossed on the chest with a shield-shaped buckle on the belt, leather shoulder pads,
# bracers, a tattered red loincloth over leather, wrapped shins and feet, and a pouch. ──
belt_y = hips + 0.04 * s
m.ring(at(0, belt_y, 0.004), 1, 0.13, STRAP, "pelvis", scale=(waist_x * 1.12, waist_z * 1.2, s * 0.3))
m.cone(at(0, belt_y + 0.022, waist_z * 1.24), at(0, belt_y - 0.035, waist_z * 1.24), 0.03, METAL, "pelvis", segments=4, flat=0.25, facing=(0, -1, 0), smooth=False)
m.cone(at(0, belt_y + 0.018, waist_z * 1.27), at(0, belt_y - 0.026, waist_z * 1.27), 0.02, 0x8A4A30, "pelvis", segments=4, flat=0.25, facing=(0, -1, 0), smooth=False)
for sign, colour, length in ((1, CLOTH, 0.17), (-1, shade(CLOTH, 0.82), 0.15)):
    top, bottom = at(0, belt_y, sign * waist_z * 1.18), at(0.004, hips - length, sign * (waist_z * 1.14 + 0.01))
    m.leaf(top, bottom, 0.12, 0.007, colour, "pelvis", (0, -sign, 0), steps=8)
for sign in (1, -1):
    top = at(sign * waist_x * 1.02, belt_y, 0.0)
    m.leaf(top, at(sign * waist_x * 1.08, hips - 0.08, 0.0), 0.1, 0.007, shade(LEATHER, 0.9), "pelvis", (sign, 0, 0), steps=6)
pouch = at(-waist_x * 0.8, belt_y - 0.03, waist_z * 0.75)
m.box(pouch, (0.035, 0.03, 0.04), LEATHER, "pelvis")


def strap(points, bone_of, width=0.02, thick=0.006):
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


front = hunch * 0.2 + chest_z
for sign in (1, -1):
    strap(
        [
            (sign * 0.07, hips + 0.05, -waist_z * 1.1),
            (sign * -0.01, chest_y + 0.02, -chest_z * 1.05 + hunch * 0.15),
            (sign * -0.07, arm_y + 0.03, 0.0),
            (sign * -0.05, arm_y + 0.012, front * 1.08),
            (sign * -0.02, chest_y + 0.075, front * 1.2),
            (0, chest_y + 0.045, front * 1.16),
            (sign * 0.06, hips + 0.05, waist_z * 1.24),
        ],
        lambda q: "spine_03" if q.z > chest_y else "spine_01",
    )
m.box(at(0, chest_y + 0.045, front * 1.2), (0.028, 0.008, 0.028), METAL, "spine_03", Quaternion((0, 1, 0), math.pi / 4))
for side, sign in (("l", 1), ("r", -1)):
    # A leather pad on each shoulder with a bone spike.
    pad = at(sign * (sx + 0.012), arm_y + 0.032, 0.0)
    m.sphere(pad, (0.058, 0.056, 0.026), LEATHER, f"upperarm_{side}", segments=12, rings=6)
    m.cone(pad + Vector((sign * 0.015, 0, 0.018)), pad + Vector((sign * 0.04, 0.008, 0.06)), 0.012, BONE, f"upperarm_{side}", segments=6)
    elbow, wrist = p["arm"] * 0.52, p["arm"]
    m.tube(at(sign * (sx + elbow + 0.04), arm_y, 0), at(sign * (sx + wrist - 0.01), arm_y, 0), 0.04, 0.033, LEATHER, f"lowerarm_{side}", segments=10)
    m.ring(at(sign * (sx + elbow + 0.1), arm_y, 0), 0.037, 0.005, STRAP, f"lowerarm_{side}", axis=(1, 0, 0), segments=12)
    # Wraps round the shins and over the feet.
    for k in range(4):
        m.ring(at(sign * hx, 0.07 + k * 0.03, 0.004), 0.034 - k * 0.001, 0.007, shade(0x8A7A5A, 1 - 0.05 * (k % 2)), f"calf_{side}", segments=12)

# ── The scimitar: a wrapped grip and pommel, a short guard, a curved blade, darker along its back. ──
k = 0.72
GRIP, GUARD = 0x4A3424, 0x6A5A3A
scimitar = [
    (m.tube, (Vector((0, 0.05 * k, 0)), Vector((0, -0.05 * k, 0)), 0.016 * k, 0.016 * k, GRIP, "hand_r")),
    (m.sphere, (Vector((0, 0.06 * k, 0)), (0.02 * k,) * 3, GUARD, "hand_r")),
    (m.box, (Vector((0, -0.06 * k, 0)), (0.13 * k, 0.025 * k, 0.022 * k), GUARD, "hand_r")),
]
for i in range(4):
    u0, u1 = i / 4, (i + 1) / 4
    a = Vector((0.12 * k * u0 * u0, -(0.075 + 0.65 * u0) * k, 0))
    c = Vector((0.12 * k * u1 * u1, -(0.075 + 0.65 * u1) * k, 0))
    mid, length = (a + c) / 2, (c - a).length * 1.08
    width = (0.05 + i * 0.008) * k
    angle = Vector((0, -1, 0)).angle(c - a) * (1 if (c - a).x > 0 else -1)
    turn = Quaternion((0, 0, 1), angle)
    scimitar.append((m.box, (mid, (width, length, 0.011 * k), STEEL, "hand_r", turn)))
    scimitar.append((m.box, (mid + turn @ Vector((width * 0.38, 0, 0)), (width * 0.24, length, 0.013 * k), shade(STEEL, 0.75), "hand_r", turn)))
end = Vector((0.12 * k, -(0.075 + 0.65) * k, 0))
scimitar.append((m.cone, (end, end + Vector((0.05 * k, -0.06 * k, 0)), 0.038 * k, STEEL, "hand_r", 4, 0.3, (0, 0, 1), False)))
m.weapon(scimitar, at(-(sx + p["arm"] + 0.06 * b["h"]), arm_y - 0.014 * b["h"], 0), tilt=-0.5)

m.finish(humanoid_actions(arm_down=72), bake={"size": 512, "ao": 0.07, "mottle": 0.1, "mottle_scale": 70, "dirt": 0.18})
