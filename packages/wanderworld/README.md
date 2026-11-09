# Wanderworld

A walkable, low-poly 3D world on its own Home tab in Marinara Engine. The goal is a world built from your
characters, persona and lorebooks, that you explore, talk in, and start scenes from. This is an early
prototype and is not listed in the catalog yet. The plan and milestones are in [docs/CONCEPT.md](docs/CONCEPT.md).

## What it does now (0.4.54)

### The world

- **A settlement of its own kind:** a hamlet round a green, a village with a stall market, a town with a
  fountain square, or a city; laid out as a grid, a crossroads, along one street or round the market;
  the market in the middle or off to one side, and cobbled streets with
  sidewalks or dirt paths (New world, or left to the seed). In a town: a town hall, a temple, a tavern and shops
  round the square with market stalls and benches; homes, a smithy and fenced gardens along cobbled streets
  with kerbed sidewalks, flowers and clutter by the doors, ivy, wagons and meadows on empty lots. Shops have
  striped awnings and hanging signs on painted boards; iron lamp posts light the streets at night, windows
  glow, and smoke rises from chimneys.
- **The land:** hills, mountain ranges along some edges, a winding river with plank bridges on piers, and
  places out in the country: hamlets of a few houses round a green (town2, town3…), farms with a barn
  and fenced fields, wayside inns and cottages at the end of their own dirt roads (never in the river),
  and caves up on the hillsides with no road to them. Roads join neighbouring hamlets, and inns stand by
  the road to a hamlet or farm. Each world chooses its own in New world, or leaves it to the seed
  (`src/land.js`, `src/caves.js`).
- **Built to its lore:** with places linked by name, a world is built with at least every numbered place
  its lorebooks mention (smithy3 makes three smithies; town2 brings a hamlet; farm2 two farms; a cave
  brings mountains for it). Past that, random.
- **Painted ground and water:** grass, dirt, forest floor, rock, snow, riverbed pebbles, cobbles, setts and
  slabs blended in one ground material, and rippling water (`world.js`).
- **Real buildings, props and nature** from Quaternius's free kits (Medieval Village, Fantasy Props,
  Stylized Nature); simple stand-ins show until they load, or if Settings turns them off.

### People

- **Play as** one of your personas, in its 3D Avatars model (VRM, GLB, FBX or MMD) or a built-in person.
- **Up to thirty characters live in each world,** in their own 3D models or dressed townsfolk (Quaternius's
  character packs, chosen from their name; a body picker sets Auto, Male or Female, per world).
- **A living town:** townsfolk visit shops and the tavern, sit on benches, find their way along the streets,
  go to work by day if they have a job, head home at night, and cross the river by a bridge or by
  swimming. Friends meet up and hold little conversations, taking turns; name tags are tinted by how each
  person sees you (red enemies, green friends, pink romance…).
- **Talking:** walk up and press E. They greet you by how they feel about you; pick from a few things to
  say, or type your own (set conversations until the AI update).
- **Relationships** (Journal → Relationships): how each person sees the others and you (friend, family,
  partner, rival, enemy and more, each with levels), and each one's temperament (passive to aggressive)
  and manner (shy to outgoing). Friends come over to say hello, someone who dislikes you keeps away, a
  sworn enemy comes to have words. Settings decide how often people come up to you, how many at once, and
  where confrontations may happen.
- **A party:** ask someone along in a conversation, or bring everyone standing round you (Journal → Party).
  They follow you, run to keep up, sit near you, wait where you ask, and cross water the way you did.

### Lore and the world's setup

- **Journal → Places** shows the world as a tree: the whole world, its characters, the town, its streets
  and the buildings on them, the wilds, and groups of places (which can sit inside each other). A
  lorebook entry can be tied at any level: active where you are and everywhere above it, everywhere for
  the world, or while you talk to or travel with that character. The **Lore** button shows what's active.
- **Lorebooks can set it all up** (each part opt-in in New world or Journal → World):
  - entries named or keyed after a place, its kind ("tavern", "the woods") or its numbered name
    (town1, tavern1, home6, inn1, cave1 — shown in the Places tree) link there;
  - "group of home" makes a group of every house; "located in town1" puts a place or group inside another;
  - on a character's entry: "male" / "female", how they see you ("enemy", "best friend", "mentor"…), how
    they stand toward others ("brother of Sarah", "friends with Tam"), and "lives in home6", "works at
    smithy1", "owner of tavern1";
  - your own entry, keyed "player <your persona's name>" (or "you"): its lore is always active, and it can
    give you a home (you start at your front door) and your relationships.
- **Regenerate this world** (Settings) rebuilds it from its setup with this version's land and the
  lorebooks' current needs, keeping its people, relationships, lore, groups and homes; optionally a new
  town layout, with every name and link moved to the same kind of place.

### Playing

