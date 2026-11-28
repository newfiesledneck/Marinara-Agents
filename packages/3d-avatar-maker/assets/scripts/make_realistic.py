"""The Realistic body: built from the Vitruvian character for CharMorph (CC0: Sean Buckley, on Olaf
Delgado-Friedrichs' Antonia Polygon, with SirMaxim, Upliner, AgentA1CR, Benjamin McDonnell and Mindfront;
https://github.com/Upliner/CharMorph-Vitruvian). Its files are read as data; CharMorph itself (GPL) is
not run or copied.

Writes, for scripts/build-3d-avatar-maker-kit.mjs to pack:

- assets/models/realistic-body.glb: the body on the maker's own bone names, with the face's moves and the
  shape sliders as shape keys, and its eyelashes; realistic-body.json beside it (how each slider moves the joints).
- assets/models/realistic-brows-<nn>.glb: each of its brow styles, as narrow ribbons.
- assets/models/realistic-hair-<style>.glb: each of its strand hair styles as narrow ribbons; and in the
  textures, realistic-hair-<style>-scalp.webp: where the scalp lies under it, to be painted in the hair's colour.
- assets/textures/realistic/*.webp: the skin (light and dark), its normal and roughness maps, eyes and mouth.
  The torso and legs come bare, and with underwear painted on (panties and a bra, or boxer briefs).
- assets/textures/realistic/realistic-paint-*.webp: where makeup, stubble and nail colour go on the skin
  (write_paints).

The character lives outside the repository: in `VITRUVIAN_DATA`, else in
`_planning/Wanderworld asset packs/Vitruvian/CharMorph-Vitruvian-main` in this folder or any above it.

    blender --background --factory-startup --disable-autoexec --python make_realistic.py [-- body textures hair brows paints]
"""

import json
import math
import os
import subprocess
import sys

import bpy
import numpy as np
from mathutils import Vector
from mathutils.kdtree import KDTree

HERE = os.path.dirname(os.path.abspath(__file__))
MODELS = os.path.join(HERE, "..", "models")
TEXTURES = os.path.join(HERE, "..", "textures", "realistic")
_PACK = os.path.join("_planning", "Wanderworld asset packs", "Vitruvian", "CharMorph-Vitruvian-main")


def data_dir():
    found = os.environ.get("VITRUVIAN_DATA")
    if found and os.path.isdir(found):
        return found
    here = HERE
    while True:
        candidate = os.path.join(here, _PACK)
        if os.path.isdir(candidate):
            return candidate
        up = os.path.dirname(here)
        if up == here:
            raise SystemExit("The Vitruvian character not found: set VITRUVIAN_DATA to its CharMorph-Vitruvian-main folder")
        here = up


DATA = data_dir()
WANTED = set(sys.argv[sys.argv.index("--") + 1 :]) if "--" in sys.argv else set()
wanted = lambda what: not WANTED or what in WANTED

# ── What is built ───────────────────────────────────────────────────────────────────────────────────────

# The character's material slots, in its config's order, and the texture tile each part of the skin lies in.
SLOTS = ["Iris", "Mouth", "Pupil", "Sclera_Cornea", "UDIM.Skin", "charmorph_censor", "EyeHair", "Tearline"]
SKIN_TILES = {1001: "head", 1002: "torso", 1003: "arms", 1004: "legs"}
UV = "VitruvianUV.UDIM"

# The face's moves, by the names VRM gives them (src/face.js FACE_MOVES): each a mix of the character's own
# face shapes (morphs/L3). Left and right are the avatar's own.
FACE_MOVES = {
    "blink": {"Eyes_Closed_Left": 1.0, "Eyes_Closed_Right": 1.0},
    "blinkLeft": {"Eyes_Closed_Left": 1.0},
    "blinkRight": {"Eyes_Closed_Right": 1.0},
    "aa": {"aa_02": 1.0},
    "ih": {"y_iy_ih_ix_06": 1.0},
    "ou": {"w_uw_07": 1.0},
    "ee": {"ey_eh_uh_04": 1.0},
    "oh": {"ow_08": 1.0},
    "happy": {"Happy": 0.8},
    "angry": {"Angry": 0.9},
    "sad": {"Sad": 0.9},
    "relaxed": {"Smile_Lips_Closed": 0.45, "Eyes_Squint": 0.25},
    "surprised": {"Eyebrows_Raised_Left": 1.0, "Eyebrows_Raised_Right": 1.0, "Eyes_Opened_Max_Left": 0.8, "Eyes_Opened_Max_Right": 0.8, "Jaw_Lower": 0.35},
}

# The shape sliders: the shape key's name (src/looks.js REALISTIC_SHAPES has the same names), the character's
# morph (morphs/L2), and whether it also goes the other way (the same move, backwards: as the character's own
# morphs.json says, -1 to 1). Left out: Gender_Male (the first slider, backwards), Age_Baby (adults only),
# Mouth_NoTeeth, and the two of the eye's inner corner, which move it under a millimetre.
SLIDERS = [
    ("gender", "Gender_Female", True),
    ("fat", "BodyType_Fat", False),
    ("muscular", "BodyType_Muscular", False),
    ("lean", "BodyType_Lean", False),
    ("thin", "BodyType_Emaciated", False),
    ("ectomorph", "BodyType_EctoMorph", False),
    ("mesomorph", "BodyType_MesoMorph", False),
    ("endomorph", "BodyType_EndoMorph", False),
    ("proportions", "BodyType_LongProportions", True),
    ("old", "Age_Old", False),
    ("asymmetry", "Generic_Assymetry", True),
    ("breasts", "Chest_Breast_Size", False),
    ("flat_chest", "Chest_FemaleFlatChested", False),
    ("round_breasts", "Chest_FemaleSiliconeImplants", False),
    ("areolas", "Chest_Areola_Radius", False),
    ("nipples", "Chest_Nipple_Potrusion", False),
    ("shoulders", "Shoulders_ShoulderWidth", False),
    ("upper_back", "Shoulders_ShoulderBladeWidth", False),
    ("trapezius", "Shoulders_ShoulderTrapeziusSize", False),
    ("ribs", "Torso_RibWidth", False),
    ("waist", "Waist_Width", True),
    ("belly", "Stomach_Bloating", False),
    ("navel", "Stomach_BellyButtonPotrusion", False),
    ("hips", "Waist_Hips_Width", True),
    ("glutes", "Waist_GluteSize", True),
    ("glute_fold", "Waist_GlutealFold", False),
    ("cleft_width", "Waist_GlutealCleft_Width", False),
    ("cleft_depth", "Waist_GlutealCleft_Depth", False),
    ("biceps", "Arms_BicepSize", True),
    ("triceps", "Arms_TricepSize", True),
    ("forearms", "Arms_Forearm_Girth", False),
    ("armpits", "Arms_Armpit_Loc_Z", True),
    ("hand_size", "Hands_Size", True),
    ("hand_girth", "Hands_Girth", False),
    ("nail_length", "Hands_FingernailLength", False),
    ("nail_points", "Hands_FingernailPointiness", False),
    ("thighs", "Legs_Thigh_Size", True),
    ("quads", "Legs_Quad_Size", True),
    ("hamstrings", "Legs_Hamstring_Size", True),
    ("thigh_gap", "Legs_Thigh_Gap", True),
    ("calves", "Legs_Calves_Size", True),
    ("feet_size", "Legs_FeetSize", True),
    ("flat_feet", "Legs_FlatFoot", False),
    ("toenail_length", "Legs_Toenail_Length", False),
    ("neck_girth", "Neck_Girth", False),
    ("neck_length", "Neck_Length", True),
    ("adams_apple", "Neck_AdamsApple", False),
    ("under_chin", "Neck_ChinConnection", True),
    ("head_top", "Head_TopScalpPotrusion", True),
    ("head_width", "Head_SideScalpPotrusion", True),
    ("head_back", "Head_BackScalpPotrusion", True),
    ("crown", "Head_ParietalFlatness", True),
    ("temples", "Head_SphenoidBone", True),
    ("temple_ridges", "Head_TemporalLines", True),
    ("forehead", "Face_FrontalBone", True),
    ("forehead_fullness", "Head_FrontalBoneFlatness", True),
    ("forehead_bumps", "Face_FrontalBone_FrontalEminence", True),
    ("brow_ridge", "Face_FrontalBone_BrowRidge", True),
    ("brow_droop", "Face_BrowRidge_Droop", False),
    ("brow_raise", "Face_BrowRidge_Raise", False),
    ("brow_curve_droop", "Face_BrowRidge_CurvedDroop", False),
    ("brow_curve_raise", "Face_BrowRidge_CurvedRaise", False),
    ("inner_brows", "Eyes_EyebrowsAngle", True),
    ("outer_brows", "Eyes_EyebrowsDroop", True),
    ("eye_size", "Eyes_Size", True),
    ("eye_distance", "Eyes_Distance", True),
    ("eye_height", "Eyes_VerticalShift", True),
    ("eye_tilt", "Eyes_EyelidsAngle", True),
    ("inner_corners", "Eyes_EyelidsAngle2", True),
    ("upper_lids", "Eyes_UpperLidOpenness", False),
    ("lower_lids", "Eyes_LowerLidOpenness", False),
    ("lid_crease", "Eyes_EyelidsCrease", True),
    ("monolid", "Eyes_Eyelid_Monolid", False),
    ("hooded", "Eyes_Eyelid_hooded", False),
    ("eye_sockets", "Face_EyeSocket_Potrusion", True),
    ("eye_bags", "Eyes_EyeBagsProminence", True),
    ("eye_bag_size", "Eyes_EyeBagsSize", True),
    ("nose_height", "Nose_NoseHeight", True),
    ("nose_out", "Nose_Potrusion", True),
    ("nose_width", "Nose_NasalBone_AnteriorNasalAperature", True),
    ("nose_root", "Nose_NasalBone", True),
    ("nose_bridge", "Nose_BridgeProminence", True),
    ("nose_tip", "Nose_Tip_Potrusion", True),
    ("nose_angle", "Nose_NasalAngle", True),
    ("nose_tip_crease", "Nose_TipCrease", False),
    ("nostrils", "Nose_NostrilSize", True),
    ("nose_base", "Nose_BottomFlatness", True),
    ("under_nose", "Nose_NasalBone_AnteriorNasalSpine", True),
    ("cheekbones", "Face_Zygomatic_Bone", True),
    ("upper_cheekbones", "Cheeks_UpperCheek_Bone", True),
    ("cheekbone_height", "Cheeks_CheeksBonePositionZ", True),
    ("cheek_fat", "Cheeks_BuccalFat", True),
    ("cheek_hollows", "Cheeks_BoneDefinition", False),
    ("puffy", "Face_Puffy", False),
    ("upper_jaw", "Face_Maxilla", True),
    ("lips_height", "Mouth_Lips_Height", True),
    ("lips_width", "Mouth_Lips_Length", True),
    ("upper_lip", "Mouth_Lips_UpperLipDepth", True),
    ("lower_lip", "Mouth_Lips_BottomLipDepth", True),
    ("lip_arch", "Mouth_Lips_UpperLipArch", True),
    ("upper_lip_tilt", "Mouth_Lips_UpperAngle", True),
    ("lower_lip_tilt", "Mouth_Lips_LowerAngle", True),
    ("philtrum_depth", "Mouth_PhiltrumDepth", True),
    ("philtrum_height", "Mouth_PhiltrumHeight", True),
    ("jaw_width", "Jaw_Width", True),
    ("jaw", "Jaw_Mandible", True),
    ("jaw_corners", "Jaw_Mandible_GonialAngle", True),
    ("jaw_definition", "Jaw_Definition", True),
    ("jaw_back_width", "Jaw_Ramus_Extrusion", True),
    ("jaw_back_place", "Jaw_Ramus_LocY", True),
    ("chin_width", "Chin_Width", True),
    ("chin_sides", "Chin_SecondaryWidth", True),
    ("chin_height", "Chin_Height", True),
    ("chin_length", "Chin_PosZ", True),
    ("chin_out", "Chin_Portrusion", True),
    ("chin_tilt", "Chin_Tilt", True),
    ("chin_cleft", "Chin_ChinCleft", False),
    ("ears_out", "Ears_Potrusion", True),
    ("ears_out_top", "Ears_PotrusionTop", True),
    ("ear_height", "Ears_Height", False),
    ("ear_length", "Ears_Length", False),
    ("ear_turn", "Ears_Rot", False),
    ("ear_round", "Ears_Round", False),
    ("ear_lobes", "Ears_Lobe", False),
    ("lobes_attached", "Ears_LobeAttached", False),
    ("ear_canal", "Ears_Canal_Size", False),
    ("ear_canal_depth", "Ears_Canal_Depth", False),
    ("tragus", "Ears_Tragus_Portrusion", False),
    ("features_african", "Race_African", False),
    ("features_east_asian", "Race_EastAsian", False),
    ("features_south_asian", "Race_Punjabi", False),
    ("features_bengali", "Race_Bengali", False),
    ("features_marathi", "Race_Marathi", False),
    ("features_tamil", "Race_Tamil", False),
    ("features_telugu", "Race_Telegu", False),
    ("features_kannada", "Race_Kannada", False),
    ("features_sinhalese", "Race_Sinhalese", False),
    ("features_hispanic", "Race_Hispanic", False),
    ("features_middle_eastern", "Race_MiddleEastern", False),
    ("features_white", "Race_White", False),
    ("pointed_ears", "Fantasy_Ear", False),
    ("cat_eyes", "Fantasy_CatEyes", False),
    ("fangs", "Fantasy_VampireTeeth", False),
    ("sharp_teeth", "Fantasy_SharpTeeth", False),
    ("forked_tongue", "Fantasy_SnakeTongue", False),
    ("no_nose", "Fantasy_NoNose", False),
]

