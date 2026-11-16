#!/usr/bin/env node
// Writes packages/wanderworld/src/srd.js from the 5e ruleset package's catalogs
// (packages/ruleset-5e-2014/catalogs: spells, classes, weapons, creatures; SRD 5.1, CC BY 4.0). Wanderworld's spells,
// its classes and each class's weapon are taken from there and nowhere else, so nothing of 5e that isn't
// in the SRD gets in. Run it again whenever that package's catalogs change:
//
//   node scripts/build-wanderworld-srd.mjs
//
// What's taken: every spell of level 0 to 3 that Wanderworld's simple fights can play (damage by a spell
// attack, by a saving throw or without a roll; healing; a save against being held or frightened), with its
// name, level, classes, dice, damage type, save and range; the twelve classes with their hit die; and one
// weapon for each class. What a spell costs in mana and how its rule is worded are Wanderworld's own.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FROM = join(ROOT, "packages/ruleset-5e-2014/catalogs");
const OUT = join(ROOT, "packages/wanderworld/src/srd.js");
const read = (name) => JSON.parse(readFileSync(join(FROM, name), "utf8")).entries;

const SAVES = {
  str_save: "Strength",
  dex_save: "Dexterity",
  con_save: "Constitution",
  int_save: "Intelligence",
  wis_save: "Wisdom",
  cha_save: "Charisma",
};
/** The SRD's conditions Wanderworld can play, and as what: held where it stands, or sent running. */
const CONDITIONS = {
  paralyzed: "paralyzed",
  incapacitated: "incapacitated",
  restrained: "restrained",
  slept: "asleep",
  frightened: "frightened",
  charmed_by_person: "charmed",
  charmed_by_creature: "charmed",
  calmed: "calmed",
  blinded: "blinded",
  slowed: "slowed",
  chilled: "slowed",
  baned: "hindered",
  mocked: "hindered",
  enfeebled: "hindered",
  outlined: "marked",
  guided: "marked",
  prone: "prone",
};
/** Which of a spell's conditions is played, when it leaves several: the first of these it has. */
const CONDITION_ORDER = [...new Set(Object.values(CONDITIONS))];
/** How long a condition lasts here: an instant one (knocked prone) a moment, one round six seconds, longer ones twelve. */
const lasts = (duration) => (duration === "instant" ? 3 : (duration?.rounds ?? 1) <= 1 ? 6 : 12);
/** A spell's area as a reach round its target, in metres: a burst's radius, half a cube or a cone, a line's width. */
const areaOf = (area) => {
  const size = Number(area?.size) || 0;
  const reach = { burst: size * 0.3, box: size * 0.15, cone: size * 0.15, line: 2 }[area?.shape] ?? 0;
  return reach ? Math.max(1.5, Math.min(8, Math.round(reach * 2) / 2)) : 0;
};
/** Feet to metres, kept within what a fight here can see. A touch is arm's reach; a cone or a burst from the caster, a few paces. */
const metres = (feet) => (feet === 0 ? 2.5 : feet == null ? 5 : Math.max(3, Math.min(24, Math.round(feet * 0.3))));

const spells = [];
for (const entry of read("spells.json")) {
  const level = entry.filters?.level;
  const mechanics = entry.mechanics ?? {};
  if (!(level >= 0 && level <= 3) || /[(:]/u.test(entry.label) || !entry.filters.classes?.length) continue;
  const dice = mechanics.amount?.dice ?? null;
  const save = SAVES[mechanics.save?.save] ?? null;
  const applied = (Array.isArray(mechanics.applies) ? mechanics.applies : [])
    .filter((entry) => CONDITIONS[entry.condition])
    .sort(
      (a, b) => CONDITION_ORDER.indexOf(CONDITIONS[a.condition]) - CONDITION_ORDER.indexOf(CONDITIONS[b.condition]),
    )[0];
  const condition = applied ? CONDITIONS[applied.condition] : null;
  const push = mechanics.push > 0 ? Math.round(mechanics.push * 0.3 * 2) / 2 : 0;
  const spell = {
    name: entry.label,
    level,
    classes: entry.filters.classes.map((name) => name.toLowerCase()),
    range: metres(mechanics.range),
  };
  // (Cast as a bonus action, by its casting time: that matters where fights go by turns.)
  if (/Casting time: bonus action/iu.test(entry.rows?.[0]?.values?.notes ?? "")) spell.bonus = true;
  if (mechanics.kind === "heal" && dice) spell.heal = dice;
  else if (mechanics.kind === "attack" && dice) {
    spell.damage = dice;
    spell.type = mechanics.damageType ?? "";
    if (save) spell.save = { attribute: save, onSave: mechanics.save.onSuccess === "half" ? "half" : "none" };
    else if (!mechanics.attackRoll) spell.sure = true; // no roll: it always hits
    if (mechanics.drain?.share) spell.drain = true; // the caster is healed for half of what it deals
  } else if (mechanics.kind === "debuff" && (condition || push)) {
    if (save) spell.save = { attribute: save, onSave: "none" };
    else if (!mechanics.attackRoll) spell.sure = true;
  } else continue;
  // What it leaves on what it lands on (a failed save, a hit): a condition for a while, a shove back.
  if (condition && !spell.heal) {
    spell.effect = condition;
    spell.seconds = lasts(applied.duration);
  }
  if (push && !spell.heal) spell.push = push;
  if (areaOf(mechanics.area) && !spell.heal) spell.area = areaOf(mechanics.area);
  spells.push(spell);
}
spells.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));

