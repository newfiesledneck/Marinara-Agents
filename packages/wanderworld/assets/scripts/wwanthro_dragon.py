"""Helpers for the anthro dragon avatar (make_anthro_dragon.py), on top of wwblend.py and wwavatar.py.

The dragon is built on the human avatar's body, made by make_avatar.py's own functions (imported, so the
two stay one body under clothes). Its head's shape is a signed distance function (`Shape`: tapered tubes
and ellipsoids blended with a chosen softness) the warped human head is settled onto; the hard parts
(horns, claws, teeth, spines) are lofted tubes.

Positions are Blender's (+Z up, the dragon facing -Y, +X its left), in metres.
"""

import math
import os
import sys
import types

import bmesh
import bpy
import numpy as np
from mathutils import Quaternion, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import wwavatar as wa  # noqa: E402
import wwblend as ww  # noqa: E402

log = ww._log


# ── Shapes: signed distance functions over (N, 3) arrays of points ─────────────────────────────────────


def _v(x):
    return np.asarray(x, dtype=np.float64)


def smin(a, b, k):
    """A smooth union of two distances, rounding the crease between them over about `k` metres."""
    if k <= 0:
        return np.minimum(a, b)
    h = np.clip(0.5 + 0.5 * (b - a) / k, 0.0, 1.0)
    return b * (1 - h) + a * h - k * h * (1 - h)


class Shape:
    """A signed distance function: negative inside. Shapes join (`union`, each blended in at its own
    softness `k`) and are bounded (each knows a sphere it lies within, so points far from it skip the
    sums)."""

    def __init__(self, f, centre, radius, k=0.0):
        self.f, self.centre, self.radius, self.k = f, _v(centre), float(radius), k

    def __call__(self, P):
        d = np.linalg.norm(P - self.centre, axis=1) - self.radius
        near = d < 0.06
        if near.any():
            d[near] = self.f(P[near])
        return d

    def soft(self, k):
        self.k = k
        return self


def union(shapes, k=None):
    """Shapes joined in order, each one blended in at its own softness (or `k`)."""
    shapes = [s for s in shapes if s is not None]
    centre = np.mean([s.centre for s in shapes], axis=0)
    radius = max(np.linalg.norm(s.centre - centre) + s.radius for s in shapes)

    def f(P):
        d = shapes[0](P)
        for s in shapes[1:]:
            d = smin(d, s(P), s.k if k is None else k)
        return d

    return Shape(f, centre, radius)


def mirrored(shape):
    """The shape evaluated with x made positive: a left half (and the middle) becomes both sides."""

    def f(P):
        Q = P.copy()
        Q[:, 0] = np.abs(Q[:, 0])
        return shape(Q)

    c = shape.centre.copy()
    r = shape.radius + abs(c[0])
    c[0] = 0.0
    return Shape(f, c, r)


def ellipsoid(c, radii, rot=None, k=0.0):
    """An ellipsoid with semi-axes `radii` along x, y, z (turned by the 3x3 `rot`, columns its axes)."""
    c, r = _v(c), _v(radii)
    R = np.eye(3) if rot is None else _v(rot)

    def f(P):
        q = (P - c) @ R
        k0 = np.linalg.norm(q / r, axis=1)
        k1 = np.linalg.norm(q / (r * r), axis=1)
        return np.where(k1 > 1e-9, k0 * (k0 - 1) / np.maximum(k1, 1e-9), -r.min())

    return Shape(f, c, r.max(), k)


def frame_along(points, up):
    """Rotation-minimising frames along a polyline: for each point, its tangent and an `up` kept as
    square to it as can be, turned with the line (so a limb's loops don't twist)."""
    P = _v(points)
    n = len(P)
    T = np.zeros_like(P)
    T[1:-1] = P[2:] - P[:-2]
    T[0] = P[1] - P[0]
    T[-1] = P[-1] - P[-2]
    T /= np.linalg.norm(T, axis=1, keepdims=True)
    U = np.zeros_like(P)
    if np.ndim(up) == 1:
        u = _v(up) - T[0] * (_v(up) @ T[0])
        U[0] = u / np.linalg.norm(u)
        for i in range(1, n):
            q = Vector(T[i - 1]).rotation_difference(Vector(T[i]))
            u = np.array(q @ Vector(U[i - 1]))
            u -= T[i] * (u @ T[i])
            U[i] = u / np.linalg.norm(u)
    else:
        for i in range(n):
            u = _v(up[i]) - T[i] * (_v(up[i]) @ T[i])
            U[i] = u / np.linalg.norm(u)
    return T, U


def sweep(points, w, h, up=(0, 0, 1), k=0.0, cap=None, square=2.0):
    """A tube along `points`, its cross-section an ellipse `w` across and `h` up (`up`: which way is up,
    one vector or one per point), each changing smoothly along it: a limb, a snout, a tail. The ends are
    rounded over `cap` (the smaller of the two radii if not given). `square` above 2 squares the
    cross-section off (a superellipse: flatter sides, rounded corners)."""
    P0 = _v(points)
    T, U = frame_along(P0, up)
    S = np.cross(T, U)
    w, h = _v(w), _v(h)
    caps = np.minimum(w, h) if cap is None else _v(cap) * np.ones(len(P0))
    segments = []
    for i in range(len(P0) - 1):
        a, b = P0[i], P0[i + 1]
        ab = b - a
        L = np.linalg.norm(ab)
        segments.append((a, ab / L, L, i))

    def f(P):
        d = np.full(len(P), 1e3)
        for a, t_dir, L, i in segments:
            along = (P - a) @ t_dir
            t = np.clip(along / L, 0.0, 1.0)
            over = along - t * L
            C = a + np.outer(t * L, t_dir)
            q = P - C
            t1 = t[:, None]
            u = U[i] * (1 - t1) + U[i + 1] * t1
            s = S[i] * (1 - t1) + S[i + 1] * t1
            qs = np.einsum("ij,ij->i", q, s)
            qu = np.einsum("ij,ij->i", q, u)
            ww_ = w[i] + (w[i + 1] - w[i]) * t
            hh = h[i] + (h[i + 1] - h[i]) * t
            ra = caps[i] + (caps[i + 1] - caps[i]) * t
            if square == 2.0:
                k0 = np.sqrt((qs / ww_) ** 2 + (qu / hh) ** 2 + (over / ra) ** 2)
                k1 = np.sqrt((qs / ww_**2) ** 2 + (qu / hh**2) ** 2 + (over / ra**2) ** 2)
                di = np.where(k1 > 1e-9, k0 * (k0 - 1) / np.maximum(k1, 1e-9), -np.minimum(ww_, hh))
            else:
                e = square
                a_, b_, c_ = np.abs(qs) / ww_, np.abs(qu) / hh, np.abs(over) / ra
                k0 = (a_**e + b_**e + c_**e) ** (1 / e) + 1e-12
                f = k0 ** (1 - e)
                g = np.sqrt((f * a_ ** (e - 1) / ww_) ** 2 + (f * b_ ** (e - 1) / hh) ** 2 + (f * c_ ** (e - 1) / ra) ** 2)
                di = (k0 - 1) / np.maximum(g, 1e-9)
                di = np.maximum(di, -np.minimum(ww_, hh))
            d = np.minimum(d, di)
        return d

    centre = P0.mean(axis=0)
    radius = np.max(np.linalg.norm(P0 - centre, axis=1)) + max(w.max(), h.max())
    return Shape(f, centre, radius, k)


def spline(points, n):
    """`n` points along a Catmull-Rom curve through `points` (evenly by arc length)."""
    P = _v(points)
    ext = np.vstack([2 * P[0] - P[1], P, 2 * P[-1] - P[-2]])
    dense = []
    for i in range(1, len(ext) - 2):
        p0, p1, p2, p3 = ext[i - 1], ext[i], ext[i + 1], ext[i + 2]
        for t in np.linspace(0, 1, 24, endpoint=False):
            t2, t3 = t * t, t * t * t
            dense.append(0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3))
    dense.append(P[-1])
    dense = np.array(dense)
    seg = np.linalg.norm(np.diff(dense, axis=0), axis=1)
    s = np.concatenate([[0], np.cumsum(seg)])
    targets = np.linspace(0, s[-1], n)
    return np.stack([np.interp(targets, s, dense[:, j]) for j in range(3)], axis=1)




def smoothstep(lo, hi, x):
    t = np.clip((np.asarray(x, dtype=np.float64) - lo) / (hi - lo), 0.0, 1.0)
    return t * t * (3 - 2 * t)


