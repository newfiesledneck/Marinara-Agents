// Fighting by the rules (packages/wanderworld/src/combat.js): what a weapon is, what a creature is in a
// fight, attack rolls both ways, saving throws, a hurt creature's nerve, and how a blow is told.
import assert from "node:assert/strict";
import {
  armourOf,
  foeNerve,
  foeOf,
  foeStrike,
  foeWords,
  mean,
  playerStrike,
  savingThrow,
  strikeWords,
  weaponIn,
  weaponOf,
} from "../packages/wanderworld/src/combat.js";
import { changeSheet, checkSheet } from "../packages/wanderworld/src/sheet.js";
import { PACK } from "../packages/wanderworld/src/pack.js";

/** Dice that come up as told: each number is the face wanted on a die of `sides`. */
const dice = (...faces) => {
  let i = 0;
  return () => {
    const [face, sides] = faces[i++ % faces.length];
    return (face - 0.5) / sides;
  };
};

// A weapon is an item whose description gives its damage.
assert.deepEqual(
  weaponIn({ name: "Iron axe", description: "A forged head. Tool: chops wood. Weapon: 1d8 damage, +1 to attack." }),
  { name: "Iron axe", damage: "1d8", attack: 1, held: "axe" },
);
assert.deepEqual(weaponIn({ name: "Short sword", description: "Weapon: 1d6 + 1 damage." }), {
  name: "Short sword",
  damage: "1d6+1",
  attack: 0,
  held: "sword",
});
assert.equal(weaponIn({ name: "Fishing rod", description: "Tool: catches fish." }), null);
assert.equal(weaponIn({ name: "Health potion", description: "+15 HP when drunk." }), null);
assert.equal(mean("2d6+1"), 8);

// What's equipped comes first; else the best carried; else bare hands.
const axe = { name: "Stone axe", description: "Weapon: 1d6 damage.", location: "bag" };
const sword = { name: "Long sword", description: "Weapon: 1d10 damage.", location: "bag" };
const knife = { name: "Knife", description: "Weapon: 1d4 damage.", location: "equipped:hand" };
assert.equal(weaponOf([axe, sword]).name, "Long sword");
assert.equal(weaponOf([axe, sword, knife]).name, "Knife", "the one in the hand, though a better is carried");
assert.deepEqual(weaponOf([]), { name: "", damage: "1d2", attack: 0, held: null });
assert.equal(weaponOf(null).damage, "1d2");

// A creature in a fight: the pack's numbers, more HP and a harder hit for a bigger one.
const wolf = foeOf("wolf", PACK.foes);
assert.deepEqual([wolf.hp, wolf.ac, wolf.attack, wolf.damage, wolf.damageBonus], [11, 13, 4, "2d4", 0]);
const big = foeOf("wolf", PACK.foes, 1.5);
assert.deepEqual([big.hp, big.damageBonus, big.xp], [17, 1, 23]);
assert.equal(foeOf("unheard-of", PACK.foes).hp, PACK.foes.default.hp, "a kind not listed is the default");
for (const [kind, foe] of Object.entries(PACK.foes)) {
  assert.ok(foe.hp > 0 && foe.ac >= 5 && foe.ac <= 20 && foe.verb, `${kind} has its numbers`);
  assert.ok(mean(foe.damage) > 0, `${kind}'s damage is dice`);
}

// The player's swing: Strength's modifier and the weapon's bonus on the roll, against the creature's AC.
let sheet = changeSheet(checkSheet(null), { set: "strength", field: "value", value: 14 }); // +2
const iron = weaponIn({ name: "Iron axe", description: "Weapon: 1d8 damage, +1 to attack." });
// 10 on the die +2 +1 = 13 against AC 13: a hit; a 5 on the d8, +2 for Strength.
assert.deepEqual(playerStrike({ sheet, weapon: iron, foe: wolf }, dice([10, 20], [5, 8])), {
  roll: 10,
  total: 13,
  hit: true,
  crit: false,
  damage: 7,
  ac: 13,
});
assert.equal(playerStrike({ sheet, weapon: iron, foe: wolf }, dice([9, 20])).hit, false, "under the AC misses");
// A 20 on the die: the damage dice twice.
const crit = playerStrike({ sheet, weapon: iron, foe: { ...wolf, ac: 30 } }, dice([20, 20], [5, 8], [3, 8]));
assert.deepEqual([crit.hit, crit.crit, crit.damage], [true, true, 10]);
assert.equal(playerStrike({ sheet, weapon: iron, foe: { ...wolf, ac: 2 } }, dice([1, 20])).hit, false, "a 1 misses");
// What's worn counts: "+2 to attack" on a ring.
assert.equal(playerStrike({ sheet, worn: { attack: 2 }, weapon: iron, foe: wolf }, dice([8, 20], [1, 8])).hit, true);

