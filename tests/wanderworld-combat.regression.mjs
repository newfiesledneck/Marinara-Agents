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
  { name: "Iron axe", damage: "1d8", attack: 1, held: "axe", range: 0, type: "slashing" },
);
assert.deepEqual(weaponIn({ name: "Short sword", description: "Weapon: 1d6 + 1 damage." }), {
  name: "Short sword",
  damage: "1d6+1",
  attack: 0,
  held: "sword",
  range: 0,
  type: "piercing",
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
assert.deepEqual(weaponOf([]), { name: "", damage: "1d2", attack: 0, held: null, type: "bludgeoning" });
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
  how: "",
  type: "slashing",
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
  {
    const { name, hitDie, weapon, ranged, saves } = SRD_CLASSES.fighter;
    assert.deepEqual(
      { name, hitDie, weapon, ranged, saves },
      {
        name: "Fighter",
        hitDie: 10,
        weapon: { name: "Longsword", damage: "1d8" },
        ranged: { name: "Light crossbow", damage: "1d8", range: 24 },
        saves: ["strength", "constitution"],
      },
    );
  }
  const srd = (name) => SRD_SPELLS.find((spell) => spell.name === name);
  assert.equal(spellRule(srd("Fire Bolt")), "Cantrip. 1d10 fire damage. Grows with level. Range 24.");
  assert.equal(
    spellRule(srd("Burning Hands")),
    "Level 1. 1 mana. 3d6 fire damage. Dexterity save for half. Area 2.5 (cone). Higher: +1d6 a level. Range 5.",
  );
  assert.equal(spellRule(srd("Magic Missile")), "Level 1. 1 mana. 1d4+1 force damage. Always hits. Range 24.");
  assert.equal(
    spellRule(srd("Hold Person")),
    "Level 2. 2 mana. Wisdom save or paralyzed 12 seconds. Concentration. Range 18.",
  );
  assert.equal(spellRule(srd("Cure Wounds")), "Level 1. 1 mana. +1d8 HP. Higher: +1d8 a level.");
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
    "Level 1. 1 mana. 2d8 thunder damage. Constitution save for half. Pushed 3 m. Area 2.5 (cube). Higher: +1d8 a level. Range 5.",
  );
  assert.equal(
    spellRule(srd("Ray of Frost")),
    "Cantrip. 1d8 cold damage. Slowed 6 seconds. Grows with level. Range 18.",
  );
  assert.equal(spellRule(srd("Sleep")), "Level 1. 1 mana. Always hits. Asleep 12 seconds. Area 6 (burst). Range 24.");
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
  const first3 = (slots) => [slots[1], slots[2], slots[3]];
  assert.deepEqual(first3(slotsAt(1, SRD_SLOTS)), [2, 0, 0]);
  assert.deepEqual(first3(slotsAt(3, SRD_SLOTS)), [4, 2, 0]);
  assert.deepEqual(first3(slotsAt(5, SRD_SLOTS)), [4, 3, 2]);
  const slots = slotsAt(3, SRD_SLOTS);
  assert.equal(slotFor(0, slots, {}), -1, "a cantrip needs no slot");
  assert.equal(slotFor(1, slots, {}), 1);
  assert.equal(slotFor(1, slots, { 1: 4 }), 2, "a higher slot when its own are spent");
  assert.equal(slotFor(2, slots, { 2: 2 }), 0, "none left");
  assert.equal(slotFor(3, slots, {}), 0, "none of that level yet");
  const word = SRD_SPELLS.find((spell) => spell.name === "Healing Word");
  assert.equal(spellRule(word), "Level 1. 1 mana. +1d4 HP. Higher: +1d4 a level. Bonus action.");
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
  const { name, hp, ac, attack, damage, dex, type, pack, inflict } = SRD_CREATURES.wolf;
  assert.deepEqual(
    { name, hp, ac, attack, damage, dex, type, pack, inflict },
    {
      name: "Wolf",
      hp: 11,
      ac: 13,
      attack: 4,
      damage: "2d4+2",
      dex: 2,
      type: "piercing",
      pack: true,
      inflict: { condition: "prone", save: { attribute: "strength", dc: 11 } },
    },
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

// Bows: one carried is what's shot, never what's swung; it goes by Dexterity; creatures have theirs from the SRD.
{
  const { bowOf, playerStrike } = await import("../packages/wanderworld/src/combat.js");
  const { SRD_CREATURES } = await import("../packages/wanderworld/src/srd.js");
  const bow = { name: "Shortbow", description: "A short bow of yew. Weapon: 1d6 damage. Range 24." };
  const axe = { name: "Iron axe", description: "Weapon: 1d8 damage, +1 to attack." };
  assert.equal(weaponIn(bow).range, 24);
  assert.equal(weaponIn({ name: "Longbow", description: "Weapon: 1d8 damage." }).range, 24, "a bow by its name");
  assert.equal(weaponIn({ name: "Bowl", description: "Weapon: 1d2 damage." }).range, 0);
  assert.equal(weaponOf([bow, axe]).name, "Iron axe", "a bow isn't swung");
  assert.equal(weaponOf([bow]).name, "", "with only a bow, a swing is bare hands");
  assert.equal(bowOf([axe]), null);
  assert.deepEqual([bowOf([bow, axe]).name, bowOf([bow, axe]).worn], ["Shortbow", false]);
  assert.equal(bowOf([{ ...bow, location: "equipped:hands" }]).worn, true);
  // Dexterity 16 (+3), Strength 8: the bow's roll has the +3, the axe's doesn't.
  let sheet = checkSheet(null);
  sheet = changeSheet(sheet, { set: "dexterity", field: "value", value: 16 });
  sheet = changeSheet(sheet, { set: "strength", field: "value", value: 8 });
  const mid = () => 0.5; // an 11 on the die
  const foe = { ac: 5 };
  assert.equal(playerStrike({ sheet, weapon: weaponIn(bow), foe }, mid).total, 14);
  assert.equal(playerStrike({ sheet, weapon: weaponIn(axe), foe }, mid).total, 11);
  assert.match(
    strikeWords({
      who: "Zoey",
      what: "wolf",
      weapon: weaponIn(bow),
      result: { hit: false, total: 3, ac: 13 },
      left: 5,
      max: 11,
    }),
    /^Zoey shoots the shortbow at the wolf/u,
  );
  assert.deepEqual(SRD_CREATURES.bandit.ranged, { name: "Light Crossbow", attack: 3, damage: "1d8+1", range: 24 });
  assert.deepEqual(SRD_CREATURES.wizard.spells, ["Fire Bolt", "Magic Missile"]);
  assert.ok(!SRD_CREATURES.wolf.ranged && !SRD_CREATURES.wolf.spells, "a wolf has to close with you");
}

// What a turn gives: by the rules for a class and level, or the player's own numbers.
{
  const { turnBudget } = await import("../packages/wanderworld/src/combat.js");
  assert.deepEqual(turnBudget(), { actions: 1, bonus: 1, attacks: 1, move: 9 });
  assert.equal(turnBudget("fighter", 4).attacks, 1);
  assert.deepEqual(
    [5, 11, 20].map((level) => turnBudget("fighter", level).attacks),
    [2, 3, 4],
  );
  assert.equal(turnBudget("ranger", 5).attacks, 2);
  assert.equal(turnBudget("wizard", 20).attacks, 1);
  assert.deepEqual(
    [turnBudget("monk", 2).move, turnBudget("barbarian", 5).move, turnBudget("barbarian", 4).move],
    [12, 12, 9],
  );
  assert.deepEqual(turnBudget("wizard", 1, { actions: 2, bonus: 3, attacks: 4, move: 15 }), {
    actions: 2,
    bonus: 3,
    attacks: 4,
    move: 15,
  });
  assert.equal(turnBudget("fighter", 5, { attacks: 0 }).attacks, 2, "0 leaves it to the rules");
}

// Gear by the SRD: a thing's name links it to a weapon or armour; its description is its stats, or isn't.
{
  const { armourIn, armourLink, gearWorn, proficiency, typedDamage, weaponLink } =
    await import("../packages/wanderworld/src/combat.js");
  assert.deepEqual(
    [
      "Rusty sword",
      "Hunting knife",
      "Elven longbow",
      "Bowl",
      "Great Sword of Kings",
      "Woodcutter's axe",
      "Oak staff",
      "Bread",
    ].map(weaponLink),
    ["longsword", "dagger", "longbow", null, "greatsword", "battleaxe", "quarterstaff", null],
  );
  assert.deepEqual(
    ["Chain mail", "Leather jerkin", "Old buckler", "Plate armor", "Dinner plate of gold", "Sword"].map(armourLink),
    ["chain-mail", "leather-armor", "shield", "plate-armor", null, null],
  );
  // The toggle: on, the description wins and the name fills in for one that states nothing; off, the name wins.
  const odd = { name: "Rusty sword", description: "Weapon: 1d4 damage." };
  assert.equal(weaponIn(odd, true).damage, "1d4");
  assert.equal(weaponIn(odd, false).damage, "1d8");
  assert.equal(weaponIn(odd, false).type, "slashing");
  const plain = { name: "Hunting knife", description: "Bone-handled." };
  assert.deepEqual([weaponIn(plain, true).damage, weaponIn(plain, true).finesse], ["1d4", true]);
  assert.equal(weaponIn({ name: "Longsword +1", description: "" }).attack, 1);
  assert.equal(weaponIn({ name: "Odd thing", description: "Weapon: 2d4 fire damage." }, false).type, "fire");
  assert.equal(weaponIn({ name: "Bread", description: "Tasty." }, false), null);
  // Proficiency by level.
  assert.deepEqual([1, 4, 5, 9, 13, 17, 20].map(proficiency), [2, 2, 3, 4, 5, 6, 6]);
  // A finesse weapon goes by the better of Strength and Dexterity, and proficiency is on the roll.
  let nimble = checkSheet(null);
  nimble = changeSheet(nimble, { set: "dexterity", field: "value", value: 16 });
  const mid = () => 0.5; // an 11 on the die
  assert.equal(playerStrike({ sheet: nimble, weapon: weaponIn(plain), foe: { ac: 5 }, prof: 2 }, mid).total, 16);
  // Armour: its number in place of 10, as much Dexterity as it lets through, a shield, and what else says "+1 AC".
  const on = (name, description = "") => ({ name, description, location: "equipped:body" });
  assert.equal(armourOf(nimble, gearWorn(nimble, [])), 13, "none: 10 and Dexterity");
  assert.equal(armourOf(nimble, gearWorn(nimble, [on("Leather armor")])), 14);
  assert.equal(armourOf(nimble, gearWorn(nimble, [on("Chain shirt")])), 15, "medium: two of Dexterity at most");
  assert.equal(armourOf(nimble, gearWorn(nimble, [on("Chain mail"), on("Wooden shield")])), 18, "heavy: none of it");
  assert.equal(armourOf(nimble, gearWorn(nimble, [on("Chain mail"), on("Ring of warding", "+1 AC")])), 17);
  assert.equal(gearWorn(nimble, [on("Chain mail")]).acTotal, 16);
  assert.equal(
    armourOf(nimble, gearWorn(nimble, [{ ...on("Chain mail"), location: "bag" }])),
    13,
    "carried isn't worn",
  );
  // A described thing keeps its description while descriptions are the stats; off, its name decides.
  const shield = on("Wooden shield", "Limewood boards. +3 AC.");
  assert.equal(armourOf(nimble, gearWorn(nimble, [shield], { byDescription: true })), 16);
  assert.equal(armourOf(nimble, gearWorn(nimble, [shield], { byDescription: false })), 15);
  // With the rules off it's the sheet's AC and what's written, as it was.
  assert.equal(armourOf(nimble, gearWorn(nimble, [on("Chain mail"), shield], { rules: false })), 13);
  assert.equal(armourIn(on("Plate armor +1")).plus, 1);
  // Kinds of damage.
  const bones = {
    vulnerable: ["bludgeoning"],
    immune: ["poison"],
    resist: [{ type: "slashing", except: ["magical"] }],
  };
  assert.deepEqual(typedDamage(7, "bludgeoning", bones), { damage: 14, how: "vulnerable" });
  assert.deepEqual(typedDamage(7, "poison", bones), { damage: 0, how: "immune" });
  assert.deepEqual(typedDamage(7, "slashing", bones), { damage: 3, how: "resists" });
  assert.deepEqual(typedDamage(7, "slashing", bones, true), { damage: 7, how: "" }, "a magical blade gets past it");
  assert.deepEqual(typedDamage(7, "fire", bones), { damage: 7, how: "" });
  const club = weaponIn({ name: "Club", description: "" });
  const hit = playerStrike({ sheet: checkSheet(null), weapon: club, foe: { ac: 5, ...bones } }, dice([15, 20], [3, 4]));
  assert.deepEqual([hit.damage, hit.how], [6, "vulnerable"]);
  assert.match(
    strikeWords({ who: "Zoey", what: "skeleton", weapon: club, result: hit, left: 7, max: 13 }),
    /for 6 \(doubled: bludgeoning is its weakness\)\./u,
  );
  const { SRD_ARMOUR, SRD_CREATURES, SRD_WEAPONS } = await import("../packages/wanderworld/src/srd.js");
  assert.deepEqual(SRD_CREATURES.skeleton.vulnerable, ["bludgeoning"]);
  assert.equal(SRD_WEAPONS.longsword.versatile, "1d10");
  assert.deepEqual([SRD_ARMOUR["chain-mail"].ac, SRD_ARMOUR["chain-mail"].dex, SRD_ARMOUR.shield.bonus], [16, 0, 2]);
}

// Nerve by temperament, and concentration read from a spell's rule.
{
  const { spellIn, spellRule } = await import("../packages/wanderworld/src/combat.js");
  const { SRD_SPELLS } = await import("../packages/wanderworld/src/srd.js");
  const never = () => 0;
  assert.equal(foeNerve(1, 20, never, "mindless"), "fight");
  assert.equal(foeNerve(1, 20, never, "fanatical"), "fight");
  assert.equal(foeNerve(9, 20, never, "cowardly"), "flee", "a coward runs at half");
  assert.equal(foeNerve(9, 20, never), "fight");
  const hold = SRD_SPELLS.find((spell) => spell.name === "Hold Person");
  assert.equal(hold.conc, true);
  assert.equal(spellIn({ about: spellRule(hold) }).conc, true);
  assert.equal(spellIn({ about: spellRule(SRD_SPELLS.find((spell) => spell.name === "Fire Bolt")) }).conc, false);
}

// Spells to the ninth level; how they grow; how each is seen.
{
  const { grownDice, slotsAt, spellGrown, spellIn, spellRule } = await import("../packages/wanderworld/src/combat.js");
  const { SRD_SLOTS, SRD_SPELLS } = await import("../packages/wanderworld/src/srd.js");
  const { spellLook } = await import("../packages/wanderworld/src/spellfx.js");
  const read = (name) => spellIn({ about: spellRule(SRD_SPELLS.find((spell) => spell.name === name)) });
  assert.ok(
    SRD_SPELLS.some((spell) => spell.level === 9),
    "the ninth level is there",
  );
  assert.equal(Object.keys(SRD_SLOTS).length, 9);
  assert.deepEqual([slotsAt(1, SRD_SLOTS)[1], slotsAt(1, SRD_SLOTS)[2], slotsAt(17, SRD_SLOTS)[9]], [2, 0, 1]);
  assert.equal(grownDice("8d6", "1d6", 2), "10d6");
  assert.equal(grownDice("1d4+1", "1d4+1", 2), "3d4+3");
  assert.equal(grownDice("8d6", "1d8", 2), "8d6", "a different die: left as it is");
  const ball = read("Fireball");
  assert.deepEqual([ball.up, ball.shape, ball.area], ["1d6", "burst", 6]);
  assert.equal(spellGrown(ball, { slot: 5 }).damage, "10d6");
  assert.equal(spellGrown(ball, { slot: 3 }), ball, "from its own level it's as written");
  assert.equal(spellGrown(ball, { slot: 0 }), ball, "cast with mana, the same");
  const bolt = read("Fire Bolt");
  assert.deepEqual(
    [1, 5, 11, 17].map((level) => spellGrown(bolt, { level }).damage),
    ["1d10", "2d10", "3d10", "4d10"],
  );
  assert.equal(spellGrown(read("Cure Wounds"), { slot: 3 }).heal, "3d8");
  assert.deepEqual(
    [
      "Fire Bolt",
      "Burning Hands",
      "Lightning Bolt",
      "Magic Missile",
      "Sacred Flame",
      "Shocking Grasp",
      "Cure Wounds",
    ].map((name) => spellLook(read(name))),
    ["bolt", "cone", "beam", "volley", "column", "beam", "motes"],
  );
  assert.equal(spellLook(read("Inflict Wounds")), "touch");
}

console.log("ok: fighting by the rules");