def gradient(shape, P, eps=4e-4):
    g = np.zeros_like(P)
    for j in range(3):
        d = np.zeros(3)
        d[j] = eps
        g[:, j] = (shape(P + d) - shape(P - d)) / (2 * eps)
    return g


# ── The cage: rings, tubes, holes and caps ───────────────────────────────────────────────────────────


def cast(shape, origins, dirs, rmax, steps=48):
    """Where each ray from `origins` along `dirs` first leaves the shape (within `rmax`): the surface
    straight out from a limb's middle. A ray that never finds it stops at its closest approach."""
    n = len(origins)
    rmax = np.broadcast_to(_v(rmax), (n,)).astype(np.float64)
    t = np.linspace(0.0, 1.0, steps)[None, :] * rmax[:, None]
    pts = origins[:, None, :] + dirs[:, None, :] * t[..., None]
    f = shape(pts.reshape(-1, 3)).reshape(n, steps)
    inside = f < 0
    exits = inside[:, :-1] & ~inside[:, 1:]
    has = exits.any(axis=1)
    j = np.argmax(exits, axis=1)
    lo = t[np.arange(n), j]
    hi = t[np.arange(n), np.minimum(j + 1, steps - 1)]
    for _ in range(14):
        mid = (lo + hi) / 2
        fm = shape(origins + dirs * mid[:, None])
        lo = np.where(fm < 0, mid, lo)
        hi = np.where(fm < 0, hi, mid)
    out = (lo + hi) / 2
    if not has.all():
        best = np.argmin(np.abs(f), axis=1)
        out = np.where(has, out, t[np.arange(n), best])
    return origins + dirs * out[:, None], has


def topology(V, F):
    """Edges (unique, (E, 2)) of a face list."""
    edges = set()
    for f in F:
        for i in range(len(f)):
            a, b = f[i], f[(i + 1) % len(f)]
            edges.add((a, b) if a < b else (b, a))
    return np.array(sorted(edges), dtype=np.int64)


def normals(V, F):
    N = np.zeros_like(V)
    for f in F:
        if len(f) == 4:
            a, b, c, d = f
            n = np.cross(V[c] - V[a], V[d] - V[b])
        else:
            a, b, c = f[:3]
            n = np.cross(V[b] - V[a], V[c] - V[a])
        for i in f:
            N[i] += n
    return N / np.maximum(np.linalg.norm(N, axis=1, keepdims=True), 1e-12)


def project(shape, V, N, iters=6, step=0.03, mask=None, reach=None):
    """Moves each vertex along its normal onto the shape's surface (along the shape's own gradient where
    the normal is far from it, as in a fold). `reach` (N,): the furthest each vertex may move."""
    V0 = V.copy()
    V = V.copy()
    idx = np.arange(len(V)) if mask is None else np.nonzero(mask)[0]
    g = gradient(shape, V[idx])
    g /= np.maximum(np.linalg.norm(g, axis=1, keepdims=True), 1e-9)
    n = N[idx]
    c = np.sum(n * g, axis=1)
    D = np.where(np.abs(c)[:, None] > 0.35, n * np.sign(c)[:, None], g)
    for _ in range(iters):
        d = shape(V[idx])
        V[idx] -= D * np.clip(d, -step, step)[:, None]
    if reach is not None:
        move = V - V0
        length = np.linalg.norm(move, axis=1)
        k_ = np.minimum(1.0, reach / np.maximum(length, 1e-12))
        V = V0 + move * k_[:, None]
    return V


def relax(V, E, N, factor=0.5, mask=None):
    """Moves each vertex part of the way to its neighbours' middle, across the surface only."""
    n = len(V)
    total = np.zeros_like(V)
    np.add.at(total, E[:, 0], V[E[:, 1]])
    np.add.at(total, E[:, 1], V[E[:, 0]])
    deg = np.bincount(E.ravel(), minlength=n).astype(np.float64)[:, None]
    L = total / np.maximum(deg, 1) - V
    L -= N * np.sum(L * N, axis=1, keepdims=True)
    w = factor if mask is None else factor * mask[:, None]
    return V + L * w


# ── Blender meshes ───────────────────────────────────────────────────────────────────────────────────


# ── Looking at it ────────────────────────────────────────────────────────────────────────────────────


# ── Hard parts: horns, claws, teeth, eyes, spines ────────────────────────────────────────────────────


class Parts:
    """Separate pieces of mesh (each with its material, and a bone it's held by or None to follow the
    skin it sits on)."""

    def __init__(self):
        self.V, self.F, self.mat, self.bone, self.tag, self.u, self.origin = [], [], [], [], [], [], []

    def add(self, V, F, mat, bone=None, tag="", origin=None):
        """`origin`: where the piece is rooted (the middle of a loft's base, its last vertex, if not
        given)."""
        self.origin += [np.asarray(V[-1] if origin is None else origin, dtype=np.float64)] * len(V)
        u = getattr(loft, "last_u", None)
        self.u += list(u) if u is not None and len(u) == len(V) else [0.0] * len(V)
        off = len(self.V)
        self.V += [np.asarray(v, dtype=np.float64) for v in V]
        self.F += [[i + off for i in f] for f in F]
        self.mat += [mat] * len(F)
        self.bone += [bone] * len(V)
        self.tag += [tag] * len(V)


def loft(path, radii, n=8, up=(0, 0, 1), flat=1.0, tip=True, base_cap=True, wobble=None):
    """A tube along `path` (its radius at each point), squashed across by `flat` (a claw, a spine's
    blade: thinner side to side than front to back), ending in a point; `wobble(u)` scales each ring
    (ridges along a horn). Returns (V, F)."""
    P = _v(path)
    T, U = frame_along(P, up)
    S = np.cross(T, U)
    m = len(P)
    V, F = [], []
    last = m - 1 if tip else m
    for i in range(last):
        r = radii[i] * (wobble(i / (m - 1)) if wobble else 1.0)
        for j in range(n):
            a = 2 * math.pi * j / n
            V.append(P[i] + U[i] * math.cos(a) * r + S[i] * math.sin(a) * r * flat)
    for i in range(last - 1):
        for j in range(n):
            a, b = i * n + j, i * n + (j + 1) % n
            F.append([a, b, b + n, a + n])
    if tip:
        V.append(P[-1])
        t = len(V) - 1
        for j in range(n):
            a, b = (last - 1) * n + j, (last - 1) * n + (j + 1) % n
            F.append([a, b, t])
    if base_cap:
        V.append(P[0] - T[0] * radii[0] * 0.3)
        c = len(V) - 1
        for j in range(n):
            F.append([(j + 1) % n, j, c])
    # (How far along each vertex is, 0 at the base to 1 at the tip: Parts.add takes it.)
    u = [i / (m - 1) for i in range(last) for _ in range(n)]
    u += [1.0] if tip else []
    u += [0.0] if base_cap else []
    loft.last_u = u
    return V, F


def uv_sphere(c, r, segments=20, rings=14, axis=(0, 0, 1)):
    """A sphere with its poles along `axis`. Returns (V, F)."""
    axis = _v(axis) / np.linalg.norm(axis)
    q = Vector((0, 0, 1)).rotation_difference(Vector(axis))
    V, F = [], []
    V.append(np.array(q @ Vector((0, 0, -r))) + c)
    for i in range(1, rings):
        th = math.pi * i / rings - math.pi / 2
        for j in range(segments):
            ph = 2 * math.pi * j / segments
            V.append(np.array(q @ Vector((r * math.cos(th) * math.cos(ph), r * math.cos(th) * math.sin(ph), r * math.sin(th)))) + c)
    V.append(np.array(q @ Vector((0, 0, r))) + c)
    top = len(V) - 1
    for j in range(segments):
        F.append([0, 1 + (j + 1) % segments, 1 + j])
    for i in range(rings - 2):
        for j in range(segments):
            a = 1 + i * segments + j
            b = 1 + i * segments + (j + 1) % segments
            F.append([a, b, b + segments, a + segments])
    base = 1 + (rings - 2) * segments
    for j in range(segments):
        F.append([base + j, base + (j + 1) % segments, top])
    return V, F


def bend_path(base, direction, length, bend, steps, bend_axis=None):
    """Points from `base` along `direction`, curling by `bend` radians in all along its length (about
    `bend_axis`, or the way that turns it downward)."""
    d = _v(direction) / np.linalg.norm(direction)
    if bend_axis is None:
        bend_axis = np.cross(d, np.array([0, 0, -1.0]))
        if np.linalg.norm(bend_axis) < 1e-6:
            bend_axis = np.array([1.0, 0, 0])
    q = Quaternion(Vector(bend_axis).normalized(), bend / steps)
    pts = [np.array(base, dtype=np.float64)]
    v = Vector(d) * (length / steps)
    for _ in range(steps):
        pts.append(pts[-1] + np.array(v))
        v = q @ v
    return np.array(pts)


