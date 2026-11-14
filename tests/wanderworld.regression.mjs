// Wanderworld logic that runs without a browser: collision against trunks and buildings, the camera's
// sight check, the seeded town, and the built-in person and how bodies move.
// Run: node tests/wanderworld.regression.mjs
import assert from "node:assert/strict";
import { Box3, Matrix4, PerspectiveCamera, Vector3 } from "three";
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
  nature.setDensity(1);
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
  nature.setDensity(4);
  assert.ok(drawn() > near * 2, `more density means more detailed trees (${near} → ${drawn()})`);
  nature.setDrawDistance(90);
  nature.setDensity(1);
  assert.ok(drawn() < near, `a shorter draw distance draws fewer of them (${drawn()})`);
  // Sparse: fewer again. And detailed trees only out to where the setting says, simple ones past it.
  nature.setDrawDistance(140);
  nature.setDensity(0.5);
  const sparse = drawn();
  assert.ok(sparse < near, `half the density draws fewer trees (${near} → ${sparse})`);
  nature.setDensity(0.25);
  assert.ok(drawn() > 0 && drawn() < sparse, `and Sparse fewer again (${sparse} → ${drawn()})`);
  nature.setDensity(1);
  nature.setTreeReach(30);
  assert.ok(drawn() < near / 3, `detailed trees only nearby when set so (${near} → ${drawn()})`);
  assert.ok(trunks.visible && trunks.count > 0, "and simple trees stand in past them");
  nature.setTreeReach(180);
  assert.equal(drawn(), near, "back to all of them");
  // Only where the camera looks: with a camera, what's behind it isn't drawn; what's near it always is.
  const camera = new PerspectiveCamera(55, 16 / 9, 0.1, 200);
  camera.position.set(SPAWN.x, 6, SPAWN.z);
  camera.lookAt(SPAWN.x + 50, 2, SPAWN.z);
  camera.updateMatrixWorld(true);
  nature.follow(SPAWN.x, SPAWN.z, camera);
  const ahead = drawn();
  assert.ok(ahead > 20 && ahead < near * 0.7, `fewer trees are drawn than all round (${near} → ${ahead})`);
  for (const mesh of trees) {
    for (let i = 0; i < mesh.count; i++) {
      const at = new Vector3().setFromMatrixPosition(new Matrix4().fromArray(mesh.instanceMatrix.array, i * 16));
      const [x, z] = [at.x - SPAWN.x, at.z - SPAWN.z];
      assert.ok(x > 0 || Math.hypot(x, z) < 31 || Math.abs(z) > -x * 0.4, "nothing far behind the camera is drawn");
    }
  }
  camera.lookAt(SPAWN.x + 50, 2, SPAWN.z + 3); // a small turn: nothing is drawn again
  camera.updateMatrixWorld(true);
  nature.follow(SPAWN.x, SPAWN.z, camera);
  assert.equal(drawn(), ahead, "a small turn of the camera keeps what's drawn");
  camera.lookAt(SPAWN.x, -50, SPAWN.z + 0.01); // straight down: all round again
  camera.updateMatrixWorld(true);
  nature.follow(SPAWN.x, SPAWN.z, camera);
  assert.equal(drawn(), near, "looking straight down draws all round");
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
  const { geometry, footprint, doorX, bay } = buildBuilding(random, spec);
  geometry.computeBoundingBox();
  const bounds = geometry.boundingBox;
  assert.ok(bounds.max.y > 3, `a ${kind} stands taller than a person`);
  assert.ok(Math.abs(doorX) < spec.width / 2, `a ${kind}'s door is on its front wall`);
  // The footprint covers the walls (overhangs, signs and sills may stick out a little past it).
  // (A smithy's walls go round its room only: the rest of its width is its forge, open to the street.)
  if (bay) {
    assert.equal(kind, "smithy", "only a smithy has a forge");
    assert.equal(footprint.maxX - footprint.minX, bay.roomWidth, "the smithy's walls go round its room");
    assert.equal(bay.x1 - bay.x0 + bay.roomWidth, spec.width, "room and forge make up its whole width");
    assert.ok(doorX > footprint.minX && doorX < footprint.maxX, "the smithy's door is in its room's wall");
    assert.ok(bay.x1 <= footprint.minX || bay.x0 >= footprint.maxX, "the forge is beside the room, not in it");
  } else {
    assert.ok(
      footprint.minX <= -spec.width / 2 && footprint.maxX >= spec.width / 2,
      `a ${kind}'s footprint covers its width`,
    );
  }
  const [left, right] = bay ? [-spec.width / 2, spec.width / 2] : [footprint.minX, footprint.maxX];
  assert.ok(bounds.min.x > left - 1.5 && bounds.max.x < right + 1.5, `a ${kind} stays near its footprint`);
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
assert.equal(checkSetting("resolution", "8k"), "1080", "an unknown resolution is the usual one");
assert.equal(checkSetting("resolution", "auto"), "1080", "and so is Auto, which is gone (it flickered)");
assert.equal(checkSetting("resolution", "720"), "720", "720p is one of them");
assert.equal(checkSetting("drawDistance", 140), 140, "a listed choice is kept");
assert.equal(checkSetting("shadows", "yes"), true, "a non-boolean switch is the default");
assert.equal(checkSetting("nonsense", 1), undefined, "unknown settings are ignored");
globalThis.localStorage = { getItem: () => "{not json" };
assert.deepEqual(loadSettings().resolution, "1080", "a damaged saved copy loads the defaults");
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

