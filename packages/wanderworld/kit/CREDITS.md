# The kit

Asset files the game loads when it needs them, served by the Engine as package assets
(`contributions.assets.paths`). Everything here is converted from free packs by
[Quaternius](https://quaternius.com), released under
[CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/) (public domain; each download's
licence file says so). No credit is required; this note is a courtesy.

| Folder | From | Made by |
| --- | --- | --- |
| `people/` | Universal Base Characters (Standard), Modular Character Outfits - Fantasy (Standard) | `scripts/build-wanderworld-people.mjs` |

The packs themselves are not in the repository. To rebuild, unzip them and run the script named above
(it prints its usage). To drop a folder, delete it and the code that loads it; the game falls back to its
built-in look.
