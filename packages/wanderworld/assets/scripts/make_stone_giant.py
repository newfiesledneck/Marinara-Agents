"""Stone giant (SRD: Huge giant): about 5.5 metres, lean, tall and athletic, with hairless grey skin like
weathered stone, streaked darker and cut with carved markings, solemn chiselled features and deep-set
eyes as dark as cave mouths; a hide loincloth under a belt of stone beads, and a greatclub of shaped and
carved stone. Writes assets/models/stone_giant.glb. Run (BLENDER: your Blender executable):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_stone_giant.py
"""

import math
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import wwblend as ww  # noqa: E402
import wwgiant as wg  # noqa: E402
from wwblend import Vector  # noqa: E402

STONE = 0x6E6E6C
STONE_LIGHT = 0x7E7E7A
STONE_DARK = 0x5E5E5C
STREAK = 0x3A3A3A
MARK = 0xA8A69E
EYE = 0x161616
LIPS = 0x605C58
CLOTH = 0x4A4038
CLOTH_DARK = 0x3A322C
BEADS = (0x8C8880, 0x5E5C58, 0x9A9488, 0x6E6A62)
CLUB = 0x6A6862
CLUB_DARK = 0x4E4C48
GRIP = 0x3E3228

g = wg.Giant("stone_giant", {"muscle": 1.0, "waist": 0.35, "shoulders": 0.8, "neck": 0.3, "cheeks": -0.4, "eyes": -0.3, "jaw": 0.4})
# The face: long and solemn, a flat heavy brow over deep-set eyes, high cheekbones over hollow cheeks, a
# long straight nose, thin lips and a square jaw; a low ridge along the crown.
g.push((0, 1.54, 0.05), (0.06, 0.04, 0.06), (0, -0.016, 0.006))
g.bump((0, 1.69, 0.09), (0.06, 0.01, 0.03), 0.008, facing=(0, 0.3, 1))
for s in (1, -1):
    g.push((s * 0.055, 1.56, 0.0), (0.03, 0.03, 0.05), (s * 0.009, -0.006, 0))
    g.push((s * 0.032, 1.666, 0.075), (0.018, 0.01, 0.02), (0, -0.001, -0.008))
    g.bump((s * 0.05, 1.645, 0.06), (0.02, 0.012, 0.03), 0.007)
    g.bump((s * 0.05, 1.598, 0.06), (0.02, 0.018, 0.03), -0.005)
    g.push((s * 0.075, 1.665, -0.01), (0.02, 0.03, 0.03), (-s * 0.004, 0, 0))
g.bump((0, 1.64, 0.105), (0.01, 0.03, 0.015), 0.004)
g.push((0, 1.596, 0.092), (0.03, 0.01, 0.02), (0, 0, -0.007))
g.bump((0, 1.77, -0.01), (0.012, 0.03, 0.08), 0.004)
# Weathered stone: plates with creases between them, and carved markings (bands round the arms, chevrons
# on the chest, a line down the spine, a mark on the brow).


def markings(B):
    x, fw, z = wg.xfz(B)
    ax = np.abs(x)
    out = np.zeros(len(B))
    for c in (0.3, 0.335, 0.52):
        out = np.maximum(out, wg.smooth(0.009, 0.004, np.abs(ax - c)) * (ax > 0.22))
    for c in (1.37, 1.33):
        chevron = np.abs(z - (c - 0.55 * ax)) * (ax < 0.15) * (fw > 0.02) + (ax >= 0.15) + (fw <= 0.02)
        out = np.maximum(out, wg.smooth(0.008, 0.0035, chevron))
    spine = np.abs(x) + (fw > -0.05) + (z < 1.0) + (z > 1.42)
    out = np.maximum(out, wg.smooth(0.006, 0.0025, spine))
    # Three short lines down the brow, and one down from each eye like a tear.
    brow = np.minimum(np.abs(np.abs(x) - 0.012) + (np.abs(np.abs(x) - 0.012) < 0.004) * 0 , np.abs(x)) + np.maximum(0, np.abs(z - 1.725) - 0.012) * 3 + (fw < 0.05)
    out = np.maximum(out, wg.smooth(0.004, 0.0018, brow))
    tear = np.abs(np.abs(x) - 0.034) + np.maximum(0, np.abs(z - 1.632) - 0.02) * 3 + (fw < 0.05)
    out = np.maximum(out, wg.smooth(0.0035, 0.0015, tear))
    calf = np.abs(z - (0.33 + 0.04 * np.sin(np.arctan2(fw, x - np.sign(x) * 0.09) * 3))) + (z > 0.45)
    out = np.maximum(out, wg.smooth(0.007, 0.003, calf))
    return out


g.noise(0.0022, 0.035, where=lambda P: 1 - wg.smooth(0.1, 0.0, P[:, 2]) * 0.5, kind="cells")
g.carve(markings, 0.0014)
g.curl_hand("r", angles=(70, 85, 50))
g.curl_hand("l", angles=(65, 80, 45))
g.keep_base()
g.proportion(
    5.5,
    {
        "torso": 1.03,
        "leg": 1.07,
        "arm": 1.08,
        "shoulders": 1.06,
        "hips": 0.98,
        "head": 1.0,
        "hand": 1.2,
        "foot": 1.08,
        "neck": 1.15,
        "thick": {
            "spine_02": (1.04, 1.02),
            "spine_03": (1.12, 1.06),
            "neck_01": (1.08, 1.06),
            "clavicle_l": (1.1, 1.1),
            "clavicle_r": (1.1, 1.1),
            "upperarm_l": (1.28, 1.28),
            "upperarm_r": (1.28, 1.28),
            "lowerarm_l": (1.3, 1.3),
            "lowerarm_r": (1.3, 1.3),
            "thigh_l": (1.2, 1.2),
            "thigh_r": (1.2, 1.2),
            "calf_l": (1.2, 1.2),
            "calf_r": (1.2, 1.2),
        },
    },
)
g.reduce(11000)
S = g.S


