"""The player's base avatar: a man 1.78 m tall and a woman 1.68 m, bald and in plain underwear, on the
people's skeleton so every recorded animation plays on them. Writes assets/models/avatar-male.glb and
avatar-female.glb (and a debug .blend and the texture's JPEG in assets/build). Run (BLENDER: your
Blender executable; add `-- male` or `-- female` for one of them):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_avatar.py

Base mesh and shapes: MakeHuman's hm08 mesh and morph targets (CC0), read as data by our own code
(`wwavatar.py`; MakeHuman and its add-on are neither run nor copied), adapted in Blender by ThatOneCan.

- The body: MakeHuman's macro targets mixed for a young adult (gender, muscle, weight, height, ideal
  proportions) with a few of its face and expression targets, folded into the mesh; the head and neck
  then subdivided once (Catmull-Clark). Eyeballs of our own; MakeHuman's eyelash strips; eyebrows laid
  on the skin by casting rays at it.
- The rig: the people's bones at MakeHuman's joint helpers. Blender's automatic (bone heat) weights,
  then reshaped along the arms and legs (clean bends at the elbows, wrists, knees and ankles, fingers
  and toes wholly on the hand and ball), the head, the collarbones and hips, and smoothed over the
  trunk. Into the rest pose by our own skinning: legs hanging straight under the hips (as the people's
  T-pose has them), arms 45 degrees below level, elbows bent 10 degrees. The game turns the arms up into
  its T-pose when it loads a body, so the people's clips play the same; the model's own Idle, Walk and
  Attack are `wwblend.humanoid_actions` with the arms lowered from the A-pose.
- Underwear: the skin's faces where it goes, lifted off the skin, cut cleanly along planes, with a rim
  turned in to the skin: briefs for both, and a bra for the woman.
- One mesh with these materials, so the game can recolour each through its base colour factor: skin,
  underwear, eye_white, iris, eyebrows, eyelashes, lips, nails. Skin, lips, nails, underwear and the eyes
  share one 2048 px texture of shading and detail, near white (the colour is the material's); the
  eyebrows and eyelashes use a small texture of hair strokes whose alpha cuts them out (alpha BLEND).
- Shape keys (glTF morph targets, each 0-1): thin, heavy, muscle, chest (the man) or bust (the woman),
  hips, waist (narrower), belly, shoulders, neck; and for the face jaw, cheeks, nose, eyes,
  ears_pointed. Height, limb length and head size are the game's to set by scaling bones.
"""

import math
import os
import sys
import types

import bmesh
import bpy
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import wwavatar as wa  # noqa: E402
import wwblend as ww  # noqa: E402

# Material parts: (name, colour, roughness).
PARTS = [
    ("skin", 0xD9A183, 0.5),
    ("underwear", 0xE8E4DC, 0.85),
    ("eye_white", 0xF0ECE6, 0.2),
    ("iris", 0x5B7A92, 0.2),
    ("eyebrows", 0x30221A, 1.0),
    ("eyelashes", 0x141010, 1.0),
    ("lips", 0xB8746C, 0.35),
    ("nails", 0xF0C8BC, 0.25),
]
PART = {p[0]: i for i, p in enumerate(PARTS)}
APOSE = 45  # the arms' angle below level at rest

# Both faces at rest: the lips closed (MakeHuman's mouth rests a little open) and the eyes a little
# wider open, so they don't look sleepy.
EXPRESSION = {
    "expression/units/caucasian/mouth-compression": 0.45,
    "expression/units/caucasian/eye-left-opened-up": 0.25,
    "expression/units/caucasian/eye-right-opened-up": 0.25,
}

MALE = {
    "name": "avatar-male",
    "female": False,
    "height": 1.78,
    "macro": dict(gender=1.0, muscle=0.85, weight=0.38, height=0.6, proportions=1.0, race=(1.0, 0.0, 0.0)),
    # MakeHuman detail targets folded into the face and body: {target: weight}. A stronger jaw and chin,
    # a narrower nose, a lower forehead, higher cheekbones over leaner cheeks, a slightly smaller mouth,
    # a little larger eyes, a squarer and shorter head, a thicker neck.
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
FEMALE = {
    "name": "avatar-female",
    "female": True,
    "height": 1.68,
    "macro": dict(gender=0.0, muscle=0.55, weight=0.3, height=0.55, proportions=1.0, cupsize=0.62, firmness=0.85, race=(0.6, 0.1, 0.3)),
    # A smaller nose with a lifted tip, larger eyes lifted at the outer corners, fuller lips with a clear
    # cupid's bow, a narrower and softer jaw, higher cheekbones, a lower forehead, a shorter head, a slimmer
    # neck.
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
        # (Her eyes open less wide than his: wider reads as a stare.)
        "expression/units/caucasian/eye-left-opened-up": 0.08,
        "expression/units/caucasian/eye-right-opened-up": 0.08,
    },
}

# Which MakeHuman joint helper each of the people's bones starts at (`.tail`: where a bone ends when
# that isn't its first child's head).
JOINTS = {
    "pelvis": "pelvis",
    "spine_01": "spine-3",
    "spine_02": "spine-2",
    "spine_03": "spine-1",
    "neck_01": "neck",
    "Head": "head",
    "Head.tail": "head-2",
}
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
BONE_NAMES = [b for b, _ in ww.BONES]
BONE_INDEX = {b: i for i, b in enumerate(BONE_NAMES)}
PARENT = dict(ww.BONES)


def log(what):
    ww._log(what)


# ── The shapes ───────────────────────────────────────────────────────────────────────────────────────


def key_mixes(B, macro):
    """Each shape key as a function giving its MakeHuman offsets: macro changes (the chosen macro mix with
    one setting moved, less the chosen mix) plus detail targets."""
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
        "jaw": detail({"chin/chin-width-incr": 0.6, "chin/chin-bones-incr": 0.8, "chin/chin-prominent-incr": 0.4}),
        "cheeks": detail({**S("cheek/cheek-bones-incr", 0.6), **S("cheek/cheek-volume-incr", 0.5)}),
        "nose": detail({"nose/nose-scale-vert-incr": 0.6, "nose/nose-scale-horiz-incr": 0.4, "nose/nose-scale-depth-incr": 0.5}),
        "eyes": detail(S("eyes/eye-scale-incr", 1.0)),
        "ears_pointed": detail({**S("ears/ear-shape-pointed", 1.0), **S("ears/ear-scale-vert-incr", 0.6), **S("ears/ear-rot-backward", 0.3)}),
    }
    if female:
        cup = macro_change(cupsize=1.0)
        vol = detail({"breast/breast-volume-vert-up": 0.3})
        keys["bust"] = lambda n: cup(n) + vol(n)
    else:
        keys["chest"] = detail({"torso/torso-muscle-pectoral-incr": 1.0, "torso/measure-bust-circ-incr": 0.4})
    order = ["thin", "heavy", "muscle", "bust" if female else "chest", "hips", "waist", "belly", "shoulders", "neck", "jaw", "cheeks", "nose", "eyes", "ears_pointed"]
    return {k: keys[k] for k in order}


def lip_faces(base, faces, mouth):
    """The lips' red (vermilion) faces: MakeHuman's lip region less its outer two rings of faces, which are
    the skin round the mouth (counted from the skin outside, not from the mouth inside: `mouth`)."""
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
    """The faces inside the mouth: those reached from a point behind the lips without crossing them."""
    lip_verts = np.unique(quads[lips])
    mouth = co[lip_verts].mean(0)
    centre = co[quads].mean(1)
    start_point = mouth + np.array([0.0, 0.02, 0.0])
    open_faces = (~lips) & (np.linalg.norm(centre - mouth, axis=1) < 0.06)
    candidates = np.nonzero(open_faces)[0]
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
    log(f"mouth inside: {out.sum()} faces")
    return out


