// 3D Avatar Maker (packages/3d-avatar-maker): avatars built in Node from the kit files on disk (pictures
// stubbed), and saved as .glb files that are then read back. Checks that the kit has what the lists offer,
// that a built figure stands on the floor on a full humanoid skeleton, that a saved file holds only what is
// drawn, names its bones as Marinara Engine's 3D Avatars agent reads them, needs no glTF extension the
// Engine refuses, and gives back the look it was made from.
// Run: node tests/3d-avatar-maker.regression.mjs
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Box3 } from "three";

const kitRoot = join(dirname(fileURLToPath(import.meta.url)), "../packages/3d-avatar-maker/kit");
globalThis.fetch = async (url) => {
  const name = String(url).split("/kit/")[1]?.split("?")[0];
  try {
    return new Response(await readFile(join(kitRoot, name)), { status: 200 });
  } catch {
    return new Response("missing", { status: 404 });
  }
};
// A picture that "loads" at once, two pixels square: nothing here draws one.
const image = () => ({
  width: 2,
  height: 2,
  complete: true,
  style: {},
  setAttribute() {},
  removeEventListener() {},
  addEventListener(type, heard) {
    if (type === "load") queueMicrotask(() => heard.call(this));
  },
});
globalThis.document = { createElementNS: image, createElement: image };
// three's exporter reads its finished file through a FileReader, which Node doesn't have.
globalThis.FileReader ??= class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buffer) => {
      this.result = buffer;
      this.onloadend?.();
    });
  }
};

const { avatarChoices, createAvatar } = await import("../packages/3d-avatar-maker/src/avatar.js");
const { exportGlb, lookInGlb, readGlb, slimGeometry, writeGlb } =
  await import("../packages/3d-avatar-maker/src/exporter.js");
const { relaxedPose, restPose, tPose } = await import("../packages/3d-avatar-maker/src/figure.js");
const { HUMANOID_BONES, setKitBase } = await import("../packages/3d-avatar-maker/src/kitfiles.js");
const looks = await import("../packages/3d-avatar-maker/src/looks.js");
const { checkLook, CLOTHES, HAIRSTYLES, NEUTRAL_LOOK, OUTFIT_PRESETS, outfitLook, RACES, racePreset } = looks;
setKitBase("http://kit.test/kit/");

// The bones the Engine's avatar poses turn; it refuses a model without the first seven
// (Marinara Engine, packages/shared/src/utils/avatar-humanoid-bones.ts, AVATAR_REQUIRED_HUMANOID_BONES).
const ENGINE_REQUIRED = ["hips", "spine", "head", "leftUpperArm", "leftLowerArm", "rightUpperArm", "rightLowerArm"];
const VRM_REQUIRED = [
  ...ENGINE_REQUIRED,
  ...[
    "leftHand",
    "rightHand",
    "leftUpperLeg",
    "leftLowerLeg",
    "leftFoot",
    "rightUpperLeg",
    "rightLowerLeg",
    "rightFoot",
  ],
];

