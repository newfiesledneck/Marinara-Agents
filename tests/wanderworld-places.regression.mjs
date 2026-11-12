// Wanderworld places and saves: zones name every spot in a world and say where someone is in words;
// saved worlds come back as they were, and damaged or old saves fall back to defaults.
import assert from "node:assert/strict";
import { createSaves, checkWorld } from "../packages/wanderworld/src/saves.js";
import { createWorld, SPAWN } from "../packages/wanderworld/src/world.js";
import { landscapeNeeds, landscapeWith } from "../packages/wanderworld/src/land.js";
import {
  buildZones,
  carrySetup,
  checkGroups,
  matchLore,
  mergeLore,
  placesOfKind,
  slotsOf,
  structureFromLore,
  defaultGroups,
  describe,
  groupsAt,
  nameOf,
  newGroupId,
  remapZones,
  signOf,
  zoneAt,
} from "../packages/wanderworld/src/zones.js";

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

// Place groups: by default the wilds round the town and its homes; lore on a group reaches every place in
// it; groups from a save (or the AI) are checked.
{
  const world = createWorld(31);
  const zones = buildZones(world.layout, 31);
  const groups = defaultGroups(zones);
  const wilds = groups.find((group) => group.id === "group:wilds");
  assert.ok(wilds.members.includes("forest"), "the forest is in the wilds");
  assert.ok(groups.find((group) => group.id === "group:homes")?.members.length > 5, "the homes are grouped");
  const home = zones.zones.find((zone) => zone.kind === "building" && zone.buildingKind === "home");
  assert.deepEqual(
    groupsAt(groups, [home]).map((group) => group.id),
    ["group:homes"],
    "a home is in the homes group",
  );
  assert.equal(newGroupId(groups, "The wilds"), "group:the-wilds");
  assert.equal(newGroupId([...groups, { id: "group:the-wilds" }], "The wilds"), "group:the-wilds-2");
  const checked = checkGroups([
    { id: "group:a", name: "  Coast  ", members: ["forest", "forest", 7] },
    { id: "group:a", name: "twice" },
    { id: "wilds", name: "no prefix" },
  ]);
  assert.deepEqual(checked, [{ id: "group:a", name: "Coast", members: ["forest"], parent: null }]);
  assert.equal(checkGroups(undefined), null, "no groups saved yet: the defaults apply");
  assert.deepEqual(checkWorld({ id: "w", seed: "s", groups: checked }).groups, checked, "groups are saved");
  // How many memories someone keeps, when it isn't the setting's number: whole numbers within what's allowed.
  assert.deepEqual(
    checkWorld({
      id: "w",
      seed: "s",
      memoryLimits: { a: { each: 99, kept: 2.4 }, b: { each: "x" }, c: { kept: -3 }, d: 5 },
    }).memoryLimits,
    { a: { each: 40, kept: 2 }, c: { kept: 0 } },
  );

  // Subgroups: a group inside another passes on the outer one's lore.
  const nested = [
    { id: "group:town-homes", name: "Homes", members: [], parent: null },
    { id: "group:mill-lane", name: "Mill Lane homes", members: [home.id], parent: "group:town-homes" },
  ];
  assert.deepEqual(
    groupsAt(nested, [home]).map((group) => group.id),
    ["group:mill-lane", "group:town-homes"],
    "a home in a subgroup is in its parent group too",
  );
  assert.ok(
    zones.byId.get(home.parent).kind === "street" || zones.byId.get(home.parent).kind === "plaza",
    "a building sits on its street",
  );

  // A new layout keeps the setup: each place's name, lore and groups go to the same kind of place.
  const other = buildZones(createWorld(99).layout, 99);
  const map = remapZones(zones, other);
  const tavern = zones.zones.find((zone) => zone.buildingKind === "tavern");
  assert.equal(other.byId.get(map.get(tavern.id)).buildingKind, "tavern", "the tavern is still a tavern");
  const carried = carrySetup(
    {
      names: { [tavern.id]: "The Rusty Tankard", town: "Oakhold" },
      lore: { [tavern.id]: [{ lorebookId: "b", entryId: "e", title: "Ale" }], world: [], "group:x": [] },
      groups: [{ id: "group:x", name: "X", members: [tavern.id, "river"], parent: null }],
    },
    map,
  );
  assert.equal(carried.names[map.get(tavern.id)], "The Rusty Tankard");
  assert.equal(carried.names.town, "Oakhold");
  assert.ok(carried.lore[map.get(tavern.id)] && carried.lore.world && carried.lore["group:x"], "lore is kept");
  assert.ok(carried.groups[0].members.includes(map.get(tavern.id)), "the group still holds the tavern");

  // Lorebook entries link to places by exact names and keywords.
  const books = [
    {
      id: "b",
      entries: [
        { id: "1", title: "About the town", keys: [zones.town] },
        { id: "2", title: "Old ale", keys: ["Tavern"] },
        { id: "3", title: "Wolves", keys: ["the woods", "wolf"] },
        { id: "4", title: "Gods", keys: ["World"] },
        { id: "5", title: "Mira", keys: ["Mira"] },
        { id: "7", title: "Tavern", keys: [] }, // only called that: a title links nothing
        { id: "6", title: "Unrelated", keys: ["taverns are fun"] },
      ],
    },
  ];
  const linked = matchLore(books, {
    zones,
    names: {},
    groups,
    name: "My world",
    characters: [{ id: "c1", name: "Mira" }],
  });
  assert.deepEqual(
    linked.town.map((entry) => entry.entryId),
    ["1"],
    "an entry named after the town goes to the town",
  );
  assert.ok(
    linked[tavern.id].some((entry) => entry.entryId === "2"),
    "a 'tavern' keyword goes to the tavern",
  );
  assert.ok(
    linked.forest.some((entry) => entry.entryId === "3"),
    "'the woods' goes to the forest",
  );
  assert.ok(
    linked.world.some((entry) => entry.entryId === "4"),
    "'World' goes to the whole world",
  );
  assert.ok(
    linked["character:c1"].some((entry) => entry.entryId === "5"),
    "a character's name goes to them",
  );
  assert.ok(
    !Object.values(linked)
      .flat()
      .some((entry) => entry.entryId === "6"),
    "only exact matches link",
  );
  const merged = mergeLore({ town: [{ lorebookId: "b", entryId: "1", title: "x" }] }, linked);
  assert.equal(merged.town.length, 1, "linking again adds nothing twice");

  // Numbered names, and the structure a lorebook spells out.
  const slots = slotsOf(zones);
  assert.equal(slots.get("town1"), "town");
  assert.equal(slots.get("wilds1"), "forest");
  assert.equal(zones.byId.get(slots.get("tavern1")).buildingKind, "tavern");
  assert.equal(zones.byId.get(slots.get("home6")).buildingKind, "home");
  const homes = placesOfKind(zones, "home");
  const workSlot = ["smithy1", "shop1", "temple1", "hall1"].find((slot) => slots.has(slot));
  assert.ok(homes.length > 5 && homes.every((id) => zones.byId.get(id).buildingKind === "home"));
  const structure = structureFromLore(
    [
      {
        id: "b",
        entries: [
          { id: "g", title: "Residential Homes", keys: ["group of home", "located in town1"] },
          { id: "f", title: "Forbidden Forest", keys: ["wilds1", "located in world"] },
          { id: "j", title: "Jacob", keys: ["Jacob", "lives in home6", `works at ${workSlot}`] },
          { id: "s", title: "Sarah", keys: ["Sarah", "lives in home6", "owner of tavern1"] },
          { id: "h", title: "Jacob's home", keys: ["home6", "located in Residential Homes"] },
        ],
      },
    ],
    {
      zones,
      names: {},
      groups,
      name: "Aldermere",
      characters: [
        { id: "c-j", name: "Jacob" },
        { id: "c-s", name: "Sarah" },
      ],
    },
  );
  const homesGroup = structure.groups.find((group) => group.name === "Residential Homes");
  assert.equal(homesGroup.members.length, homes.length, "'group of home' holds every house");
  assert.deepEqual(structure.housing["c-j"], { home: slots.get("home6"), work: slots.get(workSlot), owner: false });
  assert.deepEqual(structure.housing["c-s"], { home: slots.get("home6"), work: slots.get("tavern1"), owner: true });
  assert.ok(
    structure.placements.some((entry) => entry.place === homesGroup.id && entry.in === "town"),
    "the group sits in the town",
  );
  assert.ok(structure.placements.some((entry) => entry.place === "forest" && entry.in === "world"));

  // The player's own entry: "player <persona name>" (or "you"), never the bare name, which a character may share.
  const mine = structureFromLore(
    [{ id: "b", entries: [{ id: "p", title: "Zoey's life", keys: ["player Zoey", "lives in home6"] }] }],
    { zones, names: {}, groups, name: "W", persona: "Zoey", characters: [{ id: "c-z", name: "Zoey" }] },
  );
  assert.equal(mine.housing.player.home, slots.get("home6"), "'player Zoey' gives the player a home");
  assert.equal(mine.housing["c-z"], undefined, "the character called Zoey isn't moved in");
  {
    // An inn's keeper: "owner of inn1" and "lives in inn1" mean the inn's building.
    const country = createWorld(61, landscapeNeeds(landscapeWith(61, { places: "none" }), { inn: 1 }, 61));
    const countryZones = buildZones(country.layout, 61);
    const keeper = structureFromLore(
      [{ id: "b", entries: [{ id: "k", title: "Keeper", keys: ["Keeper", "owner of inn1", "lives in inn1"] }] }],
      { zones: countryZones, names: {}, groups: [], name: "W", characters: [{ id: "c-k", name: "Keeper" }] },
    );
    const building = countryZones.byId.get(keeper.housing["c-k"].work);
    assert.equal(building?.kind, "building", '"owner of inn1" means the building there');
    assert.equal(building.parent, slotsOf(countryZones).get("inn1"));
    assert.equal(keeper.housing["c-k"].home, building.id);
    country.dispose();
  }
  const linkedMine = matchLore(
    [
      {
        id: "b",
        entries: [
          { id: "y", title: "About me", keys: ["you"] },
          { id: "z", title: "Zoey's past", keys: ["Zoey"] },
          { id: "t", title: "Zoey", keys: [] }, // only called that: a title links nothing
        ],
      },
    ],
    { zones, names: {}, groups, name: "W", persona: "Zoey", characters: [{ id: "c-z", name: "Zoey" }] },
  );
  assert.deepEqual(
    linkedMine.player.map((entry) => entry.entryId),
    ["y"],
    "'you' is the player's entry",
  );
  assert.deepEqual(
    linkedMine["character:c-z"].map((entry) => entry.entryId),
    ["z"],
    "'Zoey' is the character's",
  );

  // Who an entry is about, and the creatures the lore keeps for later.
  const { loreName, creaturesFromLore } = await import("../packages/wanderworld/src/zones.js");
  assert.equal(loreName({ title: "File 7", keys: ["character", "name Mira Little"] }), "Mira Little");
  assert.equal(loreName({ title: "Greta", keys: ["character"] }), "Greta", "the title, with no name given");
  assert.deepEqual(
    creaturesFromLore([
      {
        id: "b",
        entries: [
          { id: "g", title: "Goblins", keys: ["monster", "name Goblin"] },
          { id: "d", title: "Deer", keys: ["creature"] },
          { id: "w", title: "Wolf", keys: ["creature", "hostile"] },
          { id: "x", title: "Bandit lore", keys: ["hostile", "name Bandit"] },
          { id: "m", title: "Mira", keys: ["character"] },
        ],
      },
    ]).map((creature) => `${creature.name}:${creature.kind}:${creature.hostile}`),
    ["Goblin:monster:true", "Deer:creature:false", "Wolf:creature:true", "Bandit:creature:true"],
  );

  // A lorebook names a place with "name …" on the place's entry; a card's own entry goes by its title.
  const { namesFromLore } = await import("../packages/wanderworld/src/zones.js");
  const named = namesFromLore(
    [
      {
        id: "b",
        entries: [
          { id: "n", title: "x", keys: ["tavern1", "name The Gilded Stag"] },
          { id: "m", title: "y", keys: ["name Nowhere"] },
        ],
      },
    ],
    { zones, names: {}, groups: [], name: "", characters: [] },
  );
  assert.deepEqual(Object.values(named), ["The Gilded Stag"], "only an entry about a place names it");
  const byCard = matchLore(
    [{ id: "cards", entries: [{ id: "c-z", title: "Zoey", keys: ["female"], byTitle: true }] }],
    {
      zones,
      names: {},
      groups,
      name: "W",
      characters: [{ id: "c-z", name: "Zoey" }],
    },
  );
  assert.equal(byCard["character:c-z"].length, 1, "what the AI read in a card is that character's");
}

console.log("wanderworld places regression: OK");
