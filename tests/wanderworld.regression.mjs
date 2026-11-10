// Wanderworld logic that runs without a browser: collision against trunks and buildings, the camera's
// sight check, the seeded town, and the built-in person and how bodies move.
// Run: node tests/wanderworld.regression.mjs
import assert from "node:assert/strict";
import { Box3, Matrix4, Vector3 } from "three";
import { buildBuilding, KINDS, makeSpec } from "../packages/wanderworld/src/buildings.js";
import { setAnimationStyle } from "../packages/wanderworld/src/character.js";
import { createFigure } from "../packages/wanderworld/src/figure.js";
import { HOUSE_PIECES, housePieces, kitFits } from "../packages/wanderworld/src/houses.js";
import { createInterior } from "../packages/wanderworld/src/interiors.js";
import { createMotion } from "../packages/wanderworld/src/motion.js";
import { checkSetting, loadSettings, SETTINGS } from "../packages/wanderworld/src/settings.js";
import {
  createCollider,
  createWorld,
  DENSITIES,
  NATURE_MODELS,
  rng,
  SPAWN,
} from "../packages/wanderworld/src/world.js";
import { BoxGeometry, MeshLambertMaterial } from "three";

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
assert.equal(
  meshes.length,
  8,
  "trunks, crowns, rocks, lamp posts, lamp heads, doors and the woods beyond the edge (two) are one instanced mesh each",
);

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

// Detailed nature: once the kit is in, trees and rocks near town become kit models and the cones and
// boxes they replace are hidden; undergrowth grows round the town but not in it.
{
  const nature = createWorld(777);
  const stand = new Map(
    NATURE_MODELS.map((name) => [name, [{ geometry: new BoxGeometry(1, 1, 1), material: new MeshLambertMaterial() }]]),
  );
  nature.addNature(stand);
  nature.setDrawDistance(140); // within the detailed trees' reach: no simple trees stand in
  nature.follow(SPAWN.x, SPAWN.z);
  const kit = [];
  const simple = [];
  nature.scene.traverse((object) => {
    if (object.userData.kit) kit.push(object);
    // (the woods beyond the world's edge are always the simple trees)
    else if (object.isInstancedMesh && !object.userData.beyond && object.instanceMatrix.count > 100)
      simple.push(object);
  });
  assert.ok(kit.length >= 15, `kit trees, rocks and plants are added (${kit.length} kinds)`);
  assert.ok(
    simple.length >= 3 && simple.every((mesh) => !mesh.visible),
    "the simple trees and rocks are all hidden: only kit nature shows",
  );
  // Past the detailed trees' reach (a long draw distance), simple trees stand in far off; never rocks.
  nature.setDrawDistance(450);
  const [trunks, , stones] = simple;
  assert.ok(trunks.visible && trunks.count > 0, "far off, simple trees stand in beyond the detailed ones");
  assert.ok(!stones.visible, "but never simple rocks");
  nature.setDrawDistance(140);
  const treeNames = new Set(NATURE_MODELS.filter((name) => /tree|pine/u.test(name)));
  const trees = kit.filter((mesh) => treeNames.has(mesh.userData.model));
  const drawn = () => trees.reduce((sum, mesh) => sum + mesh.count, 0);
  const near = drawn();
  assert.ok(near > 100, `detailed trees stand all round, not only by the town (${near})`);
  let townTrees = 0;
  for (const mesh of trees) {
    for (let i = 0; i < mesh.count; i++) {
      const matrix = new Matrix4();
      mesh.getMatrixAt(i, matrix);
      const at = new Vector3().setFromMatrixPosition(matrix);
      if (Math.max(Math.abs(at.x), Math.abs(at.z)) < 60) townTrees++; // a garden's or a meadow's
      assert.ok(Math.hypot(at.x - SPAWN.x, at.z - SPAWN.z) < 200 + 16, "only trees within sight are drawn");
    }
  }
  assert.ok(townTrees < 40, `only gardens and meadows have trees in town, not the forest (${townTrees})`);
  nature.setDensity(DENSITIES[1]);
  assert.ok(drawn() > near * 2, `more density means more detailed trees (${near} → ${drawn()})`);
  nature.setDrawDistance(90);
  nature.setDensity(DENSITIES[0]);
  assert.ok(drawn() < near, `a shorter draw distance draws fewer of them (${drawn()})`);
  const plants = kit.filter((mesh) => /bush|flower/u.test(mesh.userData.model));
  const inTown = plants.some((mesh) => {
    for (let i = 0; i < mesh.count; i++) {
      const matrix = new Matrix4();
      mesh.getMatrixAt(i, matrix);
      const at = new Vector3().setFromMatrixPosition(matrix);
      if (Math.max(Math.abs(at.x), Math.abs(at.z)) < 50) return true;
    }
    return false;
  });
  assert.ok(inTown, "bushes and flowers grow in the town's gardens and by its doors");
  nature.dispose();
}
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

