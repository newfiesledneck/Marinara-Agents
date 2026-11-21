"""Gelatinous cube (SRD: Large ooze): a block of quivering, nearly transparent ooze three metres on a side, big
enough to fill a dungeon corridor, its edges slumped round and its sides sagging and wobbling, spread a
little at its foot. Suspended in it is what it hasn't finished digesting: an adventurer's skeleton thrown
back with one arm reaching out, a second skull and loose bones, a helmet, a boot, coins and a few gems,
and a sword stuck half out of its side. Writes assets/models/gelatinous_cube.glb, on a skeleton of its
own: the body (squashed and stretched), a bone at its top and each side that bulge it, and one holding
what's inside. Two meshes, one material: `gelatinous_cube` is the ooze, to be drawn translucent, and
`gelatinous_cube-inside` what floats in it, drawn as usual. Actions: Idle (quivering, the things inside
drifting), Walk and Run (lurching forward, front first, the back sliding after) and Attack (drawing back,
then surging forward, the front bulging out and the top falling over whatever's in front of it). Run
(BLENDER: your Blender executable):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_gelatinous_cube.py
"""

import math
import os
import random
import sys

import bmesh
from mathutils import Quaternion, Vector, noise

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wwbeast import Beast, lathe, smooth, transform  # noqa: E402
from wwblend import at, turn  # noqa: E402
from wwcreature import rope  # noqa: E402
from wwtentacle import cap, keys  # noqa: E402

# The ooze: pale green going cyan (the bake clouds it and darkens it low down, where what it eats settles).
JELLY = 0x7CBEA0
# What's inside: old bone, rusted iron, tarnished gold, rotting leather.
BONE = 0xA89A72
BONE_DARK = 0x7E7454
BONE_GREEN = 0x8C9470
HOLLOW = 0x26241C
TOOTH = 0xC8BE9A
IRON = 0x4A4B46
RUST = 0x6A4630
STEEL = 0x8A8E88
GOLD = 0xB08A36
GOLD_DARK = 0x86662A
GEM = 0x7A2430
GEM_BLUE = 0x2E4A6A
LEATHER = 0x4C3424
LEATHER_DARK = 0x33241A
GRIP = 0x2E2218
WOOD = 0x4A3826
SEAM = 0x2E2418
GLASS = 0x2E4A34
INSIDE = (BONE, BONE_DARK, BONE_GREEN, HOLLOW, TOOTH, IRON, RUST, STEEL, GOLD, GOLD_DARK, GEM, GEM_BLUE, LEATHER, LEATHER_DARK, GRIP, WOOD, SEAM, GLASS)

HALF, HEIGHT = 1.5, 3.0
rng = random.Random(5)

m = Beast("gelatinous_cube", resolution=0.05, faces=5000)
m.detail = set(INSIDE)
m.split["inside"] = INSIDE

# ── The skeleton ──
bones = [
    ("Root", None, at(0, 0, 0), at(0, 0, 0.3)),
    ("Body", "Root", at(0, 0, 0), at(0, 1.5, 0)),
    ("Top", "Body", at(0, 2.2, 0), at(0, 2.9, 0)),
    ("Front", "Body", at(0, 1.4, 0.8), at(0, 1.4, 1.4)),
    ("Back", "Body", at(0, 1.4, -0.8), at(0, 1.4, -1.4)),
    ("Left", "Body", at(0.8, 1.4, 0), at(1.4, 1.4, 0)),
    ("Right", "Body", at(-0.8, 1.4, 0), at(-1.4, 1.4, 0)),
    ("Inside", "Body", at(0, 1.2, 0), at(0, 1.8, 0)),
]
rig = m.rig(bones)
rig.data.bones["Root"].use_deform = False


