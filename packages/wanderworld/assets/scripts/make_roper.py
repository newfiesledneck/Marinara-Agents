"""Roper (SRD: Large monstrosity): a jagged, crooked stalagmite of wet cave rock about 2.7 metres tall,
layered, cracked and streaked with minerals, gripping the floor with uneven rocky roots; high on its front
one great bloodshot yellow eye glares from under a heavy stony brow, and low down a wide maw lined with
jagged stone fangs gapes over a dark throat, drooling; six long thin sticky grey tendrils coil and lash
from knobbly nodules on its sides. Writes assets/models/roper.glb, on a skeleton of its own: four up the
body, eight roots round the base, a jaw, an eyelid, two holding the teeth, and six bones down each
tendril. Its "Hidden" action is just a rock formation: tendrils drawn into their nodules, teeth drawn in,
eye and mouth shut. Run (BLENDER: your Blender executable):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_roper.py
"""

import math
import os
import random
import sys

import bmesh
from mathutils import Quaternion, noise

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wwblend import Vector, at  # noqa: E402
from wwtentacle import Creature, add, aim, cap, chain, directions, glossy, keys, loop, skeleton, turn, tube, wave  # noqa: E402

ROCK = 0x67635B
DARK = 0x524C44
WET = 0x3A3631
STREAK = 0x857D6E
PALE = 0xA0988A
RUST = 0x6A5A4A
TENDRIL = 0x6A665F
STICKY = 0x8A857A
IRIS = 0xE0A21E
IRIS_RING = 0x9A5A10
WHITE = 0xC2B48A
VEIN = 0x8A1C14
PUPIL = 0x0C0604
THROAT = 0x120707
GUM = 0x3E2420
FANG = 0x9C9482
OLD_FANG = 0x787061
DROOL = 0x8C887A

m = Creature("roper", resolution=0.0105, faces=10500)
m.group("jaw", resolution=0.012, faces=1000, bone="Jaw")
m.group("tendrils", resolution=0.0052, faces=4600, bone=None)
rng = random.Random(23)
UP = Vector((0, 0, 1))

# The body's profile: (height, radius, squash across, offset) up its crooked axis.
PROFILE = [(0.22, 0.62), (0.52, 0.55), (0.84, 0.5), (1.14, 0.42), (1.44, 0.37), (1.74, 0.3), (2.02, 0.22), (2.24, 0.14), (2.4, 0.08), (2.5, 0.04)]
EYE_H, MOUTH_H = 1.8, 0.86


def axis(h):
    """The middle of the body at height h: it leans back and wanders to one side as it rises."""
    return at(0.07 * math.sin(h * 1.7) - 0.03 * h, h, -0.09 * (h / 2.7) ** 1.5 + 0.025 * math.sin(h * 2.6))


def radius(h):
    for (h0, r0), (h1, r1) in zip(PROFILE, PROFILE[1:]):
        if h <= h1:
            return r0 + (r1 - r0) * max(0.0, (h - h0) / (h1 - h0))
    return PROFILE[-1][1]


def way(degrees):
    """Outwards, `degrees` round from the front (to the left above 0)."""
    a = math.radians(degrees)
    return at(math.sin(a), 0, math.cos(a))


def around(h, degrees, out=1.0):
    return axis(h) + way(degrees) * radius(h) * out


def surface(h, degrees, depth=0.0):
    """Where the skin is at height h, `degrees` round (before its roughening), moved out by `depth`."""
    c, d = axis(h), way(degrees)
    body = [e for e in m.elements if e[4] == "body" and not e[3]]
    t = 0.0
    # (A metaball's skin lies where the fields add up to THRESHOLD / STIFF.)
    while t < 1.5 and sum(m._field(c + d * t, e) for e in body) > 0.15:
        t += 0.004
    return c + d * (t + depth)


# ── The body: lopsided lumps of rock stacked up a crooked axis, hung with flowstone drapes, a spur or two ──
for i, (h, r) in enumerate(PROFILE):
    sx, sy = rng.uniform(0.85, 1.15), rng.uniform(0.85, 1.1)
    shift = at(rng.uniform(-0.05, 0.05) * r, 0, rng.uniform(-0.04, 0.04) * r)
    m.ellipsoid(axis(h) + shift, (r * sx, r * sy, 0.22 if i else 0.21), (ROCK, DARK, ROCK, STREAK, ROCK, DARK, ROCK, ROCK, DARK, DARK)[i])
    if i > 1:
        h0, r0 = PROFILE[i - 1]
        m.capsule(axis(h0), axis(h), (r0 + r) * 0.33, ROCK)
