"""The player's base avatar: a man 1.78 m tall and a woman 1.68 m, bald, with a choice of underwear, the
5e races' shapes and parts (tusks, horns, a tail, beards), on the people's skeleton so every recorded
animation plays on them. Writes assets/models/avatar-male.glb and
avatar-female.glb (and a debug .blend and the texture's JPEG in assets/build). Run (BLENDER: your
Blender executable; add `-- male` or `-- female` for one of them):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_avatar.py

Base mesh and shapes: MakeHuman's hm08 mesh and morph targets (CC0), read as data by our own code
(`wwavatar.py`; MakeHuman and its add-on are neither run nor copied), adapted in Blender by ThatOneCan. Skins,
eye pictures, eyebrows and eyelashes: MakeHuman's system assets (CC0), read as data the same way.

- The body: MakeHuman's macro targets mixed for a young adult (gender, muscle, weight, height, ideal
  proportions) with a few of its face and expression targets, folded into the mesh; the fingers relaxed
  into a soft curl; the woman's crotch and nipples smoothed plain (nothing explicit shows with no
  underwear on); the head, jaw and upper neck subdivided once (Catmull-Clark), the lips drawn closed.
  Eyeballs of our own with a cornea rising over the iris, a wet line along each lower lid and a caruncle
  in each inner corner.
- The rig: the people's bones at MakeHuman's joint helpers. Blender's automatic (bone heat) weights,
  then reshaped along the arms and legs (clean bends at the elbows, wrists, knees and ankles, fingers
  and toes wholly on the hand and ball), the head, the collarbones and hips, and smoothed over the
  trunk. The fingers then get bones of their own, three each under the hand (thumb, index, middle, ring
  and pinky, _01 to _03, _l and _r), at MakeHuman's knuckle joints, with weights of our own across each
  knuckle (`finger_weights`); the baking and the fitting of underwear and parts know only the people's
  bones. Into the rest pose by our own skinning: legs hanging straight under the hips (as the people's
  T-pose has them), arms 45 degrees below level, elbows bent 10 degrees. The game turns the arms up into
  its T-pose when it loads a body, so the people's clips play the same; the model's own Idle, Walk and
  Attack are `wwblend.humanoid_actions` with the arms lowered from the A-pose.
- The body mesh (named as the file, `avatar-male` or `avatar-female`) has these materials, so the game
  can recolour each through its base colour factor: skin, eye_white, iris, lips, nails. Skin, lips and
  nails share one 2048 px texture of shading and detail, near white (the colour is the material's), and a
  normal map of the skin's fine relief (pores, knuckle and joint creases, the eyelid's fold, the lips'
  lines). The body keeps MakeHuman's texture layout, so each of MakeHuman's skins fits it as it is: they're
  written beside the model (assets/textures/avatar/avatar-<sex>-skin-<young|middle|old>-<caucasian|african|
  asian>.webp, with this body's soft shading in the creases) for the game to put on the skin, lips and
  nails in place of the tinted texture. The eyes (eye_white, iris) have a 512 px texture of their own made
  from MakeHuman's eye pictures: the model's has a grey iris the iris colour tints; one a picture,
  coloured as MakeHuman's, is written beside it (avatar-eyes-<colour>.webp).
- Eyebrows and eyelashes: MakeHuman's twelve brow and four lash styles, fitted to the face through their
  .mhclo files, on the Head bone and with the body's shape keys, each a mesh of its own beside the body
  (eyebrows-01..12, eyelashes-01..04; materials eyebrows and eyelashes) for the game to show one of each.
  They share one texture with every style in it, grey for the colour to tint, cut out by its alpha (BLEND).
- Underwear: every style a mesh of its own beside the body, skinned and with the same shape keys, so the
  game shows the ones it wants and hides the rest (none at all is fine). Bottoms: underwear-bottom-briefs,
  -boxer_briefs and -boxers (both bodies), -bikini, -thong and -boyshorts (hers); tops (hers):
  underwear-top-bra, -sports_bra and -bralette. Each is cut from the skin along smooth lines, lifted to
  the fabric's thickness with rolled edges, a raised elastic band and real straps, and has two materials:
  underwear (the cloth) and underwear_trim (bands, bindings, straps), sharing a texture and normal map of
  their own (knit or weave, ribbing, seams and stitching).
- Shape keys (glTF morph targets, each 0-1): thin, heavy, muscle, chest (the man) or bust (the woman),
  hips, waist (narrower), belly, shoulders, neck; and for the face jaw, cheeks, nose, eyes,
  ears_pointed; and age_middle (about 50) and age_old (about 72), MakeHuman's age macro with a stoop,
  the soles and the skull kept where they are, one of them set with the skin of that age. Height, limb
  length and head size are the game's to set by scaling bones.
- The races (the 5e SRD's; a dragonborn is a body of its own): six more shape keys after those, race_dwarf,
  race_halfling, race_gnome, race_elf, race_halforc and race_tiefling (a half-elf is race_elf and
  ears_pointed at a half; a human none). Each is MakeHuman's targets (`race_mixes`) plus shaping of our own
  (`race_shapes`: girth, the size of the hands and feet, a brow ridge, the shoulders' slope), holding what
  scaling bones can't give; nothing above the hairline moves, so hair and hats fit every race. The game
  completes each by scaling the figure, the legs, the arms and the head (RACE_SCALES). Every piece beside
  the body carries them too.
- The races' parts, each a mesh of its own beside the body, with its shape keys: tusks-01 and -02 (material
  teeth); horns-01 to -04 (horns: swept back, a ram's curl, nubs, tall), on the Head bone; tail-tiefling
  (skin, drawn with a patch of the back's own skin, on bones tail_01 to tail_05 under the pelvis, swaying in
  the model's own Idle); beard-01 to -05 (short, full, long, a dwarf's long beard with braids, a moustache
  with a goatee), moustache-01 and foothair-01 (a halfling's feet) (hair: cards and patches cut out of a
  near-white texture of strands by an alpha test, glTF MASK, for the game to tint as it tints the hair).
  The horns and tusks share a small texture of their own.
"""

import heapq
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

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import wwavatar as wa  # noqa: E402
import bake_brows as bb  # noqa: E402  (the baked brow and lash styles: HAIR_STYLES)
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
    # (The races' parts: tusks, horns, and facial hair.)
    ("teeth", 0xE9E1CF, 0.3),
    ("horns", 0x3A3230, 0.45),
    ("hair", 0x6B4A32, 0.8),
]
PART = {p[0]: i for i, p in enumerate(PARTS)}
APOSE = 45  # the arms' angle below level at rest
AGE_MIDDLE = 0.5 + (50 - 25) / 130  # MakeHuman's age setting for about 50 years (0.5 is 25, 1.0 is 90)
AGE_OLD = 0.5 + (72 - 25) / 130  # and for about 72
# The old body's stoop: each bone's own turn forward (degrees) about the body's side axis, and the collarbones'
# forward roll; the middle-aged body has a share of it.
STOOP = {"spine_02": 4.0, "spine_03": 6.0, "neck_01": -3.0, "Head": -6.0}
SHOULDERS_FORWARD = 6.0
STOOP_MIDDLE = 0.3
CORNEA = 0.06  # how far the cornea rises over the iris (of the eye's radius)
CARUNCLE_ANGLE = 50  # where the inner corner of the eye is, in degrees from the eye's front

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
    # Age: MakeHuman's age macro (0.5 is 25 years, 1.0 is 90) moved to about 50 and about 72, each a key of its
    # own (the game sets one of them, with the skin of that age); `settle_age` adds a stoop and keeps the
    # feet on the ground and the skull where the hair sits.
    keys["age_middle"] = macro_change(age=AGE_MIDDLE)
    keys["age_old"] = macro_change(age=AGE_OLD)
    order = ["thin", "heavy", "muscle", "bust" if female else "chest", "hips", "waist", "belly", "shoulders", "neck", "jaw", "cheeks", "nose", "eyes", "ears_pointed", "age_middle", "age_old"]
    # The races, after every other key (so those keep their places): MakeHuman's macro moved by a little
    # weight or muscle, plus its detail targets; `settle_races` adds shaping of our own and keeps the skull
    # where it is.
    # (A race's build, the macro's part, is kept apart as `_<key>` until `settle_races` folds it in: only a
    # share of it reaches the head, so a slim build doesn't mean a gaunt face.)
    for name, (moved, mix, _share) in race_mixes(B).items():
        keys["_" + name] = macro_change(**{k: min(1.0, max(0.0, macro[k] + d)) for k, d in moved.items()})
        keys[name] = detail(mix)
    # The face in detail (3D Avatar Maker): each a pair of keys, `<slider>.lo` and `<slider>.hi`, one each
    # side of the face as made, after every other key so those keep their places. ("eyes", the eye size's
    # larger end, is the key above; its smaller end is `eye_size.lo`.)
    detail_keys = []
    for slider, low, high in FACE_DETAIL + BODY_DETAIL + (BREAST_DETAIL if female else []):
        for end, mix in (("lo", low), ("hi", high)):
            if mix is None:
                continue
            both = {}
            for target, weight in mix.items():
                both.update(S(target, weight) if _sided(target) else {target: weight})
            keys[f"{slider}.{end}"] = detail(both)
            detail_keys.append(f"{slider}.{end}")
    return {k: keys[k] for k in order + list(RACES) + detail_keys + ["_" + name for name in RACES]}


def _sided(target):
    """Whether a MakeHuman target comes as a left and right pair (`eyes/l-eye-…` and `eyes/r-eye-…`)."""
    folder, name = target.split("/", 1)
    return os.path.exists(os.path.join(wa.DATA, "targets", folder, f"l-{name}.target.gz"))


# The face in detail: [slider, its smaller end's MakeHuman targets {target: weight}, its larger end's]. A
# target that comes in a left and right pair is given once, for both. Each slider's middle is the face as
# made. (3D Avatar Maker's src/looks.js FACE_DETAIL names the sliders in the same order.)
def _pair(folder, low, high, weight=1.0):
    return ({f"{folder}/{low}": weight}, {f"{folder}/{high}": weight})


FACE_DETAIL = [
    # Eyes
    ("eye_size", {"eyes/eye-scale-decr": 1.0}, None),
    ("eye_height", *_pair("eyes", "eye-trans-down", "eye-trans-up")),
    ("eye_spacing", *_pair("eyes", "eye-trans-in", "eye-trans-out")),
    ("eye_depth", *_pair("eyes", "eye-push1-out", "eye-push1-in")),
    ("eye_tilt", *_pair("eyes", "eye-corner2-down", "eye-corner2-up")),
    ("eye_opening", *_pair("eyes", "eye-height2-decr", "eye-height2-incr")),
    ("eyelid", *_pair("eyes", "eye-eyefold-up", "eye-eyefold-down")),
    ("eye_inner_fold", *_pair("eyes", "eye-epicanthus-out", "eye-epicanthus-in")),
    ("eye_bags", *_pair("eyes", "eye-bag-decr", "eye-bag-incr")),
    # Brows
    ("brow_height", *_pair("eyebrows", "eyebrows-trans-down", "eyebrows-trans-up")),
    ("brow_angle", *_pair("eyebrows", "eyebrows-angle-down", "eyebrows-angle-up")),
    ("brow_ridge", *_pair("eyebrows", "eyebrows-trans-backward", "eyebrows-trans-forward")),
    # Nose
    ("nose_length", *_pair("nose", "nose-scale-vert-decr", "nose-scale-vert-incr")),
    ("nose_width", *_pair("nose", "nose-scale-horiz-decr", "nose-scale-horiz-incr")),
    ("nose_depth", *_pair("nose", "nose-scale-depth-decr", "nose-scale-depth-incr")),
    ("nose_bridge", *_pair("nose", "nose-hump-decr", "nose-hump-incr")),
    ("nose_tip", *_pair("nose", "nose-point-down", "nose-point-up")),
    ("nose_tip_width", *_pair("nose", "nose-point-width-decr", "nose-point-width-incr")),
    ("nostrils", *_pair("nose", "nose-nostrils-width-decr", "nose-nostrils-width-incr")),
    ("nose_height", *_pair("nose", "nose-trans-down", "nose-trans-up")),
    # Mouth
    ("mouth_width", *_pair("mouth", "mouth-scale-horiz-decr", "mouth-scale-horiz-incr")),
    ("mouth_height", *_pair("mouth", "mouth-trans-down", "mouth-trans-up")),
    ("mouth_depth", *_pair("mouth", "mouth-trans-backward", "mouth-trans-forward")),
    ("upper_lip", *_pair("mouth", "mouth-upperlip-volume-decr", "mouth-upperlip-volume-incr")),
    ("lower_lip", *_pair("mouth", "mouth-lowerlip-volume-decr", "mouth-lowerlip-volume-incr")),
    ("cupids_bow", *_pair("mouth", "mouth-cupidsbow-decr", "mouth-cupidsbow-incr")),
    ("mouth_corners", *_pair("mouth", "mouth-angles-down", "mouth-angles-up")),
    # Jaw and chin
    ("jaw_forward", *_pair("chin", "chin-prognathism-decr", "chin-prognathism-incr")),
    ("jaw_width", *_pair("chin", "chin-bones-decr", "chin-bones-incr")),
    ("chin_height", *_pair("chin", "chin-height-decr", "chin-height-incr")),
    ("chin_width", *_pair("chin", "chin-width-decr", "chin-width-incr")),
    ("chin_prominence", *_pair("chin", "chin-prominent-decr", "chin-prominent-incr")),
    ("chin_cleft", *_pair("chin", "chin-cleft-decr", "chin-cleft-incr")),
    # Cheeks
    ("cheekbones", *_pair("cheek", "cheek-bones-decr", "cheek-bones-incr")),
    ("cheek_fullness", *_pair("cheek", "cheek-volume-decr", "cheek-volume-incr")),
    ("cheek_hollows", *_pair("cheek", "cheek-inner-incr", "cheek-inner-decr")),
    # Ears
    ("ear_size", *_pair("ears", "ear-scale-decr", "ear-scale-incr")),
    ("ear_angle", *_pair("ears", "ear-wing-decr", "ear-wing-incr")),
    ("ear_lobes", *_pair("ears", "ear-lobe-decr", "ear-lobe-incr")),
    ("ear_height", *_pair("ears", "ear-trans-down", "ear-trans-up")),
    # Forehead and head
    ("forehead_height", *_pair("forehead", "forehead-scale-vert-decr", "forehead-scale-vert-incr")),
    ("forehead_slope", *_pair("forehead", "forehead-trans-backward", "forehead-trans-forward")),
    ("temples", *_pair("forehead", "forehead-temple-decr", "forehead-temple-incr")),
    ("head_width", *_pair("head", "head-scale-horiz-decr", "head-scale-horiz-incr")),
    ("head_height", *_pair("head", "head-scale-vert-decr", "head-scale-vert-incr")),
    ("head_depth", *_pair("head", "head-scale-depth-decr", "head-scale-depth-incr")),
    ("neck_length", *_pair("neck", "measure-neck-height-decr", "measure-neck-height-incr")),
    # One-way shapes from MakeHuman's community packs (CC0; author in the name: elvs is Elvaerwyn, jujube,
    # habanero, rehmanpolanski and mindfront as written). Each has only its `.hi` key: 0 is the face as made.
    *[(name, None, {f"pack:{pack}/{region}/{target}": 1.0}) for name, pack, region, target in [
        ("cheeks_round_high", "cheek01_cc0", "cheek", "elvs_chipmunk_cheeks_high_1"),
        ("cheeks_round_low", "cheek01_cc0", "cheek", "elvs_chipmunk_cheeks_low_1"),
        ("cheekbones_chubby", "cheek01_cc0", "cheek", "elvs_high_chubby_cheekbones_1"),
        ("jowls", "cheek01_cc0", "cheek", "elvs_jowls_1"),
        ("cheeks_sunken", "cheek01_cc0", "cheek", "elvs_sunken_cheeks_1"),
        ("ears_flared", "ears01_cc0", "ears", "elvs_flap_ears_1"),
        ("ears_flatter", "ears01_cc0", "ears", "rehmanpolanski_ear_flatten"),
        ("lobes_out", "ears01_cc0", "ears", "elvs_ear_flap_bottom_out"),
        ("nose_bulbous", "nose01_cc0", "nose", "elvs_bulbous_nose_1"),
        ("nose_base_wide", "nose01_cc0", "nose", "elvs_nose_widening_1"),
        ("nose_greek", "nose01_cc0", "nose", "jujube_greek_statue_nose"),
        ("nostrils_up", "nose01_cc0", "nose", "jujube_nostril_up"),
        ("nostrils_small", "nose01_cc0", "nose", "jujube_nostril_shrink"),
        ("nostrils_round", "nose01_cc0", "nose", "habanero_nostril_alar_rounding"),
        # Detail: finer anatomy, which the maker can start a face with.
        ("detail_ears", "ears01_cc0", "ears", "mindfront_ear_details"),
        ("detail_ear_inner", "ears01_cc0", "ears", "mindfront_ear_in"),
        ("detail_ear_canal", "ears01_cc0", "ears", "jujube_ear_canal"),
        ("detail_nose_crease", "nose01_cc0", "nose", "mindfront_nose_alar_crease"),
        ("detail_columella", "nose01_cc0", "nose", "jujube_nose_straight_columella"),
        ("detail_nostril_rims", "nose01_cc0", "nose", "jujube_nostril_rim_sharp"),
    ]],
]

# The body in detail, the same way (3D Avatar Maker's src/looks.js BODY_DETAIL). Hands and feet are sized
# by their bones instead: a key that moved them would leave the finger joints behind.
BODY_DETAIL = [
    ("upper_arms", *_pair("arms", "measure-upperarm-circ-decr", "measure-upperarm-circ-incr")),
    ("forearms", *_pair("arms", "lowerarm-fat-decr", "lowerarm-fat-incr")),
    ("arm_muscle", {"arms/upperarm-muscle-decr": 1.0, "arms/lowerarm-muscle-decr": 1.0}, {"arms/upperarm-muscle-incr": 1.0, "arms/lowerarm-muscle-incr": 1.0}),
    ("thighs", *_pair("legs", "measure-thigh-circ-decr", "measure-thigh-circ-incr")),
    ("calves", *_pair("legs", "measure-calf-circ-decr", "measure-calf-circ-incr")),
    ("leg_muscle", {"legs/upperleg-muscle-decr": 1.0, "legs/lowerleg-muscle-decr": 1.0}, {"legs/upperleg-muscle-incr": 1.0, "legs/lowerleg-muscle-incr": 1.0}),
    ("buttocks", *_pair("buttocks", "buttocks-volume-decr", "buttocks-volume-incr")),
    ("torso_taper", *_pair("torso", "torso-vshape-decr", "torso-vshape-incr")),
    ("back_muscle", *_pair("torso", "torso-muscle-dorsi-decr", "torso-muscle-dorsi-incr")),
    ("stomach_tone", *_pair("stomach", "stomach-tone-decr", "stomach-tone-incr")),
    ("hip_width", *_pair("hip", "hip-scale-horiz-decr", "hip-scale-horiz-incr")),
    # One-way, from MakeHuman's community packs (CC0): finer anatomy of the arms and hands, and knobby knuckles.
    *[(name, None, {f"pack:{pack}/{region}/{target}": 1.0}) for name, pack, region, target in [
        ("knuckles_knobby", "hands01_cc0", "hands", "jujube_knobby_knuckles"),
        ("detail_fingers", "hands01_cc0", "hands", "mindfront_hand_fingers_correction"),
        ("detail_palm", "hands01_cc0", "hands", "mindfront_hand_hypothenar"),
        ("detail_thumb", "hands01_cc0", "hands", "mindfront_hand_thenar_eminence"),
        ("detail_upper_arms", "arms01_cc0", "arms", "mindfront_arm_upper_shape"),
        ("detail_forearms", "arms01_cc0", "arms", "mindfront_arm_lower_shape"),
        ("detail_wrists", "arms01_cc0", "arms", "mindfront_arm_wrist_ulna"),
        ("detail_armpits", "arms01_cc0", "arms", "mindfront_armpit"),
        ("elbow_dimples", "arms01_cc0", "arms", "elvs_ladies_elbow_dimples"),
    ]],
]
# Hers only: the bust's shape and place (its size is the "bust" key).
BREAST_DETAIL = [
    ("bust_height", *_pair("breast", "breast-trans-down", "breast-trans-up")),
    ("bust_spacing", *_pair("breast", "breast-dist-decr", "breast-dist-incr")),
    ("bust_shape", *_pair("breast", "breast-point-decr", "breast-point-incr")),
    ("bust_lift", *_pair("breast", "breast-volume-vert-down", "breast-volume-vert-up")),
]


