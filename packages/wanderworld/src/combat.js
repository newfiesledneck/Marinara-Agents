// Fighting, by the rules (the dice are sheet.js's). An attack is a d20 plus a bonus against the target's
// AC: under it misses, at or over it hits, a 20 on the die is a critical hit (the damage dice twice), a 1
// always misses. Some things ask their target for a saving throw instead, for half damage or none. What a
// creature is in a fight (its HP, AC, attack and damage) is the setting pack's (pack.js `foes`); what the
// player fights with is what they carry, read from its description ("Weapon: 1d8 damage, +1 to attack").
// This module only works things out: main.js moves the bodies and tells what happened.

import { attackRoll, bonusesIn, diceWords, modifier, rollDice, statBlock, valueOf } from "./sheet.js";
import { SRD_ARMOUR, SRD_LOOT, SRD_MAGIC, SRD_POTIONS, SRD_WEAPONS } from "./srd.js";

/** Bare hands. */
const UNARMED = { name: "", damage: "1d2", attack: 0, held: null, type: "bludgeoning" };
/** The kinds of damage there are (the SRD's). */
export const DAMAGE_TYPES = [
  "acid",
  "bludgeoning",
  "cold",
  "fire",
  "force",
  "lightning",
  "necrotic",
  "piercing",
  "poison",
  "psychic",
  "radiant",
  "slashing",
  "thunder",
];
const DAMAGE = new RegExp(
  `(\\d{0,2}d\\d{1,3}(?:\\s*[+-]\\s*\\d{1,3})?)\\s*(?:(${DAMAGE_TYPES.join("|")})\\s+)?damage`,
  "iu",
);
/**
 * Which of the SRD's weapons something is, by a word in its name: the first of these that's there. So a
 * "Rusty sword" is a longsword, a "Hunting knife" a dagger, an "Elven longbow" a longbow. The choice of
 * which word means which weapon is Wanderworld's; what the weapon then does is the SRD's (srd.js).
 */
const WEAPON_WORDS = [
  [/\b(?:great ?sword|claymore|zweihander)\b/iu, "greatsword"],
  [/\b(?:short ?sword|gladius)\b/iu, "shortsword"],
  [/\b(?:rapier|estoc|foil)\b/iu, "rapier"],
  [/\b(?:scimitar|sabre|saber|cutlass|falchion)\b/iu, "scimitar"],
  [/\b(?:\w*sword|blade|katana)\b/iu, "longsword"],
  [/\b(?:dagger|knife|dirk|stiletto|shiv)\b/iu, "dagger"],
  [/\b(?:great ?axe)\b/iu, "greataxe"],
  [/\b(?:hand ?axe|hatchet|tomahawk)\b/iu, "handaxe"],
  [/\b(?:pick|pickaxe|war pick)\b/iu, "war-pick"],
  [/\b\w*axe\b/iu, "battleaxe"],
  [/\b(?:maul|sledge|sledgehammer)\b/iu, "maul"],
  [/\b(?:war ?hammer)\b/iu, "warhammer"],
  [/\bhammer\b/iu, "light-hammer"],
  [/\b(?:morningstar|morning star)\b/iu, "morningstar"],
  [/\bmace\b/iu, "mace"],
  [/\bflail\b/iu, "flail"],
  [/\b(?:great ?club)\b/iu, "greatclub"],
  [/\b(?:club|cudgel|baton|truncheon)\b/iu, "club"],
  [/\b(?:quarterstaff|staff|stave)\b/iu, "quarterstaff"],
  [/\bjavelin\b/iu, "javelin"],
  [/\btrident\b/iu, "trident"],
  [/\bpike\b/iu, "pike"],
  [/\bhalberd\b/iu, "halberd"],
  [/\bglaive\b/iu, "glaive"],
  [/\blance\b/iu, "lance"],
  [/\bspear\b/iu, "spear"],
  [/\bwhip\b/iu, "whip"],
  [/\b(?:sickle|scythe)\b/iu, "sickle"],
  [/\b(?:heavy crossbow|arbalest)\b/iu, "crossbow-heavy"],
  [/\bhand crossbow\b/iu, "crossbow-hand"],
  [/\bcrossbow\b/iu, "crossbow-light"],
  [/\b(?:longbow|long bow|war ?bow)\b/iu, "longbow"],
  [/\b(?:\w*bow)\b/iu, "shortbow"],
  [/\b(?:sling|slingshot)\b/iu, "sling"],
  [/\bdart\b/iu, "dart"],
  [/\bblowgun\b/iu, "blowgun"],
];
/** The same for armour and shields. */
const ARMOUR_WORDS = [
  [/\b(?:shield|buckler)\b/iu, "shield"],
  [/\bhalf[ -]?plate\b/iu, "half-plate"],
  [/\b(?:breastplate|cuirass)\b/iu, "breastplate"],
  [/\b(?:plate|full plate)\b(?! of\b)/iu, "plate-armor"],
  [/\bsplint\b/iu, "splint-armor"],
  [/\bchain ?shirt\b/iu, "chain-shirt"],
  [/\b(?:chain ?mail|hauberk)\b/iu, "chain-mail"],
  [/\bring ?mail\b/iu, "ring-mail"],
  [/\bscale\b/iu, "scale-mail"],
  [/\bstudded\b/iu, "studded-leather-armor"],
  [/\bhide (?:armou?r|coat|jerkin)\b/iu, "hide-armor"],
  [/\bleather (?:armou?r|jerkin|vest|cuirass|coat|jack)\b/iu, "leather-armor"],
  [/\b(?:padded|gambeson|quilted)\b/iu, "padded-armor"],
];
const linkOf = (words, table, name) => {
  const id = words.find(([named]) => named.test(String(name ?? "")))?.[1];
  return id && table[id] ? id : null;
};
/** The SRD weapon something is by its name (an id of srd.js SRD_WEAPONS), or null. */
export const weaponLink = (name) => linkOf(WEAPON_WORDS, SRD_WEAPONS, name);
/** The SRD armour or shield something is by its name (an id of srd.js SRD_ARMOUR), or null. A weapon never is. */
export const armourLink = (name) => (weaponLink(name) ? null : linkOf(ARMOUR_WORDS, SRD_ARMOUR, name));
/** A "+1" in a thing's name ("Longsword +1"): what it adds. */
const plusIn = (name) => Number(/(?:^|\s)\+(\d)\b/u.exec(String(name ?? ""))?.[1] ?? 0);
const WEAPON_RANGE = /\brange\s+(\d{1,3})/iu;
const SHOOTS = /(?:bow|sling)\b/iu;
const TO_ATTACK = /([+\-−])\s?(\d{1,2})\s*(?:to\s+)?(?:attack|to hit)/iu;
/** What a weapon looks like in the hand, by its name (character.js draws these); a sword for the rest. */
const HELD = [
  [/\b(?:axe|hatchet)\b/iu, "axe"],
  [/\bpick(?:axe)?\b/iu, "pick"],
  [/\b(?:hammer|maul|mace|club)\b/iu, "hammer"],
];

