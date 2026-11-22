"""Wanderworld's second batch of outfit pieces for the base avatar: swimwear, casual tops and bottoms,
robes and long wear, footwear and accessories, and armour, made around the male and female bodies the
way make_outfit.py makes the first batch (and with its helpers), skinned to their skeleton and carrying
their shape keys. Loose cloth (skirts, robes, coats, flaps) is draped with Blender's cloth simulation, so
its folds are in the geometry. Writes assets/models/outfit-<piece>.glb with a `male` and a `female` mesh
(a piece for one body only, a bikini, has that body's mesh alone, so the game offers it on that body).
Run (BLENDER: your Blender executable; add piece names after `--` for only those, and `male` or `female`
for one body):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_outfit2.py
    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_outfit2.py -- robe sandals

Each mesh's extras are as make_outfit.py describes: `outfit`, `slot`, `body`, `layer`, `hides` (the
game's words) and `parts`.
"""

import math
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import make_outfit as mo  # noqa: E402
import wwoutfit as wo  # noqa: E402
from make_outfit import UP, bezier, body_polys, lacing, limb, neckline, oriented, region_top, sim_skirt, top_shell  # noqa: E402
from wwoutfit import smoothstep, unit  # noqa: E402

# Colours each part starts with: (colour, roughness, metalness).
LINEN = mo.LINEN
WHITE = (0xF2EEE6, 0.9, 0.0)
CORD = mo.CORD
LEATHER = mo.LEATHER
LEATHER_DARK = mo.LEATHER_DARK
LEATHER_RED = (0x7A3426, 0.6, 0.0)
SUEDE = (0x8A6A4A, 0.85, 0.0)
STEEL = mo.STEEL
IRON = mo.IRON
BRASS = mo.BRASS
GOLD = (0xD8B060, 0.32, 1.0)
SILVER = (0xC8CCD2, 0.3, 1.0)
GEM_RED = (0xA01828, 0.15, 0.0)
GEM_BLUE = (0x2050B0, 0.15, 0.0)
FUR = (0x7A6048, 0.95, 0.0)
FUR_GREY = (0x8C8680, 0.95, 0.0)
SWIM_RED = (0xC0302E, 0.6, 0.0)
SWIM_TEAL = (0x1E8A8A, 0.6, 0.0)
SWIM_NAVY = (0x24345A, 0.6, 0.0)
KNIT_OAT = (0xCFC2A6, 0.95, 0.0)
KNIT_GREY = (0x4A4A50, 0.95, 0.0)
KNIT_RED = (0x8E2E2A, 0.95, 0.0)
WOOL_BLUE = mo.WOOL_BLUE
WOOL_GREEN = mo.WOOL_GREEN
WOOL_BROWN = mo.WOOL_BROWN
WOOL_GREY = (0x5A5856, 0.95, 0.0)
WOOL_RED = (0x7E2A28, 0.95, 0.0)
WOOL_PLUM = (0x4E2E4E, 0.95, 0.0)
VELVET_BLUE = (0x26305E, 0.8, 0.0)
VELVET_RED = (0x6A1C24, 0.8, 0.0)
VELVET_GREEN = (0x1E4A36, 0.8, 0.0)
SILK_GOLD = (0xC8A866, 0.55, 0.0)
CANVAS = (0xB8A888, 0.95, 0.0)
QUILT = (0xB8AA8C, 0.95, 0.0)
TRIM = mo.TRIM
TRIM_GOLD = (0xC8A048, 0.6, 0.0)
TRIM_SILVER = (0xB8BCC4, 0.6, 0.0)

# ── Shared helpers ───────────────────────────────────────────────────────────────────────────────────


def skin_path(body, ctrl, n, lift=0.004, rounds=3):
    """n points along a smooth curve through the control points, each laid on the skin (the nearest skin
    point plus `lift` along its normal), and the normals there."""
    P = bezier(np.asarray(ctrl, dtype=np.float64), n)
    for _ in range(rounds):
        loc, nrm, _, _ = body.nearest(P)
        P = loc + nrm * lift
        P[1:-1] = 0.5 * P[1:-1] + 0.25 * (P[:-2] + P[2:])
    loc, nrm, _, _ = body.nearest(P)
    return loc + nrm * lift, nrm


def skin_ring(body, M, z, lift=0.004, n=48, a0=-math.pi, a1=math.pi, tilt=0.0, regions=("torso", "hips", "neck")):
    """Points round the torso at height z (tilted: `tilt` metres lower at the front than at the back),
    from angle a0 to a1 (0 the front, positive to +X), each on the skin's convex outline plus `lift`, and
    the outward normals: where a belt or a strap goes."""
    co = body.co
    sel = M.surf & (np.abs(co[:, 0]) < 0.3)
    if regions is not None:
        sel &= np.isin(body.region, regions)
    angles = np.linspace(a0, a1, n, endpoint=(a1 - a0) < 2 * math.pi - 1e-6)
    out_p, out_n = [], []
    for a in angles:
        zz = z - tilt * 0.5 * math.cos(a)
        cy = M.centre_y(zz)
        m = sel & (np.abs(co[:, 2] - zz) < 0.012)
        pts = co[m]
        q = np.stack([pts[:, 0], pts[:, 1] - cy], axis=1)
        h = wo.hull2(q)
        r = wo.ray_hull(h, [math.atan2(-math.cos(a), math.sin(a))])[0]
        d = np.array([math.sin(a), -math.cos(a), 0.0])
        out_p.append(np.array([0.0, cy, zz]) + d * (r + lift))
        out_n.append(d)
    P, N = np.array(out_p), np.array(out_n)
    for _ in range(2):
        P[1:-1] = 0.5 * P[1:-1] + 0.25 * (P[:-2] + P[2:])
    return P, N


def skin_patch(body, M, bones, offset, decim=0.6, rounds=8, extra=None):
    """The body's skin on `bones` (and where `extra`, a per-vertex mask, says) as a Geo wrapped `offset`
    off it, with its rest places in `P0`: the start of a garment worn close (swimwear, leggings)."""
    keep = np.isin(body.bone, bones)
    if extra is not None:
        keep &= extra
    g = wo.Geo.from_body(body, body_polys(body, keep))
    if decim < 1:
        g = wo.decimate(g, decim)
    g.attrs["P0"] = g.co.copy()
    wo.wrap(g, body, offset, rounds=rounds, factor=0.4)
    return g


def legwear(body, M, end_t, off_top, off_end, kind="cloth", part="cloth", waist_lift=0.012, decim=0.6, rounds=12, ankle=False):
    """Legwear made from the body's hips and legs: wrapped off them by off_top at the hips growing to off_end
    at the hem, cut at the waist (just above the hips region, so it can be hidden) and round each leg at
    end_t along it (0 the hip, 1 the knee, 2 the ankle) or, with `ankle`, level just below the shins; front
    and back panels with side seams, an inseam and a centre seam."""
    sel = ["pelvis", "spine_01", "spine_02", "thigh_l", "thigh_r", "calf_l", "calf_r", "foot_l", "foot_r"]
    t_leg, *_ = M.leg_fields(body.co)
    keep = np.isin(body.bone, sel) & (t_leg < end_t + 0.2) & ~(np.isin(body.bone, ["foot_l", "foot_r"]) & (t_leg > M.foot_t + 0.15))
    g = wo.decimate(wo.Geo.from_body(body, body_polys(body, keep)), decim)
    g.part = [part] * len(g.faces)
    g.kind = [kind] * len(g.faces)
    P0 = g.co.copy()
    g.attrs["P0"] = P0.copy()
    t, r, out, axis = M.leg_fields(P0)
    legs = P0[:, 2] < M.crotch + 0.04
    off = off_top + (off_end - off_top) * smoothstep(0.05, max(end_t, 0.1), t) * legs
    wo.wrap(g, body, off, rounds=rounds)
    waist = region_top(body, M, ["hips"], lift=waist_lift, below=M.J["spine_02"][2])
    g.clip(P0[:, 2] - waist(P0))
    P0 = g.attrs["P0"]
    t, *_ = M.leg_fields(P0)
    if ankle:
        g.clip(np.where(P0[:, 2] < M.crotch, M.shin_low - 0.004 - P0[:, 2], -1))
    else:
        g.clip(np.where(P0[:, 2] < M.crotch + 0.02, t - end_t, -1))
    P0 = g.attrs["P0"]
    g.split(P0[:, 0], edge_class="seam")
    P0 = g.attrs["P0"]
    t, r, out, axis = M.leg_fields(P0)
    g.split((out * np.array([0, -1, 0])).sum(1) * r + 0.004, edge_class="seam")
    P0 = g.attrs["P0"]
    t, r, out, axis = M.leg_fields(P0)
    fwd = (out * np.array([0, -1, 0])).sum(1) * r + 0.004
    for i, f in enumerate(g.faces):
        side = "l" if P0[f, 0].mean() > 0 else "r"
        g.panel[i] = ("front_" if fwd[f].mean() > 0 else "back_") + side
    return g


def waistband(g, M, width=0.034, thickness=0.004, part="cloth", kind="cloth", lift=0.0015):
    """A waistband over the top edge of legwear or a skirt."""
    top = g.co[mo.loop_by(g, lambda p: p[:, 2].mean())].copy()
    order = np.argsort(np.arctan2(top[:, 0], -(top[:, 1] - M.centre_y(top[:, 2]))))
    P = top[order]
    N = unit(np.stack([P[:, 0], P[:, 1] - M.centre_y(P[:, 2]), np.zeros(len(P))], axis=1))
    P, N = wo.resample(P, N, 0.012)
    P, N = oriented(P, N, -UP)
    g.join(wo.strip(P + N * lift - UP * width * 0.4, N, width, thickness, part=part, kind=kind, panel="waistband"))
    return P, N


def bow(centre, normal, side, size=0.03, part="cord", kind="cord", radius=0.003, tails=0.08):
    """A tied bow: two loops and two hanging tails, on a surface with the given normal."""
    n = unit(normal)
    sd = unit(side - n * (side @ n))
    up = UP - n * (UP @ n)
    up = unit(up) if np.linalg.norm(up) > 1e-3 else np.cross(n, sd)
    sd = unit(np.cross(up, n))
    c = np.asarray(centre)
    out = []
    for sg in (1, -1):
        loop = [c, c + sd * sg * size * 0.6 + up * size * 0.45 + n * 0.006, c + sd * sg * size * 1.1 + n * 0.008, c + sd * sg * size * 0.6 - up * size * 0.4 + n * 0.006, c]
        out.append(wo.tube(bezier(loop, 12), radius, sides=5, part=part, kind=kind, caps=False))
        tail = [c, c + sd * sg * size * 0.3 - up * tails * 0.4 + n * 0.006, c + sd * sg * size * 0.5 - up * tails + n * 0.004]
        out.append(wo.tube(bezier(tail, 8), radius * 0.9, sides=5, part=part, kind=kind))
    out.append(wo.stud(c + n * 0.003, n, radius * 2.2, radius * 1.8, part=part, kind=kind, sides=6))
    g = out[0]
    for o in out[1:]:
        g.join(o)
    return g


def bust_marks(body, M):
    """The bust's apex each side (the front-most skin point of the chest), as {s: point}."""
    co = body.co
    out = {}
    for s, sg in (("l", 1), ("r", -1)):
        m = M.surf & (body.region == "torso") & (co[:, 0] * sg > 0.03) & (co[:, 0] * sg < 0.16) & (np.abs(co[:, 2] - M.chest_z) < 0.1)
        pts = co[m]
        out[s] = pts[np.argmin(pts[:, 1])]
    return out


def triangle_field(P, a, b, c):
    """Signed distance in the x-z plane to the triangle a, b, c (negative inside)."""
    q = P[:, [0, 2]]
    tri = [np.asarray(x)[[0, 2]] for x in (a, b, c)]
    d = np.full(len(P), -np.inf)
    area = (tri[1][0] - tri[0][0]) * (tri[2][1] - tri[0][1]) - (tri[2][0] - tri[0][0]) * (tri[1][1] - tri[0][1])
    sgn = 1 if area > 0 else -1
    for i in range(3):
        p0, p1 = tri[i], tri[(i + 1) % 3]
        e = p1 - p0
        nrm = np.array([e[1], -e[0]]) * sgn
        nrm /= np.linalg.norm(nrm)
        d = np.maximum(d, (q - p0) @ nrm)
    return d


def leg_tube(body, M, s, t0, t1, offset, around=24, step=0.02, part="leather", kind="leather", panel="shaft"):
    """A tube round one leg from t0 to t1 along it (0 hip, 1 knee, 2 ankle), each ring the leg's convex
    outline there plus offset(t): a boot shaft, a greave."""
    J = M.leg_joints(s)
    ts = np.linspace(t0, t1, max(3, int(abs(t1 - t0) * 0.45 / step) + 1))

    def at(t):
        i = min(int(t), 1)
        return J[i] + (J[i + 1] - J[i]) * (t - i)

    path = np.array([at(t) for t in ts])

    def rad(i, angles, c, T, e1, e2):
        # (Rays out from the leg's axis to its skin, so the leg's sparse mesh below the knee is no matter;
        # then the convex outline of where they hit.)
        q = []
        for a in angles:
            d = e1 * math.cos(a) + e2 * math.sin(a)
            hit = body.bvh.ray_cast(wo.Vector(c), wo.Vector(d), 0.3)
            r = hit[3] if hit[0] is not None else 0.05
            q.append((r * math.cos(a), r * math.sin(a)))
        return wo.ray_hull(wo.hull2(np.array(q)), angles) + offset(ts[i])

    g = wo.loft(path, around, rad, up_hint=(0, -1, 0), seam_angle=math.pi, part=part, kind=kind, panel=panel, down=(0, 0, -1))
    g.co = g.smooth_values(g.co, 2, 0.35)
    g.attrs["t"] = ts[g.attrs["ring"][:, 0].astype(int)][:, None]
    return g, path


def studs_on(g, points, normals, r=0.0035, h=0.002, part="metal", kind="metal", sides=5):
    for p, n in zip(points, normals):
        g.join(wo.stud(p + n * 0.0005, n, r, h, part=part, kind=kind, sides=sides))


def ray_onto(geo_or_body, origin, direction, lift=0.0):
    """Where a ray from origin along direction meets the surface (a Geo or the body), and the normal there."""
    if isinstance(geo_or_body, wo.Geo):
        bvh, _ = wo.geo_bvh(geo_or_body)
    else:
        bvh = geo_or_body.bvh
    hit = bvh.ray_cast(wo.Vector(origin), wo.Vector(unit(direction)), 2.0)
    if hit[0] is None:
        hit = bvh.find_nearest(wo.Vector(origin))
    p, n = np.array(hit[0]), np.array(hit[1])
    if n @ (np.asarray(origin) - p) < 0:
        n = -n
    return p + n * lift, n


# ── Swim and summer ──────────────────────────────────────────────────────────────────────────────────


TORSO = ("torso", "hips", "neck")
CORD_R = 0.003


def cord_path(body, ctrl, n, radius=CORD_R, regions=TORSO, over=None, rounds=4):
    """A cord's centre line through control points, laid ON the skin of `regions` (its surface `radius`
    plus 2 mm off it, so it never sinks in), or on `over` (a Geo: a cup it runs across) where that is
    nearer the outside. Returns the points and their outward normals."""
    P = bezier(np.asarray(ctrl, dtype=np.float64), n)
    lift = radius + 0.002
    bvh_over = wo.geo_bvh(over)[0] if over is not None else None
    for r in range(rounds + 1):
        loc, nrm, _, _ = body.nearest_in(P, regions)
        Q = loc + nrm * lift
        N = nrm
        if bvh_over is not None:
            l2, n2, _, d2 = wo.nearest(bvh_over, P)
            take = (np.linalg.norm(P - l2, axis=1) < 0.012) & (((l2 - loc) * nrm).sum(1) > -0.002)
            Q = np.where(take[:, None], l2 + n2 * (radius + 0.0012), Q)
            N = np.where(take[:, None], n2, N)
        P = Q
        if r < rounds:
            P[1:-1] = 0.5 * P[1:-1] + 0.25 * (P[:-2] + P[2:])
    return P, unit(N)


def torso_ring(body, M, z, regions=TORSO, n=48, tilt=0.0):
    """Skin points round the torso at height z (lower by `tilt` at the front), by rays out from its axis."""
    pts = []
    for a in np.linspace(-math.pi, math.pi, n, endpoint=False):
        zz = z - tilt * 0.5 * math.cos(a)
        c = np.array([0.0, M.centre_y(zz), zz])
        d = np.array([math.sin(a), -math.cos(a), 0.0])
        loc, _, _, _ = body.nearest_in((c + d * 0.25)[None], regions)
        pts.append(loc[0])
    return np.array(pts)


