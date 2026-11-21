"""Kobold (SRD: Small humanoid): under a metre tall with its horns, a small dragon-blooded reptile with
rust-red scales and a pale belly, a narrow toothed snout, big yellow slit-pupilled eyes under a hard
brow, two horns swept back, finned frills for ears, a ridged back and a long tail; a ragged hide
loincloth, a strap across its chest with a pouch, a wrapped forearm and a dagger. Writes
assets/models/kobold.glb. Run (BLENDER: your Blender executable):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_kobold.py
"""

import os
import sys

import bpy
from mathutils import Matrix

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wwblend import STIFF, THRESHOLD, Model, Vector, at, humanoid_actions, humanoid_body, humanoid_joints, shade  # noqa: E402

bpy.ops.wm.read_factory_settings(use_empty=True)

SCALES = 0x9A4A2A
DARK = shade(SCALES, 0.72)
RIDGE = shade(SCALES, 0.6)
BELLY = 0xC99A68
HORN = 0xCFBE9C
FIN = shade(SCALES, 0.85)
FIN_INNER = 0xB8683C
EYE = 0xE6B422
TEETH = 0xE4DAC0
HIDE = 0x6E5640
STRAP = 0x3E2C1E
METAL = 0x6E6A64
STEEL = 0xB0B4B8
GRIP = 0x3A2A1E
WRAP = 0x8A7A5A
p = {
    "leg": 0.3,
    "torso": 0.24,
    "neck": 0.06,
    "shoulders": 0.17,
    "hips": 0.11,
    "arm": 0.245,
    "thick": 1.12,
    "chest": (0.08, 0.066),
    "waist": (0.064, 0.056),
    "hunch": 0.11,
    "hand": 1.55,
    "foot": 1.35,
    "toes": 1.6,
    "fingers": 1.15,
    "claws": True,
    # Standing on its toes: the knee forward, the ankle raised and back (a hock), a long foot.
    "digitigrade": 1.0,
}
m = Model("kobold", resolution=0.0045, faces=6800)
m.group("head", resolution=0.0038, faces=3800, bone="Head")
m.group("tail", resolution=0.006, faces=1100, bone="pelvis")
J = humanoid_joints(p)
m.rig(J)
b = humanoid_body(m, p, {"skin": SCALES, "nails": 0x2A1A10})
s, t, arm_y, sx, hx, chest_y = b["s"], b["t"], b["arm_y"], b["sx"], b["hx"], b["chest_y"]
hips = p["leg"]
(chest_x, chest_z), (waist_x, waist_z) = p["chest"], p["waist"]
hunch = p["hunch"]
# The head is big for the body: its parts are laid out at HS times these sizes.
HS = 1.2
hy = b["head_y"] + 0.05 * HS
hz = hunch + 0.012


def hd(x, dy, dz):
    """A point on the head, from its centre, scaled with it."""
    return (x * HS, hy + dy * HS, hz + dz * HS)


def game(v):
    """A Blender point back in the game's (x, up, forward)."""
    return Vector((v.x, v.z, -v.y))


def ell(c, across, up, depth, colour=SCALES, negative=False, group="body"):
    m.ellipsoid(at(*c), (across, depth, up), colour, negative, group=group)


def ball(c, r, colour=SCALES, negative=False, group="body"):
    m.ball(at(*c), r, colour, negative, group=group)


def cap(a, c, r, colour=SCALES, negative=False, group="body"):
    m.capsule(at(*a), at(*c), r, colour, negative, group=group)


def hell(c, across, up, depth, colour=SCALES, negative=False):
    ell(hd(*c), across * HS, up * HS, depth * HS, colour, negative, "head")


def hball(c, r, colour=SCALES, negative=False):
    ball(hd(*c), r * HS, colour, negative, "head")


def hcap(a, c, r, colour=SCALES, negative=False):
    cap(hd(*a), hd(*c), r * HS, colour, negative, "head")


def hat(x, dy, dz):
    return at(*hd(x, dy, dz))