/**
 * What `item` is as a weapon: { name, damage, attack, held, range, type, and where it has them finesse,
 * versatile, two, light, reach, thrown, plus (a +1's damage), srd (the SRD weapon it's taken as) }, or null
 * when it isn't one. `byDescription` (Settings → Inventory → Combat): its description is its stats ("Weapon:
 * 1d8 slashing damage, +1 to attack"), and only one that states none goes by its name; off, its name decides
 * (a word such as sword, knife or bow links it to the SRD's weapon of that sort) and only one whose name
 * says nothing goes by its description.
 */
export function weaponIn(item, byDescription = true) {
  const written = weaponWritten(item);
  const linked = weaponLinked(item);
  return byDescription ? (written ?? linked) : (linked ?? written);
}

function weaponWritten(item) {
  const text = statBlock(item?.description); // (only what's in its square brackets)
  const damage = DAMAGE.exec(text);
  if (!damage) return null;
  const attack = TO_ATTACK.exec(text);
  const name = String(item?.name ?? "").trim();
  const like = SRD_WEAPONS[weaponLink(name)];
  return {
    name,
    damage: damage[1].replace(/\s+/gu, ""),
    attack: attack ? (attack[1] === "+" ? 1 : -1) * Number(attack[2]) : 0,
    held: HELD.find(([named]) => named.test(name))?.[1] ?? "sword",
    // (Something to shoot with, by its name or a "Range 24" in its description: how far it reaches, in metres.)
    range: Number(WEAPON_RANGE.exec(text)?.[1] ?? 0) || (SHOOTS.test(name) ? 24 : 0),
    // (Its kind of damage: as written, else that of the weapon its name is like, else a blunt knock.)
    type: damage[2]?.toLowerCase() ?? like?.type ?? "bludgeoning",
    ...(/\bfinesse\b/iu.test(text) ? { finesse: true } : {}),
    ...(/\blight\b/iu.test(text) || like?.light ? { light: true } : {}),
    ...(/\btwo[- ]handed\b/iu.test(text) ? { two: true } : {}),
    ...(/\bheavy\b/iu.test(text) ? { heavy: true } : {}),
    ...(/\breach\b/iu.test(text) ? { reach: true } : {}),
    // ("versatile 1d10": its dice in both hands. "thrown 6": it can be thrown that many metres; six with no number.)
    ...(/\bversatile\s+(\d{0,2}d\d{1,3})/iu.test(text)
      ? { versatile: /\bversatile\s+(\d{0,2}d\d{1,3})/iu.exec(text)[1] }
      : {}),
    ...(/\bthrown\b/iu.test(text) ? { thrown: Number(/\bthrown\s+(\d{1,2})/iu.exec(text)?.[1] ?? 6) } : {}),
  };
}

function weaponLinked(item) {
  const name = String(item?.name ?? "").trim();
  const id = weaponLink(name);
  const like = SRD_WEAPONS[id];
  if (!like) return null;
  const plus = plusIn(name);
  const weapon = {
    name,
    damage: like.damage,
    attack: plus,
    held: HELD.find(([named]) => named.test(name))?.[1] ?? "sword",
    range: like.range ?? 0,
    type: like.type,
    srd: id,
  };
  for (const key of ["finesse", "versatile", "two", "light", "reach", "thrown", "heavy"])
    if (like[key]) weapon[key] = like[key];
  if (plus) weapon.plus = plus;
  return weapon;
}

/**
 * What `item` is as armour, by its name: { name, kind, ac, dex, noisy } or a shield's { name, kind: "shield",
 * bonus }, each with plus (a "+1" in its name), or null.
 */
export function armourIn(item) {
  const like = SRD_ARMOUR[armourLink(item?.name)];
  return like ? { ...like, name: String(item.name).trim(), plus: plusIn(item.name) } : null;
}

/** The SRD's worn magic, longest names first, so "Ring of Protection" is found in "Old ring of protection". */
const MAGIC_NAMES = Object.values(SRD_MAGIC).sort((a, b) => b.name.length - a.name.length);
/** What `item` is as a worn magic thing, by its name (srd.js SRD_MAGIC's entry), or null. */
export function accessoryIn(item) {
  const name = String(item?.name ?? "").toLowerCase();
  return (name && MAGIC_NAMES.find((entry) => name.includes(entry.name.toLowerCase()))) || null;
}

const POTION_DICE = /\+\s?(\d{0,2}d\d{1,3}(?:\s*[+-]\s*\d{1,3})?)\s*HP/iu;
const POTION_NAMES = Object.values(SRD_POTIONS).sort((a, b) => b.name.length - a.name.length);
/**
 * The dice something heals when it's drunk: as its description says ("+2d4+2 HP"), or by its name (a
 * Potion of Healing is the SRD's), whichever `byDescription` puts first; "" when it's neither.
 */
export function potionIn(item, byDescription = true) {
  const written = POTION_DICE.exec(statBlock(item?.description))?.[1].replace(/\s+/gu, "") ?? "";
  const name = String(item?.name ?? "").toLowerCase();
  const linked = (name && POTION_NAMES.find((entry) => name.includes(entry.name.toLowerCase()))?.heal) || "";
  return byDescription ? written || linked : linked || written;
}

/** How many of Wanderworld's coins a gold piece is worth (the smith's prices are about three times the SRD's). */
const COINS_A_GOLD = 3;
const COIN_GOLD = { cp: 0.01, sp: 0.1, gp: 1, pp: 10 };
/** A worn magic thing in a line, for what's found on a body: "While worn: Armor Class and saving throws 1 better." */
export function magicWords(entry) {
  const parts = [];
  if (entry.ac && entry.saves) parts.push(`Armor Class and saving throws ${entry.ac} better`);
  else if (entry.ac) parts.push(`Armor Class ${entry.ac} better`);
  else if (entry.saves) parts.push(`saving throws ${entry.saves} better`);
  if (entry.bare) parts.push(`Armor Class ${entry.bare} better with no armour or shield on`);
  for (const [ability, score] of Object.entries(entry.set ?? {})) parts.push(`${ability} ${score} if it was less`);
  for (const [ability, amount] of Object.entries(entry.add ?? {})) parts.push(`${ability} ${amount} more`);
  if (entry.spell) parts.push(`spell attacks and DCs ${entry.spell} better`);
  return `While worn: ${parts.join("; ")}.`;
}

