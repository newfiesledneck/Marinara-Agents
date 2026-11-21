// The character sheet: level, experience, HP, mana, AC, the six attributes, and whatever the player adds
// (stats, attributes, skills, feats, spells, abilities), each with a name, a short description for the model and,
// where it has one, a number. Plus the dice everything rolls with, and the bonuses read out of an item's
// description ("+2 AC", "+10 HP").
//
// Everything about the sheet is in this one module, and a sheet is plain data ({ entries }) kept with the
// world. The user plans to move stats into Quartermaster: when that happens, this module is what gets
// rewritten to read and write there, and nothing else should have to change. So nothing outside it may
// reach into a sheet's shape: read with `entryOf`/`valueOf`/`sheetWords`, change with `changeSheet`/
// `applyChanges`.

/**
 * What an entry can be. A resource always has a most ("HP 14/20"); one of the player's own of any other
 * numbered kind may have one too ("Collected cars 2/40") or be a plain number ("Fame 15"); a feat or a
 * spell has no number. Whether an entry has a most is `"max" in entry`.
 */
export const SHEET_KINDS = ["resource", "stat", "attribute", "skill", "feat", "spell", "ability"];
const NUMBERLESS = new Set(["feat", "spell"]);
const KIND_WORDS = {
  resource: "Resources",
  stat: "Stats",
  attribute: "Attributes",
  skill: "Skills",
  feat: "Feats",
  spell: "Spells",
  ability: "Abilities",
};
export const kindWords = (kind) => KIND_WORDS[kind] ?? "Stats";

/** The sheet every persona starts with. Each can be switched off, none can be deleted. */
const BUILT_IN = [
  { id: "level", kind: "stat", name: "Level", about: "How experienced they are overall.", value: 1 },
  { id: "xp", kind: "stat", name: "XP", about: "Experience earned towards the next level.", value: 0 },
  { id: "hp", kind: "resource", name: "HP", about: "Health. At 0 they are defeated.", value: 20, max: 20 },
  { id: "mana", kind: "resource", name: "Mana", about: "Spent to cast spells.", value: 10, max: 10 },
  { id: "ac", kind: "stat", name: "AC", about: "Armour class: how hard they are to hit.", value: 10 },
  { id: "strength", kind: "attribute", name: "Strength", about: "Physical power.", value: 10 },
  { id: "dexterity", kind: "attribute", name: "Dexterity", about: "Agility, reflexes and aim.", value: 10 },
  { id: "constitution", kind: "attribute", name: "Constitution", about: "Toughness and stamina.", value: 10 },
  { id: "intelligence", kind: "attribute", name: "Intelligence", about: "Reasoning and learning.", value: 10 },
  { id: "wisdom", kind: "attribute", name: "Wisdom", about: "Perception and judgement.", value: 10 },
  { id: "charisma", kind: "attribute", name: "Charisma", about: "Presence and persuasion.", value: 10 },
];
const MAX_OWN = 60;
const LIMIT = 999999;

const words = (value, max) => (typeof value === "string" ? value.replace(/\s+/gu, " ").trim().slice(0, max) : "");
const whole = (value, fallback) =>
  Number.isFinite(Number(value)) && value !== null && value !== ""
    ? Math.max(-LIMIT, Math.min(LIMIT, Math.round(Number(value))))
    : fallback;

function checkEntry(raw, base) {
  const kind = base?.kind ?? (SHEET_KINDS.includes(raw?.kind) ? raw.kind : "stat");
  const entry = {
    id: base?.id ?? words(raw?.id, 60),
    kind,
    name: base?.name ?? words(raw?.name, 40),
    about: words(raw?.about, 200) || base?.about || "",
    on: raw?.on !== false,
  };
  if (!base) entry.own = true;
  if (kind === "ability") return checkAbility(raw, entry);
  if (!NUMBERLESS.has(kind)) entry.value = whole(raw?.value, base?.value ?? 0);
  const given = raw?.max !== null && raw?.max !== undefined && raw?.max !== "" && Number(raw.max) > 0;
  if (kind === "resource" || (!base && !NUMBERLESS.has(kind) && given)) {
    entry.max = Math.max(1, whole(raw?.max, base?.max ?? Math.max(1, entry.value)));
    entry.value = Math.max(0, Math.min(entry.max, entry.value));
  }
  return entry;
}

