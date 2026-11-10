// Wanderworld — the package's server part (docs/CONCEPT.md, "Plan: the server part").
//
// What it does, all under /api/wanderworld (privileged routes, `routes` permission):
//   GET  /status               — that the server part is running, and what it can do on this Engine.
//   GET  /connections          — the user's Engine connections for the AI settings: text and image ones,
//                                id/name/provider/model only (the Engine masks keys; none are read here).
//   POST /talk                 — one line of a conversation in the world: a character's reply, written on
//                                the user's own connection from the character's card, the persona, where
//                                and when they are, how the character sees the player, active lore, and
//                                the conversation so far.
//   POST /image                — a picture (a place, a moment) through the Engine's own image generation,
//                                with the chosen image connection and style profile.
//   POST /scene-origin         — the context of a scene the client is about to start (who's there, the
//                                persona, the connection, notes, lorebooks), kept until the Engine asks.
//   GET  /scene-results/:world — recaps of scenes from this world that have ended, for the client to keep.
//   DELETE /scene-results/:id  — one recap, once the client has kept it.
//
// And a scene origin (`scenes` permission, Capability API 1.66): the Engine's scene planner asks
// `getContext` for a scene started from Wanderworld, and `release` brings back how it ended.
//
// The client keeps its worlds in browser storage for now; this keeps only scene contexts and recaps
// (`storage` permission, persistence.documents). Model calls go through api.runtime.languageModels on a
// connection the user chose (or the Engine's default). Images and the connection list come from the
// Engine's own REST API over loopback (`network` permission), as Quartermaster and Gacha Forge do: the
// capability runtime has no image or connection-list method.

import { createHash } from "node:crypto";

const PACKAGE_ID = "wanderworld";
const ORIGIN_KIND = "scene-origin";
const RESULT_KIND = "scene-result";
const MAX = {
  id: 200,
  name: 120,
  line: 1200,
  history: 24,
  card: 3000,
  notes: 4000,
  lore: 12,
  loreText: 1500,
  prompt: 1500,
  picture: 6000, // an Illustrate prompt: whole appearances for the player and up to eight others
  people: 20,
  transcript: 30,
};
// The Engine's built-in image style profiles (shared/src/constants/image-style-profiles.ts); "" uses the
// user's own default profile.
const STYLE_PROFILE_IDS = new Set([
  "",
  "off",
  "auto",
  "anime",
  "danbooru",
  "realistic",
  "photorealistic",
  "cinematic",
  "digital-painting",
  "painterly",
  "z-image-turbo",
]);
const TALK_STYLES = {
  natural: "Talk naturally, like a real person in a small town would.",
  cosy: "Keep it warm and cosy: small kindnesses, everyday details, gentle humour.",
  dramatic: "Let feelings run high: tension, longing and stakes come through in what they say.",
  witty: "Be quick and playful: banter, teasing and clever turns of phrase.",
  terse: "Say little: short, guarded lines, a lot left unsaid.",
  gruff: "Be gruff: blunt, a little rough, no patience for fuss, kinder than they sound.",
  formal: "Be formal: careful, courteous, properly put, never slangy.",
  cheerful: "Be cheerful: bright, quick to laugh, seeing the good side.",
  sly: "Be sly: knowing, sidelong, saying less than they mean.",
};
const LENGTHS = { short: [1, 2, 160], medium: [1, 3, 320], long: [2, 5, 600] }; // sentences and max tokens
const PICTURE_KIND = "picture";
/** What the model is told when it rewrites a picture's prompt, unless the player has written their own. */
export const IMPROVE_INSTRUCTION =
  "Rewrite what follows as a prompt for an image generator. Keep every fact in it: who is there, what they look like, where and when it is, the weather, what they're doing. Lead with the subject, then the setting, the light, the mood and the style. One paragraph, concrete and visual, under 120 words. No names of real artists, no words or captions in the picture. Answer with the prompt only.";
const MAX_PICTURES = 60; // per world, oldest let go first
/** What people can do on a schedule (the client acts each out; npcs.js). */
export const ACTIVITIES = ["home", "work", "eat", "visit", "sit", "walk"];
/** How a voice carries: whisper, talk or shout (the client picks who's in range; the model is told). */
const VOICES = { whisper: "whispers", talk: "says", shout: "shouts" };

// ── Small checks (every field from the client is checked here: it is a trust boundary) ──────────

const text = (value, max) => (typeof value === "string" ? value.replace(/\s+/gu, " ").trim().slice(0, max) : "");
const block = (value, max) => (typeof value === "string" ? value.trim().slice(0, max) : "");
/** Cut to `max` characters at the end of a word (of a clause, when one ends near enough): never mid-word. */
export const cutWords = (value, max) => {
  const words = text(value, 100000);
  if (words.length <= max) return words;
  const cut = words.slice(0, max + 1);
  const clause = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("; "), cut.lastIndexOf(", "));
  const end = clause > max * 0.7 ? clause : cut.lastIndexOf(" ");
  return cut.slice(0, end > 0 ? end : max).replace(/[\s,;.]+$/u, "");
};
const idOf = (value) => {
  const id = text(value, MAX.id);
  return /^[\w:./@-]+$/u.test(id) ? id : "";
};
const ids = (list, max) =>
  (Array.isArray(list) ? list : [])
    .map(idOf)
    .filter(Boolean)
    .slice(0, max);
const isRecord = (value) => !!value && typeof value === "object" && !Array.isArray(value);
const docId = (prefix, key) => `${prefix}-${createHash("sha256").update(key).digest("hex").slice(0, 40)}`;

/** A character's card fields, from whatever shape the Engine's record holds. */
function characterCard(record) {
  const data = isRecord(record?.data) ? record.data : {};
  const inner = isRecord(data.data) ? data.data : data; // a V2 card keeps them under data
  const extensions = isRecord(inner.extensions) ? inner.extensions : {};
  return {
    name: text(inner.name, MAX.name) || "Someone",
    description: block(inner.description, MAX.card),
    personality: block(inner.personality, MAX.card / 2),
    scenario: block(inner.scenario, MAX.card / 2),
    examples: block(inner.mes_example, MAX.card / 2),
    appearance: block(extensions.appearance ?? inner.appearance, MAX.card / 2),
  };
}

/** A persona's fields. */
function personaCard(record, fallbackName) {
  const data = isRecord(record?.data) ? record.data : isRecord(record) ? record : {};
  return {
    name: text(data.name, MAX.name) || fallbackName || "The traveller",
    description: block(data.description, MAX.card),
    personality: block(data.personality, MAX.card / 2),
    appearance: block(data.appearance, MAX.card / 2),
  };
}

const section = (title, body) => (body ? `## ${title}\n${body}` : "");
const replaceNames = (value, character, persona) =>
  value.replace(/\{\{char\}\}/giu, character).replace(/\{\{user\}\}/giu, persona);

/**
 * The messages for one conversation reply. `input` is the checked request: character and persona cards,
 * place, time, relationship, world setting, lore texts, history ([{ from: "player" | "character", text }])
 * and the player's new line (empty when they've just walked up).
 */
export function talkMessages(input) {
  const { character, persona } = input;
  const [fewest, most] = LENGTHS[input.length] ?? LENGTHS.medium;
  const style = TALK_STYLES[input.style] ?? TALK_STYLES.natural;
  const card = (value) => replaceNames(value, character.name, persona.name);
  const system = [
    `You are ${character.name}, a person living in the world of Wanderworld, talking face to face with ${persona.name}.`,
    `Reply as ${character.name} only: what they say out loud, ${fewest} to ${most} sentences, with at most one short action in *asterisks*. Never write ${persona.name}'s words, thoughts or actions, never narrate, and never mention being an AI or a game.`,
    style,
    section(`${character.name}`, [card(character.description), card(character.personality)].filter(Boolean).join("\n\n")),
    section("Their situation", card(character.scenario)),
    section(`How ${character.name} looks`, card(character.appearance)),
    section(`How ${character.name} talks (examples)`, card(character.examples)),
    section(`${persona.name}, who they're talking to`, [persona.description, persona.personality, persona.appearance].filter(Boolean).join("\n\n")),
    section("The world", input.setting),
    section(
      "Right now",
      [input.place && `Where: ${input.place}.`, input.time && `When: ${input.time}.`, input.weather && `Weather: ${input.weather}.`, input.nearby && `Also nearby: ${input.nearby}.`]
        .filter(Boolean)
        .join("\n"),
    ),
    section(`How ${character.name} feels about ${persona.name}`, input.relationship),
    section("What they know (lore)", input.lore.join("\n\n")),
  ]
    .filter(Boolean)
    .join("\n\n");
  const messages = [{ role: "system", content: system }];
  for (const entry of input.history) {
    messages.push({ role: entry.from === "character" ? "assistant" : "user", content: entry.text });
  }
  messages.push({
    role: "user",
    content: input.line || `*${persona.name} walks up to ${character.name}.*`,
  });
  return messages;
}

