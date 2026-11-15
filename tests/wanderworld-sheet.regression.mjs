// The character sheet (packages/wanderworld/src/sheet.js): what a sheet holds, changes made by hand and
// by targeted lists, bonuses read from item descriptions, the sheet in words, and the dice.
import assert from "node:assert/strict";
import {
  applyChanges,
  attackRoll,
  bonusesIn,
  changeSheet,
  checkSheet,
  entryOf,
  gainXp,
  modifier,
  rollDice,
  sheetWords,
  useItem,
  valueOf,
  wornBonuses,
  xpNeeded,
} from "../packages/wanderworld/src/sheet.js";

// A new sheet has the built-in entries; what was saved is kept, within reason.
let sheet = checkSheet(null);
assert.deepEqual(
  sheet.entries.map((entry) => entry.id),
  ["level", "xp", "hp", "mana", "ac", "strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"],
);
assert.deepEqual([valueOf(sheet, "hp"), entryOf(sheet, "hp").max, valueOf(sheet, "ac")], [20, 20, 10]);
assert.equal(checkSheet({ entries: [{ id: "hp", value: 500, max: 30 }] }).entries[2].value, 30, "never over its most");
assert.equal(checkSheet({ entries: [{ id: "level", name: "Hacked", kind: "feat" }] }).entries[0].name, "Level");

// The player's own: any kind, named and described; no two of a name; only their own can be removed.
sheet = changeSheet(sheet, { add: { kind: "skill", name: "Fishing", about: "catching fish", value: 3 } });
sheet = changeSheet(sheet, { add: { kind: "feat", name: "Night Eyes", about: "sees in the dark" } });
sheet = changeSheet(sheet, { add: { kind: "resource", name: "Stamina", value: 5, max: 8 } });
assert.equal(changeSheet(sheet, { add: { kind: "skill", name: "fishing" } }), sheet, "no second Fishing");
assert.deepEqual(
  [entryOf(sheet, "own:fishing").value, "value" in entryOf(sheet, "own:night-eyes"), entryOf(sheet, "own:stamina").max],
  [3, false, 8],
);
assert.ok(entryOf(changeSheet(sheet, { remove: "hp" }), "hp"), "a built-in one stays");
assert.equal(entryOf(changeSheet(sheet, { remove: "own:fishing" }), "own:fishing"), null);
sheet = changeSheet(sheet, { set: "strength", field: "value", value: 14 });
assert.deepEqual([valueOf(sheet, "strength"), modifier(14), modifier(9), modifier(10)], [14, 2, -1, 0]);

// Targeted changes: by name or id, checked, clamped; unknown, switched off and numberless ones left out.
const off = changeSheet(sheet, { set: "mana", field: "on", value: false });
const changed = applyChanges(off, [
  { stat: "HP", by: -4 },
  { stat: "fishing", by: 1 },
  { stat: "Mana", by: -5 },
  { stat: "Luck", by: 3 },
  { stat: "Night Eyes", to: 2 },
  { stat: "hp", by: -100 },
]);
assert.deepEqual(
  changed.applied.map((change) => [change.name, change.from, change.to]),
  [
    ["HP", 20, 16],
    ["Fishing", 3, 4],
    ["HP", 16, 0],
  ],
);
assert.equal(valueOf(changed.sheet, "mana"), 10);

// Experience: enough of it raises the level, and what's over carries on.
assert.equal(xpNeeded(3), 300);
const grown = gainXp(sheet, 350);
assert.deepEqual([grown.levels, valueOf(grown.sheet, "level"), valueOf(grown.sheet, "xp")], [2, 3, 50]);

// Bonuses in descriptions; what's worn adds up; using something applies what it does to a resource, once.
assert.deepEqual(bonusesIn("A stout shield. +2 AC, -1 Dexterity. +2 to attack rolls and +1 damage.", sheet), [
  { stat: "ac", amount: 2 },
  { stat: "dexterity", amount: -1 },
  { stat: "attack", amount: 2 },
  { stat: "damage", amount: 1 },
]);
assert.deepEqual(bonusesIn("Costs +5 gold. A +3 mystery. Restores +2 Stamina.", sheet), [
  { stat: "own:stamina", amount: 2 },
]);
const worn = wornBonuses(sheet, [
  { description: "+2 AC", location: "equipped:offhand" },
  { description: "+1 AC, +2 to attack", location: "equipped:head" },
  { description: "+5 AC", location: "bag" },
]);
assert.deepEqual(worn, { ac: 3, attack: 2 });
const hurt = applyChanges(sheet, [{ stat: "hp", to: 5 }]).sheet;
const drunk = useItem(hurt, "A red potion. +10 HP when drunk. +2 AC");
assert.deepEqual([valueOf(drunk.sheet, "hp"), valueOf(drunk.sheet, "ac"), drunk.applied.length], [15, 10, 1]);

// In words, for a prompt: only what's on, the worn bonuses counted, the player's own with their descriptions.
const told = sheetWords(off, worn);
assert.match(told, /Level 1, XP 0\/100, AC 13 \(10, \+3 from what they wear\)\./u);
assert.match(told, /HP 20\/20, Stamina 5\/8\./u);
assert.doesNotMatch(told, /Mana/u, "what's switched off isn't told");
assert.match(told, /Strength 14 \(\+2\)/u);
assert.match(told, /\+2 to attack from what they wear\./u);
assert.match(told, /Skills: Fishing 3 \(catching fish\)\. Feats: Night Eyes \(sees in the dark\)\./u);
assert.equal(sheetWords({ entries: sheet.entries.map((entry) => ({ ...entry, on: false })) }), "");

// Dice: written as dice, rolled with whatever chance is given.
const high = () => 0.999;
const low = () => 0;
assert.deepEqual(rollDice("2d6+1", high), { total: 13, rolls: [6, 6] });
assert.deepEqual(
  [rollDice("d8", low).total, rollDice("1d4-1", low).total, rollDice("5").total, rollDice("junk").total],
  [1, 0, 5, 0],
);
assert.deepEqual(attackRoll({ bonus: 5, ac: 30, damage: "1d6", damageBonus: 2 }, high), {
  roll: 20,
  total: 25,
  hit: true,
  crit: true,
  damage: 14,
});
assert.deepEqual(attackRoll({ bonus: 50, ac: 5 }, low), { roll: 1, total: 51, hit: false, crit: false, damage: 0 });
const middling = attackRoll({ bonus: 2, ac: 12, damage: "1d4" }, () => 0.5);
assert.deepEqual([middling.roll, middling.hit, middling.damage], [11, true, 3]);

console.log("ok: the character sheet");
