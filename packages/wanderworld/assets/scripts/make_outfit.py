"""Wanderworld's first outfit pieces for the base avatar: cloth and armour made around the male and female
bodies, skinned to their skeleton and carrying their shape keys. Writes assets/models/outfit-<piece>.glb,
each with a `male` and a `female` mesh (and a debug .blend in assets/build, or in WW_OUTFIT_BUILD). Run
(BLENDER: your Blender executable; add piece names after `--` for only those, and `male` or `female` for
one body):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_outfit.py
    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_outfit.py -- shirt boots

How each piece is made is in wwoutfit.py. In the .glb, each mesh's extras say what the game needs:
`outfit`, `slot`, `body`, `layer` (1 next to the skin … 5 a cloak), `hides` (the body regions it covers,
comma separated, the game's words: torso, hips, upperarms, forearms, hands, thighs, calves, feet, neck, head,
underwear, underwear-top, underwear-bottom, and hair for a helm) and
`parts` (its materials, each also naming its `part` in its own extras, to recolour through the base
colour factor).
"""

import math
import os
import sys

import bpy
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import wwoutfit as wo  # noqa: E402
from wwoutfit import smoothstep, unit  # noqa: E402

# Colours each part starts with: (colour, roughness, metalness).
LINEN = (0xE4DCC8, 0.92, 0.0)
CORD = (0x6A5038, 0.85, 0.0)
WOOL_BROWN = (0x5C4A3A, 0.95, 0.0)
WOOL_GREEN = (0x4A5E3A, 0.95, 0.0)
WOOL_BLUE = (0x3E5068, 0.95, 0.0)
TRIM = (0x9A6A3A, 0.9, 0.0)
LEATHER = (0x6B4428, 0.62, 0.0)
LEATHER_DARK = (0x3E2A1C, 0.6, 0.0)
STEEL = (0xB4B8BE, 0.38, 1.0)
IRON = (0x8A8C90, 0.5, 1.0)
BRASS = (0xC09048, 0.4, 1.0)

UP = np.array([0.0, 0.0, 1.0])


# ── Landmarks ────────────────────────────────────────────────────────────────────────────────────────


def limb(P, joints):
    """Each point's place along a chain of joints (0 at the first, 1 at the second, …, running a little
    past both ends), its distance from the chain, the unit vector out to it, and the chain's direction
    there."""
    P = np.atleast_2d(P)
    k = len(joints) - 1
    best = np.full(len(P), np.inf)
    t = np.zeros(len(P))
    axis = np.zeros((len(P), 3))
    foot = np.zeros((len(P), 3))
    for i in range(k):
        a, b = joints[i], joints[i + 1]
        ab = b - a
        u = (P - a) @ ab / (ab @ ab)
        lo = -0.6 if i == 0 else 0.0
        hi = 1.6 if i == k - 1 else 1.0
        u = np.clip(u, lo, hi)
        q = a + np.outer(u, ab)
        d = np.linalg.norm(P - q, axis=1)
        better = d < best - 1e-12
        best[better] = d[better]
        t[better] = i + u[better]
        axis[better] = unit(ab)
        foot[better] = q[better]
    return t, best, unit(P - foot), axis


class Marks:
    """Where things are on one body: joints, the crotch, the torso's middle (front to back) by height."""

    def __init__(self, body):
        self.body = body
        J = self.J = body.J
        co = body.co
        surf = np.zeros(body.n, dtype=bool)
        surf[np.unique(body.tris)] = True
        self.surf = surf
        mid = surf & (np.abs(co[:, 0]) < 0.004) & np.isin(body.region, ["hips", "thighs"]) & (co[:, 2] > 0.5)
        self.crotch = float(co[mid, 2].min())
        torso = surf & np.isin(body.region, ["torso", "hips"]) & (np.abs(co[:, 0]) < 0.1)
        zs = np.linspace(self.crotch, J["neck_01"][2] + 0.05, 24)
        cs = []
        for z in zs:
            m = torso & (np.abs(co[:, 2] - z) < 0.02)
            cs.append((co[m, 1].min() + co[m, 1].max()) / 2 if m.sum() > 4 else np.nan)
        cs = np.array(cs)
        good = ~np.isnan(cs)
        self._zs, self._cs = zs[good], cs[good]
        self.neck = J["neck_01"]
        self.shoulder_top = float(co[surf & np.isin(body.bone, ["clavicle_l", "clavicle_r"]), 2].max())
        self.chest_z = J["spine_03"][2] - 0.02
        # The front of the chest at the slit's height, and the waist (narrowest above the hips).
        self.waist_z = J["spine_01"][2] + 0.02
        # Where the hands and feet begin (as the game hides regions): a sleeve or a trouser leg must
        # reach a little past these so no hidden skin shows a gap.
        self.hand_t = min(limb(co[surf & (body.bone == f"hand_{s}")], self.arm_joints(s))[0].min() for s in "lr")
        self.foot_t = min(limb(co[surf & np.isin(body.bone, [f"foot_{s}", f"ball_{s}"])], self.leg_joints(s))[0].min() for s in "lr")
        self.shin_low = float(co[surf & np.isin(body.bone, ["calf_l", "calf_r"]), 2].min())
        wo.log(f"marks: crotch {self.crotch:.3f}, hands from t={self.hand_t:.3f}, feet from t={self.foot_t:.3f}")

    def centre_y(self, z):
        return np.interp(z, self._zs, self._cs)

    def arm_joints(self, s):
        return [self.J[f"upperarm_{s}"], self.J[f"lowerarm_{s}"], self.J[f"hand_{s}"]]

    def leg_joints(self, s):
        return [self.J[f"thigh_{s}"], self.J[f"calf_{s}"], self.J[f"foot_{s}"]]

    def arm_fields(self, P0):
        """(t, r, out, axis) along each point's own side's arm (t: 0 shoulder, 1 elbow, 2 wrist)."""
        n = len(P0)
        t = np.full(n, -1.0)
        r = np.zeros(n)
        out = np.zeros((n, 3))
        axis = np.zeros((n, 3))
        for s, sg in (("l", 1), ("r", -1)):
            m = P0[:, 0] * sg > 0
            if m.any():
                t[m], r[m], out[m], axis[m] = limb(P0[m], self.arm_joints(s))
        return t, r, out, axis

    def leg_fields(self, P0):
        n = len(P0)
        t = np.full(n, -1.0)
        r = np.zeros(n)
        out = np.zeros((n, 3))
        axis = np.zeros((n, 3))
        for s, sg in (("l", 1), ("r", -1)):
            m = P0[:, 0] * sg > 0
            if m.any():
                t[m], r[m], out[m], axis[m] = limb(P0[m], self.leg_joints(s))
        return t, r, out, axis

    def armhole(self, P0):
        """Positive on the sleeve side of the armhole seam: past a plane across the upper arm near the
        shoulder joint, and near the arm's axis."""
        t, r, _, _ = self.arm_fields(P0)
        out = np.zeros(len(P0))
        for s, sg in (("l", 1), ("r", -1)):
            S, E = self.J[f"upperarm_{s}"], self.J[f"lowerarm_{s}"]
            d = unit(E - S)
            m = P0[:, 0] * sg > 0
            out[m] = (P0[m] - S) @ d + 0.012 - 0.9 * np.maximum(r[m] - 0.065, 0)
        return out


def angle_round(P, centre):
    """Angle about the vertical through centre: 0 to the front (-Y), ±pi at the back, positive to +X."""
    d = P - centre
    return np.arctan2(d[:, 0], -d[:, 1])


def body_polys(body, keep):
    """The body's polygons all of whose vertices pass keep (a per-vertex mask)."""
    return [bool(keep[p].all()) for p in map(np.array, body.polys)]


def near_surface(geo, point, lift=0.0015, direction=(0, 1, 0)):
    """Where a ray from point along direction first meets geo (else the nearest point), and its normal,
    lifted off it."""
    bvh, _ = wo.geo_bvh(geo)
    hit = bvh.ray_cast(wo.Vector(point), wo.Vector(direction), 2.0)
    if hit[0] is None:
        hit = bvh.find_nearest(wo.Vector(point))
    p, n = np.array(hit[0]), np.array(hit[1])
    if n @ (np.asarray(point) - p) < 0:
        n = -n
    return p + n * lift, n


# ── Sleeves, collars and cuffs shared by the tops ────────────────────────────────────────────────────


def sleeve_panels(g, M, front_back=True):
    """Splits a top into front, back and sleeve panels (side, shoulder and armhole seams) and cuts each
    sleeve under the arm."""
    P0 = g.attrs["P0"]
    if front_back:
        g.split(P0[:, 1] - M.centre_y(P0[:, 2]), edge_class="seam")
        P0 = g.attrs["P0"]
    g.split(M.armhole(P0), edge_class="seam")
    P0 = g.attrs["P0"]
    hole = M.armhole(P0)
    t, r, out, axis = M.arm_fields(P0)
    for i, f in enumerate(g.faces):
        c = P0[f].mean(0)
        s = "l" if c[0] > 0 else "r"
        if hole[f].mean() > 0:
            g.panel[i] = f"sleeve_{s}"
            S, W = M.J[f"upperarm_{s}"], M.J[f"hand_{s}"]
            g.down[i] = tuple(unit(W - S))
        else:
            g.panel[i] = ("back" if c[1] > M.centre_y(c[2]) else "front") if front_back else "body"
    # Under each sleeve, a seam along its lowest line, from the armhole to the cuff, along the mesh's
    # own edges (so it always runs the whole way and the sleeve unwraps flat).
    open_edge = np.zeros(g.n, dtype=bool)
    for lp in g.edge_loops():
        open_edge[lp] = True
    on_seam = np.zeros(g.n, dtype=bool)
    for (a, b), c in g.edge.items():
        if c == "seam":
            on_seam[[a, b]] = True
    for s in ("l", "r"):
        faces = np.array([g.panel[i] == f"sleeve_{s}" for i in range(len(g.faces))])
        verts = np.zeros(g.n, dtype=bool)
        for i in np.nonzero(faces)[0]:
            verts[g.faces[i]] = True
        J = M.arm_joints(s)

        def under_score(P, J=J):
            _, _, o_, ax = limb(P, J)
            under = unit(np.cross(ax, np.cross(-UP, ax)))
            return (o_ * under).sum(1)

        P0 = g.attrs["P0"]
        u = under_score(P0)
        t_all = limb(P0, J)[0]
        cand = verts & on_seam & (t_all < 0.7)
        if not cand.any():
            continue
        start = cand & (u >= np.sort(u[cand])[-min(3, cand.sum())])
        cand = verts & open_edge
        if not cand.any():
            continue
        cand &= t_all > t_all[cand].max() - 0.15
        end = cand & (u >= np.sort(u[cand])[-min(3, cand.sum())])

        def cost(P, J=J):
            return 1 + 40 * (1 - np.clip(under_score(P, J), -1, 1)) ** 2

        if not wo.seam_path(g, faces, start, end, cost):
            wo.log(f"  warning: no seam path under sleeve {s}")


def loop_by(g, score):
    """The open edge loop with the highest score(points)."""
    loops = g.edge_loops()
    return max(loops, key=lambda lp: score(g.co[lp]))


def band(points, normals, width, thickness, part, kind, closed=True, lift=0.0, up=None, panel="band"):
    """A strip lying on a loop of points, `width` across, pushed `lift` out; with `up` the band is placed
    above the points (its lower edge on them) along up."""
    P = np.asarray(points, dtype=np.float64)
    N = unit(normals)
    s = wo.strip(P + N * lift, N, width, thickness, part=part, kind=kind, closed=closed, panel=panel)
    return s


def oriented(P, N, want_b):
    """Orders a chain so that strip()'s across direction (N x T) points along want_b."""
    T = np.roll(P, -1, 0) - P
    B = np.cross(N, T)
    if (B @ want_b).mean() < 0:
        return P[::-1].copy(), N[::-1].copy()
    return P, N


# ── The shirt ────────────────────────────────────────────────────────────────────────────────────────


def neckline(body, M, lift=0.006, bins=36):
    """A smooth neckline height round the neck (a function of points, by their angle about the neck's
    vertical): just above the highest skin of the torso region there, so the torso can be hidden without a
    gap, and at least 3 cm below the head's skin (jaw, chin, skull), so nothing reaches the face."""
    co = body.co
    d = co - M.neck
    near = M.surf & (np.hypot(d[:, 0], d[:, 1]) < 0.13) & (np.abs(d[:, 2]) < 0.15)
    ang = np.arctan2(d[:, 0], -d[:, 1])
    edges = np.linspace(-math.pi, math.pi, bins + 1)
    top = np.full(bins, np.nan)
    head = np.full(bins, np.nan)
    torso = near & (body.region == "torso")
    headv = near & (body.bone == "Head")
    for i in range(bins):
        m = (ang >= edges[i]) & (ang < edges[i + 1])
        if (m & torso).any():
            top[i] = co[m & torso, 2].max()
        if (m & headv).any():
            head[i] = co[m & headv, 2].min()
    idx = np.arange(bins)
    good = ~np.isnan(top)
    top = np.interp(idx, idx[good], top[good], period=bins)
    for _ in range(3):
        top = np.maximum(top, (np.roll(top, 1) + top + np.roll(top, -1)) / 3)
    z = top + lift
    hg = ~np.isnan(head)
    if hg.any():
        head = np.interp(idx, idx[hg], head[hg], period=bins)
        # (4.5 cm, so a band collar standing up from the neckline still keeps 1.5 cm or more from the jaw.)
        z = np.minimum(z, head - 0.045)
    centres = (edges[:-1] + edges[1:]) / 2

    def at(P):
        a = np.arctan2(P[:, 0] - M.neck[0], -(P[:, 1] - M.neck[1]))
        return np.interp(a, centres, z, period=2 * math.pi)

    return at


def head_guard(geo, body, keys=("jaw", "cheeks", "neck")):
    """The closest the piece comes to the head's skin (jaw, chin, face, skull) at rest and with each of
    the face and neck keys at 1."""
    head_tris = body.tris[(body.bone[body.tris] == "Head").all(1)]
    out = {}
    for k in ("rest",) + tuple(keys):
        bco = body.co + (body.keys[k] if k != "rest" else 0)
        gco = geo.co + (geo.keys[k] if k != "rest" else 0)
        bvh = wo.BVHTree.FromPolygons(bco.tolist(), head_tris.tolist())
        loc, _, _, d = wo.nearest(bvh, gco)
        dist = np.linalg.norm(gco - loc, axis=1)
        out[k] = float(dist.min())
        if k == "rest":
            i = int(np.argmin(dist))
            wo.log(f"  closest to the head at {np.round(gco[i], 3)} (head skin at {np.round(loc[i], 3)}), part {geo.part[next(fi for fi, f in enumerate(geo.faces) if i in f)]}")
    return out


