"""Helpers for make_avatar.py: reading MakeHuman's base mesh and morph targets (CC0 data files, read
with our own code; MakeHuman and its add-on are not run or copied), blending its macro targets into a
body, the small bits of geometry the avatar script needs, and the races' parts' curves, tubes and
textures (facial hair's strands; horn and tooth).

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
_ASSETS = os.path.join("_planning", "Wanderworld asset packs", "MakeHuman", "makehuman_system_assets_cc0")


def assets_dir():
    """MakeHuman's system assets (CC0: skins, eyes, eyebrows, eyelashes), in `MAKEHUMAN_ASSETS`, else beside the
    base data in `_planning`."""
    found = os.environ.get("MAKEHUMAN_ASSETS")
    if found and os.path.isdir(found):
        return found
    candidate = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(DATA))), "makehuman_system_assets_cc0")
    if os.path.isdir(candidate):
        return candidate
    here = HERE
    while True:
        candidate = os.path.join(here, _ASSETS)
        if os.path.isdir(candidate):
            return candidate
        up = os.path.dirname(here)
        if up == here:
            raise SystemExit("MakeHuman's system assets not found: set MAKEHUMAN_ASSETS to the makehuman_system_assets_cc0 folder")
        here = up


class Proxy:
    """A MakeHuman proxy (.mhclo, read as data): each of its vertices a weighted sum of three base-mesh
    vertices plus an offset in MakeHuman's axes (x, up, forward), scaled per axis by how far apart two
    named base vertices are against the distance given; and its .obj's faces and texture coordinates."""

    def __init__(self, path):
        folder = os.path.dirname(path)
        self.name = os.path.splitext(os.path.basename(path))[0]
        self.scales = {}
        refs, weights, offs = [], [], []
        obj = None
        reading = False
        with open(path, encoding="utf-8", errors="replace") as f:
            for line in f:
                words = line.split()
                if not words or words[0].startswith("#"):
                    continue
                try:
                    numbers = [float(w) for w in words]
                except ValueError:
                    numbers = None
                if reading and numbers is not None:
                    if len(words) == 1:
                        refs.append([int(words[0])] * 3)
                        weights.append([1.0, 0.0, 0.0])
                        offs.append([0.0, 0.0, 0.0])
                    elif len(words) >= 9:
                        refs.append([int(w) for w in words[:3]])
                        weights.append(numbers[3:6])
                        offs.append(numbers[6:9])
                    continue
                key = words[0]
                if key == "verts":
                    reading = True
                elif key in ("x_scale", "y_scale", "z_scale"):
                    self.scales[key[0]] = (int(words[1]), int(words[2]), float(words[3]))
                elif key == "obj_file":
                    obj = words[1]
                elif key == "material":
                    self.material = os.path.join(folder, words[1])
        self.refs = np.array(refs, dtype=np.int64)
        self.weights = np.array(weights, dtype=np.float64)
        self.offsets = np.array(offs, dtype=np.float64)
        self.faces, self.face_uv, self.uv = [], [], []
        with open(os.path.join(folder, obj), encoding="utf-8", errors="replace") as f:
            for line in f:
                if line.startswith("vt "):
                    self.uv.append([float(x) for x in line.split()[1:3]])
                elif line.startswith("f "):
                    parts = [p.split("/") for p in line.split()[1:]]
                    self.faces.append([int(p[0]) - 1 for p in parts])
                    self.face_uv.append([int(p[1]) - 1 if len(p) > 1 and p[1] else int(p[0]) - 1 for p in parts])
        self.uv = np.array(self.uv, dtype=np.float64)
        self.texture = None
        if getattr(self, "material", None) and os.path.exists(self.material):
            with open(self.material, encoding="utf-8", errors="replace") as f:
                for line in f:
                    if line.startswith("diffuseTexture"):
                        self.texture = os.path.join(folder, line.split()[1])

    def fit(self, co):
        """The proxy's vertices on a body whose base-mesh vertices are `co` (Blender's axes, metres): the
        offsets scaled by the body's own measures, MakeHuman's (x, up, forward) taken to (x, -forward, up)."""
        axis = {"x": 0, "y": 2, "z": 1}  # (MakeHuman's axis -> Blender's)
        s = {}
        for k, (a, b, ref) in self.scales.items():
            s[k] = abs(co[a, axis[k]] - co[b, axis[k]]) / ref
        off = np.stack([self.offsets[:, 0] * s["x"], -self.offsets[:, 2] * s["z"], self.offsets[:, 1] * s["y"]], axis=1)
        return self.blend(co) + off

    def blend(self, values):
        """Any per-vertex values of the base mesh (shape key offsets) carried to the proxy's vertices."""
        return (values[self.refs] * self.weights[:, :, None]).sum(1)


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


