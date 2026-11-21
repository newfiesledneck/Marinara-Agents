"""Basilisk (SRD: Medium monstrosity): a squat, heavy eight-legged reptile about three metres from snout to
tail and a metre high at the shoulder, slung low between sprawling legs. Its broad flat head has a heavy
brow over each glowing, petrifying eye, horns swept back from the skull and a wide jaw lined with
uneven teeth that show even when it's shut; spiny ridges run down its armoured back to the end of its
thick tail, between rows of bony plates, over dull green-brown scales paling to a dirty yellow belly.
Writes assets/models/basilisk.glb, on a skeleton of its own: a root, a spine of hips, three bones and a
neck, the head and jaw (a two-bone tongue on the jaw), five bones down the tail, a bone that swells its
belly with each breath, and eight legs of three bones each. Two meshes, one material: `basilisk`, and
`basilisk-eyes`, to be drawn glowing. Actions: Idle (breathing, a slow look round, a flick of the tongue),
Walk and Run (a sprawling reptile's gait, alternate legs together, the body swaying side to side) and
Attack (rearing back, then lunging into a snapping bite). Run (BLENDER: your Blender executable):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_basilisk.py
"""

import math
import os
import random
import sys

import bmesh
from mathutils import Vector, noise

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wwbeast import Beast, loft, smooth  # noqa: E402
from wwblend import at, turn  # noqa: E402
from wwcreature import surface  # noqa: E402
from wwtentacle import keys  # noqa: E402

SCALE = 0x4A4A32
OLIVE = 0x424A30
BROWN = 0x4E4430
DARK = 0x2C2C1C
BELLY = 0x766E50
BELLY_DARK = 0x5C5640
PLATE = 0x4A4838
PLATE_DARK = 0x38362A
SPINE = 0x5E5846
SPINE_TIP = 0x221F18
HORN = 0x4A4232
CLAW = 0x24201A
MOUTH = 0x4E201C
GUM = 0x6A3830
TEETH = 0xA89C78
OLD_TEETH = 0x7E7256
TONGUE = 0x5A2A30
LIP = 0x3A3A28
EYE = 0xD6E070
PUPIL = 0x101008
SKIN = (SCALE, OLIVE, BROWN, DARK, BELLY, BELLY_DARK)

rng = random.Random(3)
m = Beast("basilisk", resolution=0.02, faces=12500)
m.split["eyes"] = (EYE, PUPIL)
m.detail = {EYE, PUPIL, TEETH, OLD_TEETH, MOUTH, TONGUE}

# ── The skeleton ──
# The line of the back, (forward, up), from the tip of the tail to the back of the head.
CENTRE = [(-1.62, 0.12), (-1.35, 0.24), (-1.1, 0.36), (-0.85, 0.47), (-0.55, 0.58), (-0.2, 0.63), (0.1, 0.65), (0.45, 0.66), (0.75, 0.64), (0.98, 0.62)]


def centre_up(fwd):
    for (f0, u0), (f1, u1) in zip(CENTRE, CENTRE[1:]):
        if fwd <= f1:
            return u0 + (u1 - u0) * max(0.0, (fwd - f0) / (f1 - f0))
    return CENTRE[-1][1]


def spine_at(fwd, x=0.0):
    return at(x, centre_up(fwd), fwd)


SPINE_BONES = [("Hips", -0.55, -0.25), ("spine_01", -0.25, 0.08), ("spine_02", 0.08, 0.42), ("spine_03", 0.42, 0.78), ("Neck", 0.78, 0.98)]
TAIL_F = [-0.55, -0.85, -1.08, -1.28, -1.46, -1.64]
TAIL_X = [0.0, 0.0, 0.02, 0.05, 0.09, 0.14]
bones = [("Root", None, at(0, 0, 0), at(0, 0, 0.3))]
parent = "Root"
for name, f0, f1 in SPINE_BONES:
    bones.append((name, parent, spine_at(f0), spine_at(f1)))
    parent = name
