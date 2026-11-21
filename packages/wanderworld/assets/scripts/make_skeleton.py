"""Skeleton (SRD: Medium undead): the animated bones of a person about 1.75 metres tall, held together by
nothing. A skull with deep dark eye sockets, a nasal hole, cheekbones and a hanging jaw of worn teeth; a
spine of separate vertebrae; a ribcage of twelve pairs of ribs on a breastbone; collarbones and shoulder
blades; a pelvis; long bones with knobbly ends; bony hands and feet. Yellowed, stained, chipped bone, a
rusted broken breastplate on a rotten strap, a rag of a loincloth, and a rusty notched shortsword.
Writes assets/models/skeleton.glb. Run (BLENDER: your Blender executable):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_skeleton.py

Every bone is a rigid piece held wholly by one bone of the people's skeleton, as a real skeleton's are.
"""

import math
import os
import random
import sys

import bpy
from mathutils import Matrix, Quaternion

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wwblend import Vector, at, humanoid_actions, humanoid_joints  # noqa: E402
from wwundead import Undead, fbm, pick  # noqa: E402

bpy.ops.wm.read_factory_settings(use_empty=True)
random.seed(7)

BONE = 0xA8956C
BONE_LIGHT = 0xC2B28C
BONE_STAIN = 0x85704C
BONE_DARK = 0x5E4E33
GRIME = 0x4E412C
SOCKET = 0x120E0A
TEETH = 0xB9A97C
TEETH_DARK = 0x857150
CART = 0x86714E
RUST = 0x4E3324
RUST_DARK = 0x30221A
RUST_LIGHT = 0x6A4128
IRON = 0x403E3A
CLOTH = 0x3E3829
CLOTH_DARK = 0x26221A
LEATHER = 0x3C2A1C
GRIP = 0x2A1E16
CLOAK = 0x3A2C20


def paint(q, colour):
    """Stains, grime and chips by where a face is: bone browner low down and in blotches, metal rusted."""
    z = q.z
    if colour == BONE:
        n = fbm(q, 9) + 0.5 * fbm(q, 37)
        low = max(0.0, min(1.0, (0.45 - z) / 0.45))
        n -= low * 0.55
        if n > 0.42:
            return BONE_LIGHT
        if n > -0.12:
            return BONE
        if n > -0.42:
            return BONE_STAIN
        return BONE_DARK if n > -0.7 else GRIME
    if colour == RUST:
        return pick(q, [RUST, RUST_DARK, IRON, RUST, RUST_LIGHT, RUST_DARK], 18)
    if colour == CLOTH:
        return pick(q, [CLOTH, CLOTH_DARK, CLOTH, GRIME], 22)
    if colour == CLOAK:
        return pick(q, [CLOAK, CLOTH_DARK, CLOAK, 0x2A2420], 16)
    return colour


p = {"leg": 0.9, "torso": 0.52, "neck": 0.1, "shoulders": 0.36, "hips": 0.2, "arm": 0.58, "hunch": 0.03, "hand": 1.0, "foot": 1.0}
J = humanoid_joints(p)
m = Undead("skeleton")
m.paint = paint
m.rig(J)
arm_y = p["leg"] + p["torso"] * 0.88
sx = p["shoulders"] / 2


def B(c, r, col=BONE, neg=False):
    return ("-ball" if neg else "ball", at(*c), r, col)


def C(a, b, r, col=BONE, neg=False):
    return ("-cap" if neg else "cap", at(*a), at(*b), r, col)


def E(c, across, up, depth, col=BONE, rot=None, neg=False):
    return ("-ell" if neg else "ell", at(*c), (across, depth, up), col, rot)


def frame(d, u):
    """A turn whose x is the thin side of a plate lying along `d` and up `u` (game directions)."""
    d, u = at(*d).normalized(), at(*u).normalized()
    u = (u - d * u.dot(d)).normalized()
    n = d.cross(u)
    return Matrix((n, d, u)).transposed().to_quaternion()