def extracted_dir():
    """The MakeHuman community asset packs, each unzipped into a folder of its own: `MAKEHUMAN_PACKS`, else
    `extracted` beside MakeHuman's system assets."""
    found = os.environ.get("MAKEHUMAN_PACKS")
    if found and os.path.isdir(found):
        return found
    return os.path.join(os.path.dirname(assets_dir()), "extracted")


def target(rel):
    """One morph target: (vertex indices, offsets). `rel` is a path under MakeHuman's targets/ without
    .target.gz, or `pack:<pack>/<region>/<name>` for a community pack's (extracted_dir's
    <pack>/targets/<region>/<name>.target, plain text, the same format; comment lines skipped)."""
    if rel not in _targets:
        if rel.startswith("pack:"):
            pack, region, name = rel[5:].split("/")
            with open(os.path.join(extracted_dir(), pack, "targets", region, name + ".target"), encoding="utf-8") as f:
                text = "".join(line for line in f if not line.lstrip().startswith("#"))
        else:
            with gzip.open(os.path.join(DATA, "targets", rel + ".target.gz"), "rt") as f:
                text = f.read()
        values = np.array(text.split(), dtype=np.float64).reshape(-1, 4)
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


def vertex_normals_of(co, faces):
    """Vertex normals of a mesh whose faces have any number of corners."""
    n = np.zeros_like(co)
    for f in faces:
        p = co[list(f)]
        fn = np.zeros(3)
        for i in range(1, len(f) - 1):
            fn += np.cross(p[i] - p[0], p[i + 1] - p[0])
        n[list(f)] += fn
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


# ── Garments: smooth fields cut into a mesh ──────────────────────────────────────────────────────────


def smin(a, b, k):
    """A smooth minimum of two fields (the intersection of two insides, its corner rounded over k)."""
    h = np.clip(0.5 + 0.5 * (b - a) / k, 0.0, 1.0)
    return b * (1 - h) + a * h - k * h * (1 - h)


def smax(a, b, k):
    """A smooth maximum (the union of two insides, its corner filled over k)."""
    return -smin(-a, -b, k)


def periodic(points, mirror=False):
    """A smooth closed curve through (angle in degrees, value) points, as a function of angles in radians
    (Catmull-Rom). With mirror=True the points give 0..180 degrees and the other half mirrors them."""
    if mirror:
        points = list(points) + [(-a, v) for a, v in points if 0 < a < 180]
    a = np.radians([p[0] for p in points])
    v = np.array([p[1] for p in points], dtype=np.float64)
    order = np.argsort(a)
    a, v = a[order], v[order]
    A = np.concatenate([a[-2:] - 2 * np.pi, a, a[:2] + 2 * np.pi])
    V = np.concatenate([v[-2:], v, v[:2]])

    def f(t):
        t = np.mod(np.asarray(t, dtype=np.float64) - A[2], 2 * np.pi) + A[2]
        i = np.clip(np.searchsorted(A, t, side="right") - 1, 1, len(A) - 3)
        t0, t1 = A[i], A[i + 1]
        m0 = (V[i + 1] - V[i - 1]) / (A[i + 1] - A[i - 1])
        m1 = (V[i + 2] - V[i]) / (A[i + 2] - A[i])
        h = t1 - t0
        s = (t - t0) / h
        return (2 * s**3 - 3 * s**2 + 1) * V[i] + (s**3 - 2 * s**2 + s) * h * m0 + (-2 * s**3 + 3 * s**2) * V[i + 1] + (s**3 - s**2) * h * m1

    return f


def metric(field, step=0.001):
    """A field divided by the length of its gradient, so near its zero it reads as a distance (metres)."""

    def f(p):
        p = np.asarray(p, dtype=np.float64)
        v = field(p)
        g = np.zeros_like(p)
        for i in range(3):
            d = np.zeros(3)
            d[i] = step
            g[:, i] = (field(p + d) - field(p - d)) / (2 * step)
        return v / np.maximum(np.linalg.norm(g, axis=1), 0.05)

    return f


