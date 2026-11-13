// Wanderworld's memories (src/memory.js): each person remembers only what they themselves saw, heard or
// were told; one can have something to bring up; and the model is told a person's own memories and
// nobody else's (server.mjs).
// Run: node tests/wanderworld-memory.regression.mjs
import assert from "node:assert/strict";
import { createMemories, heardBy, heardLines, MEMORY, toldShares } from "../packages/wanderworld/src/memory.js";

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
  assert.equal(memories.known("mira", 0, 70).length, 4);
  assert.equal(memories.known("mira", 0, 70, MEMORY.KEPT).length, MEMORY.KEPT, "as many lasting ones as asked for");
  assert.equal(memories.known("mira", 2, 70, 0).length, 2, "or none");
  // Pinned by hand: locked. Nothing pushes it out, whatever else is remembered; only its age moves on.
  assert.equal(memories.pin("mira", "Small thing 39.", 42), true);
  const pinned = () => memories.list("mira").find((memory) => memory.text === "Small thing 39.");
  assert.equal(pinned().pinned, true);
  for (let i = 0; i < 60; i++) {
    memories.remember(["mira"], `Later small thing ${i}.`, 100 + i);
    memories.remember(["mira"], `Later big thing ${i}.`, 100 + i, false, "", "", true);
  }
  assert.equal(pinned()?.pinned, true, "still there after a hundred and twenty newer memories");
  assert.equal(pinned().day, 42, "and as it was");
  assert.equal(memories.known("mira", 0, 142)[0], "(100 days ago) Small thing 39.", "told first, with its age");
  const counts = () => {
    const all = memories.list("mira");
    return [
      all.filter((memory) => memory.pinned).length,
      all.filter((memory) => memory.kept && !memory.pinned).length,
      all.filter((memory) => !memory.kept && !memory.pinned).length,
    ];
  };
  assert.deepEqual(counts(), [1, MEMORY.KEPT, MEMORY.EACH], "it doesn't count against the others");
  assert.equal(memories.pin("mira", "Never happened.", 1), false);
  // Written by hand: pinned from the start. Reworded, and deleted.
  assert.equal(memories.note("mira", "  Zoey   saved her life once. ", 142), true);
  assert.deepEqual(memories.list("mira")[0], { day: 142, text: "Zoey saved her life once.", kept: true, pinned: true });
  assert.equal(memories.note("player", "nothing", 1), false);
  assert.equal(
    memories.edit("mira", "Zoey saved her life once.", 142, "Zoey pulled her from the river."),
    "Zoey pulled her from the river.",
  );
  assert.equal(memories.list("mira")[0].text, "Zoey pulled her from the river.");
  assert.equal(memories.list("mira")[0].pinned, true, "still pinned");
  assert.equal(memories.edit("mira", "No such memory.", 1, "x"), null);
  assert.equal(memories.edit("mira", "Zoey pulled her from the river.", 142, "   "), null, "not to nothing");
  assert.equal(memories.remove("mira", "Zoey pulled her from the river.", 142), true);
  assert.equal(memories.remove("mira", "Zoey pulled her from the river.", 142), false);
  assert.deepEqual(counts(), [1, MEMORY.KEPT, MEMORY.EACH]);
  // Unpinned, it's an everyday memory again, and the oldest of those goes.
  assert.equal(memories.pin("mira", "Small thing 39.", 42, false), true);
  assert.equal(pinned(), undefined, "the oldest everyday one, so it went");
  // Only so many can be pinned.
  for (let i = 0; i < MEMORY.PINNED + 5; i++) memories.note("tam", `Pinned ${i}.`, i);
  assert.equal(memories.list("tam").length, MEMORY.PINNED);
  assert.equal(memories.known("tam", 5, 40).length, MEMORY.PINNED_TOLD);
  // Kept with the world.
  const again = createMemories(memories.state);
  assert.deepEqual(again.list("mira"), memories.list("mira"));
  assert.deepEqual(again.list("tam"), memories.list("tam"));
}

