// Wanderworld's animals, without a browser: each kind built from the kit files on disk (kit/animals/, a
// file a group,
// made from Quaternius's CC0 Ultimate Animated Animals by scripts/build-wanderworld-animals.mjs) stands
// on the ground at the size it should be and poses for standing, grazing, walking and galloping; a
// world gets a herd that keeps to dry, open ground; the timid ones run; and a horse can be ridden.
// Run: node tests/wanderworld-animals.regression.mjs
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Box3 } from "three";

const kit = join(dirname(fileURLToPath(import.meta.url)), "../packages/wanderworld/kit/animals");
globalThis.fetch = async (url) => {
  const name = String(url).split("/kit/animals/")[1];
  try {
    return new Response(await readFile(join(kit, name)), { status: 200 });
  } catch {
    return new Response("missing", { status: 404 });
  }
};
const context = new Proxy(
  { measureText: (text) => ({ width: String(text).length * 14 }) },
  { get: (target, key) => target[key] ?? (() => ({ addColorStop() {} })), set: () => true },
);
globalThis.document = { createElement: () => ({ getContext: () => context, width: 0, height: 0 }) };

const { ANIMALS, COATS, coatFor, createAnimal } = await import("../packages/wanderworld/src/animals.js");
const { createHerd, herdFor } = await import("../packages/wanderworld/src/herd.js");
const { PACK } = await import("../packages/wanderworld/src/pack.js");
const { createWorld, waterAt } = await import("../packages/wanderworld/src/world.js");

const index = JSON.parse(await readFile(join(kit, "index.json"), "utf8"));
assert.ok(index.source.includes("CC0"), "the kit says where it's from and its licence");
assert.deepEqual(
  Object.keys(index.animals).sort(),
  Object.keys(ANIMALS).sort(),
  "the kit has every animal the game knows",
);

// ── Each kind ────────────────────────────────────────────────────────────────
for (const [kind, facts] of Object.entries(ANIMALS)) {
  assert.ok(PACK.animals[kind], `the pack has words for the ${kind}`);
  assert.ok(facts.gallop > facts.walk && facts.walk > 0, `the ${kind} gallops faster than it walks`);
  const animal = await createAnimal(kind);
  const measure = () => {
    animal.object.updateMatrixWorld(true);
    return new Box3().setFromObject(animal.object, true);
  };
  const standing = measure();
  const height = standing.max.y - standing.min.y;
  const wanted = index.animals[kind].height;
  assert.ok(
    Math.abs(height - wanted) < wanted * 0.2,
    `the ${kind} stands about ${wanted} m tall (${height.toFixed(2)})`,
  );
  assert.ok(Math.abs(standing.min.y) < 0.12, `the ${kind} stands on the ground (${standing.min.y.toFixed(3)})`);
  assert.ok(standing.max.z - standing.min.z > standing.max.x - standing.min.x, `the ${kind} is longer than it is wide`);
  if (facts.back)
    assert.ok(facts.back < height && facts.back > height * 0.45, `the ${kind}'s back is where a rider sits`);
  // Standing, grazing, walking and galloping all pose it, and it stays on the ground and whole.
  for (const [speed, options] of [
    [0, {}],
    [0, { graze: true }],
    [facts.walk, {}],
    [facts.gallop, {}],
    [0, {}],
  ]) {
    for (let t = 0; t < 1.5; t += 1 / 30) animal.update(1 / 30, speed, options);
    const box = measure();
    for (const value of [...box.min.toArray(), ...box.max.toArray()])
      assert.ok(Number.isFinite(value), `${kind} at ${speed}`);
    assert.ok(box.min.y > -0.35 && box.max.y < wanted * 1.45, `the ${kind} keeps its shape at ${speed} m/s`);
  }
  // The ridden kinds leap: the back dips as it gathers itself, rises well clear, and comes back down.
  if (facts.back) {
    const rises = Array.from({ length: 21 }, (_, i) => animal.rise(i / 20));
    assert.ok(
      Math.max(...rises) > 0.35 && Math.max(...rises) < 1.2,
      `the ${kind} jumps (${Math.max(...rises).toFixed(2)} m)`,
    );
    assert.ok(Math.abs(rises[0]) < 0.01 && Math.abs(rises[20]) < 0.05, `the ${kind} lands where it stands`);
    for (let t = 0; t <= 1; t += 0.05) {
      animal.update(1 / 30, facts.gallop, { jump: t });
      const box = measure();
      assert.ok(Number.isFinite(box.max.y) && box.max.y < wanted * 1.8, `the ${kind} keeps its shape in a jump`);
    }
  } else assert.equal(animal.rise(0.5), 0, `the ${kind} doesn't jump`);
  animal.dispose();
}
await assert.rejects(() =>
  fetch("x/kit/animals/dragon.json").then((r) => (r.ok ? r : Promise.reject(new Error("404")))),
);
assert.equal((await createAnimal("dragon")).kind, "deer", "an unknown kind is a deer");

