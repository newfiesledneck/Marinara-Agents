"""Hobgoblin (SRD: Medium humanoid): a disciplined goblinoid soldier about 1.8 metres tall, with rust-red
skin, a heavy brow over amber eyes, a broad flat nose, small lower tusks, ears swept back and black hair
pulled up in a topknot; mail under a red tabard with gold trim, layered iron pauldrons, a gorget,
vambraces and greaves, a longsword in the right hand and a round shield on the left forearm. Writes
assets/models/hobgoblin.glb. Run (BLENDER: your Blender executable):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_hobgoblin.py
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

SKIN = 0xB0532F
DARK = shade(SKIN, 0.62)
BROW = shade(SKIN, 0.88)
LIPS = shade(SKIN, 0.78)
HAIR = 0x1A1512
BROWS = 0x2A1C16
EYE = 0xE0A030
TUSK = 0xE2D6B8
MAIL = 0x6A6C70
STEEL = 0x8C9096
IRON = 0x4E5258
RED = 0x8A231C
GOLD = 0xB0904A
LEATHER = 0x4A3424
BOOT = 0x3A2C22
TROUSER = 0x3A3028
p = {
    "leg": 0.86,
    "torso": 0.6,
    "neck": 0.08,
    "shoulders": 0.42,
    "hips": 0.2,
    "arm": 0.6,
    "thick": 1.2,
    "chest": (0.18, 0.125),
    "waist": (0.14, 0.105),
    "hunch": 0.03,
    "hand": 1.05,
    "foot": 1.1,
}
m = Model("hobgoblin", resolution=0.007, faces=4600)
m.group("head", resolution=0.0038, faces=3600, bone="Head")
m.rig(humanoid_joints(p))
b = humanoid_body(m, p, {"skin": SKIN, "shirt": MAIL, "limbs": MAIL, "legs": TROUSER, "shins": BOOT, "feet": BOOT})
s, t, arm_y, sx, hx, chest_y, knee = b["s"], b["t"], b["arm_y"], b["sx"], b["hx"], b["chest_y"], b["knee"]
hips = p["leg"]
(chest_x, chest_z), (waist_x, waist_z) = p["chest"], p["waist"]
hunch = p["hunch"]
hy = b["head_y"] + 0.075
hz = hunch + 0.015
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


HS = 1.14  # the head's scale: its features are laid out for a head about 0.21 m tall


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


# ── The head: a long, hard face; a broad skull, a heavy brow knotted over deep-set amber eyes, high
# cheekbones, a broad flat nose, a square jaw, a firm mouth with two small tusks standing from the lower
# lip, and black hair drawn up into a topknot with the sides shaved. ──
hell((0, 0.025, -0.02), 0.079, 0.098, 0.1)
hell((0, -0.03, 0.02), 0.076, 0.06, 0.08)
hell((0, -0.075, 0.03), 0.068, 0.034, 0.07)
hell((0, -0.1, 0.068), 0.034, 0.02, 0.028)
hell((0, -0.058, 0.074), 0.048, 0.03, 0.034)
hell((0, 0.028, 0.078), 0.074, 0.017, 0.026, BROW)
hball((0, 0.017, 0.097), 0.011, BROW)
for sign in (1, -1):
    hball((sign * 0.056, -0.07, -0.005), 0.03)
    hcap((sign * 0.012, 0.021, 0.098), (sign * 0.056, 0.036, 0.081), 0.0115, BROWS)
    hball((sign * 0.033, 0.004, 0.092), 0.0145, DARK, negative=True)
    hell((sign * 0.034, -0.011, 0.088), 0.017, 0.006, 0.01, BROW)
    hell((sign * 0.05, -0.006, 0.07), 0.024, 0.014, 0.02)
    hball((sign * 0.02, -0.032, 0.1), 0.0105, BROW)
    hball((sign * 0.0105, -0.036, 0.112), 0.0048, 0x241410, negative=True)
# A broad flat nose: a short bridge and a wide, low tip.
hcap((0, 0.008, 0.097), (0, -0.02, 0.107), 0.0105, BROW)
hell((0, -0.028, 0.106), 0.027, 0.014, 0.014, BROW)
# A firm mouth: a thin upper lip, a flattened lower one.
hcap((-0.031, -0.058, 0.106), (0.031, -0.058, 0.106), 0.0048, 0x24120E, negative=True)
hell((0, -0.05, 0.104), 0.034, 0.008, 0.011, LIPS)
hell((0, -0.067, 0.101), 0.03, 0.008, 0.012, LIPS)
# Hair: a cap over the crown and the back of the skull, standing a little proud of it; the sides shaved.
hell((0, 0.055, -0.035), 0.07, 0.086, 0.096, HAIR)

for sign in (1, -1):
    # Amber eyes under the brow.
    eye = hat(sign * 0.033, 0.004, 0.082)
    m.sphere(eye, (0.0125 * HS, 0.0095 * HS, 0.0088 * HS), EYE, "Head", segments=10, rings=8)
    m.sphere(eye + Vector((0, -0.0093 * HS, 0)), (0.0042 * HS, 0.0018 * HS, 0.0052 * HS), 0x140A06, "Head", segments=8, rings=6)
    m.sphere(eye + Vector((sign * 0.003, -0.0103 * HS, 0.0028)), (0.002, 0.0011, 0.002), 0xFFF0DC, "Head", segments=6, rings=4)
    # Pointed ears swept back and up.
    base, tip = hat(sign * 0.076, 0.0, -0.012), hat(sign * 0.13, 0.055, -0.155)
    m.leaf(base, tip, 0.08 * HS, 0.013, SKIN, "Head", Vector((sign, 0.15, 0.25)), bend=(sign * 0.012, 0, 0.012), steps=8, cup=0.32, inner=shade(SKIN, 0.7))
    # Small tusks standing up from the lower lip.
    root = hat(sign * 0.022, -0.066, 0.106)
    m.cone(root, root + Vector((sign * 0.002, -0.003, 0.023)), 0.0075, TUSK, "Head", segments=6)

# The topknot: a knot bound in a gold band, its tail falling down the back.
m.sphere(hat(0, 0.13, -0.045), (0.034, 0.04, 0.036), HAIR, "Head", segments=10, rings=6)
m.ring(hat(0, 0.106, -0.045), 0.028, 0.007, GOLD, "Head", segments=10)
tail = [(0, 0.15, -0.06), (0, 0.13, -0.11), (0, 0.07, -0.145), (0, -0.01, -0.158), (0, -0.08, -0.148)]
m.strand([hat(*q) for q in tail], 0.02, 0.007, HAIR, "Head", segments=6)

# ── The body under the armour: a deep chest, broad back and shoulders, corded forearms, solid thighs. ──
for sign in (1, -1):
    ell((sign * 0.075, arm_y + 0.03, hunch * 0.1 - 0.01), 0.07, 0.04, 0.05, MAIL)
    ell((sign * 0.06, chest_y + 0.1, chest_z * 0.75), 0.07, 0.05, 0.04, MAIL)
    ell((sign * 0.105, chest_y + 0.05, -0.02), 0.06, 0.12, 0.07, MAIL)
    ell((sign * (sx + 0.015), arm_y + 0.005, 0.0), 0.06, 0.055, 0.055, MAIL)
    ell((sign * (sx + elbow + 0.05), arm_y + 0.004, 0.004), 0.06, 0.04, 0.04)
    ell((sign * (sx + elbow * 0.55), arm_y + 0.004, 0.012), elbow * 0.36, 0.05, 0.052, MAIL)
    ell((sign * (hx + 0.005), (hips + knee) / 2, 0.01), 0.07, 0.11, 0.07, TROUSER)

# ── The armour. ──
belt_y = hips + 0.1
top_y = arm_y - 0.03
# A red tabard over the mail, gold at its edges, front and back down to the belt.
for centre in (0, 180):
    patch(around(belt_y - 0.01, top_y, centre - 54, centre + 54), 12, 9, 0.007, 0.006, lambda i, j: GOLD if i in (0, 11) else RED, "spine_03")
# The hauberk's skirt down to the knees, split front and back for the legs.
skirt(belt_y, knee + 0.02, 0.23, 0.16, ((22, 158), (-158, -22)), 0.008, 0.01, MAIL, "pelvis", rim=IRON)
# The tabard's flaps over the splits, and iron tassets at the hips.
panel(0, waist_z + 0.035, belt_y, 0.46, 0.24, 0.28, 0.008, RED, "pelvis", flare=0.05, bulge=0.012, trim=GOLD)
panel(180, waist_z + 0.03, belt_y, 0.44, 0.24, 0.27, 0.008, RED, "pelvis", flare=0.05, bulge=0.012, trim=GOLD)
side = (skin(at(0, belt_y, 0), Vector((1, 0, 0))) - at(0, belt_y, 0)).length
for sign in (1, -1):
    panel(sign * 90, side + 0.022, belt_y + 0.005, 0.17, 0.15, 0.17, 0.009, STEEL, "pelvis", flare=0.035, bulge=0.016, trim=IRON, nv=3)
# The belt, with a brass buckle and a pouch.
patch(around(belt_y - 0.03, belt_y + 0.03, -180, 180), 24, 1, 0.018, 0.012, LEATHER, "pelvis")
buckle = skin(at(0, belt_y, 0), Vector((0, -1, 0))) + Vector((0, -0.022, 0))
m.box(buckle, (0.06, 0.012, 0.055), GOLD, "pelvis")
m.box(buckle + Vector((0, -0.005, 0)), (0.034, 0.006, 0.03), LEATHER, "pelvis")
pouch = skin(at(0, belt_y - 0.04, 0), Vector((-0.6, -0.8, 0))) + Vector((-0.02, -0.03, 0))
m.box(pouch, (0.06, 0.04, 0.07), LEATHER, "pelvis")
# A gorget round the throat.
gorget = at(0, arm_y - 0.04, hunch * 0.35)


def collar(u, v):
    a, e = math.radians(-180 + 360 * u), math.radians(30 + 28 * v)
    return gorget, Vector((math.sin(a) * math.cos(e), -math.cos(a) * math.cos(e), math.sin(e)))


patch(collar, 20, 2, 0.012, 0.01, STEEL, "spine_03", rim=IRON)
for side, sign in (("l", 1), ("r", -1)):
    bone = f"upperarm_{side}"
    # Layered iron pauldrons: a dome and two lames, each with a dark rim.
    # (Laid out with the arm hanging, so they sit on the shoulders as it's held, sloping outward.)
    centre = (sign * (sx + 0.03), arm_y + 0.005, 0.0)
    lean = Quaternion((0, 1, 0), sign * math.radians(28))
    for k, (e0, e1, grow) in enumerate(((8, 86, 1.0), (-18, 16, 1.06), (-42, -12, 1.12))):
        shell(centre, (0.105 * grow, 0.09 * grow, 0.11 * grow), sign * 90 - 115, sign * 90 + 115, e0, e1, 0.01, lambda i, j, k=k: IRON if j == 0 and k else STEEL, bone, nu=14, nv=4 if k == 0 else 2, tilt=lean, rim=IRON, xf=lowered(sign))
    # Vambraces over the forearms from the elbow, strapped on.
    a, c = at(sign * (sx + elbow + 0.015), arm_y, 0), at(sign * (sx + wrist - 0.015), arm_y, 0)
    m.tube(a, c, 0.058, 0.045, STEEL, f"lowerarm_{side}", segments=12)
    for f in (0.3, 0.75):
        m.ring(a + (c - a) * f, 0.055 - 0.011 * f, 0.005, LEATHER, f"lowerarm_{side}", axis=(1, 0, 0), segments=12)
    # Knee-high boots with a turned-down cuff, steel greaves strapped over their fronts, knee cops.
    calf = f"calf_{side}"
    patch(around(knee - 0.075, knee - 0.03, -180, 180, cx=sign * hx), 16, 1, 0.012, 0.012, shade(BOOT, 1.2), calf, reach=0.15)
    patch(around(0.15, knee - 0.035, -52, 52, cx=sign * hx), 6, 4, 0.022, 0.007, STEEL, calf, rim=IRON, reach=0.15)
    f = b["f"]
    m.sphere(at(sign * hx, 0.052, 0.03 * f), (0.066 * f, 0.105 * f, 0.056), BOOT, f"foot_{side}", segments=12, rings=7)
    m.sphere(at(sign * hx, 0.04, 0.125 * f), (0.062 * f, 0.072 * f, 0.042), BOOT, f"ball_{side}", segments=12, rings=6)
    shell((sign * hx, knee + 0.005, 0.035), (0.085, 0.07, 0.07), -75, 75, -40, 70, 0.008, STEEL, calf, nu=8, nv=4, rim=IRON)

# ── The longsword: a wrapped grip, a brass pommel and cross, and a long straight blade with a fuller. ──
k = s
GRIP, GUARD = 0x3A2A1E, 0x8A7448
sword = [
    (m.tube, (Vector((0, 0.06 * k, 0)), Vector((0, -0.09 * k, 0)), 0.016 * k, 0.017 * k, GRIP, "hand_r")),
    (m.sphere, (Vector((0, 0.075 * k, 0)), (0.024 * k, 0.022 * k, 0.024 * k), GUARD, "hand_r")),
    (m.box, (Vector((0, -0.098 * k, 0)), (0.18 * k, 0.024 * k, 0.03 * k), GUARD, "hand_r")),
    (m.sphere, (Vector((0.095 * k, -0.098 * k, 0)), (0.018 * k,) * 3, GUARD, "hand_r")),
    (m.sphere, (Vector((-0.095 * k, -0.098 * k, 0)), (0.018 * k,) * 3, GUARD, "hand_r")),
]
blade = 0.78 * k
mid = Vector((0, -(0.11 * k + blade / 2), 0))
sword.append((m.box, (mid, (0.05 * k, blade, 0.009 * k), 0xB9BEC2, "hand_r")))
sword.append((m.box, (mid + Vector((0, 0.05 * k, 0)), (0.012 * k, blade * 0.8, 0.0115 * k), 0x80868C, "hand_r")))
end = Vector((0, -(0.11 * k + blade), 0))
sword.append((m.cone, (end, end + Vector((0, -0.07 * k, 0)), 0.0355 * k, 0xB9BEC2, "hand_r", 4, 0.25, (0, 0, 1), False)))
m.weapon(sword, at(-(sx + p["arm"] + 0.06 * b["h"]), arm_y - 0.014 * b["h"], 0), tilt=-0.5)

# ── The round shield on the back of the left forearm: a red face with a black legion triangle, an iron
# rim and boss. ──
r = 0.25 * s
sc = (sx + p["arm"] * 0.72, arm_y + 0.058 * t + 0.02, 0.0)
NU, NV = 24, 6


def shield_face(i, j):
    # The face's column (round) and row (from the rim in): black inside a triangle pointing down, which
    # with the arm lowered is towards the hand (+x here).
    a = math.radians(-180 + 360 * (i + 0.5) / NU)
    rr = math.cos(math.radians(8 + 80 * (j + 0.5) / NV))
    x, z = math.sin(a) * rr, -math.cos(a) * rr
    inside = all(nx * x + nz * z <= 0.38 for nx, nz in ((-1, 0), (0.5, 0.866), (0.5, -0.866)))
    return 0x1E1A18 if inside and rr > 0.12 else RED


shell(sc, (r, 0.05, r), -180, 180, 8, 88, 0.014, shield_face, "lowerarm_l", nu=NU, nv=NV, rim=IRON)
m.ring(at(*sc) + Vector((0, 0, 0.006)), r, 0.014, IRON, "lowerarm_l", segments=24)
m.sphere(at(*sc) + Vector((0, 0, 0.05)), (r * 0.2, r * 0.2, r * 0.12), IRON, "lowerarm_l", segments=12, rings=6)

m.finish(humanoid_actions(arm_down=72), bake={"size": 512, "ao": 0.08, "mottle": 0.1, "mottle_scale": 60, "dirt": 0.2})