def shirt(body, M):
    """A linen shirt to the hips: full sleeves gathered into cuffs, a band collar and a laced slit at the
    neck over a recessed placket (so the chest never shows a hole)."""
    sel = {"spine_01", "spine_02", "spine_03", "clavicle_l", "clavicle_r", "pelvis", "neck_01", "upperarm_l", "upperarm_r", "lowerarm_l", "lowerarm_r"}
    keep = np.isin(body.bone, list(sel)) | (np.isin(body.bone, ["thigh_l", "thigh_r"]) & (body.co[:, 2] > M.crotch + 0.03))
    g = wo.decimate(wo.Geo.from_body(body, body_polys(body, keep)), 0.72)
    g.kind = ["linen"] * len(g.faces)
    P0 = g.co.copy()
    g.attrs["P0"] = P0.copy()
    t, r, out, axis = M.arm_fields(P0)
    arm = M.armhole(P0) > -0.03
    hem_z = M.crotch + 0.075
    arm_bone = np.isin(body.bone_at(P0), ["upperarm_l", "upperarm_r", "lowerarm_l", "lowerarm_r", "hand_l", "hand_r"])
    on_arm = g.smooth_values(arm_bone.astype(float), 2, 0.5) * (M.armhole(P0) > -0.05)
    # Close over the chest and shoulders, looser towards the hem; sleeves full over the forearm and
    # gathered at the wrist.
    end = M.hand_t + 0.035
    # (Room at the waist for trousers' waistband under it.)
    torso_off = 0.0045 + 0.004 * smoothstep(M.chest_z, M.waist_z, P0[:, 2])
    sleeve_off = 0.0055 + 0.009 * smoothstep(0.6, 1.5, t) - 0.01 * smoothstep(end - 0.17, end - 0.05, t)
    off = np.maximum(torso_off * (1 - on_arm) + sleeve_off * on_arm, 0.0045)
    wo.wrap(g, body, off, rounds=12)
    # Below the chest the shirt hangs from it and the seat instead of following the waist.
    # Below the waist the shirt eases over the hips instead of following them in.
    wo.drape(g, body, M.centre_y, M.waist_z, hem_z - 0.05, 0.012, slope=0.5, weight=1 - on_arm)
    # The hem (a little lower at the front and back), the wrists, the neckline.
    ang = angle_round(P0, np.array([0, M.centre_y(hem_z), 0]))
    g.clip(hem_z - 0.02 * np.cos(ang) ** 2 - P0[:, 2])
    P0 = g.attrs["P0"]
    t, *_ = M.arm_fields(P0)
    g.clip(np.where(M.armhole(P0) > 0, t - end, -1))
    P0 = g.attrs["P0"]
    zn = neckline(body, M)
    g.clip(P0[:, 2] - zn(P0))
    sleeve_panels(g, M)
    P0 = g.attrs["P0"]
    # The laced slit: a narrow V at the front of the neck, recessed (the placket behind the laces).
    v_top = float(zn(M.neck[None] + np.array([[0, -0.08, 0]]))[0]) - 0.004
    v_bot = v_top - 0.1

    def width(z):
        return 0.003 + 0.011 * smoothstep(v_bot, v_top, z)

    front = P0[:, 1] < M.centre_y(P0[:, 2])
    vf = np.where(front, np.abs(P0[:, 0]) - width(P0[:, 2]), 0.05)
    vf = np.maximum(vf, v_bot - P0[:, 2])
    outside = g.split(vf, edge_class="hem")
    nrm = g.vertex_normals()
    inside = np.zeros(g.n, dtype=bool)
    for i, f in enumerate(g.faces):
        if not outside[i]:
            inside[f] = True
    g.co[inside] -= nrm[inside] * 0.004
    g.set_faces(~outside, panel="placket")
    # Folds: soft waves round the full sleeve, a few across the elbow's inside, flutes falling to the hem.
    P0 = g.attrs["P0"]
    t, r, out, axis = M.arm_fields(P0)
    fwd = np.array([0, -1, 0])
    a = np.arctan2((out * np.cross(axis, fwd)).sum(1), (out * fwd).sum(1))
    sleeve = smoothstep(-0.02, 0.04, M.armhole(P0))
    wave = 0.0035 * np.sin(a * 5 + t * 2.3) * smoothstep(0.6, 1.3, t) * smoothstep(end - 0.03, end - 0.15, t)
    wave += 0.002 * np.sin(t * 22.0) * smoothstep(0.75, 0.9, t) * smoothstep(1.25, 1.1, t) * np.clip((out * fwd).sum(1), 0, 1)
    ang = angle_round(P0, np.array([0, M.centre_y(hem_z), 0]))
    hang = 0.004 * np.sin(ang * 7 + 0.8 * np.sin(ang * 3)) * smoothstep(M.waist_z + 0.05, hem_z, P0[:, 2]) * (1 - sleeve)
    g.displace(np.maximum(wave * sleeve + hang, -0.002))
    # Open edges: the neckline (under the collar), the hem and the cuffs.
    neck_loop = loop_by(g, lambda p: p[:, 2].mean())
    wrist_loops = [loop_by(g, lambda p, sg=sg: p[:, 0].mean() * sg) for sg in (1, -1)]
    neck_pts = g.co[neck_loop].copy()
    g.smooth_edges()
    neck_pts = g.co[neck_loop].copy()
    wrists = [g.co[lp].copy() for lp in wrist_loops]
    g.rim(depth=0.003, back=0.0)
    # The band collar, open at the front where the slit is.
    P = neck_pts
    gap = (P[:, 1] < M.neck[1]) & (np.abs(P[:, 0]) < width(v_top) + 0.002)
    order = np.argsort(np.arctan2(P[:, 0] - M.neck[0], P[:, 1] - M.neck[1]))
    P = P[order][~gap[order]]
    a = np.arctan2(P[:, 0] - M.neck[0], P[:, 1] - M.neck[1])
    # (Runs from the front left round the back to the front right; opened where the slit is.)
    cut = np.argmax(np.abs(np.diff(np.concatenate([a, a[:1] + 2 * math.pi]))))
    P = np.roll(P, -(cut + 1), axis=0)
    P, _ = wo.resample(P, np.tile(UP, (len(P), 1)), 0.01, closed=False)
    outward = unit((P - M.neck) * np.array([1, 1, 0]))
    N = unit(outward + UP * 0.3)
    P, N = oriented(P, N, UP)
    g.join(wo.strip(P + UP * 0.008 + outward * 0.0015, N, 0.02, 0.003, part="cloth", kind="linen", closed=False, panel="collar"))
    # Cuffs: bands round the wrists, just above the edge.
    for P, s in zip(wrists, ("l", "r")):
        S, E, W = M.arm_joints(s)
        d = unit(W - E)
        _, _, oo, _ = limb(P, M.arm_joints(s))
        P, N = wo.resample(P, oo, 0.01)
        P, N = oriented(P, N, -d)
        g.join(wo.strip(P - d * 0.015, N, 0.032, 0.003, part="cloth", kind="linen", panel=f"cuff_{s}"))
    # The laces: eyelets each side of the slit and a cord criss-crossing them, tied at the top.
    lacing(g, M, v_top - 0.012, v_bot + 0.02, width, rows=5, ends=0.075)
    wo.fit(g, body, clearance=0.003)
    return g


def shirt_detail(M):
    def detail(P, N, A, mask):
        flat = P.reshape(-1, 3)
        t, r, out, axis = M.arm_fields(flat)
        t = t.reshape(P.shape[:2])
        out = out.reshape(P.shape)
        axis = axis.reshape(P.shape)
        fwd = np.array([0, -1, 0])
        a = np.arctan2((out * np.cross(axis, fwd)).sum(-1), (out * fwd).sum(-1))
        # Gathers above the cuffs, crumples at the elbow's inside, drape lines down from the chest.
        gathers = 0.0012 * np.sin(a * 16 + np.sin(a * 3) * 0.6) * smoothstep(1.62, 1.82, t) * smoothstep(1.98, 1.9, t)
        elbow = 0.0009 * np.sin(t * 40 + a * 2) * np.exp(-(((t - 1.0) / 0.12) ** 2)) * np.clip((out * fwd).sum(-1) + 0.3, 0, 1)
        ang = np.arctan2(P[..., 0], -(P[..., 1] - M.centre_y(P[..., 2])))
        torso = (t < 0.2) & (P[..., 2] < M.chest_z)
        drape = 0.0012 * np.sin(ang * 9 + wo.value_noise(P * np.array([1, 1, 0.2]), 18.0, 5) * 1.5) * smoothstep(M.chest_z, M.crotch + 0.1, P[..., 2]) * torso
        h = gathers + elbow + drape
        return h, 1 + h * 60
    return detail


def region_top(body, M, regions, lift=0.008, bins=48, below=None):
    """A smooth line round the torso's vertical axis (a function of points) just above the highest skin of
    `regions` at each angle, so a piece cut there covers them without a gap. `below` (z or None) ignores
    skin above it."""
    co = body.co
    cy = M.centre_y(co[:, 2])
    ang = np.arctan2(co[:, 0], -(co[:, 1] - cy))
    sel = M.surf & np.isin(body.region, regions) & (np.abs(co[:, 0]) < 0.25)
    if below is not None:
        sel &= co[:, 2] < below
    edges = np.linspace(-math.pi, math.pi, bins + 1)
    top = np.full(bins, np.nan)
    for i in range(bins):
        m = sel & (ang >= edges[i]) & (ang < edges[i + 1])
        if m.any():
            top[i] = co[m, 2].max()
    idx = np.arange(bins)
    good = ~np.isnan(top)
    top = np.interp(idx, idx[good], top[good], period=bins)
    for _ in range(4):
        top = np.maximum(top, (np.roll(top, 1) + top + np.roll(top, -1)) / 3)
    centres = (edges[:-1] + edges[1:]) / 2

    def at(P):
        a = np.arctan2(P[:, 0], -(P[:, 1] - M.centre_y(P[:, 2])))
        return np.interp(a, centres, top + lift, period=2 * math.pi)

    return at


def lacing(g, M, z_top, z_bot, width, rows=5, part="laces", ends=0.07, x0=0.0):
    """Eyelets each side of a front opening (half-width width(z)) and a cord criss-crossing them, tied at
    the top with two hanging ends."""
    zs = np.linspace(z_top, z_bot, rows)
    holes = {}
    for sg in (1, -1):
        for i, z in enumerate(zs):
            start = np.array([x0 + sg * (width(z) + 0.007), M.centre_y(z) - 0.4, z])
            p, n = near_surface(g, start, 0.0008)
            holes[(sg, i)] = (p, unit(n))
            g.join(wo.stud(p, n, 0.003, 0.0012, part=part, kind="metal", sides=6))
    for i in range(rows - 1):
        for sg in (1, -1):
            (pa, na_), (pb, nb_) = holes[(sg, i)], holes[(-sg, i + 1)]
            lift = 0.0035 if sg > 0 else 0.0022
            mid = (pa + pb) / 2 + unit(na_ + nb_) * lift
            pts = np.array([pa + na_ * 0.0015, (pa + mid) / 2 + na_ * 0.0012, mid, (mid + pb) / 2 + nb_ * 0.0012, pb + nb_ * 0.0015])
            g.join(wo.tube(pts, 0.0015, sides=5, part=part, kind="cord"))
    if ends:
        for sg in (1, -1):
            p, n = holes[(sg, 0)]
            pts = np.array([p + n * 0.002, p + n * 0.005 - np.array([sg * 0.004, 0, 0.01]), p + n * 0.008 - np.array([sg * 0.002, 0, ends * 0.55]), p + n * 0.007 - np.array([-sg * 0.003, 0, ends])])
            g.join(wo.tube(pts, 0.0015, sides=5, part=part, kind="cord"))


def trousers(body, M):
    """Wool trousers: a waistband with a laced fly, front and back panels with side seams and an inseam,
    folds behind the knees and gathering at the ankles."""
    sel = ["pelvis", "spine_01", "spine_02", "thigh_l", "thigh_r", "calf_l", "calf_r", "foot_l", "foot_r"]
    t_leg, *_ = M.leg_fields(body.co)
    keep = np.isin(body.bone, sel) & ~(np.isin(body.bone, ["foot_l", "foot_r"]) & (t_leg > M.foot_t + 0.15))
    g = wo.decimate(wo.Geo.from_body(body, body_polys(body, keep)), 0.7)
    g.kind = ["wool"] * len(g.faces)
    P0 = g.co.copy()
    g.attrs["P0"] = P0.copy()
    t, r, out, axis = M.leg_fields(P0)
    end = M.foot_t + 0.03
    off = 0.0055 + 0.002 * smoothstep(0.3, 0.9, t) + 0.006 * smoothstep(1.1, 1.85, t) - 0.003 * smoothstep(end - 0.12, end, t)
    wo.wrap(g, body, off, rounds=12)
    waist = region_top(body, M, ["hips"], lift=0.012, below=M.J["spine_02"][2])
    g.clip(P0[:, 2] - waist(P0))
    P0 = g.attrs["P0"]
    t, *_ = M.leg_fields(P0)
    # (A level hem just below the lowest skin of the shins, so hidden shins never show a gap.)
    g.clip(np.where(P0[:, 2] < M.crotch, M.shin_low - 0.004 - P0[:, 2], -1))
    P0 = g.attrs["P0"]
    # Panels: left and right (the centre seams), front and back (side seams and inseams).
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
    # Folds: behind the knee, rings gathering above the ankle, a little sag at the seat.
    nrm = g.vertex_normals()
    back = np.clip(-(out * np.array([0, -1, 0])).sum(1), 0, 1)
    knee = 0.0025 * np.sin((t - 1.0) * 60) * np.exp(-(((t - 1.0) / 0.09) ** 2)) * (0.3 + back)
    bunch = 0.0028 * (0.5 + 0.5 * np.sin((t - end) * 85 + 1.3 * np.sin(np.arctan2(out[:, 0], out[:, 1]) * 2))) * smoothstep(end - 0.25, end - 0.1, t) * smoothstep(M.shin_low, M.shin_low + 0.04, P0[:, 2])
    shin = 0.002 * np.sin(np.arctan2(out[:, 0], -out[:, 1]) * 3 + t * 7) * smoothstep(0.2, 0.7, t)
    g.displace((knee + bunch + shin) * (P0[:, 2] < M.crotch + 0.02))
    waist_loop = loop_by(g, lambda p: p[:, 2].mean())
    g.smooth_edges()
    top = g.co[waist_loop].copy()
    g.rim(depth=0.003, back=0.0)
    # The waistband, and a short laced fly at the front.
    cyw = M.centre_y(top[:, 2])
    order = np.argsort(np.arctan2(top[:, 0], -(top[:, 1] - cyw)))
    P = top[order]
    N = unit(np.stack([P[:, 0], P[:, 1] - M.centre_y(P[:, 2]), np.zeros(len(P))], axis=1))
    P, N = wo.resample(P, N, 0.012)
    P, N = oriented(P, N, -UP)
    g.join(wo.strip(P + N * 0.0015 - UP * 0.018, N, 0.036, 0.004, part="cloth", kind="wool", panel="waistband"))
    zt = float(P[:, 2].mean()) - 0.045
    lacing(g, M, zt, zt - 0.07, lambda z: 0.004 + 0 * z, rows=3, ends=0.06)
    wo.fit(g, body, clearance=0.003)
    return g


def trousers_detail(M):
    def detail(P, N, A, mask):
        flat = P.reshape(-1, 3)
        t, r, out, axis = M.leg_fields(flat)
        t = t.reshape(P.shape[:2])
        out = out.reshape(P.shape)
        fwd = (out * np.array([0, -1, 0])).sum(-1)
        a = np.arctan2(out[..., 0], -out[..., 1])
        legs = P[..., 2] < M.crotch + 0.03
        knee = 0.0012 * np.sin(t * 70 + a * 2) * np.exp(-(((t - 1.0) / 0.1) ** 2)) * np.clip(0.4 - fwd, 0, 1) * legs
        crotch = 0.001 * np.sin(a * 6 + t * 8) * smoothstep(0.35, 0.05, t) * legs
        ankle = 0.0009 * np.sin(a * 9 + t * 40) * smoothstep(1.7, 1.95, t) * legs
        shin = 0.0008 * np.sin(t * 25 + a * 1.5) * smoothstep(0.3, 0.8, t) * smoothstep(1.7, 1.5, t) * legs * np.clip(fwd, 0, 1)
        h = knee + crotch + ankle + shin
        return h, 1 + h * 70
    return detail


# ── Lofted pieces: boots, shoes, bracers, greaves ────────────────────────────────────────────────────


def bezier(points, n):
    """n points along a polyline of control points, as a smooth (Chaikin-rounded) curve, evenly spaced."""
    P = np.asarray(points, dtype=np.float64)
    for _ in range(4):
        Q = [P[0]]
        for a, b in zip(P[:-1], P[1:]):
            Q += [0.75 * a + 0.25 * b, 0.25 * a + 0.75 * b]
        Q.append(P[-1])
        P = np.array(Q)
    seg = np.linalg.norm(np.diff(P, axis=0), axis=1)
    s = np.concatenate([[0], np.cumsum(seg)])
    t = np.linspace(0, s[-1], n)
    return np.stack([np.interp(t, s, P[:, i]) for i in range(3)], axis=1)


def body_points(body, M, side, regions, extra=None):
    """The body's skin points on one side (x sign) in the given regions."""
    sg = 1 if side == "l" else -1
    m = M.surf & np.isin(body.region, regions) & (body.co[:, 0] * sg > 0)
    if extra is not None:
        m &= extra
    return body.co[m]