def nail_faces(base, co_mh, faces):
    """The fingernails and toenails (MakeHuman models them): the faces at each digit's tip whose normal
    faces the way the nail does: the back of the hand or the top of the foot, the thumb's turned out.
    (Each digit's last joint helper is its tip; the nail lies along the segment before it.)"""
    quads = base.quads[faces]
    p = co_mh[quads]
    centre = p.mean(1)
    normal = np.cross(p[:, 2] - p[:, 0], p[:, 3] - p[:, 1])
    normal /= np.linalg.norm(normal, axis=1, keepdims=True)
    J = lambda n: base.joint(co_mh, n)  # noqa: E731
    out = np.zeros(len(faces), dtype=bool)
    for s in ("l", "r"):
        across = J(f"{s}-finger-2-1") - J(f"{s}-finger-5-1")
        along_hand = J(f"{s}-finger-3-1") - J(f"{s}-hand")
        back = np.cross(across, along_hand)
        back /= np.linalg.norm(back)
        if s == "r":
            back = -back
        for f in range(1, 6):
            tip, last = J(f"{s}-finger-{f}-4"), J(f"{s}-finger-{f}-3")
            d = (tip - last) / np.linalg.norm(tip - last)
            up = back - d * (back @ d)
            if f == 1:
                lateral = J(f"{s}-finger-1-3") - J(f"{s}-finger-2-2")
                lateral -= d * (lateral @ d)
                up = up / np.linalg.norm(up) + lateral / np.linalg.norm(lateral) * NAIL_THUMB_TURN
            up /= np.linalg.norm(up)
            t = (centre - last) @ d
            radial = np.linalg.norm((centre - last) - np.outer(t, d), axis=1)
            seg = np.linalg.norm(tip - last)
            near = (t > seg * 0.3) & (t < seg * 0.97) & (radial < 0.12)
            facing = NAIL_FACING if f > 1 else NAIL_FACING - 0.12
            out |= near & (normal @ up > facing) & ((centre - last) @ up > 0.02)
        for f in range(1, 6):
            tip, last = J(f"{s}-toe-{f}-4" if f > 1 else f"{s}-toe-1-3"), J(f"{s}-toe-{f}-3" if f > 1 else f"{s}-toe-1-2")
            d = (tip - last) / np.linalg.norm(tip - last)
            up = np.array([0.0, 1.0, 0.0]) - d * d[1]
            up /= np.linalg.norm(up)
            t = (centre - last) @ d
            radial = np.linalg.norm((centre - last) - np.outer(t, d), axis=1)
            seg = np.linalg.norm(tip - last)
            near = (t > seg * 0.3) & (t < seg + 0.25) & (radial < 0.16)
            out |= near & (normal @ up > NAIL_FACING) & ((centre - last) @ up > 0.02)
    # Fill the holes: a face whose corners all touch the nail is part of it.
    touched = np.zeros(len(co_mh), dtype=bool)
    touched[quads[out].ravel()] = True
    out |= touched[quads].all(1)
    return out


NAIL_FACING = 0.86
NAIL_THUMB_TURN = 1.0


class Body:
    """The body in Blender's space (metres, feet at 0, facing -Y): positions, shape key offsets and joints,
    over MakeHuman's whole vertex list (helpers included until they're dropped)."""

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
        self.keys = {}
        for name, make in key_mixes(B, B["macro"]).items():
            self.keys[name] = wa.to_blender(make(n)) * self.scale
        self.joints = {}
        for bone, helper in JOINTS.items():
            self.joints[bone] = (wa.to_blender(base.joint(co, helper)) - offset) * self.scale
        self.eye = {}
        for s in ("l", "r"):
            centre = (wa.to_blender(base.joint(co, f"{s}-eye")) - offset) * self.scale
            aim = (wa.to_blender(base.joint(co, f"{s}-eye-target")) - offset) * self.scale
            helper = base.groups[f"helper-{s}-eye"]
            radius = np.linalg.norm(self.co[helper] - centre, axis=1).mean()
            self.eye[s] = {"centre": centre, "aim": aim, "radius": radius, "helper": helper}


# ── The rig and its weights ──────────────────────────────────────────────────────────────────────────


def make_rig(name, joints):
    ns = types.SimpleNamespace(name=name)
    return ww.Model.rig(ns, {k: Vector(v) for k, v in joints.items()})


def heat_weights(name, co, quads, joints):
    """Blender's automatic (bone heat) weights for the body, as an (n, bones) array."""
    mesh = bpy.data.meshes.new(name + "-heat")
    mesh.from_pydata(co.tolist(), [], quads.tolist())
    obj = bpy.data.objects.new(name + "-heat", mesh)
    bpy.context.scene.collection.objects.link(obj)
    rig = make_rig(name + "-heat", joints)
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    rig.select_set(True)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.parent_set(type="ARMATURE_AUTO")
    W = np.zeros((len(co), len(BONE_NAMES)))
    index = {g.index: BONE_INDEX[g.name] for g in obj.vertex_groups if g.name in BONE_INDEX}
    for v in mesh.vertices:
        for g in v.groups:
            if g.group in index:
                W[v.index, index[g.group]] = g.weight
    bpy.data.objects.remove(obj)
    bpy.data.meshes.remove(mesh)
    arm = rig.data
    bpy.data.objects.remove(rig)
    bpy.data.armatures.remove(arm)
    return W


def chain(p, a, b, c, blend):
    """How much of a vertex at p belongs past joint b on a limb a-b-c: across the plane at b halfway
    between the two bones' directions, blended over ±blend metres."""
    d1 = (b - a) / np.linalg.norm(b - a)
    d2 = (c - b) / np.linalg.norm(c - b)
    n = d1 + d2
    n /= np.linalg.norm(n)
    return wa.smoothstep(-blend, blend, (p - b) @ n)


def segment_distance(p, a, b):
    """Each point's distance from the segment a-b."""
    ab = b - a
    t = np.clip(((p - a) @ ab) / (ab @ ab), 0.0, 1.0)
    return np.linalg.norm(p - (a + np.outer(t, ab)), axis=1)


def along(p, a, b):
    d = b - a
    return ((p - a) @ d) / (d @ d)


def fix_weights(W, co, quads, J, nbrs):
    """Reshapes the bone heat weights where they're known to fail: along each arm and leg (clean bends at
    the elbow, wrist, knee and ankle, the fingers and toes wholly on the hand and ball), the head (all of
    it on Head, the chin too), then smooths the joins."""
    I = BONE_INDEX
    W = W.copy()
    W[W.sum(1) == 0, I["spine_02"]] = 1.0
    W /= W.sum(1, keepdims=True)
    dominant = W.argmax(1)
    for s in ("l", "r"):
        U, L, H, C = (I[f"{b}_{s}"] for b in ("upperarm", "lowerarm", "hand", "clavicle"))
        S, E, Wr, T = (J[f"upperarm_{s}"], J[f"lowerarm_{s}"], J[f"hand_{s}"], J[f"hand_{s}.tail"])
        arm = np.isin(dominant, [U, L, H]) & (along(co, S, E) > 0.05)
        p = co[arm]
        past_elbow = chain(p, S, E, Wr, 0.055)
        past_wrist = chain(p, E, Wr, T, 0.028)
        new = np.zeros((len(p), W.shape[1]))
        new[:, U] = 1 - past_elbow
        new[:, L] = past_elbow * (1 - past_wrist)
        new[:, H] = past_elbow * past_wrist
        g = wa.smoothstep(0.18, 0.42, along(p, S, E))[:, None]
        W[arm] = g * new + (1 - g) * W[arm]

        TH, CA, FO, BA = (I[f"{b}_{s}"] for b in ("thigh", "calf", "foot", "ball"))
        Hp, K, A, Bl, Bt = (J[f"thigh_{s}"], J[f"calf_{s}"], J[f"foot_{s}"], J[f"ball_{s}"], J[f"ball_{s}.tail"])
        leg = np.isin(dominant, [TH, CA, FO, BA]) & (along(co, Hp, K) > 0.05)
        p = co[leg]
        past_knee = chain(p, Hp, K, A, 0.05)
        down = (A - K) / np.linalg.norm(A - K)
        past_ankle = wa.smoothstep(-0.025, 0.03, (p - A) @ down)
        fwd = (Bt - Bl) / np.linalg.norm(Bt - Bl)
        past_ball = wa.smoothstep(-0.012, 0.012, (p - Bl) @ fwd) * past_ankle
        new = np.zeros((len(p), W.shape[1]))
        new[:, TH] = 1 - past_knee
        new[:, CA] = past_knee * (1 - past_ankle)
        new[:, FO] = past_knee * past_ankle * (1 - past_ball)
        new[:, BA] = past_knee * past_ankle * past_ball
        g = wa.smoothstep(0.12, 0.32, along(p, Hp, K))[:, None]
        W[leg] = g * new + (1 - g) * W[leg]

    # The head: everything above a plane from under the chin to the nape, blended over the upper neck.
    head, neck = J["Head"], J["neck_01"]
    chin = np.array([0.0, head[1] - 0.09, head[2] - 0.075])
    side = np.array([1.0, 0.0, 0.0])
    n = np.cross(side, chin - head)
    n /= np.linalg.norm(n)
    if n[2] < 0:
        n = -n
    zone = np.isin(dominant, [I["Head"], I["neck_01"], I["spine_03"]]) & (co[:, 2] > neck[2] - 0.02)
    p = co[zone]
    up = wa.smoothstep(-0.02, 0.025, (p - head) @ n)
    new = W[zone] * (1 - up)[:, None]
    new[:, I["Head"]] += up
    W[zone] = new

    # Bone heat reaches too far from two bones: the collarbones take in the whole chest (so a shrug
    # warps it) and the thighs reach up into the belly (so a raised knee pushes it out). Past a short
    # reach their share goes to the spine and the pelvis.
    def hand_over(src, dst, keep):
        moved = W[:, src] * (1 - keep)
        W[:, src] -= moved
        W[:, dst] += moved

    for s in ("l", "r"):
        d = segment_distance(co, J[f"clavicle_{s}"], J[f"upperarm_{s}"])
        hand_over(I[f"clavicle_{s}"], I["spine_03"], wa.smoothstep(0.1, 0.045, d))
        hip = J[f"thigh_{s}"]
        hand_over(I[f"thigh_{s}"], I["pelvis"], wa.smoothstep(hip[2] + 0.07, hip[2] + 0.005, co[:, 2]))

    # The trunk's bones blended over a longer reach (bone heat leaves creases across the chest when the
    # spine bends and twists).
    trunk_bones = [I[b] for b in ("pelvis", "spine_01", "spine_02", "spine_03", "neck_01", "clavicle_l", "clavicle_r")]
    trunk = np.isin(W.argmax(1), trunk_bones).astype(np.float64)
    W = wa.smooth_values(W, nbrs, rounds=14, factor=0.5, mask=trunk)

    # Smooth where weights change, then keep each vertex's four strongest.
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
    """The turns (bone index -> 3x3, in the body's space) that take MakeHuman's pose to the avatar's rest:
    legs hanging straight under the hips, feet level and pointing forward, arms APOSE below level with
    the elbows barely bent. Returns (turns, new joints)."""
    R = {b: np.eye(3) for b in BONE_NAMES}
    for s, sign in (("l", 1.0), ("r", -1.0)):
        hip, knee, ankle = J[f"thigh_{s}"], J[f"calf_{s}"], J[f"foot_{s}"]
        goal = np.array([hip[0] + sign * 0.012, ankle[1], ankle[2]]) - hip
        R[f"thigh_{s}"] = wa.quat_between(ankle - hip, goal)
        R[f"calf_{s}"] = R[f"thigh_{s}"]
        # The foot: level again, and its toes turned to point straight ahead.
        ball = J[f"ball_{s}"] - ankle
        flat = np.array([ball[0], ball[1], 0.0])
        R[f"foot_{s}"] = wa.quat_between(np.array([flat[0], flat[1], 0.0]), np.array([0.0, -1.0, 0.0]))
        R[f"ball_{s}"] = R[f"foot_{s}"]
        sh, el, wr = J[f"upperarm_{s}"], J[f"lowerarm_{s}"], J[f"hand_{s}"]
        a = math.radians(APOSE)
        up_dir = np.array([sign * math.cos(a), 0.0, -math.sin(a)])
        R[f"upperarm_{s}"] = wa.quat_between(el - sh, up_dir)
        fore_now = R[f"upperarm_{s}"] @ (wr - el)
        # (Bent forward 10 degrees at the elbow.)
        fore_goal = up_dir * math.cos(math.radians(10)) + np.array([0, -1.0, 0]) * math.sin(math.radians(10))
        R[f"lowerarm_{s}"] = wa.quat_between(fore_now, fore_goal) @ R[f"upperarm_{s}"]
        R[f"hand_{s}"] = R[f"lowerarm_{s}"]
    new = {}
    for b, parent in ww.BONES:
        if parent is None:
            new[b] = J[b].copy()
        else:
            new[b] = new[parent] + R[parent] @ (J[b] - J[parent])
    for k in J:
        if k.endswith(".tail"):
            b = k[: -len(".tail")]
            new[k] = new[b] + R[b] @ (J[k] - J[b])
    return R, new


