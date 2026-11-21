// The monsters Wanderworld builds in code (bestiary.js): each builds without a browser, stands on the
// ground at its own size, stays cheap enough for a crowd of them on a phone, walks with the people's
// clips, looks the same every time, and is a creature the rest of the game knows (a switch, a sort, a
// name, numbers and spoils, the SRD's numbers, and the word for it in lore).
// Run: node tests/wanderworld-bestiary.regression.mjs
import assert from "node:assert/strict";
import { ANIMALS, animalKind, SORT_OF, SWITCHES } from "../packages/wanderworld/src/animals.js";
import { BESTIARY, createBuilt } from "../packages/wanderworld/src/bestiary.js";
import { PACK } from "../packages/wanderworld/src/pack.js";
import { SRD_CREATURES } from "../packages/wanderworld/src/srd.js";

const meshOf = (body) => {
  let mesh = null;
  body.object.traverse((node) => {
    if (node.isSkinnedMesh) mesh = node;
  });
  return mesh;
};

// How tall each stands, in metres (a goblin is Small; the rest are Large, the troll stooped).
const HEIGHT = { goblin: [0.85, 1.2], ogre: [2.4, 3.1], troll: [2.1, 2.8], minotaur: [2.5, 3.1] };
assert.deepEqual(Object.keys(BESTIARY).sort(), Object.keys(HEIGHT).sort(), "every monster has a height to check");

for (const kind of Object.keys(BESTIARY)) {
  const body = createBuilt(kind);
  const mesh = meshOf(body);
  assert.ok(mesh, `${kind}: one skinned mesh`);
  mesh.geometry.computeBoundingBox();
  const { min, max } = mesh.geometry.boundingBox;
  assert.ok(Math.abs(min.y) < 0.02, `${kind} stands on the ground (${min.y.toFixed(3)})`);
  const [low, high] = HEIGHT[kind];
  assert.ok(max.y >= low && max.y <= high, `${kind} is ${max.y.toFixed(2)} m tall`);
  assert.ok(mesh.geometry.attributes.position.count < 30000, `${kind} stays cheap`);

  // It walks: a few frames at a walking pace move its legs from where they rest.
  const leg = mesh.skeleton.bones.find((bone) => bone.name === "leftUpperLeg");
  const rest = leg.quaternion.clone();
  for (let i = 0; i < 20; i++) body.update(1 / 30, 1.4);
  assert.ok(leg.quaternion.angleTo(rest) > 0.05, `${kind}'s legs move as it walks`);

  // The same kind looks the same every time.
  const again = meshOf(createBuilt(kind)).geometry.attributes.position.array;
  assert.deepEqual(again, mesh.geometry.attributes.position.array, `${kind} is built the same each time`);

  // A creature the game knows.
  assert.ok(ANIMALS[kind]?.built && ANIMALS[kind].folk && ANIMALS[kind].hostile, `${kind}: a two-legged monster`);
  assert.equal(SORT_OF[kind], "monsters");
  assert.deepEqual(SWITCHES[kind], [kind]);
  assert.equal(PACK.animals[kind], `the ${kind}`);
  assert.ok(PACK.foes[kind]?.hp > 0 && PACK.spoils[kind], `${kind}: numbers and spoils of its own`);
  assert.ok(SRD_CREATURES[kind]?.hp > 0, `${kind}: the SRD's numbers`);
}

// The big three are met one at a time, now and then; goblins in bands.
for (const kind of ["ogre", "troll", "minotaur"]) assert.ok(ANIMALS[kind].rare, `${kind} is rare`);
assert.ok(!ANIMALS.goblin.rare);

// Lore's words for them.
assert.equal(animalKind("goblins"), "goblin");
assert.equal(animalKind("Ogres"), "ogre");
assert.equal(animalKind("troll"), "troll");
assert.equal(animalKind("minotaurs"), "minotaur");
assert.equal(animalKind("orc"), "puglin", "an orc is still the puglin");

console.log("ok: monsters built in code");
