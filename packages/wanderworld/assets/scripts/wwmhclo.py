"""Helpers for make_mh_hair.py and make_mh_clothes.py: fitting MakeHuman's CC0 hair and clothes (.mhclo
proxies) onto the base avatar bodies (avatar-male.glb and avatar-female.glb), with the body's shape keys
and bone weights carried over, and writing them as the game's hair and outfit files.

The pack's files are data (CC0), read by our own code here; MakeHuman and its add-on are neither run nor
copied. The pack lives outside the repository: `MAKEHUMAN_ASSETS`, else the
`makehuman_system_assets_cc0` folder beside MakeHuman's data (see `wwavatar.data_dir`).

How a proxy is fitted:

1. A .mhclo gives each of the proxy's vertices three of MakeHuman's base-mesh (hm08) vertices, a weight
   for each and an offset (MakeHuman's units, its axes), scaled per axis by how far apart two named
   vertices are on the body it's fitted to (`x_scale`, `y_scale`, `z_scale`).
2. Our bodies keep hm08's 13,380 body vertices in its order (make_avatar.py adds the head's subdivision
   after them). `Body` finds them in the body's .glb by matching the debug .blend's first vertices to
   it, so everything else (positions, shape keys, weights) comes from the .glb the game loads.
3. Most proxies hang on hm08's helper meshes (the tights, the skirt, the hair shell), which our bodies
   don't have. `Body` rebuilds each helper vertex from the body vertices nearest to it on hm08's own base
   mesh: their average position on our body plus the helper's offset from each, scaled to our body's
   size. The hair shell leaves the ears out, so hair follows the skull and not a pointed ear.
4. `fit()` places the proxy on the body as it rests; each shape key is the proxy fitted to the body
   with that key at 1, less the proxy at rest, so it follows every slider exactly as the body does.
5. `push_out()` then lifts the proxy off the skin (and off underwear it's worn over) wherever it sinks in,
   at rest and with each key at 1, the push spread over its neighbours so there's no dent; for cloth it
   also lifts any face the skin comes through between its vertices.
"""

import os

import bpy
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree
from mathutils.kdtree import KDTree

import wwavatar as wa
import wwblend as ww

BONE_NAMES = [b for b, _ in ww.BONES]
BONE_INDEX = {b: i for i, b in enumerate(BONE_NAMES)}
MODELS = os.environ.get("WW_MH_MODELS") or ww.MODELS
BUILD = os.environ.get("WW_MH_BUILD") or ww.BUILD
BODY_VERTS = 13380  # hm08's body vertices; its helpers and joint cubes follow

# The body's regions, by the game's words (src/avatar.js REGION_OF): its vertices whose heaviest bone is one of these.
REGIONS = {
    "head": ["Head"],
    "neck": ["neck_01"],
    "torso": ["spine_01", "spine_02", "spine_03", "clavicle_l", "clavicle_r"],
    "hips": ["pelvis"],
    "upperarms": ["upperarm_l", "upperarm_r"],
    "forearms": ["lowerarm_l", "lowerarm_r"],
    "hands": ["hand_l", "hand_r"],
    "thighs": ["thigh_l", "thigh_r"],
    "calves": ["calf_l", "calf_r"],
    "feet": ["foot_l", "foot_r", "ball_l", "ball_r"],
}
HIDE_WORDS = set(REGIONS) | {"underwear", "underwear-top", "underwear-bottom", "hair"}
SURFACE_PARTS = ("skin", "underwear", "lips", "nails")


def log(what):
    ww._log(what)


def pack_dir():
    found = os.environ.get("MAKEHUMAN_ASSETS")
    if found and os.path.isdir(found):
        return found
    here = os.path.normpath(wa.DATA)
    for _ in range(4):
        here = os.path.dirname(here)
        candidate = os.path.join(here, "makehuman_system_assets_cc0")
        if os.path.isdir(candidate):
            return candidate
    raise SystemExit("MakeHuman's CC0 assets not found: set MAKEHUMAN_ASSETS to makehuman_system_assets_cc0")


PACK = pack_dir()


def smoothstep(e0, e1, x):
    t = np.clip((np.asarray(x, dtype=np.float64) - e0) / (e1 - e0), 0.0, 1.0)
    return t * t * (3 - 2 * t)


def unit(v):
    v = np.asarray(v, dtype=np.float64)
    return v / np.maximum(np.linalg.norm(v, axis=-1, keepdims=True), 1e-12)


def srgb_to_linear(c):
    c = np.clip(np.asarray(c, dtype=np.float64), 0.0, None)
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


# ── The pack's files ─────────────────────────────────────────────────────────────────────────────────


