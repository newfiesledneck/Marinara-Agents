"""Frost giant (SRD: Huge giant): about 6.4 metres of muscled warrior, pale blue-white skin, a long ice-
white beard in braids and white hair under a horned iron helm; a white fur mantle, hide kilt and fur-
wrapped boots, iron-banded bracers and a riveted iron pauldron, a broad belt and harness, and a massive
greataxe of iron and wood. Writes assets/models/frost_giant.glb. Run (BLENDER: your Blender executable):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_frost_giant.py
"""

import math
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import wwblend as ww  # noqa: E402
import wwgiant as wg  # noqa: E402
from wwblend import Vector  # noqa: E402

SKIN = 0x98AEC0
SKIN_COLD = 0x869DB0
SKIN_PALE = 0xA9BCCA
LIPS = 0x72869A
HAIR = 0xD6DCDE
HAIR_SHADE = 0xB2BCC2
FUR = 0x8C8478
FUR_SHADE = 0x6E675C
FUR_DARK = 0x524C44
HIDE = 0x6A5A48
HIDE_DARK = 0x4E4234
LEATHER = 0x3E3228
IRON = 0x4A4E52
IRON_DARK = 0x33363A
IRON_LIGHT = 0x6A6E72
HORN = 0xC2B496
HORN_DARK = 0x6E6450
WOOD = 0x5A4632
EDGE = 0x8E949A

g = wg.Giant("frost_giant", {"muscle": 1.0, "heavy": 0.25, "chest": 0.6, "shoulders": 1.0, "neck": 0.8, "jaw": 0.6, "nose": 0.4, "eyes": -0.3})
# The face: a heavy brow and deep-set pale eyes, a broad nose and a strong jaw (mostly under the beard).
g.bump((0, 1.69, 0.092), (0.06, 0.011, 0.03), 0.009, facing=(0, 0.3, 1))
for s in (1, -1):
    g.push((s * 0.032, 1.666, 0.075), (0.018, 0.01, 0.02), (0, -0.001, -0.006))
    g.bump((s * 0.05, 1.64, 0.065), (0.022, 0.014, 0.025), 0.006)
    g.push((s * 0.055, 1.56, 0.02), (0.03, 0.03, 0.05), (s * 0.01, -0.004, 0))
g.bump((0, 1.62, 0.105), (0.022, 0.02, 0.02), 0.005)
g.push((0, 1.54, 0.06), (0.06, 0.03, 0.06), (0, -0.008, 0.008))
g.curl_hand("r", angles=(70, 85, 50))
g.curl_hand("l", angles=(85, 100, 60))
g.keep_base()
g.proportion(
    6.15,
    {
        "torso": 1.02,
        "leg": 1.0,
        "arm": 1.04,
        "shoulders": 1.2,
        "hips": 1.06,
        "head": 0.95,
        "hand": 1.2,
        "foot": 1.12,
        "thick": {
            "spine_01": (1.1, 1.1),
            "spine_02": (1.14, 1.12),
            "spine_03": (1.2, 1.14),
            "neck_01": (1.15, 1.12),
            "clavicle_l": (1.2, 1.2),
            "clavicle_r": (1.2, 1.2),
            "upperarm_l": (1.32, 1.32),
            "upperarm_r": (1.32, 1.32),
            "lowerarm_l": (1.32, 1.32),
            "lowerarm_r": (1.32, 1.32),
            "thigh_l": (1.26, 1.26),
            "thigh_r": (1.26, 1.26),
            "calf_l": (1.22, 1.22),
            "calf_r": (1.22, 1.22),
        },
    },
)
g.reduce(8600)
S = g.S
m = g.m


def skin(b, p, n):
    v = wg.vnoise([b], 0.07, 2)[0]
    return SKIN_COLD if v < -0.3 else (SKIN_PALE if v > 0.4 else SKIN)


g.colour_body({"skin": skin, "underwear": SKIN, "eye_white": 0xB8C4CA, "iris": 0x6A90AA, "eyebrows": HAIR, "lips": LIPS, "nails": SKIN_COLD})


