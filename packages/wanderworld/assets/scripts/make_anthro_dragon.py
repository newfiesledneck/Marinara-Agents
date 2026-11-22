"""The anthro dragon avatar, male and female, built on the human avatar's body: make_avatar.py's own body
(imported, so the two stay one body under clothes), made a dragon: the head moved onto a sculpted dragon's
head, a powerful neck, digitigrade legs on clawed feet, clawed hands, a tail, folded wings, horns, a frill
and a crest of spines, belly plates, scales. Writes assets/models/anthro-dragon-male.glb and
anthro-dragon-female.glb. Run (BLENDER: your Blender executable; add `-- male` or `-- female` for one):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_anthro_dragon.py

- The body: the human avatar's (MakeHuman's base mesh and targets, CC0, read as data), unchanged under
  clothes: the trunk, arms and thighs are its surface, moved by its bones. Its build keys (thin, heavy,
  muscle, chest or bust, hips, waist, belly, shoulders, neck) carry over, with neck_slim beside neck.
- The legs: the human legs skinned onto the people's joints moved as wwblend's `digitigrade` does (the
  knee forward, the heel raised into a hock, the foot standing on its toes); below the hock the foot is
  the dragon's own: a long, strong upper foot, four thick toes fanned out flat with big claws, a dewclaw.
  So the human avatar's clothes, bound to these bones with their own bind pose, bend into the stance too.
- The head: the human head warped (a thin-plate spline through landmarks: the lips along the dragon's lip
  line, the middle line feature by feature, the eyes carried whole, the jaw cast onto the dragon's) and
  then settled onto a sculpted shape, with the brow ridges, cheekbones, nostrils and the mouth's line
  raised or cut into it. The ears are taken away and the mouth closed. Eyes of its own with slit pupils.
- The neck: deep from front to back, a full throat and the nape's muscles, from the jaw into the chest.
- The tail (`tail_01`..`tail_05` on `pelvis`) is joined to the body. The wings (`wing_01`/`wing_02` and
  three fingers a side, on `spine_03`, folded on the back; their bones can open them later) are a mesh of
  their own named `wings`, so the game can hide them; the back under them is finished skin.
- Underwear: the human avatar's garments (make_avatar.py's builder, on the same skin), each a mesh of its
  own: underwear-bottom-briefs and -boxer_briefs, and for her underwear-top-bra and -sports_bra; the
  bottoms with an oval opening for the tail. Each follows the body's keys and bones.
- Material parts, each recoloured by its base colour factor over a greyscale texture: scales, scales2
  (belly plates, throat, the wings' inner side), horns (horns, claws, spines), iris, eye_white, teeth (one
  2048 px texture and a normal map of the scales' relief); underwear and underwear_trim (the garments'
  own texture and normal map, as the human avatar's).
- Shape keys (glTF morph targets, 0-1; a slider that runs both ways is a pair): the build keys and
  neck_slim; jaw, cheeks, eyes; muzzle (longer) and muzzle_short; horns (bigger) and horns_small; tail
  (thicker), tail_long and tail_short.
"""

import math
import os
import sys

import bmesh
import bpy
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree
from mathutils.kdtree import KDTree

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import wwanthro_dragon as wd  # noqa: E402
import wwavatar as wa  # noqa: E402
import wwblend as ww  # noqa: E402
from wwanthro_dragon import BONE_INDEX, BONE_NAMES, ellipsoid, mirrored, smoothstep, sweep, union  # noqa: E402

log = wd.log
S = wa.sided

# Each dragon is the human avatar's body (make_avatar.py's MALE or FEMALE, unchanged under its clothes)
# with these of its own: the head's size, the muzzle's length, the horns', the wings' and the tail's size.
MALE = {
    "name": "anthro-dragon-male",
    "human": wd.ma.MALE,
    "female": False,
    "head": 1.17,
    "muzzle": 0.9,
    "horns": 1.0,
    "wing": 1.0,
    "tail": 1.0,
    "neck": 1.0,  # how much fuller its neck is than a person's
}
FEMALE = {
    "name": "anthro-dragon-female",
    "human": wd.ma.FEMALE,
    "female": True,
    "head": 1.08,
    "muzzle": 0.84,
    "horns": 0.82,
    "wing": 0.92,
    "tail": 0.88,
    "neck": 0.85,
}
# The underwear styles each wears (the human avatar's own, cut from the same skin, with a tail opening).
UNDERWEAR_STYLES = {
    False: ["underwear-bottom-briefs", "underwear-bottom-boxer_briefs"],
    True: ["underwear-bottom-briefs", "underwear-bottom-boxer_briefs", "underwear-top-bra", "underwear-top-sports_bra"],
}

# Material parts of the body and wings: (name, colour, roughness). The underwear's are make_avatar's
# (underwear, underwear_trim), on a texture of their own.
MATS = [
    ("scales", 0x3E6E8E, 0.5),
    ("scales2", 0xD8C08A, 0.55),
    ("horns", 0xD6C8A6, 0.38),
    ("iris", 0xE8A818, 0.12),
    ("eye_white", 0x3A2614, 0.2),
    ("teeth", 0xEFE6CE, 0.3),
]
SCALES, SCALES2, HORNS, IRIS, EYE_WHITE, TEETH = range(len(MATS))
GARMENT_MATS = [("underwear", 0xE8E4DC, 0.85), ("underwear_trim", 0xDCD6CC, 0.6)]


# ── The head's design ────────────────────────────────────────────────────────────────────────────────


class HeadDesign:
    """The dragon's head in the head's frame (x across, f forward, u up from the Head joint), in metres
    before `k` (its size): the big shapes the mesh settles onto, the details raised or cut into it, the
    lip line, the eyes, and where the human head's features go."""

    def __init__(self, fr, B):
        k, muzzle = B["head"], B["muzzle"]
        self.fr, self.k, self.muz = fr, k, muzzle
        K = k

        def F(f):  # forward distances on the snout stretch with the muzzle
            return f if f < 0.12 else 0.12 + (f - 0.12) * muzzle

        self.F = F
        P = lambda x, f, u: fr.p(x * K, F(f) * K if f >= 0 else f * K, u * K)  # noqa: E731
        self.P = P
        self.lip_line = [(0.0, 0.283, -0.006), (0.017, 0.278, -0.006), (0.029, 0.262, -0.007), (0.036, 0.225, -0.008), (0.041, 0.17, -0.0095), (0.046, 0.115, -0.009), (0.052, 0.07, -0.005), (0.056, 0.045, 0.0)]
        fem = B["female"]
        self.eye = dict(centre=(0.05, 0.088, 0.052), yaw=34.0, roll=15.0 if fem else 13.0, pitch=4.0, scale=1.3 if fem else 1.22)
        # The middle line's features: upper contact, upper lip, nose tip, glabella, forehead, crown,
        # occiput, nape; lower contact, lower lip, chin, under the chin, throat.
        self.profile_up = [(0.283, -0.0045), (0.291, 0.007), (0.285, 0.046), (0.145, 0.079), (0.075, 0.097), (-0.005, 0.104), (-0.085, 0.05), (-0.075, -0.005)]
        self.profile_lo = [(0.281, -0.0085), (0.279, -0.018), (0.262, -0.05), (0.12, -0.076), (0.065, -0.13)]
        self.lateral = [
            ((0.055, 0.075, 0.0), (0.066, 0.03, 0.02)),  # cheekbone
            ((0.017, 0.112, -0.008), (0.031, 0.262, 0.032)),  # the nose's wing
            ((0.01, 0.115, 0.02), (0.028, 0.2, 0.062)),  # side of the nose bridge
            ((0.035, 0.1, -0.012), (0.046, 0.17, 0.018)),  # cheek beside the nose
            ((0.045, 0.09, 0.02), (0.052, 0.13, 0.04)),  # under the eye
            ((0.066, 0.065, 0.065), (0.062, 0.03, 0.08)),  # temple
            ((0.06, 0.0, -0.03), (0.062, -0.03, -0.02)),  # below the ear
        ]
        # The big shapes (smooth, so the mesh settles onto them without folding).
        Sh = []
        Sh.append(ellipsoid(P(0, -0.012, 0.052), np.array([0.066, 0.08, 0.056]) * K))  # braincase
        Sh.append(ellipsoid(P(0, -0.058, 0.04), np.array([0.056, 0.048, 0.05]) * K).soft(0.04 * K))  # occiput
        Sh.append(sweep([P(0, -0.05, 0.078), P(0, 0.05, 0.088), P(0, 0.13, 0.08)], np.array([0.05, 0.056, 0.04]) * K, np.array([0.022, 0.02, 0.016]) * K, square=2.6).soft(0.04 * K))  # skull roof
        sn = [(0.05, 0.0375, 0.0645, 0.05), (0.13, 0.034, 0.056, 0.044), (0.2, 0.029, 0.05, 0.039), (0.25, 0.025, 0.045, 0.034), (0.278, 0.022, 0.04, 0.029), (0.292, 0.02, 0.032, 0.022)]
        Sh.append(sweep([P(0, f, u) for f, u, _, _ in sn], np.array([w for *_, w, _ in sn]) * K, np.array([h for *_, h in sn]) * K, square=2.8).soft(0.045 * K))  # upper jaw
        lj = [(-0.015, -0.037, 0.064, 0.034), (0.07, -0.037, 0.053, 0.031), (0.15, -0.034, 0.045, 0.027), (0.22, -0.031, 0.038, 0.024), (0.262, -0.029, 0.03, 0.021), (0.276, -0.027, 0.023, 0.017)]
        jaw = sweep([P(0, f, u) for f, u, _, _ in lj], np.array([w for *_, w, _ in lj]) * K, np.array([h for *_, h in lj]) * K, square=2.5).soft(0.04 * K)
        chin = ellipsoid(P(0, 0.256, -0.038), np.array([0.024, 0.02, 0.016]) * K).soft(0.02 * K)
        Sh += [jaw, chin]
        self.jaw_shape = mirrored(union([jaw, chin]))
        self.jaw_axis = [(f, u) for f, u, _, _ in lj]
        self.jaw_rows = lj
        Sh.append(ellipsoid(P(0, 0.0, -0.062), np.array([0.058, 0.075, 0.05]) * K).soft(0.055 * K))  # throat
        Sh.append(ellipsoid(P(0.056, -0.002, -0.012), np.array([0.028, 0.048, 0.042]) * K).soft(0.035 * K))  # jaw muscle
        self.E = P(*self.eye["centre"])
        Sh.append(ellipsoid(self.E, np.array([0.028, 0.028, 0.022]) * K).soft(0.025 * K))  # the lids' mound
        self.shape = mirrored(union(Sh))
        # The details, raised or cut along curves (height, width), mirrored across the middle.
        lip = list(self.lip_line)
        feats = [
            ([(0.024, 0.15, 0.08), (0.05, 0.122, 0.086), (0.064, 0.092, 0.08), (0.068, 0.05, 0.078), (0.058, 0.0, 0.086)], 0.011 if fem else 0.014, 0.011),  # brow ridge
            ([(0.05, 0.11, 0.022), (0.064, 0.06, 0.02), (0.068, 0.01, 0.026), (0.062, -0.035, 0.036)], 0.005, 0.009),  # cheekbone
            ([(0.0, 0.15, 0.075), (0.0, 0.26, 0.05)], 0.0025, 0.008),  # nasal ridge
            ([(0.019, 0.27, 0.044), (0.021, 0.276, 0.045)], 0.006, 0.011),  # nostril swell
            ([(0.02, 0.278, 0.046), (0.021, 0.281, 0.045)], -0.006, 0.0045),  # nostril
            (lip, -0.003, 0.0028),  # the mouth's line
            ([(x, f, u + 0.0065) for x, f, u in lip[:-1]], 0.0012, 0.004),  # the upper lip's edge
        ]
        self.features = [([P(*q) for q in pts], h * K, w * K) for pts, h, w in feats]

    def lip_at(self, t, side=1.0):
        """A point of the lip line, t 0 at the tip to 1 at the corner (by length; past 1 a little on)."""
        L = np.array(self.lip_line)
        seg = np.linalg.norm(np.diff(L, axis=0), axis=1)
        s = np.concatenate([[0], np.cumsum(seg)])
        s /= s[-1]
        t = np.clip(t, 0, 1.4)
        q = np.stack([np.interp(t, s, L[:, j]) for j in range(3)], -1)
        over = np.maximum(t - 1, 0)
        q = q + np.multiply.outer(over, (L[-1] - L[-2]) / seg[-1] * 0.025)
        q[..., 0] *= side
        return q

    def h(self, P):
        """Points (world) in the head's frame, in units before k: (x, f, u)."""
        return self.fr.to(P) / self.k


