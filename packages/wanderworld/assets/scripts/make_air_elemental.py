"""Air elemental (SRD: Large elemental): a howling whirlwind about 3.4 metres tall. A twisting funnel of
grey-white wind that touches the ground at a point and widens as it rises, bands of wind and dust
streaming round it, leaves, pebbles and twigs caught up and whirling about it, and in the swirl near its
top a hint of a face: a brow of wind over two dark hollow eyes and a gaping, howling mouth. Its own
skeleton: a stacked twist chain that sways (with a spin bone on each link that turns the wind round it)
and four bones the debris orbits on. Drawn semi-translucent (see the report). Writes
assets/models/air_elemental.glb. Run (BLENDER: your Blender executable):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_air_elemental.py
"""

import math
import os
import random
import sys

import bpy
from mathutils import Quaternion, Vector, noise

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wwblend import at  # noqa: E402
from wwelemental import Elemental, add, band, chunk, keys, loop, smooth_path, tongue, turn, wave  # noqa: E402

bpy.ops.wm.read_factory_settings(use_empty=True)
rng = random.Random(9)

CORE = 0x8A9296
CORE_DARK = 0x6E777C
CLOUD = 0xB4BCC0
BAND = 0xCDD3D5
BAND_DARK = 0x98A1A5
DUST = 0x8C8578
HOLLOW = 0x161B20
LEAVES = [0x56622E, 0x7A5A26, 0x8A6E2E, 0x4A5428]
PEBBLE = 0x625E56
TWIG = 0x4A3A28

TOP = 3.3
m = Elemental("air_elemental", resolution=0.02, faces=7000)


def radius(h):
    """The funnel's radius at height h."""
    return 0.07 + 0.78 * (max(0.0, h) / TOP) ** 1.5


# ── The skeleton: a stacked chain up the funnel's bending axis, a spin bone on each link, four orbits ──
AXIS = [at(0, 0, 0), at(0.05, 0.7, -0.02), at(-0.07, 1.45, 0.03), at(0.02, 2.2, 0.0), at(0.04, 2.8, -0.04), at(0, TOP, -0.06)]
axis_pts = smooth_path(AXIS, 60)


def axis_at(h):
    """The point on the funnel's axis at height h."""
    k = min(range(len(axis_pts)), key=lambda i: abs(axis_pts[i].z - h))
    return axis_pts[k]


bones = [("Root", None, at(0, 0, 0), at(0, 0.3, 0))]
TWIST, SPIN, ORBIT = [], [], []
marks = [axis_at(TOP * i / 6) for i in range(7)]
for i in range(6):
    name = f"twist_{i + 1:02d}"
    bones.append((name, TWIST[-1] if TWIST else "Root", marks[i], marks[i + 1]))
    TWIST.append(name)
for i in range(6):
    name = f"spin_{i + 1:02d}"
    bones.append((name, TWIST[i], marks[i], marks[i + 1]))
    SPIN.append(name)
ORBITS = [(1, 0.75), (2, 1.35), (3, 1.95), (4, 2.75)]  # (twist link, height)
for k, (link, h) in enumerate(ORBITS):
    name = f"orbit_{k + 1:02d}"
    c = axis_at(h)
    bones.append((name, TWIST[link], c, c + Vector((0, 0, 0.25))))
    ORBIT.append(name)
rig = m.rig_own(bones)
FACE_H = 2.45
FACE = axis_at(FACE_H) + at(0, 0, radius(FACE_H) * 0.62)


def wind_weights(co):
    if (co - FACE).length < 0.5:
        return {"twist_05": 1.0}
    return m.nearest(co, SPIN, power=3)


m.weigh = wind_weights

# ── The funnel: a dense core of wind, twisted into broad spiral grooves ──
cpts = smooth_path(AXIS, 26)
for i, (a, b) in enumerate(zip(cpts, cpts[1:])):
    h = (a.z + b.z) / 2
    m.capsule(a, b, radius(h) * 0.58, CORE)