def chips(scale=150, depth=0.0018):
    """A rough, pitted, chipped surface for a bone."""

    def shape(co, normal):
        n = fbm(co, scale, 2)
        return normal * (depth * n - (0.003 if n < -0.55 else 0.0))

    return shape


# ── The skull: a cranium with a brow over deep sockets, cheekbones and arches, a nasal hole, the upper jaw;
# the hanging lower jaw apart, both with worn, broken teeth. ──
HC = (0.0, 1.625, 0.035)


def H(x, y, z):
    return (HC[0] + x, HC[1] + y, HC[2] + z)


skull = [
    E(H(0, 0.03, -0.022), 0.071, 0.082, 0.094),
    E(H(0, 0.036, 0.035), 0.062, 0.06, 0.05),
    E(H(0, -0.012, -0.072), 0.056, 0.05, 0.034),
    C(H(-0.052, 0.004, 0.072), H(0, 0.01, 0.087), 0.012),
    C(H(0.052, 0.004, 0.072), H(0, 0.01, 0.087), 0.012),
    E(H(0, -0.052, 0.058), 0.04, 0.03, 0.035),
    E(H(0, -0.073, 0.07), 0.031, 0.013, 0.024),
    C(H(0, -0.012, 0.086), H(0, -0.034, 0.093), 0.006),
]
for s in (1, -1):
    skull += [
        B(H(s * 0.045, -0.037, 0.064), 0.0142),
        C(H(s * 0.05, -0.036, 0.055), H(s * 0.062, -0.03, 0.0), 0.0055),
        B(H(s * 0.052, -0.05, -0.018), 0.012),
        C(H(s * 0.036, -0.03, 0.078), H(s * 0.02, -0.06, 0.07), 0.009),
    ]
for s in (1, -1):
    skull += [
        B(H(s * 0.03, -0.016, 0.088), 0.024, SOCKET, True),
        B(H(s * 0.027, -0.018, 0.066), 0.02, SOCKET, True),
        B(H(s * 0.084, 0.002, 0.022), 0.019, BONE, True),
    ]
skull += [
    E(H(0, -0.046, 0.095), 0.0095, 0.017, 0.022, SOCKET, None, True),
    # (Cracks across the cranium.)
    C(H(0.02, 0.1, 0.03), H(0.045, 0.075, 0.06), 0.0035, SOCKET, True),
    C(H(0.045, 0.075, 0.06), H(0.05, 0.05, 0.075), 0.003, SOCKET, True),
    C(H(-0.03, 0.105, -0.04), H(-0.06, 0.07, -0.06), 0.0035, SOCKET, True),
    # (A chipped hole at the back of the head.)
    B(H(-0.055, 0.05, -0.07), 0.016, SOCKET, True),
]
m.piece(skull, "Head", resolution=0.0032, faces=2600, shape=chips(120, 0.0012))
# Darkness at the back of the sockets and the nose.
for s in (1, -1):
    m.sphere(at(*H(s * 0.028, -0.018, 0.062)), (0.018, 0.013, 0.018), SOCKET, "Head", segments=8, rings=5)
m.sphere(at(*H(0, -0.047, 0.084)), (0.008, 0.008, 0.014), SOCKET, "Head", segments=6, rings=4)

# The jaw, hanging open a little: a U of bone from the chin back to two rising branches at the hinges.
hinge = at(*H(0, -0.042, -0.006))
open_jaw = Quaternion((1, 0, 0), math.radians(16))


def J_(x, y, z):
    v = at(*H(x, y, z)) - hinge
    v = open_jaw @ v + hinge
    return v


jaw_pts = []
for k in range(9):
    phi = math.radians(-90 + 180 * k / 8)
    jaw_pts.append((0.047 * math.sin(phi), -0.104 + 0.004 * abs(math.sin(phi)), 0.0 + 0.07 * math.cos(phi)))
jaw = [("ball", J_(0, -0.106, 0.07), 0.013, BONE)]
for a, b in zip(jaw_pts, jaw_pts[1:]):
    jaw.append(("cap", J_(*a), J_(*b), 0.0095, BONE))
