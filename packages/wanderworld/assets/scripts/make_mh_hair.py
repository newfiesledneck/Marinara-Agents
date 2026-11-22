"""Hair styles from MakeHuman's CC0 hair, fitted to the base avatar (avatar-male.glb and avatar-female.glb):
one GLB per style, assets/models/avatar-hair-<style>.glb, holding two meshes, `male` and `female`, each
fitted to that body's head through the style's .mhclo and skinned to its skeleton. Run (BLENDER: your
Blender executable; add `-- long bob` for some of them):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_mh_hair.py

How (`wwmhclo.py`): each style's vertices follow MakeHuman's base-mesh vertices (most through its hair
shell), so it sits on our head as the artist fitted it to theirs, and every shape key of the body is
carried onto it (fitted again with that key at 1), so it follows the face and build sliders. Some styles
are restyled after fitting (`RESTYLE`): long hair gets locks layered over its back, the angled bob loses
its heavy layer over the face, the fringe is lifted off the eye, the curly style is rebuilt. Where hair
would still sink into the skin (at rest and with each key at 1, the pointed ears too) it's lifted off; long
hair stands a little further off the back, room for the back to bend and twist under it.

- Material `hair`: the style's texture made near-white greyscale (its luminance, scaled so its brightest
  strands are white and its middle tone sits at about 0.72, so the strand detail stays and the game's hair
  colour tints it), 1024 px, alpha MASK (cutoff 0.5). Normals point out from the head (from the neck
  further down), each card turned to face out, so cards are lit like a mass of hair, not like flat strips;
  cards made here curve their normals round across them, lit like a rounded lock.
- Weights (`weights`): hair close to the skin moves as the skin under it does (its bone weights where it's
  nearest, an arm's counted as its collarbone, a leg's as the hips), so turning the head or twisting the
  back doesn't push skin through it; hair further off hangs from `Head`, then `neck_01` and `spine_03`
  down the back, the head's share gone by the shoulders.

`finish()` does the fitting's second half for make_hair.py's styles too.

Hair from MakeHuman (makehumancommunity.org, CC0), fitted and adapted in Blender by ThatOneCan.
"""

import math
import os
import sys
import zlib

import bpy
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import wwmhclo as mc  # noqa: E402

# Style name → the pack's hair folder. Parted, buns, shaved and mohawk (styles the pack hasn't got) are
# make_hair.py's, cut from these.
STYLES = {
    "short": "short02",  # short and textured, a little longer on top
    "slicked": "short04",  # combed straight back
    "crop": "short01",  # a short spiky crop
    "fringe": "short03",  # short, with a long fringe swept to one side above the eye
    "long": "long01",  # straight, past the shoulder blades
    "ponytail": "ponytail01",
    "braid": "braid01",  # one long plait down the back, a side-swept fringe
    "bob": "bob02",  # chin length, a side-swept fringe
    "bob_angled": "bob01",  # longer at the front than the back, swept to one side
    "curly": "afro01",  # short curls in clumps, ringlets over a curly base
}
CUTOFF = 0.5
SIZE = 1024
CLEARANCE = 0.0015  # how close hair may come to the skin
BACK_ROOM = 0.008  # how much further off the back long hair stays
BROWN = 0x6B4A32  # the base colour factor the styles are exported with (the game sets its own)


# ── Textures ────────────────────────────────────────────────────────────────────────────────────────


def grey(rgba, mid=0.72):
    """A hair picture as near-white greyscale with its alpha: luminance scaled so its brightest strands are
    white and its middle tone sits at `mid`."""
    lum = mc.luminance(rgba[..., :3])
    a = rgba[..., 3]
    solid = a > CUTOFF
    hi = np.percentile(lum[solid], 97) if solid.any() else 1.0
    g = np.clip(lum / max(hi, 1e-3), 0, 1)
    m = np.median(g[solid]) if solid.any() else 0.5
    g = g ** (np.log(mid) / np.log(min(max(m, 0.05), 0.95)))
    return np.concatenate([np.repeat(g[..., None], 3, axis=2), a[..., None]], axis=2)


