"""Helpers for make_avatar.py: reading MakeHuman's base mesh and morph targets (CC0 data files, read
with our own code; MakeHuman and its add-on are not run or copied), blending its macro targets into a
body, and the small bits of geometry the avatar script needs.

MakeHuman's data lives outside the repository. The scripts look for it in `MAKEHUMAN_DATA`, else in
`_planning/Wanderworld asset packs/MakeHuman/src/mpfb/data` in this folder or any folder above it.
"""

import gzip
import json
import os

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
_PACK = os.path.join("_planning", "Wanderworld asset packs", "MakeHuman", "src", "mpfb", "data")


def data_dir():
    found = os.environ.get("MAKEHUMAN_DATA")
    if found and os.path.isdir(found):
        return found
    here = HERE
    while True:
        candidate = os.path.join(here, _PACK)
        if os.path.isdir(candidate):
            return candidate
        up = os.path.dirname(here)
        if up == here:
            raise SystemExit("MakeHuman's data not found: set MAKEHUMAN_DATA to its mpfb/data folder")
        here = up


DATA = data_dir()


class Base:
    """MakeHuman's hm08 base mesh: positions (MakeHuman's units, decimetres, +Y up, facing +Z), texture
    coordinates, quads (vertex and texture indices) with the group each belongs to, and each group's
    vertices."""

    def __init__(self):
        co, uv, quads, quad_uv, quad_group = [], [], [], [], []
        group_names, group = [], None
        with open(os.path.join(DATA, "3dobjs", "base.obj")) as f:
            for line in f:
                if line.startswith("v "):
                    co.append(line.split()[1:4])
                elif line.startswith("vt "):
                    uv.append(line.split()[1:3])
                elif line.startswith("g "):
                    name = line.split()[1]
                    if name not in group_names:
                        group_names.append(name)
                    group = group_names.index(name)
                elif line.startswith("f "):
                    parts = [p.split("/") for p in line.split()[1:]]
                    quads.append([int(p[0]) - 1 for p in parts])
                    quad_uv.append([int(p[1]) - 1 for p in parts])
                    quad_group.append(group)
        self.co = np.array(co, dtype=np.float64)
        self.uv = np.array(uv, dtype=np.float64)
        self.quads = np.array(quads, dtype=np.int64)
        self.quad_uv = np.array(quad_uv, dtype=np.int64)
        self.group_names = group_names
        self.quad_group = np.array(quad_group)
        self.groups = {}
        for i, name in enumerate(group_names):
            self.groups[name] = np.unique(self.quads[self.quad_group == i])

    def faces_of(self, *names):
        ids = [self.group_names.index(n) for n in names if n in self.group_names]
        return np.nonzero(np.isin(self.quad_group, ids))[0]

    def joint(self, co, name):
        """A joint's centre: the middle of its little helper cube."""
        return co[self.groups[f"joint-{name}"]].mean(axis=0)


_targets = {}


def target(rel):
    """One morph target (path under targets/, without .target.gz): (vertex indices, offsets)."""
    if rel not in _targets:
        path = os.path.join(DATA, "targets", rel + ".target.gz")
        with gzip.open(path, "rt") as f:
            values = np.array(f.read().split(), dtype=np.float64).reshape(-1, 4)
        _targets[rel] = (values[:, 0].astype(np.int64), values[:, 1:])
    return _targets[rel]


def exists(rel):
    return os.path.exists(os.path.join(DATA, "targets", rel + ".target.gz"))


def offsets(n, mix):
    """The sum of targets {path: weight} as an (n, 3) array of offsets."""
    out = np.zeros((n, 3))
    for rel, w in mix.items():
        if w:
            idx, d = target(rel)
            np.add.at(out, idx, w * d)
    return out


def _split(value, names, edges):
    """How much each of `names` counts at `value`, linear between neighbouring `edges`."""
    out = {n: 0.0 for n in names}
    value = min(max(value, edges[0]), edges[-1])
    for i in range(len(edges) - 1):
        if value <= edges[i + 1] or i == len(edges) - 2:
            t = (value - edges[i]) / (edges[i + 1] - edges[i])
            out[names[i]] += 1 - t
            out[names[i + 1]] += t
            return out
    return out