// ── Abilities of the player's own ────────────────────────────────────────────

/** When an ability's uses come back: after a short rest, a long rest (a sleep), a new day, or never spent (at will). */
export const RECHARGES = { will: "at will", short: "per short rest", long: "per long rest", day: "per day" };
/** Which uses each rest brings back (a long rest is a night's sleep, so a day's come back with it too). */
const RECHARGED = { short: ["short"], long: ["short", "long", "day"], day: ["day"] };
export const ABILITY_SAVES = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"];
const DICE = /^(?:\d{0,2}d\d{1,3}(?:[+-]\d{1,3})?|\d{1,3})$/u;

/**
 * An ability of the player's own: a name and what it does, and as they choose, a number of uses (`max`, with
 * `value` left) that come back by `recharge`, dice for what it does (`dice`, `effect` "damage" or "heal"), and
 * a saving throw against it (`dc`, and `save`, the ability it's made with). Without uses it's at will.
 */
function checkAbility(raw, entry) {
  const uses = Math.max(0, Math.min(99, whole(raw?.max, 0)));
  if (uses && raw?.recharge !== "will") {
    entry.max = uses;
    entry.value = Math.max(0, Math.min(uses, whole(raw?.value, uses)));
  }
  entry.recharge = !entry.max ? "will" : Object.hasOwn(RECHARGED, raw?.recharge) ? raw.recharge : "long";
  const dice = String(raw?.dice ?? "")
    .replace(/\s+/gu, "")
    .toLowerCase();
  if (DICE.test(dice)) {
    entry.dice = dice;
    entry.effect = raw?.effect === "heal" ? "heal" : "damage";
  }
  const dc = whole(raw?.dc, 0);
  if (dc > 0 && ABILITY_SAVES.includes(raw?.save)) {
    entry.dc = Math.min(30, dc);
    entry.save = raw.save;
  }
  return entry;
}

/**
 * An ability used (by its name or id): one use spent where it has uses. { sheet, entry, spent }, `spent`
 * false when none are left (the sheet as it was); null when there's no such ability, or it's switched off.
 */
export function spendAbility(sheet, name) {
  const entry = find(sheet, name);
  if (!entry || entry.kind !== "ability" || !entry.on) return null;
  if (!("max" in entry)) return { sheet, entry, spent: true };
  if (entry.value < 1) return { sheet, entry, spent: false };
  return { sheet: changeSheet(sheet, { set: entry.id, field: "value", value: entry.value - 1 }), entry, spent: true };
}

/** A rest ("short", "long") or a new day ("day") brings back the uses it should: { sheet, back: [names] }. */
export function rechargeAbilities(sheet, rest) {
  const kinds = RECHARGED[rest] ?? [];
  const back = [];
  const entries = sheet.entries.map((entry) => {
    if (entry.kind !== "ability" || !("max" in entry) || entry.value >= entry.max || !kinds.includes(entry.recharge))
      return entry;
    back.push(entry.name);
    return { ...entry, value: entry.max };
  });
  return { sheet: { ...sheet, entries }, back };
}

/** An ability in a few words: "Fire Breath (2d6 damage, DC 13 Dexterity save; 1 of 2 left, per long rest): …". */
export function abilityWords(entry) {
  const capital = (word) => word.charAt(0).toUpperCase() + word.slice(1);
  const does = [
    entry.dice ? `${entry.dice} ${entry.effect === "heal" ? "healing" : "damage"}` : "",
    entry.dc ? `DC ${entry.dc} ${capital(entry.save)} save` : "",
  ].filter(Boolean);
  const uses = "max" in entry ? `${entry.value} of ${entry.max} left, ${RECHARGES[entry.recharge]}` : "at will";
  return `${entry.name} (${[does.join(", "), uses].filter(Boolean).join("; ")})${entry.about ? `: ${entry.about}` : ""}`;
}

