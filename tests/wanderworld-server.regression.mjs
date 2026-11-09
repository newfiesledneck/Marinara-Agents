// Wanderworld's server part, run against a stand-in Engine host: conversation replies are built from the
// character's card, the persona and the world, and cleaned; connections come back without anything
// secret; pictures go through the Engine's image route with the chosen style; a scene's context is kept
// for the Engine's planner, and its recap comes back once (however often the Engine reports the end).
// Run: node tests/wanderworld-server.regression.mjs
import assert from "node:assert/strict";

const server = await import("../packages/wanderworld/server.mjs");

// ── The pure parts ──
assert.equal(
  server.cleanReply('Mira: "Morning! The bread\'s still warm."', "Mira"),
  "Morning! The bread's still warm.",
);
assert.equal(server.cleanReply("<think>plan</think>**Mira**: Hello.", "Mira"), "Hello.");
assert.equal(server.checkSceneContext({ characterIds: [] }), null, "a scene needs someone to cast");
assert.deepEqual(
  server.checkSceneContext({
    characterIds: ["c-1", "bad id!", 5],
    personaId: "p-1",
    transcript: [{ speaker: "Mira", content: "Hi" }],
  }).characterIds,
  ["c-1"],
  "only well-formed character ids are kept",
);

// ── A stand-in Engine ──
const docs = new Map();
const documents = {
  async list(packageId, kind) {
    return [...docs.values()].filter((doc) => doc.packageId === packageId && doc.kind === kind);
  },
  async getById(packageId, id) {
    const doc = docs.get(id);
    return doc && doc.packageId === packageId ? doc : null;
  },
  async create(input) {
    const doc = { ...input, revision: 1 };
    docs.set(input.id, doc);
    return doc;
  },
  async update(input) {
    const doc = docs.get(input.id);
    assert.equal(input.expectedRevision, doc.revision, "updates name the revision they read");
    const next = { ...doc, ...input, revision: doc.revision + 1 };
    docs.set(input.id, next);
    return next;
  },
  async remove(packageId, id, revision) {
    assert.equal(docs.get(id).revision, revision);
    return docs.delete(id);
  },
};
const calls = [];
const runtime = {
  persistence: { documents },
  resources: {
    async listCharacters(idsWanted) {
      return idsWanted.includes("c-mira")
        ? [
            {
              id: "c-mira",
              comment: "",
              data: {
                name: "Mira",
                description: "{{char}} bakes bread for {{user}}.",
                personality: "warm",
                extensions: { appearance: "flour on her apron" },
              },
            },
          ]
        : [];
    },
    async listPersonas() {
      return [{ id: "p-zoey", data: { name: "Zoey", description: "A traveller." } }];
    },
    async listEligibleLorebookEntries({ entryIds }) {
      return entryIds.map((id) => ({
        id,
        lorebookId: "lb",
        lorebookName: "Book",
        name: "The bakery",
        content: "Open at dawn.",
        description: "",
      }));
    },
  },
  languageModels: {
    async resolveForRequest({ connectionId }) {
      return {
        connectionId: connectionId ?? "default",
        model: "test-model",
        async chatComplete(messages, options) {
          calls.push({ messages, options });
          return { content: "Mira: *dusts off her hands* Fresh loaves today!" };
        },
      };
    },
  },
  logger: { warn() {}, info() {}, debug() {} },
};
const routes = { get: new Map(), post: new Map(), delete: new Map() };
let origin = null;
const api = {
  runtime,
  async registerPrivilegedRoutes(register, options) {
    assert.equal(options.prefix, "/api/wanderworld");
    await register({
      get: (path, handler) => routes.get.set(path, handler),
      post: (path, handler) => routes.post.set(path, handler),
      delete: (path, handler) => routes.delete.set(path, handler),
    });
    return () => {};
  },
  registerSceneOrigin(provider) {
    origin = provider;
    return () => {};
  },
};
const fetched = [];
globalThis.fetch = async (url, options = {}) => {
  fetched.push({ url, options });
  const json = (body) => ({ ok: true, json: async () => body });
  if (url.endsWith("/api/connections")) {
    return json([
      { id: "t-1", name: "Claude", provider: "anthropic", model: "x", apiKeyEncrypted: "••••••••", isDefault: true },
      { id: "i-1", name: "Painter", provider: "image_generation", model: "sdxl", apiKeyEncrypted: "••••••••" },
    ]);
  }
  if (url.endsWith("/api/characters/avatar-generation")) return json({ image: "data:image/png;base64,AAAA" });
  return { ok: false, status: 404, json: async () => ({}) };
};
const replyStub = () => {
  const reply = { code: 200, body: null };
  reply.status = (code) => ((reply.code = code), reply);
  reply.send = (body) => ((reply.body = body), reply);
  return reply;
};
const call = async (method, path, { body, params } = {}) => {
  const reply = replyStub();
  const result = await routes[method].get(path)({ body, params: params ?? {} }, reply);
  return { code: reply.code, body: result === reply ? reply.body : result };
};

