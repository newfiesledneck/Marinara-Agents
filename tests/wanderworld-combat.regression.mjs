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

// Spells: a description is its rule; the ones offered are the SRD's.
{
  const { spellCost, spellIn, spellRule, spellStrike, spellWords, witOf } =
    await import("../packages/wanderworld/src/combat.js");
  const { SRD_CLASSES, SRD_CREDIT, SRD_SPELLS } = await import("../packages/wanderworld/src/srd.js");
  assert.equal(PACK.spells, undefined, "the setting pack has no spells of its own");
  assert.match(SRD_CREDIT, /System Reference Document 5\.1[\s\S]*CC BY 4\.0/u);
  assert.equal(Object.keys(SRD_CLASSES).length, 12);
  assert.deepEqual(SRD_CLASSES.fighter, { name: "Fighter", hitDie: 10, weapon: { name: "Longsword", damage: "1d8" } });
  const srd = (name) => SRD_SPELLS.find((spell) => spell.name === name);
  assert.equal(spellRule(srd("Fire Bolt")), "Cantrip. 1d10 fire damage. Range 24.");
  assert.equal(
    spellRule(srd("Burning Hands")),
    "Level 1. 1 mana. 3d6 fire damage. Dexterity save for half. Area 2.5. Range 5.",
  );
  assert.equal(spellRule(srd("Magic Missile")), "Level 1. 1 mana. 1d4+1 force damage. Always hits. Range 24.");
  assert.equal(spellRule(srd("Hold Person")), "Level 2. 2 mana. Wisdom save or paralyzed 12 seconds. Range 18.");
  assert.equal(spellRule(srd("Cure Wounds")), "Level 1. 1 mana. +1d8 HP.");
  assert.deepEqual([spellCost(0), spellCost(1), spellCost(3)], [0, 1, 3]);
  // Every one of them reads back as what it was written from.
  for (const spell of SRD_SPELLS) {
    const read = spellIn({ about: spellRule(spell) });
    assert.ok(read, `${spell.name} does something by rule`);
    assert.equal(read.cost, spellCost(spell.level), `${spell.name}'s mana`);
    assert.equal(read.damage, spell.damage ?? null, `${spell.name}'s damage`);
    assert.equal(read.heal, spell.heal ?? null, `${spell.name}'s healing`);
    assert.equal(read.save?.attribute, spell.save?.attribute.toLowerCase(), `${spell.name}'s save`);
    assert.equal(read.effect?.name, spell.effect, `${spell.name}'s effect`);
    assert.equal(read.sure, !!spell.sure);
    if (!spell.heal) assert.equal(read.range, spell.range, `${spell.name}'s range`);
    assert.equal(read.push, spell.push ?? 0, `${spell.name}'s push`);
    assert.equal(read.area, spell.area ?? 0, `${spell.name}'s area`);
    assert.equal(read.drain, !!spell.drain, `${spell.name}'s drain`);
    if (spell.effect) assert.ok(read.effect.kind && read.effect.seconds === spell.seconds, `${spell.name}'s effect`);
  }
  // What a spell leaves besides damage: a shove, an area, a condition on a hit, the caster mended.
  assert.equal(
    spellRule(srd("Thunderwave")),
    "Level 1. 1 mana. 2d8 thunder damage. Constitution save for half. Pushed 3 m. Area 2.5. Range 5.",
  );
  assert.equal(spellRule(srd("Ray of Frost")), "Cantrip. 1d8 cold damage. Slowed 6 seconds. Range 18.");
  assert.equal(spellRule(srd("Sleep")), "Level 1. 1 mana. Always hits. Asleep 12 seconds. Area 6. Range 24.");
  assert.match(spellRule(srd("Vampiric Touch")), /Heals the caster for half/u);
  const wave = spellIn({ about: spellRule(srd("Thunderwave")) });
  const weak = { ac: 10, attack: 0 };
  assert.equal(spellStrike({ wit: 5, spell: wave, foe: weak }, () => 0).push, 3, "a failed save is shoved back");
  assert.equal(spellStrike({ wit: 0, spell: wave, foe: weak }, () => 0.99).push, 0, "a save isn't");
  const kinds = Object.fromEntries(
    SRD_SPELLS.filter((spell) => spell.effect).map((spell) => [
      spell.effect,
      spellIn({ about: spellRule(spell) }).effect.kind,
    ]),
  );
  assert.deepEqual(
    [kinds.prone, kinds.asleep, kinds.slowed, kinds.blinded, kinds.hindered, kinds.marked, kinds.charmed, kinds.calmed],
    ["hold", "hold", "slow", "hinder", "hinder", "mark", "calm", "calm"],
  );
  const { foeStrike, rolledTwice } = await import("../packages/wanderworld/src/combat.js");
  let n = 0;
  const rolls = () => ({ roll: [3, 17][n++ % 2] });
  assert.equal(rolledTwice(rolls, true).roll, 17);
  assert.equal(rolledTwice(rolls, false).roll, 3);
  assert.equal(
    foeStrike({ foe: { attack: 0, damage: "1d4" }, sheet: checkSheet(null), hindered: true }).hindered,
    true,
    "a hindered creature's attack is rolled twice",
  );
  const fire = spellIn({ about: spellRule(srd("Fire Bolt")) });
  assert.deepEqual([fire.cost, fire.type, fire.range], [0, "fire", 24]);
  const frost = spellIn({ about: "3 mana. 2d6 cold damage. Dexterity save for half." });
  assert.deepEqual([frost.damage, frost.save, frost.range], ["2d6", { attribute: "dexterity", onSave: "half" }, 14]);
  const hold = spellIn({ about: spellRule(srd("Hold Person")) });
  assert.deepEqual(hold.effect, { name: "paralyzed", kind: "hold", seconds: 12 });
  assert.equal(spellIn({ about: "Wisdom save or frightened." }).effect.kind, "flee");
  assert.equal(spellIn({ about: "Knits a wound. 3 mana. +8 HP." }).heal, "8");
  assert.equal(spellIn({ about: "Makes a small light." }), null, "a spell that's only words");
  const mage = changeSheet(checkSheet(null), { set: "intelligence", field: "value", value: 16 });
  const wit = witOf(mage);
  assert.equal(wit, 3);
  // A spell attack: 9 + 2 + 3 = 14 against AC 13.
  const hit = spellStrike({ wit, spell: fire, foe: wolf }, dice([9, 20], [7, 10]));
  assert.deepEqual([hit.hit, hit.total, hit.against, hit.damage], [true, 14, "AC 13", 7]);
  // A saving throw against DC 13: the wolf's 10 + 2 falls short and takes it all; 11 + 2 saves for half.
  const failed = spellStrike({ wit, spell: frost, foe: wolf }, dice([10, 20], [4, 6], [5, 6]));
  assert.deepEqual([failed.saved, failed.against, failed.damage], [false, "DC 13", 9]);
  const saved = spellStrike({ wit, spell: frost, foe: wolf }, dice([11, 20], [4, 6], [5, 6]));
  assert.deepEqual([saved.saved, saved.damage], [true, 4]);
  // One that always hits just rolls its damage.
  const missile = spellStrike(
    { wit, spell: spellIn({ about: spellRule(srd("Magic Missile")) }), foe: wolf },
    dice([3, 4]),
  );
  assert.deepEqual([missile.hit, missile.sure, missile.damage], [true, true, 4]);
  // An effect lands only on a failed save.
  assert.equal(spellStrike({ wit, spell: hold, foe: wolf }, dice([3, 20])).effect.name, "paralyzed");
  assert.equal(spellStrike({ wit, spell: hold, foe: wolf }, dice([19, 20])).effect, null);
  assert.equal(
    spellWords({ who: "Zoey", name: "Frost burst", what: "wolf", spell: frost, result: saved, left: 7, max: 11 }),
    "Zoey casts Frost burst at the wolf (its dexterity save: 13 against DC 13): it saves, for 4. It has 7 of 11 HP left.",
  );
  assert.equal(
    spellWords({
      who: "Zoey",
      name: "Magic Missile",
      what: "Mira",
      named: true,
      spell: { sure: true },
      result: missile,
      left: 6,
      max: 10,
    }),
    "Zoey casts Magic Missile at Mira: it strikes home, for 4. Mira has 6 of 10 HP left.",
  );
}

