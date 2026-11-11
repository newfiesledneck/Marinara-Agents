// Wanderworld's animals, without a browser: each kind built from the kit files on disk (kit/creatures/, a
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

const kit = join(dirname(fileURLToPath(import.meta.url)), "../packages/wanderworld/kit/creatures");
globalThis.fetch = async (url) => {
  const name = String(url).split("/kit/creatures/")[1];
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
    // (A flyer's wings, or a slime's wobble, change how tall it measures from one moment to the next.)
    Math.abs(height - wanted) < wanted * (facts.group === "monsters" ? 0.5 : 0.2),
    `the ${kind} stands about ${wanted} m tall (${height.toFixed(2)})`,
  );
  // (A flyer is in the air: its legs and wings rise and fall with its wingbeat.)
  if (!facts.fly)
    assert.ok(Math.abs(standing.min.y) < 0.12, `the ${kind} stands on the ground (${standing.min.y.toFixed(3)})`);
  else assert.ok(standing.min.y > -0.1 && standing.min.y < 0.4, `the ${kind} hovers just over where it's put`);
  // (Four-legged animals; a slime, a bat or a spider is as wide as it's long.)
  if (facts.group !== "monsters")
    assert.ok(
      standing.max.z - standing.min.z > standing.max.x - standing.min.x,
      `the ${kind} is longer than it is wide`,
    );
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
      Math.max(...rises) > wanted * 0.2 && Math.max(...rises) < 1.2, // (for its size: a dog's is a dog's)
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
  fetch("x/kit/creatures/dragon.json").then((r) => (r.ok ? r : Promise.reject(new Error("404")))),
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
    const mine = herd.mounts(owner, 12).find((entry) => entry.id === "pet:you:horse");
    assert.equal(mine?.owner, "you", "a horse of someone's own says whose it is (theirs to ride, nobody else's)");
    assert.ok(
      herd.mounts(owner, 400).some((entry) => entry.owner === null),
      "the rest are anyone's",
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
  // What the lore asks for: a pack of five large wolves at a spot, deer anywhere; a size on someone's own.
  {
    const before = herd.snapshot().length;
    const spot = { x: player.x + 30, z: player.z + 10 };
    const asked = [
      { id: "place:0:forest1:wolf", kind: "wolf", scale: 1.25, sized: true, count: 5, at: spot },
      { id: "place:1:world:deer", kind: "deer", scale: 1, sized: false, count: 0, at: null },
      { id: "place:2:world:goblin", kind: "goblin", scale: 1, sized: false, count: 3, at: null },
    ];
    herd.setSpawns(asked);
    herd.setSpawns(asked);
    const lore = herd.snapshot().filter((beast) => beast.lore);
    const pack = lore.filter((beast) => beast.kind === "wolf");
    assert.equal(pack.length, 5, "a pack of five where five were asked for");
    assert.ok(
      pack.every((beast) => beast.scale === 1.25),
      "each as large as asked",
    );
    assert.ok(
      pack.every((beast) => Math.hypot(beast.x - spot.x, beast.z - spot.z) < 22),
      "about the place asked for",
    );
    const deer = lore.filter((beast) => beast.kind === "deer");
    assert.ok(deer.length >= 1 && deer.length <= 4, `however many, where no number was given (${deer.length})`);
    assert.ok(
      deer.every((beast) => beast.scale > 0.9 && beast.scale < 1.13),
      "and about the usual size",
    );
    assert.equal(lore.length, pack.length + deer.length, "nothing for a creature the game has no body for");
    herd.setSpawns([]);
    assert.equal(herd.snapshot().length, before, "no longer asked for, they're gone");
    // A big horse of someone's own sits higher.
    herd.setOwned([
      { id: "pet:you:horse", kind: "horse", coat: "bay", scale: 1.25, owner: "you", out: false, home: spot },
    ]);
    await new Promise((resolve) => setTimeout(resolve, 200));
    const big = herd.mounts(spot, 6).find((entry) => entry.id === "pet:you:horse");
    assert.ok(Math.abs(big.back - ANIMALS.horse.back * 1.25) < 1e-6, "a large horse's back is higher");
    herd.setOwned([]);
    // A dog big enough is ridden; a medium one isn't.
    const { dogBody } = await import("../packages/wanderworld/src/animals.js");
    const dogs = ["medium", "huge"].map((size) => ({
      id: `pet:${size}:dog`,
      ...dogBody(size),
      coat: "black",
      owner: size,
      out: false,
      home: spot,
    }));
    herd.setOwned(dogs);
    await new Promise((resolve) => setTimeout(resolve, 200));
    const offered = herd.mounts(spot, 8).map((entry) => entry.id);
    assert.ok(
      offered.includes("pet:huge:dog") && !offered.includes("pet:medium:dog"),
      "a huge dog can be ridden, a medium one can't",
    );
    assert.equal(herd.ride("pet:medium:dog"), null);
    assert.ok(herd.ride("pet:huge:dog").back > 0.8, "and its back is high enough to sit on");
    herd.release("pet:huge:dog");
    herd.setOwned([]);
  }
  herd.detach();
  assert.equal(herd.snapshot().length, 0);
  world.dispose();
}

