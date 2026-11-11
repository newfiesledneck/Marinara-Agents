# The kit

Asset files the game loads when it needs them, served by the Engine as package assets
(`contributions.assets.paths`). Everything except `generic/art/` is converted from free packs by
[Quaternius](https://quaternius.com), released under
[CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/) (public domain; each download's
licence file says so). No credit is required; this note is a courtesy.

| Folder                                | From                                                                                                                                                                                                | Made by                                     |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `generic/people/`, `fantasy/outfits/` | Universal Base Characters (Standard), Modular Character Outfits - Fantasy (Standard)                                                                                                                | `scripts/build-wanderworld-people.mjs`      |
| `generic/nature/`                     | Stylized Nature MegaKit (Standard), its `glTF` folder                                                                                                                                               | `scripts/build-wanderworld-kit.mjs nature`  |
| `fantasy/village/`                    | Medieval Village MegaKit (Standard), its `glTF` folder                                                                                                                                              | `scripts/build-wanderworld-kit.mjs village` |
| `generic/art/`                        | Original art for Wanderworld (menu backdrops, logo, loading screen, ground, water and rock textures, the sign board, parchment, bridge planks and beams), made by the package's author with ComfyUI | converted to WebP by hand                   |
| `creatures/`                          | Ultimate Animated Animals, its `glTF` folder; and the monsters from Monster Pack Animated and Easy Animated Enemy Pack, their `FBX` files (read here by three's FBXLoader: no Blender needed)       | `scripts/build-wanderworld-animals.mjs`     |
| `fantasy/props/`                      | Fantasy Props MegaKit (Standard) `Exports/glTF`, Medieval Village MegaKit (Standard) `glTF`, Farm Buildings `FBX` (the barn and the windmill)                                                       | `scripts/build-wanderworld-kit.mjs props`   |

The kit is kept by setting: `generic/` is what any world has (nature, people's bodies, the painted art),
`fantasy/` the medieval one's buildings, props and outfits, and `creatures/` the animals, a file a group.
A modern or a sci-fi setting would be a folder beside `fantasy/`. Within a folder the models are one file
(`models.json`, `bodies.json`, a creature group's), because a package may list at most 256 asset files;
the textures stay separate images.

The packs themselves are not in the repository. To rebuild, unzip them and run the script named above
(it prints its usage). To drop or swap one model, change the list at the top of its script and run it again. To drop a folder, delete it and the code that loads it; the game falls back to its
built-in look.