// ── Files by group, and coats ────────────────────────────────────────────────
for (const [kind, facts] of Object.entries(ANIMALS)) {
  assert.equal(index.animals[kind].group, facts.group, `the ${kind} is in the file the game looks in`);
  const file = JSON.parse(await readFile(join(kit, `${facts.group}.json`), "utf8"));
  assert.ok(file.animals[kind], `${facts.group}.json has the ${kind}`);
  // Every part a coat recolours is a part the model has.
  const parts = new Set(file.animals[kind].mesh.parts.map(([name]) => name));
  for (const [coat, colours] of Object.entries(COATS[kind] ?? {})) {
    for (const [part, rgb] of Object.entries(colours)) {
      assert.ok(parts.has(part), `the ${kind}'s ${coat} coat colours a part it has (${part})`);
      assert.ok(rgb.length === 3 && rgb.every((value) => value >= 0 && value <= 255));
    }
  }
}
{
  const colourOf = (animal) => {
    let mesh;
    animal.object.traverse((object) => object.isSkinnedMesh && (mesh = object));
    return Array.from(mesh.geometry.attributes.color.array.slice(0, 3000)).join();
  };
  const seen = new Set();
  for (const coat of Object.keys(COATS.horse)) {
    const horse = await createAnimal("horse", coat);
    assert.equal(horse.coat, coat);
    seen.add(colourOf(horse));
    assert.ok(PACK.coats[coat], `the pack has a word for a ${coat} horse`);
    horse.dispose();
  }
  assert.equal(seen.size, Object.keys(COATS.horse).length, "each coat is its own colours");
  assert.equal((await createAnimal("horse", "plaid")).coat, "bay", "an unknown coat is the first");
  assert.equal((await createAnimal("cow", "black")).coat, null, "a cow has the one coat");
  assert.equal(coatFor("cow", 5), null);
  assert.ok(Object.keys(COATS.husky).length >= 3 && Object.keys(COATS.shiba).length >= 3, "dogs have coats");
}

// ── A world's herd ───────────────────────────────────────────────────────────
const horseCoats = [];
for (const seed of [4242, 51, 7]) {
  const world = createWorld(seed);
  const herd = herdFor(world, seed);
  assert.deepEqual(herdFor(world, seed), herd, "the same world has the same animals");
  assert.ok(herd.length >= 6, `a world has animals (${herd.length})`);
  for (const beast of herd) {
    assert.ok(ANIMALS[beast.kind], `a ${beast.kind} is an animal the game knows`);
    assert.ok(waterAt(beast.x, beast.z).depth <= 0, `the ${beast.kind} starts on dry ground`);
    assert.ok(!world.blocked(beast.x, beast.z, 0.5), `the ${beast.kind} doesn't start inside something`);
    assert.ok(beast.range > 0);
  }
  for (const beast of herd)
    assert.equal(beast.coat, coatFor(beast.kind, 0) === null ? null : beast.coat, "only some kinds have coats");
  for (const beast of herd.filter((entry) => COATS[entry.kind]))
    assert.ok(COATS[beast.kind][beast.coat], `the ${beast.kind} has a coat it can have (${beast.coat})`);
  horseCoats.push(...herd.filter((entry) => entry.kind === "horse").map((entry) => entry.coat));
  const kinds = new Set(herd.map((beast) => beast.kind));
  assert.ok(kinds.has("deer"), "deer in the country");
  assert.ok(kinds.has("husky") || kinds.has("shiba"), "a dog about the settlement");
  // The wild ones start away from the houses.
  const townHalf = world.layout.townHalf;
  for (const beast of herd.filter((entry) => ["deer", "stag", "wolf", "fox"].includes(entry.kind))) {
    assert.ok(Math.max(Math.abs(beast.x), Math.abs(beast.z)) > townHalf, `the ${beast.kind} keeps out of town`);
  }
  world.dispose();
}

