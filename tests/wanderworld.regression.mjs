// Wanderworld logic that runs without a browser: trunk collision, and a seeded world that builds at
// every density.
// Run: node tests/wanderworld.regression.mjs
import assert from "node:assert/strict";
import { createCollider, createWorld, DENSITIES } from "../packages/wanderworld/src/world.js";

// ── Collision ────────────────────────────────────────────────────────────────
const collider = createCollider([
  { x: 0, z: 0, r: 0.3 },
  { x: 10, z: 10, r: 0.3 },
  { x: -3.9, z: 4.1, r: 0.3 }, // across a grid-cell boundary from the probe below
]);
const inside = { x: 0.1, z: 0 };
collider.resolve(inside, 0.35);
assert.ok(
  Math.abs(Math.hypot(inside.x, inside.z) - 0.65) < 1e-9,
  "an overlapping capsule is pushed to the trunk's edge",
);
assert.ok(inside.z === 0 && inside.x > 0, "and pushed straight away from the trunk's centre");

const clear = { x: 5, z: 5 };
collider.resolve(clear, 0.35);
assert.deepEqual(clear, { x: 5, z: 5 }, "a capsule touching nothing does not move");

const neighbour = { x: -4.1, z: 4.1 };
collider.resolve(neighbour, 0.35);
assert.ok(Math.hypot(neighbour.x + 3.9, neighbour.z - 4.1) >= 0.65 - 1e-9, "trunks in the next grid cell still block");

// ── World ────────────────────────────────────────────────────────────────────
const world = createWorld(12345);
for (const density of DENSITIES) world.setDensity(density);
const meshes = [];
world.scene.traverse((object) => object.isInstancedMesh && meshes.push(object));
assert.equal(meshes.length, 3, "trunks, crowns and rocks are one instanced mesh each");
world.setDensity(DENSITIES[0]);
const [trunks, crowns, rocks] = meshes;
assert.equal(trunks.count, crowns.count, "every trunk has a crown");
assert.ok(rocks.count > 0 && trunks.count > rocks.count);
world.dispose();

console.log("wanderworld regression: OK");
