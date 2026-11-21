"""Fire giant (SRD: Huge giant): about 5.5 metres, broad and immensely strong, built like a dwarf grown
huge: short heavy legs, a deep chest and massive shoulders. Coal-black skin, eyes like embers, and hair
and a braided beard that burn orange and red like a forge fire. Heavy blackened plate: a breastplate,
riveted pauldrons, vambraces, greaves and tassets, over mail and a soot-stained tabard; a huge
greatsword. Writes assets/models/fire_giant.glb. Run (BLENDER: your Blender executable):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_fire_giant.py

The hair, the beard and the eyes are meant to glow: they're the only flame-coloured (bright orange and
yellow) texels in its texture, so the game can light them by colour.
"""

import math
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import wwblend as ww  # noqa: E402
import wwgiant as wg  # noqa: E402
from wwblend import Vector, shade  # noqa: E402

SKIN = 0x2A2624
SKIN_ASH = 0x37312D
SKIN_DEEP = 0x1E1B1A
LIPS = 0x3A2824
EMBER = 0xB8320E
FLAME = 0xE8641A
FLAME_HOT = 0xF6A030
EYE = 0xF08A26
PLATE = 0x3C3734
PLATE_DARK = 0x242221
PLATE_EDGE = 0x6E6458
RIVET = 0x8A6A40
MAIL = 0x3A3836
MAIL_DARK = 0x262524
LEATHER = 0x2E2420
TABARD = 0x4A2822  # (darker and duller than any flame, so only the flames glow)
SOOT = 0x241C1A
BRASS = 0x7A5E36
STEEL = 0x5A5C60
EDGE = 0x8E9094

g = wg.Giant("fire_giant", {"muscle": 1.0, "heavy": 0.6, "chest": 1.0, "shoulders": 1.0, "neck": 1.0, "belly": 0.35, "jaw": 0.8, "nose": 0.6, "eyes": -0.4})
# The face: a heavy scowling brow, a broad nose, a wide strong jaw (under the beard).
g.bump((0, 1.69, 0.092), (0.06, 0.012, 0.03), 0.011, facing=(0, 0.3, 1))
for s in (1, -1):
    g.push((s * 0.032, 1.666, 0.075), (0.018, 0.01, 0.02), (0, -0.002, -0.006))
    g.push((s * 0.012, 1.692, 0.09), (0.015, 0.008, 0.02), (0, -0.004, 0.002))  # (a scowl)
    g.bump((s * 0.05, 1.64, 0.065), (0.022, 0.014, 0.025), 0.006)
    g.push((s * 0.058, 1.56, 0.02), (0.035, 0.035, 0.05), (s * 0.014, -0.004, 0))
g.bump((0, 1.62, 0.105), (0.026, 0.02, 0.02), 0.007)
g.push((0, 1.54, 0.06), (0.06, 0.03, 0.06), (0, -0.006, 0.01))
g.curl_hand("r", angles=(70, 85, 50))
g.curl_hand("l", angles=(85, 100, 60))
g.keep_base()
g.proportion(
    5.2,
    {
        "torso": 1.1,
        "leg": 0.82,
        "arm": 1.0,
        "shoulders": 1.32,
        "hips": 1.22,
        "head": 1.06,
        "hand": 1.32,
        "foot": 1.22,
        "neck": 0.75,
        "thick": {
            "pelvis": (1.25, 1.25),
            "spine_01": (1.3, 1.3),
            "spine_02": (1.32, 1.3),
            "spine_03": (1.35, 1.3),
            "neck_01": (1.4, 1.35),
            "clavicle_l": (1.3, 1.3),
            "clavicle_r": (1.3, 1.3),
            "upperarm_l": (1.45, 1.45),
            "upperarm_r": (1.45, 1.45),
            "lowerarm_l": (1.45, 1.45),
            "lowerarm_r": (1.45, 1.45),
            "thigh_l": (1.45, 1.45),
            "thigh_r": (1.45, 1.45),
            "calf_l": (1.4, 1.4),
            "calf_r": (1.4, 1.4),
        },
    },
)
g.reduce(8800)
S = g.S
m = g.m


