"""Bugbear (SRD: Medium humanoid): a huge, hairy goblinoid, about two metres tall, hunched and long-armed,
in coarse brown-orange fur; a goblin's broad skull with a bear's short muzzle, a broad flat nose, small mean
eyes under a heavy brow, pointed ears and fangs jutting from the lower jaw; a shaggy mane over the head,
shoulders and back, a studded hide girdle laced up the front, a hide pauldron, iron-banded bracers, a hide
kilt and a morningstar. Writes assets/models/bugbear.glb. Run (BLENDER: your Blender executable):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_bugbear.py
"""

import math
import os
import random
import sys

import bpy
from mathutils import Matrix

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wwblend import STIFF, THRESHOLD, Model, Vector, at, humanoid_actions, humanoid_body, humanoid_joints, shade  # noqa: E402

bpy.ops.wm.read_factory_settings(use_empty=True)

FUR = 0x96592C
DARK = 0x5A361C
DEEP = 0x6E4424
PALE = 0xA87448
NOSE = 0x1E1410
LIPS = 0x3A2418
INNER = 0x6E4636
HIDE = 0x6E5236
LEATHER = 0x5A4230
STRAP = 0x3A2A1C
METAL = 0x5E5C58
TEETH = 0xDCCFAA
p = {
    "leg": 1.0,
    "torso": 0.72,
    "neck": 0.06,
    "shoulders": 0.56,
    "hips": 0.27,
    "arm": 0.86,
    "thick": 1.5,
    "chest": (0.3, 0.23),
    "waist": (0.25, 0.2),
    "belly": 0.19,
    "hunch": 0.24,
    "hand": 1.4,
    "foot": 1.3,
    "claws": True,
}
m = Model("bugbear", resolution=0.015, faces=3900)
m.group("head", resolution=0.008, faces=2750, bone="Head")
m.rig(humanoid_joints(p))
b = humanoid_body(m, p, {"skin": FUR, "shirt": HIDE, "nails": 0x241A12})
s, arm_y, sx, hx, chest_y, knee = b["s"], b["arm_y"], b["sx"], b["hx"], b["chest_y"], b["knee"]
hips = p["leg"]
(chest_x, chest_z), (waist_x, waist_z) = p["chest"], p["waist"]
hunch = p["hunch"]
elbow, wrist = p["arm"] * 0.52, p["arm"]
hy = b["head_y"] + 0.12
hz = hunch + 0.04
K = 1.24  # the head's measures below are for a head this much smaller
PITCH = math.radians(12)  # the face tipped down a little, glowering
rng = random.Random(6)
SIDES = (("l", 1), ("r", -1))


def ell(c, across, up, depth, colour=FUR, negative=False, group="body"):
    m.ellipsoid(at(*c), (across, depth, up), colour, negative, group=group)


def ball(c, r, colour=FUR, negative=False, group="body"):
    m.ball(at(*c), r, colour, negative, group=group)


def cap(a, c, r, colour=FUR, negative=False, group="body"):
    m.capsule(at(*a), at(*c), r, colour, negative, group=group)


def hd(x, up, fwd):
    """A point on the head, from its centre (scaled by K, the face tipped down by PITCH)."""
    up, fwd = up * math.cos(PITCH) - fwd * math.sin(PITCH), fwd * math.cos(PITCH) + up * math.sin(PITCH)
    return (x * K, hy + up * K, hz + fwd * K)


def hell(c, across, up, depth, colour=FUR, negative=False):
    ell(hd(*c), across * K, up * K, depth * K, colour, negative, group="head")


def hball(c, r, colour=FUR, negative=False):
    ball(hd(*c), r * K, colour, negative, group="head")


def hcap(a, c, r, colour=FUR, negative=False):
    cap(hd(*a), hd(*c), r * K, colour, negative, group="head")


# ── Finding the skin, so fur and straps sit on it ──


def field(q, group):
    """The metaballs' field at q (Blender coordinates): the skin is where it falls to THRESHOLD."""
    total = 0.0
    for e in m.elements:
        if e[4] == group:
            f = m._field(q, e)
            total += -STIFF * f if e[3] else STIFF * f
    return total