m.capsule(axis(2.3) + at(0.05, 0, -0.02), axis(2.6) + at(0.1, 0.12, -0.05), 0.04, DARK)  # a crooked second point
# Flowstone: drapes of rock running down its sides (none down the front, over the eye and the maw).
for k in range(13):
    d = 50 + k * 20 + rng.uniform(-6, 6)
    top, bottom = rng.uniform(1.3, 2.25), rng.uniform(0.2, 0.9)
    m.capsule(around(top, d, 0.85), around(bottom, d + rng.uniform(-10, 10), 0.92), rng.uniform(0.045, 0.085), (PALE, ROCK, RUST, DARK)[k % 4])
for k in range(30):
    h = rng.uniform(0.3, 2.25)
    d = rng.uniform(-180, 180)
    if abs(d) < 50 and (abs(h - EYE_H) < 0.35 or abs(h - MOUTH_H) < 0.35):
        continue
    m.ball(around(h, d, 0.84), radius(h) * rng.uniform(0.14, 0.3), (DARK, ROCK, STREAK)[k % 3])
# Spurs: small stalagmites grown against its foot.
for d, h, r in ((-128, 0.55, 0.1), (96, 0.42, 0.08), (178, 0.7, 0.09)):
    base = around(0.1, d, 1.05)
    m.capsule(base, base + at(0, h, 0) + way(d) * 0.05, r, ROCK)
    m.capsule(base + at(0, h, 0) + way(d) * 0.05, base + at(0, h + 0.18, 0) + way(d) * 0.07, r * 0.4, DARK)
# Roots: uneven fingers of rock gripping the floor (each on a bone of its own below).
ROOTS = []
for k in range(8):
    a = 22.5 + 45 * k + rng.uniform(-12, 12)
    length = rng.uniform(0.62, 0.95)
    # (Arched like knuckles, gripping down into the floor at their ends.)
    head, knee, tip = axis(0.16) + way(a) * 0.32, axis(0.17) + way(a + rng.uniform(-8, 8)) * (0.32 + length * 0.5), axis(0.04) + way(a + rng.uniform(-14, 14)) * (0.32 + length)
    ROOTS.append((f"foot_{k + 1}", head, tip, way(a).cross(UP)))
    m.capsule(head, knee, rng.uniform(0.13, 0.16), DARK)
    m.capsule(knee, tip, rng.uniform(0.07, 0.09), WET)
    m.ball(knee, 0.12, ROCK)

# The places of its features, on the skin as it now is.
EYE_R = 0.17
EYE_C = surface(EYE_H, 0, -EYE_R * 0.42)
MOUTH_AT = surface(MOUTH_H, 0)

# ── The skeleton ──
# (The teeth are on bones of their own, so it can draw them in when it hides.)
bones = [("Root", None), ("Base", "Root"), ("Body", "Base"), ("Upper", "Body"), ("Tip", "Upper"), ("Jaw", "Body"), ("Eyelid", "Upper"), ("Fangs", "Body"), ("Fangs_lower", "Jaw")]
joints = {
    "Root": at(0, 0, 0),
    "Root.tail": at(0, 0.25, 0),
    "Base": axis(0.0),
    "Body": axis(0.6),
    "Upper": axis(1.45),
    "Tip": axis(2.0),
    "Tip.tail": axis(2.6),
    "Jaw": axis(MOUTH_H + 0.06) + at(0, 0, 0.1),
    "Jaw.tail": MOUTH_AT + at(0, -0.12, 0.05),
    "Eyelid": EYE_C,
    "Eyelid.tail": EYE_C + at(0, 0, 0.2),
    "Fangs": MOUTH_AT + at(0, 0.12, -0.08),
    "Fangs.tail": MOUTH_AT + at(0, 0.03, -0.05),
    "Fangs_lower": MOUTH_AT + at(0, -0.12, -0.09),
    "Fangs_lower.tail": MOUTH_AT + at(0, -0.03, -0.06),
}
feet = []
for name, head, tip, lift in ROOTS:
    bones.append((name, "Base"))
    joints[name], joints[f"{name}.tail"] = head, tip
    feet.append((name, lift))