/** A sheet from whatever was saved: the built-in entries (as saved, or as they start), then the player's own. */
export function checkSheet(raw) {
  const saved = Array.isArray(raw?.entries) ? raw.entries.filter((entry) => entry && typeof entry === "object") : [];
  const byId = new Map(saved.map((entry) => [entry.id, entry]));
  const builtIn = new Set(BUILT_IN.map((entry) => entry.id));
  const seen = new Set();
  const own = saved
    .filter((entry) => typeof entry.id === "string" && !builtIn.has(entry.id))
    .map((entry) => checkEntry(entry, null))
    .filter((entry) => entry.id && entry.name && !seen.has(entry.id) && seen.add(entry.id))
    .slice(0, MAX_OWN);
  return { entries: [...BUILT_IN.map((base) => checkEntry(byId.get(base.id), base)), ...own] };
}

export const entryOf = (sheet, id) => sheet.entries.find((entry) => entry.id === id) ?? null;
/** An entry's number, 0 when it has none or isn't there. */
export const valueOf = (sheet, id) => entryOf(sheet, id)?.value ?? 0;
/** An attribute's modifier, the d20 way: 10 is +0, 12 is +1, 8 is −1. */
export const modifier = (score) => Math.floor((score - 10) / 2);
/** Experience needed to leave `level`. */
export const xpNeeded = (level) => 100 * Math.max(1, level);

/** An entry by its name or its id, whichever was given (the model and the player name things; the game uses ids). */
export function entryNamed(sheet, name) {
  return find(sheet, name);
}
const SHORT_NAMES = {
  str: "strength",
  dex: "dexterity",
  con: "constitution",
  int: "intelligence",
  wis: "wisdom",
  cha: "charisma",
};
function find(sheet, name) {
  const said = words(String(name ?? ""), 60).toLowerCase();
  // (The six abilities by their short names too: "str" is Strength, "cha" Charisma.)
  const wanted = SHORT_NAMES[said] ?? said;
  if (!wanted) return null;
  return (
    sheet.entries.find((entry) => entry.id.toLowerCase() === wanted) ??
    sheet.entries.find((entry) => entry.name.toLowerCase() === wanted) ??
    null
  );
}

/**
 * One change made by hand, giving the sheet as it then is:
 *   { set: id, field: "value" | "max" | "on" | "about", value }
 *   { add: { kind, name, about, value } }       one of the player's own
 *   { remove: id }                               only one of the player's own
 *   { edit: id, to: { name, about, … } }         one of the player's own written afresh (its id and kind kept)
 */
export function changeSheet(sheet, change) {
  if (change?.add) {
    const name = words(change.add.name, 40);
    if (!name || find(sheet, name) || sheet.entries.filter((entry) => entry.own).length >= MAX_OWN) return sheet;
    const slug =
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/gu, "-")
        .replace(/^-|-$/gu, "") || "entry";
    let id = `own:${slug}`;
    for (let n = 2; entryOf(sheet, id); n++) id = `own:${slug}-${n}`;
    return { entries: [...sheet.entries, checkEntry({ ...change.add, id, name }, null)] };
  }
  if (change?.edit) {
    const name = words(change.to?.name, 40);
    const clash = find(sheet, name);
    if (!name || (clash && clash.id !== change.edit)) return sheet;
    return {
      entries: sheet.entries.map((entry) =>
        entry.own && entry.id === change.edit
          ? checkEntry(
              {
                ...entry,
                // (A new number of uses, and none said to be left: all of them.)
                ...(change.to.max !== entry.max ? { value: undefined } : {}),
                ...change.to,
                id: entry.id,
                kind: entry.kind,
                name,
                on: entry.on,
              },
              null,
            )
          : entry,
      ),
    };
  }
  if (change?.remove) return { entries: sheet.entries.filter((entry) => !(entry.own && entry.id === change.remove)) };
  if (change?.set && ["value", "max", "on", "about"].includes(change.field)) {
    return checkSheet({
      entries: sheet.entries.map((entry) =>
        entry.id === change.set ? { ...entry, [change.field]: change.value } : entry,
      ),
    });
  }
  return sheet;
}