def surface(origin, toward, group="body"):
    """Where a ray from `origin` (game coordinates, inside the skin) towards `toward` comes out through the
    skin: the point and the skin's outward normal there, in Blender's coordinates."""
    o = at(*origin)
    d = (at(*toward) - o).normalized()
    r, step = 0.0, 0.01
    while field(o + d * (r + step), group) > THRESHOLD:
        r += step
        if r > 0.8:
            return None, None  # (it never came out: the ray ran down a limb)
    lo, hi = r, r + step
    for _ in range(6):
        mid = (lo + hi) / 2
        if field(o + d * mid, group) > THRESHOLD:
            lo = mid
        else:
            hi = mid
    q = o + d * lo
    e = 0.004
    grad = Vector([field(q + Vector(v) * e, group) - field(q - Vector(v) * e, group) for v in ((1, 0, 0), (0, 1, 0), (0, 0, 1))])
    normal = -grad if grad.length > 1e-9 else d
    return q, normal.normalized()


def lock(root, normal, lie, length, width, colour, bone, lift=1.0):
    """A lock of coarse fur (Blender coordinates): rooted under the skin at `root`, rising a little off it
    and lying along `lie`, flat, tapering to a point that bends back towards the skin."""
    n = normal.normalized()
    lie = Vector(lie)
    along = lie - n * lie.dot(n)
    if along.length < 1e-4:
        along = n.orthogonal()
    along.normalize()
    side = n.cross(along)
    th = width * 0.35
    verts, faces = [], []
    for u, h, w in ((-0.08, -0.05, 1.0), (0.42, 0.08 * lift, 0.8)):
        c = root + along * (length * u) + n * (length * h)
        verts += [c + side * width * w - n * th * 0.3, c + n * th * w, c - side * width * w - n * th * 0.3]
    verts.append(root + along * length + n * length * 0.05 * lift)
    faces.append([2, 1, 0])
    for j in range(3):
        a, c = j, (j + 1) % 3
        faces.append([a, c, c + 3, a + 3])
    for j in range(3):
        faces.append([3 + j, 3 + (j + 1) % 3, 6])
    m.parts.append((verts, faces, colour, bone, True))


def fur(origin, toward, lie, length, width, colours, bone, n=3, group="body", lift=1.0):
    """A clump of `n` locks fanned out where the ray from `origin` towards `toward` meets the skin, lying
    along `lie` (Blender's coordinates), the middle one longest: a jagged tuft."""
    q, normal = surface(origin, toward, group)
    if q is None:
        return
    lie = Vector(lie).normalized()
    side = normal.cross(lie)
    if side.length < 1e-4:
        side = normal.orthogonal()
    side.normalize()
    colour = rng.choice(colours)
    for i in range(n):
        spread = i - (n - 1) / 2
        jitter = Vector((rng.uniform(-0.12, 0.12), rng.uniform(-0.12, 0.12), rng.uniform(-0.12, 0.12)))
        root = q + side * spread * width * 1.2 - normal * width * 0.3
        reach = length * (1 - 0.22 * abs(spread)) * rng.uniform(0.85, 1.1)
        lock(root, normal, lie + side * spread * 0.35 + jitter, reach, width * rng.uniform(0.85, 1.1), colour, bone, lift)


def strap(points, origin_of, bone_of, width=0.04, thick=0.012, colour=STRAP, closed=False):
    """A flat strap lying on the skin through `points` (game coordinates): each is moved out to the skin
    along the ray from `origin_of(point)`, then the strap is laid in boxes from one to the next."""
    on = []
    for q in points:
        hit, normal = surface(origin_of(q), q)
        on.append((hit + normal * (thick * 0.5 + 0.004), normal))
    if closed:
        on.append(on[0])
    for (a, na), (c, nc) in zip(on, on[1:]):
        mid = (a + c) / 2
        y = (c - a).normalized()
        out = (na + nc).normalized()
        z = (out - y * out.dot(y)).normalized()
        x = y.cross(z)
        rot = Matrix((x, y, z)).transposed().to_quaternion()
        m.box(mid, (width, (c - a).length * 1.08, thick), colour, bone_of(mid), rot)
    return on


