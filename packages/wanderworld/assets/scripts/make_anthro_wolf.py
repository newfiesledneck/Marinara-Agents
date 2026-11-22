"""The anthro wolf avatar bodies, a male about 1.83 m to the ear tips and a female about 1.73 m, built on
the human base avatar's body (make_avatar.py's MakeHuman-based man and woman, read the same way by a copy
of its code in wwanthro_wolf.py), on the people's skeleton plus a tail chain, so the people's recorded
animations play on them. Writes assets/models/anthro-wolf-male.glb and anthro-wolf-female.glb (and a debug
.blend and the textures' JPEGs in assets/build). Run (BLENDER: your Blender executable; add `-- male` or
`-- female` for one):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_anthro_wolf.py

How the human becomes a wolf:

- The head: the human face carried to a wolf's by a smooth warp of space (a thin-plate spline) through
  matching points found by casting rays at the face (the nose to the muzzle's tip, the mouth's corners back
  under the eyes, the eyes enlarged, turned out and tilted), so the face's edge loops become the muzzle's;
  then the muzzle, jaw, skull, brows and cheekbones put onto a designed shape (a signed distance) and
  relaxed along it, the lips closed to a thin line, the lids opened, nostrils pressed in. The human ears
  are smoothed away and tall cupped ears grown out of the skull; the head subdivided once.
- The legs: digitigrade by skinning alone above the hock. The thigh and shin keep the human's lengths and
  are only turned (the knee forward, the shin back to a hock off the ground), exactly as the human's
  clothes bound to these bones will bend; only below the hock is anything reshaped: the rear foot
  stretched long and slim, the heel drawn to the point of the hock, the front of the foot rounded into a
  paw with four toes grown out of it (each a rounded bean on its pad, with a claw) and a heart-shaped pad.
- The hands keep their five fingers, with claws over the nails and bare pads.
- A bushy tail grown out of the base of the back on tail_01..tail_04 (on pelvis); the standard bones are
  the human's. The trunk, arms and thighs are the human's surface with 3 mm of fur.
- Fur: a ruff round the neck ending in points (`ruff_flat` lays it flat for a collar), cheek fur flaring
  in tufts, and small soft cards of fur at the cheeks, the ruff, the ears, elbows and the tail's tip.
- Underwear: the human avatar's styles (its garment code, copied), each a mesh of its own named
  underwear-bottom-<style> or underwear-top-<style>, hung on the furred body with its bands and hems, the
  bottoms with an opening for the tail: briefs and boxer briefs for both, a bra and a sports bra for her.
- Shape keys (glTF morph targets, each 0-1): the human's (thin, heavy, muscle, chest or bust, hips, waist,
  belly, shoulders, neck, jaw, cheeks, eyes) carried through every reshaping, and neck_slim, muzzle and
  muzzle_short, ears_tall and ears_small, tail (fuller), tail_long and tail_short, ruff_flat. The
  underwear has the same keys.
- Parts the game recolours through their base colour factor, over near-white textures: fur, fur2 (the
  pale belly, muzzle, inner ears and tail tip), nose (nose, lips and pads), eyes, eyelashes, claws, teeth,
  fur_tufts and fur2_tufts (tint with fur and fur2), and on the underwear underwear and underwear_trim.

Base mesh and shapes: MakeHuman's hm08 mesh and targets (CC0), read as data by our own code; made in
Blender by ThatOneCan.
"""

import math
import os
import sys

import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import wwanthro_wolf as aw  # noqa: E402
import wwavatar as wa  # noqa: E402
import wwblend as ww  # noqa: E402
from wwanthro_wolf import BI, smoothstep, unit  # noqa: E402

MALE = {
    "name": "anthro-wolf-male",
    "human": aw.HUMAN_MALE,
    "female": False,
    # The head (in the human's eye frame: across, forward, up, metres; see head_targets).
    "muzzle": 1.0,
}
FEMALE = {
    "name": "anthro-wolf-female",
    "human": aw.HUMAN_FEMALE,
    "female": True,
    "muzzle": 0.92,
    "ear": {"height": 0.1, "width": 0.029},
    "ruff": 0.8,
    "ruff_low": 0.04,
    "cheeks_k": 0.8,
    "tail_k": 0.94,
    "paw": 1.22,
    "eyes_open": 0.36,
    "cheek_tufts": 13,
    "ruff_tufts": 26,
}

# Material parts: (name, colour, roughness, specular).
PARTS = [
    ("fur", 0x6E6862, 0.85, 0.3),
    ("fur2", 0xE8DFD0, 0.85, 0.3),
    ("nose", 0x2E2928, 0.32, 0.5),
    ("eyes", 0xD99A2B, 0.15, 0.6),
    ("eyelashes", 0x141010, 1.0, 0.0),
    ("claws", 0x2E2A27, 0.5, 0.3),
    ("teeth", 0xF2EDE2, 0.3, 0.5),
    ("fur_tufts", 0x6E6862, 0.9, 0.0),
    ("fur2_tufts", 0xE8DFD0, 0.9, 0.0),
]
# The underwear's parts (its own meshes): (name, colour, roughness, specular).
WEAR_PARTS = [("underwear", 0x3A404C, 0.85, 0.25), ("underwear_trim", 0x2C313B, 0.7, 0.3)]
P = {p[0]: i for i, p in enumerate(PARTS)}


# ── The head: the human face carried to a wolf's by a smooth warp through matching points ────────────


class Frame:
    """The human head's frame: the point between the eyes, x across (left +), f forward, u up."""

    def __init__(self, H):
        e = H["body"].eye
        self.o = (e["l"]["centre"] + e["r"]["centre"]) / 2
        self.r = e["l"]["radius"]

    def to(self, x, f, u):
        return self.o + np.array([x, -f, u])

    def of(self, p):
        q = np.asarray(p) - self.o
        return np.array([q[..., 0], -q[..., 1], q[..., 2]]).T


def head_surface(mesh, head):
    """A BVH of the head's faces (those wholly in the `head` vertex mask)."""
    faces = [f for f in mesh.faces if head[f].all()]
    tris = [(f[0], f[i], f[i + 1]) for f in faces for i in range(1, len(f) - 1)]
    return BVHTree.FromPolygons(mesh.co.tolist(), tris)


def human_landmarks(F, bvh):
    """Points on the human face found by casting rays at it: {name: point}, the left side's for a pair."""

    def front(x, u):
        loc, *_ = bvh.ray_cast(Vector(tuple(F.to(x, 0.4, u))), Vector((0, 1, 0)), 1.0)
        return None if loc is None else np.array(loc)

    def side(f, u, x0=0.3):
        loc, *_ = bvh.ray_cast(Vector(tuple(F.to(x0, f, u))), Vector((-1, 0, 0)), 1.0)
        return None if loc is None else np.array(loc)

    def top(x, f):
        loc, *_ = bvh.ray_cast(Vector(tuple(F.to(x, f, 0.4))), Vector((0, 0, -1)), 1.0)
        return None if loc is None else np.array(loc)

    def back(x, u):
        loc, *_ = bvh.ray_cast(Vector(tuple(F.to(x, -0.5, u))), Vector((0, -1, 0)), 1.0)
        return None if loc is None else np.array(loc)

    return front, side, top, back


def head_pairs(B, H, F, bvh):
    """Matching points (human, wolf) for the head's warp."""
    front, side, top, back = human_landmarks(F, bvh)
    m = B["muzzle"]
    k = F.r / 0.0159  # (the head's size against the man's)
    W = lambda x, f, u: F.to(x * k, f * k, u * k)  # noqa: E731
    pairs = []

    def pair(src, dst, mirror=True):
        if src is None:
            print("missed a landmark", dst)
            return
        pairs.append((src, dst))
        if mirror and abs(src[0]) > 1e-4:
            pairs.append((src * np.array([-1, 1, 1]), dst * np.array([-1, 1, 1])))

    # The midline, top to chin: (height of the ray from the front, wolf point (forward, up)).
    for u, (f, uu) in (
        (0.075, (-0.035, 0.068)),
        (0.05, (-0.006, 0.05)),
        (0.025, (0.022, 0.032)),
        (0.004, (0.036, 0.02)),
        (-0.015, (0.08 * m, 0.006)),
        (-0.03, (0.125 * m, -0.008)),
    ):
        pair(front(0, u * k), W(0, f, uu))
    tip = front(0, -0.040 * k)
    pair(tip, W(0, 0.168 * m, -0.024))
    # Under the nose to the chin: rays from the front, lower down.
    for u, (f, uu) in (
        (-0.052, (0.152 * m, -0.048)),
        (-0.062, (0.149 * m, -0.058)),
        (-0.070, (0.143 * m, -0.066)),
        (-0.079, (0.135 * m, -0.073)),
        (-0.095, (0.122 * m, -0.083)),
        (-0.108, (0.108 * m, -0.091)),
    ):
        pair(front(0, u * k), W(0, f, uu))
    # Under the chin, from below (the jaw's underside).
    # Off the midline: nose wings and bridge sides, the muzzle's sides, the mouth's corners, the jaw.
    for (x, u), (xx, f, uu) in (
        ((0.009, -0.02), (0.019, 0.105 * m, 0.0)),
        ((0.012, -0.034), (0.023, 0.14 * m, -0.012)),
        ((0.018, -0.047), (0.026, 0.155 * m, -0.032)),
        ((0.03, -0.03), (0.034, 0.075 * m, -0.016)),
        ((0.026, -0.052), (0.035, 0.09 * m, -0.048)),
        ((0.016, -0.062), (0.026, 0.135 * m, -0.058)),
        ((0.0255, -0.07), (0.037, 0.03, -0.061)),
        ((0.016, -0.078), (0.024, 0.11 * m, -0.072)),
        ((0.03, -0.09), (0.03, 0.06 * m, -0.083)),
        ((0.018, -0.105), (0.017, 0.095 * m, -0.09)),
        ((0.045, -0.035), (0.05, 0.02, -0.03)),
        ((0.055, -0.015), (0.062, 0.0, -0.012)),
        ((0.045, 0.035), (0.048, -0.006, 0.042)),
        ((0.02, 0.06), (0.024, -0.02, 0.058)),
    ):
        pair(front(x * k, u * k), W(xx, f, uu))
    # The sides and back of the skull: kept, the top a little lower.
    for f, u in ((-0.03, 0.04), (-0.08, 0.04), (-0.12, 0.0), (-0.06, -0.06), (-0.11, -0.05)):
        p = side(f * k, u * k)
        if p is not None:
            pair(p, p + np.array([0.0, 0.0, -0.006 * max(0, u) / 0.04]) * k)
    for x, f in ((0.0, -0.05), (0.0, -0.1), (0.04, -0.03), (0.04, -0.09), (0.0, -0.01)):
        p = top(x * k, f * k)
        drop = 0.022 if f > -0.07 else 0.015
        if p is not None:
            pair(p, p + np.array([0.0, 0.01 * k, -drop * k]))
    for x, u in ((0.0, 0.0), (0.04, 0.02), (0.0, 0.06)):
        p = back(x * k, u * k)
        if p is not None:
            pair(p, p + np.array([0.0, 0.0, -0.01 * k * max(0, u) / 0.06]))
    # The eyes: carried whole (turned out and tilted, as a wolf's), with a ring of skin round each.
    e = H["body"].eye["l"]
    c = e["centre"]
    to = W(0.036, -0.004, 0.006)
    turn = rotation(np.array([0, 0, 1.0]), math.radians(22)) @ rotation(np.array([0, 1.0, 0]), math.radians(-12))
    eye_map = lambda p: to + B.get("eye_scale", 1.28) * (turn @ (np.asarray(p) - c).T).T  # noqa: E731
    for a in np.linspace(0, 2 * np.pi, 12, endpoint=False):
        for r in (1.0, 1.45):
            q = c + np.array([math.cos(a), 0.0, math.sin(a)]) * F.r * r
            if q[0] < 0.012:
                continue
            hit, *_ = bvh.ray_cast(Vector(tuple(q + np.array([0, -0.1, 0]))), Vector((0, 1, 0)), 0.3)
            p = np.array(hit) if hit is not None else q
            pair(p, eye_map(p))
    for q in (c, c + np.array([0, 0, F.r * 0.8]), c - np.array([0, 0, F.r * 0.8]), c + np.array([0, -F.r * 0.9, 0])):
        pair(q, eye_map(q))
    return pairs, eye_map


def rotation(axis, angle):
    axis = unit(axis)
    x, y, z = axis
    c, s = math.cos(angle), math.sin(angle)
    C = 1 - c
    return np.array([[c + x * x * C, x * y * C - z * s, x * z * C + y * s], [y * x * C + z * s, c + y * y * C, y * z * C - x * s], [z * x * C - y * s, z * y * C + x * s, c + z * z * C]])


