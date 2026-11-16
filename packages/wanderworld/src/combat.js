// Fighting, by the rules (the dice are sheet.js's). An attack is a d20 plus a bonus against the target's
// AC: under it misses, at or over it hits, a 20 on the die is a critical hit (the damage dice twice), a 1
// always misses. Some things ask their target for a saving throw instead, for half damage or none. What a
// creature is in a fight (its HP, AC, attack and damage) is the setting pack's (pack.js `foes`); what the
// player fights with is what they carry, read from its description ("Weapon: 1d8 damage, +1 to attack").
// This module only works things out: main.js moves the bodies and tells what happened.

import { attackRoll, modifier, rollDice, valueOf } from "./sheet.js";

/** Bare hands. */
const UNARMED = { name: "", damage: "1d2", attack: 0, held: null };
const DAMAGE = /(\d{0,2}d\d{1,3}(?:\s*[+-]\s*\d{1,3})?)\s*damage/iu;
const TO_ATTACK = /([+\-−])\s?(\d{1,2})\s*(?:to\s+)?(?:attack|to hit)/iu;
/** What a weapon looks like in the hand, by its name (character.js draws these); a sword for the rest. */
const HELD = [
  [/\b(?:axe|hatchet)\b/iu, "axe"],
  [/\bpick(?:axe)?\b/iu, "pick"],
  [/\b(?:hammer|maul|mace|club)\b/iu, "hammer"],
];

/** What `item` is as a weapon, from its description: { name, damage, attack, held }, or null when it isn't one. */
export function weaponIn(item) {
  const text = String(item?.description ?? "");
  const damage = DAMAGE.exec(text);
  if (!damage) return null;
  const attack = TO_ATTACK.exec(text);
  const name = String(item?.name ?? "").trim();
  return {
    name,
    damage: damage[1].replace(/\s+/gu, ""),
    attack: attack ? (attack[1] === "+" ? 1 : -1) * Number(attack[2]) : 0,
    held: HELD.find(([named]) => named.test(name))?.[1] ?? "sword",
  };
}

/**
 * What the player fights with: a weapon they have equipped, else the best they carry (so an axe just made
 * is of use before they've learned where things are worn), else their bare hands. `items`: Quartermaster's.
 */
export function weaponOf(items) {
  const all = (Array.isArray(items) ? items : []).map((item) => ({ item, weapon: weaponIn(item) }));
  const weapons = all.filter((entry) => entry.weapon);
  const worn = weapons.filter((entry) => String(entry.item.location ?? "").startsWith("equipped:"));
  const best = (list) =>
    list.reduce((top, entry) => (!top || mean(entry.weapon.damage) > mean(top.weapon.damage) ? entry : top), null);
  return (best(worn) ?? best(weapons))?.weapon ?? UNARMED;
}

/** What dice come to on average ("2d6+1" is 8). */
export function mean(dice) {
  const match = /^(\d{0,2})d(\d{1,3})([+-]\d{1,3})?$/iu.exec(String(dice).replace(/\s+/gu, ""));
  if (!match) return Number(dice) || 0;
  return (Number(match[1] || 1) * (Number(match[2]) + 1)) / 2 + Number(match[3] ?? 0);
}

/**
 * A creature of `kind` in a fight: { hp, ac, attack, damage, xp, verb } from the pack's `foes` (its own,
 * else the pack's `default`), its HP and damage grown or shrunk with its `scale` (a wolf half again as
 * big has half again the HP).
 */
export function foeOf(kind, foes, scale = 1) {
  const base = { hp: 6, ac: 11, attack: 2, damage: "1d4", xp: 5, verb: "strikes", ...foes?.default, ...foes?.[kind] };
  const size = Math.max(0.4, Math.min(4, Number(scale) || 1));
  return {
    ...base,
    hp: Math.max(1, Math.round(base.hp * size)),
    damageBonus: Math.round((size - 1) * 2),
    xp: Math.max(1, Math.round(base.xp * size)),
  };
}

/**
 * The player's swing at a creature: Strength's modifier and the weapon's and worn things' "to attack" on
 * the roll; the weapon's dice, Strength's modifier and worn "damage" on a hit. `worn`: sheet.js wornBonuses.
 * { roll, total, hit, crit, damage, ac }.
 */
export function playerStrike({ sheet, worn = {}, weapon = UNARMED, foe }, random = Math.random) {
  const strength = modifier(valueOf(sheet, "strength") + (worn.strength ?? 0));
  const result = attackRoll(
    {
      bonus: strength + weapon.attack + (worn.attack ?? 0),
      ac: foe.ac,
      damage: weapon.damage,
      damageBonus: strength + (worn.damage ?? 0),
    },
    random,
  );
  return { ...result, ac: foe.ac };
}

