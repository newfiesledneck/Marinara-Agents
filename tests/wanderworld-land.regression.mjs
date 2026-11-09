// Wanderworld's land: a world's landscape (hills, mountains, a river, places out in the country) is
// checked and always makes a world; the town stays level; mountains rise at their edge; the river can't
// be walked through except on a bridge where a road crosses it; inns and cottages get doors, caves a
// mouth, and every one of them a name.
import assert from "node:assert/strict";
import { checkLandscape, landscapeFor, landscapeNeeds, landscapeWith } from "../packages/wanderworld/src/land.js";
import { createWorld, heightAt, waterAt } from "../packages/wanderworld/src/world.js";
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
assert.equal(chosen.outposts.filter((entry) => entry.kind !== "hamlet").length, 4, "several places (hamlets aside)");
{
  // Surprise me keeps the seed's land; the settlement is picked from the seed too (a new world's own).
  const { settlement, ...land } = landscapeWith(31, { hills: "surprise" });
  const { settlement: ignored, ...seededLand } = seeded;
  const noHamlets = {
    ...land,
    outposts: land.outposts.filter((entry) => entry.kind !== "hamlet" && entry.kind !== "farm"),
  };
  assert.deepEqual(noHamlets, seededLand, "Surprise me keeps the seed's choices (a hamlet or farm may join them)");
  assert.ok(["hamlet", "village", "town", "city"].includes(settlement.kind), "and picks a settlement");
  assert.equal(ignored.kind, "town", "a world without one stays the town it always was");
}

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
assert.deepEqual(
  world.landscape,
  { ...landscape, settlement: { kind: "town", market: "square", roads: "cobble", side: null, layout: "grid" } },
  "the world keeps the landscape it was built with (a town, when none was given)",
);
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

// Swimming: the middle of the river is deep enough to swim in; a bridge's deck and the town are dry.
assert.ok(waterAt(middle.x, middle.z).depth > 1.3, "mid-river is deep enough to swim");
assert.equal(waterAt(bridge.x, bridge.z).depth, 0, "on a bridge, out of the water");
assert.equal(waterAt(0, 0).depth, 0, "the town square is dry");
const wader = { x: middle.x, z: middle.z };
world.resolveCollisions(wader, 0.35, true);
assert.ok(Math.hypot(wader.x - middle.x, wader.z - middle.z) < 0.01, "a swimmer may go into the water");

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

// However hilly, the ground at the top of each bank stands above the water, so the water never floats.
for (const seed of [41, 42, 43]) {
  const hilly = createWorld(seed, landscapeWith(seed, { hills: "rugged", river: "yes" }));
  const { points, width } = hilly.layout.river;
  for (let i = 1; i < points.length; i++) {
    const [a, b] = [points[i - 1], points[i]];
    const length = Math.hypot(b.x - a.x, b.z - a.z) || 1;
    const [nx, nz] = [-(b.z - a.z) / length, (b.x - a.x) / length];
    for (const side of [-1, 1]) {
      const x = a.x + nx * side * (width / 2 + 4);
      const z = a.z + nz * side * (width / 2 + 4);
      if (Math.abs(x) > 150 || Math.abs(z) > 150) continue;
      assert.ok(
        heightAt(x, z) > -0.45,
        `seed ${seed}: the bank at (${x.toFixed(0)}, ${z.toFixed(0)}) is above the water`,
      );
    }
  }
}

// A world built for its lore: at least what it names. A cave brings mountains with it.
{
  const bare = landscapeWith(51, { mountains: "none", river: "no", places: "none" });
  const needed = landscapeNeeds(bare, { cave: 2, inn: 1, river: 1, smithy: 3, tavern: 2, temple: 2 }, 51);
  assert.ok(needed.mountains.length >= 1, "a cave needs hills, so there are mountains");
  assert.equal(needed.outposts.filter((entry) => entry.kind === "cave").length, 2);
  assert.ok(
    needed.outposts.filter((entry) => entry.kind === "cave").every((entry) => needed.mountains.includes(entry.side)),
    "caves are in the mountains",
  );
  assert.equal(needed.outposts.filter((entry) => entry.kind === "inn").length, 1);
  assert.ok(needed.river, "a river when one's named");
  const built = createWorld(51, needed, { smithy: 3, tavern: 2, temple: 2 });
  const kinds = built.layout.buildings.map((building) => building.kind);
  const count = (kind) => kinds.filter((entry) => entry === kind).length;
  assert.ok(count("smithy") >= 3, `three smithies (got ${count("smithy")})`);
  assert.ok(count("tavern") >= 2 + 1, "two taverns in town, plus the inn's"); // the inn's building is a tavern too
  assert.ok(count("temple") >= 2, "two temples");
  assert.equal(built.caves.length, 2, "both caves have mouths");
  built.dispose();
}

