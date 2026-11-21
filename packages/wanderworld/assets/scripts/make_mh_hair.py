"""Hair styles from MakeHuman's CC0 hair, fitted to the base avatar (avatar-male.glb and avatar-female.glb):
one GLB per style, assets/models/avatar-hair-<style>.glb, holding two meshes, `male` and `female`, each
fitted to that body's head through the style's .mhclo and skinned to its skeleton. Run (BLENDER: your
Blender executable; add `-- long bob` for some of them):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_mh_hair.py

How (`wwmhclo.py`): each style's vertices follow MakeHuman's base-mesh vertices (most through its hair
shell), so it sits on our head as the artist fitted it to theirs, and every shape key of the body is
carried onto it (fitted again with that key at 1), so it follows the face and build sliders. Where it
would still sink into the skin (at rest and with each key at 1, the pointed ears too) it's lifted off;
long hair stands a little further off the back, room for the back to bend and twist under it.

- Material `hair`: the style's texture made near-white greyscale (its luminance, scaled so its brightest
  strands are white and its middle tone sits at about 0.72, so the strand detail stays and the game's hair
  colour tints it), 1024 px, alpha MASK (cutoff 0.5). Normals point out from the head (from the neck
  further down), each card turned to face out, so cards are lit like a mass of hair, not like flat strips.
- Weights: the head wholly to `Head` (and anything within 3 cm of the skull); hair below the chin blends
  into `neck_01` and then `spine_03` down the back, and hair lying on the shoulders and back takes the
  skin's own weights under it (an arm's counted as its collarbone), so a raised arm lifts it.

Hair from MakeHuman (makehumancommunity.org, CC0), fitted and adapted in Blender by ThatOneCan.
"""

import os
import sys

import bpy
import numpy as np
from mathutils.kdtree import KDTree

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import wwmhclo as mc  # noqa: E402

# Style name → the pack's hair folder. These replace make_hair.py's short, long, ponytail, braid, curly and
# bob; its parted, buns, shaved and mohawk (styles the pack hasn't got) stay as they are.
STYLES = {
    "short": "short02",  # short and textured, a little longer on top
    "slicked": "short04",  # combed straight back
    "crop": "short01",  # a short spiky crop
    "fringe": "short03",  # short, with a long fringe swept over one eye
    "long": "long01",  # straight, past the shoulder blades
    "ponytail": "ponytail01",
    "braid": "braid01",  # one long plait down the back, a side-swept fringe
    "bob": "bob02",  # chin length, a side-swept fringe
    "bob_angled": "bob01",  # longer at the front than the back, over one eye
    "curly": "afro01",  # short tight curls close to the head
}
CUTOFF = 0.5
SIZE = 1024
CLEARANCE = 0.0015  # how close hair may come to the skin
BACK_ROOM = 0.008  # how much further off the back long hair stays
BROWN = 0x6B4A32  # the base colour factor the styles are exported with (the game sets its own)


def hair_texture(path, name):
    """The style's texture as near-white greyscale with its alpha."""
    rgba = mc.load_rgba(path, SIZE)
    lum = mc.luminance(rgba[..., :3])
    a = rgba[..., 3]
    solid = a > CUTOFF
    hi = np.percentile(lum[solid], 97) if solid.any() else 1.0
    g = np.clip(lum / max(hi, 1e-3), 0, 1)
    mid = np.median(g[solid]) if solid.any() else 0.5
    gamma = np.log(0.72) / np.log(min(max(mid, 0.05), 0.95))
    g = g**gamma
    rgb = np.repeat(g[..., None], 3, axis=2)
    # (Under the cut-out the colour is the strands' nearby colour, so filtering doesn't bring in a fringe.)
    rgb = mc.fill_outside(rgb, solid)
    return mc.save_image(f"avatar-hair-{name}", np.concatenate([rgb, a[..., None]], axis=2))


def landmarks(body):
    """The chin's height, the shoulders' and the head's centre."""
    J = body.J
    head = body.bone == "Head"
    front = head & (np.abs(body.co[:, 0]) < 0.01) & (body.co[:, 1] < J["Head"][1] - 0.04)
    chin = body.co[front, 2].min()
    shoulder = J["spine_03.tail"][2] + 0.005
    skull = head & (body.co[:, 2] > chin + 0.02)
    centre = body.co[skull].mean(0)
    return chin, shoulder, centre, np.nonzero(skull)[0]


def outward(points, centre, low):
    """Directions out from the head's centre, or from the line down the neck below it."""
    axis = np.array([centre[0], centre[1], 0.0])
    z = np.clip(points[:, 2], low, centre[2])
    on = np.stack([np.full(len(points), axis[0]), np.full(len(points), axis[1]), z], axis=1)
    return mc.unit(points - on)