def polyline_distance(p, line):
    """Each point's distance from a polyline (k, 3), and the distance along the line to its nearest point."""
    best = np.full(len(p), np.inf)
    where = np.zeros(len(p))
    run = 0.0
    for a, b in zip(line[:-1], line[1:]):
        ab = b - a
        L = float(np.linalg.norm(ab))
        t = np.clip(((p - a) @ ab) / max(L * L, 1e-12), 0.0, 1.0)
        d = np.linalg.norm(p - (a + np.outer(t, ab)), axis=1)
        closer = d < best
        best[closer] = d[closer]
        where[closer] = run + t[closer] * L
        run += L
    return best, where


def taubin(values, nbrs, rounds, mask=None, lam=0.5, mu=-0.53):
    """Smoothing that doesn't shrink: a step towards the neighbours' average, then a slightly larger one
    back, each round."""
    v = values
    for _ in range(rounds):
        v = smooth_values(v, nbrs, 1, lam, mask)
        v = smooth_values(v, nbrs, 1, mu, mask)
    return v


def chains(edges):
    """Edges (pairs of vertex indices) joined into ordered runs of vertices (a closed run repeats its first)."""
    nb = {}
    for a, b in edges:
        nb.setdefault(a, []).append(b)
        nb.setdefault(b, []).append(a)
    seen = set()
    out = []
    starts = [v for v in nb if len(nb[v]) != 2] + list(nb)
    for s in starts:
        if s in seen:
            continue
        run = [s]
        seen.add(s)
        prev, cur = None, s
        while True:
            nxt = [n for n in nb[cur] if n != prev and (n not in seen or (n == s and len(run) > 2))]
            if not nxt:
                break
            n = nxt[0]
            run.append(n)
            if n == s:
                break
            seen.add(n)
            prev, cur = cur, n
        if len(run) > 1:
            out.append(run)
    return out


# ── Race parts: curves, tubes and the facial hair's texture ──────────────────────────────────────────


def curve(points, n):
    """`n` points evenly spaced along a smooth curve through `points` (Catmull-Rom)."""
    pts = np.asarray(points, dtype=np.float64)
    dense = []
    for i in range(len(pts) - 1):
        a, b = pts[i], pts[i + 1]
        p0 = pts[i - 1] if i > 0 else a - (b - a)
        p3 = pts[i + 2] if i + 2 < len(pts) else b + (b - a)
        for t in np.linspace(0, 1, 24, endpoint=False):
            dense.append(0.5 * ((2 * a) + (-p0 + b) * t + (2 * p0 - 5 * a + 4 * b - p3) * t * t + (-p0 + 3 * a - 3 * b + p3) * t**3))
    dense.append(pts[-1])
    dense = np.array(dense)
    s = np.concatenate([[0.0], np.cumsum(np.linalg.norm(np.diff(dense, axis=0), axis=1))])
    t = np.linspace(0, s[-1], n)
    return np.stack([np.interp(t, s, dense[:, i]) for i in range(3)], axis=1)


def frames(pts, side):
    """A frame at each point of a curve that doesn't twist along it: (tangents, sides, normals), the first
    side as near `side` as the curve allows."""
    T = np.gradient(pts, axis=0)
    T /= np.maximum(np.linalg.norm(T, axis=1, keepdims=True), 1e-12)
    S = np.zeros_like(pts)
    s = np.asarray(side, dtype=np.float64)
    for i in range(len(pts)):
        s = s - T[i] * (s @ T[i])
        s /= max(np.linalg.norm(s), 1e-12)
        S[i] = s
    return T, S, np.cross(T, S)


