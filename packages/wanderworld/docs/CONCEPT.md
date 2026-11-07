# Wanderworld — concept and prototype plan

A walkable, low-poly 3D world for Marinara Engine, generated from the chat's persona, characters
and lorebook. A fantasy survival setting gets a fantasy world; a modern daily-life setting gets a
modern town. Buildings can be entered, and their interiors are generated the first time you go in.

Status: **M0 built, 2026-11-07.** Package id `wanderworld`, branch `feat/wanderworld`. No issue or PR
yet; those come once there is a working concept worth proposing. Held in `INCOMPLETE_PACKAGE_IDS`, so
no published catalog lists it.

M0 as built: three.js 0.186.1 bundled (556 KB `client.js`); 6 draw calls and 56k triangles at 1× props
(204k at 4×, 499k at 10×); 60 fps in a desktop browser test. Not yet measured on a phone or in a real
Engine. The store banner is a placeholder screenshot of the M0 world and needs real art before a PR.

---

## Prototype rules

1. **Change no other package and no Engine code.** The prototype is one new package. It reads and
   writes only through routes and host APIs that already exist.
2. **Smooth before pretty.** Low-poly, flat-shaded, small textures. A user with a whole city in
   their lore should still get a smooth frame rate on a mid-range phone.
3. **The model decides what exists; the code decides where it goes** (Pixelforge's rule). The model
   never runs a frame, a collision or a number at play time.
4. **Degrade quietly.** No World Maps, an older Engine, or a failed call means the world runs on its
   own saved state. Never a nag, never a retry loop.

---

## What the platform already gives us (checked against staging, 2026-11-07)

Pixelforge (`packages/pixelforge`, kolacheee) is a 2D walkable world doing most of what the
prototype needs. Read it before building anything; copy patterns rather than inventing them.

| Need | What exists | Where to look |
| --- | --- | --- |
| A surface tied to a chat | Game Mode **Experience**: manifest `contributions.slots: ["game-surface"]` + `gameSurface` block; chosen in the Engine's Game Mode wizard | `packages/pixelforge/manifest.json` |
| Setting, party and lore input | The Engine wizard's Setting, party and Lorebooks steps; selected entries in `gameSetupConfig.activeLorebookEntryIds` | Pixelforge README "World generation" |
| A model call to build the world | `POST /api/game/:chatId/experience-generation` (structured, bounded, host-run) | Pixelforge README; `src/18-brief.js`, `docs/brief-schema.md` |
| Read World Maps | `GET /api/chats/:chatId/spatial-context` → definition (with `revision`) + `currentLocationId` | `client.js` `getSpatial`, `src/50-spatial.js` |
| Add locations to World Maps | `POST /api/chats/:chatId/spatial-context/locations` (World Maps 1.4.0+), header `x-marinara-csrf: 1`; 404 = older World Maps, 409 = revision race | `client.js` `postSpatialLocations`, `src/55-maps-export.js` |
| Move to a location | `host.sendMessage(text, undefined, { destinationId, expectedDefinitionRevision, expectedCurrentLocationId, commandId })`; commit/reject arrive as host events addressed to the package (capability API 1.12) | `src/50-spatial.js` `travel()` |
| Location tree | `region → settlement → place → building → floor → room`; each has `description`, `lorebookEntryIds`, `placement {x,y 0–100}`, `links` (available/hidden/blocked) | `sources/engine/packages/shared/dist/schemas/spatial-context.schema.js` |
| Future 3D coordinates | World Maps' plan for recursive local XYZ spaces (planning only) | `packages/hierarchical-maps/XYZ-SPATIAL-LOCATIONS-PLAN.md` |
| Real-time rendering in a package | 8-Ball Pool (physics/animation); Pixelforge (own Canvas2D engine, WASD + on-screen D-pad) | `packages/eightball`, `packages/pixelforge` |

Pixelforge's lessons worth keeping:
- **Stable ids:** location ids derived from the world seed (`pf.<hash(seed)>.<zoneId>`), diffed
  against the definition before posting, and existing same-name children *adopted*, not duplicated.
- **Shared-world chats:** it skips posting locations to a chat linked to a shared world, since that
  would stage edits to a communal map.
- **A loading gate, not a background swap:** the world doesn't run until generation finishes; a
  failure is a retry screen, never a default world saved on the player's behalf.

---

## Zones: how the 3D world talks to World Maps

A **zone** is a volume in the 3D world bound to a World Maps location id.

- **Entering a zone** (crossing into the market square, stepping through the tavern door) sends a
  transition to that location through `host.sendMessage`, the way Pixelforge's `travel()` does. The
  Engine commits or rejects it; World Maps, the narrator and anything reading spatial context then
  agree on where the party is.
- **Location changed elsewhere** (the narrator or World Maps moved the party): teleport the player
  to the bound zone, or show a toast if there is none. Pixelforge calls this "narrated drift".
- **New places the world generated** are registered as World Maps locations, under the location
  the world is bound to, with stable ids.
- **No World Maps installed:** zones still work as the package's own areas; nothing is posted.

To decide during the spike:
- A transition rides a chat message, so **every zone entry is a narrated turn** (a model call).
  Fine for doors and districts, too much for every street corner. Zones should be coarse:
  settlement → district/place → building → room. Small areas inside a zone don't transition.
- Is there a way to set the location *without* a turn? Check the Engine's spatial routes. If not,
  accept narrated transitions only at meaningful thresholds.

---

## The world from persona, characters and lore

| Source | What it gives |
| --- | --- |
| Setting / genre (wizard) | The **kit**: fantasy, modern town, sci-fi colony, survival wilds |
| Lorebook entries | Landmarks, factions, named places, history, rules |
| Character cards | Who lives and works where, households, routines |
| Persona | Starting point, home, role |

One structured call writes a **world brief** (what exists). A deterministic **compiler** turns it
into terrain, streets, lots and buildings from the kit. Same seed + same brief = same world.

### Generate as you go

1. **Game start:** region terrain and the settlement layout (streets, districts, lots, building
   footprints and kinds).
2. **Approaching a building:** its exterior, from kit templates.
3. **Opening a door:** a short loading moment. One call writes what's inside (purpose, who's there,
   a few notable objects); the code lays out rooms and furniture from room templates.
