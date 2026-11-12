// Wanderworld relationships: kinds and their tiers read as words, records are checked, and townsfolk act
// on how they feel: friends seek each other out and chat, someone who dislikes another keeps away, a
// townsperson fond of the player comes over to say hello, and a sworn enemy marches up to them.
// Name tags draw on a canvas, so a small stand-in canvas is supplied.
import assert from "node:assert/strict";

const context = new Proxy(
  { measureText: (text) => ({ width: String(text).length * 14 }) },
  { get: (target, key) => target[key] ?? (() => ({ addColorStop() {} })), set: () => true },
);
globalThis.document = { createElement: () => ({ getContext: () => context, width: 0, height: 0 }) };
globalThis.fetch = async () => new Response("null", { status: 404 });

const {
  checkRelationship,
  checkTraitMap,
  createRelationships,
  linksFromWords,
  phraseOf,
  setupFromWords,
  tierOf,
  warmthOf,
} = await import("../packages/wanderworld/src/relationships.js");
const { createCrowd } = await import("../packages/wanderworld/src/npcs.js");
const { createWorld, waterAt } = await import("../packages/wanderworld/src/world.js");

// ── The records ──
assert.equal(tierOf("friend", 10), "friendly");
assert.equal(tierOf("friend", 90), "best friend");
assert.equal(tierOf("enemy", 80), "sworn enemy");
assert.equal(phraseOf("romance", 60), "is smitten with");
assert.ok(warmthOf("enemy", 90) < warmthOf("enemy", 10), "a sworn enemy is colder than someone who merely dislikes");
assert.ok(warmthOf("partner", 100) > warmthOf("friend", 30));
assert.equal(
  checkRelationship({ from: "a", to: "a", kind: "friend" }),
  null,
  "nobody has a relationship with themselves",
);
assert.equal(checkRelationship({ from: "a", to: "b", kind: "frenemy" }), null, "unknown kinds are refused");
assert.equal(checkRelationship({ from: "a", to: "b", kind: "friend", level: 400 }).level, 100, "levels stay 0–100");

const relations = createRelationships([{ from: "c-1", to: "c-2", kind: "friend", level: 90 }]);
const names = { "c-1": "Sarah", "c-2": "Jake", player: "Zoey" };
assert.equal(relations.describe("c-1", "c-2", names), "Sarah is best friends with Jake");
assert.equal(relations.get("c-2", "c-1"), null, "relationships run one way");
assert.equal(relations.feeling("c-2", "c-1").kind, "acquaintance", "townsfolk know each other a little anyway");
assert.equal(relations.feeling("c-2", "player").kind, null, "but not the player, until they meet");
relations.set("c-3", "c-1", { kind: "family", level: 60, role: "sister" });
assert.equal(
  relations.describe("c-3", "c-1", { ...names, "c-3": "Mira" }),
  "Mira is Sarah's sister and is close to them",
);
relations.set("c-3", "c-1", null);
assert.equal(relations.get("c-3", "c-1"), null, "a relationship can be cleared");

assert.deepEqual(
  checkTraitMap({ a: { aggression: 300 }, b: { sociability: 50 }, c: "x" }),
  {
    a: { aggression: 100, sociability: 50 },
  },
  "traits stay 0–100, and plain defaults aren't stored",
);

// What a character's lore keywords say about them: their body and how they see the player.
assert.deepEqual(setupFromWords(["Jacob", "enemy", "male"]), {
  body: "male",
  relation: { kind: "enemy", level: 50, role: "" },
});
assert.deepEqual(setupFromWords(["Sir. Augustine", "Mentor", "Male"]).relation, {
  kind: "mentor",
  level: 50,
  role: "",
});
assert.deepEqual(
  setupFromWords(["sworn enemy"]).relation,
  { kind: "enemy", level: 87, role: "" },
  "a tier sets the level",
);
assert.deepEqual(setupFromWords(["sister", "woman"]), {
  body: "female",
  relation: { kind: "family", level: 60, role: "sister" },
});
assert.deepEqual(
  setupFromWords(["the old mill", "rumours"]),
  { body: null, relation: null },
  "other words set nothing",
);
// …and how they stand toward others, in plain words; nothing assumed the other way round.
assert.deepEqual(
  linksFromWords(["Jacob", "male", "brother of Sarah", "son of Zoey", "friends with Mira", "sworn enemy of Rook"]),
  [
    { name: "Sarah", relation: { kind: "family", level: 60, role: "brother" } },
    { name: "Zoey", relation: { kind: "family", level: 70, role: "son" } },
    { name: "Mira", relation: { kind: "friend", level: 50, role: "" } },
    { name: "Rook", relation: { kind: "enemy", level: 87, role: "" } },
  ],
);
assert.deepEqual(
  linksFromWords(["tales of the river", "in love with Tam"]),
  [{ name: "Tam", relation: { kind: "romance", level: 85, role: "" } }],
  "only a relationship word before 'of' / 'with' counts",
);
assert.equal(
  setupFromWords(["brother of Sarah"]).relation,
  null,
  "a link to someone else isn't how they see the player",
);

