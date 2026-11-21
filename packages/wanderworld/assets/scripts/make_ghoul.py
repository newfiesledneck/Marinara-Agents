"""Ghoul (SRD: Medium undead): a stooped, emaciated corpse-eater about 1.5 metres tall, bent over with its
back rounded and its head carried low and forward on a short neck; ashen grey-green skin stretched over its
ribs, spine, shoulder blades, collarbones and knuckles, a skull-like head with sunken cheeks, pointed ears,
pale yellow eyes glowing deep in dark sockets, a flat nose of slits and a wide mouth of jagged teeth; very
long clawed fingers, long clawed toes and a tattered loincloth on a rope. Writes assets/models/ghoul.glb.
Run (BLENDER: your Blender executable):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_ghoul.py
"""

import math
import os
import sys

import bpy

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wwblend import STIFF, THRESHOLD, Model, Vector, at, humanoid_actions, humanoid_body, humanoid_joints, shade  # noqa: E402

bpy.ops.wm.read_factory_settings(use_empty=True)

SKIN = 0x8E9584
BONY = shade(SKIN, 1.1)
HOLLOW = shade(SKIN, 0.78)
SOCKET = 0x221E1A
MOUTH = 0x2A1414
TEETH = 0xC9BD92
CLAW = 0x3A3228
EYE = 0xF6EC9C
GLOW = 0xFFFBD8
RAG = 0x5C5446
RAG_DARK = 0x463F35
ROPE = 0x4A4034
p = {
    "leg": 0.84,
    "torso": 0.56,
    "neck": 0.05,
    "shoulders": 0.3,
    "hips": 0.17,
    "arm": 0.7,
    "thick": 0.72,
    "chest": (0.13, 0.09),
    "waist": (0.09, 0.064),
    "hunch": 0.3,
    "hand": 1.25,
    "foot": 1.15,
    "fingers": 1.9,
    "toes": 1.6,
}
# The stoop, as the rest pose itself: the spine curves forward and down from the hips (spine_01, spine_02,
# spine_03, neck_01, Head), and the shoulders hang from the bent upper back, rolled forward. (The game turns
# the bones from this pose, so the stoop stays when it walks and strikes.)
SPINE = [(0, 0.93, -0.005), (0, 1.07, 0.03), (0, 1.18, 0.1), (0, 1.25, 0.19), (0, 1.265, 0.275)]
SHOULDER = (1.165, 0.13)  # (up, forward)

m = Model("ghoul", resolution=0.0075, faces=7000)
m.group("head", resolution=0.0045, faces=5200, bone="Head")


def stooped(spine, shoulder, colours):
    """The people's skeleton laid out bent over, and humanoid_body's limbs built on it: its arms moved to
    hang from `shoulder`, its own upright torso and neck left out (built below, along the curved spine)."""
    joints = humanoid_joints(p)
    s = p["leg"] / 0.9
    for name, q in zip(("spine_01", "spine_02", "spine_03", "neck_01", "Head"), spine):
        joints[name] = at(*q)
    joints["Head.tail"] = joints["Head"] + Vector((0, 0, 0.2 * s))
    arm_y = p["leg"] + p["torso"] * 0.88
    shift = at(0, shoulder[0] - arm_y, shoulder[1])
    for side, sign in (("l", 1), ("r", -1)):
        for name in (f"upperarm_{side}", f"lowerarm_{side}", f"hand_{side}", f"hand_{side}.tail"):
            joints[name] = joints[name] + shift
        joints[f"clavicle_{side}"] = at(sign * 0.03 * s, shoulder[0] - 0.01 * s, spine[2][2])
    m.rig(joints)
    n0, p0 = len(m.elements), len(m.parts)
    b = humanoid_body(m, p, colours)
    kept = m.elements[:n0]
    for kind, data, colour, negative, group in m.elements[n0:]:
        centre = (data[0] + data[1]) / 2 if kind == "CAPSULE" else data[0]
        if abs(centre.x) < 1e-6:
            continue  # (the upright torso and neck)
        if abs(centre.x) > b["sx"] * 0.75 and abs(centre.z - arm_y) < 0.15 * s:
            data = (data[0] + shift, data[1] + shift, data[2]) if kind == "CAPSULE" else (data[0] + shift, data[1])
        kept.append((kind, data, colour, negative, group))
    m.elements[:] = kept
    for i in range(p0, len(m.parts)):
        verts, faces, colour, bone, smooth = m.parts[i]
        if bone.startswith("hand_"):
            m.parts[i] = ([v + shift for v in verts], faces, colour, bone, smooth)
    return b


