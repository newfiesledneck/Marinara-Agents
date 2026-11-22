"""Helpers for the anthro wolf bodies (make_anthro_wolf.py): the human base avatar's body read the way
make_avatar.py builds it, a mesh kept as numpy arrays while it's reshaped (positions, faces, shape key
offsets and bone weights per vertex), a smooth space warp through matching points (a thin-plate spline),
growing tubes out of the surface (ears, tail), the fur's paint and bakes, and the rig with its tail.
"""

import math
import os
import sys
import types

import bmesh
import bpy
import numpy as np
from mathutils import Quaternion, Vector
from mathutils.bvhtree import BVHTree
from mathutils.kdtree import KDTree

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import wwavatar as wa  # noqa: E402
import wwblend as ww  # noqa: E402

log = ww._log

TAIL = ["tail_01", "tail_02", "tail_03", "tail_04"]
BONES = ww.BONES + [("tail_01", "pelvis"), ("tail_02", "tail_01"), ("tail_03", "tail_02"), ("tail_04", "tail_03")]
BONE_NAMES = [b for b, _ in BONES]
BI = {b: i for i, b in enumerate(BONE_NAMES)}
NB = len(BONE_NAMES)


def unit(v):
    v = np.asarray(v, dtype=np.float64)
    return v / np.maximum(np.linalg.norm(v, axis=-1, keepdims=True), 1e-12)


smoothstep = wa.smoothstep


# ── The human base: what make_avatar.py does to build its body, copied here (as it was at 0.7.41) so the
# wolf stays the same when the avatar script changes. Positions are metres, feet at 0, facing -Y. ─────────

APOSE = 45  # the arms' angle below level at rest

EXPRESSION = {
    "expression/units/caucasian/mouth-compression": 0.45,
    "expression/units/caucasian/eye-left-opened-up": 0.25,
    "expression/units/caucasian/eye-right-opened-up": 0.25,
}

HUMAN_MALE = {
    "name": "avatar-male",
    "female": False,
    "height": 1.78,
    "macro": dict(gender=1.0, muscle=0.85, weight=0.38, height=0.6, proportions=1.0, race=(1.0, 0.0, 0.0)),
    "detail": {
        "chin/chin-prominent-incr": 0.3,
        "chin/chin-width-incr": 0.3,
        "chin/chin-bones-incr": 0.45,
        "nose/nose-point-width-decr": 0.4,
        "nose/nose-flaring-decr": 0.3,
        "forehead/forehead-scale-vert-decr": 0.4,
        "forehead/forehead-nubian-incr": 0.2,
        **wa.sided("cheek/cheek-bones-incr", 0.35),
        **wa.sided("cheek/cheek-volume-decr", 0.4),
        "mouth/mouth-scale-horiz-decr": 0.15,
        "mouth/mouth-upperlip-volume-decr": 0.25,
        **wa.sided("eyes/eye-scale-incr", 0.3),
        "head/head-scale-vert-decr": 0.15,
        "head/head-square": 0.3,
        "neck/measure-neck-circ-incr": 0.3,
        "head/head-back-scale-depth-decr": 0.3,
        **EXPRESSION,
    },
}
HUMAN_FEMALE = {
    "name": "avatar-female",
    "female": True,
    "height": 1.68,
    "macro": dict(gender=0.0, muscle=0.55, weight=0.3, height=0.55, proportions=1.0, cupsize=0.62, firmness=0.85, race=(0.6, 0.1, 0.3)),
    "detail": {
        "nose/nose-scale-horiz-decr": 0.3,
        "nose/nose-point-width-decr": 0.4,
        "nose/nose-point-up": 0.3,
        "nose/nose-flaring-decr": 0.3,
        **wa.sided("eyes/eye-scale-incr", 0.4),
        **wa.sided("eyes/eye-corner2-up", 0.3),
        "mouth/mouth-upperlip-volume-incr": 0.3,
        "mouth/mouth-cupidsbow-incr": 0.4,
        "chin/chin-width-decr": 0.3,
        "chin/chin-bones-decr": 0.3,
        **wa.sided("cheek/cheek-bones-incr", 0.4),
        "forehead/forehead-scale-vert-decr": 0.3,
        "head/head-scale-vert-decr": 0.15,
        "neck/neck-scale-horiz-decr": 0.2,
        "head/head-back-scale-depth-decr": 0.2,
        **EXPRESSION,
        "expression/units/caucasian/eye-left-opened-up": 0.08,
        "expression/units/caucasian/eye-right-opened-up": 0.08,
    },
}

JOINTS = {"pelvis": "pelvis", "spine_01": "spine-3", "spine_02": "spine-2", "spine_03": "spine-1", "neck_01": "neck", "Head": "head", "Head.tail": "head-2"}
for _s in ("l", "r"):
    JOINTS.update(
        {
            f"clavicle_{_s}": f"{_s}-clavicle",
            f"upperarm_{_s}": f"{_s}-shoulder",
            f"lowerarm_{_s}": f"{_s}-elbow",
            f"hand_{_s}": f"{_s}-hand",
            f"hand_{_s}.tail": f"{_s}-finger-3-2",
            f"thigh_{_s}": f"{_s}-upper-leg",
            f"calf_{_s}": f"{_s}-knee",
            f"foot_{_s}": f"{_s}-ankle",
            f"ball_{_s}": f"{_s}-foot-1",
            f"ball_{_s}.tail": f"{_s}-foot-2",
        }
    )
HB = [b for b, _ in ww.BONES]  # the human's bones (no tail)
HI = {b: i for i, b in enumerate(HB)}


def key_mixes(B, macro):
    """Each human shape key as a function giving its MakeHuman offsets."""
    female = B["female"]
    S = wa.sided

    def macro_change(**change):
        return lambda n: wa.offsets(n, wa.macro_mix(**{**macro, **change})) - wa.offsets(n, wa.macro_mix(**macro))

    def detail(mix):
        return lambda n: wa.offsets(n, mix)

    keys = {
        "thin": macro_change(weight=0.0),
        "heavy": macro_change(weight=1.0),
        "muscle": macro_change(muscle=1.0),
        "hips": detail({"hip/hip-scale-horiz-incr": 0.7, "buttocks/buttocks-volume-incr": 0.6, "torso/measure-hips-circ-incr": 0.4}),
        "waist": detail({"torso/measure-waist-circ-decr": 1.0}),
        "belly": detail({"stomach/stomach-pregnant-incr": 0.45, "torso/measure-waist-circ-incr": 0.5}),
        "shoulders": detail({"torso/measure-shoulder-dist-incr": 1.0, **S("arms/upperarm-shoulder-muscle-incr", 0.6)}),
        "neck": detail({"neck/measure-neck-circ-incr": 1.0, "neck/neck-scale-depth-incr": 0.3}),
        "neck_slim": detail({"neck/measure-neck-circ-decr": 0.8, "neck/neck-scale-depth-decr": 0.3}),
        "jaw": detail({"chin/chin-width-incr": 0.6, "chin/chin-bones-incr": 0.8, "chin/chin-prominent-incr": 0.4}),
        "cheeks": detail({**S("cheek/cheek-bones-incr", 0.6), **S("cheek/cheek-volume-incr", 0.5)}),
        "eyes": detail(S("eyes/eye-scale-incr", 1.0)),
    }
    if female:
        cup = macro_change(cupsize=1.0)
        vol = detail({"breast/breast-volume-vert-up": 0.3})
        keys["bust"] = lambda n: cup(n) + vol(n)
    else:
        keys["chest"] = detail({"torso/torso-muscle-pectoral-incr": 1.0, "torso/measure-bust-circ-incr": 0.4})
    order = ["thin", "heavy", "muscle", "bust" if female else "chest", "hips", "waist", "belly", "shoulders", "neck", "neck_slim", "jaw", "cheeks", "eyes"]
    return {k: keys[k] for k in order}


class Body:
    """The human body in Blender's space: positions, shape key offsets and joints over MakeHuman's whole
    vertex list (helpers included), and the eyes."""

    def __init__(self, B, base):
        n = len(base.co)
        mix = wa.macro_mix(**B["macro"])
        for k, w in B["detail"].items():
            mix[k] = mix.get(k, 0.0) + w
        co = base.co + wa.offsets(n, mix)
        self.co_mh = co
        self.body_faces = base.faces_of("body")
        used = np.unique(base.quads[self.body_faces])
        p = wa.to_blender(co)
        low, high = p[used, 2].min(), p[used, 2].max()
        self.scale = B["height"] / (high - low)
        offset = np.array([0.0, wa.to_blender(base.joint(co, "pelvis"))[1], low])
        self.co = (p - offset) * self.scale
        self.keys = {name: wa.to_blender(make(n)) * self.scale for name, make in key_mixes(B, B["macro"]).items()}
        self.joints = {bone: (wa.to_blender(base.joint(co, helper)) - offset) * self.scale for bone, helper in JOINTS.items()}
        self.eye = {}
        for s in ("l", "r"):
            centre = (wa.to_blender(base.joint(co, f"{s}-eye")) - offset) * self.scale
            aim = (wa.to_blender(base.joint(co, f"{s}-eye-target")) - offset) * self.scale
            helper = base.groups[f"helper-{s}-eye"]
            radius = np.linalg.norm(self.co[helper] - centre, axis=1).mean()
            self.eye[s] = {"centre": centre, "aim": aim, "radius": radius, "helper": helper}


def heat_weights(name, co, quads, joints):
    """Blender's automatic (bone heat) weights, as an (n, human bones) array."""
    mesh = bpy.data.meshes.new(name + "-heat")
    mesh.from_pydata(co.tolist(), [], quads.tolist())
    obj = bpy.data.objects.new(name + "-heat", mesh)
    bpy.context.scene.collection.objects.link(obj)
    ns = types.SimpleNamespace(name=name + "-heat")
    rig_obj = ww.Model.rig(ns, {k: Vector(v) for k, v in joints.items()})
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    rig_obj.select_set(True)
    bpy.context.view_layer.objects.active = rig_obj
    bpy.ops.object.parent_set(type="ARMATURE_AUTO")
    W = np.zeros((len(co), len(HB)))
    index = {g.index: HI[g.name] for g in obj.vertex_groups if g.name in HI}
    for v in mesh.vertices:
        for g in v.groups:
            if g.group in index:
                W[v.index, index[g.group]] = g.weight
    bpy.data.objects.remove(obj)
    bpy.data.meshes.remove(mesh)
    arm = rig_obj.data
    bpy.data.objects.remove(rig_obj)
    bpy.data.armatures.remove(arm)
    return W


def _chain(p, a, b, c, blend):
    d1 = (b - a) / np.linalg.norm(b - a)
    d2 = (c - b) / np.linalg.norm(c - b)
    n = unit(d1 + d2)
    return wa.smoothstep(-blend, blend, (p - b) @ n)


def _segment_distance(p, a, b):
    ab = b - a
    t = np.clip(((p - a) @ ab) / (ab @ ab), 0.0, 1.0)
    return np.linalg.norm(p - (a + np.outer(t, ab)), axis=1)


def _along(p, a, b):
    d = b - a
    return ((p - a) @ d) / (d @ d)


def fix_weights(W, co, quads, J, nbrs):
    """make_avatar.fix_weights: clean bends along the limbs, the head wholly on Head, the collarbones and
    thighs kept from reaching too far, the trunk smoothed."""
    I = HI
    W = W.copy()
    W[W.sum(1) == 0, I["spine_02"]] = 1.0
    W /= W.sum(1, keepdims=True)
    dominant = W.argmax(1)
    for s in ("l", "r"):
        U, L, Hd = (I[f"{b}_{s}"] for b in ("upperarm", "lowerarm", "hand"))
        S_, E, Wr, T = (J[f"upperarm_{s}"], J[f"lowerarm_{s}"], J[f"hand_{s}"], J[f"hand_{s}.tail"])
        arm = np.isin(dominant, [U, L, Hd]) & (_along(co, S_, E) > 0.05)
        p = co[arm]
        past_elbow = _chain(p, S_, E, Wr, 0.055)
        past_wrist = _chain(p, E, Wr, T, 0.028)
        new = np.zeros((len(p), W.shape[1]))
        new[:, U] = 1 - past_elbow
        new[:, L] = past_elbow * (1 - past_wrist)
        new[:, Hd] = past_elbow * past_wrist
        g = wa.smoothstep(0.18, 0.42, _along(p, S_, E))[:, None]
        W[arm] = g * new + (1 - g) * W[arm]
        TH, CA, FO, BA = (I[f"{b}_{s}"] for b in ("thigh", "calf", "foot", "ball"))
        Hp, K, A, Bl, Bt = (J[f"thigh_{s}"], J[f"calf_{s}"], J[f"foot_{s}"], J[f"ball_{s}"], J[f"ball_{s}.tail"])
        leg = np.isin(dominant, [TH, CA, FO, BA]) & (_along(co, Hp, K) > 0.05)
        p = co[leg]
        past_knee = _chain(p, Hp, K, A, 0.05)
        down = (A - K) / np.linalg.norm(A - K)
        past_ankle = wa.smoothstep(-0.025, 0.03, (p - A) @ down)
        fwd = (Bt - Bl) / np.linalg.norm(Bt - Bl)
        past_ball = wa.smoothstep(-0.012, 0.012, (p - Bl) @ fwd) * past_ankle
        new = np.zeros((len(p), W.shape[1]))
        new[:, TH] = 1 - past_knee
        new[:, CA] = past_knee * (1 - past_ankle)
        new[:, FO] = past_knee * past_ankle * (1 - past_ball)
        new[:, BA] = past_knee * past_ankle * past_ball
        g = wa.smoothstep(0.12, 0.32, _along(p, Hp, K))[:, None]
        W[leg] = g * new + (1 - g) * W[leg]
    head, neck = J["Head"], J["neck_01"]
    chin = np.array([0.0, head[1] - 0.09, head[2] - 0.075])
    n = unit(np.cross(np.array([1.0, 0.0, 0.0]), chin - head))
    if n[2] < 0:
        n = -n
    zone = np.isin(dominant, [I["Head"], I["neck_01"], I["spine_03"]]) & (co[:, 2] > neck[2] - 0.02)
    p = co[zone]
    up = wa.smoothstep(-0.02, 0.025, (p - head) @ n)
    new = W[zone] * (1 - up)[:, None]
    new[:, I["Head"]] += up
    W[zone] = new

    def hand_over(src, dst, keep):
        moved = W[:, src] * (1 - keep)
        W[:, src] -= moved
        W[:, dst] += moved

    for s in ("l", "r"):
        d = _segment_distance(co, J[f"clavicle_{s}"], J[f"upperarm_{s}"])
        hand_over(I[f"clavicle_{s}"], I["spine_03"], wa.smoothstep(0.1, 0.045, d))
        hip = J[f"thigh_{s}"]
        hand_over(I[f"thigh_{s}"], I["pelvis"], wa.smoothstep(hip[2] + 0.07, hip[2] + 0.005, co[:, 2]))
    trunk_bones = [I[b] for b in ("pelvis", "spine_01", "spine_02", "spine_03", "neck_01", "clavicle_l", "clavicle_r")]
    trunk = np.isin(W.argmax(1), trunk_bones).astype(np.float64)
    W = wa.smooth_values(W, nbrs, rounds=14, factor=0.5, mask=trunk)
    changing = ((W > 0.02) & (W < 0.98)).any(1).astype(np.float64)
    changing = wa.smooth_values(changing, nbrs, rounds=3, factor=1.0) > 0
    W = wa.smooth_values(W, nbrs, rounds=4, factor=0.5, mask=changing.astype(np.float64))
    W[W < 0.01] = 0.0
    order = np.argsort(-W, axis=1)
    keep = np.zeros_like(W, dtype=bool)
    np.put_along_axis(keep, order[:, :4], True, axis=1)
    W[~keep] = 0.0
    W /= W.sum(1, keepdims=True)
    return W


