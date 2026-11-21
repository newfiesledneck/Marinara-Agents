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
//   GET  /saves               — every saved world's text, with the list of worlds and which was last played.
//   POST /save                — one of those, kept ({ key, value }); DELETE /save/:key removes one.
//
// Saved worlds are kept here, a document each, with scene contexts, recaps and pictures (`storage`
// permission, persistence.documents); the client checks every field of a world when it reads one. Model calls go through api.runtime.languageModels on a
// connection the user chose (or the Engine's default). Images and the connection list come from the
// Engine's own REST API over loopback (`network` permission), as Quartermaster and Gacha Forge do: the
// capability runtime has no image or connection-list method.

import { createHash } from "node:crypto";

const PACKAGE_ID = "wanderworld";
const ORIGIN_KIND = "scene-origin";
const RESULT_KIND = "scene-result";
const SAVE_KIND = "save";
/** A save's key, as the client names them (store.js): the list of worlds, the one last played, the shared settings, a world. */
const SAVE_KEY = /^wanderworld\.(worlds|lastWorld|shared|world\.[A-Za-z0-9_-]{1,80})$/u;
const MAX_SAVE_CHARS = 64_000_000;
const MAX_SAVES = 300;
const MAX = {
  id: 200,
  name: 120,
  line: 1200,
  history: 24,
  // Cards, personas, narrator cards and lore go whole: this is a ceiling on what a request may carry, far
  // above any of them, not a cut.
  card: 200000,
  notes: 4000,
  lore: 60, // lore entries with one call
  loreText: 200000,
  prompt: 1500,
  appearance: 200000, // a card's whole Appearance, as pictures use it
  worn: 4000, // what the persona is wearing, from Quartermaster's sheet
  picture: 600000, // an Illustrate prompt: whole appearances for the player and up to eight others
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
const PICTURE_IMAGE_KIND = "picture-image";
/** The document a picture's image is kept in, beside the picture's own. */
const imageDocId = (pictureId) => docId("image", pictureId);
/** What the model is told when it rewrites a picture's prompt, unless the player has written their own. */
export const IMPROVE_INSTRUCTION =
  "You write the prompt for an image generation model that reads natural-language prose. Turn the facts that follow into one vividly detailed image prompt for the current moment: the single most interesting instant of it.\n\nRules:\n1. The image model draws only what the prompt states. Write only what is meant to be seen, and describe every visible character from the facts given, in enough detail that an artist could paint them recognisably: face, hair, eyes, race or kind, skin, fur or scale tone, build and height, and everything they wear. Never generalise a look the facts spell out.\n2. Flowing prose, never a list of tags: one substantial paragraph of about 200 to 300 words that covers the whole picture. One or two short sentences is a failure.\n3. Ground the place so it could be painted: surfaces, props, the time of day, the light, the weather when outdoors, the background. Describe what it looks like, not what it is called, and nothing that is out of sight.\n4. For each character give their action, expression, pose and where they are in the frame.\n5. Set the composition: one camera angle, the shot distance, a lens (focal length and aperture, like 35mm f/2.8), the lighting and the mood. Choose the angle that shows the action best, and prefer a lively one to a flat one.\n6. Give each character's name once, right before their description (an image model that knows the name can use it), and after that refer to them by how they look. A name never stands in for the description.\n7. Describe only what the chosen angle shows. Of someone facing away or partly out of frame, describe the back of the head, the hair and the posture, not the hidden face.\n8. Never an over-the-shoulder view.\n9. Keep it focused: one moment, one angle, one main character unless the moment needs more (a wide view, a conversation). Don't crowd it.\n10. Finish with the art style the facts ask for, if they name one. No names of real artists, and no words, captions or speech bubbles in the picture.\n\nAnswer with the prompt only: no title, no notes, no quotation marks.";
/** Added to whatever the rewrite is told, when the last of the chat goes with the prompt. */
export const IMPROVE_CHAT_NOTE =
  "The facts come inside <facts>. After them, inside <chat>, come the last things said and done here, oldest first. Paint the moment they end on. Where they say more than the facts do, or something else (the facts say standing, the chat says kneeling by the pond, meditating), the chat is right about what each person is doing, their pose, what they hold and their mood. Take only what could be seen, and none of the words spoken. The chat is for you alone: never copy it, quote it or add a section about it to the prompt.";
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
/**
 * Cut to `max` characters with its line breaks kept: at the end of a sentence or a line when one ends in
 * the last two fifths, else at the end of a word, with "…". Never mid-word: a card cut there reads to the
 * model as a broken instruction.
 */
export const cutText = (value, max) => {
  const whole = typeof value === "string" ? value.trim() : "";
  if (whole.length <= max) return whole;
  const cut = whole.slice(0, max + 1);
  const sentence = Math.max(...[". ", ".\n", "! ", "? ", "\n"].map((mark) => cut.lastIndexOf(mark)));
  if (sentence > max * 0.6) return cut.slice(0, sentence + 1).trim();
  const word = cut.lastIndexOf(" ");
  return `${cut.slice(0, word > 0 ? word : max).replace(/[\s,;:]+$/u, "")}…`;
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

/** `value` as a record: itself, or what a JSON text of one holds (an Engine may hand a card's data over as text). */
const recordOf = (value) => {
  if (isRecord(value)) return value;
  if (typeof value !== "string" || !value.trim().startsWith("{")) return null;
  try {
    const parsed = JSON.parse(value);
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

/**
 * A character's card fields, from whatever shape the Engine's record holds: its data as a record or as
 * JSON text, a V2 card's fields one level further in, or the fields on the record itself. `fallbackName`
 * is who the game says they are, for a card that gives no name.
 */
export function characterCard(record, fallbackName = "") {
  const data = recordOf(record?.data) ?? (isRecord(record) ? record : {});
  const inner = recordOf(data.data) ?? data; // a V2 card keeps them under data
  const extensions = isRecord(inner.extensions) ? inner.extensions : {};
  return {
    name: text(inner.name, MAX.name) || text(record?.name, MAX.name) || text(fallbackName, MAX.name) || "Someone",
    description: block(inner.description, MAX.card),
    personality: block(inner.personality, MAX.card),
    scenario: block(inner.scenario, MAX.card),
    examples: block(inner.mes_example, MAX.card),
    appearance: block(extensions.appearance ?? inner.appearance, MAX.appearance),
  };
}

/** A persona's fields; `worn` is what Quartermaster's sheet says they have on (the client's inventory.js). */
export function personaCard(record, fallbackName, worn, sheet) {
  const data = recordOf(record?.data) ?? (isRecord(record) ? record : {});
  return {
    name: text(data.name, MAX.name) || fallbackName || "The traveller",
    description: block(data.description, MAX.card),
    personality: block(data.personality, MAX.card),
    appearance: block(data.appearance, MAX.appearance),
    worn: text(worn, MAX.worn) ? `Wearing now: ${text(worn, MAX.worn)}` : "",
    // Their character sheet, as the client has it in words (sheet.js: only what the player switched on).
    sheet: text(sheet, 1500) ? `Their stats now: ${text(sheet, 1500)}` : "",
  };
}

/**
 * The messages for Quartermaster's tracker, with Wanderworld's own model call: its prompt (`template`), the
 * sheet as it shows it (`context`, which the prompt calls <agent_runtime_context>), and what was just told.
 */
/** What the model that stocks a shop is told to do (the client keeps what it answers as that shop's shelves). */
export const STOCK_INSTRUCTION = `You stock the shelves of a shop in a roleplay world. Write what it has for sale now: 6 to 10 things that fit this world's setting and the kind of shop it is. A potion shop in a fantasy town sells potions; a general store in a wasteland sells what a wasteland store would. Use the world's own words for things.

Each thing has a name, one short sentence of description, a price as a whole number of the world's money, and how many are on the shelf (1 to 5). Keep prices in line with the usual prices given.

A description may end with a block in square brackets that says what the thing does, so the game can read it. Only what is inside the brackets is read, and only these forms:
"+N HP when eaten", "+N HP when drunk", "+N HP when used", "+N Mana when drunk", "+N AC", "XdY damage" for a weapon (a kind may go before the word damage: slashing, piercing, bludgeoning), "+N gathering" for a tool.
Like: "A red draught, warm to the hand. [+15 HP when drunk]"
Most things need no block.

Answer with JSON only, nothing before or after it:
{"stock":[{"name":"...","description":"...","price":0,"quantity":1}]}`;

/** What the model that writes what's said in a fight is told (the game rolls everything; this is only words). */
export const COMBAT_LINE_INSTRUCTION = `You write one thing said or done in a fight in a roleplay world, by one fighter, for one moment of it. A person or anything that talks says something: a taunt, a threat, a curse, a battle cry, a plea, a shout to a friend. An animal or a monster that doesn't talk makes a sound or does something: write that as what it does, starting with a verb ("bares its teeth and growls").

Keep it to one short line, under 15 words, in keeping with who is speaking, the moment and the world. No name before it, no quotation marks, and nothing about dice or numbers. Nothing graphic.

Answer with JSON only, nothing before or after it:
{"line":"..."}`;

/** The messages for one thing said in a fight. */
export function combatLineMessages({ worldName, setting, speaker, talks, moment, foe, recent }) {
  return [
    { role: "system", content: COMBAT_LINE_INSTRUCTION },
    {
      role: "user",
      content: [
        `The world: ${([worldName, setting].filter(Boolean).join(": ") || "a small town and the country round it").replace(/[.\s]+$/u, "")}.`,
        `Speaking: ${speaker}${talks ? "" : " (it doesn't talk: write what it does)"}.`,
        foe && `Fighting: ${foe}.`,
        `The moment: ${moment}.`,
        recent && `What just happened:\n${recent}`,
      ]
        .filter(Boolean)
        .join("\n"),
    },
  ];
}

/** A line the model gave, checked: one line, its quotation marks off; "" when there's none. */
export const checkCombatLine = (data) =>
  text(String(data?.line ?? "").split("\n")[0], 160)
    .replace(/^["\u201c']+|["\u201d']+$/gu, "")
    .trim();

/** What the model that chooses a creature's move is told. With `talk`, it gives the line it says too. */
export const combatMoveInstruction = (talk) => `You decide what one fighter does on its turn in a fight by turns, in a roleplay world. You're told what it is, how it stands, whom it's fighting, what has just happened, and the moves it can make now, each with an id. Choose the one move that fits what it is and the moment: an animal fights as an animal does and runs when it's badly hurt, a coward gives up sooner, a brute closes in, one who shoots or casts keeps its distance, and a hurt caster may mend itself. The game rolls every attack and save: you only choose.${
  talk
    ? ` Also give one short thing it says as it moves (under 15 words, no quotation marks), or for an animal or a monster that doesn't talk, what it does, starting with a verb.`
    : ""
}

Answer with JSON only, nothing before or after it:
{"move":"<one of the ids>"${talk ? ',"line":"..."' : ""}}`;

/** The messages for choosing one creature's move. `options`: [{ id, says }]. */
export function combatMoveMessages({ worldName, setting, creature, talks, state, foe, options, recent, talk }) {
  return [
    { role: "system", content: combatMoveInstruction(talk) },
    {
      role: "user",
      content: [
        `The world: ${([worldName, setting].filter(Boolean).join(": ") || "a small town and the country round it").replace(/[.\s]+$/u, "")}.`,
        `The fighter: ${creature}${talk && !talks ? " (it doesn't talk)" : ""}. ${state}`,
        `Fighting: ${foe}.`,
        recent && `What just happened:\n${recent}`,
        `Its moves now:\n${options.map((option) => `- ${option.id}: ${option.says}`).join("\n")}`,
      ]
        .filter(Boolean)
        .join("\n"),
    },
  ];
}

/** The model's choice, checked against the ids it was given: { move ("" for none it was offered), line }. */
export function checkCombatMove(data, ids) {
  const move = text(data?.move, 80);
  return { move: ids.includes(move) ? move : "", line: checkCombatLine(data) };
}

/** The messages for stocking one shop. */
export function vendorStockMessages({ worldName, setting, shop, kinds, currency, usual, guidance }) {
  return [
    { role: "system", content: STOCK_INSTRUCTION },
    {
      role: "user",
      content: [
        `The world: ${([worldName, setting].filter(Boolean).join(": ") || "a small town and the country round it").replace(/[.\s]+$/u, "")}.`,
        `The shop: ${shop}. Its trade: ${kinds}.`,
        guidance && `What it should stock: ${guidance}`,
        `The money is called ${currency}.`,
        usual && `Usual prices here: ${usual}.`,
      ]
        .filter(Boolean)
        .join("\n"),
    },
  ];
}

/** The model's shelves, checked: [{ name, description, price, quantity }], twelve things at most, none twice. */
export function checkStock(data) {
  const seen = new Set();
  return (Array.isArray(data?.stock) ? data.stock : [])
    .filter(isRecord)
    .map((item) => ({
      name: text(item.name, 60),
      description: text(item.description, 200),
      price: Number.isFinite(item.price) ? Math.max(1, Math.min(9999, Math.round(item.price))) : 0,
      quantity: Number.isFinite(item.quantity) ? Math.max(1, Math.min(9, Math.round(item.quantity))) : 1,
    }))
    .filter((item) => item.name && item.price > 0 && !seen.has(item.name.toLowerCase()) && seen.add(item.name.toLowerCase()))
    .slice(0, 12);
}

// ── Quests (the client's quests.js checks every answer against the world before it's offered) ──

const QUEST_STAGE_SHAPE = `{"verb":"talk|go|bring|gather|defeat|deep|rescue|region","target":"<a name from the lists>","count":<a whole number, for bring, gather and defeat>,"item":"<for bring: an item from the list>","near":"<for defeat: a place out in the country from the list>","text":"<what the player is to do, one short sentence>"}`;
export const QUEST_INSTRUCTION = `You write one quest for a roleplay game set in a small world. The game checks and runs it, so it must only use what's listed: every target is a name copied exactly from one of the lists you're given, and nothing else.

What each stage can be (its verb):
- talk: talk to a person (target: a person).
- go: go to a place (target: a place).
- bring: bring some of an item to a person (target: the person; item: from the items; count).
- gather: find some of an item (target: the item; count).
- defeat: beat some creatures near a place out in the country (target: the creature; near: a country place; count, 1 to 4).
- deep: go down into a cave (target: a cave).
- rescue: free a captive held in a cave (target: the cave; give the captive's first name as "captive").
- region: travel to a region (target: one of the regions, as listed).

Two to four stages. Make it read like this world and the person asking, with a reason and, now and then, a twist (they want it kept quiet, there may be more than they said, it's for someone they love). Don't repeat what you're told to avoid. The game decides the reward and whether each stage is done, so don't promise particular things.

Answer with JSON only, nothing before or after it:
{"title":"<a few words>","intro":"<what the person asking says, one to three sentences>","archetype":"hunt|supply|word|investigate|delve|rescue|scout","motive":"<why, a few words>","complication":"<the twist, or empty>","captive":"<a first name, only with a rescue stage>","stages":[${QUEST_STAGE_SHAPE}],"done":"<what's said or seen when it's done, one sentence>"}`;

const listed = (label, list) => (list.length ? `${label}: ${list.join("; ")}.` : "");

/** The messages for writing one quest: the world's names, a few of each, and what to avoid. */
export function questWriteMessages({ worldName, setting, giver, premise, avoid, lists }) {
  return [
    { role: "system", content: QUEST_INSTRUCTION },
    {
      role: "user",
      content: [
        `The world: ${([worldName, setting].filter(Boolean).join(": ") || "a small town and the country round it").replace(/[.\s]+$/u, "")}.`,
        giver ? `Who's asking: ${giver}.` : "It's posted on the town's noticeboard by someone in town (use one of the people).",
        premise && `What it's about (from the world's lore): ${premise}`,
        avoid.length && `Recent quests, so don't repeat them: ${avoid.join(" | ")}.`,
        listed("People", lists.people),
        listed("Places", lists.places),
        listed("Places out in the country", lists.wilds),
        listed("Creatures", lists.creatures),
        listed("Items", lists.items),
        listed("Caves", lists.caves),
        listed("Regions", lists.regions),
      ]
        .filter(Boolean)
        .join("\n"),
    },
  ];
}

export const QUEST_ADAPT_INSTRUCTION = `A quest in a roleplay game has gone wrong in a way it had no plan for. Decide what happens next: either one new stage that carries the quest on, or a line that ends it. Use only the names listed.

Answer with JSON only, nothing before or after it, one of:
{"stage":${QUEST_STAGE_SHAPE},"line":"<what the player hears, one sentence>"}
{"end":"<why it ends, one sentence>"}`;

/** The messages for the adapt call: the quest, what went wrong, and what there is now. */
export function questAdaptMessages({ quest, happened, lists }) {
  return [
    { role: "system", content: QUEST_ADAPT_INSTRUCTION },
    {
      role: "user",
      content: [
        `The quest: ${quest}`,
        `What went wrong: ${happened}`,
        listed("People", lists.people),
        listed("Places", lists.places),
        listed("Items", lists.items),
        listed("Caves", lists.caves),
      ]
        .filter(Boolean)
        .join("\n"),
    },
  ];
}

/** The lists of names a quest call may use, from the client, each cut short. */
function questLists(raw) {
  const list = (value, most) =>
    (Array.isArray(value) ? value : [])
      .map((entry) => text(entry, 120))
      .filter(Boolean)
      .slice(0, most);
  const lists = isRecord(raw) ? raw : {};
  return {
    people: list(lists.people, 12),
    places: list(lists.places, 12),
    wilds: list(lists.wilds, 6),
    creatures: list(lists.creatures, 8),
    items: list(lists.items, 8),
    caves: list(lists.caves, 4),
    regions: list(lists.regions, 4),
  };
}

/** What the model wrote, cut to its shape (the client checks what it names): null when there are no stages. */
export function checkQuestWords(data) {
  if (!isRecord(data)) return null;
  const stages = (Array.isArray(data.stages) ? data.stages : []).filter(isRecord).slice(0, 6);
  if (!stages.length && !isRecord(data.stage) && !text(data.end, 300)) return null;
  const stage = (raw) => ({
    verb: text(raw.verb, 20).toLowerCase(),
    target: text(raw.target, 120),
    count: Number.isFinite(raw.count) ? Math.round(raw.count) : 1,
    item: text(raw.item, 80),
    near: text(raw.near, 120),
    text: text(raw.text, 240),
  });
  return {
    title: text(data.title, 80),
    intro: text(data.intro, 600),
    archetype: text(data.archetype, 20),
    motive: text(data.motive, 120),
    complication: text(data.complication, 120),
    captive: text(data.captive, 40),
    done: text(data.done, 400),
    stages: stages.map(stage),
    ...(isRecord(data.stage) ? { stage: stage(data.stage), line: text(data.line, 300) } : {}),
    ...(text(data.end, 300) ? { end: text(data.end, 300) } : {}),
  };
}

/** What the model that keeps a character sheet is told to do (the client's sheet.js applies what it answers). */
const SHEET_RULES = `Change a stat only when the text clearly says or shows it: damage taken, healing, mana or another resource spent, a lasting gain or loss. Do not change anything for what is only talked about, intended, feared or possible. Never use a stat that isn't listed, and never go past a resource's most.

Experience ("xp") is for something accomplished: a fight won, a task finished, something found or learned. 5 to 50 points by how much it mattered. Most messages earn none.`;
const SHEET_SHAPE = `{"changes":[{"stat":"<its name exactly as listed>","by":<a whole number, negative to lower it>,"reason":"<a few words>"}],"xp":<a whole number, 0 for none>}`;
export const SHEET_INSTRUCTION = `You keep a character's stat sheet for a roleplay game. Read what just happened and decide whether any of the listed stats changed because of it.

${SHEET_RULES}

Answer with JSON only, nothing before or after it:
${SHEET_SHAPE}
Use "to" in place of "by" to set a value outright. An empty list with 0 xp is the usual answer.`;
/** The key the sheet's part of a joint answer comes under (taken out before Quartermaster sees the rest). */
export const SHEET_KEY = "wanderworldSheet";
/** The sheet's reading, added to the inventory tracker's instruction so one call does both. */
const sheetAlso = (sheet) => `

## One more thing in the same answer: the character's stat sheet
From the same message, also decide whether any of the character's stats changed. Their sheet now:
${sheet}

${SHEET_RULES}

Put this in the same JSON object you answer with, as one more top-level key, "${SHEET_KEY}", beside the others and changing nothing else about your answer:
"${SHEET_KEY}": ${SHEET_SHAPE}
Use "to" in place of "by" to set a value outright. An empty list with 0 xp is the usual value.`;

/** The messages for one reading of what was told against a sheet. */
export function sheetTrackMessages({ name, sheet, told }) {
  return [
    { role: "system", content: SHEET_INSTRUCTION },
    { role: "user", content: `The character is ${name}. Their sheet now:\n${sheet}\n\nWhat just happened:\n${told}` },
  ];
}

/** The model's answer about a sheet, checked: { changes: [{ stat, by | to, reason }], xp }. */
export function checkSheetChanges(data) {
  const number = (value, most) => (Number.isFinite(value) ? Math.max(-most, Math.min(most, Math.round(value))) : null);
  const changes = (Array.isArray(data?.changes) ? data.changes : [])
    .filter(isRecord)
    .slice(0, 12)
    .map((change) => {
      const by = number(change.by, 9999);
      const to = number(change.to, 999999);
      return {
        stat: text(change.stat, 60),
        ...(to !== null ? { to } : by !== null ? { by } : {}),
        reason: text(change.reason, 120),
      };
    })
    .filter((change) => change.stat && ("to" in change || ("by" in change && change.by !== 0)));
  return { changes, xp: Math.max(0, number(data?.xp, 10000) ?? 0) };
}

/** A joint answer taken apart: Quartermaster's `data` without the sheet's key, and the sheet's part checked. */
export function splitSheet(data) {
  if (!isRecord(data)) return { data, sheet: checkSheetChanges(null) };
  const { [SHEET_KEY]: sheet, ...rest } = data;
  return { data: rest, sheet: checkSheetChanges(sheet) };
}

/**
 * How item stats are written, added to the inventory tracker's instruction (Settings → Inventory → Items): so
 * a new item it adds may come with some, and one that has them already is never touched.
 */
export const ITEM_STATS = `

## One more thing: item stats in descriptions
An item's description may end with a block in square brackets that sets what the item does in the game. Only what is inside the brackets is read; the words before it are free.
What a block can say, separated by commas:
- A weapon: "1d8 slashing damage" (dice, then a kind: slashing, piercing, bludgeoning, fire, cold and the like), "+1 to attack", "Range 24" (it shoots; metres), and traits: "finesse", "light", "two-handed", "versatile 1d10" (its dice in both hands), "reach", "thrown 6" (metres), "heavy".
- Something worn: "+1 AC", "+2 Strength" (any stat, by its name), "+5 Max HP", "+1 damage".
- Something used up: "+15 HP", "+10 Mana", "+2d4+2 HP", "+1" of any stat for good, "+5 Max HP".
- A tool: "+2 gathering".
Like: "A notched blade with a pale blue glow. [1d8 slashing damage, +1 to attack]"

Rules for the block:
1. An item whose description already has a block keeps that block exactly, character for character. Never change its numbers, reword it, move it, remove it or add a second one, whatever else you do with the item.
2. When you add an item that is new (found, given, bought, made, taken), you may end its description with a block that fits what it is. Keep the numbers modest and ordinary for the thing: a dagger 1d4, a sword 1d8, a great weapon 2d6, a bow 1d6 or 1d8 with Range 24; a shield +2 AC, a helm +1 AC; a healing draught +2d4+2 HP; food +1 to +5 HP.
3. Clothing, trinkets, keys, letters and the like usually need no block. Leave it out rather than invent one.
4. Never add a block to an item that is already carried and has none.`;

export function inventoryMessages({ template, context, name, told, sheet = "", itemStats = false }) {
  const instruction = itemStats ? template + ITEM_STATS : template;
  return [
    { role: "system", content: sheet ? instruction + sheetAlso(sheet) : instruction },
    {
      role: "user",
      content: `<agent_runtime_context>\n${context}\n</agent_runtime_context>\n\nThe persona is ${name}. The latest message:\n${told}`,
    },
  ];
}

const section = (title, body) => (body ? `## ${title}\n${body}` : "");
/** A request's messages as the console shows them when debugging: each under its role. */
export const debugMessages = (messages) =>
  messages.map((message) => `── ${message.role} ──\n${message.content}`).join("\n\n");
const replaceNames = (value, character, persona) =>
  value.replace(/\{\{char\}\}/giu, character).replace(/\{\{user\}\}/giu, persona);
/** A card's words for a prompt: its parts joined, {{char}} and {{user}} as the names, cut to `max` cleanly. */
export const cardWords = (parts, max, character, persona, between = " ") =>
  cutText(replaceNames(parts.filter(Boolean).join(between), character, persona), max);

/**
 * The messages for one conversation reply. `input` is the checked request: character and persona cards,
 * place, time, relationship, world setting, lore texts, history ([{ from: "player" | "character", text }])
 * and the player's new line (empty when they've just walked up).
 */
/** A model's rewritten picture prompt, without its thinking, its quotes, or the chat handed back at the end. */
export const pictureWords = (content) =>
  block(
    String(content ?? "")
      .replace(/<think>[\s\S]*?<\/think>/giu, "")
      .replace(/<chat>[\s\S]*?(?:<\/chat>|$)/giu, "")
      .replace(/<\/?facts>/giu, "")
      .replace(/\n\s*(?:#+\s*|\*\*)?the chat\b[\s\S]*$/iu, ""),
    3000,
  ).replace(/^["'\s]+|["'\s]+$/gu, "");

export function talkMessages(input) {
  const { character, persona } = input;
  const [fewest, most] = LENGTHS[input.length] ?? LENGTHS.medium;
  const style = TALK_STYLES[input.style] ?? TALK_STYLES.natural;
  const card = (value) => replaceNames(value, character.name, persona.name);
  // In order of how seldom it changes, so a provider's prompt cache can reuse all that comes before the
  // first thing that did: who they are and the world (the same all conversation, and the next), the
  // lore of the place, then what was said. What changes with every line (the hour, who's near, what
  // they remember, what the player has on) goes last: with `cache`, in a <context> block on the newest
  // message, after the history; without, at the end of the system message as it always was.
  const cached = input.cache !== false;
  const steady = [
    `You are ${character.name}, a person living in the world of Wanderworld, talking face to face with ${persona.name}.`,
    `Reply as ${character.name} only: what they say out loud, ${fewest} to ${most} sentences, with at most one short action in *asterisks*. Never write ${persona.name}'s words, thoughts or actions, never narrate, and never mention being an AI or a game.`,
    style,
    cached &&
      `The newest message begins with a <context> block: where and when this is, who is near, how ${character.name} feels about ${persona.name} and their memories. Nobody says it aloud: it is what is true right now. Use it, and never mention or quote it.`,
    section(`${character.name}`, [card(character.description), card(character.personality)].filter(Boolean).join("\n\n")),
    section("Their situation", card(character.scenario)),
    section(`How ${character.name} looks`, card(cutWords(character.appearance, MAX.card))),
    section(`How ${character.name} talks (examples)`, card(character.examples)),
    section(`${persona.name}, who they're talking to`, [persona.description, persona.personality, cutWords(persona.appearance, MAX.card)].filter(Boolean).join("\n\n")),
    section("The world", input.setting),
    section("What they know (lore)", input.lore.join("\n\n")),
  ];
  const now = [
    section(
      "Right now",
      [
        input.place && `Where: ${input.place}.`,
        input.time && `When: ${input.time}.`,
        input.weather && `Weather: ${input.weather}.`,
        input.nearby && `Also nearby: ${input.nearby}.`,
        (persona.worn || persona.sheet) &&
          `${persona.name}, as they are now. ${[persona.worn, persona.sheet].filter(Boolean).join(" ")}`,
        // Travelling together: they came here side by side, so it's no meeting.
        input.inParty &&
          `${character.name} is travelling with ${persona.name}, as one of their party${input.companions ? ` (with ${input.companions})` : ""}. They came here together and have been side by side the whole way, so this is no meeting and no surprise: ${character.name} doesn't greet ${persona.name} as if they'd just turned up, or ask what brings them here.`,
      ]
        .filter(Boolean)
        .join("\n"),
    ),
    // Strangers: they are still who they are, but neither acts as if they'd met.
    section(
      "Who knows whom",
      [
        input.knowsYou === false &&
          `${character.name} doesn't know ${persona.name}: not their name, nor anything about them. To ${character.name} they're a stranger, till they say who they are.`,
        input.knowsThem === false &&
          `${persona.name} doesn't know ${character.name}'s name yet. ${character.name} can give it or not, as they would with a stranger.`,
      ]
        .filter(Boolean)
        .join("\n"),
    ),
    section(`How ${character.name} feels about ${persona.name}`, input.relationship),
    section(
      `What ${character.name} remembers`,
      (input.memories ?? []).length
        ? `Only what ${character.name} saw, heard or was told themselves. They know nothing of what happened elsewhere or was said to others.\n${input.memories.map((line) => `- ${line}`).join("\n")}`
        : "",
    ),
  ]
    .filter(Boolean)
    .join("\n\n");
  const system = [...steady, !cached && now].filter(Boolean).join("\n\n");
  const messages = [{ role: "system", content: system }];
  for (const entry of input.history) {
    messages.push({ role: entry.from === "character" ? "assistant" : "user", content: entry.text });
  }
  const line =
    input.line ||
    (input.inParty ? `*${persona.name} turns to ${character.name}, beside them.*` : `*${persona.name} walks up to ${character.name}.*`);
  messages.push({ role: "user", content: cached && now ? `<context>\n${now}\n</context>\n\n${line}` : line });
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
 * What the player's persona and the chosen characters' cards say, for inventing the people round them
 * (their family first): [{ name, player, text }], the persona first. Nobody without anything written.
 */
async function writersCards(resources, body) {
  const personaId = idOf(body.personaId);
  const [personaRecord] = personaId ? await resources.listPersonas([personaId]) : [];
  const wanted = ids(body.characterIds, 20);
  const records = wanted.length ? await resources.listCharacters(wanted) : [];
  const words = (card, max) => cutWords([card.description, card.personality].filter(Boolean).join(" "), max);
  return [
    personaRecord && { ...personaCard(personaRecord, text(body.persona, MAX.name)), player: true },
    ...records.map((record) => characterCard(record)),
  ]
    .filter(Boolean)
    .map((card) => ({ name: card.name, player: !!card.player, text: words(card, MAX.card) }))
    .filter((card) => card.text);
}

// ── The AI assistant ─────────────────────────────────────────────────────────
/** The kinds of relationship an edit may set (relationships.js KINDS), and "none" to end one. */
const ASSISTANT_KINDS = ["acquaintance", "friend", "romance", "partner", "family", "colleague", "mentor", "rival", "enemy", "fear", "none"];
const ASSISTANT_MAX_EDITS = 60;
/** The parts of a world that may be left out of a message to the assistant (assistant-context.js PARTS). */
const ASSISTANT_PARTS = ["people", "relations", "places", "days", "here", "ties", "lore", "board", "help", "ages", "chat", "recaps", "memories"];
const ASSISTANT_PART_WORDS = {
  people: "everyone in detail (only names, homes and work are listed for most)",
  relations: "relationships",
  places: "the list of places",
  days: "people's days and closing hours",
  here: "where the player is and the lore active there",
  ties: "what lore is tied to",
  lore: "this world's own lore",
  board: "the noticeboard",
  help: "how Wanderworld works",
  ages: "ages",
  chat: "the recent chat",
  recaps: "scene recaps",
  memories: "what people remember",
};
/** How someone may act toward the player (main.js STANCE_WARMTH), and "none" for nothing special. */
const ASSISTANT_STANCES = ["rude", "aggressive", "attacks", "afraid", "avoids", "none"];

/** What the assistant is told: who it is, and the one format its changes come in. */
export const ASSISTANT_INSTRUCTION = [
  "You are the assistant for a player's world in Wanderworld, a small walkable 3D world of their characters, for roleplay. You talk with the player about their world: its people, places, lore, and how Wanderworld works. Answer plainly and briefly, in ordinary sentences, like a helpful chat assistant. If you don't know, say so.",
  "You can also propose changes to this world when the player asks for one. Only then, and only what they asked for: put ONE block at the very end of your answer, fenced exactly like this, holding one JSON object:",
  '```wanderworld\n{"edits": [ ... ]}\n```',
  `Each edit is one of these (people by their names exactly as listed under "People"; places by their numbered name, like home3 or tavern1, from "Places"). Edits are made in order, so a later one may name someone an earlier one added.
People and how they stand:
- {"do": "relate", "from": "Jake", "to": "Sarah", "kind": "partner", "role": "husband", "backRole": "wife", "level": 80, "both": true}: how "from" sees "to". "kind" is one of ${ASSISTANT_KINDS.join(", ")} ("none" ends it). "role" is what "from" is to "to" (optional: husband, sister, mentor…), "backRole" what "to" is to "from". "level" is 0 to 100 (how strong; optional). "both": true sets it both ways. The player is "player".
- {"do": "home", "person": "Jake", "place": "home3"} or {"do": "home", "person": "Jake", "with": "Sarah"}: where they live ("with": in the same home as someone). "place": "none" for no home.
- {"do": "work", "person": "Jake", "place": "smithy1", "owner": false}: where they work. "place": "none" for no work.
- {"do": "set", "person": "Mira", "body": "female", "voice": "gruff", "aggression": 20, "sociability": 80, "stance": "rude", "knowsYou": true, "known": true}: give only what changes. "body" is male, female, custom (a third gender the player names: see "Genders", when it is there) or auto. "voice" is one of ${Object.keys(TALK_STYLES).join(", ")}, or none. "aggression" (passive 0 to aggressive 100) and "sociability" (shy 0 to outgoing 100). "stance" is how they act toward the player whatever they feel: ${ASSISTANT_STANCES.join(", ")}. "knowsYou": they know the player's name; "known": the player knows theirs.
- {"do": "day", "person": "Mira", "entries": [{"from": 8, "to": 12, "activity": "work", "place": ""}, {"from": 18, "to": 22, "activity": "visit", "place": "tavern1"}]}: their day, replacing the one they have. Hours 0 to 24 (halves allowed; "to" below "from" runs past midnight). "activity" is one of ${ACTIVITIES.join(", ")}; "place" is empty for their own home or work and for a walk. Hours left out are theirs to spend as usual. {"do": "day", "person": "Mira", "usual": true} gives them back a usual day.
- {"do": "add_person", "name": "Wren Tolley", "body": "female", "description": "...", "personality": "...", "appearance": "...", "home": "home4", "work": "smithy1", "owner": false}: someone new, who lives in this world only. "description" 60 to 120 words (who they are, their age and trade, their history here, what they want), "personality" 20 to 40 words with how they talk, "appearance" 20 to 40 words. "with": "Oswin" in place of "home" to live with someone. Follow it with relate edits for who they are to others.
- {"do": "remove_person", "person": "Wren Tolley"}: for people marked "invented" only. They and everything about them go.
- {"do": "faction", "name": "The Thieves' Guild", "add": ["Jake", "Fen"], "remove": []}: a group of people, made if there is none by that name. {"do": "faction", "name": "...", "delete": true} ends it.
Lore:
- {"do": "lore", "about": "Jason", "text": "..."}: this world's own lore about a person, a place (its numbered name), a faction (its name; every member then knows it) or "world" (the whole world). It is used when they talk, in moments and scenes. As long as it needs to be.
- {"do": "card", "person": "Oswin", "description": "...", "personality": "...", "appearance": "..."}: for people marked "invented" only; give only the parts to change.
Places and the world:
- {"do": "rename", "place": "tavern1", "name": "The Drowned Bell"}: a place's name (its sign too). An empty "name" gives back its first one.
- {"do": "hours", "place": "tavern1", "from": 0, "to": 6}: when a place is CLOSED, from and to in hours (closed after midnight until six). {"do": "hours", "place": "tavern1", "open": true}: never closed.
- {"do": "group", "name": "The docks", "add": ["tavern1", "home3"], "remove": []}: a group of places (lore tied to a group is active in all of them), made if there is none by that name. {"do": "group", "name": "...", "delete": true} ends it.
- {"do": "world", "setting": "...", "look": "...", "ageMin": 21, "ageMax": "none"}: give only what changes. "setting": the world in a few words (at most 600 characters). "look": how it looks in pictures, a few words. "ageMin" and "ageMax": the usual ages of people the AI makes, a number from 1, or "none".
- {"do": "notice", "text": "...", "by": "the reeve"}: pins a note to the noticeboard.
- {"do": "errand", "person": "Mira", "text": "Take this letter to Mira.", "done": "Mira reads it twice and thanks you."}: an errand for the player, to go to that person; "done" is told when they reach them. They can have one at a time. {"do": "errand", "cancel": true} drops the one they have.
- {"do": "unpin", "notes": ["note1", "note3"]}: takes notes down from the noticeboard, by their numbers there. {"do": "unpin", "all": true} takes them all down.
What people remember (each person's own: only what they saw, heard or were told; their memories are numbered under "What people remember", m1 the oldest):
- {"do": "memory", "person": "Mira", "memory": "m3", "text": "..."}: rewords that memory (at most 200 characters, plain words in the past tense, like the others). {"do": "memory", "person": "Mira", "memory": "m3", "remove": true} deletes it. {"do": "memory", "person": "Mira", "memory": "m3", "pin": true} pins it (locked, never pushed out; "pin": false lets it go again). {"do": "memory", "person": "Mira", "add": "...", "as": "m3"} gives them a new lasting memory, dated like the memory named in "as" (left out: today). One memory to an edit.
A scene:
- {"do": "scene", "place": "tavern1", "people": ["Brin", "Cole"], "premise": "..."}: a roleplay scene to play in the Engine, only when the player asks for a scene: where it is, who is in it (one to four of their own characters, not invented people), and how it opens in a sentence or two. It starts when they confirm. One at most, and nothing else changes with it.`,
  `Lore and card text REPLACES what is there now (shown to you as "lore", and for invented people "about"), so what you write is the whole of it, rewritten: never a summary, never only the new part. Keep every detail that is there, in the same voice and at no less than the same length and level of detail, and weave the change in where it belongs; change or drop only what the request contradicts. A small request ("make Jake a sorcerer") changes little: the lore stays as rich as it was, with his sorcery worked through it. A detailed request may add as much as it asks for. When one of the player's own characters has no lore here yet, their card ("about") still stands by itself: write what is new or different about them in this world, as fully as the request deserves, without repeating the card.`,
  `Why lore is or isn't active: an entry is active where the player stands when it is tied to that place, to a place that one sits in, to a group either belongs to, to someone they are talking or travelling with, to the player, or to the whole world. "Where the player is" lists what is active now and what it comes from; "What lore is tied to" lists every tie. Explain from those, and say what would have to change (the Journal's Places tab ties lore to places by hand).`,
  "Rules: nothing changes until the player has read your proposal and confirmed it (and they can undo it afterwards), so say what you propose, not that it is done. You propose changes only through such edits, and only to this world. You cannot change the player's character cards, personas or lorebooks in the Engine, nor Wanderworld's settings in the Menu, the map or the buildings: say so, and say where the player can (Menu → Settings, Journal). Never describe a change you put no edit for. Stay within what was asked: no extra people, lore or relationships the player didn't ask for. To make two people a couple who live together: one relate edit with both, and a home edit. With no change asked for, write no block at all.",
].join("\n\n");

/**
 * Reads the assistant's answer: its words, and the changes it asks for, each checked (a trust boundary:
 * the model's text is no better than anyone's). Returns { reply, edits, problem }: a block that isn't
 * JSON, or isn't the format, changes nothing and says so in `problem`; an edit that doesn't hold up is
 * left out and counted there.
 */
export function readAssistant(raw) {
  const answer = String(raw ?? "").replace(/<think>[\s\S]*?<\/think>/giu, "");
  const fence = /```wanderworld\s*([\s\S]*?)```/giu;
  const blocks = [...answer.matchAll(fence)].map((match) => match[1].trim());
  // An unclosed block (the answer was cut short) is taken out of the words too.
  const reply = block(answer.replace(fence, "").replace(/```wanderworld[\s\S]*$/iu, ""), 4000);
  if (/```wanderworld/iu.test(answer) && !blocks.length)
    return { reply, edits: [], problem: "The assistant's changes were cut short, so nothing was changed. Ask again." };
  if (!blocks.length) return { reply, edits: [], problem: "" };
  const nothing = (why) => ({ reply, edits: [], problem: `${why}, so nothing was changed. Ask again, or put it another way.` });
  let parsed;
  try {
    parsed = JSON.parse(blocks.at(-1));
  } catch {
    return nothing("The assistant's changes couldn't be read (they weren't valid JSON)");
  }
  // Looking something up (a part that was left out, lore, a person, their memories): nothing else is
  // read from such an answer.
  if (isRecord(parsed) && !Array.isArray(parsed.edits)) {
    const asked = (value) => [...new Set((Array.isArray(value) ? value : []).map((words) => text(words, 80)).filter(Boolean))].slice(0, 6);
    const need = asked(parsed.need).filter((part) => ASSISTANT_PARTS.includes(part));
    const look = { lore: asked(parsed.lore), people: asked(parsed.people), memories: asked(parsed.memories) };
    const looking = look.lore.length + look.people.length + look.memories.length > 0;
    if (need.length || looking) return { reply, edits: [], problem: "", ...(need.length ? { need } : {}), ...(looking ? { look } : {}) };
  }
  const list = Array.isArray(parsed) ? parsed : isRecord(parsed) ? parsed.edits : null;
  if (!Array.isArray(list)) return nothing("The assistant's changes weren't in the format Wanderworld reads");
  const name = (value) => text(value, 80);
  const edits = [];
  let dropped = 0;
  for (const item of list.slice(0, ASSISTANT_MAX_EDITS)) {
    const made = isRecord(item) ? readAssistantEdit(item, name) : null;
    if (made) edits.push(made);
    else dropped++;
  }
  dropped += Math.max(0, list.length - ASSISTANT_MAX_EDITS);
  return {
    reply,
    edits,
    problem: dropped ? `${dropped} of the assistant's changes ${dropped === 1 ? "wasn't" : "weren't"} in a form Wanderworld reads and ${dropped === 1 ? "was" : "were"} left out.` : "",
  };
}

/** One edit, checked field by field: the edit as Wanderworld applies it, or null. */
function readAssistantEdit(item, name) {
  if (item.do === "relate") {
    const [from, to] = [name(item.from), name(item.to)];
    if (!from || !to || !ASSISTANT_KINDS.includes(item.kind)) return null;
    return {
      do: "relate",
      from,
      to,
      kind: item.kind,
      role: text(item.role, 30),
      backRole: text(item.backRole, 30),
      level: Number.isFinite(item.level) ? Math.max(0, Math.min(100, Math.round(item.level))) : null,
      both: item.both === true,
    };
  }
  if (item.do === "home" || item.do === "work") {
    const person = name(item.person);
    const [place, beside] = [text(item.place, 80), item.do === "home" ? name(item.with) : ""];
    if (!person || (!place && !beside)) return null;
    return { do: item.do, person, place, with: beside, owner: item.do === "work" && item.owner === true };
  }
  if (item.do === "lore") {
    const [about, words] = [name(item.about), block(item.text, MAX.loreText)];
    return about && words ? { do: "lore", about, text: words } : null;
  }
  if (item.do === "card") {
    const person = name(item.person);
    const parts = Object.fromEntries(
      [
        ["description", MAX.card],
        ["personality", MAX.card],
        ["appearance", MAX.card],
      ]
        .map(([part, max]) => [part, block(item[part], max)])
        .filter(([, words]) => words),
    );
    return person && Object.keys(parts).length ? { do: "card", person, ...parts } : null;
  }
  const names = (value) => (Array.isArray(value) ? value : []).map(name).filter(Boolean).slice(0, 30);
  const hour = (value) => (Number.isFinite(value) && value >= 0 && value <= 24 ? Math.round(value * 4) / 4 : null);
  const score = (value) => (Number.isFinite(value) ? Math.max(0, Math.min(100, Math.round(value))) : null);
  if (item.do === "set") {
    const person = name(item.person);
    const fields = {
      ...(["male", "female", "custom", "auto"].includes(item.body) ? { body: item.body } : {}),
      ...(item.voice === "none" || Object.hasOwn(TALK_STYLES, item.voice) ? { voice: item.voice === "none" ? "" : item.voice } : {}),
      ...(score(item.aggression) !== null ? { aggression: score(item.aggression) } : {}),
      ...(score(item.sociability) !== null ? { sociability: score(item.sociability) } : {}),
      ...(ASSISTANT_STANCES.includes(item.stance) ? { stance: item.stance === "none" ? "" : item.stance } : {}),
      ...(typeof item.knowsYou === "boolean" ? { knowsYou: item.knowsYou } : {}),
      ...(typeof item.known === "boolean" ? { known: item.known } : {}),
    };
    return person && Object.keys(fields).length ? { do: "set", person, ...fields } : null;
  }
  if (item.do === "day") {
    const person = name(item.person);
    if (!person) return null;
    if (item.usual === true) return { do: "day", person, entries: [] };
    const entries = (Array.isArray(item.entries) ? item.entries : [])
      .filter(isRecord)
      .slice(0, 12)
      .map((entry) => ({ from: hour(entry.from), to: hour(entry.to), activity: entry.activity, place: text(entry.place, 80) }))
      .filter((entry) => entry.from !== null && entry.to !== null && entry.from !== entry.to && ACTIVITIES.includes(entry.activity));
    return entries.length ? { do: "day", person, entries } : null;
  }
  if (item.do === "add_person") {
    const made = {
      do: "add_person",
      name: text(item.name, 60),
      body: ["male", "female", "custom"].includes(item.body) ? item.body : "",
      description: block(item.description, MAX.card),
      personality: block(item.personality, MAX.card),
      appearance: block(item.appearance, MAX.card),
      home: text(item.home, 80),
      with: name(item.with),
      work: text(item.work, 80),
      owner: item.owner === true,
    };
    return made.name && made.description ? made : null;
  }
  if (item.do === "remove_person") {
    const person = name(item.person);
    return person ? { do: "remove_person", person } : null;
  }
  if (item.do === "faction" || item.do === "group") {
    const title = text(item.name, 60);
    if (!title) return null;
    if (item.delete === true) return { do: item.do, name: title, delete: true, add: [], remove: [] };
    const [add, remove] = [names(item.add), names(item.remove)];
    return { do: item.do, name: title, delete: false, add, remove };
  }
  if (item.do === "rename") {
    const place = text(item.place, 80);
    return place && typeof item.name === "string" ? { do: "rename", place, name: text(item.name, 60) } : null;
  }
  if (item.do === "hours") {
    const place = text(item.place, 80);
    if (!place) return null;
    if (item.open === true) return { do: "hours", place, open: true };
    const [from, to] = [hour(item.from), hour(item.to)];
    return from !== null && to !== null && from !== to ? { do: "hours", place, open: false, from, to } : null;
  }
  if (item.do === "world") {
    const age = (value) => (value === "none" ? { value: null } : ageOf(value) !== null ? { value: ageOf(value) } : null);
    const fields = {
      ...(block(item.setting, 600) ? { setting: text(item.setting, 600) } : {}),
      ...(text(item.look, 200) ? { look: text(item.look, 200) } : {}),
      ...(age(item.ageMin) ? { ageMin: age(item.ageMin).value } : {}),
      ...(age(item.ageMax) ? { ageMax: age(item.ageMax).value } : {}),
    };
    return Object.keys(fields).length ? { do: "world", ...fields } : null;
  }
  if (item.do === "notice") {
    const words = text(item.text, 400);
    return words ? { do: "notice", text: words, by: text(item.by, 60) } : null;
  }
  if (item.do === "unpin") {
    if (item.all === true) return { do: "unpin", all: true, notes: [] };
    const notes = [
      ...new Set(
        (Array.isArray(item.notes) ? item.notes : [])
          .map((note) => Number(/^note(\d{1,2})$/iu.exec(String(note).trim())?.[1] ?? 0))
          .filter((number) => number >= 1 && number <= 40),
      ),
    ];
    return notes.length ? { do: "unpin", all: false, notes } : null;
  }
  if (item.do === "scene") {
    const [place, premise] = [text(item.place, 80), text(item.premise, 600)];
    const people = (Array.isArray(item.people) ? item.people : []).map(name).filter(Boolean).slice(0, 4);
    return premise && people.length ? { do: "scene", place, people, premise } : null;
  }
  if (item.do === "memory") {
    const person = name(item.person);
    const number = (value) => Number(/^m(\d{1,4})$/iu.exec(String(value ?? "").trim())?.[1] ?? 0);
    if (!person) return null;
    const added = text(item.add, 200);
    if (added) return { do: "memory", person, action: "add", memory: 0, as: number(item.as), text: added };
    const memory = number(item.memory);
    if (!memory) return null;
    if (item.remove === true) return { do: "memory", person, action: "remove", memory };
    if (typeof item.pin === "boolean") return { do: "memory", person, action: item.pin ? "pin" : "unpin", memory };
    const words = text(item.text, 200);
    return words ? { do: "memory", person, action: "reword", memory, text: words } : null;
  }
  if (item.do === "errand") {
    if (item.cancel === true) return { do: "errand", cancel: true };
    const [person, words] = [name(item.person), text(item.text, 400)];
    return person && words ? { do: "errand", person, text: words, done: text(item.done, 400) } : null;
  }
  return null;
}

/**
 * The messages for drafting "ww:" keywords for lorebook entries the player chose: their instructions for
 * it (the Help's own prompt), the places and people the keys may name, and those entries alone.
 */
export function keywordMessages(input) {
  const world = [
    section("The world", [input.worldName, input.setting].filter(Boolean).join(": ")),
    section("People here (a key may name one)", input.people.map((person) => person.name).join(", ")),
    section(
      "Places here (a key may name one by its number)",
      input.places.map((place) => `${place.slot}${place.name ? ` = ${place.name}` : ""}`).join("\n"),
    ),
    section("Groups of places", input.groups.join("\n")),
    section("Factions", input.factions.join("\n")),
  ]
    .filter(Boolean)
    .join("\n\n");
  const entries = input.bookEntries
    .map((entry, at) => `${at + 1}. ${entry.title}\nKeys now: ${entry.keys || "(none)"}\n${entry.content}`)
    .join("\n\n");
  return [
    {
      role: "system",
      content: `You help a player prepare lorebook entries for Wanderworld, a small walkable 3D world of their characters. Answer in plain text, entry by entry, with each entry's keys on one line, separated by commas, ready to copy. Use the numbered places and the names below where an entry is about one of them. You cannot change the lorebook yourself, and you write no edit block.\n\n# This world\n\n${world}`,
    },
    { role: "user", content: `${input.keywordPrompt}\n\n# The entries\n\n${entries}` },
  ];
}

/**
 * The messages for one turn with the assistant: what it's told, the world as it stands, and the chat.
 * The client sends only the parts of the world the message needs (assistant-context.js); `omitted` names
 * the ones left out, which the model may ask for unless this is already the second asking (`final`).
 *
 * For a provider's prompt cache (`cache`, unless false): the parts sent change with every message, so
 * only what never does (what it's told, the world's name and setting, who the player is) is in the
 * system message. The chat follows, and the world as it is now goes last, in a <context> block on the
 * newest message: everything before that block reads the same as it did a turn ago.
 */
export function assistantMessages(input) {
  const omitted = (input.omitted ?? []).filter((part) => ASSISTANT_PARTS.includes(part));
  const steady = [
    section("The world", [input.worldName, input.setting].filter(Boolean).join(": ")),
    input.persona && section("The player", input.persona),
  ];
  const world = [
    ...(input.cache === false ? steady : []),
    section(
      "People",
      input.people
        .map((person) =>
          [
            `${person.name}${person.invented ? " (invented)" : ""}`,
            person.about && `  about: ${person.about}`,
            person.home && `  lives at: ${person.home}`,
            person.work && `  ${person.owner ? "owns" : "works at"}: ${person.work}`,
            person.relations.length && `  ${person.relations.join("; ")}`,
            person.more && `  ${person.more}`,
            person.lore && `  lore: ${person.lore}`,
          ]
            .filter(Boolean)
            .join("\n"),
        )
        .join("\n"),
    ),
    section("Places", input.places.map((place) => `${place.slot}${place.name ? ` = ${place.name}` : ""}`).join("\n")),
    section("Groups of places", input.groups.join("\n")),
    section("Factions", input.factions.join("\n")),
    section("Where the player is", input.here),
    section("What lore is tied to", input.ties.join("\n")),
    section("The noticeboard", input.board),
    section("This world's own lore", input.entries.map((entry) => `${entry.title}: ${entry.content}`).join("\n\n")),
    section("What people remember", (input.memories ?? []).map((person) => `${person.name}:\n${person.lines.map((entry) => `  ${entry}`).join("\n")}`).join("\n\n")),
    section("Lore titles (look one up to read it)", (input.loreIndex ?? []).join("; ")),
    section("Looked up for you", (input.found ?? []).map((entry) => `${entry.title}:\n${entry.content}`).join("\n\n")),
    section("The recent chat in the world (oldest first)", input.chat ?? ""),
    section("Recaps of scenes played from this world (oldest first)", input.recaps ?? ""),
    ageRule(input.ages) && section("Ages", `${ageRule(input.ages)} ${AGES_YIELD}`),
    genderRule(input.genders) && section("Genders", `${genderRule(input.genders)} ${GENDERS_YIELD}`),
    input.help && section("How Wanderworld works", input.help),
  ]
    .filter(Boolean)
    .join("\n\n");
  // What it can look up before it answers (the client does the looking, and asks again with what it found):
  // a part of the world that was left out, lore by its title or by words, everything about someone, what
  // someone remembers. On the last asking there's no more looking.
  const leftOut = omitted.map((part) => `${part} (${ASSISTANT_PART_WORDS[part]})`).join("; ");
  const left = input.final
    ? `\n\n# What you have\n\nThis is everything you will be given for this answer${leftOut ? ` (not sent: ${leftOut})` : ""}. Never guess at what you weren't shown: if something is still missing, say which and why, and what you can do without it.`
    : `\n\n# Looking things up\n\nTo keep this short, only what the request seemed to need was sent${leftOut ? `. Not sent: ${leftOut}` : ""}. Lore is listed by title only, under "Lore titles". Never guess at what you weren't shown, and never tell the player you can't see something you could look up. To look something up, answer with nothing but this block (only the keys you need), and you will be asked again with what was found, up to three times:\n\`\`\`wanderworld\n{"need": ["${omitted[0] ?? "relations"}"], "lore": ["a title, or a few words to search for"], "people": ["a name: everything about them"], "memories": ["a name: what they remember"]}\n\`\`\`\n"need" takes the parts named as not sent. "lore" searches this world's lore and the player's lorebooks and brings back the entries that match, in full.`;
  const turns = input.history.map((turn) => ({ role: turn.role, content: turn.text }));
  if (input.cache === false)
    return [{ role: "system", content: `${ASSISTANT_INSTRUCTION}\n\n# The world as it is now\n\n${world}${left}` }, ...turns];
  const now = `<context>\n# The world as it is now\n\n${world}${left}\n</context>`;
  const last = turns.at(-1);
  if (last?.role === "user") turns[turns.length - 1] = { role: "user", content: `${now}\n\n${last.content}` };
  else turns.push({ role: "user", content: now });
  return [
    {
      role: "system",
      content: [
        ASSISTANT_INSTRUCTION,
        steady.filter(Boolean).join("\n\n"),
        "The player's newest message begins with a <context> block. The game put it there, the player didn't type it: it is the world as it is now (the parts this request seemed to need) and what you can look up. Earlier messages had theirs taken out, so the world may have changed since an earlier answer. Never mention the block.",
      ]
        .filter(Boolean)
        .join("\n\n"),
    },
    ...turns,
  ];
}

/** An age from the client: a whole number of years from 1 up (an elf may be a thousand), or null for no limit. */
const ageOf = (value) => (Number.isInteger(value) && value >= 1 && value <= 100000 ? value : null);

/** Said with the ages wherever they go: they're the usual, and never override what's written. */
const AGES_YIELD =
  "That is the usual range, for anyone whose age nothing gives: an age the world's lore, its setting or a card states or implies for someone stands, whatever it is (an elf may be a thousand years old).";

/** Said with the genders wherever they go: they're for people nothing says the gender of. */
const GENDERS_YIELD =
  "That is only for people whose gender nothing says: what the world's lore, its setting, a card or the player says of someone always stands.";

/**
 * How many of the people the model makes are men, women or a third gender the player names, as a sentence
 * ("" when nothing is set). `genders`: { male, female, custom (weights), name (the third one's) }.
 */
export function genderRule(genders) {
  if (!isRecord(genders)) return "";
  const weight = (value) => (Number.isFinite(value) && value > 0 ? value : 0);
  const [male, female, custom] = [weight(genders.male), weight(genders.female), weight(genders.custom)];
  const total = male + female + custom;
  if (!total) return "";
  const label = text(genders.name, 40) || "of a third gender";
  const parts = [
    [male, "male"],
    [female, "female"],
    [custom, label],
  ]
    .filter(([share]) => share > 0)
    .map(([share, word]) => `${Math.round((share / total) * 100)}% ${word}`);
  return `Genders: of the people you invent or fill in, about ${parts.join(", ")}.${custom > 0 ? ` For someone who is ${label}, give "body": "custom", and write them as ${label} in their description.` : ' Give nobody "body": "custom".'}`;
}

/** How old the people the model makes usually are, as a sentence ("" when the world sets no limit). */
export function ageRule(ages) {
  const [min, max] = [ageOf(ages?.min), ageOf(ages?.max)];
  if (min === null && max === null) return "";
  if (max === null) return `Ages: everyone is ${min} years old or older, nobody younger.`;
  if (min === null) return `Ages: nobody is older than ${max}.`;
  return `Ages: everyone is between ${Math.min(min, max)} and ${Math.max(min, max)} years old, nobody younger or older.`;
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
  const ages = ageRule(input.ages);
  const genders = genderRule(input.genders);
  if (input.step === "detail") {
    return [
      {
        role: "system",
        content: [
          "You fill in the people of a small 3D world from what its lore says of them, for a roleplay sandbox. Answer with one JSON object and nothing else.",
          `For each numbered person give "n" (their number) and, staying true to what's written and inventing only what's missing: "body" ("male", "female" or "custom"), "description" (60 to 120 words: who they are, their age and trade, their history here, what they want), "personality" (20 to 40 words, with how they talk) and "appearance" (20 to 40 words).`,
          ages && `${ages} ${AGES_YIELD} Say each one's age in their description.`,
          genders && `${genders} ${GENDERS_YIELD}`,
          `{"people": [{"n": 1, "body": "female", "description": "", "personality": "", "appearance": ""}]}`,
        ]
          .filter(Boolean)
          .join("\n\n"),
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
          `First, the people the cards already speak of. Read "What the cards say", if it's there: anyone it names or mentions as family of the player or of a listed character, or as close to them (a father, a brother, a wife, a child, a mentor, an old friend), who isn't one of the listed characters, is made before anyone is invented: under the name the card gives them (or one that fits, when it gives none), true to what the card says of them, with who they are to that person in "keys". The player's own family comes before anyone else's. Someone the card says is dead, gone or far away is left out. Only the places left over go to people you invent.`,
          `Build them around the places and the people already there: every workplace should have someone, families share homes, and some of them should know, love, envy or owe the listed characters. Don't reuse a listed name. Give each:
- "name": a name that fits the world.
- "body": "male", "female" or "custom".
- "description": 60 to 120 words: who they are, their age and trade, their history here, what they want.
- "personality": 20 to 40 words, with how they talk.
- "appearance": 20 to 40 words.
- "keys": where they belong, as keywords: "lives in <home>" ("lives in home4"; people who share a house share its number, and homes under "Already placed" are taken unless they'd live there), "works at <place>" or "owner of <place>", what they are to the player as one bare word (one of friend, romance, partner, family, colleague, mentor, rival, enemy, fear, or for the player's family brother, sister, father, mother, son, daughter, husband, wife; nothing for a stranger), and how they stand toward others as "<word> of <Name>" with one of those words or brother, sister, father, mother, son, daughter, husband, wife ("sister of Mira").`,
          ages && `${ages} ${AGES_YIELD} Say each one's age in their description.`,
          genders && `${genders} ${GENDERS_YIELD}`,
          `{"people": [{"name": "", "body": "female", "description": "", "personality": "", "appearance": "", "keys": ["lives in home4", "works at smithy1", "rival of Mira"]}]}`,
        ]
          .filter(Boolean)
          .join("\n\n"),
      },
      {
        role: "user",
        content: [
          about,
          section("What this world is", input.premise),
          section("Places", input.places.map((item) => `${item.slot} = ${item.name}${item.lore ? `: ${item.lore.slice(0, 240)}` : ""}`).join("\n")),
          cast,
          input.persona && section("The player", input.persona),
          input.cards?.length &&
            section("What the cards say", input.cards.map((card) => `${card.name}${card.player ? " (the player)" : ""}: ${card.text}`).join("\n\n")),
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
        body: ["male", "female", "custom"].includes(raw.body) ? raw.body : "",
        description: block(raw.description, MAX.card),
        personality: block(raw.personality, MAX.card),
        appearance: block(raw.appearance, MAX.card),
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
        body: ["male", "female", "custom"].includes(raw.body) ? raw.body : "",
        description: block(raw.description, MAX.card),
        personality: block(raw.personality, MAX.card),
        appearance: block(raw.appearance, MAX.card),
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
        personality: block(person.personality, MAX.card),
        extensions: { appearance: block(person.appearance, MAX.card) },
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
  // Who's here, in two parts (for a provider's prompt cache: what doesn't change comes first, so all of
  // it before the first change can be reused). Who each of them is, from their cards, is the same every
  // time: the party first, then by id, so the same people make the same text whoever stands nearest.
  // What they're doing just now is told after, with everything else that changes from moment to moment.
  const steadyOrder = [...input.listeners].sort(
    (a, b) => Number(!!b.inParty) - Number(!!a.inParty) || String(a.id).localeCompare(String(b.id)),
  );
  const cardsOf = (inParty) =>
    steadyOrder
      .filter((person) => person.card && !!person.inParty === inParty)
      .map((person) => `- id "${person.id}": ${person.name}. ${person.card}`)
      .join("\n");
  const people = input.listeners
    .map(
      (person) =>
        `- id "${person.id}": ${person.name}, ${person.distance} m away, ${person.doing || "standing about"}` +
        `${person.inParty ? ", travelling with " + input.persona.name : ""}` +
        `${person.feeling ? `. Toward ${input.persona.name}: ${person.feeling}` : ""}` +
        `${person.others ? ` With the others here: ${person.others}` : ""}` +
        `${person.knows?.length ? `\n  Knows besides (${person.name} alone):\n${person.knows.map((known) => `  · ${known}`).join("\n")}` : ""}`,
    )
    .join("\n");
  const did = [
    input.action ? `${input.persona.name} ${input.action}.` : "",
    input.line ? `${input.persona.name} ${VOICES[input.voice] ?? "says"}: "${input.line}"` : "",
  ]
    .filter(Boolean)
    .join(" ");
  const planning = !!people && !!input.line && input.places.length > 0 && input.telling !== "narrator";
  // Told in separate calls (`telling`): the narrator's call says who answers and not what they say; a
  // speaker's call writes for that one person (`speaker`: their id), who alone has their knowledge in it.
  const speaker = input.telling === "speaker" ? input.listeners.find((person) => person.id === input.speaker) : null;
  const system = [
    // (The same for the narrator and for every speaker, moment after moment.)
    "This is Wanderworld, a small living world the player walks around in. What follows is the world and who is in it, then what is happening right now. Your part in it, and exactly what to write, come last, under \"Your part\".",
    `The player is ${input.persona.name}.${input.persona.card ? " " + input.persona.card : ""} Never write ${input.persona.name}'s words, thoughts or choices.`,
    TALK_STYLES[input.style] ?? TALK_STYLES.natural,
    section("The world", input.setting),
    // (The narrator's card and the world's lore never change; the party seldom; the place's lore with the place; who's near, often.)
    input.narrator &&
      !speaker &&
      section(
        "Your voice",
        `You narrate as ${input.narrator.name}. Keep to that voice in the narration; other people still speak as themselves. Who that is:\n${input.narrator.card}`,
      ),
    section("What everyone in this world knows (lore)", (input.worldLore ?? []).join("\n\n")),
    section(`Who is travelling with ${input.persona.name}`, cardsOf(true)),
    section("What everyone here knows (lore of this place)", input.lore.join("\n\n")),
    section("Who else is here", cardsOf(false)),
    // From here on it changes from one moment to the next.
    section(
      "Right now",
      [
        input.place && `Where: ${input.place}.`,
        input.time && `When: ${input.time}.`,
        input.weather && `Weather: ${input.weather}.`,
        (input.persona.worn || input.persona.sheet) &&
          `${input.persona.name}, as they are now. ${[input.persona.worn, input.persona.sheet].filter(Boolean).join(" ")}`,
      ]
        .filter(Boolean)
        .join("\n"),
    ),
    section(
      "Who can hear",
      (people &&
        `${
          speaker
            ? `${speaker.name} knows what's in their own entry, what all of them saw and heard together, and the lore everyone here knows, and nothing else. The others are listed so you know who's here: what they know isn't ${speaker.name}'s to know.`
            : input.telling === "narrator"
              ? "What each of them knows of their own isn't given here: it's theirs to speak from, and not yours to tell."
              : "Each of them knows what's in their own entry, what all of them saw and heard together, and the lore everyone here knows, and nothing else. What's in someone else's entry they don't know and can't speak of, unless it's said to them here and now."
        }\n${people}`) ||
        "Nobody is close enough to hear. Still narrate: one or two sentences on what comes of it and what the player notices. No replies.",
    ),
    // Only what those here saw and heard (the client keeps who heard each line): what was said elsewhere
    // isn't theirs to know. With nobody here it's the narrator's own last lines, so it doesn't repeat itself.
    input.recent.length > 0 &&
      section(
        "Just before",
        [
          !people
            ? "(What you told last: don't say it again.)"
            : "(What every one of them saw and heard, in order.)",
          input.recent.some((line) => line.stamp) &&
            "(In brackets: when and where each happened. It may have been a while ago, or somewhere else; now and here are under Right now.)",
          ...input.recent.map((line) => `${line.stamp ? `[${line.stamp}] ` : ""}${line.who}: ${line.text}`),
        ]
          .filter(Boolean)
          .join("\n"),
      ),
    // A plan (someone agreeing to be somewhere at a time) can only come of something said to someone:
    // the list of places, and the plans in the answer, go only then.
    planning && section("Places in the world (for plans)", input.places.map((place) => place.name).join(", ")),
    `## Your part\n${
      speaker
        ? `You write for ${speaker.name}, one of the people here. Write only what ${speaker.name} says in this one moment, as JSON.`
        : "You are the narrator. Write only what happens in this one moment, as JSON."
    }`,
    input.telling === "narrator" && people
      ? `Answer with one JSON object and nothing else:
{"narration": "at most two short sentences: what ${input.persona.name} sees, hears or finds; empty if nothing worth saying",
 "speakers": ["the id of someone from Who can hear who answers aloud"]}
Only people who heard (a whisper carries a couple of metres, a shout across a square) may answer, and only if they would: zero to three ids, the most fitting first. Don't write what they say: each speaks for themselves next.`
      : speaker
        ? `Answer with one JSON object and nothing else:
{"replies": [{"id": "${speaker.id}", "text": "what ${speaker.name} says aloud, at most one short *action*"}]${
            planning
              ? `,
 "plans": [{"id": "${speaker.id}", "from": 12, "to": 13, "activity": "${ACTIVITIES.join("|")}", "place": "a place from the list"}]`
              : ""
          }}
Only ${speaker.name} replies: one reply, or an empty list if they'd say nothing.${planning ? ` Add a plan only when ${speaker.name} agrees to be somewhere at a time; otherwise leave plans empty.` : ""}`
        : `Answer with one JSON object and nothing else:
{"narration": "at most two short sentences: what ${input.persona.name} sees, hears or finds; empty if nothing worth saying",
 "replies": [{"id": "an id from Who can hear", "text": "what they say aloud, at most one short *action*"}]${
   planning
     ? `,
 "plans": [{"id": "an id from Who can hear", "from": 12, "to": 13, "activity": "${ACTIVITIES.join("|")}", "place": "a place from the list"}]`
     : ""
 }}
Only people who heard (a whisper carries a couple of metres, a shout across a square) may reply, and only if they would: zero to three replies, the most fitting first.${planning ? " Add a plan only when someone agrees to be somewhere at a time; otherwise leave plans empty." : ""}`,
  ]
    .filter(Boolean)
    .join("\n\n");
  return [
    { role: "system", content: system },
    {
      role: "user",
      content: [
        did || `${input.persona.name} looks around.`,
        // (A speaker is told what's come of it so far: the narration, and whoever spoke before them.)
        speaker && input.told?.narration,
        ...(speaker ? (input.told?.replies ?? []).map((reply) => `${reply.name}: ${reply.text}`) : []),
      ]
        .filter(Boolean)
        .join("\n"),
    },
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

/** Writes a document. `existing`, when given, is the one read before (null: none), whose revision it must still be at. */
async function putDocument(documents, id, kind, name, data, existing) {
  const now = new Date().toISOString();
  if (existing === undefined) existing = await documents.getById(PACKAGE_ID, id);
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

// ── The call log (Settings → Debug) ──────────────────────────────────────────

/**
 * Words the player is shown, with anything shaped like a key or a token taken out. Wanderworld never has
 * a key (the Engine keeps them), so this is for what a provider's error message might quote back.
 */
export const scrub = (value) =>
  String(value ?? "")
    .replace(/\b(Bearer|Basic)\s+[\w.~+/=-]{8,}/giu, "$1 [hidden]")
    .replace(/\b(?:sk|xai|gsk|nvapi)[-_][\w-]{12,}/gu, "[hidden]")
    .replace(/\bAIza[\w-]{20,}/gu, "[hidden]")
    .replace(/([?&](?:api[-_]?key|key|token|access_token)=)[^&\s"']+/giu, "$1[hidden]")
    .replace(
      /((?:api[-_ ]?key|authorization|x-api-key)["']?\s*[:=]\s*["']?)(?!Bearer|Basic|\[hidden\])[^\s"',}]{6,}/giu,
      "$1[hidden]",
    );

/** A call's token counts as the Engine reports them, or null when the connection reported none. */
export function usageOf(raw) {
  if (!isRecord(raw)) return null;
  const count = (value) => (Number.isFinite(value) && value >= 0 ? value : null);
  const prompt = count(raw.promptTokens) ?? 0;
  const completion = count(raw.completionTokens) ?? 0;
  const total = count(raw.totalTokens) || prompt + completion;
  if (!total) return null;
  return {
    prompt,
    completion,
    total,
    cached: count(raw.cachedPromptTokens),
    cacheWrite: count(raw.cacheWritePromptTokens),
    reasoning: count(raw.completionReasoningTokens),
    // (The Engine doesn't pass a provider's cost on to packages today; shown if it ever does.)
    cost: count(raw.cost),
  };
}

/**
 * What a call would cost by its model's price list (`pricing`: per million tokens, as the Engine's model
 * picker shows it), or null without prices or token counts. An estimate, not the provider's bill.
 * ponytail: some connections count cached tokens within the tokens sent and some beside them, and the
 * Engine doesn't say which. They're taken as within unless there are more of them than were sent; a
 * connection that counts them beside is priced a little low when its cache numbers are small.
 */
export function costOf(usage, pricing) {
  if (!usage || !isRecord(pricing)) return null;
  const price = (value) => (Number.isFinite(value) && value >= 0 ? value : null);
  const currency = typeof pricing.currency === "string" && pricing.currency ? pricing.currency.slice(0, 8) : "USD";
  const rates = {
    prompt: price(pricing.prompt),
    completion: price(pricing.completion),
    cacheRead: price(pricing.cacheRead),
    cacheWrite: price(pricing.cacheWrite),
    perCall: price(pricing.perCall),
  };
  if (rates.perCall !== null) return { amount: rates.perCall, currency, rates };
  if (rates.prompt === null && rates.completion === null) return null;
  const cached = usage.cached ?? 0;
  const written = usage.cacheWrite ?? 0;
  const fresh = cached + written > usage.prompt ? usage.prompt : usage.prompt - cached - written;
  const input = rates.prompt ?? 0;
  const amount =
    (fresh * input +
      cached * (rates.cacheRead ?? input) +
      written * (rates.cacheWrite ?? input) +
      usage.completion * (rates.completion ?? 0)) /
    1e6;
  return { amount, currency, rates };
}

/**
 * The model and picture calls made since the Engine started, for the player to read: the newest `kept`
 * with what was sent and what came back, and totals over all of them. In memory only.
 * ponytail: gone when the Engine restarts and capped at `kept` calls; write them to a document if a
 * longer history is wanted.
 */
export function createCallLog(kept = 50) {
  const fresh = () => ({
    since: Date.now(),
    requests: 0,
    responses: 0,
    failed: 0,
    cutOff: 0,
    counted: 0,
    cacheKnown: 0,
    prompt: 0,
    completion: 0,
    total: 0,
    cached: 0,
    cacheWrite: 0,
    reasoning: 0,
    cost: null,
    estimate: 0,
    priced: 0,
    currency: null,
    ms: 0,
    pictures: 0,
    picturesFailed: 0,
    byKind: {},
  });
  const words = (value) => scrub(typeof value === "string" ? value : JSON.stringify(value ?? "")).slice(0, 200000);
  let totals = fresh();
  let calls = [];
  let next = 1;
  return {
    add(entry) {
      const usage = usageOf(entry.usage);
      const messages = (entry.messages ?? []).map((message) => ({ role: words(message.role).slice(0, 40), content: words(message.content) }));
      const reply = words(entry.reply);
      const call = {
        id: next++,
        at: Date.now(),
        kind: entry.kind === "image" ? "image" : "text",
        what: words(entry.what).slice(0, 60),
        model: words(entry.model ?? "?").slice(0, 120),
        temperature: entry.temperature ?? null,
        maxTokens: entry.maxTokens ?? null,
        ms: Math.max(0, Math.round(entry.ms ?? 0)),
        sent: messages.reduce((sum, message) => sum + message.content.length, 0),
        got: reply.length,
        finish: words(entry.finish).slice(0, 40),
        note: words(entry.note).slice(0, 200),
        error: entry.error ? words(entry.error).slice(0, 500) : "",
        usage,
        estimate: null,
        messages,
        reply,
      };
      calls = [...calls, call].slice(-kept);
      totals.ms += call.ms;
      if (call.kind === "image") {
        totals.pictures++;
        if (call.error) totals.picturesFailed++;
        return call.id;
      }
      totals.requests++;
      if (call.error) totals.failed++;
      else totals.responses++;
      if (call.finish === "length") totals.cutOff++;
      const kind = (totals.byKind[call.what] ??= { requests: 0, total: 0 });
      kind.requests++;
      if (usage) {
        totals.counted++;
        if (usage.cached !== null) totals.cacheKnown++;
        for (const key of ["prompt", "completion", "total", "cached", "cacheWrite", "reasoning"]) totals[key] += usage[key] ?? 0;
        if (usage.cost !== null) totals.cost = (totals.cost ?? 0) + usage.cost;
        kind.total += usage.total;
      }
      return call.id;
    },
    /** The totals and each kept call without its words (newest first). */
    read: () => ({
      kept,
      totals: { ...totals, byKind: { ...totals.byKind } },
      calls: calls.map(({ messages: _sent, reply: _got, ...rest }) => rest).reverse(),
    }),
    one: (id) => calls.find((call) => call.id === Number(id)) ?? null,
    /** A call's cost worked out from its model's prices, which are read after the answer has come. */
    price(id, pricing) {
      const call = calls.find((one) => one.id === id);
      const cost = costOf(call?.usage, pricing);
      if (!cost) return;
      call.estimate = cost;
      // (One currency is added up: the first seen.)
      if ((totals.currency ??= cost.currency) !== cost.currency) return;
      totals.estimate += cost.amount;
      totals.priced++;
    },
    clear() {
      totals = fresh();
      calls = [];
    },
  };
}

// ── Activation ───────────────────────────────────────────────────────────────

export async function activate(context) {
  const { api } = context;
  const { persistence, resources, languageModels, logger } = api.runtime;
  const { documents } = persistence;
  // A picture is two documents: what a gallery lists (the world, caption, prompt and when) and the image,
  // so listing never reads the images. One kept from before has its image in it; it's split when listed.
  const pictureDocs = async () => {
    const all = await documents.list(PACKAGE_ID, PICTURE_KIND);
    for (const doc of all.filter((each) => typeof each.data?.image === "string")) {
      const { image, ...listed } = doc.data;
      try {
        await putDocument(documents, imageDocId(doc.id), PICTURE_IMAGE_KIND, doc.name ?? "", { image });
        if (await putDocument(documents, doc.id, PICTURE_KIND, doc.name ?? "", listed, doc)) doc.data = listed;
      } catch (error) {
        logger.warn("[wanderworld] a picture couldn't be split from its image: %s", error?.message ?? error);
      }
    }
    return all;
  };
  const removePicture = async (doc) => {
    await removeDocument(documents, imageDocId(doc.id));
    return removeDocument(documents, doc.id);
  };
  const scenesOn = typeof api.registerSceneOrigin === "function";
  const callLog = createCallLog();
  // A model's prices, from its connection's model list as the Engine serves it to its own model picker.
  // Read at most once an hour for each model (a list that couldn't be read is asked for again next time),
  // never waited for by a reply, and only the last hundred models' are kept.
  const prices = new Map();
  const priceOf = (connectionId, modelId) => {
    const key = `${connectionId}|${modelId}`;
    const held = prices.get(key);
    if (held && Date.now() - held.at < 3600000) return held.price;
    const price = engineFetch(`/api/connections/${encodeURIComponent(connectionId)}/models`, { method: "GET" })
      .then((body) => (Array.isArray(body?.models) ? body.models : []).find((row) => row?.id === modelId)?.pricing ?? null)
      .catch(() => {
        if (prices.get(key)?.price === price) prices.delete(key);
        return null;
      });
    prices.delete(key); // (so it's the newest)
    prices.set(key, { at: Date.now(), price });
    for (const old of prices.keys()) if (prices.size > 100) prices.delete(old);
    return price;
  };

  // The Engine's Debug Mode (Settings → Advanced), which the client sends with each request as it's a
  // browser setting, or the server's own override. With it on, every model and image request and its
  // answer is written to the Engine's console (`debugOverride` shows them whatever the log level;
  // off, they're ordinary debug lines).
  const debugOf = (body) => body?.debugMode === true || (api.runtime.isDebugAgentsEnabled?.() ?? false);

  /** Asks `model` (resolved for this request), with the request and the answer logged for debugging. */
  const askModel = async (what, body, model, messages, options) => {
    const debug = debugOf(body);
    logger.debugOverride?.(
      debug,
      "[debug/wanderworld/%s] request (model %s, temperature %s, max tokens %s, %d characters):\n%s",
      what,
      model?.model ?? "?",
      options?.temperature ?? "default",
      options?.maxTokens ?? "default",
      messages.reduce((sum, message) => sum + String(message.content).length, 0),
      debugMessages(messages),
    );
    const started = Date.now();
    // Every call is also kept for Settings → Debug, whether or not Debug Mode is on.
    const noted = { what, model: model?.model, temperature: options?.temperature, maxTokens: options?.maxTokens, messages };
    let result;
    try {
      result = await model.chatComplete(messages, { ...options, debugMode: debug });
    } catch (error) {
      callLog.add({ ...noted, ms: Date.now() - started, error: error?.message ?? String(error) });
      throw error;
    }
    const content = typeof result?.content === "string" ? result.content : "";
    const logged = callLog.add({ ...noted, ms: Date.now() - started, reply: content, finish: result?.finishReason, usage: result?.usage });
    if (usageOf(result?.usage) && model?.connectionId && model?.model)
      void priceOf(model.connectionId, model.model).then((pricing) => callLog.price(logged, pricing));
    logger.debugOverride?.(
      debug,
      "[debug/wanderworld/%s] response (%d characters, %d ms):\n%s",
      what,
      content.length,
      Date.now() - started,
      content,
    );
    return result;
  };

  /**
   * A picture from the Engine. The avatar route takes a prompt override for its own id, which keeps it
   * from writing a portrait. What's sent (connection, model, size, style, prompt) is logged for debugging.
   */
  const paint = async (body, connection, { name, prompt, width, height, styleProfileId, negative = "" }) => {
    const debug = debugOf(body);
    logger.debugOverride?.(
      debug,
      "[debug/wanderworld/image] request (connection %s, model %s, %dx%d, style %s, %d characters):\n%s",
      connection.name,
      connection.model || "?",
      width,
      height,
      styleProfileId || "the user's default",
      prompt.length,
      prompt,
    );
    const started = Date.now();
    const noted = {
      kind: "image",
      what: "image",
      model: connection.model || connection.name,
      messages: [{ role: "prompt", content: prompt }, ...(negative ? [{ role: "kept out", content: negative }] : [])],
    };
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
        // (A finished prompt: the Engine paints it as it is, with no style of its own added, so the
        // style's words are already in it and what the style keeps out goes here.)
        promptOverrides: [{ id: `avatar:${name}`, prompt, ...(negative ? { negativePrompt: negative } : {}) }],
      }),
    }).catch((error) => {
      callLog.add({ ...noted, note: `${width}x${height}`, ms: Date.now() - started, error: error?.message ?? String(error) });
      throw error;
    });
    callLog.add({
      ...noted,
      ms: Date.now() - started,
      note: `${width}x${height}, ${typeof result?.image === "string" ? `a picture of about ${Math.round((result.image.length * 3) / 4 / 1024)} KB` : "no picture"}`,
      error: typeof result?.image === "string" ? "" : "No picture came back.",
    });
    logger.debugOverride?.(
      debug,
      "[debug/wanderworld/image] response (%d ms, %s)",
      Date.now() - started,
      typeof result?.image === "string" ? `a picture of about ${Math.round((result.image.length * 3) / 4 / 1024)} KB` : "no picture",
    );
    return result;
  };

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
        assistant: true,
        saves: true,
        quests: true,
      }));

      // Settings → Debug: the calls made since the Engine started. No key is in them (see `scrub`).
      routes.get("/debug/log", async () => callLog.read());
      routes.get("/debug/call/:id", async (request, reply) => {
        const call = callLog.one(request.params?.id);
        return call ?? reply.status(404).send({ error: "That call is no longer kept." });
      });
      routes.post("/debug/clear", async () => {
        callLog.clear();
        return { ok: true };
      });

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
        // (In the order asked for: from the whole world down to this spot, the same from one line to the next.)
        const asked = new Map(loreIds.map((entry, index) => [entry.entryId, index]));
        if (Array.isArray(loreEntries)) loreEntries.sort((a, b) => (asked.get(a?.id) ?? 1e9) - (asked.get(b?.id) ?? 1e9));
        const input = {
          character: characterCard(record, body.characterName),
          persona: personaCard(personaRecord, text(body.personaName, MAX.name), body.worn, body.sheet),
          // Whether each knows the other by name (missing: they do, as before this was told).
          knowsThem: body.knowsThem !== false,
          knowsYou: body.knowsYou !== false,
          place: text(body.place, 300),
          time: text(body.time, 80),
          weather: text(body.weather, 40),
          nearby: text(body.nearby, 300),
          inParty: body.inParty === true,
          companions: text(body.companions, 300),
          cache: body.cache !== false,
          relationship: text(body.relationship, 600),
          memories: (Array.isArray(body.memories) ? body.memories : []).map((line) => text(line, 260)).filter(Boolean).slice(0, 5000),
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
          const result = await askModel("talk", body, model, talkMessages(input), { temperature, maxTokens });
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
          const result = await paint(body, connection, { name, prompt, width, height, styleProfileId, negative: text(body.negative, 600) });
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
            feeling: text(person.feeling, 600),
            others: text(person.others, 500),
            knows: (Array.isArray(person.knows) ? person.knows : []).map((known) => block(known, MAX.loreText)).filter(Boolean).slice(0, 5000),
            inParty: person.inParty === true,
          }))
          .filter((person) => person.id)
          .slice(0, 5); // the client's MAX_LISTENERS
        const records = await listPeople(resources, listeners.map((person) => person.id), body.locals);
        const cards = new Map(records.map((record) => [record.id, characterCard(record)]));
        const personaId = idOf(body.personaId);
        const [personaRecord] = personaId ? await resources.listPersonas([personaId]) : [];
        const persona = personaCard(personaRecord, text(body.personaName, MAX.name), body.worn, body.sheet);
        const heard = listeners
          .filter((person) => cards.has(person.id))
          .map((person) => {
            const card = cards.get(person.id);
            return { ...person, name: card.name, card: cardWords([card.personality, card.description], MAX.card, card.name, persona.name) };
          });
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
            ? { name: narratorCard.name, card: cardWords([narratorCard.personality, narratorCard.description], MAX.card, narratorCard.name, persona.name, "\n") }
            : null,
          // (What they have on is told with what's happening now: it changes, and their card doesn't.)
          persona: { name: persona.name, card: cardWords([persona.description, persona.appearance], MAX.card, persona.name, persona.name), worn: persona.worn, sheet: persona.sheet },
          listeners: heard,
          action: text(body.action, 300),
          line: text(body.line, MAX.line),
          voice: VOICES[body.voice] ? body.voice : "talk",
          place: text(body.place, 300),
          time: text(body.time, 80),
          weather: text(body.weather, 40),
          setting: block(body.setting, 600),
          style: text(body.style, 20),
          lore: (Array.isArray(body.lore) ? body.lore : []).map((entry) => block(entry, MAX.loreText)).filter(Boolean).slice(0, MAX.lore),
          worldLore: (Array.isArray(body.worldLore) ? body.worldLore : []).map((entry) => block(entry, MAX.loreText)).filter(Boolean).slice(0, MAX.lore),
          recent: (Array.isArray(body.recent) ? body.recent : [])
            .filter(isRecord)
            .slice(-12)
            .map((line) => ({ who: text(line.who, MAX.name) || "Someone", text: text(line.text, 400), stamp: text(line.stamp, 120) }))
            .filter((line) => line.text),
          places,
        };
        if (!input.action && !input.line) return reply.status(400).send({ error: "Nothing happened (action or line)" });
        try {
          const model = await languageModels.resolveForRequest({ connectionId: idOf(body.connectionId) || undefined });
          const temperature = Number.isFinite(body.temperature) ? Math.max(0, Math.min(1.5, body.temperature)) : 0.9;
          // A call for each person who answers (the client's setting): the narrator's call is given nobody's
          // own knowledge, and each speaker's call only theirs, so nothing can leak from one to another.
          if (body.separate === true && heard.length) {
            const open = (person) => ({ ...person, knows: [] });
            const bare = (person) => ({ ...open(person), feeling: "", others: "", card: "" });
            const first = await askModel("moment/narrator", body, model, momentMessages({ ...input, listeners: heard.map(open), telling: "narrator" }), { temperature, maxTokens: 400 });
            const told = readJson(first?.content, api.runtime.json?.parseJsonish);
            if (!told) return reply.status(502).send({ error: "The model's answer wasn't readable." });
            const out = { narration: text(told.narration, 600), replies: [], plans: [] };
            const speakers = [...new Set((Array.isArray(told.speakers) ? told.speakers : []).map(idOf))].filter((id) => heard.some((person) => person.id === id)).slice(0, 3);
            for (const id of speakers) {
              const messages = momentMessages({
                ...input,
                listeners: heard.map((person) => (person.id === id ? person : bare(person))),
                telling: "speaker",
                speaker: id,
                told: { narration: out.narration, replies: out.replies.map((said) => ({ name: heard.find((person) => person.id === said.id).name, text: said.text })) },
              });
              try {
                const answer = await askModel("moment/speaker", body, model, messages, { temperature, maxTokens: 400 });
                const said = checkMoment(readJson(answer?.content, api.runtime.json?.parseJsonish) ?? {}, heard.filter((person) => person.id === id), places);
                out.replies.push(...said.replies.slice(0, 1));
                out.plans.push(...said.plans);
              } catch (error) {
                logger.warn("[wanderworld] a speaker's reply failed: %s", error?.message ?? error); // (the others still speak)
              }
            }
            return out;
          }
          const result = await askModel("moment", body, model, momentMessages(input), { temperature, maxTokens: 700 });
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
          section(card.name, cutText([card.description, card.personality, card.scenario].filter(Boolean).join("\n\n"), MAX.card)),
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
          const result = await askModel("plan", body, model,
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
              return [record.id, cutText(card.appearance || card.description, MAX.card)];
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
            content: cutText(replaceNames(words, card?.name ?? "", text(body.persona, MAX.name) || "the player"), MAX.card),
          };
        });
        const personaId = idOf(body.personaId);
        if (personaId) {
          const [record] = await resources.listPersonas([personaId]);
          const card = personaCard(record, text(body.persona, MAX.name));
          cards.push({
            title: `Character card: player (${card.name})`,
            keys: [],
            content: cutText([card.description, card.personality, card.appearance].filter(Boolean).join("\n"), MAX.card),
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
          const result = await askModel("lore-setup", body, model, messages, { temperature: 0.2, maxTokens: 4000 });
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
          cards: step === "people" ? await writersCards(resources, body) : [],
          ages: isRecord(body.ages) ? body.ages : null,
          genders: isRecord(body.genders) ? body.genders : null,
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
          const result = await askModel("world-write", body, model, messages, { temperature: 0.8, maxTokens: 6000 });
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
      // The AI assistant: one turn of its chat. The answer's changes come back checked, for the client
      // to apply to the world it holds (nothing is changed here).
      routes.post("/assistant", async (request, reply) => {
        const body = isRecord(request.body) ? request.body : {};
        const list = (value, max) => (Array.isArray(value) ? value : []).filter(isRecord).slice(0, max);
        const history = (Array.isArray(body.history) ? body.history : [])
          .filter(isRecord)
          .slice(-20)
          .map((turn) => ({ role: turn.role === "assistant" ? "assistant" : "user", text: block(turn.text, 3000) }))
          .filter((turn) => turn.text);
        // The chat starts with something the player said (the oldest turns kept may begin mid-way).
        while (history.length && history[0].role !== "user") history.shift();
        const keywords = body.task === "keywords";
        if (!keywords && history.at(-1)?.role !== "user") return reply.status(400).send({ error: "Ask something first." });
        const bookEntries = list(body.bookEntries, 20)
          .map((entry) => ({ title: text(entry.title, 120), keys: text(entry.keys, 600), content: block(entry.content, MAX.loreText) }))
          .filter((entry) => entry.title);
        if (keywords && (!bookEntries.length || !block(body.keywordPrompt, 12000)))
          return reply.status(400).send({ error: "Choose the lorebook entries to draft keywords for." });
        const messages = (keywords ? keywordMessages : assistantMessages)({
          bookEntries,
          keywordPrompt: block(body.keywordPrompt, 12000),
          chat: block(body.chat, 5000),
          recaps: block(body.recaps, 8000),
          omitted: (Array.isArray(body.omitted) ? body.omitted : []).filter((part) => typeof part === "string").slice(0, 20),
          final: body.final === true,
          cache: body.cache !== false,
          worldName: text(body.worldName, MAX.name),
          setting: text(body.setting, 600),
          persona: text(body.persona, MAX.name),
          history,
          people: list(body.people, 40)
            .map((person) => ({
              name: text(person.name, 80),
              invented: person.invented === true,
              about: block(person.about, MAX.card),
              home: text(person.home, 120),
              work: text(person.work, 120),
              owner: person.owner === true,
              relations: (Array.isArray(person.relations) ? person.relations : []).map((line) => text(line, 100)).filter(Boolean).slice(0, 12),
              lore: block(person.lore, MAX.loreText),
              more: text(person.more, 400),
            }))
            .filter((person) => person.name),
          groups: (Array.isArray(body.groups) ? body.groups : []).map((line) => text(line, 400)).filter(Boolean).slice(0, 40),
          factions: (Array.isArray(body.factions) ? body.factions : []).map((line) => text(line, 400)).filter(Boolean).slice(0, 40),
          ties: (Array.isArray(body.ties) ? body.ties : []).map((line) => text(line, 300)).filter(Boolean).slice(0, 120),
          here: block(body.here, 1500),
          board: block(body.board, 3000),
          places: list(body.places, 160)
            .map((place) => ({ slot: text(place.slot, 30), name: text(place.name, 80) }))
            .filter((place) => place.slot),
          entries: list(body.entries, 60)
            .map((entry) => ({ title: text(entry.title, 120), content: block(entry.content, MAX.loreText) }))
            .filter((entry) => entry.title && entry.content),
          memories: list(body.memories, 40)
            .map((person) => ({ name: text(person.name, 80), lines: (Array.isArray(person.lines) ? person.lines : []).map((entry) => text(entry, 260)).filter(Boolean).slice(-5000) }))
            .filter((person) => person.name && person.lines.length),
          loreIndex: (Array.isArray(body.loreIndex) ? body.loreIndex : []).map((title) => text(title, 100)).filter(Boolean).slice(0, 250),
          found: list(body.found, 24)
            .map((entry) => ({ title: text(entry.title, 200), content: block(entry.content, MAX.loreText) }))
            .filter((entry) => entry.title && entry.content),
          help: block(body.help, 80000), // (up to the 20,000 tokens Settings → AI assistant allows)
          ages: isRecord(body.ages) ? body.ages : null,
          genders: isRecord(body.genders) ? body.genders : null,
        });
        try {
          const model = await languageModels.resolveForRequest({ connectionId: idOf(body.connectionId) || undefined });
          const result = await askModel(keywords ? "keywords" : "assistant", body, model, messages, { temperature: 0.4, maxTokens: 4000 });
          // A keyword draft is words to copy: nothing in it is read as a change.
          if (keywords)
            return { reply: block(String(result?.content ?? "").replace(/<think>[\s\S]*?<\/think>/giu, ""), 12000), edits: [], problem: "" };
          return readAssistant(result?.content);
        } catch (error) {
          logger.warn("[wanderworld] the assistant didn't answer: %s", error?.message ?? error);
          return reply.status(502).send({ error: `The assistant didn't answer: ${error?.message ?? error}` });
        }
      });

      routes.post("/illustrate", async (request, reply) => {
        const body = isRecord(request.body) ? request.body : {};
        const worldId = idOf(body.worldId);
        const template = block(body.template, 20000);
        if (!worldId || !template) return reply.status(400).send({ error: "A world and a prompt template are needed." });
        const facts = isRecord(body.facts) ? body.facts : {};
        const people = (Array.isArray(facts.people) ? facts.people : []).filter(isRecord).slice(0, 8);
        const records = await listPeople(resources, people.map((person) => idOf(person.id)).filter(Boolean), body.locals);
        const cards = new Map(records.map((record) => [record.id, characterCard(record)]));
        const personaId = idOf(body.personaId);
        const [personaRecord] = personaId ? await resources.listPersonas([personaId]) : [];
        const persona = personaCard(personaRecord, text(facts.persona, MAX.name), body.worn);
        const looks = people
          .map((person) => {
            const card = cards.get(idOf(person.id));
            const name = card?.name ?? text(person.name, MAX.name);
            return card?.appearance ? `${name}: ${cutWords(card.appearance, MAX.appearance)}` : "";
          })
          .filter(Boolean);
        // The last of the chat, oldest first: "Zoey: I kneel by the pond."
        const chat = (Array.isArray(facts.chat) ? facts.chat : [])
          .filter(isRecord)
          .slice(-8)
          .map((line) => [text(line.who, MAX.name), cutWords(text(line.text, 2000), 300)])
          .filter(([, said]) => said)
          .map(([who, said]) => `${who || "Narrator"}: ${said}`)
          .join("\n");
        const values = {
          persona: persona.name,
          // "Zoey: tall, red-haired…", or nothing when the card has no appearance (so no dangling name).
          persona_appearance:
            persona.appearance || persona.worn
              ? `${persona.name}: ${[cutWords(persona.appearance, MAX.appearance), persona.worn].filter(Boolean).join(" ")}`
              : "",
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
          style: text(body.style, 900),
          recent: text(facts.recent, 400),
          recent_chat: chat.replace(/\n/gu, " "),
        };
        // The prompt: the one the player approved (after a review), or the template filled in and, when
        // asked, rewritten by the model to the player's instruction. A rewrite that fails leaves it as it was.
        let prompt = block(body.prompt, MAX.picture) || fillTemplate(template, values);
        if (!prompt) return reply.status(400).send({ error: "The template came out empty." });
        // The chosen style is always in it: a template with no {style} has it added at the end.
        if (!block(body.prompt, MAX.picture) && values.style && !/\{style\}/u.test(template)) prompt = `${prompt} ${values.style}.`;
        let improved = false;
        if (body.improve === true && !block(body.prompt, MAX.picture)) {
          try {
            const model = await languageModels.resolveForRequest({ connectionId: idOf(body.textConnectionId) || undefined });
            const result = await askModel("illustrate", body, model,
              [
                {
                  role: "system",
                  content: `${block(body.instruction, 60000) || IMPROVE_INSTRUCTION}${chat ? `\n\n${IMPROVE_CHAT_NOTE}` : ""}`,
                },
                { role: "user", content: chat ? `<facts>\n${prompt}\n</facts>\n\n<chat>\n${chat}\n</chat>` : prompt },
              ],
              { temperature: 0.7, maxTokens: 1500 },
            );
            const rewritten = pictureWords(result?.content);
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
          const result = await paint(body, connection, { name, prompt, width, height, styleProfileId, negative: text(body.negative, 600) });
          if (typeof result?.image !== "string" || !result.image.startsWith("data:image/")) {
            return reply.status(502).send({ error: "The Engine sent back no picture." });
          }
          const at = new Date().toISOString();
          const id = docId("picture", `${worldId}|${at}|${Math.random()}`);
          const caption = text(body.caption, 200) || values.place;
          await putDocument(documents, imageDocId(id), PICTURE_IMAGE_KIND, caption, { image: result.image });
          await putDocument(documents, id, PICTURE_KIND, caption, { worldId, prompt, caption, at });
          // Only the newest pictures of a world are kept.
          const all = (await pictureDocs()).filter((doc) => doc.data?.worldId === worldId);
          all.sort((a, b) => String(b.data?.at).localeCompare(String(a.data?.at)));
          for (const old of all.slice(MAX_PICTURES)) await removePicture(old).catch(() => false);
          return { id, image: result.image, prompt, caption, at, improved };
        } catch (error) {
          logger.warn("[wanderworld] illustrate failed: %s", error?.message ?? error);
          return reply.status(502).send({ error: text(error?.message, 300) || "The picture couldn't be made." });
        }
      });

      routes.get("/pictures/:world", async (request) => {
        const world = idOf(request.params.world);
        const all = (await pictureDocs()).filter((doc) => doc.data?.worldId === world);
        return {
          pictures: all
            .map((doc) => ({ id: doc.id, caption: doc.data.caption ?? "", prompt: doc.data.prompt ?? "", at: doc.data.at }))
            .sort((a, b) => String(b.at).localeCompare(String(a.at))),
        };
      });

      routes.get("/picture/:id", async (request, reply) => {
        const doc = await documents.getById(PACKAGE_ID, idOf(request.params.id));
        if (!doc || doc.kind !== PICTURE_KIND) return reply.status(404).send({ error: "No such picture" });
        const image = doc.data.image ?? (await documents.getById(PACKAGE_ID, imageDocId(doc.id)))?.data?.image ?? null;
        return { id: doc.id, image, caption: doc.data.caption, prompt: doc.data.prompt, at: doc.data.at };
      });

      // A world deleted: its pictures, its scenes' recaps and the contexts of scenes not yet played go too.
      routes.delete("/world/:id", async (request) => {
        const world = idOf(request.params.id);
        if (!world) return { removed: 0 };
        const gone = [
          ...(await pictureDocs()).filter((doc) => doc.data?.worldId === world).map(removePicture),
          ...(await documents.list(PACKAGE_ID, RESULT_KIND))
            .filter((doc) => doc.data?.worldId === world)
            .map((doc) => removeDocument(documents, doc.id)),
          ...(await documents.list(PACKAGE_ID, ORIGIN_KIND))
            .filter((doc) => worldOf(String(doc.data?.originId ?? "")) === world)
            .map((doc) => removeDocument(documents, doc.id)),
        ];
        return { removed: (await Promise.all(gone.map((removal) => removal.catch(() => false)))).filter(Boolean).length };
      });

      // Saved worlds: text the client wrote and will check when it reads it back (saves.js checkWorld), kept
      // by key. Only the client's own save keys are taken, and only so many, each within a size.
      const saveDocs = async () =>
        (await documents.list(PACKAGE_ID, SAVE_KIND)).filter((doc) => SAVE_KEY.test(doc.data?.key ?? "") && typeof doc.data.value === "string");
      routes.get("/saves", async () => ({
        keys: Object.fromEntries((await saveDocs()).map((doc) => [doc.data.key, doc.data.value])),
      }));
      // Each save's revision, with its text only when it isn't the revision the browser says it has.
      // ponytail: the Engine's document list reads every save whole, so this spares the network, not the
      // Engine's reading; leaving the data out of that read needs the Engine to offer such a list.
      routes.post("/saves", async (request) => {
        const have = isRecord(request.body?.have) ? request.body.have : {};
        return {
          saves: Object.fromEntries(
            (await saveDocs()).map((doc) => [
              doc.data.key,
              have[doc.data.key] === doc.revision ? { revision: doc.revision } : { revision: doc.revision, value: doc.data.value },
            ]),
          ),
        };
      });
      routes.post("/save", async (request, reply) => {
        const body = isRecord(request.body) ? request.body : {};
        const key = typeof body.key === "string" ? body.key : "";
        if (!SAVE_KEY.test(key) || typeof body.value !== "string" || body.value.length > MAX_SAVE_CHARS)
          return reply.status(400).send({ error: "That isn't a Wanderworld save." });
        const id = docId("save", key);
        const existing = await documents.getById(PACKAGE_ID, id);
        if (!existing && (await documents.list(PACKAGE_ID, SAVE_KIND)).length >= MAX_SAVES)
          return reply.status(400).send({ error: "There are too many saved worlds: delete one first." });
        const data = { key, value: body.value };
        // A write that names the revision it was made from (null: none yet) is refused when another
        // browser has written this save since, and is told what's there now.
        if (body.revision !== undefined) {
          const conflict = async () => {
            const now = await documents.getById(PACKAGE_ID, id);
            return reply.status(409).send({
              error: "This save was written from another browser meanwhile.",
              conflict: { value: now?.data?.value ?? null, revision: now?.revision ?? null },
            });
          };
          if ((existing?.revision ?? null) !== body.revision) return conflict();
          const kept = await putDocument(documents, id, SAVE_KIND, key, data, existing).catch(() => null);
          return kept ? { ok: true, revision: kept.revision } : conflict();
        }
        // (A write from before revisions: two of one save can cross, so the later one is tried once more
        // against what's there now.)
        const kept = (await putDocument(documents, id, SAVE_KIND, key, data, existing)) ?? (await putDocument(documents, id, SAVE_KIND, key, data));
        if (!kept) return reply.status(409).send({ error: "The save was being written already: it will be tried again." });
        return { ok: true, revision: kept.revision };
      });
      routes.delete("/save/:key", async (request) => {
        const key = String(request.params?.key ?? "");
        const doc = SAVE_KEY.test(key) ? await documents.getById(PACKAGE_ID, docId("save", key)) : null;
        return { removed: doc?.kind === SAVE_KIND ? await removeDocument(documents, doc.id) : false };
      });

      routes.delete("/picture/:id", async (request) => {
        const doc = await documents.getById(PACKAGE_ID, idOf(request.params.id));
        return { removed: doc?.kind === PICTURE_KIND ? await removePicture(doc) : false };
      });

      // A scene's plan, written here so a Wanderworld scene starts without the Engine's dialog (whose
      // remembered choices come from other chats): the people there, the persona, the moment, the
      // world's notes, and the player's point of view, tense and instructions for this world.
      // Quartermaster's tracker with Wanderworld's model call: the client reads its prompt and the sheet
      // from Quartermaster, this asks the model, and the client hands the answer back to Quartermaster.
      routes.post("/inventory-track", async (request, reply) => {
        const body = isRecord(request.body) ? request.body : {};
        const input = {
          template: block(body.promptTemplate, 40000),
          context: block(body.context, 200000),
          name: text(body.personaName, MAX.name) || "the player",
          told: block(body.text, 8000),
          sheet: block(body.sheet, 6000), // (the character sheet's lines, when its tracker shares this call)
          itemStats: body.itemStats === true, // (told how item stats are written: the client's setting)
        };
        if (!input.template || !input.told) return reply.status(400).send({ error: "Nothing to read (promptTemplate, text)" });
        try {
          const model = await languageModels.resolveForRequest({ connectionId: idOf(body.connectionId) || undefined });
          const result = await askModel("inventory", body, model, inventoryMessages(input), { temperature: 0, maxTokens: input.sheet ? 2648 : 2048 });
          const data = readJson(result?.content, api.runtime.json?.parseJsonish);
          if (!data) return reply.status(502).send({ error: "The model's answer wasn't readable." });
          if (!input.sheet) return { data };
          return splitSheet(data);
        } catch (error) {
          logger.warn("[wanderworld] inventory tracking failed: %s", error?.message ?? error);
          return reply.status(502).send({ error: text(error?.message, 300) || "The model call failed." });
        }
      });

      // What's said in a fight, written by the model (Settings → Inventory → Combat). Only words: the game rolls.
      routes.post("/combat-line", async (request, reply) => {
        const body = isRecord(request.body) ? request.body : {};
        const input = {
          worldName: text(body.worldName, MAX.name),
          setting: text(body.setting, 600),
          speaker: text(body.speaker, 200) || "a fighter",
          talks: body.talks !== false,
          moment: text(body.moment, 200) || "the fight goes on",
          foe: text(body.foe, 200),
          recent: block(body.recent, 1500),
        };
        try {
          const model = await languageModels.resolveForRequest({ connectionId: idOf(body.connectionId) || undefined });
          const result = await askModel("combat-line", body, model, combatLineMessages(input), { temperature: 0.9, maxTokens: 120 });
          const line = checkCombatLine(readJson(result?.content, api.runtime.json?.parseJsonish));
          if (!line) return reply.status(502).send({ error: "The model's answer wasn't readable." });
          return { line };
        } catch (error) {
          logger.warn("[wanderworld] a line in a fight failed: %s", error?.message ?? error);
          return reply.status(502).send({ error: text(error?.message, 300) || "The model call failed." });
        }
      });

      // A creature's move on its turn, chosen by the model from the ones the client offers (by turns only).
      routes.post("/combat-move", async (request, reply) => {
        const body = isRecord(request.body) ? request.body : {};
        const options = (Array.isArray(body.options) ? body.options : [])
          .filter(isRecord)
          .slice(0, 16)
          .map((option) => ({ id: text(option.id, 80), says: text(option.says, 200) }))
          .filter((option) => option.id);
        if (!options.length) return reply.status(400).send({ error: "No moves to choose from" });
        const input = {
          worldName: text(body.worldName, MAX.name),
          setting: text(body.setting, 600),
          creature: text(body.creature, 200) || "a creature",
          talks: body.talks !== false,
          state: text(body.state, 300),
          foe: text(body.foe, 200) || "the player",
          recent: block(body.recent, 1500),
          talk: body.talk === true,
          options,
        };
        try {
          const model = await languageModels.resolveForRequest({ connectionId: idOf(body.connectionId) || undefined });
          const result = await askModel("combat-move", body, model, combatMoveMessages(input), { temperature: 0.6, maxTokens: 200 });
          return checkCombatMove(
            readJson(result?.content, api.runtime.json?.parseJsonish),
            options.map((option) => option.id),
          );
        } catch (error) {
          logger.warn("[wanderworld] choosing a move failed: %s", error?.message ?? error);
          return reply.status(502).send({ error: text(error?.message, 300) || "The model call failed." });
        }
      });

      // A shop's shelves written by the model, to fit the world. The client keeps them until it restocks.
      routes.post("/vendor-stock", async (request, reply) => {
        const body = isRecord(request.body) ? request.body : {};
        const input = {
          worldName: text(body.worldName, MAX.name),
          setting: text(body.setting, 600),
          shop: text(body.shop, MAX.name) || "a shop",
          kinds: text(body.kinds, 200) || "general store",
          currency: text(body.currency, 30) || "coins",
          usual: text(body.usual, 600),
          guidance: text(body.guidance, 1500),
        };
        try {
          const model = await languageModels.resolveForRequest({ connectionId: idOf(body.connectionId) || undefined });
          const result = await askModel("vendor-stock", body, model, vendorStockMessages(input), { temperature: 0.8, maxTokens: 1200 });
          const stock = checkStock(readJson(result?.content, api.runtime.json?.parseJsonish));
          if (stock.length < 3) return reply.status(502).send({ error: "The model's answer wasn't readable." });
          return { stock };
        } catch (error) {
          logger.warn("[wanderworld] stocking a shop failed: %s", error?.message ?? error);
          return reply.status(502).send({ error: text(error?.message, 300) || "The model call failed." });
        }
      });

      // A quest written by the model (Settings → Quests → The AI writes quests): one call, all its stages at
      // once. The client checks every name against its world before it's offered, and uses its own if not.
      routes.post("/quest-write", async (request, reply) => {
        const body = isRecord(request.body) ? request.body : {};
        const input = {
          worldName: text(body.worldName, MAX.name),
          setting: text(body.setting, 600),
          giver: text(body.giver, 200),
          premise: text(body.premise, 800),
          avoid: (Array.isArray(body.avoid) ? body.avoid : []).map((entry) => text(entry, 160)).filter(Boolean).slice(0, 4),
          lists: questLists(body.lists),
        };
        if (!input.lists.people.length) return reply.status(400).send({ error: "A quest needs someone in the world." });
        try {
          const model = await languageModels.resolveForRequest({ connectionId: idOf(body.connectionId) || undefined });
          const result = await askModel("quest-write", body, model, questWriteMessages(input), { temperature: 0.9, maxTokens: 700 });
          const quest = checkQuestWords(readJson(result?.content, api.runtime.json?.parseJsonish));
          if (!quest?.stages.length) return reply.status(502).send({ error: "The model's answer wasn't readable." });
          return { quest };
        } catch (error) {
          logger.warn("[wanderworld] writing a quest failed: %s", error?.message ?? error);
          return reply.status(502).send({ error: text(error?.message, 300) || "The model call failed." });
        }
      });

      // A quest gone wrong with no plan for it: one call for a new stage, or a line that ends it.
      routes.post("/quest-adapt", async (request, reply) => {
        const body = isRecord(request.body) ? request.body : {};
        const input = { quest: text(body.quest, 1500), happened: text(body.happened, 400), lists: questLists(body.lists) };
        if (!input.quest) return reply.status(400).send({ error: "No quest to change." });
        try {
          const model = await languageModels.resolveForRequest({ connectionId: idOf(body.connectionId) || undefined });
          const result = await askModel("quest-adapt", body, model, questAdaptMessages(input), { temperature: 0.7, maxTokens: 300 });
          const answer = checkQuestWords(readJson(result?.content, api.runtime.json?.parseJsonish));
          if (!answer || (!answer.stage && !answer.end)) return reply.status(502).send({ error: "The model's answer wasn't readable." });
          return answer.stage ? { stage: answer.stage, line: answer.line ?? "" } : { end: answer.end };
        } catch (error) {
          logger.warn("[wanderworld] changing a quest failed: %s", error?.message ?? error);
          return reply.status(502).send({ error: text(error?.message, 300) || "The model call failed." });
        }
      });

      // The character sheet kept by the model: what was just told, read against the sheet's lines; the
      // changes come back checked, for the client to apply to the sheet it holds.
      routes.post("/sheet-track", async (request, reply) => {
        const body = isRecord(request.body) ? request.body : {};
        const input = {
          name: text(body.personaName, MAX.name) || "the player",
          sheet: block(body.sheet, 6000),
          told: block(body.text, 8000),
        };
        if (!input.sheet || !input.told) return reply.status(400).send({ error: "Nothing to read (sheet, text)" });
        try {
          const model = await languageModels.resolveForRequest({ connectionId: idOf(body.connectionId) || undefined });
          const result = await askModel("sheet", body, model, sheetTrackMessages(input), { temperature: 0, maxTokens: 600 });
          const data = readJson(result?.content, api.runtime.json?.parseJsonish);
          if (!data) return reply.status(502).send({ error: "The model's answer wasn't readable." });
          return checkSheetChanges(data);
        } catch (error) {
          logger.warn("[wanderworld] sheet tracking failed: %s", error?.message ?? error);
          return reply.status(502).send({ error: text(error?.message, 300) || "The model call failed." });
        }
      });

      routes.post("/scene-plan", async (request, reply) => {
        const body = isRecord(request.body) ? request.body : {};
        const sceneContext = checkSceneContext(body.context);
        if (!sceneContext) return reply.status(400).send({ error: "A scene needs at least one character there." });
        const records = await resources.listCharacters(sceneContext.characterIds);
        const cast = records.map((record) => ({ id: record.id, ...characterCard(record) }));
        if (!cast.length) return reply.status(404).send({ error: "Those characters aren't in the Engine any more." });
        const [personaRecord] = sceneContext.personaId ? await resources.listPersonas([sceneContext.personaId]) : [];
        const persona = personaCard(personaRecord, text(body.personaName, MAX.name), body.worn, body.sheet);
        const initiator = cast.find((person) => person.id === idOf(body.initiatorId)) ?? cast[0];
        const pov = POVS[body.pov] ? body.pov : "second_person";
        const tense = TENSES[body.tense] ? body.tense : "present";
        const extra = block(body.instructions, 20000);
        const system = [
          "You plan a roleplay scene for Marinara Engine, starting from a moment in Wanderworld, a small world the player walks around in. Answer with one JSON object and nothing else.",
          section(
            "The people in it",
            cast
              .map((person) => `${person.name}: ${cardWords([person.description, person.personality, person.appearance], MAX.card, person.name, persona.name)}`)
              .join("\n\n"),
          ),
          section(`The player, ${persona.name}`, [cardWords([persona.description, persona.personality, persona.appearance], MAX.card, persona.name, persona.name), persona.worn].filter(Boolean).join("\n")),
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
          const result = await askModel("scene-plan", body, model,
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
