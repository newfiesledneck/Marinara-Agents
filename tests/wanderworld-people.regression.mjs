// Wanderworld's default people, built from the kit files on disk (kit/people/, made from Quaternius's
// CC0 character packs by scripts/build-wanderworld-people.mjs): each name gets a person of a person's
// height, standing on the ground, facing +z, with arms down at rest, who walks with planted feet, and
// the same name always gives the same person. Pictures aren't drawn in Node, so images are stubbed.
// Run: node tests/wanderworld-people.regression.mjs
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
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
  looks.add(`${look.choices.outfit}/${look.colourways[look.choices.outfit]}/${look.hair}`);

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
  const { checkLook, COLOUR_FIELD, EXTRAS, HAIR_COLOURS, OUTFITS, PIECES, SKIN_TONES } =
    await import("../packages/wanderworld/src/looks.js");
  const kitFiles = new Set(await readdir(kit));
  // Every outfit, colour and piece on the menus is in the kit, for both bodies.
  for (const sex of ["male", "female"]) {
    assert.ok(kitFiles.has(`skeleton-${sex}.json`), `the ${sex} skeleton`);
    for (const [outfit, { colours }] of Object.entries(OUTFITS)) {
      const packed = index.sexes[sex].outfits.find((entry) => entry.name === `${sex}-${outfit}`);
      assert.ok(packed, `the kit has the ${sex} ${outfit} outfit`);
      assert.deepEqual([...packed.colourways].sort(), colours.map(([name]) => name).sort(), `${outfit}'s colours`);
      for (const [name] of colours) assert.ok(kitFiles.has(`${name}.webp`), `the ${name} cloth`);
      for (const [piece] of PIECES)
        assert.ok(kitFiles.has(`${sex}-${outfit}-${piece}.json`), `${sex} ${outfit} ${piece}`);
    }
    for (const [extra, , outfit] of EXTRAS)
      assert.ok(kitFiles.has(`${sex}-${outfit}-${extra}.json`), `${sex} ${extra}`);
  }
  const usual = lookFor("Mira", index, "female");
  // One thing chosen changes only that.
  const hooded = lookFor("Mira", index, "female", { outfit: "ranger" });
  assert.deepEqual(hooded.parts, [
    "female-ranger-top",
    "female-ranger-arms",
    "female-ranger-legs",
    "female-ranger-feet",
    "female-ranger-hood",
    "female-ranger-pauldrons",
  ]);
  assert.equal(hooded.hair, usual.hair, "her hair is as it was");
  assert.deepEqual(hooded.skin, usual.skin, "and her skin");
  // The hood and the pauldrons come off; a piece comes from another outfit; each outfit keeps its colour.
  const bare = lookFor("Mira", index, "female", { outfit: "ranger", hood: false, pauldrons: false, legs: "peasant" });
  assert.deepEqual(bare.parts, [
    "female-ranger-top",
    "female-ranger-arms",
    "female-peasant-legs",
    "female-ranger-feet",
  ]);
  assert.deepEqual([...bare.worn].sort(), ["peasant", "ranger"]);
  const mixed = lookFor("Mira", index, "female", {
    outfit: "peasant",
    hood: true,
    colour: "clothes-red",
    rangerColour: "ranger-wine",
  });
  assert.ok(mixed.parts.includes("female-ranger-hood") && mixed.parts.includes("female-peasant-top"));
  assert.deepEqual(mixed.colourways, { peasant: "clothes-red", ranger: "ranger-wine" });
  assert.equal(
    lookFor("Mira", index, "female", { outfit: "peasant" }).worn.join(),
    "peasant",
    "no hood on a townsperson unless said",
  );
  const dyed = lookFor("Mira", index, "female", {
    hairColour: 9,
    skin: 4,
    hair: "none",
    height: 1.1,
    tints: { top: 0x336699 },
    hairTint: 0x00ff88,
    skinTint: 0x9955cc,
  });
  assert.equal(dyed.hairColour, 0x00ff88, "a colour of her own goes over the list's");
  assert.equal(dyed.choices.hairColour, 9);
  assert.equal(lookFor("Mira", index, "female", { hairColour: 9 }).hairColour, HAIR_COLOURS[9][0]);
  assert.deepEqual(dyed.skin, SKIN_TONES[4][0]);
  assert.equal(dyed.hair, "none");
  assert.equal(dyed.height, 1.1);
  assert.deepEqual(dyed.tints, { top: 0x336699 });
  assert.equal(dyed.skinTint, 0x9955cc);
  // Any piece can be left off: the body shows there, and no outfit's colour is asked for it.
  for (const sex of ["male", "female"]) {
    for (const [piece] of PIECES) assert.ok(kitFiles.has(`${sex}-none-${piece}.json`), `the bare ${sex} ${piece}`);
    const bare = lookFor("Rook", index, sex, { top: "none", arms: "none", legs: "none", feet: "none" });
    assert.deepEqual(
      bare.parts,
      PIECES.map(([piece]) => `${sex}-none-${piece}`),
    );
    assert.deepEqual(bare.worn, [], "nothing worn, so no cloth to choose");
    const half = lookFor("Rook", index, sex, { outfit: "ranger", top: "none" });
    assert.deepEqual(half.worn, ["ranger"]);
    assert.equal(half.choices.hood, false, "no hood without the ranger's top, unless said");
    for (const chosen of [
      { top: "none" },
      { top: "none", arms: "none", legs: "none", feet: "none", skinTint: 0x44aa66 },
      { feet: "none", outfit: "ranger" },
    ]) {
      const person = await createPerson("Rook", sex, chosen);
      person.update(0.1, 0, {});
      person.dispose();
    }
  }
  assert.equal(checkLook({ top: "none", legs: "nothing" }).top, "none");
  // Cropped hair is cut for each body's own head.
  for (const sex of ["male", "female"]) {
    const cropped = await createPerson("Rook", sex, {
      hair: "cropped",
      skinTint: 0xcc3333,
      tints: { top: 0x2255aa, legs: 0xaa8822, hood: 0x111111 },
      hood: true,
    });
    cropped.update(0.1, 0, {});
    cropped.dispose();
  }
  assert.equal(lookFor("Tam", index, "male", { beard: true }).beard, true);
  assert.equal(lookFor("Tam", index, "female", { beard: true }).beard, false, "a beard is a man's");
  // Every mix of pieces, with and without the hood and pauldrons, loads and stands, for both bodies.
  const kinds = Object.keys(OUTFITS);
  let built = 0;
  for (const sex of ["male", "female"]) {
    for (let mix = 0; mix < kinds.length ** PIECES.length; mix++) {
      const chosen = { hood: mix % 2 === 0, pauldrons: mix % 3 === 0, hair: mix % 5 === 0 ? "none" : "long" };
      PIECES.forEach(([piece], at) => (chosen[piece] = kinds[Math.floor(mix / kinds.length ** at) % kinds.length]));
      if (mix % 4 === 0) chosen.tints = { top: 0x8844aa, feet: 0x224466 };
      const person = await createPerson("Rook", sex, chosen);
      person.update(0.1, 0, {});
      let meshes = 0;
      person.object.traverse((object) => object.isSkinnedMesh && meshes++);
      assert.ok(meshes >= 5, `a ${sex} in ${JSON.stringify(chosen)} is dressed (${meshes} meshes)`);
      person.dispose();
      built++;
    }
  }
  assert.equal(built, 32);
  // What's saved is only what's on the menus.
  assert.deepEqual(
    checkLook({
      outfit: "ranger",
      colour: "clothes-red",
      hair: "mohawk",
      skin: 99,
      beard: "yes",
      height: 5,
      top: "toga",
      legs: "peasant",
      hood: false,
      tints: { top: 0x112233, hat: 5, legs: -1 },
      hairTint: -4,
      skinTint: 0xff0000,
    }),
    {
      outfit: "ranger",
      legs: "peasant",
      hood: false,
      colour: "clothes-red",
      tints: { top: 0x112233 },
      skinTint: 0xff0000,
      height: 1.12,
    },
  );
  assert.deepEqual(
    checkLook({ colour: "ranger-wine" }),
    { rangerColour: "ranger-wine" },
    "an older look's ranger colour is kept as that",
  );
  assert.deepEqual(
    checkLook({ tint: 0x445566 }).tints,
    { top: 0x445566, arms: 0x445566, legs: 0x445566, feet: 0x445566, hood: 0x445566, pauldrons: 0x445566 },
    "an older look's one tint is on every piece",
  );
  assert.equal(checkLook({ hair: "buzzedfemale" }).hair, "cropped", "an older look's cropped hair");
  assert.deepEqual(checkLook("ranger"), {});
  assert.deepEqual(checkLook({ hairColour: 3, skin: 0, beard: false, hair: "long", hairTint: 0xabcdef }), {
    hair: "long",
    hairColour: 3,
    hairTint: 0xabcdef,
    skin: 0,
    beard: false,
  });
  // The kit says how light each piece and each skin is, for colours of one's own.
  for (const sex of ["male", "female"]) {
    for (const name of [`skin-${sex}`, `head-${sex}`]) {
      assert.ok(index.tones[name] > 15 && index.tones[name] < 256, `${name}'s tone`);
      assert.ok(kitFiles.has(`plain-${name}.webp`), `the plain ${name}`);
    }
    for (const outfit of kinds) {
      assert.ok(kitFiles.has(`plain-${outfit}.webp`));
      for (const [piece] of PIECES)
        assert.ok(index.tones[`${sex}-${outfit}-${piece}`] > 15, `${sex} ${outfit} ${piece}'s tone`);
    }
  }
  assert.equal(Object.keys(COLOUR_FIELD).join(), kinds.join(), "every outfit has a field for its colour");
}

console.log("wanderworld people regression: OK");