// ── In town ──
const world = createWorld(5150);
const crowd = createCrowd();
crowd.setDressed(false);
crowd.setWorld(world);
crowd.setCast([
  { id: "c-1", name: "Sarah" },
  { id: "c-2", name: "Jake" },
  { id: "c-3", name: "Mira" },
  { id: "c-4", name: "Tam" },
  { id: "c-5", name: "Rook" },
  { id: "c-6", name: "Fen" },
]);
const town = createRelationships([
  { from: "c-1", to: "c-2", kind: "friend", level: 95 },
  { from: "c-2", to: "c-1", kind: "friend", level: 95 },
  { from: "c-3", to: "c-4", kind: "enemy", level: 50 },
]);
crowd.setRelations((from, to) => town.feeling(from, to));
const player = { x: 0, y: 0, z: 200 };
let time = 0;
let allowed = true; // the combat setting, as the crowd sees it
const traits = {};
crowd.setTraits((id) => traits[id] ?? { aggression: 50, sociability: 50 });
const said = [];
const someoneOutForParty = () => crowd.snapshot().find((person) => person.state !== "inside")?.id ?? "c-6";
const step = (seconds) => {
  for (let elapsed = 0; elapsed < seconds; elapsed += 0.1) {
    time += 0.1;
    crowd.update(0.1, {
      player,
      space: world,
      playerSitting: false,
      playerAngle: 0,
      playerSpeed: 0,
      hour: 12,
      time,
      isVisible: () => false,
      onFootstep: () => {},
      onSay: (group, text) => said.push(text),
      playerName: "Zoey",
      aggressionAllowed: () => allowed,
      approach: 4, // people come up often here, so the test needn't wait
      approachMax: 5,
    });
    world.update(0.1);
  }
};
const at = (id) => crowd.snapshot().find((person) => person.id === id);

// Homes from lore: the two given home 6 live there, and nobody else is put in it.
{
  const homeDoors = world.doors.filter((door) => door.kind === "home");
  const kept = homeDoors[3].index;
  crowd.setHousing({ "c-1": { home: kept, work: null }, "c-2": { home: kept, work: null } });
  const homesNow = crowd.snapshot().map((person) => [person.id, person.home]);
  assert.ok(
    homesNow.filter(([id]) => id === "c-1" || id === "c-2").every(([, home]) => home === kept),
    "they live there",
  );
  assert.ok(
    homesNow.filter(([id]) => id !== "c-1" && id !== "c-2").every(([, home]) => home !== kept),
    "nobody else does",
  );
  crowd.setHousing({});
}

// Friends: over a while in town they meet and chat (or sit together).
let together = false;
for (let i = 0; i < 600 && !together; i++) {
  step(2.5);
  const sarah = at("c-1");
  together = (sarah.state === "chat" || sarah.state === "sit") && sarah.with === "Jake";
}
assert.ok(together, "best friends seek each other out, and chat or sit together");

// Someone who dislikes another moves off when they come close.
const tam = at("c-4");
crowd.restoreParty([], player); // nobody in the party; just here to keep the call shape
const mira = at("c-3");
const before = Math.hypot(mira.x - tam.x, mira.z - tam.z);
if (before > 6) {
  // Bring them close: Tam stands right next to Mira (a party of one, walked to her, then let go).
  crowd.restoreParty(["c-4"], { x: mira.x + 1.5, z: mira.z });
  crowd.setFollowing("c-4", false);
}
step(8);
const apart = Math.hypot(at("c-3").x - at("c-4").x, at("c-3").z - at("c-4").z);
assert.ok(apart > 4, `someone who dislikes another keeps away from them (${apart.toFixed(1)} m apart)`);

