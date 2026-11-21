// Wanderworld quests (quests.js), played in a pretend world: every built-in quest can be finished, its
// stages advance one at a time, its failure branches resolve to an end, an AI-shaped quest with names
// the world hasn't got is repaired or turned down, quests from lore work without the AI, the save keeps
// them, a quest's region is given its purpose and keeps it, and the creatures a quest owns stay through
// a respawn. Run: node tests/wanderworld-quests.regression.mjs
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// (The herd builds bodies from the kit on disk, as wanderworld-animals.regression.mjs does.)
const kit = join(dirname(fileURLToPath(import.meta.url)), "../packages/wanderworld/kit/creatures");
globalThis.fetch = async (url) => {
  const name = String(url).split("/kit/")[1];
  try {
    return new Response(await readFile(join(kit, "..", name)), { status: 200 });
  } catch {
    return new Response("missing", { status: 404 });
  }
};
const context = new Proxy(
  { measureText: (text) => ({ width: String(text).length * 14 }) },
  { get: (target, key) => target[key] ?? (() => ({ addColorStop() {} })), set: () => true },
);
const image = () => ({ addEventListener() {}, removeEventListener() {}, setAttribute() {}, style: {} });
globalThis.document = {
  createElement: () => ({ getContext: () => context, width: 0, height: 0, ...image() }),
  createElementNS: image,
};

const {
  ARCHETYPES,
  accept,
  builtInQuest,
  captivesAt,
  captiveSpot,
  checkQuest,
  checkQuests,
  errandQuest,
  errandRecord,
  giveUp,
  loreQuest,
  moveOn,
  needsCave,
  questCheck,
  questEvent,
  questFromWords,
  questLine,
  questSpawns,
  questsFromLore,
  questTarget,
  questView,
  rememberParts,
  simulateQuest,
  spawnKeep,
  stageOf,
} = await import("../packages/wanderworld/src/quests.js");
const { checkWorld } = await import("../packages/wanderworld/src/saves.js");
const { purposeAhead } = await import("../packages/wanderworld/src/factions.js");
const { readKeys } = await import("../packages/wanderworld/src/keywords.js");
const { createHerd } = await import("../packages/wanderworld/src/herd.js");
const { createWorld } = await import("../packages/wanderworld/src/world.js");
const { cavePlan } = await import("../packages/wanderworld/src/deepcave.js");
const { dungeonPlan } = await import("../packages/wanderworld/src/dungeon.js");

// ── A pretend world ──
const person = (id, name, place, placeName, x, z, faction = "") => ({ id, name, place, placeName, x, z, faction });
const WORLD = {
  seed: "test-world",
  region: "0,0",
  regionName: "Ashdown",
  now: 100,
  level: 2,
  people: [
    person("mira", "Mira", "building:1", "the Golden Goose", 10, 4, "faction:millers"),
    person("tam", "Tam", "building:2", "the smithy", -12, 6),
    person("fen", "Fen", "building:3", "the mill", 30, -20),
    person("ada", "Ada", "building:4", "the bakery", 4, -14),
    person("bo", "Bo", "building:5", "the chapel", -20, -20),
  ],
  cast: ["mira", "tam", "fen", "ada", "bo"],
  places: [
    { id: "building:1", name: "the Golden Goose", kind: "tavern", x: 10, z: 4 },
    { id: "building:2", name: "the smithy", kind: "smithy", x: -12, z: 6 },
    { id: "building:3", name: "the mill", kind: "mill", x: 30, z: -20 },
    { id: "plaza", name: "the market square", kind: "plaza", x: 0, z: 0 },
  ],
  wilds: [
    { id: "meadow:0", name: "Long Meadow", kind: "meadow", x: 90, z: 40 },
    { id: "outpost:2", name: "the old stones", kind: "stones", x: -100, z: 70 },
  ],
  creatures: [
    { kind: "wolf", name: "wolf", cr: 0.25 },
    { kind: "goblin", name: "goblin", cr: 0.25 },
    { kind: "ogre", name: "ogre", cr: 2 },
  ],
  gatherables: [
    { name: "Firewood", how: "chop wood at a tree" },
    { name: "Stone", how: "mine at a rock" },
  ],
  items: true,
  caves: [{ id: 3, name: "Blackmouth Cave", x: 120, z: -80 }],
  ahead: [{ side: "east", key: "1,0", name: "Eastmarch", kind: "stronghold", faction: "", way: "east" }],
  fights: true,
  deep: true,
  travel: true,
  failures: true,
  timeLimits: true,
};