def rest_pose(J):
    """The turns taking MakeHuman's pose to the avatar's rest (legs straight under the hips, feet level,
    arms APOSE below level, elbows bent 10 degrees), and the new joints."""
    R = {b: np.eye(3) for b in HB}
    for s, sign in (("l", 1.0), ("r", -1.0)):
        hip, ankle = J[f"thigh_{s}"], J[f"foot_{s}"]
        goal = np.array([hip[0] + sign * 0.012, ankle[1], ankle[2]]) - hip
        R[f"thigh_{s}"] = wa.quat_between(ankle - hip, goal)
        R[f"calf_{s}"] = R[f"thigh_{s}"]
        ball = J[f"ball_{s}"] - ankle
        R[f"foot_{s}"] = wa.quat_between(np.array([ball[0], ball[1], 0.0]), np.array([0.0, -1.0, 0.0]))
        R[f"ball_{s}"] = R[f"foot_{s}"]
        sh, el, wr = J[f"upperarm_{s}"], J[f"lowerarm_{s}"], J[f"hand_{s}"]
        a = math.radians(APOSE)
        up_dir = np.array([sign * math.cos(a), 0.0, -math.sin(a)])
        R[f"upperarm_{s}"] = wa.quat_between(el - sh, up_dir)
        fore_now = R[f"upperarm_{s}"] @ (wr - el)
        fore_goal = up_dir * math.cos(math.radians(10)) + np.array([0, -1.0, 0]) * math.sin(math.radians(10))
        R[f"lowerarm_{s}"] = wa.quat_between(fore_now, fore_goal) @ R[f"upperarm_{s}"]
        R[f"hand_{s}"] = R[f"lowerarm_{s}"]
    new = {}
    for b, parent in ww.BONES:
        new[b] = J[b].copy() if parent is None else new[parent] + R[parent] @ (J[b] - J[parent])
    for k in J:
        if k.endswith(".tail"):
            b = k[: -len(".tail")]
            new[k] = new[b] + R[b] @ (J[k] - J[b])
    return R, new


def lip_faces(base, faces, mouth):
    region = set(wa.face_set("lips_solid").tolist())
    quads = base.quads
    inside = np.array([f for f in faces if f in region])
    outside_verts = set(np.unique(quads[[f for f, m in zip(faces, mouth) if f not in region and not m]]).tolist())
    for _ in range(2):
        rim = np.array([any(int(v) in outside_verts for v in quads[f]) for f in inside])
        outside_verts |= set(np.unique(quads[inside[rim]]).tolist())
        inside = inside[~rim]
    return np.isin(faces, inside)


def mouth_inside(co, quads, lips):
    lip_verts = np.unique(quads[lips])
    mouth = co[lip_verts].mean(0)
    centre = co[quads].mean(1)
    start_point = mouth + np.array([0.0, 0.02, 0.0])
    candidates = np.nonzero((~lips) & (np.linalg.norm(centre - mouth, axis=1) < 0.06))[0]
    start = candidates[np.argmin(np.linalg.norm(centre[candidates] - start_point, axis=1))]
    by_vert = {}
    for f in candidates:
        for v in quads[f]:
            by_vert.setdefault(int(v), []).append(int(f))
    seen = {int(start)}
    todo = [int(start)]
    while todo:
        f = todo.pop()
        for v in quads[f]:
            for g in by_vert.get(int(v), []):
                if g not in seen:
                    seen.add(g)
                    todo.append(g)
    out = np.zeros(len(quads), dtype=bool)
    out[list(seen)] = True
    return out


def nail_faces(base, co_mh, faces):
    """The fingernails (the toes' are found but the paws drop them)."""
    quads = base.quads[faces]
    p = co_mh[quads]
    centre = p.mean(1)
    normal = unit(np.cross(p[:, 2] - p[:, 0], p[:, 3] - p[:, 1]))
    J = lambda n: base.joint(co_mh, n)  # noqa: E731
    out = np.zeros(len(faces), dtype=bool)
    for s in ("l", "r"):
        back = unit(np.cross(J(f"{s}-finger-2-1") - J(f"{s}-finger-5-1"), J(f"{s}-finger-3-1") - J(f"{s}-hand")))
        if s == "r":
            back = -back
        for f in range(1, 6):
            tip, last = J(f"{s}-finger-{f}-4"), J(f"{s}-finger-{f}-3")
            d = unit(tip - last)
            up = back - d * (back @ d)
            if f == 1:
                lateral = J(f"{s}-finger-1-3") - J(f"{s}-finger-2-2")
                lateral -= d * (lateral @ d)
                up = unit(up) + unit(lateral)
            up = unit(up)
            t = (centre - last) @ d
            radial = np.linalg.norm((centre - last) - np.outer(t, d), axis=1)
            seg = np.linalg.norm(tip - last)
            near = (t > seg * 0.3) & (t < seg * 0.97) & (radial < 0.12)
            out |= near & (normal @ up > (0.86 if f > 1 else 0.74)) & ((centre - last) @ up > 0.02)
    touched = np.zeros(len(co_mh), dtype=bool)
    touched[quads[out].ravel()] = True
    out |= touched[quads].all(1)
    return out


def eyeball(body, s, key_names, segments=24):
    """An eyeball facing where MakeHuman's eye target is: (positions, faces, key offsets). Each shape key
    moves and scales it as it moves MakeHuman's eye helper."""
    e = body.eye[s]
    c, r = e["centre"], e["radius"]
    look = unit(e["aim"] - c)
    angles = [0, 7, 14, 22, 30, 36, 46, 60, 76, 94, 115, 140, 165, 180]
    x = unit(np.cross(look, [0, 0, 1.0]))
    z = np.cross(x, look)
    verts, faces = [], []
    for a in angles:
        ar = math.radians(a)
        if a in (0, 180):
            verts.append(c + look * math.cos(ar) * r)
            continue
        for j in range(segments):
            t = 2 * math.pi * j / segments
            verts.append(c + (look * math.cos(ar) + (x * math.cos(t) + z * math.sin(t)) * math.sin(ar)) * r)
    verts = np.array(verts)
    ring = lambda i: 1 + (i - 1) * segments  # noqa: E731
    n_rings = len(angles) - 2
    last = len(verts) - 1
    for j in range(segments):
        faces.append([0, ring(1) + j, ring(1) + (j + 1) % segments])
    for i in range(1, n_rings):
        for j in range(segments):
            a, b = ring(i) + j, ring(i) + (j + 1) % segments
            faces.append([a, ring(i + 1) + j, ring(i + 1) + (j + 1) % segments, b])
    for j in range(segments):
        faces.append([ring(n_rings) + j, last, ring(n_rings) + (j + 1) % segments])
    keys = {}
    helper = e["helper"]
    for name in key_names:
        moved = body.co[helper] + body.keys[name][helper]
        c2 = moved.mean(0)
        r2 = np.linalg.norm(moved - c2, axis=1).mean()
        keys[name] = (c2 + (verts - c) * (r2 / r)) - verts
    return verts, faces, keys


def lashes(B, base, body, key_names):
    """MakeHuman's own lash strips (made for its lids, moved by its targets as the lids are), with
    texture coordinates along (u) and from root to tip (v): [(positions, faces, uvs per corner, keys)]."""
    out = []
    for s in ("l", "r"):
        centre = body.eye[s]["centre"]
        for group, upper in ((f"helper-{s}-eyelashes-2", True), (f"helper-{s}-eyelashes-1", False)):
            faces = base.faces_of(group)
            quads = base.quads[faces]
            verts = np.unique(quads)
            remap = {int(v): i for i, v in enumerate(verts)}
            uv = base.uv[base.quad_uv[faces]]
            pts = uv.reshape(-1, 2)
            A = np.c_[2 * pts, np.ones(len(pts))]
            cx, cy, _ = np.linalg.lstsq(A, (pts**2).sum(1), rcond=None)[0]
            rel = uv - np.array([cx, cy])
            radius = np.linalg.norm(rel, axis=2)
            angle = np.unwrap(np.arctan2(rel[..., 1], rel[..., 0]).ravel()).reshape(radius.shape)
            norm = lambda a: (a - a.min()) / (a.max() - a.min())  # noqa: E731
            uv = np.stack([norm(angle), norm(radius)], axis=2)
            dist = np.linalg.norm(body.co[quads] - centre, axis=2)
            if dist[uv[..., 1] < 0.3].mean() > dist[uv[..., 1] > 0.7].mean():
                uv[..., 1] = 1 - uv[..., 1]
            points = body.co[verts]
            at_root = {int(v): c[0] for f, q in zip(uv, quads) for c, v in zip(f, q) if c[1] < 0.15}
            line = body.co[sorted(at_root, key=at_root.get)]
            nearest = line[np.argmin(np.linalg.norm(points[:, None] - line[None], axis=2), axis=1)]
            # (Short lashes: a wolf's are; the woman's a little longer.)
            points = nearest + (points - nearest) * (0.55 if B["female"] else 0.4)
            kk = {k: body.keys[k][verts] for k in key_names}
            out.append((points, [[remap[int(v)] for v in q] for q in quads], uv, kk, upper))
    return out


def human(B):
    """The human avatar `B` (HUMAN_MALE or HUMAN_FEMALE) in its rest pose, as make_avatar.make builds it
    up to the head's subdivision: the skin (positions, quads, shape keys, bone weights; which faces are
    lips, nails and the mouth's inside), its joints and eyes, and its underwear."""
    base = wa.Base()
    body = Body(B, base)
    key_names = list(body.keys)
    bf = body.body_faces
    used = np.unique(base.quads[bf])
    remap = -np.ones(len(base.co), dtype=np.int64)
    remap[used] = np.arange(len(used))
    quads = remap[base.quads[bf]]
    co = body.co[used]
    nbrs = wa.vertex_neighbours(len(co), quads)
    J = body.joints
    W = heat_weights(B["name"], co, quads, J)
    W = fix_weights(W, co, quads, J, nbrs)
    R, J2 = rest_pose(J)
    rots = [R[b] for b in HB]
    heads = [J[b] for b in HB]
    new_heads = [J2[b] for b in HB]
    posed = wa.skin(co, W, rots, heads, new_heads)
    posed_keys = {k: wa.skin(body.keys[k][used], W, rots, heads, new_heads, deltas=True) for k in key_names}
    low, high = posed[:, 2].min(), posed[:, 2].max()
    s = B["height"] / (high - low)
    shift = np.array([0.0, 0.0, low])
    body.co = (body.co - shift) * s
    body.co[used] = (posed - shift) * s
    for k in key_names:
        body.keys[k] = body.keys[k] * s
        body.keys[k][used] = posed_keys[k] * s
    J = {k: (v - shift) * s for k, v in J2.items()}
    body.joints = J
    for e in body.eye.values():
        e["centre"] = (e["centre"] - shift) * s
        e["aim"] = (e["aim"] - shift) * s
        e["radius"] *= s
    co = body.co[used]
    mouth = mouth_inside(co, quads, np.isin(bf, wa.face_set("lips_solid")))
    lips = lip_faces(base, bf, mouth)
    nails = nail_faces(base, body.co_mh, bf)
    keys = {k: body.keys[k][used] for k in key_names}
    co = smooth_private(B, co, J, nbrs)
    Wn = np.zeros((len(co), NB))
    Wn[:, : W.shape[1]] = W
    return {"base": base, "body": body, "co": co, "quads": quads, "W": Wn, "keys": keys, "J": J, "lips": lips, "nails": nails, "mouth": mouth}


# ── Underwear (make_avatar.py's garments, copied as they were at 0.7.42: each style a mesh of its own,
# hung on the finished body with its fur, so it follows every key and pose as the body does) ──────────

GARMENT_CLOTH, GARMENT_TRIM = 0, 1  # each garment face's material: the cloth, or its band and straps


class Part:
    def __init__(self, co, faces, mat, uv, keys, weights):
        self.co, self.faces, self.mat, self.uv, self.keys, self.weights = co, faces, mat, uv, keys, weights