def bikini_top(body, M):
    """A string bikini top: two triangle cups gathered at their base and bound at the edges, a halter cord
    from each cup tied behind the neck, and a band cord running along the cups' base and round the ribs,
    tied in a bow at the back; every cord lies on the skin."""
    apex = bust_marks(body, M)
    g = skin_patch(body, M, ["spine_02", "spine_03", "clavicle_l", "clavicle_r"], 0.0028, decim=0.8, extra=body.co[:, 1] < M.centre_y(body.co[:, 2]) + 0.02)
    g.kind = ["cloth"] * len(g.faces)
    P0 = g.attrs["P0"]
    tris = {}
    for s, sg in (("l", 1), ("r", -1)):
        A = apex[s]
        top = A + np.array([-0.012 * sg, 0, 0.1])
        inner = np.array([0.016 * sg, 0, A[2] - 0.072])
        outer = A + np.array([0.09 * sg, 0, -0.06])
        tris[s] = (top, inner, outer)
    front = P0[:, 1] < M.centre_y(P0[:, 2]) - 0.01
    f = np.minimum(triangle_field(P0, *tris["l"]), triangle_field(P0, *tris["r"]))
    g.clip(np.where(front, f, 1.0))
    P0 = g.attrs["P0"]
    for i, fc in enumerate(g.faces):
        g.panel[i] = "cup_l" if P0[fc, 0].mean() > 0 else "cup_r"
    # A little fullness: the cup stands off the skin towards its middle, gathered along its base.
    rel = np.zeros(g.n)
    for s, sg in (("l", 1), ("r", -1)):
        top, inner, outer = tris[s]
        side = P0[:, 0] * sg > 0
        x = (P0[:, 0] - inner[0]) / (outer[0] - inner[0] + 1e-9)
        low = smoothstep(inner[2] + 0.035, inner[2], P0[:, 2])
        rel += side * low * 0.0012 * (0.5 + 0.5 * np.sin(x * 12 * math.pi))
        d_edge = -triangle_field(P0, *tris[s])
        rel += side * 0.0025 * smoothstep(0.0, 0.03, d_edge)
    g.displace(rel)
    g.smooth_edges(rounds=4)
    loops = [g.co[lp].copy() for lp in g.edge_loops()]
    g.rim(depth=0.0025, back=0.0)
    cups = g.copy()
    for P in loops:
        if len(P) < 6:
            continue
        c = P.mean(0)
        N = unit((P - c) * np.array([1, 0.2, 1]) + np.array([0, -0.5, 0]))
        P2, N2 = wo.clean_loop(P, N, 0.006)
        g.join(wo.tube(np.concatenate([P2, P2[:1]]), 0.0024, sides=6, part="trim", kind="cloth", caps=False, panel="binding"))
    # The halter: from each cup's top over the shoulder to a bow at the nape.
    nape_c, nape_n = ray_onto(body, M.neck + np.array([0, 0.3, -0.035]), (0, -1, 0), 0.0)
    for s, sg in (("l", 1), ("r", -1)):
        top, inner, outer = tris[s]
        tp, _ = ray_onto(cups, top + np.array([0, -0.3, -0.006]), (0, 1, 0), 0.0)
        side_neck = M.neck + np.array([0.062 * sg, 0.0, -0.045])
        P, N = cord_path(body, [tp, (tp + side_neck) / 2 + np.array([0, -0.01, 0.02]), side_neck, nape_c + np.array([0.022 * sg, 0.0, 0.0])], 20, over=cups)
        g.join(wo.tube(P, CORD_R, sides=6, part="trim", kind="cord"))
    g.join(bow(nape_c + nape_n * (CORD_R + 0.002), nape_n, np.array([1.0, 0, 0]), size=0.022, part="trim", radius=CORD_R * 0.9, tails=0.06))
    # The band: along the base of both cups and round the ribs, one cord, tied at the back.
    zb = float(np.mean([tris[s][1][2] for s in "lr"])) - 0.002
    ring = torso_ring(body, M, zb, n=56)
    back = int(np.argmax(ring[:, 1]))
    ring = np.roll(ring, -back, axis=0)
    ring = np.concatenate([ring, ring[:1]])
    P, N = cord_path(body, ring, 90, over=cups)
    g.join(wo.tube(P, CORD_R, sides=6, part="trim", kind="cord"))
    g.join(bow(P[0] + N[0] * (CORD_R + 0.002), N[0], np.array([1.0, 0, 0]), size=0.026, part="trim", radius=CORD_R * 0.9, tails=0.07))
    g.attrs = {k: v for k, v in g.attrs.items() if k.startswith("paint_")}
    wo.fit(g, body, clearance=0.0025, regions=TORSO)
    return g


def brief_field(body, M, P0, top_front, top_back, k_front, k_back, gusset=0.028):
    """Positive outside a brief's shape: above its top line (top_front at the front centre, top_back at the
    back, both higher at the sides) or below its leg openings (rising from the crotch by k metres a metre
    out from the gusset; front and back their own)."""
    cy = M.centre_y(P0[:, 2])
    back = smoothstep(-0.02, 0.03, P0[:, 1] - cy)
    x = np.abs(P0[:, 0])
    top = (top_front * (1 - back) + top_back * back) + 0.18 * x * x
    k = k_front * (1 - back) + k_back * back
    leg = M.crotch - 0.014 + k * np.maximum(x - gusset, 0)
    return np.maximum(P0[:, 2] - top, leg - P0[:, 2])


HIPS = ("hips", "torso")


def bikini_bottom(body, M):
    """A tie-side bikini bottom: a shaped front panel and a fuller back, bound at the edges, joined over
    each hip by a cord lying on the skin, tied in a bow on the hip."""
    g = skin_patch(body, M, ["pelvis", "thigh_l", "thigh_r", "spine_01"], 0.0028, decim=0.75)
    g.kind = ["cloth"] * len(g.faces)
    P0 = g.attrs["P0"]
    cy = M.centre_y(P0[:, 2])
    back = smoothstep(-0.02, 0.03, P0[:, 1] - cy)
    width = 0.115 * (1 - back) + 0.13 * back
    zf, zbk = M.crotch + 0.085, M.crotch + 0.1
    g.clip(np.maximum(brief_field(body, M, P0, zf, zbk, 1.15, 0.7), np.abs(P0[:, 0]) - width))
    P0 = g.attrs["P0"]
    for i, fc in enumerate(g.faces):
        g.panel[i] = "back" if P0[fc, 1].mean() > M.centre_y(P0[fc, 2].mean()) else "front"
    g.smooth_edges(rounds=4)
    loops = [g.co[lp].copy() for lp in g.edge_loops()]
    g.rim(depth=0.0025, back=0.0)
    panel = g.copy()
    for P in loops:
        if len(P) < 6:
            continue
        c = P.mean(0)
        N = unit((P - c) * np.array([1, 1, 0.2]))
        P2, N2 = wo.clean_loop(P, N, 0.006)
        g.join(wo.tube(np.concatenate([P2, P2[:1]]), 0.0024, sides=6, part="trim", kind="cloth", caps=False, panel="binding"))
    # Each side: a cord from the front panel's top corner over the hip to the back panel's, a bow on the hip.
    co = panel.co
    cyc = M.centre_y(co[:, 2])
    for sg in (1, -1):
        fr = co[(co[:, 1] < cyc) & (co[:, 0] * sg > 0)]
        bk = co[(co[:, 1] > cyc) & (co[:, 0] * sg > 0)]
        # (Each panel's top corner: the highest point near its side edge.)
        fr = fr[fr[:, 0] * sg > (fr[:, 0] * sg).max() - 0.015]
        bk = bk[bk[:, 0] * sg > (bk[:, 0] * sg).max() - 0.015]
        fc = fr[np.argmax(fr[:, 2])]
        bc = bk[np.argmax(bk[:, 2])]
        z = (fc[2] + bc[2]) / 2 + 0.004
        hip = np.array([0.3 * sg, M.centre_y(z), z])
        hp, hn, _, _ = body.nearest_in(hip[None], HIPS)
        mid = hp[0]
        P, N = cord_path(body, [fc, (fc + mid) / 2, mid, (mid + bc) / 2, bc], 26, regions=HIPS)
        g.join(wo.tube(P, CORD_R, sides=6, part="trim", kind="cord"))
        j = len(P) // 2
        g.join(bow(P[j] + N[j] * (CORD_R + 0.002), N[j], np.array([0, -1.0, 0]), size=0.022, part="trim", radius=CORD_R * 0.9, tails=0.075))
    g.attrs = {k: v for k, v in g.attrs.items() if k.startswith("paint_")}
    wo.fit(g, body, clearance=0.0025, regions=("hips", "torso", "thighs"))
    return g


def swim_trunks(body, M):
    """Swim trunks (on her, short swim shorts): loose legs to mid-thigh with a stripe down each side, a
    drawstring waist tied at the front."""
    end = 0.45 if body.sex == "male" else 0.28
    g = legwear(body, M, end, 0.005, 0.013 if body.sex == "male" else 0.009, kind="cloth", decim=0.55, waist_lift=0.012)
    P0 = g.attrs["P0"]
    t, r, out, axis = M.leg_fields(P0)
    # The stripe: a band down the outside of each leg.
    sidedir = (out * np.stack([np.sign(P0[:, 0]), np.zeros(len(P0)), np.zeros(len(P0))], axis=1)).sum(1)
    on = g.split(sidedir - 0.8, edge_class="seam")
    for i in np.nonzero(on)[0]:
        g.part[i] = "trim"
    g.smooth_edges(rounds=3)
    P, N = waistband(g, M, 0.036, 0.005, part="cloth", kind="cloth")
    g.rim(depth=0.003, back=0.008, loops=[lp for lp in g.edge_loops() if g.co[lp, 2].mean() < M.crotch + 0.05])
    # The drawstring, tied in a bow at the front.
    j = int(np.argmin(P[:, 1] + np.abs(P[:, 0]) * 3))
    c = P[j] + N[j] * 0.006 - UP * 0.012
    g.join(bow(c, N[j], np.array([1.0, 0, 0]), size=0.018, part="laces", radius=0.0022, tails=0.09))
    wo.fit(g, body, loose=smoothstep(0.05, end, M.leg_fields(g.co)[0]) * (g.co[:, 2] < M.crotch), smooth_rounds=4, clearance=0.003)
    return g


def one_piece_swimsuit(body, M):
    """A one-piece swimsuit: high-cut legs, a scoop front, wide straps and a low back, edges bound."""
    apex = bust_marks(body, M)
    az = (apex["l"][2] + apex["r"][2]) / 2
    g = skin_patch(body, M, ["pelvis", "spine_01", "spine_02", "spine_03", "clavicle_l", "clavicle_r", "thigh_l", "thigh_r"], 0.0028, decim=0.55)
    g.kind = ["cloth"] * len(g.faces)
    P0 = g.attrs["P0"]
    cy = M.centre_y(P0[:, 2])
    back = smoothstep(-0.02, 0.03, P0[:, 1] - cy)
    x = np.abs(P0[:, 0])
    neck_front = az + 0.06 + 0.8 * x * x
    neck_back = M.waist_z + 0.13 + 1.4 * x * x
    top = neck_front * (1 - back) + neck_back * back
    # (Under the arms the edge comes down into a scoop, so the straps alone go over the shoulders.)
    top = np.minimum(top, az + 0.06 - 0.5 * np.maximum(x - 0.1, 0))
    f_leg = brief_field(body, M, P0, 9.0, 9.0, 2.6, 1.0, gusset=0.03)
    g.clip(np.maximum(P0[:, 2] - top, f_leg))
    P0 = g.attrs["P0"]
    # Keep the main piece only (the straps over the shoulders included).
    for i, fc in enumerate(g.faces):
        g.panel[i] = "back" if P0[fc, 1].mean() > M.centre_y(P0[fc, 2].mean()) else "front"
    g.smooth_edges(rounds=4)
    loops = [g.co[lp].copy() for lp in g.edge_loops()]
    g.rim(depth=0.0025, back=0.0)
    for P in loops:
        if len(P) < 6:
            continue
        c = P.mean(0)
        N = unit(P - c)
        P2, N2 = wo.clean_loop(P, N, 0.007)
        g.join(wo.tube(np.concatenate([P2, P2[:1]]), 0.0022, sides=5, part="trim", kind="cloth", caps=False, panel="binding"))
    # Straps: from the top edge in front over each shoulder to the top edge behind.
    for sg in (1, -1):
        xs = 0.088 * sg
        fp, _ = ray_onto(g, np.array([xs, -0.4, az + 0.06 + 0.8 * 0.088 ** 2 - 0.012]), (0, 1, 0), 0.0)
        bp, _ = ray_onto(g, np.array([xs, 0.4, M.waist_z + 0.13 + 1.4 * 0.088 ** 2 - 0.012]), (0, -1, 0), 0.0)
        sh = np.array([0.095 * sg, M.centre_y(M.shoulder_top), M.shoulder_top + 0.01])
        P, N = skin_path(body, [fp, sh + np.array([0, -0.05, -0.01]), sh, sh + np.array([0, 0.06, -0.03]), bp], 28, lift=0.003)
        g.join(wo.strip(P, N, 0.02, 0.003, part="trim", kind="cloth", closed=False, panel=f"strap{sg}"))
    g.attrs = {k: v for k, v in g.attrs.items() if k.startswith("paint_")}
    wo.fit(g, body, clearance=0.002)
    return g


# ── Casual tops ──────────────────────────────────────────────────────────────────────────────────────


def rib_edges(g, width=0.016, thickness=0.003, part="trim", kind="knit"):
    """Knitted rib bands over every open edge of a top, each lying just inside its edge."""
    loops = g.edge_loops()
    pts = [g.co[lp].copy() for lp in loops]
    nrm = g.vertex_normals()
    norms = [nrm[lp] for lp in loops]
    g.rim(depth=0.003, back=0.0)
    cz = g.co[:, 2].mean()
    for P, N in zip(pts, norms):
        if len(P) < 6:
            continue
        P2, N2 = wo.clean_loop(P, N, 0.01)
        c = P2.mean(0)
        if abs(c[0]) > 0.12:
            # (A sleeve or an armhole: the band lies towards the body.)
            want = unit(np.array([-np.sign(c[0]), 0, 0.3]))
        else:
            want = -UP if c[2] > cz else UP
        P2, N2 = oriented(P2, N2, want)
        g.join(wo.strip(P2 + N2 * 0.0008 + want * width * 0.38, N2, width, thickness, part=part, kind=kind, panel="rib"))


def crop_top(body, M):
    """A knitted crop top ending under the bust, sleeveless with wide shoulders, a scoop neck, ribbed
    edges."""
    apex = bust_marks(body, M)
    az = (apex["l"][2] + apex["r"][2]) / 2
    hem = az - (0.1 if body.sex == "female" else 0.12)
    g, zn = top_shell(body, M, hem, sleeve_t=None, kind="knit", torso_off=0.0045, waist_off=0.005, drape_off=0.0, neck_lift=0.004, decim=0.7, scoop=0.05)
    g.smooth_edges(rounds=3)
    rib_edges(g)
    wo.fit(g, body, clearance=0.003)
    return g


def tank_top(body, M):
    """A knitted tank top to the hips: deep armholes, a scoop neck, ribbed edges, hanging loose below the
    chest."""
    g, zn = top_shell(body, M, M.crotch + 0.07, sleeve_t=None, kind="knit", torso_off=0.0045, waist_off=0.006, drape_off=0.0, neck_lift=0.004, decim=0.6, scoop=0.07)
    wo.drape(g, body, M.centre_y, M.waist_z, M.crotch, 0.008, slope=0.5)
    g.smooth_edges(rounds=3)
    rib_edges(g)
    wo.fit(g, body, loose=smoothstep(M.chest_z, M.crotch, g.co[:, 2]) * 0.5, smooth_rounds=4, clearance=0.003)
    return g


def t_shirt(body, M):
    """A linen T-shirt (a short-sleeved shift): to the hips, sleeves to mid upper arm, a round neck with a
    narrow band, stitched hems."""
    g, zn = top_shell(body, M, M.crotch + 0.06, sleeve_t=0.5, kind="linen", torso_off=0.0055, waist_off=0.008, sleeve_off=0.009, drape_off=0.0, neck_lift=0.006, decim=0.6)
    wo.drape(g, body, M.centre_y, M.waist_z, M.crotch, 0.011, slope=0.5)
    P0 = g.attrs["P0"]
    t, r, out, axis = M.arm_fields(P0)
    sleeve = smoothstep(-0.02, 0.03, M.armhole(P0))
    fwd = np.array([0, -1, 0])
    a = np.arctan2((out * np.cross(axis, fwd)).sum(1), (out * fwd).sum(1))
    ang = mo.angle_round(P0, np.array([0, M.centre_y(M.crotch), 0]))
    hang = 0.004 * np.sin(ang * 7 + 0.8 * np.sin(ang * 3)) * smoothstep(M.waist_z + 0.05, M.crotch, P0[:, 2]) * (1 - sleeve)
    wave = 0.003 * np.sin(a * 4 + 1.0) * sleeve * smoothstep(0.1, 0.45, t)
    g.displace(hang + wave)
    g.smooth_edges(rounds=3)
    neck = mo.loop_by(g, lambda p: p[:, 2].mean())
    neck_pts = g.co[neck].copy()
    nrm = g.vertex_normals()[neck]
    g.rim(depth=0.003, back=0.01)
    P2, N2 = wo.clean_loop(neck_pts, nrm, 0.01)
    P2, N2 = oriented(P2, N2, -UP)
    g.join(wo.strip(P2 + N2 * 0.0008 - UP * 0.006, N2, 0.016, 0.003, part="cloth", kind="linen", panel="neckband"))
    wo.fit(g, body, loose=smoothstep(M.waist_z, M.crotch, g.co[:, 2]) * (1 - smoothstep(-0.02, 0.03, M.armhole(g.co))), smooth_rounds=5, clearance=0.003)
    return g


def blouse(body, M):
    """A linen peasant blouse: a wide scoop neck gathered on a drawstring tied at the front, full puffed
    sleeves gathered into cuffs below the elbow, tucked in at the waist."""
    g, zn = top_shell(body, M, M.waist_z - 0.05, sleeve_t=1.2, kind="linen", torso_off=0.007, waist_off=0.01, sleeve_off=0.012, drape_off=0.0, neck_lift=-0.03, decim=0.6, scoop=0.05)
    mo.puff_sleeves(g, M, 0.02, 1.15, 0.02, gathers=16)
    P0 = g.attrs["P0"]
    # Gathers round the neckline, fading down the chest.
    zn_p = zn(P0)
    a = np.arctan2(P0[:, 0] - M.neck[0], -(P0[:, 1] - M.neck[1]))
    near = smoothstep(zn_p - 0.08, zn_p - 0.005, P0[:, 2]) * (np.abs(P0[:, 0]) < 0.16)
    g.displace(0.0022 * np.sin(a * 26) * near)
    g.smooth_edges(rounds=3)
    loops = g.edge_loops()
    neck = max(loops, key=lambda lp: g.co[lp, 2].mean())
    neck_pts = g.co[neck].copy()
    neck_n = g.vertex_normals()[neck]
    cuffs = sorted(loops, key=lambda lp: -abs(g.co[lp, 0].mean()))[:2]
    cuff_pts = [g.co[lp].copy() for lp in cuffs]
    g.rim(depth=0.003, back=0.01)
    # The drawstring: a cord in the neckline's casing, tied at the front.
    P2, N2 = wo.clean_loop(neck_pts, neck_n, 0.008)
    g.join(wo.tube(np.concatenate([P2, P2[:1]]) + np.concatenate([N2, N2[:1]]) * 0.002 - UP * 0.008, 0.0018, sides=5, part="laces", kind="cord", caps=False))
    j = int(np.argmin(P2[:, 1] + np.abs(P2[:, 0]) * 2))
    g.join(bow(P2[j] + N2[j] * 0.004 - UP * 0.01, N2[j], np.array([1.0, 0, 0]), size=0.02, part="laces", radius=0.0018, tails=0.1))
    for P in cuff_pts:
        s = "l" if P[:, 0].mean() > 0 else "r"
        S, E, W = M.arm_joints(s)
        d = unit(W - E)
        _, _, oo, _ = limb(P, M.arm_joints(s))
        P, N = wo.resample(P, oo, 0.01)
        P, N = oriented(P, N, -d)
        g.join(wo.strip(P - d * 0.012, N, 0.03, 0.003, part="cloth", kind="linen", panel=f"cuff_{s}"))
    wo.fit(g, body, clearance=0.003)
    return g


