// Wanderworld logic that runs without a browser: collision against trunks and buildings, the camera's
// sight check, the seeded town, and the built-in person and how bodies move.
// Run: node tests/wanderworld.regression.mjs
import assert from "node:assert/strict";
import { Box3, Vector3 } from "three";
import { buildBuilding, KINDS, makeSpec } from "../packages/wanderworld/src/buildings.js";
import { createFigure } from "../packages/wanderworld/src/figure.js";
import { createInterior } from "../packages/wanderworld/src/interiors.js";
import { createMotion } from "../packages/wanderworld/src/motion.js";
import { checkSetting, loadSettings, SETTINGS } from "../packages/wanderworld/src/settings.js";
import { createCollider, createWorld, DENSITIES, rng, SPAWN } from "../packages/wanderworld/src/world.js";

// ── Collision: circles ───────────────────────────────────────────────────────
const collider = createCollider(
  [
    { id: 1, x: 0, z: 0, r: 0.3 },
    { id: 2, x: 10, z: 10, r: 0.3 },
    { id: 3, x: -3.9, z: 4.1, r: 0.3 }, // across a grid-cell boundary from the probe below
  ],
  [{ id: 4, minX: 20, maxX: 30, minZ: -5, maxZ: 5 }],
);
const inside = { x: 0.1, z: 0 };
collider.resolve(inside, 0.35);
assert.ok(
  Math.abs(Math.hypot(inside.x, inside.z) - 0.65) < 1e-9,
  "an overlapping capsule is pushed to the trunk's edge",
);
assert.ok(inside.z === 0 && inside.x > 0, "and pushed straight away from the trunk's centre");

const clear = { x: 5, z: 5 };
collider.resolve(clear, 0.35);
assert.deepEqual(clear, { x: 5, z: 5 }, "a capsule touching nothing does not move");

const neighbour = { x: -4.1, z: 4.1 };
collider.resolve(neighbour, 0.35);
assert.ok(Math.hypot(neighbour.x + 3.9, neighbour.z - 4.1) >= 0.65 - 1e-9, "trunks in the next grid cell still block");

// ── Collision: buildings ─────────────────────────────────────────────────────
const againstWall = { x: 19.8, z: 1 };
collider.resolve(againstWall, 0.35);
assert.ok(Math.abs(againstWall.x - 19.65) < 1e-9 && againstWall.z === 1, "a wall pushes the capsule straight back");

const walkedIn = { x: 21, z: 0 };
collider.resolve(walkedIn, 0.35);
assert.ok(Math.abs(walkedIn.x - 19.65) < 1e-9, "a capsule inside a building leaves by the nearest wall");

assert.equal(collider.insideBox(25, 0), true, "a point inside a building is reported");
assert.equal(collider.insideBox(19.7, 0, 0.4), true, "the margin grows the building");
assert.equal(collider.insideBox(15, 0, 0.4), false, "open ground is not a building");

// ── World ────────────────────────────────────────────────────────────────────
const world = createWorld(12345);
for (const density of DENSITIES) world.setDensity(density);
const meshes = [];
world.scene.traverse((object) => object.isInstancedMesh && meshes.push(object));
assert.equal(meshes.length, 6, "trunks, crowns, rocks, lamp posts, lamp heads and doors are one instanced mesh each");

// Doors swing open and shut; benches have seats; the day turns to night.
assert.ok(world.doors.length >= 30, `every building has a door (${world.doors.length})`);
world.setDoor(0, true);
for (let i = 0; i < 30; i++) world.update(0.05);
assert.equal(world.doors[0].open, 1, "a door opens fully");
world.setDoor(0, false);
for (let i = 0; i < 30; i++) world.update(0.05);
assert.equal(world.doors[0].open, 0, "and shuts again");
assert.ok(world.seats.length >= 12, `the plaza and gardens have benches to sit on (${world.seats.length} seats)`);
for (const seat of world.seats) {
  assert.ok(!world.blocked(seat.approach.x, seat.approach.z, 0.1), "you can stand in front of every seat");
}
assert.ok(world.setTime(12) < 0.05, "noon is bright");
assert.ok(world.setTime(0) > 0.95, "midnight is dark");
world.setTime(12);
world.setDensity(DENSITIES[0]);
const [trunks, crowns, rocks] = meshes;
assert.equal(trunks.count, crowns.count, "every trunk has a crown");
assert.ok(rocks.count > 0 && trunks.count > rocks.count);
assert.ok(world.buildingCount >= 40, `the town has a few dozen buildings (got ${world.buildingCount})`);

const spawn = { x: SPAWN.x, z: SPAWN.z };
world.resolveCollisions(spawn, 0.35);
assert.deepEqual(spawn, { x: SPAWN.x, z: SPAWN.z }, "the spawn point on the plaza is clear");
assert.equal(world.clearSight(SPAWN.x, SPAWN.z, SPAWN.x, SPAWN.z + 4), 1, "the plaza has a clear view");