for s in (1, -1):
    jaw.append(("cap", J_(s * 0.047, -0.103, 0.0), J_(s * 0.055, -0.048, -0.01), 0.0085, BONE))
    jaw.append(("cap", J_(s * 0.05, -0.09, 0.008), J_(s * 0.046, -0.058, 0.03), 0.006, BONE))
m.piece(jaw, "Head", resolution=0.003, faces=700, shape=chips(140, 0.001))
# Teeth: worn, uneven, some missing, the upper row in the skull, the lower in the jaw.
for row in range(2):
    for k in range(14):
        if (row, k) in ((0, 2), (0, 9), (1, 4), (1, 5), (1, 11)):
            continue
        phi = math.radians(-70 + 140 * k / 13)
        x = 0.029 * math.sin(phi)
        z = 0.03 + 0.04 * math.cos(phi)
        length = 0.011 + 0.004 * random.random() - (0.003 if abs(phi) > 0.8 else 0)
        colour = TEETH if random.random() > 0.3 else TEETH_DARK
        if row == 0:
            root = at(*H(x, -0.078, z))
            tip = root + Vector((0, 0, -length))
        else:
            root = J_(x * 1.02, -0.094, z * 0.98)
            tip = root + open_jaw @ Vector((0, 0, length))
        m.cone(root, tip, 0.0042, colour, "Head", segments=4)

# ── The spine: separate vertebrae from the pelvis up to the skull, curving as a spine does. ──
CURVE = [(0.975, -0.035), (1.05, -0.022), (1.12, -0.038), (1.2, -0.058), (1.3, -0.064), (1.4, -0.046), (1.45, -0.022), (1.5, -0.002), (1.565, 0.018)]


def spine_fwd(y):
    for (y0, f0), (y1, f1) in zip(CURVE, CURVE[1:]):
        if y <= y1:
            w = max(0.0, (y - y0) / (y1 - y0))
            return f0 + (f1 - f0) * w
    return CURVE[-1][1]


def spine_bone(y):
    return "spine_01" if y < 1.16 else "spine_02" if y < 1.29 else "spine_03" if y < 1.415 else "neck_01"


levels = [(0.995 + 0.029 * i, "lumbar") for i in range(5)] + [(1.14 + 0.0255 * i, "thoracic") for i in range(12)] + [(1.44 + 0.0185 * i, "cervical") for i in range(7)]
for y, kind in levels:
    f = spine_fwd(y)
    r, h, length, drop, wing = {"lumbar": (0.021, 0.022, 0.03, 0.006, 0.03), "thoracic": (0.015, 0.018, 0.034, 0.026, 0.024), "cervical": (0.011, 0.013, 0.018, 0.008, 0.016)}[kind]
    bone = spine_bone(y)
    m.sphere(at(0, y, f), (r, r * 0.9, h * 0.5), BONE, bone, segments=8, rings=5)
    base = at(0, y, f - r - 0.006)
    m.cone(base, at(0, y - drop, f - r - 0.006 - length), 0.007, BONE, bone, segments=4, flat=0.6, facing=(1, 0, 0))
    for s in (1, -1):
        m.cone(at(s * 0.006, y + 0.002, f - r * 0.8), at(s * (r + wing), y + 0.003, f - r - 0.012), 0.0055, BONE, bone, segments=4)

