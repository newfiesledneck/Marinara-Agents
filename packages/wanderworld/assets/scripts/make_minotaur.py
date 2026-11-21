"""Minotaur (SRD: Large monstrosity): a bull's head on a huge man's body, near three metres to the tips of
its horns. A broad flat skull, a short wide muzzle with a dark nose and a brass ring, ears out to the
sides, long pale horns curving out, up and forward to dark tips; dark brown fur, a shaggy mane on the
thick neck and shoulders, a heavily muscled chest and arms, legs ending in hooves; a red kilt on a
studded belt, leather bracers and a great double-bladed axe. Writes assets/models/minotaur.glb. Run
(BLENDER: your Blender executable):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_minotaur.py
"""

import math
import os
import sys

import bmesh
import bpy
from mathutils import Matrix

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wwblend import STIFF, THRESHOLD, Model, Vector, at, humanoid_actions, humanoid_body, humanoid_joints, shade  # noqa: E402

bpy.ops.wm.read_factory_settings(use_empty=True)

FUR = 0x664229
DARK = shade(FUR, 0.62)
MANE = 0x2E1E14
MANE_LIGHT = 0x463020
MUZZLE = 0x3A2A20
NOSE = 0x241A16
HORN = 0xDCD0B0
HORN_DARK = 0x3A3026
HOOF = 0x26201C
BRASS = 0xB89850
CLOTH = 0x8A2A20
CLOTH_DARK = 0x5E1C16
LEATHER = 0x5A3E28
STRAP = 0x3E2A1C
WOOD = 0x5A3E26
IRON = 0x6A6E72
STEEL = 0xB0B4B8
p = {
    "leg": 1.12,
    "torso": 0.95,
    "neck": 0.16,
    "shoulders": 0.8,
    "hips": 0.38,
    "arm": 1.0,
    "thick": 1.8,
    "chest": (0.42, 0.28),
    "waist": (0.27, 0.21),
    "hunch": 0.16,
    "hand": 1.75,
    "foot": 1.5,
    "hooves": HOOF,
}
m = Model("minotaur", resolution=0.016, faces=6400)
m.group("head", resolution=0.0098, faces=4200, bone="Head")
m.rig(humanoid_joints(p))
b = humanoid_body(m, p, {"skin": FUR, "shins": shade(FUR, 0.82), "nails": 0x2A2420})
# (Hooves smooth rather than faceted.)
m.parts = [(v, f, c, bone, True if c == HOOF else smooth) for v, f, c, bone, smooth in m.parts]
s, t, arm_y, sx, hx, chest_y, knee = b["s"], b["t"], b["arm_y"], b["sx"], b["hx"], b["chest_y"], b["knee"]
hips = p["leg"]
(chest_x, chest_z), (waist_x, waist_z) = p["chest"], p["waist"]
hunch = p["hunch"]
elbow, wrist = p["arm"] * 0.52, p["arm"]
# The head is shaped in a goblin-sized frame (a skull about 0.1 across), scaled up by K and bowed by
# PITCH, the muzzle pointing forward and down.
K = 2.3
PITCH = 0.22
hy = b["head_y"] + 0.07 * K
hz = hunch + 0.02 * K


def ell(c, across, up, depth, colour=FUR, negative=False, group="body"):
    m.ellipsoid(at(*c), (across, depth, up), colour, negative, group=group)


def ball(c, r, colour=FUR, negative=False, group="body"):
    m.ball(at(*c), r, colour, negative, group=group)


def cap(a, c, r, colour=FUR, negative=False, group="body"):
    m.capsule(at(*a), at(*c), r, colour, negative, group=group)


def hp(x, y, z):
    """A point on the head, from the goblin-sized frame (bowed by PITCH)."""
    y, z = y * math.cos(PITCH) - z * math.sin(PITCH), z * math.cos(PITCH) + y * math.sin(PITCH)
    return (x * K, hy + y * K, hz + z * K)


def hv(x, y, z):
    """A point on the head in Blender's coordinates."""
    return at(*hp(x, y, z))


def hell(c, across, up, depth, colour=FUR, negative=False):
    ell(hp(*c), across * K, up * K, depth * K, colour, negative, "head")


def hball(c, r, colour=FUR, negative=False):
    ball(hp(*c), r * K, colour, negative, "head")


def hcap(a, c, r, colour=FUR, negative=False):
    cap(hp(*a), hp(*c), r * K, colour, negative, "head")


