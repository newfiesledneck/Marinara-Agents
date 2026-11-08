// Wanderworld places and saves: zones name every spot in a world and say where someone is in words;
// saved worlds come back as they were, and damaged or old saves fall back to defaults.
import assert from "node:assert/strict";
import { createSaves, checkWorld } from "../packages/wanderworld/src/saves.js";
import { createWorld, SPAWN } from "../packages/wanderworld/src/world.js";
import { buildZones, describe, nameOf, signOf, zoneAt } from "../packages/wanderworld/src/zones.js";

// ── Zones ──
const world = createWorld(777);
const zones = buildZones(world.layout, 777);
const again = buildZones(createWorld(777).layout, 777);
assert.deepEqual(
  zones.zones.map((zone) => [zone.id, zone.name]),
  again.zones.map((zone) => [zone.id, zone.name]),
  "the same seed names the same places with the same ids",
);
assert.equal(new Set(zones.zones.map((zone) => zone.id)).size, zones.zones.length, "zone ids are unique");
assert.equal(
  zones.zones.filter((zone) => zone.kind === "building").length,
  world.doors.length,
  "every building (and its door) is a place",
);

assert.equal(zoneAt(zones, 0, 1).id, "fountain", "next to the fountain is by the fountain");
assert.equal(zoneAt(zones, SPAWN.x + 6, SPAWN.z).id, "plaza", "the rest of the square is the market square");
assert.equal(zoneAt(zones, 150, 150).id, "forest", "far out is the woods");
assert.equal(zoneAt(zones, world.layout.townHalf + 10, 0).id, "outskirts", "just outside town is its edge");
const door = world.doors[0];
assert.equal(zoneAt(zones, door.x, door.z).kind, "street", "outside a front door is the street");
const street = zoneAt(zones, door.x, door.z);
const streetNames = zones.zones.filter((zone) => zone.kind === "street").map((zone) => zone.name);
assert.equal(new Set(streetNames).size, streetNames.length, "every street has its own name");

const fountain = zones.byId.get("fountain");
assert.equal(
  describe(zones, { name: "Jake", state: "sit", seat: true, zone: fountain }),
  "Jake is sitting on a bench by the fountain in the market square",
);
assert.equal(describe(zones, { name: "Sarah", state: "walk", zone: street }), `Sarah is walking on ${street.name}`);
const tavern = zones.zones.find((zone) => zone.buildingKind === "tavern");
assert.equal(describe(zones, { name: "Mira", state: "inside", zone: tavern }), "Mira is in the tavern");
assert.equal(
  describe(zones, { name: "Mira", state: "inside", zone: tavern }, { [tavern.id]: "The Rusty Tankard" }),
  "Mira is in The Rusty Tankard",
  "a renamed place is used in what's said",
);
assert.equal(signOf(tavern), "Tavern", "the tavern's sign says Tavern until it's renamed");
assert.equal(signOf(tavern, { [tavern.id]: "the Rusty Tankard" }), "Rusty Tankard", "a sign drops a leading 'the'");
assert.equal(nameOf(tavern, { [tavern.id]: "   " }), "the tavern", "a blank rename keeps the default");
const home = zones.zones.find((zone) => zone.buildingKind === "home");
assert.equal(signOf(home), null, "houses have no sign");

// ── Saves ──
const memory = new Map();
const storage = {
  getItem: (key) => (memory.has(key) ? memory.get(key) : null),
  setItem: (key, value) => memory.set(key, String(value)),
  removeItem: (key) => memory.delete(key),
};
const saves = createSaves(storage);
assert.equal(saves.migrate(), null, "nothing to bring over without an old world");
const first = saves.create({ name: "Hollow", seed: "seed-a" });
assert.equal(first.seed, "seed-a");
const second = saves.create({ name: "Brook" });
assert.ok(second.seed.startsWith("world-"), "a world without a seed gets a random one");
saves.write({ ...first, playedAt: Date.now() + 1000, names: { "building:3": "The Rusty Tankard", bad: 5 } }, "data:x");
assert.deepEqual(
  saves.list().map((entry) => entry.name),
  ["Hollow", "Brook"],
  "the list is last played first",
);
assert.equal(saves.list()[0].thumbnail, "data:x", "a thumbnail goes with the list entry");
assert.deepEqual(saves.read(first.id).names, { "building:3": "The Rusty Tankard" }, "names keep only strings");
saves.rename(second.id, "Brookside");
assert.equal(saves.read(second.id).name, "Brookside");
saves.setLast(first.id);
assert.equal(saves.last().id, first.id);
saves.remove(first.id);
assert.equal(saves.read(first.id), null, "a deleted world is gone");
assert.equal(saves.last(), null, "and it's no longer the last played");
assert.equal(saves.list().length, 1);

storage.setItem(`wanderworld.world.${second.id}`, "{not json");
assert.equal(saves.read(second.id), null, "a damaged save reads as missing, not as an error");
const checked = checkWorld({ id: "w", seed: "s", hour: 30, place: { x: 1 }, cast: ["a", 4], lore: { z: [{}] } });
assert.equal(checked.hour, 6, "the hour wraps into the day");
assert.equal(checked.place, null, "an incomplete place is dropped");
assert.deepEqual(checked.cast, ["a"], "only character ids stay in the cast");
assert.deepEqual(checked.lore, {}, "lore without its ids is dropped");

// The one world from before saves becomes the first saved world, once.
const old = new Map([
  [
    "wanderworld.place",
    JSON.stringify({ seed: "legacy", x: 3, z: 4, angle: 0, yaw: 0, pitch: 0.3, zoom: 8, hour: 14 }),
  ],
  ["wanderworld.cast", JSON.stringify(["c1"])],
  ["wanderworld.persona", "p1"],
]);
const oldStorage = {
  getItem: (key) => (old.has(key) ? old.get(key) : null),
  setItem: (key, value) => old.set(key, String(value)),
  removeItem: (key) => old.delete(key),
};
const legacy = createSaves(oldStorage).migrate();
assert.equal(legacy.seed, "legacy");
assert.deepEqual([legacy.cast, legacy.persona, legacy.hour], [["c1"], "p1", 14]);
assert.equal(createSaves(oldStorage).last().id, legacy.id, "it's the one to continue");
assert.equal(old.has("wanderworld.place"), false, "the old keys are cleared");
assert.equal(createSaves(oldStorage).migrate(), null, "and it only happens once");

console.log("wanderworld places regression: OK");
