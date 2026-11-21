// Conditions on the player, and death saving throws (conditions.js). Run: node tests/wanderworld-conditions.regression.mjs
import assert from "node:assert/strict";
import {
  CONDITIONS,
  CRIT_REACH,
  afflict,
  conditionChips,
  conditionFor,
  conditionMods,
  critsClose,
  deathBlow,
  deathSave,
  failsSave,
  hurtConditions,
  lift,
  tickConditions,
} from "../packages/wanderworld/src/conditions.js";
import {
  castAtWords,
  foeStrike,
  playerStrike,
  rollWords,
  saveSum,
  savingThrow,
  spellAtPlayer,
  spellIn,
  spellStrike,
  spellWords,
} from "../packages/wanderworld/src/combat.js";
import { attackRoll, checkSheet } from "../packages/wanderworld/src/sheet.js";

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

// The SRD's paralyzed and unconscious (asleep here), review L-09: Strength and Dexterity saves fail without a
// roll, and a hit from within 1.5 m is a critical hit. Stunned fails those saves, but isn't struck critically.
{
  const [paralyzed, asleep, stunned, prone] = ["paralyzed", "asleep", "stunned", "prone"].map((name) =>
    conditionMods(afflict({}, name)),
  );
  for (const mods of [paralyzed, asleep, stunned]) {
    assert.equal(failsSave(mods, "strength"), true);
    assert.equal(failsSave(mods, "Dexterity"), true, "as a spell's rule writes it");
    assert.equal(failsSave(mods, "constitution"), false, "only Strength and Dexterity");
  }
  assert.equal(failsSave(prone, "dexterity"), false);
  assert.equal(failsSave(conditionMods(null), "dexterity"), false);
  assert.deepEqual(
    [critsClose(paralyzed, CRIT_REACH), critsClose(asleep, 0.2), critsClose(paralyzed, CRIT_REACH + 0.1)],
    [true, true, false],
    "from within 1.5 m only",
  );
  assert.equal(critsClose(stunned, 0.2), false, "stunned isn't struck critically");
  assert.equal(critsClose(prone, 0.2), false);
  // (A creature held by a spell: foes `held` as a condition, the way main.js foeMods reads it.)
  assert.equal(conditionMods({ [conditionFor("incapacitated")]: 1 }).failsSaves, true);

  // A hit that would be plain is a critical: the dice doubled, the flat part once. A miss stays a miss.
  const plain = attackRoll({ bonus: 5, ac: 10, damage: "2d4+2" }, die(10));
  const sure = attackRoll({ bonus: 5, ac: 10, damage: "2d4+2", critHit: true }, die(10));
  assert.deepEqual([plain.crit, sure.crit, sure.sureCrit], [false, true, true]);
  assert.equal(sure.damage, 2 * (plain.damage - 2) + 2);
  assert.equal(attackRoll({ bonus: 0, ac: 30, critHit: true }, die(10)).hit, false);
  assert.ok(!attackRoll({ bonus: 0, ac: 30, critHit: true }, die(20)).sureCrit, "a natural 20 is its own critical");
  assert.match(rollWords({ ...sure, ac: 10 }), /, a critical: helpless, and struck from within 1\.5 m$/u);

  // On the player (foeStrike, spellAtPlayer), on a creature (playerStrike, spellStrike).
  const sheet = checkSheet(null);
  assert.equal(foeStrike({ foe: { attack: 5, damage: "1d6" }, sheet, critHit: true }, die(10)).crit, true);
  const wolf = { ac: 10, hp: 11, saves: { dexterity: 30 } };
  const swing = playerStrike({ sheet, foe: wolf, mods: { critHit: true } }, die(10));
  assert.deepEqual([swing.hit, swing.crit], [true, true]);
  const bolt = spellIn({ about: "Cantrip. 1d10 fire damage. Range 24." });
  assert.equal(spellStrike({ spell: bolt, foe: { ...wolf, ac: 5 }, critHit: true }, die(10)).crit, true);
  assert.equal(spellAtPlayer({ spell: bolt, sheet, critHit: true }, die(10)).crit, true);

  // A save that fails without a roll takes it all, however good the save.
  const thrown = savingThrow({ score: 30, bonus: 10, dc: 5, damage: "4d6", onSave: "half", fails: true }, die(10));
  assert.deepEqual([thrown.saved, thrown.fails, thrown.roll, thrown.damage], [false, true, 0, 12]);
  assert.equal(saveSum(thrown), "failed without a roll");
  const fireball = spellIn({ about: "Level 3. 3 mana. 8d6 fire damage. Dexterity save for half. Range 30." });
  const caught = spellStrike({ spell: fireball, foe: wolf, fails: true }, die(10));
  assert.deepEqual([caught.saved, caught.damage], [false, 24], "a +30 Dexterity save fails, paralyzed");
  assert.equal(spellStrike({ spell: fireball, foe: wolf }, die(10)).saved, true, "and is made otherwise");
  assert.match(
    spellWords({ who: "Zoey", name: "Fireball", what: "wolf", spell: fireball, result: caught, left: 0, max: 11 }),
    /its dexterity save: failed without a roll against DC/u,
  );
  const atPlayer = spellAtPlayer({ spell: fireball, sheet, saveBonus: 30, fails: true }, die(10));
  assert.equal(atPlayer.saved, false);
  assert.match(
    castAtWords({ name: "The mage", spell: "Fireball", who: "Zoey", result: atPlayer, left: 1, max: 30 }),
    /Zoey's saving throw: failed without a roll against DC/u,
  );
}

console.log("ok: conditions and death saves");