const begin = (quest) => accept(quest, WORLD.now);

// ── Every built-in quest can be finished: every archetype, many seeds ──
const made = new Map(ARCHETYPES.map((kind) => [kind, 0]));
for (let key = 0; key < 120; key++) {
  const quest = builtInQuest(`k${key}`, WORLD, { recent: [] });
  assert.ok(quest, `a quest for key ${key}`);
  assert.equal(quest.state, "offered");
  made.set(quest.parts.archetype, made.get(quest.parts.archetype) + 1);
  assert.ok(checkQuest(quest, WORLD).quest, `${quest.title}: checks out before it's offered`);
  const { quest: end, steps } = simulateQuest(begin(quest), WORLD);
  assert.equal(end.state, "done", `${quest.title} (${quest.parts.archetype}) plays to its end: ${steps.join(" → ")}`);
  assert.ok(end.log.length >= new Set(steps).size, "and the Journal kept what happened");
}
for (const [kind, count] of made) assert.ok(count > 0, `the built-in quests include ${kind} (${count})`);
// For one archetype at a time, too.
for (const kind of ARCHETYPES) {
  const quest = builtInQuest(`only-${kind}`, WORLD, { only: [kind] });
  assert.equal(quest?.parts.archetype, kind, `a ${kind} quest when only that's asked for`);
  assert.equal(simulateQuest(begin(quest), WORLD).quest.state, "done", `${kind}: done`);
}
// The same key, the same quest; the recent parts steer the next one elsewhere.
assert.deepEqual(builtInQuest("same", WORLD), builtInQuest("same", WORLD));
{
  let recent = [];
  const kinds = [];
  for (let n = 0; n < 6; n++) {
    const quest = builtInQuest(`row${n}`, WORLD, { recent });
    kinds.push(quest.parts.archetype);
    recent = rememberParts(recent, quest.parts);
  }
  for (let n = 1; n < kinds.length; n++)
    assert.notEqual(kinds[n], kinds[n - 1], `no archetype twice in a row: ${kinds}`);
}
// Nothing to make a quest of: none, rather than one that can't be done.
assert.equal(builtInQuest("empty", { ...WORLD, people: [] }), null);
{
  const bare = { ...WORLD, wilds: [], creatures: [], items: false, caves: [], ahead: [], fights: false, deep: false };
  for (let key = 0; key < 30; key++) {
    const quest = builtInQuest(`bare${key}`, bare);
    assert.ok(["word", "investigate"].includes(quest.parts.archetype), "only what needs nothing more");
    assert.equal(simulateQuest(begin(quest), bare).quest.state, "done");
  }
}