// ── The kit has what the lists offer, for both bodies ───────────────────────
for (const body of ["male", "female"]) {
  const choices = await avatarChoices(body);
  assert.ok(choices.hair.length >= 10, `${body}: at least ten hair styles (${choices.hair.length})`);
  assert.ok(choices.clothes.length >= 40, `${body}: at least forty clothing pieces (${choices.clothes.length})`);
  assert.deepEqual(
    choices.races,
    RACES.map(([race]) => race),
    `${body}: every race`,
  );
  for (const style of choices.hair)
    assert.ok(
      HAIRSTYLES.some(([known]) => known === style),
      `${body}: hair ${style} has a name`,
    );
  for (const { piece } of choices.clothes)
    assert.ok(
      CLOTHES.some(([known]) => known === piece),
      `${body}: ${piece} has a name`,
    );
  assert.ok(
    choices.brows.length && choices.lashes.length && choices.bottoms.length,
    `${body}: brows, lashes, underwear`,
  );
  // Every skin the body offers has its picture in the kit, at every age.
  const { access } = await import("node:fs/promises");
  for (const [skin] of looks.skinsFor(body))
    for (const [age] of looks.AGES) {
      const picture = looks.skinPicture(skin, body, age);
      if (picture) await access(join(kitRoot, "avatar", `${picture}.webp`));
    }
  // Every face and body slider the lists offer has its shape key on this body.
  for (const [slider] of [...looks.FACE_DETAIL, ...looks.BODY_DETAIL].filter(
    ([, , , , , , group]) => group !== "bust" || body === "female",
  ))
    assert.ok(looks.hasSlider(slider, choices.keys, body), `${body}: has the ${slider} slider`);
}
// A community skin only one body has opens on the other as MakeHuman's light skin.
{
  const { avatarLook } = await import("../packages/3d-avatar-maker/src/avatar.js");
  assert.equal(avatarLook("a", "auto", { body: "female", skin: "redhead" }).skin, "redhead");
  assert.equal(avatarLook("a", "auto", { body: "male", skin: "redhead" }).skin, "caucasian");
  assert.equal(looks.skinPicture("freckles", "male", "old"), "avatar-male-skin-freckles");
  assert.equal(looks.skinPicture("asian", "male", "old"), "avatar-male-skin-old-asian");
}

// ── Each body has its paint mask: the lips in green (scripts/build-3d-avatar-maker-masks.mjs) ──
{
  const { inflateSync } = await import("node:zlib");
  for (const body of ["male", "female"]) {
    const png = await readFile(join(kitRoot, `avatar/avatar-${body}-masks.png`));
    const width = png.readUInt32BE(16);
    assert.equal(width, 2048, `${body}: masks are 2048 across, the size the skin is painted at`);
    let at = 8;
    const data = [];
    while (at < png.length) {
      const length = png.readUInt32BE(at);
      if (png.toString("latin1", at + 4, at + 8) === "IDAT") data.push(png.subarray(at + 8, at + 8 + length));
      at += 12 + length;
    }
    const rows = inflateSync(Buffer.concat(data));
    let lips = 0;
    for (let y = 0; y < width; y++)
      for (let x = 0; x < width; x++) {
        const i = y * (width * 3 + 1) + 1 + x * 3;
        if (rows[i + 1] > 128) lips++;
      }
    assert.ok(lips > 1000, `${body}: the mask has the lips (${lips} texels)`);
  }
  const { canPaint } = await import("../packages/3d-avatar-maker/src/skin.js");
  assert.equal(canPaint(), false, "in Node there's no canvas, so the builder colours by vertex");
}