# ── Underwear: each style a mesh of its own ──────────────────────────────────────────────────────────
#
# Every style is built the same way: the skin's faces where it goes, lifted off the skin (a smoothing
# that doesn't shrink, then pushed back out wherever the skin comes closer than the fabric's distance, so
# it lies over hollows as cloth does), cut along smooth fields (a waistline, leg openings, a neckline,
# straps), given rolled edges with the fabric's thickness and a raised elastic band, and hung on the skin:
# each vertex takes the weights and shape key offsets of the skin's nearest point, so it follows every
# key and pose as the skin under it does. Seams, stitches, ribbing and the knit are in its own texture.

FABRIC = 0.0021  # a knit's thickness (metres)
BAND = 0.0034  # an elastic band's
SKIN_GAP = 0.0006  # what's left between the skin and the fabric's inside


def _unit(v):
    v = np.asarray(v, dtype=np.float64)
    return v / np.linalg.norm(v)


class Skin:
    """The finished skin as a surface to measure from: nearest points, normals, weights and keys."""

    def __init__(self, co, faces, W, keys):
        self.co, self.W, self.keys, self.faces = co, W, keys, faces
        self.keyed = {}
        self.tris = np.array([(f[0], f[i], f[i + 1]) for f in faces for i in range(1, len(f) - 1)])
        self.bvh = BVHTree.FromPolygons(co.tolist(), self.tris.tolist())
        a, b, c = (co[self.tris[:, i]] for i in range(3))
        fn = np.cross(b - a, c - a)
        vn = np.zeros_like(co)
        for i in range(3):
            np.add.at(vn, self.tris[:, i], fn)
        self.vn = vn / np.maximum(np.linalg.norm(vn, axis=1, keepdims=True), 1e-12)
        # (Normals smoothed over a few centimetres, to push cloth out along: they point straight out of
        # small hollows such as the navel instead of across them.)
        sn = wa.smooth_values(self.vn, _neighbours(len(co), [list(f) for f in faces]), rounds=12, factor=0.8)
        self.sn = sn / np.maximum(np.linalg.norm(sn, axis=1, keepdims=True), 1e-12)

    def nearest(self, P, smooth=False):
        loc = np.zeros_like(P)
        tri = np.zeros(len(P), dtype=np.int64)
        for i, p in enumerate(P):
            hit, _, t, _ = self.bvh.find_nearest(Vector(p))
            loc[i] = hit
            tri[i] = t
        bary = np.clip(wa.bary_attach(self.tris, self.co, tri, loc), 0.0, 1.0)
        bary /= np.maximum(bary.sum(1, keepdims=True), 1e-9)
        tv = self.tris[tri]
        n = ((self.sn if smooth else self.vn)[tv] * bary[:, :, None]).sum(1)
        n /= np.linalg.norm(n, axis=1, keepdims=True)
        return loc, n, tv, bary

    def clear(self, P, gap):
        """Points pushed out from the skin to at least `gap` (per point) along its smoothed normal."""
        loc, n, _, _ = self.nearest(P, smooth=True)
        d = ((P - loc) * n).sum(1)
        return P + n * np.maximum(gap - d, 0.0)[:, None]

    def attach(self, P, key_names):
        """Weights (four strongest) and shape key offsets of the skin's nearest point to each point."""
        _, _, tv, bary = self.nearest(P)
        W = (self.W[tv] * bary[:, :, None]).sum(1)
        order = np.argsort(-W, axis=1)
        keep = np.zeros_like(W, dtype=bool)
        np.put_along_axis(keep, order[:, :4], True, axis=1)
        W[~keep | (W < 0.01)] = 0.0
        W /= W.sum(1, keepdims=True)
        loc, n, _, _ = self.nearest(P)
        rest = np.clip(((P - loc) * n).sum(1), SKIN_GAP * 0.8, 0.003)
        keys = {}
        for k in key_names:
            d = (self.keys[k][tv] * bary[:, :, None]).sum(1)
            if np.abs(self.keys[k]).max() > 1e-6 and np.abs(d).max() > 1e-6:
                # (Each key checked on its own: wherever the keyed skin comes closer than the fabric was,
                # the fabric is pushed out with it, so a fuller body doesn't show through.)
                if k not in self.keyed:
                    self.keyed[k] = Skin(self.co + self.keys[k], self.faces, self.W, {})
                d = self.keyed[k].clear(P + d, rest) - P
            keys[k] = d
        return W, keys


class Frame:
    """Body landmarks the garments are drawn from (the body at rest, Blender's space: +x its left, -y
    its front, +z up)."""

    def __init__(self, B, co, J):
        self.female = B["female"]
        self.J = J
        self.pel = J["pelvis"][2]
        mid = (np.abs(co[:, 0]) < 0.006) & (co[:, 2] > J["thigh_l"][2] - 0.3) & (co[:, 2] < J["pelvis"][2])
        self.crotch = co[mid, 2].min()
        # The trunk's middle (front to back) at each height, smoothed: what the angle round it is about.
        trunk = np.abs(co[:, 0]) < 0.06
        self.zs = np.arange(0.5, 1.8, 0.01)
        yc = []
        for z in self.zs:
            b = trunk & (np.abs(co[:, 2] - z) < 0.02)
            front, back = b & (co[:, 1] < -0.02), b & (co[:, 1] > 0.0)
            yc.append((co[front, 1].min() + co[back, 1].max()) / 2 if front.any() and back.any() else np.nan)
        yc = np.array(yc)
        ok = ~np.isnan(yc)
        yc = np.interp(self.zs, self.zs[ok], yc[ok])
        self.yc = np.convolve(np.pad(yc, 5, mode="edge"), np.ones(11) / 11, mode="valid")
        chest = (co[:, 0] > 0.04) & (co[:, 0] < 0.16) & (co[:, 2] > J["spine_02"][2]) & (co[:, 2] < J["spine_03"][2] + 0.06)
        self.apex = co[chest][np.argmin(co[chest, 1])]
        self.legs = {}
        for s, n in ((1.0, "l"), (-1.0, "r")):
            H, K = J[f"thigh_{n}"], J[f"calf_{n}"]
            d = _unit(K - H)
            f0 = _unit(np.array([0.0, -1.0, 0.0]) - d * (-d[1]))
            s0 = np.cross(d, f0)
            if s0[0] * s < 0:
                s0 = -s0
            self.legs[s] = (H, d, f0, s0)

    def phi(self, p):
        """The angle round the trunk: 0 in front, +-pi/2 at the sides, +-pi behind."""
        yc = np.interp(p[:, 2], self.zs, self.yc)
        return np.arctan2(np.abs(p[:, 0]), -(p[:, 1] - yc))

    def leg(self, p):
        """Each point's distance down its own thigh from the hip joint, and its angle round the thigh (0 in
        front, +pi/2 outside, -pi/2 inside, +-pi behind)."""
        t = np.zeros(len(p))
        th = np.zeros(len(p))
        for s in (1.0, -1.0):
            sel = (p[:, 0] >= 0) if s > 0 else (p[:, 0] < 0)
            H, d, f0, s0 = self.legs[s]
            r = p[sel] - H
            t[sel] = r @ d
            th[sel] = np.arctan2(r @ s0, r @ f0)
        return t, th

    def waist(self, curve):
        """Inside below a waistline z = curve(phi)."""
        return lambda p: curve(self.phi(p)) - p[:, 2]

    def leg_openings(self, curve):
        """Inside above the leg openings: t = curve(angle round the thigh)."""

        def f(p):
            t, th = self.leg(p)
            return curve(th) - t

        return f


def iso_cut(bm, field, delete):
    """Cuts the mesh along field = 0 (an edge loop exactly there) and, if `delete`, removes the faces where
    it's below 0. (The field goes in as each vertex's x for bmesh's plane cut, the real position riding along
    in a shape layer that the cut interpolates.) Returns the cut's vertices."""
    real = bm.verts.layers.shape.get("real") or bm.verts.layers.shape.new("real")
    verts = list(bm.verts)
    P = np.array([v.co[:] for v in verts])
    val = field(P)
    # (A vertex within a hair of the line is put on it, so no sliver faces are made.)
    near = np.abs(val) < 0.0012
    if near.any():
        g = np.zeros((near.sum(), 3))
        q = P[near]
        for i in range(3):
            d = np.zeros(3)
            d[i] = 0.0005
            g[:, i] = (field(q + d) - field(q - d)) / 0.001
        P[near] = q - g * (val[near] / np.maximum((g * g).sum(1), 1e-9))[:, None]
        val[near] = 0.0
    for v, p, a in zip(verts, P, val):
        v[real] = Vector(p)
        v.co = Vector((a, p[1], p[2]))
    bmesh.ops.bisect_plane(bm, geom=list(bm.verts) + list(bm.edges) + list(bm.faces), plane_co=(0, 0, 0), plane_no=(1, 0, 0), dist=1e-7)
    cut = [v for v in bm.verts if abs(v.co.x) < 1e-6]
    dead = [f for f in bm.faces if sum(v.co.x for v in f.verts) < 0] if delete else []
    for v in bm.verts:
        v.co = v[real]
    if dead:
        bmesh.ops.delete(bm, geom=dead, context="FACES")
        bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context="VERTS")
    return [v for v in cut if v.is_valid]


def _neighbours(n, faces):
    """Each vertex's neighbours along polygon edges, in wwavatar's (indices, starts) form."""
    a = np.array([v for f in faces for v in f])
    b = np.array([w for f in faces for w in f[1:] + f[:1]])
    pairs = np.unique(np.stack([np.concatenate([a, b]), np.concatenate([b, a])], axis=1), axis=0)
    starts = np.searchsorted(pairs[:, 0], np.arange(n + 1))
    return pairs[:, 1], starts


def _tidy(bm, island=40, hole=16):
    """Drops stray bits a cut leaves (islands under `island` faces) and fills small holes."""
    seen = set()
    for f in list(bm.faces):
        if f in seen:
            continue
        group, todo = [], [f]
        seen.add(f)
        while todo:
            g = todo.pop()
            group.append(g)
            for e in g.edges:
                for h in e.link_faces:
                    if h not in seen:
                        seen.add(h)
                        todo.append(h)
        if len(group) < island:
            bmesh.ops.delete(bm, geom=group, context="FACES")
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context="VERTS")
    bm.verts.index_update()
    edges = [e for e in bm.edges if e.is_boundary]
    for run in wa.chains([(e.verts[0].index, e.verts[1].index) for e in edges]):
        if len(run) <= hole:
            vs = set(run)
            small = [e for e in edges if e.verts[0].index in vs and e.verts[1].index in vs]
            made = bmesh.ops.holes_fill(bm, edges=small, sides=hole)
            bmesh.ops.triangulate(bm, faces=made["faces"])


def _ribbon(bm, line, width, thick, skin, mat_layer, strap_layer, step=0.005):
    """A strap: a flat band with rounded edges laid along a line over the skin, its ends tucked under the
    garment it's sewn to."""
    seg = np.linalg.norm(np.diff(line, axis=0), axis=1)
    s = np.concatenate([[0], np.cumsum(seg)])
    t = np.linspace(0, s[-1], max(int(s[-1] / step), 2))
    pts = np.stack([np.interp(t, s, line[:, i]) for i in range(3)], axis=1)
    loc, n, _, _ = skin.nearest(pts, smooth=True)
    tang = np.gradient(pts, axis=0)
    tang /= np.linalg.norm(tang, axis=1, keepdims=True)
    side = np.cross(tang, n)
    side /= np.linalg.norm(side, axis=1, keepdims=True)
    n = np.cross(side, tang)
    centre = loc + n * (SKIN_GAP * 2.5 + thick / 2)
    hw, hh = width / 2, thick / 2
    profile = [(-hw, 0.0), (-hw + hh * 0.7, hh), (hw - hh * 0.7, hh), (hw, 0.0), (hw - hh * 0.7, -hh), (-hw + hh * 0.7, -hh)]
    rings = []
    pts = np.array([c + b * x + up * y for c, b, up in zip(centre, side, n) for x, y in profile])
    # (Nothing of it closer to the skin than the gap: a flat strap over a rounded shoulder would dip in.)
    pts = skin.clear(pts, np.full(len(pts), SKIN_GAP * 2)).reshape(len(centre), len(profile), 3)
    for ring_pts in pts:
        ring = [bm.verts.new(q) for q in ring_pts]
        for v, (x, _) in zip(ring, profile):
            v[strap_layer] = hw - abs(x)
        rings.append(ring)
    made = []
    k = len(profile)
    for r0, r1 in zip(rings[:-1], rings[1:]):
        for j in range(k):
            made.append(bm.faces.new((r0[j], r1[j], r1[(j + 1) % k], r0[(j + 1) % k])))
    made.append(bm.faces.new(rings[0][::-1]))
    made.append(bm.faces.new(rings[-1]))
    bmesh.ops.recalc_face_normals(bm, faces=made)
    for f in made:
        f[mat_layer] = GARMENT_TRIM


class Garment:
    """One underwear style: its mesh as a Part, its name, and what its texture needs (fields for its
    edges, band, hems and seams)."""

    def __init__(self, name, part, spec):
        self.name, self.part, self.spec = name, part, spec