# The top: the funnel's mouth rolled over into a rim of churning cloud.
for k in range(12):
    a0 = k / 12 * math.tau
    r = radius(TOP) * 0.62
    m.ball(axis_at(TOP - 0.05) + Vector((math.sin(a0) * r, math.cos(a0) * r, rng.uniform(-0.05, 0.05))), rng.uniform(0.12, 0.16), CLOUD)
# The face: a knot of denser wind bulging from the upper swirl, two deep slanted hollows for eyes under a
# brow, and a gaping howling mouth.
m.ellipsoid(FACE + at(0, 0.02, -0.06), (0.4, 0.24, 0.3), CORE)
m.ellipsoid(FACE + at(0, -0.26, -0.04), (0.28, 0.2, 0.26), CORE)
for sign in (1, -1):
    m.capsule(FACE + at(sign * 0.07, 0.03, 0.15), FACE + at(sign * 0.24, 0.1, 0.08), 0.1, HOLLOW, negative=True)
m.ellipsoid(FACE + at(0, -0.3, 0.16), (0.13, 0.18, 0.16), HOLLOW, negative=True)
for sign in (1, -1):
    # (Dark voids at the back of the hollows, so the eyes read from any way the wind's drawn.)
    m.sphere(FACE + at(sign * 0.15, 0.065, 0.13), (0.1, 0.05, 0.055), HOLLOW, "twist_05", segments=10, rings=6)
m.sphere(FACE + at(0, -0.3, 0.12), (0.1, 0.07, 0.15), HOLLOW, "twist_05", segments=10, rings=6)


def twisted(co, normal):
    """Broad spiral grooves round the core, rising as they go round."""
    c = axis_at(co.z)
    a = math.atan2(co.y - c.y, co.x - c.x)
    if (co - FACE).length < 0.45:
        return Vector()
    return normal * 0.07 * min(1.0, radius(co.z) / 0.45) * math.sin(a * 3 - co.z * 4.5)


def wind(q, colour):
    if colour == HOLLOW:
        return colour
    if (q - FACE).length < 0.45:
        return CLOUD if noise.noise(q * 5) > -0.4 else BAND
    c = axis_at(q.z)
    a = math.atan2(q.y - c.y, q.x - c.x)
    s = math.sin(a * 3 - q.z * 4.5)
    if s > 0.55:
        return CLOUD
    if s < -0.6:
        return CORE_DARK if q.z > 0.5 or noise.noise(q * 3) < 0.2 else DUST
    return colour


m.shapes["body"] = twisted
m.paint = wind

# ── Bands of wind streaming round the funnel, and dust ──


def spiral(h0, h1, turns, a0, out=1.0, n=30):
    pts = []
    for i in range(n + 1):
        u = i / n
        h = h0 + (h1 - h0) * u
        a = a0 + turns * math.tau * u
        r = radius(h) * out * (0.95 + 0.1 * math.sin(u * math.pi))
        c = axis_at(h)
        pts.append(c + Vector((math.cos(a) * r, math.sin(a) * r, 0)))
    return pts


def slope(p):
    """Up the funnel's side at p (the way a band's width runs)."""
    c = axis_at(p.z)
    out = Vector((p.x - c.x, p.y - c.y, 0))
    out = out.normalized() if out.length > 1e-4 else Vector((1, 0, 0))
    return Vector((0, 0, 1)) - out * 0.35


def clear_of_face(p):
    """Off the front of the face (where a band would hide it)."""
    c = axis_at(p.z)
    front = Vector((p.x - c.x, p.y - c.y, 0))
    return not (FACE_H - 0.6 < p.z < FACE_H + 0.32 and front.length > 1e-4 and front.normalized().y < -0.5)


