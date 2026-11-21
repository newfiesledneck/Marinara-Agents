"""Fire elemental (SRD: Large elemental): a roaring blaze in the shape of a man about 3.3 metres tall. A
body of fire with a chest and shoulders, long burning arms reaching forward with clawed hands of licking
flame, a head of fire with a crown of tongues streaming up from it and dark hollows for eyes and a
mouth, all on a writhing column of flame instead of legs that narrows to the ground, where a ring of fire
licks out round it. Tongues of flame cover all of it, every one tapering and licking upwards, running
from yellow at the root through orange to red and smoky at the tip, with a white-hot core showing
between them. Its own skeleton: a column, a spine, a head, two arms, chains for the great tongues on its
head, shoulders, back and column, and lick bones the smaller tongues over its body ride on; all of them
flicker in every action. Drawn glowing (see the report). Writes assets/models/fire_elemental.glb. Run
(BLENDER: your Blender executable):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_fire_elemental.py
"""

import math
import os
import random
import sys

import bpy
from mathutils import Vector, noise

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wwblend import _segment_distance, at  # noqa: E402
from wwcreature import surface  # noqa: E402
from wwelemental import Elemental, add, keys, loop, smooth_path, tongue, turn, wave  # noqa: E402

bpy.ops.wm.read_factory_settings(use_empty=True)
rng = random.Random(5)

WHITE = 0xFFF2C0
YELLOW = 0xFFCC3C
GOLD = 0xF8A020
ORANGE = 0xEC6A10
RED = 0xC2300E
EMBER = 0x5E160A
CHAR = 0x1A0C06
FLAME = [(0.0, YELLOW), (0.22, GOLD), (0.45, ORANGE), (0.72, RED), (0.9, EMBER)]
HOT = [(0.0, WHITE), (0.2, YELLOW), (0.45, GOLD), (0.68, ORANGE), (0.88, RED)]
OUTER = [(0.0, GOLD), (0.2, ORANGE), (0.55, RED), (0.82, EMBER)]

m = Elemental("fire_elemental", resolution=0.022, faces=3200)

# ── The skeleton ──
WAIST, CHEST, NECK = 1.42, 2.15, 2.36
HEAD = (0, 2.58, 0.1)
COLUMN = [at(0, 0.02, 0.0), at(0.06, 0.4, -0.03), at(-0.05, 0.8, 0.02), at(0.03, 1.12, 0.02), at(0, WAIST, 0)]
bones = [("Root", None, at(0, 0, 0), at(0, 0.3, 0))]


def chain(prefix, parent, controls, count):
    pts = smooth_path(controls, 48)
    lengths = [0.0]
    for a, b in zip(pts, pts[1:]):
        lengths.append(lengths[-1] + (b - a).length)
    marks = [pts[min(range(len(pts)), key=lambda k: abs(lengths[k] - lengths[-1] * i / count))] for i in range(count + 1)]
    names = []
    for i in range(count):
        name = f"{prefix}_{i + 1:02d}"
        bones.append((name, names[-1] if names else parent, marks[i], marks[i + 1]))
        names.append(name)
    return names


column = chain("column", "Root", COLUMN, 4)
spine = chain("spine", "column_04", [at(0, WAIST, 0), at(0, 1.78, 0.04), at(0, CHEST, 0.03), at(0, NECK, 0.05)], 2)
hc = at(*HEAD)
bones.append(("Head", "spine_02", at(0, NECK, 0.05), hc + Vector((0, 0, 0.3))))
ARMS = {}
for side, sign in (("l", 1), ("r", -1)):
    ARMS[side] = chain(f"arm_{side}", "spine_02", [at(sign * 0.38, 2.18, 0), at(sign * 0.8, 1.92, 0.12), at(sign * 1.05, 1.64, 0.38), at(sign * 1.15, 1.5, 0.58)], 3)
BODY = column + spine + ["Head"] + ARMS["l"] + ARMS["r"]

