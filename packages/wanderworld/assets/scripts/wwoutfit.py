"""Helpers for make_outfit.py: modular clothing and armour for the base avatar bodies (avatar-male.glb and
avatar-female.glb), made around each body so a piece fits it, follows its shape keys and moves with it.

How a piece is made:

1. `Body(sex)` reads the body's .glb (merged vertices): positions, shape keys, bone weights, joints and
   the skin surface (a BVH tree for nearest-point and ray queries).
2. A piece is a `Geo`: positions, faces, a material part per face, a panel per face (its pattern piece,
   for the texture's islands) and edge classes (`hem`, `seam`) for stitching. Hugging parts start from
   the body's own faces (`Geo.from_body`), are wrapped (`wrap`: smoothed so the cloth bridges hollows,
   kept a set distance off the skin), cut along scalar fields for clean hems and seams (`Geo.split`,
   `Geo.clip`), given a turned-in rim (`Geo.rim`) and folds. Loose and rigid parts are lofted from rings
   round an axis (`loft`), sized from the body's outline.
3. `fit()` skins the piece: each vertex takes the bone weights and shape key offsets of the nearest point
   on the body (barycentric), smoothed where the cloth hangs loose or the piece is rigid, and then corrected
   per key so no vertex sinks under the morphed skin (or under `under`, the layers it is worn over).
4. `finish()` builds the Blender mesh (shape keys with the body's names, vertex groups, UVs unwrapped per
   panel and turned so each island's "down" runs down the texture), paints a greyscale detail texture and
   a normal map in numpy (`paint`), adds one material per part, and `export()` writes
   assets/models/outfit-<piece>.glb with the `male` and `female` meshes.
"""

import json
import math
import os

import bmesh
import bpy
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree

import wwblend as ww

BONE_NAMES = [b for b, _ in ww.BONES]
BONE_INDEX = {b: i for i, b in enumerate(BONE_NAMES)}
BUILD = os.environ.get("WW_OUTFIT_BUILD") or ww.BUILD
# Where the .glb files go (WW_OUTFIT_MODELS: somewhere else, for trial builds).
MODELS = os.environ.get("WW_OUTFIT_MODELS") or ww.MODELS

# The body regions a piece can hide, by the game's words (src/avatar.js REGION_OF): the body's vertices
# whose heaviest bone is one of these. The game hides a body triangle when all three of its vertices are in
# hidden regions (and the underwear with it).
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
# What else `hides` may name: the underwear (both layers or one) and the hair.
HIDE_WORDS = set(REGIONS) | {"underwear", "underwear-top", "underwear-bottom", "hair"}
# The smallest move a shape key keeps (metres): less is dropped, so the kit carries each key only where it
# shows. Clearances are 2 mm and more, so this never sinks a piece into the skin.
MORPH_MIN = 0.0015
# The body's parts a piece must stay outside of.
SURFACE_PARTS = ("skin", "underwear", "lips", "nails")


def log(what):
    ww._log(what)


def unit(v):
    v = np.asarray(v, dtype=np.float64)
    return v / np.maximum(np.linalg.norm(v, axis=-1, keepdims=True), 1e-12)


def smoothstep(e0, e1, x):
    t = np.clip((np.asarray(x, dtype=np.float64) - e0) / (e1 - e0), 0.0, 1.0)
    return t * t * (3 - 2 * t)


def srgb_to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def bary(a, b, c, p):
    """Barycentric weights (k, 3) of points p in triangles (a, b, c)."""
    v0, v1, v2 = b - a, c - a, p - a
    d00 = (v0 * v0).sum(1)
    d01 = (v0 * v1).sum(1)
    d11 = (v1 * v1).sum(1)
    d20 = (v2 * v0).sum(1)
    d21 = (v2 * v1).sum(1)
    den = d00 * d11 - d01 * d01
    den = np.where(np.abs(den) < 1e-20, 1e-20, den)
    v = (d11 * d20 - d01 * d21) / den
    w = (d00 * d21 - d01 * d20) / den
    out = np.stack([1 - v - w, v, w], axis=1)
    out = np.clip(out, 0, 1)
    return out / np.maximum(out.sum(1, keepdims=True), 1e-12)


def value_noise(p, scale, seed=0):
    """Smooth value noise in -1..1 at points p (n, 2 or 3)."""
    p = np.asarray(p, dtype=np.float64)
    if p.shape[-1] == 2:
        p = np.concatenate([p, np.zeros(p.shape[:-1] + (1,))], axis=-1)
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
                w = (f[..., 0] if dx else 1 - f[..., 0]) * (f[..., 1] if dy else 1 - f[..., 1]) * (f[..., 2] if dz else 1 - f[..., 2])
                out = out + w * h(i0[..., 0] + dx, i0[..., 1] + dy, i0[..., 2] + dz)
    return out


def fbm(p, scale, octaves=4, seed=0, gain=0.5):
    total, amp, norm = 0.0, 1.0, 0.0
    for o in range(octaves):
        total = total + amp * value_noise(p, scale * 2**o, seed + o * 7)
        norm += amp
        amp *= gain
    return total / norm


# ── The body ─────────────────────────────────────────────────────────────────────────────────────────


class Body:
    """One avatar body as numpy arrays, at rest (the A-pose its .glb rests in)."""

    def __init__(self, sex):
        self.sex = sex
        before = set(bpy.data.objects)
        # (The body's file is rebuilt now and then: a read caught mid-write is tried again.)
        for attempt in range(6):
            try:
                bpy.ops.import_scene.gltf(filepath=os.path.join(ww.MODELS, f"avatar-{sex}.glb"), merge_vertices=True)
                break
            except Exception:
                if attempt == 5:
                    raise
                __import__("time").sleep(20)
        new = [o for o in bpy.data.objects if o not in before]
        self.rig = next(o for o in new if o.type == "ARMATURE")
        # (The body mesh by its name: the .glb also holds the underwear meshes, which have the keys too.)
        meshes = [o for o in new if o.type == "MESH" and o.data.shape_keys]
        self.obj = next((o for o in meshes if o.name.split(".")[0] == f"avatar-{sex}"), None) or max(meshes, key=lambda o: len(o.data.vertices))
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
        # (Not the race_* keys: the game carries a race's build onto clothes itself, at run time.)
        own = [k for k in kb[1:] if not k.name.startswith("race_")]
        self.key_names = [k.name for k in own]
        self.keys = {}
        for k in own:
            k.data.foreach_get("co", a)
            self.keys[k.name] = a.reshape(-1, 3).copy() - self.co
        names = {g.index: g.name for g in self.obj.vertex_groups}
        W = np.zeros((n, len(BONE_NAMES)))
        for v in me.vertices:
            for g in v.groups:
                W[v.index, BONE_INDEX[names[g.group]]] = g.weight
        self.W = W / np.maximum(W.sum(1, keepdims=True), 1e-9)
        me.vertices.foreach_get("normal", a)
        self.normals = a.reshape(-1, 3).copy()
        # (A second body imported into the same file gets "skin.001" and so on.)
        mats = [m.name.split(".")[0] for m in me.materials]
        self.poly_mat = np.array([mats[p.material_index] for p in me.polygons])
        self.polys = [list(p.vertices) for p in me.polygons]
        me.calc_loop_triangles()
        t = np.zeros(len(me.loop_triangles) * 3, dtype=np.int64)
        me.loop_triangles.foreach_get("vertices", t)
        tp = np.zeros(len(me.loop_triangles), dtype=np.int64)
        me.loop_triangles.foreach_get("polygon_index", tp)
        keep = np.isin(self.poly_mat[tp], SURFACE_PARTS)
        self.tris = t.reshape(-1, 3)[keep]
        self.bvh = BVHTree.FromPolygons(self.co.tolist(), self.tris.tolist())
        self.J = {}
        for b in self.rig.data.bones:
            self.J[b.name] = np.array(b.head_local)
            self.J[b.name + ".tail"] = np.array(b.tail_local)
        dom = self.W.argmax(1)
        self.bone = np.array(BONE_NAMES)[dom]
        self.region = np.array([next((r for r, bones in REGIONS.items() if b in bones), "") for b in self.bone])
        self._bvh_cache = {}
        self.height = self.co[:, 2].max()
        log(f"body {sex}: {n} vertices, {len(self.tris)} surface triangles")

    def morphed(self, values):
        """Positions with shape keys {name: value}."""
        co = self.co.copy()
        for k, v in values.items():
            if v:
                co += self.keys[k] * v
        return co

    def bvh_for(self, values):
        key = tuple(sorted((k, round(v, 4)) for k, v in values.items() if v))
        if not key:
            return self.bvh, self.co
        if key not in self._bvh_cache:
            co = self.morphed(values)
            self._bvh_cache[key] = (BVHTree.FromPolygons(co.tolist(), self.tris.tolist()), co)
        return self._bvh_cache[key]

    def nearest(self, points, values=None):
        """Nearest surface point of each point: (location, face normal, triangle, signed distance)."""
        bvh, co = self.bvh_for(values or {})
        return nearest(bvh, points)

    def region_tris(self, regions):
        """The surface triangles whose corners are all in `regions` (indices into tris), cached."""
        key = tuple(sorted(regions))
        if key not in self._bvh_cache:
            m = np.isin(self.region[self.tris], list(regions)).all(1)
            idx = np.nonzero(m)[0]
            self._bvh_cache[key] = (BVHTree.FromPolygons(self.co.tolist(), self.tris[idx].tolist()), idx)
        return self._bvh_cache[key]

    def nearest_in(self, points, regions):
        """Nearest surface point among the skin of `regions` only (a strap round the ribs must not take the
        arm beside it): (location, normal, triangle into tris, signed distance)."""
        bvh, idx = self.region_tris(regions)
        loc, nrm, tri, d = nearest(bvh, points)
        return loc, nrm, idx[tri], d

    def sample(self, points, regions=None):
        """Bone weights, shape key offsets and the surface normal at the nearest body point of each point
        (among `regions`' skin, if given), and its signed distance from the skin."""
        loc, nrm, tri, d = self.nearest(points) if regions is None else self.nearest_in(points, regions)
        corners = self.tris[tri]
        w = bary(self.co[corners[:, 0]], self.co[corners[:, 1]], self.co[corners[:, 2]], loc)
        W = (self.W[corners] * w[..., None]).sum(1)
        keys = {k: (D[corners] * w[..., None]).sum(1) for k, D in self.keys.items()}
        return W, keys, nrm, d

    def bone_at(self, points):
        """The heaviest bone of the body at the nearest skin to each point."""
        _, _, tri, _ = self.nearest(points)
        return self.bone[self.tris[tri, 0]]

    def slab(self, centre, axis, half, regions=None, surface_only=True):
        """Body vertices within `half` of the plane through centre across axis (optionally only those in
        `regions`)."""
        axis = unit(axis)
        s = (self.co - centre) @ axis
        m = np.abs(s) < half
        if regions is not None:
            m &= np.isin(self.region, regions) | np.isin(self.bone, regions)
        return self.co[m]


def nearest(bvh, points):
    k = len(points)
    loc = np.zeros((k, 3))
    nrm = np.zeros((k, 3))
    tri = np.zeros(k, dtype=np.int64)
    for i, p in enumerate(points):
        hit = bvh.find_nearest(Vector(p))
        loc[i] = hit[0]
        nrm[i] = hit[1]
        tri[i] = hit[2]
    d = ((points - loc) * nrm).sum(1)
    return loc, nrm, tri, d


# ── Geometry ─────────────────────────────────────────────────────────────────────────────────────────


def ekey(a, b):
    return (a, b) if a < b else (b, a)