const again = createWorld(12345);
assert.equal(again.buildingCount, world.buildingCount, "the same seed builds the same town");
assert.deepEqual(
  again.doors.map((door) => door.kind),
  world.doors.map((door) => door.kind),
  "and the same buildings in the same places",
);
for (const kind of ["hall", "temple", "tavern"]) {
  assert.equal(world.doors.filter((door) => door.kind === kind).length, 1, `the plaza has one ${kind}`);
}
world.dispose();
again.dispose();

// ── Parts kit ────────────────────────────────────────────────────────────────
const random = rng(7);
for (const kind of KINDS) {
  const spec = makeSpec(random, kind);
  assert.equal(spec.kind, kind);
  const { geometry, footprint, doorX } = buildBuilding(random, spec);
  geometry.computeBoundingBox();
  const bounds = geometry.boundingBox;
  assert.ok(bounds.max.y > 3, `a ${kind} stands taller than a person`);
  assert.ok(Math.abs(doorX) < spec.width / 2, `a ${kind}'s door is on its front wall`);
  // The footprint covers the walls (overhangs, signs and sills may stick out a little past it).
  assert.ok(
    footprint.minX <= -spec.width / 2 && footprint.maxX >= spec.width / 2,
    `a ${kind}'s footprint covers its width`,
  );
  assert.ok(
    bounds.min.x > footprint.minX - 1.5 && bounds.max.x < footprint.maxX + 1.5,
    `a ${kind} stays near its footprint`,
  );
  geometry.dispose();
}
assert.equal(makeSpec(random, "spaceship").kind, "home", "an unknown kind falls back to a home");

// ── Inside buildings ─────────────────────────────────────────────────────────
// Every kind of building opens onto a furnished room you can walk into, sit down in and walk out of.
for (const kind of KINDS) {
  for (let i = 0; i < 4; i++) {
    const spec = makeSpec(rng(100 + i), kind, { width: 6 + i * 2.5, depth: 5 + i * 1.5 });
    const room = createInterior({ index: i, spec }, "test-seed");
    assert.equal(room.kind, kind, "the room is the building's kind");
    assert.ok(!room.blocked(room.entry.x, room.entry.z, 0.3), `${kind}: you can stand where you come in`);
    assert.ok(!room.blocked(room.exit.x, room.exit.z, 0.3), `${kind}: you can reach the way out`);
    for (const seat of room.seats) {
      assert.ok(!room.blocked(seat.approach.x, seat.approach.z, 0.1), `${kind}: you can stand in front of every seat`);
    }
    if (kind !== "smithy") assert.ok(room.seats.length > 0, `${kind}: there's somewhere to sit`);
    // Walk straight at the back wall and out of the front door: the walls stop you both ways.
    const halfDepth = room.entry.z + 0.8;
    for (const direction of [-1, 1]) {
      const walker = { x: room.entry.x + 0.2, z: room.entry.z };
      for (let step = 0; step < 300; step++) {
        walker.z += direction * 0.05;
        room.resolveCollisions(walker, 0.35);
      }
      assert.ok(Math.abs(walker.z) < halfDepth, `${kind}: the walls keep you in (${walker.z.toFixed(2)})`);
    }
    room.dispose();
  }
}

// ── The built-in person, and how bodies move ─────────────────────────────────
const figure = createFigure("Aria");
let skinned = 0;
figure.object.traverse((object) => object.isSkinnedMesh && skinned++);
assert.equal(skinned, 1, "the person is one skinned mesh");
const joint = (name) => {
  let found = null;
  figure.object.traverse((object) => {
    if (object.isBone && object.name === name) found = object;
  });
  return found;
};
const at = (name) => joint(name).getWorldPosition(new Vector3());
const pose = (dt, speed) => {
  figure.update(dt, speed);
  figure.object.updateMatrixWorld(true);
};
/** Positive when the shin is turned back from the thigh: a knee bending the way knees do. */
const kneeBend = (side) => {
  const thigh = at(`${side}LowerLeg`)
    .sub(at(`${side}UpperLeg`))
    .normalize();
  const shin = at(`${side}Foot`)
    .sub(at(`${side}LowerLeg`))
    .normalize();
  return thigh.y * shin.z - thigh.z * shin.y;
};
for (let i = 0; i < 30; i++) pose(0.05, 0);
const standing = new Box3().setFromObject(figure.object, true);
assert.ok(standing.max.y > 1.5 && standing.max.y < 1.95, `person-sized (${standing.max.y.toFixed(2)} m)`);
assert.ok(Math.abs(standing.min.y) < 0.03, `standing on the ground (lowest ${standing.min.y.toFixed(3)} m)`);
for (const side of ["left", "right"]) {
  assert.ok(at(`${side}Hand`).y < at(`${side}UpperArm`).y - 0.35, `the ${side} arm hangs down at rest`);
  assert.ok(at(`${side}Hand`).z > at(`${side}LowerArm`).z, `the ${side} elbow bends forward, not back`);
}
// Walking: knees only ever bend back, they fold well in the swing, and a foot stays on the ground.
let deepest = 0;
for (let i = 0; i < 80; i++) {
  pose(1 / 30, 2.5);
  for (const side of ["left", "right"]) {
    const bend = kneeBend(side);
    assert.ok(bend > -0.02, `the ${side} knee never bends forward (${bend.toFixed(3)})`);
    deepest = Math.max(deepest, bend);
  }
  if (i > 20) {
    const floor = new Box3().setFromObject(figure.object, true).min.y;
    assert.ok(Math.abs(floor) < 0.06, `walking, a foot stays on the ground (lowest ${floor.toFixed(3)} m)`);
  }
}
assert.ok(deepest > 0.5, `knees fold as the feet swing through (deepest ${deepest.toFixed(2)})`);