def weights(fitted, body, chin, shoulder, skull_ids):
    kd = KDTree(len(skull_ids))
    for i in skull_ids:
        kd.insert(body.co[i], int(i))
    kd.balance()
    d = np.array([kd.find(p)[2] for p in fitted.co])
    z = fitted.co[:, 2]
    head = mc.smoothstep(chin - 0.15, chin + 0.02, z)
    near = (d < 0.03) & (z > chin - 0.03)
    head = np.where(near, np.maximum(head, 1 - mc.smoothstep(0.02, 0.03, d)), head)
    spine = 1 - mc.smoothstep(shoulder - 0.14, shoulder + 0.01, z)
    spine = np.minimum(spine, 1 - head)
    neck = np.maximum(0.0, 1 - head - spine)
    W = np.zeros((len(z), len(mc.BONE_NAMES)))
    W[:, mc.BONE_INDEX["Head"]] = head
    W[:, mc.BONE_INDEX["neck_01"]] = neck
    W[:, mc.BONE_INDEX["spine_03"]] = spine
    # Hair lying on the shoulders and back takes the skin's own weights there, so a raised arm lifts the
    # hair over its shoulder instead of pushing through it: the arm bones count as their collarbone, the
    # rest of the trunk as itself.
    kd = KDTree(body.n)
    for i, p in enumerate(body.co):
        kd.insert(p, i)
    kd.balance()
    hits = [kd.find(p) for p in fitted.co]
    near_i = np.array([h[1] for h in hits])
    near_d = np.array([h[2] for h in hits])
    skin = body.W[near_i].copy()
    for s in ("l", "r"):
        for b in ("upperarm", "lowerarm", "hand"):
            skin[:, mc.BONE_INDEX[f"clavicle_{s}"]] += skin[:, mc.BONE_INDEX[f"{b}_{s}"]]
            skin[:, mc.BONE_INDEX[f"{b}_{s}"]] = 0
    trunk = [mc.BONE_INDEX[b] for b in ("pelvis", "spine_01", "spine_02", "spine_03", "clavicle_l", "clavicle_r", "neck_01", "Head")]
    rest = np.ones(len(mc.BONE_NAMES), dtype=bool)
    rest[trunk] = False
    skin[:, mc.BONE_INDEX["spine_03"]] += skin[:, rest].sum(1)
    skin[:, rest] = 0
    lying = (1 - mc.smoothstep(0.03, 0.12, near_d)) * (1 - head) * (1 - mc.smoothstep(shoulder - 0.02, shoulder + 0.06, z))
    W = W * (1 - lying[:, None]) + skin * lying[:, None]
    fitted.W = W
    fitted.limit_weights(4)


def face_out(fitted, centre, low):
    """Turns each card to face away from the head; returns the outward normals per vertex."""
    co = fitted.co
    starts = np.cumsum([0] + [len(f) for f in fitted.faces])
    uv = fitted.corner_uv.copy()
    flipped = 0
    for i, f in enumerate(fitted.faces):
        p = co[f]
        n = np.zeros(3)
        for j in range(len(f)):
            n += np.cross(p[j], p[(j + 1) % len(f)])
        out = outward(p.mean(0)[None], centre, low)[0]
        if n @ out < 0:
            fitted.faces[i] = f[::-1]
            uv[starts[i] : starts[i + 1]] = uv[starts[i] : starts[i + 1]][::-1]
            flipped += 1
    fitted.corner_uv = uv
    # The smooth normal of the hair's surface, turned out, blended with the direction out from the head.
    n = np.zeros_like(co)
    for f in fitted.faces:
        p = co[f]
        fn = np.zeros(3)
        for j in range(len(f)):
            fn += np.cross(p[j], p[(j + 1) % len(f)])
        n[f] += fn
    n = mc.unit(n)
    out = outward(co, centre, low)
    n = np.where((n * out).sum(1, keepdims=True) < 0, -n, n)
    return mc.unit(0.35 * n + 0.65 * out), flipped


def make(style, keys=None):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    proxy = mc.Proxy("hair", STYLES[style])
    image = hair_texture(proxy.texture(), style)
    mat = mc.material("hair", image, colour=[float(c) for c in mc.srgb_to_linear(np.array(mc.ww.hex_rgb(BROWN)))], roughness=0.75, alpha_cutoff=CUTOFF)
    objects, rigs, stats = [], [], {}
    for sex in ("male", "female"):
        body = mc.Body(sex)
        fitted = mc.Fitted(proxy, body, keys)
        chin, shoulder, centre, skull_ids = landmarks(body)
        before = fitted.clipping({})
        configs = {k: {k: 1.0} for k in fitted.key_names}
        # (Hair hanging down the back stands a little further off it, room for the back to bend and twist.)
        clearance = CLEARANCE + BACK_ROOM * mc.smoothstep(shoulder - 0.05, shoulder - 0.2, fitted.co[:, 2])
        report = fitted.push_out(clearance, configs)
        weights(fitted, body, chin, shoulder, skull_ids)
        normals, flipped = face_out(fitted, centre, shoulder - 0.4)
        rig = mc.make_rig(body)
        obj = mc.build_object(sex, fitted, rig, [mat], normals=normals)
        bpy.data.objects.remove(body.obj, do_unlink=True)
        bpy.data.objects.remove(body.rig, do_unlink=True)
        after = {name: fitted.clipping(v, depth=0.0005) for name, v in [("rest", {})] + list(configs.items())}
        combo = {"heavy": 1.0, "muscle": 1.0, "belly": 1.0, "neck": 1.0, ("bust" if sex == "female" else "chest"): 1.0}
        stats[sex] = {
            "vertices": len(obj.data.vertices),
            "faces": len(obj.data.polygons),
            "flipped": flipped,
            "under the skin before": before,
            "pushed": {k: v for k, v in report.items() if v[0]},
            "still under (>0.5 mm)": {k: v for k, v in after.items() if v[0]},
            "combo": fitted.clipping(combo, depth=0.0005),
        }
        objects.append(obj)
        rigs.append(rig)
        mc.log(f"{style} {sex}: {stats[sex]}")
    path = os.path.join(mc.MODELS, f"avatar-hair-{style}.glb")
    size = mc.export(path, objects, rigs)
    mc.log(f"wrote {path} ({size / 1e6:.2f} MB)")
    return stats


if __name__ == "__main__":
    which = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else list(STYLES)
    for s in which:
        make(s)