def ring_points(points, slab):
    def fn(i, c, T):
        d = (points - c) @ T
        return points[np.abs(d) < slab]
    return fn


def foot_path(M, s, top_t, n_shaft, n_foot):
    """A path down the leg from top_t (1 knee, 2 ankle) to the ankle, then round the heel and forward to the
    toes, through the middle of the foot."""
    K, A = M.J[f"calf_{s}"], M.J[f"foot_{s}"]
    B, T = M.J[f"ball_{s}"], M.J[f"ball_{s}.tail"]
    top = K + (A - K) * (top_t - 1)
    toe = B + (T - B) * 0.55
    toe[2] = 0.03
    mid_foot = (A + B) / 2
    mid_foot[2] = 0.045
    bend = A.copy()
    bend[2] = 0.05
    shaft = bezier([top, A + (top - A) * 0.3, bend], n_shaft)
    foot = bezier([bend, bend + (mid_foot - bend) * 0.5 - np.array([0, 0, 0.012]), mid_foot, B * np.array([1, 1, 0]) + np.array([0, 0, 0.035]), toe], n_foot + 1)
    return np.concatenate([shaft, foot[1:]])


def footwear(body, M, top_t, offset_shaft, offset_foot, cuff=True, strap_t=None, instep_strap=False, toe_cap=False, counter=False, welt=False, collar=False):
    """Leather footwear on both feet, made from the body's own feet and shins: wrapped and smoothed hard
    (so the toes merge into one toe box and the heel into a counter), cut level just above the floor for
    a sole of its own, and cut at the top (top_t: 1 knee, 2 ankle) with a turned-in edge; then a
    turned-down cuff, a buckled strap round the ankle, or one over the instep."""
    t_leg, *_ = M.leg_fields(body.co)
    keep = np.isin(body.bone, ["foot_l", "foot_r", "ball_l", "ball_r"]) | (np.isin(body.bone, ["calf_l", "calf_r"]) & (t_leg > top_t - 0.08))
    g = wo.decimate(wo.Geo.from_body(body, body_polys(body, keep)), 0.42)
    g.part = ["leather"] * len(g.faces)
    g.kind = ["leather"] * len(g.faces)
    P0 = g.co.copy()
    g.attrs["P0"] = P0.copy()
    t, r, out, axis = M.leg_fields(P0)
    # (Roomy down to the ankle, where trousers end inside; close over the foot.)
    shaft = smoothstep(2.06, 1.96, t)
    off = offset_foot + (offset_shaft - offset_foot) * shaft
    wo.wrap(g, body, off, rounds=30, factor=0.55)
    # One toe box and a firm heel: out to the foot's convex outline in slices from heel to toe.
    for s, sg in (("l", 1), ("r", -1)):
        pts = body.co[M.surf & (body.region == "feet") & (body.co[:, 0] * sg > 0)]
        A, T = M.J[f"foot_{s}"], M.J[f"ball_{s}.tail"]
        ax = unit((T - A) * np.array([1, 1, 0]))
        sp = (pts - A) @ ax
        origin = A + ax * (sp.min() - 0.01)
        length = sp.max() - sp.min() + 0.03
        w = smoothstep(1.9, 2.0, t) * (P0[:, 0] * sg > 0)
        wo.hull_envelope(g, pts, origin, ax, length, offset_foot, weight=w)
        # (And from above and from the side, so the toe tips round off into one toe.)
        lo = pts.min(0) - 0.02
        wo.hull_envelope(g, pts, np.array([0, 0, -0.01]), np.array([0, 0, 1.0]), 0.14, offset_foot, weight=w * 0.9, bins=14, slab=0.012)
        side = np.cross(ax, [0, 0, 1])
        sp2 = (pts - A) @ side
        wo.hull_envelope(g, pts, A + side * (sp2.min() - 0.005), side, sp2.max() - sp2.min() + 0.01, offset_foot, weight=w * 0.9, bins=10, slab=0.01)
    g.co = g.smooth_values(g.co, 3, 0.4)
    wo.wrap(g, body, off, rounds=2)
    g.clip(top_t - limb_t(M, g.attrs["P0"]))
    g.clip(0.014 - g.co[:, 2])
    P0 = g.attrs["P0"]
    for i, f in enumerate(g.faces):
        side = "l" if P0[f, 0].mean() > 0 else "r"
        g.panel[i] = f"upper_{side}"
        g.down[i] = (0, 0, -1)
    # (The toe cap and the heel counter: panels of a darker leather, sewn on.)
    for want, field_of in (
        (toe_cap, lambda P, A, B, d: np.minimum((P - (A + (B - A) * 0.78)) @ d, 0.06 - P[:, 2])),
        (counter, lambda P, A, B, d: np.minimum(-((P - A) @ d) - 0.012, 0.075 - P[:, 2])),
    ):
        if not want:
            continue
        f = np.full(g.n, -1.0)
        for s, sg in (("l", 1), ("r", -1)):
            A, B = M.J[f"foot_{s}"], M.J[f"ball_{s}"]
            d = unit((B - A) * np.array([1, 1, 0]))
            side = g.co[:, 0] * sg > 0
            f[side] = field_of(g.co[side], A, B, d)
        on = g.split(f, edge_class="seam")
        for i in np.nonzero(on)[0]:
            g.part[i] = "trim"
    g.smooth_edges()
    loops = g.edge_loops()
    tops = [lp for lp in loops if g.co[lp, 2].mean() > 0.05]
    top_rings = [g.co[lp].copy() for lp in tops]
    bottoms = [g.co[lp].copy() for lp in loops if g.co[lp, 2].mean() <= 0.05]
    g.rim(depth=0.004, back=0.0, loops=[lp[::1] for lp in tops])
    extras = []
    nrm = g.vertex_normals()
    for s, sg in (("l", 1), ("r", -1)):
        side = g.co[:, 0] * sg > 0
        if strap_t is not None:
            field = np.where(side, limb_t(M, g.attrs["P0"]) - strap_t, 1.0)
            closed = True
        elif instep_strap:
            A, B = M.J[f"foot_{s}"], M.J[f"ball_{s}"]
            d = unit((B - A) * np.array([1, 1, 0.3]))
            X = A + (B - A) * 0.42
            field = np.where(side, (g.co - X) @ d, 1.0)
            closed = False
        else:
            continue
        P, N = wo.surface_loop(g, field, nrm)
        if len(P) < 6:
            continue
        P, N = wo.resample(P, N, 0.01, closed=closed)
        for _ in range(4):
            if closed:
                P = 0.5 * P + 0.25 * (np.roll(P, 1, 0) + np.roll(P, -1, 0))
                N = unit(0.5 * N + 0.25 * (np.roll(N, 1, 0) + np.roll(N, -1, 0)))
            else:
                P[1:-1] = 0.5 * P[1:-1] + 0.25 * (P[:-2] + P[2:])
                N[1:-1] = unit(0.5 * N[1:-1] + 0.25 * (N[:-2] + N[2:]))
        T = P[1] - P[0]
        P, N = oriented(P, N, np.cross(N[0], T))
        extras.append(wo.strip(P + N * 0.0008, N, 0.018, 0.003, part="leather", kind="leather", closed=closed, panel=f"strap_{s}"))
        j = int(np.argmax(P[:, 0] * sg))
        T = unit(P[(j + 1) % len(P)] - P[j - 1])
        extras.append(wo.box_ring(P[j] + N[j] * 0.0035, N[j], T, 0.026, 0.024, 0.004, 0.003, part="metal", kind="metal"))
    for ring_pts in bottoms:
        g.join(sole_slab(ring_pts, 0.004))
        if welt:
            c = ring_pts.mean(0)
            P, N = wo.clean_loop(ring_pts * np.array([1, 1, 0]) + np.array([0, 0, 0.0175]), unit((ring_pts - c) * np.array([1, 1, 0])), 0.008)
            P, N = oriented(P, N, UP)
            g.join(wo.strip(P + N * 0.002, N, 0.006, 0.0035, part="sole", kind="leather", panel="welt"))
    for ring_pts in top_rings:
        s = "l" if ring_pts[:, 0].mean() > 0 else "r"
        K, A = M.J[f"calf_{s}"], M.J[f"foot_{s}"]
        ax = unit(A - K)
        cen = ring_pts.mean(0)
        outw = unit((ring_pts - cen) - np.outer((ring_pts - cen) @ ax, ax))
        if cuff:
            P, N = wo.resample(ring_pts + outw * 0.003, outw, 0.012)
            P, N = oriented(P, N, -ax)
            g.join(wo.strip(P - ax * 0.024, N, 0.05, 0.004, part="leather", kind="leather", panel=f"cuff_{s}"))
        if collar:
            P, N = wo.clean_loop(ring_pts, outw, 0.01)
            g.join(wo.tube(np.concatenate([P, P[:1]]) + np.concatenate([N, N[:1]]) * 0.001, 0.0045, sides=6, part="leather", kind="leather", panel=f"collar_{s}", caps=False))
    for e in extras:
        g.join(e)
    wo.fit(g, body, loose=np.ones(g.n), smooth_rounds=3, clearance=0.003)
    return g


def limb_t(M, P):
    return M.leg_fields(P)[0]


def sole_slab(ring_pts, grow):
    """A flat sole under an upper's bottom edge: its outline from above, a little wider, 1.6 cm thick."""
    c = ring_pts[:, :2].mean(0)
    h = wo.hull2(ring_pts[:, :2])
    ang = np.linspace(-math.pi, math.pi, 40, endpoint=False)
    r = wo.ray_hull(h - c, ang) + grow
    ring = np.stack([c[0] + r * np.cos(ang), c[1] + r * np.sin(ang)], axis=1)
    for _ in range(2):
        ring = 0.5 * ring + 0.25 * (np.roll(ring, 1, 0) + np.roll(ring, -1, 0))
    k = len(ring)
    z0, z1 = -0.001, 0.017
    co = np.concatenate([np.c_[ring, np.full(k, z1)], np.c_[ring, np.full(k, z1 - 0.004)], np.c_[ring, np.full(k, z0)]])
    faces = [list(range(k)), list(range(2 * k, 3 * k))[::-1]]
    for i in range(k):
        j = (i + 1) % k
        faces.append([i, k + i, k + j, j])
        faces.append([k + i, 2 * k + i, 2 * k + j, k + j])
    sole = wo.Geo(co, faces, part="sole", kind="leather", panel="sole")
    sole.smooth = [False, False] + [True] * (len(faces) - 2)
    sole.sharp = {wo.ekey(i, (i + 1) % k) for i in range(k)} | {wo.ekey(2 * k + i, 2 * k + (i + 1) % k) for i in range(k)}
    sole.down = [(0, 1, 0)] * len(faces)
    for i in range(k):
        sole.edge[wo.ekey(i, (i + 1) % k)] = "edge"
    return sole


def foot_frame(M, s):
    """One foot's frame: the ankle joint, the direction from heel to toe (level), across it (to the
    foot's outside for the left), and its skin points (and the ankle's, up to 16 cm) with their place
    along the foot."""
    A, T = M.J[f"foot_{s}"], M.J[f"ball_{s}.tail"]
    d = unit((T - A) * np.array([1, 1, 0]))
    e = np.cross(d, UP)
    sg = 1 if s == "l" else -1
    body = M.body
    m = M.surf & (body.co[:, 0] * sg > 0) & ((body.region == "feet") | ((body.region == "calves") & (body.co[:, 2] < 0.16)))
    pts = body.co[m]
    a = (pts - A) @ d
    return A, d, e, pts, a


def last_shell(body, M, s, offset=0.006, toe=0.016, collar=None, around=28, step=0.011, top_extra=0.035):
    """A shoe's upper round one foot, lofted heel to toe like a cobbler's last: each slice across the
    foot is the convex outline of the foot there (so the toes make one toe box) plus `offset`, `toe` more
    at the toe; rounded off at both ends. `collar(a)` (height by place along the foot) is where the opening
    for the leg is cut. Returns the Geo (bottom still closed) with `along` per vertex."""
    A, d, e, pts, a = foot_frame(M, s)
    feet = (pts[:, 2] < 0.1) | (a > 0.03)
    a0, a1 = a[feet].min(), a[feet].max()
    n = int((a1 - a0) / step) + 1
    al = np.linspace(a0, a1, n)
    origin = A * np.array([1, 1, 0])
    cap = (lambda x: np.full(np.shape(x), 0.3)) if collar is None else collar

    def slice_pts(x):
        m = (np.abs(a - x) < max(step, 0.012)) & (pts[:, 2] < cap(x) + top_extra)
        return pts[m]

    cents, hulls = [], []
    for x in al:
        sp = slice_pts(x)
        if len(sp) < 4:
            cents.append(cents[-1] + d * step if cents else origin + d * x + UP * 0.04)
            hulls.append(hulls[-1] if hulls else None)
            continue
        q = np.stack([(sp - origin) @ e, sp[:, 2]], axis=1)
        h = wo.hull2(q)
        c2 = h.mean(0)
        cents.append(origin + d * x + e * c2[0] + UP * c2[1])
        hulls.append(sp)
    cents = np.array(cents)
    # (The centres smoothed, so the last runs straight and true.)
    for _ in range(3):
        cents[1:-1] = 0.5 * cents[1:-1] + 0.25 * (cents[:-2] + cents[2:])
    # Rounded ends: rings stepping past the heel and the toe, each smaller.
    ends_heel = [0.55, 0.85, 0.97]
    ends_toe = [0.5, 0.8, 0.95]
    path = [cents[0] - d * (offset * 1.4) * t for t in reversed(ends_heel)] + list(cents) + [cents[-1] + d * (offset + toe) * t for t in ends_toe]
    path = np.array(path)
    nh = len(ends_heel)
    scale = [math.sqrt(1 - t * t) for t in reversed(ends_heel)] + [1.0] * n + [math.sqrt(1 - t * t) for t in ends_toe]
    R = []
    for i in range(len(path)):
        j = min(max(i - nh, 0), n - 1)
        R.append(j)

    def rad(i, angles, c, T, e1, e2):
        j = R[i]
        sp = hulls[j]
        while sp is None:
            j += 1
            sp = hulls[j]
        cc = cents[j]
        q = np.stack([(sp - cc) @ e1, (sp - cc) @ e2], axis=1)
        r = wo.ray_hull(wo.hull2(q), angles)
        at_toe = smoothstep(n * 0.6, n - 1, j)
        return (r + offset + toe * 0.4 * at_toe) * scale[i]

    g = wo.loft(path, around, rad, up_hint=UP, seam_angle=math.pi, closed_start=True, closed_end=True, part="leather", kind="leather", panel=f"upper_{s}", down=(0, 0, -1))
    # Rounder: smooth round each ring and along the last, then out again wherever that brought it nearer
    # the skin than `offset`.
    for _ in range(3):
        g.co = g.smooth_values(g.co, 1, 0.4)
    wo.wrap(g, body, offset, rounds=2, factor=0.2)
    g.attrs["along"] = ((g.co - A) @ d)[:, None]
    return g


