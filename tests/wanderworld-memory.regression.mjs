// Wanderworld's memories (src/memory.js): each person remembers only what they themselves saw, heard or
// were told; one can have something to bring up; and the model is told a person's own memories and
// nobody else's (server.mjs).
// Run: node tests/wanderworld-memory.regression.mjs
import assert from "node:assert/strict";
import { createMemories, heardBy, heardLines, MEMORY } from "../packages/wanderworld/src/memory.js";

const server = await import("../packages/wanderworld/server.mjs");

// ── Each their own ───────────────────────────────────────────────────────────
{
  const memories = createMemories();
  memories.remember(["mira"], 'Zoey said to you: "I found a key in the well."', 2, true);
  memories.remember(["mira", "tam"], "Mira and Tam spent time together at the tavern.", 2);
  memories.remember(["player"], "nothing is kept for the player", 2);
  assert.deepEqual(memories.of("mira"), [
    'Zoey said to you: "I found a key in the well."',
    "Mira and Tam spent time together at the tavern.",
  ]);
  assert.deepEqual(
    memories.of("tam"),
    ["Mira and Tam spent time together at the tavern."],
    "Tam wasn't told about the key",
  );
  assert.deepEqual(memories.of("rook"), [], "Rook was at neither");
  assert.deepEqual(memories.of("player"), []);
  // The same thing twice running is one memory.
  memories.remember(["tam"], "Mira and Tam spent time together at the tavern.", 2);
  assert.equal(memories.of("tam").length, 1);
  // Only so many are kept, the newest.
  for (let i = 0; i < 40; i++) memories.remember(["tam"], `Thing ${i}`, 3);
  assert.equal(memories.list("tam").length, MEMORY.EACH);
  assert.equal(memories.list("tam")[0].text, "Thing 39", "newest first, for showing");
  assert.equal(memories.of("tam", 3).at(-1), "Thing 39", "oldest first, for telling");
  // A long one is cut.
  memories.remember(["rook"], "x".repeat(900), 3);
  assert.equal(memories.of("rook")[0].length, MEMORY.TEXT);
}

// ── Something to bring up ────────────────────────────────────────────────────
{
  const memories = createMemories();
  assert.equal(memories.hasTopic("mira", 5), false);
  memories.remember(["mira"], "Mira and Tam spent time together.", 5);
  assert.equal(memories.hasTopic("mira", 5), false, "only something the player said is brought up");
  memories.remember(["mira"], 'Zoey said to you: "Meet me at the mill."', 5, true);
  assert.equal(memories.hasTopic("mira", 5), true);
  assert.equal(memories.hasTopic("tam", 5), false, "and only by the one it was said to");
  assert.match(memories.raise("mira", 6), /Meet me at the mill/u);
  assert.equal(memories.hasTopic("mira", 6), false, "once brought up, it isn't again");
  assert.equal(memories.raise("mira", 6), null);
  assert.equal(memories.of("mira").length, 2, "but it's still remembered");
  // Too long ago, it's let lie.
  memories.remember(["tam"], 'Zoey said to you: "Old news."', 1, true);
  assert.equal(memories.hasTopic("tam", 1 + MEMORY.TOPIC_DAYS + 1), false);
}

// ── Kept, and forgotten ──────────────────────────────────────────────────────
{
  const memories = createMemories();
  memories.remember(["mira"], 'Zoey said to you: "Hello."', 1, true);
  memories.raise("mira", 1);
  memories.remember(["tam"], "Tam saw the fire.", 1);
  const again = createMemories(JSON.parse(JSON.stringify(memories.state)));
  assert.deepEqual(again.of("mira"), memories.of("mira"));
  assert.equal(again.hasTopic("mira", 1), false, "what was brought up stays brought up");
  again.forget("mira");
  assert.deepEqual(again.of("mira"), []);
  assert.equal(again.of("tam").length, 1, "forgetting is one person's");
  again.forget();
  assert.equal(again.of("tam").length, 0);
  // A damaged copy is no memories, not a crash.
  assert.deepEqual(createMemories({ mira: "oops", tam: [{ text: 5 }, null, { text: "fine" }] }).of("tam"), ["fine"]);
  assert.deepEqual(createMemories(null).of("mira"), []);
}