TENDRILS = []  # (names, controls)
for k, (degrees, h) in enumerate(((60, 1.5), (-62, 1.42), (112, 1.28), (-108, 1.36), (160, 1.48), (-158, 1.24))):
    out, side = way(degrees), way(degrees + 90)
    root = surface(h, degrees, -0.03)
    # Each in a pose of its own: some droop to the floor and curl back up, some coil in the air.
    if k % 2 == 0:
        controls = [root, root + out * 0.45 + UP * 0.25, root + out * 1.1 - UP * 0.2 + side * 0.2, root + out * 1.3 - UP * (h - 0.05), root + out * 1.9 - UP * (h - 0.04) - side * 0.25, root + out * 1.75 - UP * (h - 0.35) + side * 0.05]
    else:
        controls = [root, root + out * 0.4 - UP * 0.15, root + out * 0.95 - UP * 0.9 + side * 0.25, root + out * 1.45 - UP * 0.55 - side * 0.1, root + out * 1.55 + UP * 0.1 + side * 0.2, root + out * 1.25 + UP * 0.25 - side * 0.05]
    TENDRILS.append((chain(bones, joints, f"tendril_{k + 1}", controls, "Body", count=6), controls))
# (The teeth bones hold no skin: bone heat would give them the lips round them.)
rig = skeleton(m, bones, joints, still=("Root", "Fangs", "Fangs_lower"))

# Nodules on the sides that the tendrils come out of: knobbly, with a puckered rim.
for names, controls in TENDRILS:
    out = (controls[1] - controls[0]).normalized()
    m.ball(controls[0] - out * 0.02, 0.1, DARK)
    for j in range(5):
        a = 2 * math.pi * j / 5
        t1 = out.cross(UP).normalized()
        t2 = out.cross(t1)
        m.ball(controls[0] + out * 0.02 + (t1 * math.cos(a) + t2 * math.sin(a)) * 0.07, 0.04, ROCK)

# The eye: a great bloodshot yellow orb under a heavy brow knotted down in the middle, in a deep socket.
for sign in (1, -1):
    m.capsule(EYE_C + at(sign * 0.24, 0.15, -0.06), EYE_C + at(sign * 0.03, 0.09, 0.07), 0.07, DARK)
    m.ball(EYE_C + at(sign * 0.19, -0.03, -0.04), 0.075, ROCK)
m.ball(EYE_C + at(0, -0.17, -0.03), 0.08, ROCK)
m.ball(EYE_C, EYE_R * 1.08, WET, negative=True)


def eyeball(centre, r, bone):
    """A sphere coloured by where each face looks: a slit pupil, a yellow iris ringed darker, and a sickly
    white shot through with red veins."""
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=22, v_segments=16, radius=r)
    front = at(0, 0, 1)
    colours = []
    for f in bm.faces:
        c = f.calc_center_median().normalized()
        a = math.degrees(c.angle(front))
        if a < 30:
            colour = IRIS
        elif a < 38:
            colour = IRIS_RING
        else:
            colour = VEIN if noise.noise(c * 5.0 + Vector((1, 2, 3))) > 0.28 or (a < 46 and rng.random() < 0.25) else WHITE
        colours.append(colour)
    bmesh.ops.translate(bm, vec=Vector(centre), verts=bm.verts)
    m._add_bm(bm, colours, bone)


eyeball(EYE_C, EYE_R, "Upper")
m.sphere(EYE_C + at(0, 0, 1) * EYE_R * 0.9, (EYE_R * 0.1, EYE_R * 0.14, EYE_R * 0.66), PUPIL, "Upper", segments=8, rings=6)
# The lid, drawn up over the top of the eye only so far: it glares (and shuts by turning down over the front).
LID_OPEN = 96  # degrees up from the front that the lid's middle sits, open
# (Rock-coloured, so shut it's one more lump of stone.)
cap(m, EYE_C, EYE_R * 1.1, 0.03, Quaternion((1, 0, 0), -math.radians(LID_OPEN)) @ at(0, 0, 1), 82, ROCK, "Eyelid")

# The maw: a wide ragged gash low on the front over a dark throat, fanged above and below with jagged
# stone teeth, drooling; the lower lip, with its teeth, is on the jaw, and rises to close it.
for d, r in ((-46, 0.1), (-24, 0.14), (0, 0.16), (24, 0.14), (46, 0.1)):
    m.ball(surface(MOUTH_H, d, -0.04), r, THROAT, negative=True)
m.ellipsoid(axis(MOUTH_H) + at(0, 0, radius(MOUTH_H) * 0.55), (0.34, 0.15, 0.14), THROAT, negative=True)
for d0, d1 in ((-52, -18), (-18, 18), (18, 52)):
    m.capsule(surface(MOUTH_H + 0.17, d0, -0.03), surface(MOUTH_H + 0.17, d1, -0.03), 0.065, DARK)