b = stooped(SPINE, SHOULDER, {"skin": SKIN})
s, t, sx, hx, h, f = b["s"], b["t"], b["sx"], b["hx"], b["h"], b["f"]
hips = p["leg"]
ay, az = SHOULDER  # where the arms hang from
hy = SPINE[-1][1] + 0.075
hz = SPINE[-1][2] + 0.035


def ell(c, across, up, depth, colour=SKIN, negative=False, group="body"):
    m.ellipsoid(at(*c), (across, depth, up), colour, negative, group=group)


def ball(c, r, colour=SKIN, negative=False, group="body"):
    m.ball(at(*c), r, colour, negative, group=group)


def cap(a, c, r, colour=SKIN, negative=False, group="body"):
    m.capsule(at(*a), at(*c), r, colour, negative, group=group)


def surface(origin, direction, group="body"):
    """Where a ray from `origin` (inside the skin, game coordinates) along `direction` leaves the metaball
    skin built so far, in Blender coordinates; and the ray's direction."""
    elements = [e for e in m.elements if e[4] == group]

    def inside(q):
        return STIFF * sum((-1 if e[3] else 1) * m._field(q, e) for e in elements) > THRESHOLD

    o, d = at(*origin), at(*direction).normalized()
    near, far = 0.0, 0.0
    while inside(o + d * far) and far < 0.6:
        near, far = far, far + 0.006
    for _ in range(10):
        mid = (near + far) / 2
        near, far = (mid, far) if inside(o + d * mid) else (near, mid)
    return o + d * near, d


def _curve(points, per=12):
    """A smooth line through `points` (game coordinates), and the length along it at each of its points."""
    pts = [Vector(q) for q in points]
    pts = [pts[0] * 2 - pts[1]] + pts + [pts[-1] * 2 - pts[-2]]
    out = []
    for i in range(1, len(pts) - 2):
        p0, p1, p2, p3 = pts[i - 1], pts[i], pts[i + 1], pts[i + 2]
        for k in range(per):
            u = k / per
            out.append(0.5 * (2 * p1 + (p2 - p0) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (3 * p1 - p0 - 3 * p2 + p3) * u**3))
    out.append(pts[-2])
    lengths = [0.0]
    for a, c in zip(out, out[1:]):
        lengths.append(lengths[-1] + (c - a).length)
    return out, lengths


# The spine's curve, from the pelvis to the head.
CURVE = _curve([(0, hips, 0)] + SPINE)
X = Vector((1, 0, 0))


def along(u):
    """The spine at `u` (0 at the pelvis, 1 at the head, by length): its point, the way it runs and the way
    its front faces (game coordinates)."""
    out, lengths = CURVE
    target = max(0.0, min(1.0, u)) * lengths[-1]
    i = next((k for k in range(1, len(lengths)) if lengths[k] >= target), len(lengths) - 1)
    a, c = out[i - 1], out[i]
    w = (target - lengths[i - 1]) / max(1e-9, lengths[i] - lengths[i - 1])
    run = (c - a).normalized()
    return a.lerp(c, w), run, Vector((0, -run.z, run.y))


def body_along(keys):
    """A body along the spine: `keys` [(u, half width, half depth, pushed forward by, colour)], and between
    them a round profile from the side, wider across, so the back curves with the spine."""
    total = CURVE[1][-1]
    u = 0.0
    while u <= 1.0:
        i = next((k for k in range(1, len(keys)) if keys[k][0] >= u), len(keys) - 1)
        k0, k1 = keys[i - 1], keys[i]
        w = max(0.0, min(1.0, (u - k0[0]) / max(1e-9, k1[0] - k0[0])))
        across, depth, push = (k0[n] + (k1[n] - k0[n]) * w for n in (1, 2, 3))
        centre, run, front = along(u)
        ell(tuple(centre + front * push), across, depth, depth, k0[4] if w < 0.5 else k1[4])
        u += depth * 0.7 / total


H = {"group": "head"}


def hp(x, y, z):
    """A point on the head, from its centre."""
    return (x, hy + y, hz + z)