// ── Where saves are kept: with the Engine, read once and written through (store.js) ──────────
{
  const { createStore, SHARED_SETTINGS } = await import("../packages/wanderworld/src/store.js");
  const { createSaves } = await import("../packages/wanderworld/src/saves.js");
  const { DEVICE_SETTINGS, sharedSettings } = await import("../packages/wanderworld/src/settings.js");
  const engine = (kept = {}) => {
    const keys = new Map(Object.entries(kept));
    return {
      keys,
      down: false,
      puts: 0,
      all: async function () {
        if (this.down) throw new Error("down");
        return Object.fromEntries(keys);
      },
      put: async function (key, value) {
        if (this.down) throw new Error("down");
        this.puts += 1;
        keys.set(key, value);
      },
      remove: async function (key) {
        if (this.down) throw new Error("down");
        keys.delete(key);
      },
    };
  };
  const remote = engine();
  const store = createStore(remote, { delay: 0 });
  await store.connect();
  const saves = createSaves(store);
  const first = saves.create({ name: "First", seed: "one" });
  saves.setLast(first.id);
  // A write is held at once and sent after; the newest one for a key is the one kept.
  saves.write({ ...saves.read(first.id), name: "Renamed", playedAt: 5 });
  saves.write({ ...saves.read(first.id), name: "Renamed twice", playedAt: 6 });
  assert.equal(saves.read(first.id).name, "Renamed twice", "read back before it's sent");
  assert.equal(saves.read(first.id).genders, null, "a world with no gender shares of its own follows Settings");
  saves.write({ ...saves.read(first.id), genders: { male: 10, female: 250, custom: "x", name: "  Non-binary " } });
  assert.deepEqual(
    saves.read(first.id).genders,
    { male: 10, female: 100, custom: 0, name: "Non-binary" },
    "a world keeps its own gender shares, checked",
  );
  await store.flush();
  assert.deepEqual(
    [...remote.keys.keys()].sort(),
    ["wanderworld.lastWorld", `wanderworld.world.${first.id}`, "wanderworld.worlds"].sort(),
  );
  assert.equal(JSON.parse(remote.keys.get(`wanderworld.world.${first.id}`)).name, "Renamed twice");
  // Another browser: the same worlds.
  const there = createStore(remote, { delay: 0 });
  await there.connect();
  const otherSaves = createSaves(there);
  assert.deepEqual(
    otherSaves.list().map((entry) => entry.name),
    ["Renamed twice"],
  );
  assert.equal(otherSaves.last().name, "Renamed twice");
  const second = otherSaves.create({ name: "Second", seed: "two" });
  await there.flush();
  // The Engine doesn't answer: nothing is read, and nothing is sent that could write over what it keeps.
  remote.down = true;
  const problems = [];
  const blind = createStore(remote, { delay: 0, onProblem: (error) => problems.push(error.message) });
  await assert.rejects(blind.connect());
  assert.equal(blind.ready, false);
  createSaves(blind).create({ name: "Never kept", seed: "x" });
  remote.down = false;
  const putsBefore = remote.puts;
  await blind.flush();
  assert.equal(remote.puts, putsBefore, "not connected: not sent");
  assert.equal(JSON.parse(remote.keys.get("wanderworld.worlds")).length, 2, "the list of worlds is as it was");
  // It stops answering mid-play: the write is held, said, and sent with the next one.
  remote.down = true;
  there.setItem(
    `wanderworld.world.${second.id}`,
    JSON.stringify({ ...otherSaves.read(second.id), name: "While down" }),
  );
  await there.flush();
  assert.equal(JSON.parse(remote.keys.get(`wanderworld.world.${second.id}`)).name, "Second");
  assert.equal(otherSaves.read(second.id).name, "While down", "still held while the tab is open");
  remote.down = false;
  otherSaves.setLast(second.id);
  await there.flush();
  assert.equal(
    JSON.parse(remote.keys.get(`wanderworld.world.${second.id}`)).name,
    "While down",
    "sent with the next write",
  );
  // Deleting a world deletes it there.
  otherSaves.remove(second.id);
  await there.flush();
  assert.ok(!remote.keys.has(`wanderworld.world.${second.id}`));
  // Settings: the game's and the AI's are the Engine's, the same in every browser; a device's own stay its own.
  for (const name of DEVICE_SETTINGS) assert.ok(Object.hasOwn(SETTINGS, name), `${name} is a setting`);
  const was = globalThis.localStorage;
  const browser = (saved) => ({ getItem: () => JSON.stringify(saved) });
  globalThis.localStorage = browser({ shadows: false, volume: 0.2, memoryTold: 30, gossip: true });
  const here = loadSettings();
  assert.deepEqual([here.shadows, here.volume, here.memoryTold, here.gossip], [false, 0.2, 30, true]);
  const common = sharedSettings(here);
  assert.ok(!("shadows" in common) && !("volume" in common) && common.memoryTold === 30 && common.gossip === true);
  assert.ok("aiMoments" in common && "textConnection" in common && "narratorCard" in common && "animalsWild" in common);
  globalThis.localStorage = browser({ shadows: true, volume: 0.9, memoryTold: 5, gossip: false });
  const elsewhere = loadSettings(JSON.stringify({ ...common, shadows: false, madeUp: 1, memoryKeptTold: 9999 }));
  assert.deepEqual(
    [elsewhere.shadows, elsewhere.volume, elsewhere.memoryTold, elsewhere.gossip],
    [true, 0.9, 30, true],
  );
  assert.equal(elsewhere.memoryKeptTold, SETTINGS.memoryKeptTold.max, "checked like any other");
  assert.ok(!("madeUp" in elsewhere));
  assert.equal(loadSettings("{broken").memoryTold, 5, "a damaged copy: this browser's own");
  globalThis.localStorage = was;
  store.setItem(SHARED_SETTINGS, JSON.stringify(common));
  await store.flush();
  assert.equal(JSON.parse(remote.keys.get(SHARED_SETTINGS)).memoryTold, 30);
  console.log("ok: saves and shared settings are kept by the Engine");
}

