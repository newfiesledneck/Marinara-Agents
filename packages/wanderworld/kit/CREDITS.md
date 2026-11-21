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

`fantasy/folk/folk-built-<name>.json` and their textures (`folk-<name>.webp`): the goblin, hobgoblin, bugbear, orc, gnoll, kobold, lizardfolk, ghoul, ogre, troll and minotaur,
modelled in Blender by ThatOneCan with the scripts in `packages/wanderworld/assets/scripts/` and packed by
`scripts/build-wanderworld-people.mjs --bestiary`; and `creatures/rigged-<name>.json` with their textures
(`rigged-<name>.webp`): the mimic, awakened shrub, shambling mound, grick, otyugh, roper, gelatinous cube, basilisk, skeleton, zombie, ghost, specter, earth, fire, water and air elementals, and the hill, stone, frost and fire giants, made the same
way. The models themselves are in `packages/wanderworld/assets/models/`.

## The built-in body

`generic/avatar/avatar-male.json`, `avatar-female.json` and their textures (`avatar-<sex>.webp`,
`avatar-<sex>-1.webp`), with the hair styles (`avatar-hair.json`) and outfit pieces
(`fantasy/avatar/avatar-outfits.json`) when there are some: Base mesh and shapes: MakeHuman (CC0), adapted
in Blender by ThatOneCan, with `packages/wanderworld/assets/scripts/make_avatar.py`, and packed by
`scripts/build-wanderworld-people.mjs --avatar`. MakeHuman's hm08 base mesh and morph targets are public
domain (CC0 1.0); they're read as data, and MakeHuman itself is neither run nor copied.

## Under the Quaternius Asset License

`fantasy/folk/folk.json` and its textures (the imp and the puglin) are converted from Quaternius's Bestiary - Dungeon Monsters Kit
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
(`models.json`, `bodies.json`, a creature group's), because a package may list at most 256 asset files;
the textures stay separate images.

The packs themselves are not in the repository. To rebuild, unzip them and run the script named above
(it prints its usage). To drop or swap one model, change the list at the top of its script and run it again. To drop a folder, delete it and the code that loads it; the game falls back to its
built-in look.