# ── The head: a narrow skull, a heavy brow over deep dark sockets, cheekbones over hollow cheeks and
# temples, a flat nose of two slits, a wide mouth of jagged teeth and a pointed chin. The shapes first;
# the hollows are cut where the skin turns out to be, and the eyes and teeth set by what's left. ──
ell(hp(0, 0.025, -0.02), 0.068, 0.076, 0.09, **H)
ell(hp(0, -0.035, 0.03), 0.045, 0.06, 0.06, **H)
ell(hp(0, -0.082, 0.032), 0.038, 0.03, 0.054, **H)
ell(hp(0, -0.1, 0.056), 0.017, 0.016, 0.022, **H)
# (A brow knotted in a scowl: higher at the sides.)
for sign in (1, -1):
    cap(hp(0, 0.024, 0.052), hp(sign * 0.056, 0.036, 0.03), 0.014, **H)
cap(hp(0, 0.016, 0.07), hp(0, -0.018, 0.082), 0.006, BONY, **H)
ell(hp(0, -0.026, 0.08), 0.013, 0.008, 0.008, **H)


def on_head(x, y, direction=(0, 0, 1), depth=0.0):
    """Where the head's skin is, straight out from (x, y) on the head's middle; `depth` in from there."""
    q, d = surface(hp(x * 0.5, y, 0.0), direction, "head")
    return q - d * depth


cuts = []
for sign in (1, -1):
    cuts.append((on_head(sign * 0.029, 0.007, (sign * 0.15, 0, 1), 0.006), 0.022, SOCKET))
    cuts.append((on_head(sign * 0.03, -0.054, (sign * 0.9, 0, 1), -0.002), 0.017, HOLLOW))
    cuts.append((on_head(sign * 0.05, 0.03, (sign * 1, 0, 0.4), -0.007), 0.014, HOLLOW))
    cuts.append((on_head(sign * 0.007, -0.031, (sign * 0.1, -0.3, 1), 0.001), 0.0045, SOCKET))
cheeks = [on_head(sign * 0.03, -0.012, (sign * 1, 0, 0.8), 0.007) for sign in (1, -1)]
mouth = [on_head(x, -0.06, (x * 12, 0, 1), 0.0) for x in (-0.042, -0.028, -0.014, 0.0, 0.014, 0.028, 0.042)]
for q, r, colour in cuts:
    m.ball(q, r, colour, True, group="head")
for q in cheeks:
    m.ball(q, 0.011, BONY, group="head")
for a, c in zip(mouth, mouth[1:]):
    m.capsule(a, c, 0.0115, MOUTH, True, group="head")
# Darkness inside the mouth and at the back of each socket: small cuts just behind the skin, which take
# their colour without cutting much deeper.
for x in (-0.03, -0.015, 0.0, 0.015, 0.03):
    q, d = surface(hp(x * 0.5, -0.06, 0.0), (x * 12, 0, 1), "head")
    m.ball(q - d * 0.003, 0.011, MOUTH, True, group="head")
for sign in (1, -1):
    q, d = surface(hp(sign * 0.024, 0.007, 0.0), (sign * 0.15, 0, 1), "head")
    m.ball(q - d * 0.003, 0.013, SOCKET, True, group="head")

for sign in (1, -1):
    # Small pale yellow eyes glowing at the bottom of the sockets, a bright point in each.
    eye, d = surface(hp(sign * 0.024, 0.007, 0.0), (sign * 0.15, 0, 1), "head")
    eye = eye - d * 0.002
    m.sphere(eye, (0.0072, 0.0055, 0.0062), EYE, "Head", segments=10, rings=8)
    m.sphere(eye + d * 0.0048 + Vector((0, 0, 0.0005)), (0.0028, 0.0012, 0.0028), GLOW, "Head", segments=6, rings=4)
    # Pointed ears swept back and up, cupped.
    base, tip = at(*hp(sign * 0.07, 0.0, -0.01)), at(*hp(sign * 0.15, 0.07, -0.075))
    m.leaf(base, tip, 0.06, 0.01, SKIN, "Head", Vector((sign, -0.4, 0.1)).normalized(), bend=(0, 0.01, 0.01), notch=0.55 if sign < 0 else None, steps=8, cup=0.4, inner=0x6E605A)