// ── Stages advance one at a time, and only on the right thing ──
{
  const quest = begin(builtInQuest("hunt", WORLD, { only: ["hunt"] }));
  const goal = stageOf(quest).goal;
  assert.equal(goal.verb, "defeat");
  const far = questEvent(
    quest,
    { type: "beat", kind: goal.creature, id: "beast-1", region: "0,0", x: goal.x + 500, z: goal.z },
    WORLD,
  );
  assert.equal(far.quest, quest, "one beaten far away doesn't count");
  const other = questEvent(
    quest,
    { type: "beat", kind: "rat", id: "beast-2", region: "0,0", x: goal.x, z: goal.z },
    WORLD,
  );
  assert.equal(other.quest, quest, "nor one of another kind");
  let now = quest;
  for (let n = 1; n < goal.count; n++) {
    now = questEvent(
      now,
      { type: "beat", kind: goal.creature, id: `beast-${n}`, region: "0,0", x: goal.x + 3, z: goal.z },
      WORLD,
    ).quest;
    assert.equal(stageOf(now).goal.got, n, `${n} of ${goal.count}`);
    assert.match(questLine(now), new RegExp(`${n} of ${goal.count}`), "the line on screen counts");
  }
  now = questEvent(
    now,
    { type: "beat", kind: goal.creature, id: `lore:quest:${quest.id}:s1:0`, region: "0,0", x: 0, z: 0 },
    WORLD,
  ).quest;
  assert.equal(now.at, "s2", "one of the quest's own counts wherever it's beaten, and the last moves it on");
  assert.equal(
    questEvent(now, { type: "talk", person: "tam" }, WORLD).quest,
    now,
    "talking to someone else does nothing",
  );
  const done = questEvent(now, { type: "talk", person: quest.giver }, WORLD).quest;
  assert.equal(done.state, "done");
  assert.ok(stageOf(done) === null && done.stages.filter((stage) => !stage.branch).every((stage) => stage.done));
}
{
  // Bring: talking to them without the things wanted says how many you have, and with them takes them.
  const quest = begin(builtInQuest("supply", WORLD, { only: ["supply"] }));
  const { item, count } = stageOf(quest).goal;
  const name = item.toLowerCase();
  let now = questEvent(quest, { type: "have", have: { [name]: count - 1 } }, WORLD).quest;
  assert.equal(now.at, "s1", "not enough yet");
  now = questEvent(now, { type: "have", have: { [name]: count } }, WORLD).quest;
  assert.equal(now.at, "s2", "enough gathered");
  const short = questEvent(now, { type: "talk", person: quest.giver, have: { [name]: 0 } }, WORLD);
  assert.equal(short.quest, now);
  assert.match(short.lines[0], /you have 0 of the/u);
  const handed = questEvent(now, { type: "talk", person: quest.giver, have: { [name]: count + 2 } }, WORLD);
  assert.deepEqual(handed.take, [{ item, count }], "they take what was asked for, no more");
  assert.equal(handed.quest.state, "done");
}
{
  // Rescue: freeing the captive is what moves it on, and the captive is held in the quest's cave.
  const quest = begin(builtInQuest("rescue", WORLD, { only: ["rescue"] }));
  const captive = quest.owned[0];
  assert.equal(captive.kind, "captive");
  assert.ok(needsCave([quest], "0,0", captive.cave), "its cave always leads down while it's needed");
  assert.deepEqual(
    captivesAt([quest], "0,0", captive.cave, 1).map((entry) => entry.name),
    [captive.name],
    "held on the first level",
  );
  assert.equal(captivesAt([quest], "0,0", captive.cave, 2).length, 0);
  const freed = questEvent(quest, { type: "free", captive: captive.id }, WORLD).quest;
  assert.equal(freed.at, "s2");
  assert.equal(freed.owned[0].freed, true);
  assert.equal(captivesAt([freed], "0,0", captive.cave, 1).length, 0, "and isn't there any more");
}
{
  // Where a captive is held: a gaol's cell in a stronghold, else as far in as the level goes.
  for (let seed = 1; seed < 8; seed++) {
    const keep = dungeonPlan(seed, 1, "stronghold");
    const cell = keep.spawns.find((spawn) => spawn.tag === "captive");
    if (cell) assert.deepEqual(captiveSpot(keep), { x: cell.x, z: cell.z }, "a stronghold's captive sits in a cell");
    const cave = cavePlan(seed, 1);
    const spot = captiveSpot(cave);
    assert.ok(Number.isFinite(spot.x) && Number.isFinite(spot.z), "a cave has somewhere to hold one");
  }
}
{
  // The waypoint: a person where they are now, a place where it is, another region by its key.
  const quest = begin(builtInQuest("scout", WORLD, { only: ["scout"] }));
  assert.deepEqual(questTarget(quest, WORLD), { region: "1,0", away: true });
  const there = questEvent(quest, { type: "at", region: "1,0", zone: "", x: 0, z: 0 }, WORLD).quest;
  assert.notEqual(there.at, quest.at, "arriving in the region does it");
  const deep = stageOf(there).goal;
  assert.equal(deep.verb, "deep", "then in at its gate");
  assert.equal(
    questEvent(there, { type: "deep", region: "0,0", cave: 3, depth: 1 }, WORLD).quest,
    there,
    "not a cave at home",
  );
  const inside = questEvent(there, { type: "deep", region: "1,0", cave: 0, depth: 1 }, WORLD).quest;
  assert.equal(stageOf(inside).goal.verb, "talk", "any way in there will do");
  const word = begin(builtInQuest("word", WORLD, { only: ["word"] }));
  const target = questTarget(word, { ...WORLD, people: WORLD.people.map((entry) => ({ ...entry, x: 1, z: 2 })) });
  assert.deepEqual(target, { region: "0,0", x: 1, z: 2 }, "a person is wherever they are now");
}

