// What a lorebook's Wanderworld keywords say beyond places and relationships (zones.js, relationships.js):
// the world's shape, a place's hours and owner, someone's temperament and voice, factions, and what a
// creature is like. Keywords are the keys written "ww: …" (main.js `wanderKeys`), given here without the
// prefix. Each is one short thing: several of a kind are several keywords ("drops gold", "drops pelt").
import { relationOf } from "./relationships.js";
import { scheduleFromWords } from "./schedules.js";
import { loreName, NEEDED_KINDS, placeTargets, plainWord } from "./zones.js";

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

/** How someone acts toward the player, whatever they feel: the keyword, and what it's kept as. */
const STANCE_WORDS = { rude: "rude", confronts: "aggressive", attacks: "attacks", afraid: "afraid", avoids: "avoids" };

/** How someone acts toward the player, from "rude", "confronts", "attacks", "afraid" or "avoids": the stance, or "". */
export function stanceFromWords(words) {
  return words.map((word) => STANCE_WORDS[clean(word).toLowerCase()]).find(Boolean) ?? "";
}

/** Who knows whom by name, from "known" (the player knows them) and "knows you" (they know the player). */
export function knowingFromWords(words) {
  return { known: has(words, "known"), knowsYou: has(words, "knows you") };
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
    // How big it is, as a word ("large"), when its entry says ("ww:size:large").
    size: after(words, /^size\s+(\w+)$/iu).find((word) => ANIMAL_SIZES[word.toLowerCase()]) ?? "",
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

// ── Animals: someone's own, and what lives where ───────────────────────────────────────────────

/** How big an animal is, by the word for it: what its usual size is multiplied by. */
export const ANIMAL_SIZES = {
  tiny: 0.7,
  small: 0.82,
  normal: 1,
  big: 1.2,
  large: 1.25,
  huge: 1.5,
  massive: 1.8,
  giant: 1.8,
};
/** Colours an animal can be asked for in, and other words for them. */
const COLOUR_WORDS = {
  gray: "grey",
  golden: "palomino",
  gold: "palomino",
  tan: "cream",
  dark: "black",
  ginger: "red",
};
const COLOURS = ["bay", "white", "black", "grey", "chestnut", "palomino", "brown", "red", "cream"];
const PET_ROLES = {
  horse: "horse",
  mare: "horse",
  stallion: "horse",
  pony: "horse",
  steed: "horse",
  dog: "dog",
  hound: "dog",
  puppy: "dog",
};

/**
 * The parts after an animal's kind, in any order ("large:brown:Shadowmere", "pack5:large"): { size (a
 * word of ANIMAL_SIZES, or ""), colour, count (a pack's, or 0), name (the part that starts with a capital),
 * species (anything else: "great dane") }.
 */
function animalParts(parts) {
  const out = { size: "", colour: "", count: 0, name: "", species: "" };
  for (const raw of parts) {
    const part = clean(raw);
    const lower = part.toLowerCase();
    const pack = /^(?:pack\s*)?(\d{1,2})$/u.exec(lower);
    if (!part) continue;
    if (pack) out.count = Math.max(1, Math.min(10, Number(pack[1])));
    else if (ANIMAL_SIZES[lower] && !out.size) out.size = lower;
    else if ((COLOURS.includes(lower) || COLOUR_WORDS[lower]) && !out.colour) out.colour = COLOUR_WORDS[lower] ?? lower;
    else if (/^\p{Lu}/u.test(part) && !out.name) out.name = part.slice(0, 30);
    else if (!out.species) out.species = lower.slice(0, 30);
  }
  return out;
}

/**
 * Someone's own animals, as their entry's keywords give them ("pet horse:large:brown:Shadowmere"):
 * [{ role: "horse" | "dog", size, colour, name, species }]. One of each at most; the first wins.
 */
export function petsFromWords(words) {
  const out = [];
  for (const value of after(words, /^pet\s+(.+)$/iu)) {
    const [kind, ...rest] = value.split(":");
    const role = PET_ROLES[clean(kind).toLowerCase()];
    if (!role || out.some((pet) => pet.role === role)) continue;
    const { size, colour, name, species } = animalParts(rest);
    out.push({ role, size, colour, name, species });
  }
  return out;
}

/** Every entry's pets, by whose they are (the name its entry is about, or "you"): [{ owner, role, … }]. */
export function petsFromLore(books) {
  const out = [];
  for (const book of books)
    for (const entry of book.entries) {
      const pets = petsFromWords(entry.keys ?? []);
      if (!pets.length) continue;
      const mine = (entry.keys ?? []).some((word) => PLAYER_WORDS.includes(clean(word).toLowerCase()));
      for (const pet of pets) out.push({ owner: mine ? "you" : loreName(entry), ...pet });
    }
  return out;
}

/** A word that names a place, or the whole world: what "ww:monster:wolf" beside it means "lives here". */
const PLACE_WORD = new RegExp(String.raw`^(${NEEDED_KINDS.join("|")}|world)\d*$`, "iu");

/**
 * What lives where, as places' entries say ("spawn wolf:large:pack5" beside "forest1"): [{ place (as
 * written; "world" or a kind is anywhere of it), kind (as written: "wolf", "goblin"), size, count (0:
 * however many) }].
 */
export function spawnsFromLore(books) {
  const out = [];
  for (const book of books)
    for (const entry of book.entries) {
      const words = (entry.keys ?? []).map(clean);
      const places = words.filter((word) => PLACE_WORD.test(word));
      for (const value of after(words, /^spawn\s+(.+)$/iu)) {
        const [kind, ...rest] = value.split(":");
        const { size, count } = animalParts(rest);
        for (const place of places.length ? places : ["world"])
          out.push({ place: place.toLowerCase(), kind: clean(kind).toLowerCase().slice(0, 30), size, count });
      }
    }
  return out.slice(0, 60);
}

// ── How keywords are written ────────────────────────────────────────────────────────────────────
//
// (A colon may be doubled: "ww::pet::horse" reads as "ww:pet:horse".)
// In a lorebook entry's keys: "ww:<what>:<value>". "ww" marks it as Wanderworld's, <what> says what it's
// for, <value> is what's given: "ww:lives in:home3", "ww:body:woman", "ww:enemy of:you". Spaces round the
// colons and capitals don't matter. A key with no <what> ("ww:tavern1", "ww:Mira", "ww:world") names the
// thing the entry is about. Everything after this boundary works on plain words ("lives in home3"),
// which is also what the AI gives when it sets a world up.

/** Words for the player in a value ("ww:enemy of:you", "ww:knows:me"), and for the person an entry is about. */
const PLAYER_WORDS = ["you", "me", "i", "player", "persona", "user"];
const THEM_WORDS = ["they", "them", "him", "her", "he", "she", "char", "character", "this"];
const BODY_WORDS = ["man", "woman", "male", "female", "boy", "girl"];
const TEMPERAMENTS = Object.keys(TRAIT_WORDS).filter((word) => TRAIT_WORDS[word].aggression !== undefined);
const MANNERS = Object.keys(TRAIT_WORDS).filter((word) => TRAIT_WORDS[word].sociability !== undefined);
/** How someone acts toward the player, as written after "ww:acts:" → the plain word kept. */
const ACTS = { rude: "rude", aggressive: "confronts", attacks: "attacks", afraid: "afraid", avoids: "avoids" };
const ACTIVITY_NAMES = ["home", "work", "eat", "visit", "sit", "walk"];
/** <what>s that are kept as "<what> <value>". */
const PHRASES = [
  "name",
  "located in",
  "group of",
  "lives in",
  "works at",
  "owner of",
  "member of",
  "faction",
  "found in",
  "voice",
  "size",
  "season",
  "pack",
  "danger",
  "drops",
  "closed",
  ...ACTIVITY_NAMES,
];
/** Things an entry can be marked as, with or without a name after ("ww:character:Mira Saxton", "ww:monster"). */
const MARKS = ["character", "monster", "creature"];
/** Keys that are whole by themselves: what an entry is, or a plain yes. */
const FLAGS = ["world", "walls", "hostile", ...MARKS];

/**
 * One key of a lorebook entry, read. Not Wanderworld's (no "ww:" in front): null. Otherwise { words:
 * [plain words for the rest of the code], problem: what's wrong with it ("" when nothing is), id: true
 * when it only names what the entry is about }.
 */
export function readKeyword(raw) {
  const parts = String(raw ?? "")
    .replace(/:{2,}/gu, ":")
    .split(":")
    .map((part) => part.trim());
  if (parts[0]?.toLowerCase() !== "ww") return null;
  const bad = (problem) => ({ words: [], problem, id: false });
  const ok = (...words) => ({ words, problem: "", id: false });
  if (parts.length < 2 || !parts[1]) return bad("nothing after ww:");
  const what = parts[1].toLowerCase().replace(/\s+/gu, " ");
  const value = parts.slice(2).join(":").trim(); // a value may hold colons of its own ("10:15-18:45")
  const lower = value.toLowerCase();
  if (parts.length === 2) {
    if (FLAGS.includes(what)) return ok(what);
    // An old one-word keyword: say how it's written now.
    const hint =
      TEMPERAMENTS.includes(what) && !MANNERS.includes(what)
        ? `ww:temperament:${what}`
        : MANNERS.includes(what)
          ? `ww:manner:${what}`
          : BODY_WORDS.includes(what)
            ? `ww:body:${what}`
            : ACTS[what] || what === "confronts"
              ? `ww:acts:${what === "confronts" ? "aggressive" : what}`
              : ["hamlet", "village", "town", "city"].includes(what)
                ? `ww:settlement:${what}`
                : what === "night" || what === "day"
                  ? `ww:active:${what}`
                  : /\s/u.test(what) && !/^\p{Lu}/u.test(parts[1])
                    ? "ww:<what>:<value>, with a colon before the value"
                    : "";
    // Anything else is a name: a place ("tavern1"), a person ("Mira"), the player ("you").
    return hint ? bad(`write it ${hint}`) : { words: [parts[1]], problem: "", id: true };
  }
  if (!value) return bad(`nothing after ww:${what}:`);
  // Someone's own animal: "ww:pet:horse:large:brown:Shadowmere", the parts after the kind in any order.
  if (what === "pet") {
    const role = PET_ROLES[parts[2].toLowerCase()];
    return role ? ok(`pet ${parts.slice(2).join(":")}`) : bad(`a pet is one of: ${Object.keys(PET_ROLES).join(", ")}`);
  }
  // A creature: its own entry ("ww:monster:Goblin"), or on a place's entry what lives there
  // ("ww:monster:wolf:large:pack5"): `spawn` is how it reads beside a place (readKeys).
  if (what === "monster" || what === "creature") {
    const { size, count } = animalParts(parts.slice(3));
    return {
      ...ok(what, `name ${parts[2]}`, ...(size ? [`size ${size}`] : []), ...(count ? [`pack ${count}`] : [])),
      spawn: parts.slice(2).join(":"),
    };
  }
  if (MARKS.includes(what) || what === "hostile") return ok(what, `name ${value}`);
  if (PHRASES.includes(what)) return ok(`${what} ${value}`);
  if (what === "owned by") return ok(`owner ${value}`);
  if (what === "body")
    return BODY_WORDS.includes(lower) ? ok(lower) : bad(`a body is one of: ${BODY_WORDS.join(", ")}`);
  if (what === "temperament")
    return TEMPERAMENTS.includes(lower) ? ok(lower) : bad(`a temperament is one of: ${TEMPERAMENTS.join(", ")}`);
  if (what === "manner") return MANNERS.includes(lower) ? ok(lower) : bad(`a manner is one of: ${MANNERS.join(", ")}`);
  if (what === "acts")
    return ACTS[lower] ? ok(ACTS[lower]) : bad(`how they act is one of: ${Object.keys(ACTS).join(", ")}`);
  if (what === "settlement")
    return SETTLEMENT_WORDS.includes(lower) ? ok(lower) : bad(`a settlement is one of: ${SETTLEMENT_WORDS.join(", ")}`);
  if (what === "walls")
    return ["yes", "no"].includes(lower) ? ok(...(lower === "yes" ? ["walls"] : [])) : bad("walls is yes or no");
  if (what === "active") return ["night", "day"].includes(lower) ? ok(lower) : bad("active is night or day");
  // Who knows whom: "i know:them" (the player knows their name), "knows:you" (they know the player's).
  if (/^(i|you|player|persona|user) knows?$/u.test(what) && THEM_WORDS.includes(lower)) return ok("known");
  if (/^((they|he|she|char|character) )?knows?$/u.test(what) && PLAYER_WORDS.includes(lower)) return ok("knows you");
  // A relationship: "<how> of|with|to" someone, or the player ("ww:enemy of:you", "ww:sister of:Mira").
  const relation = /^(.+?) (of|with|to)$/u.exec(what);
  if (relation && relationOf(relation[1])) {
    return ok(PLAYER_WORDS.includes(lower) ? relation[1] : `${relation[1]} ${relation[2]} ${value}`);
  }
  return bad(`"${parts[1]}" isn't something Wanderworld sets`);
}

/**
 * A lorebook entry's keys, told apart: `keys` are the plain words of the ones written "ww:…" (the ones
 * that read), `own` those keys as written (for the Journal's check), and `triggers` everything else:
 * the lorebook's own trigger words, which Wanderworld never acts on (the AI reads them as hints only).
 */
export function readKeys(raw) {
  const all = (Array.isArray(raw) ? raw : typeof raw === "string" ? raw.split(",") : [])
    .map((key) => String(key).trim())
    .filter(Boolean);
  const read = all.map((key) => ({ key, result: readKeyword(key) }));
  // An entry about a place ("ww:forest1") that names a creature says what lives there, not what it is.
  const place = read.some(({ result }) => result?.id && PLACE_WORD.test(result.words[0] ?? ""));
  return {
    keys: read.flatMap(({ result }) => (place && result?.spawn ? [`spawn ${result.spawn}`] : (result?.words ?? []))),
    own: read.filter(({ result }) => result).map(({ key }) => key),
    triggers: read.filter(({ result }) => !result).map(({ key }) => key),
  };
}

/**
 * The keywords Wanderworld doesn't understand, for the Journal's check: one written a way it doesn't
 * read (with how to write it), a place this world doesn't have, a name nobody here has. `books`'
 * entries carry `own` (their "ww:" keys as written); `world`: as placeTargets takes. Returns [{ book,
 * entry, word, why }].
 */
export function unknownKeywords(books, world) {
  const targets = placeTargets(world);
  const numbered = new RegExp(String.raw`^(${NEEDED_KINDS.join("|")}|wilds)\d+$`, "iu");
  const out = [];
  for (const book of books) {
    for (const entry of book.entries) {
      for (const word of entry.own ?? []) {
        const read = readKeyword(word);
        if (!read) continue;
        let why = read.problem;
        // A name has to be something here: a place (or one a regenerate would build), a person, or the entry's own.
        if (!why && read.id) {
          const name = read.words[0];
          const found =
            targets.has(plainWord(name)) || numbered.test(name) || plainWord(name) === plainWord(loreName(entry));
          if (!found) why = "nothing here is called that";
        }
        if (why) out.push({ book: book.name, entry: entry.title, word, why });
      }
    }
  }
  return out;
}

/**
 * Every keyword, for the instructions (help.js) and the README: [{ group, write, on (which entries),
 * does }]. Kept beside the reader so the two say the same.
 */
export const KEYWORD_GUIDE = [
  {
    group: "What an entry is about",
    write: "ww:tavern1, ww:home6, ww:forest1",
    on: "any entry",
    does: "The entry is that place's lore. Places are numbered by kind (Journal → Places shows each one's). A number the world doesn't have yet is built: ww:smithy3 makes three smithies.",
  },
  {
    group: "What an entry is about",
    write: "ww:tavern, ww:forest",
    on: "any entry",
    does: "Lore for every place of that kind.",
  },
  { group: "What an entry is about", write: "ww:world", on: "any entry", does: "Lore that's active everywhere." },
  {
    group: "What an entry is about",
    write: "ww:Mira, ww:you",
    on: "any entry",
    does: "The entry is about that character (by their name), or about you.",
  },
  {
    group: "What an entry is about",
    write: "ww:character:Mira Saxton",
    on: "any entry",
    does: "The entry is that person (with no name after it, the entry's title is the name). A card you chose for the world with exactly that name is who it means; otherwise a person is made for that world from the entry, and one model call fills in their details.",
  },
  {
    group: "What an entry is about",
    write: "ww:faction:Thieves Guild",
    on: "any entry",
    does: "The entry is that faction's lore, active for each of its members.",
  },
  { group: "Places", write: "ww:name:The Gilded Stag", on: "a place's entry", does: "Names the place." },
  {
    group: "Places",
    write: "ww:located in:town2",
    on: "a place's entry",
    does: "Puts the place inside another place or group.",
  },
  {
    group: "Places",
    write: "ww:group of:home",
    on: "any entry",
    does: "Makes a group of every place of that kind, with the entry as its lore.",
  },
  {
    group: "Places",
    write: "ww:closed:22-6",
    on: "a place's entry",
    does: "When it's closed: its door says so and the AI is told.",
  },
  {
    group: "Places",
    write: "ww:owned by:Mira",
    on: "a building's entry",
    does: "Mira owns it. If nobody in the world is called that, a person is made.",
  },
  {
    group: "People",
    write: "ww:body:woman (or man)",
    on: "a character's entry",
    does: "Their body, when they have no 3D model.",
  },
  {
    group: "People",
    write: "ww:lives in:home6, ww:works at:smithy1, ww:owner of:tavern1",
    on: "a character's entry",
    does: "Home and work.",
  },
  {
    group: "People",
    write: "ww:work:10:15-18:45, ww:home:22-7:15, ww:eat:12-13 at tavern1",
    on: "a character's entry",
    does: "Their day (home, work, eat, visit, sit, walk), in quarter hours, over midnight if need be.",
  },
  {
    group: "People",
    write: "ww:temperament:aggressive (passive, gentle, calm, grumpy, fierce, aggressive)",
    on: "a character's entry",
    does: "What they're like with anyone they're against: how readily they square up.",
  },
  {
    group: "People",
    write: "ww:manner:shy (shy, quiet, friendly, outgoing)",
    on: "a character's entry",
    does: "How readily they come over and greet people.",
  },
  {
    group: "People",
    write: "ww:voice:gruff (natural, cosy, dramatic, witty, terse, gruff, formal, cheerful, sly)",
    on: "a character's entry",
    does: "How they talk, instead of the setting's way.",
  },
  {
    group: "People",
    write: "ww:member of:Thieves Guild",
    on: "a character's entry",
    does: "Puts them in that faction.",
  },
  {
    group: "People and you",
    write: "ww:enemy of:you, ww:friend of:you, ww:sister of:you",
    on: "a character's entry",
    does: "What they are to you. Any relationship (friend, rival, enemy, mentor, family…) or role (sister, father, wife…).",
  },
  {
    group: "People and you",
    write: "ww:sister of:Tam, ww:rival of:Fen, ww:friends with:Mira",
    on: "a character's entry",
    does: "What they are to someone else (one way; the other's entry says theirs).",
  },
  {
    group: "People and you",
    write: "ww:acts:rude (rude, aggressive, attacks, afraid, avoids)",
    on: "a character's entry",
    does: "What they do when they see you, whatever they are to you: won't greet you, comes at you, attacks on sight, keeps away.",
  },
  {
    group: "People and you",
    write: "ww:i know:them",
    on: "a character's entry",
    does: "You know their name from the start (a Stranger otherwise).",
  },
  {
    group: "People and you",
    write: "ww:knows:you",
    on: "a character's entry",
    does: "They know your name from the start (they won't use it otherwise).",
  },
  {
    group: "The world",
    write: "ww:settlement:city (hamlet, village, town, city)",
    on: "the entry keyed ww:world",
    does: "The main settlement's size, where New world left it on Surprise me. (ww:town3 adds two hamlets.)",
  },
  {
    group: "The world",
    write: "ww:walls, ww:size:large, ww:season:winter",
    on: "the entry keyed ww:world",
    does: "Walls, the world's size (small, normal, large, huge, massive), and the season (winter lies under snow).",
  },
  {
    group: "Creatures",
    write: "ww:monster:Goblin, ww:creature:Deer, ww:hostile",
    on: "any entry",
    does: "Marks the entry as a creature (a monster, or a hostile creature, attacks). One the game has a body for (wolf, deer, stag, fox, dog, horse, donkey, cow, bull, alpaca) is put in the world where its entry says it's found; the rest are kept for later.",
  },
  {
    group: "Creatures",
    write: "ww:found in:forest1, ww:active:night, ww:pack:4, ww:size:large, ww:danger:2, ww:drops:wolf pelt",
    on: "a creature's entry",
    does: "Where and when it's met, how many together (1 to 10), how big (tiny, small, normal, big, large, huge, massive), how dangerous (1 to 10), and what it might leave. One thing each: repeat ww:drops:… for more.",
  },
  {
    group: "Creatures",
    write: "ww:monster:wolf, ww:creature:deer:small:pack4, ww:monster:wolf:large:pack5",
    on: "a place's entry (ww:forest1, ww:world)",
    does: "That creature lives there. After its kind, in any order: a size and how many together (pack5, or just 5). With neither, however many and whatever size. A doubled colon reads the same: ww::monster::wolf::large::pack5.",
  },
  {
    group: "People",
    write: "ww:pet:horse:large:brown:Shadowmere, ww:pet:dog:small:Brutus, ww:pet:dog:great dane",
    on: "a character's entry, or the one keyed ww:you",
    does: "Their own horse or dog. After the kind, in any order: a size (a dog's: small, medium, large, huge, massive), a colour (a horse's: bay, white, black, grey, chestnut, palomino, brown; a dog's: grey, brown, black, red, white, cream), its name (written with a capital), and anything else is its breed. One of each. What's chosen in their Look card comes first; without either, their lore's wording decides.",
  },
];