def tube(pts, radii, side, segments=12, squash=1.0, tip=True):
    """A tube round a curve: a ring of `segments` points at each of `pts` (radius `radii[i]`, `squash` times
    that along its frame's normal: one number, or one for each point), closed to a point at its end if `tip`. Returns (points, faces, uv): uv
    per face corner, u once round (0..1) and v along (0 at the start, 1 at the end)."""
    T, S, N = frames(pts, side)
    n = len(pts)
    ang = 2 * np.pi * np.arange(segments) / segments
    squash = np.broadcast_to(np.asarray(squash, dtype=np.float64), (n,))[:, None, None]
    ring = np.cos(ang)[None, :, None] * S[:, None, :] + squash * np.sin(ang)[None, :, None] * N[:, None, :]
    co = (pts[:, None, :] + ring * np.asarray(radii)[:, None, None]).reshape(-1, 3)
    faces, uv = [], []
    for i in range(n - 1):
        for j in range(segments):
            k = (j + 1) % segments
            faces.append([i * segments + j, i * segments + k, (i + 1) * segments + k, (i + 1) * segments + j])
            uv.append([(j / segments, i / (n - 1)), ((j + 1) / segments, i / (n - 1)), ((j + 1) / segments, (i + 1) / (n - 1)), (j / segments, (i + 1) / (n - 1))])
    if tip:
        end = len(co)
        co = np.concatenate([co, pts[-1:] + T[-1:] * radii[-1] * 0.6])
        for j in range(segments):
            k = (j + 1) % segments
            faces.append([(n - 1) * segments + j, (n - 1) * segments + k, end])
            uv.append([(j / segments, 1.0), ((j + 1) / segments, 1.0), ((j + 0.5) / segments, 1.0)])
    return co, faces, uv


class _Strands:
    """Strands drawn into a picture (rows from the top): grey and alpha, each strand over those before it."""

    def __init__(self, w, h, wrap=False):
        self.w, self.h, self.wrap = w, h, wrap
        self.p = np.zeros((h, w))
        self.a = np.zeros((h, w))

    def stroke(self, ys, xs, width, alpha, grey):
        ys = np.asarray(ys, dtype=np.int64)
        keep = (ys >= 0) & (ys < self.h)
        ys, xs = ys[keep], np.asarray(xs, dtype=np.float64)[keep]
        width = np.broadcast_to(width, keep.shape)[keep]
        alpha = np.broadcast_to(alpha, keep.shape)[keep]
        grey = np.broadcast_to(grey, keep.shape)[keep]
        xi = np.floor(xs).astype(np.int64)
        for dx in range(-2, 3):
            xx = xi + dx
            d = (xx + 0.5 - xs) / width
            cov = alpha * np.exp(-2.2 * d * d)
            if self.wrap:
                xx = xx % self.w
                ok = np.ones(len(xx), dtype=bool)
            else:
                ok = (xx >= 0) & (xx < self.w)
            y, x, c, g = ys[ok], xx[ok], cov[ok], grey[ok]
            self.p[y, x] = self.p[y, x] * (1 - c) + g * c
            self.a[y, x] = self.a[y, x] * (1 - c) + c

    def under(self, alpha, grey):
        """A layer under everything drawn so far."""
        self.p = self.p + grey * alpha * (1 - self.a)
        self.a = self.a + alpha * (1 - self.a)

    def result(self):
        grey = np.where(self.a > 1e-4, self.p / np.maximum(self.a, 1e-4), 0.0)
        # (Grey bled into the see-through texels, so filtering doesn't darken the strands' edges.)
        pb, ab = self.p.copy(), self.a.copy()
        for _ in range(3):
            pb = sum(np.roll(np.roll(pb, dy, 0), dx, 1) for dy in (-2, 0, 2) for dx in (-2, 0, 2)) / 9
            ab = sum(np.roll(np.roll(ab, dy, 0), dx, 1) for dy in (-2, 0, 2) for dx in (-2, 0, 2)) / 9
        fill = np.where(ab > 1e-4, pb / np.maximum(ab, 1e-4), 0.6)
        grey = np.where(self.a > 0.02, grey, fill)
        return np.clip(grey, 0, 1), np.clip(self.a, 0, 1)