# The great tongues: chains of three bones each. (names, controls, width)
FLAMES = []


def flame_chain(name, parent, controls, width):
    names = chain(name, parent, [Vector(c) for c in controls], 3)
    FLAMES.append((names, [Vector(c) for c in controls], width))


# The crown: tongues streaming up and back from the head, the middle ones tallest.
for k, (x, tall, lean) in enumerate(((-0.12, 0.55, -0.2), (-0.04, 0.8, -0.28), (0.05, 0.85, -0.3), (0.13, 0.6, -0.18), (0.0, 0.62, -0.45))):
    base = hc + at(x, 0.13, -0.09 - 0.08 * (k == 4))
    flame_chain(f"crown{k + 1}", "Head", [base, base + at(x * 0.6, tall * 0.35, lean * 0.2), base + at(x * 1.4 + 0.05 * (k % 2 * 2 - 1), tall * 0.7, lean * 0.6), base + at(x * 1.2, tall, lean)], 0.34)
# The shoulders and back: a great tongue rising from each shoulder and two from the upper back.
for side, sign in (("l", 1), ("r", -1)):
    base = at(sign * 0.4, 2.25, -0.04)
    flame_chain(f"shoulder_{side}", "spine_02", [base, base + at(sign * 0.12, 0.3, -0.04), base + at(sign * 0.04, 0.6, -0.16), base + at(sign * 0.16, 0.85, -0.24)], 0.38)
    base = at(sign * 0.16, 2.0, -0.2)
    flame_chain(f"back_{side}", "spine_02", [base, base + at(sign * 0.08, 0.3, -0.18), base + at(-sign * 0.04, 0.65, -0.32), base + at(sign * 0.06, 0.95, -0.36)], 0.36)
# The column: tongues winding up round it.
for k in range(3):
    a0 = k / 3 * math.tau
    pts = []
    for i in range(5):
        h = 0.12 + 0.32 * i
        a = a0 + h * 2.0
        r = 0.14 + 0.15 * h / 1.5
        pts.append(at(math.sin(a) * r, h, math.cos(a) * r))
    flame_chain(f"swirl{k + 1}", "column_01", pts, 0.34)

# Lick bones: short bones over the body that the smaller tongues ride on, so each patch of fire licks on
# its own beat. (body bone, points round it)
LICKS = []
for parent in column[1:] + spine + ARMS["l"] + ARMS["r"]:
    head = bones[[b[0] for b in bones].index(parent)][2]
    tail = bones[[b[0] for b in bones].index(parent)][3]
    mid = head.lerp(tail, 0.5)
    for k in range(2 if parent in spine else 1):
        offset = Vector((0.12 * (1 if k else -1), 0, 0)) if parent in spine else Vector()
        name = f"lick_{len(LICKS) + 1:02d}"
        bones.append((name, parent, mid + offset, mid + offset + Vector((0, 0, 0.3))))
        LICKS.append((name, parent))
rig = m.rig_own(bones)
m.weigh = lambda co: m.nearest(co, BODY, power=3.0)

# ── The core: a white-hot shape of a man in the heart of the blaze ──
for i, (a, b) in enumerate(zip(COLUMN, COLUMN[1:])):
    ra, rb = 0.06 + 0.24 * (i / 4) ** 1.1, 0.06 + 0.24 * ((i + 1) / 4) ** 1.1
    for k in range(3):
        u0, u1 = k / 3, (k + 1) / 3
        m.capsule(a.lerp(b, u0), a.lerp(b, u1), ra + (rb - ra) * (u0 + u1) / 2, YELLOW)
