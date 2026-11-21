// The monsters Wanderworld builds in code (bestiary.js): each builds without a browser, stands on the
// ground at its own size, stays cheap enough for a crowd of them on a phone, walks with the people's
// clips, looks the same every time, and is a creature the rest of the game knows (a switch, a sort, a
// name, numbers and spoils, the SRD's numbers, and the word for it in lore).
// Run: node tests/wanderworld-bestiary.regression.mjs
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
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

// How tall each stands, in metres (goblins and kobolds are Small; the ogre, troll and minotaur Large,
// the troll stooped; the rest about a person's height, the ghoul stooped).
const HEIGHT = {
  goblin: [0.85, 1.2],
  kobold: [0.6, 0.9],
  hobgoblin: [1.6, 2],
  orc: [1.7, 2.1],
  lizardfolk: [1.7, 2.1],
  ghoul: [1.4, 1.8],
  gnoll: [1.8, 2.3],
  bugbear: [1.8, 2.3],
  ogre: [2.4, 3.1],
  troll: [2.1, 2.8],
  minotaur: [2.5, 3.1],
};
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
  assert.ok(mesh.geometry.attributes.position.count <= 35000, `${kind} stays cheap`); // (AGENTS.md rule 5)

  // It walks: a second at a walking pace swings its legs from where they rest. (The most it swings:
  // at any one moment the stride may be passing the standing pose.)
  const leg = mesh.skeleton.bones.find((bone) => bone.name === "leftUpperLeg");
  const rest = leg.quaternion.clone();
  let swing = 0;
  for (let i = 0; i < 30; i++) {
    body.update(1 / 30, 1.4);
    swing = Math.max(swing, leg.quaternion.angleTo(rest));
  }
  assert.ok(swing > 0.05, `${kind}'s legs move as it walks`);

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

// The big three are met one at a time, now and then; the rest in bands. Ghouls come out at night.
for (const kind of ["ogre", "troll", "minotaur"]) assert.ok(ANIMALS[kind].rare, `${kind} is rare`);
for (const kind of ["goblin", "hobgoblin", "orc", "gnoll", "kobold"]) assert.ok(!ANIMALS[kind].rare, `${kind} isn't`);
assert.equal(ANIMALS.ghoul.when, "night");

// Each carries something: more of its mesh is bound to the right hand than to the left.
for (const kind of ["goblin", "hobgoblin", "bugbear", "orc", "gnoll", "kobold", "lizardfolk", "ogre", "minotaur"]) {
  const mesh = meshOf(createBuilt(kind));
  const names = mesh.skeleton.bones.map((bone) => bone.name);
  const right = names.indexOf("rightHand");
  const left = names.indexOf("leftHand");
  const skin = mesh.geometry.attributes.skinIndex;
  let r = 0;
  let l = 0;
  for (let i = 0; i < skin.count; i++) {
    if (skin.getX(i) === right) r++;
    if (skin.getX(i) === left) l++;
  }
  assert.ok(r > l, `the ${kind} has something in its right hand`);
}

