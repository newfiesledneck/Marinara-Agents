"""Water elemental (SRD: Large elemental): a towering wave given form, about 3.4 metres tall. A surging column
of dark water rises from a churning pool of foam on the ground, narrows, then swells up into a great
breaking wave: a broad sheet of water that rears up and curls over forward like a hood, its foaming lip
hanging over a vague face of dark hollows in the trough beneath. Two long watery arms sweep out from it,
each ending in a small crest curling over in foam. Streaks of water run up its skin, sheets of water wind
up round the column, and spray and droplets fly from the lip and the pool. Its own skeleton: a spine, the
crest, two arms and four swirl bones round the base. Drawn translucent blue with white foam (see the
report). Writes assets/models/water_elemental.glb. Run (BLENDER: your Blender executable):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_water_elemental.py
"""

import math
import os
import random
import sys

import bpy
from mathutils import Vector, noise

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wwblend import at  # noqa: E402
from wwelemental import Elemental, add, keys, loop, smooth_path, tongue, turn, wave  # noqa: E402

bpy.ops.wm.read_factory_settings(use_empty=True)
rng = random.Random(3)

ABYSS = 0x0F2A3C
DEEP = 0x1A4058
MID = 0x285C76
LIGHT = 0x467E96
PALE = 0x82AABA
FOAM = 0xD8E2E2
FOAM_GREY = 0xA8BCC0
HOLLOW = 0x050E16
WATER = [(0.0, DEEP), (0.4, MID), (0.75, LIGHT)]
SPRAY = [(0.0, PALE), (0.35, FOAM_GREY), (0.6, FOAM)]

m = Elemental("water_elemental", resolution=0.024, faces=7000)

# ── The skeleton ──
SPINE = [at(0, 0.15, 0), at(0, 0.8, 0.02), at(0, 1.4, -0.04), at(0, 1.9, -0.1), at(0, 2.2, -0.2)]
CREST = [at(0, 2.1, -0.28), at(0, 2.75, -0.36), at(0, 3.2, -0.18), at(0, 3.4, 0.16), at(0, 3.24, 0.52), at(0, 2.98, 0.76), at(0, 2.72, 0.74)]
bones = [("Root", None, at(0, 0, 0), at(0, 0.3, 0))]


def chain(prefix, parent, controls, count):
    pts = smooth_path(controls, 64)
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


SWIRL = []
for k in range(4):
    a0 = k / 4 * math.tau + math.pi / 4
    name = f"swirl_{k + 1:02d}"
    bones.append((name, "Root", at(0, 0.1, 0), at(math.sin(a0) * 0.8, 0.1, math.cos(a0) * 0.8)))
    SWIRL.append(name)
spine = chain("spine", "Root", SPINE, 4)
crest = chain("crest", "spine_04", CREST, 5)
ARM_PATH = {}
ARMS = {}
for side, sign in (("l", 1), ("r", -1)):
    ARM_PATH[side] = [at(sign * 0.45, 2.1, -0.08), at(sign * 0.98, 2.0, 0.08), at(sign * 1.42, 1.72, 0.4), at(sign * 1.56, 1.78, 0.72), at(sign * 1.46, 1.98, 0.82)]
    ARMS[side] = chain(f"arm_{side}", "spine_04", ARM_PATH[side], 4)
rig = m.rig_own(bones)
BODY = SWIRL + spine + crest + ARMS["l"] + ARMS["r"]
m.weigh = lambda co: m.nearest(co, BODY, power=3.5)

# ── The body ──
# The pool: a wide low swirl round the foot of the column, its rim churning with foam.
m.ellipsoid(at(0, 0.1, 0), (0.95, 0.95, 0.14), MID)
m.ellipsoid(at(0, 0.22, 0), (0.55, 0.55, 0.2), DEEP)
for k in range(12):
    a0 = k / 12 * math.tau + rng.uniform(-0.2, 0.2)
    r = rng.uniform(0.7, 0.92)
    m.ball(at(math.sin(a0) * r, 0.12, math.cos(a0) * r), rng.uniform(0.12, 0.17), FOAM)
# The column: narrowing from the pool, then swelling into the base of the wave.
PROFILE = [(0.2, 0.44), (0.55, 0.34), (0.9, 0.3), (1.3, 0.36), (1.7, 0.46), (2.1, 0.5)]
pts = smooth_path(SPINE, 26)
for a, b in zip(pts, pts[1:]):
    h = (a.z + b.z) / 2
    if h < 0.4:
        continue  # (the pool takes over: the column's round end would sink through the ground)
    j = next((k for k in range(1, len(PROFILE)) if PROFILE[k][0] >= h), len(PROFILE) - 1)
    (h0, r0), (h1, r1) = PROFILE[j - 1], PROFILE[j]
    r = r0 + (r1 - r0) * max(0.0, min(1.0, (h - h0) / (h1 - h0)))
    m.capsule(a, b, r, DEEP if h < 1.2 else MID)