# ── The rig: the people's bones, a tail and wings ────────────────────────────────────────────────────

EXTRA = [("tail_01", "pelvis"), ("tail_02", "tail_01"), ("tail_03", "tail_02"), ("tail_04", "tail_03"), ("tail_05", "tail_04")]
for _s in ("l", "r"):
    EXTRA += [
        (f"wing_01_{_s}", "spine_03"),
        (f"wing_02_{_s}", f"wing_01_{_s}"),
        (f"wing_f1_{_s}", f"wing_02_{_s}"),
        (f"wing_f2_{_s}", f"wing_02_{_s}"),
        (f"wing_f3_{_s}", f"wing_02_{_s}"),
    ]
ALL_BONES = ww.BONES + EXTRA
WING_BONES = [b for b, _ in EXTRA if b.startswith("wing")]


def make_rig(name, joints):
    """The armature from `joints` (each bone's head, and `<bone>.tail` where its tail isn't its first
    child's head), rolled as wwblend rolls the people's bones."""
    J = {k: Vector(v) for k, v in joints.items()}
    armature = bpy.data.armatures.new(f"{name}-rig")
    rig = bpy.data.objects.new(f"{name}-rig", armature)
    bpy.context.scene.collection.objects.link(rig)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.mode_set(mode="EDIT")
    children = {}
    for b, parent in ALL_BONES:
        children.setdefault(parent, []).append(b)
    for b, parent in ALL_BONES:
        bone = armature.edit_bones.new(b)
        bone.head = J[b]
        tail = J.get(f"{b}.tail")
        if tail is None:
            tail = J[children[b][0]]
        bone.tail = tail
        if parent:
            bone.parent = armature.edit_bones[parent]
            if (bone.head - armature.edit_bones[parent].tail).length < 1e-5:
                bone.use_connect = False
        direction = (bone.tail - bone.head).normalized()
        bone.align_roll(Vector((0, 0, 1)) if abs(direction.z) < 0.5 else Vector((0, -1, 0)))
    bpy.ops.object.mode_set(mode="OBJECT")
    return rig


class Animator(ww.Animator):
    """wwblend's Animator, over the tail and wing bones too."""

    def turns(self, pose):
        world = {}
        for b, parent in ALL_BONES:
            world[b] = pose.get(b, world[parent] if parent else Quaternion())
        local = {}
        for b, parent in ALL_BONES:
            delta = (world[parent].inverted() if parent else Quaternion()) @ world[b]
            local[b] = self.rest[b].inverted() @ delta @ self.rest[b]
        return local


# ── Regions cut into the mesh (belly plates, underwear) ──────────────────────────────────────────────


def level_cut(obj, g, limit=None, eps=3e-4):
    """Cuts the mesh along g(P) = 0 (g: (N, 3) -> (N,), below 0 inside): each crossed edge split where g
    crosses zero, each face so crossed split between its two new vertices, so a region's edge is a clean
    line, not a staircase of faces. `limit(face) -> bool`: only faces it allows are cut. Returns the
    vertices' g after the cut."""
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bm.verts.ensure_lookup_table()
    P = np.array([v.co[:] for v in bm.verts])
    G = g(P)
    G[np.abs(G) < eps] = 0.0
    layer = bm.verts.layers.float.new("g")
    for v, val in zip(bm.verts, G):
        v[layer] = float(val)
    ok_edges = None
    if limit is not None:
        ok_edges = {e for f in bm.faces if limit(f) for e in f.edges}
    for e in list(bm.edges):
        if ok_edges is not None and e not in ok_edges:
            continue
        a, b = e.verts
        ga, gb = a[layer], b[layer]
        if ga * gb < 0:
            t = ga / (ga - gb)
            pa, pb = a.co.copy(), b.co.copy()
            _e, v = bmesh.utils.edge_split(e, a, t)
            v.co = pa.lerp(pb, t)
            v[layer] = 0.0
    for f in list(bm.faces):
        on = [lp.vert for lp in f.loops if lp.vert[layer] == 0.0]
        if len(on) != 2:
            continue
        signs = {math.copysign(1, lp.vert[layer]) for lp in f.loops if lp.vert[layer] != 0.0}
        if len(signs) < 2:
            continue
        a, b = on
        if any(b in e.verts for e in a.link_edges if e in f.edges):
            continue
        try:
            bmesh.utils.face_split(f, a, b)
        except ValueError:
            pass
    ngons = [f for f in bm.faces if len(f.verts) > 4]
    if ngons:
        bmesh.ops.triangulate(bm, faces=ngons, quad_method="BEAUTY", ngon_method="BEAUTY")
    bm.verts.ensure_lookup_table()
    out = np.array([v[layer] for v in bm.verts])
    bm.verts.layers.float.remove(layer)
    bm.to_mesh(obj.data)
    bm.free()
    obj.data.update()
    return out




def vertex_attr(obj, name, values, kind="FLOAT"):
    mesh = obj.data
    if name in mesh.attributes:
        mesh.attributes.remove(mesh.attributes[name])
    mesh.attributes.new(name, kind, "POINT").data.foreach_set("value", np.asarray(values, dtype=np.float64 if kind == "FLOAT" else np.int64).tolist())


def smooth_values(V, F, values, rounds=8, factor=0.5):
    E = topology(V, F)
    n = len(V)
    deg = np.bincount(E.ravel(), minlength=n).astype(np.float64)
    deg[deg == 0] = 1
    w = np.asarray(values, dtype=np.float64).copy()
    for _ in range(rounds):
        total = np.zeros(n)
        np.add.at(total, E[:, 0], w[E[:, 1]])
        np.add.at(total, E[:, 1], w[E[:, 0]])
        w = w * (1 - factor) + factor * total / deg
    return w


def polyline_param(P, line, values):
    """For each point, the value at its nearest point on a polyline (values given at the line's points,
    interpolated), and the distance to it."""
    L = np.asarray(line)
    best_d = np.full(len(P), np.inf)
    best_v = np.zeros(len(P))
    for i in range(len(L) - 1):
        a, b = L[i], L[i + 1]
        ab = b - a
        t = np.clip(((P - a) @ ab) / (ab @ ab), 0, 1)
        d = np.linalg.norm(P - (a + t[:, None] * ab), axis=1)
        better = d < best_d
        best_d[better] = d[better]
        best_v[better] = values[i] + (values[i + 1] - values[i]) * t[better]
    return best_v, best_d


# ── The texture: procedural patterns baked by Cycles ─────────────────────────────────────────────────