# ── The ooze: a rounded block, its edges rounder at the top than where it sits ──
def block(n=22):
    bm = bmesh.new()
    lookup = {}

    def vert(c):
        c = [0.5 * x + 0.5 * math.sin(x * math.pi / 2) for x in c]  # (closer together towards the edges)
        q = Vector((c[0] * HALF, c[1] * HALF, (c[2] + 1) * HEIGHT / 2))
        r = 0.13 + 0.17 * smooth(0.3, 2.7, q.z)
        inner = Vector((max(-HALF + r, min(HALF - r, q.x)), max(-HALF + r, min(HALF - r, q.y)), max(0.13, min(HEIGHT - 0.3, q.z))))
        d = q - inner
        p = inner + d.normalized() * r if d.length > 1e-6 else q
        key = tuple(round(x, 4) for x in p)
        if key not in lookup:
            lookup[key] = bm.verts.new(p)
        return lookup[key]

    for axis in range(3):
        for sign in (-1, 1):
            for i in range(n):
                for j in range(n):
                    quad = []
                    for di, dj in ((0, 0), (1, 0), (1, 1), (0, 1)):
                        c = [0.0, 0.0, 0.0]
                        c[axis] = sign
                        c[(axis + 1) % 3] = -1 + 2 * (i + di) / n
                        c[(axis + 2) % 3] = -1 + 2 * (j + dj) / n
                        quad.append(vert(c))
                    if len(set(quad)) == 4:
                        bm.faces.new(quad if sign > 0 else list(reversed(quad)))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    bm.verts.index_update()
    verts = [v.co.copy() for v in bm.verts]
    faces = [[v.index for v in f.verts] for f in bm.faces]
    bm.free()
    return verts, faces


LUMPS = [(Vector((rng.uniform(-1.4, 1.4), rng.uniform(-1.4, 1.4), rng.uniform(0.5, 2.7))), rng.uniform(0.25, 0.5), rng.uniform(0.02, 0.05)) for _ in range(14)]


DRIPS = []  # (side's outward way, across it, how far down from the top it runs, how wide, how thick)
for k in range(16):
    a = rng.choice(((1, 0), (-1, 0), (0, 1), (0, -1)))
    DRIPS.append((Vector((a[0], a[1], 0)), rng.uniform(-1.2, 1.2), rng.uniform(0.5, 1.6), rng.uniform(0.07, 0.16), rng.uniform(0.025, 0.05)))


def wobble(co, normal):
    """The block slumped and quivering: sides sagging out low down, the top sunk in the middle, the foot spread
    on the floor, and slow lumps and ripples over it all."""
    off = normal * (0.045 * noise.noise(co * 0.75) + 0.018 * noise.noise(co * 2.1 + Vector((3, 1, 7))))
    side = Vector((normal.x, normal.y, 0))
    if side.length > 0.3:
        side.normalize()
        off += side * 0.1 * max(0.0, 1 - ((co.z - 0.95) / 1.7) ** 2)
    if normal.z > 0.4:
        off.z -= 0.08 * (1 - (co.x / HALF) ** 2) * (1 - (co.y / HALF) ** 2)
    if co.z < 0.22:
        flat = Vector((co.x, co.y, 0))
        if flat.length > 0:
            off += flat.normalized() * 0.12 * (1 - co.z / 0.22)
    for way, across, length, width, h in DRIPS:
        if way.dot(normal) > 0.5:
            along = co.y if way.x else co.x
            down = HEIGHT - co.z
            if down < length + width:
                f = math.exp(-(((along - across) / width) ** 2)) * smooth(0.0, 0.25, down) * (1 - smooth(length - 0.1, length + width, down))
                off += way * h * f * (1 + 0.6 * smooth(length * 0.6, length, down))  # (fatter towards its end)
    for centre, r, h in LUMPS:
        d = (co - centre).length
        if d < r:
            off += normal * h * (1 - (d / r) ** 2) ** 2
    if co.z + off.z < 0:
        off.z = -co.z
    return off


m.solids["body"] = block
m.shapes["body"] = wobble
m.ball(at(0, 1.5, 0), 0.5, JELLY)  # (the block's colour; its shape is block())