HEAD_AT = spine_at(0.98)
bones += [
    ("Head", "Neck", HEAD_AT, at(0, 0.56, 1.5)),
    ("Jaw", "Head", at(0, 0.53, 1.0), at(0, 0.45, 1.46)),
    ("Tongue1", "Jaw", at(0, 0.515, 1.0), at(0, 0.515, 1.15)),
    ("Tongue2", "Tongue1", at(0, 0.515, 1.15), at(0, 0.515, 1.28)),
    ("Belly", "spine_02", at(0, 0.48, 0.35), at(0, 0.48, -0.1)),
]
TAIL = []
for i in range(5):
    name = f"tail_{i + 1:02d}"
    bones.append((name, "Hips" if i == 0 else TAIL[-1], spine_at(TAIL_F[i], TAIL_X[i]) + Vector((0, 0, -0.03)), spine_at(TAIL_F[i + 1], TAIL_X[i + 1]) + Vector((0, 0, -0.03))))
    TAIL.append(name)
# Eight legs, four a side: shoulder, elbow (out to the side and up, sprawling), ankle, toes.
LEGS = {}  # name: (side, bones, foot at rest, toes)
PAIRS = [(0.56, "spine_03", 0.26), (0.22, "spine_02", 0.08), (-0.13, "spine_01", -0.1), (-0.46, "Hips", -0.28)]
for n, (fwd, holder, splay) in enumerate(PAIRS):
    for side, sx in (("l", 1), ("r", -1)):
        name = f"leg{n + 1}{side}"
        shoulder = at(sx * 0.28, 0.47, fwd)
        elbow = at(sx * 0.7, 0.45, fwd + splay * 0.35)
        ankle = at(sx * 0.86, 0.09, fwd + splay)
        toes = ankle + at(sx * 0.07, -0.07, 0.17 if n < 2 else 0.12)
        names = [f"{name}_1", f"{name}_2", f"{name}_3"]
        bones += [(names[0], holder, shoulder, elbow), (names[1], names[0], elbow, ankle), (names[2], names[1], ankle, toes)]
        LEGS[name] = (sx, names, ankle, toes)
rig = m.rig(bones)
rig.data.bones["Root"].use_deform = False

# ── The body: long, heavy and slung low, a deep chest, a sagging belly, the shoulder over each leg humped ──
m.ellipsoid(at(0, 0.600, 0.38), (0.34, 0.4, 0.34), SCALE)
m.ellipsoid(at(0, 0.580, 0.02), (0.38, 0.42, 0.37), SCALE)
m.ellipsoid(at(0, 0.570, -0.36), (0.34, 0.38, 0.34), SCALE)
m.ellipsoid(at(0, 0.38, 0.04), (0.3, 0.62, 0.15), BELLY)
m.ellipsoid(at(0, 0.400, 0.5), (0.26, 0.28, 0.15), BELLY)
for fwd, _h, _s in PAIRS:
    for sx in (1, -1):
        m.ball(at(sx * 0.3, 0.620, fwd), 0.15, OLIVE)
# The neck: short and thick, folded underneath.
m.capsule(at(0, 0.660, 0.62), at(0, 0.620, 0.98), 0.21, SCALE)
m.ellipsoid(at(0, 0.460, 0.84), (0.16, 0.16, 0.13), BELLY)
m.ellipsoid(at(0, 0.720, 0.84), (0.14, 0.13, 0.08), DARK)
# The tail: thick at the root, tapering to a point, swinging a little to one side.
for i in range(14):
    u0, u1 = i / 14, (i + 1) / 14
    f0, f1 = -0.5 + (-1.66 + 0.5) * u0, -0.5 + (-1.66 + 0.5) * u1
    x0, x1 = 0.14 * u0**2.2, 0.14 * u1**2.2
    r = 0.27 * (1 - (u0 + u1) / 2) ** 0.85 + 0.022
    m.capsule(spine_at(f0, x0) + Vector((0, 0, -0.04)), spine_at(f1, x1) + Vector((0, 0, -0.04)), r, SCALE if i % 2 else OLIVE)
    m.capsule(spine_at(f0, x0) + Vector((0, 0, -0.04 - r * 0.35)), spine_at(f1, x1) + Vector((0, 0, -0.04 - r * 0.35)), r * 0.72, BELLY)