def horn(points, r0, segments=10, samples=18):
    """A smooth horn swept along `points` (Blender coordinates, through them by Catmull-Rom), from
    radius r0 at the root to a point; pale, its last fifth dark."""
    pts = [points[0]] + points + [points[-1]]
    per = samples // (len(points) - 1)
    path = []
    for i in range(1, len(pts) - 2):
        p0, p1, p2, p3 = pts[i - 1], pts[i], pts[i + 1], pts[i + 2]
        for j in range(per):
            u = j / per
            path.append(0.5 * (2 * p1 + (p2 - p0) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (3 * p1 - p0 - 3 * p2 + p3) * u**3))
    path.append(points[-1])
    bm = bmesh.new()
    rings, colours = [], []
    side = Vector((0, -1, 0))
    for i, q in enumerate(path):
        u = i / (len(path) - 1)
        along = (path[min(i + 1, len(path) - 1)] - path[max(i - 1, 0)]).normalized()
        a = (side - along * side.dot(along)).normalized()
        c = along.cross(a)
        r = r0 * (1 - u) ** 0.8 + 0.0015
        rings.append([bm.verts.new(q + (a * math.cos(2 * math.pi * k / segments) + c * math.sin(2 * math.pi * k / segments)) * r) for k in range(segments)])
    tip = bm.verts.new(path[-1] + (path[-1] - path[-2]).normalized() * r0 * 0.4)
    bm.faces.new(list(reversed(rings[0])))
    colours.append(shade(HORN, 0.85))
    for i, (ra, rb) in enumerate(zip(rings, rings[1:])):
        for k in range(segments):
            bm.faces.new((ra[k], ra[(k + 1) % segments], rb[(k + 1) % segments], rb[k]))
            colours.append(HORN_DARK if i > len(rings) * 0.78 else (shade(HORN, 0.88) if i < 3 else HORN))
    for k in range(segments):
        bm.faces.new((rings[-1][k], rings[-1][(k + 1) % segments], tip))
        colours.append(HORN_DARK)
    m._add_bm(bm, colours, "Head")


# ── The head: a broad, flat-topped skull with a flat brow between the horns, eyes set out at the sides
# under heavy brows, cheeks running into a short, deep, wide muzzle that ends in a broad dark nose. ──
hell((0, 0.04, -0.015), 0.1, 0.066, 0.078)
hell((0, 0.02, 0.05), 0.09, 0.07, 0.042)
hell((0, -0.025, 0.1), 0.074, 0.06, 0.06)
hell((0, -0.05, 0.155), 0.07, 0.052, 0.052)
hell((0, -0.058, 0.19), 0.074, 0.046, 0.032, MUZZLE)
hell((0, -0.1, 0.13), 0.054, 0.024, 0.065, MUZZLE)
hell((0, -0.075, -0.02), 0.088, 0.064, 0.07)
hell((0, -0.115, 0.02), 0.05, 0.05, 0.06)
for sign in (1, -1):
    hball((sign * 0.064, -0.03, 0.04), 0.042)
    hball((sign * 0.068, 0.034, 0.055), 0.026, shade(FUR, 0.85))
    hball((sign * 0.05, 0.03, 0.072), 0.019, shade(FUR, 0.82))
    hball((sign * 0.077, 0.016, 0.066), 0.013, DARK, negative=True)
    hcap((sign * 0.026, -0.05, 0.218), (sign * 0.038, -0.066, 0.214), 0.011, 0x120C0A, negative=True)
    hcap((sign * 0.04, -0.03, 0.19), (sign * 0.05, -0.072, 0.2), 0.013, NOSE)
    hcap((sign * 0.05, 0.005, 0.07), (sign * 0.05, -0.04, 0.15), 0.014, shade(FUR, 0.92))
hcap((-0.056, -0.09, 0.16), (0.056, -0.09, 0.16), 0.006, 0x140C0A, negative=True)
hell((0, -0.058, 0.212), 0.052, 0.03, 0.012, NOSE)
# A curly forelock on the poll between the horns.
for x, y, z in ((0, 0.09, 0.02), (-0.025, 0.084, 0.035), (0.025, 0.084, 0.035)):
    hball((x, y, z), 0.018, MANE_LIGHT)