// A creature's attack, against the sheet's AC and what's worn.
assert.equal(armourOf(sheet, { ac: 2 }), 12);
const bite = foeStrike({ foe: wolf, sheet }, dice([6, 20], [2, 4], [3, 4])); // 6 + 4 = 10 against AC 10
assert.deepEqual([bite.hit, bite.damage, bite.ac], [true, 5, 10]);
assert.equal(foeStrike({ foe: wolf, sheet, worn: { ac: 2 } }, dice([6, 20])).hit, false, "armour turns it");

// Blocking: the attack is rolled twice and the worse roll for the creature counts.
const guarded = foeStrike({ foe: wolf, sheet, guarded: true }, dice([15, 20], [2, 4], [3, 4], [3, 20]));
assert.deepEqual([guarded.roll, guarded.hit, guarded.guarded], [3, false, true]);
assert.match(
  foeWords({ who: "Zoey", what: "wolf", verb: "snaps", result: guarded, left: 20, max: 20 }),
  /\(7 against AC 10, blocked\): a miss\.$/u,
);

// A saving throw: all of it on a failure; half, or none, on a save.
assert.deepEqual(savingThrow({ score: 14, dc: 13, damage: "2d6" }, dice([10, 20], [4, 6], [5, 6])), {
  roll: 10,
  total: 12,
  saved: false,
  damage: 9,
});
assert.equal(savingThrow({ score: 14, dc: 12, damage: "2d6" }, dice([10, 20], [4, 6], [5, 6])).damage, 4);
assert.equal(savingThrow({ score: 14, dc: 12, damage: 9, onSave: "none" }, dice([10, 20])).damage, 0);

// A hurt creature may run when it has a third of its HP or less; never before.
assert.equal(
  foeNerve(6, 11, () => 0),
  "fight",
);
assert.equal(
  foeNerve(3, 11, () => 0),
  "flee",
);
assert.equal(
  foeNerve(3, 11, () => 0.99),
  "fight",
);
assert.equal(
  foeNerve(0, 11, () => 0),
  "fight",
  "one that's down isn't asked",
);

// How it's told.
assert.equal(
  strikeWords({
    who: "Zoey",
    what: "wolf",
    weapon: iron,
    result: { roll: 10, total: 13, hit: true, crit: false, damage: 7, ac: 13 },
    left: 4,
    max: 11,
  }),
  "Zoey swings the iron axe at the wolf (13 against AC 13): a hit, for 7. It has 4 of 11 HP left.",
);
assert.equal(
  strikeWords({
    who: "Zoey",
    what: "wolf",
    weapon: weaponOf([]),
    result: { roll: 20, total: 22, hit: true, crit: true, damage: 4, ac: 13 },
    left: 0,
    max: 11,
  }),
  "Zoey strikes at the wolf (a 20 on the die): a critical hit, for 4. The wolf goes down.",
);
assert.equal(
  foeWords({
    who: "Zoey",
    what: "wolf",
    verb: "snaps",
    result: { roll: 3, total: 7, hit: false, crit: false, damage: 0, ac: 10 },
    left: 20,
    max: 20,
  }),
  "The wolf snaps at Zoey (7 against AC 10): a miss.",
);
assert.match(
  foeWords({
    who: "Zoey",
    what: "wolf",
    verb: "snaps",
    result: { roll: 12, total: 16, hit: true, crit: false, damage: 5, ac: 10 },
    left: 15,
    max: 20,
  }),
  /a hit, for 5\. Zoey has 15 of 20 HP\.$/u,
);

// A blow on someone with a name is told by their name.
assert.equal(
  strikeWords({
    who: "Zoey",
    what: "Mira",
    named: true,
    weapon: iron,
    result: { roll: 12, total: 15, hit: true, crit: false, damage: 4, ac: 10 },
    left: 6,
    max: 10,
  }),
  "Zoey swings the iron axe at Mira (15 against AC 10): a hit, for 4. Mira has 6 of 10 HP left.",
);
assert.equal(foeOf("person", PACK.foes).hp, 10);