# The legs: heavy upper limbs thrust out sideways, knobbed elbows, scaly forearms down to broad clawed feet.
for name, (sx, names, ankle, toes) in LEGS.items():
    shoulder, elbow = m.joints[names[0]], m.joints[names[1]]
    m.capsule(shoulder, shoulder.lerp(elbow, 0.55), 0.135, SCALE)
    m.capsule(shoulder.lerp(elbow, 0.55), elbow, 0.1, OLIVE)
    m.ball(elbow + Vector((sx * 0.015, 0, 0.015)), 0.088, DARK)
    m.capsule(elbow, elbow.lerp(ankle, 0.5), 0.095, SCALE)
    m.capsule(elbow.lerp(ankle, 0.5), ankle + Vector((0, 0, 0.03)), 0.07, OLIVE)
    m.ball(shoulder.lerp(elbow, 0.4) + Vector((0, 0, -0.05)), 0.085, BELLY_DARK)
    m.ellipsoid(ankle.lerp(toes, 0.35) + Vector((0, 0, -0.04)), (0.095, 0.11, 0.05), DARK)

def scute(p, way, r, bone, colour=None):
    """A bony scute at p, facing `way`: a low six-sided boss drawn out along the body, peaked in the middle."""
    along = Vector((0, -1, 0))
    t = along - way * along.dot(way)
    t = t.normalized() if t.length > 1e-4 else way.orthogonal().normalized()
    b = way.cross(t)
    bm = bmesh.new()
    ring = [(t * math.cos(k * math.pi / 3) * 1.35 + b * math.sin(k * math.pi / 3)) * r for k in range(6)]
    low = [bm.verts.new(p - way * 0.03 + q) for q in ring]
    top = [bm.verts.new(p + way * 0.016 + q * 0.75) for q in ring]
    peak = bm.verts.new(p + way * (0.024 + r * 0.22))
    for k in range(6):
        j = (k + 1) % 6
        bm.faces.new((low[k], low[j], top[j], top[k]))
        bm.faces.new((top[k], top[j], peak))
    bm.faces.new(list(reversed(low)))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    m._add_bm(bm, colour or (PLATE if rng.random() < 0.65 else PLATE_DARK), bone, smooth=False)


# ── The head: a broad flat wedge, hard-edged, widest behind the eyes and narrowing to a blunt snout, a
# heavy brow over each eye and a straight lip; the lower jaw is its own ──
# (forward, half-width at the lip, half-width across the top, the top's height, the lip's height, the
# crown's rise)
UPPER = [
    (0.9, 0.14, 0.1, 0.69, 0.57, 0.015),
    (0.98, 0.19, 0.15, 0.725, 0.548, 0.02),
    (1.06, 0.205, 0.17, 0.745, 0.545, 0.02),
    (1.13, 0.195, 0.165, 0.742, 0.545, 0.018),
    (1.2, 0.17, 0.12, 0.7, 0.545, 0.025),
    (1.28, 0.145, 0.09, 0.665, 0.545, 0.028),
    (1.36, 0.122, 0.07, 0.64, 0.546, 0.026),
    (1.43, 0.1, 0.058, 0.624, 0.548, 0.022),
    (1.49, 0.078, 0.045, 0.61, 0.55, 0.015),
    (1.525, 0.045, 0.026, 0.592, 0.555, 0.0),
]
LOWER = [  # (forward, half-width, the lip's height, depth)
    (0.96, 0.155, 0.545, 0.1),
    (1.04, 0.185, 0.543, 0.095),
    (1.13, 0.18, 0.543, 0.08),
    (1.22, 0.155, 0.545, 0.066),
    (1.31, 0.13, 0.548, 0.056),
    (1.39, 0.108, 0.551, 0.05),
    (1.46, 0.082, 0.555, 0.044),
    (1.505, 0.045, 0.559, 0.034),
]


def width_at(table, fwd):
    for a, b in zip(table, table[1:]):
        if fwd <= b[0]:
            t = max(0.0, (fwd - a[0]) / (b[0] - a[0]))
            return a[1] + (b[1] - a[1]) * t
    return table[-1][1]


