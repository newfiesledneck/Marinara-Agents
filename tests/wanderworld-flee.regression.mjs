// Wanderworld's creatures running from a fight, without a browser: how often they run (by what they are
// and how hurt they are), that one running can be chased and struck, that it comes back after a while,
// and that a fight by turns takes in one that comes back once, holds it, and tells its joining once.
// Run: node tests/wanderworld-flee.regression.mjs
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { GOT_AWAY, foeNerve, stillInFight } from "../packages/wanderworld/src/combat.js";
import { SRD_CREATURES } from "../packages/wanderworld/src/srd.js";

/** How often `make` runs, of every way the dice can fall, hurt to `hp` of `max` from `before`. */
function chance(make, hp, max, before = max) {
  let fled = 0;
  for (let a = 0; a < 20; a++)
    for (let b = 0; b < 20; b++) {
      const faces = [a, b];
      let i = 0;
      if (foeNerve(hp, max, () => (faces[i++ % 2] + 0.5) / 20, make, before) === "flee") fled++;
    }
  return fled / 400;
}

// Only badly hurt: a quarter of its HP or less, and only the blow that leaves it so asks.
const wolf = SRD_CREATURES.wolf;
assert.equal(chance(wolf, 11, 11), 0, "unhurt, it fights");
assert.equal(chance(wolf, 4, 11), 0, "at a third of its HP (where it used to run) it fights on");
assert.equal(chance(wolf, 2, 11, 6), 0.4, "badly hurt, a wolf runs on a failed DC 10 Wisdom save (d20 + 1 under 10)");
assert.equal(chance(wolf, 1, 11, 2), 0, "and asks once: one that held its nerve then fights on");
assert.equal(chance(wolf, 0, 11, 2), 0, "one that's down isn't asked");
// At its den it stands its ground: the save rolled twice, the better counting.
assert.equal(chance({ ...wolf, den: true }, 2, 11, 6), 0.16, "by its den, seldom");
// What it is: undead, oozes and constructs never run; nor anything that can't be frightened; nor the mindless.
for (const kind of ["zombie", "skeleton", "ghost", "slime", "gelatinous_cube"])
  assert.equal(chance(SRD_CREATURES[kind], 1, 20, 20), 0, `a ${kind} never runs`);
assert.equal(chance({ unmoved: ["frightened"] }, 1, 20, 20), 0, "what can't be frightened never runs");
assert.equal(chance({ kin: "construct" }, 1, 20, 20), 0, "a construct never runs");
assert.equal(chance("mindless", 1, 20, 20), 0, "a temperament on its own still counts");
const fire = SRD_CREATURES.fire_elemental;
assert.ok(chance(fire, 1, 20, 20) < chance({ ...fire, kin: "" }, 1, 20, 20) / 2, "an elemental seldom runs");
// A coward asks at half its HP.
const goblin = SRD_CREATURES.goblin;
assert.equal(chance(goblin, 3, 7, 7), 0.5, "a goblin at half its HP may run (d20 - 1 under 10)");
assert.equal(chance({ ...goblin, temperament: "" }, 3, 7, 7), 0, "one that isn't a coward doesn't yet");
// Never more often than about half the time, of every SRD creature.
for (const [kind, make] of Object.entries(SRD_CREATURES))
  assert.ok(chance(make, 1, 100, 100) <= 0.55, `a ${kind} runs ${chance(make, 1, 100, 100)} of the time at most`);

// The herd: a wolf that runs, is chased and struck, comes back, and is held in a fight by turns.
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
const { createHerd } = await import("../packages/wanderworld/src/herd.js");
const { createWorld } = await import("../packages/wanderworld/src/world.js");

const world = createWorld(4242);
const herd = createHerd();
herd.setWorld(world, 4242, { counts: { strays: 0, farm: 0, wild: 0, hostile: 0, monsters: 0, town: 0 } });
const out = world.layout.townHalf + 60;
const player = { x: out, y: 0, z: out };
const view = { hostile: "attack", combat: true };
const spawn = async (more = {}) => {
  herd.setSpawns([{ id: "w", kind: "wolf", scale: 1, sized: true, count: 1, at: { x: out + 3, z: out }, ...more }]);
  await new Promise((resolve) => setTimeout(resolve, 300));
  herd.takeEvents();
  return herd.snapshot().find((beast) => beast.kind === "wolf").id;
};
const run = (seconds) => {
  const events = [];
  for (let t = 0; t < seconds; t += 0.1) {
    herd.update(0.1, { player, ...view });
    events.push(...herd.takeEvents());
  }
  return events;
};
const foe = (id) => herd.foes(player, 200).find((entry) => entry.id === id);
const far = (id) => Math.hypot(foe(id).x - player.x, foe(id).z - player.z);

