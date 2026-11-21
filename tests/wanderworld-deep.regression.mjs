// Wanderworld's deep places (deep.js, deepcave.js): the levels below a cave's mouth. Plans are the same for
// the same seed; every room can be walked to from where you come in, through passages at least the
// narrowest allowed; you come in, go down and meet creatures on the open floor; and the colliders keep
// anyone walking about inside the rock's edge. dungeon.js's dungeons and strongholds are held to the same.
// Run: node tests/wanderworld-deep.regression.mjs
import assert from "node:assert/strict";
import { dungeonPlan } from "../packages/wanderworld/src/dungeon.js";
import { createHerd } from "../packages/wanderworld/src/herd.js";
import { boxesOf, createDeep, creaturesFor, deepPlan, deepSeed, leadsDown } from "../packages/wanderworld/src/deep.js";
import { CELL, cavePlan, cavernPlan, intoRoom, MIN_WIDTH, openAt } from "../packages/wanderworld/src/deepcave.js";
import { SRD_CREATURES } from "../packages/wanderworld/src/srd.js";
import { createCollider, rng } from "../packages/wanderworld/src/world.js";

const RADIUS = 0.35; // the player's (main.js PLAYER_RADIUS)
const STEP = 0.5; // metres between the points walked to, finding what can be reached

/** The level's colliders as the game builds them, and whether someone could stand at (x, z). */
function walls(plan) {
  const collider = createCollider(
    [],
    plan.colliders.flatMap(boxesOf).map((shape, id) => ({ id, ...shape })),
  );
  const open = openAt(plan);
  const free = (x, z) => open(x, z) >= RADIUS && !collider.insideBox(x, z, RADIUS);
  return { collider, open, free };
}

/** Every grid point that can be walked to from where you come in. */
function reachable(plan, free) {
  const { minX, minZ } = plan.bounds;
  const key = (i, j) => `${i},${j}`;
  const toGrid = (x, z) => [Math.round((x - minX) / STEP), Math.round((z - minZ) / STEP)];
  const seen = new Set();
  const start = toGrid(plan.entry.x, plan.entry.z);
  const queue = [start];
  seen.add(key(...start));
  while (queue.length) {
    const [i, j] = queue.pop();
    for (const [di, dj] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const ni = i + di;
      const nj = j + dj;
      if (seen.has(key(ni, nj)) || !free(minX + ni * STEP, minZ + nj * STEP)) continue;
      seen.add(key(ni, nj));
      queue.push([ni, nj]);
    }
  }
  /** Whether some reached point is within `reach` of (x, z). */
  return (x, z, reach = STEP * 1.5) => {
    const [ci, cj] = toGrid(x, z);
    const cells = Math.ceil(reach / STEP);
    for (let i = ci - cells; i <= ci + cells; i++)
      for (let j = cj - cells; j <= cj + cells; j++)
        if (seen.has(key(i, j)) && Math.hypot(minX + i * STEP - x, minZ + j * STEP - z) <= reach) return true;
    return false;
  };
}

/** How wide the way is across `passage` at the point `t` of the way along its segment `i`. */
function widthAcross(passage, i, t, open, collider) {
  const a = passage.points[i - 1];
  const b = passage.points[i];
  const length = Math.hypot(b.x - a.x, b.z - a.z) || 1;
  const across = [-(b.z - a.z) / length, (b.x - a.x) / length];
  const x = a.x + (b.x - a.x) * t;
  const z = a.z + (b.z - a.z) * t;
  let width = 0;
  for (const side of [1, -1]) {
    for (let out = 0; out < 20; out += 0.05) {
      const px = x + across[0] * out * side;
      const pz = z + across[1] * out * side;
      if (open(px, pz) < 0 || collider.insideBox(px, pz, 0)) break;
      width += 0.05;
    }
  }
  return width;
}