/** The player's AC: the sheet's, with what they wear. */
export const armourOf = (sheet, worn = {}) => valueOf(sheet, "ac") + (worn.ac ?? 0);

/**
 * A creature's attack on the player. `guarded` (they're blocking): it's rolled twice and the worse for the
 * creature counts. { roll, total, hit, crit, damage, ac, guarded }.
 */
export function foeStrike({ foe, sheet, worn = {}, guarded = false }, random = Math.random) {
  const ac = armourOf(sheet, worn);
  const roll = () =>
    attackRoll({ bonus: foe.attack, ac, damage: foe.damage, damageBonus: foe.damageBonus ?? 0 }, random);
  const first = roll();
  if (!guarded) return { ...first, ac, guarded: false };
  const second = roll();
  return { ...(second.roll < first.roll ? second : first), ac, guarded: true };
}

/**
 * A saving throw: a d20 plus the modifier of `score` (and `bonus`) against `dc`. A save takes half of
 * `damage` (dice, or a number) or none of it, as `onSave` says ("half" | "none"); a failed one takes it all.
 * { roll, total, saved, damage }.
 */
export function savingThrow({ score = 10, bonus = 0, dc = 10, damage = 0, onSave = "half" }, random = Math.random) {
  const roll = 1 + Math.floor(random() * 20);
  const total = roll + modifier(score) + bonus;
  const saved = total >= dc;
  const full = Math.max(0, rollDice(damage, random).total);
  return { roll, total, saved, damage: !saved ? full : onSave === "half" ? Math.floor(full / 2) : 0 };
}

/**
 * How a creature that has just been hurt takes it: with a third of its HP or less left it may turn and
 * run (more likely the less it has); else it fights on. "flee" | "fight".
 */
export function foeNerve(hp, max, random = Math.random) {
  if (hp <= 0 || max <= 0) return "fight";
  const left = hp / max;
  return left <= 1 / 3 && random() < 0.75 - left ? "flee" : "fight";
}

/** A roll told in a few words: "14 against AC 12", "a 20", "a 1". */
const rollWords = (result) =>
  result.crit ? "a 20 on the die" : result.roll === 1 ? "a 1 on the die" : `${result.total} against AC ${result.ac}`;

/**
 * The player's swing, told: "You swing your iron axe at the wolf (14 against AC 12): a hit, for 6. It has 5
 * of 11 HP left." `what`: the creature ("wolf"); `left` and `max`: its HP after.
 */
export function strikeWords({ who, what, weapon, result, left, max, named = false }) {
  // (`named`: `what` is someone's name, not a kind of creature.)
  const whom = named ? what : `the ${what}`;
  const how = weapon.name ? `swings the ${weapon.name.toLowerCase()} at` : "strikes at";
  const start = `${who} ${how} ${whom} (${rollWords(result)})`;
  if (!result.hit) return `${start}: a miss.`;
  const hit = `${start}: ${result.crit ? "a critical hit" : "a hit"}, for ${result.damage}.`;
  if (left <= 0) return `${hit} ${named ? what : `The ${what}`} goes down.`;
  return `${hit} ${named ? `${what} has` : "It has"} ${left} of ${max} HP left.`;
}

/** A creature's attack, told: "The wolf bites at Zoey (15 against AC 12): a hit, for 4. Zoey has 9 of 20 HP." */
export function foeWords({ who, what, verb, result, left, max }) {
  const start = `The ${what} ${verb} at ${who} (${rollWords(result)}${result.guarded ? ", blocked" : ""})`;
  if (!result.hit) return `${start}: a miss.`;
  return `${start}: ${result.crit ? "a critical hit" : "a hit"}, for ${result.damage}. ${who} has ${Math.max(0, left)} of ${max} HP.`;
}

/**
 * What's had from a beaten creature of `kind`: { items: [{ name, description, quantity }], coins } from the
 * pack's `spoils` (its own, else nothing). Each thing listed is { name, description, quantity (a number, or
 * [least, most]), chance (0–1; always when not given) }; `coins` is [least, most]. Bigger ones give no more.
 */
export function spoilsOf(kind, spoils, random = Math.random) {
  const from = spoils?.[kind] ?? {};
  const between = (range) => {
    const [least, most] = Array.isArray(range) ? range : [range ?? 1, range ?? 1];
    return Math.max(0, Math.round(least + random() * (most - least)));
  };
  const items = (from.items ?? [])
    .filter((item) => item.chance === undefined || random() < item.chance)
    .map((item) => ({
      name: item.name,
      description: item.description ?? "",
      quantity: Math.max(1, between(item.quantity)),
    }));
  return { items, coins: from.coins ? between(from.coins) : 0 };
}

