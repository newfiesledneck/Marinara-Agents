"""The wardrobe packs' pieces (assets/packs.json): community MakeHuman clothes (CC0 and CC-BY items from the
community packs, `pack:<zip stem>/clothes/<item>`, read from `wwavatar.extracted_dir`), fitted to the base avatar exactly as
make_mh_clothes.py fits the maker's own `mh_*` pieces (its `make`: carried from MakeHuman's own version of the
body, the same CLEARANCE, safe hides and the bodies' own keys; `fit: "helpers"` for the old way), one GLB per piece, assets/models/packs/<pack id>/outfit-<piece>.glb, with the same
extras (`outfit`, `slot`, `body`, `layer`, `hides`, `parts`). scripts/build-3d-avatar-maker-packs.mjs packs them.
Run (BLENDER: your Blender executable; add pack ids or piece ids after `--` for some):

    "$BLENDER" --background --factory-startup --python packages/3d-avatar-maker/assets/scripts/make_mh_packs.py

A piece is the item whole (`split: none`), its faces one part (`part`, default cloth). Each piece's `hides` are
the regions it may hide, kept only where hiding them leaves no hole (make_mh_clothes.safe_hides) unless in
`force`. A piece with `decimate` (a share of its faces, 0 to 1) is fitted whole and then thinned to that share
before it's written (`decimated`): for items modelled far finer than the maker needs, such as a bangle of 18k
vertices. A piece with no picture of its own is `tex: plain`, in its `colour`. Each run writes the fitting report to assets/build/packs-report.json.

Clothes from the MakeHuman community (makehumancommunity.org, CC0 or CC BY as assets/packs.json says), fitted in
Blender by ThatOneCan.
"""

import json
import os
import sys

import bpy
import numpy as np
from mathutils.kdtree import KDTree

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import make_mh_clothes as mhc  # noqa: E402
import wwmhclo as mc  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
PACKS = json.load(open(os.path.join(os.path.dirname(HERE), "packs.json"), encoding="utf-8"))["packs"]
MODELS = mc.MODELS


def spec_of(entry):
    """make_mh_clothes PIECES' form of a packs.json piece."""
    return dict(
        src=f"pack:{entry['src']}",
        take="all",
        split="none",
        sexes=tuple(entry["bodies"]),
        slot=entry["slot"],
        layer=entry["layer"],
        hides=list(entry["hides"]),
        tex=entry["tex"],
        part=entry.get("part", "cloth"),
        skin=entry.get("skin", True),
        force=list(entry.get("force", [])),
        cut=entry.get("cut", False),
        **{k: entry[k] for k in ("size", "clearance", "fit") if k in entry},
    )


def thin(obj, share):
    """The fitted mesh `obj` with `share` of its faces (Blender's collapse decimation). Each point left takes the
    shape keys' moves and the bone weights of the fitted point nearest it, so the piece follows the body's keys
    and bones as the whole one did."""
    me = obj.data
    n = len(me.vertices)
    co = np.empty(n * 3)
    me.vertices.foreach_get("co", co)
    co = co.reshape(-1, 3)
    moves = {}
    for k in me.shape_keys.key_blocks[1:] if me.shape_keys else []:
        at = np.empty(n * 3)
        k.data.foreach_get("co", at)
        moves[k.name] = at.reshape(-1, 3) - co
    groups = [g.name for g in obj.vertex_groups]
    weights = np.zeros((n, len(groups)))
    for v in me.vertices:
        for g in v.groups:
            weights[v.index, g.group] = g.weight
    obj.shape_key_clear()
    deform = [m for m in obj.modifiers if m.show_viewport]
    for m in deform:
        m.show_viewport = False
    mod = obj.modifiers.new("thin", "DECIMATE")
    mod.ratio = share
    thinned = bpy.data.meshes.new_from_object(obj.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    obj.modifiers.remove(mod)
    for m in deform:
        m.show_viewport = True
    obj.data, thinned.name = thinned, me.name
    bpy.data.meshes.remove(me)
    m = len(thinned.vertices)
    now = np.empty(m * 3)
    thinned.vertices.foreach_get("co", now)
    now = now.reshape(-1, 3)
    tree = KDTree(n)
    for i, p in enumerate(co):
        tree.insert(p, i)
    tree.balance()
    near = np.array([tree.find(p)[1] for p in now])
    obj.vertex_groups.clear()
    for gi, name in enumerate(groups):
        idx = np.nonzero(weights[near, gi] > 0)[0]
        if len(idx):
            vg = obj.vertex_groups.new(name=name)
            for i in idx:
                vg.add([int(i)], float(weights[near[i], gi]), "REPLACE")
    if moves:
        obj.shape_key_add(name="Basis", from_mix=False)
        for name, move in moves.items():
            obj.shape_key_add(name=name, from_mix=False).data.foreach_set("co", (now + move[near]).astype(np.float32).ravel())
    mc.log(f"{obj.name}: thinned from {n} to {m} vertices")


def decimated(export, share):
    """mc.export, each mesh first thinned to `share` of its faces."""

    def run(path, objects, rigs, **kw):
        for obj in objects:
            thin(obj, share)
        return export(path, objects, rigs, **kw)

    return run


def main(only):
    which = [(pack, piece) for pack, p in PACKS.items() for piece in p.get("pieces", {}) if not only or pack in only or piece in only]
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sexes = sorted({s for pack, piece in which for s in PACKS[pack]["pieces"][piece]["bodies"]})
    bodies = {s: mc.Body(s) for s in sexes}
    for b in bodies.values():
        b.obj.hide_render = b.obj.hide_viewport = True
    report = {}
    export, nail = mc.export, mhc.NAIL_COLOUR
    for pack, piece in which:
        entry = PACKS[pack]["pieces"][piece]
        mhc.PIECES[piece] = spec_of(entry)
        mc.MODELS = os.path.join(MODELS, "packs", pack)  # (make writes to mc.MODELS)
        mc.export = decimated(export, entry["decimate"]) if "decimate" in entry else export
        # ponytail: make colours a `plain` piece (no picture) with the nails' colour; a pack's plain piece names
        # its own (`colour`, sRGB 0-255) through that constant. Upgrade: a colour in make's spec.
        mhc.NAIL_COLOUR = tuple(entry.get("colour", nail))
        report[piece] = mhc.make(piece, bodies)
    mc.export, mhc.NAIL_COLOUR = export, nail
    os.makedirs(mc.BUILD, exist_ok=True)
    with open(os.path.join(mc.BUILD, "packs-report.json"), "w", encoding="utf-8") as f:
        json.dump(report, f, indent=1, default=str)


if __name__ == "__main__":
    main(sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else [])
