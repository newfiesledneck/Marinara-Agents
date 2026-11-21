"""Hill giant (SRD: Huge giant): about 4.9 metres of brutish bulk, with a big gut, thick limbs, a small
sloping forehead, a heavy jaw, small deep-set eyes and a mess of greasy hair and scraggly beard; crude
hides and furs stitched together, a rope belt, bare dirty feet, and a club that was a young tree, roots
and all. Writes assets/models/hill_giant.glb. Run (BLENDER: your Blender executable):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_hill_giant.py
"""

import math
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import wwblend as ww  # noqa: E402
import wwgiant as wg  # noqa: E402
from wwblend import Vector, shade  # noqa: E402

SKIN = 0x86664E
SKIN_DARK = shade(SKIN, 0.8)
SKIN_RED = 0x8E5E4A
DIRT = 0x54443A
HAIR = 0x2A2119
HAIR_LIGHT = 0x3C2E22
HIDES = (0x6B5238, 0x5A4630, 0x7A6448, 0x4C3C2A)
STITCH = 0x2A2018
FUR = 0x4E4236
FUR_LIGHT = 0x6A5C48
FUR_DARK = 0x352C24
ROPE = 0x6A5A3E
BARK = 0x463828
BARK_DARK = 0x30261C
WOOD = 0x8A7050
MOSS = 0x4A5030
BONE = 0xCFC2A0

g = wg.Giant("hill_giant", {"heavy": 0.85, "belly": 1.0, "muscle": 0.7, "shoulders": 0.8, "neck": 1.0, "cheeks": 0.6, "nose": 0.6, "eyes": -0.5})
# The face: a low brow sloping back, a heavy ridge over small deep-set eyes, a broad flat nose, a heavy
# jutting jaw.
g.push((0, 1.75, 0.04), (0.1, 0.05, 0.07), (0, -0.016, -0.03))
for s in (1, -1):
    g.bump((s * 0.03, 1.688, 0.09), (0.032, 0.011, 0.03), 0.012, facing=(0, 0.3, 1))
    g.push((s * 0.032, 1.666, 0.075), (0.018, 0.01, 0.02), (0, -0.002, -0.007))
    g.push((s * 0.058, 1.57, 0.03), (0.032, 0.032, 0.05), (s * 0.014, -0.004, 0.0))
    g.bump((s * 0.05, 1.635, 0.07), (0.022, 0.016, 0.025), 0.006)
    g.push((s * 0.075, 1.665, -0.01), (0.02, 0.03, 0.03), (s * 0.006, 0, 0))  # ears stuck out
g.bump((0, 1.69, 0.095), (0.022, 0.01, 0.02), 0.01, facing=(0, 0.3, 1))
g.bump((0, 1.618, 0.105), (0.026, 0.016, 0.02), 0.006)
g.push((0, 1.535, 0.06), (0.065, 0.03, 0.06), (0, -0.012, 0.016))
g.push((0, 1.596, 0.095), (0.028, 0.01, 0.02), (0, 0, -0.012))
# The gut: a great hanging belly over the belt.
g.push((0, 1.04, 0.1), (0.15, 0.12, 0.1), (0, -0.025, 0.07))
g.push((0, 0.97, 0.08), (0.13, 0.05, 0.08), (0, -0.01, 0.03))
g.curl_hand("r", angles=(70, 85, 50))
g.curl_hand("l", angles=(85, 100, 60))
g.keep_base()
g.proportion(
    4.9,
    {
        "torso": 1.06,
        "leg": 0.92,
        "arm": 1.06,
        "shoulders": 1.15,
        "hips": 1.15,
        "head": 0.92,
        "hand": 1.25,
        "foot": 1.15,
        "thick": {
            "pelvis": (1.25, 1.3),
            "spine_01": (1.25, 1.45),
            "spine_02": (1.2, 1.3),
            "spine_03": (1.15, 1.15),
            "neck_01": (1.15, 1.1),
            "clavicle_l": (1.2, 1.2),
            "clavicle_r": (1.2, 1.2),
            "upperarm_l": (1.3, 1.3),
            "upperarm_r": (1.3, 1.3),
            "lowerarm_l": (1.35, 1.35),
            "lowerarm_r": (1.35, 1.35),
            "thigh_l": (1.3, 1.3),
            "thigh_r": (1.3, 1.3),
            "calf_l": (1.3, 1.25),
            "calf_r": (1.3, 1.25),
        },
    },
)
g.reduce(10500)
S = g.S