// Toward the player: someone fond of them comes over and says hello; a sworn enemy marches up.
/** Someone out in town and free (not indoors or with anyone), other than `not`; waits for one if needed. */
const someoneOut = (...not) => {
  for (let tries = 0; tries < 60; tries++) {
    const free = crowd
      .snapshot()
      .find((person) => person.state !== "inside" && !person.with && !not.includes(person.id));
    if (free) return free.id;
    step(5);
  }
  throw new Error("nobody out in town");
};
const fond = someoneOut("c-3", "c-4");
town.set(fond, "player", { kind: "friend", level: 80 });
crowd.restoreParty([fond], { x: 0, z: 6 });
crowd.setFollowing(fond, false);
player.x = 0;
player.z = 13;
said.length = 0;
step(12);
const friend = at(fond);
assert.ok(Math.hypot(friend.x - player.x, friend.z - player.z) < 4, "a friend comes over to the player");
assert.ok(
  said.some((line) => line.includes("Zoey")),
  "and says hello by name",
);

const foe = someoneOut(fond, "c-3", "c-4");
town.set(foe, "player", { kind: "enemy", level: 95 });
crowd.restoreParty([foe], { x: 6, z: 6 });
crowd.setFollowing(foe, false);
said.length = 0;
step(12);
const enemy = at(foe);
assert.ok(Math.hypot(enemy.x - player.x, enemy.z - player.z) < 4.5, "a sworn enemy marches up to the player");
assert.ok(
  said.some((line) => line.startsWith("You!")),
  "and has words",
);

// Temperament and the combat setting: a passive sworn enemy keeps away instead; with confrontations
// off, so does an aggressive one; an aggressive person comes at someone they merely dislike.
const near = (id) => Math.hypot(at(id).x - player.x, at(id).z - player.z);
/** Puts `id` near the player with how they see them and their temperament, and lets a while pass. */
const meet = (id, relation, temperament) => {
  town.set(id, "player", relation);
  traits[id] = temperament;
  crowd.restoreParty([id], { x: 5, z: 7 });
  crowd.setFollowing(id, false);
  said.length = 0;
  step(12);
  return near(id);
};
const calm = someoneOut(fond, foe, "c-3", "c-4");
assert.ok(
  meet(calm, { kind: "enemy", level: 95 }, { aggression: 0, sociability: 50 }) > 4.5,
  "a passive sworn enemy doesn't confront",
);
assert.ok(!said.some((line) => line.startsWith("You!")));
const hothead = someoneOut(fond, foe, calm, "c-3", "c-4");
allowed = false;
assert.ok(
  meet(hothead, { kind: "enemy", level: 95 }, { aggression: 100, sociability: 50 }) > 4.5,
  "confrontations off: nobody comes at you",
);
allowed = true;
assert.ok(
  meet(hothead, { kind: "enemy", level: 10 }, { aggression: 100, sociability: 50 }) < 4.5,
  "an aggressive person comes at someone they merely dislike",
);

