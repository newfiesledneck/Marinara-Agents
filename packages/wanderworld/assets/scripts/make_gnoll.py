"""Gnoll (SRD: Medium monstrosity): a spotted hyena on two legs, about two metres tall, hunched and lanky,
with a hyena's heavy forequarters and thin hindquarters; a large, rounded head with a thick, blunt muzzle
black at the end, rounded upright ears, amber eyes, fangs and a short, bristly dark mane from the crown down
the neck and back; tan fur with dark spots; a crude leather harness, a cord of bones and teeth, a ragged
loincloth and a spear. Writes assets/models/gnoll.glb. Run (BLENDER: your Blender executable):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_gnoll.py
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

FUR = 0xB8975E
BELLY = 0xC9AE7C
SPOT = 0x6A5234
MANE = 0x2E241A
MASK = 0x32281E
NOSE = 0x141010
LIPS = 0x241A14
INNER = 0x5A4636
LEATHER = 0x5A4230
STRAP = 0x3A2A1C
CLOTH = 0x5E4C38
BONE = 0xDCD2B8
TEETH = 0xE2D8BC
p = {
    "leg": 1.0,
    "torso": 0.68,
    "neck": 0.14,
    "shoulders": 0.46,
    "hips": 0.21,
    "arm": 0.8,
    "thick": 1.15,
    "chest": (0.23, 0.175),
    "waist": (0.13, 0.105),
    "hunch": 0.3,
    "hand": 1.2,
    "foot": 1.35,
    "toes": 1.5,
    "fingers": 1.3,
    "claws": True,
}
m = Model("gnoll", resolution=0.013, faces=4600)
m.group("head", resolution=0.0065, faces=3400, bone="Head")
m.rig(humanoid_joints(p))
b = humanoid_body(m, p, {"skin": FUR, "nails": 0x2A2018})
s, t, arm_y, sx, hx, chest_y, knee = b["s"], b["t"], b["arm_y"], b["sx"], b["hx"], b["chest_y"], b["knee"]
hips = p["leg"]
(chest_x, chest_z), (waist_x, waist_z) = p["chest"], p["waist"]
hunch = p["hunch"]
elbow, wrist = p["arm"] * 0.52, p["arm"]
hy = b["head_y"] + 0.07
hz = hunch + 0.03
K = 1.25  # the head's measures below are for a head this much smaller
PITCH = math.radians(-4)  # the muzzle lifted a little
rng = random.Random(7)
SIDES = (("l", 1), ("r", -1))


def ell(c, across, up, depth, colour=FUR, negative=False, group="body"):
    m.ellipsoid(at(*c), (across, depth, up), colour, negative, group=group)


def ball(c, r, colour=FUR, negative=False, group="body"):
    m.ball(at(*c), r, colour, negative, group=group)


def cap(a, c, r, colour=FUR, negative=False, group="body"):
    m.capsule(at(*a), at(*c), r, colour, negative, group=group)


def hd(x, up, fwd):
    """A point on the head, from its centre (scaled by K, the muzzle tipped down by PITCH)."""
    up, fwd = up * math.cos(PITCH) - fwd * math.sin(PITCH), fwd * math.cos(PITCH) + up * math.sin(PITCH)
    return (x * K, hy + up * K, hz + fwd * K)


def hell(c, across, up, depth, colour=FUR, negative=False):
    ell(hd(*c), across * K, up * K, depth * K, colour, negative, group="head")


def hball(c, r, colour=FUR, negative=False):
    ball(hd(*c), r * K, colour, negative, group="head")


def hcap(a, c, r, colour=FUR, negative=False):
    cap(hd(*a), hd(*c), r * K, colour, negative, group="head")


# ── Finding the skin, so fur, spots and straps sit on it ──


def field(q, group):
    """The metaballs' field at q (Blender coordinates): the skin is where it falls to THRESHOLD."""
    total = 0.0
    for e in m.elements:
        if e[4] == group:
            f = m._field(q, e)
            total += -STIFF * f if e[3] else STIFF * f
    return total