def make_head(B, mesh, J, eye_h):
    """The human head made the dragon's (in place: `mesh` changes). Returns the design and each eye's
    final centre, turn and size."""
    fr = wd.Frame(J["Head"])
    design = HeadDesign(fr, B)
    co, cavity, contact = wd.head_warp(mesh, fr, eye_h, design)
    mesh.co = co
    mesh.v["cavity"] = cavity.astype(float)
    wd.close_mouth(mesh, fr.to(mesh.co))
    ear = mesh.v["ear"] > 0.5
    mesh.take_faces(~np.array([all(ear[v] for v in F) for F in mesh.faces]))
    for loop, fl in mesh.boundary_loops():
        if mesh.v["ear"][loop].mean() > 0.2:
            mesh.fill(loop, fl[0])
    Q = fr.to(mesh.co)
    u = Q[:, 2]
    head_w = mesh.v["W"][:, BONE_INDEX["Head"]]
    zone = np.zeros(len(Q))
    rigid, cores = [], {}
    for s_, (ed, Rm, sc, eh, rh) in design.eye_frame.items():
        d = np.linalg.norm(Q - ed, axis=1) / (sc * rh)
        zone = np.maximum(zone, 1 - smoothstep(1.9, 2.9, d))
        rigid.append((1 - smoothstep(1.6, 3.4, d), np.nonzero((d > 3.0) & (d < 3.8))[0]))
        cores[s_] = np.nonzero(d < 1.4)[0]
    corner = np.zeros(len(Q))
    for sg in (1.0, -1.0):
        lc = fr.to(design.P(sg * design.lip_line[-1][0], design.lip_line[-1][1], design.lip_line[-1][2]))
        corner = np.maximum(corner, 1 - smoothstep(0.02, 0.045, np.linalg.norm(Q - lc, axis=1)))
    throat = smoothstep(-0.025, -0.05, u) * smoothstep(0.17, 0.09, Q[:, 1])
    headz = smoothstep(0.6, 0.98, head_w)
    stick = headz * (1 - zone) * (1 - corner) * (1 - throat)
    slide = headz * (1 - zone)
    free = head_w > 0.05
    before = {s_: mesh.co[c].mean(0) for s_, c in cores.items()}
    mesh.co = wd.fit(design.shape, mesh.co, mesh.faces, stick, free, rounds=18, stiff=(120, 15), rigid=rigid)
    mesh.co = wd.settle(design.shape, mesh.co, mesh.faces, slide * 0.6, stick, rounds=4, factor=0.3)
    mesh.co = wd.unfold(mesh.co, mesh.faces, (head_w > 0.02).astype(float), passes=15)
    # The throat, from under the jaw down into the neck, smoothed into one sweep.
    Q = fr.to(mesh.co) / design.k
    th = smoothstep(-0.03, -0.06, Q[:, 2]) * smoothstep(0.2, 0.12, Q[:, 1]) * smoothstep(-0.24, -0.16, Q[:, 2]) * smoothstep(0.03, 0.3, head_w + 0.3 * mesh.v["W"][:, BONE_INDEX["neck_01"]])
    th *= Q[:, 1] > -0.03
    mesh.co = wd.smooth_region(mesh.co, mesh.faces, th, rounds=30)
    mesh.co = wd.displace(design, mesh.co, mesh.faces, headz * (1 - 0.5 * zone))
    eyes = {}
    for s_, (ed, Rm, sc, eh, rh) in design.eye_frame.items():
        moved = mesh.co[cores[s_]].mean(0) - before[s_]
        eyes[s_] = (fr.back(ed) + moved, Rm, sc * rh)
    mesh.v["headzone"] = headz
    mesh.v["eyezone"] = zone
    log(f"head: {len(mesh.co)} vertices")
    return design, eyes


# ── The stance: digitigrade legs, a longer neck ──────────────────────────────────────────────────────

THIGH, SHIN, UPPER_FOOT = 18.0, 32.0, 58.0  # degrees: thigh forward of upright, shin back, foot up from level
FOOT_STRETCH = 1.75  # the upper foot's length against the human foot's
NECK_STRETCH, NECK_TILT = 1.25, 9.0


def stretch_along(axis, k_pos, k_neg=1.0, k_x=1.0, k_perp=1.0):
    """A bone's reshaping in its rest frame: offsets along `axis` scaled by k_pos (ahead of the joint) or
    k_neg (behind it), across by k_perp, and their x by k_x."""
    a = axis / np.linalg.norm(axis)

    def f(d):
        t = d @ a
        perp = d - np.outer(t, a)
        perp[:, 0] *= k_x
        return np.outer(np.where(t > 0, t * k_pos, t * k_neg), a) + perp * k_perp

    return f


def dragon_pose(J):
    """The turns and reshaping that take the human rest to the dragon's: each leg into a digitigrade
    stance (the people's joints moved as wwblend's `digitigrade` does), the neck longer and leaning a
    little forward with the head level. Returns (turns, stretches, new joints)."""
    R = {b: np.eye(3) for b in BONE_NAMES}
    st = {}
    a, b_, g = (math.radians(v) for v in (THIGH, SHIN, UPPER_FOOT))
    for s in ("l", "r"):
        H, K, A, Bl, Bt = (J[k] for k in (f"thigh_{s}", f"calf_{s}", f"foot_{s}", f"ball_{s}", f"ball_{s}.tail"))
        t_dir = np.array([0.0, -math.sin(a), -math.cos(a)])
        s_dir = np.array([0.0, math.sin(b_), -math.cos(b_)])
        m_dir = np.array([0.0, -math.cos(g), -math.sin(g)])
        R[f"thigh_{s}"] = wa.quat_between(K - H, t_dir)
        R[f"calf_{s}"] = wa.quat_between(A - K, s_dir)
        R[f"foot_{s}"] = wa.quat_between(Bl - A, m_dir)
        R[f"ball_{s}"] = wa.quat_between(Bt - Bl, np.array([0.0, -1.0, -0.06]))
        st[f"foot_{s}"] = stretch_along(Bl - A, FOOT_STRETCH, 0.7, k_x=1.0, k_perp=1.3)
        st[f"ball_{s}"] = stretch_along(Bt - Bl, 1.0, 1.0, k_x=1.4)
    st["neck_01"] = stretch_along(J["Head"] - J["neck_01"], NECK_STRETCH, 1.0, k_perp=1.16)
    R["neck_01"] = wd.rot((1, 0, 0), NECK_TILT)
    return R, st, wd.chain_joints(J, R, st)


def pose_all(mesh, wear, extra, J):
    """Every piece into the dragon's stance (keys turned with their bones): the body, the garments, and the
    extra named points (with weights). Returns the new joints, the turns and the points."""
    R, st, J2 = dragon_pose(J)
    W = mesh.v["W"]
    mesh.co = wd.pose_points(mesh.co, W, J, J2, R, st)
    for k in list(mesh.v):
        if k.startswith("key:"):
            mesh.v[k] = wd.pose_offsets(mesh.v[k], W, R)
    for gm in wear:
        Wg = gm["W"]
        gm["co"] = wd.pose_points(gm["co"], Wg, J, J2, R, st)
        gm["keys"] = {k: wd.pose_offsets(v, Wg, R) for k, v in gm["keys"].items()}
    out = {name: wd.pose_points(p[None], w[None], J, J2, R, st)[0] for name, (p, w) in extra.items()}
    return J2, R, out


# ── Underwear: the human avatar's own garments, with a tail opening ──────────────────────────────────


def tail_notch(keep, co, J, B, g):
    """A garment's field with the tail's opening cut out of its back: an oval round the tail's root, below
    the waistband, a little wider than the root (the skin round the root is smoothed into the tail)."""
    rz = J["pelvis"][2] + TAIL_ROOT * g
    mid = (np.abs(co[:, 0]) < 0.01) & (np.abs(co[:, 2] - rz) < 0.02)
    yb = co[mid, 1].max()
    rx = TAIL_W * g * B["tail"] * 1.2
    rzr = rx * 1.18

    def hole(p):
        dz = (p[:, 2] - rz) * (rx / rzr)
        d = np.sqrt(p[:, 0] ** 2 + dz**2) - rx
        # (Only at the back: the front never comes near it.)
        return np.where(p[:, 1] > yb - 0.09, d, 0.2)

    return lambda p: wa.smin(keep(p), hole(p), 0.008)


def make_underwear(B, H, key_names, g):
    """Each underwear style a garment of its own, made by make_avatar.py's garment builder on the same
    skin (so it is the human avatar's garment, fitting the same body), the bottoms with a tail opening.
    Returns the garments (at the human rest) and their texture and normal map (None without the bake)."""
    ma = wd.ma
    Bh = B["human"]
    co, quads, W, J = H["co"], H["quads"], H["W"], H["J"]
    keys = {k: H["keys"][k] for k in key_names}
    skin = ma.Skin(co, quads.tolist(), W, keys)
    F = ma.Frame(Bh, co, J)
    specs = ma.garment_specs(Bh, F, skin)
    arms = W[:, [BONE_INDEX[f"{b}_{s}"] for b in ("upperarm", "lowerarm", "hand") for s in "lr"]].sum(1)
    base = (co, quads, wa.vertex_normals(co, quads), arms)
    wear = []
    for name in UNDERWEAR_STYLES[B["female"]]:
        spec = dict(specs[name])
        if "bottom" in name:
            spec["keep"] = tail_notch(spec["keep"], co, J, B, g)
        wear.append(ma.build_garment(name, spec, base, skin, key_names))
    ma.garment_uvs(wear, key_names)
    gatlas = gnormal = None
    if not os.environ.get("WW_NO_BAKE"):
        objs = []
        for gm in wear:
            o = garment_object(gm.name + "-bake", gm)
            a = gm.attrs
            for nm, cols in (("ww1", a[:, :3]), ("ww2", np.c_[a[:, 3:5], np.zeros(len(a))])):
                at = o.data.color_attributes.new(nm, "FLOAT_COLOR", "POINT")
                at.data.foreach_set("color", np.c_[cols, np.ones(len(cols))].astype(np.float32).ravel())
            objs.append(o)
        occ = wd_object("occluder", co, quads.tolist())
        occ.data.materials.append(bpy.data.materials.new("occluder"))
        gmaps = ma.bake_garments(objs, occ, ma.GSIZE)
        for o in objs + [occ]:
            bpy.data.objects.remove(o)
        for image in [i for i in bpy.data.images if i.name.startswith("gbake-")]:
            bpy.data.images.remove(image)
        for m in [m for m in bpy.data.materials if m.name.startswith(("gb-", "occluder"))]:
            bpy.data.materials.remove(m)
        grgb, gnmap = ma.paint_garments(wear, gmaps, F, ma.GSIZE)
        gatlas = ma.save_texture(f"{B['name']}-underwear", grgb, ma.GSIZE)
        gnormal = ma.save_texture(f"{B['name']}-underwear-normal", gnmap, ma.GSIZE, colour=False)
        log("underwear painted")
    out = []
    trim = wd.ma.PART["underwear_trim"]
    for gm in wear:
        p = gm.part
        out.append({"name": gm.name, "co": np.array(p.co), "faces": [list(f) for f in p.faces], "mat": [1 if m == trim else 0 for m in p.mat], "uv": p.uv, "W": np.array(p.weights), "keys": {k: np.array(v) for k, v in p.keys.items()}})
    return out, gatlas, gnormal


