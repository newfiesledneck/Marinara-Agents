// What a lorebook's Wanderworld keywords say beyond places and relationships (zones.js, relationships.js):
// the world's shape, a place's hours and owner, someone's temperament and voice, factions, and what a
// creature is like. Keywords are the keys written "ww: …" (main.js `wanderKeys`), given here without the
// prefix. Each is one short thing: several of a kind are several keywords ("drops gold", "drops pelt").
import { linksFromWords, setupFromWords } from "./relationships.js";
import { scheduleFromWords } from "./schedules.js";
import { isCreature, loreName, NEEDED_KINDS, placeTargets, plainWord } from "./zones.js";

const clean = (word) => String(word ?? "").trim();
const after = (words, pattern) => words.map((word) => pattern.exec(clean(word))?.[1]?.trim()).filter(Boolean);
const has = (words, name) => words.some((word) => clean(word).toLowerCase() === name);

export const SETTLEMENT_WORDS = ["hamlet", "village", "town", "city"];
export const SEASONS = ["spring", "summer", "fall", "winter"];
export const SIZES = ["small", "normal", "large", "huge", "massive"];
/** How someone talks, on top of who they are (server.mjs TALK_STYLES has the same names). */
export const VOICES = ["natural", "cosy", "dramatic", "witty", "terse", "gruff", "formal", "cheerful", "sly"];

/** Words for someone's temperament (aggression) and manner (sociability), each 0–100. */
const TRAIT_WORDS = {
  shy: { sociability: 15 },
  quiet: { sociability: 30 },
  friendly: { sociability: 75 },
  outgoing: { sociability: 88 },
  passive: { aggression: 12 },
  gentle: { aggression: 20 },
  calm: { aggression: 30 },
  grumpy: { aggression: 65 },
  fierce: { aggression: 80 },
  aggressive: { aggression: 90 },
};

/**
 * What the world's own entry (keyed "world") says of its shape: { settlement, walls, size, season }, each
 * only when given. With several settlement words the biggest is the main one ("city" beside "hamlet": a
 * city, and the hamlets come from "town2" and up).
 */
export function worldFromWords(words) {
  const out = {};
  const settlements = SETTLEMENT_WORDS.filter((word) => has(words, word));
  if (settlements.length) out.settlement = settlements.at(-1);
  if (has(words, "walls")) out.walls = true;
  const size = after(words, /^size\s+(\w+)$/iu)[0]?.toLowerCase();
  if (SIZES.includes(size)) out.size = size;
  const season = after(words, /^season\s+(\w+)$/iu)[0]?.toLowerCase();
  if (season) out.season = season === "autumn" ? "fall" : SEASONS.includes(season) ? season : undefined;
  if (!out.season) delete out.season;
  return out;
}

/** The world's shape from its lorebooks: every entry keyed "world", the first to say each thing winning. */
export function worldFromLore(books) {
  const out = {};
  for (const book of books)
    for (const entry of book.entries)
      if (has(entry.keys ?? [], "world"))
        for (const [key, value] of Object.entries(worldFromWords(entry.keys))) out[key] ??= value;
  return out;
}

/** Someone's temperament and manner from their keywords ("shy", "grumpy"): { aggression?, sociability? }. */
export function traitsFromWords(words) {
  const out = {};
  for (const word of words)
    for (const [trait, level] of Object.entries(TRAIT_WORDS[clean(word).toLowerCase()] ?? {})) out[trait] ??= level;
  return out;
}

/** How someone talks, from "voice gruff": a name from VOICES, or "". */
export function voiceFromWords(words) {
  const voice = after(words, /^voice\s+(\w+)$/iu)[0]?.toLowerCase();
  return VOICES.includes(voice) ? voice : "";
}

/** When a place is closed, from "closed 22-6" (quarter hours, over midnight): { from, to } or null. */
export function closedFromWords(words) {
  const line = words.map(clean).find((word) => /^closed\s/iu.test(word));
  const [entry] = line ? scheduleFromWords([line.replace(/^closed\s+/iu, "home ")]) : [];
  return entry ? { from: entry.from, to: entry.to } : null;
}

/**
 * What the lorebooks say of places and factions beyond their lore. `world`: as placeTargets takes.
 * Returns { hours: { [zone id]: { from, to } }, owners: [{ place (zone id), name }], factions: [{ id,
 * name, lorebookId, entryId, members }] }: an owner is a name as written and a member a name or
 * "character:<id>", for the caller to find (or make).
 */