def jelly_weights(co):
    x, up, fwd = co.x, co.z, -co.y
    held = smooth(0.05, 0.9, up)  # (its foot stays on the floor)
    w = {
        "Top": smooth(1.5, 2.9, up),
        "Front": smooth(0.2, 1.45, fwd) * held,
        "Back": smooth(0.2, 1.45, -fwd) * held,
        "Left": smooth(0.2, 1.45, x) * held,
        "Right": smooth(0.2, 1.45, -x) * held,
        "Body": 0.35 + 1.5 * (1 - held),
    }
    total = sum(w.values())
    return {k: v / total for k, v in w.items()}


m.weigh((JELLY,), jelly_weights)

# ── What's inside, all on the Inside bone ──


def long_bone(a, b, r, colour=BONE):
    """A long bone: a shaft with a knob at each end."""
    a, b = Vector(a), Vector(b)
    m.tube(a, b, r, r * 0.9, colour, "Inside", segments=6)
    for p, k in ((a, 1.7), (b, 1.5)):
        m.sphere(p, (r * k, r * k, r * k * 0.85), colour, "Inside", segments=6, rings=4)


def skull(scale=1.0, open_jaw=25, colour=BONE):
    """A skull at the origin facing -Y (Blender), its jaw hanging open by `open_jaw` degrees."""
    start = len(m.parts)
    m.sphere((0, 0.01, 0.03), (0.072, 0.092, 0.084), colour, "Inside", segments=14, rings=10)
    m.sphere((0, -0.055, -0.035), (0.052, 0.045, 0.04), colour, "Inside", segments=10, rings=6)  # the upper jaw
    for sx in (1, -1):
        m.sphere((sx * 0.03, -0.075, 0.0), (0.021, 0.014, 0.019), HOLLOW, "Inside", segments=8, rings=6)  # eye sockets
        m.tube((sx * 0.05, -0.06, -0.012), (sx * 0.066, 0.0, -0.012), 0.011, 0.009, colour, "Inside", segments=5)  # cheekbones
    m.cone((0, -0.092, -0.025), (0, -0.088, -0.003), 0.011, HOLLOW, "Inside", segments=3)  # the nose
    for k in range(8):
        a = math.radians(-60 + 120 * k / 7)
        m.box((0.042 * math.sin(a), -0.042 * math.cos(a) - 0.045, -0.072), (0.009, 0.007, 0.014), TOOTH, "Inside")
    # The lower jaw: a U from hinge to hinge, hanging open.
    jaw = len(m.parts)
    pts = [(0.055, 0.0, -0.035), (0.052, -0.045, -0.075), (0.032, -0.085, -0.085), (0.0, -0.095, -0.088), (-0.032, -0.085, -0.085), (-0.052, -0.045, -0.075), (-0.055, 0.0, -0.035)]
    rope(m, pts, 0.012, 0.012, colour, "Inside", sides=5)
    for k in range(7):
        a = math.radians(-55 + 110 * k / 6)
        m.box((0.038 * math.sin(a), -0.04 * math.cos(a) - 0.045, -0.072), (0.008, 0.007, 0.012), TOOTH, "Inside")
    hinge = Vector((0, 0.0, -0.035))
    q = Quaternion((1, 0, 0), math.radians(open_jaw))
    for i in range(jaw, len(m.parts)):
        verts, faces, c, b, s = m.parts[i]
        m.parts[i] = ([q @ (Vector(v) - hinge) + hinge for v in verts], faces, c, b, s)
    transform(m, start, scale=scale)