// ── Buildings from the village kit ───────────────────────────────────────────
// Every building the town makes sits on the kit's grid, in a shape it has a roof for, with its door in the
// middle of a wall segment, and its kit version uses only pieces the kit has.
{
  const town = createWorld(31337);
  const kitWorld = createWorld(31337);
  const known = new Set(HOUSE_PIECES);
  let checked = 0;
  for (let i = 0; i < 400; i++) {
    const kind = KINDS[i % KINDS.length];
    const spec = makeSpec(rng(9000 + i), kind, { width: 4 + (i % 12), depth: 4 + (i % 6) });
    assert.equal(spec.width % 2, 0, "widths are whole 2 m segments");
    assert.equal(spec.depth % 2, 0, "depths are whole 2 m segments");
    assert.ok(kitFits(spec.width, spec.depth), `the kit can roof ${spec.width} × ${spec.depth}`);
    const { doorX, geometry } = buildBuilding(rng(i), spec);
    geometry.dispose();
    assert.ok(
      Math.abs((((doorX - spec.width / 2 - 1) % 2) + 2) % 2) < 1e-9,
      `the door is mid-segment (${doorX} in ${spec.width})`,
    );
    for (const { model } of housePieces(spec, doorX, i)) assert.ok(known.has(model), `the kit has ${model}`);
    checked++;
  }
  assert.equal(checked, 400);
  // The swap: the simple buildings are hidden and kit pieces take their place.
  kitWorld.addBuildings(
    new Map(
      HOUSE_PIECES.map((name) => [name, [{ geometry: new BoxGeometry(1, 1, 1), material: new MeshLambertMaterial() }]]),
    ),
  );
  let kitPieces = 0;
  kitWorld.scene.traverse((object) => object.userData.kit && kitPieces++);
  assert.ok(kitPieces > 10, `kit building pieces are added (${kitPieces} kinds)`);
  town.dispose();
  kitWorld.dispose();
}

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
    // With the kit, kit props take the simple furniture's places.
    assert.ok(room.propNames.length > 0, `${kind}: the room has kit props to show`);
    const before = [];
    room.scene.traverse((object) => object.isMesh && object.visible && before.push(object));
    room.addProps(
      new Map(
        room.propNames.map((name) => [
          name,
          [{ geometry: new BoxGeometry(0.3, 0.3, 0.3), material: new MeshLambertMaterial() }],
        ]),
      ),
    );
    let props = 0;
    room.scene.traverse((object) => object.isMesh && object.geometry.parameters?.width === 0.3 && props++);
    assert.ok(props >= room.propNames.length, `${kind}: kit props are placed (${props})`);
    room.dispose();
  }
}

// ── The built-in person, and how bodies move ─────────────────────────────────
// The hand-made motion first (Settings → Animation → Built-in); the recorded clips are checked after.
setAnimationStyle("builtin");
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

// The body rises and falls gently and smoothly as it walks: a small bob, and no jolt where the hips
// suddenly drop as the legs spread (0.4.5 jolted at about 80 m/s² every step).
const heights = [];
for (let i = 0; i < 120; i++) {
  pose(1 / 60, 1.8);
  heights.push(at("head").y);
}
const bounce = Math.max(...heights) - Math.min(...heights);
let jolt = 0;
for (let i = 2; i < heights.length; i++) {
  jolt = Math.max(jolt, Math.abs(heights[i] - 2 * heights[i - 1] + heights[i - 2]) * 3600);
}
assert.ok(bounce < 0.035, `walking, the head bobs only a little (${(bounce * 100).toFixed(1)} cm)`);
assert.ok(jolt < 8, `and smoothly, without jolts (${jolt.toFixed(1)} m/s²)`);

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