// ── Failure branches resolve: every stage failed, each quest still ends ──
for (let key = 0; key < 60; key++) {
  const quest = begin(builtInQuest(`f${key}`, WORLD));
  for (const stage of quest.stages.filter((entry) => !entry.branch)) {
    const { quest: end } = simulateQuest(quest, WORLD, { failAt: [stage.id] });
    assert.ok(
      ["done", "failed"].includes(end.state),
      `${quest.title}: failing ${stage.id} still ends it (${end.state})`,
    );
  }
  // With failure branches off, a failed stage ends the quest.
  const plain = { ...WORLD, failures: false };
  const first = quest.stages[0];
  assert.equal(simulateQuest(quest, plain, { failAt: [first.id] }).quest.state, "failed");
}
{
  // The witness is deleted in the Engine: someone else saw it too, and the quest goes on.
  const quest = begin(builtInQuest("word", WORLD, { only: ["word"] }));
  const witness = stageOf(quest).goal.person;
  const gone = {
    ...WORLD,
    cast: WORLD.cast.filter((id) => id !== witness),
    people: WORLD.people.filter((entry) => entry.id !== witness),
  };
  const checked = questCheck(quest, gone);
  assert.equal(checked.quest.at, "s1b", "a branch: ask someone else");
  assert.equal(checked.adapt, false);
  assert.equal(simulateQuest(checked.quest, gone).quest.state, "done", "and it can still be finished");
}
{
  // The giver is gone at the end: their kin hears it instead, and it's done.
  const quest = begin(builtInQuest("hunt", WORLD, { only: ["hunt"] }));
  const atLast = questEvent(
    quest,
    { type: "beat", kind: stageOf(quest).goal.creature, id: `lore:quest:${quest.id}:s1:0`, region: "0,0" },
    WORLD,
  );
  let now = atLast.quest;
  while (stageOf(now)?.goal.verb === "defeat")
    now = questEvent(
      now,
      { type: "beat", kind: stageOf(now).goal.creature, id: `lore:quest:${quest.id}:s1:1`, region: "0,0" },
      WORLD,
    ).quest;
  const gone = { ...WORLD, cast: WORLD.cast.filter((id) => id !== quest.giver) };
  const kin = questCheck(now, gone).quest;
  assert.equal(kin.at, "kin");
  assert.equal(simulateQuest(kin, gone).quest.state, "done");
}
{
  // The wrong name at a choice: the quest goes wrong, and ends (failed) once it's made right.
  const quest = begin(builtInQuest("inv", WORLD, { only: ["investigate"] }));
  let now = quest;
  while (stageOf(now).goal.verb !== "choose")
    now = questEvent(now, { type: "talk", person: stageOf(now).goal.person }, WORLD).quest;
  const wrong = stageOf(now).goal.options.findIndex((option) => option.fail);
  const named = questEvent(now, { type: "choose", option: wrong }, WORLD);
  assert.match(named.lines[0], /wrong answer/u);
  assert.equal(stageOf(named.quest).goal.verb, "talk", "make it right with them");
  const end = simulateQuest(named.quest, WORLD).quest;
  assert.equal(end.state, "failed", "it ends, failed, but it ends");
  const right = stageOf(now).goal.options.findIndex((option) => !option.fail);
  assert.equal(
    simulateQuest(questEvent(now, { type: "choose", option: right }, WORLD).quest, WORLD).quest.state,
    "done",
  );
  assert.ok(questView(now).choose.length === 3, "the Journal offers the three names");
}
{
  // Time limits: past it, the quest takes its "too late" branch; with time limits off it waits.
  let quest = null;
  for (let key = 0; key < 200 && !quest; key++) {
    const made = builtInQuest(`hurry${key}`, WORLD);
    if (made.stages[0].by) quest = begin(made);
  }
  assert.ok(quest, "some quests can't wait");
  const late = { ...WORLD, now: quest.stages[0].by + 1 };
  assert.equal(questCheck(quest, late).quest.at, "late");
  assert.equal(simulateQuest(questCheck(quest, late).quest, late).quest.state, "failed", "too late, it ends failed");
  assert.equal(questCheck(quest, { ...late, timeLimits: false }).quest, quest, "time limits off: no hurry");
  assert.equal(questCheck(quest, WORLD).quest, quest, "in time: nothing changes");
}
{
  // A place gone is swapped for the nearest of its kind; a cave gone, for another; with none, it fails.
  const quest = begin(builtInQuest("word", WORLD, { only: ["word"] }));
  const atPlace = questEvent(quest, { type: "talk", person: stageOf(quest).goal.person }, WORLD).quest;
  const goal = stageOf(atPlace).goal;
  const moved = {
    ...WORLD,
    places: WORLD.places
      .filter((place) => place.id !== goal.place)
      .concat({
        id: "building:9",
        name: "the new mill",
        kind: WORLD.places.find((place) => place.id === goal.place).kind,
        x: 0,
        z: 9,
      }),
  };
  const swapped = questCheck(atPlace, moved).quest;
  assert.equal(stageOf(swapped).goal.place, "building:9", "swapped for one of the same kind");
  assert.match(stageOf(swapped).text, /the new mill/u);
  const delve = begin(builtInQuest("delve", WORLD, { only: ["delve"] }));
  const closed = questCheck(delve, { ...WORLD, deep: false });
  assert.equal(closed.quest.state, "failed", "deep places switched off: it can't be done, so it ends");
  assert.equal(closed.adapt, true, "with no branch for it (the AI can be asked to adapt)");
}