def build_garment(name, spec, base, skin, key_names):
    co0, quads0, nrm0, arms0 = base
    keep = spec["keep"]
    vals = keep(co0)
    z0, z1 = spec["zone"]
    zone = (co0[:, 2] > z0) & (co0[:, 2] < z1) & (arms0 < 0.5)
    fsel = (vals[quads0].max(1) > -0.04) & zone[quads0].all(1)
    vids = np.unique(quads0[fsel])
    remap = -np.ones(len(co0), dtype=np.int64)
    remap[vids] = np.arange(len(vids))
    q = remap[quads0[fsel]]
    # Subdivided once all over (Catmull-Clark), and again near its edges and bands, where the cuts go.
    apply, faces, _ = wa.subdivide_region(co0[vids], q, np.ones(len(q), dtype=bool))
    P = apply(co0[vids])
    q = np.array(faces)
    near = np.abs(keep(P)) < 0.014
    apply, faces, _ = wa.subdivide_region(P, q, near[q].any(1))
    P = apply(P)
    gap = spec["gap"](P)
    P = skin.clear(P, gap)
    nb = _neighbours(len(P), faces)
    edges = {}
    for f in faces:
        for a, b in zip(f, f[1:] + f[:1]):
            k = (a, b) if a < b else (b, a)
            edges[k] = edges.get(k, 0) + 1
    free = np.ones(len(P))
    free[[v for k, c in edges.items() if c == 1 for v in k]] = 0.0
    for _ in range(spec.get("relax", 3)):
        P = wa.taubin(P, nb, spec.get("smooth", 4), free)
        P = skin.clear(P, gap)
    q = faces

    bm = bmesh.new()
    for p in P:
        bm.verts.new(p)
    bm.verts.ensure_lookup_table()
    for f in q:
        bm.faces.new([bm.verts[i] for i in f])
    iso_cut(bm, keep, delete=True)
    _tidy(bm)
    trim = spec.get("trim")
    hem = spec.get("hem", 0.0)
    if hem:
        iso_cut(bm, lambda p: keep(p) - hem, delete=False)
    if trim is not None:
        iso_cut(bm, trim, delete=False)
        iso_cut(bm, lambda p: trim(p) + 0.0018, delete=False)
    for extra in spec.get("loops", []):
        iso_cut(bm, extra, delete=False)
    bm.verts.ensure_lookup_table()
    bm.faces.ensure_lookup_table()
    P = np.array([v.co[:] for v in bm.verts])
    centres = np.array([f.calc_center_median()[:] for f in bm.faces])
    is_trim = trim(centres) > 0 if trim is not None else np.zeros(len(centres), dtype=bool)
    mat_layer = bm.faces.layers.int.new("mat")
    for f, t in zip(list(bm.faces), is_trim):
        f[mat_layer] = GARMENT_TRIM if t else GARMENT_CLOTH
    # Thickness: the band stands out from the fabric, a hem a little; the outer face sits at the fabric's
    # thickness off the skin (plus the gap), and nothing comes closer than that.
    bm.normal_update()
    N = np.array([v.normal[:] for v in bm.verts])
    lift = np.zeros(len(P))
    if trim is not None:
        lift += (BAND - FABRIC) * wa.smoothstep(-0.0018, 0.0, trim(P))
    if hem:
        lift = np.maximum(lift, 0.0006 * wa.smoothstep(hem + 0.0012, hem, keep(P)))
    P = P + N * lift[:, None]
    gap_now = spec["gap"](P) + lift
    P = skin.clear(P, gap_now)
    for v, p in zip(bm.verts, P):
        v.co = Vector(p)
    bm.normal_update()

    # Rolled edges: each open edge curls under to the fabric's inside, then a short turn-in lies under it.
    boundary = [e for e in bm.edges if e.is_boundary]
    bm.verts.index_update()
    bm.verts.ensure_lookup_table()
    edge_runs = [np.array([bm.verts[i].co[:] for i in run]) for run in wa.chains([(e.verts[0].index, e.verts[1].index) for e in boundary])]
    if trim is not None:
        thick = {v: (BAND if trim(np.array([v.co[:]]))[0] > -0.001 else FABRIC) for e in boundary for v in e.verts}
    else:
        thick = {v: FABRIC for e in boundary for v in e.verts}
    rings = {}
    for v in {v for e in boundary for v in e.verts}:
        n = v.normal.copy()
        es = [e for e in v.link_edges if e.is_boundary]
        t = Vector((0, 0, 0))
        for e2 in es:
            o = e2.other_vert(v)
            d = v.co - o.co
            t += d.normalized() if t.dot(d) >= 0 else -d.normalized()
        if t.length < 1e-9:
            continue
        t.normalize()
        out = t.cross(n)
        inner = sum((f.calc_center_median() for f in v.link_faces), Vector()) / max(len(v.link_faces), 1)
        if out.dot(v.co - inner) < 0:
            out = -out
        out = (out - n * out.dot(n)).normalized()
        h = thick[v]
        c = v.co - n * (h * 0.5)
        ring = []
        for a in (90, 180):
            r = math.radians(a)
            ring.append(c + n * (h * 0.5 * math.cos(r)) + out * (h * 0.5 * math.sin(r)))
        ring.append(v.co - n * h - out * 0.004)
        rings[v] = [bm.verts.new(p) for p in ring]
    for e in boundary:
        a, b = e.verts
        if a not in rings or b not in rings:
            continue
        f = e.link_faces[0]
        loop = next(lp for lp in f.loops if lp.edge == e)
        if loop.vert != a:
            a, b = b, a
        prev_a, prev_b = a, b
        for ra, rb in zip(rings[a], rings[b]):
            nf = bm.faces.new((prev_b, prev_a, ra, rb))
            nf[mat_layer] = f[mat_layer]
            prev_a, prev_b = ra, rb
    strap_layer = bm.verts.layers.float.new("strap")
    for v in bm.verts:
        v[strap_layer] = -9.0
    for line, width in spec.get("ribbons", []):
        _ribbon(bm, line, width, BAND * 0.6, skin, mat_layer, strap_layer)
    bm.verts.index_update()
    mat = [f[mat_layer] for f in bm.faces]
    P = np.array([v.co[:] for v in bm.verts])
    faces = [[v.index for v in f.verts] for f in bm.faces]
    strap = np.array([v[strap_layer] for v in bm.verts])
    bm.free()
    W, keys = skin.attach(P, key_names)
    # (Offsets under 0.15 mm dropped: invisible, and the export then stores only the vertices that move.)
    for k in keys:
        keys[k][np.linalg.norm(keys[k], axis=1) < 0.00015] = 0.0
    part = Part(P, faces, mat, None, keys, W)
    g = Garment(name, part, spec)
    g.attrs = garment_attrs(spec, P, strap, edge_runs)
    log(f"{name}: {len(P)} vertices")
    return g


def garment_attrs(spec, P, strap, runs):
    """What the texture needs at each vertex (baked across the faces): the distance in from the edge, the
    band's field (above 0 in the band; 2 on a strap), the distance from the nearest seam, and how far along
    the nearest edge and seam it is (for stitches)."""
    edge = np.clip(wa.metric(spec["keep"])(P), -0.05, 0.2)
    trim = np.clip(spec["trim"](P), -0.2, 0.2) if spec.get("trim") is not None else np.full(len(P), -0.2)
    seam_d = np.full(len(P), 0.2)
    seam_ph = np.zeros(len(P))
    for field, phase, mask in spec.get("seams", []):
        d = np.abs(wa.metric(field)(P))
        d = np.where(mask(P), d, 0.2)
        closer = d < seam_d
        seam_d[closer] = d[closer]
        seam_ph[closer] = phase(P)[closer]
    # Along the edges: each loop's length so far at its nearest point.
    edge_ph = np.zeros(len(P))
    pts, arc, tan = [], [], []
    for run in runs:
        seg = np.diff(run, axis=0)
        L = np.concatenate([[0.0], np.cumsum(np.linalg.norm(seg, axis=1))])
        t = np.gradient(run, axis=0)
        t /= np.maximum(np.linalg.norm(t, axis=1, keepdims=True), 1e-9)
        pts.append(run)
        arc.append(L)
        tan.append(t)
    if pts:
        pts, arc, tan = np.concatenate(pts), np.concatenate(arc), np.concatenate(tan)
        tree = KDTree(len(pts))
        for i, q in enumerate(pts):
            tree.insert(q, i)
        tree.balance()
        geo = np.zeros(len(P))
        for i, q in enumerate(P):
            _, j, _ = tree.find(q)
            rel = q - pts[j]
            along = rel @ tan[j]
            edge_ph[i] = arc[j] + along
            geo[i] = np.linalg.norm(rel - tan[j] * along)
        # (The distance in from the edge measured from the edge itself, not from the field it was cut
        # along, which bends where two lines of the cut join.)
        edge = np.where(edge > 0.0015, geo, edge)
        if spec.get("edge_band"):
            trim = np.where(trim > -0.19, spec["edge_band"] - edge, trim)
    on_strap = strap > -1
    edge[on_strap] = strap[on_strap]
    trim[on_strap] = 2.0
    return np.stack([edge, trim, seam_d, edge_ph, seam_ph], axis=1)


def garment_specs(B, F, skin):
    """Each style's fields for this body, by its mesh's name (underwear-bottom-..., underwear-top-...)."""
    S = {}
    pel, cz = F.pel, F.crotch
    female = F.female
    M = wa.metric
    per = wa.periodic
    smin, smax = wa.smin, wa.smax
    hip = F.J["thigh_l"][2]
    yc = lambda p: np.interp(p[:, 2], F.zs, F.yc)  # noqa: E731
    # Where stitches run along a seam: round the body, down it, or down a leg.
    around = lambda p: F.phi(p) * 0.16  # noqa: E731
    down = lambda p: p[:, 2]  # noqa: E731
    along_leg = lambda p: F.leg(p)[0]  # noqa: E731
    front = lambda p: p[:, 1] < yc(p)  # noqa: E731
    back = lambda p: p[:, 1] >= yc(p)  # noqa: E731

    def bottoms(waist_pts, leg_pts, band, loose=None, binding=False, extra=None, seams=(), gap=0.0028):
        waist = M(F.waist(per(waist_pts, mirror=True)))
        legs = M(F.leg_openings(per(leg_pts)))
        if extra is None:
            keep = lambda p: smin(waist(p), legs(p), 0.012)  # noqa: E731
        else:
            keep = lambda p: smax(smin(waist(p), legs(p), 0.012), extra(p), 0.006)  # noqa: E731
        if binding:
            mk = M(keep)
            trim = lambda p: band - mk(p)  # noqa: E731
        else:
            trim = lambda p: band - waist(p)  # noqa: E731

        def g(p):
            out = np.full(len(p), gap + SKIN_GAP)
            return out + loose(p) if loose is not None else out

        spec = {"keep": keep, "trim": trim, "gap": g, "zone": (hip - 0.4, pel + 0.2), "binding": binding, "seams": list(seams)}
        if binding:
            spec["edge_band"] = band
        return spec

    # His pouch: a soft rise over the groin, the cloth lying over it.
    def pouch(amount):
        zc = cz + 0.05

        def f(p):
            dx = p[:, 0] / 0.042
            dz = (p[:, 2] - zc) / np.where(p[:, 2] > zc, 0.06, 0.045)
            return amount * np.exp(-(dx * dx + dz * dz) * 1.4) * wa.smoothstep(0.02, -0.06, p[:, 1])

        return f

    # Loose legs (boxers): standing off the thigh more towards the hem, least on the inside.
    def loose_legs(amount, at_waist=0.004):
        def f(p):
            t, th = F.leg(p)
            leg = wa.smoothstep(-0.02, 0.2, t)
            # (Least on the inside of the thigh, where the legs nearly meet.)
            inside = (0.5 - 0.5 * np.cos(th + np.pi / 2)) ** 1.5
            body = wa.smoothstep(pel + 0.05, pel - 0.06, p[:, 2])
            # (Soft folds hanging down the legs: woven cotton doesn't cling.)
            folds = 0.5 + 0.5 * wa.fbm(p * np.array([1.0, 1.0, 0.3]), 16.0, 2, seed=41)
            return at_waist + body * inside * (amount * (0.35 + 0.65 * leg) + 0.009 * folds * wa.smoothstep(0.0, 0.12, t))

        return f

    side_seam = (lambda p: (F.phi(p) - np.pi / 2) * 0.16, down, lambda p: p[:, 2] > hip - 0.02)
    inseam = (lambda p: (F.leg(p)[1] + np.pi / 2) * 0.08, along_leg, lambda p: F.leg(p)[0] > 0.09)
    back_seam = (lambda p: p[:, 0], down, back)
    gusset_front = (lambda p: p[:, 2] - (cz + 0.035), around, lambda p: front(p) & (np.abs(p[:, 0]) < 0.06))
    fly = (lambda p: p[:, 0] - 0.012, down, lambda p: front(p) & (p[:, 2] > cz + 0.03))

    if not female:
        S["underwear-bottom-briefs"] = bottoms(
            [(0, pel + 0.05), (45, pel + 0.055), (90, pel + 0.066), (135, pel + 0.082), (180, pel + 0.088)],
            [(0, 0.022), (40, -0.002), (90, -0.012), (140, 0.035), (180, 0.088), (-140, 0.105), (-90, 0.098), (-45, 0.075)],
            band=0.03,
            loose=pouch(0.010),
            seams=[side_seam],
        )
        S["underwear-bottom-boxer_briefs"] = bottoms(
            [(0, pel + 0.055), (90, pel + 0.07), (180, pel + 0.09)],
            [(0, 0.2), (90, 0.185), (180, 0.205), (-90, 0.215)],
            band=0.036,
            loose=pouch(0.011),
            seams=[inseam, back_seam],
        )
        S["underwear-bottom-boxers"] = bottoms(
            [(0, pel + 0.065), (90, pel + 0.078), (180, pel + 0.095)],
            [(0, 0.215), (90, 0.2), (180, 0.225), (-90, 0.23)],
            band=0.036,
            loose=lambda p: loose_legs(0.024)(p) + pouch(0.006)(p),
            seams=[side_seam, inseam, back_seam, fly],
        )
        S["underwear-bottom-boxers"].update(smooth=6, relax=4, woven=True)
    else:
        S["underwear-bottom-briefs"] = bottoms(
            [(0, pel + 0.055), (90, pel + 0.065), (180, pel + 0.08)],
            [(0, 0.05), (45, 0.0), (90, -0.03), (135, 0.02), (180, 0.085), (-135, 0.098), (-90, 0.09), (-45, 0.07)],
            band=0.011,
            binding=True,
            seams=[gusset_front],
        )
        S["underwear-bottom-bikini"] = bottoms(
            [(0, pel + 0.015), (90, pel + 0.03), (180, pel + 0.045)],
            [(0, 0.035), (45, -0.012), (90, -0.022), (135, 0.0), (180, 0.062), (-135, 0.092), (-90, 0.088), (-45, 0.066)],
            band=0.009,
            binding=True,
            seams=[gusset_front],
        )

        # The thong's back: a narrow strip down the middle, a little wider where it meets the band and
        # the gusset.
        waist_thong = per([(0, pel + 0.015), (90, pel + 0.03), (180, pel + 0.04)], mirror=True)

        def strip(p):
            top = waist_thong(F.phi(p))
            w = 0.011 + 0.032 * wa.smoothstep(top - 0.045, top, p[:, 2]) + 0.018 * wa.smoothstep(cz + 0.05, cz, p[:, 2])
            strip_part = np.where(back(p) | (p[:, 2] < cz + 0.03), w / 2 - np.abs(p[:, 0]), -0.05)
            strip_part = np.minimum(strip_part, p[:, 2] - (cz - 0.006))
            string = np.where(back(p), 0.009 - (top - p[:, 2]), -0.05)
            return np.maximum(strip_part, string)

        S["underwear-bottom-thong"] = bottoms(
            [(0, pel + 0.015), (90, pel + 0.03), (180, pel + 0.04)],
            [(0, 0.035), (45, -0.012), (90, -0.022), (135, -0.12), (180, -0.15), (-150, -0.12), (-115, 0.06), (-90, 0.088), (-45, 0.066)],
            band=0.008,
            binding=True,
            extra=lambda p: smin(strip(p), M(F.waist(waist_thong))(p), 0.004),
            seams=[gusset_front],
        )
        S["underwear-bottom-boyshorts"] = bottoms(
            [(0, pel + 0.035), (90, pel + 0.045), (180, pel + 0.062)],
            [(0, 0.115), (90, 0.098), (180, 0.13), (-90, 0.125)],
            band=0.012,
            binding=True,
            seams=[side_seam, gusset_front],
        )
        S["underwear-bottom-boxer_briefs"] = bottoms(
            [(0, pel + 0.045), (90, pel + 0.055), (180, pel + 0.07)],
            [(0, 0.17), (90, 0.16), (180, 0.175), (-90, 0.18)],
            band=0.03,
            seams=[inseam, back_seam, gusset_front],
        )
        S["underwear-bottom-boxers"] = bottoms(
            [(0, pel + 0.05), (90, pel + 0.06), (180, pel + 0.075)],
            [(0, 0.17), (90, 0.16), (180, 0.18), (-90, 0.185)],
            band=0.03,
            loose=loose_legs(0.02),
            seams=[side_seam, inseam, back_seam],
        )
        S["underwear-bottom-boxers"].update(smooth=6, relax=4, woven=True)
        S.update(tops(F, skin))
    for spec in S.values():
        spec.setdefault("hem", 0.0)
    return S


