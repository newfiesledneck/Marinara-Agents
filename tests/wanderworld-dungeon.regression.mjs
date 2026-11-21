// Dungeons and strongholds (packages/wanderworld/src/dungeon.js): the same seed makes the same level,
// every room can be walked to from the way in, doorways meet their corridors, nothing stands in anything
// else or in a doorway, everyone stands on the floor, a keep has every room it needs, and a level stays
// small enough for a phone. Run: node tests/wanderworld-dungeon.regression.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { BoxGeometry, MeshBasicMaterial } from "three";
import { buildDungeon, CELL, dungeonPlan, PIECE_BUDGET } from "../packages/wanderworld/src/dungeon.js";
import { KIT_DIRS } from "../packages/wanderworld/src/kit.js";

const PLAYER_RADIUS = 0.35; // main.js
const TRIANGLE_BUDGET = 600000;
const STEP = 0.25; // the walking grid
const kitIndex = new Map(
  ["dungeon", "props", "nature"].map((set) => [
    set,
    JSON.parse(
      readFileSync(new URL(`../packages/wanderworld/kit/${KIT_DIRS[set]}/index.json`, import.meta.url), "utf8"),
    ).models,
  ]),
);
const overlap = (a, b, margin = 0) =>
  Math.abs(a.x - b.x) * 2 < a.w + b.w + margin * 2 - 0.02 && Math.abs(a.z - b.z) * 2 < a.d + b.d + margin * 2 - 0.02;
const near = (a, b) => Math.abs(a - b) < 0.01;