/** What was had, in words: "a wolf pelt, 2 × raw meat and 7 coins"; "nothing of use" for none. */
export function spoilsWords(spoils, currency) {
  const parts = spoils.items.map((item) =>
    item.quantity > 1 ? `${item.quantity} × ${item.name.toLowerCase()}` : item.name.toLowerCase(),
  );
  if (spoils.coins > 0) parts.push(`${spoils.coins} ${String(currency).toLowerCase()}`);
  if (!parts.length) return "nothing of use";
  return parts.length > 1 ? `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}` : parts[0];
}

// ── Spells ───────────────────────────────────────────────────────────────────

const ATTRIBUTES = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"];
const SPELL_COST = /(\d{1,3})\s*mana/iu;
const SPELL_DAMAGE = /(\d{0,2}d\d{1,3}(?:\s*[+-]\s*\d{1,3})?)\s*(?:([a-z]+)\s+)?damage/iu;
const SPELL_HEAL = /\+\s?(\d{0,2}d\d{1,3}(?:\s*[+-]\s*\d{1,3})?|\d{1,3})\s*HP/iu;
const SPELL_SAVE = new RegExp(`(${ATTRIBUTES.join("|")})\\s+sav(?:e|ing throw)`, "iu");
const SPELL_RANGE = /\brange\s+(\d{1,3}(?:\.\d)?)/iu;
/** The effects a spell can leave, and what each does here: held where it stands, or sent running. */
const EFFECTS = { stunned: "hold", paralyzed: "hold", restrained: "hold", incapacitated: "hold", frightened: "flee" };
const SPELL_EFFECT = new RegExp(
  `\\b(${Object.keys(EFFECTS).join("|")})\\b(?:\\s+(?:for\\s+)?(\\d{1,3})\\s*seconds?)?`,
  "iu",
);

/** How far a spell reaches when its description doesn't say (metres). */
export const SPELL_REACH = 14;
/** What a spell of `level` costs in mana: a cantrip (level 0) nothing, the rest a point more than their level. */
export const spellCost = (level) => (level > 0 ? level + 1 : 0);

/**
 * A spell's rule as its description says it, for one taken from the SRD (srd.js): "Cantrip. 1d10 fire
 * damage. Range 24.", "Level 1. 2 mana. 3d6 fire damage. Dexterity save for half. Range 5.", "Level 2. 3
 * mana. Wisdom save or paralyzed 8 seconds. Range 18.", "Level 1. 2 mana. +1d8 HP." What it reads back as
 * is `spellIn`.
 */
export function spellRule(spell) {
  const parts = [spell.level > 0 ? `Level ${spell.level}` : "Cantrip"];
  if (spellCost(spell.level)) parts.push(`${spellCost(spell.level)} mana`);
  if (spell.heal) parts.push(`+${spell.heal} HP`);
  if (spell.damage) parts.push(`${spell.damage}${spell.type ? ` ${spell.type}` : ""} damage`);
  if (spell.sure) parts.push("Always hits");
  if (spell.save && spell.effect) parts.push(`${spell.save.attribute} save or ${spell.effect} 8 seconds`);
  else if (spell.save) parts.push(`${spell.save.attribute} save for ${spell.save.onSave === "half" ? "half" : "none"}`);
  if (!spell.heal) parts.push(`Range ${spell.range}`);
  return `${parts.join(". ")}.`;
}

/**
 * What a spell does, from its description on the sheet, written as an item's is:
 *   "1d10 fire damage."                                  an attack roll against AC; no mana named: a cantrip
 *   "3 mana. 2d6 cold damage. Dexterity save for half."  a saving throw: half on a save ("for half"), else none
 *   "2 mana. 1d4+1 force damage. Always hits."           no roll
 *   "2 mana. Wisdom save or stunned 6 seconds."          an effect on a failed save (stunned, paralyzed,
 *                                                        restrained, incapacitated: held; frightened: it runs)
 *   "3 mana. +1d8 HP."                                   healing, on the caster (dice or a number)
 *   "... Range 18."                                      how far it reaches, in metres
 * { cost, damage, type, heal, sure, save: { attribute, onSave }, effect: { name, kind, seconds }, range },
 * or null when it says none of these (a spell that is only words for the story).
 */
