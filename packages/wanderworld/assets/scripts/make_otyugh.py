"""Otyugh (SRD: Large aberration): a filthy, bloated, lumpy sack of a body about two metres across, crouched
low on three thick elephant-like legs; a huge gaping maw splitting its front, ringed with jagged uneven
fangs over a dark wet throat; a wrinkled stalk rising from its back with a cluster of three small mean
eyes under heavy lids; and two long ropy tentacles, held raised, ending in thorny leaf-shaped clubs. Its
hide is a mottled sickly grey-green and brown, warty, folded and scarred, with sores and patches of filth.
Writes assets/models/otyugh.glb, on a skeleton of its own: the body, a jaw, two bones for each leg, four up
the stalk and six down each tentacle. Run (BLENDER: your Blender executable):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_otyugh.py
"""

import math
import os
import random
import sys

from mathutils import noise

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wwblend import Vector, at  # noqa: E402
from wwtentacle import Creature, add, aim, cap, chain, curve, directions, even, glossy, keys, loop, skeleton, turn, wave  # noqa: E402

SKIN = 0x5A5C48
OLIVE = 0x4E5440
BROWN = 0x5A4A36
DARK = 0x34342A
FILTH = 0x2A271E
BELLY = 0x6A664E
WART = 0x66624A
SORE = 0x6A3428
PUS = 0x8A7E44
LIP = 0x4A3530
THROAT = 0x160807
TONGUE = 0x4E1E1A
GUM = 0x5A2E28
TEETH = 0xB8AA80
OLD_TEETH = 0x95825C
EYE = 0xC09A28
PUPIL = 0x0E0804
LID = 0x46463A
HORN = 0x2E281E
THORN = 0x7A6C50

m = Creature("otyugh", resolution=0.0125, faces=11000)
m.group("jaw", resolution=0.012, faces=1600, bone="Jaw")
rng = random.Random(11)
UP = Vector((0, 0, 1))

# ── The skeleton ──
LEGS = {  # each leg's hip and where its foot stands, (x, up, forward)
    "fl": (at(0.42, 0.44, 0.26), at(0.5, 0.0, 0.36)),
    "fr": (at(-0.44, 0.44, 0.24), at(-0.52, 0.0, 0.34)),
    "b": (at(0.04, 0.44, -0.44), at(0.06, 0.0, -0.56)),
}
STALK = [at(-0.12, 1.28, -0.18), at(-0.16, 1.62, -0.28), at(-0.1, 1.86, -0.12), at(-0.06, 1.9, 0.12)]
# The tentacles rise from the shoulders, arch up and over, and hold their clubs out in front.
TENTACLE_CURVE = [at(0.74, 1.02, 0.06), at(1.12, 1.32, 0.0), at(1.3, 1.8, 0.3), at(1.02, 1.82, 0.72), at(0.8, 1.42, 0.92)]
JAW_HINGE = at(0, 0.82, 0.12)

bones = [("Root", None), ("Body", "Root"), ("Jaw", "Body")]
joints = {
    "Root": at(0, 0, 0),
    "Root.tail": at(0, 0.25, 0),
    "Body": at(0, 0.4, 0),
    "Body.tail": at(0, 1.3, 0),
    "Jaw": JAW_HINGE,
    "Jaw.tail": at(0, 0.66, 0.72),
}
legs = {}
for name, (hip, foot) in LEGS.items():
    knee = hip.lerp(foot, 0.5)
    knee.z = 0.22
    legs[name] = (f"leg_{name}_01", f"leg_{name}_02")
    bones += [(legs[name][0], "Body"), (legs[name][1], legs[name][0])]
    joints.update({legs[name][0]: hip, legs[name][1]: knee, f"{legs[name][1]}.tail": foot + Vector((0, 0, 0.1))})
stalk = chain(bones, joints, "stalk", STALK, "Body", count=4)
tentacles = {}
for side, sign in (("l", 1), ("r", -1)):
    controls = [Vector((sign * c.x, c.y, c.z)) for c in TENTACLE_CURVE]
    tentacles[side] = (chain(bones, joints, f"tentacle_{side}", controls, "Body", count=6), controls, sign)
rig = skeleton(m, bones, joints)
REST = {}  # each tentacle bone's way at rest
for names, _c, _s in tentacles.values():
    REST.update(directions(joints, names))