{
  const id = await spawn();
  herd.strike(id, 9, 11, "flee");
  assert.ok(foe(id).fled && foe(id).hostile && !foe(id).engaged, "struck to running, it has had enough");
  const ran = run(3);
  assert.ok(far(id) > 8, `it runs (${far(id).toFixed(1)} m)`);
  assert.ok(!ran.some((event) => event.type === "attack"), "and attacks nobody as it goes");
  // Chased down, it can still be struck in reach: it runs on, and can be finished off.
  player.x = foe(id).x - 1;
  player.z = foe(id).z;
  assert.ok(
    herd.foes(player, 2.5).some((entry) => entry.id === id),
    "within reach, a blow can land on it",
  );
  assert.equal(herd.strike(id, 0, 11, "fight").hp, 2, "a miss doesn't turn it");
  assert.ok(foe(id).fled, "it runs on");
  // By turns it's in the fight till it gets away.
  assert.ok(stillInFight(foe(id), player), "running, it's in the fight while near");
  assert.ok(!stillInFight({ ...foe(id), x: player.x + GOT_AWAY + 1 }, player), "and out once it gets away");
  assert.ok(stillInFight({ ...foe(id), fled: false, x: player.x + GOT_AWAY + 1 }, player), "one fighting stays");
  assert.ok(!stillInFight(undefined, player), "one beaten or gone is out");
  assert.ok(herd.strike(id, 2, 11, "fight").down, "and it can be finished off");
}

// The old bug: one fighting back was still counted as running (its own "timid", or having run before),
// so a fight by turns dropped it each frame and let it go, it attacked in real time, and each attack had
// it "join the fight" again. Now one that fights back is never counted as running.
{
  const id = await spawn({ temper: "timid" });
  assert.ok(foe(id).fled, "a timid one keeps away");
  herd.strike(id, 1, 11, "fight");
  assert.ok(!foe(id).fled && stillInFight(foe(id), player), "struck and fighting back, it's in the fight");
}

// One that ran gets its nerve back after a minute and comes again: a fight by turns takes it in once,
// holds it, and nothing lands in real time while it waits for its turn.
{
  player.x = out;
  player.z = out;
  const id = await spawn();
  herd.strike(id, 9, 11, "flee");
  run(30);
  assert.ok(foe(id).fled, "half a minute on, it's still running");
  player.x += 300; // (out of sight meanwhile)
  run(31);
  const wolf = herd.snapshot().find((beast) => beast.id === id);
  assert.equal(wolf.temper, "hostile", "a minute on, it has its nerve back");
  player.x = wolf.x - 12;
  player.z = wolf.z;
  const order = [];
  const joined = [];
  /** As main.js does it each frame: those no longer in it go; a chase or an attack joins one not in it. */
  const frame = () => {
    const about = new Map(herd.foes(player, 45).map((entry) => [entry.id, entry]));
    for (let i = order.length - 1; i >= 0; i--) if (!stillInFight(about.get(order[i]), player)) order.splice(i, 1);
    herd.hold(order);
    herd.update(0.1, { player, ...view });
    const events = herd.takeEvents();
    for (const event of events)
      if ((event.type === "chase" || event.type === "attack") && !order.includes(event.id)) {
        order.push(event.id);
        joined.push(event.id);
        herd.hold(order);
      }
    return events;
  };
  const events = [];
  for (let t = 0; t < 20; t += 0.1) events.push(...frame());
  assert.deepEqual(joined, [id], "it comes again, and joins the fight once");
  assert.equal(events.filter((event) => event.type === "chase").length, 1, "its coming is told once");
  assert.ok(!events.some((event) => event.type === "attack"), "held for its turn, it lands nothing in real time");
  assert.deepEqual(order, [id], "and stays in the turn order");
}
herd.detach();
world.dispose();
console.log("wanderworld flee regression: OK");
