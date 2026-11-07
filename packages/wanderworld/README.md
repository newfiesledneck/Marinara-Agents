# Wanderworld

A walkable, low-poly 3D world on its own Home tab in Marinara Engine. The goal is a world built from your
characters, persona and lorebooks, with buildings you can walk into. This is an early prototype and is
not listed in the catalog yet. The plan and milestones are in [docs/CONCEPT.md](docs/CONCEPT.md).

## What it does now (0.2.0)

- Draws a seeded low-poly landscape. **New world** walks a different one.
- Walks a capsule with WASD or the arrow keys, or the on-screen stick on touch screens. Shift runs; Q and E
  turn the camera. Trees block your way.
- Shows frames per second, draw calls and triangles. Tap the readout to draw 1×, 4× or 10× the trees and
  rocks, to check how a device copes.
- **Fullscreen** fills the screen, on Engines whose Home tabs offer it.

It reads and writes nothing outside its own tab, and saves nothing yet.

## Using it

Install it, then open the **Wanderworld** tab on Home.

## How it works

- `src/main.js` mounts as the package's Home tab (`home-browser-tab` slot, `view="browser"`). The canvas,
  HUD and touch stick all live in that one element, and the WebGL renderer is reused when the tab reopens.
- `src/world.js` builds the scene: one ground mesh and instanced trees and rocks, so the whole world is a
  handful of draw calls. Collision is the capsule against tree trunks in a 2D grid, not a physics engine.
- three.js 0.186.1 (the version the Engine itself uses) is bundled into `client.js`, because the Engine does
  not hand its copy to packages.

Performance targets: about 30 fps on a mid-range phone and 60 on a desktop, under 150 draw calls and 200k
visible triangles. The pixel ratio is capped at 1.5, there are no real-time shadows, and fog hides the far
edge.

## Building

```bash
node scripts/build-wanderworld-package.mjs
```

Edit `src/` and rebuild; never edit `client.js`, `manifest.json` or the artifact by hand.