for d in (-40, -14, 14, 40):
    m.ball(surface(MOUTH_H - 0.18, d, -0.06), 0.09, ROCK, group="jaw")
m.ellipsoid(surface(MOUTH_H - 0.12, 0, -0.1), (0.24, 0.05, 0.06), GUM, group="jaw")


def fang(root, down, length, r, bone):
    tip = root + (down + Vector((rng.uniform(-0.3, 0.3), rng.uniform(-0.3, 0.1), 0))).normalized() * length
    m.cone(root, tip, r, FANG if rng.random() < 0.65 else OLD_FANG, bone, segments=4, smooth=False)


for k in range(17):
    d = (k - 8) * 6.0 + rng.uniform(-2, 2)
    fang(surface(MOUTH_H + 0.11, d, -0.035), Vector((0, -0.2, -1)), rng.choice((0.07, 0.11, 0.15, 0.2)) * (1 - abs(d) / 100), rng.uniform(0.02, 0.032), "Fangs")
for k in range(15):
    d = (k - 7) * 6.2 + rng.uniform(-2, 2)
    fang(surface(MOUTH_H - 0.11, d, -0.045), Vector((0, -0.15, 1)), rng.choice((0.06, 0.09, 0.12, 0.15)) * (1 - abs(d) / 100), rng.uniform(0.018, 0.028), "Fangs_lower")
for d, length in ((-22, 0.16), (6, 0.22), (28, 0.12)):
    top = surface(MOUTH_H + 0.09, d, -0.03)
    pts = [top, top + Vector((0.004, -0.01, -length * 0.5)), top + Vector((-0.003, -0.015, -length))]
    m.strand(pts, 0.007, 0.004, DROOL, "Fangs", segments=5)
    m.sphere(pts[-1], (0.011, 0.011, 0.016), DROOL, "Fangs", segments=6, rings=4)

# The tendrils: long, thin and whip-like, wet and sticky towards their ends, each tapering to a point.
for names, controls in TENDRILS:
    # (A group of their own, meshed finer than the rock: they're thin.)
    points = tube(m, controls, 0.028, 0.012, TENDRIL, pieces=20, colour_tip=STICKY, group="tendrils")
    along = (points[-1] - points[-2]).normalized()
    m.cone(points[-1] - along * 0.005, points[-1] + along * 0.07, 0.012, STICKY, names[-1], segments=5)


# ── The rock: layered ledges, cracks running down, rough all over; streaked and wet low down ──
def rock(co, normal):
    # Plates of rock split by a network of cracks, each plate standing out its own amount.
    (f1, f2, *_), (cell, *_) = noise.voronoi(Vector((co.x * 4.5, co.y * 4.5, co.z * 3.2)), distance_metric="DISTANCE", exponent=2.5)
    plates = noise.noise(cell * 1.7) * 0.035 - 0.06 * max(0.0, 1 - (f2 - f1) / 0.09) ** 2
    rough = noise.fractal(co * 6.0, 0.7, 2.2, 4) * 0.018 + plates
    lumps = noise.noise(co * 2.2 + Vector((4, 4, 4))) * 0.03
    s = (co.z * 7.5 + noise.noise(co * 1.8) * 0.9) % 1.0
    ledges = 0.045 * s**3 - 0.018
    stretched = Vector((co.x * 7, co.y * 7, co.z * 1.6))
    cracks = -0.07 * max(0.0, noise.ridged_multi_fractal(stretched + Vector((7, 1, 3)), 1.0, 2.0, 2, 1.0, 2.0) - 1.25)
    return normal * (rough + lumps + ledges + cracks)


def streaks(p, colour):
    if colour not in (ROCK, DARK, STREAK):
        return colour
    if p.z < 0.3 and noise.noise(p * 3 + Vector((2, 2, 9))) > -0.3:
        return WET
    band = noise.noise(Vector((p.x * 9, p.y * 9, p.z * 1.3)) + Vector((3, 7, 1)))
    if band > 0.42:
        return PALE
    if band < -0.48:
        return RUST
    if noise.noise(p * 2.4 + Vector((8, 1, 5))) > 0.35:
        return DARK
    return colour


m.shapes = {"body": rock, "jaw": rock}
m.paint = streaks


# ── Actions ──
X, Y, Z = (1, 0, 0), (0, 1, 0), (0, 0, 1)  # (about X tips forward and down; Y rolls to the right; Z turns left)
REST = {}  # each tendril bone's way at rest
for names, _c in TENDRILS:
    REST.update(directions(joints, names))