class Graph:
    """A little help building shader nodes: each call adds a node and returns its output socket, and an
    input may be a socket or a plain number or vector."""

    def __init__(self, material):
        material.use_nodes = True
        self.nt = material.node_tree
        self.nodes, self.links = self.nt.nodes, self.nt.links

    def put(self, socket, value):
        if isinstance(value, bpy.types.NodeSocket):
            self.links.new(value, socket)
        else:
            socket.default_value = value

    def node(self, kind, **props):
        n = self.nodes.new(kind)
        for k_, v in props.items():
            setattr(n, k_, v)
        return n

    def math(self, op, a, b=0.0, c=0.0, clamp=False):
        n = self.node("ShaderNodeMath", operation=op, use_clamp=clamp)
        self.put(n.inputs[0], a)
        self.put(n.inputs[1], b)
        self.put(n.inputs[2], c)
        return n.outputs[0]

    def add(self, a, b):
        return self.math("ADD", a, b)

    def mul(self, a, b):
        return self.math("MULTIPLY", a, b)

    def mix(self, a, b, t):
        """a + (b - a) t"""
        return self.add(a, self.mul(self.math("SUBTRACT", b, a), t))

    def vmath(self, op, a, b=(0, 0, 0), scale=1.0):
        n = self.node("ShaderNodeVectorMath", operation=op)
        self.put(n.inputs[0], a)
        self.put(n.inputs[1], b)
        if "Scale" in n.inputs:
            self.put(n.inputs["Scale"], scale)
        return n.outputs["Value"] if op in ("DOT_PRODUCT", "LENGTH", "DISTANCE") else n.outputs["Vector"]

    def attr(self, name):
        return self.node("ShaderNodeAttribute", attribute_name=name).outputs["Fac"]

    def position(self):
        return self.node("ShaderNodeTexCoord").outputs["Object"]

    def normal(self):
        return self.node("ShaderNodeNewGeometry").outputs["Normal"]

    def sep(self, v):
        n = self.node("ShaderNodeSeparateXYZ")
        self.put(n.inputs[0], v)
        return n.outputs[0], n.outputs[1], n.outputs[2]

    def vec(self, x, y, z):
        n = self.node("ShaderNodeCombineXYZ")
        for i, c in enumerate((x, y, z)):
            self.put(n.inputs[i], c)
        return n.outputs[0]

    def voronoi(self, v, scale, feature="F1", randomness=1.0):
        n = self.node("ShaderNodeTexVoronoi", feature=feature, voronoi_dimensions="3D")
        self.put(n.inputs["Vector"], v)
        self.put(n.inputs["Scale"], scale)
        self.put(n.inputs["Randomness"], randomness)
        return n

    def noise(self, v, scale, detail=2.0, rough=0.5):
        n = self.node("ShaderNodeTexNoise")
        self.put(n.inputs["Vector"], v)
        self.put(n.inputs["Scale"], scale)
        self.put(n.inputs["Detail"], detail)
        self.put(n.inputs["Roughness"], rough)
        return n.outputs["Fac"]

    def smooth(self, lo, hi, x):
        n = self.node("ShaderNodeMapRange", interpolation_type="SMOOTHSTEP")
        self.put(n.inputs["Value"], x)
        self.put(n.inputs["From Min"], lo)
        self.put(n.inputs["From Max"], hi)
        return n.outputs["Result"]

    def remap(self, x, a, b, c, d):
        n = self.node("ShaderNodeMapRange")
        self.put(n.inputs["Value"], x)
        self.put(n.inputs["From Min"], a)
        self.put(n.inputs["From Max"], b)
        self.put(n.inputs["To Min"], c)
        self.put(n.inputs["To Max"], d)
        return n.outputs["Result"]


def bake(objs, shaders, size=2048, ao_distance=0.08, samples=64):
    """Bakes each material's pattern (`shaders`: {material name: fn(Graph) -> (brightness, height,
    bump strength)}) into one colour texture (brightness times ambient occlusion) and one normal map,
    both on the shared texture coordinates. Returns (colour image, normal image)."""
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    try:
        prefs = bpy.context.preferences.addons["cycles"].preferences
        prefs.compute_device_type = "OPTIX"
        prefs.get_devices()
        for d in prefs.devices:
            d.use = d.type == "OPTIX"
        scene.cycles.device = "GPU"
    except Exception:
        scene.cycles.device = "CPU"
    if scene.world is None:
        scene.world = bpy.data.worlds.new("World")
    scene.world.light_settings.distance = ao_distance
    images = {}
    for label, space in (("colour", "sRGB"), ("normal", "Non-Color"), ("ao", "Non-Color")):
        img = bpy.data.images.new(f"bake-{label}", size, size, alpha=False, float_buffer=label != "colour")
        img.colorspace_settings.name = space
        images[label] = img
    mats = {m.name: m for o in objs for m in o.data.materials}
    rig = {}
    for name, m in mats.items():
        G = Graph(m)
        for n in list(G.nodes):
            G.nodes.remove(n)
        out = G.node("ShaderNodeOutputMaterial")
        lum, height, strength = shaders[name](G)
        emit = G.node("ShaderNodeEmission")
        G.put(emit.inputs["Color"], G.vec(lum, lum, lum))
        bump = G.node("ShaderNodeBump")
        G.put(bump.inputs["Height"], height)
        bump.inputs["Strength"].default_value = strength
        bump.inputs["Distance"].default_value = 0.002
        bsdf = G.node("ShaderNodeBsdfPrincipled")
        G.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
        target = G.node("ShaderNodeTexImage")
        G.nodes.active = target
        rig[name] = (G, out, emit, bsdf, target)
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]

    def run(kind, image, shader_of):
        for name, (G, out, emit, bsdf, target) in rig.items():
            target.image = image
            G.nodes.active = target
            G.links.new(shader_of(emit, bsdf), out.inputs["Surface"])
        scene.cycles.samples = samples if kind == "AO" else 4
        if kind != "AO" or len(objs) == 1:
            bpy.ops.object.bake(type=kind, margin=6, use_clear=True, normal_space="TANGENT")
        else:
            # (Each object's occlusion on its own, the others hidden: the wings, which the game can hide,
            # leave no shadow baked into the back under them.)
            for i, o in enumerate(objs):
                for other in objs:
                    other.hide_render = other is not o
                bpy.ops.object.select_all(action="DESELECT")
                o.select_set(True)
                bpy.context.view_layer.objects.active = o
                bpy.ops.object.bake(type=kind, margin=6, use_clear=(i == 0), normal_space="TANGENT")
            for o in objs:
                o.hide_render = False
                o.select_set(True)
        log(f"baked {kind}")

    run("EMIT", images["colour"], lambda e, b: e.outputs["Emission"])
    run("NORMAL", images["normal"], lambda e, b: b.outputs["BSDF"])
    run("AO", images["ao"], lambda e, b: b.outputs["BSDF"])
    colour = np.array(images["colour"].pixels[:], dtype=np.float32).reshape(size, size, 4)
    ao = np.array(images["ao"].pixels[:], dtype=np.float32).reshape(size, size, 4)[..., :1]
    colour[..., :3] *= 0.38 + 0.62 * np.clip(ao, 0, 1) ** 0.9
    final = bpy.data.images.new("texture", size, size, alpha=False)
    final.pixels.foreach_set(colour.ravel())
    final.file_format = "PNG"
    final.pack()
    nrm = bpy.data.images.new("normal", size, size, alpha=False)
    nrm.colorspace_settings.name = "Non-Color"
    nrm.pixels.foreach_set(np.array(images["normal"].pixels[:], dtype=np.float32))
    nrm.file_format = "PNG"
    nrm.pack()
    for img in images.values():
        bpy.data.images.remove(img)
    return final, nrm


def final_materials(parts, colour_image, normal_image):
    """Each part's material: the shared texture times its own colour (the base colour factor in glTF, so
    the game can recolour it), the shared normal map, its own roughness."""
    for name, colour, rough in parts:
        m = bpy.data.materials.get(name)
        G = Graph(m)
        for n in list(G.nodes):
            G.nodes.remove(n)
        out = G.node("ShaderNodeOutputMaterial")
        bsdf = G.node("ShaderNodeBsdfPrincipled")
        G.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
        tex = G.node("ShaderNodeTexImage")
        tex.image = colour_image
        mix = G.node("ShaderNodeMix", data_type="RGBA", blend_type="MULTIPLY")
        mix.inputs["Factor"].default_value = 1.0
        a = next(s for s in mix.inputs if s.name == "A" and s.type == "RGBA")
        b = next(s for s in mix.inputs if s.name == "B" and s.type == "RGBA")
        G.links.new(tex.outputs["Color"], a)
        b.default_value = (*[c ** 2.2 for c in ww.hex_rgb(colour)], 1.0)
        G.links.new(next(s for s in mix.outputs if s.type == "RGBA"), bsdf.inputs["Base Color"])
        ntex = G.node("ShaderNodeTexImage")
        ntex.image = normal_image
        nmap = G.node("ShaderNodeNormalMap")
        G.links.new(ntex.outputs["Color"], nmap.inputs["Color"])
        G.links.new(nmap.outputs["Normal"], bsdf.inputs["Normal"])
        bsdf.inputs["Roughness"].default_value = rough
        m.diffuse_color = (*[c ** 2.2 for c in ww.hex_rgb(colour)], 1.0)


# ── The human base: make_avatar.py's own body ────────────────────────────────────────────────────────
#
# The dragon's body is the human avatar's, built by make_avatar.py's own functions (imported, so the two
# stay the same body): MakeHuman's macro and detail targets, the fingers relaxed, the people's bones at its
# joint helpers with its reshaped bone heat weights, its rest pose and size, its plain smoothing where
# clothes go. The human avatar's clothes therefore fit the dragon's trunk, arms and thighs exactly.

import make_avatar as ma  # noqa: E402

APOSE = ma.APOSE
BONE_NAMES = [b for b, _ in ww.BONES]
BONE_INDEX = {b: i for i, b in enumerate(BONE_NAMES)}