/** Everything a level plan must hold to, for any kind. */
function check(plan, label) {
  const { collider, open, free } = walls(plan);
  for (const field of ["rooms", "passages", "pieces", "colliders", "lights", "spawns"])
    assert.ok(Array.isArray(plan[field]), `${label}: ${field} is a list`);
  assert.ok(free(plan.entry.x, plan.entry.z), `${label}: you come in on the open floor`);
  const reached = reachable(plan, free);
  for (const room of plan.rooms) {
    // Somewhere well inside it can be walked to (its middle may hold a pillar or a tower).
    let inRoom = false;
    for (let x = room.x - room.w / 2; x <= room.x + room.w / 2 && !inRoom; x += STEP)
      for (let z = room.z - room.d / 2; z <= room.z + room.d / 2 && !inRoom; z += STEP)
        inRoom = intoRoom(room, x, z) >= 0.5 && free(x, z) && reached(x, z, STEP);
    assert.ok(inRoom, `${label}: room ${room.id} can be walked to`);
  }
  if (plan.down) {
    assert.ok(free(plan.down.x, plan.down.z), `${label}: the way down is on the open floor`);
    assert.ok(reached(plan.down.x, plan.down.z), `${label}: the way down can be walked to`);
  }
  for (const passage of plan.passages) {
    assert.ok(passage.width >= MIN_WIDTH, `${label}: passage ${passage.from}→${passage.to} is wide enough`);
    for (let i = 1; i < passage.points.length; i++)
      for (const t of [0.25, 0.5, 0.75]) {
        const width = widthAcross(passage, i, t, open, collider);
        assert.ok(width >= MIN_WIDTH - CELL, `${label}: ${width.toFixed(2)} m across passage ${passage.to}`);
      }
  }
  for (const spawn of plan.spawns) {
    assert.ok(free(spawn.x, spawn.z), `${label}: the ${spawn.tag} spawn is on the open floor`);
    assert.ok(reached(spawn.x, spawn.z), `${label}: the ${spawn.tag} spawn can be walked to`);
  }
  // Someone walking about at random, pushed out of whatever they walk into, stays out of the rock.
  const random = rng(plan.seed);
  const at = { x: plan.entry.x, y: 0, z: plan.entry.z };
  let heading = plan.entry.angle;
  for (let step = 0; step < 4000; step++) {
    heading += (random() - 0.5) * 0.8;
    at.x += Math.sin(heading) * 0.15;
    at.z += Math.cos(heading) * 0.15;
    collider.resolve(at, RADIUS);
    assert.ok(open(at.x, at.z) > -RADIUS, `${label}: walked into the rock at ${at.x.toFixed(1)}, ${at.z.toFixed(1)}`);
  }
}

// ── The same seed, the same place ──
for (const make of [cavePlan, cavernPlan]) {
  assert.deepEqual(make(1234, 2), make(1234, 2), `${make.name}: the same seed makes the same plan`);
  assert.notDeepEqual(make(1234, 2), make(4321, 2), `${make.name}: another seed, another plan`);
}
assert.equal(deepSeed("seed:3", 2), deepSeed("seed:3", 2), "a level's seed comes from its entrance and depth");
assert.notEqual(deepSeed("seed:3", 2), deepSeed("seed:3", 3), "each depth its own");
assert.deepEqual(deepPlan(77, 1, "cave"), cavePlan(77, 1), "a cave is deepcave.js's");
assert.deepEqual(deepPlan(77, 2, "cavern"), cavernPlan(77, 2), "and a cavern");
assert.deepEqual(deepPlan(77, 2, "dungeon"), dungeonPlan(77, 2, "dungeon"), "a dungeon is dungeon.js's");
assert.deepEqual(deepPlan(77, 2, "stronghold"), dungeonPlan(77, 2, "stronghold"), "and a stronghold");
assert.deepEqual(deepPlan(77, 2, "tunnel"), cavePlan(77, 2), "a kind with no plan of its own is a cave");
for (let seed = 1; seed < 20; seed++)
  assert.equal(deepPlan(seed, 4, "dungeon").down, null, "nothing goes deeper than four levels, whatever the kind");

// Which caves lead down: none, all, or a share, the same each time.
const caves = Array.from({ length: 200 }, (_, i) => `world:${i}`);
assert.equal(caves.filter((cave) => leadsDown(cave, 0)).length, 0);
assert.equal(caves.filter((cave) => leadsDown(cave, 1)).length, caves.length);
const half = caves.filter((cave) => leadsDown(cave, 0.5)).length;
assert.ok(half > 70 && half < 130, `about half lead down at 0.5 (${half})`);
assert.deepEqual(
  caves.filter((cave) => leadsDown(cave, 0.5)),
  caves.filter((cave) => leadsDown(cave, 0.5)),
);

// ── Every level holds to the rules ──
const kinds = new Set();
for (let seed = 1; seed <= 24; seed++) {
  for (const depth of [1, 2, 3, 4]) {
    for (const make of [cavePlan, cavernPlan]) {
      const plan = make(seed * 7919, depth);
      kinds.add(plan.down?.kind ?? "none");
      check(plan, `${plan.kind} ${seed} at ${depth}`);
      if (depth === 4) assert.equal(plan.down, null, "the deepest level has no way down");
    }
  }
}
for (const kind of ["cavern", "dungeon", "stronghold", "cave", "none"])
  assert.ok(kinds.has(kind), `ways down lead to ${kind} too`);

// ── Built: a mesh within a phone's budget, colliders as planned ──
for (const make of [cavePlan, cavernPlan]) {
  const plan = make(31337, 2);
  const level = createDeep(plan);
  let triangles = 0;
  level.scene.traverse((object) => {
    if (object.geometry) triangles += object.geometry.getAttribute("position").count / 3;
  });
  assert.ok(triangles < 30000, `${plan.kind}: ${triangles} triangles`);
  assert.ok(level.blocked(plan.bounds.minX + 0.5, plan.bounds.minZ + 0.5), `${plan.kind}: the rock is blocked`);
  assert.ok(!level.blocked(plan.entry.x, plan.entry.z), `${plan.kind}: where you come in isn't`);
  const at = { x: plan.entry.x, y: 0, z: plan.entry.z };
  level.resolveCollisions(at, RADIUS);
  assert.deepEqual([at.x, at.z], [plan.entry.x, plan.entry.z], "standing where you come in, nothing pushes you");
  level.update(0.016, { position: { x: 0, y: 9, z: 0 } }, at);
  level.dispose();
}