def warp_head(B, H, mesh):
    """Moves the head's vertices (and their shape keys) by the warp; returns the warp as a function."""
    F = Frame(H)
    head = mesh.W[:, BI["Head"]] > 0.5
    bvh = head_surface(mesh, head & (H["mouth_v"] == 0))
    pairs, eye_map = head_pairs(B, H, F, bvh)
    # Kept still: the neck below the head.
    J = H["J"]
    neck = (mesh.W[:, BI["Head"]] < 0.05) & (mesh.co[:, 2] > J["neck_01"][2] - 0.1) & (mesh.co[:, 2] < J["neck_01"][2] - 0.015)
    idx = np.nonzero(neck)[0][::7]
    src = np.array([p for p, _ in pairs] + [mesh.co[i] for i in idx])
    dst = np.array([q for _, q in pairs] + [mesh.co[i] for i in idx])
    # (Points closer than 4 mm to one already taken are dropped: the fit would fold between them.)
    keep = []
    for i, p in enumerate(src):
        if all(np.linalg.norm(p - src[j]) > 0.004 for j in keep):
            keep.append(i)
    src, dst = src[keep], dst[keep]
    print("warp points", len(src))
    warp = aw.Warp(src, dst, smooth=B.get("warp_smooth", 1e-4))
    m = mesh.W[:, BI["Head"]] + mesh.W[:, BI["neck_01"]] * 0.5

    def move(p, mask=None):
        d = warp.offset(p)
        return p + d * (1.0 if mask is None else mask[:, None])

    sel = m > 1e-4
    p0 = mesh.co[sel]
    p1 = move(p0, m[sel])
    for k, v in mesh.keys.items():
        v[sel] = move(p0 + v[sel], m[sel]) - p1
    mesh.co[sel] = p1
    return move, eye_map, F


def smin(a, b, k):
    h = np.clip(0.5 + 0.5 * (b - a) / k, 0.0, 1.0)
    return b + (a - b) * h - k * h * (1 - h)


def smax(a, b, k):
    return -smin(-a, -b, k)


def loft(q, stations, n=2.6, taper=0.0):
    """A signed distance (roughly, in metres) to a lofted box with rounded corners along f: q are points
    (x, f, u); stations rows (f, top, bottom, half-width, front of this station's outline...). Inside < 0.
    `taper` narrows the outline towards its top."""
    st = np.asarray(stations, dtype=np.float64)
    f = np.clip(q[:, 1], st[0, 0], st[-1, 0])
    top = np.interp(f, st[:, 0], st[:, 1])
    bot = np.interp(f, st[:, 0], st[:, 2])
    hw = np.interp(f, st[:, 0], st[:, 3])
    c = (top + bot) / 2
    hh = (top - bot) / 2
    v = (q[:, 2] - c) / hh
    a = hw * (1 - taper * np.clip(v, -1, 1))
    x = np.abs(q[:, 0]) / a
    y = np.abs(v)
    r = (x**n + y**n) ** (1 / n)
    scale = np.minimum(a, hh)
    d = (r - 1) * scale
    # The ends: rounded off past the first and last station.
    back = st[0, 0] - q[:, 1]
    return np.maximum(d, back)


def ellipsoid(q, c, r, n=2.0):
    """Roughly the signed distance to a (super)ellipsoid."""
    t = np.abs((q - np.asarray(c)) / np.asarray(r))
    return ((t**n).sum(1) ** (1 / n) - 1) * min(r)


def head_sdf(B):
    """The wolf's head as a signed distance, in the eye frame (x, f, u) of a man-sized head: the skull,
    the brows and cheekbones, the muzzle, the nose and the lower jaw."""
    m = B["muzzle"]
    up = [(0.0, 0.024, -0.058, 0.038), (0.04, 0.012, -0.06, 0.033), (0.08, 0.004, -0.062, 0.028), (0.12, -0.003, -0.063, 0.0245), (0.155, -0.009, -0.062, 0.0215)]
    jaw = [(-0.02, -0.056, -0.094, 0.036), (0.05, -0.062, -0.092, 0.027), (0.1, -0.066, -0.088, 0.021), (0.128, -0.068, -0.082, 0.016)]
    up = [(f * m, t, b, w) for f, t, b, w in up]
    jaw = [(f * m, t, b, w) for f, t, b, w in jaw]
    nose_c = np.array([0.0, 0.153 * m, -0.021])
    nose_r = np.array([0.0188, 0.017, 0.0118])
    tip_f = up[-1][0]
    jaw_f = jaw[-1][0]

    def sdf(q):
        d_up = loft(q, up, 2.8, taper=0.3)
        v = np.clip((q[:, 2] + 0.06) / 0.06, 0, 1)
        front = q[:, 1] - (tip_f - 0.004 + 0.006 * v)
        d_up = smax(d_up, front, 0.018)
        d_jaw = loft(q, jaw, 2.4, taper=-0.1)
        d_jaw = smax(d_jaw, q[:, 1] - jaw_f, 0.016)
        d = smin(d_up, d_jaw, 0.004)
        nose = ellipsoid(q, nose_c, nose_r, 2.3)
        # (The nostrils: two hollows at the front of the nose, turned out a little.)
        for sx in (1, -1):
            nostril = ellipsoid(q, (sx * 0.0085, nose_c[1] + 0.0155, nose_c[2] - 0.0055), (0.0042, 0.0045, 0.0026))
            nose = smax(nose, -nostril, 0.0015)
        d = smin(d, nose, 0.006)
        skull = ellipsoid(q, (0.0, -0.058, 0.0), (0.07, 0.096, 0.064), 2.5)
        d = smin(d, skull, 0.03)
        qa = q * np.array([-1.0, 1.0, 1.0])
        for p in (q, qa):
            brow = ellipsoid(p, (0.034, 0.008, 0.022), (0.021, 0.016, 0.0095))
            cheek = ellipsoid(p, (0.047, -0.008, -0.033), (0.029, 0.035, 0.024))
            jowl = ellipsoid(p, (0.036, -0.045, -0.07), (0.02, 0.036, 0.022))
            d = smin(d, brow, 0.012)
            d = smin(d, cheek, 0.015)
            d = smin(d, jowl, 0.02)
        return d

    return sdf


def sculpt_head(B, H, mesh, F, pin, ear_zone):
    """Puts the muzzle and jaw onto the designed shape: each vertex there is moved onto the shape's
    surface, relaxed along it, and put back, its shape key offsets carried along."""
    k = F.r / 0.0159
    sdf = head_sdf(B)
    head = mesh.W[:, BI["Head"]] > 0.5

    def local(p):
        return F.of(p) / k

    q = local(mesh.co)
    # Where: in front of the cheeks and below the eyes, fading out towards them.
    # Where: the whole head but the eyes' surroundings, the ears (replaced) and the nape, more in front.
    w = np.clip(mesh.W[:, BI["Head"]], 0, 1) * (H["mouth_v"] == 0)
    w *= 0.75 + 0.25 * smoothstep(0.0, 0.04, q[:, 1])
    w *= smoothstep(-0.13, -0.09, q[:, 2] + 0.0 * q[:, 1])
    for s in (1, -1):
        e = np.array([0.036 * s, -0.004, 0.006])
        w *= smoothstep(0.02, 0.034, np.linalg.norm(q - e, axis=1))
    sel = np.nonzero(w > 1e-3)[0]
    ws = w[sel]
    eps = 1e-4

    def grad(p):
        g = np.zeros_like(p)
        for i in range(3):
            dp = np.zeros(3)
            dp[i] = eps
            g[:, i] = (sdf(p + dp) - sdf(p - dp)) / (2 * eps)
        return unit(g)

    def project(p, amount):
        for _ in range(3):
            d = sdf(p)
            p = p - (d * amount)[:, None] * grad(p)
        return p

    E = mesh.edges()
    qs = q.copy()
    for it in range(30):
        qs[sel] = project(qs[sel], ws)
        if it < 29:
            avg = aw.neighbour_mean(len(qs), E, qs)
            free = ws * (1 - pin[sel]) * (1.0 if it < 5 else ear_zone[sel])
            qs[sel] += (avg[sel] - qs[sel]) * 0.5 * free[:, None]
    new = F.o + np.c_[qs[:, 0], -qs[:, 1], qs[:, 2]] * k
    moved = new - mesh.co
    # The mouth's inside follows the lips nearest it.
    inside = np.nonzero(H["mouth_v"])[0]
    lips = np.nonzero(pin)[0]
    near = lips[np.argmin(np.linalg.norm(mesh.co[inside][:, None] - mesh.co[lips][None], axis=2), axis=1)]
    mesh.co[sel] = new[sel]
    mesh.co[inside] += moved[near]
    # The lips closed to a thin line along the mouth (and the mouth's inside with them).
    m = B["muzzle"]
    lipv = np.concatenate([lips, inside])
    q = local(mesh.co[lipv])
    line = np.interp(q[:, 1], [0.0, 0.05 * m, 0.12 * m, 0.15 * m], [-0.06, -0.0615, -0.0635, -0.064])
    close = 0.3 + 0.7 * smoothstep(0.03, 0.0, np.abs(q[:, 2] - line))
    q[:, 2] = line + (q[:, 2] - line) * np.where(np.isin(lipv, lips), 0.3, 0.45)
    mesh.co[lipv] = F.o + np.c_[q[:, 0], -q[:, 1], q[:, 2]] * k


# ── Paws and hands ───────────────────────────────────────────────────────────────────────────────────

# The paw, in the foot's own measures from the ball joint on the ground (outward, forward, up), for a man:
# four toes (centre, radii) and the pad behind them.
PAW_BASE = ((0.0, -0.002, 0.021), (0.036, 0.036, 0.021))  # the paw's rounded body (centre, radii), for a man
# Each toe: (outward, forward) of its root on the paw's front, its length and girth.
PAW_TOES = [(-0.029, 0.018, 0.024, 0.0098), (-0.0105, 0.028, 0.029, 0.0108), (0.0105, 0.028, 0.029, 0.0108), (0.029, 0.018, 0.024, 0.0098)]


def foot_frame(J, s):
    b = J[f"ball_{s}"].copy()
    b[2] = 0.0
    fw = J[f"ball_{s}.tail"] - J[f"ball_{s}"]
    fw[2] = 0.0
    fw = unit(fw)
    out = np.array([1.0 if s == "l" else -1.0, 0.0, 0.0])
    out = unit(out - fw * (out @ fw))
    return b, out, fw, np.array([0.0, 0.0, 1.0])


def paws(B, H, mesh):
    """The feet made ready to be a wolf's hind paws, in the human's rest pose (before the legs are made
    digitigrade): the front of each foot subdivided and rounded into the paw's body (the toes are grown
    out of it later), the middle of the foot narrowed and made shallower (it becomes the long rear foot)
    and the heel drawn out to the point of the hock. Only what lies below the ankle (the hock-to-be) is
    reshaped."""
    J = H["J"]
    k = B.get("paw", 1.25) * (J["thigh_l"][2] / 0.982)
    H["paw_k"] = k
    co = mesh.co
    E = mesh.edges()
    for s in ("l", "r"):
        b, out, fw, up = foot_frame(J, s)
        below = (mesh.W[:, BI[f"foot_{s}"]] + mesh.W[:, BI[f"ball_{s}"]]) > 0.5

        def local(p):
            d = p - b
            return np.c_[d @ out, d @ fw, d @ up]

        def world(q):
            return b + np.outer(q[:, 0], out) + np.outer(q[:, 1], fw) + np.outer(q[:, 2], up)

        q = local(co)
        along = q[:, 1]
        mid = below & (q[:, 2] < 0.11)
        # The middle of the foot narrowed about its line, the heel too.
        narrow = 1 - 0.48 * smoothstep(0.03, -0.03, along) * smoothstep(-0.2, -0.12, along) - 0.4 * smoothstep(-0.13, -0.2, along)
        fade = smoothstep(0.13, 0.07, q[:, 2])
        q[:, 0] = np.where(mid, q[:, 0] * (1 + (narrow - 1) * fade), q[:, 0])
        # The instep made shallower (it becomes the front of the long rear foot, which is slim).
        inst = mid * smoothstep(0.0, -0.04, along) * smoothstep(-0.2, -0.14, along)
        q[:, 2] = 0.03 + (q[:, 2] - 0.03) * (1 - 0.25 * inst)
        # The heel drawn back and up, to the point of the hock.
        heel = smoothstep(-0.15, -0.22, along) * below * smoothstep(0.1, 0.03, q[:, 2])
        q[:, 1] -= 0.022 * heel
        q[:, 2] += 0.008 * heel
        # The front rounded into the paw's body (the human's toes smoothed away into it).
        c0, r0 = np.array(PAW_BASE[0]) * k, np.array(PAW_BASE[1]) * k
        w = below * smoothstep(-0.05, -0.01, along) * smoothstep(0.08, 0.05, q[:, 2])
        sel = np.nonzero(w > 1e-3)[0]
        for it in range(24):
            p = q[sel]
            for _ in range(2):
                d = ellipsoid(p, c0, r0, 2.4)
                g = np.zeros_like(p)
                for i in range(3):
                    dp = np.zeros(3)
                    dp[i] = 1e-4
                    g[:, i] = (ellipsoid(p + dp, c0, r0, 2.4) - ellipsoid(p - dp, c0, r0, 2.4)) / 2e-4
                p = p - (d * w[sel])[:, None] * unit(g)
            q[sel] = p
            if it < 23:
                avg = aw.neighbour_mean(len(q), E, q)
                q[sel] += (avg[sel] - q[sel]) * 0.5 * w[sel, None]
        co[below] = world(q[below])
        legf = np.array([below[f].all() for f in mesh.faces])
        mesh.fmat[legf & (mesh.fmat == P["claws"])] = P["fur"]