// ── Recorded motion (the Universal Animation Library clips) ──────────────────
// On any body the clips keep a planted foot moving back at the walking speed (so it doesn't skate),
// move smoothly, keep the knees bending the right way, and sit down and stand up again.
setAnimationStyle("recorded");
{
  const body = createFigure("Tam");
  const find = (name) => {
    let found = null;
    body.object.traverse((object) => {
      if (object.isBone && object.name === name) found = object;
    });
    return found;
  };
  const point = (name) => find(name).getWorldPosition(new Vector3());
  for (const speed of [0.8, 1.8, 5]) {
    const frames = [];
    for (let i = 0; i < 300; i++) {
      body.update(1 / 60, speed);
      body.object.updateMatrixWorld(true);
      if (i > 90) frames.push({ feet: [point("leftFoot"), point("rightFoot")], head: point("head").y });
    }
    const lowest = Math.min(...frames.flatMap((frame) => frame.feet.map((foot) => foot.y)));
    let sum = 0;
    let count = 0;
    for (let i = 1; i < frames.length; i++) {
      for (const side of [0, 1]) {
        const now = frames[i].feet[side];
        const was = frames[i - 1].feet[side];
        if (now.y > lowest + 0.02 || was.y > lowest + 0.02) continue;
        sum += -(now.z - was.z) * 60;
        count++;
      }
    }
    const planted = sum / count;
    assert.ok(
      Math.abs(planted - speed) < speed * 0.15,
      `recorded at ${speed} m/s, the planted foot keeps pace (${planted.toFixed(2)} m/s)`,
    );
    assert.ok(
      Math.abs(lowest - 0.075) < 0.035,
      `recorded at ${speed} m/s, feet stay at the ground (${lowest.toFixed(3)})`,
    );
    let jolt = 0;
    for (let i = 2; i < frames.length; i++) {
      jolt = Math.max(jolt, Math.abs(frames[i].head - 2 * frames[i - 1].head + frames[i - 2].head) * 3600);
    }
    assert.ok(
      jolt < (speed > 3 ? 60 : 15), // a runner landing is a real jolt; 0.4.5 hit 337
      `recorded at ${speed} m/s, the body moves smoothly (${jolt.toFixed(1)} m/s²)`,
    );
  }
  // Sitting down and standing up again.
  for (let i = 0; i < 120; i++) body.update(1 / 60, 0, { sit: true });
  body.object.updateMatrixWorld(true);
  const seatedHips = point("hips").y;
  for (let i = 0; i < 150; i++) body.update(1 / 60, 0, { sit: false });
  body.object.updateMatrixWorld(true);
  assert.ok(seatedHips < point("hips").y - 0.25, "recorded: sitting lowers the hips, and standing raises them again");
  body.dispose();
}
setAnimationStyle("builtin");

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

// ── The assistant's Undo takes back its own changes and nothing else ─────────────────────────────────────
{
  const { undoOnly, withoutLeftovers } = await import("../packages/wanderworld/src/undo.js");
  const world = (extra = {}) => ({
    setting: "a fishing village",
    look: "",
    names: { b1: "The Gull" },
    stances: {},
    voices: {},
    traits: {},
    schedules: {},
    bodies: null,
    housing: { a: { home: "b2" } },
    cast: ["a", "b"],
    known: [],
    knowsMe: [],
    locals: [],
    factions: [],
    errand: null,
    lore: {},
    book: { entries: [{ id: "e1", title: "Brin", content: "A baker." }] },
    relationships: [{ from: "a", to: "b", kind: "friend", score: 10 }],
    ...extra,
  });
  const whole = (path) => path.length === 1 && path[0] === "errand";
  const before = world();
  // The assistant: renames a place, makes a and b married, rewrites a lore entry, adds Wren with a home.
  const wren = { id: "local:wren", name: "Wren" };
  const after = world({
    names: { b1: "The Anchor" },
    relationships: [{ from: "a", to: "b", kind: "spouse", score: 10 }],
    book: { entries: [{ id: "e1", title: "Brin", content: "A baker and a sorcerer." }] },
    locals: [wren],
    cast: ["a", "b", "local:wren"],
    housing: { a: { home: "b2" }, "local:wren": { home: "b3" } },
    errand: { id: "x", person: "local:wren", text: "Take a letter to Wren" },
  });
  // Then the player, by hand and through play: another name, a stance, a new setting, a warmer score,
  // Wren given work and a voice, a note of their own.
  const now = world({
    ...after,
    names: { b1: "The Anchor", b4: "Old Mill" },
    stances: { b: "rude" },
    setting: "a fishing town",
    relationships: [
      { from: "a", to: "b", kind: "spouse", score: 25 },
      { from: "player", to: "local:wren", kind: "friend", score: 5 },
    ],
    housing: { a: { home: "b2" }, "local:wren": { home: "b3", work: "b1" } },
    voices: { "local:wren": "low" },
    book: { entries: [...after.book.entries, { id: "e2", title: "Mine", content: "By hand." }] },
  });
  const undone = withoutLeftovers(undoOnly(before, after, now, whole));
  assert.deepEqual(undone.names, { b1: "The Gull", b4: "Old Mill" }, "the rename goes back, the player's stays");
  assert.deepEqual(undone.stances, { b: "rude" });
  assert.equal(undone.setting, "a fishing town");
  assert.deepEqual(
    undone.relationships,
    [{ from: "a", to: "b", kind: "friend", score: 25 }],
    "the kind goes back, the score play gave stays, and nothing is left about Wren",
  );
  assert.deepEqual(undone.book.entries, [
    { id: "e1", title: "Brin", content: "A baker." },
    { id: "e2", title: "Mine", content: "By hand." },
  ]);
  assert.deepEqual(undone.locals, []);
  assert.deepEqual(undone.cast, ["a", "b"]);
  assert.deepEqual(undone.housing, { a: { home: "b2" } });
  assert.deepEqual(undone.voices, {});
  assert.equal(undone.errand, null);
  // The same thing changed again by the player: theirs stays.
  assert.deepEqual(
    undoOnly({ names: { b1: "The Gull" } }, { names: { b1: "The Anchor" } }, { names: { b1: "The Rope" } }).names,
    { b1: "The Rope" },
  );
  // Someone the assistant removed comes back; an errand taken since is left whole.
  const back = undoOnly(
    { locals: [wren], errand: { id: "x", text: "old" } },
    { locals: [], errand: { id: "y", text: "the assistant's" } },
    { locals: [{ id: "local:ash", name: "Ash" }], errand: { id: "z", text: "old" } },
    whole,
  );
  assert.deepEqual(back.locals, [{ id: "local:ash", name: "Ash" }, wren]);
  assert.deepEqual(back.errand, { id: "z", text: "old" });
  // Nothing changed since: exactly as before.
  assert.deepEqual(undoOnly(before, after, structuredClone(after), whole), before);
  console.log("ok: the assistant's undo takes back only its own changes");
}