def skin(b, p, n):
    if abs(b.x) > 0.716:
        return LEATHER  # (gloves)
    v = wg.vnoise([b], 0.06, 2)[0]
    return SKIN_DEEP if v < -0.3 else (SKIN_ASH if v > 0.4 else SKIN)


g.colour_body({"skin": skin, "underwear": SKIN, "eye_white": EYE, "iris": FLAME_HOT, "eyebrows": EMBER, "lips": LIPS, "nails": SKIN_DEEP})


def fiery(b, p, n):
    """Flame colours: deep red at the roots, orange through, hot yellow-orange in the lighter licks."""
    v = wg.vnoise([b], 0.014, 5)[0]
    return EMBER if v < -0.25 else (FLAME_HOT if v > 0.35 else FLAME)


# ── Hair like a bonfire, swept up and back, and a great beard in thick braids. ──
def hair(B, P):
    x, fw, z = wg.xfz(B)
    n = wg.vnoise(B, 0.015, 1)
    line = 1.735 - 0.13 * wg.smooth(0.05, -0.07, fw)
    ears = (np.abs(x) > 0.062) & (z > 1.62) & (z < 1.71) & (fw > -0.045) & (fw < 0.035)
    head = np.hypot(x, fw + 0.01) < 0.12
    return ((z - line + 0.01 * n > 0) & ~ears & head & (z > 1.5)).astype(float)


g.shell(hair, 0.07, fiery, bumps=(0.14, 0.03), rim=0.8)


def beard(B, P):
    x, fw, z = wg.xfz(B)
    face = (z < 1.615) & (z > 1.46) & (fw > -0.015) & (np.abs(x) < 0.1)
    side = (np.abs(x) > 0.05) & (np.abs(x) < 0.1) & (z < 1.68) & (z > 1.54) & (fw > -0.03) & (fw < 0.05)
    chest = (fw > 0.0) & (z > 1.42) & (z < 1.52) & (np.abs(x) < 0.09)
    return (face | side | chest).astype(float)


g.shell(beard, 0.07, fiery, bumps=(0.09, 0.025), rim=0.8)
# Licks of flame all over the scalp, rising and streaming back like a fire in a wind.
for i in range(30):
    a = math.radians(-165 + 330 * ((i * 11) % 30) / 29)
    if abs(a) < math.radians(40):
        a = math.copysign(math.radians(40), a) + (0.3 if a >= 0 else -0.3)
    up = 1.775 - (0.02 + 0.09 * ((i * 7) % 5) / 4) * (0.4 + 0.6 * abs(math.sin(a)) + 0.6 * max(0.0, -math.cos(a)))
    r = math.sqrt(max(0.0, 0.0081 - (up - 1.69) ** 2 * 0.9)) + 0.01
    x, fw = math.sin(a) * r, math.cos(a) * r - 0.015
    root, normal, _ = g.anchor((x, up, fw))
    length = 0.24 + 0.2 * math.sin(i * 2.1) ** 2
    tip = root + (normal * 0.8 + Vector((0, 0.55, 0.45))).normalized() * length
    colour = (FLAME, FLAME_HOT, EMBER)[i % 3]
    wg.lathe(m, root - normal * 0.06, tip, [0.13, 0.11, 0.07, 0.03, 0.006], colour, "Head", around=6, rough=0.2, seed=i, cap=FLAME_HOT, bend=(0.05 * math.sin(i * 3.3), 0.08, 0.12))
# The beard's braids, bound with brass rings, and flame-licks at its edges.
for k, s in enumerate((-1, 0, 1)):
    top, n_top, _ = g.anchor((s * 0.035, 1.5, 0.085))
    chest, n_chest, _ = g.anchor((s * 0.05, 1.36, 0.12))
    wg.braid(m, [top + n_top * 0.12, chest + n_chest * 0.3, chest + n_chest * 0.32 + Vector((0, 0, -0.35))], 0.085 if s == 0 else 0.07, FLAME, "Head", EMBER, tie=BRASS)