def toes(B, H, mesh):
    """Four toes grown out of the front of each paw (as the ears are out of the skull), each a rounded
    bean resting on the ground on its pad, splayed a little; the big pad under the paw behind them. In the
    wolf's own pose. Returns the claws."""
    J = H["J"]
    k = H["paw_k"]
    claws = []
    mesh.tags.setdefault("toe_pad", np.zeros(len(mesh.co)))
    for s in ("l", "r"):
        b, out, fw, up = foot_frame(J, s)
        c0, r0 = np.array(PAW_BASE[0]) * k, np.array(PAW_BASE[1]) * k
        for x, f, length, girth in PAW_TOES:
            x, f, length, girth = x * k, f * k, length * k, girth * k
            # (The root: on the paw's front, a little below its middle.)
            origin = b + out * x + fw * (f + 0.08) + up * (0.013 * k)
            root, nrm = surface_point(mesh, origin, -fw)
            tn = unit(nrm)
            d = unit(fw + out * (x / max(abs(x), 1e-9)) * (0.25 if abs(x) > 0.02 * k else 0.06) - up * 0.18)
            side = unit(np.cross(up, d))
            vert = np.cross(d, side)
            loop = aw.cut_patch(mesh, root, tn, (girth * 0.78, girth * 0.7), (side, unit(np.cross(tn, side))))
            Wl = mesh.W[loop].mean(0)
            keys_l = {kk: v[loop].mean(0) for kk, v in mesh.keys.items()}
            base = mesh.co[loop].mean(0) - tn * 0.002 * k

            def ring(t, ang, base=base, d=d, side=side, vert=vert, length=length, girth=girth):
                # A bean: swelling out from the root, round at the tip, its underside flatter (the pad).
                r = girth * (0.82 + 0.3 * math.sin(math.pi * min(1.0, t * 1.15)) ** 0.7) * (1 - t**3) ** 0.45 + 0.0008
                c = base + d * (length * t) - vert * (girth * 0.35 * t * t)
                cs, sn = np.cos(ang), np.sin(ang)
                lat = r * 1.05 * cs
                ht = r * 0.92 * np.where(sn < 0, sn * 0.78, sn)
                return c + np.outer(lat, side) + np.outer(ht, vert)

            rings = aw.grow(mesh, loop, (side, vert, d), ring, 9, P["fur"], lambda p, Wl=Wl: np.repeat(Wl[None], len(p), 0), lambda p, keys_l=keys_l: {kk: np.repeat(v[None], len(p), 0) for kk, v in keys_l.items()})
            pad = np.zeros(len(mesh.co))
            for j, idx in enumerate(rings[1:-2]):
                rel = mesh.co[idx] - mesh.co[idx].mean(0)
                pad[idx] = (rel @ vert < -0.25 * girth) & (j >= 2)
            mesh.tags["toe_pad"] = np.maximum(np.resize(mesh.tags["toe_pad"], len(mesh.co)), pad)
            tip = mesh.co[rings[-1][0]]
            ctop = tip + vert * girth * 0.55 - d * girth * 0.55
            claws.append(claw(ctop, d - vert * 0.25, -vert, 0.017 * k, girth * 0.36, f"ball_{s}"))
        # The pads: under each toe, and the big heart-shaped pad under the paw behind them.
        c = mesh.centres()
        rel = c - b
        qc = np.c_[rel @ out, rel @ fw, rel @ up]
        heart_c = np.array([0.0, c0[1] - 0.004 * k])
        t = (qc[:, :2] - heart_c) / (np.array([0.024, 0.019]) * k)
        heart = (t[:, 0] ** 2 + (t[:, 1] + 0.3 * np.abs(t[:, 0])) ** 2 < 1.0) & (qc[:, 2] < 0.012 * k)
        padv = mesh.tags["toe_pad"] > 0.5
        toe_pad = np.array([padv[f].all() for f in mesh.faces])
        near = np.linalg.norm(rel[:, :2], axis=1) < 0.12
        mesh.fmat[(heart | toe_pad) & near & (mesh.fmat == P["fur"])] = P["nose"]
    return claws


# ── The legs: digitigrade ───────────────────────────────────────────────────────────────────────────


def leg_joints(B, J):
    """Each leg's new joints, the thigh and shin keeping the human's lengths (so the human's clothes, bound
    to these bones, fit the leg as it is): the thigh turned forward, the shin turned back to a hock well off
    the ground, and the long rear foot down to the ball of the foot, which stays where the human's was."""
    out = dict(J)
    for s in ("l", "r"):
        hip, knee0, ankle0, ball0 = J[f"thigh_{s}"], J[f"calf_{s}"], J[f"foot_{s}"], J[f"ball_{s}"]
        a = math.radians(B.get("thigh_angle", 26))
        knee = hip + rotation(np.array([1.0, 0, 0]), -a) @ (knee0 - hip)
        shin = ankle0 - knee0
        L = np.linalg.norm(shin)
        b = math.radians(B.get("shin_angle", 38))
        hock = knee + np.array([shin[0], L * math.sin(b), -L * math.cos(b)]) * np.array([1.0, 1.0, 1.0])
        hock = knee + (hock - knee) * (L / np.linalg.norm(hock - knee))
        ball = np.array([ball0[0], hip[1] - B.get("ball_forward", 0.035), ball0[2]])
        out[f"calf_{s}"] = knee
        out[f"foot_{s}"] = hock
        out[f"ball_{s}"] = ball
        out[f"ball_{s}.tail"] = ball + (J[f"ball_{s}.tail"] - ball0)
    return out


def bone_affine(a0, b0, a1, b1, stretch=False):
    """The turn (and, if `stretch`, the stretch past a0) taking segment a0-b0 to a1-b1: a function of
    points. Without the stretch it is just what skinning does: the bone turned and carried to its new head."""
    d0, d1 = b0 - a0, b1 - a1
    l0, l1 = np.linalg.norm(d0), np.linalg.norm(d1)
    R = wa.quat_between(d0, d1)
    ax = d0 / l0
    k = l1 / l0 if stretch else 1.0

    def f(p):
        q = p - a0
        t = q @ ax
        q = q + np.outer(t * (np.where(t > 0, k, 1.0) - 1), ax)
        return a1 + q @ R.T

    return f


def digitigrade(B, H, meshes):
    """The legs moved onto their digitigrade joints by blending each leg bone's turn and stretch by the
    vertices' weights (as skinning does), shape keys carried along."""
    J = H["J"]
    J2 = leg_joints(B, J)
    moves = []
    for s in ("l", "r"):
        for b, c in (("thigh", "calf"), ("calf", "foot"), ("foot", "ball"), ("ball", "ball.tail")):
            bn = f"{b}_{s}"
            cn = f"{c}_{s}" if c != "ball.tail" else f"ball_{s}.tail"
            moves.append((BI[bn], bone_affine(J[bn], J[cn], J2[bn], J2[cn], stretch=(b == "foot"))))
    for mesh in meshes:
        co = mesh.co
        out = co.copy()
        keys_out = {k: v.copy() for k, v in mesh.keys.items()}
        for bi, f in moves:
            w = mesh.W[:, bi]
            sel = w > 0
            if not sel.any():
                continue
            moved = f(co[sel])
            out[sel] += w[sel, None] * (moved - co[sel])
            for k, v in mesh.keys.items():
                keys_out[k][sel] += w[sel, None] * ((f(co[sel] + v[sel]) - moved) - v[sel])
        mesh.co = out
        mesh.keys = keys_out
    J.update({k: v for k, v in J2.items() if k.startswith(("calf", "foot", "ball"))})


def horn(points, radii, bone, mat, segments=8, flat=1.0, up=(0.0, 0.0, 1.0)):
    """A tapering tube along a curve to a point (a claw, a fang), its section squashed across by `flat`."""
    pts = np.asarray(points, dtype=np.float64)
    tan = unit(np.gradient(pts, axis=0))
    upv = np.asarray(up, dtype=np.float64)
    verts, faces = [], []
    for p, r, t in zip(pts[:-1], radii[:-1], tan[:-1]):
        e1 = unit(upv - t * (upv @ t))
        e2 = np.cross(t, e1)
        for j in range(segments):
            a = 2 * math.pi * j / segments
            verts.append(p + r * (math.cos(a) * e1 + flat * math.sin(a) * e2))
    n = len(pts) - 1
    for i in range(n - 1):
        for j in range(segments):
            k = (j + 1) % segments
            faces.append([i * segments + j, (i + 1) * segments + j, (i + 1) * segments + k, i * segments + k])
    tip = len(verts)
    verts.append(pts[-1])
    for j in range(segments):
        faces.append([(n - 1) * segments + j, tip, (n - 1) * segments + (j + 1) % segments])
    back = len(verts)
    verts.append(pts[0] - tan[0] * radii[0] * 0.5)
    for j in range(segments):
        faces.append([(j + 1) % segments, back, j])
    W = np.zeros((len(verts), aw.NB))
    W[:, BI[bone]] = 1.0
    return aw.Mesh(np.array(verts), faces, np.full(len(faces), mat), {}, W)


def claw(base, along, down, length, width, bone):
    """A claw from `base` reaching along `along` and hooking towards `down`."""
    along = unit(along)
    down = unit(down - along * (along @ down))
    t = np.linspace(0, 1, 6)
    pts = [base + along * length * u + down * length * (0.55 * u * u) for u in t]
    radii = [width * (1 - u) ** 0.8 * (1 + 0.15 * (1 - u)) for u in t]
    return horn(pts, radii, bone, P["claws"], 8, flat=0.75, up=-down)


def islands(mesh, faces_mask):
    """Connected groups of the faces in the mask (sharing a vertex)."""
    idx = np.nonzero(faces_mask)[0]
    by_v = {}
    for f in idx:
        for v in mesh.faces[f]:
            by_v.setdefault(v, []).append(f)
    seen, out = set(), []
    for f in idx:
        if f in seen:
            continue
        group, todo = [], [f]
        seen.add(f)
        while todo:
            g = todo.pop()
            group.append(g)
            for v in mesh.faces[g]:
                for h in by_v[v]:
                    if h not in seen:
                        seen.add(h)
                        todo.append(h)
        out.append(group)
    return out


def hand_claws_and_pads(B, H, mesh):
    """Claws over the fingernails (which stay, dark, as the claws' beds) and bare pads on the palm and the
    fingertips' undersides."""
    J = H["J"]
    normals = mesh.normals()
    out = []
    c = mesh.centres()
    fn = np.array([normals[f].mean(0) for f in mesh.faces])
    for s in ("l", "r"):
        hand = mesh.W[:, BI[f"hand_{s}"]] > 0.5
        hf = np.array([hand[f].all() for f in mesh.faces])
        nails = islands(mesh, hf & (mesh.fmat == P["claws"]))
        backs = []
        for g in nails:
            vs = np.unique(np.concatenate([mesh.faces[f] for f in g]))
            p = mesh.co[vs]
            centre = p.mean(0)
            nrm = unit(normals[vs].mean(0))
            # (Along the finger: the patch's long axis, pointing away from the wrist.)
            u, sv, vt = np.linalg.svd(p - centre)
            along = vt[0]
            if (centre - J[f"hand_{s}"]) @ along < 0:
                along = -along
            size = min(np.linalg.norm(p - centre, axis=1).max(), 0.0075)
            base = centre + along * size * 0.1 + nrm * 0.0015
            out.append(claw(base, along, -nrm, 0.019 * (0.92 if B["female"] else 1.0), size * 0.6, f"hand_{s}"))
            backs.append((centre, nrm, size))
        # Fingertip pads: under each nail, on the side facing away from it.
        pad = np.zeros(len(c), dtype=bool)
        for centre, nrm, size in backs:
            under = centre - nrm * 0.011
            pad |= hf & (np.linalg.norm(c - under, axis=1) < size * 1.15) & (fn @ nrm < -0.3)
        # The palm's pad: on the palm (the side away from the nails), in its middle.
        back = unit(np.mean([b[1] for b in backs], axis=0))
        wrist, knuckle = J[f"hand_{s}"], J[f"hand_{s}.tail"]
        mid = wrist + (knuckle - wrist) * 0.62 - back * 0.012
        along = unit(knuckle - wrist)
        d = c - mid
        a = d @ along
        across = np.linalg.norm(d - np.outer(a, along) - np.outer(d @ back, back), axis=1)
        palm = hf & (fn @ back < -0.4) & ((a / 0.022) ** 2 + (across / 0.026) ** 2 < 1.0)
        mesh.fmat[pad | palm] = P["nose"]

        # (The palm pad's edge drawn onto its oval.)
        def oval(i, p, n, mid=mid, along=along, back=back):
            d = p - mid
            a = d @ along
            across = np.linalg.norm(d - np.outer(a, along) - np.outer(d @ back, back), axis=1)
            return 1 - np.sqrt((a / 0.022) ** 2 + (across / 0.026) ** 2)

        near_palm = np.linalg.norm(mesh.co - mid, axis=1) < 0.04
        snap_outline(mesh, oval, P["nose"], normals, allowed=near_palm & hand)

        # (And each fingertip pad's edge onto its round.)
        def tips(i, p, n, backs=backs):
            out = np.full(len(p), -1.0)
            for centre, nrm, size in backs:
                under = centre - nrm * 0.011
                out = np.maximum(out, (size * 1.15 - np.linalg.norm(p - under, axis=1)) / size)
            return out

        snap_outline(mesh, tips, P["nose"], normals, allowed=hand & ~near_palm)
    return out


