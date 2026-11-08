# Wanderworld

A walkable, low-poly 3D world on its own Home tab in Marinara Engine. The goal is a world built from your
characters, persona and lorebooks, with buildings you can walk into. This is an early prototype and is
not listed in the catalog yet. The plan and milestones are in [docs/CONCEPT.md](docs/CONCEPT.md).

## What it does now (0.4.2)

- Draws a seeded town around a plaza and fountain, surrounded by forest. A town hall, a temple, a tavern and
  shops ring the plaza, with market stalls and benches; homes, a smithy and fenced gardens fill the streets
  beyond. Buildings come from a kit of parts (walls, roofs, chimneys, porches, balconies, shutters, signs,
  awnings). **New world** walks a different one.
- **Play as** picks one of your personas. A persona with a 3D model set up in 3D Avatars walks in that
  model (VRM, GLB, FBX or MMD) with a walking animation; any other persona gets a simple low-poly figure,
  coloured from its name. The choice is remembered.
- **People** picks up to twelve characters to live in town. Each lives in a house near the plaza, wanders
  nearby in its own 3D model or a figure, stops to face you when you walk up, and has its name overhead.
- **Controls.** Computer: WASD walks, Shift runs, drag (left or middle mouse button) or the arrow keys look
  around, and the wheel or + / − zoom. Touch screen: the stick walks (all the way out runs), dragging
  anywhere else looks around, and pinching zooms. The camera orbits and tilts, from looking up at towers
  to nearly overhead. Buildings, trees and lamp posts block your way, and the camera moves in when a
  building would hide you. E is kept for using things.
- Shows frames per second, draw calls and triangles. Tap the readout to draw 1×, 4× or 10× the trees and
  rocks, to check how a device copes.
- **Fullscreen** fills the screen, on Engines whose Home tabs offer it.

It reads your persona and character lists and their 3D Avatars models, and saves nothing yet.

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
- `src/character.js` holds the walk and the low-poly figure, and reads `GET /api/characters/personas/list`
  and `GET /api/characters`.
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
