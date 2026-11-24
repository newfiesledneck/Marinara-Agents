"""Outfit pieces from MakeHuman's CC0 clothes, fitted to the base avatar (avatar-male.glb and
avatar-female.glb): one GLB per piece, assets/models/outfit-mh_<piece>.glb, as make_outfit.py writes
them: a `male` and/or `female` mesh (the pack's male_* suits fit the man, its female_* suits the woman,
shoes and hats both), skinned to the body's skeleton, with the body's shape keys, and in each mesh's
extras `outfit`, `slot`, `body`, `layer`, `hides` and `parts`; materials `<piece>-<mesh>-<part>` with
`part` in their extras. Run (BLENDER: your Blender executable; add `-- mh_jeans mh_tee` for some):

    "$BLENDER" --background --factory-startup --python packages/3d-avatar-maker/assets/scripts/make_mh_clothes.py

The nails (nails_short, nails_medium, nails_long on the fingers, toenails) are Mindfront's CC0 nails from the
community pack bodyparts04_cc0 (`pack:` items, read from `wwavatar.extracted_dir`): a shell on each nail bed,
its outer surface lifted to just off the skin (its underside stays tucked under it), on the fingers' bones,
one plain colour the maker tints.

How (`wwmhclo.py` `Fitted.carried`): each suit is fitted through its .mhclo to MakeHuman's own version of our
body (the same targets, its helpers moved by them), so it sits exactly as MakeHuman would place it, then
carried onto our body (stood in our rest pose and smoothed) by how the body near each point moved. Its bone
weights and every shape key of the body come from the body near it the same way: near the skin, the skin
right under it; hanging off, a wide, even average of the body round it, so a skirt keeps its shape and never
splits between the legs. Cloth off the arms takes nothing from the arms (the hands hang beside a skirt in the
A-pose), and a limb's cloth nothing from the other limb. A suit is split into its pieces (top and legs, shoes
and socks) by its separate parts; then each piece is lifted off the skin wherever it would sink in (at rest and
with each key at 1), by one smooth swell rather than a push at each point, which left lumps. Pieces aren't
kept off each other or off the underwear here: the maker tucks inner layers under outer ones when they're
worn (src/layers.js). `fit: "helpers"` fits a piece the old way, on helpers rebuilt on our body.

Textures, 1024 px: a piece that reads as plain cloth (tees, jeans, trousers, shorts, skirt, leggings,
overalls, hats) gets a near-white greyscale copy of the pack's texture (its luminance over that of its
brightest cloth, lifted a little so no fold goes black), and the pack's colour as the material's base
colour factor, so the game can dye it. A piece that reads as a fixed design (the plaid shirt, the jacket,
the suit jacket with its shirt and tie, the striped blazer, the shoes) keeps the pack's colour texture
under a white factor. The MakeHuman logo printed on some tees is painted out.

Clothes from MakeHuman (makehumancommunity.org, CC0), fitted and adapted in Blender by ThatOneCan.
"""

import os
import sys

import bpy
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import wwmhclo as mc  # noqa: E402

SIZE = 1024
CLEARANCE = 0.0025  # how close cloth may come to the skin
NAIL_CLEARANCE = 0.0005  # how far a nail's outer surface stands off the skin (on the nail bed, not floating)
NAIL_COLOUR = (0xE6, 0xB3, 0xA4)  # sRGB, the body's own `nails` colour (make_avatar.py PARTS)
NAIL_ROUGHNESS = 0.3
MALE, FEMALE, BOTH = ("male",), ("female",), ("male", "female")
TOPS = ["torso", "upperarms", "forearms", "underwear-top"]
LEGS = ["hips", "thighs", "calves", "underwear-bottom"]

