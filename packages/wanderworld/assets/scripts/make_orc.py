"""Orc (SRD: Medium humanoid): about 1.85 metres of stooped, heavy muscle with grey-green skin; a low
brow ridge over small red eyes, a flat upturned nose, a jutting underbite with two great lower tusks,
pointed ears and a black mohawk with a tail; bare-chested under a leather harness that holds a spiked iron
pauldron on the left shoulder, a fur pad on the right, a wide belt with a skull, a loincloth and leather
strips, bracers, fur wraps on the shins, a tooth necklace and a double-bitted greataxe. Writes
assets/models/orc.glb. Run (BLENDER: your Blender executable):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_orc.py
"""

import math
import os
import sys

import bmesh
import bpy
from mathutils import Quaternion

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wwblend import STIFF, THRESHOLD, Model, Vector, at, humanoid_actions, humanoid_body, humanoid_joints, shade  # noqa: E402

bpy.ops.wm.read_factory_settings(use_empty=True)

SKIN = 0x6C7A58
DARK = shade(SKIN, 0.55)
BROW = shade(SKIN, 0.9)
LIPS = shade(SKIN, 0.78)
HAIR = 0x16120F
STUBBLE = shade(SKIN, 0.8)
EYE = 0xB8301C
TUSK = 0xE4D8BA
BONE = 0xD8CCAE
LEATHER = 0x4E3826
STRAP = 0x3A2A1C
CLOTH = 0x5E2E22
FUR = 0x7A6650
IRON = 0x6C7076
DARK_IRON = 0x383B40
SPIKE = 0x9A9EA2
TROUSER = 0x463628
WRAP = 0x4A3A2C
p = {
    "leg": 0.9,
    "torso": 0.66,
    "neck": 0.07,
    "shoulders": 0.5,
    "hips": 0.25,
    "arm": 0.66,
    "thick": 1.42,
    "chest": (0.25, 0.16),
    "waist": (0.15, 0.122),
    "hunch": 0.1,
    "hand": 1.32,
    "foot": 1.15,
}
m = Model("orc", resolution=0.008, faces=4800)
m.group("head", resolution=0.0042, faces=3600, bone="Head")
m.rig(humanoid_joints(p))
b = humanoid_body(m, p, {"skin": SKIN, "legs": TROUSER, "shins": TROUSER, "feet": WRAP})
s, t, arm_y, sx, hx, chest_y, knee = b["s"], b["t"], b["arm_y"], b["sx"], b["hx"], b["chest_y"], b["knee"]
hips = p["leg"]
(chest_x, chest_z), (waist_x, waist_z) = p["chest"], p["waist"]
hunch = p["hunch"]
hy = b["head_y"] + 0.07
hz = hunch + 0.03
elbow, wrist = p["arm"] * 0.52, p["arm"]


def ell(c, across, up, depth, colour=SKIN, negative=False, group="body"):
    m.ellipsoid(at(*c), (across, depth, up), colour, negative, group=group)


def ball(c, r, colour=SKIN, negative=False, group="body"):
    m.ball(at(*c), r, colour, negative, group=group)


def cap(a, c, r, colour=SKIN, negative=False, group="body"):
    m.capsule(at(*a), at(*c), r, colour, negative, group=group)


# ── Gear that lies on the body: rays from inside find the metaball surface, so straps, cloth and plate sit
# over the muscles instead of cutting into them. ──
_elements = {}


def field(q, group="body"):
    """The metaball field at q (Blender coordinates), as Blender sums it: the surface is at THRESHOLD."""
    key = (group, len(m.elements))
    if key not in _elements:
        _elements[key] = [e for e in m.elements if e[4] == group]
    total = 0.0
    for e in _elements[key]:
        f = m._field(q, e)
        total += -f if e[3] else f
    return total * STIFF