// ── Give up, and errands as one-stage quests ──
{
  const quest = begin(builtInQuest("g", WORLD));
  assert.equal(giveUp(quest).state, "given up");
  const errand = {
    id: "errand-1",
    person: "tam",
    place: "building:2",
    text: "Take Tam his parcel.",
    done: "Tam thanks you.",
  };
  const one = errandQuest(errand);
  assert.equal(one.stages.length, 1);
  assert.equal(questEvent(one, { type: "talk", person: "tam" }, WORLD).quest.state, "done");
  assert.equal(errandRecord(errand, "done", 5, "Done.").state, "done");
}

// ── AI-shaped quests: checked against the world, repaired or turned down ──
{
  const good = questFromWords(
    {
      title: "The goblin trouble",
      intro: "Goblins again.",
      stages: [
        { verb: "talk", target: "Tam", text: "Ask Tam where they were seen." },
        { verb: "defeat", target: "goblins", count: 9, near: "Long Meadow" },
        { verb: "gather", target: "firewood", count: 2 },
        { verb: "rescue", target: "Blackmouth", text: "Free Wat." },
      ],
      captive: "Wat",
      archetype: "hunt",
    },
    WORLD,
    { giver: "mira", key: "a1" },
  );
  assert.ok(good.quest, `a quest on names the world has: ${good.why}`);
  const goals = good.quest.stages.map((stage) => stage.goal);
  assert.equal(goals[1].creature, "goblin", "goblins: the goblin");
  assert.equal(goals[1].count, 4, "and no more than four");
  assert.equal(goals[2].item, "Firewood");
  assert.equal(good.quest.owned[0].name, "Wat", "the captive is the quest's own");
  assert.equal(goals.at(-1).person, "mira", "it ends back with whoever asked");
  assert.equal(simulateQuest(begin(good.quest), WORLD).quest.state, "done");
  // A person the world hasn't got: turned down. A place it hasn't got, close enough: matched.
  assert.equal(questFromWords({ stages: [{ verb: "talk", target: "Lord Vexmoor" }] }, WORLD).quest, null);
  assert.equal(
    questFromWords({ stages: [{ verb: "dance", target: "Tam" }] }, WORLD).quest,
    null,
    "a verb it can't check",
  );
  assert.equal(questFromWords({ stages: [] }, WORLD).quest, null);
  assert.equal(questFromWords("nonsense", WORLD).quest, null);
  const close = questFromWords(
    {
      stages: [
        { verb: "go", target: "The Smithy" },
        { verb: "go", target: "mill" },
      ],
    },
    WORLD,
  );
  assert.deepEqual(
    close.quest.stages.map((stage) => stage.goal.place),
    ["building:2", "building:3"],
    "the smithy, and the mill by its kind",
  );
  // Things the settings rule out are turned down, so nothing unfinishable is ever offered.
  assert.equal(
    questFromWords({ stages: [{ verb: "gather", target: "Firewood" }] }, { ...WORLD, items: false }).quest,
    null,
  );
  assert.equal(
    questFromWords({ stages: [{ verb: "deep", target: "Blackmouth Cave" }] }, { ...WORLD, deep: false }).quest,
    null,
  );
  const region = questFromWords({ stages: [{ verb: "region", target: "east: Eastmarch" }] }, WORLD);
  assert.deepEqual(region.quest.reserve, { key: "1,0", kind: "stronghold", faction: "" }, "a region's purpose to keep");
}