/** The character's line from a model reply: no "Name:" prefix, no wrapping quotes, not too long. */
export function cleanReply(content, name) {
  let reply = typeof content === "string" ? content.trim() : "";
  reply = reply.replace(/<think>[\s\S]*?<\/think>/giu, "").trim();
  const prefix = new RegExp(`^\\**${name.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}\\**\\s*:\\s*`, "iu");
  reply = reply.replace(prefix, "");
  if (/^"[^"]*"$/u.test(reply)) reply = reply.slice(1, -1);
  return reply.slice(0, MAX.line).trim();
}

/** The first JSON object in a model's answer, forgivingly (the Engine's parseJsonish when there is one). */
export function readJson(content, parseJsonish) {
  const raw = typeof content === "string" ? content.replace(/<think>[\s\S]*?<\/think>/giu, "") : "";
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  const body = raw.slice(start, end + 1);
  try {
    const value = parseJsonish ? parseJsonish(body) : JSON.parse(body);
    return isRecord(value) ? value : null;
  } catch {
    return null;
  }
}

/** The kinds of place a world can build, and how many of each at most, for the lore setup's numbered names. */
export const LORE_KINDS = {
  town: 4,
  home: 40,
  tavern: 3,
  shop: 4,
  smithy: 3,
  temple: 3,
  hall: 2,
  inn: 4,
  cottage: 4,
  farm: 4,
  mill: 4,
  pond: 4,
  ruins: 4,
  watchtower: 4,
  stones: 4,
  graveyard: 4,
  cave: 3,
  mountains: 3,
  forest: 1,
  river: 1,
  square: 1,
  fountain: 1,
};
const LORE_BATCH = 40; // entries a call reads at most

/**
 * The messages that have the model set a world up from lorebook entries: for each entry, keywords in the
 * plain convention the client already links by ("tavern1", "located in town2", "lives in home3", a
 * character's name), plus names for the places the lore names. `input`: { setting, worldName, persona,
 * characters: [names], places, people (what to set up), placed: [{ slot, name, title }] (from earlier
 * batches), entries: [{ title, keys, content }] }.
 */
export function loreSetupMessages(input) {
  const kinds = Object.entries(LORE_KINDS)
    .map(([kind, max]) => (max > 1 ? `${kind} (up to ${max})` : kind))
    .join(", ");
  const rules = [
    "You set up a small 3D world from a user's characters and lorebooks. For each numbered entry, say what in the world it belongs to, as keywords. Answer with one JSON object and nothing else.",
    `The world can build these places, each named by its kind and a number counting from 1 ("tavern1" is the first tavern): ${kinds}. town1 is the main settlement; other towns are small hamlets out in the country. Square, fountain, taverns, shops, smithies, temples, halls and homes stand in town1; the rest lie out in the country. Keep the numbers under "Already placed" for the places they are.`,
    input.places &&
      `Keywords for places:
- A numbered place ("tavern1", "home3", "forest1"): the entry describes that place. Each distinct place in the lore gets its own number; entries about the same place share it.
- "located in <numbered place>" beside it: that place lies inside another ("cave1" with "located in mountains1").
- "group of <kind>": the entry is about every place of that kind ("group of home" for a quarter of houses).
- "world": lore everyone in this world lives with (its history, gods, laws, magic). Only for such entries.
A place the world can't build (a castle, a harbour) takes the nearest kind, or no keyword. Never invent places the lore doesn't have.
Also give "names": the name the lore gives a numbered place ("tavern1": "The Gilded Stag").`,
    input.people &&
      `Keywords for people (only those listed under Characters, and the player):
- The character's name exactly as listed, or "player": the entry is about them.
- "character": the entry describes a person who lives here and isn't listed; they'll be made from it. Give it "character", then the same keywords as anyone else.
- Beside that, what the entry says of them: "male" or "female"; "lives in <home>" ("lives in home3"); "works at <place>" or "owner of <place>" ("owner of tavern1"); how they see the player, one of friend, romance, partner, family, colleague, mentor, rival, enemy, fear; and how they stand toward another listed character, as "<word> of <Name>" with one of those words or brother, sister, father, mother, son, daughter, husband, wife ("sister of Mira").
An entry headed "Character card" is the character themself. Give it their name first, then: male or female; a home ("lives in home2": people who would share a house share its number, everyone else gets their own); their work when the card suggests one ("works at smithy1", "owner of tavern1"); how they see the player; and how they stand toward each other listed character they'd know. The card headed "player" is the player: give it "player", male or female, and a home.`,
    "Give an entry no keywords when it fits none of this (items, spells, people who are only mentioned).",
    `{"entries": [{"n": 1, "keys": ["tavern1", "located in town1"]}, {"n": 2, "keys": []}]${input.places ? ', "names": {"tavern1": "The Gilded Stag"}' : ""}}`,
  ];
  const entries = input.entries
    .map((entry, at) => `${at + 1}. ${entry.title}${entry.keys.length ? ` [${entry.keys.join(", ")}]` : ""}\n${entry.content}`)
    .join("\n\n");
  const user = [
    section("The world", [input.worldName, input.setting].filter(Boolean).join(": ")),
    input.people && section("Characters", input.characters.join(", ")),
    input.people && input.persona && section("The player", input.persona),
    section(
      "Already placed",
      input.placed.map((item) => `${item.slot}${item.name ? ` = ${item.name}` : ""}${item.title ? ` (entry "${item.title}")` : ""}`).join("\n"),
    ),
    section("Entries", entries),
  ];
  return [
    { role: "system", content: rules.filter(Boolean).join("\n\n") },
    { role: "user", content: user.filter(Boolean).join("\n\n") },
  ];
}

/** A numbered place name the world could build ("tavern2"; "wilds1" is the forest), or "". */
function loreSlot(word) {
  const match = /^([a-z]+)([1-9]\d?)$/u.exec(String(word).toLowerCase().trim());
  if (!match) return "";
  const kind = match[1] === "wilds" ? "forest" : match[1];
  return Number(match[2]) <= (LORE_KINDS[kind] ?? 0) ? `${match[1]}${match[2]}` : "";
}