/**
 * Targeted changes, as the model or the game's rules give them: [{ stat (a name or an id), by | to }].
 * Each is checked against the sheet (a resource stays between 0 and its most; something unknown, switched
 * off or without a number is left out). Gives { sheet, applied: [{ id, name, from, to }] }.
 */
export function applyChanges(sheet, changes) {
  let next = sheet;
  const applied = [];
  for (const change of Array.isArray(changes) ? changes.slice(0, 20) : []) {
    const entry = find(next, change?.stat);
    if (!entry || !entry.on || !("value" in entry)) continue;
    const to = Number.isFinite(change.to) ? change.to : Number.isFinite(change.by) ? entry.value + change.by : null;
    if (to === null) continue;
    next = changeSheet(next, { set: entry.id, field: "value", value: to });
    const now = valueOf(next, entry.id);
    if (now !== entry.value) applied.push({ id: entry.id, name: entry.name, from: entry.value, to: now });
  }
  return { sheet: next, applied };
}

/**
 * What a level gained gives: more HP at most (4 and the Constitution modifier, 1 at least), 2 more mana at
 * most, and HP back to full.
 */
export const LEVEL_GAIN = { hp: 4, mana: 2 };

/**
 * Experience earned: the level rises while there's enough for it, and each level gained raises what HP and
 * mana can be and restores HP (LEVEL_GAIN). Gives { sheet, levels } (how many were gained).
 */
export function gainXp(sheet, amount) {
  let level = valueOf(sheet, "level");
  let xp = valueOf(sheet, "xp") + Math.max(0, Math.round(amount) || 0);
  let levels = 0;
  while (xp >= xpNeeded(level) && levels < 50) {
    xp -= xpNeeded(level);
    level += 1;
    levels += 1;
  }
  let next = sheet;
  if (levels) {
    const hp = entryOf(sheet, "hp");
    const mana = entryOf(sheet, "mana");
    const more = levels * Math.max(1, LEVEL_GAIN.hp + modifier(valueOf(sheet, "constitution")));
    if (hp) next = changeSheet(next, { set: "hp", field: "max", value: hp.max + more });
    if (hp) next = changeSheet(next, { set: "hp", field: "value", value: hp.max + more });
    if (mana) next = changeSheet(next, { set: "mana", field: "max", value: mana.max + levels * LEVEL_GAIN.mana });
  }
  // (Set whether or not they're ticked: a level is kept even while it isn't shown.)
  next = changeSheet(next, { set: "level", field: "value", value: level });
  next = changeSheet(next, { set: "xp", field: "value", value: xp });
  return { sheet: next, levels };
}

/** The sheet with every resource (HP, mana, the player's own with a most) at its most. */
export function toppedUp(sheet) {
  return {
    ...sheet,
    entries: sheet.entries.map((entry) =>
      "max" in entry && entry.value !== entry.max ? { ...entry, value: entry.max } : entry,
    ),
  };
}

// ── Bonuses written in an item's description ─────────────────────────────────

/**
 * The part of an item's description that sets its stats: what stands in square brackets ("A sword with a
 * light blue glow. [1d8 slashing damage, +1 to attack]"). Nothing outside them is read, so a description can
 * say what it likes. Several blocks are read as one; "" when there is none.
 */
export const statBlock = (text) =>
  [...String(text ?? "").matchAll(/\[([^\]]*)\]/gu)].map((match) => match[1]).join(". ");

const STAT_SENTENCE = /(\d{0,2}d\d{1,3}[^.]*\bdamage\b|[+\-−]\s?\d|^\s*(?:Range \d+|Finesse|Weapon:|Tool:|Armou?r:))/iu;
/**
 * A description written before stats went in a block, with its stat sentences moved into one at its end:
 * "A red draught. +15 HP when drunk." is "A red draught. [+15 HP when drunk]". One that has a block already,
 * or states nothing, comes back as it was.
 */