for i in range(9):
    a = math.radians(-70 + 140 * i / 8)
    root, normal, _ = g.anchor((math.sin(a) * 0.075, 1.56 - 0.05 * math.cos(a), math.cos(a) * 0.07))
    tip = root + (normal * 0.6 + Vector((0, 0, -0.2))).normalized() * 0.32
    wg.lathe(m, root - normal * 0.03, tip, [0.07, 0.05, 0.02, 0.006], EMBER if i % 2 else FLAME, "Head", around=6, rough=0.15, seed=i + 20, bend=(0, 0, 0.12))


# ── Heavy blackened plate. ──
def breastplate(B, P):
    x, fw, z = wg.xfz(B)
    neck = (np.hypot(x, fw + 0.005) < 0.085) & (z > 1.42)
    return ((z > 0.965) & (z < 1.47) & (np.abs(x) < 0.205) & ~neck).astype(float)


def plated(b, p, n):
    if b.z < 1.08 and (b.z - 0.965) % 0.04 < 0.008:
        return PLATE_EDGE  # (the lames at its foot, their edges worn bright)
    if abs(b.x) < 0.006 and -b.y > 0:
        return PLATE_EDGE  # (the keel down its front)
    return PLATE


bp = g.shell(breastplate, 0.16, plated, smooth_rounds=10, rim=1.0, under=PLATE_EDGE, cut=0.99)
g.rivets(g.edge_of(bp, 6), 0.03, RIVET)


def gorget(B, P):
    x, fw, z = wg.xfz(B)
    return ((np.hypot(x, fw + 0.005) < 0.1) & (z > 1.42) & (z < 1.515)).astype(float)


g.shell(gorget, 0.2, PLATE, smooth_rounds=4, rim=1.0, under=PLATE_EDGE)


def pauldrons(B, P):
    x, fw, z = wg.xfz(B)
    ax = np.abs(x)
    return ((ax > 0.13) & (ax < 0.36) & (z > 1.37 + 0.1 * np.clip(ax - 0.3, 0, 1))).astype(float)


def lames(b, p, n):
    return PLATE_EDGE if (abs(b.x) - 0.13) % 0.055 < 0.01 else PLATE


pd = g.shell(pauldrons, 0.3, lames, smooth_rounds=8, rim=1.0, under=PLATE_EDGE)
g.rivets(g.edge_of(pd, 5), 0.032, RIVET)
for s, side in ((1, "l"), (-1, "r")):
    for x in (0.19, 0.245, 0.3):
        point, normal, bone = g.anchor((s * x, 1.47, 0.0))
        m.sphere(point + normal * 0.3, (0.05, 0.05, 0.05), RIVET, bone, segments=6, rings=4)


def vambraces(B, P):
    x, fw, z = wg.xfz(B)
    return ((np.abs(x) > 0.53) & (np.abs(x) < 0.712)).astype(float)


g.shell(vambraces, 0.08, lambda b, p, n: PLATE_EDGE if (abs(b.x) - 0.53) % 0.06 < 0.01 else PLATE, smooth_rounds=3, rim=1.0, under=PLATE_EDGE, cut=0.99)


def greaves(B, P):
    x, fw, z = wg.xfz(B)
    return (z < 0.5).astype(float)


g.shell(greaves, 0.09, lambda b, p, n: PLATE_EDGE if (b.z < 0.12 and b.z % 0.03 < 0.007) or abs(b.z - 0.42) < 0.006 else PLATE, smooth_rounds=4, rim=1.0, under=PLATE_EDGE, cut=0.99)
for s, side in ((1, "l"), (-1, "r")):
    knee, normal, _ = g.anchor((s * 0.092, 0.52, 0.06))
    m.sphere(knee + normal * 0.12, (0.2, 0.15, 0.22), PLATE, f"calf_{side}", segments=10, rings=6)
    m.sphere(knee + normal * 0.3, (0.05, 0.05, 0.05), RIVET, f"calf_{side}", segments=6, rings=4)


# Mail at the hips under tassets of plate, a broad belt and a soot-stained tabard before and behind.
def mail(B, P):
    x, fw, z = wg.xfz(B)
    leg = 0.78 + 0.08 * wg.smooth(0.03, 0.14, np.abs(x))
    return ((z > leg) & (z < 0.99) & (np.abs(x) < 0.2)).astype(float)