def front_opening(g, M, half_width, z_top, z_bottom, edge_class="hem"):
    """Cuts a front opening (half its width at each height, half_width(z)) from z_bottom up through the
    neckline."""
    P0 = g.attrs["P0"]
    front = P0[:, 1] < M.centre_y(P0[:, 2])
    f = np.where(front & (P0[:, 2] > z_bottom), half_width(P0[:, 2]) - np.abs(P0[:, 0]), -1.0)
    g.clip(f, edge_class=edge_class)


def vest(body, M):
    """On her a laced bodice of velvet: a low square-ish neck, laced shut down the front over a gap, a
    point at the front of the waist; on him a waistcoat: a deep V neck, buttoned down the front, two points
    at the hem and welt pockets. Both worn over a shirt or blouse."""
    female = body.sex == "female"
    hem = M.waist_z - (0.05 if female else 0.1)
    g, zn = top_shell(body, M, hem - 0.06, sleeve_t=None, kind="velvet" if female else "wool", torso_off=0.011, waist_off=0.011, drape_off=0.0, neck_lift=0.012, decim=0.6, scoop=0.1 if female else 0.0)
    P0 = g.attrs["P0"]
    front = P0[:, 1] < M.centre_y(P0[:, 2])
    x = np.abs(P0[:, 0])
    if female:
        point = hem - 0.06 * np.exp(-((x / 0.07) ** 2)) * front
    else:
        point = hem - 0.05 * np.exp(-(((x - 0.06) / 0.04) ** 2)) * front
    g.clip(point - P0[:, 2])
    P0 = g.attrs["P0"]
    if female:
        top_z = float(zn(M.neck[None] + np.array([[0, -0.08, 0]]))[0]) - 0.1
        front_opening(g, M, lambda z: 0.012 + 0.006 * smoothstep(hem, top_z, z), hem - 0.1, top_z)
    else:
        vz_top = M.neck[2] - 0.02
        vz_bot = M.chest_z - 0.07
        front_opening(g, M, lambda z: 0.004 + 0.075 * smoothstep(vz_bot, vz_top, z) ** 1.3, hem - 0.2, vz_bot)
    g.smooth_edges(rounds=3)
    edges = [g.co[lp].copy() for lp in g.edge_loops()]
    g.rim(depth=0.004, back=0.008)
    for P in edges:
        if len(P) < 6:
            continue
        c = P.mean(0)
        N = unit(P - c)
        P2, N2 = wo.clean_loop(P, N, 0.012)
        P2, N2 = oriented(P2, N2, -UP if c[2] > M.chest_z else UP)
        T = np.roll(P2, -1, 0) - P2
        B = unit(np.cross(N2, T))
        g.join(wo.strip(P2 + N2 * 0.001 + B * 0.004, N2, 0.012, 0.003, part="trim", kind="embroidery" if female else "cloth", panel="binding"))
    if female:
        top_z = float(zn(M.neck[None] + np.array([[0, -0.08, 0]]))[0]) - 0.11
        lacing(g, M, top_z, hem - 0.03, lambda z: 0.012 + 0.006 * smoothstep(hem, top_z, z), rows=7, ends=0.09)
    else:
        for z in np.linspace(M.chest_z - 0.08, hem - 0.015, 5):
            p, n = ray_onto(g, np.array([0.012, M.centre_y(z) - 0.3, z]), (0, 1, 0), 0.001)
            g.join(wo.stud(p, n, 0.0065, 0.003, part="metal", kind="engraved", sides=10))
        for sg in (1, -1):
            z = M.waist_z + 0.02
            p, n = ray_onto(g, np.array([0.085 * sg, M.centre_y(z) - 0.3, z]), (0, 1, 0), 0.0015)
            side = unit(np.cross(n, UP))
            pts = np.array([p - side * 0.045, p, p + side * 0.045])
            g.join(wo.strip(pts, np.repeat(n[None], 3, 0), 0.012, 0.003, part="trim", kind="cloth", closed=False, panel="welt"))
    wo.fit(g, body, clearance=0.006)
    return g


def corset(body, M):
    """An underbust corset of leather worn over a blouse or shirt: shaped panels with boning channels
    between them, a point at the front below, bound edges, laced up the front through brass eyelets."""
    female = body.sex == "female"
    apex = bust_marks(body, M)
    az = (apex["l"][2] + apex["r"][2]) / 2
    z_top = az - (0.075 if female else 0.04)
    z_bot = M.waist_z - 0.11
    bones = ["spine_01", "spine_02", "spine_03", "pelvis"]
    keep = np.isin(body.bone, bones) & (body.co[:, 2] < z_top + 0.06) & (body.co[:, 2] > z_bot - 0.08)
    g = wo.decimate(wo.Geo.from_body(body, body_polys(body, keep)), 0.6)
    g.part = ["leather"] * len(g.faces)
    g.kind = ["leather"] * len(g.faces)
    g.attrs["P0"] = g.co.copy()
    # (Over a blouse or shirt and the top of a skirt.)
    wo.wrap(g, body, 0.015, rounds=25, factor=0.5)
    P0 = g.attrs["P0"]
    cy = M.centre_y(P0[:, 2])
    front = P0[:, 1] < cy
    x = np.abs(P0[:, 0])
    # The top: higher under the bust at the front, a little dip between; lower behind. The bottom: a point
    # at the front, rising over the hips.
    top = z_top + 0.025 * smoothstep(0.02, 0.1, x) * front - 0.02 * (~front) + 0.03 * np.exp(-((x / 0.03) ** 2)) * front
    g.clip(P0[:, 2] - top)
    P0 = g.attrs["P0"]
    x = np.abs(P0[:, 0])
    front = P0[:, 1] < M.centre_y(P0[:, 2])
    bot = z_bot - 0.045 * np.exp(-((x / 0.06) ** 2)) * front + 0.02 * smoothstep(0.05, 0.14, x)
    g.clip(bot - P0[:, 2])
    P0 = g.attrs["P0"]
    front_opening(g, M, lambda z: 0.01 + 0 * z, z_bot - 0.2, z_top)
    # Panels round the body, a boning channel (a raised ridge) on each seam.
    # (Each cut a plane through the body's vertical axis, so it makes two seams half a turn apart.)
    seams = np.array([0.45, 1.0, math.pi / 2, math.pi - 1.0, math.pi - 0.45])
    for a0 in seams:
        Q = g.attrs["P0"]
        g.split(Q[:, 0] * math.cos(a0) + (Q[:, 1] - M.centre_y(Q[:, 2])) * math.sin(a0), edge_class="seam")
    P0 = g.attrs["P0"]
    ridge = np.zeros(g.n)
    ang = np.arctan2(P0[:, 0], -(P0[:, 1] - M.centre_y(P0[:, 2])))
    for a0 in seams:
        for sg in (1, -1):
            d = np.abs(np.angle(np.exp(1j * (ang - sg * a0))))
            ridge = np.maximum(ridge, np.exp(-((d / 0.05) ** 2)))
    k = np.digitize(np.abs(ang), seams)
    for i, fc in enumerate(g.faces):
        g.panel[i] = f"panel{int(np.round(k[fc].mean()))}{'l' if P0[fc, 0].mean() > 0 else 'r'}"
    g.displace(0.0025 * ridge)
    g.smooth_edges(rounds=3)
    edges = [g.co[lp].copy() for lp in g.edge_loops()]
    g.rim(depth=0.005, back=0.008)
    for P in edges:
        if len(P) < 6:
            continue
        c = P.mean(0)
        N = unit(P - c)
        P2, N2 = wo.clean_loop(P, N, 0.01)
        P2, N2 = oriented(P2, N2, -UP if c[2] > (z_top + z_bot) / 2 else UP)
        T = np.roll(P2, -1, 0) - P2
        B = unit(np.cross(N2, T))
        g.join(wo.strip(P2 + N2 * 0.001 + B * 0.004, N2, 0.012, 0.003, part="trim", kind="leather", panel="binding"))
    lacing(g, M, z_top - 0.02, z_bot - 0.01, lambda z: 0.01 + 0 * z, rows=7, ends=0.1)
    wo.fit(g, body, clearance=0.008)
    return g


# ── Bottoms ──────────────────────────────────────────────────────────────────────────────────────────


def shorts(body, M):
    """Canvas shorts to above the knee: roomy legs with turned-up cuffs, a waistband and a laced fly."""
    g = legwear(body, M, 0.62, 0.0055, 0.012, kind="canvas", decim=0.55)
    P0 = g.attrs["P0"]
    t, r, out, axis = M.leg_fields(P0)
    crease = 0.002 * np.sin(np.arctan2(out[:, 0], -out[:, 1]) * 3 + t * 9) * smoothstep(0.1, 0.5, t) * (P0[:, 2] < M.crotch)
    g.displace(crease)
    g.smooth_edges(rounds=3)
    loops = g.edge_loops()
    cuffs = [g.co[lp].copy() for lp in loops if g.co[lp, 2].mean() < M.crotch - 0.05]
    P, N = waistband(g, M, 0.036, 0.005, part="cloth", kind="canvas")
    g.rim(depth=0.003, back=0.008)
    for C in cuffs:
        s = "l" if C[:, 0].mean() > 0 else "r"
        K = M.J[f"calf_{s}"]
        H = M.J[f"thigh_{s}"]
        d = unit(K - H)
        c = C.mean(0)
        outw = unit((C - c) - np.outer((C - c) @ d, d))
        P2, N2 = wo.clean_loop(C + outw * 0.003, outw, 0.012)
        P2, N2 = oriented(P2, N2, -d)
        g.join(wo.strip(P2 - d * 0.02, N2, 0.042, 0.005, part="cloth", kind="canvas", panel=f"cuff_{s}"))
    zt = float(P[:, 2].mean()) - 0.045
    lacing(g, M, zt, zt - 0.07, lambda z: 0.004 + 0 * z, rows=3, ends=0.06)
    wo.fit(g, body, loose=smoothstep(0.05, 0.6, M.leg_fields(g.co)[0]) * (g.co[:, 2] < M.crotch) * 0.6, smooth_rounds=4, clearance=0.003)
    return g


def waist_top(body, M):
    waist = region_top(body, M, ["hips"], lift=0.012, below=M.J["spine_02"][2])
    return float(waist(np.array([[0.0, M.centre_y(M.waist_z) - 0.2, M.waist_z]]))[0])


def short_skirt(body, M):
    """A short wool skirt to mid-thigh, gathered at the waistband, hanging in real folds, an embroidered
    band at the hem."""
    zt = waist_top(body, M)
    g = sim_skirt(body, M, zt, M.crotch - 0.2, offset=0.014, flare=0.45, around=64, kind="wool", band=2, seed=21, gores=6)
    top = g.co[g.attrs["ring"][:, 0] == 0].copy()
    g.rim(depth=0.004, back=0.008, loops=[lp for lp in g.edge_loops() if g.co[lp, 2].mean() < zt - 0.15])
    mo.gathered_band(g, M, top, 0.036, 0.004, part="trim", kind="cloth")
    g.attrs.pop("ring", None)
    wo.fit(g, body, loose=smoothstep(zt - 0.08, zt - 0.3, g.co[:, 2]), smooth_rounds=12, clearance=0.004)
    return g


def pleated_skirt(body, M):
    """A knee-length skirt of tartan wool in knife pleats, stitched down over the hips and swinging free
    below, on a waistband."""
    zt = waist_top(body, M)
    zb = M.J["calf_l"][2] - 0.02
    around, pleats = 120, 24
    z_end = zb
    g = mo.skirt_loft(body, M, zt, z_end, 0.016, flare=0.16, around=around, kind="plaid", folds=0.0, panel="skirt", ring_step=0.025)
    # Knife pleats: round the skirt each pleat a slope out and a sharp step back, pressed flat over the hips
    # and opening below them; the hem swings a little.
    ang = g.attrs["angle"][:, 0]
    saw = (ang / (2 * math.pi) * pleats) % 1.0
    saw = np.where(saw < 0.82, saw / 0.82, (1 - saw) / 0.18)
    open_ = smoothstep(zt - 0.05, zt - 0.2, g.co[:, 2])
    depth = 0.006 + 0.012 * open_
    cen = np.stack([np.zeros(g.n), M.centre_y(np.clip(g.co[:, 2], M.crotch, None)), g.co[:, 2]], axis=1)
    radial = unit((g.co - cen) * np.array([1, 1, 0]))
    sway = 0.01 * np.sin(ang + 0.6) * smoothstep(zt - 0.2, z_end, g.co[:, 2])
    g.co += radial * (depth * (saw - 0.5) * (0.35 + 0.65 * open_) + sway)[:, None]
    mo.gore_uvs(g, around, 8, "skirt")
    ring = g.attrs["ring"][:, 0]
    wo.keep_outside(g, mo.body_geo(body), 0.01, reach=0.1)
    mo.mark_seams(g)
    top = g.co[ring == 0].copy()
    g.rim(depth=0.004, back=0.008, loops=[lp for lp in g.edge_loops() if g.co[lp, 2].mean() < zt - 0.15])
    mo.gathered_band(g, M, top, 0.04, 0.004, part="cloth", kind="plaid")
    g.attrs.pop("ring", None)
    wo.fit(g, body, loose=smoothstep(zt - 0.12, zt - 0.4, g.co[:, 2]), smooth_rounds=12, clearance=0.004)
    return g


def leggings(body, M):
    """Knitted leggings, close from the waist to the ankles, a knitted waistband."""
    g = legwear(body, M, 2.0, 0.0035, 0.0035, kind="knit", decim=1.0, ankle=True, rounds=8, waist_lift=0.012)
    g.smooth_edges(rounds=3)
    loops = g.edge_loops()
    ankles = [g.co[lp].copy() for lp in loops if g.co[lp, 2].mean() < 0.3]
    waistband(g, M, 0.04, 0.003, part="trim", kind="knit", lift=0.001)
    g.rim(depth=0.0025, back=0.0)
    for C in ankles:
        c = C.mean(0)
        N = unit((C - c) * np.array([1, 1, 0]))
        P2, N2 = wo.clean_loop(C, N, 0.01)
        P2, N2 = oriented(P2, N2, UP)
        g.join(wo.strip(P2 + N2 * 0.0008 + UP * 0.008, N2, 0.022, 0.0025, part="trim", kind="knit", panel="cuff"))
    wo.fit(g, body, clearance=0.002)
    return g


def hanging_flap(body, M, top_pts, top_nrm, length, rows=None, ragged=0.0, kind="suede", part="cloth", seed=0, bending=1.0, colliders=()):
    """A flap of cloth or hide hanging from a row of points (a belt's front), `length` long, draped with
    the cloth simulation, its top row held. Returns the Geo."""
    k = len(top_pts)
    rows = rows or max(6, int(length / 0.02))
    co, faces, uv = [], [], []
    seg = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(top_pts, axis=0), axis=1))])
    for i in range(rows + 1):
        for j in range(k):
            co.append(top_pts[j] + top_nrm[j] * 0.004 * (i > 0) - UP * length * i / rows)
    for i in range(rows):
        for j in range(k - 1):
            a, b, c, d = i * k + j, i * k + j + 1, (i + 1) * k + j + 1, (i + 1) * k + j
            faces.append([a, d, c, b])
            uv.append([(seg[j], -length * i / rows), (seg[j], -length * (i + 1) / rows), (seg[j + 1], -length * (i + 1) / rows), (seg[j + 1], -length * i / rows)])
    g = wo.Geo(np.array(co), faces, part=part, kind=kind, panel="flap", down=(0, 0, -1))
    g.uv = uv
    row = np.repeat(np.arange(rows + 1), k).astype(float)
    g.attrs["row"] = row[:, None]
    # (Facing outward: turn the faces if they face the body.)
    nrm = g.vertex_normals()
    if ((nrm * top_nrm[np.tile(np.arange(k), rows + 1)]).sum(1)).mean() < 0:
        g.faces = [f[::-1] for f in g.faces]
        g.uv = [list(reversed(u)) for u in g.uv]
    wo.cloth_sim(g, body, (row == 0).astype(float), frames=70, bending=bending, mass=0.35, noise=0.003, seed=seed, tension=60, colliders=colliders)
    if ragged:
        rng = np.random.default_rng(seed)
        jag = np.interp(np.arange(k), np.arange(0, k, 2), rng.random(len(range(0, k, 2))) * ragged)
        g.clip(np.where(row > rows - 3, (row - rows) * (length / rows) + np.tile(jag, rows + 1), -1.0))
    return g