function check(plan) {
  const label = `${plan.kind} ${plan.seed}:${plan.depth}`;
  const floors = new Set();
  for (const piece of plan.pieces.filter((one) => one.name === "floor-modular")) {
    const key = `${Math.round(piece.x / CELL)},${Math.round(piece.z / CELL)}`;
    assert.ok(!floors.has(key), `${label}: one floor a cell`);
    assert.ok(near(piece.x, Math.round(piece.x / CELL) * CELL) && near(piece.z, Math.round(piece.z / CELL) * CELL));
    floors.add(key);
  }
  const floorAt = (x, z) => floors.has(`${Math.round(x / CELL)},${Math.round(z / CELL)}`);
  const inBox = (x, z, box, margin = 0) =>
    Math.abs(x - box.x) < box.w / 2 + margin && Math.abs(z - box.z) < box.d / 2 + margin;
  const blocked = (x, z, margin) => plan.colliders.some((box) => inBox(x, z, box, margin));

  // What's placed is in the kit, and the level is small enough for a phone.
  let triangles = 0;
  for (const piece of plan.pieces) {
    const info = kitIndex.get(piece.kit)?.[piece.name];
    assert.ok(info, `${label}: the kit has ${piece.kit}/${piece.name}`);
    for (const field of ["x", "y", "z", "angle", "scale"]) assert.equal(typeof piece[field], "number");
    triangles += info.triangles;
  }
  assert.ok(plan.pieces.length <= PIECE_BUDGET, `${label}: ${plan.pieces.length} pieces`);
  assert.ok(triangles <= TRIANGLE_BUDGET, `${label}: ${triangles} triangles`);
  assert.ok(plan.lights.length && plan.lights.length <= 24, `${label}: ${plan.lights.length} lights`);

  // No two walls or arches on one edge, no two things hung on one stretch of wall.
  const edges = new Set();
  for (const piece of plan.pieces.filter((one) => one.name === "wall-modular" || one.name === "arch")) {
    const key = `${piece.x},${piece.z}`;
    assert.ok(!edges.has(key), `${label}: one wall or arch an edge`);
    edges.add(key);
  }
  const hung = plan.pieces.filter((one) => one.name === "torch" || one.name === "banner-wall");
  for (const [n, a] of hung.entries()) {
    for (const b of hung.slice(n + 1)) assert.ok(Math.hypot(a.x - b.x, a.z - b.z) > 1, `${label}: one thing a wall`);
  }
  // Nothing that's in the way stands in anything else; small things aren't inside anything solid.
  const solids = plan.colliders.filter((box) => box.what === "prop");
  for (const [n, a] of solids.entries()) {
    for (const b of plan.colliders) {
      if (b !== a && (b.what !== "prop" || plan.colliders.indexOf(b) > n)) {
        assert.ok(!overlap(a, b), `${label}: a prop at ${a.x}, ${a.z} is clear of the ${b.what} at ${b.x}, ${b.z}`);
      }
    }
  }
  for (const piece of plan.pieces.filter((one) => ["skull", "cobweb", "bucket-wooden-1"].includes(one.name))) {
    assert.ok(floorAt(piece.x, piece.z) && !blocked(piece.x, piece.z, 0), `${label}: a ${piece.name} on open floor`);
  }

  // Doorways: on a cell's edge with floor both sides and an arch in it, at the ends of a straight corridor
  // whose floor runs between them, and nothing in the way through them.
  assert.equal(plan.doorways.length, plan.passages.length * 2, `${label}: a doorway at each end of each corridor`);
  for (const doorway of plan.doorways) {
    const crossX = near(doorway.angle, Math.PI / 2);
    const [dx, dz] = crossX ? [CELL / 2, 0] : [0, CELL / 2];
    assert.ok(
      floorAt(doorway.x - dx, doorway.z - dz) && floorAt(doorway.x + dx, doorway.z + dz),
      `${label}: floor both sides`,
    );
    assert.ok(edges.has(`${doorway.x},${doorway.z}`), `${label}: an arch in the doorway`);
    const way = { x: doorway.x, z: doorway.z, w: crossX ? 3 : 2, d: crossX ? 2 : 3 };
    for (const box of plan.colliders)
      assert.ok(!overlap(way, box), `${label}: the ${box.what} at ${box.x}, ${box.z} is clear of a doorway`);
  }
  const rooms = new Map(plan.rooms.map((room) => [room.id, room]));
  const onEdgeOf = (point, room) =>
    (near(Math.abs(point.x - room.x), room.w / 2) && Math.abs(point.z - room.z) < room.d / 2) ||
    (near(Math.abs(point.z - room.z), room.d / 2) && Math.abs(point.x - room.x) < room.w / 2);
  for (const passage of plan.passages) {
    const [a, b] = passage.points;
    assert.ok(near(a.x, b.x) || near(a.z, b.z), `${label}: a straight corridor`);
    for (const point of passage.points) {
      assert.ok(
        plan.doorways.some((doorway) => near(doorway.x, point.x) && near(doorway.z, point.z)),
        `${label}: a corridor ends at a doorway`,
      );
    }
    assert.ok(
      onEdgeOf(a, rooms.get(passage.from)) && onEdgeOf(b, rooms.get(passage.to)),
      `${label}: from one room's wall to the other's`,
    );
    const length = Math.hypot(b.x - a.x, b.z - a.z);
    for (let t = 1; t < length; t += 1) {
      assert.ok(
        floorAt(a.x + ((b.x - a.x) * t) / length, a.z + ((b.z - a.z) * t) / length),
        `${label}: a corridor's floor`,
      );
    }
  }

  // Everyone, the way in and the way down stand on open floor.
  const standing = [...plan.spawns, plan.entry, ...(plan.down ? [plan.down] : [])];
  for (const spot of standing) {
    assert.ok(floorAt(spot.x, spot.z), `${label}: ${spot.tag ?? "a way"} at ${spot.x}, ${spot.z} on the floor`);
    assert.ok(!blocked(spot.x, spot.z, 0.3), `${label}: ${spot.tag ?? "a way"} at ${spot.x}, ${spot.z} in the open`);
    assert.ok(
      spot.x > plan.bounds.minX && spot.x < plan.bounds.maxX && spot.z > plan.bounds.minZ && spot.z < plan.bounds.maxZ,
    );
  }
  for (const spawn of plan.spawns) assert.ok(["den", "guard", "captive", "boss", "wander"].includes(spawn.tag));

  // Walking: from the way in, past every collider at the player's size, to every room, everyone and the way down.
  const { minX, minZ, maxX, maxZ } = plan.bounds;
  const columns = Math.ceil((maxX - minX) / STEP) + 1;
  const rows = Math.ceil((maxZ - minZ) / STEP) + 1;
  const open = new Uint8Array(columns * rows);
  for (let c = 0; c < columns; c++) {
    for (let r = 0; r < rows; r++) if (floorAt(minX + c * STEP, minZ + r * STEP)) open[c * rows + r] = 1;
  }
  for (const box of plan.colliders) {
    const c0 = Math.max(0, Math.ceil((box.x - box.w / 2 - PLAYER_RADIUS - minX) / STEP));
    const c1 = Math.min(columns - 1, Math.floor((box.x + box.w / 2 + PLAYER_RADIUS - minX) / STEP));
    const r0 = Math.max(0, Math.ceil((box.z - box.d / 2 - PLAYER_RADIUS - minZ) / STEP));
    const r1 = Math.min(rows - 1, Math.floor((box.z + box.d / 2 + PLAYER_RADIUS - minZ) / STEP));
    for (let c = c0; c <= c1; c++) for (let r = r0; r <= r1; r++) open[c * rows + r] = 0;
  }
  const at = (x, z) => Math.round((x - minX) / STEP) * rows + Math.round((z - minZ) / STEP);
  const reached = new Uint8Array(columns * rows);
  const queue = [at(plan.entry.x, plan.entry.z)];
  assert.ok(open[queue[0]], `${label}: room to stand at the way in`);
  reached[queue[0]] = 1;
  while (queue.length) {
    const cell = queue.pop();
    const c = Math.floor(cell / rows);
    const r = cell % rows;
    for (const [nc, nr] of [
      [c + 1, r],
      [c - 1, r],
      [c, r + 1],
      [c, r - 1],
    ]) {
      const next = nc * rows + nr;
      if (nc >= 0 && nc < columns && nr >= 0 && nr < rows && open[next] && !reached[next]) {
        reached[next] = 1;
        queue.push(next);
      }
    }
  }
  for (const room of plan.rooms) {
    let found = false;
    for (let x = room.x - room.w / 2; x <= room.x + room.w / 2 && !found; x += STEP) {
      for (let z = room.z - room.d / 2; z <= room.z + room.d / 2 && !found; z += STEP) found = !!reached[at(x, z)];
    }
    assert.ok(found, `${label}: room ${room.id} (${room.tags.join(" ")}) can be walked to`);
  }
  for (const spot of [...plan.spawns, ...(plan.down ? [plan.down] : [])]) {
    const around = [0, STEP, -STEP].flatMap((ox) => [0, STEP, -STEP].map((oz) => at(spot.x + ox, spot.z + oz)));
    assert.ok(
      around.some((cell) => reached[cell]),
      `${label}: ${spot.tag ?? "the way down"} at ${spot.x}, ${spot.z} can be walked to`,
    );
  }
}