// The keywords for animals: someone's own, and what lives where; a doubled colon reads as one.
{
  const { animalKind } = await import("../packages/wanderworld/src/animals.js");
  const { petsFromLore, readKeys, readKeyword, spawnsFromLore, creatureFromWords } =
    await import("../packages/wanderworld/src/keywords.js");
  assert.deepEqual(
    readKeyword("ww::pet::horse::large::brown::Shadowmere"),
    readKeyword("ww:pet:horse:large:brown:Shadowmere"),
  );
  assert.ok(readKeyword("ww:pet:cat").problem, "a pet the game hasn't is said so");
  const entry = (title, keys) => ({ id: title, title, keys: readKeys(keys).keys });
  const books = [
    {
      id: "b",
      name: "B",
      entries: [
        entry("Greenwood", ["ww:forest1", "ww::monster::wolf::large::pack5", "ww:creature:deer"]),
        entry("Mira", ["ww:Mira", "ww::pet::horse::Shadowmere::brown::large", "ww:pet:dog:great dane:Brutus"]),
        entry("Me", ["ww:you", "ww:pet:dog:small:cream"]),
        entry("Wolf", ["ww:monster:Wolf", "ww:found in:forest1", "ww:pack:4", "ww:size:huge"]),
      ],
    },
  ];
  assert.deepEqual(spawnsFromLore(books), [
    { place: "forest1", kind: "wolf", size: "large", count: 5, temper: "", when: "" },
    { place: "forest1", kind: "deer", size: "", count: 0, temper: "", when: "" },
  ]);
  assert.deepEqual(petsFromLore(books), [
    { owner: "Mira", role: "horse", size: "large", colour: "brown", name: "Shadowmere", species: "" },
    { owner: "Mira", role: "dog", size: "", colour: "", name: "Brutus", species: "great dane" },
    { owner: "you", role: "dog", size: "small", colour: "cream", name: "", species: "" },
  ]);
  // A creature's own entry is still what it is, with its size, and isn't a spawn by its mark alone.
  const own = creatureFromWords(books[0].entries[3].keys);
  assert.deepEqual([own.pack, own.size, own.found], [4, "huge", ["forest1"]]);
  assert.ok(books[0].entries[3].keys.includes("monster") && !books[0].entries[0].keys.includes("monster"));
  assert.deepEqual(
    ["wolves", "Hound", "goblin", "pony", "deer", "Slimes", "skeleton", "bats"].map(animalKind),
    ["wolf", "husky", null, "horse", "deer", "slime", "skeleton", "bat"],
    "the words for the animals the game has, and none for the ones it hasn't",
  );
}