def macro_mix(gender, age=0.5, muscle=0.5, weight=0.5, height=0.5, proportions=0.5, cupsize=0.5, firmness=0.5, race=(1 / 3, 1 / 3, 1 / 3)):
    """MakeHuman's macro targets for a body, as {path: weight}: gender (0 female … 1 male), age (0.5 is a
    young adult of 25), muscle and weight (0.5 average), height, proportions (1 ideal), cup size and
    firmness (women), race (caucasian, african, asian shares). Each combined target counts the product
    of its parts' shares, which is how the macro targets are meant to be mixed."""
    g = {"female": 1 - gender, "male": gender}
    a = _split(age, ["baby", "child", "young", "old"], [0.0, 0.1875, 0.5, 1.0])
    m = _split(muscle, ["minmuscle", "averagemuscle", "maxmuscle"], [0.0, 0.5, 1.0])
    w = _split(weight, ["minweight", "averageweight", "maxweight"], [0.0, 0.5, 1.0])
    h = {"minheight": max(0.0, 1 - height / 0.5), "maxheight": max(0.0, (height - 0.5) / 0.5)}
    p = {"uncommonproportions": max(0.0, 1 - proportions / 0.5), "idealproportions": max(0.0, (proportions - 0.5) / 0.5)}
    cup = _split(cupsize, ["mincup", "averagecup", "maxcup"], [0.0, 0.5, 1.0])
    firm = _split(firmness, ["minfirmness", "averagefirmness", "maxfirmness"], [0.0, 0.5, 1.0])
    races = dict(zip(("caucasian", "african", "asian"), race))
    mix = {}

    def put(rel, value):
        if value > 1e-6 and exists(rel):
            mix[rel] = mix.get(rel, 0.0) + value

    for gn, gw in g.items():
        for an, aw in a.items():
            if gw * aw < 1e-6:
                continue
            for rn, rw in races.items():
                put(f"macrodetails/{rn}-{gn}-{an}", rw * gw * aw)
            for mn, mw in m.items():
                for wn, ww in w.items():
                    base = gw * aw * mw * ww
                    if base < 1e-6:
                        continue
                    put(f"macrodetails/universal-{gn}-{an}-{mn}-{wn}", base)
                    for hn, hw in h.items():
                        put(f"macrodetails/height/{gn}-{an}-{mn}-{wn}-{hn}", base * hw)
                    for pn, pw in p.items():
                        put(f"macrodetails/proportions/{gn}-{an}-{mn}-{wn}-{pn}", base * pw)
                    for cn, cw in cup.items():
                        for fn, fw in firm.items():
                            put(f"breast/{gn}-{an}-{mn}-{wn}-{cn}-{fn}", base * cw * fw)
    return mix


def sided(name, w=1.0):
    """A left and right target pair (`l-…`, `r-…` in one folder) at weight w."""
    folder, rest = name.split("/")
    return {f"{folder}/l-{rest}": w, f"{folder}/r-{rest}": w}


def to_blender(co):
    """MakeHuman's (x, up, forward) decimetres to Blender's metres (x, -forward, up)."""
    return np.stack([co[..., 0], -co[..., 2], co[..., 1]], axis=-1) * 0.1


def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0.0, 1.0)
    return t * t * (3 - 2 * t)


def vertex_neighbours(n, quads):
    """Each vertex's neighbours along quad edges, as (indices, offsets) in CSR form."""
    a = np.concatenate([quads[:, i] for i in range(4)])
    b = np.concatenate([quads[:, (i + 1) % 4] for i in range(4)])
    pairs = np.unique(np.stack([np.concatenate([a, b]), np.concatenate([b, a])], axis=1), axis=0)
    order = np.argsort(pairs[:, 0], kind="stable")
    pairs = pairs[order]
    starts = np.searchsorted(pairs[:, 0], np.arange(n + 1))
    return pairs[:, 1], starts


def smooth_values(values, nbrs, rounds=1, factor=0.5, mask=None):
    """Laplacian smoothing of per-vertex values (n,) or (n, k) along the mesh's edges."""
    idx, starts = nbrs
    counts = np.diff(starts)
    v = values.copy()
    owner = np.repeat(np.arange(len(counts)), counts)
    for _ in range(rounds):
        acc = np.zeros_like(v)
        np.add.at(acc, owner, v[idx])
        avg = acc / np.maximum(counts, 1).reshape((-1,) + (1,) * (v.ndim - 1))
        step = (avg - v) * factor
        if mask is not None:
            step = step * mask.reshape((-1,) + (1,) * (v.ndim - 1))
        v = v + step
    return v