g.shell(mail, 0.06, lambda b, p, n: MAIL_DARK if (b.z * 160) % 2 < 0.6 else MAIL, rim=1.0, under=MAIL_DARK, cut=0.99)


def belt(B, P):
    x, fw, z = wg.xfz(B)
    return (np.abs(z - 0.955) < 0.028).astype(float)


g.shell(belt, 0.22, LEATHER, smooth_rounds=3, rim=1.0)
buckle, normal, _ = g.anchor((0, 0.955, 0.12))
m.box(buckle + normal * 0.24, (0.4, 0.08, 0.3), BRASS, "pelvis")
m.box(buckle + normal * 0.27, (0.24, 0.06, 0.16), PLATE_DARK, "pelvis")
for fw, width, length in ((1, 0.95, 1.55), (-1, 1.05, 1.5)):
    top, normal, _ = g.anchor((0, 0.94, fw * 0.12))
    out = Vector((0, normal.y, 0)).normalized()
    wg.flap(m, top + out * 0.18, out, width, length, 0.04, lambda t: TABARD if t < 0.45 else (shade(TABARD, 0.7) if t < 0.7 else SOOT), "pelvis", flare=0.06, jag=0.25, seed=30 + fw, curve=0.3, columns=5, rows=6)
for i, a in enumerate((0.75, 1.45, -0.75, -1.45)):
    top, normal, _ = g.anchor((math.sin(a) * 0.15, 0.93, math.cos(a) * 0.12))
    out = Vector((normal.x, normal.y, 0)).normalized()
    wg.flap(m, top + out * 0.24, out, 0.62, 0.72, 0.06, lambda t: PLATE_DARK if 0.48 < t < 0.56 else PLATE, "pelvis", flare=0.1, jag=0.0, seed=40 + i, curve=0.2, columns=3, rows=4)

# ── The greatsword: a broad blade of dark steel with a honed edge, a heavy cross-guard, a long grip
# bound in leather and a disc pommel; carried forward and down, clear of the ground as the arm swings. ──
BLADE = 2.7
WIDTH = 0.38
outer = [(-WIDTH / 2, 0.0), (WIDTH / 2, 0.0), (WIDTH * 0.43, BLADE * 0.8), (0.0, BLADE), (-WIDTH * 0.43, BLADE * 0.8)]
inner = [(-WIDTH * 0.22, 0.02), (WIDTH * 0.22, 0.02), (WIDTH * 0.18, BLADE * 0.78), (0.0, BLADE * 0.93), (-WIDTH * 0.18, BLADE * 0.78)]
GUARD = -0.3
sword = [
    (lambda: wg.slab(m, outer, inner, Vector((0, GUARD, 0)), Vector((1, 0, 0)), Vector((0, -1, 0)), 0.075, 0.018, STEEL, "hand_r", edge=EDGE), ()),
    (lambda: m.box(Vector((0, GUARD + 0.05, 0)), (1.0, 0.12, 0.14), PLATE_DARK, "hand_r"), ()),
    (lambda: wg.lathe(m, Vector((0, GUARD + 0.1, 0)), Vector((0, 0.55, 0)), [0.075, 0.08, 0.08, 0.08, 0.075], LEATHER, "hand_r", around=8, rough=0.04), ()),
    (lambda: wg.lathe(m, Vector((0, 0.55, 0)), Vector((0, 0.68, 0)), [0.12, 0.15, 0.12], BRASS, "hand_r", around=10, smooth=False), ()),
]
for s in (1, -1):
    sword.append((lambda s=s: m.cone(Vector((s * 0.48, GUARD + 0.05, 0)), Vector((s * 0.62, GUARD - 0.12, 0)), 0.07, PLATE_DARK, "hand_r", segments=6, smooth=False), ()))
grip = g.map((-(0.745 + 0.105), 1.43 - 0.04, 0.0), "hand_r")
m.weapon(sword, grip, tilt=-0.4)

g.finish(ww.humanoid_actions(arm_down=72), bake={"size": 512, "ao": 0.3, "mottle": 0.1, "mottle_scale": 10, "dirt": 1.0, "head_scale": 4.0})