// Feet stay planted. Walking straight ahead, each foot keeps to its own line instead of swinging side to
// side with the hips; and the foot carrying the body moves back at the walking speed, so it doesn't skate.
const WALK = 2.5;
const sideways = { left: [Infinity, -Infinity], right: [Infinity, -Infinity] };
let slip = 0;
let contact = 0;
let previous = null;
for (let i = 0; i < 120; i++) {
  pose(1 / 60, WALK);
  const feet = { left: at("leftFoot"), right: at("rightFoot") };
  for (const side of ["left", "right"]) {
    sideways[side][0] = Math.min(sideways[side][0], feet[side].x);
    sideways[side][1] = Math.max(sideways[side][1], feet[side].x);
  }
  if (previous) {
    // The lower foot is the one on the ground; it should slide back at the walking speed.
    const side = feet.left.y < feet.right.y ? "left" : "right";
    if (Math.abs(feet.left.y - feet.right.y) > 0.01) {
      slip += Math.abs((feet[side].z - previous[side].z) * 60 + WALK);
      contact++;
    }
  }
  previous = feet;
}
for (const side of ["left", "right"]) {
  const range = sideways[side][1] - sideways[side][0];
  assert.ok(range < 0.04, `walking, the ${side} foot keeps to its line (sways ${(range * 100).toFixed(1)} cm)`);
}
assert.ok(
  slip / contact < WALK * 0.3,
  `the planted foot keeps pace with the ground (slips ${(slip / contact).toFixed(2)} m/s)`,
);

// Standing, weight shifts from foot to foot without the feet sliding about.
for (let i = 0; i < 60; i++) pose(1 / 30, 0);
const planted = { left: at("leftFoot"), right: at("rightFoot") };
let wander = 0;
for (let i = 0; i < 600; i++) {
  pose(1 / 30, 0);
  for (const side of ["left", "right"]) {
    const foot = at(`${side}Foot`);
    wander = Math.max(wander, Math.hypot(foot.x - planted[side].x, foot.z - planted[side].z));
  }
}
assert.ok(wander < 0.03, `standing, the feet stay put (${(wander * 100).toFixed(1)} cm over 20 s)`);
figure.dispose();

// The motion on its own: a standing body still breathes, and a body that stops comes back to rest.
const motion = createMotion({ seed: 7 });
const chestAt = (frames, speed) => {
  let last;
  for (let i = 0; i < frames; i++) last = motion(1 / 30, speed);
  return last;
};
const a = chestAt(30, 0).bones.chest[0];
const b = chestAt(45, 0).bones.chest[0];
assert.notEqual(a, b, "standing still, the chest still moves (breathing)");
chestAt(60, 5);
const rested = chestAt(90, 0);
assert.ok(Math.abs(rested.bones.leftUpperLeg[0]) < 0.12, "a body that stops stands back up");
for (const value of Object.values(rested.bones).flat().concat(rested.hips, rested.blink)) {
  assert.ok(Number.isFinite(value), "every pose value is a number");
}
assert.ok(Number.isFinite(createMotion()(NaN, Infinity).hips[1]), "bad input never breaks the pose");

// ── Settings ─────────────────────────────────────────────────────────────────
// Saved settings come back from storage: anything odd falls back to the default instead of breaking.
assert.equal(checkSetting("walkSpeed", 9), SETTINGS.walkSpeed.max, "speeds are kept within their range");
assert.equal(checkSetting("walkSpeed", "fast"), SETTINGS.walkSpeed.value, "a non-number speed is the default");
assert.equal(checkSetting("resolution", "8k"), "auto", "an unknown resolution is Auto");
assert.equal(checkSetting("drawDistance", 140), 140, "a listed choice is kept");
assert.equal(checkSetting("shadows", "yes"), true, "a non-boolean switch is the default");
assert.equal(checkSetting("nonsense", 1), undefined, "unknown settings are ignored");
globalThis.localStorage = { getItem: () => "{not json" };
assert.deepEqual(loadSettings().resolution, "auto", "a damaged saved copy loads the defaults");
delete globalThis.localStorage;

console.log("wanderworld regression: OK");