def stud(origin, toward, r, colour, bone):
    hit, normal = surface(origin, toward)
    m.sphere(hit + normal * r * 0.3, (r,) * 3, colour, bone, segments=5, rings=3)


# ── The head: a goblin's broad skull and heavy, jutting jaw with a bear's short, deep muzzle; a broad flat
# nose, a heavy brow knotted over small deep-set eyes, wide cheeks, pointed ears out to the sides and fangs
# jutting up from the lower jaw. ──
hell((0, 0.035, -0.04), 0.112, 0.095, 0.11)
hell((0, -0.015, 0.025), 0.118, 0.075, 0.1)
hell((0, -0.072, 0.04), 0.102, 0.046, 0.09)
for sign in (1, -1):
    hball((sign * 0.078, -0.04, 0.05), 0.048)
    hball((sign * 0.068, 0.002, 0.08), 0.03)
    # Deep eye sockets, the brow knotted down over them, heavy lower lids.
    hball((sign * 0.045, 0.01, 0.122), 0.018, DARK, negative=True)
    hball((sign * 0.026, 0.025, 0.122), 0.021, shade(FUR, 0.92))
    hell((sign * 0.05, -0.008, 0.113), 0.025, 0.011, 0.015, shade(FUR, 1.05))
    hcap((sign * 0.028, 0.015, 0.123), (sign * 0.064, 0.026, 0.11), 0.0085, shade(FUR, 0.9))
    # A bear's lip pads either side of the nose, nostrils flared.
    hball((sign * 0.03, -0.05, 0.138), 0.024, PALE)
    hball((sign * 0.017, -0.024, 0.169), 0.0075, NOSE, negative=True)
hell((0, 0.04, 0.1), 0.104, 0.026, 0.036, shade(FUR, 0.92))
hell((0, -0.04, 0.1), 0.074, 0.048, 0.058, PALE)
hcap((0, 0.02, 0.1), (0, -0.008, 0.138), 0.03, PALE)
hell((0, -0.014, 0.15), 0.05, 0.024, 0.022, NOSE)
# The mouth, a dark line round the front of the muzzle; the jutting lower jaw and chin beneath.
hcap((0, -0.074, 0.142), (0.058, -0.076, 0.108), 0.007, LIPS, negative=True)
hcap((0, -0.074, 0.142), (-0.058, -0.076, 0.108), 0.007, LIPS, negative=True)
hell((0, -0.094, 0.11), 0.07, 0.026, 0.05, PALE)
# Shaggy hair: a mop on the crown falling down the back of the head, locks over the brow, thick ruffs
# flaring out from the cheeks and jaw.
for x, up, fwd, r in ((0, 0.1, -0.02, 0.06), (0.05, 0.095, -0.06, 0.055), (-0.05, 0.098, -0.055, 0.055), (0, 0.075, -0.1, 0.06), (0.07, 0.04, -0.09, 0.05), (-0.07, 0.045, -0.088, 0.05), (0, 0.0, -0.12, 0.062), (0.06, -0.03, -0.1, 0.05), (-0.06, -0.035, -0.1, 0.05)):
    hball((x, up, fwd), r, DEEP if (x * 100 + up * 100) % 2 < 1 else shade(DEEP, 0.9))
for x in (-0.045, -0.012, 0.024, 0.052):
    hball((x, 0.098 - abs(x) * 0.2, 0.05 - abs(x) * 0.4), 0.027, DEEP)
for sign in (1, -1):
    hball((sign * 0.106, -0.045, 0.015), 0.046, DEEP)
    hball((sign * 0.088, -0.095, 0.035), 0.04, DEEP)