def refine(rings, colours, rough=0.011):
    """Twice as many rings and points round each, the new points bulged out a little, and the whole pitted
    with noise outward from the hull's middle: a hide, not a plastic shell."""
    rings = [r for a, b in zip(rings, rings[1:]) for r in (a, [p.lerp(q, 0.5) for p, q in zip(a, b)])] + [rings[-1]]
    out = []
    for ring in rings:
        middle = sum(ring, Vector()) / len(ring)
        pts = []
        for k, p in enumerate(ring):
            q = ring[(k + 1) % len(ring)]
            mid = p.lerp(q, 0.5)
            pts += [p, mid + (mid - middle).normalized() * 0.004]
        out.append([p + (p - middle).normalized() * rough * (noise.noise(p * 26.0) + 0.5 * abs(noise.noise(p * 9.0))) for p in pts])
    colours = [c for c in colours for _ in (0, 1)]

    def scaled(k, i, centre):
        # (Each scale-sized face of the hide its own shade, in patches.)
        c = colours[k]
        if c in (SCALE, DARK, BELLY_DARK):
            n = noise.noise(centre * 30.0) + 0.5 * noise.noise(centre * 7.0) + 0.6 * math.sin(-centre.y * 38.0)
            if n > 0.5:
                return DARK if c != BELLY_DARK else SCALE
            if n < -0.5:
                return OLIVE if c == SCALE else c
        return c

    return out, scaled


rings = []
for fwd, w, wt, ht, ly, crown in UPPER:
    side = ly + 0.45 * (ht - ly)
    pts = [(w, ly), (w * 1.03, side), (wt, ht), (wt * 0.35, ht + crown), (-wt * 0.35, ht + crown), (-wt, ht), (-w * 1.03, side), (-w, ly), (-w * 0.6, ly + 0.012), (w * 0.6, ly + 0.012)]
    rings.append([at(x, up, fwd) for x, up in pts])
loft(m, *refine(rings, [LIP, SCALE, SCALE, DARK, SCALE, SCALE, LIP, MOUTH, MOUTH, MOUTH]), "Head", cap=LIP)
rings = []
for fwd, w, ly, d in LOWER:
    pts = [(w, ly), (w * 0.98, ly - 0.35 * d), (w * 0.65, ly - d), (0, ly - 1.1 * d), (-w * 0.65, ly - d), (-w * 0.98, ly - 0.35 * d), (-w, ly), (-w * 0.7, ly - 0.015), (w * 0.7, ly - 0.015)]
    rings.append([at(x, up, fwd) for x, up in pts])
loft(m, *refine(rings, [LIP, SCALE, BELLY_DARK, BELLY_DARK, SCALE, LIP, MOUTH, MOUTH, MOUTH], 0.008), "Jaw", cap=LIP)


def fang(root, way, length, r, bone, colour=None):
    tip = root + (way + Vector((rng.uniform(-0.2, 0.2), rng.uniform(-0.2, 0.2), 0))).normalized() * length
    m.cone(root, tip, r, colour or (TEETH if rng.random() < 0.7 else OLD_TEETH), bone, segments=5)


# Teeth: the upper row hanging over the lower lip, uneven, a few big ones; the lower row inside the mouth
# but for a big fang each side jutting up outside the upper lip.
for sx in (1, -1):
    for k in range(8):
        fwd = 1.5 - 0.46 * (k + rng.uniform(-0.3, 0.3)) / 7
        big = k in (1, 4) or rng.random() < 0.15
        length = (0.075 if big else rng.uniform(0.022, 0.045)) * rng.uniform(0.85, 1.15)
        fang(at(sx * width_at(UPPER, fwd) * 0.97, 0.552, fwd), at(sx * 0.2, -1, 0.05), length, 0.016 if big else 0.011, "Head")
        fwd = 1.48 - 0.42 * (k + 0.5 + rng.uniform(-0.25, 0.25)) / 7
        if k in (2, 5):
            fang(at(sx * width_at(UPPER, fwd) * 1.04, 0.52, fwd), at(sx * 0.15, 1, 0.05), 0.075, 0.016, "Jaw")
        else:
            fang(at(sx * width_at(LOWER, fwd) * 0.88, 0.534, fwd), at(sx * 0.1, 1, 0.05), 0.04 * rng.uniform(0.8, 1.2), 0.01, "Jaw")