def hairy(b, p, n):
    return HAIR if wg.vnoise([b], 0.012, 5)[0] < 0.25 else HAIR_SHADE


# ── The helm: an iron cap riveted round its rim, with two great curving horns. ──
def helm(B, P):
    x, fw, z = wg.xfz(B)
    rim = 1.706 + 0.022 * wg.smooth(-0.02, 0.07, fw)
    return (z > rim).astype(float)


helm_shell = g.shell(helm, 0.075, lambda b, p, n: IRON_DARK if b.z < 1.706 + 0.022 * float(wg.smooth(-0.02, 0.07, np.array(-b.y))) + 0.012 else IRON, smooth_rounds=6, rim=1.0, under=IRON_DARK)
g.rivets(g.edge_of(helm_shell, 7), 0.03, IRON_LIGHT, out=0.0)
for s in (1, -1):
    base, normal, _ = g.anchor((s * 0.07, 1.735, -0.005))
    out = Vector((normal.x, normal.y, 0)).normalized()
    root = base + normal * 0.05
    tip = root + out * 0.42 + Vector((0, 0, 0.18)) + Vector((0, -0.1, 0))
    wg.lathe(m, root, tip, [0.17, 0.15, 0.125, 0.1, 0.075, 0.05, 0.03, 0.012], HORN, "Head", around=9, rough=0.06, grooves=0.06, seed=s, cap=HORN_DARK, bend=(0, -0.2, 0.3))


# ── White hair from under the helm, and a great beard down the chest, two braids of it. ──
def hair(B, P):
    x, fw, z = wg.xfz(B)
    n = wg.vnoise(B, 0.015, 1)
    ears = (np.abs(x) > 0.062) & (z > 1.62) & (z < 1.705) & (fw > -0.045) & (fw < 0.035)
    head = np.hypot(x, fw + 0.01) < 0.115
    return ((z > 1.5 + 0.01 * n) & head & (fw < 0.035) & ~ears & ~((fw > -0.01) & (z < 1.62))).astype(float)


g.shell(hair, 0.04, hairy, bumps=(0.06, 0.03), fringe=(0.35, 0.5, HAIR_SHADE), rim=0.8)


def beard(B, P):
    x, fw, z = wg.xfz(B)
    n = wg.vnoise(B, 0.012, 4)
    face = (z < 1.615) & (z > 1.45) & (fw > -0.015) & (np.abs(x) < 0.1)
    side = (np.abs(x) > 0.05) & (np.abs(x) < 0.1) & (z < 1.68) & (z > 1.54) & (fw > -0.03) & (fw < 0.05)
    lips = z < 0  # (the moustache hangs over the mouth)
    chest = (fw > 0.0) & (z > 1.27 + 0.01 * n) & (z < 1.52) & (np.abs(x) < 0.035 + 0.3 * np.clip(z - 1.27, 0, 1))
    return ((face | side | chest) & ~lips).astype(float)


g.shell(beard, 0.06, hairy, bumps=(0.07, 0.025), fringe=(0.3, 0.6, HAIR_SHADE), rim=0.8)
for s in (1, -1):
    top = g.anchor((s * 0.022, 1.52, 0.08))[0]
    mid, n_mid, _ = g.anchor((s * 0.03, 1.38, 0.1))
    low, n_low, _ = g.anchor((s * 0.028, 1.22, 0.11))
    wg.braid(m, [top + Vector((0, -0.12, 0)), mid + n_mid * 0.22, low + n_low * 0.25], 0.075, HAIR, "Head", HAIR_SHADE, tie=IRON)
    temple = g.anchor((s * 0.072, 1.665, 0.02))[0]
    shoulder, n_sh, _ = g.anchor((s * 0.12, 1.45, 0.05))
    wg.braid(m, [temple + Vector((s * 0.05, 0, 0)), shoulder + n_sh * 0.3 + Vector((0, 0, 0.2)), shoulder + n_sh * 0.32 + Vector((0, -0.05, -0.35))], 0.06, HAIR, "Head", HAIR_SHADE, tie=IRON)