def wd_object(name, co, faces):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(np.asarray(co).tolist(), [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    return obj


def garment_object(name, gm):
    """A garment as a mesh with its texture coordinates and two material slots (cloth, trim)."""
    p = gm.part if hasattr(gm, "part") else None
    co = p.co if p is not None else gm["co"]
    faces = p.faces if p is not None else gm["faces"]
    uv = p.uv if p is not None else gm["uv"]
    trim = wd.ma.PART["underwear_trim"]
    mats = [1 if m == trim else 0 for m in p.mat] if p is not None else gm["mat"]
    obj = wd_object(name, co, [list(f) for f in faces])
    me = obj.data
    layer = me.uv_layers.new(name="UVMap")
    layer.data.foreach_set("uv", np.array([c for f in uv for c in f], dtype=np.float64).ravel())
    for nm in ("g-cloth", "g-trim"):
        me.materials.append(bpy.data.materials.get(nm) or bpy.data.materials.new(nm))
    me.polygons.foreach_set("material_index", mats)
    me.polygons.foreach_set("use_smooth", [True] * len(faces))
    me.update()
    return obj


# ── The neck, the feet and the hands ─────────────────────────────────────────────────────────────────


def sculpt_neck(mesh, J, B, g):
    """A powerful reptile's neck: deep from front to back, the throat sweeping from under the jaw down
    into the chest and the nape's muscles rising from the shoulders up under the skull's back, a little
    fuller at the sides. Returns how far each vertex moved (the `neck_slim` key takes most of it back)."""
    a = J["neck_01"]
    b = J["Head"]
    L = np.linalg.norm(b - a)
    ax = (b - a) / L
    rel = mesh.co - a
    t = (rel @ ax) / L
    r = rel - np.outer(rel @ ax, ax)
    rn = r / np.maximum(np.linalg.norm(r, axis=1, keepdims=True), 1e-9)
    front = np.clip(-rn[:, 1], 0, 1) ** 1.3
    back = np.clip(rn[:, 1], 0, 1) ** 1.6
    side = np.clip(np.abs(rn[:, 0]), 0, 1) ** 2
    k = B["neck"] * g
    # Along the neck: the throat fullest near the jaw, the nape's muscles fullest low down; both easing out
    # into the chest and shoulders below and into the head above.
    throat = smoothstep(-0.05, 0.6, t) * smoothstep(1.4, 1.0, t)
    nape = smoothstep(-0.1, 0.4, t) * smoothstep(1.25, 0.8, t)
    amount = 0.04 * k * throat * front + 0.026 * k * nape * back + 0.009 * k * throat * side
    near = (1 - mesh.v["headzone"]) * (np.abs(mesh.co[:, 0]) < 0.14) * (t > -0.15) * (t < 1.5)
    # (Kept off the shoulders where a strap crosses them.)
    near *= 1 - smoothstep(0.065, 0.11, np.abs(mesh.co[:, 0])) * smoothstep(0.35, -0.1, t)
    move = rn * (amount * near)[:, None]
    before = mesh.co.copy()
    mesh.co = mesh.co + move
    m = np.clip(near * (amount > 1e-4) * 3, 0, 1) * 0.6
    mesh.co = wd.smooth_region(mesh.co, mesh.faces, m, rounds=10)
    return mesh.co - before


# Each forward toe's shape: (length against the human toe, thickness at its root and its tip (metres, for
# the man), splay in degrees (+ towards the outside), lift in degrees). Toes 2-5 are the four forward toes,
# fanned out; the big toe is a dewclaw, raised and turned in, set back up the foot.
FWD_TOES = {2: (1.75, 0.0175, 0.0105, -16.0, -2.0), 3: (1.95, 0.019, 0.011, -4.0, -2.0), 4: (1.85, 0.018, 0.0105, 8.0, -2.0), 5: (1.5, 0.0155, 0.0095, 21.0, -1.0)}
DEWCLAW = (0.6, 0.011, 0.007, -30.0, 30.0)


def shape_feet(mesh, hp, side_sign, B, g, J):
    """A dragon's foot below the hock: four thick toes fanned out and lying flat, each a rounded tube with
    a flatter sole and knuckles, a dewclaw raised on the inside, and the heel drawn up and back into a hock.
    Returns each digit's new chain of joints (for its claw)."""
    s = "l" if side_sign > 0 else "r"
    W = mesh.v["W"]
    ball, foot = BONE_INDEX[f"ball_{s}"], BONE_INDEX[f"foot_{s}"]
    region = np.nonzero(((W[:, ball] + W[:, foot]) > 0.3) & (np.sign(mesh.co[:, 0]) == side_sign))[0]
    P = mesh.co[region]
    toes = {k: digit_chain(hp, "toe", s, k) for k in range(1, 6)}
    near = {k: nearest_on(P, L) for k, L in toes.items()}
    dist = np.stack([near[k][0] for k in range(1, 6)], 1)
    along = np.stack([near[k][1] for k in range(1, 6)], 1)
    soft = np.exp(-(((dist - dist.min(1, keepdims=True)) / 0.003) ** 2))
    soft /= soft.sum(1, keepdims=True)
    out = np.zeros_like(P)
    chains = {}
    for i, k in enumerate(range(1, 6)):
        L = toes[k]
        base = L[0]
        e = L[-1] - L[0]
        e[2] = 0.0 if k > 1 else e[2]
        e /= np.linalg.norm(e)
        length, r0, r1, splay, lift = FWD_TOES.get(k, DEWCLAW)
        r0, r1 = r0 * g, r1 * g
        sidev = np.cross(e, [0, 0, 1.0])
        sidev /= np.linalg.norm(sidev)
        R = wd.rot((0, 0, 1), side_sign * splay) @ wd.rot(sidev, lift)
        d = P - base
        t_along = d @ e
        perp = d - np.outer(t_along, e)
        tl = np.where(t_along > 0, t_along * length, t_along)
        moved = base + (np.outer(tl, e) + perp) @ R.T
        # The toe's own axis after the move, and each vertex set at the toe's radius round it: a rounded
        # tube, flatter underneath (its pads), the radius tapering to the tip and bulging at the knuckles.
        Ln = base + (np.outer((L - base) @ e * length, e) + 0.0) @ R.T
        Ln[0] = base
        at = along[:, i]
        q_d, q_t = nearest_on(moved, Ln)
        seg_pts = np.array([np.interp(q_t, np.linspace(0, 1, len(Ln)), Ln[:, j]) for j in range(3)]).T
        radial = moved - seg_pts
        rl = np.linalg.norm(radial, axis=1)
        rdir = radial / np.maximum(rl[:, None], 1e-9)
        tt = np.clip(q_t, 0, 1)
        target = r0 + (r1 - r0) * tt ** 1.2
        target *= 1 + 0.08 * np.exp(-(((tt - 0.42) / 0.07) ** 2)) + 0.07 * np.exp(-(((tt - 0.75) / 0.06) ** 2))
        down = rdir[:, 2] < 0
        shaped = seg_pts + rdir * target[:, None]
        shaped[:, 2] = np.where(down, seg_pts[:, 2] + (shaped[:, 2] - seg_pts[:, 2]) * 0.72, shaped[:, 2])
        grow = smoothstep(0.02, 0.3, at) * (q_d < 0.03)
        moved = moved + (shaped - moved) * grow[:, None]
        reach = smoothstep(-0.2, 0.15, at)
        out += soft[:, i, None] * (P + (moved - P) * reach[:, None])
        chains[k] = Ln
    mesh.co[region] = out
    # The hock: the heel drawn up and back into a ridge behind the ankle.
    A = J[f"foot_{s}"]
    fwd = (J[f"ball_{s}"] - A) / np.linalg.norm(J[f"ball_{s}"] - A)
    rel = mesh.co - A
    behind = -(rel @ fwd)
    lat = rel - np.outer(rel @ fwd, fwd)
    m = (np.sign(mesh.co[:, 0]) == side_sign) * smoothstep(0.0, 0.035, behind) * smoothstep(0.06 * g, 0.012 * g, np.linalg.norm(lat, axis=1))
    m *= W[:, foot] > 0.5
    up = np.array([0.0, 0.0, 1.0])
    mesh.co += (np.outer(m, -fwd) * 0.02 * g + np.outer(m, up) * 0.01 * g)
    return chains


# ── Hands and feet ───────────────────────────────────────────────────────────────────────────────────

def digit_chain(hp, kind, s, k):
    if kind == "toe":
        names = [f"{s}-toe-{k}-{i}" for i in (1, 2, 3, 4)] if k > 1 else [f"{s}-toe-1-{i}" for i in (1, 2, 3)]
    else:
        names = [f"{s}-finger-{k}-{i}" for i in (1, 2, 3, 4)]
    return np.array([hp[n] for n in names])


def nearest_on(P, L):
    """Each point's distance to the polyline L and how far along it (0 at its start, 1 at its end;
    below 0 before its start)."""
    seg = np.linalg.norm(np.diff(L, axis=0), axis=1)
    cum = np.concatenate([[0], np.cumsum(seg)]) / seg.sum()
    best = np.full(len(P), np.inf)
    t_out = np.zeros(len(P))
    for i in range(len(L) - 1):
        a, b = L[i], L[i + 1]
        ab = b - a
        t = np.clip(((P - a) @ ab) / (ab @ ab), 0, 1)
        d = np.linalg.norm(P - (a + t[:, None] * ab), axis=1)
        better = d < best
        best[better] = d[better]
        t_out[better] = cum[i] + (cum[i + 1] - cum[i]) * t[better]
    e = (L[1] - L[0]) / np.linalg.norm(L[1] - L[0])
    back = (P - L[0]) @ e
    t_out = np.where(back < 0, back / seg.sum(), t_out)
    return best, t_out


def shape_hands(mesh, hp, side_sign, g):
    """Clawed hands: each finger a little longer and lean, its knuckles standing out on the back of the
    hand, its last joint tapering into the claw's bed; the thumb the same. Each vertex follows its own
    finger (blended by distance, so the skin between them doesn't tear). Returns each digit's new chain
    of joints (for its claw)."""
    s = "l" if side_sign > 0 else "r"
    W = mesh.v["W"]
    region = np.nonzero((W[:, BONE_INDEX[f"hand_{s}"]] > 0.3) & (np.sign(mesh.co[:, 0]) == side_sign))[0]
    P = mesh.co[region]
    chains = {k: digit_chain(hp, "finger", s, k) for k in range(1, 6)}
    near = {k: nearest_on(P, L) for k, L in chains.items()}
    dist = np.stack([near[k][0] for k in range(1, 6)], 1)
    along = np.stack([near[k][1] for k in range(1, 6)], 1)
    soft = np.exp(-(((dist - dist.min(1, keepdims=True)) / 0.0025) ** 2))
    soft /= soft.sum(1, keepdims=True)
    # The back of the hand's way (as make_avatar finds the nails').
    across = hp[f"{s}-finger-2-1"] - hp[f"{s}-finger-5-1"]
    along_hand = hp[f"{s}-finger-3-1"] - hp[f"{s}-hand"]
    back = np.cross(across, along_hand)
    back /= np.linalg.norm(back)
    if s == "r":
        back = -back
    out = np.zeros_like(P)
    new = {}
    for i, k in enumerate(range(1, 6)):
        L = chains[k]
        base = L[0]
        seg = np.linalg.norm(np.diff(L, axis=0), axis=1)
        cum = np.concatenate([[0], np.cumsum(seg)]) / seg.sum()
        length = 1.12 if k > 1 else 1.08
        at = along[:, i]
        # Longer: each point carried out along its finger from the root by the extra length so far.
        idx = np.clip(np.searchsorted(cum, np.clip(at, 0, 1)) - 1, 0, len(L) - 2)
        dirs = (L[1:] - L[:-1]) / seg[:, None]
        extra = (length - 1) * np.clip(at, 0, 1) * seg.sum()
        moved = P + dirs[idx] * extra[:, None]
        # Knuckles: a rise on the back of the hand over each joint; the tip narrowed into the claw's bed.
        up = (P - np.array([np.interp(np.clip(at, 0, 1), cum, L[:, j]) for j in range(3)]).T) @ back
        knuck = sum(np.exp(-(((at - c) / 0.07) ** 2)) for c in cum[1:-1]) + 0.6 * np.exp(-((at / 0.08) ** 2))
        moved = moved + np.outer(knuck * np.clip(up / 0.004, 0, 1) * 0.0022 * g, back)
        tip = smoothstep(0.7, 1.0, at)
        centre = np.array([np.interp(np.clip(at, 0, 1), cum, L[:, j]) for j in range(3)]).T + dirs[idx] * extra[:, None]
        moved = centre + (moved - centre) * (1 - 0.22 * tip)[:, None]
        reach = smoothstep(-0.1, 0.15, at)
        out += soft[:, i, None] * (P + (moved - P) * reach[:, None])
        new[k] = L + np.outer((length - 1) * cum * seg.sum(), (L[-1] - L[0]) / np.linalg.norm(L[-1] - L[0]))
    mesh.co[region] = out
    return new


def claws(parts, chains, kind, B):
    """A claw from the tip of each digit, curling down (towards the ground, or the palm's side)."""
    g = B["human"]["height"] / 1.78
    for k, L in chains.items():
        e = L[-1] - L[-2]
        e /= np.linalg.norm(e)
        if kind == "toe":
            length, r, bend = (0.03 if k == 1 else 0.05 if k == 5 else 0.06) * g, (0.0075 if k == 1 else 0.0095 if k == 5 else 0.0115) * g, 1.1
        else:
            length, r, bend = (0.034 if k > 1 else 0.03) * g, 0.0058 * g, 1.05
        down = np.array([0, 0, -1.0]) - e * (-e[2])
        down /= np.linalg.norm(down)
        up = -down
        root = L[-1] - e * r * 1.6 + up * r * 0.25
        axis = np.cross(e, down)
        path = wd.bend_path(root, e + up * 0.15, length, bend, 7, bend_axis=axis)
        radii = r * (1 - np.linspace(0, 1, len(path)) ** 0.9) + 0.0005
        V, F = wd.loft(path, radii, n=7, up=up, flat=0.62)
        parts.add(V, F, HORNS, None, "claw", origin=root)


# ── The tail ─────────────────────────────────────────────────────────────────────────────────────────


def tail_path(B, root, g):
    """The tail's middle line: out of the back just above the hips, sweeping back and down to just off the
    ground, a little lift at its end."""
    t = B["tail"]
    z0 = root[2]
    pts = [root + np.array([0, -0.05, 0.02]) * g]
    for dy, dz in ((0.0, 0.0), (0.2, -0.1), (0.45, -0.34), (0.72, -0.62), (1.0, -0.82), (1.28, -0.93), (1.52, -0.95), (1.7, -0.93)):
        dz = max(dz * g, 0.08 - z0)
        pts.append(root + np.array([0, dy * g * t, dz]))
    return wd.spline(pts, 40)


def make_tail(B, mesh, J, g):
    """The tail: rings along its middle line, joined to the body round a hole cut where it comes out.
    Returns the tail's vertex ids in the mesh, its middle line and its half widths and heights."""
    bvh = BVHTree.FromPolygons(mesh.co.tolist(), mesh.faces)
    z = J["pelvis"][2] + TAIL_ROOT * g
    hit = bvh.ray_cast(Vector((0, -0.02, z)), Vector((0, 1, -0.1)).normalized(), 1.0)
    root = np.array(hit[0])
    line = tail_path(B, root, g)[1:]
    n = 16
    s = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(line, axis=0), axis=1))])
    u = s / s[-1]
    tg = B["tail"] * g
    w = np.interp(u, [0, 0.08, 0.3, 0.6, 0.85, 1.0], [TAIL_W, 0.062, 0.05, 0.034, 0.018, 0.004]) * tg
    h = np.interp(u, [0, 0.08, 0.3, 0.6, 0.85, 1.0], [TAIL_W * 1.15, 0.07, 0.055, 0.036, 0.019, 0.004]) * tg
    T, U = wd.frame_along(line, (0, 0, 1))
    Sd = np.cross(T, U)
    d0 = T[0]
    C = np.array([mesh.co[f].mean(0) for f in mesh.faces])
    rel = C - line[0]
    depth = rel @ d0
    cs, cu = rel @ Sd[0], rel @ U[0]
    inside = ((cs / w[0]) ** 2 + (cu / h[0]) ** 2 < 1.0) & (np.abs(depth) < 0.08) & (C[:, 1] > 0)
    mesh.take_faces(~inside)
    loops = mesh.boundary_loops()
    loop, lf = min(loops, key=lambda lp: np.linalg.norm(mesh.co[lp[0]].mean(0) - line[0]))
    loop = list(loop)
    nb = len(mesh.co)
    co = []
    for i in range(len(line)):
        for j in range(n):
            a = 2 * math.pi * j / n
            co.append(line[i] + Sd[i] * math.cos(a) * w[i] + U[i] * math.sin(a) * h[i])
    co.append(line[-1] + T[-1] * 0.004)
    co = np.array(co)
    near = np.array([loop[int(np.argmin(np.linalg.norm(mesh.co[loop] - p, axis=1)))] for p in co])
    ids = mesh.add_verts(co, near[:, None], np.ones((len(co), 1)))
    rings = ids[:-1].reshape(len(line), n)
    tip = ids[-1]
    # (The rings turn the way the hole's loop does, so the faces between join without crossing.)
    Lp = mesh.co[loop] - line[0]
    sense = np.sign(np.sum(np.cross(Lp, np.roll(Lp, -1, axis=0)) @ d0))
    rp = co[:n] - line[0]
    if np.sign(np.sum(np.cross(rp, np.roll(rp, -1, axis=0)) @ d0)) != sense:
        rings = rings[:, ::-1]
    faces = []
    for i in range(len(line) - 1):
        for j in range(n):
            faces.append([rings[i, j], rings[i, (j + 1) % n], rings[i + 1, (j + 1) % n], rings[i + 1, j]])
    for j in range(n):
        faces.append([rings[-1, j], rings[-1, (j + 1) % n], tip])
    ang_l = np.arctan2(Lp @ U[0], Lp @ Sd[0])
    r0 = mesh.co[rings[0]] - line[0]
    ang_r = np.arctan2(r0 @ U[0], r0 @ Sd[0])
    start_l = int(np.argmin(np.abs(ang_l)))
    start_r = int(np.argmin(np.abs(ang_r)))
    Lo = loop[start_l:] + loop[:start_l] + [loop[start_l]]
    Ro = list(rings[0][start_r:]) + list(rings[0][:start_r]) + [rings[0][start_r]]
    sl, sr = np.linspace(0, 1, len(Lo)), np.linspace(0, 1, len(Ro))
    i = j = 0
    while i < len(Lo) - 1 or j < len(Ro) - 1:
        if j >= len(Ro) - 1 or (i < len(Lo) - 1 and sl[i + 1] <= sr[j + 1]):
            faces.append([Lo[i], Lo[i + 1], Ro[j]])
            i += 1
        else:
            faces.append([Lo[i], Ro[j + 1], Ro[j]])
            j += 1
    mesh.add_faces(faces, [lf[0]] * len(faces))
    # Smoothed round the join.
    E = wd.edges_of(mesh.faces)
    m = np.zeros(len(mesh.co))
    m[loop] = 1.0
    m[rings[0]] = 1.0
    m[rings[1]] = 0.5
    dj = np.linalg.norm(mesh.co - line[0], axis=1)
    m = np.maximum(m, (1 - smoothstep(w[0] * 1.0, w[0] * 1.7, dj)) * 0.6 * (mesh.co[:, 1] > 0.0))
    a_, b_ = np.concatenate([E[:, 0], E[:, 1]]), np.concatenate([E[:, 1], E[:, 0]])
    deg = np.maximum(np.bincount(a_, minlength=len(mesh.co)), 1)[:, None]
    for _ in range(6):
        avg = np.stack([np.bincount(a_, weights=mesh.co[b_, k], minlength=len(mesh.co)) for k in range(3)], 1) / deg
        mesh.co += (avg - mesh.co) * (0.5 * m)[:, None]
    tail_u = np.full(len(mesh.co), -1.0)
    tail_u[rings.ravel()] = np.repeat(u, n)
    tail_u[tip] = 1.0
    mesh.v["tail_u"] = tail_u
    log(f"tail: {len(ids)} vertices, a hole of {len(loop)}")
    return line, (w, h), rings