# ── The head: a rounded skull, a long snout tapering to a narrow tip with a flat bridge, a lower jaw
# tucked under it (pale beneath), a hard brow over sunken sockets, jaw muscles behind the mouth. ──
hell((0, 0.014, -0.014), 0.043, 0.043, 0.05)
hell((0, -0.012, -0.004), 0.041, 0.036, 0.047)
hell((0, -0.004, 0.048), 0.031, 0.025, 0.042)
hell((0, -0.01, 0.086), 0.022, 0.018, 0.036)
hell((0, -0.013, 0.116), 0.0145, 0.0125, 0.018)
hcap((0, 0.024, 0.016), (0, 0.0, 0.118), 0.0095)
hell((0, -0.033, 0.03), 0.028, 0.013, 0.042)
hell((0, -0.033, 0.07), 0.017, 0.0095, 0.034)
hell((0, -0.043, 0.04), 0.022, 0.008, 0.04, BELLY)
hell((0, -0.044, -0.004), 0.03, 0.02, 0.032, BELLY)
for sign in (1, -1):
    hball((sign * 0.029, -0.016, 0.008), 0.02)
    # A hard brow, lower towards the snout: a wary glare.
    hcap((sign * 0.014, 0.022, 0.05), (sign * 0.038, 0.031, 0.02), 0.0075)
    hball((sign * 0.034, 0.011, 0.04), 0.0125, DARK, negative=True)
    # The mouth, along each side of the snout, curling up at its back.
    hcap((sign * 0.034, -0.022, 0.008), (sign * 0.028, -0.026, 0.04), 0.0036, 0x241410, negative=True)
    hcap((sign * 0.028, -0.026, 0.04), (sign * 0.011, -0.026, 0.118), 0.0034, 0x241410, negative=True)
    hball((sign * 0.0075, -0.004, 0.128), 0.0036, 0x1E0E08, negative=True)
    # Scale ridges over the cheeks.
    hcap((sign * 0.04, -0.002, -0.002), (sign * 0.048, 0.0, -0.03), 0.0055, DARK)

for sign in (1, -1):
    # Big yellow eyes with slit pupils, hooded by a scaly lid.
    eye = hat(sign * 0.034, 0.011, 0.038)
    out = Vector((sign * 0.72, -0.69, 0.05)).normalized()
    r = 0.0128 * HS
    m.sphere(eye, (r, r, r * 0.95), EYE, "Head", segments=12, rings=8)
    m.sphere(eye + out * r * 0.88, (0.0026 * HS, 0.0026 * HS, 0.0088 * HS), 0x140A06, "Head", segments=8, rings=6)
    m.sphere(eye + out * r * 0.92 + Vector((0, 0, 0.005)), (0.0016 * HS,) * 3, 0xFFF4DC, "Head", segments=6, rings=4)
    m.sphere(eye + Vector((0, 0, r * 0.55)), (r * 1.1, r * 1.1, r * 0.62), DARK, "Head", segments=12, rings=6)
    # Two horns sweeping back from the top of the skull.
    horn = [hat(sign * 0.023, 0.038, -0.024), hat(sign * 0.031, 0.058, -0.058), hat(sign * 0.037, 0.069, -0.095), hat(sign * 0.04, 0.071, -0.124)]
    m.strand(horn, 0.011 * HS, 0.0038 * HS, HORN, "Head", segments=7)
    m.cone(horn[-1], horn[-1] + Vector((sign * 0.002, 0.02, -0.002)), 0.0038 * HS, HORN, "Head", segments=6)
    # Finned frills for ears, swept back behind the jaw.
    facing = Vector((sign, 0.1, 0.25)).normalized()
    m.leaf(hat(sign * 0.042, 0.004, -0.03), hat(sign * 0.072, 0.02, -0.09), 0.044 * HS, 0.005, FIN, "Head", facing, bend=(sign * 0.005, 0.0, -0.006), notch=0.5, steps=8, cup=0.25, inner=FIN_INNER)
    m.leaf(hat(sign * 0.038, -0.02, -0.024), hat(sign * 0.062, -0.028, -0.07), 0.026 * HS, 0.0045, FIN, "Head", facing, steps=6, cup=0.2, inner=FIN_INNER)
    # A few teeth along the upper jaw, a fang near the front; two little ones up from the lower.
    for dz, length in ((0.05, 0.006), (0.074, 0.007), (0.1, 0.011)):
        width = 0.03 - dz * 0.17
        root = hat(sign * width, -0.024, dz)
        m.cone(root, root + Vector((0, 0, -length * HS)), 0.0028 * HS, TEETH, "Head", segments=5)
    root = hat(sign * 0.016, -0.028, 0.088)
    m.cone(root, root + Vector((0, 0, 0.006 * HS)), 0.0024 * HS, TEETH, "Head", segments=5)
    # Little spikes at the back of the jaw.
    for dy, length in ((-0.03, 0.022), (-0.042, 0.016)):
        base = hat(sign * 0.036, dy, -0.012)
        m.cone(base, base + Vector((sign * 0.006, length, -0.004)), 0.0042, HORN, "Head", segments=5)