# Jagged teeth along the curve of the mouth, rooted in the lips: the upper row longer, pointing down,
# with longer fangs at the corners; the lower row pointing up.
for row, (y, dy, lengths) in enumerate(((-0.045, -1, (0.009, 0.016, 0.01, 0.012, 0.009, 0.013, 0.017, 0.01)), (-0.075, 1, (0.008, 0.011, 0.007, 0.009, 0.01, 0.007, 0.012, 0.008)))):
    for i, length in enumerate(lengths):
        x = -0.035 + i * 0.01
        root, d = surface(hp(x * 0.5, y, 0.0), (x * 12, 0, 1), "head")
        root = root - d * 0.005 + Vector((0, 0, dy * 0.004))
        m.cone(root, root + d * 0.002 + Vector((x * 0.1, 0, dy * length)), 0.0034 + length * 0.12, TEETH, "Head", segments=5)

# ── The body: gaunt, bent over. The torso leans forward from the hips and rounds over into a short sinewy
# neck: a sunken belly under a narrow ribcage, the upper back broadest, the shoulders rolled forward off
# it; knobbed shoulders, elbows, wrists, knees and ankles. ──
body_along(
    [
        (0.0, 0.122, 0.08, 0.0, SKIN),
        (0.1, 0.112, 0.072, 0.0, SKIN),
        (0.2, 0.09, 0.062, -0.01, SKIN),
        (0.3, 0.104, 0.074, -0.002, SKIN),
        (0.4, 0.13, 0.094, 0.008, SKIN),
        (0.53, 0.136, 0.102, 0.004, SKIN),
        (0.66, 0.126, 0.098, -0.012, SKIN),
        (0.78, 0.085, 0.074, -0.01, SKIN),
        (0.88, 0.05, 0.05, 0.0, SKIN),
        (1.0, 0.044, 0.044, 0.0, SKIN),
    ]
)
for sign in (1, -1):
    # The crests of the hips standing out at the sides, over a sunken belly.
    c, run, front = along(0.1)
    ball(tuple(c + X * sign * 0.09 + front * 0.03 + run * 0.02), 0.015, BONY)
    # The shoulders: from the upper back out to each shoulder joint, and the cords from the neck to them.
    c, run, front = along(0.66)
    cap(tuple(c + X * sign * 0.05 - front * 0.01), (sign * sx, ay + 0.005, az), 0.038)
    c, run, front = along(0.86)
    cap(tuple(c + X * sign * 0.015), (sign * (sx - 0.02), ay + 0.025, az - 0.01), 0.022)
    ball((sign * sx, ay + 0.022, az), 0.03 * s, BONY)
    ell((sign * (sx + 0.025), ay + 0.004, az), 0.05, 0.03, 0.032)
    elbow, wrist = p["arm"] * 0.52, p["arm"]
    ball((sign * (sx + elbow), ay, az - 0.012), 0.026, BONY)
    ball((sign * (sx + wrist - 0.01), ay, az), 0.021, BONY)
    ball((sign * hx, b["knee"] + 0.01, 0.022), 0.033, BONY)
    # Bony ankles and the tendons over each foot.
    ball((sign * (hx + 0.03), 0.085 * s, 0.0), 0.014, BONY)
    ball((sign * (hx - 0.028), 0.09 * s, 0.0), 0.013, BONY)
    for toe in range(3):
        tx = sign * hx + (toe - 1) * 0.03 * f
        cap((sign * hx + (toe - 1) * 0.012, 0.08 * s, 0.02), (tx, 0.035 * f, 0.11 * f), 0.009)
    # Stringy thighs tapering to the knee, and a lean calf behind each shin.
    ell((sign * (hx + 0.008), hips - 0.13, 0.008), 0.044, 0.13, 0.046)
    ell((sign * hx, b["knee"] - 0.1, -0.016), 0.03, 0.08, 0.033)

# Then what lies on the skin, placed where the skin is first: ribs arching round the chest square to the
# spine (their front ends lower, the breastbone showing between them), the knobs of the spine all down the
# bent back, the edges of the shoulder blades, the collarbones.
ribs = []
for k in range(5):
    centre, run, front = along(0.62 - k * 0.052)
    for sign in (1, -1):
        points = []
        for j in range(7):
            theta = 0.28 + 0.07 * k + j * (1.75 - 0.07 * k) / 6
            origin = centre - run * 0.022 * (1 - theta / 1.75)
            q, d = surface(tuple(origin), tuple(X * sign * math.sin(theta) + front * math.cos(theta)))
            points.append(q - d * 0.0025)
        ribs.append(points)