for sign in (1, -1):
    # Small dark eyes with a red glint, set out at the sides under the brows.
    eye = hv(sign * 0.074, 0.016, 0.063)
    out = Vector((sign * 0.75, -0.65, 0.05)).normalized()
    m.sphere(eye, (0.011 * K,) * 3, 0x6A1A10, "Head", segments=10, rings=8)
    m.sphere(eye + out * 0.009 * K, (0.006 * K,) * 3, 0x0E0806, "Head", segments=8, rings=6)
    m.sphere(eye + out * 0.0105 * K + Vector((0, 0, 0.003 * K)), (0.0018 * K,) * 3, 0xFFE8D0, "Head", segments=6, rings=4)
    # Ears out to the sides under the horns, a little drooping, cupped and pink inside.
    base, tip = hv(sign * 0.088, 0.02, -0.02), hv(sign * 0.2, -0.005, 0.0)
    m.leaf(base, tip, 0.07 * K, 0.012 * K, FUR, "Head", Vector((sign * 0.2, -1, 0.3)).normalized(), bend=(0, 0, -0.012 * K), steps=7, cup=0.42, inner=0x8A5A4A)
    # Horns: thick at the root, out to the sides, then sweeping up and forward to dark points.
    horn([hv(sign * 0.06, 0.075, 0.0), hv(sign * 0.14, 0.09, 0.0), hv(sign * 0.2, 0.12, 0.025), hv(sign * 0.23, 0.18, 0.06), hv(sign * 0.235, 0.24, 0.11)], 0.032 * K)
# A brass ring through the nose.
m.ring(hv(0, -0.096, 0.226), 0.026 * K, 0.0045 * K, BRASS, "Head", axis=(0, 1, 0.25), segments=16)

# ── The body: a huge muscled torso, a bull's hump of neck and shoulders, broad chest and arms. ──
for sign in (1, -1):
    ell((sign * 0.15 * s, arm_y + 0.08 * s, hunch * 0.2), 0.16 * s, 0.11 * s, 0.13 * s)
    ell((sign * (sx + 0.02 * s), arm_y + 0.02 * s, 0.0), 0.13 * s, 0.12 * s, 0.12 * s)
    ell((sign * 0.14 * s, chest_y + 0.14 * s, hunch * 0.2 + chest_z * 0.82), 0.15 * s, 0.11 * s, 0.08 * s, shade(FUR, 1.08))
    ell((sign * 0.24 * s, chest_y + 0.02 * s, -0.05 * s), 0.1 * s, 0.2 * s, 0.13 * s)
    ell((sign * (sx + elbow * 0.5), arm_y + 0.025 * s, 0.01), elbow * 0.34, 0.085 * s, 0.082 * s)
    ell((sign * (sx + elbow + 0.12 * s), arm_y + 0.005 * s, 0.0), 0.14 * s, 0.082 * s, 0.078 * s)
    ell((sign * (hx + 0.02 * s), (hips + knee) / 2 + 0.03 * s, 0.01), 0.13 * s, 0.22 * s, 0.13 * s)
    ell((sign * hx, knee - 0.12 * s, -0.04 * s), 0.09 * s, 0.14 * s, 0.09 * s, shade(FUR, 0.82))
    ball((sign * hx, knee + 0.01 * s, 0.04 * s), 0.06 * s)
    for row in range(3):
        ball((sign * 0.055 * s, hips + 0.1 * s + row * 0.1 * s, waist_z * 0.95 + (0.01 - row * 0.004) * s), 0.06 * s, shade(FUR, 1.06))
# The mane: shaggy and darker, down the back of the neck and over the hump of the shoulders.
ell((0, b["head_y"] - 0.02, hunch * 0.6 - 0.1 * s), 0.16 * s, 0.22 * s, 0.11 * s, MANE)
ell((0, arm_y + 0.12 * s, -0.08 * s), 0.22 * s, 0.13 * s, 0.15 * s, MANE)
ell((0, b["head_y"] - 0.1 * s, hunch * 0.6 + 0.08 * s), 0.13 * s, 0.15 * s, 0.09 * s, MANE_LIGHT)


# ── Fitting gear to the skin: the metaball field, to find the body's surface and its normal. ──
BODY = [e for e in m.elements if e[4] == "body"]


def field(q):
    return sum((-1 if e[3] else 1) * STIFF * m._field(q, e) for e in BODY)


def surface(q, d, lift):
    """Where a ray from q (Blender coordinates, inside the body) along d leaves the skin, lifted off it
    by `lift`."""
    d = Vector(d).normalized()
    step = 0.006
    if field(q) >= THRESHOLD:
        while field(q + d * step) >= THRESHOLD:
            q = q + d * step
    else:
        for _ in range(200):
            q = q - d * step
            if field(q) >= THRESHOLD:
                break
    return q + d * (step / 2 + lift)


