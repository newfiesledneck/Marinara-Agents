"""Earth elemental (SRD: Large elemental): a hulking man-shape of jagged rock and packed earth about 3.1 metres
tall, hunched, its head sunk low and forward between two great boulder shoulders, its long arms hanging to
fists of rock bigger than its head, on short thick legs. Its body is packed dark soil, cracked all over,
armoured with faceted plates and slabs of grey-brown stone with soil showing in the gaps between them;
dull crystals grow out of the cracks on its back and shoulders, moss clings to the stones on top, and its
face is a crude mass of stone under a heavy brow, two dim amber lights deep in its hollows. On the
people's skeleton. Writes assets/models/earth_elemental.glb. Run (BLENDER: your Blender executable):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_earth_elemental.py
"""

import math
import os
import random
import sys

import bpy
from mathutils import Quaternion, noise

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wwblend import Vector, at, humanoid_actions, humanoid_joints, shade, turn  # noqa: E402
from wwcreature import surface  # noqa: E402
from wwelemental import Elemental, chunk  # noqa: E402

bpy.ops.wm.read_factory_settings(use_empty=True)
rng = random.Random(11)

SOIL = 0x3A2C20
SOIL_DARK = 0x21180F
VEIN = 0x7E6A44
ROCKS = [0x5E574D, 0x6A6156, 0x504A42, 0x726658, 0x5A5B56, 0x645A4C]
MOSS = [0x46542E, 0x3A4728, 0x55603A]
CRYSTAL = [0x7F9496, 0x93A3A0, 0x6C8086]
EYE_HOLLOW = 0x120D0A
EYE = 0xD08A34

p = {
    "leg": 1.2,
    "torso": 1.45,
    "neck": 0.0,
    "shoulders": 1.34,
    "hips": 0.66,
    "arm": 1.5,
    "hunch": 0.42,
    "hand": 2.0,
    "foot": 2.0,
}
joints = humanoid_joints(p)
m = Elemental("earth_elemental", resolution=0.028, faces=6500)
m.group("head", resolution=0.02, faces=1400, bone="Head")
rig = m.rig(joints)
BONES = {b.name: (b.head_local.copy(), b.tail_local.copy()) for b in rig.data.bones}

hips = p["leg"]
arm_y = hips + p["torso"] * 0.88
sx, hx = p["shoulders"] / 2, p["hips"] / 2
HEAD = Vector(at(0, 2.6, 0.44))


def ell(c, radii, colour=SOIL, group="body"):  # radii (across, up, front to back)
    m.ellipsoid(at(*c), (radii[0], radii[2], radii[1]), colour, group=group)


def cap(a, b, r, colour=SOIL):
    m.capsule(at(*a), at(*b), r, colour)


# ── The core: packed earth, a barrel chest leaning forward over a heavy belly, a hump of back muscle
# between the shoulders, long thick arms, short legs. ──
ell((0, hips + 0.02, 0), (0.44, 0.26, 0.33))
ell((0, hips + 0.42, 0.05), (0.5, 0.36, 0.4))
ell((0, hips + 0.92, 0.14), (0.62, 0.48, 0.47))
ell((0, arm_y - 0.08, -0.05), (0.56, 0.3, 0.4))
ell((0, arm_y + 0.02, 0.18), (0.34, 0.22, 0.3))
for sign in (1, -1):
    m.ball(at(sign * (sx - 0.05), arm_y + 0.02, 0), 0.38, SOIL)
    elbow, wrist = sx + p["arm"] * 0.52, sx + p["arm"]
    cap((sign * sx, arm_y, 0), (sign * elbow, arm_y, 0), 0.23)
    cap((sign * elbow, arm_y, 0), (sign * (wrist - 0.05), arm_y, 0), 0.25)
    m.ball(at(sign * (wrist + 0.12), arm_y, 0), 0.27, SOIL)
    cap((sign * hx, hips - 0.05, 0), (sign * hx, hips * 0.52, 0.02), 0.28)
    cap((sign * hx, hips * 0.52, 0.02), (sign * hx, 0.2, 0), 0.25)
    ell((sign * hx, 0.13, 0.1), (0.22, 0.13, 0.32))
ell((0, 2.6, 0.42), (0.27, 0.25, 0.27), group="head")
ell((0, 2.47, 0.52), (0.22, 0.13, 0.2), group="head")
for sign in (1, -1):
    # The hollows the eyes glow in.
    m.ball(at(sign * 0.105, 2.62, 0.66), 0.075, EYE_HOLLOW, negative=True, group="head")