/** One weapon for each class: which of the SRD's it carries is Wanderworld's choice; what it does is the SRD's. */
const CLASS_WEAPON = {
  barbarian: "greataxe",
  bard: "rapier",
  cleric: "mace",
  druid: "quarterstaff",
  fighter: "longsword",
  monk: "quarterstaff",
  paladin: "longsword",
  ranger: "shortsword",
  rogue: "shortsword",
  sorcerer: "dagger",
  warlock: "dagger",
  wizard: "quarterstaff",
};
const weapons = new Map(read("weapons.json").map((entry) => [entry.id, entry]));
const classes = {};
for (const entry of read("classes.json")) {
  const weapon = weapons.get(CLASS_WEAPON[entry.id]);
  if (!weapon) continue;
  classes[entry.id] = {
    name: entry.label,
    hitDie: Number(String(entry.grants?.sets?.hp_first_die ?? "d8").slice(1)) || 8,
    weapon: { name: weapon.label, damage: weapon.mechanics.amount.dice },
  };
}
/**
 * Spell slots by caster level, for slot levels 1 to 3: the ruleset's own step tables (its derived values
 * `slots_N_from_level`), each [[from this caster level, this many slots], …].
 */
const ruleset = JSON.parse(readFileSync(join(ROOT, "packages/ruleset-5e-2014/ruleset.json"), "utf8"));
const slots = {};
(function find(node) {
  if (Array.isArray(node)) return node.forEach(find);
  if (!node || typeof node !== "object") return;
  const level = /^slots_([1-3])_from_level$/u.exec(node.id ?? "")?.[1];
  if (level && Array.isArray(node.table)) slots[level] = node.table;
  Object.values(node).forEach(find);
})(ruleset);
if (Object.keys(slots).length !== 3) throw new Error("The ruleset's spell slot tables weren't found.");

if (Object.keys(classes).length !== 12)
  throw new Error(`Expected the SRD's twelve classes, found ${Object.keys(classes).length}`);
if (spells.length < 30)
  throw new Error(`Too few spells came through (${spells.length}): has the catalog's shape changed?`);

/**
 * Which of the SRD's creatures each of Wanderworld's is, in a fight (the choice is ours: the SRD has no fox,
 * so a fox is a jackal; a husky is a mastiff; the slime a gray ooze; the dragon a red wyrmling). Kinds
 * with nothing close in the SRD (cattle, the alpaca, the shiba) keep Wanderworld's own numbers, as do
 * people, who fight by their class.
 */