# The maker's bones (assets/scripts/wwblend.py BONES, then the fingers and eyes, as make_avatar.py adds them):
# (name, parent).
BONES = [("pelvis", None), ("spine_01", "pelvis"), ("spine_02", "spine_01"), ("spine_03", "spine_02"), ("neck_01", "spine_03"), ("Head", "neck_01")]
for _s in ("l", "r"):
    BONES += [
        (f"clavicle_{_s}", "spine_03"), (f"upperarm_{_s}", f"clavicle_{_s}"), (f"lowerarm_{_s}", f"upperarm_{_s}"),
        (f"hand_{_s}", f"lowerarm_{_s}"), (f"thigh_{_s}", "pelvis"), (f"calf_{_s}", f"thigh_{_s}"),
        (f"foot_{_s}", f"calf_{_s}"), (f"ball_{_s}", f"foot_{_s}"),
    ]
FINGERS = ("thumb", "index", "middle", "ring", "pinky")
for _s in ("l", "r"):
    for _f in FINGERS:
        for _k in (1, 2, 3):
            BONES.append((f"{_f}_{_k:02d}_{_s}", f"hand_{_s}" if _k == 1 else f"{_f}_{_k - 1:02d}_{_s}"))
BONES += [("eye_l", "Head"), ("eye_r", "Head")]
BONE_NAMES = [b for b, _ in BONES]

# The character's own game rig (its "Unreal Mannequin" weights and joints) has more bones than the maker's:
# five in the spine, two in the neck, a bone in the palm for each finger, and twist bones. Each of the
# maker's bones takes the weights of those named here, and starts where the first of them does.
TAKES = {"pelvis": ["pelvis", "root"], "spine_01": ["spine_01", "spine_02"], "spine_02": ["spine_03", "spine_04"],
         "spine_03": ["spine_05"], "neck_01": ["neck_01", "neck_02"], "Head": ["head"]}
for _s in ("l", "r"):
    TAKES[f"clavicle_{_s}"] = [f"clavicle_{_s}"]
    TAKES[f"upperarm_{_s}"] = [f"upperarm_{_s}", f"upperarm_twist_01_{_s}", f"upperarm_twist_02_{_s}"]
    TAKES[f"lowerarm_{_s}"] = [f"lowerarm_{_s}", f"lowerarm_twist_01_{_s}", f"lowerarm_twist_02_{_s}"]
    TAKES[f"hand_{_s}"] = [f"hand_{_s}"] + [f"{f}_metacarpal_{_s}" for f in FINGERS[1:]]
    TAKES[f"thigh_{_s}"] = [f"thigh_{_s}", f"thigh_twist_01_{_s}", f"thigh_twist_02_{_s}"]
    TAKES[f"calf_{_s}"] = [f"calf_{_s}", f"calf_twist_01_{_s}", f"calf_twist_02_{_s}"]
    TAKES[f"foot_{_s}"] = [f"foot_{_s}"]
    TAKES[f"ball_{_s}"] = [f"ball_{_s}"]
    for _f in FINGERS:
        for _k in (1, 2, 3):
            TAKES[f"{_f}_{_k:02d}_{_s}"] = [f"{_f}_{_k:02d}_{_s}"]
# (Its bones' parents, for a joint the files give only as its parent's tail.)
THEIRS = {"spine_01": "pelvis", "spine_02": "spine_01", "spine_03": "spine_02", "spine_04": "spine_03", "spine_05": "spine_04",
          "neck_01": "spine_05", "neck_02": "neck_01", "head": "neck_02"}
for _s in ("l", "r"):
    THEIRS.update({f"clavicle_{_s}": "spine_05", f"upperarm_{_s}": f"clavicle_{_s}", f"lowerarm_{_s}": f"upperarm_{_s}",
                   f"hand_{_s}": f"lowerarm_{_s}", f"thigh_{_s}": "pelvis", f"calf_{_s}": f"thigh_{_s}",
                   f"foot_{_s}": f"calf_{_s}", f"ball_{_s}": f"foot_{_s}", f"thumb_01_{_s}": f"hand_{_s}"})
    for _f in FINGERS:
        if _f != "thumb":
            THEIRS[f"{_f}_metacarpal_{_s}"] = f"hand_{_s}"
            THEIRS[f"{_f}_01_{_s}"] = f"{_f}_metacarpal_{_s}"
        THEIRS[f"{_f}_02_{_s}"] = f"{_f}_01_{_s}"
        THEIRS[f"{_f}_03_{_s}"] = f"{_f}_02_{_s}"

# Hair: the style's name in the file, how many of Blender's copies each strand gets, every how-manyth strand
# is kept, and the ribbons' width (metres). Each comes to about 4,500 ribbons.
# (Combover_zoro_d and SceneHair_1_O4saken are left out until their authors' terms are checked.)
HAIR = {
    "bob": ("Bob", 20, 1, 0.0026),
    "slicked": ("SlickedBack", 4, 1, 0.0026),
    "back": ("Back1", 4, 1, 0.0026),
    "eve": ("Eve", 4, 1, 0.0026),
}
# The brow styles: Mindfront's, as the character has them ("mind_eyebrows_01" … "_14"; the 11th is its usual).
BROW_STYLES = {n: f"mind_eyebrows_{n:02d}" + ("_Default" if n == 11 else "") for n in range(1, 15)}
# Eyelashes: grown here along each lid's edge, as the character's own lash system is empty. For the upper lid
# and the lower: how many, how long (metres), and which way they curl (up, or a little down).
LASHES = {"upper": (110, 0.0068, 0.6), "lower": (46, 0.0034, -0.4)}
LASH_WIDTH = 0.00028
LASH_POINTS = 4
HAIR_POINTS = 11
BROW_POINTS = 5
BROW_WIDTH = 0.00017
SCALP_SIZE = 512  # the scalp's picture for each style
SCALP_ROOT = 0.0045  # the scalp this near a strand's root is painted (metres)
SCALP_GAP = 0.009  # gaps between roots up to twice this wide are painted too
SCALP_INSET = 0.009  # how far in from the hairline the paint starts