def skin(origin, direction, group="body", reach=0.45, least=0.0):
    """Where a ray from `origin` (inside the body) along `direction` last leaves the skin."""
    d = direction.normalized()
    r = reach
    while r > least and field(origin + d * r, group) < THRESHOLD:
        r -= 0.008
    if r <= least:
        return origin + d * least
    lo, hi = r, r + 0.008
    for _ in range(6):
        mid = (lo + hi) / 2
        if field(origin + d * mid, group) >= THRESHOLD:
            lo = mid
        else:
            hi = mid
    return origin + d * lo


def slab(outer, inner, colour, bone, rim=None, smooth=True):
    """A thick sheet between two grids of points (rows of points, Blender coordinates), coloured by
    `colour` (a colour, or a function of the face's column and row), its edges by `rim`."""
    nv, nu = len(outer) - 1, len(outer[0]) - 1
    bm = bmesh.new()
    o = [[bm.verts.new(q) for q in row] for row in outer]
    n = [[bm.verts.new(q) for q in row] for row in inner]
    colours = []

    def col(i, j):
        return colour(min(i, nu - 1), min(j, nv - 1)) if callable(colour) else colour

    for j in range(nv):
        for i in range(nu):
            bm.faces.new((o[j][i], o[j][i + 1], o[j + 1][i + 1], o[j + 1][i]))
            colours.append(col(i, j))
            bm.faces.new((n[j][i], n[j + 1][i], n[j + 1][i + 1], n[j][i + 1]))
            colours.append(col(i, j))
    edge = [(i, 0) for i in range(nu)] + [(nu, j) for j in range(nv)]
    edge += [(i, nv) for i in range(nu, 0, -1)] + [(0, j) for j in range(nv, 0, -1)]
    for k, (i0, j0) in enumerate(edge):
        i1, j1 = edge[(k + 1) % len(edge)]
        bm.faces.new((o[j0][i0], o[j1][i1], n[j1][i1], n[j0][i0]))
        colours.append(rim if rim is not None else col(i0, j0))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    m._add_bm(bm, colours, bone, smooth)


def patch(rays, nu, nv, lift, thick, colour, bone, rim=None, group="body", least=0.0, reach=0.45):
    """A sheet lying `lift` over the skin: rays(u, v) gives each grid point's (origin, direction), each
    reaching out at most `reach` (short round a limb, so it doesn't find the other one)."""
    outer, inner = [], []
    for j in range(nv + 1):
        ro, ri = [], []
        for i in range(nu + 1):
            origin, d = rays(i / nu, j / nv)
            d = d.normalized()
            q = skin(origin, d, group, reach=reach, least=least)
            ro.append(q + d * lift)
            ri.append(q + d * (lift - thick))
        outer.append(ro)
        inner.append(ri)
    slab(outer, inner, colour, bone, rim)


def around(y0, y1, a0, a1, cx=0.0, cz=0.0):
    """Rays out level from an upright axis at (cx, cz), azimuths a0..a1 (degrees: 0 ahead, 90 the
    creature's left), heights y0..y1."""

    def rays(u, v):
        a = math.radians(a0 + (a1 - a0) * u)
        return at(cx, y0 + (y1 - y0) * v, cz), Vector((math.sin(a), -math.cos(a), 0))

    return rays


def shell(centre, radii, a0, a1, e0, e1, thick, colour, bone, nu=12, nv=4, tilt=None, rim=None, xf=None):
    """A piece of an ellipsoid's shell round `centre` (game coordinates; radii across, up, front to back):
    azimuths a0..a1 and elevations e0..e1 in degrees, turned by `tilt` (a Quaternion) about its centre,
    then moved by `xf` (a function of a point) if given."""
    c = at(*centre)
    rx, ry, rz = radii
    k = 1 - thick / min(radii)
    outer, inner = [], []
    for j in range(nv + 1):
        e = math.radians(e0 + (e1 - e0) * j / nv)
        ro, ri = [], []
        for i in range(nu + 1):
            a = math.radians(a0 + (a1 - a0) * i / nu)
            q = Vector((math.sin(a) * math.cos(e) * rx, -math.cos(a) * math.cos(e) * rz, math.sin(e) * ry))
            if tilt is not None:
                q = tilt @ q
            ro.append(c + q if xf is None else xf(c + q))
            ri.append(c + q * k if xf is None else xf(c + q * k))
        outer.append(ro)
        inner.append(ri)
    slab(outer, inner, colour, bone, rim)