# ── The body: a bloated, sagging, lopsided sack, humped on one side, a fold of loose skin under the maw ──
m.ellipsoid(at(0, 0.82, -0.06), (0.84, 0.66, 0.54), SKIN)
m.ellipsoid(at(0.1, 0.62, 0.08), (0.78, 0.6, 0.36), BELLY)  # (the belly sags low and forward)
m.ellipsoid(at(-0.3, 1.1, -0.28), (0.5, 0.44, 0.34), OLIVE)  # a hump high on the right of its back
m.ellipsoid(at(0.38, 1.0, -0.42), (0.38, 0.34, 0.3), SKIN)
m.ellipsoid(at(0.62, 0.72, -0.18), (0.3, 0.34, 0.32), BROWN)
m.ellipsoid(at(-0.66, 0.66, 0.0), (0.26, 0.3, 0.3), OLIVE)
m.ellipsoid(at(0.0, 0.5, 0.42), (0.5, 0.26, 0.14), BELLY)  # the hanging fold under the jaw
for k in range(26):
    # Swellings, cysts and lumps all over, bigger and fewer on the back.
    a = rng.uniform(0, 2 * math.pi)
    up = rng.uniform(0.45, 1.3)
    if math.cos(a) > 0.55 and up < 1.15:
        continue  # (keep the front clear for the maw)
    rad = 0.82 * math.sqrt(max(0.05, 1 - ((up - 0.82) / 0.66) ** 2))
    centre = at(math.sin(a) * rad * 0.9, up, math.cos(a) * rad * 0.62 - 0.06)
    m.ball(centre, rng.uniform(0.07, 0.17), (WART, OLIVE, BROWN, SKIN)[k % 4])

# The maw: a crescent gash across the whole front, deepest in the middle, under a thick ragged upper lip
# that sags at the corners; the lower lip and its teeth are on the jaw.
MAW = [(-0.5, 0.86, 0.36, 0.12), (-0.26, 0.84, 0.48, 0.19), (0.0, 0.84, 0.52, 0.23), (0.26, 0.84, 0.48, 0.19), (0.5, 0.86, 0.36, 0.12)]
for x, up, fwd, r in MAW:
    m.ellipsoid(at(x, up, fwd), (r * 1.3, r * 1.4, r), THROAT, negative=True)
m.ellipsoid(at(0, 0.84, 0.25), (0.45, 0.32, 0.18), THROAT, negative=True)
for i in range(len(MAW) - 1):
    (x0, u0, f0, r0), (x1, u1, f1, r1) = MAW[i], MAW[i + 1]
    m.capsule(at(x0 * 1.05, u0 + r0 + 0.02, f0 + 0.04), at(x1 * 1.05, u1 + r1 + 0.02, f1 + 0.04), 0.07, LIP)
for sign in (1, -1):
    m.ball(at(sign * 0.62, 0.8, 0.3), 0.1, LIP)
m.ellipsoid(at(0, 0.6, 0.5), (0.52, 0.09, 0.15), LIP, group="jaw")
m.ellipsoid(at(0, 0.6, 0.36), (0.42, 0.08, 0.14), GUM, group="jaw")
m.ellipsoid(at(0.05, 0.68, 0.28), (0.26, 0.05, 0.16), TONGUE, group="jaw")
m.ball(at(0.12, 0.7, 0.36), 0.06, TONGUE, group="jaw")


def fang(root, down, length, r, bone, colour):
    """A jagged fang from `root`, `down` its way (bent a little at random)."""
    tip = root + (down + Vector((rng.uniform(-0.25, 0.25), rng.uniform(-0.2, 0.25), 0))).normalized() * length
    m.cone(root, tip, r, colour, bone, segments=5)