def fangs(B, F):
    """The upper canines, their tips just showing below the lip near the front of the muzzle."""
    k = F.r / 0.0159
    m = B["muzzle"]
    out = []
    for s in (1, -1):
        root = F.to(s * 0.0175 * k, 0.128 * m * k, -0.054 * k)
        tip = F.to(s * 0.0165 * k, 0.126 * m * k, -0.0715 * k)
        mid = (root + tip) / 2 + np.array([s * 0.0006, -0.0012, 0.0]) * k
        pts = [root, mid, tip]
        pts = [np.asarray(spline(np.array(pts), 6)[i]) for i in range(6)]
        radii = list(np.linspace(0.0032 * k, 0.0, 6))
        out.append(horn(pts, radii, "Head", P["teeth"], 8, flat=0.85, up=(0, -1, 0)))
    return out


# ── Building it ──────────────────────────────────────────────────────────────────────────────────────


def saw(t):
    """A triangle wave, 0 at whole numbers and 1 halfway between."""
    return 1 - np.abs((t % 1.0) * 2 - 1)


def fur_volume(B, H, mesh, F):
    """The fur's thickness worked into the shape: a little everywhere, a thick ruff round the neck that
    ends in points over the chest and shoulders, and cheek fur flaring out and back in tufts below the
    ears."""
    J = H["J"]
    k = F.r / 0.0159
    ruff = B.get("ruff", 1.0)
    co = mesh.co
    n = mesh.normals()
    q = F.of(co) / k
    furry = np.zeros(len(co))
    for f, m in zip(mesh.faces, mesh.fmat):
        if m in (P["fur"], P["fur2"]):
            furry[f] = 1.0
    bare = np.zeros(len(co))
    for f, m in zip(mesh.faces, mesh.fmat):
        if m not in (P["fur"], P["fur2"]):
            bare[f] = 1.0
    furry *= 1 - bare
    d = np.full(len(co), 0.003)
    # The face: short fur round the eyes and on the muzzle.
    face = mesh.W[:, BI["Head"]] * smoothstep(-0.02, 0.03, q[:, 1]) * smoothstep(0.05, 0.0, q[:, 2])
    d -= 0.002 * face
    d *= 1 - mesh.tags.get("ear", 0) * 0.7
    # The neck's ruff.
    neck, head = J["neck_01"], J["Head"]
    rel = co - neck
    theta = np.arctan2(rel[:, 0], -(rel[:, 1] + 0.0))  # 0 straight ahead
    front = np.cos(theta) * 0.5 + 0.5
    lower = neck[2] - (0.03 + B.get("ruff_low", 0.085) * front ** 1.5) - 0.028 * saw(theta * 11 / (2 * np.pi) + 0.25) * (0.5 + 0.5 * front)
    upper = head[2] + 0.02
    around = np.linalg.norm(rel[:, :2], axis=1)
    band = smoothstep(lower - 0.004, lower + 0.035, co[:, 2]) * smoothstep(upper + 0.03, upper - 0.02, co[:, 2]) * smoothstep(0.17, 0.11, around)
    band *= 1 - mesh.W[:, [BI[f"{b}_{s}"] for b in ("upperarm", "lowerarm", "hand") for s in "lr"]].sum(1)
    thick = (0.012 + 0.016 * front) * ruff
    clumps = 1 + 0.35 * saw(theta * 11 / (2 * np.pi)) * smoothstep(neck[2] + 0.06, neck[2] - 0.02, co[:, 2])
    ruff_d = thick * band * clumps
    # The cheeks: fur flaring out and back below the ears, in tufts.
    ax = np.abs(q[:, 0])
    cheek = smoothstep(0.028, 0.05, ax) * smoothstep(0.03, -0.01, q[:, 1]) * smoothstep(-0.1, -0.075, q[:, 1]) * smoothstep(-0.125, -0.085, q[:, 2]) * smoothstep(0.0, -0.035, q[:, 2])
    tufts = saw((q[:, 2] - 0.4 * q[:, 1]) / 0.02 + 0.3) ** 2
    cheek_d = (0.003 + 0.011 * tufts) * cheek * B.get("cheeks_k", 1.0) * mesh.W[:, BI["Head"]]
    d = d + ruff_d + cheek_d
    d *= furry
    # Lying down: the ruff and cheek fur point down and back as well as out.
    out = n * d[:, None]
    lie = np.c_[np.zeros(len(co)), np.full(len(co), 0.35), np.full(len(co), -0.55)]
    out += lie * (ruff_d * 0.6)[:, None]
    side = np.c_[np.sign(co[:, 0]) * 0.3, np.full(len(co), 0.5), np.full(len(co), -0.15)]
    out += side * (cheek_d * 0.7)[:, None]
    mesh.co = co + out * furry[:, None]
    mesh.tags["fur_d"] = d
    # `ruff_flat`: the ruff's volume laid flat (to 3 mm of fur), for the game to set under a collar.
    flat = n * (ruff_d * furry)[:, None] + lie * (ruff_d * 0.6 * furry)[:, None]
    mesh.keys["ruff_flat"] = -flat


# ── Colours: where the pale fur grows, the fur's lie, the painted texture ───────────────────────────


def pale_field(B, H, F, p, n, tail_on):
    """Where the second (pale) fur grows, > 0 inside: under the muzzle, the cheeks and throat, a mark over
    each eye, down the chest and belly, and the tail's tip (inside the ears is marked as they're grown)."""
    k = F.r / 0.0159
    q = F.of(p) / k
    m = B["muzzle"]
    J = H["J"]
    z = p[:, 2]
    head = np.interp(q[:, 1], [-0.1, -0.06, -0.02, 0.01, 0.05, 0.1 * m, 0.16 * m], [-0.08, -0.045, -0.021, -0.024, -0.031, -0.038, -0.043])
    head += 0.0045 * saw(q[:, 1] / 0.014) * smoothstep(0.02, -0.03, q[:, 1])
    out = np.clip((head - q[:, 2]) * 30, -1, 1)
    on_head = (q[:, 1] > -0.13) & (np.abs(q[:, 0]) < 0.13) & (z > J["neck_01"][2] - 0.03)
    out = np.where(on_head, out, -1.0)
    # The front of the neck, the chest and the belly: a band narrowing down the body, its edge in points.
    width = np.interp(z, [J["pelvis"][2] - 0.1, J["spine_01"][2], J["spine_02"][2], J["spine_03"][2], J["neck_01"][2], J["Head"][2]], [0.0, 0.04, 0.05, 0.07, 0.085, 0.11])
    width += 0.014 * saw(z / 0.04) * (z > J["spine_02"][2])
    front = np.clip((width - np.abs(p[:, 0])) * 20, -1, 1)
    front = np.where((n[:, 1] < -0.1) & (z < J["Head"][2] + 0.02) & (np.abs(p[:, 0]) < 0.16), front, -1.0)
    out = np.maximum(out, front)
    for s in (1, -1):
        brow = 1 - np.linalg.norm((q - np.array([0.029 * s, 0.014, 0.027])) / np.array([0.011, 0.012, 0.0055]), axis=1)
        out = np.maximum(out, brow)
    curve, sl = H["tail_curve"]
    near = np.argmin(np.linalg.norm(p[:, None] - curve[None, ::4], axis=2), axis=1) * 4
    s = sl[near]
    ang = np.arctan2(p[:, 0] - curve[near, 0], p[:, 1] - curve[near, 1])
    tail = np.where(tail_on, np.clip((s - 0.84 - 0.025 * saw(ang * 2.5)) * 20, -1, 1), -1.0)
    return np.maximum(out, tail)


def nose_field(B, F, p):
    """The nose's bare leather, > 0 inside: the pad over the muzzle's tip and the groove down to the lip."""
    k = F.r / 0.0159
    m = B["muzzle"]
    q = F.of(p) / k
    pad = 1 - np.linalg.norm((q - np.array([0.0, 0.16 * m, -0.022])) / np.array([0.021, 0.026, 0.0155]), axis=1)
    return pad


def snap_outline(mesh, field, inside, normals, allowed=None):
    """Moves each vertex on the border between faces of material `inside` and the rest along the surface
    onto the zero of `field(vertex indices, points, normals)`, never more than a third of its shortest
    edge, so the border follows the field's smooth outline rather than the faces' steps."""
    touch = np.zeros((len(mesh.co), 2))
    for f, m in zip(mesh.faces, mesh.fmat):
        touch[f, 0 if m == inside else 1] = 1
    border = (touch[:, 0] > 0) & (touch[:, 1] > 0)
    if allowed is not None:
        border &= allowed
    edge = np.nonzero(border)[0]
    if not len(edge):
        return
    E = mesh.edges()
    el = np.linalg.norm(mesh.co[E[:, 0]] - mesh.co[E[:, 1]], axis=1)
    shortest = np.full(len(mesh.co), np.inf)
    np.minimum.at(shortest, E[:, 0], el)
    np.minimum.at(shortest, E[:, 1], el)
    p0 = mesh.co[edge]
    p = p0.copy()
    nv = normals[edge]
    eps = 2e-4
    for _ in range(4):
        f0 = field(edge, p, nv)
        g = np.zeros_like(p)
        for i in range(3):
            dp = np.zeros(3)
            dp[i] = eps
            g[:, i] = (field(edge, p + dp, nv) - field(edge, p - dp, nv)) / (2 * eps)
        g -= nv * (g * nv).sum(1, keepdims=True)
        p = p - (f0 / np.maximum((g * g).sum(1), 1e-9))[:, None] * g
        moved = p - p0
        ln = np.linalg.norm(moved, axis=1)
        p = p0 + moved * np.minimum(1, (shortest[edge] / 3) / np.maximum(ln, 1e-12))[:, None]
    mesh.co[edge] = p


def tidy_islands(mesh, mats, smallest=14):
    """Patches of one of `mats` smaller than `smallest` faces take the material round them."""
    by_v = {}
    for i, f in enumerate(mesh.faces):
        for v in f:
            by_v.setdefault(v, []).append(i)
    seen = np.zeros(len(mesh.faces), dtype=bool)
    for start in range(len(mesh.faces)):
        m = mesh.fmat[start]
        if seen[start] or m not in mats:
            continue
        comp, todo = [], [start]
        seen[start] = True
        while todo:
            i = todo.pop()
            comp.append(i)
            for v in mesh.faces[i]:
                for j in by_v[v]:
                    if not seen[j] and mesh.fmat[j] == m:
                        seen[j] = True
                        todo.append(j)
        if len(comp) < smallest:
            around = [mesh.fmat[j] for i in comp for v in mesh.faces[i] for j in by_v[v] if mesh.fmat[j] != m and mesh.fmat[j] in mats]
            if around:
                mesh.fmat[comp] = max(set(around), key=around.count)