# ── The ribcage: twelve pairs of flat ribs sloping down from the spine round to the front, the upper seven
# joined to the breastbone by dried cartilage, the next three to the cartilage above, the last two loose. ──
A = [0.055, 0.08, 0.098, 0.11, 0.12, 0.127, 0.13, 0.131, 0.128, 0.122, 0.112, 0.1]
Bd = [0.045, 0.06, 0.072, 0.08, 0.086, 0.09, 0.092, 0.092, 0.09, 0.087, 0.082, 0.075]
DROP = [0.02, 0.04, 0.058, 0.07, 0.08, 0.088, 0.096, 0.098, 0.096, 0.088, 0.05, 0.03]
END = [0.86, 0.86, 0.85, 0.84, 0.83, 0.82, 0.8, 0.73, 0.69, 0.65, 0.46, 0.38]
STERNUM_FWD = 0.095
rib_ends = {}
for k in range(12):
    y0 = 1.405 - k * 0.0265
    f0 = spine_fwd(y0)
    a, bb = A[k], Bd[k]
    ct = f0 + bb * 0.85
    bone = "spine_03" if k < 7 else "spine_02"
    for s in (1, -1):
        pts = []
        t0 = 0.22
        steps = 9
        for i in range(steps + 1):
            th = t0 + (END[k] * math.pi - t0) * i / steps
            w = (th - t0) / (math.pi - t0)
            pts.append(at(s * a * math.sin(th), y0 - DROP[k] * w**1.2, ct - bb * math.cos(th)))
        up = at(s * math.sin(t0), 0, -math.cos(t0))
        r = 0.0062 if k > 0 else 0.0075
        m.sweep(pts, [r * (0.8 if i == 0 else 1.0) for i in range(len(pts))], BONE, bone, segments=5, flat=0.5, up=up, tip=k >= 10)
        rib_ends[(k, s)] = pts[-1]
# Cartilage from the rib ends to the breastbone (upper seven) or up to the one above (eighth to tenth).
for k in range(10):
    for s in (1, -1):
        end = rib_ends[(k, s)]
        if k < 7:
            yk = 1.392 - k * 0.026
            target = at(s * 0.016, yk, STERNUM_FWD)
            mid = (end + target) / 2 + Vector((0, -0.006, 0.006 * (k / 6)))
        else:
            above = rib_ends[(k - 1, s)]
            target = above.lerp(at(s * 0.03, 1.22, STERNUM_FWD - 0.01), 0.5)
            mid = (end + target) / 2 + Vector((s * -0.004, -0.004, 0.0))
        m.sweep([end, mid, target], [0.0055, 0.005, 0.0045], CART, "spine_03" if k < 7 else "spine_02", segments=5, flat=0.6, tip=False)
sternum = [
    E((0, 1.375, STERNUM_FWD), 0.026, 0.026, 0.008),
    E((0, 1.29, STERNUM_FWD + 0.004), 0.017, 0.07, 0.007),
    C((0, 1.23, STERNUM_FWD + 0.002), (0, 1.195, STERNUM_FWD - 0.006), 0.006),
]
m.piece(sternum, "spine_03", resolution=0.004, faces=300, shape=chips(140, 0.001))