def panel(angle, r0, y_top, length, w_top, w_bottom, thick, colour, bone, flare=0.0, bulge=0.0, cz=0.0, nu=6, nv=6, trim=None):
    """A hanging panel (a tabard's flap, a tasset): `angle` round the body (0 ahead), hung `r0` out from
    the body's axis at `y_top`, `length` long, flaring out by `flare` at its foot and bowed by `bulge`."""
    th = math.radians(angle)
    out = Vector((math.sin(th), -math.cos(th), 0))
    across = Vector((math.cos(th), math.sin(th), 0))
    top = at(0, y_top, cz)
    outer, inner = [], []
    for j in range(nv + 1):
        v = j / nv
        w = w_top + (w_bottom - w_top) * v
        ro, ri = [], []
        for i in range(nu + 1):
            u = i / nu * 2 - 1
            q = top + Vector((0, 0, -length * v)) + across * (u * w / 2) + out * (r0 + flare * v + bulge * (1 - u * u))
            ro.append(q + out * thick / 2)
            ri.append(q - out * thick / 2)
        outer.append(ro)
        inner.append(ri)

    def col(i, j):
        return trim if trim is not None and (i == 0 or i == nu - 1 or j == nv - 1) else colour

    slab(outer, inner, col, bone)




def lowered(sign, angle=72):
    """For gear on an upper arm laid out as the arm hangs (lowered by `angle`, as the clips hold it):
    turns a point back to where it is with the arm out (the bind pose), about the shoulder joint."""
    joint = at(sign * sx, arm_y, 0)
    back = Quaternion((0, 1, 0), math.radians(sign * angle)).inverted()
    return lambda v: joint + back @ (v - joint)


def skirt(y_top, y_bottom, rx, rz, spans, lift, thick, colour, bone, nu=10, nv=4, rim=None):
    """A skirt hung from `y_top` (lying on the body there) flaring to an ellipse (rx, rz) at `y_bottom`,
    never cutting into the body on the way down; one piece for each span of azimuths (gaps left open
    for the legs to swing through)."""
    for a0, a1 in spans:
        outer, inner = [], []
        for j in range(nv + 1):
            v = j / nv
            y = y_top + (y_bottom - y_top) * v
            ro, ri = [], []
            for i in range(nu + 1):
                a = math.radians(a0 + (a1 - a0) * i / nu)
                d = Vector((math.sin(a), -math.cos(a), 0))
                top = (skin(at(0, y_top, 0), d) - at(0, y_top, 0)).length + lift
                here = (skin(at(0, y, 0), d) - at(0, y, 0)).length + lift
                foot = 1 / math.sqrt((math.sin(a) / rx) ** 2 + (math.cos(a) / rz) ** 2)
                r = max(top + (foot - top) * v, here)
                ro.append(at(0, y, 0) + d * r)
                ri.append(at(0, y, 0) + d * (r - thick))
            outer.append(ro)
            inner.append(ri)
        slab(outer, inner, lambda i, j: rim if rim is not None and j == nv - 1 else colour, bone)


def normal(q, group="body", h=0.004):
    """The skin's outward normal near q: down the field's slope."""
    g = Vector([field(q - e * h, group) - field(q + e * h, group) for e in (Vector((1, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, 1)))])
    return g.normalized()


def round_x(x0, x1, cy, cz, a0=-180, a1=180):
    """Rays out from a level axis along x (an arm held out) at height `cy`, from x0 to x1, round it."""

    def rays(u, v):
        a = math.radians(a0 + (a1 - a0) * u)
        return at(x0 + (x1 - x0) * v, cy, cz), Vector((0, -math.cos(a), math.sin(a)))

    return rays


