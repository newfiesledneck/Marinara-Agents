"""Eyebrow and eyelash textures baked from MakeHuman community strand meshes, for light cards.

Mindfront's eyebrows and eyelashes (MakeHuman community packs eyebrows01_cc0 and eyelashes01_cc0; each
item's .mhclo says `author Mindfront (Sweden)`, `license CC0`) model every hair: 9 to 28 thousand vertices
a pair of brows, 11 to 20 thousand a set of lashes, too heavy for the avatar. This script fits one of them
and one of MakeHuman's system cards (CARD: eyebrow009 for the brows, eyelashes02 for the lashes; 124 and 250
vertices, CC0) to the hm08 base mesh through their .mhclo files, takes every hair's vertices to the nearest
place on the card (and so to a place in the card's texture), and draws the hairs there: grey, darker at
the root, with alpha where hairs are. The avatar can then wear the card with this texture and get the
strands' look at the card's cost. Both are read as data; nothing from the packs is run.

How a hair lands on the card: a brow vertex is first lifted onto the skin if it's under it (the roots go
about 1 mm in), then carried along the skin's normal to the card (the card bends over the brow ridge, and
its nearest place jumps across a bend); a lash vertex, or a brow vertex whose normal misses the card, goes
to the card's nearest triangle. Either takes its texture place by that triangle's barycentric coordinates
(extended past its edges for the few tips that reach past the card). Each hair is drawn only into the
texture island of the card part it lies on (left brow, right brow; each lid's strip), clipped to that
island and faded over its last few pixels, so a tip past the card's edge never paints into a neighbouring
island. Drawn 4 times larger and averaged down, so alpha is each pixel's share covered by hairs; tips are
drawn over roots.

Run (BLENDER: your Blender executable):

    "$BLENDER" --background --factory-startup --python packages/3d-avatar-maker/assets/scripts/bake_brows.py -- --out <folder> [--size 512] [--only brow-thin,lash-full] [--render]

Writes <out>/<style>.png for each style in STYLES (RGBA, size x size: the card's whole texture square, in
its own layout, so it replaces the card's MakeHuman texture as it is), and with --render close-up renders of
the hm08 face (<out>/compare-<brow>-<lash>.png): MakeHuman's eyebrow001 and eyelashes01, the same cards as
the bake's with MakeHuman's own textures, the strand meshes themselves, and the cards with the baked textures.
The same input gives the same pictures.
"""

import argparse
import math
import os
import sys
import zlib

import bpy
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import wwavatar as wa  # noqa: E402

# The card each kind is baked onto (a MakeHuman system proxy; its texture square is what gets drawn). Of the
# system cards these cover the Mindfront hairs best: eyebrow009 has 0-2% of their vertices past its edge,
# eyelashes02 4-8%.
CARD = {"eyebrows": "eyebrow009", "eyelashes": "eyelashes02"}
PACK = {"eyebrows": "eyebrows01_cc0", "eyelashes": "eyelashes01_cc0"}
# Our name: (kind, Mindfront item). All CC0, author Mindfront.
STYLES = {
    "brow-thin": ("eyebrows", "mindfront_eyebrows_02"),
    "brow-natural": ("eyebrows", "mindfront_eyebrows_04"),
    "brow-thick": ("eyebrows", "mindfront_eyebrows_07"),
    "brow-arched": ("eyebrows", "mindfront_eyebrows_09"),
    "lash-natural": ("eyelashes", "mindfront_eyelashes_01"),
    "lash-full": ("eyelashes", "mindfront_eyelashes_05"),
}
SUPER = 4  # drawn this many times larger, then averaged down
ROOT_GREY = 0.62  # a hair's grey at its root; 1.0 at its tip
HAIR_SPREAD = 0.12  # each hair's grey varies by up to this much either way
STRETCH = 2.5  # faces stretched more than this on the card are left out
FEATHER = 4  # pixels (at 512; more at larger sizes) over which hairs fade out at the card's edge
ALPHA_GAIN = 1.3  # coverage a to alpha 1 - (1 - a)^gain: thin hairs a little more solid, as overlapping hairs look
# The render's colours (make_avatar.py's PARTS) and the system textures' alpha stretch (its HAIR_ALPHA).
TINT = {"eyebrows": 0x30221A, "eyelashes": 0x141010}
SKIN = (0.80, 0.58, 0.47)
HAIR_ALPHA = (0.2, 0.75)