/**
 * What a beaten creature of a treasure `tier` had on it (srd.js SRD_LOOT): { coins, items: [{ name,
 * description, quantity }] }. Coin is in Wanderworld's coins; a potion or a magic thing is one of the SRD's
 * of that rarity.
 */
export function lootOf(tier, random = Math.random) {
  const table = SRD_LOOT[tier];
  const found = { coins: 0, items: [] };
  if (!table) return found;
  const pick = (list) => list[Math.floor(random() * list.length)];
  const total = table.entries.reduce((sum, entry) => sum + entry.weight, 0);
  for (let roll = Math.max(1, rollDice(table.rolls, random).total); roll > 0; roll--) {
    let at = random() * total;
    const entry = table.entries.find((each) => (at -= each.weight) < 0) ?? table.entries[0];
    if (entry.coins)
      found.coins += Math.max(
        1,
        Math.round(rollDice(entry.count, random).total * COIN_GOLD[entry.coins] * COINS_A_GOLD),
      );
    const potions = Object.values(SRD_POTIONS).filter((potion) => potion.rarity === entry.potion);
    if (entry.potion && potions.length) {
      const potion = pick(potions);
      found.items.push({
        name: potion.name,
        description: `A stoppered vial. [+${potion.heal} HP when drunk]`,
        quantity: 1,
      });
    }
    const things = Object.values(SRD_MAGIC).filter((thing) => thing.rarity === entry.magic);
    if (entry.magic && things.length) {
      const thing = pick(things);
      found.items.push({ name: thing.name, description: magicWords(thing), quantity: 1 });
    }
  }
  return found;
}

/**
 * What's worn adds up to, with the gear rules: sheet.js wornBonuses' { [stat]: amount }, and beside it
 * `armour` (the body armour worn, by its name: armourIn), `shield` (a shield's bonus) and `rules` (Armor
 * Class is worked out the SRD's way: armourOf). `byDescription`: an equipped thing's description is its
 * stats, and only one that states none goes by its name; off, the other way round.
 */
export function gearWorn(
  sheet,
  items,
  { byDescription = true, rules = true, add = {}, unarmored = "", defense = 0 } = {},
) {
  // (`add`: what their race adds to the abilities. `unarmored`: the ability their class adds to AC with no
  // armour on. `defense`: the Defense fighting style's +1 in armour.)
  const total = { ...add };
  let armour = null;
  let shield = 0;
  const sets = {};
  for (const item of Array.isArray(items) ? items : []) {
    if (typeof item?.location !== "string" || !item.location.startsWith("equipped:")) continue;
    const stated = bonusesIn(statBlock(item.description), sheet);
    const linked = rules ? armourIn(item) : null;
    if (linked && !(byDescription && stated.length)) {
      if (linked.kind === "shield") shield = Math.max(shield, linked.bonus + linked.plus);
      else if (!armour || linked.ac + linked.plus > armour.ac + armour.plus) armour = linked;
      continue;
    }
    // (A worn magic thing known by its name: a Ring of Protection, an Amulet of Health.)
    const charm = rules ? accessoryIn(item) : null;
    if (charm && !(byDescription && stated.length)) {
      for (const key of ["ac", "bare", "saves", "spell"]) if (charm[key]) total[key] = (total[key] ?? 0) + charm[key];
      for (const [ability, amount] of Object.entries(charm.add ?? {})) total[ability] = (total[ability] ?? 0) + amount;
      for (const [ability, score] of Object.entries(charm.set ?? {}))
        sets[ability] = Math.max(sets[ability] ?? 0, score);
      continue;
    }
    for (const bonus of stated) {
      const key = bonus.max ? `max:${bonus.stat}` : bonus.stat;
      total[key] = (total[key] ?? 0) + bonus.amount;
    }
  }
  // (An ability a worn thing sets: up to that number, if it was less with everything else counted.)
  for (const [ability, score] of Object.entries(sets)) {
    const now = valueOf(sheet, ability) + (total[ability] ?? 0);
    if (score > now) total[ability] = (total[ability] ?? 0) + score - now;
  }
  if (armour) total.armour = armour;
  if (shield) total.shield = shield;
  if (rules) total.rules = true;
  if (unarmored) total.unarmored = unarmored;
  if (defense) total.defense = defense;
  if (rules) total.acTotal = armourOf(sheet, total); // (the AC all of it comes to, for showing)
  return total;
}

/** The proficiency bonus at `level`, the SRD's: +2 to level 4, +3 to 8, +4 to 12, +5 to 16, +6 after. */
export const proficiency = (level) => 2 + Math.floor((Math.max(1, Math.min(20, Math.round(level) || 1)) - 1) / 4);

/**
 * `damage` of `type` as `foe` takes it: twice over if it's vulnerable to that, half (rounded down) if it
 * resists it, none if it's immune. { damage, how: "vulnerable" | "resists" | "immune" | "" }.
 */
export function typedDamage(damage, type, foe, magical = false) {
  // (An entry is a kind of damage, or { type, except: ["magical", …] }: that kind unless the blow is magical.)
  const has = (list) =>
    !!type &&
    Array.isArray(list) &&
    list.some((entry) =>
      typeof entry === "string"
        ? entry === type
        : entry?.type === type && !(magical && entry.except?.includes("magical")),
    );
  if (damage <= 0 || !foe) return { damage, how: "" };
  if (has(foe.immune)) return { damage: 0, how: "immune" };
  if (has(foe.vulnerable)) return { damage: damage * 2, how: "vulnerable" };
  if (has(foe.resist)) return { damage: Math.floor(damage / 2), how: "resists" };
  return { damage, how: "" };
}
/** That, in a few words for the telling: " (doubled: it can't bear fire)", "" when it's as rolled. */
export const typedWords = (how, type) =>
  how === "vulnerable"
    ? ` (doubled: ${type} is its weakness)`
    : how === "resists"
      ? ` (halved: it resists ${type})`
      : how === "immune"
        ? ` (nothing: ${type} can't hurt it)`
        : "";

/**
 * What the player shoots with, of what they carry: the bow, crossbow or sling they have equipped, else the
 * best they carry, as { ...weapon, worn (it's the one equipped) }; null when they have none.
 */
