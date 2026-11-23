# The kit

The files the maker loads to build an avatar, served by the Engine as package assets
(`contributions.assets.paths`). Everything here is public domain (CC0 1.0 Universal,
https://creativecommons.org/publicdomain/zero/1.0/): no credit is required, and an avatar made from these
files may be used and shared freely. This note is a courtesy.

The kit began as a copy of Wanderworld's (`packages/wanderworld/kit`, version 0.7.62) and is this package's
own from there. A `.pack.png` is a packed kit file, not a picture: `src/packed.js` says what's in one.

## From MakeHuman (CC0), fitted in Blender by ThatOneCan

MakeHuman's hm08 base mesh, morph targets and system assets are public domain (CC0 1.0). They are read as
data by this repository's own scripts; MakeHuman itself is neither run nor copied.

- `avatar/avatar-male.pack.png`, `avatar/avatar-female.pack.png` and their pictures (`avatar-<sex>.webp`,
  `avatar-<sex>-<n>.webp`): the bodies' base mesh and shapes, adapted with `assets/scripts/make_avatar.py`.
- `avatar/avatar-<sex>-skin-<age>-<ethnicity>.webp`, `avatar/avatar-eyes.webp`, and the brow and lash
  styles in the bodies: MakeHuman's skins, eyes, eyebrows and eyelashes.
- In the bodies: the face's moves (blinks, mouth shapes and feelings), each a mix of MakeHuman's
  expression unit targets chosen by ThatOneCan; MakeHuman's teeth (teeth_base) and tongue (tongue01), and
  their pictures, shaded darker towards the back of the mouth, in the bodies' mouth picture.
- In `avatar/avatar-hair-short.pack.png` and `avatar-hair-long.pack.png`: the short, slicked, crop, fringe,
  curly, bob, bob angled, long, ponytail and braid hair styles (`make_mh_hair.py`).
- In `wardrobe/avatar-outfits-<group>.pack.png`: the modern clothes (`make_mh_clothes.py`): the tee, long
  tee, longsleeve tee, denim shirt, plaid shirt, jacket, suit jacket, suit trousers, jeans, jeans dark,
  overalls, workwear, female tee, female loose tee, female sport top, female blazer, female jeans, female
  leggings, female shorts, female skirt, fedora, fedora cocked, shoes black, shoes brown, boots black,
  trainers white, trainers blue and trainers worn.

## From MakeHuman community packs (CC0), used as data

Items from the MakeHuman community asset packs, each CC0 by its pack catalogue and its own files
(`docs/MAKEHUMAN-PACKS.md` lists each item checked). No credit is required; the authors are named as thanks.

- In the bodies' files, as one-way face and body sliders (`make_avatar.py` FACE_DETAIL, BODY_DETAIL): cheek, ear,
  nose, hand and arm shapes by Elvaerwyn, jujube, habanero, RehmanPolanski and Mindfront.
- `avatar/avatar-<sex>-skin-<name>.webp`: skins by skalldyrssuppe, onlytheghosts, toigo, flower-angel, ken1138
  and Mindfront (`make_avatar.py` COMMUNITY_SKINS names each).
- In `wardrobe/avatar-outfits-hands.pack.png` and `-feet.pack.png`: the short, medium and long fingernails and the
  toenails, Mindfront's (bodyparts04_cc0), fitted to the bodies in Blender by ThatOneCan (`make_mh_clothes.py`).
- In the bodies' files: brow styles 13–16 and lash styles 5–6, Mindfront's strand brows and lashes (eyebrows01_cc0,
  eyelashes01_cc0) baked in Blender by ThatOneCan onto MakeHuman's eyebrow009 and eyelashes02 cards (`bake_brows.py`).
- In `avatar/avatar-eyes.webp`, after MakeHuman's nine: eye pictures by bobby_03, Mindfront, Nyloseth, Hatshj and
  spamrakuen (`make_avatar.py` COMMUNITY_EYES).

## Made in Blender by ThatOneCan (CC0)

Released as CC0 1.0 by their maker.

- In the bodies' files (`make_avatar.py`): the races' shapes (dwarf, halfling, gnome, elf, half-orc,
  tiefling), the tusks, horns, the tiefling's tail, the beards and the moustache, the eyeballs, the
  underwear styles, the finger bones and weights. The face
  and body sliders' shapes are MakeHuman's targets (CC0), chosen and paired by ThatOneCan.
- `avatar/avatar-<sex>-masks.png`: where the lips are in the skin picture, made from the bodies by
  `scripts/build-3d-avatar-maker-masks.mjs`.
- In the hair files (`make_hair.py`): the parted, buns, shaved and mohawk hair styles.
- In the wardrobe files (`make_outfit.py`, `make_outfit2.py`): the shirt, t shirt, tank top, crop top,
  blouse, bikini top, tunic, vest, corset, gambeson, dress, gown, robe, one piece swimsuit, cloak, long
  coat, trousers, leggings, shorts, skirt, short skirt, pleated skirt, loincloth, swim trunks, bikini
  bottom, boots, tall boots, shoes, sandals, gloves, hood, scarf, circlet, apron, belt pouches, chainmail,
  scale mail, brigandine, leather armour, bikini armour, barbarian harness, plate cuirass, pauldrons,
  bracers, gauntlets, tassets, greaves, sabatons, helm and full helm.

The models these are packed from are in `packages/3d-avatar-maker/assets/models/`.

## Animations from Quaternius (CC0)

The preview's recorded animations (`src/clips/ual.json`, made by `scripts/build-3d-avatar-maker-clips.mjs`) are
clips from Quaternius's Universal Animation Library and Universal Animation Library 2 (quaternius.com), each
CC0 1.0 by its library's own licence file. They're in the maker's code rather than the kit, and play in the
preview only: no saved file carries them. No credit is required; Quaternius is named as thanks.