// ── Quests from lore (ww:quest), without the AI ──
{
  const keys = readKeys([
    "ww:quest:The miller's missing son",
    "ww:quest giver:Fen",
    "ww:quest place:the mill",
    "ww:quest reward:a sack of flour",
    "mill",
  ]).keys;
  const lore = questsFromLore([
    { id: "book", entries: [{ id: "e1", title: "Son", content: "Fen's son went out and didn't come back.", keys }] },
  ]);
  assert.equal(lore.length, 1);
  assert.deepEqual(
    [lore[0].title, lore[0].giver, lore[0].place, lore[0].reward],
    ["The miller's missing son", "Fen", "the mill", "a sack of flour"],
  );
  const quest = loreQuest(lore[0], WORLD);
  assert.deepEqual(
    quest.stages.map((stage) => stage.goal.verb),
    ["talk", "go", "talk"],
  );
  assert.equal(quest.giver, "fen");
  assert.match(quest.done, /sack of flour/u);
  assert.equal(simulateQuest(begin(quest), WORLD).quest.state, "done");
  assert.equal(loreQuest({ ...lore[0], giver: "Nobody", place: "Nowhere" }, WORLD), null, "neither here: no quest");
  assert.deepEqual(
    loreQuest({ ...lore[0], giver: "" }, WORLD).stages.map((stage) => stage.goal.verb),
    ["go"],
  );
}

// ── The save keeps them, through a round trip ──
{
  const quests = [];
  for (let key = 0; key < 8; key++) {
    let quest = begin(builtInQuest(`save${key}`, WORLD));
    if (key % 2)
      quest = questEvent(
        quest,
        (await import("../packages/wanderworld/src/quests.js")).finishingEvent(quest),
        WORLD,
      ).quest;
    quests.push(quest);
  }
  const board = builtInQuest("board", WORLD);
  const world = checkWorld({
    id: "w",
    seed: "s",
    quests,
    questParts: quests.map((quest) => quest.parts),
    questTracked: quests[1].id,
    questBoard: board,
    questOffered: 42,
  });
  assert.deepEqual(world.quests, quests, "every quest comes back as it was");
  assert.deepEqual(JSON.parse(JSON.stringify(world.quests)), world.quests, "plain data");
  assert.equal(world.questTracked, quests[1].id);
  assert.deepEqual(world.questBoard, board);
  assert.equal(world.questOffered, 42);
  assert.equal(world.questParts.length, 8);
  // And a damaged copy falls back without breaking.
  const damaged = checkWorld({
    id: "w",
    seed: "s",
    quests: [{ id: 3 }, { id: "q", state: "active", stages: [{ id: "s1", goal: { verb: "fly" } }] }, "x"],
    questBoard: 7,
  });
  assert.deepEqual(damaged.quests, []);
  assert.equal(damaged.questBoard, null);
  // Finished ones are kept up to a limit, open ones always.
  const many = Array.from({ length: 60 }, (_, i) => ({ ...quests[0], id: `old${i}`, state: "done", at: null }));
  const kept = checkQuests([...many, quests[0]]);
  assert.ok(kept.length <= 40 && kept.includes(kept.find((quest) => quest.id === quests[0].id)));
  assert.ok(
    kept.some((quest) => quest.id === quests[0].id),
    "the open one stays",
  );
}