def log(what):
    print(f"[bake_brows] {what}", flush=True)


# ── Fitting and projecting ────────────────────────────────────────────────────────────────────────


def proxy_path(kind, item, system):
    root = wa.assets_dir() if system else os.path.join(wa.extracted_dir(), PACK[kind])
    return os.path.join(root, kind, item, item + ".mhclo")


def check_licence(path):
    """The item's own header must say CC0 (the packs' catalogue isn't enough: some items' files say AGPL)."""
    head = {}
    with open(path, encoding="utf-8", errors="replace") as f:
        for line in f:
            if not line.startswith("#"):
                break
            words = line[1:].split(None, 1)
            if len(words) == 2:
                head[words[0].lower()] = words[1].strip()
    if head.get("license", "").upper() != "CC0":
        raise SystemExit(f"{path}: licence {head.get('license')!r}, not CC0")
    return head.get("author", "")


def triangles(faces, face_uv):
    tri, tri_uv, tri_face = [], [], []
    for k, (f, fu) in enumerate(zip(faces, face_uv)):
        for i in range(1, len(f) - 1):
            tri.append((f[0], f[i], f[i + 1]))
            tri_uv.append((fu[0], fu[i], fu[i + 1]))
            tri_face.append(k)
    return np.array(tri), np.array(tri_uv), np.array(tri_face)


def islands(card):
    """The card's texture islands: faces joined where they share a texture vertex. Returns each face's island."""
    parent = list(range(len(card.uv)))

    def find(a):
        while parent[a] != a:
            parent[a] = parent[parent[a]]
            a = parent[a]
        return a

    for fu in card.face_uv:
        for a in fu[1:]:
            ra, rb = find(fu[0]), find(a)
            if ra != rb:
                parent[max(ra, rb)] = min(ra, rb)
    roots = [find(fu[0]) for fu in card.face_uv]
    names = {r: i for i, r in enumerate(sorted(set(roots)))}
    return np.array([names[r] for r in roots])


def project(points, card_co, card, normals=None):
    """Each point's place in the card's texture, the card face it lies over, and whether it's past the card.
    With `normals` (the skin's, at each point) a point goes along its normal to the card, else (or where that
    misses the card) to the card's nearest place."""
    tri, tri_uv, tri_face = triangles(card.faces, card.face_uv)
    bvh = BVHTree.FromPolygons(card_co.tolist(), tri.tolist())
    hit = np.zeros(len(points), np.int64)
    target = points.copy()
    for k, p in enumerate(points):
        if normals is not None:
            n = Vector(normals[k])
            loc, _, idx, _ = bvh.ray_cast(Vector(p) - n * 0.006, n, 0.016)
            if idx is not None:
                hit[k], target[k] = idx, np.array(loc)
                continue
        hit[k] = bvh.find_nearest(Vector(p))[2]
    points = target
    T = card_co[tri[hit]]
    e1, e2, d = T[:, 1] - T[:, 0], T[:, 2] - T[:, 0], points - T[:, 0]
    a11, a12, a22 = (e1 * e1).sum(1), (e1 * e2).sum(1), (e2 * e2).sum(1)
    b1, b2 = (d * e1).sum(1), (d * e2).sum(1)
    det = a11 * a22 - a12**2
    s = (a22 * b1 - a12 * b2) / det
    t = (a11 * b2 - a12 * b1) / det
    U = card.uv[tri_uv[hit]]
    uv = U[:, 0] + s[:, None] * (U[:, 1] - U[:, 0]) + t[:, None] * (U[:, 2] - U[:, 0])
    past = (s < -0.02) | (t < -0.02) | (s + t > 1.02)
    return uv, tri_face[hit], past