def evened(rgba, below):
    """A picture whose strands darken towards their tips (rows under `below`, a fraction of its height from
    the bottom) brightened there to the tone they have at `below`, row by row, keeping the strands' own detail:
    dark ends turn into patches where a layer's tip lies over the middle of another."""
    lum = mc.luminance(rgba[..., :3])
    solid = rgba[..., 3] > CUTOFF
    rows = np.array([np.median(lum[r][solid[r]]) if solid[r].sum() > 20 else np.nan for r in range(len(lum))])
    ok = ~np.isnan(rows)
    rows = np.interp(np.arange(len(rows)), np.nonzero(ok)[0], rows[ok])
    rows = np.convolve(np.pad(rows, 12, mode="edge"), np.ones(25) / 25, mode="valid")
    ref = rows[int(below * len(rows))]
    gain = np.where(np.arange(len(rows)) < below * len(rows), np.clip(ref / np.maximum(rows, 1e-3), 1.0, 2.5), 1.0)
    out = rgba.copy()
    out[..., :3] = np.clip(rgba[..., :3] * gain[:, None, None], 0, 1)
    return out


def eroded(mask, px):
    """A mask shrunk by `px` pixels."""
    m = mask.copy()
    for _ in range(px):
        n = m.copy()
        n[1:] &= m[:-1]
        n[:-1] &= m[1:]
        n[:, 1:] &= m[:, :-1]
        n[:, :-1] &= m[:, 1:]
        m = n
    return m


def save_texture(name, rgba):
    """Saved and packed, the colour under the cut-out taken from the strands nearby (so filtering doesn't
    bring in a fringe)."""
    solid = rgba[..., 3] > CUTOFF
    rgb = mc.fill_outside(rgba[..., :3], solid)
    return mc.save_image(f"avatar-hair-{name}", np.concatenate([rgb, rgba[..., 3:4]], axis=2))


def pack_texture(folder, size=SIZE):
    """The pack style's texture, greyscale, as an array."""
    return grey(mc.load_rgba(mc.Proxy("hair", folder).texture(), size))