# The 5e SRD's races as shape keys (each 0-1; a half-elf is `race_elf` at a half with `ears_pointed` at a
# half; a human is none of them). A key holds what scaling bones can't give: build, girth, the size of the
# hands and feet, and the face. The game completes each look by scaling the whole figure, the legs, the
# arms and the head (RACE_SCALES: what the keys are shaped for).
RACES = ("race_dwarf", "race_halfling", "race_gnome", "race_elf", "race_halforc", "race_tiefling")
# What the game sets with each key at 1 (the script itself doesn't use it): the whole figure's scale, then each
# leg and arm bone stretched along itself and the head bone scaled from the neck (as the Look card's limb
# lengths and head size do), on top of the look's own. The man then stands about 1.33 m as a dwarf, 0.97 m as
# a halfling and 1.05 m as a gnome; the woman 1.27 m, 0.92 m and 1.0 m.
RACE_SCALES = {
    "race_dwarf": dict(height=0.87, legs=0.7, arms=0.8, head=1.18),
    "race_halfling": dict(height=0.58, legs=0.86, arms=0.9, head=1.2),
    "race_gnome": dict(height=0.62, legs=0.85, arms=0.98, head=1.4),
    "race_elf": dict(height=1.0, legs=1.03, arms=1.02, head=0.97),
    "race_halforc": dict(height=1.05, legs=1.0, arms=1.03, head=1.0),
    "race_tiefling": dict(height=1.0, legs=1.0, arms=1.0, head=1.0),
}


def race_mixes(B):
    """Each race's MakeHuman part: ({macro setting: how far it moves}, {detail target: weight}, the share of
    the macro's change that reaches the head). The woman's faces are her own, not the man's copied over: a
    race's features on a smooth, soft face, where his may be bonier, lined or heavy."""
    S = wa.sided
    f = B["female"]
    v = lambda hers, his: hers if f else his  # noqa: E731
    out = {}
    # Dwarf: broad and stocky (the girth is `race_shapes`'). Muscled forearms and calves, thick wrists and
    # ankles, thick fingers; a broad strong face with a large nose, a heavy brow and a wide jaw.
    out["race_dwarf"] = (
        dict(weight=0.2, muscle=0.15 if not f else 0.25),
        {
            "torso/measure-waist-circ-incr": 0.5,
            "stomach/stomach-pregnant-incr": 0.1,
            "torso/torso-vshape-decr": 0.5,
            **S("arms/upperarm-shoulder-muscle-incr", 0.5),
            **S("arms/upperarm-muscle-incr", 0.4),
            **S("arms/lowerarm-muscle-incr", 0.7),
            "hands/measure-wrist-circ-incr": 0.6,
            **S("hands/hand-fingers-diameter-incr", 0.8),
            **S("legs/lowerleg-muscle-incr", 0.15),
            "feet/measure-ankle-circ-incr": 0.6,
            "head/head-square": 0.5,
            "head/head-age-incr": 0.3,
            "forehead/forehead-scale-vert-decr": 0.3,
            "eyebrows/eyebrows-trans-forward": 0.7,
            "eyebrows/eyebrows-trans-down": 0.35,
            **S("eyes/eye-push1-in", 0.3),
            "nose/nose-scale-horiz-incr": 0.75,
            "nose/nose-scale-depth-incr": 0.5,
            "nose/nose-scale-vert-incr": 0.3,
            "nose/nose-volume-incr": 0.6,
            "nose/nose-point-width-incr": 0.6,
            "nose/nose-hump-incr": 0.3,
            **S("cheek/cheek-bones-incr", 0.4),
            **S("cheek/cheek-volume-incr", 0.3),
            "chin/chin-width-incr": 0.7,
            "chin/chin-bones-incr": 0.6,
            "mouth/mouth-scale-horiz-incr": 0.3,
            **S("ears/ear-scale-incr", 0.25),
        },
        1.0,
    )
    # Halfling: a sturdy little adult with a human face, a little soft and full: a rounded nose, the mouth's
    # corners just lifted, no lines beside it; a slightly round belly; ears slightly pointed (the big feet and
    # small hands are `race_shapes`').
    out["race_halfling"] = (
        dict(weight=0.17, muscle=-0.15),
        {
            "stomach/stomach-pregnant-incr": 0.2,
            "torso/measure-waist-circ-incr": 0.45,
            "torso/torso-vshape-decr": 0.35,
            "hip/hip-scale-horiz-incr": 0.3,
            "buttocks/buttocks-volume-incr": 0.3,
            "head/head-round": v(0.1, 0.2),
            **S("cheek/cheek-volume-incr", v(0.15, 0.28)),
            "chin/chin-bones-decr": v(0.1, 0.2),
            "nose/nose-point-up": 0.2,
            "nose/nose-point-width-incr": v(0.25, 0.4),
            "nose/nose-volume-incr": v(0.1, 0.25),
            "nose/nose-hump-decr": 0.2,
            **S("eyes/eye-scale-incr", 0.1),
            "eyebrows/eyebrows-trans-up": 0.15,
            "mouth/mouth-angles-up": v(0.12, 0.22),
            "mouth/mouth-scale-horiz-incr": v(0.08, 0.18),
            **S("ears/ear-shape-pointed", 0.4),
            **S("ears/ear-scale-vert-incr", 0.2),
        },
        v(0.3, 0.45),
    )
    # Gnome: slight and wiry. A big strong nose, large bright eyes under raised brows, long pointed ears, a
    # pointed chin; long nimble fingers. His face is lean, with a grown man's lines; hers is smooth.
    out["race_gnome"] = (
        dict(weight=-0.14, muscle=-0.05),
        {
            **S("hands/hand-fingers-length-incr", 0.8),
            **S("hands/hand-fingers-diameter-decr", 0.3),
            "head/head-age-incr": v(0.0, 0.25),
            "nose/nose-scale-depth-incr": v(0.7, 1.0),
            "nose/nose-scale-vert-incr": v(0.4, 0.6),
            "nose/nose-scale-horiz-incr": v(0.25, 0.4),
            "nose/nose-hump-incr": v(0.25, 0.5),
            "nose/nose-point-down": v(0.12, 0.3),
            "nose/nose-volume-incr": v(0.3, 0.5),
            **S("eyes/eye-scale-incr", 0.85),
            **S("eyes/eye-height2-incr", 0.3),
            **S("eyes/eye-bag-incr", v(0.0, 0.12)),
            "eyebrows/eyebrows-trans-up": 0.4,
            "eyebrows/eyebrows-angle-up": 0.25,
            **S("cheek/cheek-bones-incr", v(0.12, 0.35)),
            **S("cheek/cheek-volume-decr", v(0.0, 0.15)),
            "chin/chin-triangle": v(0.35, 0.45),
            "chin/chin-prominent-incr": v(0.2, 0.35),
            "mouth/mouth-scale-horiz-incr": v(0.2, 0.3),
            "mouth/mouth-angles-up": 0.2,
            "mouth/mouth-laugh-lines-in": v(0.0, 0.1),
            **S("ears/ear-shape-pointed", 0.9),
            **S("ears/ear-scale-incr", 0.5),
            **S("ears/ear-scale-vert-incr", 0.5),
            **S("ears/ear-wing-incr", 0.35),
        },
        v(0.4, 0.6),
    )
    # Elf: slender and fine-boned, not gaunt. An oval face with a narrow chin, a slim straight nose, slightly
    # larger almond eyes under lifted brows, a slim neck and long fingers (the ears are `ears_pointed`).
    out["race_elf"] = (
        dict(weight=-0.2, muscle=-0.12),
        {
            "torso/measure-shoulder-dist-decr": 0.3,
            "torso/measure-waist-circ-decr": 0.35,
            "neck/neck-scale-horiz-decr": 0.5,
            "neck/neck-scale-depth-decr": 0.3,
            "hands/measure-wrist-circ-decr": 0.5,
            **S("hands/hand-fingers-length-incr", 0.4),
            **S("hands/hand-fingers-diameter-decr", 0.4),
            "feet/measure-ankle-circ-decr": 0.4,
            "head/head-oval": 0.3,
            **S("cheek/cheek-bones-incr", v(0.1, 0.18)),
            **S("cheek/cheek-volume-decr", v(0.0, 0.1)),
            "chin/chin-triangle": v(0.2, 0.3),
            "chin/chin-width-decr": v(0.3, 0.35),
            "chin/chin-bones-decr": v(0.2, 0.15),
            "nose/nose-scale-horiz-decr": 0.4,
            "nose/nose-point-width-decr": 0.4,
            "nose/nose-greek-incr": v(0.15, 0.3),
            "nose/nose-hump-decr": 0.2,
            **S("eyes/eye-scale-incr", 0.3),
            **S("eyes/eye-corner2-up", 0.5),
            **S("eyes/eye-height2-decr", 0.15),
            "eyebrows/eyebrows-angle-up": 0.35,
            "mouth/mouth-scale-horiz-decr": 0.06,
        },
        0.25,
    )
    # Half-orc. His: a big frame with powerful shoulders and neck; a heavy brow, a strong jaw with an underbite,
    # a flatter, broader nose. Hers is her own: a strong woman's frame, and a woman's face with a half-orc's
    # marks on it (a firmer brow than a human woman's, a broader nose, a full lower lip with room for tusks, a
    # jaw a little squarer and forward), not his jaw and brow.
    if f:
        out["race_halforc"] = (
            dict(weight=0.06, muscle=0.2),
            {
                "torso/measure-shoulder-dist-incr": 0.25,
                "torso/torso-muscle-dorsi-incr": 0.25,
                **S("arms/upperarm-shoulder-muscle-incr", 0.35),
                **S("arms/upperarm-muscle-incr", 0.35),
                **S("arms/lowerarm-muscle-incr", 0.3),
                "hands/measure-wrist-circ-incr": 0.2,
                **S("hands/hand-fingers-diameter-incr", 0.2),
                **S("legs/upperleg-muscle-incr", 0.35),
                **S("legs/lowerleg-muscle-incr", 0.3),
                "forehead/forehead-trans-backward": 0.15,
                "eyebrows/eyebrows-trans-forward": 0.4,
                "eyebrows/eyebrows-trans-down": 0.2,
                "eyebrows/eyebrows-angle-down": 0.1,
                **S("eyes/eye-push1-in", 0.15),
                "nose/nose-scale-horiz-incr": 0.4,
                "nose/nose-flaring-incr": 0.3,
                "nose/nose-scale-depth-decr": 0.3,
                "nose/nose-point-up": 0.2,
                "nose/nose-width1-incr": 0.2,
                "nose/nose-width2-incr": 0.2,
                **S("cheek/cheek-bones-incr", 0.12),
                "chin/chin-width-incr": 0.28,
                "chin/chin-bones-incr": 0.2,
                "chin/chin-prognathism-incr": 0.4,
                "chin/chin-prominent-incr": 0.12,
                "mouth/mouth-scale-horiz-incr": 0.3,
                "mouth/mouth-lowerlip-volume-incr": 0.5,
                **S("ears/ear-shape-pointed", 0.35),
            },
            0.4,
        )
    else:
        out["race_halforc"] = (
            dict(weight=0.1, muscle=0.15),
            {
                "torso/measure-shoulder-dist-incr": 0.6,
                "torso/torso-muscle-dorsi-incr": 0.7,
                "torso/torso-muscle-pectoral-incr": 0.4,
                **S("arms/upperarm-shoulder-muscle-incr", 0.8),
                **S("arms/upperarm-muscle-incr", 0.7),
                **S("arms/lowerarm-muscle-incr", 0.6),
                "hands/measure-wrist-circ-incr": 0.5,
                **S("hands/hand-fingers-diameter-incr", 0.5),
                **S("legs/upperleg-muscle-incr", 0.5),
                **S("legs/lowerleg-muscle-incr", 0.4),
                "head/head-rectangular": 0.4,
                "forehead/forehead-trans-backward": 0.5,
                "eyebrows/eyebrows-trans-forward": 1.0,
                "eyebrows/eyebrows-trans-down": 0.6,
                "eyebrows/eyebrows-angle-down": 0.3,
                **S("eyes/eye-push1-in", 0.5),
                **S("eyes/eye-push2-in", 0.3),
                **S("eyes/eye-scale-decr", 0.15),
                "nose/nose-scale-horiz-incr": 0.9,
                "nose/nose-flaring-incr": 0.7,
                "nose/nose-scale-depth-decr": 0.6,
                "nose/nose-point-up": 0.3,
                "nose/nose-width1-incr": 0.5,
                "nose/nose-width2-incr": 0.5,
                **S("cheek/cheek-bones-incr", 0.5),
                "chin/chin-width-incr": 1.0,
                "chin/chin-bones-incr": 1.0,
                "chin/chin-prognathism-incr": 0.8,
                "chin/chin-prominent-incr": 0.4,
                "chin/chin-height-incr": 0.3,
                "mouth/mouth-scale-horiz-incr": 0.5,
                "mouth/mouth-lowerlip-volume-incr": 0.5,
                "mouth/mouth-upperlip-volume-decr": 0.3,
                **S("ears/ear-shape-pointed", 0.3),
            },
            1.0,
        )
    # Tiefling: a subtly angular face (a narrower chin, lifted brows and eye corners, a slim nose, cheekbones
    # just firmer), smooth all the same; the body mostly human.
    out["race_tiefling"] = (
        dict(),
        {
            **S("cheek/cheek-bones-incr", v(0.12, 0.28)),
            **S("cheek/cheek-inner-decr", v(0.0, 0.1)),
            **S("cheek/cheek-volume-decr", v(0.0, 0.12)),
            "chin/chin-triangle": v(0.25, 0.35),
            "chin/chin-prominent-incr": v(0.15, 0.3),
            "chin/chin-width-decr": 0.3,
            "head/head-invertedtriangular": v(0.15, 0.25),
            "eyebrows/eyebrows-angle-up": 0.45,
            **S("eyes/eye-corner2-up", 0.3),
            "nose/nose-point-width-decr": 0.4,
            "nose/nose-scale-horiz-decr": 0.2,
            "nose/nose-greek-incr": v(0.1, 0.2),
            **S("ears/ear-shape-pointed", 0.25),
        },
        1.0,
    )
    return out


# Each race's girth, of our own (MakeHuman's targets don't reach this far): how much wider and deeper the
# trunk is at each of its bones, how much thicker the neck and each part of a limb (round its bone, not
# longer), how much bigger the hands (from the wrist) and feet (from under the ankle, the soles staying on
# the ground), how high the shoulders' slope is built up towards the neck (metres), and how far the calves
# and thighs are evened out along themselves (`evened`: for legs the game shortens).
RACE_GIRTH = {
    "race_dwarf": dict(pelvis=(1.2, 1.2), spine_01=(1.24, 1.28), spine_02=(1.22, 1.3), spine_03=(1.2, 1.26), neck=1.34, upperarm=1.2, lowerarm=1.3, hand=1.24, thigh=1.12, calf=1.14, foot=1.26, traps=0.016, even_calf=0.65, even_thigh=0.2),
    "race_halfling": dict(pelvis=(1.08, 1.08), spine_01=(1.07, 1.1), spine_02=(1.0, 1.04), spine_03=(0.94, 1.02), neck=1.14, upperarm=1.04, lowerarm=1.04, hand=0.9, thigh=1.1, calf=1.14, foot=1.4, even_calf=0.35),
    "race_gnome": dict(pelvis=(0.94, 0.95), spine_01=(0.93, 0.94), spine_02=(0.91, 0.94), spine_03=(0.87, 0.95), neck=1.22, upperarm=0.86, lowerarm=0.88, hand=1.12, thigh=0.88, calf=0.88, foot=1.12),
    "race_elf": dict(upperarm=0.96, lowerarm=0.95, thigh=0.97, calf=0.95),
    "race_halforc": dict(spine_01=(1.03, 1.03), spine_02=(1.06, 1.07), spine_03=(1.09, 1.07), neck=1.22, upperarm=1.08, lowerarm=1.12, hand=1.1, calf=1.05, foot=1.06, traps=0.014),
}
# (The woman's where it's her own and not his made a little less: a strong woman's neck and shoulders.)
RACE_GIRTH_HERS = {
    "race_halforc": dict(spine_02=(1.02, 1.03), spine_03=(1.035, 1.03), neck=1.07, upperarm=1.04, lowerarm=1.05, hand=1.05, calf=1.03, foot=1.04, traps=0.004),
}
# How many rounds each race's key is smoothed over the cheeks (`cheek_mask`), by body (female, male).
CHEEK_SMOOTH = {"race_dwarf": (0, 0), "race_halfling": (12, 12), "race_gnome": (12, 8), "race_elf": (12, 12), "race_halforc": (12, 0), "race_tiefling": (12, 12)}


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
    body.fingertips = []  # (side, finger, where its tip's joint is)
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
            body.fingertips.append((s, f, joints[3].copy()))
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


def jaw_weights(W, co, J):
    """The whole jaw given to the head. `fix_weights` gives the head what lies above a plane from the chin up
    to the nape, which leaves the jaw's angle and the skin under the chin to the neck: the jaw then lags when
    the head turns or is made larger, and what's worn on the head (a beard) comes away from it. Here what lies
    above a second plane, from under the chin back and up to under the ear, is the head's too, blended into
    the neck over the three centimetres under the jaw's line."""
    I = BONE_INDEX
    head, neck = J["Head"], J["neck_01"]
    front = (np.abs(co[:, 0]) < 0.005) & (co[:, 1] < head[1] - 0.06) & (co[:, 2] > head[2] - 0.14) & (co[:, 2] < head[2] - 0.06)
    chin = co[front][np.argmin(co[front, 2])]  # (the chin's underside)
    band = (np.abs(co[:, 2] - (head[2] + 0.016)) < 0.02) & (np.abs(co[:, 1] - head[1]) < 0.06)
    ear = co[band][np.argmax(np.abs(co[band, 0]))]  # (the ear: the widest point at its height)
    low = chin + np.array([0.0, 0.0, -0.004])
    angle = np.array([0.0, ear[1] - 0.01, chin[2] + 0.035])  # (the jaw's angle, under the ear)
    n = np.cross(np.array([1.0, 0.0, 0.0]), angle - low)
    n /= np.linalg.norm(n)
    if n[2] < 0:
        n = -n
    zone = np.isin(W.argmax(1), [I["Head"], I["neck_01"], I["spine_03"]]) & (co[:, 2] > neck[2] - 0.02)
    up = wa.smoothstep(-0.03, -0.004, (co - low) @ n) * wa.smoothstep(angle[1] + 0.03, angle[1], co[:, 1]) * zone
    out = W * (1 - up)[:, None]
    out[:, I["Head"]] += up
    changed = np.abs(out - W).max(1) > 0.01
    log(f"the jaw: {int(changed.sum())} vertices given to the head ({int((changed & (W[:, I['Head']] < 0.5)).sum())} of them the neck's before)")
    return out


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


def stoop_offsets(co, W, J, amount):
    """How far each vertex moves (rest pose, skinned) when the back rounds: the spine and neck bent forward,
    the head turned back up to look ahead, the shoulders rolled forward, `amount` of STOOP."""
    local = {b: np.eye(3) for b in BONE_NAMES}
    for b, deg in STOOP.items():
        local[b] = _turn(np.array([1.0, 0.0, 0.0]), math.radians(deg * amount))
    for s_, sign in (("l", -1.0), ("r", 1.0)):
        local[f"clavicle_{s_}"] = _turn(np.array([0.0, 0.0, 1.0]), math.radians(sign * SHOULDERS_FORWARD * amount))
    G, new = {}, {}
    for b, parent in ww.BONES:
        G[b] = local[b] if parent is None else G[parent] @ local[b]
        new[b] = J[b].copy() if parent is None else new[parent] + G[parent] @ (J[b] - J[parent])
    rots = [G[b] for b in BONE_NAMES]
    return wa.skin(co, W, rots, [J[b] for b in BONE_NAMES], [new[b] for b in BONE_NAMES]) - co