def skeleton(whole=True):
    """An adventurer's skeleton, limp, its jaw agape, one arm reaching out in front and the rest floating loose,
    a belt and pouch still round its hips; the pelvis at the origin (Blender's axes, facing -Y). Not `whole`:
    what's left of an older meal, a spine, ribs, a skull and one arm."""
    start = len(m.parts)
    spine = [Vector(p) for p in ((0, 0.0, 0.0), (0, 0.035, 0.12), (0, 0.05, 0.25), (0, 0.04, 0.38), (0, 0.01, 0.5), (0, -0.01, 0.58))]
    for a, b in zip(spine, spine[1:]):
        for k in range(3):
            m.box(a.lerp(b, k / 3), (0.042, 0.034, 0.026), BONE_DARK if k % 2 else BONE, "Inside")
    # The ribs: arcs from the spine round to the breastbone.
    for k in range(6):
        z = 0.44 - k * 0.042
        w = 0.1 + 0.035 * math.sin(k / 5 * math.pi * 0.8 + 0.4)
        for sx in (1, -1):
            pts = [(sx * 0.02, 0.05, z), (sx * w * 0.8, 0.05, z - 0.01), (sx * w, -0.01, z - 0.03), (sx * w * 0.85, -0.08, z - 0.05), (sx * 0.035, -0.12, z - 0.05 + 0.01 * k)]
            if k >= 4:
                pts = pts[:4]  # (the floating ribs stop short)
            rope(m, pts, 0.0085, 0.006, BONE if (k + (sx > 0)) % 3 else BONE_GREEN, "Inside", sides=4)
    m.box((0, -0.125, 0.37), (0.035, 0.016, 0.16), BONE, "Inside")  # the breastbone
    # The pelvis: two wings and the sacrum.
    for sx in (1, -1):
        m.sphere((sx * 0.08, 0.01, 0.02), (0.065, 0.03, 0.06), BONE_DARK, "Inside", segments=8, rings=6)
    m.box((0, 0.04, -0.01), (0.06, 0.03, 0.08), BONE, "Inside")
    # Collarbones and the skull, thrown back.
    for sx in (1, -1):
        m.tube((sx * 0.02, -0.06, 0.5), (sx * 0.17, 0.0, 0.5), 0.008, 0.008, BONE, "Inside", segments=5)
    s0 = len(m.parts)
    skull(open_jaw=34)
    transform(m, s0, rotation=turn("x", -38) @ turn("z", -22) @ turn("y", 12), offset=(0, -0.03, 0.68))
    # The arms: the left reaching out and up in front, the right flung down.
    arms = (((0.18, 0.0, 0.5), (0.3, -0.24, 0.6), (0.33, -0.5, 0.7)), ((-0.18, 0.01, 0.5), (-0.36, 0.1, 0.62), (-0.42, 0.06, 0.88)))
    for shoulder, elbow, wrist in arms if whole else arms[1:]:
        long_bone(shoulder, elbow, 0.016)
        long_bone(elbow, wrist, 0.009, BONE_DARK)
        e, w = Vector(elbow), Vector(wrist)
        m.tube(e + Vector((0, 0.014, 0)), w + Vector((0, 0.014, 0)), 0.008, 0.007, BONE, "Inside", segments=5)
        # A hand, its fingers splayed.
        way = (w - e).normalized()
        side = way.cross(Vector((0, 0, 1))).normalized()
        for f in range(4):
            root = w + side * (f - 1.5) * 0.016
            tip = root + way * 0.085 + side * (f - 1.5) * 0.02 + Vector((0, 0, -0.01 * f))
            m.tube(root, tip, 0.0055, 0.004, BONE, "Inside", segments=4)
    if not whole:
        return start
    # The legs: the left drawn up, the right hanging.
    for hip, knee, ankle, toe in (((0.1, 0.0, -0.03), (0.17, -0.3, -0.33), (0.2, 0.06, -0.55), (0.2, -0.08, -0.62)), ((-0.1, 0.0, -0.03), (-0.16, -0.12, -0.45), (-0.2, 0.24, -0.72), (-0.21, 0.12, -0.81))):
        long_bone(hip, knee, 0.02)
        long_bone(knee, ankle, 0.015, BONE_DARK)
        k, a = Vector(knee), Vector(ankle)
        m.tube(k + Vector((0.025, 0, 0)), a + Vector((0.022, 0, 0)), 0.007, 0.006, BONE, "Inside", segments=4)
        m.sphere(k + Vector((0, -0.025, 0)), (0.022, 0.012, 0.022), BONE, "Inside", segments=6, rings=4)  # kneecap
        m.tube(a, toe, 0.016, 0.01, BONE_DARK, "Inside", segments=5)
    m.ring((0, -0.01, -0.02), 0.15, 0.014, LEATHER_DARK, "Inside", scale=(1, 0.75, 1), segments=14)  # the belt
    m.sphere((0.12, -0.1, -0.07), (0.05, 0.035, 0.06), LEATHER, "Inside", segments=8, rings=6)  # a pouch
    return start


