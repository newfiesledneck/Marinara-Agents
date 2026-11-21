// Wanderworld factions and regions with a purpose (factions.js): standing in words, how it moves (a little
// at a time, never when locked, a little against a faction's enemies), what it changes (prices, talk,
// guards), and regions made for a purpose (the same every time, lore's kept, their entrances on dry open
// ground). Run: node tests/wanderworld-factions.regression.mjs
import assert from "node:assert/strict";
import {
  checkPurposes,
  checkStanding,
  enemiesOf,
  factionsView,
  guardFaction,
  isHostile,
  knownRegions,
  landscapeForPurpose,
  moveStanding,
  priceFactor,
  purposeAhead,
  purposeSpawns,
  readRegion,
  regionCells,
  seededPurpose,
  setStanding,
  standingOf,
  standingSentence,
  standingWord,
  STANDING,
  willTalk,
} from "../packages/wanderworld/src/factions.js";
import { readKeyword, structureFromKeywords } from "../packages/wanderworld/src/keywords.js";
import { checkWorld } from "../packages/wanderworld/src/saves.js";
import { landscapeWith } from "../packages/wanderworld/src/land.js";
import { createWorld, heightAt, waterAt } from "../packages/wanderworld/src/world.js";
import { buildZones } from "../packages/wanderworld/src/zones.js";
import { priceAfter } from "../packages/wanderworld/src/vendor.js";

// ── Standing in words, at each boundary ──
for (const [value, word] of [
  [-100, "Hated"],
  [-75, "Hated"],
  [-74, "Hostile"],
  [-40, "Hostile"],
  [-39, "Wary"],
  [-10, "Wary"],
  [-9, "Neutral"],
  [0, "Neutral"],
  [9, "Neutral"],
  [10, "Liked"],
  [39, "Liked"],
  [40, "Trusted"],
  [74, "Trusted"],
  [75, "Honoured"],
  [100, "Honoured"],
  [250, "Honoured"],
])
  assert.equal(standingWord(value), word, `${value} is ${word}`);
assert.ok(isHostile(-40) && !isHostile(-39), "Hostile starts at −40");
assert.ok(!willTalk(-40) && willTalk(-39), "and so does not talking");

// ── It moves gradually: no more than the day's limit in a day, then again the next ──
let standing = {};
for (let i = 0; i < 20; i++) standing = moveStanding(standing, "faction:guild", 3, { day: 1 }).standing;
assert.equal(standingOf(standing, "faction:guild"), STANDING.DAY_CAP, "a day of good deeds is only so much");
standing = moveStanding(standing, "faction:guild", 3, { day: 2 }).standing;
assert.equal(standingOf(standing, "faction:guild"), STANDING.DAY_CAP + 3, "the next day it moves again");
// Trading counts once a day.
let traded = moveStanding({}, "faction:guild", 1, { day: 4, once: "trade" }).standing;
traded = moveStanding(traded, "faction:guild", 1, { day: 4, once: "trade" }).standing;
assert.equal(standingOf(traded, "faction:guild"), 1, "two sales in a day are one step");
traded = moveStanding(traded, "faction:guild", 1, { day: 5, once: "trade" }).standing;
assert.equal(standingOf(traded, "faction:guild"), 2);
// A quest's reward is counted in full.
const rewarded = moveStanding({}, "faction:guild", 30, { day: 1, cap: Infinity });
assert.equal(standingOf(rewarded.standing, "faction:guild"), 30);
assert.deepEqual(rewarded.changes, [{ id: "faction:guild", from: 0, to: 30, crossed: true }], "Neutral to Liked");
assert.equal(standingOf(moveStanding({}, "x", 500, { cap: Infinity }).standing, "x"), 100, "never past 100");

