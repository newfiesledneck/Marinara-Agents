// Wanderworld regions and travel (regions.js, travel.js): a region's land comes from the world's seed and
// its place on the map, lands are varied and each makes its own land, settlements have people, vendors and
// an inn, people are kept, journeys go by road and pass time, the coach takes its fare, the quest hook
// makes and keeps a region and its target, and saves (new and old) load.
// Run: node tests/wanderworld-regions.regression.mjs
import assert from "node:assert/strict";
import {
  checkFolk,
  checkTravel,
  folkId,
  folkPerson,
  isFolkId,
  LAND_KINDS,
  landAt,
  landName,
  landOf,
  makeRegion,
  placeTarget,
  regionFlavour,
  regionFolk,
  regionForQuest,
  regionWeather,
  routeTo,
  targetsIn,
} from "../packages/wanderworld/src/regions.js";
import { chargeFare, encounterFor, journeyTo, MOST_HOURS } from "../packages/wanderworld/src/travel.js";
import { checkWorld, createSaves } from "../packages/wanderworld/src/saves.js";
import { checkLandscape, LAKE_RADIUS } from "../packages/wanderworld/src/land.js";
import { createWorld, hashString, waterAt } from "../packages/wanderworld/src/world.js";
import { buildZones } from "../packages/wanderworld/src/zones.js";
import { habitatsAt } from "../packages/wanderworld/src/herd.js";
import { vendorKinds } from "../packages/wanderworld/src/vendor.js";
import { PACK } from "../packages/wanderworld/src/pack.js";

const SEED = "world-regions-test";

// ── Lands: the same for the same seed and place, varied across the map, the north colder ──
const keys = [];
for (let x = -4; x <= 4; x++) for (let z = -4; z <= 4; z++) if (x || z) keys.push(`${x},${z}`);
for (const key of keys) assert.equal(landAt(SEED, key), landAt(SEED, key), `${key}: the same each time`);
assert.equal(landAt(SEED, "0,0"), "", "home has no land of its own");
const counts = {};
for (const key of keys) counts[landAt(SEED, key)] = (counts[landAt(SEED, key)] ?? 0) + 1;
assert.ok(Object.keys(counts).length >= 5, `varied lands: ${JSON.stringify(counts)}`);
for (const land of Object.keys(counts)) assert.ok(LAND_KINDS.includes(land), land);
const northSnow = keys.filter((key) => key.endsWith(",-4") && landAt(SEED, key) === "snow").length;
const southSnow = keys.filter((key) => key.endsWith(",4") && landAt(SEED, key) === "snow").length;
assert.ok(northSnow > southSnow, "the far north is colder");
// Over many worlds, every land turns up somewhere.
const seen = new Set();
for (let n = 0; n < 12; n++) for (const key of keys) seen.add(landAt(`world-${n}`, key));
for (const land of LAND_KINDS) assert.ok(seen.has(land), `${land} turns up`);
// Names fit their land and are the same each time.
assert.equal(landName(SEED, "2,1", "marsh"), landName(SEED, "2,1", "marsh"));
assert.match(landName(SEED, "2,1", "marsh"), /Fen|marsh|Mire/u);
assert.match(landName(SEED, "1,0", "snow"), /Height|peak|mark/u);

// ── Each land makes its own region, the same each time ──
const built = {};
for (const land of LAND_KINDS) {
  const key = "1,0";
  const region = makeRegion(SEED, key, { land, arrive: "west" });
  assert.deepEqual(region, makeRegion(SEED, key, { land, arrive: "west" }), `${land}: the same region each time`);
  assert.equal(region.landscape.land, land);
  assert.ok(!region.landscape.mountains.includes("west"), `${land}: no mountains where you come in`);
  assert.deepEqual(region.needs, { tavern: 1, shop: 1 }, `${land}: an inn and a shop`);
  const checked = checkLandscape(region.landscape, hashString(region.seed));
  assert.equal(checked.land, land, `${land}: kept through the landscape's check`);
  const world = createWorld(hashString(region.seed), region.landscape, region.needs, "normal");
  const zones = buildZones(world.layout, hashString(region.seed));
  built[land] = { region, world, zones };
  assert.equal(world.layout.land, land, `${land}: the built world knows its land`);
  // A habitat word of its own (the forest's, the marsh's…) wherever you are in it.
  const word = { forest: "forest", marsh: "marsh", snow: "snow", badlands: "badlands" }[land];
  if (word) assert.ok(habitatsAt(world, 100, 100).has(word), `${land}: monsters of the ${word} live here`);
  world.dispose?.();
}
assert.ok(
  built.lakes.region.landscape.outposts.some((entry) => entry.kind === "pond" && entry.lake),
  "a lakeside has its lake",
);
{
  // The lake is real water, as wide as a lake.
  const { region } = built.lakes;
  const world = createWorld(hashString(region.seed), region.landscape, region.needs, "normal");
  const lake = world.layout.outposts.find((entry) => entry.kind === "pond");
  assert.ok(lake, "the lake is placed");
  assert.ok(waterAt(lake.x, lake.z).depth > 1, "deep in the middle");
  assert.ok(waterAt(lake.x + LAKE_RADIUS - 6, lake.z).depth > 0, "water far out from the middle");
  world.dispose?.();
}
const treesOf = (land) => built[land].region.landscape;
assert.equal(treesOf("marsh").hills, "flat", "a marsh is flat");
assert.ok(treesOf("snow").mountains.length >= 2, "snowy highlands have mountains");
assert.ok(treesOf("farmland").outposts.filter((entry) => entry.kind === "farm").length >= 2, "farmland has farms");
// Its weather leans its own way.
assert.equal(regionWeather("clear", "marsh", 0.1), "mist", "a marsh is often misty");
assert.equal(regionWeather("rain", "badlands", 0.1), "clear", "the badlands seldom see rain");
assert.equal(regionWeather("rain", "", 0.1), "rain", "home's weather is its own");