- **Main menu and saves,** with painted art and a loading screen: Continue, New world (name, seed, your
  persona, the characters who live there from your Engine folders, the land, the settlement, any more
  hamlets and farms, the world's size from Small to Massive, the setting and lorebooks),
  Load world (thumbnails, Rename, Delete) and Settings. Each world keeps everything in its own save in
  this package's browser storage: where you were, the time, the cast, bodies, relationships, lore,
  groups, homes, notes and scenes.
- **Use things** with E, a click or a tap: sit on benches, read and pin to the noticeboard, swim, and open a
  door, a cave or the fountain for a card of things to do (go in, knock, toss a coin…) plus your own line
  and who comes along; choosing sets up a scene request for the AI part to play out (Settings → Walk into
  buildings brings back the unfinished furnished rooms).
- **The Journal** (J): Here, People (where everyone is, and where they live and work), Party,
  Relationships, Places (the setup tree) and World (setting, lorebooks, lore linking).
- **Swimming:** wade into the river and swim where it's deep (Shift swims faster).
- **Animation:** recorded clips from Quaternius's Universal Animation Library (idle, walk, jog, sprint,
  sitting, talking, swimming), or the hand-made motion (Settings → Animation).
- **Controls.** Computer: WASD walks, Shift runs, drag (left or middle mouse button) or the arrow keys look
  around, the wheel or + / − zoom, E uses, Esc stands up or leaves a conversation. Touch screen: the stick
  walks (all the way out runs), dragging elsewhere looks around, pinching zooms, and Use or a tap uses.
- **Settings:** resolution, draw distance (Tiny to Max; what costs the most is measured in
  [docs/PERFORMANCE.md](docs/PERFORMANCE.md)), trees and rocks, shadows, detail on or off, walk and run speed,
  camera speed and direction, time of day and time speed, sound, confrontations, people coming up to you,
  what the HUD shows, explanations under every option, and Regenerate this world.
- A day lasts 20 minutes at normal speed, with dawn, dusk and lamps lit at night.

It reads your personas, characters, character folders, lorebooks and 3D Avatars models from the Engine.
Everything it saves stays in this browser for now; nothing is saved to the Engine yet.

## Using it

Install it, then open the **Wanderworld** tab on Home. To walk in your persona's own model, set one up for
that persona in 3D Avatars first.

## How it works

- `src/main.js` mounts as the package's Home tab (`home-browser-tab` slot, `view="browser"`): the canvas,
  HUD and touch stick live in one element, and the WebGL renderer is reused when the tab reopens. It ties
  the world, the townsfolk, saves, the Journal and lore together.
- `src/world.js` lays out the town and builds the scene: the ground, roads, water and bridges, buildings
  (simple ones, then the kit's), props, nature (drawn out to the draw distance) and collision (circles and
  boxes in a 2D grid, not a physics engine). `src/land.js` makes the land (hills, mountains, the river,
  places out in the country and their roads); `src/caves.js` carves cave mouths; `src/fixtures.js` builds
  lamp posts, the fountain, lit windows, chimney smoke and awnings.
- `src/buildings.js` is the parts kit (a building is a spec chosen from fixed menus) and `src/houses.js`
  assembles a building from the village kit on its 2 m grid; both versions share a footprint and door.
- `src/zones.js` names the places of a world, finds the place at a point, says where someone is in words,
  and holds the setup logic: groups, numbered names, keeping the setup through a regenerate, and reading
  lorebook keywords (`matchLore`, `structureFromLore`, `needsFromLore`).
- `src/npcs.js` runs the townsfolk: each follows a small plan (walk, sit, go in, chat, work, wait), heads home
  at night, routes along the streets in town and straight across country (by a bridge over the river),
  swims, follows the party, and acts on relationships and temperament.
- `src/relationships.js` holds relationship kinds, tiers and warmth, temperaments, and reading
  relationships from lore keywords; `src/dialogue.js` the set conversations; `src/interactions.js` the
  things you can do with doors and things, and the scene requests they make.
- `src/character.js` applies motion to any humanoid and reads the Engine's personas, characters and
  character folders; `src/clips.js` plays the recorded clips (`src/clips/ual.json`, made by
  `scripts/build-wanderworld-clips.mjs`); `src/motion.js` is the hand-made motion; `src/models.js` loads
  3D Avatars models (VRM, GLB, FBX, MMD) into three-vrm humanoids; `src/people.js` and `src/figure.js`
  build the default people.
- `src/saves.js` keeps the saved worlds (every field checked on the way in); `src/menu.js` is the main
  menu, `src/journal.js` the Journal, `src/hud.js` the bar, panels and cards, `src/talk.js` conversations
  and speech bubbles, `src/signs.js` signs and the noticeboard, `src/ui.js` the parchment look,
  `src/sound.js` Web Audio sounds, `src/settings.js` the settings, `src/kit.js` the kit's models.
- `src/interiors.js` builds the (unfinished) room behind a door, off by default.
- three.js 0.186.1, `@pixiv/three-vrm` 3.5.5 and `mmd-parser` 1.1.4 (the versions the Engine uses) are
  bundled into `client.js`, because the Engine does not hand its copies to packages.

Performance targets: about 30 fps on a mid-range phone and 60 on a desktop. The pixel ratio is capped at
1.5, Auto resolution steps down when frames drop, nature and real lights follow the player, and fog hides
the far edge. A performance pass is planned once the bigger worlds are in (docs/CONCEPT.md, W8).

## Building

```bash
node scripts/build-wanderworld-package.mjs
```

Edit `src/` and rebuild; never edit `client.js`, `manifest.json` or the artifact by hand.