# A crude mouth: a dark slot under the brow.
m.capsule(at(-0.1, 2.44, 0.7), at(0.1, 2.45, 0.7), 0.04, EYE_HOLLOW, negative=True, group="head")


def cracked(co, normal):
    """Packed earth: lumpy, split by a network of cracks."""
    d, _pts = noise.voronoi(co * 2.6, distance_metric="DISTANCE", exponent=2.5)
    crack = max(0.0, 1 - (d[1] - d[0]) / 0.1)
    lump = noise.fractal(co * 1.8, 0.7, 2.0, 3) * 0.05
    return normal * (lump - 0.06 * crack**2)


def soil(q, colour):
    if colour in (EYE_HOLLOW,):
        return colour
    d, _pts = noise.voronoi(q * 2.6, distance_metric="DISTANCE", exponent=2.5)
    if d[1] - d[0] < 0.04:
        return SOIL_DARK
    if noise.ridged_multi_fractal(q * 1.3 + Vector((4, 1, 3)), 1.0, 2.0, 2, 1.0, 2.0) > 1.75:
        return VEIN
    return shade(SOIL, (0.85, 1.0, 1.15)[min(2, int((noise.noise(q * 3) + 1) * 1.5))])


m.shapes["body"] = cracked
m.shapes["head"] = cracked
m.paint = soil


# ── The rock: faceted plates and slabs set into the earth, every one on the bone nearest it ──


def nearest_bone(c):
    from wwblend import _segment_distance

    return min(BONES, key=lambda n: _segment_distance(c, *BONES[n]) + (0.25 if n.startswith("ball") else 0.0))


def facets(base):
    def colour(c, n):
        top = n.z > 0.5 and c.z > 1.9
        if top and noise.noise(c * 2.2) > -0.35:
            return rng.choice(MOSS)
        k = rng.uniform(0.84, 1.12) * (0.78 if n.z < -0.35 else 1.0) * (1.06 if n.z > 0.5 else 1.0)
        if rng.random() < 0.05:
            return VEIN
        return shade(base, min((0.8, 0.9, 1.0, 1.12), key=lambda s: abs(s - k)))

    return colour


def plate(origin, direction, size, thick, bone=None, group="body", sink=0.35, points=16, base=None):
    """A slab of rock lying on the skin where a ray from `origin` (game coordinates) along `direction`
    comes out, `size` across, `thick` deep, sunk a share `sink` of its thickness into the earth."""
    o, d = at(*origin), at(*direction).normalized()
    q = surface(m, o, d, group=group)
    n = (q - o).normalized() if (q - o).length > 1e-4 else d
    spin = Quaternion(n, rng.uniform(0, math.tau))
    twist = Vector((0, 0, 1)).rotation_difference(n)
    centre = q + n * thick * (0.5 - sink)
    radii = (size * rng.uniform(0.8, 1.15), size * rng.uniform(0.6, 1.0), thick)
    chunk(m, centre, radii, bone or nearest_bone(centre), facets(base or rng.choice(ROCKS)), rng, points=points, turn=spin @ twist, flat=0.14)


def ring(a, b, count, per, size, thick, jitter=0.25, skip=None, **kw):
    """Plates round a limb from a to b (game coordinates): `count` along it, `per` round it."""
    a, b = Vector(a), Vector(b)
    axis = (b - a).normalized()
    side = axis.cross(Vector((0, 0, 1)))
    side = side.normalized() if side.length > 0.1 else Vector((1, 0, 0))
    up = side.cross(axis).normalized()
    for i in range(count):
        t = (i + 0.5) / count
        for k in range(per):
            ang = (k + rng.uniform(-jitter, jitter) + 0.5 * (i % 2)) / per * math.tau
            if skip and skip(ang):
                continue
            d = side * math.cos(ang) + up * math.sin(ang) + axis * rng.uniform(-0.15, 0.15)
            plate(tuple(a.lerp(b, t)), tuple(d), size * rng.uniform(0.85, 1.2), thick * rng.uniform(0.8, 1.2), **kw)


# The torso: a shell of plates all round, bigger and thicker over the back and shoulders, rougher at the belly.
for _ in range(46):
    y = rng.uniform(hips - 0.1, arm_y + 0.15)
    a0 = rng.uniform(0, math.tau)
    d = (math.sin(a0), rng.uniform(-0.25, 0.35), math.cos(a0))
    back = math.cos(a0) < 0
    plate((0, y, 0.08), d, rng.uniform(0.2, 0.3) * (1.15 if back else 1.0), rng.uniform(0.1, 0.16) * (1.3 if back else 1.0))
