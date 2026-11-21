"""Roper (SRD: Large monstrosity): a stalagmite of a creature about 2.7 metres tall, a lumpy tapering cone of
grey-brown cave rock ringed with mineral bands and streaked with drip ridges, a skirt of short lobes round
its base that it creeps on, one great amber eye under a heavy stony lid high on its front, a wide toothy
mouth low down, and six long sticky tendrils hanging from nubs round its sides. Writes
assets/models/roper.glb, on a skeleton of its own: four up the body, six lobes round the base, a jaw, an
eyelid and six bones down each tendril. Its "Hidden" action is just a stalagmite: tendrils drawn into
their nubs, eye and mouth shut. Run (BLENDER: your Blender executable):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_roper.py
"""

import math
import os
import random
import sys

import bmesh
from mathutils import Quaternion

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wwblend import Model, Vector, at, shade  # noqa: E402
from wwtentacle import add, aim, chain, directions, keys, loop, skeleton, turn, tube, wave  # noqa: E402

STONE = 0x7A7266
DARK = shade(STONE, 0.78)
LIGHT = shade(STONE, 1.16)
BAND = 0x8C8070
TENDRIL = 0x857565
STICKY = 0xA59882
EYE = 0xE2A82C
PUPIL = 0x140C06
MOUTH = 0x341614
GUM = 0x6A4A40
TEETH = 0xCFC3A6


m = Model("roper", resolution=0.0105, faces=10000)
m.group("jaw", resolution=0.012, faces=900, bone="Jaw")
rng = random.Random(7)
UP = Vector((0, 0, 1))

# The body's profile: (height, radius) up its axis, which leans back a little towards the top.
PROFILE = [(0.2, 0.6), (0.52, 0.54), (0.85, 0.47), (1.18, 0.41), (1.5, 0.34), (1.8, 0.27), (2.08, 0.19), (2.3, 0.11), (2.44, 0.05)]
EYE_H, MOUTH_H = 1.64, 0.74


def axis(h):
    """The middle of the body at height h (it leans back and a little to one side as it rises)."""
    return at(0.03 * math.sin(h * 1.3), h, -0.06 * (h / 2.7) ** 2)


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
    """A point `out` of the way from the axis to the profile's radius at height h."""
    return axis(h) + way(degrees) * radius(h) * out


def surface(h, degrees, depth=0.0):
    """Where the skin is at height h, `degrees` round (the metaballs swell past the profile where they
    overlap), moved out by `depth` (in, below 0)."""
    c, d = axis(h), way(degrees)
    body = [e for e in m.elements if e[4] == "body" and not e[3]]
    t = 0.0
    # (A metaball's skin lies where the fields add up to THRESHOLD / STIFF.)
    while t < 1.5 and sum(m._field(c + d * t, e) for e in body) > 0.15:
        t += 0.004
    return c + d * (t + depth)


# ── The body: stacked lumps of rock tapering to a point, ringed with paler and darker bands ──
for i, (h, r) in enumerate(PROFILE):
    colour = (STONE, BAND, DARK, STONE, LIGHT, STONE, BAND, STONE, DARK)[i]
    m.ellipsoid(axis(h), (r, r * 0.95, 0.26 if i else 0.2), colour)
    # (Not below the first lump: a capsule's round end would reach under the ground.)
    if i > 1:
        h0, r0 = PROFILE[i - 1]
        m.capsule(axis(h0), axis(h), (r0 + r) * 0.36, colour)
# Drip ridges running down its sides, and knobs and lumps of rock, kept off the eye and the mouth.
for k in range(9):
    d = 55 + k * 31 + rng.uniform(-8, 8)  # (none down the front, over the eye and mouth)
    top, bottom = rng.uniform(1.5, 2.2), rng.uniform(0.3, 0.8)
    m.capsule(around(top, d, 0.86), around(bottom, d + rng.uniform(-8, 8), 0.9), rng.uniform(0.05, 0.075), LIGHT if k % 3 == 0 else STONE)
