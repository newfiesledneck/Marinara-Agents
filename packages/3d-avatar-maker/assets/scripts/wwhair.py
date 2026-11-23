"""Helpers for make_hair.py: the hair styles MakeHuman's CC0 pack hasn't got (parted, buns, shaved, mohawk),
cut from its styles' cards and pictures (fitted by wwmhclo.py, so they carry every body shape key) and
cards of our own laid with the pack's locks: a style's hair laid flat on the scalp as a buzz cut, a
style shortened, locks standing up in a crest, locks wound into a bun.

Cards made here take their shape keys from the skin nearest them (`wwmhclo.skin_keys`, the ears left out),
so they follow the face, ears, neck and age sliders as the scalp under them does.
"""

import math

import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree

import wwmhclo as mc

# Where hair sits: the hairline's height over eye level by the angle round the head from the front (0) to
# the back (180). (make_avatar.py keeps a copy: a race's key moves nothing above it.)
HAIRLINE = {
    "male": [(0, 0.074), (20, 0.072), (32, 0.066), (42, 0.056), (50, 0.040), (58, 0.020), (66, 0.000),
             (74, -0.020), (82, -0.028), (88, -0.010), (92, 0.012), (100, 0.020), (110, 0.016), (118, -0.004),
             (126, -0.046), (136, -0.066), (150, -0.078), (165, -0.084), (180, -0.086)],
    "female": [(0, 0.072), (20, 0.071), (32, 0.068), (42, 0.060), (50, 0.046), (58, 0.028), (66, 0.008),
               (74, -0.010), (82, -0.016), (88, 0.000), (92, 0.018), (100, 0.026), (110, 0.022), (118, 0.002),
               (126, -0.040), (136, -0.060), (150, -0.072), (165, -0.078), (180, -0.080)],
}

# ponytail01's six straight locks (its picture's bottom half): (u0, v0, u1, v1), the root at v1, dark,
# the tip at v0, ragged and lighter.
LOCKS = [(0.022, 0.03, 0.095, 0.47), (0.105, 0.03, 0.18, 0.45), (0.455, 0.06, 0.525, 0.5),
         (0.80, 0.07, 0.845, 0.45), (0.86, 0.06, 0.915, 0.47), (0.93, 0.05, 0.985, 0.47)]


def head_frame(body):
    """The skull's middle (its bone's head moved up and back into the skull) and the eyes' height."""
    import make_mh_hair as mh

    eye_z, eye_y = mh.eyes(body)
    head = body.bone == "Head"
    skull = head & (body.co[:, 2] > eye_z)
    centre = body.co[skull].mean(0)
    return centre, eye_z, eye_y


def azimuth(points, centre):
    """Degrees round the head from the front (0) to the back (180), either side alike."""
    return np.degrees(np.arctan2(np.abs(points[:, 0] - centre[0]), -(points[:, 1] - centre[1])))


def flatten(f, body, lo=0.0012, hi=0.0035, share=0.12):
    """A style's hair laid down onto the scalp: each vertex over the skin point nearest it, at `lo` plus a
    `share` of how far off it stood (up to `hi`), so its layers keep their order without fighting."""
    bvh, _ = body.bvh({})
    loc, nrm, d = mc.nearest(bvh, f.co)
    f.co = loc + nrm * np.clip(lo + share * np.maximum(d, 0), lo, hi)[:, None]
    return f


def shorten(f, body, top, target, bins=13):
    """Hair below `top` (metres over the eyes) squeezed up towards it, each part of the way round the head
    (by azimuth, `target(az)` metres over the eyes) ending where `target` says, its tips kept."""
    centre, eye_z, _ = head_frame(body)
    z = f.co[:, 2]
    az = azimuth(f.co, centre)
    top_z = eye_z + top
    low = z < top_z
    edges = np.linspace(0, 180, bins)
    ends = []
    for a in edges:
        near = low & (np.abs(az - a) < 180 / (bins - 1))
        ends.append(z[near].min() if near.any() else top_z)
    zmin = np.interp(az, edges, ends)
    want = eye_z + np.array([target(a) for a in az])
    s = np.clip((top_z - want) / np.maximum(top_z - zmin, 1e-3), 0, 1)
    f.co[:, 2] = np.where(low, top_z - (top_z - z) * s, z)
    return f