# The eyes: small, glowing, a slit pupil, deep under the brow.
for sx in (1, -1):
    eye = at(sx * 0.178, 0.7, 1.1)
    m.sphere(eye, (0.03, 0.032, 0.017), EYE, "Head", segments=10, rings=8)
    m.sphere(eye + at(sx * 0.024, 0.0, 0.008), (0.005, 0.009, 0.016), PUPIL, "Head", segments=6, rings=4)
    m.cone(at(sx * 0.115, 0.728, 1.19), at(sx * 0.215, 0.76, 0.98), 0.036, DARK, "Head", segments=6, flat=0.5, facing=(0, 0, 1))  # the brow, a ridge swept back
    m.sphere(at(sx * 0.03, 0.612, 1.49), (0.011, 0.009, 0.009), CLAW, "Head", segments=6, rings=4)  # a nostril
# Horns swept back from the skull, spurs back from the cheeks, spikes over the brows.
for sx in (1, -1):
    for (base, mid, tip, r) in (
        (at(sx * 0.11, 0.735, 0.99), at(sx * 0.17, 0.81, 0.85), at(sx * 0.2, 0.88, 0.64), 0.038),
        (at(sx * 0.2, 0.61, 0.99), at(sx * 0.28, 0.6, 0.88), at(sx * 0.35, 0.58, 0.76), 0.032),
    ):
        m.tube(base, mid, r, r * 0.65, HORN, "Head", segments=6)
        m.cone(mid, tip, r * 0.65, CLAW, "Head", segments=6)
# ── Spines down the back and tail, between rows of bony plates; the feet's toes and claws ──


def holder(fwd):
    """The bone that carries what's on the back at `fwd`."""
    for name, f0, f1 in SPINE_BONES:
        if f0 <= fwd < f1:
            return name
    if fwd >= SPINE_BONES[-1][2]:
        return "Neck"
    for i, name in enumerate(TAIL):
        if TAIL_F[i + 1] <= fwd:
            return name
    return TAIL[-1]


def tail_x(fwd):
    u = max(0.0, min(1.0, (-0.5 - fwd) / 1.16))
    return 0.14 * u**2.2


def on_back(fwd, angle):
    """Where the skin is at `fwd`, `angle` degrees round from the top of the back, and which way it faces."""
    axis = spine_at(fwd, tail_x(fwd)) + Vector((0, 0, -0.04))
    a = math.radians(angle)
    way = Vector((math.sin(a), 0, math.cos(a)))
    p = surface(m, axis, way)
    return p, way


def spike(fwd, angle, height, r):
    p, way = on_back(fwd, angle)
    lean = (way + Vector((0, rng.uniform(0.6, 0.95), 0))).normalized()  # (raked back)
    mid = p + lean * height * 0.6
    side = Vector((1, 0, 0)) if abs(way.x) < 0.7 else Vector((0, 1, 0))
    m.cone(p - way * 0.03, mid + lean * height * 0.4, r, SPINE, holder(fwd), segments=6, flat=0.55, facing=side)
    if rng.random() < 0.8:  # (some broken off short)
        m.cone(mid, mid + lean * height * 0.42, r * 0.42, SPINE_TIP, holder(fwd), segments=5, flat=0.6, facing=side)


def plate(fwd, angle, r):
    p, way = on_back(fwd, angle)
    scute(p, way, r, holder(fwd))


# The ridge: big spines over the shoulders, dwindling down the tail; a row of smaller ones each side.
fwd = 0.9
while fwd > -1.55:
    size = 0.06 + 0.2 * smooth(-1.6, 0.0, fwd) * (1 - 0.5 * smooth(0.55, 0.95, fwd))
    spike(fwd, rng.uniform(-6, 6), size * rng.uniform(0.6, 1.3), 0.03 + 0.08 * size)
    fwd -= 0.07 + 0.25 * size
# Plates in staggered rows down each flank, smaller low down and on the tail.
for row, angle in enumerate((22, 44, 68)):
    fwd = 0.78 - row * 0.05
    while fwd > (-1.35, -0.9, -0.5)[row]:
        r = (0.055 - 0.008 * row) * (0.5 + 0.5 * smooth(-1.4, -0.3, fwd)) * rng.uniform(0.85, 1.15)
        for sx in (1, -1):
            plate(fwd + rng.uniform(-0.015, 0.015), sx * (angle + rng.uniform(-3, 3)), r)
        fwd -= r * 2.9