# The facial hair's texture (1,024 px, rows from the top): bands the full width of the picture, each one
# seamless from its right edge round to its left, so a card along the jaw can run its strands on round the
# face with no seam (a card goes from u 0 to 1 and the next one on from 0 again):
# - three bands of short hair, its roots along the top and its tips ragged along the bottom: dense (a solid
#   wash of hair under the roots' half, so it stays whole when drawn small), thinner, and sparse (a soft edge
#   to a beard: its cheek line);
# - a band of long hair (a long beard's hanging locks): strands the band's height, gathering into locks at
#   their tips;
# - a braid's strands, running along the band (along the braid), with no gaps;
# - a tie.
# Strands are near white for the hair's colour to tint, a little darker at the root, and only a little
# different from each other, so a beard reads as one colour of hair, not flecks.
HAIR_SIZE = 1024
HAIR_PAD = 2
HAIR_BANDS = {
    "short0": (0, 150),
    "short1": (152, 150),
    "short2": (304, 150),
    "long": (456, 400),
    "braid": (858, 128),
    "tie": (988, 34),
}


def band(name, u, v):
    """A place in one of the texture's bands as texture coordinates: u along it (0..1, once across the picture),
    v from its bottom (0: the tips) to its top (1: the roots)."""
    y, h = HAIR_BANDS[name]
    return (u, 1 - (y + HAIR_PAD + (1 - v) * (h - 2 * HAIR_PAD)) / HAIR_SIZE)


def _locks(rng, w, h, count, under, reach=(0.6, 1.0), lean=10.0, size=(22, 40), roots=(-0.04, 0.08), per=34, wave=0.0):
    """A band of locks hanging from its top edge, seamless across: `count` locks, each `size` pixels across
    at its root (half of it either side), its strands drawing together to its tip, which ends between `reach`
    of the height (ragged tips), leaning by about `lean` pixels; its roots between `roots` of the height
    (lower: a softer edge). A lock is darker at its sides, so locks lying over each other read as locks.
    `under` (0..1) is the share of the height a wash of darker hair fills under them (solid at the top,
    fading out), so a dense band stays whole when drawn small."""
    st = _Strands(w, h, wrap=True)
    locks = []
    for _ in range(count):
        y0 = rng.uniform(*roots) * h
        locks.append((rng.uniform(0.74, 1.0), rng.uniform(0, w), y0, y0 + rng.uniform(*reach) * (h - y0), rng.uniform(*size) / 2, rng.normal(0, lean)))
    locks.sort()  # (the brighter drawn last, over the darker: light catching the outermost hair)
    for g, c, y0, y1, half, dx in locks:
        phase = rng.uniform(0, 6.3)
        for _ in range(per):
            u = rng.uniform(-1, 1)
            start = y0 + abs(u) * 0.08 * h * rng.uniform(0, 1)
            end = y0 + (y1 - y0) * (1 - 0.3 * abs(u) ** 1.5) * rng.uniform(0.85, 1.0)
            ys = np.arange(max(0, int(start)), int(end))
            if len(ys) < 4:
                continue
            t = np.clip((ys - y0) / max(1.0, y1 - y0), 0, 1)
            xs = c + u * half * (1 - 0.45 * t**1.2) + dx * t + rng.normal(0, 1.2) * t
            if wave:
                xs = xs + wave * np.sin(2 * np.pi * ys / 130 + phase)
            tip = np.clip((t - 0.72) / 0.28, 0, 1)
            grey = g * (1 - 0.22 * u * u) * (0.8 + 0.2 * t)  # (darker at its sides and its root)
            st.stroke(ys, xs, rng.uniform(1.4, 2.2) * (1 - 0.4 * tip), 0.95 * (1 - tip**1.5), grey)
    if under:
        ramp = np.clip(1 - (np.arange(h) / h) / under, 0, 1) ** 0.7
        st.under(np.broadcast_to(ramp[:, None] * 0.96, (h, w)), 0.58)
    return st.result()