def stubble(g, coverage=0.7, seed=5):
    """A greyscale hair picture (with alpha) turned into stubble: fine dark flecks (the picture's finest
    strand marks with a fine grain over them) as cut-outs covering about `coverage` of the scalp, fewer
    where the picture's own alpha fades (its hairline), so a cap of it reads as a close buzz with the
    scalp between, and as an even cap of the hair's colour further off."""
    rng = np.random.default_rng(seed)
    lum = g[..., 0]
    a = np.clip(g[..., 3], 0, 1)
    solid = a > 0.5
    detail = lum - mc.box_blur(lum, 2)
    detail = (detail - detail[solid].mean()) / max(detail[solid].std(), 1e-6)
    grain = rng.standard_normal(lum.shape)
    grain = (grain - grain.mean()) / grain.std()
    z = 0.45 * detail + grain
    keep = z > np.quantile(z[solid], 1 - coverage) + 2.2 * (1 - a)
    out = np.zeros_like(g)
    out[..., :3] = np.clip(0.55 + 0.12 * np.clip(z, -2, 2) / 2, 0, 1)[..., None]
    out[..., 3] = np.where(keep & (a > 0.08), 1.0, 0.0)
    return out


def copy_locks(src, dst, x0, v_from=None):
    """Copies LOCKS from `src` (a picture, row 0 at the bottom) into `dst` side by side from u `x0`, at the
    same size; returns their new places (u0, v0, u1, v1)."""
    size = src.shape[0]
    rects = []
    x = int(x0 * size)
    for u0, v0, u1, v1 in LOCKS:
        c0, c1, r0, r1 = int(u0 * size), int(u1 * size), int(v0 * size), int(v1 * size)
        w = c1 - c0
        if x + w > size:
            break
        dst[r0:r1, x : x + w] = src[r0:r1, c0:c1]
        rects.append((x / size, v0, (x + w) / size, v1))
        x += w + 2
    return rects


def lock(body, like, points, facing, width, rect, cols=2, taper=0.35, round_=0.45):
    """One card along `points` facing `facing` (per point), showing the lock at `rect`, keyed as the skin
    under it moves: a wwmhclo Fitted."""
    keys = mc.skin_keys(body, points, like.key_names)
    co, faces, uv, k, nrm = mc.strip(np.asarray(points), keys, np.asarray(facing), width, rect, cols=cols, taper=taper, round_=round_)
    return mc.made(body, co, faces, uv, k, normal_hint=nrm, like=like)


def on_scalp(body, centre, direction):
    """Where a line out from the head's middle along `direction` meets the skin: (point, its normal)."""
    bvh, _ = body.bvh({})
    d = Vector(direction).normalized()
    hit = bvh.ray_cast(Vector(centre) + d * 0.25, -d, 0.3)
    return np.array(hit[0]), np.array(hit[1])


def ball(body, like, centre, radius, rect, rings=6, segments=10):
    """A ball of hair (a bun's core): a sphere showing `rect` of the picture, its strands running round it."""
    co, uvs, nrm = [], [], []
    for i in range(rings + 1):
        ph = math.pi * i / rings
        for j in range(segments + 1):
            th = 2 * math.pi * j / segments
            d = np.array([math.sin(ph) * math.cos(th), math.sin(ph) * math.sin(th), math.cos(ph)])
            co.append(centre + d * radius)
            nrm.append(d)
            uvs.append((rect[0] + (rect[2] - rect[0]) * j / segments, rect[1] + (rect[3] - rect[1]) * i / rings))
    faces, corner = [], []
    for i in range(rings):
        for j in range(segments):
            a = i * (segments + 1) + j
            b = a + segments + 1
            q = [a, b, b + 1, a + 1]
            faces.append(q)
            corner += [uvs[v] for v in q]
    co = np.array(co)
    keys = mc.skin_keys(body, co, like.key_names)
    return mc.made(body, co, faces, np.array(corner), keys, normal_hint=np.array(nrm), like=like)