# Each piece: the pack's folder, which of its parts (`top`, `legs`, `shoes`, `socks`, `all`), the bodies it's
# made for, its slot and layer (1 next to the skin … 4 a hat, as make_outfit.py), what it hides (only
# what it covers whole), its texture (`tint`: greyscale under a colour, `colour`: the pack's colours),
# the part name, and where the MakeHuman logo is printed (a box in the texture, 0..1 from the top left, or a
# list of them).
# A region in `hides` is kept only if hiding it leaves no hole (`safe_hides`), unless it's in `force`;
# `skin=False` skips lifting faces over the skin between vertices (shoes and hats: solid things, not cloth);
# `cut=True` cuts the piece out by its texture's alpha (lace, glasses' clear lenses).
PIECES = {
    # The man's.
    "mh_denim_shirt": dict(src="male_casualsuit01", take="top", split="uv", sexes=MALE, slot="top", layer=1, hides=TOPS, tex="tint"),
    "mh_jeans_dark": dict(src="male_casualsuit01", take="legs", split="uv", sexes=MALE, slot="legs", layer=1, hides=LEGS, tex="tint"),
    "mh_longsleeve_tee": dict(src="male_casualsuit02", take="top", sexes=MALE, slot="top", layer=1, hides=TOPS, tex="tint", logo=(0.44, 0.03, 0.68, 0.26)),
    "mh_jeans": dict(src="male_casualsuit02", take="legs", sexes=MALE, slot="legs", layer=1, hides=LEGS, tex="tint"),
    "mh_plaid_shirt": dict(src="male_casualsuit03", take="top", sexes=MALE, slot="top", layer=1, hides=TOPS, tex="colour"),
    "mh_tee": dict(src="male_casualsuit04", take="top", sexes=MALE, slot="top", layer=1, hides=["torso"], tex="tint", logo=(0.43, 0.05, 0.67, 0.27)),
    "mh_jacket": dict(src="male_casualsuit05", take="top", sexes=MALE, slot="top", layer=2, hides=TOPS, tex="colour"),
    "mh_long_tee": dict(src="male_casualsuit06", take="top", sexes=MALE, slot="top", layer=1, hides=["torso"], tex="tint", logo=[(0.19, 0.10, 0.31, 0.18), (0.43, 0.10, 0.64, 0.21), (0.72, 0.13, 0.77, 0.19)]),
    "mh_suit_jacket": dict(src="male_elegantsuit01", take="top", sexes=MALE, slot="top", layer=2, hides=TOPS, tex="colour", part="suit"),
    "mh_suit_trousers": dict(src="male_elegantsuit01", take="legs", sexes=MALE, slot="legs", layer=1, hides=LEGS, tex="tint"),
    # (The worksuit's tee alone has a hole where the bib covers it: it comes only with the overalls.)
    "mh_workwear": dict(src="male_worksuit01", take=["top", "legs"], parts={"top": "shirt"}, sexes=MALE, slot="body", layer=2, hides=TOPS + LEGS, tex="tint"),
    "mh_overalls": dict(src="male_worksuit01", take="legs", sexes=MALE, slot="legs", layer=2, hides=LEGS, tex="tint"),
    # The woman's.
    "mh_female_tee": dict(src="female_casualsuit01", take="top", sexes=FEMALE, slot="top", layer=1, hides=["torso", "underwear-top"], tex="tint", logo=(0.66, 0.10, 0.91, 0.35)),
    "mh_female_jeans": dict(src="female_casualsuit01", take="legs", sexes=FEMALE, slot="legs", layer=1, hides=LEGS, tex="tint"),
    "mh_female_loose_tee": dict(src="female_casualsuit02", take="top", sexes=FEMALE, slot="top", layer=1, hides=["torso", "underwear-top"], tex="tint", logo=(0.66, 0.10, 0.91, 0.35)),
    "mh_female_shorts": dict(src="female_casualsuit02", take="legs", sexes=FEMALE, slot="legs", layer=1, hides=["hips", "underwear-bottom"], tex="tint"),
    "mh_female_blazer": dict(src="female_elegantsuit01", take="top", sexes=FEMALE, slot="top", layer=2, hides=TOPS, tex="colour"),
    "mh_female_skirt": dict(src="female_elegantsuit01", take="legs", sexes=FEMALE, slot="legs", layer=2, hides=["hips", "underwear-bottom"], tex="tint"),
    "mh_female_sport_top": dict(src="female_sportsuit01", take="top", sexes=FEMALE, slot="top", layer=1, hides=["underwear-top"], tex="tint"),
    "mh_female_leggings": dict(src="female_sportsuit01", take="legs", sexes=FEMALE, slot="legs", layer=1, hides=LEGS, tex="tint"),
    # Both.
    "mh_shoes_brown": dict(src="shoes01", take="all", sexes=BOTH, slot="feet", layer=2, hides=["feet"], tex="colour", part="shoe", skin=False, force=["feet"]),
    "mh_trainers_worn": dict(src="shoes02", take="all", sexes=BOTH, slot="feet", layer=2, hides=["feet"], tex="colour", part="shoe", skin=False, force=["feet"]),
    "mh_boots_black": dict(src="shoes03", take="all", sexes=BOTH, slot="feet", layer=2, hides=["feet"], tex="colour", part="shoe", skin=False, force=["feet"]),
    "mh_shoes_black": dict(src="shoes04", take="all", sexes=BOTH, slot="feet", layer=2, hides=["feet"], tex="colour", part="shoe", skin=False, force=["feet"]),
    "mh_trainers_white": dict(src="shoes05", take="all", sexes=BOTH, slot="feet", layer=2, hides=["feet"], tex="colour", part="shoe", skin=False, force=["feet"]),
    "mh_trainers_blue": dict(src="shoes06", take="all", sexes=BOTH, slot="feet", layer=2, hides=["feet"], tex="colour", part="shoe", skin=False, force=["feet"]),
    "mh_fedora": dict(src="fedora01", take="all", sexes=BOTH, slot="head", layer=4, hides=["hair"], tex="tint", part="felt", skin=False),
    "mh_fedora_cocked": dict(src="fedora_cocked", take="all", sexes=BOTH, slot="head", layer=4, hides=["hair"], tex="tint", part="felt", skin=False),
    # Nails (Mindfront's, CC0): solid shells, so only their outer surface is kept off the skin (`lift`), at
    # NAIL_CLEARANCE, and not off the underwear (`under`); `tex="plain"` is one colour, no texture.
    **{
        name: dict(src=f"pack:bodyparts04_cc0/clothes/{folder}", take="all", sexes=BOTH, slot=slot, layer=1, hides=[], tex="plain", part="nail", skin=False, clearance=NAIL_CLEARANCE, lift="outer", under=False)
        for name, folder, slot in (
            ("nails_short", "mindfront_nails_01_short", "nails"),
            ("nails_medium", "mindfront_nails_02_medium", "nails"),
            ("nails_long", "mindfront_nails_03_long", "nails"),
            ("toenails", "mindfront_nails_toes_01", "toenails"),
        )
    },
}
# Pieces the same as another in all but name (the same mesh and texture), left out.
SAME_AS = {}


