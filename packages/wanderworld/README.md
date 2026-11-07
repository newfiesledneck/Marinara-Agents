# Wanderworld

A walkable, low-poly 3D world for Marinara Engine's Game Mode. The goal is a world built from the chat's
setting, persona, characters and lorebook, with places bound to World Maps locations. This is an early
prototype and is not listed in the catalog yet.

## What it does now (0.1.0)

- Draws a seeded low-poly landscape behind the narration. The same chat always gets the same layout.
- Walks a capsule with WASD or the arrow keys, or the on-screen stick on touch screens. Shift runs; Q and E
  turn the camera. Trees block your way.
- Shows the party's current World Maps location at the top of the screen, and reads it again after each
  turn. Without World Maps it says so and keeps working.
- Shows frames per second, draw calls and triangles. Tap the readout to draw 1×, 4× or 10× the trees and
  rocks, to check how a device copes.

It reads World Maps but never changes it, and it does not send chat turns.

## Using it

Install it, then choose Wanderworld as the Experience when you create a Game Mode chat.

## How it works

- `src/main.js` mounts in the Engine's `game-surface` slot. The Engine mounts the element twice: the canvas
  goes in the layer behind the narration, and the HUD and touch stick in the layer above it. Both share one
  WebGL renderer.
- `src/world.js` builds the scene: one ground mesh and instanced trees and rocks, so the whole world is a
  handful of draw calls. Collision is the capsule against tree trunks in a 2D grid, not a physics engine.
- `src/spatial.js` reads `GET /api/chats/:chatId/spatial-context`.
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