// Keys the player sets: only what's changed is kept; a clash leaves the other its own key, or none.
{
  const { checkKeys, DEFAULT_KEYS, KEY_ACTIONS, keyAllowed, keyName } =
    await import("../packages/wanderworld/src/input.js");
  assert.deepEqual(checkKeys(""), DEFAULT_KEYS);
  assert.deepEqual(checkKeys("not json"), DEFAULT_KEYS);
  assert.equal(checkKeys('{"block":"h"}').block, "h");
  assert.equal(checkKeys({ block: "H" }).block, "h");
  const swapped = checkKeys({ block: "f", attack: "q" });
  assert.deepEqual([swapped.block, swapped.attack], ["f", "q"]);
  const clash = checkKeys({ block: "f" }); // F is Attack's: Block has it now, and Attack has none
  assert.deepEqual([clash.block, clash.attack], ["f", ""]);
  assert.equal(checkKeys({ block: "escape" }).block, "q", "Esc can't be given away");
  assert.equal(checkKeys({ nonsense: "k" }).nonsense, undefined);
  assert.deepEqual(
    [keyAllowed("h"), keyAllowed("arrowup"), keyAllowed("tab"), keyAllowed("")],
    [true, false, false, false],
  );
  assert.deepEqual(
    [keyName(" "), keyName("control"), keyName("h"), keyName("f5"), keyName("")],
    ["Space", "Ctrl", "H", "F5", "None"],
  );
  assert.equal(
    new Set(KEY_ACTIONS.map(([, , key]) => key)).size,
    KEY_ACTIONS.length,
    "no two actions share a key to begin with",
  );
}