// How many of each sort, which kinds at all, and dogs by size.
{
  const { DOG_SIZES, dogBody, dogSizeOf, POPULATION, SORT_OF } = await import("../packages/wanderworld/src/animals.js");
  const world = createWorld(4242);
  const tally = (options) => {
    const counts = {};
    for (const beast of herdFor(world, 4242, options))
      counts[SORT_OF[beast.kind]] = (counts[SORT_OF[beast.kind]] ?? 0) + 1;
    return counts;
  };
  const none = { strays: 0, farm: 0, wild: 0, hostile: 0, monsters: 0 };
  assert.deepEqual(tally({ counts: none }), {}, "every sort at 0: none of the world's own");
  assert.deepEqual(tally({ counts: { ...none, hostile: 15 } }), { hostile: 15 }, "fifteen hostile: fifteen wolves");
  assert.deepEqual(tally({ counts: { ...none, hostile: 15 }, off: ["wolf"] }), {}, "wolves switched off: none");
  assert.deepEqual(tally({ counts: { ...none, wild: 20, strays: 6 } }), { wild: 20, strays: 6 });
  assert.equal(tally({ counts: { ...none, wild: 20 }, off: ["deer", "stag"] }).wild, 20, "only foxes left: all foxes");
  assert.deepEqual(
    tally({ counts: { ...none, strays: 6 }, off: ["husky", "shiba"] }),
    {},
    "dogs switched off: no strays",
  );
  assert.equal(tally().hostile, POPULATION.hostile, "left alone, the usual number");
  // Monsters: the number asked for, of the kinds switched on, the night's ones about only at night.
  assert.equal(tally().monsters, POPULATION.monsters, "and the usual number of monsters");
  const horde = herdFor(world, 4242, { counts: { ...none, monsters: 20 } });
  assert.equal(horde.length, 20);
  assert.ok(new Set(horde.map((beast) => beast.kind)).size >= 4, "of several kinds");
  for (const beast of horde) {
    assert.equal(ANIMALS[beast.kind].group, "monsters");
    assert.equal(beast.when ?? "any", ANIMALS[beast.kind].when ?? "any", `the ${beast.kind} is about when its kind is`);
  }
  const slimes = herdFor(world, 4242, {
    counts: { ...none, monsters: 9 },
    off: ["skeleton", "spider", "rat", "snake", "bat", "wasp"],
  });
  assert.ok(slimes.length === 9 && slimes.every((beast) => beast.kind === "slime"), "only the kinds left on");
  // Wolves keep to their packs: several of them, some sharing a home, none bigger than five.
  const packs = new Map();
  for (const wolf of herdFor(world, 4242, { counts: { ...none, hostile: 15 } })) {
    const key = `${wolf.home?.x ?? wolf.x}:${wolf.home?.z ?? wolf.z}`;
    packs.set(key, (packs.get(key) ?? 0) + 1);
  }
  const packSizes = [...packs.values()];
  assert.ok(
    packs.size >= 3 && Math.max(...packSizes) <= 5 && Math.max(...packSizes) >= 2,
    `packs of ${packSizes.join(", ")}`,
  );
  world.dispose();
  // A dog's five sizes: evenly spaced, the small body for the two smaller, each standing as tall as it says.
  const sizes = Object.values(DOG_SIZES);
  for (let i = 2; i < sizes.length; i++)
    assert.ok(Math.abs(sizes[i] - sizes[i - 1] - (sizes[1] - sizes[0])) < 1e-9, "evenly spaced");
  assert.deepEqual(
    Object.keys(DOG_SIZES).map((size) => dogBody(size).kind),
    ["shiba", "shiba", "husky", "husky", "husky"],
  );
  for (const [size, tall] of Object.entries(DOG_SIZES)) {
    const { kind, scale } = dogBody(size);
    assert.ok(Math.abs(index.animals[kind].height * scale - tall) < 0.01, `a ${size} dog stands ${tall} m`);
    assert.equal(dogSizeOf(kind, scale), size);
  }
  assert.ok(Math.abs(DOG_SIZES.massive - index.animals.horse.height) < 0.2, "a massive dog is as tall as a horse");
  assert.equal(DOG_SIZES.small, 0.5, "and a small one is as small as it was");
  assert.deepEqual(
    Object.keys(COATS.husky).sort(),
    Object.keys(COATS.shiba).sort(),
    "both dogs come in the same coats",
  );
}