def strap_line(skin, points, gap=0.0035):
    """A strap's middle line over the skin: control points joined smoothly (Catmull-Rom), every few
    millimetres laid onto the skin (its nearest point, `gap` out)."""
    pts = np.array(points, dtype=np.float64)
    dense = []
    for i in range(len(pts) - 1):
        a, b = pts[i], pts[i + 1]
        p0 = pts[max(i - 1, 0)]
        p3 = pts[min(i + 2, len(pts) - 1)]
        for t in np.linspace(0, 1, 24, endpoint=False):
            dense.append(0.5 * ((2 * a) + (-p0 + b) * t + (2 * p0 - 5 * a + 4 * b - p3) * t * t + (-p0 + 3 * a - 3 * b + p3) * t**3))
    dense.append(pts[-1])
    dense = np.array(dense)
    for _ in range(3):
        loc, n, _, _ = skin.nearest(dense, smooth=True)
        dense = loc + n * gap
        # (Evened out along its length, its ends held: a strap pulls straight between where it lies.)
        inner = dense.copy()
        for _ in range(20):
            inner[1:-1] = inner[1:-1] * 0.5 + (inner[:-2] + inner[2:]) * 0.25
        dense = inner
    return dense


def tops(F, skin):
    """Her tops: a moulded bra, a sports bra and a bralette."""
    S = {}
    M = wa.metric
    per = wa.periodic
    smin, smax = wa.smin, wa.smax
    A = F.apex
    zf = A[2] - 0.072  # where the breast meets the ribs
    yc = lambda p: np.interp(p[:, 2], F.zs, F.yc)  # noqa: E731
    down = lambda p: p[:, 2]  # noqa: E731
    neck = F.J["neck_01"][2]
    shoulder = neck - 0.026  # the top of the shoulder where a strap crosses it

    def lines_of(ends):
        return [strap_line(skin, [(x * sgn, y, z) for x, y, z in ends]) for sgn in (1.0, -1.0)]

    def straps(width, ends):
        """A pair of straps as a field, from the left one's control points (the right mirrors it)."""
        lines = lines_of(ends)

        def f(p):
            d = np.minimum(*(wa.polyline_distance(p, line)[0] for line in lines))
            return width / 2 - d

        return f

    def g(amount):
        return lambda p: np.full(len(p), amount + SKIN_GAP)

    # The moulded bra: smooth cups meeting at a low centre gore, a band under them all round, straps.
    z_bot = zf - 0.022
    zb1 = z_bot
    back_top = z_bot + 0.034
    top_c = per([(0, A[2] - 0.02), (12, A[2] + 0.004), (24, A[2] + 0.04), (32, A[2] + 0.064), (48, A[2] + 0.05), (75, A[2] + 0.0), (98, A[2] - 0.035), (122, back_top), (180, back_top)], mirror=True)
    top = M(lambda p: top_c(F.phi(p)) - p[:, 2])
    bra_straps = lines_of([(0.081, -0.13, A[2] + 0.052), (0.083, -0.13, A[2] + 0.07), (0.092, -0.075, A[2] + 0.13), (0.095, -0.02, shoulder), (0.093, 0.04, A[2] + 0.15), (0.09, 0.085, back_top + 0.06), (0.088, 0.09, back_top - 0.012)])
    seam_c = per([(0, z_bot + 0.022), (20, zf - 0.006), (40, zf - 0.004), (70, zf + 0.004), (100, back_top + 0.01), (180, back_top + 0.01)], mirror=True)
    cup_seam = M(lambda p: seam_c(F.phi(p)) - p[:, 2])
    S["underwear-top-bra"] = {
        "keep": lambda p: smin(top(p), p[:, 2] - zb1, 0.008),
        "trim": cup_seam,
        "ribbons": [(line, 0.011) for line in bra_straps],
        "gap": g(0.0034),
        "zone": (z_bot - 0.06, neck + 0.05),
        "smooth": 10,
        "relax": 6,
        "seams": [(lambda p: p[:, 0], down, lambda p: (p[:, 1] < yc(p)) & (p[:, 2] > z_bot + 0.02))],
        "band_stitches": (0.0028,),
        "binding": True,
    }

    # The sports bra: a scoop front, wide straps meeting in a racer back, a deep band.
    z_bot = zf - 0.03
    top_c2 = per([(0, A[2] + 0.05), (25, A[2] + 0.085), (45, A[2] + 0.07), (72, A[2] + 0.005), (98, A[2] - 0.04), (125, z_bot + 0.07), (155, z_bot + 0.085), (180, z_bot + 0.11)], mirror=True)
    top2 = M(lambda p: top_c2(F.phi(p)) - p[:, 2])
    racer = straps(0.034, [(0.062, -0.1, A[2] + 0.075), (0.07, -0.06, A[2] + 0.14), (0.075, -0.01, shoulder + 0.004), (0.06, 0.05, A[2] + 0.15), (0.025, 0.085, A[2] + 0.07), (0.0, 0.09, z_bot + 0.1)])
    zb2 = z_bot
    S["underwear-top-sports_bra"] = {
        "keep": lambda p: smax(smin(top2(p), p[:, 2] - zb2, 0.01), racer(p), 0.012),
        "trim": lambda p: (zb2 + 0.04) - p[:, 2],
        "gap": g(0.0034),
        "zone": (z_bot - 0.06, neck + 0.05),
        "smooth": 16,
        "relax": 7,
        "seams": [(lambda p: (F.phi(p) - np.pi * 0.55) * 0.15, down, lambda p: p[:, 2] > zb2 + 0.04)],
    }

    # The bralette: soft triangles over each breast, a band, thin straps straight down the back.
    z_bot = zf - 0.012
    z_band = z_bot + 0.028
    T = np.array([0.086, A[2] + 0.068])
    Bi = np.array([0.012, z_band])
    Bo = np.array([0.118, z_band - 0.004])

    def side(p, a, b):
        q = np.stack([np.abs(p[:, 0]), p[:, 2]], axis=1)
        d = _unit(b - a)
        return (q - a) @ np.array([-d[1], d[0]])

    zb3, zband3 = z_bot, z_band

    def tri(p):
        inner = -side(p, Bi, T)
        outer = side(p, Bo, T)
        return smin(smin(smin(inner, outer, 0.006), p[:, 2] - zb3, 0.004), (yc(p) - p[:, 1]) - 0.01, 0.01)

    band = lambda p: np.minimum(p[:, 2] - zb3, zband3 - p[:, 2])  # noqa: E731
    thin = lines_of([(T[0] - 0.002, -0.12, T[1] - 0.016), (T[0], -0.12, T[1] - 0.004), (0.09, -0.075, A[2] + 0.13), (0.094, -0.02, shoulder), (0.093, 0.04, A[2] + 0.15), (0.09, 0.085, z_band + 0.05), (0.089, 0.09, z_band - 0.012)])
    S["underwear-top-bralette"] = {
        "keep": lambda p: smax(band(p), tri(p), 0.004),
        "trim": lambda p: band(p) + 0.0005,
        "ribbons": [(line, 0.009) for line in thin],
        "gap": g(0.003),
        "zone": (z_bot - 0.06, neck + 0.05),
        "smooth": 3,
        "relax": 3,
        "hem_stitches": (0.0035,),
        "band_stitches": (),
        "binding": True,
    }
    return S


def garments(B, base, skin, F, key_names):
    out = []
    for name, spec in garment_specs(B, F, skin).items():
        out.append(build_garment(name, spec, base, skin, key_names))
    return out


def smooth_private(B, co, J, nbrs):
    """The body kept plain where clothes would cover it: the crease MakeHuman's woman has between the legs
    smoothed away, and her nipples flattened to the breast's curve, so nothing shows
    with no underwear on, nor through it."""
    mask = np.zeros(len(co))
    if B["female"]:
        mid = (np.abs(co[:, 0]) < 0.006) & (co[:, 2] > J["thigh_l"][2] - 0.3) & (co[:, 2] < J["pelvis"][2])
        low = co[mid][np.argmin(co[mid, 2])]
        centre = np.array([0.0, low[1] - 0.012, low[2] + 0.028])
        mask = np.maximum(mask, wa.smoothstep(0.055, 0.02, np.linalg.norm((co - centre) * np.array([1.0, 1.0, 0.8]), axis=1)))
    for sgn in (1.0, -1.0) if B["female"] else ():
        chest = (co[:, 0] * sgn > 0.03) & (co[:, 0] * sgn < 0.17) & (co[:, 2] > J["spine_02"][2]) & (co[:, 2] < J["spine_03"][2] + 0.06)
        apex = co[chest][np.argmin(co[chest, 1])]
        mask = np.maximum(mask, wa.smoothstep(0.042, 0.014, np.linalg.norm(co - apex, axis=1)))
    # (More smoothing than the human's: under fur and a fitted bra a nipple would still show.)
    out = wa.smooth_values(co, nbrs, rounds=90, factor=0.5, mask=mask)
    return wa.taubin(out, nbrs, 6, mask)


# ── The underwear's texture (make_avatar.py's) ─────────────────────────────────────────────────────


def _image(name, size, float_buffer=True, alpha=True):
    image = bpy.data.images.new(name, size, size, alpha=alpha, float_buffer=float_buffer)
    if float_buffer:
        image.colorspace_settings.name = "Non-Color"
    return image


def _pixels(image):
    a = np.empty(image.size[0] * image.size[1] * 4, dtype=np.float32)
    image.pixels.foreach_get(a)
    return a.reshape(image.size[1], image.size[0], 4)


def _blur(a, radius):
    """A soft box blur (three passes) of a 2D array, `radius` texels."""
    if radius < 1:
        return a
    out = a
    for _ in range(3):
        c = np.cumsum(np.pad(out, ((radius + 1, radius), (0, 0)), mode="edge"), axis=0)
        out = (c[2 * radius + 1 :] - c[: -2 * radius - 1]) / (2 * radius + 1)
        c = np.cumsum(np.pad(out, ((0, 0), (radius + 1, radius)), mode="edge"), axis=1)
        out = (c[:, 2 * radius + 1 :] - c[:, : -2 * radius - 1]) / (2 * radius + 1)
    return out


def _dilate(a, covered, rounds=10):
    """Fills the texels next to covered ones with their covered neighbours' average, `rounds` deep."""
    a = a.copy()
    have = covered.copy()
    for _ in range(rounds):
        acc = np.zeros_like(a)
        cnt = np.zeros(have.shape)
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (1, -1), (-1, 1), (-1, -1)):
            acc += np.roll(np.roll(a * have[..., None], dy, 0), dx, 1)
            cnt += np.roll(np.roll(have, dy, 0), dx, 1)
        grow = (~have) & (cnt > 0)
        a[grow] = acc[grow] / cnt[grow][:, None]
        have = have | grow
    return a


def _soft(ao, covered):
    """Occlusion without lone dark specks (kept within reach of its neighbourhood's) and softened, each
    island first grown past its edge so the softening doesn't pull its border towards the background (a
    light line at every seam of the layout)."""
    ao = _dilate(np.where(covered, ao, 1.0)[..., None], covered, 14)[..., 0]
    ao = np.maximum(ao, _blur(ao, 6) - 0.12)
    return _blur(ao, 2)