class Proxy:
    """One .mhclo with its .obj and .mhmat: the references, the mesh (positions in MakeHuman's space,
    faces, texture coordinates per face corner) and the texture files."""

    def __init__(self, kind, folder):
        self.dir = os.path.join(PACK, kind, folder)
        mhclo = next(f for f in os.listdir(self.dir) if f.endswith(".mhclo"))
        refs, weights, offsets, delete = [], [], [], set()
        scales = {}
        section = None
        obj_file = mat_file = None
        with open(os.path.join(self.dir, mhclo), encoding="utf-8", errors="replace") as f:
            for line in f:
                words = line.split()
                if not words or words[0].startswith("#"):
                    continue
                key = words[0]
                if key in ("x_scale", "y_scale", "z_scale"):
                    scales[key[0]] = (int(words[1]), int(words[2]), float(words[3]))
                elif key == "obj_file":
                    obj_file = words[1]
                elif key == "material":
                    mat_file = words[1]
                elif key == "verts":
                    section = "verts"
                elif key == "delete_verts":
                    section = "delete"
                elif section == "verts" and key[0].isdigit():
                    if len(words) == 1:
                        refs.append([int(words[0])] * 3)
                        weights.append([1.0, 0.0, 0.0])
                        offsets.append([0.0, 0.0, 0.0])
                    else:
                        refs.append([int(w) for w in words[:3]])
                        weights.append([float(w) for w in words[3:6]])
                        offsets.append([float(w) for w in words[6:9]])
                elif section == "delete" and key[0].isdigit():
                    run, prev = False, None
                    for w in words:
                        if w == "-":
                            run = True
                            continue
                        v = int(w)
                        if run and prev is not None:
                            delete.update(range(prev, v + 1))
                        else:
                            delete.add(v)
                        run, prev = False, v
        self.name = folder
        self.refs = np.array(refs, dtype=np.int64)
        self.weights = np.array(weights, dtype=np.float64)
        self.offsets = np.array(offsets, dtype=np.float64)
        self.scales = scales
        self.delete = np.array(sorted(delete), dtype=np.int64)
        co, uv, faces, face_uv = [], [], [], []
        with open(os.path.join(self.dir, obj_file)) as f:
            for line in f:
                if line.startswith("v "):
                    co.append([float(x) for x in line.split()[1:4]])
                elif line.startswith("vt "):
                    uv.append([float(x) for x in line.split()[1:3]])
                elif line.startswith("f "):
                    parts = [p.split("/") for p in line.split()[1:]]
                    faces.append([int(p[0]) - 1 for p in parts])
                    face_uv.append([int(p[1]) - 1 if len(p) > 1 and p[1] else 0 for p in parts])
        self.co = np.array(co)
        self.uv = np.array(uv) if uv else np.zeros((1, 2))
        self.faces = faces
        self.face_uv = face_uv
        if len(self.co) != len(self.refs):
            raise ValueError(f"{folder}: {len(self.co)} vertices but {len(self.refs)} references")
        self.material = {}
        if mat_file and os.path.exists(os.path.join(self.dir, mat_file)):
            with open(os.path.join(self.dir, mat_file), encoding="utf-8", errors="replace") as f:
                for line in f:
                    words = line.split(None, 1)
                    if len(words) == 2 and not words[0].startswith("#"):
                        self.material[words[0]] = words[1].strip()

    def texture(self, key="diffuseTexture"):
        name = self.material.get(key)
        if not name:
            return None
        path = os.path.join(self.dir, os.path.basename(name))
        return path if os.path.exists(path) else None

    def corner_uvs(self):
        """Texture coordinates per face corner, flattened in face order."""
        return np.array([self.uv[t] for fu in self.face_uv for t in fu])


# ── The body ─────────────────────────────────────────────────────────────────────────────────────────