def sword():
    """A longsword along +Z from its grip at the origin."""
    start = len(m.parts)
    m.cone((0, 0, 0.11), (0, 0, 1.0), 0.032, STEEL, "Inside", segments=4, flat=0.22, facing=(0, 1, 0), smooth=False)
    m.box((0, 0, 0.1), (0.22, 0.03, 0.026), IRON, "Inside")
    m.tube((0, 0, -0.12), (0, 0, 0.09), 0.015, 0.014, GRIP, "Inside", segments=6)
    m.sphere((0, 0, -0.135), (0.026, 0.026, 0.022), IRON, "Inside", segments=8, rings=6)
    return start


def helmet():
    start = len(m.parts)
    cap(m, (0, 0, 0), 0.135, 0.012, (0, 0, 1), 92, RUST, "Inside")
    m.ring((0, 0, 0.0), 0.136, 0.01, IRON, "Inside", segments=14)
    m.box((0, -0.14, -0.03), (0.022, 0.012, 0.11), IRON, "Inside")  # the nose guard
    m.box((0, 0, 0.13), (0.02, 0.27, 0.02), IRON, "Inside")  # a ridge over the crown
    return start


def boot():
    start = len(m.parts)
    m.tube((0, 0.03, 0.08), (0, 0.03, 0.34), 0.055, 0.062, LEATHER, "Inside", segments=9)
    m.ring((0, 0.03, 0.34), 0.062, 0.012, LEATHER_DARK, "Inside", segments=10)
    m.sphere((0, -0.05, 0.055), (0.052, 0.12, 0.055), LEATHER, "Inside", segments=10, rings=6)
    m.box((0, -0.04, 0.008), (0.1, 0.27, 0.02), LEATHER_DARK, "Inside")
    return start


def shield():
    """A round wooden shield, an iron rim and boss, along +Z."""
    start = len(m.parts)
    lathe(m, [(0.29, -0.012), (0.3, 0.0), (0.29, 0.012)], WOOD, "Inside", segments=16, smooth_=False)
    m.ring((0, 0, 0), 0.3, 0.014, IRON, "Inside", segments=16)
    lathe(m, [(0.07, 0.0), (0.065, 0.03), (0.035, 0.06), (0.01, 0.068)], RUST, "Inside", segments=10)
    for k in range(3):
        m.box((0, (k - 1) * 0.1, 0.014), (0.56, 0.006, 0.004), SEAM, "Inside")  # the planks' seams
    return start


def dagger():
    start = len(m.parts)
    m.cone((0, 0, 0.05), (0, 0, 0.32), 0.022, STEEL, "Inside", segments=4, flat=0.25, facing=(0, 1, 0), smooth=False)
    m.box((0, 0, 0.045), (0.09, 0.02, 0.016), IRON, "Inside")
    m.tube((0, 0, -0.07), (0, 0, 0.04), 0.011, 0.01, LEATHER_DARK, "Inside", segments=5)
    return start


def bottle():
    start = len(m.parts)
    lathe(m, [(0.01, 0.0), (0.055, 0.005), (0.06, 0.07), (0.03, 0.12), (0.016, 0.14), (0.016, 0.18)], GLASS, "Inside", segments=10)
    m.tube((0, 0, 0.175), (0, 0, 0.2), 0.018, 0.017, WOOD, "Inside", segments=6)
    return start


def coin(centre, axis, colour):
    lathe(m, [(0.026, -0.0025), (0.028, 0.0), (0.026, 0.0025)], colour, "Inside", segments=8, axis=axis, centre=centre)


def place(start, x, up, fwd, rotation):
    transform(m, start, rotation=rotation, offset=at(x, up, fwd), bone="Inside")