# The wave: a broad sheet rearing up and curling over forward like a hood, its sides drooping, its lip
# thinning to foam.
cpts = smooth_path(CREST, 22)
for i, p in enumerate(cpts):
    u = i / 22
    w = 0.42 + 0.32 * math.sin(min(1.0, u / 0.55) * math.pi / 2) - 0.2 * max(0.0, u - 0.7) / 0.3
    t = 0.3 - 0.24 * u
    droop = Vector((0, 0, -0.18 - 0.1 * u))
    colour = MID if u < 0.45 else (LIGHT if u < 0.9 else FOAM)
    m.capsule(p, p + Vector((w, 0, 0)) + droop, t, colour)
    m.capsule(p, p + Vector((-w, 0, 0)) + droop, t, colour)
# A few clots of foam riding the lip.
for i in range(7):
    u = rng.uniform(0.7, 1.0)
    p = cpts[int(u * 22)]
    x = rng.uniform(-0.45, 0.45) * (1.1 - u * 0.5)
    m.ball(p + Vector((x, 0, -0.2 * abs(x) / 0.5)), rng.uniform(0.06, 0.09), FOAM)
# The arms: long rolling arms sweeping out and forward, each ending in a crest curling over in foam.
for side, sign in (("l", 1), ("r", -1)):
    apts = smooth_path(ARM_PATH[side], 16)
    for i, (a, b) in enumerate(zip(apts, apts[1:])):
        u = i / 16
        m.capsule(a, b, 0.22 - 0.15 * u, MID if u < 0.6 else (LIGHT if u < 0.85 else FOAM))
    m.ellipsoid(at(sign * 0.36, 2.02, -0.05), (0.32, 0.26, 0.3), MID)
# The face, in the trough under the lip: two deep slanting hollows for eyes and a dark gash of a mouth.
FACE = at(0, 2.08, 0.45)
for sign in (1, -1):
    m.capsule(at(sign * 0.05, 2.2, 0.47), at(sign * 0.22, 2.28, 0.4), 0.085, HOLLOW, negative=True)
    m.sphere(at(sign * 0.14, 2.23, 0.4), (0.11, 0.05, 0.05), HOLLOW, "spine_04", segments=10, rings=6)
m.capsule(at(-0.14, 1.9, 0.46), at(0.14, 1.9, 0.46), 0.07, HOLLOW, negative=True)
m.sphere(at(0, 1.88, 0.42), (0.13, 0.05, 0.07), HOLLOW, "spine_04", segments=10, rings=6)


def ripple(co, normal):
    """Streaks of water running up and round it, and a choppy surface; the pool churned up at its rim."""
    a = math.atan2(co.y, co.x)
    rise = 0.03 * math.sin(a * 5 + co.z * 4) + 0.02 * noise.noise(Vector((co.x * 6, co.y * 6, co.z * 1.4)))
    if co.z < 0.35:
        rise += 0.04 * max(0.0, noise.noise(co * 6))
    return normal * rise


def flow(q):
    """A noise drawn out in streaks that spiral up the body."""
    t = q.z * 1.1
    x, y = q.x * math.cos(t) - q.y * math.sin(t), q.x * math.sin(t) + q.y * math.cos(t)
    return noise.noise(Vector((x * 6, y * 6, q.z * 0.9)))


def surf(q, colour):
    if colour == HOLLOW:
        return colour
    if colour == FOAM:
        return FOAM if noise.noise(q * 4) > -0.3 else FOAM_GREY
    if q.z < 0.3 and noise.noise(q * 5) > 0.0:
        return FOAM if q.z < 0.2 else FOAM_GREY
    if (q - FACE).length < 0.42:
        return ABYSS if (q - FACE).length < 0.3 else DEEP
    # Darker below, lighter up the wave; pale lines of flow streaking up it.
    base = DEEP if q.z < 1.1 else (MID if q.z < 2.6 else LIGHT)
    if colour == LIGHT:
        base = LIGHT
    s = flow(q)
    if s > 0.35:
        return {DEEP: ABYSS, MID: DEEP, LIGHT: MID}[base]
    if s < -0.5:
        return {DEEP: MID, MID: LIGHT, LIGHT: PALE}[base]
    return base


m.shapes["body"] = ripple
m.paint = surf

# ── Sheets of water surging up round the column and up into the wave, spray and droplets ──


def radial(p):
    d = Vector((p.x, p.y, 0))
    return d.normalized() if d.length > 1e-3 else Vector((0, -1, 0))


