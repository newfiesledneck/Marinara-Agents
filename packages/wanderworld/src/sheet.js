// The character sheet: level, experience, HP, mana, AC, the six attributes, and whatever the player adds
// (stats, attributes, skills, feats, spells), each with a name, a short description for the model and,
// where it has one, a number. Plus the dice everything rolls with, and the bonuses read out of an item's
// description ("+2 AC", "+10 HP").
//
// Everything about the sheet is in this one module, and a sheet is plain data ({ entries }) kept with the
// world. The user plans to move stats into Quartermaster: when that happens, this module is what gets
// rewritten to read and write there, and nothing else should have to change. So nothing outside it may
// reach into a sheet's shape: read with `entryOf`/`valueOf`/`sheetWords`, change with `changeSheet`/
// `applyChanges`.

/** What an entry can be. A resource has a most ("HP 14/20"); a feat or a spell has no number. */
export const SHEET_KINDS = ["resource", "stat", "attribute", "skill", "feat", "spell"];
const NUMBERLESS = new Set(["feat", "spell"]);
const KIND_WORDS = {
  resource: "Resources",
  stat: "Stats",
  attribute: "Attributes",
  skill: "Skills",
  feat: "Feats",
  spell: "Spells",
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
  if (!NUMBERLESS.has(kind)) entry.value = whole(raw?.value, base?.value ?? 0);
  if (kind === "resource") {
    entry.max = Math.max(1, whole(raw?.max, base?.max ?? Math.max(1, entry.value)));
    entry.value = Math.max(0, Math.min(entry.max, entry.value));
  }
  return entry;
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

/** By name or id, whichever was given (the model names things; the game uses ids). */
function find(sheet, name) {
  const wanted = words(String(name ?? ""), 60).toLowerCase();
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
    if (!entry || !entry.on || NUMBERLESS.has(entry.kind)) continue;
    const to = Number.isFinite(change.to) ? change.to : Number.isFinite(change.by) ? entry.value + change.by : null;
    if (to === null) continue;
    next = changeSheet(next, { set: entry.id, field: "value", value: to });
    const now = valueOf(next, entry.id);
    if (now !== entry.value) applied.push({ id: entry.id, name: entry.name, from: entry.value, to: now });
  }
  return { sheet: next, applied };
}

/** Experience earned: the level rises while there's enough for it. Gives { sheet, levels } (how many were gained). */
export function gainXp(sheet, amount) {
  let level = valueOf(sheet, "level");
  let xp = valueOf(sheet, "xp") + Math.max(0, Math.round(amount) || 0);
  let levels = 0;
  while (xp >= xpNeeded(level) && levels < 50) {
    xp -= xpNeeded(level);
    level += 1;
    levels += 1;
  }
  const next = applyChanges(sheet, [
    { stat: "level", to: level },
    { stat: "xp", to: xp },
  ]).sheet;
  return { sheet: next, levels };
}

// ── Bonuses written in an item's description ─────────────────────────────────

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
    for (let take = Math.min(parts.length, 4); take >= 1; take--) {
      const name = parts.slice(0, take).join(" ").toLowerCase();
      const special = name === "attack" || name === "to hit" ? "attack" : name === "damage" ? "damage" : null;
      const entry = special ? null : find(sheet, name);
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
    for (const bonus of bonusesIn(item.description, sheet)) total[bonus.stat] = (total[bonus.stat] ?? 0) + bonus.amount;
  }
  return total;
}

/** Using something up: its bonuses to resources (HP, mana, the player's own) are applied once. */
export function useItem(sheet, description) {
  const changes = bonusesIn(description, sheet)
    .filter((bonus) => entryOf(sheet, bonus.stat)?.kind === "resource")
    .map((bonus) => ({ stat: bonus.stat, by: bonus.amount }));
  return applyChanges(sheet, changes);
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
    const bonus = worn[entry.id] ?? 0;
    const about = entry.own && entry.about ? ` (${entry.about})` : "";
    if (NUMBERLESS.has(entry.kind)) return `${entry.name}${about}`;
    if (entry.kind === "resource") return `${entry.name} ${entry.value}/${entry.max}${about}`;
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
  ]
    .filter(Boolean)
    .join(" ");
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
 * hits and rolls the damage dice twice; a natural 1 always misses. { roll, total, hit, crit, damage }.
 */
export function attackRoll({ bonus = 0, ac = 10, damage = "1d4", damageBonus = 0 }, random = Math.random) {
  const roll = 1 + Math.floor(random() * 20);
  const crit = roll === 20;
  const hit = crit || (roll !== 1 && roll + bonus >= ac);
  const dealt = hit
    ? Math.max(1, rollDice(damage, random).total + (crit ? rollDice(damage, random).total : 0) + damageBonus)
    : 0;
  return { roll, total: roll + bonus, hit, crit, damage: dealt };
}
