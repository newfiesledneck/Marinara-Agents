// The fight display (fighthud.js): nameplates and turn-order cards for each fighter, the info card from the
// SRD, what the player has learned of a creature, and after a defeat the victors kept where they stand.
// Run: node tests/wanderworld-combat-hud.regression.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  creatureCard,
  fighterView,
  keepIds,
  knowCheck,
  knowDc,
  knowSkill,
  learned,
  logged,
  overRole,
  overSpots,
  overTold,
  overWords,
  personCard,
  plateData,
  plateFade,
  plateHeight,
  plateShown,
  pleaOf,
  revealed,
  shortLine,
  turnCards,
  victorsOf,
} from "../packages/wanderworld/src/fighthud.js";
import { SRD_CREATURES } from "../packages/wanderworld/src/srd.js";

const wolf = { id: "beast-1", kind: "foe", name: "wolf", hp: 4, max: 11, statuses: ["prone", "nonsense"], x: 2, z: 0 };
const ally = { id: "mira", kind: "ally", name: "Mira", hp: 12, max: 12, statuses: ["held"] };
const player = { id: "player", kind: "player", name: "Zoey", hp: 9, max: 20, statuses: [] };

// Nameplates: a creature's name, its HP as a share, its colour, and a mark for each condition known.
{
  const plate = plateData(wolf);
  assert.equal(plate.name, "wolf");
  assert.ok(Math.abs(plate.share - 4 / 11) < 1e-9, "HP share");
  assert.equal(plate.colour, "#ec8a2e", "a third left: orange");
  assert.equal(plate.icons, "↓", "prone marked; an unknown status left out");
  assert.equal(plateData(ally).name, "", "a person's plate leaves the name to their name tag");
  assert.equal(plateData(ally).icons, "✋", "held");
  assert.notEqual(plateData(wolf).key, plateData({ ...wolf, hp: 3 }).key, "the plate is drawn again when HP changes");
  assert.equal(plateData(wolf).key, plateData({ ...wolf }).key, "and not when nothing does");
  const hidden = plateData(wolf, false);
  assert.equal(hidden.share, 0.5, "foes' numbers hidden: the bar goes in quarters");
  // Shown: always in fights, or sometimes (hurt, marked, aimed at, their turn), or never.
  assert.ok(plateShown("all", { hp: 5, max: 5 }));
  assert.ok(!plateShown("some", { hp: 5, max: 5, statuses: [] }), "unhurt and nothing on it");
  assert.ok(plateShown("some", wolf), "hurt");
  assert.ok(plateShown("some", { hp: 5, max: 5, current: true }), "its turn");
  assert.ok(!plateShown("off", wolf));
  assert.equal(plateFade(5), 1);
  assert.equal(plateFade(40), 0, "far off, gone");
  assert.ok(plateHeight({ size: "huge" }) > plateHeight({ size: "medium" }), "a bigger creature's plate is higher");
  assert.ok(plateHeight({ measured: 4 }) > plateHeight({ measured: 1 }));
}

// The turn order's cards: name, HP numbers (or a word for a foe), statuses, whose turn it is.
{
  const cards = turnCards([player, wolf, ally], 1);
  assert.deepEqual(
    cards.map((card) => [card.name, card.numbers, card.current]),
    [
      ["Zoey", "9/20", false],
      ["wolf", "4/11", true],
      ["Mira", "12/12", false],
    ],
  );
  assert.deepEqual(
    cards[1].statuses.map((mark) => mark.label),
    ["Prone"],
  );
  const vague = turnCards([player, wolf], 0, false);
  assert.equal(vague[0].numbers, "9/20", "your own HP is always numbers");
  assert.equal(vague[1].numbers, "Badly wounded", "a foe's, a word with numbers hidden");
  assert.ok(
    fighterView({ ...wolf, hp: 0 }).statuses.some((mark) => mark.id === "down"),
    "at 0 HP, down",
  );
}

// What just happened, in a few words, with the lines before kept.
{
  const line =
    "The wolf bites at Zoey (Attack roll: 9 + 5 = 14 against AC 12, with advantage): a hit, for 4 (Damage: 2d4+2 = 4). Zoey has 9 of 20 HP.";
  assert.equal(shortLine(line), "The wolf bites at Zoey: a hit, 4 damage · 14 vs AC 12");
  assert.match(
    shortLine(
      "Zoey swings the iron axe at the wolf (Attack roll: 18 + 3 = 21 against AC 13): a hit, for 9. The wolf goes down.",
    ),
    /a hit, 9 damage · 21 vs AC 13 · down$/u,
  );
  assert.equal(shortLine("A fight. Initiative: Zoey 14, wolf 9."), "A fight. Initiative: Zoey 14, wolf 9.");
  let log = [];
  for (let i = 0; i < 9; i++) log = logged(log, `Line ${i}.`);
  assert.equal(log.length, 6, "the last six");
  assert.equal(log.at(-1).text, "Line 8.");
}

