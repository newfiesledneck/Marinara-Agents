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
export function strikeWords({ who, what, weapon, result, left, max }) {
  const how = weapon.name ? `swings the ${weapon.name.toLowerCase()} at` : "strikes at";
  const start = `${who} ${how} the ${what} (${rollWords(result)})`;
  if (!result.hit) return `${start}: a miss.`;
  const hit = `${start}: ${result.crit ? "a critical hit" : "a hit"}, for ${result.damage}.`;
  return left > 0 ? `${hit} It has ${left} of ${max} HP left.` : `${hit} The ${what} goes down.`;
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