export function bracketed(description) {
  const text = String(description ?? "").trim();
  if (!text || text.includes("[")) return text;
  const parts = text.split(/(?<=\.)\s+/u);
  const stats = parts.filter((part) => STAT_SENTENCE.test(part));
  if (!stats.length) return text;
  const flavour = parts.filter((part) => !STAT_SENTENCE.test(part));
  return `${flavour.join(" ")}${flavour.length ? " " : ""}[${stats.map((part) => part.replace(/\.$/u, "")).join(". ")}]`;
}

/**
 * The bonuses a description states: "+2 AC", "+10 HP", "-1 Dexterity", "+2 to attack", "+1 damage".
 * [{ stat: an entry's id, or "attack" | "damage", amount }]. Only what the sheet has, or those two.
 */
export function bonusesIn(text, sheet) {
  const found = [];
  const pattern = /([+\-−])\s?(\d{1,4})\s*(?:to\s+)?([A-Za-z][A-Za-z' ]{0,38})/gu;
  for (const match of String(text ?? "").matchAll(pattern)) {
    const amount = (match[1] === "+" ? 1 : -1) * Number(match[2]);
    // The longest run of words after the number that names something: "+2 to attack rolls" is attack.
    const parts = match[3].trim().split(/\s+/u);
    // ("+5 Max HP": it's the most of it that changes, for one that has a most.)
    const most = parts.length > 1 && parts[0].toLowerCase() === "max";
    if (most) parts.shift();
    for (let take = Math.min(parts.length, 4); take >= 1; take--) {
      const name = parts.slice(0, take).join(" ").toLowerCase();
      const special = name === "attack" || name === "to hit" ? "attack" : name === "damage" ? "damage" : null;
      const entry = special ? null : find(sheet, name);
      if (most) {
        if (entry && "max" in entry) {
          found.push({ stat: entry.id, amount, max: true });
          break;
        }
        continue;
      }
      if (special || (entry && !NUMBERLESS.has(entry.kind))) {
        found.push({ stat: special ?? entry.id, amount });
        break;
      }
    }
  }
  return found;
}

/**
 * What's worn adds up to: { [stat]: amount } from every equipped item's description. `items`:
 * Quartermaster's ([{ description, location }]); a worn item's location starts "equipped:".
 */
export function wornBonuses(sheet, items) {
  const total = {};
  for (const item of Array.isArray(items) ? items : []) {
    if (typeof item?.location !== "string" || !item.location.startsWith("equipped:")) continue;
    for (const bonus of bonusesIn(statBlock(item.description), sheet)) {
      const key = bonus.max ? `max:${bonus.stat}` : bonus.stat; // (what it adds to the most of something: wornMax)
      total[key] = (total[key] ?? 0) + bonus.amount;
    }
  }
  return total;
}

/**
 * Using something up: what its block says is applied once and stays. "+15 HP" mends (up to the most), "+1
 * Souls" adds to a number that has no most, "+1 Strength" raises it for good, and "+5 Max HP" raises the
 * most of something and what's in it by as much. "+N to attack" and "+N damage" are for worn things only.
 */
export function useItem(sheet, description) {
  const bonuses = bonusesIn(statBlock(description), sheet).filter((bonus) => entryOf(sheet, bonus.stat));
  let next = sheet;
  const applied = [];
  for (const bonus of bonuses.filter((entry) => entry.max)) {
    const entry = entryOf(next, bonus.stat);
    const to = Math.max(1, entry.max + bonus.amount);
    next = changeSheet(next, { set: entry.id, field: "max", value: to });
    next = changeSheet(next, { set: entry.id, field: "value", value: entry.value + Math.max(0, bonus.amount) });
    applied.push({ id: entry.id, name: `Max ${entry.name}`, from: entry.max, to });
  }
  const changed = applyChanges(
    next,
    bonuses.filter((bonus) => !bonus.max).map((bonus) => ({ stat: bonus.stat, by: bonus.amount })),
  );
  return { sheet: changed.sheet, applied: [...applied, ...changed.applied] };
}

/** What worn things add to the most of each resource: { [id]: amount } (wornBonuses' "max:<id>" keys). */
export function wornMax(worn) {
  return Object.fromEntries(
    Object.entries(worn ?? {})
      .filter(([key, amount]) => key.startsWith("max:") && amount)
      .map(([key, amount]) => [key.slice(4), amount]),
  );
}

// ── The sheet in words, for a prompt ─────────────────────────────────────────

/**
 * The entries that are switched on, as a model is told them: "Level 2, XP 40/200, AC 12 (10, +2 from what
 * they wear). HP 14/20, Mana 10/10. Strength 12 (+1), … Skills: Fishing 3 (catching fish). Feats: …".
 * `worn`: wornBonuses. "" when everything is off.
 */
export function sheetWords(sheet, worn = {}) {
  const on = sheet.entries.filter((entry) => entry.on);
  const told = (entry) => {
    // (With the gear rules the AC is worked out from armour and Dexterity: combat.js gearWorn's acTotal.)
    if (entry.id === "ac" && worn.acTotal !== undefined) {
      const inWhat = [worn.armour ? `in ${worn.armour.name.toLowerCase()}` : "", worn.shield ? "with a shield" : ""]
        .filter(Boolean)
        .join(", ");
      return `AC ${worn.acTotal}${inWhat ? ` (${inWhat})` : ""}`;
    }
    const bonus = typeof worn[entry.id] === "number" ? worn[entry.id] : 0;
    const about = entry.own && entry.about ? ` (${entry.about})` : "";
    if (entry.kind === "ability") return abilityWords(entry);
    if (NUMBERLESS.has(entry.kind)) return `${entry.name}${about}`;
    if ("max" in entry) return `${entry.name} ${entry.value}/${entry.max}${about}`;
    if (entry.id === "xp") return `XP ${entry.value}/${xpNeeded(valueOf(sheet, "level"))}`;
    const total = entry.value + bonus;
    const from = bonus ? ` (${entry.value}, ${bonus > 0 ? "+" : ""}${bonus} from what they wear)` : "";
    const mod = entry.kind === "attribute" ? ` (${modifier(total) >= 0 ? "+" : ""}${modifier(total)})` : "";
    return `${entry.name} ${total}${from}${mod}${about}`;
  };
  const group = (kind, label) => {
    const list = on.filter((entry) => entry.kind === kind).map(told);
    return list.length ? `${label ? `${label}: ` : ""}${list.join(", ")}.` : "";
  };
  const fight = ["attack", "damage"]
    .filter((key) => worn[key])
    .map((key) => `${worn[key] > 0 ? "+" : ""}${worn[key]} to ${key} from what they wear`);
  return [
    group("stat", ""),
    group("resource", ""),
    group("attribute", ""),
    fight.length ? `${fight.join(", ")}.` : "",
    group("skill", "Skills"),
    group("feat", "Feats"),
    group("spell", "Spells"),
    group("ability", "Abilities"),
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * The numbered entries that are switched on, one to a line with what each is, for the model that keeps the
 * sheet (server.mjs `/sheet-track`): "- HP: 14 of 20. Health. At 0 they are defeated."
 */
export function sheetList(sheet) {
  return sheet.entries
    .filter((entry) => entry.on && "value" in entry)
    .map((entry) => {
      const amount = "max" in entry ? `${entry.value} of ${entry.max}` : String(entry.value);
      return `- ${entry.name}: ${amount}.${entry.about ? ` ${entry.about}` : ""}`;
    })
    .join("\n");
}

/**
 * A check: a d20 plus what `entry` gives (an attribute's modifier, counting `bonus` from what's worn;
 * any other number as it stands). { roll, add, total }.
 */
export function checkRoll(entry, bonus = 0, random = Math.random) {
  const roll = 1 + Math.floor(random() * 20);
  const amount = (entry?.value ?? 0) + bonus;
  const add = entry?.kind === "attribute" ? modifier(amount) : amount;
  return { roll, add, total: roll + add };
}

// ── Dice ─────────────────────────────────────────────────────────────────────

/** A roll of dice written "2d6+1", "d8", "1d4-1" or just "5": { total, rolls }. `random`: 0–1, for tests. */
export function rollDice(dice, random = Math.random) {
  const match = /^\s*(\d{0,2})d(\d{1,3})\s*([+-]\s*\d{1,4})?\s*$/iu.exec(String(dice));
  if (!match) return { total: whole(dice, 0), rolls: [] };
  const count = Math.max(1, Number(match[1] || 1));
  const sides = Math.max(1, Number(match[2]));
  const rolls = Array.from({ length: count }, () => 1 + Math.floor(random() * sides));
  const add = match[3] ? Number(match[3].replace(/\s+/gu, "")) : 0;
  return { total: rolls.reduce((sum, roll) => sum + roll, 0) + add, rolls };
}

/**
 * One attack: a d20 plus `bonus` against `ac`, then `damage` (dice) plus `damageBonus`. A natural 20 always
 * hits and rolls the damage dice twice; a natural 1 always misses. `critHit`: any hit is a critical hit
 * (the SRD's, on someone paralyzed or unconscious from within 1.5 m), told by `sureCrit`.
 * { roll, total, hit, crit, sureCrit, damage }.
 */
export function attackRoll(
  { bonus = 0, ac = 10, damage = "1d4", damageBonus = 0, critFrom = 20, more = [], reroll = 0, critHit = false },
  random = Math.random,
) {
  // (A flat part written with the dice, a creature's "2d4+2", is added once like `damageBonus`: a critical
  // hit doubles only the dice.)
  const flat = /^\s*(\d{0,2}d\d{1,3})\s*([+-]\s*\d{1,4})\s*$/iu.exec(String(damage));
  if (flat) {
    damage = flat[1];
    damageBonus += Number(flat[2].replace(/\s+/gu, ""));
  }
  const roll = 1 + Math.floor(random() * 20);
  // (`critFrom`: the lowest roll of the die that's a critical hit, for one who has that. `more`: dice that
  // come with a hit besides the weapon's own, a Sneak Attack's say, doubled on a critical hit like the rest.)
  const natural = roll >= Math.max(2, critFrom);
  const hit = natural || (roll !== 1 && roll + bonus >= ac);
  const crit = natural || (hit && critHit);
  // (`reroll`: Great Weapon Fighting. One of the weapon's own dice that comes up that or less is rolled
  // again, once, and the new roll stands.)
  // (Each lot of dice is kept as it fell, for the telling: "1d8 (5)", "2d6 (1→4, 6)" where one was rolled again.)
  const told = [];
  const own = () => {
    const first = rollDice(damage, random);
    const sides = Number(/d(\d+)/u.exec(String(damage))?.[1] ?? 0);
    if (!reroll || !sides) {
      told.push(diceWords(damage, first.rolls, first.total));
      return first.total;
    }
    let total = first.total;
    const faces = first.rolls.map((face) => {
      if (face > reroll) return String(face);
      const again = 1 + Math.floor(random() * sides);
      total += again - face;
      return `${face}→${again}`;
    });
    told.push(diceWords(damage, faces, total));
    return total;
  };
  const extra = (dice) => {
    const rolled = rollDice(dice, random);
    told.push(diceWords(dice, rolled.rolls, rolled.total));
    return rolled.total;
  };
  const rolled = () => own() + more.reduce((sum, dice) => sum + extra(dice), 0);
  const dealt = hit ? Math.max(1, rolled() + (crit ? rolled() : 0) + damageBonus) : 0;
  // (`detail`: the damage as a sum, "1d8 (5) + 2 = 7"; "" on a miss.)
  const detail = hit
    ? `${told.join(" + ")}${damageBonus ? ` ${damageBonus < 0 ? "-" : "+"} ${Math.abs(damageBonus)}` : ""} = ${dealt}`
    : "";
  return {
    roll,
    total: roll + bonus,
    hit,
    crit,
    ...(crit && !natural ? { sureCrit: true } : {}),
    damage: dealt,
    detail,
  };
}

/** Dice as they fell, for the telling: "2d6 (3, 5)"; a plain number is just the number. */
export function diceWords(dice, faces, total) {
  return faces.length ? `${String(dice).replace(/\s+/gu, "")} (${faces.join(", ")})` : String(total);
}