// The info card holds the SRD's resistances, immunities and vulnerabilities, as the ruleset package has them.
const catalog = new Map(
  JSON.parse(
    readFileSync(new URL("../packages/ruleset-5e-2014/catalogs/creatures.json", import.meta.url), "utf8"),
  ).entries.map((entry) => [entry.id, entry.creature]),
);
{
  const all = (kind) => creatureCard({ name: kind, stats: SRD_CREATURES[kind], mode: "all" });
  const line = (card, label) => card.defences.find((entry) => entry.label === label)?.items ?? [];
  const ghost = all("ghost");
  assert.deepEqual(line(ghost, "Immune to"), catalog.get("ghost").immune);
  assert.ok(line(ghost, "Resists").includes("fire"));
  assert.ok(line(ghost, "Resists").includes("slashing (unless magical)"));
  assert.ok(line(ghost, "Can't be").includes("grappled"), "its condition immunities");
  assert.equal(ghost.sub, "Medium undead, any alignment");
  const fire = all("fire_elemental");
  assert.deepEqual(line(fire, "Immune to"), ["fire", "poison"]);
  assert.ok(fire.rows.some(([label, text]) => label === "Speed" && text === "15 m"));
  const troll = all("troll");
  assert.equal(line(troll, "Resists").length + line(troll, "Immune to").length, 0, "a troll resists nothing");
  assert.ok(
    troll.traits.some((text) => text.startsWith("Regeneration:")),
    "but regenerates",
  );
  assert.deepEqual(
    troll.scores.map((entry) => entry.score),
    [18, 13, 20, 7, 9, 7],
  );
  assert.equal(troll.scores[0].mod, "+4");
  assert.ok(troll.acts.includes("Claw: +7 to hit, 2d6+4 slashing, reach 1.5 m"));
  for (const [kind, id] of [
    ["skeleton", "skeleton"],
    ["earth_elemental", "earth-elemental"],
    ["shambling_mound", "shambling-mound"],
  ]) {
    const card = all(kind);
    assert.deepEqual(
      line(card, "Vulnerable to"),
      catalog.get(id).vulnerable ?? [],
      `${kind}'s vulnerabilities are the SRD's`,
    );
  }
  assert.match(troll.source, /SRD 5\.1, CC BY 4\.0/u, "the card says where it's from");
  // A companion's card, from their sheet.
  const mira = personCard({ ...ally, cls: "Cleric", level: 3, ac: 14, role: "Companion" });
  assert.equal(mira.sub, "Companion · Cleric, level 3");
  assert.deepEqual(mira.rows, [
    ["HP", "12/12"],
    ["AC", "14"],
  ]);
  assert.deepEqual(
    mira.statuses.map((mark) => mark.label),
    ["Held"],
  );
}

// Knowledge: only what's been learned, until the knowledge check is passed; the check rolled once a kind.
{
  assert.equal(knowSkill("undead"), "religion");
  assert.equal(knowSkill("beast"), "nature");
  assert.equal(knowSkill("giant"), "nature");
  assert.equal(knowSkill("elemental"), "arcana");
  assert.equal(knowSkill("humanoid"), "history");
  assert.equal(knowDc(5), 15);
  const stats = SRD_CREATURES.ghost;
  const blank = creatureCard({ name: "ghost", stats, record: {}, mode: "learned" });
  assert.equal(blank.defences.length, 0, "nothing of its defences known yet");
  assert.equal(blank.scores, null);
  assert.equal(blank.acts.length, 0, "nor what it does");
  assert.equal(blank.rows.find(([label]) => label === "AC")[1], "Not yet known");
  // Struck with fire (it resists) and with force (as rolled), and seen to attack.
  let record = learned({}, { struck: true, type: "fire", how: "resists" });
  record = learned(record, { struck: true, type: "force", how: "" });
  record = learned(record, { acts: true });
  assert.equal(learned(record, { acts: true }), record, "nothing new: the same record (nothing saved)");
  const some = creatureCard({ name: "ghost", stats, record, mode: "learned" });
  assert.deepEqual(
    some.defences.find((entry) => entry.label === "Resists").items,
    ["fire"],
    "only fire, of what it resists",
  );
  assert.ok(!some.defences.some((entry) => entry.label === "Immune to"), "its immunities still unknown");
  assert.deepEqual(some.defences.find((entry) => entry.label === "Takes as rolled").items, ["force"]);
  assert.equal(some.rows.find(([label]) => label === "AC")[1], "11", "fought: its AC is known");
  assert.ok(some.acts.length > 0, "seen to attack: its actions");
  assert.ok(revealed(record, "all").all, "the setting at Everything shows it all");
  // The check: a d20 and the skill against DC 10 + CR, once.
  const failed = knowCheck({}, { kin: "undead", cr: 4, add: 2 }, () => 0.1); // (a 3: 5 against 14)
  assert.deepEqual(failed.check, { skill: "religion", roll: 3, total: 5, dc: 14, passed: false });
  assert.equal(
    knowCheck(failed, { kin: "undead", cr: 4, add: 20 }, () => 0.99),
    failed,
    "never rolled again",
  );
  const passed = knowCheck(record, { kin: "undead", cr: 4, add: 2 }, () => 0.95); // (a 20)
  assert.ok(passed.check.passed && revealed(passed).all, "passed: everything");
  assert.equal(creatureCard({ name: "ghost", stats, record: passed }).defences.length, 3, "resists, immune, can't be");
}

