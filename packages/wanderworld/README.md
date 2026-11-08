# Wanderworld

A walkable, low-poly 3D world on its own Home tab in Marinara Engine. The goal is a world built from your
characters, persona and lorebooks, with buildings you can walk into. This is an early prototype and is
not listed in the catalog yet. The plan and milestones are in [docs/CONCEPT.md](docs/CONCEPT.md).

## What it does now (0.4.22)

- Draws a seeded town around a plaza and fountain, surrounded by forest. A town hall, a temple, a tavern and
  shops ring the plaza, with market stalls and benches; homes, a smithy and fenced gardens fill the cobbled
  streets beyond, with brick sidewalks, flowers and clutter by the doors, ivy on walls, parked wagons and
  meadows on empty lots. Buildings come from a kit of parts (walls, roofs, chimneys, balconies, shutters,
  signs, awnings). **New world** walks a different one.
- **Painted ground:** grass, dirt roads, cobbled streets, kerbed sidewalks of setts that fade into the lawns,
  and a slabbed square, blended by
  height and slope into rock, snow and riverbed pebbles in one ground material (`world.js` terrainMaterial).
- **The land:** hills, mountain ranges along some edges, a winding river with bridges, and places out in
  the country (a roadside inn, cottages, caves in hillsides) at the end of their own dirt roads. Each world
  has its own, chosen in New world or left to the seed, and saved with it (`src/land.js`). Caves are one
  carved rock face (`src/caves.js`).
- **Main menu and saves** (with its own painted art and logo, and a loading screen while a world builds): Continue, New world (a name and an optional seed), Load world (thumbnails,
  Rename, Delete) and Settings. Each world keeps where you were, the time, the persona, the cast, its
  place names and their lore, in this package's browser storage for now.
- **Places:** a named town with named streets, the market square, the fountain, gardens, meadows, the
  edge of town and the woods. Walking into one shows its name; the bar says where you are, and which
  lore is active there. Shops, the tavern, smithy, temple and hall have their name on a sign.
- **A noticeboard** on the market square: the town's notes, and your own pinned up and saved.
- **Parchment panels** for the menu, conversations, building cards, the noticeboard and the Journal (`src/ui.js`).
- **The Journal** (J): Here (where you are, the lore active here, who's nearby), People (where everyone
  is and what they're doing, in the words the AI will get), Places (rename any place; tie lorebook
  entries to it) and World.
- **A party:** ask someone in a conversation to come with you ("Come with me"); they follow, run to
  keep up, go round buildings, sit near you, and can wait somewhere or part ways (Journal → Party).
- **Play as** picks one of your personas. A persona with a 3D model set up in 3D Avatars walks in that
  model (VRM, GLB, FBX or MMD); any other persona gets a built-in low-poly person (face, hair, build and
  clothes chosen from its name). The choice is remembered.
- **People** picks up to thirty characters to live in town. Each lives in a house near the plaza and goes
  about in its own 3D model or a built-in person: out and about, on benches, or inside houses, shops, the
  tavern and the temple. A door says who's inside. They stop to face you when you walk up and have their
  name overhead.
- **Real buildings** assembled from Quaternius's free Medieval Village MegaKit (walls, windows, doors, roofs,
  gables, chimneys, balconies, towers) on its 2 m grid; the simple buildings stand in until it loads.
- **Detailed furniture and props** in town and indoors from Quaternius's free Fantasy Props and Medieval
  Village kits; the simple ones stand in until they load, or if Settings turns them off.
- **Detailed nature** everywhere (trees, rocks, bushes, flowers, grass) from Quaternius's free Stylized
  Nature MegaKit, drawn out to the draw distance; Trees and rocks sets how many. Settings can turn it off.
- **Dressed default people:** anyone without a 3D model is put together from Quaternius's free
  character packs (everyday clothes in seven colours, head, hairstyle, skin and hair tones, height), chosen
  from their name. A
  body picker (Auto, Male, Female) next to each character in People and next to Play as sets which body. The
  files are package assets in `kit/people/`, loaded only when needed. See `kit/CREDITS.md`.
- **Recorded animations** from Quaternius's free Universal Animation Library (CC0): idle, walk, jog,
  sprint, sitting and talking, played on any model with planted feet. Settings → Animation switches to
  the hand-made motion below. See `src/clips/CREDITS.md`.
- **Natural movement (hand-made).** Everyone walks heel to toe with turning hips, swinging arms and a foot that stays
  on the ground, leans into a run, and when standing breathes, shifts their weight and glances around.
  VRM models blink.
- **Use things** with E, a click, or a tap: sit on benches and chairs, go through a door (for now a card
  says who's inside; starting a scene with them comes with the AI part, and Settings → Walk into buildings
  brings back the unfinished furnished rooms), and talk to people. A conversation turns you to face each other,
  moves the camera to the side, and opens a chat box with speech bubbles; replies are placeholder lines
  until the AI update. Click a spot on the ground to walk there.
- **A living town:** townsfolk sit on benches, visit shops and the tavern, find their way along the
  streets, head home at night, look at you and wave. A day lasts 20 minutes, with dawn, dusk, and lamps lit at night.
