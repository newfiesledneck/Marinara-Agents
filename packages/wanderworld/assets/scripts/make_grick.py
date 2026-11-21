"""Grick (SRD: Medium monstrosity): a worm-like body about 2.4 metres from the tip of its tail to the tips
of its tentacles, the back of it lying on the ground and the front reared up about 1.2 metres, in a
rubbery grey-green hide ringed like a worm's and pale underneath; its head is a hooked beak ringed by four
barbed tentacles that splay open like a flower. Writes assets/models/grick.glb, on a skeleton of its own:
a spine from the middle of its body, a tail behind and a neck up to the head, a jaw for the lower beak,
and a chain of five bones for each tentacle. Run (BLENDER: your Blender executable):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_grick.py
"""

import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wwblend import Model, Vector, at, shade  # noqa: E402
from wwtentacle import add, chain, curve, even, keys, loop, skeleton, turn, tube, wave  # noqa: E402

HIDE = 0x56634F
BAND = shade(HIDE, 0.88)
BACK = shade(HIDE, 0.72)
BELLY = 0x9C9A7C
TENTACLE = 0x5F6A52
TIP = 0x6E6A58
BEAK = 0x2C2824
MOUTH = 0x4A1C1C
BARB = 0xC8BC9C

m = Model("grick", resolution=0.0105, faces=9000)

# ── The skeleton ──
# The body as (x, up, forward): its tail lying on the ground behind, curving to one side; the middle at
# the bend; the neck rising from it to the head.
TAIL = [at(0.3, 0.08, -1.34), at(0.24, 0.13, -0.95), at(-0.02, 0.18, -0.62), at(-0.04, 0.2, -0.28)]
NECK = [at(-0.04, 0.2, -0.28), at(0.0, 0.19, 0.22), at(0.0, 0.42, 0.34), at(0.0, 1.0, 0.27)]
HEAD = at(0.0, 1.1, 0.42)
FWD = at(0, -0.28, 1).normalized()  # where the head points: forward and a little down
MOUTH_AT = HEAD + FWD * 0.15

bones = [("Root", None)]
joints = {"Root": at(0, 0, 0), "Root.tail": at(0, 0.25, 0)}
spine = chain(bones, joints, "spine", NECK, "Root", count=4)
tail = chain(bones, joints, "tail", list(reversed(TAIL)), "spine_01", count=3)
bones += [("Head", "spine_04"), ("Jaw", "Head")]
joints["Head"] = joints["spine_04.tail"]
joints["Head.tail"] = HEAD + FWD * 0.12
joints["Jaw"] = HEAD + FWD * 0.04 + at(0, -0.04, 0)
joints["Jaw.tail"] = MOUTH_AT + at(0, -0.05, 0.08)
TENTACLES = []  # (names, curve points, outward, curl axis)
for j, (name, angle) in enumerate((("ul", 45), ("ur", 135), ("lr", 225), ("ll", 315))):
    a = math.radians(angle)
    out = at(math.cos(a), math.sin(a), 0)
    out = (out - FWD * out.dot(FWD)).normalized()
    base = MOUTH_AT + out * 0.12 - FWD * 0.04
    # (Out and forward, the tip curling back: a flower opening.)
    controls = [base, base + FWD * 0.2 + out * 0.04, base + FWD * 0.34 + out * 0.24, base + FWD * 0.26 + out * 0.46, base + FWD * 0.1 + out * 0.5]
    names = chain(bones, joints, f"tentacle_{name}", controls, "Head", count=5)
    # (A turn about this opens the tentacle outwards; the other way, closes it over the beak.)
    TENTACLES.append((names, controls, out, FWD.cross(out).normalized()))
rig = skeleton(m, bones, joints)