# A row of little spines down the back of the skull.
for i in range(3):
    base = hat(0, 0.046 - 0.016 * i, -0.035 - 0.017 * i)
    m.cone(base, base + Vector((0, 0.02, 0.008)), 0.0065, RIDGE, "Head", segments=5)

# ── The body: lean and wiry, hunched, a thicker neck, a pale belly from throat to groin, a ridged back. ──
cap((0, arm_y - 0.03, hunch * 0.45), (0, b["head_y"] + 0.01, hunch + 0.005), 0.032)


def paint(c, across, up, depth, colour, group="body"):
    """Colours the skin inside an ellipsoid (out to 0.79 of these radii) without changing its shape: a
    metaball and a carving one alike cancel out, and the carving one's colour wins inside it. (A clean
    edge, where colouring by the strongest metaball leaves ragged patches.)"""
    ell(c, across / 0.79, up / 0.79, depth / 0.79, SCALES, False, group)
    ell(c, across / 0.79, up / 0.79, depth / 0.79, colour, True, group)


# A pale belly in broad plates from the groin up the chest and on up the front of the neck, each raised a
# little from the scales. (The skin's front leans forward going up, as the probe of the mesh found.)
ROWS = 6
top = chest_y + 0.045
for row in range(ROWS):
    u = row / (ROWS - 1)
    up = hips + 0.03 + u * (top - hips - 0.03)
    surface = waist_z + 0.004 + (up - hips - 0.03) * 0.26
    ell((0, up, surface - 0.0095), 0.034 + 0.014 * u, 0.018, 0.0125)
    paint((0, up, surface + 0.003), 0.03 + 0.012 * u, 0.02, 0.022, BELLY)
neck_a, neck_b = Vector((arm_y - 0.03, hunch * 0.45)), Vector((b["head_y"] + 0.01, hunch + 0.005))
for i in range(4):
    up, fwd = neck_a + (neck_b - neck_a) * (0.1 + i * 0.27)
    ell((0, up, fwd + 0.033), 0.021, 0.016, 0.01)
    paint((0, up, fwd + 0.043), 0.019, 0.02, 0.02, BELLY)
for sign in (1, -1):
    ell((sign * (sx * 0.5), arm_y - 0.002, hunch * 0.25), 0.04, 0.02, 0.03)
for side, sign in (("l", 1), ("r", -1)):
    ell((sign * (sx + 0.005), arm_y + 0.006, 0.0), 0.03, 0.028, 0.03)
    ell((sign * (sx + p["arm"] * 0.66), arm_y + 0.004, 0.004), 0.04, 0.022, 0.022)
    # A lizard's leg: a heavy thigh, fullest behind, a lean shin back to the hock, a long foot.
    hip, knee, ankle, toe = (game(J[f"{n}_{side}"]) for n in ("thigh", "calf", "foot", "ball"))
    ell(tuple(hip.lerp(knee, 0.45) + Vector((0, 0.0, -0.004))), 0.031, 0.056, 0.044)
    ell(tuple(hip.lerp(knee, 0.2) + Vector((0, 0.0, -0.018))), 0.028, 0.036, 0.032)
    ell(tuple(knee.lerp(ankle, 0.3) + Vector((0, 0.0, -0.01))), 0.025, 0.034, 0.028)
    cap(tuple(knee.lerp(ankle, 0.5)), tuple(ankle), 0.017)
    cap(tuple(ankle), tuple(ankle.lerp(toe, 0.7)), 0.0155)
    ball(tuple(ankle + Vector((0, 0.002, -0.008))), 0.016, DARK)