def low_shoe(body, M, collar_z=None, offset=0.006, toe_cap=True, counter=True, strap=True, roll=True, welt=True):
    """Low leather shoes on a cobbler's last: one smooth toe box, the opening round the ankle just above
    the foot (so the hidden feet never show), a toe cap and heel counter of darker leather sewn on, a
    stitched welt round a sole of its own, a rolled collar and a buckled strap over the instep."""
    g_all = None
    for s, sg in (("l", 1), ("r", -1)):
        A, d, e, pts, a = foot_frame(M, s)
        top = pts[pts[:, 2] < 0.12, 2].max() if collar_z is None else collar_z
        feet_top = body.co[M.surf & (body.region == "feet") & (body.co[:, 0] * sg > 0), 2].max()
        zc = feet_top + 0.016 if collar_z is None else collar_z
        a_open = 0.045

        def collar(x, zc=zc, a_open=a_open):
            x = np.asarray(x, dtype=np.float64)
            return zc + 0.008 * smoothstep(0.0, -0.06, x) + 1.0 * smoothstep(a_open, a_open + 0.05, x)

        g = last_shell(body, M, s, offset=offset, collar=collar, top_extra=0.02)
        al = g.attrs["along"][:, 0]
        g.clip(g.co[:, 2] - collar(al))
        g.clip(0.014 - g.co[:, 2])
        for i in range(len(g.faces)):
            g.panel[i] = f"upper_{s}"
            g.down[i] = (0, 0, -1)
        al = g.attrs["along"][:, 0]
        a_ball = float((M.J[f"ball_{s}"] - A) @ d)
        if toe_cap:
            on = g.split(np.minimum(al - (a_ball + 0.035), 0.058 - g.co[:, 2] + 0.25 * np.maximum(al - (a_ball + 0.035), 0)), edge_class="seam")
            for i in np.nonzero(on)[0]:
                g.part[i] = "trim"
                g.panel[i] = f"toe_{s}"
        al = g.attrs["along"][:, 0]
        if counter:
            on = g.split(np.minimum(-(al + 0.005), 0.072 - g.co[:, 2]), edge_class="seam")
            for i in np.nonzero(on)[0]:
                g.part[i] = "trim"
                g.panel[i] = f"heel_{s}"
        g.smooth_edges(rounds=3)
        loops = g.edge_loops()
        tops = [lp for lp in loops if g.co[lp, 2].mean() > 0.04]
        bottoms = [g.co[lp].copy() for lp in loops if g.co[lp, 2].mean() <= 0.04]
        top_rings = [g.co[lp].copy() for lp in tops]
        g.rim(depth=0.004, back=0.008, loops=tops)
        for ring_pts in bottoms:
            g.join(sole_slab(ring_pts, 0.004))
            if welt:
                c = ring_pts.mean(0)
                P, N = wo.clean_loop(ring_pts * np.array([1, 1, 0]) + np.array([0, 0, 0.0175]), unit((ring_pts - c) * np.array([1, 1, 0])), 0.008)
                P, N = oriented(P, N, UP)
                g.join(wo.strip(P + N * 0.0015, N, 0.006, 0.0035, part="sole", kind="leather", panel="welt"))
        for ring_pts in top_rings:
            c = ring_pts.mean(0)
            outw = unit((ring_pts - c) * np.array([1, 1, 0]))
            if roll:
                P, N = wo.clean_loop(ring_pts, outw, 0.009)
                g.join(wo.tube(np.concatenate([P, P[:1]]) + np.concatenate([N, N[:1]]) * 0.0015, 0.004, sides=6, part="leather", kind="leather", panel=f"collar_{s}", caps=False))
        if strap:
            nrm = g.vertex_normals()
            X = A + d * (a_open + 0.035)
            dd = d
            field = (g.co - X) @ dd
            P, N = wo.surface_loop(g, field, nrm)
            keep = P[:, 2] > 0.02
            P, N = P[keep], N[keep]
            if len(P) > 5:
                order = np.argsort((P - A) @ e)
                P, N = P[order], N[order]
                P, N = wo.resample(P, N, 0.008, closed=False)
                for _ in range(4):
                    P[1:-1] = 0.5 * P[1:-1] + 0.25 * (P[:-2] + P[2:])
                P, N = oriented(P, N, -dd)
                g.join(wo.strip(P + N * 0.001, N, 0.016, 0.003, part="leather", kind="leather", closed=False, panel=f"strap_{s}"))
                # (The buckle on the outside of the foot, halfway up.)
                j = int(np.argmin(np.abs(P[:, 2] - 0.05) + 10 * ((P[:, 0] - A[0]) * sg < 0)))
                j = min(max(j, 1), len(P) - 2)
                T = unit(P[j + 1] - P[j - 1])
                g.join(wo.box_ring(P[j] + N[j] * 0.0035, N[j], T, 0.022, 0.02, 0.0035, 0.003, part="metal", kind="metal"))
        g.attrs = {k: v for k, v in g.attrs.items() if k.startswith("paint_")}
        g_all = g if g_all is None else g_all.join(g)
    wo.fit(g_all, body, loose=np.ones(g_all.n), smooth_rounds=3, clearance=0.003)
    return g_all


def boots(body, M):
    """Tall leather boots: a mid-calf shaft with a turned-down cuff, a strap and buckle at the ankle and a
    stout sole; roomy enough for trousers tucked in."""
    return footwear(body, M, 1.4, 0.016, 0.008, cuff=True, strap_t=1.86)


def shoes(body, M):
    """Low leather shoes to just above the ankle: a toe cap and heel counter of darker leather sewn on, a
    stitched welt round the sole, a rolled collar and a buckled strap over the instep."""
    return low_shoe(body, M)


def feet_detail(M):
    def detail(P, N, A, mask):
        # Creases across the instep and wrinkles round the ankle.
        h = np.zeros(P.shape[:2])
        for s, sg in (("l", 1), ("r", -1)):
            A_ = M.J[f"foot_{s}"]
            d = P - A_
            side = (P[..., 0] * sg) > 0
            r = np.hypot(d[..., 0], d[..., 2])
            wr = 0.0004 * np.sin(P[..., 2] * 260 + np.sin(np.arctan2(d[..., 0], d[..., 1]) * 3)) * smoothstep(0.02, 0.06, P[..., 2]) * smoothstep(0.16, 0.1, P[..., 2])
            h += wr * side
        return h, 1 + h * 50
    return detail


# ── Shared builders: tops, skirts, rigid limb shells ─────────────────────────────────────────────────


def top_shell(body, M, hem_z, sleeve_t=None, kind="cloth", part="cloth", torso_off=0.006, waist_off=0.016, sleeve_off=0.008, drape_off=0.024, neck_lift=0.006, decim=0.72, scoop=0.0):
    """A top made from the body's torso (and arms to sleeve_t: 1 elbow, 2 wrist; None for sleeveless):
    wrapped, hanging below the chest, cut at hem_z, at the wrists or the armholes, and at a neckline
    just above the torso region (lowered at the front by `scoop`, never nearer the head than 3 cm).
    Returns the Geo (panels front, back, sleeves; not yet rimmed) and its neckline function."""
    arm_b = ["upperarm_l", "upperarm_r"] + (["lowerarm_l", "lowerarm_r"] if sleeve_t and sleeve_t > 1 else [])
    sel = ["spine_01", "spine_02", "spine_03", "clavicle_l", "clavicle_r", "pelvis", "neck_01", *arm_b]
    keep = np.isin(body.bone, sel) | (np.isin(body.bone, ["thigh_l", "thigh_r"]) & (body.co[:, 2] > hem_z - 0.06))
    if sleeve_t is None:
        keep |= np.isin(body.bone, ["upperarm_l", "upperarm_r"])
    g = wo.decimate(wo.Geo.from_body(body, body_polys(body, keep)), decim)
    g.part = [part] * len(g.faces)
    g.kind = [kind] * len(g.faces)
    P0 = g.co.copy()
    g.attrs["P0"] = P0.copy()
    t, r, out, axis = M.arm_fields(P0)
    arm_bone = np.isin(body.bone_at(P0), ["upperarm_l", "upperarm_r", "lowerarm_l", "lowerarm_r", "hand_l", "hand_r"])
    on_arm = g.smooth_values(arm_bone.astype(float), 2, 0.5) * (M.armhole(P0) > -0.05)
    t_off = torso_off + (waist_off - torso_off) * smoothstep(M.chest_z, M.waist_z, P0[:, 2])
    off = np.maximum(t_off * (1 - on_arm) + sleeve_off * on_arm, 0.004)
    wo.wrap(g, body, off, rounds=12)
    if drape_off:
        wo.drape(g, body, M.centre_y, M.chest_z - 0.02, hem_z - 0.05, drape_off, slope=0.3, weight=1 - on_arm)
    ang = angle_round(P0, np.array([0, M.centre_y(hem_z), 0]))
    g.clip(hem_z - P0[:, 2])
    P0 = g.attrs["P0"]
    t, *_ = M.arm_fields(P0)
    if sleeve_t is None:
        # Armholes: where the skin under the piece turns from torso to arm (the armpit's own crease),
        # a little into the torso.
        armish = np.isin(body.bone_at(P0), ["upperarm_l", "upperarm_r", "lowerarm_l", "lowerarm_r", "hand_l", "hand_r"]).astype(float)
        armish = g.smooth_values(armish, 4, 0.5)
        g.clip(armish - 0.35 + 0.25 * smoothstep(M.shoulder_top - 0.02, M.shoulder_top + 0.04, P0[:, 2]))
    else:
        g.clip(np.where(M.armhole(P0) > 0, t - sleeve_t, -1))
    P0 = g.attrs["P0"]
    zn = neckline(body, M, lift=neck_lift)
    if scoop:
        base = zn

        def zn(P, base=base):
            a = np.arctan2(P[:, 0] - M.neck[0], -(P[:, 1] - M.neck[1]))
            return base(P) - scoop * np.clip(np.cos(a), 0, 1) ** 2
    g.clip(P0[:, 2] - zn(P0))
    P0 = g.attrs["P0"]
    if sleeve_t is None:
        g.split(P0[:, 1] - M.centre_y(P0[:, 2]), edge_class="seam")
        P0 = g.attrs["P0"]
        for i, f in enumerate(g.faces):
            c = P0[f].mean(0)
            g.panel[i] = "back" if c[1] > M.centre_y(c[2]) else "front"
    else:
        sleeve_panels(g, M)
    return g, zn