def brief(body, M, kind="linen", part="under", offset=0.004, top_front=None, top_back=None):
    """A plain brief (a loincloth's wrap, the base of armour below): front, back and gusset."""
    g = skin_patch(body, M, ["pelvis", "thigh_l", "thigh_r", "spine_01"], offset, decim=0.55)
    g.part = [part] * len(g.faces)
    g.kind = [kind] * len(g.faces)
    P0 = g.attrs["P0"]
    g.clip(brief_field(body, M, P0, top_front or M.crotch + 0.11, top_back or M.crotch + 0.14, 1.0, 0.55, gusset=0.035))
    for i in range(len(g.faces)):
        g.panel[i] = "brief"
    g.smooth_edges(rounds=3)
    g.rim(depth=0.003, back=0.006)
    return g


def loincloth(body, M):
    """A barbarian's loincloth: a wrap of rough linen, a thick leather belt with a bronze buckle, and a
    flap of hide hanging before and behind to the knee, draped, its lower edge left ragged."""
    zb = M.crotch + 0.115
    g = brief(body, M, kind="linen", part="under", offset=0.004, top_front=M.crotch + 0.08, top_back=M.crotch + 0.1)
    P, N = skin_ring(body, M, zb, lift=0.012, n=56, tilt=0.03)
    P, N = oriented(P, N, UP)
    g.join(wo.strip(P, N, 0.05, 0.007, part="belt", kind="leather", panel="belt"))
    j = int(np.argmin(P[:, 1]))
    g.join(wo.box_ring(P[j] + N[j] * 0.009, N[j], UP, 0.06, 0.06, 0.009, 0.005, part="metal", kind="metal"))
    for sg, width, length, seed in ((-1, 0.28, 0.44, 3), (1, 0.32, 0.48, 4)):
        a = np.arctan2(P[:, 0], -(P[:, 1] - M.centre_y(P[:, 2])))
        target = 0.0 if sg < 0 else math.pi
        d = np.abs(np.angle(np.exp(1j * (a - target))))
        sel = np.nonzero(d < 1.2)[0]
        Q, QN = P[sel], N[sel]
        order = np.argsort(np.angle(np.exp(1j * (a[sel] - target))))
        Q, QN = Q[order], QN[order]
        s_ = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(Q, axis=0), axis=1))])
        mid = s_[-1] / 2
        keep = np.abs(s_ - mid) < width / 2
        Q, QN = wo.resample(Q[keep], QN[keep], width / 12, closed=False)
        top = Q - UP * 0.02 + QN * 0.008
        flap = hanging_flap(body, M, top, QN, length, kind="suede", part="cloth", seed=seed, ragged=0.04, bending=1.5)
        flap.attrs = {}
        mo.lined(flap, part="cloth", kind="suede", depth=0.003)
        g.join(flap)
    g.attrs = {k: v for k, v in g.attrs.items() if k.startswith("paint_")}
    wo.fit(g, body, loose=smoothstep(zb - 0.05, zb - 0.3, g.co[:, 2]), smooth_rounds=8, clearance=0.003)
    return g


# ── Robes and long wear ──────────────────────────────────────────────────────────────────────────────


def bell_sleeve(body, M, s, t0, t1, r0, r1, around=24, kind="wool", part="cloth", seed=0, drape=True):
    """A bell sleeve round one arm from t0 to t1 along it (1 the elbow, 2 the wrist), r0 off the arm at its
    top, flaring to r1 at its end, draped with its top held, so it hangs."""
    J = M.arm_joints(s)
    ts = np.linspace(t0, t1, max(4, int((t1 - t0) * 0.25 / 0.02)))

    def at(t):
        i = min(int(t), 1)
        return J[i] + (J[i + 1] - J[i]) * (t - i)

    path = np.array([at(t) for t in ts])
    sg = 1 if s == "l" else -1
    pts = body.co[M.surf & np.isin(body.region, ["upperarms", "forearms", "hands"]) & (body.co[:, 0] * sg > 0)]

    def rad(i, angles, c, T, e1, e2):
        sel = pts[np.abs((pts - c) @ T) < 0.015]
        base = wo.ray_hull(wo.hull2(np.stack([(sel - c) @ e1, (sel - c) @ e2], axis=1)), angles) if len(sel) > 3 else np.full(len(angles), 0.04)
        f = (ts[i] - t0) / (t1 - t0)
        return np.maximum(base + r0, 0.0) * (1 - f) + (base.mean() * 0.6 + r1) * f

    g = wo.loft(path, around, rad, up_hint=(0, 0, 1), seam_angle=math.pi, part=part, kind=kind, panel=f"sleeve_{s}", down=tuple(unit(J[2] - J[0])))
    if drape:
        ring = g.attrs["ring"][:, 0]
        wo.cloth_sim(g, body, smoothstep(1.5, 0.5, ring), frames=60, bending=0.4, mass=0.25, noise=0.003, seed=seed, tension=50)
    return g


def robe(body, M):
    """A mage's robe to the floor: a fitted wool bodice with a standing embroidered collar and an embroidered
    placket down the front, sleeves widening into deep bell sleeves that hang from the elbow, a skirt
    falling in real folds to an embroidered hem band, and a cord girdle with tasselled ends."""
    waist = M.waist_z
    g, zn = top_shell(body, M, waist - 0.02, sleeve_t=1.0, kind="wool", torso_off=0.009, waist_off=0.01, sleeve_off=0.012, drape_off=0.0, neck_lift=0.01, decim=0.28)
    g.smooth_edges(rounds=3)
    loops = g.edge_loops()
    neck = max(loops, key=lambda lp: g.co[lp, 2].mean())
    neck_pts = g.co[neck].copy()
    neck_n = g.vertex_normals()[neck]
    g.rim(depth=0.004, back=0.0)
    for s in ("l", "r"):
        sl = bell_sleeve(body, M, s, 0.88, 2.2, 0.026, 0.13, around=20, seed=13 if s == "l" else 14)
        sl.rim(depth=0.004, back=0.01, loops=[lp for lp in sl.edge_loops() if abs(sl.co[lp, 0].mean()) > abs(M.J[f"lowerarm_{s}"][0]) + 0.05])
        sl.attrs = {}
        g.join(sl)
        S, E, W = M.arm_joints(s)
        c = S + (E - S) * 0.9
        ring = []
        d = unit(E - S)
        e1 = unit(np.cross(d, UP))
        e2 = np.cross(d, e1)
        for a in np.linspace(0, 2 * math.pi, 24, endpoint=False):
            dv = e1 * math.cos(a) + e2 * math.sin(a)
            p, n = ray_onto(g, c + dv * 0.3, -dv, 0.0015)
            ring.append((p, n))
        P = np.array([p for p, n in ring])
        N = np.array([n for p, n in ring])
        P, N = oriented(P, N, d)
        g.join(wo.strip(P, N, 0.035, 0.003, part="trim", kind="embroidery", panel="sleeveband"))
    sk = sim_skirt(body, M, waist + 0.01, 0.05, offset=0.02, flare=0.4, around=52, ring_step=0.034, kind="wool", band=2, seed=31, gores=6)
    sk.rim(depth=0.004, back=0.008, loops=[lp for lp in sk.edge_loops() if sk.co[lp, 2].mean() < 0.4])
    sk.attrs.pop("ring", None)
    g.join(sk)
    # The standing collar and the placket down the front of the bodice.
    P2, N2 = wo.clean_loop(neck_pts, neck_n, 0.01)
    P2, N2 = oriented(P2, N2, UP)
    g.join(wo.strip(P2 + N2 * 0.0015 + UP * 0.012, unit(N2 + UP * 0.25), 0.032, 0.004, part="trim", kind="embroidery", panel="collar"))
    pl = []
    for z in np.linspace(float(neck_pts[:, 2].min()) - 0.005, waist - 0.01, 14):
        p, n = ray_onto(g, np.array([0, M.centre_y(z) - 0.4, z]), (0, 1, 0), 0.0015)
        pl.append((p, n))
    P = np.array([p for p, n in pl])
    N = np.array([n for p, n in pl])
    g.join(wo.strip(P, N, 0.05, 0.003, part="trim", kind="embroidery", closed=False, panel="placket"))
    # The girdle: a cord round the waist, knotted at the front, its ends hanging with tassels.
    gp, gn = skin_ring(body, M, waist + 0.0, lift=0.03, n=48)
    g.join(wo.tube(np.concatenate([gp, gp[:1]]), 0.0055, sides=6, part="cord", kind="cord", caps=False))
    j = int(np.argmin(gp[:, 1] + np.abs(gp[:, 0]) * 2))
    k0 = gp[j] + gn[j] * 0.006
    g.join(wo.stud(k0, gn[j], 0.011, 0.008, part="cord", kind="cord", sides=8))
    for sg, length in ((1, 0.42), (-1, 0.36)):
        end = k0 + np.array([0.02 * sg, -0.012, -length])
        pts = bezier([k0, k0 + np.array([0.01 * sg, -0.02, -length * 0.4]), end], 14)
        g.join(wo.tube(pts, 0.0045, sides=6, part="cord", kind="cord"))
        tassel = wo.loft(np.array([end, end - UP * 0.03, end - UP * 0.075]), 8, lambda i, a, c, T, e1, e2: np.full(len(a), [0.007, 0.012, 0.016][i]), up_hint=(0, -1, 0), closed_start=True, closed_end=True, part="cord", kind="cord", panel="tassel")
        g.join(tassel)
    g.attrs = {k: v for k, v in g.attrs.items() if k.startswith("paint_")}
    arm_loose = smoothstep(1.2, 1.8, M.arm_fields(g.co)[0]) * (np.abs(g.co[:, 0]) > 0.15)
    wo.fit(g, body, loose=np.maximum(smoothstep(waist, waist - 0.3, g.co[:, 2]), arm_loose), smooth_rounds=12, clearance=0.004)
    return g


def long_coat(body, M):
    """A travelling coat of heavy wool: fitted to the waist with a turned-down collar and the front open in a
    V over the shirt, buttoned below it, full sleeves with deep turned-back cuffs, and long lined skirts
    split at the front and with a vent behind, hanging in real folds to below the knee."""
    waist = M.waist_z
    # (Roomy enough to go over a shirt: its sleeves and the drape below the chest.)
    g, zn = top_shell(body, M, waist - 0.02, sleeve_t=1.98, kind="wool", torso_off=0.014, waist_off=0.016, sleeve_off=0.017, drape_off=0.0, neck_lift=0.014, decim=0.3)
    vz_top = M.neck[2] + 0.02
    vz_bot = M.chest_z - 0.04
    front_opening(g, M, lambda z: 0.006 + 0.07 * smoothstep(vz_bot, vz_top, z) ** 1.2, waist - 0.2, vz_bot)
    g.smooth_edges(rounds=3)
    loops = g.edge_loops()
    cuffs = sorted(loops, key=lambda lp: -abs(g.co[lp, 0].mean()))[:2]
    cuff_pts = [g.co[lp].copy() for lp in cuffs]
    neck = max(loops, key=lambda lp: g.co[lp, 2].mean())
    neck_pts = g.co[neck].copy()
    neck_n = g.vertex_normals()[neck]
    g.rim(depth=0.004, back=0.012)
    zb = M.J["calf_l"][2] - 0.1
    sk = sim_skirt(body, M, waist + 0.012, zb, offset=0.024, flare=0.36, around=42, ring_step=0.032, kind="wool", seed=41, gores=6, open_front=lambda z: 0.16 + 0.22 * smoothstep(waist, zb, z), slits=[(math.pi, 0.32)])
    sk.attrs = {}
    mo.lined(sk, part="lining", kind="cloth", depth=0.003, edge_kind="wool", edge_part="cloth")
    g.join(sk)
    # The collar: a band standing at the back and turning down over the shoulders, lapels along the V.
    P2, N2 = wo.clean_loop(neck_pts, neck_n, 0.012)
    c = P2.mean(0)
    outward = unit((P2 - c) * np.array([1, 1, 0]))
    P2, N2 = oriented(P2, unit(outward + UP * 0.6), -UP)
    g.join(wo.strip(P2 + outward * 0.008 - UP * 0.01, unit(outward + UP * 0.6), 0.055, 0.005, part="trim", kind="wool", panel="collar"))
    for P in cuff_pts:
        s = "l" if P[:, 0].mean() > 0 else "r"
        S, E, W = M.arm_joints(s)
        d = unit(W - E)
        _, _, oo, _ = limb(P, M.arm_joints(s))
        P, N = wo.resample(P + oo * 0.004, oo, 0.012)
        P, N = oriented(P, N, -d)
        g.join(wo.strip(P - d * 0.03, N, 0.07, 0.006, part="trim", kind="wool", panel=f"cuff_{s}"))
        for k in range(2):
            pp = P[int(np.argmax(P[:, 2]))] - d * (0.02 + 0.03 * k) + N[int(np.argmax(P[:, 2]))] * 0.007
            g.join(wo.stud(pp, N[int(np.argmax(P[:, 2]))], 0.0055, 0.003, part="metal", kind="metal", sides=8))
    for z in np.linspace(vz_bot - 0.01, waist + 0.02, 4):
        for sg in (1, -1):
            p, n = ray_onto(g, np.array([0.03 * sg, M.centre_y(z) - 0.4, z]), (0, 1, 0), 0.001)
            g.join(wo.stud(p, n, 0.0075, 0.0035, part="metal", kind="engraved", sides=10))
    # A belt at the waist over the join, buckled.
    mo.belt(g, M, waist + 0.006, width=0.04, thickness=0.005, lift=0.007, part="belt")
    g.attrs = {k: v for k, v in g.attrs.items() if k.startswith("paint_")}
    wo.fit(g, body, loose=smoothstep(waist, waist - 0.3, g.co[:, 2]), smooth_rounds=12, clearance=0.005)
    return g


def gown(body, M):
    """An elegant gown: a fitted velvet bodice with a low square neckline edged in embroidery, long fitted
    sleeves ending in hanging trumpet cuffs, a full silk skirt to the floor falling in deep folds, and a
    girdle of engraved gold plaques low on the hips, its end hanging to the knee."""
    waist = M.waist_z
    g, zn = top_shell(body, M, waist - 0.02, sleeve_t=1.75, kind="velvet", part="bodice", torso_off=0.007, waist_off=0.008, sleeve_off=0.008, drape_off=0.0, neck_lift=-0.012, decim=0.3, scoop=0.08)
    # A little fullness at the top of each sleeve.
    mo.puff_sleeves(g, M, -0.02, 0.5, 0.012, gathers=10)
    P0 = g.attrs["P0"]
    g.smooth_edges(rounds=3)
    loops = g.edge_loops()
    neck = max(loops, key=lambda lp: g.co[lp, 2].mean())
    neck_pts = g.co[neck].copy()
    neck_n = g.vertex_normals()[neck]
    g.rim(depth=0.003, back=0.008)
    for s in ("l", "r"):
        sl = bell_sleeve(body, M, s, 1.7, 2.18, 0.012, 0.075, around=24, kind="silk", part="cloth", seed=51 if s == "l" else 52)
        sl.rim(depth=0.003, back=0.008, loops=[lp for lp in sl.edge_loops() if abs(sl.co[lp, 0].mean()) > abs(M.J[f"hand_{s}"][0]) - 0.04])
        sl.attrs = {}
        g.join(sl)
    sk = sim_skirt(body, M, waist + 0.01, 0.03, offset=0.012, flare=0.6, around=56, ring_step=0.034, kind="silk", band=2, seed=61, gores=8, bending=0.15)
    sk.rim(depth=0.003, back=0.008, loops=[lp for lp in sk.edge_loops() if sk.co[lp, 2].mean() < 0.4])
    sk.attrs.pop("ring", None)
    g.join(sk)
    P2, N2 = wo.clean_loop(neck_pts, neck_n, 0.008)
    P2, N2 = oriented(P2, N2, -UP)
    g.join(wo.strip(P2 + N2 * 0.0012 - UP * 0.008, N2, 0.022, 0.003, part="trim", kind="embroidery", panel="neckband"))
    # The stomacher: an embroidered panel down the front of the bodice, narrowing to the waist.
    z_hi = float(neck_pts[:, 2].min()) - 0.02
    line = []
    for z in np.linspace(z_hi, waist - 0.005, 12):
        p, n = ray_onto(g, np.array([0, M.centre_y(z) - 0.4, z]), (0, 1, 0), 0.0016)
        line.append((p, n))
    LP = np.array([p for p, n in line])
    LN = np.array([n for p, n in line])
    g.join(wo.strip(LP, LN, np.linspace(0.085, 0.035, len(LP)), 0.003, part="trim", kind="embroidery", closed=False, panel="stomacher"))
    # Embroidered bands where the trumpet cuffs begin.
    for s in ("l", "r"):
        S, E, W = M.arm_joints(s)
        c = E + (W - E) * 0.72
        d = unit(W - E)
        e1 = unit(np.cross(d, UP))
        e2 = np.cross(d, e1)
        ring = [ray_onto(g, c + (e1 * math.cos(a) + e2 * math.sin(a)) * 0.3, -(e1 * math.cos(a) + e2 * math.sin(a)), 0.0015) for a in np.linspace(0, 2 * math.pi, 22, endpoint=False)]
        RP = np.array([p for p, n in ring])
        RN = np.array([n for p, n in ring])
        RP, RN = oriented(RP, RN, d)
        g.join(wo.strip(RP, RN, 0.026, 0.003, part="trim", kind="embroidery", panel=f"cuffband_{s}"))
    # The girdle of gold plaques, low on the hips, its end hanging down the front.
    zg = M.crotch + 0.12
    P, N = skin_ring(body, M, zg, lift=0.04, n=40, tilt=0.06)
    P, N = oriented(P, N, UP)
    g.join(wo.strip(P, N, 0.026, 0.004, part="metal", kind="engraved", panel="girdle"))
    for i in range(0, len(P), 2):
        g.join(wo.stud(P[i] + N[i] * 0.0045, N[i], 0.008, 0.003, part="gem", kind="gem", sides=6))
    j = int(np.argmin(P[:, 1] + np.abs(P[:, 0]) * 3))
    end = [P[j] + N[j] * 0.005 - UP * k for k in np.linspace(0, 0.42, 10)]
    end = np.array(end) + np.outer(np.linspace(0, 1, 10) ** 2, np.array([0, -0.03, 0]))
    g.join(wo.strip(end, np.repeat(N[j][None], 10, 0), 0.022, 0.004, part="metal", kind="engraved", closed=False, panel="girdle_end"))
    g.attrs = {k: v for k, v in g.attrs.items() if k.startswith("paint_")}
    arm_loose = smoothstep(1.7, 2.0, M.arm_fields(g.co)[0]) * (np.abs(g.co[:, 0]) > 0.15)
    wo.fit(g, body, loose=np.maximum(smoothstep(waist, waist - 0.3, g.co[:, 2]), arm_loose), smooth_rounds=12, clearance=0.004)
    return g