// ── The assistant's proposal as the player left it ───────────────────────────────────────────────────────
{
  const { editableFields, reviseEdits } = await import("../packages/wanderworld/src/assistant-edits.js");
  const edits = [
    { do: "lore", about: "Jake", text: "A smith." },
    { do: "relate", from: "Jake", to: "Sarah", kind: "partner" },
    { do: "card", person: "Wren", description: "Tall.", appearance: "Grey coat." },
    { do: "rename", place: "tavern1", name: "The Bell" },
    { do: "notice", text: "Lost cat.", by: "" },
    { do: "home", person: "Jake", place: "home3" },
  ];
  assert.deepEqual(
    editableFields(edits[2]).map((part) => part.key),
    ["description", "appearance"],
    "only the parts the edit has",
  );
  assert.deepEqual(
    editableFields({ ...edits[1], role: "husband", backRole: "wife", both: false }).map((part) => part.key),
    ["kind", "role"],
    "the role back only when it's set both ways",
  );
  const kind = editableFields(edits[1])[0];
  assert.ok(kind.options.some((option) => option.value === "none") && kind.options.length > 5);
  const chosen = (values) =>
    reviseEdits([{ ...edits[1], role: "husband" }], [{ edit: 0, keep: true, values }]).edits[0];
  assert.deepEqual(chosen({ kind: "rival", role: " foe " }), { ...edits[1], kind: "rival", role: "foe" });
  assert.equal(chosen({ kind: "overlord" }).kind, "partner", "a kind that isn't one stays as proposed");
  const left = reviseEdits(edits, [
    { edit: 0, keep: true, values: { text: "  A smith,\tand a sorcerer.  ", about: "Sarah" } },
    { edit: 1, keep: false, values: { kind: "enemy" } },
    { edit: 2, keep: true, values: { description: "", appearance: "A red coat." } },
    { edit: 3, keep: true, values: { name: "x".repeat(200) } },
    { edit: 4, keep: true, values: { text: "   " } },
  ]);
  assert.deepEqual(left.edits, [
    { do: "lore", about: "Jake", text: "A smith, and a sorcerer." },
    { do: "card", person: "Wren", appearance: "A red coat." },
    { do: "rename", place: "tavern1", name: "x".repeat(60) },
  ]);
  assert.equal(left.skipped.length, 1, "the note left empty is said");
  assert.deepEqual(reviseEdits(edits, []).edits, [], "an edit the proposal didn't show is never made");
  console.log("ok: the assistant's proposal is applied as the player left it");
}
