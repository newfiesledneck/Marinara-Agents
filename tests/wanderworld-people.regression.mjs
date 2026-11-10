// Wanderworld's default people, built from the kit files on disk (kit/people/, made from Quaternius's
// CC0 character packs by scripts/build-wanderworld-people.mjs): each name gets a person of a person's
// height, standing on the ground, facing +z, with arms down at rest, who walks with planted feet, and
// the same name always gives the same person. Pictures aren't drawn in Node, so images are stubbed.
// Run: node tests/wanderworld-people.regression.mjs
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Box3, Vector3 } from "three";

const kit = join(dirname(fileURLToPath(import.meta.url)), "../packages/wanderworld/kit/people");
globalThis.fetch = async (url) => {
  const name = String(url).split("/kit/people/")[1];
  try {
    return new Response(await readFile(join(kit, name)), { status: 200 });
  } catch {
    return new Response("missing", { status: 404 });
  }
};
const image = () => ({ addEventListener() {}, removeEventListener() {}, setAttribute() {}, style: {} });
globalThis.document = { createElementNS: image, createElement: image };

const { createPerson, lookFor } = await import("../packages/wanderworld/src/people.js");
const index = JSON.parse(await readFile(join(kit, "index.json"), "utf8"));
assert.ok(index.source.includes("CC0"), "the kit says where it's from and its licence");

const looks = new Set();
for (const name of ["Bram", "Ivy", "Hank", "Lena", "Odo", "Sera", "Cole", "Brin"]) {
  const look = lookFor(name, index);
  assert.deepEqual(lookFor(name, index), look, "the same name always gives the same look");
  looks.add(`${look.outfit}/${look.colourway}/${look.hair}`);

  const person = await createPerson(name);
  person.update(1 / 60, 0);
  person.object.updateMatrixWorld(true);
  const box = new Box3().setFromObject(person.object, true);
  const height = box.max.y - box.min.y;
  assert.ok(height > 1.5 && height < 2.05, `${name} is person-sized (${height.toFixed(2)} m)`);
  assert.ok(Math.abs(box.min.y) < 0.06, `${name} stands on the ground (${box.min.y.toFixed(3)})`);
  const bone = (wanted) => {
    let found = null;
    person.object.traverse((object) => {
      if (object.isBone && object.name === wanted) found = object;
    });
    return found.getWorldPosition(new Vector3());
  };
  assert.ok(bone("thigh_l").x > bone("thigh_r").x, `${name} faces +z (left leg on +x)`);
  assert.ok(bone("hand_l").y < bone("upperarm_l").y - 0.3, `${name}'s arms hang down at rest`);

  // Walking at 1.4 m/s, the foot on the ground keeps pace with it.
  const frames = [];
  for (let i = 0; i < 240; i++) {
    person.update(1 / 60, 1.4);
    person.object.updateMatrixWorld(true);
    if (i > 60) frames.push([bone("foot_l"), bone("foot_r")]);
  }
  const lowest = Math.min(...frames.flat().map((foot) => foot.y));
  let sum = 0;
  let count = 0;
  for (let i = 1; i < frames.length; i++) {
    for (const side of [0, 1]) {
      if (frames[i][side].y > lowest + 0.02 || frames[i - 1][side].y > lowest + 0.02) continue;
      sum += -(frames[i][side].z - frames[i - 1][side].z) * 60;
      count++;
    }
  }
  assert.ok(Math.abs(sum / count - 1.4) < 0.25, `${name} walks with planted feet (${(sum / count).toFixed(2)} m/s)`);
  person.dispose();
}
assert.ok(looks.size >= 5, `different names look different (${looks.size} looks for 8 names)`);

// ── Looks chosen by hand ─────────────────────────────────────────────────────
{
  const { checkLook, HAIR_COLOURS, OUTFITS, SKIN_TONES } = await import("../packages/wanderworld/src/looks.js");
  // Every outfit and colour on the menus is in the kit, for both bodies.
  for (const sex of ["male", "female"]) {
    for (const [outfit, { colours }] of Object.entries(OUTFITS)) {
      const packed = index.sexes[sex].outfits.find((entry) => entry.name === `${sex}-${outfit}`);
      assert.ok(packed, `the kit has the ${sex} ${outfit} outfit`);
      assert.deepEqual([...packed.colourways].sort(), colours.map(([name]) => name).sort(), `${outfit}'s colours`);
    }
  }
  const usual = lookFor("Mira", index, "female");
  // One thing chosen changes only that.
  const hooded = lookFor("Mira", index, "female", { outfit: "ranger" });
  assert.equal(hooded.outfit, "female-ranger");
  assert.ok(
    OUTFITS.ranger.colours.some(([name]) => name === hooded.colourway),
    "a ranger wears a ranger's colour",
  );
  assert.equal(hooded.hair, usual.hair, "her hair is as it was");
  assert.deepEqual(hooded.skin, usual.skin, "and her skin");
  const dyed = lookFor("Mira", index, "female", {
    hairColour: 9,
    skin: 4,
    hair: "none",
    height: 1.1,
    colour: "clothes-red",
    outfit: "peasant",
  });
  assert.equal(dyed.hairColour, HAIR_COLOURS[9][0]);
  assert.deepEqual(dyed.skin, SKIN_TONES[4][0]);
  assert.equal(dyed.hair, "none");
  assert.equal(dyed.height, 1.1);
  assert.equal(dyed.colourway, "clothes-red");
  assert.equal(lookFor("Tam", index, "male", { beard: true }).beard, true);
  assert.equal(lookFor("Tam", index, "female", { beard: true }).beard, false, "a beard is a man's");
  // Whoever is dressed from a chosen look loads and stands like anyone.
  for (const chosen of [
    { outfit: "ranger", hair: "none" },
    { outfit: "ranger", colour: "ranger-wine", beard: true },
  ]) {
    const person = await createPerson("Rook", "male", chosen);
    assert.ok(person.object && typeof person.update === "function");
    person.update(0.1, 0, {});
    person.dispose();
  }
  // What's saved is only what's on the menus.
  assert.deepEqual(
    checkLook({ outfit: "ranger", colour: "clothes-red", hair: "mohawk", skin: 99, beard: "yes", height: 5 }),
    {
      outfit: "ranger",
      height: 1.12,
    },
  );
  assert.deepEqual(
    checkLook({ colour: "ranger-wine" }),
    { colour: "ranger-wine", outfit: "ranger" },
    "a colour brings its outfit",
  );
  assert.deepEqual(checkLook("ranger"), {});
  assert.deepEqual(checkLook({ hairColour: 3, skin: 0, beard: false, hair: "long" }), {
    hair: "long",
    hairColour: 3,
    skin: 0,
    beard: false,
  });
}

console.log("wanderworld people regression: OK");