for sign in (1, -1):
    # Small, yellow, mean eyes.
    eye = at(*hd(sign * 0.045, 0.01, 0.112))
    m.sphere(eye, (0.012 * K, 0.009 * K, 0.0095 * K), 0xD89A2A, "Head", segments=10, rings=8)
    m.sphere(eye + Vector((0, -0.0095 * K, 0)), (0.0045 * K, 0.002 * K, 0.006 * K), 0x140A06, "Head", segments=8, rings=6)
    # Pointed ears standing out to the sides and up, swept back, dark inside, tufted at the tips.
    base, tip = at(*hd(sign * 0.104, 0.035, -0.035)), at(*hd(sign * 0.215, 0.085, -0.075))
    facing = Vector((sign * 0.2, -1, 0.45)).normalized()
    m.leaf(base, tip, 0.085 * K, 0.016 * K, FUR, "Head", facing, bend=(0, 0.012, 0.01), notch=0.55 if sign < 0 else None, steps=8, cup=0.36, inner=INNER)
    lock(tip - Vector((sign * 0.02, 0, 0)), Vector((0, 0.3, 1)), Vector((sign, 0.4, 0.3)), 0.05, 0.012, DARK, "Head")
    # Fangs jutting up from the lower jaw past the lip, smaller ones down from the upper.
    root = at(*hd(sign * 0.04, -0.084, 0.13))
    m.cone(root, root + Vector((sign * 0.005, -0.008, 0.042 * K)), 0.012 * K, TEETH, "Head", segments=6)
    root = at(*hd(sign * 0.025, -0.066, 0.14))
    m.cone(root, root + Vector((0, -0.003, -0.02 * K)), 0.006 * K, TEETH, "Head", segments=5)

# Locks over the hair, falling back and down; over the ruffs, flaring out and down.
centre = hd(0, 0.0, -0.01)
HAIR = (DEEP, shade(DEEP, 0.85), shade(DARK, 1.1))
for row, el in enumerate((1.25, 0.85, 0.45, 0.05, -0.4)):
    count = 4 + row * 2
    for i in range(count):
        az = math.pi + (-1.25 + 2.5 * i / (count - 1)) * (0.6 + 0.12 * row)
        toward = (centre[0] + math.sin(az) * math.cos(el), centre[1] + math.sin(el), centre[2] + math.cos(az) * math.cos(el))
        fur(centre, toward, (math.sin(az) * 0.3, 1, -0.7 - row * 0.2), 0.12, 0.014, HAIR, "Head", n=2 + row % 2, group="head", lift=3.0 - row * 0.5)
for sign in (1, -1):
    for i in range(5):
        el = 0.35 - i * 0.28
        az = sign * (1.15 + 0.14 * i)
        toward = (centre[0] + math.sin(az) * math.cos(el), centre[1] - 0.05 + math.sin(el), centre[2] + math.cos(az) * math.cos(el))
        fur(centre, toward, (sign * 0.8, 0.3, -1), 0.1, 0.013, (DEEP, shade(DEEP, 0.9)), "Head", group="head")
    for x in (0.015, 0.05):
        fur(centre, hd(sign * x, 0.2, 0.12 - x), (sign * 0.3, -1, -0.5), 0.09, 0.013, HAIR, "Head", group="head")
fur(centre, hd(0, -0.2, 0.12), (0, -0.4, -1), 0.07, 0.012, (DEEP,), "Head", group="head")

# ── The body: a thick neck sunk into heavy, sloping shoulders, a hunched back, a broad chest and back, a
# gut, long muscled arms, thick legs. The upper body is furred; a hide girdle wraps the belly. ──
ell((0, arm_y + 0.03, hunch * 0.5), 0.13, 0.09, 0.11)
ell((0, arm_y - 0.07, -0.08 + hunch * 0.2), 0.22, 0.17, 0.11)
# A barrel chest over a heavy gut, the back broad all the way down.
ell((0, chest_y + 0.1, hunch * 0.2 + 0.02), chest_x * 0.95, 0.2, chest_z * 1.02)
ell((0, hips + 0.18, waist_z * 0.4), waist_x * 1.02, 0.17, waist_z * 1.1)
for sign in (1, -1):
    # Lats flaring from under the arms down into the waist, and thick flanks over the hips.
    ell((sign * 0.17, chest_y + 0.05, hunch * 0.12 - 0.05), 0.11, 0.2, 0.13)
    ell((sign * waist_x * 0.75, hips + 0.1, 0.0), 0.11, 0.12, 0.13)
    ell((sign * 0.11, arm_y + 0.03, hunch * 0.25 - 0.03), 0.12, 0.075, 0.1)
    ell((sign * 0.1, chest_y + 0.16, hunch * 0.2 + chest_z * 0.7), 0.12, 0.08, 0.075)
    ell((sign * 0.17, chest_y + 0.17, hunch * 0.1 - 0.02), 0.1, 0.1, 0.13)
    ell((sign * (sx + 0.02), arm_y + 0.012, 0.0), 0.105, 0.095, 0.1)
    ell((sign * (sx + elbow * 0.5), arm_y + 0.01, 0.014), elbow * 0.34, 0.072, 0.072)
    ell((sign * (sx + elbow + 0.1), arm_y + 0.004, 0.0), 0.12, 0.074, 0.074)
    ell((sign * (hx + 0.014), (hips + knee) / 2, 0.018), 0.105, 0.18, 0.105)
    ball((sign * hx, knee, 0.05), 0.052)
    ell((sign * hx, knee - 0.11, -0.04), 0.075, 0.12, 0.075)