// ── What goes with a message to the assistant ────────────────────────────────────────────────────────────
{
  const { assistantNeeds, mentioned, PARTS, PICKS } = await import("../packages/wanderworld/src/assistant-context.js");
  const needs = (...texts) => [...assistantNeeds(texts)].sort();
  assert.deepEqual(needs("Make Jake and Sarah married"), ["relations"]);
  assert.ok(needs("Move Jake into home3").includes("places"));
  assert.ok(needs("How do I tie lore to a place?").includes("help"));
  assert.ok(!needs("Make Jake a sorcerer").includes("help"), "the long parts stay out of a plain request");
  assert.deepEqual(needs("hmm"), ["board", "places", "relations"], "nothing to go on: the usual parts");
  assert.ok(needs("What happened yesterday?", "yes, do that").includes("recaps"), "the message before rides along");
  assert.ok(!needs("What happened?", "Rename tavern1", "ok").includes("recaps"), "but not the one before that");
  const gaps = PICKS.find((pick) => pick.id === "gaps");
  assert.deepEqual([...assistantNeeds(["anything about lore and help"], gaps)].sort(), [...gaps.needs].sort());
  assert.ok(assistantNeeds(["hi"], gaps, ["chat", "made-up"]).has("chat"), "a part the model asked for");
  assert.ok(!assistantNeeds(["hi"], gaps, ["made-up"]).has("made-up"));
  assert.deepEqual(mentioned(["Jake Marlow", "Sarah", "Al"], ["make jake taller", "also Alfred"]), ["Jake Marlow"]);
  for (const pick of PICKS) {
    assert.ok(pick.label && pick.note, `${pick.id} says what it does`);
    assert.equal([pick.ask, pick.fill, pick.picker].filter(Boolean).length, 1, `${pick.id} does one thing`);
    if (pick.picker === "memories")
      assert.ok(pick.request && pick.needs.includes("memories"), `${pick.id} asks about memories`);
    for (const part of pick.needs) assert.ok(Object.hasOwn(PARTS, part), `${pick.id}: ${part}`);
  }
  assert.ok(PICKS.filter((pick) => pick.common).length <= 4, "a few always in view");
  assert.ok(needs("Why does Mira remember that?").includes("memories"));
  assert.ok(!needs("Make Jake a sorcerer").includes("memories"), "memories stay out of a plain request");
  assert.ok(PICKS.filter((pick) => pick.picker === "memories").length >= 4);
  // A ready-made request typed out is found, and gets what the button would send.
  const { pickFor } = await import("../packages/wanderworld/src/assistant-context.js");
  assert.equal(pickFor("fill in the gaps")?.id, "gaps");
  assert.equal(pickFor("Fill in the gaps please")?.id, "gaps");
  assert.equal(pickFor(gaps.ask)?.id, "gaps");
  assert.equal(pickFor("Fill in the gaps in this world: find the people who have no lore, and be quick")?.id, "gaps");
  assert.equal(pickFor("Write lore for the faction The Thieves' Guild")?.id, "faction-lore");
  assert.equal(pickFor("Tell me about Mira")?.id, "about");
  assert.equal(pickFor("Make Jake a sorcerer"), null);
  assert.equal(pickFor("hi"), null);

  // The proposal's choices: places from the world, a number kept in range, a fixed list held to.
  const { editableFields, reviseEdits } = await import("../packages/wanderworld/src/assistant-edits.js");
  const lists = { homes: [{ value: "home3", label: "a house (home3)" }], works: [], voices: ["gruff"] };
  const home = editableFields({ do: "home", person: "Jake", place: "The Old Mill", with: "" }, lists)[0];
  assert.deepEqual(
    home.options.map((option) => option.value),
    ["The Old Mill", "none", "home3"],
    "what the edit has is always among the choices",
  );
  assert.deepEqual(editableFields({ do: "home", person: "Jake", place: "", with: "Sarah" }, lists), []);
  const edits = [
    { do: "relate", from: "Jake", to: "Sarah", kind: "friend", role: "", backRole: "", level: null, both: false },
    { do: "set", person: "Jake", body: "male", voice: "", stance: "rude" },
    { do: "home", person: "Jake", place: "home1", with: "" },
  ];
  assert.deepEqual(
    editableFields(edits[0]).map((part) => part.key),
    ["kind", "level", "role"],
  );
  const left = reviseEdits(edits, [
    { edit: 0, keep: true, values: { level: "250", kind: "rival" } },
    { edit: 1, keep: true, values: { body: "robot", voice: "gruff", stance: "" } },
    { edit: 2, keep: true, values: { place: "home3" } },
  ]).edits;
  assert.deepEqual([left[0].level, left[0].kind], [100, "rival"]);
  assert.deepEqual([left[1].body, left[1].voice, left[1].stance], ["male", "gruff", ""]);
  assert.equal(left[2].place, "home3");
  assert.equal(reviseEdits(edits, [{ edit: 0, keep: true, values: { level: "" } }]).edits[0].level, null);
  console.log("ok: the assistant's context and choices");
}