// Places out in the country never stand in the river, and caves have no road to them.
for (const seed of [71, 72, 73, 74, 75, 76]) {
  const landscape = landscapeNeeds(
    landscapeWith(seed, { river: "yes", places: "several" }),
    { inn: 2, cottage: 2, cave: 2 },
    seed,
  );
  const built = createWorld(seed, landscape);
  for (const outpost of built.layout.outposts) {
    if (outpost.kind === "cave") continue;
    const ground = heightAt(outpost.x, outpost.z);
    assert.ok(
      ground > -0.3,
      `seed ${seed}: ${outpost.kind} at (${outpost.x.toFixed(0)}, ${outpost.z.toFixed(0)}) stands on dry ground (${ground.toFixed(2)})`,
    );
  }
  const caves = built.layout.outposts.map((outpost, i) => [outpost, i]).filter(([outpost]) => outpost.kind === "cave");
  assert.ok(
    caves.every(([, i]) => !built.layout.roads.some((road) => road.to === i)),
    "no road to a cave",
  );
  built.dispose();
}

// World sizes: everything stays inside a small world, and a massive one spreads its places further out.
{
  const landscape = landscapeNeeds(landscapeWith(81, { places: "several", mountains: "two" }), { inn: 2, cave: 2 }, 81);
  const spread = {};
  for (const size of ["small", "massive"]) {
    const built = createWorld(81, landscape, {}, size);
    const half = built.size / 2;
    assert.equal(built.size, { small: 240, massive: 960 }[size]);
    assert.ok(
      built.layout.outposts.every((outpost) => Math.abs(outpost.x) < half && Math.abs(outpost.z) < half),
      `${size}: every place out in the country is inside the world`,
    );
    spread[size] = Math.max(...built.layout.outposts.map((outpost) => Math.hypot(outpost.x, outpost.z)));
    built.dispose();
  }
  assert.ok(spread.massive > spread.small * 1.5, "a massive world's places spread further out");
}

// Settlements: a hamlet to a city, each bigger than the last; a village's market is stalls (no fountain),
// a hamlet's a green; a market can sit off to one side; too many homes in the lore grows a settlement.
{
  const counts = {};
  for (const kind of ["hamlet", "village", "town", "city"]) {
    const landscape = { ...landscapeWith(91, { places: "none" }), settlement: { kind } };
    const built = createWorld(91, landscape);
    counts[kind] = built.layout.buildings.length;
    assert.equal(built.layout.settlement.kind, kind);
    if (kind === "village") {
      assert.equal(built.fountain, null, "a village's market has no fountain");
      assert.equal(built.layout.settlement.market, "stalls");
      assert.equal(buildZones(built.layout, 91).byId.get("plaza").name, "the market", "its market is the market");
    }
    if (kind === "hamlet") assert.equal(buildZones(built.layout, 91).byId.get("plaza").name, "the green");
    built.dispose();
  }
  assert.ok(
    counts.hamlet < counts.village && counts.village < counts.town && counts.town < counts.city,
    `each kind is bigger than the last (${JSON.stringify(counts)})`,
  );
  const offside = createWorld(92, {
    ...landscapeWith(92, { places: "none" }),
    settlement: { kind: "town", side: "east" },
  });
  assert.ok(offside.layout.plaza.x > 10, "a market off to the east sits east of the middle");
  assert.ok(offside.spawn.x > 10, "and a first visit starts by it");
  offside.dispose();
  // Layouts: a crossroads, one street and a ring leave blocks open (a grid builds them all); every house
  // is still on a laid street, and the townsfolk's street points are only on laid streets.
  const built = {};
  for (const layout of ["grid", "crossroads", "street", "ring"]) {
    const world = createWorld(94, { ...landscapeWith(94, { places: "none" }), settlement: { kind: "town", layout } });
    built[layout] = world.layout.buildings.length;
    assert.ok(world.layout.buildings.length > 6, `${layout}: a settlement with houses`);
    assert.ok(world.waypoints.length > 4, `${layout}: streets to walk`);
    world.dispose();
  }
  assert.ok(
    built.crossroads < built.grid && built.street < built.grid,
    `fewer blocks than a grid (${JSON.stringify(built)})`,
  );
  const grown = landscapeNeeds({ ...landscapeWith(93, {}), settlement: { kind: "hamlet" } }, { home: 30 }, 93);
  assert.equal(grown.settlement.kind, "town", "a hamlet too small for thirty homes grows into a town");
}

