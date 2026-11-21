"""Earth elemental (SRD: Large elemental): a hulking man-shape of jagged rock and packed earth about 3.2 metres
tall, hunched, its head sunk low and forward between two great boulder shoulders, its long arms hanging to
fists of rock bigger than its head, on short thick legs. Its hide is split into faceted plates of grey-brown
stone, each tilted its own way, with dark packed soil in the cracks between them; boulders crown its
shoulders and knot its elbows, knees and fists, a broken ridge of stones runs down its back, dull crystals
grow out of the cracks, moss clings to the stones on top, and its face is a crude mass of stone under a
heavy brow, two dim amber lights deep in its hollows. On the people's skeleton. Writes
assets/models/earth_elemental.glb. Run (BLENDER: your Blender executable):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_earth_elemental.py
"""

import math
import os
import random
import sys

import bpy
from mathutils import Quaternion, noise

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wwblend import Vector, _segment_distance, at, humanoid_actions, humanoid_joints, shade, turn  # noqa: E402
from wwcreature import surface  # noqa: E402
from wwelemental import Elemental, chunk  # noqa: E402

bpy.ops.wm.read_factory_settings(use_empty=True)
rng = random.Random(11)

SOIL = 0x33271C
SOIL_DARK = 0x1E160E
VEIN = 0x7C7466
ROCKS = [0x5E574D, 0x66625C, 0x504A42, 0x726658, 0x585A56, 0x645A4C, 0x4C4E4C]
MOSS = [0x46542E, 0x3A4728, 0x55603A]
CRYSTAL = [0x8FA6A8, 0xA4B4B0, 0x7A9096]
EYE_HOLLOW = 0x120D0A
EYE = 0xF0A040

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
m = Elemental("earth_elemental", resolution=0.024, faces=7000)
m.group("head", resolution=0.018, faces=1300, bone="Head")
rig = m.rig(humanoid_joints(p))
BONES = {b.name: (b.head_local.copy(), b.tail_local.copy()) for b in rig.data.bones}

hips = p["leg"]
arm_y = hips + p["torso"] * 0.88
sx, hx = p["shoulders"] / 2, p["hips"] / 2
elbow_x, wrist_x = sx + p["arm"] * 0.52, sx + p["arm"]
knee_y = hips * 0.52
HY, HZ = 2.68, 0.64  # the head's middle: up, forward


def ell(c, radii, colour=SOIL, group="body"):  # radii (across, up, front to back)
    m.ellipsoid(at(*c), (radii[0], radii[2], radii[1]), colour, group=group)


def cap(a, b, r, colour=SOIL):
    m.capsule(at(*a), at(*b), r, colour)


# ── The body: a barrel chest leaning forward over a heavy belly, a hump of back between the shoulders,
# long arms with forearms thicker than the upper arms, short heavy legs. ──
ell((0, hips + 0.02, 0), (0.45, 0.26, 0.34))
ell((0, hips + 0.42, 0.06), (0.52, 0.36, 0.42))
ell((0, hips + 0.92, 0.14), (0.66, 0.5, 0.5))
ell((0, arm_y - 0.06, -0.08), (0.6, 0.32, 0.42))
ell((0, arm_y + 0.12, -0.1), (0.42, 0.22, 0.32))
for sign in (1, -1):
    m.ball(at(sign * (sx - 0.04), arm_y + 0.04, -0.02), 0.4, SOIL)
    cap((sign * sx, arm_y, 0), (sign * elbow_x, arm_y, 0), 0.25)
    m.ball(at(sign * elbow_x, arm_y, -0.03), 0.27, SOIL)
    cap((sign * (elbow_x + 0.1), arm_y, 0), (sign * (wrist_x - 0.1), arm_y, 0), 0.3)
    cap((sign * hx, hips - 0.05, 0), (sign * hx, knee_y, 0.02), 0.31)
    cap((sign * hx, knee_y, 0.02), (sign * hx, 0.24, 0), 0.28)
    ell((sign * hx, 0.13, 0.08), (0.26, 0.14, 0.34))