m.ellipsoid(at(0, WAIST + 0.1, 0.0), (0.27, 0.22, 0.22), YELLOW)
m.ellipsoid(at(0, 1.78, 0.03), (0.32, 0.24, 0.25), WHITE)
m.ellipsoid(at(0, CHEST, 0.04), (0.42, 0.25, 0.27), WHITE)
for sign in (1, -1):
    m.ball(at(sign * 0.34, 2.18, 0.0), 0.14, YELLOW)
    names = ARMS["l" if sign > 0 else "r"]
    pts = [m.joints[n] for n in names] + [m.tails[names[-1]]]
    for (a, b), r0, r1 in zip(zip(pts, pts[1:]), (0.12, 0.095, 0.075), (0.095, 0.075, 0.045)):
        for k in range(2):
            m.capsule(a.lerp(b, k / 2), a.lerp(b, (k + 1) / 2), r0 + (r1 - r0) * (k + 0.5) / 2, WHITE if k else YELLOW)
m.capsule(at(0, NECK - 0.1, 0.05), hc, 0.11, YELLOW)
m.ellipsoid(hc, (0.21, 0.23, 0.21), WHITE)
m.ellipsoid(hc + at(0, -0.11, 0.07), (0.14, 0.1, 0.14), YELLOW)
# The face: dark hollows for eyes, slanted, and a gaping mouth.
for sign in (1, -1):
    m.capsule(hc + at(sign * 0.045, 0.02, 0.19), hc + at(sign * 0.14, 0.07, 0.14), 0.055, CHAR, negative=True)
m.ellipsoid(hc + at(0, -0.11, 0.19), (0.065, 0.08, 0.07), CHAR, negative=True)


def lick(co, normal):
    """Streaks of flame running up the core, ragged."""
    return normal * (noise.noise(Vector((co.x * 5, co.y * 5, co.z * 1.3))) * 0.035 + noise.noise(co * 9) * 0.01)


def glow(q, colour):
    if colour == CHAR:
        return CHAR
    n = noise.noise(Vector((q.x * 4, q.y * 4, q.z * 1.5)))
    if colour == WHITE and n < -0.2:
        return YELLOW
    if colour == YELLOW and n > 0.3:
        return WHITE
    return colour


m.shapes["body"] = lick
m.paint = glow


# ── The tongues of fire ──


def radial(p):
    d = Vector((p.x, p.y, 0))
    return d.normalized() if d.length > 1e-3 else Vector((0, -1, 0))


def profile(u):
    # (A tongue of flame: swelling fast from its root, widest a fifth of the way, drawn to a sharp tip.)
    return (0.6 + 0.4 * math.sin(min(1.0, u / 0.2) * math.pi / 2)) * (1 - u) ** 1.15


for names, pts, width in FLAMES:
    tongue(m, pts, width, width * 0.4, radial, FLAME, names[0], steps=12, profile=profile, wobble=0.15, rng=rng, weights=lambda co, n=names: m.along(co, n))
    # A smaller fork off the side of each, its tip licking off another way.
    mid = pts[1].lerp(pts[2], 0.4)
    side = radial(mid).cross(Vector((0, 0, 1)))
    fork = [mid, mid + side * 0.09 + Vector((0, 0, 0.16)), mid + side * 0.15 + Vector((0, 0, 0.36))]
    tongue(m, fork, width * 0.55, width * 0.22, radial, OUTER, names[1], steps=8, profile=profile, wobble=0.2, rng=rng, weights=lambda co, n=names: m.along(co, n[1:]))


def lick_weights(base, length, body, lick_bone):
    """A small tongue held by its body bone at the root and more and more by its lick bone to the tip."""

    def weights(co):
        t = max(0.0, min(1.0, (co.z - base.z) / length))
        w = 0.85 * t**1.2
        return {body: 1 - w, lick_bone: w} if w > 0.01 else {body: 1.0}

    return weights


def nearest_lick(c, among=None):
    names = [n for n, parent in LICKS if among is None or parent in among]
    return min(names, key=lambda n: _segment_distance(c, m.joints[n], m.tails[n]))


def nearest_body(c):
    return min(BODY, key=lambda n: _segment_distance(c, m.joints[n], m.tails[n]))


