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
const packagesRoot = join(kitRoot, "../..");
/** A test pack's assets, made below: "<pack id>/<path>" → bytes. */
const served = new Map();
globalThis.fetch = async (url) => {
  // (A wardrobe pack's asset, as the Engine serves an installed package's: from its folder in the repo.)
  const asset = /\/api\/capability-packages\/([a-z0-9-]+)\/assets\/([^?]+)/u.exec(String(url));
  const name = String(url).split("/kit/")[1]?.split("?")[0];
  try {
    if (asset && served.has(`${asset[1]}/${asset[2]}`))
      return new Response(served.get(`${asset[1]}/${asset[2]}`), { status: 200 });
    if (asset) return new Response(await readFile(join(packagesRoot, asset[1], asset[2])), { status: 200 });
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

// ── A saved VRM: what three-vrm (and so the Engine's VRM model) reads, resting in a T-pose ──
{
  const { exportVrm, VRM_LICENSE_URL, vrmMeta, vrmTerms } = await import("../packages/3d-avatar-maker/src/exporter.js");
  const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
  const { VRMLoaderPlugin } = await import("@pixiv/three-vrm");
  const { Object3D, Vector3 } = await import("three");
  const { FACE_MOVES } = await import("../packages/3d-avatar-maker/src/face.js");
  const tiefling = await createAvatar(startOf("female", racePreset("tiefling", "female")), "Test", "auto");
  const longHair = await createAvatar(startOf("female", { hair: "long" }), "Test", "auto");
  for (const one of [tiefling, longHair])
    for (const mesh of one.meshes) for (const material of [mesh.material].flat()) material.map = null;
  for (const [name, figure] of Object.entries({ plain: made.plain, dwarf: made.dwarf, tiefling, longHair })) {
    const look = startOf("female", { hair: "bob" });
    const geometries = figure.meshes.map((mesh) => mesh.geometry);
    const inverses = figure.meshes.map((mesh) => mesh.skeleton.boneInverses.map((inverse) => inverse.clone()));
    const saved = await exportVrm(figure, { look, name: `Saved ${name}`, terms: { author: "Tester" } });
    assert.deepEqual(
      figure.meshes.map((mesh) => mesh.geometry),
      geometries,
      `${name}: the figure keeps its geometry`,
    );
    figure.meshes.forEach((mesh, i) =>
      mesh.skeleton.boneInverses.forEach((inverse, b) =>
        assert.ok(inverse.equals(inverses[i][b]), `${name}: its bones are bound as before`),
      ),
    );
    for (const [bone, turn] of figure.rest)
      assert.ok(figure.bones.get(bone).quaternion.equals(turn), `${name}: at rest`);
    const { json } = readGlb(saved.bytes);
    const block = json.extensions?.VRMC_vrm;
    assert.equal(block?.specVersion, "1.0", `${name}: a VRM 1.0`);
    assert.ok(json.extensionsUsed.includes("VRMC_vrm"));
    for (const bone of VRM_REQUIRED)
      assert.equal(
        json.nodes[block.humanoid.humanBones[bone]?.node]?.name,
        HUMANOID_BONES[bone],
        `${name}: names its ${bone} bone`,
      );
    assert.deepEqual(block.meta.authors, ["Tester"]);
    assert.equal(block.meta.licenseUrl, VRM_LICENSE_URL);
    assert.equal(block.meta.name, `Saved ${name}`);
    assert.equal(
      Boolean(json.extensions.VRMC_springBone),
      figure.springs.length > 0,
      `${name}: springs only for hair that hangs or a tail`,
    );
    assert.equal(
      name === "tiefling",
      figure.springs.some((spring) => spring.name === "Tail"),
      `${name}: a tail swings`,
    );
    if (name === "longHair" || name === "dwarf")
      assert.equal(
        name === "longHair",
        figure.springs.some((spring) => spring.name.startsWith("Hair")),
        `${name}: long hair swings (a helm hides the dwarf's)`,
      );
    assert.deepEqual(lookInGlb(saved.bytes), { name: `Saved ${name}`, look }, `${name}: the look comes back out`);

    // Loaded with three-vrm as the Engine loads a VRM model.
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));
    const bytes = saved.bytes;
    const gltf = await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), "");
    const vrm = gltf.userData.vrm;
    assert.ok(vrm?.humanoid, `${name}: three-vrm reads it as a VRM`);
    assert.equal(vrm.meta.metaVersion, "1");
    vrm.scene.updateMatrixWorld(true);
    const at = (bone) => vrm.humanoid.getRawBoneNode(bone).getWorldPosition(new Vector3());
    assert.ok(Math.abs(at("leftUpperArm").y - at("leftHand").y) < 0.01, `${name}: rests with its arms level`);
    assert.ok(at("leftHand").x > at("leftUpperArm").x + 0.3, `${name}: its left arm out to +X`);
    assert.ok(at("leftToes").z > at("leftFoot").z, `${name}: it faces +Z, as VRM 1.0 asks`);
    // Bound in that pose: every point drawn where the file lists it.
    let furthest = 0;
    const point = new Vector3();
    vrm.scene.traverse((object) => {
      if (!object.isSkinnedMesh) return;
      const position = object.geometry.attributes.position;
      for (let i = 0; i < position.count; i += 97) {
        const listed = point.fromBufferAttribute(position, i).clone().applyMatrix4(object.matrixWorld);
        object.applyBoneTransform(i, point.fromBufferAttribute(position, i));
        furthest = Math.max(furthest, point.applyMatrix4(object.matrixWorld).distanceTo(listed));
      }
    });
    assert.ok(furthest < 0.001, `${name}: its bind pose is its rest pose (off by ${furthest.toFixed(5)})`);
    // Each spring's joints swing in three-vrm, and keep their shape at rest: no collider pushes them.
    const joints = [...(vrm.springBoneManager?.joints ?? [])];
    assert.equal(
      joints.length,
      figure.springs.reduce((total, spring) => total + spring.bones.length - 1, 0),
      `${name}: every segment of its springs swings`,
    );
    if (name === "tiefling")
      assert.equal(joints.filter((joint) => joint.bone.name.startsWith("tail_")).length, 4, "the tail's four segments");
    if (joints.length) {
      const ends = figure.springs.map((spring) => gltf.scene.getObjectByName(spring.bones.at(-1).name));
      const start = ends.map((end) => end.getWorldPosition(new Vector3()));
      for (let i = 0; i < 120; i++) vrm.update(1 / 60);
      const moved = Math.max(...ends.map((end, i) => end.getWorldPosition(new Vector3()).distanceTo(start[i])));
      assert.ok(
        moved < (name === "tiefling" ? 0.1 : 0.03),
        `${name}: its springs keep their shape at rest (${moved.toFixed(3)} m)`,
      );
    }
    // The face: VRM's expressions bound to its keys, and the eyes on their bones, turned to look.
    for (const key of FACE_MOVES)
      assert.ok(
        vrm.expressionManager.getExpression(key)?.binds.length,
        `${name}: the ${key} expression moves the face`,
      );
    assert.equal(block.lookAt?.type, "bone", `${name}: looks with its eye bones`);
    const eye = vrm.humanoid.getRawBoneNode("leftEye");
    assert.equal(eye?.name, "eye_l", `${name}: names its left eye`);
    const ahead = eye.quaternion.clone();
    const target = new Object3D();
    target.position.set(1, at("head").y, 1);
    vrm.scene.add(target);
    vrm.lookAt.target = target;
    vrm.lookAt.autoUpdate = true;
    vrm.update(1 / 60);
    const turned = eye.quaternion.angleTo(ahead);
    assert.ok(turned > 0.05 && turned < 0.5, `${name}: its eyes turn to look aside (${turned.toFixed(2)} rad)`);
  }
  tiefling.dispose();
  longHair.dispose();

  // ── Face movement in the maker: the keys live on the body, the eyes on bones of their own (face.js) ──
  {
    const { animateFace, blinkAt, lookTowards, setFace, talkingAt } =
      await import("../packages/3d-avatar-maker/src/face.js");
    const figure = await createAvatar(startOf("female"), "Test", "auto");
    for (const mesh of figure.meshes) for (const material of [mesh.material].flat()) material.map = null;
    const body = figure.meshes.find((mesh) => mesh.morphTargetDictionary);
    for (const key of FACE_MOVES) assert.ok(key in (body?.morphTargetDictionary ?? {}), `the body has the ${key} key`);
    // Each key moves the face alone: nothing below the chin, and the blink near the eyes, the mouth below them.
    const headAt = figure.humanoid.head.getWorldPosition(new Vector3()).y;
    const eyeAt = figure.bones.get("eye_l").getWorldPosition(new Vector3()).y;
    // (What's drawn: a race's part that isn't worn is tucked inside the head, still keyed but drawn by nothing.)
    const drawn = new Set(body.geometry.index.array);
    const reach = (key) => {
      const moves = body.geometry.morphAttributes.position[body.morphTargetDictionary[key]].array;
      const position = body.geometry.attributes.position.array;
      let [most, low, high] = [0, Infinity, -Infinity];
      for (let v = 0; v < moves.length; v += 3) {
        if (!drawn.has(v / 3)) continue;
        const size = Math.hypot(moves[v], moves[v + 1], moves[v + 2]);
        if (size < 0.0005) continue;
        most = Math.max(most, size);
        [low, high] = [Math.min(low, position[v + 1]), Math.max(high, position[v + 1])];
      }
      return { most, low: low + figure.root.position.y, high: high + figure.root.position.y };
    };
    const blink = reach("blink");
    const aa = reach("aa");
    assert.ok(
      blink.most > 0.005 && blink.low > eyeAt - 0.03 && blink.high < eyeAt + 0.03,
      `the blink moves the lids (${JSON.stringify(blink)}, eyes at ${eyeAt})`,
    );
    assert.ok(
      aa.most > 0.01 && aa.high < eyeAt && aa.low > headAt - 0.15,
      `the mouth opens below the eyes (${JSON.stringify(aa)}, head at ${headAt})`,
    );
    setFace(figure, { happy: 1 });
    assert.equal(body.morphTargetInfluences[body.morphTargetDictionary.happy], 1);
    assert.equal(body.morphTargetInfluences[body.morphTargetDictionary.aa], 0);
    // The eyes turn towards a point, no further than VRM apps turn them, and back.
    const eye = figure.bones.get("eye_l");
    const rest = eye.quaternion.clone();
    lookTowards(figure, new Vector3(2, eyeAt, 1));
    const turned = eye.quaternion.angleTo(rest);
    assert.ok(turned > 0.2 && turned < 0.4, `the eyes look aside (${turned.toFixed(2)} rad)`);
    lookTowards(figure, null);
    assert.ok(eye.quaternion.equals(rest), "and back ahead");
    animateFace(figure, "talking", 0.3, new Vector3(0, eyeAt, 2));
    assert.ok(blinkAt(0.1) > 0.5 && blinkAt(1) === 0, "a blink comes at the start and is over");
    assert.ok(
      Object.values(talkingAt(0.3)).some((weight) => weight > 0),
      "talking opens the mouth",
    );
    // A saved file has the keys at rest, named as the 3D Avatars agent and VRM apps look for them.
    setFace(figure, { happy: 1 });
    const { json } = readGlb((await exportGlb(figure, { look: {} })).bytes);
    const saved = json.meshes.find((mesh) => mesh.extras?.targetNames?.includes("blink"));
    assert.deepEqual(
      FACE_MOVES.filter((key) => saved?.extras.targetNames.includes(key)),
      FACE_MOVES,
      "a GLB carries every face key",
    );
    assert.ok(
      saved.weights.every((weight) => weight === 0),
      "at rest",
    );
    assert.equal(body.morphTargetInfluences[body.morphTargetDictionary.happy], 1, "the preview's face comes back");
    // The eye bones move with the sliders that move the eyes, and grow with the head.
    const eyeOf = async (over) => {
      const one = await createAvatar(startOf("female", over), "Test", "auto");
      const at = one.bones.get("eye_l").getWorldPosition(new Vector3());
      const head = one.humanoid.head.getWorldPosition(new Vector3());
      one.dispose();
      return at.sub(head);
    };
    const usual = await eyeOf({});
    assert.ok(
      (await eyeOf({ shape: { eye_height: 1 } })).y > usual.y + 0.001,
      "a higher eye slider lifts the eye bone",
    );
    const big = await eyeOf({ limbs: { head: 1.2 } });
    assert.ok(Math.abs(big.length() / usual.length() - 1.2) < 0.02, "a bigger head takes its eyes out with it");
    figure.dispose();
  }

  // ── Hair movement: chains through the hanging locks, springs, colliders (hair.js, springs.js) ──
  {
    const { SWINGING_HAIR } = await import("../packages/3d-avatar-maker/src/hair.js");
    const { createSprings } = await import("../packages/3d-avatar-maker/src/springs.js");
    const { movingPose } = await import("../packages/3d-avatar-maker/src/figure.js");
    const tips = (figure) =>
      figure.springs.flatMap((spring) => spring.bones.slice(1).map((bone) => bone.getWorldPosition(new Vector3())));
    const furthest = (a, b) => Math.max(...a.map((point, i) => point.distanceTo(b[i])));
    for (const body of ["female", "male"]) {
      for (const hair of [...SWINGING_HAIR.keys(), "short"]) {
        const figure = await createAvatar(startOf(body, { hair }), "Test", "auto");
        const label = `${body} ${hair}`;
        if (!SWINGING_HAIR.has(hair)) {
          assert.equal(figure.springs.length, 0, `${label}: a short cut stays as it is`);
          figure.dispose();
          continue;
        }
        assert.ok(figure.springs.length > 0, `${label}: its locks hang on chains`);
        const mesh = figure.meshes.find((one) => one.skeleton.bones.some((bone) => bone.name.startsWith("hair_")));
        // Bound where it rests: every point of the hair drawn where it was made, and its weights whole.
        const { position, skinWeight } = mesh.geometry.attributes;
        let off = 0;
        let unweighted = 0;
        const point = new Vector3();
        for (let i = 0; i < position.count; i++) {
          const listed = point.fromBufferAttribute(position, i).clone().applyMatrix4(mesh.matrixWorld);
          mesh.applyBoneTransform(i, point.fromBufferAttribute(position, i));
          off = Math.max(off, point.applyMatrix4(mesh.matrixWorld).distanceTo(listed));
          const sum = [0, 1, 2, 3].reduce((total, c) => total + skinWeight.getComponent(i, c), 0);
          if (Math.abs(sum - 1) > 1e-4) unweighted++;
        }
        assert.ok(off < 0.001, `${label}: the hair rests where it was made (off by ${off.toFixed(5)})`);
        assert.equal(unweighted, 0, `${label}: every point's weights add up to one`);
        // No collider a spring meets holds one of its joints at rest, as built or in the T-pose.
        for (const pose of [restPose, tPose]) {
          pose(figure);
          for (const spring of figure.springs)
            for (const bone of spring.bones.slice(1))
              for (const collider of spring.colliders) {
                const at = bone.getWorldPosition(new Vector3());
                const start = collider.offset.clone().applyMatrix4(collider.bone.matrixWorld);
                const end = (collider.tail ?? collider.offset).clone().applyMatrix4(collider.bone.matrixWorld);
                const line = end.clone().sub(start);
                const t = line.lengthSq()
                  ? Math.max(0, Math.min(1, at.clone().sub(start).dot(line) / line.lengthSq()))
                  : 0;
                const gap = at.distanceTo(start.addScaledVector(line, t)) - collider.radius - spring.joint.hitRadius;
                assert.ok(gap > 0, `${label}: ${bone.name} rests clear of ${collider.bone.name}'s collider`);
              }
        }
        // Swinging: still at rest, it holds its style; looking about, it swings; standing still again, it settles.
        relaxedPose(figure, 0);
        const springs = createSprings(figure);
        const rest = tips(figure);
        for (let f = 0; f < 120; f++) {
          relaxedPose(figure, 0);
          springs.step(1 / 60);
        }
        assert.ok(furthest(tips(figure), rest) < 0.025, `${label}: holds its style at rest`);
        let swung = 0;
        for (let f = 0; f < 240; f++) {
          movingPose(figure, f / 60);
          springs.step(1 / 60);
          const now = tips(figure);
          const held = figure.springs.map((spring) => spring.bones.map((bone) => bone.quaternion.clone()));
          for (const spring of figure.springs)
            for (const bone of spring.bones) bone.quaternion.copy(figure.rest.get(bone.name));
          figure.root.updateMatrixWorld(true);
          swung = Math.max(swung, furthest(now, tips(figure)));
          figure.springs.forEach((spring, s) => spring.bones.forEach((bone, b) => bone.quaternion.copy(held[s][b])));
          figure.root.updateMatrixWorld(true);
        }
        assert.ok(swung > 0.003, `${label}: swings as the head turns (${(swung * 100).toFixed(1)} cm)`);
        for (let f = 0; f < 120; f++) {
          relaxedPose(figure, 0);
          springs.step(1 / 60);
        }
        assert.ok(furthest(tips(figure), rest) < 0.025, `${label}: and settles`);
        figure.dispose();
      }
    }
    // On a bigger head, the swinging hair rests where its own weights put it, so nothing tears where hair that
    // grew with the head meets hair that didn't.
    {
      const { geometryOf, load } = await import("../packages/3d-avatar-maker/src/kitfiles.js");
      const hairOf = (one) =>
        one.meshes.find((part) => part.skeleton.bones.some((bone) => bone.name.startsWith("hair_")));
      // (The points as the look shaped them, from the same look with the head as built: those rest where they are.)
      const plain = await createAvatar(startOf("female", { hair: "ponytail" }), "Test", "auto");
      const position = hairOf(plain).geometry.attributes.position.clone();
      plain.dispose();
      const figure = await createAvatar(startOf("female", { hair: "ponytail", limbs: { head: 1.2 } }), "Test", "auto");
      const mesh = hairOf(figure);
      // (The style's own weights, before its chains.)
      const made = geometryOf((await load("avatar-hair-long.pack.png")).styles.ponytail.female.meshes[0]);
      const { bones, boneInverses } = mesh.skeleton;
      const { skinIndex, skinWeight } = made.attributes;
      let off = 0;
      const point = new Vector3();
      for (let i = 0; i < position.count; i++) {
        const was = new Vector3();
        for (let c = 0; c < 4; c++) {
          const w = skinWeight.getComponent(i, c);
          const b = skinIndex.getComponent(i, c);
          if (w)
            was.addScaledVector(
              point
                .fromBufferAttribute(position, i)
                .applyMatrix4(mesh.bindMatrix)
                .applyMatrix4(boneInverses[b])
                .applyMatrix4(bones[b].matrixWorld),
              w,
            );
        }
        was.applyMatrix4(mesh.bindMatrixInverse);
        mesh.applyBoneTransform(i, point.fromBufferAttribute(mesh.geometry.attributes.position, i));
        off = Math.max(off, point.distanceTo(was));
      }
      assert.ok(off < 0.0005, `a bigger head's ponytail rests where it did (off by ${off.toFixed(5)})`);
      figure.dispose();
    }
  }

  // The author's terms: VRM's careful defaults, only known values, and the sharing choice split in two.
  assert.deepEqual(vrmTerms({ avatarPermission: "nobody", allowExcessivelySexualUsage: "yes" }), {
    avatarPermission: "onlyAuthor",
    commercialUsage: "personalNonProfit",
    sharing: "none",
    creditNotation: "required",
    allowExcessivelyViolentUsage: false,
    allowExcessivelySexualUsage: false,
    allowPoliticalOrReligiousUsage: false,
    allowAntisocialOrHateUsage: false,
    author: "",
  });
  const open = vrmMeta(
    " ",
    {},
    { sharing: "changeAndShare", creditNotation: "unnecessary", avatarPermission: "everyone" },
  );
  assert.equal(open.name, "Avatar");
  assert.deepEqual(open.authors, ["Unknown"], "a VRM needs an author");
  assert.equal(open.allowRedistribution, true);
  assert.equal(open.modification, "allowModificationRedistribution");
  assert.equal(open.creditNotation, "unnecessary", "a CC0 avatar may ask for no credit");
  assert.equal(vrmMeta("a", {}, { sharing: "change" }).allowRedistribution, false);
}

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
      test_slot: { ...good, slot: "aura" },
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
  // A VRM wearing a CC BY piece asks for credit whatever its author chose, and names the piece's maker.
  const { vrmMeta } = await import("../packages/3d-avatar-maker/src/exporter.js");
  const credited = vrmMeta("a", { clothes: ["test_cc_by"] }, { creditNotation: "unnecessary" });
  assert.equal(credited.creditNotation, "required");
  assert.match(credited.thirdPartyLicenses, /Test dress by Someone, CC BY 4\.0/u);
}

