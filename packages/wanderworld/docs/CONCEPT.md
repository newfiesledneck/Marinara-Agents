# Wanderworld — concept and prototype plan

A walkable, low-poly 3D world on its own Home tab in Marinara Engine, generated from your characters,
persona and lorebooks. A fantasy survival setting gets a fantasy world; a modern daily-life setting gets
a modern town. Buildings can be entered, and their interiors are generated the first time you go in.

Status: **0.5.13, 2026-11-11: an alpha offered to Engine `staging` testers. A seeded settlement and
countryside with named places, saved worlds and a Journal; up to thirty of your characters (and people a
world invents) living their days in it; AI conversations, moments, schedules, scenes, pictures, a world
set up or written by the AI from cards and lorebooks, and an AI assistant that changes a world on request.**
Package id `wanderworld`, branch `feat/wanderworld`. No issue or PR yet: both are drafted and wait on one
last check, a world made on a real Engine with a real model. In `STAGING_ONLY_PACKAGE_IDS`, so only the
staging catalog's preview lane lists it; tested through a dev catalog.

As built: a hamlet, village, town or city in one of seven layouts, with hills, mountains, a river, and
farms, hamlets, inns and landmarks out in the country; the player and the townsfolk walk in their own 3D
Avatars model (VRM, GLB, FBX or MMD) or a dressed townsperson from Quaternius's CC0 packs. 1.8 MB
`client.js` (three.js, loaders, three-vrm, mmd-parser), a 12 MB artifact with 191 kit files, and a
hand-written `server.mjs`. Readings by draw distance are in [PERFORMANCE.md](PERFORMANCE.md). Not yet
measured on a real phone. The store banner is the author's own art.

### Why a Home game, not a Game Mode Experience

0.1.0 was a Game Mode Experience (`game-surface` slot), and the Engine refused to install it: since
capability API 1.373 (Engine 2.5.x, 2026-10-22) a catalog Experience must be a data-only
`.experience.json` file with no code. Game Mode is also still changing, so features an Experience leans
on could move under it. A Home tab (`home-browser-tab` slot), like Modern Life Sim, Otome Hearth,
Saucelings and Gacha Forge, installs normally and depends on far less of the Engine.

What that costs: there is no chat on a Home tab, so no Game Mode narrator and no World Maps location
to read or move. Wanderworld runs its own world and saves, and picks its own sources in its own setup.

---

## Prototype rules

1. **Change no other package and no Engine code.** The prototype is one new package. It reads and
   writes only through routes and host APIs that already exist.
2. **Smooth before pretty.** Low-poly, flat-shaded, small textures. A user with a whole city in
   their lore should still get a smooth frame rate on a mid-range phone.
3. **The model decides what exists; the code decides where it goes** (Pixelforge's rule). The model
   never runs a frame, a collision or a number at play time.
4. **Depend on little.** Use the Home tab, the package's own server routes and storage, and the host
   APIs other Home games already use. Degrade quietly when something is missing: never a nag, never a
   retry loop.

---

## What the platform gives a Home game (checked against Engine 2.5.2, 2026-11-07)

| Need                                      | What exists                                                                                                                                                        | Where to look                                                                                     |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| A tab of its own                          | `contributions.slots: ["home-browser-tab"]` + `homeBrowserTab { label, ariaLabel, iconPaths }`; needs a client entrypoint; the icon must be hash-pinned in `files` | Engine `HomeBrowserHub.tsx`, `capability-package.schema.ts`                                       |
| Mounting                                  | The package's element is mounted once with `view="browser"`; props include `browserFullscreen { active, setActive, enterLabel, exitLabel }` (1.376) and `onClose`  | `HomeBrowserHub.tsx`                                                                              |
| Saves, model calls, characters, lorebooks | A server part (`server.mjs`) with package routes and storage, as every other Home game has                                                                         | `packages/otome-forge`, `packages/saucelings`, `packages/gacha-forge`, `packages/modern-life-sim` |
| Store logo                                | Apps use their Home tab icon as the store logo (`scripts/build-store.mjs`); no `store/icons/src/<id>.svg`                                                          | `CONTRIBUTING.md` "Store data"                                                                    |

Pixelforge (`packages/pixelforge`) is still the best reference for the world itself: seeded world
compilation, the brief schema, stable ids, and "a loading gate, not a background swap" (the world doesn't
run until generation finishes; a failure is a retry screen, never a default world saved for the player).

---

## The world from persona, characters and lore

The player picks the sources in Wanderworld's own setup screen, the way Otome Hearth builds its cast
from your character cards.

| Source                         | What it gives                                                    |
| ------------------------------ | ---------------------------------------------------------------- |
| Setting / genre (setup screen) | The **kit**: fantasy, modern town, sci-fi colony, survival wilds |
| Lorebook entries               | Landmarks, factions, named places, history, rules                |
| Character cards                | Who lives and works where, households, routines                  |
| Persona                        | Starting point, home, role                                       |

One structured call writes a **world brief** (what exists). A deterministic **compiler** turns it
into terrain, streets, lots and buildings from the kit. Same seed + same brief = same world.

### Generate as you go

1. **New world:** region terrain and the settlement layout (streets, districts, lots, building
   footprints and kinds).
2. **Approaching a building:** its exterior, from kit templates.
3. **Opening a door:** a short loading moment. One call writes what's inside (purpose, who's there,
   a few notable objects); the code lays out rooms and furniture from room templates.
4. **Saved once, then stable.** Only story-relevant buildings (homes and workplaces of cast,
   lore-named places) get written interiors. The rest are locked or generic.
5. **Hide the wait:** pre-generate the interior of a building the player is walking toward.

### Places as zones

A **zone** is a volume in the world (a district, a building, a room) with its own name and
description. Entering one shows its name. Later, zones are where conversations and scenes happen. If
World Maps ever offers a non-chat way to share places, zones are what would map onto it.

---

## Performance budget (the city case)

Targets for a mid-range phone:

- **~30 fps** on a phone, 60 on desktop; cap `devicePixelRatio` at about 1.5.
- **Draw calls under ~150**, **visible triangles under ~200k**.

How:

- **Low-poly, flat or vertex-colored**, one small shared texture atlas per kit. No real-time
  shadows: baked vertex ambient occlusion and a simple sun gradient.
- **Instancing** for repeated props (trees, lamps, fences, windows) and **merged static geometry**
  per chunk.
- **Chunks + fog:** the settlement is split into chunks, streamed in and out by distance; fog hides
  the cut-off. An InstancedMesh is culled as one unit, so each chunk owns its own instanced meshes.
- **LOD:** far buildings become simple boxes or flat cards.
- **One interior loaded at a time.** Entering a building unloads (or hides) the exterior's detail.
- **Simple collision:** capsule against a 2D grid or footprints, not a physics engine.
- **Characters start simple:** capsules or camera-facing billboard cards. A parametric character
  builder (model reads Appearance → body, hair, colors, outfit parts) comes after the prototype.

