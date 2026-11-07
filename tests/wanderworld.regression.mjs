// Wanderworld M0 logic that runs without a browser: reading the location name out of World Maps replies,
// trunk collision, and a seeded world that builds at every density.
// Run: node tests/wanderworld.regression.mjs
import assert from "node:assert/strict";
import { createCollider, createWorld, DENSITIES } from "../packages/wanderworld/src/world.js";
import { locationName } from "../packages/wanderworld/src/spatial.js";

// ── locationName ─────────────────────────────────────────────────────────────
const definition = {
  revision: 2,
  locations: [
    { id: "town", name: "Oakvale" },
    { id: "inn", name: "The Rusty Anchor" },
  ],
};
assert.equal(
  locationName({ definition, currentLocationId: "inn", breadcrumb: [{ name: "Oakvale" }, { name: "Market" }] }),
  "Market",
  "the breadcrumb's last entry names where the party is",
);
assert.equal(
  locationName({ definition, currentLocationId: "inn" }),
  "The Rusty Anchor",
  "without a breadcrumb the current location is looked up in the definition",
);
assert.equal(locationName(null), null, "World Maps not installed");
assert.equal(locationName({ definition: null, currentLocationId: null }), null, "World Maps off for this chat");
assert.equal(locationName({ definition, currentLocationId: null }), null, "no current location yet");
assert.equal(locationName({ definition, currentLocationId: "gone" }), null, "an unknown id names nothing");

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