def strap(points, width, thick, colour, bone_of, origin_of, step=0.025):
    """A strap along `points` (game coordinates) lying on the skin: each point is moved onto the surface
    along the ray from `origin_of(point)`; split into pieces where `bone_of` changes."""
    pts = [at(*q) for q in points]
    samples = []
    for a, c in zip(pts, pts[1:]):
        n = max(1, int((c - a).length / step))
        samples += [a + (c - a) * (k / n) for k in range(n)]
    samples.append(pts[-1])
    surface, outs = [], []
    for q in samples:
        o = origin_of(q)
        d = (q - o).normalized()
        q = skin(o, d)
        surface.append(q)
        outs.append(normal(q))
    bones = [bone_of(q) for q in surface]
    lift = thick + 0.004
    start = 0
    while start < len(surface) - 1:
        end = start + 1
        while end < len(surface) - 1 and bones[end] == bones[start]:
            end += 1
        outer, inner = [], []
        for i in range(start, end + 1):
            q, d = surface[i], outs[i]
            along = surface[min(i + 1, len(surface) - 1)] - surface[max(i - 1, 0)]
            side = along.cross(d).normalized() * width / 2
            outer.append([q + d * lift - side, q + d * lift + side])
            inner.append([q + d * (lift - thick) - side, q + d * (lift - thick) + side])
        slab(outer, inner, colour, bones[start])
        start = end
    return surface, outs


HS = 1.2  # the head's scale: its features are laid out for a head about 0.2 m tall


def hp(x, dy, dz):
    return (x * HS, hy + dy * HS, hz + dz * HS)


def hat(x, dy, dz):
    return at(*hp(x, dy, dz))


def hell(c, across, up, depth, colour=SKIN, negative=False):
    ell(hp(*c), across * HS, up * HS, depth * HS, colour, negative, group="head")


def hball(c, r, colour=SKIN, negative=False):
    ball(hp(*c), r * HS, colour, negative, group="head")


def hcap(a, c, r, colour=SKIN, negative=False):
    cap(hp(*a), hp(*c), r * HS, colour, negative, group="head")


# ── The head: a low, sloping skull; a massive brow ridge over small, deep-set red eyes; a short, flat,
# upturned nose with its nostrils forward; heavy cheekbones; a broad jaw thrust out in an underbite, two
# great tusks standing from the lower lip; pointed ears; a black mohawk over a shaved scalp. ──
hell((0, 0.018, -0.028), 0.084, 0.09, 0.1)
hell((0, 0.045, -0.032), 0.077, 0.07, 0.094, STUBBLE)
hell((0, -0.03, 0.018), 0.082, 0.06, 0.086)
hell((0, -0.08, 0.034), 0.08, 0.04, 0.076)
hell((0, -0.107, 0.074), 0.046, 0.024, 0.032)
hell((0, -0.062, 0.08), 0.056, 0.032, 0.04)
hell((0, 0.03, 0.08), 0.08, 0.021, 0.03, BROW)
hball((0, 0.02, 0.1), 0.012, BROW)
for sign in (1, -1):
    hball((sign * 0.063, -0.077, 0.0), 0.034)
    hcap((sign * 0.012, 0.022, 0.1), (sign * 0.062, 0.035, 0.08), 0.014, BROW)
    hball((sign * 0.034, 0.002, 0.095), 0.0145, DARK, negative=True)
    hell((sign * 0.035, -0.012, 0.09), 0.018, 0.007, 0.011, BROW)
    hell((sign * 0.056, -0.008, 0.068), 0.027, 0.017, 0.022)
    hball((sign * 0.022, -0.027, 0.104), 0.012, BROW)
# A short, flat snout of a nose, upturned, its nostrils facing forward.
hcap((0, 0.01, 0.099), (0, -0.014, 0.11), 0.011, BROW)
hell((0, -0.022, 0.111), 0.031, 0.018, 0.016, BROW)
for sign in (1, -1):
    hball((sign * 0.0115, -0.024, 0.126), 0.0062, 0x1E1610, negative=True)