def arms_up(parts, J):
    """The parts' points with the arms raised to level (out of the A-pose), for baking occlusion."""
    co = np.concatenate([p.co for p in parts])
    W = np.concatenate([p.weights for p in parts])
    local = {b: np.eye(3) for b in BONE_NAMES}
    for s_, sign in (("l", 1.0), ("r", -1.0)):
        local[f"upperarm_{s_}"] = _turn(np.array([0.0, 1.0, 0.0]), math.radians(-sign * APOSE))
    G, new = {}, {}
    for b, parent in ww.BONES:
        G[b] = local[b] if parent is None else G[parent] @ local[b]
        new[b] = J[b].copy() if parent is None else new[parent] + G[parent] @ (J[b] - J[parent])
    return wa.skin(co, W, [G[b] for b in BONE_NAMES], [J[b] for b in BONE_NAMES], [new[b] for b in BONE_NAMES])


def settle_age(body, used, W, J):
    """The age keys made ready to wear: a stoop added (STOOP), then the whole key evened out along the body
    so the soles don't move and the skull doesn't either (only the face and neck age inside it), so the
    feet stay on the ground and hair hung on the head bone still fits. Height is the game's to set."""
    co = body.co[used]
    # (MakeHuman's helpers, the eyes' and lashes' among them, go with the head.)
    W_all = np.zeros((len(body.co), W.shape[1]))
    W_all[:, BONE_INDEX["Head"]] = 1.0
    W_all[used] = W
    eye_z = body.eye["l"]["centre"][2]
    cranium = (W[:, BONE_INDEX["Head"]] > 0.99) & (co[:, 2] > eye_z)
    soles = co[:, 2] < 0.02
    neck_z, hip_z = J["neck_01"][2], J["pelvis"][2]
    z = body.co[:, 2]
    for name, amount in (("age_middle", STOOP_MIDDLE), ("age_old", 1.0)):
        if name not in body.keys:
            continue
        d = body.keys[name]
        d += stoop_offsets(body.co, W_all, J, amount)
        head, feet = d[used][cranium].mean(0), d[used][soles].mean(0)
        up = np.clip(z / neck_z, 0.0, 1.0)[:, None]
        across = wa.smoothstep(hip_z, neck_z, z)[:, None]
        fix = np.concatenate([feet[:2] + (head[:2] - feet[:2]) * across, feet[2:] + (head[2:] - feet[2:]) * up], axis=1)
        body.keys[name] = d - fix
        log(f"{name}: skull moved {np.linalg.norm(head) * 1000:.1f} mm, soles {np.linalg.norm(feet) * 1000:.1f} mm, evened out")


# Where hair sits, as wwhair.py has it: the hairline's height over eye level by the angle round the head from
# the front (0) to the back (180). A race's key moves nothing above it, so hair hung on the head still fits.
HAIRLINE = {
    False: [(0, 0.074), (32, 0.066), (50, 0.040), (66, 0.000), (82, -0.028), (92, 0.012), (110, 0.016), (126, -0.046), (150, -0.078), (180, -0.086)],
    True: [(0, 0.072), (32, 0.068), (50, 0.046), (66, 0.008), (82, -0.016), (92, 0.018), (110, 0.022), (126, -0.040), (150, -0.072), (180, -0.080)],
}


def hair_cap(B, body, used, W):
    """How much of each vertex (MakeHuman's whole list) lies under the hair: 1 over the skull above the
    hairline, easing to 0 two centimetres below it; the ears are left out (they stand clear of it)."""
    co = body.co
    eye_z = body.eye["l"]["centre"][2]
    on_head = W[:, BONE_INDEX["Head"]]
    skull = used[(on_head[used] > 0.99) & (co[used, 2] > eye_z)]
    centre_y = (co[skull, 1].min() + co[skull, 1].max()) / 2
    az = np.degrees(np.arctan2(np.abs(co[:, 0]), -(co[:, 1] - centre_y)))
    table = HAIRLINE[B["female"]]
    line = eye_z + np.interp(az, [t[0] for t in table], [t[1] for t in table])
    cap = wa.smoothstep(line - 0.022, line - 0.002, co[:, 2]) * wa.smoothstep(0.3, 0.9, on_head)
    ears = np.zeros(len(co))
    for s_ in ("l", "r"):
        idx, d = wa.target(f"ears/{s_}-ear-scale-incr")
        ears[idx] = np.maximum(ears[idx], wa.smoothstep(0.0, 0.02, np.linalg.norm(d, axis=1)))
    return cap * (1 - ears)


def cheek_mask(B, body, used, W, base):
    """How much of each of the body's vertices is cheek: the face's sides from under the eye socket down to
    the jaw, beside the nose and the mouth (not the nose, the lips, the lids or the ears)."""
    co = body.co[used]
    k = B["height"] / 1.78
    on_head = W[:, BONE_INDEX["Head"]]
    e, r = body.eye["l"]["centre"], body.eye["l"]["radius"]
    skull = (on_head > 0.99) & (co[:, 2] > e[2])
    centre_y = (co[skull, 1].min() + co[skull, 1].max()) / 2
    az = np.degrees(np.arctan2(np.abs(co[:, 0]), -(co[:, 1] - centre_y)))
    lips = body.co[np.unique(base.quads[wa.face_set("lips_solid")])]
    near = np.array([np.sqrt(((lips - q) ** 2).sum(1).min()) if on_head[i] > 0.5 else 1.0 for i, q in enumerate(co)])
    ears = np.zeros(len(body.co))
    for s_ in ("l", "r"):
        idx, d = wa.target(f"ears/{s_}-ear-scale-incr")
        ears[idx] = 1.0
    mask = wa.smoothstep(0.5, 0.95, on_head) * wa.smoothstep(e[2] - 0.75 * r, e[2] - 1.5 * r, co[:, 2])
    mask *= wa.smoothstep(0.011 * k, 0.02 * k, np.abs(co[:, 0])) * wa.smoothstep(0.002, 0.008, near) * wa.smoothstep(88, 70, az)
    return mask * (1 - ears[used])


def settle_races(B, body, used, W, J, base, nbrs):
    """The races' keys made ready to wear. Each key's build (the macro's part, `_<key>`) is folded in, only its
    race's share of it reaching the head; shaping of our own is added (`race_shapes`); its moves are smoothed
    over the cheeks (`cheek_mask`, CHEEK_SMOOTH), so the face keeps one smooth surface from the eye socket
    down to the jaw; then all of it is eased out under the hair (`hair_cap`), so the skull stays as it is and
    hair, hats and horns fit every race. (A larger head for the small folk is the game's, by scaling the
    head bone.)"""
    W_all = np.zeros((len(body.co), W.shape[1]))
    W_all[:, BONE_INDEX["Head"]] = 1.0
    W_all[used] = W
    on_head = W_all[:, BONE_INDEX["Head"]]
    cap = hair_cap(B, body, used, W_all)
    shapes = race_shapes(B, body, used, W_all, J)
    shares = {name: mix[2] for name, mix in race_mixes(B).items()}
    cheeks = cheek_mask(B, body, used, W, base)
    for name in RACES:
        build = body.keys.pop("_" + name)
        d = body.keys[name] + build * (1 - (1 - shares[name]) * on_head)[:, None] + shapes.get(name, 0.0)
        rounds = CHEEK_SMOOTH[name][0 if B["female"] else 1]
        if rounds:
            d[used] = wa.smooth_values(d[used], nbrs, rounds=rounds, factor=0.5, mask=cheeks)
        body.keys[name] = d * (1 - cap)[:, None]
        moved = np.linalg.norm(body.keys[name][used], axis=1)
        log(f"{name}: moves the skin up to {moved.max() * 1000:.1f} mm")


def girth_offsets(co, W, J, spec):
    """How far each vertex moves for a girth (RACE_GIRTH's): every bone's own change (a trunk bone wider and
    deeper about the spine, a limb bone thicker round itself, a hand or foot bigger), each vertex taking its
    bones' by weight, the limbs carried out with the trunk where they join it. No joint moves, so nothing
    grows longer."""
    I3 = np.eye(3)
    scale = {b: I3 for b in BONE_NAMES}
    pivot = {b: J[b] for b in BONE_NAMES}
    shift = {b: np.zeros(3) for b in BONE_NAMES}

    def round_bone(b, tail, k):
        d = _unit(J[tail] - J[b])
        scale[b] = I3 + (k - 1) * (I3 - np.outer(d, d))

    for b in ("pelvis", "spine_01", "spine_02", "spine_03"):
        sx, sy = spec.get(b, (1.0, 1.0))
        scale[b] = np.diag([sx, sy, 1.0])
        pivot[b] = np.array([0.0, J[b][1], J[b][2]])
    round_bone("neck_01", "Head", spec.get("neck", 1.0))
    pivot["neck_01"] = np.array([0.0, (J["neck_01"][1] + J["Head"][1]) / 2, J["neck_01"][2]])
    for s_ in ("l", "r"):
        scale[f"clavicle_{s_}"], pivot[f"clavicle_{s_}"] = scale["spine_03"], pivot["spine_03"]
        carried = (scale["spine_03"] - I3) @ (J[f"upperarm_{s_}"] - pivot["spine_03"])
        round_bone(f"upperarm_{s_}", f"lowerarm_{s_}", spec.get("upperarm", 1.0))
        round_bone(f"lowerarm_{s_}", f"hand_{s_}", spec.get("lowerarm", 1.0))
        scale[f"hand_{s_}"] = I3 * spec.get("hand", 1.0)
        for b in ("upperarm", "lowerarm", "hand"):
            shift[f"{b}_{s_}"] = carried
        carried = (scale["pelvis"] - I3) @ (J[f"thigh_{s_}"] - pivot["pelvis"])
        round_bone(f"thigh_{s_}", f"calf_{s_}", spec.get("thigh", 1.0))
        round_bone(f"calf_{s_}", f"foot_{s_}", spec.get("calf", 1.0))
        k = spec.get("foot", 1.0)
        ground = np.array([J[f"foot_{s_}"][0], J[f"foot_{s_}"][1], 0.0])
        for b in ("foot", "ball"):
            scale[f"{b}_{s_}"] = np.diag([k, k, 1 + (k - 1) * 0.45])
            pivot[f"{b}_{s_}"] = ground
        for b in ("thigh", "calf", "foot", "ball"):
            shift[f"{b}_{s_}"] = carried
    out = np.zeros_like(co)
    for b, i in BONE_INDEX.items():
        w = W[:, i]
        sel = w > 0
        if sel.any() and (not np.allclose(scale[b], I3) or np.abs(shift[b]).max() > 0):
            out[sel] += w[sel, None] * ((co[sel] - pivot[b]) @ (scale[b] - I3).T + shift[b])
    for b, tail, amount in (("thigh", "calf", spec.get("even_thigh", 0.0)), ("calf", "foot", spec.get("even_calf", 0.0))):
        for s_ in ("l", "r"):
            if amount:
                out += evened(co, W[:, BONE_INDEX[f"{b}_{s_}"]], J[f"{b}_{s_}"], J[f"{tail}_{s_}"], amount)
    return out


def evened(co, w, a, b, amount):
    """Offsets that even out a limb's girth along itself: each ring of it drawn in or out towards a straight
    taper from its top to its bottom, by `amount`. (The game shortens a short race's legs along their bones;
    a calf's belly squeezed that way would bulge like a ball.)"""
    d = b - a
    length = np.linalg.norm(d)
    d = d / length
    t = ((co - a) @ d) / length
    radial = (co - a) - np.outer(t * length, d)
    r = np.linalg.norm(radial, axis=1)
    sel = (w > 0.5) & (t > 0.0) & (t < 1.0)
    edges = np.linspace(0, 1, 17)
    mid = (edges[:-1] + edges[1:]) / 2
    rings = [r[sel & (t >= e0) & (t < e1)] for e0, e1 in zip(edges[:-1], edges[1:])]
    have = np.array([len(ring) > 0 for ring in rings])
    mid, prof = mid[have], np.array([ring.mean() for ring in rings if len(ring)])
    mean = np.interp(t, mid, prof)
    line = np.interp(t, [mid[1], mid[-2]], [prof[1], prof[-2]])
    fade = wa.smoothstep(0.03, 0.2, t) * wa.smoothstep(0.97, 0.82, t)
    return (w * fade * amount * (line / np.maximum(mean, 1e-6) - 1))[:, None] * radial


def bump(co, line, radius, move, mask=None):
    """A soft ridge: `move` (a vector) at its most along a polyline, easing to nothing `radius` away."""
    d, _ = wa.polyline_distance(co, np.asarray(line, dtype=np.float64))
    w = np.clip(1 - (d / radius) ** 2, 0.0, 1.0) ** 2
    if mask is not None:
        w = w * mask
    return w[:, None] * np.asarray(move, dtype=np.float64)


def race_shapes(B, body, used, W, J):
    """Shaping of our own for the races, where MakeHuman's targets don't reach: {key: offsets} over MakeHuman's
    whole vertex list, in the body's space at rest. Girth (RACE_GIRTH), the shoulders built up towards the
    neck, and a heavier brow ridge."""
    co = body.co
    I = BONE_INDEX
    out = {}
    on_head = W[:, I["Head"]]
    trunk = W[:, [I[b] for b in ("spine_02", "spine_03", "neck_01", "clavicle_l", "clavicle_r")]].sum(1)
    eye = {1.0: body.eye["l"]["centre"], -1.0: body.eye["r"]["centre"]}
    r = body.eye["l"]["radius"]
    softer = 0.85 if B["female"] else 1.0
    for name in RACES:
        spec = RACE_GIRTH.get(name, {})
        if B["female"] and name in RACE_GIRTH_HERS:
            spec = RACE_GIRTH_HERS[name]
        elif B["female"]:
            # (Hers a little less: the trunk's and limbs' changes at `softer` of his.)
            spec = {k: (tuple(1 + (x - 1) * softer for x in v) if isinstance(v, tuple) else (v if k in ("hand", "foot", "traps", "even_calf", "even_thigh") else 1 + (v - 1) * softer)) for k, v in spec.items()}
        d = girth_offsets(co, W, J, spec)
        if spec.get("traps"):
            # The shoulders' slope built up from the neck's side out to the collarbone's end, and a little back.
            for s_, sign in (("l", 1.0), ("r", -1.0)):
                a = np.array([sign * 0.035, J["neck_01"][1] + 0.01, J["neck_01"][2] + 0.035])
                b = J[f"clavicle_{s_}"] * 0.4 + J[f"upperarm_{s_}"] * 0.6 + np.array([0.0, 0.005, 0.03])
                d += bump(co, [a, (a + b) / 2 + np.array([0.0, 0.0, 0.008]), b], 0.075, [0.0, 0.004, spec["traps"]], trunk)
        out[name] = d
    # A heavier brow: a ridge over each eye and across the bridge between them, pushed forward and a little
    # down, on the face only.
    face = wa.smoothstep(0.5, 0.95, on_head) * (co[:, 1] < eye[1.0][1] + r * 0.6)
    for name, amount in (("race_dwarf", 0.0035), ("race_halforc", 0.0055)):
        ridge = []
        for sign in (1.0, -1.0):
            e = eye[sign]
            ridge.append([np.array([e[0] + sign * r * 1.5, e[1] - r * 0.5, e[2] + r * 1.25]), np.array([e[0] + sign * r * 0.3, e[1] - r * 1.0, e[2] + r * 1.45]), np.array([sign * r * 0.25, e[1] - r * 1.15, e[2] + r * 1.2])])
        line = ridge[0] + ridge[1][::-1]
        if B["female"]:
            amount *= 0.85 if name == "race_dwarf" else 0.3  # (her half-orc's brow: firm, not a shelf)
        out[name] = out[name] + bump(co, line, r * 1.25, [0.0, -amount, -amount * 0.3], face)
    return out


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
    if all(getattr(p, "normals", None) is not None for p in parts):
        # (Normals of the part's own: hair cards lit as the skin under them, not each as a flat strip.)
        mesh.normals_split_custom_set_from_vertices([tuple(n) for n in np.concatenate([p.normals for p in parts])])
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    obj.shape_key_add(name="Basis", from_mix=False)
    for k in key_names:
        sk = obj.shape_key_add(name=k, from_mix=False)
        d = np.concatenate([p.keys[k] for p in parts])
        sk.data.foreach_set("co", (co + d).ravel())
        sk.slider_min, sk.slider_max = 0.0, 1.0
        sk.value = 0.0
    width = max(p.weights.shape[1] for p in parts)  # (the body's weights have its fingers' bones too, the tail's its own)
    W = np.concatenate([np.pad(p.weights, ((0, 0), (0, width - p.weights.shape[1]))) for p in parts])
    groups = [obj.vertex_groups.new(name=b) for b in ALL_BONES[:width]]
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
    # The caruncle: a small flattened mound where the lids meet at the inner corner, on the eyeball's nasal
    # side CARUNCLE_ANGLE from the front. (The lash roots stop short of the corner, so they can't place it.)
    look = (e["aim"] - c) / np.linalg.norm(e["aim"] - c)
    nasal = np.array([-1.0 if c[0] > 0 else 1.0, 0.0, 0.0])
    nasal -= look * (nasal @ look)
    nasal /= np.linalg.norm(nasal)
    a = math.radians(CARUNCLE_ANGLE)
    centre = c + (look * math.cos(a) + nasal * math.sin(a)) * r * 1.01 - np.array([0.0, 0.0, 0.12 * r])
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
    # (Not the races' keys: the game carries a race's build onto underwear itself, from the skin under it.)
    W, keys = skin.attach(P, [k for k in key_names if k not in RACES])
    for k in key_names:
        if k in RACES:
            keys[k] = np.zeros_like(P)
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


def _image(name, size, float_buffer=True, alpha=True):
    image = bpy.data.images.new(name, size, size, alpha=alpha, float_buffer=float_buffer)
    if float_buffer:
        image.colorspace_settings.name = "Non-Color"
    return image


def _pixels(image):
    a = np.empty(image.size[0] * image.size[1] * 4, dtype=np.float32)
    image.pixels.foreach_get(a)
    return a.reshape(image.size[1], image.size[0], 4)


def bake_maps(objects, under, ao_co=None):
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
            # (With the arms raised out of the way, `ao_co`, so the hanging hands leave no shadow on the thighs
            # and the arms none on the trunk's sides: they move.)
            rest_co = []
            for o, alt in zip(objects, ao_co or []):
                rest_co.append(np.empty(len(o.data.vertices) * 3))
                o.data.vertices.foreach_get("co", rest_co[-1])
                o.data.vertices.foreach_set("co", alt.ravel())
                o.data.update()
            for o in under:
                o.hide_render = True
            bake(objects)
            for o in under:
                o.hide_render = False
            if under:
                bake(under, clear=False)
            for o, rest in zip(objects, rest_co):
                o.data.vertices.foreach_set("co", rest)
                o.data.update()
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
    maps["shade"] = _dilate(shade[..., None], covered, 12)[..., 0]
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
    os.makedirs(BUILD, exist_ok=True)
    path = os.path.join(BUILD, f"{name}.jpg")
    image.filepath_raw = path
    image.file_format = "JPEG"
    image.save(filepath=path, quality=93)
    bpy.data.images.remove(image)
    image = bpy.data.images.load(path)
    if not colour:
        image.colorspace_settings.name = "Non-Color"
    image.pack()
    return image