def colour_regions(B, H, F, mesh):
    """The nose's leather and the pale fur as faces of their own, their borders drawn smooth."""
    c = mesh.centres()
    nrm = mesh.normals()
    fn = unit(np.array([nrm[f].mean(0) for f in mesh.faces]))
    head = np.array([mesh.W[f, BI["Head"]].min() > 0.5 for f in mesh.faces])
    # The lips: only a thin black line along the mouth (the human's lips are fuller than a wolf's).
    k = F.r / 0.0159
    m = B["muzzle"]
    qc = F.of(c) / k
    line = np.interp(qc[:, 1], [0.0, 0.05 * m, 0.12 * m, 0.15 * m], [-0.06, -0.0615, -0.0635, -0.064])
    inside = np.array([mesh.tags["mouth"][f].min() > 0.5 for f in mesh.faces])
    lip = (mesh.fmat == P["nose"]) & head & ~inside & (qc[:, 2] < -0.04)
    mesh.fmat[lip & (np.abs(qc[:, 2] - line) > B.get("lip_line", 0.0026))] = P["fur2"]
    furry = mesh.fmat == P["fur"]
    mesh.fmat[(nose_field(B, F, c) > 0) & furry & head] = P["nose"]
    snap_outline(mesh, lambda i, p, n: nose_field(B, F, p), P["nose"], nrm)
    c = mesh.centres()
    ftail = np.array([mesh.tags["tail"][f].min() > 0.5 for f in mesh.faces])
    fin = np.array([mesh.tags["ear_in"][f].min() > 0.5 for f in mesh.faces])
    furry = mesh.fmat == P["fur"]
    mesh.fmat[((pale_field(B, H, F, c, fn, ftail) > 0) | fin) & furry] = P["fur2"]
    tidy_islands(mesh, (P["fur"], P["fur2"]))
    tail = mesh.tags["tail"] > 0.5
    # (The ears' insides keep the border they were grown with.)
    snap_outline(mesh, lambda i, p, n: pale_field(B, H, F, p, n, tail[i]), P["fur2"], nrm, allowed=mesh.tags["ear"] < 0.5)


def fur_flow(H, F, mesh):
    """Which way the fur lies at each vertex: down the body and legs, out along the arms, back from the
    nose over the head, up the ears to their tips, along the tail."""
    J = H["J"]
    n = len(mesh.co)
    flow = np.zeros((n, 3))
    down = np.array([0.0, 0.08, -1.0])
    for b, parent in aw.BONES:
        w = mesh.W[:, BI[b]]
        if not (w > 0).any():
            continue
        if b.startswith(("upperarm", "lowerarm", "hand", "thigh", "calf", "foot", "ball")):
            child = {"upperarm": "lowerarm", "lowerarm": "hand", "hand": "hand.tail", "thigh": "calf", "calf": "foot", "foot": "ball", "ball": "ball.tail"}[b[:-2]]
            s = b[-1]
            tail_j = J[f"{child}_{s}"] if not child.endswith(".tail") else J[f"{child[:-5]}_{s}.tail"]
            d = unit(tail_j - J[b])
        elif b in aw.TAIL:
            curve, sl = H["tail_curve"]
            d = None
        else:
            d = down
        if d is None:
            continue
        flow += w[:, None] * d
    curve, sl = H["tail_curve"]
    tw = mesh.W[:, [BI[t] for t in aw.TAIL]].sum(1)
    if (tw > 0).any():
        idx = np.nonzero(tw > 0)[0]
        near = np.argmin(np.linalg.norm(mesh.co[idx][:, None] - curve[None, ::2], axis=2), axis=1) * 2
        d = unit(curve[np.minimum(near + 2, len(curve) - 1)] - curve[np.maximum(near - 2, 0)])
        flow[idx] += tw[idx, None] * d
    # The head: back from the nose tip, and on the cheeks back and down.
    k = F.r / 0.0159
    hw = mesh.W[:, BI["Head"]]
    tip = F.to(0, 0.17 * k, -0.03 * k)
    radial = unit(mesh.co - tip) + np.array([0.0, 0.0, -0.35])
    flow = flow * (1 - hw[:, None]) + hw[:, None] * unit(radial)
    for side, (base, axis, fr, lat, hh) in H["ears"].items():
        on = mesh.tags["ear"] > 0.5
        flow[on & (np.sign(mesh.co[:, 0]) == side)] = axis
    nrm = mesh.normals()
    flow -= nrm * (flow * nrm).sum(1, keepdims=True)
    return unit(flow + nrm * 1e-6)


def paint(B, H, F, maps, eyes):
    """The shared texture (shading only: each part's colour multiplies it) and a height map for the
    normal map: fur strokes that follow the fur's lie, a darker saddle over the back and the top of the
    head and muzzle, black rims round the eyes, the nose's leathery grain, amber irises."""
    pos, nrm, mat, ao, flow = maps["pos"], maps["nrm"], maps["mat"], maps["ao"], maps["flow"]
    S = pos.shape[0]
    out = np.ones((S, S), dtype=np.float64)
    height = np.full((S, S), 0.5)
    on = mat >= 0
    p, n, m, a = pos[on], nrm[on], mat[on], np.clip(ao[on], 0, 1)
    fl = unit(flow[on])
    v = np.ones(len(p))
    hgt = np.full(len(p), 0.5)
    k = F.r / 0.0159
    q = F.of(p) / k
    furry = (m == P["fur"]) | (m == P["fur2"])
    if furry.any():
        pf, ff = p[furry], fl[furry]
        fine = aw.streaks(pf, ff, 900.0, 0.004, 7, seed=1)
        mid = aw.streaks(pf, ff, 320.0, 0.009, 7, seed=3)
        clump = aw.streaks(pf, ff, 110.0, 0.02, 7, seed=7)
        tone = 0.82 + 0.2 * (fine - 0.5) + 0.16 * (mid - 0.5) + 0.16 * (clump - 0.5)
        nf = n[furry]
        qf = q[furry]
        dark = m[furry] == P["fur"]
        # A grey wolf's saddle: darker over the shoulders and back, the top of the head and muzzle, and
        # down the top of the tail; lighter low on the sides and down the legs.
        J = H["J"]
        back = np.clip(nf @ unit(np.array([0, 0.85, 0.5])), 0, 1)
        trunk = smoothstep(J["pelvis"][2] - 0.1, J["pelvis"][2] + 0.05, pf[:, 2]) * smoothstep(J["Head"][2] + 0.02, J["neck_01"][2] - 0.05, pf[:, 2])
        saddle = back**1.2 * trunk
        top = np.clip(nf[:, 2], 0, 1) * smoothstep(J["neck_01"][2], J["Head"][2], pf[:, 2])
        muzzle_top = top * smoothstep(-0.03, 0.03, qf[:, 1])
        legs = smoothstep(J["pelvis"][2] - 0.25, 0.25, pf[:, 2]) * (pf[:, 2] < J["pelvis"][2] - 0.25)
        shade = 1 - 0.5 * saddle - 0.32 * top - 0.12 * muzzle_top + 0.1 * legs
        # A darker mask round the eyes, and the cheek just below the pale line.
        for eye in eyes:
            de = np.linalg.norm(pf - eye[0], axis=1) - eye[1]
            shade *= 1 - 0.25 * smoothstep(0.02 * k, 0.004 * k, de)
        # The tail: darker along its top (its back as it hangs), as a wolf's is.
        curve, sl = H["tail_curve"]
        behind = np.nonzero(pf[:, 1] > J["pelvis"][1] + 0.08)[0]
        if len(behind):
            sub = curve[::4]
            dist = np.linalg.norm(pf[behind][:, None] - sub[None], axis=2)
            near = dist.argmin(1)
            by_tail = (dist.min(1) < 0.09) & (sl[::4][near] > 0.06)
            st = sl[::4][near]
            top_t = np.clip(nf[behind] @ unit(np.array([0, 1.0, 0.25])), 0, 1)
            shade[behind] *= np.where(by_tail, 1 - 0.4 * top_t * smoothstep(0.85, 0.6, st), 1.0)
        tone *= np.where(dark, shade, 1.0)
        tone *= np.where(dark, 1.0, 1.04)
        v[furry] = tone
        hgt[furry] = 0.5 + 0.28 * (fine - 0.5) + 0.3 * (mid - 0.5) + 0.35 * (clump - 0.5)
    # Black rims round the eyes (any colour of fur): the lids' edges.
    for eye in eyes:
        de = np.linalg.norm(p - eye[0], axis=1) - eye[1]
        rim = smoothstep(0.0055 * k, 0.0025 * k, de) * (m != P["eyes"])
        v *= 1 - 0.9 * rim
    # The eyes: a round pupil, an amber iris with fibres and a darker ring, little white showing.
    sel = m == P["eyes"]
    if sel.any():
        pe = p[sel]
        val = np.zeros(len(pe))
        for c, r, look in eyes:
            mine = np.linalg.norm(pe - c, axis=1) < r * 1.3
            d = unit(pe[mine] - c)
            th = np.degrees(np.arccos(np.clip(d @ look, -1, 1)))
            x = unit(np.cross(look, [0, 0, 1.0]))
            y = np.cross(look, x)
            ang = np.arctan2(d @ y, d @ x)
            fib = aw.noise01(np.stack([np.cos(ang) * 6, np.sin(ang) * 6, th * 0.06], axis=1), 1.0, 5)
            fib2 = aw.noise01(np.stack([np.cos(ang) * 15, np.sin(ang) * 15, th * 0.2], axis=1), 1.0, 9)
            iris = 0.72 + 0.22 * (fib - 0.5) + 0.14 * (fib2 - 0.5) + 0.22 * smoothstep(22, 15, th) - 0.35 * smoothstep(26, 33, th)
            val[mine] = np.where(th < 12.5, 0.02, np.where(th < 33, iris, 0.12 + 0.2 * smoothstep(36, 60, th)))
            val[mine] = np.where((th > 12.5) & (th < 14.5), 0.25, val[mine])
        v[sel] = val
    sel = m == P["nose"]
    if sel.any():
        cells = aw.noise01(p[sel], 1100.0, 11)
        v[sel] = 0.7 + 0.3 * smoothstep(0.2, 0.8, cells)
        hgt[sel] = 0.5 + 0.35 * (cells - 0.5)
    # The nose: comma-shaped nostrils, a groove down its front and on down to the lip (the philtrum).
    mz = B["muzzle"]
    nq = q
    tipf = 0.169 * mz
    for sx in (1, -1):
        dq = (nq - np.array([sx * 0.0088, tipf - 0.003, -0.0255])) / np.array([0.0048, 0.006, 0.0028])
        curl = dq[:, 0] * sx * 0.35
        nostril = smoothstep(1.0, 0.6, np.sqrt(dq[:, 0] ** 2 + (dq[:, 2] - curl) ** 2 + (dq[:, 1] * 0.5) ** 2))
        v *= 1 - 0.85 * nostril * (np.abs(nq[:, 0]) < 0.03)
    groove = smoothstep(0.0011, 0.0004, np.abs(nq[:, 0])) * smoothstep(0.13 * mz, 0.145 * mz, nq[:, 1]) * smoothstep(-0.056, -0.05, nq[:, 2]) * smoothstep(-0.012, -0.02, nq[:, 2])
    v *= 1 - 0.75 * groove
    for part, base, var in ((P["claws"], 0.9, 0.12), (P["teeth"], 0.97, 0.03)):
        sel = m == part
        if sel.any():
            v[sel] = base + var * (aw.noise01(p[sel], 400.0, part) - 0.5)
    sel = m == P["claws"]
    if sel.any():
        hgt[sel] = 0.5
    occl = np.where(m == P["eyes"], 0.8 + 0.2 * a, 0.35 + 0.65 * a**0.8)
    out[on] = np.clip(v * occl, 0, 1)
    height[on] = hgt
    return out, height


def lash_image():
    """The eyelashes' texture: dark strands, roots at the bottom of each half (upper lashes on top)."""
    N = 256
    rng = np.random.default_rng(5)
    alpha = np.zeros((N, N))
    for half, count, reach in ((1, 260, 0.9), (0, 70, 0.5)):
        for _ in range(count):
            u = rng.uniform(0, 1)
            length = reach * rng.uniform(0.6, 1.0)
            bend = rng.normal(0, 0.02)
            for t in np.linspace(0, 1, 40):
                x = int((u + bend * t * t) * (N - 1))
                y = int((half * 0.5 + 0.02 + t * length * 0.46) * (N - 1))
                if 0 <= x < N and 0 <= y < N:
                    alpha[y, max(0, x - 1) : x + 1] = np.maximum(alpha[y, max(0, x - 1) : x + 1], 0.9 * (1 - 0.6 * t))
    fade = np.clip(np.linspace(0, 1, N) / 0.08, 0, 1) * np.clip((1 - np.linspace(0, 1, N)) / 0.15, 0, 1)
    alpha *= fade[None, :]
    rgb = np.full((N, N, 3), 0.3)
    return aw.image_from("lashes", rgb, alpha)


# ── Tufts: small cards of fur, cut out by their texture, where the fur stands out of the outline ─────

TUFT_CELLS = 4  # tuft shapes across the tufts' texture (one row)