def garment_uvs(wear, key_names):
    """The garments' texture coordinates: unwrapped together and packed into their own texture."""
    objs = []
    for g in wear:
        p = g.part
        mesh = bpy.data.meshes.new(g.name + "-uv")
        mesh.from_pydata(p.co.tolist(), [], p.faces)
        obj = bpy.data.objects.new(g.name + "-uv", mesh)
        bpy.context.scene.collection.objects.link(obj)
        objs.append(obj)
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.smart_project(angle_limit=math.radians(70), island_margin=0.004)
    bpy.ops.uv.pack_islands(rotate=True, margin=0.004)
    bpy.ops.object.mode_set(mode="OBJECT")
    for g, o in zip(wear, objs):
        uvl = o.data.uv_layers.active.data
        g.part.uv = [[tuple(uvl[li].uv) for li in poly.loop_indices] for poly in o.data.polygons]
        me = o.data
        bpy.data.objects.remove(o)
        bpy.data.meshes.remove(me)


def _emit_material(name, image, build):
    """A material that emits what `build(nodes, links)` returns into its Emission, baking into image."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nodes, links = m.node_tree.nodes, m.node_tree.links
    for n in list(nodes):
        if n.type != "OUTPUT_MATERIAL":
            nodes.remove(n)
    out = next(n for n in nodes if n.type == "OUTPUT_MATERIAL")
    shader = nodes.new("ShaderNodeEmission")
    sock = build(nodes, links)
    if isinstance(sock, tuple):
        shader.inputs["Color"].default_value = sock
    else:
        links.new(sock, shader.inputs["Color"])
    links.new(shader.outputs[0], out.inputs["Surface"])
    tex = nodes.new("ShaderNodeTexImage")
    tex.image = image
    nodes.active = tex
    return m


def bake_garments(objs, occluder, size):
    """For every texel of the garments' texture: where it is on the body at rest, its normal, which garment
    (red: index + 1 over 64), and how tucked in it is (each garment's occlusion with the body there, not
    the other garments)."""
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    if scene.world is None:
        scene.world = bpy.data.worlds.new("World")
    maps = {}

    def position(nodes, links):
        geo = nodes.new("ShaderNodeNewGeometry")
        add = nodes.new("ShaderNodeVectorMath")
        add.operation = "MULTIPLY_ADD"
        links.new(geo.outputs["Position"], add.inputs[0])
        add.inputs[1].default_value = (0.5, 0.5, 0.5)
        add.inputs[2].default_value = (0.5, 0.5, 0.0)
        return add.outputs["Vector"]

    def normal(nodes, links):
        geo = nodes.new("ShaderNodeNewGeometry")
        add = nodes.new("ShaderNodeVectorMath")
        add.operation = "MULTIPLY_ADD"
        links.new(geo.outputs["Normal"], add.inputs[0])
        add.inputs[1].default_value = (0.5, 0.5, 0.5)
        add.inputs[2].default_value = (0.5, 0.5, 0.5)
        return add.outputs["Vector"]

    saved = {o: [s.material for s in o.material_slots] for o in objs}

    def select(group):
        bpy.ops.object.select_all(action="DESELECT")
        for o in group:
            o.select_set(True)
        bpy.context.view_layer.objects.active = group[0]

    def attr(name, offset):
        def build(nodes, links):
            a = nodes.new("ShaderNodeAttribute")
            a.attribute_name = name
            add = nodes.new("ShaderNodeVectorMath")
            add.operation = "ADD"
            links.new(a.outputs["Vector"], add.inputs[0])
            add.inputs[1].default_value = (offset, offset, offset)
            return add.outputs["Vector"]

        return build

    for kind in ("position", "normal", "id", "ww1", "ww2", "ao"):
        image = _image(f"gbake-{kind}", size)
        for i, o in enumerate(objs):
            if kind == "position":
                m = _emit_material(f"gb-{kind}-{i}", image, position)
            elif kind == "normal":
                m = _emit_material(f"gb-{kind}-{i}", image, normal)
            elif kind == "id":
                m = _emit_material(f"gb-{kind}-{i}", image, lambda n, l, i=i: ((i + 1) / 64, 0.0, 0.0, 1.0))
            elif kind in ("ww1", "ww2"):
                m = _emit_material(f"gb-{kind}-{i}", image, attr(kind, 0.5 if kind == "ww1" else 0.0))
            else:
                m = bpy.data.materials.new(f"gb-ao-{i}")
                m.use_nodes = True
                tex = m.node_tree.nodes.new("ShaderNodeTexImage")
                tex.image = image
                m.node_tree.nodes.active = tex
            for slot in o.material_slots:
                slot.material = m
        if kind == "ao":
            scene.cycles.samples = 64
            scene.world.light_settings.distance = 0.1
            for i, o in enumerate(objs):
                for other in objs:
                    other.hide_render = other is not o
                select([o])
                bpy.ops.object.bake(type="AO", margin=8, use_clear=(i == 0))
            for other in objs:
                other.hide_render = False
        else:
            scene.cycles.samples = 1
            occluder.hide_render = True
            select(objs)
            bpy.ops.object.bake(type="EMIT", margin=8, use_clear=True)
            occluder.hide_render = False
        maps[kind] = _pixels(image)
        log(f"garments baked {kind}")
    for o, mats in saved.items():
        for slot, m in zip(o.material_slots, mats):
            slot.material = m
    return maps


def normal_from_height(pos, nrm, covered, height):
    """A tangent-space normal map (0..1 RGB) from a height map in metres: the surface's own position map
    gives its directions per texel, so the bumps come out at their true size (texel rows run up the
    texture, as Blender stores it)."""

    ok = covered.copy()

    def d(a, axis):
        fwd, bwd = np.roll(a, -1, axis), np.roll(a, 1, axis)
        # (A neighbour counts if it's covered and lies next to this texel on the body too, not across a
        # seam in the texture's layout; a texel without both is left flat.)
        cf = np.roll(covered, -1, axis) & (np.linalg.norm(np.roll(pos, -1, axis) - pos, axis=-1) < 0.002)
        cb = np.roll(covered, 1, axis) & (np.linalg.norm(np.roll(pos, 1, axis) - pos, axis=-1) < 0.002)
        ok[:] &= cf & cb
        if a.ndim == 3:
            cf, cb = cf[..., None], cb[..., None]
        num = np.where(cf, fwd, a) - np.where(cb, bwd, a)
        den = cf.astype(np.float64) + cb.astype(np.float64)
        return num / np.maximum(den, 1.0)

    N = nrm / np.maximum(np.linalg.norm(nrm, axis=-1, keepdims=True), 1e-9)
    Pu, Pv = d(pos, 1), d(pos, 0)
    hu, hv = d(height, 1), d(height, 0)
    det = (N * np.cross(Pu, Pv)).sum(-1)
    det = np.where(np.abs(det) < 1e-12, 1e-12, det)
    g = (hu[..., None] * np.cross(Pv, N) + hv[..., None] * np.cross(N, Pu)) / det[..., None]
    # (Flat where the texture's layout is too squeezed to measure, and never tipped more than ~35 degrees.)
    sq = np.abs(det) / np.maximum(np.linalg.norm(Pu, axis=-1) * np.linalg.norm(Pv, axis=-1), 1e-12)
    g = np.where((ok & (sq > 0.3))[..., None], g, 0.0)
    gl = np.linalg.norm(g, axis=-1, keepdims=True)
    g = g * np.minimum(1.0, 0.7 / np.maximum(gl, 1e-9))
    n2 = N - g
    n2 /= np.maximum(np.linalg.norm(n2, axis=-1, keepdims=True), 1e-9)
    T = Pu - N * (N * Pu).sum(-1, keepdims=True)
    T /= np.maximum(np.linalg.norm(T, axis=-1, keepdims=True), 1e-12)
    Bt = np.cross(N, T)
    Bt *= np.where((Bt * Pv).sum(-1) < 0, -1.0, 1.0)[..., None]
    out = np.stack([(n2 * T).sum(-1), (n2 * Bt).sum(-1), (n2 * N).sum(-1)], axis=-1)
    out = np.where(covered[..., None], out, np.array([0.0, 0.0, 1.0]))
    out = _dilate(out, covered)
    return np.clip(out * 0.5 + 0.5, 0, 1)


def _stitches(dist, at, phase, length=0.0028, width=0.00042):
    """A row of stitches `at` metres along a distance field, each `length` long with small gaps: 0..1."""
    across = np.exp(-(((dist - at) / width) ** 2))
    f = np.mod(phase / length, 1.0)
    along = wa.smoothstep(0.0, 0.12, f) * wa.smoothstep(1.0, 0.82, f)
    return across * along


def paint_garments(wear, maps, F, size):
    """The garments' texture (near white: shading and detail, the colour is the material's) and their height
    map (metres): a fine knit (a plain weave for woven boxers), ribbed elastic, seams with their stitching,
    hems stitched twice under a fold, a few soft gathers under a band, and occlusion where the cloth is
    tucked in. The distances it's drawn from are each vertex's, baked across the faces."""
    gid = np.rint(maps["id"][..., 0] * 64).astype(np.int64) - 1
    pos = (maps["position"][..., :3] - np.array([0.5, 0.5, 0.0])) * 2
    nrm = maps["normal"][..., :3] * 2 - 1
    ww1 = maps["ww1"][..., :3] - 0.5
    ww2 = maps["ww2"][..., :3]
    ao = maps["ao"][..., 0]
    covered = gid >= 0
    ao = _soft(ao, covered)
    rgb = np.full((size, size), 0.9)
    height = np.zeros((size, size))
    for i, g in enumerate(wear):
        sel = covered & (gid == i)
        if not sel.any():
            continue
        sp = g.spec
        p = pos[sel]
        edge, trim, seam_d = ww1[sel, 0], ww1[sel, 1], ww1[sel, 2]
        edge_ph, seam_ph = ww2[sel, 0], ww2[sel, 1]
        strap = trim > 1.0
        in_band = (trim > 0) & ~strap
        col = np.full(len(p), 0.965)
        h = np.zeros(len(p))
        if sp.get("woven"):
            # A plain cotton weave: fine slubs along the threads and a soft unevenness.
            weave = wa.value_noise(p * np.array([1.0, 1.0, 6.0]), 700.0, seed=31) * 0.6 + wa.value_noise(p * np.array([4.0, 4.0, 1.0]), 700.0, seed=32) * 0.4
            h += 0.00004 * weave
            col *= 1 + 0.03 * weave + 0.015 * wa.fbm(p, 60.0, 2, seed=33)
        else:
            knit = wa.value_noise(p * np.array([1.0, 1.0, 2.2]), 1300.0, seed=11)
            h += 0.00003 * knit + 0.000015 * wa.value_noise(p, 420.0, seed=12)
            col *= 1 + 0.015 * knit + 0.01 * wa.fbm(p, 90.0, 2, seed=13)
        # Elastic: fine upright ribs on a band; a strap smooth with a stitched line near each side.
        phi = F.phi(p)
        rib = np.sin(2 * np.pi * phi * 0.16 / 0.0022)
        if not sp.get("binding"):
            h += np.where(in_band, 0.0001 * rib, 0.0)
            col *= np.where(in_band, 1 + 0.02 * rib, 1.0)
        # Where a band meets the cloth: a seam line, and the cover stitch over it.
        band_seam = np.exp(-((trim / 0.0006) ** 2)) * ~strap
        h -= 0.00025 * band_seam
        col *= 1 - 0.06 * band_seam
        st = np.zeros(len(p))
        for at in sp.get("band_stitches", (-0.0028, -0.0058)):
            st = np.maximum(st, _stitches(trim, at, edge_ph if sp.get("binding") else phi * 0.16) * ~strap)
        # A hem: the edge folded under and stitched twice; on a binding, once inside it.
        hem_rows = sp.get("hem_stitches", (0.006, 0.009) if not sp.get("binding") else ())
        for at in hem_rows:
            st = np.maximum(st, _stitches(edge, at, edge_ph) * (trim < -0.004))
        if hem_rows:
            fold = np.exp(-(((edge - (max(hem_rows) + 0.002)) / 0.0007) ** 2)) * (trim < -0.004)
            h -= 0.00012 * fold
        st = np.maximum(st, _stitches(edge, 0.0016, edge_ph, length=0.0024, width=0.00032) * strap)
        # Seams: a slight groove with a flat stitch either side.
        groove = np.exp(-((seam_d / 0.0005) ** 2)) * (trim < 0)
        h -= 0.0003 * groove
        col *= 1 - 0.1 * groove
        st = np.maximum(st, _stitches(seam_d, 0.0017, seam_ph) * (trim < 0))
        h += 0.0002 * st
        col *= 1 - 0.14 * st
        # A few soft gathers just under an elastic band.
        if sp.get("trim") is not None and not sp.get("binding"):
            below = np.maximum(-trim, 0)
            gather = np.sin(2 * np.pi * phi * 0.16 / 0.014 + 2.5 * wa.fbm(p, 25.0, 2, seed=14)) * np.exp(-below / 0.007) * (trim < 0)
            h += 0.00022 * gather
        # Soft folds: more on loose woven cloth.
        amount = 0.0007 if sp.get("woven") else 0.00012
        folds = wa.fbm(p * np.array([1.0, 1.0, 0.4]), 18.0, 3, seed=15)
        h += amount * folds
        rgb[sel] = col
        height[sel] = h
    shade = 0.45 + 0.55 * ao
    rgb = np.clip(rgb * shade, 0, 1)
    rgb = _dilate(rgb[..., None], covered)[..., 0]
    normal = normal_from_height(pos, nrm, covered, height)
    return np.repeat(rgb[..., None], 3, axis=2), normal


# ── A mesh as arrays ─────────────────────────────────────────────────────────────────────────────────


class Mesh:
    """Positions (n, 3), faces (lists of vertex indices), each face's part, shape key offsets {name: (n, 3)},
    bone weights (n, bones) and named per-vertex values (`tags`)."""

    def __init__(self, co, faces, fmat, keys, W, tags=None):
        self.co = np.asarray(co, dtype=np.float64)
        self.faces = [list(map(int, f)) for f in faces]
        self.fmat = np.asarray(fmat, dtype=np.int64)
        self.keys = {k: np.asarray(v, dtype=np.float64) for k, v in keys.items()}
        self.W = np.asarray(W, dtype=np.float64)
        self.tags = {k: np.asarray(v) for k, v in (tags or {}).items()}

    def __len__(self):
        return len(self.co)

    def add(self, other):
        n = len(self.co)
        self.co = np.concatenate([self.co, other.co])
        self.faces += [[i + n for i in f] for f in other.faces]
        self.fmat = np.concatenate([self.fmat, other.fmat])
        for k in self.keys:
            self.keys[k] = np.concatenate([self.keys[k], other.keys.get(k, np.zeros_like(other.co))])
        for k, v in other.keys.items():
            if k not in self.keys:
                self.keys[k] = np.concatenate([np.zeros((n, 3)), v])
        self.W = np.concatenate([self.W, other.W])
        for k in set(self.tags) | set(other.tags):
            a = self.tags.get(k, np.zeros(n, dtype=other.tags[k].dtype if k in other.tags else np.float64))
            b = other.tags.get(k, np.zeros(len(other.co), dtype=a.dtype))
            self.tags[k] = np.concatenate([a, b])
        return n

    def append_vertices(self, co, keys=None, W=None, tags=None):
        """New vertices (their key offsets, weights and tags given or zero): their indices."""
        co = np.asarray(co, dtype=np.float64).reshape(-1, 3)
        n0 = len(self.co)
        self.co = np.concatenate([self.co, co])
        for k in self.keys:
            self.keys[k] = np.concatenate([self.keys[k], (keys or {}).get(k, np.zeros_like(co))])
        self.W = np.concatenate([self.W, W if W is not None else np.zeros((len(co), self.W.shape[1]))])
        for k in self.tags:
            self.tags[k] = np.concatenate([self.tags[k], (tags or {}).get(k, np.zeros(len(co), dtype=self.tags[k].dtype))])
        return np.arange(n0, n0 + len(co))

    def delete_faces(self, mask):
        """Drops the faces in `mask` and any vertex left without a face."""
        keep = [f for f, m in zip(self.faces, mask) if not m]
        self.fmat = self.fmat[~np.asarray(mask)]
        used = np.zeros(len(self.co), dtype=bool)
        for f in keep:
            used[f] = True
        self.compact(used, keep)

    def compact(self, used, faces=None):
        remap = -np.ones(len(self.co), dtype=np.int64)
        remap[used] = np.arange(int(used.sum()))
        self.faces = [[int(remap[i]) for i in f] for f in (faces if faces is not None else self.faces)]
        self.co = self.co[used]
        self.keys = {k: v[used] for k, v in self.keys.items()}
        self.W = self.W[used]
        self.tags = {k: v[used] for k, v in self.tags.items()}
        return remap

    def centres(self):
        return np.array([self.co[f].mean(0) for f in self.faces])

    def edges(self):
        e = set()
        for f in self.faces:
            for i in range(len(f)):
                a, b = f[i], f[(i + 1) % len(f)]
                e.add((a, b) if a < b else (b, a))
        return np.array(sorted(e), dtype=np.int64)

    def normals(self):
        n = np.zeros_like(self.co)
        for f in self.faces:
            p = self.co[f]
            c = p.mean(0)
            for i in range(len(f)):
                n[f[i]] += np.cross(p[i] - c, p[(i + 1) % len(f)] - c)
        return unit(n)

    def boundary_loops(self, faces_mask=None):
        """The open edges' loops (each an ordered list of vertices, wound as their faces are)."""
        nxt = {}
        count = {}
        for fi, f in enumerate(self.faces):
            if faces_mask is not None and not faces_mask[fi]:
                continue
            for i in range(len(f)):
                a, b = f[i], f[(i + 1) % len(f)]
                key = (a, b) if a < b else (b, a)
                count[key] = count.get(key, 0) + 1
                nxt[(a, b)] = True
        heads = {}
        for (a, b) in nxt:
            key = (a, b) if a < b else (b, a)
            if count[key] == 1:
                heads[a] = b
        loops = []
        while heads:
            start, _ = next(iter(heads.items()))
            loop = [start]
            v = heads.pop(start)
            while v != start and v in heads:
                loop.append(v)
                v = heads.pop(v)
            loops.append(loop)
        return loops