class Geo:
    """A piece of a garment: positions, polygon faces, and per face its material part, panel (pattern
    piece: the faces of one panel unwrap together) and "down" direction (which way the texture runs);
    per vertex any number of attributes (`attrs`, interpolated by cuts) and per edge a class."""

    def __init__(self, co, faces, part="cloth", panel="main", down=(0, 0, -1), uv=None, kind=None):
        self.co = np.asarray(co, dtype=np.float64).reshape(-1, 3)
        self.faces = [list(map(int, f)) for f in faces]
        m = len(self.faces)
        self.part = [part] * m
        self.panel = [panel] * m
        self.down = [tuple(down)] * m
        self.uv = uv if uv is not None else [None] * m  # per face: list of (u, v) per corner, in metres
        self.kind = [kind or part] * m  # how the texture paints it: cloth, linen, wool, leather, chain, plate, metal, cord
        self.attrs = {}
        self.edge = {}
        self.sharp = set()
        self.smooth = [True] * m

    def copy(self):
        g = Geo(self.co.copy(), [list(f) for f in self.faces])
        g.part, g.panel, g.down, g.uv, g.kind = list(self.part), list(self.panel), list(self.down), list(self.uv), list(self.kind)
        g.attrs = {k: v.copy() for k, v in self.attrs.items()}
        g.edge = dict(self.edge)
        g.sharp = set(self.sharp)
        g.smooth = list(self.smooth)
        return g

    @property
    def n(self):
        return len(self.co)

    def set_faces(self, mask, **values):
        for i in np.nonzero(mask)[0]:
            for k, v in values.items():
                getattr(self, k)[i] = v

    def face_centres(self):
        return np.array([self.co[f].mean(0) for f in self.faces])

    def edges(self):
        """Every edge: {(a, b): [faces]}."""
        out = {}
        for fi, f in enumerate(self.faces):
            for i in range(len(f)):
                out.setdefault(ekey(f[i], f[(i + 1) % len(f)]), []).append(fi)
        return out

    def edge_loops(self, min_len=0.06):
        """The open edge loops at least min_len long (the cut edges a garment has, without pinholes)."""
        out = []
        for lp in self.boundary_loops():
            P = self.co[lp]
            if np.linalg.norm(np.roll(P, -1, 0) - P, axis=1).sum() >= min_len:
                out.append(lp)
        return out

    def boundary_loops(self, faces_mask=None):
        """The open edges as closed vertex chains, each running the way its faces do. Walks edge by edge,
        so a vertex where two open edges meet twice (a pinch left by a cut) doesn't break a loop."""
        directed = set()
        for f in self.faces:
            for i in range(len(f)):
                directed.add((f[i], f[(i + 1) % len(f)]))
        out_edges = {}
        for a_, b_ in directed:
            if (b_, a_) not in directed:
                out_edges.setdefault(a_, []).append(b_)
        used = set()
        loops = []
        for a0 in list(out_edges):
            for b0 in out_edges[a0]:
                if (a0, b0) in used:
                    continue
                loop = [a0]
                used.add((a0, b0))
                a_ = b0
                guard = 0
                while a_ != a0 and guard < 100000:
                    guard += 1
                    loop.append(a_)
                    nxt = [w for w in out_edges.get(a_, []) if (a_, w) not in used]
                    if not nxt:
                        break
                    # (At a pinch, take the turn that keeps going: the one leading furthest from where we came.)
                    w = nxt[0] if len(nxt) == 1 else max(nxt, key=lambda w: np.linalg.norm(self.co[w] - self.co[loop[-2]]))
                    used.add((a_, w))
                    a_ = w
                if len(loop) >= 3:
                    loops.append(loop)
        return loops

    def neighbours(self):
        """Each vertex's neighbours along edges, as lists."""
        nb = [set() for _ in range(self.n)]
        for f in self.faces:
            for i in range(len(f)):
                a, b = f[i], f[(i + 1) % len(f)]
                nb[a].add(b)
                nb[b].add(a)
        return [list(s) for s in nb]

    def vertex_normals(self):
        nrm = np.zeros_like(self.co)
        for f in self.faces:
            p = self.co[f]
            c = p.mean(0)
            fn = np.zeros(3)
            for i in range(len(f)):
                fn += np.cross(p[i] - c, p[(i + 1) % len(f)] - c)
            for v in f:
                nrm[v] += fn
        return unit(nrm)

    @staticmethod
    def from_body(body, poly_mask):
        """The body's polygons in poly_mask (skin only) as a Geo, with `src` (the body vertex)."""
        polys = [p for p, m, part in zip(body.polys, poly_mask, body.poly_mat) if m and part in ("skin", "lips", "nails")]
        used = np.unique(np.concatenate([np.array(p) for p in polys]))
        remap = -np.ones(body.n, dtype=np.int64)
        remap[used] = np.arange(len(used))
        g = Geo(body.co[used], [remap[p] for p in polys])
        g.attrs["src"] = used.astype(np.float64)[:, None]
        g.attrs["body_n"] = body.normals[used]
        return g

    def join(self, other):
        off = self.n
        self.co = np.concatenate([self.co, other.co])
        self.faces += [[v + off for v in f] for f in other.faces]
        for name in ("part", "panel", "down", "uv", "kind", "smooth"):
            getattr(self, name).extend(getattr(other, name))
        for k in set(self.attrs) | set(other.attrs):
            a = self.attrs.get(k)
            b = other.attrs.get(k)
            width = (a if a is not None else b).shape[1:]
            if a is None:
                a = np.zeros((off,) + width)
            if b is None:
                b = np.zeros((other.n,) + width)
            self.attrs[k] = np.concatenate([a, b])
        for (a, b), c in other.edge.items():
            self.edge[(a + off, b + off)] = c
        self.sharp |= {(a + off, b + off) for a, b in other.sharp}
        return self

    def dedupe(self):
        """Drops faces that repeat another's corners (or a corner of their own)."""
        seen = set()
        mask = np.zeros(len(self.faces), dtype=bool)
        for i, f in enumerate(self.faces):
            key = tuple(sorted(f))
            if key in seen or len(set(f)) < 3:
                mask[i] = True
            seen.add(key)
        if mask.any():
            keep = [i for i in range(len(self.faces)) if not mask[i]]
            for name in ("faces", "part", "panel", "down", "uv", "kind", "smooth"):
                arr = getattr(self, name)
                setattr(self, name, [arr[i] for i in keep])

    def _remap_faces(self, root):
        """Renumbers the faces' corners through root, dropping repeated corners (and their UVs) and faces
        left with fewer than three."""
        faces, keep, uvs = [], [], []
        for fi, f in enumerate(self.faces):
            g = [int(root[v]) for v in f]
            idx = [i for i in range(len(g)) if g[i] != g[(i + 1) % len(g)]]
            g2 = [g[i] for i in idx]
            if len(g2) >= 3 and len(set(g2)) == len(g2):
                faces.append(g2)
                keep.append(fi)
                u = self.uv[fi]
                uvs.append([u[i] for i in idx] if u is not None else None)
        for name in ("part", "panel", "down", "kind", "smooth"):
            arr = getattr(self, name)
            setattr(self, name, [arr[i] for i in keep])
        self.uv = uvs
        self.faces = faces

    def delete_faces(self, mask):
        keep = [i for i in range(len(self.faces)) if not mask[i]]
        for name in ("faces", "part", "panel", "down", "uv", "kind", "smooth"):
            arr = getattr(self, name)
            setattr(self, name, [arr[i] for i in keep])
        self.compact()

    def compact(self):
        used = sorted({v for f in self.faces for v in f})
        remap = -np.ones(self.n, dtype=np.int64)
        remap[used] = np.arange(len(used))
        self.co = self.co[used]
        self.attrs = {k: v[used] for k, v in self.attrs.items()}
        self.faces = [[int(remap[v]) for v in f] for f in self.faces]
        self.edge = {ekey(int(remap[a]), int(remap[b])): c for (a, b), c in self.edge.items() if remap[a] >= 0 and remap[b] >= 0}
        self.sharp = {ekey(int(remap[a]), int(remap[b])) for a, b in self.sharp if remap[a] >= 0 and remap[b] >= 0}

    def split(self, f, face_mask=None, edge_class=None):
        """Cuts every face crossing the zero level of the per-vertex field f (a cut is a new chain of edges,
        given `edge_class`). Returns the per-face side (True where f > 0)."""
        f = np.asarray(f, dtype=np.float64).copy()
        f[np.abs(f) < 1e-9] = 1e-9
        new_co, new_attr = [], {k: [] for k in self.attrs}
        made = {}

        def cut(a, b):
            key = ekey(a, b)
            if key not in made:
                t = f[a] / (f[a] - f[b])
                made[key] = self.n + len(new_co)
                new_co.append(self.co[a] + (self.co[b] - self.co[a]) * t)
                for k, v in self.attrs.items():
                    new_attr[k].append(v[a] + (v[b] - v[a]) * t)
                if key in self.edge:
                    pass
            return made[key]

        faces, part, panel, down, uv, kind, smooth, side = [], [], [], [], [], [], [], []
        cut_edges = []
        for fi, face in enumerate(self.faces):
            vals = f[face]
            if (face_mask is not None and not face_mask[fi]) or (vals > 0).all() or (vals < 0).all():
                faces.append(face)
                for name, out in (("part", part), ("panel", panel), ("down", down), ("uv", uv), ("kind", kind), ("smooth", smooth)):
                    out.append(getattr(self, name)[fi])
                side.append(bool((vals > 0).all()))
                continue
            neg, pos, nuv, puv = [], [], [], []
            fuv = self.uv[fi]
            ends = []
            for i in range(len(face)):
                a, b = face[i], face[(i + 1) % len(face)]
                (pos if f[a] > 0 else neg).append(a)
                if fuv is not None:
                    (puv if f[a] > 0 else nuv).append(fuv[i])
                if (f[a] > 0) != (f[b] > 0):
                    c = cut(a, b)
                    neg.append(c)
                    pos.append(c)
                    ends.append(c)
                    if fuv is not None:
                        t = f[a] / (f[a] - f[b])
                        cu = tuple(np.array(fuv[i]) + (np.array(fuv[(i + 1) % len(face)]) - np.array(fuv[i])) * t)
                        nuv.append(cu)
                        puv.append(cu)
            if len(ends) == 2 and ends[0] != ends[1]:
                cut_edges.append(ekey(*ends))
            for poly, puvs, s in ((neg, nuv, False), (pos, puv, True)):
                # (Snapped cuts can repeat a corner: drop the repeats.)
                keep_i = [i for i in range(len(poly)) if poly[i] != poly[(i + 1) % len(poly)]]
                if fuv is not None and len(puvs) == len(poly):
                    puvs = [puvs[i] for i in keep_i]
                poly = [poly[i] for i in keep_i]
                if len(poly) >= 3 and len(set(poly)) == len(poly):
                    faces.append(poly)
                    part.append(self.part[fi])
                    panel.append(self.panel[fi])
                    down.append(self.down[fi])
                    uv.append(puvs if fuv is not None else None)
                    kind.append(self.kind[fi])
                    smooth.append(self.smooth[fi])
                    side.append(s)
        if new_co:
            self.co = np.concatenate([self.co, np.array(new_co)])
            for k in self.attrs:
                self.attrs[k] = np.concatenate([self.attrs[k], np.array(new_attr[k])])
        # (An edge that was cut keeps its class on both halves.)
        for (a, b), c in list(self.edge.items()):
            m = made.get((a, b))
            if m is not None and m not in (a, b):
                del self.edge[(a, b)]
                self.edge[ekey(a, m)] = c
                self.edge[ekey(m, b)] = c
        self.faces, self.part, self.panel, self.down, self.uv, self.kind, self.smooth = faces, part, panel, down, uv, kind, smooth
        if edge_class:
            for e in cut_edges:
                self.edge[e] = edge_class
        return np.array(side)

    def clip(self, f, face_mask=None, edge_class="hem"):
        """Cuts along the zero level of f and drops what lies where f > 0."""
        side = self.split(f, face_mask, edge_class)
        self.delete_faces(side)
        self.weld_slits()
        self.collapse_short()
        self.fix_winding()

    def fix_winding(self):
        """Turns faces so neighbours agree (each shared edge run opposite ways by its two faces), keeping
        the orientation most faces already had. A face turned the wrong way makes its edges look open."""
        m = len(self.faces)
        edge_faces = {}
        for fi, f in enumerate(self.faces):
            for i in range(len(f)):
                edge_faces.setdefault(ekey(f[i], f[(i + 1) % len(f)]), []).append(fi)
        flipped = np.zeros(m, dtype=bool)
        seen = np.zeros(m, dtype=bool)
        comps = []
        for s0 in range(m):
            if seen[s0]:
                continue
            seen[s0] = True
            comp = [s0]
            stack = [s0]
            while stack:
                fi = stack.pop()
                f = self.faces[fi][::-1] if flipped[fi] else self.faces[fi]
                for i in range(len(f)):
                    a, b = f[i], f[(i + 1) % len(f)]
                    for gj in edge_faces[ekey(a, b)]:
                        if gj == fi or seen[gj] or len(edge_faces[ekey(a, b)]) != 2:
                            continue
                        g = self.faces[gj]
                        same = any(g[k] == a and g[(k + 1) % len(g)] == b for k in range(len(g)))
                        flipped[gj] = same
                        seen[gj] = True
                        comp.append(gj)
                        stack.append(gj)
            comps.append(comp)
        for comp in comps:
            if flipped[comp].sum() * 2 > len(comp):
                flipped[comp] = ~flipped[comp]
        for fi in np.nonzero(flipped)[0]:
            self.faces[fi] = self.faces[fi][::-1]
            if self.uv[fi] is not None:
                self.uv[fi] = list(reversed(self.uv[fi]))
        return int(flipped.sum())

    def collapse_short(self, tol=0.0015):
        """Merges the ends of every edge shorter than tol (the slivers a cut leaves beside a vertex), so they
        don't unwrap into long spikes or shade as creases."""
        parent = np.arange(self.n)

        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        merged = False
        for a, b in self.edges():
            if np.linalg.norm(self.co[a] - self.co[b]) < tol:
                ra, rb = find(a), find(b)
                if ra != rb:
                    parent[max(ra, rb)] = min(ra, rb)
                    merged = True
        if not merged:
            return
        root = np.array([find(x) for x in range(self.n)])
        self._remap_faces(root)
        self.edge = {ekey(int(root[a]), int(root[b])): c for (a, b), c in self.edge.items() if root[a] != root[b]}
        self.sharp = {ekey(int(root[a]), int(root[b])) for a, b in self.sharp if root[a] != root[b]}
        self.compact()

    def fill_holes(self, max_len=0.05):
        """Closes every open loop shorter than max_len (pinholes left by decimation or a cut), each with one
        face turned to match its neighbours."""
        for lp in self.boundary_loops():
            P = self.co[lp]
            if np.linalg.norm(np.roll(P, -1, 0) - P, axis=1).sum() >= max_len:
                continue
            src = next((fi for fi, f in enumerate(self.faces) if lp[0] in f), 0)
            self.faces.append(list(reversed(lp)))
            for name in ("part", "panel", "down", "kind", "smooth"):
                getattr(self, name).append(getattr(self, name)[src])
            self.uv.append(None)

    def weld_slits(self, tol=0.0015):
        """Joins open-edge vertices lying on top of each other (a cut passing all but through a vertex
        leaves two such points and a slit between them)."""
        loops = self.boundary_loops()
        bv = np.unique(np.concatenate([np.array(lp) for lp in loops])) if loops else np.zeros(0, int)
        if len(bv) < 2:
            return
        P = self.co[bv]
        d = np.linalg.norm(P[:, None] - P[None], axis=2)
        np.fill_diagonal(d, 1)
        pairs = np.argwhere(np.triu(d < tol))
        if not len(pairs):
            return
        parent = np.arange(self.n)

        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        for i, j in pairs:
            a, b = find(bv[i]), find(bv[j])
            if a != b:
                parent[max(a, b)] = min(a, b)
        root = np.array([find(x) for x in range(self.n)])
        self._remap_faces(root)
        self.edge = {ekey(int(root[a]), int(root[b])): c for (a, b), c in self.edge.items() if root[a] != root[b]}
        self.sharp = {ekey(int(root[a]), int(root[b])) for a, b in self.sharp if root[a] != root[b]}
        self.compact()

    def rim(self, depth=0.004, back=0.012, part=None, kind=None, loops=None, inward=None):
        """A turned-in edge on every open edge: a strip `depth` deep towards the body (the cloth's thickness
        seen at the hem) and one `back` long running back under the cloth, so the inside shows a little
        cloth instead of nothing. The open edges become `hem` edges (stitched)."""
        loops = loops if loops is not None else self.edge_loops()
        nrm = self.vertex_normals()
        cent = self.face_centres()
        vface = {}
        for fi, f in enumerate(self.faces):
            for v in f:
                vface.setdefault(v, []).append(fi)
        made = []
        for loop in loops:
            k = len(loop)
            if k < 3:
                continue
            closed = True
            pts = self.co[loop]
            inner = []
            for i, v in enumerate(loop):
                c = np.mean([cent[fi] for fi in vface[v]], axis=0)
                d = c - self.co[v]
                d -= nrm[v] * (d @ nrm[v])
                inner.append(unit(d))
            inner = np.array(inner)
            n_ = nrm[loop]
            a1 = pts - n_ * depth
            a2 = a1 + inner * back + n_ * (depth * 0.5)
            base = self.n
            rings = [a1, a2] if back > 0 else [a1]
            self.co = np.concatenate([self.co, *rings])
            for name, arr in self.attrs.items():
                self.attrs[name] = np.concatenate([arr] + [arr[loop]] * len(rings))
            fi0 = len(self.faces)
            for i in range(k if closed else k - 1):
                j = (i + 1) % k
                a, b = loop[i], loop[j]
                # The loop runs as its faces do, so (b, a, ...) faces outwards and down.
                self.faces.append([b, a, base + i, base + j])
                if back > 0:
                    self.faces.append([base + j, base + i, base + k + i, base + k + j])
                self.edge[ekey(a, b)] = "hem"
            src_face = vface[loop[0]][0]
            for _ in range(len(self.faces) - fi0):
                self.part.append(part or self.part[src_face])
                self.panel.append("rim")
                self.down.append(self.down[src_face])
                self.uv.append(None)
                self.kind.append(kind or self.kind[src_face])
                self.smooth.append(True)
            made.append(loop)
        return made

    def smooth_edges(self, rounds=4, keep=None):
        """Smooths every open edge loop along itself (and the ring next to it a little), so a cut edge
        runs clean instead of following the mesh's zigzag. Each loop keeps its size."""
        nb = self.neighbours()
        for loop in self.edge_loops():
            if len(loop) < 4:
                continue
            P = self.co[loop]
            c = P.mean(0)
            size = np.linalg.norm(P - c, axis=1).mean()
            for _ in range(rounds):
                P = 0.5 * P + 0.25 * (np.roll(P, 1, 0) + np.roll(P, -1, 0))
            c2 = P.mean(0)
            P = c2 + (P - c2) * (size / max(np.linalg.norm(P - c2, axis=1).mean(), 1e-9))
            moved = P - self.co[loop]
            self.co[loop] = P
            on = set(loop)
            for v, m in zip(loop, moved):
                for w in nb[v]:
                    if w not in on:
                        self.co[w] += m * 0.35

    def displace(self, amount, normals=None):
        """Moves each vertex along its normal by amount (n,)."""
        nrm = normals if normals is not None else self.vertex_normals()
        self.co = self.co + nrm * np.asarray(amount)[:, None]

    def smooth_values(self, values, rounds=1, factor=0.5, mask=None, nb=None):
        nb = nb or self.neighbours()
        v = np.asarray(values, dtype=np.float64).copy()
        idx = np.concatenate([np.array(n, dtype=np.int64) for n in nb]) if nb else np.zeros(0, int)
        counts = np.array([len(n) for n in nb])
        owner = np.repeat(np.arange(len(nb)), counts)
        for _ in range(rounds):
            acc = np.zeros_like(v)
            np.add.at(acc, owner, v[idx])
            avg = acc / np.maximum(counts, 1).reshape((-1,) + (1,) * (v.ndim - 1))
            step = (avg - v) * factor
            step[counts == 0] = 0
            if mask is not None:
                step = step * np.asarray(mask).reshape((-1,) + (1,) * (v.ndim - 1))
            v = v + step
        return v

    def subdivide(self, mask=None):
        """One Catmull-Clark step (quads and n-gons) over the faces in mask (all by default). Faces outside
        the mask that touch it get the new edge points (as extra corners), so nothing opens."""
        m = len(self.faces)
        mask = np.ones(m, dtype=bool) if mask is None else np.asarray(mask, dtype=bool)
        E = self.edges()
        boundary = {e for e, fs in E.items() if len(fs) == 1}
        sel_edges = {e for e, fs in E.items() if any(mask[f] for f in fs)}
        n0 = self.n
        attrs = {"co": self.co, **self.attrs}
        fp = {}
        new = {k: [] for k in attrs}
        for fi in np.nonzero(mask)[0]:
            fp[fi] = n0 + len(new["co"])
            for k, a in attrs.items():
                new[k].append(a[self.faces[fi]].mean(0))
        ep = {}
        for e in sel_edges:
            a, b = e
            ep[e] = n0 + len(new["co"])
            fs = E[e]
            for k, arr in attrs.items():
                mid = (arr[a] + arr[b]) / 2
                if e not in boundary and len(fs) == 2 and all(mask[f] for f in fs) and k == "co":
                    fa = np.mean([arr[self.faces[f]].mean(0) for f in fs], axis=0)
                    mid = (arr[a] + arr[b] + 2 * fa) / 4
                new[k].append(mid)
        # Move the old vertices of the selected region (Catmull-Clark rule; boundary verts stay on their curve).
        co = self.co.copy()
        vfaces, vedges = {}, {}
        for fi, f in enumerate(self.faces):
            for v in f:
                vfaces.setdefault(v, []).append(fi)
        for e in E:
            for v in e:
                vedges.setdefault(v, []).append(e)
        for v in range(n0):
            fs = vfaces.get(v, [])
            if not fs or not all(mask[f] for f in fs):
                continue
            es = vedges[v]
            bes = [e for e in es if e in boundary]
            if bes:
                if len(bes) == 2:
                    o = [e[0] if e[1] == v else e[1] for e in bes]
                    co[v] = 0.75 * self.co[v] + 0.125 * (self.co[o[0]] + self.co[o[1]])
                continue
            k = len(es)
            F = np.mean([self.co[self.faces[f]].mean(0) for f in fs], axis=0)
            R = np.mean([(self.co[a] + self.co[b]) / 2 for a, b in es], axis=0)
            co[v] = (F + 2 * R + (k - 3) * self.co[v]) / k
        self.co = np.concatenate([co, np.array(new["co"])])
        for k in self.attrs:
            self.attrs[k] = np.concatenate([self.attrs[k], np.array(new[k])])
        faces, part, panel, down, uv, kind, smooth = [], [], [], [], [], [], []
        for fi, f in enumerate(self.faces):
            k = len(f)
            fuv = self.uv[fi]
            if mask[fi]:
                for i in range(k):
                    a, b, c = f[(i - 1) % k], f[i], f[(i + 1) % k]
                    faces.append([b, ep[ekey(b, c)], fp[fi], ep[ekey(a, b)]])
                    if fuv is not None:
                        U = np.array(fuv)
                        uv.append([tuple(U[i]), tuple((U[i] + U[(i + 1) % k]) / 2), tuple(U.mean(0)), tuple((U[i] + U[(i - 1) % k]) / 2)])
                    else:
                        uv.append(None)
                    for name, out in (("part", part), ("panel", panel), ("down", down), ("kind", kind), ("smooth", smooth)):
                        out.append(getattr(self, name)[fi])
            else:
                poly, puv = [], []
                for i in range(k):
                    a, b = f[i], f[(i + 1) % k]
                    poly.append(a)
                    if fuv is not None:
                        puv.append(fuv[i])
                    e = ekey(a, b)
                    if e in ep:
                        poly.append(ep[e])
                        if fuv is not None:
                            puv.append(tuple((np.array(fuv[i]) + np.array(fuv[(i + 1) % k])) / 2))
                faces.append(poly)
                uv.append(puv if fuv is not None else None)
                for name, out in (("part", part), ("panel", panel), ("down", down), ("kind", kind), ("smooth", smooth)):
                    out.append(getattr(self, name)[fi])
        edge = {}
        for (a, b), c in self.edge.items():
            e = ekey(a, b)
            if e in ep:
                edge[ekey(a, ep[e])] = c
                edge[ekey(ep[e], b)] = c
            else:
                edge[e] = c
        sharp = set()
        for a, b in self.sharp:
            e = ekey(a, b)
            if e in ep:
                sharp |= {ekey(a, ep[e]), ekey(ep[e], b)}
            else:
                sharp.add(e)
        self.faces, self.part, self.panel, self.down, self.uv, self.kind, self.smooth = faces, part, panel, down, uv, kind, smooth
        self.edge, self.sharp = edge, sharp