def split(fitted, how, body):
    """The suit's faces by part: {"top": [...], "legs": [...]} (or shoes and socks); `none`: all one part."""
    if how == "none":
        return {"all": list(range(len(fitted.faces)))}
    if how == "uv":
        # Faces sharing a texture coordinate are one panel.
        parent = {}

        def find(a):
            while parent.setdefault(a, a) != a:
                parent[a] = parent[parent[a]]
                a = parent[a]
            return a

        for fu in fitted.proxy.face_uv:
            r = find(fu[0])
            for t in fu[1:]:
                rt = find(t)
                if rt != r:
                    parent[rt] = r
        groups = {}
        for i, fu in enumerate(fitted.proxy.face_uv):
            groups.setdefault(find(fu[0]), []).append(i)
        islands = list(groups.values())
    else:
        islands = fitted.islands()
    waist = body.J["pelvis"][2] + 0.08
    out = {}
    for faces in islands:
        vs = sorted({v for f in faces for v in fitted.faces[f]})
        z = fitted.co[vs, 2].mean()
        if fitted.co[:, 2].max() < 0.4:  # shoes: the sock is the part reaching up the leg
            key = "socks" if z > 0.09 else "shoes"
        else:
            key = "top" if z > waist else "legs"
        out.setdefault(key, []).extend(faces)
    return out


def hidden_under(mesh, hides):
    """Whether a piece hiding `hides` hides this underwear mesh (`underwear-top-bra`, …)."""
    return "underwear" in hides or any(mesh.startswith(h + "-") for h in hides if h.startswith("underwear-"))