export function bowOf(items, byDescription = true) {
  const all = (Array.isArray(items) ? items : [])
    .map((item) => ({ item, weapon: weaponIn(item, byDescription) }))
    .filter((entry) => entry.weapon?.range > 0);
  const worn = all.filter((entry) => String(entry.item.location ?? "").startsWith("equipped:"));
  const best = (list) =>
    list.reduce((top, entry) => (!top || mean(entry.weapon.damage) > mean(top.weapon.damage) ? entry : top), null);
  const chosen = best(worn) ?? best(all);
  return chosen ? { ...chosen.weapon, worn: worn.includes(chosen) } : null;
}

/**
 * What the player fights with: a weapon they have equipped, else the best they carry (so an axe just made
 * is of use before they've learned where things are worn), else their bare hands. `items`: Quartermaster's.
 */
export function weaponOf(items, byDescription = true) {
  const all = (Array.isArray(items) ? items : []).map((item) => ({ item, weapon: weaponIn(item, byDescription) }));
  const weapons = all.filter((entry) => entry.weapon && !entry.weapon.range); // (a bow isn't swung)
  const worn = weapons.filter((entry) => String(entry.item.location ?? "").startsWith("equipped:"));
  const best = (list) =>
    list.reduce((top, entry) => (!top || mean(entry.weapon.damage) > mean(top.weapon.damage) ? entry : top), null);
  return (best(worn) ?? best(weapons))?.weapon ?? UNARMED;
}

/**
 * What's in the player's other hand, for an off-hand attack: with two light weapons equipped (daggers,
 * shortswords, handaxes), the lesser of them, marked `offhand` (its damage has no ability modifier added,
 * unless that's a penalty); null with fewer.
 */
export function offhandOf(items, byDescription = true) {
  const light = (Array.isArray(items) ? items : [])
    .filter((item) => String(item?.location ?? "").startsWith("equipped:"))
    .map((item) => weaponIn(item, byDescription))
    .filter((weapon) => weapon?.light && !weapon.range)
    .sort((a, b) => mean(b.damage) - mean(a.damage));
  return light.length >= 2 ? { ...light[1], offhand: true } : null;
}

/** Where a thing is worn or held, by a word in its name, for what a weapon or armour doesn't settle (Quartermaster's slots). */
const SLOT_WORDS = [
  [/\b(?:helm|helmet|hat|hood|cap|crown|circlet|headband|coif|mask)\b/iu, "head"],
  [/\b(?:amulet|necklace|pendant|periapt|scarf|collar|torc)\b/iu, "neck"],
  [/\b(?:goggles|spectacles|glasses|eyepatch|lenses)\b/iu, "eyes"],
  [/\bearrings?\b/iu, "ears"],
  [/\b(?:cloak|cape|mantle|backpack|pack|quiver|wings)\b/iu, "back"],
  [/\b(?:gloves?|gauntlets?|bracers?|mittens?|vambraces?)\b/iu, "hands"],
  [/\b(?:boots?|shoes?|sandals?|slippers?|sabatons?)\b/iu, "feet"],
  [/\b(?:socks|stockings)\b/iu, "socks"],
  [/\b(?:belt|girdle|sash)\b/iu, "belt"],
  [/\b(?:greaves|chausses|tassets)\b/iu, "armor_legs"],
  [/\b(?:trousers|breeches|pants|skirt|hose|leggings|kilt)\b/iu, "clothing_legs"],
  [/\b(?:robes?|coat|jacket|surcoat|tabard|vest|jerkin)\b/iu, "outerwear_torso"],
  [/\b(?:shirt|tunic|blouse|dress|gown|doublet|smock)\b/iu, "clothing_torso"],
  [/\b(?:ring|bracelet|brooch|charm|bangle|anklet)\b/iu, "extra_wearable_1"],
  [/\b(?:rod|torch|lantern|wand)\b/iu, "weapon_right_hand"],
];
/**
 * The slot something would be put on in (one of Quartermaster's: "weapon_right_hand", "armor_torso", "head",
 * …), or "" for a thing that isn't worn or held: a weapon in the right hand, a shield in the left, armour
 * on the body, and the rest by a word in its name (a hat, a cloak, boots, a ring).
 */