/** Keywords from a model, checked: plain words only, and no numbered place past what a world can build. */
function checkKeys(list) {
  return (Array.isArray(list) ? list : [])
    .map((key) => text(key, 60))
    .filter((key) => /^[\p{L}\p{N} '’.-]+$/u.test(key))
    // Every numbered place a keyword uses, alone or inside "lives in home3", must be one the world can build.
    .filter((key) => (key.toLowerCase().match(/\b[a-z]+\d+\b/gu) ?? []).every((word) => loreSlot(word)))
    .slice(0, 8);
}

/**
 * The messages that have the model write a world of its own, a step at a time, each fed by the last:
 * "places" writes the premise and the places with their lore (around the setting, the people already
 * there and what's placed already); "people" invents `count` new people around those places and people.
 * `input`: { step, worldName, setting, persona, characters: [names], placed: [{ slot, name, title }],
 * premise, places: [{ slot, name, lore }], count }.
 */
export function worldWriteMessages(input) {
  const kinds = Object.entries(LORE_KINDS)
    .map(([kind, max]) => (max > 1 ? `${kind} (up to ${max})` : kind))
    .join(", ");
  const world = `The world can build these places, each named by its kind and a number counting from 1 ("tavern1" is the first tavern): ${kinds}. town1 is the main settlement; other towns are small hamlets out in the country. Square, fountain, taverns, shops, smithies, temples, halls and homes stand in town1; the rest lie out in the country.`;
  const placed = section(
    "Already placed",
    input.placed.map((item) => `${item.slot}${item.name ? ` = ${item.name}` : ""}${item.title ? ` (${item.title})` : ""}`).join("\n"),
  );
  if (input.step === "detail") {
    return [
      {
        role: "system",
        content: [
          "You fill in the people of a small 3D world from what its lore says of them, for a roleplay sandbox. Answer with one JSON object and nothing else.",
          `For each numbered person give "n" (their number) and, staying true to what's written and inventing only what's missing: "body" ("male" or "female"), "description" (60 to 120 words: who they are, their age and trade, their history here, what they want), "personality" (20 to 40 words, with how they talk) and "appearance" (20 to 40 words).`,
          `{"people": [{"n": 1, "body": "female", "description": "", "personality": "", "appearance": ""}]}`,
        ].join("\n\n"),
      },
      {
        role: "user",
        content: [
          section("The world", [input.worldName, input.setting].filter(Boolean).join(": ")),
          section("People", input.people.map((person, at) => `${at + 1}. ${person.name}\n${person.text || "(nothing is written of them: invent someone who fits)"}`).join("\n\n")),
        ]
          .filter(Boolean)
          .join("\n\n"),
      },
    ];
  }
  const about = section("The world", [input.worldName, input.setting || "No setting was given: invent one that suits a small, walkable, low-poly world."].filter(Boolean).join(": "));
  const cast = section("Characters who live here", input.characters.join(", "));
  if (input.step === "people") {
    return [
      {
        role: "system",
        content: [
          `You invent ${input.count} new people who live in a small 3D world, for a roleplay sandbox. Answer with one JSON object and nothing else.`,
          world,
          `Build them around the places and the people already there: every workplace should have someone, families share homes, and some of them should know, love, envy or owe the listed characters. Don't reuse a listed name. Give each:
- "name": a name that fits the world.
- "body": "male" or "female".
- "description": 60 to 120 words: who they are, their age and trade, their history here, what they want.
- "personality": 20 to 40 words, with how they talk.
- "appearance": 20 to 40 words.
- "keys": where they belong, as keywords: "lives in <home>" ("lives in home4"; people who share a house share its number, and homes under "Already placed" are taken unless they'd live there), "works at <place>" or "owner of <place>", how they see the player (one of friend, romance, partner, family, colleague, mentor, rival, enemy, fear, or nothing for a stranger), and how they stand toward others as "<word> of <Name>" with one of those words or brother, sister, father, mother, son, daughter, husband, wife ("sister of Mira").`,
          `{"people": [{"name": "", "body": "female", "description": "", "personality": "", "appearance": "", "keys": ["lives in home4", "works at smithy1", "rival of Mira"]}]}`,
        ].join("\n\n"),
      },
      {
        role: "user",
        content: [
          about,
          section("What this world is", input.premise),
          section("Places", input.places.map((item) => `${item.slot} = ${item.name}${item.lore ? `: ${item.lore.slice(0, 240)}` : ""}`).join("\n")),
          cast,
          input.persona && section("The player", input.persona),
          placed,
        ]
          .filter(Boolean)
          .join("\n\n"),
      },
    ];
  }
  return [
    {
      role: "system",
      content: [
        "You write the lore of a small 3D world, for a roleplay sandbox. Answer with one JSON object and nothing else.",
        world,
        `Write:
- "premise": 80 to 150 words on what this world is: its mood, a little history, and what troubles or draws its people now.
- "places": 6 to 12 places it has, each with "slot" (its numbered name), "name" (what people call it) and "lore" (2 to 4 sentences: what it is, who keeps it, something a visitor notices, and a rumour or a loose end). Always town1, the settlement itself. Keep the numbers and names under "Already placed", and write lore for those too. Make places for the trades and homes the listed characters would need; never more of a kind than the world can build.`,
        `{"premise": "", "places": [{"slot": "tavern1", "name": "The Gilded Stag", "lore": ""}]}`,
      ].join("\n\n"),
    },
    { role: "user", content: [about, cast, placed].filter(Boolean).join("\n\n") },
  ];
}

/**
 * A world-writing answer, checked. "places": { premise, places: [{ slot, name, lore }] } (numbered places
 * a world can build, once each). "people": { people: [{ name, body, description, personality,
 * appearance, keys }] }, at most `count`, none named as someone in `taken`.
 */
export function checkWorldWrite(value, step, { count = 0, taken = [] } = {}) {
  if (step === "detail") {
    const people = Array.from({ length: count }, () => null);
    for (const raw of Array.isArray(value?.people) ? value.people : []) {
      const at = Number(raw?.n) - 1;
      if (!Number.isInteger(at) || at < 0 || at >= count) continue;
      people[at] = {
        body: raw.body === "male" || raw.body === "female" ? raw.body : "",
        description: block(raw.description, 1200),
        personality: block(raw.personality, 500),
        appearance: block(raw.appearance, 500),
      };
    }
    return { people };
  }
  if (step === "people") {
    const names = new Set(taken.map((name) => name.toLowerCase()));
    const people = [];
    for (const raw of Array.isArray(value?.people) ? value.people : []) {
      const name = text(raw?.name, 60);
      if (!name || names.has(name.toLowerCase()) || people.length >= count) continue;
      names.add(name.toLowerCase());
      people.push({
        name,
        body: raw.body === "male" || raw.body === "female" ? raw.body : "",
        description: block(raw.description, 1200),
        personality: block(raw.personality, 500),
        appearance: block(raw.appearance, 500),
        keys: checkKeys(raw.keys),
      });
    }
    return { people };
  }
  const seen = new Set();
  const places = [];
  for (const raw of Array.isArray(value?.places) ? value.places : []) {
    const slot = loreSlot(raw?.slot);
    const name = text(raw?.name, 60);
    if (!slot || !name || seen.has(slot) || places.length >= 16) continue;
    seen.add(slot);
    places.push({ slot, name, lore: block(raw.lore, 900) });
  }
  return { premise: block(value?.premise, 1500), places };
}

/**
 * People a world made for itself (not Engine cards), as the client sends them, checked, in the shape
 * `characterCard` reads. Their ids start "local:".
 */
function localRecords(raw) {
  return (Array.isArray(raw) ? raw : [])
    .filter(isRecord)
    .slice(0, 40)
    .map((person) => ({
      id: idOf(person.id),
      data: {
        name: text(person.name, MAX.name),
        description: block(person.description, MAX.card),
        personality: block(person.personality, MAX.card / 2),
        extensions: { appearance: block(person.appearance, MAX.card / 2) },
      },
    }))
    .filter((record) => record.id.startsWith("local:") && record.data.name);
}

/** The records for `wanted` ids: Engine characters from the Engine, a world's own people from `locals`. */
async function listPeople(resources, wanted, locals) {
  const own = localRecords(locals);
  const engine = wanted.filter((id) => !id.startsWith("local:"));
  const records = engine.length ? await resources.listCharacters(engine) : [];
  return wanted
    .map((id) => (id.startsWith("local:") ? own.find((record) => record.id === id) : records.find((record) => record?.id === id)))
    .filter(Boolean);
}

/**
 * The model's lore setup, checked: `keys` is one list per entry asked about (in order; plain words only,
 * no numbered place past what a world can build), `names` is { numbered place: its name }.
 */
export function checkLoreSetup(value, count) {
  const keys = Array.from({ length: count }, () => []);
  for (const item of Array.isArray(value?.entries) ? value.entries : []) {
    const at = Number(item?.n) - 1;
    if (!Number.isInteger(at) || at < 0 || at >= count || !Array.isArray(item.keys)) continue;
    keys[at] = checkKeys(item.keys);
  }
  const names = {};
  for (const [slot, name] of Object.entries(isRecord(value?.names) ? value.names : {})) {
    const kept = text(name, 60);
    if (loreSlot(slot) && kept) names[loreSlot(slot)] = kept;
  }
  return { keys, names };
}

/** A schedule entry, checked: { from, to (hours 0–24, half hours), activity, place (a place id or name) }. */
export function checkEntry(raw, places = null) {
  if (!isRecord(raw)) return null;
  const hour = (value) => (Number.isFinite(Number(value)) ? Math.round(Math.max(0, Math.min(24, Number(value))) * 4) / 4 : null);
  const from = hour(raw.from);
  const to = hour(raw.to);
  const activity = ACTIVITIES.includes(raw.activity) ? raw.activity : null;
  if (from === null || to === null || from === to || !activity) return null;
  let place = text(raw.place, MAX.name);
  if (places) {
    // A place the world has, by id or by name (any case); home and work stand for the person's own.
    const wanted = place.toLowerCase().replace(/^the /u, "");
    const found = places.find((entry) => entry.id === place || entry.name.toLowerCase().replace(/^the /u, "") === wanted);
    place = found ? found.id : "";
  }
  if (!place && (activity === "visit" || activity === "sit")) return null;
  return { from, to, activity, place };
}

/** The messages for a moment: what the player does or says, and how the people in earshot answer. */
export function momentMessages(input) {
  const people = input.listeners
    .map(
      (person) =>
        `- id "${person.id}": ${person.name}, ${person.distance} m away, ${person.doing || "standing about"}` +
        `${person.inParty ? ", travelling with " + input.persona.name : ""}` +
        `${person.feeling ? `. Feels: ${person.feeling}` : ""}` +
        `${person.card ? `. ${person.card}` : ""}`,
    )
    .join("\n");
  const did = [
    input.action ? `${input.persona.name} ${input.action}.` : "",
    input.line ? `${input.persona.name} ${VOICES[input.voice] ?? "says"}: "${input.line}"` : "",
  ]
    .filter(Boolean)
    .join(" ");
  const system = [
    "You are the narrator of Wanderworld, a small living world the player walks around in. Write only what happens in this one moment, as JSON.",
    `The player is ${input.persona.name}.${input.persona.card ? " " + input.persona.card : ""} Never write ${input.persona.name}'s words, thoughts or choices.`,
    TALK_STYLES[input.style] ?? TALK_STYLES.natural,
    input.narrator &&
      section(
        "Your voice",
        `You narrate as ${input.narrator.name}. ${input.narrator.card} Keep to that voice in the narration; other people still speak as themselves.`,
      ),
    section("The world", input.setting),
    section(
      "Right now",
      [input.place && `Where: ${input.place}.`, input.time && `When: ${input.time}.`, input.weather && `Weather: ${input.weather}.`].filter(Boolean).join("\n"),
    ),
    section(
      "Who can hear",
      people ||
        "Nobody is close enough to hear. Still narrate: one or two sentences on what comes of it and what the player notices. No replies.",
    ),
    section("What they know (lore)", input.lore.join("\n\n")),
    section("Just before", input.recent.map((line) => `${line.who}: ${line.text}`).join("\n")),
    section("Places in the world (for plans)", input.places.map((place) => place.name).join(", ")),
    `Answer with one JSON object and nothing else:
{"narration": "at most two short sentences: what ${input.persona.name} sees, hears or finds; empty if nothing worth saying",
 "replies": [{"id": "an id from Who can hear", "text": "what they say aloud, at most one short *action*"}],
 "plans": [{"id": "an id from Who can hear", "from": 12, "to": 13, "activity": "${ACTIVITIES.join("|")}", "place": "a place from the list"}]}
Only people who heard (a whisper carries a couple of metres, a shout across a square) may reply, and only if they would: zero to three replies, the most fitting first. Add a plan only when someone agrees to be somewhere at a time; otherwise leave plans empty.`,
  ]
    .filter(Boolean)
    .join("\n\n");
  return [
    { role: "system", content: system },
    { role: "user", content: did || `${input.persona.name} looks around.` },
  ];
}

/** A moment's answer, checked: only people who could hear reply; plans name real places. */
export function checkMoment(value, listeners, places) {
  const known = new Map(listeners.map((person) => [person.id, person]));
  const replies = (Array.isArray(value?.replies) ? value.replies : [])
    .filter((reply) => isRecord(reply) && known.has(reply.id))
    .map((reply) => ({ id: reply.id, text: cleanReply(text(reply.text, MAX.line), known.get(reply.id).name) }))
    .filter((reply) => reply.text)
    .slice(0, 3);
  const plans = (Array.isArray(value?.plans) ? value.plans : [])
    .filter((plan) => isRecord(plan) && known.has(plan.id))
    .map((plan) => ({ id: plan.id, entry: checkEntry(plan, places) }))
    .filter((plan) => plan.entry)
    .slice(0, 4);
  return { narration: text(value?.narration, 600), replies, plans };
}

/** A prompt from the user's template: {name} placeholders filled, unknown ones dropped, spacing tidied. */
export function fillTemplate(template, values) {
  const value = (key) => (typeof values[key] === "string" ? values[key].trim() : "");
  return (
    String(template)
      // A sentence of the template whose placeholders all came out empty goes, words and all:
      // "With them: {people}." says nothing when nobody's there.
      .split(/(?<=[.!?\n])\s+/u)
      .filter((sentence) => {
        const keys = [...sentence.matchAll(/\{(\w+)\}/gu)].map((match) => match[1]);
        return !keys.length || keys.some(value);
      })
      .join(" ")
  )
    .replace(/\{(\w+)\}/gu, (match, key) => value(key))
    .replace(/^[\s,.]+/u, "")
    .replace(/[ \t]+/gu, " ")
    .replace(/\s+([,.])/gu, "$1")
    .replace(/([,.]){2,}/gu, "$1")
    .trim()
    .slice(0, MAX.picture);
}

const POVS = {
  first_person: "first person (I, as the characters)",
  second_person: "second person (you, for the player)",
  third_person: "third person (they)",
};
const TENSES = { present: "present tense", past: "past tense" };

/**
 * The Engine's scene plan (SceneFullPlan) from a model's answer, checked and completed: Wanderworld's
 * own point of view, tense and extra instructions always go in its system prompt.
 */
export function checkScenePlan(value, { characterIds, pov, tense, extra, fallbackName }) {
  if (!isRecord(value)) return null;
  const description = block(value.description, 1000);
  const firstMessage = block(value.firstMessage, 4000);
  if (!description || !firstMessage) return null;
  const writing = [
    `Write in ${POVS[pov] ?? POVS.second_person}, ${TENSES[tense] ?? TENSES.present}.`,
    "Keep to the place and the people there; never write the player's words, thoughts or choices.",
    extra ? `The player's instructions for scenes in this world: ${extra}` : "",
  ]
    .filter(Boolean)
    .join(" ");
  return {
    name: text(value.name, 80) || fallbackName,
    description,
    scenario: block(value.scenario, 3000),
    firstMessage,
    background: null,
    characterIds,
    systemPrompt: [block(value.systemPrompt, 3000), writing].filter(Boolean).join("\n\n"),
    rating: value.rating === "nsfw" ? "nsfw" : "sfw",
    relationshipHistory: block(value.relationshipHistory, 2000),
    participationGuide: block(value.participationGuide, 600),
  };
}

/** A scene context from the client, checked (the Engine's SceneOriginContext). */
export function checkSceneContext(raw) {
  if (!isRecord(raw)) return null;
  const characterIds = ids(raw.characterIds, MAX.people);
  if (!characterIds.length) return null; // the Engine casts at least one character
  return {
    characterIds,
    personaId: idOf(raw.personaId) || null,
    connectionId: idOf(raw.connectionId) || null,
    transcript: (Array.isArray(raw.transcript) ? raw.transcript : [])
      .filter((line) => isRecord(line))
      .slice(-MAX.transcript)
      .map((line) => ({ speaker: text(line.speaker, MAX.name) || "Someone", content: text(line.content, MAX.line) }))
      .filter((line) => line.content),
    notes: block(raw.notes, MAX.notes) || null,
    lorebookIds: ids(raw.lorebookIds, 50),
  };
}

// ── The Engine's own REST API, over loopback (as Quartermaster's engineApiFetch) ─────────────────

function engineBaseUrl(env) {
  const port = Number.parseInt(env.PORT, 10);
  const scheme = env.SSL_CERT && env.SSL_KEY ? "https" : "http";
  return `${scheme}://127.0.0.1:${Number.isFinite(port) ? port : 7860}`;
}

async function engineFetch(path, options = {}) {
  if (typeof fetch !== "function") throw new Error("No fetch available on this Engine's Node");
  const response = await fetch(`${engineBaseUrl(process.env)}${path}`, options);
  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json();
      detail = typeof body?.error === "string" ? body.error : "";
    } catch {
      detail = "";
    }
    throw new Error(`The Engine answered ${response.status}${detail ? `: ${detail}` : ""}`);
  }
  return response.json();
}