# The mouth: a thin upper lip and a flattened lower lip jutting past it.
hcap((-0.038, -0.061, 0.112), (0.038, -0.061, 0.112), 0.005, 0x20140E, negative=True)
hell((0, -0.052, 0.11), 0.038, 0.008, 0.011, LIPS)
hell((0, -0.071, 0.114), 0.042, 0.0095, 0.013, LIPS)
# The mohawk's ridge.
hell((0, 0.085, -0.03), 0.02, 0.045, 0.106, HAIR)

for sign in (1, -1):
    # Small red eyes, deep under the brow.
    eye = hat(sign * 0.034, 0.002, 0.086)
    m.sphere(eye, (0.0105 * HS, 0.0078 * HS, 0.0072 * HS), EYE, "Head", segments=10, rings=8)
    m.sphere(eye + Vector((0, -0.0076 * HS, 0)), (0.0036 * HS, 0.0016 * HS, 0.0042 * HS), 0x120806, "Head", segments=8, rings=6)
    m.sphere(eye + Vector((sign * 0.0025, -0.0086 * HS, 0.0024)), (0.0016, 0.001, 0.0016), 0xFFE8D0, "Head", segments=6, rings=4)
    # Pointed ears, angled back; a nick out of the right one.
    base, tip = hat(sign * 0.08, -0.005, -0.015), hat(sign * 0.15, 0.035, -0.1)
    m.leaf(base, tip, 0.068 * HS, 0.014, SKIN, "Head", Vector((sign, -0.35, 0.2)), bend=(sign * 0.01, 0, 0.012), notch=0.55 if sign < 0 else None, steps=8, cup=0.3, inner=shade(SKIN, 0.68))
    # Great tusks standing up from the lower jaw, curving out a little.
    root = hat(sign * 0.031, -0.069, 0.112)
    mid = root + Vector((sign * 0.004, -0.004, 0.026))
    m.tube(root, mid, 0.0125 * HS, 0.0105 * HS, TUSK, "Head", segments=8)
    m.cone(mid, mid + Vector((sign * 0.008, -0.002, 0.03)), 0.0105 * HS, TUSK, "Head", segments=8)
for x in (-0.013, 0.013):
    root = hat(x, -0.068, 0.115)
    m.cone(root, root + Vector((0, -0.002, 0.012)), 0.006, TUSK, "Head", segments=5)
# Coarse tufts along the mohawk, swept back, and a tail of it down the back of the neck.
for i in range(7):
    th = math.radians(-48 + i * 19)
    root = hat(0, 0.018 + math.cos(th) * 0.11, -0.03 - math.sin(th) * 0.112)
    tip = root + Vector((0, math.sin(th) * 0.03 + 0.03, math.cos(th) * 0.04))
    m.cone(root, tip, 0.017 * HS, HAIR, "Head", segments=5, flat=0.45, facing=(1, 0, 0))
tail = [(0, 0.04, -0.13), (0, -0.03, -0.16), (0, -0.1, -0.168), (0, -0.17, -0.158)]
m.strand([hat(*q) for q in tail], 0.017, 0.007, HAIR, "Head", segments=6)

# ── The body: heavy pectorals and a hard, ridged belly, a trapezius rising to the neck, thick deltoids,
# a broad back, big arms and thighs. ──
for sign in (1, -1):
    ell((sign * 0.088, chest_y + 0.135, 0.02 + chest_z * 0.76), 0.12, 0.068, 0.04)
    # (The pectoral's lower edge pressed in a little, so it reads as a flat slab of muscle.)
    front = skin(at(sign * 0.09, chest_y + 0.07, 0.0), Vector((0, -1, 0)))
    m.capsule(front + Vector((-sign * 0.07, 0.006, -0.005)), front + Vector((sign * 0.07, 0.03, 0.018)), 0.011, shade(SKIN, 0.86), True)
    ell((sign * 0.1, arm_y + 0.045, hunch * 0.15), 0.1, 0.065, 0.075)
    ell((sign * (sx + 0.03), arm_y + 0.01, 0.005), 0.09, 0.09, 0.09)
    ell((sign * 0.16, chest_y + 0.07, -0.045), 0.085, 0.15, 0.09)
    ell((sign * 0.17, chest_y + 0.13, 0.03), 0.07, 0.07, 0.08)
    ell((sign * (sx + elbow * 0.5), arm_y + 0.012, 0.028), elbow * 0.4, 0.062, 0.062)
    ell((sign * (sx + elbow * 0.45), arm_y, -0.03), elbow * 0.36, 0.058, 0.058)
    ell((sign * (sx + elbow + 0.075), arm_y + 0.006, 0.0), 0.09, 0.06, 0.058)
    ell((sign * (hx + 0.012), (hips + knee) / 2 + 0.03, 0.035), 0.088, 0.16, 0.09, TROUSER)

