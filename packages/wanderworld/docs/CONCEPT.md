# Wanderworld — concept and prototype plan

A walkable, low-poly 3D world on its own Home tab in Marinara Engine, generated from your characters,
persona and lorebooks. A fantasy survival setting gets a fantasy world; a modern daily-life setting gets
a modern town. Buildings can be entered, and their interiors are generated the first time you go in.

Status: **0.4.20, 2026-11-08: a detailed, lively seeded town with named places, saved worlds and a Journal,
that you can walk round, sit down in and talk in (a preview, without the AI yet), with up to thirty of your
characters living their day in it, indoors and out.**
Package id `wanderworld`, branch `feat/wanderworld`. No issue or PR yet; those come once there is a
working concept worth proposing. Held in `INCOMPLETE_PACKAGE_IDS`, so no published catalog lists it;
tested through a dev catalog.

As built: a 5 × 5-block town (about 60 buildings) around a plaza, forest outside; the player and up to
thirty townsfolk walk in their own 3D Avatars model (VRM, GLB, FBX or MMD) or a built-in person.
1.01 MB `client.js` (three.js, GLTF/FBX/TGA loaders, three-vrm, mmd-parser). About 13 draw calls and
58k triangles with four townsfolk; 120 fps in a desktop browser test. Not yet measured on a phone or in a
real Engine. The store banner is a placeholder screenshot and needs real art before a PR.

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

| Need | What exists | Where to look |
| --- | --- | --- |
| A tab of its own | `contributions.slots: ["home-browser-tab"]` + `homeBrowserTab { label, ariaLabel, iconPaths }`; needs a client entrypoint; the icon must be hash-pinned in `files` | Engine `HomeBrowserHub.tsx`, `capability-package.schema.ts` |
| Mounting | The package's element is mounted once with `view="browser"`; props include `browserFullscreen { active, setActive, enterLabel, exitLabel }` (1.376) and `onClose` | `HomeBrowserHub.tsx` |
| Saves, model calls, characters, lorebooks | A server part (`server.mjs`) with package routes and storage, as every other Home game has | `packages/otome-forge`, `packages/saucelings`, `packages/gacha-forge`, `packages/modern-life-sim` |
| Store logo | Apps use their Home tab icon as the store logo (`scripts/build-store.mjs`); no `store/icons/src/<id>.svg` | `CONTRIBUTING.md` "Store data" |

Pixelforge (`packages/pixelforge`) is still the best reference for the world itself: seeded world
compilation, the brief schema, stable ids, and "a loading gate, not a background swap" (the world doesn't
run until generation finishes; a failure is a retry screen, never a default world saved for the player).

---

## The world from persona, characters and lore

The player picks the sources in Wanderworld's own setup screen, the way Otome Hearth builds its cast
from your character cards.

| Source | What it gives |
| --- | --- |
| Setting / genre (setup screen) | The **kit**: fantasy, modern town, sci-fi colony, survival wilds |
| Lorebook entries | Landmarks, factions, named places, history, rules |
| Character cards | Who lives and works where, households, routines |
| Persona | Starting point, home, role |

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

