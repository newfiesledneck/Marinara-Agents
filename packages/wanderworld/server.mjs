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
      routes.get("/status", async () => ({ server: true, scenes: scenesOn, images: true, talk: true }));

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