# Fangs: crowded, uneven, some long and hooked, some broken short, an inner row behind.
for row, (count, scale, inset) in enumerate(((19, 1.0, 0.0), (11, 0.6, 0.09))):
    for k in range(count):
        u = (k + rng.uniform(-0.3, 0.3)) / (count - 1) * 2 - 1
        x = u * (0.56 - inset)
        top = 0.84 + 0.2 * (1 - u * u) + 0.02 - inset * 0.3
        fwd = 0.38 + 0.16 * (1 - u * u) - inset
        length = scale * rng.choice((0.05, 0.08, 0.11, 0.15, 0.19)) * (1 - 0.35 * abs(u))
        fang(at(x, top, fwd), Vector((0, -0.15, -1)), length, scale * rng.uniform(0.018, 0.03), "Body", TEETH if k % 3 else OLD_TEETH)
    for k in range(count - 2):
        u = (k + rng.uniform(-0.3, 0.3)) / (count - 3) * 2 - 1
        x = u * (0.5 - inset)
        fwd = 0.5 - 0.06 * u * u - inset
        length = scale * rng.choice((0.04, 0.07, 0.1, 0.13)) * (1 - 0.3 * abs(u))
        fang(at(x, 0.66, fwd), Vector((0, -0.1, 1)), length, scale * rng.uniform(0.016, 0.026), "Jaw", TEETH if k % 4 else OLD_TEETH)

# The legs: thick wrinkled columns on broad round feet, each with four heavy blunt toenails.
for name, (hip, foot) in LEGS.items():
    knee = joints[f"leg_{name}_02"]
    m.capsule(hip, knee, 0.22, SKIN)
    m.capsule(knee, foot + Vector((0, 0, 0.2)), 0.2, OLIVE)
    m.ellipsoid(foot + Vector((0, 0, 0.1)), (0.24, 0.24, 0.1), DARK)
    out = Vector((foot.x, foot.y + (0.0 if name != "b" else 0.0), 0))
    face = (at(0, 0, 1) + out.normalized() * 0.6).normalized() if name != "b" else out.normalized()
    side = face.cross(UP)
    for k in (-1.5, -0.5, 0.5, 1.5):
        d = (face + side * 0.42 * k).normalized()
        m.sphere(foot + Vector((0, 0, 0.055)) + d * 0.22, (0.055, 0.055, 0.045), HORN, legs[name][1], segments=8, rings=6)

# The stalk: a thick wrinkled stem rising from the back, bowed forward, ending in a knobby head with three
# small mean eyes under heavy lids and a few ragged flaps of skin behind.
points = even(curve(STALK, 48), 7)
for i in range(7):
    m.capsule(points[i], points[i + 1], 0.1 - 0.007 * i, OLIVE if i % 2 else SKIN)
head = points[-1] + (points[-1] - points[-2]).normalized() * 0.05
m.ellipsoid(head, (0.11, 0.1, 0.09), SKIN)
look = at(0, -0.25, 1).normalized()
for x, up in ((0.045, 0.012), (-0.045, 0.012), (0.0, 0.058)):
    eye = head + at(x, up, 0) + look * 0.085
    m.ball(eye + at(0, 0.03, -0.005), 0.032, DARK)  # (a brow over each)
    m.sphere(eye, (0.026,) * 3, EYE, stalk[-1], segments=10, rings=8)
    m.sphere(eye + look * 0.022, (0.006, 0.004, 0.015), PUPIL, stalk[-1], segments=6, rings=4)
    # (Lids drawn half down: a narrow glare.)
    cap(m, eye, 0.03, 0.006, at(0, 1, 0.35), 72, LID, stalk[-1])
for k, a in enumerate((-60, 0, 60)):
    out = Vector((math.sin(math.radians(a)), 0.6, math.cos(math.radians(a)))).normalized()
    base = head + out * 0.07
    m.leaf(base, base + out * 0.13 + Vector((0, 0, 0.03)), 0.09, 0.012, DARK, stalk[-1], (0, 0, 1), steps=5, notch=0.5)


def rope(controls, r0, r1, pieces=16, twists=3.0):
    """A ropy tentacle: a core with two strands of muscle twisted round it."""
    pts = even(curve(controls, 64), pieces)
    for i in range(pieces):
        u = (i + 0.5) / pieces
        r = r0 + (r1 - r0) * u**0.85
        m.capsule(pts[i], pts[i + 1], r * 0.78, SKIN)
    strands = [[], []]
    for i, p in enumerate(pts):
        u = i / pieces
        t = (pts[min(pieces, i + 1)] - pts[max(0, i - 1)]).normalized()
        a = t.cross(UP if abs(t.z) < 0.9 else Vector((1, 0, 0))).normalized()
        b = t.cross(a)
        r = r0 + (r1 - r0) * u**0.85
        for k in range(2):
            ang = 2 * math.pi * (twists * u + k / 2)
            strands[k].append(p + (a * math.cos(ang) + b * math.sin(ang)) * r * 0.42)
    for k, strand in enumerate(strands):
        for i in range(pieces):
            u = (i + 0.5) / pieces
            r = r0 + (r1 - r0) * u**0.85
            m.capsule(strand[i], strand[i + 1], r * 0.5, OLIVE if k else DARK)
    return pts