// ── Settlements: people with names, jobs, homes and work; vendors; an inn ──
for (const land of LAND_KINDS) {
  const { world, zones, region } = built[land];
  const settlement = world.layout.settlement.kind;
  const { folk, housing } = regionFolk(SEED, "1,0", zones.zones, { land, settlement, town: zones.town });
  assert.deepEqual(
    regionFolk(SEED, "1,0", zones.zones, { land, settlement, town: zones.town }).folk,
    folk,
    "the same people",
  );
  assert.ok(folk.length >= 5, `${land}: people (${folk.length})`);
  assert.equal(new Set(folk.map((person) => person.name)).size, folk.length, `${land}: each their own name`);
  for (const person of folk) {
    assert.ok(isFolkId(person.id) && person.id.startsWith("local:"), person.id);
    assert.match(person.id, /^[\w:./@-]+$/u, "an id the server takes");
    assert.ok(person.job, `${person.name} has a job`);
    assert.ok(zones.byId.has(housing[person.id].home), `${person.name} has a home`);
  }
  const buildings = zones.zones.filter((zone) => zone.kind === "building");
  const inn = buildings.find((zone) => zone.buildingKind === "tavern" || zone.buildingKind === "inn");
  assert.ok(inn, `${land}: an inn (${region.landscape.settlement.kind})`);
  assert.ok(
    folk.some((person) => housing[person.id].work === inn.id && person.job === "innkeeper"),
    `${land}: an innkeeper`,
  );
  const kinds = Object.keys(PACK.vendors.kinds).reduce((all, id) => ({ ...all, [id]: PACK.vendors.kinds[id] }), {});
  const vendors = buildings.filter((zone) => vendorKinds(zone, zone.name, undefined, kinds).length);
  assert.ok(vendors.length >= 2, `${land}: vendors (${vendors.length})`);
  const person = folkPerson(folk[0], "1,0");
  assert.equal(person.region, "1,0");
  assert.ok(person.description.includes(folk[0].job), "what they do, in their description");
  assert.ok(regionFlavour(SEED, "1,0", land, zones.town, settlement).includes(zones.town), "flavour names the place");
}