// ── The Accessories pack, as built: its pieces fill the maker's newer slots, and what covers what ──
{
  const { readPack } = await import("../packages/3d-avatar-maker/src/packs.js");
  const id = "3d-avatar-maker-wardrobe-accessories";
  const manifest = JSON.parse(await readFile(join(packagesRoot, id, "manifest.json"), "utf8"));
  const index = JSON.parse(await readFile(join(packagesRoot, id, "avatar-pack.json"), "utf8"));
  const read = readPack({ id, version: manifest.version, status: "active", manifest }, index);
  assert.equal(read.length, Object.keys(index.pieces).length, "every piece of the Accessories pack is accepted");
  for (const each of read)
    assert.equal(Boolean(each.credit), each.licence !== "CC0-1.0", `${each.piece}: a credit exactly when CC BY`);
  looks.addPieces(read);
  const slots = new Set(read.map(({ slot }) => slot));
  for (const slot of ["face", "mouth", "ears", "fingers", "socks", "hands", "head"])
    assert.ok(slots.has(slot), `the pack has something to wear in "${slot}"`);
  // (How many meshes a figure is drawn with: a piece left off under another adds none.)
  const meshes = async (over) => {
    const figure = await createAvatar(startOf("female", { hair: "long", toenails: true, ...over }), "Test", "auto");
    const count = figure.meshes.length;
    figure.dispose();
    return count;
  };
  const bare = await meshes({ clothes: [] });
  const gloves = await meshes({ clothes: ["toigo_gloves_short"] });
  assert.ok((await meshes({ clothes: ["joachip_ring_1"] })) > bare, "a ring is worn");
  assert.equal(await meshes({ clothes: ["toigo_gloves_short", "joachip_ring_1"] }), gloves, "gloves hide the ring");
  assert.equal(
    await meshes({ clothes: ["joepal_crude_low_socks"] }),
    (await meshes({ clothes: [], toenails: false })) + 1,
    "socks are worn, and hide the toenails",
  );
  assert.equal(
    await meshes({ clothes: ["aethelraed_unraed_cloche_hat"] }),
    await meshes({ clothes: ["aethelraed_unraed_cloche_hat"], hair: "none" }),
    "a pack's hat hides the hair",
  );
  assert.ok(
    (await meshes({ clothes: ["spamrakuen_sagerfrogs_glasses_01", "toigo_pearl_earrings"] })) >= bare + 2,
    "glasses and earrings are worn together",
  );
}