# The ridge of the back: heavy upright slabs between the shoulders, like a broken spine of stone.
for i, y in enumerate((arm_y + 0.12, arm_y - 0.15, arm_y - 0.42, arm_y - 0.7)):
    plate((rng.uniform(-0.06, 0.06), y, 0.0), (0, 0.5, -1), 0.24 - 0.02 * i, 0.22, sink=0.1, points=14)
# The shoulders: a great boulder crowning each, rising past the head, and slabs down the outside.
for sign in (1, -1):
    top = at(sign * (sx - 0.02), arm_y + 0.38, -0.04)
    chunk(m, top, (0.36, 0.32, 0.3), f"clavicle_{'l' if sign > 0 else 'r'}", facets(ROCKS[1]), rng, points=22, turn=Quaternion((0, 0, 1), rng.uniform(0, 3)) @ Quaternion((0, 1, 0), sign * 0.4))
    chunk(m, top + at(sign * 0.18, -0.12, -0.12), (0.22, 0.2, 0.18), f"clavicle_{'l' if sign > 0 else 'r'}", facets(ROCKS[3]), rng, points=16, turn=Quaternion((1, 0, 0), 0.6))
    for k in range(7):
        a0 = k / 7 * math.tau
        plate((sign * (sx + 0.05), arm_y, 0), (sign * 0.6, math.cos(a0), math.sin(a0)), 0.22, 0.14)
    # The arms: plates all round the upper arm and forearm, the forearm's heavier, outside more than in.
    elbow, wrist = sx + p["arm"] * 0.52, sx + p["arm"]
    ring((sign * (sx + 0.15), arm_y, 0), (sign * elbow, arm_y, 0), 3, 6, 0.17, 0.12)
    ring((sign * elbow, arm_y, 0), (sign * (wrist - 0.05), arm_y, 0), 3, 6, 0.19, 0.14)
    # The fist: one great knotted boulder and knuckle stones round its end.
    fist = at(sign * (wrist + 0.16), arm_y, 0.0)
    hand = f"hand_{'l' if sign > 0 else 'r'}"
    chunk(m, fist, (0.3, 0.3, 0.3), hand, facets(ROCKS[2]), rng, points=24, turn=Quaternion((1, 0, 0), rng.uniform(0, 3)))
    for k in range(5):
        a0 = k / 5 * math.tau + 0.3
        c = fist + at(sign * 0.2, 0.17 * math.cos(a0), 0.17 * math.sin(a0) + 0.04)
        chunk(m, c, (0.16, 0.14, 0.13), hand, facets(rng.choice(ROCKS)), rng, points=13, turn=Quaternion((0, 1, 0), rng.uniform(0, 3)))
    for k in range(3):
        c = fist + at(sign * rng.uniform(-0.1, 0.05), rng.uniform(-0.2, 0.2), rng.uniform(-0.28, 0.28))
        chunk(m, c, (0.15, 0.13, 0.12), hand, facets(rng.choice(ROCKS)), rng, points=12)
    # The legs: thick plated columns; flat slabs of feet.
    side = "l" if sign > 0 else "r"
    ring((sign * hx, hips - 0.1, 0), (sign * hx, hips * 0.52, 0.02), 2, 6, 0.2, 0.13)
    ring((sign * hx, hips * 0.52, 0.02), (sign * hx, 0.25, 0), 2, 6, 0.19, 0.13)
    chunk(m, at(sign * hx, hips * 0.52 + 0.05, 0.22), (0.2, 0.17, 0.15), f"calf_{side}", facets(ROCKS[0]), rng, points=14)
    chunk(m, at(sign * hx, 0.11, 0.06), (0.24, 0.32, 0.12), f"foot_{side}", facets(ROCKS[2]), rng, points=18)
    for k in range(3):
        c = at(sign * hx + (k - 1) * 0.12, 0.08, 0.36)
        chunk(m, c, (0.09, 0.1, 0.08), f"ball_{side}", facets(rng.choice(ROCKS)), rng, points=11)

