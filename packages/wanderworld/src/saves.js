// Saved worlds, kept in this package's browser storage until Wanderworld's server part keeps them
// (docs/CONCEPT.md, S1). Each world is one record under its own key, plus a small index for the Load
// list (name, when it was last played, a thumbnail).
//
// A record holds everything the world needs to come back as it was: its seed, where the player stood,
// the persona and cast, the names given to places (`names`, by zone id) and the lore tied to them
// (`lore`), and room for relationships and the party (docs/CONCEPT.md, W3 and W4). Every field is checked
// on the way in, so an old or damaged copy falls back to defaults instead of breaking the game; `version`
// lets later fields arrive with defaults.

import { checkScene } from "./interactions.js";
import { checkEntry } from "./schedules.js";
import { checkLook } from "./looks.js";
import { checkGroups } from "./zones.js";
import { checkRelationship, checkTraitMap } from "./relationships.js";

export const SAVE_VERSION = 1;
const INDEX_KEY = "wanderworld.worlds";
const WORLD_KEY = (id) => `wanderworld.world.${id}`;
const LAST_KEY = "wanderworld.lastWorld";
// Before saves (0.4.13 and earlier): one world, remembered in these.
const LEGACY = { place: "wanderworld.place", cast: "wanderworld.cast", persona: "wanderworld.persona" };
const MAX_NAME = 60;
const MAX_THUMBNAIL = 40_000; // characters of a data URL

const isRecord = (value) => !!value && typeof value === "object" && !Array.isArray(value);
const text = (value, fallback = "") => (typeof value === "string" ? value.slice(0, 2000) : fallback);
const finite = (value, fallback) => (Number.isFinite(value) ? value : fallback);

/** Where the player stood, checked; null when it isn't usable. */
function checkPlace(place) {
  if (!isRecord(place)) return null;
  const numbers = ["x", "z", "angle", "yaw", "pitch", "zoom"];
  if (!numbers.every((key) => Number.isFinite(place[key]))) return null;
  return Object.fromEntries(numbers.map((key) => [key, place[key]]));
}

/** A string → string map (place names), dropping anything else. */
function checkNames(names) {
  if (!isRecord(names)) return {};
  return Object.fromEntries(
    Object.entries(names)
      .filter(([, value]) => typeof value === "string" && value.trim())
      .map(([key, value]) => [key, value.trim().slice(0, MAX_NAME)]),
  );
}

/** Zone id → [{ lorebookId, entryId, title }]. */
function checkLore(lore) {
  if (!isRecord(lore)) return {};
  const out = {};
  for (const [zone, entries] of Object.entries(lore)) {
    if (!Array.isArray(entries)) continue;
    const kept = entries
      .filter((entry) => isRecord(entry) && typeof entry.lorebookId === "string" && typeof entry.entryId === "string")
      .map((entry) => ({
        lorebookId: entry.lorebookId,
        entryId: entry.entryId,
        title: text(entry.title).slice(0, 120),
      }));
    if (kept.length) out[zone] = kept;
  }
  return out;
}

/** Where characters live and work: { [id]: { home, work, owner } } (place ids). */
function checkHousing(housing) {
  if (!isRecord(housing)) return {};
  return Object.fromEntries(
    Object.entries(housing)
      .filter(([, entry]) => isRecord(entry))
      .map(([id, entry]) => [
        id,
        {
          home: typeof entry.home === "string" ? entry.home : null,
          work: typeof entry.work === "string" ? entry.work : null,
          owner: entry.owner === true,
        },
      ]),
  );
}

/** One region's own setup, kept while the player is in another: names, lore, groups, homes, where they were. */
function checkSetup(raw) {
  if (!isRecord(raw)) return null;
  return {
    names: checkNames(raw.names),
    lore: checkLore(raw.lore),
    groups: checkGroups(raw.groups),
    housing: checkHousing(raw.housing),
    place: checkPlace(raw.place),
  };
}

const REGION_KEY = /^-?\d{1,3},-?\d{1,3}$/u;