def apron(body, M):
    """A linen apron over a dress or shirt: a wide front panel gathered on a waistband and hanging to below
    the knee in real folds, the band's ties going round the back to a bow with long tails."""
    zt = M.waist_z - 0.03
    zb = M.J["calf_l"][2] + 0.04
    around = 56
    flare = 0.3
    z_end = zt - (zt - zb) / math.sqrt(1 + flare * flare)
    g = mo.skirt_loft(body, M, zt, z_end, 0.03, flare=flare, around=around, kind="canvas", folds=0.0, panel="apron", ring_step=0.03)
    mo.gore_uvs(g, around, 3, "apron")
    ang = np.angle(np.exp(1j * g.attrs["angle"][:, 0]))
    # Only the front: from one hip round to the other.
    g.clip(np.abs(ang) - 1.45)
    ring = g.attrs["ring"][:, 0]
    wo.cloth_sim(g, body, smoothstep(1.5, 0.5, ring), frames=70, bending=0.3, mass=0.3, noise=0.004, seed=71, tension=50)
    g.attrs = {}
    g.rim(depth=0.003, back=0.01)
    # The waistband round the whole waist, tied behind.
    P, N = skin_ring(body, M, zt + 0.012, lift=0.034, n=48)
    P, N = oriented(P, N, UP)
    g.join(wo.strip(P, N, 0.03, 0.003, part="trim", kind="linen", panel="band"))
    back_c = P[int(np.argmax(P[:, 1]))]
    g.join(bow(back_c + np.array([0, 0.004, 0]), np.array([0, 1.0, 0]), np.array([1.0, 0, 0]), size=0.045, part="trim", kind="linen", radius=0.006, tails=0.26))
    g.attrs = {k: v for k, v in g.attrs.items() if k.startswith("paint_")}
    wo.fit(g, body, loose=smoothstep(zt - 0.05, zt - 0.35, g.co[:, 2]), smooth_rounds=10, clearance=0.006)
    return g


# ── Footwear and accessories ─────────────────────────────────────────────────────────────────────────


def sandals(body, M):
    """Leather sandals: a thin sole with a stitched edge, a strap over the toes, one over the instep, one
    round the ankle buckled at the side, and a heel strap up the back joining them."""
    g_all = None
    for s, sg in (("l", 1), ("r", -1)):
        A, d, e, pts, a = mo.foot_frame(M, s)
        guide = mo.last_shell(body, M, s, offset=0.0035, collar=lambda x: np.full(np.shape(x), 0.13), top_extra=0.03)
        feet = pts[(pts[:, 2] < 0.03)]
        c = feet[:, :2].mean(0)
        h = wo.hull2(feet[:, :2])
        ang = np.linspace(-math.pi, math.pi, 44, endpoint=False)
        r = wo.ray_hull(h - c, ang) + 0.007
        ring = np.stack([c[0] + r * np.cos(ang), c[1] + r * np.sin(ang)], axis=1)
        for _ in range(3):
            ring = 0.5 * ring + 0.25 * (np.roll(ring, 1, 0) + np.roll(ring, -1, 0))
        k = len(ring)
        z0, z1 = -0.001, 0.009
        co = np.concatenate([np.c_[ring, np.full(k, z1)], np.c_[ring, np.full(k, z0)]])
        faces = [list(range(k)), list(range(k, 2 * k))[::-1]]
        for i in range(k):
            j = (i + 1) % k
            faces.append([i, k + i, k + j, j])
        sole = wo.Geo(co, faces, part="sole", kind="leather", panel=f"sole_{s}")
        sole.smooth = [False, False] + [True] * k
        for i in range(k):
            sole.edge[wo.ekey(i, (i + 1) % k)] = "edge"
        g = sole
        nrm = guide.vertex_normals()
        a_ball = float((M.J[f"ball_{s}"] - A) @ d)
        al = ((guide.co - A) @ d)
        for x, w in ((a_ball + 0.03, 0.02), (0.06, 0.022)):
            P, N = wo.surface_loop(guide, al - x, nrm)
            keep = P[:, 2] > 0.008
            P, N = P[keep], N[keep]
            if len(P) < 5:
                continue
            order = np.argsort((P - A) @ e)
            P, N = wo.resample(P[order], N[order], 0.007, closed=False)
            for _ in range(3):
                P[1:-1] = 0.5 * P[1:-1] + 0.25 * (P[:-2] + P[2:])
            P, N = oriented(P, N, -d)
            g.join(wo.strip(P, N, w, 0.003, part="leather", kind="leather", closed=False, panel=f"strap_{s}"))
        # The ankle strap, round the leg above the ankle bones, buckled outside.
        za = 0.105
        P, N = wo.surface_loop(guide, guide.co[:, 2] - za, nrm)
        if len(P) > 6:
            P, N = wo.clean_loop(P, N, 0.008)
            P, N = oriented(P, N, UP)
            g.join(wo.strip(P + N * 0.001, N, 0.016, 0.003, part="leather", kind="leather", panel=f"ankle_{s}"))
            j = int(np.argmax((P[:, 0] - A[0]) * sg))
            T = unit(P[(j + 1) % len(P)] - P[j - 1])
            g.join(wo.box_ring(P[j] + N[j] * 0.0035, N[j], T, 0.018, 0.018, 0.003, 0.0025, part="metal", kind="metal"))
            back = P[int(np.argmax(-((P - A) @ d)))]
            heel_pts = []
            for zz in np.linspace(0.012, za, 6):
                p, n = ray_onto(guide, np.array([back[0], back[1] + 0.2, zz]) - d * 0.0, -d * 0 + np.array([0, -1.0, 0]) if d[1] < 0 else np.array([0, 1.0, 0]), 0.001)
                heel_pts.append((p, n))
            HP = np.array([p for p, n in heel_pts])
            HN = np.array([n for p, n in heel_pts])
            g.join(wo.strip(HP, HN, 0.018, 0.003, part="leather", kind="leather", closed=False, panel=f"heel_{s}"))
            # A thong from the instep strap down between the toes.
        g_all = g if g_all is None else g_all.join(g)
    g_all.attrs = {k: v for k, v in g_all.attrs.items() if k.startswith("paint_")}
    wo.fit(g_all, body, loose=np.ones(g_all.n), smooth_rounds=2, clearance=0.002)
    return g_all


def tall_boots(body, M):
    """Over-the-knee riding boots: a shoe on a cobbler's last, a shaft of soft leather up past the knee with
    a few creases at the ankle and behind the knee, a wide flared top turned down into a cuff, and a
    buckled strap over the instep where shoe and shaft meet."""
    g_all = None
    for s, sg in (("l", 1), ("r", -1)):
        A, d, e, pts, a = mo.foot_frame(M, s)
        zc = 0.14

        def collar(x, zc=zc):
            return np.full(np.shape(x), zc)

        foot = mo.last_shell(body, M, s, offset=0.008, collar=collar, top_extra=0.0)
        foot.clip(foot.co[:, 2] - zc)
        foot.clip(0.014 - foot.co[:, 2])
        for i in range(len(foot.faces)):
            foot.panel[i] = f"foot_{s}"
        loops = foot.edge_loops()
        bottoms = [foot.co[lp].copy() for lp in loops if foot.co[lp, 2].mean() <= 0.04]
        top_t = 0.78
        shaft, path = leg_tube(body, M, s, top_t, 1.9, lambda t: 0.012 + 0.012 * smoothstep(1.2, 0.8, t), around=28, step=0.022)
        tt = shaft.attrs["t"][:, 0]
        # Creases: soft rings at the ankle and behind the knee.
        nrm = shaft.vertex_normals()
        ang = shaft.attrs["angle"][:, 0]
        crease = 0.0025 * np.sin(tt * 55 + np.sin(ang * 2) * 0.8) * (smoothstep(1.6, 1.8, tt) + smoothstep(1.15, 1.0, tt) * smoothstep(0.85, 1.0, tt) * np.clip(np.cos(ang), 0, 1))
        shaft.co += nrm * crease[:, None]
        # (The shaft's foot end goes down inside the shoe.)
        shaft.clip(0.11 - shaft.co[:, 2])
        foot_guide = foot.copy()
        g = foot
        g.attrs = {}
        shaft.attrs = {}
        g.join(shaft)
        g.smooth_edges(rounds=2)
        tops = [lp for lp in g.edge_loops() if g.co[lp, 2].mean() > 0.3]
        top_pts = [g.co[lp].copy() for lp in tops]
        g.rim(depth=0.004, back=0.012, loops=tops)
        for ring_pts in bottoms:
            g.join(mo.sole_slab(ring_pts, 0.005))
        # The turned-down cuff at the top, flaring out.
        for R in top_pts:
            c = R.mean(0)
            K, H = M.J[f"calf_{s}"], M.J[f"thigh_{s}"]
            ax = unit(K - H)
            outw = unit((R - c) - np.outer((R - c) @ ax, ax))
            P2, N2 = wo.clean_loop(R + outw * 0.006, outw, 0.012)
            P2, N2 = oriented(P2, N2, ax)
            g.join(wo.strip(P2 + ax * 0.04 + N2 * 0.004, unit(N2 - ax * 0.25), 0.09, 0.005, part="trim", kind="leather", panel=f"cuff_{s}"))
        # The strap over the instep, buckled outside.
        ring, rn = [], []
        for t_ in np.linspace(0, 2 * math.pi, 26, endpoint=False):
            dv = e * math.cos(t_) + UP * math.sin(t_)
            dv = unit(dv * np.array([1, 1, 1]) + d * 0.0)
            p, n = ray_onto(foot_guide, A + d * 0.02 + dv * 0.3, -dv, 0.002)
            if p[2] > 0.02:
                ring.append(p)
                rn.append(n)
        if len(ring) > 5:
            P, N = np.array(ring), np.array(rn)
            order = np.argsort(np.arctan2((P - A) @ UP, (P - A) @ e))
            P, N = wo.resample(P[order], N[order], 0.008, closed=False)
            P, N = oriented(P, N, -d)
            g.join(wo.strip(P, N, 0.022, 0.004, part="trim", kind="leather", closed=False, panel=f"strap_{s}"))
            j = int(np.argmax((P[:, 0] - A[0]) * sg))
            j = min(max(j, 1), len(P) - 2)
            g.join(wo.box_ring(P[j] + N[j] * 0.005, N[j], unit(P[j + 1] - P[j - 1]), 0.026, 0.024, 0.004, 0.003, part="metal", kind="metal"))
        g.attrs = {}
        g_all = g if g_all is None else g_all.join(g)
    wo.fit(g_all, body, loose=np.ones(g_all.n), smooth_rounds=3, clearance=0.004)
    return g_all


def gloves(body, M):
    """Leather gloves, close over each finger, with a flared gauntlet cuff over the wrist, stitched."""
    t_arm, *_ = M.arm_fields(body.co)
    keep = np.isin(body.bone, ["hand_l", "hand_r"]) | (np.isin(body.bone, ["lowerarm_l", "lowerarm_r"]) & (t_arm > 1.7))
    g = wo.Geo.from_body(body, body_polys(body, keep))
    g = wo.decimate(g, 0.45)
    g.part = ["leather"] * len(g.faces)
    g.kind = ["leather"] * len(g.faces)
    g.attrs["P0"] = g.co.copy()
    wo.wrap(g, body, 0.0022, rounds=4, factor=0.3)
    P0 = g.attrs["P0"]
    t, *_ = M.arm_fields(P0)
    g.clip(1.82 - t)
    P0 = g.attrs["P0"]
    for i, fc in enumerate(g.faces):
        g.panel[i] = "glove_l" if P0[fc, 0].mean() > 0 else "glove_r"
    g.smooth_edges(rounds=2)
    g.rim(depth=0.002, back=0.006)
    for s in ("l", "r"):
        E, W = M.J[f"lowerarm_{s}"], M.J[f"hand_{s}"]
        cuff, path = mo.limb_loft(body, M, (E, W), 0.72, 1.03, [f"lowerarm_{s}", f"hand_{s}"], lambda tt: 0.006 + 0.03 * smoothstep(0.95, 0.72, tt) ** 1.5, around=22, rings=7, panel=f"cuff_{s}")
        cuff.attrs = {}
        cuff.rim(depth=0.003, back=0.01)
        g.join(cuff)
    g.attrs = {k: v for k, v in g.attrs.items() if k.startswith("paint_")}
    wo.fit(g, body, rigid=None, loose=np.ones(g.n), smooth_rounds=2, clearance=0.002)
    return g


def belt_pouches(body, M):
    """A wide leather belt slung on the hips with a brass buckle, three pouches with flaps and studs, and a
    small knife in a sheath at the back."""
    zb = M.crotch + 0.14
    # (Slung over whatever is worn there, a coat included.)
    P, N = skin_ring(body, M, zb, lift=0.03, n=56, tilt=0.05)
    P, N = oriented(P, N, UP)
    g = wo.strip(P, N, 0.05, 0.007, part="belt", kind="leather", panel="belt")
    j = int(np.argmin(P[:, 1]))
    g.join(wo.box_ring(P[j] + N[j] * 0.009, N[j], UP, 0.058, 0.06, 0.008, 0.005, part="metal", kind="metal"))
    tip = P[j] + N[j] * 0.009 + unit(np.cross(N[j], UP)) * 0.04
    g.join(wo.strip(np.array([tip, tip - UP * 0.03, tip - UP * 0.06]), np.repeat(N[j][None], 3, 0), 0.04, 0.006, part="belt", kind="leather", closed=False, panel="belt_end"))
    a = np.arctan2(P[:, 0], -(P[:, 1] - M.centre_y(P[:, 2])))
    for target, w, h, dep in ((1.25, 0.13, 0.14, 0.05), (-1.3, 0.11, 0.12, 0.045), (2.35, 0.1, 0.11, 0.04)):
        i = int(np.argmin(np.abs(np.angle(np.exp(1j * (a - target))))))
        c = P[i] + N[i] * (0.009 + dep / 2)
        n = N[i]
        side = unit(np.cross(UP, n))
        top = c - UP * 0.01

        def prad(ii, angles, cc, T, e1, e2, w=w, dep=dep):
            # A rounded box: an ellipse w wide and dep deep, a little fuller in the middle.
            rr = 1.0 / np.maximum(np.sqrt((np.cos(angles) / (w / 2)) ** 2 + (np.sin(angles) / (dep / 2)) ** 2), 1e-6)
            bulge = [0.9, 1.0, 1.0, 0.95, 0.8][ii]
            return rr * bulge

        path = np.array([top - UP * h * f for f in (0.0, 0.25, 0.55, 0.85, 1.0)])
        pouch = wo.loft(path, 16, prad, up_hint=side, closed_start=True, closed_end=True, part="pouch", kind="leather", panel="pouch")
        g.join(pouch)
        # The flap over its top front, a stud to fasten it.
        fl = [top + n * (dep / 2 + 0.003) + UP * 0.004, top + n * (dep / 2 + 0.004) - UP * h * 0.3, top + n * (dep / 2 + 0.002) - UP * h * 0.45]
        g.join(wo.strip(np.array(fl), np.repeat(n[None], 3, 0), w * 0.95, 0.004, part="pouch", kind="leather", closed=False, panel="flap"))
        g.join(wo.stud(fl[2] + n * 0.004 + UP * 0.006, n, 0.006, 0.004, part="metal", kind="metal", sides=8))
        lp = np.array([P[i] + N[i] * 0.008 + UP * 0.03, P[i] + N[i] * 0.01 - UP * 0.02])
        g.join(wo.strip(lp, np.repeat(n[None], 2, 0), 0.02, 0.004, part="belt", kind="leather", closed=False, panel="loop"))
    # A knife at the back-left: a sheath and a hilt.
    i = int(np.argmin(np.abs(np.angle(np.exp(1j * (a + 2.4))))))
    c = P[i] + N[i] * 0.02
    n = N[i]
    blade_dir = unit(-UP + unit(np.cross(UP, n)) * 0.35)
    sheath = wo.loft(np.array([c + UP * 0.01, c - blade_dir * -0.0 + blade_dir * 0.08, c + blade_dir * 0.17]), 8, lambda ii, an, cc, T, e1, e2: np.array([0.018, 0.016, 0.006])[ii] * (0.45 + 0.55 * np.abs(np.cos(an))), up_hint=n, closed_start=True, closed_end=True, part="pouch", kind="leather", panel="sheath")
    g.join(sheath)
    hilt = wo.tube(np.array([c + UP * 0.01, c - blade_dir * 0.09]), 0.008, sides=6, part="metal", kind="cord")
    g.join(hilt)
    g.join(wo.stud(c - blade_dir * 0.095, -blade_dir, 0.011, 0.008, part="metal", kind="metal", sides=8))
    wo.fit(g, body, rigid=np.ones(g.n), rigid_bones=["pelvis"], clearance=0.01)
    return g


