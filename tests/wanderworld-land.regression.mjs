// Wanderworld's land: a world's landscape (hills, mountains, a river, places out in the country) is
// checked and always makes a world; the town stays level; mountains rise at their edge; the river can't
// be walked through except on a bridge where a road crosses it; inns and cottages get doors, caves a
// mouth, and every one of them a name.
import assert from "node:assert/strict";
import { checkLandscape, landscapeFor, landscapeWith } from "../packages/wanderworld/src/land.js";
import { createWorld, heightAt } from "../packages/wanderworld/src/world.js";
import { buildZones, zoneAt } from "../packages/wanderworld/src/zones.js";

// ── Checking ──
const seeded = landscapeFor(31);
assert.deepEqual(checkLandscape(null, 31), seeded, "no landscape: the seed's own");
assert.deepEqual(checkLandscape("nonsense", 31), seeded);
const partial = checkLandscape({ hills: "rugged", mountains: ["north", "up", "north"], river: null }, 31);
assert.equal(partial.hills, "rugged");
assert.deepEqual(partial.mountains, ["north"], "unknown and repeated sides are dropped");
assert.equal(partial.river, null, "null means no river");
assert.deepEqual(partial.outposts, seeded.outposts, "what's left out comes from the seed");
assert.deepEqual(
  checkLandscape(
    {
      outposts: [
        { kind: "castle", side: "east" },
        { kind: "inn", side: "east", name: " The Fox " },
      ],
    },
    31,
  ).outposts,
  [{ kind: "inn", side: "east", name: "The Fox" }],
  "unknown outposts are dropped and names trimmed",
);
const chosen = landscapeWith(31, { hills: "flat", mountains: "three", river: "no", places: "several" });
assert.equal(chosen.hills, "flat");
assert.equal(chosen.mountains.length, 3);
assert.equal(chosen.river, null);
assert.equal(chosen.outposts.length, 4);
assert.deepEqual(landscapeWith(31, { hills: "surprise" }), seeded, "Surprise me keeps the seed's choices");

// ── A world built from one ──
const landscape = {
  hills: "rolling",
  mountains: ["north"],
  river: { side: "east" },
  outposts: [
    { kind: "inn", side: "east" },
    { kind: "cave", side: "north" },
  ],
};
const world = createWorld(31, landscape);
assert.deepEqual(world.landscape, landscape, "the world keeps the landscape it was built with");
for (const [x, z] of [
  [0, 0],
  [40, -40],
  [-55, 55],
]) {
  assert.ok(Math.abs(heightAt(x, z)) < 1e-9, "the town is level");
}
assert.ok(heightAt(0, -150) > 15, `mountains rise along their edge (${heightAt(0, -150).toFixed(1)} m)`);
assert.ok(heightAt(0, 150) < 6, "and not along the others");

const river = world.layout.river;
assert.ok(river, "the river is in the layout");
const middle = river.points[Math.floor(river.points.length / 2)];
assert.ok(heightAt(middle.x, middle.z) < -1, "the river runs in a bed below the land");
const wet = { x: middle.x, z: middle.z };
world.resolveCollisions(wet, 0.35);
assert.ok(Math.hypot(wet.x - middle.x, wet.z - middle.z) > 1, "nobody walks through the river");

/** Distance from (x, z) to the river's middle line. */
function toRiver(x, z) {
  let best = Infinity;
  for (let i = 1; i < river.points.length; i++) {
    const a = river.points[i - 1];
    const b = river.points[i];
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / (dx * dx + dz * dz)));
    best = Math.min(best, Math.hypot(x - a.x - dx * t, z - a.z - dz * t));
  }
  return best;
}
const innRoad = world.layout.roads.find((road) => world.layout.outposts[road.to].kind === "inn");
assert.ok(innRoad, "a road leads out to the inn");
// Somewhere along that road it crosses the river on a bridge, level with the banks, and walkable.
let bridge = null;
for (let i = 1; i < innRoad.points.length && !bridge; i++) {
  const a = innRoad.points[i - 1];
  const b = innRoad.points[i];
  for (let t = 0; t <= 1; t += 0.1) {
    const x = a.x + (b.x - a.x) * t;
    const z = a.z + (b.z - a.z) * t;
    const near = toRiver(x, z) < 1;
    if (near) bridge = { x, z };
  }
}
assert.ok(bridge, "the road to the inn crosses the river");
assert.ok(heightAt(bridge.x, bridge.z) > -0.5, "on a bridge, not down in the riverbed");
const crossing = { ...bridge };
world.resolveCollisions(crossing, 0.35);
assert.ok(Math.hypot(crossing.x - bridge.x, crossing.z - bridge.z) < 0.5, "the bridge can be walked across");

const inn = world.layout.outposts.find((outpost) => outpost.kind === "inn");
assert.ok(inn.door !== null && world.doors[inn.door], "the inn has a door");
assert.equal(world.caves.length, 1, "the cave has a mouth to use");
const zones = buildZones(world.layout, 31);
const innZone = zones.zones.find((zone) => zone.kind === "outpost");
assert.ok(innZone && innZone.name, `the inn has a name (${innZone?.name})`);
assert.equal(zones.byId.get(`building:${inn.door}`).name, innZone.name, "its building goes by the same name");
assert.ok(zones.byId.get(`building:${inn.door}`).sign, "and has a sign");
assert.equal(zoneAt(zones, middle.x, middle.z).kind, "river", "the river is a place");
assert.equal(zoneAt(zones, 0, -150).kind, "mountains", "so are the mountains");
assert.ok(
  zones.zones.some((zone) => zone.kind === "road" && zone.name.startsWith("the road to")),
  "and the roads",
);

// A world with no landscape given still builds, from the seed.
assert.deepEqual(createWorld(32).landscape, landscapeFor(32));

console.log("wanderworld land regression: OK");