def tuft_image(size=512):
    """The tufts' texture: TUFT_CELLS clumps of fur side by side, each of many fine strands from a root
    along the bottom gathering towards a point (some forked), near white with darker roots and strands
    of varying shade; alpha cuts them out strand by strand."""
    N = size
    Wc = N // TUFT_CELLS
    val = np.zeros((N, N))
    alpha = np.zeros((N, N))
    rng = np.random.default_rng(11)
    for cell in range(TUFT_CELLS):
        x0 = cell * Wc
        forks = [0.0] if cell % 2 == 0 else [-0.22, 0.24]
        for tip_x in forks:
            for _ in range(int(150 / len(forks) ** 0.5)):
                root = rng.uniform(-0.8, 0.8) / len(forks) ** 0.3 + tip_x * 0.4
                reach = rng.uniform(0.55, 0.97)
                bend = rng.normal(0, 0.06)
                shade = rng.uniform(0.75, 1.0)
                for t in np.linspace(0, 1, 70):
                    xx = root + (tip_x - root) * t**0.8 * reach + bend * np.sin(np.pi * t)
                    yy = t * reach
                    px = x0 + (0.5 + 0.5 * xx) * (Wc - 1)
                    py = (1 - yy) * (N - 1)  # (row 0 the top: the tip end)
                    r = 1.0 * (1 - 0.6 * t)
                    i0, i1 = int(max(0, py - r)), int(min(N, py + r + 1))
                    j0, j1 = int(max(x0, px - r)), int(min(x0 + Wc, px + r + 1))
                    a = 0.7 * (1 - 0.6 * t)
                    alpha[i0:i1, j0:j1] = np.maximum(alpha[i0:i1, j0:j1], a)
                    val[i0:i1, j0:j1] = np.maximum(val[i0:i1, j0:j1], shade * (0.62 + 0.3 * min(1, t / 0.3)))
    rgb = np.repeat(np.where(alpha > 0, val, 0.8)[..., None], 3, axis=2)
    return aw.image_from("tufts", rgb[::-1].copy(), alpha[::-1].copy())


def farthest(points, count, start=0):
    """`count` of the points spread out (each the farthest from those already taken): their indices."""
    if len(points) <= count:
        return np.arange(len(points))
    chosen = [start]
    d = np.linalg.norm(points - points[start], axis=1)
    for _ in range(count - 1):
        i = int(np.argmax(d))
        chosen.append(i)
        d = np.minimum(d, np.linalg.norm(points - points[i], axis=1))
    return np.array(chosen)


def tuft_card(root, normal, direction, length, width, cell, mesh, vi, mat, lift=0.35, segments=3, flat=None):
    """One card: rooted a little under the skin at `root`, reaching along `direction` (lifted off the
    surface by `lift`), curving back towards it at the tip; its weights and shape key offsets those of
    the body vertex `vi` it grows from."""
    n = unit(normal)
    d = unit(direction - n * (direction @ n))
    side = unit(np.cross(n, d))
    out = unit(d + n * lift)
    pts, uvs = [], []
    for i in range(segments + 1):
        t = i / segments
        c = root - n * 0.003 + out * length * t - n * length * 0.18 * t * t
        w = width * 0.5
        for s in (-1, 1):
            pts.append(c + side * w * s)
            uvs.append(((cell + (0.5 + 0.5 * s)) / TUFT_CELLS, t))
    faces, fuv = [], []
    for i in range(segments):
        a = 2 * i
        f = [a, a + 2, a + 3, a + 1]  # (wound to face out, as the skin under it does)
        faces.append(f)
        fuv.append([uvs[j] for j in f])
    pts = np.array(pts)
    W = np.repeat(mesh.W[vi][None], len(pts), 0)
    keys = {k: np.repeat(v[vi][None], len(pts), 0) for k, v in mesh.keys.items()}
    if flat:
        # (This key draws the card down into the skin it grows from: it lies flat with the fur.)
        keys[flat] = keys[flat] + (root - n * 0.004) - pts
    part = aw.Mesh(pts, faces, np.full(len(faces), mat), keys, W)
    part.uv = fuv
    part.normal = n
    return part


def tufts(B, H, F, mesh):
    """The tufts: fanning out of the cheeks, round the bottom of the neck's ruff and down the chest, up
    out of the ears, off the elbows and from the tail's tip, each the colour of the fur it grows from."""
    k = F.r / 0.0159
    J = H["J"]
    n = mesh.normals()
    q = F.of(mesh.co) / k
    pale = np.zeros(len(mesh.co))
    for f, m in zip(mesh.faces, mesh.fmat):
        if m == P["fur2"]:
            pale[f] += 1
        elif m == P["fur"]:
            pale[f] -= 1
    colour = lambda i: P["fur2_tufts"] if pale[i] > 0 else P["fur_tufts"]  # noqa: E731
    out = []
    rng = np.random.default_rng(3 if not B["female"] else 4)
    head = mesh.W[:, BI["Head"]] > 0.9
    # The cheeks: a fan of tufts below and behind each eye, reaching out and back.
    for s in (1, -1):
        sel = np.nonzero(head & (q[:, 0] * s > 0.045) & (q[:, 1] < -0.012) & (q[:, 1] > -0.085) & (q[:, 2] < -0.035) & (q[:, 2] > -0.115) & (n[:, 0] * s > 0.4))[0]
        for j in farthest(mesh.co[sel], B.get("cheek_tufts", 16)):
            i = sel[j]
            d = np.array([s * 0.5, 0.75, -0.45 - 1.5 * (q[i, 2] + 0.07)])
            out.append(tuft_card(mesh.co[i], n[i], d, rng.uniform(0.026, 0.04) * k, rng.uniform(0.018, 0.024) * k, int(rng.integers(TUFT_CELLS)), mesh, i, P["fur2_tufts"], lift=0.4))
    # The ruff: round the neck just above where it ends, pointing down over the chest and shoulders.
    neck = J["neck_01"]
    rel = mesh.co - neck
    around = np.linalg.norm(rel[:, :2], axis=1)
    arms = mesh.W[:, [BI[f"{b}_{s}"] for b in ("upperarm", "lowerarm", "hand") for s in "lr"]].sum(1)
    theta = np.arctan2(rel[:, 0], -rel[:, 1])
    lower = neck[2] - 0.03 - 0.07 * (0.5 + 0.5 * np.cos(theta)) ** 1.5
    band = (np.abs(mesh.co[:, 2] - (lower + 0.035)) < 0.02) & (around < 0.16) & (arms < 0.05) & ~head
    sel = np.nonzero(band)[0]
    for j in farthest(mesh.co[sel], B.get("ruff_tufts", 36)):
        i = sel[j]
        out.append(tuft_card(mesh.co[i], n[i], np.array([0.0, 0.1, -1.0]), rng.uniform(0.042, 0.058) * B.get("ruff", 1.0), rng.uniform(0.024, 0.032), int(rng.integers(TUFT_CELLS)), mesh, i, colour(i), lift=0.28, flat="ruff_flat"))
    # Down the chest.
    sel = np.nonzero((np.abs(mesh.co[:, 0]) < 0.05) & (n[:, 1] < -0.6) & (mesh.co[:, 2] < J["spine_03"][2] + 0.04) & (mesh.co[:, 2] > J["spine_02"][2] + 0.02) & (arms < 0.05))[0]
    if B["female"]:
        sel = sel[:0]
    for j in farthest(mesh.co[sel], 4):
        i = sel[j]
        out.append(tuft_card(mesh.co[i], n[i], np.array([0.0, 0.0, -1.0]), rng.uniform(0.04, 0.055), rng.uniform(0.028, 0.036), int(rng.integers(TUFT_CELLS)), mesh, i, colour(i), lift=0.2))
    # Out of each ear's hollow.
    for side, (base, axis, fr, lat, hh) in H["ears"].items():
        sel = np.nonzero(mesh.tags["ear_in"] > 0.5)[0]
        sel = sel[(np.sign(mesh.co[sel, 0]) == side) & ((mesh.co[sel] - base) @ axis < hh * 0.4)]
        for j in farthest(mesh.co[sel], 3):
            i = sel[j]
            d = axis * 0.8 + fr * 0.5 + lat * rng.uniform(-0.3, 0.3)
            out.append(tuft_card(mesh.co[i], n[i], d, rng.uniform(0.03, 0.042) * k, 0.02 * k, int(rng.integers(TUFT_CELLS)), mesh, i, P["fur2_tufts"], lift=0.5))
    # Off the back of each elbow.
    for s in ("l", "r"):
        e = J[f"lowerarm_{s}"]
        sel = np.nonzero((np.linalg.norm(mesh.co - e, axis=1) < 0.045) & (n[:, 1] > 0.5))[0]
        for j in farthest(mesh.co[sel], 2):
            i = sel[j]
            d = unit(J[f"hand_{s}"] - e) * 0.5 + np.array([0, 0.6, -0.2])
            out.append(tuft_card(mesh.co[i], n[i], d, 0.04, 0.026, int(rng.integers(TUFT_CELLS)), mesh, i, colour(i), lift=0.45))
    # From the tail's tip, along it.
    curve, sl = H["tail_curve"]
    tipdir = unit(curve[-1] - curve[-8])
    sel = np.nonzero((mesh.tags["tail"] > 0.5) & (np.linalg.norm(mesh.co - curve[-1], axis=1) < 0.09) & (np.linalg.norm(mesh.co - curve[-1], axis=1) > 0.03))[0]
    for j in farthest(mesh.co[sel], 6):
        i = sel[j]
        out.append(tuft_card(mesh.co[i], n[i], tipdir, rng.uniform(0.06, 0.08), rng.uniform(0.035, 0.045), int(rng.integers(TUFT_CELLS)), mesh, i, colour(i), lift=0.25))
    return out


def build_mesh(B):
    H = aw.human(B["human"])
    co, quads = H["co"], H["quads"]
    fmat = np.where(H["lips"], P["nose"], np.where(H["nails"], P["claws"], P["fur"]))
    fmat[H["mouth"]] = P["nose"]
    mouth_v = np.zeros(len(co), dtype=np.int64)
    mouth_v[np.unique(quads[H["mouth"]])] = 1
    H["mouth_v"] = mouth_v
    mesh = aw.Mesh(co.copy(), quads.tolist(), fmat, {k: v.copy() for k, v in H["keys"].items()}, H["W"].copy())
    paws(B, H, mesh)
    co = mesh.co.copy()
    move, eye_map, F = warp_head(B, H, mesh)
    pin = np.zeros(len(mesh.co))
    lips = np.unique(np.concatenate([mesh.faces[i] for i in np.nonzero(H["lips"])[0]]))
    pin[lips] = 1.0
    q = F.of(co)
    ear_zone = ((np.abs(q[:, 0]) > 0.058) & (q[:, 1] < 0.0) & (q[:, 1] > -0.09) & (np.abs(q[:, 2]) < 0.05) & (mesh.W[:, BI["Head"]] > 0.5)).astype(np.float64)
    ear_zone = np.clip(aw.neighbour_mean(len(co), mesh.edges(), ear_zone) * 2, 0, 1)
    sculpt_head(B, H, mesh, F, pin, ear_zone)
    digitigrade(B, H, [mesh])
    extras = eyes_and_lashes(B, H, move, eye_map) + fangs(B, F)
    # (The body before the head's subdivision: what the underwear is cut from, as the human avatar's is.)
    arms = mesh.W[:, [BI[f"{b}_{s}"] for b in ("upperarm", "lowerarm", "hand") for s in "lr"]].sum(1)
    quads0 = np.array(mesh.faces)
    H["base0"] = (mesh.co.copy(), quads0, wa.vertex_normals(mesh.co, quads0), arms)
    open_eyes(B, H, eye_map, [mesh] + extras[2:6])
    mesh.tags["mouth"] = H["mouth_v"].astype(np.float64)
    mesh = subdivide_head(mesh, F)
    nostrils(B, F, mesh)
    for s in (1, -1):
        ear(B, H, mesh, F, s)
    tail(B, H, mesh)
    extras += toes(B, H, mesh)
    extras += hand_claws_and_pads(B, H, mesh)
    fur_volume(B, H, mesh, F)
    H["F"] = F
    return H, mesh, extras


def open_eyes(B, H, eye_map, meshes):
    """The lids drawn a little further open (round the eyeball, upper lid up and lower lid down), so the
    eyes read as bright and alert rather than sleepy; the lashes go with them."""
    e = H["body"].eye["l"]
    c0 = e["centre"]
    for s in (1, -1):
        f = eye_map if s == 1 else (lambda p: eye_map(np.asarray(p) * MIRROR) * MIRROR)
        hc = c0 * (MIRROR if s == -1 else 1)
        c = f(hc[None])[0]
        r = np.linalg.norm(f((hc + np.array([e["radius"], 0, 0]))[None])[0] - c)
        look = unit(f((hc + np.array([0, -0.01, 0]))[None])[0] - c)
        up = unit(f((hc + np.array([0, 0, 0.01]))[None])[0] - c)
        up = unit(up - look * (up @ look))
        for mesh in meshes:
            d = mesh.co - c
            dist = np.linalg.norm(d, axis=1)
            near = (dist < 2.2 * r) & (d @ look > -0.2 * r)
            if not near.any():
                continue
            vu = d[near] @ up
            fall = smoothstep(2.2 * r, 1.15 * r, dist[near]) * np.where(vu > 0, B.get("eyes_open", 0.34), 0.1)
            moved = d[near] + np.outer(vu * fall, up)
            ln = np.linalg.norm(moved, axis=1)
            moved *= (np.maximum(ln, 1.04 * r) / np.maximum(ln, 1e-9))[:, None]
            mesh.co[near] = c + moved