def scarf(body, M):
    """A long knitted scarf wound twice round the neck, its two ends hanging down the chest, draped."""
    z = M.neck[2] - 0.055
    c0 = np.array([0.0, M.neck[1] + 0.005, z])
    g = None
    for k, (dz, grow, rr, ph) in enumerate(((0.0, 0.026, 0.019, 0.0), (0.024, 0.022, 0.016, 1.3))):
        ang = np.linspace(-math.pi, math.pi, 40, endpoint=False)
        r = []
        for a in ang:
            dv = np.array([math.sin(a), -math.cos(a), 0.0])
            hit = body.bvh.ray_cast(wo.Vector(c0 + UP * dz), wo.Vector(dv), 0.3)
            r.append(hit[3] if hit[0] is not None else 0.06)
        r = np.minimum(np.array(r), 0.075)
        r = 0.5 * r + 0.25 * (np.roll(r, 1) + np.roll(r, -1)) + grow
        path = np.stack([np.sin(ang) * r, c0[1] - np.cos(ang) * r, np.full(len(ang), z + dz) - 0.015 * np.cos(ang) ** 2 * (k == 0)], axis=1)
        path = np.concatenate([path, path[:1]])

        def rad(i, angles, c, T, e1, e2, rr=rr, ph=ph):
            return rr * (1 + 0.12 * np.sin(angles * 2 + i * 0.6 + ph)) * np.where(np.cos(angles) > 0, 1.0, 0.75)

        wrap = wo.loft(path, 12, rad, up_hint=(0, 0, 1), part="cloth", kind="knit", panel=f"wrap{k}")
        g = wrap if g is None else g.join(wrap)
    # The two ends: flat lengths hanging from the front of the wraps, draped.
    for sg, length, seed in ((1, 0.48, 81), (-1, 0.36, 82)):
        x0 = 0.035 * sg
        p, n = ray_onto(g, np.array([x0, M.centre_y(z) - 0.4, z - 0.01]), (0, 1, 0), 0.0)
        side = np.array([1.0, 0, 0])
        top = np.array([p + side * (u - 0.5) * 0.15 + n * 0.002 for u in np.linspace(0, 1, 8)])
        tn = np.repeat(n[None], 8, 0)
        end = hanging_flap(body, M, top, tn, length, kind="knit", part="cloth", seed=seed, bending=0.8, colliders=[])
        # (Hanging clear of a coat or tunic worn under it.)
        wo.wrap(end, body, 0.026, rounds=2, factor=0.1)
        end.attrs = {}
        mo.lined(end, part="cloth", kind="knit", depth=0.008)
        # Fringe at the bottom.
        bot = end.co[np.argsort(end.co[:, 2])[:8]]
        for fp in bot:
            g_f = wo.tube(np.array([fp, fp - UP * 0.04 + np.array([0, -0.005, 0])]), 0.0018, sides=4, part="cloth", kind="cord")
            end.join(g_f)
        g.join(end)
    g.attrs = {k: v for k, v in g.attrs.items() if k.startswith("paint_")}
    wo.fit(g, body, loose=smoothstep(z - 0.05, z - 0.3, g.co[:, 2]), smooth_rounds=6, clearance=0.006)
    return g


def hood(body, M):
    """A hood of its own: the hood up round the head over a short draped mantle on the shoulders, lined."""
    h = mo.hood_up(body, M)
    h.attrs = {}
    # (Out over the ears wherever the hood came nearer than a centimetre.)
    wo.wrap(h, body, 0.01, rounds=1, factor=0.05)
    shoulder_z = M.J["upperarm_l"][2]
    cape = mo.capelet(body, M, shoulder_z - 0.07, offset=0.02, front_gap=0.25, flare=0.45, z_top=M.neck[2] + 0.005)
    mo.lined(cape, edge_kind="wool")
    h.join(cape)
    wo.fit(h, body, loose=np.ones(h.n), smooth_rounds=5, clearance=0.012)
    return h


def circlet(body, M):
    """A gold circlet on the brow: a narrow engraved band tilting down at the front, set with a red stone in
    a pointed mount and two small stones at the temples."""
    eye, top = mo.head_marks(body)
    ring, rn = [], []
    cy = eye[1] + 0.07
    for a in np.linspace(-math.pi, math.pi, 48, endpoint=False):
        z = eye[2] + 0.036 + 0.012 * (1 - math.cos(a)) / 2
        dv = np.array([math.sin(a), -math.cos(a), 0.0])
        p, n = ray_onto(body, np.array([0, cy, z]) + dv * 0.3, -dv, 0.0)
        ring.append(p + dv * 0.004)
        rn.append(dv)
    P, N = np.array(ring), np.array(rn)
    for _ in range(3):
        P = 0.5 * P + 0.25 * (np.roll(P, 1, 0) + np.roll(P, -1, 0))
    P, N = oriented(P, N, UP)
    g = wo.strip(P, N, 0.011, 0.0028, part="metal", kind="engraved", panel="band")
    j = int(np.argmin(P[:, 1]))
    f = P[j] + N[j] * 0.003
    mount = wo.loft(np.array([f + UP * 0.022, f + UP * 0.008, f - UP * 0.008, f - UP * 0.014]), 8, lambda i, a, c, T, e1, e2: np.full(len(a), [0.001, 0.009, 0.008, 0.001][i]) * (0.6 + 0.4 * np.abs(np.cos(a))), up_hint=N[j], closed_start=True, closed_end=True, part="metal", kind="metal", panel="mount")
    g.join(mount)
    g.join(wo.stud(f + N[j] * 0.0015, N[j], 0.0065, 0.0045, part="gem", kind="gem", sides=8))
    for sg in (1, -1):
        jj = int(np.argmin(np.abs(np.arctan2(P[:, 0], -(P[:, 1] - cy)) - sg * 1.1)))
        g.join(wo.stud(P[jj] + N[jj] * 0.0025, N[jj], 0.0038, 0.003, part="gem", kind="gem", sides=6))
    wo.fit(g, body, rigid=np.ones(g.n), rigid_bones=["Head"], clearance=0.003)
    return g


# ── Armour ───────────────────────────────────────────────────────────────────────────────────────────


def rivet_grid(g, M, z_lo, z_hi, dz, da, r_out=0.4, skip=None, part="metal"):
    """Rivets on a torso piece in rows dz apart, da apart round it (metres along the surface), found by
    rays in from outside."""
    bvh, _ = wo.geo_bvh(g)
    pts, nrms = [], []
    for k, z in enumerate(np.arange(z_lo, z_hi, dz)):
        cy = M.centre_y(z)
        circ = 0.9
        n = int(circ / da)
        for i in range(n):
            a = -math.pi + (i + 0.5 * (k % 2)) * 2 * math.pi / n
            if skip is not None and skip(a, z):
                continue
            dv = np.array([math.sin(a), -math.cos(a), 0.0])
            hit = bvh.ray_cast(wo.Vector(np.array([0, cy, z]) + dv * r_out), wo.Vector(-dv), r_out)
            if hit[0] is None:
                continue
            p, nn = np.array(hit[0]), np.array(hit[1])
            if nn @ dv < 0.3:
                continue
            pts.append(p)
            nrms.append(nn)
    studs_on(g, pts, nrms, r=0.0042, h=0.0024, part=part, kind="metal", sides=5)
    return len(pts)


def brigandine(body, M):
    """A brigandine: steel plates riveted inside a velvet-covered jerkin to the hips, rows of brass rivet
    heads over it, edged in leather, buckled shut down the front with three straps."""
    hem = M.crotch + 0.05
    g, zn = top_shell(body, M, hem, sleeve_t=None, kind="velvet", part="cloth", torso_off=0.012, waist_off=0.013, drape_off=0.0, neck_lift=0.016, decim=0.5)
    # (Plates inside it: smooth over the chest and back, easing over the hips below the waist.)
    g.co = g.smooth_values(g.co, 4, 0.4)
    wo.wrap(g, body, 0.012, rounds=1, factor=0.1)
    wo.drape(g, body, M.centre_y, M.waist_z, hem - 0.05, 0.014, slope=0.6)
    g.smooth_edges(rounds=3)
    edges = [g.co[lp].copy() for lp in g.edge_loops()]
    g.rim(depth=0.008, back=0.01)
    for P in edges:
        if len(P) < 6:
            continue
        c = P.mean(0)
        N = unit(P - c)
        P2, N2 = wo.clean_loop(P, N, 0.014)
        P2, N2 = oriented(P2, N2, -UP if c[2] > M.chest_z else UP)
        T = np.roll(P2, -1, 0) - P2
        B = unit(np.cross(N2, T))
        g.join(wo.strip(P2 + N2 * 0.001 + B * 0.006, N2, 0.018, 0.004, part="trim", kind="leather", panel="edge"))
    n = rivet_grid(g, M, hem + 0.035, M.shoulder_top - 0.02, 0.055, 0.042, skip=lambda a, z: abs(a) < 0.12 and z < M.chest_z + 0.05)
    wo.log(f"  brigandine: {n} rivets")
    for z in np.linspace(M.chest_z - 0.03, M.waist_z - 0.0, 3):
        nrm = g.vertex_normals()
        P, N = wo.surface_loop(g, g.co[:, 2] - z, nrm)
        keep = (P[:, 1] < M.centre_y(z)) & (np.abs(P[:, 0]) < 0.07)
        P, N = P[keep], N[keep]
        if len(P) < 4:
            continue
        order = np.argsort(P[:, 0])
        P, N = wo.resample(P[order], N[order], 0.01, closed=False)
        P, N = oriented(P, N, UP)
        g.join(wo.strip(P + N * 0.004, N, 0.024, 0.005, part="trim", kind="leather", closed=False, panel="strap"))
        jm = len(P) // 2 + 1
        g.join(wo.box_ring(P[jm] + N[jm] * 0.009, N[jm], UP, 0.032, 0.034, 0.005, 0.004, part="metal", kind="metal"))
    g.attrs = {k: v for k, v in g.attrs.items() if k.startswith("paint_")}
    wo.fit(g, body, rigid=smoothstep(M.crotch + 0.12, M.waist_z, g.co[:, 2]) * 0.7, rigid_bones=["spine_01", "spine_02", "spine_03"], loose=smoothstep(M.waist_z, hem, g.co[:, 2]) * 0.6, smooth_rounds=6, clearance=0.012)
    return g


def scale_mail(body, M):
    """A coat of scale mail to mid-thigh: overlapping steel scales, short sleeves, split front and back for
    riding, edged in leather."""
    waist = M.waist_z - 0.01
    g, zn = top_shell(body, M, waist - 0.03, sleeve_t=0.62, kind="scale", part="scale", torso_off=0.009, waist_off=0.011, sleeve_off=0.011, drape_off=0.0, neck_lift=0.012, decim=0.5)
    wo.drape(g, body, M.centre_y, M.waist_z + 0.02, waist - 0.08, 0.013, slope=0.5)
    hem = M.crotch - 0.14
    sk = mo.skirt_loft(body, M, waist + 0.02, hem, 0.021, flare=0.2, around=40, part="scale", kind="scale", folds=0.004, n_folds=8, slit=[(0.0, 0.17), (math.pi, 0.17)])
    sk.attrs = {}
    g.smooth_edges()
    g.attrs = {}
    g.join(sk)
    edges = [g.co[lp].copy() for lp in g.edge_loops()]
    g.rim(depth=0.006, back=0.0)
    for P in edges:
        if len(P) < 6:
            continue
        c = P.mean(0)
        N = unit(P - c)
        P2, N2 = wo.clean_loop(P, N, 0.022)
        P2, N2 = oriented(P2, N2, UP if c[2] < waist else -UP)
        g.join(wo.strip(P2 + N2 * 0.001, N2, 0.018, 0.004, part="trim", kind="leather", panel="trim"))
    wo.fit(g, body, loose=smoothstep(waist, hem, g.co[:, 2]) * (g.co[:, 2] < waist), smooth_rounds=8, clearance=0.008)
    return g


def gambeson(body, M):
    """A padded gambeson: quilted in vertical channels, full sleeves, a high padded collar, to mid-thigh,
    tied shut down the front with leather points."""
    waist = M.waist_z - 0.01
    # (Padded, so it stands a little off the body, but shaped: taken in at the waist, following the chest.)
    g, zn = top_shell(body, M, waist - 0.03, sleeve_t=1.98, kind="quilted", part="cloth", torso_off=0.012, waist_off=0.012, sleeve_off=0.012, drape_off=0.0, neck_lift=0.014, decim=0.45)
    wo.drape(g, body, M.centre_y, M.waist_z + 0.02, waist - 0.08, 0.014, slope=0.5)
    hem = M.crotch - 0.13
    sk = mo.skirt_loft(body, M, waist + 0.02, hem, 0.022, flare=0.2, around=40, kind="quilted", folds=0.005, n_folds=8, slit=[(0.0, 0.2)])
    sk.attrs = {}
    g.smooth_edges()
    loops = g.edge_loops()
    neck = max(loops, key=lambda lp: g.co[lp, 2].mean())
    neck_pts = g.co[neck].copy()
    neck_n = g.vertex_normals()[neck]
    cuffs = sorted(loops, key=lambda lp: -abs(g.co[lp, 0].mean()))[:2]
    cuff_pts = [g.co[lp].copy() for lp in cuffs]
    g.attrs = {}
    g.join(sk)
    g.rim(depth=0.012, back=0.012)
    P2, N2 = wo.clean_loop(neck_pts, neck_n, 0.012)
    P2, N2 = oriented(P2, N2, UP)
    g.join(wo.strip(P2 + N2 * 0.002 + UP * 0.004, unit(N2 + UP * 0.15), 0.03, 0.01, part="cloth", kind="quilted", panel="collar"))
    for P in cuff_pts:
        s = "l" if P[:, 0].mean() > 0 else "r"
        S, E, W = M.arm_joints(s)
        d = unit(W - E)
        _, _, oo, _ = limb(P, M.arm_joints(s))
        P, N = wo.resample(P + oo * 0.003, oo, 0.012)
        P, N = oriented(P, N, -d)
        g.join(wo.strip(P - d * 0.02, N, 0.045, 0.008, part="cloth", kind="quilted", panel=f"cuff_{s}"))
    for z in np.linspace(M.chest_z + 0.08, waist - 0.02, 6):
        p, n = ray_onto(g, np.array([0.0, M.centre_y(z) - 0.4, z]), (0, 1, 0), 0.002)
        side = np.array([1.0, 0, 0])
        g.join(wo.tube(np.array([p - side * 0.022, p + n * 0.003, p + side * 0.022]), 0.0026, sides=5, part="laces", kind="cord"))
        g.join(wo.tube(np.array([p, p + n * 0.004 - UP * 0.03 + side * 0.006]), 0.0022, sides=5, part="laces", kind="cord"))
    wo.fit(g, body, loose=smoothstep(waist, hem, g.co[:, 2]) * (g.co[:, 2] < waist), smooth_rounds=8, clearance=0.008)
    return g


def tassets(body, M):
    """Steel tassets: four overlapping lames hanging over the front and side of each thigh from a leather
    belt, on leather straps, riveted, the lowest with a rolled edge."""
    zb = M.waist_z - 0.06
    P, N = skin_ring(body, M, zb, lift=0.016, n=56)
    P, N = oriented(P, N, UP)
    g = wo.strip(P, N, 0.04, 0.006, part="leather", kind="leather", panel="belt")
    g.attrs["group"] = np.zeros((g.n, 1))
    gid = 1
    j = int(np.argmin(P[:, 1]))
    g.join(wo.box_ring(P[j] + N[j] * 0.008, N[j], UP, 0.05, 0.05, 0.007, 0.004, part="metal", kind="metal"))
    for s, sg in (("l", 1), ("r", -1)):
        H, K = M.J[f"thigh_{s}"], M.J[f"calf_{s}"]
        ax = unit(K - H)
        # (The hip as well as the thigh: the top lames lie over the hip.)
        pts = body.co[M.surf & np.isin(body.region, ["thighs", "hips"]) & (body.co[:, 0] * sg > 0.02)]
        top_z = zb - 0.035
        for k in range(4):
            z0 = top_z - k * 0.055
            z1 = z0 - 0.07
            ts = np.linspace(0, 1, 5)
            path = np.array([[0, 0, z0 + (z1 - z0) * t] for t in ts])
            cx = H[0] + (K[0] - H[0]) * ((H[2] - path[:, 2]) / (H[2] - K[2]))
            cy_ = H[1] + (K[1] - H[1]) * ((H[2] - path[:, 2]) / (H[2] - K[2]))
            path[:, 0], path[:, 1] = cx, cy_

            def rad(i, angles, c, T, e1, e2, k=k):
                sel = pts[np.abs(pts[:, 2] - c[2]) < 0.02]
                if len(sel) < 4:
                    sel = pts[np.argsort(np.abs(pts[:, 2] - c[2]))[:40]]
                q = np.stack([(sel - c) @ e1, (sel - c) @ e2], axis=1)
                return wo.ray_hull(wo.hull2(q), angles) + 0.02 + 0.005 * k + 0.008 * i / 4

            lame = wo.loft(path, 32, rad, up_hint=(0, -1, 0), seam_angle=math.pi, part="plate", kind="plate", panel=f"lame_{s}{k}", down=(0, 0, -1))
            # Only over the front and outside of the thigh.
            ang = np.angle(np.exp(1j * lame.attrs["angle"][:, 0]))
            a_out = ang * (-sg)
            lame.clip(np.maximum(-0.55 - a_out, a_out - 1.75))
            lame.attrs = {}
            loops = [lame.co[lp].copy() for lp in lame.edge_loops()]
            lame.smooth_edges(rounds=4)
            # (A plate with thickness: its inside shows when the leg lifts.)
            mo.lined(lame, part="plate", kind="plate", depth=0.003)
            lame.attrs["group"] = np.full((lame.n, 1), float(gid))
            gid += 1
            if k == 3 and loops:
                L = loops[0]
                low = L[L[:, 2] < L[:, 2].min() + 0.02]
                if len(low) > 4:
                    order = np.argsort(np.arctan2(low[:, 0] - H[0], -(low[:, 1] - H[1])))
                    lame.join(wo.tube(low[order], 0.004, sides=6, part="plate", kind="plate", caps=True))
            g.join(lame)
            for a_ in (-0.25, 1.4):
                dv = unit(np.array([math.sin(-a_ * sg) * -1 * -1, -math.cos(a_), 0.0]))
                c = np.array([cx[1], cy_[1], z0 - 0.012])
                p, n = ray_onto(lame, c + dv * 0.3, -dv, 0.001)
                g.join(wo.stud(p, n, 0.0048, 0.003, part="metal", kind="metal", sides=6))
        # Two straps from the belt down the lames.
        for a_ in (-0.2, 1.35):
            line = []
            for z in np.linspace(zb - 0.01, top_z - 3 * 0.055 - 0.04, 9):
                cx = H[0] + (K[0] - H[0]) * ((H[2] - z) / (H[2] - K[2]))
                cyy = H[1] + (K[1] - H[1]) * ((H[2] - z) / (H[2] - K[2]))
                dv = unit(np.array([math.sin(a_) * sg, -math.cos(a_), 0.0]))
                p, n = ray_onto(g, np.array([cx, cyy, z]) + dv * 0.3, -dv, 0.002)
                line.append((p, n))
            LP = np.array([p for p, n in line])
            LN = np.array([n for p, n in line])
            g.join(wo.strip(LP, LN, 0.018, 0.003, part="leather", kind="leather", closed=False, panel="strap"))
    wo.fit(g, body, loose=np.ones(g.n), smooth_rounds=6, clearance=0.01, groups=g.attrs["group"][:, 0])
    return g