class Body:
    """One avatar body from its .glb (merged vertices): positions, shape keys, bone weights, joints and
    rig, the skin surface, and hm08's vertex list rebuilt on it (`mh()`)."""

    def __init__(self, sex):
        self.sex = sex
        before = set(bpy.data.objects)
        bpy.ops.import_scene.gltf(filepath=os.path.join(ww.MODELS, f"avatar-{sex}.glb"), merge_vertices=True)
        new = [o for o in bpy.data.objects if o not in before]
        self.rig = next(o for o in new if o.type == "ARMATURE")
        meshes = [o for o in new if o.type == "MESH" and o.data.shape_keys]
        self.obj = next((o for o in meshes if o.name.split(".")[0] == f"avatar-{sex}"), None) or max(meshes, key=lambda o: len(o.data.vertices))
        # The underwear styles (a mesh each, with the body's keys): surfaces a piece worn over them keeps outside.
        self.under = {}
        for o in meshes:
            name = o.name.split(".")[0]
            if o is not self.obj and name.startswith("underwear-"):
                me = o.data
                a = np.zeros(len(me.vertices) * 3)
                me.vertices.foreach_get("co", a)
                co = a.reshape(-1, 3).copy()
                keys = {}
                for k in me.shape_keys.key_blocks[1:]:
                    k.data.foreach_get("co", a)
                    keys[k.name] = a.reshape(-1, 3) - co
                me.calc_loop_triangles()
                t = np.zeros(len(me.loop_triangles) * 3, dtype=np.int64)
                me.loop_triangles.foreach_get("vertices", t)
                self.under[name] = (co, keys, t.reshape(-1, 3))
        for o in new:
            if o not in (self.rig, self.obj):
                bpy.data.objects.remove(o, do_unlink=True)
        if self.rig.animation_data:
            self.rig.animation_data.action = None
        for pb in self.rig.pose.bones:
            pb.rotation_mode = "QUATERNION"
            pb.rotation_quaternion = (1, 0, 0, 0)
            pb.location = (0, 0, 0)
            pb.scale = (1, 1, 1)
        me = self.obj.data
        n = len(me.vertices)
        self.n = n
        a = np.zeros(n * 3)
        me.vertices.foreach_get("co", a)
        self.co = a.reshape(-1, 3).copy()
        kb = me.shape_keys.key_blocks
        self.key_names = [k.name for k in kb][1:]
        self.keys = {}
        for k in kb[1:]:
            k.data.foreach_get("co", a)
            self.keys[k.name] = a.reshape(-1, 3).copy() - self.co
        names = {g.index: g.name for g in self.obj.vertex_groups}
        W = np.zeros((n, len(BONE_NAMES)))
        for v in me.vertices:
            for g in v.groups:
                if names[g.group] in BONE_INDEX:
                    W[v.index, BONE_INDEX[names[g.group]]] = g.weight
        self.W = W / np.maximum(W.sum(1, keepdims=True), 1e-9)
        mats = [m.name.split(".")[0] for m in me.materials]
        self.poly_mat = np.array([mats[p.material_index] for p in me.polygons])
        me.calc_loop_triangles()
        t = np.zeros(len(me.loop_triangles) * 3, dtype=np.int64)
        me.loop_triangles.foreach_get("vertices", t)
        tp = np.zeros(len(me.loop_triangles), dtype=np.int64)
        me.loop_triangles.foreach_get("polygon_index", tp)
        self.tris = t.reshape(-1, 3)[np.isin(self.poly_mat[tp], SURFACE_PARTS)]
        self._bvh = {}
        self.J = {}
        for b in self.rig.data.bones:
            self.J[b.name] = np.array(b.head_local)
            self.J[b.name + ".tail"] = np.array(b.tail_local)
        self.bone = np.array(BONE_NAMES)[self.W.argmax(1)]
        self.region = np.array([next((r for r, bones in REGIONS.items() if b in bones), "") for b in self.bone])
        self.side = side_of(self.bone)
        self._match_mh()
        self._helpers()
        log(f"body {sex}: {n} vertices, {len(self.tris)} surface triangles")

    def _match_mh(self):
        """hm08's body vertices in the .glb: the debug .blend's mesh keeps them first, in hm08's order."""
        path = os.path.join(ww.BUILD, f"avatar-{self.sex}.blend")
        if not os.path.exists(path):
            raise SystemExit(f"{path} is missing: run make_avatar.py first (it saves the debug .blend)")
        with bpy.data.libraries.load(path, link=False) as (src, dst):
            dst.meshes = [m for m in src.meshes if m == f"avatar-{self.sex}"]
        mesh = dst.meshes[0]
        a = np.zeros(len(mesh.vertices) * 3)
        mesh.vertices.foreach_get("co", a)
        first = a.reshape(-1, 3)[:BODY_VERTS]
        bpy.data.meshes.remove(mesh)
        kd = KDTree(self.n)
        for i, p in enumerate(self.co):
            kd.insert(p, i)
        kd.balance()
        found = [kd.find(p) for p in first]
        self.mh_index = np.array([f[1] for f in found], dtype=np.int64)
        worst = max(f[2] for f in found)
        if worst > 1e-4 or len(set(self.mh_index.tolist())) != BODY_VERTS:
            raise SystemExit(f"avatar-{self.sex}.blend doesn't match its .glb (off by {worst:.5f} m): run make_avatar.py again")

    def _helpers(self, k=6):
        """Each helper vertex of hm08 as a weighted average of its nearest body vertices on hm08's base mesh
        (indices, weights and offsets, scaled to our body)."""
        base = wa.Base()
        self.base = base
        bco = wa.to_blender(base.co)
        body_bco = bco[:BODY_VERTS]
        ours = self.co[self.mh_index]
        # Our body's size against hm08's: the body's height.
        self.size = (ours[:, 2].max() - ours[:, 2].min()) / (body_bco[:, 2].max() - body_bco[:, 2].min())
        # The ears (what the pointed-ear key moves) are left out of the hair shell's neighbours.
        ear = np.zeros(BODY_VERTS, dtype=bool)
        if "ears_pointed" in self.keys:
            ear = np.linalg.norm(self.keys["ears_pointed"][self.mh_index], axis=1) > 0.0005
        hair = set(base.groups.get("helper-hair", []).tolist())
        trees = {}
        for name, mask in (("all", np.ones(BODY_VERTS, dtype=bool)), ("no_ears", ~ear)):
            ids = np.nonzero(mask)[0]
            kd = KDTree(len(ids))
            for i in ids:
                kd.insert(body_bco[i], int(i))
            kd.balance()
            trees[name] = kd
        m = len(bco) - BODY_VERTS
        idx = np.zeros((m, k), dtype=np.int64)
        w = np.zeros((m, k))
        for j in range(m):
            v = BODY_VERTS + j
            hits = trees["no_ears" if v in hair else "all"].find_n(bco[v], k)
            d = np.array([h[2] for h in hits])
            idx[j] = [h[1] for h in hits]
            ww_ = 1.0 / np.maximum(d, 1e-4) ** 2
            w[j] = ww_ / ww_.sum()
        self.h_idx, self.h_w = idx, w
        self.h_off = (bco[BODY_VERTS:, None, :] - body_bco[idx]) * self.size

    def mh(self, co=None):
        """hm08's whole vertex list (19,158) on our body with positions `co` (the body's, keyed or not)."""
        co = self.co if co is None else co
        ours = co[self.mh_index]
        helpers = ((ours[self.h_idx] + self.h_off) * self.h_w[..., None]).sum(1)
        return np.concatenate([ours, helpers])

    def mh_values(self, values):
        """Per-vertex values (weights) on hm08's whole vertex list."""
        ours = values[self.mh_index]
        helpers = (ours[self.h_idx] * self.h_w[..., None]).sum(1)
        return np.concatenate([ours, helpers])

    def morphed(self, values):
        co = self.co.copy()
        for k, v in values.items():
            if v:
                co = co + self.keys[k] * v
        return co

    def bvh(self, values=None, under=(), drop_side=0):
        """The skin's surface (and the named underwear meshes') with shape keys {name: value}: (BVH tree, the
        body's positions). With `drop_side` (1 the left, -1 the right) that side's limbs are left out."""
        key = (tuple(sorted((k, round(v, 4)) for k, v in (values or {}).items() if v)), tuple(sorted(under)), drop_side)
        if key not in self._bvh:
            co = self.morphed(dict(key[0]))
            skin = self.tris if not drop_side else self.tris[self.side[self.tris[:, 0]] != drop_side]
            points, tris = [co], [skin]
            base = len(co)
            for name in key[1]:
                uco, ukeys, utris = self.under[name]
                moved = uco.copy()
                for k, v in key[0]:
                    if k in ukeys:
                        moved = moved + ukeys[k] * v
                points.append(moved)
                tris.append(utris + base)
                base += len(moved)
            self._bvh[key] = (BVHTree.FromPolygons(np.concatenate(points).tolist(), np.concatenate(tris).tolist()), co)
        return self._bvh[key]

    def skin_weights(self, points):
        """The bone weights of the skin nearest each point (barycentric in its triangle), and how far it is."""
        bvh, _ = self.bvh()
        W = np.zeros((len(points), self.W.shape[1]))
        dist = np.zeros(len(points))
        for i, p in enumerate(points):
            loc, _, t, d = bvh.find_nearest(Vector(p))
            a, b, c = (self.co[j] for j in self.tris[t])
            v0, v1, v2 = b - a, c - a, np.array(loc) - a
            d00, d01, d11 = v0 @ v0, v0 @ v1, v1 @ v1
            den = d00 * d11 - d01 * d01
            if abs(den) < 1e-20:
                w = np.array([1.0, 0.0, 0.0])
            else:
                v = (d11 * (v2 @ v0) - d01 * (v2 @ v1)) / den
                u = (d00 * (v2 @ v1) - d01 * (v2 @ v0)) / den
                w = np.clip([1 - v - u, v, u], 0, 1)
                w = w / max(w.sum(), 1e-9)
            W[i] = w @ self.W[self.tris[t]]
            dist[i] = d
        return W, dist

    def region_of_mh(self):
        """The region of each of hm08's body vertices."""
        return self.region[self.mh_index]


