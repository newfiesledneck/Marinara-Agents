"""The player's base avatar: a man 1.78 m tall and a woman 1.68 m, bald, with a choice of underwear, on
the people's skeleton so every recorded animation plays on them. Writes assets/models/avatar-male.glb and
avatar-female.glb (and a debug .blend and the texture's JPEG in assets/build). Run (BLENDER: your
Blender executable; add `-- male` or `-- female` for one of them):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_avatar.py

Base mesh and shapes: MakeHuman's hm08 mesh and morph targets (CC0), read as data by our own code
(`wwavatar.py`; MakeHuman and its add-on are neither run nor copied), adapted in Blender by ThatOneCan.

- The body: MakeHuman's macro targets mixed for a young adult (gender, muscle, weight, height, ideal
  proportions) with a few of its face and expression targets, folded into the mesh; the fingers relaxed
  into a soft curl; the woman's crotch and nipples smoothed plain (nothing explicit shows with no
  underwear on); the head, jaw and upper neck subdivided once (Catmull-Clark), the lips drawn closed.
  Eyeballs of our own with a cornea rising over the iris, a wet line along each lower lid and a caruncle
  in each inner corner; MakeHuman's eyelash strips; eyebrows laid on the skin by casting rays at it.
- The rig: the people's bones at MakeHuman's joint helpers. Blender's automatic (bone heat) weights,
  then reshaped along the arms and legs (clean bends at the elbows, wrists, knees and ankles, fingers
  and toes wholly on the hand and ball), the head, the collarbones and hips, and smoothed over the
  trunk. Into the rest pose by our own skinning: legs hanging straight under the hips (as the people's
  T-pose has them), arms 45 degrees below level, elbows bent 10 degrees. The game turns the arms up into
  its T-pose when it loads a body, so the people's clips play the same; the model's own Idle, Walk and
  Attack are `wwblend.humanoid_actions` with the arms lowered from the A-pose.
- The body mesh (named as the file, `avatar-male` or `avatar-female`) has these materials, so the game
  can recolour each through its base colour factor: skin, eye_white, iris, eyebrows, eyelashes, lips,
  nails. Skin, lips, nails and the eyes share one 2048 px texture of shading and detail, near white (the
  colour is the material's), and a normal map of the skin's fine relief (pores, knuckle and joint
  creases, the eyelid's fold, the lips' lines); the eyebrows and eyelashes use a small texture of hair
  strokes whose alpha cuts them out (alpha BLEND).
- Underwear: every style a mesh of its own beside the body, skinned and with the same shape keys, so the
  game shows the ones it wants and hides the rest (none at all is fine). Bottoms: underwear-bottom-briefs,
  -boxer_briefs and -boxers (both bodies), -bikini, -thong and -boyshorts (hers); tops (hers):
  underwear-top-bra, -sports_bra and -bralette. Each is cut from the skin along smooth lines, lifted to
  the fabric's thickness with rolled edges, a raised elastic band and real straps, and has two materials:
  underwear (the cloth) and underwear_trim (bands, bindings, straps), sharing a texture and normal map of
  their own (knit or weave, ribbing, seams and stitching).
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
from mathutils.kdtree import KDTree

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import wwavatar as wa  # noqa: E402
import wwblend as ww  # noqa: E402

# Material parts: (name, colour, roughness).
PARTS = [
    ("skin", 0xD9A183, 0.5),
    ("underwear", 0xE8E4DC, 0.85),
    ("eye_white", 0xF0ECE6, 0.06),
    ("iris", 0x5B7A92, 0.05),
    ("eyebrows", 0x30221A, 1.0),
    ("eyelashes", 0x141010, 1.0),
    ("lips", 0xB8746C, 0.35),
    ("nails", 0xE6B3A4, 0.3),
    ("underwear_trim", 0xDCD6CC, 0.6),
]
PART = {p[0]: i for i, p in enumerate(PARTS)}
APOSE = 45  # the arms' angle below level at rest
CORNEA = 0.06  # how far the cornea rises over the iris (of the eye's radius)

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
        **wa.sided("eyes/eye-scale-incr", 0.42),
        "head/head-scale-vert-decr": 0.15,
        "head/head-square": 0.3,
        "neck/measure-neck-circ-incr": 0.3,
        "head/head-back-scale-depth-decr": 0.3,
        # Character: a straight nose with a hint of a bridge, lower and straighter brows over slightly
        # deeper-set eyes, a little hollow under the cheekbones, a fuller lower lip, a defined philtrum and
        # the corners of the mouth just turned up.
        "nose/nose-hump-incr": 0.25,
        "nose/nose-nostrils-width-decr": 0.2,
        "eyebrows/eyebrows-trans-down": 0.3,
        "eyebrows/eyebrows-angle-down": 0.2,
        **wa.sided("eyes/eye-push1-in", 0.2),
        **wa.sided("eyes/eye-height2-decr", 0.15),
        **wa.sided("cheek/cheek-inner-decr", 0.25),
        "mouth/mouth-lowerlip-volume-incr": 0.2,
        "mouth/mouth-philtrum-volume-incr": 0.3,
        "mouth/mouth-angles-up": 0.12,
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
        # Character: a softly scooped nose with slim nostrils, a fuller lower lip and mouth corners just
        # turned up, a little more fullness in the cheeks, a neat defined chin, brows a touch higher.
        "nose/nose-hump-decr": 0.2,
        "nose/nose-nostrils-width-decr": 0.25,
        "mouth/mouth-lowerlip-volume-incr": 0.25,
        "mouth/mouth-angles-up": 0.18,
        "mouth/mouth-philtrum-volume-incr": 0.2,
        **wa.sided("cheek/cheek-volume-incr", 0.15),
        "chin/chin-prominent-incr": 0.12,
        "eyebrows/eyebrows-trans-up": 0.15,
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


def seal_lips(co, faces, mats):
    """Closes the lips. MakeHuman's lips meet only inside a groove whose mouth shows as a dark gap between
    them; here the lips near where they meet are drawn together (up and down, more the closer they are
    to the line, never past one another), leaving only a fine line."""
    lipv = np.array(sorted({v for f, m in zip(faces, mats) if m == PART["lips"] for v in f}))
    other = {v for f, m in zip(faces, mats) if m != PART["lips"] for v in f}
    border = np.array([v for v in lipv if v in other])
    x_half = np.abs(co[lipv, 0]).max()
    # Where they meet at each x: the lips' inner border (well behind their front).
    xs = np.linspace(-x_half * 0.97, x_half * 0.97, 25)
    zc, yf = [], []
    for x in xs:
        near = lipv[np.abs(co[lipv, 0] - x) < 0.002]
        front = co[near, 1].min()
        b = border[(np.abs(co[border, 0] - x) < 0.002) & (co[border, 1] > front + 0.0025)]
        zc.append(co[b, 2].mean() if len(b) else np.nan)
        yf.append(front)
    zc, yf = np.array(zc), np.array(yf)
    ok = ~np.isnan(zc)
    fit = np.polyfit(xs[ok], zc[ok], 4)
    front = np.interp(co[:, 0], xs, yf)
    d = co[:, 2] - np.polyval(fit, co[:, 0])
    a = 0.006
    t = np.clip(np.abs(d) / a, 0.0, 1.0)
    moved = np.sign(d) * a * (t - 0.9 * t * (1 - t) ** 2)
    w = wa.smoothstep(x_half + 0.003, x_half - 0.004, np.abs(co[:, 0])) * wa.smoothstep(0.012, 0.006, co[:, 1] - front)
    w *= np.abs(d) < a
    out = co.copy()
    out[:, 2] = co[:, 2] + (moved - d) * w
    return out


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
        self.at = lambda name: (wa.to_blender(base.joint(co, name)) - offset) * self.scale
        self.eye = {}
        for s in ("l", "r"):
            centre = (wa.to_blender(base.joint(co, f"{s}-eye")) - offset) * self.scale
            aim = (wa.to_blender(base.joint(co, f"{s}-eye-target")) - offset) * self.scale
            helper = base.groups[f"helper-{s}-eye"]
            radius = np.linalg.norm(self.co[helper] - centre, axis=1).mean()
            self.eye[s] = {"centre": centre, "aim": aim, "radius": radius, "helper": helper}


# How far each finger bends at its three joints (degrees), index to little finger, and the thumb's last two.
CURL = {2: (6, 12, 7), 3: (8, 15, 8), 4: (10, 18, 9), 5: (12, 21, 11), 1: (0, 7, 10)}


def curl_fingers(body, used):
    """Fingers relaxed: each bent a little at its joints towards the palm, more towards the little finger,
    as a hand hangs at rest (MakeHuman's are held straight). Each vertex follows the fingers near it, blended
    by distance (so the skin between them doesn't tear); shape key offsets turn with it."""
    co = body.co
    body.knuckles = []
    for s in ("l", "r"):
        J = lambda n: body.at(f"{s}-{n}")  # noqa: E731
        across = J("finger-2-1") - J("finger-5-1")
        along = J("finger-3-1") - J("hand")
        palm = -_unit(np.cross(across, along)) * (1 if s == "l" else -1)
        chains = {f: [J(f"finger-{f}-{k}") for k in range(1, 5)] for f in range(1, 6)}
        idx = used[np.linalg.norm(co[used] - J("finger-3-1"), axis=1) < 0.13]
        p0 = co[idx].copy()
        dist = np.stack([np.min([segment_distance(p0, a, b) for a, b in zip(ch[:-1], ch[1:])], axis=0) for ch in chains.values()], axis=1)
        soft = np.exp(-((dist - dist.min(1, keepdims=True)) / 0.004) ** 2)
        soft /= soft.sum(1, keepdims=True)
        new = np.zeros_like(p0)
        turns = np.zeros((len(idx), 3, 3))
        for col, (f, angles) in enumerate(CURL.items()):
            p = p0.copy()
            R_all = np.repeat(np.eye(3)[None], len(idx), axis=0)
            joints = [j.copy() for j in chains[f]]
            for k, deg in enumerate(angles[:3]):
                if not deg:
                    continue
                jk = joints[k]
                d = _unit(joints[k + 1] - jk)
                axis = _unit(np.cross(d, palm))
                w = wa.smoothstep(-0.004, 0.005, (p - jk) @ d)
                for i in np.nonzero(w > 0)[0]:
                    R = _turn(axis, math.radians(deg) * w[i])
                    p[i] = jk + R @ (p[i] - jk)
                    R_all[i] = R @ R_all[i]
                R = _turn(axis, math.radians(deg))
                for m in range(k + 1, 4):
                    joints[m] = jk + R @ (joints[m] - jk)
            for k in range(3):
                body.knuckles.append((s, f, k, joints[k].copy(), _unit(joints[k + 1] - joints[k]), -palm))
            wf = soft[:, f - 1][:, None]
            new += wf * p
            turns += wf[:, :, None] * R_all
        co[idx] = new
        for name in body.keys:
            body.keys[name][idx] = np.einsum("nij,nj->ni", turns, body.keys[name][idx])


def _turn(axis, angle):
    """A rotation matrix: `angle` radians about the unit vector `axis`."""
    x, y, z = axis
    c, s_ = math.cos(angle), math.sin(angle)
    C = 1 - c
    return np.array([[c + x * x * C, x * y * C - z * s_, x * z * C + y * s_], [y * x * C + z * s_, c + y * y * C, y * z * C - x * s_], [z * x * C - y * s_, z * y * C + x * s_, c + z * z * C]])


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
        mask = np.maximum(mask, wa.smoothstep(0.032, 0.01, np.linalg.norm(co - apex, axis=1)))
    out = wa.smooth_values(co, nbrs, rounds=40, factor=0.5, mask=mask)
    return wa.taubin(out, nbrs, 6, mask)


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
    angles = rings or [0, 5, 10, 15, 20, 25, iris_angle, 34, 39, 46, 60, 76, 94, 115, 140, 165, 180]
    x = np.cross(look, [0, 0, 1.0])
    x /= np.linalg.norm(x)
    z = np.cross(x, look)
    verts, faces, mats, uvs = [], [], [], []
    for i, a in enumerate(angles):
        ar = math.radians(a)
        if a in (0, 180):
            verts.append(c + look * math.cos(ar) * r * (1.0 + CORNEA if a == 0 else 1.0))
            continue
        # (The cornea: a clear dome over the iris, here a gentle rise of the eye's front.)
        bulge = 1.0 + CORNEA * math.cos(min(1.0, a / (iris_angle + 8)) * math.pi / 2) ** 2
        for j in range(segments):
            t = 2 * math.pi * j / segments
            d = look * math.cos(ar) + (x * math.cos(t) + z * math.sin(t)) * math.sin(ar)
            verts.append(c + d * r * bulge)
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
            d = d / np.linalg.norm(d) * r
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
    "mouth": _rect(0.775, 0.94, 0.795, 0.96),
    "wet": _rect(0.805, 0.94, 0.825, 0.96),
    "caruncle": _rect(0.835, 0.94, 0.855, 0.96),
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


def eye_wet(B, body, s, roots, key_names, co, keys, tris, bvh):
    """The wet line along the lower lid (a thin glossy strip from the lid's inner rim to the eyeball) and
    the caruncle (the small pink mound in the inner corner), in the eye white's material with pink squares
    of the texture. Each follows the skin under it through the shape keys."""
    e = body.eye[s]
    c, r = e["centre"], e["radius"]
    upper, lower = roots
    verts, faces, uvs = [], [], []
    # The strip: along the lower lid's roots (inner corner to outer), from just inside them to the eye.
    n = len(lower)
    ts = np.linspace(0, 1, 14)
    line = np.stack([np.interp(ts * (n - 1), np.arange(n), lower[:, i]) for i in range(3)], axis=1)
    for i, q in enumerate(line):
        out = (q - c) / np.linalg.norm(q - c)
        on_eye = c + out * (r * 1.012)
        taper = math.sin(math.pi * min(1.0, max(0.0, ts[i] * 1.15 - 0.02))) ** 0.5
        inner = q + (on_eye - q) * 0.45
        lift = np.array([0.0, 0.0, 0.00045 * taper])
        verts += [inner + lift, on_eye + lift * 0.6]
        uvs += [ATLAS["wet"](ts[i], 0.2), ATLAS["wet"](ts[i], 0.8)]
    for i in range(len(line) - 1):
        a = 2 * i
        faces.append([a, a + 2, a + 3, a + 1] if s == "l" else [a, a + 1, a + 3, a + 2])
    # The caruncle: a small flattened mound where the lids meet at the inner corner.
    k = (upper[0] + lower[0]) / 2
    out = (k - c) / np.linalg.norm(k - c)
    centre = k + (c + out * r - k) * 0.55
    fwd = np.array([0.0, -1.0, 0.0])
    side = np.cross(fwd, [0.0, 0.0, 1.0])
    up = np.array([0.0, 0.0, 1.0])
    base_i = len(verts)
    rings_, seg = 4, 8
    size = np.array([0.0016, 0.0011, 0.0013]) * (1.0 if B["female"] else 1.1)
    for i in range(rings_ + 1):
        a = math.pi * i / rings_
        for j in range(seg):
            t = 2 * math.pi * j / seg
            d = side * math.sin(a) * math.cos(t) * size[0] + up * math.sin(a) * math.sin(t) * size[2] + fwd * math.cos(a) * size[1]
            verts.append(centre + d)
            uvs.append(ATLAS["caruncle"](0.5 + 0.4 * math.sin(a) * math.cos(t), 0.5 + 0.4 * math.sin(a) * math.sin(t)))
    for i in range(rings_):
        for j in range(seg):
            a0 = base_i + i * seg + j
            a1 = base_i + i * seg + (j + 1) % seg
            faces.append([a0, a1, a1 + seg, a0 + seg])
    verts = np.array(verts)
    hit = [bvh.find_nearest(Vector(v)) for v in verts]
    tri = np.array([h[2] for h in hit])
    loc = np.array([h[0] for h in hit])
    bary = np.clip(wa.bary_attach(tris, co, tri, loc), 0, 1)
    bary /= bary.sum(1, keepdims=True)
    tv = tris[tri]
    kk = {name: (keys[name][tv] * bary[:, :, None]).sum(1) for name in key_names}
    W = np.zeros((len(verts), len(BONE_NAMES)))
    W[:, BONE_INDEX["Head"]] = 1.0
    fuv = [[uvs[v] for v in f] for f in faces]
    part = Part(verts, faces, [PART["eye_white"]] * len(faces), fuv, kk, W)
    # (Faces turned to face out of the eye.)
    for f in part.faces:
        pc = verts[f].mean(0)
        nrm = np.cross(verts[f[1]] - verts[f[0]], verts[f[2]] - verts[f[0]])
        if nrm @ (pc - c) < 0:
            f.reverse()
    part.uv = [[uvs[v] for v in f] for f in part.faces]
    return part


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
        f[mat_layer] = PART["underwear_trim"]


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
        f[mat_layer] = PART["underwear_trim"] if t else PART["underwear"]
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


# ── The texture ─────────────────────────────────────────────────────────────────────────────────────

SIZE = 2048
GSIZE = 2048  # the garments' texture
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
            if under:
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


def _soft(ao, covered):
    """Occlusion without lone dark specks (kept within reach of its neighbourhood's) and softened, each
    island first grown past its edge so the softening doesn't pull its border towards the background (a
    light line at every seam of the layout)."""
    ao = _dilate(np.where(covered, ao, 1.0)[..., None], covered, 14)[..., 0]
    ao = np.maximum(ao, _blur(ao, 6) - 0.12)
    return _blur(ao, 2)


def _palm_side(p, n, marks, s):
    """How much a point's normal faces the palm's way (-1 palm .. 1 back of the hand), from the knuckles."""
    backs = [b for side, f, k, pos, d, b in marks["knuckles"] if (side == "l") == (s > 0)]
    if not backs:
        return np.zeros(len(p))
    back = _unit(np.mean(backs, axis=0))
    return n @ back


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
    ao = _soft(ao, covered)
    rgb = np.full((SIZE, SIZE, 3), 0.8, dtype=np.float64)

    def pick(name):
        return covered & (part == PART[name])

    # Skin.
    sel = pick("skin") | pick("lips") | pick("nails")
    p = pos[sel]
    n_skin = nrm[sel]
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
    for side, f, k, pos_k, d, back in marks["knuckles"]:
        blush += (0.4 if k == 0 else 0.3) * _near(p, pos_k + back * 0.006, 0.009 if k == 0 else 0.006)
    blush += 0.6 * _near(p, marks["nose"], 0.018)
    blush += 0.25 * _near(p, marks["chin"], 0.025)
    blush = np.clip(blush, 0, 1)
    col *= 1 - blush[:, None] * np.array([0.0, 0.09, 0.11])
    # The lower legs a touch darker and warmer (more sun, less blood near the surface); palms and soles paler.
    for s in (1, -1):
        shin = wa.smoothstep(marks["knee"][s][2], marks["knee"][s][2] - 0.15, p[:, 2]) * (p[:, 0] * s > 0)
        col *= 1 - shin[:, None] * np.array([0.03, 0.045, 0.05])
        hand = marks["hand"][s]
        palm = _near(p, hand, 0.08) * wa.smoothstep(0.0, -0.6, _palm_side(p, n_skin, marks, s))
        col *= 1 + palm[:, None] * np.array([0.03, 0.04, 0.04])
    sole = wa.smoothstep(0.025, 0.005, p[:, 2]) * wa.smoothstep(-0.3, -0.8, n_skin[:, 2])
    col *= 1 + sole[:, None] * np.array([0.04, 0.05, 0.05])
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
    # His nipples, faintly. (Hers aren't painted: the body stays plain with no underwear on.)
    for s in (1, -1) if not female else ():
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
    meet = np.exp(-(((p[:, 2] - marks["mouth"][2]) / 0.0011) ** 2))
    # (Inside the mouth: tucked away, or the lips' inner faces, which face each other up and down.)
    nz = nrm[sel][:, 2]
    facing_in = wa.smoothstep(0.35, 0.75, np.abs(nz)) * (((nz > 0) & (p[:, 2] < marks["mouth"][2] + 0.002)) | ((nz < 0) & (p[:, 2] > marks["mouth"][2] - 0.002)))
    inner = np.maximum(wa.smoothstep(0.75, 0.35, ao[sel]), facing_in)
    rgb[sel] = (0.97 + lines - 0.22 * meet)[:, None] * np.array([1.0, 0.97, 0.97]) * (1 - 0.4 * inner)[:, None]

    # Nails: paler at the tip, a pale half-moon at the root.
    sel = pick("nails")
    p = pos[sel]
    rgb[sel] = (0.95 + wa.value_noise(p * np.array([1, 1, 0.3]), 1200.0, seed=6) * 0.02)[:, None] * np.array([1.0, 0.98, 0.98])

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

    # The wet line (a glossy pale pink) and the caruncle (a deeper pink, darker at its rim).
    for key, colour in (("wet", (0.93, 0.78, 0.76)), ("caruncle", (0.86, 0.55, 0.53))):
        u0, v0 = ATLAS[key](0, 0)
        u1, v1 = ATLAS[key](1, 1)
        rgb[int((1 - v1) * SIZE) : int((1 - v0) * SIZE) + 1, int(u0 * SIZE) : int(u1 * SIZE) + 1] = colour
    # Inside the mouth (what shows between the lips): a dark square of its own.
    u0, v0 = ATLAS["mouth"](0, 0)
    u1, v1 = ATLAS["mouth"](1, 1)
    rgb[int((1 - v1) * SIZE) : int((1 - v0) * SIZE) + 1, int(u0 * SIZE) : int(u1 * SIZE) + 1] = (0.25, 0.13, 0.13)

    # Shading: occlusion, and a touch darker in creases and lighter on ridges (the nose's line, the lids'
    # folds, the ear's whorls, the lips' corners).
    curve = _dilate(np.where(covered, maps["curve"][..., 0], 0.5)[..., None], covered, 14)[..., 0]
    curve = _blur(curve, 3) - 0.5
    shade = (0.5 + 0.5 * ao) * np.clip(1 + 1.0 * curve, 0.9, 1.04)
    rgb *= shade[..., None]
    rgb = _dilate(rgb, covered, 12)
    skin = covered & np.isin(part, [PART["skin"], PART["lips"], PART["nails"]])
    height = np.zeros(part.shape)
    height[skin] = skin_height(B, pos[skin], nrm[skin], part[skin], marks)
    return np.clip(rgb, 0, 1), normal_from_height(pos, nrm, skin, height)


def skin_height(B, p, n, part, marks):
    """The skin's fine relief (metres), for the normal map: pores (finer on the lids and lips, coarser on the
    nose and cheeks), a faint grain, creases over the knuckles and across the palm side of each finger
    joint, fine lines at the back of the elbows and over the knees, the upper eyelid's fold, and the lips'
    upright lines. The mesh holds the forms; this is only what's too fine for it."""
    female = B["female"]
    pores = wa.value_noise(p, 1700.0, seed=21) * 0.6 + wa.value_noise(p, 3400.0, seed=22) * 0.4
    face = _near(p, marks["nose"], 0.06)
    nose_cheek = np.clip(_near(p, marks["nose"], 0.03) + sum(_near(p, marks["eye"][s] + np.array([s * 0.012, -0.012, -0.035]), 0.03) for s in (1, -1)), 0, 1)
    amount = 0.000022 * (1 + 0.8 * nose_cheek) * (0.75 if female else 1.0)
    h = amount * pores
    h += 0.000012 * wa.value_noise(p * np.array([1.0, 1.0, 3.0]), 900.0, seed=23) * (1 - face)
    # Knuckles: a few fine creases across the back of each joint; one sharper line across the palm side.
    for side, f, k, pos_k, d, back in marks["knuckles"]:
        rel = p - pos_k
        near = np.einsum("ij,ij->i", rel, rel) < 0.012**2
        if not near.any():
            continue
        q, nq = rel[near], n[near]
        u = q @ d
        r = np.linalg.norm(q - np.outer(u, d), axis=1)
        dorsal = wa.smoothstep(-0.1, 0.5, nq @ back)
        palmar = wa.smoothstep(-0.1, -0.5, nq @ back)
        spread = 0.004 if k else 0.006
        lines = -np.abs(np.sin(np.pi * u / 0.0011)) * np.exp(-((u / spread) ** 2)) * np.exp(-((r / 0.011) ** 2))
        crease = -np.exp(-(((u + (0.002 if k else 0.008)) / 0.0005) ** 2)) * np.exp(-((r / 0.012) ** 2))
        h[near] += 0.00006 * lines * dorsal + 0.00012 * crease * palmar
    for s in (1, -1):
        # Elbows: fine lines across the arm over its point (behind).
        rel = p - marks["elbow"][s]
        u = rel @ marks["arm"][s]
        behind = wa.smoothstep(0.0, 0.015, rel[:, 1])
        mask = np.exp(-(np.linalg.norm(rel, axis=1) / 0.03) ** 2) * behind
        h -= 0.00005 * mask * np.abs(np.sin(np.pi * u / 0.0032 + 1.5 * wa.value_noise(p, 150.0, seed=24)))
        # Knees: soft lines across the leg above and below the kneecap.
        rel = p - marks["knee"][s]
        u = rel @ marks["leg"][s]
        front = wa.smoothstep(0.0, -0.02, rel[:, 1])
        mask = np.exp(-(np.linalg.norm(rel, axis=1) / 0.04) ** 2) * front * (1 - np.exp(-((u / 0.012) ** 2)))
        h -= 0.00005 * mask * np.abs(np.sin(np.pi * u / 0.004 + 1.5 * wa.value_noise(p, 120.0, seed=25)))
    # The upper eyelid's fold: a soft line above the lashes, following them.
    for rim, strength in marks["rims"]:
        if strength < 1.0:
            continue
        near = np.nonzero(np.linalg.norm(p - rim.mean(0), axis=1) < 0.03)[0]
        q = p[near]
        d = np.full(len(q), 1.0)
        for a, b in zip(rim[:-1], rim[1:]):
            ab = b - a
            t = np.clip(((q - a) @ ab) / (ab @ ab), 0, 1)
            d = np.minimum(d, np.linalg.norm(q - (a + np.outer(t, ab)), axis=1))
        above = q[:, 2] > np.interp(q[:, 0], *zip(*sorted(zip(rim[:, 0], rim[:, 2]))))
        fold = 0.0065 if female else 0.0058
        h[near] -= 0.00022 * np.exp(-(((d - fold) / 0.0009) ** 2)) * above
    # Lips: fine upright lines.
    lips = part == PART["lips"]
    h[lips] += 0.00004 * wa.value_noise(p[lips] * np.array([1.0, 0.12, 0.1]), 2200.0, seed=26)
    return h


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


def save_texture(name, rgb, size, colour=True):
    """A texture saved as a JPEG in assets/build and packed from there (so the .glb carries a JPEG)."""
    image = bpy.data.images.new(name, size, size, alpha=False)
    rgba = np.concatenate([rgb, np.ones((size, size, 1))], axis=2).astype(np.float32)
    image.pixels.foreach_set(rgba.ravel())
    os.makedirs(ww.BUILD, exist_ok=True)
    path = os.path.join(ww.BUILD, f"{name}.jpg")
    image.filepath_raw = path
    image.file_format = "JPEG"
    image.save(filepath=path, quality=93)
    bpy.data.images.remove(image)
    image = bpy.data.images.load(path)
    if not colour:
        image.colorspace_settings.name = "Non-Color"
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
            thick = 0.56 * (1 - u) ** 0.45 * (0.45 + 0.55 * min(1.0, u / 0.1))
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


def materials(atlas=None, cards=None, normal=None, gatlas=None, gnormal=None):
    """One material per part: the part's colour (exported as its glTF base colour factor) times its
    texture (the skin's, the garments' or the hair strokes'), with a normal map for the skin and the
    garments; the eyebrows and eyelashes cut out by their texture's alpha."""
    out = []
    for name, colour, roughness in PARTS:
        m = bpy.data.materials.new(name)
        m.use_nodes = True
        nodes, links = m.node_tree.nodes, m.node_tree.links
        bsdf = nodes.get("Principled BSDF")
        bsdf.inputs["Roughness"].default_value = roughness
        rgb = [srgb_to_linear(c) for c in ww.hex_rgb(colour)]
        garment = name.startswith("underwear")
        image = cards if name in ("eyebrows", "eyelashes") else (gatlas if garment else atlas)
        bump = gnormal if garment else (normal if name in ("skin", "lips", "nails") else None)
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
        if bump is not None:
            nt = nodes.new("ShaderNodeTexImage")
            nt.image = bump
            nm = nodes.new("ShaderNodeNormalMap")
            links.new(nt.outputs["Color"], nm.inputs["Color"])
            links.new(nm.outputs["Normal"], bsdf.inputs["Normal"])
        if garment:
            # (Cloth: a soft sheen at grazing angles, exported as KHR_materials_sheen.)
            bsdf.inputs["Sheen Weight"].default_value = 0.35
            bsdf.inputs["Sheen Roughness"].default_value = 0.6
            bsdf.inputs["Specular IOR Level"].default_value = 0.3
        if name in ("iris", "eye_white"):
            # (Wet and glossy: a small sharp highlight.)
            bsdf.inputs["Specular IOR Level"].default_value = 0.5
        if name in ("skin", "lips"):
            try:
                bsdf.inputs["Subsurface Weight"].default_value = 0.0
            except KeyError:
                pass
        out.append(m)
    return out


def landmarks(co, body, J, mats, faces, hair, rims):
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
    marks = {"eye": eye, "eye_r": body.eye["l"]["radius"], "nose": nose, "chin": chin, "mouth": mouth, "rims": rims, "lips_front": lips_front}
    for key in ("ear", "elbow", "knee", "hand", "toes", "brow", "nipple", "ankle", "arm", "leg"):
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
        marks["ankle"][s] = J[f"foot_{n}"]
        marks["arm"][s] = _unit(J[f"hand_{n}"] - J[f"lowerarm_{n}"])
        marks["leg"][s] = _unit(J[f"foot_{n}"] - J[f"calf_{n}"])
    marks["knuckles"] = body.knuckles
    return marks


def make(B):
    ww.reset()
    name = B["name"]
    base = wa.Base()
    body = Body(B, base)
    key_names = list(body.keys)
    bf = body.body_faces
    used = np.unique(base.quads[bf])
    curl_fingers(body, used)
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
    body.knuckles = [(side, f, k, (J2[f"hand_{side}"] + R[f"hand_{side}"] @ (pos - J[f"hand_{side}"]) - shift) * s, R[f"hand_{side}"] @ d, R[f"hand_{side}"] @ back) for side, f, k, pos, d, back in body.knuckles]
    J = {k: (v - shift) * s for k, v in J2.items()}
    body.joints = J
    for e in body.eye.values():
        e["centre"] = (e["centre"] - shift) * s
        e["aim"] = (e["aim"] - shift) * s
        e["radius"] *= s
    co = smooth_private(B, body.co[used], J, nbrs)
    body.co[used] = co

    mats = np.full(len(bf), PART["skin"])
    mouth = mouth_inside(co, quads, np.isin(bf, wa.face_set("lips_solid")))
    mats[lip_faces(base, bf, mouth)] = PART["lips"]
    mats[nail_faces(base, body.co_mh, bf)] = PART["nails"]
    uv = base.uv[base.quad_uv[bf]]
    # (MakeHuman's mouth inside shares its texture space with other skin: it gets a dark square instead.)
    uv[mouth] = [ATLAS["mouth"](0.1, 0.1), ATLAS["mouth"](0.9, 0.1), ATLAS["mouth"](0.9, 0.9), ATLAS["mouth"](0.1, 0.9)]
    body_keys = {k: body.keys[k][used] for k in key_names}
    # (The skin as MakeHuman made it, before the head's subdivision: what the underwear is cut from.)
    co0, quads0, W0 = co, quads, W
    arms0 = W0[:, [BONE_INDEX[f"{b}_{s_}"] for b in ("upperarm", "lowerarm", "hand") for s_ in "lr"]].sum(1)

    # The head and neck subdivided once (Catmull-Clark), for a smoother outline and finer lids, lips and nose.
    # (The region is the whole head and the upper neck, chosen by shape, so its border, where five-sided
    # faces join it to the rest, runs round the neck well below the jaw.)
    nk = J["neck_01"]
    head = (co[:, 2] > nk[2] + 0.03) | ((co[:, 2] > nk[2] - 0.04) & (np.abs(co[:, 0]) < 0.08))
    head &= W[:, [BONE_INDEX[f"{b}_{s_}"] for b in ("upperarm", "lowerarm", "hand", "clavicle") for s_ in "lr"]].sum(1) < 0.2
    apply, faces, corners = wa.subdivide_region(co, quads, head[quads].all(1))
    co = apply(co)
    body_keys = {k: apply(v) for k, v in body_keys.items()}
    W = apply(W)
    W /= W.sum(1, keepdims=True)
    mats = [int(mats[f]) for f, _ in corners]
    uv = [[w @ uv[f] for w in ws] for f, ws in corners]
    co = seal_lips(co, faces, mats)
    parts = [Part(co, faces, mats, uv, body_keys, W)]
    eyes = [eyeball(B, body, s_, key_names) for s_ in ("l", "r")]
    tris, bvh = surface(co, faces)
    hair, roots = mh_lashes(B, base, body, key_names)
    for s_, sign in (("l", 1.0), ("r", -1.0)):
        hair.append(brow(B, co, body_keys, roots[s_][0], s_, sign, key_names, tris, bvh))
        eyes.append(eye_wet(B, body, s_, roots[s_], key_names, co, body_keys, tris, bvh))

    # The underwear: every style a mesh of its own on the finished skin.
    skin = Skin(co, faces, W, body_keys)
    frame = Frame(B, co0, J)
    wear = garments(B, (co0, quads0, wa.vertex_normals(co0, quads0), arms0), skin, frame, key_names)
    garment_uvs(wear, key_names)

    # The textures: baked where everything is, then painted.
    rims = [(roots[s_][0], 1.0) for s_ in ("l", "r")] + [(roots[s_][1], 0.5) for s_ in ("l", "r")]
    marks = landmarks(co, body, J, mats, faces, hair, rims)
    atlas = normal = gatlas = gnormal = None
    if not os.environ.get("WW_NO_BAKE"):
        bake_a = join(name + "-bake", parts + eyes, key_names)
        bake_g = [join(g.name + "-bake", [g.part], key_names) for g in wear]
        for o, g in zip(bake_g, wear):
            a = g.attrs
            for nm, cols in (("ww1", a[:, :3]), ("ww2", np.c_[a[:, 3:5], np.zeros(len(a))])):
                at = o.data.color_attributes.new(nm, "FLOAT_COLOR", "POINT")
                at.data.foreach_set("color", np.c_[cols, np.ones(len(cols))].astype(np.float32).ravel())
        for o in [bake_a] + bake_g:
            for m in materials():
                o.data.materials.append(m)
        for o in bake_g:
            o.hide_render = True
        maps = bake_maps([bake_a], [])
        for o in bake_g:
            o.hide_render = False
        gmaps = bake_garments(bake_g, bake_a, GSIZE)
        for o in [bake_a] + bake_g:
            bpy.data.objects.remove(o)
        for m in list(bpy.data.materials):
            bpy.data.materials.remove(m)
        for image in [i for i in bpy.data.images if i.name.startswith(("bake-", "gbake-"))]:
            bpy.data.images.remove(image)
        rgb, nmap = paint(B, maps, marks)
        atlas = save_texture(f"{name}-texture", rgb, SIZE)
        normal = save_texture(f"{name}-normal", nmap, SIZE, colour=False)
        grgb, gnmap = paint_garments(wear, gmaps, frame, GSIZE)
        gatlas = save_texture(f"{name}-underwear", grgb, GSIZE)
        gnormal = save_texture(f"{name}-underwear-normal", gnmap, GSIZE, colour=False)
        log("painted")
    cards = cards_image(B, name)
    shared = materials(atlas, cards, normal, gatlas, gnormal)
    obj = join(name, parts + eyes + hair, key_names)
    pieces = [join(g.name, [g.part], key_names) for g in wear]
    for o in [obj] + pieces:
        o.data.name = o.name
        for m in shared:
            o.data.materials.append(m)
    log(f"{len(obj.data.vertices)} vertices; underwear " + ", ".join(f"{g.name} {len(g.part.co)}" for g in wear))

    rig = make_rig(name, J)
    for o in [obj] + pieces:
        o.parent = rig
        o.modifiers.new("Armature", "ARMATURE").object = rig
    ww.Animator(rig).key_all(ww.humanoid_actions(arm_down=72 - APOSE))
    export(name, [obj] + pieces, rig)
    return obj, rig, body


def export(name, objs, rig):
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs + [rig]:
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
    log(f"{name}: {sum(len(o.data.vertices) for o in objs)} vertices, {sum(len(o.data.polygons) for o in objs)} faces, {size / 1e6:.2f} MB")


if __name__ == "__main__":
    which = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else ["male", "female"]
    for w in which:
        make({"male": MALE, "female": FEMALE}[w])