_START = __import__("time").time()


def log(what):
    print(f"[{__import__('time').time() - _START:6.1f}s] {what}", flush=True)


# ── The character's data ────────────────────────────────────────────────────────────────────────────────


def named(array):
    return bytes(array).decode().split("\0")


def morph(folder, name, count):
    """A morph's move of every vertex (count x 3), from its sparse .npz or whole .npy."""
    path = os.path.join(DATA, "morphs", folder, name)
    if os.path.exists(path + ".npz"):
        data = np.load(path + ".npz", allow_pickle=False)
        out = np.zeros((count, 3), dtype=np.float64)
        out[data["idx"]] = data["delta"]
        return out
    return np.load(path + ".npy", allow_pickle=False).astype(np.float64)


class Joints:
    """The character's joints, each a weighted mean of some vertices, so they follow any shape."""

    def __init__(self):
        data = np.load(os.path.join(DATA, "joints", "mannequin.npz"), allow_pickle=False)
        self.spans = {}
        at = 0
        for name, count in zip(named(data["names"]), data["cnt"].tolist()):  # (as Python numbers: a uint8 sum would wrap)
            self.spans[name] = (data["idx"][at : at + count].astype(np.int64), data["weights"][at : at + count].astype(np.float64))
            at += count

    def at(self, shape, name):
        ids, weights = self.spans[name]
        return (shape[ids] * weights[:, None]).sum(axis=0) / weights.sum()

    def head(self, shape, bone):
        if f"joint_{bone}_head" in self.spans:
            return self.at(shape, f"joint_{bone}_head")
        return self.at(shape, f"joint_{THEIRS[bone]}_tail")

    def tail(self, shape, bone):
        return self.at(shape, f"joint_{bone}_tail")


def their_weights(count):
    """The character's game-rig weights: bone name -> a weight for every vertex."""
    data = np.load(os.path.join(DATA, "weights", "mannequin.npz"), allow_pickle=False)
    out = {}
    at = 0
    for name, n in zip(named(data["names"]), data["cnt"].tolist()):
        w = np.zeros(count, dtype=np.float64)
        w[data["idx"][at : at + n]] = data["weights"][at : at + n]
        out[name] = w
        at += n
    return out


def read_character():
    """The character's mesh from char.blend: faces, the slot of each, the UVs of each corner, the base shape."""
    bpy.ops.wm.open_mainfile(filepath=os.path.join(DATA, "char.blend"), use_scripts=False)
    source = bpy.data.objects["cm_vitruvian"]
    # (The file was saved in Edit Mode, where the mesh's own data reads as empty: a copy made from the object has it.)
    mesh = bpy.data.meshes.new_from_object(source.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    faces = [tuple(p.vertices) for p in mesh.polygons]
    slots = np.empty(len(faces), dtype=np.int32)
    mesh.polygons.foreach_get("material_index", slots)
    uv = np.empty(len(mesh.loops) * 2, dtype=np.float32)
    mesh.uv_layers[UV].uv.foreach_get("vector", uv)
    starts = np.empty(len(faces), dtype=np.int32)
    totals = np.empty(len(faces), dtype=np.int32)
    mesh.polygons.foreach_get("loop_start", starts)
    mesh.polygons.foreach_get("loop_total", totals)
    shape = np.load(os.path.join(DATA, "morphs", "L1", "Default.npy"), allow_pickle=False).astype(np.float64)

    def painted(name):
        """One of the character's colour attributes, a row for each of its points or corners."""
        attribute = mesh.color_attributes[name]
        values = np.empty(len(attribute.data) * 4, dtype=np.float32)
        attribute.data.foreach_get("color", values)
        return values.reshape(-1, 4).astype(np.float64)

    # (The lips are marked by corner: a vertex is lip if any corner at it is.)
    corner_vertex = np.empty(len(mesh.loops), dtype=np.int32)
    mesh.loops.foreach_get("vertex_index", corner_vertex)
    lip = np.zeros(len(mesh.vertices))
    np.maximum.at(lip, corner_vertex, painted("ColLipMask")[:, 0])
    return {"faces": faces, "slots": slots, "uv": uv.reshape(-1, 2).astype(np.float64), "starts": starts, "totals": totals, "shape": shape,
            # The character's own marks, for every vertex: its lips, where a beard grows, and where the skin has
            # no pores (0 there), which is how its nails are told from the skin round them.
            "lip": lip, "beard": painted("BeardShadowMask")[:, 2], "pores": painted("MicroNormals")[:, 0]}


# ── Pictures ────────────────────────────────────────────────────────────────────────────────────────────


def exr(name, size):
    """One of the character's 4K textures, scaled to `size`: (size, size, 4) linear floats, rows bottom up."""
    image = bpy.data.images.load(os.path.join(DATA, "textures", "4K", name + ".exr"))
    image.colorspace_settings.name = "Non-Color"
    if image.size[0] != size:
        image.scale(size, size)
    data = np.empty(size * size * 4, dtype=np.float32)
    image.pixels.foreach_get(data)
    bpy.data.images.remove(image)
    return data.reshape(size, size, 4)


def to_srgb(linear):
    linear = np.clip(linear, 0, 1)
    return np.where(linear <= 0.0031308, linear * 12.92, 1.055 * np.power(linear, 1 / 2.4) - 0.055)


def save_picture(name, data, quality=88):
    """`data` (rows bottom up, values as they are to be written; a fourth channel is its alpha) as an 8-bit WebP
    in assets/textures/realistic (through a PNG and ffmpeg, `FFMPEG` or the one on the path: Blender's own WebP
    writer takes no quality)."""
    os.makedirs(TEXTURES, exist_ok=True)
    tall, wide = data.shape[:2]
    alpha = data.shape[2] == 4
    full = np.ones((tall, wide, 4), dtype=np.float32)
    full[:, :, : data.shape[2]] = data
    image = bpy.data.images.new(name, wide, tall, alpha=alpha, is_data=True)
    image.pixels.foreach_set(full.ravel())
    raw = os.path.join(TEXTURES, name + ".png")
    scene = bpy.context.scene
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA" if alpha else "RGB"
    scene.render.image_settings.color_depth = "8"
    scene.view_settings.view_transform = "Raw"
    image.save_render(raw, scene=scene)
    bpy.data.images.remove(image)
    subprocess.run([os.environ.get("FFMPEG", "ffmpeg"), "-v", "error", "-y", "-i", raw, "-quality", str(quality), os.path.join(TEXTURES, name + ".webp")], check=True)
    os.remove(raw)


def blurred(a, radius):
    """A box blur of `a` (rows x columns x channels), `radius` pixels each way, edges repeated."""
    out = a.astype(np.float64)
    for axis in (0, 1):
        pad = [(0, 0)] * out.ndim
        pad[axis] = (radius + 1, radius)
        total = np.cumsum(np.pad(out, pad, mode="edge"), axis=axis)
        n = out.shape[axis]
        out = (np.take(total, np.arange(n) + 2 * radius + 1, axis=axis) - np.take(total, np.arange(n), axis=axis)) / (2 * radius + 1)
    return out


def normal_from_height(height, strength):
    """A tangent-space normal map from a height map: its slope, `strength` times over."""
    # (A light blur first: a scan's finest grain turns to glitter once it is a normal map at this size.)
    h = blurred(height[:, :, None], 1)[:, :, 0]
    dx = (np.roll(h, -1, axis=1) - np.roll(h, 1, axis=1)) * 0.5 * h.shape[1] * strength
    dy = (np.roll(h, -1, axis=0) - np.roll(h, 1, axis=0)) * 0.5 * h.shape[0] * strength
    n = np.stack([-dx, -dy, np.ones_like(h)], axis=-1)
    n /= np.linalg.norm(n, axis=-1, keepdims=True)
    return n * 0.5 + 0.5


def place_map(C, tile, size, more=None, only=None, grow=12):
    """Where on the body each texel of `tile` is: (size, size, 3) points of the base shape (rows bottom up), and
    which texels have one. Past an island's edge the nearest point is repeated a few texels out, so what is
    painted by place runs under the seam and no skin shows along it. `more` (a column or more for every vertex)
    is carried across the faces the same way, in the channels after the place. `only`: of these faces alone;
    `grow`: how many texels out past an edge."""
    shape = C["shape"] if more is None else np.hstack([C["shape"], np.asarray(more, dtype=np.float64).reshape(len(C["shape"]), -1)])
    place = np.zeros((size, size, shape.shape[1]), dtype=np.float64)
    known = np.zeros((size, size), dtype=bool)
    for f, face in enumerate(C["faces"]):
        if C["tiles"][f] != tile or SLOTS[C["slots"][f]] not in ("UDIM.Skin", "charmorph_censor"):
            continue
        if only is not None and f not in only:
            continue
        corners = C["uv01"][C["starts"][f] : C["starts"][f] + C["totals"][f]] * size
        points = shape[list(face)]
        for k in range(1, len(face) - 1):
            tri = corners[[0, k, k + 1]]
            at = points[[0, k, k + 1]]
            lo = np.floor(tri.min(axis=0)).astype(int).clip(0, size - 1)
            hi = np.ceil(tri.max(axis=0)).astype(int).clip(0, size - 1)
            xs, ys = np.meshgrid(np.arange(lo[0], hi[0] + 1) + 0.5, np.arange(lo[1], hi[1] + 1) + 0.5)
            (ax, ay), (bx, by), (cx, cy) = tri
            d = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy)
            if abs(d) < 1e-12:
                continue
            u = ((by - cy) * (xs - cx) + (cx - bx) * (ys - cy)) / d
            v = ((cy - ay) * (xs - cx) + (ax - cx) * (ys - cy)) / d
            inside = (u >= -0.02) & (v >= -0.02) & (u + v <= 1.02)
            if not inside.any():
                continue
            w = 1 - u - v
            found = u[..., None] * at[0] + v[..., None] * at[1] + w[..., None] * at[2]
            window = (slice(lo[1], hi[1] + 1), slice(lo[0], hi[0] + 1))
            place[window][inside] = found[inside]
            known[window][inside] = True
    for _ in range(grow):
        grown = known.copy()
        for axis, step in ((0, 1), (0, -1), (1, 1), (1, -1)):
            near = np.roll(known, step, axis=axis) & ~grown
            place[near] = np.roll(place, step, axis=axis)[near]
            grown |= near
        known = grown
    return place, known


