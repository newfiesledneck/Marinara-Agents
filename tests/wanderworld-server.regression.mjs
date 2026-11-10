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
assert.equal((await call("get", "/status")).body.moments, true);

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

// Moments: only those who could hear may answer; plans name real places; a schedule from the model is
// checked the same way.
{
  assert.deepEqual(server.checkEntry({ from: 7.3, to: 9, activity: "work", place: "" }), {
    from: 7.25,
    to: 9,
    activity: "work",
    place: "",
  });
  assert.equal(server.checkEntry({ from: 7, to: 9, activity: "fly" }), null, "unknown activities are refused");
  assert.equal(
    server.checkEntry({ from: 7, to: 9, activity: "visit", place: "the moon" }, [{ id: "z:1", name: "The Tavern" }]),
    null,
  );
  assert.equal(
    server.checkEntry({ from: 7, to: 9, activity: "visit", place: "the tavern" }, [{ id: "z:1", name: "The Tavern" }])
      .place,
    "z:1",
  );
  assert.equal(
    server.fillTemplate("{persona} at {place}, {weather}, {unknown}.", {
      persona: "Zoey",
      place: "the market",
      weather: "",
    }),
    "Zoey at the market.",
    "placeholders filled, empty ones tidied away",
  );
  // The stand-in model answers a moment.
  runtime.languageModels.resolveForRequest = async () => ({
    connectionId: "t-1",
    model: "m",
    async chatComplete(messages) {
      calls.push({ messages });
      return {
        content:
          'Sure! {"narration": "The notes flutter.", "replies": [{"id": "c-mira", "text": "Mira: Fresh notices today!"}, {"id": "c-ghost", "text": "Boo"}], "plans": [{"id": "c-mira", "from": 12, "to": 13, "activity": "visit", "place": "the fountain"}, {"id": "c-mira", "from": 1, "to": 2, "activity": "visit", "place": "Atlantis"}]}',
      };
    },
  });
  const moment = await call("post", "/moment", {
    body: {
      personaId: "p-zoey",
      action: "reads the notes on the noticeboard",
      line: "Anything new?",
      voice: "shout",
      listeners: [
        { id: "c-mira", distance: 6, doing: "sitting on a bench" },
        { id: "c-ghost", distance: 2 },
      ],
      places: [{ id: "fountain", name: "the fountain" }],
    },
  });
  assert.equal(moment.code, 200);
  assert.equal(moment.body.narration, "The notes flutter.");
  assert.deepEqual(
    moment.body.replies,
    [{ id: "c-mira", text: "Fresh notices today!" }],
    "only characters who exist and heard",
  );
  assert.deepEqual(
    moment.body.plans,
    [{ id: "c-mira", entry: { from: 12, to: 13, activity: "visit", place: "fountain" } }],
    "plans at real places only",
  );
  const prompt = calls.at(-1).messages[0].content;
  assert.match(prompt, /id "c-mira": Mira, 6 m away, sitting on a bench/u);
  assert.doesNotMatch(prompt, /c-ghost/u, "someone who isn't a character isn't listed");
  assert.match(
    calls.at(-1).messages[1].content,
    /Zoey reads the notes on the noticeboard\. Zoey shouts: "Anything new\?"/u,
  );
  assert.equal((await call("post", "/moment", { body: {} })).code, 400, "something has to happen");
  // Nobody near: it's still told. And a narrator card, when one is set, gives the telling its voice.
  await call("post", "/moment", { body: { action: "skips a stone", personaId: "p-zoey", narratorId: "c-mira" } });
  assert.match(calls.at(-1).messages[0].content, /Nobody is close enough to hear. Still narrate/u);
  assert.match(calls.at(-1).messages[0].content, /You narrate as Mira./u);
  await call("post", "/moment", { body: { action: "skips a stone", narratorId: "local:new-1" } });
  assert.doesNotMatch(calls.at(-1).messages[0].content, /You narrate as/u, "only an Engine card narrates");

  runtime.languageModels.resolveForRequest = async () => ({
    connectionId: "t-1",
    model: "m",
    async chatComplete() {
      return {
        content:
          '{"entries": [{"from": 0, "to": 7, "activity": "home"}, {"from": 7, "to": 12, "activity": "work"}, {"from": 12, "to": 13, "activity": "eat", "place": "the tavern"}, {"from": 13, "to": 14, "activity": "visit", "place": "Mordor"}]}',
      };
    },
  });
  const plan = await call("post", "/plan", {
    body: { characterId: "c-mira", places: [{ id: "tav", name: "the tavern", kind: "tavern" }] },
  });
  assert.deepEqual(
    plan.body.entries.map((entry) => `${entry.from}-${entry.to} ${entry.activity} ${entry.place}`),
    ["0-7 home ", "7-12 work ", "12-13 eat tav"],
    "a visit to a place that isn't there is dropped",
  );

  // The lore setup: the model's keywords for each entry, checked (plain words, no place past what a world
  // builds, lists kept in the order asked), and names for numbered places.
  let asked = null;
  runtime.languageModels.resolveForRequest = async () => ({
    connectionId: "t-1",
    model: "m",
    async chatComplete(messages) {
      asked = messages;
      return {
        content:
          '{"entries": [{"n": 1, "keys": ["tavern1", "located in town1", "tavern9", "<b>x</b>"]}, {"n": 2, "keys": ["Mira", "lives in home3", "lives in home99", "female"]}, {"n": 7, "keys": ["world"]}], "names": {"tavern1": " The Gilded Stag ", "castle1": "Keep", "home41": "Too many"}}',
      };
    },
  });
  const setup = await call("post", "/lore-setup", {
    body: {
      worldName: "Ashfall",
      setting: "a mining town",
      persona: "Zoey",
      characters: ["Mira"],
      places: true,
      people: true,
      placed: [{ slot: "smithy1", name: "The Anvil", title: "Anvil" }, { slot: "dungeon1" }],
      entries: [
        { title: "The Gilded Stag", keys: ["stag", "ale"], content: "The only tavern in Ashfall." },
        { title: "Mira", keys: [], content: "Mira the baker lives in the third house." },
      ],
    },
  });
  assert.equal(setup.code, 200);
  assert.deepEqual(setup.body.keys, [
    ["tavern1", "located in town1"],
    ["Mira", "lives in home3", "female"],
  ]);
  assert.deepEqual(setup.body.names, { tavern1: "The Gilded Stag" });
  assert.match(asked[1].content, /1\. The Gilded Stag \[stag, ale\]\nThe only tavern in Ashfall\./u);
  assert.match(asked[1].content, /smithy1 = The Anvil \(entry "Anvil"\)/u, "later batches are told what's placed");
  assert.doesNotMatch(asked[1].content, /dungeon1/u, "only places a world can build");
  assert.match(asked[0].content, /Keywords for people/u);
  await call("post", "/lore-setup", { body: { places: true, entries: [{ title: "A", content: "b" }] } });
  assert.doesNotMatch(asked[0].content, /Keywords for people/u, "only what was asked for");
  assert.equal((await call("post", "/lore-setup", { body: {} })).code, 400, "there must be entries");
  // The cast's cards and the persona are read from the Engine and come first, with no lorebook at all.
  const cards = await call("post", "/lore-setup", {
    body: {
      people: true,
      persona: "Zoey",
      characters: ["Mira"],
      characterIds: ["c-mira", "c-ghost"],
      personaId: "p-zoey",
      entries: [{ title: "Character card: Forged", content: "x" }],
    },
  });
  assert.equal(cards.body.keys.length, 3, "one answer each for Mira, someone who's gone, and the player");
  assert.match(asked[1].content, /1\. Character card: Mira\nMira bakes bread for Zoey\./u);
  assert.match(asked[1].content, /2\. Character card: \(gone\)\n+3\. Character card: player \(Zoey\)\nA traveller\./u);
  assert.doesNotMatch(asked[1].content, /Forged/u, "a card can't be passed off by the client");
  assert.match(asked[0].content, /The world can build these places/u, "the cast needs the places to live and work in");
  assert.deepEqual(server.checkLoreSetup({ entries: "x", names: [] }, 2), { keys: [[], []], names: {} });

  // A world written for itself: places a world can build, once each; new people, never named as someone
  // already there and no more than asked for. Each step is told what the last one gave.
  runtime.languageModels.resolveForRequest = async () => ({
    connectionId: "t-1",
    model: "m",
    async chatComplete(messages) {
      asked = messages;
      return {
        content: messages[0].content.startsWith("You invent")
          ? '{"people": [{"name": "Mira", "body": "female"}, {"name": "Oswin", "body": "male", "description": "The smith.", "keys": ["lives in home2", "owner of smithy1", "owner of smithy9", "<i>"]}, {"name": "Brida", "body": "x"}, {"name": "Tolly"}]}'
          : '{"premise": "A fishing village.", "places": [{"slot": "tavern1", "name": "The Drowned Bell", "lore": "Low beams."}, {"slot": "tavern1", "name": "Again"}, {"slot": "castle1", "name": "Keep"}, {"slot": "pond1", "name": ""}]}',
      };
    },
  });
  const written = await call("post", "/world-write", {
    body: { step: "places", worldName: "Saltmere", characters: ["Mira"], placed: [{ slot: "home1", title: "Mira" }] },
  });
  assert.deepEqual(written.body, {
    premise: "A fishing village.",
    places: [{ slot: "tavern1", name: "The Drowned Bell", lore: "Low beams." }],
  });
  assert.match(asked[1].content, /No setting was given/u);
  assert.match(asked[1].content, /home1 \(Mira\)/u);
  const invented = await call("post", "/world-write", {
    body: {
      step: "people",
      count: 2,
      characters: ["Mira"],
      premise: "A fishing village.",
      places: [{ slot: "tavern1", name: "The Drowned Bell", lore: "Low beams." }],
    },
  });
  assert.deepEqual(
    invented.body.people.map((person) => [person.name, person.body, person.keys]),
    [
      ["Oswin", "male", ["lives in home2", "owner of smithy1"]],
      ["Brida", "", []],
    ],
    "not Mira again, and no more than two",
  );
  assert.match(asked[0].content, /^You invent 2 new people/u);
  assert.match(asked[1].content, /tavern1 = The Drowned Bell: Low beams\./u, "people are built around the places");

  // Someone a world made for itself answers from what the client holds; an Engine id can't be passed off.
  runtime.languageModels.resolveForRequest = async () => ({
    connectionId: "t-1",
    model: "m",
    async chatComplete(messages) {
      asked = messages;
      return { content: "Aye." };
    },
  });
  const own = { id: "local:new-1", name: "Oswin", description: "The smith of Saltmere." };
  const localTalk = await call("post", "/talk", {
    body: {
      characterId: "local:new-1",
      line: "Hello",
      locals: [own, { id: "c-mira", name: "Forged" }],
      loreTexts: ["The Drowned Bell: Low beams."],
    },
  });
  assert.equal(localTalk.body.reply, "Aye.");
  assert.match(asked[0].content, /The smith of Saltmere\./u);
  assert.match(asked[0].content, /The Drowned Bell: Low beams\./u, "the world's own lore comes as text");
  assert.equal((await call("post", "/talk", { body: { characterId: "local:new-2", locals: [own] } })).code, 404);
  await call("post", "/talk", {
    body: { characterId: "c-mira", line: "Hi", locals: [{ id: "c-mira", name: "Forged" }] },
  });
  assert.doesNotMatch(asked[0].content, /Forged/u, "an Engine character is always read from the Engine");

  // What people look like, for looking at them: the card's appearance, or a world's own person's.
  const looks = await call("post", "/looks", {
    body: {
      ids: ["c-mira", "local:new-1", "c-ghost"],
      locals: [{ id: "local:new-1", name: "Oswin", appearance: "Soot to the elbows." }],
    },
  });
  assert.deepEqual(looks.body.looks, { "c-mira": "flour on her apron", "local:new-1": "Soot to the elbows." });

  // Illustrate: the template filled with the people's looks from their cards, painted and kept; the gallery
  // lists it without the picture itself, which comes one at a time.
  const shot = await call("post", "/illustrate", {
    body: {
      worldId: "w1",
      template: "{persona} with {people} at {place}, {time_of_day}. {people_appearance}",
      facts: { place: "the bakery", timeOfDay: "morning", people: [{ id: "c-mira", doing: "kneading dough" }] },
      personaId: "p-zoey",
      styleProfileId: "anime",
    },
  });
  assert.equal(shot.code, 200);
  assert.equal(shot.body.prompt, "Zoey with Mira (kneading dough) at the bakery, morning. Mira: flour on her apron");
  // A long appearance ends on a whole word (a clause, when one ends near), never mid-word; a short one is whole.
  assert.equal(server.cutWords("tall, dark kohl, and a little scar", 26), "tall, dark kohl, and a");
  assert.equal(server.cutWords("tall, dark kohl, and a little scar", 20), "tall, dark kohl");
  assert.equal(server.cutWords("one two three four five", 12), "one two");
  assert.equal(server.cutWords("short  and\nwhole", 300), "short and whole");
  const long = `${"a long green cloak, ".repeat(40)}and boots`;
  assert.equal(server.cutWords(long, 1500), long, "an appearance of 800 characters is kept whole");
  // What the world looks like comes from the game ({world_look}); {setting} is only the player's own words.
  const looked = await call("post", "/illustrate", {
    body: {
      worldId: "w1",
      template: "{place}. {world_look}. {setting}. No text.",
      facts: { place: "the bakery", look: "medieval fantasy village" },
      previewOnly: true,
    },
  });
  assert.equal(looked.body.prompt, "the bakery. medieval fantasy village. No text.");
  const gallery = (await call("get", "/pictures/:world", { params: { world: "w1" } })).body.pictures;
  assert.equal(gallery.length, 1);
  assert.equal(gallery[0].image, undefined, "the list carries no image data");
  assert.equal(
    (await call("get", "/picture/:id", { params: { id: gallery[0].id } })).body.image,
    "data:image/png;base64,AAAA",
  );
  await call("delete", "/picture/:id", { params: { id: gallery[0].id } });
  assert.equal((await call("get", "/pictures/:world", { params: { world: "w1" } })).body.pictures.length, 0);

  // The prompt can be rewritten by the model first (to the player's instruction, or the usual one), looked
  // over before anything is painted, and then painted as approved without another rewrite.
  const heard = [];
  runtime.languageModels.resolveForRequest = async () => ({
    connectionId: "t-1",
    model: "m",
    async chatComplete(messages) {
      heard.push(messages);
      return { content: '<think>hm</think>"A warm bakery at dawn, flour in the light."' };
    },
  });
  const scene = {
    worldId: "w1",
    template: "{persona} at {place}",
    facts: { place: "the bakery" },
    personaId: "p-zoey",
  };
  const draft = await call("post", "/illustrate", { body: { ...scene, improve: true, previewOnly: true } });
  assert.deepEqual(draft.body, { prompt: "A warm bakery at dawn, flour in the light.", improved: true });
  assert.equal(heard[0][0].content, server.IMPROVE_INSTRUCTION);
  assert.equal(heard[0][1].content, "Zoey at the bakery");
  assert.equal(
    (await call("get", "/pictures/:world", { params: { world: "w1" } })).body.pictures.length,
    0,
    "a look paints nothing",
  );
  await call("post", "/illustrate", {
    body: { ...scene, improve: true, previewOnly: true, instruction: "Make it noir." },
  });
  assert.equal(heard[1][0].content, "Make it noir.", "the player's own instruction");
  const painted = await call("post", "/illustrate", {
    body: { ...scene, improve: true, prompt: "Just the bakery, please." },
  });
  assert.equal(painted.body.prompt, "Just the bakery, please.", "an approved prompt is painted as it is");
  assert.equal(heard.length, 2, "and isn't rewritten again");
  runtime.languageModels.resolveForRequest = async () => ({
    async chatComplete() {
      throw new Error("down");
    },
  });
  const plain = await call("post", "/illustrate", { body: { ...scene, improve: true, previewOnly: true } });
  assert.deepEqual(
    plain.body,
    { prompt: "Zoey at the bakery", improved: false },
    "a rewrite that fails leaves the prompt",
  );
}