# ── Wings: folded on the upper back ──────────────────────────────────────────────────────────────────


def on_skin(bvh, inside, direction, reach=0.5):
    d = Vector(np.asarray(direction, dtype=np.float64)).normalized()
    hit = bvh.ray_cast(Vector(np.asarray(inside, dtype=np.float64)), d, reach)
    if hit[0] is None:
        hit = bvh.find_nearest(Vector(np.asarray(inside, dtype=np.float64)))
    return np.array(hit[0]), np.array(hit[1])


def wing_joints(bvh, J, B, g):
    """The left wing's joints, folded: its shoulder on the back over the shoulder blade, the elbow a
    little out and back, the wrist high behind the shoulder, three fingers hanging from it down past the
    hips; and where its membrane meets the back low down."""
    wg = g * B["wing"]
    zs = J["upperarm_l"][2]
    s0, _ = on_skin(bvh, np.array([0.075 * g, 0.02, zs - 0.06 * g]), (0.25, 1, 0.05))
    s0 = s0 + np.array([0, -0.015, 0])
    E = s0 + np.array([0.08, 0.11, -0.03]) * wg
    Wr = s0 + np.array([0.19, 0.31, 0.21]) * wg
    tips = [Wr + np.array([-0.1, 0.02, -1.08]) * wg, Wr + np.array([-0.07, 0.1, -0.98]) * wg, Wr + np.array([-0.04, 0.17, -0.8]) * wg]
    low, _ = on_skin(bvh, np.array([0.09 * g, 0.03, J["pelvis"][2] + 0.2 * g]), (0.3, 1, 0))
    low = low + np.array([0, -0.01, 0])
    return {"s0": s0, "E": E, "W": Wr, "tips": tips, "low": low, "wg": wg}