// ── Saves: regions keep their land and people; travel's own record; an old save loads ──
const saves = createSaves(memoryStorage());
function memoryStorage() {
  const map = new Map();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => map.set(key, value),
    removeItem: (key) => map.delete(key),
  };
}
const { world: farmWorld, zones: farmZones } = built.farmland;
const made = makeRegion(SEED, "1,0", { land: "farmland", arrive: "west", number: 2, name: "the Barley Fields" });
const people = regionFolk(SEED, "1,0", farmZones.zones, {
  land: "farmland",
  settlement: farmWorld.layout.settlement.kind,
  town: farmZones.town,
});
const world = saves.create({ name: "Regions", seed: SEED });
const save = {
  ...world,
  region: "1,0",
  regions: { "1,0": { ...made, folk: people.folk, housing: people.housing, vendors: { "building:3": { stock: [] } } } },
  homeSetup: { names: {}, lore: {}, groups: null, housing: {}, furnished: {}, place: null, vendors: {} },
  travel: { planned: { "3,0": { land: "marsh", quest: "q1" } }, heard: ["3,0"], targets: [] },
};
const back = saves.write(save);
const read = saves.read(back.id);
assert.equal(read.regions["1,0"].landscape.land, "farmland", "the land is kept");
assert.deepEqual(read.regions["1,0"].folk, people.folk, "the people are kept, as they were");
assert.deepEqual(read.regions["1,0"].needs, { tavern: 1, shop: 1 }, "what the settlement needs is kept");
assert.deepEqual(read.regions["1,0"].vendors, { "building:3": { stock: [] } }, "each region's vendors are its own");
assert.deepEqual(read.travel.planned["3,0"], { land: "marsh", quest: "q1" });
assert.equal(landOf(read, "3,0"), "marsh", "a planned land wins over the seed's");
assert.equal(landOf(read, "1,0"), "farmland");
// An old save: no travel, regions with no land or people.
const old = checkWorld({
  id: "old",
  seed: "old-world",
  region: "1,0",
  regions: {
    "1,0": {
      name: "the Greenvale",
      number: 2,
      seed: "old-world|1,0",
      landscape: { hills: "gentle", mountains: [], outposts: [] },
    },
  },
});
assert.ok(old, "an old save loads");
assert.deepEqual(old.travel, { planned: {}, heard: [], targets: [] });
assert.equal(old.regions["1,0"].folk, undefined, "no people yet: they're made on the next visit");
assert.equal(landOf(old, "1,0"), "", "an old region keeps its plain land");
assert.deepEqual(
  checkFolk([
    { id: "nope", name: "X" },
    { id: folkId("1,0", 0), name: "Agnes Reed", job: "smith" },
  ]).length,
  1,
);

// ── People persist: leaving and coming back finds the same people, with what they think and remember ──
// (main.js keeps `folk` with the region and makes none again; relationships and memories are kept by id.)
{
  const again = regionFolk(SEED, "1,0", farmZones.zones, {
    land: "farmland",
    settlement: farmWorld.layout.settlement.kind,
    town: farmZones.town,
  });
  assert.deepEqual(
    again.folk.map((p) => p.id),
    people.folk.map((p) => p.id),
    "the same ids, so their relationships and memories are theirs",
  );
  const kept = checkWorld({
    ...read,
    relationships: [{ from: people.folk[0].id, to: "player", kind: "friend", level: 30 }],
    memories: { [people.folk[0].id]: [{ day: 1, text: "Met a traveller." }] },
    region: "0,0",
  });
  assert.equal(kept.relationships[0].from, people.folk[0].id, "a region person's relationship is kept while away");
  assert.ok(kept.memories[people.folk[0].id], "and what they remember");
  assert.deepEqual(kept.regions["1,0"].folk, people.folk, "they're still theirs at home");
}

// ── Travel: by road through regions you know, time passes, the coach takes its fare ──
const settings = { travelRoads: true, travelCoach: true, coachFare: 10, journeyHours: 5 };
const map = {
  seed: SEED,
  region: "0,0",
  regions: { "1,0": {}, "2,0": {}, "2,1": {} },
  purposes: {},
  travel: { heard: ["3,1"] },
};
assert.deepEqual(
  routeTo(map, "0,0", "2,1").map((step) => step.key),
  ["1,0", "2,0", "2,1"],
  "the way along roads you know",
);
assert.equal(routeTo(map, "0,0", "5,5"), null, "nowhere you don't know");
const walk = journeyTo(map, "2,1", "walk", settings);
assert.equal(walk.hours, 15, "five hours a region on foot");
assert.equal(walk.fare, 0, "walking is free");
assert.equal(walk.path.at(-1).side, "south", "arriving from the side you left the last region by");
const coach = journeyTo(map, "2,1", "coach", settings, true);
assert.equal(coach.hours, 7.5, "a coach is twice as fast");
assert.equal(coach.fare, 30, "ten a region");
assert.match(journeyTo(map, "2,1", "coach", settings, false).problem, /inn/u, "a coach leaves from an inn");
assert.match(journeyTo(map, "3,1", "coach", settings, true).problem, /been/u, "only where you've been");
assert.ok(journeyTo(map, "3,1", "walk", settings).path, "you can walk to a place you've heard of");
assert.match(journeyTo(map, "2,1", "walk", { ...settings, travelRoads: false }).problem, /off/u, "switched off");
assert.ok(
  journeyTo({ ...map, regions: Object.fromEntries(keys.map((key) => [key, {}])) }, "4,4", "walk", {
    ...settings,
    journeyHours: 9,
  }).hours <= MOST_HOURS,
);
// The fare comes out of the purse.
const items = [
  { id: "i1", name: "Coins", quantity: 45 },
  { id: "i2", name: "Bread", quantity: 2 },
];
assert.deepEqual(chargeFare(items, "Coins", 30), { change: { id: "i1", quantity: 15 } }, "the fare is taken");
assert.deepEqual(chargeFare(items, "coins", 45), { change: { id: "i1", gone: true } }, "the last coin too");
assert.match(chargeFare(items, "Coins", 50).problem, /You have 45/u, "not without the fare");
assert.deepEqual(chargeFare(items, "Coins", 0), { free: true });
// Encounters on the road: none when off, the land's own kinds when they come, and the same for the same journey.
assert.equal(
  encounterFor("marsh", "off", 5, "walk", () => true, 1),
  null,
);
let met = null;
for (let n = 0; n < 60 && !met; n++) met = encounterFor("marsh", "often", 3, "walk", () => true, n);
assert.ok(met && met.count >= 2, "something meets you sometimes");
assert.deepEqual(
  encounterFor("marsh", "often", 3, "walk", () => true, 7),
  encounterFor("marsh", "often", 3, "walk", () => true, 7),
);
assert.equal(
  encounterFor("marsh", "often", 9, "walk", () => false, 3),
  null,
  "only kinds that are on",
);

