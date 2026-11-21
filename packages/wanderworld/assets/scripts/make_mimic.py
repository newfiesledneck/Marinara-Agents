"""Mimic (SRD: Medium monstrosity, a shapechanger): a wooden treasure chest bound in iron, with a brass lock,
about 0.75 m tall and 0.95 m wide, that is a monster. Its lid opens into a jaw lined with uneven teeth over
red gums, a long sticky purple tongue lies coiled inside, and four fleshy pseudopods push out from under
it to shuffle it along. Its own skeleton (a chest, a lid, a seven-bone tongue, four two-bone legs) and
actions: Idle and Hidden (a closed chest, perfectly still; Idle's lid twitches once), Walk and Run (up on
its pseudopods, the lid chomping) and Attack (the lid gapes and the tongue lashes out). Writes
assets/models/mimic.glb. Run (BLENDER: your Blender executable):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_mimic.py
"""

import math
import os
import random
import sys

import bmesh
import bpy

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wwblend import Vector, at, shade, turn  # noqa: E402
from wwcreature import Creature  # noqa: E402

bpy.ops.wm.read_factory_settings(use_empty=True)
random.seed(7)

WOOD = 0x7A5230
WOOD_DARK = 0x3A2616
IRON = 0x45464A
RIVET = 0x6E6E70
BRASS = 0xA8863A
GUM = 0xA03C44
MOUTH = 0x4A1418
TEETH = 0xF2EAD2
TONGUE = 0x7E3C78
FLESH = 0x9A6A60

W, D = 0.95, 0.6  # across, front to back
A = D / 2
HB = 0.45  # the box's height; the lid rises LR more
LR = 0.3
T = 0.045  # the boards' thickness

m = Creature("mimic", resolution=0.018, faces=1600)
m.group("palate", resolution=0.018, faces=900, bone="Lid")
m.group("mouth", resolution=0.018, faces=1600, bone="Body")

# ── The skeleton ──
TONGUE_PATH = [(0, -0.21), (0, -0.06), (0.03, 0.09), (0.15, 0.17), (0.29, 0.12), (0.34, -0.02), (0.29, -0.16), (0.15, -0.21)]
TONGUE_UP = [0.37] + [0.4] * 7
LEGS = {}  # name: (side across, side front to back)
bones = [
    ("Root", None, at(0, 0, 0), at(0, 0, 0.25)),
    ("Body", "Root", at(0, 0.02, 0), at(0, 0.4, 0)),
    ("Lid", "Body", at(0, HB, -A), at(0, HB, A)),
]
for i in range(7):
    (x0, f0), (x1, f1) = TONGUE_PATH[i], TONGUE_PATH[i + 1]
    bones.append((f"Tongue{i + 1}", "Body" if i == 0 else f"Tongue{i}", at(x0, TONGUE_UP[i], f0), at(x1, TONGUE_UP[i + 1], f1)))
for name, sx, sf in (("FL", 1, 1), ("FR", -1, 1), ("BL", 1, -1), ("BR", -1, -1)):
    LEGS[name] = (sx, sf)
    hip, knee, foot = at(sx * 0.3, 0.04, sf * 0.15), at(sx * 0.46, 0.05, sf * 0.24), at(sx * 0.58, 0.03, sf * 0.31)
    bones += [(f"Leg{name}1", "Body", hip, knee), (f"Leg{name}2", f"Leg{name}1", knee, foot)]
m.rig(bones)


# ── Shapes the box is made of ──