def bun(body, like, centre, axis, radius, core_rect, locks, rng, ribbons=8):
    """A bun: a ball of hair with locks wound round it at different tilts, a little loose, each going
    most of the way round, its root tucked in and its tip lying over the next."""
    parts = [ball(body, like, centre, radius * 0.9, core_rect)]
    axis = mc.unit(np.asarray(axis, dtype=np.float64))
    e1 = mc.unit(np.cross(axis, [0.0, 0.0, 1.0] if abs(axis[2]) < 0.9 else [1.0, 0.0, 0.0]))
    e2 = np.cross(axis, e1)
    for k in range(ribbons):
        tilt = rng.uniform(0.25, 1.25)
        spin = 2 * math.pi * k / ribbons + rng.uniform(-0.3, 0.3)
        a = mc.unit(axis * math.cos(tilt) + (e1 * math.cos(spin) + e2 * math.sin(spin)) * math.sin(tilt))
        b1 = mc.unit(np.cross(a, axis if abs(a @ axis) < 0.95 else e1))
        b2 = np.cross(a, b1)
        start, sweep = rng.uniform(0, 2 * math.pi), rng.uniform(3.8, 5.2)
        pts, out = [], []
        for i in range(12):
            th = start + sweep * i / 11
            d = b1 * math.cos(th) + b2 * math.sin(th)
            r = radius * (0.92 + 0.14 * i / 11 + 0.04 * math.sin(i * 1.7))
            pts.append(centre + d * r)
            out.append(d)
        parts.append(lock(body, like, np.array(pts), np.array(out), rng.uniform(0.024, 0.032), locks[k % len(locks)], taper=0.45))
    return mc.merge(parts)


def crest(body, like, sex, rects, rng, stations=17, front=0.074, back=0.01, height=(0.055, 0.10, 0.025)):
    """A mohawk's crest: locks standing up along the middle of the scalp from the front hairline (`front`
    over the eyes) to the back of the head (`back`), swept back, tallest over the crown and lying closer
    towards the back. Five locks a station: one in the middle facing back and up, and two each side facing
    the side, leaning out, the outer ones shorter, so it's full from the front too."""
    centre, eye_z, _ = head_frame(body)
    roots = []
    for th in np.radians(np.linspace(-10, 235, 120)):
        p, n = on_scalp(body, centre, (0.0, -math.cos(th), math.sin(th)))
        roots.append((p, n))
    zs = np.array([p[2] for p, _ in roots])
    first = int(np.argmax(zs > eye_z + front))
    last = len(roots) - 1 - int(np.argmax((zs > eye_z + back)[::-1]))
    path = np.array([p for p, _ in roots[first : last + 1]])
    nrms = np.array([n for _, n in roots[first : last + 1]])
    L = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(path, axis=0), axis=1))])
    x = np.array([1.0, 0, 0])
    parts = []
    for i in range(stations):
        t = (i + rng.uniform(0.2, 0.8)) / stations
        j = int(np.clip(np.searchsorted(L, t * L[-1]), 1, len(path) - 2))
        root, n = path[j], mc.unit(nrms[j])
        back_dir = mc.unit(path[j + 1] - path[j - 1])
        h = np.interp(t, [0, 0.3, 1], height) * rng.uniform(0.88, 1.08)
        up = 1 - 0.45 * t  # (how much it stands up rather than lies back)
        for side, off, lean, short in ((0, 0.0, 0.0, 1.0), (-1, 0.007, 0.22, 0.95), (1, 0.007, 0.22, 0.95), (-1, 0.015, 0.5, 0.72), (1, 0.015, 0.5, 0.72)):
            base = root + x * side * off + n * 0.001
            pts = []
            for k in range(6):
                u = k / 5
                d = mc.unit(n * (1 - 0.6 * u) * up + back_dir * (0.3 + 0.9 * u) + x * side * lean)
                pts.append(base + d * h * short * u)
            pts = np.array(pts)
            tang = mc.unit(np.gradient(pts, axis=0))
            if side:
                facing = mc.unit(np.repeat((x * side)[None], len(pts), axis=0) + n * 0.3)
            else:
                facing = mc.unit(np.cross(tang, np.repeat(x[None], len(pts), axis=0)))
                facing = np.where((facing @ n)[:, None] < 0, -facing, facing)
            width = rng.uniform(0.024, 0.032) * (1.2 if not side else 1.0)
            parts.append(lock(body, like, pts, facing, width, rects[int(rng.integers(0, len(rects)))], taper=0.6))
    return mc.merge(parts)