def remove_logo(rgb, box):
    """Paints out a printed logo inside `box`: pixels far from the cloth's own colour there are filled from
    the cloth round them."""
    h, w = rgb.shape[:2]
    x0, y0, x1, y1 = box
    c0, c1 = int(x0 * w), int(x1 * w)
    r0, r1 = int((1 - y1) * h), int((1 - y0) * h)  # (rows count from the bottom)
    region = rgb[r0:r1, c0:c1]
    median = np.median(region.reshape(-1, 3), axis=0)
    dist = np.linalg.norm(region - median, axis=2)
    bad = dist > 0.08
    m = mc.box_blur(bad.astype(np.float64), 5) > 0.01
    region = mc.fill_outside(region, ~m)
    out = rgb.copy()
    out[r0:r1, c0:c1] = region
    return np.clip(out, 0, 1)


def piece_texture(name, proxy, fitted, spec, part_of):
    """The piece's texture and each part's colour factor (linear): {part: (r, g, b)}."""
    size = spec.get("size", SIZE)  # (`size`: a smaller picture, for a pack texture of a few flat colours)
    rgba = mc.load_rgba(proxy.texture(), size)
    rgb = rgba[..., :3]
    starts = np.cumsum([0] + [len(f) for f in fitted.faces])
    corners = [fitted.corner_uv[starts[i] : starts[i + 1]] for i in range(len(fitted.faces))]
    mask = mc.uv_mask(corners, size)
    logos = spec.get("logo") or []
    for box in [logos] if isinstance(logos, tuple) else logos:
        rgb = remove_logo(rgb, box)
    parts = sorted(set(part_of))

    def saved(out):
        # (`cut`: the pack's alpha kept, as PNG, for a piece cut out by it: lace, a frame round clear lenses.)
        if spec.get("cut"):
            return mc.save_image(f"outfit-{name}", np.concatenate([out, rgba[..., 3:]], axis=2))
        return mc.save_image(f"outfit-{name}", out, fmt="JPEG", quality=88)

    if spec["tex"] == "colour":
        return saved(mc.fill_outside(rgb, mask)), {p: (1.0, 1.0, 1.0) for p in parts}
    # (The pack's ambient occlusion maps are left out: baked with the whole suit on, they darken a piece
    # where another part covered it, the waistband under a tee.)
    lum = mc.luminance(rgb)
    g = np.zeros_like(lum)
    factors = {}
    for p in parts:
        # Each part (a shirt and the overalls over it) scaled by its own brightest cloth, under its own colour.
        own = mc.uv_mask([c for c, q in zip(corners, part_of) if q == p], size, grow=1)
        hi = np.percentile(lum[own], 92)
        gp = 0.12 + 0.88 * np.clip(lum / max(hi, 1e-3), 0, 1)  # (never black: the colour still shows in folds)
        g = np.where(own, gp, g)
        lin = mc.srgb_to_linear(rgb[own])
        f = lin.mean(0) / max(mc.srgb_to_linear(gp[own]).mean(), 1e-3)
        factors[p] = tuple(float(c) for c in np.clip(f / max(f.max(), 1.0), 0, 1))
    return saved(mc.fill_outside(np.repeat(g[..., None], 3, axis=2), mask)), factors


def safe_hides(fitted, body, hides, rings=6):
    """The regions of `hides` the piece can hide without leaving a hole. The game hides a body triangle when
    its three vertices are all in hidden regions; that leaves a gap wherever such a triangle isn't under the
    piece (a ray out from the skin doesn't meet it) and is near skin that still shows, within `rings` edges of
    it (a toe through a shoe's cap can go, the skin above a tee's neckline can't). Drops the region with the
    most such triangles until none are left (under 0.2% of a region's, a crease, are let through). Returns
    the regions kept and each candidate's share of covered vertices."""
    covered = mc.coverage(fitted, body)
    regions = [h for h in hides if h in mc.REGIONS]
    share = {r: round(float(covered[body.region == r].mean()), 4) for r in regions}
    tris = body.tris
    tri_region = body.region[tris]
    edges = np.concatenate([tris[:, [0, 1]], tris[:, [1, 2]], tris[:, [2, 0]]])
    while regions:
        hidden = np.isin(body.region, regions)
        # How far each vertex is from skin that shows, in edges (up to `rings`).
        near = ~hidden
        for _ in range(rings):
            grow = near.copy()
            grow[edges[near[edges[:, 0]], 1]] = True
            grow[edges[near[edges[:, 1]], 0]] = True
            near = grow
        inside = hidden[tris].all(1)
        gap = inside & (~covered[tris] & near[tris]).any(1)
        holes = {r: int((gap & (tri_region[:, 0] == r)).sum()) for r in regions}
        sizes = {r: max(int((inside & (tri_region[:, 0] == r)).sum()), 1) for r in regions}
        worst = max(regions, key=lambda r: holes[r] / sizes[r])
        if holes[worst] / sizes[worst] <= 0.002:
            break
        regions.remove(worst)
    kept = [h for h in hides if h not in mc.REGIONS or h in regions]
    return kept, share, covered