# The build keys the dragon keeps from the human body (the face's are its own), and one of its own.
BODY_KEYS = ["thin", "heavy", "muscle", "chest", "bust", "hips", "waist", "belly", "shoulders", "neck"]
NECK_SLIM = {"neck/measure-neck-circ-decr": 1.0, "neck/neck-scale-depth-decr": 0.4, "neck/neck-scale-horiz-decr": 0.3}


def limit_weights(W, limit=4):
    W = W.copy()
    W[W < 0.01] = 0.0
    order = np.argsort(-W, axis=1)
    keep = np.zeros_like(W, dtype=bool)
    np.put_along_axis(keep, order[:, :limit], True, axis=1)
    W[~keep] = 0.0
    return W / np.maximum(W.sum(1, keepdims=True), 1e-12)


def chain_joints(J, R, stretch=None):
    """Joints carried down the bone chain by each bone's turn (and `stretch`: {bone: fn(offset) ->
    offset}, a bone's own reshaping in its rest frame)."""
    stretch = stretch or {}
    new = {}
    for b, parent in ww.BONES:
        if parent is None:
            new[b] = J[b].copy()
        else:
            d = J[b] - J[parent]
            if parent in stretch:
                d = stretch[parent](d[None])[0]
            new[b] = new[parent] + R[parent] @ d
    for k in J:
        if k.endswith(".tail"):
            b = k[: -len(".tail")]
            d = J[k] - J[b]
            if b in stretch:
                d = stretch[b](d[None])[0]
            new[k] = new[b] + R[b] @ d
    return new


def pose_points(P, W, J, J2, R, stretch=None):
    """Linear blend skinning of points P (weights W over the people's bones): each bone turns (R) and
    reshapes (`stretch`) the points about its old head and carries them to its new head."""
    stretch = stretch or {}
    out = np.zeros_like(P)
    for i, b in enumerate(BONE_NAMES):
        w = W[:, i]
        sel = w > 0
        if not sel.any():
            continue
        d = P[sel] - J[b]
        if b in stretch:
            d = stretch[b](d)
        out[sel] += w[sel, None] * (d @ R[b].T + J2[b])
    return out


def pose_offsets(D, W, R):
    """Shape key offsets turned with the bones (blended turns)."""
    out = np.zeros_like(D)
    for i, b in enumerate(BONE_NAMES):
        w = W[:, i]
        sel = w > 0
        if sel.any():
            out[sel] += w[sel, None] * (D[sel] @ R[b].T)
    return out


def ear_vertices(base, used_index):
    """MakeHuman's ears: the vertices its ear targets move most (a mask over the body's vertices)."""
    mask = np.zeros(len(base.co))
    for s in ("l", "r"):
        idx, d = wa.target(f"ears/{s}-ear-trans-backward")
        m = np.linalg.norm(d, axis=1)
        mask[idx] = np.maximum(mask[idx], m / m.max())
    return mask[used_index]


def human(Bh):
    """The human avatar's body (`Bh`: make_avatar's MALE or FEMALE) at its rest, as make_avatar.make
    builds it up to its head's subdivision: a dict of positions, faces, the build keys' offsets, weights,
    joints, and the marks the dragon needs (the faces inside the mouth, the lips, how much each vertex is
    ear, MakeHuman's joint helpers, the eyes)."""
    base = wa.Base()
    body = ma.Body(Bh, base)
    bf = body.body_faces
    used = np.unique(base.quads[bf])
    ma.curl_fingers(body, used)
    remap = -np.ones(len(base.co), dtype=np.int64)
    remap[used] = np.arange(len(used))
    quads = remap[base.quads[bf]]
    co = body.co[used]
    nbrs = wa.vertex_neighbours(len(co), quads)
    J = body.joints
    log(f"{Bh['name']}: human body of {len(co)} vertices")
    W = ma.heat_weights(Bh["name"], co, quads, J)
    W = ma.fix_weights(W, co, quads, J, nbrs)
    keys = {k: v[used] for k, v in body.keys.items() if k in BODY_KEYS}
    keys["neck_slim"] = wa.to_blender(wa.offsets(len(base.co), NECK_SLIM))[used] * body.scale
    R, J2 = ma.rest_pose(J)
    posed = pose_points(co, W, J, J2, R)
    keys = {k: pose_offsets(v, W, R) for k, v in keys.items()}
    # (The fingers' joints where curl_fingers bent them, each finger's tip one bone on from its last joint.)
    curled = {}
    for s_, f, k, pos, d, _back in body.knuckles:
        curled[f"{s_}-finger-{f}-{k + 1}"] = pos
        if k == 2:
            seg = np.linalg.norm(body.at(f"{s_}-finger-{f}-4") - body.at(f"{s_}-finger-{f}-3"))
            curled[f"{s_}-finger-{f}-4"] = pos + d * seg
    helper = {}
    for g in base.groups:
        if g.startswith("joint-"):
            p = curled.get(g[6:], body.at(g[6:]))
            w = W[np.argsort(np.linalg.norm(co - p, axis=1))[:6]].mean(0, keepdims=True)
            helper[g[6:]] = pose_points(p[None], w, J, J2, R)[0]
    eye = {}
    for s_, e in body.eye.items():
        w = W[np.argsort(np.linalg.norm(co - e["centre"], axis=1))[:6]].mean(0, keepdims=True)
        eye[s_] = {"centre": pose_points(e["centre"][None], w, J, J2, R)[0], "radius": e["radius"]}
    low, high = posed[:, 2].min(), posed[:, 2].max()
    s = Bh["height"] / (high - low)
    shift = np.array([0.0, 0.0, low])
    co = (posed - shift) * s
    keys = {k: v * s for k, v in keys.items()}
    J = {k: (v - shift) * s for k, v in J2.items()}
    helper = {k: (v - shift) * s for k, v in helper.items()}
    for e in eye.values():
        e["centre"] = (e["centre"] - shift) * s
        e["radius"] *= s
    co = ma.smooth_private(Bh, co, J, nbrs)
    lips = np.isin(bf, wa.face_set("lips_solid"))
    mouth = ma.mouth_inside(co, quads, lips)
    ear = ear_vertices(base, used)
    return {"co": co, "quads": quads, "keys": keys, "W": W, "J": J, "helper": helper, "eye": eye, "mouth": mouth, "lips": lips, "ear": ear, "base": base, "bf": bf, "used": used}


# ── The head: the human head moved onto the dragon's, then onto its sculpted shape ───────────────────

class Frame:
    """The head's frame: x across, f forward, u up from the Head joint."""

    def __init__(self, O):
        self.O = np.asarray(O, dtype=np.float64)

    def to(self, P):
        r = np.asarray(P) - self.O
        return np.stack([r[..., 0], -r[..., 1], r[..., 2]], axis=-1)

    def back(self, Q):
        Q = np.asarray(Q, dtype=np.float64)
        return np.stack([Q[..., 0], -Q[..., 1], Q[..., 2]], axis=-1) + self.O

    def p(self, x, f, u):
        return self.back(np.array([x, f, u], dtype=np.float64))


# ── Landmarks on the human head ─────────────────────────────────────────────────────────────────────

def rbf_fit(src, dst, lam=1e-6):
    n = len(src)
    K = np.linalg.norm(src[:, None] - src[None], axis=2)
    P = np.c_[np.ones(n), src]
    A = np.zeros((n + 4, n + 4))
    A[:n, :n] = K + lam * np.eye(n)
    A[:n, n:] = P
    A[n:, :n] = P.T
    b = np.zeros((n + 4, 3))
    b[:n] = dst - src
    sol = np.linalg.solve(A, b)
    w, a = sol[:n], sol[n:]

    def f(X):
        out = np.zeros_like(X)
        for i in range(0, len(X), 4000):
            Xi = X[i : i + 4000]
            Ki = np.linalg.norm(Xi[:, None] - src[None], axis=2)
            out[i : i + 4000] = Xi + Ki @ w + np.c_[np.ones(len(Xi)), Xi] @ a
        return out

    return f


def rot(axis, deg):
    a = math.radians(deg)
    axis = np.asarray(axis, dtype=np.float64)
    axis /= np.linalg.norm(axis)
    K = np.array([[0, -axis[2], axis[1]], [axis[2], 0, -axis[0]], [-axis[1], axis[0], 0]])
    return np.eye(3) + math.sin(a) * K + (1 - math.cos(a)) * K @ K


# ── A mesh with per-vertex and per-face values, for cutting and filling ──────────────────────────────

