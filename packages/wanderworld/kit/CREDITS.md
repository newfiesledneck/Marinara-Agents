# The kit

Asset files the game loads when it needs them, served by the Engine as package assets
(`contributions.assets.paths`). Everything except `generic/art/`, `fantasy/folk/` and what's listed under
"Credit required" is converted from free packs by iPoly3D (the gallows, pillory, cage, signposts and crystals in
`fantasy/props/`, from Medieval Torture Devices, Signs pack and Crystal Pack on
[Poly Pizza](https://poly.pizza), CC0 1.0) and by
[Quaternius](https://quaternius.com), released under
[CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/) (public domain; each download's
licence file says so). No credit is required; this note is a courtesy.

| Folder                                | From                                                                                                                                                                                                          | Made by                                     |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `generic/people/`, `fantasy/outfits/` | Universal Base Characters (Standard), Modular Character Outfits - Fantasy (Standard)                                                                                                                          | `scripts/build-wanderworld-people.mjs`      |
| `generic/nature/`                     | Stylized Nature MegaKit (Pro), its `glTF` folder                                                                                                                                                              | `scripts/build-wanderworld-kit.mjs nature`  |
| `fantasy/village/`                    | Medieval Village MegaKit (Standard), its `glTF` folder                                                                                                                                                        | `scripts/build-wanderworld-kit.mjs village` |
| `generic/art/`                        | Original art for Wanderworld (menu backdrops, logo, loading screen, ground, water and rock textures, the sign board, parchment, bridge planks and beams), made by the package's author with ComfyUI           | converted to WebP by hand                   |
| `creatures/`                          | Ultimate Animated Animals, its `glTF` folder; and the monsters from Monster Pack Animated and Easy Animated Enemy Pack, their `FBX` files (read here by three's FBXLoader: no Blender needed)                 | `scripts/build-wanderworld-animals.mjs`     |
| `fantasy/props/`                      | Fantasy Props MegaKit (Standard) `Exports/glTF`, Medieval Village MegaKit (Standard) `glTF`, Farm Buildings `FBX` (the barn and the windmill); iPoly3D's three packs' `.glb` files, unzipped into one folder  | `scripts/build-wanderworld-kit.mjs props`   |
| `fantasy/tools/`                      | Fantasy Props MegaKit (Pro), its `Exports/glTF` folder (tools and weapons; CC0 by that download's licence file)                                                                                               | `scripts/build-wanderworld-kit.mjs tools`   |
| `fantasy/market/`                     | Fantasy Props MegaKit (Pro), its `Exports/glTF` folder (dressed stalls and painted shop signs; CC0 by that download's licence file)                                                                           | `scripts/build-wanderworld-kit.mjs market`  |
| `fantasy/dungeon/`                    | Updated Modular Dungeon (May 2019), its `FBX` folder (floor, wall, arch, door, bars, column, stairs, torch, wall banner, pedestal, trapdoor, skull, cobweb and campfire; CC0 by that download's licence file) | `scripts/build-wanderworld-kit.mjs dungeon` |

## Made in Blender by ThatOneCan

On the people's skeleton, `fantasy/folk/folk-built-<family>.pack.png`, textures in them:
the goblin, hobgoblin, bugbear, orc, gnoll, kobold, lizardfolk, ghoul, ogre, troll, minotaur, skeleton,
zombie, ghost, specter, earth elemental, hill giant, stone giant, frost giant and fire giant, modelled in
Blender by ThatOneCan with the scripts in `packages/wanderworld/assets/scripts/` and packed by
`scripts/build-wanderworld-people.mjs --bestiary`. The giants start from one base body,
`assets/models/giant-base.glb`, a copy of the built-in body (below).

Each with a skeleton of its own, `creatures/rigged-<family>.pack.png`, textures in them:
the mimic, awakened shrub, shambling mound, grick, otyugh, roper, gelatinous cube, basilisk, air
elemental, fire elemental and water elemental, made the same way.

The models themselves are in `packages/wanderworld/assets/models/`. Each file also holds the model's
distant version, made from it when it's packed.

## The built-in body

`generic/avatar/avatar-male.pack.png`, `avatar-female.pack.png` and their textures (`avatar-<sex>.webp`,
`avatar-<sex>-1.webp`): Base mesh and shapes: MakeHuman (CC0), adapted in Blender by ThatOneCan, with
`packages/wanderworld/assets/scripts/make_avatar.py`, and packed by
`scripts/build-wanderworld-people.mjs --avatar`. MakeHuman's hm08 base mesh and morph targets are public
domain (CC0 1.0); they're read as data, and MakeHuman itself is neither run nor copied.

`generic/avatar/anthro-wolf-<sex>.pack.png` and `anthro-dragon-<sex>.pack.png`, textures in them: made in
Blender by ThatOneCan, built on MakeHuman's CC0 base mesh, with
`packages/wanderworld/assets/scripts/make_anthro_wolf.py` and `make_anthro_dragon.py`: the anthro wolf and
anthro dragon bodies, male and female. Each is the built-in body with a head, legs, tail and colours of its
own (and the dragon's wings), on the same skeleton, packed by
`scripts/build-wanderworld-people.mjs --avatar`.

Its hair styles are in `generic/avatar/avatar-hair-short.pack.png` and `avatar-hair-long.pack.png`, and its
clothing in `fantasy/avatar/avatar-outfits-<group>.pack.png`, textures in them, each folder with an index
of which file has which (`avatar-hair-index.json`, `avatar-outfits-index.json`), packed the same way.

Hair styles and clothing from MakeHuman's system assets (CC0), fitted in Blender by ThatOneCan: the short,
slicked, crop, fringe, curly, bob, bob angled, long, ponytail and braid hair styles
(`make_mh_hair.py`), and the modern clothes (`make_mh_clothes.py`): the tee, long tee, longsleeve tee,
denim shirt, plaid shirt, jacket, suit jacket, suit trousers, jeans, jeans dark, overalls, workwear,
female tee, female loose tee, female sport top, female blazer, female jeans, female leggings, female
shorts, female skirt, fedora, fedora cocked, shoes black, shoes brown, boots black, trainers white,
trainers blue and trainers worn. The pack's files are read as data; MakeHuman is neither run nor copied.

Made in Blender by ThatOneCan for the built-in body: the parted, buns, shaved and mohawk hair styles
(`make_hair.py`), and the clothing and armour (`make_outfit.py`, `make_outfit2.py`): the shirt, t shirt,
tank top, crop top, blouse, bikini top, tunic, vest, corset, gambeson, dress, gown, robe, one piece
swimsuit, cloak, long coat, trousers, leggings, shorts, skirt, short skirt, pleated skirt, loincloth,
swim trunks, bikini bottom, boots, tall boots, shoes, sandals, gloves, hood, scarf, circlet, apron, belt
pouches, chainmail, scale mail, brigandine, leather armour, bikini armour, barbarian harness, plate
cuirass, pauldrons, bracers, gauntlets, tassets, greaves, sabatons, helm and full helm.

MakeHuman system assets (skins, eyes, eyebrows, eyelashes): CC0. The skin pictures
(`avatar-<sex>-skin-<age>-<ethnicity>.webp`), the eye pictures (`avatar-eyes.webp`, nine in one) and the
brow and lash styles in the bodies (and their texture) are made from MakeHuman's system assets by
`make_avatar.py`, read as data the same way.

## Under the Quaternius Asset License

`fantasy/folk/folk.pack.png`, its textures in it (the imp and the puglin), are converted from Quaternius's Bestiary - Dungeon Monsters Kit
(Standard), its `Exports/GLB` folder, by `scripts/build-wanderworld-people.mjs --folk`. That pack is not
public domain: it's under the Quaternius Asset License (QAL) v1.0 (https://quaternius.com/license.html),
which allows using it in a game with no credit, and does not allow passing the models on as assets. So
these files are for Wanderworld to load, not for reuse elsewhere; get the pack from Quaternius instead.

## Credit required (CC-BY)

These are not public domain: each is used under its licence, which asks for this credit and a note of
what was changed. Their makers have not endorsed Wanderworld.

- Saddle by Poly by Google (https://poly.pizza/m/dSMm_V4sKNr), CC-BY 3.0 (https://creativecommons.org/licenses/by/3.0/), modified: converted, resized and its texture shrunk. In `fantasy/props/` (the `saddle` model and its texture).

The kit is kept by setting: `generic/` is what any world has (nature, people's bodies, the painted art),
`fantasy/` the medieval one's buildings, props and outfits, and `creatures/` the animals, a file a group.
A modern or a sci-fi setting would be a folder beside `fantasy/`. Within a folder the models are one file
(`models.pack.png`, `bodies.pack.png`, a creature group's), because a package may list at most 256 asset
files; the textures stay separate images, but for the Blender-made creatures' and the imp's and puglin's,
which are in their files. A `.pack.png` is the kit's packed format (`src/packed.js`, written by
`scripts/wanderworld-packed.mjs`): the same document and arrays a JSON file would hold, compressed, as
the bytes of a grey PNG.

The packs themselves are not in the repository. To rebuild, unzip them and run the script named above
(it prints its usage). To drop or swap one model, change the list at the top of its script and run it again. To drop a folder, delete it and the code that loads it; the game falls back to its
built-in look.