- **Controls.** Computer: WASD walks, Shift runs, drag (left or middle mouse button) or the arrow keys look
  around, the wheel or + / − zoom, E uses, Esc stands up or leaves a conversation. Touch screen: the
  stick walks (all the way out runs), dragging anywhere else looks around, pinching zooms, and the Use
  button or a tap uses. The camera orbits and tilts, and moves in when a building would hide you.
- **Settings:** resolution (Auto keeps it smooth), draw distance, trees and rocks, shadows, walk speed,
  camera speed and direction, time of day, sound, and what the HUD shows.
- Shows frames per second, draw calls, triangles and the render resolution (Settings can hide it).
- **Fullscreen** fills the screen, on Engines whose Home tabs offer it.

It reads your persona and character lists and their 3D Avatars models. It remembers your settings, the
world and where you stood in this browser only; nothing is saved to the Engine yet.

## Using it

Install it, then open the **Wanderworld** tab on Home. To walk in your persona's own model, set one up
for that persona in 3D Avatars first.

## How it works

- `src/main.js` mounts as the package's Home tab (`home-browser-tab` slot, `view="browser"`). The canvas,
  HUD and touch stick all live in that one element, and the WebGL renderer is reused when the tab reopens.
- `src/buildings.js` is the parts kit: a building is a spec (kind, size, floors, roof, walls, colours,
  features) chosen from fixed menus, which the world brief will choose from later, and the code assembles it.
- `src/world.js` lays out the town and builds the scene. Every building, prop, road and the fountain are
  merged into one vertex-coloured mesh, and trees, rocks and lamp posts are instanced, so the whole world is under ten
  draw calls. Collision is the player against trunk circles and building boxes in a 2D grid, not a
  physics engine.
- `src/motion.js` is how bodies move: a walk-to-run cycle and an idle, as angles for three-vrm's
  normalized humanoid bones. The hips drop as far as the legs' angles need to keep the standing foot on the
  ground, which is also what makes a body rise and fall as it walks.
- `src/clips.js` plays the recorded clips (`src/clips/ual.json`, made by
  `scripts/build-wanderworld-clips.mjs`): each frame is every bone's turn from the T-pose in model space,
  so it plays on any rig, timed by each body's own measured footfall so feet don't skate.
- `src/character.js` applies that motion to any humanoid, and reads `GET /api/characters/personas/list`
  and `GET /api/characters`.
- `src/npcs.js` runs the townsfolk: each follows a small plan (walk somewhere, sit, go inside, wait), heads
  home at night, and stops, looks and waves when the player comes near.
- `src/interiors.js` builds the room behind a door from the building's kind, seeded by the building, and
  hides whichever walls stand between the camera and the player. Off by default (Settings → Walk into
  buildings) until rooms get their own pass.
- `src/zones.js` names the places of a world from its layout and seed, finds the place at a point and
  says where someone is in words; `src/saves.js` keeps the saved worlds (checked on the way in);
  `src/menu.js` is the main menu, `src/journal.js` the Journal, `src/signs.js` the shop signs.
- `src/talk.js` is the conversation panel and speech bubbles; `src/sound.js` makes every sound with Web
  Audio; `src/settings.js` keeps the settings, checking each value as it is read back.
- `src/people.js` builds a default person from the kit: every part keeps its own joints' bind data and
  binds to the outfit's skeleton, then becomes a humanoid like a GLB model.
- `src/houses.js` assembles a building's kit pieces from its spec (front facing +z); town buildings snap to
  the kit's grid in `buildings.js`, so both versions share a footprint, door and collision box.
- `src/kit.js` loads static kit models (shared geometry and materials, never disposed with a world);
  `world.addNature` swaps them in as instanced meshes, each model's instances rewritten to those within the
  draw distance as the player moves (`world.follow`).
- `src/figure.js` is the built-in person: simple shapes on a humanoid skeleton in one skinned mesh, so it
  moves exactly like a 3D model. It uses no outside art.
- `src/models.js` reads a persona's or character's `GET /api/avatar-models/:type/:id` and loads its model
  the way 3D Avatars does: VRM with `@pixiv/three-vrm`, GLB and FBX with three.js's loaders and the bones
  3D Avatars matched, and MMD (PMX) with `mmd-parser` into a plain toon-shaded skinned mesh (the Engine's
  MMD materials need three's WebGPU renderer). Every format becomes a three-vrm humanoid, so one walk
  drives them all.
- `src/npcs.js` places the chosen characters at doors near the plaza and walks them around.
- three.js 0.186.1, `@pixiv/three-vrm` 3.5.5 and `mmd-parser` 1.1.4 (the versions the Engine itself uses)
  are bundled into `client.js`, because the Engine does not hand its copies to packages.

Performance targets: about 30 fps on a mid-range phone and 60 on a desktop, under 150 draw calls and 200k
visible triangles. The pixel ratio is capped at 1.5, there are no real-time shadows, and fog hides the far
edge.

## Building

```bash
node scripts/build-wanderworld-package.mjs
```

Edit `src/` and rebuild; never edit `client.js`, `manifest.json` or the artifact by hand.