for k in range(3):
    a0 = k / 3 * math.tau
    ctrl = []
    for i in range(5):
        h = 0.25 + 0.38 * i
        a = a0 + h * 1.4
        r = 0.36 + 0.06 * math.sin(h * 2)
        ctrl.append(at(math.sin(a) * r, h, math.cos(a) * r))
    tongue(m, ctrl, 0.42, 0.09, radial, WATER, "spine_01", steps=16, wobble=0.12, rng=rng, weights=lambda co: m.nearest(co, spine + SWIRL, power=3))
# Water rushing up the back and sides into the wave, sharp-edged sheets curling over at the top.
for k in range(8):
    th = math.radians(-150 + 300 * k / 7)
    if abs(th) < math.radians(45):
        continue
    sx, fz = math.sin(th), math.cos(th)
    ctrl = [at(sx * 0.34, 1.2, fz * 0.3), at(sx * 0.52, 2.0, fz * 0.42 - 0.08), at(sx * 0.62, 2.75, -0.42), at(sx * 0.5, 3.3, -0.12), at(sx * 0.42, 3.36, 0.22)]
    tongue(m, ctrl, 0.4, 0.08, radial, [(0.0, MID), (0.55, LIGHT), (0.85, PALE)], "spine_03", steps=16, wobble=0.15, rng=rng, weights=lambda co: m.nearest(co, spine[2:] + crest, power=3))


def finger_profile(u):
    return (0.7 + 0.3 * math.sin(min(1.0, u / 0.25) * math.pi / 2)) * (1 - u) ** 0.9


# Fingers of water and spray pouring forward and down off the lip of the breaking wave.
lip_a, lip_b = m.joints[crest[4]], m.tails[crest[4]]
for k in range(8):
    x = (k - 3.5) / 3.5 * 0.48 + rng.uniform(-0.05, 0.05)
    base = lip_a.lerp(lip_b, rng.uniform(0.2, 0.7)) + Vector((x, 0, -0.2 * abs(x) / 0.5))
    reach = rng.uniform(0.2, 0.55)
    out = Vector((x * 0.5 + rng.uniform(-0.2, 0.2), -0.55, -0.8)).normalized()
    end = base + out * reach
    mid = base.lerp(end, 0.5) + Vector((rng.uniform(-0.05, 0.05), -0.08, 0.04))
    tongue(m, [base, mid, end], rng.uniform(0.16, 0.26), 0.06, (0, -1, 0.3), [(0.0, LIGHT), (0.5, PALE), (0.82, FOAM)], crest[4], steps=7, profile=finger_profile, wobble=0.25, rng=rng, weights=lambda co: m.along(co, crest[3:]))
# Spray from the pool's rim.
for k in range(6):
    a0 = k / 6 * math.tau + rng.uniform(-0.3, 0.3)
    d = Vector((math.sin(a0), -math.cos(a0), 0))
    base = d * rng.uniform(0.7, 0.88) + Vector((0, 0, 0.12))
    end = base + d * rng.uniform(0.12, 0.22) + Vector((0, 0, rng.uniform(0.12, 0.22)))
    tongue(m, [base, base.lerp(end, 0.5) + d * 0.05, end], rng.uniform(0.2, 0.26), 0.08, (0, 0, 1), SPRAY, SWIRL[k % 4], steps=6, profile=finger_profile, wobble=0.3, rng=rng, weights=lambda co: m.nearest(co, SWIRL, power=4))
# The arms' crests: fingers of water curling over off the end of each.
for side, sign in (("l", 1), ("r", -1)):
    names = ARMS[side]
    tip = m.tails[names[3]]
    for k in range(3):
        base = tip + at(sign * (k - 1) * 0.07, -0.02, -0.04)
        end = base + at(sign * (k - 1) * 0.08, -0.2, 0.2)
        tongue(m, [base, base + at(0, 0.06, 0.12), end], 0.13, 0.05, (0, 0, 1), [(0.0, LIGHT), (0.55, PALE), (0.85, FOAM)], names[3], steps=6, profile=finger_profile, wobble=0.2, rng=rng, weights=lambda co, n=names: {n[3]: 1.0})