| # | Milestone | Done when |
| --- | --- | --- |
| M0 | **Spike** ✅ | A Home tab renders a three.js scene and walks a capsule with WASD and a touch stick, with an fps readout. Measure fps on a phone. |
| M0.5 | **Persona and town** ✅ | The player is the chosen persona's 3D Avatars model (VRM walks, GLB shows) or a low-poly figure; a seeded town of houses, streets and a plaza; buildings block movement and the camera. |
| M0.6 | **Parts kit** ✅ | Buildings from a spec chosen from fixed menus (kind, size, floors, roof, walls, colours, features) assembled from parts; plaza landmarks, shops, homes, smithy, gardens, stalls, benches and street clutter, still one merged mesh. |
| M1 | **Walkable town, fixed kit** | The town in chunks, with named zones; entering one shows its name. Position, seed and persona saved. *Zones, where people are, who's near whom, the party and relationships are planned as W1–W4 (client, no restart).* |
| M2 | **Town from lore** | A setup screen picks persona, characters and lorebooks; the brief call builds the town; the world is saved by a server part. |
| M2.5 | **Things to do** ✅ | Use system (E, click, tap; walk to what you clicked), benches and chairs, doors that open, a furnished room inside every building from templates by kind, the conversation screen with placeholder replies, townsfolk routines, day and night, sound, settings. |
| M3 | **Enterable interiors** | Doors load a generated interior (one call, saved); leaving restores the exterior. *0.4.4 has template rooms by building kind; 0.4.13 puts them behind a setting. For now a door shows who's inside: going in will start a role-play scene with them in the chat, with generated pictures, once the server part exists (see below).* |
| M4 | **People** | Cast characters placed at their homes and workplaces, as billboards or simple figures. *0.4.0 has the picker, their own models, homes near the plaza and wandering; homes and workplaces from the brief come with M2.* |

**Out of scope for the prototype:** changes to other packages, Game Mode, VRM or 3D avatars, survival
or daily-life rules, combat, building, and the parametric character builder.

---

## Controls

One scheme for every screen, kept small so it stays learnable. E is "use" (sit, open, go in, talk) and
never moves the camera; Esc stands up or leaves a conversation.

| | Computer | Touch screen |
| --- | --- | --- |
| Walk | WASD (camera-relative) | The stick, bottom left; a small push strolls |
| Run | Hold Shift | Push the stick all the way out |
| Look around | Drag with the left or middle mouse button, or the arrow keys | Drag anywhere off the stick |
| Zoom | Mouse wheel, or + / − | Pinch |
| Use | E, or click it (further away: you walk there first) | The Use button, or tap it |
| Walk to a spot | Click the ground | Tap the ground |
| Stand up, stop talking | Esc, or move | Move, or the Leave button |

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

*In 0.4.14: zones, the place line and names on entering, `describe`, renaming and zone lore in the
Journal, shop signs, all saved per world (`saves.js`). Still to do: a zone editor beyond renaming, and
signs that carry a picture by default.*

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

### W2. Who is near whom

- `nearby(person)`: everyone within talking distance or in the same room or zone, nearest first, with
  what they're doing ("Sarah is near Jake, by the stalls"). Updated a few times a second, and cheap with
  thirty people.
- It feeds behaviour now (greeting, avoiding, joining) and context later ("who can hear this").

### W3. Party and following

*In 0.4.15: asking along from a conversation, following in rows of two, running to catch up, waypoint
routing, sitting near a seated player, catching up when lost, wait here, part ways, saved per world, and
named on a door's card. Not yet: following into walk-in rooms (followers wait outside), and the party
going into a scene together (W5).*

- Invite someone from a conversation or the Use menu; they follow at a short distance in a loose line,
  walk when you walk, run when you run, find their way round buildings with the street waypoints, sit
  near you, and come through doors with you. Dismiss them, or tell them to wait here.
- A party panel lists who's with you. The party is part of the world state, so a scene knows who came in
  with you.

### W4. Relationships (built to grow)

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

*In 0.4.16 (`land.js`): a world's `landscape` (hills, mountain sides, a river, outposts: inn, cottage,
cave) builds hills, ranges, the river with its banks and bridges, and dirt roads out to each outpost.
The seed fills it in, New world can choose each part, and the save keeps it.*

- **The AI chooses the land:** the world brief (S2) writes the landscape like any other part of the
  world: whether there are mountains, a river, a lone tavern on a forest road, a cave in a hillside, and
  names for them. Every part is optional and checked, so worlds differ and a partial answer still works.
- **More outposts:** a mill, a farmstead, ruins, a shrine, a watchtower, a campsite; more cave kinds (a
  mine, a grotto by water); lakes and ponds; a coast.