# ── Building the mesh ────────────────────────────────────────────────────────────────────────────────


class Part:
    """A piece of the avatar's mesh before they're joined: positions, faces, the material of each face,
    texture coordinates per face corner (main atlas), shape key offsets and bone weights per vertex."""

    def __init__(self, co, faces, mat, uv, keys, weights):
        self.co, self.faces, self.mat, self.uv, self.keys, self.weights = co, faces, mat, uv, keys, weights


def eyeball(B, body, s, key_names, rings=None, segments=24):
    """An eyeball (its front an iris), facing where MakeHuman's eye target is, on the Head bone. Each
    shape key moves and scales it as the key moves MakeHuman's own eye helper."""
    e = body.eye[s]
    c, r = e["centre"], e["radius"]
    look = e["aim"] - c
    look /= np.linalg.norm(look)
    # Rings from the front pole back: the iris edge is a ring of its own.
    iris_angle = 30.0
    angles = rings or [0, 7, 14, 22, iris_angle, 36, 46, 60, 76, 94, 115, 140, 165, 180]
    x = np.cross(look, [0, 0, 1.0])
    x /= np.linalg.norm(x)
    z = np.cross(x, look)
    verts, faces, mats, uvs = [], [], [], []
    for i, a in enumerate(angles):
        ar = math.radians(a)
        if a in (0, 180):
            verts.append(c + look * math.cos(ar) * r)
            continue
        for j in range(segments):
            t = 2 * math.pi * j / segments
            d = look * math.cos(ar) + (x * math.cos(t) + z * math.sin(t)) * math.sin(ar)
            # (The iris is a touch flatter than the white: a lens bulges in front of it.)
            verts.append(c + d * r)
    verts = np.array(verts)

    def ring(i):
        return 1 + (i - 1) * segments

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
    centre_angle = []
    for f in faces:
        p = verts[f].mean(0) - c
        centre_angle.append(math.degrees(math.acos(np.clip(p @ look / np.linalg.norm(p), -1, 1))))
    mats = [PART["iris"] if a < iris_angle else PART["eye_white"] for a in centre_angle]
    # Texture coordinates: the iris and the front of the white mapped flat onto squares of the atlas.
    uv = []
    for f, m in zip(faces, mats):
        corner = []
        for v in f:
            d = verts[v] - c
            px, pz = d @ x / r, d @ z / r
            if m == PART["iris"]:
                k = 1 / math.sin(math.radians(iris_angle))
                corner.append(ATLAS["iris"](0.5 + 0.5 * px * k, 0.5 + 0.5 * pz * k))
            else:
                ang = math.degrees(math.acos(np.clip(d @ look / r, -1, 1)))
                t = math.atan2(pz, px)
                rr = min(1.0, ang / 180.0)
                corner.append(ATLAS["white"](0.5 + 0.5 * rr * math.cos(t), 0.5 + 0.5 * rr * math.sin(t)))
        uv.append(corner)
    keys = {}
    helper = e["helper"]
    for name in key_names:
        d = body.keys[name]
        moved = body.co[helper] + d[helper]
        c2 = moved.mean(0)
        r2 = np.linalg.norm(moved - c2, axis=1).mean()
        keys[name] = (c2 + (verts - c) * (r2 / r)) - verts
    W = np.zeros((len(verts), len(BONE_NAMES)))
    W[:, BONE_INDEX["Head"]] = 1.0
    return Part(verts, faces, mats, uv, keys, W)


def _rect(u0, v0, u1, v1):
    return lambda u, v: (u0 + (u1 - u0) * u, v0 + (v1 - v0) * v)


# Free corners of MakeHuman's texture layout (its helpers' spot, which the avatar doesn't use).
ATLAS = {
    "iris": _rect(0.635, 0.93, 0.695, 0.99),
    "white": _rect(0.705, 0.93, 0.765, 0.99),
    "underwear": (0.635, 0.865, 0.995, 0.925),
    "mouth": _rect(0.775, 0.94, 0.795, 0.96),
}


def join(name, parts, key_names):
    co = np.concatenate([p.co for p in parts])
    faces, mats, uvs = [], [], []
    offset = 0
    for p in parts:
        faces += [[i + offset for i in f] for f in p.faces]
        mats += list(p.mat)
        uvs += [list(c) for c in p.uv]
        offset += len(p.co)
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(co.tolist(), [], faces)
    mesh.polygons.foreach_set("material_index", mats)
    mesh.polygons.foreach_set("use_smooth", [True] * len(faces))
    uv_layer = mesh.uv_layers.new(name="UVMap")
    flat = [c for f in uvs for c in f]
    uv_layer.data.foreach_set("uv", np.array(flat, dtype=np.float64).ravel())
    mesh.validate()
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    obj.shape_key_add(name="Basis", from_mix=False)
    for k in key_names:
        sk = obj.shape_key_add(name=k, from_mix=False)
        d = np.concatenate([p.keys[k] for p in parts])
        sk.data.foreach_set("co", (co + d).ravel())
        sk.slider_min, sk.slider_max = 0.0, 1.0
        sk.value = 0.0
    W = np.concatenate([p.weights for p in parts])
    groups = [obj.vertex_groups.new(name=b) for b in BONE_NAMES]
    for b, g in enumerate(groups):
        idx = np.nonzero(W[:, b] > 0)[0]
        for i in idx:
            g.add([int(i)], float(W[i, b]), "REPLACE")
    return obj

# ── Eyelashes and eyebrows: strips cut out by a texture of hair strokes ─────────────────────────────

# Where each strip's texture lies in the small hair texture (u0, v0, u1, v1).
CARDS = {"brow": (0.0, 0.5, 1.0, 1.0), "lash_upper": (0.0, 0.25, 1.0, 0.5), "lash_lower": (0.0, 0.0, 1.0, 0.25)}


def card_uv(card, u, v):
    u0, v0, u1, v1 = CARDS[card]
    return (u0 + (u1 - u0) * u, v0 + (v1 - v0) * v)