def skin(b, p, n):
    x, fw, z = b.x, -b.y, b.z
    if markings(np.array([b]))[0] > 0.5:
        return MARK
    # (The darker streaks are veined in by the bake.) Broad patches of lighter and darker grey.
    v = wg.vnoise([b], 0.09, 2)[0]
    return STONE_DARK if v < -0.45 else (STONE_LIGHT if v > 0.4 else STONE)


g.colour_body({"skin": skin, "underwear": STONE, "eye_white": EYE, "iris": 0x050505, "eyebrows": STONE_DARK, "lips": LIPS, "nails": STONE_DARK})


# ── A hide loincloth: a wrap round the hips, and long flaps before and behind under a belt of stones. ──
def wrap(B, P):
    x, fw, z = wg.xfz(B)
    n = wg.vnoise(B, 0.03, 3)
    leg = 0.81 + 0.1 * wg.smooth(0.03, 0.14, np.abs(x)) + 0.012 * n
    return ((z > leg) & (z < 0.985) & (np.abs(x) < 0.2)).astype(float)


g.shell(wrap, 0.035, lambda b, p, n: CLOTH if wg.vnoise([b], 0.05, 4)[0] < 0.3 else CLOTH_DARK, bumps=(0.015, 0.04), rim=1.0, under=CLOTH_DARK, cut=0.99)
m = g.m
for fw, length, width in ((1, 1.2, 0.72), (-1, 1.05, 0.78)):
    top, normal, _ = g.anchor((0, 0.955, fw * 0.12))
    out = Vector((0, normal.y, 0)).normalized()
    wg.flap(m, top + out * 0.07, out, width * S / 3.1, length * S / 3.1, 0.03, CLOTH, "pelvis", flare=0.08, jag=0.35, seed=4 + fw, curve=0.35, columns=5)
# The belt: a cord strung with rough-cut stones, a great carved disc at the front.
for i in range(26):
    a = 2 * math.pi * i / 26
    point, normal, _ = g.anchor((math.sin(a) * 0.13, 0.975 + 0.01 * math.cos(a), math.cos(a) * 0.11))
    r = (0.07 + 0.025 * ((i * 7) % 3)) * S / 3.1
    m.sphere(point + normal * (0.045 + r * 0.6), (r * 1.1, r, r * 0.95), BEADS[i % len(BEADS)], "pelvis", segments=6, rings=4, smooth=False)
point, normal, _ = g.anchor((0, 0.97, 0.12))
disc = point + normal * 0.16
m.tube(disc - normal * 0.05, disc + normal * 0.05, 0.2, 0.18, BEADS[2], "pelvis", segments=8, smooth=False)
m.ring(disc + normal * 0.05, 0.11, 0.02, MARK, "pelvis", axis=normal, segments=8)
# A string of stones round each ankle.
for side, sign in (("l", 1), ("r", -1)):
    for i in range(10):
        a = 2 * math.pi * i / 10
        point, normal, bone = g.anchor((sign * 0.093 + math.sin(a) * 0.05, 0.13, 0.01 + math.cos(a) * 0.05))
        m.sphere(point + normal * 0.06, (0.06, 0.055, 0.055), BEADS[(i + sign) % len(BEADS)], f"calf_{side}", segments=6, rings=4, smooth=False)

# ── The greatclub: a long shaft of shaped stone, bound with hide at the grip, swelling to a heavy
# eight-sided head cut with grooves; held forward and down so it clears the ground as the arm swings. ──
L = 2.75
club = [
    (lambda: wg.lathe(m, Vector((0, 0.3, 0)), Vector((0, -L * 0.45, 0)), [0.1, 0.085, 0.08, 0.085, 0.095], CLUB, "hand_r", around=8, smooth=False), ()),
    (lambda: wg.lathe(m, Vector((0, 0.24, 0)), Vector((0, -0.3, 0)), [0.095, 0.098, 0.098, 0.095], GRIP, "hand_r", around=8, rough=0.05, seed=2), ()),
    (lambda: wg.lathe(m, Vector((0, -L * 0.45, 0)), Vector((0, -L, 0)), [0.11, 0.2, 0.26, 0.28, 0.28, 0.27, 0.24], CLUB, "hand_r", around=8, rough=0.04, seed=3, cap=CLUB_DARK, smooth=False), ()),
    (lambda: m.sphere(Vector((0, 0.34, 0)), (0.14, 0.12, 0.14), CLUB_DARK, "hand_r", segments=8, rings=4, smooth=False), ()),
]
for y in (0.62, 0.78, 0.93):
    club.append((lambda y=y: m.ring(Vector((0, -L * y, 0)), 0.27 if y > 0.7 else 0.21, 0.025, MARK, "hand_r", axis=(0, 1, 0), segments=8), ()))
grip = g.map((-(0.745 + 0.105), 1.43 - 0.04, 0.0), "hand_r")
m.weapon(club, grip, tilt=-0.42)

g.finish(ww.humanoid_actions(arm_down=72), bake={"size": 512, "ao": 0.3, "mottle": 0.14, "mottle_scale": 14, "dirt": 0.8, "head_scale": 4.0, "streaks": {"scale": 1.1, "amount": 0.75, "width": 0.1, "distortion": 7.0, "colour": STREAK}})