// Hostile animals, what the lore says a kind is like, night and day, the town's share, and quiet places.
{
  const { quietFromLore, readKeys, spawnsFromLore, creatureFromWords } =
    await import("../packages/wanderworld/src/keywords.js");
  const world = createWorld(4242);
  const herd = createHerd();
  const none = { strays: 0, farm: 0, wild: 0, hostile: 0, monsters: 0, town: 0 };
  herd.setWorld(world, 4242, { counts: none });
  // A spot out in the open, away from town, to stand at.
  const out = world.layout.townHalf + 60;
  const player = { x: out, y: 0, z: out };
  const wolfAt = (id, more = {}) => ({
    id,
    kind: "wolf",
    scale: 1,
    sized: true,
    count: 1,
    at: { x: out + 12, z: out },
    ...more,
  });
  const run = (seconds, view) => {
    for (let t = 0; t < seconds; t += 0.1) herd.update(0.1, { player, ...view });
  };
  const wolf = () => herd.snapshot().find((beast) => beast.kind === "wolf");
  const far = () => Math.hypot(wolf().x - player.x, wolf().z - player.z);
  herd.setSpawns([wolfAt("a")]);
  await new Promise((resolve) => setTimeout(resolve, 300));
  assert.equal(wolf().temper, "hostile", "a wolf is hostile unless something says otherwise");
  // Squaring up: it comes to about six paces and holds there, and the game is told once.
  run(12, { hostile: "threaten" });
  assert.ok(far() > 4 && far() < 8, `it holds about six paces off (${far().toFixed(1)} m)`);
  const told = herd.takeEvents();
  assert.deepEqual(
    told.map((event) => event.type),
    ["threat"],
    "and that's told, once",
  );
  assert.equal(herd.takeEvents().length, 0);
  // Coming for them: it closes and snaps, then draws off.
  run(8, { hostile: "attack" });
  assert.ok(
    herd.takeEvents().some((event) => event.type === "attack" && event.kind === "wolf"),
    "let attack, it does",
  );
  // Somewhere confrontations aren't allowed, or kept from hostility, it leaves them be (and runs if they come close).
  herd.setSpawns([wolfAt("b")]);
  await new Promise((resolve) => setTimeout(resolve, 300));
  run(10, { hostile: "attack", safe: true });
  assert.equal(herd.takeEvents().length, 0, "nothing in a safe place");
  run(10, { hostile: "avoid" });
  assert.equal(herd.takeEvents().length, 0, "nor when hostile animals keep their distance");
  // Tame by the lore: every wolf, and one the lore puts somewhere tame.
  herd.setTempers({ wolf: "tame" });
  assert.equal(wolf().temper, "tame");
  run(10, { hostile: "attack" });
  assert.equal(herd.takeEvents().length, 0, "a tame wolf is no danger");
  herd.setTempers({});
  herd.setSpawns([wolfAt("c", { temper: "tame" }), { ...wolfAt("d", { when: "night" }), kind: "deer" }]);
  await new Promise((resolve) => setTimeout(resolve, 300));
  assert.equal(wolf().temper, "tame", "one the lore calls tame is, among hostile ones");
  // About only by night: out of sight by day.
  const deer = () => herd.snapshot().find((beast) => beast.kind === "deer");
  run(1, { night: false });
  assert.equal(deer().shown, false, "by day it's in its den");
  run(1, { night: true });
  assert.equal(deer().shown, true, "and out at night");
  herd.detach();

  // The settlement's share: the rest are put outside it.
  const inTown = (beast) => Math.max(Math.abs(beast.x), Math.abs(beast.z)) < world.layout.townHalf;
  const crowded = herdFor(world, 4242, { counts: { ...none, strays: 10, farm: 10, town: 99 } });
  const capped = herdFor(world, 4242, { counts: { ...none, strays: 10, farm: 10, town: 3 } });
  assert.ok(crowded.filter(inTown).length > 3, `uncapped, the town has plenty (${crowded.filter(inTown).length})`);
  assert.ok(capped.filter(inTown).length <= 3, `capped at three, three at most (${capped.filter(inTown).length})`);
  assert.equal(capped.filter((beast) => beast.kind !== "horse").length, 10, "and every dog is still somewhere");
  // Quiet places: none anywhere, none in the country, none round a spot.
  assert.equal(herdFor(world, 4242, { quiet: { all: true } }).length, 0);
  const tame = herdFor(world, 4242, { quiet: { wild: true } });
  assert.ok(tame.length > 0 && tame.every((beast) => !["deer", "stag", "fox", "wolf"].includes(beast.kind)));
  const plaza = world.layout.plaza;
  const kept = herdFor(world, 4242, {
    counts: { ...none, strays: 8, town: 99 },
    quiet: { areas: [{ x: plaza.x, z: plaza.z, r: 12 }] },
  });
  assert.ok(
    kept.length > 0 && kept.every((beast) => Math.hypot(beast.x - plaza.x, beast.z - plaza.z) >= 12),
    "none where the lore keeps them out",
  );
  world.dispose();

  // The keywords behind them.
  const entry = (title, keys) => ({ id: title, title, keys: readKeys(keys).keys });
  const books = [
    {
      id: "b",
      name: "B",
      entries: [
        entry("Garden", ["ww:garden1", "ww:animals:none"]),
        entry("Greenwood", ["ww:forest1", "ww:monster:wolf:tame:night:3"]),
        entry("Wolf", ["ww:creature:Wolf", "ww:tame", "ww:active:night"]),
      ],
    },
  ];
  assert.deepEqual(quietFromLore(books), ["garden1"]);
  assert.deepEqual(spawnsFromLore(books), [
    { place: "forest1", kind: "wolf", size: "", count: 3, temper: "tame", when: "night" },
  ]);
  const own = creatureFromWords(books[0].entries[2].keys);
  assert.deepEqual([own.tame, own.when], [true, "night"]);
}

// What lore says of someone with a dog or a horse of their own, and of someone without.
for (const [text, dog, horse] of [
  ["Her loyal old hound sleeps by the fire.", true, false],
  ["She rides her grey mare to market.", false, true],
  ["He has a horse and a temper.", false, true],
  ["They keep a pony and a small dog.", false, true],
  ["A baker with no pets, who hates horses.", false, false],
  ["The workhorse of the guild, dogged in everything.", false, false],
]) {
  assert.equal(PACK.dogLore.test(text), dog, `a dog of their own: "${text}"`);
  assert.equal(PACK.horseLore.test(text), horse, `a horse of their own: "${text}"`);
}

console.log("wanderworld animals regression: OK");