// ── The same seed, the same level; another seed, another ──
assert.deepEqual(dungeonPlan(7, 1, "dungeon"), dungeonPlan(7, 1, "dungeon"), "a dungeon is the same each time");
assert.deepEqual(dungeonPlan("mill-cave", 2, "stronghold"), dungeonPlan("mill-cave", 2, "stronghold"));
assert.notDeepEqual(dungeonPlan(7, 1, "dungeon").pieces, dungeonPlan(8, 1, "dungeon").pieces);
assert.notDeepEqual(
  dungeonPlan(7, 1, "dungeon").pieces,
  dungeonPlan(7, 2, "dungeon").pieces,
  "each level down is its own",
);

// ── The shape the deep places share ──
const sample = dungeonPlan(3, 1, "stronghold");
assert.deepEqual(
  Object.keys(sample).filter((key) =>
    [
      "kind",
      "seed",
      "depth",
      "bounds",
      "rooms",
      "passages",
      "entry",
      "down",
      "pieces",
      "colliders",
      "lights",
      "spawns",
    ].includes(key),
  ).length,
  12,
);
assert.equal(sample.kind, "stronghold");
assert.equal(sample.variant, "keep");
for (const room of sample.rooms) assert.ok(["chamber", "room", "hall", "cell"].includes(room.shape));