/** The regions besides the home one: { "x,z": { name, number, seed, landscape, …setup } }. */
function checkRegions(raw) {
  if (!isRecord(raw)) return {};
  return Object.fromEntries(
    Object.entries(raw)
      .filter(([key, region]) => REGION_KEY.test(key) && key !== "0,0" && isRecord(region))
      .filter(([, region]) => typeof region.seed === "string" && isRecord(region.landscape))
      .slice(0, 60)
      .map(([key, region]) => [
        key,
        {
          name: text(region.name, "a far country").slice(0, MAX_NAME),
          number: Number.isInteger(region.number) ? region.number : 2,
          seed: region.seed.slice(0, 200),
          landscape: region.landscape,
          ...checkSetup(region),
        },
      ]),
  );
}

/** A world record with every field checked and defaults filled in. */
export function checkWorld(raw) {
  if (!isRecord(raw) || typeof raw.id !== "string" || typeof raw.seed !== "string") return null;
  const now = Date.now();
  return {
    version: SAVE_VERSION,
    id: raw.id,
    name: text(raw.name, "A world").slice(0, MAX_NAME) || "A world",
    seed: raw.seed,
    createdAt: finite(raw.createdAt, now),
    playedAt: finite(raw.playedAt, now),
    hour: ((finite(raw.hour, 9) % 24) + 24) % 24,
    place: checkPlace(raw.place),
    persona: typeof raw.persona === "string" ? raw.persona : null,
    cast: Array.isArray(raw.cast) ? raw.cast.filter((id) => typeof id === "string").slice(0, 100) : [],
    names: checkNames(raw.names),
    // The land round the town (land.js checks it when the world is built): hills, mountains, river, outposts.
    landscape: isRecord(raw.landscape) ? raw.landscape : null,
    // The New world choices it was made with (the land and the settlement), for regenerating it.
    choices: isRecord(raw.choices)
      ? Object.fromEntries(
          [
            "hills",
            "mountains",
            "river",
            "places",
            "settlement",
            "layout",
            "marketAt",
            "roads",
            "towns",
            "farms",
            "landmarks",
            "walls",
          ]
            .filter((key) => typeof raw.choices[key] === "string")
            .map((key) => [key, raw.choices[key].slice(0, 20)]),
        )
      : null,
    lore: checkLore(raw.lore),
    // The world's setting in words ("a cosy fishing village"), for the AI to write the world from.
    setting: text(raw.setting).slice(0, 600),
    // How old the people the AI makes may be: { min, max } in years, null for no limit either way.
    ages: {
      min: Number.isInteger(raw.ages?.min) && raw.ages.min >= 1 && raw.ages.min <= 100000 ? raw.ages.min : null,
      max: Number.isInteger(raw.ages?.max) && raw.ages.max >= 1 && raw.ages.max <= 100000 ? raw.ages.max : null,
    },
    // How the world looks in pictures ({world_look}); "" is the setting pack's own.
    look: text(raw.look).slice(0, 200),
    // The chat as it was left: the last lines, [{ who, text }].
    log: (Array.isArray(raw.log) ? raw.log : [])
      .filter((line) => isRecord(line) && typeof line.text === "string")
      .slice(-30)
      .map((line) => ({ who: text(line.who).slice(0, MAX_NAME) || "Narrator", text: line.text.slice(0, 1200) })),
    // The player's instructions for scenes started in this world (Wanderworld plans its scenes).
    sceneInstructions: text(raw.sceneInstructions).slice(0, 1000),
    // The lorebooks this world draws on (ids), and how their entries are linked to places: "keywords"
    // (exact names, done when the world is built), "ai" (the model reads them: `loreKeys`), or "none".
    lorebooks: Array.isArray(raw.lorebooks) ? raw.lorebooks.filter((id) => typeof id === "string").slice(0, 50) : [],
    loreLinking: ["keywords", "ai", "none"].includes(raw.loreLinking) ? raw.loreLinking : "none",
    // The same for characters: linking their entries by name and setting them up from the keywords
    // (body, how they see the player).
    characterLinking: ["keywords", "ai", "none"].includes(raw.characterLinking) ? raw.characterLinking : "none",
    // What the AI made of the lorebooks' entries (linking "ai"): keywords in the plain convention, by
    // "lorebook id/entry id", and the names the lore gives numbered places ({ tavern1: "The Gilded Stag" }).
    loreKeys: Object.fromEntries(
      Object.entries(isRecord(raw.loreKeys) ? raw.loreKeys : {})
        .filter(([, keys]) => Array.isArray(keys))
        .slice(0, 400)
        .map(([key, keys]) => [key, keys.filter((word) => typeof word === "string").slice(0, 8)]),
    ),
    loreNames: Object.fromEntries(
      Object.entries(isRecord(raw.loreNames) ? raw.loreNames : {})
        .filter(([, name]) => typeof name === "string" && name.trim())
        .slice(0, 200)
        .map(([slot, name]) => [slot, name.trim().slice(0, 60)]),
    ),
    // People this world made for itself (not Engine cards): [{ id: "local:…", name, description,
    // personality, appearance }]. They live here only, and count toward the cast.
    locals: (Array.isArray(raw.locals) ? raw.locals : [])
      .filter((person) => isRecord(person) && typeof person.id === "string" && person.id.startsWith("local:"))
      .slice(0, 30)
      .map((person) => ({
        id: person.id.slice(0, 120),
        name: text(person.name).slice(0, 60),
        description: text(person.description).slice(0, 1200),
        personality: text(person.personality).slice(0, 500),
        appearance: text(person.appearance).slice(0, 500),
        // The region they live in, when it isn't the home one ("x,z"): they're seen there.
        ...(typeof person.region === "string" && REGION_KEY.test(person.region) && person.region !== "0,0"
          ? { region: person.region }
          : {}),
      }))
      .filter((person) => person.name),
    // The chat with the AI assistant, as it was left: [{ role, text }], the newest last.
    assistantChat: (Array.isArray(raw.assistantChat) ? raw.assistantChat : [])
      .filter((turn) => isRecord(turn) && typeof turn.text === "string" && turn.text)
      .slice(-40)
      .map((turn) => ({ role: turn.role === "assistant" ? "assistant" : "user", text: turn.text.slice(0, 6000) })),
    // Creatures the world's lore describes (ww:monster, ww:creature, ww:hostile), kept for what
    // will use them: [{ lorebookId, entryId, name, kind, hostile }].
    creatures: (Array.isArray(raw.creatures) ? raw.creatures : [])
      .filter((creature) => isRecord(creature) && typeof creature.entryId === "string")
      .slice(0, 100)
      .map((creature) => ({
        lorebookId: text(creature.lorebookId).slice(0, 120),
        entryId: creature.entryId.slice(0, 120),
        name: text(creature.name).slice(0, 60),
        kind: creature.kind === "monster" ? "monster" : "creature",
        hostile: creature.hostile === true,
        tame: creature.tame === true,
        found: (Array.isArray(creature.found) ? creature.found : []).map((word) => text(word).slice(0, 60)).slice(0, 6),
        when: ["night", "day"].includes(creature.when) ? creature.when : "any",
        pack: Math.max(1, Math.min(10, Number(creature.pack) || 1)),
        size: /^[a-z]{1,10}$/u.test(creature.size ?? "") ? creature.size : "",
        danger: Math.max(1, Math.min(10, Number(creature.danger) || 1)),
        drops: (Array.isArray(creature.drops) ? creature.drops : [])
          .map((word) => text(word).slice(0, 40))
          .slice(0, 12),
      })),
    // What lives where, as places' lore says (keywords.js spawnsFromLore), and whose animals are whose
    // (petsFromLore): plain words, read again from the lore whenever it's linked.
    spawns: (Array.isArray(raw.spawns) ? raw.spawns : [])
      .filter((spawn) => isRecord(spawn) && typeof spawn.kind === "string" && typeof spawn.place === "string")
      .slice(0, 60)
      .map((spawn) => ({
        place: spawn.place.slice(0, 40),
        kind: spawn.kind.slice(0, 30),
        size: /^[a-z]{1,10}$/u.test(spawn.size ?? "") ? spawn.size : "",
        count: Math.max(0, Math.min(10, Number(spawn.count) || 0)),
        temper: ["tame", "hostile"].includes(spawn.temper) ? spawn.temper : "",
        when: ["night", "day"].includes(spawn.when) ? spawn.when : "",
      })),
    // Places the world's own animals keep out of (ww:animals:none), as written.
    quiet: (Array.isArray(raw.quiet) ? raw.quiet : [])
      .filter((word) => typeof word === "string")
      .map((word) => word.slice(0, 40))
      .slice(0, 40),
    // This world's own numbers of animals, over the player's settings: { strays, farm, wild, hostile,
    // monsters, town }, or null to go by the settings.
    population: isRecord(raw.population)
      ? Object.fromEntries(
          ["strays", "farm", "wild", "hostile", "monsters", "town"].map((sort) => [
            sort,
            Math.max(0, Math.min(60, Math.round(Number(raw.population[sort]) || 0))),
          ]),
        )
      : null,
    petLore: (Array.isArray(raw.petLore) ? raw.petLore : [])
      .filter((pet) => isRecord(pet) && typeof pet.owner === "string" && (pet.role === "dog" || pet.role === "horse"))
      .slice(0, 200)
      .map((pet) => ({
        owner: pet.owner.slice(0, 60),
        role: pet.role,
        size: /^[a-z]{1,10}$/u.test(pet.size ?? "") ? pet.size : "",
        colour: /^[a-z]{1,12}$/u.test(pet.colour ?? "") ? pet.colour : "",
        name: text(pet.name).slice(0, 30),
        species: text(pet.species).slice(0, 30),
      })),
    // People the player knows by name (besides anyone they have a relationship with): [ids].
    known: (Array.isArray(raw.known) ? raw.known : []).filter((id) => typeof id === "string").slice(0, 200),
    // People who know the player by name (besides anyone with a relationship either way): [ids].
    knowsMe: (Array.isArray(raw.knowsMe) ? raw.knowsMe : []).filter((id) => typeof id === "string").slice(0, 200),
    // How someone acts toward the player, when it isn't left to how they feel: { [id]: "rude" | "aggressive" |
    // "afraid" | "avoids" | "attacks" }.
    stances: Object.fromEntries(
      Object.entries(isRecord(raw.stances) ? raw.stances : {})
        .filter(([, stance]) => ["rude", "aggressive", "afraid", "avoids", "attacks"].includes(stance))
        .slice(0, 100),
    ),
    // The errand taken from the noticeboard: { id, person, place, text, done }, or null; and how many are done.
    errand:
      isRecord(raw.errand) && typeof raw.errand.id === "string"
        ? {
            id: raw.errand.id.slice(0, 40),
            person: text(raw.errand.person).slice(0, 120),
            place: text(raw.errand.place).slice(0, 120),
            text: text(raw.errand.text).slice(0, 400),
            done: text(raw.errand.done).slice(0, 400),
          }
        : null,
    errandsDone: Number.isFinite(raw.errandsDone) ? Math.max(0, Math.floor(raw.errandsDone)) : 0,
    // A waypoint the player marked on the map: { region, x, z }, or null.
    waypoint:
      isRecord(raw.waypoint) && Number.isFinite(raw.waypoint.x) && Number.isFinite(raw.waypoint.z)
        ? { region: text(raw.waypoint.region).slice(0, 40), x: raw.waypoint.x, z: raw.waypoint.z }
        : null,
    // The season the land wears: "winter" lies under snow. "" is the plain green land.
    season: ["spring", "summer", "fall", "winter"].includes(raw.season) ? raw.season : "",
    // How each person talks, when it isn't the setting's way: { [id]: a voice (keywords.js VOICES) }.
    voices: Object.fromEntries(
      Object.entries(isRecord(raw.voices) ? raw.voices : {})
        .filter(([, voice]) => typeof voice === "string")
        .slice(0, 60)
        .map(([id, voice]) => [id, voice.slice(0, 20)]),
    ),
    // When places are closed: { [zone id]: { from, to } } (hours).
    hours: Object.fromEntries(
      Object.entries(isRecord(raw.hours) ? raw.hours : {})
        .filter(([, span]) => isRecord(span) && Number.isFinite(span.from) && Number.isFinite(span.to))
        .slice(0, 100)
        .map(([id, span]) => [id, { from: span.from, to: span.to }]),
    ),
    // Groups of people: [{ id, name, lorebookId, entryId, members: [ids] }].
    factions: (Array.isArray(raw.factions) ? raw.factions : [])
      .filter((faction) => isRecord(faction) && typeof faction.id === "string")
      .slice(0, 40)
      .map((faction) => ({
        id: faction.id.slice(0, 80),
        name: text(faction.name).slice(0, 60),
        lorebookId: text(faction.lorebookId).slice(0, 120),
        entryId: text(faction.entryId).slice(0, 120),
        members: (Array.isArray(faction.members) ? faction.members : [])
          .filter((id) => typeof id === "string")
          .slice(0, 40),
      })),
    // Lore written for this world (not in an Engine lorebook): { entries: [{ id, title, content }] },
    // linked to places like any lorebook's entries (under the lorebook id "world").
    book: {
      entries: (Array.isArray(raw.book?.entries) ? raw.book.entries : [])
        .filter((entry) => isRecord(entry) && typeof entry.id === "string")
        .slice(0, 60)
        .map((entry) => ({
          id: entry.id.slice(0, 60),
          title: text(entry.title).slice(0, 120),
          content: text(entry.content).slice(0, 1500),
        })),
    },
    // True until the keyword links have been made (the first time the world is built).
    lorePending: raw.lorePending === true,
    // Each character's (and the persona's) body in this world: { [id]: "male" | "female" } (missing: auto).
    // Null for a world saved before bodies were kept per world.
    bodies: isRecord(raw.bodies)
      ? Object.fromEntries(Object.entries(raw.bodies).filter(([, body]) => body === "male" || body === "female"))
      : null,
    // What was chosen by hand for each one's look, without a 3D model: { [id]: look } (looks.js checkLook).
    looks: isRecord(raw.looks)
      ? Object.fromEntries(
          Object.entries(raw.looks)
            .slice(0, 200)
            .map(([id, look]) => [id, checkLook(look)])
            .filter(([, look]) => Object.keys(look).length),
        )
      : {},
    // Animals of one's own, by owner id: { dog: { kind, coat, out, name? } | null, horse: { coat, out, name? } | null }
    // (`out`: with them, not at home; a dog given as null is "none, whatever their lore says").
    pets: isRecord(raw.pets)
      ? Object.fromEntries(
          Object.entries(raw.pets)
            .slice(0, 200)
            .map(([id, entry]) => [id, checkPets(entry)])
            .filter(([, entry]) => Object.keys(entry).length),
        )
      : {},
    // How big the world is (world.js WORLD_SIZES): small, normal, large, huge or massive.
    worldSize: ["small", "normal", "large", "huge", "massive"].includes(raw.worldSize) ? raw.worldSize : "normal",
    // The least the world must have for its lore ({ kind: count }, zones.js `needsFromLore`).
    needs: isRecord(raw.needs)
      ? Object.fromEntries(
          Object.entries(raw.needs)
            .filter(([, count]) => Number.isInteger(count) && count > 0)
            .map(([kind, count]) => [kind, Math.min(60, count)]),
        )
      : {},
    // Where characters live and work, from lore (or set by hand): { [id]: { home, work, owner } } (place ids).
    housing: checkHousing(raw.housing),
    // The region the player is in ("x,z" on the map of regions; "0,0" is home, region1). Names, lore,
    // groups and homes above are that region's; the home region's wait in `homeSetup` while away.
    region: typeof raw.region === "string" && REGION_KEY.test(raw.region) ? raw.region : "0,0",
    regions: checkRegions(raw.regions),
    homeSetup: checkSetup(raw.homeSetup),
    // Places the lore puts somewhere the world hasn't built them yet ("located in wilds1" for a house in
    // town), waiting for the world builder: [{ place, in, title }].
    waitingPlacements: Array.isArray(raw.waitingPlacements)
      ? raw.waitingPlacements
          .filter((entry) => isRecord(entry) && typeof entry.place === "string" && typeof entry.in === "string")
          .slice(0, 200)
          .map((entry) => ({ place: entry.place, in: entry.in, title: text(entry.title).slice(0, 120) }))
      : [],
    // Place groups ({ id, name, members }); null until the player (or the AI) changes the defaults.
    groups: checkGroups(raw.groups),
    // Notes pinned to the noticeboard by the player (later the AI pins quests and news there too).
    notices: Array.isArray(raw.notices)
      ? raw.notices
          .filter((note) => isRecord(note) && typeof note.id === "string" && typeof note.text === "string")
          .slice(0, 40)
          .map((note) => ({
            id: note.id,
            text: note.text.slice(0, 400),
            by: text(note.by).slice(0, 60),
            at: finite(note.at, Date.now()),
          }))
      : [],
    // Kept as they are for now; W3 and W4 give them their checks.
    party: Array.isArray(raw.party) ? raw.party.filter((id) => typeof id === "string") : [],
    // Daily schedules set by the player or the AI: { [characterId]: { entries, by: "you" | "ai" } }. Anyone
    // not here follows a usual day (schedules.js usualDay).
    schedules: isRecord(raw.schedules)
      ? Object.fromEntries(
          Object.entries(raw.schedules)
            .filter(([, value]) => isRecord(value) && Array.isArray(value.entries))
            .slice(0, 100)
            .map(([id, value]) => [
              id,
              {
                entries: value.entries.map(checkEntry).filter(Boolean).slice(0, 24),
                by: ["ai", "lore"].includes(value.by) ? value.by : "you",
              },
            ]),
        )
      : {},
    // What has happened in the world, newest last: recaps of scenes played out in the Engine (server part).
    events: Array.isArray(raw.events)
      ? raw.events
          .filter((event) => isRecord(event) && typeof event.id === "string" && typeof event.kind === "string")
          .slice(-100)
          .map((event) => ({
            id: event.id.slice(0, 100),
            kind: event.kind.slice(0, 30),
            at: finite(event.at, 0),
            place: text(event.place).slice(0, 120),
            summary: text(event.summary).slice(0, 4000),
            characterIds: Array.isArray(event.characterIds)
              ? event.characterIds.filter((id) => typeof id === "string").slice(0, 20)
              : [],
          }))
      : [],
    // Scenes set up from doors and things, newest last, for the AI part to play out.
    scenes: Array.isArray(raw.scenes) ? raw.scenes.map(checkScene).filter(Boolean).slice(-30) : [],
    // Characters' temperaments (aggression, sociability), by id.
    traits: checkTraitMap(raw.traits),
    // What each person remembers (memory.js checks it on the way in): { [id]: [{ day, text, said, raised }] }.
    memories: isRecord(raw.memories) ? raw.memories : {},
    // The world's social life (social.js): the day it is, time each pair has spent together, and the
    // record of what's happened.
    social: isRecord(raw.social)
      ? {
          day: Number.isInteger(raw.social.day) && raw.social.day >= 0 ? raw.social.day : 0,
          pairs: isRecord(raw.social.pairs)
            ? Object.fromEntries(
                Object.entries(raw.social.pairs)
                  .filter(([, pair]) => Array.isArray(pair) && pair.every((value) => Number.isFinite(value)))
                  .slice(0, 1000)
                  .map(([key, pair]) => [key.slice(0, 200), pair.slice(0, 3)]),
              )
            : {},
          log: (Array.isArray(raw.social.log) ? raw.social.log : [])
            .filter((line) => isRecord(line) && typeof line.text === "string")
            .slice(-200)
            .map((line) => ({
              day: Number.isInteger(line.day) ? line.day : 0,
              hour: Number.isInteger(line.hour) ? line.hour : 0,
              text: line.text.slice(0, 240),
              who: (Array.isArray(line.who) ? line.who : []).filter((id) => typeof id === "string").slice(0, 12),
              where: text(line.where).slice(0, 80),
              area: text(line.area).slice(0, 20),
            })),
        }
      : null,
    relationships: Array.isArray(raw.relationships)
      ? raw.relationships.map(checkRelationship).filter(Boolean).slice(0, 2000)
      : [],
  };
}

