# Wanderworld

A walkable, low-poly 3D world on its own Home tab in Marinara Engine. The goal is a world built from your
characters, persona and lorebooks, with buildings you can walk into. This is an early prototype and is
not listed in the catalog yet. The plan and milestones are in [docs/CONCEPT.md](docs/CONCEPT.md).

## What it does now (0.3.0)

- Draws a seeded town around a plaza and fountain, with streets, lamp posts and houses of different sizes,
  colours and roofs, surrounded by forest. **New world** walks a different one.
- **Play as** picks one of your personas. A persona with a VRM model set up in 3D Avatars walks in that
  model with a walking animation; a GLB model is shown as it is. Any other persona gets a simple
  low-poly figure, coloured from its name. The choice is remembered.
- Walk with WASD or the arrow keys, or the on-screen stick on touch screens. Shift runs; Q and E turn the
  camera. Buildings, trees and lamp posts block your way, and the camera moves in when a building would
  hide you.
- Shows frames per second, draw calls and triangles. Tap the readout to draw 1×, 4× or 10× the trees and
  rocks, to check how a device copes.
- **Fullscreen** fills the screen, on Engines whose Home tabs offer it.

It reads your persona list and the chosen persona's 3D Avatars model, and saves nothing yet.

## Using it

Install it, then open the **Wanderworld** tab on Home. To walk in your persona's own model, set one up
for that persona in 3D Avatars first.

## How it works

- `src/main.js` mounts as the package's Home tab (`home-browser-tab` slot, `view="browser"`). The canvas,
  HUD and touch stick all live in that one element, and the WebGL renderer is reused when the tab reopens.
- `src/world.js` builds the scene. Every building, road and the fountain are merged into one
  vertex-coloured mesh, and trees, rocks and lamp posts are instanced, so the whole world is under ten
  draw calls. Collision is the player against trunk circles and building boxes in a 2D grid, not a
  physics engine.
- `src/character.js` reads `GET /api/characters/personas/list` and the persona's
  `GET /api/avatar-models/persona/:id`, and loads its model file from the Engine with three.js's GLTF
  loader and `@pixiv/three-vrm`. VRM models walk by turning their humanoid bones.
- three.js 0.186.1 and `@pixiv/three-vrm` 3.5.5 (the versions the Engine itself uses) are bundled into
  `client.js`, because the Engine does not hand its copies to packages.

Performance targets: about 30 fps on a mid-range phone and 60 on a desktop, under 150 draw calls and 200k
visible triangles. The pixel ratio is capped at 1.5, there are no real-time shadows, and fog hides the far
edge.

## Building

```bash
node scripts/build-wanderworld-package.mjs
```

Edit `src/` and rebuild; never edit `client.js`, `manifest.json` or the artifact by hand.