// ── A figure stands on the floor, on a full humanoid skeleton, in each pose ──
const startOf = (body, over = {}) => checkLook({ ...NEUTRAL_LOOK, body, ...over });
const knight = outfitLook(
  OUTFIT_PRESETS.find((preset) => preset.name === "Knight"),
  "male",
);
const made = {
  plain: await createAvatar(startOf("female"), "Test", "auto"),
  dwarf: await createAvatar(startOf("male", { ...racePreset("dwarf", "male"), ...knight }), "Test", "auto"),
  // (A look saved before races were presets: it names the race only, and still opens as that race.)
  olderDwarf: await createAvatar(
    checkLook({ body: "male", race: "dwarf", height: 1, limbs: { legs: 1, arms: 1, head: 1 } }),
    "Test",
    "auto",
  ),
  tall: await createAvatar(startOf("female", { height: 1.12, limbs: { legs: 1.15 }, hair: "long" }), "Test", "auto"),
};
for (const [name, figure] of Object.entries(made)) {
  for (const bone of VRM_REQUIRED) assert.ok(figure.humanoid[bone], `${name}: has its ${bone} bone`);
  assert.ok(figure.meshes.length >= 1 && figure.meshes.every((mesh) => mesh.isSkinnedMesh), `${name}: skinned meshes`);
  const box = new Box3().setFromObject(figure.object);
  assert.ok(Math.abs(box.min.y) < 0.01, `${name}: stands on the floor (lowest point ${box.min.y.toFixed(3)})`);
  const head = figure.humanoid.head.getWorldPosition(box.min.clone()).y;
  assert.ok(head > 0.6 && head < 2.2, `${name}: its head is at a person's height (${head.toFixed(2)} m)`);
  // The T-pose has the arms level; the relaxed pose has the hands below the shoulders; rest puts it back.
  const armDrop = () => {
    const shoulder = figure.humanoid.leftUpperArm.getWorldPosition(box.min.clone());
    const hand = figure.humanoid.leftHand.getWorldPosition(box.max.clone());
    return shoulder.y - hand.y;
  };
  restPose(figure);
  const atRest = armDrop();
  tPose(figure);
  assert.ok(Math.abs(armDrop()) < 0.01, `${name}: arms level in the T-pose (${armDrop().toFixed(3)})`);
  relaxedPose(figure, 0);
  assert.ok(armDrop() > atRest, `${name}: arms lower in the relaxed pose than at rest`);
  restPose(figure);
  assert.ok(Math.abs(armDrop() - atRest) < 1e-6, `${name}: rest puts the arms back`);
}
assert.ok(made.dwarf.meshes.length > made.plain.meshes.length, "armour adds meshes");
{
  // A race is a preset: its slider, its sizes and its usual extras, all ordinary look fields.
  const dwarf = racePreset("dwarf", "male");
  assert.equal(dwarf.shape.race_dwarf, 1);
  assert.equal(dwarf.shape.race_elf, 0);
  assert.equal(dwarf.facialHair, "beard-02");
  assert.ok(dwarf.height < 0.9 && dwarf.limbs.legs < 0.75, "a dwarf preset is short and short-legged");
  assert.deepEqual(checkLook(dwarf).shape.race_dwarf, 1, "its slider survives checking");
  assert.equal(racePreset("halfelf").shape.race_elf, 0.5, "a half-elf is half an elf");
  const tiefling = racePreset("tiefling");
  assert.ok(
    tiefling.tail && tiefling.horns !== "none" && tiefling.skin === "custom",
    "a tiefling preset brings horns, a tail and a skin",
  );
  assert.equal(made.olderDwarf.avatar.shape.race_dwarf, 1, "an older dwarf look gets its race slider");
  assert.ok(Math.abs(made.olderDwarf.avatar.limbs.legs - 0.7) < 1e-6, "and its sizes, as before");
}
const headOf = (figure) => figure.humanoid.head.getWorldPosition(new Box3().min).y;
assert.ok(
  headOf(made.dwarf) < headOf(made.plain) && headOf(made.tall) > headOf(made.plain),
  "a dwarf is shorter, long legs taller",
);

// ── A slimmed geometry keeps only what's drawn ──────────────────────────────
{
  const body = made.plain.meshes[0];
  const ranges = body.geometry.groups.map(({ start, count, materialIndex }) => ({ start, count, materialIndex }));
  const slim = slimGeometry(body.geometry, ranges);
  assert.ok(slim.vertices < body.geometry.attributes.position.count, "fewer vertices than the kit's whole body");
  assert.equal(slim.geometry.attributes.position.count, slim.vertices);
  assert.equal(slim.geometry.index.count, slim.triangles * 3);
  let highest = 0;
  for (const vertex of slim.geometry.index.array) highest = Math.max(highest, vertex);
  assert.equal(highest, slim.vertices - 1, "every vertex kept is drawn");
  for (const name of ["normal", "uv", "color", "skinIndex", "skinWeight"])
    assert.equal(slim.geometry.attributes[name].count, slim.vertices, `${name} was slimmed with the positions`);
  assert.equal(
    slim.geometry.groups.length,
    ranges.filter((range) => range.count).length,
    "a group for each material drawn",
  );
}