const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

/** The saved worlds in `storage` (localStorage, or anything with getItem/setItem/removeItem). */
export function createSaves(storage = globalThis.localStorage) {
  const read = (key) => {
    try {
      return storage?.getItem(key) ?? null;
    } catch {
      return null; // storage can be blocked
    }
  };
  const write = (key, value) => {
    try {
      storage?.setItem(key, value);
      return true;
    } catch {
      return false; // full or blocked: the game carries on unsaved
    }
  };
  const parse = (key, fallback) => {
    try {
      return JSON.parse(read(key) ?? "null") ?? fallback;
    } catch {
      return fallback;
    }
  };

  function index() {
    const list = parse(INDEX_KEY, []);
    return (Array.isArray(list) ? list : [])
      .filter((entry) => isRecord(entry) && typeof entry.id === "string")
      .map((entry) => ({
        id: entry.id,
        name: text(entry.name, "A world").slice(0, MAX_NAME),
        playedAt: finite(entry.playedAt, 0),
        createdAt: finite(entry.createdAt, 0),
        thumbnail:
          typeof entry.thumbnail === "string" && entry.thumbnail.length < MAX_THUMBNAIL ? entry.thumbnail : null,
      }));
  }

  function saveIndex(list) {
    write(INDEX_KEY, JSON.stringify(list));
  }

  function put(world, thumbnail) {
    const checked = checkWorld(world);
    if (!checked) return null;
    write(WORLD_KEY(checked.id), JSON.stringify(checked));
    const list = index();
    const at = list.findIndex((entry) => entry.id === checked.id);
    const entry = {
      id: checked.id,
      name: checked.name,
      playedAt: checked.playedAt,
      createdAt: checked.createdAt,
      thumbnail: thumbnail ?? list[at]?.thumbnail ?? null,
    };
    if (at >= 0) list[at] = entry;
    else list.push(entry);
    saveIndex(list);
    return checked;
  }

  return {
    /** The saved worlds, last played first: [{ id, name, playedAt, createdAt, thumbnail }]. */
    list() {
      return index().sort((a, b) => b.playedAt - a.playedAt);
    },
    /** A new world, saved: `name`, and `seed` (a random one when left out). */
    create({ name, seed } = {}) {
      const id = newId();
      return put({
        id,
        name: name || "A world",
        seed: seed || `world-${id}`,
        createdAt: Date.now(),
        playedAt: Date.now(),
      });
    },
    /** One world's record, checked, or null. */
    read(id) {
      return checkWorld(parse(WORLD_KEY(id), null));
    },
    /** Saves a world's record (and its thumbnail, a small image data URL, when given). */
    write(world, thumbnail) {
      return put(world, thumbnail);
    },
    rename(id, name) {
      const world = this.read(id);
      if (world) put({ ...world, name });
    },
    remove(id) {
      try {
        storage?.removeItem(WORLD_KEY(id));
      } catch {
        // blocked storage: nothing to remove
      }
      saveIndex(index().filter((entry) => entry.id !== id));
      if (read(LAST_KEY) === id) write(LAST_KEY, "");
    },
    /** The world played last, if it's still saved. */
    last() {
      const id = read(LAST_KEY);
      return id ? this.read(id) : null;
    },
    setLast(id) {
      write(LAST_KEY, id);
    },
    /**
     * Turns the one world remembered before saves existed into the first saved world, once. Returns it,
     * or null when there was nothing to bring over.
     */
    migrate() {
      if (index().length) return null;
      const place = parse(LEGACY.place, null);
      if (!isRecord(place) || typeof place.seed !== "string") return null;
      const world = put({
        id: newId(),
        name: "My first world",
        seed: place.seed,
        createdAt: Date.now(),
        playedAt: Date.now(),
        hour: place.hour,
        place,
        persona: read(LEGACY.persona),
        cast: parse(LEGACY.cast, []),
      });
      if (world) {
        write(LAST_KEY, world.id);
        for (const key of Object.values(LEGACY)) {
          try {
            storage?.removeItem(key);
          } catch {
            // blocked storage: the old keys just stay
          }
        }
      }
      return world;
    },
  };
}