LIMBS = ("clavicle", "upperarm", "lowerarm", "hand", "thigh", "calf", "foot", "ball")


def side_of(bones):
    """1 for a left limb's bone, -1 for a right one's, 0 for the trunk and head."""
    return np.array([(1 if b.endswith("_l") else -1) if b.endswith(("_l", "_r")) and b.split("_")[0] in LIMBS else 0 for b in bones])


def nearest(bvh, points):
    k = len(points)
    loc = np.zeros((k, 3))
    nrm = np.zeros((k, 3))
    for i, p in enumerate(points):
        hit = bvh.find_nearest(Vector(p))
        loc[i] = hit[0]
        nrm[i] = hit[1]
    d = ((points - loc) * nrm).sum(1)
    return loc, nrm, d


# ── Fitting ──────────────────────────────────────────────────────────────────────────────────────────


def fit_positions(proxy, M):
    """The proxy's vertices on hm08's vertex list M (our body's, Blender's axes, metres)."""
    s = {}
    for axis, col in (("x", 0), ("y", 2), ("z", 1)):  # MakeHuman's y is up (our z), its z forward (our -y)
        v1, v2, d = proxy.scales[axis]
        s[axis] = abs(M[v1, col] - M[v2, col]) / d
    o = proxy.offsets
    off = np.stack([o[:, 0] * s["x"], -o[:, 2] * s["z"], o[:, 1] * s["y"]], axis=1)
    return (M[proxy.refs] * proxy.weights[..., None]).sum(1) + off