SPINES = 8
for i in range(SPINES):
    u = i / (SPINES - 1)
    up = arm_y + 0.02 - u * (arm_y + 0.02 - hips - 0.05)
    back = hunch * (0.42 - 0.4 * u) - (chest_z * (1 - u) + waist_z * u) * 0.98
    base = at(0, up, back)
    bone = "spine_03" if up > chest_y + 0.03 else ("spine_02" if up > hips + 0.08 else "spine_01")
    m.cone(base, base + Vector((0, 0.024 - u * 0.008, 0.014 - u * 0.004)), 0.0095 - u * 0.003, RIDGE, bone, segments=5)

# ── The tail: thick at its root, long and tapering, sweeping back and down and curling a little to one
# side, pale beneath, with a ridge of spines along its top. ──
TAIL = 9


def along(u, drop=0.0):
    return (0.08 * u**2.2, hips - 0.02 - 0.34 * u + 0.1 * u * u - drop, -waist_z * 0.5 - 0.4 * u)


for i in range(TAIL):
    u0, u1 = i / TAIL, (i + 1) / TAIL
    r0, r1 = 0.042 * (1 - u0) ** 0.85 + 0.005, 0.042 * (1 - u1) ** 0.85 + 0.005
    cap(along(u0), along(u1), (r0 + r1) / 2, group="tail")
    cap(along(u0, r0 * 0.42), along(u1, r1 * 0.42), (r0 + r1) / 2 * 0.64, BELLY, group="tail")
    if i < TAIL - 2:
        c = Vector(at(*along((u0 + u1) / 2)))
        m.cone(c + Vector((0, 0, r0 * 0.8)), c + Vector((0, 0.014, r0 * 0.8 + 0.016 * (1 - u0 * 0.5))), 0.0075 * (1 - u0) + 0.0025, RIDGE, "pelvis", segments=5)

# ── Gear: a belt with a ragged hide loincloth, a strap from the right shoulder to the left hip with a
# pouch, a wrapped left forearm. ──
belt_y = hips + 0.035 * s
m.ring(at(0, belt_y, 0.002), 1, 0.13, STRAP, "pelvis", scale=(waist_x * 1.14, waist_z * 1.22, s * 0.32))
for sign, colour, length, width in ((1, HIDE, 0.13, 0.085), (-1, shade(HIDE, 0.82), 0.11, 0.09)):
    top, bottom = at(0, belt_y, sign * waist_z * 1.2), at(0.006, hips - length, sign * (waist_z * 1.16 + 0.012))
    m.leaf(top, bottom, width, 0.006, colour, "pelvis", (0, -sign, 0), notch=0.55, steps=8)
for sign in (1, -1):
    m.leaf(at(sign * waist_x * 1.04, belt_y, 0.006), at(sign * waist_x * 1.1, hips - 0.06, 0.0), 0.07, 0.005, shade(HIDE, 0.9), "pelvis", (sign, 0, 0), notch=0.4, steps=6)
pouch = at(waist_x * 0.85, belt_y - 0.025, waist_z * 0.62)
m.box(pouch, (0.03, 0.026, 0.032), HIDE, "pelvis")
m.box(pouch + Vector((0, -0.012, 0.012)), (0.031, 0.006, 0.012), STRAP, "pelvis")


def strap(points, bone_of, width=0.014, thick=0.005):
    """A flat strap along `points` (game coordinates), lying on the body: its broad side faces out."""
    pts = [at(*q) for q in points]
    for a, c in zip(pts, pts[1:]):
        mid = (a + c) / 2
        y = (c - a).normalized()
        out = Vector((mid.x, mid.y + hunch * 0.2, 0))
        z = (out - y * out.dot(y)).normalized()
        x = y.cross(z)
        rot = Matrix((x, y, z)).transposed().to_quaternion()
        m.box(mid, (width, (c - a).length * 1.06, thick), STRAP, bone_of(mid), rot)