/** One owner's animals, as kept (see `pets` above); anything else is dropped. */
function checkPets(raw) {
  const out = {};
  if (!isRecord(raw)) return out;
  const word = (value) => (typeof value === "string" && /^[a-z-]{1,20}$/u.test(value) ? value : null);
  for (const role of ["dog", "horse"]) {
    if (raw[role] === null) out[role] = null;
    else if (isRecord(raw[role]) && word(raw[role].coat))
      out[role] = {
        // (A dog's size is a word; one kept from before sizes had names has its body and scale instead.)
        ...(role === "dog" && word(raw[role].kind) ? { kind: raw[role].kind } : {}),
        ...(role === "dog" && word(raw[role].size) ? { size: raw[role].size } : {}),
        coat: raw[role].coat,
        out: raw[role].out !== false,
        ...(Number(raw[role].scale) >= 0.5 && Number(raw[role].scale) <= 2 ? { scale: Number(raw[role].scale) } : {}),
        ...(typeof raw[role].species === "string" && raw[role].species.trim()
          ? { species: raw[role].species.trim().slice(0, 30) }
          : {}),
        ...(typeof raw[role].name === "string" && raw[role].name.trim()
          ? { name: raw[role].name.trim().slice(0, 30) }
          : {}),
      };
  }
  return out;
}