// Across the river a follower goes round by the bridge (not into the water), and gets there.
{
  const { landscapeNeeds, landscapeWith } = await import("../packages/wanderworld/src/land.js");
  let riverWorld = null;
  for (let seed = 80; seed < 120 && !riverWorld; seed++) {
    const built = createWorld(
      seed,
      landscapeNeeds(landscapeWith(seed, { river: "yes", places: "several" }), { inn: 2 }, seed),
    );
    if (built.bridges.length) riverWorld = built;
    else built.dispose();
  }
  assert.ok(riverWorld, "a world with a bridge");
  const walkers = createCrowd();
  walkers.setDressed(false);
  walkers.setWorld(riverWorld);
  walkers.setCast([{ id: "w-1", name: "Walker" }]);
  const bridge = riverWorld.bridges[0];
  const across = { x: bridge.b.x - bridge.a.x, z: bridge.b.z - bridge.a.z };
  const length = Math.hypot(across.x, across.z);
  const along = { x: -across.z / length, z: across.x / length }; // along the river
  const start = { x: bridge.a.x + along.x * 4, z: bridge.a.z + along.z * 4 }; // close enough not to be "lost"
  const goal = { x: bridge.b.x - along.x * 4, y: 0, z: bridge.b.z - along.z * 4 };
  walkers.restoreParty(["w-1"], start);
  const middle = { x: (bridge.a.x + bridge.b.x) / 2, z: (bridge.a.z + bridge.b.z) / 2 };
  let nearestToBridge = Infinity;
  let wet = 0;
  let clock = 0;
  for (let i = 0; i < 240; i++) {
    clock += 0.1;
    walkers.update(0.1, {
      player: goal,
      space: riverWorld,
      playerSitting: false,
      playerAngle: 0,
      playerSpeed: 1.4,
      hour: 12,
      time: clock,
      isVisible: () => false,
      onFootstep: () => {},
      onSay: () => {},
      playerName: "Zoey",
    });
    const at = walkers.snapshot()[0];
    nearestToBridge = Math.min(nearestToBridge, Math.hypot(at.x - middle.x, at.z - middle.z));
    if (waterAt(at.x, at.z).depth > 0.6) wet++;
  }
  const end = walkers.snapshot()[0];
  assert.ok(
    nearestToBridge < 3,
    `the follower crossed by the bridge (came within ${nearestToBridge.toFixed(1)} m of its middle)`,
  );
  assert.equal(wet, 0, "and never waded into the river");
  assert.ok(Math.hypot(end.x - goal.x, end.z - goal.z) < 5, "and reached the player");

  // When the player swims across, the party swims after them (straight over, not round by the bridge).
  walkers.restoreParty(["w-1"], start);
  let swam = 0;
  let nearBridge = Infinity;
  for (let i = 0; i < 240; i++) {
    clock += 0.1;
    walkers.update(0.1, {
      player: goal,
      space: riverWorld,
      playerSitting: false,
      playerSwimming: true,
      playerAngle: 0,
      playerSpeed: 1.4,
      hour: 12,
      time: clock,
      isVisible: () => false,
      onFootstep: () => {},
      onSay: () => {},
      playerName: "Zoey",
    });
    const at = walkers.snapshot()[0];
    nearBridge = Math.min(nearBridge, Math.hypot(at.x - middle.x, at.z - middle.z));
    if (waterAt(at.x, at.z).depth > 1.3) swam++;
  }
  const after = walkers.snapshot()[0];
  assert.ok(swam > 0, "the follower swam across after the swimming player");
  assert.ok(Math.hypot(after.x - goal.x, after.z - goal.z) < 5, "and reached the player");
  riverWorld.dispose();
}

// The AI's setup of a new world, summed up for the review before the land is built.
{
  const { summariseSetup } = await import("../packages/wanderworld/src/setup.js");
  const summary = summariseSetup(
    {
      loreKeys: {
        "cards/c-fen": ["Fen", "male", "lives in home2", "owner of tavern1", "friend"],
        "cards/c-mira": ["Mira", "female", "lives in home3", "works at smithy1", "sister of Tam", "rival of Fen"],
        "cards/player": ["player", "female", "lives in home1", "friend"],
        "book/e1": ["tavern1", "located in town1"],
        "book/e2": ["World"],
      },
      loreNames: { tavern1: "The Gilded Stag" },
    },
    {
      characters: [
        { id: "c-fen", name: "Fen" },
        { id: "c-mira", name: "Mira" },
        { id: "c-rook", name: "Rook" },
      ],
      persona: "Zoey",
      entries: 5,
    },
  );
  assert.deepEqual(
    summary.people.map((person) => person.name),
    ["Zoey", "Fen", "Mira"],
    "the player first, then whoever was set up",
  );
  const [you, fen, mira] = summary.people;
  assert.deepEqual([you.you, you.body, you.home, you.toPlayer], [true, "female", "home1", ""]);
  assert.deepEqual(
    [fen.body, fen.home, fen.work, fen.owner, fen.toPlayer],
    ["male", "home2", "tavern1", true, "friend"],
  );
  assert.deepEqual([mira.work, mira.owner, mira.links], ["smithy1", false, ["sister of Tam", "rival of Fen"]]);
  assert.deepEqual(summary.named, [["tavern1", "The Gilded Stag"]]);
  assert.deepEqual(summary.lore, { placed: 1, world: 1, untied: 3 });
  assert.deepEqual(summariseSetup(null).people, [], "nothing set up is an empty summary");
}

console.log("wanderworld relations regression: OK");