def mh_lashes(B, base, body, key_names):
    """Eyelashes: MakeHuman's own lash strips (helper geometry made for its lids, moved by its targets as
    the lids are), their texture coordinates laid onto the hair texture with the roots at the bottom.
    Also returns each lid's roots, inner corner to outer: {side: (upper, lower)}."""
    parts, roots = [], {}
    for s in ("l", "r"):
        roots[s] = []
        centre = body.eye[s]["centre"]
        for group, card in ((f"helper-{s}-eyelashes-2", "lash_upper"), (f"helper-{s}-eyelashes-1", "lash_lower")):
            faces = base.faces_of(group)
            quads = base.quads[faces]
            verts = np.unique(quads)
            remap = {int(v): i for i, v in enumerate(verts)}
            # MakeHuman lays each strip out as an arc: its rows are rings round one point. Fitted (least
            # squares), the distance from that point runs across the strip and the angle along it.
            uv = base.uv[base.quad_uv[faces]]
            pts = uv.reshape(-1, 2)
            A = np.c_[2 * pts, np.ones(len(pts))]
            cx, cy, _ = np.linalg.lstsq(A, (pts**2).sum(1), rcond=None)[0]
            rel = uv - np.array([cx, cy])
            radius = np.linalg.norm(rel, axis=2)
            angle = np.arctan2(rel[..., 1], rel[..., 0])
            angle = np.unwrap(angle.ravel()).reshape(angle.shape)
            norm = lambda a: (a - a.min()) / (a.max() - a.min())  # noqa: E731
            uv = np.stack([norm(angle), norm(radius)], axis=2)
            # (Which way the roots lie: nearer the eye than the tips.)
            dist = np.linalg.norm(body.co[quads] - centre, axis=2)
            if dist[uv[..., 1] < 0.3].mean() > dist[uv[..., 1] > 0.7].mean():
                uv[..., 1] = 1 - uv[..., 1]
            along, across = 0, 1
            fuv = [[card_uv(card, c[along], c[across] * 0.95 + 0.03) for c in f] for f in uv]
            at_root = {}
            for f, q in zip(uv, quads):
                for c, v in zip(f, q):
                    if c[across] < 0.15:
                        at_root[int(v)] = c[along]
            order = sorted(at_root, key=at_root.get)
            line = body.co[order]
            if abs(line[0, 0]) > abs(line[-1, 0]):
                line = line[::-1]
            roots[s].append(line)
            W = np.zeros((len(verts), len(BONE_NAMES)))
            W[:, BONE_INDEX["Head"]] = 1.0
            kk = {k: body.keys[k][verts] for k in key_names}
            points = body.co[verts]
            if not B["female"]:
                # (His lashes shorter: each point drawn towards the nearest root.)
                nearest = line[np.argmin(np.linalg.norm(points[:, None] - line[None], axis=2), axis=1)]
                points = nearest + (points - nearest) * 0.62
            parts.append(Part(points, [[remap[int(v)] for v in q] for q in quads], [PART["eyelashes"]] * len(faces), fuv, kk, W))
    return parts, roots


def surface(co, faces):
    tris = np.array([(f[0], f[i], f[i + 1]) for f in faces for i in range(1, len(f) - 1)])
    return tris, BVHTree.FromPolygons(co.tolist(), tris.tolist())


def brow(B, co, keys, upper, s, sign, key_names, tris, bvh):
    """An eyebrow: a grid laid on the skin over the eye (found by casting rays at the face), its shape
    and hairs drawn by its texture. Each shape key carries it with the skin under it."""
    female = B["female"]
    inner, outer = upper[0], upper[-1]
    top = upper[:, 2].max()
    nu, nv = 18, 5
    x0 = abs(inner[0]) - 0.007
    x1 = abs(outer[0]) + (0.012 if female else 0.011)
    verts, uvs, hit_tri, hit_pt = [], [], [], []
    for i in range(nu + 1):
        u = i / nu
        x = sign * (x0 + (x1 - x0) * u)
        # The brow's middle line: over the eye's top, arching up a little then down to the temple.
        if female:
            lift = 0.0125 + 0.0065 * math.sin(math.pi * min(1.0, u / 0.72) * 0.5) - 0.006 * max(0.0, (u - 0.72) / 0.28) ** 1.5
        else:
            lift = 0.0105 + 0.003 * math.sin(math.pi * min(1.0, u / 0.7) * 0.5) - 0.004 * max(0.0, (u - 0.7) / 0.3) ** 1.5
        half = 0.0085
        for j in range(nv + 1):
            v = j / nv
            z = top + lift + (v - 0.5) * 2 * half
            origin = Vector((x, -0.4, z))
            loc, nrm, idx, _ = bvh.ray_cast(origin, Vector((0, 1, 0)), 1.0)
            if loc is None:
                loc, nrm, idx, _ = bvh.find_nearest(Vector((x, inner[1], z)))
            verts.append(np.array(loc) + np.array(nrm) * 0.0005)
            hit_tri.append(idx)
            hit_pt.append(np.array(loc))
            uvs.append(card_uv("brow", u, v))
    hit_tri = np.array(hit_tri)
    bary = wa.bary_attach(tris, co, hit_tri, np.array(hit_pt))
    tv = tris[hit_tri]
    kk = {k: (keys[k][tv] * bary[:, :, None]).sum(1) for k in key_names}
    faces, fuv = [], []
    for i in range(nu):
        for j in range(nv):
            a, b = i * (nv + 1) + j, (i + 1) * (nv + 1) + j
            f = [a, a + 1, b + 1, b] if sign > 0 else [a, b, b + 1, a + 1]
            faces.append(f)
            fuv.append([uvs[q] for q in f])
    W = np.zeros((len(verts), len(BONE_NAMES)))
    W[:, BONE_INDEX["Head"]] = 1.0
    return Part(np.array(verts), faces, [PART["eyebrows"]] * len(faces), fuv, kk, W)


# ── Underwear: a thin layer over the skin, cut along planes ─────────────────────────────────────────


def _unit(v):
    v = np.asarray(v, dtype=np.float64)
    return v / np.linalg.norm(v)


def _plane(a, b, c, inside):
    """The plane through a, b and c, its normal turned towards the point `inside`."""
    n = _unit(np.cross(b - a, c - a))
    if (inside - a) @ n < 0:
        n = -n
    return a, n


def underwear_cuts(B, co, W, J):
    """The underwear's pieces, each a list of planes (point, normal towards the inside) and a test of a
    face's centre (on the inside of everything that bounds it)."""
    I = BONE_INDEX
    female = B["female"]
    pel, th = J["pelvis"], J["thigh_l"]
    mid = (np.abs(co[:, 0]) < 0.006) & (co[:, 2] > th[2] - 0.3) & (co[:, 2] < pel[2])
    crotch = co[mid, 2].min()
    arms = W[:, [I[f"{b}_{s}"] for b in ("upperarm", "lowerarm", "hand") for s in "lr"]].sum(1)
    band = (np.abs(co[:, 2] - (th[2] + 0.05)) < 0.012) & (arms < 0.2)
    hip_x = np.abs(co[band, 0]).max()
    pieces = []
    # Briefs: a waistband a little below the navel (lower in front), legs cut high on the hip.
    waist = pel[2] + (0.085 if not female else 0.03)
    planes = [(np.array([0.0, 0.0, waist]), _unit([0.0, 0.06 if not female else 0.16, -1.0]))]
    for sign in (1.0, -1.0):
        a = np.array([sign * (0.05 if not female else 0.032), 0.0, crotch - 0.008])
        b = np.array([sign * hip_x * 1.02, 0.0, th[2] + (0.005 if not female else 0.07)])
        # (Leaning back and down, so the seat is covered.)
        c = a + _unit([0.0, 1.0, -0.9 if not female else -0.6]) * 0.1
        planes.append(_plane(a, b, c, np.array([0.0, 0.0, th[2] + 0.06])))
    pieces.append(("briefs", planes, 0.0016, lambda p, planes=planes: all(((p - q) @ n) >= 0 for q, n in planes), (crotch - 0.06, waist + 0.06)))
    if female:
        chest = (co[:, 0] > 0.04) & (co[:, 2] > J["spine_02"][2]) & (co[:, 2] < J["spine_03"][2] + 0.06) & (arms < 0.2)
        apex = co[chest][np.argmin(co[chest, 1])]
        z_band = apex[2] - 0.078
        z_side = J["upperarm_l"][2] - 0.115
        # The top edge: from a low point between the breasts up to each strap (a V), then down under the
        # arm and round the back.
        sx, sw = 0.082, 0.0105
        tops = {}
        for sign in (1.0, -1.0):
            gore = np.array([0.0, apex[1] - 0.05, apex[2] + 0.004])
            strap = np.array([sign * sx, apex[1] - 0.05, apex[2] + 0.085])
            inner = _plane(gore, strap, gore + np.array([0.0, 0.1, 0.0]), np.array([0.0, 0.0, z_band]))
            sd = np.array([sign * 0.17, 0.0, z_side])
            bk = np.array([sign * 0.09, 0.2, z_band + 0.075])
            outer = _plane(strap, sd, bk, np.array([0.0, 0.0, z_band]))
            back = (np.array([0.0, 0.0, z_band + 0.075]), np.array([0.0, 0.0, -1.0]))
            tops[sign] = (inner, outer, back)
        straps = {sign: ((np.array([sign * (sx - sw), 0, 0]), np.array([sign, 0.0, 0.0])), (np.array([sign * (sx + sw), 0, 0]), np.array([-sign, 0.0, 0.0]))) for sign in (1.0, -1.0)}
        bottom = (np.array([0.0, 0.0, z_band]), np.array([0.0, 0.0, 1.0]))
        planes = [bottom, *tops[1.0], *tops[-1.0]] + [p for sign in (1.0, -1.0) for p in straps[sign]]

        def inside_bra(p):
            if (p - bottom[0]) @ bottom[1] < 0:
                return False
            sign = 1.0 if p[0] >= 0 else -1.0
            inner, outer, back = tops[sign]
            if (p - inner[0]) @ inner[1] >= 0 and (p - outer[0]) @ outer[1] >= 0 and (p[1] < 0.02 or (p - back[0]) @ back[1] >= 0):
                return True
            (q1, n1), (q2, n2) = straps[sign]
            return (p - q1) @ n1 >= 0 and (p - q2) @ n2 >= 0 and p[2] < J["Head"][2] - 0.06

        pieces.append(("bra", planes, 0.0024, inside_bra, (z_band - 0.05, J["neck_01"][2] + 0.06)))
    return pieces