class Fitted:
    """A proxy on one body: positions at rest, an offset per shape key, bone weights, faces, corner UVs."""

    def __init__(self, proxy, body, keys=None):
        self.proxy = proxy
        self.body = body
        self.co = fit_positions(proxy, body.mh())
        self.key_names = list(keys or body.key_names)
        self.keys = {}
        for k in self.key_names:
            self.keys[k] = fit_positions(proxy, body.mh(body.co + body.keys[k])) - self.co
        MW = body.mh_values(body.W)
        self.W = (MW[proxy.refs] * proxy.weights[..., None]).sum(1)
        self.faces = [list(f) for f in proxy.faces]
        self.corner_uv = proxy.corner_uvs()
        self._nb = None

    def subset(self, face_ids):
        """A new Fitted holding only these faces (and the vertices they use), renumbered."""
        out = Fitted.__new__(Fitted)
        out.proxy, out.body, out.key_names = self.proxy, self.body, self.key_names
        used = sorted({v for f in face_ids for v in self.faces[f]})
        remap = {v: i for i, v in enumerate(used)}
        used = np.array(used)
        out.co = self.co[used].copy()
        out.keys = {k: d[used].copy() for k, d in self.keys.items()}
        out.W = self.W[used].copy()
        out.faces = [[remap[v] for v in self.faces[f]] for f in face_ids]
        starts = np.cumsum([0] + [len(f) for f in self.faces])
        out.corner_uv = np.concatenate([self.corner_uv[starts[f] : starts[f + 1]] for f in face_ids])
        out.source = used
        out._nb = None
        return out

    def neighbours(self):
        if self._nb is None:
            n = len(self.co)
            pairs = set()
            for f in self.faces:
                for i in range(len(f)):
                    a, b = f[i], f[(i + 1) % len(f)]
                    pairs.add((a, b))
                    pairs.add((b, a))
            pairs = np.array(sorted(pairs)) if pairs else np.zeros((0, 2), dtype=np.int64)
            starts = np.searchsorted(pairs[:, 0], np.arange(n + 1))
            self._nb = (pairs[:, 1], starts)
        return self._nb

    def smooth(self, values, rounds=1, factor=0.5):
        idx, starts = self.neighbours()
        counts = np.diff(starts)
        owner = np.repeat(np.arange(len(counts)), counts)
        v = values.copy()
        for _ in range(rounds):
            acc = np.zeros_like(v)
            np.add.at(acc, owner, v[idx])
            avg = acc / np.maximum(counts, 1).reshape((-1,) + (1,) * (v.ndim - 1))
            has = (counts > 0).reshape((-1,) + (1,) * (v.ndim - 1))
            v = np.where(has, v + (avg - v) * factor, v)
        return v

    def spread(self, push, rounds=4):
        """Spreads pushes (n, 3) to the neighbours, never lessening any: no dents round a pushed vertex."""
        idx, starts = self.neighbours()
        counts = np.diff(starts)
        owner = np.repeat(np.arange(len(counts)), counts)
        p = push.copy()
        for _ in range(rounds):
            acc = np.zeros_like(p)
            np.add.at(acc, owner, p[idx])
            avg = acc / np.maximum(counts, 1)[:, None] * 0.7
            grow = np.linalg.norm(avg, axis=1) > np.linalg.norm(p, axis=1)
            p[grow] = avg[grow]
        return p

    def positions(self, values):
        co = self.co.copy()
        for k, v in values.items():
            if v:
                co = co + self.keys[k] * v
        return co

    def push_out(self, clearance, configs, mask=None, rounds=3, spread=4, limit=0.05, under=(), skin=False, keep=0.015):
        """Lifts the proxy off the skin (and the `under` underwear meshes) to `clearance` (metres; an array per
        vertex, or one value) at rest, then with each shape key in `configs` ({key: value} each): at rest it
        moves the positions, for a key that key's offsets. Vertices further than `limit` inside are left
        alone (another side of the body). With `skin`, the skin between the proxy's vertices is kept under it
        too: where the skin comes through a face (a ray out from the skin meets the proxy too late), that
        face is lifted. With a key, cloth within `keep` of the skin keeps the gap it has at rest. Returns
        {config name: (vertices under the skin, deepest in mm)} as found."""
        clearance = np.broadcast_to(np.asarray(clearance, dtype=np.float64), (len(self.co),))
        report = {}
        if skin:
            me = self.body.obj.data
            a = np.zeros(self.body.n * 3)
            me.vertices.foreach_get("normal", a)
            bnrm = a.reshape(-1, 3)
            reach = coverage(self, self.body)
            watch = np.nonzero(reach)[0]

        # Each limb's cloth is kept off its own limb and the trunk, not the other limb (a trouser leg off the
        # other thigh where a heavy body's thighs touch, or it ends up inside it and shows it when walking).
        side = side_of(np.array(BONE_NAMES)[self.W.argmax(1)])

        def correction(values, clearance):
            bco = self.body.bvh(values, under)[1]
            total = np.zeros_like(self.co)
            first = None
            for _ in range(rounds):
                P = self.positions(values) + total
                nrm = np.zeros_like(P)
                d = np.zeros(len(P))
                for sd in (-1, 0, 1):
                    sel = side == sd
                    if sel.any():
                        bvh, _ = self.body.bvh(values, under, drop_side=-sd)
                        _, nrm[sel], d[sel] = nearest(bvh, P[sel])
                need = clearance - d
                bad = (need > 0) & (d > -limit)
                if mask is not None:
                    bad &= mask
                if first is None:
                    first = (int(((d < 0) & (d > -limit) & (mask if mask is not None else True)).sum()), float(max(0.0, -d[bad].min()) * 1000) if bad.any() else 0.0)
                push = np.zeros_like(P)
                push[bad] = nrm[bad] * need[bad, None]
                if skin:
                    tree = BVHTree.FromPolygons(P.tolist(), self.faces)
                    back = 0.03
                    for i in watch:
                        n = bnrm[i]
                        hit = tree.ray_cast(Vector(bco[i] - n * back), Vector(n), back + 0.03)
                        if hit[0] is None or self.body.side[i] * side[self.faces[hit[2]][0]] < 0:
                            continue
                        over = back + float(clearance.min()) - hit[3]
                        if over > 0:
                            for v in self.faces[hit[2]]:
                                want = n * over
                                if want @ want > push[v] @ push[v]:
                                    push[v] = want
                    bad = bad | (np.linalg.norm(push, axis=1) > 0)
                if not bad.any():
                    break
                total += self.spread(push, spread) if spread else push
            return total, first

        c, first = correction({}, clearance)
        self.co = self.co + c
        report["rest"] = first
        # With a key, cloth close to the skin keeps the gap it has at rest (up to `keep`), not only the
        # clearance: so keys used together (heavy and belly) don't each eat into the same gap and add up.
        bvh, _ = self.body.bvh({}, under)
        _, _, d0 = nearest(bvh, self.co)
        gap = np.where(d0 < keep, np.clip(d0, clearance, keep), clearance)
        for name, values in configs.items():
            c, first = correction(values, gap)
            report[name] = first
            if len(values) == 1:
                (k,) = values
                self.keys[k] = self.keys[k] + c / values[k]
        return report

    def clipping(self, values, depth=0.0, limit=0.05, mask=None):
        """How many vertices are under the skin (deeper than `depth`), and the deepest, in mm (each limb's
        cloth against its own limb and the trunk, as `push_out` keeps it)."""
        P = self.positions(values)
        side = side_of(np.array(BONE_NAMES)[self.W.argmax(1)])
        d = np.zeros(len(P))
        for sd in (-1, 0, 1):
            sel = side == sd
            if sel.any():
                bvh, _ = self.body.bvh(values, drop_side=-sd)
                d[sel] = nearest(bvh, P[sel])[2]
        bad = (d < -depth) & (d > -limit)
        if mask is not None:
            bad &= mask
        return int(bad.sum()), float(-d[bad].min() * 1000) if bad.any() else 0.0

    def limit_weights(self, keep=4):
        W = self.W.copy()
        if W.shape[1] > keep:
            order = np.argsort(-W, axis=1)
            cut = np.zeros_like(W, dtype=bool)
            np.put_along_axis(cut, order[:, keep:], True, axis=1)
            W[cut] = 0
        W[W < 0.01] = 0
        self.W = W / np.maximum(W.sum(1, keepdims=True), 1e-9)

    def islands(self):
        """Faces in connected groups (sharing a vertex)."""
        parent = list(range(len(self.co)))

        def find(a):
            while parent[a] != a:
                parent[a] = parent[parent[a]]
                a = parent[a]
            return a

        for f in self.faces:
            r = find(f[0])
            for v in f[1:]:
                rv = find(v)
                if rv != r:
                    parent[rv] = r
        groups = {}
        for i, f in enumerate(self.faces):
            groups.setdefault(find(f[0]), []).append(i)
        return sorted(groups.values(), key=len, reverse=True)