ell((0, HY, HZ), (0.27, 0.24, 0.26), group="head")
ell((0, HY - 0.14, HZ + 0.1), (0.22, 0.13, 0.2), group="head")
for sign in (1, -1):
    # The hollows the eyes glow in.
    m.ball(at(sign * 0.105, HY + 0.01, HZ + 0.25), 0.075, EYE_HOLLOW, negative=True, group="head")
# A crude mouth: a dark slot under the brow.
m.capsule(at(-0.1, HY - 0.17, HZ + 0.27), at(0.1, HY - 0.16, HZ + 0.27), 0.04, EYE_HOLLOW, negative=True, group="head")


# ── The hide: split into plates of stone. Each cell of a Voronoi pattern is pressed flat into a plane of
# its own, tilted and raised at random; the cracks between them sink into dark soil. ──
K = 2.0  # (cells about half a metre across)
CELLS = {}


def cell(co):
    d, pts = noise.voronoi(co * K, distance_metric="DISTANCE", exponent=2.5)
    return tuple(round(c, 3) for c in pts[0]), d[1] - d[0]


def fracture(mesh):
    found = []
    sums = {}
    for v in mesh.vertices:
        key, edge = cell(v.co)
        found.append((key, edge))
        s = sums.setdefault(key, [Vector(), Vector(), 0])
        s[0] += v.co
        s[1] += v.normal
        s[2] += 1
    for key, (total, normals, n) in sums.items():
        r = random.Random(hash(key))
        normal = normals.normalized()
        tilt = (normal + Vector((r.uniform(-0.3, 0.3), r.uniform(-0.3, 0.3), r.uniform(-0.3, 0.3)))).normalized()
        CELLS[key] = (total / n, normal, tilt, r.uniform(-0.01, 0.05), r.choice(ROCKS), r.random())
    for v, (key, edge) in zip(mesh.vertices, found):
        centre, normal, tilt, lift, _rock, _k = CELLS[key]
        if normal.length < 0.5:
            continue
        flat = v.co - tilt * (v.co - centre).dot(tilt) + normal * lift
        trust = max(0.0, v.normal.dot(normal)) ** 0.5
        crack = max(0.0, 1 - edge / 0.15)
        v.co = v.co.lerp(flat, 0.9 * trust) - v.normal * 0.06 * crack**1.5


def paint(q, colour):
    if colour == EYE_HOLLOW:
        return colour
    key, edge = cell(q)
    if edge < 0.09 or key not in CELLS:
        return SOIL_DARK if edge < 0.05 else SOIL
    _centre, normal, tilt, _lift, rock, k = CELLS[key]
    face = abs(q.x) < 0.3 and q.y < -HZ + 0.05 and q.z < HY + 0.12
    if tilt.z > 0.5 and q.z > 2.3 and abs(q.x) < sx + 0.3 and k < 0.75 and not face:
        return MOSS[int(k * 10) % 3]
    if k > 0.94:
        return VEIN
    return shade(rock, (0.82, 0.92, 1.0, 1.1)[int(k * 4) % 4])


m.reshape["body"] = fracture
m.reshape["head"] = fracture
m.paint = paint
m.sharp = 30


# ── Boulders: crowning the shoulders, knotting the elbows, knees and fists, a ridge down the back, the
# stones of the face; each on the bone it moves with. Rubble wedged in the cracks. ──


def nearest_bone(c):
    return min(BONES, key=lambda n: _segment_distance(c, *BONES[n]) + (0.25 if n.startswith("ball") else 0.0))


def facets(base, moss=True):
    def colour(c, n):
        top = moss and n.z > 0.45 and c.z > 2.3 and abs(c.x) < sx + 0.4
        if top and noise.noise(c * 2.2) > -0.45:
            return rng.choice(MOSS)
        k = rng.uniform(0.86, 1.1) * (0.8 if n.z < -0.35 else 1.0) * (1.08 if n.z > 0.5 else 1.0)
        return shade(base, min((0.82, 0.92, 1.0, 1.1), key=lambda s: abs(s - k)))

    return colour