def surface(origin, toward, group="body", reach=0.8):
    """Where a ray from `origin` (game coordinates, inside the skin) towards `toward` comes out through the
    skin: the point and the skin's outward normal there, in Blender's coordinates (None if it never
    comes out near enough: the ray ran down a limb)."""
    o = at(*origin)
    d = (at(*toward) - o).normalized()
    r, step = 0.0, 0.01
    while field(o + d * (r + step), group) > THRESHOLD:
        r += step
        if r > reach:
            return None, None
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
    """A lock of coarse fur (Blender coordinates): rooted under the skin at `root`, rising off it by `lift`
    and lying along `lie`, flat, tapering to a point."""
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


def fur(origin, toward, lie, length, width, colours, bone, n=3, group="body", lift=1.0, reach=0.4):
    """A clump of `n` locks fanned out where the ray from `origin` towards `toward` meets the skin, lying
    along `lie` (Blender's coordinates), the middle one longest: a jagged tuft."""
    q, normal = surface(origin, toward, group, reach)
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


def bristles(origin, toward, lean, length, width, colours, bone, n=3, group="body"):
    """A clump of `n` stiff bristles of the mane standing up off the skin where the ray from `origin`
    towards `toward` meets it, leaning along `lean` (Blender's coordinates), fanned out to the sides."""
    q, normal = surface(origin, toward, group, 0.4)
    if q is None:
        return
    lean = Vector(lean).normalized()
    side = normal.cross(lean)
    if side.length < 1e-4:
        side = normal.orthogonal()
    side.normalize()
    colour = rng.choice(colours)
    for i in range(n):
        spread = i - (n - 1) / 2
        d = (normal * 0.7 + lean * 0.7 + side * spread * 0.35).normalized()
        base = q + side * spread * width * 1.4 - normal * 0.012
        reach = length * (1 - 0.18 * abs(spread)) * rng.uniform(0.85, 1.1)
        m.cone(base, base + d * reach, width, colour, bone, segments=3, flat=0.45, facing=side.cross(d))


def spot(origin, toward, r, colour, bone, group="body", reach=0.45):
    """A dark spot on the fur: a thin, slightly domed, uneven patch lying on the skin."""
    q, n = surface(origin, toward, group, reach)
    if q is None:
        return
    if bone.startswith("spine") and abs(q.x) > sx:
        bone = "upperarm_l" if q.x > 0 else "upperarm_r"
    a = n.orthogonal().normalized()
    c = n.cross(a)
    verts = [q + n * 0.0035]
    for i in range(7):
        ang = 2 * math.pi * i / 7
        wobble = rng.uniform(0.6, 1.0)
        verts.append(q + (a * math.cos(ang) * 1.08 + c * math.sin(ang) * 0.9) * r * wobble - n * 0.001)
    faces = [[0, 1 + i, 1 + (i + 1) % 7] for i in range(7)]
    m.parts.append((verts, faces, colour, bone, True))


def strap(rays, bone_of, width=0.04, thick=0.012, colour=STRAP, closed=False):
    """A flat strap lying on the skin: through where each ray ((origin, toward), game coordinates) comes
    out through it, laid in boxes from one to the next."""
    on = []
    for origin, toward in rays:
        hit, normal = surface(origin, toward)
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