# ── A white fur mantle over the shoulders and down the back. ──
def mantle(B, P):
    x, fw, z = wg.xfz(B)
    n = wg.vnoise(B, 0.03, 6)
    neck = np.hypot(x, fw + 0.01) < 0.078
    shoulders = (z > 1.37 + 0.02 * n) & (np.abs(x) < 0.27 + 0.02 * n)
    back = (fw < -0.03) & (z > 1.0 + 0.05 * n) & (np.abs(x) < 0.21)
    return ((shoulders | back) & ~(neck & (z > 1.43)) & (z < 1.53)).astype(float)


def furry(b, p, n):
    v = wg.vnoise([b], 0.02, 7)[0]
    return FUR if v < 0.2 else (FUR_SHADE if v < 0.5 else FUR_DARK)


g.shell(mantle, 0.1, furry, bumps=(0.14, 0.035), fringe=(0.32, 0.5, FUR_SHADE), rim=0.7, cut=0.99)


# ── A riveted iron pauldron on the left shoulder, iron-banded bracers, a harness and belt. ──
def pauldron(B, P):
    x, fw, z = wg.xfz(B)
    return ((x > 0.13) & (x < 0.37) & (z > 1.375 + 0.12 * np.clip(x - 0.3, 0, 1))).astype(float)


p_shell = g.shell(pauldron, 0.22, lambda b, p, n: IRON if b.x < 0.33 else IRON_DARK, smooth_rounds=8, rim=1.0, under=IRON_DARK)
g.rivets(g.edge_of(p_shell, 3), 0.04, IRON_LIGHT, out=0.0)


def bracers(B, P):
    x, fw, z = wg.xfz(B)
    return ((np.abs(x) > 0.55) & (np.abs(x) < 0.705)).astype(float)


g.shell(bracers, 0.06, lambda b, p, n: IRON_DARK if (abs(b.x) - 0.55) % 0.05 < 0.012 else LEATHER, smooth_rounds=3, rim=1.0, under=LEATHER, cut=0.99)


def harness(B, P):
    x, fw, z = wg.xfz(B)
    d = np.abs((z - 1.15) - 0.85 * x)
    return ((d < 0.022) & (z > 0.95) & (z < 1.46) & (np.abs(x) < 0.2)).astype(float)


h_shell = g.shell(harness, 0.07, LEATHER, smooth_rounds=2, rim=1.0)
ring, normal, bone = g.anchor((0.02, 1.17, 0.12))
m.ring(ring + normal * 0.09, 0.13, 0.03, IRON, bone, axis=normal, segments=12)


def belt(B, P):
    x, fw, z = wg.xfz(B)
    level = 0.955 + 0.02 * wg.smooth(0.05, -0.08, fw)
    return (np.abs(z - level) < 0.026).astype(float)


g.shell(belt, 0.1, LEATHER, smooth_rounds=2, rim=1.0)
buckle, normal, _ = g.anchor((0, 0.955, 0.12))
m.box(buckle + normal * 0.13, (0.34, 0.08, 0.26), IRON, "pelvis")
m.box(buckle + normal * 0.16, (0.2, 0.06, 0.14), IRON_DARK, "pelvis")


# ── A hide kilt to the knees, and boots of fur bound with thongs. ──
def kilt(B, P):
    x, fw, z = wg.xfz(B)
    n = wg.vnoise(B, 0.03, 3)
    leg = 0.8 + 0.1 * wg.smooth(0.03, 0.14, np.abs(x)) + 0.012 * n
    return ((z > leg) & (z < 0.99) & (np.abs(x) < 0.2)).astype(float)