def underwear(B, co, quads, keys, W, J, key_names):
    """The underwear as Parts: each piece the skin's faces where it goes, lifted off the skin a little,
    cut cleanly along its planes and given a rim turned in to the skin, so no gap shows at its edge."""
    I = BONE_INDEX
    arms = W[:, [I[f"{b}_{s}"] for b in ("upperarm", "lowerarm", "hand") for s in "lr"]].sum(1)
    normals = wa.vertex_normals(co, quads)
    centres = co[quads].mean(1)
    out = []
    cuts = underwear_cuts(B, co, W, J)
    for name, planes, lift, inside, (z0, z1) in cuts:
        sel = (centres[:, 2] > z0) & (centres[:, 2] < z1) & (arms[quads].max(1) < 0.5)
        fq = quads[sel]
        vids = np.unique(fq)
        remap = -np.ones(len(co), dtype=np.int64)
        remap[vids] = np.arange(len(vids))
        p0 = co[vids] + normals[vids] * lift
        mesh = bpy.data.meshes.new(name)
        mesh.from_pydata(p0.tolist(), [], remap[fq].tolist())
        obj = bpy.data.objects.new(name, mesh)
        bpy.context.scene.collection.objects.link(obj)
        obj.shape_key_add(name="Basis", from_mix=False)
        for k in key_names:
            sk = obj.shape_key_add(name=k, from_mix=False)
            sk.data.foreach_set("co", (p0 + keys[k][vids]).ravel())
        groups = [obj.vertex_groups.new(name=b) for b in BONE_NAMES]
        for b, g in enumerate(groups):
            for i in np.nonzero(W[vids, b] > 0)[0]:
                g.add([int(i)], float(W[vids[i], b]), "REPLACE")
        bm = bmesh.new()
        bm.from_mesh(mesh)
        for q, n in planes:
            geom = list(bm.verts) + list(bm.edges) + list(bm.faces)
            bmesh.ops.bisect_plane(bm, geom=geom, plane_co=Vector(q), plane_no=Vector(n), dist=1e-5)
        dead = [f for f in bm.faces if not inside(np.array(f.calc_center_median()))]
        bmesh.ops.delete(bm, geom=dead, context="FACES")
        loose = [v for v in bm.verts if not v.link_faces]
        bmesh.ops.delete(bm, geom=loose, context="VERTS")
        # The rim: each open edge turned in towards the skin.
        bm.normal_update()
        shape_layers = list(bm.verts.layers.shape.values())
        boundary = [e for e in bm.edges if e.is_boundary]
        inner = {}
        for e in boundary:
            for v in e.verts:
                if v not in inner:
                    d = -v.normal * (lift + 0.0009)
                    nv = bm.verts.new(v.co + d, v)
                    for layer in shape_layers:
                        nv[layer] = v[layer] + d
                    inner[v] = nv
        for e in boundary:
            a, b = e.verts
            f = e.link_faces[0]
            # (Wound so the rim faces outward, as its face does.)
            loop = next(l for l in f.loops if l.edge == e)
            if loop.vert != a:
                a, b = b, a
            bm.faces.new((b, a, inner[a], inner[b]), f)
        bm.to_mesh(mesh)
        bm.free()
        mesh.update()
        out.append(obj)
    # Texture coordinates: unwrapped together and packed into the atlas's underwear corner.
    bpy.ops.object.select_all(action="DESELECT")
    for o in out:
        o.select_set(True)
    bpy.context.view_layer.objects.active = out[0]
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.smart_project(angle_limit=math.radians(60), island_margin=0.02)
    bpy.ops.uv.pack_islands(rotate=True, margin=0.02)
    bpy.ops.object.mode_set(mode="OBJECT")
    u0, v0, u1, v1 = ATLAS["underwear"]
    parts = []
    for o in out:
        me = o.data
        n = len(me.vertices)
        p = np.zeros(n * 3)
        me.vertices.foreach_get("co", p)
        p = p.reshape(-1, 3)
        kk = {}
        for k in key_names:
            a = np.zeros(n * 3)
            me.shape_keys.key_blocks[k].data.foreach_get("co", a)
            kk[k] = a.reshape(-1, 3) - p
        Wp = np.zeros((n, len(BONE_NAMES)))
        gi = {g.index: BONE_INDEX[g.name] for g in o.vertex_groups}
        for v in me.vertices:
            for g in v.groups:
                Wp[v.index, gi[g.group]] = g.weight
        Wp /= np.maximum(Wp.sum(1, keepdims=True), 1e-9)
        uvl = me.uv_layers.active.data
        faces, fuv = [], []
        for poly in me.polygons:
            faces.append(list(poly.vertices))
            fuv.append([(u0 + (u1 - u0) * uvl[li].uv[0], v0 + (v1 - v0) * uvl[li].uv[1]) for li in poly.loop_indices])
        parts.append(Part(p, faces, [PART["underwear"]] * len(faces), fuv, kk, Wp))
        bpy.data.objects.remove(o)
    return parts, [(c[1], 0.011 if c[0] == "briefs" else 0.008) for c in cuts]


# ── The texture ─────────────────────────────────────────────────────────────────────────────────────

SIZE = 2048
CARD_SIZE = 512


def _image(name, size, float_buffer=True, alpha=True):
    image = bpy.data.images.new(name, size, size, alpha=alpha, float_buffer=float_buffer)
    if float_buffer:
        image.colorspace_settings.name = "Non-Color"
    return image


def _pixels(image):
    a = np.empty(image.size[0] * image.size[1] * 4, dtype=np.float32)
    image.pixels.foreach_get(a)
    return a.reshape(image.size[1], image.size[0], 4)


def bake_maps(objects, under):
    """Bakes, for every texel of the atlas: where it is on the body at rest (position and normal), which
    part it belongs to, how the surface curves there (Cycles' pointiness: below a half in a crease), and
    how tucked in it is (ambient occlusion: the skin's without the underwear over it, the underwear's
    with the body under it)."""
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    if scene.world is None:
        scene.world = bpy.data.worlds.new("World")
    everything = objects + under
    saved = {o: [s.material for s in o.material_slots] for o in everything}
    maps = {}
    for kind in ("position", "normal", "part", "curve", "ao"):
        image = _image(f"bake-{kind}", SIZE)
        mats = []
        for i in range(len(PARTS)):
            m = bpy.data.materials.new(f"bake-{kind}-{i}")
            m.use_nodes = True
            nodes, links = m.node_tree.nodes, m.node_tree.links
            for n in list(nodes):
                if n.type != "OUTPUT_MATERIAL":
                    nodes.remove(n)
            out = next(n for n in nodes if n.type == "OUTPUT_MATERIAL")
            if kind == "ao":
                shader = nodes.new("ShaderNodeBsdfDiffuse")
            else:
                shader = nodes.new("ShaderNodeEmission")
                geo = nodes.new("ShaderNodeNewGeometry")
                if kind == "position":
                    # (Shifted and halved so it's all positive: x and y from -1, z from 0.)
                    add = nodes.new("ShaderNodeVectorMath")
                    add.operation = "MULTIPLY_ADD"
                    links.new(geo.outputs["Position"], add.inputs[0])
                    add.inputs[1].default_value = (0.5, 0.5, 0.5)
                    add.inputs[2].default_value = (0.5, 0.5, 0.0)
                    links.new(add.outputs["Vector"], shader.inputs["Color"])
                elif kind == "curve":
                    links.new(geo.outputs["Pointiness"], shader.inputs["Color"])
                elif kind == "normal":
                    add = nodes.new("ShaderNodeVectorMath")
                    add.operation = "MULTIPLY_ADD"
                    links.new(geo.outputs["Normal"], add.inputs[0])
                    add.inputs[1].default_value = (0.5, 0.5, 0.5)
                    add.inputs[2].default_value = (0.5, 0.5, 0.5)
                    links.new(add.outputs["Vector"], shader.inputs["Color"])
                else:
                    shader.inputs["Color"].default_value = ((i + 1) / 16, 0, 0, 1)
            links.new(shader.outputs[0], out.inputs["Surface"])
            tex = nodes.new("ShaderNodeTexImage")
            tex.image = image
            nodes.active = tex
            mats.append(m)
        for o in everything:
            for s, slot in enumerate(o.material_slots):
                slot.material = mats[s]
        scene.cycles.samples = 1 if kind != "ao" else 48

        def bake(objs, kind=kind, clear=True):
            bpy.ops.object.select_all(action="DESELECT")
            for o in objs:
                o.select_set(True)
            bpy.context.view_layer.objects.active = objs[0]
            bpy.ops.object.bake(type="EMIT" if kind != "ao" else "AO", margin=6, use_clear=clear)

        if kind == "ao":
            scene.world.light_settings.distance = 0.12
            for o in under:
                o.hide_render = True
            bake(objects)
            for o in under:
                o.hide_render = False
            bake(under, clear=False)
        else:
            bake(everything)
        maps[kind] = _pixels(image)
        log(f"baked {kind}")
    for o, mats in saved.items():
        for slot, m in zip(o.material_slots, mats):
            slot.material = m
    return maps


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