def rock(c, radii, bone=None, tilt=None, base=None, points=20, moss=True, boxy=True):
    """A boulder at `c` (game coordinates), `radii` (across, up, front to back), turned by `tilt`
    ((axis, degrees) in Blender's space) and on `bone` (the nearest when not given)."""
    centre = at(*c)
    q = Quaternion() if tilt is None else Quaternion(Vector(tilt[0]), math.radians(tilt[1]))
    chunk(m, centre, (radii[0], radii[2], radii[1]), bone or nearest_bone(centre), facets(base or rng.choice(ROCKS), moss), rng, points=points, turn=q, flat=0.1, boxy=boxy)


def jitter(k=8):
    return ((rng.uniform(-1, 1), rng.uniform(-1, 1), 1), rng.uniform(-k, k))


# The back: a hump of rock between the shoulders and a broken ridge of upright stones down the spine.
rock((0, arm_y + 0.2, -0.22), (0.3, 0.2, 0.26), "spine_03", ((1, 0, 0), -25))
for i, y in enumerate((arm_y + 0.02, hips + 0.95, hips + 0.68, hips + 0.4)):
    rock((rng.uniform(-0.05, 0.05), y, -0.55 + 0.04 * i), (0.13, 0.2, 0.17), None, ((1, 0, 0), -35 + rng.uniform(-10, 10)), points=12)
rock((0.28, hips + 0.8, -0.44), (0.14, 0.16, 0.12), None, jitter(30), points=10)

for sign in (1, -1):
    side = "l" if sign > 0 else "r"
    # The shoulders: a great boulder crowning each, rising past the head, a second wedged behind it.
    rock((sign * (sx - 0.02), arm_y + 0.3, -0.04), (0.32, 0.26, 0.3), f"clavicle_{side}", ((0.3, 0.2, 1), sign * 35), ROCKS[1], points=36, boxy=False)
    rock((sign * (sx + 0.08), arm_y + 0.5, -0.1), (0.14, 0.2, 0.12), f"clavicle_{side}", ((0, 1, 0.3), sign * 25), ROCKS[4], points=12)
    rock((sign * (sx - 0.18), arm_y + 0.46, 0.08), (0.12, 0.16, 0.12), f"clavicle_{side}", ((1, 0.2, 0), 20), ROCKS[5], points=12)
    rock((sign * (sx - 0.25), arm_y + 0.26, -0.3), (0.2, 0.18, 0.18), f"clavicle_{side}", jitter(30), ROCKS[3])
    rock((sign * (sx + 0.32), arm_y + 0.12, 0.02), (0.2, 0.18, 0.24), f"upperarm_{side}", jitter(), ROCKS[0])
    # The elbows: a knot of stone; a jagged ridge of rock along the top of each forearm.
    rock((sign * (elbow_x + 0.02), arm_y + 0.04, -0.2), (0.18, 0.18, 0.16), f"lowerarm_{side}", jitter(30), ROCKS[2])
    for k in range(3):
        rock((sign * (elbow_x + 0.18 + 0.2 * k), arm_y + 0.27, rng.uniform(-0.05, 0.05)), (0.12, 0.1 + 0.03 * (k == 1), 0.12), f"lowerarm_{side}", jitter(25), points=10)
    # The fist: one great knotted boulder bigger than the head, knuckle stones round its end.
    hand = f"hand_{side}"
    fist = (sign * (wrist_x + 0.16), arm_y - 0.02, 0.02)
    rock(fist, (0.3, 0.31, 0.31), hand, ((1, 0, 0), rng.uniform(0, 40)), ROCKS[2], points=34, moss=False, boxy=False)
    for k in range(4):
        z = -0.16 + 0.107 * k
        rock((fist[0] + sign * 0.25, fist[1] - 0.1 + 0.04 * (k % 2), fist[2] + z * 1.2), (0.11, 0.12, 0.1), hand, jitter(20), moss=False, points=12, boxy=False)
    rock((fist[0] + sign * 0.05, fist[1] + 0.12, fist[2] + 0.26), (0.13, 0.12, 0.11), hand, jitter(), moss=False, points=12, boxy=False)
    # The legs: a cap of rock over each knee, a stone on the outer thigh, broad slabs of feet.
    rock((sign * (hx + 0.12), hips - 0.22, -0.02), (0.18, 0.24, 0.22), f"thigh_{side}", jitter(15), ROCKS[4])
    rock((sign * (hx + 0.04), knee_y + 0.02, 0.24), (0.18, 0.16, 0.14), f"calf_{side}", ((1, 0, 0), 20), ROCKS[3])
    rock((sign * (hx + 0.03), 0.15, 0.12), (0.2, 0.13, 0.32), f"foot_{side}", ((0, 0, 1), sign * 8), ROCKS[2], moss=False)
    for k in range(3):
        rock((sign * (hx + 0.03) + (k - 1) * 0.12, 0.07, 0.44), (0.07, 0.07, 0.08), f"ball_{side}", jitter(30), moss=False, points=6)