def prism(profile, x0, x1, colour, bone):
    """A board: the polygon `profile` ([(forward, up)], game coordinates) run across from x0 to x1."""
    bm = bmesh.new()
    left = [bm.verts.new(at(x1, u, f)) for f, u in profile]
    right = [bm.verts.new(at(x0, u, f)) for f, u in profile]
    bm.faces.new(left)
    bm.faces.new(list(reversed(right)))
    n = len(profile)
    for i in range(n):
        j = (i + 1) % n
        bm.faces.new((right[i], right[j], left[j], left[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    m._add_bm(bm, colour, bone, smooth=False)


def arc(a, b, t0, t1, steps):
    """Points along the lid's half ellipse (radii a forward, b up, about the top of the box), from angle t0
    to t1 (0: the front edge, pi: the back)."""
    return [(a * math.cos(t0 + (t1 - t0) * k / steps), HB + b * math.sin(t0 + (t1 - t0) * k / steps)) for k in range(steps + 1)]


def band(a, b, thick, t0, t1, x0, x1, colour, bone, steps=2):
    """A curved board (or iron strap) over the lid, `thick` deep under its outside."""
    outer = arc(a, b, t0, t1, steps)
    inner = arc(a - thick, b - thick, t0, t1, steps)
    prism(outer + list(reversed(inner)), x0, x1, colour, bone)


def box(c, size, colour, bone="Body"):
    """A box at c ((x, up, forward)), size (across, up, front to back)."""
    m.box(at(*c), (size[0], size[2], size[1]), colour, bone)


def rivet(c, bone="Body"):
    m.sphere(at(*c), (0.011,) * 3, RIVET, bone, segments=6, rings=4)


# ── The box: boards on each side with dark gaps between, a floor, an iron rim, iron corners and straps,
# a brass lock plate, and a ring handle on each end. ──
box((0, 0.03, 0), (W - 0.02, 0.06, D - 0.02), WOOD_DARK)
for sf in (1, -1):
    box((0, HB / 2, sf * (A - T / 2)), (W - 0.01, HB, T - 0.006), WOOD_DARK)
    for k in range(3):
        colour = shade(WOOD, (1.0, 0.9, 1.07)[k] if sf > 0 else (0.93, 1.04, 0.88)[k])
        box((0, HB * (k + 0.5) / 3, sf * (A - T / 2 + 0.003)), (W - 0.06, HB / 3 - 0.01, T), colour)
for sx in (1, -1):
    box((sx * (W / 2 - T / 2), HB / 2, 0), (T - 0.006, HB, D - 0.01), WOOD_DARK)
    for k in range(3):
        box((sx * (W / 2 - T / 2 + 0.003), HB * (k + 0.5) / 3, 0), (T, HB / 3 - 0.01, D - 0.06), shade(WOOD, (0.95, 1.05, 0.9)[k]))
# The iron: a rim round the top, a skirt round the bottom, the corners, two straps front and back, one a side.
for sf in (1, -1):
    box((0, HB - 0.022, sf * (A + 0.006)), (W + 0.012, 0.044, 0.014), IRON)
    box((0, 0.025, sf * (A + 0.006)), (W + 0.012, 0.05, 0.014), IRON)
    for sx in (1, -1):
        box((sx * 0.27, HB / 2, sf * (A + 0.009)), (0.07, HB, 0.012), IRON)
        for y in (0.1, 0.23, 0.36):
            rivet((sx * 0.27, y, sf * (A + 0.016)))
for sx in (1, -1):
    box((sx * (W / 2 + 0.006), HB - 0.022, 0), (0.014, 0.044, D + 0.012), IRON)
    box((sx * (W / 2 + 0.006), 0.025, 0), (0.014, 0.05, D + 0.012), IRON)
    box((sx * (W / 2 + 0.009), HB / 2, 0), (0.012, HB, 0.07), IRON)
    for sf in (1, -1):
        # An iron angle up each corner.
        box((sx * (W / 2 + 0.004), HB / 2, sf * (A - 0.02)), (0.016, HB + 0.01, 0.07), IRON)
        box((sx * (W / 2 - 0.02), HB / 2, sf * (A + 0.004)), (0.07, HB + 0.01, 0.016), IRON)
        rivet((sx * (W / 2 + 0.012), HB * 0.3, sf * (A - 0.03)))
        rivet((sx * (W / 2 - 0.03), HB * 0.7, sf * (A + 0.012)))
    # A ring handle on a plate at each end.
    box((sx * (W / 2 + 0.017), HB * 0.62, 0), (0.008, 0.08, 0.13), IRON)
    m.ring(at(sx * (W / 2 + 0.03), HB * 0.56, 0), 0.055, 0.011, RIVET, "Body", scale=(1, 1, 1), axis=(1, 0, 0), segments=12)
# The lock: a brass plate under the lid with a keyhole.
box((0, HB - 0.085, A + 0.013), (0.13, 0.15, 0.012), BRASS)
box((0, HB - 0.11, A + 0.02), (0.016, 0.04, 0.006), 0x141010)
m.sphere(at(0, HB - 0.083, A + 0.02), (0.014, 0.004, 0.014), 0x141010, "Body", segments=8, rings=4)
for sx in (1, -1):
    for y in (HB - 0.03, HB - 0.14):
        m.sphere(at(sx * 0.048, y, A + 0.02), (0.008,) * 3, shade(BRASS, 0.75), "Body", segments=6, rings=4)

# ── The lid: a rounded top of five boards between two half-round ends, iron straps over it and round its
# ends, a rim along its front edge, and a brass hasp hanging over the lock. ──
inner_x = W / 2 - T
band(A - 0.008, LR - 0.008, T, 0, math.pi, -inner_x, inner_x, WOOD_DARK, "Lid", steps=10)
for k in range(5):
    t0, t1 = math.pi * k / 5 + 0.012, math.pi * (k + 1) / 5 - 0.012
    band(A, LR, T, t0, t1, -inner_x, inner_x, shade(WOOD, (1.04, 0.92, 1.0, 0.95, 1.06)[k]), "Lid")
for sx in (1, -1):
    prism(arc(A, LR, 0, math.pi, 12), sx * inner_x, sx * W / 2, shade(WOOD, 0.9), "Lid")
    # Iron round the end's curve, and over the top.
    band(A + 0.008, LR + 0.008, 0.03, 0, math.pi, sx * (W / 2 - 0.035), sx * (W / 2 + 0.008), IRON, "Lid", steps=12)
    band(A + 0.012, LR + 0.012, 0.02, 0, math.pi, sx * 0.235, sx * 0.305, IRON, "Lid", steps=12)
    for t in (0.5, 1.2, 1.94, 2.64):
        rivet((sx * 0.27, HB + (LR + 0.016) * math.sin(t), (A + 0.016) * math.cos(t)), "Lid")
box((0, HB + 0.018, A + 0.005), (W + 0.012, 0.036, 0.014), IRON, "Lid")
box((0, HB + 0.018, -A - 0.005), (W + 0.012, 0.036, 0.014), IRON, "Lid")
box((0, HB - 0.03, A + 0.024), (0.07, 0.12, 0.012), BRASS, "Lid")
m.ring(at(0, HB - 0.075, A + 0.032), 0.02, 0.005, shade(BRASS, 0.8), "Lid", axis=(0, 0, 1), segments=10)
rivet((0, HB + 0.006, A + 0.032), "Lid")

# ── The mouth: red gums round the rim inside the box and the lid, a dark throat, a ribbed roof inside the
# lid with two yellow eyes, and big uneven fangs. ──
inside_x, inside_f = W / 2 - T, A - T
m.ellipsoid(at(0, 0.3, 0), (inside_x - 0.02, inside_f - 0.02, 0.1), MOUTH, group="mouth")
for sf in (1, -1):
    m.capsule(at(-inside_x + 0.03, HB - 0.045, sf * (inside_f - 0.022)), at(inside_x - 0.03, HB - 0.045, sf * (inside_f - 0.022)), 0.036, GUM, group="mouth")
for sx in (1, -1):
    m.capsule(at(sx * (inside_x - 0.022), HB - 0.045, -inside_f + 0.03), at(sx * (inside_x - 0.022), HB - 0.045, inside_f - 0.03), 0.036, GUM, group="mouth")
m.ellipsoid(at(0, HB + 0.11, -0.01), (inside_x - 0.03, inside_f - 0.04, 0.1), shade(MOUTH, 1.25), group="palate")
for k, f in enumerate((-0.12, -0.02, 0.08)):
    m.capsule(at(-0.26 + 0.03 * k, HB + 0.03, f), at(0.26 - 0.03 * k, HB + 0.03, f), 0.015, shade(GUM, 0.7), group="palate")
m.capsule(at(-inside_x + 0.03, HB + 0.02, inside_f - 0.02), at(inside_x - 0.03, HB + 0.02, inside_f - 0.02), 0.034, GUM, group="palate")
for sx in (1, -1):
    m.capsule(at(sx * (inside_x - 0.02), HB + 0.02, -inside_f + 0.06), at(sx * (inside_x - 0.02), HB + 0.02, inside_f - 0.02), 0.032, GUM, group="palate")
    # An eye in the roof of the mouth, looking out when the lid gapes.
    eye = at(sx * 0.15, HB + 0.01, -0.13)
    m.sphere(eye, (0.05, 0.05, 0.042), 0xD8B030, "Lid", segments=12, rings=8)
    m.sphere(eye + Vector((0, 0, -0.04)), (0.008, 0.036, 0.007), 0x120A06, "Lid", segments=8, rings=6)


def tooth(root, down, length, r, inward, bone):
    """A fang from `root` up (or down) `length`, leaning a little towards the inside of the mouth."""
    lean = Vector((random.uniform(-0.015, 0.015), 0, 0)) + Vector(inward) * random.uniform(0.01, 0.03)
    tip = root + Vector((0, 0, -length if down else length)) + lean
    m.cone(root, tip, r, shade(TEETH, random.choice((0.86, 0.95, 1.03))), bone, segments=6)


back = at(0, 0, -1)
for k in range(11):
    x = -0.36 + 0.72 * k / 10 + random.uniform(-0.012, 0.012)
    big = k in (1, 4, 6, 9) or random.random() < 0.2
    length = random.uniform(0.1, 0.13) if big else random.uniform(0.05, 0.085)
    tooth(at(x, HB - 0.04, inside_f - 0.034), False, length, random.uniform(0.026, 0.034) if big else random.uniform(0.02, 0.027), back, "Body")
    big = k in (0, 3, 5, 8) or random.random() < 0.2
    length = random.uniform(0.1, 0.13) if big else random.uniform(0.05, 0.085)
    tooth(at(x + 0.033, HB + 0.03, inside_f - 0.018), True, length, random.uniform(0.026, 0.033) if big else random.uniform(0.02, 0.026), back, "Lid")
for sx in (1, -1):
    for k in range(4):
        f = -0.15 + 0.3 * k / 3
        tooth(at(sx * (inside_x - 0.034), HB - 0.04, f), False, random.uniform(0.05, 0.1), random.uniform(0.02, 0.026), at(-sx, 0, 0), "Body")
        tooth(at(sx * (inside_x - 0.02), HB + 0.03, f + 0.04), True, random.uniform(0.05, 0.09), random.uniform(0.019, 0.025), at(-sx, 0, 0), "Lid")

# ── The tongue: thick at its root, thinning to a fat sticky tip, coiled inside on the throat. ──
for i in range(7):
    bone = f"Tongue{i + 1}"
    a, c = m.joints[bone], m.tails[bone]
    ra, rc = 0.056 - 0.0045 * i, 0.056 - 0.0045 * (i + 1)
    m.tube(a, c, ra, rc, TONGUE, bone, segments=10)
    m.sphere(c, (rc,) * 3, TONGUE, bone, segments=10, rings=6)
m.sphere(m.tails["Tongue7"], (0.045, 0.045, 0.036), shade(TONGUE, 1.15), "Tongue7", segments=10, rings=6)

# ── The pseudopods: fleshy legs, swelling then tapering, each on a splayed pad. ──
for name in LEGS:
    hip, knee, foot = m.joints[f"Leg{name}1"], m.joints[f"Leg{name}2"], m.tails[f"Leg{name}2"]
    mid = hip.lerp(knee, 0.45)
    m.tube(hip, mid, 0.07, 0.074, FLESH, f"Leg{name}1", segments=10)
    m.tube(mid, knee, 0.074, 0.056, FLESH, f"Leg{name}1", segments=10)
    m.sphere(knee, (0.056,) * 3, FLESH, f"Leg{name}1", segments=10, rings=6)
    m.tube(knee, foot, 0.056, 0.042, shade(FLESH, 0.92), f"Leg{name}2", segments=10)
    m.sphere(foot + Vector((0, 0, 0.004)), (0.066, 0.066, 0.034), shade(FLESH, 0.82), f"Leg{name}2", segments=10, rings=6)


# ── Actions ──
TONGUE_BONES = [f"Tongue{i + 1}" for i in range(7)]


def pose(lift=0.0, pitch=0.0, roll=0.0, lid=0.0, feet=None, tongue=None):
    """The chest raised `lift` on its legs (feet: {leg: (x, up, forward)}; None: tucked inside), tilted by
    `pitch` (the front up, below 0) and `roll`, the lid open `lid` degrees, the tongue's segments pointed
    along `tongue` ([(x, up, forward)])."""
    body = turn("x", pitch) @ turn("y", roll)
    p = {"Body": body, "@Body": Vector((0, 0, lift)), "Lid": body @ turn("x", -lid)}
    centre = m.joints["Body"]
    for name, (sx, sf) in LEGS.items():
        upper, lower = f"Leg{name}1", f"Leg{name}2"
        if feet is None:
            # Up inside the box, folded in.
            p[upper] = body @ m.aim(upper, at(0, 1, 0))
            p[lower] = body @ m.aim(lower, at(-sx, 0.1, -sf * 0.4))
            continue
        hip = centre + body @ (m.joints[upper] - centre) + Vector((0, 0, lift))
        p.update(m.leg(upper, lower, hip, at(*feet[name]), at(sx, 0.7, sf * 0.4)))
    if tongue is not None:
        p.update({b: m.aim(b, at(*d)) for b, d in zip(TONGUE_BONES, tongue)})
    else:
        for b in TONGUE_BONES:
            p[b] = body
    return p


def stance(stride=0.0, phase=0.0, rise=0.05):
    """Where each foot is at `phase` (0-1) of a stride: on the ground going back for 60% of it, then lifted
    forward; diagonal pairs together."""
    feet = {}
    for name, (sx, sf) in LEGS.items():
        u = (phase + (0.5 if name in ("FR", "BL") else 0.0)) % 1
        if u < 0.6:
            along, up = stride * (0.5 - u / 0.6), 0.0
        else:
            v = (u - 0.6) / 0.4
            along, up = stride * (-0.5 + v), rise * math.sin(v * math.pi)
        feet[name] = (sx * 0.5, 0.06 + up, sf * 0.25 + along)
    return feet


closed = pose()
idle = [(1, closed), (56, closed), (59, pose(lid=3)), (62, closed), (65, pose(lid=1.5)), (68, closed), (90, closed)]
hidden = [(1, closed), (30, closed)]


def gait(frames, stride, lift, bob, lid, lid_swing, pitch, roll):
    keys = []
    for k in range(9):
        u = k / 8
        s = math.sin(u * 2 * math.pi)
        keys.append(
            (
                1 + (frames - 1) * u,
                pose(
                    lift=lift + bob * abs(math.cos(u * 2 * math.pi)),
                    pitch=pitch,
                    roll=roll * s,
                    lid=lid + lid_swing * math.sin(u * 4 * math.pi) ** 2,
                    feet=stance(stride, u),
                ),
            )
        )
    keys[-1] = (frames, keys[0][1])
    return keys


walk = gait(30, stride=0.2, lift=0.13, bob=0.015, lid=4, lid_swing=10, pitch=0, roll=4)
run = gait(18, stride=0.3, lift=0.15, bob=0.03, lid=8, lid_swing=20, pitch=5, roll=6)

# Attack: rearing back as the lid gapes, then lunging as the tongue lashes out straight, its tip curling
# down at the end, and pulled back in as the lid shuts.
planted = stance()
rear = [(0, 0.6, 0.8), (0, 0.8, 0.6), (0, 1, 0.1), (0, 0.9, -0.4), (0, 0.4, -0.9), (0, -0.2, -1), (0, -0.6, -0.8)]
lash = [(0, 0.7, 0.7), (0, 0.35, 0.95), (0, 0.12, 1), (0, -0.05, 1), (0, -0.15, 1), (0, -0.25, 1), (0, -0.3, 1)]
curl = [(0, 0.6, 0.8), (0, 0.25, 1), (0, 0, 1), (0, -0.3, 1), (0, -0.7, 0.7), (0, -1, 0.1), (0, -0.7, -0.6)]
attack = [
    (1, pose(lift=0.13, lid=4, feet=planted)),
    (7, pose(lift=0.15, pitch=-10, lid=55, feet=planted, tongue=rear)),
    (11, pose(lift=0.15, pitch=-8, lid=100, feet=planted, tongue=rear)),
    (15, pose(lift=0.12, pitch=8, lid=95, feet=planted, tongue=lash)),
    (19, pose(lift=0.12, pitch=10, lid=90, feet=planted, tongue=curl)),
    (24, pose(lift=0.13, pitch=2, lid=70, feet=planted)),
    (29, pose(lift=0.13, lid=20, feet=planted)),
    (33, pose(lift=0.13, lid=4, feet=planted)),
]

m.finish(
    {"Idle": idle, "Hidden": hidden, "Walk": walk, "Run": run, "Attack": attack},
    bake={"size": 512, "ao": 0.08, "mottle": 0.12, "mottle_scale": 40, "dirt": 0.12},
)