def srgb_to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def materials(atlas=None, cards=None, normal=None, gatlas=None, gnormal=None, eyes=None, parts=None, beard=None):
    """One material per part: the part's colour (exported as its glTF base colour factor) times its
    texture (the skin's, the garments', the hair strokes', the horns' and tusks' or the facial hair's), with
    a normal map for the skin and the garments; the eyebrows and eyelashes cut out by their texture's alpha
    (BLEND), the facial hair by an alpha test (MASK)."""
    out = []
    for name, colour, roughness in PARTS:
        m = bpy.data.materials.new(name)
        m.use_nodes = True
        nodes, links = m.node_tree.nodes, m.node_tree.links
        bsdf = nodes.get("Principled BSDF")
        bsdf.inputs["Roughness"].default_value = roughness
        rgb = [srgb_to_linear(c) for c in ww.hex_rgb(colour)]
        garment = name.startswith("underwear")
        image = cards if name in ("eyebrows", "eyelashes") else (gatlas if garment else (eyes if eyes is not None and name in ("iris", "eye_white") else atlas))
        if name in ("teeth", "horns", "hair"):
            image = beard if name == "hair" else parts
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
            if name == "hair":
                # (Cut out where the texture's alpha is under HAIR_CUTOFF: exported as glTF alpha mode MASK.)
                less = nodes.new("ShaderNodeMath")
                less.operation = "LESS_THAN"
                less.inputs[1].default_value = HAIR_CUTOFF
                links.new(tex.outputs["Alpha"], less.inputs[0])
                inv = nodes.new("ShaderNodeMath")
                inv.operation = "SUBTRACT"
                inv.inputs[0].default_value = 1.0
                links.new(less.outputs[0], inv.inputs[1])
                links.new(inv.outputs[0], bsdf.inputs["Alpha"])
                m.surface_render_method = "DITHERED"
                bsdf.inputs["Specular IOR Level"].default_value = 0.15
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


# ── The fingers' bones ───────────────────────────────────────────────────────────────────────────────
#
# Three bones a finger (the Unreal mannequin's names: thumb, index, middle, ring and pinky, _01 to _03, _l and
# _r), each finger's first a child of its hand, at MakeHuman's own knuckle joints where `curl_fingers` left
# them. The thumb's first is its metacarpal, from the joint by the wrist. The rest pose is the relaxed hand
# as it was; the other bones and the skin's shape are as they were. Each bone's Y runs along its finger and
# its Z out of the finger's back (the nail's side), so closing the hand is a turn about its X, negative.

FINGERS = {1: "thumb", 2: "index", 3: "middle", 4: "ring", 5: "pinky"}  # by MakeHuman's finger numbers
FINGER_BONES = [f"{name}_{k:02d}_{s}" for s in ("l", "r") for name in FINGERS.values() for k in (1, 2, 3)]
# Each joint's blend, in the finger's size (the middle distance of its skin from the line of its joints, which
# runs nearer its back: about 12 mm on the man's index): where it is centred past the joint on the palm's side,
# how much further on the back's side (so the skin over a knuckle stays on the bone whose end the knuckle is),
# and its half width. The fingers' three joints, then the thumb's last two (its first is shared out by length).
FINGER_BLEND = [(0.3, 0.4, 1.0), (0.0, 0.25, 0.75), (0.0, 0.2, 0.6)]
THUMB_BLEND = [None, (0.0, 0.25, 0.8), (0.0, 0.2, 0.65)]
THUMB_REACH = (1.3, 3.0)  # the thumb's ball follows its first bone out to here from it (in the thumb's size)
FINGER_SHARE = 0.4  # how far apart (in the finger's size, along the skin) two fingers share a vertex of a web


def finger_chains(body, co, faces, mats):
    """Each finger's four joints at rest (three knuckles and the tip), and the way its back faces: the hand's
    back, and for the thumb its own nail's way. ({(side, finger): (4, 3)}, {(side, finger): (3,)})."""
    chains, backs = {}, {}
    for side, f, k, pos, d, back in body.knuckles:
        chains.setdefault((side, f), [None] * 4)[k] = pos
        backs[(side, f)] = back
    for side, f, pos in body.fingertips:
        chains[(side, f)][3] = pos
    chains = {key: np.array(ch) for key, ch in chains.items()}
    nails = [fc for fc, m in zip(faces, mats) if m == PART["nails"]]
    centre = np.array([co[fc].mean(0) for fc in nails])
    normal = np.array([np.cross(co[fc[2]] - co[fc[0]], co[fc[-1]] - co[fc[1]]) for fc in nails])
    for side in ("l", "r"):
        a, b = chains[(side, 1)][2:]
        on = segment_distance(centre, a, b) < 0.6 * np.linalg.norm(b - a)
        if on.any():
            n = normal[on].sum(0)
            backs[(side, 1)] = _unit(n if n @ (centre[on].mean(0) - (a + b) / 2) > 0 else -n)
    return chains, backs


# ── Nails: a shell of their own on each finger and toe (3D Avatar Maker) ────────────────────────────────
#
# MakeHuman's fingertips have only a few large faces, so a nail drawn as those faces (or painted into the skin
# texture) has a ragged edge. Here each nail is a mesh of its own: an oval, a little squared, laid on the back
# of the digit's last segment and standing a fraction of a millimetre off the skin, with a rim tucked under it
# so no gap shows from the side. Its size comes from the digit: about two thirds of its width, a little longer
# than wide, stopping just short of the tip. It's one material, `nails`, so a colour on it has a clean edge.
# 3D Avatar Maker now wears MakeHuman's community nails (make_mh_clothes.py: nails_short and the rest, CC0 by
# Mindfront), which are modelled better than these; the shells stay here, switched off, in case they're wanted.
NAIL_SHELLS = False
NAIL_LIFT = 0.0005  # how far the nail's top stands off the skin (metres)
NAIL_SINK = 0.00025  # how far its rim goes under the skin
NAIL_RINGS = 5
NAIL_SEGMENTS = 32
NAIL_SQUARENESS = 2.6  # 2 is an ellipse; higher is squarer
FINGERNAIL = dict(width=0.68, length=1.2, tip=0.0012)
THUMBNAIL = dict(width=0.7, length=1.1, tip=0.0012)
TOENAIL = dict(width=0.72, length=1.0, tip=0.0016)


def _toe_lines(body, R, J_old, J_new, shift, s):
    """Each toe's last segment, posed and scaled as the skin was: {(side, toe): (last joint, tip)}. (MakeHuman's
    toes have joint helpers but no bones of ours: they move with the ball of the foot.)"""
    out = {}
    for side in ("l", "r"):
        bone = f"ball_{side}"
        moved = lambda p: (J_new[bone] + R[bone] @ (p - J_old[bone]) - shift) * s  # noqa: E731,B023
        for toe in range(1, 6):
            last, tip = (f"toe-{toe}-3", f"toe-{toe}-4") if toe > 1 else ("toe-1-2", "toe-1-3")
            out[(side, toe)] = (moved(body.at(f"{side}-{last}")), moved(body.at(f"{side}-{tip}")))
    return out


def nail_plates(skin, chains, backs, toes, uv0):
    """Every nail as one Part: a shell on each finger (`chains`: each finger's joints, the last segment from its
    third to its tip; `backs`: which way its back faces) and toe (`toes`: _toe_lines'). Its shape keys and
    weights are the skin's under it, so it follows the fingers' bones and every key. `uv0`: one place in the
    skin texture the nails all take their colour from."""
    up_z = np.array([0.0, 0.0, 1.0])
    digits = []
    for key, ch in chains.items():
        along = _unit(ch[3] - ch[2])
        back = backs[key] - along * (backs[key] @ along)
        digits.append((ch[2], along, _unit(back), THUMBNAIL if key[1] == 1 else FINGERNAIL))
    for (last, tip) in toes.values():
        along = _unit(tip - last)
        digits.append((last, along, _unit(up_z - along * (up_z @ along)), TOENAIL))

    def cast(origin, direction, reach):
        loc, nrm, _, dist = skin.bvh.ray_cast(Vector(origin), Vector(direction), reach)
        if loc is None:
            return None, None, None
        n = np.array(nrm)
        return np.array(loc), (n if n @ direction > 0 else -n), dist

    co, faces = [], []
    for joint, along, up, shape in digits:
        side = _unit(np.cross(up, along))
        # How far the skin is from the line of the joints, straight out along the digit (its tip) and to each side.
        _, _, tip = cast(joint, along, 0.06)
        if tip is None:
            continue
        def across(t):
            o = joint + along * t
            _, _, left = cast(o, -side, 0.04)
            _, _, right = cast(o, side, 0.04)
            left = left if left is not None else 0.006
            right = right if right is not None else 0.006
            return (left + right) / 2, (right - left) / 2  # (half-width, the middle's offset to the side)

        t = tip * 0.6
        for _ in range(3):
            half, middle = across(t)
            half_width = half * shape["width"]
            half_length = half_width * shape["length"]
            t = tip - shape["tip"] - half_length
        # The oval's points, ring by ring from its middle, each laid on the skin straight out from inside the digit.
        top, rim = [], []
        for ring in range(NAIL_RINGS + 1):
            rho = ring / NAIL_RINGS
            for j in range(NAIL_SEGMENTS if ring else 1):
                a = 2 * math.pi * j / NAIL_SEGMENTS
                x = math.copysign(abs(math.cos(a)) ** (2 / NAIL_SQUARENESS), math.cos(a)) * rho
                y = math.copysign(abs(math.sin(a)) ** (2 / NAIL_SQUARENESS), math.sin(a)) * rho
                o = joint + along * (t + x * half_length) + side * (middle + y * half_width) - up * half * 0.5
                loc, nrm, _ = cast(o, up, half * 3)
                if loc is None:
                    loc, nrm = o + up * half * 1.2, up
                top.append(loc + nrm * NAIL_LIFT)
                if ring == NAIL_RINGS:
                    rim.append(loc - nrm * NAIL_SINK)
        base = len(co)
        co += top + rim
        ring_at = lambda r: base + 1 + (r - 1) * NAIL_SEGMENTS  # noqa: E731
        rim_at = base + 1 + NAIL_RINGS * NAIL_SEGMENTS
        mine = []
        for j in range(NAIL_SEGMENTS):
            k = (j + 1) % NAIL_SEGMENTS
            mine.append([base, ring_at(1) + j, ring_at(1) + k])
            for r in range(1, NAIL_RINGS):
                mine.append([ring_at(r) + j, ring_at(r + 1) + j, ring_at(r + 1) + k, ring_at(r) + k])
            mine.append([ring_at(NAIL_RINGS) + j, rim_at + j, rim_at + k, ring_at(NAIL_RINGS) + k])
        # (Facing out of the nail: turned round if the first face faces in.)
        p = np.array(co)
        f0 = mine[0]
        if np.cross(p[f0[1]] - p[f0[0]], p[f0[2]] - p[f0[0]]) @ up < 0:
            mine = [list(reversed(f)) for f in mine]
        faces += mine
    co = np.array(co)
    _, _, tv, bary = skin.nearest(co)
    keys = {k: (skin.keys[k][tv] * bary[:, :, None]).sum(1) for k in skin.keys}
    W = (skin.W[tv] * bary[:, :, None]).sum(1)
    log(f"nails: {len(digits)} of them, {len(co)} vertices")
    return Part(co, faces, [PART["nails"]] * len(faces), [[tuple(uv0)] * len(f) for f in faces], _still(keys), W)


def _along_skin(n, edges, seeds):
    """Each vertex's distance along the skin (`edges`: per vertex, [(other, length)]) from the nearest of `seeds`."""
    far = np.full(n, np.inf)
    far[seeds] = 0.0
    heap = [(0.0, int(v)) for v in seeds]
    while heap:
        d, v = heapq.heappop(heap)
        if d > far[v]:
            continue
        for o, length in edges[v]:
            if d + length < far[o]:
                far[o] = d + length
                heapq.heappush(heap, (d + length, o))
    return far


def finger_weights(co, faces, W, chains, backs):
    """The skin's weights with the fingers' bones (columns BONE_NAMES + FINGER_BONES): what the hand held of
    each finger is shared out along it, blended across each knuckle (FINGER_BLEND), and the palm stays the
    hand's. Which finger a vertex follows is measured along the skin, from the finger's outer two bones back
    towards the palm (through the air its neighbour's side is as near as its own): the webs between fingers
    are shared, so they stretch and don't tear, and a finger's own sides are its own. The thumb's ball follows
    its first bone, less the further from it. Four bones a vertex at most."""
    out = np.zeros((len(co), len(BONE_NAMES) + len(FINGER_BONES)))
    out[:, : W.shape[1]] = W
    radii = {}
    for s in ("l", "r"):
        hand = BONE_INDEX[f"hand_{s}"]
        idx = np.nonzero(W[:, hand] > 0)[0]
        p = co[idx]
        dist = np.stack([np.min([segment_distance(p, a, b) for a, b in zip(chains[(s, f)][:-1], chains[(s, f)][1:])], axis=0) for f in FINGERS], axis=1)
        nearest = dist.argmin(1)
        second = np.sort(dist, axis=1)[:, 1]
        share = np.zeros((len(idx), 5, 3))
        local = -np.ones(len(co), dtype=np.int64)
        local[idx] = np.arange(len(idx))
        edges = [[] for _ in idx]
        for fc in faces:
            at = local[list(fc)]
            if (at < 0).any():
                continue
            for i in range(len(fc)):
                for j in range(i + 1, len(fc)):
                    length = float(np.linalg.norm(co[fc[i]] - co[fc[j]]))
                    edges[at[i]].append((int(at[j]), length))
                    edges[at[j]].append((int(at[i]), length))
        radius, reach = [], []
        for col, f in enumerate(FINGERS):
            ch = chains[(s, f)]
            mid = (nearest == col) & (np.abs(along(p, ch[1], ch[2]) - 0.5) < 0.3)
            radius.append(np.median(segment_distance(p[mid], ch[1], ch[2])))
            # (From what is surely this finger's: past its middle joint and clearly nearest its own line. Counted
            # from its first knuckle, so two fingers meet where they are as far past their knuckles.)
            k = 2 if f == 1 else 1
            sure = (nearest == col) & ((p - ch[k]) @ _unit(ch[k + 1] - ch[k]) > 0) & (dist[:, col] < 0.8 * second)
            reach.append(_along_skin(len(idx), edges, np.nonzero(sure)[0]) - np.linalg.norm(ch[k] - ch[k - 1]))
        radii[s] = radius
        reach = np.stack(reach, axis=1)
        lost = ~np.isfinite(reach).all(1)  # (skin not joined to the rest: by the straight distance)
        reach[lost] = dist[lost]
        soft = np.exp(-(((reach - reach.min(1, keepdims=True)) / (FINGER_SHARE * np.array(radius))) ** 2))
        soft /= soft.sum(1, keepdims=True)
        for col, f in enumerate(FINGERS):
            ch, r = chains[(s, f)], radius[col]
            d = [_unit(ch[k + 1] - ch[k]) for k in range(3)]
            across = [d[0], _unit(d[0] + d[1]), _unit(d[1] + d[2])]  # each joint's plane, halfway between its bones
            back = backs[(s, f)]
            past = []
            for k in range(3):
                blend = (THUMB_BLEND if f == 1 else FINGER_BLEND)[k]
                t = (p - ch[k]) @ across[k]
                if blend is None:
                    # (The thumb's first joint is by the wrist, in the hand: its bone takes hold along its first half.)
                    past.append(wa.smoothstep(0.0, 0.5 * np.linalg.norm(ch[1] - ch[0]), t))
                    continue
                centre, more, half = blend
                up = np.clip(((p - ch[k]) @ _unit(back - (back @ across[k]) * across[k])) / r, 0.0, 1.0)
                past.append(wa.smoothstep(-half * r, half * r, t - (centre + more * up) * r))
            hold = soft[:, col]
            if f == 1:
                hold = hold * (1 - wa.smoothstep(THUMB_REACH[0] * r, THUMB_REACH[1] * r, dist[:, col]))
            share[:, col, 0] = hold * past[0] * (1 - past[1])
            share[:, col, 1] = hold * past[0] * past[1] * (1 - past[2])
            share[:, col, 2] = hold * past[0] * past[1] * past[2]
        share[share < 0.004] = 0.0
        rows = out[idx]
        held = rows[:, hand].copy()
        for col, f in enumerate(FINGERS):
            for k in range(3):
                rows[:, len(BONE_NAMES) + FINGER_BONES.index(f"{FINGERS[f]}_{k + 1:02d}_{s}")] = held * share[:, col, k]
        rows[:, hand] = held * (1 - share.sum((1, 2)))
        total = rows.sum(1, keepdims=True)
        np.put_along_axis(rows, np.argsort(rows, axis=1)[:, :-4], 0.0, axis=1)
        out[idx] = rows * total / rows.sum(1, keepdims=True)
    moved = (out[:, len(BONE_NAMES) :] > 0).any(1)
    log(f"the fingers: {int(moved.sum())} vertices on their bones; their sizes " + ", ".join(f"{r * 1000:.1f}" for r in radii["l"]) + " mm")
    return out


def add_finger_bones(rig, chains, backs):
    """The fingers' bones (FINGER_BONES) added under the hands, every other bone left as it is."""
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.mode_set(mode="EDIT")
    for (s, f), ch in chains.items():
        parent = rig.data.edit_bones[f"hand_{s}"]
        for k in range(3):
            eb = rig.data.edit_bones.new(f"{FINGERS[f]}_{k + 1:02d}_{s}")
            eb.head, eb.tail = Vector(ch[k]), Vector(ch[k + 1])
            eb.parent = parent
            eb.use_connect = False
            eb.align_roll(Vector(backs[(s, f)]))
            parent = eb
    bpy.ops.object.mode_set(mode="OBJECT")


# ── The races' parts: tusks, horns, a tail, facial hair ──────────────────────────────────────────────
#
# Each a mesh of its own beside the body, for the game to show or leave out, with the body's shape keys (it
# follows the skin it sits on) and a material of its own to colour: tusks-01 and -02 (`teeth`), horns-01 to
# -04 (`horns`), tail-tiefling (`skin`, on bones of its own under the pelvis), beard-01 to -05, moustache-01
# and foothair-01 (`hair`: cards cut out of a near-white texture of strands, alpha MASK, tinted as the hair
# is).

TAIL = [f"tail_{i:02d}" for i in range(1, 6)]
ALL_BONES = BONE_NAMES + FINGER_BONES + TAIL
HAIR_CUTOFF = 0.5  # the facial hair's alpha test
STILL = 0.0003  # a key's move under this is dropped (invisible, and the file then stores only what moves)
ROOT_DEPTH = 0.0025  # how far under the skin a hair's root starts, so no gap shows between a beard and the face


def _tri(u):
    """0..1 there and back: a texture wrapped round a part with no seam."""
    return 1 - np.abs(2 * np.mod(u, 1.0) - 1)


def _mirrored(co, faces, uv):
    """A left part and its mirror image on the right, as one."""
    n = len(co)
    return np.concatenate([co, co * np.array([-1.0, 1.0, 1.0])]), [list(f) for f in faces] + [[v + n for v in reversed(f)] for f in faces], [list(c) for c in uv] + [list(reversed(c)) for c in uv]