def _near(p, centre, radius):
    """1 at `centre`, easing to 0 at `radius` away."""
    d = np.linalg.norm(p - centre, axis=-1) / radius
    return np.clip(1 - d * d, 0, 1) ** 2


def paint(B, maps, marks):
    """The atlas: shading and detail only, near white, so each part's colour (its material's) sets its
    hue. Skin: soft mottling, warmer cheeks, nose, ears, knuckles, elbows and knees, darker lids, a
    shadow under the brows (and a faint beard shadow on the man); lips with fine lines; nails with
    paler tips; irises with fibres, a pupil and a darker rim; whites pinker at the corners; underwear
    with a knit and elastic bands at its edges. All of it times a soft ambient occlusion."""
    female = B["female"]
    part = np.rint(maps["part"][..., 0] * 16).astype(np.int64) - 1
    pos = (maps["position"][..., :3] - np.array([0.5, 0.5, 0.0])) * 2
    nrm = maps["normal"][..., :3] * 2 - 1
    ao = maps["ao"][..., 0]
    covered = part >= 0
    ao = np.where(covered, ao, 1.0)
    # (No lone dark specks: occlusion is kept within reach of its neighbourhood's.)
    ao = np.maximum(ao, _blur(ao, 6) - 0.12)
    ao = _blur(ao, 2)
    rgb = np.full((SIZE, SIZE, 3), 0.8, dtype=np.float64)

    def pick(name):
        return covered & (part == PART[name])

    # Skin.
    sel = pick("skin") | pick("lips") | pick("nails")
    p = pos[sel]
    col = np.full((len(p), 3), 0.96)
    blush = np.zeros(len(p))
    for s in (1, -1):
        e = marks["eye"][s]
        blush += 0.55 * _near(p, e + np.array([s * 0.012, -0.012, -0.035]), 0.03)
        blush += 0.35 * _near(p, marks["ear"][s], 0.035)
        blush += 0.3 * _near(p, marks["elbow"][s], 0.05)
        blush += 0.35 * _near(p, marks["knee"][s], 0.06)
        blush += 0.35 * _near(p, marks["hand"][s], 0.09)
        blush += 0.3 * _near(p, marks["toes"][s], 0.07)
    blush += 0.6 * _near(p, marks["nose"], 0.018)
    blush += 0.25 * _near(p, marks["chin"], 0.025)
    blush = np.clip(blush, 0, 1)
    col *= 1 - blush[:, None] * np.array([0.0, 0.09, 0.11])
    # Lids: a little darker and cooler round the eye; and a soft shadow under the brows.
    for s in (1, -1):
        e = marks["eye"][s]
        lid = _near(p, e + np.array([0, -0.004, 0.002]), marks["eye_r"] * 2.3)
        col *= 1 - lid[:, None] * np.array([0.06, 0.1, 0.08])
        brow = _near(p, marks["brow"][s], 0.022)
        col *= 1 - brow[:, None] * 0.07
    # The lash line: the skin right at each lid's rim darkened, the upper more than the lower.
    for rim, strength in marks["rims"]:
        near = np.nonzero(np.linalg.norm(p - rim.mean(0), axis=1) < 0.03)[0]
        q = p[near]
        d = np.full(len(q), 1.0)
        for a, b in zip(rim[:-1], rim[1:]):
            ab = b - a
            t = np.clip(((q - a) @ ab) / (ab @ ab), 0, 1)
            d = np.minimum(d, np.linalg.norm(q - (a + np.outer(t, ab)), axis=1))
        col[near] *= 1 - (0.55 * strength * np.exp(-((d / 0.0011) ** 2)))[:, None]
    if not female:
        jaw = marks["chin"]
        beard = np.clip(_near(p * np.array([0.8, 1, 1]), jaw + np.array([0, 0.02, 0.025]), 0.07) * 1.4, 0, 1)
        beard *= wa.smoothstep(marks["nose"][2] - 0.004, marks["nose"][2] - 0.02, p[:, 2])
        beard *= wa.smoothstep(marks["chin"][1] + 0.08, marks["chin"][1] + 0.05, p[:, 1])
        beard *= 1 - _near(p, marks["mouth"], 0.03) * 0.6
        col *= 1 - beard[:, None] * np.array([0.07, 0.055, 0.04])
    # Nipples and areolae, and the navel.
    for s in (1, -1):
        areola = _near(p, marks["nipple"][s], 0.017 if female else 0.013)
        col *= 1 - np.clip(areola * 1.6, 0, 1)[:, None] * (np.array([0.1, 0.2, 0.2]) if female else np.array([0.07, 0.12, 0.12]))
    mottle = wa.fbm(p, 28.0, 3, seed=1) * 0.025 + wa.fbm(p, 160.0, 2, seed=2) * 0.012
    pores = wa.value_noise(p, 1400.0, seed=3) * 0.012
    hue = wa.fbm(p, 9.0, 2, seed=4) * 0.015
    col *= (1 + mottle + pores)[:, None]
    col *= 1 + hue[:, None] * np.array([0.6, -0.3, -0.6])
    rgb[sel] = col

    # Lips: fine upright lines, darker where they meet, a little lighter in the middle of the lower lip.
    sel = pick("lips")
    p = pos[sel]
    lines = wa.value_noise(p * np.array([1.0, 0.25, 0.25]), 900.0, seed=5) * 0.05
    meet = np.exp(-(((p[:, 2] - marks["mouth"][2]) / 0.0018) ** 2))
    shine = _near(p, marks["mouth"] + np.array([0, -0.004, -0.0065]), 0.012) * 0.06
    # (Inside the mouth: tucked away, or the lips' inner faces, which face each other up and down.)
    nz = nrm[sel][:, 2]
    facing_in = wa.smoothstep(0.35, 0.75, np.abs(nz)) * (((nz > 0) & (p[:, 2] < marks["mouth"][2] + 0.002)) | ((nz < 0) & (p[:, 2] > marks["mouth"][2] - 0.002)))
    inner = np.maximum(wa.smoothstep(0.75, 0.35, ao[sel]), facing_in)
    rgb[sel] = (0.97 + lines - 0.28 * meet + shine)[:, None] * np.array([1.0, 0.97, 0.97]) * (1 - 0.6 * inner)[:, None]

    # Nails: paler at the tip, a pale half-moon at the root.
    sel = pick("nails")
    p = pos[sel]
    rgb[sel] = (0.95 + wa.value_noise(p * np.array([1, 1, 0.3]), 1200.0, seed=6) * 0.02)[:, None]

    # Irises and whites, from their own squares of the atlas.
    v_idx, u_idx = np.nonzero(covered & (part == PART["iris"]))
    u = (u_idx + 0.5) / SIZE
    v = (v_idx + 0.5) / SIZE
    u0, v0 = ATLAS["iris"](0, 0)
    u1, v1 = ATLAS["iris"](1, 1)
    x = ((u - u0) / (u1 - u0) - 0.5) * 2
    y = ((v - v0) / (v1 - v0) - 0.5) * 2
    r = np.sqrt(x * x + y * y)
    ang = np.arctan2(y, x)
    pts = np.stack([np.cos(ang) * 3, np.sin(ang) * 3, r * 0.8], axis=1)
    fibres = wa.fbm(np.stack([ang * 9.5, r * 6, np.zeros_like(r)], axis=1), 1.0, 3, seed=7) * 0.22
    spots = wa.fbm(pts, 2.5, 3, seed=8) * 0.12
    iris = 0.66 + fibres + spots
    iris += 0.16 * np.exp(-(((r - 0.5) / 0.08) ** 2))  # a paler ring round the pupil
    iris *= 1 - 0.65 * wa.smoothstep(0.78, 1.0, r)  # a darker rim
    pupil = wa.smoothstep(0.36, 0.30, r)
    iris = iris * (1 - pupil) + 0.03 * pupil
    rgb[v_idx, u_idx] = np.clip(iris, 0, 1)[:, None]
    v_idx, u_idx = np.nonzero(covered & (part == PART["eye_white"]))
    u = (u_idx + 0.5) / SIZE
    v = (v_idx + 0.5) / SIZE
    u0, v0 = ATLAS["white"](0, 0)
    u1, v1 = ATLAS["white"](1, 1)
    x = ((u - u0) / (u1 - u0) - 0.5) * 2
    y = ((v - v0) / (v1 - v0) - 0.5) * 2
    r = np.sqrt(x * x + y * y)
    corner = wa.smoothstep(0.18, 0.32, r) * np.abs(x / np.maximum(r, 1e-6)) ** 3
    white = np.full((len(r), 3), 0.97)
    white *= 1 - corner[:, None] * np.array([0.0, 0.12, 0.12])
    white *= 1 - wa.smoothstep(0.2, 0.45, r)[:, None] * 0.08
    rgb[v_idx, u_idx] = white

    # Underwear: a fine knit, and elastic at the edges (a band with a stitched line).
    sel = pick("underwear")
    p = pos[sel]
    knit = wa.value_noise(p, 2200.0, seed=9) * 0.025 + wa.fbm(p, 60.0, 2, seed=10) * 0.015
    col = 0.95 + knit
    edge = np.full(len(p), 1.0)
    for planes, width in marks["underwear"]:
        for i, (q, n) in enumerate(planes):
            d = np.abs((p - q) @ n)
            w = width if i == 0 else width * 0.6
            band = wa.smoothstep(w + 0.0008, w, d)
            stitch = np.exp(-(((d - w - 0.0015) / 0.0004) ** 2))
            edge = np.minimum(edge, 1 - 0.05 * band - 0.18 * stitch)
    rgb[sel] = (col * edge)[:, None]

    # Inside the mouth (what shows between the lips): a dark square of its own.
    u0, v0 = ATLAS["mouth"](0, 0)
    u1, v1 = ATLAS["mouth"](1, 1)
    rgb[int((1 - v1) * SIZE) : int((1 - v0) * SIZE) + 1, int(u0 * SIZE) : int(u1 * SIZE) + 1] = (0.25, 0.13, 0.13)

    # Shading: occlusion, and a touch darker in creases and lighter on ridges (the nose's line, the lids'
    # folds, the ear's whorls, the lips' corners).
    curve = np.where(covered, maps["curve"][..., 0], 0.5)
    curve = _blur(curve, 3) - 0.5
    shade = (0.5 + 0.5 * ao) * np.clip(1 + 1.0 * curve, 0.9, 1.04)
    rgb *= shade[..., None]
    rgb = np.where(covered[..., None], rgb, 0.75)
    return np.clip(rgb, 0, 1)