def lash(own, u, amount=1.0, cycles=1):
    """The tendrils coiling and lashing: curling waves running down each, out of step with the others."""
    for j, (names, _c) in enumerate(TENDRILS):
        for i, name in enumerate(names):
            k = amount * (3 + 2.2 * i)
            add(own, name, turn(X, k * wave(u, cycles, j * 0.17 - i * 0.12)) @ turn(Z, k * wave(u, cycles, j * 0.23 + 0.3 - i * 0.1)))


def lid(own, shut):
    add(own, "Eyelid", turn(X, LID_OPEN * shut))


def idle(u):
    own = {}
    add(own, "Body", turn(X, 0.8 * wave(u)) @ turn(Y, 0.6 * wave(u, 1, 0.25)))
    add(own, "Upper", turn(X, 0.8 * wave(u, 1, -0.1)))
    lid(own, keys([(0, 0.06), (0.62, 0.06), (0.66, 1), (0.71, 0.06), (1, 0.06)], u))
    add(own, "Jaw", turn(X, 3 + 3 * wave(u, 2)))
    lash(own, u)
    return own


def creep(u, ripple, sway):
    own = {}
    # A ripple round the roots; the body rocks over them, the tendrils trailing and lashing.
    for k, (name, lift) in enumerate(feet):
        add(own, name, turn(lift, -ripple * max(0.0, wave(u, 1, -k / len(feet)))))
    add(own, "Base", turn(X, sway * wave(u, 1)) @ turn(Y, sway * 0.6 * wave(u, 1, 0.25)))
    add(own, "Body", turn(X, -sway * 0.6 * wave(u, 1, -0.1)))
    add(own, "Upper", turn(X, -sway * 0.4 * wave(u, 1, -0.2)))
    lid(own, 0.06)
    lash(own, u, 1.3)
    return own


def attack(u):
    # The tendrils whip out ahead, stretching as they go, base first and tips after; hold; reel back in, the
    # mouth gaping for what they bring, the eye wide.
    own = {}
    stretch = keys([(0, 1), (0.22, 1.45), (0.45, 1.45), (0.8, 1), (1, 1)], u)
    for j, (names, controls) in enumerate(TENDRILS):
        # (Ahead and fanned out; those from the back sweep round the sides, not through the body.)
        side = at(1 if controls[0].x > axis(1.3).x else -1, 0, 0)
        ahead = controls[0].y < axis(1.3).y  # (in front of the middle: -Y)
        target = (at(0, 0.1, 1) * (0.9 if ahead else 0.45) + side * (0.4 if ahead else 0.9)).normalized()
        aim(own, names, REST, target, [keys([(0, 0), (0.1 + 0.025 * i, 1), (0.45, 1), (0.82, 0), (1, 0)], u) for i in range(6)])
        add(own, names[0], turn(X, 4 * wave(u, 2, j * 0.1)))
    own["_scale"] = {names[0]: stretch for names, _c in TENDRILS}
    add(own, "Upper", turn(X, keys([(0, 0), (0.2, -3), (0.6, 3), (1, 0)], u)))
    add(own, "Jaw", turn(X, 3 + 26 * keys([(0, 0), (0.45, 0), (0.62, 1), (0.85, 1), (1, 0)], u)))
    lid(own, keys([(0, 0.06), (0.15, -0.12), (0.8, -0.12), (1, 0.06)], u))
    return own


def hidden(_u):
    # Just a rock: the tendrils drawn into their nodules, the teeth drawn in, the eye and mouth shut.
    own = {"_scale": {**{names[0]: 0.03 for names, _c in TENDRILS}, "Fangs": 0.02, "Fangs_lower": 0.02}}
    lid(own, 1.0)
    add(own, "Jaw", turn(X, -50))
    for name, lift in feet:
        add(own, name, turn(lift, 3))
    return own


m.finish(
    {
        "Idle": loop(90, 2, idle),
        "Walk": loop(72, 2, lambda u: creep(u, 12, 1.2)),
        "Run": loop(36, 1, lambda u: creep(u, 20, 2.0)),
        "Attack": loop(36, 1, attack),
        "Hidden": loop(30, 15, hidden),
    },
    bake={"size": 512, "ao": 0.22, "mottle": 0.3, "mottle_scale": 12, "dirt": 0.45},
)
glossy(m, 0.55)
mesh = m.armature.children[0]
print(f"roper: {max(v.co.z for v in mesh.data.vertices):.2f} m tall (rest pose)")