for k in range(24):
    h = rng.uniform(0.35, 2.2)
    d = rng.uniform(-180, 180)
    if abs(d) < 45 and (abs(h - EYE_H) < 0.35 or abs(h - MOUTH_H) < 0.3):
        continue
    m.ball(around(h, d, 0.86), radius(h) * rng.uniform(0.16, 0.27), DARK if k % 3 else LIGHT)

# The skirt: low flat lobes round the base it creeps on (bones for them below).
FEET = []
for k in range(8):
    a = 22.5 + 45 * k
    lift = way(a).cross(UP)  # (the axis it lifts its tip about)
    FEET.append((f"foot_{k + 1}", axis(0.1) + way(a) * 0.3, axis(0.06) + way(a) * 0.7, lift))
    m.ellipsoid(axis(0.07) + way(a) * 0.55, (0.17, 0.17, 0.075), DARK)
    m.capsule(axis(0.1) + way(a) * 0.35, axis(0.08) + way(a) * 0.62, 0.08, DARK)

# The places of its features, on the skin as it now is.
EYE_R = 0.155
EYE_C = surface(EYE_H, 0, -EYE_R * 0.5)
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
    "Jaw": axis(MOUTH_H + 0.06) + at(0, 0, 0.12),
    "Jaw.tail": MOUTH_AT + at(0, -0.1, 0.05),
    "Eyelid": EYE_C,
    "Fangs": MOUTH_AT + at(0, 0.1, -0.06),
    "Fangs.tail": MOUTH_AT + at(0, 0.02, -0.04),
    "Fangs_lower": MOUTH_AT + at(0, -0.1, -0.07),
    "Fangs_lower.tail": MOUTH_AT + at(0, -0.02, -0.05),
    "Eyelid.tail": EYE_C + at(0, 0, 0.2),
}
feet = []
for name, head, tip, lift in FEET:
    bones.append((name, "Base"))
    joints[name], joints[f"{name}.tail"] = head, tip
    feet.append((name, lift))
TENDRILS = []  # (names, controls)
for degrees, h in ((58, 1.42), (-58, 1.42), (112, 1.24), (-112, 1.24), (162, 1.36), (-162, 1.36)):
    out = way(degrees)
    root = surface(h, degrees, -0.02)
    controls = [
        root,
        root + out * 0.32 + UP * 0.12,
        root + out * 0.56 - UP * 0.32,
        root + out * 0.62 - UP * (h * 0.7),
        root + out * 0.82 - UP * (h - 0.05),
        root + out * 1.25 - UP * (h - 0.035),
    ]
    TENDRILS.append((chain(bones, joints, f"tendril_{len(TENDRILS) + 1}", controls, "Body", count=6), controls))
# (The teeth bones hold no skin: bone heat would give them the lips round them.)
rig = skeleton(m, bones, joints, still=("Root", "Fangs", "Fangs_lower"))

# Nubs on the sides that the tendrils come out of.
for names, controls in TENDRILS:
    m.ball(controls[0], 0.08, DARK)

# The eye: a great amber orb bulging from a socket under a heavy brow, with a slit pupil.
m.ellipsoid(EYE_C + at(0, 0.13, -0.01), (0.22, 0.08, 0.1), STONE)
for sign in (1, -1):
    m.ball(EYE_C + at(sign * 0.16, -0.02, -0.03), 0.08, STONE)
m.ball(EYE_C + at(0, -0.15, -0.02), 0.08, STONE)
m.ball(EYE_C, EYE_R * 1.06, DARK, negative=True)
m.sphere(EYE_C, (EYE_R,) * 3, EYE, "Upper", segments=16, rings=12)
front = at(0, 0, 1)
m.sphere(EYE_C + front * EYE_R * 0.88, (EYE_R * 0.12, EYE_R * 0.16, EYE_R * 0.62), PUPIL, "Upper", segments=8, rings=6)