def atlas_image(name, rgb):
    image = bpy.data.images.new(f"{name}-texture", SIZE, SIZE, alpha=False)
    rgba = np.concatenate([rgb, np.ones((SIZE, SIZE, 1))], axis=2).astype(np.float32)
    # (The colours are sRGB values: the texture holds them as they'll be shown.)
    image.pixels.foreach_set(rgba.ravel())
    # Saved as a JPEG (in assets/build) and packed from there, so the .glb carries a JPEG, not a PNG.
    os.makedirs(ww.BUILD, exist_ok=True)
    path = os.path.join(ww.BUILD, f"{name}-texture.jpg")
    image.filepath_raw = path
    image.file_format = "JPEG"
    image.save(filepath=path, quality=92)
    bpy.data.images.remove(image)
    image = bpy.data.images.load(path)
    image.pack()
    return image


def _stamp(alpha, col, x, y, radius, a, shade):
    """A soft round dot into alpha and colour (texel coordinates)."""
    h, w = alpha.shape
    x0, x1 = int(max(0, x - radius - 1)), int(min(w, x + radius + 2))
    y0, y1 = int(max(0, y - radius - 1)), int(min(h, y + radius + 2))
    if x0 >= x1 or y0 >= y1:
        return
    yy, xx = np.mgrid[y0:y1, x0:x1]
    d = np.sqrt((xx + 0.5 - x) ** 2 + (yy + 0.5 - y) ** 2)
    k = np.clip(radius + 0.5 - d, 0, 1) * a
    region = alpha[y0:y1, x0:x1]
    col[y0:y1, x0:x1] = col[y0:y1, x0:x1] * (1 - k) + shade * k
    alpha[y0:y1, x0:x1] = 1 - (1 - region) * (1 - k)


def cards_image(B, name):
    """The eyebrows' and eyelashes' texture: hair strokes, their alpha cutting the strips out."""
    female = B["female"]
    rng = np.random.default_rng(7 if female else 3)
    N = CARD_SIZE
    alpha = np.zeros((N, N))
    col = np.full((N, N), 0.85)

    def to_px(card, u, v):
        cu, cv = card_uv(card, u, v)
        return cu * N, (1 - cv) * N  # (row 0 is the image's top)

    # Eyebrows: a tapering shape, the hairs near the nose pointing up, the rest sweeping outwards; under
    # them a soft fill, so the brow reads as a whole from further off.
    def brow_shape(u):
        if female:
            thick = 0.5 * (1 - u) ** 0.4 * (0.4 + 0.6 * min(1.0, u / 0.12))
            centre = 0.5 + 0.08 * math.sin(math.pi * u)
        else:
            thick = 0.64 * (1 - u) ** 0.4 * (0.45 + 0.55 * min(1.0, u / 0.1))
            centre = 0.48 + 0.04 * math.sin(math.pi * u)
        return thick, centre

    u0, v0, u1, v1 = CARDS["brow"]
    xs = (np.arange(N) + 0.5) / N
    for row in range(int((1 - v1) * N), int((1 - v0) * N)):
        v = ((1 - (row + 0.5) / N) - v0) / (v1 - v0)
        for col_i in range(N):
            u = (xs[col_i] - u0) / (u1 - u0)
            thick, centre = brow_shape(u)
            d = abs(v - centre) / max(thick * 0.5, 1e-6)
            a = 0.8 * float(np.clip((1.0 - d) / 0.35, 0, 1)) * min(1.0, (1 - u) / 0.08)
            alpha[row, col_i] = a
            col[row, col_i] = 0.7
    count = 2200 if not female else 1700
    for _ in range(count):
        u = rng.uniform(0.0, 1.0)
        thick, centre = brow_shape(u)
        if thick < 0.04:
            continue
        v = centre + rng.uniform(-0.5, 0.5) * thick
        angle = math.radians(75 - 60 * min(1.0, u / 0.25) - 18 * max(0.0, u - 0.6) / 0.4) + rng.normal(0, 0.12)
        length = rng.uniform(0.045, 0.085)
        steps = 34
        x0, y0 = to_px("brow", u, v)
        # (Across the strip the texture is stretched: a hair's rise is scaled to the strip's height.)
        dx = math.cos(angle) * length
        dy = math.sin(angle) * length * 3.2
        shade = rng.uniform(0.75, 1.0)
        for k in range(steps):
            t = k / (steps - 1)
            x1, y1 = to_px("brow", u + dx * t, v + dy * t - 0.08 * t * t * length * 3)
            _stamp(alpha, col, x1, y1, 0.9 * (1 - 0.5 * t), 0.7, shade)
    # Eyelashes: strands from root (v=0) to tip, the upper long and curled, the lower short and sparse.
    for card, count, reach in (("lash_upper", 420, 1.0), ("lash_lower", 90, 0.5)):
        for _ in range(count):
            u = rng.uniform(0.0, 1.0)
            bend = rng.normal(0, 0.012) + (u - 0.5) * 0.03
            length = reach * rng.uniform(0.7, 1.0)
            shade = rng.uniform(0.7, 1.0)
            for k in range(60):
                t = k / 59
                x, y = to_px(card, u + bend * t * t, 0.04 + t * length * 0.92)
                _stamp(alpha, col, x, y, 1.6 * (1 - 0.7 * t), 0.9, shade)
        # (Thinning out at the corners.)
        u0, v0, u1, v1 = CARDS[card]
        rows = slice(int((1 - v1) * N), int((1 - v0) * N))
        uu = (np.arange(N) + 0.5) / N
        fade = np.clip(uu / 0.06, 0, 1) * np.clip((1 - uu) / 0.18, 0, 1)
        alpha[rows] *= fade[None, :]
        # The lash line: a dark band at the roots.
        for k in range(400):
            u = k / 399
            x, y = to_px(card, u, 0.05)
            _stamp(alpha, col, x, y, 5.0, 1.0, 0.5)
    image = bpy.data.images.new(f"{name}-hair", N, N, alpha=True)
    rgba = np.stack([col, col, col, alpha], axis=2)[::-1].astype(np.float32)
    image.pixels.foreach_set(rgba.ravel())
    image.file_format = "PNG"
    image.pack()
    return image