def hairs(n, faces):
    """Which hair each vertex belongs to (the strand mesh's connected pieces)."""
    label = np.arange(n)
    f = np.array(faces)
    while True:
        low = label[f].min(1)
        new = label.copy()
        np.minimum.at(new, f.ravel(), np.repeat(low, f.shape[1]))
        new = new[new]
        if np.array_equal(new, label):
            return np.unique(label, return_inverse=True)[1]
        label = new


def strand_v(prox, label):
    """Each strand vertex's place from root (0) to tip (1): its own texture's v (Mindfront lays each hair out
    with its root at the bottom), stretched to 0-1 over each hair."""
    v = np.zeros(len(prox.refs))
    count = np.zeros(len(prox.refs))
    for f, fu in zip(prox.faces, prox.face_uv):
        for a, b in zip(f, fu):
            v[a] += prox.uv[b, 1]
            count[a] += 1
    v /= np.maximum(count, 1)
    lo = np.full(label.max() + 1, np.inf)
    hi = np.full(label.max() + 1, -np.inf)
    np.minimum.at(lo, label, v)
    np.maximum.at(hi, label, v)
    return (v - lo[label]) / np.maximum(hi[label] - lo[label], 1e-9)


def to_skin(points, skin):
    """Points under the skin (a brow hair's root goes about 1 mm in) moved up onto it, and the skin's normal
    under each point."""
    out = points.copy()
    normals = np.zeros_like(points)
    for k, p in enumerate(points):
        loc, nrm, _, _ = skin.find_nearest(Vector(p))
        normals[k] = nrm
        if (Vector(p) - loc).dot(nrm) < 0:
            out[k] = np.array(loc + nrm * 0.0001)
    return out, normals


def metres_per_uv(co, card):
    """The card's scale: metres of card per unit of its texture (the median over its edges)."""
    r = []
    for f, fu in zip(card.faces, card.face_uv):
        for a, b, ua, ub in zip(f, f[1:] + f[:1], fu, fu[1:] + fu[:1]):
            duv = np.linalg.norm(card.uv[ua] - card.uv[ub])
            if duv > 1e-6:
                r.append(np.linalg.norm(co[a] - co[b]) / duv)
    return float(np.median(r))


# ── Drawing in texture space ──────────────────────────────────────────────────────────────────────


def raster(tris, values, size, grey=None, cover=None):
    """Triangles (m, 3, 2) in pixels (x, rows from the bottom) drawn in order, their per-corner values
    (m, 3) interpolated; returns (grey, covered)."""
    grey = np.zeros((size, size), np.float32) if grey is None else grey
    cover = np.zeros((size, size), bool) if cover is None else cover
    for p, val in zip(tris, values):
        x0, y0 = np.floor(p.min(0)).astype(int)
        x1, y1 = np.ceil(p.max(0)).astype(int)
        x0, y0, x1, y1 = max(x0, 0), max(y0, 0), min(x1, size - 1), min(y1, size - 1)
        if x1 < x0 or y1 < y0:
            continue
        det = (p[1, 0] - p[0, 0]) * (p[2, 1] - p[0, 1]) - (p[2, 0] - p[0, 0]) * (p[1, 1] - p[0, 1])
        if abs(det) < 1e-9:
            continue
        X, Y = np.meshgrid(np.arange(x0, x1 + 1) + 0.5, np.arange(y0, y1 + 1) + 0.5)
        l1 = ((X - p[0, 0]) * (p[2, 1] - p[0, 1]) - (p[2, 0] - p[0, 0]) * (Y - p[0, 1])) / det
        l2 = ((p[1, 0] - p[0, 0]) * (Y - p[0, 1]) - (X - p[0, 0]) * (p[1, 1] - p[0, 1])) / det
        inside = (l1 >= 0) & (l2 >= 0) & (l1 + l2 <= 1)
        if not inside.any():
            continue
        g = val[0] + l1 * (val[1] - val[0]) + l2 * (val[2] - val[0])
        gs, cs = grey[y0 : y1 + 1, x0 : x1 + 1], cover[y0 : y1 + 1, x0 : x1 + 1]
        gs[inside] = g[inside]
        cs[inside] = True
    return grey, cover