- **Town shapes, not only the square grid:** a single row of houses along a winding road through the
  map, a crossroads village, a scattered hamlet, a town on both banks of the river with bridges in it, a
  walled town with gates. The layout is a set of plots along roads, so zones, signs, waypoints and the
  townsfolk keep working whatever the shape. The brief picks the shape and the plots' kinds.
- **A world builder:** an editor mode with an item menu (buildings by kind, props, trees, rocks, roads,
  water, outposts) to place, move, turn and remove things, either from an empty map or on top of a
  generated world, then save it as a world to play. Because a world is a list of parts (landscape,
  plots, placed things), the editor and the AI write the same thing, and a built world can still be
  filled with people and lore by the AI.

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

| Need | Host API | Seen in |
| --- | --- | --- |
| HTTP routes for the client | `api.registerPrivilegedRoutes((routes) => routes.get/post(...))`, served at `/api/wanderworld/...`; permission `routes` | Quartermaster `server.mjs`, Otome Hearth |
| Saves | `api.runtime.persistence.documents`; permission `storage` | Quartermaster, Otome Hearth `store.ts` |
| Personas, characters, lorebooks | `api.runtime.resources.listPersonas / listCharacters / listLorebooks / listEligibleLorebookEntries` | Otome Hearth `setup/cast.ts` |
| Model calls | `api.runtime.languageModels.resolveForRequest({ connectionId })` → `chatComplete(messages, { temperature, maxTokens })`; `api.runtime.json.parseJsonish` for forgiving JSON | Quartermaster wardrobe, Otome Hearth `generation.ts` |
| Debug logging | `api.runtime.logger.debugOverride(debugMode, ...)` when Debug Agents is on | Quartermaster |
| Full Engine scenes | Client prop `startScene({ originId, prompt, plan, data, initiatorCharacterId })` → `{ chatId }`, plus `openChat` and `focusSceneOriginId`; server `api.registerSceneOrigin({ getContext, claim, release })`. `getContext` returns `{ characterIds, personaId, connectionId, transcript, notes, lorebookIds }`; `release` gets `{ kind: "concluded", summary, characterIds, ... }`. Permission `scenes`, capability API 1.66. The Engine casts Engine characters only | Slurp 2 `server.mjs` and `docs/SCENES.md`; Engine `shared/src/types/scene.ts` |
| Context in any chat turn | `api.registerPromptContext((request) => text)`, called once per generation with `{ chatId, chatMeta, mode, targetCharacterIds, personaId, wrapFormat }`; returns text to append. Permission `prompt-context`. A scene started from Wanderworld carries `chatMeta.scenePackageOrigin`, so the contributor knows which world and place it belongs to | Slurp 2; Engine `capability-prompt-context.service.ts` |
| Voices | Client `__MARINARA_HOST__.services.tts` (the Engine's `lib/tts-service`: `ttsService`, `playWhenAvailable`). Never open the TTS audio cache directly; `validate-catalog.mjs` refuses that | Engine `marinara-host-contract.ts` |

How the Engine's own modes talk: Conversation, Roleplay and Game assemble their prompts inside the Engine
and don't expose them to packages. Packages that hold their own conversations (Otome Hearth's messages and
dates, Quartermaster's wardrobe) do it themselves: resolve the connection, build messages from the
character and persona records, fit the context, call `chatComplete`, and keep their own history.
Wanderworld follows that, and hands off to a real Engine scene (S4) when a moment deserves the full chat
treatment (image generation, backgrounds, agents, memory).

### S1. Foundation

- `server.mjs` with `activate`, built and hashed by `scripts/build-wanderworld-package.mjs` (syntax-checked
  like Quartermaster's), and `restartRequired: true`.
- A world document per world: seed, brief, cast, player state (position, persona), conversation logs and
  world events. The client's localStorage choices move here.
- Routes: list, read, create and delete worlds; save player state (throttled).

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

*The client side is in 0.4.4: starting a conversation, the facing lock, the two-shot camera, the chat panel
and speech bubbles, and talking gestures. Replies are placeholder lines; this step swaps them for the model
call below.*

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