// ── The Clothes pack, as built: every piece is accepted, carries its credit, and a saved file names its maker ──
{
  const { readPack } = await import("../packages/3d-avatar-maker/src/packs.js");
  const { licenceNote } = await import("../packages/3d-avatar-maker/src/exporter.js");
  const id = "3d-avatar-maker-wardrobe-clothes";
  const manifest = JSON.parse(await readFile(join(packagesRoot, id, "manifest.json"), "utf8"));
  const index = JSON.parse(await readFile(join(packagesRoot, id, "avatar-pack.json"), "utf8"));
  const read = readPack({ id, version: manifest.version, status: "active", manifest }, index);
  assert.equal(read.length, Object.keys(index.pieces).length, `every piece of ${id} is accepted`);
  for (const each of read)
    assert.equal(Boolean(each.credit), each.licence !== "CC0-1.0", `${each.piece}: a credit exactly when CC BY`);
  looks.addPieces(read);
  // (Worn from the pack's own bundle, as the maker loads it.)
  const count = async (clothes) => {
    const figure = await createAvatar(startOf("female", { clothes }), "Test", "auto");
    const meshes = figure.meshes.length;
    figure.dispose();
    return meshes;
  };
  // A CC BY 4.0 dress, a CC BY 3.0 top and a CC0 dress side by side in one pack.
  for (const piece of ["punkduck_medieval_dress", "punkduck_v_neck_top", "toigo_shift_dress"]) {
    const { author, source, licence } = index.pieces[piece];
    const note = licenceNote({ clothes: [piece] });
    if (licence === "CC0-1.0") assert.ok(!note.includes(author), `a saved ${piece} needs no credit`);
    else assert.ok(note.includes(`by ${author} (${source}), CC BY`), `a saved ${piece} credits its maker`);
    assert.ok((await count([piece])) > (await count([])), `${piece} is worn`);
  }
}

