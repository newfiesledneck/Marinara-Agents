# Wanderworld — concept and prototype plan

A walkable, low-poly 3D world on its own Home tab in Marinara Engine, generated from your characters,
persona and lorebooks. A fantasy survival setting gets a fantasy world; a modern daily-life setting gets
a modern town. Buildings can be entered, and their interiors are generated the first time you go in.

Status: **M0 rebuilt as a Home screen game, 2026-11-07 (0.2.0).** Package id `wanderworld`, branch
`feat/wanderworld`. No issue or PR yet; those come once there is a working concept worth proposing. Held
in `INCOMPLETE_PACKAGE_IDS`, so no published catalog lists it; tested through a dev catalog.

M0 as built: three.js 0.186.1 bundled (556 KB `client.js`); 6 draw calls and 56k triangles at 1× props
(204k at 4×, 499k at 10×); 60–120 fps in a desktop browser test. Not yet measured on a phone or in a real
Engine. The store banner is a placeholder screenshot of the M0 world and needs real art before a PR.

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
| M1 | **Walkable town, fixed kit** | A seeded, hand-tuned town (no model call) in chunks, with named zones; entering one shows its name. Position and seed saved. |
| M2 | **Town from lore** | A setup screen picks persona, characters and lorebooks; the brief call builds the town; the world is saved by a server part. |
| M3 | **Enterable interiors** | Doors load a generated interior (one call, saved); leaving restores the exterior. |
| M4 | **People** | Cast characters placed at their homes and workplaces, as billboards or simple figures. |

**Out of scope for the prototype:** changes to other packages, Game Mode, VRM or 3D avatars, survival
or daily-life rules, combat, building, and the parametric character builder.

---

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

Still open:

- **M2:** how a Home game's server part reads characters, persona and lorebooks and calls the model.
  Study Otome Hearth and Modern Life Sim before designing it.
- Asset source: CC0 low-poly kits (Kenney, Quaternius) bundled, or fully procedural meshes?
- Whether to share a world-brief format with Pixelforge (ask kolacheee).
- Real banner art before the package is proposed.