def ear(base, tip, width, thick, colour, inner, bone, facing, cup):
    """A rounded, upright ear (Blender coordinates): a paddle from `base` to its round top, its front
    (towards `facing`) hollowed by `cup` into a bowl, darker inside."""
    along = tip - base
    length = along.length
    along.normalize()
    nrm = Vector(facing) - along * Vector(facing).dot(along)
    nrm.normalize()
    side = nrm.cross(along)
    rows, cols = 6, 5
    front, back = [], []
    for i in range(rows):
        u = i / rows
        w = width / 2 * math.sqrt(max(0.0, 1 - ((u - 0.4) / 0.6) ** 2))
        fr, bk = [], []
        for j in range(cols):
            v = -1 + 2 * j / (cols - 1)
            c = base + along * length * u + side * w * v
            hollow = nrm * cup * w * (1 - v * v) * (1 - u * 0.4)
            fr.append(c + nrm * thick * 0.5 - hollow)
            bk.append(c - nrm * thick * 0.5 - hollow * 0.6)
        front.append(fr)
        back.append(bk)
    verts = [v for row in front for v in row] + [v for row in back for v in row] + [base + along * length]
    nb = rows * cols
    top = len(verts) - 1
    faces, colours = [], []

    def f(i, j):
        return i * cols + j

    for i in range(rows - 1):
        for j in range(cols - 1):
            faces.append([f(i, j), f(i, j + 1), f(i + 1, j + 1), f(i + 1, j)])
            colours.append(inner if 0 < j < cols - 2 or i > 0 else colour)
            faces.append([nb + f(i, j), nb + f(i + 1, j), nb + f(i + 1, j + 1), nb + f(i, j + 1)])
            colours.append(colour)
    for j in range(cols - 1):
        faces.append([f(rows - 1, j), f(rows - 1, j + 1), top])
        colours.append(inner)
        faces.append([nb + f(rows - 1, j + 1), nb + f(rows - 1, j), top])
        colours.append(colour)
    # The rim: the two sides and the base.
    for i in range(rows - 1):
        for j in (0, cols - 1):
            a, c = f(i, j), f(i + 1, j)
            faces.append([a, c, nb + c, nb + a] if j == 0 else [c, a, nb + a, nb + c])
            colours.append(colour)
    for j in (0, cols - 1):
        a = f(rows - 1, j)
        faces.append([a, top, nb + a] if j == 0 else [top, a, nb + a])
        colours.append(colour)
    for j in range(cols - 1):
        faces.append([f(0, j + 1), f(0, j), nb + f(0, j), nb + f(0, j + 1)])
        colours.append(colour)
    m.parts.append((verts, faces, colours, bone, True))


# ── The head: large and rounded, a high crown, heavy jaw muscles bulging at the sides; a thick, deep,
# blunt muzzle, black towards the end; dark round the amber eyes; a mouth that runs far back; fangs. ──
hell((0, 0.04, -0.04), 0.096, 0.09, 0.1)
hell((0, 0.05, 0.035), 0.076, 0.055, 0.066)
for sign in (1, -1):
    hell((sign * 0.066, -0.005, -0.005), 0.048, 0.066, 0.066)
    hball((sign * 0.052, -0.032, 0.065), 0.04)
    # Eye sockets under a low brow, and the dark patch round each eye.
    hball((sign * 0.044, 0.034, 0.088), 0.016, MASK, negative=True)
    hell((sign * 0.046, 0.03, 0.083), 0.03, 0.022, 0.022, shade(FUR, 0.62))
    hcap((sign * 0.024, 0.05, 0.094), (sign * 0.062, 0.052, 0.077), 0.0095, shade(FUR, 0.95))
    # Nostrils.
    hball((sign * 0.009, 0.0, 0.222), 0.0055, NOSE, negative=True)
# The muzzle: deep, broad and blunt, darkening from halfway along to black at the end.
hcap((0, 0.028, 0.075), (0, 0.002, 0.172), 0.045, shade(FUR, 0.85))
hell((0, -0.03, 0.13), 0.055, 0.056, 0.075, shade(FUR, 0.8))
hell((0, -0.024, 0.165), 0.05, 0.048, 0.03, shade(FUR, 0.6))
hell((0, -0.022, 0.186), 0.043, 0.04, 0.03, MASK)
hcap((0, 0.012, 0.16), (0, 0.006, 0.195), 0.03, shade(MASK, 1.25))
hell((0, 0.002, 0.212), 0.021, 0.013, 0.011, NOSE)
# The lower jaw, strong and a little behind the upper; the mouth line running far back.
hell((0, -0.07, 0.11), 0.048, 0.026, 0.085, shade(FUR, 0.82))
hell((0, -0.072, 0.15), 0.04, 0.021, 0.03, shade(FUR, 0.6))
hell((0, -0.074, 0.175), 0.034, 0.019, 0.032, MASK)
for sign in (1, -1):
    hcap((0, -0.054, 0.214), (sign * 0.044, -0.056, 0.15), 0.006, LIPS, negative=True)
    hcap((sign * 0.044, -0.056, 0.15), (sign * 0.054, -0.05, 0.08), 0.006, LIPS, negative=True)
# The short mane rising from the crown, under its bristles.
hcap((0, 0.112, 0.005), (0, 0.075, -0.1), 0.026, MANE)