class Mesh:
    def __init__(self, co, faces, vattr=None, fattr=None):
        self.co = np.asarray(co, dtype=np.float64)
        self.faces = [list(f) for f in faces]
        self.v = dict(vattr or {})
        self.f = dict(fattr or {})

    def take_faces(self, keep):
        keep = np.asarray(keep, dtype=bool)
        faces = [f for f, k in zip(self.faces, keep) if k]
        used = np.unique(np.concatenate([np.array(f) for f in faces]))
        remap = -np.ones(len(self.co), dtype=np.int64)
        remap[used] = np.arange(len(used))
        self.faces = [[int(remap[i]) for i in f] for f in faces]
        self.co = self.co[used]
        for k in self.v:
            self.v[k] = self.v[k][used]
        for k in self.f:
            self.f[k] = np.asarray(self.f[k])[keep]
        return remap

    def add_verts(self, co, src, weights):
        """New vertices, each value a weighted mix of the vertices `src` (k, m) with `weights` (k, m)."""
        n0 = len(self.co)
        self.co = np.vstack([self.co, co])
        for k in self.v:
            a = self.v[k]
            new = np.einsum("km,km...->k...", weights, a[src])
            self.v[k] = np.concatenate([a, new])
        return np.arange(n0, n0 + len(co))

    def add_faces(self, faces, like):
        """New faces, each value copied from a face `like` it (texture coordinates, "uv", left unset)."""
        self.faces += [list(f) for f in faces]
        for k in self.f:
            a = np.asarray(self.f[k])
            if k == "uv":
                new = np.empty(len(faces), dtype=object)
                self.f[k] = np.concatenate([a, new])
            else:
                self.f[k] = np.concatenate([a, a[np.asarray(like, dtype=np.int64)]])

    def boundary_loops(self):
        count = {}
        owner = {}
        for i, f in enumerate(self.faces):
            for j in range(len(f)):
                a, b = f[j], f[(j + 1) % len(f)]
                key = (min(a, b), max(a, b))
                count[key] = count.get(key, 0) + 1
                owner[(a, b)] = i
        nxt = {}
        for (a, b), i in owner.items():
            if count[(min(a, b), max(a, b))] == 1:
                nxt[b] = (a, i)  # walk against the face's winding
        loops = []
        seen = set()
        for start in list(nxt):
            if start in seen:
                continue
            loop, faces_, v = [], [], start
            while v not in seen and v in nxt:
                seen.add(v)
                loop.append(v)
                v, fi = nxt[v]
                faces_.append(fi)
            loops.append((loop, faces_))
        return loops

    def fill(self, loop, like_face, rings=2):
        """Closes a hole: rings of quads shrinking towards its middle, then a fan of triangles."""
        loop = list(loop)
        n = len(loop)
        P = self.co[loop]
        c = P.mean(0)
        prev = loop
        for r in range(1, rings + 1):
            t = r / (rings + 1)
            co = P + (c - P) * t
            # (Values: the rim vertex's own.)
            ring = self.add_verts(co, np.array(loop)[:, None], np.ones((n, 1)))
            self.add_faces([[prev[j], prev[(j + 1) % n], ring[(j + 1) % n], ring[j]] for j in range(n)], [like_face] * n)
            prev = list(ring)
        mid = self.add_verts(c[None], np.array([loop]), np.full((1, n), 1.0 / n))[0]
        self.add_faces([[prev[j], prev[(j + 1) % n], mid] for j in range(n)], [like_face] * n)


def edges_of(faces):
    e = set()
    for f in faces:
        for j in range(len(f)):
            a, b = f[j], f[(j + 1) % len(f)]
            e.add((min(a, b), max(a, b)))
    return np.array(sorted(e), dtype=np.int64)


def vnormals(co, faces):
    return normals(co, faces)


def settle(shape, co, faces, slide, stick, rounds=10, factor=0.5):
    """Rounds of smoothing across the surface (`slide` 0-1 per vertex) then moving onto the shape
    (`stick` 0-1 per vertex: how far of the way)."""
    E = edges_of(faces)
    V = co.copy()
    idx = np.nonzero(stick > 0)[0]
    for _ in range(rounds):
        N = vnormals(V, faces)
        V = relax(V, E, N, factor, slide)
        N = vnormals(V, faces)
        Pj = project(shape, V[idx], N[idx], 6)
        V[idx] += (Pj - V[idx]) * stick[idx, None]
    return V


def closest(shape, P):
    """Each point moved straight onto the shape's surface (a few Newton steps along its gradient)."""
    P = P.copy()
    for _ in range(3):
        d = shape(P)
        g = gradient(shape, P)
        g /= np.maximum(np.linalg.norm(g, axis=1, keepdims=True), 1e-9)
        P -= g * d[:, None]
    return P


def fit(shape, V, faces, data_w, free, rounds=18, stiff=(120, 6), step=0.6, rigid=()):
    """Moves the mesh onto the shape a little at a time, the moves smoothed over the mesh (stiff at first,
    looser later), so neighbours move together and nothing folds. `data_w` (0-1): how much each vertex is
    pulled onto the shape; `free` (bool): which vertices may move at all."""
    E = edges_of(faces)
    a, b = np.concatenate([E[:, 0], E[:, 1]]), np.concatenate([E[:, 1], E[:, 0]])
    n = len(V)
    deg = np.bincount(a, minlength=n).astype(np.float64)
    V = V.copy()
    act = np.nonzero(data_w > 0)[0]
    for r in range(rounds):
        it = int(round(stiff[0] * (stiff[1] / stiff[0]) ** (r / max(rounds - 1, 1))))
        D0 = np.zeros_like(V)
        D0[act] = closest(shape, V[act]) - V[act]
        D = D0.copy()
        lam = 0.03 * (0.3 / 0.03) ** (r / max(rounds - 1, 1))
        w = lam * data_w[:, None]
        for _ in range(it):
            avg = np.stack([np.bincount(a, weights=D[b, j], minlength=n) for j in range(3)], 1) / np.maximum(deg, 1)[:, None]
            D = (w * D0 + avg) / (w + 1.0)
            D[~free] = 0.0
        # Groups moved whole (the eyes and their lids): the mean move of their rim.
        for weight, rim in rigid:
            m = D[rim].mean(0)
            D = D * (1 - weight[:, None]) + m * weight[:, None]
        V += D * step
    return V


def components(faces, n):
    parent = np.arange(n)

    def find(a):
        while parent[a] != a:
            parent[a] = parent[parent[a]]
            a = parent[a]
        return a

    for f in faces:
        r0 = find(f[0])
        for v in f[1:]:
            r = find(v)
            if r != r0:
                parent[r] = r0
    return np.array([find(f[0]) for f in faces])


def close_mouth(mesh, Q):
    """The mouth's inside taken away (and what's left of it deeper in) and the lips joined along their
    meeting line by a strip of faces, zipped from one corner to the other: a closed mouth."""
    mouth = np.asarray(mesh.f["mouth"], dtype=bool)
    remap = mesh.take_faces(~mouth)
    Q = Q[remap >= 0]
    comp = components(mesh.faces, len(mesh.co))
    ids, counts = np.unique(comp, return_counts=True)
    keep = comp == ids[np.argmax(counts)]
    if not keep.all():
        remap = mesh.take_faces(keep)
        Q = Q[remap >= 0]
    loops = mesh.boundary_loops()
    loop, lf = max(loops, key=lambda l: Q[l[0], 1].mean())
    loop = list(loop)
    x = Q[loop, 0]
    i0, i1 = int(np.argmax(x)), int(np.argmin(x))
    n = len(loop)
    A = [loop[(i0 + k) % n] for k in range(((i1 - i0) % n) + 1)]
    Bc = [loop[(i1 + k) % n] for k in range(((i0 - i1) % n) + 1)][::-1]
    sa = np.linspace(0, 1, len(A))
    sb = np.linspace(0, 1, len(Bc))
    i = j = 0
    tris = []
    while i < len(A) - 1 or j < len(Bc) - 1:
        if j >= len(Bc) - 1 or (i < len(A) - 1 and sa[i + 1] <= sb[j + 1]):
            tris.append([A[i], A[i + 1], Bc[j]])
            i += 1
        else:
            tris.append([A[i], Bc[j + 1], Bc[j]])
            j += 1
    tris = [t for t in tris if len(set(t)) == 3]
    mesh.add_faces(tris, [lf[0]] * len(tris))
    mesh.f["strip"] = np.concatenate([np.zeros(len(mesh.faces) - len(tris), dtype=bool), np.ones(len(tris), dtype=bool)])
    log(f"mouth closed: {len(A)} and {len(Bc)} along the lips")
    return Q