# A thick ruff of fur round the neck and over the shoulders and upper back, under the mane's locks.
for i in range(9):
    az = math.pi * (0.3 + 1.4 * i / 8)
    ball((math.sin(az) * sx * 0.72, arm_y + 0.05, hunch * 0.3 - 0.02 + math.cos(az) * chest_z * 0.8), 0.1, DEEP if i % 2 else FUR)
for i in range(6):
    az = math.pi * (0.5 + 1.0 * i / 5)
    ball((math.sin(az) * sx * 0.45, arm_y + 0.12, hunch * 0.35 + math.cos(az) * chest_z * 0.55), 0.085, DEEP)

# ── The shaggy fur: jagged tufts thick over the shoulders and down the back, along the outsides of the
# arms and thighs, round the elbows and over the tops of the shin wraps. ──
FURS = (FUR, shade(FUR, 0.9), shade(FUR, 0.82))
MANE = (DEEP, shade(DEEP, 0.85), shade(FUR, 0.8))
axis = (0, arm_y, hunch * 0.2)
for row, el in enumerate((1.1, 0.75, 0.4, 0.05, -0.3)):
    count = 9 + row * 2
    for i in range(count):
        if row < 2:
            az = 2 * math.pi * (i + 0.5 * row) / (count + 3)
        else:
            az = math.pi * (0.22 + 1.56 * (i + 0.5 * (row % 2)) / count)
        q = (math.sin(az) * math.cos(el) * 0.6, arm_y + 0.05 + math.sin(el) * 0.3, hunch * 0.2 + math.cos(az) * math.cos(el) * 0.4)
        out = abs(q[0]) > sx * 0.7
        origin = (math.copysign(sx, q[0]), arm_y, 0) if out else axis
        bone = ("upperarm_l" if q[0] > 0 else "upperarm_r") if out else "spine_03"
        fur(origin, q, (0, 0.5, -1), 0.17, 0.02, MANE, bone, lift=1.5)
# A collar of fur over the front of the shoulders, round under the jaw.
for row in range(2):
    for i in range(7):
        az = -1.1 + (i + 0.5 * row) * 0.34
        q = (math.sin(az), arm_y + 0.22 - row * 0.12, hunch * 0.2 + math.cos(az))
        fur((0, arm_y - 0.04, hunch * 0.2), q, (0, -0.2, -1), 0.15, 0.019, MANE, "spine_03", lift=1.5)
for k in range(5):
    y = arm_y - 0.22 - k * 0.09
    for x in (-0.15, -0.05, 0.05, 0.15) if k < 3 else (-0.1, 0.1):
        fur((0, y, 0.05), (x, y, -1), (0, 0.2, -1), 0.17, 0.019, MANE, "spine_03" if k < 2 else "spine_02")
for k in range(2):
    y = arm_y - 0.05 - k * 0.1
    for a in (-0.8, -0.4, 0.0, 0.4, 0.8) if k == 0 else (-0.6, -0.2, 0.2, 0.6):
        fur((0, y, 0.0), (math.sin(a), y, math.cos(a)), (0, -0.25, -1), 0.12, 0.013, FURS, "spine_03")