export function slotOf(item, byDescription = true) {
  const armour = armourIn(item);
  if (armour) return armour.kind === "shield" ? "weapon_left_hand" : "armor_torso";
  if (weaponIn(item, byDescription)) return "weapon_right_hand";
  const name = String(item?.name ?? "");
  return SLOT_WORDS.find(([named]) => named.test(name))?.[1] ?? "";
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
export function playerStrike({ sheet, worn = {}, weapon = UNARMED, foe, prof = 0, mods = {} }, random = Math.random) {
  // (A bow goes by Dexterity, as the SRD has it; anything swung by Strength; a finesse weapon by the better.)
  const of = (attribute) => modifier(valueOf(sheet, attribute) + (worn[attribute] ?? 0));
  // (Something thrown goes by Strength like a blow, though it has a range.)
  const strength =
    weapon.range && !weapon.hurled
      ? of("dexterity")
      : weapon.finesse
        ? Math.max(of("strength"), of("dexterity"))
        : of("strength");
  const result = attackRoll(
    {
      // (`mods`: what their class, fighting style and what they've called on add: build.js, main.js strikeMods.)
      bonus: strength + prof + weapon.attack + (worn.attack ?? 0) + (mods.attack ?? 0),
      ac: foe.ac,
      damage: weapon.damage,
      // (An off-hand blow adds no ability modifier to its damage, unless it's a penalty.)
      damageBonus:
        (weapon.offhand ? Math.min(0, strength) : strength) +
        (weapon.plus ?? 0) +
        (worn.damage ?? 0) +
        (mods.damage ?? 0),
      critFrom: mods.critFrom ?? 20,
      more: mods.more ?? [],
      reroll: mods.reroll ?? 0,
    },
    random,
  );
  // (What it's made of matters to some: a skeleton takes a blunt blow twice over.)
  const typed = typedDamage(result.damage, weapon.type, foe, !!weapon.plus);
  return { ...result, damage: typed.damage, how: typed.how, type: weapon.type, ac: foe.ac };
}

/**
 * The player's AC. As the sheet has it with what they wear; or, with the gear rules (`worn.rules`, from
 * gearWorn), the SRD's way: armour's own number in place of 10, as much of the Dexterity modifier as the
 * armour lets through (all of it in none), a shield, and anything else worn that says "+1 AC". The sheet's
 * AC stays the base: 10 is "nothing of their own", and what's over or under it still counts.
 */
export function armourOf(sheet, worn = {}) {
  const own = valueOf(sheet, "ac") + (worn.ac ?? 0);
  if (!worn.rules) return own;
  const dex = modifier(valueOf(sheet, "dexterity") + (worn.dexterity ?? 0));
  const armour = worn.armour;
  // (No armour on: a barbarian adds Constitution, a monk Wisdom, and a monk only with no shield either.)
  const bare =
    worn.unarmored && !armour && !(worn.unarmored === "wisdom" && worn.shield)
      ? Math.max(0, modifier(valueOf(sheet, worn.unarmored) + (worn[worn.unarmored] ?? 0)))
      : 0;
  // (Heavy armour adds no Dexterity modifier, not even a negative one; light and medium add it, up to theirs.)
  const body = armour
    ? armour.ac + armour.plus + (armour.kind === "heavy" ? 0 : Math.min(dex, armour.dex)) + (worn.defense ?? 0)
    : 10 + dex + bare + (worn.shield ? 0 : (worn.bare ?? 0)); // (`bare`: Bracers of Defense, with no shield either)
  return own - 10 + body + (worn.shield ?? 0);
}

/**
 * A creature's Multiattack as it's made here, from its `blows` (srd.js): [{ with, ifHit }], the first being
 * the blow of its own attack. `with`: the numbers of another attack, { attack, damage, type } (a troll's
 * claw after its bite), or null for its own; `ifHit`: the blow (by its place here) that must have landed
 * first (a grick's beak). With `holds` on, its holding attack's blows (a roper's tendrils) are left to the
 * hold (grapple.js); off, those that deal damage are plain blows (an otyugh's tentacles), the rest none.
 */
export function multiattack(stats, holds) {
  const kept = (stats?.blows ?? [{}])
    .map((blow, at) => ({ blow, at }))
    .filter(({ blow }) => !blow.hold || (!holds && blow.damage));
  if (!kept.length) return [{ with: null }];
  return kept.map(({ blow }) => ({
    with: blow.damage ? { attack: blow.attack, damage: blow.damage, type: blow.type } : null,
    ...(Number.isInteger(blow.ifHit) ? { ifHit: kept.findIndex(({ at }) => at === blow.ifHit) } : {}),
  }));
}

/**
 * A creature's attack on the player. `guarded` (they're blocking): it's rolled twice and the worse for the
 * creature counts. { roll, total, hit, crit, damage, ac, guarded }.
 */
export function foeStrike(
  { foe, sheet, worn = {}, guarded = false, hindered = false, keen = false },
  random = Math.random,
) {
  const ac = armourOf(sheet, worn);
  const roll = () =>
    attackRoll({ bonus: foe.attack, ac, damage: foe.damage, damageBonus: foe.damageBonus ?? 0 }, random);
  const first = roll();
  // (`hindered`: blinded, say, by a spell. Rolled twice like a blocked one, the worse counting. `keen`: it has
  // advantage (its pack is beside it, or its target is down or held): the better of two. Both, and it's one roll.)
  const worse = guarded || hindered;
  if (worse === keen) return { ...first, ac, guarded, ...(worse ? { hindered } : {}) };
  const second = roll();
  if (keen) return { ...(second.roll > first.roll ? second : first), ac, guarded: false, keen: true };
  return { ...(second.roll < first.roll ? second : first), ac, guarded, hindered };
}

/** The same roll made twice, `better` or the worse of the two counting (by the die). */
export function rolledTwice(roll, better) {
  const first = roll();
  const second = roll();
  return second.roll > first.roll === better ? second : first;
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
  const rolled = rollDice(damage, random);
  const full = Math.max(0, rolled.total);
  const dealt = !saved ? full : onSave === "half" ? Math.floor(full / 2) : 0;
  // (`detail`: the damage dice as they fell, and what a save made of them.)
  const detail = rolled.rolls.length
    ? `${diceWords(damage, rolled.rolls, full)} = ${full}${saved ? (onSave === "half" ? ", halved by the save" : ", none on a save") : ""}`
    : "";
  return { roll, total, saved, damage: dealt, detail };
}

/**
 * How a creature that has just been hurt takes it: with a third of its HP or less left it may turn and
 * run (more likely the less it has); else it fights on. "flee" | "fight".
 */
export function foeNerve(hp, max, random = Math.random, temperament = "") {
  if (hp <= 0 || max <= 0) return "fight";
  // (How it's made, where the ruleset says: the mindless and the fanatical never run; a coward does sooner.)
  if (temperament === "mindless" || temperament === "fanatical") return "fight";
  const left = hp / max;
  if (temperament === "cowardly") return left <= 1 / 2 && random() < 0.95 - left ? "flee" : "fight";
  return left <= 1 / 3 && random() < 0.75 - left ? "flee" : "fight";
}

/**
 * What a blow or a spell dealt, with how it came to that: "for 7 (Damage: 1d8 (5) + 2 = 7)", and where the
 * target's make changed it, "for 14 (Damage: 1d8 (5) + 2 = 7; doubled: bludgeoning is its weakness)".
 */
export function dealtWords(result) {
  const made = typedWords(result.how, result.type).replace(/^ \(|\)$/gu, "");
  const inside = [result.detail ? `Damage: ${result.detail}` : "", made].filter(Boolean).join("; ");
  return `for ${result.damage}${inside ? ` (${inside})` : ""}`;
}

/** A d20 and what was added to it, as a sum: "9 + 5 = 14", "9 - 1 = 8", "9" with nothing added. */
export function sumWords(roll, total) {
  const added = total - roll;
  return added ? `${roll} ${added < 0 ? "-" : "+"} ${Math.abs(added)} = ${total}` : String(total);
}
/**
 * An attack roll told whole, so the player can see what made it: "Attack roll: 9 + 5 = 14 against AC 12",
 * with ", a natural 20" (or the roll a wider critical came on) or ", a natural 1" where that's what decided it.
 */
export const rollWords = (result, against = `AC ${result.ac}`) =>
  `Attack roll: ${sumWords(result.roll, result.total)} against ${against}${
    result.crit
      ? result.roll === 20
        ? ", a natural 20"
        : `, a critical on ${result.roll}`
      : result.roll === 1
        ? ", a natural 1"
        : ""
  }`;

/**
 * The player's swing, told: "You swing your iron axe at the wolf (14 against AC 12): a hit, for 6. It has 5
 * of 11 HP left." `what`: the creature ("wolf"); `left` and `max`: its HP after.
 */
export function strikeWords({ who, what, weapon, result, left, max, named = false }) {
  // (`named`: `what` is someone's name, not a kind of creature.)
  const whom = named ? what : `the ${what}`;
  const how = weapon.range
    ? `${weapon.hurled ? "throws" : "shoots"} the ${weapon.name.toLowerCase()} at`
    : weapon.name
      ? `swings the ${weapon.name.toLowerCase()} at`
      : "strikes at";
  const start = `${who} ${how} ${whom} (${rollWords(result)}${result.hampered ? ", hampered" : ""}${result.cover ? ", half cover" : ""})`;
  if (!result.hit) return `${start}: a miss.`;
  const hit = `${start}: ${result.crit ? "a critical hit" : "a hit"}, ${dealtWords(result)}.`;
  if (left <= 0) return `${hit} ${named ? what : `The ${what}`} goes down.`;
  return `${hit} ${named ? `${what} has` : "It has"} ${left} of ${max} HP left.`;
}

/** A creature's attack, told: "The wolf bites at Zoey (15 against AC 12): a hit, for 4. Zoey has 9 of 20 HP." */
export function foeWords({ who, what, verb, result, left, max }) {
  const start = `The ${what} ${verb} at ${who} (${rollWords(result)}${result.guarded ? ", blocked" : ""}${result.hindered ? ", hindered" : ""}${result.keen ? ", with advantage" : ""}${result.cover ? ", half cover" : ""})`;
  if (!result.hit) return `${start}: a miss.`;
  return `${start}: ${result.crit ? "a critical hit" : "a hit"}, ${dealtWords(result)}. ${who} has ${Math.max(0, left)} of ${max} HP.`;
}

/** Someone's blow at the player, told: "Mira swings a mace at Zoey (15 against AC 12): a hit, for 4. Zoey has 9 of 20 HP." */
export function personWords({ name, who, weapon, result, left, max, shot = false }) {
  const a = /^[aeiou]/iu.test(weapon) ? "an" : "a";
  const start = `${name} ${shot ? "shoots" : "swings"} ${a} ${weapon.toLowerCase()} at ${who} (${rollWords(result)}${result.guarded ? ", blocked" : ""})`;
  if (!result.hit) return `${start}: a miss.`;
  return `${start}: ${result.crit ? "a critical hit" : "a hit"}, ${dealtWords(result)}. ${who} has ${Math.max(0, left)} of ${max} HP.`;
}

/**
 * A spell cast at the player by someone whose casting modifier is `wit`. With a saving throw the player
 * rolls it (their own score in that attribute) against the caster's DC (10 + wit), for half or none on a
 * save. One that always hits just rolls its damage. Else a spell attack (a d20 + 2 + wit) against their AC.
 * Only the damage is played: a spell's effect doesn't take hold of the player.
 * { hit, saved, crit, sure, roll, total, against, damage }.
 */
export function spellAtPlayer({ wit = 0, spell, sheet, worn = {}, prof = 2, saveBonus = 0 }, random = Math.random) {
  if (spell.save) {
    const dc = 8 + prof + wit;
    const score = valueOf(sheet, spell.save.attribute.toLowerCase()) || 10;
    const thrown = savingThrow(
      { score, bonus: saveBonus, dc, damage: spell.damage ?? 0, onSave: spell.save.onSave },
      random,
    );
    return {
      hit: thrown.damage > 0,
      saved: thrown.saved,
      crit: false,
      sure: false,
      roll: thrown.roll,
      total: thrown.total,
      against: `DC ${dc}`,
      damage: thrown.damage,
      detail: thrown.detail,
    };
  }
  if (spell.sure) {
    const fell = spell.damage ? rollDice(spell.damage, random) : null;
    const damage = fell ? Math.max(1, fell.total) : 0;
    const detail = fell?.rolls.length ? `${diceWords(spell.damage, fell.rolls, damage)} = ${damage}` : "";
    return { hit: true, saved: false, crit: false, sure: true, roll: 0, total: 0, against: "", damage, detail };
  }
  const ac = armourOf(sheet, worn);
  const result = attackRoll({ bonus: prof + wit, ac, damage: spell.damage ?? "0" }, random);
  return { ...result, ac, saved: false, sure: false, against: `AC ${ac}` };
}

/** A spell at the player, told: "Odo casts Fire Bolt at Zoey (17 against AC 12): a hit, for 6. Zoey has 4 of 10 HP." */
export function castAtWords({ name, spell, who, result, left, max }) {
  const start = `${name} casts ${spell} at ${who}`;
  const hp = `${who} has ${Math.max(0, left)} of ${max} HP.`;
  if (result.sure) return `${start} (no roll: it can't miss): ${dealtWords(result)}. ${hp}`;
  if (result.against.startsWith("DC")) {
    const thrown = `${who}'s saving throw: ${sumWords(result.roll, result.total)} against ${result.against}`;
    if (!result.saved) return `${start} (${thrown}): failed, ${dealtWords(result)}. ${hp}`;
    return result.damage
      ? `${start} (${thrown}): saved, ${dealtWords(result)}. ${hp}`
      : `${start} (${thrown}): saved, nothing comes of it.`;
  }
  if (!result.hit) return `${start} (${rollWords(result)}): a miss.`;
  return `${start} (${rollWords(result)}): ${result.crit ? "a critical hit" : "a hit"}, ${dealtWords(result)}. ${hp}`;
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
/**
 * The effects a spell can leave, and what each does here: held where it stands ("hold"), sent running
 * ("flee"), at half its pace ("slow"), its own attacks rolled twice with the worse counting ("hinder"),
 * attacks on it rolled twice with the better counting ("mark"), or no longer fighting until it's struck ("calm").
 */
const EFFECTS = {
  stunned: "hold",
  paralyzed: "hold",
  restrained: "hold",
  incapacitated: "hold",
  asleep: "hold",
  prone: "hold",
  frightened: "flee",
  slowed: "slow",
  blinded: "hinder",
  hindered: "hinder",
  marked: "mark",
  charmed: "calm",
  calmed: "calm",
};
const SPELL_PUSH = /\bpush(?:ed|es)?\s+(?:back\s+)?(\d{1,2}(?:\.\d)?)\s*m\b/iu;
const SPELL_AREA = /\barea\s+(\d{1,2}(?:\.\d)?)/iu;
const SPELL_EFFECT = new RegExp(
  `\\b(${Object.keys(EFFECTS).join("|")})\\b(?:\\s+(?:for\\s+)?(\\d{1,3})\\s*seconds?)?`,
  "iu",
);

/** How far a spell reaches when its description doesn't say (metres). */
export const SPELL_REACH = 14;
/**
 * What a spell of `level` costs in mana: its level. A cantrip (level 0) costs nothing, a first-level spell
 * one, and so on: the level of the spell slot it would take, so mana and slots agree.
 */
export const spellCost = (level) => Math.max(0, Math.round(level) || 0);

/**
 * A spell's rule as its description says it, for one taken from the SRD (srd.js): "Cantrip. 1d10 fire
 * damage. Range 24.", "Level 1. 2 mana. 3d6 fire damage. Dexterity save for half. Range 5.", "Level 2. 3
 * mana. Wisdom save or paralyzed 8 seconds. Range 18.", "Level 1. 2 mana. +1d8 HP." What it reads back as
 * is `spellIn`.
 */
export function spellRule(spell) {
  const parts = [spell.level > 0 ? `Level ${spell.level}` : "Cantrip"];
  if (spellCost(spell.level)) parts.push(`${spellCost(spell.level)} mana`);
  if (spell.reaction === "shield") parts.push("Reaction: +5 AC against a blow that would land (it casts itself)");
  if (spell.reaction === "counter") parts.push("Reaction: a spell cast at you comes to nothing (it casts itself)");
  if (spell.heal) parts.push(`+${spell.heal} HP`);
  if (spell.damage) parts.push(`${spell.damage}${spell.type ? ` ${spell.type}` : ""} damage`);
  if (spell.sure) parts.push("Always hits");
  const seconds = spell.seconds ?? 8;
  if (spell.save && spell.effect && !spell.damage)
    parts.push(`${spell.save.attribute} save or ${spell.effect} ${seconds} seconds`);
  else if (spell.save) parts.push(`${spell.save.attribute} save for ${spell.save.onSave === "half" ? "half" : "none"}`);
  if (spell.effect && (spell.damage || !spell.save))
    parts.push(`${spell.effect[0].toUpperCase()}${spell.effect.slice(1)} ${seconds} seconds`);
  if (spell.push) parts.push(`Pushed ${spell.push} m`);
  if (spell.area) parts.push(`Area ${spell.area}${spell.shape ? ` (${spell.shape})` : ""}`);
  if (spell.up) parts.push(`Higher: +${spell.up} a level`);
  if (spell.grows) parts.push("Grows with level");
  if (spell.drain) parts.push("Heals the caster for half");
  if (spell.conc && spell.effect) parts.push("Concentration");
  if (spell.bonus) parts.push("Bonus action");
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
  const push = Number(SPELL_PUSH.exec(text)?.[1] ?? 0);
  // (One cast in answer to something: main.js casts it when that happens.)
  const answers = /\breaction:\s*\+5 ac\b/iu.test(text)
    ? "shield"
    : /\breaction:[^.]*\bspell\b/iu.test(text)
      ? "counter"
      : "";
  if (!damage && !heal && !effect && !push && !answers) return null;
  const save = SPELL_SAVE.exec(text);
  const name = effect?.[1].toLowerCase();
  return {
    cost: Number(SPELL_COST.exec(text)?.[1] ?? 0),
    damage: damage ? damage[1].replace(/\s+/gu, "") : null,
    type: damage?.[2]?.toLowerCase() ?? "",
    heal: heal ? heal[1].replace(/\s+/gu, "") : null,
    sure: /\balways hits\b/iu.test(text),
    level: Number(/\blevel\s+(\d)\b/iu.exec(text)?.[1] ?? (/\bcantrip\b/iu.test(text) ? 0 : -1)),
    bonus: /\bbonus action\b/iu.test(text),
    save: save ? { attribute: save[1].toLowerCase(), onSave: /\bhalf\b/iu.test(text) ? "half" : "none" } : null,
    effect: effect ? { name, kind: EFFECTS[name], seconds: Number(effect[2] ?? 6) } : null,
    // (What lands also shoves it back this many metres; everything within `area` metres of it is caught
    // too; the caster is healed for half of what it deals.)
    push,
    area: Number(SPELL_AREA.exec(text)?.[1] ?? 0),
    drain: /\bheals the caster\b/iu.test(text),
    reaction: answers,
    // (Its shape, for how it looks; and how it grows: dice more for each slot level above its own, or with the caster's level.)
    shape: /\barea\s+[\d.]+\s*\((cone|line|cube|burst)\)/iu.exec(text)?.[1].toLowerCase() ?? "",
    up: /\bhigher:\s*\+(\d{0,2}d\d{1,3})/iu.exec(text)?.[1] ?? "",
    grows: /\bgrows with level\b/iu.test(text),
    // (Its effect lasts only while the caster keeps their mind on it: a blow may break it, another such spell ends it.)
    conc: /\bconcentration\b/iu.test(text),
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
export function spellStrike({ wit = 0, spell, foe, prof = 2 }, random = Math.random) {
  const result = spellRolled({ wit, spell, foe, prof }, random);
  const typed = typedDamage(result.damage, spell.type, foe, true);
  // (What it shoves back, it shoves on a failed save or a hit.)
  return {
    ...result,
    damage: typed.damage,
    how: typed.how,
    type: spell.type,
    push: result.hit ? (spell.push ?? 0) : 0,
  };
}
function spellRolled({ wit, spell, foe, prof }, random) {
  if (spell.save) {
    const dc = 8 + prof + wit;
    const thrown = savingThrow(
      {
        score: 10,
        // (Its own saving throw in that attribute where the SRD gives one.)
        bonus: foe.saves?.[spell.save.attribute.toLowerCase()] ?? foe.save ?? Math.floor(foe.attack / 2),
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
      detail: thrown.detail,
      effect: thrown.saved ? null : spell.effect,
    };
  }
  if (spell.sure) {
    const fell = spell.damage ? rollDice(spell.damage, random) : null;
    const damage = fell ? Math.max(1, fell.total) : 0;
    const detail = fell?.rolls.length ? `${diceWords(spell.damage, fell.rolls, damage)} = ${damage}` : "";
    return {
      hit: true,
      saved: false,
      crit: false,
      sure: true,
      roll: 0,
      total: 0,
      against: "",
      damage,
      detail,
      effect: spell.effect,
    };
  }
  const result = attackRoll({ bonus: prof + wit, ac: foe.ac, damage: spell.damage ?? "0" }, random);
  return {
    hit: result.hit,
    saved: false,
    crit: result.crit,
    sure: false,
    roll: result.roll,
    total: result.total,
    against: `AC ${foe.ac}`,
    damage: result.hit && spell.damage ? result.damage : 0,
    detail: result.hit && spell.damage ? result.detail : "",
    effect: result.hit ? spell.effect : null,
  };
}

/** `dice` with `steps` times `more` added, where they're the same die ("8d6" and two of "1d6" is "10d6"); else as it was. */
export function grownDice(dice, more, steps) {
  const a = /^(\d*)d(\d+)([+-]\d+)?$/u.exec(String(dice ?? ""));
  const b = /^(\d*)d(\d+)([+-]\d+)?$/u.exec(String(more ?? ""));
  if (!a || !b || a[2] !== b[2] || steps <= 0) return dice;
  const add = Number(a[3] ?? 0) + Number(b[3] ?? 0) * steps;
  return `${Number(a[1] || 1) + Number(b[1] || 1) * steps}d${a[2]}${add ? (add > 0 ? `+${add}` : add) : ""}`;
}

/**
 * A spell as it's cast now: from a `slot` above its own level its dice grow by its `up` for each level above
 * (Fireball from a fifth-level slot is 10d6), and a cantrip that `grows` rolls its dice again at the caster's
 * levels 5, 11 and 17 (Fire Bolt is 2d10 at 5). The spell itself when neither applies.
 */
export function spellGrown(spell, { slot = 0, level = 1 } = {}) {
  const steps =
    spell.level > 0
      ? spell.up
        ? Math.max(0, slot - spell.level)
        : 0
      : spell.grows
        ? level >= 17
          ? 3
          : level >= 11
            ? 2
            : level >= 5
              ? 1
              : 0
        : 0;
  if (!steps) return spell;
  const grow = (dice) =>
    dice ? grownDice(dice, spell.level > 0 ? spell.up : String(dice).replace(/[+-]\d+$/u, ""), steps) : dice;
  return spell.damage ? { ...spell, damage: grow(spell.damage) } : { ...spell, heal: grow(spell.heal) };
}

/** The player's casting modifier: Intelligence's, with what they wear. */
export const witOf = (sheet, worn = {}, attribute = "intelligence") =>
  modifier(valueOf(sheet, attribute) + (typeof worn[attribute] === "number" ? worn[attribute] : 0));

/**
 * A spell cast at something, told: "Zoey casts Frost burst at the wolf (its dexterity save: 13 against DC
 * 13): it saves, for 4. It has 7 of 11 HP left." `named`: `what` is someone's name, not a kind of creature.
 */
export function spellWords({ who, name, what, spell, result, left, max, named = false }) {
  const whom = named ? what : `the ${what}`;
  const their = named ? "their" : "its";
  const start = `${who} casts ${name} at ${whom}`;
  const rolled = result.sure
    ? " (no roll: it can't miss)"
    : spell.save
      ? ` (${their} ${spell.save.attribute} save: ${sumWords(result.roll, result.total)} against ${result.against})`
      : ` (${rollWords(result, result.against)}${result.cover ? ", half cover" : ""})`;
  const parts = [];
  if (result.sure) {
    // (Nothing to say of the roll: what it did follows.)
  } else if (spell.save)
    parts.push(result.saved ? (named ? "they save" : "it saves") : named ? "they fail" : "it fails");
  else parts.push(result.crit ? "a critical hit" : result.hit ? "a hit" : "a miss");
  if (result.damage > 0 || result.how) parts.push(dealtWords(result));
  if (result.effect) parts.push(`${result.effect.name} for ${result.effect.seconds} seconds`);
  if (result.push) parts.push(`pushed back ${result.push} m`);
  const told = `${start}${rolled}: ${parts.join(", ")}.`;
  if (result.damage <= 0) return told;
  if (left <= 0) return `${told} ${named ? what : `The ${what}`} goes down.`;
  return `${told} ${named ? `${what} has` : "It has"} ${left} of ${max} HP left.`;
}

// ── Fights by turns ──────────────────────────────────────────────────────────

/** How far someone may move in one turn (metres: the SRD's thirty feet). */
export const TURN_MOVE = 9;

/**
 * The order of a fight by turns: each of `entries` ([{ id, bonus }]) rolls a d20 and adds its bonus, the
 * highest going first (a tie to the higher bonus, then to whoever was listed first). [{ id, roll, total }].
 */
export function initiativeOrder(entries, random = Math.random) {
  return entries
    .map((entry, listed) => {
      const roll = 1 + Math.floor(random() * 20);
      return { id: entry.id, roll, total: roll + (entry.bonus ?? 0), bonus: entry.bonus ?? 0, listed };
    })
    .sort((a, b) => b.total - a.total || b.bonus - a.bonus || a.listed - b.listed)
    .map(({ id, roll, total }) => ({ id, roll, total }));
}

/**
 * The spell slots a caster of `level` has: { 1: n, 2: n, 3: n } from the ruleset's step tables (srd.js
 * SRD_SLOTS: for each slot level, [[from this caster level, this many], …]).
 */
export function slotsAt(level, tables) {
  const slots = {};
  for (const [slot, table] of Object.entries(tables ?? {})) {
    let have = 0;
    for (const [from, many] of table) if (level >= from) have = many;
    slots[slot] = have;
  }
  return slots;
}

/**
 * The slot a spell of `level` is cast with: the lowest of that level or higher with one left (`slots`:
 * what they have; `used`: what's spent of each), or 0 when there is none. A cantrip needs none (-1).
 */
export function slotFor(level, slots, used = {}) {
  if (level <= 0) return -1;
  for (const slot of Object.keys(slots)
    .map(Number)
    .sort((a, b) => a - b))
    if (slot >= level && (slots[slot] ?? 0) - (used[slot] ?? 0) > 0) return slot;
  return 0;
}

/**
 * What a turn gives in a fight by turns, by the SRD: one action, one bonus action, nine metres (30 feet), and
 * one attack for an Attack action. A class changes these as it gains levels: Extra Attack gives a barbarian,
 * fighter, monk, paladin or ranger two attacks from level 5 (a fighter three from 11 and four from 20), and
 * Fast Movement and Unarmored Movement give a barbarian (from 5) and a monk (from 2) three metres more.
 * `set`: the player's own numbers ({ actions, bonus, attacks, move }; 0 or nothing leaves that one to the rules).
 */
export function turnBudget(classId = "", level = 1, set = {}, speed = TURN_MOVE) {
  const extra = ["barbarian", "fighter", "monk", "paladin", "ranger"].includes(classId) && level >= 5;
  const attacks = classId === "fighter" && level >= 20 ? 4 : classId === "fighter" && level >= 11 ? 3 : extra ? 2 : 1;
  const fast = (classId === "barbarian" && level >= 5) || (classId === "monk" && level >= 2);
  const or = (own, ruled) => (Number(own) > 0 ? Math.round(Number(own)) : ruled);
  return {
    actions: or(set.actions, 1),
    bonus: or(set.bonus, 1),
    attacks: or(set.attacks, attacks),
    move: or(set.move, speed + (fast ? 3 : 0)),
  };
}