assert.ok(new Set(horseCoats).size >= 3, `horses come in a mix of coats (${[...new Set(horseCoats)].join(", ")})`);

// ── Going about, running away, being ridden ──────────────────────────────────
{
  const world = createWorld(4242);
  const herd = createHerd();
  herd.setWorld(world, 4242);
  await new Promise((resolve) => setTimeout(resolve, 600)); // their bodies load
  const start = herd.snapshot();
  assert.ok(
    start.every((beast) => beast.loaded),
    "every animal's body loads",
  );
  const player = { x: 0, y: 0, z: 0 };
  const run = (seconds) => {
    for (let t = 0; t < seconds; t += 0.1) herd.update(0.1, { player });
  };
  // Left alone near the player, they wander; nothing ends up in the river or in a wall.
  const first = start.find((beast) => beast.kind === "husky" || beast.kind === "shiba");
  Object.assign(player, { x: first.x + 30, z: first.z });
  run(240);
  const later = herd.snapshot();
  const moved = later.filter((beast, i) => Math.hypot(beast.x - start[i].x, beast.z - start[i].z) > 1);
  assert.ok(moved.length >= 1, "animals near the player go about");
  for (const beast of later) {
    assert.ok(waterAt(beast.x, beast.z).depth <= 0.31, `the ${beast.kind} stays out of the river`);
    assert.ok(Number.isFinite(beast.x) && Number.isFinite(beast.z));
  }
  // A deer runs from the player.
  const deer = later.find((beast) => beast.kind === "deer");
  Object.assign(player, { x: deer.x + 3, z: deer.z });
  run(4);
  const fled = herd.snapshot().find((beast) => beast.id === deer.id);
  assert.ok(Math.hypot(fled.x - player.x, fled.z - player.z) > 9, "a deer bolts when the player comes close");
  // A horse or a donkey can be ridden; a cow can't.
  const mountable = herd.snapshot().find((beast) => ANIMALS[beast.kind].back > 0);
  if (mountable) {
    const listed = herd.mounts({ x: mountable.x, z: mountable.z }, 3);
    assert.ok(
      listed.some((entry) => entry.id === mountable.id),
      "it's offered to ride",
    );
    const mount = herd.ride(mountable.id);
    assert.ok(mount.back > 0.9 && mount.gallop > mount.walk);
    assert.equal(herd.ride(mountable.id), null, "one rider at a time");
    assert.equal(herd.carry(mountable.id, mountable.x + 5, mountable.z + 2, 1, 6), 0, "on the ground, no rise");
    assert.ok(herd.carry(mountable.id, mountable.x + 5, mountable.z + 2, 1, 6, 0.5) > 0.3, "mid-jump, its back is up");
    herd.carry(mountable.id, mountable.x + 5, mountable.z + 2, 1, 6);
    Object.assign(player, { x: mountable.x + 5, z: mountable.z + 2 });
    run(1);
    const carried = herd.snapshot().find((beast) => beast.id === mountable.id);
    assert.equal(carried.x, mountable.x + 5, "ridden, it goes where the rider takes it and nowhere else");
    assert.equal(herd.mounts({ x: carried.x, z: carried.z }, 3).length, 0, "nobody else can take it meanwhile");
    herd.release(mountable.id);
    run(30);
    const left = herd.snapshot().find((beast) => beast.id === mountable.id);
    assert.ok(Math.hypot(left.x - carried.x, left.z - carried.z) < 6, "let go, it stays about where it was left");
  }
  // Mid-jump, a horse passes over the low things (a fence) but not through a house.
  {
    let fences = 0;
    let walls = 0;
    const half = world.layout.townHalf + 20;
    for (let x = -half; x <= half; x += 0.5) {
      for (let z = -half; z <= half; z += 0.5) {
        const pushed = (overLow) => {
          const at = { x, z };
          world.resolveCollisions(at, 0.6, true, overLow);
          return Math.hypot(at.x - x, at.z - z) > 1e-6;
        };
        if (pushed(false) && !pushed(true)) fences++;
        if (pushed(true)) walls++;
      }
    }
    assert.ok(fences > 20, `a jump clears the low things (${fences})`);
    assert.ok(walls > 200, `and nothing else (${walls})`);
  }
  const cow = herd.snapshot().find((beast) => beast.kind === "cow");
  if (cow) assert.equal(herd.ride(cow.id), null, "a cow isn't for riding");
  // Animals of someone's own: with their owner they keep up; sent home they go back to their door.
  {
    const wolves = herd.snapshot().filter((beast) => beast.kind === "wolf");
    assert.ok(wolves.length >= 3, `wolves come in a pack (${wolves.length})`);
    const home = { x: player.x + 3, z: player.z };
    const pets = (out) => [
      { id: "pet:you:dog", kind: "husky", coat: "black", owner: "you", out, home },
      { id: "pet:you:horse", kind: "horse", coat: "grey", owner: "you", out, home: { x: home.x + 3, z: home.z } },
    ];
    const before = herd.snapshot().length;
    herd.setOwned(pets(true));
    herd.setOwned(pets(true));
    assert.equal(herd.snapshot().length, before + 2, "each is there once, however often it's said");
    await new Promise((resolve) => setTimeout(resolve, 300));
    const dog = () => herd.snapshot().find((beast) => beast.id === "pet:you:dog");
    assert.ok(dog().loaded && dog().owner === "you" && dog().out === true && dog().coat === "black");
    // The owner walks off; the dog keeps up, and the horse can be ridden.
    const owner = { x: player.x, z: player.z };
    for (let t = 0; t < 12; t += 0.1) {
      owner.x += 0.25;
      herd.update(0.1, { player: owner, owners: new Map([["you", owner]]) });
    }
    assert.ok(Math.hypot(dog().x - owner.x, dog().z - owner.z) < 8, "a dog keeps up with its owner");
    assert.ok(
      herd.mounts(owner, 12).some((entry) => entry.id === "pet:you:horse"),
      "your own horse can be ridden",
    );
    // Left far behind, it turns up beside them.
    owner.x += 80;
    herd.update(0.1, { player: owner, owners: new Map([["you", owner]]) });
    assert.ok(Math.hypot(dog().x - owner.x, dog().z - owner.z) < 6, "left far behind, it turns up beside them");
    // Indoors, it waits; sent home, it goes back.
    const waited = dog();
    herd.update(1, { player: owner, owners: new Map([["you", { x: owner.x + 20, z: owner.z, inside: true }]]) });
    assert.equal(dog().x, waited.x, "it waits outside while they're indoors");
    herd.setOwned(pets(false));
    Object.assign(owner, { x: home.x + 10, z: home.z });
    for (let t = 0; t < 240; t += 0.1) herd.update(0.1, { player: owner, owners: new Map([["you", owner]]) });
    assert.ok(Math.hypot(dog().x - home.x, dog().z - home.z) < 30, "sent home, it heads back there");
    herd.setOwned([pets(false)[1]]);
    assert.equal(dog(), undefined, "no longer theirs, it's gone");
    herd.setOwned([]);
    assert.equal(herd.snapshot().length, before);
  }
  herd.detach();
  assert.equal(herd.snapshot().length, 0);
  world.dispose();
}

console.log("wanderworld animals regression: OK");