for sign in (1, -1):
    # Amber eyes.
    eye = at(*hd(sign * 0.042, 0.032, 0.076))
    m.sphere(eye, (0.012 * K, 0.0095 * K, 0.0105 * K), 0xD08A22, "Head", segments=10, rings=8)
    m.sphere(eye + Vector((sign * 0.001, -0.0098 * K, 0)), (0.0045 * K, 0.002 * K, 0.0058 * K), 0x140A06, "Head", segments=8, rings=6)
    # Rounded ears standing up from the top of the head, dark inside.
    base, tip = at(*hd(sign * 0.064, 0.08, -0.05)), at(*hd(sign * 0.105, 0.165, -0.075))
    ear(base, tip, 0.068 * K, 0.012 * K, FUR, INNER, "Head", Vector((sign * 0.55, -1, 0.15)), cup=0.35)
    # Fangs, top and bottom, just past the lips.
    root = at(*hd(sign * 0.028, -0.052, 0.198))
    m.cone(root, root + Vector((0, -0.003, -0.028 * K)), 0.008 * K, TEETH, "Head", segments=5)
    root = at(*hd(sign * 0.026, -0.064, 0.178))
    m.cone(root, root + Vector((0, -0.003, 0.022 * K)), 0.007 * K, TEETH, "Head", segments=5)
    root = at(*hd(sign * 0.042, -0.056, 0.15))
    m.cone(root, root + Vector((0, 0, -0.012 * K)), 0.005 * K, TEETH, "Head", segments=4)

# Bristles of the mane along the crown, standing up and back; rough fur on the cheeks.
centre = hd(0, 0.0, -0.01)
for k in range(9):
    fwd = 0.06 - k * 0.032
    toward = hd(0, 0.2 - max(0, k - 6) * 0.08, fwd - max(0, k - 6) * 0.06)
    bristles(centre, toward, (0, 1, 0.15), 0.07 + k * 0.006, 0.014, (MANE, shade(MANE, 1.25)), "Head", n=4, group="head")
for sign in (1, -1):
    for k in range(3):
        toward = hd(sign * 0.2, -0.03 - k * 0.03, -0.02 + k * 0.02)
        fur(centre, toward, (sign * 0.3, 0.6, -1), 0.06, 0.011, (FUR, shade(FUR, 0.9)), "Head", n=3, group="head")

# ── The body: a long neck thick at its root, heavy shoulders and chest over a thin waist and narrow hips,
# a hunched back sloping down from the shoulders; long, lean, sinewy arms; thin legs, the heel lifted. ──
ell((0, arm_y + 0.02, hunch * 0.45), 0.11, 0.11, 0.11)
cap((0, arm_y + 0.04, hunch * 0.4), (0, b["head_y"] - 0.02, hunch * 0.92), 0.088)
ell((0, arm_y - 0.04, -0.06 + hunch * 0.2), 0.18, 0.13, 0.1)
ell((0, chest_y + 0.02, waist_z * 0.5), waist_x * 0.9, 0.12, waist_z * 0.8, BELLY)
ell((0, chest_y + 0.17, hunch * 0.2 + chest_z * 0.55), 0.06, 0.1, 0.05, BELLY)
for sign in (1, -1):
    ell((sign * 0.09, arm_y + 0.035, hunch * 0.22 - 0.02), 0.1, 0.07, 0.09)
    # Sinewy arms: a round deltoid, the biceps and triceps, a knotty elbow, a forearm thick below the
    # elbow and tapering to a bony wrist.
    ell((sign * (sx + 0.025), arm_y + 0.015, 0.0), 0.08, 0.072, 0.074)
    ell((sign * (sx + elbow * 0.5), arm_y + 0.004, 0.026), elbow * 0.28, 0.038, 0.034)
    ell((sign * (sx + elbow * 0.55), arm_y + 0.008, -0.02), elbow * 0.3, 0.038, 0.034)
    ball((sign * (sx + elbow), arm_y + 0.005, -0.03), 0.028)
    ell((sign * (sx + elbow + 0.07), arm_y + 0.012, 0.0), 0.08, 0.044, 0.042)
    ell((sign * (sx + elbow + 0.1), arm_y - 0.012, 0.012), 0.08, 0.03, 0.034)
    # Lean, corded legs: the long front thigh muscle, the hamstrings behind, a bony knee, a high calf.
    ell((sign * (hx + 0.008), (hips + knee) / 2 + 0.04, 0.03), 0.06, 0.15, 0.06)
    ell((sign * (hx + 0.012), (hips + knee) / 2 + 0.06, -0.025), 0.058, 0.14, 0.055)
    ball((sign * hx, knee + 0.01, 0.045), 0.033)
    ell((sign * hx, knee - 0.08, -0.04), 0.048, 0.1, 0.052)
    # Ribs showing under the skin along the flanks of the lean chest.
    for r in range(3):
        y = chest_y + 0.1 - r * 0.05
        cap((sign * 0.1, y, chest_z * 0.75 + hunch * 0.15), (sign * chest_x * 0.72, y - 0.025, chest_z * 0.35 + hunch * 0.15), 0.014)
    # The heel lifted off the ground behind the ankle (a digitigrade foot).
    ball((sign * hx, 0.13, -0.035), 0.035)
    ball((sign * hx, -0.01, -0.055), 0.045, negative=True)
    cap((sign * hx, 0.13, -0.035), (sign * hx, 0.24, -0.025), 0.03)
    for row in range(2):
        ball((sign * 0.025, hips + 0.08 + row * 0.07, waist_z * 0.9), 0.022, BELLY)