# ── The skin: weathered and grimy, dirt caked up the feet and shins. ──
def skin(b, p, n):
    x, fw, z = b.x, -b.y, b.z
    if z < 0.07 or (z < 0.2 and wg.vnoise([b], 0.03, 3)[0] > 2.5 * z - 0.2):
        return DIRT
    v = wg.vnoise([b], 0.06, 1)[0]
    if z < 1.5 and wg.vnoise([b], 0.03, 6)[0] > 0.45:
        return shade(DIRT, 1.15)  # (smears of grime)
    return SKIN_DARK if v < -0.25 else (SKIN_RED if v > 0.45 and z < 1.5 else SKIN)


g.colour_body({"skin": skin, "underwear": SKIN, "eye_white": 0xA89878, "iris": 0x1E140C, "eyebrows": HAIR, "lips": 0x6A4E40, "nails": 0x4A3C2C})


# ── Greasy hair, a tangled mass over a low hairline, and a scraggly beard. ──
def hair(B, P):
    x, fw, z = wg.xfz(B)
    n = wg.vnoise(B, 0.018, 1)
    line = 1.742 - 0.15 * wg.smooth(0.05, -0.07, fw)
    ears = (np.abs(x) > 0.062) & (z > 1.62) & (z < 1.71) & (fw > -0.045) & (fw < 0.035)
    return ((z - line + 0.012 * n > 0) & ~ears & (z > 1.5)).astype(float)


g.shell(hair, 0.035, lambda b, p, n: HAIR if wg.vnoise([b], 0.015, 2)[0] < 0.2 else HAIR_LIGHT, bumps=(0.07, 0.03), rim=0.8)


def beard(B, P):
    x, fw, z = wg.xfz(B)
    n = wg.vnoise(B, 0.012, 4)
    chin = (z < 1.578) & (z > 1.49) & (fw > -0.01) & (np.abs(x) < 0.08)
    side = (np.abs(x) > 0.05) & (np.abs(x) < 0.1) & (z < 1.66) & (z > 1.54) & (fw > -0.03) & (fw < 0.045)
    lips = (z > 1.574) & (np.abs(x) < 0.032)
    return ((chin | side) & ~lips & (n > -0.45)).astype(float)


g.shell(beard, 0.02, lambda b, p, n: HAIR if wg.vnoise([b], 0.01, 8)[0] < 0.3 else HAIR_LIGHT, bumps=(0.05, 0.014), rim=0.8)


# ── Crude hides stitched together over one shoulder, a fur pelt round the shoulders and a rope belt. ──
def tunic(B, P):
    x, fw, z = wg.xfz(B)
    n = wg.vnoise(B, 0.03, 5)
    # Over the left shoulder and across to the right hip, the right side of the chest and gut bare.
    top = 1.0 + 0.45 * wg.smooth(-0.17, 0.1, x + np.clip(-fw, 0, 0.25))
    return ((z < top + 0.02 * n) & (z > 0.86 + 0.02 * n) & (np.abs(x) < 0.205) & (z < 1.445)).astype(float)


def hide(b, p, n):
    i, edge = wg.cells([b], 0.16, 2)
    if edge[0] < 0.004:
        return STITCH
    return HIDES[int(i[0] * len(HIDES)) % len(HIDES)]


g.shell(tunic, 0.035, hide, bumps=(0.02, 0.05), rim=1.0, under=shade(HIDES[1], 0.6), cut=0.99)


def pelt(B, P):
    x, fw, z = wg.xfz(B)
    n = wg.vnoise(B, 0.03, 6)
    neck = np.hypot(x, fw + 0.01) < 0.075
    shoulders = (z > 1.37 + 0.02 * n) & (np.abs(x) < 0.25 + 0.02 * n)
    back = (fw < -0.02) & (z > 1.18 + 0.04 * n) & (np.abs(x) < 0.2)
    return ((shoulders | back) & ~(neck & (z > 1.43)) & (z < 1.52)).astype(float)


g.shell(pelt, 0.07, lambda b, p, n: FUR if wg.vnoise([b], 0.02, 7)[0] < 0.25 else (FUR_LIGHT if wg.vnoise([b], 0.02, 7)[0] < 0.55 else FUR_DARK), bumps=(0.08, 0.035), fringe=(0.22, 0.5, FUR_DARK), rim=0.7)


def belt(B, P):
    x, fw, z = wg.xfz(B)
    level = 0.955 + 0.045 * wg.smooth(0.05, -0.08, fw)
    return (np.abs(z - level) < 0.017).astype(float)


g.shell(belt, 0.085, lambda b, p, n: ROPE if int((b.z * 400 + math.atan2(b.x, b.y) * 6) % 2) else shade(ROPE, 0.8), bumps=(0.02, 0.008), smooth_rounds=1, rim=0.5)