// ── Set by hand it moves on from there; locked, it holds ──
let held = setStanding({}, "faction:guild", -60, true);
assert.equal(standingOf(held, "faction:guild"), -60);
for (const delta of [5, -5, 50]) held = moveStanding(held, "faction:guild", delta, { day: 3, cap: Infinity }).standing;
assert.equal(standingOf(held, "faction:guild"), -60, "a locked standing never moves");
held = setStanding(held, "faction:guild", -60, false);
held = moveStanding(held, "faction:guild", 5, { day: 3 }).standing;
assert.equal(standingOf(held, "faction:guild"), -55, "unlocked, it moves on from where it was set");
// Saved and read back.
assert.deepEqual(checkStanding(JSON.parse(JSON.stringify(held))), held);
assert.deepEqual(checkStanding({ x: { value: 900, locked: "yes" } }).x, {
  value: 100,
  locked: false,
  day: 0,
  moved: 0,
  once: {},
});

// ── Enmity: from lore, either way round; helping one costs a little with the other ──
const zones = { byId: new Map(), zones: [] };
const lore = structureFromKeywords(
  [
    {
      id: "b",
      entries: [
        { id: "g", title: "The Guild", keys: ["faction Thieves Guild", "enemy of The Crown", "region east"] },
        { id: "c", title: "The Crown", keys: ["faction The Crown", "region far north:stronghold"] },
        { id: "r", title: "Old ruin", keys: ["region west:ruin"] },
        { id: "q", title: "Nothing", keys: ["region south"] }, // no faction and no purpose: nothing
      ],
    },
  ],
  { zones, names: {}, groups: [], name: "", characters: [] },
);
const guild = lore.factions.find((faction) => faction.name === "Thieves Guild");
assert.deepEqual(guild.enemies, ["faction:crown"], "ww:enemy of: on a faction's entry");
assert.deepEqual(enemiesOf(lore.factions, "faction:crown"), [guild.id], "enemies both ways");
const helped = moveStanding({}, guild.id, 9, { day: 1, enemies: enemiesOf(lore.factions, guild.id) });
assert.equal(standingOf(helped.standing, guild.id), 9);
assert.equal(standingOf(helped.standing, "faction:crown"), -3, "helping the Guild costs a third with the Crown");
const hurt = moveStanding({}, guild.id, -9, { day: 1, enemies: ["faction:crown"] });
assert.equal(standingOf(hurt.standing, "faction:crown"), 0, "hurting one doesn't move the other");
const lockedEnemy = setStanding({}, "faction:crown", 20, true);
assert.equal(
  standingOf(moveStanding(lockedEnemy, guild.id, 9, { enemies: ["faction:crown"] }).standing, "faction:crown"),
  20,
  "a locked enemy holds too",
);

// ── Prices at a faction's vendors ──
assert.equal(priceFactor(0), 1);
assert.equal(priceFactor(-100), 1.2, "a fifth more when Hated");
assert.equal(priceFactor(100), 0.8, "a fifth off when Honoured");
assert.equal(priceFactor(-50), 1.1);
assert.equal(priceAfter(50, 1 * priceFactor(100)), 40, "on top of haggling's factor");
assert.ok(priceFactor(30) < 1 && priceFactor(-30) > 1);

// ── Guards: tame till the faction is Hostile, then they fight on sight ──
const layout = { plaza: { x: 0, z: 0 }, outposts: [{ kind: "watchtower", x: 90, z: 4 }] };
const land = { kind: "faction", faction: guild.id, from: "lore" };
const at = (value, fight = true) => purposeSpawns(land, layout, value, fight).map((entry) => entry.temper);
assert.deepEqual(at(0), ["tame", "tame"], "the town's guards and the tower's");
assert.deepEqual(at(-39), ["tame", "tame"], "Wary is not yet a fight");
assert.deepEqual(at(-40), ["hostile", "hostile"], "Hostile: they fight on sight");
assert.deepEqual(at(-90, false), ["tame", "tame"], "unless guards fighting is switched off");
const [townGuard] = purposeSpawns(land, layout, 0);
assert.equal(guardFaction(`lore:${townGuard.id}:2`), guild.id, "a guard is known by its herd id");
assert.equal(guardFaction("lore:place:0:wolf:1"), "");
const bandits = purposeSpawns(
  { kind: "stronghold", faction: "" },
  { outposts: [{ kind: "cave", deep: "stronghold", x: 1, z: 2 }] },
);
assert.deepEqual(
  bandits.map((entry) => [entry.kind, entry.temper, entry.count]),
  [["bandit", "hostile", 4]],
  "bandits at a stronghold's gate, always hostile",
);
assert.match(standingSentence("Mira", "the Thieves Guild", -50, "Ash"), /regard Ash as hostile/u, "the AI's sentence");