# A hard belly: its muscles shown by the grooves between them rather than bumps.
belly = [skin(at(0, y, 0.0), Vector((0, -1, 0))) for y in (hips + 0.1, hips + 0.17, hips + 0.235, chest_y + 0.05)]
m.capsule(belly[0] + Vector((0, 0.004, 0)), belly[3] + Vector((0, 0.004, 0)), 0.0075, shade(SKIN, 0.86), True)
for q in belly[1:3]:
    m.capsule(q + Vector((-0.055, 0.012, 0.004)), q + Vector((0.055, 0.012, 0.004)), 0.0065, shade(SKIN, 0.88), True)

# ── Gear. ──
belt_y = hips + 0.09


def reach(angle, y=None):
    """How far the skin is from the body's axis at `angle` round it (degrees, 0 ahead), at height y."""
    a = math.radians(angle)
    y = belt_y if y is None else y
    return (skin(at(0, y, 0), Vector((math.sin(a), -math.cos(a), 0))) - at(0, y, 0)).length


# A leather harness from the left shoulder across the chest and back to the right hip, an iron ring
# where it crosses the breastbone.
def strap_origin(q):
    if q.z > arm_y - 0.02:
        return at(q.x * 0.4, arm_y - 0.12, hunch * 0.2)
    return at(0, q.z, 0.01)


def strap_bone(q):
    return "spine_03" if q.z > chest_y + 0.05 else "spine_02" if q.z > hips + 0.14 else "pelvis"


strap([(0.17, arm_y + 0.07, 0.0), (0.13, arm_y, 0.14), (0.05, chest_y + 0.08, 0.2), (-0.06, chest_y - 0.04, 0.18), (-0.15, belt_y + 0.03, 0.1)], 0.055, 0.008, STRAP, strap_bone, strap_origin)
strap([(0.17, arm_y + 0.07, 0.0), (0.12, arm_y - 0.03, -0.14), (0.0, chest_y + 0.02, -0.17), (-0.15, belt_y + 0.03, -0.1)], 0.055, 0.008, STRAP, strap_bone, strap_origin)
ring_at = skin(at(0, chest_y + 0.02, 0.01), Vector((0.28, -1, 0))) + Vector((0, -0.016, 0))
m.ring(ring_at, 0.024, 0.0065, IRON, "spine_02", axis=(0, 1, 0), segments=12)

# A wide belt with an iron plate and a skull on it.
patch(around(belt_y - 0.045, belt_y + 0.045, -180, 180), 24, 2, 0.02, 0.016, LEATHER, "pelvis")
plate = skin(at(0, belt_y, 0), Vector((0, -1, 0))) + Vector((0, -0.026, 0))
m.box(plate, (0.11, 0.014, 0.085), IRON, "pelvis")
skull = plate + Vector((0, -0.028, 0.006))
m.sphere(skull, (0.034, 0.03, 0.036), BONE, "pelvis", segments=10, rings=7)
m.box(skull + Vector((0, -0.006, -0.036)), (0.04, 0.026, 0.022), BONE, "pelvis")
for sign in (1, -1):
    m.sphere(skull + Vector((sign * 0.013, -0.026, 0.002)), (0.009, 0.006, 0.01), 0x1A1410, "pelvis", segments=6, rings=4)