def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


# The painted underwear: dark cloth drawn on the skin's own pictures, so it can never clip. Cheeky panties and a
# strapless bra for a female build, boxer briefs for a male one. Places are the base shape's (metres; x across, y back,
# z up); painted on the skin, they move with it under every slider.
CLOTH = (0.075, 0.075, 0.085)  # its colour (sRGB)
CLOTH_TRIM = (0.21, 0.21, 0.23)  # its elastic, hems and seams: a lighter line
CLOTH_ROUGH = 0.86
EDGE = 0.0022  # how wide its edge fades (metres)
HEM = 0.0045  # how wide a hem's lighter line is
CROTCH = 0.828  # the height the cloth between the legs starts at: just under where the legs meet (below is thigh)
GUSSET = 0.02  # how far each side of the middle it stays that low, before the leg's line rises
PANTIES_TOP = 0.958
PANTIES_SIDE = 0.93  # how high the leg's line is at the hip, front and back (the side is what's left over it)
BOXERS_TOP = 0.988
BOXERS_BAND = 0.03  # the boxer briefs' elastic
BOXERS_LEG = 0.722  # where their legs end
CUP = (0.08, 0.056)  # a bra cup's half width and half height
BRA_UNDER = 0.044  # how far under the bust's furthest point forward the bra's lower edge is
BRA_BACK = 0.008  # how far over it the band's upper edge is, at the sides and back


def line(depth, width=HEM):
    """A lighter line `width` wide just inside an edge, from how deep inside it each place is."""
    return smoothstep(0, EDGE, depth) * (1 - smoothstep(width, width + EDGE, depth))


def panties(place):
    """Cheeky panties: how deep inside them each place is (metres; under 0 outside), and their lighter trim
    (0…1). The leg's line starts between the legs and rises to the hip: straight up the groin's crease in
    front, and in a curve across the buttocks behind that leaves the lower part of each bare."""
    x, y, z = np.abs(place[..., 0]), place[..., 1], place[..., 2]
    out = np.clip((x - GUSSET) / (0.17 - GUSSET), 0, None)
    front = CROTCH + (PANTIES_SIDE - CROTCH) * out
    back = CROTCH + 0.003 + (PANTIES_SIDE - CROTCH - 0.003) * out**0.5
    leg = front + (back - front) * smoothstep(-0.02, 0.05, y)
    depth = np.minimum(PANTIES_TOP - z, z - leg)
    return depth, line(depth)


def boxer_briefs(place):
    """Boxer briefs: a wide elastic at the waist, legs a hand's width down the thigh, and the two seams that
    shape the front."""
    x, y, z = np.abs(place[..., 0]), place[..., 1], place[..., 2]
    depth = np.minimum(BOXERS_TOP - z, z - BOXERS_LEG)
    elastic = smoothstep(0, EDGE, z - (BOXERS_TOP - BOXERS_BAND)) * smoothstep(0, EDGE, depth)
    seam = 0.022 + 0.33 * (z - 0.8)  # (from between the legs up and outwards to the elastic)
    seams = (1 - smoothstep(0.0009, 0.0009 + EDGE * 0.6, np.abs(x - seam))) * (y < -0.02) * (z > 0.8) * (z < BOXERS_TOP - BOXERS_BAND)
    return depth, np.maximum(np.maximum(elastic * 0.75, line(z - BOXERS_LEG)), seams * 0.8)


def bra(place, bust):
    """A strapless bra: a cup over each breast (`bust`: how far from the middle, and how high, its furthest
    point forward is), dipping between them, and a band all the way round, its lower edge one line close under
    the breasts."""
    x, y, z = np.abs(place[..., 0]), place[..., 1], place[..., 2]
    ax, az = bust
    cup = np.where(y < 0.02, (1 - np.sqrt(((x - ax) / CUP[0]) ** 2 + ((z - az) / CUP[1]) ** 2)) * CUP[1], -1.0)
    band = (az + BRA_BACK) - z
    depth = np.minimum(np.maximum(cup, band), z - (az - BRA_UNDER))
    return depth, line(depth, HEM * 0.8)


IRIS_FIT = 0.47  # the iris's edge in an eye picture, from its middle (of the picture's width): the maker's too
IRIS_SIZE = 256


def iris_disc(C):
    """The iris in its own picture: (its middle, its radius), in the picture's 0..1 (the model's UVs, v up)."""
    corners = np.concatenate([C["uv01"][C["starts"][f] : C["starts"][f] + C["totals"][f]]
                              for f in range(len(C["faces"])) if SLOTS[C["slots"][f]] == "Iris"])
    low, high = corners.min(axis=0), corners.max(axis=0)
    return (low + high) / 2, float((high - low).max() / 2)


def pupil_uvs(C):
    """The pupils' corners given UVs that carry on the iris's picture across them (corner index -> uv): each
    eye's iris is flat-on to its picture, so one fit of place to UV for an eye serves its pupil too. An eye
    picture then shows its own pupil, round or slit, where the model had a black disc of its own."""
    shape = C["shape"]
    fits = {}
    for sign in (1, -1):
        places, uvs = [], []
        for f, face in enumerate(C["faces"]):
            if SLOTS[C["slots"][f]] != "Iris" or shape[face[0], 0] * sign < 0:
                continue
            for k, vertex in enumerate(face):
                places.append([shape[vertex, 0], shape[vertex, 2], 1.0])
                uvs.append(C["uv01"][C["starts"][f] + k])
        fits[sign] = np.linalg.lstsq(np.array(places), np.array(uvs), rcond=None)[0]
    out = {}
    for f, face in enumerate(C["faces"]):
        if SLOTS[C["slots"][f]] != "Pupil":
            continue
        fit = fits[1 if shape[face[0], 0] > 0 else -1]
        for k, vertex in enumerate(face):
            out[C["starts"][f] + k] = np.array([shape[vertex, 0], shape[vertex, 2], 1.0]) @ fit
    return out


def grey_iris(C):
    """The model's own iris as a grey picture the maker tints, laid out as the eye pictures are: the iris's
    middle in the picture's middle, its edge IRIS_FIT out, a black pupil the size of the model's own."""
    centre, radius = iris_disc(C)
    source = to_srgb(exr("Iris_Color.1007", 1024)[:, :, :3])
    grey = source @ np.array([0.299, 0.587, 0.114])
    at = (np.arange(IRIS_SIZE) + 0.5) / IRIS_SIZE
    nu, nv = np.meshgrid(at, at)
    u = centre[0] + (nu - 0.5) / IRIS_FIT * radius
    v = centre[1] + (nv - 0.5) / IRIS_FIT * radius
    rows = np.clip((v * 1024).astype(int), 0, 1023)
    columns = np.clip((u * 1024).astype(int), 0, 1023)
    picture = grey[rows, columns]
    out = np.hypot(nu - 0.5, nv - 0.5) / IRIS_FIT  # (0 the middle, 1 the iris's edge)
    pupil = np.array([np.linalg.norm(uv - centre) for uv in pupil_uvs(C).values()]).max() / radius
    ring = (out > pupil * 1.25) & (out < 0.85)
    picture = np.clip(picture / max(1e-6, picture[ring].mean()) * 0.62, 0, 1)
    picture *= 1 - 0.55 * smoothstep(0.86, 1.0, out)  # (the darker ring round an iris)
    picture *= smoothstep(pupil * 0.96, pupil * 1.12, out)  # (the pupil)
    return np.repeat(picture[:, :, None], 3, axis=2)