def coverage(fitted, body, reach=0.08, back=0.03):
    """Which of the body's vertices the proxy covers: a ray out along the skin's normal, from a little under
    the skin (`back`, so skin poking through still counts), meets it within `reach`. Returns a bool per body
    vertex (the .glb's numbering)."""
    co = fitted.co
    faces = fitted.faces
    bvh = BVHTree.FromPolygons(co.tolist(), faces)
    me = body.obj.data
    a = np.zeros(body.n * 3)
    me.vertices.foreach_get("normal", a)
    nrm = a.reshape(-1, 3)
    out = np.zeros(body.n, dtype=bool)
    for i in range(body.n):
        p = Vector(body.co[i] - nrm[i] * back)
        hit = bvh.ray_cast(p, Vector(nrm[i]), reach + back)
        out[i] = hit[0] is not None
    return out


def poking(fitted, body, values, covered, depth=0.0005, back=0.03):
    """Body vertices (among `covered`) that come through the proxy: a ray out from under the skin meets the
    proxy before it reaches the skin (deeper than `depth`). Returns the count and the deepest in mm."""
    co = fitted.positions(values)
    bvh = BVHTree.FromPolygons(co.tolist(), fitted.faces)
    bco = body.morphed(values)
    me = body.obj.data
    a = np.zeros(body.n * 3)
    me.vertices.foreach_get("normal", a)
    nrm = a.reshape(-1, 3)
    worst, count = 0.0, 0
    for i in np.nonzero(covered)[0]:
        hit = bvh.ray_cast(Vector(bco[i] - nrm[i] * back), Vector(nrm[i]), back)
        if hit[0] is not None and back - hit[3] > depth:
            count += 1
            worst = max(worst, back - hit[3])
    return count, worst * 1000