// The models made in Blender (packages/wanderworld/assets: AGENTS.md there): every .glb is in the kit
// (`node scripts/build-wanderworld-people.mjs --bestiary` after changing one) and nothing else is, each on
// the people's skeleton with its palette texture, its kind's height, and its own Idle, Walk and Attack.
{
  const pkg = join(dirname(fileURLToPath(import.meta.url)), "../packages/wanderworld");
  // (The avatar and anthro bodies are packed apart; a creature with a skeleton of its own goes to
  // kit/creatures/rigged-<name>.json instead, which the animals suite checks.)
  const rigged = readdirSync(join(pkg, "kit/creatures"))
    .filter((name) => /^rigged-.+\.json$/u.test(name))
    .map((name) => name.slice(7, -5));
  // (Only the committed ones: a model still being made, not yet in git, isn't packed yet.)
  let tracked = null;
  try {
    tracked = new Set(
      execFileSync("git", ["ls-files", "assets/models"], { cwd: pkg, encoding: "utf8" })
        .split(/\r?\n/u)
        .map((path) => path.split("/").pop()),
    );
  } catch {
    // (no git: every model there counts)
  }
  const models = readdirSync(join(pkg, "assets/models"))
    .filter((name) => name.endsWith(".glb") && !/^(?:avatar|anthro|outfit)-|^giant-base/u.test(name))
    .filter((name) => !tracked || tracked.has(name))
    .map((name) => name.slice(0, -4))
    .filter((name) => !rigged.includes(name));
  assert.ok(models.includes("goblin"), "the goblin is made in Blender");
  const folk = join(pkg, "kit/fantasy/folk");
  const built = {};
  for (const name of readdirSync(folk).filter((file) => /^folk-built-.+\.json$/u.test(file)))
    Object.assign(built, JSON.parse(readFileSync(join(folk, name), "utf8")).folk);
  assert.deepEqual(Object.keys(built).sort(), models.sort(), "the kit has every model and only those");
  // (The ones made only in Blender, with no code-built shape to fall back on, and how tall each stands.)
  const MADE_HEIGHT = {
    skeleton: [1.6, 1.9],
    zombie: [1.6, 1.9],
    ghost: [1.6, 2.0],
    specter: [1.7, 2.1],
    earth_elemental: [3.0, 3.5],
    hill_giant: [4.7, 5.2],
    stone_giant: [5.2, 5.8],
    frost_giant: [6.0, 6.8],
    fire_giant: [5.2, 5.8],
  };
  for (const [kind, body] of Object.entries(built)) {
    assert.ok(ANIMALS[kind]?.built, `${kind} is one of Wanderworld's own monsters`);
    for (const bone of ["pelvis", "spine_01", "Head", "upperarm_l", "hand_r", "thigh_l", "calf_r", "foot_l"])
      assert.ok(body.skeleton.names.includes(bone), `the ${kind} has the people's ${bone}`);
    const [low, high] = HEIGHT[kind] ?? MADE_HEIGHT[kind];
    assert.ok(body.height >= low && body.height <= high, `the ${kind} model is ${body.height} m tall`);
    assert.ok(existsSync(join(folk, `folk-${kind}.webp`)), `the ${kind}'s palette texture`);
    // Cheap enough for a crowd (AGENTS.md rule 5): up to about 35,000 vertices close up, and a distant
    // version of about 7,000 vertices' worth of triangles (no more than 10,000) over the same vertices.
    const vertices = body.meshes.reduce((sum, mesh) => sum + mesh.count, 0);
    assert.ok(vertices <= 35000, `the ${kind} has ${vertices} vertices`);
    const farIndex = (mesh) => {
      const bytes = Buffer.from(mesh.far ?? mesh.index, "base64");
      return mesh.wide
        ? new Uint32Array(bytes.buffer, bytes.byteOffset, bytes.length / 4)
        : new Uint16Array(bytes.buffer, bytes.byteOffset, bytes.length / 2);
    };
    const farTriangles = body.meshes.reduce((sum, mesh) => sum + farIndex(mesh).length / 3, 0);
    assert.ok(
      body.meshes.some((mesh) => mesh.far),
      `the ${kind} has a distant version`,
    );
    assert.ok(farTriangles <= 10000, `the ${kind}'s distant version has ${farTriangles} triangles`);
    for (const mesh of body.meshes) assert.ok(Math.max(...farIndex(mesh)) < mesh.count, "of its own vertices");
    const glb = readFileSync(join(pkg, `assets/models/${kind}.glb`));
    const gltf = JSON.parse(glb.subarray(20, 20 + glb.readUInt32LE(12)).toString("utf8"));
    assert.deepEqual(
      gltf.animations.map((clip) => clip.name).sort(),
      ["Attack", "Idle", "Walk"],
      `the ${kind}'s own actions`,
    );
  }
}

// Lore's words for them.
assert.equal(animalKind("goblins"), "goblin");
assert.equal(animalKind("Ogres"), "ogre");
assert.equal(animalKind("troll"), "troll");
assert.equal(animalKind("minotaurs"), "minotaur");
assert.equal(animalKind("orcs"), "orc", "an orc is an orc now, not a puglin");
assert.equal(animalKind("Lizardmen"), "lizardfolk");
assert.equal(animalKind("ghouls"), "ghoul");

console.log("ok: monsters built in code");