def hand_frame(body, M, s):
    """One hand's skin points, its direction from the wrist to the fingers, and the normal of its palm
    (the hand's flattest direction, turned to face the palm)."""
    sg = 1 if s == "l" else -1
    pts = body.co[M.surf & (body.bone == f"hand_{s}")]
    E, W = M.J[f"lowerarm_{s}"], M.J[f"hand_{s}"]
    ax = unit(W - E)
    c = pts.mean(0)
    _, _, vt = np.linalg.svd(pts - c, full_matrices=False)
    pn = vt[2]
    # (The palm faces in towards the body in the A-pose, and down.)
    if pn @ np.array([-sg, 0.0, -0.5]) < 0:
        pn = -pn
    return pts, W, ax, pn


def gauntlets(body, M):
    """Steel gauntlets over leather gloves: a flared steel cuff with a rolled edge over the wrist, a plate
    over the back of the hand and overlapping lames over the backs of the fingers, riveted; the palm and
    fingers' undersides leather."""
    glove = gloves(body, M)
    g_all = glove
    for s, sg in (("l", 1), ("r", -1)):
        pts, W, ax, pn = hand_frame(body, M, s)
        keep = body.bone == f"hand_{s}"
        h = wo.Geo.from_body(body, body_polys(body, keep))
        h = wo.decimate(h, 0.3)
        wo.wrap(h, body, 0.008, rounds=20, factor=0.55)
        sp = (pts - W) @ ax
        wo.hull_envelope(h, pts, W + ax * (sp.min() - 0.005), ax, sp.max() - sp.min() + 0.02, 0.009, bins=16, slab=0.01)
        h.co = h.smooth_values(h.co, 3, 0.4)
        wo.wrap(h, body, 0.008, rounds=1, factor=0.1)
        # Only the back of the hand and fingers: the side facing away from the palm.
        back = -((h.co - pts.mean(0)) @ pn)
        h.clip(-back + 0.002)
        along = (h.co - W) @ ax
        h.clip(-(along - 0.004))
        h.part = ["plate"] * len(h.faces)
        h.kind = ["plate"] * len(h.faces)
        h.panel = [f"back_{s}"] * len(h.faces)
        h.down = [tuple(ax)] * len(h.faces)
        # The plate over the hand, then lames over the fingers, each a separate plate stepping out over the next.
        along = (h.co - W) @ ax
        a_knuckle = float(np.percentile(sp, 55))
        pieces = [(0.004, a_knuckle + 0.006)]
        a = a_knuckle - 0.004
        while a < sp.max() + 0.01:
            pieces.append((a, a + 0.024))
            a += 0.019
        for k, (a0, a1) in enumerate(pieces):
            sub = h.copy()
            al = (sub.co - W) @ ax
            sub.clip(a0 - al)
            al = (sub.co - W) @ ax
            sub.clip(al - a1)
            if not sub.faces:
                continue
            nrm = sub.vertex_normals()
            sub.co += nrm * (0.0012 * (len(pieces) - k))
            sub.attrs = {}
            sub.smooth_edges(rounds=2)
            sub.rim(depth=0.0025, back=0.0)
            g_all.join(sub)
        E = M.J[f"lowerarm_{s}"]
        cuff, path = mo.limb_loft(body, M, (E, W), 0.62, 1.02, [f"lowerarm_{s}", f"hand_{s}"], lambda tt: 0.013 + 0.022 * smoothstep(0.95, 0.62, tt) ** 1.4, around=24, rings=8, panel=f"cuff_{s}", part="plate", kind="plate")
        cuff.attrs = {}
        loops = [cuff.co[lp].copy() for lp in cuff.edge_loops()]
        cuff.rim(depth=0.004, back=0.0)
        if loops:
            top = max(loops, key=lambda L: -((L.mean(0) - W) @ ax))
            P2, N2 = wo.clean_loop(top, unit(top - top.mean(0)), 0.01)
            cuff.join(wo.tube(np.concatenate([P2, P2[:1]]), 0.0035, sides=6, part="plate", kind="plate", caps=False))
        for tt in (0.75, 0.9):
            cc = E + (W - E) * tt
            e1 = unit(np.cross(ax, UP))
            p, n = ray_onto(cuff, cc + e1 * sg * 0.2, -e1 * sg, 0.0005)
            cuff.join(wo.stud(p, n, 0.004, 0.0025, part="metal", kind="metal", sides=6))
        g_all.join(cuff)
    # Rigid: the cuff on the forearm, the rest on the hand.
    W_ = np.zeros((g_all.n, len(wo.BONE_NAMES)))
    t_g, *_ = M.arm_fields(g_all.co)
    for s in ("l", "r"):
        side = (g_all.co[:, 0] > 0) if s == "l" else (g_all.co[:, 0] <= 0)
        W_[side & (t_g >= 1.97), wo.BONE_INDEX[f"hand_{s}"]] = 1.0
        W_[side & (t_g < 1.97), wo.BONE_INDEX[f"lowerarm_{s}"]] = 1.0
    wo.fit(g_all, body, weights=W_, clearance=0.003)
    return g_all


def sabatons(body, M):
    """Steel sabatons over the feet: a cuff round the ankle, overlapping lames down the instep, each its own
    plate with a turned edge, and a rounded toe cap, riveted at the sides, on a leather sole."""
    g_all = None
    for s, sg in (("l", 1), ("r", -1)):
        A, d, e, pts, a = mo.foot_frame(M, s)
        feet_top = body.co[M.surf & (body.region == "feet") & (body.co[:, 0] * sg > 0), 2].max()
        zc = feet_top + 0.02

        def collar(x, zc=zc):
            return np.full(np.shape(x), zc) + 1.0 * smoothstep(0.03, 0.07, np.asarray(x, dtype=np.float64))

        base = mo.last_shell(body, M, s, offset=0.011, collar=collar, top_extra=0.02)
        base.clip(base.co[:, 2] - collar(base.attrs["along"][:, 0]))
        base.clip(0.014 - base.co[:, 2])
        base.part = ["plate"] * len(base.faces)
        base.kind = ["plate"] * len(base.faces)
        base.panel = [f"foot_{s}"] * len(base.faces)
        loops = base.edge_loops()
        bottoms = [base.co[lp].copy() for lp in loops if base.co[lp, 2].mean() <= 0.04]
        tops = [base.co[lp].copy() for lp in loops if base.co[lp, 2].mean() > 0.04]
        a_ball = float((M.J[f"ball_{s}"] - A) @ d)
        # Plates along the foot: the heel and ankle in one, lames down the instep, then the toe cap; each
        # overlapping the next towards the toe and lifted a little over it.
        cuts = [-1.0, 0.035] + list(np.arange(0.06, a_ball + 0.03, 0.022)) + [9.0]
        g = None
        for k in range(len(cuts) - 1):
            sub = base.copy()
            al = sub.attrs["along"][:, 0]
            sub.clip(cuts[k] - 0.004 - al)
            al = sub.attrs["along"][:, 0]
            sub.clip(al - (cuts[k + 1] + 0.006))
            if not sub.faces:
                continue
            nrm = sub.vertex_normals()
            lift = 0.0018 * (len(cuts) - 2 - k) if 0 < k < len(cuts) - 2 else (0.0018 * (len(cuts) - 2) if k == 0 else 0.0)
            sub.co += nrm * lift
            sub.panel = [f"plate_{s}{k}"] * len(sub.faces)
            sub.attrs = {}
            sub.smooth_edges(rounds=2)
            sub.rim(depth=0.003, back=0.0)
            g = sub if g is None else g.join(sub)
        for ring_pts in bottoms:
            g.join(mo.sole_slab(ring_pts, 0.004))
        for R in tops:
            P2, N2 = wo.clean_loop(R, unit((R - R.mean(0)) * np.array([1, 1, 0])), 0.01)
            g.join(wo.tube(np.concatenate([P2, P2[:1]]) + np.concatenate([N2, N2[:1]]) * 0.003, 0.004, sides=6, part="plate", kind="plate", caps=False))
        for x in cuts[1:-1]:
            for side in (1, -1):
                p, n = ray_onto(g, A + d * (x + 0.008) + e * side * 0.2 + UP * 0.03, -e * side, 0.0005)
                g.join(wo.stud(p, n, 0.0035, 0.0022, part="metal", kind="metal", sides=6))
        g_all = g if g_all is None else g_all.join(g)
    wo.fit(g_all, body, loose=np.ones(g_all.n), smooth_rounds=3, clearance=0.005)
    return g_all


def full_helm(body, M):
    """A closed great helm: a flat-topped steel barrel over the whole head down onto the neck, eye slits
    and breaths, a ridge down the face with a brass cross over it, riveted round the crown; roomy enough
    for pointed ears."""
    eye, top = mo.head_marks(body)
    head = np.isin(body.bone, ["Head", "neck_01"])
    pts = np.concatenate([body.co[M.surf & head & (body.co[:, 2] > M.neck[2] - 0.03)], (body.co + body.keys.get("ears_pointed", 0) + body.keys.get("jaw", 0) * 0.0)[M.surf & head & (body.co[:, 2] > M.neck[2] - 0.03)]])
    z0 = M.neck[2] - 0.045
    z1 = top + 0.03
    zs = np.linspace(z0, z1, 22)
    cy = eye[1] + 0.06
    path = np.stack([np.zeros(len(zs)), np.full(len(zs), cy), zs], axis=1)
    R = []
    for z in zs:
        sel = pts[np.abs(pts[:, 2] - z) < 0.02]
        if len(sel) < 4:
            R.append(None)
            continue
        R.append(sel)
    radii = []
    angles = math.pi + np.arange(32) * (2 * math.pi / 32)
    for i, z in enumerate(zs):
        sel = R[i]
        if sel is None:
            radii.append(radii[-1] if radii else np.full(32, 0.1))
            continue
        q = np.stack([(sel[:, 1] - cy) * -1, -(sel[:, 0])], axis=1)
        radii.append(wo.ray_hull(wo.hull2(q), angles) + 0.024)
    radii = np.array(radii)
    # A barrel: each ring at least as big as the widest above the jaw, the bottom flaring onto the neck.
    widest = radii[(zs > eye[2] - 0.08) & (zs < top - 0.02)].max(0)
    for i, z in enumerate(zs):
        if z > eye[2] - 0.11:
            radii[i] = np.maximum(radii[i], widest * (1 - 0.1 * smoothstep(top - 0.04, top + 0.03, z)))
        else:
            radii[i] = np.maximum(radii[i], widest * (0.92 + 0.12 * smoothstep(eye[2] - 0.11, z0, z)))
    for _ in range(4):
        radii = 0.5 * radii + 0.25 * (np.roll(radii, 1, 1) + np.roll(radii, -1, 1))
        radii[1:-1] = 0.5 * radii[1:-1] + 0.25 * (radii[:-2] + radii[2:])

    def rad(i, a, c, T, e1, e2):
        return radii[i]

    g = wo.loft(path, 32, rad, up_hint=(0, -1, 0), seam_angle=math.pi, closed_end=True, part="plate", kind="plate", panel="helm", down=(0, 0, -1))
    # Flatten the top a little and round its edge.
    zt = g.co[:, 2]
    g.co[:, 2] = np.where(zt > top + 0.0, top + 0.0 + (zt - top) * 0.35, zt)
    ang = np.angle(np.exp(1j * g.attrs["angle"][:, 0]))
    # The ridge down the face.
    g.co[:, 1] -= 0.012 * np.exp(-((ang / 0.18) ** 2)) * (g.co[:, 2] < top) * smoothstep(z0, z0 + 0.05, g.co[:, 2])
    # Eye slits: two narrow openings across the front at eye height, and breaths on the right cheek.
    zsl = eye[2] + 0.004
    front = np.abs(ang) < 1.2
    slit = np.maximum(np.abs(g.co[:, 2] - zsl) - 0.0075, np.maximum(0.12 - np.abs(ang), np.abs(ang) - 0.95))
    g.clip(np.where(front, -slit, -1.0), edge_class="edge")
    holes = np.full(g.n, -1.0)
    for hz in (eye[2] - 0.05, eye[2] - 0.075):
        for ha in (0.35, 0.55, 0.75):
            ang = np.angle(np.exp(1j * g.attrs["angle"][:, 0]))
            d = np.hypot((ang - ha) * 0.11, g.co[:, 2] - hz)
            holes = np.maximum(holes, 0.0065 - d)
    g.clip(holes, edge_class="edge")
    g.attrs.pop("ring", None)
    g.smooth_edges(rounds=2)
    loops = [g.co[lp].copy() for lp in g.edge_loops()]
    g.rim(depth=0.004, back=0.008)
    bottom = min(loops, key=lambda L: L[:, 2].mean()) if loops else None
    if bottom is not None:
        P2, N2 = wo.clean_loop(bottom, unit((bottom - bottom.mean(0)) * np.array([1, 1, 0])), 0.012)
        g.join(wo.tube(np.concatenate([P2, P2[:1]]), 0.005, sides=6, part="plate", kind="plate", caps=False))
    # The brass cross: a band down the ridge and one across the brow, riveted.
    line = []
    for z in np.linspace(top - 0.01, z0 + 0.03, 12):
        if abs(z - zsl) < 0.012:
            continue
        p, n = ray_onto(g, np.array([0, cy - 0.4, z]), (0, 1, 0), 0.0015)
        line.append((p, n))
    LP = np.array([p for p, n in line])
    LN = np.array([n for p, n in line])
    g.join(wo.strip(LP[LP[:, 2] > zsl], LN[LP[:, 2] > zsl], 0.022, 0.003, part="trim", kind="engraved", closed=False, panel="cross_v"))
    g.join(wo.strip(LP[LP[:, 2] < zsl], LN[LP[:, 2] < zsl], 0.022, 0.003, part="trim", kind="engraved", closed=False, panel="cross_v2"))
    brow = []
    for a in np.linspace(-1.0, 1.0, 13):
        dv = np.array([math.sin(a), -math.cos(a), 0.0])
        p, n = ray_onto(g, np.array([0, cy, zsl + 0.025]) + dv * 0.4, -dv, 0.0015)
        brow.append((p, n))
    BP = np.array([p for p, n in brow])
    BN = np.array([n for p, n in brow])
    g.join(wo.strip(BP, BN, 0.02, 0.003, part="trim", kind="engraved", closed=False, panel="cross_h"))
    crown = []
    for a in np.linspace(-math.pi, math.pi, 16, endpoint=False):
        dv = np.array([math.sin(a), -math.cos(a), 0.0])
        p, n = ray_onto(g, np.array([0, cy, top - 0.025]) + dv * 0.4, -dv, 0.0005)
        crown.append((p, n))
    studs_on(g, [p for p, n in crown], [n for p, n in crown], r=0.005, h=0.003, part="trim", kind="metal", sides=6)
    wo.fit(g, body, rigid=np.ones(g.n), rigid_bones=["Head"], clearance=0.01)
    return g