# Droplets round the pool, the lip and the arms' crests.
for k in range(18):
    if k < 7:
        a0 = rng.uniform(0, math.tau)
        c, bone = at(math.sin(a0) * rng.uniform(0.95, 1.2), rng.uniform(0.25, 0.6), math.cos(a0) * rng.uniform(0.95, 1.2)), SWIRL[k % 4]
    elif k < 13:
        c, bone = lip_b + at(rng.uniform(-0.5, 0.5), rng.uniform(-0.2, 0.2), rng.uniform(0.15, 0.4)), crest[4]
    else:
        side = ("l", "r")[k % 2]
        c, bone = m.tails[ARMS[side][3]] + at(rng.uniform(-0.15, 0.15), rng.uniform(0.0, 0.2), rng.uniform(0.05, 0.25)), ARMS[side][3]
    r = rng.uniform(0.025, 0.045)
    m.sphere(c, (r, r, r * 1.3), PALE if k % 3 else FOAM, bone, segments=6, rings=4)


# ── Actions: always surging. The pool spins, waves roll up the body, the crest curls and uncurls. ──
X, Y, Z = (1, 0, 0), (0, 1, 0), (0, 0, 1)


def swirl(own, u, turns=1):
    for name in SWIRL:
        add(own, name, turn(Z, -360 * turns * u))


def surge(own, u, amount=1.0, lean=0.0, cycles=1):
    """Waves rolling up the body: each spine bone swaying a little after the one below it."""
    for i, name in enumerate(spine):
        add(own, name, turn(X, lean / 4 + amount * 4 * wave(u, cycles, -0.15 * i)) @ turn(Y, amount * 3.5 * wave(u, cycles, 0.25 - 0.15 * i)))


def curl(own, u, amount=1.0, extra=0.0, cycles=1):
    """The crest curling over (above 0) and lifting back, rippling to its lip."""
    for i, name in enumerate(crest):
        add(own, name, turn(X, extra * (0.4 + 0.15 * i) + amount * 5 * wave(u, cycles, -0.18 * i)))
        add(own, name, turn(Y, amount * 3 * wave(u, cycles, 0.3 - 0.2 * i)))


def arms(own, u, lift=0.0, reach=0.0, sway=1.0, cycles=1):
    for side, sign in (("l", 1), ("r", -1)):
        for i, name in enumerate(ARMS[side]):
            k = 1 if i == 0 else 0.5
            # (About Z: an arm held out sideways swings forward; about Y, up.)
            add(own, name, turn(Z, -sign * (reach * k + sway * 4 * wave(u, cycles, 0.3 - 0.2 * i))) @ turn(Y, -sign * (lift * k + sway * 6 * wave(u, cycles, (0.0 if sign > 0 else 0.5) - 0.2 * i))))


def idle(u):
    own = {}
    swirl(own, u, 1)
    surge(own, u, 1.0)
    curl(own, u, 1.0, cycles=2)
    arms(own, u, sway=1.0)
    return own


def walk(u, speed):
    own = {}
    swirl(own, u, 1)
    surge(own, u, 1.3 + speed, lean=10 + 12 * speed, cycles=2)
    curl(own, u, 1.3, extra=8 * speed, cycles=2)
    arms(own, u, lift=-6 * speed, reach=8 + 12 * speed, sway=1.5 + speed, cycles=1)
    return own


def attack(u):
    # Rears up, the arms and the crest flung back and high; then crashes forward and down like a breaking
    # wave, the arms slamming down in front and the crest whipping over; then draws back up.
    rear = keys([(0, 0), (0.35, 1), (0.5, -1.25), (0.7, -1.1), (1, 0)], u)
    up = max(0.0, rear)
    down = max(0.0, -rear)
    own = {}
    swirl(own, u, 1)
    for i, name in enumerate(spine):
        add(own, name, turn(X, (-6 * up + 12 * down) * (0.6 + 0.2 * i)))
    for i, name in enumerate(crest):
        add(own, name, turn(X, -12 * up + 14 * down))
    for side, sign in (("l", 1), ("r", -1)):
        names = ARMS[side]
        # Flung up and back, then swung forward and down in front.
        add(own, names[0], turn(Z, -sign * (-15 * up + 45 * down)) @ turn(Y, -sign * (55 * up - 35 * down)))
        add(own, names[1], turn(Y, -sign * (10 * up - 20 * down)))
        add(own, names[2], turn(Y, sign * 20 * down))
    own["_move"] = {"Root": tuple(at(0, 0.0, 0.3 * down - 0.08 * up))}
    return own


m.finish(
    {"Idle": loop(60, 2, idle), "Walk": loop(40, 2, lambda u: walk(u, 0.5)), "Run": loop(24, 2, lambda u: walk(u, 1.3)), "Attack": loop(36, 1, attack)},
    bake={"size": 512, "ao": 0.12, "mottle": 0.06, "mottle_scale": 10, "dirt": 0.02, "head_scale": 1.0},
)
mesh = next(o for o in m.armature.children if o.type == "MESH")
print(f"water_elemental: {max(v.co.z for v in mesh.data.vertices):.2f} m tall (rest pose)")