// ── Many levels of each kind ──
const variants = new Set();
const downs = { dungeon: 0, stronghold: 0 };
const plans = 40;
for (const kind of ["dungeon", "stronghold"]) {
  for (let seed = 1; seed <= plans; seed++) {
    const plan = dungeonPlan(seed, 1 + (seed % 3), kind);
    check(plan);
    variants.add(plan.variant);
    if (plan.down) {
      downs[kind]++;
      assert.equal(plan.down.kind, "cave", "a dungeon's broken wall and a keep's cellar lead to a cave");
    }
    const tagged = (tag) => plan.rooms.filter((room) => room.tags.includes(tag));
    const spawnsIn = (room, tag) =>
      plan.spawns.filter(
        (spawn) =>
          spawn.tag === tag && Math.abs(spawn.x - room.x) < room.w / 2 && Math.abs(spawn.z - room.z) < room.d / 2,
      );
    if (kind === "stronghold") {
      for (const tag of ["entry", "hall", "barracks", "store", "leader", "cell", "cellar"]) {
        assert.ok(tagged(tag).length, `a keep has a ${tag}`);
      }
      assert.ok(
        tagged("cell").every((room) => room.shape === "cell" && spawnsIn(room, "captive").length === 1),
        "a captive in each cell",
      );
      assert.ok(spawnsIn(tagged("leader")[0], "boss").length === 1, "the leader in the leader's room");
      assert.ok(spawnsIn(tagged("barracks")[0], "guard").length >= 2, "guards in the barracks");
      assert.ok(spawnsIn(tagged("hall")[0], "guard").length >= 1, "guards in the hall");
      if (plan.down) assert.ok(Math.abs(plan.down.x - tagged("cellar")[0].x) < 4, "the way down is in the cellar");
    } else {
      assert.ok(["crypt", "ruin", "vault"].includes(plan.variant));
      assert.ok(spawnsIn(tagged("end")[0], "boss").length === 1, "a boss at the dungeon's end");
    }
  }
}
assert.equal(variants.size, 4, "crypts, ruins, vaults and keeps all come up");
assert.ok(downs.dungeon > 0 && downs.dungeon < plans, "a dungeon goes further down sometimes");
assert.ok(downs.stronghold > 0 && downs.stronghold < plans, "a keep goes further down sometimes");

// ── Built from the kit: every piece drawn, doors on their own, a model that won't load leaves a gap ──
const plan = dungeonPlan(5, 1, "stronghold");
const part = { geometry: new BoxGeometry(1, 1, 1), material: new MeshBasicMaterial() };
const built = buildDungeon(plan, async () => [part]);
await built.ready;
let drawn = 0;
built.object.traverse((object) => {
  if (object.isInstancedMesh) drawn += object.count;
  else if (object.isMesh) drawn++;
});
assert.equal(drawn, plan.pieces.length, "one drawn copy a piece");
assert.equal(built.colliders.length, plan.colliders.length);
assert.ok(
  built.colliders.every((box) => box.id && box.maxX > box.minX && box.maxZ > box.minZ),
  "boxes for createCollider",
);
const doors = plan.doorways.filter((doorway) => doorway.door);
assert.equal(built.doors.length, doors.length);
assert.ok(
  built.doors.every((door) => door.objects.length === 1),
  "each door its own mesh, to open",
);
const gappy = buildDungeon(plan, async (set, name) => {
  if (name === "torch") throw new Error("not in the kit");
  return [part];
});
await gappy.ready;
assert.ok(gappy.object.children.length > 0, "the rest still built");

console.log("ok: dungeons and strongholds");