# ── Textures ─────────────────────────────────────────────────────────────────────────────────────────


def load_rgba(path, size=None):
    """An image file as an (h, w, 4) array of its stored values (sRGB for colour), row 0 at the bottom."""
    image = bpy.data.images.load(path)
    if size and tuple(image.size) != (size, size):
        image.scale(size, size)
    w, h = image.size
    px = np.zeros(w * h * 4, dtype=np.float32)
    image.pixels.foreach_get(px)
    bpy.data.images.remove(image)
    return px.reshape(h, w, 4).astype(np.float64)


def uv_mask(faces_uv, size, grow=3):
    """Pixels inside the texture islands: faces_uv is a list of (k, 2) corner arrays."""
    mask = np.zeros((size, size), dtype=bool)
    for uv in faces_uv:
        p = np.asarray(uv) * size - 0.5
        for i in range(1, len(p) - 1):
            a, b, c = p[0], p[i], p[i + 1]
            x0, x1 = int(max(0, np.floor(min(a[0], b[0], c[0])))), int(min(size - 1, np.ceil(max(a[0], b[0], c[0]))))
            y0, y1 = int(max(0, np.floor(min(a[1], b[1], c[1])))), int(min(size - 1, np.ceil(max(a[1], b[1], c[1]))))
            if x1 < x0 or y1 < y0:
                continue
            xs, ys = np.meshgrid(np.arange(x0, x1 + 1), np.arange(y0, y1 + 1))
            v0, v1 = b - a, c - a
            den = v0[0] * v1[1] - v1[0] * v0[1]
            if abs(den) < 1e-12:
                continue
            px, py = xs - a[0], ys - a[1]
            s = (px * v1[1] - v1[0] * py) / den
            t = (v0[0] * py - px * v0[1]) / den
            inside = (s >= -0.02) & (t >= -0.02) & (s + t <= 1.02)
            mask[ys[inside], xs[inside]] = True
    for _ in range(grow):
        m = mask.copy()
        m[1:] |= mask[:-1]
        m[:-1] |= mask[1:]
        m[:, 1:] |= mask[:, :-1]
        m[:, :-1] |= mask[:, 1:]
        mask = m
    return mask


def box_blur(img, r):
    if r <= 0:
        return img
    out = img.copy()
    for axis in (0, 1):
        c = np.cumsum(np.pad(out, [(r + 1, r) if a == axis else (0, 0) for a in range(out.ndim)], mode="edge"), axis=axis)
        hi = np.take(c, np.arange(2 * r + 1, c.shape[axis]), axis=axis)
        lo = np.take(c, np.arange(0, c.shape[axis] - 2 * r - 1), axis=axis)
        out = (hi - lo) / (2 * r + 1)
    return out


def fill_outside(rgb, mask, rounds=6):
    """Colours outside the mask taken from inside (blurred outwards), so mipmaps and filtering don't pull in
    whatever was there (a watermark, a background)."""
    m = mask.astype(np.float64)
    acc = rgb * m[..., None]
    out = rgb.copy()
    out[~mask] = (acc.sum((0, 1)) / max(m.sum(), 1))
    for r in (2, 4, 8, 16, 32, 64)[:rounds]:
        bm = box_blur(m, r)
        ba = box_blur(acc, r)
        have = (bm > 1e-3) & ~mask
        out[have] = ba[have] / bm[have, None]
    return out


def luminance(rgb):
    return rgb[..., 0] * 0.2126 + rgb[..., 1] * 0.7152 + rgb[..., 2] * 0.0722


def save_image(name, rgba, fmt="PNG", quality=90, colour=True):
    """Saved to the build folder and packed, so the .glb carries it (PNG with alpha, or JPEG)."""
    h, w = rgba.shape[:2]
    alpha = rgba.shape[2] == 4
    image = bpy.data.images.new(name, w, h, alpha=alpha)
    px = rgba if alpha else np.concatenate([rgba, np.ones((h, w, 1))], axis=2)
    image.pixels.foreach_set(np.clip(px, 0, 1).astype(np.float32).ravel())
    os.makedirs(BUILD, exist_ok=True)
    path = os.path.join(BUILD, f"{name}.{'png' if fmt == 'PNG' else 'jpg'}")
    image.filepath_raw = path
    image.file_format = fmt
    if fmt == "PNG":
        image.save(filepath=path)
    else:
        image.save(filepath=path, quality=quality)
    bpy.data.images.remove(image)
    image = bpy.data.images.load(path)
    image.pack()
    if not colour:
        image.colorspace_settings.name = "Non-Color"
    return image


# ── The rig, the mesh, the file ──────────────────────────────────────────────────────────────────────