// ── Regions with a purpose: from lore, kept; from the seed, the same every time ──
assert.deepEqual(readRegion("east"), { key: "1,0", kind: "" });
assert.deepEqual(readRegion("far north:stronghold"), { key: "0,-2", kind: "stronghold" });
assert.deepEqual(readRegion("north-east:caves"), { key: "1,-1", kind: "caves" });
assert.deepEqual(readRegion("west 3:ruins"), { key: "-3,0", kind: "ruin" });
assert.ok(readRegion("up").problem && readRegion("east:castle").problem && readRegion("north south").problem);
assert.equal(readKeyword("ww:region:east").problem, "");
assert.match(readKeyword("ww:region:sideways").problem, /isn't a way/u);
assert.deepEqual(lore.purposes, {
  "1,0": { kind: "faction", faction: guild.id },
  "0,-2": { kind: "stronghold", faction: "faction:crown" },
  "-1,0": { kind: "ruin", faction: "" },
});
// Kept in the save, and lore given first wins over the seed.
const saved = checkWorld({
  id: "w",
  seed: "s",
  purposes: {
    ...Object.fromEntries(Object.entries(lore.purposes).map(([k, p]) => [k, { ...p, from: "lore" }])),
    "0,0": { kind: "town" },
    "2,0": { kind: "castle" },
  },
  standing: held,
});
assert.deepEqual(Object.keys(saved.purposes).sort(), ["-1,0", "0,-2", "1,0"], "home and unknown purposes dropped");
assert.equal(saved.purposes["1,0"].from, "lore");
assert.deepEqual(saved.standing, held, "standing is kept with the world");
const purposes = { ...saved.purposes };
purposes["1,0"] ??= seededPurpose("s", "1,0", lore.factions, purposes);
assert.equal(purposes["1,0"].from, "lore", "a purpose given by lore is never replaced");
assert.deepEqual(checkPurposes(JSON.parse(JSON.stringify(purposes))), purposes);
// The seed's are the same every time, varied across the map, and a faction's land goes to one with none.
const keys = Array.from({ length: 40 }, (_, i) => `${(i % 7) - 3},${Math.floor(i / 7) - 3}`).filter((k) => k !== "0,0");
const seeded = keys.map((key) => seededPurpose("world-a", key, lore.factions, {}));
assert.deepEqual(
  keys.map((key) => seededPurpose("world-a", key, lore.factions, {})),
  seeded,
  "the same world makes the same purposes",
);
assert.ok(seeded.some((p) => p === null) && new Set(seeded.filter(Boolean).map((p) => p.kind)).size >= 4, "varied");
assert.ok(seeded.filter((p) => p?.kind === "faction").every((p) => lore.factions.some((f) => f.id === p.faction)));
const allLanded = { a: { kind: "faction", faction: guild.id }, b: { kind: "faction", faction: "faction:crown" } };
assert.ok(
  keys.every((key) => seededPurpose("world-a", key, lore.factions, allLanded)?.kind !== "faction"),
  "no faction gets a second land from the seed",
);
// A quest's call: the next region that way not made yet.
const ahead = purposeAhead({ "2,0": land }, { "1,0": {} }, "0,0", "east", "stronghold");
assert.equal(ahead.key, "3,0", "past the one made and the one given");
assert.equal(ahead.purposes["3,0"].from, "quest");
assert.equal(purposeAhead({}, {}, "0,0", "east", "faction"), null, "a faction's land needs its faction");
assert.deepEqual(
  knownRegions({ "1,0": {} }, { "0,-2": { kind: "ruin", from: "lore" }, "5,5": { kind: "town", from: "seed" } }, "1,0")
    .map((cell) => [cell.key, cell.visited])
    .sort(),
  [
    ["0,-2", false],
    ["0,0", true],
    ["1,0", true],
  ],
  "known: where you've been, and what lore told of",
);

// ── What the Journal shows ──
const shown = factionsView(
  {
    factions: lore.factions,
    standing: setStanding({}, guild.id, -50, true),
    purposes: { "1,0": land },
    regions: { "1,0": {} },
    region: "1,0",
  },
  { factionPrices: true, factionTalk: true, factionGuards: true, factionLand: true },
  { regionName: (key) => (key === "1,0" ? "Kestrel Heath" : "Home") },
);
const guildShown = shown.list.find((entry) => entry.id === guild.id);
assert.equal(guildShown.word, "Hostile");
assert.ok(guildShown.locked);
assert.ok(guildShown.lines.includes("Their land: Kestrel Heath."));
assert.ok(guildShown.lines.includes("Enemies: The Crown."));
assert.match(guildShown.lines.at(-1), /prices up 10%; their people won't talk to you; their guards fight you/u);
assert.deepEqual(shown.regions, ["Home: where you began", "Kestrel Heath: Thieves Guild's land"]);
assert.equal(regionCells({ regions: { "1,0": {} }, purposes: { "1,0": land }, region: "1,0" })[1].mark, "");
assert.equal(
  regionCells({ regions: {}, purposes: { "0,-1": { kind: "caves", faction: "", from: "lore" } }, region: "0,0" })[1]
    .mark,
  "C",
);

// ── Landscapes for a purpose: the same every time, with entrances on dry open ground ──
const deepOf = (layout) => layout.outposts.filter((outpost) => outpost.deep).map((outpost) => outpost.deep);
const wanted = { stronghold: ["stronghold"], ruin: ["dungeon"], caves: ["cave", "cavern", "cave"] };
for (const seed of [11, 205, 3077]) {
  const base = landscapeWith(seed, {});
  base.mountains = base.mountains.filter((side) => side !== "west");
  for (const kind of ["faction", "stronghold", "outposts", "town", "hamlets", "ruin", "caves"]) {
    const purpose = { kind, faction: kind === "faction" ? guild.id : "" };
    const made = landscapeForPurpose(base, purpose, seed, "west");
    assert.deepEqual(landscapeForPurpose(base, purpose, seed, "west"), made, `${kind}: the same every time`);
    assert.ok(!made.mountains.includes("west"), `${kind}: no mountains where you arrive`);
    if (kind === "faction") assert.ok(made.settlement.walls && ["town", "city"].includes(made.settlement.kind));
    if (kind === "hamlets") assert.ok(made.outposts.filter((entry) => entry.kind === "hamlet").length >= 2);
    if (kind === "outposts") assert.equal(made.outposts.filter((entry) => entry.kind === "watchtower").length, 3);
    if (!wanted[kind]) continue;
    const world = createWorld(seed, made);
    assert.deepEqual(
      deepOf(world.layout).sort(),
      [...wanted[kind]].sort(),
      `${kind}: its entrances, and where they lead`,
    );
    for (const cave of world.caves.filter((entry) => entry.deep)) {
      assert.ok(waterAt(cave.x, cave.z).depth <= 0, `${kind} (${seed}): a ${cave.deep} mouth on dry ground`);
      assert.ok(!world.blocked(cave.x, cave.z, 0.5), `${kind} (${seed}): with room to stand at it`);
      assert.ok(Number.isFinite(heightAt(cave.x, cave.z)), `${kind} (${seed}): on the land`);
      assert.ok(Math.max(Math.abs(cave.x), Math.abs(cave.z)) < world.layout.worldHalf - 8, "inside the region");
    }
    const zone = buildZones(world.layout, seed).zones.find((entry) => entry.deep);
    assert.ok(zone?.kind === "cave", `${kind}: the place says what it leads to`);
  }
}

console.log("wanderworld factions: ok");