// ── Someone left to chance: a man, a woman or the third gender, by the shares set ────────────
{
  const { lookFor, setGenderShares } = await import("../packages/wanderworld/src/people.js");
  const index = JSON.parse(
    (await import("node:fs")).readFileSync(
      new URL("../packages/wanderworld/kit/generic/people/index.json", import.meta.url),
      "utf8",
    ),
  );
  const names = Array.from({ length: 400 }, (_, i) => `Person ${i}`);
  const count = () => names.filter((name) => lookFor(name, index).sex === "male").length;
  const before = names.map((name) => lookFor(name, index).sex);
  setGenderShares({ male: 50, female: 50, custom: 0 });
  assert.deepEqual(
    names.map((name) => lookFor(name, index).sex),
    before,
    "half and half is as it always was",
  );
  setGenderShares({ male: 100, female: 0, custom: 0 });
  assert.equal(count(), 400);
  setGenderShares({ male: 0, female: 100, custom: 0 });
  assert.equal(count(), 0);
  setGenderShares({ male: 80, female: 20, custom: 0 });
  assert.ok(count() > 280 && count() < 360, `about four in five: ${count()}`);
  // The third gender has one of the two figures, and what's chosen for someone is theirs whatever the shares.
  setGenderShares({ male: 0, female: 0, custom: 100 });
  assert.ok(count() > 150 && count() < 250, `either figure: ${count()}`);
  assert.equal(lookFor("Person 1", index, "female").sex, "female");
  assert.equal(lookFor("Person 1", index, "male").sex, "male");
  assert.ok(["male", "female"].includes(lookFor("Person 1", index, "custom").sex));
  setGenderShares({ male: 0, female: 0, custom: 0 });
  assert.deepEqual(
    names.map((name) => lookFor(name, index).sex),
    before,
    "nothing set: half and half",
  );
  setGenderShares({ male: 50, female: 50, custom: 0 });
  console.log("ok: genders by the shares set");
}