// ── The quest hook: a region of a kind in a direction, kept; a target placed there and kept ──
{
  const base = checkWorld({ id: "q", seed: SEED, region: "0,0", regions: { "1,0": made } });
  const asked = regionForQuest(base, {
    side: "east",
    distance: 2,
    land: "badlands",
    purpose: "stronghold",
    quest: "q-bandits",
  });
  assert.equal(asked.key, "2,0", "two regions east");
  assert.equal(asked.made, false);
  assert.equal(asked.travel.planned["2,0"].land, "badlands", "its land is planned");
  assert.equal(asked.purposes["2,0"].kind, "stronghold", "and its purpose");
  assert.equal(asked.purposes["2,0"].from, "quest");
  assert.ok(asked.travel.heard.includes("2,0"), "it's on the map");
  const after = { ...base, travel: asked.travel, purposes: asked.purposes };
  assert.equal(landOf(after, "2,0"), "badlands");
  // Asked again, the same region; a different land that way goes further on.
  assert.equal(regionForQuest(after, { side: "east", distance: 2, land: "badlands", quest: "q-bandits" }).key, "2,0");
  assert.equal(regionForQuest(after, { side: "east", distance: 2, land: "snow", quest: "q2" }).key, "3,0");
  // A made region fits when it's what's asked.
  assert.equal(regionForQuest(after, { side: "east", distance: 1, land: "farmland" }).key, "1,0");
  assert.equal(
    regionForQuest(after, { side: "east", distance: 1, land: "marsh" }).key,
    "3,0",
    "past the farmland that isn't marsh",
  );
  // Targets: a person, an item, a creature; a deep place's entrance is planned into the land.
  let travel = after.travel;
  for (const target of [
    {
      id: "t1",
      quest: "q-bandits",
      region: "2,0",
      kind: "person",
      name: "Mara the captive",
      what: "a merchant's daughter",
    },
    { id: "t2", quest: "q-bandits", region: "2,0", kind: "item", name: "Silver locket", near: "ruins" },
    { id: "t3", quest: "q-bandits", region: "2,0", kind: "creature", name: "the bandit chief", what: "bandit" },
    { id: "t4", quest: "q-bandits", region: "2,0", kind: "deep", name: "Blackrock Hold", what: "stronghold" },
  ])
    travel = placeTarget(travel, target);
  assert.equal(targetsIn(travel, "2,0").length, 4, "every target kept for its region");
  assert.deepEqual(travel.planned["2,0"].deep, { deep: "stronghold", name: "Blackrock Hold" });
  assert.equal(
    placeTarget(travel, { id: "t5", region: "1,0", kind: "deep", what: "cave" }, true),
    null,
    "no new cave in a land already made",
  );
  const region = makeRegion(SEED, "2,0", {
    land: landOf({ ...after, travel }, "2,0"),
    purpose: after.purposes["2,0"],
    arrive: "west",
    deep: travel.planned["2,0"].deep,
  });
  assert.ok(
    region.landscape.outposts.some((entry) => entry.kind === "cave" && entry.deep === "stronghold"),
    "the entrance is in the land",
  );
  assert.equal(region.landscape.land, "badlands");
  // Kept in the save.
  const saved = checkWorld({ ...after, travel });
  assert.equal(saved.travel.targets.length, 4);
  assert.equal(saved.purposes["2,0"].kind, "stronghold");
  assert.deepEqual(checkTravel(saved.travel), saved.travel, "the check keeps what it checked");
  // Done targets aren't open any more.
  const done = {
    ...saved.travel,
    targets: saved.travel.targets.map((t) => (t.id === "t2" ? { ...t, done: true } : t)),
  };
  assert.equal(targetsIn(done, "2,0").length, 3);
}

console.log("ok: regions and travel");
