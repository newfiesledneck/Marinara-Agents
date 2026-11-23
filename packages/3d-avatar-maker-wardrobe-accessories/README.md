# 3D Avatar Maker: Accessories

19 accessories for [3D Avatar Maker](../3d-avatar-maker/README.md): six pairs of glasses, a medical mask,
pearl earrings, two rings, gloves in three lengths, four kinds of socks and two hats.
They come from the MakeHuman community and are public domain (CC0), so an avatar wearing them can be shared
freely, like one made from the maker's own clothes.

This package holds data only. It has no Home tab, no code and no permissions. It needs **3D Avatar Maker
0.1.04 or later**, which added the Glasses, Face mask, Earrings, Rings and Socks slots it uses. The maker
finds it when both are installed.

## Use it

1. Install **3D Avatar Maker** and this package from **Agents → Agent Organizer**. Neither needs a restart.
2. Open **Home → 3D Avatar Maker** and go to the **Clothes** tab. The pieces below appear beside the maker's
   own, in the slot each is worn in.

Gloves hide a ring, and socks hide the toenails. Socks go under any shoes. A hat hides the hair.

A piece is fitted to the maker's bodies as of 3D Avatar Maker 0.1.02, and follows their build sliders. A
maker whose bodies have changed since then leaves the pack out until the pack is fitted again.

## What's in it

All pieces fit both bodies except the diamond ring, which is made for the female body.

| Piece | Slot | Colour |
| --- | --- | --- |
| Glasses, rectangular | Glasses | Any colour frame |
| Glasses, oval | Glasses | Any colour frame |
| Glasses, round | Glasses | Any colour frame |
| Glasses, cat-eye | Glasses | Any colour frame |
| Glasses, thin frames | Glasses | Any colour frame |
| Round sunglasses, leopard print | Glasses | Its own picture |
| Medical mask | Face mask | Its own picture |
| Pearl earrings | Earrings | Their own picture |
| Plain ring | Rings | Any colour |
| Diamond ring | Rings | Its own picture |
| Gloves, short | Hands | Any colour |
| Gloves, to the elbow | Hands | Any colour |
| Opera gloves | Hands | Any colour |
| Ankle socks | Socks | Any colour |
| Knee socks | Socks | Any colour |
| Lace frill socks | Socks | Any colour |
| Leg warmers | Socks | Any colour |
| Cloche hat | Head | Any colour |
| Christmas hat | Head | Its own picture |

"Any colour" pieces are plain, and the maker dyes them. The others keep their own picture, which a colour of
your own tints. The glasses' lenses are clear, except the leopard sunglasses'. The pearls are small studs.

## Credits

Every piece is CC0 1.0 (public domain) by its MakeHuman community catalogue, and all of its own files say CC0
or name no licence. No credit is required; the authors are named as thanks. Each piece was fitted to the
maker's bodies in Blender by ThatOneCan (`packages/3d-avatar-maker/assets/scripts/make_mh_packs.py`), and that
fitting is CC0 as well. Version 0.1.01 took out the two eye masks and the lightning earrings, because their
model files say AGPL-3.

| Piece | Author | Source |
| --- | --- | --- |
| Glasses, rectangular (`spamrakuen_sagerfrogs_glasses_01`) | spamrakuen | http://www.makehumancommunity.org/node/3331 |
| Glasses, oval (`spamrakuen_sagerfrogs_glasses_02`) | spamrakuen | http://www.makehumancommunity.org/node/3332 |
| Glasses, round (`spamrakuen_sagerfrogs_glasses_03`) | spamrakuen | http://www.makehumancommunity.org/node/3333 |
| Glasses, cat-eye (`spamrakuen_sagerfrogs_glasses_04`) | spamrakuen | http://www.makehumancommunity.org/node/3334 |
| Glasses, thin frames (`spamrakuen_tbm_glasses_frames_01`) | spamrakuen | http://www.makehumancommunity.org/node/3330 |
| Round sunglasses, leopard print (`toigo_round_glasses_leopard`) | MargaretToigo | http://www.makehumancommunity.org/node/1070 |
| Medical mask (`joepal_medical_mouth_protection`) | Joel Palmius | http://www.makehumancommunity.org/node/2369 |
| Pearl earrings (`toigo_pearl_earrings`) | MargaretToigo | http://www.makehumancommunity.org/node/1029 |
| Plain ring (`joachip_ring_1`) | joachip | http://www.makehumancommunity.org/node/3119 |
| Diamond ring (`wolgade_diamond_ring_01`) | wolgade | http://www.makehumancommunity.org/node/558 |
| Gloves, short (`toigo_gloves_short`) | MargaretToigo | http://www.makehumancommunity.org/node/1852 |
| Gloves, to the elbow (`toigo_gloves_medium`) | MargaretToigo | http://www.makehumancommunity.org/node/1851 |
| Opera gloves (`toigo_gloves_long`) | MargaretToigo | http://www.makehumancommunity.org/node/1850 |
| Ankle socks (`joepal_crude_low_socks`) | Joel Palmius | http://www.makehumancommunity.org/node/32 |
| Knee socks (`joepal_crude_high_socks`) | Joel Palmius | http://www.makehumancommunity.org/node/25 |
| Lace frill socks (`toigo_lace_frill_socks`) | MargaretToigo | http://www.makehumancommunity.org/node/1078 |
| Leg warmers (`toigo_leg_warmer_socks`) | MargaretToigo | http://www.makehumancommunity.org/node/1092 |
| Cloche hat (`aethelraed_unraed_cloche_hat`) | Aethelraed_Unraed | http://www.makehumancommunity.org/node/582 |
| Christmas hat (`joepal_xmas_cap`) | Joel Palmius | http://www.makehumancommunity.org/node/520 |

The names in brackets are the MakeHuman items. The pieces come from the community packs glasses01_cc0,
masks01_cc0, jewelry01_cc0, gloves01_cc0, underwear04_cc0 and hats01_cc0;
`packages/3d-avatar-maker/docs/MAKEHUMAN-PACKS.md` records the licence check of each item.

## How it's made

`packages/3d-avatar-maker/assets/packs.json` lists the pieces. `assets/scripts/make_mh_packs.py` fits them to
the bodies in Blender the way the maker's own MakeHuman clothes are fitted, and
`scripts/build-3d-avatar-maker-packs.mjs` packs them into `wardrobe/*.pack.png`, writes `avatar-pack.json`
and builds this package. Small solid pieces (glasses, earrings, rings) keep every triangle, and earrings and
rings sit closer to the skin than cloth does. The glasses' clear lenses and the lace are cut out by their
pictures.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