def write_textures(C):
    """The skin's pictures for each tile (light, dark, normal, roughness), the eyes' and the mouth's. The torso's
    and legs' come three ways: bare as the character has them (no suffix), and with underwear painted on for a
    female build (`-female`: panties and a strapless bra) and for a male one (`-male`: boxer briefs)."""
    centres = np.array([C["shape"][list(face)].mean(axis=0) for face in C["faces"]])
    shape = C["shape"]
    # (The bra is hung on the bust's furthest point forward, among the skin the character itself covers there.)
    chest = sorted({i for f, face in enumerate(C["faces"]) if C["slots"][f] == SLOTS.index("charmorph_censor") and centres[f, 2] > 1.1 for i in face})
    furthest = shape[chest][np.argmin(shape[chest, 1])]
    bust = (abs(furthest[0]), furthest[2])
    log(f"the bust {bust[0]:.3f} m from the middle at {bust[1]:.3f} m up")
    # (What the character itself covers must be under the cloth: counted, to see a garment's cut hasn't bared any.)
    own = np.array([f for f in range(len(C["faces"])) if C["slots"][f] == SLOTS.index("charmorph_censor")])
    low = centres[own][centres[own, 2] < 1.1]
    high = centres[own][centres[own, 2] > 1.1]
    for name, depth in (("panties", panties(low)[0]), ("boxer briefs", boxer_briefs(low)[0]), ("bra", bra(high, bust)[0])):
        bare = depth < 0
        log(f"  the character's own cover outside the {name}: {int(bare.sum())} of {len(depth)} faces" + (f", the lowest at {(low if name != 'bra' else high)[bare][:, 2].min():.3f} m" if bare.any() else ""))
    for tile, part in SKIN_TILES.items():
        size = 2048
        small = 2048 if part == "head" else 1024
        covers = {"": None}
        if part in ("torso", "legs"):
            place, known = place_map(C, tile, size)
            hers, hers_trim = panties(place)
            his, his_trim = boxer_briefs(place)
            if part == "torso":
                top, top_trim = bra(place, bust)
                hers_trim = np.where(top > hers, top_trim, hers_trim)
                hers = np.maximum(hers, top)
            covers = {"": None, "-female": (np.where(known, hers, -1.0), hers_trim), "-male": (np.where(known, his, -1.0), his_trim)}
        colours = {tone: to_srgb(exr(f"{tone}_Skin_Color.{tile}", size)[:, :, :3]) for tone in ("Light", "Dark")}
        height = exr(f"Skin_Height.{tile}", small)[:, :, :1]
        rough = np.clip(0.32 + exr(f"Skin_Roughness.{tile}", 1024)[:, :, 0] * 0.54, 0.05, 1)
        for suffix, cover in covers.items():
            cloth = None if cover is None else smoothstep(0, EDGE, cover[0])[:, :, None]
            for tone, colour in colours.items():
                if cloth is not None:
                    trim = cover[1][:, :, None]
                    dyed = np.array(CLOTH) * (1 - trim) + np.array(CLOTH_TRIM) * trim
                    colour = colour * (1 - cloth) + dyed * cloth
                save_picture(f"realistic-skin-{part}-{tone.lower()}{suffix}", colour)
            # (Cloth lies smooth over the skin's relief, and is not as glossy.)
            step = size // small
            lower = cloth[::step, ::step] if cloth is not None else None
            relief = height if lower is None else height * (1 - lower) + blurred(blurred(height, 8), 8) * lower
            save_picture(f"realistic-skin-{part}-normal{suffix}", normal_from_height(relief[:, :, 0], 0.004 if part == "head" else 0.002), 94)
            # (glTF keeps roughness in the green channel. As the character has it the skin looks wet in plain
            # shading, which has no light going through the skin to soften it: raised.)
            least = cloth[:: size // 1024, :: size // 1024, 0] if cloth is not None else 0
            orm = np.ones((1024, 1024, 3), dtype=np.float32)
            orm[:, :, 1] = rough * (1 - least) + CLOTH_ROUGH * least
            orm[:, :, 2] = 0
            save_picture(f"realistic-skin-{part}-rough{suffix}", orm, 80)
        log(f"skin pictures: {part} ({len(covers)} of each)")
    save_picture("realistic-iris-grey", grey_iris(C), 92)
    save_picture("realistic-eye", to_srgb(exr("Sclera_Color.1005", 1024)[:, :, :3]))
    save_picture("realistic-mouth", to_srgb(exr("Mouth_Color.1008", 1024)[:, :, :3]))
    log("eye and mouth pictures")


# ── Strands ─────────────────────────────────────────────────────────────────────────────────────────────


def strands_of(haired, style, children, every):
    """A particle hair style of `haired` as polylines (each n x 3), with `children` of Blender's copies a strand."""
    chosen = None
    for modifier in haired.modifiers:
        if modifier.type == "PARTICLE_SYSTEM":
            modifier.show_viewport = modifier.name.strip() == style
            if modifier.show_viewport:
                chosen = modifier
    settings = chosen.particle_system.settings
    if children:
        settings.child_percent = children
    else:
        settings.child_type = "NONE"
    settings.display_step = 4
    for ob in bpy.data.objects:
        ob.select_set(ob is haired)
    bpy.context.view_layer.objects.active = haired
    bpy.context.view_layer.update()
    before = set(bpy.data.objects)
    with bpy.context.temp_override(object=haired, active_object=haired, selected_objects=[haired]):
        bpy.ops.object.modifier_convert(modifier=chosen.name)
    made = next(iter(set(bpy.data.objects) - before))
    count = len(made.data.vertices)
    co = np.empty(count * 3, dtype=np.float32)
    made.data.vertices.foreach_get("co", co)
    co = co.reshape(-1, 3).astype(np.float64)
    edges = np.empty(len(made.data.edges) * 2, dtype=np.int32)
    made.data.edges.foreach_get("vertices", edges)
    edges = edges.reshape(-1, 2)
    bpy.data.objects.remove(made)
    # (The strands come out one after another, each a run of joined points: a strand ends where no edge goes on.)
    joined = np.zeros(count, dtype=bool)
    joined[edges[:, 0]] = edges[:, 1] == edges[:, 0] + 1
    ends = np.flatnonzero(~joined)
    starts = np.concatenate([[0], ends[:-1] + 1])
    return [co[a : b + 1] for a, b in zip(starts, ends) if b - a >= 2][::every]


def ribbons(strands, centre, points, width, seed=7, taper_from=0.7, least=0.003):
    """Each strand as a flat ribbon lying along the head (its face turned away from `centre`): vertices,
    quads, and for each vertex (a shade of its strand's own, how far along the strand it is). A strand shorter than
    `least` is left out."""
    rng = np.random.default_rng(seed)
    verts, marks, faces = [], [], []
    for strand in strands:
        steps = np.linalg.norm(np.diff(strand, axis=0), axis=1)
        length = np.concatenate([[0], np.cumsum(steps)])
        if length[-1] < least:
            continue
        at = np.linspace(0, length[-1], points)
        line = np.stack([np.interp(at, length, strand[:, k]) for k in range(3)], axis=1)
        tangent = np.gradient(line, axis=0)
        tangent /= np.linalg.norm(tangent, axis=1, keepdims=True) + 1e-12
        out_from = line - centre
        out_from /= np.linalg.norm(out_from, axis=1, keepdims=True) + 1e-12
        side = np.cross(tangent, out_from)
        norm = np.linalg.norm(side, axis=1, keepdims=True)
        side = np.where(norm > 1e-4, side / (norm + 1e-12), np.array([1.0, 0, 0]))
        v = np.linspace(0, 1, points)
        taper = np.where(v < taper_from, 1.0, 1.0 - (v - taper_from) / (1 - taper_from) * 0.75)[:, None]
        half = width * 0.5 * taper
        base = len(verts)
        shade = rng.uniform(0.04, 0.96)
        for k in range(points):
            verts.append(line[k] - side[k] * half[k])
            verts.append(line[k] + side[k] * half[k])
            marks += [(shade, v[k] * 0.98 + 0.01)] * 2
        for k in range(points - 1):
            a = base + k * 2
            faces.append((a, a + 1, a + 3, a + 2))
    return verts, marks, faces


def scalp_paint(head, strands):
    """Where a style's hair grows, as a picture over the head's skin picture: the texels of the head (`head`:
    place_map of its tile) within SCALP_ROOT of a strand's root, with the gaps between roots up to twice
    SCALP_GAP wide closed, pulled in from the hairline by SCALP_INSET. The maker paints the hair's colour
    there, so no skin shows between the strands."""
    tree = KDTree(len(strands))
    for at, strand in enumerate(strands):
        tree.insert(strand[0], at)
    tree.balance()
    place, known = head
    rooted = np.zeros(known.shape)
    for row, column in zip(*np.nonzero(known)):
        rooted[row, column] = tree.find(place[row, column, :3])[2] < SCALP_ROOT
    # (Closing the gaps: grown by SCALP_GAP, then shrunk by as much, which gives back the outline it had.)
    texel = np.linalg.norm(place[1:, :, :3] - place[:-1, :, :3], axis=2)[known[1:] & known[:-1]]
    reach = max(1, int(round(SCALP_GAP / max(1e-6, float(np.median(texel))))))
    grown = blurred(rooted[:, :, None], reach)[:, :, 0] > 1e-6
    closed = (blurred(grown.astype(np.float64)[:, :, None], reach)[:, :, 0] > 1 - 1e-6) | (rooted > 0)
    # Pulled in from its edge: along a hairline the hair is combed away from its roots, and the first strip of
    # scalp inside the line has no hair over it to hide the paint. (What lies past the picture's islands counts
    # as inside, so only a hairline is pulled in, not a seam.) Then feathered.
    inset = max(1, int(round(SCALP_INSET / max(1e-6, float(np.median(texel))))))
    inner = blurred((closed | ~known).astype(np.float64)[:, :, None], inset)[:, :, 0] > 1 - 1e-6
    return blurred((inner & closed & known).astype(np.float64)[:, :, None], 3)[:, :, 0]


def lid_edges(C, shape, blink, eyes):
    """Each eye's lid edges as lines of points from the nose's side outwards: { side: (upper, lower) }. An edge
    is found from the blink: across the eye in steps, the skin a blink brings down furthest is the upper lid's
    edge, and where that lands when the eye is shut is the lower lid's."""
    skin = np.array(sorted({i for f, face in enumerate(C["faces"]) if SLOTS[C["slots"][f]] == "UDIM.Skin" and C["tiles"][f] == 1001 for i in face}))
    out = {}
    for side, sign in (("l", 1), ("r", -1)):
        centre = eyes[side]
        near = skin[(np.abs(shape[skin, 0] - centre[0]) < 0.026) & (np.abs(shape[skin, 2] - centre[2]) < 0.022) & (shape[skin, 1] < centre[1] + 0.006)]
        drop = blink[near, 2]
        across = (shape[near, 0] - centre[0]) * sign  # (from the nose's side of the eye outwards)
        moving = drop < drop.min() * 0.5
        steps = np.linspace(across[moving].min(), across[moving].max(), 20)
        upper, lower, rims = [], [], []
        still = near[drop > drop.min() * 0.08]
        for a, b in zip(steps[:-1], steps[1:]):
            inside = np.flatnonzero((across >= a) & (across <= b) & (drop < drop.min() * 0.25))
            if not len(inside):
                continue
            # (The lid's rim comes down together, front and back of it and a little of the lid above: of what
            # comes down nearly as far as the furthest, the lowest and furthest forward is the rim's front.)
            rim = near[inside[drop[inside] <= drop[inside].min() * 0.85]]
            top = rim[np.argmin(shape[rim, 2] + shape[rim, 1])]
            rims.append((np.ptp(shape[rim, 2]), np.ptp(shape[rim, 1])))
            upper.append(shape[top])
            shut = shape[top] + blink[top]
            lower.append(shape[still[np.argmin(np.linalg.norm(shape[still] - shut, axis=1))]])
        log(f"  eye {side}: the upper lid's edge {len(upper)} points, a blink brings it down {-drop.min() * 1000:.1f} mm; "
            f"its rim up to {max(r[0] for r in rims) * 1000:.1f} mm tall and {max(r[1] for r in rims) * 1000:.1f} mm deep")
        # (Evened out along the lid: from step to step the rim's front is one vertex or its neighbour.)
        out[side] = tuple(evened(np.array(line)) for line in (upper, lower))
    return out


def evened(line, passes=3):
    """A line of points with each inner point pulled towards the middle of its neighbours, `passes` times."""
    line = line.copy()
    for _ in range(passes):
        line[1:-1] = 0.25 * line[:-2] + 0.5 * line[1:-1] + 0.25 * line[2:]
    return line


def lashes_of(edges, eyes):
    """Eyelashes for both eyes as strands (polylines), with the eye each is on: [(strands, the eye's middle)].
    Lashes leave a lid's edge (lid_edges) forwards and away from the eye, fanned towards the outer corner,
    shorter at the corners, the upper ones curling up. Rooted on the skin itself, each follows its lid as the
    eye shuts."""
    rng = np.random.default_rng(11)
    out = []
    for side in ("l", "r"):
        centre = eyes[side]
        strands = []
        for which, (count, length, curl) in LASHES.items():
            edge = edges[side][0 if which == "upper" else 1]
            along = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(edge, axis=0), axis=1))])
            for k in range(count):
                t = 0.1 + 0.88 * (k + rng.uniform(0.15, 0.85)) / count  # (none in the corner by the nose)
                root = np.array([np.interp(t * along[-1], along, edge[:, c]) for c in range(3)])
                ahead = np.array([np.interp(min(along[-1], t * along[-1] + 0.001), along, edge[:, c]) for c in range(3)])
                tangent = ahead - root
                tangent /= np.linalg.norm(tangent) + 1e-12
                away = root - centre
                away /= np.linalg.norm(away) + 1e-12
                grow = 0.4 * away + np.array([0.0, -0.85, 0.0]) + np.array([0.0, 0.0, 0.22 * curl]) + tangent * (t - 0.4) * 0.6
                grow /= np.linalg.norm(grow)
                reach = length * (0.55 + 0.45 * math.sin(math.pi * min(1.0, t * 1.15))) * rng.uniform(0.85, 1.1)
                strands.append(np.array([root + grow * reach * s + np.array([0.0, 0.0, curl]) * reach * 0.5 * s * s
                                         for s in np.linspace(0, 1, LASH_POINTS + 1)]))
        out.append((strands, centre))
    return out