g.shell(kilt, 0.05, lambda b, p, n: HIDE if wg.vnoise([b], 0.05, 4)[0] < 0.3 else HIDE_DARK, bumps=(0.02, 0.04), rim=1.0, under=HIDE_DARK, cut=0.99)
for i in range(9):
    a = 2 * math.pi * (i + 0.5) / 9
    top, normal, _ = g.anchor((math.sin(a) * 0.14, 0.92, math.cos(a) * 0.12))
    out = Vector((normal.x, normal.y, 0)).normalized()
    length = (0.95 if abs(math.cos(a)) > 0.75 else 0.75) * (1 + 0.1 * math.sin(i * 2.3)) * S / 3.46
    wg.flap(m, top + out * 0.12, out, 0.85, length * 1.9, 0.04, HIDE if i % 2 else HIDE_DARK, "pelvis", flare=0.14, jag=0.3, seed=i + 20, curve=0.3)


def boots(B, P):
    x, fw, z = wg.xfz(B)
    n = wg.vnoise(B, 0.02, 9)
    return (z < 0.4 + 0.015 * n).astype(float)


g.shell(boots, 0.07, lambda b, p, n: furry(b, p, n) if b.z > 0.33 else (LEATHER if (b.z % 0.07) < 0.014 and b.z > 0.08 else HIDE_DARK), bumps=(0.05, 0.03), rim=0.8, cut=0.99)

# ── The greataxe: an iron-banded haft held a third of the way up, a broad bearded crescent blade with a
# honed edge, and a spike behind it; carried forward and down so it clears the ground as the arm swings. ──
L = 3.5
HEAD_AT = 2.35  # from the grip to the blade's middle
axe = [
    (lambda: wg.lathe(m, Vector((0, L - HEAD_AT, 0)), Vector((0, -HEAD_AT - 0.35, 0)), [0.085, 0.08, 0.075, 0.075, 0.08, 0.085], WOOD, "hand_r", around=8, rough=0.04, grooves=0.04, seed=1, cap=IRON_DARK), ()),
    (lambda: wg.lathe(m, Vector((0, 0.38, 0)), Vector((0, -0.38, 0)), [0.092, 0.095, 0.095, 0.092], LEATHER, "hand_r", around=8), ()),
    (lambda: m.sphere(Vector((0, L - HEAD_AT, 0)), (0.12, 0.1, 0.12), IRON, "hand_r", segments=8, rings=6), ()),
]
for y in (-0.7, -1.3, -1.8, -HEAD_AT + 0.35, -HEAD_AT - 0.3, 0.7):
    axe.append((lambda y=y: m.ring(Vector((0, y, 0)), 0.09, 0.022, IRON, "hand_r", axis=(0, 1, 0), segments=10), ()))
outer = [(0.08, 0.32), (0.3, 0.36), (0.62, 0.58), (0.8, 0.36), (0.9, 0.0), (0.82, -0.4), (0.62, -0.68), (0.36, -0.42), (0.08, -0.32)]
inner = [(0.08 + (a - 0.08) * 0.88, b * 0.9) for a, b in outer]
axe.append((lambda: wg.slab(m, outer, inner, Vector((0, -HEAD_AT, 0)), Vector((-1, 0, 0)), Vector((0, -1, 0)), 0.11, 0.025, IRON, "hand_r", edge=EDGE), ()))
axe.append((lambda: m.box(Vector((0, -HEAD_AT, 0)), (0.24, 0.62, 0.17), IRON_DARK, "hand_r"), ()))
axe.append((lambda: m.cone(Vector((0.1, -HEAD_AT, 0)), Vector((0.6, -HEAD_AT - 0.08, 0)), 0.1, IRON, "hand_r", segments=6, smooth=False), ()))
grip = g.map((-(0.745 + 0.105), 1.43 - 0.04, 0.0), "hand_r")
m.weapon(axe, grip, tilt=-0.38)

g.finish(ww.humanoid_actions(arm_down=72), bake={"size": 512, "ao": 0.3, "mottle": 0.1, "mottle_scale": 10, "dirt": 0.9, "head_scale": 4.0})