_fits = {}


def fitted_source(src, body, how="carried"):
    key = (src, body.sex, how)
    if key not in _fits:
        kind = "clothes"
        # (Only the body's own keys, not the face and body sliders' `<slider>.lo`/`.hi`: the maker carries
        # those onto clothes from the skin at run time, src/avatar.js `carried`.)
        keys = [k for k in body.key_names if "." not in k]
        proxy = mc.Proxy(kind, src)
        # `carried`: fitted to MakeHuman's own version of the body and carried onto ours (wwmhclo
        # Fitted.carried); `helpers`: fitted to MakeHuman's helpers rebuilt on our body, each key fitted again.
        _fits[key] = mc.Fitted.carried(proxy, body, keys) if how == "carried" else mc.Fitted(proxy, body, keys)
    return _fits[key]


def outer(fitted, body):
    """Each vertex: whether it's on the piece's outer surface (its normal turned away from the skin), not a
    solid shell's underside."""
    me = bpy.data.meshes.new("outer")
    me.from_pydata(fitted.co.tolist(), [], fitted.faces)
    me.update()
    a = np.zeros(len(me.vertices) * 3)
    me.vertices.foreach_get("normal", a)
    bpy.data.meshes.remove(me)
    _, nrm, _ = mc.nearest(body.bvh()[0], fitted.co)
    return (a.reshape(-1, 3) * nrm).sum(1) > 0.3