def neighbour_mean(n, edges, values):
    acc = np.zeros_like(values)
    cnt = np.zeros(n)
    np.add.at(acc, edges[:, 0], values[edges[:, 1]])
    np.add.at(acc, edges[:, 1], values[edges[:, 0]])
    np.add.at(cnt, edges[:, 0], 1)
    np.add.at(cnt, edges[:, 1], 1)
    return acc / np.maximum(cnt, 1).reshape((-1,) + (1,) * (values.ndim - 1))


# ── A smooth warp of space through matching points ──────────────────────────────────────────────────


class Warp:
    """A thin-plate spline in 3D (kernel r) taking each point src[i] to dst[i], smooth in between, with
    `smooth` easing it towards a looser fit (keep it small: the kernel's values are distances)."""

    def __init__(self, src, dst, smooth=0.0):
        src = np.asarray(src, dtype=np.float64)
        dst = np.asarray(dst, dtype=np.float64)
        n = len(src)
        K = np.linalg.norm(src[:, None] - src[None], axis=2) + smooth * np.eye(n)
        P = np.c_[np.ones(n), src]
        A = np.zeros((n + 4, n + 4))
        A[:n, :n] = K
        A[:n, n:] = P
        A[n:, :n] = P.T
        b = np.zeros((n + 4, 3))
        b[:n] = dst - src
        sol = np.linalg.solve(A, b)
        self.src, self.w, self.a = src, sol[:n], sol[n:]

    def offset(self, p):
        p = np.asarray(p, dtype=np.float64)
        out = np.empty_like(p)
        for i in range(0, len(p), 4096):
            q = p[i : i + 4096]
            K = np.linalg.norm(q[:, None] - self.src[None], axis=2)
            out[i : i + 4096] = K @ self.w + np.c_[np.ones(len(q)), q] @ self.a
        return out


# ── Growing a tube out of the surface (the ears, the tail) ──────────────────────────────────────────


def cut_patch(mesh, centre, normal, radii, frame):
    """Removes the faces whose centres lie inside an ellipse (radii along `frame`'s two axes) round
    `centre` on the side `normal` faces: one connected patch (the one nearest the centre), clear of any
    hole already there. Returns the new hole's boundary loop (vertex indices), wound as its faces are."""
    c = mesh.centres()
    d = c - centre
    e1, e2 = frame
    u = d @ e1 / radii[0]
    v = d @ e2 / radii[1]
    near = (u * u + v * v < 1.0) & (np.abs(d @ normal) < 0.04)
    # (Not touching an existing hole, so the cut opens a hole of its own.)
    edge_use = {}
    for f in mesh.faces:
        for i in range(len(f)):
            key = (min(f[i], f[(i + 1) % len(f)]), max(f[i], f[(i + 1) % len(f)]))
            edge_use[key] = edge_use.get(key, 0) + 1
    on_hole = np.zeros(len(mesh.co), dtype=bool)
    for (a_, b_), n in edge_use.items():
        if n == 1:
            on_hole[[a_, b_]] = True
    near &= np.array([not on_hole[f].any() for f in mesh.faces])
    if not near.any():
        dist = np.linalg.norm(d, axis=1)
        dist[[on_hole[f].any() for f in mesh.faces]] = np.inf
        near[int(np.argmin(dist))] = True
    # One patch: the faces reached from the one nearest the centre through shared edges.
    idx = np.nonzero(near)[0]
    start = idx[np.argmin(np.linalg.norm(d[idx], axis=1))]
    by_edge = {}
    for f in idx:
        F_ = mesh.faces[f]
        for i in range(len(F_)):
            key = (min(F_[i], F_[(i + 1) % len(F_)]), max(F_[i], F_[(i + 1) % len(F_)]))
            by_edge.setdefault(key, []).append(f)
    seen, todo = {int(start)}, [int(start)]
    while todo:
        f = todo.pop()
        F_ = mesh.faces[f]
        for i in range(len(F_)):
            key = (min(F_[i], F_[(i + 1) % len(F_)]), max(F_[i], F_[(i + 1) % len(F_)]))
            for g in by_edge[key]:
                if g not in seen:
                    seen.add(g)
                    todo.append(g)
    patch = np.zeros(len(mesh.faces), dtype=bool)
    patch[list(seen)] = True
    loops_before = len(mesh.boundary_loops())
    mesh.delete_faces(patch)
    loops = mesh.boundary_loops()
    assert len(loops) == loops_before + 1, "the cut should open one hole"
    return min(loops, key=lambda L: np.linalg.norm(mesh.co[L].mean(0) - centre))


def grow(mesh, loop, frame, ring, steps, fmat, weights, keys=None):
    """Closes the hole `loop` with a tube grown out of it: `steps` rings, each with as many points as the
    loop, from `ring(s, angles)` (s from 0 at the loop to 1 at the last ring; angles round `frame`'s
    axis, (e1, e2, axis), measured from e1 towards e2), then a fan to the last ring's centre. The rings'
    angles start as the loop's own and even out by halfway. `weights(points)` and `keys(points)` give the
    new vertices' weights and shape key offsets. Returns the new vertices, ring by ring (the tip last)."""
    L = np.array(loop)
    n = len(L)
    e1, e2, axis = frame
    c0 = mesh.co[L].mean(0)
    d = mesh.co[L] - c0
    ang = np.unwrap(np.arctan2(d @ e2, d @ e1))
    sign = 1.0 if ang[-1] > ang[0] else -1.0
    even = ang[0] + sign * 2 * np.pi * np.arange(n) / n
    new, prev = [], L
    for k in range(1, steps + 1):
        s = k / steps
        a = ang + (even - ang) * smoothstep(0.0, 0.5, s)
        pts = np.asarray(ring(s, a))
        idx = mesh.append_vertices(pts, keys=keys(pts) if keys else None, W=weights(pts))
        faces = [[prev[(j + 1) % n], prev[j], idx[j], idx[(j + 1) % n]] for j in range(n)]
        mesh.faces += faces
        mesh.fmat = np.concatenate([mesh.fmat, np.full(len(faces), fmat)])
        new.append(idx)
        prev = idx
    tip = mesh.co[prev].mean(0)[None]
    t = mesh.append_vertices(tip, keys=keys(tip) if keys else None, W=weights(tip))[0]
    faces = [[prev[(j + 1) % n], prev[j], t] for j in range(n)]
    mesh.faces += faces
    mesh.fmat = np.concatenate([mesh.fmat, np.full(len(faces), fmat)])
    new.append(np.array([t]))
    return new


def to_object(name, mesh, key_names, uv=None):
    me = bpy.data.meshes.new(name)
    me.from_pydata(mesh.co.tolist(), [], mesh.faces)
    if uv is not None:
        # (Set before the mesh is validated, so any face it drops takes its own corners with it.)
        me.uv_layers.new(name="UVMap").data.foreach_set("uv", np.array([c for f in uv for c in f], dtype=np.float64).ravel())
        me.attributes.new("fmat", "INT", "FACE").data.foreach_set("value", mesh.fmat.tolist())
    me.validate()
    if uv is not None:
        fm = np.zeros(len(me.polygons), dtype=np.int64)
        me.attributes["fmat"].data.foreach_get("value", fm)
        mesh = Mesh(mesh.co, [list(p.vertices) for p in me.polygons], fm, mesh.keys, mesh.W)
        me.attributes.remove(me.attributes["fmat"])
    me.polygons.foreach_set("material_index", mesh.fmat.tolist())
    me.polygons.foreach_set("use_smooth", [True] * len(mesh.faces))
    me.update()
    obj = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(obj)
    if key_names:
        obj.shape_key_add(name="Basis", from_mix=False)
        for k in key_names:
            sk = obj.shape_key_add(name=k, from_mix=False)
            sk.data.foreach_set("co", (mesh.co + mesh.keys[k]).ravel())
            sk.slider_min, sk.slider_max = 0.0, 1.0
            sk.value = 0.0
    groups = [obj.vertex_groups.new(name=b) for b in BONE_NAMES]
    W = mesh.W
    for b, g in enumerate(groups):
        col = np.round(W[:, b], 3)
        for value in np.unique(col[col > 0]):
            g.add(np.nonzero(col == value)[0].tolist(), float(value), "REPLACE")
    return obj


def limit_weights(W, keep=4):
    W = W.copy()
    W[W < 0.01] = 0.0
    order = np.argsort(-W, axis=1)
    np.put_along_axis(W, order[:, keep:], 0.0, axis=1)
    s = W.sum(1, keepdims=True)
    return W / np.maximum(s, 1e-9)


# ── The texture: baked maps, painted fur, a normal map, the materials ───────────────────────────────


def unwrap(obj, scale_faces=None, margin=0.003):
    """Texture coordinates for the whole mesh (Blender's smart projection), with the faces in
    `scale_faces` (a mask) given `scale` times their share, then packed."""
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.smart_project(angle_limit=math.radians(70), island_margin=0.0, area_weight=0.0)
    bpy.ops.uv.average_islands_scale()
    if scale_faces is not None:
        mask, scale = scale_faces
        bm = bmesh.from_edit_mesh(obj.data)
        uv = bm.loops.layers.uv.active
        for face in bm.faces:
            if mask[face.index]:
                for loop in face.loops:
                    loop[uv].uv *= scale
        bmesh.update_edit_mesh(obj.data)
    bpy.ops.uv.pack_islands(rotate=True, margin=margin)
    bpy.ops.object.mode_set(mode="OBJECT")


def set_materials(mesh, materials):
    """Replaces a mesh's materials, keeping each face's material index (clearing the list drops them)."""
    idx = np.zeros(len(mesh.polygons), dtype=np.int32)
    mesh.polygons.foreach_get("material_index", idx)
    mesh.materials.clear()
    for m in materials:
        mesh.materials.append(m)
    mesh.polygons.foreach_set("material_index", idx)
    mesh.update()