// ── Bone-fixed pieces, a pack's hair styles, and looks that outlast an uninstalled pack ──
{
  const { BODY_REVISION, readHair, readPack } = await import("../packages/3d-avatar-maker/src/packs.js");
  const { exportVrm, licenceNote, vrmMeta } = await import("../packages/3d-avatar-maker/src/exporter.js");
  const { geometryOf, load } = await import("../packages/3d-avatar-maker/src/kitfiles.js");
  const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
  const { VRMLoaderPlugin } = await import("@pixiv/three-vrm");
  const { Matrix4, Vector3 } = await import("three");
  const { boneOf, CLOTH_SLOTS, missingNotes, PIECE_BONES, readDesign, wornLook } = looks;

  // Every bone a piece can be fixed to is a humanoid bone, and in both bodies' skeletons.
  const humanoid = new Set(Object.values(HUMANOID_BONES));
  for (const sex of ["male", "female"]) {
    const body = await load(`avatar-${sex}.pack.png`);
    for (const bone of PIECE_BONES)
      assert.ok(humanoid.has(bone) && body.joints.includes(bone), `${bone}: a ${sex} body bone a saved file names`);
  }
  assert.equal(boneOf("hand_right"), "hand_r", "a right-hand piece is fixed to the right hand");
  assert.equal(boneOf("hand_left"), "hand_l");
  assert.equal(boneOf("horns"), "Head", "horns to the head");
  assert.equal(boneOf("wrists"), null, "a bracelet bends with the skin unless its pack says otherwise");
  assert.equal(boneOf("on_back", "spine_03"), "spine_03", "a piece's own bone");
  assert.equal(boneOf("hip", "eye_l"), null, "but only one of PIECE_BONES");

  // A test pack made from the kit's own files, served as an installed pack's assets are: the leather gloves
  // held in the right hand and worn on the wrists (bending, for comparison), the open helm worn as antlers
  // and as wings, and the long hair as a CC BY pack style that swings.
  const id = "3d-avatar-maker-test-objects";
  const asJson = (document) =>
    Buffer.from(
      JSON.stringify(document, (key, value) =>
        value instanceof Uint8Array ? Buffer.from(value).toString("base64") : value,
      ),
    );
  const hands = await load("avatar-outfits-hands.pack.png");
  const heads = await load("avatar-outfits-head.pack.png");
  const kitHair = await load("avatar-hair-long.pack.png");
  served.set(
    `${id}/wardrobe/objects.pack.png`,
    asJson({
      pieces: {
        test_held: hands.pieces.gloves,
        test_bent: hands.pieces.gloves,
        test_antlers: heads.pieces.helm,
        test_wings: heads.pieces.helm,
      },
      pictures: [],
    }),
  );
  served.set(`${id}/hair/test_waves.pack.png`, asJson({ styles: { test_waves: kitHair.styles.long }, pictures: [] }));
  const installed = {
    id,
    version: "0.1.00",
    status: "active",
    manifest: {
      contributions: {
        assets: { paths: ["avatar-pack.json", "wardrobe/objects.pack.png", "hair/test_waves.pack.png"] },
      },
    },
  };
  const piece = (label, slot, over = {}) => ({
    label,
    slot,
    bodies: ["male", "female"],
    layer: 3,
    hides: [],
    parts: {},
    variants: [],
    bundle: "wardrobe/objects.pack.png",
    licence: "CC0-1.0",
    author: "Tester",
    source: "http://example.test/",
    credit: null,
    ...over,
  });
  const style = (over = {}) => ({
    label: "Test waves",
    bodies: ["male", "female"],
    bundle: "hair/test_waves.pack.png",
    licence: "CC-BY-4.0",
    author: "Hairdresser",
    source: "http://example.test/",
    credit: "Test waves by Hairdresser, CC BY 4.0",
    swing: 0.03,
    ...over,
  });
  const index = {
    format: 1,
    for: "3d-avatar-maker",
    body: BODY_REVISION,
    maker: "0.1.09",
    name: "Test Objects",
    pieces: {
      test_held: piece("Held glove", "hand_right"),
      test_antlers: piece("Antlers", "horns"),
      test_wings: piece("Wings", "on_back", { bone: "spine_03" }),
      test_bent: piece("Bent glove", "wrists"),
      test_finger_bone: piece("Bad", "hip", { bone: "index_01_r" }),
      test_eye_bone: piece("Bad", "hip", { bone: "eye_l" }),
      test_listed_bone: piece("Bad", "hip", { bone: ["Head"] }),
      test_proto_bone: piece("Bad", "hip", { bone: "toString" }),
    },
    hair: {
      test_waves: style(),
      test_still: style({ label: "Still", swing: null }),
      test_swing: style({ swing: 2 }),
      test_swing_text: style({ swing: "0.03" }),
      test_no_credit: style({ credit: null }),
      test_bundle: style({ bundle: "hair/elsewhere.pack.png" }),
      test_licence: style({ licence: "CC-BY-NC-4.0" }),
      long: style(), // (the kit's own)
      test_held: style(), // (a piece of this pack)
      "Bad-Id": style(),
      constructor: style(),
    },
  };
  const pieces = readPack(installed, index);
  assert.deepEqual(
    pieces.map((entry) => [entry.piece, entry.slot, entry.bone]),
    [
      ["test_held", "hand_right", null],
      ["test_antlers", "horns", null],
      ["test_wings", "on_back", "spine_03"],
      ["test_bent", "wrists", null],
    ],
    "the new slots and a known bone are read; a finger's, an eye's or a malformed bone is left out",
  );
  const styles = readHair(installed, index);
  assert.deepEqual(
    styles.map((entry) => [entry.style, entry.swing]),
    [
      ["test_waves", 0.03],
      ["test_still", null],
    ],
    "only well-formed hair styles, with a free id, a declared bundle and a credit for CC BY",
  );
  assert.equal(styles[0].url, `/api/capability-packages/${id}/assets/hair/test_waves.pack.png?v=0.1.00`);
  assert.deepEqual(readHair(installed, { ...index, hair: undefined }), [], "a pack without hair (format 1 as before)");
  assert.deepEqual(readHair(installed, { ...index, format: 2 }), [], "an index this maker can't read");

  // A look or draft that wore pieces and a hair style from the pack, opened while it isn't installed.
  const record = { pack: id, name: "Test Objects", label: "Held glove" };
  const saved = startOf("female", {
    clothes: ["test_held", "boots", "test_antlers"],
    hair: "test_waves",
    clothColours: { test_held: { cloth: 0x112233 } },
    fromPacks: {
      test_held: record,
      test_waves: { pack: id, name: "Test Objects", label: "Test waves" },
      boots: record, // (a kit piece has no pack)
      test_gone: record, // (not in the look)
    },
  });
  assert.deepEqual(saved.clothes, ["boots", "test_held", "test_antlers"], "unknown pieces are kept");
  assert.equal(saved.hair, "test_waves", "and an unknown hair style");
  assert.deepEqual(saved.fromPacks, {
    test_held: record,
    test_waves: { pack: id, name: "Test Objects", label: "Test waves" },
  });
  assert.deepEqual(saved.clothColours, { test_held: { cloth: 0x112233 } }, "with their colours");
  assert.deepEqual(checkLook(saved), saved, "through every later check, as a draft is");
  const notes = missingNotes(saved);
  assert.equal(notes.length, 3);
  assert.match(notes[0], /"Held glove" isn't shown because its pack, Test Objects, isn't installed/u);
  assert.match(notes[1], /"test_antlers" isn't shown: none of the installed wardrobe packs has it/u);
  assert.match(notes[2], /hair style "Test waves" isn't shown.*Another style shows/u);
  const worn = wornLook(saved);
  assert.deepEqual(worn.clothes, ["boots"], "a saved avatar file has only what's worn");
  assert.ok(!worn.hair && !worn.fromPacks && !worn.clothColours, "and nothing of the missing pack");
  const design = readDesign({ clothes: ["test_held", "boots"], hair: "test_waves" });
  assert.deepEqual([design.clothes, design.hair], [["boots"], undefined], "a design keeps only what's there");
  // Kept strictly: well-formed ids only, at most one for each slot, and a pack record only for a pack.
  const junk = checkLook({
    clothes: [
      ...["Bad-Id", "constructor", "__proto__", "toString", 7, "x".repeat(65), "long"],
      ...Array.from({ length: 80 }, (_, i) => `gone_${i}`),
    ],
    hair: "toString",
    fromPacks: { gone_0: { pack: "someone-else", name: "x" }, gone_1: { pack: id, name: 5 } },
  });
  assert.equal(junk.clothes.length, CLOTH_SLOTS.length, "as many unknown pieces as there are slots");
  assert.ok(
    junk.clothes.every((each) => /^gone_\d+$/u.test(each)),
    "only well-formed ids, never a hair style's",
  );
  assert.equal(junk.hair, undefined);
  assert.deepEqual(junk.fromPacks, { gone_1: { pack: id, name: id, label: "gone_1" } });
  // Built without the pack: the missing pieces and style aren't worn.
  const meshCount = async (look) => {
    const figure = await createAvatar(look, "Test", "auto");
    const count = figure.meshes.length;
    figure.dispose();
    return [count, figure.avatar.hair];
  };
  const [without, shownHair] = await meshCount(saved);
  assert.equal(without, (await meshCount(worn))[0], "missing pieces aren't drawn");
  assert.notEqual(shownHair, "test_waves", "another hair style shows meanwhile");

  // The pack installed again: the same look wears them, and names where they're from.
  looks.addPieces(pieces);
  looks.addHair(styles);
  const back = checkLook(saved);
  assert.deepEqual(back.clothes, saved.clothes, "the look wears them again");
  assert.equal(back.hair, "test_waves");
  assert.deepEqual(back.fromPacks.test_antlers, { pack: id, name: "Test Objects", label: "Antlers" });
  assert.deepEqual(missingNotes(back), [], "nothing missing now");
  assert.equal(wornLook(back), back, "everything in it is worn");
  const [withPack, hairNow] = await meshCount(back);
  assert.ok(withPack >= without + 2, "the held glove and antlers are drawn");
  assert.equal(hairNow, "test_waves", "and the pack's hair style");
  assert.ok((await avatarChoices("female")).hair.includes("test_waves"), "the Hair tab offers the pack's style");
  assert.ok(
    (await avatarChoices("male")).clothes.some((entry) => entry.piece === "test_held" && entry.slot === "hand_right"),
    "the Clothes tab offers the held piece in its slot",
  );
  assert.match(licenceNote(back), /Test waves by Hairdresser, CC BY 4\.0/u, "a pack style's credit goes in the file");
  assert.equal(vrmMeta("a", back, { creditNotation: "unnecessary" }).creditNotation, "required");

  // A bone-fixed piece rests exactly as fitted and moves with its bone alone; one that isn't bends.
  const figure = await createAvatar(
    startOf("female", { clothes: ["test_held", "test_antlers", "test_wings", "test_bent"], hair: "test_waves" }),
    "Test",
    "auto",
  );
  assert.ok(
    figure.springs.some((spring) => spring.name.startsWith("Hair")),
    "the pack's long style swings",
  );
  const on = (bone) =>
    figure.meshes.filter((mesh) => mesh.skeleton.bones.length === 1 && mesh.skeleton.bones[0].name === bone);
  const [held, antlers, wings] = [on("hand_r"), on("Head"), on("spine_03")];
  assert.ok(held.length && antlers.length && wings.length, "each is bound to its one bone");
  const bent = figure.meshes.find(
    (mesh) =>
      mesh.skeleton.bones.some((bone) => bone.name === "index_02_r") &&
      mesh.geometry.attributes.position.count === held[0].geometry.attributes.position.count,
  );
  assert.ok(bent, "the glove worn on the wrists keeps its own weights");
  const world = (mesh) => {
    const out = [];
    const point = new Vector3();
    const { position } = mesh.geometry.attributes;
    for (let i = 0; i < position.count; i += 5) {
      mesh.applyBoneTransform(i, point.fromBufferAttribute(position, i));
      out.push(point.clone().applyMatrix4(mesh.matrixWorld));
    }
    return out;
  };
  /** How much the distances between points changed (metres), against a few anchors. */
  const bending = (now, was) => {
    let most = 0;
    for (const anchor of [0, Math.floor(now.length / 3), Math.floor((now.length * 2) / 3)])
      for (let i = 0; i < now.length; i++)
        most = Math.max(most, Math.abs(now[i].distanceTo(now[anchor]) - was[i].distanceTo(was[anchor])));
    return most;
  };
  // At rest: every point where the mesh lists it, and the mesh is the fitted piece moved as one (by the
  // look's shape keys, on average), so its shape is exactly as fitted.
  const fitted = hands.pieces.gloves.female.meshes.map((mesh) => geometryOf(mesh).attributes.position);
  held.forEach((mesh, m) => {
    const { position } = mesh.geometry.attributes;
    const shift = new Vector3().fromBufferAttribute(position, 0).sub(new Vector3().fromBufferAttribute(fitted[m], 0));
    let off = 0;
    let unlike = 0;
    const point = new Vector3();
    for (let i = 0; i < position.count; i++) {
      const listed = new Vector3().fromBufferAttribute(position, i);
      mesh.applyBoneTransform(i, point.copy(listed));
      off = Math.max(off, point.distanceTo(listed));
      unlike = Math.max(unlike, listed.sub(shift).distanceTo(new Vector3().fromBufferAttribute(fitted[m], i)));
    }
    assert.ok(off < 1e-5, `the held piece rests where it's listed (off by ${off})`);
    assert.ok(unlike < 1e-5 && shift.length() < 0.01, `in its fitted shape (${unlike}), moved ${shift.length()} m`);
  });
  const rest = [held[0], antlers[0], wings[0], bent].map(world);
  const handWas = figure.bones.get("hand_r").matrixWorld.clone();
  const turn = (name, x, y, z) => figure.bones.get(name).rotateX(x).rotateY(y).rotateZ(z);
  turn("lowerarm_r", 0.3, 0.2, 0.6);
  turn("hand_r", 0.7, 0.3, 0.4);
  for (const finger of ["thumb", "index", "middle", "ring", "pinky"])
    for (const joint of [1, 2, 3]) turn(`${finger}_0${joint}_r`, 0.4, 0, 0.5);
  turn("spine_02", 0.2, 0.3, 0.1);
  turn("spine_03", 0.1, 0.2, 0.3);
  turn("neck_01", 0.3, 0.4, 0);
  turn("Head", 0.4, -0.5, 0.2);
  figure.object.updateMatrixWorld(true);
  const posed = [held[0], antlers[0], wings[0], bent].map(world);
  ["held piece", "antlers", "wings"].forEach((name, i) => {
    const bend = bending(posed[i], rest[i]);
    assert.ok(bend < 1e-5, `the ${name} don't bend as the arm, hand, back and head move (${bend})`);
  });
  assert.ok(bending(posed[3], rest[3]) > 0.002, "the glove that isn't fixed bends with the fingers");
  const byHand = figure.bones.get("hand_r").matrixWorld.clone().multiply(new Matrix4().copy(handWas).invert());
  const followed = Math.max(...posed[0].map((point, i) => point.distanceTo(rest[0][i].clone().applyMatrix4(byHand))));
  assert.ok(followed < 1e-5, `the held piece moves with the hand (${followed})`);
  restPose(figure);
  for (const mesh of figure.meshes) for (const material of [mesh.material].flat()) material.map = null;

  // A bigger head grows the antlers with it, as it does the hair and eyes: the same shape, larger.
  const grown = await createAvatar(
    startOf("female", { clothes: ["test_antlers"], limbs: { head: 1.2 } }),
    "Test",
    "auto",
  );
  const plain = await createAvatar(
    startOf("female", { clothes: ["test_antlers"], limbs: { head: 1 } }),
    "Test",
    "auto",
  );
  const [big, usual] = [grown, plain].map((one) =>
    world(one.meshes.find((mesh) => mesh.skeleton.bones.length === 1 && mesh.skeleton.bones[0].name === "Head")),
  );
  let ratio = 0;
  for (let i = 1; i < big.length; i++)
    ratio = Math.max(ratio, Math.abs(big[i].distanceTo(big[0]) / usual[i].distanceTo(usual[0]) - 1.2));
  assert.ok(ratio < 1e-3, `the antlers grow with the head (${ratio})`);
  grown.dispose();
  plain.dispose();

  // Saved: a GLB and a VRM with the fixed pieces, each bound to its one bone, the VRM read by three-vrm.
  const look = wornLook(checkLook({ ...back, clothes: [...back.clothes, "test_gone"] }));
  assert.ok(!look.clothes.includes("test_gone"));
  const glb = await exportGlb(figure, { look, name: "Holding" });
  const { json } = readGlb(glb.bytes);
  const single = json.skins.filter((skin) => skin.joints.length === 1).map((skin) => json.nodes[skin.joints[0]].name);
  for (const bone of ["hand_r", "Head", "spine_03"])
    assert.ok(single.includes(bone), `the GLB binds a piece to ${bone} alone`);
  assert.deepEqual(lookInGlb(glb.bytes), { name: "Holding", look }, "and keeps the look as worn");
  const vrmFile = await exportVrm(figure, { look, name: "Holding", terms: { author: "Tester" } });
  const loader = new GLTFLoader();
  loader.register((parser) => new VRMLoaderPlugin(parser));
  const bytes = vrmFile.bytes;
  const gltf = await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), "");
  const vrm = gltf.userData.vrm;
  assert.ok(vrm?.humanoid, "three-vrm reads the VRM");
  vrm.scene.updateMatrixWorld(true);
  let furthest = 0;
  let fixedMeshes = 0;
  const point = new Vector3();
  vrm.scene.traverse((object) => {
    if (!object.isSkinnedMesh) return;
    if (object.skeleton.bones.length === 1) fixedMeshes++;
    const position = object.geometry.attributes.position;
    for (let i = 0; i < position.count; i += 97) {
      const listed = point.fromBufferAttribute(position, i).clone().applyMatrix4(object.matrixWorld);
      object.applyBoneTransform(i, point.fromBufferAttribute(position, i));
      furthest = Math.max(furthest, point.applyMatrix4(object.matrixWorld).distanceTo(listed));
    }
  });
  assert.ok(fixedMeshes >= 3, "the fixed pieces are in the VRM on their bones");
  assert.ok(furthest < 0.001, `the VRM's bind pose is its rest pose (off by ${furthest.toFixed(5)})`);
  assert.match(vrm.meta.thirdPartyLicenses ?? "", /Test waves by Hairdresser/u, "and credits the pack's hair");
  figure.dispose();
}
console.log("3d-avatar-maker.regression: ok");