// ── What the model is told ───────────────────────────────────────────────────
{
  const base = {
    character: server.characterCard({ id: "c", data: { name: "Mira", description: "A baker." } }),
    persona: { name: "Zoey", description: "", personality: "", appearance: "" },
    place: "",
    time: "",
    weather: "",
    nearby: "",
    relationship: "",
    setting: "",
    lore: [],
    history: [],
    line: "Morning.",
    length: "medium",
    style: "natural",
  };
  const told = (input) =>
    server
      .talkMessages(input)
      .map((message) => message.content)
      .join("\n");
  const withMemories = told({ ...base, memories: ['Zoey said to you: "I found a key in the well."'] });
  assert.match(withMemories, /## What Mira remembers/u);
  assert.match(withMemories, /I found a key in the well/u);
  assert.match(withMemories, /know nothing of what happened elsewhere/u, "and it's told that's all they know");
  assert.doesNotMatch(told({ ...base, memories: [] }), /remembers/u, "nothing remembered, nothing said of it");
  assert.doesNotMatch(told(base), /remembers/u);
  // In a moment, each listener's memories are their own line.
  const moment = server
    .momentMessages({
      persona: { name: "Zoey", card: "" },
      listeners: [
        {
          id: "mira",
          name: "Mira",
          distance: 2,
          doing: "",
          feeling: "",
          inParty: false,
          card: "",
          knows: ["(yesterday, heard) Zoey found a key.", "(today, was told by Tam) Zoey is new in town."],
        },
        { id: "tam", name: "Tam", distance: 3, doing: "", feeling: "", inParty: false, card: "", knows: [] },
      ],
      action: "",
      line: "Hello both.",
      voice: "talk",
      place: "",
      time: "",
      weather: "",
      setting: "",
      style: "natural",
      lore: [],
      recent: [],
      places: [],
      narrator: null,
    })
    .map((message) => message.content)
    .join("\n");
  // Each has their own entry, and what they know besides is under it and nobody else's.
  const mira = moment.slice(moment.indexOf('- id "mira"'), moment.indexOf('- id "tam"'));
  const tam = moment.slice(moment.indexOf('- id "tam"'), moment.indexOf("\n## ", moment.indexOf('- id "tam"')));
  assert.match(
    mira,
    /\n {2}Knows besides \(Mira alone\):\n {2}· \(yesterday, heard\) Zoey found a key\.\n {2}· \(today, was told by Tam\) Zoey is new in town\./u,
  );
  assert.doesNotMatch(tam, /key|Knows besides/u, "Tam's entry says nothing of what Mira knows");
  assert.match(moment, /Each of them knows what's in their own entry[^\n]*and nothing else/u);
}

// ── How and when they came by it, and things only seen ──────────────────────
{
  const memories = createMemories();
  memories.remember(["mira"], 'Zoey said: "Hello."', 4, true, "heard");
  memories.remember(["mira"], "Zoey got up on a horse.", 5, false, "saw");
  memories.remember(["mira"], "Zoey sold the mill.", 6, false, "told", "Corvin");
  memories.remember(["mira"], "An old one, from before.", 6);
  assert.deepEqual(memories.known("mira", 5, 6), [
    '(2 days ago, heard) Zoey said: "Hello."',
    "(yesterday, saw) Zoey got up on a horse.",
    "(today, was told by Corvin) Zoey sold the mill.",
    "(today) An old one, from before.",
  ]);
  assert.deepEqual(memories.known("tam"), []);
  // It's kept with the world, and a damaged copy loses only what's wrong.
  const again = createMemories({
    ...memories.state,
    tam: [{ day: 1, text: "Seen.", how: "smelled", from: 7 }],
  });
  assert.deepEqual(again.known("mira", 5, 6), memories.known("mira", 5, 6));
  assert.deepEqual(again.known("tam", 5, 1), ["(today) Seen."]);
  // Things only seen are kept to a few: the oldest sight goes, what was said stays.
  for (let i = 0; i < 9; i++) memories.remember(["rook"], `Zoey did thing ${i}.`, 1, false, "saw");
  memories.remember(["rook"], 'Zoey said: "Remember me."', 1, true, "heard");
  for (let i = 9; i < 12; i++) memories.remember(["rook"], `Zoey did thing ${i}.`, 1, false, "saw");
  const rook = memories.of("rook", 20);
  assert.equal(rook.filter((text) => text.includes("did thing")).length, MEMORY.SIGHTS);
  assert.ok(rook.includes('Zoey said: "Remember me."'));
  assert.equal(rook.at(-1), "Zoey did thing 11.");
}

// ── What mattered lasts: everyday memories come and go beside it ────────────
{
  const memories = createMemories();
  memories.remember(["mira"], "Camped with Zoey by a fire, at the Old Forest.", 2, false, "", "", true);
  memories.remember(["mira"], "Camped with Zoey by a fire, at the Old Forest.", 2, false, "", "", true);
  for (let i = 0; i < 40; i++) memories.remember(["mira"], `Small thing ${i}.`, 3 + i);
  assert.equal(memories.list("mira").length, MEMORY.EACH + 1, "the fire is still there after forty small things");
  const told = memories.known("mira", 3, 42);
  assert.deepEqual(told, [
    "(40 days ago) Camped with Zoey by a fire, at the Old Forest.",
    "(2 days ago) Small thing 37.",
    "(yesterday) Small thing 38.",
    "(today) Small thing 39.",
  ]);
  // Only other lasting ones push a lasting one out, and the model is told the newest few.
  for (let i = 0; i < 12; i++) memories.remember(["mira"], `Big thing ${i}.`, 50 + i, false, "", "", true);
  const lasting = memories.list("mira").filter((memory) => memory.kept);
  assert.equal(lasting.length, MEMORY.KEPT);
  assert.equal(lasting.at(-1).text, "Big thing 4.", "the oldest lasting ones went");
  assert.equal(memories.known("mira", 0, 70).length, MEMORY.KEPT_TOLD);
  // Pinned by hand, and let go again.
  assert.equal(memories.pin("mira", "Small thing 39.", 42), true);
  assert.equal(memories.list("mira").find((memory) => memory.text === "Small thing 39.").kept, true);
  assert.equal(memories.list("mira").filter((memory) => memory.kept).length, MEMORY.KEPT, "still no more than that");
  assert.equal(memories.pin("mira", "Small thing 39.", 42, false), true);
  assert.equal(memories.list("mira").find((memory) => memory.text === "Small thing 39.").kept, false);
  assert.equal(memories.pin("mira", "Never happened.", 1), false);
  // Kept with the world.
  const again = createMemories(memories.state);
  assert.deepEqual(again.list("mira"), memories.list("mira"));
}

// ── Gossip: first-hand things pass between two people, as hearsay, once ─────
{
  const memories = createMemories();
  memories.remember(["corvin"], 'Zoey said to you: "I sold the mill."', 5, true, "heard");
  memories.remember(["corvin"], 'Zoey whispered: "Don\'t trust Samuel."', 5, true, "heard");
  assert.equal(memories.pass("corvin", "mira", "Corvin", 6), 'Zoey said to Corvin: "I sold the mill."');
  assert.deepEqual(memories.known("mira", 5, 6), [
    '(today, was told by Corvin) Zoey said to Corvin: "I sold the mill."',
  ]);
  assert.equal(memories.pass("corvin", "mira", "Corvin", 6), null, "not twice, and never what was whispered");
  assert.equal(memories.pass("mira", "tam", "Mira", 6), null, "hearsay stops with whoever was told it");
  assert.equal(memories.pass("corvin", "player", "Corvin", 6), null);
  assert.equal(memories.pass("corvin", "corvin", "Corvin", 6), null);
  assert.equal(memories.pass("corvin", "tam", "Corvin", 20), null, "old news isn't passed on");
  // Someone who was there too isn't told what they already know.
  memories.remember(["rook", "tam"], "Zoey got up on a horse.", 6, false, "saw");
  assert.equal(memories.pass("rook", "tam", "Rook", 6), null);
  // Only a few things told are kept: the oldest hearsay goes first.
  for (let i = 0; i < 6; i++) {
    memories.remember(["rook"], `Zoey did thing ${i}.`, 6, false, "saw");
    memories.pass("rook", "ida", "Rook", 6);
  }
  assert.equal(memories.of("ida", 20).length, MEMORY.HEARSAY);
  assert.equal(memories.of("ida", 20).at(-1), "Zoey did thing 5.");
}

// ── Who heard what: "Just before" holds only what those here were in earshot of ──────────────────
{
  const log = [
    { who: "Zoey", text: "Hi, I'm Zoey", heard: ["samuel", "corvin"] },
    { who: "Samuel", text: "Nice to meet you.", heard: ["samuel", "corvin"] },
    { who: "Narrator", text: "You pass a stranger.", heard: [] },
    { who: "Zoey", text: "(whispers) Don't trust him.", heard: ["corvin"] },
    { who: "Narrator", text: "The forest is quiet." },
    { who: "Narrator", text: "A trail winds on." },
    { who: "Narrator", text: "Leaves stir." },
  ];
  const corvin = { id: "corvin", name: "Corvin" };
  const samuel = { id: "samuel", name: "Samuel" };
  const aldric = { id: "aldric", name: "Aldric" };
  const texts = (lines) => lines.map((line) => line.text);
  assert.deepEqual(
    heardLines(log, [aldric]),
    { shared: [], own: { aldric: [] } },
    "someone new knows nothing of what was said to others",
  );
  assert.deepEqual(
    texts(heardLines(log, [samuel]).shared),
    ["Hi, I'm Zoey", "Nice to meet you."],
    "nor the whisper he wasn't in earshot of, nor what only the player saw",
  );
  // What all of them heard is the shared conversation; what only some heard is theirs alone.
  const both = heardLines(log, [corvin, samuel]);
  assert.deepEqual(texts(both.shared), ["Hi, I'm Zoey", "Nice to meet you."]);
  assert.deepEqual(both.own, { corvin: [{ who: "Zoey", text: "(whispers) Don't trust him." }], samuel: [] });
  const mixed = heardLines(log, [corvin, aldric]);
  assert.deepEqual(mixed.shared, [], "Aldric heard none of it, so none of it is shared");
  assert.equal(mixed.own.corvin.length, 3);
  assert.deepEqual(mixed.own.aldric, []);
  assert.equal(heardLines(log, [corvin], 2).shared.length, 2, "the last few");
  assert.deepEqual(
    texts(heardLines(log, []).shared),
    ["The forest is quiet.", "A trail winds on.", "Leaves stir."],
    "nobody near: the narrator's own last lines",
  );
  assert.deepEqual(texts(heardBy(log, ["samuel", "aldric"])), ["Hi, I'm Zoey", "Nice to meet you."], "a scene's cast");
  assert.deepEqual(heardBy(log, ["aldric"]), []);
  // And the server says so.
  const said = (recent, listeners) =>
    server.momentMessages({
      persona: { name: "Zoey", card: "" },
      listeners,
      action: "waves",
      line: "",
      voice: "talk",
      lore: [],
      recent,
      places: [],
    })[0].content;
  const here = [{ id: "corvin", name: "Corvin", distance: 2, doing: "" }];
  const prompt = said(heardLines(log, [corvin, samuel]).shared, here);
  assert.match(prompt, /## Just before\n\(What every one of them saw and heard, in order\.\)\nZoey: Hi, I'm Zoey\n/u);
  assert.doesNotMatch(prompt, /stranger|forest|trust/u);
  assert.match(said(heardLines(log, []).shared, []), /## Just before\n\(What you told last/u);
  assert.doesNotMatch(said([], here), /Just before/u, "nothing heard: no section");
}

console.log("wanderworld memory regression: OK");