def surface_flame(origin, direction, length, width, colours, rise=(0, 0, 1), sink=0.04):
    """A tongue rising from where a ray from `origin` along `direction` leaves the core, licking up."""
    o, d = Vector(origin), Vector(direction).normalized()
    q = surface(m, o, d)
    n = (q - o).normalized() if (q - o).length > 1e-4 else d
    up = Vector(rise).normalized()
    wiggle = n.cross(up).normalized() if n.cross(up).length > 0.05 else Vector((1, 0, 0))
    s = rng.uniform(-1, 1)
    base = q - n * sink
    ctrl = [
        base,
        base + n * 0.07 + up * length * 0.3 + wiggle * 0.05 * s,
        base + n * 0.06 + up * length * 0.65 - wiggle * 0.07 * s,
        base + n * rng.uniform(0.0, 0.12) + up * length + wiggle * 0.04 * s,
    ]
    body = nearest_body(base)
    lick_bone = nearest_lick(base, [body]) if any(p == body for _n, p in LICKS) else nearest_lick(base)
    tongue(m, ctrl, width, width * 0.38, n, colours, body, steps=9, profile=profile, wobble=0.18, rng=rng, weights=lick_weights(base, length, body, lick_bone))


# The body: tongues licking up all over the chest, belly and back, the biggest at the shoulders.
N = 56
for i in range(N):
    y = WAIST - 0.05 + (CHEST + 0.12 - WAIST + 0.05) * (i + 0.5) / N
    a0 = i * 2.39996
    if y > CHEST - 0.3 and math.cos(a0) > 0.1 and abs(math.sin(a0)) < 0.8:
        continue  # (under the chin: the face shows)
    d = at(math.sin(a0), rng.uniform(-0.3, 0.1), math.cos(a0))
    size = 0.85 + 0.45 * (y - WAIST) / (CHEST - WAIST)
    surface_flame(at(0, y, 0.03), d, rng.uniform(0.45, 0.66) * size, rng.uniform(0.22, 0.32) * size, FLAME if math.cos(a0) < 0.5 else HOT)
# An outer ragged layer over the shoulders and back, darker, running to red.
for i in range(16):
    a0 = math.radians(rng.uniform(100, 260))
    y = rng.uniform(1.8, CHEST + 0.1)
    surface_flame(at(0, y, 0.0), at(math.sin(a0), 0.3, math.cos(a0)), rng.uniform(0.5, 0.75), rng.uniform(0.2, 0.3), OUTER, sink=-0.02)
# The arms: tongues streaming up off them.
for side, sign in (("l", 1), ("r", -1)):
    names = ARMS[side]
    for k in range(13):
        u = (k + 0.5) / 13
        seg = min(2, int(u * 3))
        a, b = m.joints[names[seg]], m.tails[names[seg]]
        c = a.lerp(b, u * 3 - seg)
        a0 = rng.uniform(0, math.tau)
        surface_flame(c, (math.cos(a0) * 0.5, math.sin(a0), 0.8), rng.uniform(0.3, 0.46) * (1.15 - 0.4 * u), rng.uniform(0.15, 0.22), FLAME if k % 3 else OUTER)
    # Fingers: five clawed licks of flame from the hand, curling forward and down.
    wrist, tip = m.joints[names[2]], m.tails[names[2]]
    along_hand = (tip - wrist).normalized()
    across = along_hand.cross(Vector((0, 0, 1))).normalized()
    for k in range(5):
        f = (k - 2) / 2
        base = wrist.lerp(tip, 0.5) + across * f * 0.07
        end = tip + along_hand * 0.24 + across * f * 0.15 + Vector((0, 0, -0.08 - 0.05 * abs(f)))
        tongue(m, [base, base.lerp(end, 0.5) + Vector((0, 0, 0.05)), end], 0.085, 0.05, (0, 0, 1), HOT, names[2], steps=7, profile=profile, rng=rng, weights=lambda co, n=names: {n[2]: 1.0})