// After a defeat: who stands over the player, doing what, and they're kept when monsters are counted out again.
{
  const at = { x: 0, z: 0 };
  const fighters = [
    player,
    { ...wolf, id: "w1", x: 3, z: 0 },
    { ...wolf, id: "w2", x: 0, z: 30 }, // (too far: not one of them)
    { ...wolf, id: "w3", hp: 0, x: 1, z: 1 }, // (beaten: not one of them)
    { id: "b1", kind: "foe", name: "bandit", hp: 11, max: 11, x: -2, z: 1 },
    ally,
  ];
  assert.deepEqual(victorsOf(fighters, at), ["b1", "w1"], "the nearest standing foes");
  assert.equal(overRole({ kind: "bandit", talks: true, kin: "humanoid" }), "rob");
  assert.equal(overRole({ kind: "wolf", kin: "beast" }), "circle");
  assert.equal(overRole({ kind: "troll", kin: "giant" }), "guard");
  assert.equal(
    overRole({ kind: "bandit", talks: true, kin: "humanoid", captors: (kind) => kind === "bandit" }),
    "captive",
    "a hook for a quest that takes the player captive",
  );
  const victors = [
    { id: "b1", name: "bandit", role: "rob", talks: true, kin: "humanoid", cr: 0.125 },
    { id: "w1", name: "wolf", role: "circle", kin: "beast", cr: 0.25 },
    { id: "w4", name: "wolf", role: "circle", kin: "beast", cr: 0.25 },
  ];
  assert.equal(overWords(victors, "Zoey"), "A bandit and two wolves stand over Zoey.");
  assert.equal(overTold(victors, "Zoey"), "Zoey lies beaten on the ground; a bandit and two wolves stand over them");
  const first = overSpots(victors, at, 0);
  const later = overSpots(victors, at, 3);
  for (const spot of [...first, ...later])
    assert.ok(Math.hypot(spot.x, spot.z) < 3.5, "all of them stay by the player");
  assert.ok(Math.abs(Math.hypot(first[0].x, first[0].z) - 1.3) < 1e-9, "the robber close");
  assert.deepEqual([first[0].x, first[0].z], [later[0].x, later[0].z], "the robber stands still");
  assert.notDeepEqual([first[1].x, first[1].z], [later[1].x, later[1].z], "a wolf circles");
  assert.deepEqual(pleaOf(victors), { skill: "persuasion", dc: 10 });
  assert.deepEqual(pleaOf(victors.slice(1), 2), { skill: "animal_handling", dc: 14 }, "beasts; 2 more a plea");
  assert.equal(pleaOf([{ temperament: "mindless" }]), null, "the mindless can't be pleaded with");

  // The herd keeps them when it counts the world's monsters out again (Settings → New monsters every).
  const context = new Proxy(
    { measureText: (text) => ({ width: String(text).length * 14 }) },
    { get: (target, key) => target[key] ?? (() => ({ addColorStop() {} })), set: () => true },
  );
  const image = () => ({ addEventListener() {}, removeEventListener() {}, setAttribute() {}, style: {} });
  globalThis.document ??= {
    createElement: () => ({ getContext: () => context, width: 0, height: 0, ...image() }),
    createElementNS: image,
  };
  globalThis.fetch = async () => new Response("missing", { status: 404 }); // (no bodies: only where they are)
  console.warn = () => {}; // (each missing body says so)
  const { ANIMALS } = await import("../packages/wanderworld/src/animals.js");
  const { createHerd } = await import("../packages/wanderworld/src/herd.js");
  const { createWorld } = await import("../packages/wanderworld/src/world.js");
  const world = createWorld(4242);
  const herd = createHerd();
  herd.setWorld(world, 4242, { counts: { strays: 0, farm: 0, wild: 0, hostile: 0, monsters: 12, town: 0 } });
  const own = () => herd.snapshot().filter((beast) => ANIMALS[beast.kind].group === "monsters" && !beast.lore);
  const before = own();
  // (Wherever the respawn looks from, far from all of them, so only what's kept stays.)
  const away = { x: before[0].x + 5000, z: before[0].z + 5000 };
  const standing = before.slice(0, 2).map((beast) => ({ id: beast.id }));
  herd.respawn(away, keepIds([], standing));
  const after = own();
  for (const victor of before.slice(0, 2)) {
    const still = after.find((beast) => beast.id === victor.id);
    assert.ok(still, "a victor isn't counted away");
    assert.deepEqual([still.x, still.z], [victor.x, victor.z], "and is where it stood");
  }
  assert.ok(!after.some((beast) => beast.id === before[2].id), "one not kept is gone");
  assert.deepEqual([...keepIds([{ id: "a" }], ["b"])], ["a", "b"], "those in a fight and those standing over");
}

console.log("ok: the fight display");