def srgb_to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def materials(atlas=None, cards=None):
    """One material per part: the part's colour (exported as its glTF base colour factor) times the
    shared texture; the eyebrows and eyelashes cut out by their texture's alpha."""
    out = []
    for name, colour, roughness in PARTS:
        m = bpy.data.materials.new(name)
        m.use_nodes = True
        nodes, links = m.node_tree.nodes, m.node_tree.links
        bsdf = nodes.get("Principled BSDF")
        bsdf.inputs["Roughness"].default_value = roughness
        rgb = [srgb_to_linear(c) for c in ww.hex_rgb(colour)]
        image = cards if name in ("eyebrows", "eyelashes") else atlas
        if image is None:
            bsdf.inputs["Base Color"].default_value = (*rgb, 1.0)
        else:
            tex = nodes.new("ShaderNodeTexImage")
            tex.image = image
            mix = nodes.new("ShaderNodeMix")
            mix.data_type = "RGBA"
            mix.blend_type = "MULTIPLY"
            mix.inputs["Factor"].default_value = 1.0
            links.new(tex.outputs["Color"], mix.inputs["A"])
            mix.inputs["B"].default_value = (*rgb, 1.0)
            links.new(mix.outputs["Result"], bsdf.inputs["Base Color"])
            if name in ("eyebrows", "eyelashes"):
                # (See-through where the texture's alpha is: exported as glTF alpha mode BLEND.)
                links.new(tex.outputs["Alpha"], bsdf.inputs["Alpha"])
                m.surface_render_method = "BLENDED"
                # (No shine: a strip seen edge on would catch the light as a white glint.)
                bsdf.inputs["Specular IOR Level"].default_value = 0.0
        if name in ("iris", "eye_white"):
            # (A faint, small highlight: a bright one hides the iris.)
            bsdf.inputs["Specular IOR Level"].default_value = 0.25
        if name in ("skin", "lips"):
            try:
                bsdf.inputs["Subsurface Weight"].default_value = 0.0
            except KeyError:
                pass
        out.append(m)
    return out


def landmarks(co, body, J, mats, faces, hair, cuts, rims):
    """Points the texture is painted round."""
    def side(s):
        return co[:, 0] * s > 0

    eye = {1: body.eye["l"]["centre"], -1: body.eye["r"]["centre"]}
    ez = eye[1][2]
    mid = np.abs(co[:, 0]) < 0.004
    lip_verts = np.unique([v for f, m in zip(faces, mats) if m == PART["lips"] for v in f])
    mouth = co[lip_verts].mean(0)
    lips_front = co[lip_verts, 1].min()
    band = mid & (co[:, 2] < ez - 0.012) & (co[:, 2] > mouth[2] + 0.01)
    nose = co[band][np.argmin(co[band, 1])]
    band = mid & (co[:, 2] < mouth[2] - 0.025) & (co[:, 2] > mouth[2] - 0.07)
    chin = co[band][np.argmin(co[band, 1])]
    marks = {"eye": eye, "eye_r": body.eye["l"]["radius"], "nose": nose, "chin": chin, "mouth": mouth, "underwear": cuts, "rims": rims, "lips_front": lips_front}
    for key in ("ear", "elbow", "knee", "hand", "toes", "brow", "nipple"):
        marks[key] = {}
    for s, n in ((1, "l"), (-1, "r")):
        band = side(s) & (np.abs(co[:, 2] - (ez - 0.02)) < 0.02) & (np.abs(co[:, 1] - J["Head"][1]) < 0.06)
        marks["ear"][s] = co[band][np.argmax(np.abs(co[band, 0]))]
        marks["elbow"][s] = J[f"lowerarm_{n}"]
        marks["knee"][s] = J[f"calf_{n}"] + np.array([0, -0.05, 0])
        marks["hand"][s] = J[f"hand_{n}"] + (J[f"hand_{n}.tail"] - J[f"hand_{n}"]) * 1.1
        marks["toes"][s] = J[f"ball_{n}"] + (J[f"ball_{n}.tail"] - J[f"ball_{n}"]) * 0.8
        brows = [h for h in hair if h.mat[0] == PART["eyebrows"] and h.co[:, 0].mean() * s > 0]
        marks["brow"][s] = brows[0].co.mean(0) if brows else eye[s] + np.array([0, -0.01, 0.02])
        band = side(s) & (np.abs(co[:, 0]) > 0.05) & (np.abs(co[:, 0]) < 0.15) & (co[:, 2] > J["spine_02"][2]) & (co[:, 2] < J["spine_03"][2] + 0.04)
        marks["nipple"][s] = co[band][np.argmin(co[band, 1])]
    return marks


def make(B):
    ww.reset()
    name = B["name"]
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
    log(f"{name}: body of {len(co)} vertices")
    W = heat_weights(name, co, quads, J)
    log(f"bone heat weights ({int((W.sum(1) == 0).sum())} vertices missed)")
    W = fix_weights(W, co, quads, J, nbrs)
    log("weights fixed")

    # Into the rest pose: legs straight, arms in the A-pose. (The head doesn't move, nor its helpers.)
    R, J2 = rest_pose(J)
    rots = [R[b] for b in BONE_NAMES]
    heads = [J[b] for b in BONE_NAMES]
    new_heads = [J2[b] for b in BONE_NAMES]
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

    mats = np.full(len(bf), PART["skin"])
    mouth = mouth_inside(co, quads, np.isin(bf, wa.face_set("lips_solid")))
    mats[lip_faces(base, bf, mouth)] = PART["lips"]
    mats[nail_faces(base, body.co_mh, bf)] = PART["nails"]
    uv = base.uv[base.quad_uv[bf]]
    # (MakeHuman's mouth inside shares its texture space with other skin: it gets a dark square instead.)
    uv[mouth] = [ATLAS["mouth"](0.1, 0.1), ATLAS["mouth"](0.9, 0.1), ATLAS["mouth"](0.9, 0.9), ATLAS["mouth"](0.1, 0.9)]
    body_keys = {k: body.keys[k][used] for k in key_names}
    # The underwear, from the skin as MakeHuman made it (the head's subdivision doesn't reach it).
    under, cuts = underwear(B, co, quads, body_keys, W, J, key_names)

    # The head and neck subdivided once (Catmull-Clark), for a smoother outline and finer lids, lips and nose.
    head = W[:, BONE_INDEX["Head"]] + W[:, BONE_INDEX["neck_01"]] > 0.98
    apply, faces, corners = wa.subdivide_region(co, quads, head[quads].all(1))
    co = apply(co)
    body_keys = {k: apply(v) for k, v in body_keys.items()}
    W = apply(W)
    W /= W.sum(1, keepdims=True)
    mats = [int(mats[f]) for f, _ in corners]
    uv = [[w @ uv[f] for w in ws] for f, ws in corners]
    parts = [Part(co, faces, mats, uv, body_keys, W)]
    eyes = [eyeball(B, body, s_, key_names) for s_ in ("l", "r")]
    tris, bvh = surface(co, faces)
    hair, roots = mh_lashes(B, base, body, key_names)
    for s_, sign in (("l", 1.0), ("r", -1.0)):
        hair.append(brow(B, co, body_keys, roots[s_][0], s_, sign, key_names, tris, bvh))

    # The texture: baked where everything is, then painted.
    rims = [(roots[s_][0], 1.0) for s_ in ("l", "r")] + [(roots[s_][1], 0.5) for s_ in ("l", "r")]
    marks = landmarks(co, body, J, mats, faces, hair, cuts, rims)
    if os.environ.get("WW_NO_BAKE"):
        atlas = None
    else:
        bake_a = join(name + "-bake", parts + eyes, key_names)
        bake_u = join(name + "-bake-under", under, key_names)
        for o in (bake_a, bake_u):
            for m in materials():
                o.data.materials.append(m)
        maps = bake_maps([bake_a], [bake_u])
        for o in (bake_a, bake_u):
            bpy.data.objects.remove(o)
        for m in list(bpy.data.materials):
            bpy.data.materials.remove(m)
        for image in [i for i in bpy.data.images if i.name.startswith("bake-")]:
            bpy.data.images.remove(image)
        atlas = atlas_image(name, paint(B, maps, marks))
        log("painted")
    cards = cards_image(B, name)
    obj = join(name, parts + eyes + under + hair, key_names)
    for m in materials(atlas, cards):
        obj.data.materials.append(m)
    log(f"{len(obj.data.vertices)} vertices")

    rig = make_rig(name, J)
    obj.parent = rig
    obj.modifiers.new("Armature", "ARMATURE").object = rig
    ww.Animator(rig).key_all(ww.humanoid_actions(arm_down=72 - APOSE))
    export(name, obj, rig)
    return obj, rig, body


def export(name, obj, rig):
    bpy.ops.object.select_all(action="DESELECT")
    for o in (obj, rig):
        o.select_set(True)
    bpy.context.view_layer.objects.active = rig
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
    log(f"{name}: {len(obj.data.vertices)} vertices, {len(obj.data.polygons)} faces, {size / 1e6:.2f} MB")


if __name__ == "__main__":
    which = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else ["male", "female"]
    for w in which:
        make({"male": MALE, "female": FEMALE}[w])