# The head: tongues licking up round the sides and back of the head, framing the face.
for k in range(9):
    a0 = math.radians(-105 + 210 * k / 8)
    d = at(math.sin(a0), 0.3, -math.cos(a0))
    surface_flame(hc, d, rng.uniform(0.3, 0.45), rng.uniform(0.15, 0.2), FLAME, rise=(0, 0.2, 1), sink=0.03)
# The column: tongues spiralling up round it.
for k in range(20):
    h = 0.12 + 1.3 * (k + 0.5) / 20
    a = k * 2.39996
    c = [p for p in smooth_path(COLUMN, 30) if p.z >= h][0]
    d = Vector((math.cos(a), math.sin(a), 0))
    rise = Vector((0, 0, 1)) + d.cross(Vector((0, 0, 1))) * 0.6
    surface_flame(c, d, rng.uniform(0.42, 0.62), rng.uniform(0.2, 0.3), FLAME if k % 2 else OUTER, rise=tuple(rise))
# A ring of fire licking out over the ground round the foot of the column.
for k in range(10):
    a0 = k / 10 * math.tau + rng.uniform(-0.2, 0.2)
    d = Vector((math.sin(a0), -math.cos(a0), 0))
    base = Vector((0, 0, 0.04)) + d * 0.04
    end = d * rng.uniform(0.45, 0.65) + Vector((0, 0, rng.uniform(0.25, 0.45)))
    tongue(m, [base, d * 0.25 + Vector((0, 0, 0.06)), end], rng.uniform(0.18, 0.26), 0.07, (0, 0, 1), FLAME, "column_01", steps=8, profile=profile, wobble=0.25, rng=rng, weights=lambda co: {"column_01": 1.0})


# ── Actions: always burning. Every tongue flickers; the column writhes. ──
X, Y, Z = (1, 0, 0), (0, 1, 0), (0, 0, 1)  # (about X: tips forward; about Y: tips to its right; about Z: turns)
PHASE = {names[0]: rng.random() for names, *_ in FLAMES}
PHASE.update({name: rng.random() for name, _p in LICKS})


def flicker(own, u, amount=1.0, trail=0.0, cycles=4):
    """Every tongue of fire licking: a quick wave up each chain, a stretch and shrink, and leaning back by
    `trail` degrees (streaming behind as it moves)."""
    scale = own.setdefault("_scale", {})
    for names, *_ in FLAMES:
        ph = PHASE[names[0]]
        for i, name in enumerate(names):
            add(own, name, turn(X, trail * (0.5 + 0.3 * i) + amount * 12 * wave(u, cycles, ph - 0.18 * i)))
            add(own, name, turn(Y, amount * 14 * wave(u, cycles + 1, ph * 1.7 - 0.22 * i)))
            scale[name] = (1.0, 1.0 + amount * 0.16 * wave(u, cycles + 2, ph * 2.3 + 0.3 * i), 1.0)
    for name, _parent in LICKS:
        ph = PHASE[name]
        add(own, name, turn(X, trail + amount * 16 * wave(u, cycles + 1, ph)) @ turn(Y, amount * 18 * wave(u, cycles, ph * 1.3)))
        scale[name] = (1.0, 1.0 + amount * 0.25 * wave(u, cycles + 2, ph * 2.1), 1.0)


def writhe(own, u, amount=1.0, lean=0.0, cycles=1):
    """The column swaying and twisting like a flame, the body riding on it."""
    for i, name in enumerate(column):
        add(own, name, turn(Y, amount * 6 * wave(u, cycles, 0.25 * i)) @ turn(X, lean / 4 + amount * 4 * wave(u, cycles, 0.4 + 0.2 * i)))
        add(own, name, turn(Z, amount * 5 * wave(u, cycles, 0.1 * i)))