# Toes: four splayed forward on each foot, each with a hooked black claw.
for name, (sx, names, ankle, toes) in LEGS.items():
    foot = names[2]
    ahead = (toes - ankle)
    ahead.z = 0
    ahead.normalize()
    side = ahead.cross(Vector((0, 0, 1)))
    for k in range(4):
        spread = (k - 1.5) * 0.4
        d = (ahead + side * spread).normalized()
        root = ankle.lerp(toes, 0.4) + side * (k - 1.5) * 0.04 + Vector((0, 0, -0.04))
        root.z = max(root.z, 0.035)
        tip = root + d * (0.1 if k in (1, 2) else 0.075)
        tip.z = 0.03
        m.tube(root, tip, 0.026, 0.02, DARK, foot, segments=6)
        m.cone(tip, tip + d * 0.05 + Vector((0, 0, -0.025)), 0.017, CLAW, foot, segments=5)

# ── The hide: scales, folds round the neck, rings down the tail, a rough scattering of lumps ──


def hide(co, normal):
    fwd = -co.y
    cells = noise.voronoi(co * 13.0)[0]
    off = normal * (0.018 * smooth(0.0, 0.45, cells[1] - cells[0]) - 0.009)  # (each scale a low dome, sunk at its edge)
    off += normal * 0.02 * noise.noise(co * 3.0 + Vector((2, 7, 1)))
    if 0.55 < fwd < 1.0:
        off += normal * 0.012 * math.sin(fwd * 55) * smooth(0.55, 0.7, fwd)
    if fwd < -0.6:
        off += normal * 0.008 * math.sin(fwd * 34)
    if abs(normal.z) < 0.6:  # (folds along the flanks and limbs)
        off += normal * 0.007 * math.sin(co.z * 45 + 3 * noise.noise(co * 2.0))
    return off


def colour(p, c):
    """Dark down the spine and in broken crossbands, mottled flanks, a dirty yellow belly."""
    if c not in SKIN:
        return c
    fwd = -p.y
    n = noise.noise(p * 4.0 + Vector((1, 3, 5)))
    n2 = noise.noise(p * 9.0)
    up_rel = p.z - centre_up(fwd)
    if c in (BELLY, BELLY_DARK):
        return BELLY_DARK if n2 > 0.2 or up_rel > -0.1 else BELLY
    if up_rel > 0.16 + 0.05 * n and abs(p.x - tail_x(fwd)) < 0.16 + 0.06 * n:
        return DARK
    if math.sin(fwd * 12 + n * 3.0) > 0.6 and up_rel > -0.18:
        return DARK
    if n > 0.35:
        return BROWN
    if n < -0.3:
        return OLIVE
    return SCALE


m.shapes["body"] = hide
m.paint = colour

# ── Actions ──
YAW_BONES = ["Hips", "spine_01", "spine_02", "spine_03"]
A_SET = {"leg1l", "leg2r", "leg3l", "leg4r"}  # (stepping together; the others half a stride later)


def pose(sway=0.0, phase=0.0, roll=0.0, bob=0.0, lunge=0.0, pitch=0.0, neck=0.0, head_yaw=0.0, head_pitch=0.0, jaw=0.0, tongue=0.0, breath=0.0, tail=0.0, feet=None, lift=None):
    """`sway` bends the trunk side to side in a wave at `phase` (0-1); `roll` rolls it, `bob` raises it and
    `lunge` moves it forward (metres); `pitch` raises its front (degrees), `neck` its neck; `head_yaw`,
    `head_pitch` and `jaw` turn the head and open the mouth; `tongue` pushes the tongue out (metres); `breath`
    swells the belly; `tail` swings the tail. `feet` {leg: forward offset} and `lift` {leg: height} place
    the feet from where they rest."""
    p = {}
    whole = {}
    for i, name in enumerate(YAW_BONES):
        yaw = sway * math.sin(2 * math.pi * (phase - i * 0.1))
        whole[name] = turn("z", yaw) @ turn("y", roll) @ turn("x", -pitch * (0.4 + 0.2 * i))
    whole["Neck"] = turn("z", -0.4 * sway * math.sin(2 * math.pi * phase) + head_yaw * 0.4) @ turn("x", -pitch - neck)
    whole["Head"] = turn("z", head_yaw) @ turn("x", -pitch - neck - head_pitch)
    whole["Jaw"] = whole["Head"] @ turn("x", jaw)
    for i, name in enumerate(TAIL):
        yaw = -1.3 * sway * math.sin(2 * math.pi * (phase - 0.35 - i * 0.09)) + tail * (0.5 + 0.3 * i)
        whole[name] = turn("z", yaw) @ turn("x", 3 * pitch * 0.1 * i)
    p.update(whole)
    p["@Hips"] = Vector((0, -lunge, bob))
    if tongue:
        p["@Tongue1"] = whole["Jaw"] @ Vector((0, -tongue, 0))
    if breath:
        p["%Belly"] = (1 + 0.05 * breath, 1, 1 + 0.06 * breath)
    heads, _w = m.place(p)
    for name, (sx, names, ankle, toes) in LEGS.items():
        forward = (feet or {}).get(name, 0.0)
        up = (lift or {}).get(name, 0.0)
        target = ankle + Vector((0, -forward, up))
        p.update(m.leg(names[0], names[1], heads[names[0]], target, at(sx, 0.55, 0)))
        p[names[2]] = turn("x", 40 * min(1.0, up / 0.12))  # (toes drooping as the foot lifts)
    return p