# ── Paint: where makeup, stubble and nail colour go ─────────────────────────────────────────────────────

PAINT_SIZE = 1024  # a mask's picture
LINER_SIZE = 2048  # the eyeliner's and the nails': thin lines and small patches
LINER = (0.0013, 0.0008)  # how far from a lid's edge the eyeliner reaches, upper lid and lower (metres)
LINER_WING = 0.003  # how far past the outer corner the upper line runs on, along the lid's own line
SHADOW = (0.04, 0.4)  # the eyeshadow starts where a blink moves the skin this share of its furthest, full from this
BLUSH = (0.027, 0.017)  # a cheek's blush, half its width and half its height
BLUSH_AT = (0.016, 0.046)  # its middle: how far out from the eye's, and how far under


def to_line(points, line):
    """How far each of `points` (… x 3) is from a line of points (n x 3): the nearest of its pieces."""
    least = np.full(points.shape[:-1], np.inf)
    for a, b in zip(line[:-1], line[1:]):
        along = b - a
        t = np.clip(((points - a) @ along) / (along @ along + 1e-18), 0, 1)
        least = np.minimum(least, np.linalg.norm(points - (a + t[..., None] * along), axis=-1))
    return least


def save_mask(name, mask, known, soften=1):
    """A mask (0…1, where paint goes) as a picture whose alpha it is, white throughout."""
    mask = np.where(known, np.clip(mask, 0, 1), 0)
    if soften:
        mask = blurred(mask[:, :, None], soften)[:, :, 0]
    picture = np.ones(mask.shape + (4,), dtype=np.float32)
    picture[:, :, 3] = mask
    save_picture(name, picture, 90)
    return mask