// Scenes Wanderworld plans itself: the plan is checked and carries the player's point of view, tense and
// instructions; it's made through the Engine's /api/scene/create with the chosen prompt preset; and the
// prompt presets are listed with the connections.
{
  const realFetch = globalThis.fetch;
  const created = [];
  globalThis.fetch = async (url, options = {}) => {
    const json = (body) => ({ ok: true, json: async () => body });
    if (url.endsWith("/api/prompts")) return json([{ id: "pre-1", name: "Cosy RP" }]);
    if (url.endsWith("/api/scene/create")) {
      created.push(JSON.parse(options.body));
      return json({ chatId: "chat-42", chatName: "Breakfast" });
    }
    return realFetch(url, options);
  };
  assert.deepEqual((await call("get", "/connections")).body.presets, [{ id: "pre-1", name: "Cosy RP", model: "" }]);
  assert.equal(server.checkScenePlan({ description: "x" }, { characterIds: ["c-1"] }), null, "a plan needs an opening");
  runtime.languageModels.resolveForRequest = async () => ({
    connectionId: "t-1",
    model: "m",
    async chatComplete(messages) {
      calls.push({ messages });
      return {
        content:
          '{"name": "Breakfast", "description": "Morning light.", "scenario": "They talk.", "firstMessage": "Mira sets down two cups.", "systemPrompt": "Gentle.", "rating": "spicy", "relationshipHistory": "Friends.", "participationGuide": "Say hello."}',
      };
    },
  });
  const sceneContext = { characterIds: ["c-mira"], personaId: "p-zoey", connectionId: "t-1", notes: "At the bakery." };
  const planned = await call("post", "/scene-plan", {
    body: {
      context: sceneContext,
      prompt: "Zoey goes in.",
      pov: "third_person",
      tense: "past",
      instructions: "Keep it cosy.",
    },
  });
  assert.equal(planned.code, 200);
  const { plan } = planned.body;
  assert.equal(plan.firstMessage, "Mira sets down two cups.");
  assert.deepEqual(plan.characterIds, ["c-mira"]);
  assert.equal(plan.rating, "sfw", "an unknown rating is safe");
  assert.match(plan.systemPrompt, /Gentle\.\n\nWrite in third person \(they\), past tense\./u);
  assert.match(plan.systemPrompt, /Keep it cosy\./u, "the world's instructions always go in");
  assert.doesNotMatch(calls.at(-1).messages[0].content, /extra instructions from another chat/u);
  assert.match(calls.at(-1).messages[0].content, /Mira: .*bakes bread/u, "the cast's cards go to the planner");

  const originId = "world:w1/scene:2";
  assert.equal(
    (await call("post", "/scene-start", { body: { originId, plan } })).code,
    409,
    "the context must be kept first",
  );
  await call("post", "/scene-origin", { body: { originId, context: sceneContext } });
  const started = await call("post", "/scene-start", {
    body: { originId, plan, initiatorId: "c-mira", promptPresetId: "pre-1", data: { worldId: "w1" } },
  });
  assert.equal(started.body.chatId, "chat-42");
  const sent = created.at(-1);
  assert.deepEqual(sent.packageOrigin, { packageId: "wanderworld", originId });
  assert.equal(sent.promptPresetId, "pre-1", "the chosen preset goes with it");
  assert.equal(sent.connectionId, "t-1", "on the scene's connection");
  assert.equal(sent.initiatorCharId, "c-mira");
  assert.equal(sent.plan.systemPrompt, plan.systemPrompt);
  await call("post", "/scene-start", { body: { originId, plan, promptPresetId: "../x" } });
  assert.equal(created.at(-1).promptPresetId, null, "a malformed preset id isn't sent");
  globalThis.fetch = realFetch;
}

console.log("wanderworld server regression: OK");