4. **Saved once, then stable.** Only story-relevant buildings (homes and workplaces of cast,
   lore-named places) get written interiors. The rest are locked or generic.
5. **Hide the wait:** pre-generate the interior of a building the player is walking toward.

---

## Performance budget (the city case)

Targets for a mid-range phone, to be checked in the spike:
- **~30 fps** on a phone, 60 on desktop; cap `devicePixelRatio` at about 1.5.
- **Draw calls under ~150**, **visible triangles under ~200k**.

How:
- **Low-poly, flat or vertex-colored**, one small shared texture atlas per kit. No real-time
  shadows: baked vertex ambient occlusion and a simple sun gradient.
- **Instancing** for repeated props (trees, lamps, fences, windows) and **merged static geometry**
  per chunk.
- **Chunks + fog:** the settlement is split into chunks, streamed in and out by distance; fog hides
  the cut-off.
- **LOD:** far buildings become simple boxes or flat cards.
- **One interior loaded at a time.** Entering a building unloads (or hides) the exterior's detail.
- **Simple collision:** capsule against a 2D grid or footprints, not a physics engine.
- **Characters start simple:** capsules or camera-facing billboard cards. A parametric character
  builder (model reads Appearance → body, hair, colors, outfit parts) comes after the prototype.

Library: three.js 0.186.1 (the Engine's own version) bundled in the package; it is about 550 KB of
`client.js`. The Engine does not expose its renderer to packages (see Open questions).

---

## Prototype milestones

| # | Milestone | Done when |
| --- | --- | --- |
| M0 | **Spike** | A `game-surface` package mounts in a Game Mode chat, renders a three.js scene, walks a capsule with WASD and a touch stick, and reads spatial context. Measure fps on a phone. |
| M1 | **Walkable town, fixed kit** | A seeded, hand-tuned town (no model call) with zones bound to existing World Maps locations; entering a zone moves the party in World Maps. |
| M2 | **Town from lore** | The brief call builds the town from Setting + lorebook + cast; places are registered in World Maps with stable ids. |
| M3 | **Enterable interiors** | Doors load a generated interior (one call, saved); leaving restores the exterior. |
| M4 | **People** | Cast characters placed at their homes and workplaces, as billboards or simple figures. |

**Out of scope for the prototype:** changes to other packages, VRM or 3D avatars, survival or
daily-life rules, combat, building, and the parametric character builder.

---

## Open questions

Answered during M0 (checked against Agents staging and Engine 2.5.2, 2026-11-07):

- ~~Name and package id.~~ **Wanderworld**, `wanderworld`.
- ~~Engine's 3D renderer or bundle three.js?~~ **Bundle.** The Engine runs three 0.186.1 for 3D Avatars,
  but its host (`MARINARA_HOST_MODULE_SPECIFIERS`) only hands packages React, zustand, zod and similar,
  and 3D Avatars ships no code of its own. Wanderworld pins three 0.186.1 and esbuild 0.28.2 in the root
  `package.json` and adds `three` to `BUNDLED_CLIENT_LIBRARIES` in `scripts/client-host-gates.mjs`. A
  second copy beside the Engine's only logs three's "multiple instances" console warning.
- ~~Package size limits.~~ No general catalog limit. The Engine installer accepts up to 100 MB zipped,
  250 MB unpacked, 8,192 files and a 1 MB manifest.
- ~~Transition without a chat turn?~~ **Not as travel.** `POST …/spatial-context/turn` commits a move
  without generation but is Roleplay-only. `PUT …/spatial-context` with `replacementCurrentLocationId`
  (the map editor's save) moves the current location with no turn, but it resends the whole map, skips
  route rules and stages a draft on shared-world chats. Don't rely on it without asking thetopham. So
  zones stay coarse, and only meaningful thresholds send a narrated `host.sendMessage` transition.
- ~~Engine and capability API for game-surface?~~ The slot predates 1.10. Spatial events need 1.12
  (what Wanderworld declares); `prepareBeforeStart` is 1.17 and the setup seed 1.18. `engine.min` is
  2.4.5 (Pixelforge's floor, which uses every seam Wanderworld does); built against 2.5.2.
- ~~Store data.~~ A dev catalog build leaves out a package with no store entry, banner and icon, so
  Wanderworld has them from M0: section `adventure`, a line-style icon, and a placeholder banner.

Still open:

- **Blocker: the Engine no longer installs code-running Experiences from the catalog.** Since capability
  API 1.373 (Engine 2.5.x, 2026-10-22), `installCatalogPackage` refuses any catalog entry with a
  `game-surface` slot unless it is a data-only `.experience.json` file ("no entrypoints, permissions or
  code"). The only other install route, `POST /api/capability-packages/experience-file`, also takes only
  data-only Experiences. The Engine still *runs* an installed Experience that has a client entrypoint,
  but there is no way to install a new one. Pixelforge is in the same position. Found on the first
  real install attempt (Engine 2.5.2 @ `11489b4`): "Wanderworld is an Experience packaged as a zip."
  Needs a maintainer answer before M1.
- Asset source: CC0 low-poly kits (Kenney, Quaternius) bundled, or fully procedural meshes?
- Talk to thetopham (World Maps) about the XYZ plan, and to kolacheee about Pixelforge's status
  and whether the two should share a brief format.
- Per-instance culling: an InstancedMesh is culled as one unit, so M1's chunks should each own their
  own instanced meshes.
- Real banner art before the package is proposed.