const CREATURE_OF = {
  wolf: "wolf",
  deer: "deer",
  stag: "elk",
  fox: "jackal",
  horse: "riding-horse",
  donkey: "mule",
  husky: "mastiff",
  slime: "gray-ooze",
  skeleton: "skeleton",
  spider: "giant-wolf-spider",
  rat: "giant-rat",
  snake: "poisonous-snake",
  bat: "giant-bat",
  wasp: "giant-wasp",
  frog: "giant-frog",
  dragon: "red-dragon-wyrmling",
  bandit: "bandit",
  witch: "cult-fanatic",
  wizard: "mage",
  imp: "imp",
  puglin: "goblin",
};
/** A dice expression's average, rounded down, as the SRD gives a creature's hit points ("2d8+2" is 11). */
const average = (dice) => {
  const match = /^(\d+)d(\d+)\s*([+-]\s*\d+)?$/u.exec(String(dice).trim());
  if (!match) return null;
  return Math.floor((Number(match[1]) * (Number(match[2]) + 1)) / 2 + Number((match[3] ?? "0").replace(/\s/gu, "")));
};
const bestiary = new Map(read("creatures.json").map((entry) => [entry.id, entry]));
const creatures = {};
for (const [kind, id] of Object.entries(CREATURE_OF)) {
  const entry = bestiary.get(id);
  const sheet = entry?.creature;
  // (One with a class, a spellcaster, has its hit points and Armor Class on a character sheet of its own.)
  const hp = average(sheet?.health?.dice) ?? sheet?.sheet?.fields?.hp_max;
  const ac = sheet?.defense ?? sheet?.sheet?.fields?.ac;
  // Its attack up close: the first with a roll to hit and a reach, else the first with a roll to hit. (A
  // bite that is all venom, the poisonous snake's, has its dice under what the bite adds.)
  const diceOf = (action) => action.damage?.dice ?? action.damage?.plus?.[0]?.dice;
  const attacks = (sheet?.actions ?? []).filter((action) => Number.isInteger(action.toHit) && diceOf(action));
  const attack = attacks.find((action) => action.reach) ?? attacks[0];
  if (!hp || !Number.isInteger(ac) || !attack) {
    console.warn(`no numbers for ${kind} (${id}): it keeps Wanderworld's own`);
    continue;
  }
  const flat = attack.damage.flat > 0 ? `+${attack.damage.flat}` : "";
  creatures[kind] = {
    name: entry.label,
    hp,
    ac,
    attack: attack.toHit,
    damage: `${diceOf(attack)}${flat}`,
    dex: sheet.initiativeModifier ?? 0,
  };
}
if (Object.keys(creatures).length < 15)
  throw new Error(
    `Too few creatures came through (${Object.keys(creatures).length}): has the catalog's shape changed?`,
  );

const text = `// Generated by scripts/build-wanderworld-srd.mjs from packages/ruleset-5e-2014 (its spell, class and weapon
// catalogs). Do not edit by hand: change the script, or the ruleset package, and run it again.
//
// This file includes material from the System Reference Document 5.1 ("SRD 5.1") by Wizards of the Coast
// LLC, available at https://dnd.wizards.com/resources/systems-reference-document and licensed under the
// Creative Commons Attribution 4.0 International License (https://creativecommons.org/licenses/by/4.0/legalcode),
// in the machine-readable form of the Open5e API project (https://github.com/open5e/open5e-api, srd-2014).
// The material has been adapted: only names, levels, classes, dice, damage types, saving throws, casting times,
// ranges and the spell slot table are kept, ranges are in metres, and what a spell costs in mana is Wanderworld's own. Not affiliated with
// or endorsed by Wizards of the Coast.

/** The credit this material needs, shown in Help → Credits. */
export const SRD_CREDIT =
  "Spells, classes, class weapons and creatures' numbers include material from the System Reference Document 5.1 by Wizards of the Coast LLC (https://dnd.wizards.com/resources/systems-reference-document), licensed under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/legalcode), by way of the Open5e API project. Adapted: only names, levels, dice, damage types, saving throws, conditions, areas, ranges and creatures' hit points, Armor Class and attacks are kept. Not affiliated with or endorsed by Wizards of the Coast.";

/**
 * The SRD's spells of level 0 (cantrips) to 3 that a fight here can play: { name, level, classes, range
 * (metres), and damage (dice) with type, save { attribute, onSave } or sure (no roll); or heal (dice); or
 * save with effect (a condition) }.
 */
export const SRD_SPELLS = ${JSON.stringify(spells)};

/** Spell slots of levels 1 to 3 by caster level: { [slot level]: [[from this caster level, this many], …] }. */
export const SRD_SLOTS = ${JSON.stringify(slots)};

/** The SRD's classes: { [id]: { name, hitDie, weapon: { name, damage } } }. */
export const SRD_CLASSES = ${JSON.stringify(classes)};

/**
 * The SRD's numbers for Wanderworld's creatures, by Wanderworld's kind: { name (the SRD creature it's taken
 * as), hp (its hit dice's average), ac, attack (what its attack up close adds to the roll), damage (dice),
 * dex (what it adds to initiative) }.
 */
export const SRD_CREATURES = ${JSON.stringify(creatures)};
`;
writeFileSync(OUT, text);
console.log(`wrote ${OUT}: ${spells.length} spells, ${Object.keys(classes).length} classes`);
for (const spell of spells)
  console.log(
    `${spell.level} ${spell.name.padEnd(22)} ${spell.heal ? `heal ${spell.heal}` : (spell.damage ?? spell.effect)} ${spell.save ? `${spell.save.attribute} save (${spell.save.onSave})` : spell.sure ? "sure" : spell.heal ? "" : "attack"} ${spell.effect ?? ""} ${spell.range} m`,
  );