def make_wings(WJ):
    """Both wings: bones as tubes (the arm, three fingers), a claw on the wrist, and the membrane in three
    panels (between the fingers, and from the last finger to the arm and the back), a thin sheet with an
    outer side (scales) and an inner side (scales2), billowing a little where it's folded. Returns
    (V, F, materials per face, weights per vertex as {bone: w})."""
    s0, E, Wr, tips, low, wg = WJ["s0"], WJ["E"], WJ["W"], WJ["tips"], WJ["low"], WJ["wg"]
    out = np.array([0.45, 1.0, 0.0])
    out /= np.linalg.norm(out)
    V, F, M, Wt = [], [], [], []

    def add(vs, fs, mat, weights):
        off = len(V)
        V.extend(vs)
        F.extend([[i + off for i in f] for f in fs])
        M.extend([mat] * len(fs))
        Wt.extend(weights)

    def finger_curve(tip, bow):
        return lambda s: Wr + (tip - Wr) * s + out * bow * math.sin(math.pi * s) * wg

    fingers = [finger_curve(t, b) for t, b in zip(tips, (0.025, 0.035, 0.04))]
    edge_pts = np.array([Wr, E, s0, low])
    seg = np.linalg.norm(np.diff(edge_pts, axis=0), axis=1)
    cum = np.concatenate([[0], np.cumsum(seg)]) / seg.sum()

    def arm_edge(s):
        i = min(int(np.searchsorted(cum, s, side="right")) - 1, 2)
        t = (s - cum[i]) / (cum[i + 1] - cum[i])
        return edge_pts[i] + (edge_pts[i + 1] - edge_pts[i]) * t

    def arm_bone(s):
        if s < cum[1]:
            return {"wing_02_l": 1.0}
        if s < cum[2]:
            t = (s - cum[1]) / (cum[2] - cum[1])
            return {"wing_02_l": max(0.0, 1 - 2 * t), "wing_01_l": min(1.0, 2 * t)} if t < 0.5 else {"wing_01_l": 1.0}
        t = (s - cum[2]) / (cum[3] - cum[2])
        return {"spine_03": 1 - t, "spine_02": t}

    panels = [
        (fingers[0], fingers[1], lambda s: {"wing_f1_l": 1.0}, lambda s: {"wing_f2_l": 1.0}, 0.2),
        (fingers[1], fingers[2], lambda s: {"wing_f2_l": 1.0}, lambda s: {"wing_f3_l": 1.0}, 0.2),
        (fingers[2], arm_edge, lambda s: {"wing_f3_l": 1.0}, arm_bone, 0.12),
    ]
    NS, NT = 16, 6
    th = 0.0018 * wg
    for ca, cb, wa_, wb_, billow in panels:
        grid = np.zeros((NS + 1, NT + 1, 3))
        wts = []
        for i in range(NS + 1):
            s = i / NS
            row = []
            for j in range(NT + 1):
                t = j / NT
                ss = s * (1 - 0.1 * math.sin(math.pi * t) * s**3)
                a, b = ca(ss), cb(ss)
                grid[i, j] = a + (b - a) * t + out * billow * np.linalg.norm(b - a) * math.sin(math.pi * t) * (0.4 + 0.6 * math.sin(math.pi * min(1, ss * 1.15)))
                w = {}
                for bone, val in wa_(ss).items():
                    w[bone] = w.get(bone, 0) + val * (1 - t)
                for bone, val in wb_(ss).items():
                    w[bone] = w.get(bone, 0) + val * t
                near = max(0.0, 1 - ss / 0.12)
                w = {k_: v * (1 - near) for k_, v in w.items()}
                w["wing_02_l"] = w.get("wing_02_l", 0) + near
                row.append(w)
            wts.append(row)
        du = np.gradient(grid, axis=0)
        dv = np.gradient(grid, axis=1)
        nrm = np.cross(du, dv)
        nrm /= np.maximum(np.linalg.norm(nrm, axis=2, keepdims=True), 1e-9)
        if np.sum(nrm * out) < 0:
            nrm = -nrm
        n = (NS + 1) * (NT + 1)
        outer = (grid + nrm * th).reshape(-1, 3)
        inner = (grid - nrm * th).reshape(-1, 3)
        flat_w = [wts[i][j] for i in range(NS + 1) for j in range(NT + 1)]
        idx = lambda i, j: i * (NT + 1) + j  # noqa: E731
        fo, fi = [], []
        for i in range(NS):
            for j in range(NT):
                q = [idx(i, j), idx(i + 1, j), idx(i + 1, j + 1), idx(i, j + 1)]
                fo.append(q)
                fi.append([v + n for v in reversed(q)])
        a, b, c = outer[fo[0][0]], outer[fo[0][1]], outer[fo[0][2]]
        if np.dot(np.cross(b - a, c - a), out) < 0:
            fo = [list(reversed(q)) for q in fo]
            fi = [list(reversed(q)) for q in fi]
        rim = []
        for j in range(NT):
            a0, a1 = idx(NS, j), idx(NS, j + 1)
            rim.append([a0, a1, a1 + n, a0 + n])
        off = len(V)
        V.extend(list(outer) + list(inner))
        Wt.extend(flat_w + flat_w)
        F.extend([[v + off for v in q] for q in fo])
        M.extend([SCALES] * len(fo))
        F.extend([[v + off for v in q] for q in fi])
        M.extend([SCALES2] * len(fi))
        F.extend([[v + off for v in q] for q in rim])
        M.extend([SCALES] * len(rim))
    # The bones under the skin: the arm, thick; the fingers, thin, along the panels' edges.
    arm = wd.spline([s0 + np.array([-0.025, -0.012, 0.0]), E, Wr], 14)
    radii = np.interp(np.linspace(0, 1, 14), [0, 0.35, 0.6, 1.0], [0.032, 0.025, 0.02, 0.021]) * wg
    weights = []
    for i in range(14):
        u = i / 13
        weights += [{"wing_01_l": 1.0}] if u < 0.3 else ([{"wing_01_l": 1 - (u - 0.3) / 0.1, "wing_02_l": (u - 0.3) / 0.1}] if u < 0.4 else [{"wing_02_l": 1.0}])
    cap = Wr + (Wr - E) / np.linalg.norm(Wr - E) * 0.022 * wg
    vs, fs = wd.loft(np.vstack([arm, cap]), np.append(radii, 0.0), n=10, up=out)
    ring_w = []
    for i in range(14):
        ring_w += [weights[i]] * 10
    ring_w += [weights[-1], weights[0]]
    add(vs, fs, SCALES, ring_w)
    for fi_, (c, bone) in enumerate(zip(fingers, ("wing_f1_l", "wing_f2_l", "wing_f3_l"))):
        pts = np.array([c(s) for s in np.linspace(0, 1, 14)])
        r = (0.01 - 0.0015 * fi_) * wg * (1 - np.linspace(0, 1, 14) * 0.75)
        vs, fs = wd.loft(pts, r, n=8, up=out)
        ws = []
        for i in range(len(vs)):
            ring = min(i // 8, 13)
            near = max(0.0, 1 - ring / 13 / 0.1)
            ws.append({bone: 1 - near, "wing_02_l": near} if near > 0 else {bone: 1.0})
        add(vs, fs, SCALES, ws)
    # The wrist's claw, hooked up and back.
    path = wd.bend_path(Wr + np.array([0, 0, 0.014]) * wg, np.array([0.1, 0.35, 1.0]), 0.07 * wg, 0.9, 6, bend_axis=(-1, 0, 0))
    radii = 0.01 * wg * (1 - np.linspace(0, 1, len(path)) ** 0.9) + 0.0008
    vs, fs = wd.loft(path, radii, n=8, up=out, flat=0.6)
    add(vs, fs, HORNS, [{"wing_02_l": 1.0}] * len(vs))
    # And the right wing, mirrored.
    n = len(V)
    V += [np.array([-v[0], v[1], v[2]]) for v in V[:n]]
    F += [[i + n for i in reversed(f)] for f in F[: len(F)]]
    M += list(M)
    Wt += [{(b[:-2] + "_r" if b.endswith("_l") else b): w for b, w in wt.items()} for wt in Wt[:n]]
    return np.array(V), F, M, Wt


# ── Hard parts on the head: eyes, teeth, horns, frill ────────────────────────────────────────────────


def make_eyes(parts, eyes, shift):
    """Each eye a ball: its front an iris (with a slit pupil painted on), the rest dark."""
    for s_, (c, Rm, r) in eyes.items():
        gaze_h = Rm @ np.array([0.0, 1.0, 0.0])
        gaze = np.array([gaze_h[0], -gaze_h[1], gaze_h[2]])
        V, F = wd.uv_sphere(c + shift, r * 0.97, 24, 16, axis=gaze)
        V = np.array(V)
        mats = []
        for f in F:
            d = V[f].mean(0) - (c + shift)
            mats.append(IRIS if d @ gaze / np.linalg.norm(d) > math.cos(math.radians(62)) else EYE_WHITE)
        parts.add(V, F, IRIS, "Head", "eye", origin=c + shift)
        parts.mat[len(parts.mat) - len(F):] = mats
        parts.eye_axes = getattr(parts, "eye_axes", {})
        parts.eye_axes[s_] = (c + shift, gaze, r)


def surface_point(bvh, design, shift, x, f, u, out_dir):
    """The skin of the head at a design point, found by casting from inside along `out_dir` (head
    frame)."""
    inside = design.P(x * 0.4, f, u * 0.6) + shift
    target = design.P(x, f, u) + shift
    d = target - inside
    p, n = on_skin(bvh, inside, d, 0.4)
    return p, n


# Upper teeth along the lip line: (where, 0 at the tip to 1 at the corner; length below the lip; root
# radius). The fourth is the long fang.
TEETH_ROW = [(0.05, 0.009, 0.003), (0.12, 0.007, 0.0027), (0.2, 0.012, 0.0034), (0.27, 0.023, 0.0042), (0.36, 0.008, 0.0028), (0.45, 0.011, 0.0032), (0.54, 0.008, 0.0028), (0.63, 0.0095, 0.003), (0.72, 0.0065, 0.0025), (0.81, 0.0055, 0.0023)]


def make_teeth(parts, bvh, design, shift, B):
    """Teeth along the mouth's line: a row hanging from the upper lip over the lower jaw with a long fang
    a side, and a lower fang a side rising outside the upper lip."""
    K = design.k
    for side in (1.0, -1.0):
        for t, length, r in TEETH_ROW:
            q = design.lip_at(t, side)
            p_d = design.P(*q) + shift
            p, n = on_skin(bvh, p_d - (p_d - (design.P(0, q[1], q[2]) + shift)) * 0.5, p_d - (design.P(0, q[1], q[2]) + shift), 0.2)
            length, r = length * K, r * K
            up = np.array([0, 0, 1.0])
            root = p + up * 0.005 * K - n * 0.0035 * K
            tip = p - up * length + n * 0.0012 * K + np.array([0, 0.0015, 0]) * K
            mid = (root + tip) / 2 + n * 0.0009 * K
            V, F = wd.loft([root, mid, tip], [r, r * 0.82, 0.0], n=6, up=(0, -1, 0), flat=0.75)
            parts.add(V, F, TEETH, "Head", "tooth", origin=root)
        q = design.lip_at(0.17, side)
        p_d = design.P(*q) + shift
        p, n = on_skin(bvh, p_d + (p_d - (design.P(0, q[1], q[2]) + shift)) * -0.5, p_d - (design.P(0, q[1], q[2]) + shift), 0.2)
        root = p - np.array([0, 0, 0.008]) * K - n * 0.003 * K
        tip = p + np.array([0, 0, 0.011]) * K + n * 0.0016 * K
        V, F = wd.loft([root, (root + tip) / 2 + n * 0.0007 * K, tip], [0.003 * K, 0.0024 * K, 0.0], n=6, up=(0, -1, 0), flat=0.75)
        parts.add(V, F, TEETH, "Head", "tooth", origin=root)


def HD(design, x, f, u):
    """A direction in the head's frame, as a world vector."""
    v = np.array([x, -f, u], dtype=np.float64)
    return v / np.linalg.norm(v)


def make_horns(parts, bvh, design, shift, B):
    """Two great horns swept back from behind the brow, curling up at their ends and ridged; a smaller
    pair under them; short spikes off each brow; and a frill of flat spines down the back of the jaw."""
    K = design.k
    hk = K * B["horns"]
    for side in (1.0, -1.0):
        def put(x, f, u, d, length, r, bend, n, flat, rings, wobble=None, sink=0.012, bend_axis=(1, 0, 0)):
            base, nrm = surface_point(bvh, design, shift, side * x, f, u, None)
            b0 = base - nrm * sink * K
            dd = HD(design, side * d[0], d[1], d[2])
            path = wd.bend_path(b0, dd, length + sink * K, bend, rings, bend_axis=bend_axis)
            radii = r * (1 - np.linspace(0, 1, len(path)) ** 0.9) + 0.0008
            V, F = wd.loft(path, radii, n=n, up=(0, 0, 1), flat=flat, wobble=wobble)
            parts.add(V, F, HORNS, "Head", "horn", origin=b0)

        ridges = lambda u: 1 + 0.05 * math.sin(u * 2 * math.pi * 8) * (1 - u)  # noqa: E731
        put(0.04, -0.005, 0.098, (0.32, -1.0, 0.16), 0.32 * hk, 0.024 * hk, 0.55, 12, 0.88, 16, ridges, 0.014)
        put(0.06, -0.045, 0.07, (0.5, -1.0, -0.05), 0.15 * hk, 0.013 * hk, 0.45, 8, 0.8, 9, ridges)
        put(0.066, 0.045, 0.09, (0.45, -1.0, 0.45), 0.045 * hk, 0.0075 * hk, 0.3, 6, 0.8, 5)
        put(0.06, 0.012, 0.095, (0.4, -1.0, 0.5), 0.05 * hk, 0.008 * hk, 0.3, 6, 0.8, 5)
        for (x, f, u), d, length, r in (
            ((0.068, 0.01, 0.02), (0.35, -1.0, -0.12), 0.07, 0.012),
            ((0.066, -0.025, 0.0), (0.35, -1.0, -0.25), 0.085, 0.013),
            ((0.06, -0.045, -0.028), (0.3, -1.0, -0.3), 0.065, 0.011),
        ):
            put(x, f, u, d, length * hk, r * hk, 0.35, 6, 0.35, 6)


def make_crest(parts, bvh, mesh, J, design, shift, tail_line, tail_wh, B, g, clear=None):
    """A row of spines down the middle of the back: from the back of the skull, down the neck, between
    the wings to the hips and along the top of the tail, smaller towards its tip."""
    pts = []
    for t in np.linspace(0.0, 1.0, 4):
        f = -0.065 - 0.035 * t
        pts.append((design.P(0, f * 0.5, 0.04) + shift, HD(design, 0, -0.5 - t, 1.0 - 0.6 * t), (0.04 + 0.015 * t) * design.k))
    nk0, nk1 = J["neck_01"], J["Head"]
    for t in np.linspace(0.15, 0.95, 4):
        c = nk1 + (nk0 - nk1) * t
        pts.append((c, np.array([0, 1.0, 0.35]), 0.055 * g))
    z0, z1 = J["neck_01"][2] - 0.05, J["pelvis"][2] + 0.12
    for z in np.linspace(z0, z1, 8):
        pts.append((np.array([0, 0.0, z]), np.array([0, 1.0, 0.0]), 0.045 * g))
    tw, thh = tail_wh
    for i in range(3, 36, 3):
        c = tail_line[i]
        tang = tail_line[min(i + 1, len(tail_line) - 1)] - tail_line[i - 1]
        tang /= np.linalg.norm(tang)
        upv = np.array([0, 0, 1.0]) - tang * tang[2]
        upv /= np.linalg.norm(upv)
        pts.append((c, upv, 0.85 * thh[i] + 0.012 * g))
    back = np.array([0, 1.0, -0.15])
    for idx, (inside, d, height) in enumerate(pts):
        # (Found from outside, so the first skin met is the back's.)
        d = np.asarray(d, dtype=np.float64) / np.linalg.norm(d)
        s, nrm = on_skin(bvh, inside + d * 0.5, -d, 0.6)
        # (None where any of the underwear lies: a spine would poke through it.)
        if clear is not None and clear.find(Vector(s))[2] < 0.03 * g:
            continue
        tipdir = nrm + back * 0.9
        tipdir /= np.linalg.norm(tipdir)
        h = height * (0.85 + 0.15 * (idx % 2))
        root = s - nrm * 0.01 * g
        path = wd.bend_path(root, tipdir, h + 0.01 * g, 0.35, 6, bend_axis=(-1, 0, 0))
        radii = (0.38 * h + 0.005) * (1 - np.linspace(0, 1, len(path)) ** 1.2) + 0.0008
        V, F = wd.loft(path, radii, n=6, up=back, flat=0.26)
        parts.add(V, F, HORNS, None, "spine", origin=root)


# ── Belly plates ─────────────────────────────────────────────────────────────────────────────────────


def front_line(bvh, J, design, shift, B, g):
    """The middle of the front, on the skin, from the groin up the belly, chest and throat and under the
    jaw to the chin: points, the plates' count along it (bigger plates on the belly, smaller up the
    throat and under the jaw), how wide the plated strip is at each, and the skin's normal there."""
    fem = B["female"]
    zc = J["thigh_l"][2] - 0.05 * g
    zs = J["upperarm_l"][2]
    pts, size, width = [], [], []
    # (Each found from outside, in front or below, so the first skin met is the front's.)
    for z in np.linspace(zc, zs + 0.02 * g, 20):
        p, _ = on_skin(bvh, np.array([0, -0.6, z]), (0, 1, 0), 1.0)
        pts.append(p)
        u = (z - zc) / (zs - zc)
        size.append(0.046 * g)
        width.append(np.interp(u, [0, 0.12, 0.45, 0.8, 1.0], [0.045, 0.075, 0.09, 0.06 if fem else 0.095, 0.07]) * g)
    # The throat: straight in from the front, from the base of the neck up to just under the jaw's back.
    z_jaw = (design.P(0, 0.06, -0.075) + shift)[2]
    z0n = zs + 0.02 * g
    for t in np.linspace(0.0, 1.0, 7)[1:]:
        p, _ = on_skin(bvh, np.array([0, -0.6, z0n + (z_jaw - z0n) * t]), (0, 1, 0), 1.0)
        pts.append(p)
        size.append(np.interp(t, [0, 1], [0.04, 0.032]) * g)
        width.append(np.interp(t, [0, 1], [0.06, 0.045]) * g)
    K = design.k
    for f in np.linspace(0.1, 0.25, 7):
        p, _ = on_skin(bvh, design.P(0, f, -0.02) + shift - np.array([0, 0, 0.3]), (0, 0, 1), 0.4)
        pts.append(p)
        size.append(0.022 * K)
        width.append(np.interp(f, [0.1, 0.15, 0.25], [0.04, 0.034, 0.016]) * K)
    pts = np.array(pts)
    s = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(pts, axis=0), axis=1))])
    s /= s[-1]
    fine = wd.spline(pts, 140)
    sf = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(fine, axis=0), axis=1))])
    sf /= sf[-1]
    size = np.interp(sf, s, size)
    width = np.interp(sf, s, width)
    nrm = np.array([bvh.find_nearest(Vector(p))[1] for p in fine])
    ds = np.linalg.norm(np.diff(fine, axis=0), axis=1)
    count = np.concatenate([[0], np.cumsum(ds / ((size[:-1] + size[1:]) / 2))])
    depth = 0.04 * g
    inner = wd.spline(fine - nrm * depth, 140)
    return inner, count, width, nrm, fine


def plate_field(line, count, width, nrm, surf):
    """g(P) below 0 inside the plated strip: within its width across and in front of the line inside the
    body (never on the back), not past either end."""
    # (Its ends' directions over a few points: the first two can turn back on each other.)
    t0 = (line[6] - line[0]) / np.linalg.norm(line[6] - line[0])
    t1 = (line[-1] - line[-7]) / np.linalg.norm(line[-1] - line[-7])

    def g(P):
        idx, _d = wd.polyline_param(P, line, np.arange(len(line), dtype=np.float64))
        i0 = np.clip(np.floor(idx).astype(int), 0, len(line) - 2)
        t = (idx - i0)[:, None]
        L = line[i0] * (1 - t) + line[i0 + 1] * t
        n = nrm[i0] * (1 - t) + nrm[i0 + 1] * t
        w = width[i0] * (1 - t[:, 0]) + width[i0 + 1] * t[:, 0]
        ahead = np.sum((P - L) * n, axis=1)
        past = np.maximum(-((P - line[0]) @ t0) - 0.005, (P - line[-1]) @ t1 - 0.005)
        # (Nowhere behind the line on the skin: the nape is near the line's part under the jaw, but behind it.)
        ys, _ = wd.polyline_param(P, surf, surf[:, 1])
        behind = P[:, 1] - ys - 0.03
        return np.maximum(np.maximum(np.maximum(np.abs(P[:, 0]) - w, -ahead), past), behind)

    def plate(P):
        c, _ = wd.polyline_param(P, line, count)
        return c

    return g, plate


# ── Putting it together ──────────────────────────────────────────────────────────────────────────────

TAIL_ROOT = -0.012  # how far above the pelvis joint the tail comes out (metres, for the man)
TAIL_W = 0.058  # the tail's half width where it comes out
TAIL_AT = (0.03, 0.15, 0.3, 0.48, 0.68)  # where along the tail each tail bone starts


def tail_weights(u):
    """Each tail vertex's weights over pelvis and tail_01..05, from how far along the tail it is."""
    heads = list(TAIL_AT) + [1.0]
    mids = [(heads[i] + heads[i + 1]) / 2 for i in range(5)]
    out = np.zeros((len(u), 6))
    for i, m in enumerate(mids):
        lo = mids[i - 1] if i > 0 else heads[0] - 0.03
        hi = mids[i + 1] if i < 4 else 1.5
        rise = np.clip((u - lo) / (m - lo), 0, 1)
        fall = np.clip((hi - u) / (hi - m), 0, 1)
        out[:, i + 1] = np.where(u < m, rise, fall)
    out[:, 0] = np.clip(1 - u / heads[0], 0, 1)
    return out / np.maximum(out.sum(1, keepdims=True), 1e-9)


ALL = [b for b, _ in wd.ALL_BONES]
ALL_INDEX = {b: i for i, b in enumerate(ALL)}


def widen(W):
    """People's-bone weights (n, 22) to all bones' (n, 32)."""
    out = np.zeros((len(W), len(ALL)))
    for i, b in enumerate(BONE_NAMES):
        out[:, ALL_INDEX[b]] = W[:, i]
    return out