def feature_height(design, P):
    """The details' height at each point (mirrored: x taken positive)."""
    Pm = P.copy()
    Pm[:, 0] = np.abs(Pm[:, 0])
    h = np.zeros(len(P))
    for pts, height, width in design.features:
        L = np.array(pts)
        L[:, 0] = np.abs(L[:, 0])
        _v, d = polyline_param(Pm, L, np.zeros(len(L)))
        h += height * np.exp(-((d / width) ** 2))
    return h


def smooth_list(v, E, rounds, factor=0.5):
    n = len(v)
    a, b = np.concatenate([E[:, 0], E[:, 1]]), np.concatenate([E[:, 1], E[:, 0]])
    deg = np.maximum(np.bincount(a, minlength=n), 1)
    for _ in range(rounds):
        avg = np.bincount(a, weights=v[b], minlength=n) / deg
        v = v + (avg - v) * factor
    return v


def displace(design, co, faces, mask):
    N = vnormals(co, faces)
    h = smooth_list(feature_height(design, co) * mask, edges_of(faces), 2)
    return co + N * h[:, None]


def face_normals(co, faces):
    out = np.zeros((len(faces), 3))
    for i, f in enumerate(faces):
        if len(f) == 4:
            out[i] = np.cross(co[f[2]] - co[f[0]], co[f[3]] - co[f[1]])
        else:
            out[i] = np.cross(co[f[1]] - co[f[0]], co[f[2]] - co[f[0]])
    return out / np.maximum(np.linalg.norm(out, axis=1, keepdims=True), 1e-12)


def unfold(co, faces, mask, passes=12):
    """Smooths away folds: faces turned against their corners' normals (and a ring round them) are
    smoothed in every direction, a few times, until none is left (only where `mask`)."""
    E = edges_of(faces)
    a, b = np.concatenate([E[:, 0], E[:, 1]]), np.concatenate([E[:, 1], E[:, 0]])
    n = len(co)
    deg = np.maximum(np.bincount(a, minlength=n), 1)[:, None]
    co = co.copy()
    flat = np.concatenate([np.array(f) for f in faces])
    owner = np.repeat(np.arange(len(faces)), [len(f) for f in faces])
    for p in range(passes):
        fn = face_normals(co, faces)
        vn = np.zeros_like(co)
        np.add.at(vn, flat, fn[owner])
        vn /= np.maximum(np.linalg.norm(vn, axis=1, keepdims=True), 1e-12)
        dots = np.einsum("ij,ij->i", fn[owner], vn[flat])
        worst = np.full(len(faces), 1.0)
        np.minimum.at(worst, owner, dots)
        bad = worst < 0.3
        m = np.zeros(n)
        m[flat[bad[owner]]] = 1.0
        m *= mask
        if p == 0 or p == passes - 1:
            log(f"unfold {p}: {int(bad.sum())} folded faces")
        if not m.any():
            break
        for _ in range(2):
            g = np.zeros(n)
            np.maximum.at(g, a, m[b])
            m = np.maximum(m, g * mask)
        for _ in range(3):
            avg = np.stack([np.bincount(a, weights=co[b, j], minlength=n) for j in range(3)], 1) / deg
            co += (avg - co) * (0.5 * m)[:, None]
    return co

def fib(n):
    i = np.arange(n) + 0.5
    phi = np.arccos(1 - 2 * i / n)
    th = math.pi * (1 + 5**0.5) * i
    return np.stack([np.cos(th) * np.sin(phi), np.sin(th) * np.sin(phi), np.cos(phi)], 1)


def nearest_vertex(Q, pool, probe):
    return pool[np.argmin(np.linalg.norm(Q[pool] - probe, axis=1))]


