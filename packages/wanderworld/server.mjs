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
};
const LENGTHS = { short: [1, 2, 160], medium: [1, 3, 320], long: [2, 5, 600] }; // sentences and max tokens
const PICTURE_KIND = "picture";
const MAX_PICTURES = 60; // per world, oldest let go first
/** What people can do on a schedule (the client acts each out; npcs.js). */
export const ACTIVITIES = ["home", "work", "eat", "visit", "sit", "walk"];
/** How a voice carries: whisper, talk or shout (the client picks who's in range; the model is told). */
const VOICES = { whisper: "whispers", talk: "says", shout: "shouts" };

// ── Small checks (every field from the client is checked here: it is a trust boundary) ──────────

const text = (value, max) => (typeof value === "string" ? value.replace(/\s+/gu, " ").trim().slice(0, max) : "");
const block = (value, max) => (typeof value === "string" ? value.trim().slice(0, max) : "");
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

/** A schedule entry, checked: { from, to (hours 0–24, half hours), activity, place (a place id or name) }. */
export function checkEntry(raw, places = null) {
  if (!isRecord(raw)) return null;
  const hour = (value) => (Number.isFinite(Number(value)) ? Math.round(Math.max(0, Math.min(24, Number(value))) * 2) / 2 : null);
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
    section("The world", input.setting),
    section(
      "Right now",
      [input.place && `Where: ${input.place}.`, input.time && `When: ${input.time}.`, input.weather && `Weather: ${input.weather}.`].filter(Boolean).join("\n"),
    ),
    section(
      "Who can hear",
      people ||
        "Nobody is close enough to hear. Reply with narration only (what the player notices), and no replies.",
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
  return String(template)
    .replace(/\{(\w+)\}/gu, (match, key) => (typeof values[key] === "string" ? values[key] : ""))
    .replace(/[ \t]+/gu, " ")
    .replace(/\s+([,.])/gu, "$1")
    .replace(/([,.]){2,}/gu, "$1")
    .trim()
    .slice(0, MAX.prompt);
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
  return {
    text: list.filter((row) => row.provider !== "image_generation").map(shown),
    image: list.filter((row) => row.provider === "image_generation").map(shown),
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
        const [record] = await resources.listCharacters([characterId]);
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
          lore: loreEntries.map((entry) => `${text(entry.name, MAX.name)}: ${block(entry.content, MAX.loreText)}`),
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
        const records = listeners.length ? await resources.listCharacters(listeners.map((person) => person.id)) : [];
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
        const input = {
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
        const [record] = characterId ? await resources.listCharacters([characterId]) : [];
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

      // Illustrate the moment: the user's template filled with where and when, who's there (their looks
      // from their cards), what's going on; painted, and kept in the world's gallery.
      routes.post("/illustrate", async (request, reply) => {
        const body = isRecord(request.body) ? request.body : {};
        const worldId = idOf(body.worldId);
        const template = block(body.template, 2000);
        if (!worldId || !template) return reply.status(400).send({ error: "A world and a prompt template are needed." });
        const facts = isRecord(body.facts) ? body.facts : {};
        const people = (Array.isArray(facts.people) ? facts.people : []).filter(isRecord).slice(0, 8);
        const records = people.length ? await resources.listCharacters(people.map((person) => idOf(person.id)).filter(Boolean)) : [];
        const cards = new Map(records.map((record) => [record.id, characterCard(record)]));
        const personaId = idOf(body.personaId);
        const [personaRecord] = personaId ? await resources.listPersonas([personaId]) : [];
        const persona = personaCard(personaRecord, text(facts.persona, MAX.name));
        const looks = people
          .map((person) => {
            const card = cards.get(idOf(person.id));
            const name = card?.name ?? text(person.name, MAX.name);
            return card?.appearance ? `${name}: ${card.appearance.slice(0, 300)}` : "";
          })
          .filter(Boolean);
        const values = {
          persona: persona.name,
          // "Zoey: tall, red-haired…", or nothing when the card has no appearance (so no dangling name).
          persona_appearance: persona.appearance ? `${persona.name}: ${persona.appearance.slice(0, 300)}` : "",
          people: people.map((person) => `${cards.get(idOf(person.id))?.name ?? text(person.name, MAX.name)}${text(person.doing, 80) ? ` (${text(person.doing, 80)})` : ""}`).join(", "),
          people_appearance: looks.join("; "),
          place: text(facts.place, 200),
          place_kind: text(facts.placeKind, 60),
          time: text(facts.time, 40),
          time_of_day: text(facts.timeOfDay, 40),
          weather: text(facts.weather, 40),
          activity: text(facts.activity, 160),
          setting: text(facts.setting, 400),
          recent: text(facts.recent, 400),
        };
        const prompt = fillTemplate(template, values);
        if (!prompt) return reply.status(400).send({ error: "The template came out empty." });
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
          return { id, image: result.image, prompt, caption, at };
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