/** The user's connections, split into text and image ones, with nothing secret in them. */
async function listConnections() {
  const rows = await engineFetch("/api/connections", { method: "GET" });
  const shown = (row) => ({
    id: String(row.id),
    name: text(row.name, MAX.name) || String(row.id),
    provider: text(row.provider, 60),
    model: text(row.model, 120),
    isDefault: row.isDefault === true || row.isDefault === "true",
  });
  const list = Array.isArray(rows) ? rows.filter((row) => isRecord(row) && typeof row.id === "string") : [];
  // The user's prompt presets too, for the scene preset choice (names only).
  const presetRows = await engineFetch("/api/prompts", { method: "GET" }).catch(() => []);
  const presets = (Array.isArray(presetRows) ? presetRows : [])
    .filter((row) => isRecord(row) && typeof row.id === "string")
    .map((row) => ({ id: row.id, name: text(row.name, MAX.name) || row.id, model: "" }));
  return {
    text: list.filter((row) => row.provider !== "image_generation").map(shown),
    image: list.filter((row) => row.provider === "image_generation").map(shown),
    presets,
  };
}

/** The image connection to use: the chosen one if it still exists, else the default, else the first. */
async function imageConnection(preferred) {
  const { image } = await listConnections();
  return image.find((row) => row.id === preferred) ?? image.find((row) => row.isDefault) ?? image[0] ?? null;
}

const slug = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/(^-|-$)/gu, "") || "wanderworld";

// ── Storage ──────────────────────────────────────────────────────────────────