def make(name, bodies):
    spec = PIECES[name]
    objects, rigs, stats, image, factor = [], [], {}, None, None
    hides_by_sex = {}
    for sex in spec["sexes"]:
        body = bodies[sex]
        how = spec.get("fit", "carried")
        whole = fitted_source(spec["src"], body, how)
        parts = split(whole, spec.get("split", "mesh"), body)
        take = list(parts) if spec["take"] == "all" else spec["take"] if isinstance(spec["take"], list) else [spec["take"]]
        faces = sorted(f for t in take for f in parts[t])
        piece = whole.subset(faces)
        main = spec.get("part", "cloth")
        # Each face's material part: the piece's own, or by the suit's part (`parts`: {"top": "shirt"}), socks apart.
        named = {**{"socks": "sock"}, **spec.get("parts", {})}
        of = {f: named.get(t, main) for t in take for f in parts[t]}
        part_of = np.array([of[f] for f in faces], dtype=object)
        configs = {k: {k: 1.0} for k in piece.key_names}
        lift = outer(piece, body) if spec.get("lift") == "outer" else None
        before = piece.clipping({}, mask=lift)
        if how == "carried":
            # Kept off the skin (under its faces as well as its vertices) by one smooth swell where it sinks in.
            # Not off the underwear: the maker draws underwear and inner layers under outer ones at run time
            # (src/layers.js `tuckUnder`), as it does a shirt under a jacket.
            report = piece.push_out(spec.get("clearance", CLEARANCE), configs, mask=lift, skin=spec.get("skin", True), smooth=True)
        else:
            # (Kept outside the underwear it doesn't hide, and the skin kept under its faces as well as its vertices.)
            under = [u for u in body.under if not hidden_under(u, spec["hides"])] if spec.get("under", True) else []
            report = piece.push_out(spec.get("clearance", CLEARANCE), configs, mask=lift, under=under, skin=spec.get("skin", True))
            # Cloth close to the skin takes the weights of the skin right under it, not those MakeHuman's helper
            # spreads over both legs at the crotch (which let the back thigh come through when walking); cloth
            # hanging further off keeps the fitted weights, smoother.
            skin_w, dist = body.skin_weights(piece.co)
            near = 1 - mc.smoothstep(0.015, 0.04, dist)
            piece.W = piece.W * (1 - near[:, None]) + skin_w * near[:, None]
        piece.limit_weights(4)
        combo = {"heavy": 1.0, "muscle": 1.0, "belly": 1.0, ("bust" if sex == "female" else "chest"): 1.0}
        after = {k: piece.clipping(v, depth=0.0005, mask=lift) for k, v in [("rest", {})] + list(configs.items())}
        combo_clip = piece.clipping(combo, depth=0.0005, mask=lift)
        names = sorted(set(part_of), key=lambda p: (p != main, p))
        if spec["tex"] == "plain":
            factor = {p: tuple(float(c) for c in mc.srgb_to_linear(np.array(NAIL_COLOUR) / 255)) for p in names}
        elif image is None:
            image, factor = piece_texture(name, piece.proxy, piece, spec, part_of)
        mats = []
        for p in names:
            rough = NAIL_ROUGHNESS if spec["tex"] == "plain" else 0.85 if p != "shoe" else 0.6
            cutoff = 0.5 if spec.get("cut") else None
            m = mc.material(f"{name}-{sex}-{p}", image, colour=factor[p], roughness=rough, alpha_cutoff=cutoff, part=p)
            mats.append(m)
        rig = mc.make_rig(body, fingers=bool(piece.W[:, mc.FINGER_COLUMNS].any()))
        obj = mc.build_object(sex, piece, rig, mats, face_mat=[names.index(p) for p in part_of])
        hides, share, covered = safe_hides(piece, body, spec["hides"])
        # (Checked by eye: a shoe's own sock closes it at the ankle, so the feet can go though a toe or a sole
        # pokes past what a ray from the skin finds.)
        hides = [h for h in spec["hides"] if h in hides or h in spec.get("force", ())]
        hides_by_sex[sex] = hides
        poke = {}
        visible = ~np.isin(body.region, [h for h in hides if h in mc.REGIONS]) & covered
        for cname, values in (("rest", {}), ("combo", combo)):
            poke[cname] = mc.poking(piece, body, values, visible)
        obj["outfit"] = name
        obj["slot"] = spec["slot"]
        obj["body"] = sex
        obj["layer"] = spec["layer"]
        obj["hides"] = ",".join(hides)
        obj["parts"] = ",".join(names)
        objects.append(obj)
        rigs.append(rig)
        stats[sex] = {
            "vertices": len(obj.data.vertices),
            "parts": names,
            "under the skin before": before,
            "still under (>0.5 mm)": {k: v for k, v in after.items() if v[0]},
            "combo": combo_clip,
            "hides": hides,
            "regions covered": share,
            "skin through (rest, combo)": poke,
        }
        mc.log(f"{name} {sex}: {stats[sex]}")
    # (The game takes a piece's hides from all its meshes together: only what every body's mesh covers.)
    common = [h for h in spec["hides"] if all(h in v for v in hides_by_sex.values())]
    for o in objects:
        o["hides"] = ",".join(common)
    stats["hides"] = common
    path = os.path.join(mc.MODELS, f"outfit-{name}.glb")
    size = mc.export(path, objects, rigs)
    for o in objects + rigs:
        bpy.data.objects.remove(o, do_unlink=True)
    mc.log(f"wrote {path} ({size / 1e6:.2f} MB); hides {common}; colours { {p: tuple(round(c, 3) for c in f) for p, f in factor.items()} }")
    return stats


def main(which):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sexes = sorted({s for n in which for s in PIECES[n]["sexes"]})
    bodies = {s: mc.Body(s) for s in sexes}
    for b in bodies.values():
        b.obj.hide_render = b.obj.hide_viewport = True
    for n in which:
        make(n, bodies)


if __name__ == "__main__":
    args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    main(args or [n for n in PIECES if n not in SAME_AS])