def ride(Vp, origins, skin, values):
    """Each part vertex takes the value of the skin vertex nearest its part's root."""
    tree = KDTree(len(skin))
    for i, p in enumerate(skin):
        tree.insert(p, i)
    tree.balance()
    roots = np.array(origins)
    uniq, inv = np.unique(np.round(roots, 6), axis=0, return_inverse=True)
    near = np.array([tree.find(p)[1] for p in uniq])[inv.ravel()]
    return values[near]


def dragon_keys(B, design, shift, eyes_parts, co, headz, eyez, tail_u, tail_c, tail_line, normals):
    """The dragon's own keys over the body's vertices, each with its opposite where a slider runs both
    ways: jaw (heavier), cheeks, eyes (bigger), muzzle (longer) and muzzle_short, horns and horns_small
    (the horns' own; nothing on the skin), tail (thicker), tail_long and tail_short."""
    K = design.k
    q = design.h(co - shift)
    x, f, u = np.abs(q[:, 0]), q[:, 1], q[:, 2]
    keys = {}
    jaw = headz * smoothstep(0.004, -0.022, u) * smoothstep(-0.04, 0.02, f)
    keys["jaw"] = normals * (0.006 * K * jaw)[:, None] + np.outer(jaw * 0.007 * K * smoothstep(0.03, 0.25, f), [0, 0, -1.0])
    cheek = headz * np.exp(-(((x - 0.064) / 0.022) ** 2 + ((f - 0.035) / 0.04) ** 2 + ((u - 0.02) / 0.025) ** 2))
    keys["cheeks"] = normals * (0.008 * K * cheek)[:, None]
    eye_off = np.zeros_like(co)
    for s_, (c, gaze, r) in eyes_parts.items():
        near = np.linalg.norm(co - c, axis=1) < 3.2 * r
        side = np.sign(co[:, 0]) == np.sign(c[0])
        m = eyez * near * side
        eye_off += (co - c) * (0.16 * m)[:, None]
    keys["eyes"] = eye_off
    muz = headz * smoothstep(0.1, 0.29, f)
    keys["muzzle"] = np.outer(muz * 0.06 * K * B["muzzle"], [0, -1.0, 0])
    keys["muzzle_short"] = np.outer(muz * 0.042 * K * B["muzzle"], [0, 1.0, 0])
    keys["horns"] = np.zeros_like(co)
    keys["horns_small"] = np.zeros_like(co)
    tm = (tail_u >= 0) * smoothstep(0.0, 0.12, np.maximum(tail_u, 0))
    keys["tail"] = (co - tail_c) * (0.25 * tm)[:, None]
    # Length: each ring carried along the tail's line (past its tip, straight on), the root kept.
    s = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(tail_line, axis=0), axis=1))])
    s /= s[-1]
    end = (tail_line[-1] - tail_line[-2]) / np.linalg.norm(tail_line[-1] - tail_line[-2])
    total = np.linalg.norm(np.diff(tail_line, axis=0), axis=1).sum()

    def along(t):
        t = np.asarray(t)
        p = np.stack([np.interp(np.clip(t, 0, 1), s, tail_line[:, j]) for j in range(3)], 1)
        return p + np.outer(np.maximum(t - 1, 0) * total, end)

    on = tail_u >= 0
    t0 = 0.06
    for name, k in (("tail_long", 1.3), ("tail_short", 0.72)):
        d = np.zeros_like(co)
        t = tail_u[on]
        t2 = np.where(t > t0, t0 + (t - t0) * k, t)
        d[on] = along(t2) - along(t)
        keys[name] = d
    return keys


def build(B):
    ww.reset()
    g = B["human"]["height"] / 1.78
    H = wd.human(B["human"])
    co, quads, W, J, keys = H["co"], H["quads"], H["W"], H["J"], H["keys"]
    key_names = list(keys)
    # The underwear: the human avatar's garments on the same skin, at its rest.
    wear, gatlas, gnormal = make_underwear(B, H, key_names, g)
    # The head subdivided once (Catmull-Clark), then made the dragon's.
    sel = W[:, BONE_INDEX["Head"]] > 0.9
    apply, faces, corners = wa.subdivide_region(co, quads, sel[quads].all(1))
    src = np.array([f for f, _ in corners])
    v = {"W": wd.limit_weights(apply(W)), "ear": apply(H["ear"])}
    for k in key_names:
        v["key:" + k] = apply(keys[k])
    # (MakeHuman's own texture coordinates kept for the body, so its few seams are the body's.)
    base = H["base"]
    uv_q = base.uv[base.quad_uv[H["bf"]]]
    uv = np.empty(len(faces), dtype=object)
    for i, (f, ws) in enumerate(corners):
        uv[i] = np.array([w @ uv_q[f] for w in ws])
    mesh = wd.Mesh(apply(co), faces, v, {"mouth": H["mouth"][src], "lips": H["lips"][src], "uv": uv})
    design, eyes = make_head(B, mesh, J, H["eye"])
    # The stance (the human legs skinned onto the moved joints), carrying the fingers' and toes' joints.
    extra = {}
    for name, p in H["helper"].items():
        if "finger" in name or "toe" in name or name.endswith("-hand"):
            d = np.linalg.norm(co - p, axis=1)
            extra[name] = (p, W[np.argsort(d)[:4]].mean(0))
    J2, R, hp = pose_all(mesh, wear, extra, J)
    shift = J2["Head"] - J["Head"]
    mesh.v["thick"] = sculpt_neck(mesh, J2, B, g)
    parts = wd.Parts()
    for side in (1.0, -1.0):
        toes = shape_feet(mesh, hp, side, B, g, J2)
        fingers = shape_hands(mesh, hp, side, g)
        claws(parts, toes, "toe", B)
        claws(parts, fingers, "finger", B)
    # Standing on the ground.
    dz = -mesh.co[:, 2].min()
    up = np.array([0, 0, dz])
    mesh.co += up
    for gm in wear:
        gm["co"] = gm["co"] + up
    J2 = {k: p + up for k, p in J2.items()}
    shift = shift + up
    parts.V = [p + up for p in parts.V]
    parts.origin = [p + up for p in parts.origin]
    log(f"standing: raised {dz:.3f} m, the head joint at {J2['Head'][2]:.3f} m")
    # The tail, joined to the body.
    tail_line, tail_wh, rings = make_tail(B, mesh, J2, g)
    nb = len(mesh.co)
    bvh = BVHTree.FromPolygons(mesh.co.tolist(), mesh.faces)
    # Hard parts.
    make_eyes(parts, eyes, shift)
    make_teeth(parts, bvh, design, shift, B)
    make_horns(parts, bvh, design, shift, B)
    cloth = np.vstack([gm["co"] for gm in wear])
    clear = KDTree(len(cloth))
    for i, p in enumerate(cloth):
        clear.insert(p, i)
    clear.balance()
    make_crest(parts, bvh, mesh, J2, design, shift, tail_line, tail_wh, B, g, clear)
    WJ = wing_joints(bvh, J2, B, g)
    Vw, Fw, Mw, Ww = make_wings(WJ)
    log(f"parts: {len(parts.V)} vertices, wings {len(Vw)}")

    # ── The body's mesh: skin, parts and (for now) the wings ──
    tail_u = mesh.v["tail_u"]
    tail_c = np.zeros((nb, 3))
    ring_c = mesh.co[rings].mean(1)
    for i in range(len(rings)):
        tail_c[rings[i]] = ring_c[i]
    tail_c[tail_u >= 0.999] = tail_line[-1]
    headz = np.where(tail_u >= 0, 0.0, mesh.v["headzone"])
    eyez = np.where(tail_u >= 0, 0.0, mesh.v["eyezone"])
    Wb = widen(mesh.v["W"])
    tw_ = tail_weights(np.clip(tail_u, 0, 1))
    is_tail = tail_u >= 0
    Wb[is_tail] = 0.0
    for i, b in enumerate(["pelvis", "tail_01", "tail_02", "tail_03", "tail_04", "tail_05"]):
        Wb[is_tail, ALL_INDEX[b]] = tw_[is_tail, i]
    body_keys = {}
    for k in key_names:
        fade = (1 - headz) if not k.startswith("neck") else (1 - smoothstep(0.5, 1.0, headz))
        d = mesh.v["key:" + k] * fade[:, None]
        d[is_tail] = 0.0
        body_keys[k] = d
    # (A slimmer neck takes back most of the dragon's fullness too.)
    if "thick" in mesh.v:
        body_keys["neck_slim"] = body_keys["neck_slim"] - mesh.v["thick"] * 0.65
    body_n = wd.normals(mesh.co, mesh.faces)
    dkeys = dragon_keys(B, design, shift, parts.eye_axes, mesh.co, headz, eyez, tail_u, tail_c, tail_line, body_n)
    all_keys = key_names + list(dkeys)
    body_keys.update(dkeys)
    V = [mesh.co]
    F = [list(f) for f in mesh.faces]
    M = [SCALES] * len(F)
    KK = {k: [body_keys[k]] for k in all_keys}
    WW = [Wb]
    # Parts: each rides on the skin at its root (or is held by its own bone); horns and eyes grow with
    # their own keys.
    Vp = np.array(parts.V)
    off = len(mesh.co)
    parts_at = (off, off + len(Vp))
    V.append(Vp)
    F += [[i + off for i in f] for f in parts.F]
    M += list(parts.mat)
    rw = ride(Vp, parts.origin, mesh.co, Wb)
    for j, bone in enumerate(parts.bone):
        if bone:
            rw[j] = 0.0
            rw[j, ALL_INDEX[bone]] = 1.0
    WW.append(rw)
    tags = np.array(parts.tag)
    pu = np.array(parts.u)
    roots = np.array(parts.origin)
    for k in all_keys:
        d = ride(Vp, parts.origin, mesh.co, body_keys[k])
        hv = tags == "horn"
        grow = smoothstep(0.0, 0.25, pu[hv])[:, None]
        if k == "horns":
            d[hv] = (Vp[hv] - roots[hv]) * (0.35 * grow)
        if k == "horns_small":
            d[hv] = (Vp[hv] - roots[hv]) * (-0.4 * grow)
        if k == "eyes":
            ev = tags == "eye"
            d[ev] = (Vp[ev] - roots[ev]) * 0.16
        KK[k].append(d)
    # The wings (split off into a mesh of their own once the texture is laid out).
    off = sum(len(a) for a in V)
    V.append(Vw)
    F += [[i + off for i in f] for f in Fw]
    M += list(Mw)
    Wwg = np.zeros((len(Vw), len(ALL)))
    for i, wt in enumerate(Ww):
        for b, val in wt.items():
            Wwg[i, ALL_INDEX[b]] += val
    WW.append(Wwg)
    for k in all_keys:
        KK[k].append(np.zeros_like(Vw))
    V = np.vstack(V)
    Wall = np.vstack(WW)
    keys_all = {k: np.vstack(KK[k]) for k in all_keys}
    pu_all = np.zeros(len(V))
    pu_all[parts_at[0] : parts_at[1]] = parts.u
    is_wing = np.zeros(len(F), dtype=np.int64)
    is_wing[len(F) - len(Fw) :] = 1
    info = dict(rings=rings, pu=pu_all, nb=nb, design=design, shift=shift, J=J2, WJ=WJ, tail_line=tail_line, eyes=parts.eye_axes, keys=all_keys, g=g, bvh=bvh, wear=wear, gatlas=gatlas, gnormal=gnormal, body_keys=key_names)
    UV = list(mesh.f["uv"]) + [None] * (len(F) - len(mesh.faces))
    obj = make_object(B["name"], V, F, M, keys_all, Wall, UV)
    obj.data.attributes.new("wing", "INT", "FACE").data.foreach_set("value", is_wing.tolist())
    info["plates"] = front_line(bvh, J2, design, shift, B, g)
    return obj, info


def make_object(name, V, F, M, keys, W, UV):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(V.tolist(), [], F)
    mesh.polygons.foreach_set("material_index", M)
    mesh.polygons.foreach_set("use_smooth", [True] * len(F))
    # MakeHuman's texture coordinates where the face has them (the rest are laid out later); an
    # attribute marks which faces those are.
    layer = mesh.uv_layers.new(name="UVMap")
    flat = []
    known = []
    for f, uv in zip(F, UV):
        ok = uv is not None and len(uv) == len(f)
        known.append(1 if ok else 0)
        flat += [tuple(c) for c in uv] if ok else [(0.0, 0.0)] * len(f)
    layer.data.foreach_set("uv", np.array(flat, dtype=np.float64).ravel())
    mesh.attributes.new("mh_uv", "INT", "FACE").data.foreach_set("value", known)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    for nm, colour, rough in MATS:
        m = bpy.data.materials.new(nm)
        m.use_nodes = True
        b = m.node_tree.nodes.get("Principled BSDF")
        b.inputs["Base Color"].default_value = (*[c**2.2 for c in ww.hex_rgb(colour)], 1)
        b.inputs["Roughness"].default_value = rough
        mesh.materials.append(m)
    obj.shape_key_add(name="Basis", from_mix=False)
    for k, d in keys.items():
        sk = obj.shape_key_add(name=k, from_mix=False)
        sk.data.foreach_set("co", (V + d).ravel())
        sk.slider_min, sk.slider_max = 0.0, 1.0
        sk.value = 0.0
    W = wd.limit_weights(W)
    for j, b in enumerate(ALL):
        grp = obj.vertex_groups.new(name=b)
        col = W[:, j]
        nz = np.nonzero(col > 0)[0]
        for value in np.unique(np.round(col[nz], 3)):
            sel = nz[np.round(col[nz], 3) == value]
            grp.add(sel.tolist(), float(value), "REPLACE")
    return obj


# ── Regions, texture, rig and export ─────────────────────────────────────────────────────────────────