async function putDocument(documents, id, kind, name, data) {
  const now = new Date().toISOString();
  const existing = await documents.getById(PACKAGE_ID, id);
  if (!existing) {
    return documents.create({ id, packageId: PACKAGE_ID, kind, name, description: `Wanderworld ${kind}`, data, createdAt: now, updatedAt: now });
  }
  return documents.update({ id, packageId: PACKAGE_ID, expectedRevision: existing.revision, name, description: existing.description, data, updatedAt: now });
}

async function removeDocument(documents, id) {
  const existing = await documents.getById(PACKAGE_ID, id);
  if (existing) await documents.remove(PACKAGE_ID, id, existing.revision);
  return !!existing;
}

/** The world an origin id belongs to: "world:<id>/…". */
const worldOf = (originId) => /^world:([\w-]+)\//u.exec(originId)?.[1] ?? null;

// ── Activation ───────────────────────────────────────────────────────────────

export async function activate(context) {
  const { api } = context;
  const { persistence, resources, languageModels, logger } = api.runtime;
  const { documents } = persistence;
  const scenesOn = typeof api.registerSceneOrigin === "function";

  const releaseRoutes = await api.registerPrivilegedRoutes(
    async (routes) => {
      routes.get("/status", async () => ({
        server: true,
        scenes: scenesOn,
        images: true,
        talk: true,
        moments: true,
        plans: true,
        loreSetup: true,
        worldWrite: true,
        illustrate: true,
      }));

      routes.get("/connections", async (request, reply) => {
        try {
          return await listConnections();
        } catch (error) {
          logger.warn("[wanderworld] could not read the Engine's connections: %s", error?.message ?? error);
          return reply.status(502).send({ error: "Couldn't read your connections from the Engine." });
        }
      });

      routes.post("/talk", async (request, reply) => {
        const body = isRecord(request.body) ? request.body : {};
        const characterId = idOf(body.characterId);
        if (!characterId) return reply.status(400).send({ error: "Who is being talked to? (characterId)" });
        const [record] = await listPeople(resources, [characterId], body.locals);
        if (!record) return reply.status(404).send({ error: "That character isn't in the Engine any more." });
        const personaId = idOf(body.personaId);
        const [personaRecord] = personaId ? await resources.listPersonas([personaId]) : [];
        const loreIds = (Array.isArray(body.lore) ? body.lore : [])
          .filter(isRecord)
          .slice(0, MAX.lore)
          .map((entry) => ({ lorebookId: idOf(entry.lorebookId), entryId: idOf(entry.entryId) }))
          .filter((entry) => entry.lorebookId && entry.entryId);
        const loreEntries = loreIds.length
          ? await resources
              .listEligibleLorebookEntries({
                lorebookIds: [...new Set(loreIds.map((entry) => entry.lorebookId))],
                entryIds: loreIds.map((entry) => entry.entryId),
              })
              .catch(() => [])
          : [];
        const input = {
          character: characterCard(record),
          persona: personaCard(personaRecord, text(body.personaName, MAX.name)),
          place: text(body.place, 300),
          time: text(body.time, 80),
          weather: text(body.weather, 40),
          nearby: text(body.nearby, 300),
          relationship: text(body.relationship, 400),
          setting: block(body.setting, 600),
          lore: [
            ...loreEntries.map((entry) => `${text(entry.name, MAX.name)}: ${block(entry.content, MAX.loreText)}`),
            ...(Array.isArray(body.loreTexts) ? body.loreTexts : []).map((entry) => block(entry, MAX.loreText)).filter(Boolean),
          ].slice(0, MAX.lore),
          history: (Array.isArray(body.history) ? body.history : [])
            .filter(isRecord)
            .slice(-MAX.history)
            .map((entry) => ({ from: entry.from === "character" ? "character" : "player", text: text(entry.text, MAX.line) }))
            .filter((entry) => entry.text),
          line: text(body.line, MAX.line),
          style: text(body.style, 20),
          length: text(body.length, 20),
        };
        const temperature = Number.isFinite(body.temperature) ? Math.max(0, Math.min(1.5, body.temperature)) : 0.9;
        try {
          const model = await languageModels.resolveForRequest({ connectionId: idOf(body.connectionId) || undefined });
          const [, , maxTokens] = LENGTHS[input.length] ?? LENGTHS.medium;
          const result = await model.chatComplete(talkMessages(input), { temperature, maxTokens });
          const line = cleanReply(result?.content, input.character.name);
          if (!line) return reply.status(502).send({ error: "The model sent back an empty reply." });
          return { reply: line, connectionId: model.connectionId, model: model.model };
        } catch (error) {
          logger.warn("[wanderworld] talk failed: %s", error?.message ?? error);
          return reply.status(502).send({ error: text(error?.message, 300) || "The model call failed." });
        }
      });

      routes.post("/image", async (request, reply) => {
        const body = isRecord(request.body) ? request.body : {};
        const prompt = text(body.prompt, MAX.prompt);
        if (!prompt) return reply.status(400).send({ error: "Nothing to picture (prompt)" });
        const styleProfileId = STYLE_PROFILE_IDS.has(body.styleProfileId) ? body.styleProfileId : "";
        const width = Number.isInteger(body.width) ? Math.max(256, Math.min(1536, body.width)) : 768;
        const height = Number.isInteger(body.height) ? Math.max(256, Math.min(1536, body.height)) : 512;
        try {
          const connection = await imageConnection(idOf(body.connectionId));
          if (!connection) return reply.status(409).send({ error: "Add an image generation connection in the Engine first." });
          const name = slug(body.name);
          // The avatar route takes a prompt override for its own id, which keeps it from writing a portrait.
          const result = await engineFetch("/api/characters/avatar-generation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              connectionId: connection.id,
              name,
              appearance: prompt,
              width,
              height,
              ...(styleProfileId ? { styleProfileId } : {}),
              promptOverrides: [{ id: `avatar:${name}`, prompt }],
            }),
          });
          if (typeof result?.image !== "string" || !result.image.startsWith("data:image/")) {
            return reply.status(502).send({ error: "The Engine sent back no picture." });
          }
          return { image: result.image, connectionId: connection.id };
        } catch (error) {
          logger.warn("[wanderworld] image failed: %s", error?.message ?? error);
          return reply.status(502).send({ error: text(error?.message, 300) || "The picture couldn't be made." });
        }
      });

      routes.post("/scene-origin", async (request, reply) => {
        const body = isRecord(request.body) ? request.body : {};
        const originId = idOf(body.originId);
        if (!originId || !worldOf(originId)) return reply.status(400).send({ error: "Invalid originId" });
        const sceneContext = checkSceneContext(body.context);
        if (!sceneContext) return reply.status(400).send({ error: "A scene needs at least one character there." });
        await putDocument(documents, docId("origin", originId), ORIGIN_KIND, originId, {
          originId,
          context: sceneContext,
          at: new Date().toISOString(),
        });
        // Contexts of scenes that were planned but never started (the planner cancelled) go after a few days.
        const stale = Date.now() - 3 * 24 * 3600 * 1000;
        for (const doc of await documents.list(PACKAGE_ID, ORIGIN_KIND)) {
          if (Date.parse(doc.data?.at ?? doc.updatedAt) < stale) await removeDocument(documents, doc.id).catch(() => false);
        }
        return { ok: true };
      });

      routes.get("/scene-results/:world", async (request) => {
        const world = idOf(request.params.world);
        const results = await documents.list(PACKAGE_ID, RESULT_KIND);
        return {
          results: results
            .filter((doc) => doc.data?.worldId === world)
            .map((doc) => ({ id: doc.id, ...doc.data }))
            .sort((a, b) => String(a.at).localeCompare(String(b.at))),
        };
      });

      // A moment: the player does or says something, and the people in earshot answer (or the narrator
      // just describes it). Light: no scene, one call.
      routes.post("/moment", async (request, reply) => {
        const body = isRecord(request.body) ? request.body : {};
        const listeners = (Array.isArray(body.listeners) ? body.listeners : [])
          .filter(isRecord)
          .map((person) => ({
            id: idOf(person.id),
            distance: Number.isFinite(person.distance) ? Math.round(Math.max(0, Math.min(99, person.distance))) : 5,
            doing: text(person.doing, 120),
            feeling: text(person.feeling, 200),
            inParty: person.inParty === true,
          }))
          .filter((person) => person.id)
          .slice(0, 5); // the client's MAX_LISTENERS
        const records = await listPeople(resources, listeners.map((person) => person.id), body.locals);
        const cards = new Map(records.map((record) => [record.id, characterCard(record)]));
        const heard = listeners
          .filter((person) => cards.has(person.id))
          .map((person) => {
            const card = cards.get(person.id);
            return { ...person, name: card.name, card: [card.personality, card.description].filter(Boolean).join(" ").slice(0, 500) };
          });
        const personaId = idOf(body.personaId);
        const [personaRecord] = personaId ? await resources.listPersonas([personaId]) : [];
        const persona = personaCard(personaRecord, text(body.personaName, MAX.name));
        const places = (Array.isArray(body.places) ? body.places : [])
          .filter(isRecord)
          .map((place) => ({ id: idOf(place.id), name: text(place.name, MAX.name) }))
          .filter((place) => place.id && place.name)
          .slice(0, 60);
        // The user's narrator card, when they've set one: an Engine character, read from the Engine.
        const narratorId = idOf(body.narratorId);
        const [narratorRecord] = narratorId && !narratorId.startsWith("local:") ? await resources.listCharacters([narratorId]) : [];
        const narratorCard = narratorRecord ? characterCard(narratorRecord) : null;
        const input = {
          narrator: narratorCard
            ? { name: narratorCard.name, card: [narratorCard.personality, narratorCard.description].filter(Boolean).join(" ").slice(0, 700) }
            : null,
          persona: { name: persona.name, card: [persona.description, persona.appearance].filter(Boolean).join(" ").slice(0, 500) },
          listeners: heard,
          action: text(body.action, 300),
          line: text(body.line, MAX.line),
          voice: VOICES[body.voice] ? body.voice : "talk",
          place: text(body.place, 300),
          time: text(body.time, 80),
          weather: text(body.weather, 40),
          setting: block(body.setting, 600),
          style: text(body.style, 20),
          lore: (Array.isArray(body.lore) ? body.lore : []).map((entry) => block(entry, MAX.loreText)).filter(Boolean).slice(0, 6),
          recent: (Array.isArray(body.recent) ? body.recent : [])
            .filter(isRecord)
            .slice(-12)
            .map((line) => ({ who: text(line.who, MAX.name) || "Someone", text: text(line.text, 400) }))
            .filter((line) => line.text),
          places,
        };
        if (!input.action && !input.line) return reply.status(400).send({ error: "Nothing happened (action or line)" });
        try {
          const model = await languageModels.resolveForRequest({ connectionId: idOf(body.connectionId) || undefined });
          const temperature = Number.isFinite(body.temperature) ? Math.max(0, Math.min(1.5, body.temperature)) : 0.9;
          const result = await model.chatComplete(momentMessages(input), { temperature, maxTokens: 700 });
          const value = readJson(result?.content, api.runtime.json?.parseJsonish);
          if (!value) return reply.status(502).send({ error: "The model's answer wasn't readable." });
          return checkMoment(value, heard, places);
        } catch (error) {
          logger.warn("[wanderworld] moment failed: %s", error?.message ?? error);
          return reply.status(502).send({ error: text(error?.message, 300) || "The model call failed." });
        }
      });

      // A day's schedule for someone, written by the model from who they are, their home and work, the
      // places there are, and what the player asked for (if anything).
      routes.post("/plan", async (request, reply) => {
        const body = isRecord(request.body) ? request.body : {};
        const characterId = idOf(body.characterId);
        const [record] = characterId ? await listPeople(resources, [characterId], body.locals) : [];
        if (!record) return reply.status(404).send({ error: "That character isn't in the Engine any more." });
        const card = characterCard(record);
        const places = (Array.isArray(body.places) ? body.places : [])
          .filter(isRecord)
          .map((place) => ({ id: idOf(place.id), name: text(place.name, MAX.name), kind: text(place.kind, 40) }))
          .filter((place) => place.id && place.name)
          .slice(0, 60);
        const current = (Array.isArray(body.current) ? body.current : []).map((entry) => checkEntry(entry)).filter(Boolean);
        const system = [
          `You plan one ordinary day for ${card.name}, who lives in Wanderworld. Answer with one JSON object and nothing else.`,
          section(card.name, [card.description, card.personality, card.scenario].filter(Boolean).join("\n\n").slice(0, 2000)),
          section("Their home and work", [text(body.home, MAX.name) && `Home: ${text(body.home, MAX.name)}`, text(body.work, MAX.name) && `Work: ${text(body.work, MAX.name)}`].filter(Boolean).join("\n")),
          section("Places", places.map((place) => `${place.name} (${place.kind})`).join(", ")),
          section("Their schedule now", current.map((entry) => `${entry.from}-${entry.to} ${entry.activity} ${entry.place}`).join("\n")),
          `{"entries": [{"from": 7, "to": 9, "activity": "${ACTIVITIES.join("|")}", "place": "a place name from Places, or empty for home, work and walk"}]}
Cover the whole day from 0 to 24 in order, hours in halves at most. "home" is at their home (nights too), "work" at their work, "eat" somewhere they'd eat, "visit" and "sit" at a named place, "walk" about town.`,
        ]
          .filter(Boolean)
          .join("\n\n");
        const ask = text(body.request, 400);
        try {
          const model = await languageModels.resolveForRequest({ connectionId: idOf(body.connectionId) || undefined });
          const result = await model.chatComplete(
            [
              { role: "system", content: system },
              { role: "user", content: ask ? `Plan the day, and: ${ask}` : "Plan the day." },
            ],
            { temperature: 0.7, maxTokens: 900 },
          );
          const value = readJson(result?.content, api.runtime.json?.parseJsonish);
          const entries = (Array.isArray(value?.entries) ? value.entries : []).map((entry) => checkEntry(entry, places.length ? [...places, { id: "", name: "" }] : null)).filter(Boolean).slice(0, 16);
          if (!entries.length) return reply.status(502).send({ error: "The model didn't give a usable plan." });
          return { entries };
        } catch (error) {
          logger.warn("[wanderworld] plan failed: %s", error?.message ?? error);
          return reply.status(502).send({ error: text(error?.message, 300) || "The model call failed." });
        }
      });

      // What people look like, for looking at them: from each card's appearance, or else the start of
      // its description. No model call.
      routes.post("/looks", async (request) => {
        const body = isRecord(request.body) ? request.body : {};
        const records = await listPeople(resources, ids(body.ids, 12), body.locals);
        return {
          looks: Object.fromEntries(
            records.map((record) => {
              const card = characterCard(record);
              return [record.id, (card.appearance || card.description).slice(0, 500)];
            }),
          ),
        };
      });

      // A world's setup from its lorebooks, for any lorebook: the model reads a batch of entries and gives
      // each the keywords the client links by, and names for the places the lore names.
      routes.post("/lore-setup", async (request, reply) => {
        const body = isRecord(request.body) ? request.body : {};
        const entries = (Array.isArray(body.entries) ? body.entries : [])
          .filter(isRecord)
          .slice(0, LORE_BATCH)
          .filter((entry) => !/^character card\b/iu.test(text(entry.title, 120))) // only the Engine's cards are cards
          .map((entry) => ({
            title: text(entry.title, 120) || "Entry",
            keys: (Array.isArray(entry.keys) ? entry.keys : []).map((key) => text(key, 60)).filter(Boolean).slice(0, 12),
            content: block(entry.content, 600),
          }));
        // The cast's cards and the persona, read here from the Engine: entries of their own, first, in the
        // order asked (someone who's gone keeps their place, so the answer lines up).
        const cardIds = ids(body.characterIds, LORE_BATCH - 1);
        const records = await listPeople(resources, cardIds, body.locals);
        const cards = cardIds.map((id) => {
          const record = records.find((item) => item?.id === id);
          const card = record ? characterCard(record) : null;
          const words = card ? [card.description, card.personality, card.scenario].filter(Boolean).join("\n") : "";
          return {
            title: `Character card: ${card?.name ?? "(gone)"}`,
            keys: [],
            content: replaceNames(words, card?.name ?? "", text(body.persona, MAX.name) || "the player").slice(0, 900),
          };
        });
        const personaId = idOf(body.personaId);
        if (personaId) {
          const [record] = await resources.listPersonas([personaId]);
          const card = personaCard(record, text(body.persona, MAX.name));
          cards.push({
            title: `Character card: player (${card.name})`,
            keys: [],
            content: [card.description, card.personality, card.appearance].filter(Boolean).join("\n").slice(0, 900),
          });
        }
        entries.unshift(...cards);
        entries.length = Math.min(entries.length, LORE_BATCH);
        if (!entries.length) return reply.status(400).send({ error: "Nothing to read." });
        const messages = loreSetupMessages({
          setting: text(body.setting, 600),
          worldName: text(body.worldName, MAX.name),
          persona: text(body.persona, MAX.name),
          characters: (Array.isArray(body.characters) ? body.characters : []).map((name) => text(name, MAX.name)).filter(Boolean).slice(0, 60),
          places: body.places === true,
          people: body.people === true,
          placed: (Array.isArray(body.placed) ? body.placed : [])
            .filter(isRecord)
            .map((item) => ({ slot: loreSlot(item.slot), name: text(item.name, 60), title: text(item.title, 120) }))
            .filter((item) => item.slot)
            .slice(0, 120),
          entries,
        });
        try {
          const model = await languageModels.resolveForRequest({ connectionId: idOf(body.connectionId) || undefined });
          // Room to answer for a model that thinks first.
          const result = await model.chatComplete(messages, { temperature: 0.2, maxTokens: 4000 });
          const value = readJson(result?.content, api.runtime.json?.parseJsonish);
          if (!value) return reply.status(502).send({ error: "The model didn't give a usable setup." });
          return checkLoreSetup(value, entries.length);
        } catch (error) {
          logger.warn("[wanderworld] lore setup failed: %s", error?.message ?? error);
          return reply.status(502).send({ error: text(error?.message, 300) || "The model call failed." });
        }
      });

      // A world written for itself, a step at a time (the client feeds each step what the last gave):
      // the premise and places with their lore, then new people built around them.
      routes.post("/world-write", async (request, reply) => {
        const body = isRecord(request.body) ? request.body : {};
        const step = ["people", "detail"].includes(body.step) ? body.step : "places";
        const described = (Array.isArray(body.people) ? body.people : [])
          .filter(isRecord)
          .map((person) => ({ name: text(person.name, 60), text: block(person.text, 1200) }))
          .filter((person) => person.name)
          .slice(0, 12);
        const count = step === "detail" ? described.length : Math.max(1, Math.min(12, Math.round(Number(body.count)) || 1));
        if (step === "detail" && !count) return reply.status(400).send({ error: "Nobody to fill in." });
        const characters = (Array.isArray(body.characters) ? body.characters : []).map((name) => text(name, MAX.name)).filter(Boolean).slice(0, 60);
        const messages = worldWriteMessages({
          step,
          count,
          characters,
          people: described,
          worldName: text(body.worldName, MAX.name),
          setting: text(body.setting, 600),
          persona: text(body.persona, MAX.name),
          premise: block(body.premise, 1500),
          places: (Array.isArray(body.places) ? body.places : [])
            .filter(isRecord)
            .map((item) => ({ slot: loreSlot(item.slot), name: text(item.name, 60), lore: block(item.lore, 900) }))
            .filter((item) => item.slot && item.name)
            .slice(0, 40),
          placed: (Array.isArray(body.placed) ? body.placed : [])
            .filter(isRecord)
            .map((item) => ({ slot: loreSlot(item.slot), name: text(item.name, 60), title: text(item.title, 120) }))
            .filter((item) => item.slot)
            .slice(0, 120),
        });
        try {
          const model = await languageModels.resolveForRequest({ connectionId: idOf(body.connectionId) || undefined });
          const result = await model.chatComplete(messages, { temperature: 0.8, maxTokens: 6000 });
          const value = readJson(result?.content, api.runtime.json?.parseJsonish);
          const checked = value ? checkWorldWrite(value, step, { count, taken: characters }) : null;
          if (!checked || !(checked.people ?? checked.places).some(Boolean)) {
            return reply.status(502).send({ error: "The model didn't give a usable answer." });
          }
          return checked;
        } catch (error) {
          logger.warn("[wanderworld] world writing failed: %s", error?.message ?? error);
          return reply.status(502).send({ error: text(error?.message, 300) || "The model call failed." });
        }
      });

      // Illustrate the moment: the user's template filled with where and when, who's there (their looks
      // from their cards), what's going on; painted, and kept in the world's gallery.
      routes.post("/illustrate", async (request, reply) => {
        const body = isRecord(request.body) ? request.body : {};
        const worldId = idOf(body.worldId);
        const template = block(body.template, 2000);
        if (!worldId || !template) return reply.status(400).send({ error: "A world and a prompt template are needed." });
        const facts = isRecord(body.facts) ? body.facts : {};
        const people = (Array.isArray(facts.people) ? facts.people : []).filter(isRecord).slice(0, 8);
        const records = await listPeople(resources, people.map((person) => idOf(person.id)).filter(Boolean), body.locals);
        const cards = new Map(records.map((record) => [record.id, characterCard(record)]));
        const personaId = idOf(body.personaId);
        const [personaRecord] = personaId ? await resources.listPersonas([personaId]) : [];
        const persona = personaCard(personaRecord, text(facts.persona, MAX.name));
        const looks = people
          .map((person) => {
            const card = cards.get(idOf(person.id));
            const name = card?.name ?? text(person.name, MAX.name);
            return card?.appearance ? `${name}: ${cutWords(card.appearance, 600)}` : "";
          })
          .filter(Boolean);
        const values = {
          persona: persona.name,
          // "Zoey: tall, red-haired…", or nothing when the card has no appearance (so no dangling name).
          persona_appearance: persona.appearance ? `${persona.name}: ${cutWords(persona.appearance, 1500)}` : "",
          people: people.map((person) => `${cards.get(idOf(person.id))?.name ?? text(person.name, MAX.name)}${text(person.doing, 80) ? ` (${text(person.doing, 80)})` : ""}`).join(", "),
          people_appearance: looks.join("; "),
          place: text(facts.place, 200),
          place_kind: text(facts.placeKind, 60),
          time: text(facts.time, 40),
          time_of_day: text(facts.timeOfDay, 40),
          weather: text(facts.weather, 40),
          activity: text(facts.activity, 160),
          setting: text(facts.setting, 400),
          world_look: text(facts.look, 200),
          recent: text(facts.recent, 400),
        };
        // The prompt: the one the player approved (after a review), or the template filled in and, when
        // asked, rewritten by the model to the player's instruction. A rewrite that fails leaves it as it was.
        let prompt = block(body.prompt, MAX.picture) || fillTemplate(template, values);
        if (!prompt) return reply.status(400).send({ error: "The template came out empty." });
        let improved = false;
        if (body.improve === true && !block(body.prompt, MAX.picture)) {
          try {
            const model = await languageModels.resolveForRequest({ connectionId: idOf(body.textConnectionId) || undefined });
            const result = await model.chatComplete(
              [
                { role: "system", content: block(body.instruction, 1500) || IMPROVE_INSTRUCTION },
                { role: "user", content: prompt },
              ],
              { temperature: 0.7, maxTokens: 600 },
            );
            const rewritten = block(String(result?.content ?? "").replace(/<think>[\s\S]*?<\/think>/giu, ""), 2000).replace(/^["'\s]+|["'\s]+$/gu, "");
            if (rewritten) {
              prompt = rewritten;
              improved = true;
            }
          } catch (error) {
            logger.warn("[wanderworld] the picture prompt wasn't rewritten: %s", error?.message ?? error);
          }
        }
        // For a look before it's painted.
        if (body.previewOnly === true) return { prompt, improved };
        const styleProfileId = STYLE_PROFILE_IDS.has(body.styleProfileId) ? body.styleProfileId : "";
        const width = Number.isInteger(body.width) ? Math.max(256, Math.min(1536, body.width)) : 1024;
        const height = Number.isInteger(body.height) ? Math.max(256, Math.min(1536, body.height)) : 640;
        try {
          const connection = await imageConnection(idOf(body.connectionId));
          if (!connection) return reply.status(409).send({ error: "Add an image generation connection in the Engine first." });
          const name = slug(values.place || "moment");
          const result = await engineFetch("/api/characters/avatar-generation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              connectionId: connection.id,
              name,
              appearance: prompt,
              width,
              height,
              ...(styleProfileId ? { styleProfileId } : {}),
              promptOverrides: [{ id: `avatar:${name}`, prompt }],
            }),
          });
          if (typeof result?.image !== "string" || !result.image.startsWith("data:image/")) {
            return reply.status(502).send({ error: "The Engine sent back no picture." });
          }
          const at = new Date().toISOString();
          const id = docId("picture", `${worldId}|${at}|${Math.random()}`);
          const caption = text(body.caption, 200) || values.place;
          await putDocument(documents, id, PICTURE_KIND, caption, { worldId, prompt, caption, image: result.image, at });
          // Only the newest pictures of a world are kept.
          const all = (await documents.list(PACKAGE_ID, PICTURE_KIND)).filter((doc) => doc.data?.worldId === worldId);
          all.sort((a, b) => String(b.data?.at).localeCompare(String(a.data?.at)));
          for (const old of all.slice(MAX_PICTURES)) await removeDocument(documents, old.id).catch(() => false);
          return { id, image: result.image, prompt, caption, at, improved };
        } catch (error) {
          logger.warn("[wanderworld] illustrate failed: %s", error?.message ?? error);
          return reply.status(502).send({ error: text(error?.message, 300) || "The picture couldn't be made." });
        }
      });

      routes.get("/pictures/:world", async (request) => {
        const world = idOf(request.params.world);
        const all = (await documents.list(PACKAGE_ID, PICTURE_KIND)).filter((doc) => doc.data?.worldId === world);
        return {
          pictures: all
            .map((doc) => ({ id: doc.id, caption: doc.data.caption ?? "", prompt: doc.data.prompt ?? "", at: doc.data.at }))
            .sort((a, b) => String(b.at).localeCompare(String(a.at))),
        };
      });

      routes.get("/picture/:id", async (request, reply) => {
        const doc = await documents.getById(PACKAGE_ID, idOf(request.params.id));
        if (!doc || doc.kind !== PICTURE_KIND) return reply.status(404).send({ error: "No such picture" });
        return { id: doc.id, image: doc.data.image, caption: doc.data.caption, prompt: doc.data.prompt, at: doc.data.at };
      });

      routes.delete("/picture/:id", async (request) => {
        const doc = await documents.getById(PACKAGE_ID, idOf(request.params.id));
        return { removed: doc?.kind === PICTURE_KIND ? await removeDocument(documents, doc.id) : false };
      });

      // A scene's plan, written here so a Wanderworld scene starts without the Engine's dialog (whose
      // remembered choices come from other chats): the people there, the persona, the moment, the
      // world's notes, and the player's point of view, tense and instructions for this world.
      routes.post("/scene-plan", async (request, reply) => {
        const body = isRecord(request.body) ? request.body : {};
        const sceneContext = checkSceneContext(body.context);
        if (!sceneContext) return reply.status(400).send({ error: "A scene needs at least one character there." });
        const records = await resources.listCharacters(sceneContext.characterIds);
        const cast = records.map((record) => ({ id: record.id, ...characterCard(record) }));
        if (!cast.length) return reply.status(404).send({ error: "Those characters aren't in the Engine any more." });
        const [personaRecord] = sceneContext.personaId ? await resources.listPersonas([sceneContext.personaId]) : [];
        const persona = personaCard(personaRecord, text(body.personaName, MAX.name));
        const initiator = cast.find((person) => person.id === idOf(body.initiatorId)) ?? cast[0];
        const pov = POVS[body.pov] ? body.pov : "second_person";
        const tense = TENSES[body.tense] ? body.tense : "present";
        const extra = block(body.instructions, 1000);
        const system = [
          "You plan a roleplay scene for Marinara Engine, starting from a moment in Wanderworld, a small world the player walks around in. Answer with one JSON object and nothing else.",
          section(
            "The people in it",
            cast
              .map((person) => `${person.name}: ${[person.description, person.personality, person.appearance].filter(Boolean).join(" ").slice(0, 900)}`)
              .join("\n\n"),
          ),
          section(`The player, ${persona.name}`, [persona.description, persona.personality, persona.appearance].filter(Boolean).join(" ").slice(0, 900)),
          section("Where, when and what's between them", sceneContext.notes ?? ""),
          section("Just before", sceneContext.transcript.map((line) => `${line.speaker}: ${line.content}`).join("\n")),
          section("How to write it", `${POVS[pov]}, ${TENSES[tense]}.${extra ? ` ${extra}` : ""}`),
          `{"name": "a short title",
 "description": "one or two sentences the player sees as the scene opens",
 "scenario": "a hidden outline of where the scene could go",
 "firstMessage": "the opening, written as ${initiator.name} (and the narration around them), never the player's words",
 "systemPrompt": "writing instructions for this scene: voice, pace, what to keep to",
 "rating": "sfw or nsfw",
 "relationshipHistory": "who they are to each other and to ${persona.name}, briefly",
 "participationGuide": "one or two friendly lines on how the player can take part"}`,
        ]
          .filter(Boolean)
          .join("\n\n");
        try {
          const model = await languageModels.resolveForRequest({
            connectionId: sceneContext.connectionId || undefined,
          });
          const result = await model.chatComplete(
            [
              { role: "system", content: system },
              { role: "user", content: text(body.prompt, 1500) || `${persona.name} meets ${initiator.name}.` },
            ],
            { temperature: 0.8, maxTokens: 1800 },
          );
          const plan = checkScenePlan(readJson(result?.content, api.runtime.json?.parseJsonish), {
            characterIds: cast.map((person) => person.id),
            pov,
            tense,
            extra,
            fallbackName: text(body.title, 80) || "A scene in Wanderworld",
          });
          if (!plan) return reply.status(502).send({ error: "The model's plan wasn't usable." });
          return { plan, initiatorId: initiator.id };
        } catch (error) {
          logger.warn("[wanderworld] scene plan failed: %s", error?.message ?? error);
          return reply.status(502).send({ error: text(error?.message, 300) || "The model call failed." });
        }
      });

      // Creates a planned scene through the Engine's own /api/scene/create (as its client would after its
      // dialog), with the scene connection and the player's chosen prompt preset, which the Home tab's
      // startScene can't pass. The Engine claims the origin through getContext as usual.
      routes.post("/scene-start", async (request, reply) => {
        const body = isRecord(request.body) ? request.body : {};
        const originId = idOf(body.originId);
        if (!originId || !worldOf(originId)) return reply.status(400).send({ error: "Invalid originId" });
        const origin = await documents.getById(PACKAGE_ID, docId("origin", originId));
        if (!origin) return reply.status(409).send({ error: "That scene's context wasn't kept (save it first)." });
        const plan = checkScenePlan(body.plan, {
          characterIds: origin.data.context.characterIds,
          pov: body.pov,
          tense: body.tense,
          extra: "",
          fallbackName: "A scene in Wanderworld",
        });
        if (!plan) return reply.status(400).send({ error: "Invalid scene plan" });
        // The plan came back from this server's /scene-plan with its system prompt complete; keep it.
        plan.systemPrompt = block(body.plan.systemPrompt, 6000) || plan.systemPrompt;
        const initiatorId = idOf(body.initiatorId);
        // A preset id is a plain id (the Engine also checks that it exists).
        const presetId = text(body.promptPresetId, 100);
        const promptPresetId = /^[A-Za-z0-9_-]+$/u.test(presetId) ? presetId : null;
        const data = isRecord(body.data) ? body.data : null;
        if (data && JSON.stringify(data).length > 3500) return reply.status(400).send({ error: "Scene data too large" });
        try {
          const created = await engineFetch("/api/scene/create", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-marinara-csrf": "1" },
            body: JSON.stringify({
              packageOrigin: { packageId: PACKAGE_ID, originId },
              ...(data ? { packageData: data } : {}),
              initiatorCharId: plan.characterIds.includes(initiatorId) ? initiatorId : plan.characterIds[0],
              plan,
              connectionId: origin.data.context.connectionId ?? null,
              promptPresetId,
            }),
          });
          if (typeof created?.chatId !== "string") return reply.status(502).send({ error: "The Engine made no scene." });
          return { chatId: created.chatId, name: text(created.chatName, 120) };
        } catch (error) {
          logger.warn("[wanderworld] scene start failed: %s", error?.message ?? error);
          return reply.status(502).send({ error: text(error?.message, 300) || "The scene couldn't be made." });
        }
      });

      routes.delete("/scene-results/:id", async (request) => {
        const id = idOf(request.params.id);
        const results = await documents.list(PACKAGE_ID, RESULT_KIND);
        const found = results.find((doc) => doc.id === id);
        return { removed: found ? await removeDocument(documents, found.id) : false };
      });
    },
    { prefix: `/api/${PACKAGE_ID}` },
  );

  const releaseScenes = scenesOn
    ? api.registerSceneOrigin({
        async getContext(originId) {
          const doc = await documents.getById(PACKAGE_ID, docId("origin", String(originId)));
          return doc?.data?.context ?? null;
        },
        async release(originId, end) {
          const worldId = worldOf(String(originId));
          if (!worldId || !isRecord(end) || typeof end.sceneChatId !== "string") return;
          // Idempotent: the same scene's end may come again (a retry, a later delete).
          const id = docId("result", `${originId}|${end.sceneChatId}`);
          if (await documents.getById(PACKAGE_ID, id)) return;
          await putDocument(documents, id, RESULT_KIND, String(originId), {
            worldId,
            originId: String(originId),
            kind: end.kind,
            sceneChatId: end.sceneChatId,
            summary: end.kind === "concluded" ? block(end.summary, 4000) : "",
            description: end.kind === "concluded" ? block(end.description ?? "", 1000) : "",
            characterIds: end.kind === "concluded" ? ids(end.characterIds, MAX.people) : [],
            data: isRecord(end.data) ? end.data : null,
            at: new Date().toISOString(),
          });
          await removeDocument(documents, docId("origin", String(originId))).catch(() => false);
        },
      })
    : () => {};

  return () => {
    releaseRoutes?.();
    releaseScenes?.();
  };
}