# ── The mane and rough fur: bristles down the back of the neck and the spine, ragged at the shoulders,
# a little at the elbows and the backs of the calves. ──
MANES = (MANE, shade(MANE, 1.25), shade(MANE, 0.85))
FURS = (FUR, shade(FUR, 0.9), shade(FUR, 0.82))
for k in range(15):
    t = k / 14
    if t < 0.4:
        u = t / 0.4
        up = (b["head_y"] - 0.03) * (1 - u) + (arm_y + 0.04) * u
        fwd = hunch * 0.92 * (1 - u) + hunch * 0.4 * u
        bone = "neck_01"
    else:
        u = (t - 0.4) / 0.6
        up = arm_y + 0.02 - u * 0.3
        fwd = hunch * 0.3 * (1 - u)
        bone = "spine_03" if u < 0.5 else "spine_02"
    origin, toward = (0, up, fwd), (0, up + 0.35, fwd - 1)
    bristles(origin, toward, (0, 1, 0.2 - 0.3 * t), 0.17 - 0.07 * t, 0.018, MANES, bone, n=5)
    if 0.1 < t < 0.7:
        for sign in (1, -1):
            bristles(origin, (sign * 0.3, up + 0.3, fwd - 1), (sign * 0.3, 1, 0.1 - 0.3 * t), 0.1 - 0.04 * t, 0.013, MANES, bone, n=3)
for side, sign in SIDES:
    for k in range(4):
        x = sx - 0.06 + k * 0.05
        fur((sign * x, arm_y - 0.05, 0), (sign * (x + 0.05 * k), arm_y + 1, -0.35 + 0.15 * k), (sign * 0.5, 0.5, -1), 0.1, 0.014, FURS, f"upperarm_{side}" if k > 0 else "spine_03", n=3)
for side, sign in SIDES:
    for x in (sx + elbow + 0.02, sx + elbow + 0.12):
        for a in (2.4, -2.6):
            fur((sign * x, arm_y, 0), (sign * x, arm_y + math.sin(a), math.cos(a)), (sign, 0, -0.3), 0.08, 0.011, FURS, f"lowerarm_{side}")
    for x in (sx + 0.1, sx + 0.22):
        for a in (-2.0, 2.2):
            fur((sign * x, arm_y, 0), (sign * x, arm_y + math.sin(a), math.cos(a)), (sign, 0, -0.4), 0.08, 0.011, FURS, f"upperarm_{side}")
    for y in (hips - 0.18, hips - 0.3):
        for a in (1.3, 2.3):
            fur((sign * hx, y, 0), (sign * hx + sign * math.sin(a), y, math.cos(a)), (0, 0, -1), 0.08, 0.012, FURS, f"thigh_{side}")
    for a in (2.6, -2.8):
        y = knee - 0.03
        fur((sign * hx, y, 0), (sign * hx + math.sin(a), y, math.cos(a)), (0, 0, -1), 0.08, 0.011, FURS, f"calf_{side}")