export function spellIn(entry) {
  const text = String(entry?.about ?? "");
  const damage = SPELL_DAMAGE.exec(text);
  const heal = SPELL_HEAL.exec(text);
  const effect = SPELL_EFFECT.exec(text);
  if (!damage && !heal && !effect) return null;
  const save = SPELL_SAVE.exec(text);
  const name = effect?.[1].toLowerCase();
  return {
    cost: Number(SPELL_COST.exec(text)?.[1] ?? 0),
    damage: damage ? damage[1].replace(/\s+/gu, "") : null,
    type: damage?.[2]?.toLowerCase() ?? "",
    heal: heal ? heal[1].replace(/\s+/gu, "") : null,
    sure: /\balways hits\b/iu.test(text),
    save: save ? { attribute: save[1].toLowerCase(), onSave: /\bhalf\b/iu.test(text) ? "half" : "none" } : null,
    effect: effect ? { name, kind: EFFECTS[name], seconds: Number(effect[2] ?? 6) } : null,
    range: Number(SPELL_RANGE.exec(text)?.[1] ?? SPELL_REACH),
  };
}

/**
 * A spell cast at a creature by someone whose casting modifier is `wit` (the player's: Intelligence's).
 * With a saving throw: the creature rolls against the caster's DC (10 + wit), taking half or none on a
 * save and the effect only on a failure. One that always hits just rolls its damage. Else a spell attack
 * (a d20 + 2 + wit) against its AC, as a weapon's, a 20 a critical hit.
 * { hit, saved, crit, sure, roll, total, against, damage, effect }.
 */
export function spellStrike({ wit = 0, spell, foe }, random = Math.random) {
  if (spell.save) {
    const dc = 10 + wit;
    const thrown = savingThrow(
      {
        score: 10,
        bonus: foe.save ?? Math.floor(foe.attack / 2),
        dc,
        damage: spell.damage ?? 0,
        onSave: spell.save.onSave,
      },
      random,
    );
    return {
      hit: !thrown.saved,
      saved: thrown.saved,
      crit: false,
      sure: false,
      roll: thrown.roll,
      total: thrown.total,
      against: `DC ${dc}`,
      damage: thrown.damage,
      effect: thrown.saved ? null : spell.effect,
    };
  }
  if (spell.sure) {
    const damage = spell.damage ? Math.max(1, rollDice(spell.damage, random).total) : 0;
    return {
      hit: true,
      saved: false,
      crit: false,
      sure: true,
      roll: 0,
      total: 0,
      against: "",
      damage,
      effect: spell.effect,
    };
  }
  const result = attackRoll({ bonus: 2 + wit, ac: foe.ac, damage: spell.damage ?? "0" }, random);
  return {
    hit: result.hit,
    saved: false,
    crit: result.crit,
    sure: false,
    roll: result.roll,
    total: result.total,
    against: `AC ${foe.ac}`,
    damage: result.hit && spell.damage ? result.damage : 0,
    effect: result.hit ? spell.effect : null,
  };
}

/** The player's casting modifier: Intelligence's, with what they wear. */
export const witOf = (sheet, worn = {}) => modifier(valueOf(sheet, "intelligence") + (worn.intelligence ?? 0));

/**
 * A spell cast at something, told: "Zoey casts Frost burst at the wolf (its dexterity save: 13 against DC
 * 13): it saves, for 4. It has 7 of 11 HP left." `named`: `what` is someone's name, not a kind of creature.
 */
export function spellWords({ who, name, what, spell, result, left, max, named = false }) {
  const whom = named ? what : `the ${what}`;
  const their = named ? "their" : "its";
  const start = `${who} casts ${name} at ${whom}`;
  const rolled = result.sure
    ? ""
    : spell.save
      ? ` (${their} ${spell.save.attribute} save: ${result.total} against ${result.against})`
      : ` (${result.crit ? "a 20 on the die" : `${result.total} against ${result.against}`})`;
  const parts = [];
  if (result.sure) parts.push("it strikes home");
  else if (spell.save) parts.push(result.saved ? (named ? "they save" : "it saves") : named ? "they fail" : "it fails");
  else parts.push(result.crit ? "a critical hit" : result.hit ? "a hit" : "a miss");
  if (result.damage > 0) parts.push(`for ${result.damage}`);
  if (result.effect) parts.push(`${result.effect.name} for ${result.effect.seconds} seconds`);
  const told = `${start}${rolled}: ${parts.join(", ")}.`;
  if (result.damage <= 0) return told;
  if (left <= 0) return `${told} ${named ? what : `The ${what}`} goes down.`;
  return `${told} ${named ? `${what} has` : "It has"} ${left} of ${max} HP left.`;
}