def nostrils(B, F, mesh):
    """The nostrils pressed into the front of the nose, curling out and back."""
    k = F.r / 0.0159
    m = B["muzzle"]
    q = F.of(mesh.co) / k
    n = mesh.normals()
    for sx in (1, -1):
        dq = (q - np.array([sx * 0.0088, 0.166 * m, -0.0255])) / np.array([0.0045, 0.008, 0.0027])
        curl = dq[:, 0] * sx * 0.35
        r = np.sqrt(dq[:, 0] ** 2 + (dq[:, 2] - curl) ** 2 + (dq[:, 1] * 0.5) ** 2)
        depth = 0.0028 * k * smoothstep(1.0, 0.3, r) * (mesh.W[:, BI["Head"]] > 0.5)
        mesh.co -= n * depth[:, None]


def subdivide_head(mesh, F):
    """The head subdivided once (Catmull-Clark), as the human avatar's is, but for the inside of the
    mouth (closed) and the back of the skull (round and plain)."""
    quads = np.array(mesh.faces)
    q = F.of(mesh.co) / (F.r / 0.0159)
    region = (mesh.W[:, BI["Head"]] + 0.5 * mesh.W[:, BI["neck_01"]] > 0.5)[quads].all(1)
    region &= ~(mesh.tags["mouth"] > 0.5)[quads].all(1)
    region &= ~((q[:, 1] < -0.085) & (q[:, 2] > -0.06))[quads].all(1)

    apply, faces, corners = wa.subdivide_region(mesh.co, np.array(mesh.faces), region)
    W = apply(mesh.W)
    out = aw.Mesh(apply(mesh.co), faces, mesh.fmat[[f for f, _ in corners]], {k: apply(v) for k, v in mesh.keys.items()}, W / W.sum(1, keepdims=True), {k: apply(v) for k, v in mesh.tags.items()})
    aw.log(f"head subdivided: {len(out.co)} vertices")
    return out


def surface_point(mesh, origin, direction):
    tris = [(f[0], f[i], f[i + 1]) for f in mesh.faces for i in range(1, len(f) - 1)]
    bvh = BVHTree.FromPolygons(mesh.co.tolist(), tris)
    loc, nrm, *_ = bvh.ray_cast(Vector(tuple(origin)), Vector(tuple(unit(direction))), 1.0)
    return np.array(loc), np.array(nrm)


EAR = {"height": 0.104, "width": 0.035, "thick": 0.012, "out": 18, "back": 9, "turn": 28, "at": (0.044, -0.05)}


def ear(B, H, mesh, F, side):
    """A tall pointed ear grown out of the skull: the skin cut away where it stands, then rings rising
    to a point, its front hollowed into a cup with thin rims."""
    k = F.r / 0.0159
    e = dict(EAR, **B.get("ear", {}))
    x, f = e["at"]
    base, nrm = surface_point(mesh, F.to(side * x * k, f * k, 0.2), (0, 0, -1))
    up = np.array([0.0, 0.0, 1.0])
    out = np.array([side * 1.0, 0.0, 0.0])
    fwd = np.array([0.0, -1.0, 0.0])
    a_out, a_back, a_turn = (math.radians(e[n]) for n in ("out", "back", "turn"))
    axis = unit(up * math.cos(a_out) + out * math.sin(a_out) - fwd * math.sin(a_back))
    front = unit(fwd * math.cos(a_turn) + out * math.sin(a_turn))
    front = unit(front - axis * (front @ axis))
    lat = np.cross(axis, front) * side
    hh, wd, th = e["height"] * k, e["width"] * k, e["thick"] * k
    # The cut: an ellipse across the ear's foot (its width across, its thickness front to back).
    tn = unit(nrm)
    e1 = unit(lat - tn * (lat @ tn))
    e2 = np.cross(tn, e1)
    loop = aw.cut_patch(mesh, base, tn, (wd * 1.0, th * 1.5), (e1, e2))
    keys_base = {kk: v[loop].mean(0) for kk, v in mesh.keys.items()}
    sink = -0.006 * k

    def ring(s, ang):
        t = s
        width = wd * (1 - t) ** 0.8 * (1 + 0.25 * math.sin(math.pi * min(1, t * 1.3)))
        thick = th * (1 - t) ** 0.9 + 0.0015 * k
        c, sn = np.cos(ang), np.sin(ang)
        # (Angles measured from the lateral axis towards the front.)
        pl = width * c
        pf = thick * sn
        cup = (0.95 * thick * 2) * smoothstep(0.05, 0.25, t) * smoothstep(1.0, 0.75, t)
        hollow = np.where(sn > 0, cup * (1 - np.abs(c) ** 2.5), 0.0)
        pf = pf - hollow
        centre = base + tn * sink + axis * (hh * t) + front * (0.006 * k * math.sin(math.pi * t))
        return centre + np.outer(pl, lat) + np.outer(pf, front)

    def weights(p):
        W = np.zeros((len(p), aw.NB))
        W[:, BI["Head"]] = 1.0
        return W

    def keys(p):
        out_k = {kk: np.repeat(v[None], len(p), 0) for kk, v in keys_base.items()}
        out_k["ears_tall"] = np.outer(np.clip((p - base) @ axis, 0, None) * 0.3, axis)
        return out_k

    if "ears_tall" not in mesh.keys:
        mesh.keys["ears_tall"] = np.zeros_like(mesh.co)
    frame = (lat, front, axis)
    rings = aw.grow(mesh, loop, frame, ring, 14, P["fur"], weights, keys)
    flag = np.zeros(len(mesh.co))
    flag[np.concatenate(rings)] = 1
    mesh.tags["ear"] = np.maximum(mesh.tags.get("ear", np.zeros(len(mesh.co))), flag)
    # The inside of the ear: the hollow's points, away from the rims, the foot and the tip.
    inner = np.zeros(len(mesh.co))
    for j, idx in enumerate(rings[:-1]):
        t = (j + 1) / len(rings[:-1])
        if 0.12 < t < 0.9:
            d = mesh.co[idx] - (base + tn * sink + axis * (hh * t))
            c_ = (d @ lat) / max(wd * (1 - t) ** 0.8, 1e-6)
            inner[idx] = ((d @ front) > -th * 0.6) & (np.abs(c_) < 0.8)
    mesh.tags["ear_in"] = np.maximum(mesh.tags.get("ear_in", np.zeros(len(mesh.co))), inner)
    H.setdefault("ears", {})[side] = (base, axis, front, lat, hh)


def tail(B, H, mesh):
    """A bushy tail grown out of the base of the back, hanging down and back, on its own bones."""
    J = H["J"]
    k = B.get("tail_k", 1.0)
    pel = J["pelvis"]
    origin = pel + np.array([0.0, 0.3, B.get("tail_at", 0.015)])
    root, nrm = surface_point(mesh, origin, (0, -1, 0.0))
    tn = unit(nrm)
    # The tail's line: out and back, then curving down, the last part lifting a little.
    pts = np.array([root, root + np.array([0, 0.06, -0.01]), root + np.array([0, 0.17, -0.09]), root + np.array([0, 0.24, -0.25]), root + np.array([0, 0.25, -0.45]), root + np.array([0, 0.22, -0.62]), root + np.array([0, 0.17, -0.72])])
    pts = (pts - root) * k + root
    curve = spline(pts, 200)
    seg = np.linalg.norm(np.diff(curve, axis=0), axis=1)
    sl = np.concatenate([[0], np.cumsum(seg)]) / seg.sum()
    e1 = np.array([1.0, 0.0, 0.0])
    e2 = unit(np.cross(tn, e1))
    loop = aw.cut_patch(mesh, root, tn, (0.034 * k, 0.034 * k), (e1, e2))
    r0 = np.linalg.norm(mesh.co[loop] - mesh.co[loop].mean(0), axis=1).mean()
    H["tail_r0"] = r0

    def at(s):
        i = np.searchsorted(sl, s)
        i = min(max(i, 1), len(curve) - 1)
        t = (s - sl[i - 1]) / max(sl[i] - sl[i - 1], 1e-9)
        p = curve[i - 1] + (curve[i] - curve[i - 1]) * t
        d = unit(curve[i] - curve[i - 1])
        return p, d

    def radius(s):
        bush = 0.075 * k * smoothstep(0.0, 0.45, s) * (1 - smoothstep(0.55, 1.0, s)) ** 0.7
        return r0 * (1 - smoothstep(0.0, 0.25, s)) * (1 - s) + bush + 0.012 * k * (1 - s)

    def ring(s, ang):
        p, d = at(s)
        a = unit(np.cross(d, np.array([1.0, 0.0, 0.0])))
        r = radius(s)
        # (Clumps of fur round the tail, twisting a little down its length.)
        clump = 1 + 0.07 * np.cos(ang * 7 + s * 9) * smoothstep(0.1, 0.3, s)
        return p + np.outer(r * clump * np.cos(ang), np.array([1.0, 0.0, 0.0])) + np.outer(r * clump * np.sin(ang), a)

    joints = [at(s)[0] for s in (0.0, 0.2, 0.42, 0.66)]
    H["tail_joints"] = joints + [at(1.0)[0]]
    marks = np.array([0.0, 0.2, 0.42, 0.66, 1.0])

    def weights(pnts):
        W = np.zeros((len(pnts), aw.NB))
        d = np.linalg.norm(pnts[:, None] - curve[None], axis=2)
        s = sl[np.argmin(d, axis=1)]
        for i, b in enumerate(aw.TAIL):
            c = (marks[i] + marks[i + 1]) / 2
            wdt = (marks[i + 1] - marks[i]) * 0.75
            W[:, BI[b]] = np.clip(1 - np.abs(s - c) / wdt, 0, 1)
        W[:, BI["pelvis"]] = smoothstep(0.06, 0.0, s)
        return W / np.maximum(W.sum(1, keepdims=True), 1e-9)

    keys_base = {kk: v[loop].mean(0) for kk, v in mesh.keys.items()}

    def keys(pnts):
        out_k = {kk: np.repeat(v[None], len(pnts), 0) for kk, v in keys_base.items()}
        d = np.linalg.norm(pnts[:, None] - curve[None], axis=2)
        near = curve[np.argmin(d, axis=1)]
        # (Fuller further out: none at the root, which the underwear's opening fits.)
        s_ = sl[np.argmin(d, axis=1)]
        out_k["tail"] = (pnts - near) * (0.3 * smoothstep(0.04, 0.2, s_))[:, None]
        return out_k

    if "tail" not in mesh.keys:
        mesh.keys["tail"] = np.zeros_like(mesh.co)
    ax = unit(curve[3] - curve[0])
    frame = (np.array([1.0, 0, 0]), unit(np.cross(ax, np.array([1.0, 0, 0]))), ax)
    rings = aw.grow(mesh, loop, frame, ring, 24, P["fur"], weights, keys)
    flag = np.zeros(len(mesh.co))
    flag[np.concatenate(rings)] = 1
    mesh.tags["tail"] = flag
    H["tail_curve"] = (curve, sl)


def spline(points, n):
    """A Catmull-Rom curve through the points, n samples."""
    p = np.asarray(points, dtype=np.float64)
    p = np.vstack([2 * p[0] - p[1], p, 2 * p[-1] - p[-2]])
    out = []
    segs = len(p) - 3
    for i in range(n):
        t = i / (n - 1) * segs
        j = min(int(t), segs - 1)
        u = t - j
        a, b, c, d = p[j], p[j + 1], p[j + 2], p[j + 3]
        out.append(0.5 * ((2 * b) + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u**3))
    return np.array(out)


MIRROR = np.array([-1.0, 1.0, 1.0])


