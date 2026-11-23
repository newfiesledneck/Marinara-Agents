# 3D Avatar Maker: Historical and Fantasy Clothes

17 more pieces of clothing for [3D Avatar Maker](../3d-avatar-maker/README.md): a monk's robe with two
hoods, a medieval dress, three goddess dresses, a peasant blouse, a tunic with a sash, a maid's headband, a
veil, a top hat, a pith helmet, a brass circlet and three kinds of boots and shoes. They come from the
MakeHuman community. Most are CC BY, so they are free to share as long as their makers are credited. The
maker does that for you: a saved avatar names the maker of every CC BY piece it wears.

This package holds data only. It has no Home tab, no code and no permissions. It needs **3D Avatar Maker
0.1.03 or later**, which finds it when both are installed.

## Use it

1. Install **3D Avatar Maker** and this package from **Agents → Agent Organizer**. Neither needs a restart.
2. Open **Home → 3D Avatar Maker** and go to the **Clothes** tab. The pieces below appear beside the maker's
   own, in the slot each is worn in. Under a piece, a line names the pack, its maker and its licence.

A piece is fitted to the maker's bodies as of 3D Avatar Maker 0.1.02, and follows their build sliders. A
maker whose bodies have changed since then leaves the pack out until the pack is fitted again.

## What's in it

| Piece | Body | Slot | Colour |
| --- | --- | --- | --- |
| Monk's robe | Both | Whole outfit | Any colour |
| Monk's hood, up | Both | Head | Any colour |
| Monk's hood, pulled low | Both | Head | Any colour |
| Medieval dress | Female | Whole outfit | Its own picture |
| Goddess dress, draped | Female | Whole outfit | Its own picture |
| Goddess dress, long | Female | Whole outfit | Its own picture |
| Goddess dress, short | Female | Whole outfit | Its own picture |
| Peasant blouse, ruffled sleeves | Female | Shirt or top | Any colour |
| Tunic with a sash | Both | Over the shirt | Its own picture |
| Maid's frilled headband | Female | Head | Its own picture |
| Veil | Female | Head | Any colour |
| Top hat | Both | Head | Any colour |
| Pith helmet | Both | Head | Its own picture |
| Brass circlet | Both | Brow | Its own picture |
| Medieval boots | Both | Feet | Its own picture |
| Riding boots | Female | Feet | Its own picture |
| Felt elf shoes | Both | Feet | Any colour |

"Any colour" pieces are plain cloth the maker dyes. The others keep their own picture, which a colour of
your own tints. Both monk's hoods hide the hair. The headband sits over it.

## Credits

The monk's robe and its hoods are by Donitz and are CC0 1.0 (public domain). Every other piece is licensed
under Creative Commons Attribution 4.0 ([CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)) by the
author named below. Where an item's own files say only "CC-BY", it is credited under 4.0, the version
MakeHuman's guidance for its CC-BY assets points to. Each piece was changed: it was fitted to the maker's
bodies in Blender by ThatOneCan (`packages/3d-avatar-maker/assets/scripts/make_mh_packs.py`), and that
fitting is CC0. An avatar saved in the maker carries each worn CC BY piece's credit in the file.

| Piece | Author | Licence | Source |
| --- | --- | --- | --- |
| Monk's robe (`donitz_monk_robe`) | Donitz | CC0 1.0 | http://www.makehumancommunity.org/node/3238 |
| Monk's hood, up (`donitz_monk_robe_hood`) | Donitz | CC0 1.0 | http://www.makehumancommunity.org/node/3235 |
| Monk's hood, pulled low (`donitz_monk_robe_hood_down`) | Donitz | CC0 1.0 | http://www.makehumancommunity.org/node/3236 |
| Medieval dress (`punkduck_medieval_dress`) | punkduck | CC BY 4.0 | http://www.makehumancommunity.org/node/1379 |
| Goddess dress, draped (`elvs_goddess_dress1`) | Elvaerwyn | CC BY 4.0 | http://www.makehumancommunity.org/node/2558 |
| Goddess dress, long (`elvs_goddess_dress2`) | Elvaerwyn | CC BY 4.0 | http://www.makehumancommunity.org/node/2559 |
| Goddess dress, short (`elvs_goddess_dress7`) | Elvaerwyn | CC BY 4.0 | http://www.makehumancommunity.org/node/2564 |
| Peasant blouse, ruffled sleeves (`elvs_ruffle_sleeve_peasant_blouse_1`) | Elvaerwyn | CC BY 4.0 | http://www.makehumancommunity.org/node/1256 |
| Tunic with a sash (`drednicolson_asymmetric_tunic_and_sash`) | DredNicolson | CC BY 4.0 | http://www.makehumancommunity.org/node/409 |
| Maid's frilled headband (`elvs_dirty_lil_maid_bonnet`) | Elvaerwyn | CC BY 4.0 | http://www.makehumancommunity.org/node/1575 |
| Veil (`elvs_charity_veil1`) | Elvaerwyn | CC BY 4.0 | http://www.makehumancommunity.org/node/2610 |
| Top hat (`elvs_tophat1`) | Elvaerwyn | CC BY 4.0 | http://www.makehumancommunity.org/node/1360 |
| Pith helmet (`drednicolson_pith_helmet`) | DredNicolson | CC BY 4.0 | http://www.makehumancommunity.org/node/415 |
| Brass circlet (`punkduck_brass_circlet_crown`) | punkduck | CC BY 4.0 | http://www.makehumancommunity.org/node/1383 |
| Medieval boots (`punkduck_medieval_boots`) | punkduck | CC BY 4.0 | http://www.makehumancommunity.org/node/1381 |
| Riding boots (`punkduck_riding_boots`) | punkduck | CC BY 4.0 | http://www.makehumancommunity.org/node/1566 |
| Felt elf shoes (`elvs_basic_felt_elf_shoes`) | Elvaerwyn | CC BY 4.0 | http://www.makehumancommunity.org/node/1279 |
The names in brackets are the MakeHuman items. They come from the community packs dress02_cc-by,
dress03_cc-by, hats03_cc-by, hats04_cc-by, jewelry02_cc-by, shirts03_ccby, shoes02_ccby, shoes03_ccby and
suits02_cc0; `packages/3d-avatar-maker/docs/MAKEHUMAN-PACKS.md` records the licence check of each item, which
read every one of its files.

## How it's made

`packages/3d-avatar-maker/assets/packs.json` lists the pieces. `assets/scripts/make_mh_packs.py` fits them to
the bodies in Blender the way the maker's own MakeHuman clothes are fitted, and
`scripts/build-3d-avatar-maker-packs.mjs` packs them into `wardrobe/*.pack.png`, writes `avatar-pack.json`
with each piece's credit, and builds this package.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