def bake_maps(obj, size, vectors=(), ao_distance=0.05, samples=32):
    """Bakes, in the object's UV map: where each texel is (position), which way it faces (normal), its
    material (-1: none), how open it is (ambient occlusion), and each named per-vertex vector attribute in
    `vectors` (as colour attributes). Returns numpy maps."""
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 1
    if scene.world is None:
        scene.world = bpy.data.worlds.new("World")
    mesh = obj.data
    P = np.empty(len(mesh.vertices) * 3)
    mesh.vertices.foreach_get("co", P)
    P = P.reshape(-1, 3)
    lo, hi = P.min(axis=0) - 0.01, P.max(axis=0) + 0.01
    keep = list(mesh.materials)
    image = bpy.data.images.new("bake-target", size, size, alpha=False, float_buffer=True)
    image.colorspace_settings.name = "Non-Color"
    mats = []
    for i in range(max(1, len(keep))):
        m = bpy.data.materials.new(f"bake-{i}")
        m.use_nodes = True
        nt = m.node_tree
        for nd in list(nt.nodes):
            nt.nodes.remove(nd)
        out = nt.nodes.new("ShaderNodeOutputMaterial")
        em = nt.nodes.new("ShaderNodeEmission")
        nt.links.new(em.outputs[0], out.inputs[0])
        tex = nt.nodes.new("ShaderNodeTexImage")
        tex.image = image
        nt.nodes.active = tex
        geo = nt.nodes.new("ShaderNodeNewGeometry")
        attr = nt.nodes.new("ShaderNodeAttribute")
        sub = nt.nodes.new("ShaderNodeVectorMath")
        sub.operation = "SUBTRACT"
        div = nt.nodes.new("ShaderNodeVectorMath")
        div.operation = "DIVIDE"
        nt.links.new(sub.outputs[0], div.inputs[0])
        mats.append((m, em, geo, attr, sub, div, nt))
    set_materials(mesh, [m for m, *_ in mats])
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj

    def run(kind):
        for i, (m, em, geo, attr, sub, div, nt) in enumerate(mats):
            for link in list(nt.links):
                if link.to_node in (em, sub):
                    nt.links.remove(link)
            if kind == "pos":
                nt.links.new(geo.outputs["Position"], sub.inputs[0])
                sub.inputs[1].default_value = tuple(lo)
                div.inputs[1].default_value = tuple(hi - lo)
                nt.links.new(div.outputs[0], em.inputs[0])
            elif kind == "nrm":
                nt.links.new(geo.outputs["Normal"], sub.inputs[0])
                sub.inputs[1].default_value = (-1, -1, -1)
                div.inputs[1].default_value = (2, 2, 2)
                nt.links.new(div.outputs[0], em.inputs[0])
            elif kind == "mat":
                em.inputs[0].default_value = ((i + 1) / 32.0, 0, 0, 1)
            else:
                attr.attribute_name = kind
                nt.links.new(attr.outputs["Vector"], sub.inputs[0])
                sub.inputs[1].default_value = (-1, -1, -1)
                div.inputs[1].default_value = (2, 2, 2)
                nt.links.new(div.outputs[0], em.inputs[0])
        bpy.ops.object.bake(type="EMIT", margin=6, use_clear=True)
        return np.array(image.pixels[:], dtype=np.float32).reshape(size, size, 4)[..., :3].copy()

    maps = {"pos": run("pos") * (hi - lo) + lo, "nrm": unit(run("nrm") * 2 - 1)}
    maps["mat"] = np.round(run("mat")[..., 0] * 32 - 1).astype(np.int64)
    for name in vectors:
        maps[name] = run(name) * 2 - 1
    scene.cycles.samples = samples
    scene.world.light_settings.distance = ao_distance
    bpy.ops.object.bake(type="AO", margin=6, use_clear=True)
    maps["ao"] = np.array(image.pixels[:], dtype=np.float32).reshape(size, size, 4)[..., 0].copy()
    set_materials(mesh, keep)
    for m, *_ in mats:
        bpy.data.materials.remove(m)
    bpy.data.images.remove(image)
    return maps


def noise01(p, freq, seed=0):
    return 0.5 + 0.5 * wa.value_noise(p, freq, seed)


def streaks(p, flow, freq, reach, samples=7, seed=0):
    """Fur strokes: noise smeared along the fur's direction, so it comes out as strands about 2 x
    `reach` metres long; 0-1."""
    acc = np.zeros(len(p))
    for t in np.linspace(-reach, reach, samples):
        acc += noise01(p + flow * t, freq, seed)
    acc /= samples
    lo, hi = np.percentile(acc, 2), np.percentile(acc, 98)
    return np.clip((acc - lo) / max(hi - lo, 1e-6), 0, 1)


def bake_normal(obj, height, name, strength=0.6, distance=0.0012):
    """A tangent-space normal map baked from a height map painted in the object's UV layout."""
    size = height.shape[0]
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.samples = 1
    mesh = obj.data
    keep = list(mesh.materials)
    himg = bpy.data.images.new(f"{name}-height", size, size, alpha=False, float_buffer=True)
    himg.colorspace_settings.name = "Non-Color"
    px = np.ones((size, size, 4), dtype=np.float32)
    px[..., :3] = height[..., None]
    himg.pixels.foreach_set(px.ravel())
    nimg = bpy.data.images.new(f"{name}-normal", size, size, alpha=False)
    nimg.colorspace_settings.name = "Non-Color"
    temp = []
    for _ in range(max(1, len(keep))):
        m = bpy.data.materials.new("normal-bake")
        m.use_nodes = True
        nt = m.node_tree
        bsdf = nt.nodes.get("Principled BSDF")
        tex = nt.nodes.new("ShaderNodeTexImage")
        tex.image = himg
        bump = nt.nodes.new("ShaderNodeBump")
        bump.inputs["Strength"].default_value = strength
        bump.inputs["Distance"].default_value = distance
        nt.links.new(tex.outputs["Color"], bump.inputs["Height"])
        nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
        target = nt.nodes.new("ShaderNodeTexImage")
        target.image = nimg
        nt.nodes.active = target
        temp.append(m)
    set_materials(mesh, temp)
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.bake(type="NORMAL", normal_space="TANGENT", margin=6, use_clear=True)
    set_materials(mesh, keep)
    for m in temp:
        bpy.data.materials.remove(m)
    bpy.data.images.remove(himg)
    return nimg


def save_image(image, name, kind, quality=90):
    """Saved (as a JPEG in assets/build) and packed from there, so the .glb carries a JPEG."""
    os.makedirs(ww.BUILD, exist_ok=True)
    path = os.path.join(ww.BUILD, f"{name}-{kind}.jpg")
    image.filepath_raw = path
    image.file_format = "JPEG"
    image.save(filepath=path, quality=quality)
    colourspace = image.colorspace_settings.name
    bpy.data.images.remove(image)
    out = bpy.data.images.load(path)
    out.colorspace_settings.name = colourspace
    out.pack()
    return out


def image_from(name, rgb, alpha=None, colour=True):
    size = rgb.shape[0]
    image = bpy.data.images.new(name, rgb.shape[1], size, alpha=alpha is not None)
    if not colour:
        # (Data, not colour: set before the pixels go in, so they're stored as they are.)
        image.colorspace_settings.name = "Non-Color"
    a = np.ones(rgb.shape[:2]) if alpha is None else alpha
    px = np.concatenate([rgb, a[..., None]], axis=2).astype(np.float32)
    image.pixels.foreach_set(px.ravel())
    if alpha is not None:
        # (Colour and alpha kept apart: shown as painted where the alpha thins out, not darkened.)
        image.alpha_mode = "CHANNEL_PACKED"
    return image


def srgb_to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def part_material(name, colour, image, roughness=0.7, normal_image=None, specular=0.5, alpha=None):
    """A material of the shared texture times its own colour (exported as glTF's base colour factor);
    `alpha`: "BLEND" or "CLIP" for a texture whose alpha cuts it out."""
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    nodes, links = material.node_tree.nodes, material.node_tree.links
    bsdf = nodes.get("Principled BSDF")
    rgb = [srgb_to_linear(c) for c in ww.hex_rgb(colour)]
    tex = nodes.new("ShaderNodeTexImage")
    tex.image = image
    mix = nodes.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    mix.blend_type = "MULTIPLY"
    mix.inputs["Factor"].default_value = 1.0
    a = next(sk for sk in mix.inputs if sk.name == "A" and sk.type == "RGBA")
    b = next(sk for sk in mix.inputs if sk.name == "B" and sk.type == "RGBA")
    result = next(sk for sk in mix.outputs if sk.type == "RGBA")
    links.new(tex.outputs["Color"], a)
    b.default_value = (*rgb, 1.0)
    links.new(result, bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Specular IOR Level"].default_value = specular
    if normal_image is not None:
        nt = nodes.new("ShaderNodeTexImage")
        nt.image = normal_image
        nm = nodes.new("ShaderNodeNormalMap")
        links.new(nt.outputs["Color"], nm.inputs["Color"])
        links.new(nm.outputs["Normal"], bsdf.inputs["Normal"])
    if alpha:
        links.new(tex.outputs["Alpha"], bsdf.inputs["Alpha"])
        if alpha == "CLIP":
            # (A sharp cut, exported as glTF alpha mode MASK: a math node rounding the alpha.)
            rnd = nodes.new("ShaderNodeMath")
            rnd.operation = "ROUND"
            links.new(tex.outputs["Alpha"], rnd.inputs[0])
            links.new(rnd.outputs[0], bsdf.inputs["Alpha"])
            material.surface_render_method = "DITHERED"
        else:
            material.surface_render_method = "BLENDED"
        bsdf.inputs["Specular IOR Level"].default_value = 0.0
    material.diffuse_color = (*rgb, 1.0)
    return material


# ── The rig: the people's skeleton and a tail ────────────────────────────────────────────────────────


def rig(name, joints):
    """The armature from `joints` (each bone's head, and `<bone>.tail` where its tail isn't its first
    child's head), rolled as wwblend's rig rolls it, so the people's animations play on it."""
    armature = bpy.data.armatures.new(f"{name}-rig")
    obj = bpy.data.objects.new(f"{name}-rig", armature)
    bpy.context.scene.collection.objects.link(obj)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode="EDIT")
    children = {}
    for bone, parent in BONES:
        children.setdefault(parent, []).append(bone)
    for bone, parent in BONES:
        eb = armature.edit_bones.new(bone)
        eb.head = Vector(tuple(joints[bone]))
        tail = joints.get(f"{bone}.tail")
        if tail is None:
            tail = joints[children[bone][0]]
        eb.tail = Vector(tuple(tail))
        if parent:
            eb.parent = armature.edit_bones[parent]
        direction = (eb.tail - eb.head).normalized()
        eb.align_roll(Vector((0, 0, 1)) if abs(direction.z) < 0.5 else Vector((0, -1, 0)))
    bpy.ops.object.mode_set(mode="OBJECT")
    return obj


class Animator(ww.Animator):
    """wwblend's Animator, with the tail's bones too."""

    def turns(self, pose):
        world = {}
        for name, parent in BONES:
            world[name] = pose.get(name, world[parent] if parent else Quaternion())
        local = {}
        for name, parent in BONES:
            delta = (world[parent].inverted() if parent else Quaternion()) @ world[name]
            local[name] = self.rest[name].inverted() @ delta @ self.rest[name]
        return local


def actions(arm_down=72):
    """Idle, Walk and Attack (the people's own clips are what the game plays; these are for the model on
    its own), with the tail swaying gently, looping, in Idle and swinging with the stride in Walk."""
    base = ww.humanoid_actions(arm_down=arm_down)
    turn = ww.turn

    def tail(phase, amount, lift=0.0):
        pose, acc = {}, 0.0
        for i, bone in enumerate(TAIL):
            acc += amount * (0.6 + 0.4 * i) * math.sin(phase - 0.7 * i)
            pose[bone] = turn("z", acc) @ turn("x", -lift * (i + 1))
        return pose

    idle = []
    for j in range(9):
        u = j / 8
        breath = 0.5 - 0.5 * math.cos(2 * math.pi * u)
        bend = 10 + 3 * breath
        pose = {
            "upperarm_l": turn("y", arm_down),
            "upperarm_r": turn("y", -arm_down),
            "lowerarm_l": turn("x", -bend) @ turn("y", arm_down),
            "lowerarm_r": turn("x", -bend) @ turn("y", -arm_down),
        }
        pose["spine_02"] = turn("x", -2 * breath)
        pose.update(tail(2 * math.pi * u, 5.0, 1.0))
        idle.append((1 + 60 * u, pose))
    walk = []
    for frame, pose in base["Walk"]:
        u = (frame - 1) / 30
        pose = dict(pose)
        pose.update(tail(2 * math.pi * u + 1.0, 4.0, 2.0))
        walk.append((frame, pose))
    attack = []
    for frame, pose in base["Attack"]:
        pose = dict(pose)
        pose.update(tail(0.0, 0.0, 4.0))
        attack.append((frame, pose))
    return {"Idle": idle, "Walk": walk, "Attack": attack}


def export(name, objs, rig_obj, acts):
    """The body and its separate pieces (the underwear), each on the rig, exported with the actions."""
    for obj in objs:
        obj.parent = rig_obj
        obj.modifiers.new("Armature", "ARMATURE").object = rig_obj
    Animator(rig_obj).key_all(acts)
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs + [rig_obj]:
        o.select_set(True)
    bpy.context.view_layer.objects.active = rig_obj
    os.makedirs(ww.MODELS, exist_ok=True)
    os.makedirs(ww.BUILD, exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=os.path.join(ww.MODELS, f"{name}.glb"),
        export_format="GLB",
        use_selection=True,
        export_animations=True,
        export_animation_mode="NLA_TRACKS",
        export_skins=True,
        export_morph=True,
        export_morph_normal=True,
        export_yup=True,
        export_normals=True,
        export_texcoords=True,
        export_materials="EXPORT",
        export_image_format="AUTO",
    )
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ww.BUILD, f"{name}.blend"), compress=True)
    size = os.path.getsize(os.path.join(ww.MODELS, f"{name}.glb"))
    log(f"{name}: {len(objs[0].data.vertices)} vertices, {len(objs[0].data.polygons)} faces, {size / 1e6:.2f} MB")