def cap(centre, r, thick, pointing, half, colour, bone):
    """A thick shell of a sphere round `centre`: the part within `half` degrees of `pointing` (an eyelid)."""
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=16, v_segments=12, radius=r)
    bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], dist=1e-5, plane_co=(0, 0, r * math.cos(math.radians(half))), plane_no=(0, 0, 1), clear_inner=True)
    # (A copy of the shell pulled in to make its inside, joined to the outside round the rim.)
    new = bmesh.ops.extrude_face_region(bm, geom=bm.faces[:], use_keep_orig=True)
    for v in (g for g in new["geom"] if isinstance(g, bmesh.types.BMVert)):
        v.co *= (r - thick) / r
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    rotation = Vector((0, 0, 1)).rotation_difference(Vector(pointing).normalized())
    bmesh.ops.rotate(bm, cent=(0, 0, 0), matrix=rotation.to_matrix(), verts=bm.verts)
    bmesh.ops.translate(bm, vec=Vector(centre), verts=bm.verts)
    m._add_bm(bm, colour, bone)


# The lid, drawn up over the top of the eye (it shuts by turning down over the front).
LID_OPEN = 112  # degrees up from the front that the lid's middle sits, open
lid_dir = Quaternion((1, 0, 0), -math.radians(LID_OPEN)) @ at(0, 0, 1)
cap(EYE_C, EYE_R * 1.12, 0.025, lid_dir, 80, STONE, "Eyelid")

# The mouth: a wide dark gash low on the front, fanged above; the lower lip, with its own teeth, is on
# the jaw, and rises to close it.
for d in (-30, 0, 30):
    m.ball(surface(MOUTH_H, d, -0.03), 0.1 if d else 0.12, MOUTH, negative=True)
m.capsule(surface(MOUTH_H, -28, -0.04), surface(MOUTH_H, 28, -0.04), 0.085, MOUTH, negative=True)
m.capsule(surface(MOUTH_H + 0.12, -32, -0.03), surface(MOUTH_H + 0.12, 32, -0.03), 0.05, STONE)
lip = surface(MOUTH_H - 0.12, 0, -0.06)
m.ellipsoid(lip, (0.3, 0.12, 0.06), STONE, group="jaw")
m.ellipsoid(lip + at(0, 0.04, -0.04), (0.24, 0.05, 0.05), GUM, group="jaw")
for k in range(9):
    d = (k - 4) * 6.5
    root = surface(MOUTH_H + 0.075, d, -0.025)
    length = 0.075 if k % 2 == 0 else 0.05
    m.cone(root, root + Vector((0, 0, -length)), 0.019, TEETH, "Fangs", segments=5)
for k in range(8):
    d = (k - 3.5) * 7.0
    root = surface(MOUTH_H - 0.075, d, -0.03)
    length = 0.06 if k % 2 else 0.045
    m.cone(root, root + Vector((0, 0, length)), 0.017, TEETH, "Fangs_lower", segments=5)

# The tendrils: thin, sticky towards their ends, each tapering to a point.
for names, controls in TENDRILS:
    points = tube(m, controls, 0.045, 0.022, TENDRIL, pieces=12, colour_tip=STICKY)
    along = (points[-1] - points[-2]).normalized()
    m.cone(points[-1] - along * 0.01, points[-1] + along * 0.09, 0.022, STICKY, names[-1], segments=6)

# ── Actions ──
X, Y, Z = (1, 0, 0), (0, 1, 0), (0, 0, 1)  # (about X tips forward and down; Y rolls to the right; Z turns left)
REST = {}  # each tendril bone's way at rest
for names, _c in TENDRILS:
    REST.update(directions(joints, names))


def drift(own, u, amount=1.0, cycles=1):
    """The tendrils stirring: slow curling waves down each, out of step with the others."""
    for j, (names, _c) in enumerate(TENDRILS):
        for i, name in enumerate(names):
            add(own, name, turn(X, amount * 3.5 * wave(u, cycles, j * 0.17 - i * 0.1)) @ turn(Z, amount * 3.5 * wave(u, cycles, j * 0.23 + 0.3 - i * 0.09)))