# ── Collarbones, shoulder blades, upper arms, forearms, hands ──
for side, s in (("l", 1), ("r", -1)):
    pts = [at(s * 0.02, 1.393, STERNUM_FWD - 0.006), at(s * 0.07, 1.4, 0.078), at(s * 0.12, 1.404, 0.035), at(s * 0.165, 1.408, -0.005)]
    m.sweep(pts, [0.0085, 0.0068, 0.0068, 0.0085], BONE, f"clavicle_{side}", segments=6, flat=0.75, up=(0, 0, 1), tip=False)
    rot = Quaternion((0, 0, 1), math.radians(s * 28))
    blade = [
        E((s * 0.095, 1.3, -0.096), 0.007, 0.066, 0.042, BONE, rot),
        C((s * 0.06, 1.375, -0.096), (s * 0.082, 1.215, -0.098), 0.0085),
        C((s * 0.082, 1.215, -0.098), (s * 0.15, 1.35, -0.045), 0.0095),
        C((s * 0.06, 1.375, -0.096), (s * 0.135, 1.37, -0.06), 0.007),
        C((s * 0.065, 1.345, -0.106), (s * 0.165, 1.405, -0.02), 0.0075),
        B((s * 0.165, 1.405, -0.018), 0.011),
        B((s * 0.153, 1.355, -0.04), 0.013),
    ]
    m.piece(blade, f"clavicle_{side}", resolution=0.004, faces=420, shape=chips())

    def X(o):
        return s * (sx + o)

    hum = [
        B((X(-0.006), arm_y + 0.004, -0.01), 0.024),
        C((X(0.0), arm_y + 0.002, -0.004), (X(0.03), arm_y, 0.0), 0.016),
        B((X(0.012), arm_y + 0.012, 0.01), 0.014),
        C((X(0.02), arm_y, 0.0), (X(0.28), arm_y - 0.001, 0.0), 0.0115),
        B((X(0.09), arm_y + 0.008, 0.004), 0.0125),
        E((X(0.288), arm_y, 0.0), 0.013, 0.025, 0.015),
        B((X(0.29), arm_y - 0.022, -0.004), 0.0105),
        B((X(0.29), arm_y + 0.02, -0.004), 0.008),
        B((X(0.298), arm_y, 0.004), 0.0125),
    ]
    m.piece(hum, f"upperarm_{side}", resolution=0.0042, faces=520, shape=chips())
    el = p["arm"] * 0.52
    fore = [
        B((X(el - 0.012), arm_y - 0.01, -0.016), 0.013),
        C((X(el - 0.004), arm_y - 0.01, -0.012), (X(p["arm"] - 0.01), arm_y - 0.004, -0.012), 0.0085),
        C((X(p["arm"] - 0.06), arm_y - 0.004, -0.012), (X(p["arm"] - 0.008), arm_y - 0.004, -0.011), 0.0065),
        B((X(p["arm"] - 0.006), arm_y - 0.004, -0.016), 0.0075),
        B((X(el + 0.008), arm_y + 0.011, 0.002), 0.0105),
        C((X(el + 0.008), arm_y + 0.009, 0.003), (X(p["arm"] - 0.03), arm_y + 0.0, 0.014), 0.0075),
        E((X(p["arm"] - 0.012), arm_y, 0.012), 0.012, 0.012, 0.017),
    ]
    m.piece(fore, f"lowerarm_{side}", resolution=0.0036, faces=520, shape=chips())
    wrist = p["arm"]
    hand = f"hand_{side}"
    carpals = [B((X(wrist + 0.012 + 0.012 * (k % 3)), arm_y - 0.003, -0.012 + 0.012 * (k // 3) + 0.004 * (k % 2)), 0.0085) for k in range(6)]
    m.piece(carpals, hand, resolution=0.003, faces=260, shape=chips())
    # Fingers: metacarpal and three bones each, knobbly at every joint; curled, the right hand round the grip.
    curl = (32, 48, 42) if side == "r" else (14, 24, 20)
    for i, (zf, lengths) in enumerate(((0.024, (0.064, 0.04, 0.025, 0.018)), (0.008, (0.062, 0.045, 0.028, 0.019)), (-0.008, (0.058, 0.042, 0.026, 0.018)), (-0.022, (0.052, 0.033, 0.02, 0.016)))):
        q = Vector(at(X(wrist + 0.03), arm_y - 0.004, zf * 0.7))
        d = Vector(at(s, 0, zf * 0.4)).normalized()
        pts, rr = [q], [0.0052]
        for j, length in enumerate(lengths):
            if j > 0:
                d = Quaternion(at(0, 0, 1).normalized(), math.radians(-s * curl[j - 1])) @ d
            mid = q + d * length * 0.5
            q = q + d * length
            pts += [mid, q]
            rr += [0.0036 if j == 0 else 0.0031 - 0.0004 * j, 0.0055 - 0.0008 * j]
        rr[-1] = 0.0028
        m.sweep(pts, rr, BONE, hand, segments=5, flat=0.85, up=(0, 0, 1))
    q = Vector(at(X(wrist + 0.015), arm_y - 0.006, 0.016))
    pts = [q, Vector(at(X(wrist + 0.035), arm_y - 0.008, 0.038)), Vector(at(X(wrist + 0.05), arm_y - 0.01, 0.054)), Vector(at(X(wrist + 0.064), arm_y - 0.014, 0.066)), Vector(at(X(wrist + 0.074), arm_y - 0.02, 0.074))]
    m.sweep(pts, [0.0058, 0.0042, 0.0055, 0.0038, 0.003], BONE, hand, segments=5)

# ── The pelvis: the sacrum, the flaring hip bones with their crests, the sockets, and the ring below. ──
pelvis = [
    E((0, 0.95, -0.066), 0.042, 0.06, 0.018, BONE, Quaternion((1, 0, 0), math.radians(25))),
    C((0, 0.895, -0.078), (0, 0.868, -0.062), 0.0065),
    E((0, 0.83, 0.064), 0.012, 0.02, 0.01),
]
for s in (1, -1):
    d = (s * 0.55, 0, 0.83)
    rot = frame(d, (s * 0.35, 1, 0))
    rim = [(s * 0.042, 1.005, -0.066), (s * 0.098, 1.032, -0.024), (s * 0.126, 1.016, 0.026), (s * 0.12, 0.985, 0.05)]
    pelvis += [
        E((s * 0.088, 0.983, -0.01), 0.01, 0.052, 0.066, BONE, rot),
        C(rim[0], rim[1], 0.008),
        C(rim[1], rim[2], 0.008),
        C(rim[2], rim[3], 0.0075),
        C((s * 0.03, 0.958, -0.066), (s * 0.06, 0.985, -0.056), 0.013),
        C((s * 0.094, 0.948, -0.012), (s * 0.09, 0.872, 0.0), 0.018),
        B((s * 0.09, 0.866, 0.0), 0.027),
        C((s * 0.083, 0.858, 0.022), (s * 0.014, 0.836, 0.064), 0.0105),
        C((s * 0.014, 0.82, 0.058), (s * 0.064, 0.8, -0.018), 0.0095),
        C((s * 0.064, 0.8, -0.018), (s * 0.086, 0.862, -0.016), 0.013),
        B((s * 0.064, 0.796, -0.024), 0.0145),
        B((s * 0.11, 0.868, 0.004), 0.018, SOCKET, True),
    ]
m.piece(pelvis, "pelvis", resolution=0.0045, faces=1100, shape=chips())

# ── Legs: thigh bones with their heads, necks and knobbed knees, kneecaps; shin bones with the thin bone
# beside each; the bones of the feet and toes. ──
for side, s in (("l", 1), ("r", -1)):
    femur = [
        B((s * 0.096, 0.866, 0.003), 0.022),
        C((s * 0.1, 0.862, 0.0), (s * 0.13, 0.845, -0.005), 0.0125),
        B((s * 0.14, 0.853, -0.01), 0.0165),
        B((s * 0.116, 0.81, -0.013), 0.009),
        C((s * 0.135, 0.83, -0.003), (s * 0.121, 0.68, 0.01), 0.0125),
        C((s * 0.121, 0.68, 0.01), (s * 0.104, 0.53, 0.004), 0.0122),
        E((s * 0.1, 0.505, -0.002), 0.034, 0.026, 0.022),
        B((s * 0.08, 0.488, -0.006), 0.0195),
        B((s * 0.121, 0.488, -0.006), 0.0185),
        E((s * 0.1, 0.495, 0.033), 0.016, 0.021, 0.008),
    ]
    m.piece(femur, f"thigh_{side}", resolution=0.0045, faces=620, shape=chips())
    shin = [
        E((s * 0.1, 0.452, 0.0), 0.036, 0.013, 0.03),
        C((s * 0.1, 0.44, 0.003), (s * 0.098, 0.1, -0.003), 0.0115),
        B((s * 0.1, 0.415, 0.022), 0.01),
        C((s * 0.1, 0.4, 0.016), (s * 0.099, 0.2, 0.012), 0.006),
        E((s * 0.097, 0.093, -0.002), 0.019, 0.016, 0.017),
        B((s * 0.083, 0.072, 0.0), 0.0105),
        B((s * 0.133, 0.428, -0.014), 0.0095),
        C((s * 0.133, 0.428, -0.014), (s * 0.128, 0.09, -0.009), 0.0052),
        B((s * 0.127, 0.073, -0.007), 0.0098),
    ]
    m.piece(shin, f"calf_{side}", resolution=0.0042, faces=560, shape=chips())
    tarsals = [
        E((s * 0.1, 0.058, 0.004), 0.02, 0.014, 0.024),
        E((s * 0.103, 0.03, -0.036), 0.017, 0.022, 0.034, BONE, Quaternion((1, 0, 0), math.radians(-25))),
        B((s * 0.088, 0.048, 0.038), 0.0125),
        B((s * 0.118, 0.036, 0.034), 0.0115),
        B((s * 0.078, 0.042, 0.056), 0.009),
        B((s * 0.094, 0.04, 0.058), 0.0085),
        B((s * 0.108, 0.036, 0.057), 0.0085),
    ]
    m.piece(tarsals, f"foot_{side}", resolution=0.0035, faces=420, shape=chips())
    for i, (o, length, r) in enumerate(((-0.028, 0.034, 0.0075), (-0.01, 0.03, 0.0052), (0.004, 0.027, 0.005), (0.017, 0.024, 0.0048), (0.03, 0.02, 0.0045))):
        x0 = s * (0.1 + o * 0.6)
        x1 = s * (0.1 + o * 1.05)
        head = at(x1, 0.017, 0.112 - 0.0035 * i * i)
        m.sweep([at(x0, 0.04, 0.062), (at(x0, 0.04, 0.062) + head) / 2 + Vector((0, 0, 0.006)), head], [r * 0.95, r * 0.65, r * 1.05], BONE, f"foot_{side}", segments=5, tip=False)
        tip = head + Vector((s * o * 0.1, -length, -0.008))
        m.sweep([head, (head + tip) / 2 + Vector((0, 0, 0.003)), tip], [r * 0.8, r * 0.6, r * 0.7], BONE, f"ball_{side}", segments=5)

# ── Gear: a rusted, broken half of a breastplate over the right of the chest on a rotten strap over the
# left shoulder; a rag of a loincloth on a cord round the hips; a rusty notched shortsword. ──
cols = []
for i in range(15):
    phi = math.radians(-6 - 72 * i / 14)
    top = 1.4 - 0.025 * (i / 14) ** 2 + (0.012 if i == 0 else 0)
    # The bottom edge broken off on a slant, jagged.
    bottom = 1.205 + 0.07 * (i / 14) + (0.018 if i % 3 == 1 else -0.004) + random.uniform(-0.008, 0.008)
    col = []
    for j in range(9):
        y = top + (bottom - top) * j / 8
        bulge = 0.012 * math.sin(math.pi * j / 8)
        a, bb = 0.152 + bulge, 0.112 + bulge
        dent = -0.012 * max(0.0, 1 - math.hypot(i - 5, j - 5) / 2.5)
        col.append(at(a * math.sin(phi), y, -0.006 + (bb + dent) * math.cos(phi)))
    cols.append(col)
m.sheet(cols, RUST, "spine_03", thick=0.007)
for k in range(5):
    phi = math.radians(-12 - 58 * k / 4)
    m.sphere(at(0.157 * math.sin(phi), 1.392 - 0.02 * (k / 4) ** 2, -0.006 + 0.117 * math.cos(phi)), (0.0045,) * 3, IRON, "spine_03", segments=5, rings=3)
strap = [at(0.0, 1.396, 0.112), at(0.06, 1.416, 0.082), at(0.118, 1.421, 0.032), at(0.13, 1.416, -0.03), at(0.11, 1.37, -0.104), at(0.0, 1.29, -0.124), at(-0.12, 1.21, -0.092), at(-0.16, 1.215, -0.01)]
m.sweep(strap, (0.012, 0.012), LEATHER, "spine_03", segments=4, flat=0.25, up=[(q - Vector((0, 0, 1.25))).normalized() for q in strap], tip=False)
# The cord and the rag.
belt = []
for k in range(17):
    phi = 2 * math.pi * k / 16
    belt.append(at(0.13 * math.sin(phi), 0.975 - 0.018 * math.cos(phi), -0.01 + 0.085 * math.cos(phi)))
m.sweep(belt, (0.005, 0.005), LEATHER, "pelvis", segments=4, tip=False)


def rag(phi0, phi1, n, length, seed):
    rnd = random.Random(seed)
    columns = []
    for i in range(n):
        phi = phi0 + (phi1 - phi0) * i / (n - 1)
        top = at(0.135 * math.sin(phi), 0.972 - 0.018 * math.cos(phi), -0.01 + 0.092 * math.cos(phi))
        out = at(math.sin(phi), 0, math.cos(phi)).normalized()
        L = length * (0.45 + 0.55 * rnd.random()) * (0.6 if i in (0, n - 1) else 1.0)
        col = []
        for j in range(6):
            w = j / 5
            col.append(top + Vector((0, 0, -L * w)) + out * (0.012 * w + 0.008 * math.sin(i * 1.9 + j)))
        columns.append(col)
    m.sheet(columns, CLOTH, "pelvis", thick=0.004)


rag(math.radians(-38), math.radians(34), 13, 0.26, 1)
rag(math.radians(150), math.radians(215), 11, 0.3, 2)
rag(math.radians(70), math.radians(100), 6, 0.2, 3)

# The rotten remnant of a cloak, hanging from the shoulders down the back in tatters.
rnd = random.Random(5)
cloak = []
for i in range(13):
    u = i / 12
    x = 0.145 - 0.24 * u  # (torn off short of the right shoulder)
    edge = abs(x) / 0.145
    length = (0.5 - 0.3 * u * u) * (0.35 + 0.65 * rnd.random()) * (0.55 if i % 3 == 2 else 1.0)
    col = []
    for j in range(9):
        w = j / 8
        y = 1.41 - 0.04 * edge**2 - length * w
        back = -0.098 - 0.025 * edge**2 * (1 - w) - 0.03 * w - 0.012 * math.sin(i * 1.3 + w * 3)
        col.append(at(x * (1 - 0.1 * w), y, back + 0.035 * edge * (1 - w)))
    cloak.append(col)
m.sheet(cloak, CLOAK, "spine_03", thick=0.004)


def shortsword():
    """A short blade, rusted and notched, diamond in section, as a hard part with the grip at the origin
    running forward (-Y)."""
    stations = 15
    verts, faces = [], []
    blade = 0.46
    for i in range(stations):
        u = i / (stations - 1)
        y = -(0.085 + blade * u)
        half = 0.022 * (1 - u**3) + 0.0015
        notch_l = 0.01 if i in (4, 9) else 0.0
        notch_r = 0.008 if i in (6, 11) else 0.0
        t = 0.0045 * (1 - 0.6 * u)
        verts += [Vector((half - notch_l, y, 0)), Vector((0, y, t)), Vector((-(half - notch_r), y, 0)), Vector((0, y, -t))]
    for i in range(stations - 1):
        for k in range(4):
            a, b = i * 4 + k, i * 4 + (k + 1) % 4
            faces.append([a, b, b + 4, a + 4])
    tip = len(verts)
    verts.append(Vector((0, -(0.085 + blade + 0.035), 0)))
    for k in range(4):
        faces.append([(stations - 1) * 4 + k, (stations - 1) * 4 + (k + 1) % 4, tip])
    faces.append([3, 2, 1, 0])
    m._add(verts, faces, [RUST] * len(faces), "hand_r", smooth=False)


sword = [
    (m.tube, (Vector((0, 0.05, 0)), Vector((0, -0.07, 0)), 0.014, 0.015, GRIP, "hand_r", 6)),
    (m.sphere, (Vector((0, 0.06, 0)), (0.019, 0.017, 0.019), RUST_DARK, "hand_r", 6, 4)),
    (m.box, (Vector((0, -0.078, 0)), (0.12, 0.018, 0.022), RUST_DARK, "hand_r")),
    (shortsword, ()),
]
m.weapon(sword, at(-(sx + p["arm"] + 0.055), arm_y - 0.022, 0), tilt=-0.5)

m.finish(humanoid_actions(arm_down=72), bake={"size": 512, "ao": 0.08, "mottle": 0.14, "mottle_scale": 60, "dirt": 0.25})