class Face:
    """The head's landmarks and directions the parts are placed by, and the skin of the head alone (what a
    part on the head follows through the shape keys, not the chest it may hang over)."""

    def __init__(self, B, skin, body, J, marks, mats, faces, inside):
        self.B, self.skin, self.J, self.marks = B, skin, J, marks
        self.inside = np.array(inside, dtype=bool)  # each face: inside the mouth
        self.k = B["height"] / 1.78
        co = skin.co
        head = skin.W[:, BONE_INDEX["Head"]]
        self.eye_z = body.eye["l"]["centre"][2]
        self.eye = body.eye["l"]["centre"]
        skull = (head > 0.99) & (co[:, 2] > self.eye_z)
        self.C = np.array([0.0, (co[skull, 1].min() + co[skull, 1].max()) / 2, self.eye_z + 0.012])
        mid = (np.abs(co[:, 0]) < 0.004) & (head > 0.5) & (co[:, 1] < self.C[1])
        nose, mouth, chin = marks["nose"], marks["mouth"], marks["chin"]
        band = mid & (co[:, 2] < nose[2] - 0.002) & (co[:, 2] > mouth[2] + 0.006)
        self.sub = co[band][np.argmax(co[band, 1])]  # under the nose, where it meets the lip
        band = mid & (co[:, 2] < chin[2] + 0.005) & (co[:, 1] < chin[1] + 0.035)
        self.menton = co[band][np.argmin(co[band, 2])]  # the chin's underside
        self.nose, self.mouth, self.chin = nose, mouth, chin
        lipv = np.unique([v for f, m in zip(faces, mats) if m == PART["lips"] for v in f])
        self.lip_half = np.abs(co[lipv, 0]).max()
        self.lips = co[lipv]
        self.ear = marks["ear"][1]
        self.tri_mat = np.array([-1 if hidden else m for f, m, hidden in zip(faces, mats, inside) for _ in range(1, len(f) - 1)])
        on_head = (head[skin.tris] >= 0.5).all(1)
        self.head_tris = skin.tris[on_head]
        self.head_bvh = BVHTree.FromPolygons(co.tolist(), self.head_tris.tolist())
        self.outer_tris = skin.tris[self.tri_mat >= 0]
        self.outer_bvh = BVHTree.FromPolygons(co.tolist(), self.outer_tris.tolist())

    def az(self, p):
        """The angle round the head from the front (0) to the back (180), in degrees."""
        return np.degrees(np.arctan2(np.abs(p[:, 0]), -(p[:, 1] - self.C[1])))

    def scalp(self, az, el):
        """The skin's point and normal in a direction from the head's middle (az: degrees from the front
        towards the body's left; el: up from level)."""
        a, e = math.radians(az), math.radians(el)
        d = Vector((math.sin(a) * math.cos(e), -math.cos(a) * math.cos(e), math.sin(e)))
        loc, nrm, _, _ = self.skin.bvh.ray_cast(Vector(self.C), d, 0.5)
        n = np.array(nrm)
        return np.array(loc), n if n @ np.array(d) > 0 else -n

    def front(self, x, z):
        """The skin's frontmost point at (x, z)."""
        loc, _, _, _ = self.skin.bvh.ray_cast(Vector((x, self.C[1] - 0.4, z)), Vector((0, 1, 0)), 1.0)
        return np.array(loc)

    def under_skin(self, points, depth):
        """Each point put `depth` under the skin's nearest point (the outside's, not the mouth's inside)."""
        out = np.zeros((len(points), 3))
        for i, q in enumerate(points):
            loc, nrm, _, _ = self.outer_bvh.find_nearest(Vector(q))
            out[i] = np.array(loc) - np.array(nrm) * depth
        return out

    def follow(self, points, key_names, head=True, rigid=None):
        """Shape key offsets for `points`: those of the skin's nearest point to each (the head's alone if
        `head`); with `rigid` (a point) the whole part moves as that one point does."""
        skin = self.skin
        P = np.asarray(points if rigid is None else [rigid], dtype=np.float64)
        if head:
            hits = [self.head_bvh.find_nearest(Vector(p)) for p in P]
            tri = np.array([h[2] for h in hits])
            loc = np.array([h[0] for h in hits])
            tv = self.head_tris[tri]
            bary = np.clip(wa.bary_attach(self.head_tris, skin.co, tri, loc), 0.0, 1.0)
            bary /= np.maximum(bary.sum(1, keepdims=True), 1e-9)
        else:
            _, _, tv, bary = skin.nearest(P)
        keys = {}
        for k in key_names:
            d = (skin.keys[k][tv] * bary[:, :, None]).sum(1)
            keys[k] = np.repeat(d, len(points), axis=0) if rigid is not None else d
        return keys, (skin.W[tv] * bary[:, :, None]).sum(1)

    def keep_clear(self, points, keys, sel):
        """The keys' offsets at `points[sel]` put right where a key's skin (a deeper chest, a fuller neck)
        would come through what hangs over it: pushed out to the distance it hangs at rest."""
        skin = self.skin
        P = points[sel]
        loc, n, _, _ = skin.nearest(P)
        rest = np.clip(((P - loc) * n).sum(1), 0.0008, 0.012)
        for k in keys:
            if np.abs(skin.keys[k]).max() < 1e-6:
                continue
            if k not in skin.keyed:
                skin.keyed[k] = Skin(skin.co + skin.keys[k], skin.faces, skin.W, {})
            was = keys[k][sel]
            pushed = skin.keyed[k].clear(P + was, rest) - P
            # (Only where it's pushed by more than half a millimetre: less is the measuring, not the skin.)
            keys[k][sel] = np.where((np.linalg.norm(pushed - was, axis=1) > 0.0005)[:, None], pushed, was)


def _unit_rows(v):
    return v / np.maximum(np.linalg.norm(v, axis=1, keepdims=True), 1e-12)


def _still(keys):
    for k in keys:
        keys[k][np.linalg.norm(keys[k], axis=1) < STILL] = 0.0
    return keys


def _head_weights(n):
    W = np.zeros((n, len(BONE_NAMES)))
    W[:, BONE_INDEX["Head"]] = 1.0
    return W


def _parts_uv(uv, tooth=False):
    """A tube's texture coordinates laid into the horn's half of the parts' texture, or the tooth's."""
    return [[((0.5 if tooth else 0.0) + 0.01 + 0.48 * _tri(u), 0.01 + 0.98 * v) for u, v in c] for c in uv]