for k in range(26):
    h0 = rng.uniform(0.0, TOP - 0.8)
    h1 = min(TOP - 0.12, h0 + rng.uniform(0.8, 1.6))
    path = spiral(h0, h1, rng.uniform(1.0, 1.8), rng.uniform(0, math.tau), out=rng.uniform(0.9, 1.15))
    dusty = rng.random() < 0.3
    cols = (lambda u: DUST if u % 0.3 < 0.18 else BAND_DARK) if dusty else (lambda u: BAND if u % 0.25 < 0.17 else BAND_DARK)
    width = rng.uniform(0.14, 0.28) * (0.5 + h0 / TOP)
    # (Broken where it would pass over the face.)
    run = []
    for p in path + [None]:
        if p is not None and clear_of_face(p):
            run.append(p)
            continue
        if len(run) >= 7:
            band(m, run, width, rng.uniform(0.012, 0.018), slope, cols, "spin_01", weights=lambda co: m.nearest(co, SPIN, power=3))
        run = []
# Over the face: a brow of wind sweeping over each eye, and gusts curling round the mouth.
for sign in (1, -1):
    # (Low between the eyes, rising outward: a scowl.)
    brow = [FACE + at(sign * 0.0, 0.15, 0.22), FACE + at(sign * 0.14, 0.19, 0.2), FACE + at(sign * 0.3, 0.27, 0.11), FACE + at(sign * 0.46, 0.28, -0.08)]
    band(m, smooth_path(brow, 10), 0.09, 0.07, lambda p: Vector((0, -0.4, 1)), lambda u: BAND, "twist_05", weights=lambda co: {"twist_05": 1.0}, taper=False)
    cheek = [FACE + at(sign * 0.18, -0.1, 0.2), FACE + at(sign * 0.24, -0.28, 0.17), FACE + at(sign * 0.17, -0.46, 0.12), FACE + at(sign * 0.02, -0.54, 0.08)]
    band(m, smooth_path(cheek, 10), 0.08, 0.04, lambda p: Vector((0, -0.4, 1)), lambda u: BAND_DARK, "twist_05", weights=lambda co: {"twist_05": 1.0})
# Streamers of wind trailing off the rim at the top.
for k in range(5):
    a0 = k / 5 * math.tau + 0.3
    c = axis_at(TOP)
    r = radius(TOP)
    path = [c + Vector((math.cos(a0 + t) * r * (0.8 + 0.15 * t), math.sin(a0 + t) * r * (0.8 + 0.15 * t), -0.1 + 0.45 * t)) for t in (x / 12 for x in range(13))]
    band(m, path, 0.14, 0.012, slope, lambda u: BAND if u < 0.6 else BAND_DARK, "spin_06", weights=lambda co: m.nearest(co, SPIN[4:], power=3))

# ── Debris caught in the wind: leaves, pebbles, twigs, each riding one of the orbits ──
for k, (name, (link, h)) in enumerate(zip(ORBIT, ORBITS)):
    c = axis_at(h)
    for j in range(6):
        a0 = j / 6 * math.tau + k * 0.7 + rng.uniform(-0.3, 0.3)
        hh = h + rng.uniform(-0.25, 0.25)
        r = radius(hh) * rng.uniform(1.05, 1.3) + 0.06
        p = axis_at(hh) + Vector((math.cos(a0) * r, math.sin(a0) * r, 0))
        tangent = Vector((-math.sin(a0), math.cos(a0), rng.uniform(-0.3, 0.3))).normalized()
        kind = (j + k) % 3
        rigid = (lambda co, n=name: {n: 1.0})
        if kind == 0:
            # A leaf: flat, pointed, tumbling.
            tongue(m, [p - tangent * 0.1, p + Vector((0, 0, 0.015)), p + tangent * 0.11], 0.11, 0.014, Vector((rng.uniform(-1, 1), rng.uniform(-1, 1), 1)), [(0, rng.choice(LEAVES))], name, steps=5, sides=4, rng=rng, weights=rigid, smooth=False)
        elif kind == 1:
            s = rng.uniform(0.05, 0.09)
            chunk(m, p, (s, s * 0.8, s * 0.7), name, PEBBLE, rng, points=8, turn=Quaternion((rng.random(), rng.random(), rng.random()), rng.uniform(0, 3)), boxy=True, weights=rigid)
        else:
            # A twig with a fork.
            end = p + tangent * 0.34
            m.tube(p, end, 0.018, 0.01, TWIG, name, segments=5)
            m.tube(p.lerp(end, 0.5), p.lerp(end, 0.5) + (tangent + Vector((0, 0, 0.8))).normalized() * 0.1, 0.009, 0.005, TWIG, name, segments=4)