// ── A quest's region is given its purpose, and keeps it ──
{
  const quest = builtInQuest("region", WORLD, { only: ["scout"] });
  assert.deepEqual(quest.reserve, { key: "1,0", kind: "stronghold", faction: "" });
  // What questplay.js questRegion does on Accept: the factions.js rule (the next free region that way).
  const ahead = purposeAhead({}, {}, "0,0", "east", "stronghold", "", "quest");
  assert.equal(ahead.key, "1,0");
  assert.deepEqual(ahead.purposes["1,0"], { kind: "stronghold", faction: "", from: "quest" });
  // Once given, nothing takes it: the next one that way is the one after, and the save keeps it.
  assert.equal(purposeAhead(ahead.purposes, {}, "0,0", "east", "ruin").key, "2,0");
  const saved = checkWorld({ id: "w", seed: "s", purposes: ahead.purposes });
  assert.deepEqual(saved.purposes["1,0"], { kind: "stronghold", faction: "", from: "quest" });
  // The region map marks where a quest is sending you; the stage there counts only there.
  assert.equal(questEvent(begin(quest), { type: "at", region: "0,1", zone: "", x: 0, z: 0 }, WORLD).quest.at, "s1");
}

// ── The creatures a quest owns: in the herd as its spawns, kept through a respawn ──
{
  const quest = begin(
    builtInQuest("herd", { ...WORLD, creatures: [{ kind: "wolf", name: "wolf", cr: 0.25 }] }, { only: ["hunt"] }),
  );
  const spawns = questSpawns([quest], "0,0");
  assert.equal(spawns.length, 1);
  assert.equal(spawns[0].kind, "wolf");
  assert.equal(spawns[0].count, stageOf(quest).goal.count);
  assert.equal(questSpawns([quest], "1,0").length, 0, "only in the quest's region");
  assert.equal(questSpawns([giveUp(quest)], "0,0").length, 0, "and only while it's open");
  const keep = spawnKeep(spawns);
  assert.equal(keep.size, spawns[0].count);

  const world = createWorld(4242);
  const herd = createHerd();
  herd.setWorld(world, 4242, { counts: { strays: 0, farm: 0, wild: 0, hostile: 0, monsters: 10, town: 0 } });
  const spot = world.layout.outposts?.[0] ?? { x: 100, z: 100 };
  herd.setSpawns(
    questSpawns(
      [
        {
          ...quest,
          stages: quest.stages.map((stage) =>
            stage.id === "s1" ? { ...stage, goal: { ...stage.goal, x: spot.x, z: spot.z } } : stage,
          ),
        },
      ],
      "0,0",
    ).map((entry) => ({ ...entry, scale: 1 })),
  );
  const ours = () => herd.snapshot().filter((beast) => keep.has(beast.id));
  assert.equal(ours().length, spawns[0].count, "the quest's wolves are in the world");
  const player = { x: -spot.x, z: -spot.z };
  for (let round = 0; round < 3; round++) herd.respawn(player, keep);
  assert.equal(ours().length, spawns[0].count, "and still there after respawns, however far off");
}

// ── The server part's quest calls: short lists in, the answer cut to its shape ──
{
  const server = await import("../packages/wanderworld/server.mjs");
  const ask = (await import("../packages/wanderworld/src/quests.js")).questAsk(WORLD, {
    giver: "mira",
    recent: [{ archetype: "hunt", motive: "sheep" }],
  });
  const messages = server.questWriteMessages({
    worldName: "Ashdown",
    setting: "",
    giver: ask.giver,
    premise: "",
    avoid: ask.avoid,
    lists: ask,
  });
  assert.match(messages[1].content, /Who's asking: Mira, at the Golden Goose\./u);
  assert.match(messages[1].content, /People: Mira \(the Golden Goose\); Tam/u);
  assert.match(messages[1].content, /don't repeat them: hunt: sheep/u);
  assert.ok(messages[1].content.length < 1500, "a quest call sends little");
  const words = server.checkQuestWords({
    title: "T",
    stages: [{ verb: "TALK", target: "Tam", count: 2.6 }, "junk"],
    extra: 1,
  });
  assert.deepEqual(words.stages, [{ verb: "talk", target: "Tam", count: 3, item: "", near: "", text: "" }]);
  assert.equal(server.checkQuestWords({ stages: [] }), null);
  assert.deepEqual(server.checkQuestWords({ end: "It's over." }).end, "It's over.");
}

console.log("ok: quests");