def eyes_and_lashes(B, H, move, eye_map):
    """The eyeballs (the human's, carried whole with the eye) and the human's lash strips, warped with the
    lids. The lashes keep their texture coordinates (`H["lash_uv"]`, per face corner)."""
    body = H["body"]
    key_names = list(H["keys"])
    out = []
    for s in ("l", "r"):
        verts, faces, keys = aw.eyeball(body, s, key_names)
        f = eye_map if s == "l" else (lambda p: eye_map(np.asarray(p) * MIRROR) * MIRROR)
        co = f(verts)
        keys = {k: f(verts + v) - co for k, v in keys.items()}
        W = np.zeros((len(co), aw.NB))
        W[:, BI["Head"]] = 1.0
        out.append(aw.Mesh(co, faces, np.full(len(faces), P["eyes"]), keys, W))
    for pts, faces, uv, keys, upper in aw.lashes(B["human"], H["base"], body, key_names):
        co = move(pts)
        keys = {k: move(pts + v) - co for k, v in keys.items()}
        W = np.zeros((len(co), aw.NB))
        W[:, BI["Head"]] = 1.0
        m = aw.Mesh(co, faces, np.full(len(faces), P["eyelashes"]), keys, W)
        m.uv = [[(c[0], (0.5 if upper else 0.0) + c[1] * 0.5) for c in f] for f in uv]
        out.append(m)
    return out


def more_keys(B, H, F, mesh):
    """The keys that let a slider go the other way, and the ears' and tail's own: `ears_small` (a quarter
    smaller), `tail_long` and `tail_short` (a third longer, a quarter shorter: the tail's points slid along
    its line)."""
    ear = mesh.tags["ear"] > 0.5
    d = np.zeros_like(mesh.co)
    for side, (base, axis, fr, lat, hh) in H["ears"].items():
        sel = ear & (np.sign(mesh.co[:, 0]) == side)
        d[sel] = (base + (mesh.co[sel] - base) * 0.74) - mesh.co[sel]
    mesh.keys["ears_small"] = d
    curve, sl = H["tail_curve"]
    tail = np.nonzero(mesh.tags["tail"] > 0.5)[0]
    near = np.argmin(np.linalg.norm(mesh.co[tail][:, None] - curve[None, ::2], axis=2), axis=1) * 2
    s = sl[near]
    end_dir = unit(curve[-1] - curve[-6])

    length = np.linalg.norm(np.diff(curve, axis=0), axis=1).sum()

    def along(t):
        # (Past the tip the line runs on straight.)
        p = np.stack([np.interp(np.clip(t, 0, 1), sl, curve[:, i]) for i in range(3)], axis=1)
        return p + np.outer(np.clip(t - 1, 0, None) * length, end_dir)

    for name, k in (("tail_long", 1.33), ("tail_short", 0.75)):
        d = np.zeros_like(mesh.co)
        d[tail] = along(s * k) - along(s)
        mesh.keys[name] = d


def muzzle_keys(F, mesh):
    """`muzzle` (a fifth longer) and `muzzle_short` (a sixth shorter), from the eyes forward."""
    k = F.r / 0.0159
    q = F.of(mesh.co) / k
    head = (mesh.W[:, BI["Head"]] > 0.5) * smoothstep(0.03, -0.01, q[:, 2])
    reach = np.clip(q[:, 1] - 0.02, 0, None) * head
    for name, amount in (("muzzle", 0.22), ("muzzle_short", -0.17)):
        d = np.zeros_like(mesh.co)
        d[:, 1] = -reach * amount * k
        mesh.keys[name] = d


BOTTOMS = ("underwear-bottom-briefs", "underwear-bottom-boxer_briefs")
TOPS = ("underwear-top-bra", "underwear-top-sports_bra")


def underwear(B, H, F, mesh):
    """The underwear: the human avatar's styles, each a mesh of its own hung on the furred body (about 2 mm
    of cloth over the fur, with its bands and hems), the bottoms with a round opening for the tail."""
    J = H["J"]
    co0, quads0, nrm0, arms0 = H["base0"]
    skin = aw.Skin(mesh.co, mesh.faces, mesh.W, mesh.keys)
    frame = aw.Frame(B["human"], co0, J)
    specs = aw.garment_specs(B["human"], frame, skin)
    names = BOTTOMS + (TOPS if B["female"] else ())
    curve, sl = H["tail_curve"]
    root = curve[0]
    r_open = H["tail_r0"] + 0.021
    J = H["J"]
    pel = J["pelvis"]
    wear = []
    for name in names:
        spec = specs[name]
        # A little more room than on the human (the fur under it is softer than skin), more again over the
        # groin, which a heavier body fills out.
        gap0 = spec["gap"]

        def gap(p, gap0=gap0):
            groin = np.exp(-((p[:, 0] / 0.06) ** 2 + ((p[:, 2] - (pel[2] - 0.1)) / 0.065) ** 2)) * (p[:, 1] < pel[1] + 0.02)
            return gap0(p) + 0.0015 + 0.004 * groin

        spec["gap"] = gap
        if name in BOTTOMS:
            keep0 = spec["keep"]
            hole = wa.metric(lambda p: np.linalg.norm((p - root) * np.array([1.0, 0.35, 1.0]), axis=1) - r_open)
            spec["keep"] = lambda p, keep0=keep0, hole=hole: wa.smin(keep0(p), hole(p), 0.004)
        g = aw.build_garment(name, spec, (co0, quads0, nrm0, arms0), skin, list(mesh.keys))
        # (Where a key fills the body out under the cloth, the cloth goes a little further, for room: the
        # breasts swelling over a bra's band, a heavier belly over the briefs.)
        for kname, more in (("bust", 1.25), ("heavy", 1.12)):
            if kname in g.part.keys:
                g.part.keys[kname] = g.part.keys[kname] * more
        wear.append(g)
    return wear, frame


def wear_objects(wear, order):
    """The underwear as Blender objects (each its own mesh, on the same bones and keys as the body), with
    their own texture of knit, bands and stitching (make_avatar.py's), coloured by `underwear` and
    `underwear_trim`."""
    aw.garment_uvs(wear, order)
    objs = []
    for g in wear:
        p = g.part
        keys = {k: p.keys.get(k, np.zeros_like(p.co)) for k in order}
        W = np.zeros((len(p.co), aw.NB))
        W[:, : p.weights.shape[1]] = p.weights
        m = aw.Mesh(p.co, p.faces, np.array(p.mat), keys, W)
        obj = aw.to_object(g.name, m, order, uv=p.uv)
        a = g.attrs
        for nm, cols in (("ww1", a[:, :3]), ("ww2", np.c_[a[:, 3:5], np.zeros(len(a))])):
            at = obj.data.color_attributes.new(nm, "FLOAT_COLOR", "POINT")
            at.data.foreach_set("color", np.c_[cols, np.ones(len(cols))].astype(np.float32).ravel())
        objs.append(obj)
    return objs


def build(B, export=True):
    ww.reset()
    name = B["name"]
    H, mesh, extras = build_mesh(B)
    F = H["F"]
    colour_regions(B, H, F, mesh)
    flow = fur_flow(H, F, mesh)
    more_keys(B, H, F, mesh)
    wear, frame = underwear(B, H, F, mesh)
    extras = extras + tufts(B, H, F, mesh)
    eyes = []
    for e in extras[:2]:
        c = e.co.mean(0)
        eyes.append((c, np.linalg.norm(e.co - c, axis=1).mean(), unit(e.co[0] - c)))
    own_uv = []
    card_normals = {}
    for e in extras:
        n0 = len(mesh.faces)
        v0 = len(mesh.co)
        mesh.add(e)
        if hasattr(e, "normal"):
            for vi in range(v0, len(mesh.co)):
                card_normals[vi] = e.normal
        if hasattr(e, "uv"):
            own_uv += list(zip(range(n0, n0 + len(e.faces)), e.uv))
    flow = np.concatenate([flow, np.zeros((len(mesh.co) - len(flow), 3))])
    muzzle_keys(F, mesh)
    order = [k for k in KEY_ORDER if k in mesh.keys]
    mesh.W = aw.limit_weights(mesh.W)
    obj = aw.to_object(name, mesh, order)
    # The tufts shade as the fur under them does: their normals are the skin's where they grow.
    vn = np.zeros((len(obj.data.vertices), 3))
    obj.data.vertex_normals.foreach_get("vector", vn.ravel())
    for vi, nn in card_normals.items():
        vn[vi] = nn
    obj.data.normals_split_custom_set_from_vertices(vn.tolist())
    attr = obj.data.attributes.new("flow", "FLOAT_VECTOR", "POINT")
    attr.data.foreach_set("vector", flow.ravel())
    co = mesh.co
    aw.log(f"{name}: {len(co)} vertices, {co[:, 2].max():.3f} m to the ear tips; underwear " + ", ".join(f"{g.name} {len(g.part.co)}" for g in wear))
    pieces = wear_objects(wear, order)
    head = np.array([mesh.W[f, BI["Head"]].min() > 0.5 for f in mesh.faces])
    if os.environ.get("WW_NO_BAKE"):
        for pname, colour, rough, spec in PARTS:
            m = aw.bpy.data.materials.new(pname)
            m.diffuse_color = (*[aw.srgb_to_linear(c) for c in ww.hex_rgb(colour)], 1.0)
            obj.data.materials.append(m)
        for o in pieces:
            for pname, colour, rough, spec in WEAR_PARTS:
                m = aw.bpy.data.materials.new(pname)
                m.diffuse_color = (*[aw.srgb_to_linear(c) for c in ww.hex_rgb(colour)], 1.0)
                o.data.materials.append(m)
    else:
        for _ in PARTS:
            obj.data.materials.append(aw.bpy.data.materials.new("slot"))
        aw.unwrap(obj, (head, 1.7))
        SIZE = 2048
        for o in pieces:
            o.hide_render = True  # (the body's shading baked without the underwear over it)
        maps = aw.bake_maps(obj, SIZE, vectors=("flow",))
        for o in pieces:
            o.hide_render = False
        aw.log("maps baked")
        rgb, height = paint(B, H, F, maps, eyes)
        aw.log("painted")
        normal = aw.bake_normal(obj, height, name)
        normal = aw.save_image(normal, name, "normal")
        tex = aw.save_image(aw.image_from(f"{name}-texture", np.repeat(rgb[..., None] ** (1 / 2.2), 3, axis=2)), name, "texture")
        # (The lashes' and tufts' own texture coordinates, into their own small textures, once the bakes
        # are done.)
        uvl = obj.data.uv_layers.active.data
        for fi, uvs in own_uv:
            poly = obj.data.polygons[fi]
            for li, uv in zip(poly.loop_indices, uvs):
                uvl[li].uv = uv
        lash = lash_image()
        lash.pack()
        tuft = tuft_image()
        tuft.pack()
        old = list(obj.data.materials)
        new = []
        for pname, colour, rough, spec in PARTS:
            if pname == "eyelashes":
                mat = aw.part_material(pname, colour, lash, rough, specular=spec, alpha="BLEND")
            elif pname.endswith("_tufts"):
                mat = aw.part_material(pname, colour, tuft, rough, specular=spec, alpha="BLEND")
            else:
                mat = aw.part_material(pname, colour, tex, rough, normal_image=normal if pname in ("fur", "fur2", "nose") else None, specular=spec)
            new.append(mat)
        aw.set_materials(obj.data, new)
        for m in old:
            aw.bpy.data.materials.remove(m)
        # The underwear's texture: baked where each garment is, then painted (make_avatar.py's way).
        for o in pieces:
            for _ in WEAR_PARTS:
                o.data.materials.append(aw.bpy.data.materials.new("slot"))
        gmaps = aw.bake_garments(pieces, obj, 1024)
        grgb, gnmap = aw.paint_garments(wear, gmaps, frame, 1024)
        gtex = aw.save_image(aw.image_from(f"{name}-underwear", grgb), name, "underwear")
        gimg = aw.image_from(f"{name}-underwear-normal", gnmap, colour=False)
        gnormal = aw.save_image(gimg, name, "underwear-normal")
        wear_mats = [aw.part_material(pname, colour, gtex, rough, normal_image=gnormal, specular=spec) for pname, colour, rough, spec in WEAR_PARTS]
        for o in pieces:
            old = list(o.data.materials)
            aw.set_materials(o.data, wear_mats)
            for m in old:
                aw.bpy.data.materials.remove(m)
        aw.log("textured")
    joints = dict(H["J"])
    tj = H["tail_joints"]
    for i, b in enumerate(aw.TAIL):
        joints[b] = tj[i]
    joints["tail_04.tail"] = tj[4]
    rig_obj = aw.rig(name, joints)
    if export:
        aw.export(name, [obj] + pieces, rig_obj, aw.actions(arm_down=72 - aw.APOSE))
    return H, mesh, obj, rig_obj, pieces


KEY_ORDER = ("thin", "heavy", "muscle", "chest", "bust", "hips", "waist", "belly", "shoulders", "neck", "neck_slim", "jaw", "cheeks", "eyes", "muzzle", "muzzle_short", "ears_tall", "ears_small", "tail", "tail_long", "tail_short", "ruff_flat")


if __name__ == "__main__":
    which = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else ["male", "female"]
    for w in which:
        build({"male": MALE, "female": FEMALE}[w])