def seam_path(geo, face_mask, start, end, cost, edge_class="seam"):
    """Marks a seam along the mesh's own edges, from any vertex in `start` to any in `end` (boolean
    arrays), through the faces in face_mask, the cheapest way by `cost(points)` per metre (low where the
    seam should run). Returns the path's vertices."""
    import heapq

    adj = {}
    for fi in np.nonzero(face_mask)[0]:
        f = geo.faces[fi]
        for i in range(len(f)):
            a, b = f[i], f[(i + 1) % len(f)]
            adj.setdefault(a, set()).add(b)
            adj.setdefault(b, set()).add(a)
    dist = {}
    prev = {}
    heap = []
    for v in adj:
        if start[v]:
            dist[v] = 0.0
            heap.append((0.0, v))
    heapq.heapify(heap)
    goal = None
    while heap:
        d, v = heapq.heappop(heap)
        if d > dist.get(v, np.inf):
            continue
        if end[v]:
            goal = v
            break
        for w in adj[v]:
            mid = (geo.co[v] + geo.co[w]) / 2
            nd = d + float(np.linalg.norm(geo.co[w] - geo.co[v])) * float(cost(mid[None])[0])
            if nd < dist.get(w, np.inf):
                dist[w] = nd
                prev[w] = v
                heapq.heappush(heap, (nd, w))
    if goal is None:
        return []
    path = [goal]
    while path[-1] in prev:
        path.append(prev[path[-1]])
    for a, b in zip(path[:-1], path[1:]):
        geo.edge[ekey(a, b)] = edge_class
    return path


def decimate(geo, ratio, symmetric=True):
    """Fewer vertices (Blender's collapse decimation, mirrored left to right); attrs are dropped."""
    mesh = bpy.data.meshes.new("decimate")
    mesh.from_pydata(geo.co.tolist(), [], geo.faces)
    obj = bpy.data.objects.new("decimate", mesh)
    bpy.context.scene.collection.objects.link(obj)
    mod = obj.modifiers.new("d", "DECIMATE")
    mod.decimate_type = "COLLAPSE"
    mod.ratio = ratio
    mod.use_symmetry = symmetric
    mod.symmetry_axis = "X"
    dg = bpy.context.evaluated_depsgraph_get()
    ev = obj.evaluated_get(dg)
    me = ev.to_mesh()
    co = np.array([v.co for v in me.vertices])
    faces = [list(p.vertices) for p in me.polygons]
    ev.to_mesh_clear()
    bpy.data.objects.remove(obj)
    bpy.data.meshes.remove(mesh)
    g = Geo(co, faces, part=geo.part[0], panel=geo.panel[0], kind=geo.kind[0])
    flips = g.fix_winding()
    if flips:
        log(f"  decimate: {flips} faces turned to agree with their neighbours")
    g.fill_holes()
    return g


def drape(geo, body, centre_y, z_top, z_bottom, offset, slope=0.35, weight=None, bins=48, regions=("torso", "hips", "thighs")):
    """Lets cloth below z_top hang: in each horizontal slice it is pushed out to the convex outline of the
    body there (plus offset), and going down it may come in no faster than `slope` metres a metre, so it
    falls from the chest and seat instead of following every hollow. `weight` (n,) scales the effect."""
    co = body.co
    surf = np.zeros(body.n, dtype=bool)
    surf[np.unique(body.tris)] = True
    m = surf & np.isin(body.region, list(regions)) & (co[:, 2] < z_top + 0.05)
    zs = np.linspace(z_top, z_bottom, 40)
    angles = np.linspace(-math.pi, math.pi, bins, endpoint=False)
    R = np.zeros((len(zs), bins))
    for i, z in enumerate(zs):
        c = np.array([0.0, float(centre_y(z))])
        sl = co[m & (np.abs(co[:, 2] - z) < 0.012)]
        if len(sl) < 3:
            R[i] = R[i - 1] if i else 0.05
            continue
        h = hull2(sl[:, :2] - c)
        # (Angle 0 to the front, -Y; positive towards +X.)
        R[i] = ray_hull(h, -math.pi / 2 + angles) if False else ray_hull(h, np.arctan2(-np.cos(angles), np.sin(angles)))
    R += offset
    for i in range(1, len(zs)):
        R[i] = np.maximum(R[i], R[i - 1] - slope * (zs[i - 1] - zs[i]))
    p = geo.co
    cy = centre_y(p[:, 2])
    d = np.stack([p[:, 0], p[:, 1] - cy], axis=1)
    r = np.linalg.norm(d, axis=1)
    ang = np.arctan2(d[:, 0], -d[:, 1])
    zi = np.clip((z_top - p[:, 2]) / (z_top - z_bottom) * (len(zs) - 1), 0, len(zs) - 1)
    ai = (ang + math.pi) / (2 * math.pi) * bins
    z0 = np.floor(zi).astype(int)
    z1 = np.minimum(z0 + 1, len(zs) - 1)
    a0 = np.floor(ai).astype(int) % bins
    a1 = (a0 + 1) % bins
    tz = zi - z0
    ta = ai - np.floor(ai)
    target = (R[z0, a0] * (1 - ta) + R[z0, a1] * ta) * (1 - tz) + (R[z1, a0] * (1 - ta) + R[z1, a1] * ta) * tz
    below = p[:, 2] < z_top
    w = np.ones(len(p)) if weight is None else np.asarray(weight)
    push = np.where(below & (target > r), target - r, 0) * w
    geo.co = p + np.stack([d[:, 0], d[:, 1], np.zeros(len(p))], axis=1) / np.maximum(r, 1e-9)[:, None] * push[:, None]
    return geo


def hull_envelope(geo, points, origin, axis, length, offset, weight=None, bins=40, slab=0.008):
    """Pushes geo out to the convex outline of `points` in slices across `axis` (from origin, `length`
    long), plus offset: the toes become one toe box, a hand one mitten. `weight` (n,) scales it."""
    axis = unit(axis)
    a = unit(np.cross(axis, [0, 0, 1] if abs(axis[2]) < 0.9 else [1, 0, 0]))
    b = np.cross(axis, a)
    sp = (points - origin) @ axis
    hulls = []
    for i in range(bins):
        s = (i + 0.5) / bins * length
        sel = points[np.abs(sp - s) < max(slab, length / bins)]
        if len(sel) < 3:
            hulls.append(None)
            continue
        q = np.stack([(sel - origin) @ a, (sel - origin) @ b], axis=1)
        h = hull2(q)
        hulls.append((h, h.mean(0)))
    w = np.ones(geo.n) if weight is None else np.asarray(weight)
    co = geo.co.copy()
    for v in range(geo.n):
        if w[v] <= 0:
            continue
        s = (co[v] - origin) @ axis
        i = int(s / length * bins)
        if i < 0 or i >= bins or hulls[i] is None:
            continue
        h, c = hulls[i]
        q = np.array([(co[v] - origin) @ a, (co[v] - origin) @ b]) - c
        rq = np.linalg.norm(q)
        if rq < 1e-6:
            continue
        ang = math.atan2(q[1], q[0])
        R = ray_hull(h - c, [ang])[0] + offset
        if R > rq:
            d = (q / rq) * (R - rq) * w[v]
            co[v] += a * d[0] + b * d[1]
    geo.co = co
    return geo


def wrap(geo, body, offset, rounds=30, factor=0.5, pin=None, slack=None):
    """Relaxes geo over the body: each round smooths it (so cloth bridges hollows and lies smooth) and
    pushes every vertex that sank closer than its `offset` (n,) back out along the skin's normal. Open
    edges only move along the normal; `pin` (n,) in 0..1 holds vertices where they are."""
    offset = np.broadcast_to(np.asarray(offset, dtype=np.float64), (geo.n,)).copy()
    nb = geo.neighbours()
    loops = geo.boundary_loops()
    on_edge = np.zeros(geo.n, dtype=bool)
    for lp in loops:
        on_edge[lp] = True
    mask = (~on_edge).astype(np.float64)
    if pin is not None:
        mask *= 1 - np.asarray(pin)
    loc, nrm, _, d = body.nearest(geo.co)
    geo.co = np.where((d < offset)[:, None], loc + nrm * offset[:, None], geo.co)
    for r in range(rounds):
        geo.co = geo.smooth_values(geo.co, 1, factor, mask, nb)
        loc, nrm, _, d = body.nearest(geo.co)
        low = d < offset
        geo.co[low] = loc[low] + nrm[low] * offset[low, None]
        if slack is not None:
            high = d > offset + slack
            geo.co[high] = loc[high] + nrm[high] * (offset[high] + slack)[:, None]
    return geo


def keep_outside(geo, under, gap=0.004, reach=0.06, rounds=3):
    """Moves every vertex of geo lying within `reach` of the surface `under` (a Geo) but less than `gap`
    outside it (by under's own normals) out to `gap`, smoothing the moves, so one layer never shows
    through the one it is worn over."""
    bvh, _ = geo_bvh(under)
    nb = geo.neighbours()
    for _ in range(rounds):
        loc, nrm, _, d = nearest(bvh, geo.co)
        dist = np.linalg.norm(geo.co - loc, axis=1)
        push = np.where((dist < reach) & (d < gap), gap - d, 0.0)
        if push.max() < 1e-4:
            break
        move = geo.smooth_values(nrm * push[:, None], 2, 0.5, None, nb)
        move = np.where((push > 0)[:, None], nrm * push[:, None], move)
        geo.co = geo.co + move
    return geo


def temp_object(geo, name="collider"):
    """A Blender object of a Geo's surface (a collider for a later drape); remove it with drop_object."""
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(geo.co.tolist(), [], geo.faces)
    mesh.validate()
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    return obj


def drop_object(obj):
    mesh = obj.data
    bpy.data.objects.remove(obj)
    bpy.data.meshes.remove(mesh)