const stop = await server.activate({ api });
assert.equal(typeof stop, "function");
assert.deepEqual((await call("get", "/status")).body, { server: true, scenes: true, images: true, talk: true });

// Connections: split by kind, nothing secret.
const connections = (await call("get", "/connections")).body;
assert.deepEqual(
  connections.text.map((row) => row.id),
  ["t-1"],
);
assert.deepEqual(
  connections.image.map((row) => row.id),
  ["i-1"],
);
assert.ok(!JSON.stringify(connections).includes("apiKey"), "no key fields reach the client");

// Talk: the card, persona, world and lore go into the prompt; the reply comes back clean.
const talk = await call("post", "/talk", {
  body: {
    characterId: "c-mira",
    personaId: "p-zoey",
    place: "the bakery, in Briarwood",
    time: "early morning",
    relationship: "a good friend",
    lore: [{ lorebookId: "lb", entryId: "e-1" }],
    history: [
      { from: "player", text: "Hello!" },
      { from: "character", text: "Oh, hi!" },
    ],
    line: "What's fresh?",
    connectionId: "t-1",
    style: "cosy",
    length: "short",
  },
});
assert.equal(talk.code, 200);
assert.equal(talk.body.reply, "*dusts off her hands* Fresh loaves today!");
const [{ messages, options }] = calls;
const system = messages[0].content;
assert.match(system, /You are Mira/u);
assert.match(system, /Mira bakes bread for Zoey\./u, "card placeholders are filled in");
assert.match(system, /flour on her apron/u, "appearance from the card's extensions");
assert.match(system, /The bakery: Open at dawn\./u, "lore entries by id");
assert.match(system, /a good friend/u);
assert.deepEqual(
  messages.slice(1).map((message) => message.role),
  ["user", "assistant", "user"],
  "history, then the new line",
);
assert.equal(options.maxTokens, 160, "a short reply");
assert.equal((await call("post", "/talk", { body: { characterId: "nobody" } })).code, 404);
assert.equal((await call("post", "/talk", { body: {} })).code, 400);

// Pictures: through the Engine's image route, with the style profile, and a known one only.
const picture = await call("post", "/image", {
  body: { prompt: "a market at dawn", name: "Briarwood market", styleProfileId: "painterly" },
});
assert.equal(picture.body.image, "data:image/png;base64,AAAA");
const sent = JSON.parse(fetched.at(-1).options.body);
assert.equal(sent.connectionId, "i-1", "the only image connection");
assert.equal(sent.styleProfileId, "painterly");
assert.deepEqual(sent.promptOverrides, [{ id: "avatar:briarwood-market", prompt: "a market at dawn" }]);
await call("post", "/image", { body: { prompt: "x", styleProfileId: "../../etc" } });
assert.equal(JSON.parse(fetched.at(-1).options.body).styleProfileId, undefined, "an unknown style is left out");

// Scenes: the context waits for the planner; the recap comes back once.
const originId = "world:w1/scene:1";
assert.equal(
  (await call("post", "/scene-origin", { body: { originId: "elsewhere", context: { characterIds: ["c-mira"] } } }))
    .code,
  400,
);
assert.equal((await call("post", "/scene-origin", { body: { originId, context: { characterIds: [] } } })).code, 400);
await call("post", "/scene-origin", {
  body: {
    originId,
    context: { characterIds: ["c-mira"], personaId: "p-zoey", notes: "At the bakery.", lorebookIds: ["lb"] },
  },
});
const context = await origin.getContext(originId);
assert.deepEqual(context.characterIds, ["c-mira"]);
assert.equal(context.notes, "At the bakery.");
assert.equal(await origin.getContext("world:w1/scene:none"), null);
const end = {
  kind: "concluded",
  sceneChatId: "chat-9",
  summary: "They shared breakfast.",
  description: "",
  scenario: null,
  rating: "sfw",
  characterIds: ["c-mira"],
  data: { worldId: "w1" },
};
await origin.release(originId, end);
await origin.release(originId, end); // again: a retry
const results = (await call("get", "/scene-results/:world", { params: { world: "w1" } })).body.results;
assert.equal(results.length, 1, "one recap, however often the end is reported");
assert.equal(results[0].summary, "They shared breakfast.");
assert.equal(await origin.getContext(originId), null, "the context goes once the scene has ended");
assert.equal((await call("get", "/scene-results/:world", { params: { world: "w2" } })).body.results.length, 0);
await call("delete", "/scene-results/:id", { params: { id: results[0].id } });
assert.equal(
  (await call("get", "/scene-results/:world", { params: { world: "w1" } })).body.results.length,
  0,
  "kept and gone",
);

console.log("wanderworld server regression: OK");