def skirt_loft(body, M, z_top, z_bottom, offset, flare=0.12, around=48, part="cloth", kind="cloth", folds=0.012, n_folds=11, seed=0, slit=None, regions=("hips", "thighs", "calves", "torso"), panel="skirt", ring_step=0.024):
    """A skirt (or the skirt of a tunic, a hauberk or a dress): rings round the body's vertical axis from
    z_top to z_bottom, each the body's convex outline there plus offset, never coming in going down and
    flaring out by `flare` metres a metre, with folds that deepen towards the hem. `slit` (angles in
    radians, 0 the front) opens it from the hem up."""
    pts = body.co[M.surf & np.isin(body.region, list(regions))]
    n_rings = max(4, int((z_top - z_bottom) / ring_step))
    zs = np.linspace(z_top, z_bottom, n_rings)
    path = np.stack([np.zeros(n_rings), M.centre_y(zs), zs], axis=1)
    path[:, 1] = M.centre_y(np.clip(zs, M.crotch, None))
    # Each ring's radii round the angles (0 the front, then towards -X), from the body's outline; then
    # smoothed down the skirt, never inside the outline, never coming in going down, flaring out.
    angles = math.pi + np.arange(around) * (2 * math.pi / around)
    e1 = np.array([0.0, -1.0, 0.0])
    e2 = np.array([-1.0, 0.0, 0.0])
    R = np.zeros((n_rings, around))
    for i in range(n_rings):
        c = path[i]
        sel = pts[np.abs(pts[:, 2] - c[2]) < 0.012]
        if len(sel) >= 3:
            q = np.stack([(sel - c) @ e1, (sel - c) @ e2], axis=1)
            R[i] = wo.ray_hull(wo.hull2(q), angles) + offset
        else:
            R[i] = R[i - 1] if i else 0.05
    floor = R.copy()
    for _ in range(3):
        for i in range(1, n_rings):
            R[i] = np.maximum(R[i], R[i - 1] + flare * (zs[i - 1] - zs[i]))
        S = R.copy()
        S[1:-1] = (R[:-2] + 2 * R[1:-1] + R[2:]) / 4
        R = np.maximum(S, floor)
    for i in range(1, n_rings):
        R[i] = np.maximum(R[i], R[i - 1] + flare * (zs[i - 1] - zs[i]))

    def rad(i, a, c, T, e1, e2):
        return R[i]

    # (e1 to the front, e2 to the side: angle 0 is the front.)
    g = wo.loft(path, around, rad, up_hint=(0, -1, 0), seam_angle=math.pi, part=part, kind=kind, panel=panel, down=(0, 0, -1))
    # (Cut from gores, so the texture runs straight down each and doesn't shear as the skirt flares.)
    gore_uvs(g, around, max(4, around // 8), panel)
    ring = g.attrs["ring"][:, 0]
    ang = g.attrs["angle"][:, 0]
    depth = smoothstep(z_top - 0.08, z_bottom, g.co[:, 2])
    rng = np.random.default_rng(seed)
    phase = rng.random(4) * 6
    wave = np.sin(ang * n_folds + phase[0] + 0.6 * np.sin(ang * 3 + phase[1])) + 0.35 * np.sin(ang * (2 * n_folds + 1) + phase[2])
    centre = np.stack([np.zeros(g.n), M.centre_y(np.clip(g.co[:, 2], M.crotch, None)), g.co[:, 2]], axis=1)
    radial = unit((g.co - centre) * np.array([1, 1, 0]))
    g.co = g.co + radial * (folds * depth * (0.55 + 0.45 * wave))[:, None]
    if slit:
        for a0, h in slit:
            ang = g.attrs["angle"][:, 0]
            d = np.angle(np.exp(1j * (ang - a0)))
            g.clip(np.where(g.co[:, 2] < z_bottom + h, 0.012 - np.abs(d) * 0.25, -1.0))
    return g


def limb_shell(body, M, bones, t_range, fields, offset, decim=0.6, rounds=25, envelope=True):
    """A rigid sleeve round a limb (a bracer, a greave): the body's skin of `bones` between t_range on the
    limb (fields: M.arm_fields or M.leg_fields), wrapped well off it and rounded out to its convex
    outline, cut cleanly at both ends."""
    t_all = fields(body.co)[0]
    keep = np.isin(body.bone, bones) & (t_all > t_range[0] - 0.12) & (t_all < t_range[1] + 0.12)
    g = wo.decimate(wo.Geo.from_body(body, body_polys(body, keep)), decim)
    P0 = g.co.copy()
    g.attrs["P0"] = P0.copy()
    wo.wrap(g, body, offset, rounds=rounds)
    if envelope:
        for sg in (1, -1):
            side = P0[:, 0] * sg > 0
            if not side.any():
                continue
            t, r, out, axis = fields(P0[side][:1])
            pts = body.co[M.surf & np.isin(body.bone, bones) & (body.co[:, 0] * sg > 0)]
            ax = axis[0]
            sp = (pts - pts.mean(0)) @ ax
            origin = pts.mean(0) + ax * (sp.min() - 0.01)
            wo.hull_envelope(g, pts, origin, ax, sp.max() - sp.min() + 0.02, offset, weight=side.astype(float), bins=24, slab=0.01)
    t = fields(g.attrs["P0"])[0]
    g.clip(t_range[0] - t)
    t = fields(g.attrs["P0"])[0]
    g.clip(t - t_range[1])
    g.co = g.smooth_values(g.co, 2, 0.4)
    return g


def belt(g, M, z, width=0.04, thickness=0.005, lift=0.003, buckle=True, part="belt", metal="metal", pouch=False):
    """A leather belt round a piece at height z (on its surface), with a buckle at the front and the
    strap's end hanging from it."""
    nrm = g.vertex_normals()
    P, N = wo.surface_loop(g, g.co[:, 2] - z, nrm)
    if len(P) < 8:
        return
    N = unit(N * np.array([1, 1, 0.2]))
    P, N = wo.resample(P, N, 0.012)
    for _ in range(3):
        P = 0.5 * P + 0.25 * (np.roll(P, 1, 0) + np.roll(P, -1, 0))
    P, N = oriented(P, N, UP)
    g.join(wo.strip(P + N * lift, N, width, thickness, part=part, kind="leather", panel="belt"))
    if buckle:
        j = int(np.argmin(P[:, 1] - np.abs(P[:, 0]) * 0.0 + np.abs(P[:, 0]) * 2))
        c = P[j] + N[j] * (lift + thickness + 0.001)
        g.join(wo.box_ring(c, N[j], UP, 0.05, 0.055, 0.007, 0.004, part=metal, kind="metal"))
        # The tongue of the strap hanging down beside the buckle.
        side = unit(np.cross(N[j], UP))
        tip = c + side * 0.03
        pts = np.array([tip, tip - UP * 0.04 + N[j] * 0.002, tip - UP * 0.09 + N[j] * 0.004])
        tn = np.repeat(N[j][None], 3, axis=0)
        g.join(wo.strip(pts, tn, width * 0.8, thickness * 0.8, part=part, kind="leather", closed=False, panel="belt_end"))
    if pouch:
        j = int(np.argmax(P[:, 0]))
        c = P[j] + N[j] * 0.012 - UP * 0.05
        pts = np.array([c + UP * 0.05, c, c - UP * 0.05])

        def prad(i, angles, cc, T, e1, e2):
            return np.full(len(angles), [0.028, 0.04, 0.03][i])

        p = wo.loft(pts, 10, prad, up_hint=N[j], closed_start=True, closed_end=True, part=part, kind="leather", panel="pouch")
        g.join(p)


# ── Tunic, skirt, dress ──────────────────────────────────────────────────────────────────────────────


def hem_trim(g, loops_pts, width, thickness, part="trim", kind="cloth", lift=0.001, up=None):
    """Bands of trim along open edges (each a closed chain of points), lying on the cloth."""
    for P in loops_pts:
        if len(P) < 6:
            continue
        c = P.mean(0)
        N = unit((P - c) * np.array([1, 1, 0.15]))
        P2, N2 = wo.clean_loop(P, N, 0.02)
        want = up if up is not None else UP
        P2, N2 = oriented(P2, N2, want)
        g.join(wo.strip(P2 + N2 * lift + want * width * 0.45, N2, width, thickness, part=part, kind=kind, panel="trim"))


def tunic(body, M):
    """A belted wool tunic to mid-thigh over the shirt: three-quarter sleeves, a round neck, contrasting
    trim at the neck, cuffs and hem, a leather belt with a buckle and a pouch."""
    waist = M.waist_z - 0.01
    # (Over a shirt: a little room, but shaped to the chest and taken in at the waist under the belt.)
    g, zn = top_shell(body, M, waist - 0.03, sleeve_t=1.5, kind="wool", torso_off=0.011, waist_off=0.012, sleeve_off=0.014, drape_off=0.0, neck_lift=0.012, decim=0.55)
    hem = M.crotch - 0.17
    sk = skirt_loft(body, M, waist + 0.02, hem, 0.02, flare=0.24, around=36, kind="wool", folds=0.01, n_folds=9, panel="skirt")
    g.smooth_edges()
    loops = [g.co[lp].copy() for lp in g.edge_loops()]
    neck = max(loops, key=lambda p: p[:, 2].mean())
    cuffs = sorted(loops, key=lambda p: -abs(p[:, 0].mean()))[:2]
    g.rim(depth=0.004, back=0.0)
    g.join(sk)
    sk_bottom = sk.co[sk.attrs["ring"][:, 0] == sk.attrs["ring"][:, 0].max()]
    g.rim(depth=0.004, back=0.0, loops=[lp for lp in g.edge_loops() if g.co[lp, 2].mean() < hem + 0.02])
    hem_trim(g, [sk_bottom], 0.035, 0.003, up=UP)
    hem_trim(g, [neck], 0.022, 0.003, up=-UP)
    for c in cuffs:
        s = "l" if c[:, 0].mean() > 0 else "r"
        S, E, W = M.arm_joints(s)
        hem_trim(g, [c], 0.03, 0.003, up=unit(S - W))
    belt(g, M, waist + 0.005, width=0.04, lift=0.004, part="belt", pouch=True)
    wo.fit(g, body, loose=smoothstep(waist, hem, g.co[:, 2]) * (g.co[:, 2] < waist), smooth_rounds=8, clearance=0.004)
    return g


def gore_uvs(g, around, gores, panel):
    """Splits a fresh loft (rings of `around`) into `gores` panels round it, each one's texture places
    measured round each ring from the gore's middle, so it lies flat as a trapezoid of its own and packs as
    an island apart from the next (as a skirt is cut from gores and sewn)."""
    nr = g.n // around
    rings = g.co[: nr * around].reshape(nr, around, 3)
    seg = np.linalg.norm(np.roll(rings, -1, axis=1) - rings, axis=2)
    circ = np.concatenate([np.zeros((nr, 1)), np.cumsum(seg, axis=1)], axis=1)
    bounds = [k * around // gores for k in range(gores + 1)]
    for fi in range((nr - 1) * around):
        i, j = divmod(fi, around)
        k = j * gores // around
        g.panel[fi] = f"{panel}{k}"
        vs = [uv[1] for uv in g.uv[fi]]
        cen = [(circ[r, bounds[k]] + circ[r, bounds[k + 1]]) / 2 for r in (i, i + 1)]
        g.uv[fi] = [(circ[i, j] - cen[0] + k * 5.0, vs[0]), (circ[i, j + 1] - cen[0] + k * 5.0, vs[1]), (circ[i + 1, j + 1] - cen[1] + k * 5.0, vs[2]), (circ[i + 1, j] - cen[1] + k * 5.0, vs[3])]


def mark_seams(g):
    """Every edge between two panels of the same part becomes a sewn seam."""
    for e, fs in g.edges().items():
        if len(fs) == 2 and g.panel[fs[0]] != g.panel[fs[1]] and g.part[fs[0]] == g.part[fs[1]]:
            g.edge[e] = "seam"


def sim_skirt(body, M, z_top, z_bottom, offset=0.012, flare=0.5, around=72, ring_step=0.02, gores=6, part="cloth", kind="wool", panel="skirt", pin_rings=1, band=0, band_part="trim", band_kind="embroidery", bending=0.25, noise=0.006, seed=0, frames=90, open_front=None, slits=(), tension=40, regions=("hips", "thighs", "calves", "torso"), colliders=()):
    """A skirt that hangs in real folds: rings round the body from z_top (gathered just off the body there)
    to z_bottom, flaring out by `flare` metres a metre (the more flare, the deeper the folds), then draped
    over the body with the cloth simulation, its top `pin_rings` rings held. `open_front` (angle, a
    function of height, radians from the front) opens it down the front (a coat), `slits` [(angle, height
    from the hem)] open it from the hem up. The lowest `band` rings become a trim band of their own part,
    its texture turned to run along it."""
    # (A flared cone falls nearly straight when it drapes, so it ends lower than it starts: start it short.)
    z_end = z_top - (z_top - z_bottom) / math.sqrt(1 + flare * flare)
    g = skirt_loft(body, M, z_top, z_end, offset, flare=flare, around=around, part=part, kind=kind, folds=0.0, panel=panel, ring_step=ring_step, regions=regions)
    # Gores: the skirt is sewn from `gores` panels, each its own piece of the texture, seamed together.
    gore_uvs(g, around, gores, panel)
    ring = g.attrs["ring"][:, 0]
    last = ring.max()
    if open_front is not None:
        ang = np.angle(np.exp(1j * g.attrs["angle"][:, 0]))
        g.clip(open_front(g.co[:, 2]) - np.abs(ang))
    for a0, h in slits:
        ang = np.angle(np.exp(1j * g.attrs["angle"][:, 0]))
        d = np.angle(np.exp(1j * (ang - a0)))
        g.clip(np.where(g.co[:, 2] < z_bottom + h, 0.015 - np.abs(d) * 0.2, -1.0))
    ring = g.attrs["ring"][:, 0]
    pin = smoothstep(pin_rings + 0.5, -0.5, ring)
    wo.cloth_sim(g, body, pin, frames=frames, bending=bending, noise=noise, seed=seed, tension=tension, colliders=colliders)
    if band:
        r0 = last - band + 0.5
        for i, f in enumerate(g.faces):
            if ring[f].mean() > r0:
                g.part[i] = band_part
                g.kind[i] = band_kind
                g.panel[i] = g.panel[i].replace(panel, panel + "-band")
                if g.uv[i] is not None:
                    # (A quarter turn: the band's pattern runs round the skirt.)
                    g.uv[i] = [(-v, u) for u, v in g.uv[i]]
        g.attrs["paint_across"] = np.clip((ring - r0) / max(band - 0.5, 0.5), 0, 1)[:, None]
    mark_seams(g)
    return g


def gathered_band(g, M, top_pts, width=0.035, thickness=0.004, part="trim", kind="cloth", lift=0.002):
    """A waistband over the gathered top edge of a skirt (its top ring of points)."""
    P, N = top_pts, unit((top_pts - top_pts.mean(0)) * np.array([1, 1, 0]))
    P, N = wo.resample(P, N, 0.012)
    P, N = oriented(P, N, -UP)
    g.join(wo.strip(P + N * lift - UP * width * 0.2, N, width, thickness, part=part, kind=kind, panel="waistband"))


def skirt(body, M):
    """A long wool skirt from the waist to the floor, gathered into a waistband and hanging in real folds
    (draped with the cloth simulation), with an embroidered band at the hem."""
    waist = region_top(body, M, ["hips"], lift=0.012, below=M.J["spine_02"][2])
    zt = float(waist(np.array([[0.0, M.centre_y(M.waist_z) - 0.2, M.waist_z]]))[0])
    g = sim_skirt(body, M, zt, 0.045, offset=0.014, flare=0.5, around=60, ring_step=0.032, kind="wool", band=2, seed=2)
    top = g.co[g.attrs["ring"][:, 0] == 0].copy()
    g.rim(depth=0.004, back=0.008, loops=[lp for lp in g.edge_loops() if g.co[lp, 2].mean() < zt - 0.2])
    gathered_band(g, M, top, 0.04, 0.004, part="trim", kind="cloth")
    g.attrs.pop("ring", None)
    wo.fit(g, body, loose=smoothstep(zt - 0.1, zt - 0.45, g.co[:, 2]), smooth_rounds=14, clearance=0.004)
    return g


def puff_sleeves(g, M, t0, t1, amount, gathers=12):
    """Puffs a short sleeve out between t0 and t1 along the arm, in soft gathers round it."""
    P0 = g.attrs["P0"]
    t, r, out, axis = M.arm_fields(P0)
    sleeve = smoothstep(-0.02, 0.03, M.armhole(P0))
    fwd = np.array([0, -1, 0])
    a = np.arctan2((out * np.cross(axis, fwd)).sum(1), (out * fwd).sum(1))
    s = np.clip((t - t0) / max(t1 - t0, 1e-6), 0, 1)
    bump = np.sin(math.pi * s) ** 0.8 * (t > t0 - 0.02)
    wave = 1 + 0.35 * np.sin(a * gathers) * smoothstep(0.55, 1.0, s)
    nrm = g.vertex_normals()
    g.co += nrm * (amount * bump * wave * sleeve)[:, None]


def dress(body, M):
    """A peasant dress: a fitted bodice laced at the front with a round neckline (just above the torso
    region, so the torso can be hidden under it) and short puffed sleeves, gathered at the waist into a
    floor-length skirt that hangs in real folds, trimmed at the neck and sleeves, an embroidered band at
    the hem."""
    waist = M.waist_z
    g, zn = top_shell(body, M, waist - 0.02, sleeve_t=0.55, kind="cloth", torso_off=0.007, waist_off=0.009, sleeve_off=0.016, drape_off=0.0, neck_lift=0.004, scoop=0.0, decim=0.35)
    puff_sleeves(g, M, 0.0, 0.55, 0.018)
    g.smooth_edges()
    loops = [g.co[lp].copy() for lp in g.edge_loops()]
    neck = max(loops, key=lambda p: p[:, 2].mean())
    sleeves = sorted(loops, key=lambda p: -abs(p[:, 0].mean()))[:2]
    g.rim(depth=0.004, back=0.0)
    for i, f in enumerate(g.faces):
        if g.panel[i] in ("front", "back"):
            g.part[i] = "bodice"
    sk = sim_skirt(body, M, waist + 0.01, 0.045, offset=0.012, flare=0.55, around=58, ring_step=0.032, kind="cloth", band=2, seed=4)
    g.join(sk)
    g.rim(depth=0.004, back=0.008, loops=[lp for lp in g.edge_loops() if g.co[lp, 2].mean() < 0.4])
    hem_trim(g, [neck], 0.018, 0.003, up=-UP)
    for c in sleeves:
        s = "l" if c[:, 0].mean() > 0 else "r"
        S, E, W = M.arm_joints(s)
        hem_trim(g, [c], 0.022, 0.003, up=unit(S - W))
    # A waist sash over the join, and lacing up the bodice.
    belt(g, M, waist + 0.01, width=0.05, thickness=0.004, lift=0.004, buckle=False, part="trim")
    zt = float(zn(M.neck[None] + np.array([[0, -0.08, 0]]))[0]) - 0.02
    lacing(g, M, zt, waist + 0.06, lambda z: 0.012 + 0 * z, rows=5, ends=0.0)
    g.attrs.pop("ring", None)
    wo.fit(g, body, loose=smoothstep(waist, waist - 0.3, g.co[:, 2]), smooth_rounds=14, clearance=0.004)
    return g


# ── Armour ───────────────────────────────────────────────────────────────────────────────────────────


def chainmail(body, M):
    """A mail hauberk to mid-thigh with sleeves to the elbows, split front and back for riding, edged with
    a row of brass rings."""
    waist = M.waist_z - 0.01
    # (Mail lies close: over a padded shirt it hangs from the shoulders and follows the figure.)
    g, zn = top_shell(body, M, waist - 0.03, sleeve_t=1.08, kind="chain", part="mail", torso_off=0.007, waist_off=0.009, sleeve_off=0.009, drape_off=0.0, neck_lift=0.012, decim=0.5)
    wo.drape(g, body, M.centre_y, M.waist_z + 0.02, waist - 0.08, 0.011, slope=0.5)
    hem = M.crotch - 0.15
    sk = skirt_loft(body, M, waist + 0.02, hem, 0.018, flare=0.2, around=40, part="mail", kind="chain", folds=0.005, n_folds=9, slit=[(0.0, 0.16), (math.pi, 0.16)])
    g.smooth_edges()
    g.join(sk)
    edges = [g.co[lp].copy() for lp in g.edge_loops()]
    g.rim(depth=0.005, back=0.0)
    for P in edges:
        if len(P) < 6:
            continue
        c = P.mean(0)
        N = unit(P - c)
        P2, N2 = wo.clean_loop(P, N, 0.022)
        P2, N2 = oriented(P2, N2, UP if c[2] < waist else -UP)
        g.join(wo.strip(P2 + N2 * 0.001, N2, 0.014, 0.004, part="trim", kind="metal", panel="trim"))
    wo.fit(g, body, loose=smoothstep(waist, hem, g.co[:, 2]) * (g.co[:, 2] < waist), smooth_rounds=8, clearance=0.004)
    return g


def arm_frame(M, s):
    """One shoulder's frame: the upper arm's joint, its direction down the arm (in the rest A-pose), and
    the direction across it that is up (the outside of the arm once it hangs down)."""
    S, E = M.J[f"upperarm_{s}"], M.J[f"lowerarm_{s}"]
    d = unit(E - S)
    up = unit(UP - d * (UP @ d))
    return S, d, up


def shoulder_lames(body, M, s, bands, offsets, part="plate", kind="plate", cap=None, width=1.75, group0=1, thickness=0.003, decim=0.7):
    """Shoulder armour on one side: a cap over the shoulder and lames below it down the outside of the
    upper arm, each a plate of its own (`bands`, (from, to) along the arm from its joint, metres), the
    higher over the lower (`offsets` off the skin), each with a back face so it has thickness, each moving
    as one (its own `group` from group0). `cap` (from, to, dome) makes the first a domed cap reaching over
    the top of the shoulder. Only the outside of the arm, `width` radians either side of its top."""
    sg = 1 if s == "l" else -1
    S, d, up = arm_frame(M, s)
    keep = np.isin(body.bone, [f"clavicle_{s}", f"upperarm_{s}", "spine_03"]) & (body.co[:, 0] * sg > 0.06)
    base = wo.Geo.from_body(body, body_polys(body, keep))
    base = wo.decimate(base, decim)
    out = None
    for k, ((a0, a1), off) in enumerate(zip(bands, offsets)):
        g = base.copy()
        g.attrs = {"P0": g.co.copy()}
        wo.wrap(g, body, off, rounds=30, factor=0.6)
        g.co = g.smooth_values(g.co, 8, 0.5)
        wo.wrap(g, body, off, rounds=1, factor=0.1)
        P0 = g.attrs["P0"]
        along = (P0 - S) @ d
        r = P0 - S - np.outer(along, d)
        side = np.cross(d, up)
        ang = np.arctan2(r @ side, r @ up)
        w = width + (0.5 if (cap is not None and k == 0) else 0.0)
        g.clip(np.maximum(np.maximum(a0 - along, along - a1), np.abs(ang) - w))
        # (A clean inner edge towards the neck, not the body's ragged boundary.)
        g.clip(0.085 - g.attrs["P0"][:, 0] * sg)
        if not g.faces:
            continue
        if cap is not None and k == 0:
            P0 = g.attrs["P0"]
            along = (P0 - S) @ d
            mid = (a0 + a1) / 2
            bump = np.clip(1 - ((along - mid) / ((a1 - a0) / 2 + 1e-6)) ** 2, 0, 1)
            g.displace(cap * bump)
        g.co = g.smooth_values(g.co, 2, 0.4)
        g.smooth_edges(rounds=4)
        g.part = [part] * len(g.faces)
        g.kind = [kind] * len(g.faces)
        g.panel = [f"lame_{s}{k}"] * len(g.faces)
        g.down = [tuple(d)] * len(g.faces)
        g.attrs = {}
        lined(g, part=part, kind=kind, depth=thickness)
        g.attrs["group"] = np.full((g.n, 1), float(group0 + k))
        out = g if out is None else out.join(g)
    return out


def lame_strap(g, M, s, a0, a1, part="leather", lift=0.0015, width=0.022, studs="metal"):
    """A strap down the outside of the upper arm over its lames, riveted where it crosses each."""
    S, d, up = arm_frame(M, s)
    bvh, _ = wo.geo_bvh(g)
    pts, nrm = [], []
    for a in np.linspace(a0, a1, 10):
        c = S + d * a
        hit = bvh.ray_cast(wo.Vector(c + up * 0.3), wo.Vector(-up), 0.3)
        if hit[0] is not None:
            pts.append(np.array(hit[0]))
            nrm.append(np.array(hit[1]))
    if len(pts) < 3:
        return
    P, N = np.array(pts), unit(np.array(nrm))
    st = wo.strip(P + N * lift, N, width, 0.003, part=part, kind="leather", closed=False, panel=f"strap_{s}")
    st.attrs["group"] = np.zeros((st.n, 1))
    g.join(st)
    for p, n in zip(P[1:-1:2], N[1:-1:2]):
        g.join(wo.stud(p + n * (lift + 0.003), n, 0.0045, 0.003, part=studs, kind="metal", sides=6))


def lame_rivets(g, M, s, bands, spread=1.2, part="metal"):
    """Rivets joining each lame to the one above, at the front and back of the arm and on top, so the
    plates read as fixed together."""
    S, d, up = arm_frame(M, s)
    side = np.cross(d, up)
    bvh, _ = wo.geo_bvh(g)
    for a0, a1 in bands[1:]:
        a = a0 + 0.012
        for ang in (-spread, 0.0, spread):
            dirn = up * math.cos(ang) + side * math.sin(ang)
            hit = bvh.ray_cast(wo.Vector(S + d * a + dirn * 0.3), wo.Vector(-dirn), 0.3)
            if hit[0] is not None:
                n = unit(np.array(hit[1]))
                g.join(wo.stud(np.array(hit[0]) + n * 0.0005, n, 0.0045, 0.0028, part=part, kind="metal", sides=6))


def leather_armour(body, M):
    """A tailored leather jerkin to the hips: close over the chest and back, taken in at the waist and
    easing over the hips, close at the armholes, edged in darker leather, buckled shut with three straps;
    leather spaulders of a cap and two lames over each shoulder, riveted to a strap."""
    hem = M.crotch + 0.07
    g, zn = top_shell(body, M, hem, sleeve_t=None, kind="leather", part="leather", torso_off=0.009, waist_off=0.009, drape_off=0.0, neck_lift=0.012, decim=0.6)
    # Easing over the hips below the waist, not hanging from the bust.
    wo.drape(g, body, M.centre_y, M.waist_z, hem - 0.05, 0.011, slope=0.6)
    g.smooth_edges(rounds=3)
    edges = [g.co[lp].copy() for lp in g.edge_loops()]
    g.rim(depth=0.005, back=0.012)
    for P in edges:
        if len(P) < 6:
            continue
        c = P.mean(0)
        N = unit(P - c)
        P2, N2 = wo.clean_loop(P, N, 0.014)
        P2, N2 = oriented(P2, N2, -UP if c[2] > M.chest_z else UP)
        T = np.roll(P2, -1, 0) - P2
        B = unit(np.cross(N2, T))
        g.join(wo.strip(P2 + N2 * 0.0008 + B * 0.005, N2, 0.014, 0.003, part="trim", kind="leather", panel="edge"))
    # Three straps with buckles across the front.
    for z in np.linspace(M.chest_z - 0.04, M.waist_z + 0.0, 3):
        nrm = g.vertex_normals()
        P, N = wo.surface_loop(g, g.co[:, 2] - z, nrm)
        keep = (P[:, 1] < M.centre_y(z)) & (np.abs(P[:, 0]) < 0.06)
        P, N = P[keep], N[keep]
        if len(P) < 4:
            continue
        order = np.argsort(P[:, 0])
        P, N = wo.resample(P[order], N[order], 0.008, closed=False)
        P, N = oriented(P, N, UP)
        g.join(wo.strip(P + N * 0.0015, N, 0.02, 0.0035, part="trim", kind="leather", closed=False, panel="strap"))
        j = len(P) // 2 + 1
        g.join(wo.box_ring(P[j] + N[j] * 0.0055, N[j], UP, 0.026, 0.028, 0.0045, 0.0035, part="metal", kind="metal"))
    g.attrs = {}
    g.attrs["group"] = np.zeros((g.n, 1))
    for s, gid in (("l", 1), ("r", 10)):
        sp = shoulder_lames(body, M, s, [(-0.07, 0.045), (0.03, 0.095), (0.08, 0.145)], [0.02, 0.016, 0.013], part="leather", kind="leather", cap=0.006, width=1.7, group0=gid, thickness=0.004)
        lame_strap(sp, M, s, -0.03, 0.14, part="trim", studs="metal")
        g.join(sp)
    wo.fit(g, body, loose=smoothstep(M.waist_z, hem, g.co[:, 2]) * 0.4, smooth_rounds=4, clearance=0.004, groups=g.attrs["group"][:, 0])
    return g


def plate_cuirass(body, M):
    """A steel breastplate and backplate shaped to the body (a breast for her, a chest for him), about a
    centimetre off it, with rolled edges, a soft ridge down the front and two lames of faulds below the
    waist, riveted, with leather straps at the sides."""
    hem = M.waist_z - 0.03
    sel = ["spine_01", "spine_02", "spine_03", "clavicle_l", "clavicle_r", "pelvis", "neck_01", "upperarm_l", "upperarm_r"]
    keep = np.isin(body.bone, sel)
    g = wo.decimate(wo.Geo.from_body(body, body_polys(body, keep)), 0.6)
    P0 = g.co.copy()
    g.attrs["P0"] = P0.copy()
    wo.wrap(g, body, 0.013, rounds=40, factor=0.6)
    g.co = g.smooth_values(g.co, 8, 0.5)
    wo.wrap(g, body, 0.012, rounds=2, factor=0.2)
    # Over mail and padding: the whole plate stands clear of them, an even swell, still smooth.
    for u in wo.CURRENT_UNDER:
        wo.keep_outside(g, u, 0.008, reach=0.04, rounds=5, body=body, spread=24, keep=0.97)
    if wo.CURRENT_UNDER:
        g.co = g.smooth_values(g.co, 4, 0.5)
        for u in wo.CURRENT_UNDER:
            wo.keep_outside(g, u, 0.007, reach=0.04, rounds=3, body=body, spread=10, keep=0.9)
    g.clip(hem - P0[:, 2])
    P0 = g.attrs["P0"]
    g.clip(M.armhole(P0) + 0.04)
    P0 = g.attrs["P0"]
    zn = neckline(body, M, lift=0.0)
    g.clip(P0[:, 2] - (zn(P0) - 0.025))
    P0 = g.attrs["P0"]
    g.split(P0[:, 1] - M.centre_y(P0[:, 2]), edge_class="cut")
    P0 = g.attrs["P0"]
    for i, f in enumerate(g.faces):
        c = P0[f].mean(0)
        g.panel[i] = "back" if c[1] > M.centre_y(c[2]) else "breast"
    front = g.co[:, 1] < M.centre_y(g.co[:, 2])
    g.co[:, 1] -= 0.004 * np.exp(-((g.co[:, 0] / 0.04) ** 2)) * front
    g.part = ["plate"] * len(g.faces)
    g.kind = ["plate"] * len(g.faces)
    g.smooth_edges(rounds=6)
    edges = [g.co[lp].copy() for lp in g.edge_loops()]
    g.attrs = {}
    lined(g, part="plate", kind="plate", depth=0.003)
    for P in edges:
        c = P.mean(0)
        N = unit(P - c)
        P2, N2 = wo.clean_loop(P, N, 0.016)
        g.join(wo.tube(np.concatenate([P2, P2[:1]]) + N2[np.r_[np.arange(len(P2)), 0]] * 0.002, 0.0042, sides=6, part="plate", kind="plate", panel="roll", caps=False))
    n_plate = g.n
    # Faulds: two lames, the first tucked 1.5 cm up under the plate's hem so no gap opens when the belly
    # grows, the second lapping over the first's lower edge from outside.
    for k in range(2):
        zt = hem + 0.015 - k * 0.05
        lame = skirt_loft(body, M, zt, zt - 0.065, 0.006 + 0.005 * k, flare=0.32, around=40, part="plate", kind="plate", folds=0.0, panel=f"fauld{k}")
        lame.attrs = {}
        wo.swell_outside(lame, wo.CURRENT_UNDER, body, M.centre_y, gap=0.004 + 0.004 * k)
        top = lame.co[:40].copy()
        lined(lame, part="plate", kind="plate", depth=0.003)
        g.join(lame)
        for a in np.linspace(-math.pi, math.pi, 10, endpoint=False):
            i = int((a + math.pi) / (2 * math.pi) * 40) % 40
            p = top[i] - UP * 0.01
            n = unit((p - np.array([0, M.centre_y(p[2]), p[2]])) * np.array([1, 1, 0]))
            g.join(wo.stud(p + n * 0.001, n, 0.0045, 0.0028, part="metal", kind="metal"))
    for sg in (1, -1):
        for z in (M.chest_z - 0.06, M.waist_z + 0.03):
            p, n = near_surface(g, np.array([sg * 0.4, M.centre_y(z), z]), 0.001, direction=(-sg, 0, 0))
            pts = np.array([p + np.array([0, -0.03, 0]), p, p + np.array([0, 0.03, 0])])
            g.join(wo.strip(pts, np.repeat(n[None], 3, 0), 0.02, 0.0035, part="leather", kind="leather", closed=False))
            g.join(wo.box_ring(p + np.array([0, -0.025, 0]) + n * 0.0045, n, UP, 0.022, 0.024, 0.004, 0.003, part="metal", kind="metal"))
    # Two shells: the breastplate and the backplate each move as one on the chest's bones, and their shape
    # keys are smoothed over each plate, so a fuller bust or belly swells the whole plate instead of
    # creasing it. The faulds and straps follow the skin under them.
    idx = np.arange(g.n)
    on_plate = idx < n_plate
    front = g.co[:, 1] < M.centre_y(g.co[:, 2])
    W0, _, _, _ = body.sample(g.co)
    keep = np.isin(wo.BONE_NAMES, ["spine_01", "spine_02", "spine_03"])
    W = W0.copy()
    for m in (on_plate & front, on_plate & ~front):
        avg = W0[m].mean(0) * keep
        W[m] = avg / max(avg.sum(), 1e-9)
    # (The faulds' keys smoothed as the plate's are, so plate and faulds swell together and keep their lap.)
    is_strap = np.zeros(g.n, dtype=bool)
    for f, pt in zip(g.faces, g.part):
        if pt == "leather":
            is_strap[f] = True
    wo.fit(g, body, weights=W, loose=(~is_strap).astype(float), smooth_rounds=1, keys_rounds=30, clearance=0.008)
    return g


def pauldrons(body, M):
    """Steel pauldrons: a domed cap over each shoulder with a rolled lower edge, and three lames below it
    down the outside of the upper arm, each tucked under the one above, riveted to a leather strap that
    runs down the arm; each plate moves as one and the set follows the arm."""
    g = None
    for s, gid in (("l", 1), ("r", 10)):
        sp = shoulder_lames(body, M, s, [(-0.08, 0.05), (0.035, 0.1), (0.085, 0.15), (0.135, 0.2)], [0.026, 0.021, 0.018, 0.015], part="plate", kind="plate", cap=0.01, width=1.8, group0=gid, thickness=0.003)
        lame_rivets(sp, M, s, [(-0.08, 0.05), (0.035, 0.1), (0.085, 0.15), (0.135, 0.2)])
        g = sp if g is None else g.join(sp)
    wo.fit(g, body, clearance=0.008, groups=g.attrs["group"][:, 0])
    return g


def limb_loft(body, M, joints, t0, t1, bones, offset, around=20, rings=10, panel="limb", part="leather", kind="leather"):
    """A clean sleeve of rings along a straight stretch of a limb (joints a -> b, from t0 to t1 of the way),
    each ring the limb's convex outline there plus offset (a number, or a function of t)."""
    a, b = joints
    path = np.array([a + (b - a) * t for t in np.linspace(t0, t1, rings)])
    sg = 1 if a[0] > 0 else -1
    pts = body.co[M.surf & np.isin(body.bone, bones) & (body.co[:, 0] * sg > 0)]
    ts = np.linspace(t0, t1, rings)

    def rad(i, angles, c, T, e1, e2):
        sel = pts[np.abs((pts - c) @ T) < 0.015]
        q = np.stack([(sel - c) @ e1, (sel - c) @ e2], axis=1)
        off = offset(ts[i]) if callable(offset) else offset
        return wo.ray_hull(wo.hull2(q), angles) + off

    g = wo.loft(path, around, rad, up_hint=(0, -1, 0), seam_angle=math.pi, part=part, kind=kind, panel=panel)
    # Rounder: smooth each ring's radius round the ring and along the limb.
    for _ in range(2):
        g.co = g.smooth_values(g.co, 1, 0.35)
    return g, path


def bracers(body, M):
    """Leather bracers on the forearms, a riveted steel splint along the outside, three straps."""
    g_all = None
    for s in ("l", "r"):
        E, W = M.J[f"lowerarm_{s}"], M.J[f"hand_{s}"]
        g, path = limb_loft(body, M, (E, W), 0.3, 0.9, [f"lowerarm_{s}"], lambda t: 0.017 - 0.003 * t, around=20, rings=10, panel=f"bracer_{s}")
        ang = g.attrs["angle"][:, 0]
        ring = g.attrs["ring"][:, 0]
        # The splint: the top third, out over the leather a little.
        ax = unit(W - E)
        up_dir = unit(np.cross(ax, np.cross(UP, ax)))
        cen = path[np.clip(ring.astype(int), 0, len(path) - 1)]
        top = ((g.co - cen) @ up_dir) / np.maximum(np.linalg.norm(g.co - cen, axis=1), 1e-9)
        g.split(top - 0.55, edge_class="edge")
        ring = g.attrs["ring"][:, 0]
        cen = path[np.clip(np.round(ring).astype(int), 0, len(path) - 1)]
        top = ((g.co - cen) @ up_dir) / np.maximum(np.linalg.norm(g.co - cen, axis=1), 1e-9)
        nrm = g.vertex_normals()
        lift = np.zeros(g.n)
        for i, f in enumerate(g.faces):
            if top[f].mean() > 0.55:
                g.part[i] = "metal"
                g.kind[i] = "plate"
                lift[f] = 0.003
        g.co += nrm * lift[:, None]
        g.rim(depth=0.005, back=0.0)
        for tt in (0.38, 0.6, 0.82):
            c = E + (W - E) * tt
            pts = []
            for a in np.linspace(0, 2 * math.pi, 20, endpoint=False):
                e1 = unit(np.cross(ax, [0, 0, 1]))
                e2 = np.cross(ax, e1)
                dvec = e1 * math.cos(a) + e2 * math.sin(a)
                p, n = near_surface(g, c + dvec * 0.2, 0.0015, direction=-dvec)
                pts.append((p, dvec))
            P = np.array([p for p, d in pts])
            N = np.array([d for p, d in pts])
            P, N = oriented(P, N, ax)
            g.join(wo.strip(P, N, 0.014, 0.003, part="leather", kind="leather", panel="strap"))
        # Rivets along the splint.
        for tt in np.linspace(0.36, 0.84, 5):
            c = E + (W - E) * tt
            p, n = near_surface(g, c + up_dir * 0.2, 0.0005, direction=-up_dir)
            g.join(wo.stud(p, n, 0.0035, 0.002, part="metal", kind="metal", sides=6))
        g_all = g if g_all is None else g_all.join(g)
    g = g_all
    g.attrs = {}
    wo.fit(g, body, rigid=None, loose=np.ones(g.n), smooth_rounds=4, clearance=0.012)
    return g


def greaves(body, M):
    """Steel greaves over the shins and boot tops, open behind and strapped, with a ridge down the shin,
    rolled edges and a knee cop."""
    g_all = None
    for s in ("l", "r"):
        K, A = M.J[f"calf_{s}"], M.J[f"foot_{s}"]
        g, path = limb_loft(body, M, (K, A), 0.12, 0.9, [f"calf_{s}"], lambda t: 0.026, around=24, rings=12, panel=f"greave_{s}", part="plate", kind="plate")
        ang = np.angle(np.exp(1j * g.attrs["angle"][:, 0]))
        # Open behind.
        g.clip(np.abs(ang) - 2.3)
        ang = np.angle(np.exp(1j * g.attrs["angle"][:, 0]))
        # A ridge down the front.
        g.co[:, 1] -= 0.007 * np.exp(-((ang / 0.3) ** 2))
        g.down = [(0, 0, -1)] * len(g.faces)
        loops = [g.co[lp].copy() for lp in g.edge_loops()]
        g.rim(depth=0.004, back=0.0)
        for P in loops:
            c = P.mean(0)
            P2, N2 = wo.clean_loop(P, unit(P - c), 0.018, closed=True)
            g.join(wo.tube(np.concatenate([P2, P2[:1]]), 0.004, sides=6, part="plate", kind="plate", panel="roll", caps=False))
        # Knee cop.
        keep = M.surf & np.isin(body.bone, [f"calf_{s}", f"thigh_{s}"]) & (np.linalg.norm(body.co - K, axis=1) < 0.1) & (body.co[:, 1] < K[1] - 0.01)
        cop = wo.Geo.from_body(body, body_polys(body, keep))
        if cop.n > 10:
            cop = wo.decimate(cop, 0.4)
            wo.wrap(cop, body, 0.05, rounds=25, factor=0.6)
            cop.co = cop.smooth_values(cop.co, 6, 0.5)
            cop.clip(np.linalg.norm((cop.co - K) * np.array([1, 0.4, 1]), axis=1) - 0.065)
            cop.smooth_edges(rounds=5)
            cop.part = ["plate"] * len(cop.faces)
            cop.kind = ["plate"] * len(cop.faces)
            cop.panel = [f"cop_{s}"] * len(cop.faces)
            cop.attrs = {}
            cop.rim(depth=0.004, back=0.0)
            g.attrs = {}
            g.join(cop)
        # Straps round the back of the calf.
        for tt in (0.3, 0.72):
            c = K + (A - K) * tt
            pts = []
            for a in np.linspace(2.1, 2 * math.pi - 2.1, 9):
                dvec = np.array([math.sin(a), -math.cos(a), 0.0])
                hit = body.bvh.ray_cast(wo.Vector(c + dvec * 0.3), wo.Vector(-dvec), 0.6)
                p = np.array(hit[0]) if hit[0] is not None else c + dvec * 0.06
                pts.append(p + dvec * 0.036)
            P = np.array(pts)
            N = unit((P - c) * np.array([1, 1, 0]))
            P, N = oriented(P, N, -UP)
            g.join(wo.strip(P, N, 0.02, 0.003, part="leather", kind="leather", closed=False, panel="strap"))
            g.join(wo.box_ring(P[0] + N[0] * 0.004, N[0], UP, 0.024, 0.026, 0.004, 0.003, part="plate", kind="metal"))
        g.attrs = {}
        g_all = g if g_all is None else g_all.join(g)
    g = g_all
    wo.fit(g, body, loose=np.ones(g.n), smooth_rounds=5, clearance=0.015)
    return g


_body_geo = {}


def body_geo(body):
    if body.sex not in _body_geo:
        _body_geo[body.sex] = wo.Geo(body.co, body.tris)
    return _body_geo[body.sex]


def head_marks(body):
    eyes = np.unique(np.array([v for p, m in zip(body.polys, body.poly_mat) if m == "eye_white" for v in p]))
    eye = body.co[eyes].mean(0)
    top = body.co[body.bone == "Head", 2].max()
    return eye, top


def helm(body, M):
    """An open-faced steel helm (a spangenhelm): a pointed dome of four plates joined by riveted bands, a
    brow band and a nasal bar; it covers the hair (hides `hair`)."""
    eye, top = head_marks(body)
    keep = (body.bone == "Head") & (body.co[:, 2] > eye[2] - 0.08)
    g = wo.decimate(wo.Geo.from_body(body, body_polys(body, keep)), 0.25)
    g.attrs["P0"] = g.co.copy()
    wo.wrap(g, body, 0.014, rounds=30, factor=0.6)
    pts = body.co[M.surf & (body.bone == "Head")]
    wo.hull_envelope(g, pts, np.array([0, eye[1] + 0.03, eye[2] - 0.1]), np.array([0, 0, 1.0]), top - eye[2] + 0.12, 0.016, bins=20, slab=0.01)
    g.co = g.smooth_values(g.co, 4, 0.5)
    # A gentle point at the crown.
    cx, cy = 0.0, eye[1] + 0.06
    rad = np.hypot(g.co[:, 0] - cx, g.co[:, 1] - cy)
    g.co[:, 2] += 0.03 * smoothstep(top - 0.1, top + 0.02, g.co[:, 2]) * np.exp(-((rad / 0.07) ** 2))
    # The rim: over the brows at the front, above the ears at the sides, down to the nape behind.
    P0 = g.attrs["P0"]
    ang = np.arctan2(P0[:, 0], -(P0[:, 1] - cy))
    edge = eye[2] + 0.028 + (0.012 - 0.028) * smoothstep(0.6, 1.4, np.abs(ang)) + (-0.045 - 0.012) * smoothstep(2.0, 2.8, np.abs(ang))
    g.clip(edge - P0[:, 2])
    g.part = ["plate"] * len(g.faces)
    g.kind = ["plate"] * len(g.faces)
    g.down = [(0, 0, -1)] * len(g.faces)
    for i, f in enumerate(g.faces):
        a = np.arctan2(g.co[f, 0].mean(), -(g.co[f, 1].mean() - cy))
        g.panel[i] = f"plate{int(((a + math.pi) / (math.pi / 2) + 0.5)) % 4}"
    g.smooth_edges(rounds=6)
    rim_pts = [g.co[lp].copy() for lp in g.edge_loops()]
    g.rim(depth=0.004, back=0.0)
    for P in rim_pts:
        c = P.mean(0)
        N = unit((P - c) * np.array([1, 1, 0.2]))
        P2, N2 = wo.clean_loop(P, N, 0.016)
        P2, N2 = oriented(P2, N2, UP)
        g.join(wo.strip(P2 + N2 * 0.001 + UP * 0.012, N2, 0.026, 0.004, part="trim", kind="metal", panel="band"))
        for j in range(0, len(P2), 3):
            g.join(wo.stud(P2[j] + N2[j] * 0.005 + UP * 0.012, N2[j], 0.004, 0.0025, part="trim", kind="metal"))
    # Four bands from the brow band up to the crown.
    bvh, _ = wo.geo_bvh(g)
    apex = g.co[np.argmax(g.co[:, 2])]
    for a in (0.0, math.pi / 2, math.pi, -math.pi / 2):
        line = []
        for z in np.linspace(edge.max() + 0.0, apex[2] - 0.01, 12):
            d = np.array([math.sin(a), -math.cos(a), 0])
            hit = bvh.ray_cast(wo.Vector(np.array([cx, cy, z]) + d * 0.3), wo.Vector(-d), 0.6)
            if hit[0] is not None:
                line.append((np.array(hit[0]), np.array(hit[1])))
        if len(line) > 3:
            P = np.array([p for p, n in line])
            N = unit(np.array([n for p, n in line]))
            P = np.concatenate([P, apex[None]])
            N = np.concatenate([N, UP[None]])
            g.join(wo.strip(P + N * 0.001, N, 0.018, 0.003, part="trim", kind="metal", closed=False, panel="rib"))
            for j in range(1, len(P) - 1, 3):
                g.join(wo.stud(P[j] + N[j] * 0.004, N[j], 0.0035, 0.002, part="trim", kind="metal"))
    # The nasal bar.
    nose_z = eye[2] - 0.045
    front = []
    for z in np.linspace(eye[2] + 0.03, nose_z, 6):
        hit = body.bvh.ray_cast(wo.Vector((0, -0.5, z)), wo.Vector((0, 1, 0)), 1.0)
        if hit[0] is not None:
            front.append(np.array(hit[0]) + np.array([0, -0.012 - 0.004 * (z < eye[2]), 0]))
    if len(front) > 2:
        P = np.array(front)
        N = np.tile([0, -1.0, 0], (len(P), 1))
        g.join(wo.strip(P, N, 0.022, 0.004, part="plate", kind="plate", closed=False, panel="nasal"))
    wo.fit(g, body, rigid=np.ones(g.n), rigid_bones=["Head"], clearance=0.008)
    return g


def lined(g, part="lining", kind="cloth", depth=0.0035, edge_kind=None, edge_part=None):
    """Gives a sheet of cloth a lining: a copy just inside it, facing in, its own part and its own places
    in the texture, sewn to the outside along every open edge (the cloth's thickness seen at the edge)."""
    lining = g.copy()
    nrm = g.vertex_normals()
    # (Normals smoothed first, so the lining follows tight folds without crossing the outside.)
    nrm = unit(g.smooth_values(nrm, 2, 0.5))
    lining.co = g.co - nrm * depth
    # (Where the sheet is creased, a smoothed normal can carry the lining out through the outside: each such
    # lining point goes back behind the nearest outside face, along that face's own normal.)
    bvh, _ = wo.geo_bvh(g)
    loc, fn, _, d = wo.nearest(bvh, lining.co)
    bad = d > -depth * 0.5
    lining.co[bad] = loc[bad] - fn[bad] * depth
    lining.faces = [f[::-1] for f in lining.faces]
    lining.uv = [[(u + 200.0, v) for u, v in reversed(uv)] if uv is not None else None for uv in lining.uv]
    lining.part = [part] * len(lining.faces)
    lining.panel = ["lining-" + p for p in lining.panel]
    lining.kind = [kind] * len(lining.faces)
    lining.edge = {}
    edges = g.edge_loops(min_len=0.0)
    off = g.n
    g.join(lining)
    for lp in edges:
        k = len(lp)
        for i in range(k):
            a, b = lp[i], lp[(i + 1) % k]
            if np.linalg.norm(g.co[a] - g.co[b]) > 0.1:
                continue
            g.faces.append([b, a, a + off, b + off])
            g.part.append(edge_part or g.part[0])
            g.panel.append("edge")
            g.down.append((0, 0, -1))
            g.uv.append(None)
            g.kind.append(edge_kind or g.kind[0])
            g.smooth.append(True)
            g.edge[wo.ekey(a, b)] = "hem"
    return g


def capelet(body, M, z_bottom, flare=0.6, around=48, kind="wool", part="cloth", offset=0.018, seed=11, front_gap=0.18, over=None, z_top=None):
    """A short cape round the shoulders, from just above the neckline's base to z_bottom, flared so it
    falls over the shoulders and upper arms in folds, draped with the cloth simulation; open a little at
    the throat."""
    zt = M.neck[2] - 0.035 if z_top is None else z_top
    shoulder_z = M.J["upperarm_l"][2]
    pts = body.co[M.surf & (np.isin(body.region, ["torso", "neck"]) | ((body.region == "upperarms") & (body.co[:, 2] > M.J["upperarm_l"][2] - 0.04)))]
    zs = np.arange(zt, z_bottom, -0.018)
    n_rings = len(zs)
    path = np.stack([np.zeros(n_rings), np.full(n_rings, M.centre_y(zt) + 0.01), zs], axis=1)
    prev = [None]

    def rad(i, angles, c, T, e1, e2):
        sel = pts[np.abs(pts[:, 2] - c[2]) < 0.014]
        r = wo.ray_hull(wo.hull2(np.stack([(sel - c) @ e1, (sel - c) @ e2], axis=1)), angles) + offset if len(sel) > 3 else prev[0]
        if prev[0] is not None:
            # (Close over the shoulders; flaring out below them.)
            r = np.maximum(r, prev[0] + (0.05 if c[2] > shoulder_z - 0.03 else flare) * (zs[i - 1] - zs[i]))
        prev[0] = r
        return r

    g = wo.loft(path, around, rad, up_hint=(0, -1, 0), seam_angle=0.0, part=part, kind=kind, panel="cape", down=(0, 0, -1))
    gore_uvs(g, around, 4, "cape")
    ang = np.angle(np.exp(1j * g.attrs["angle"][:, 0]))
    g.clip(front_gap - np.abs(ang))
    ring = g.attrs["ring"][:, 0]
    wo.cloth_sim(g, body, smoothstep(1.5, 0.5, ring), frames=90, bending=0.3, mass=0.3, noise=0.004, seed=seed, tension=50)
    # (With room: shoulder pads under it swing out further than they lie at rest when the arms come down.)
    wo.swell_outside(g, wo.CURRENT_UNDER, body, lambda z: np.full(np.shape(z), M.centre_y(zt) + 0.01), gap=0.016)
    if over is not None:
        # (Kept outside `over`, the piece it is worn on, so that never shows through it.)
        wo.keep_outside(g, over, 0.006)
    mark_seams(g)
    g.attrs = {}
    return g


def cloak(body, M):
    """A lined wool cloak hanging from the shoulders down the back to the calves, behind the arms, under a
    short shoulder cape, both draped with the cloth simulation so they fall in real folds; clasped at
    the throat with two engraved bosses and a chain. The hood up is its own mesh (`male_hood_up`,
    `female_hood_up`), shown in place of the cape's collar."""
    zt = M.neck[2] - 0.04
    zb = M.J["calf_l"][2] - 0.14
    shoulder_z = M.J["upperarm_l"][2]
    arm_ok = (body.co[:, 2] > shoulder_z - 0.02) & np.isin(body.region, ["upperarms"])
    pts = body.co[M.surf & (np.isin(body.region, ["torso", "hips", "thighs", "calves"]) | arm_ok)]
    zs = np.arange(zt, zb, -0.024)
    n_rings = len(zs)
    path = np.stack([np.zeros(n_rings), M.centre_y(np.clip(zs, M.crotch, None)), zs], axis=1)
    prev = [None]

    def rad(i, angles, c, T, e1, e2):
        sel = pts[np.abs(pts[:, 2] - c[2]) < 0.015]
        q = np.stack([(sel - c) @ e1, (sel - c) @ e2], axis=1)
        r = wo.ray_hull(wo.hull2(q), angles) + 0.022
        if prev[0] is not None:
            # (Below the shoulders it flares out, so the cloth has more width than the back and falls in folds.)
            r = np.maximum(r, prev[0] + (0.05 if c[2] > shoulder_z - 0.05 else 0.3) * (zs[i - 1] - zs[i]))
        prev[0] = r
        return r

    around = 60
    g = wo.loft(path, around, rad, up_hint=(0, -1, 0), seam_angle=0.0, part="cloth", kind="wool", panel="cloak", down=(0, 0, -1))
    gore_uvs(g, around, 6, "cloak")
    # Open at the front: a narrow gap at the throat, opening behind the arms below the shoulders.
    ang = np.angle(np.exp(1j * g.attrs["angle"][:, 0]))
    open_half = 0.22 + 1.6 * smoothstep(shoulder_z + 0.04, shoulder_z - 0.08, g.co[:, 2])
    g.clip(open_half - np.abs(ang))
    ring = g.attrs["ring"][:, 0]
    # Held on the shoulders and round the neck; the rest falls.
    wo.cloth_sim(g, body, smoothstep(3.5, 1.0, ring), frames=130, bending=0.2, mass=0.5, noise=0.006, seed=7, tension=60)
    mark_seams(g)
    g.attrs = {}
    # (Clear of what is worn under it, as an even swell, before it is lined.)
    wo.swell_outside(g, wo.CURRENT_UNDER, body, M.centre_y, mono_below=M.waist_z)
    lined(g, edge_kind="wool")
    cape = capelet(body, M, shoulder_z - 0.1, offset=0.042, over=g, flare=0.5)
    lined(cape, edge_kind="wool")
    n_cloak = g.n
    g.join(cape)
    n_cape = g.n
    # The clasp at the throat: two engraved bosses and a short chain between them.
    top = cape.co[np.abs(cape.co[:, 2] - cape.co[:, 2].max()) < 0.03]
    ends = []
    for sg in (1, -1):
        cand = top[top[:, 0] * sg > 0]
        if len(cand):
            p = cand[np.argmin(cand[:, 1])] + np.array([0, -0.004, -0.014])
            ends.append(p)
            g.join(wo.stud(p, np.array([0, -1.0, 0]), 0.015, 0.006, part="metal", kind="engraved", sides=12))
    if len(ends) == 2:
        a, b = ends
        mid = (a + b) / 2 - UP * 0.014
        g.join(wo.tube(bezier([a, mid, b], 9) + np.array([0, -0.006, 0]), 0.0025, sides=5, part="metal", kind="metal"))
    # The cloak hangs from the shoulders and back, not the arms: its weights come from the torso's skin,
    # so lowering the arms doesn't drag its sides. The cape over the shoulders follows the skin under it
    # without smoothing, like a pauldron, so it lies on the arm wherever the arm goes.
    idx = np.arange(g.n)
    cloak_v = (idx < n_cloak) | (idx >= n_cape)
    # (Its top under the cape follows the skin as the cape does, so the two move together at the shoulder.)
    wo.fit(g, body, loose=(smoothstep(shoulder_z, zb, g.co[:, 2]) * 0.9 + 0.1) * cloak_v, smooth_rounds=12, clearance=0.012, regions=("torso", "neck", "hips", "thighs", "calves"), region_mask=cloak_v & (g.co[:, 2] < shoulder_z - 0.13))
    return g


def folded_hood(body, M):
    """The hood down: a fat roll of cloth round the back and sides of the neck, on the shoulders."""
    zt = M.neck[2] - 0.02
    pts = []
    for a in np.linspace(-2.2, 2.2, 22):
        d = np.array([math.sin(a), -math.cos(a), 0])
        hit = body.bvh.ray_cast(wo.Vector(M.neck + np.array([0, 0, -0.02]) + d * 0.4), wo.Vector(-d), 0.6)
        p = np.array(hit[0]) if hit[0] is not None else M.neck + d * 0.06
        pts.append(p + d * 0.05 + np.array([0, 0, -0.015 - 0.02 * abs(math.cos(a))]))
    P = np.array(pts)

    def rad(i, angles, c, T, e1, e2):
        k = len(P)
        base = 0.022 + 0.012 * math.sin(math.pi * i / (k - 1))
        return base * (1 + 0.15 * np.sin(angles * 3 + i))

    h = wo.loft(P, 10, rad, up_hint=(0, 0, 1), closed_start=True, closed_end=True, part="cloth", kind="wool", panel="hood")
    return h


def hood_up(body, M):
    """The cloak's hood, up: a deep hood round the head with an opening for the face and a point at the
    back, meeting the cloak at the shoulders."""
    eye, top = head_marks(body)
    keep = (np.isin(body.bone, ["Head", "neck_01"])) & (body.co[:, 2] > M.neck[2] - 0.04)
    src = wo.Geo.from_body(body, body_polys(body, keep))
    # (The ears pressed flat first: their folds would carry into the hood as ear-shaped dents. The hood is
    # then pushed out over them.)
    hx = np.abs(src.co[:, 0])
    head_w = np.abs(body.co[M.surf & (body.bone == "Head"), 0]).max()
    lim = head_w - 0.03
    ear = (hx > lim) & (np.abs(src.co[:, 2] - eye[2]) < 0.07)
    src.co[ear, 0] = np.sign(src.co[ear, 0]) * lim
    g = wo.decimate(src, 0.25)
    g.attrs["P0"] = g.co.copy()
    wo.wrap(g, body, 0.03, rounds=30, factor=0.6)
    pts = body.co[M.surf & np.isin(body.bone, ["Head", "neck_01"])]
    wo.hull_envelope(g, pts, np.array([0, 0.0, M.neck[2] - 0.06]), np.array([0, 0, 1.0]), top - M.neck[2] + 0.1, 0.035, bins=20, slab=0.01)
    g.co = g.smooth_values(g.co, 4, 0.5)
    # The point at the back.
    back = smoothstep(eye[1] + 0.02, eye[1] + 0.12, g.co[:, 1]) * smoothstep(eye[2] - 0.02, top, g.co[:, 2])
    g.co[:, 1] += 0.04 * back ** 2
    # The face opening: an oval in front.
    P0 = g.attrs["P0"]
    fz = np.hypot(P0[:, 0] / 0.085, (P0[:, 2] - (eye[2] - 0.035)) / 0.115) - 1.0
    g.clip(np.where(P0[:, 1] < eye[1] + 0.03, -fz, -1.0))
    P0 = g.attrs["P0"]
    g.clip(M.neck[2] - 0.04 - P0[:, 2])
    g.part = ["cloth"] * len(g.faces)
    g.kind = ["wool"] * len(g.faces)
    g.panel = ["hood_l" if c[0] > 0 else "hood_r" for c in g.face_centres()]
    g.down = [(0, 0, -1)] * len(g.faces)
    g.smooth_edges(rounds=5)
    # (Over the ears and pointed ears with room: out to 1.6 cm wherever it came nearer.)
    g.co = g.smooth_values(g.co, 2, 0.4)
    # (More room over the ears, pointed ones included: 1.6 cm elsewhere, about 3 cm there.)
    hv = M.surf & (body.bone == "Head")
    ear_pts = (body.co + body.keys.get("ears_pointed", 0))[hv]
    ear_pts = ear_pts[np.abs(ear_pts[:, 0]) > np.abs(ear_pts[:, 0]).max() - 0.02]
    from mathutils.kdtree import KDTree
    kd = KDTree(len(ear_pts))
    for i, q in enumerate(ear_pts):
        kd.insert(wo.Vector(q), i)
    kd.balance()
    de = np.array([kd.find(wo.Vector(q))[2] for q in g.co])
    off = 0.016 + 0.016 * np.exp(-((de / 0.035) ** 2))
    wo.wrap(g, body, off, rounds=3, factor=0.1)
    pe = body.co + body.keys.get("ears_pointed", 0)
    bvh_pe = wo.BVHTree.FromPolygons(pe.tolist(), body.tris[(body.bone[body.tris] == "Head").all(1)].tolist())
    loc, nrm, _, d = wo.nearest(bvh_pe, g.co)
    low = d < off
    g.co[low] = loc[low] + nrm[low] * off[low, None]
    g.co = g.smooth_values(g.co, 2, 0.3)
    # (Last, out to the head's convex outline slice by slice, pointed ears included, so no ear tip can
    # come through between vertices.)
    hp = np.concatenate([body.co[hv], ear_pts, pe[hv]])
    wo.hull_envelope(g, hp, np.array([0, 0.0, M.neck[2] - 0.02]), np.array([0, 0, 1.0]), top - M.neck[2] + 0.06, 0.014, bins=28, slab=0.008)
    face = [g.co[lp].copy() for lp in g.edge_loops() if g.co[lp, 1].mean() < M.neck[1]]
    g.rim(depth=0.006, back=0.0, part="lining")
    # A rolled edge round the face opening.
    for P in face:
        if len(P) > 6:
            P2, N2 = wo.clean_loop(P, unit(P - P.mean(0)), 0.01)
            g.join(wo.tube(np.concatenate([P2, P2[:1]]), 0.004, sides=6, part="cloth", kind="wool", caps=False, panel="roll"))
    g.attrs = {}
    # Rigid on the head (turning and nodding with it), easing onto the neck at the bottom.
    rig_w = smoothstep(M.neck[2] - 0.02, M.neck[2] + 0.05, g.co[:, 2])
    wo.fit(g, body, rigid=rig_w, rigid_bones=["Head"], loose=1 - rig_w, smooth_rounds=4, clearance=0.012)
    return g


# ── Running ──────────────────────────────────────────────────────────────────────────────────────────

PIECES = {
    "shirt": dict(make=shirt, over=("trousers",), detail=shirt_detail, layer=1, hides=["torso", "upperarms", "forearms"], parts={"cloth": LINEN, "laces": CORD}),
    "trousers": dict(make=trousers, detail=trousers_detail, layer=1, hides=["hips", "thighs", "calves"], parts={"cloth": WOOL_BROWN, "laces": CORD}),
    "skirt": dict(make=skirt, over=("blouse", "shirt"), layer=2, slot="legs", hides=["hips", "thighs", "calves", "underwear-bottom"], parts={"cloth": WOOL_BLUE, "trim": TRIM}),
    "dress": dict(make=dress, layer=2, slot="body", hides=["torso", "hips", "thighs", "calves", "underwear"], parts={"cloth": WOOL_GREEN, "bodice": WOOL_BROWN, "trim": TRIM, "laces": CORD}),
    "tunic": dict(make=tunic, over=("shirt", "trousers"), layer=2, hides=["torso", "upperarms", "hips"], parts={"cloth": WOOL_GREEN, "trim": TRIM, "belt": LEATHER, "metal": BRASS}),
    "boots": dict(make=boots, over=("trousers",), detail=feet_detail, layer=2, hides=["feet"], parts={"leather": LEATHER, "sole": LEATHER_DARK, "metal": IRON}),
    "shoes": dict(make=shoes, detail=feet_detail, layer=2, slot="feet", hides=["feet"], parts={"leather": LEATHER, "trim": LEATHER_DARK, "sole": LEATHER_DARK, "metal": IRON}),
    "leather_armour": dict(make=leather_armour, over=("shirt", "tunic", "trousers"), layer=3, hides=[], parts={"leather": LEATHER, "trim": LEATHER_DARK, "metal": IRON}),
    "chainmail": dict(make=chainmail, over=("gambeson", "shirt", "trousers"), layer=3, hides=["torso", "upperarms", "hips"], parts={"mail": IRON, "trim": BRASS}, size=2048),
    "plate_cuirass": dict(make=plate_cuirass, over=("chainmail", "gambeson"), layer=4, hides=[], parts={"plate": STEEL, "leather": LEATHER_DARK, "metal": BRASS}, size=2048),
    "pauldrons": dict(make=pauldrons, over=("plate_cuirass", "chainmail", "gambeson"), layer=4, hides=[], parts={"plate": STEEL, "metal": BRASS}, size=2048),
    "bracers": dict(make=bracers, over=("shirt", "tunic"), layer=3, hides=[], parts={"leather": LEATHER, "metal": STEEL}),
    "greaves": dict(make=greaves, over=("trousers",), layer=3, hides=[], parts={"plate": STEEL, "leather": LEATHER_DARK}, size=2048),
    "helm": dict(make=helm, layer=4, hides=["hair"], parts={"plate": STEEL, "trim": BRASS}, size=2048, head=True),
    "cloak": dict(make=cloak, over=("shirt", "tunic", "vest", "leather_armour", "blouse"), layer=5, slot="back", hides=[], parts={"cloth": WOOL_GREEN, "lining": WOOL_BROWN, "metal": BRASS}, variants={"hood_up": (hood_up, ["hair"])}),
}


def main():
    args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    run(PIECES, args)


def run(pieces, args):
    """Builds the named pieces (all of them by default), on both bodies or the one named, each into its
    .glb, with its checks in the log."""
    only = [a for a in args if a in ("male", "female")]
    names = [a for a in args if a in pieces] or list(pieces)
    for name in names:
        spec = pieces[name]
        sexes = [x for x in spec.get("sexes", ("male", "female")) if not only or x in only]
        bpy.ops.wm.read_factory_settings(use_empty=True)
        piece = wo.Piece(name, spec["layer"], spec["hides"], spec["parts"], size=spec.get("size", 1024), slot=spec.get("slot"), double_sided=spec.get("double_sided", ()), sexes=spec.get("sexes", ("male", "female")))
        for sex in sexes:
            body = wo.Body(sex)
            M = Marks(body)
            rig = wo.make_rig(body, fingers=spec.get("fingers", False))
            wo.CURRENT_UNDER = wo.worn_under(() if os.environ.get("WW_NO_UNDER") else spec.get("over", ()), sex, body.key_names)
            if wo.CURRENT_UNDER:
                wo.log(f"  worn over: {', '.join(u.name for u in wo.CURRENT_UNDER)}")
            geo = spec["make"](body, M)
            if os.environ.get("WW_DEBUG_COUNT"):
                import collections
                E = geo.edges()
                pb = sum(1 for e, fs in E.items() if len(fs) == 2 and geo.panel[fs[0]] != geo.panel[fs[1]])
                wo.log(f"  edge classes {dict(collections.Counter(geo.edge.values()))}, panel borders {pb}, panels {dict(collections.Counter(geo.panel))}")
                per = {}
                for f, pn in zip(geo.faces, geo.panel):
                    per.setdefault(pn.rstrip("0123456789_lr"), set()).update(f)
                wo.log("  vertices by panel: " + ", ".join(f"{k} {len(v)}" for k, v in sorted(per.items(), key=lambda kv: -len(kv[1]))))
            detail = spec["detail"](M) if spec.get("detail") else None
            piece.add(sex, geo, body, rig, detail=detail)
            for vname, (vmake, vhides) in spec.get("variants", {}).items():
                vgeo = vmake(body, M)
                piece.add(f"{sex}_{vname}", vgeo, body, rig, hides=vhides, extra={"variant": vname})
            report = []
            bust = "bust" if sex == "female" else "chest"
            tests = [{k: 1.0} for k in body.key_names if k not in ("nose", "eyes", "ears_pointed")]
            tests += [{"heavy": 1.0, "muscle": 1.0, bust: 1.0, "belly": 1.0}, {"heavy": 1.0, "muscle": 1.0, bust: 1.0, "belly": 1.0, "hips": 1.0, "shoulders": 1.0}, {"thin": 1.0, "muscle": 1.0, "shoulders": 1.0, "hips": 1.0}, {"thin": 1.0, "age_old": 1.0}]
            for values in tests:
                n, dmin = wo.clip_report(geo, body, values)
                report.append(f"{'+'.join(values)} {n}/{dmin * 1000:.0f}mm")
            wo.log("  clip (vertices under the skin / closest): " + ", ".join(report))
            piece.stats[sex]["clip"] = report
            if wo.CURRENT_UNDER:
                lines = []
                for values in [{}] + tests:
                    for uname, (n, dmax) in wo.clash_report(geo, wo.CURRENT_UNDER, values).items():
                        if n:
                            lines.append(f"{uname}@{'+'.join(values) or 'rest'} {n}/{dmax * 1000:.0f}mm")
                wo.log("  layers (vertices of the pieces under it showing through): " + (", ".join(lines) if lines else "clean"))
                piece.stats[sex]["layers"] = lines
            wo.CURRENT_UNDER = []
            if not spec.get("head"):
                guard = head_guard(geo, body)
                wo.log("  head guard (closest to the head's skin, mm): " + ", ".join(f"{k} {v * 1000:.0f}" for k, v in guard.items()))
                if min(guard.values()) < 0.012:
                    raise SystemExit(f"{name}/{sex} comes within {min(guard.values()) * 1000:.0f} mm of the head")
            for region in wo.REGIONS:
                missed = []
                c = wo.coverage(geo, body, region, missed=missed)
                if c > 0.05:
                    where = ""
                    if region in spec["hides"] and missed:
                        m = np.array(missed)
                        where = f" (hidden; uncovered skin at x {m[:, 0].min():.2f}..{m[:, 0].max():.2f}, y {m[:, 1].min():.2f}..{m[:, 1].max():.2f}, z {m[:, 2].min():.2f}..{m[:, 2].max():.2f})"
                    wo.log(f"  covers {region}: {c:.1%}{where}")
        piece.export()


if __name__ == "__main__":
    main()