# ── Spots: dark blotches scattered over the shoulders, back, flanks, arms and thighs. ──
for i in range(36):
    a = rng.uniform(0.0, 2 * math.pi)
    up = rng.uniform(chest_y - 0.05, arm_y + 0.05)
    bone = "spine_03" if up > chest_y + 0.1 else "spine_02"
    spot((0, up, 0.02), (math.sin(a), up + rng.uniform(-0.1, 0.1), math.cos(a)), rng.uniform(0.018, 0.03), (SPOT, shade(SPOT, 1.15))[i % 2], bone)
for side, sign in SIDES:
    for i in range(6):
        x = sx + rng.uniform(0.04, elbow + 0.1)
        a = rng.uniform(-0.6, 3.6)
        spot((sign * x, arm_y, 0), (sign * x, arm_y + math.sin(a), math.cos(a)), rng.uniform(0.017, 0.025), SPOT, f"upperarm_{side}" if x < sx + elbow else f"lowerarm_{side}")
    for i in range(7):
        up = rng.uniform(knee + 0.04, hips - 0.12)
        a = rng.uniform(-0.6, 3.8)
        spot((sign * hx, up, 0), (sign * hx + sign * math.sin(a), up, math.cos(a)), rng.uniform(0.02, 0.028), SPOT, f"thigh_{side}")
    for i in range(3):
        up = rng.uniform(0.3, knee - 0.05)
        a = rng.uniform(-0.5, 3.5)
        spot((sign * hx, up, 0), (sign * hx + sign * math.sin(a), up, math.cos(a)), rng.uniform(0.015, 0.021), SPOT, f"calf_{side}")

# ── Gear: a crude leather harness, two straps crossing on the chest and back with an iron ring where they
# meet; a cord of bones and teeth round the neck; a rope belt with a ragged loincloth and hanging strips;
# a leather pad on the left shoulder; wraps round the wrists. ──


def round_body(a, up, lean=0.15):
    """A ray out from the middle of the body at height `up`, `a` round from the front (towards +x)."""
    return ((0, up, hunch * lean), (math.sin(a), up, hunch * lean + math.cos(a)))


for sign in (1, -1):
    rays = [
        round_body(sign * 2.3, hips + 0.06),
        round_body(math.pi, chest_y + 0.06),
        round_body(-sign * 2.5, arm_y - 0.02),
        ((-sign * 0.13, arm_y - 0.1, 0.02), (-sign * 0.16, arm_y + 1, -0.25)),
        ((-sign * 0.13, arm_y - 0.1, 0.06), (-sign * 0.16, arm_y + 1, 0.35)),
        round_body(-sign * 0.7, arm_y - 0.04),
        round_body(0, chest_y + 0.08),
        round_body(sign * 0.8, hips + 0.08),
    ]
    strap(rays, lambda q: "spine_03" if q.z > chest_y + 0.05 else "spine_02", width=0.03, thick=0.01)
hit, n_ring = surface((0, chest_y + 0.1, hunch * 0.15), (0, chest_y + 0.1, 1))
m.ring(hit + n_ring * 0.012, 0.022, 0.006, 0x5E5C58, "spine_03", axis=tuple(n_ring), segments=10)
# The cord of bones round the base of the neck.
cord = []
for i in range(11):
    a = math.pi * (-0.42 + 0.84 * i / 10)
    cord.append((math.sin(a) * 0.5, arm_y + 0.02 - math.cos(a) * 0.05, hunch * 0.45 + math.cos(a) * 0.5))
on = strap([((0, arm_y + 0.04, hunch * 0.45), q) for q in cord], lambda q: "spine_03", width=0.012, thick=0.008, colour=STRAP)
for i, (q, n) in enumerate(on[1:-1]):
    down = Vector((0, 0, -1))
    if i % 2 == 0:
        m.cone(q + n * 0.006, q + n * 0.012 + down * 0.05, 0.011, BONE, "spine_03", segments=5)
    else:
        m.tube(q + n * 0.008, q + n * 0.012 + down * 0.035, 0.007, 0.007, BONE, "spine_03", segments=5)
        m.sphere(q + n * 0.012 + down * 0.035, (0.011, 0.011, 0.009), BONE, "spine_03", segments=6, rings=4)