def cloth_sim(geo, body, pin, frames=70, bending=0.6, mass=0.3, tension=40, shear=10, air=2.0, quality=6, distance=0.005, self_collision=True, pin_stiffness=1.0, shrink=0.0, colliders=(), noise=0.0, seed=0, keep=None, relax=2):
    """Drapes geo with Blender's cloth simulation over the body at rest (its A-pose): `pin` (n,) in 0..1
    holds vertices in place (a waistband, the shoulders), the rest falls under gravity for `frames`
    frames, colliding with the body (and `colliders`, Blender objects), and the settled frame becomes
    geo's positions, so the folds are in the geometry. `noise` (metres) jitters the start a little so the
    folds don't come out too regular; `keep` (n,) in 0..1 blends back towards the start where the drape
    should only settle. The faces and every attribute stay as they were."""
    start = geo.co.copy()
    co0 = start.copy()
    if noise:
        rng = np.random.default_rng(seed)
        jitter = geo.smooth_values(rng.normal(0, noise, (geo.n, 3)), 3, 0.5)
        co0 = co0 + jitter * (1 - np.asarray(pin))[:, None]
    mesh = bpy.data.meshes.new("drape")
    mesh.from_pydata(co0.tolist(), [], geo.faces)
    mesh.validate(clean_customdata=False)
    mesh.update()
    obj = bpy.data.objects.new("drape", mesh)
    bpy.context.scene.collection.objects.link(obj)
    vg = obj.vertex_groups.new(name="pin")
    pin = np.clip(np.asarray(pin, dtype=np.float64), 0, 1)
    for i in np.nonzero(pin > 0)[0]:
        vg.add([int(i)], float(pin[i]), "REPLACE")
    mod = obj.modifiers.new("cloth", "CLOTH")
    st = mod.settings
    st.quality = quality
    st.mass = mass
    st.tension_stiffness = tension
    st.compression_stiffness = tension
    st.shear_stiffness = shear
    st.bending_stiffness = bending
    st.air_damping = air
    st.vertex_group_mass = "pin"
    st.pin_stiffness = pin_stiffness
    st.shrink_min = shrink
    cs = mod.collision_settings
    cs.distance_min = distance
    cs.collision_quality = 3
    cs.use_self_collision = self_collision
    cs.self_distance_min = 0.0025
    mod.point_cache.frame_start = 1
    mod.point_cache.frame_end = frames
    # (The imported rig's own clips must not move the body while the frames run.)
    if body.rig.animation_data:
        body.rig.animation_data_clear()
    # (The floor, so a long hem settles on it rather than through it.)
    floor_me = bpy.data.meshes.new("floor")
    floor_me.from_pydata([(-3, -3, 0), (3, -3, 0), (3, 3, 0), (-3, 3, 0)], [], [(0, 1, 2, 3)])
    floor = bpy.data.objects.new("floor", floor_me)
    bpy.context.scene.collection.objects.link(floor)
    added = [floor]
    for o in [body.obj, floor, *colliders]:
        if not any(m.type == "COLLISION" for m in o.modifiers):
            o.modifiers.new("collision", "COLLISION")
            added.append(o)
        o.collision.thickness_outer = 0.003
        o.collision.cloth_friction = 6.0
    scene = bpy.context.scene
    scene.frame_start, scene.frame_end = 1, frames
    for f in range(1, frames + 1):
        scene.frame_set(f)
    ev = obj.evaluated_get(bpy.context.evaluated_depsgraph_get())
    co = np.array([v.co for v in ev.data.vertices], dtype=np.float64)
    scene.frame_set(1)
    bpy.data.objects.remove(obj)
    bpy.data.meshes.remove(mesh)
    for o in added:
        for m in [m for m in o.modifiers if m.type == "COLLISION"]:
            o.modifiers.remove(m)
    bpy.data.objects.remove(floor)
    bpy.data.meshes.remove(floor_me)
    if len(co) != geo.n:
        raise RuntimeError(f"cloth_sim: {len(co)} vertices back for {geo.n}")
    if keep is not None:
        k = np.clip(np.asarray(keep, dtype=np.float64), 0, 1)[:, None]
        co = co * (1 - k) + start * k
    if relax:
        # (Taubin smoothing, a step in and a step back out, irons out the simulation's jitter without
        # shrinking the folds.)
        nb = geo.neighbours()
        free = 1 - pin
        for _ in range(relax):
            co = geo.smooth_values(co, 1, 0.5, free, nb)
            co = geo.smooth_values(co, 1, -0.53, free, nb)
    log(f"  draped {geo.n} vertices over {frames} frames: moved up to {np.linalg.norm(co - start, axis=1).max() * 100:.0f} cm")
    geo.co = co
    return geo


# ── Lofting ──────────────────────────────────────────────────────────────────────────────────────────


def hull2(points):
    """2D convex hull (counter-clockwise) of points (k, 2)."""
    pts = sorted(set(map(tuple, np.round(points, 6))))
    if len(pts) < 3:
        return np.array(pts)

    def cross(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

    lower, upper = [], []
    for p in pts:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0:
            lower.pop()
        lower.append(p)
    for p in reversed(pts):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], p) <= 0:
            upper.pop()
        upper.append(p)
    return np.array(lower[:-1] + upper[:-1])


def ray_hull(hull, angles):
    """Distance from the origin to a convex polygon along each angle (the origin inside it)."""
    out = np.zeros(len(angles))
    k = len(hull)
    for j, a in enumerate(angles):
        d = np.array([math.cos(a), math.sin(a)])
        best = 0.0
        for i in range(k):
            p, q = hull[i], hull[(i + 1) % k]
            e = q - p
            den = d[0] * (-e[1]) + d[1] * e[0]
            if abs(den) < 1e-12:
                continue
            # Solve t*d = p + s*e.
            m = np.array([[d[0], -e[0]], [d[1], -e[1]]])
            try:
                t, s = np.linalg.solve(m, p)
            except np.linalg.LinAlgError:
                continue
            if t > 0 and -1e-9 <= s <= 1 + 1e-9:
                best = max(best, t)
        out[j] = best
    return out


def frames(path, up_hint):
    """A frame (tangent, e1, e2) at each point of a polyline, rotation-minimising, starting with e1 as
    near up_hint as it can be."""
    path = np.asarray(path, dtype=np.float64)
    k = len(path)
    T = np.zeros_like(path)
    T[1:-1] = path[2:] - path[:-2]
    T[0] = path[1] - path[0]
    T[-1] = path[-1] - path[-2]
    T = unit(T)
    e1 = np.zeros_like(path)
    h = np.asarray(up_hint, dtype=np.float64)
    e1[0] = unit(h - T[0] * (h @ T[0]))
    for i in range(1, k):
        v = e1[i - 1] - T[i] * (e1[i - 1] @ T[i])
        e1[i] = unit(v)
    e2 = np.cross(T, e1)
    return T, e1, e2