def lid(own, shut):
    add(own, "Eyelid", turn(X, LID_OPEN * shut))


def idle(u):
    own = {}
    add(own, "Body", turn(X, 0.8 * wave(u)) @ turn(Y, 0.6 * wave(u, 1, 0.25)))
    add(own, "Upper", turn(X, 0.8 * wave(u, 1, -0.1)))
    lid(own, keys([(0, 0.08), (0.62, 0.08), (0.66, 1), (0.71, 0.08), (1, 0.08)], u))
    add(own, "Jaw", turn(X, 2 + 2 * wave(u, 2)))
    drift(own, u)
    return own


def creep(u, ripple, sway):
    own = {}
    # A ripple round the lobes of its skirt; the body rocks over them, the tendrils trailing.
    for k, (name, lift) in enumerate(feet):
        add(own, name, turn(lift, -ripple * max(0.0, wave(u, 1, -k / len(feet)))))
    add(own, "Base", turn(X, sway * wave(u, 1)) @ turn(Y, sway * 0.6 * wave(u, 1, 0.25)))
    add(own, "Body", turn(X, -sway * 0.6 * wave(u, 1, -0.1)))
    add(own, "Upper", turn(X, -sway * 0.4 * wave(u, 1, -0.2)))
    lid(own, 0.1)
    drift(own, u, 1.5)
    return own


def attack(u):
    # The tendrils whip out ahead, stretching as they go, base first and tips after; hold; reel back in, the
    # mouth gaping for what they bring, the eye wide.
    own = {}
    stretch = keys([(0, 1), (0.22, 1.45), (0.45, 1.45), (0.8, 1), (1, 1)], u)
    for j, (names, controls) in enumerate(TENDRILS):
        # (Ahead and fanned out; those from the back sweep round the sides, not through the body.)
        side = at(1 if controls[0].x > 0 else -1, 0, 0)
        ahead = controls[0].y < axis(1.3).y  # (in front of the middle: -Y)
        target = (at(0, 0.1, 1) * (0.9 if ahead else 0.45) + side * (0.4 if ahead else 0.9)).normalized()
        aim(own, names, REST, target, [keys([(0, 0), (0.1 + 0.025 * i, 1), (0.45, 1), (0.82, 0), (1, 0)], u) for i in range(6)])
        add(own, names[0], turn(X, 4 * wave(u, 2, j * 0.1)))
    own["_scale"] = {names[0]: stretch for names, _c in TENDRILS}
    add(own, "Upper", turn(X, keys([(0, 0), (0.2, -3), (0.6, 3), (1, 0)], u)))
    add(own, "Jaw", turn(X, 2 + 26 * keys([(0, 0), (0.45, 0), (0.62, 1), (0.85, 1), (1, 0)], u)))
    lid(own, keys([(0, 0.08), (0.15, -0.08), (0.8, -0.08), (1, 0.08)], u))
    return own


def hidden(_u):
    # Just a stalagmite: the tendrils drawn into their nubs, the eye and mouth shut, the lobes tucked.
    own = {"_scale": {**{names[0]: 0.03 for names, _c in TENDRILS}, "Fangs": 0.02, "Fangs_lower": 0.02}}
    lid(own, 1.0)
    add(own, "Jaw", turn(X, -40))
    for name, lift in feet:
        add(own, name, turn(lift, 4))
    return own


m.finish(
    {
        "Idle": loop(90, 2, idle),
        "Walk": loop(72, 2, lambda u: creep(u, 14, 1.2)),
        "Run": loop(36, 1, lambda u: creep(u, 22, 2.0)),
        "Attack": loop(36, 1, attack),
        "Hidden": loop(30, 15, hidden),
    },
    bake={"size": 512, "ao": 0.16, "mottle": 0.2, "mottle_scale": 14, "dirt": 0.4},
)
mesh = m.armature.children[0]
print(f"roper: {max(v.co.z for v in mesh.data.vertices):.2f} m tall (rest pose)")