# The head: a crude mass of stone. A heavy overhanging brow, cheekstones, a jutting jaw, a craggy crown.
rock((0, HY + 0.15, HZ + 0.15), (0.29, 0.085, 0.14), "Head", ((1, 0, 0), 14), ROCKS[1], points=22, moss=False)
for sign in (1, -1):
    rock((sign * 0.17, HY + 0.17, HZ + 0.16), (0.11, 0.08, 0.1), "Head", ((0, 1, 0), sign * 22), ROCKS[3], points=8, moss=False)
    rock((sign * 0.27, HY - 0.15, HZ + 0.06), (0.08, 0.1, 0.09), "Head", jitter(20), points=10, moss=False)
rock((0, HY - 0.28, HZ + 0.14), (0.19, 0.09, 0.15), "Head", ((1, 0, 0), -12), ROCKS[2], points=14, moss=False)
rock((0.04, HY + 0.25, HZ - 0.08), (0.2, 0.1, 0.2), "Head", jitter(30), ROCKS[0], points=14)
for sign in (1, -1):
    # The eyes: two dim amber lights deep in the hollows under the brow.
    m.sphere(at(sign * 0.11, HY + 0.01, HZ + 0.24), (0.06, 0.042, 0.045), EYE, "Head", segments=8, rings=6)

# Rubble: small stones wedged in the soil between the plates.
for _ in range(40):
    region = rng.random()
    a0 = rng.uniform(0, math.tau)
    if region < 0.55:
        o = (rng.uniform(-0.2, 0.2), rng.uniform(hips - 0.1, arm_y + 0.1), 0.05)
        d = (math.sin(a0), rng.uniform(-0.3, 0.3), math.cos(a0))
    elif region < 0.8:
        o = (rng.choice((1, -1)) * rng.uniform(sx + 0.1, wrist_x), arm_y, 0)
        d = (0, math.cos(a0), math.sin(a0))
    else:
        o = (rng.choice((1, -1)) * hx, rng.uniform(0.25, hips - 0.1), 0)
        d = (math.sin(a0), 0, math.cos(a0))
    q = surface(m, at(*o), at(*d).normalized())
    r = rng.uniform(0.05, 0.09)
    chunk(m, q, (r, r * 0.8, r * 0.7), nearest_bone(q), facets(rng.choice(ROCKS), False), rng, points=6, turn=Quaternion((rng.random(), rng.random(), rng.random()), rng.uniform(0, 3)), boxy=True)

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
        length = rng.uniform(0.24, 0.42) * (1.3 if k == 0 else 1.0)
        m.cone(base, base + lean * length, rng.uniform(0.05, 0.08), rng.choice(CRYSTAL), nearest_bone(base), segments=6, smooth=False)


# ── Actions: a slow heavy idle, a lumbering walk, and a double-fisted slam ──
actions = humanoid_actions(arm_down=66, walk_swing=17, step=40)
attack = []
for frame, swing, bend, lean, knee in ((1, -8, 10, 0, 0), (12, -168, 20, -12, 4), (16, -172, 24, -14, 6), (22, -55, 0, 26, 22), (27, -50, 0, 28, 24), (40, -8, 10, 0, 0)):
    pose = {}
    for side, sign in (("l", 1), ("r", -1)):
        # Both arms up over the head, the fists drawn in together, then brought down as the back bends.
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

m.finish(actions, bake={"size": 512, "ao": 0.3, "mottle": 0.12, "mottle_scale": 14, "dirt": 0.45, "head_scale": 1.6})
mesh = next(o for o in m.armature.children if o.type == "MESH")
print(f"earth_elemental: {max(v.co.z for v in mesh.data.vertices):.2f} m tall (rest pose)")