place(skeleton(), 0.1, 1.25, -0.05, turn("z", 18) @ turn("x", 48) @ turn("y", -10))
place(skeleton(whole=False), -0.6, 0.45, -0.55, turn("y", 85) @ turn("z", 60))  # (lying low at the back)
place(sword(), -1.78, 1.95, 0.35, turn("z", -15) @ turn("y", 108))  # (stuck through its right side, the grip out in the air)
place(shield(), 0.85, 0.75, 0.55, turn("x", 70) @ turn("y", -35))
place(dagger(), 0.3, 2.2, 0.75, turn("x", 40) @ turn("y", 75))
place(bottle(), -0.35, 1.7, -0.9, turn("x", 60) @ turn("z", 20))
place(helmet(), 0.7, 1.55, -0.55, turn("x", 150) @ turn("y", 25))
place(boot(), -0.75, 0.62, -0.35, turn("y", 70) @ turn("z", 40))
s = len(m.parts)
skull(scale=0.95, open_jaw=8, colour=BONE_GREEN)
place(s, -0.55, 0.48, -0.85, turn("x", -40) @ turn("z", 130) @ turn("y", 30))
for a, b, r, c in (
    ((0.55, 0.32, 0.6), (0.98, 0.42, 0.38), 0.02, BONE_DARK),
    ((-0.2, 0.35, -0.2), (0.2, 0.22, -0.55), 0.018, BONE_GREEN),
    ((0.9, 1.0, -0.9), (0.75, 1.32, -0.55), 0.014, BONE),
    ((-1.0, 1.3, 0.75), (-0.78, 1.0, 0.95), 0.012, BONE_DARK),
):
    long_bone(at(*a), at(*b), r, c)
for k in range(48):
    # Coins settled low and scattered through it, a spill of them round the skeleton's belt.
    if k < 12:
        p = at(0.2 + rng.gauss(0, 0.22), 0.95 + rng.gauss(0, 0.25), 0.1 + rng.gauss(0, 0.22))
    else:
        p = at(rng.uniform(-1.2, 1.2), 0.15 + 2.3 * rng.random() ** 2.2, rng.uniform(-1.2, 1.2))
    axis = Vector((rng.uniform(-1, 1), rng.uniform(-1, 1), rng.uniform(-1, 1)))
    coin(p, axis, GOLD if k % 3 else GOLD_DARK)
for c in (GEM, GEM_BLUE, GEM):
    m.sphere(at(rng.uniform(-0.9, 0.9), rng.uniform(0.3, 1.6), rng.uniform(-0.9, 0.9)), (0.03, 0.03, 0.04), c, "Inside", segments=5, rings=3, smooth=False)


# ── Actions ──
mv = at
SIDES = {"Front": (0, 0, 1), "Back": (0, 0, -1), "Left": (1, 0, 0), "Right": (-1, 0, 0)}


def pose(body=(0, 0, 0), stretch=(1, 1, 1), top=(0, 0, 0), sides=None, front_swell=1.0, inside=(0, 0, 0), inside_turn=None):
    """`body` moves the whole block (x, up, forward), `stretch` scales it (across, up, front to back); `top`
    moves the top; `sides` {side: (x, up, forward)} moves each side; `front_swell` swells the front; `inside`
    and `inside_turn` drift what's inside."""
    p = {"@Body": mv(*body), "%Body": stretch, "@Top": mv(*top), "@Inside": mv(*inside)}
    for side, d in (sides or {}).items():
        p[f"@{side}"] = mv(*d)
    if front_swell != 1.0:
        p["%Front"] = (front_swell,) * 3
    if inside_turn is not None:
        p["Inside"] = inside_turn
    return p


def wave(u, cycles=1, phase=0.0):
    return math.sin(2 * math.pi * (u * cycles + phase))


def loop(frames, step, at_u):
    return [(1 + f, at_u(f / frames)) for f in range(0, frames + 1, step)]