def arms(own, u, lift=0.0, reach=0.0, sway=1.0, cycles=1):
    for side, sign in (("l", 1), ("r", -1)):
        names = ARMS[side]
        # (About Z: an arm held out sideways swings forward; about Y, up.)
        add(own, names[0], turn(Z, -sign * reach) @ turn(Y, -sign * (lift + sway * 6 * wave(u, cycles, 0.3 if sign > 0 else 0.8))))
        add(own, names[1], turn(Y, -sign * sway * 5 * wave(u, cycles, 0.5 if sign > 0 else 0.0)))
        add(own, names[2], turn(X, sway * 8 * wave(u, cycles * 2, 0.2)))


def idle(u):
    own = {}
    writhe(own, u, 1.0)
    add(own, "spine_01", turn(Y, -3 * wave(u, 1, 0.1)))
    add(own, "Head", turn(X, 4 * wave(u, 2)) @ turn(Z, 6 * wave(u, 1, 0.3)))
    arms(own, u, sway=1.0)
    flicker(own, u, 1.0, cycles=5)
    own["_move"] = {"Root": tuple(Vector((0, 0, 0.04 * wave(u, 2))))}
    return own


def glide(u, speed):
    own = {}
    lean = 6 + 7 * speed
    writhe(own, u, 0.7 + 0.4 * speed, lean=lean, cycles=2)
    add(own, "spine_01", turn(X, -lean * 0.4))
    add(own, "Head", turn(X, -lean * 0.3) @ turn(Z, 5 * wave(u, 1)))
    arms(own, u, lift=-10 * speed, reach=10 + 15 * speed, sway=1.5 + speed * 2, cycles=1)
    flicker(own, u, 1.0 + 0.4 * speed, trail=-(20 + 25 * speed), cycles=4 if speed < 1 else 6)
    own["_move"] = {"Root": tuple(Vector((0, 0, 0.05 * abs(wave(u, 1)))))}
    return own


def attack(u):
    # Rears back, the right arm drawn back; lashes forward in a burning punch, the body twisting into
    # it, the column lunging and every flame flaring; then settles back.
    draw = keys([(0, 0), (0.3, 1), (0.42, -1.2), (0.62, -1.0), (1, 0)], u)
    own = {}
    writhe(own, u, 0.6)
    for name in column:
        add(own, name, turn(X, 5 * -draw))
    add(own, "spine_01", turn(Z, -20 * draw) @ turn(X, -8 * draw))
    add(own, "spine_02", turn(Z, -10 * draw))
    add(own, "Head", turn(Z, 18 * draw))
    r, l = ARMS["r"], ARMS["l"]
    punch = max(0.0, -draw)
    pull = max(0.0, draw)
    add(own, r[0], turn(Z, 75 * punch - 30 * pull) @ turn(Y, 20 * punch + 25 * pull))
    add(own, r[1], turn(Z, -40 * pull + 25 * punch))
    add(own, r[2], turn(Y, 10 * punch))
    add(own, l[0], turn(Z, -25 * punch) @ turn(Y, -15 * punch))
    flicker(own, u, 1.2, trail=-30 * punch, cycles=5)
    scale = own["_scale"]
    for name in list(scale):
        sx_, sy_, sz_ = scale[name]
        scale[name] = (sx_, sy_ * (1 + 0.3 * punch), sz_)
    own["_move"] = {"Root": tuple(at(0, 0, 0.35 * punch - 0.1 * pull))}
    return own


m.finish(
    {"Idle": loop(60, 2, idle), "Walk": loop(40, 2, lambda u: glide(u, 0.5)), "Run": loop(24, 2, lambda u: glide(u, 1.4)), "Attack": loop(30, 1, attack)},
    bake={"size": 512, "ao": 0.06, "mottle": 0.08, "mottle_scale": 18, "dirt": 0.02, "head_scale": 1.6},
)
mesh = next(o for o in m.armature.children if o.type == "MESH")
print(f"fire_elemental: {max(v.co.z for v in mesh.data.vertices):.2f} m tall (rest pose)")