# A loincloth in front, a fur pelt behind, and leather strips round the hips.
panel(0, reach(0) + 0.03, belt_y - 0.02, 0.42, 0.22, 0.17, 0.008, CLOTH, "pelvis", flare=0.05, bulge=0.012, trim=shade(CLOTH, 0.72))
panel(180, reach(180) + 0.03, belt_y - 0.02, 0.36, 0.27, 0.22, 0.016, FUR, "pelvis", flare=0.06, bulge=0.02)
for sign in (1, -1):
    for k, (angle, length) in enumerate(((52, 0.27), (90, 0.3), (128, 0.26))):
        panel(sign * angle, reach(angle) + 0.028, belt_y - 0.02, length, 0.085, 0.075, 0.008, shade(LEATHER, 1 - 0.1 * (k % 2)), "pelvis", flare=0.045, bulge=0.006, nu=2, nv=3, trim=STRAP)

# The spiked iron pauldron on the left shoulder (laid out as the arm hangs), with a lame under it.
centre = (sx + 0.035, arm_y + 0.01, 0.0)
lean = Quaternion((0, 1, 0), math.radians(24))
down = lowered(1)
for k, (e0, e1, grow) in enumerate(((8, 86, 1.0), (-22, 14, 1.07))):
    shell(centre, (0.15 * grow, 0.12 * grow, 0.155 * grow), 90 - 118, 90 + 118, e0, e1, 0.013, lambda i, j, k=k: DARK_IRON if j == 0 else IRON, "upperarm_l", nu=14, nv=4 if k == 0 else 2, tilt=lean, rim=DARK_IRON, xf=down)
c = at(*centre)
for a in (-38, 0, 38):
    ar, er = math.radians(90 + a), math.radians(58)
    out = lean @ Vector((math.sin(ar) * math.cos(er), -math.cos(ar) * math.cos(er), math.sin(er)))
    base = c + Vector((out.x * 0.15, out.y * 0.155, out.z * 0.12)) * 0.96
    m.cone(down(base), down(base + out * 0.11 + Vector((0, 0, 0.03))), 0.026, SPIKE, "upperarm_l", segments=6)
# A fur pad on the right shoulder, shaggy at its rim.
centre = (-(sx + 0.035), arm_y + 0.0, 0.0)
lean = Quaternion((0, 1, 0), math.radians(-32))
down = lowered(-1)
shell(centre, (0.14, 0.085, 0.15), -90 - 120, -90 + 120, -18, 86, 0.02, FUR, "upperarm_r", nu=12, nv=4, tilt=lean, rim=shade(FUR, 0.8), xf=down)
c = at(*centre)
for i in range(12):
    ar, er = math.radians(-90 - 110 + i * 20), math.radians(-18)
    out = lean @ Vector((math.sin(ar) * math.cos(er), -math.cos(ar) * math.cos(er), math.sin(er)))
    base = c + Vector((out.x * 0.14, out.y * 0.15, out.z * 0.085))
    m.cone(down(base), down(base + out * 0.03 + Vector((0, 0, -0.06 - 0.015 * (i % 2)))), 0.024, shade(FUR, 0.9 + 0.1 * (i % 2)), "upperarm_r", segments=4, flat=0.5, facing=out)

for side, sign in (("l", 1), ("r", -1)):
    # Leather bracers with iron bands.
    lo, hi = sign * (sx + elbow + 0.1), sign * (sx + wrist - 0.015)
    patch(round_x(lo, hi, arm_y, 0.0), 12, 2, 0.011, 0.01, LEATHER, f"lowerarm_{side}", rim=STRAP, reach=0.15)
    for f in (0.15, 0.85):
        x = lo + (hi - lo) * f
        patch(round_x(x - 0.012, x + 0.012, arm_y, 0.0), 12, 1, 0.017, 0.008, DARK_IRON, f"lowerarm_{side}", reach=0.15)
    # Fur wrapped round the shins and bound, shaggy at the top.
    calf = f"calf_{side}"
    patch(around(0.1, knee - 0.07, -180, 180, cx=sign * hx), 14, 4, 0.018, 0.016, lambda i, j: FUR if j % 2 == 0 else shade(FUR, 0.8), calf, reach=0.17)
    for i in range(8):
        a = math.radians(-180 + i * 45 + 22)
        d = Vector((math.sin(a), -math.cos(a), 0))
        top = skin(at(sign * hx, knee - 0.07, 0), d, reach=0.17) + d * 0.016
        m.cone(top, top + d * 0.02 + Vector((0, 0, -0.04)), 0.022, shade(FUR, 0.9 + 0.1 * (i % 2)), calf, segments=4, flat=0.5, facing=d)
    patch(around(0.13, 0.15, -180, 180, cx=sign * hx), 14, 1, 0.026, 0.01, STRAP, calf, reach=0.17)