def field(q):
    """The body's metaball field at q (game coordinates): the skin is where it falls to THRESHOLD."""
    point = at(*q)
    return sum(STIFF * m._field(point, e) * (-1 if e[3] else 1) for e in m.elements if e[4] == "body")


def on_skin(q, direction, lift=0.0035):
    """The point where a line out from inside the body through q, along `direction`, leaves the skin."""
    d = Vector(direction).normalized()
    q = Vector(q) - d * 0.1
    inside = False
    for _ in range(200):
        if field(q) > THRESHOLD:
            inside = True
        elif inside:
            return tuple(q + d * lift)
        q += d * 0.001
    return tuple(q)


def strap_on_skin(route, bone_of, splits=2):
    """A strap through `route` ([(point, direction out)]), each point and the points between pulled onto
    the skin, so it lies on the body all the way."""
    for _ in range(splits):
        finer = []
        for (q0, d0), (q1, d1) in zip(route, route[1:]):
            finer.append((q0, d0))
            finer.append(((Vector(q0) + Vector(q1)) / 2, (Vector(d0).normalized() + Vector(d1).normalized()) / 2))
        route = finer + [route[-1]]
    strap([on_skin(q, d) for q, d in route], bone_of)


FWD, BACK, UP = (0, 0, 1), (0, 0, -1), (0, 1, 0)
strap_on_skin(
    [
        ((waist_x * 0.95, belt_y + 0.004, 0.0), (0.4, 0, -1)),
        ((0.0, chest_y + 0.01, 0.0), BACK),
        ((-sx * 0.55, arm_y + 0.0, -0.02), (-0.2, 0.6, -0.6)),
        ((-sx * 0.7, arm_y + 0.02, hunch * 0.15), UP),
        ((-sx * 0.55, arm_y - 0.005, 0.03), (-0.2, 0.6, 0.6)),
        ((-0.015, chest_y + 0.035, 0.0), FWD),
        ((waist_x * 0.5, chest_y - 0.04, 0.0), FWD),
        ((waist_x * 0.95, belt_y + 0.004, 0.0), (0.4, 0, 1)),
    ],
    lambda q: "spine_03" if q.z > chest_y + 0.02 else ("spine_02" if q.z > chest_y - 0.03 else "spine_01"),
)
elbow, wrist = p["arm"] * 0.52, p["arm"]
for k in range(3):
    m.ring(at(sx + elbow + 0.025 + k * 0.03, arm_y, 0), 0.022 - k * 0.001, 0.0055, shade(WRAP, 1 - 0.07 * (k % 2)), "lowerarm_l", axis=(1, 0, 0), segments=10)

# ── The dagger (bestiary's at 0.75): a wrapped grip and pommel, a short guard, a plain blade. ──
k = 0.75
point = 0.055 * k
blade_len = 0.22 * k - point
dagger = [
    (m.tube, (Vector((0, 0.06 * k, 0)), Vector((0, -0.045 * k, 0)), 0.013 * k, 0.013 * k, GRIP, "hand_r")),
    (m.sphere, (Vector((0, 0.066 * k, 0)), (0.017 * k,) * 3, METAL, "hand_r")),
    (m.box, (Vector((0, -0.05 * k, 0)), (0.08 * k, 0.02 * k, 0.018 * k), METAL, "hand_r")),
    (m.box, (Vector((0, -(0.06 * k + blade_len / 2), 0)), (0.035 * k, blade_len, 0.009 * k), STEEL, "hand_r")),
    (m.box, (Vector((0, -(0.06 * k + blade_len / 2), 0)), (0.01 * k, blade_len, 0.011 * k), shade(STEEL, 0.8), "hand_r")),
    (m.cone, (Vector((0, -(0.06 * k + blade_len), 0)), Vector((0, -(0.06 * k + blade_len + point), 0)), 0.0175 * k, STEEL, "hand_r", 4, 0.26, (0, 0, 1), False)),
]
m.weapon(dagger, at(-(sx + p["arm"] + 0.06 * b["h"]), arm_y - 0.014 * b["h"], 0), tilt=-0.4)

m.finish(humanoid_actions(arm_down=72), bake={"size": 512, "ao": 0.05, "mottle": 0.12, "mottle_scale": 110, "dirt": 0.12})
