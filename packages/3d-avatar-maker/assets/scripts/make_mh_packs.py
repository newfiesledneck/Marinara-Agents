"""The wardrobe packs' pieces (assets/packs.json): community MakeHuman clothes (CC0 and CC-BY items from the
community packs, `pack:<zip stem>/clothes/<item>`, read from `wwavatar.extracted_dir`), fitted to the base avatar exactly as
make_mh_clothes.py fits the maker's own `mh_*` pieces (its `make`: the same CLEARANCE, safe hides, skin weights
and the bodies' own keys), one GLB per piece, assets/models/packs/<pack id>/outfit-<piece>.glb, with the same
extras (`outfit`, `slot`, `body`, `layer`, `hides`, `parts`). scripts/build-3d-avatar-maker-packs.mjs packs them.
Run (BLENDER: your Blender executable; add pack ids or piece ids after `--` for some):

    "$BLENDER" --background --factory-startup --python packages/3d-avatar-maker/assets/scripts/make_mh_packs.py

A piece is the item whole (`split: none`), its faces one part (`part`, default cloth). Each piece's `hides` are
the regions it may hide, kept only where hiding them leaves no hole (make_mh_clothes.safe_hides) unless in
`force`. Each run writes the fitting report to assets/build/packs-report.json.

Clothes from the MakeHuman community (makehumancommunity.org, CC0 or CC BY as assets/packs.json says), fitted in
Blender by ThatOneCan.
"""

import json
import os
import sys

import bpy

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
        **{k: entry[k] for k in ("size", "clearance") if k in entry},
    )


def main(only):
    which = [(pack, piece) for pack, p in PACKS.items() for piece in p["pieces"] if not only or pack in only or piece in only]
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sexes = sorted({s for pack, piece in which for s in PACKS[pack]["pieces"][piece]["bodies"]})
    bodies = {s: mc.Body(s) for s in sexes}
    for b in bodies.values():
        b.obj.hide_render = b.obj.hide_viewport = True
    report = {}
    for pack, piece in which:
        mhc.PIECES[piece] = spec_of(PACKS[pack]["pieces"][piece])
        mc.MODELS = os.path.join(MODELS, "packs", pack)  # (make writes to mc.MODELS)
        report[piece] = mhc.make(piece, bodies)
    os.makedirs(mc.BUILD, exist_ok=True)
    with open(os.path.join(mc.BUILD, "packs-report.json"), "w", encoding="utf-8") as f:
        json.dump(report, f, indent=1, default=str)


if __name__ == "__main__":
    main(sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else [])