// Fights by turns: initiative, and the SRD's spell slots.
{
  const { initiativeOrder, slotFor, slotsAt, spellIn, spellRule, TURN_MOVE } =
    await import("../packages/wanderworld/src/combat.js");
  const { SRD_SLOTS, SRD_SPELLS } = await import("../packages/wanderworld/src/srd.js");
  assert.equal(TURN_MOVE, 9);
  const order = initiativeOrder(
    [
      { id: "zoey", bonus: 2 },
      { id: "wolf", bonus: 2 },
      { id: "mira", bonus: 1 },
    ],
    dice([10, 20], [15, 20], [11, 20]),
  );
  assert.deepEqual(order, [
    { id: "wolf", roll: 15, total: 17 },
    { id: "zoey", roll: 10, total: 12 }, // (a tie with Mira's 11 + 1: the higher bonus goes first)
    { id: "mira", roll: 11, total: 12 },
  ]);
  assert.deepEqual(slotsAt(1, SRD_SLOTS), { 1: 2, 2: 0, 3: 0 });
  assert.deepEqual(slotsAt(3, SRD_SLOTS), { 1: 4, 2: 2, 3: 0 });
  assert.deepEqual(slotsAt(5, SRD_SLOTS), { 1: 4, 2: 3, 3: 2 });
  const slots = slotsAt(3, SRD_SLOTS);
  assert.equal(slotFor(0, slots, {}), -1, "a cantrip needs no slot");
  assert.equal(slotFor(1, slots, {}), 1);
  assert.equal(slotFor(1, slots, { 1: 4 }), 2, "a higher slot when its own are spent");
  assert.equal(slotFor(2, slots, { 2: 2 }), 0, "none left");
  assert.equal(slotFor(3, slots, {}), 0, "none of that level yet");
  const word = SRD_SPELLS.find((spell) => spell.name === "Healing Word");
  assert.equal(spellRule(word), "Level 1. 1 mana. +1d4 HP. Bonus action.");
  assert.deepEqual([spellIn({ about: spellRule(word) }).bonus, spellIn({ about: spellRule(word) }).level], [true, 1]);
  assert.equal(spellIn({ about: "Cantrip. 1d10 fire damage." }).level, 0);
  assert.equal(
    spellIn({ about: "2 mana. 1d10 fire damage." }).level,
    -1,
    "one of the player's own with no level: mana only",
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

// Someone fighting back: their blow told, and a spell at the player (their own save, or a spell attack on their AC).
{
  const { castAtWords, personWords, spellAtPlayer } = await import("../packages/wanderworld/src/combat.js");
  const sheet = checkSheet(null);
  const high = () => 0.99;
  const low = () => 0;
  const bolt = { damage: "1d10", type: "fire" };
  const struck = spellAtPlayer({ wit: 2, spell: bolt, sheet }, high);
  assert.ok(struck.hit && struck.crit && struck.damage >= 2, "a 20 on a spell attack is a critical hit");
  assert.equal(spellAtPlayer({ wit: 2, spell: bolt, sheet }, low).hit, false, "a 1 misses");
  const burst = { damage: "2d6", save: { attribute: "Dexterity", onSave: "half" } };
  const saved = spellAtPlayer({ wit: 2, spell: burst, sheet }, high);
  assert.ok(saved.saved && saved.damage === 6 && saved.against === "DC 12", "a save takes half");
  const failed = spellAtPlayer({ wit: 2, spell: burst, sheet }, low);
  assert.ok(!failed.saved && failed.hit && failed.damage === 2, "a failed save takes it all");
  const none = spellAtPlayer({ spell: { damage: "1d8", save: { attribute: "Wisdom", onSave: "none" } }, sheet }, high);
  assert.ok(none.saved && !none.hit && none.damage === 0, "a save for none takes nothing");
  assert.ok(
    spellAtPlayer({ spell: { damage: "1d4+1", sure: true }, sheet }, low).damage === 2,
    "a sure one just rolls",
  );
  assert.match(
    castAtWords({ name: "Odo", spell: "Burning Hands", who: "Zoey", result: saved, left: 4, max: 10 }),
    /^Odo casts Burning Hands at Zoey \(Zoey saves, \d+ against DC 12\): half, for 6\. Zoey has 4 of 10 HP\.$/u,
  );
  assert.match(
    castAtWords({ name: "Odo", spell: "Hold", who: "Zoey", result: none, left: 4, max: 10 }),
    /nothing comes of it\.$/u,
  );
  assert.equal(
    personWords({
      name: "Mira",
      who: "Zoey",
      weapon: "Greataxe",
      result: { hit: true, crit: false, roll: 11, total: 15, ac: 12, damage: 4, guarded: true },
      left: 6,
      max: 10,
    }),
    "Mira swings a greataxe at Zoey (15 against AC 12, blocked): a hit, for 4. Zoey has 6 of 10 HP.",
  );
}

// Creatures' numbers from the SRD: each is one of the pack's kinds, and whole.
{
  const { SRD_CREATURES } = await import("../packages/wanderworld/src/srd.js");
  const { rollDice } = await import("../packages/wanderworld/src/sheet.js");
  assert.deepEqual(
    SRD_CREATURES.wolf,
    { name: "Wolf", hp: 11, ac: 13, attack: 4, damage: "2d4+2", dex: 2 },
    "a wolf is the SRD's wolf",
  );
  for (const [kind, creature] of Object.entries(SRD_CREATURES)) {
    assert.ok(PACK.foes[kind], `${kind} is one of the pack's creatures`);
    assert.ok(creature.hp >= 1 && creature.ac >= 5 && Number.isInteger(creature.attack), `${kind} has its numbers`);
    const made = foeOf(kind, { ...PACK.foes, [kind]: { ...PACK.foes[kind], ...creature } });
    assert.ok(made.verb && made.xp >= 1 && rollDice(made.damage).total >= 1, `${kind} can be fought`);
  }
  assert.ok(!SRD_CREATURES.person && !SRD_CREATURES.ally, "people keep their own numbers");
}

console.log("ok: fighting by the rules");