// ── A saved file: what the Engine's importer reads, and the look back out ────
for (const [name, figure] of Object.entries(made)) {
  for (const mesh of figure.meshes) for (const material of [mesh.material].flat()) material.map = null; // (no pictures in Node)
  const before = figure.meshes.map((mesh) => mesh.geometry);
  const look = startOf("female", { hair: "bob", hairTint: 0x123456 });
  const saved = await exportGlb(figure, { look, name: `Saved ${name}` });
  assert.deepEqual(
    figure.meshes.map((mesh) => mesh.geometry),
    before,
    `${name}: the figure is as it was after saving`,
  );
  const { json, bin } = readGlb(saved.bytes);
  assert.ok(bin?.byteLength > 1000, `${name}: the file has its data`);
  // Refused by the Engine: Draco, required meshopt, required KTX2, and files outside the file.
  const refused = [
    "KHR_draco_mesh_compression",
    "EXT_meshopt_compression",
    "KHR_meshopt_compression",
    "KHR_texture_basisu",
  ];
  for (const extension of [...(json.extensionsUsed ?? []), ...(json.extensionsRequired ?? [])])
    assert.ok(!refused.includes(extension), `${name}: doesn't use ${extension}`);
  assert.ok(!json.extensions?.VRM && !json.extensions?.VRMC_vrm, `${name}: a plain GLB, not a VRM`);
  for (const buffer of json.buffers) assert.equal(buffer.uri, undefined, `${name}: nothing outside the file`);
  assert.ok(json.scenes?.[json.scene ?? 0], `${name}: has a scene`);
  // The Engine reads a skinned model's bones from its skins' joints, by name.
  const joints = new Set(json.skins.flatMap((skin) => skin.joints).map((index) => json.nodes[index].name));
  for (const bone of VRM_REQUIRED)
    assert.ok(joints.has(HUMANOID_BONES[bone]), `${name}: the file has the ${bone} bone`);
  assert.equal(json.meshes.length, figure.meshes.length, `${name}: every mesh is in the file`);
  for (const mesh of json.meshes)
    for (const primitive of mesh.primitives) {
      for (const attribute of ["POSITION", "NORMAL", "JOINTS_0", "WEIGHTS_0"])
        assert.ok(attribute in primitive.attributes, `${name}: ${mesh.name ?? "a mesh"} has ${attribute}`);
      assert.ok(json.accessors[primitive.indices].count > 0, `${name}: a drawn primitive`);
    }
  assert.equal(json.asset.generator, "3D Avatar Maker (Marinara Engine)");
  assert.match(json.asset.copyright, /CC0/u, `${name}: the file says its parts are CC0`);
  assert.deepEqual(lookInGlb(saved.bytes), { name: `Saved ${name}`, look }, `${name}: the look comes back out`);
  assert.ok(saved.vertices > 1000 && saved.triangles > 1000, `${name}: counts its points and triangles`);
  // Written again from its two parts, it reads the same.
  assert.deepEqual(readGlb(writeGlb(json, bin)).json, json, `${name}: a file written again reads the same`);
}
assert.equal(lookInGlb(new Uint8Array([1, 2, 3])), null, "a file that isn't a GLB has no look");
assert.equal(lookInGlb(writeGlb({ asset: { version: "2.0" } })), null, "a GLB from elsewhere has no look");
assert.throws(() => readGlb(new Uint8Array(30)), /isn't a \.glb/u);

for (const figure of Object.values(made)) figure.dispose();

// ── Wardrobe packs: an installed pack's index read as untrusted data (packs.js) ──
{
  const { BODY_REVISION, loadPacks, readPack } = await import("../packages/3d-avatar-maker/src/packs.js");
  const { LICENCE_NOTE, licenceNote } = await import("../packages/3d-avatar-maker/src/exporter.js");
  assert.deepEqual(await loadPacks(), [], "with no Engine to list the installed packages, there are no packs");
  const installed = {
    id: "3d-avatar-maker-wardrobe-test",
    version: "0.1.00",
    status: "active",
    manifest: { contributions: { assets: { paths: ["avatar-pack.json", "wardrobe/body.pack.png"] } } },
  };
  const good = {
    label: "Halter dress",
    slot: "body",
    bodies: ["female"],
    layer: 1,
    hides: ["torso", "hips"],
    parts: { female: [["cloth", 0xb8a888]] },
    variants: [],
    bundle: "wardrobe/body.pack.png",
    licence: "CC0-1.0",
    author: "MargaretToigo",
    source: "http://example.test/",
    credit: null,
  };
  const index = {
    format: 1,
    for: "3d-avatar-maker",
    body: BODY_REVISION,
    maker: "0.1.03",
    name: "Test Clothes",
    pieces: {
      test_good: good,
      test_cc_by: { ...good, licence: "CC-BY-4.0", credit: "Test dress by Someone, CC BY 4.0" },
      test_slot: { ...good, slot: "tail" },
      test_nail_slot: { ...good, slot: "nails" },
      test_part: { ...good, parts: { female: [["chrome", 0xffffff]] } },
      test_colour: { ...good, parts: { female: [["cloth", "#ffffff"]] } },
      test_hide: { ...good, hides: ["soul"] },
      test_body: { ...good, bodies: ["wolf"] },
      "Test-Bad": good,
      constructor: good,
      dress: good, // (the kit's own)
      test_bundle: { ...good, bundle: "wardrobe/legs.pack.png" }, // (not among the pack's assets)
      test_escape: { ...good, bundle: "../3d-avatar-maker/kit/wardrobe/avatar-outfits-body.pack.png" },
      test_no_credit: { ...good, licence: "CC-BY-4.0" },
      test_licence: { ...good, licence: "GPL-3.0" },
      test_label: { ...good, label: "x".repeat(200) },
    },
  };
  assert.deepEqual(readPack(installed, { ...index, body: BODY_REVISION + 1 }), [], "made for another body: skipped");
  assert.deepEqual(readPack(installed, { ...index, for: "wanderworld" }), [], "an index for something else");
  assert.deepEqual(readPack({ ...installed, status: "disabled" }, index), [], "a pack that isn't active");
  assert.deepEqual(readPack({ ...installed, id: "someone-else-wardrobe" }, index), [], "a package that isn't a pack");
  const read = readPack(installed, index);
  assert.deepEqual(
    read.map(({ piece }) => piece),
    ["test_good", "test_cc_by"],
    "only the well-formed pieces are kept",
  );
  assert.equal(
    read[0].url,
    "/api/capability-packages/3d-avatar-maker-wardrobe-test/assets/wardrobe/body.pack.png?v=0.1.00",
  );
  assert.deepEqual(read[0].parts, { female: [["cloth", 0xb8a888]] });
  looks.addPieces(read);
  assert.deepEqual(readPack(installed, index), [], "a piece id an earlier pack took is left out");
  const worn = checkLook({
    body: "female",
    clothes: ["test_good", "boots"],
    clothColours: { test_good: { cloth: 1 } },
  });
  assert.deepEqual(worn.clothes, ["test_good", "boots"], "checkLook keeps a pack's piece");
  assert.deepEqual(worn.clothColours, { test_good: { cloth: 1 } }, "and its colours");
  assert.ok(
    (await avatarChoices("female")).clothes.some(({ piece, slot }) => piece === "test_good" && slot === "body"),
    "the Clothes tab offers it on its body",
  );
  assert.ok(!(await avatarChoices("male")).clothes.some(({ piece }) => piece === "test_good"), "and not on the other");
  assert.equal(licenceNote({ clothes: ["test_good"] }), LICENCE_NOTE, "a CC0 piece adds no credit");
  assert.match(licenceNote({ clothes: ["test_cc_by", "boots"] }), /CC0.*Test dress by Someone, CC BY 4\.0$/u);
}
console.log("3d-avatar-maker.regression: ok");