# ── Actions: always whirling. The wind spins round, the funnel sways and bends, the debris orbits. ──
X, Y, Z = (1, 0, 0), (0, 1, 0), (0, 0, 1)


def whirl(own, u, turns=1, orbits=(1, 2, 1, 2)):
    for name in SPIN:
        add(own, name, turn(Z, -360 * turns * u))
    for name, t in zip(ORBIT, orbits):
        add(own, name, turn(Z, -360 * t * u))


def sway(own, u, amount=1.0, lean=0.0, cycles=1):
    """The funnel bending: each link swaying a little after the one below it, as a whip does."""
    for i, name in enumerate(TWIST):
        add(own, name, turn(X, lean / 6 + amount * 1.6 * wave(u, cycles, -0.12 * i)) @ turn(Y, amount * 2 * wave(u, cycles, 0.25 - 0.12 * i)))


def idle(u):
    own = {}
    whirl(own, u, 2)
    sway(own, u, 1.0)
    add(own, "twist_05", turn(Z, 4 * wave(u, 1, 0.3)))
    own["_scale"] = {name: (1.0 + 0.04 * wave(u, 2, 0.2 * i), 1.0, 1.0 + 0.04 * wave(u, 2, 0.2 * i)) for i, name in enumerate(SPIN)}
    return own


def drift(u, speed):
    own = {}
    whirl(own, u, 1 if speed < 1 else 1)
    sway(own, u, 1.2 + speed, lean=8 + 10 * speed, cycles=2)
    add(own, "twist_05", turn(X, -6 * speed))
    own["_scale"] = {name: (1.0 + 0.05 * wave(u, 2, 0.2 * i), 1.0, 1.0 + 0.05 * wave(u, 2, 0.2 * i)) for i, name in enumerate(SPIN)}
    return own


def attack(u):
    # Draws back, the funnel bowing away; then lunges, the top of the funnel leaning hard in at its
    # target with a buffeting gust, and swings back up.
    pull = keys([(0, 0), (0.3, 1), (0.46, -1.25), (0.66, -1.0), (1, 0)], u)
    back = max(0.0, pull)
    lunge = max(0.0, -pull)
    own = {}
    whirl(own, u, 1, orbits=(1, 1, 2, 2))
    for i, name in enumerate(TWIST):
        add(own, name, turn(X, (-7 * back + 11 * lunge) * (0.4 + 0.25 * i)))
        add(own, name, turn(Y, 3 * wave(u, 2, -0.1 * i)))
    own["_scale"] = {name: (1.0 + 0.12 * lunge * i / 5, 1.0, 1.0 + 0.12 * lunge * i / 5) for i, name in enumerate(SPIN)}
    own["_move"] = {"Root": tuple(at(0, 0, 0.35 * lunge - 0.1 * back))}
    return own


m.finish(
    {"Idle": loop(60, 2, idle), "Walk": loop(40, 2, lambda u: drift(u, 0.5)), "Run": loop(24, 2, lambda u: drift(u, 1.3)), "Attack": loop(30, 1, attack)},
    bake={"size": 512, "ao": 0.1, "mottle": 0.1, "mottle_scale": 12, "dirt": 0.02, "head_scale": 1.0},
)
mesh = next(o for o in m.armature.children if o.type == "MESH")
print(f"air_elemental: {max(v.co.z for v in mesh.data.vertices):.2f} m tall (rest pose)")