def head_warp(mesh, fr, eye_h, design):
    """The human head moved onto the dragon's: landmark pairs, a smooth (thin-plate) warp through them."""
    Q = fr.to(mesh.co)
    x, f, u = Q[:, 0], Q[:, 1], Q[:, 2]
    D = lambda q: fr.to(design.P(*q))  # noqa: E731
    K = design.k
    faces, mouth_f, lips_f = mesh.faces, mesh.f["mouth"], mesh.f["lips"]
    mv = np.unique([v for F, m in zip(faces, mouth_f) if m for v in F])
    lv = np.unique([v for F, m in zip(faces, lips_f) if m for v in F])
    other = np.unique([v for F, m, l in zip(faces, mouth_f, lips_f) if not m and not l for v in F])
    contact = np.intersect1d(mv, lv)
    border = np.intersect1d(lv, other)
    cavity = np.zeros(len(Q), dtype=bool)
    cavity[mv] = True
    cavity[contact] = False
    src, dst = [], []
    taken = set()

    def pair(i, q_dst):
        if i in taken:
            return
        taken.add(int(i))
        src.append(Q[i])
        dst.append(np.asarray(q_dst, dtype=np.float64))

    # The lips: the contact line along the dragon's lip line, the lip band above and below it.
    ax = np.abs(x[contact])
    xc = ax.max()
    bins = np.linspace(0, xc, 12)
    cu, cx = [], []
    for a, b in zip(bins[:-1], bins[1:]):
        sel = (ax >= a) & (ax <= b + 1e-9)
        if sel.any():
            cu.append(u[contact][sel].mean())
            cx.append((a + b) / 2)
    line = lambda a: np.interp(a, cx, cu)  # noqa: E731
    cset = set(contact.tolist())
    up_set, lo_set = [], []
    lip_all = np.setdiff1d(lv, mv)
    for i in np.concatenate([contact, border, lip_all]):
        t = abs(x[i]) / xc
        du = u[i] - line(abs(x[i]))
        side = 1.0 if x[i] >= 0 else -1.0
        tgt = np.array(design.lip_at(t, side), dtype=np.float64)
        lower = du < 0
        if i in cset:
            (lo_set if lower else up_set).append(int(i))
            du = 0.0015 * (-1 if lower else 1)
        else:
            du *= 1.3
        tgt[2] += du
        if lower:
            tgt[0] *= 0.965
        pair(i, D(tgt))
    # The middle line, matched feature to feature along its length.
    mid = np.nonzero((np.abs(x) < 1e-5) & ~cavity & (u > -0.17))[0]
    theta = np.arctan2(u[mid], f[mid] - 0.02)
    mid = mid[np.argsort(theta)]

    def feat(cond, key):
        c = np.nonzero(cond(mid))[0]
        return int(c[np.argmax(key(mid[c]))])

    cont_mid = contact[np.abs(x[contact]) < 1e-5]
    up_c = cont_mid[np.argmax(u[cont_mid])]
    lo_c = cont_mid[np.argmin(u[cont_mid])]
    i_upc = int(np.nonzero(mid == up_c)[0][0])
    i_loc = int(np.nonzero(mid == lo_c)[0][0])
    i_nose = feat(lambda m: (u[m] > -0.015) & (u[m] < 0.02) & (f[m] > 0.05), lambda m: f[m])
    i_glab = feat(lambda m: (u[m] > 0.02) & (u[m] < 0.05) & (f[m] > 0.05), lambda m: -f[m])
    i_ulip = feat(lambda m: (u[m] > u[up_c]) & (u[m] < u[up_c] + 0.014) & (f[m] > 0.05), lambda m: f[m])
    i_fore = feat(lambda m: (u[m] > 0.085) & (u[m] < 0.095) & (f[m] > 0.0), lambda m: f[m])
    i_crown = feat(lambda m: f[m] > -0.02, lambda m: u[m])
    i_occ = feat(lambda m: (u[m] > 0.03) & (u[m] < 0.06) & (f[m] < 0), lambda m: -f[m])
    i_nape = feat(lambda m: (u[m] > -0.03) & (u[m] < -0.005) & (f[m] < 0), lambda m: -f[m])
    i_llip = feat(lambda m: (u[m] < u[lo_c]) & (u[m] > u[lo_c] - 0.022) & (f[m] > 0.05), lambda m: f[m])
    i_chin = feat(lambda m: (u[m] < -0.06) & (u[m] > -0.085) & (f[m] > 0.05), lambda m: f[m])
    i_subm = feat(lambda m: (u[m] < -0.07) & (f[m] > 0.03) & (f[m] < 0.06), lambda m: -u[m])
    i_throat = feat(lambda m: (u[m] < -0.12) & (f[m] > 0.0), lambda m: f[m])
    pu = design.profile_up
    pl = design.profile_lo
    prof_up = list(zip([i_upc, i_ulip, i_nose, i_glab, i_fore, i_crown, i_occ, i_nape], pu))
    prof_lo = list(zip([i_loc, i_llip, i_chin, i_subm, i_throat], pl))

    def run(prof):
        for (ia, qa), (ib, qb) in zip(prof[:-1], prof[1:]):
            lo, hi = sorted((ia, ib))
            seg = mid[lo : hi + 1]
            if ia > ib:
                seg = seg[::-1]
            P = Q[seg]
            s = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(P, axis=0), axis=1))])
            s /= max(s[-1], 1e-9)
            A, Bq = D((0, *qa)), D((0, *qb))
            for vi, t in zip(seg, s):
                pair(vi, A + (Bq - A) * t)

    run(prof_up)
    run(prof_lo)
    # The eyes: carried whole (turned, a little bigger), lids and all.
    e = design.eye
    design.eye_frame = {}
    for sgn, s_ in ((1.0, "l"), (-1.0, "r")):
        eh = fr.to(eye_h[s_]["centre"])
        rh = eye_h[s_]["radius"]
        ed = D((sgn * e["centre"][0], e["centre"][1], e["centre"][2]))
        Rm = rot((0, 0, 1), -sgn * e["yaw"]) @ rot((0, 1, 0), -sgn * e["roll"]) @ rot((1, 0, 0), -e["pitch"])
        sc = e["scale"] * K
        near = np.nonzero((np.linalg.norm(Q - eh, axis=1) < 2.1 * rh) & ~cavity)[0]
        for i in near[::2]:
            pair(i, ed + sc * (Rm @ (Q[i] - eh)))
        design.eye_frame[s_] = (ed, Rm, sc, eh, rh)
    # The sides of the face: a few points snapped onto the human skin.
    pool = np.nonzero(~cavity & (mesh.v["ear"] < 0.2) & (u > -0.16))[0]
    for probe, tgt in design.lateral:
        for sg in (1.0, -1.0):
            i = nearest_vertex(Q, pool, np.array([sg * probe[0], probe[1], probe[2]]))
            pair(i, D((sg * tgt[0], tgt[1], tgt[2])))
    # The lower jaw: each point of the human chin and jaw sides, by its bearing round the face (front to
    # side: tip of the dragon's jaw to its back) and its angle round the jaw (lip down to underneath),
    # cast onto the dragon's jaw.
    th = np.arctan2(np.abs(x), f - 0.02)
    rad = np.hypot(np.abs(x), f - 0.02)
    psi = np.arctan2(u - (-0.05), rad - 0.05)
    below = u < line(np.minimum(np.abs(x), xc)) - 0.003
    sel = np.nonzero(below & (th < math.radians(95)) & (psi > math.radians(-55)) & (psi < math.radians(20)) & ~cavity & (mesh.v["ear"] < 0.2) & (u > -0.12))[0]
    ja = np.array(design.jaw_axis)
    corner_i = contact[np.argmax(np.abs(x[contact]))]
    th_c = np.arctan2(abs(x[corner_i]), f[corner_i] - 0.02)
    tj = th[sel] / th_c
    f_lip = design.lip_at(np.clip(tj, 0, 1))[:, 1] - 0.004
    f_back = np.interp(tj, [1.0, math.radians(92) / th_c], [design.lip_line[-1][1] - 0.004, -0.012])
    fd = np.where(tj <= 1, f_lip, f_back)
    ud = np.interp(fd, ja[:, 0], ja[:, 1]) + 0.004
    tt = th[sel]
    origin = np.stack([np.zeros(len(sel)), np.minimum(fd - 0.02 * np.cos(smoothstep(0.0, 0.3, tj) * math.pi / 2), 0.25), ud], 1)
    tt = smoothstep(0.0, 0.3, tj) * (math.pi / 2)
    dirs = np.stack([np.sign(x[sel]) * np.sin(tt) * np.cos(psi[sel]), np.cos(tt) * np.cos(psi[sel]), np.sin(psi[sel])], 1)
    Ow = fr.back(np.stack([origin[:, 0] * K, np.array([design.F(v) for v in origin[:, 1]]) * K, origin[:, 2] * K], 1))
    Dw = fr.back(dirs) - fr.back(np.zeros(3))
    hit, ok = cast(design.jaw_shape, Ow, Dw, np.full(len(sel), 0.2 * K))
    for i, p_, k_ in zip(sel[::2], hit[::2], ok[::2]):
        if k_:
            pair(i, fr.to(p_))
    # Under the jaw: the human underside spread along the dragon's, front to back, cast down onto it.
    Wh = mesh.v["W"][:, BONE_INDEX["Head"]]
    sub = np.nonzero(below & ((psi <= math.radians(-55)) | (u < -0.075)) & (f > 0.03) & (u > -0.13) & (Wh > 0.5) & ~cavity)[0]
    fh = f[sub]
    fd2 = 0.075 + np.clip((fh - 0.035) / (0.095 - 0.035), 0, 1) * (0.25 - 0.075)
    halfw = np.interp(fd2, ja[:, 0], np.array([w for *_, w, _ in design.jaw_rows]))
    xd2 = x[sub] / 0.055 * halfw * 0.9
    origin = np.stack([xd2, fd2, np.interp(fd2, ja[:, 0], ja[:, 1])], 1)
    Ow = fr.back(np.stack([origin[:, 0] * K, np.array([design.F(v) for v in origin[:, 1]]) * K, origin[:, 2] * K], 1))
    Dw = np.tile(fr.back(np.array([0, 0, -1.0])) - fr.back(np.zeros(3)), (len(sub), 1))
    hit, ok = cast(design.shape, Ow, Dw, np.full(len(sub), 0.2 * K))
    for i, p_, k_ in zip(sub[::2], hit[::2], ok[::2]):
        if k_:
            pair(i, fr.to(p_))
    # The skull: rays from the middle of each to its back, top and sides.
    hc = np.array([0.0, 0.0, 0.04])
    dc = D((0.0, -0.005, 0.05))
    hpool = np.nonzero(~cavity & (mesh.v["ear"] < 0.05) & (u > -0.1))[0]
    Hn = Q[hpool] - hc
    Hd = Hn / np.linalg.norm(Hn, axis=1, keepdims=True)
    for d in fib(200):
        if d[1] > 0.12 or d[2] < -0.3:
            continue
        dots = Hd @ d
        j = int(np.argmax(dots))
        if dots[j] < 0.996:
            continue
        o = fr.back(dc)
        p_d, _ = cast(design.shape, o[None], (fr.back(dc + d) - o)[None], [0.3])
        pair(hpool[j], fr.to(p_d[0]))
    # The neck stays where it is.
    anchor = np.nonzero((u < -0.17) & (u > -0.32))[0]
    for i in anchor[::25]:
        pair(i, Q[i])
    src_a, dst_a = np.array(src), np.array(dst)
    log(f"head warp: {len(src_a)} landmarks")
    warp = rbf_fit(src_a, dst_a, 1e-5)
    move = u > -0.27
    out = Q.copy()
    out[move] = warp(Q[move])
    b = smoothstep(-0.27, -0.19, u)[:, None]
    out = Q + (out - Q) * b
    # The mouth's inside: a pocket behind the lip line, each vertex behind its nearest lip vertex.
    cv = np.nonzero(cavity)[0]
    dist = np.linalg.norm(Q[cv][:, None] - Q[contact][None], axis=2)
    near = contact[np.argmin(dist, axis=1)]
    depth = dist.min(axis=1)
    lc = out[near]
    axis_pt = np.stack([np.zeros(len(cv)), np.minimum(lc[:, 1], 0.24 * K), lc[:, 2]], 1)
    inward = axis_pt - lc
    inward /= np.maximum(np.linalg.norm(inward, axis=1, keepdims=True), 1e-9)
    out[cv] = lc + inward * np.minimum(depth * 0.35, 0.02)[:, None]
    design.contact = (np.array(up_set), np.array(lo_set))
    return fr.back(out), cavity, contact


def smooth_region(co, faces, mask, rounds=20, factor=0.5):
    """Plain smoothing (in every direction) where `mask` (0-1): folds and notches pulled out into a
    smooth surface."""
    E = edges_of(faces)
    a, b = np.concatenate([E[:, 0], E[:, 1]]), np.concatenate([E[:, 1], E[:, 0]])
    n = len(co)
    deg = np.maximum(np.bincount(a, minlength=n), 1)[:, None]
    co = co.copy()
    for _ in range(rounds):
        avg = np.stack([np.bincount(a, weights=co[b, j], minlength=n) for j in range(3)], 1) / deg
        co += (avg - co) * (factor * mask)[:, None]
    return co