// More settlements: a lorebook naming town2 brings a hamlet out in the country, its own settlement
// (a town zone, town2) with its houses numbered among the homes, on a road from the main town.
{
  const landscape = landscapeNeeds(landscapeWith(95, { places: "none", towns: "none" }), { town: 2 }, 95);
  assert.equal(landscape.outposts.filter((entry) => entry.kind === "hamlet").length, 1, "town2 makes one hamlet");
  const built = createWorld(95, landscape);
  const zones = buildZones(built.layout, 95);
  const hamlet = zones.zones.find((zone) => zone.kind === "town" && zone.id !== "town");
  assert.ok(hamlet, "the hamlet is a settlement of its own");
  const houses = zones.zones.filter((zone) => zone.kind === "building" && zone.parent === hamlet.id);
  assert.ok(houses.length >= 5, `with its houses (${houses.length})`);
  assert.ok(
    houses.every((zone) => zone.buildingKind === "home" || zone.buildingKind === "shop"),
    "town houses, not cottages",
  );
  const index = built.layout.outposts.findIndex((outpost) => outpost.kind === "hamlet");
  assert.ok(
    built.layout.roads.some((road) => road.to === index),
    "with a road to it",
  );
  built.dispose();
  const { slotsOf } = await import("../packages/wanderworld/src/zones.js");
  assert.equal(slotsOf(zones).get("town2"), hamlet.id, "named town2");
  const { zoneAt } = await import("../packages/wanderworld/src/zones.js");
  const middle = hamlet.shape.circle;
  assert.equal(zoneAt(zones, middle.x, middle.z).id, hamlet.id, "its green is the hamlet, not the road's end");
}

// Farms: farm2 in the lore brings two, each a place of its own (farm1, farm2) with its farmhouse, on
// level ground, on its own road.
{
  const { slotsOf, zoneAt } = await import("../packages/wanderworld/src/zones.js");
  const landscape = landscapeNeeds(
    landscapeWith(96, { places: "none", towns: "none", farms: "none" }),
    { farm: 2 },
    96,
  );
  assert.equal(landscape.outposts.filter((entry) => entry.kind === "farm").length, 2, "farm2 makes two farms");
  const built = createWorld(96, landscape);
  const zones = buildZones(built.layout, 96);
  const slots = slotsOf(zones);
  for (const name of ["farm1", "farm2"]) {
    const farm = zones.byId.get(slots.get(name));
    assert.ok(farm && farm.outpostKind === "farm", `${name} is a farm`);
    const { x, z } = farm.shape.circle;
    assert.equal(zoneAt(zones, x, z).id, farm.id, `${name}'s yard is the farm`);
    const index = built.layout.outposts.findIndex((outpost) => outpost.x === x && outpost.z === z);
    assert.ok(
      built.layout.roads.some((road) => road.to === index),
      `${name} has a road`,
    );
    assert.ok(built.layout.outposts[index].door !== null, `${name} has a farmhouse door`);
    assert.ok(Math.abs(heightAt(x + 15, z + 15)) < 0.01, `${name}'s fields are level`);
  }
  built.dispose();
}

// A world with no landscape given still builds, from the seed.
assert.deepEqual(createWorld(32).landscape, landscapeFor(32));

// The road network: hamlets on neighbouring sides are joined, an inn stands beside the farm road on its
// side with its track starting on that road.
{
  const landscape = {
    ...landscapeWith(97, { places: "none", towns: "none", farms: "none" }),
    river: null,
    mountains: [],
    outposts: [
      { kind: "hamlet", side: "north" },
      { kind: "hamlet", side: "east" },
      { kind: "farm", side: "south" },
      { kind: "inn", side: "south" },
    ],
  };
  const built = createWorld(97, landscape);
  const { roads } = built.layout;
  const join = roads.find((road) => road.between);
  assert.deepEqual(join?.between, [0, 1], "the two hamlets are joined");
  const farmRoad = roads.find((road) => road.to === 2);
  const innRoad = roads.find((road) => road.to === 3);
  const start = innRoad.points[0];
  assert.ok(
    farmRoad.points.some((point) => Math.hypot(point.x - start.x, point.z - start.z) < 0.01),
    "the inn's track leaves from the farm road",
  );
  assert.ok(innRoad.points.length < farmRoad.points.length, "and is shorter than a road of its own");
  const zones = buildZones(built.layout, 97);
  assert.match(zones.byId.get("road:0-1")?.name ?? "", /^the road between /u, "the joining road is a place");
  built.dispose();
}

// The map: a preview of a world that isn't built matches the world once built, and leaves the world
// being played as it was.
{
  const { previewMap } = await import("../packages/wanderworld/src/world.js");
  const landscape = landscapeWith(98, { towns: "one", farms: "one", settlement: "village" });
  const built = createWorld(98, landscape, {}, "large");
  const before = heightAt(40, 40);
  const preview = previewMap(98, landscapeWith(12, { settlement: "city" }), "small");
  assert.equal(preview.half, 120, "a Small preview");
  assert.equal(heightAt(40, 40), before, "the world being played keeps its land");
  const again = previewMap(98, landscape, "large");
  const strip = (info) => ({
    half: info.half,
    outposts: info.outposts,
    blocks: info.town.blocks,
    roads: info.roads.length,
  });
  assert.deepEqual(strip(again), strip(built.map), "the preview is the world it will build");
  assert.ok(
    built.map.town.blocks.some((block) => block.market),
    "with its market",
  );
  built.dispose();
}

console.log("wanderworld land regression: OK");