def outer(q, d, lift, reach=1.2):
    """The outermost skin along a ray from q along d (coming in from `reach` away), lifted by `lift`."""
    d = Vector(d).normalized()
    step = 0.006
    r = reach
    while r > 0 and field(q + d * r) < THRESHOLD:
        r -= step
    return q + d * (r + step / 2 + lift)


def normal(q):
    e = 0.004
    g = Vector(
        (
            field(q + Vector((e, 0, 0))) - field(q - Vector((e, 0, 0))),
            field(q + Vector((0, e, 0))) - field(q - Vector((0, e, 0))),
            field(q + Vector((0, 0, e))) - field(q - Vector((0, 0, e))),
        )
    )
    return -g.normalized() if g.length > 0 else Vector((0, 0, 1))


def radial(q, centre_fwd=0.0):
    """Outwards from the body's middle, level."""
    d = Vector((q.x, q.y + centre_fwd, 0))
    return d.normalized() if d.length > 1e-6 else Vector((0, -1, 0))


def strap(points, bone_of, width, thick, colour=STRAP, lift=0.006, dirs=None, piece=0.07, frames=False):
    """A flat strap through `points` (game coordinates, inside the body), laid on the skin: each point
    is pushed out along its direction (`dirs`, else level from the middle) to the surface."""
    raw = [at(*q) for q in points]
    pts = []
    for i, (a, c) in enumerate(zip(raw, raw[1:])):
        da = Vector(dirs[i]) if dirs else radial(a)
        dc = Vector(dirs[i + 1]) if dirs else radial(c)
        n = max(1, math.ceil((c - a).length / piece))
        for j in range(n + (1 if i == len(raw) - 2 else 0)):
            u = j / n
            pts.append(surface(a.lerp(c, u), da.lerp(dc, u), lift + thick / 2))
    made = []
    for a, c in zip(pts, pts[1:]):
        mid = (a + c) / 2
        y = (c - a).normalized()
        z = normal(mid - normal(mid) * (lift + thick / 2))
        z = (z - y * z.dot(y)).normalized()
        x = y.cross(z)
        rot = Matrix((x, y, z)).transposed().to_quaternion()
        m.box(mid, (width, (c - a).length * 1.12, thick), colour, bone_of(mid), rot)
        made.append((mid, x, y, z))
    return (pts, made) if frames else pts


def chest_bone(q):
    return "spine_03" if q.z > chest_y + 0.1 else ("spine_02" if q.z > hips + 0.3 else "spine_01")


# Shaggy tufts along the mane's edges and down the throat, and round the fetlocks above the hooves.
UP = Vector((0, 0, 1))
for i in range(9):
    a = math.radians(-80 + 20 * i)
    inner = at(math.sin(a) * 0.1 * s, arm_y + 0.12 * s, -0.08 * s + math.cos(a) * -0.02)
    d = (Vector((math.sin(a), math.cos(a) * 0.9, 0)) + UP * 0.5).normalized()
    root = surface(inner, d, -0.012 * s)
    m.cone(root, root + d * 0.02 * s - UP * (0.1 + 0.03 * (i % 2)) * s, 0.04 * s, MANE if i % 2 else MANE_LIGHT, "spine_03", segments=5, flat=0.6, facing=d)
for i in range(5):
    y = b["head_y"] - 0.02 - i * 0.06 * s
    for sign in (1, -1):
        inner = at(sign * 0.05 * s, y, hunch * 0.6 - 0.1 * s)
        d = Vector((sign * 0.6, 0.8, 0.0)).normalized()
        root = surface(inner, d, -0.012 * s)
        m.cone(root, root + d * 0.05 * s - UP * 0.07 * s, 0.035 * s, MANE if i % 2 else MANE_LIGHT, "neck_01" if i < 2 else "spine_03", segments=5, flat=0.6, facing=d)
# A shaggy ruff at the throat (level rays further round would run out along the T-posed arms).
for i in range(7):
    a = math.radians(-60 + 20 * i)
    inner = at(0, b["head_y"] - 0.12 * s, hunch * 0.6)
    d = Vector((math.sin(a), -math.cos(a), 0.25)).normalized()
    root = surface(inner, d, -0.015 * s)
    m.cone(root, root + d * 0.03 * s - UP * (0.08 + 0.02 * (i % 2)) * s, 0.05 * s, MANE_LIGHT if i % 2 else shade(FUR, 0.8), "neck_01", segments=5, flat=0.45, facing=d)