// ── How many are sent: a count shared between the people spoken for ──────────
{
  assert.deepEqual(toldShares(["a", "b"], 20), { a: 10, b: 10 });
  assert.deepEqual(toldShares(["a", "b", "c"], 20), { a: 7, b: 7, c: 7 }, "rounded up");
  assert.deepEqual(toldShares(["a"], 12), { a: 12 }, "one person has it all");
  // A number of their own is theirs whatever the split, and the others' share is as it would have been.
  assert.deepEqual(toldShares(["a", "b", "c"], 20, { c: 10 }), { a: 7, b: 7, c: 10 });
  assert.deepEqual(toldShares(["a", "b", "c"], 20, { c: 0 }), { a: 7, b: 7, c: 0 });
  // Counted, it comes out of the shared count first.
  assert.deepEqual(toldShares(["a", "b", "c"], 20, { c: 10 }, true), { a: 5, b: 5, c: 10 });
  assert.deepEqual(toldShares(["a", "b", "c"], 20, { c: 15 }, true), { a: 3, b: 3, c: 15 });
  assert.deepEqual(toldShares(["a", "b"], 20, { a: 30 }, true), { a: 30, b: 0 }, "nothing left is nothing");
  assert.deepEqual(toldShares(["a", "b"], 20, { a: 4, b: 6 }, true), { a: 4, b: 6 });
  // Someone else's number is nothing to those here; nonsense is no number.
  assert.deepEqual(toldShares(["a", "b"], 20, { z: 40, a: undefined, b: "9" }, true), { a: 10, b: 10 });
  assert.deepEqual(toldShares(["a", "b"], 0), { a: 0, b: 0 });
  assert.deepEqual(toldShares(["a"], undefined), { a: 0 });
  assert.deepEqual(toldShares([], 20), {});
  // Someone with fewer than their share has what they have, and the rest of it goes to the others.
  assert.deepEqual(toldShares(["a", "b", "c"], 20, {}, false, { a: 3, b: 50, c: 50 }), { a: 3, b: 9, c: 9 });
  assert.deepEqual(toldShares(["a", "b", "c"], 20, {}, false, { a: 3, b: 5, c: 50 }), { a: 3, b: 5, c: 12 });
  assert.deepEqual(toldShares(["a", "b"], 20, {}, false, { a: 2, b: 4 }), { a: 2, b: 4 }, "no more than there is");
  assert.deepEqual(toldShares(["a", "b", "c"], 20, {}, false, { a: 7, b: 7, c: 7 }), { a: 7, b: 7, c: 7 });
  // Beside a number of someone's own: the others' shares, and what one of them leaves, are theirs.
  assert.deepEqual(toldShares(["a", "b", "c"], 20, { c: 10 }, false, { a: 3, b: 50, c: 50 }), { a: 3, b: 11, c: 10 });
  // Counted, a number of their own takes only what they have to send.
  assert.deepEqual(toldShares(["a", "b", "c"], 20, { c: 10 }, true, { a: 50, b: 50, c: 4 }), { a: 8, b: 8, c: 10 });
  // All: everything each has.
  assert.deepEqual(toldShares(["a", "b"], MEMORY.ALL), { a: Infinity, b: Infinity });
  assert.deepEqual(toldShares(["a", "b"], 20, { a: MEMORY.ALL }), { a: Infinity, b: 10 });
  assert.deepEqual(toldShares(["a", "b"], 20, { a: MEMORY.ALL }, true, { a: 6, b: 50 }), { a: Infinity, b: 14 });
}

// ── All: nothing pushed out, and all of it told (none twice) ─────────────────
{
  const memories = createMemories({}, () => ({ each: MEMORY.ALL, kept: MEMORY.ALL }));
  for (let i = 0; i < 150; i++) {
    memories.remember(["mira"], `Small ${i}.`, i);
    memories.remember(["mira"], `Big ${i}.`, i, false, "", "", true);
  }
  for (let i = 0; i < 10; i++) memories.pin("mira", `Big ${i}.`, i);
  assert.equal(memories.list("mira").length, 300, "past the sliders' hundred, nothing has gone");
  assert.equal(createMemories(memories.state).list("mira").length, 300, "nor when the world is opened again");
  const told = memories.known("mira", Infinity, 200, Infinity);
  assert.equal(told.length, 300, "all of them: what's pinned, what lasted, the everyday");
  assert.equal(new Set(told).size, told.length, "none twice");
  const some = memories.known("mira", 5, 200, 5);
  assert.equal(some.length, MEMORY.PINNED_TOLD + 5 + 5);
  assert.equal(new Set(some).size, some.length, "a pinned memory isn't among the lasting ones as well");
}

// ── All has no ceiling, kept or told ─────────────────────────────────────────
{
  const all = { each: MEMORY.ALL, kept: MEMORY.ALL };
  const memories = createMemories({}, () => all);
  for (let i = 0; i < 1500; i++) memories.remember(["mira"], `Small ${i}.`, i);
  assert.equal(memories.list("mira").length, 1500);
  const opened = createMemories(
    { mira: Array.from({ length: 2500 }, (_, i) => ({ day: i, text: `Small ${i}.` })) },
    () => all,
  );
  assert.equal(opened.list("mira").length, 2500, "nor is any cut when the world is opened");
  assert.equal(memories.known("mira", Infinity, 2000, Infinity).length, 1500, "and all is all that's told");
}

// ── How many each person keeps: the setting's numbers, or their own ──────────
{
  const limits = { each: 5, kept: 2 };
  const own = { nan: { each: 20 }, odd: { each: "many", kept: -4 } };
  const memories = createMemories({}, (id) => ({ ...limits, ...(own[id] ?? {}) }));
  const fill = (id) => {
    for (let i = 0; i < 30; i++) {
      memories.remember([id], `Small ${i}.`, i);
      memories.remember([id], `Big ${i}.`, i, false, "", "", true);
    }
    const all = memories.list(id);
    return [all.filter((memory) => !memory.kept).length, all.filter((memory) => memory.kept).length];
  };
  assert.deepEqual(fill("tam"), [5, 2], "the setting's numbers");
  assert.deepEqual(fill("nan"), [20, 2], "family who remember more");
  assert.deepEqual(fill("odd"), [MEMORY.EACH, 0], "a number that isn't one is the usual; none below nothing");
  // Turned down, it takes hold when they next remember something; nothing pinned is lost.
  memories.pin("nan", "Small 29.", 29);
  limits.each = 4;
  delete own.nan;
  memories.remember(["nan"], "One more.", 31);
  const nan = memories.list("nan");
  assert.equal(nan.filter((memory) => !memory.kept && !memory.pinned).length, 4);
  assert.ok(nan.some((memory) => memory.text === "Small 29." && memory.pinned));
  // With nothing said, the usual numbers.
  const plain = createMemories();
  for (let i = 0; i < 30; i++) plain.remember(["a"], `Small ${i}.`, i);
  assert.equal(plain.list("a").length, MEMORY.EACH);
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