def drop_islands(F, mats, kinds, smallest):
    """Stray specks of a region (fewer than `smallest` faces joined together) turned back into scales."""
    edge_faces = {}
    for i, f in enumerate(F):
        for j in range(len(f)):
            e = (min(f[j], f[(j + 1) % len(f)]), max(f[j], f[(j + 1) % len(f)]))
            edge_faces.setdefault(e, []).append(i)
    nbrs = [[] for _ in F]
    for fs in edge_faces.values():
        for a in fs:
            for b in fs:
                if a != b:
                    nbrs[a].append(b)
    mats = mats.copy()
    seen = np.zeros(len(F), dtype=bool)
    for start in range(len(F)):
        if seen[start] or mats[start] not in kinds:
            continue
        kind, stack, comp = mats[start], [start], []
        seen[start] = True
        while stack:
            i = stack.pop()
            comp.append(i)
            for j in nbrs[i]:
                if not seen[j] and mats[j] == kind:
                    seen[j] = True
                    stack.append(j)
        if len(comp) < smallest:
            mats[comp] = SCALES
    return mats


def cut_plates(obj, info):
    """The belly plates (scales2) cut into the skin along a clean line, from the groin up the belly, chest
    and throat and under the jaw; a little raised. Returns the plate count along the strip per vertex."""
    nb = info["nb"]
    g_, plate = plate_field(*info["plates"])
    mesh = obj.data
    n0 = len(mesh.vertices)
    info["n0"] = n0
    V0 = np.empty(n0 * 3)
    mesh.vertices.foreach_get("co", V0)
    V0 = V0.reshape(-1, 3)
    F0 = [list(p.vertices) for p in mesh.polygons if max(p.vertices) < nb]
    # (The field smoothed over the skin first, so its edge runs in an even line.)
    G0 = g_(V0)
    G0[:nb] = wd.smooth_values(V0[:nb], F0, G0[:nb], rounds=4, factor=0.5)
    G = wd.level_cut(obj, lambda P: G0, limit=lambda f: f.material_index == SCALES and all(v.index < nb for v in f.verts))
    n = len(mesh.vertices)
    V = np.empty(n * 3)
    mesh.vertices.foreach_get("co", V)
    V = V.reshape(-1, 3)
    F = [list(p.vertices) for p in mesh.polygons]
    mats = np.array([p.material_index for p in mesh.polygons])
    # (The cut's new vertices are numbered after all the others.)
    body_face = np.array([mats[i] == SCALES and all(v < nb or v >= n0 for v in f) for i, f in enumerate(F)])
    fm = np.array([G[f].mean() for f in F])
    mats[(fm < 0) & body_face] = SCALES2
    mats = drop_islands(F, mats, (SCALES2,), 30)
    mesh.polygons.foreach_set("material_index", mats.tolist())
    mesh.update()
    # The plates' count along the strip: their edges bowed up a little towards the sides, the field
    # smoothed so each groove runs straight and even.
    c = plate(V) - 0.35 * (np.abs(V[:, 0]) / (0.1 * info["g"])) ** 2
    skin = np.array([all(v < nb or v >= n0 for v in f) for f in F])
    Fs = [f for f, k in zip(F, skin) if k]
    c = wd.smooth_values(V, Fs, c, rounds=10, factor=0.5)
    return c, mats


def vertex_marks(obj, info, B):
    """What the bake reads per vertex: scale size (scales to a metre: small on the face, hands and feet,
    big on the back), where scales grow into bevelled scutes (down the back, the tops of the forearms,
    the fronts of the shins, the crown and snout), and which faces are plates."""
    mesh = obj.data
    n = len(mesh.vertices)
    V = np.empty(n * 3)
    mesh.vertices.foreach_get("co", V)
    V = V.reshape(-1, 3)
    J, g, design, shift = info["J"], info["g"], info["design"], info["shift"]
    groups = {grp.index: grp.name for grp in obj.vertex_groups}
    Wd = {b: np.zeros(n) for b in ALL}
    for v in mesh.vertices:
        for ge in v.groups:
            Wd[groups[ge.group]][v.index] = ge.weight
    head = Wd["Head"]
    hands = sum(Wd[f"hand_{s}"] for s in "lr")
    feet = sum(Wd[f"ball_{s}"] + Wd[f"foot_{s}"] * 0.5 for s in "lr")
    tail = sum(Wd[f"tail_0{i}"] for i in range(1, 6))
    per = 80.0 + 75.0 * head + 90.0 * hands + 70.0 * feet + 25.0 * tail
    back = (V[:, 1] > 0.02) & (head < 0.5) & (tail < 0.5)
    per = np.where(back, per * 0.82, per)
    F = [list(p.vertices) for p in mesh.polygons]
    per = wd.smooth_values(V, F, per, rounds=30)
    q = design.h(V - shift)
    scute = np.zeros(n)
    scute[(V[:, 1] > 0.05 * g) & (np.abs(V[:, 0]) < 0.07 * g) & (head < 0.5) & (tail < 0.5) & (V[:, 2] > J["pelvis"][2])] = 1.0
    for s, sign in (("l", 1), ("r", -1)):
        el, wr = J[f"lowerarm_{s}"], J[f"hand_{s}"]
        fa = Wd[f"lowerarm_{s}"] > 0.6
        up = (V - el) @ np.array([0, 0, 1.0]) - (np.abs(V[:, 0]) - abs(el[0])) * (wr[2] - el[2]) / (abs(wr[0]) - abs(el[0]))
        scute[fa & (up > 0.012)] = 1.0
        shin = (Wd[f"foot_{s}"] > 0.6) | (Wd[f"calf_{s}"] > 0.6)
        knee = J[f"calf_{s}"]
        scute[shin & (V[:, 1] < knee[1] - 0.0) & (V[:, 2] < knee[2] - 0.05)] = 0.8
    scute[(head > 0.5) & (q[:, 2] > 0.06) & (q[:, 1] > -0.03)] = 1.0
    scute[(tail > 0.5) & (V[:, 2] > np.interp(V[:, 1], info["tail_line"][:, 1], info["tail_line"][:, 2]) + 0.015)] = 0.7
    scute = np.clip(wd.smooth_values(V, F, scute, rounds=5), 0, 1)
    return per, scute


def shaders(info):
    """Each material's pattern for the bake: (brightness, height, bump strength). Brightness only: the
    material's own colour tints it in the game."""
    (cl, gl, rl) = info["eyes"]["l"]
    design, shift = info["design"], info["shift"]
    nostril = design.P(0.02, 0.278, 0.046) + shift
    K = design.k

    def scales(G):
        P = G.position()
        ssz = G.attr("ssz")
        v1 = G.voronoi(P, ssz, "F1", 0.85)
        v2 = G.voronoi(P, ssz, "DISTANCE_TO_EDGE", 0.85)
        edge = v2.outputs["Distance"]
        cell = G.sep(v1.outputs["Color"])[0]
        crease = G.smooth(0.0, 0.16, edge)
        big = G.noise(P, 6.0, 3.0)
        n = G.normal()
        dorsal = G.smooth(-0.1, 0.85, G.vmath("DOT_PRODUCT", n, (0, 0.62, 0.78)))
        lum = G.mul(G.add(0.78, G.mul(cell, 0.24)), G.mix(0.42, 1.0, crease))
        lum = G.mul(lum, G.add(0.86, G.mul(big, 0.26)))
        lum = G.mul(lum, G.mix(1.0, 0.7, dorsal))
        x, y, z = G.sep(P)
        Pm = G.vec(G.math("ABSOLUTE", x), y, z)
        de = G.vmath("DISTANCE", Pm, tuple(cl))
        rim = G.mix(0.3, 1.0, G.smooth(rl * 1.05, rl * 1.7, de))
        dn_ = G.vmath("DISTANCE", Pm, tuple(nostril))
        nos = G.mix(0.2, 1.0, G.smooth(0.004 * K, 0.011 * K, dn_))
        lum = G.mul(G.mul(lum, rim), nos)
        height = G.add(G.mul(G.smooth(0.0, 0.24, edge), G.add(0.8, G.mul(cell, 0.25))), G.mul(G.noise(P, 400.0, 1.0), 0.08))
        sc = G.attr("scute")
        big_n = G.mul(ssz, 0.36)
        w1 = G.voronoi(P, big_n, "F1", 0.7)
        w2 = G.voronoi(P, big_n, "DISTANCE_TO_EDGE", 0.7)
        bedge = w2.outputs["Distance"]
        bcell = G.sep(w1.outputs["Color"])[0]
        bevel = G.smooth(0.0, 0.2, bedge)
        lum_s = G.mul(G.mul(G.add(0.8, G.mul(bcell, 0.2)), G.mix(0.38, 1.08, bevel)), G.add(0.86, G.mul(big, 0.26)))
        lum_s = G.mul(G.mul(G.mul(lum_s, G.mix(1.0, 0.7, dorsal)), rim), nos)
        h_s = G.add(G.mul(bevel, 1.3), G.mul(G.smooth(0.0, 0.3, edge), 0.15))
        return G.mix(lum, lum_s, sc), G.mix(height, h_s, sc), 0.55

    def plates(G):
        P = G.position()
        fr = G.math("FRACT", G.attr("plate"))
        groove = G.mul(G.smooth(0.0, 0.08, fr), G.math("SUBTRACT", 1.0, G.smooth(0.86, 1.0, fr)))
        fine = G.noise(G.vmath("MULTIPLY", P, (60.0, 60.0, 260.0)), 1.0, 2.0)
        lum_p = G.mul(G.mul(G.add(0.84, G.mul(fr, 0.12)), G.mix(0.42, 1.0, groove)), G.add(0.94, G.mul(fine, 0.1)))
        h_p = G.add(G.mul(G.mul(fr, groove), 0.6), G.mul(groove, 0.5))
        v = G.voronoi(P, 22.0, "DISTANCE_TO_EDGE", 1.0)
        vein = G.math("SUBTRACT", 1.0, G.smooth(0.0, 0.035, v.outputs["Distance"]))
        mot = G.noise(P, 35.0, 4.0)
        lum_m = G.mul(G.add(0.8, G.mul(mot, 0.2)), G.math("SUBTRACT", 1.0, G.mul(vein, 0.22)))
        h_m = G.math("SUBTRACT", G.mul(G.noise(P, 160.0, 2.0), 0.5), G.mul(vein, 0.5))
        mask = G.attr("pmask")
        return G.mix(lum_m, lum_p, mask), G.mix(h_m, h_p, mask), 0.5

    def horns(G):
        P = G.position()
        u = G.attr("pu")
        streak = G.noise(G.vmath("MULTIPLY", P, (90.0, 90.0, 90.0)), 1.0, 3.0)
        lum = G.mul(G.add(0.6, G.mul(G.math("POWER", u, 1.4), 0.4)), G.add(0.86, G.mul(streak, 0.26)))
        ridge = G.mul(G.math("SINE", G.mul(u, 2 * math.pi * 13)), G.math("SUBTRACT", 1.0, u))
        return lum, G.add(G.mul(ridge, 0.3), G.mul(streak, 0.3)), 0.4

    def iris(G):
        P = G.position()
        x, y, z = G.sep(P)
        Pm = G.vec(G.math("ABSOLUTE", x), y, z)
        d = G.vmath("SUBTRACT", Pm, tuple(cl))
        dn = G.vmath("NORMALIZE", d)
        c = G.vmath("DOT_PRODUCT", dn, tuple(gl))
        r = G.math("SQRT", G.math("MAXIMUM", G.math("SUBTRACT", 1.0, G.mul(c, c)), 0.0))
        # Across (horizontal) and up within the eye's face, for the slit.
        ax = np.cross([0, 0, 1.0], gl)
        ax /= np.linalg.norm(ax)
        sx = G.math("ABSOLUTE", G.vmath("DOT_PRODUCT", dn, tuple(ax)))
        streaks = G.noise(G.vmath("MULTIPLY", dn, (34.0, 34.0, 34.0)), 1.0, 3.0)
        rad = G.noise(G.vmath("MULTIPLY", dn, (9.0, 9.0, 9.0)), 1.0, 2.0)
        lum = G.mul(G.add(0.55, G.mul(streaks, 0.7)), G.add(0.85, G.mul(rad, 0.3)))
        lum = G.mul(lum, G.mix(1.25, 0.8, G.smooth(0.05, 0.5, r)))  # brighter round the pupil
        lum = G.mul(lum, G.mix(1.0, 0.35, G.smooth(0.62, 0.86, r)))  # a dark ring at its edge
        slit = G.math("MULTIPLY", G.math("SUBTRACT", 1.0, G.smooth(0.05, 0.09, sx)), G.math("SUBTRACT", 1.0, G.smooth(0.5, 0.58, r)))
        lum = G.mix(lum, 0.01, slit)
        return lum, G.mul(slit, 0.0), 0.0

    def eye_white(G):
        P = G.position()
        return G.add(0.8, G.mul(G.noise(P, 200.0, 2.0), 0.15)), G.mul(G.noise(P, 10.0, 1.0), 0.0), 0.0

    def underwear(G):
        P = G.position()
        weave = G.noise(P, 900.0, 0.0)
        fold = G.noise(P, 18.0, 2.0)
        return G.add(0.88, G.add(G.mul(weave, 0.05), G.mul(fold, 0.08))), G.add(G.mul(weave, 0.6), G.mul(fold, 0.4)), 0.2

    def teeth(G):
        u = G.attr("pu")
        return G.add(0.72, G.mul(u, 0.28)), G.mul(u, 0.0), 0.0

    return {"scales": scales, "scales2": plates, "horns": horns, "iris": iris, "eye_white": eye_white, "underwear": underwear, "teeth": teeth}