def facial_hair_texture(seed=7):
    """The texture as (1024, 1024, 4) RGBA, rows from the bottom (as Blender stores pictures): near-white grey
    strands for the game to tint, cut out by alpha."""
    rng = np.random.default_rng(seed)
    S = HAIR_SIZE
    grey = np.full((S, S), 0.8)
    alpha = np.zeros((S, S))

    def put(name, ga):
        y, h = HAIR_BANDS[name]
        g, a = ga
        grey[y + HAIR_PAD : y + h - HAIR_PAD] = g[HAIR_PAD : h - HAIR_PAD]
        alpha[y + HAIR_PAD : y + h - HAIR_PAD] = a[HAIR_PAD : h - HAIR_PAD]

    put("short0", _locks(rng, S, 150, 70, 0.5, reach=(0.7, 1.0), size=(50, 100), per=60))
    put("short1", _locks(rng, S, 150, 44, 0.25, reach=(0.6, 1.0), size=(40, 80), per=48))
    put("short2", _locks(rng, S, 150, 34, 0.0, reach=(0.5, 1.0), size=(20, 44), roots=(0.0, 0.45), per=24, lean=14.0))
    put("long", _locks(rng, S, 400, 50, 0.6, reach=(0.7, 1.0), size=(50, 100), lean=6.0, per=110, wave=3.0))
    # A braid's strands: along the band, side by side with no gaps, a little darker towards its edges (where
    # one strand of the braid goes under the next).
    h = HAIR_BANDS["braid"][1]
    st = _Strands(h, S)  # (drawn standing up, then turned to run along the band)
    for _ in range(420):
        x0 = rng.uniform(0, h)
        ys = np.arange(0, S)
        xs = x0 + rng.uniform(0.6, 2.0) * np.sin(2 * np.pi * ys / S * rng.integers(1, 4) + rng.uniform(0, 6.3))
        st.stroke(ys, xs, rng.uniform(1.4, 2.2), 0.95, rng.uniform(0.62, 0.9) * (1 + 0.04 * np.sin(ys / rng.uniform(12, 40))))
    st.under(np.ones((S, h)), 0.58)
    g, a = st.result()
    across = np.abs(np.linspace(-1, 1, h))
    put("braid", ((g * (1 - 0.45 * across[None, :] ** 2)).T, np.ones((h, S))))
    y, h = HAIR_BANDS["tie"]
    yy = np.linspace(-1, 1, h)[:, None]
    put("tie", (np.broadcast_to(0.3 + 0.22 * (1 - yy**2) + 0.04 * np.sin(np.arange(S)[None, :] / 2.5), (h, S)), np.ones((h, S))))
    rgba = np.stack([grey, grey, grey, alpha], axis=2)
    return rgba[::-1].copy()


def parts_texture(size=512):
    """The horns' and tusks' texture as (size, size, 3), rows from the bottom, near white for their colours to
    tint. Left half, horn: fine grain along it, darker in the grooves between its rings (HORN_RINGS of them
    over the first three quarters, as the horns' own shape has them), darker at the root and paler, polished,
    at the tip. Right half, tooth: ivory with faint lines along it, stained towards the gum. Each mirrors
    across its middle, so a part wraps it round with no seam; v runs from root (0) to tip (1)."""
    half = size // 2
    v = (np.arange(size) + 0.5) / size
    u = (np.arange(half) + 0.5) / half
    U, V = np.meshgrid(u, v)
    P = np.stack([U * 4.0, np.zeros_like(U), V * 0.6], axis=-1).reshape(-1, 3)
    grain = fbm(P * np.array([14.0, 1.0, 1.0]), 1.0, 3, seed=51).reshape(size, half)
    mottle = fbm(np.stack([U * 2.0, V * 5.0, np.zeros_like(U)], axis=-1).reshape(-1, 3), 1.0, 3, seed=52).reshape(size, half)
    ring = horn_rings(V)
    horn = 0.86 + 0.07 * grain + 0.05 * mottle - 0.2 * ring * smoothstep(0.85, 0.5, V)
    horn *= 0.8 + 0.2 * smoothstep(0.0, 0.25, V)
    horn = horn * (1 - smoothstep(0.75, 1.0, V)) + (0.95 + 0.03 * grain) * smoothstep(0.75, 1.0, V)
    lines = fbm(P * np.array([30.0, 1.0, 0.3]), 1.0, 2, seed=53).reshape(size, half)
    tooth = 0.95 + 0.025 * lines - 0.16 * smoothstep(0.35, 0.0, V) - 0.03 * mottle
    out = np.concatenate([horn, tooth], axis=1)
    return np.clip(np.repeat(out[..., None], 3, axis=2), 0, 1)


HORN_RINGS = 13


def horn_rings(t):
    """How deep in a groove between two rings a point `t` along a horn is (0..1): the rings stand over the
    first three quarters and fade out towards the tip."""
    return (0.5 - 0.5 * np.cos(2 * np.pi * HORN_RINGS * np.clip(t, 0, 0.78) / 0.78)) ** 2 * smoothstep(0.8, 0.55, t) * smoothstep(0.0, 0.04, t)