# The head: a crude mass of stone. A heavy overhanging brow, cheekstones, a jutting jaw, a craggy crown.
chunk(m, at(0, 2.73, 0.62), (0.33, 0.16, 0.1), "Head", facets(ROCKS[1]), rng, points=18, turn=Quaternion((1, 0, 0), -0.35))
for sign in (1, -1):
    chunk(m, at(sign * 0.13, 2.76, 0.64), (0.12, 0.09, 0.08), "Head", facets(ROCKS[3]), rng, points=12, turn=Quaternion((0, 1, 0), sign * 0.4))
    chunk(m, at(sign * 0.2, 2.53, 0.56), (0.11, 0.13, 0.12), "Head", facets(rng.choice(ROCKS)), rng, points=12)
    chunk(m, at(sign * 0.25, 2.66, 0.4), (0.1, 0.16, 0.14), "Head", facets(rng.choice(ROCKS)), rng, points=12)
chunk(m, at(0, 2.38, 0.6), (0.2, 0.13, 0.08), "Head", facets(ROCKS[2]), rng, points=16, turn=Quaternion((1, 0, 0), 0.3))
for k in range(5):
    a0 = k / 5 * math.pi + rng.uniform(-0.2, 0.2)
    plate((0, 2.62, 0.4), (math.cos(a0) * 0.8, 1.0, -0.3 + math.sin(a0) * 0.2), 0.14, 0.1, bone="Head", group="head")
for sign in (1, -1):
    # The eyes: two dim amber lights deep in the hollows under the brow.
    m.sphere(at(sign * 0.105, 2.615, 0.63), (0.042, 0.03, 0.036), EYE, "Head", segments=8, rings=6)

# Crystals: dull clusters grown out of the cracks on the back, over a shoulder and along one forearm.
for origin, direction, count in (
    ((0.25, arm_y - 0.25, 0), (0.7, 0.4, -1), 4),
    ((-0.3, arm_y - 0.55, 0), (-0.6, 0.1, -1), 3),
    ((0.55, arm_y + 0.15, 0), (0.3, 1, -0.6), 3),
    ((-sx - 0.6, arm_y, 0), (-0.1, 1, -0.4), 3),
    ((0.1, hips + 0.35, 0.1), (0.3, -0.2, -1), 2),
):
    o, d = at(*origin), at(*direction).normalized()
    root = surface(m, o, d)
    for k in range(count):
        lean = (d + Vector((rng.uniform(-0.5, 0.5), rng.uniform(-0.5, 0.5), rng.uniform(-0.2, 0.5)))).normalized()
        base = root + Vector((rng.uniform(-0.06, 0.06), rng.uniform(-0.06, 0.06), rng.uniform(-0.04, 0.04))) - d * 0.05
        length = rng.uniform(0.18, 0.34) * (1.3 if k == 0 else 1.0)
        m.cone(base, base + lean * length, rng.uniform(0.04, 0.065), rng.choice(CRYSTAL), nearest_bone(base), segments=6, smooth=False)


# ── Actions: a slow heavy idle, a lumbering walk, and a double-fisted slam ──
actions = humanoid_actions(arm_down=66, walk_swing=17, step=40)
attack = []
for frame, swing, bend, lean, knee in ((1, -8, 10, 0, 0), (12, -168, 20, -12, 4), (16, -172, 24, -14, 6), (22, -55, 0, 26, 22), (27, -50, 0, 28, 24), (40, -8, 10, 0, 0)):
    pose = {}
    for side, sign in (("l", 1), ("r", -1)):
        inward = turn("x", lean) @ turn("z", -sign * (14 if swing < -100 else 6))
        pose[f"upperarm_{side}"] = inward @ turn("x", swing) @ turn("y", sign * 66)
        pose[f"lowerarm_{side}"] = inward @ turn("x", swing - bend) @ turn("y", sign * 66)
        pose[f"hand_{side}"] = pose[f"lowerarm_{side}"]
        pose[f"thigh_{side}"] = turn("x", -knee)
        pose[f"calf_{side}"] = turn("x", knee * 0.6)
        pose[f"foot_{side}"] = turn("x", 0)
    pose["spine_01"] = turn("x", lean * 0.4)
    pose["spine_02"] = turn("x", lean * 0.8)
    pose["spine_03"] = turn("x", lean)
    pose["Head"] = turn("x", lean * 0.4)
    attack.append((frame, pose))
actions["Attack"] = attack

m.finish(actions, bake={"size": 512, "ao": 0.3, "mottle": 0.14, "mottle_scale": 14, "dirt": 0.45, "head_scale": 1.6})
mesh = next(o for o in m.armature.children if o.type == "MESH")
print(f"earth_elemental: {max(v.co.z for v in mesh.data.vertices):.2f} m tall (rest pose)")