for side, sign in SIDES:
    # Along the arms, lying towards the hands (the arms are laid out straight to the sides here).
    for k in range(4):
        x = sx + 0.08 + k * 0.09
        for a in (0.9, 1.9, 2.8) if k % 2 == 0 else (1.4, 2.4):
            q = (sign * x, arm_y + math.sin(a), math.cos(a))
            fur((sign * x, arm_y, 0), q, (sign, 0, 0), 0.13, 0.014, FURS, f"upperarm_{side}")
    for a in (1.6, 2.5, -2.6):
        x = sx + elbow + 0.04
        q = (sign * x, arm_y + math.sin(a), math.cos(a))
        fur((sign * x, arm_y, 0), q, (sign, 0, -0.3), 0.11, 0.013, FURS, f"lowerarm_{side}")
    # The outsides of the thighs under the kilt.
    for k in range(2):
        y = hips - 0.17 - k * 0.12
        for a in (0.9, 1.6, 2.3) if k == 0 else (1.25, 1.95):
            q = (sign * hx + sign * math.sin(a), y, math.cos(a))
            fur((sign * hx, y, 0), q, (0, 0, -1), 0.13, 0.015, FURS, f"thigh_{side}")
    # A fringe over the tops of the shin wraps.
    for a in (0.0, 1.0, 2.0, 3.0, -1.0, -2.0):
        y = 0.44
        q = (sign * hx + math.sin(a), y, math.cos(a))
        fur((sign * hx, y, 0), q, (0, 0, -1), 0.1, 0.014, FURS, f"calf_{side}", n=2)

# ── Gear: a hide girdle round the belly with a hemmed top, laced up the front and studded with iron; a
# wide belt with an iron buckle; a hide pauldron on the left shoulder; iron-banded bracers; a hide kilt;
# leather wraps round the shins. ──
girdle_top = chest_y + 0.07
ring = [(math.sin(a) * 0.5, girdle_top, math.cos(a) * 0.5) for a in (2 * math.pi * i / 16 for i in range(16))]
strap(ring, lambda q: (0, girdle_top, 0.02), lambda q: "spine_02", width=0.05, thick=0.016, colour=LEATHER, closed=True)
for i in range(4):
    y0, y1 = girdle_top - 0.04 - i * 0.07, girdle_top - 0.11 - i * 0.07
    for sign in (1, -1):
        strap([(sign * 0.035, y0, 1), (-sign * 0.035, y1, 1)], lambda q: (0, q[1], 0.0), lambda q: "spine_02", width=0.016, thick=0.01)
for i in range(10):
    a = math.pi * (-0.8 + 1.6 * i / 9)
    if abs(a) < 0.35:
        continue
    for row in range(2):
        y = girdle_top - 0.06 - row * 0.14
        stud((0, y, 0.0), (math.sin(a), y, math.cos(a)), 0.012, METAL, "spine_02")
belt_y = hips + 0.06
belt_centre = (0, belt_y, 0.03)
belt = [(math.sin(a), belt_y, 0.03 + math.cos(a)) for a in (2 * math.pi * i / 18 for i in range(18))]
on = strap(belt, lambda q: belt_centre, lambda q: "pelvis", width=0.065, thick=0.022, colour=STRAP, closed=True)


def on_belt(a, out=0.0):
    """The point on the belt `a` round from the front (towards +x), moved `out` off it, and its outward
    way (Blender coordinates)."""
    hit, n = surface(belt_centre, (math.sin(a), belt_y, 0.03 + math.cos(a)))
    return hit + n * (0.026 + out), n


buckle, n = on_belt(0, 0.006)
m.box(buckle, (0.075, 0.016, 0.065), METAL, "pelvis")
m.box(buckle + n * 0.008, (0.045, 0.016, 0.035), STRAP, "pelvis")
# The kilt: a broad flap of hide front and back, and strips round the sides, hanging from the belt.
for a, colour, length in ((0.0, HIDE, 0.42), (math.pi, shade(HIDE, 0.85), 0.39)):
    top, n = on_belt(a, -0.016)
    m.leaf(top, top + n * 0.03 + Vector((0, 0, -length)), 0.24, 0.012, colour, "pelvis", n, steps=8)