export function structureFromKeywords(books, world) {
  const targets = placeTargets(world);
  const hours = {};
  const owners = [];
  const factions = new Map();
  const faction = (name) => {
    const id = `faction:${plainWord(name)}`;
    if (!factions.has(id)) factions.set(id, { id, name, lorebookId: "", entryId: "", members: [] });
    return factions.get(id);
  };
  for (const book of books) {
    for (const entry of book.entries) {
      const words = entry.keys ?? [];
      const places = [...new Set(words.flatMap((word) => [...(targets.get(plainWord(word)) ?? [])]))].filter((id) =>
        world.zones.byId.has(id),
      );
      const closed = closedFromWords(words);
      for (const id of places) if (closed) hours[id] ??= closed;
      for (const name of after(words, /^owner\s+(?!of\s)(.+)$/iu))
        for (const place of places) owners.push({ place, name });
      for (const name of after(words, /^faction\s+(.+)$/iu))
        Object.assign(faction(name), { name, lorebookId: book.id, entryId: entry.id });
      // Whose entry it is: someone it names ("Mira"), the person it makes ("character Mira"), or a card's own.
      const who = new Set(
        words.flatMap((word) => [...(targets.get(plainWord(word)) ?? [])]).filter((id) => id.startsWith("character:")),
      );
      if (has(words, "character")) who.add(loreName(entry));
      if (entry.byTitle) who.add(entry.title);
      for (const name of after(words, /^member of\s+(.+)$/iu))
        for (const member of who) if (!faction(name).members.includes(member)) faction(name).members.push(member);
    }
  }
  return { hours, owners, factions: [...factions.values()] };
}

/**
 * What a creature's keywords say of it: { found: [places as written], when: "night" | "day" | "any",
 * pack (1–10), danger (1–10), drops: [items] }. Drops are suggestions for what it might leave.
 */
export function creatureFromWords(words) {
  const number = (pattern, fallback) => Math.max(1, Math.min(10, Number(after(words, pattern)[0]) || fallback));
  return {
    found: after(words, /^found in\s+(.+)$/iu).slice(0, 6),
    when:
      has(words, "night") && !has(words, "day") ? "night" : has(words, "day") && !has(words, "night") ? "day" : "any",
    pack: number(/^pack\s+(\d+)$/iu, 1),
    danger: number(/^danger\s+(\d+)$/iu, 1),
    drops: after(words, /^drops?\s+(.+)$/iu)
      .map((item) => item.slice(0, 40))
      .slice(0, 12),
  };
}

const SIMPLE = [
  /^(character|monster|creature|hostile|world|walls|night|day|you|player|persona)$/iu,
  /^named?\s+\S/iu,
  /^(group of|located in|lives in|works at|owner of|owner|found in|faction|member of|drops?)\s+\S/iu,
  /^(pack|danger)\s+\d+$/iu,
  /^closed\s+\d/iu,
];

/**
 * The keywords Wanderworld doesn't understand, for the Journal's check: a typo ("lives at home3"), a
 * place that isn't there, a name nobody has. `world`: as placeTargets takes. Returns [{ book, entry,
 * word }] (names for showing).
 */
export function unknownKeywords(books, world) {
  const targets = placeTargets(world);
  const numbered = new RegExp(String.raw`^(${NEEDED_KINDS.join("|")}|wilds)\d+$`, "iu");
  const known = (word, entry) =>
    SIMPLE.some((pattern) => pattern.test(word)) ||
    targets.has(plainWord(word)) ||
    numbered.test(word) || // a numbered place the world will build when it's regenerated
    scheduleFromWords([word]).length > 0 ||
    Object.keys(worldFromWords([word])).length > 0 ||
    Object.keys(traitsFromWords([word])).length > 0 ||
    voiceFromWords([word]) !== "" ||
    !!setupFromWords([word]).body ||
    !!setupFromWords([word]).relation ||
    linksFromWords([word]).length > 0 ||
    plainWord(word) === plainWord(loreName(entry)) ||
    (isCreature(entry) && /^(night|day)$/iu.test(word));
  const out = [];
  for (const book of books)
    for (const entry of book.entries)
      for (const word of entry.own ?? entry.keys ?? [])
        if (!known(clean(word), entry)) out.push({ book: book.name, entry: entry.title, word });
  return out;
}