def loft(path, around, radius, up_hint=(0, -1, 0), seam_angle=math.pi, closed_start=False, closed_end=False, part="cloth", panel="main", kind=None, down=None):
    """A tube of rings along a polyline: ring i lies across the path at path[i], `around` vertices, the
    vertex at angle a (from e1 towards e2) at radius radius(i, a) (a callable giving an array over the
    angles). The seam (where u wraps) is at seam_angle. UVs run round the tube (u, metres) and along it
    (v, metres, decreasing down the path, so the texture's down is the path's direction)."""
    path = np.asarray(path, dtype=np.float64)
    T, e1, e2 = frames(path, up_hint)
    angles = seam_angle + np.arange(around + 1) * (2 * math.pi / around)
    rings = []
    for i in range(len(path)):
        r = np.asarray(radius(i, angles[:-1], path[i], T[i], e1[i], e2[i]), dtype=np.float64)
        pts = path[i] + np.outer(r * np.cos(angles[:-1]), e1[i]) + np.outer(r * np.sin(angles[:-1]), e2[i])
        rings.append(pts)
    rings = np.array(rings)
    k = len(path)
    co = rings.reshape(-1, 3)
    faces, uv = [], []
    # (u: the arc length round each ring; v: down the path.)
    seg = np.linalg.norm(np.roll(rings, -1, axis=1) - rings, axis=2)  # (k, around)
    circ = np.concatenate([np.zeros((k, 1)), np.cumsum(seg, axis=1)], axis=1)
    along = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(path, axis=0), axis=1))])
    for i in range(k - 1):
        for j in range(around):
            a, b = i * around + j, i * around + (j + 1) % around
            c, d = (i + 1) * around + (j + 1) % around, (i + 1) * around + j
            # Faces outward: (around runs e1 -> e2, the path runs along T).
            faces.append([a, b, c, d])
            uv.append([(circ[i, j], -along[i]), (circ[i, j + 1], -along[i]), (circ[i + 1, j + 1], -along[i + 1]), (circ[i + 1, j], -along[i + 1])])
    g = Geo(co, faces, part=part, panel=panel, kind=kind)
    g.uv = uv
    g.down = [tuple(down) if down is not None else tuple(T[min(i // around, k - 1)]) for i in range(len(faces))]
    g.attrs["ring"] = np.repeat(np.arange(k), around).astype(np.float64)[:, None]
    g.attrs["angle"] = np.tile(angles[:-1], k)[:, None]
    for i, closed in ((0, closed_start), (k - 1, closed_end)):
        if closed:
            c = len(g.co)
            g.co = np.concatenate([g.co, [rings[i].mean(0)]])
            for name in g.attrs:
                g.attrs[name] = np.concatenate([g.attrs[name], g.attrs[name][i * around : i * around + 1]])
            for j in range(around):
                a, b = i * around + j, i * around + (j + 1) % around
                g.faces.append([b, a, c] if i == 0 else [a, b, c])
                g.uv.append(None)
                g.part.append(part)
                g.panel.append(panel + "-cap")
                g.down.append(g.down[0])
                g.kind.append(kind or part)
                g.smooth.append(True)
    return g


def hull_radius(points_fn, offset, smooth=0):
    """A loft radius from the body's outline: the convex hull of the body points near each ring
    (points_fn(i, centre, T) gives them), plus offset (a number or a callable of angle)."""

    def radius(i, angles, c, T, e1, e2):
        pts = points_fn(i, c, T)
        if len(pts) < 3:
            return np.full(len(angles), 0.01)
        q = np.stack([(pts - c) @ e1, (pts - c) @ e2], axis=1)
        h = hull2(q)
        r = ray_hull(h, angles)
        off = offset(i, angles) if callable(offset) else offset
        return r + off

    return radius


def strip(points, normals, width, thickness, part="leather", kind=None, closed=True, panel="strap", bevel=0.25, offset=0.0):
    """A band of rectangular section along a chain of surface points: width across (in the surface),
    thickness out along the normals. Its long edges are `hem` edges (stitched, for leather)."""
    P = np.asarray(points, dtype=np.float64)
    N = unit(normals)
    k = len(P)
    T = np.zeros_like(P)
    if closed:
        T = np.roll(P, -1, 0) - np.roll(P, 1, 0)
    else:
        T[1:-1] = P[2:] - P[:-2]
        T[0] = P[1] - P[0]
        T[-1] = P[-1] - P[-2]
    T = unit(T)
    B = unit(np.cross(N, T))
    w = np.broadcast_to(np.asarray(width, dtype=np.float64), (k,))[:, None] / 2
    t = np.broadcast_to(np.asarray(thickness, dtype=np.float64), (k,))[:, None]
    P = P + N * offset
    be = np.minimum(t * bevel, w * 0.3)
    # Section (across, out): six points, bevelled on the outer corners.
    sec = [(-1, 0, 0), (-1, 1, -1), (-0.0, 1, 0), (1, 1, -1), (1, 0, 0)]
    cols = []
    cols.append(P - B * w)
    cols.append(P - B * w + N * (t - be))
    cols.append(P - B * (w - be) + N * t)
    cols.append(P + B * (w - be) + N * t)
    cols.append(P + B * w + N * (t - be))
    cols.append(P + B * w)
    S = len(cols)
    co = np.stack(cols, axis=1).reshape(-1, 3)  # index i*S + s
    faces, uv = [], []
    along = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(np.asarray(points), axis=0), axis=1))])
    if closed:
        along = np.concatenate([along, [along[-1] + np.linalg.norm(np.asarray(points)[0] - np.asarray(points)[-1])]])
    prof = [0.0]
    for s in range(S - 1):
        prof.append(prof[-1] + float(np.linalg.norm(cols[s + 1][0] - cols[s][0])))
    rng = range(k) if closed else range(k - 1)
    edges = []
    for i in rng:
        j = (i + 1) % k
        for s in range(S - 1):
            a, b = i * S + s, i * S + s + 1
            c, d = j * S + s + 1, j * S + s
            faces.append([a, d, c, b])
            uv.append([(prof[s], -along[i]), (prof[s], -along[i + 1]), (prof[s + 1], -along[i + 1]), (prof[s + 1], -along[i])])
        edges += [ekey(i * S + 2, j * S + 2), ekey(i * S + 3, j * S + 3)]
    g = Geo(co, faces, part=part, panel=panel, kind=kind)
    g.uv = uv
    g.down = [tuple(T[min(i // (S - 1), k - 1)]) for i in range(len(faces))]
    # (Where each point lies across the band, 0 … 1, for patterns running along it: embroidery, engraving.)
    g.attrs["paint_across"] = np.tile([0.0, 0.0, 0.1, 0.9, 1.0, 1.0], k)[:, None]
    for e in edges:
        g.edge[e] = "edge"
    if not closed:
        for i in (0, k - 1):
            ring = [i * S + s for s in range(S)]
            g.faces.append(ring if i == k - 1 else ring[::-1])
            g.uv.append(None)
            g.part.append(part)
            g.panel.append(panel + "-end")
            g.down.append(g.down[0])
            g.kind.append(kind or part)
            g.smooth.append(False)
    return g


def tube(points, radius, sides=5, part="cord", kind=None, panel="cord", closed=False, caps=True):
    """A round cord along a polyline."""
    P = np.asarray(points, dtype=np.float64)
    T, e1, e2 = frames(P, (0, 0, 1) if abs(unit(P[-1] - P[0])[2]) < 0.9 else (1, 0, 0))
    r = np.broadcast_to(np.asarray(radius, dtype=np.float64), (len(P),))

    def rad(i, angles, c, t, a, b):
        return np.full(len(angles), r[i])

    g = loft(P, sides, rad, up_hint=e1[0], part=part, panel=panel, kind=kind, closed_start=caps, closed_end=caps)
    return g


def box_ring(centre, normal, up, w, h, bar, depth, part="metal", kind="metal", panel="buckle"):
    """A rectangular frame (a buckle's), w by h outside, bars `bar` wide and `depth` thick, lying on a
    surface with the given normal; `up` is the frame's height direction."""
    n = unit(normal)
    u = unit(np.asarray(up) - n * (np.asarray(up) @ n))
    s = np.cross(u, n)
    c = np.asarray(centre)
    outer = [(-w / 2, -h / 2), (w / 2, -h / 2), (w / 2, h / 2), (-w / 2, h / 2)]
    inner = [(-w / 2 + bar, -h / 2 + bar), (w / 2 - bar, -h / 2 + bar), (w / 2 - bar, h / 2 - bar), (-w / 2 + bar, h / 2 - bar)]
    co = []
    for z in (0, depth):
        for x, y in outer:
            co.append(c + s * x + u * y + n * z)
        for x, y in inner:
            co.append(c + s * x + u * y + n * z)
    co = np.array(co)
    faces = []
    for i in range(4):
        j = (i + 1) % 4
        # top (z = depth): outer i, j; inner j, i
        faces.append([8 + i, 8 + j, 12 + j, 12 + i])
        # outer side
        faces.append([i, j, 8 + j, 8 + i])
        # inner side
        faces.append([12 + i, 12 + j, 4 + j, 4 + i])
    g = Geo(co, faces, part=part, panel=panel, kind=kind)
    g.smooth = [False] * len(faces)
    return g


def stud(centre, normal, r, h, part="metal", kind="metal", sides=8):
    """A rivet or stud: a low dome."""
    n = unit(normal)
    a = unit(np.cross(n, [0, 0, 1] if abs(n[2]) < 0.9 else [1, 0, 0]))
    b = np.cross(n, a)
    c = np.asarray(centre)
    co = []
    for ring, (rr, hh) in enumerate(((r, 0.0), (r * 0.8, h * 0.65))):
        for j in range(sides):
            t = 2 * math.pi * j / sides
            co.append(c + (a * math.cos(t) + b * math.sin(t)) * rr + n * hh)
    co.append(c + n * h)
    faces = []
    for j in range(sides):
        k = (j + 1) % sides
        faces.append([j, k, sides + k, sides + j])
        faces.append([sides + j, sides + k, 2 * sides])
    g = Geo(np.array(co), faces, part=part, panel="stud", kind=kind)
    return g


def surface_loop(geo, field, nrm=None):
    """The chain of points where a per-vertex field crosses zero on geo's faces (a closed loop round a
    tube, ordered), with the surface normals there."""
    f = np.asarray(field, dtype=np.float64)
    nrm = geo.vertex_normals() if nrm is None else nrm
    segs = []
    for face in geo.faces:
        pts = []
        for i in range(len(face)):
            a, b = face[i], face[(i + 1) % len(face)]
            if (f[a] > 0) != (f[b] > 0):
                t = f[a] / (f[a] - f[b])
                pts.append((ekey(a, b), geo.co[a] + (geo.co[b] - geo.co[a]) * t, nrm[a] + (nrm[b] - nrm[a]) * t))
        if len(pts) == 2:
            segs.append(pts)
    if not segs:
        return np.zeros((0, 3)), np.zeros((0, 3))
    adj = {}
    point = {}
    for (ka, pa, na), (kb, pb, nb_) in segs:
        adj.setdefault(ka, []).append(kb)
        adj.setdefault(kb, []).append(ka)
        point[ka] = (pa, na)
        point[kb] = (pb, nb_)
    # The longest chain.
    best = []
    seen = set()
    for start in adj:
        if start in seen:
            continue
        chain = [start]
        seen.add(start)
        cur = start
        while True:
            nxt = [x for x in adj[cur] if x not in seen]
            if not nxt:
                break
            cur = nxt[0]
            chain.append(cur)
            seen.add(cur)
        if len(chain) > len(best):
            best = chain
    P = np.array([point[k][0] for k in best])
    N = unit(np.array([point[k][1] for k in best]))
    return P, N


def clean_loop(P, N, step, closed=True, rounds=12):
    """A cut edge's chain of points made smooth (its zigzag along the mesh ironed out) and evenly spaced:
    trims and rolled edges laid on it don't wiggle and cost no more points than they need."""
    P = np.asarray(P, dtype=np.float64).copy()
    N = unit(np.asarray(N, dtype=np.float64).copy())
    for _ in range(rounds):
        if closed:
            P = 0.5 * P + 0.25 * (np.roll(P, 1, 0) + np.roll(P, -1, 0))
            N = unit(0.5 * N + 0.25 * (np.roll(N, 1, 0) + np.roll(N, -1, 0)))
        else:
            P[1:-1] = 0.5 * P[1:-1] + 0.25 * (P[:-2] + P[2:])
            N[1:-1] = unit(0.5 * N[1:-1] + 0.25 * (N[:-2] + N[2:]))
    return resample(P, N, step, closed)


def resample(P, N, step, closed=True):
    """Evenly spaced points along a chain."""
    P = np.asarray(P)
    Q = np.concatenate([P, P[:1]]) if closed else P
    M = np.concatenate([N, N[:1]]) if closed else N
    seg = np.linalg.norm(np.diff(Q, axis=0), axis=1)
    s = np.concatenate([[0], np.cumsum(seg)])
    total = s[-1]
    k = max(4, int(round(total / step)))
    t = np.linspace(0, total, k, endpoint=not closed)
    out = np.stack([np.interp(t, s, Q[:, i]) for i in range(3)], axis=1)
    nout = unit(np.stack([np.interp(t, s, M[:, i]) for i in range(3)], axis=1))
    return out, nout


# ── Fitting: weights and shape keys ──────────────────────────────────────────────────────────────────


def lift_off(geo, body, floor=0.0015, rounds=3):
    """Moves every vertex nearer the skin than `floor` (or under it) out to `floor`, smoothing the moves a
    little over its neighbours: cords, straps, bindings and trims laid along a curved body rest ON it
    instead of sinking in where it curves away from them."""
    nb = geo.neighbours()
    for _ in range(rounds):
        loc, nrm, _, d = body.nearest(geo.co)
        push = np.maximum(floor - d, 0)
        if push.max() < 1e-4:
            break
        move = nrm * push[:, None]
        move = np.where((push > 0)[:, None], move, geo.smooth_values(move, 1, 0.5, None, nb) * 0.5)
        geo.co = geo.co + move
    return geo


def fit(geo, body, loose=None, rigid=None, rigid_bones=None, smooth_rounds=0, keys_rounds=None, clearance=0.002, under=None, source=None, weights=None, groups=None, regions=None, region_mask=None, floor=0.0015):
    """Skins geo to the body and gives it the body's shape keys.

    Each vertex takes the weights and key offsets of the nearest body point (barycentric). `loose` (n,)
    in 0..1 smooths both over the piece where cloth hangs free (so a skirt doesn't tear between the legs);
    `rigid` (n,) in 0..1 replaces the weights with their average over the piece (a plate moves as one);
    `rigid_bones` limits the bones a rigid piece may follow; `groups` (n,) ints makes each group above 0 move
    as one (each plate of a pauldron, a lame), with the average of its weights. `source` (a fitted Geo) is sampled instead of
    the body (for buckles and straps lying on a garment). Then every key is corrected so no vertex comes
    closer than `clearance` to the morphed skin (or than its rest distance to the morphed `under` pieces)."""
    if floor and source is None:
        lift_off(geo, body, floor)
    if source is not None:
        W, keys, d = sample_geo(source, geo.co)
    else:
        W, keys, nrm, d = body.sample(geo.co)
        if regions is not None:
            # (Vertices in region_mask, all by default, take the skin of `regions` alone: straps and strings
            # round the body move with the skin under them, not with an arm hanging beside it.)
            m = np.ones(geo.n, dtype=bool) if region_mask is None else np.asarray(region_mask, dtype=bool)
            W2, keys2, _, _ = body.sample(geo.co[m], regions)
            W[m] = W2
            for k in keys:
                keys[k][m] = keys2[k]
    if weights is not None:
        W = weights
    nb = geo.neighbours()
    if loose is not None and smooth_rounds:
        loose = np.asarray(loose, dtype=np.float64)
        W = geo.smooth_values(W, smooth_rounds, 0.5, loose, nb)
        kr = keys_rounds if keys_rounds is not None else smooth_rounds
        keys = {k: geo.smooth_values(v, kr, 0.5, loose, nb) for k, v in keys.items()}
    if rigid is not None:
        rigid = np.asarray(rigid, dtype=np.float64)
        avg = (W * rigid[:, None]).sum(0) / max(rigid.sum(), 1e-9)
        if rigid_bones is not None:
            keep = np.isin(BONE_NAMES, rigid_bones)
            avg = avg * keep
            avg /= max(avg.sum(), 1e-9)
        W = W * (1 - rigid[:, None]) + avg[None, :] * rigid[:, None]
    if groups is not None:
        groups = np.asarray(groups).astype(np.int64)
        for gid in np.unique(groups):
            if gid <= 0:
                continue
            m = groups == gid
            W[m] = W[m].mean(0)
            for k in keys:
                keys[k][m] = keys[k][m] * 0.5 + keys[k][m].mean(0) * 0.5
    W[W < 0.01] = 0
    W /= np.maximum(W.sum(1, keepdims=True), 1e-9)
    # Keep at most four bones a vertex (glTF's limit).
    order = np.argsort(-W, axis=1)
    cut = order[:, 4:]
    np.put_along_axis(W, cut, 0, axis=1)
    W /= np.maximum(W.sum(1, keepdims=True), 1e-9)
    geo.W = W
    geo.keys = keys
    if source is None:
        correct_keys(geo, body, clearance, under, nb)
    return geo


def sample_geo(src, points):
    """Weights and key offsets of the nearest point on a fitted Geo."""
    tris = []
    for f in src.faces:
        for i in range(1, len(f) - 1):
            tris.append([f[0], f[i], f[i + 1]])
    tris = np.array(tris)
    bvh = BVHTree.FromPolygons(src.co.tolist(), tris.tolist())
    loc, nrm, tri, d = nearest(bvh, points)
    c = tris[tri]
    w = bary(src.co[c[:, 0]], src.co[c[:, 1]], src.co[c[:, 2]], loc)
    W = (src.W[c] * w[..., None]).sum(1)
    keys = {k: (D[c] * w[..., None]).sum(1) for k, D in src.keys.items()}
    return W, keys, d


def geo_bvh(geo, co=None):
    co = geo.co if co is None else co
    tris = []
    for f in geo.faces:
        for i in range(1, len(f) - 1):
            tris.append([f[0], f[i], f[i + 1]])
    return BVHTree.FromPolygons(co.tolist(), tris), np.array(tris)


def correct_keys(geo, body, clearance, under, nb, rounds=8):
    """Pushes each key's offsets out where the morphed piece would come within `clearance` of the morphed
    skin (or of a morphed piece it's worn over), smoothing the push so it leaves no dent."""
    rest_loc, rest_n, _, rest_d = body.nearest(geo.co)
    # (A vertex keeps at least `clearance` off the morphed skin, never more than it had at rest: a hem's
    # turned-in strip that sits at the skin at rest, hidden under the cloth, isn't pushed out through it.)
    need = np.minimum(np.maximum(rest_d * 0.8, clearance), rest_d)
    for k in body.key_names:
        D = geo.keys[k]
        if np.abs(body.keys[k]).max() < 1e-6:
            continue
        for _ in range(rounds):
            co = geo.co + D
            loc, nrm, _, d = body.nearest(co, {k: 1.0})
            push = np.maximum(need - d, 0)
            if under:
                for u in under:
                    bvh, _ = geo_bvh(u, u.co + u.keys[k])
                    l2, n2, _, d2 = nearest(bvh, co)
                    bvh0, _ = geo_bvh(u)
                    _, _, _, d0 = nearest(bvh0, geo.co)
                    near = np.abs(d0) < 0.05
                    p2 = np.where(near, np.maximum(np.minimum(d0, 0.004) - d2, 0), 0)
                    sel = p2 > push
                    nrm[sel] = n2[sel]
                    push = np.maximum(push, p2)
            if push.max() < 2e-4:
                break
            corr = nrm * push[:, None]
            corr = geo.smooth_values(corr, 2, 0.5, None, nb)
            corr = np.where((push > 0)[:, None], np.maximum(np.linalg.norm(corr, axis=1, keepdims=True), push[:, None]) * unit(corr + 1e-12), corr)
            D = D + corr
        geo.keys[k] = D
    # Keys that grow the body, all at once: where the piece still sinks, push each key out by its share
    # of how far it moves the skin there, so sliders used together don't clip either.
    grow = [k for k in ("heavy", "muscle", "bust", "chest", "belly", "hips", "shoulders", "neck") if k in body.keys]
    for combo in (grow, [k for k in grow if k != "heavy"] + ["thin"] if "thin" in body.keys else grow):
        values = {k: 1.0 for k in combo}
        for _ in range(rounds):
            co = geo.co + sum(geo.keys[k] for k in combo)
            loc, nrm, tri, d = body.nearest(co, values)
            push = np.maximum(need - d, 0)
            if push.max() < 5e-4:
                break
            c = body.tris[tri]
            share = np.stack([np.abs((body.keys[k][c].mean(1) * nrm).sum(1)) for k in combo], axis=1) + 1e-6
            share /= share.sum(1, keepdims=True)
            corr = nrm * push[:, None]
            corr = geo.smooth_values(corr, 2, 0.5, None, nb)
            corr = np.where((push > 0)[:, None], np.maximum(np.linalg.norm(corr, axis=1, keepdims=True), push[:, None]) * unit(corr + 1e-12), corr)
            for j, k in enumerate(combo):
                geo.keys[k] = geo.keys[k] + corr * share[:, j : j + 1]


def clip_report(geo, body, values, clearance=0.0, region_mask=None):
    """How many of the piece's vertices lie under the morphed skin (signed distance < clearance)."""
    co = geo.co.copy()
    for k, v in values.items():
        co += geo.keys[k] * v
    loc, nrm, tri, d = body.nearest(co, values)
    bad = d < clearance
    if region_mask is not None:
        bad &= region_mask
    return int(bad.sum()), float(d.min())


def coverage(geo, body, region, reach=0.5, missed=None):
    """The share of a body region's skin vertices with this piece over them (a ray out along the skin's
    normal hits the piece within `reach`)."""
    bvh, _ = geo_bvh(geo)
    sel = np.nonzero((body.region == region))[0]
    surf = np.zeros(body.n, dtype=bool)
    surf[np.unique(body.tris)] = True
    sel = sel[surf[sel]]
    if len(sel) == 0:
        return 0.0
    hits = 0
    for v in sel:
        p = Vector(body.co[v] + body.normals[v] * 0.0005)
        hit = bvh.ray_cast(p, Vector(body.normals[v]), reach)
        if hit[0] is not None:
            hits += 1
        elif missed is not None:
            missed.append(body.co[v])
    return hits / len(sel)


# ── The rig ──────────────────────────────────────────────────────────────────────────────────────────


def make_rig(body):
    """The body's armature rebuilt as make_avatar.py builds it (the same heads, tails and rolls), so the
    piece's inverse bind matrices match the body's."""
    body.rig.name = f"import-{body.sex}-rig"
    joints = {}
    children = {}
    for name, parent in ww.BONES:
        children.setdefault(parent, []).append(name)
    for name, _ in ww.BONES:
        joints[name] = Vector(body.J[name])
        if name.startswith(("Head", "hand_", "ball_")):
            joints[f"{name}.tail"] = Vector(body.J[name + ".tail"])
    armature = bpy.data.armatures.new(f"avatar-{body.sex}-rig")
    rig = bpy.data.objects.new(f"avatar-{body.sex}-rig", armature)
    bpy.context.scene.collection.objects.link(rig)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.mode_set(mode="EDIT")
    for name, parent in ww.BONES:
        bone = armature.edit_bones.new(name)
        bone.head = joints[name]
        tail = joints.get(f"{name}.tail")
        if tail is None:
            tail = joints[children[name][0]]
        bone.tail = tail
        if parent:
            bone.parent = armature.edit_bones[parent]
        direction = (bone.tail - bone.head).normalized()
        bone.align_roll(Vector((0, 0, 1)) if abs(direction.z) < 0.5 else Vector((0, -1, 0)))
    bpy.ops.object.mode_set(mode="OBJECT")
    return rig


# ── Building the Blender mesh ────────────────────────────────────────────────────────────────────────


def build_object(name, geo, rig, key_names, parts):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(geo.co.tolist(), [], geo.faces)
    mesh.validate(clean_customdata=False)
    if len(mesh.polygons) != len(geo.faces):
        raise RuntimeError(f"{name}: {len(geo.faces) - len(mesh.polygons)} faces lost in validation")
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    mesh.polygons.foreach_set("material_index", [parts.index(p) for p in geo.part])
    mesh.polygons.foreach_set("use_smooth", geo.smooth)
    if geo.sharp:
        sharp = mesh.attributes.new("sharp_edge", "BOOLEAN", "EDGE")
        lookup = {ekey(*e.vertices): e.index for e in mesh.edges}
        vals = [False] * len(mesh.edges)
        for e in geo.sharp:
            i = lookup.get(e)
            if i is not None:
                vals[i] = True
        sharp.data.foreach_set("value", vals)
    obj.shape_key_add(name="Basis", from_mix=False)
    for k in key_names:
        sk = obj.shape_key_add(name=k, from_mix=False)
        # (A key moves only the vertices it moves by MORPH_MIN or more: the kit stores each key only where it
        # moves something, and loose cloth smoothed from the body would otherwise carry every key everywhere.)
        D = geo.keys[k].copy()
        D[np.abs(D).max(1) < MORPH_MIN] = 0
        sk.data.foreach_set("co", (geo.co + D).ravel())
    for b in BONE_NAMES:
        obj.vertex_groups.new(name=b)
    for bi, b in enumerate(BONE_NAMES):
        vg = obj.vertex_groups[b]
        idx = np.nonzero(geo.W[:, bi] > 0)[0]
        for i in idx:
            vg.add([int(i)], float(geo.W[i, bi]), "REPLACE")
    obj.parent = rig
    obj.modifiers.new("Armature", "ARMATURE").object = rig
    return obj


def _islands(faces, uvs, mask=None):
    """Groups faces that share an edge with the same UVs on both sides."""
    parent = list(range(len(faces)))

    def find(a):
        while parent[a] != a:
            parent[a] = parent[parent[a]]
            a = parent[a]
        return a

    seen = {}
    for fi, f in enumerate(faces):
        if mask is not None and not mask[fi]:
            continue
        k = len(f)
        for i in range(k):
            a, b = f[i], f[(i + 1) % k]
            ua = tuple(np.round(uvs[fi][i], 5))
            ub = tuple(np.round(uvs[fi][(i + 1) % k], 5))
            key = ekey(a, b)
            if key in seen:
                gj, ga, gua, gub = seen[key]
                same = (ga == a and gua == ua and gub == ub) or (ga == b and gua == ub and gub == ua)
                if same:
                    parent[find(fi)] = find(gj)
            else:
                seen[key] = (fi, a, ua, ub)
    return [find(i) for i in range(len(faces))]


def unwrap(obj, geo, margin=0.006):
    """UVs: faces with UVs of their own keep them (in metres); the rest are unwrapped (angle based), cut
    along panel borders and `seam` edges, each island turned so its "down" runs down the texture. Then
    every island is scaled to the same texel density and packed into 0..1."""
    me = obj.data
    bpy.context.view_layer.objects.active = obj
    for o in bpy.context.selected_objects:
        o.select_set(False)
    obj.select_set(True)
    bm = bmesh.new()
    bm.from_mesh(me)
    bm.faces.ensure_lookup_table()
    uvl = bm.loops.layers.uv.verify()
    auto = np.array([u is None for u in geo.uv])
    panel = geo.panel
    for e in bm.edges:
        fs = [f.index for f in e.link_faces]
        k = ekey(e.verts[0].index, e.verts[1].index)
        cut = len(fs) == 2 and (panel[fs[0]] != panel[fs[1]] or auto[fs[0]] != auto[fs[1]])
        e.seam = bool(cut or geo.edge.get(k) in ("seam", "cut"))
    for f in bm.faces:
        u = geo.uv[f.index]
        if u is not None:
            for loop, c in zip(f.loops, u):
                loop[uvl].uv = (c[0], c[1])
        f.select = bool(auto[f.index])
    bm.to_mesh(me)
    bm.free()
    bpy.context.scene.tool_settings.use_uv_select_sync = True
    bpy.ops.object.mode_set(mode="EDIT")
    if auto.any():
        bpy.ops.uv.unwrap(method="ANGLE_BASED", margin=0.0)
    bpy.ops.object.mode_set(mode="OBJECT")
    # Turn each unwrapped island so the texture runs down the garment.
    uv = np.zeros(len(me.loops) * 2)
    me.uv_layers.active.data.foreach_get("uv", uv)
    uv = uv.reshape(-1, 2)
    starts = np.array([p.loop_start for p in me.polygons])
    face_uv = [uv[s : s + len(f)].copy() for s, f in zip(starts, geo.faces)]
    isl = _islands(geo.faces, face_uv, auto)
    groups = {}
    for fi in np.nonzero(auto)[0]:
        groups.setdefault(isl[fi], []).append(fi)
    for fis in groups.values():
        U = np.concatenate([face_uv[f] for f in fis])
        P = np.concatenate([geo.co[geo.faces[f]] for f in fis])
        D = np.concatenate([np.repeat([geo.down[f]], len(geo.faces[f]), axis=0) for f in fis])
        s = (P * D).sum(1)
        # Mirrored? (the UV winding against the 3D winding seen from outside)
        area = 0.0
        for f in fis:
            q = face_uv[f]
            area += 0.5 * np.sum(q[:, 0] * np.roll(q[:, 1], -1) - np.roll(q[:, 0], -1) * q[:, 1])
        if area < 0:
            for f in fis:
                face_uv[f][:, 0] *= -1
            U[:, 0] *= -1
        A = np.concatenate([U, np.ones((len(U), 1))], axis=1)
        coef, *_ = np.linalg.lstsq(A, s, rcond=None)
        g = coef[:2]
        if np.linalg.norm(g) < 1e-9:
            continue
        phi = math.atan2(g[1], g[0])
        t = -math.pi / 2 - phi
        R = np.array([[math.cos(t), -math.sin(t)], [math.sin(t), math.cos(t)]])
        c = U.mean(0)
        for f in fis:
            face_uv[f][:] = (face_uv[f] - c) @ R.T + c
    for s, q in zip(starts, face_uv):
        uv[s : s + len(q)] = q
    me.uv_layers.active.data.foreach_set("uv", uv.ravel())
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.select_all(action="SELECT")
    bpy.ops.uv.average_islands_scale()
    bpy.ops.uv.pack_islands(rotate=False, margin=margin)
    bpy.ops.object.mode_set(mode="OBJECT")
    uv = np.zeros(len(me.loops) * 2)
    me.uv_layers.active.data.foreach_get("uv", uv)
    uv = uv.reshape(-1, 2)
    geo.final_uv = [uv[s : s + len(f)].copy() for s, f in zip(starts, geo.faces)]


# ── Painting ─────────────────────────────────────────────────────────────────────────────────────────


def _tris(geo):
    out = []
    for fi, f in enumerate(geo.faces):
        for i in range(1, len(f) - 1):
            out.append((fi, 0, i, i + 1))
    return out


def rasterize(geo, size, attrs):
    """Each texel's face and the barycentric mix of per-vertex attrs (k, …) there."""
    fid = -np.ones((size, size), dtype=np.int64)
    out = {k: np.zeros((size, size) + np.asarray(v).shape[1:]) for k, v in attrs.items()}
    for fi, a, b, c in _tris(geo):
        q = geo.final_uv[fi]
        T = np.array([q[a], q[b], q[c]]) * size - 0.5
        x0, y0 = np.floor(T.min(0)).astype(int)
        x1, y1 = np.ceil(T.max(0)).astype(int)
        x0, y0 = max(x0, 0), max(y0, 0)
        x1, y1 = min(x1, size - 1), min(y1, size - 1)
        if x1 < x0 or y1 < y0:
            continue
        X, Y = np.meshgrid(np.arange(x0, x1 + 1), np.arange(y0, y1 + 1))
        v0, v1 = T[1] - T[0], T[2] - T[0]
        den = v0[0] * v1[1] - v1[0] * v0[1]
        if abs(den) < 1e-12:
            continue
        px, py = X - T[0][0], Y - T[0][1]
        l1 = (px * v1[1] - v1[0] * py) / den
        l2 = (v0[0] * py - px * v0[1]) / den
        l0 = 1 - l1 - l2
        e = -0.02
        inside = (l0 >= e) & (l1 >= e) & (l2 >= e)
        if not inside.any():
            continue
        ys, xs = Y[inside], X[inside]
        w = np.stack([l0[inside], l1[inside], l2[inside]], axis=1)
        w = np.clip(w, 0, None)
        w /= w.sum(1, keepdims=True)
        fid[ys, xs] = fi
        f = geo.faces[fi]
        vi = [f[a], f[b], f[c]]
        for k, v in attrs.items():
            vals = np.asarray(v)[vi]
            out[k][ys, xs] = np.tensordot(w, vals, axes=(1, 0))
    return fid, out


def dilate(img, mask, rounds=8):
    """Spreads valid texels (mask) outwards into the gutter, so mipmaps and filtering don't bleed."""
    img = img.copy()
    m = mask.copy()
    for _ in range(rounds):
        acc = np.zeros_like(img)
        cnt = np.zeros(m.shape)
        for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0), (1, 1), (-1, -1), (1, -1), (-1, 1)):
            sm = np.roll(np.roll(m, dy, 0), dx, 1)
            si = np.roll(np.roll(img, dy, 0), dx, 1)
            acc[sm] += si[sm]
            cnt[sm] += 1
        grow = (~m) & (cnt > 0)
        img[grow] = acc[grow] / cnt[grow].reshape((-1,) + (1,) * (img.ndim - 2))
        m = m | grow
    return img, m


EDGE_CLASSES = {"hem": 1, "seam": 2, "edge": 3}


def edge_fields(geo, size, fid, island, scale):
    """For each texel: the distance (metres) to the nearest classed edge (hem, seam, edge) within its own
    island, that edge's class and the arc length along it (for dashes)."""
    dist = np.full((size, size), 1.0)
    along = np.zeros((size, size))
    cls = np.zeros((size, size), dtype=np.int64)
    adj = {}
    for (a, b), c in geo.edge.items():
        if c in EDGE_CLASSES:
            adj.setdefault(a, []).append(b)
            adj.setdefault(b, []).append(a)
    s_of = {}
    for start in adj:
        if start in s_of:
            continue
        s_of[start] = 0.0
        stack = [start]
        while stack:
            v = stack.pop()
            for w in adj[v]:
                if w not in s_of:
                    s_of[w] = s_of[v] + float(np.linalg.norm(geo.co[w] - geo.co[v]))
                    stack.append(w)
    reach = 0.03
    rpx = int(math.ceil(reach / scale * size)) + 1
    for fi, f in enumerate(geo.faces):
        k = len(f)
        q = geo.final_uv[fi] * size - 0.5
        for i in range(k):
            a, b = f[i], f[(i + 1) % k]
            c = geo.edge.get(ekey(a, b))
            if c not in EDGE_CLASSES:
                continue
            A, B = q[i], q[(i + 1) % k]
            x0, y0 = np.floor(np.minimum(A, B)).astype(int) - rpx
            x1, y1 = np.ceil(np.maximum(A, B)).astype(int) + rpx
            x0, y0 = max(x0, 0), max(y0, 0)
            x1, y1 = min(x1, size - 1), min(y1, size - 1)
            if x1 < x0 or y1 < y0:
                continue
            X, Y = np.meshgrid(np.arange(x0, x1 + 1), np.arange(y0, y1 + 1))
            AB = B - A
            L2 = max(AB @ AB, 1e-12)
            t = np.clip(((X - A[0]) * AB[0] + (Y - A[1]) * AB[1]) / L2, 0, 1)
            dx = X - (A[0] + t * AB[0])
            dy = Y - (A[1] + t * AB[1])
            d = np.sqrt(dx * dx + dy * dy) / size * scale
            sub_f = fid[y0 : y1 + 1, x0 : x1 + 1]
            ok = (sub_f >= 0) & (island[np.clip(sub_f, 0, None)] == island[fi])
            sub = dist[y0 : y1 + 1, x0 : x1 + 1]
            better = ok & (d < sub)
            sub[better] = d[better]
            sa, sb = s_of.get(a, 0.0), s_of.get(b, 0.0)
            along[y0 : y1 + 1, x0 : x1 + 1][better] = (sa + (sb - sa) * t)[better]
            cls[y0 : y1 + 1, x0 : x1 + 1][better] = EDGE_CLASSES[c]
    return dist, cls, along


KINDS = ("linen", "wool", "cloth", "leather", "suede", "chain", "plate", "metal", "cord", "fur", "knit", "silk", "velvet", "quilted", "scale", "embroidery", "canvas", "engraved", "plaid", "gem")
CLOTH_KINDS = ("linen", "wool", "cloth", "knit", "silk", "velvet", "quilted", "embroidery", "canvas", "plaid")
# How strongly each kind's relief is baked into its shade as light from above and darker hollows: the game
# draws the pieces with the detail texture alone (no normal map), so stitches, weave, rings and dents have
# to read in the greyscale.
LIGHT_BAKE = {"plate": 0.3, "metal": 0.3, "engraved": 0.4, "chain": 0.25, "scale": 0.35, "leather": 0.5, "suede": 0.45, "fur": 0.5, "cord": 0.4}


def voronoi(UV, cell, seed=0):
    """Cellular noise over texture places UV (..., 2) in metres, cells about `cell` wide: the distance to
    the nearest jittered point (in cells, 0 … about 0.7), that point's offset from the texel, and a random
    0..1 per cell."""
    q = UV / cell
    i0 = np.floor(q).astype(np.int64)
    best = np.full(q.shape[:-1], 9.0)
    rid = np.zeros(q.shape[:-1])
    off = np.zeros(q.shape)

    def h(ix, iy, k):
        v = (ix * 73856093) ^ (iy * 19349663) ^ ((seed + k) * 83492791)
        v = (v ^ (v >> 13)) * 1274126177
        v = v ^ (v >> 16)
        return (v & 0xFFFF) / 65535.0

    for dx in (-1, 0, 1):
        for dy in (-1, 0, 1):
            cx, cy = i0[..., 0] + dx, i0[..., 1] + dy
            px = cx + 0.15 + 0.7 * h(cx, cy, 1)
            py = cy + 0.15 + 0.7 * h(cx, cy, 2)
            ddx, ddy = px - q[..., 0], py - q[..., 1]
            d = np.sqrt(ddx * ddx + ddy * ddy)
            take = d < best
            best = np.where(take, d, best)
            rid = np.where(take, h(cx, cy, 3), rid)
            off[..., 0] = np.where(take, ddx, off[..., 0])
            off[..., 1] = np.where(take, ddy, off[..., 1])
    return best, off, rid


def box_blur(img, r):
    """A box blur r texels wide each way, twice (near a Gaussian)."""
    out = img
    for _ in range(2):
        for axis in (0, 1):
            pad = [(r + 1, r) if a == axis else (0, 0) for a in range(out.ndim)]
            c = np.cumsum(np.pad(out, pad, mode="edge"), axis=axis)
            hi = np.take(c, np.arange(2 * r + 1, c.shape[axis]), axis=axis)
            lo = np.take(c, np.arange(0, c.shape[axis] - 2 * r - 1), axis=axis)
            out = (hi - lo) / (2 * r + 1)
    return out


def paint(geo, size, detail=None, ao=None, seed=0):
    """The piece's greyscale detail texture (shade, times the material's colour in the game) and its
    normal map, both (size, size, 3) in 0..1. `detail(P, N, A, mask)` adds a height (metres) and a shade
    of the piece's own at each texel's rest position: folds, quilting, dents."""
    attrs = {"P": geo.co, "N": geo.vertex_normals()}
    for k, v in geo.attrs.items():
        if k.startswith("paint_"):
            attrs[k] = v
    fid, A = rasterize(geo, size, attrs)
    mask = fid >= 0
    # Metres per UV unit (one scale: every island has the same texel density).
    a3 = a2 = 0.0
    for fi, f in enumerate(geo.faces):
        p = geo.co[f]
        q = geo.final_uv[fi]
        for i in range(1, len(f) - 1):
            a3 += 0.5 * np.linalg.norm(np.cross(p[i] - p[0], p[i + 1] - p[0]))
            a2 += 0.5 * abs((q[i][0] - q[0][0]) * (q[i + 1][1] - q[0][1]) - (q[i + 1][0] - q[0][0]) * (q[i][1] - q[0][1]))
    scale = math.sqrt(a3 / max(a2, 1e-12))
    px = scale / size  # metres a texel
    isl = np.array(_islands(geo.faces, geo.final_uv))
    dist, cls, along = edge_fields(geo, size, fid, isl, scale)
    yy, xx = np.mgrid[0:size, 0:size]
    U = (xx + 0.5) / size * scale
    V = (yy + 0.5) / size * scale
    kinds = np.array([KINDS.index(k) if k in KINDS else 2 for k in geo.kind])
    K = np.where(mask, kinds[np.clip(fid, 0, None)], -1)
    P = A["P"]
    H = np.zeros((size, size))
    S = np.ones((size, size))
    UV2 = np.stack([U, V], axis=-1)
    big = fbm(P, 6.0, 3, seed + 1)
    mid = fbm(P, 30.0, 3, seed + 2)

    def stitches(sel, d0, period=0.0055, dash=0.62, depth=0.00035, dark=0.72, width=0.0008):
        if px > 0.0011:
            # (Texels too coarse for single stitches: a soft line where they run, not blocky dashes.)
            w = max(width, px * 0.9)
            line = np.exp(-(((dist - d0) / w) ** 2)) * sel
            H[sel] -= (depth * 0.5 * line)[sel]
            S[sel] *= (1 - (1 - dark) * 0.5 * line)[sel]
            return
        band = sel & (np.abs(dist - d0) < width)
        on = ((along / period) % 1.0) < dash
        H[band & on] += depth * 0.4
        H[band & ~on] -= depth
        S[band & on] *= dark
        S[band & ~on] *= 0.85

    # (The baked ambient occlusion per texel, 1 where there is none.)
    ao_img = A["paint_ao"] if "paint_ao" in A else np.ones((size, size))
    if ao_img.ndim == 3:
        ao_img = ao_img[..., 0]
    for kind in np.unique(K):
        if kind < 0:
            continue
        sel = K == kind
        name = KINDS[kind]
        if name in CLOTH_KINDS:
            # The weave: slubs (threads thicker in places) along the warp and weft, soft tone changes, and
            # each kind's own surface.
            amt = {"linen": 1.0, "cloth": 0.7, "wool": 0.5, "knit": 0.3, "silk": 0.35, "velvet": 0.2, "quilted": 0.5, "embroidery": 0.6, "canvas": 0.9, "plaid": 0.5}[name]
            warp = value_noise(np.stack([U * 260, V * 16], axis=-1), 1.0, seed + 3)
            weft = value_noise(np.stack([U * 16, V * 260], axis=-1), 1.0, seed + 4)
            slub = np.clip(warp - 0.45, 0, 1) * 1.8 + np.clip(weft - 0.5, 0, 1) * 1.5
            S[sel] *= (1 + 0.05 * big + 0.03 * mid + 0.03 * amt * (warp + weft) + 0.05 * amt * slub)[sel]
            H[sel] += (0.0001 * amt * (warp + weft) + 0.00015 * amt * slub)[sel]
            if px < 0.0009 and name in ("linen", "cloth", "canvas", "embroidery"):
                p_ = 0.0011 if name != "canvas" else 0.0014
                fine = np.sin(U / p_ * 2 * math.pi) * np.sin(V / p_ * 2 * math.pi)
                H[sel] += (0.00004 * fine)[sel]
                S[sel] *= (1 + 0.025 * fine)[sel]
            if name == "wool":
                # Heathered yarn: fibres of lighter and darker wool, and a little fuzz.
                heather = value_noise(UV2 * np.array([1400.0, 500.0]), 1.0, seed + 9) + 0.5 * value_noise(UV2 * 3200.0, 1.0, seed + 14)
                S[sel] *= (1 + 0.07 * heather)[sel]
                H[sel] += (0.00008 * heather)[sel]
                if px < 0.0009:
                    twill = np.sin((U + V) / 0.0026 * 2 * math.pi)
                    H[sel] += (0.00005 * twill)[sel]
                    S[sel] *= (1 + 0.025 * twill)[sel]
            elif name == "knit":
                # Stockinette: columns of little Vs, each stitch 4.2 mm wide and 3.6 mm tall.
                pu, pv = 0.0042, 0.0036
                x = (U / pu) % 1.0 - 0.5
                y = (V / pv) % 1.0
                leg = np.abs(np.abs(x) - 0.27 + (y - 0.5) * 0.36)
                st = np.exp(-((leg / 0.13) ** 2))
                fade = smoothstep(0.0016, 0.0008, px)
                H[sel] += (0.0004 * st * fade)[sel]
                S[sel] *= (1 - 0.16 * fade * (1 - st) + 0.04 * value_noise(UV2 * 900.0, 1.0, seed + 15))[sel]
            elif name == "silk":
                # A soft sheen running across the cloth, and the odd slub (dupioni).
                sheen = value_noise(np.stack([U * 3, V * 30], axis=-1), 1.0, seed + 16)
                dup = np.clip(value_noise(np.stack([U * 120, V * 6], axis=-1), 1.0, seed + 17) - 0.55, 0, 1)
                S[sel] *= (1 + 0.06 * sheen + 0.12 * dup)[sel]
                H[sel] += (0.0002 * dup)[sel]
            elif name == "velvet":
                crush = fbm(P, 28.0, 3, seed + 18)
                S[sel] *= (1 + 0.1 * crush)[sel]
            elif name == "plaid":
                # Tartan: bands of darker and lighter yarn crossing, a 12 cm sett, over a fine twill.
                def sett(x):
                    f = (x / 0.12) % 1.0
                    return 0.55 * smoothstep(0.02, 0.0, np.abs(f - 0.15) - 0.07) + 0.3 * smoothstep(0.006, 0.0, np.abs(f - 0.42) - 0.012) + 0.45 * smoothstep(0.01, 0.0, np.abs(f - 0.7) - 0.05) - 0.25 * smoothstep(0.004, 0.0, np.abs(f - 0.88) - 0.008)
                band = (sett(U) + sett(V)) * 0.5
                S[sel] *= (0.82 + 0.4 * band)[sel]
                twill = np.sin((U + V) / 0.003 * 2 * math.pi)
                S[sel] *= (1 + 0.03 * twill * smoothstep(0.0012, 0.0007, px))[sel]
            elif name == "quilted":
                # Vertical quilting channels 3.4 cm apart, stitched; the padding puffs between them.
                pitch = 0.034
                fu = (U / pitch) % 1.0
                puff = np.sin(math.pi * fu) ** 0.7
                H[sel] += (0.0026 * puff)[sel]
                S[sel] *= (0.72 + 0.28 * puff)[sel]
                line = np.minimum(fu, 1 - fu) * pitch
                on = ((V / 0.0045) % 1.0) < 0.6
                S[sel & (line < 0.0009) & on] *= 0.7
            elif name == "embroidery":
                # Embroidered trim: a border line near each edge and a chain of diamonds with dots between,
                # in raised satin stitch, lighter than the ground.
                across = A["paint_across"][..., 0] if "paint_across" in A else np.full((size, size), 0.5)
                period = 0.034
                t = (V / period) % 1.0
                dd = np.abs(across - 0.5) * 2.4 + np.abs(t - 0.5) * 2
                diamond = smoothstep(0.78, 0.7, dd) * smoothstep(0.32, 0.4, dd)
                core = smoothstep(0.26, 0.2, dd)
                dots = smoothstep(0.17, 0.12, np.hypot((across - 0.5) * 2.4, (np.minimum(t, 1 - t)) * 2))
                border = np.exp(-(((np.abs(across - 0.5) - 0.38) / 0.035) ** 2))
                motif = np.clip(diamond + core + dots + border, 0, 1)
                satin = 0.5 + 0.5 * np.sin((U * 0.7 + V * 0.7) / 0.0007 * 2 * math.pi)
                H[sel] += (motif * (0.0005 + 0.00012 * satin))[sel]
                S[sel] *= (1 + motif * (0.38 + 0.08 * satin))[sel]
            # Hems: a doubled band and a row of stitches; seams: a ridge each side and topstitching.
            hem = sel & (cls == 1)
            H[hem] += (0.0006 * smoothstep(0.016, 0.011, dist) - 0.0004 * smoothstep(0.0025, 0.0, dist))[hem]
            S[hem] *= (1 - 0.08 * smoothstep(0.003, 0.0, dist) - 0.04 * smoothstep(0.016, 0.012, dist) * smoothstep(0.003, 0.006, dist))[hem]
            stitches(hem, 0.009)
            seam = sel & (cls == 2)
            H[seam] += (0.0007 * np.exp(-(((dist - 0.004) / 0.003) ** 2)) - 0.0008 * np.exp(-((dist / 0.0012) ** 2)))[seam]
            S[seam] *= (1 - 0.14 * np.exp(-((dist / 0.0015) ** 2)))[seam]
            stitches(seam, 0.0045, period=0.0045)
            edge = sel & (cls == 3)
            stitches(edge, 0.003, period=0.004)
        elif name in ("leather", "suede"):
            grain = fbm(UV2, 700.0, 3, seed + 5)
            pores = value_noise(UV2, 2200.0, seed + 6)
            scuff = fbm(P, 14.0, 4, seed + 7)
            S[sel] *= (1 + 0.05 * big + 0.04 * scuff + 0.04 * grain + 0.025 * pores)[sel]
            H[sel] += (0.00018 * grain + 0.00006 * pores)[sel]
            # Wear: lighter, rubbed patches where the leather is most exposed, fine creases, a few scratches.
            exposed = ao_img
            rub = np.clip(fbm(P, 9.0, 3, seed + 19) * 1.6 + (exposed - 0.85) * 3, 0, 1)
            crease = np.clip(value_noise(np.stack([U * 30 + V * 4, V * 520 - U * 60], axis=-1), 1.0, seed + 20) - 0.55, 0, 1)
            scratch = np.clip(value_noise(np.stack([U * 1800 + V * 300, V * 25 - U * 4], axis=-1), 1.0, seed + 21) - 0.8, 0, 1)
            if name == "suede":
                nap = value_noise(UV2 * 1500.0, 1.0, seed + 22)
                S[sel] *= (1 + 0.08 * nap + 0.08 * rub)[sel]
            else:
                S[sel] *= (1 + 0.14 * rub - 0.25 * crease + 0.5 * scratch)[sel]
                H[sel] -= (0.0003 * crease + 0.0002 * scratch)[sel]
            # Burnished, rounded edges and a stitch row inside them.
            edged = sel & (cls > 0)
            S[edged] *= (1 - 0.28 * smoothstep(0.004, 0.0, dist))[edged]
            H[edged] -= (0.0007 * smoothstep(0.003, 0.0, dist))[edged]
            stitches(edged & (cls != 2), 0.0055, period=0.005, dark=0.6, depth=0.0005)
            stitches(edged & (cls == 2), 0.004, period=0.005, dark=0.6, depth=0.0005)
        elif name == "chain":
            pitch = 0.011
            row = np.floor(V / (pitch * 0.5))
            hmap = np.zeros((size, size))
            light = np.zeros((size, size))
            # Each texel looks at the rings of its own row and the rows above and below (they overlap).
            for dr in (-1, 0, 1):
                r2 = row + dr
                sh = (r2 % 2) * 0.5 * pitch
                for dc in (-1, 0, 1):
                    cx = (np.floor((U + sh) / pitch) + 0.5 + dc) * pitch - sh
                    cy = (r2 + 0.5) * pitch * 0.5
                    ox = (U - cx) / pitch
                    oy = (V - cy) / pitch
                    # Rings tilt, alternating by row: one side higher.
                    tilt = np.where(r2 % 2 == 0, 1.0, -1.0)
                    rr = np.sqrt(ox**2 + (oy / 0.9) ** 2)
                    prof = np.clip(1 - ((rr - 0.4) / 0.1) ** 2, 0, None)
                    h = np.sqrt(prof) * 0.0011 + (0.0004 * tilt * ox + 0.0005 * (-oy)) * (prof > 0)
                    take = h > hmap
                    hmap = np.where(take, h, hmap)
                    light = np.where(take, np.sqrt(prof), light)
            gap = hmap <= 0
            # (Rows lit a little differently, and the odd ring brighter: mail reads as mail from afar, when
            # the rings themselves are smaller than a texel.)
            band = 0.92 + 0.08 * np.sin(V / (pitch * 0.5) * math.pi)
            glint = 1 + 0.25 * np.clip(value_noise(UV2 / pitch * 1.3, 1.0, seed + 23) - 0.6, 0, 1)
            S[sel] *= (np.where(gap, 0.12, 0.45 + 0.55 * light) * (1 + 0.08 * big) * band * glint)[sel]
            H[sel] += hmap[sel]
        elif name == "plate":
            dents = fbm(P, 22.0, 3, seed + 8)
            scratch = value_noise(np.stack([U * 40 + V * 13, V * 2400 - U * 300], axis=-1), 1.0, seed + 10)
            scratch2 = value_noise(np.stack([U * 2100 + V * 500, V * 30], axis=-1), 1.0, seed + 11)
            S[sel] *= (1 + 0.05 * big + 0.04 * mid + 0.24 * np.clip(scratch - 0.75, 0, 1) + 0.25 * np.clip(scratch2 - 0.8, 0, 1))[sel]
            H[sel] += (0.00035 * dents)[sel]
            # Hammer marks: shallow overlapping dimples a couple of centimetres across, each catching the
            # light at its rim.
            for cell, depth, k in ((0.022, 0.00045, 0), (0.011, 0.0002, 1)):
                f1, _, rid = voronoi(UV2, cell, seed + 30 + k)
                dimple = np.clip(1 - (f1 / 0.62) ** 2, 0, 1)
                H[sel] -= (depth * dimple * (0.6 + 0.4 * rid))[sel]
                S[sel] *= (1 - 0.06 * dimple * (rid - 0.5))[sel]
            # Edge wear: bright, rubbed metal along the edges.
            edged = sel & (cls > 0)
            wear = smoothstep(0.012, 0.0, dist) * (0.6 + 0.4 * np.clip(fbm(P, 40.0, 2, seed + 24) + 0.5, 0, 1))
            S[edged] *= (1 + 0.3 * wear)[edged]
            # Grime: a little darker where the plate is tucked in.
            S[sel] *= (0.85 + 0.15 * smoothstep(0.55, 0.95, ao_img))[sel]
        elif name == "scale":
            # Overlapping scales, 1.7 cm wide and 1.9 cm a row, every other row shifted by half: each scale
            # rises from where it is tucked under the row above to its rounded lower edge.
            pu, pv = 0.017, 0.019
            Vd = -V
            row = np.floor(Vd / pv)
            x = ((U / pu) + (row % 2) * 0.5) % 1.0 - 0.5
            y = (Vd / pv) % 1.0
            yb = 1 - 0.42 * (1 - np.sqrt(np.clip(1 - (2 * x) ** 2, 0, 1)))
            own = y < yb
            ramp = np.where(own, y / np.maximum(yb, 1e-6), 0.12 + 0.2 * (y - yb) / np.maximum(1 - yb, 1e-6))
            rid = value_noise(np.stack([np.floor(U / pu + (row % 2) * 0.5), row], axis=-1), 1.0, seed + 25) * 0.5 + 0.5
            ridge = np.where(own, 1 - np.abs(2 * x), 0)
            rim = np.where(own, smoothstep(yb - 0.12, yb, y), 0)
            hh = 0.0018 * ramp + 0.0004 * ridge * ramp - 0.0008 * rim * smoothstep(yb, yb - 0.02, y)
            H[sel] += hh[sel]
            S[sel] *= (np.where(own, 0.5 + 0.5 * ramp + 0.12 * rim, 0.35) * (0.9 + 0.2 * rid) * (1 + 0.05 * big))[sel]
            gapl = own & (np.abs(y - yb) < 0.05)
            S[sel & gapl] *= 0.55
        elif name == "engraved":
            # Engraved metal: a running scroll cut into it, a border line each side, polishing marks.
            across = A["paint_across"][..., 0] if "paint_across" in A else np.full((size, size), 0.5)
            period = 0.028
            t = (V / period) % 1.0
            wave = 0.5 + 0.28 * np.sin(t * 2 * math.pi)
            curl = np.hypot((across - 0.5 + 0.25 * np.cos(t * 2 * math.pi)) * 1.6, (t % 0.5 - 0.25) * 1.2)
            cut = np.exp(-(((across - wave) / 0.05) ** 2)) + 0.8 * np.exp(-(((curl - 0.12) / 0.03) ** 2))
            border = np.exp(-(((np.abs(across - 0.5) - 0.42) / 0.03) ** 2))
            groove = np.clip(cut + border, 0, 1)
            H[sel] -= (0.0003 * groove)[sel]
            S[sel] *= (1 + 0.05 * big + 0.05 * mid - 0.35 * groove)[sel]
        elif name == "metal":
            S[sel] *= (1 + 0.05 * big + 0.05 * mid)[sel]
            H[sel] += (0.0001 * fbm(P, 120.0, 2, seed + 12))[sel]
        elif name == "gem":
            # A cut stone: bright facets and a dark heart.
            facet = value_noise(UV2 * 600.0, 1.0, seed + 28)
            S[sel] *= (0.75 + 0.5 * np.clip(facet, -0.5, 1))[sel]
        elif name == "cord":
            twist = np.sin((U / 0.0028 + V / 0.0035) * 2 * math.pi)
            S[sel] *= (0.85 + 0.15 * twist)[sel]
            H[sel] += (0.0002 * twist)[sel]
        elif name == "fur":
            # Locks of fur a couple of centimetres long, each darker at its root and lighter at its tip,
            # made of fine strands running down.
            f1, off, rid = voronoi(UV2 * np.array([1.0, 0.45]), 0.012, seed + 26)
            tip = np.clip(0.5 - off[..., 1] / 0.9, 0, 1)
            strands = value_noise(np.stack([U * 1800, V * 90], axis=-1), 1.0, seed + 13)
            strands2 = value_noise(np.stack([U * 900 + V * 40, V * 50], axis=-1), 1.0, seed + 27)
            lock = np.clip(1 - f1 / 0.75, 0, 1)
            S[sel] *= ((0.6 + 0.45 * tip) * (0.82 + 0.12 * strands + 0.08 * strands2) * (0.85 + 0.3 * rid) * (0.8 + 0.25 * lock) * (1 + 0.1 * big))[sel]
            H[sel] += (0.0012 * lock + 0.0004 * strands + 0.0003 * strands2)[sel]
    if detail is not None:
        extra_h, extra_s = detail(P, A["N"], A, mask)
        if extra_h is not None:
            H[mask] += extra_h[mask]
        if extra_s is not None:
            S[mask] *= extra_s[mask]
    if ao is not None:
        S *= ao
    if "paint_ao" in A:
        S *= np.where(mask, A["paint_ao"], 1.0)
    # A little grime towards the floor on long garments.
    S[mask] *= (1 - 0.1 * smoothstep(0.3, 0.02, P[..., 2]))[mask]
    Hd, _ = dilate(H[..., None], mask, 10)
    Hd = Hd[..., 0]
    gx = (np.roll(Hd, -1, 1) - np.roll(Hd, 1, 1)) / (2 * px)
    gy = (np.roll(Hd, -1, 0) - np.roll(Hd, 1, 0)) / (2 * px)
    nrm = unit(np.stack([-gx, -gy, np.ones_like(gx)], axis=-1))
    nmap = nrm * 0.5 + 0.5
    # The relief baked into the shade (texture "up" is up the garment, so the light comes from above), and
    # hollows a little darker than the cloth round them.
    kl = np.full((size, size), 0.4)
    for kind in np.unique(K):
        if kind >= 0:
            kl[K == kind] = LIGHT_BAKE.get(KINDS[kind], 0.4)
    L = unit(np.array([0.25, 0.55, 0.8]))
    lit = (nrm * L).sum(-1) - L[2]
    hp = Hd - box_blur(Hd, max(2, int(round(0.003 / px))))
    cav = np.clip(hp / 0.0006, -1, 1)
    S = np.where(mask, S * np.clip(1 + kl * lit * 1.4 + 0.1 * cav, 0.55, 1.35), S)
    S = np.clip(S * 0.92, 0, 1)
    S, _ = dilate(S[..., None], mask, 10)
    grey = np.repeat(S, 3, axis=2)

    return grey, nmap, {"scale": scale, "texel_mm": px * 1000}


def vertex_ao(geo, body, rays=40, reach=0.2, seed=3):
    """Ambient occlusion at each vertex of the piece: the share of cosine-weighted rays out of its surface
    that reach `reach` without hitting the piece or the body (1 open … 0 shut in). Cheap and steady,
    and fine enough with the normal map carrying the small things."""
    tris = []
    for f in geo.faces:
        for i in range(1, len(f) - 1):
            tris.append([f[0], f[i], f[i + 1]])
    n0 = geo.n
    co = np.concatenate([geo.co, body.co])
    all_tris = tris + (body.tris + n0).tolist()
    bvh = BVHTree.FromPolygons(co.tolist(), all_tris)
    nrm = geo.vertex_normals()
    rng = np.random.default_rng(seed)
    u1 = rng.random(rays)
    u2 = rng.random(rays)
    # Cosine-weighted directions about +Z.
    r = np.sqrt(u1)
    local = np.stack([r * np.cos(2 * math.pi * u2), r * np.sin(2 * math.pi * u2), np.sqrt(1 - u1)], axis=1)
    out = np.ones(n0)
    for v in range(n0):
        n = nrm[v]
        a = unit(np.cross(n, [0, 0, 1] if abs(n[2]) < 0.9 else [1, 0, 0]))
        b = np.cross(n, a)
        dirs = local[:, :1] * a + local[:, 1:2] * b + local[:, 2:] * n
        start = Vector(geo.co[v] + n * 0.0006)
        hit = 0
        for d in dirs:
            if bvh.ray_cast(start, Vector(d), reach)[0] is not None:
                hit += 1
        out[v] = 1 - hit / rays
    return geo.smooth_values(out, 1, 0.5)


def bake_ao(obj, others, size, samples=48):
    """Cycles ambient occlusion over the piece's UVs, with `others` (the body, …) shading it."""
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    try:
        prefs = bpy.context.preferences.addons["cycles"].preferences
        prefs.compute_device_type = "OPTIX"
        prefs.get_devices()
        for d in prefs.devices:
            d.use = d.type != "CPU"
        scene.cycles.device = "GPU"
    except Exception:
        scene.cycles.device = "CPU"
    scene.cycles.samples = samples
    scene.world = scene.world or bpy.data.worlds.new("World")
    img = bpy.data.images.new(obj.name + "-ao", size, size, alpha=False, float_buffer=True)
    img.colorspace_settings.name = "Non-Color"
    made = []
    for m in obj.data.materials:
        node = m.node_tree.nodes.new("ShaderNodeTexImage")
        node.image = img
        m.node_tree.nodes.active = node
        made.append((m, node))
    hidden = []
    for o in scene.objects:
        if o.type == "MESH" and o is not obj and o not in others:
            hidden.append((o, o.hide_render))
            o.hide_render = True
    for o in bpy.context.selected_objects:
        o.select_set(False)
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    scene.render.bake.margin = 6
    scene.render.bake.use_selected_to_active = False
    bpy.ops.object.bake(type="AO")
    a = np.empty(size * size * 4, dtype=np.float32)
    img.pixels.foreach_get(a)
    ao = a.reshape(size, size, 4)[..., 0].astype(np.float64)
    for m, node in made:
        m.node_tree.nodes.remove(node)
    bpy.data.images.remove(img)
    for o, h in hidden:
        o.hide_render = h
    return ao


def save_image(name, rgb, colour=True, quality=90):
    """A texture saved as a JPEG (in the build folder) and packed, so the .glb carries a JPEG."""
    size = rgb.shape[0]
    image = bpy.data.images.new(name, size, size, alpha=False)
    rgba = np.concatenate([rgb, np.ones(rgb.shape[:2] + (1,))], axis=2).astype(np.float32)
    image.pixels.foreach_set(rgba.ravel())
    os.makedirs(BUILD, exist_ok=True)
    path = os.path.join(BUILD, f"{name}.jpg")
    image.filepath_raw = path
    image.file_format = "JPEG"
    image.save(filepath=path, quality=quality)
    bpy.data.images.remove(image)
    image = bpy.data.images.load(path)
    image.pack()
    if not colour:
        image.colorspace_settings.name = "Non-Color"
    return image


def materials(prefix, parts, spec, grey, nmap):
    """One material per part: its colour (glTF base colour factor) times the shared detail texture, the
    shared normal map, and the part's roughness and metalness. Each names its part in its extras
    (`part`)."""
    out = []
    for p in parts:
        colour, rough, metal = spec[p]
        m = bpy.data.materials.new(f"{prefix}-{p}")
        m["part"] = p
        m.use_nodes = True
        # (Double sided: with the skin under a piece hidden, its inside can show at an open edge.)
        m.use_backface_culling = False
        nodes, links = m.node_tree.nodes, m.node_tree.links
        bsdf = nodes.get("Principled BSDF")
        bsdf.inputs["Roughness"].default_value = rough
        bsdf.inputs["Metallic"].default_value = metal
        rgb = [srgb_to_linear(c) for c in ww.hex_rgb(colour)]
        tex = nodes.new("ShaderNodeTexImage")
        tex.image = grey
        mix = nodes.new("ShaderNodeMix")
        mix.data_type = "RGBA"
        mix.blend_type = "MULTIPLY"
        mix.inputs["Factor"].default_value = 1.0
        links.new(tex.outputs["Color"], mix.inputs["A"])
        mix.inputs["B"].default_value = (*rgb, 1.0)
        links.new(mix.outputs["Result"], bsdf.inputs["Base Color"])
        if nmap is not None:
            nt = nodes.new("ShaderNodeTexImage")
            nt.image = nmap
            nm = nodes.new("ShaderNodeNormalMap")
            links.new(nt.outputs["Color"], nm.inputs["Color"])
            links.new(nm.outputs["Normal"], bsdf.inputs["Normal"])
        out.append(m)
    return out


# ── A piece, both bodies ─────────────────────────────────────────────────────────────────────────────


class Piece:
    """One outfit piece: its name, layer (what it's worn over: 1 next to the skin … 5 a cloak), the body
    regions it hides, its material parts {part: (colour, roughness, metalness)} and texture size."""

    def __init__(self, name, layer, hides, parts, size=1024, slot=None, double_sided=(), sexes=("male", "female")):
        self.name = name
        self.layer = layer
        self.hides = list(hides)
        unknown = set(self.hides) - HIDE_WORDS
        if unknown:
            raise ValueError(f"{name}: the game doesn't know these hides: {sorted(unknown)}")
        # (The bodies the piece is made for: a piece for one body only, a bikini, has only that mesh, named
        # for its body, so the game offers it on that body alone.)
        self.sexes = tuple(sexes)
        self.spec = dict(parts)
        self.size = size
        self.slot = slot or name
        self.double_sided = set(double_sided)
        self.objects = []
        self.rigs = []
        self.stats = {}

    def add(self, mesh_name, geo, body, rig, detail=None, hides=None, extra=None, others=()):
        """Builds, unwraps, paints and dresses one mesh (`male`, `female`, `male_hood_up`, …)."""
        geo.dedupe()
        parts = [p for p in self.spec if p in set(geo.part)]
        obj = build_object(mesh_name, geo, rig, body.key_names, parts)
        unwrap(obj, geo)
        prefix = f"{self.name}-{mesh_name}"
        for m in list(obj.data.materials):
            bpy.data.materials.remove(m)
        obj.data.materials.clear()
        if not os.environ.get("WW_NO_BAKE"):
            geo.attrs["paint_ao"] = (0.25 + 0.75 * vertex_ao(geo, body)) ** 0.8
        grey, nmap, info = paint(geo, self.size, detail)
        gi = save_image(f"outfit-{prefix}-detail", grey)
        ni = save_image(f"outfit-{prefix}-normal", nmap, colour=False, quality=92)
        for m in materials(prefix, parts, self.spec, gi, ni):
            obj.data.materials.append(m)
        # (Set once the slots exist: Blender clamps indices past the last slot.)
        obj.data.polygons.foreach_set("material_index", [parts.index(p) for p in geo.part])
        obj.data.update()
        hides = self.hides if hides is None else hides
        obj["outfit"] = self.name
        obj["slot"] = self.slot
        obj["body"] = body.sex
        obj["layer"] = self.layer
        obj["hides"] = ",".join(hides)
        obj["parts"] = ",".join(parts)
        for k, v in (extra or {}).items():
            obj[k] = v
        self.objects.append(obj)
        if rig not in self.rigs:
            self.rigs.append(rig)
        self.stats[mesh_name] = {"vertices": len(obj.data.vertices), "parts": parts, "hides": hides, "texel_mm": round(info["texel_mm"], 2)}
        log(f"{self.name}/{mesh_name}: {len(obj.data.vertices)} vertices, parts {parts}, texel {info['texel_mm']:.2f} mm")
        return obj

    def export(self):
        bpy.ops.object.select_all(action="DESELECT")
        for o in self.objects + self.rigs:
            o.select_set(True)
        bpy.context.view_layer.objects.active = self.rigs[0]
        bodies = {o["body"] for o in self.objects}
        folder = MODELS
        if bodies != set(self.sexes) and os.path.abspath(folder) == os.path.abspath(ww.MODELS):
            # (A piece built for fewer bodies than it's made for, a trial run with `male` or `female`, never
            # goes into the game's models: it would replace the file with the other body missing.)
            folder = BUILD
        os.makedirs(folder, exist_ok=True)
        path = os.path.join(folder, f"outfit-{self.name}.glb")
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
        os.makedirs(BUILD, exist_ok=True)
        bpy.ops.wm.save_as_mainfile(filepath=os.path.join(BUILD, f"outfit-{self.name}.blend"), compress=True)
        size = os.path.getsize(path)
        log(f"outfit-{self.name}.glb: {size / 1e6:.2f} MB")
        with open(os.path.join(BUILD, f"outfit-{self.name}-stats.json"), "w") as f:
            json.dump(self.stats, f, indent=1)