for sign in (1, -1):
    for j, off in enumerate((0.55, 1.0)):
        a = sign * (math.pi / 2 * off + 0.1)
        top, n = on_belt(a, -0.018 + 0.006 * j)
        m.leaf(top, top + n * 0.02 + Vector((0, 0, -0.32 + j * 0.04)), 0.17, 0.01, shade(LEATHER, 1.0 + 0.15 * j), "pelvis", n, steps=6)
pouch, n = on_belt(-0.9, 0.035)
m.box(pouch + Vector((0, 0, -0.06)), (0.07, 0.06, 0.08), LEATHER, "pelvis")

# A hide pauldron on the left shoulder, an iron plate and spikes on it.
pad = at(sx + 0.03, arm_y + 0.1, 0.0)
m.sphere(pad, (0.13, 0.13, 0.065), HIDE, "upperarm_l", segments=12, rings=6)
m.sphere(pad + Vector((0.015, 0, 0.045)), (0.085, 0.085, 0.03), METAL, "upperarm_l", segments=10, rings=5)
for dx, dy in ((0.0, -0.03), (0.04, 0.02), (-0.03, 0.03)):
    base = pad + Vector((0.015 + dx, dy, 0.065))
    m.cone(base, base + Vector((dx * 0.4, dy * 0.4, 0.05)), 0.014, METAL, "upperarm_l", segments=5)

for side, sign in SIDES:
    m.tube(at(sign * (sx + elbow + 0.13), arm_y, 0), at(sign * (sx + wrist - 0.015), arm_y, 0), 0.082, 0.066, LEATHER, f"lowerarm_{side}", segments=12)
    for u in (0.2, 0.75):
        x = sx + elbow + 0.13 + (wrist - elbow - 0.145) * u
        m.ring(at(sign * x, arm_y, 0), 0.079 - u * 0.013, 0.008, METAL, f"lowerarm_{side}", axis=(1, 0, 0), segments=10)
    for k in range(3):
        m.ring(at(sign * hx, 0.15 + k * 0.09, 0.004), 0.066, 0.02, shade(0x6A5A40, 1 - 0.08 * (k % 2)), f"calf_{side}", segments=10)

# ── The morningstar: a wrapped haft, an iron collar and a spiked ball. ──
k = s * 1.05
end = 0.7 * k
WOOD, IRON = 0x5A3E26, 0x55585C
star = [
    (m.tube, (Vector((0, 0.1 * k, 0)), Vector((0, -(end - 0.05 * k), 0)), 0.02 * k, 0.024 * k, WOOD, "hand_r")),
    (m.tube, (Vector((0, -(end - 0.13 * k), 0)), Vector((0, -(end - 0.06 * k), 0)), 0.03 * k, 0.03 * k, IRON, "hand_r")),
    (m.sphere, (Vector((0, -end, 0)), (0.075 * k,) * 3, IRON, "hand_r", 12, 8)),
    (m.sphere, (Vector((0, 0.1 * k, 0)), (0.026 * k,) * 3, IRON, "hand_r", 8, 6)),
]
for i in range(3):
    y = 0.06 * k - i * 0.05 * k
    star.append((m.ring, (Vector((0, y, 0)), 0.022 * k, 0.005 * k, STRAP, "hand_r", (1, 1, 1), (0, 1, 0), 10)))
for dx, dy, dz in ((1, 0, 0), (-1, 0, 0), (0, 1, 0), (0, -1, 0), (0, 0, 1), (0.7, 0.7, 0.3), (-0.7, 0.7, 0.3), (0.7, -0.7, 0.3), (-0.7, -0.7, 0.3)):
    d = Vector((dx, -dz, dy)).normalized()
    centre = Vector((0, -end, 0))
    star.append((m.cone, (centre + d * 0.065 * k, centre + d * 0.135 * k, 0.017 * k, IRON, "hand_r", 5)))
m.weapon(star, at(-(sx + p["arm"] + 0.06 * b["h"]), arm_y - 0.014 * b["h"], 0), tilt=-0.8)

m.finish(humanoid_actions(arm_down=74), bake={"size": 512, "ao": 0.12, "mottle": 0.16, "mottle_scale": 45, "dirt": 0.35})