def write_paints(C, blink, eyes, edges):
    """Where paint goes on the skin, each a picture over its tile's (white, the place in its alpha), which the
    maker lays a colour through (src/realistic.js paintsOf):

    - realistic-paint-lips: the lips, as the character marks them.
    - realistic-paint-eyeshadow: the upper lids, from the lashes up: the skin a blink moves.
    - realistic-paint-eyeliner: a line along each lid's edge, the upper one running on past the outer corner.
    - realistic-paint-blush: a soft patch on each cheek.
    - realistic-paint-stubble, -moustache, -goatee: where a beard grows as the character marks it, speckled as
      short hairs are: all of it, the upper lip alone, the upper lip and chin.
    - realistic-paint-nails (the arms' tile) and realistic-paint-toenails (the legs'): the nails, which the
      character leaves without pores, each on a patch of the picture of its own."""
    shape = C["shape"]
    drop = np.clip(-blink[:, 2], 0, None)
    more = np.stack([C["lip"], C["beard"], drop / drop.max()], axis=1)
    place, known = place_map(C, 1001, PAINT_SIZE, more)
    at, lip, beard, moved = place[:, :, :3], place[:, :, 3], place[:, :, 4], place[:, :, 5]
    lips = save_mask("realistic-paint-lips", smoothstep(0.3, 0.7, lip), known)

    # Eyeshadow: only by the eyes, and only over the lower lid's edge.
    by_eye = np.zeros(known.shape)
    blush = np.zeros(known.shape)
    for side, sign in (("l", 1), ("r", -1)):
        eye = eyes[side]
        across = np.abs(at[:, :, 0] - eye[0])
        by_eye = np.maximum(by_eye, (1 - smoothstep(0.024, 0.03, across)) * smoothstep(-0.004, 0.0, at[:, :, 2] - eye[2] + 0.004))
        # Blush: on the front of the cheek under the eye's outer half, rising outwards.
        dx = (at[:, :, 0] * sign - (eye[0] * sign + BLUSH_AT[0])) / BLUSH[0]
        dz = (at[:, :, 2] - (eye[2] - BLUSH_AT[1]) - 0.3 * (at[:, :, 0] * sign - eye[0] * sign - BLUSH_AT[0])) / BLUSH[1]
        front = 1 - smoothstep(eye[1] + 0.03, eye[1] + 0.045, at[:, :, 1])  # (not the side of the head behind it)
        blush = np.maximum(blush, np.exp(-(dx * dx + dz * dz) * 1.4) * (at[:, :, 0] * sign > 0) * front)
    shadow = save_mask("realistic-paint-eyeshadow", smoothstep(SHADOW[0], SHADOW[1], moved) * by_eye, known, 2)
    save_mask("realistic-paint-blush", blush, known, 3)

    liner_place, liner_known = place_map(C, 1001, LINER_SIZE)
    liner = np.zeros(liner_known.shape)
    for side, sign in (("l", 1), ("r", -1)):
        upper, lower = edges[side]
        # (The upper line runs on past the outer corner, outwards and a little up: a small wing.)
        onward = upper[-1] - upper[-3]
        wing = upper[-1] + onward / np.linalg.norm(onward) * LINER_WING + np.array([0.0, 0.0, LINER_WING * 0.3])
        box = (np.abs(liner_place[:, :, 0] - eyes[side][0]) < 0.04) & (np.abs(liner_place[:, :, 2] - eyes[side][2]) < 0.03)
        points = liner_place[box]
        line = 1 - smoothstep(LINER[0] * 0.6, LINER[0], to_line(points, np.vstack([upper, wing])))
        # (The lower line: the outer two thirds of the lid, fainter.)
        outer = lower[len(lower) // 3 :]
        line = np.maximum(line, 0.7 * (1 - smoothstep(LINER[1] * 0.6, LINER[1], to_line(points, outer))))
        liner[box] = np.maximum(liner[box], line)
    save_mask("realistic-paint-eyeliner", liner, liner_known)

    # Stubble: the beard's ground, speckled. The mouth is found from the lips.
    mouth = shape[C["lip"] > 0.5]
    wide, top, middle = np.abs(mouth[:, 0]).max(), mouth[:, 2].max(), mouth[:, 2].mean()
    speckle = 0.25 + 0.75 * smoothstep(0.35, 0.8, np.random.default_rng(5).random(known.shape))
    # (Its edge fades over a few millimetres, and it thins up the cheeks, as a beard's ground does.)
    cheek = smoothstep(wide * 0.9, wide + 0.02, np.abs(at[:, :, 0])) * smoothstep(middle - 0.01, middle + 0.045, at[:, :, 2])
    ground = blurred(np.where(known, smoothstep(0.15, 0.6, beard), 0)[:, :, None], 7)[:, :, 0] * (1 - 0.65 * cheek) * speckle
    narrow = 1 - smoothstep(wide + 0.004, wide + 0.012, np.abs(at[:, :, 0]))
    under_nose = 1 - smoothstep(top + 0.018, top + 0.024, at[:, :, 2])
    for name, mask in (("stubble", ground), ("moustache", ground * narrow * under_nose * smoothstep(middle - 0.003, middle + 0.001, at[:, :, 2])),
                       ("goatee", ground * narrow * under_nose)):
        kept = save_mask(f"realistic-paint-{name}", mask, known, 0)
        log(f"  {name}: {kept.mean() * 100:.1f}% of the head's picture")
    log(f"paint: lips {lips.mean() * 100:.2f}%, eyeshadow {shadow.mean() * 100:.2f}% of the head's picture; the mouth {wide * 2000:.0f} mm wide at {middle:.3f} m")

    # Nails: each has a patch of the picture to itself, without pores (the skin round it is on the hand's or
    # foot's patch, and stays skin).
    for name, tile in (("nails", 1003), ("toenails", 1004)):
        nails = set()
        for faces in islands(C, tile):
            points = np.array(sorted({i for f in faces for i in C["faces"][f]}))
            # (A nail's patch is small, and its points mostly poreless: 77% to 100% of them, as the character has it.)
            if len(faces) < 120 and (C["pores"][points] < 0.05).mean() > 0.6:
                nails.update(faces)
        _place, on_nail = place_map(C, tile, LINER_SIZE, only=nails, grow=2)
        kept = save_mask(f"realistic-paint-{name}", on_nail.astype(np.float64), on_nail, 0)
        log(f"  {name}: {len(nails)} faces, {kept.mean() * 100:.2f}% of the tile's picture")


def islands(C, tile):
    """The patches of a tile's picture the skin is laid out in: lists of faces, joined where they share a
    corner's place in the picture."""
    parent = {}

    def root(key):
        while parent.setdefault(key, key) != key:
            parent[key] = parent[parent[key]]
            key = parent[key]
        return key

    first = {}
    for f, face in enumerate(C["faces"]):
        if C["tiles"][f] != tile or SLOTS[C["slots"][f]] not in ("UDIM.Skin", "charmorph_censor"):
            continue
        corners = C["uv01"][C["starts"][f] : C["starts"][f] + C["totals"][f]]
        keys = [(i, round(float(u) * 20000), round(float(v) * 20000)) for i, (u, v) in zip(face, corners)]
        for key in keys[1:]:
            parent[root(key)] = root(keys[0])
        first[f] = keys[0]
    out = {}
    for f, key in first.items():
        out.setdefault(root(key), []).append(f)
    return list(out.values())


# ── Meshes, the rig and the files ───────────────────────────────────────────────────────────────────────


def new_mesh(name, verts, faces, uvs_per_vertex=None, loop_uvs=None, materials=(), material_index=None):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata([tuple(v) for v in verts], [], [tuple(int(i) for i in f) for f in faces])
    layer = mesh.uv_layers.new(name="UVMap")
    if uvs_per_vertex is not None:
        ids = np.empty(len(mesh.loops), dtype=np.int32)
        mesh.loops.foreach_get("vertex_index", ids)
        loop_uvs = np.asarray(uvs_per_vertex, dtype=np.float32)[ids]
    if loop_uvs is not None:
        layer.uv.foreach_set("vector", np.asarray(loop_uvs, dtype=np.float32).ravel())
    for material in materials:
        mesh.materials.append(material)
    if material_index is not None:
        mesh.polygons.foreach_set("material_index", np.asarray(material_index, dtype=np.int32))
    mesh.polygons.foreach_set("use_smooth", np.ones(len(mesh.polygons), dtype=bool))
    mesh.update()
    ob = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(ob)
    return ob


def plain_material(name, colour=(0.8, 0.8, 0.8, 1.0), roughness=0.5, alpha=1.0):
    # (One of a name: a second "hair" would be named "hair.001", and the maker knows a part by its material's name.)
    made = bpy.data.materials.get(name)
    if made:
        return made
    made = bpy.data.materials.new(name)
    made.use_nodes = True
    shader = made.node_tree.nodes["Principled BSDF"]
    shader.inputs["Base Color"].default_value = colour
    shader.inputs["Roughness"].default_value = roughness
    shader.inputs["Alpha"].default_value = alpha
    if alpha < 1:
        made.blend_method = "BLEND"
    return made


def make_rig(joints, tails):
    armature = bpy.data.armatures.new("realistic-rig")
    rig = bpy.data.objects.new("realistic-rig", armature)
    bpy.context.scene.collection.objects.link(rig)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.mode_set(mode="EDIT")
    children = {}
    for name, parent in BONES:
        children.setdefault(parent, []).append(name)
    for name, parent in BONES:
        bone = armature.edit_bones.new(name)
        bone.head = Vector(joints[name])
        bone.tail = Vector(tails[name]) if name in tails else Vector(joints[children[name][0]])
        if parent:
            bone.parent = armature.edit_bones[parent]
        # (As the maker's other bodies: arms and feet, lying flat, roll their Z up; the rest roll their Z forward.)
        direction = (bone.tail - bone.head).normalized()
        bone.align_roll(Vector((0, 0, 1)) if abs(direction.z) < 0.5 or name.startswith("eye_") else Vector((0, -1, 0)))
    bpy.ops.object.mode_set(mode="OBJECT")
    return rig


def skin_to(ob, rig, weights):
    """Binds `ob` to `rig`: `weights` is {bone: a weight per vertex} (already at most four a vertex), or a bone's name for all of it."""
    count = len(ob.data.vertices)
    if isinstance(weights, str):
        ob.vertex_groups.new(name=weights).add(list(range(count)), 1.0, "REPLACE")
    else:
        for bone, w in weights.items():
            ids = np.flatnonzero(w > 0)
            if not len(ids):
                continue
            group = ob.vertex_groups.new(name=bone)
            for i in ids:
                group.add([int(i)], float(w[i]), "REPLACE")
    ob.parent = rig
    modifier = ob.modifiers.new("Armature", "ARMATURE")
    modifier.object = rig


def export(path, objects):
    for ob in bpy.data.objects:
        ob.select_set(ob in objects)
    bpy.ops.export_scene.gltf(
        filepath=path, export_format="GLB", use_selection=True, export_yup=True, export_apply=False,
        export_skins=True, export_animations=False, export_morph=True, export_morph_normal=True,
        export_morph_tangent=False, export_tangents=False, export_materials="EXPORT", export_image_format="NONE",
    )
    log(f"wrote {os.path.basename(path)}: {os.path.getsize(path) / 1e6:.1f} MB")


def to_gltf(v):
    """A point or move from Blender's axes (x, -forward, up) to glTF's (x, up, forward)."""
    return [round(float(v[0]), 5), round(float(v[2]), 5), round(float(-v[1]), 5)]


def main():
    C = read_character()
    shape = C["shape"]
    count = len(shape)
    faces, slots = C["faces"], C["slots"]
    centre_uv = np.add.reduceat(C["uv"], C["starts"]) / C["totals"][:, None]
    C["tiles"] = 1001 + np.floor(centre_uv[:, 0]).astype(int) + 10 * np.floor(centre_uv[:, 1]).astype(int)
    C["uv01"] = C["uv"] - np.floor(np.repeat(centre_uv, C["totals"], axis=0))
    log(f"the character: {count} vertices, {len(faces)} faces")
    for tile, part in SKIN_TILES.items():
        ids = sorted({i for f, face in enumerate(faces) if C["tiles"][f] == tile for i in face})
        log(f"  tile {tile} ({part}): heights {shape[ids, 2].min():.2f} to {shape[ids, 2].max():.2f}, across {np.abs(shape[ids, 0]).max():.2f}")

    if wanted("textures"):
        write_textures(C)
    if not (wanted("body") or wanted("hair") or wanted("brows") or wanted("paints")):
        return

    # The joints, and how each slider moves them.
    J = Joints()

    def joints_of(s):
        out = {}
        for bone, theirs in TAKES.items():
            out[bone] = J.head(s, theirs[0])
        return out

    eye_ids = {}
    for side, sign in (("l", 1), ("r", -1)):
        ids = sorted({i for f, face in enumerate(faces) if SLOTS[slots[f]] in ("Sclera_Cornea", "Iris", "Pupil") for i in face if shape[i, 0] * sign > 0})
        eye_ids[side] = np.array(ids)
    joints = joints_of(shape)
    tails = {}
    for side in ("l", "r"):
        ball = shape[[i for i in eye_ids[side] if True]]
        centre = (ball.min(axis=0) + ball.max(axis=0)) / 2
        radius = (ball[:, 0].max() - ball[:, 0].min()) / 2
        joints[f"eye_{side}"] = centre
        tails[f"eye_{side}"] = centre + np.array([0, -radius * 2, 0])
        tails[f"hand_{side}"] = J.tail(shape, f"hand_{side}")
        tails[f"ball_{side}"] = joints[f"ball_{side}"] + np.array([0, -0.06, 0])
        for finger in FINGERS:
            tails[f"{finger}_03_{side}"] = J.tail(shape, f"{finger}_03_{side}")
    tails["Head"] = J.tail(shape, "head")
    tails["pelvis"] = joints["pelvis"] + np.array([0, 0, 0.08])
    log("joints: " + ", ".join(f"{b} {joints[b][2]:.3f}" for b in ("pelvis", "spine_01", "spine_02", "spine_03", "neck_01", "Head", "eye_l")))

    keys = {}  # name -> every vertex's move
    for name, mix in FACE_MOVES.items():
        keys[name] = sum(weight * morph("L3", each, count) for each, weight in mix.items())
    moves = {}
    for name, source, _both in SLIDERS:
        delta = morph("L2", source, count)
        keys[name] = delta
        moved = joints_of(shape + delta)
        for side in ("l", "r"):
            moved[f"eye_{side}"] = joints[f"eye_{side}"] + delta[eye_ids[side]].mean(axis=0)
        per = {bone: to_gltf(moved[bone] - joints[bone]) for bone in BONE_NAMES if np.linalg.norm(moved[bone] - joints[bone]) > 0.0002}
        if per:
            moves[name] = per
    log(f"{len(FACE_MOVES)} face moves, {len(SLIDERS)} sliders")

    eyes_at = {side: joints[f"eye_{side}"] for side in ("l", "r")}
    edges = lid_edges(C, shape, keys["blink"], eyes_at) if wanted("body") or wanted("paints") else None
    if wanted("paints"):
        write_paints(C, keys["blink"], eyes_at, edges)
    if not (wanted("body") or wanted("hair") or wanted("brows")):
        return

    # The weights: the character's game rig's, gathered onto the maker's bones; each eyeball whole on its own.
    theirs = their_weights(count)
    W = {bone: sum(theirs[each] for each in take if each in theirs) for bone, take in TAKES.items()}
    missing = sorted({each for take in TAKES.values() for each in take} - set(theirs))
    if missing:
        log(f"  (no weights in the file for: {', '.join(missing)})")
    for side in ("l", "r"):
        for bone in W:
            W[bone][eye_ids[side]] = 0
        W[f"eye_{side}"] = np.zeros(count)
        W[f"eye_{side}"][eye_ids[side]] = 1
    table = np.stack([W[bone] if not np.isscalar(W[bone]) else np.zeros(count) for bone in BONE_NAMES], axis=1)
    table[table < 1e-4] = 0
    bare = table.sum(axis=1) < 1e-6
    table[bare, BONE_NAMES.index("Head")] = 1  # (what the file leaves unweighted: none is expected)
    log(f"  vertices without a weight in the file: {int(bare.sum())}")
    # (At most four bones a vertex, as glTF holds.)
    order = np.argsort(-table, axis=1)[:, 4:]
    np.put_along_axis(table, order, 0, axis=1)
    table /= table.sum(axis=1, keepdims=True)
    weights = {bone: table[:, i] for i, bone in enumerate(BONE_NAMES)}

    # The hair file's copy of the body carries the strand styles and brows: brought in, at the base shape.
    with bpy.data.libraries.load(os.path.join(DATA, "hair.blend")) as (_found, bring):
        bring.objects = ["hair-src"]
    haired = bring.objects[0]
    bpy.context.scene.collection.objects.link(haired)
    haired.data.vertices.foreach_set("co", shape.astype(np.float32).ravel())
    haired.data.update()
    normals = np.empty(count * 3, dtype=np.float32)
    haired.data.vertices.foreach_get("normal", normals)
    normals = normals.reshape(-1, 3).astype(np.float64)
    skull = shape[shape[:, 2] > shape[:, 2].max() - 0.2]
    head_centre = np.array([0.0, skull[:, 1].mean(), skull[:, 2].max() - 0.115])

    rig = make_rig(joints, tails)

    if wanted("body"):
        # The parts: the skin by its texture tile, the mouth, each eye's white, clear front and iris (with its pupil).
        sclera_alpha = exr("Sclera_Color.1005", 1024)[:, :, 3]
        part_names, part_of, keep = [], [], []
        for f, face in enumerate(faces):
            slot = SLOTS[slots[f]]
            if slot in ("UDIM.Skin", "charmorph_censor"):
                part = f"skin_{SKIN_TILES[C['tiles'][f]]}"
            elif slot == "Sclera_Cornea":
                u, v = centre_uv[f] - np.floor(centre_uv[f])
                clear = sclera_alpha[min(1023, int(v * 1024)), min(1023, int(u * 1024))] < 0.5
                part = "cornea" if clear else "eye_white"
            elif slot in ("Iris", "Pupil"):
                part = "iris"  # (the pupil is the middle of the iris's picture: pupil_uvs)
            elif slot == "Mouth":
                part = "mouth"
            else:
                continue  # (the tear line: a wet glint plain shading can't give)
            if part not in part_names:
                part_names.append(part)
            part_of.append(part_names.index(part))
            keep.append(f)
        LOOKS = {"cornea": ((0.0, 0.0, 0.0, 1.0), 0.03, 0.3),
                 "eye_white": ((0.8, 0.8, 0.8, 1.0), 0.25, 1.0), "iris": ((0.8, 0.8, 0.8, 1.0), 0.35, 1.0),
                 "mouth": ((0.8, 0.8, 0.8, 1.0), 0.35, 1.0)}
        materials = [plain_material(name, *LOOKS.get(name, ((0.8, 0.8, 0.8, 1.0), 0.6, 1.0))) for name in part_names]
        corners = C["uv01"].copy()
        for corner, uv in pupil_uvs(C).items():
            corners[corner] = uv
        loop_uvs = np.concatenate([corners[C["starts"][f] : C["starts"][f] + C["totals"][f]] for f in keep])
        body = new_mesh("realistic-body", shape, [faces[f] for f in keep], loop_uvs=loop_uvs, materials=materials, material_index=part_of)
        log(f"body: {len(keep)} faces in parts {', '.join(part_names)}")
        body.shape_key_add(name="Basis")
        for name, delta in keys.items():
            key = body.shape_key_add(name=name)
            key.data.foreach_set("co", (shape + delta).astype(np.float32).ravel())
        skin_to(body, rig, weights)

        verts, marks, quads = [], [], []
        for seed, (strands, centre) in enumerate(lashes_of(edges, eyes_at)):
            # (Each lash twice, as two ribbons across each other: one faces away from the eye, one faces forwards,
            # so a lash has some width from the front and from the side. Each strand's own shade is kept apart
            # for the four sets, so the maker can tell a lash's points from the next's.)
            for turn, towards in enumerate((centre, centre + np.array([0.0, 0.6, 0.0]))):
                more, their_marks, their_quads = ribbons(strands, towards, LASH_POINTS, LASH_WIDTH, seed=20 + seed, taper_from=0.2, least=0.0008)
                quads += [tuple(i + len(verts) for i in quad) for quad in their_quads]
                marks += [(0.01 + 0.24 * (seed * 2 + turn + mark[0]), mark[1]) for mark in their_marks]
                verts += more
        lashes = new_mesh("realistic-lashes", verts, quads, uvs_per_vertex=marks, materials=[plain_material("lashes", (0.02, 0.015, 0.012, 1.0), 0.5)])
        skin_to(lashes, rig, "Head")
        log(f"lashes: {len(quads) // (LASH_POINTS - 1) // 2} of them, {len(quads) * 2} triangles")
        export(os.path.join(MODELS, "realistic-body.glb"), [rig, body, lashes])
        with open(os.path.join(MODELS, "realistic-body.json"), "w", encoding="utf8") as f:
            json.dump({"source": "make_realistic.py", "jointMoves": moves,
                       "sliders": [[name, -1 if both else 0, 1] for name, _source, both in SLIDERS]}, f, separators=(",", ":"))
        bpy.data.objects.remove(body)
        bpy.data.objects.remove(lashes)

    if wanted("brows"):
        for n, style in BROW_STYLES.items():
            strands = strands_of(haired, style, 0, 1)
            verts, marks, quads = ribbons(strands, head_centre, BROW_POINTS, BROW_WIDTH, taper_from=0.5)
            brows = new_mesh(f"realistic-brows-{n:02d}", verts, quads, uvs_per_vertex=marks, materials=[plain_material("brows", (0.07, 0.045, 0.03, 1.0), 0.55)])
            skin_to(brows, rig, "Head")
            log(f"brows {n}: {len(strands)} strands, {len(quads) * 2} triangles")
            export(os.path.join(MODELS, f"realistic-brows-{n:02d}.glb"), [rig, brows])
            bpy.data.objects.remove(brows)

    if wanted("hair"):
        head = place_map(C, 1001, SCALP_SIZE)
        for name, (style, children, every, width) in HAIR.items():
            strands = strands_of(haired, style, children, every)
            verts, marks, quads = ribbons(strands, head_centre, HAIR_POINTS, width)
            hair = new_mesh(f"realistic-hair-{name}", verts, quads, uvs_per_vertex=marks, materials=[plain_material("hair", (0.13, 0.075, 0.04, 1.0), 0.42)])
            skin_to(hair, rig, "Head")
            cover = scalp_paint(head, strands)
            picture = np.ones((SCALP_SIZE, SCALP_SIZE, 4), dtype=np.float32)
            picture[:, :, 3] = cover
            save_picture(f"realistic-hair-{name}-scalp", picture, 80)
            log(f"hair {name}: {len(strands)} strands, {len(quads) * 2} triangles; {cover.mean() * 100:.0f}% of the head's picture is where it grows")
            export(os.path.join(MODELS, f"realistic-hair-{name}.glb"), [rig, hair])
            bpy.data.objects.remove(hair)


main()