spine = []
for k in range(15):
    centre, run, front = along(0.06 + k * 0.058)
    q, d = surface(tuple(centre), tuple(-front))
    spine.append(q - d * 0.005)
blades = []
for sign in (1, -1):
    ends = []
    for u, out in ((0.68, 0.055), (0.6, 0.075), (0.51, 0.06)):
        centre, run, front = along(u)
        q, d = surface(tuple(centre + X * sign * out), tuple(-front))
        ends.append(q - d * 0.006)
    blades.append(ends)
collar = []
for sign in (1, -1):
    centre, run, front = along(0.78)
    a, da = surface(tuple(centre), tuple(front + X * sign * 0.25))
    c, dc = surface((sign * (sx - 0.02), ay + 0.01, az), (sign * 0.2, 0.5, 1))
    collar.append((a - da * 0.003, c - dc * 0.003))
for points in ribs:
    for a, c in zip(points, points[1:]):
        m.capsule(a, c, 0.0056, BONY)
for q in spine:
    m.ball(q, 0.0095, BONY)
for ends in blades:
    for a, c in zip(ends, ends[1:]):
        m.capsule(a, c, 0.011, BONY)
for a, c in collar:
    m.capsule(a, c, 0.0085, BONY)

# Long curved claws on the fingers, the thumbs and the toes (as humanoid_body lays the fingers out).
reach, length = p["fingers"], p["toes"]
for side, sign in (("l", 1), ("r", -1)):

    def x(offset):
        return sign * (sx + offset)

    wrist = p["arm"]
    for i in range(4):
        z = (i - 1.5) * 0.022 * h
        knuckle = at(x(wrist + (0.075 + 0.045 * reach) * h), ay - 0.012 * h, az + z * 1.08)
        tip = knuckle + Vector((sign * 0.035 * reach * h, 0, -0.022 * reach * h))
        bend = tip + Vector((sign * 0.03 * h, 0, -0.025 * h))
        m.tube(tip, bend, 0.0075 * h, 0.005 * h, CLAW, f"hand_{side}", segments=5)
        m.cone(bend, bend + Vector((sign * 0.012 * h, 0, -0.035 * h)), 0.005 * h, CLAW, f"hand_{side}", segments=5)
    thumb = at(x(wrist + 0.07 * h), ay - 0.012 * h, az + 0.075 * h)
    m.cone(thumb, thumb + Vector((sign * 0.03 * h, -0.02 * h, -0.02 * h)), 0.008 * h, CLAW, f"hand_{side}", segments=5)
    for toe in range(3):
        tx = sign * hx + (toe - 1) * 0.03 * f
        tip = at(tx * 1.03, 0.014 * f, (0.12 + 0.04 * length) * f)
        m.cone(tip, tip + Vector((0, -0.04 * f, -0.016 * f)), 0.009 * f, CLAW, f"ball_{side}", segments=5)

# ── Rags: a rope round the waist, a torn loincloth hanging front and back, and a strip at the hip. ──
belt_y = hips + 0.035 * s
waist_x, waist_z = 0.09, 0.06
m.ring(at(0, belt_y, 0.0), 1, 0.1, ROPE, "pelvis", scale=(waist_x * 1.25, waist_z * 1.35, 0.11))
m.leaf(at(0.005, belt_y, waist_z * 1.3), at(0.02, hips - 0.21, waist_z * 1.25 + 0.015), 0.13, 0.006, RAG, "pelvis", (0, -1, 0), notch=0.7, steps=8)
m.leaf(at(-0.03, belt_y - 0.01, waist_z * 1.32), at(-0.045, hips - 0.15, waist_z * 1.3 + 0.012), 0.07, 0.006, RAG_DARK, "pelvis", (0, -1, 0), notch=0.4, steps=6)
m.leaf(at(0, belt_y, -waist_z * 1.3), at(-0.01, hips - 0.24, -waist_z * 1.3 - 0.02), 0.14, 0.006, RAG_DARK, "pelvis", (0, 1, 0), notch=0.6, steps=8)
m.leaf(at(waist_x * 1.2, belt_y, 0.01), at(waist_x * 1.3, hips - 0.17, 0.0), 0.05, 0.005, RAG, "pelvis", (1, 0, 0), steps=6)

m.finish(humanoid_actions(arm_down=70), bake={"size": 512, "ao": 0.07, "mottle": 0.17, "mottle_scale": 45, "dirt": 0.2})