# A band round the left upper arm.
patch(round_x(sx + elbow * 0.6, sx + elbow * 0.6 + 0.03, arm_y + 0.008, 0.01), 12, 1, 0.009, 0.008, STRAP, "upperarm_l", reach=0.15)

# A necklace of teeth on a cord hung over the upper chest.
cord, normals = strap([(-0.13, arm_y + 0.07, -0.03), (-0.1, arm_y - 0.03, 0.15), (0.0, arm_y - 0.085, 0.2), (0.1, arm_y - 0.03, 0.15), (0.13, arm_y + 0.07, -0.03)], 0.012, 0.007, STRAP, lambda q: "spine_03", strap_origin)
for f in (0.32, 0.41, 0.5, 0.59, 0.68):
    i = round(f * (len(cord) - 1))
    root = cord[i] + normals[i] * 0.014
    m.cone(root, root + normals[i] * 0.01 + Vector((0, 0, -0.042 + abs(f - 0.5) * 0.04)), 0.008, BONE, "spine_03", segments=5)

# ── The greataxe: a long haft wrapped at the grip, an iron socket and spike, and two crescent blades,
# bright along their edges. ──
WOOD, EDGE = 0x5A3E26, 0xB4B8BC
head_y = -0.8


def blade(side):
    nu, nv = 8, 4
    top, bottom = [], []
    for j in range(nv + 1):
        v = j / nv
        rt, rb = [], []
        for i in range(nu + 1):
            u = i / nu * 2 - 1
            inner = Vector((side * 0.035, head_y + u * 0.065, 0))
            th = math.radians(u * 62)
            outer = Vector((side * (0.035 + 0.2 * math.cos(th)), head_y + 0.23 * math.sin(th), 0))
            q = Vector((inner.x + (outer.x - inner.x) * v, inner.y + (outer.y - inner.y) * v**1.7, 0))
            half = 0.012 * (1 - v) + 0.0025
            rt.append(q + Vector((0, 0, half)))
            rb.append(q - Vector((0, 0, half)))
        top.append(rt)
        bottom.append(rb)
    slab(top, bottom, lambda i, j: EDGE if j == nv - 1 else IRON, "hand_r")


axe = [
    (m.tube, (Vector((0, 0.34, 0)), Vector((0, -0.92, 0)), 0.024, 0.022, WOOD, "hand_r")),
    (m.tube, (Vector((0, 0.1, 0)), Vector((0, -0.12, 0)), 0.028, 0.028, STRAP, "hand_r")),
    (m.sphere, (Vector((0, 0.35, 0)), (0.032, 0.03, 0.032), DARK_IRON, "hand_r")),
    (m.box, (Vector((0, head_y, 0)), (0.075, 0.17, 0.06), DARK_IRON, "hand_r")),
    (m.cone, (Vector((0, head_y - 0.085, 0)), Vector((0, head_y - 0.21, 0)), 0.028, IRON, "hand_r", 6)),
    (m.ring, (Vector((0, head_y + 0.12, 0)), 0.026, 0.007, DARK_IRON, "hand_r", (1, 1, 1), (0, 1, 0), 10)),
    (blade, (1,)),
    (blade, (-1,)),
]
m.weapon(axe, at(-(sx + p["arm"] + 0.06 * b["h"]), arm_y - 0.014 * b["h"], 0), tilt=-1.0)

m.finish(humanoid_actions(arm_down=72), bake={"size": 512, "ao": 0.08, "mottle": 0.12, "mottle_scale": 60, "dirt": 0.2})