def unwrap(obj, info, factor_of):
    """Texture coordinates: the body keeps MakeHuman's islands (each flattened again, as the dragon's
    shape has moved on from the human's), its new pieces (tail, joins, filled ears, the mouth's line) and
    the separate parts are laid out on their own, then all of it packed into one square, the head's and
    eyes' islands bigger."""
    mesh = obj.data
    nb = info["nb"]
    known = np.array([a.value for a in mesh.attributes["mh_uv"].data])
    body = np.array([max(p.vertices) < nb or all(v < nb or v >= info["n0"] for v in p.vertices) for p in mesh.polygons])
    # (The head is laid out afresh: the dragon's face has moved too far from the human's for its island.)
    hg = obj.vertex_groups["Head"].index
    head_v = np.zeros(len(mesh.vertices), dtype=bool)
    for v in mesh.vertices:
        for ge in v.groups:
            if ge.group == hg and ge.weight > 0.5:
                head_v[v.index] = True
    head_f = np.array([head_v[list(p.vertices)].all() for p in mesh.polygons])
    body &= ~head_f
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bm = bmesh.new()
    bm.from_mesh(mesh)
    bm.faces.ensure_lookup_table()
    uvl = bm.loops.layers.uv.active
    # Seams: wherever the stored coordinates part (MakeHuman's island edges, and round the new pieces),
    # and down the underside of the tail.
    for e in bm.edges:
        lf = e.link_faces
        if len(lf) != 2:
            continue
        f1, f2 = lf
        if body[f1.index] != body[f2.index] or known[f1.index] != known[f2.index]:
            e.seam = True
            continue
        if not known[f1.index]:
            continue
        a, b = e.verts
        def uv_at(f, v):
            return next(lp[uvl].uv.copy() for lp in f.loops if lp.vert == v)
        if (uv_at(f1, a) - uv_at(f2, a)).length > 1e-5 or (uv_at(f1, b) - uv_at(f2, b)).length > 1e-5:
            e.seam = True
    rings = info["rings"]
    bm.verts.ensure_lookup_table()
    j = rings.shape[1] * 3 // 4
    for i in range(len(rings) - 1):
        e = bm.edges.get((bm.verts[int(rings[i, j])], bm.verts[int(rings[i + 1, j])]))
        if e is not None:
            e.seam = True
    for f in bm.faces:
        f.select = bool(body[f.index])
    bm.to_mesh(mesh)
    bm.free()
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_mode(type="FACE")
    bpy.ops.mesh.select_all(action="DESELECT")
    bpy.ops.object.mode_set(mode="OBJECT")
    for p in mesh.polygons:
        p.select = bool(body[p.index])
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.uv.unwrap(method="ANGLE_BASED", margin=0.0)
    bpy.ops.mesh.select_all(action="INVERT")
    bpy.ops.uv.smart_project(angle_limit=math.radians(62), island_margin=0.0, area_weight=0.0)
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.select_all(action="SELECT")
    bpy.ops.uv.average_islands_scale()
    bm = bmesh.from_edit_mesh(mesh)
    uvl = bm.loops.layers.uv.active
    factors = factor_of(obj)
    bm.faces.ensure_lookup_table()
    for i, f in enumerate(bm.faces):
        if factors[i] != 1.0:
            for lp in f.loops:
                lp[uvl].uv *= factors[i]
    bmesh.update_edit_mesh(mesh)
    bpy.ops.uv.select_all(action="SELECT")
    bpy.ops.uv.pack_islands(rotate=True, margin=0.0025)
    bpy.ops.object.mode_set(mode="OBJECT")
    mesh.attributes.remove(mesh.attributes["mh_uv"])


def split_wings(obj):
    """The wings' faces made a mesh of their own, named "wings" (so the game can hide them), keeping
    their texture coordinates, materials, weights and keys."""
    mesh = obj.data
    flags = [a.value for a in mesh.attributes["wing"].data]
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_mode(type="FACE")
    bpy.ops.mesh.select_all(action="DESELECT")
    bpy.ops.object.mode_set(mode="OBJECT")
    for poly, w in zip(mesh.polygons, flags):
        poly.select = bool(w)
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.separate(type="SELECTED")
    bpy.ops.object.mode_set(mode="OBJECT")
    wings = next(o for o in bpy.context.selected_objects if o is not obj)
    wings.name = "wings"
    wings.data.name = "wings"
    for o in (obj, wings):
        o.data.attributes.remove(o.data.attributes["wing"])
    return wings


def texture(obj, info, B, plate, mats, per, scute, pu):
    """Texture coordinates over the body and wings together (more of the texture to the head and eyes),
    the wings split off, then the bake."""
    mesh = obj.data
    n = len(mesh.vertices)
    pmask = np.zeros(n)
    for p, m in zip(mesh.polygons, mats):
        if m == SCALES2:
            pmask[list(p.vertices)] = 1.0
    wd.vertex_attr(obj, "ssz", per)
    wd.vertex_attr(obj, "plate", plate)
    wd.vertex_attr(obj, "pmask", pmask)
    wd.vertex_attr(obj, "scute", scute)
    wd.vertex_attr(obj, "pu", pu)
    head_c = info["design"].P(0, 0.1, 0.03) + info["shift"]
    hr = 0.24 * info["design"].k
    wing_f = [a.value for a in mesh.attributes["wing"].data]

    def factor_of(o):
        f = []
        for p, w in zip(o.data.polygons, wing_f):
            c = np.array(p.center)
            if p.material_index in (IRIS, EYE_WHITE):
                f.append(2.0)
            elif np.linalg.norm(c - head_c) < hr:
                f.append(1.6)
            elif w:
                f.append(0.75)
            else:
                f.append(1.0)
        return f

    unwrap(obj, info, factor_of)
    log("unwrapped")
    wings = split_wings(obj)
    if os.environ.get("WW_NO_BAKE"):
        return wings
    size = int(os.environ.get("DRAGON_TEX", "2048"))
    colour, normal = wd.bake([obj, wings], shaders(info), size=size)
    # (The colour texture saved as a JPEG in assets/build and packed from there, so the .glb carries a
    # JPEG, as the human avatar's does; the normal map stays a PNG.)
    os.makedirs(ww.BUILD, exist_ok=True)
    path = os.path.join(ww.BUILD, f"{B['name']}-texture.jpg")
    colour.filepath_raw = path
    colour.file_format = "JPEG"
    colour.save(filepath=path, quality=92)
    bpy.data.images.remove(colour)
    colour = bpy.data.images.load(path)
    colour.pack()
    wd.final_materials(MATS, colour, normal)
    for o in (obj, wings):
        for nm in ("ssz", "plate", "pmask", "pu", "scute"):
            if nm in o.data.attributes:
                o.data.attributes.remove(o.data.attributes[nm])
    return wings


def garment_materials(gatlas, gnormal):
    """The underwear's materials, as make_avatar.py makes them: each part's colour (its glTF base colour
    factor) times the garments' greyscale texture, their normal map, a soft cloth sheen."""
    out = []
    for name, colour, rough in GARMENT_MATS:
        m = bpy.data.materials.new(name)
        m.use_nodes = True
        nodes, links = m.node_tree.nodes, m.node_tree.links
        bsdf = nodes.get("Principled BSDF")
        bsdf.inputs["Roughness"].default_value = rough
        rgb = [wd.ma.srgb_to_linear(c) for c in ww.hex_rgb(colour)]
        if gatlas is None:
            bsdf.inputs["Base Color"].default_value = (*rgb, 1.0)
        else:
            tex = nodes.new("ShaderNodeTexImage")
            tex.image = gatlas
            mix = nodes.new("ShaderNodeMix")
            mix.data_type = "RGBA"
            mix.blend_type = "MULTIPLY"
            mix.inputs["Factor"].default_value = 1.0
            links.new(tex.outputs["Color"], mix.inputs["A"])
            mix.inputs["B"].default_value = (*rgb, 1.0)
            links.new(mix.outputs["Result"], bsdf.inputs["Base Color"])
            nt = nodes.new("ShaderNodeTexImage")
            nt.image = gnormal
            nm = nodes.new("ShaderNodeNormalMap")
            links.new(nt.outputs["Color"], nm.inputs["Color"])
            links.new(nm.outputs["Normal"], bsdf.inputs["Normal"])
        bsdf.inputs["Sheen Weight"].default_value = 0.35
        bsdf.inputs["Sheen Roughness"].default_value = 0.6
        bsdf.inputs["Specular IOR Level"].default_value = 0.3
        out.append(m)
    return out


def garment_objects(info):
    """Each underwear style a mesh of its own (named as make_avatar.py names them), skinned, with the
    body's build keys (the dragon's own keys don't reach it)."""
    mats = garment_materials(info["gatlas"], info["gnormal"])
    out = []
    for gm in info["wear"]:
        obj = garment_object(gm["name"], gm)
        me = obj.data
        me.materials.clear()
        for m in mats:
            me.materials.append(m)
        me.polygons.foreach_set("material_index", gm["mat"])
        co = gm["co"]
        obj.shape_key_add(name="Basis", from_mix=False)
        for k in info["keys"]:
            sk = obj.shape_key_add(name=k, from_mix=False)
            d = gm["keys"].get(k)
            sk.data.foreach_set("co", (co + (d if d is not None else 0.0)).ravel())
            sk.slider_min, sk.slider_max = 0.0, 1.0
        Wg = wd.limit_weights(widen(gm["W"]))
        for j, b in enumerate(ALL):
            grp = obj.vertex_groups.new(name=b)
            nz = np.nonzero(Wg[:, j] > 0)[0]
            for value in np.unique(np.round(Wg[nz, j], 3)):
                sel = nz[np.round(Wg[nz, j], 3) == value]
                grp.add(sel.tolist(), float(value), "REPLACE")
        out.append(obj)
    return out


def rig_joints(info):
    J = {k: np.array(v) for k, v in info["J"].items()}
    tp = info["tail_line"]
    s = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(tp, axis=0), axis=1))])
    at_ = lambda u: np.array([np.interp(u * s[-1], s, tp[:, j]) for j in range(3)])  # noqa: E731
    for i, u in enumerate(TAIL_AT):
        J[f"tail_0{i + 1}"] = at_(u)
    J["tail_05.tail"] = at_(0.97)
    WJ = info["WJ"]
    for side, sign in (("l", 1), ("r", -1)):
        m = np.array([sign, 1, 1])
        J[f"wing_01_{side}"] = WJ["s0"] * m
        J[f"wing_02_{side}"] = WJ["E"] * m
        for i in range(3):
            J[f"wing_f{i + 1}_{side}"] = WJ["W"] * m
            J[f"wing_f{i + 1}_{side}.tail"] = WJ["tips"][i] * m
    return J


def actions():
    """Idle (breathing, the tail swaying, the wings settling), Walk and Attack (the people's, with the
    arms lowered from the A-pose and the tail swinging against the stride), for the model on its own."""
    arm_down = 72 - wd.APOSE
    base = ww.humanoid_actions(arm_down=arm_down)
    turn = ww.turn

    def tail(pose, phase, amp, lift=0.0):
        for i in range(5):
            pose[f"tail_0{i + 1}"] = turn("z", amp * (i + 1) * 0.5 * math.sin(phase - i * 0.55)) @ turn("x", lift * (i + 1))
        return pose

    idle = []
    first = dict(base["Idle"][0][1])
    second = base["Idle"][1][1]
    for n in range(9):
        t = n / 8
        breath = 0.5 - 0.5 * math.cos(2 * math.pi * t)
        pose = dict(first)
        for b in ("upperarm_l", "upperarm_r", "lowerarm_l", "lowerarm_r"):
            pose[b] = first[b].slerp(second[b], breath)
        pose["spine_02"] = turn("x", -2 * breath)
        pose["spine_03"] = turn("x", -2 * breath)
        tail(pose, 2 * math.pi * t, 3.0)
        for side, sign in (("l", 1), ("r", -1)):
            pose[f"wing_01_{side}"] = pose["spine_03"] @ turn("y", -sign * 1.5 * breath)
        idle.append((1 + n * 7.5, pose))
    walk = []
    for frame, pose in base["Walk"]:
        phase = (frame - 1) / 30 * 2 * math.pi
        walk.append((frame, tail(dict(pose), phase + math.pi / 2, 4.0)))
    attack = [(frame, tail(dict(pose), 0.0, 0.0, lift=1.0 if 5 < frame < 20 else 0.0)) for frame, pose in base["Attack"]]
    return {"Idle": idle, "Walk": walk, "Attack": attack}


def finish(obj, info, B):
    name = B["name"]
    plate, mats = cut_plates(obj, info)
    log(f"plates: {int((mats == SCALES2).sum())} faces")
    per, scute = vertex_marks(obj, info, B)
    pu = np.zeros(len(obj.data.vertices))
    pu[: len(info["pu"])] = info["pu"]
    wings = texture(obj, info, B, plate, mats, per, scute, pu)
    pieces = [obj, wings] + garment_objects(info)
    rig = wd.make_rig(name, rig_joints(info))
    for o in pieces:
        o.parent = rig
        o.modifiers.new("Armature", "ARMATURE").object = rig
    wd.Animator(rig).key_all(actions())
    os.makedirs(ww.MODELS, exist_ok=True)
    os.makedirs(ww.BUILD, exist_ok=True)
    bpy.ops.object.select_all(action="DESELECT")
    for o in pieces + [rig]:
        o.select_set(True)
    bpy.context.view_layer.objects.active = rig
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
    )
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ww.BUILD, f"{name}.blend"), compress=True)
    size = os.path.getsize(os.path.join(ww.MODELS, f"{name}.glb"))
    zs = np.array([v.co.z for v in obj.data.vertices])
    counts = ", ".join(f"{o.name} {len(o.data.vertices)}" for o in pieces)
    log(f"{name}: {counts}; {size / 1e6:.2f} MB, top {zs.max():.3f} m")
    return rig


if __name__ == "__main__":
    which = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else ["male", "female"]
    for w in which:
        B = MALE if w == "male" else FEMALE
        obj, info = build(B)
        finish(obj, info, B)