def gait(frames, stride, rise, sway, roll, bob, step, pitch=0.0, neck=0.0):
    keys_ = []
    for f in range(0, frames + 1, step):
        u = f / frames
        feet, lift = {}, {}
        for name in LEGS:
            v = (u + (0.0 if name in A_SET else 0.5)) % 1
            if v < 0.6:
                feet[name], lift[name] = stride * (0.5 - v / 0.6), 0.0
            else:
                w = (v - 0.6) / 0.4
                feet[name], lift[name] = stride * (-0.5 + w), rise * math.sin(w * math.pi)
        keys_.append(
            (
                1 + f,
                pose(
                    sway=sway,
                    phase=u,
                    roll=roll * math.sin(2 * math.pi * u),
                    bob=bob * math.cos(4 * math.pi * u),
                    pitch=pitch,
                    neck=neck,
                    head_yaw=0,
                    feet=feet,
                    lift=lift,
                ),
            )
        )
    return keys_


def idle_at(f):
    u = (f - 1) / 90
    look = keys([(1, 0), (20, 0), (34, 22), (52, 22), (66, 0), (91, 0)], f)
    flick = keys([(1, 0), (68, 0), (71, 0.26), (74, 0.05), (77, 0.24), (81, 0), (91, 0)], f)
    jaw = keys([(1, 0), (66, 0), (69, 7), (79, 7), (83, 0), (91, 0)], f)
    breath = math.sin(2 * math.pi * u * 2)
    return pose(breath=breath, bob=0.008 * breath, head_yaw=look, neck=-3 + breath, head_pitch=-4 - 3 * look / 22, jaw=5 + jaw, tongue=flick, tail=6 * math.sin(2 * math.pi * u))


def attack_at(f):
    T = [1, 8, 14, 17, 24, 32]

    def k(values):
        return keys(list(zip(T, values)), f)

    return pose(
        lunge=k((0, -0.12, 0.34, 0.3, 0.1, 0)),
        pitch=k((0, 9, -4, -2, 0, 0)),
        neck=k((0, 10, -8, -6, 0, 0)),
        head_pitch=k((0, 14, -10, -4, 0, 0)),
        head_yaw=k((0, 0, 0, 12, -4, 0)),
        jaw=k((0, 28, 48, 0, 0, 0)),
        bob=k((0, 0.05, -0.04, -0.03, 0, 0)),
        tail=k((0, -6, 8, 4, 0, 0)),
    )


actions = {
    "Idle": [(f, idle_at(f)) for f in range(1, 92, 3)],
    "Walk": gait(36, stride=0.34, rise=0.12, sway=7, roll=2.5, bob=0.012, step=2),
    "Run": gait(22, stride=0.55, rise=0.16, sway=11, roll=4, bob=0.025, step=1, pitch=-3, neck=4),
    "Attack": [(f, attack_at(f)) for f in (1, 3, 5, 8, 10, 12, 14, 15, 17, 19, 21, 24, 28, 32)],
}
m.finish(actions, bake={"size": 512, "ao": 0.1, "mottle": 0.15, "mottle_scale": 30, "dirt": 0.18, "head_scale": 2.0})