def value_noise(p, scale, seed=0):
    """Smooth 3D value noise in -1..1 at points p (n, 3), features about 1/scale apart."""
    q = p * scale
    i0 = np.floor(q).astype(np.int64)
    f = q - i0
    f = f * f * (3 - 2 * f)

    def h(ix, iy, iz):
        k = (ix * 73856093) ^ (iy * 19349663) ^ (iz * 83492791) ^ (seed * 2654435761)
        k = (k ^ (k >> 13)) * 1274126177
        k = k ^ (k >> 16)
        return (k & 0xFFFF) / 32767.5 - 1.0

    out = 0.0
    for dx in (0, 1):
        for dy in (0, 1):
            for dz in (0, 1):
                w = (f[:, 0] if dx else 1 - f[:, 0]) * (f[:, 1] if dy else 1 - f[:, 1]) * (f[:, 2] if dz else 1 - f[:, 2])
                out = out + w * h(i0[:, 0] + dx, i0[:, 1] + dy, i0[:, 2] + dz)
    return out


def fbm(p, scale, octaves=4, seed=0):
    total, amp, norm = 0.0, 1.0, 0.0
    for o in range(octaves):
        total = total + amp * value_noise(p, scale * 2**o, seed + o)
        norm += amp
        amp *= 0.5
    return total / norm


def face_set(layer):
    """The base mesh's faces in one of MakeHuman's region layers (uv_layers/<layer>.json.gz)."""
    with gzip.open(os.path.join(DATA, "uv_layers", layer + ".json.gz"), "rt") as f:
        return np.array(sorted(int(k) for k in json.load(f)), dtype=np.int64)


def quat_between(a, b):
    """The shortest turn taking direction a to direction b, as a 3x3 matrix."""
    a = a / np.linalg.norm(a)
    b = b / np.linalg.norm(b)
    v = np.cross(a, b)
    c = float(np.dot(a, b))
    if c < -0.999999:
        axis = np.cross(a, [1, 0, 0])
        if np.linalg.norm(axis) < 1e-6:
            axis = np.cross(a, [0, 1, 0])
        axis /= np.linalg.norm(axis)
        return 2 * np.outer(axis, axis) - np.eye(3)
    k = np.array([[0, -v[2], v[1]], [v[2], 0, -v[0]], [-v[1], v[0], 0]])
    return np.eye(3) + k + k @ k / (1 + c)


def skin(points, weights, rotations, heads, new_heads, deltas=False):
    """Linear blend skinning: each bone b turns points by rotations[b] about its old head and carries
    them to its new head; weights is (n, bones). With deltas=True the points are offsets (turned only)."""
    out = np.zeros_like(points)
    for b in range(weights.shape[1]):
        w = weights[:, b]
        sel = w > 0
        if not sel.any():
            continue
        r = rotations[b]
        if deltas:
            moved = points[sel] @ r.T
        else:
            moved = (points[sel] - heads[b]) @ r.T + new_heads[b]
        out[sel] += w[sel, None] * moved
    return out


def bary_attach(tris, co, hit_tri, hit_point):
    """Barycentric weights of each hit point in its triangle: (k, 3)."""
    a, b, c = (co[tris[hit_tri, i]] for i in range(3))
    v0, v1, v2 = b - a, c - a, hit_point - a
    d00 = (v0 * v0).sum(1)
    d01 = (v0 * v1).sum(1)
    d11 = (v1 * v1).sum(1)
    d20 = (v2 * v0).sum(1)
    d21 = (v2 * v1).sum(1)
    den = d00 * d11 - d01 * d01
    v = (d11 * d20 - d01 * d21) / den
    w = (d00 * d21 - d01 * d20) / den
    return np.stack([1 - v - w, v, w], axis=1)


def vertex_normals(co, quads):
    n = np.zeros_like(co)
    for i in range(4):
        a, b, c = quads[:, i], quads[:, (i + 1) % 4], quads[:, (i - 1) % 4]
        fn = np.cross(co[b] - co[a], co[c] - co[a])
        np.add.at(n, a, fn)
    return n / np.maximum(np.linalg.norm(n, axis=1, keepdims=True), 1e-12)