# ── The body: a thick rubbery worm, ringed, pale underneath, swelling into the neck under the head ──
# (Pieces about as long as the body is thick: shorter ones pile up and swell past the belly's colour.)
path = even(curve(TAIL, 48), 6)[:-1] + even(curve(NECK, 48), 6)
radius = []
for i, p in enumerate(path):
    u = i / (len(path) - 1)
    # Thin at the tail's tip, thickest at the bend, a little narrower up the neck.
    radius.append(0.035 + 0.125 * min(1.0, u / 0.42) ** 0.8 - 0.02 * max(0.0, u - 0.55) / 0.45)
for i in range(len(path) - 1):
    a, b, r = path[i], path[i + 1], (radius[i] + radius[i + 1]) / 2
    # (Rings: every other piece a shade darker and a little fuller.)
    ringed = i % 2 == 1 and i > 0
    m.capsule(a, b, r * (1.035 if ringed else 1.0), BAND if ringed else HIDE)
    along = (b - a).normalized()
    # The belly: down where it lies, forward where it rears (the side away from the back).
    belly = Vector((0, 0, -1)) if along.z < 0.3 else (Vector((0, -1, 0)) - along * along.y).normalized()
    m.capsule(a + belly * r * 0.4, b + belly * r * 0.4, r * 0.76, BELLY)
# The head: a blunt rounded knob, broader than the neck, with a low ridge over its crown.
m.ellipsoid(HEAD, (0.165, 0.18, 0.15), HIDE)
m.ellipsoid(HEAD + at(0, 0.09, -0.06), (0.08, 0.14, 0.06), BACK)
# (A flared collar round the mouth, that the tentacles grow from.)
m.ellipsoid(HEAD + FWD * 0.11, (0.19, 0.09, 0.17), HIDE)
m.ellipsoid(at(0, 0.97, 0.36), (0.13, 0.12, 0.12), BELLY)
# The mouth: a dark hollow in the middle of the tentacles, the beak in it.
m.ball(MOUTH_AT + FWD * 0.03, 0.095, MOUTH, negative=True)

# The tentacles: thick at the root and tapering, darker along their backs, their tips paler; each with
# barbs along the inside towards its end and a hooked point.
for names, controls, out, axis in TENTACLES:
    points = tube(m, controls, 0.07, 0.026, TENTACLE, pieces=12, colour_tip=TIP)
    for k, u in enumerate((0.35, 0.47, 0.58, 0.68, 0.78, 0.87)):
        n = len(points) - 1
        p = points[round(u * n)]
        along = (points[min(n, round(u * n) + 1)] - points[round(u * n) - 1]).normalized()
        inner = (-out + along * out.dot(along)).normalized()
        r = 0.07 + (0.026 - 0.07) * u
        bone = names[min(4, int(u * 5))]
        root = p + inner * r * 0.7
        m.cone(root, root + inner * (0.07 - 0.007 * k) - along * 0.03, 0.017 - 0.0012 * k, BARB, bone, segments=5)
    end = points[-1]
    along = (points[-1] - points[-2]).normalized()
    m.cone(end - along * 0.01, end + along * 0.06 - out * 0.015, 0.024, BARB, names[-1], segments=6)

# The beak: an upper bill hooked down over a shorter lower one (on the jaw).
up = at(0, 1, 0)
m.cone(MOUTH_AT - FWD * 0.04 + up * 0.035, MOUTH_AT + FWD * 0.19 - up * 0.05, 0.075, BEAK, "Head", segments=8, flat=0.7, facing=(1, 0, 0))
m.cone(MOUTH_AT - FWD * 0.03 - up * 0.045, MOUTH_AT + FWD * 0.12 - up * 0.07, 0.058, BEAK, "Jaw", segments=8, flat=0.7, facing=(1, 0, 0))

# ── Actions ──
X, Z = (1, 0, 0), (0, 0, 1)  # (a turn about X tips a bone's far end forward and down; about Z turns it left)


