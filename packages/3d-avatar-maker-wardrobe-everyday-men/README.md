# 3D Avatar Maker: Everyday Men's Clothes and Suits

10 more pieces of clothing for [3D Avatar Maker](../3d-avatar-maker/README.md): four men's suits, two
women's trouser suits, a polo shirt, a T-shirt, wool trousers and ankle boots. They
come from the MakeHuman community and are public domain (CC0), so an avatar wearing them can be shared
freely, like one made from the maker's own clothes.

This package holds data only. It has no Home tab, no code and no permissions. It needs **3D Avatar Maker
0.1.03 or later**, which finds it when both are installed.

## Use it

1. Install **3D Avatar Maker** and this package from **Agents → Agent Organizer**. Neither needs a restart.
2. Open **Home → 3D Avatar Maker** and go to the **Clothes** tab. The pieces below appear beside the maker's
   own, in the slot each is worn in.

A piece is fitted to the maker's bodies as of 3D Avatar Maker 0.1.02, and follows their build sliders. A
maker whose bodies have changed since then leaves the pack out until the pack is fitted again.

## What's in it

| Piece | Body | Slot | Colour |
| --- | --- | --- | --- |
| Double-breasted suit | Male | Whole outfit | Its own picture |
| Suit with red tie | Male | Whole outfit | Its own picture |
| Grey suit with tie | Male | Whole outfit | Its own picture |
| White dinner jacket suit | Male | Whole outfit | Its own picture |
| Double-breasted suit | Female | Whole outfit | Its own picture |
| Pink trouser suit | Female | Whole outfit | Its own picture |
| Polo shirt | Male | Shirt or top | Any colour |
| Plain T-shirt | Male | Shirt or top | Any colour |
| Wool trousers | Male | Legs | Any colour |
| Ankle boots | Male | Feet | Their own colour |

A suit is one piece: jacket, shirt, tie and trousers together. "Any colour" pieces are plain cloth the maker
dyes. The others keep their own picture, which a colour of your own tints.

## Credits

Every piece is CC0 1.0 (public domain) by its MakeHuman community catalogue and by its own files. No credit
is required; the authors are named as thanks. Each piece was fitted to the maker's bodies in Blender by
ThatOneCan (`packages/3d-avatar-maker/assets/scripts/make_mh_packs.py`), and that fitting is CC0 as well.
Version 0.1.01 took out Cortu's cargo trousers and denim shorts, because their model files say AGPL-3.

| Piece | Author | Source |
| --- | --- | --- |
| Double-breasted suit, male (`toigo_male_double-breasted_suit`) | MargaretToigo | http://www.makehumancommunity.org/node/1740 |
| Suit with red tie (`toigo_male_suit_3`) | MargaretToigo | http://www.makehumancommunity.org/node/1733 |
| Grey suit with tie (`toigo_male_suit_tie_and_jacket`) | MargaretToigo | http://www.makehumancommunity.org/node/1265 |
| White dinner jacket suit (`toigo_suit_with_dinner_jacket`) | MargaretToigo | http://www.makehumancommunity.org/node/1746 |
| Double-breasted suit, female (`toigo_female_double-breasted_suit`) | MargaretToigo | http://www.makehumancommunity.org/node/1742 |
| Pink trouser suit (`toigo_female_suit_2`) | MargaretToigo | http://www.makehumancommunity.org/node/1739 |
| Polo shirt (`namuhekam_male_polo_shirt`) | namuhekam | http://www.makehumancommunity.org/node/2909 |
| Plain T-shirt (`elvs_crude_t-shirt_male`) | Elvaerwyn | http://www.makehumancommunity.org/node/1416 |
| Wool trousers (`toigo_wool_pants`) | MargaretToigo | http://www.makehumancommunity.org/node/1194 |
| Ankle boots (`toigo_ankle_boots_male`) | MargaretToigo | http://www.makehumancommunity.org/node/1743 |

The names in brackets are the MakeHuman items. The pieces come from the community packs suits01_cc0,
shirts01_cc0, pants01_cc0 and shoes01_cc0; `packages/3d-avatar-maker/docs/MAKEHUMAN-PACKS.md` records the
licence check of each item.

## How it's made

`packages/3d-avatar-maker/assets/packs.json` lists the pieces. `assets/scripts/make_mh_packs.py` fits them to
the bodies in Blender the way the maker's own MakeHuman clothes are fitted, and
`scripts/build-3d-avatar-maker-packs.mjs` packs them into `wardrobe/*.pack.png`, writes `avatar-pack.json`
and builds this package.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