def tusks(F, key_names):
    """A half-orc's lower tusks, small and large: each rises from behind the lower lip a little in from the
    mouth's corner, over the upper lip, curving out and back in."""
    out = []
    mz, half = F.mouth[2], F.lip_half
    for number, (length, r0) in enumerate(((0.011, 0.0048), (0.019, 0.0066)), 1):
        x = half * 0.56
        low = F.front(x, mz - 0.004)
        high = F.front(x * 1.04, mz + length * 0.6)
        y = min(low[1], high[1]) - r0 * 0.25
        pts = wa.curve([[x * 0.94, low[1] + 0.008, mz - 0.013], [x, low[1] + 0.002, mz - 0.004], [x * 1.09, y, mz + length * 0.5], [x * 1.06, y + 0.002, mz + length]], 10)
        t = np.linspace(0, 1, len(pts))
        co, faces, uv = wa.tube(pts, r0 * (1 - t**1.5) + 0.0011, [1.0, 0.0, 0.0], segments=10, squash=0.86)
        co, faces, uv = _mirrored(co, faces, _parts_uv(uv, tooth=True))
        keys = {}
        for sign in (1.0, -1.0):
            k, _ = F.follow(co[: len(co) // 2], key_names, rigid=pts[1] * np.array([sign, 1.0, 1.0]))
            for name, d in k.items():
                keys[name] = d if sign > 0 else np.concatenate([keys[name], d])
        out.append((f"tusks-{number:02d}", Part(co, faces, [PART["teeth"]] * len(faces), uv, _still(keys), _head_weights(len(co)))))
    return out


# Each horn style: where it stands on the skull (the angle round from the front and up from level), its radius
# at the root and the tip, and its line from there as (out of the skull, up, back, to its side) in metres.
HORNS = [
    # Swept back along the skull, the tips turning up.
    dict(at=(34, 33), r=(0.019, 0.0035), n=64, line=[(-0.008, 0, 0, 0), (0.022, 0.01, 0.004, 0), (0.034, 0.04, 0.04, 0.01), (0.03, 0.062, 0.09, 0.02), (0.024, 0.078, 0.135, 0.028), (0.024, 0.104, 0.165, 0.032)]),
    # A ram's curl: back, down round the ear and forward again.
    dict(at=(56, 34), r=(0.021, 0.004), n=80, curl=dict(radius=(0.043, 0.024), turns=1.05, out=0.024)),
    # Short nubs.
    dict(at=(30, 31), r=(0.014, 0.004), n=28, rings=0.5, line=[(-0.006, 0, 0, 0), (0.014, 0.006, 0, 0), (0.028, 0.016, 0.006, 0.002), (0.036, 0.026, 0.012, 0.003)]),
    # Tall and upright, the tips leaning in.
    dict(at=(32, 34), r=(0.019, 0.0035), n=72, line=[(-0.008, 0, 0, 0), (0.03, 0.018, 0, 0), (0.035, 0.085, 0.018, 0.026), (0.03, 0.155, 0.03, 0.034), (0.03, 0.215, 0.03, 0.024), (0.03, 0.26, 0.022, 0.008)]),
]


def horns(F, key_names):
    """A tiefling's horns, each style a pair: a ridged tube from the skull along the style's line."""
    out = []
    for number, style in enumerate(HORNS, 1):
        base, n0 = F.scalp(*style["at"])
        up, back, side = np.array([0.0, 0.0, 1.0]), np.array([0.0, 1.0, 0.0]), np.array([1.0, 0.0, 0.0])
        if "curl" in style:
            c = style["curl"]
            centre = base + back * 0.03 - up * 0.028 + n0 * 0.012
            a0 = math.atan2((base - centre) @ up, (base - centre) @ back)
            ctrl = [base - n0 * 0.008]
            for i in range(1, 15):
                u = i / 14
                a = a0 - 2 * math.pi * c["turns"] * u  # (over the top to the back, then down and forward)
                rad = c["radius"][0] + (c["radius"][1] - c["radius"][0]) * u
                rad = rad * min(1.0, 0.75 + u * 2) if u < 0.12 else rad
                ctrl.append(centre + (back * math.cos(a) + up * math.sin(a)) * rad + side * (0.012 + c["out"] * u) + n0 * 0.01)
        else:
            ctrl = [base + n0 * o + up * u_ + back * b + side * s_ for o, u_, b, s_ in style["line"]]
        pts = wa.curve(np.array(ctrl) * 1.0, style["n"])
        t = np.linspace(0, 1, len(pts))
        r0, r1 = style["r"]
        radii = (r1 + (r0 - r1) * (1 - t) ** 0.85) * (1 + 0.14 * np.exp(-t / 0.035)) * (1 - 0.075 * style.get("rings", 1.0) * wa.horn_rings(t))
        co, faces, uv = wa.tube(pts, radii, side, segments=12)
        co, faces, uv = _mirrored(co, faces, _parts_uv(uv))
        keys = {}
        for sign in (1.0, -1.0):
            k, _ = F.follow(co[: len(co) // 2], key_names, rigid=base * np.array([sign, 1.0, 1.0]))
            for name, d in k.items():
                keys[name] = d if sign > 0 else np.concatenate([keys[name], d])
        out.append((f"horns-{number:02d}", Part(co, faces, [PART["horns"]] * len(faces), uv, _still(keys), _head_weights(len(co)))))
    return out


def back_patch(skin, faces, uv, J):
    """A patch of plain skin in the texture (the small of the back, left of the spine), as (u0, v0, u1, v1):
    what the tail is drawn with, so it has every skin's own colour and grain."""
    co = skin.co
    z0 = J["pelvis"][2]
    pts = []
    for f, c in zip(faces, uv):
        p = co[f].mean(0)
        if 0.02 < p[0] < 0.06 and p[1] > J["spine_01"][1] and z0 + 0.13 < p[2] < z0 + 0.19:
            pts += [tuple(x) for x in c]
    pts = np.array(pts)
    lo, hi = np.percentile(pts, 20, axis=0), np.percentile(pts, 80, axis=0)
    log(f"the tail's patch of skin: u {lo[0]:.3f}-{hi[0]:.3f}, v {lo[1]:.3f}-{hi[1]:.3f} ({len(pts)} corners)")
    return lo[0], lo[1], hi[0], hi[1]


def tail(F, key_names, patch):
    """A tiefling's tail: long and slim, from the base of the spine back and down, the end curling up to a spade
    tip. Returns (name, Part, the tail bones' joints: six points along it)."""
    k, J = F.k, F.J
    z0 = J["pelvis"][2] + 0.03 * k
    loc, _, _, _ = F.skin.bvh.ray_cast(Vector((0.0, 0.6, z0)), Vector((0, -1, 0)), 1.0)
    base = np.array(loc)
    line = [(0, -0.03, 0.01), (0, 0.035, -0.004), (0, 0.12, -0.085), (0.0, 0.2, -0.25), (0.005, 0.25, -0.44), (0.02, 0.305, -0.6), (0.045, 0.39, -0.69), (0.07, 0.49, -0.69), (0.085, 0.57, -0.62), (0.09, 0.61, -0.53)]
    pts = wa.curve(base + np.array(line) * k, 64)
    s = np.concatenate([[0.0], np.cumsum(np.linalg.norm(np.diff(pts, axis=0), axis=1))])
    t = s / s[-1]
    # Its girth: full where it leaves the body, slimming to the spade; the spade flat and wide, to a point.
    r = (0.0085 + 0.02 * (1 - t) ** 1.3) * (1 + 0.25 * np.exp(-t / 0.03)) * k
    u = np.clip((t - 0.9) / 0.1, 0, 1)
    wide = np.where(u > 0, np.interp(u, [0, 0.12, 0.38, 1.0], [0.0095, 0.012, 0.032, 0.0015]) * k, r)
    thick = np.where(u > 0, np.interp(u, [0, 0.38, 1.0], [0.0095, 0.006, 0.001]) * k, r)
    co, faces, uv = wa.tube(pts, wide, [1.0, 0.0, 0.0], segments=12, squash=thick / wide)
    u0, v0, u1, v1 = patch
    fuv = [[(u0 + (u1 - u0) * _tri(a), v0 + (v1 - v0) * _tri(b * 5.0)) for a, b in c] for c in uv]
    tv = np.concatenate([np.repeat(t, 12), [1.0]])
    W = np.zeros((len(co), len(ALL_BONES)))
    q = tv * len(TAIL)
    past = [np.ones(len(co))] + [wa.smoothstep(j - 0.3, j + 0.3, q) for j in range(1, len(TAIL))] + [np.zeros(len(co))]
    for j, bone in enumerate(TAIL):
        W[:, ALL_BONES.index(bone)] = past[j] * (1 - past[j + 1])
    W /= W.sum(1, keepdims=True)
    keys, _ = F.follow(co, key_names, head=False, rigid=base)
    joints = [np.array([np.interp(f, t, pts[:, i]) for i in range(3)]) for f in np.linspace(0, 1, len(TAIL) + 1)]
    return "tail-tiefling", Part(co, faces, [PART["skin"]] * len(faces), fuv, _still(keys), W), joints


def add_tail_bones(rig, joints):
    """The tail's bones (TAIL) added under the pelvis, every other bone left as it is."""
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.mode_set(mode="EDIT")
    parent = rig.data.edit_bones["pelvis"]
    for i, bone in enumerate(TAIL):
        eb = rig.data.edit_bones.new(bone)
        eb.head, eb.tail = Vector(joints[i]), Vector(joints[i + 1])
        eb.parent = parent
        eb.use_connect = False
        eb.align_roll(Vector((1, 0, 0)))
        parent = eb
    bpy.ops.object.mode_set(mode="OBJECT")


def sway_tail(rig):
    """A gentle sway of the tail, looping, in the model's own Idle (its other bones' keys left as they are):
    a slow wave running down it, side to side with a little lift."""
    action = bpy.data.actions.get("Idle")
    if action is None:
        return
    rig.animation_data.action = action
    if hasattr(rig.animation_data, "action_slot") and rig.animation_data.action_slot is None and len(action.slots):
        rig.animation_data.action_slot = action.slots[0]
    rest = {b: rig.data.bones[b].matrix_local.to_3x3().inverted() for b in TAIL}
    for j in range(9):
        u = j / 8
        for i, bone in enumerate(TAIL):
            pb = rig.pose.bones[bone]
            pb.rotation_mode = "QUATERNION"
            swing = math.radians(3.5 + 1.2 * i) * math.sin(2 * math.pi * u - 0.8 * i)
            lift = math.radians(1.2) * math.sin(2 * math.pi * u - 0.8 * i + 1.3)
            pb.rotation_quaternion = Quaternion(rest[bone] @ Vector((0, 0, 1)), swing) @ Quaternion(rest[bone] @ Vector((1, 0, 0)), lift)
            pb.keyframe_insert("rotation_quaternion", frame=1 + 59 * u, group=bone)
    rig.animation_data.action = None
    for bone in TAIL:
        rig.pose.bones[bone].rotation_quaternion = Quaternion()


class Hair:
    """Facial hair being made: cards (strips of strands cut out by the texture) grown from roots on the skin
    along its flow, shingled over each other; under them an undercoat of soft patches of short hair lying on
    the skin; and solid pieces (a long beard's body, braids). Each card moves as the skin at its root does
    through the shape keys, each patch with the skin under it."""

    def __init__(self, F, seed):
        self.F, self.skin = F, F.skin
        self.rng = np.random.default_rng(seed)
        self.co, self.faces, self.uv = [], [], []
        self.anchor = []  # each vertex's own place for following the skin, or its card's root
        self.anchor2, self.mix = [], []  # another place it follows, and how much (a long beard: its jaw, then its chin)
        self.normal = []  # each vertex's normal: the skin's under it (so the cards are lit as one soft mass)
        self.hang = []  # whether it hangs clear of the face (kept off the chest in every key)
        self.n = 0
        self.also = []  # other surfaces the cards lie over (a long beard's body)
        tris = self.skin.tris
        co = self.skin.co
        a, b, c = (co[tris[:, i]] for i in range(3))
        self.tri_area = np.linalg.norm(np.cross(b - a, c - a), axis=1) / 2
        self.tri_centre = (a + b + c) / 3

    def add(self, co, faces, uv, anchor=None, hang=False, normal=None, anchor2=None, mix=0.0):
        co = np.asarray(co, dtype=np.float64)
        self.co.append(co)
        self.anchor2.append(co if anchor2 is None else np.asarray(anchor2, dtype=np.float64))
        self.mix.append(np.broadcast_to(np.asarray(mix, dtype=np.float64), (len(co),)).copy())
        if normal is None:
            normal = wa.vertex_normals_of(co, faces)
        self.normal.append(np.asarray(normal, dtype=np.float64))
        self.faces += [[v + self.n for v in f] for f in faces]
        self.uv += uv
        self.anchor.append(co if anchor is None else np.asarray(anchor, dtype=np.float64))
        self.hang.append(np.full(len(co), hang) if np.isscalar(hang) else np.asarray(hang))
        self.n += len(co)

    def roots(self, cover, spacing, part="skin", bones=("Head",)):
        """Points scattered evenly over the skin where `cover` (a field over points, 0..1) is over a half,
        about `spacing` apart (many more are thrown than kept: one too near those already kept is dropped, so
        they leave neither gaps nor clumps): (points, the skin's normals there, cover there)."""
        skin = self.skin
        # (Facial hair only where the skin is the head's own: it's all on the head bone, and skin the neck
        # shares would slide under it when the head turns.)
        least = 0.9 if tuple(bones) == ("Head",) else 0.3
        on = np.isin(self.F.tri_mat, [PART[part]]) & (skin.W[skin.tris][:, :, [BONE_INDEX[b] for b in bones]].sum(2).min(1) > least)
        on &= cover(self.tri_centre) > 0.5
        idx = np.nonzero(on)[0]
        if not len(idx):
            return np.zeros((0, 3)), np.zeros((0, 3)), np.zeros(0)
        area = self.tri_area[idx]
        count = 6 * int(area.sum() / spacing**2)
        pick = idx[self.rng.choice(len(idx), size=count, p=area / area.sum())]
        r1, r2 = np.sqrt(self.rng.random(count)), self.rng.random(count)
        bary = np.stack([1 - r1, r1 * (1 - r2), r1 * r2], axis=1)
        tv = skin.tris[pick]
        P = (skin.co[tv] * bary[:, :, None]).sum(1)
        kept = np.zeros((0, 3))
        keep = []
        for i, q in enumerate(P):
            if not len(keep) or ((kept - q) ** 2).sum(1).min() > (0.85 * spacing) ** 2:
                keep.append(i)
                kept = np.concatenate([kept, q[None]])
        P, tv, bary = kept, tv[keep], bary[keep]
        N = (skin.sn[tv] * bary[:, :, None]).sum(1)
        N /= np.linalg.norm(N, axis=1, keepdims=True)
        return P, N, cover(P)

    def clear(self, P, gap):
        P = self.skin.clear(P, gap)
        for surface in self.also:
            P = surface.clear(P, gap)
        return P

    def off_skin(self, P):
        """Whether each point lies over the lips or the mouth's inside (where no hair lies)."""
        tri = np.array([self.skin.bvh.find_nearest(Vector(p))[2] for p in P])
        m = self.F.tri_mat[tri]
        return (m == PART["lips"]) | (m < 0)

    def from_lips(self, P):
        """Each point's distance from the lips."""
        lips = self.F.lips
        return np.array([np.sqrt(((lips - p) ** 2).sum(1).min()) for p in P])

    def patches(self, cover, size=0.04, spacing=0.0118, grid=4, flow=None):
        """The undercoat: soft patches of short hair laid on the skin, overlapping, wherever `cover` is over
        a third: dense in its middle, thinner towards its edge (the texture's three patches), smaller near the
        lips so none lies over them. Each a small grid pressed onto the skin, its hair pointing down."""
        P, N, c = self.roots(lambda p: np.clip(cover(p) + 0.12, 0, 1), spacing)
        if not len(P):
            return
        rng = self.rng
        n = len(P)
        tile = np.where(c > 0.72, 0, np.where(c > 0.5, 1, 2))
        s = np.minimum(size * (0.5 + 0.5 * wa.smoothstep(0.4, 0.95, c)), np.maximum(self.from_lips(P) * 3.0, 0.012)) * rng.uniform(0.85, 1.15, n)
        d = (flow or Beards.down)(P, N)
        d = d - N * (d * N).sum(1, keepdims=True)
        weak = np.linalg.norm(d, axis=1) < 0.3
        d[weak] = np.array([0.0, -1.0, 0.0]) - N[weak] * (-N[weak, 1])[:, None]
        d = _unit_rows(d)
        turn = np.radians(rng.uniform(-18, 18, n))
        d = d * np.cos(turn)[:, None] + np.cross(N, d) * np.sin(turn)[:, None]
        side = np.cross(d, N)
        gap = rng.uniform(0.0006, 0.0011, n)  # (close on the skin: the grid is fine enough not to dip under it)
        ab = np.linspace(-0.5, 0.5, grid)
        co = np.zeros((n, grid, grid, 3))
        for i, b in enumerate(ab):
            for j, a in enumerate(ab):
                co[:, i, j] = P + side * (s * a)[:, None] + d * (s * b)[:, None]
        flat = co.reshape(-1, 3)
        # (A corner that would lie over the lips is drawn back towards its patch's middle, to the lip's edge.)
        centre = np.repeat(P, grid * grid, axis=0)
        over = np.nonzero(self.off_skin(flat))[0]
        if len(over):
            lo, hi = np.zeros(len(over)), np.ones(len(over))
            for _ in range(5):
                mid = (lo + hi) / 2
                bad = self.off_skin(centre[over] + (flat[over] - centre[over]) * mid[:, None])
                hi = np.where(bad, mid, hi)
                lo = np.where(bad, lo, mid)
            flat[over] = centre[over] + (flat[over] - centre[over]) * lo[:, None]
        loc, nrm, _, _ = self.skin.nearest(flat, smooth=True)
        flat = loc + nrm * np.repeat(gap, grid * grid)[:, None]
        # (Where the skin is strongly rounded, a chin, a patch's flat cells would dip under it between their
        # corners and leave holes: such a patch is lifted till the middle of every cell is clear.)
        cells = flat.reshape(n, grid, grid, 3)
        mids = ((cells[:, :-1, :-1] + cells[:, 1:, :-1] + cells[:, :-1, 1:] + cells[:, 1:, 1:]) / 4).reshape(-1, 3)
        at, out, _, _ = self.skin.nearest(mids)
        dip = np.maximum(0.0003 - ((mids - at) * out).sum(1).reshape(n, -1).min(1), 0.0)
        flat = flat + nrm * np.repeat(dip, grid * grid)[:, None]
        faces, uv = [], []
        for k in range(n):
            region = f"patch{tile[k]}"
            for i in range(grid - 1):
                for j in range(grid - 1):
                    a0 = k * grid * grid + i * grid + j
                    faces.append([a0, a0 + 1, a0 + grid + 1, a0 + grid])
                    u0, u1, v0, v1 = j / (grid - 1), (j + 1) / (grid - 1), 1 - i / (grid - 1), 1 - (i + 1) / (grid - 1)
                    uv.append([wa.hair_region(region, u0, v0), wa.hair_region(region, u1, v0), wa.hair_region(region, u1, v1), wa.hair_region(region, u0, v1)])
        self.add(flat, faces, uv, normal=nrm)

    def cards(self, P, N, flow, length, width, lift, steps, locks, hang=(0.0, -0.18, -1.0), free=0.02, spread=14.0, rows=2, root_gap=0.0008, taper=0.75, rigid=False, edge=None, on_face=True):
        """A card from each root: `length` long and `width` wide (each a number or one per root), stepping
        along `flow(points, normals)` (lying on the skin), turning to hang (`hang`) past `free` metres or
        where the skin faces down, lifting to `lift` off the skin by its tip, the roots turned `spread`
        degrees either way at random. `rows` points across (3: its middle raised, a rounded lock). `edge` (the
        cover at each root) makes it smaller towards the edge of where it grows; `rigid` is for a card that
        hangs from something other than the skin (a long beard's body); off the face, `on_face` is False."""
        n = len(P)
        if not n:
            return
        rng = self.rng
        length = np.broadcast_to(length, (n,)) * rng.uniform(0.75, 1.15, n)
        width = np.broadcast_to(width, (n,)) * rng.uniform(0.8, 1.2, n)
        if edge is not None:
            # (Shorter and narrower towards the edge of where it grows: `edge` is the cover at each root.)
            k = wa.smoothstep(0.5, 0.95, edge)
            length, width = length * (0.45 + 0.55 * k), width * (0.65 + 0.35 * k)
        lips = on_face and not rigid  # (on the face: narrower by the lips, and never over them)
        if lips:
            width = np.minimum(width, np.maximum(self.from_lips(P) * 2.2, 0.004))
        stopped = np.zeros(n, dtype=bool)
        lift = np.broadcast_to(lift, (n,)) * rng.uniform(0.6, 1.3, n)
        hang_dir = _unit(hang)
        yaw = np.radians(rng.uniform(-spread, spread, n))
        pts = [P - N * ROOT_DEPTH]  # (its root under the skin: it comes out of the face, with no gap)
        dirs, norms = [], []
        nrm = N
        for i in range(steps):
            p = pts[-1]
            if i:
                _, nrm, _, _ = self.skin.nearest(p, smooth=True)
            d = flow(p, nrm)
            d = d - nrm * (d * nrm).sum(1, keepdims=True)
            flat = np.linalg.norm(d, axis=1, keepdims=True)
            d = d / np.maximum(flat, 1e-9)
            # (Turned about the skin's normal by its root's own angle.)
            d = d * np.cos(yaw)[:, None] + np.cross(nrm, d) * np.sin(yaw)[:, None]
            run = length * i / steps
            h = np.clip(np.maximum((run - free) / 0.02, (0.35 - flat[:, 0]) / 0.25), 0.0, 1.0)[:, None]
            d = d * (1 - h) + hang_dir * h
            d /= np.maximum(np.linalg.norm(d, axis=1, keepdims=True), 1e-9)
            nxt = p + d * (length / steps)[:, None]
            gap = root_gap + lift * ((i + 1) / steps) ** 1.2
            nxt = self.clear(nxt, gap)
            if lips:
                # (A hair that would lie over the lips is shortened till it doesn't, and ends there: a
                # moustache's trimmed line.)
                for part in (0.5, 0.2):
                    over = np.nonzero(self.off_skin(nxt) & (run < 0.02) & ~stopped)[0]
                    if not len(over):
                        break
                    nxt[over] = self.clear(p[over] + d[over] * (length[over] / steps * part)[:, None], gap[over])
                stopped |= self.off_skin(nxt) & (run < 0.02)
                nxt[stopped] = self.clear(p[stopped] + d[stopped] * 0.0004, gap[stopped])
            pts.append(nxt)
            dirs.append(d)
            norms.append(nrm)
        dirs.append(dirs[-1])
        _, last, _, _ = self.skin.nearest(pts[-1], smooth=True)
        norms.append(last)
        column = rng.choice(np.concatenate([wa.LOCKS[name] for name in locks]), size=n)
        cross = np.linspace(-0.5, 0.5, rows)
        co = np.zeros((n, steps + 1, rows, 3))
        vn = np.zeros((n, steps + 1, rows, 3))
        for i in range(steps + 1):
            nrm, d = norms[i], dirs[i]
            side = np.cross(d, nrm)
            weak = np.linalg.norm(side, axis=1) < 0.35
            if weak.any():
                # (Where a strand stands straight off the skin, its card faces out from the head's middle.)
                out = pts[i][weak] - self.F.C
                out[:, 2] *= 0.3
                side[weak] = np.cross(d[weak], out / np.linalg.norm(out, axis=1, keepdims=True))
            side /= np.maximum(np.linalg.norm(side, axis=1, keepdims=True), 1e-9)
            face_n = np.cross(side, d)
            w = width * (1 - (1 - taper) * (i / steps) ** 2)
            lit = N if rigid else nrm
            for j, x in enumerate(cross):
                co[:, i, j] = pts[i] + side * (w * x)[:, None] + face_n * ((0.25 - x * x) * 0.5 * w)[:, None] * (rows > 2)
                vn[:, i, j] = _unit_rows(lit * 0.75 + face_n * 0.25 + side * (x * 0.5))
        faces, uv = [], []
        per = (steps + 1) * rows
        for c in range(n):
            lock = f"lock{column[c]}"
            for i in range(steps):
                for j in range(rows - 1):
                    a = c * per + i * rows + j
                    faces.append([a, a + 1, a + rows + 1, a + rows])
                    u0, u1, va, vb = j / (rows - 1), (j + 1) / (rows - 1), 1 - i / steps, 1 - (i + 1) / steps
                    uv.append([wa.hair_region(lock, u0, va), wa.hair_region(lock, u1, va), wa.hair_region(lock, u1, vb), wa.hair_region(lock, u0, vb)])
        if lips:
            # (Each point of a root on the skin's own curve, under it: a straight root would stand clear of a
            # rounded chin at its ends.)
            co[:, 0] = self.F.under_skin(co[:, 0].reshape(-1, 3), ROOT_DEPTH).reshape(n, rows, 3)
        flat_co = co.reshape(-1, 3)
        # (Each card moves as its root does through the shape keys: stiff, so it never folds. On the face each
        # point of its root row follows the skin under itself, so the root stays under the skin in every key.)
        anchor = np.repeat(P, per, axis=0)
        if lips:
            anchor.reshape(n, steps + 1, rows, 3)[:, 0] = co[:, 0]
        run = np.broadcast_to((np.arange(steps + 1)[None, :] * (length / steps)[:, None])[:, :, None], (n, steps + 1, rows)).reshape(-1)
        self.add(flat_co, faces, uv, anchor=anchor, hang=np.ones(len(run), dtype=bool) if rigid else run > free + 0.012, normal=vn.reshape(-1, 3))

    def solid(self, pts, radii, side, segments=7, squash=1.0, region="solid", v=(1.0, 0.3), anchor=None, tip=True):
        """A solid piece round a curve (a braid's strand, a tie), drawn with hair that has no gaps."""
        co, faces, uv = wa.tube(pts, radii, side, segments=segments, squash=squash, tip=tip)
        fuv = [[wa.hair_region(region, a, v[0] + (v[1] - v[0]) * b) for a, b in c] for c in uv]
        self.add(co, faces, fuv, anchor=np.repeat([anchor if anchor is not None else pts[0]], len(co), axis=0), hang=True)

    def part(self, key_names, head=True):
        co = np.concatenate(self.co)
        anchor = np.concatenate(self.anchor)
        hang = np.concatenate(self.hang)
        keys, W = self.F.follow(anchor, key_names, head=head)
        mix = np.concatenate(self.mix)
        if mix.any():
            other, _ = self.F.follow(np.concatenate(self.anchor2), key_names, head=head)
            keys = {k: keys[k] * (1 - mix)[:, None] + other[k] * mix[:, None] for k in keys}
        if hang.any():
            self.F.keep_clear(co, keys, hang)
        if head:
            # Facial hair is the head's alone: it grows from the chin and jaw, and turns and nods with them.
            W = _head_weights(len(co))
        else:
            order = np.argsort(-W, axis=1)
            keep = np.zeros_like(W, dtype=bool)
            np.put_along_axis(keep, order[:, :4], True, axis=1)
            W[~keep | (W < 0.01)] = 0.0
            W /= W.sum(1, keepdims=True)
        part = Part(co, self.faces, [PART["hair"]] * len(self.faces), self.uv, _still(keys), W)
        part.normals = np.concatenate(self.normal)
        return part


class Beards:
    """The facial hair's shapes on this face: where each grows (fields over the skin, 0..1), how the hair
    lies, and each style built from them."""

    def __init__(self, F):
        self.F = F
        f = F
        mz = f.mouth[2]
        self.top = lambda az: np.interp(az, [0, 10, 20, 32, 48, 64, 78, 92], [f.sub[2] - 0.002, f.sub[2] - 0.003, mz + 0.017, mz + 0.011, mz + 0.015, mz + 0.032, f.ear[2] - 0.006, f.ear[2] + 0.002])
        self.bottom = lambda az: np.interp(az, [0, 30, 55, 75, 95], [f.menton[2] - 0.04, f.menton[2] - 0.04, f.menton[2] - 0.027, f.menton[2] - 0.002, f.menton[2] + 0.024])

    def full(self, p, low=0.0, high=0.0):
        """A full beard: under a line from the nose's base round the mouth's corner up to the ear, down to a
        line under the jaw (`high` lowers its cheek line, `low` raises its neck line)."""
        az = self.F.az(p)
        d = np.minimum(self.top(az) - high * wa.smoothstep(24, 40, az) - p[:, 2], (p[:, 2] - self.bottom(az) - low) * 2.0)
        d = np.minimum(d, (88 - az) * 0.0012)
        return np.clip(0.5 + d / 0.006, 0, 1)

    def moustache(self, p, reach=0.012):
        f = self.F
        x = np.abs(p[:, 0])
        top = np.interp(x, [0, 0.4 * f.lip_half, f.lip_half, f.lip_half + reach], [f.sub[2] - 0.001, f.sub[2] - 0.002, f.mouth[2] + 0.013, f.mouth[2] + 0.004])
        d = np.minimum(np.minimum(top - p[:, 2], f.lip_half + reach - x), p[:, 2] - (f.mouth[2] - 0.004 - 0.02 * wa.smoothstep(f.lip_half * 0.9, f.lip_half + reach, x)))
        d = np.minimum(d, (f.C[1] - 0.045) - p[:, 1])
        return np.clip(0.5 + d / 0.004, 0, 1)

    def goatee(self, p):
        f = self.F
        x = np.abs(p[:, 0])
        mz = f.mouth[2]
        under_lip = mz - 0.012
        half = np.interp(p[:, 2], [f.menton[2] - 0.03, f.chin[2], under_lip], [f.lip_half * 0.75, f.lip_half * 0.98, f.lip_half * 0.92])
        chin = np.minimum(np.minimum(half - x, under_lip - p[:, 2]), p[:, 2] - (f.menton[2] - 0.026))
        link = np.minimum(np.minimum(x - (f.lip_half - 0.001), f.lip_half + 0.013 - x), np.minimum(mz + 0.01 - p[:, 2], p[:, 2] - (f.chin[2] - 0.005)))
        d = np.maximum(chin, link)
        d = np.minimum(d, (f.C[1] - 0.03) - p[:, 1])
        return np.clip(0.5 + d / 0.004, 0, 1)

    @staticmethod
    def down(p, n):
        return np.broadcast_to(np.array([0.0, -0.1, -1.0]), p.shape).copy()

    def outward(self, p, n):
        """A moustache's lie: from under the nose out along the lip and a little down."""
        d = np.stack([np.sign(p[:, 0]) * (0.25 + 0.75 * wa.smoothstep(0.0, 0.006, np.abs(p[:, 0]))), np.full(len(p), 0.1), np.full(len(p), -0.42)], axis=1)
        return d

    def make(self, key_names):
        F = self.F
        out = []

        def start(seed):
            return Hair(F, seed)

        def moustache(h, spacing, length, width, lift, reach=0.012, locks=("dense",), steps=3):
            cover = lambda p: self.moustache(p, reach)  # noqa: E731
            P, N, c = h.roots(cover, spacing)
            # (None from the nose's wings, whose skin faces the way the hair lies: it would stand straight off.)
            lies = np.abs((_unit_rows(self.outward(P, N)) * N).sum(1)) < 0.7
            P, N, c = P[lies], N[lies], c[lies]
            x = np.abs(P[:, 0]) / F.lip_half
            h.cards(P, N, self.outward, length * (0.65 + 0.5 * np.clip(x, 0, 1.2)), width, lift, steps, locks, hang=(0.0, -0.1, -1.0), free=length * 1.2, spread=9.0, edge=c)

        both = lambda p: np.maximum(self.full(p), self.moustache(p))  # noqa: E731
        # (Shorter up the cheek towards the ear, where a beard meets the hair's sideburn.)
        sideburn = lambda p: 1 - 0.55 * wa.smoothstep(52, 80, F.az(p))  # noqa: E731

        # 01: short, close to the face (a week or two's growth).
        h = start(11)
        h.patches(both, spacing=0.0108)
        h.patches(self.moustache, size=0.016, spacing=0.0065)
        P, N, c = h.roots(both, 0.0115)
        h.cards(P, N, self.down, 0.011, 0.012, 0.0018, 2, ("tuft", "wispy"), free=1.0, spread=28.0, taper=0.9, edge=c)
        out.append(("beard-01", h.part(key_names)))

        # 02: a full beard, trimmed: longer on the chin than on the cheeks, its moustache joined to it.
        h = start(12)
        h.patches(both)
        h.patches(self.moustache, size=0.016, spacing=0.0065)
        P, N, c = h.roots(self.full, 0.0098)
        chin = wa.smoothstep(F.mouth[2] + 0.005, F.chin[2] - 0.005, P[:, 2]) * wa.smoothstep(70, 30, F.az(P))
        h.cards(P, N, self.down, (0.016 + 0.02 * chin) * sideburn(P), 0.016, 0.0035 + 0.004 * chin, 3, ("dense", "coarse", "tuft"), free=0.02, spread=18.0, edge=c)
        moustache(h, 0.0052, 0.016, 0.0095, 0.0025)
        out.append(("beard-02", h.part(key_names)))

        # 03: a long beard, to a point on the chest.
        h = start(13)
        h.patches(both)
        h.patches(self.moustache, size=0.016, spacing=0.0065)
        self.long(h, length=0.17, seed_spacing=0.0115)
        moustache(h, 0.006, 0.024, 0.012, 0.003, reach=0.016)
        out.append(("beard-03", h.part(key_names)))

        # 04: a dwarf's: long, broad and bushy, a braid hanging at either side of the mouth, a big moustache.
        h = start(14)
        h.patches(both)
        h.patches(self.moustache, size=0.016, spacing=0.0065)
        hull = self.long(h, length=0.215, seed_spacing=0.0115, high=-0.004, bushy=True)
        self.braids(h, hull)
        moustache(h, 0.006, 0.04, 0.013, 0.004, reach=0.02, locks=("dense", "coarse"), steps=4)
        out.append(("beard-04", h.part(key_names)))

        # 05: a moustache with a goatee, joined round the mouth.
        h = start(15)
        both5 = lambda p: np.maximum(self.goatee(p), self.moustache(p))  # noqa: E731
        h.patches(both5, size=0.022, spacing=0.009)
        P, N, c = h.roots(self.goatee, 0.0065)
        chin = wa.smoothstep(F.chin[2] + 0.012, F.chin[2] - 0.006, P[:, 2])
        h.cards(P, N, self.down, 0.012 + 0.02 * chin, 0.013, 0.002 + 0.004 * chin, 3, ("dense", "tuft"), free=0.016, spread=12.0, edge=c)
        moustache(h, 0.0052, 0.016, 0.0095, 0.0022)
        out.append(("beard-05", h.part(key_names)))

        # A moustache alone: full, its ends a little past the mouth's corners.
        h = start(16)
        h.patches(lambda p: self.moustache(p, 0.012), size=0.018, spacing=0.008, flow=self.outward)
        moustache(h, 0.0048, 0.022, 0.0095, 0.003, reach=0.015)
        out.append(("moustache-01", h.part(key_names)))
        for name, part in out:
            log(f"{name}: {len(part.co)} vertices")
        return out

    def long(self, h, length, seed_spacing, high=0.0, bushy=False):
        """A long beard on `h`: cards over the cheeks and jaw, then its body hanging from the jaw (a shell
        of solid hair, open behind, narrowing to a point `length` under the chin) with long locks down it."""
        F = self.F
        cover = lambda p: self.full(p, high=high)  # noqa: E731
        P, N, c = h.roots(cover, seed_spacing)
        chin = wa.smoothstep(F.mouth[2] + 0.005, F.chin[2] - 0.005, P[:, 2]) * wa.smoothstep(75, 35, F.az(P))
        side = 1 - 0.5 * wa.smoothstep(55, 82, F.az(P))
        h.cards(P, N, self.down, (0.02 + 0.045 * chin + (0.01 if bushy else 0.0)) * side, 0.019, 0.005 + 0.006 * chin, 3, ("dense", "coarse") if not bushy else ("coarse", "dense", "curly"), free=0.022, spread=20.0 if bushy else 15.0, edge=c)
        # Its body: rings round a line from inside the chin down and a little forward. The top ring is the
        # jaw's own outline, just under the skin (found from inside the chin, looking out level all round), so
        # no gap shows between it and the face from any side; each ring below is that outline again, wider for
        # a while (a bushy beard much wider), then narrowing to a point, in lobes like thick locks lying side
        # by side. Lower down it hangs clear of the neck and chest.
        rows, cols, wrap = 13, 13, math.radians(118)
        c0 = np.array([0.0, F.menton[1] + 0.03, F.menton[2] + 0.03])  # (inside the chin, under the mouth's floor)
        hang = _unit([0.0, -0.16, -1.0])
        s = np.linspace(0, 1, rows)
        theta = np.linspace(-wrap, wrap, cols)
        outline = np.zeros((cols, 3))
        for j, th in enumerate(theta):
            way = np.array([math.sin(th), -math.cos(th), 0.0])
            loc, _, _, _ = F.outer_bvh.ray_cast(Vector(c0), Vector(way), 0.3)
            outline[j] = (F.under_skin([np.array(loc)], ROOT_DEPTH)[0] - c0) if loc is not None else way * 0.04
        reach = np.linalg.norm(outline, axis=1)
        log(f"a long beard's body: the jaw's outline {reach.min() * 100:.1f} to {reach.max() * 100:.1f} cm from its middle")
        swell = np.sin(np.pi * np.minimum(s / 0.55, 1.0))
        girth = (1 + (0.3 if bushy else 0.16) * swell) * (1 - s**2.4) ** 0.75 + 0.04 * s
        wide = 1 + (0.45 if bushy else 0.0) * swell  # (a bushy beard spreads sideways)
        lobes = 1 + (0.07 if bushy else 0.05) * np.sin(theta[None, :] * 5.2 + 1.3 * np.sin(s[:, None] * 4.0)) * wa.smoothstep(0.05, 0.3, s)[:, None]
        centres = c0 + (s * length)[:, None] * hang
        co = centres[:, None, :] + outline[None] * (girth[:, None] * lobes)[:, :, None] * np.stack([wide, np.ones(rows), np.ones(rows)], axis=1)[:, None, :]
        co = co.reshape(-1, 3)
        gap = np.repeat(0.002 + 0.006 * wa.smoothstep(0.1, 0.4, s), cols)
        co[cols:] = h.skin.clear(co[cols:], gap[cols:])
        faces, uv = [], []
        for i in range(rows - 1):
            for j in range(cols - 1):
                a = i * cols + j
                faces.append([a, a + cols, a + cols + 1, a + 1])
                uv.append([wa.hair_region("solid", j / (cols - 1), 1 - s[i]), wa.hair_region("solid", j / (cols - 1), 1 - s[i + 1]), wa.hair_region("solid", (j + 1) / (cols - 1), 1 - s[i + 1]), wa.hair_region("solid", (j + 1) / (cols - 1), 1 - s[i])])
        hull = Skin(co, faces, None, {})
        if (hull.vn[cols // 2] @ np.array([0.0, -1.0, 0.0])) < 0:
            hull.vn, hull.sn = -hull.vn, -hull.sn
        # (Through the shape keys its top moves with the jaw's skin, so it stays sunk in a wider or narrower
        # jaw; the rest moves as the chin does.)
        stiff = lambda depth: wa.smoothstep(0.08, 0.4, depth)  # noqa: E731
        chin_point = lambda count: np.repeat([F.menton], count, axis=0)  # noqa: E731
        h.add(co, faces, uv, hang=np.repeat(s > 0.25, cols), normal=hull.sn, anchor2=chin_point(len(co)), mix=np.repeat(stiff(s), cols))
        h.also.append(hull)
        # Long locks down its body, from all over it, the lower ones running past its end.
        tris = hull.tris
        a, b, c_ = (co[tris[:, i]] for i in range(3))
        area = np.linalg.norm(np.cross(b - a, c_ - a), axis=1) / 2
        count = int(area.sum() / (0.015 if bushy else 0.016) ** 2)
        pick = h.rng.choice(len(tris), size=count, p=area / area.sum())
        r1, r2 = np.sqrt(h.rng.random(count)), h.rng.random(count)
        bary = np.stack([1 - r1, r1 * (1 - r2), r1 * r2], axis=1)
        P = (co[tris[pick]] * bary[:, :, None]).sum(1)
        N = (hull.sn[tris[pick]] * bary[:, :, None]).sum(1)
        N /= np.maximum(np.linalg.norm(N, axis=1, keepdims=True), 1e-9)
        depth_down = np.clip(((P - c0) @ hang) / length, 0, 1)
        flow = lambda p, n: np.broadcast_to(hang, p.shape).copy()  # noqa: E731
        h.cards(P + N * 0.001, N, flow, 0.05 + 0.035 * (1 - depth_down) + (0.012 if bushy else 0.0), 0.028, 0.004, 3, ("dense", "coarse") if not bushy else ("coarse", "curly", "dense"), free=0.0, spread=9.0 if not bushy else 14.0, rows=2, rigid=True, hang=tuple(hang))
        per = len(h.anchor[-1]) // len(P)
        h.anchor2[-1], h.mix[-1] = chin_point(len(h.anchor[-1])), np.repeat(stiff(depth_down), per)
        return dict(c0=c0, hang=hang, length=length, surface=hull)

    def braids(self, h, hull):
        """Two braids, one hanging from either side of the mouth down the beard's front: three strands
        plaited, tied near the end, a tuft under the tie."""
        F = self.F
        for sign in (1.0, -1.0):
            x = sign * (F.lip_half + 0.004)
            top = F.front(x, F.mouth[2] - 0.022)
            n = 26
            length = hull["length"] * 0.72
            line = top + np.array([0.0, 2 * ROOT_DEPTH, 0.0]) + np.linspace(0, 1, n)[:, None] * length * _unit([sign * 0.1, -0.12, -1.0])
            # (Its first points stay where they are, under the skin beside the mouth; the rest lies on the beard.)
            out = wa.smoothstep(0.0, 0.12, np.linspace(0, 1, n))[:, None]
            line = line * (1 - out) + h.clear(line, np.full(n, 0.011)) * out
            for _ in range(8):
                line[1:-1] = line[1:-1] * 0.5 + (line[:-2] + line[2:]) * 0.25
            T, S, N = wa.frames(line, [1.0, 0.0, 0.0])
            s = np.linspace(0, 1, n)
            phase = 2 * np.pi * s * length / 0.05
            amp = 0.0052 * (1 - 0.25 * s)
            for i in range(3):
                a = phase + 2 * np.pi * i / 3
                strand = line + S * (amp * np.sin(a))[:, None] + N * (0.6 * amp * np.sin(2 * a))[:, None]
                h.solid(strand[: int(n * 0.9)], 0.0056 * (1 - 0.25 * s[: int(n * 0.9)]), [1.0, 0.0, 0.0], segments=6, v=(1.0, 0.35), anchor=top, tip=False)
            at = int(n * 0.86)
            h.solid(line[at : at + 3], np.full(3, 0.0088), [1.0, 0.0, 0.0], segments=9, region="tie", v=(1.0, 0.0), anchor=top, tip=False)
            # The tuft under the tie.
            m = 7
            ang = h.rng.uniform(0, 2 * np.pi, m)
            P = line[at + 2] + S[at + 2] * (0.004 * np.cos(ang))[:, None] + N[at + 2] * (0.004 * np.sin(ang))[:, None]
            Nn = S[at + 2] * np.cos(ang)[:, None] + N[at + 2] * np.sin(ang)[:, None]
            flow = lambda p, nn, d=T[at + 2]: np.broadcast_to(d, p.shape).copy()  # noqa: E731
            before = len(h.anchor)
            h.cards(P, Nn, flow, 0.04, 0.012, 0.002, 3, ("tuft", "wispy"), free=0.0, spread=6.0, rigid=True, hang=tuple(T[at + 2]))
            h.anchor[before] = np.repeat([top], len(h.anchor[before]), axis=0)


def foot_hair(F, key_names):
    """A halfling's hairy feet: wisps of hair lying over the top of each foot towards the toes, from the
    ankle's front to the toes' roots, the skin showing through."""
    J = F.J
    h = Hair(F, 21)

    def cover(p):
        out = np.zeros(len(p))
        for s_ in ("l", "r"):
            ankle, tip = J[f"foot_{s_}"], J[f"ball_{s_}.tail"]
            t = along(p, ankle, tip)
            mid = ankle + np.outer(np.clip(t, 0, 1), tip - ankle)
            across = np.abs(p[:, 0] - mid[:, 0])
            d = np.minimum(np.minimum(t - 0.12, 0.8 - t) * 0.1, 0.034 - across)
            d = np.minimum(d, p[:, 2] - mid[:, 2] + 0.004)
            out = np.maximum(out, np.clip(0.5 + d / 0.005, 0, 1) * (np.abs(p[:, 0] - ankle[0]) < 0.08))
        return out

    bones = ("foot_l", "foot_r", "ball_l", "ball_r")
    flow = lambda p, n: np.broadcast_to(np.array([0.0, -1.0, -0.1]), p.shape).copy()  # noqa: E731
    P, N, c = h.roots(cover, 0.0105, bones=bones)
    P, N, c = P[N[:, 2] > 0.35], N[N[:, 2] > 0.35], c[N[:, 2] > 0.35]
    h.cards(P, N, flow, 0.024, 0.0125, 0.0022, 3, ("wispy", "dense", "wispy"), free=1.0, spread=26.0, edge=c, on_face=False)
    part = h.part(key_names, head=False)
    log(f"foothair-01: {len(part.co)} vertices")
    return [("foothair-01", part)]


def race_parts(B, skin, body, J, marks, mats, faces, uv, inside, key_names):
    """Every race part for this body: [(name, Part)], and the tail's joints. (`inside`: each face of the
    skin, whether it's inside the mouth.)"""
    F = Face(B, skin, body, J, marks, mats, faces, inside)
    out = tusks(F, key_names) + horns(F, key_names)
    name, part, joints = tail(F, key_names, back_patch(skin, faces, uv, J))
    out.append((name, part))
    out += Beards(F).make(key_names)
    out += foot_hair(F, key_names)
    return out, joints


# ── MakeHuman's system assets: skins, eyes, eyebrows and eyelashes (CC0, read as data) ───────────────────
#
# The body keeps MakeHuman's texture layout, so its skins fit as they are: each is written as a texture of its
# own the game can put on the skin (with this body's soft shading in its creases and a dark mouth). The eyes
# get a small texture of their own, made from MakeHuman's eye pictures (the iris and the white, laid out the
# way our eyeballs read them); the eyebrows and eyelashes are MakeHuman's own, fitted to this face through
# their .mhclo files and drawn from one texture with every style in it.

OUT = os.environ.get("WW_AVATAR_OUT")  # (a folder for trial runs: the models, build files and textures go there)
MODELS = OUT or ww.MODELS
BUILD = os.path.join(OUT, "build") if OUT else ww.BUILD
TEXTURES = os.path.join(OUT, "textures") if OUT else os.path.join(os.path.dirname(ww.MODELS), "textures", "avatar")
ASSETS = wa.assets_dir()

AGES = (("young", "young"), ("middle", "middleage"), ("old", "old"))  # (our name, the pack's)
ETHNICITIES = ("caucasian", "african", "asian")
EYE_PICTURES = ("brown", "brownlight", "green", "bluegreen", "blue", "lightblue", "deepblue", "grey", "ice")
# Eye pictures from MakeHuman's community packs (CC0 by their catalogue; docs/MAKEHUMAN-PACKS.md), in MakeHuman's
# own eye layout, made into ours the same way: (our name, pack, item, its picture). The kit packer tiles them
# after EYE_PICTURES, in this order (src/looks.js EYE_PICTURES the same).
COMMUNITY_EYES = (
    ("amber", "system_eye_materials01_cc0", "bobby_03_diffuse_amber_eyes", "makehuman_eye_diffuse_amber.png"),
    ("hazel", "system_eye_materials01_cc0", "bobby_03_diffuse_hazel_eyes", "makehuman_eye_diffuse_hazel.png"),
    ("seabreeze", "system_eye_materials01_cc0", "bobby_03_diffuse_sea_breeze_eyes", "makehuman_eye_diffuse_sea_breeze.png"),
    ("clearblue", "system_eye_materials01_cc0", "bobby_03_diffuse_blue_eyes", "makehuman_eye_diffuse_blue.png"),
    ("steel", "system_eye_materials01_cc0", "bobby_03_diffuse_grey_eyes", "makehuman_eye_diffuse_grey.png"),
    ("darkbrown", "system_eye_materials01_cc0", "mindfront_brown_eye_02", "brown_eye_02.png"),
    ("sapphire", "system_eye_materials01_cc0", "nyloseth_sapphire_blue_eyes", "sapphireblueeye.png"),
    ("cat-blue", "system_eye_materials02_cc0", "nyloseth_bluecateyes", "Bluecateyes.png"),
    ("cat-brown", "system_eye_materials02_cc0", "nyloseth_brown_cat_eyes", "browncateyes.png"),
    ("cat-green", "system_eye_materials02_cc0", "nyloseth_green_cat_eyes", "greencateyes.png"),
    ("cat-sapphire", "system_eye_materials02_cc0", "nyloseth_sapphire_cat_eyes", "sapphirecateyes.png"),
    ("cat-yellow", "system_eye_materials02_cc0", "nyloseth_yellow_cat_eyes", "yellowcateyes.png"),
    ("reptile", "system_eye_materials02_cc0", "hatshj_reptile_eyes", "reptile_eye.png"),
    ("dragon", "system_eye_materials02_cc0", "bobby_03_daz_dragon_eyes", "Daz_Dragon_Eye_MH.png"),
    ("anime-navy", "system_eye_materials01_cc0", "spamrakuen_sr_anime_eyes_navy", "sr_anime_eyes_navy.png"),
)
# Those whose white is tinted (beige, orange) in their picture: made grey, as MakeHuman's are, before it's lifted.
GREY_WHITES = {"darkbrown", "dragon"}
BROWS = [f"eyebrow{i:03d}" for i in range(1, 13)]
LASHES = [f"eyelashes{i:02d}" for i in range(1, 5)]
# Each age's skin size: the young skins keep their look at 1024 px; the older ones lose their wrinkles below 2048.
SKIN_SIZE = {"young": 1024, "middle": 2048, "old": 2048}
EYE_SIZE = 512
HAIR_CELL = 512  # each brow and lash style's square in the hair texture (4 a row)
SKIN_AO = 0.6  # how much of the body's baked shading goes into each skin
LASH_MALE = 0.8  # his lashes drawn towards their roots
# The brows' and lashes' alpha stretched from (low, high) to (0, 1): MakeHuman's strokes have a soft halo that a
# cut at 0.3 (the game's) would fill in solid; this leaves the strokes.
HAIR_ALPHA = (0.2, 0.75)
WEBP_QUALITY = 85
# Where each part of an eye lies in the eye texture (ATLAS has them in the skin's layout, which the bake uses).
EYE_ATLAS = {
    "iris": _rect(0.0, 0.5, 0.5, 1.0),
    "white": _rect(0.5, 0.5, 1.0, 1.0),
    "wet": _rect(0.03, 0.28, 0.22, 0.47),
    "caruncle": _rect(0.28, 0.28, 0.47, 0.47),
}
# MakeHuman's eye pictures (1024 px): an eye seen from the front; its pupil's centre (from the left, from the
# top), the iris's radius and the eyeball's (the side of the eye) in pixels, and the iris edge's angle.
PACK_EYE = {"centre": (300.5, 718.5), "iris": 117.0, "ball": 286.0, "iris_angle": 24.0}


def read_image(path):
    """A picture's pixels as stored (rows from the bottom, RGBA, 0-1; a colour picture's sRGB values)."""
    image = bpy.data.images.load(path)
    a = _pixels(image).astype(np.float64)
    bpy.data.images.remove(image)
    return a


def shrink(a, size):
    """A square picture made `size` pixels across by averaging blocks of pixels."""
    k = a.shape[0] // size
    if k <= 1:
        return a
    return a.reshape(size, k, size, k, *a.shape[2:]).mean(axis=(1, 3))


def save_webp(path, a):
    """Pixels (rows from the bottom, RGB or RGBA) saved as a WebP; returns its size in bytes."""
    h, w = a.shape[:2]
    rgba = a if a.shape[2] == 4 else np.concatenate([a, np.ones((h, w, 1))], axis=2)
    image = bpy.data.images.new(os.path.basename(path), w, h, alpha=True)
    image.pixels.foreach_set(np.clip(rgba, 0, 1).astype(np.float32).ravel())
    image.filepath_raw = path
    image.file_format = "WEBP"
    image.save(filepath=path, quality=WEBP_QUALITY)
    bpy.data.images.remove(image)
    return os.path.getsize(path)


def _sample(src, x, y):
    """Bilinear samples of a picture at pixel positions (x from the left, y rows from the bottom)."""
    h, w = src.shape[:2]
    x = np.clip(x - 0.5, 0, w - 1.001)
    y = np.clip(y - 0.5, 0, h - 1.001)
    x0, y0 = np.floor(x).astype(np.int64), np.floor(y).astype(np.int64)
    fx, fy = (x - x0)[..., None], (y - y0)[..., None]
    a, b = src[y0, x0], src[y0, x0 + 1]
    c, d = src[y0 + 1, x0], src[y0 + 1, x0 + 1]
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy


def _square(rect, size):
    """A square of a texture: its (rows, columns) slices and each pixel's place across it, -1..1."""
    u0, v0 = rect(0, 0)
    u1, v1 = rect(1, 1)
    c0, c1 = int(round(u0 * size)), int(round(u1 * size))
    r0, r1 = int(round(v0 * size)), int(round(v1 * size))
    yy, xx = np.mgrid[r0:r1, c0:c1]
    x = ((xx + 0.5) / size - u0) / (u1 - u0) * 2 - 1
    y = ((yy + 0.5) / size - v0) / (v1 - v0) * 2 - 1
    return (slice(r0, r1), slice(c0, c1)), x, y


def eye_texture(picture, grey=False, path=None):
    """The eyes' texture from one of MakeHuman's eye pictures, laid out as our eyeballs read it: the iris's
    square seen from the front (its edge on the square's inner circle), the white's square by angle from the
    front (as ATLAS has it), and the wet line's and caruncle's pink squares. The white is brightened to a clean
    white with its veins, and both are shaded under the upper lid and towards the corners, the same for both
    bodies (so the files are shared); `grey` makes the iris grey for the game to colour."""
    src = read_image(path or os.path.join(ASSETS, "eyes", "materials", f"{picture}_eye.png"))[..., :3]
    k = src.shape[0] / 1024
    cx, cy = PACK_EYE["centre"][0] * k, src.shape[0] - PACK_EYE["centre"][1] * k
    ri, rb = PACK_EYE["iris"] * k, PACK_EYE["ball"] * k
    N = EYE_SIZE
    out = np.zeros((N, N, 3))
    # The white: the angle from the front, 0..180, across the square's radius. MakeHuman's iris edge (24
    # degrees) meets ours (30), its eyeball's side meets 90.
    sl, x, y = _square(EYE_ATLAS["white"], N)
    ang = np.hypot(x, y) * 180.0
    turn = np.arctan2(y, x)
    ia = PACK_EYE["iris_angle"]
    a_pack = np.where(ang < 30, ang * ia / 30, ia + (ang - 30) * (89 - ia) / 60)
    rho = rb * np.sin(np.radians(np.minimum(a_pack, 88.0)))
    white = _sample(src, cx + rho * np.cos(turn), cy + rho * np.sin(turn))
    if picture in GREY_WHITES:
        white = np.repeat(white.mean(axis=2, keepdims=True), 3, axis=2)
    ring = (ang > 40) & (ang < 80)
    lift = 0.95 / max(float(white[ring].mean()), 1e-3)
    out[sl] = white * lift
    # The iris, seen from the front; round its edge the white, lifted as the white is.
    sl, x, y = _square(EYE_ATLAS["iris"], N)
    iris = _sample(src, cx + x * ri, cy + y * ri)
    inside = (np.hypot(x, y) < 0.97)[..., None]
    if grey:
        lum = iris.mean(axis=2)
        r = np.hypot(x, y)
        level = np.median(lum[(r < 0.95) & (r > 0.4)])
        g = np.clip(lum / max(float(level), 1e-3) * 0.72, 0, 1)[..., None]
        iris = np.where(inside, np.repeat(g, 3, axis=2), iris * lift)
    else:
        iris = np.where(inside, iris * 1.08, iris * lift)
    out[sl] = iris
    for key, colour in (("wet", (0.93, 0.78, 0.76)), ("caruncle", (0.86, 0.55, 0.53))):
        sl, _, _ = _square(EYE_ATLAS[key], N)
        out[sl] = colour
    # The upper lid's shadow over the top of the iris and the white, and the white darker towards the corners.
    sl, x, y = _square(EYE_ATLAS["iris"], N)
    out[sl] *= (1 - 0.22 * wa.smoothstep(0.2, 1.0, y))[..., None]
    sl, x, y = _square(EYE_ATLAS["white"], N)
    r, up = np.hypot(x, y), y / np.maximum(np.hypot(x, y), 1e-6)
    out[sl] *= (1 - 0.22 * wa.smoothstep(0.1, 0.9, up) * wa.smoothstep(0.1, 0.25, r) - 0.12 * wa.smoothstep(0.22, 0.4, r))[..., None]
    return np.clip(out, 0, 1)


def to_eye_texture(part):
    """An eye part with its texture places moved from its squares of the skin's layout (ATLAS) to the eye
    texture's (EYE_ATLAS)."""
    boxes = {k: (ATLAS[k](0, 0), ATLAS[k](1, 1)) for k in EYE_ATLAS}

    def move(c):
        for k, ((u0, v0), (u1, v1)) in boxes.items():
            if u0 - 1e-6 <= c[0] <= u1 + 1e-6 and v0 - 1e-6 <= c[1] <= v1 + 1e-6:
                return EYE_ATLAS[k]((c[0] - u0) / (u1 - u0), (c[1] - v0) / (v1 - v0))
        return c

    return Part(part.co, part.faces, part.mat, [[move(c) for c in f] for f in part.uv], part.keys, part.weights)


# The brow and lash styles, in their order in the hair texture: (kind, MakeHuman's card, baked style or None).
# MakeHuman's own, then Mindfront's strands (CC0) baked onto MakeHuman's cards by bake_brows.py, numbered on
# from MakeHuman's (eyebrows-13 …, eyelashes-05 …).
BAKED = ("brow-thin", "brow-natural", "brow-thick", "brow-arched", "lash-natural", "lash-full")
HAIR_STYLES = (
    [("eyebrows", style, None) for style in BROWS]
    + [("eyelashes", style, None) for style in LASHES]
    + [(bb.STYLES[b][0], bb.CARD[bb.STYLES[b][0]], b) for b in BAKED if bb.STYLES[b][0] == "eyebrows"]
    + [(bb.STYLES[b][0], bb.CARD[bb.STYLES[b][0]], b) for b in BAKED if bb.STYLES[b][0] == "eyelashes"]
)
HAIR_ROWS = -(-len(HAIR_STYLES) // 4)


def hair_cell(k):
    """Brow or lash style k's square in the hair texture (HAIR_STYLES's order; 4 a row, from the top)."""
    col, row = k % 4, k // 4
    return lambda u, v: ((col + u) / 4, (HAIR_ROWS - 1 - row + v) / HAIR_ROWS)


def hair_texture(name):
    """Every brow and lash style's picture in one texture, grey for the game to colour (the brows' colour, or
    the hair's), its alpha cutting them out. The baked ones are baked here, their alpha as it comes."""
    C = HAIR_CELL
    out = np.zeros((C * HAIR_ROWS, C * 4, 4))
    base = skin = None
    for k, (kind, style, baked) in enumerate(HAIR_STYLES):
        col, row = k % 4, k // 4
        cell = (slice((HAIR_ROWS - 1 - row) * C, (HAIR_ROWS - row) * C), slice(col * C, (col + 1) * C))
        if baked:
            if base is None:
                hm = wa.Base()
                base = wa.to_blender(hm.co)
                skin = bb.skin_bvh(hm, base)
            out[cell] = bb.bake(baked, C, base, skin)[0]
            continue
        prox = wa.Proxy(os.path.join(ASSETS, kind, style, style + ".mhclo"))
        a = read_image(prox.texture)
        a = shrink(a, C) if a.shape[0] > C else a
        lum = a[..., :3].mean(axis=2)
        hair = a[..., 3] > 0.5
        top = np.percentile(lum[hair], 90) if hair.any() else 1.0
        g = np.clip(lum / max(float(top), 1e-3) * 0.95, 0, 1)
        g[a[..., 3] < 0.15] = np.median(g[hair]) if hair.any() else 0.5
        alpha = np.clip((a[..., 3] - HAIR_ALPHA[0]) / (HAIR_ALPHA[1] - HAIR_ALPHA[0]), 0, 1)
        out[cell] = np.stack([g, g, g, alpha], axis=2)
    image = bpy.data.images.new(f"{name}-hair", C * 4, C * HAIR_ROWS, alpha=True)
    image.pixels.foreach_set(out.astype(np.float32).ravel())
    image.file_format = "PNG"
    image.pack()
    return image


def mh_hair(B, body, co, keys, key_names, roots, n_body):
    """MakeHuman's eyebrows and eyelashes, every style, fitted to this face through their .mhclo files (each
    point a weighted sum of three of the body's, so each shape key carries it as it carries the skin), on the
    Head bone: [(object name, Part)], `eyebrows-01`..`-16` and `eyelashes-01`..`-06` (HAIR_STYLES; the baked
    ones on their MakeHuman card). `co` and `keys` are the
    finished skin's (MakeHuman's `n_body` vertices first, in order, then the subdivision's); the lashes hang on
    MakeHuman's own lash helpers."""
    full = body.co.copy()
    full_keys = {k: body.keys[k].copy() for k in key_names}
    first = np.arange(n_body)
    full[first] = co[first]
    for k in key_names:
        full_keys[k][first] = keys[k][first]
    line = np.concatenate([roots[s_][i] for s_ in ("l", "r") for i in (0, 1)])
    out = []
    counts = {"eyebrows": 0, "eyelashes": 0}
    for k, (kind, style, _baked) in enumerate(HAIR_STYLES):
        counts[kind] += 1
        prox = wa.Proxy(os.path.join(ASSETS, kind, style, style + ".mhclo"))
        points = prox.fit(full)
        kk = {name: prox.blend(full_keys[name]) for name in key_names}
        if kind == "eyelashes" and not B["female"]:
            nearest = line[np.argmin(np.linalg.norm(points[:, None] - line[None], axis=2), axis=1)]
            points = nearest + (points - nearest) * LASH_MALE
        cell = hair_cell(k)
        uv = [[cell(*prox.uv[i]) for i in fu] for fu in prox.face_uv]
        W = np.zeros((len(points), len(BONE_NAMES)))
        W[:, BONE_INDEX["Head"]] = 1.0
        out.append((f"{kind}-{counts[kind]:02d}", Part(points, [list(f) for f in prox.faces], [PART[kind]] * len(prox.faces), uv, kk, W)))
    return out


def skin_textures(B, shade):
    """Each of MakeHuman's skins for this body (young, middle-aged and old; caucasian, african and asian) as a
    WebP (SKIN_SIZE by age) in TEXTURES, `avatar-<sex>-skin-<age>-<ethnicity>.webp`: as they come, times a share of
    the body's baked shading (SKIN_AO), the mouth's square dark. Returns {file: bytes}."""
    sex = "female" if B["female"] else "male"
    os.makedirs(TEXTURES, exist_ok=True)
    sizes = {}
    for age, pack_age in AGES:
        size = SKIN_SIZE[age]
        ao = None if shade is None else 1 - SKIN_AO * (1 - shrink(shade, size))
        for eth in ETHNICITIES:
            folder = os.path.join(ASSETS, "skins", f"{pack_age}_{eth}_{sex}")
            png = sorted(f for f in os.listdir(folder) if f.endswith(".png"))[0]
            a = shrink(read_image(os.path.join(folder, png))[..., :3], size)
            if ao is not None:
                a = a * ao[..., None]
            sl, _, _ = _square(ATLAS["mouth"], size)
            a[sl] = (0.22, 0.11, 0.11)
            path = os.path.join(TEXTURES, f"avatar-{sex}-skin-{age}-{eth}.webp")
            sizes[os.path.basename(path)] = save_webp(path, a)
    # Skins from MakeHuman's community packs (CC0 by their catalogue; see COMMUNITY_SKINS), the same way:
    # `avatar-<sex>-skin-<name>.webp`.
    for name, pack, item, size in COMMUNITY_SKINS[sex]:
        folder = os.path.join(wa.extracted_dir(), pack, "skins", item)
        png = sorted(f for f in os.listdir(folder) if f.lower().endswith(".png") and not f.lower().endswith(("_nrm.png", "_spec.png")))[0]
        a = shrink(read_image(os.path.join(folder, png))[..., :3], size)
        if shade is not None:
            a = a * (1 - SKIN_AO * (1 - shrink(shade, size)))[..., None]
        sl, _, _ = _square(ATLAS["mouth"], size)
        a[sl] = (0.22, 0.11, 0.11)
        path = os.path.join(TEXTURES, f"avatar-{sex}-skin-{name}.webp")
        sizes[os.path.basename(path)] = save_webp(path, a)
    return sizes


# Skins from MakeHuman's community packs, for each body: (our name, the pack, its item, size). All CC0 by the
# packs' catalogues. Left out: the five whose descriptions say genitals are painted in.
COMMUNITY_SKINS = {
    "female": [
        ("midtoned", "skins01_cc0", "callharvey3d_midtoned_female", 2048),
        ("creamy", "skins01_cc0", "skalldyrssuppe_creamy_female", 2048),
        ("eurasian-young", "skins01_cc0", "onlytheghosts_young_eurasian_female", 1024),
        ("eurasian-middle", "skins01_cc0", "onlytheghosts_middle_aged_eurasian_female", 2048),
        ("eurasian-old", "skins01_cc0", "onlytheghosts_old_eurasian_female", 2048),
        ("freckles", "skins01_cc0", "toigo_light_skin_female_freckles", 2048),
        ("ginger", "skins01_cc0", "toigo_light_skin_female_ginger", 2048),
        ("bronze", "skins01_cc0", "toigo_light_skin_female_bronze", 1024),
        ("redhead", "skins01_cc0", "flower-angel_red_head_skin", 2048),
        ("natural-makeup", "skins01_cc0", "toigo_light_skin_with_natural_makeup", 2048),
        ("classic-makeup", "skins01_cc0", "toigo_light_skin_with_makeup", 2048),
        ("violet-makeup", "skins01_cc0", "toigo_light_skin_female_with_violet_makeup", 2048),
        ("bronze-makeup", "skins01_cc0", "toigo_light_skin_female_bronze_with_makeup", 2048),
    ],
    "male": [
        ("tattooed", "skins02_cc0", "ken1138_caucasian_male_tattooed_skin", 2048),
        ("aksel", "skins02_cc0", "mindfront_aksel_skin", 2048),
        ("viking-tattoos", "skins02_cc0", "rehmanpolanski_skin_viking_tattoos", 2048),
        ("eurasian-old", "skins02_cc0", "onlytheghosts_old_eurasian_male", 2048),
        ("bronze", "skins02_cc0", "toigo_light_skin_male_bronze", 1024),
        ("freckles", "skins02_cc0", "toigo_light_skin_male_freckles", 2048),
        ("ginger", "skins02_cc0", "toigo_light_skin_male_ginger", 2048),
        ("eyeliner", "skins02_cc0", "toigo_light_skin_male_with_eyeliner", 2048),
        ("goth-makeup", "skins02_cc0", "toigo_light_skin_male_with_goth_makeup", 2048),
        ("emo-eyes", "skins02_cc0", "toigo_light_skin_male_with_emo_eyes", 2048),
    ],
}


def eye_textures():
    """Every eye picture as an eye texture of its own (`avatar-eyes-<colour>.webp`, coloured as MakeHuman's),
    and the grey one the game colours (`avatar-eyes-grey-tint.webp`, also the model's own). Returns ({file:
    bytes}, the grey one's pixels)."""
    os.makedirs(TEXTURES, exist_ok=True)
    sizes = {}
    for picture in EYE_PICTURES:
        path = os.path.join(TEXTURES, f"avatar-eyes-{picture}.webp")
        sizes[os.path.basename(path)] = save_webp(path, eye_texture(picture))
    for name, pack, item, picture in COMMUNITY_EYES:
        path = os.path.join(TEXTURES, f"avatar-eyes-{name}.webp")
        source = os.path.join(wa.extracted_dir(), pack, "eyes", "materials", item, picture)
        sizes[os.path.basename(path)] = save_webp(path, eye_texture(name, path=source))
    grey = eye_texture("grey", grey=True)
    path = os.path.join(TEXTURES, "avatar-eyes-grey-tint.webp")
    sizes[os.path.basename(path)] = save_webp(path, grey)
    return sizes, grey


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
    W_stoop = W  # (the age keys' stoop is still worked out with these, so those keys stay exactly as they were)
    W = jaw_weights(W, co, J)
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
    body.fingertips = [(side, f, (J2[f"hand_{side}"] + R[f"hand_{side}"] @ (pos - J[f"hand_{side}"]) - shift) * s) for side, f, pos in body.fingertips]
    toes = _toe_lines(body, R, J, J2, shift, s)
    J = {k: (v - shift) * s for k, v in J2.items()}
    body.joints = J
    for e in body.eye.values():
        e["centre"] = (e["centre"] - shift) * s
        e["aim"] = (e["aim"] - shift) * s
        e["radius"] *= s
    settle_age(body, used, W_stoop, J)
    settle_races(B, body, used, W, J, base, nbrs)
    key_names = [k for k in key_names if k in body.keys]  # (each race's build is folded into its key now)
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
    inside = [bool(mouth[f]) for f, _ in corners]
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
        maps = bake_maps([bake_a], [], [arms_up(parts + eyes, J)])
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
    shade = maps["shade"] if atlas is not None else None
    sizes = skin_textures(B, shade)
    eye_sizes, grey = eye_textures()
    sizes.update(eye_sizes)
    log("skins and eyes: " + ", ".join(f"{k} {v // 1024} KB" for k, v in sizes.items()))
    eye_image = save_texture(f"{name}-eyes", grey, EYE_SIZE)
    cards = hair_texture(name)
    # The races' parts, with their two textures (the horns' and tusks', and the facial hair's strands).
    extras, tail_joints = race_parts(B, skin, body, J, marks, mats, faces, uv, inside, key_names)
    parts_image = save_texture(f"{name}-parts", wa.parts_texture(), 512)
    beard_image = bpy.data.images.new(f"{name}-facial-hair", wa.HAIR_SIZE, wa.HAIR_SIZE, alpha=True)
    beard_image.pixels.foreach_set(wa.facial_hair_texture().astype(np.float32).ravel())
    beard_image.file_format = "PNG"
    beard_image.pack()
    shared = materials(atlas, cards, normal, gatlas, gnormal, eye_image, parts_image, beard_image)
    # (Our own strip brows and lashes, `hair`, still place the painted lash line and brow shadow; MakeHuman's
    # styles are what the model wears.)
    # (The fingers' bones only now: everything above, the baking and the fitting, knows the people's bones.)
    chains, backs = finger_chains(body, parts[0].co, parts[0].faces, parts[0].mat)
    parts[0].weights = finger_weights(parts[0].co, parts[0].faces, parts[0].weights, chains, backs)
    # The nails: shells of their own over the fingertips and toes; the faces MakeHuman drew them as are skin now.
    # (The colour they take, unless coloured: the middle of the left middle finger's nail in the skin texture.)
    nail_at = [i for i, m in enumerate(parts[0].mat) if m == PART["nails"]]
    middle_tip = chains[("l", 3)][3]
    pick = min(nail_at, key=lambda i: np.linalg.norm(parts[0].co[list(parts[0].faces[i])].mean(0) - middle_tip))
    uv0 = np.mean(np.array(parts[0].uv[pick], dtype=np.float64), axis=0)
    nails = nail_plates(Skin(parts[0].co, parts[0].faces, parts[0].weights, parts[0].keys), chains, backs, toes, uv0) if NAIL_SHELLS else None
    parts[0].mat = [PART["skin"] if m == PART["nails"] else m for m in parts[0].mat]
    if nails is not None:
        parts.append(nails)
    obj = join(name, parts + [to_eye_texture(e) for e in eyes], key_names)
    # (The pieces beside the body, brows, lashes, beards, underwear, horns and the tail, keep the older keys and
    # leave out the face and body in detail: 3D Avatar Maker carries those onto them from the skin, as it does
    # for hair and clothes. Given every key each, the file was more than twice the size.)
    piece_keys = [k for k in key_names if "." not in k]
    brows = [join(n, [part], piece_keys) for n, part in mh_hair(B, body, co, body_keys, key_names, roots, len(co0))]
    pieces = [join(g.name, [g.part], piece_keys) for g in wear] + brows + [join(n, [part], piece_keys) for n, part in extras]
    for o in [obj] + pieces:
        o.data.name = o.name
        for m in shared:
            o.data.materials.append(m)
    log(f"{len(obj.data.vertices)} vertices; underwear " + ", ".join(f"{g.name} {len(g.part.co)}" for g in wear))

    rig = make_rig(name, J)
    add_tail_bones(rig, tail_joints)
    add_finger_bones(rig, chains, backs)
    for o in [obj] + pieces:
        o.parent = rig
        o.modifiers.new("Armature", "ARMATURE").object = rig
    ww.Animator(rig).key_all(ww.humanoid_actions(arm_down=72 - APOSE))
    sway_tail(rig)
    export(name, [obj] + pieces, rig)
    return obj, rig, body


def export(name, objs, rig):
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs + [rig]:
        o.select_set(True)
    bpy.context.view_layer.objects.active = rig
    os.makedirs(MODELS, exist_ok=True)
    os.makedirs(BUILD, exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=os.path.join(MODELS, f"{name}.glb"),
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
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(BUILD, f"{name}.blend"), compress=True)
    size = os.path.getsize(os.path.join(MODELS, f"{name}.glb"))
    log(f"{name}: {sum(len(o.data.vertices) for o in objs)} vertices, {sum(len(o.data.polygons) for o in objs)} faces, {size / 1e6:.2f} MB")


if __name__ == "__main__":
    which = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else ["male", "female"]
    for w in which:
        if w == "eyes":  # the eye pictures alone (`-- eyes`), without a body
            log(f"eyes: {eye_textures()[0]}")
            continue
        make({"male": MALE, "female": FEMALE}[w])