// Spells: a description is its rule.
{
  const { spellIn, spellStrike, spellWords } = await import("../packages/wanderworld/src/combat.js");
  assert.deepEqual(spellIn({ about: "A dart of flame. 2 mana. 1d10 fire damage." }), {
    cost: 2,
    damage: "1d10",
    heal: 0,
    save: null,
    effect: null,
  });
  const frost = spellIn({ about: "3 mana. 2d6 cold damage. Dexterity save for half." });
  assert.deepEqual([frost.damage, frost.save], ["2d6", { attribute: "dexterity", onSave: "half" }]);
  const daze = spellIn({ about: "2 mana. Wisdom save or stunned 6 seconds." });
  assert.deepEqual([daze.save.onSave, daze.effect], ["none", { name: "stunned", seconds: 6 }]);
  assert.equal(spellIn({ about: "Knits a wound. 3 mana. +8 HP." }).heal, 8);
  assert.equal(spellIn({ about: "Makes a small light." }), null, "a spell that's only words");
  for (const spell of PACK.spells) assert.ok(spellIn(spell), `${spell.name} does something by rule`);
  const mage = changeSheet(checkSheet(null), { set: "intelligence", field: "value", value: 16 }); // +3
  // A spell attack: 9 + 2 + 3 = 14 against AC 13.
  const hit = spellStrike({ sheet: mage, spell: spellIn(PACK.spells[0]), foe: wolf }, dice([9, 20], [7, 10]));
  assert.deepEqual([hit.hit, hit.total, hit.against, hit.damage], [true, 14, "AC 13", 7]);
  // A saving throw against DC 13: the wolf's 10 + 2 falls short and takes it all; 11 + 2 saves for half.
  const failed = spellStrike({ sheet: mage, spell: frost, foe: wolf }, dice([10, 20], [4, 6], [5, 6]));
  assert.deepEqual([failed.saved, failed.against, failed.damage], [false, "DC 13", 9]);
  const saved = spellStrike({ sheet: mage, spell: frost, foe: wolf }, dice([11, 20], [4, 6], [5, 6]));
  assert.deepEqual([saved.saved, saved.damage], [true, 4]);
  // An effect lands only on a failed save.
  assert.deepEqual(spellStrike({ sheet: mage, spell: daze, foe: wolf }, dice([3, 20])).effect, {
    name: "stunned",
    seconds: 6,
  });
  assert.equal(spellStrike({ sheet: mage, spell: daze, foe: wolf }, dice([19, 20])).effect, null);
  assert.equal(
    spellWords({ who: "Zoey", name: "Frost burst", what: "wolf", spell: frost, result: saved, left: 7, max: 11 }),
    "Zoey casts Frost burst at the wolf (its dexterity save: 13 against DC 13): it saves, for 4. It has 7 of 11 HP left.",
  );
}

// A herd's creature takes blows: HP kept, roused by a miss, down at 0, and out of the reckoning after.
{
  const { createHerd } = await import("../packages/wanderworld/src/herd.js");
  const herd = createHerd();
  assert.equal(herd.strike("nobody", 3, 10), null, "nothing to strike in no world");
  assert.deepEqual(herd.foes({ x: 0, z: 0 }, 5), []);
}

// What's had from the beaten: the pack's list for its kind, by chance and by number.
{
  const { spoilsOf, spoilsWords } = await import("../packages/wanderworld/src/combat.js");
  const wolfSpoils = spoilsOf("wolf", PACK.spoils, () => 0.99);
  assert.deepEqual(
    wolfSpoils.items.map((item) => [item.name, item.quantity]),
    [
      ["Wolf pelt", 1],
      ["Wolf meat", 2],
    ],
  );
  assert.equal(spoilsWords(wolfSpoils, "Coins"), "wolf pelt and 2 × wolf meat");
  const bandit = spoilsOf("bandit", PACK.spoils, () => 0);
  assert.deepEqual([bandit.items.map((item) => item.name), bandit.coins], [["Knife"], 2]);
  assert.equal(spoilsOf("bandit", PACK.spoils, () => 0.99).items.length, 0, "what's only there by chance");
  assert.deepEqual(spoilsOf("unheard-of", PACK.spoils), { items: [], coins: 0 });
  assert.equal(spoilsWords({ items: [], coins: 0 }, "Coins"), "nothing of use");
  assert.equal(spoilsWords({ items: [], coins: 7 }, "Coins"), "7 coins");
  for (const [kind, spoils] of Object.entries(PACK.spoils))
    for (const item of spoils.items ?? [])
      assert.ok(item.name && item.description, `${kind}'s ${item.name} is named and described`);
}

console.log("ok: fighting by the rules");