Library: three.js 0.186.1 (the Engine's own version) bundled in the package; it is about 550 KB of
`client.js`. The Engine does not expose its renderer to packages.

---

## Prototype milestones

| #    | Milestone                    | Done when                                                                                                                                                                                                                                                                                                                           |
| ---- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M0   | **Spike** ✅                 | A Home tab renders a three.js scene and walks a capsule with WASD and a touch stick, with an fps readout. Measure fps on a phone.                                                                                                                                                                                                   |
| M0.5 | **Persona and town** ✅      | The player is the chosen persona's 3D Avatars model (VRM walks, GLB shows) or a low-poly figure; a seeded town of houses, streets and a plaza; buildings block movement and the camera.                                                                                                                                             |
| M0.6 | **Parts kit** ✅             | Buildings from a spec chosen from fixed menus (kind, size, floors, roof, walls, colours, features) assembled from parts; plaza landmarks, shops, homes, smithy, gardens, stalls, benches and street clutter, still one merged mesh.                                                                                                 |
| M1   | **Walkable town, fixed kit** | The town in chunks, with named zones; entering one shows its name. Position, seed and persona saved. _Zones, where people are, who's near whom, the party and relationships are planned as W1–W4 (client, no restart)._                                                                                                             |
| M2   | **Town from lore**           | A setup screen picks persona, characters and lorebooks; the brief call builds the town; the world is saved by a server part.                                                                                                                                                                                                        |
| M2.5 | **Things to do** ✅          | Use system (E, click, tap; walk to what you clicked), benches and chairs, doors that open, a furnished room inside every building from templates by kind, the conversation screen with placeholder replies, townsfolk routines, day and night, sound, settings.                                                                     |
| M3   | **Enterable interiors**      | Doors load a generated interior (one call, saved); leaving restores the exterior. _0.4.4 has template rooms by building kind; 0.4.13 puts them behind a setting. For now a door shows who's inside: going in will start a role-play scene with them in the chat, with generated pictures, once the server part exists (see below)._ |
| M4   | **People**                   | Cast characters placed at their homes and workplaces, as billboards or simple figures. _0.4.0 has the picker, their own models, homes near the plaza and wandering; homes and workplaces from the brief come with M2._                                                                                                              |

**Out of scope for the prototype:** changes to other packages, Game Mode, VRM or 3D avatars, survival
or daily-life rules, combat, building, and the parametric character builder.

---

## Controls

One scheme for every screen, kept small so it stays learnable. E is "use" (sit, open, go in, talk) and
never moves the camera; Esc stands up or leaves a conversation.

|                        | Computer                                                     | Touch screen                                 |
| ---------------------- | ------------------------------------------------------------ | -------------------------------------------- |
| Walk                   | WASD (camera-relative)                                       | The stick, bottom left; a small push strolls |
| Run                    | Hold Shift                                                   | Push the stick all the way out               |
| Look around            | Drag with the left or middle mouse button, or the arrow keys | Drag anywhere off the stick                  |
| Zoom                   | Mouse wheel, or + / −                                        | Pinch                                        |
| Use                    | E, or click it (further away: you walk there first)          | The Use button, or tap it                    |
| Walk to a spot         | Click the ground                                             | Tap the ground                               |
| Stand up, stop talking | Esc, or move                                                 | Move, or the Leave button                    |

The camera orbits a point at head height: yaw all the way round, pitch from a little below head height
(looking up at towers) to nearly overhead, zoom 2.5–18 m. It never goes below the ground, and it slides
in when a building stands between it and the player. A press that moves under 5 px is a click, not a drag,
so clicking someone to talk to them won't fight with looking around. In a conversation the camera moves
to a side-on two-shot of the pair, on whichever side isn't blocked by a building.

---

## Plan: world state in the client (no restart)

Everything the AI will later be told about the world starts as plain state in the client, shown on screen
and kept in this package's browser storage until the server part (S1) takes it over. Each piece is built
so a model call can read it as-is and later write to it.

### W1. Places and zones

_In 0.4.14: zones, the place line and names on entering, `describe`, renaming and zone lore in the
Journal, shop signs, all saved per world (`saves.js`). Still to do: a zone editor beyond renaming, and
signs that carry a picture by default._

- **Every spot has a place:** buildings by kind and name ("the tavern", "Mira's house"), the plaza and
  its fountain, each street, gardens, meadows, the edge of town, the forest. A zone is a shape (a box or
  a circle) with an id, a name, a kind, and optional tags; nested zones read from small to large ("by the
  fountain, in the plaza, in town").
- **On screen:** the zone's name shows briefly on entering it (the M1 goal), and a small place line sits
  by the clock.
- **Signs:** shops, the tavern, the smithy, the temple and the hall have a board over the door with the
  place's name, so a rename ("The Rusty Tankard", by hand now, by the AI from the world brief later)
  shows on it. A board can carry a picture beside the words: default carved pictures per kind, or one the
  AI generates for the place with the server part (packages can generate images there through the
  Engine's integrations).
- **Where each person is, in words:** `describe(person)` gives one line from their zone, what they're
  doing and what they're near: "Jake is sitting on a bench by the fountain in the plaza", "Sarah is inside
  the tavern". These lines are exactly what S3 and S4 send.
- **Zone lore:** a zone can name lorebook entries (from the brief in S2, or picked by hand in a zone
  editor). An on-screen list shows which entries are active where the player stands (walking into the
  forest shows "Wilderness"). Showing and choosing them works in the client (the lorebook list is read
  like the character list); sending them to the model is S4's prompt context.
- **The setup tree (0.4.30):** the whole world (`world`) → its places, each inside the one it sits in
  (town → street or square → building; the forest → mountains, river, outposts → their buildings) →
  groups, which can sit inside other groups; and characters (`character:<id>`). Lore can be tied at
  any level and is active where you are, in every place and group above it, everywhere for the world,
  and for whoever you're talking to or travelling with. The setup survives a regenerate, even with a
  new layout: each place keeps its identity by kind and order (the second home, the first inn) and its
  names, lore and group places move with it (`remapZones`, `carrySetup`). S2's brief writes this setup;
  the player views and changes it in Journal → Places.
- **Setup at New world (0.4.31):** `setting` (words), `lorebooks` (ids) and `loreLinking`: "keywords"
  links entries whose name or a keyword is exactly a place's name or kind word, a group's or a
  character's name, or "world" (`zones.js` `matchLore`), once at the first build and again on request;
  "ai" leaves it for S2, which links entries to places by meaning; "none" is by hand.
  `characterLinking` does the same for characters (0.4.33): their entries link by name, and keywords
  set what isn't set yet (`relationships.js` `setupFromWords`: "male"/"female" picks the body; a kind,
  label, tier or role such as "enemy", "sworn enemy", "mentor" or "sister" sets how they see the player).
  Keywords of the form "<relationship> of|with <Name>" ("brother of Sarah", "friends with Tam") set how
  they stand toward another character in town or the player (`linksFromWords`), one way only: the
  user's lorebook says each direction, nothing is inferred.
- **Structure from lore (0.4.37):** every place has a numbered name by kind and order (`slotsOf`:
  town1, forest1 (also wilds1), tavern1, home1…, inn1, cave1), the same identity a regenerate keeps.
  Entry keywords "group of <kind>" (a group of every place of that kind, the entry its lore), "located
  in <place>" (inside another place or group; one the world hasn't built there waits for the world
  builder in `waitingPlacements`), and on characters "lives in", "works at", "owner of" (`housing`: a
  lore home is reserved for those named; workers go to work by day) — `structureFromLore`.
- **Built to the lore (0.4.38):** `needsFromLore` reads the highest number used per kind in a world's
  lorebooks (also inside "lives in home6", "located in cave1"); the world is built with at least that
  many (`landscapeNeeds`: mountain sides, a river, inns, cottages and caves, a cave bringing mountains;
  `buildTown`: extra taverns, temples, halls, smithies and shops in place of houses), random past that.
  Saved as `needs`; regenerate reads them again. Second towns (town2) are the next step: a smaller
  village out in the country on its own road, with its own square and buildings.
- **The player's entry (0.4.39):** keyed "player <persona name>" / "persona <name>" (one persona) or
  "you" / "player" / "persona" (any), never the bare name, which a character may share (`PLAYER_ID`).
  Its lore is always active; gender words set the persona's body, "<relationship> of <Name>" how the
  player sees others, and "lives in" the player's home (`housing.player`: reserved, named for
  everyone in it, the start point of a new world, its door card the player's own).
- **Place groups (0.4.29):** places gathered under a name however they lie (every home in town; the
  forest, mountains, a shepherd's cottage and the river as "the wilds"). Lore on a group is active in
  every place in it, on top of each place's own and the places it sits in. A world's groups are plain
  data in its save, `groups: [{ id: "group:…", name, members: [zone ids] }]` (`zones.js`
  `checkGroups`, `defaultGroups`, `groupsAt`), edited in Journal → Places now and made or changed by the
  AI later (S2 can write them with the brief).

### W2. Who is near whom

- `nearby(person)`: everyone within talking distance or in the same room or zone, nearest first, with
  what they're doing ("Sarah is near Jake, by the stalls"). Updated a few times a second, and cheap with
  thirty people.
- It feeds behaviour now (greeting, avoiding, joining) and context later ("who can hear this").

### W3. Party and following

_In 0.4.15: asking along from a conversation, following in rows of two, running to catch up, waypoint
routing, sitting near a seated player, catching up when lost, wait here, part ways, saved per world, and
named on a door's card. Not yet: following into walk-in rooms (followers wait outside), and the party
going into a scene together (W5)._

- Invite someone from a conversation or the Use menu; they follow at a short distance in a loose line,
  walk when you walk, run when you run, find their way round buildings with the street waypoints, sit
  near you, and come through doors with you. Dismiss them, or tell them to wait here.
- A party panel lists who's with you. The party is part of the world state, so a scene knows who came in
  with you.

### W4. Relationships (built to grow)

_In 0.4.24 (`relationships.js`): one record per direction, `{ from, to, kind, level 0–100, role, notes,
history, updatedAt }`, with kinds acquaintance, friend, romance, partner, family, colleague, mentor,
rival, enemy and fear, each with four named tiers and a warmth that drives behaviour. Townsfolk with no
record know each other as acquaintances; toward the player, strangers. Each character also has traits,
aggression and sociability (0–100), which move where confronting and greeting start. Settings →
Confrontations and combat gates confronting by place (anywhere, outside towns, outside safe places, off).
Set by hand in the Journal's Relationships tab; the AI sets and changes them later._

The first version is small; the shape is meant to take a lot more later without a rewrite.

- **One record per direction**, from one person (character or persona) to another, because how Sarah
  sees Jake needn't match how Jake sees Sarah:
  `{ from, to, kinds: ["sister", "friend"], feeling: -100…100, trust: -100…100, tags: [], notes, history: [], updatedAt }`.
  `kinds` are open words from a suggested list (family, friend, partner, rival, enemy, employer …) so
  new ones never need a migration; numbers drive behaviour; `notes` and `history` are words for the
  model. A version number on the store lets later fields arrive with defaults.
- **Behaviour now:** high feeling walks over, waves and greets ("Hey, Sarah!" as a bubble); low feeling
  or an enemy kind keeps its distance or turns away; family and partners sit together. All through the
  existing plan steps, so S5's AI plans can use the same hooks.
- **Set by hand now** (a Relationships panel per character, and for the persona); **set by the AI
  later** from character cards and lore, and changed by what happens (conversations, scene recaps,
  world events), with `history` keeping why.

### W6. The land and the shape of the town

_In 0.4.16 (`land.js`): a world's `landscape` (hills, mountain sides, a river, outposts: inn, cottage,
cave) builds hills, ranges, the river with its banks and bridges, and dirt roads out to each outpost.
The seed fills it in, New world can choose each part, and the save keeps it._

- **The AI chooses the land:** the world brief (S2) writes the landscape like any other part of the
  world: whether there are mountains, a river, a lone tavern on a forest road, a cave in a hillside, and
  names for them. Every part is optional and checked, so worlds differ and a partial answer still works.
- **More outposts:** a mill, a farmstead, ruins, a shrine, a watchtower, a campsite; more cave kinds (a
  mine, a grotto by water); lakes and ponds; a coast.
- **Town shapes, not only the square grid** (now planned in W8): a single row of houses along a winding road through the
  map, a crossroads village, a scattered hamlet, a town on both banks of the river with bridges in it, a
  walled town with gates. The layout is a set of plots along roads, so zones, signs, waypoints and the
  townsfolk keep working whatever the shape. The brief picks the shape and the plots' kinds.
- **A world builder:** an editor mode with an item menu (buildings by kind, props, trees, rocks, roads,
  water, outposts) to place, move, turn and remove things, either from an empty map or on top of a
  generated world, then save it as a world to play. Because a world is a list of parts (landscape,
  plots, placed things), the editor and the AI write the same thing, and a built world can still be
  filled with people and lore by the AI.

### W7. Things to use, placed by the world

_In 0.4.21: a noticeboard on the square (`world.noticeboard`), its notes from the town's place names plus
the player's own (saved as `notices`)._

- The brief places usable things like any other part of the world: noticeboards (in squares, outside an
  inn, at a crossroads), and later wells, shrines, chests and signposts. Each is a kind with a spot.
- **Notes the AI writes:** quests ("the miller's cart lost a wheel on the road to the inn"), news and
  rumours, from the cast, lore and recent events, pinned with who posted them. Taking a quest note can
  start a scene or set a goal; the player's own notes go into context too.

### W8. World generation, the next version (planned 2026-11-09)

Goal: worlds that come out very different from each other, bigger worlds with room for more places, and
a structure ready for several settlements and for travelling between regions. Everything stays
seeded, saved with the world, settable in New world and Regenerate (each choice can be left on Auto),
and driven by the lorebook's numbered places (0.4.38) as a minimum.

**Phase A: world size and draw distance** — _done in 0.4.49: `WORLD_SIZES`, the ground in 80 m chunks
(8 m cells, 2 m near the player, skirted edges), nature reach per kind with simple trees far off, six
draw distances, size in New world and Regenerate; readings in docs/PERFORMANCE.md._

- **World size:** Small, Normal (today's world), Large, Huge, Massive (about 0.7×, 1×, 1.5×, 2× and
  3× the side). Chosen in New world and Regenerate, or Auto (from the settlements and the lore's needs).
- **Draw distance:** Tiny, Near, Medium, Far, Very far, Max (about 60, 90, 140, 200, 300 and 450 m).
  It sets how far buildings, people, props and nature are drawn, and the fog closes in just inside it
  so what isn't drawn is never seen as empty ground.
- **What bigger worlds need:** the ground in chunks with coarser detail far away (one mesh at 2 m cells
  doesn't scale to Massive); buildings, props and people culled by distance in chunks; nature already
  culls by distance (`refreshNature`). Collision and zones stay grid-based.

**Phase B: settlements** — _B1 done in 0.4.50: kinds (`SETTLEMENTS` in world.js; hamlet 2×2 blocks with
a green, village 3×3 with stalls, town 5×5 with the square, city 7×7), market style and position (`side`),
cobbled or dirt streets, all in `landscape.settlement` (`checkSettlement`; worlds without one stay the
old town), grown by the lore's homes. B2 done in 0.4.51: layouts as the blocks a settlement builds
(grid, crossroads, street, ring), with streets, street points, lamps and wagons only by built blocks.
Saved for later: riverside and hillside layouts (they need the settlement placed against the river or a
slope), crossroads arms as one central street instead of a street each side. B3 done in 0.4.52: more
settlements as hamlets out in the country (`kind: "hamlet"` outposts: five to eight houses round a green
on their own road, a `town:<i>` zone numbered town2, town3…, their houses among the homes), from New
world's "More settlements", now and then the seed, or the lore naming town2 and up. Saved for later: a
second village, town or city (the other settlement is a hamlet for now)._

- **Kinds by size:** hamlet (a handful of houses, maybe a well, no square), village (a green or a few
  market stalls, one or two trades), town (a square with a fountain, the usual landmarks), city (more
  streets, several squares or markets, more of every trade, later walls and gates). The kind decides
  how many buildings and which ones; the lore's needs come on top.
- **Layouts:** grid (today), crossroads, along the road (one long winding street), ring round a green,
  riverside (along the river, a bridge in town), hillside (terraced). The market isn't always a central
  square with a fountain: it can be stalls at a crossroads, a green, or a riverside quay, and can sit
  off to one side.
- **Roads:** cobbled streets (with kerbs and sidewalks, as now) or dirt paths (no sidewalks); later
  gravel. Chosen per settlement or Auto (hamlets dirt, cities cobbled).
- **More than one per world:** any mix (a hamlet and a city, two villages and a hamlet…), each its own
  zone (town1, town2…) with its streets and buildings under it; numbered names continue across them
  (home1… counts every settlement's houses). Lore and setup keep working by numbered name.

**Phase C: the country, placed where things fit**

_C1 done in 0.4.53: farms (`kind: "farm"` outposts: a farmhouse, a barn built from plain shapes, two
fenced fields of crop rows, 28 m of level ground; farm1, farm2… for lore; New world's "Farms"), and
hamlets and farms kept in front of mountain ranges. C2 done in 0.4.54: the road network (hamlets on
neighbouring sides joined round the town's corner as `road:<a>-<b>`, inns beside the hamlet or farm road
on their side, inn and cottage tracks branching off a main road when that's shorter). Saved for later:
cottages in forest clearings, a mill on the river, roads between opposite sides, cobbled country roads._

- Places go where they suit the land instead of a few fixed spots per side: inns where roads meet,
  cottages in clearings, caves on real slopes (as many as wanted, no roads), farms in open flat fields
  with large plots, fields and a barn nearby, a mill on the river.
- **A road network:** roads join the settlements to each other (and branch off to outposts), crossing
  the river by bridges; dirt or cobbles by what they join.

**Phase D: regions and travel**

_Done in 0.4.55: regions on a map of keys ("0,0" is home, region1), each `{ name, number, seed,
landscape }` in `save.regions`, made the first time you cross an edge (no mountains on the arrival edge).
The region you're in owns `names`, `lore`, `groups` and `housing`; the home region's wait in `homeSetup`.
Only the party travels; the rest of the cast stays home. Each trip saves a `travel` scene request.
Regenerate works in the home region only. Saved for later: lore naming regions (region2…), townsfolk of
their own in other regions, the AI writing a region from its name, encounters on the road._

- Each map is a region (region1, region2…); a world is a set of regions, each with its own seed, land,
  settlements and needs, saved with the world. The lorebook can name regions like any other place.
- At the edges of a region, "[E] Travel to <region's name>" takes you to the matching edge of the next
  region's wilderness, with the party. Travel can start a scene on the way (an encounter, a fight, a
  travel scene): for now the hook and a travel request (like a scene request), the AI part later.

**Phase E: seeing the world**

_Done in 0.4.56: `map.js` draws a world on a 2D canvas from `world.map` (the built world) or
`previewMap(seed, landscape, size)` (a world not built, leaving the one being played alone): land shaded by
height, the river, roads, the town's blocks, places by kind. New world and Regenerate preview with Reroll;
Journal → Map adds names, the player and the regions beyond each edge. Saved for later: lore needs in New
world's preview (they're read when the world is made), a zoomable map, marking places on it._

- A small top-down map in New world and Regenerate to preview the layout before playing, with Reroll.
- The same map in the Journal: where you are, named places, regions and travel points.

**Saved for later (not forgotten)**

- New kinds of place: ~~a mill, ruins, a watchtower, a graveyard, standing stones~~ (0.4.58, `LANDMARKS`
  in world.js, numbered ruins1, mill1…). ~~A pond~~ (0.4.66, swimmable). Still to come: a bigger lake,
  more cave kinds (a mine, a grotto), a coast, farms in fuller detail.
- Weather: ~~rain, snow and mist~~ (0.4.60, `weather.js`, Settings → Weather, off by default). Still to
  come, only if they look good: wet darker ground, snow lying on the ground, rain sounds, and seasons
  (autumn colours on the trees). Notes from before: the Engine's chat weather (`WeatherEffects.tsx`, with
  `weather-renderer`) is a 2D overlay; it's a guide to the look and the weather names, but here it
  would be rain and snow falling in the scene, fog density, the sky's tint, wet darker ground, snow on
  the ground through the snow layer, autumn colours on the trees.
- ~~City walls and gates~~ (0.4.59: `placeWalls`, `settlement.walls`, gate street points); second-town details; a world builder (W6); the AI writing the land, settlements
  and travel scenes (S2, S4); a performance pass once the bigger worlds are in.
- More animations (the earlier list's item 8): working at a forge or counter, carrying things,
  sweeping, drinking at the tavern, kneeling at the temple, waving and pointing, sleeping.
- ~~Homes and workplaces set by hand in the Journal~~ (0.4.57: Journal → People → Set homes and work).
- The in-game People panel in the Engine's character folders, like New world (0.4.41).
- The dark wood planks texture (`wood-planks-dark` in the art folder): shop fronts, awnings' frames, a
  dock by the river.
- ~~Swimming for townsfolk and followers~~ (0.4.47) and the small fixes (World clock, lore counts,
  group delete; 0.4.47).

### W5. Scene setup (the request, before there's anything to send it to)

- **Triggers:** using a door, a button for a scene anywhere, and later zone triggers (an ambush in the
  woods). Each opens a small setup sheet.
- **The door sheet:** Enter, or Enter with your own first message ("we sneak in through the back", "I
  kick the door in"); who from the party comes in; who is inside (W1); the place and time.
- **The request it builds:** `{ trigger, place, time, entering: { who, how, firstMessage }, present,
nearby, relationships between them, zone lore, recent events }`. The client can build it and show it
  in a debug view now; S4 sends it.

---

## Plan: the server part (later; needs an Engine restart)

Everything below needs a hand-written `server.mjs`, like Quartermaster's. It adds three things to the
package: an Engine restart on install and update (`restartRequired: true`), the `routes` and `storage`
permissions (plus `scenes` for S4), and model calls on the user's own connection. Client-only work (the
parts kit, interiors from templates, polish) carries on beside it.

Checked against Engine 2.5.2 (`11489b4`), 2026-11-07; scene and prompt-context contracts rechecked against
Engine `staging` (`27e363843f`), 2026-11-08.

### What the server gets (`activate({ api })`)

| Need                            | Host API                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Seen in                                                                       |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| HTTP routes for the client      | `api.registerPrivilegedRoutes((routes) => routes.get/post(...))`, served at `/api/wanderworld/...`; permission `routes`                                                                                                                                                                                                                                                                                                                                              | Quartermaster `server.mjs`, Otome Hearth                                      |
| Saves                           | `api.runtime.persistence.documents`; permission `storage`                                                                                                                                                                                                                                                                                                                                                                                                            | Quartermaster, Otome Hearth `store.ts`                                        |
| Personas, characters, lorebooks | `api.runtime.resources.listPersonas / listCharacters / listLorebooks / listEligibleLorebookEntries`                                                                                                                                                                                                                                                                                                                                                                  | Otome Hearth `setup/cast.ts`                                                  |
| Model calls                     | `api.runtime.languageModels.resolveForRequest({ connectionId })` → `chatComplete(messages, { temperature, maxTokens })`; `api.runtime.json.parseJsonish` for forgiving JSON                                                                                                                                                                                                                                                                                          | Quartermaster wardrobe, Otome Hearth `generation.ts`                          |
| Debug logging                   | `api.runtime.logger.debugOverride(debugMode, ...)` when Debug Agents is on                                                                                                                                                                                                                                                                                                                                                                                           | Quartermaster                                                                 |
| Full Engine scenes              | Client prop `startScene({ originId, prompt, plan, data, initiatorCharacterId })` → `{ chatId }`, plus `openChat` and `focusSceneOriginId`; server `api.registerSceneOrigin({ getContext, claim, release })`. `getContext` returns `{ characterIds, personaId, connectionId, transcript, notes, lorebookIds }`; `release` gets `{ kind: "concluded", summary, characterIds, ... }`. Permission `scenes`, capability API 1.66. The Engine casts Engine characters only | Slurp 2 `server.mjs` and `docs/SCENES.md`; Engine `shared/src/types/scene.ts` |
| Context in any chat turn        | `api.registerPromptContext((request) => text)`, called once per generation with `{ chatId, chatMeta, mode, targetCharacterIds, personaId, wrapFormat }`; returns text to append. Permission `prompt-context`. A scene started from Wanderworld carries `chatMeta.scenePackageOrigin`, so the contributor knows which world and place it belongs to                                                                                                                   | Slurp 2; Engine `capability-prompt-context.service.ts`                        |
| Voices                          | Client `__MARINARA_HOST__.services.tts` (the Engine's `lib/tts-service`: `ttsService`, `playWhenAvailable`). Never open the TTS audio cache directly; `validate-catalog.mjs` refuses that                                                                                                                                                                                                                                                                            | Engine `marinara-host-contract.ts`                                            |

How the Engine's own modes talk: Conversation, Roleplay and Game assemble their prompts inside the Engine
and don't expose them to packages. Packages that hold their own conversations (Otome Hearth's messages and
dates, Quartermaster's wardrobe) do it themselves: resolve the connection, build messages from the
character and persona records, fit the context, call `chatComplete`, and keep their own history.
Wanderworld follows that, and hands off to a real Engine scene (S4) when a moment deserves the full chat
treatment (image generation, backgrounds, agents, memory).

### Where it stands (0.4.68)

_Done: `server.mjs` with privileged routes (status, connections, talk, image, scene-origin,
scene-results), a scene origin (`getContext`, `release`), permissions `network`, `routes`, `scenes`,
`storage` and `ui`, `restartRequired: true`, capability API 1.66, Engine 2.4.6 or newer. S3's model call
is `POST /talk` (character card, persona, place, time, weather, relationship, zone lore, history). S4's
Engine scene is "Play it as a scene" on a scene card (the host's `startScene`, the Engine plans it from
our `getContext`); recaps become world `events`. Pictures go through the Engine's avatar-generation route
with a style profile id, as Quartermaster's do. Not yet: S1's world documents on the server (worlds stay
in the browser), S2's world brief, S5's daily plans, the prompt-context contributor for scene turns, TTS,
and a preset choice for scenes (the host's `startScene` takes none)._

_0.4.69: moments (`POST /moment`: narration, replies from listeners in earshot by voice, and plans
they agree to; the chat window's commands `/s /w /p /a`), S5's schedules (`schedules.js`, followed in
npcs.js, edited in Journal → People, `POST /plan` for the AI; moments put agreed plans in), and Illustrate
(`POST /illustrate` from an editable template, pictures kept per world as `picture` documents, at most 60).
Quartermaster as Wanderworld's character sheet needs a change in Quartermaster: it keys everything by chat
(its sheet element takes only a `chatId`), and a world isn't a chat. Scenes from Wanderworld are real
roleplay chats, so Quartermaster already works inside them._

_0.4.71: scenes are planned by Wanderworld (`POST /scene-plan`, `checkScenePlan`) and made through the
Engine's `/api/scene/create` over loopback (`POST /scene-start`) with the chosen prompt preset, because
the Home tab's `startScene` takes no preset and shows the Engine's dialog with choices remembered from
other chats. A failed plan falls back to `startScene`._

_0.4.72 to 0.5.0: offered to staging testers; the AI sets a world up from cards, persona and lorebooks
(`POST /lore-setup`, reviewed before the land is built, with retries), writes a world's own lore and
invents its people (`POST /world-write`: places, people, detail; family from the cards first); keywords
became `ww:<what>:<value>`; strangers and knowing, stances, the narrator card, scenes from anywhere,
campfires, errands, the world's voice; Illustrate's sizes, AI rewrite with review, `{world_look}`._

_0.5.1 to 0.5.13: buildings dressed each in their own style, the open forge, places to work and rest
out of doors and the clips for them (below: "A livelier town"); the chat goes with a picture's rewrite; open ground in a settlement is put to use and
streets are named only where laid; three more layouts (scattered, pond, quarters); an age range for the
people the AI makes; and the AI assistant (`POST /assistant`), below._

**The AI assistant (S6, built 0.5.3 to 0.5.10).** Settings → AI assistant is a chat with the model about
the open world. Each turn sends the last twelve turns and only the parts of the world the message needs
(`src/assistant-context.js`): everyone's name, home and work, the groups and the factions always go; the
rest (everyone in detail, relationships, places, days, where the player is, lore ties, the world's lore,
the noticeboard, the Help text, ages, the recent chat, scene recaps) goes when a ready-made request names
it (`PICKS`, each with its `needs`) or the typed words are about it (`TOPICS`; the message before rides
along). People the message names go in full. The model is told what was left out and may answer with
`{"need": [...]}`, once, to be asked again with it; the answer says what was sent. A keyword draft
(`task: "keywords"`, `keywordMessages`) sends the Help's keyword prompt, the names and places, and only
the lorebook entries the player ticked; nothing in its answer is read as an edit. The model answers in words and, when asked for a change, one fenced `wanderworld` block of
JSON edits. `readAssistant` (server) takes the block out of the words and checks every edit field by
field against fixed lists and lengths: anything else is dropped and counted; a block that isn't JSON, isn't
the format or was cut short changes nothing and says so. `applyAssistantEdits` (client) then resolves
names and numbered places against the world, once dry for the proposal the player reads and once for real
on Confirm, through the setters the Journal uses. The proposal is editable: each edit has a tick, and its
written parts (`src/assistant-edits.js`: lore text, a card's parts, a new person's name and card, a place's
name, the setting and look, a note, an errand; a relationship's kind from a list, and its roles) are boxes the player may rewrite; Confirm applies the edits
as they left them, cut to the server's limits, and never an edit the proposal didn't show. Confirm first copies every field the assistant can touch
(`ASSISTANT_FIELDS`) and copies them again after; a failure part-way puts the first copy back. Undo takes
back only the difference between the two copies (`src/undo.js`, a three-way merge with the world as it is
now, so what changed since by hand or through play stays), then brings the cast, homes, days, names and
signs back in line. Edits: relate, home, work, set (body, voice, temperament, manner, stance,
knowing), day, add_person, remove_person (invented people only), faction, lore, card (invented people
only), rename, hours, group, world (setting, look, ages), notice, unpin, errand (and dropping it), scene
(started through `sceneHere` once the rest is applied; not undone). A faction's lore is one entry of the
world's book tied to every member, kept in step as members join and leave, and never taken for a member's
own. Someone added while away lives in that region (`locals[].region`, `isHere`). The chat is kept in
the save (`assistantChat`); proposals and Undo last the session. Lore is rewritten whole and told
to keep its detail. It cannot reach Engine cards, personas, lorebooks, settings, the map or buildings.

**What every call sends, and seeing it (0.5.10).** Each route builds its prompt from what that call is
for: a conversation gets the two cards, the place, the relationship, the lore active there and the last
lines; a moment the listeners' cards cut short, the active lore and the last lines, and the list of
places only when something is said to someone (a plan can only come of that); a day plan one card and
the places; a scene plan the cast's cards cut short; a picture only the filled template. With the
Engine's Debug Mode on (the client reads it from the Engine's saved UI settings, as Quartermaster does,
and sends `debugMode` with each request; `isDebugAgentsEnabled` on the server also counts), `askModel`
and `paint` write every request and answer through `logger.debugOverride`: `[debug/wanderworld/<call>]`
with the model, temperature, token limit and the messages, and for a picture the connection, model, size,
style and prompt.

**Security notes (for the PR):** the assistant's context includes text from cards and lorebooks, which
someone else may have written, so a card could try to steer it. What limits that: its only power is the
edit list above, every edit is shown to the player and needs Confirm, edits reach one world's save and
nothing in the Engine, and its words are shown as plain text. Every route body is checked (ids by pattern, text by length, numbers
clamped, style profile ids from a fixed list); the connection list carries only id, name, provider,
model and default flag (the Engine already masks keys, and none are read); the loopback goes only to
127.0.0.1 on the Engine's own port, to two fixed paths; model calls use `languageModels.resolveForRequest`
with the user's chosen connection id; scene contexts must name at least one character and an origin id
of the form `world:<id>/…`; `release` is idempotent per scene chat; stale contexts are removed after
three days.

### S1. Foundation

- `server.mjs` with `activate`, built and hashed by `scripts/build-wanderworld-package.mjs` (syntax-checked
  like Quartermaster's), and `restartRequired: true`.
- A world document per world: seed, brief, cast, player state (position, persona), conversation logs and
  world events. The client's localStorage choices move here.
- Routes: list, read, create and delete worlds; save player state (throttled).
- **Scene requests (client side in 0.4.26, `interactions.js`):** using a door, a cave or the fountain
  builds `{ version, thing: { kind, name, chain }, action, verb, line, inside, party, persona, hour, at }`
  and its sentence (`describeScene`); the last 30 are kept in the world's `scenes`. The server part turns
  one into a role-play scene with everyone there in context. New kinds of things and actions are entries
  in `ACTIONS`.

### S2. World from lore

- **Setup screen:** persona, characters (who lives there), lorebooks, an optional setting line ("a cosy
  fishing village"), and optionally which connection writes it.
- **One structured call writes the world brief**, following Game Mode's worldgen (Engine
  `shared/src/features/world`: starter setting kits, brief, deterministic town compiler, interiors by
  building purpose):
  - `kit`: a setting family (fantasy village, modern town, sci-fi colony, survival wilds …) with palette
    and mood words.
  - `town`: name and size.
  - `places`: each has a name, a kind from a fixed list (home, tavern, inn, shop, smithy, temple, hall,
    market, school, café, clinic, workshop, farm, tower …), parts-kit choices from fixed lists (size,
    floors, roof, walls, accent colour, features), a short description, and lorebook entry ids.
  - `residents`: for each character, a home, a workplace and a daily routine word.
  - `playerHome`: the persona's home.
- **The compiler places it:** the landmark on the plaza, named places nearest it, then character homes and
  workplaces, then ordinary houses. Named places get signboards. Same seed + same brief = same town.
- **Validation:** unknown kinds or options fall back to defaults, never fail. A failed call shows a retry
  screen and never saves a default world for the player (Pixelforge's loading gate).

### S3. Conversations

_The client side is in 0.4.4: starting a conversation, the facing lock, the two-shot camera, the chat panel
and speech bubbles, and talking gestures. Replies are placeholder lines; this step swaps them for the model
call below._

- **Start:** walk up to a character (within about 2 m, facing them) and press **E**, click them, or tap
  **Talk**.
- **Interaction lock:** movement input pauses. The player and the character turn to face each other at
  conversation distance (about 1.2 m). The camera glides to a side-on two-shot, perpendicular to the line
  between them, close and at head height. Esc or **Leave** restores the walking camera.
- **Chat:** a chat panel at the bottom to type in, and speech bubbles over heads (with the panel as a log).
  Optional TTS through the host service, in the character's Engine voice.
- **Model call** (`POST /api/wanderworld/talk`), built server-side from:
  - the character's record (description, personality, scenario, example messages, appearance)
  - the persona's record (name, description, personality, appearance)
  - where they are (town, place, time of day)
  - lorebook entries matched to the recent lines (`listEligibleLorebookEntries`)
  - that character's conversation history in this world, with a short rolling summary once it grows

  The reply is the character's line only; the user's own words are never written for them.

- **Later:** small actions in replies (walk somewhere, give an item), relationship memory, and characters
  talking to each other.

### S4. Zones, scenes and world context

- **Zones** are areas in the brief or the compiler (a district, a building, a crossroads, a forest
  clearing) with triggers: `enter` (an ambush when you walk into the woods), `interact` (talking to a
  certain character or touching an object, or using a door), and conditions (time of day, once only,
  after a flag).
- **What a trigger plays** (keep it pluggable):
  - **In-world beat:** one call writes a short exchange that plays as speech bubbles (and optional TTS)
    where it happens. Cheapest, and stays in the 3D world.
  - **Engine scene:** `startScene` opens a real roleplay scene chat with image generation, backgrounds,
    agents and memory. `release` brings back the recap, which becomes a world event (flags, relationship
    history, who was there) so the world remembers.
- **Starting a scene from W5's request:**
  - `originId` is the world and place (`world:<id>/place:<id>`); `getContext` returns the people
    present and entering (Engine characters only), the persona, the connection, the zone's lorebooks
    (`lorebookIds`), and `notes`: where everyone is, who came in with whom and how, relationships between
    them, time of day, recent events.
  - The plan's `firstMessage` is the scene's opening, written for the trigger ("Sarah walks into the
    tavern casually, Jake with her"), or the player's own first message when they wrote one.
  - `data` (up to 4,000 characters, handed back to `claim` and `release`) carries the trigger and party,
    so the recap lands in the right place.
- **World context in every turn:** a prompt-context contributor (`api.registerPromptContext`, permission
  `prompt-context`) adds the live world lines to each generation in a Wanderworld scene (found by
  `chatMeta.scenePackageOrigin`): place, who's present and nearby, relationships, active zone lore. The
  same builder serves S3's conversation calls, so a chat in town and a scene see the same world.
- **Zone lore:** entries a zone names go in as `lorebookIds` when a scene starts there, and as text from
  the contributor while the player is in that zone.
- **Presets and agents (open):** an Engine scene chat deliberately doesn't copy a preset from where it
  started, and the scene-origin context has no preset or agent field. Using the player's chosen preset or
  agents for Wanderworld scenes needs either an Engine change (a preset and agents field on
  `SceneOriginContext` or `startScene`) or setting them on the new chat afterwards, if the Engine allows a
  package that. Ask the maintainer before building around it.
- Needs the `scenes` and `prompt-context` permissions and capability API 1.66.

### S5. Lives of their own (the AI decides what townsfolk do)

Today townsfolk follow simple rules (wander, sit, visit a building, go home at night) with cool-downs so
they don't bob up and down. That reads as busy, not as people with reasons. With the server part, the AI
plans their days from who they are:

- **A daily plan per character**, written once per in-game day by one structured call per character (or
  one batched call for the cast): a list of activities with times and places, each from a fixed menu the
  client can act out: `work` at a building, `visit` a place or person, `sit` somewhere, `eat` at the
  tavern, `walk` to a place, `talk` with another character, `stay home`. The inputs are the character
  card (personality, occupation, scenario), their home and workplace from the world brief (S2), the
  time of day, and recent world events (S4) and conversations (S3).
- **Grounded in the world:** the plan names real places by id (the bakery, the north bench, Mira's
  house), so the client only walks people to places that exist. Unknown places or activities fall back
  to the rules, never fail.
- **Characters together:** two characters whose plans meet (lunch at the tavern) walk there and sit
  together, with an occasional in-world beat (S4's speech bubbles) written for them.
- **Reacting:** a conversation can change someone's plan ("meet me at the fountain at noon"), and the
  server rewrites the rest of their day.
- **Cost:** plans are made ahead (the next few hours) and cached in the world document, so walking around
  never waits on a call; with no connection or a failed call, the rules carry on.
- **Client side now:** the rules already run on plans (lists of steps like walk, sit, enter, wait), and
  townsfolk can enter buildings, sit, and find their way along the streets, so an AI plan becomes the
  same steps.

### Decisions for later

- Relationships for characters who aren't in the cast, and for the persona when the player switches
  personas: one store per world, or shared across worlds?
- How much of W1–W4 goes into each call (all present people, or only those in the scene and their
  relationships)?

- Connection: the Engine default, a Wanderworld setting, or per job (world writing vs conversation)?
- Token budget: how much lore, history and world detail per call, and what gives way first.
- Should scene chats show in the user's chat list (they do by default), or be tucked away?
- TTS: the character's Engine voice, auto-play or on tap.
- Content rating for scenes and conversations.

## Outstanding (as of 0.5.13, 2026-11-11)

What's built but unproven, half-built, or agreed and not started. Newest decisions first.

**A livelier town (0.5.11).** How it's built, for whoever takes it further:

- _Style._ `buildings.js styleFor(spec, random)` dresses a building beyond its spec (roof and plaster
  tint, which way the ridge runs, round or square windows, dormers, a porch, which chimney, how much ivy)
  from numbers seeded by where it stands, so the town's own random stream, and with it every building's
  place, kind and door number, is untouched. `houses.js` reads `spec.style`; the tints are per-instance
  colours on the kit's tile and plaster parts only (`kit.js` gives each part its texture's name). The
  world brief can choose a style from the same menus later.
- _The forge._ `forgeBay` splits a smithy's footprint into its room (walled, with the door at that end)
  and the forge (open, arches on the street side). What blocks the way is the room, the back wall, the
  hearth and the things standing about; its place on the map is still the whole footprint.
- _Spots._ `world.spots` (`placeSpot`): { x, z, angle, approach, act, role, door | kind, taken }. Work
  spots belong to a building's door (the forge, a farm's fields) or to a kind of building (a market stall
  to anyone who works at a shop); rest and browse spots are anyone's. `npcs.js` takes one (`takeSpot`),
  walks to its way in, then straight to it, is "busy" there, and leaves by the way in. A snapshot's
  `doing` is the act, and `pack.js` has the words for it and what's said aloud.
- _Clips._ `clips.js ACTS` maps an act to the clips it loops through; "ground" is the sitting clip with
  the legs folded by hand, "lie" the getting-up clip played backwards and held. `step` also takes `air`
  (the jump) and `gesture` (once). The hand-made motion has none of these.
- _Not done:_ the hearth doesn't glow at night or light the smith; nobody carries a tool (the hammer
  swing is a wood-chopper's, the watering has no can); a seller and a buyer don't talk to each other;
  hamlets and inns have no stalls; the player can't work a spot; Engine models with unusual proportions
  may sit a little into or above the ground; and none of it has been seen on a phone.

**Before the pull request**

- Everything the AI does has only run against a stand-in model in a test harness: conversations,
  moments, schedules, scene plans, pictures and their rewritten prompts, the world setup, the written lore,
  the invented people (family from the cards, ages), the details call and the AI assistant (whether a real
  model keeps to the edit format, and keeps a long lore's detail when asked for a small change). A world made on a real Engine with a real model is the one check still owed.
- Then the feature-request issue and a draft pull request to `staging`, from a clean branch (one commit,
  the latest artifact only: `feat/wanderworld` carries every development build).

**Half-built: stored or shown, with little or no effect yet**

- Creatures (`ww: monster`, `ww: creature`, `ww: hostile`, with found in, night or day, pack, danger,
  drops) are kept with the world and listed in the Journal. Nothing wanders, attacks or drops anything.
- Closing hours (`ww: closed 22-6`) label the door card and are told to the AI. People still go in, and
  nobody's day changes for them.
- Seasons: winter lays snow. Spring, summer and fall are stored and look like the plain green land.
- A person's own voice is used when you talk to them directly. A moment with several listeners uses the
  Settings voice for all of them.
- The waypoint is on the Journal's map only: no marker in the world, nothing on the top bar.
- A region has one main settlement and hamlets. `ww: city` sets the main one's size and `ww: town3` adds
  two hamlets; several real towns or cities in one region isn't built.

**Other settings (modern, science fiction…): the direction, decided 2026-11-09**

Wanderworld is meant to grow past the fantasy village. What's done toward it: `src/pack.js` holds every
word of the setting (the things to use and their choices, what's said on arriving somewhere and about
who's near, the errands), and nothing outside it names a stall or a graveyard. Still fantasy-only, and
what another setting needs: the kit's models and textures (`kit/`, `world.js` building and prop
tables), the default bodies and outfits (`people.js`), the kinds of place and their words
(`zones.js` KIND_WORDS, `land.js` outposts), names for people and places, the set conversations
(`dialogue.js`), the noticeboard's standing notes, and the prompts' own wording ("a small town"). A
world would choose its pack when it's made; one pack is built in today.

**Agreed, not started**

- Guards: some people stand at the gates of a walled town or walk a round of its streets. It needs two
  new things to do in a day (stand guard at a place, patrol a round) in `npcs.js` and the schedules, a
  way to make someone a guard (Edit people, and a `ww: guard` keyword), and something for them to do
  about a hostile creature once those exist.

- People who come to you with something to say start a moment of their own (today they walk up and
  greet you).
- Things to use inside buildings (the anvil, the tavern's tables and bar): they wait on walk-in rooms.

- Creatures in the wilds: they keep to where the lore puts them, by night or day, in their packs; a
  hostile one starts a moment or a scene.
- A waypoint marker in the world (a beam, or an arrow on the bar).
- Closing hours that matter: people leave at closing, the door says no.
- A look for spring and fall (tree and grass tints).
- People made for a world: renaming one, and adding or removing one by hand (the AI assistant adds and
  removes them; the Journal can't yet).
- The AI assistant: checking a keyword draft against the world before showing it, Undo that survives
  leaving the world, and Engine characters who live in another region.
- A layout with real winding lanes (scattered houses have dirt ways in and no streets), and the three
  newer layouts among those "Surprise me" picks.
- An errand's marker that follows the person, instead of pointing at their house.

**Later (decided 2026-11-09: not now)**

- Quartermaster as the character sheet and inventory in the world. Today it works inside scenes
  started from Wanderworld (they are roleplay chats), not while walking about. Using it here, instead
  of building a sheet and inventory of our own, is its own piece of work and waits.

**Known limits (in the README too)**

- People a world made for itself can't be cast in Engine scenes: the Engine casts its own characters.
- The world setup reads the first 200 entries of the chosen lorebooks, 600 characters of each.
- Another region has only the people the assistant was asked for there; walk-in rooms are unfinished and
  off by default.
- The camera doesn't avoid trees, so foliage can fill the view.
- Quartermaster works in scenes started from Wanderworld, not in the world (see Later).
- The AI assistant's Undo lasts the session and takes back only what the assistant changed (something it
  added goes even if edited since; a scene it started isn't undone). A world's own lore entries hold 1,500 characters, 60 a world.
- An existing world on a crossroads, one-street or ring layout gains the pond, houses and gardens on its
  open ground when it's next opened (its other buildings keep their numbers), and loses the names of
  "streets" that ran across open ground, with any lore tied to them.

**Keywords: kept short on purpose**

A keyword says one short thing that sets a stat or a setting; nothing that is prose (descriptions,
looks, secrets): the AI reads the entry's own text for those. Considered and left out for now:
`ww: party`, `ww: start at …`, world weather, and a noticeboard keyword.

## Open questions

Answered (checked against Agents staging and Engine 2.5.2, 2026-11-07):

- ~~Name and package id.~~ **Wanderworld**, `wanderworld`.
- ~~Engine's 3D renderer or bundle three.js?~~ **Bundle.** The Engine runs three 0.186.1 for 3D Avatars,
  but its host (`MARINARA_HOST_MODULE_SPECIFIERS`) only hands packages React, zustand, zod and similar,
  and 3D Avatars ships no code of its own. Wanderworld pins three 0.186.1 and esbuild 0.28.2 in the root
  `package.json` and adds `three` to `BUNDLED_CLIENT_LIBRARIES` in `scripts/client-host-gates.mjs`. A
  second copy beside the Engine's only logs three's "multiple instances" console warning.
- ~~Package size limits.~~ No general catalog limit. The Engine installer accepts up to 100 MB zipped,
  250 MB unpacked, 8,192 files and a 1 MB manifest.
- ~~Game Mode or Home tab?~~ **Home tab** (see "Why a Home game"). Client-only for M0: capability API
  1.9 and `engine.min` 2.4.4 (Modern Life Sim's Home tab floor), built against 2.5.2; permission `ui`.
- ~~Store data.~~ A dev catalog build leaves out a package with no store entry, banner and icon:
  section `adventure`, the Home tab icon `wanderworld-icon.webp`, and a placeholder banner.

- ~~The player's body?~~ **The persona's own 3D Avatars model.** The Engine stores one per character or
  persona under `avatar-models/<ownerType>/<ownerId>/`. `GET /api/avatar-models/persona/:id` returns its
  config (`activeKind`, `kinds.vrm.file`, `kinds["glb-fbx"]`) or `null`, and
  `GET /api/avatar-models/persona/:id/files/:kind/:name` serves the file. Personas come from
  `GET /api/characters/personas/list`. VRM and GLB load; MMD, FBX and the Engine's own `.mavatar` mesh
  avatars fall back to the low-poly figure for now.
- ~~The other 3D formats?~~ **All four walk** (0.4.0). GLB and FBX follow the Engine's
  `glb-fbx-renderer.ts`: the bones 3D Avatars matched (`kinds["glb-fbx"].bones`) become a three-vrm
  `VRMHumanoid` after straightening the arms into a T-pose. MMD can't use the Engine's
  `@takahirox/three-mmd`: its materials are TSL node materials that import `three/webgpu` (megabytes,
  and a second renderer). Wanderworld reads the PMX with `mmd-parser` and builds a toon-shaded skinned
  mesh itself, mapping the standard Japanese bone names (センター, 上半身, 左腕, 左ひじ, 左足, 左ひざ …)
  to a humanoid. MMD textures come from `kinds.mmd.texturePaths`; sphere maps and toon ramps are skipped.
  `.mavatar` mesh avatars are 2D, so they stay on the figure.
- ~~How people without a model look?~~ **A built-in person, made in code from simple shapes** (0.4.3):
  face, hairstyle, build, height and clothes chosen from the name, on a humanoid skeleton so it moves like
  any 3D model. No outside art, because the repository has no written rule for third-party art, and
  package assets may only be images, JSON and audio (a model would have to ride inside a JSON file).

Still open:

- **Scenes instead of rooms, for now (0.4.13):** the kit rooms mixed detailed and blocky furniture and
  misplaced props, so a door now shows a card naming everyone inside (`crowd.inside(door)`). With the
  server part, Start scene opens a role-play scene in the chat with those characters (and image
  generation for the place). Walk-in rooms stay behind Settings → Walk into buildings for a later pass.
- **Detailed nature is everywhere (0.4.13):** every tree and rock is a kit model, drawn only within the draw
  distance of the player and up to the density; about 4 million triangles in view at Far. Lower-detail
  trees or impostors before phones.

- **Quaternius buildings are in, for testing (0.4.12):** the Medieval Village MegaKit's modular pieces (CC0) in
  `kit/village/` (1.9 MB), assembled per building by `houses.js` from the same spec the parts kit uses.
  This answers the world-from-lore question for buildings: the LLM picks specs from fixed menus (kind,
  size, floors, walls, features), and the assembler builds them; no free-form geometry. Shop signs and
  awnings aren't in the kit yet, so shops read as houses from outside.
- **Quaternius props are in, for testing (0.4.11):** 46 props from the Fantasy Props and Medieval Village kits
  (CC0) in `kit/props/` (2.1 MB). Town and rooms keep their simple furniture as the stand-in and record
  where each kit prop goes, so the layout and collisions are the same either way.
- **Quaternius nature is in, for testing (0.4.10):** the Stylized Nature MegaKit (CC0) in `kit/nature/` (1.8 MB):
  detailed trees and rocks (everywhere since 0.4.13), undergrowth round the edge. Heavy: about 2 million more
  triangles in view. Before phones: fewer and simpler trees (lower-detail versions or impostors), and
  less undergrowth.
- **Quaternius people are in, for testing (0.4.8):** Universal Base Characters and Modular Character
  Outfits - Fantasy (both CC0) as package assets in `kit/people/` (3.3 MB, loaded per person). Costly: a
  dressed person is about 25–30k triangles and 7–10 draw calls, so with many on screen this needs merging
  and simpler versions before phones (Settings → People without a model → Simple meanwhile).
- **Recorded animations are in, for testing (0.4.7):** Quaternius's Universal Animation Library (CC0,
  per the licence file in the download), converted to `src/clips/ual.json`. Before a PR, confirm with
  the maintainer that CC0 animation data is welcome in a package; `src/clips/CREDITS.md` says how to
  take it out again.
- May a package ship outside CC0 art, such as 3D people? Candidates if the maintainer agrees: Quaternius
  "Universal Base Characters" (six humanoid bodies, twenty hairstyles, glTF, CC0 per the pack page) or
  VRoid Studio's CC0 sample avatars (VRM 0.x, larger files).

- Which permission, if any, should disclose reading the persona list and avatar models. None of the
  Engine's permission names describes it; the manifest declares only `ui` and the builder says why.
- The camera still frames tight gaps between houses awkwardly; fading or hiding a wall in the way would
  read better than moving closer.
- **M2:** how a Home game's server part reads characters, persona and lorebooks and calls the model.
  Study Otome Hearth and Modern Life Sim before designing it.
- Asset source: CC0 low-poly kits (Kenney, Quaternius) bundled, or fully procedural meshes?
- Whether to share a world-brief format with Pixelforge (ask kolacheee).
- Real banner art before the package is proposed.