for side, sign in (("l", 1), ("r", -1)):
    for i in range(8):
        a = 2 * math.pi * i / 8
        d = Vector((math.cos(a), math.sin(a), 0))
        root = surface(at(sign * hx, b["f"] * 0.14, 0.0), d, -0.01 * s)
        m.cone(root, root + d * 0.035 * s - UP * 0.09 * s, 0.035 * s, MANE, f"calf_{side}", segments=5, flat=0.6, facing=d)
    # The cleft in the hoof.
    m.box(at(sign * hx, b["f"] * 0.05, 0.075 * b["f"]), (0.012 * s, 0.05 * s, b["f"] * 0.09), 0x0E0A08, f"foot_{side}")

# The belt, studded with brass, a round brass plate at the front.
belt_y = hips + 0.06 * s
ring = [(math.sin(2 * math.pi * i / 24) * 0.05, belt_y, math.cos(2 * math.pi * i / 24) * 0.05) for i in range(25)]
belt, frames = strap(ring, lambda q: "pelvis", 0.085 * s, 0.022 * s, STRAP, lift=0.004, dirs=[radial(at(*q)) for q in ring], piece=0.1, frames=True)
for i, (mid, x, y, z) in enumerate(frames):
    m.sphere(mid + z * 0.012 * s, (0.016 * s,) * 3, BRASS, "pelvis", segments=6, rings=4)
front = belt[0]
m.tube(front, front + Vector((0, -0.02 * s, 0)), 0.065 * s, 0.06 * s, BRASS, "pelvis", segments=14)
m.sphere(front + Vector((0, -0.02 * s, 0)), (0.025 * s, 0.012 * s, 0.025 * s), shade(BRASS, 0.8), "pelvis", segments=8, rings=5)

# The red kilt: broad strips hanging from the belt and flaring over the thighs, hemmed darker.
for i in range(14):
    a = 2 * math.pi * (i + 0.5) / 14
    d = Vector((math.sin(a), -math.cos(a), 0))
    centre = at(0, 0, 0)
    top = outer(centre + Vector((0, 0, belt_y - 0.03 * s)), d, 0.006 * s)
    length = (0.4 + 0.03 * math.sin(i * 1.7)) * s
    # (Out past the thighs, or straight down where the ray finds only the gap between them.)
    low_z = belt_y - 0.03 * s - length
    reach = max((outer(Vector((0, 0, low_z)), d, 0.03 * s) - Vector((0, 0, low_z))).length, (top - Vector((0, 0, top.z))).length + 0.02 * s)
    low = Vector((0, 0, low_z)) + d * reach
    bottom = top + (low - top).normalized() * length
    y = (bottom - top).normalized()
    z = d - y * d.dot(y)
    z.normalize()
    x = y.cross(z)
    rot = Matrix((x, y, z)).transposed().to_quaternion()
    width = 2 * math.pi * (top - centre - Vector((0, 0, top.z))).length / 14 * 1.15
    colour = CLOTH if i % 2 else shade(CLOTH, 0.94)
    m.box((top + bottom) / 2, (width, length, 0.016 * s), colour, "pelvis", rot)
    m.box(bottom - y * 0.03 * s + z * 0.004 * s, (width * 1.01, 0.05 * s, 0.018 * s), CLOTH_DARK, "pelvis", rot)

# Leather bracers on the forearms, strapped and studded.
for side, sign in (("l", 1), ("r", -1)):
    a, c = at(sign * (sx + elbow + 0.12 * s), arm_y, 0), at(sign * (sx + wrist - 0.05 * s), arm_y, 0)
    ra = max((surface(a, d, 0.0) - a).length for d in ((0, 0, 1), (0, -1, 0), (0, 0, -1), (0, 1, 0)))
    rc = max((surface(c, d, 0.0) - c).length for d in ((0, 0, 1), (0, -1, 0), (0, 0, -1), (0, 1, 0)))
    m.tube(a, c, ra + 0.012 * s, rc + 0.012 * s, LEATHER, f"lowerarm_{side}", segments=12)
    for u in (0.2, 0.8):
        q = a.lerp(c, u)
        r = ra + (rc - ra) * u + 0.02 * s
        m.ring(q, r, 0.008 * s, STRAP, f"lowerarm_{side}", axis=(1, 0, 0), segments=14)
    for k in range(5):
        ang = math.radians(-60 + 30 * k)
        q = a.lerp(c, 0.5)
        r = (ra + rc) / 2 + 0.02 * s
        m.sphere(q + Vector((0, -math.sin(ang), math.cos(ang))) * r, (0.012 * s,) * 3, BRASS, f"lowerarm_{side}", segments=6, rings=4)