def bikini_armour(body, M):
    """The fantasy classic: domed steel cups with rolled rims and a riveted boss between them on leather
    straps, a brief of leather under a belt of steel plaques, a shaped plate over the front, and a flap of
    red cloth hanging before and behind."""
    apex = bust_marks(body, M)
    g = skin_patch(body, M, ["spine_02", "spine_03", "clavicle_l", "clavicle_r"], 0.005, decim=0.7, extra=body.co[:, 1] < M.centre_y(body.co[:, 2]) + 0.01)
    P0 = g.attrs["P0"]
    f = np.full(g.n, np.inf)
    for s, sg in (("l", 1), ("r", -1)):
        A = apex[s]
        dd = np.hypot((P0[:, 0] - (A[0] + 0.006 * sg)) / 1.0, (P0[:, 2] - (A[2] - 0.005)) / 0.95)
        f = np.minimum(f, dd - 0.074)
    g.clip(np.where(P0[:, 1] < M.centre_y(P0[:, 2]), f, 1.0))
    # Domed: pushed out towards the middle of each cup.
    P0 = g.attrs["P0"]
    for s, sg in (("l", 1), ("r", -1)):
        A = apex[s]
        dd = np.hypot(P0[:, 0] - A[0], P0[:, 2] - A[2])
        side = P0[:, 0] * sg > 0
        nrm = g.vertex_normals()
        g.co += nrm * (0.006 * np.clip(1 - (dd / 0.075) ** 2, 0, 1) * side)[:, None]
    g.co = g.smooth_values(g.co, 2, 0.4)
    g.part = ["plate"] * len(g.faces)
    g.kind = ["plate"] * len(g.faces)
    for i, fc in enumerate(g.faces):
        g.panel[i] = "cup_l" if P0[fc, 0].mean() > 0 else "cup_r"
    g.smooth_edges(rounds=4)
    rims = [g.co[lp].copy() for lp in g.edge_loops()]
    g.rim(depth=0.004, back=0.0)
    cups = g.copy()
    for R in rims:
        if len(R) < 6:
            continue
        P2, N2 = wo.clean_loop(R, unit(R - R.mean(0)), 0.008)
        g.join(wo.tube(np.concatenate([P2, P2[:1]]), 0.0035, sides=6, part="plate", kind="plate", caps=False))
        for i in range(0, len(P2), max(1, len(P2) // 7)):
            nn = unit(P2[i] - R.mean(0)) * 0.3 + np.array([0, -1.0, 0])
            g.join(wo.stud(P2[i] + unit(nn) * 0.003, unit(nn), 0.003, 0.002, part="metal", kind="metal", sides=6))
    mid_z = (apex["l"][2] + apex["r"][2]) / 2 - 0.01
    boss, bn = ray_onto(body, np.array([0, -0.4, mid_z]), (0, 1, 0), 0.01)
    g.join(wo.stud(boss, bn, 0.016, 0.008, part="metal", kind="engraved", sides=10))
    # Straps: from each cup's top over the shoulder, and round the back from each cup's side.
    for s, sg in (("l", 1), ("r", -1)):
        A = apex[s]
        tp, _ = ray_onto(g, np.array([A[0], -0.4, A[2] + 0.07]), (0, 1, 0), 0.001)
        sh = np.array([0.1 * sg, M.centre_y(M.shoulder_top), M.shoulder_top + 0.012])
        bk = np.array([0.08 * sg, M.centre_y(A[2]) + 0.15, A[2] - 0.05])
        P, N = cord_path(body, [tp, sh + np.array([0, -0.03, 0]), sh, sh + np.array([0, 0.05, -0.04]), bk], 24, radius=0.0006, over=cups)
        g.join(wo.strip(P, N, 0.016, 0.003, part="leather", kind="leather", closed=False, panel=f"strap_{s}"))
    # The band: from one cup's side round the back to the other's, on the skin, buckled at the spine.
    zr = mid_z - 0.06
    ring = torso_ring(body, M, zr, n=56)
    a = np.arctan2(ring[:, 0], -(ring[:, 1] - M.centre_y(zr)))
    order = np.argsort(np.mod(a, 2 * math.pi))
    ring = ring[order]
    a = np.mod(a[order], 2 * math.pi)
    ring = ring[(a > 0.9) & (a < 2 * math.pi - 0.9)]
    P, N = cord_path(body, ring, 40, radius=0.0006)
    P, N = oriented(P, N, UP)
    g.join(wo.strip(P, N, 0.018, 0.003, part="leather", kind="leather", closed=False, panel="band"))
    jb = len(P) // 2
    g.join(wo.box_ring(P[jb] + N[jb] * 0.0045, N[jb], UP, 0.024, 0.022, 0.004, 0.003, part="metal", kind="metal"))
    # Below: the leather brief, a belt of plaques, a front plate, cloth flaps.
    br = brief(body, M, kind="leather", part="leather", offset=0.004, top_front=M.crotch + 0.08, top_back=M.crotch + 0.11)
    br.attrs = {}
    g.join(br)
    zb = M.crotch + 0.095
    P = torso_ring(body, M, zb, regions=("hips", "torso"), n=48, tilt=0.03)
    P, N = cord_path(body, np.concatenate([P, P[:1]]), 60, radius=0.0035, regions=("hips", "torso"))
    P, N = P[:-1], N[:-1]
    P, N = oriented(P, N, UP)
    g.join(wo.strip(P, N, 0.03, 0.005, part="leather", kind="leather", panel="belt"))
    for i in range(0, len(P), 3):
        g.join(wo.stud(P[i] + N[i] * 0.005, N[i], 0.012, 0.004, part="plate", kind="engraved", sides=8))
    # The front plate: a shaped steel guard over the brief's front, with a rolled edge.
    fp = skin_patch(body, M, ["pelvis", "thigh_l", "thigh_r", "spine_01"], 0.012, decim=0.5, rounds=12)
    Q0 = fp.attrs["P0"]
    fp.clip(np.where(Q0[:, 1] < M.centre_y(Q0[:, 2]), brief_field(body, M, Q0, M.crotch + 0.075, 9.0, 1.9, 9.0, gusset=0.02), 1.0))
    fp.part = ["plate"] * len(fp.faces)
    fp.kind = ["plate"] * len(fp.faces)
    fp.panel = ["front_plate"] * len(fp.faces)
    fp.attrs = {}
    fp.smooth_edges(rounds=4)
    edge = [fp.co[lp].copy() for lp in fp.edge_loops()]
    fp.rim(depth=0.004, back=0.0)
    for R in edge:
        if len(R) > 6:
            P2, N2 = wo.clean_loop(R, unit(R - R.mean(0)), 0.008)
            fp.join(wo.tube(np.concatenate([P2, P2[:1]]), 0.003, sides=6, part="plate", kind="plate", caps=False))
    g.join(fp)
    a = np.arctan2(P[:, 0], -(P[:, 1] - M.centre_y(P[:, 2])))
    for target, width, length, seed in ((0.0, 0.16, 0.34, 91), (math.pi, 0.2, 0.36, 92)):
        d = np.abs(np.angle(np.exp(1j * (a - target))))
        sel = np.nonzero(d < 1.2)[0]
        order = np.argsort(np.angle(np.exp(1j * (a[sel] - target))))
        Q, QN = P[sel][order], N[sel][order]
        s_ = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(Q, axis=0), axis=1))])
        keep = np.abs(s_ - s_[-1] / 2) < width / 2
        Q, QN = wo.resample(Q[keep], QN[keep], width / 10, closed=False)
        flap = hanging_flap(body, M, Q - UP * 0.016 + QN * 0.012, QN, length, kind="cloth", part="cloth", seed=seed, bending=0.8)
        flap.attrs = {}
        mo.lined(flap, part="cloth", kind="cloth", depth=0.002)
        g.join(flap)
    g.attrs = {k: v for k, v in g.attrs.items() if k.startswith("paint_")}
    wo.fit(g, body, loose=smoothstep(zb - 0.05, zb - 0.3, g.co[:, 2]), smooth_rounds=8, clearance=0.003, regions=("torso", "hips", "neck", "thighs"), region_mask=g.co[:, 2] > zb - 0.03)
    return g


def barbarian_harness(body, M):
    """A barbarian's harness: two broad leather straps crossing on the chest and back through an iron ring,
    studded, a wide belt with a heavy buckle, and a shaggy fur mantle over the left shoulder."""
    g = None
    ring_c, ring_n = ray_onto(body, np.array([0, -0.4, M.chest_z - 0.02]), (0, 1, 0), 0.012)
    back_c, back_n = ray_onto(body, np.array([0, 0.4, M.chest_z - 0.02]), (0, -1, 0), 0.008)
    zbelt = M.waist_z - 0.03
    for sg in (1, -1):
        sh = np.array([0.1 * sg, M.centre_y(M.shoulder_top), M.shoulder_top + 0.01])
        hip_f = np.array([0.15 * -sg, M.centre_y(zbelt) - 0.12, zbelt + 0.02])
        hip_b = np.array([0.15 * -sg, M.centre_y(zbelt) + 0.12, zbelt + 0.02])
        P, N = cord_path(body, [hip_f, (ring_c + hip_f) / 2, ring_c, (ring_c + sh) / 2 + np.array([0, -0.02, 0.03]), sh, sh + np.array([0, 0.06, -0.03]), back_c, hip_b], 44, radius=0.0012)
        s = wo.strip(P, N, 0.042, 0.005, part="leather", kind="leather", closed=False, panel=f"strap_{sg}")
        g = s if g is None else g.join(s)
        for i in range(2, len(P) - 2, 4):
            g.join(wo.stud(P[i] + N[i] * 0.005, N[i], 0.0045, 0.0035, part="metal", kind="metal", sides=6))
    for c, n in ((ring_c, ring_n), (back_c, back_n)):
        e1 = unit(np.cross(n, UP))
        e2 = np.cross(n, e1)
        circle = np.array([c + n * 0.008 + (e1 * math.cos(a) + e2 * math.sin(a)) * 0.032 for a in np.linspace(0, 2 * math.pi, 18)])
        g.join(wo.tube(circle, 0.0065, sides=6, part="metal", kind="metal", caps=False))
    P = torso_ring(body, M, zbelt, n=56)
    P, N = cord_path(body, np.concatenate([P, P[:1]]), 70, radius=0.004)
    P, N = P[:-1], N[:-1]
    P, N = oriented(P, N, UP)
    g.join(wo.strip(P, N, 0.07, 0.008, part="leather", kind="leather", panel="belt"))
    j = int(np.argmin(P[:, 1]))
    g.join(wo.box_ring(P[j] + N[j] * 0.01, N[j], UP, 0.075, 0.08, 0.012, 0.006, part="metal", kind="metal"))
    for i in range(0, len(P), 4):
        g.join(wo.stud(P[i] + N[i] * 0.008 + UP * 0.022, N[i], 0.004, 0.003, part="metal", kind="metal", sides=6))
        g.join(wo.stud(P[i] + N[i] * 0.008 - UP * 0.022, N[i], 0.004, 0.003, part="metal", kind="metal", sides=6))
    # The fur mantle over the left shoulder: a thick, shaggy pelt with a ragged edge.
    S = M.J["upperarm_l"]
    keep = M.surf & np.isin(body.bone, ["clavicle_l", "upperarm_l", "spine_03"]) & (body.co[:, 0] > 0.0) & (body.co[:, 2] > S[2] - 0.16)
    fur = wo.Geo.from_body(body, body_polys(body, keep))
    fur = wo.decimate(fur, 0.35)
    fur.attrs["P0"] = fur.co.copy()
    wo.wrap(fur, body, 0.03, rounds=20, factor=0.5)
    P0 = fur.attrs["P0"]
    ang = np.arctan2(P0[:, 2] - S[2], P0[:, 0] - (S[0] - 0.08))
    jag = 0.018 * np.sin(ang * 23 + 1.3) + 0.01 * np.sin(ang * 41)
    dd = np.hypot(P0[:, 0] - (S[0] - 0.04), (P0[:, 2] - (S[2] + 0.02)) * 1.1)
    fur.clip(dd - (0.17 + jag + 0.03 * (P0[:, 1] > M.centre_y(P0[:, 2]))))
    nrm = fur.vertex_normals()
    lumps = wo.value_noise(fur.co, 22.0, 9) * 0.008 + wo.value_noise(fur.co, 60.0, 10) * 0.004
    fur.co += nrm * lumps[:, None]
    fur.part = ["fur"] * len(fur.faces)
    fur.kind = ["fur"] * len(fur.faces)
    fur.panel = ["fur"] * len(fur.faces)
    fur.down = [(0, 0, -1)] * len(fur.faces)
    fur.attrs = {}
    fur.smooth_edges(rounds=1)
    fur.rim(depth=0.016, back=0.02)
    n_straps = g.n
    g.join(fur)
    g.attrs = {k: v for k, v in g.attrs.items() if k.startswith("paint_")}
    # (The straps and belt move with the skin under them; the fur follows the shoulder and arm.)
    wo.fit(g, body, loose=(np.arange(g.n) >= n_straps) * 0.5, smooth_rounds=3, clearance=0.004, regions=TORSO, region_mask=np.arange(g.n) < n_straps)
    return g


# ── Running ──────────────────────────────────────────────────────────────────────────────────────────

F = ("female",)
PIECES = {
    # Swim and summer.
    "bikini_top": dict(make=bikini_top, layer=1, slot="chest", sexes=F, hides=["underwear-top"], parts={"cloth": SWIM_RED, "trim": SWIM_RED}),
    "bikini_bottom": dict(make=bikini_bottom, layer=1, slot="groin", sexes=F, hides=["underwear-bottom"], parts={"cloth": SWIM_RED, "trim": SWIM_RED}),
    "swim_trunks": dict(make=swim_trunks, layer=1, slot="legs", hides=["hips", "underwear-bottom"], parts={"cloth": SWIM_NAVY, "trim": WHITE, "laces": WHITE}),
    "one_piece_swimsuit": dict(make=one_piece_swimsuit, layer=1, slot="body", sexes=F, hides=["underwear"], parts={"cloth": SWIM_TEAL, "trim": SWIM_TEAL}),
    # Casual tops.
    "crop_top": dict(make=crop_top, layer=1, slot="top", hides=["underwear-top"], parts={"cloth": KNIT_OAT, "trim": KNIT_OAT}),
    "tank_top": dict(make=tank_top, layer=1, slot="top", hides=["underwear-top"], parts={"cloth": KNIT_GREY, "trim": KNIT_GREY}),
    "t_shirt": dict(make=t_shirt, layer=1, slot="top", hides=["torso", "underwear-top"], parts={"cloth": LINEN}),
    "blouse": dict(make=blouse, layer=1, slot="top", sexes=F, hides=["underwear-top"], parts={"cloth": WHITE, "laces": CORD}),
    "vest": dict(make=vest, layer=3, slot="vest", hides=[], parts={"cloth": VELVET_RED, "trim": TRIM_GOLD, "laces": CORD, "metal": BRASS}),
    "corset": dict(make=corset, layer=3, slot="waist", hides=[], parts={"leather": LEATHER_DARK, "trim": LEATHER, "laces": CORD, "metal": BRASS}),
    # Bottoms.
    "shorts": dict(make=shorts, layer=1, slot="legs", hides=["hips", "underwear-bottom"], parts={"cloth": CANVAS, "laces": CORD}),
    "short_skirt": dict(make=short_skirt, layer=2, slot="legs", hides=["hips", "underwear-bottom"], parts={"cloth": WOOL_RED, "trim": TRIM_GOLD}),
    "pleated_skirt": dict(make=pleated_skirt, layer=2, slot="legs", hides=["hips", "underwear-bottom"], parts={"cloth": WOOL_GREEN}),
    "leggings": dict(make=leggings, layer=1, slot="legs", hides=["hips", "thighs", "calves", "underwear-bottom"], parts={"cloth": KNIT_GREY, "trim": KNIT_GREY}),
    "loincloth": dict(make=loincloth, layer=1, slot="legs", hides=["underwear-bottom"], parts={"cloth": SUEDE, "under": LINEN, "belt": LEATHER_DARK, "metal": BRASS}),
    # Robes and long wear.
    "robe": dict(make=robe, layer=2, slot="body", hides=["torso", "upperarms", "hips", "thighs", "calves", "underwear"], parts={"cloth": WOOL_PLUM, "trim": TRIM_GOLD, "cord": TRIM_GOLD}),
    "long_coat": dict(make=long_coat, layer=4, slot="coat", hides=["upperarms"], parts={"cloth": WOOL_BROWN, "trim": WOOL_BROWN, "lining": WOOL_RED, "belt": LEATHER_DARK, "metal": BRASS}),
    "gown": dict(make=gown, layer=2, slot="body", sexes=F, hides=["upperarms", "forearms", "hips", "thighs", "calves", "underwear"], parts={"bodice": VELVET_BLUE, "cloth": VELVET_BLUE, "trim": TRIM_GOLD, "metal": GOLD, "gem": GEM_BLUE}),
    "apron": dict(make=apron, layer=3, slot="apron", hides=[], parts={"cloth": CANVAS, "trim": CANVAS}),
    # Footwear and accessories.
    "sandals": dict(make=sandals, layer=2, slot="feet", hides=[], parts={"sole": LEATHER_DARK, "leather": LEATHER, "metal": BRASS}),
    "tall_boots": dict(make=tall_boots, layer=2, slot="feet", hides=["feet", "calves"], parts={"leather": LEATHER_DARK, "trim": LEATHER_DARK, "sole": LEATHER_DARK, "metal": IRON}),
    "gloves": dict(make=gloves, layer=2, slot="hands", hides=["hands"], parts={"leather": LEATHER}),
    "belt_pouches": dict(make=belt_pouches, layer=4, slot="belt", hides=[], parts={"belt": LEATHER_DARK, "pouch": LEATHER, "metal": BRASS}),
    "scarf": dict(make=scarf, layer=5, slot="neck", hides=[], parts={"cloth": KNIT_RED}),
    "hood": dict(make=hood, layer=5, slot="head", hides=["hair"], parts={"cloth": WOOL_GREY, "lining": WOOL_BROWN}, head=True),
    "circlet": dict(make=circlet, layer=4, slot="brow", hides=[], parts={"metal": GOLD, "gem": GEM_RED}, head=True),
    # Armour.
    "brigandine": dict(make=brigandine, layer=4, slot="armour", hides=[], parts={"cloth": VELVET_RED, "trim": LEATHER_DARK, "metal": BRASS}),
    "scale_mail": dict(make=scale_mail, layer=3, slot="armour", hides=["torso", "hips", "underwear"], parts={"scale": STEEL, "trim": LEATHER_DARK}),
    "gambeson": dict(make=gambeson, layer=2, slot="armour_under", hides=["torso", "upperarms", "hips", "underwear"], parts={"cloth": QUILT, "laces": LEATHER_DARK}),
    "tassets": dict(make=tassets, layer=4, slot="tassets", hides=[], parts={"plate": STEEL, "leather": LEATHER_DARK, "metal": BRASS}),
    "gauntlets": dict(make=gauntlets, layer=3, slot="hands", hides=["hands"], parts={"plate": STEEL, "leather": LEATHER_DARK, "metal": BRASS}),
    "sabatons": dict(make=sabatons, layer=3, slot="feet", hides=["feet"], parts={"plate": STEEL, "sole": LEATHER_DARK, "metal": BRASS}),
    "full_helm": dict(make=full_helm, layer=4, slot="head", hides=["hair", "neck"], parts={"plate": STEEL, "trim": BRASS}, head=True),
    "bikini_armour": dict(make=bikini_armour, layer=3, slot="armour", sexes=F, hides=["underwear"], parts={"plate": STEEL, "leather": LEATHER_DARK, "metal": BRASS, "cloth": WOOL_RED}),
    "barbarian_harness": dict(make=barbarian_harness, layer=3, slot="harness", hides=[], parts={"leather": LEATHER_DARK, "metal": IRON, "fur": FUR}),
}


def main():
    args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    mo.run(PIECES, args)


if __name__ == "__main__":
    main()