def subdivide_region(co, quads, region):
    """One Catmull-Clark step over the quads in `region` (a mask), leaving the faces outside it as they are,
    except that those sharing an edge with the region gain that edge's new point (a fifth corner). Every
    point uses the full Catmull-Clark rule, the faces outside counting as they would if they were
    subdivided too, so the region's border meets the rest without a step. Returns (apply, faces, corners):
    `apply(values)` takes any per-vertex values (positions, shape key offsets, bone weights) to the new
    vertices by the same linear rule; `faces` are the new faces as vertex lists; `corners` says, for each
    new face corner, which old face it came from and its weights over that face's four corners (for
    texture coordinates)."""
    n = len(co)
    m = len(quads)
    edge_of = {}
    edge_faces = []
    face_edges = np.zeros((m, 4), dtype=np.int64)
    for f in range(m):
        for i in range(4):
            a, b = int(quads[f, i]), int(quads[f, (i + 1) % 4])
            key = (a, b) if a < b else (b, a)
            e = edge_of.get(key)
            if e is None:
                e = edge_of[key] = len(edge_faces)
                edge_faces.append([])
            edge_faces[e].append(f)
            face_edges[f, i] = e
    edges = np.array(list(edge_of.keys()))
    rf = np.nonzero(region)[0]
    region_edges = np.unique(face_edges[rf])
    two = np.array([len(edge_faces[e]) == 2 for e in region_edges])
    ef = np.array([edge_faces[e] for e in region_edges[two]])
    moving = np.unique(quads[rf])
    # New vertex numbering: old ones, then face points, then edge points.
    fp_index = -np.ones(m, dtype=np.int64)
    fp_index[rf] = n + np.arange(len(rf))
    ep_index = -np.ones(len(edges), dtype=np.int64)
    ep_index[region_edges] = n + len(rf) + np.arange(len(region_edges))
    total = n + len(rf) + len(region_edges)
    # Each moving vertex's faces and edges (all of them, inside the region or not).
    is_moving = np.zeros(n, dtype=bool)
    is_moving[moving] = True
    vf = {int(v): [] for v in moving}
    for f in range(m):
        for v in quads[f]:
            if is_moving[v]:
                vf[int(v)].append(f)
    ve = {int(v): [] for v in moving}
    for e, (a, b) in enumerate(edges):
        for v in (a, b):
            if is_moving[v]:
                ve[int(v)].append(e)
    vf_list = [np.array(vf[int(v)]) for v in moving]
    ve_list = [np.array(ve[int(v)]) for v in moving]

    def apply(values):
        values = np.asarray(values, dtype=np.float64)
        out = np.zeros((total,) + values.shape[1:])
        out[:n] = values
        fp_all = values[quads].mean(1)
        out[n : n + len(rf)] = fp_all[rf]
        mid_all = values[edges].mean(1)
        ep = mid_all[region_edges].copy()
        if len(ef):
            ep[two] = (2 * mid_all[region_edges[two]] + fp_all[ef[:, 0]] + fp_all[ef[:, 1]]) / 4
        out[n + len(rf) :] = ep
        for v, fl, el in zip(moving, vf_list, ve_list):
            k = len(el)
            out[v] = (fp_all[fl].mean(0) + 2 * mid_all[el].mean(0) + (k - 3) * values[v]) / k
        return out

    faces, corners = [], []
    for f in range(m):
        q = [int(v) for v in quads[f]]
        if region[f]:
            c = fp_index[f]
            e = [ep_index[face_edges[f, i]] for i in range(4)]
            for i in range(4):
                faces.append([q[i], e[i], c, e[(i - 1) % 4]])
                w_v = np.eye(4)[i]
                w_e = (np.eye(4)[i] + np.eye(4)[(i + 1) % 4]) / 2
                w_p = (np.eye(4)[i] + np.eye(4)[(i - 1) % 4]) / 2
                corners.append((f, [w_v, w_e, np.full(4, 0.25), w_p]))
        else:
            poly, weights = [], []
            for i in range(4):
                poly.append(q[i])
                weights.append(np.eye(4)[i])
                e = face_edges[f, i]
                if ep_index[e] >= 0:
                    poly.append(int(ep_index[e]))
                    weights.append((np.eye(4)[i] + np.eye(4)[(i + 1) % 4]) / 2)
            faces.append(poly)
            corners.append((f, weights))
    return apply, faces, corners