def strand_strips(source, n, size, seed, rect=(0.0, 0.0, 1.0, 1.0), ragged=0.2, root=0.18):
    """`n` lock textures side by side in a picture `size` (rows, columns), cut from `source` (a greyscale hair
    picture, best at full size, with its strands running up it) within `rect` (row0, col0, row1, col1, as
    fractions; row 0 at the bottom): each a few centimetres of strands, their broad light and dark patches
    taken out (only the strands' own detail kept, a little darker at the root), that start and end strand by
    strand (the tip ends raggedly, longer in the middle, the root fades in, the sides thin out), so a card's
    edges aren't straight cuts, and darker towards its sides, so a flat card reads as a rounded lock. Row 0
    is the tip, the last row the root (texture v 0 to 1)."""
    rng = np.random.default_rng(seed)
    h, w = size
    r0, c0, r1, c1 = (int(rect[0] * source.shape[0]), int(rect[1] * source.shape[1]), int(rect[2] * source.shape[0]), int(rect[3] * source.shape[1]))
    src = source[r0:r1, c0:c1, 0]
    detail = src - mc.box_blur(src, max(4, src.shape[1] // 40))
    sw = w // n
    out = np.zeros((h, w, 4))
    s = np.linspace(0, 1, h)[:, None]  # 0 at the tip row, 1 at the root
    take = int(source.shape[1] * 0.035)
    for k in range(n):
        x0 = int(rng.integers(0, max(1, src.shape[1] - take)))
        piece = detail[:, x0 : x0 + take]
        piece = piece[np.linspace(0, len(piece) - 1, h).astype(int)][:, np.linspace(0, take - 1, sw).astype(int)]
        x = ((np.arange(sw) + 0.5) / sw * 2 - 1)[None, :]  # -1 .. 1 across
        strand = rng.random(sw // 2 + 1).repeat(2)[None, :sw]
        start = rng.random(sw // 2 + 1).repeat(2)[None, :sw]
        side = np.abs(x) < 0.97 - 0.35 * strand * np.abs(x) ** 2
        tip = s > ragged * (0.2 + 0.8 * np.abs(x) ** 1.5) * strand + 0.004
        top = s < 1 - root * start * (0.4 + 0.6 * np.abs(x))
        a = np.where(side & tip & top, 1.0, 0.0)
        tone = 0.74 - 0.08 * mc.smoothstep(0.7, 1.0, s) + 0.04 * np.sin(s * 7 + k)
        shade = 0.6 + 0.4 * np.cos(x * math.pi / 2) ** 0.7
        out[:, k * sw : (k + 1) * sw, :3] = np.clip((tone + 1.4 * piece) * shade, 0, 1)[..., None]
        out[:, k * sw : (k + 1) * sw, 3] = a
    return out


def layered_locks(fitted, surface, locks, rect_of, rows=10, cols=2):
    """Locks laid over a hair style's outside: each lock (u, v_top, v_end, width, standoff at the root,
    standoff at the tip) follows `surface` (a wwmhclo.Surface on the style's own sheet) down its strands from
    v_top to v_end, standing off the outermost hair under it, with that sheet's key offsets, so it follows
    every slider; `rect_of(i)` its texture place. Returns them as one Fitted."""
    tree = BVHTree.FromPolygons(fitted.co.tolist(), fitted.faces)
    centre = fitted.co.mean(0)
    parts = []
    for i, (u, v_top, v_end, width, off0, off1) in enumerate(locks):
        v = np.linspace(v_top, v_end, rows)
        co, keys, nrm, _ = surface.at(np.stack([np.full(rows, u), v], axis=1))
        away = co - np.array([centre[0], centre[1], co[:, 2].mean()])
        nrm = np.where((nrm * away).sum(1, keepdims=True) < 0, -nrm, nrm)
        pts = co.copy()
        for j in range(rows):
            n = Vector(nrm[j])
            hit = tree.ray_cast(Vector(co[j]) + n * 0.12, -n, 0.2)
            base = np.array(hit[0]) if hit[0] is not None else co[j]
            t = j / (rows - 1)
            pts[j] = base + nrm[j] * (off0 + (off1 - off0) * t)
        p, f, uv, k, nn = mc.strip(pts, keys, nrm, width, rect_of(i), cols=cols, taper=0.25)
        parts.append(mc.made(fitted.body, p, f, uv, k, normal_hint=nn, like=fitted))
    return mc.merge(parts)


# ── Fitting ─────────────────────────────────────────────────────────────────────────────────────────


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


ARM = ("upperarm", "lowerarm", "hand")
LEG = ("thigh", "calf", "foot", "ball")


def weights(fitted, body, chin, shoulder):
    """Hair close to the skin (within about 2 cm) takes the skin's own weights where it's nearest, fading to
    the hanging scheme by 4.5 cm: `Head` down to the chin, then `neck_01`, then `spine_03` from the shoulders
    down, the head's share gone by the top of the shoulders (so a turned head doesn't swing hair lying on
    them into the collarbone)."""
    z = fitted.co[:, 2]
    head = mc.smoothstep(shoulder + 0.03, chin + 0.01, z)
    spine = 1 - mc.smoothstep(shoulder - 0.10, shoulder + 0.03, z)
    spine = np.minimum(spine, 1 - head)
    neck = np.maximum(0.0, 1 - head - spine)
    W = np.zeros((len(z), len(mc.BONE_NAMES)))
    W[:, mc.BONE_INDEX["Head"]] = head
    W[:, mc.BONE_INDEX["neck_01"]] = neck
    W[:, mc.BONE_INDEX["spine_03"]] = spine
    skin, dist = body.skin_weights(fitted.co)
    for s in ("l", "r"):
        for b in ARM[1:]:
            skin[:, mc.BONE_INDEX[f"upperarm_{s}"]] += skin[:, mc.BONE_INDEX[f"{b}_{s}"]]
            skin[:, mc.BONE_INDEX[f"{b}_{s}"]] = 0
        for b in LEG:
            skin[:, mc.BONE_INDEX["pelvis"]] += skin[:, mc.BONE_INDEX[f"{b}_{s}"]]
            skin[:, mc.BONE_INDEX[f"{b}_{s}"]] = 0
    near = 1 - mc.smoothstep(0.02, 0.045, dist)
    W = W * (1 - near[:, None]) + skin * near[:, None]
    # (Smoothed along the cards, so a card passing near the skin bends, not kinks.)
    W = fitted.smooth(W, rounds=3, factor=0.5)
    fitted.W = W
    fitted.limit_weights(4)


def face_out(fitted, centre, low):
    """Turns each card to face away from the head; returns the outward normals per vertex (a card made here
    keeps its own, curved round across it)."""
    co = fitted.co
    starts = np.cumsum([0] + [len(f) for f in fitted.faces])
    uv = fitted.corner_uv.copy()
    flipped = 0
    hint = getattr(fitted, "normal_hint", None)
    for i, f in enumerate(fitted.faces):
        p = co[f]
        n = np.zeros(3)
        for j in range(len(f)):
            n += np.cross(p[j], p[(j + 1) % len(f)])
        # (A card made here knows which way it faces: its own normals.)
        own = hint is not None and not np.isnan(hint[f[0], 0])
        out = hint[f].mean(0) if own else outward(p.mean(0)[None], centre, low)[0]
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
    normals = mc.unit(0.35 * n + 0.65 * out)
    if hint is not None:
        own = ~np.isnan(hint[:, 0])
        normals[own] = mc.unit(0.75 * hint[own] + 0.25 * out[own])
    return normals, flipped


def finish(style, fit, image, long_hair=None):
    """Fits a style to both bodies and writes assets/models/avatar-hair-<style>.glb: `fit(body, sex)` gives
    the hair on that body (a wwmhclo Fitted with every key), `image` its texture. Lifts it off the skin at
    rest and with each key, weights it, turns its cards out. Returns what it found, per body."""
    mat = mc.material("hair", image, colour=[float(c) for c in mc.srgb_to_linear(np.array(mc.ww.hex_rgb(BROWN)))], roughness=0.75, alpha_cutoff=CUTOFF)
    objects, rigs, stats = [], [], {}
    for sex in ("male", "female"):
        body = mc.Body(sex)
        fitted = fit(body, sex)
        chin, shoulder, centre, _ = landmarks(body)
        before = fitted.clipping({})
        configs = {k: {k: 1.0} for k in fitted.key_names}
        # (Hair hanging down the back stands a little further off it, room for the back to bend and twist.)
        clearance = CLEARANCE + BACK_ROOM * mc.smoothstep(shoulder - 0.05, shoulder - 0.2, fitted.co[:, 2])
        report = fitted.push_out(clearance, configs)
        weights(fitted, body, chin, shoulder)
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
            "keys": len(fitted.key_names),
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


# ── Restyling ───────────────────────────────────────────────────────────────────────────────────────

RESTYLE = {}  # style → (fit(proxy, body, sex) → Fitted, texture(proxy) → image), for those changed after fitting


def rng_for(*words):
    return np.random.default_rng(zlib.crc32("-".join(map(str, words)).encode()))


# Long: long01 is two big sheets (its picture's left 61%) with thirteen thinner layers over them that used a
# smaller copy of that picture (on its right). The layers use the sheets' own picture now, and the right of
# it holds eight locks cut from the sheets' strands, laid in layers over the back and sides so the back
# isn't one flat sheet.
LONG_SHEETS = (0.0, 0.0, 0.612, 1.0)  # (u0, v0, u1, v1) of the two sheets in the picture
LONG_COPY = (0.645, 0.285, 0.975, 0.88)  # the smaller copy the layers used (matched to the sheets by their outline)
LONG_LOCKS = (0.635, 0.0, 0.995, 1.0)  # where the locks go
LONG_STRIPS = 8


def long_texture(proxy):
    rgba = mc.load_rgba(proxy.texture(), SIZE)
    black = rgba[..., :3].max(2) < 0.06  # (the black round the sheets, opaque in the pack's picture)
    seam = np.zeros_like(black)
    seam[:, int(0.29 * SIZE) : int(0.33 * SIZE)] = True  # (down the middle of the back, where the sheets meet)
    # Round the sheets the black is cut away, with the dark edge where they met it; in the seam it's hair's
    # colour instead, a shade darker (as the hair between two layers is), so the parting at the back of the
    # crown isn't a line of skin or of black.
    rgba[..., :3] = np.where((black & seam)[..., None], mc.fill_outside(rgba[..., :3], ~black) * 0.7, rgba[..., :3])
    rgba[black & ~seam, 3] = 0
    keep = eroded(rgba[..., 3] > CUTOFF, 2) | seam
    rgba[..., 3] = np.where(keep, rgba[..., 3], 0)
    g = grey(evened(rgba, 0.65))
    x0, x1 = int(LONG_LOCKS[0] * SIZE), int(LONG_LOCKS[2] * SIZE)
    g[:, int(0.613 * SIZE) :] = 0
    # (The sheets under the locks a shade darker below the crown, as hair under other hair is.)
    v = np.linspace(0, 1, SIZE)[:, None]
    g[..., :3] *= (0.8 + 0.2 * mc.smoothstep(0.72, 0.9, v))[..., None]
    full = mc.load_rgba(proxy.texture())
    g[:, x0:x1] = strand_strips(grey(full), LONG_STRIPS, (SIZE, x1 - x0), 11, rect=(0.08, 0.05, 0.62, 0.27))
    return save_texture("long", g)


def long_fit(proxy, body, sex):
    f = mc.Fitted(proxy, body)
    isl = f.islands()
    layers = [i for k in isl[1:] for i in k]
    # (The layers' roots at the front of the parting showed as steps at the hairline: they tuck under the
    # sheets there now.)
    vuv = f.vertex_uv()
    chin, shoulder, centre, _ = landmarks(body)
    for k in isl[1:]:
        vs = np.array(sorted({v for i in k for v in f.faces[i]}))
        root = vs[(vuv[vs, 1] > vuv[vs, 1].max() - 0.02) & (f.co[vs, 1] < body.J["Head"][1] - 0.06)]
        f.co[root] -= outward(f.co[root], centre, shoulder) * 0.004
    mc.remap_uv(f, LONG_COPY, LONG_SHEETS, face_ids=layers)
    surf = mc.Surface(f, isl[0])
    rng = rng_for("long", sex)
    sw = (LONG_LOCKS[2] - LONG_LOCKS[0]) / LONG_STRIPS
    locks = []
    # (The left sheet runs from the face at u 0.02 to the middle of the back at 0.30; the right mirrors it.)
    for mirror in (False, True):
        for k in range(9):
            u = 0.14 + 0.155 * (k + rng.uniform(0.2, 0.8)) / 9
            long_ = rng.random() < 0.55
            locks.append((u, rng.uniform(0.70, 0.8), rng.uniform(0.0, 0.06) if long_ else rng.uniform(0.12, 0.3),
                          rng.uniform(0.026, 0.038), 0.0015, rng.uniform(0.006, 0.016)))
        for k in range(3):
            u = 0.065 + 0.07 * (k + rng.uniform(0.2, 0.8)) / 3
            locks.append((u, rng.uniform(0.74, 0.82), rng.uniform(0.3, 0.45), rng.uniform(0.026, 0.034), 0.002, 0.005))
        if mirror:
            locks[-12:] = [(0.62 - l[0],) + l[1:] for l in locks[-12:]]
    order = rng.permutation(LONG_STRIPS * 4)
    added = layered_locks(f, surf, locks, lambda i: (LONG_LOCKS[0] + sw * (order[i] % LONG_STRIPS) + 0.002, 0.002,
                                                       LONG_LOCKS[0] + sw * (order[i] % LONG_STRIPS + 1) - 0.002, 0.998))
    return mc.merge([f, added])


RESTYLE["long"] = (long_fit, long_texture)


# Crop: short01's little tufts (its picture's right column and top row) are toned on their own, a little
# darker and with more contrast than the cap's fur: toned with it, the tufts along the front came out a
# flat pale grey against the darker cap.
def crop_texture(proxy):
    rgba = mc.load_rgba(proxy.texture(), SIZE)
    tufts = np.zeros(rgba.shape[:2], dtype=bool)
    tufts[:, int(0.7 * SIZE) :] = True
    tufts[int(0.93 * SIZE) :, :] = True
    g = grey(rgba)
    t = grey(np.where(tufts[..., None], rgba, 0), mid=0.55)
    lum = t[..., 0]
    t[..., :3] = np.clip(0.55 + (lum - 0.55) * 1.35, 0, 1)[..., None]
    g[tufts] = t[tufts]
    return save_texture("crop", g)


RESTYLE["crop"] = (None, crop_texture)


def eyes(body):
    """The eyes' height and how far forward they are (the middle of the irises)."""
    me = body.obj.data
    ids = sorted({v for p in me.polygons if body.poly_mat[p.index] == "iris" for v in p.vertices})
    p = body.co[ids]
    return p[:, 2].mean(), p[:, 1].min()


def lift_fringe(f, body, inner=0.033, outer=0.011, side=(-0.03, -0.065)):
    """Lifts hair hanging over the face so its ends stop above the brow (`inner` above the eyes' middle)
    and come down towards the temple on the right (`outer` at `side` x), as it's swept: each column of it
    squeezed up from just above the forehead, its ends kept as they are, so it still ends in strands."""
    eye_z, eye_y = eyes(body)
    top = eye_z + 0.065
    x, z = f.co[:, 0], f.co[:, 2]
    front = mc.smoothstep(eye_y + 0.06, eye_y + 0.035, f.co[:, 1])
    low = (z < top) & (front > 0.3)
    bins = np.linspace(-0.08, 0.08, 9)
    ends = np.array([z[low & (np.abs(x - b) < 0.012)].min() if (low & (np.abs(x - b) < 0.012)).any() else top for b in bins])
    zmin = np.interp(x, bins, ends)
    target = eye_z + inner + (outer - inner) * mc.smoothstep(side[0], side[1], x)
    s = np.clip((top - target) / np.maximum(top - zmin, 1e-3), 0, 1)
    lifted = np.where(z < top, top - (top - z) * s, z)
    f.co[:, 2] = z + (lifted - z) * front
    f.co[:, 1] -= 0.004 * front * mc.smoothstep(top, eye_z, z)  # (a little forward, off the brow)
    return f


# Fringe: short03's long fringe hung over the right eye. It's lifted, its ends above the brow, sweeping
# down to the temple, the eye clear beneath it.
def fringe_fit(proxy, body, sex):
    return lift_fringe(mc.Fitted(proxy, body), body)


RESTYLE["fringe"] = (fringe_fit, None)


# Angled bob: bob01 had a second sheet over the right of the face (948 of its 5,203 vertices) hanging over
# the eye. That sheet is gone, the main sheet's faces cut to 55% where they're densest (wwmhclo's
# decimate), and what's left over the eye lifted to the brow, as the fringe's is.
def bob_angled_fit(proxy, body, sex):
    f = mc.Fitted(proxy, body)
    isl = f.islands()
    main, over = isl[0], isl[1]
    f = f.subset([i for k in [isl[0]] + isl[2:] for i in k])
    f = f.decimate(0.55, range(len(main)))
    # (Its long front corner still frames the cheek, beside the face, not over it.)
    return lift_fringe(f, body, inner=0.03, outer=-0.035, side=(-0.025, -0.07))


RESTYLE["bob_angled"] = (bob_angled_fit, None)


# Curly: afro01 is two caps (an inner one, solid, on the picture's left, and an outer one of sparse curls on
# its right) and 340 little cards, each showing the whole strip of curls along the picture's bottom. The
# caps' pictures were blotchy (painted speckle and stripes): both are redrawn from that strip's own curls,
# the inner a darker curly base, the outer loose curls with gaps between. Each card shows a fifth of the
# strip, so its curls are big enough to read, and the outer cap and the cards stand further off the head.
CURL_STRIP = (0.0, 0.0, 1.0, 0.31)  # (u0, v0, u1, v1) of the strip of curls
CURL_LOOPS = (0.17, 0.31)  # its loose curls at the top (v)


def curly_texture(proxy):
    rgba = mc.load_rgba(proxy.texture(), SIZE)
    g = grey(rgba)
    rng = rng_for("curly-texture")
    H = SIZE
    loops = g[int(CURL_LOOPS[0] * H) : int(CURL_LOOPS[1] * H)]
    solid = rgba[..., 3] > CUTOFF
    inner = np.zeros_like(solid)
    inner[int(0.4 * H) :, : int(0.62 * H)] = True
    outer = np.zeros_like(solid)
    outer[int(0.4 * H) :, int(0.62 * H) :] = True
    inner_mask = solid & inner
    outer_mask = outer & (mc.box_blur((rgba[..., 3] > 0.05).astype(float), 8) > 0.3)  # (its fan, filled)

    detail = loops[..., 0] - mc.box_blur(loops[..., 0], 6)  # (the curls' own strands, no broad tone)
    yy, xx = np.mgrid[-24:25, -24:25]

    def clumps(target, mask, count, r_lo, r_hi, edge_alpha):
        """Round curl clumps: each lit like a ball of curls (lighter towards the upper left, darker at its
        rim), the strip's curling strands running through it, its rim ragged."""
        ys, xs = np.nonzero(mask)
        for _ in range(count):
            k = int(rng.integers(0, len(ys)))
            r = rng.uniform(r_lo, r_hi)
            cy, cx = ys[k], xs[k]
            if cy < 25 or cx < 25 or cy > H - 26 or cx > H - 26:
                continue
            d = np.sqrt(yy**2 + xx**2) / r
            ang = np.arctan2(yy, xx)
            rim = 1 + 0.18 * np.sin(ang * rng.integers(5, 9) + rng.uniform(0, 6.3))
            inside = d < rim
            light = np.clip(1 - d, 0, 1) ** 0.6 * (0.8 + 0.2 * np.clip((-yy + xx) / (r * 1.4), -1, 1))
            sy = int(rng.integers(0, len(detail) - 49))
            sx = int(rng.integers(0, detail.shape[1] - 49))
            strands = detail[sy : sy + 49, sx : sx + 49]
            if rng.random() < 0.5:
                strands = strands.T
            tone = np.clip(0.42 + 0.42 * light + 0.8 * strands, 0, 1)
            win = (slice(cy - 24, cy + 25), slice(cx - 24, cx + 25))
            on = inside & mask[win]
            region = target[win]
            region[on, 0] = region[on, 1] = region[on, 2] = tone[on]
            region[on, 3] = np.where(d[on] < rim[on] - 0.12, 1.0, edge_alpha)

    out = g.copy()
    # The inner cap: dark between the clumps, clumps close together over it.
    base = out[inner_mask]
    base[:, :3] = 0.4
    base[:, 3] = 1.0
    out[inner_mask] = base
    clumps(out, inner_mask, 1400, 9, 15, 1.0)
    # The outer cap: only clumps, with gaps between them where the inner shows.
    out[outer] = 0
    clumps(out, outer_mask, 700, 10, 17, 0.0)
    return save_texture("curly", out)


def curly_fit(proxy, body, sex):
    f = mc.Fitted(proxy, body)
    isl = f.islands()
    rng = rng_for("curly", sex)
    bvh, _ = body.bvh({})
    centres = f.face_uv_centres()
    outer_cap = isl[0] if centres[isl[0], 0].mean() > 0.5 else isl[1]
    cards = [k for k in isl[2:]]
    starts = np.cumsum([0] + [len(x) for x in f.faces])
    width = (CURL_STRIP[2] - CURL_STRIP[0]) * 0.2
    for k in cards:
        u0 = rng.uniform(CURL_STRIP[0], CURL_STRIP[2] - width)
        for i in k:
            uv = f.corner_uv[starts[i] : starts[i + 1]]
            uv[:, 0] = u0 + (uv[:, 0] - CURL_STRIP[0]) / (CURL_STRIP[2] - CURL_STRIP[0]) * width
    # (More volume: the outer cap and the cards further off the head, the more the further out they are.)
    moved = sorted({v for i in list(outer_cap) + [i for k in cards for i in k] for v in f.faces[i]})
    loc, nrm, d = mc.nearest(bvh, f.co[moved])
    f.co[moved] += nrm * np.clip(d * 0.35 + 0.003, 0, 0.012)[:, None]
    return f


RESTYLE["curly"] = (curly_fit, curly_texture)


def make(style, keys=None):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    proxy = mc.Proxy("hair", STYLES[style])
    fit, texture = RESTYLE.get(style, (None, None))
    image = texture(proxy) if texture else save_texture(style, grey(mc.load_rgba(proxy.texture(), SIZE)))

    def fitted(body, sex):
        return fit(proxy, body, sex) if fit else mc.Fitted(proxy, body, keys)

    return finish(style, fitted, image)


if __name__ == "__main__":
    which = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else list(STYLES)
    for s in which:
        make(s)