# Hide flaps hanging from the belt to the knees, the front and back ones longest; a knot of rope and a
# bone charm at the hip.
m = g.m
for i in range(10):
    a = 2 * math.pi * (i + 0.3) / 10
    x, fw = math.sin(a) * 0.14, math.cos(a) * 0.12
    top, normal, _ = g.anchor((x, 0.93, fw))
    out = Vector((normal.x, normal.y, 0)).normalized()
    length = (1.2 if abs(math.cos(a)) > 0.75 else 0.9) * (1 + 0.12 * math.sin(i * 2.3)) * S / 2.75
    wg.flap(m, top + out * 0.07 - Vector((0, 0, 0.04)), out, 0.58 + 0.1 * math.sin(i * 1.9), length, 0.028, HIDES[i % len(HIDES)], "pelvis", flare=0.16, jag=0.4, seed=i, curve=0.3)
knot, normal, _ = g.anchor((0.11, 0.97, 0.1))
m.sphere(knot + normal * 0.1, (0.1, 0.09, 0.09), ROPE, "pelvis", segments=8, rings=6)
for k, sway in ((0, -0.04), (1, 0.05)):
    m.strand([knot + normal * 0.1, knot + normal * 0.14 + Vector((sway, 0, -0.3)), knot + normal * 0.12 + Vector((sway * 1.5, 0, -0.62))], 0.035, 0.025, ROPE, "pelvis", segments=6)
m.cone(knot + normal * 0.12 + Vector((0.05, 0, -0.62)), knot + normal * 0.14 + Vector((0.07, 0, -0.85)), 0.06, BONE, "pelvis", segments=6)

# Greasy locks hanging over the brow and round the head.
for i in range(9):
    a = math.radians(55 + 250 * i / 8)
    x, fw = math.sin(a) * 0.08, math.cos(a) * 0.085
    up = 1.74 - 0.08 * max(0.0, -math.cos(a))
    root, normal, _ = g.anchor((x, up, fw))
    drop = 0.28 + 0.14 * math.sin(i * 1.7)
    out = Vector((normal.x, normal.y, 0)).normalized()
    mid = root + out * 0.08 + Vector((0, 0, -drop * 0.45))
    end = root + out * 0.1 + Vector((0.04 * math.sin(i * 3.1), 0, -drop))
    m.strand([root - normal * 0.02, mid, end], 0.04, 0.01, HAIR if i % 3 else HAIR_LIGHT, "Head", segments=5)

# ── The club: a young oak torn up by the roots, the trunk stripped to a grip at the thin end, the root
# ball at the other bristling with stubs; lowered forward so it clears the ground as the arm swings. ──
L = 2.5
club = []
# The trunk, barked and furrowed, swelling towards its broken top; a few branches snapped off short,
# angled towards the top as a tree's grow; a scab of moss.
club.append((lambda: wg.lathe(m, Vector((0, 0.32, 0)), Vector((0, -L, 0)), [0.085, 0.088, 0.092, 0.1, 0.115, 0.13, 0.15, 0.17, 0.2, 0.23, 0.26, 0.28, 0.29, 0.27], BARK, "hand_r", around=12, rough=0.2, grooves=0.18, seed=1, cap=shade(WOOD, 0.7)), ()))
for k, (y, ang, length, r) in enumerate(((0.58, 0.9, 0.3, 0.075), (0.76, 3.7, 0.4, 0.1), (0.9, 5.6, 0.3, 0.09))):
    across = Vector((math.cos(ang), 0, math.sin(ang)))
    root = Vector((0, -L * y, 0)) + across * 0.1
    tip = root + (across * 0.55 + Vector((0, -0.85, 0))).normalized() * length
    club.append((lambda root=root, tip=tip, k=k, r=r: wg.lathe(m, root, tip, [r, r * 0.9, r * 0.75], BARK_DARK, "hand_r", around=7, rough=0.2, seed=k + 3, cap=WOOD), ()))
club.append((lambda: m.sphere(Vector((0.17, -L * 0.62, 0.1)), (0.08, 0.26, 0.07), MOSS, "hand_r", segments=8, rings=5), ()))
grip = g.map((-(0.745 + 0.105), 1.43 - 0.04, 0.0), "hand_r")
m.weapon(club, grip, tilt=-0.45)

g.finish(ww.humanoid_actions(arm_down=72), bake={"size": 512, "ao": 0.3, "mottle": 0.12, "mottle_scale": 9, "dirt": 1.1, "head_scale": 4.0})