def idle_at(u):
    s = wave(u)
    sides = {name: tuple(c * 0.035 * wave(u, 2, k * 0.27) for c in d) for k, (name, d) in enumerate(SIDES.items())}
    return pose(
        stretch=(1 + 0.012 * s, 1 - 0.016 * s, 1 + 0.012 * s),
        top=(0.02 * wave(u, 1, 0.4), 0.035 * wave(u, 2, 0.1), 0.02 * wave(u, 1, 0.15)),
        sides=sides,
        inside=(0.02 * wave(u, 1, 0.3), 0.035 * wave(u), 0.015 * wave(u, 1, 0.6)),
        inside_turn=turn("z", 5 * wave(u)) @ turn("x", 3 * wave(u, 1, 0.3)),
    )


def lurch(size):
    def at_u(u):
        s = wave(u)
        lead = wave(u, 1, 0.08)
        trail = wave(u, 1, -0.2)
        return pose(
            body=(0, 0, 0.09 * size * s),
            stretch=(1 + 0.02 * size * s, 1 - 0.05 * size * s, 1 + 0.07 * size * s),
            top=(0, -0.02 * size * (1 + s), 0.1 * size * s),
            sides={
                "Front": (0, 0.02 * size * lead, 0.12 * size * (0.4 + 0.6 * lead)),
                "Back": (0, 0, 0.1 * size * trail),
                "Left": (0.025 * size * wave(u, 2), 0, 0.05 * size * trail),
                "Right": (-0.025 * size * wave(u, 2), 0, 0.05 * size * trail),
            },
            front_swell=1 + 0.06 * size * (0.5 + 0.5 * lead),
            inside=(0, 0.03 * size * wave(u, 2, 0.2), -0.06 * size * wave(u, 1, -0.15)),
            inside_turn=turn("x", -4 * size * wave(u, 1, -0.15)),
        )

    return at_u


def attack_at(f):
    """Drawn back by frame 10, surging forward by 18 (the front swelling out, the top rearing over), the top
    falling forward over what's in front by 24, then settling back by 42."""
    T = [1, 10, 18, 24, 32, 42]

    def k(values):
        return keys(list(zip(T, values)), f)

    return pose(
        body=(0, 0, k((0, -0.14, 0.38, 0.42, 0.15, 0))),
        stretch=(k((1, 1.03, 0.98, 1.03, 1.01, 1)), k((1, 0.95, 0.93, 0.9, 0.98, 1)), k((1, 0.95, 1.14, 1.08, 1.02, 1))),
        top=(0, k((0, -0.08, 0.22, -0.34, -0.06, 0)), k((0, -0.18, 0.6, 0.85, 0.2, 0))),
        sides={
            "Front": (0, k((0, -0.02, 0.08, -0.08, 0, 0)), k((0, -0.15, 0.7, 0.55, 0.15, 0))),
            "Back": (0, 0, k((0, -0.05, 0.2, 0.3, 0.08, 0))),
            "Left": (k((0, 0.04, -0.02, -0.12, 0, 0)), 0, k((0, -0.05, 0.25, 0.38, 0.1, 0))),
            "Right": (k((0, -0.04, 0.02, 0.12, 0, 0)), 0, k((0, -0.05, 0.25, 0.38, 0.1, 0))),
        },
        front_swell=k((1, 0.92, 1.42, 1.3, 1.06, 1)),
        inside=(0, k((0, 0.02, -0.04, -0.06, 0, 0)), k((0, 0.05, -0.15, -0.05, 0.02, 0))),
        inside_turn=turn("x", k((0, 3, -8, -5, 0, 0))),
    )


actions = {
    "Idle": loop(90, 3, idle_at),
    "Walk": loop(48, 3, lurch(1.0)),
    "Run": loop(30, 2, lurch(1.7)),
    "Attack": [(f, attack_at(f)) for f in (1, 4, 7, 10, 13, 16, 18, 20, 22, 24, 27, 30, 33, 36, 39, 42)],
}
m.finish(actions, bake={"size": 512, "ao": 0.1, "mottle": 0.14, "mottle_scale": 2.2, "dirt": 1.0})