def make_rig(body):
    """The body's armature rebuilt as make_avatar.py builds it (the same heads, tails and rolls), so the
    proxy's inverse bind matrices match the body's."""
    body.rig.name = f"import-{body.sex}-rig"
    children = {}
    for name, parent in ww.BONES:
        children.setdefault(parent, []).append(name)
    armature = bpy.data.armatures.new(f"avatar-{body.sex}-rig")
    rig = bpy.data.objects.new(f"avatar-{body.sex}-rig", armature)
    bpy.context.scene.collection.objects.link(rig)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.mode_set(mode="EDIT")
    for name, parent in ww.BONES:
        bone = armature.edit_bones.new(name)
        bone.head = Vector(body.J[name])
        if name.startswith(("Head", "hand_", "ball_")):
            bone.tail = Vector(body.J[name + ".tail"])
        else:
            bone.tail = Vector(body.J[children[name][0]])
        if parent:
            bone.parent = armature.edit_bones[parent]
        direction = (bone.tail - bone.head).normalized()
        bone.align_roll(Vector((0, 0, 1)) if abs(direction.z) < 0.5 else Vector((0, -1, 0)))
    bpy.ops.object.mode_set(mode="OBJECT")
    return rig


def build_object(name, fitted, rig, materials, face_mat=None, normals=None):
    """The Blender mesh: positions, faces, corner UVs, shape keys with the body's names, vertex groups on the
    rig's bones, materials (face_mat: a material index per face), custom normals if given."""
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(fitted.co.tolist(), [], fitted.faces)
    mesh.validate(clean_customdata=False)
    if len(mesh.polygons) != len(fitted.faces):
        raise RuntimeError(f"{name}: {len(fitted.faces) - len(mesh.polygons)} faces lost in validation")
    uv = mesh.uv_layers.new(name="UVMap")
    uv.data.foreach_set("uv", fitted.corner_uv.astype(np.float32).ravel())
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    for m in materials:
        mesh.materials.append(m)
    mesh.polygons.foreach_set("material_index", list(face_mat) if face_mat is not None else [0] * len(fitted.faces))
    mesh.polygons.foreach_set("use_smooth", [True] * len(fitted.faces))
    if normals is not None:
        mesh.normals_split_custom_set_from_vertices([tuple(n) for n in normals])
    obj.shape_key_add(name="Basis", from_mix=False)
    for k in fitted.key_names:
        sk = obj.shape_key_add(name=k, from_mix=False)
        sk.data.foreach_set("co", (fitted.co + fitted.keys[k]).astype(np.float32).ravel())
    for bi, b in enumerate(BONE_NAMES):
        idx = np.nonzero(fitted.W[:, bi] > 0)[0]
        if not len(idx):
            continue
        vg = obj.vertex_groups.new(name=b)
        for i in idx:
            vg.add([int(i)], float(fitted.W[i, bi]), "REPLACE")
    obj.parent = rig
    obj.modifiers.new("Armature", "ARMATURE").object = rig
    return obj


def material(name, image, colour=(1.0, 1.0, 1.0), roughness=0.8, alpha_cutoff=None, part=None):
    """The image times a colour (glTF base colour texture and factor), alpha MASK at `alpha_cutoff` if
    given. `part` goes in the material's extras."""
    m = bpy.data.materials.new(name)
    if part:
        m["part"] = part
    m.use_nodes = True
    m.use_backface_culling = False
    nodes, links = m.node_tree.nodes, m.node_tree.links
    bsdf = nodes.get("Principled BSDF")
    bsdf.inputs["Roughness"].default_value = roughness
    tex = nodes.new("ShaderNodeTexImage")
    tex.image = image
    mix = nodes.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    mix.blend_type = "MULTIPLY"
    mix.inputs["Factor"].default_value = 1.0
    links.new(tex.outputs["Color"], mix.inputs["A"])
    mix.inputs["B"].default_value = (*[float(c) for c in colour], 1.0)
    links.new(mix.outputs["Result"], bsdf.inputs["Base Color"])
    if alpha_cutoff is not None:
        # 1 - (alpha < cutoff): the glTF exporter writes this as alpha mode MASK with that cutoff.
        less = nodes.new("ShaderNodeMath")
        less.operation = "LESS_THAN"
        less.inputs[1].default_value = alpha_cutoff
        links.new(tex.outputs["Alpha"], less.inputs[0])
        inv = nodes.new("ShaderNodeMath")
        inv.operation = "SUBTRACT"
        inv.inputs[0].default_value = 1.0
        links.new(less.outputs[0], inv.inputs[1])
        links.new(inv.outputs[0], bsdf.inputs["Alpha"])
        m.surface_render_method = "DITHERED"
    return m


def export(path, objects, rigs, blend=True):
    bpy.ops.object.select_all(action="DESELECT")
    for o in list(objects) + list(rigs):
        o.select_set(True)
    bpy.context.view_layer.objects.active = rigs[0]
    os.makedirs(os.path.dirname(path), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        use_selection=True,
        export_animations=False,
        export_skins=True,
        export_morph=True,
        export_morph_normal=True,
        export_yup=True,
        export_normals=True,
        export_texcoords=True,
        export_materials="EXPORT",
        export_image_format="AUTO",
        export_extras=True,
    )
    if blend:
        os.makedirs(BUILD, exist_ok=True)
        stem = os.path.splitext(os.path.basename(path))[0]
        bpy.ops.wm.save_as_mainfile(filepath=os.path.join(BUILD, f"{stem}.blend"), compress=True, copy=True)
    return os.path.getsize(path)