# A small skull hung at the front.
q, n = on[len(on) // 2]
skull = q + n * 0.02 + Vector((0, 0, -0.03))
m.sphere(skull, (0.026, 0.024, 0.024), BONE, "spine_03", segments=8, rings=6)
m.sphere(skull + n * 0.012 + Vector((0, 0, -0.02)), (0.016, 0.014, 0.012), BONE, "spine_03", segments=6, rings=4)
for sign in (1, -1):
    m.sphere(skull + n * 0.02 + Vector((sign * 0.01, 0, 0.002)), (0.006, 0.006, 0.006), 0x2A2018, "spine_03", segments=5, rings=3)
belt_y = hips + 0.03
m.ring(at(0, belt_y, 0.0), 1, 0.12, STRAP, "pelvis", scale=(waist_x * 1.3, waist_z * 1.4, 0.24))
m.ring(at(0, belt_y - 0.03, 0.0), 1, 0.1, shade(STRAP, 1.3), "pelvis", scale=(waist_x * 1.34, waist_z * 1.44, 0.2))
for sign, colour, length in ((1, CLOTH, 0.3), (-1, shade(CLOTH, 0.82), 0.27)):
    top, bottom = at(0, belt_y, sign * waist_z * 1.35), at(0.012, hips - length, sign * (waist_z * 1.35 + 0.035))
    m.leaf(top, bottom, 0.17, 0.008, colour, "pelvis", (0, -sign, 0), notch=0.7, steps=8)
for sign in (1, -1):
    for j, a in enumerate((0.9, 1.4, 2.0)):
        a *= sign
        top = at(math.sin(a) * waist_x * 1.3, belt_y - 0.02, math.cos(a) * waist_z * 1.38)
        bottom = at(math.sin(a) * waist_x * 1.45, hips - 0.14 - 0.05 * ((j + (sign > 0)) % 2), math.cos(a) * waist_z * 1.48)
        m.leaf(top, bottom, 0.06, 0.006, shade(CLOTH, 0.9 + 0.1 * j), "pelvis", (math.sin(a), -math.cos(a), 0), steps=4)
pad = at(sx + 0.02, arm_y + 0.07, 0.0)
m.sphere(pad, (0.085, 0.085, 0.04), LEATHER, "upperarm_l", segments=10, rings=6)
m.cone(pad + Vector((0.02, 0, 0.03)), pad + Vector((0.06, 0.01, 0.075)), 0.013, BONE, "upperarm_l", segments=6)
for side, sign in SIDES:
    for k in range(3):
        m.ring(at(sign * (sx + wrist - 0.04 - k * 0.04), arm_y, 0), 0.04, 0.009, shade(0x7A6A50, 1 - 0.08 * (k % 2)), f"lowerarm_{side}", axis=(1, 0, 0), segments=10)

# ── The spear: a long shaft, a binding and a leaf-shaped iron head. ──
k = s
length = 2.0
WOOD, STEEL, BINDING = 0x7A5A3A, 0xA8ACB0, 0x3A2A1E
spear = [
    (m.tube, (Vector((0, length * 0.35 * k, 0)), Vector((0, -length * 0.62 * k, 0)), 0.017 * k, 0.017 * k, WOOD, "hand_r")),
    (m.tube, (Vector((0, -length * 0.6 * k, 0)), Vector((0, -length * 0.645 * k, 0)), 0.023 * k, 0.021 * k, BINDING, "hand_r")),
    (m.leaf, (Vector((0, -length * 0.62 * k, 0)), Vector((0, -(length * 0.62 + 0.26) * k, 0)), 0.075 * k, 0.014 * k, STEEL, "hand_r", (0, 0, 1))),
    (m.tube, (Vector((0, 0.02 * k, 0)), Vector((0, -0.1 * k, 0)), 0.021 * k, 0.021 * k, BINDING, "hand_r")),
]
for i in range(2):
    spear.append((m.cone, (Vector((0, -length * 0.6 * k, 0)), Vector((0.03 + 0.02 * i, -length * 0.55 * k, -0.06 - 0.03 * i)), 0.006, BONE, "hand_r", 4)))
m.weapon(spear, at(-(sx + p["arm"] + 0.06 * b["h"]), arm_y - 0.014 * b["h"], 0), tilt=0.95)

m.finish(humanoid_actions(arm_down=74), bake={"size": 512, "ao": 0.1, "mottle": 0.12, "mottle_scale": 55, "dirt": 0.3})
