// Gathering (packages/wanderworld/src/gather.js): where each kind can be done, the roll, and spots that
// take days to give again. And that the setting pack has something to find for every kind.
import assert from "node:assert/strict";
import {
  gatherHere,
  gatherRoll,
  GATHER_KINDS,
  spotKey,
  spotReady,
  spotUsed,
} from "../packages/wanderworld/src/gather.js";
import { PACK } from "../packages/wanderworld/src/pack.js";

// Where: water for fishing, the woods for chopping and (not in winter) foraging, rock for mining, a farm
// in summer and fall for harvesting; nothing indoors.
assert.deepEqual(gatherHere({ zone: "forest", season: "summer" }), ["chop", "forage"]);
assert.deepEqual(gatherHere({ zone: "forest", season: "winter", water: true }), ["fish", "chop"]);
assert.deepEqual(gatherHere({ zone: "meadow", season: "" }), ["forage"]);
assert.deepEqual(gatherHere({ zone: "forest", beside: ["mountains"], season: "fall" }), ["chop", "forage", "mine"]);
assert.deepEqual(gatherHere({ zone: "cave", season: "" }), ["mine"]);
assert.deepEqual(gatherHere({ zone: "outpost", outpost: "farm", season: "fall" }), ["harvest"]);
assert.deepEqual(gatherHere({ zone: "outpost", outpost: "farm", season: "spring" }), []);
assert.deepEqual(gatherHere({ zone: "street", season: "" }), []);
assert.deepEqual(gatherHere({ zone: "forest", water: true, indoors: true }), []);

// The pack has a button's worth for every kind, and words for each outcome.
for (const kind of Object.keys(GATHER_KINDS)) {
  const all = PACK.gather[kind];
  const lists = Array.isArray(all) ? [all] : Object.values(all);
  assert.ok(
    lists.length && lists.every((list) => list.length && list.every((item) => item.name)),
    `${kind} has things to find`,
  );
  for (const outcome of ["found", "none", "spent"]) assert.ok(PACK.gather.lines[kind][outcome], `${kind}: ${outcome}`);
}

// The roll: under 8 nothing, from 18 two; the attribute's modifier counts; foraging follows the season.
const lists = {
  fish: [{ name: "Trout", description: "+4 HP" }, { name: "Pike" }],
  forage: { spring: [{ name: "Wild garlic" }], summer: [{ name: "Berries" }] },
};
assert.deepEqual(
  gatherRoll("fish", 10, lists, "", () => 0),
  { roll: 1, total: 1, found: null },
);
assert.deepEqual(gatherRoll("fish", 10, lists, "", () => 0.5).found, {
  name: "Trout",
  description: "+4 HP",
  quantity: 1,
});
assert.equal(gatherRoll("fish", 10, lists, "", () => 0.999).found.quantity, 2);
assert.equal(gatherRoll("fish", 10, lists, "", () => 0.999).found.name, "Pike", "the later ones are rarer");
assert.equal(gatherRoll("fish", 18, lists, "", () => 0.3).total, 11, "7 on the die, +4");
assert.equal(gatherRoll("fish", 4, lists, "", () => 0.45).found, null, "10 on the die, -3");
assert.equal(gatherRoll("forage", 10, lists, "spring", () => 0.5).found.name, "Wild garlic");
assert.equal(gatherRoll("forage", 10, lists, "", () => 0.5).found.name, "Berries", "no season is summer's");
assert.equal(gatherRoll("mine", 10, lists, "", () => 0.9).found, null, "nothing listed, nothing found");

// A spot is ten metres square and takes its days to give again.
assert.equal(spotKey("fish", 12.3, -4), "fish:1:-1");
let used = spotUsed({}, "fish:1:-1", 5);
assert.deepEqual(
  [spotReady(used, "fish:1:-1", 5, 1), spotReady(used, "fish:1:-1", 6, 1), spotReady(used, "chop:1:-1", 5, 1)],
  [false, true, true],
);
assert.equal(spotReady(used, "fish:1:-1", 5, 0), true, "with no regrowing time it always gives");
for (let i = 0; i < 320; i++) used = spotUsed(used, `chop:${i}:0`, 10 + i);
assert.ok(Object.keys(used).length === 300 && !("fish:1:-1" in used), "the oldest are forgotten");

console.log("ok: gathering");