// A turned box is covered by its strips, and a square one is itself.
assert.deepEqual(boxesOf({ x: 1, z: 2, w: 2, d: 0.4, angle: Math.PI / 2 }), [
  { minX: 0.8, maxX: 1.2, minZ: 1, maxZ: 3 },
]);
const strips = boxesOf({ x: 0, z: 0, w: 2, d: 0.4, angle: Math.PI / 4 });
const inStrips = (x, z) => strips.some((b) => x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ);
for (const t of [-0.9, -0.4, 0, 0.4, 0.9]) assert.ok(inStrips(Math.cos(Math.PI / 4) * t, -Math.sin(Math.PI / 4) * t));
assert.ok(!inStrips(0.7, 0.7), "and not much past it");

// ── Who lives there ──
const plan = cavernPlan(2024, 3);
const dwellers = creaturesFor(plan, 1);
assert.deepEqual(dwellers, creaturesFor(plan, 1), "the same level, the same creatures");
assert.ok(dwellers.length > 0, "something lives in a cavern");
for (const [i, entry] of dwellers.entries()) {
  const cr = SRD_CREATURES[entry.kind]?.cr ?? 0;
  const tag = plan.spawns[Number(entry.id.split(":").at(-1))].tag;
  assert.ok(
    cr <= (tag === "boss" ? 1.5 : 0.75),
    `${entry.kind} (CR ${cr}) suits a first-level party at depth 3 (${i})`,
  );
}
assert.ok(
  creaturesFor(plan, 1, (kind) => kind !== "slime" && kind !== "bat").every((entry) => entry.kind !== "slime"),
  "kinds switched off stay off",
);
assert.deepEqual(
  creaturesFor(plan, 1, () => false),
  [],
  "and with every kind off, nothing",
);
const cave = creaturesFor(cavePlan(5, 1), 1);
for (const entry of cave)
  assert.ok(["rat", "spider", "snake", "bat", "slime", "wolf", "kobold", "goblin"].includes(entry.kind), entry.kind);

// Put in a herd of their own, every one stands on the open floor. (Their bodies never load here: the kit's
// files are the Engine's to serve.)
globalThis.fetch = () => new Promise(() => {});
for (const make of [cavePlan, cavernPlan]) {
  const level = createDeep(make(99, 2));
  const herd = createHerd();
  herd.setWorld(level, 99, { quiet: { all: true } });
  assert.equal(herd.snapshot().length, 0, "nothing of the world's own down there");
  herd.setSpawns(creaturesFor(level.plan, 3));
  const beasts = herd.snapshot();
  assert.ok(beasts.length > 0, "the creatures are put in");
  const { free } = walls(level.plan);
  for (const beast of beasts) assert.ok(free(beast.x, beast.z), `${beast.kind} stands on the floor`);
  herd.detach();
  level.dispose();
}

// ── dungeon.js's plans hold to the same rules, and build into a level the same way ──
for (const kind of ["dungeon", "stronghold"])
  for (let seed = 1; seed <= 12; seed++)
    for (const depth of [1, 2, 3]) {
      const made = deepPlan(seed * 104729, depth, kind);
      assert.equal(made.kind, kind);
      check(made, `${kind} ${seed} at ${depth}`);
    }
for (const kind of ["dungeon", "stronghold"]) {
  const made = deepPlan(4242, 2, kind);
  const level = createDeep(made);
  assert.ok(!level.blocked(made.entry.x, made.entry.z), `${kind}: where you come in isn't blocked`);
  // Lit by the few lights nearest the player, wherever they go.
  const lamps = [];
  level.scene.traverse((object) => object.isPointLight && lamps.push(object));
  assert.ok(lamps.length <= 5, `${kind}: ${lamps.length} lights at most (the player's own, and four)`);
  level.update(1, { position: { x: 0, y: 9, z: 0 } }, { x: made.entry.x, y: 0, z: made.entry.z });
  const nearest = Math.min(...made.lights.map((light) => Math.hypot(light.x - made.entry.x, light.z - made.entry.z)));
  assert.ok(
    lamps.some(
      (lamp) => Math.abs(Math.hypot(lamp.position.x - made.entry.x, lamp.position.z - made.entry.z) - nearest) < 1e-6,
    ),
    `${kind}: the light nearest the player is lit`,
  );
  const dwelling = creaturesFor(made, 2);
  if (kind === "stronghold")
    assert.ok(
      dwelling.some((entry) => entry.kind === "bandit"),
      "bandits keep a stronghold",
    );
  level.dispose();
}

console.log("ok: deep places");