def tentacles(own, u, curl, drift=1.0):
    """Each tentacle's chain: opened (curl above 0) or closed by `curl` a bone, with a slow wave down it."""
    for j, (names, _controls, out, axis) in enumerate(TENTACLES):
        for i, name in enumerate(names):
            add(own, name, turn(axis, curl + drift * 7 * wave(u, 1, j * 0.27 - i * 0.12)))
            add(own, name, turn(out, drift * 6 * wave(u, 1, j * 0.31 + 0.4 - i * 0.1)))


def idle(u):
    own = {}
    for i, name in enumerate(spine[1:]):
        add(own, name, turn(X, -1.6 * wave(u, 1, -i * 0.08)))
    add(own, "Head", turn(Z, 7 * wave(u, 1, 0.15)) @ turn(X, 3 * wave(u, 2)))
    for i, name in enumerate(tail):
        add(own, name, turn(Z, 4 * wave(u, 1, -0.2 * i)))
    add(own, "Jaw", turn(X, 4 + 4 * wave(u, 2, 0.3)))
    tentacles(own, u, 0.0)
    return own


def slither(u, swing, lean):
    own = {}
    # A wave of the body from side to side, running back down the tail; the neck turns against the
    # middle's swing so the head stays on its way.
    middle = swing * 0.45 * wave(u)
    add(own, "spine_01", turn(Z, middle))
    for i, name in enumerate(tail):
        add(own, name, turn(Z, swing * wave(u, 1, -0.22 * (i + 1))))
    add(own, "spine_02", turn(Z, -middle * 1.1) @ turn(X, lean * 0.5))
    add(own, "spine_03", turn(Z, swing * 0.15 * wave(u, 1, 0.25)) @ turn(X, lean * 0.5 + 2.5 * wave(u, 2)))
    add(own, "spine_04", turn(X, -lean * 0.4))
    add(own, "Head", turn(Z, -swing * 0.12 * wave(u, 1, 0.25)) @ turn(X, -lean * 0.3 - 2 * wave(u, 2, 0.1)))
    add(own, "Jaw", turn(X, 3))
    tentacles(own, u, 3.0 + lean * 0.3, drift=0.6)
    return own


def attack(u):
    # Rears back, the tentacles spreading wide and the beak gaping; lunges, the tentacles snapping shut in
    # front of the beak; holds a moment, then settles back.
    rear = keys([(0, 0), (0.27, -1), (0.42, 1.2), (0.62, 1.0), (1, 0)], u)
    shut = keys([(0, 0), (0.3, 1), (0.44, 1), (0.52, -1.25), (0.72, -1.1), (1, 0)], u)
    gape = keys([(0, 0.1), (0.3, 1), (0.48, 1), (0.54, -0.05), (0.75, 0.1), (1, 0.1)], u)
    own = {}
    # (The neck thrusts forward; the head tips back against it, so the beak stays aimed ahead.)
    for name in spine[1:]:
        add(own, name, turn(X, 8 * rear))
    add(own, "Head", turn(X, -16 * rear))
    add(own, "Jaw", turn(X, 30 * gape))
    for i, name in enumerate(tail):
        add(own, name, turn(Z, 6 * rear * (i + 1) / 3))
    tentacles(own, u, 14 * shut, drift=0.3)
    reach = keys([(0, 0), (0.27, -0.08), (0.42, 0.3), (0.62, 0.26), (1, 0)], u)
    own["_move"] = {"Root": tuple(at(0, 0, reach))}
    return own


m.finish(
    {
        "Idle": loop(90, 2, idle),
        "Walk": loop(36, 2, lambda u: slither(u, 13, 4)),
        "Run": loop(18, 1, lambda u: slither(u, 19, 14)),
        "Attack": loop(30, 1, attack),
    },
    bake={"size": 512, "ao": 0.12, "mottle": 0.12, "mottle_scale": 40, "dirt": 0.25},
)
mesh = m.armature.children[0]
top = max(v.co.z for v in mesh.data.vertices)
ys = [v.co.y for v in mesh.data.vertices]
print(f"grick: {top:.2f} m tall, {max(ys) - min(ys):.2f} m long (rest pose)")
