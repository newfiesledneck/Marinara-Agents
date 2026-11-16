// Conditions on the player, and death saving throws (conditions.js). Run: node tests/wanderworld-conditions.regression.mjs
import assert from "node:assert/strict";
import {
  CONDITIONS,
  afflict,
  conditionChips,
  conditionFor,
  conditionMods,
  deathBlow,
  deathSave,
  hurtConditions,
  lift,
  tickConditions,
} from "../packages/wanderworld/src/conditions.js";
import { foeStrike } from "../packages/wanderworld/src/combat.js";
import { checkSheet } from "../packages/wanderworld/src/sheet.js";

// Nothing on them: nothing changes.
assert.deepEqual(conditionMods(null).names, []);
assert.equal(conditionMods({}).attackDis, false);

// One lands for its own length, or the length given; a second of the same keeps the longer.
let state = afflict({}, "poisoned");
assert.equal(state.poisoned, CONDITIONS.poisoned.seconds);
state = afflict(state, "poisoned", 5);
assert.equal(state.poisoned, CONDITIONS.poisoned.seconds, "the longer stays");
state = afflict(state, "prone");
assert.deepEqual(afflict(state, "no such thing"), state);

// What they add up to.
let mods = conditionMods(state);
assert.deepEqual(
  [mods.attackDis, mods.defendAdv, mods.still, mods.helpless],
  [true, true, true, false],
  "prone and poisoned: hampered, easy to hit, on the ground, but able to act",
);
assert.equal(conditionMods(afflict({}, "paralyzed")).helpless, true);
assert.equal(conditionMods(afflict({}, "slowed")).slow, true);
assert.deepEqual(
  [conditionMods(afflict({}, "grappled")).still, conditionMods(afflict({}, "grappled")).attackDis],
  [true, false],
  "grappled: held, but they can still swing",
);

// Time passes; what runs out is gone.
state = tickConditions(state, 2);
assert.equal(state.prone, undefined, "up again");
assert.equal(state.poisoned, CONDITIONS.poisoned.seconds - 2);
assert.deepEqual(tickConditions(state, 999), {});
assert.deepEqual(lift({ prone: 2, poisoned: 9 }, "prone"), { poisoned: 9 });

// A blow wakes a sleeper and nothing else.
assert.deepEqual(hurtConditions({ asleep: 9, poisoned: 9 }), { poisoned: 9 });

// For showing.
assert.deepEqual(
  conditionChips({ poisoned: 11.2, prone: 1.5 }).map((chip) => `${chip.label} ${chip.seconds}`),
  ["Prone 2", "Poisoned 12"],
);

// A spell's effect as a condition on the player.
assert.deepEqual(["paralyzed", "incapacitated", "charmed", "slowed", "nonsense"].map(conditionFor), [
  "paralyzed",
  "stunned",
  "",
  "slowed",
  "",
]);

// An attack with advantage is the better of two rolls; with a block as well, it's one roll.
{
  // (A 3 misses and takes no damage die; then a 17, and its damage die.)
  const rolls = [3, 17, 2];
  let i = 0;
  const random = () => (rolls[i++ % rolls.length] - 0.5) / 20;
  const sheet = checkSheet(null);
  const keen = foeStrike({ foe: { attack: 0, damage: "1d4" }, sheet, keen: true }, random);
  assert.deepEqual([keen.roll, keen.keen], [17, true]);
  i = 0;
  const both = foeStrike({ foe: { attack: 0, damage: "1d4" }, sheet, keen: true, guarded: true }, random);
  assert.equal(both.roll, 3, "advantage and a block cancel: the one roll");
}

// Death saving throws.
const die = (face) => () => (face - 0.5) / 20;
assert.deepEqual(deathSave(null, die(10)), { wins: 1, losses: 0, roll: 10, outcome: "" });
assert.deepEqual(deathSave({ wins: 2, losses: 0 }, die(15)).outcome, "stable");
assert.deepEqual(deathSave({ wins: 0, losses: 2 }, die(4)).outcome, "beaten");
assert.deepEqual(deathSave({ wins: 0, losses: 1 }, die(1)), { wins: 0, losses: 3, roll: 1, outcome: "beaten" });
assert.equal(deathSave({ wins: 0, losses: 2 }, die(20)).outcome, "up");
assert.deepEqual(deathBlow({ wins: 1, losses: 1 }), { wins: 1, losses: 2, outcome: "" });
assert.equal(deathBlow({ wins: 1, losses: 1 }, true).outcome, "beaten");

console.log("ok: conditions and death saves");