# The tentacles: long and ropy, from swollen shoulders, each ending in a heavy leaf-shaped club, thorned
# along its edges, over its back and down its middle, with a long spike at its point.
for side, (names, controls, sign) in tentacles.items():
    pts = rope(controls, 0.13, 0.065)
    m.ball(controls[0] + Vector((-sign * 0.08, 0, 0)), 0.19, SKIN)
    end, along = pts[-1], (pts[-1] - pts[-2]).normalized()
    up = (Vector((sign * 0.4, 0, 1)) - along * Vector((sign * 0.4, 0, 1)).dot(along)).normalized()
    across = up.cross(along)
    m.leaf(end - along * 0.06, end + along * 0.6, 0.4, 0.13, DARK, names[-1], up, steps=8)
    for u in (0.1, 0.22, 0.34, 0.46, 0.58, 0.7, 0.8):
        half = 0.4 / 1.3 * (0.6 + 1.2 * u) * (1 - u) ** 1.1
        for s in (1, -1):
            root = end - along * 0.06 + along * 0.66 * u + across * s * half * 0.85
            length = rng.uniform(0.07, 0.13)
            m.cone(root, root + (across * s + along * 0.5 - up * 0.1).normalized() * length, 0.024, THORN, names[-1], segments=5)
    for u in (0.12, 0.3, 0.48, 0.64):
        for s in (-1, 1):
            root = end + along * 0.6 * u + up * 0.05 + across * s * 0.05
            m.cone(root, root + (up + along * 0.35).normalized() * rng.uniform(0.07, 0.12), 0.022, THORN, names[-1], segments=5)
        root = end + along * 0.6 * u - up * 0.05
        m.cone(root, root + (-up + along * 0.3).normalized() * 0.07, 0.02, THORN, names[-1], segments=5)
    m.cone(end + along * 0.5, end + along * 0.78, 0.035, THORN, names[-1], segments=6)


# ── The hide: lumpy, warty, folded and scarred; filthy low down, with sores ──
def hide(co, normal):
    lump = noise.fractal(co * 3.2, 0.8, 2.1, 4) * 0.035
    warts = max(0.0, noise.noise(co * 15 + Vector((3, 1, 7))) - 0.35) * 0.09
    folds = -0.022 * max(0.0, 1 - abs(math.sin(co.z * 22 + noise.noise(co * 2.5) * 3))) ** 6
    scars = -0.015 * max(0.0, noise.ridged_multi_fractal(co * 5 + Vector((9, 2, 4)), 1.0, 2.0, 2, 1.0, 2.0) - 1.4)
    return normal * (lump + warts + folds + scars)


def grime(p, colour):
    if colour not in (SKIN, OLIVE, BELLY, WART, BROWN):
        return colour
    if noise.noise(p * 9 + Vector((5, 5, 5))) > 0.5:
        return PUS if noise.noise(p * 30) > 0.2 else SORE
    if p.z < 0.42 and noise.noise(p * 4 + Vector((1, 8, 2))) > -0.25:
        return FILTH
    n = noise.noise(p * 2.6 + Vector((2, 3, 4)))
    if n > 0.3:
        return BROWN
    if n < -0.35:
        return DARK
    return colour


m.shapes = {"body": hide, "jaw": hide}
m.paint = grime

# ── Actions ──
X, Y, Z = (1, 0, 0), (0, 1, 0), (0, 0, 1)  # (about X tips forward and down; Y rolls to the right; Z turns left)


def writhe(own, u, amount=1.0, cycles=1):
    for side, (names, _controls, sign) in tentacles.items():
        for i, name in enumerate(names):
            add(own, name, turn(Y, amount * 5 * sign * wave(u, cycles, 0.1 * sign - i * 0.13)))
            add(own, name, turn(Z, amount * 5 * wave(u, cycles, 0.35 + 0.2 * sign - i * 0.11)))


def look(own, u, amount=1.0):
    for i, name in enumerate(stalk):
        add(own, name, turn(Z, amount * 6 * wave(u, 1, 0.2 - i * 0.08)) @ turn(X, amount * 4 * wave(u, 2, i * 0.1)))