def box_blur(a, r):
    """A picture averaged over (2r + 1)-pixel squares (the edges padded with zeros)."""
    k = 2 * r + 1
    p = np.pad(a, r + 1)
    c = p.cumsum(0).cumsum(1)
    return (c[k:, k:] - c[:-k, k:] - c[k:, :-k] + c[:-k, :-k])[: a.shape[0], : a.shape[1]] / k**2


def quads_to_tris(faces):
    return [(f[0], f[i], f[i + 1]) for f in faces for i in range(1, len(f) - 1)]


def skin_bvh(base, base_co):
    """The hm08 body's surface (its helpers left out), for lifting brow roots onto it."""
    return BVHTree.FromPolygons(base_co.tolist(), base.quads[base.faces_of("body")].tolist())


def bake(name, size, base_co, skin):
    """Style `name` as RGBA pixels (size x size, rows from the bottom, grey sRGB values with straight alpha) in
    the texture layout of CARD[its kind], and a line saying what it was made from. `base_co` is the hm08 base
    mesh in Blender's axes (wa.to_blender(wa.Base().co)) and `skin` its skin_bvh."""
    kind, item = STYLES[name]
    path = proxy_path(kind, item, system=False)
    author = check_licence(path)
    prox = wa.Proxy(path)
    card = wa.Proxy(proxy_path(kind, CARD[kind], system=True))
    pts, card_co = prox.fit(base_co), card.fit(base_co)
    normals = None
    if kind == "eyebrows":
        # (Brows go to the card along the skin's normal: the card bends over the brow ridge, and its nearest
        # place jumps from one side of a bend to the other.)
        pts, normals = to_skin(pts, skin)
    uv, on_face, past = project(pts, card_co, card, normals)
    island_of_face = islands(card)
    n_isl = island_of_face.max() + 1
    # Islands that share their texels with another (a card drawn the same on both sides) get one side only.
    S = size * SUPER
    masks = []
    for i in range(n_isl):
        fs = [card.face_uv[k] for k in range(len(card.faces)) if island_of_face[k] == i]
        t = card.uv[np.array(quads_to_tris(fs))] * S
        masks.append(raster(t, np.zeros((len(t), 3)), S)[1])
    keep = list(range(n_isl))
    for i in range(n_isl):
        for j in range(i + 1, n_isl):
            both = (masks[i] & masks[j]).sum() / max(1, min(masks[i].sum(), masks[j].sum()))
            if both > 0.2:
                side_j = card_co[np.unique([card.faces[k] for k in np.nonzero(island_of_face == j)[0]])][:, 0].mean()
                if j in keep and side_j < 0:
                    keep.remove(j)
                    log(f"{name}: islands {i} and {j} share texels; drawing the left side's only")
    # Hairs: grey from root to tip, each hair a little lighter or darker; drawn tips over roots.
    rng = np.random.default_rng(zlib.crc32(name.encode()))
    label = hairs(len(pts), prox.faces)
    shift = rng.uniform(-HAIR_SPREAD, HAIR_SPREAD, label.max() + 1)
    sv = strand_v(prox, label)
    g = np.clip((ROOT_GREY + (1 - ROOT_GREY) * sv) * (1 + shift[label]), 0, 1)
    faces = np.array(prox.faces)
    face_isl = island_of_face[on_face[faces[:, 0]]]
    # (A face stretched much more on the card than it is, where hairs cross a fold of the card, is left out.)
    span3 = np.ptp(pts[faces], axis=1).max(1)
    span_uv = np.ptp(uv[faces], axis=1).max(1) * metres_per_uv(card_co, card)
    torn = (span_uv > STRETCH * span3) & (span_uv > 0.0005)
    face_isl[torn] = -1
    order = np.argsort(sv[faces].mean(1) + rng.uniform(0, 0.05, label.max() + 1)[label[faces[:, 0]]], kind="stable")
    grey = np.zeros((S, S), np.float32)
    cover = np.zeros((S, S), bool)
    for i in keep:
        sel = order[face_isl[order] == i]
        tri = np.array(quads_to_tris(faces[sel]))
        gi, ci = raster(uv[tri] * S, g[tri], S)
        ci &= masks[i]
        grey[ci] = gi[ci]
        cover |= ci
    # Averaged down: alpha the share covered, grey the covered part's mean; the empty pixels the hairs' middle grey.
    c = cover.reshape(size, SUPER, size, SUPER).mean(axis=(1, 3))
    gsum = (grey * cover).reshape(size, SUPER, size, SUPER).sum(axis=(1, 3))
    gmean = gsum / np.maximum(cover.reshape(size, SUPER, size, SUPER).sum(axis=(1, 3)), 1)
    alpha = 1 - (1 - c) ** ALPHA_GAIN
    # Faded over the last FEATHER pixels inside the card's edge, so hairs past it end softly, not in a line.
    inside = np.zeros((S, S), bool)
    for i in keep:
        inside |= masks[i]
    inside = inside.reshape(size, SUPER, size, SUPER).mean(axis=(1, 3))
    alpha *= np.clip((box_blur(inside, FEATHER * size // 512) - 0.5) * 2, 0, 1) ** 0.5
    mid = float(np.median(gmean[c > 0.3])) if (c > 0.3).any() else 0.8
    gmean[c < 0.05] = mid
    out = np.stack([gmean, gmean, gmean, alpha], axis=2)
    note = (f"{name}: {item} ({author}, CC0) on {CARD[kind]}: {len(pts)} vertices, {len(prox.faces)} faces, "
            f"{label.max() + 1} hairs, {past.mean() * 100:.1f}% of vertices past the card, {torn.sum()} faces left out")
    return out, note


def save_png(path, rgba):
    h, w = rgba.shape[:2]
    image = bpy.data.images.new(os.path.basename(path), w, h, alpha=True)
    image.pixels.foreach_set(np.clip(rgba, 0, 1).astype(np.float32).ravel())
    image.filepath_raw = path
    image.file_format = "PNG"
    image.save()
    bpy.data.images.remove(image)


# ── Renders: the face with each version ──────────────────────────────────────────────────────────


def srgb_to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def hex_linear(h):
    return tuple(srgb_to_linear(((h >> s) & 255) / 255) for s in (16, 8, 0))


def mesh_object(name, co, faces, face_uv=None, uv=None, smooth=True):
    me = bpy.data.meshes.new(name)
    me.from_pydata(co.tolist(), [], [list(map(int, f)) for f in faces])
    if face_uv is not None:
        layer = me.uv_layers.new(name="UVMap")
        flat = np.array([uv[i] for fu in face_uv for i in fu], np.float32)
        me.uv_layers["UVMap"].data.foreach_set("uv", flat.ravel())
        del layer
    me.validate()
    me.update()
    me.shade_smooth() if smooth else me.shade_flat()
    obj = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(obj)
    return obj


def plain_material(name, colour, roughness=0.5):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*colour, 1)
    bsdf.inputs["Roughness"].default_value = roughness
    return m


def card_material(name, image, tint):
    """As make_avatar.py's eyebrows and eyelashes: the texture's grey times the colour, cut out by its alpha."""
    m = plain_material(name, (1, 1, 1), 0.6)
    nodes, links = m.node_tree.nodes, m.node_tree.links
    bsdf = nodes["Principled BSDF"]
    tex = nodes.new("ShaderNodeTexImage")
    tex.image = image
    mix = nodes.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    mix.blend_type = "MULTIPLY"
    mix.inputs["Factor"].default_value = 1.0
    links.new(tex.outputs["Color"], mix.inputs["A"])
    mix.inputs["B"].default_value = (*tint, 1)
    links.new(mix.outputs["Result"], bsdf.inputs["Base Color"])
    links.new(tex.outputs["Alpha"], bsdf.inputs["Alpha"])
    bsdf.inputs["Specular IOR Level"].default_value = 0.0
    m.surface_render_method = "BLENDED"
    return m


def system_texture(kind, style):
    """A system card's texture made as make_avatar.py's hair_texture makes it (grey, alpha stretched)."""
    prox = wa.Proxy(proxy_path(kind, style, system=True))
    src = bpy.data.images.load(prox.texture)
    w, h = src.size
    a = np.array(src.pixels[:], np.float64).reshape(h, w, 4)
    bpy.data.images.remove(src)
    lum = a[..., :3].mean(axis=2)
    hair = a[..., 3] > 0.5
    top = np.percentile(lum[hair], 90) if hair.any() else 1.0
    g = np.clip(lum / max(float(top), 1e-3) * 0.95, 0, 1)
    g[a[..., 3] < 0.15] = np.median(g[hair]) if hair.any() else 0.5
    alpha = np.clip((a[..., 3] - HAIR_ALPHA[0]) / (HAIR_ALPHA[1] - HAIR_ALPHA[0]), 0, 1)
    image = bpy.data.images.new(f"sys-{style}", w, h, alpha=True)
    image.pixels.foreach_set(np.stack([g, g, g, alpha], axis=2).astype(np.float32).ravel())
    image.pack()
    return image


def look_at(cam, target, direction, distance):
    d = Vector(direction).normalized()
    cam.location = Vector(target) - d * distance
    cam.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()


def render(path):
    bpy.context.scene.render.filepath = path
    bpy.ops.render.render(write_still=True)
    im = bpy.data.images.load(path)
    w, h = im.size
    a = np.array(im.pixels[:], np.float32).reshape(h, w, 4)
    bpy.data.images.remove(im)
    os.remove(path)
    return a


def renders(base, base_co, pairs):
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.cycles.samples = 96
    sc.cycles.seed = 0
    sc.cycles.use_denoising = True
    sc.cycles.transparent_max_bounces = 32
    sc.render.resolution_x, sc.render.resolution_y = 560, 360
    sc.render.image_settings.file_format = "PNG"
    sc.view_settings.view_transform = "Standard"
    world = bpy.data.worlds.new("w")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.35, 0.35, 0.37, 1)
    sc.world = world
    # The face: hm08's body and its eye helpers.
    body_faces = base.quads[base.faces_of("body")]
    body = mesh_object("body", base_co, body_faces)
    body.modifiers.new("sub", "SUBSURF").levels = 2
    body.data.materials.append(plain_material("skin", SKIN, 0.55))
    eyes = mesh_object("eyes", base_co, base.quads[base.faces_of("helper-l-eye", "helper-r-eye")])
    eyes.modifiers.new("sub", "SUBSURF").levels = 2
    eyes.data.materials.append(plain_material("eye", (0.75, 0.73, 0.70), 0.15))
    face = Vector(base_co[base.groups["helper-l-eye"]].mean(0)) * Vector((0, 1, 1))
    for name, offset, energy, size in (("key", (-0.35, -0.8, 0.45), 9, 0.5), ("fill", (0.5, -0.6, 0.05), 3, 0.8)):
        light = bpy.data.lights.new(name, "AREA")
        light.energy, light.size = energy, size
        lo = bpy.data.objects.new(name, light)
        sc.collection.objects.link(lo)
        look_at(lo, face, -Vector(offset), Vector(offset).length)
    cam_data = bpy.data.cameras.new("cam")
    cam_data.lens = 100
    cam = bpy.data.objects.new("cam", cam_data)
    sc.collection.objects.link(cam)
    sc.camera = cam

    def card_object(kind, style, image, label):
        prox = wa.Proxy(proxy_path(kind, style, system=True))
        obj = mesh_object(label, prox.fit(base_co), prox.faces, prox.face_uv, prox.uv)
        obj.data.materials.append(card_material(label, image, hex_linear(TINT[kind])))
        return obj

    def strand_object(kind, item):
        prox = wa.Proxy(proxy_path(kind, item, system=False))
        obj = mesh_object(item, prox.fit(base_co), prox.faces, smooth=False)
        obj.data.materials.append(plain_material(item, hex_linear(TINT[kind]), 0.45))
        return obj

    system = [card_object("eyebrows", "eyebrow001", system_texture("eyebrows", "eyebrow001"), "sys-brow"),
              card_object("eyelashes", "eyelashes01", system_texture("eyelashes", "eyelashes01"), "sys-lash")]
    same = [card_object("eyebrows", CARD["eyebrows"], system_texture("eyebrows", CARD["eyebrows"]), "card-brow"),
            card_object("eyelashes", CARD["eyelashes"], system_texture("eyelashes", CARD["eyelashes"]), "card-lash")]
    eye_l = base_co[base.groups["helper-l-eye"]].mean(0)
    views = [((0, eye_l[1] - 0.02, eye_l[2] + 0.012), (0, 1, -0.05), 0.32),  # the face from the front
             (tuple(eye_l + np.array([0, 0, 0.008])), (-0.55, 1, -0.12), 0.2)]  # the left eye, three quarters
    for brow_name, lash_name in pairs:
        made = []
        for kind, nm in (("eyebrows", brow_name), ("eyelashes", lash_name)):
            made.append((kind, nm, STYLES[nm][1], bpy.data.images.load(os.path.join(ARGS.out, nm + ".png"))))
        strands = [strand_object(kind, item) for kind, _, item, _ in made]
        baked = [card_object(kind, CARD[kind], im, "baked-" + nm) for kind, nm, _, im in made]
        columns = [system, same, strands, baked]
        every = [o for col in columns for o in col]
        rows = []
        for target, direction, dist in views:
            look_at(cam, target, direction, dist)
            row = []
            for col in columns:
                for o in every:
                    o.hide_render = o not in col
                row.append(render(os.path.join(ARGS.out, "_frame.png")))
            rows.append(np.concatenate(row, axis=1))
        sheet = np.concatenate(rows[::-1], axis=0)  # (rows from the bottom: the first view on top)
        file = os.path.join(ARGS.out, f"compare-{brow_name}-{lash_name}.png")
        save_png(file, sheet)
        log(f"render: {file}")
        for o in strands + baked:
            bpy.data.objects.remove(o)


def main():
    global ARGS
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    ap = argparse.ArgumentParser(prog="bake_brows.py")
    ap.add_argument("--out", required=True, help="folder for the textures and renders")
    ap.add_argument("--size", type=int, default=512, help="texture size in pixels (512 or 1024)")
    ap.add_argument("--only", default="", help="comma-separated style names (default: all of STYLES)")
    ap.add_argument("--render", action="store_true", help="also render the face with each version")
    ARGS = ap.parse_args(argv)
    os.makedirs(ARGS.out, exist_ok=True)
    names = [n for n in ARGS.only.split(",") if n] or list(STYLES)
    base = wa.Base()
    base_co = wa.to_blender(base.co)
    skin = skin_bvh(base, base_co)
    for nm in names:
        out, note = bake(nm, ARGS.size, base_co, skin)
        file = os.path.join(ARGS.out, f"{nm}.png")
        save_png(file, out)
        log(f"{note} -> {file} ({os.path.getsize(file) // 1024} KB)")
    if ARGS.render:
        for o in list(bpy.data.objects):
            bpy.data.objects.remove(o)
        brows = [n for n in names if STYLES[n][0] == "eyebrows"]
        lashes = [n for n in names if STYLES[n][0] == "eyelashes"]
        if brows and lashes:
            pairs = [(b, lashes[min(i * len(lashes) // len(brows), len(lashes) - 1)]) for i, b in enumerate(brows)]
            renders(base, base_co, pairs)


ARGS = None
if __name__ == "__main__":
    main()