# ── The greataxe: a long haft, wrapped at the grip, with a great crescent blade each side of an iron
# head, a spike on top and a butt spike. Made with the grip at the origin, running along -y, flat
# facing +z. ──
def crescent(centre, side, radius, colours, bone):
    """A crescent axe blade fanning out from `centre` towards `side` (±1 along x): thick at its root,
    tapering to the edge; the outer band is the honed edge."""
    bm = bmesh.new()
    rings = []
    for share, half in ((0.0, 0.012), (0.8, 0.005), (1.0, 0.0012)):
        ring = []
        for j in range(11):
            ang = math.radians(-78 + 15.6 * j)
            if share == 0:
                q = centre + Vector((0, 0.07 * radius * math.sin(ang), 0))
            else:
                horn = 1 + 0.18 * abs(math.sin(ang)) ** 3
                q = centre + Vector((side * radius * share * math.cos(ang) * horn, 1.3 * radius * share * math.sin(ang) * horn, 0))
            ring.append((bm.verts.new(q + Vector((0, 0, half * radius / 0.2))), bm.verts.new(q - Vector((0, 0, half * radius / 0.2)))))
        rings.append(ring)
    colour = []
    for r, (a, c) in enumerate(zip(rings, rings[1:])):
        for j in range(10):
            for k in (0, 1):
                f = [a[j][k], a[j + 1][k], c[j + 1][k], c[j][k]]
                bm.faces.new(f if (k == 0) == (side > 0) else list(reversed(f)))
                colour.append(colours[r])
    rim = rings[-1]
    for j in range(10):
        f = [rim[j][0], rim[j + 1][0], rim[j + 1][1], rim[j][1]]
        bm.faces.new(f if side > 0 else list(reversed(f)))
        colour.append(colours[-1])
    for j in (0, 10):
        f = [rings[0][j][0], rings[1][j][0], rings[2][j][0], rings[2][j][1], rings[1][j][1], rings[0][j][1]]
        bm.faces.new(f if (j == 0) == (side > 0) else list(reversed(f)))
        colour.append(colours[0])
    m._add_bm(bm, colour, bone, smooth=False)


k = s * 1.25
length = 1.15 * k
head_at = -length * 0.88
axe = [
    (m.tube, (Vector((0, 0.07 * k, 0)), Vector((0, -length, 0)), 0.024 * k, 0.022 * k, WOOD, "hand_r", 8)),
    (m.tube, (Vector((0, 0.06 * k, 0)), Vector((0, -0.12 * k, 0)), 0.028 * k, 0.028 * k, LEATHER, "hand_r", 8)),
    (m.cone, (Vector((0, 0.07 * k, 0)), Vector((0, 0.12 * k, 0)), 0.024 * k, IRON, "hand_r", 6)),
    (m.box, (Vector((0, head_at, 0)), (0.075 * k, 0.15 * k, 0.05 * k), IRON, "hand_r")),
    (m.tube, (Vector((0, head_at + 0.1 * k, 0)), Vector((0, head_at + 0.075 * k, 0)), 0.032 * k, 0.032 * k, IRON, "hand_r", 8)),
    (m.tube, (Vector((0, head_at - 0.075 * k, 0)), Vector((0, head_at - 0.1 * k, 0)), 0.032 * k, 0.032 * k, IRON, "hand_r", 8)),
    (m.cone, (Vector((0, -length, 0)), Vector((0, -length - 0.14 * k, 0)), 0.03 * k, IRON, "hand_r", 4, 0.5, (0, 0, 1), False)),
]
for side in (1, -1):
    axe.append((crescent, (Vector((side * 0.035 * k, head_at, 0)), side, 0.175 * k, [IRON, STEEL], "hand_r")))
m.weapon(axe, at(-(sx + p["arm"] + 0.06 * b["h"]), arm_y - 0.014 * b["h"], 0), tilt=-1.0)

m.finish(humanoid_actions(arm_down=72), bake={"size": 512, "ao": 0.2, "mottle": 0.14, "mottle_scale": 40, "dirt": 0.45})
mesh = bpy.data.objects["minotaur"]
print(f"minotaur: {max((mesh.matrix_world @ v.co).z for v in mesh.data.vertices):.2f} m tall (rest pose)")