def idle(u):
    own = {}
    add(own, "Body", turn(X, 1.5 * wave(u, 2)) @ turn(Y, 1.5 * wave(u, 1, 0.25)))
    for name in ("leg_fl_01", "leg_fr_01", "leg_b_01"):
        add(own, name, turn(X, -1.5 * wave(u, 2)))
    add(own, "Jaw", turn(X, 4 + 5 * wave(u, 3)))
    look(own, u)
    writhe(own, u)
    return own


def waddle(u, swing, lift, sway):
    own = {}
    # The body rolls onto each leg in turn and bobs; each leg swings through and lifts in its third.
    add(own, "Body", turn(Y, sway * wave(u, 1, 0.08)) @ turn(Z, sway * 0.6 * wave(u, 1, 0.33)) @ turn(X, 2 * wave(u, 3)))
    for k, name in enumerate(("fl", "fr", "b")):
        phase = u + k / 3
        s = -math.cos(2 * math.pi * phase)
        up = max(0.0, math.sin(2 * math.pi * phase)) ** 1.5
        upper, lower = legs[name]
        # (Undo the body's roll on the leg, so the feet stay near the ground.)
        add(own, upper, turn(Y, -sway * wave(u, 1, 0.08)) @ turn(X, -swing * s - lift * up))
        add(own, lower, turn(X, lift * 1.7 * up))
    add(own, "Jaw", turn(X, 6 + 3 * wave(u, 3)))
    look(own, u, 0.6)
    for i, name in enumerate(stalk):
        add(own, name, turn(X, -3 * wave(u, 3, -0.15 - 0.1 * i)))
    writhe(own, u, 0.8)
    for side, (names, _c, sign) in tentacles.items():
        add(own, names[0], turn(X, swing * 0.3 * wave(u, 1, 0.5 if sign > 0 else 0)))
    return own


def attack(u):
    # Both tentacles swing up high and back, then slam down in front; the body lurches into it, mouth wide.
    reach = keys([(0, 0), (0.33, 1), (0.75, 1), (1, 0)], u)
    raise_ = keys([(0, 0), (0.33, 1), (0.48, 1), (0.58, 0), (1, 0)], u)
    slam = keys([(0, 0), (0.5, 0), (0.6, 1), (0.75, 1), (1, 0)], u)
    lurch = keys([(0, 0), (0.35, -1), (0.5, -0.6), (0.62, 1), (0.8, 0.8), (1, 0)], u)
    own = {}
    add(own, "Body", turn(X, 7 * lurch))
    for name in ("leg_fl_01", "leg_fr_01", "leg_b_01"):
        add(own, name, turn(X, -7 * lurch))
    add(own, "Jaw", turn(X, 8 + 22 * max(0.0, lurch)))
    for i, name in enumerate(stalk):
        add(own, name, turn(X, -6 * lurch))
    for side, (names, _c, sign) in tentacles.items():
        # Up and back over its shoulder, then swept over the top and down in front; the tip lags a little.
        high, low = at(sign * 0.5, 1, -0.35), at(sign * 0.3, -0.75, 1)
        way = high.normalized().slerp(low.normalized(), keys([(0, 0), (0.48, 0), (0.6, 1), (1, 1)], u))
        aim(own, names, REST, way, [reach * (1 - 0.06 * i) for i in range(6)])
        for i, name in enumerate(names[2:]):
            # (The far end curls back as it's raised and whips over as it comes down.)
            add(own, name, turn(at(sign, 0, 0), 9 * raise_ - 12 * slam))
    writhe(own, u, 0.3)
    return own


m.finish(
    {
        "Idle": loop(90, 2, idle),
        "Walk": loop(42, 2, lambda u: waddle(u, 14, 14, 5)),
        "Run": loop(24, 1, lambda u: waddle(u, 22, 22, 8)),
        "Attack": loop(33, 1, attack),
    },
    bake={"size": 512, "ao": 0.32, "mottle": 0.28, "mottle_scale": 16, "dirt": 0.55},
)
glossy(m, 0.62)
mesh = m.armature.children[0]
top = max(v.co.z for v in mesh.data.vertices)
xs = [v.co.x for v in mesh.data.vertices]
print(f"otyugh: {top:.2f} m tall, {max(xs) - min(xs):.2f} m across (rest pose)")
