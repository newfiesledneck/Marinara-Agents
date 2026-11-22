// Wanderworld's base avatar (src/avatar.js), from the kit files on disk (kit/generic/avatar, packed from
// assets/models/avatar-*.glb by `scripts/build-wanderworld-people.mjs --avatar`): both bodies with every
// shape key, a person built from each in Node (pictures stubbed), shape keys, limb lengths, underwear and
// outfit pieces applied, looks checked and older ones carried over, presets read back as written, and
// townsfolk's looks the same every time from their name and lore. The anthro bodies (a wolf, a dragon) too:
// their kit files, two-way sliders, colours, wings, and human outfit pieces worn on them.
// Run: node tests/wanderworld-avatar.regression.mjs
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { arrayOf, unpack } from "../packages/wanderworld/src/packed.js";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Box3, Vector3 } from "three";

const kitRoot = join(dirname(fileURLToPath(import.meta.url)), "../packages/wanderworld/kit");
const fetched = []; // every kit file asked for, by its path under kit/
globalThis.fetch = async (url) => {
  const name = String(url).split("/kit/")[1];
  fetched.push(name);
  try {
    return new Response(await readFile(join(kitRoot, name)), { status: 200 });
  } catch {
    return new Response("missing", { status: 404 });
  }
};
const image = () => ({ addEventListener() {}, removeEventListener() {}, setAttribute() {}, style: {} });
globalThis.document = { createElementNS: image, createElement: image };

const { avatarChoices, avatarLook, createAvatar, keyWeights } = await import("../packages/wanderworld/src/avatar.js");
const looks = await import("../packages/wanderworld/src/looks.js");
const { checkLook, checkPresets, mergeLooks, presetFile, readPresetFile, BUILT_IN_PRESETS, SKIN_TONES } = looks;
const { lookFromWords, readKeyword } = await import("../packages/wanderworld/src/keywords.js");
const { checkSetting } = await import("../packages/wanderworld/src/settings.js");
const { geometryOf, sexFor, texture } = await import("../packages/wanderworld/src/people.js");

// ── The kit has both bodies, each with every shape key ──────────────────────
const KEYS = [
  "thin",
  "heavy",
  "muscle",
  "hips",
  "waist",
  "belly",
  "shoulders",
  "neck",
  "jaw",
  "cheeks",
  "nose",
  "eyes",
  "ears_pointed",
  "age_middle",
  "age_old",
];
const PARTS = ["skin", "underwear", "eye_white", "iris", "eyebrows", "eyelashes", "lips", "nails"];
const files = {};
for (const sex of ["male", "female"]) {
  const file = await unpack(await readFile(join(kitRoot, `generic/avatar/avatar-${sex}.pack.png`)));
  files[sex] = file;
  assert.match(file.source, /MakeHuman \(CC0\)/u, "the kit says where the body is from");
  const own = [...KEYS, sex === "female" ? "bust" : "chest"];
  assert.deepEqual([...file.keys].sort(), own.sort(), `the ${sex} body has every shape key`);
  const skin = file.meshes.find((mesh) => mesh.part === "skin");
  for (const key of own) assert.ok(skin.morphs?.[key], `the ${sex} skin moves with ${key}`);
  for (const part of PARTS)
    assert.ok(
      file.meshes.some((mesh) => mesh.part.startsWith(part)),
      `the ${sex} body has its ${part}`,
    );
  for (const mesh of file.meshes)
    assert.ok(existsSync(join(kitRoot, `generic/avatar/${mesh.texture}.webp`)), `${mesh.texture}.webp is in the kit`);
  assert.ok(
    file.skeleton.names.includes("pelvis") && file.skeleton.names.includes("hand_r"),
    "on the people's skeleton",
  );
  // (Only one underwear top and one bottom, and one brow and one lash style, are ever shown, so the body is
  // counted without them, and each style on its own.)
  const isUnder = (mesh) => /^(?:underwear|eyebrows|eyelashes)-/u.test(mesh.piece ?? "");
  const vertices = file.meshes.filter((mesh) => !isUnder(mesh)).reduce((sum, mesh) => sum + mesh.count, 0);
  assert.ok(vertices < 32000, `the ${sex} body stays within its budget (${vertices} vertices)`);
  for (const mesh of file.meshes.filter(isUnder))
    assert.ok(
      mesh.count < 9000,
      `the ${sex} ${mesh.piece} ${mesh.part} stays within its budget (${mesh.count} vertices)`,
    );
}

// ── Hair and clothing: the bundles and their indexes cover every style and piece ──
const readKit = async (path) => unpack(await readFile(join(kitRoot, path)));
const hairIndex = JSON.parse(await readFile(join(kitRoot, "generic/avatar/avatar-hair-index.json"), "utf8"));
const outfitIndex = JSON.parse(await readFile(join(kitRoot, "fantasy/avatar/avatar-outfits-index.json"), "utf8"));
const bundles = {}; // a bundle's name → its document
for (const entry of Object.values(hairIndex))
  bundles[entry.bundle] ??= await readKit(`generic/avatar/${entry.bundle}.pack.png`);
for (const entry of Object.values(outfitIndex))
  bundles[entry.bundle] ??= await readKit(`fantasy/avatar/${entry.bundle}.pack.png`);
const FACE_KEYS = ["jaw", "cheeks", "nose", "eyes", "ears_pointed"];
/** Every mesh of a hair style or piece, each body and variant: [{ where, mesh, sex, part }]. */
const meshesOf = (item, name) =>
  [item, ...Object.values(item.variants ?? {})].flatMap((way) =>
    ["male", "female"].flatMap((sex) =>
      (way[sex]?.meshes ?? []).map((mesh) => ({ where: `${name} (${sex})`, mesh, sex, part: way[sex] })),
    ),
  );
/** Each vertex's bone (the one with the most weight), and each key's moves (metres), of a packed mesh. */
const bonesOf = (mesh, joints) => {
  const index = arrayOf(Uint8Array, mesh.joints);
  const weights = arrayOf(Uint8Array, mesh.weights);
  return Array.from({ length: mesh.count }, (_, v) => {
    let best = 0;
    for (let c = 1; c < 4; c++) if (weights[v * 4 + c] > weights[v * 4 + best]) best = c;
    return joints[index[v * 4 + best]];
  });
};
const movesOf = (mesh, morph) => {
  const ids = arrayOf(mesh.count > 65535 ? Uint32Array : Uint16Array, morph.ids);
  const delta = arrayOf(Int16Array, morph.delta);
  return Array.from(ids, (id, i) => [
    id,
    Math.hypot(...[0, 1, 2].map((c) => (delta[i * 3 + c] / morph.q) * morph.d[c])),
  ]);
};
/** For each body, which keys move its skin on each bone: bone → Set of keys. */
const bodyReach = {};
for (const sex of ["male", "female"]) {
  const reach = (bodyReach[sex] = new Map());
  for (const mesh of files[sex].meshes) {
    const bones = bonesOf(mesh, files[sex].joints);
    for (const [key, morph] of Object.entries(mesh.morphs ?? {}))
      for (const [id, size] of movesOf(mesh, morph))
        if (size > 0.0004) {
          if (!reach.has(bones[id])) reach.set(bones[id], new Set());
          reach.get(bones[id]).add(key);
        }
  }
}
/** Whether a hair or clothing mesh moves with each key only where the body does (more than a millimetre). */
const followsBody = ({ mesh, sex, part }) => {
  const bones = bonesOf(mesh, part.joints);
  for (const [key, morph] of Object.entries(mesh.morphs ?? {}))
    for (const [id, size] of movesOf(mesh, morph))
      if (size > 0.001 && bodyReach[sex].has(bones[id]) && !bodyReach[sex].get(bones[id]).has(key))
        return `${key} moves it ${(size * 1000).toFixed(1)} mm on ${bones[id]}`;
  return "";
};
{
  const styles = looks.HAIRSTYLES.map(([style]) => style).filter((style) => !["none", "afro"].includes(style));
  assert.deepEqual(
    Object.keys(hairIndex).sort(),
    [...styles].sort(),
    "every hair style the Look card names is in the kit",
  );
  assert.ok(
    new Set(Object.values(hairIndex).map((entry) => entry.bundle)).size <= 2,
    "the hair is in one or two bundles",
  );
  assert.deepEqual(
    Object.keys(outfitIndex).sort(),
    looks.CLOTHES.map(([piece]) => piece).sort(),
    "every piece the Look card names is in the kit, and no other",
  );
  const outfitBundles = new Set(Object.values(outfitIndex).map((entry) => entry.bundle));
  assert.ok(outfitBundles.size >= 6 && outfitBundles.size <= 10, `clothing in a few bundles (${outfitBundles.size})`);
  for (const [style, entry] of Object.entries(hairIndex)) {
    const item = bundles[entry.bundle].styles[style];
    assert.deepEqual(Object.keys(item).sort(), [...entry.bodies].sort(), `${style}: the index says its bodies`);
    for (const each of meshesOf(item, style)) {
      const { where, mesh } = each;
      assert.ok(
        bundles[entry.bundle].pictures.some((picture) => picture.name === mesh.texture),
        `${where}'s picture is in its bundle`,
      );
      // Hair moves with a key only where the body does: the head's keys on the head, the shoulders' where
      // it lies on them. Short hair, all on the head, keeps only the head's.
      assert.equal(followsBody(each), "", `${where} follows only the body`);
      if (["short", "crop", "slicked", "fringe"].includes(style))
        for (const key of ["bust", "chest", "hips", "waist", "belly", "shoulders"])
          assert.ok(!mesh.morphs?.[key], `${where} doesn't move with ${key}`);
    }
  }
  for (const [piece, entry] of Object.entries(outfitIndex)) {
    const item = bundles[entry.bundle].pieces[piece];
    assert.ok(item, `${piece} is in ${entry.bundle}`);
    assert.equal(item.slot, looks.SLOT_OF[piece], `${piece}'s slot is the Look card's`);
    assert.equal(entry.slot, looks.SLOT_OF[piece]);
    const group = looks.CLOTH_SLOTS.find(([slot]) => slot === entry.slot)[3];
    assert.equal(entry.bundle, `avatar-outfits-${group}`, `${piece} is bundled with its slot's group`);
    for (const sex of entry.bodies) assert.ok(item[sex], `${piece} has the ${sex} body's mesh`);
    for (const each of meshesOf(item, piece)) {
      const { where, mesh } = each;
      assert.ok(
        bundles[entry.bundle].pictures.some((picture) => picture.name === mesh.texture),
        `${where}'s picture is in its bundle`,
      );
      assert.equal(followsBody(each), "", `${where} follows only the body`);
      assert.ok(mesh.partOf && mesh.parts.length, `${where} is one mesh, each vertex saying its part`);
      for (const { part } of mesh.parts)
        assert.ok(
          looks.CLOTH_PARTS.some(([name]) => name === part),
          `${where}: ${part} is named`,
        );
      // No face keys on what isn't worn on the head.
      if (!["head", "brow", "neck"].includes(entry.slot))
        for (const key of FACE_KEYS) assert.ok(!mesh.morphs?.[key], `${where} doesn't move with the face's ${key}`);
    }
  }
  // Some pieces are made for one body only, and the Look card offers each body its own.
  assert.deepEqual(outfitIndex.bikini_top.bodies, ["female"]);
  assert.deepEqual(outfitIndex.mh_jeans.bodies, ["male"]);
  // Key normals: each key's normal, as the game works it in at full strength, is about unit length and
  // on the same side as the normal at rest (packing turned round those that flipped).
  let worst = 0;
  for (const bundle of Object.values(bundles))
    for (const [name, item] of Object.entries(bundle.pieces ?? bundle.styles))
      for (const { where, mesh } of meshesOf(item, name)) {
        const normal = arrayOf(Int8Array, mesh.normal);
        for (const [key, morph] of Object.entries(mesh.morphs ?? {})) {
          const ids = arrayOf(mesh.count > 65535 ? Uint32Array : Uint16Array, morph.ids);
          const turn = arrayOf(Int8Array, morph.normal);
          for (let i = 0; i < ids.length; i++) {
            const n = [0, 1, 2].map((c) => normal[ids[i] * 3 + c] / 127);
            const m = [0, 1, 2].map((c) => n[c] + (turn[i * 3 + c] / 127) * morph.n[c]);
            const length = Math.hypot(...m);
            const facing = (m[0] * n[0] + m[1] * n[1] + m[2] * n[2]) / (length || 1);
            worst = Math.max(worst, Math.abs(length - 1));
            // (Never turned round: at most a right angle, give or take the int8 rounding.)
            assert.ok(facing > -0.05, `${where}'s ${key} keeps its normals facing out (${facing.toFixed(3)})`);
          }
        }
      }
  assert.ok(worst < 0.15, `key normals stay about unit length (at most ${worst.toFixed(3)} off)`);
  // The cloak's hood up is a variant of its own, hiding the hair; down is the usual.
  const cloak = bundles[outfitIndex.cloak.bundle].pieces.cloak;
  assert.deepEqual(outfitIndex.cloak.variants, ["hood_up"]);
  assert.ok(cloak.variants.hood_up.male && cloak.variants.hood_up.female, "hood up for both bodies");
  assert.ok(cloak.variants.hood_up.hides.includes("hair") && !cloak.hides.includes("hair"));
}

// ── Built in Node, standing like a person ───────────────────────────────────
const bone = (character, wanted) => {
  let found = null;
  character.object.traverse((object) => {
    if (object.isBone && object.name === wanted) found = object;
  });
  return found.getWorldPosition(new Vector3());
};
const bodyMesh = (character) => {
  let found = null;
  character.object.traverse((object) => {
    if (object.isSkinnedMesh && object.name === "body") found = object;
  });
  return found;
};
/** The hair and outfit meshes a person wears. */
const piecesOn = (character) => {
  const found = [];
  character.object.traverse((object) => object.isSkinnedMesh && object.name === "piece" && found.push(object));
  return found;
};
// (Bare, so the body is measured on its own: the clothes are tested below.)
const EVERYDAY = {
  shape: Object.fromEntries([...looks.SHAPES, ...looks.FACE].map(([key]) => [key, 0])),
  limbs: { arms: 1, legs: 1, head: 1 },
  height: 1,
  clothes: [],
};

// ── A piece loads only its own bundle, and a style only its own ─────────────
{
  fetched.length = 0;
  const person = await createAvatar({ ...EVERYDAY, body: "male", hair: "short", clothes: ["t_shirt"] }, "Rowan");
  const bundlesFetched = fetched.filter(
    (name) => /\.pack\.png$/u.test(name) && !/avatar-(?:male|female)\./u.test(name),
  );
  assert.deepEqual(
    bundlesFetched.sort(),
    ["fantasy/avatar/avatar-outfits-tops.pack.png", "generic/avatar/avatar-hair-short.pack.png"],
    "wearing a shirt and short hair fetches the tops and the short hair, nothing else",
  );
  assert.equal(piecesOn(person).length, 2, "the hair and the shirt, a mesh each");
  fetched.length = 0;
  await avatarChoices("female");
  assert.ok(
    !fetched.some((name) => /avatar-(?:outfits|hair)-.*\.pack\.png$/u.test(name)),
    "the Look card reads only the indexes",
  );
  person.dispose();
}
for (const sex of ["male", "female"]) {
  const person = await createAvatar({ ...EVERYDAY, body: sex }, "Rowan");
  person.update(1 / 60, 0);
  person.object.updateMatrixWorld(true);
  const box = new Box3().setFromObject(person.object, true);
  const height = box.max.y - box.min.y;
  assert.ok(height > 1.5 && height < 1.9, `the ${sex} body is person-sized (${height.toFixed(2)} m)`);
  assert.ok(Math.abs(box.min.y) < 0.05, `the ${sex} body stands on the ground (${box.min.y.toFixed(3)})`);
  assert.ok(bone(person, "thigh_l").x > bone(person, "thigh_r").x, `the ${sex} body faces +z`);
  assert.ok(bone(person, "hand_l").y < bone(person, "upperarm_l").y - 0.3, `the ${sex} body's arms hang at rest`);
  let draws = 0;
  // (The body itself, not its hair: a kit with hair adds a draw or two. Four: the skin, the eyes (their own
  // picture), the underwear, and the brows and lashes.)
  person.object.traverse((object) => {
    if (object.isSkinnedMesh && object.name === "body") draws += object.geometry.groups.length || 1;
  });
  assert.ok(draws <= 4, `the ${sex} body is a few draws (${draws})`);
  // It walks: the legs swing.
  let swing = 0;
  const rest = bone(person, "foot_l").z;
  for (let i = 0; i < 40; i++) {
    person.update(1 / 30, 1.4);
    person.object.updateMatrixWorld(true);
    swing = Math.max(swing, Math.abs(bone(person, "foot_l").z - rest));
  }
  assert.ok(swing > 0.1, `the ${sex} body walks`);
  person.dispose();
}

// ── Shape keys, limb lengths and colours apply ──────────────────────────────
{
  const plain = await createAvatar({ ...EVERYDAY, body: "male" }, "Rowan");
  const heavy = await createAvatar({ ...EVERYDAY, body: "male", shape: { ...EVERYDAY.shape, weight: 1 } }, "Rowan");
  const a = bodyMesh(plain).geometry.attributes.position.array;
  const b = bodyMesh(heavy).geometry.attributes.position.array;
  let most = 0;
  for (let i = 0; i < a.length; i++) most = Math.max(most, Math.abs(a[i] - b[i]));
  assert.ok(most > 0.03 && most < 0.06, `weight +1 is the heavy key in full (${most.toFixed(4)} m at most)`);
  // Every vertex the heavy key moves, it moves by its own amount.
  const skin = files.male.meshes.find((mesh) => mesh.part === "skin");
  assert.ok(Object.keys(skin.morphs.heavy).length, "the heavy key is packed");
  const half = await createAvatar({ ...EVERYDAY, body: "male", shape: { ...EVERYDAY.shape, weight: 0.5 } }, "Rowan");
  const c = bodyMesh(half).geometry.attributes.position.array;
  for (let i = 0; i < a.length; i += 97)
    assert.ok(Math.abs(c[i] - (a[i] + b[i]) / 2) < 1e-5, "half the key is half the move");
  // The opposite of heavy is the thin key.
  const thin = await createAvatar({ ...EVERYDAY, body: "male", shape: { ...EVERYDAY.shape, weight: -1 } }, "Rowan");
  assert.notDeepEqual(bodyMesh(thin).geometry.attributes.position.array, a, "weight −1 is the thin key");
  // Colours: the skin's own.
  const red = await createAvatar({ ...EVERYDAY, body: "male", colours: { skin: 0xff0000 } }, "Rowan");
  const colour = bodyMesh(red).geometry.attributes.color;
  assert.ok(colour.getX(0) > 0.99 && colour.getY(0) < 0.01, "the skin is coloured as chosen");
  // Longer legs: the hips are further from the feet; shared data stays shared.
  const leg = (person) => {
    person.update(1 / 60, 0);
    person.object.updateMatrixWorld(true);
    return bone(person, "pelvis").y - bone(person, "foot_l").y;
  };
  const long = await createAvatar({ ...EVERYDAY, body: "male", limbs: { arms: 1, legs: 1.15, head: 1 } }, "Rowan");
  const short = await createAvatar({ ...EVERYDAY, body: "male", limbs: { arms: 1, legs: 0.85, head: 1 } }, "Rowan");
  const ratio = leg(long) / leg(short);
  assert.ok(Math.abs(ratio - 1.15 / 0.85) < 0.08, `leg length scales the legs (${ratio.toFixed(2)})`);
  const box = new Box3().setFromObject(long.object, true);
  assert.ok(Math.abs(box.min.y) < 0.05, `longer legs still stand on the ground (${box.min.y.toFixed(3)})`);
  assert.equal(
    bodyMesh(long).geometry.attributes.uv,
    bodyMesh(short).geometry.attributes.uv,
    "texture places are shared",
  );
  for (const person of [plain, heavy, half, thin, red, long, short]) person.dispose();
  assert.ok(
    bodyMesh(long) === null || !bodyMesh(long).geometry.attributes.uv,
    "letting go keeps the shared data for the rest",
  );
}

// ── Default skins with underwear (Settings → People): off, nobody wears any unless it's chosen ──
{
  const { setUnderwearByDefault } = await import("../packages/wanderworld/src/avatar.js");
  setUnderwearByDefault(false);
  assert.deepEqual(
    avatarLook("Rowan", "female", {}).underwear,
    { top: "none", bottom: "none" },
    "off: no underwear unless chosen",
  );
  assert.deepEqual(
    avatarLook("Rowan", "female", { underwear: { top: "bralette" } }).underwear.top,
    "bralette",
    "a choice made by hand still wins",
  );
  setUnderwearByDefault(true);
  assert.deepEqual(avatarLook("Rowan", "female", {}).underwear, { top: "bra", bottom: "briefs" }, "on: the usual");
}

// ── Underwear, and what an outfit piece hides ───────────────────────────────
{
  const count = (person) => bodyMesh(person).geometry.index.count;
  assert.deepEqual(await avatarChoices("female").then(({ tops, bottoms }) => ({ tops, bottoms })), {
    tops: ["bra", "sports_bra", "bralette"],
    bottoms: ["briefs", "boxer_briefs", "boxers", "boyshorts", "bikini", "thong"],
  });
  const maleChoices = await avatarChoices("male");
  assert.deepEqual(maleChoices.bottoms, ["briefs", "boxer_briefs", "boxers"], "his underwear styles");
  const female = await createAvatar({ ...EVERYDAY, body: "female" }, "Rowan");
  assert.deepEqual(female.avatar.underwear, { top: "bra", bottom: "briefs" }, "she wears a bra and briefs unless said");
  const bare = await createAvatar({ ...EVERYDAY, body: "female", underwear: { top: "none", bottom: "none" } }, "Rowan");
  const layer = files.female.meshes.find((mesh) => mesh.part === "underwear");
  assert.ok(count(female) - count(bare) >= layer.count, "no underwear leaves its triangles out");
  const male = await createAvatar({ ...EVERYDAY, body: "male" }, "Rowan");
  assert.deepEqual(male.avatar.underwear, { top: "none", bottom: "briefs" }, "he wears briefs unless said");

  // The Look card is offered each body's own pieces, with their slots, parts and colours, and variants.
  const offered = { male: (await avatarChoices("male")).clothes, female: (await avatarChoices("female")).clothes };
  for (const sex of ["male", "female"])
    assert.deepEqual(
      offered[sex].map(({ piece }) => piece).sort(),
      Object.keys(outfitIndex)
        .filter((piece) => outfitIndex[piece].bodies.includes(sex))
        .sort(),
      `the ${sex} body is offered the pieces made for it`,
    );
  assert.ok(
    !offered.male.some(({ piece }) => piece === "bikini_top") &&
      offered.female.some(({ piece }) => piece === "bikini_top"),
  );
  const cloakChoice = offered.male.find(({ piece }) => piece === "cloak");
  assert.equal(cloakChoice.slot, "back");
  assert.deepEqual(cloakChoice.variants, ["hood_up"]);
  assert.deepEqual(
    cloakChoice.parts.map(([part]) => part),
    ["cloth", "lining", "metal"],
    "the cloak's colour parts",
  );
  // A gambeson hides the torso's skin and the underwear; a piece the kit hasn't got for him is left off.
  const dressed = await createAvatar({ ...EVERYDAY, body: "male", clothes: ["gambeson", "bikini_top"] }, "Rowan");
  assert.equal(piecesOn(dressed).length, 1 + (dressed.avatar.hair === "none" ? 0 : 1), "the gambeson and the hair");
  const under = files.male.meshes.find((mesh) => mesh.part === "underwear");
  assert.ok(count(male) - count(dressed) > under.count * 3, "the piece hides the underwear and the skin under it");
  for (const person of [female, bare, male, dressed]) person.dispose();
}

// ── Clothing: the hood, colours, small pieces far off, presets and townsfolk ─
{
  // The cloak's hood: down or up, never both; up hides the hair.
  const cloak = bundles[outfitIndex.cloak.bundle].pieces.cloak;
  const down = await createAvatar({ ...EVERYDAY, body: "female", hair: "long", clothes: ["cloak"] }, "Rowan");
  const up = await createAvatar(
    { ...EVERYDAY, body: "female", hair: "long", clothes: ["cloak"], variants: { cloak: "hood_up" } },
    "Rowan",
  );
  const counts = (person) =>
    piecesOn(person)
      .map((mesh) => mesh.geometry.attributes.position.count)
      .sort();
  const cloakDown = cloak.female.meshes[0].count;
  const cloakUp = cloak.variants.hood_up.female.meshes[0].count;
  assert.ok(counts(down).includes(cloakDown) && !counts(down).includes(cloakUp), "hood down: the cloak alone");
  assert.deepEqual(counts(up), [cloakUp], "hood up: the hooded cloak alone, and the hair hidden under it");
  assert.equal(piecesOn(down).length, 2, "hood down: the cloak and the hair");

  // A part's colour: the look's for that part, as made for the rest; the same colours shared by all.
  const cloth = await createAvatar(
    { ...EVERYDAY, body: "male", clothes: ["tunic"], clothColours: { tunic: { cloth: 0xff0000 } } },
    "Rowan",
  );
  const twin = await createAvatar(
    { ...EVERYDAY, body: "male", clothes: ["tunic"], clothColours: { tunic: { cloth: 0xff0000 } } },
    "Bram",
  );
  const plain = await createAvatar({ ...EVERYDAY, body: "male", clothes: ["tunic"] }, "Rowan");
  const tunicOf = (person) => piecesOn(person).find((mesh) => mesh.geometry.attributes.color);
  const tunic = bundles[outfitIndex.tunic.bundle].pieces.tunic.male.meshes[0];
  const partOf = arrayOf(Uint8Array, tunic.partOf);
  const clothAt = partOf.indexOf(tunic.parts.findIndex(({ part }) => part === "cloth"));
  const trimAt = partOf.indexOf(tunic.parts.findIndex(({ part }) => part === "trim"));
  const colours = tunicOf(cloth).geometry.attributes.color;
  assert.ok(colours.getX(clothAt) > 0.99 && colours.getY(clothAt) < 0.01, "the cloth is the look's red");
  assert.ok(
    Math.abs(colours.getX(trimAt) - tunic.parts.find(({ part }) => part === "trim").colour[0]) < 0.01,
    "the trim as made",
  );
  assert.equal(tunicOf(twin).geometry.attributes.color, colours, "the same colours are shared");
  assert.notEqual(tunicOf(plain).geometry.attributes.color, colours);
  assert.ok(tunicOf(cloth).material.vertexColors, "drawn by its vertex colours, in one draw");

  // Small pieces aren't drawn far off; the rest are, in their distant version.
  const { PerspectiveCamera } = await import("three");
  const belted = await createAvatar({ ...EVERYDAY, body: "male", clothes: ["belt_pouches", "boots"] }, "Rowan");
  belted.object.updateMatrixWorld(true);
  const camera = new PerspectiveCamera();
  camera.position.set(0, 1.5, 200);
  const drawnFar = (mesh) => {
    mesh.onBeforeRender(null, null, camera, mesh.geometry, mesh.material, null);
    return mesh.geometry.drawRange.count;
  };
  const [belt, boots] = ["belt_pouches", "boots"].map((piece) =>
    piecesOn(belted).find(
      (mesh) =>
        mesh.geometry.attributes.position.count ===
        bundles[outfitIndex[piece].bundle].pieces[piece].male.meshes[0].count,
    ),
  );
  assert.equal(drawnFar(belt), 0, "a belt isn't drawn far off");
  assert.ok(drawnFar(boots) > 0, "boots are");

  // Outfit presets: each one's pieces are made for that body, and putting it on wears them all.
  const { OUTFIT_PRESETS, outfitLook } = looks;
  assert.deepEqual(
    OUTFIT_PRESETS.map((preset) => preset.name),
    ["Peasant", "Townsperson", "Ranger", "Mage", "Knight", "Barbarian", "Beach", "Modern casual"],
  );
  for (const preset of OUTFIT_PRESETS)
    for (const sex of ["male", "female"]) {
      const outfit = outfitLook(preset, sex);
      assert.deepEqual(checkLook(outfit), outfit, `${preset.name} is a checked look`);
      for (const piece of outfit.clothes)
        assert.ok(outfitIndex[piece].bodies.includes(sex), `${preset.name}'s ${piece} is made for the ${sex} body`);
      const person = await createAvatar({ ...EVERYDAY, hair: "none", body: sex, ...outfit }, "Rowan");
      assert.equal(
        piecesOn(person).length,
        outfit.clothes.length,
        `${preset.name} on the ${sex} body wears every piece`,
      );
      person.dispose();
    }
  assert.equal(outfitLook(OUTFIT_PRESETS[2], "male").variants.cloak, "hood_up", "the ranger's hood is up");
  // A preset of one's own keeps the clothes, colours and hood.
  const [kept] = checkPresets([{ name: "Ranger", look: { body: "male", ...outfitLook(OUTFIT_PRESETS[2], "male") } }]);
  assert.deepEqual(readPresetFile(presetFile(kept)), kept, "a preset's clothes read back as written");
  for (const field of ["clothes", "clothColours", "variants"]) assert.ok(looks.PRESET_FIELDS.includes(field));

  // Townsfolk: everyday clothes for their work, from the name, the same every time.
  const { everydayClothes } = await import("../packages/wanderworld/src/avatar.js");
  const jobs = new Set();
  for (let i = 0; i < 200; i++) {
    const name = `Townsfolk ${i}`;
    const look = avatarLook(name);
    assert.deepEqual(avatarLook(name).clothes, look.clothes, `${name} wears the same every time`);
    assert.deepEqual(everydayClothes(name, look.body), everydayClothes(name, look.body));
    assert.deepEqual(look.clothes, everydayClothes(name, look.body).clothes, "their work's clothes unless chosen");
    assert.ok(look.clothes.length >= 2 && look.clothes.length <= 4, "a few pieces, cheap for a phone");
    for (const piece of look.clothes)
      assert.ok(outfitIndex[piece].bodies.includes(look.body), `${piece} fits ${look.body}`);
    assert.deepEqual(checkLook({ clothes: look.clothes }).clothes, look.clothes, "one a slot");
    jobs.add(look.job);
  }
  assert.deepEqual(
    [...jobs].sort(),
    ["farmer", "guard", "noble", "priest", "smith", "townsperson"],
    "every work turns up",
  );
  const smith = [...Array(200).keys()].map((i) => `Townsfolk ${i}`).find((name) => avatarLook(name).job === "smith");
  assert.ok(avatarLook(smith).clothes.includes("apron"), "a smith wears an apron");
  assert.deepEqual(avatarLook(smith, "auto", { clothes: [] }).clothes, [], "nothing chosen is nothing on");
  assert.equal(avatarLook(smith, "auto", { clothes: [] }).job, null);
  assert.deepEqual(avatarLook(smith, "auto", { clothes: ["robe"] }).clothes, ["robe"], "a choice wins");
  // Their looks otherwise stay as the name had them before clothes came.
  assert.deepEqual(avatarLook(smith, "auto", { clothes: [] }).shape, avatarLook(smith).shape);
  for (const person of [down, up, cloth, twin, plain, belted]) person.dispose();
}

// ── Looks: checked and clamped, older ones carried over ─────────────────────
{
  const checked = checkLook({
    body: "wolf", // (a kind of body is `species`; a body is male or female)
    species: "cat",
    shape: { weight: 5, jaw: -3, ears: 0.5, snout: 1 },
    limbs: { arms: 2, legs: 0.5, head: "big" },
    colours: { skin: 0x123456, eyes: -1, feathers: 0xffffff },
    underwear: { top: "corset", bottom: "thong" },
    clothes: ["vest", "Vest!", 3, "vest"],
    preset: "  My look  ",
    wings: "yes",
  });
  assert.deepEqual(checked, {
    shape: { weight: 1, jaw: -0.5, ears: 0.5 },
    limbs: { arms: 1.15, legs: 0.85 },
    colours: { skin: 0x123456 },
    underwear: { bottom: "thong" },
    clothes: ["vest"],
    preset: "My look",
  });
  // The anthro bodies' fields: the kind, the wings, their sliders (each within its range, a two-way one all
  // the way down) and their parts' colours.
  assert.deepEqual(
    checkLook({
      species: "dragon",
      wings: false,
      shape: { muzzle: 5, earSize: -2, horns: -9, tailLength: 3, tail: -1, neck: -3 },
      colours: { fur: 0xffffff, fur2: 1, nose: 2, claws: 3, scales: 4, scales2: 5, horns: 0x1000000 },
    }),
    {
      species: "dragon",
      wings: false,
      shape: { neck: -1, muzzle: 1, earSize: -1, horns: -1, tailLength: 1, tail: 0 },
      colours: { fur: 0xffffff, fur2: 1, nose: 2, claws: 3, scales: 4, scales2: 5 },
    },
  );
  assert.equal(checkLook({ body: "female" }).body, "female");
  assert.deepEqual(checkLook({ underwear: { top: "none" } }), { underwear: { top: "none" } });
  // Clothing: known pieces only, the first one a slot; known parts' colours; known variants of worn-able pieces.
  assert.deepEqual(
    checkLook({
      clothes: ["shirt", "t_shirt", "jetpack", "cloak", "__proto__", "boots"],
      clothColours: { shirt: { cloth: 0x112233, glitter: 0xffffff, trim: "red" }, jetpack: { cloth: 1 }, boots: 5 },
      variants: { cloak: "hood_up", shirt: "hood_up", hood: "down" },
    }),
    {
      clothes: ["shirt", "cloak", "boots"],
      clothColours: { shirt: { cloth: 0x112233 } },
      variants: { cloak: "hood_up" },
    },
  );
  assert.deepEqual(checkLook({ clothes: [] }), { clothes: [] }, "nothing on is kept, not the name's clothes");
  assert.deepEqual(checkLook({ clothes: "shirt", variants: { cloak: "" } }), {});
  // A look saved before the base avatar: its height, skin, hair and cloth colour carry over.
  const old = checkLook({ skin: 3, hair: "simpleparted", hairColour: 6, height: 1.05, colour: "clothes-blue" });
  assert.equal(old.hair, "parted");
  assert.equal(checkLook({ hair: "buzzedfemale" }).hair, "short");
  const now = avatarLook("Rowan", "male", old);
  assert.equal(now.colours.skin, SKIN_TONES[old.skin][0], "the skin carries over");
  assert.equal(now.hair, "parted");
  assert.equal(now.hairColour, looks.HAIR_COLOURS[6][0], "the hair colour carries over");
  assert.equal(now.height, 1.05, "the height carries over");
  assert.equal(now.colours.underwear, looks.CLOTH_HEX["clothes-blue"], "the cloth's colour is the underwear's");
  assert.equal(avatarLook("Rowan", "male", { skinTint: 0x112233 }).colours.skin, 0x112233);
  assert.equal(now.species, "human", "a look saved before the anthro bodies is a human's");
  assert.equal(now.wings, true);
  // The body: the look's own, else the gender's, the same as the older kit's people have.
  assert.equal(avatarLook("Rowan", "male", { body: "female" }).body, "female");
  assert.equal(avatarLook("Rowan", "female").body, "female");
  for (const name of ["Bram", "Ivy", "Hank", "Lena"]) assert.equal(avatarLook(name).body, sexFor(name).sex);
}

// ── Presets: kept, written and read back as they were ───────────────────────
{
  const look = checkLook({
    body: "female",
    shape: { weight: 0.3, ears: 1 },
    colours: { lips: 0xa83a3a },
    hair: "long",
    avatar: "vrm",
  });
  const [kept] = checkPresets([{ name: "Elf", look }]);
  assert.equal(kept.look.avatar, undefined, "a preset never says which 3D model shows");
  assert.deepEqual(readPresetFile(presetFile(kept)), kept, "a preset exported and imported is the same");
  assert.equal(readPresetFile("{not json"), null);
  assert.equal(readPresetFile(JSON.stringify({ name: "x" })), null, "only a Wanderworld look file reads");
  assert.deepEqual(checkSetting("lookPresets", "junk"), [], "a damaged list of presets is none");
  const many = checkPresets(Array.from({ length: 40 }, (_, i) => ({ name: `Look ${i % 30}`, look: { height: 2 } })));
  assert.equal(many.length, 24, "at most 24 kept, each name once");
  assert.equal(many[0].look.height, looks.HEIGHTS[1], "each preset's look is checked");
  assert.deepEqual(checkSetting("lookPresets", [{ name: "Elf", look }]), [kept], "kept with the settings");
  for (const sex of ["male", "female"])
    assert.ok(
      BUILT_IN_PRESETS.filter((preset) => preset.look.body === sex).length >= 3,
      `ready-made looks for the ${sex} body`,
    );
  for (const preset of BUILT_IN_PRESETS)
    assert.deepEqual(checkLook(preset.look), preset.look, `${preset.name} is a checked look`);
}

// ── Townsfolk: a look from the name, the same every time, shaped by lore's words ─
{
  const names = ["Bram", "Ivy", "Hank", "Lena", "Odo", "Sera", "Cole", "Brin"];
  const seen = new Set();
  for (const name of names) {
    const look = avatarLook(name);
    assert.deepEqual(avatarLook(name), look, `${name} looks the same every time`);
    for (const [key, , least, most] of [...looks.SHAPES, ...looks.FACE])
      assert.ok(look.shape[key] >= least && look.shape[key] <= most, `${name}'s ${key} is within its range`);
    assert.equal(look.shape.ears, 0, "nobody has pointed ears unless lore or a hand says");
    for (const [key, , least, most] of looks.LIMBS) assert.ok(look.limbs[key] >= least && look.limbs[key] <= most);
    seen.add(JSON.stringify(look.shape));
  }
  assert.equal(seen.size, names.length, "different names look different");
  // Lore's words, with no AI call: "ww:looks:tall", "elf", "red hair".
  assert.equal(readKeyword("ww:looks:tall").problem, "");
  assert.match(readKeyword("ww:looks:purple").problem, /a look is one of/u);
  const lore = lookFromWords(["looks tall", "looks red hair", "looks elf", "lives in home3"]);
  assert.deepEqual(lore, { height: 1.08, hairColour: 6, shape: { ears: 1 } });
  const shaped = avatarLook("Bram", "auto", mergeLooks(lore, { shape: { weight: 0.2 } }));
  assert.equal(shaped.height, 1.08);
  assert.equal(shaped.shape.ears, 1, "an elf has pointed ears");
  assert.equal(shaped.shape.weight, 0.2, "what's chosen by hand sits on lore");
  assert.equal(shaped.hairColour, looks.HAIR_COLOURS[6][0]);
  assert.deepEqual(lookFromWords("A short, stocky half-elf with short hair and blue eyes."), {
    hair: "short",
    height: 0.92,
    shape: { weight: 0.4, muscle: 0.4, shoulders: 0.4, neck: 0.4, ears: 0.6 },
    limbs: { legs: 0.94 },
    colours: { eyes: 0x3f6f8a },
  });
  assert.deepEqual(lookFromWords("nothing at all"), {}, "words inside other words don't count");
}

// ── MakeHuman's skins, ages, eye pictures, brows and lashes ─────────────────
{
  for (const sex of ["male", "female"]) {
    for (const age of ["young", "middle", "old"])
      for (const kind of ["caucasian", "african", "asian"])
        assert.ok(
          existsSync(join(kitRoot, `generic/avatar/avatar-${sex}-skin-${age}-${kind}.webp`)),
          `the kit has the ${sex} ${age} ${kind} skin`,
        );
    const styles = (kind) =>
      files[sex].meshes.filter((mesh) => new RegExp(`^${kind}-\\d+$`, "u").test(mesh.piece ?? "")).length;
    assert.equal(styles("eyebrows"), looks.BROWS, `the ${sex} body has every brow style as a piece`);
    assert.equal(styles("eyelashes"), looks.LASHES, `the ${sex} body has every lash style as a piece`);
    const choices = await avatarChoices(sex);
    assert.equal(choices.brows.length, looks.BROWS, "the Look card offers every brow style");
    assert.equal(choices.lashes.length, looks.LASHES, "and every lash style");
  }
  assert.ok(existsSync(join(kitRoot, "generic/avatar/avatar-eyes.webp")), "the eye pictures are in the kit, one file");

  // A skin picture: the skin, lips and nails drawn with it, coloured white.
  const lips = files.male.meshes.find((mesh) => mesh.part === "lips");
  const pictured = await createAvatar({ ...EVERYDAY, body: "male", skin: "african", age: "old" }, "Rowan");
  const drawnWith = (person, name) => bodyMesh(person).material.some((material) => material.map === texture(name));
  assert.ok(drawnWith(pictured, "avatar-male-skin-old-african"), "a skin picture of their age in place of the model's");
  assert.ok(!drawnWith(pictured, lips.texture), "the model's own skin texture is left off");
  const white = (person, vertex) => {
    const colour = bodyMesh(person).geometry.attributes.color;
    return [colour.getX(vertex), colour.getY(vertex), colour.getZ(vertex)].every((value) => value > 0.999);
  };
  assert.ok(white(pictured, 0), "the skin is white under a skin picture");
  assert.equal(pictured.avatar.colours.lips, 0xffffff, "lips are the picture's own");
  assert.equal(pictured.avatar.colours.nails, 0xffffff, "nails too");
  const own = await createAvatar({ ...EVERYDAY, body: "male", skin: "custom", colours: { skin: 0xff0000 } }, "Rowan");
  assert.ok(!white(own, 0), "a colour of one's own still tints the skin");
  assert.ok(drawnWith(own, lips.texture), "on the model's own texture");

  // An age drives its shape key.
  const ofAge = async (age) =>
    bodyMesh(await createAvatar({ ...EVERYDAY, body: "male", age }, "Rowan")).geometry.attributes.position.array;
  const [young, middle, old] = [await ofAge("young"), await ofAge("middle"), await ofAge("old")];
  const furthest = (a, b) => a.reduce((most, value, i) => Math.max(most, Math.abs(value - b[i])), 0);
  assert.ok(furthest(young, old) > 0.01, `old moves the body (${furthest(young, old).toFixed(3)} m at most)`);
  assert.ok(furthest(young, middle) > 0.002, "middle-aged moves it too");
  assert.ok(furthest(young, middle) < furthest(young, old), "less than old does");

  // One brow style and one lash style show, blended.
  const triangles = (kind, n) => {
    const geometry = geometryOf(
      files.male.meshes.find((mesh) => mesh.piece === `${kind}-${String(n).padStart(2, "0")}`),
    );
    return geometry.userData.distant?.full.count ?? geometry.index.count; // (the full triangles, not the distant ones)
  };
  for (const [brows, lashes] of [
    [1, 1],
    [9, 3],
  ]) {
    const person = await createAvatar({ ...EVERYDAY, body: "male", brows, lashes }, "Rowan");
    const mesh = bodyMesh(person);
    const blended = mesh.material.findIndex((material) => material.transparent);
    const group = mesh.geometry.groups.find((each) => each.materialIndex === blended);
    assert.equal(
      group.count,
      triangles("eyebrows", brows) + triangles("eyelashes", lashes),
      `brows ${brows} and lashes ${lashes} show, and no others`,
    );
    person.dispose();
  }

  // An eye picture: the eyes drawn with the pictures' file, the iris white, their texture places on its tile.
  const iris = files.male.meshes.find((mesh) => mesh.part === "iris");
  const eyed = await createAvatar({ ...EVERYDAY, body: "male", eyePicture: "green" }, "Rowan");
  assert.ok(drawnWith(eyed, "avatar-eyes") && !drawnWith(eyed, iris.texture), "an eye picture in place of the tint");
  assert.notEqual(bodyMesh(eyed).geometry.attributes.uv, bodyMesh(own).geometry.attributes.uv, "on its tile");
  for (const person of [pictured, own, eyed]) person.dispose();

  // Looks: the new fields kept and clamped; an older look's skin is a colour of its own.
  assert.deepEqual(checkLook({ age: "ancient", skin: "martian", brows: 40, lashes: -2, eyePicture: "red" }), {
    brows: looks.BROWS,
    lashes: 1,
  });
  assert.deepEqual(checkLook({ age: "old", skin: "asian", brows: 2.4, eyePicture: "ice" }), {
    age: "old",
    skin: "asian",
    brows: 2,
    eyePicture: "ice",
  });
  assert.equal(checkLook({ eyePicture: "tint" }).eyePicture, "tint");
  assert.equal(
    avatarLook("Rowan", "male", checkLook({ skin: 3 })).skin,
    "custom",
    "an older tone is a colour of one's own",
  );
  assert.equal(avatarLook("Rowan", "male", { colours: { skin: 0x123456 } }).skin, "custom");
  assert.equal(avatarLook("Rowan", "male", {}).eyePicture, "tint", "the tinted eye unless chosen");
  for (const field of ["age", "brows", "lashes", "eyePicture"]) assert.ok(looks.PRESET_FIELDS.includes(field));

  // Townsfolk: an adult age from the name, the same every time (mostly young, a few old), and a skin picture.
  const ages = { young: 0, middle: 0, old: 0 };
  for (let i = 0; i < 300; i++) {
    const look = avatarLook(`Townsfolk ${i}`);
    assert.deepEqual(avatarLook(`Townsfolk ${i}`), look, "the same every time");
    ages[look.age]++;
    assert.ok(["caucasian", "african", "asian"].includes(look.skin), "a skin picture unless chosen");
    assert.ok(Number.isInteger(look.brows) && Number.isInteger(look.lashes), "brows and lashes of their own");
  }
  assert.equal(ages.young + ages.middle + ages.old, 300, "every one an adult age");
  assert.ok(ages.young > ages.middle && ages.middle > ages.old && ages.old > 0, `mostly young ${JSON.stringify(ages)}`);
  // Lore's words.
  assert.equal(lookFromWords("An elderly smith").age, "old");
  assert.deepEqual(lookFromWords("looks grey-haired"), { age: "old", hairColour: 7 });
  assert.equal(lookFromWords("a middle-aged baker").age, "middle");
  assert.deepEqual(lookFromWords("She is 30 years old."), {}, "years old says nothing");
  assert.equal(avatarLook("Bram", "auto", lookFromWords("old")).age, "old");
}

// The distant version: far from the camera a body is drawn with fewer triangles, each part of it
// (group) its own, over the same vertices; near, or with "Always full detail", in full.
{
  const { DETAIL_DISTANCES, setDetailDistance } = await import("../packages/wanderworld/src/kit.js");
  const { PerspectiveCamera } = await import("three");
  const person = await createAvatar({ ...EVERYDAY, body: "female" }, "Rowan");
  const mesh = bodyMesh(person);
  person.object.updateMatrixWorld(true);
  const camera = new PerspectiveCamera();
  const drawn = (metres) => {
    camera.position.set(0, 1.5, metres);
    return mesh.geometry.groups.reduce((sum, group) => {
      mesh.onBeforeRender(null, null, camera, mesh.geometry, mesh.material[group.materialIndex], group);
      return sum + group.count;
    }, 0);
  };
  const vertices = mesh.geometry.attributes.position.count;
  setDetailDistance(DETAIL_DISTANCES.normal);
  const near = drawn(5);
  const far = drawn(80);
  assert.ok(far < near / 4, `far off, far fewer triangles (${far / 3} of ${near / 3})`);
  assert.ok(far / 3 <= 2.5 * 8000, "about 7,000 vertices' worth");
  assert.equal(drawn(5), near, "and in full again up close");
  assert.equal(mesh.geometry.attributes.position.count, vertices, "the same vertices");
  setDetailDistance(DETAIL_DISTANCES.full);
  assert.equal(drawn(500), near, "Always full detail");
  setDetailDistance(DETAIL_DISTANCES.normal);
}

// ── The anthro bodies: a wolf and a dragon, built on the human body ─────────
{
  const BUILD = ["thin", "heavy", "muscle", "hips", "waist", "belly", "shoulders", "neck", "neck_slim"];
  const KINDS = {
    wolf: {
      keys: [...BUILD, "jaw", "cheeks", "eyes", "muzzle", "muzzle_short", "ears_tall", "ears_small"].concat([
        "tail",
        "tail_long",
        "tail_short",
        "ruff_flat",
      ]),
      parts: ["fur", "fur2", "nose", "eyes", "eyelashes", "claws", "teeth", "fur_tufts", "fur2_tufts"],
      bones: ["tail_01", "tail_04"],
    },
    dragon: {
      keys: [...BUILD, "jaw", "cheeks", "eyes", "muzzle", "muzzle_short", "horns", "horns_small"].concat([
        "tail",
        "tail_long",
        "tail_short",
      ]),
      parts: ["scales", "scales2", "horns", "iris", "eye_white", "teeth"],
      bones: ["tail_01", "tail_05", "wing_01_l", "wing_f3_r"],
    },
  };
  const anthro = {}; // "wolf-male" → its kit file
  let bytes = 0;
  for (const [kind, { keys, parts, bones }] of Object.entries(KINDS))
    for (const sex of ["male", "female"]) {
      const path = join(kitRoot, `generic/avatar/anthro-${kind}-${sex}.pack.png`);
      bytes += (await readFile(path)).length;
      const file = (anthro[`${kind}-${sex}`] = await unpack(await readFile(path)));
      const where = `the ${sex} ${kind}`;
      assert.match(file.source, /MakeHuman \(CC0\)/u, `${where} says it's built on MakeHuman's base mesh`);
      assert.deepEqual(
        [...file.keys].sort(),
        [...keys, sex === "female" ? "bust" : "chest"].sort(),
        `${where} has its shape keys`,
      );
      for (const part of parts)
        assert.ok(
          file.meshes.some((mesh) => mesh.part === part && !mesh.piece),
          `${where} has its ${part}`,
        );
      // Its pieces: two underwear bottoms, her two tops, and a dragon's wings.
      const pieces = [...new Set(file.meshes.map((mesh) => mesh.piece).filter(Boolean))].sort();
      assert.deepEqual(
        pieces,
        [
          "underwear-bottom-boxer_briefs",
          "underwear-bottom-briefs",
          ...(sex === "female" ? ["underwear-top-bra", "underwear-top-sports_bra"] : []),
          ...(kind === "dragon" ? ["wings"] : []),
        ],
        `${where}'s pieces`,
      );
      // On the people's skeleton, with tail (and wing) bones, each on a parent.
      for (const joint of [...files[sex].skeleton.names, ...bones])
        assert.ok(file.skeleton.names.includes(joint), `${where} has the ${joint} bone`);
      assert.ok(file.skeleton.parents[file.skeleton.names.indexOf("tail_01")] >= 0, "the tail is on the body");
      // Its pictures are inside the file, none bigger than the body's 2,048 pixels would make it.
      for (const mesh of file.meshes)
        assert.ok(
          file.pictures.some((picture) => picture.name === mesh.texture),
          `${where}'s ${mesh.part} picture is in its file`,
        );
      assert.ok(file.pictures.length <= 4, `${where} has few pictures (${file.pictures.length}): no normal maps`);
      // Compact shape keys, a distant version, and a body within its budget.
      const main = file.meshes.find((mesh) => mesh.part === parts[0] && !mesh.piece);
      assert.equal(main.morphs.thin.q, 511, "its shape keys are packed in fewer steps");
      assert.ok(main.far, `${where} has a distant version`);
      const vertices = file.meshes.filter((mesh) => !mesh.piece).reduce((sum, mesh) => sum + mesh.count, 0);
      assert.ok(vertices < 45000, `${where} stays within its budget (${vertices} vertices)`);
    }
  assert.ok(bytes < 14e6, `the four anthro bodies are under 14 MB together (${(bytes / 1e6).toFixed(1)})`);

  const BEAST = {
    ...EVERYDAY,
    shape: { ...EVERYDAY.shape, ...Object.fromEntries(looks.ANTHRO_SHAPES.map(([key]) => [key, 0])) },
  };
  const positions = (person) => bodyMesh(person).geometry.attributes.position.array;
  /** How far apart two bodies' vertices are at most (metres). */
  const apart = (a, b) => {
    let most = 0;
    for (let i = 0; i < a.length; i++) most = Math.max(most, Math.abs(a[i] - b[i]));
    return most;
  };

  // Each stands like a person, on the ground, in a few draws, and walks with the people's clips.
  for (const [kind, sex] of [
    ["wolf", "male"],
    ["wolf", "female"],
    ["dragon", "male"],
    ["dragon", "female"],
  ]) {
    const person = await createAvatar({ ...BEAST, species: kind, body: sex }, "Rowan");
    assert.equal(person.avatar.species, kind);
    assert.equal(person.avatar.body, sex);
    person.object.updateMatrixWorld(true);
    const box = new Box3().setFromObject(person.object, true);
    const height = box.max.y - box.min.y;
    assert.ok(height > 1.5 && height < 2.2, `the ${sex} ${kind} is person-sized (${height.toFixed(2)} m)`);
    assert.ok(Math.abs(box.min.y) < 0.05, `the ${sex} ${kind} stands on the ground (${box.min.y.toFixed(3)})`);
    assert.ok(bodyMesh(person).geometry.groups.length <= 4, `the ${sex} ${kind} is a few draws`);
    // The tail sways, a little, while the people's clips move the rest.
    const tail = () => bone(person, kind === "wolf" ? "tail_04" : "tail_05");
    const rest = bone(person, "foot_l").z;
    let swing = 0;
    let sway = 0;
    const from = tail();
    for (let i = 0; i < 60; i++) {
      person.update(1 / 30, 1.4);
      person.object.updateMatrixWorld(true);
      swing = Math.max(swing, Math.abs(bone(person, "foot_l").z - rest));
      sway = Math.max(sway, tail().distanceTo(from));
    }
    assert.ok(swing > 0.1, `the ${sex} ${kind} walks`);
    assert.ok(sway > 0.01 && sway < 0.8, `the ${sex} ${kind}'s tail sways (${sway.toFixed(3)} m)`);
    person.dispose();
  }

  // Two-way sliders: each side of the middle drives a key of its own, when the body has the one below.
  const wolfKeys = anthro["wolf-male"].keys;
  const dragonKeys = anthro["dragon-male"].keys;
  const weightsOf = (shape, keys, flat) => keyWeights({ shape: { ...BEAST.shape, ...shape } }, "male", keys, flat);
  for (const [slider, low, high, keys] of [
    ["muzzle", "muzzle_short", "muzzle", wolfKeys],
    ["earSize", "ears_small", "ears_tall", wolfKeys],
    ["tailLength", "tail_short", "tail_long", wolfKeys],
    ["neck", "neck_slim", "neck", wolfKeys],
    ["horns", "horns_small", "horns", dragonKeys],
    ["weight", "thin", "heavy", files.male.keys],
  ]) {
    const down = weightsOf({ [slider]: -0.6 }, keys);
    const up = weightsOf({ [slider]: 0.6 }, keys);
    assert.deepEqual([down[low], down[high]], [0.6, 0], `${slider} below the middle is the ${low} key`);
    assert.deepEqual([up[low], up[high]], [0, 0.6], `${slider} above the middle is the ${high} key`);
  }
  assert.equal(weightsOf({ neck: -1 }, wolfKeys).neck_slim, 1, "a wolf's neck goes all the way down");
  const humanNeck = weightsOf({ neck: -1 }, files.male.keys);
  assert.equal(humanNeck.neck, -0.5, "the human neck has one key, run backwards as far as it goes");
  assert.equal(humanNeck.neck_slim, undefined);
  assert.equal(weightsOf({ tail: 1 }, wolfKeys).tail, 1, "tail thickness is one key");
  assert.equal(weightsOf({ ears: 1, nose: 1 }, wolfKeys).ears_pointed, undefined, "only the keys the body has");
  assert.equal(weightsOf({}, wolfKeys).nose, undefined);
  assert.equal(weightsOf({}, wolfKeys, true).ruff_flat, 1, "under a piece the ruff lies flat");
  assert.equal(weightsOf({}, wolfKeys).ruff_flat, 0);
  assert.equal(weightsOf({}, dragonKeys, true).ruff_flat, undefined, "a dragon has no ruff");
  // (And on the model: a longer muzzle and a shorter one both move it, and aren't each other backwards.)
  const wolf = await createAvatar({ ...BEAST, species: "wolf", body: "male" }, "Rowan");
  const longer = await createAvatar(
    { ...BEAST, species: "wolf", body: "male", shape: { ...BEAST.shape, muzzle: 1, tailLength: 1 } },
    "Rowan",
  );
  const shorter = await createAvatar(
    { ...BEAST, species: "wolf", body: "male", shape: { ...BEAST.shape, muzzle: -1, tailLength: -1 } },
    "Rowan",
  );
  assert.ok(apart(positions(longer), positions(wolf)) > 0.01, "a longer muzzle and tail move the model");
  assert.ok(apart(positions(shorter), positions(wolf)) > 0.01, "a shorter muzzle and tail move the model");
  const [a, b, c] = [positions(wolf), positions(longer), positions(shorter)];
  let mirrored = 0;
  for (let i = 0; i < a.length; i++) mirrored = Math.max(mirrored, Math.abs(b[i] - a[i] + (c[i] - a[i])));
  assert.ok(mirrored > 0.005, "shorter is a key of its own, not longer run backwards");
  for (const person of [longer, shorter]) person.dispose();

  // Colours: each part its own, and the tufts follow the fur they're on.
  const count = (file, wanted) =>
    file.meshes.filter((mesh) => wanted.includes(mesh.part)).reduce((sum, mesh) => sum + mesh.count, 0);
  const coloured = (person, [r, g, b2]) => {
    const colour = bodyMesh(person).geometry.attributes.color;
    let found = 0;
    for (let v = 0; v < colour.count; v++)
      if (
        Math.abs(colour.getX(v) - r) < 0.01 &&
        Math.abs(colour.getY(v) - g) < 0.01 &&
        Math.abs(colour.getZ(v) - b2) < 0.01
      )
        found++;
    return found;
  };
  const dyed = await createAvatar(
    {
      ...BEAST,
      species: "wolf",
      body: "male",
      colours: { fur: 0xff0000, fur2: 0x00ff00, nose: 0x0000ff, claws: 0xffff00, eyes: 0xff00ff },
    },
    "Rowan",
  );
  const wolfFile = anthro["wolf-male"];
  assert.equal(coloured(dyed, [1, 0, 0]), count(wolfFile, ["fur", "fur_tufts"]), "the fur and its tufts");
  assert.equal(coloured(dyed, [0, 1, 0]), count(wolfFile, ["fur2", "fur2_tufts"]), "the lighter fur and its tufts");
  assert.equal(coloured(dyed, [0, 0, 1]), count(wolfFile, ["nose"]), "the nose");
  assert.equal(coloured(dyed, [1, 1, 0]), count(wolfFile, ["claws"]), "the claws");
  assert.equal(coloured(dyed, [1, 0, 1]), count(wolfFile, ["eyes"]), "the eyes");
  const scaled = await createAvatar(
    {
      ...BEAST,
      species: "dragon",
      body: "female",
      colours: { scales: 0xff0000, scales2: 0x00ff00, horns: 0x0000ff, eyes: 0xff00ff },
    },
    "Rowan",
  );
  const dragonFile = anthro["dragon-female"];
  assert.equal(coloured(scaled, [1, 0, 0]), count(dragonFile, ["scales"]), "the scales (the wings' too)");
  assert.equal(coloured(scaled, [0, 1, 0]), count(dragonFile, ["scales2"]), "the underside");
  assert.equal(coloured(scaled, [0, 0, 1]), count(dragonFile, ["horns"]), "the horns");
  assert.equal(coloured(scaled, [1, 0, 1]), count(dragonFile, ["iris"]), "the eyes");
  // Unless chosen, a natural coat or an ancestry's scales from the name, the same every time.
  const grey = avatarLook("Rowan", "auto", { species: "wolf" });
  assert.deepEqual(avatarLook("Rowan", "auto", { species: "wolf" }), grey);
  assert.ok(
    looks.FUR_COLOURS.some(([hex]) => hex === grey.colours.fur),
    "a natural coat from the name",
  );
  assert.ok(
    looks.SCALE_COLOURS.some(([hex]) => hex === avatarLook("Rowan", "auto", { species: "dragon" }).colours.scales),
    "an ancestry's scales from the name",
  );
  assert.deepEqual(
    looks.SCALE_COLOURS.map(([, label]) => label.toLowerCase()),
    ["black", "blue", "brass", "bronze", "copper", "gold", "green", "red", "silver", "white"],
    "the SRD's ten draconic ancestries",
  );
  const black = avatarLook("Rowan", "auto", { species: "wolf", colours: { fur: looks.FUR_COLOURS[4][0] } });
  assert.equal(black.colours.fur2, looks.FUR_COLOURS[4][2], "the lighter fur goes with the coat unless chosen");
  assert.equal(black.colours.eyes, grey.colours.eyes, "choosing one colour leaves the others as the name has them");
  for (const person of [dyed, scaled]) person.dispose();

  // Wings: a dragon's, shown unless the look hides them; the Look card offers the switch only for a body with wings.
  const triangles = (person) => bodyMesh(person).geometry.groups.reduce((sum, group) => sum + group.count, 0) / 3;
  const winged = await createAvatar({ ...BEAST, species: "dragon", body: "male" }, "Rowan");
  const wingless = await createAvatar({ ...BEAST, species: "dragon", body: "male", wings: false }, "Rowan");
  const wingTriangles = anthro["dragon-male"].meshes
    .filter((mesh) => mesh.piece === "wings")
    .reduce((sum, mesh) => sum + arrayOf(Uint16Array, mesh.index).length / 3, 0);
  assert.ok(wingTriangles > 1000, "the wings are a piece of their own");
  assert.equal(triangles(winged) - triangles(wingless), wingTriangles, "hiding the wings leaves their triangles out");
  assert.equal((await avatarChoices("male", "dragon")).wings, true);
  assert.equal((await avatarChoices("male", "wolf")).wings, false);
  assert.equal((await avatarChoices("male")).wings, false);
  for (const person of [winged, wingless]) person.dispose();

  // What an anthro body is offered: its own keys and underwear, no hair, nothing for a human head or foot,
  // and no other way of wearing a piece (a hood up).
  for (const kind of ["wolf", "dragon"])
    for (const sex of ["male", "female"]) {
      const choices = await avatarChoices(sex, kind);
      assert.deepEqual(choices.keys, anthro[`${kind}-${sex}`].keys);
      assert.deepEqual(choices.hair, [], `no hair for the ${sex} ${kind}`);
      assert.deepEqual(choices.bottoms, ["briefs", "boxer_briefs"]);
      assert.deepEqual(choices.tops, sex === "female" ? ["bra", "sports_bra"] : []);
      const slots = new Set(choices.clothes.map(({ slot }) => slot));
      for (const slot of ["head", "brow", "feet"]) assert.ok(!slots.has(slot), `no ${slot} pieces for the ${kind}`);
      for (const slot of ["top", "over", "legs", "body", "back", "armour", "hands"])
        assert.ok(slots.has(slot), `the ${sex} ${kind} is offered ${slot} pieces`);
      assert.deepEqual(choices.clothes.find(({ piece }) => piece === "cloak").variants, [], "the hood stays down");
      assert.ok(looks.hasSlider("muzzle", choices.keys, sex) && looks.hasSlider("tailLength", choices.keys, sex));
      assert.ok(!looks.hasSlider("nose", choices.keys, sex) && !looks.hasSlider("ears", choices.keys, sex));
      assert.equal(looks.hasSlider("horns", choices.keys, sex), kind === "dragon");
      assert.equal(looks.hasSlider("earSize", choices.keys, sex), kind === "wolf");
      assert.ok(looks.hasSlider("chest", choices.keys, sex), "her bust, his chest");
      assert.deepEqual(
        looks.sliderRange(
          looks.SHAPES.find(([key]) => key === "neck"),
          choices.keys,
        ),
        [-1, 1],
      );
    }
  assert.ok(!looks.hasSlider("muzzle", files.male.keys, "male"), "a human has no muzzle slider");
  assert.deepEqual(
    looks.sliderRange(
      looks.SHAPES.find(([key]) => key === "neck"),
      files.male.keys,
    ),
    [-0.5, 1],
  );
  const dressed = await createAvatar(
    {
      ...BEAST,
      species: "wolf",
      body: "male",
      hair: "long",
      clothes: ["hood", "circlet", "shirt", "trousers", "boots", "cloak"],
      variants: { cloak: "hood_up" },
    },
    "Rowan",
  );
  assert.deepEqual(dressed.avatar.clothes, ["shirt", "trousers", "cloak"], "nothing made for a human head or foot");
  assert.equal(dressed.avatar.hair, "none", "and no hair");
  assert.deepEqual(dressed.avatar.variants, {});
  assert.equal(piecesOn(dressed).length, 3, "a mesh each for the shirt, trousers and cloak");
  // (Townsfolk's everyday clothes, the same: a wolf smith goes without boots.)
  for (const name of ["Bram", "Ivy", "Hank", "Lena"])
    for (const piece of avatarLook(name, "auto", { species: "wolf" }).clothes)
      assert.ok(!looks.ANTHRO_BARE_SLOTS.has(looks.SLOT_OF[piece]), `${name} the wolf doesn't wear ${piece}`);

  // A human outfit piece on an anthro body: bound to the body's own bones with the piece's own (human) bind
  // pose, so the digitigrade stance bends trousers as it bent the legs.
  const wearing = await createAvatar({ ...BEAST, species: "wolf", body: "male", clothes: ["trousers"] }, "Rowan");
  const [trousers] = piecesOn(wearing);
  const wolfBody = bodyMesh(wearing);
  const trouserPart = bundles[outfitIndex.trousers.bundle].pieces.trousers.male;
  assert.ok(
    trousers.skeleton.bones.every((each) => wolfBody.skeleton.bones.includes(each)),
    "the trousers are on the wolf's own bones",
  );
  const thigh = trouserPart.joints.indexOf("thigh_l");
  assert.ok(
    trousers.skeleton.boneInverses[thigh].elements.every(
      (value, i) => Math.abs(value - trouserPart.inverseBind[thigh * 16 + i]) < 1e-5,
    ),
    "with the trousers' own bind pose",
  );
  const wolfThigh = wolfBody.skeleton.boneInverses[wolfBody.skeleton.bones.indexOf(trousers.skeleton.bones[thigh])];
  assert.ok(
    wolfThigh.elements.some((value, i) => Math.abs(value - trouserPart.inverseBind[thigh * 16 + i]) > 0.05),
    "which isn't the wolf's (its legs are bent)",
  );
  /** A skinned mesh's vertices as posed, in the world (every `step`th). */
  const posed = (mesh, step = 1) => {
    mesh.skeleton.update();
    const position = mesh.geometry.attributes.position;
    const points = [];
    for (let v = 0; v < position.count; v += step)
      points.push(
        mesh.applyBoneTransform(v, new Vector3().fromBufferAttribute(position, v)).applyMatrix4(mesh.matrixWorld),
      );
    return points;
  };
  wearing.object.updateMatrixWorld(true);
  const leg = posed(wolfBody, 3);
  const gaps = posed(trousers, 25)
    .map((point) => Math.sqrt(leg.reduce((least, each) => Math.min(least, each.distanceToSquared(point)), Infinity)))
    .sort((x, y) => x - y);
  const usual = gaps[Math.floor(gaps.length * 0.9)];
  assert.ok(usual < 0.05, `the trousers lie on the wolf's legs (nine in ten within ${(usual * 100).toFixed(1)} cm)`);
  const hem = Math.min(...posed(trousers).map((point) => point.y));
  assert.ok(hem > 0.1 && hem < 0.5, `their hems end at the hock, above the paw (${hem.toFixed(2)} m)`);
  // What they cover is hidden on the body, as on a human.
  assert.ok(wolfBody.geometry.index.count < bodyMesh(wolf).geometry.index.count, "the legs under them are left out");
  // They follow a key the bodies share, and not one that's the wolf's own.
  const piecePositions = (person) => piecesOn(person)[0].geometry.attributes.position.array;
  const heavyWolf = await createAvatar(
    { ...BEAST, species: "wolf", body: "male", clothes: ["trousers"], shape: { ...BEAST.shape, weight: 1 } },
    "Rowan",
  );
  const longTail = await createAvatar(
    { ...BEAST, species: "wolf", body: "male", clothes: ["trousers"], shape: { ...BEAST.shape, tailLength: 1 } },
    "Rowan",
  );
  assert.ok(apart(piecePositions(heavyWolf), piecePositions(wearing)) > 0.01, "the trousers follow the heavy key");
  assert.equal(apart(piecePositions(longTail), piecePositions(wearing)), 0, "and not the tail's");
  // Several pieces at once, on each body, without a hitch: a shirt, tunic, robe, mail and cloak.
  for (const [kind, sex] of [
    ["wolf", "female"],
    ["dragon", "male"],
    ["dragon", "female"],
  ])
    for (const clothes of [["shirt", "tunic", "trousers", "chainmail", "cloak", "gloves"], ["robe"]]) {
      const person = await createAvatar({ ...BEAST, species: kind, body: sex, clothes }, "Rowan");
      assert.equal(piecesOn(person).length, clothes.length, `the ${sex} ${kind} wears ${clothes.join(", ")}`);
      person.update(1 / 30, 1.4);
      person.object.updateMatrixWorld(true);
      for (const mesh of piecesOn(person))
        for (const point of posed(mesh, 40))
          assert.ok(point.length() < 3, `the ${sex} ${kind}'s ${clothes.join(", ")} stay on them`);
      person.dispose();
    }
  // A piece over the neck or chest lays the wolf's ruff flat (a cuirass hides nothing, so only the ruff moves).
  const plated = await createAvatar({ ...BEAST, species: "wolf", body: "male", clothes: ["plate_cuirass"] }, "Rowan");
  assert.ok(apart(positions(plated), positions(wolf)) > 0.005, "the ruff lies flat under a cuirass");
  for (const person of [wolf, dressed, wearing, heavyWolf, longTail, plated]) person.dispose();

  // Presets: the ready-made anthro looks, and any preset on any body (what a body hasn't got is left off).
  for (const name of [
    "Grey wolf",
    "White wolf",
    "Black wolf",
    "Red dragon",
    "Gold dragon",
    "Blue dragon",
    "Silver dragon",
  ]) {
    const preset = BUILT_IN_PRESETS.find((each) => each.name === name);
    assert.ok(preset, `${name} is a ready-made look`);
    const made = avatarLook("Rowan", "female", preset.look);
    assert.equal(made.species, name.endsWith("wolf") ? "wolf" : "dragon");
    assert.equal(made.body, "female", "the body follows their gender");
  }
  const red = BUILT_IN_PRESETS.find((each) => each.name === "Red dragon").look;
  assert.equal(red.colours.scales, looks.SCALE_COLOURS.find(([, label]) => label === "Red")[0]);
  const elf = BUILT_IN_PRESETS.find((each) => each.name === "Female elf").look;
  const elfWolf = avatarLook("Rowan", "auto", { ...elf, species: "wolf" });
  assert.equal(elfWolf.hair, "none", "a human preset on a wolf: no hair");
  assert.equal(elfWolf.shape.weight, elf.shape.weight, "but its build");
  assert.ok(looks.PRESET_FIELDS.includes("species") && looks.PRESET_FIELDS.includes("wings"));

  // The SRD race: a dragonborn has the dragon body unless one is chosen by hand, in its ancestry's scales
  // when the build names one.
  const { raceLook } = looks;
  assert.deepEqual(raceLook({ race: "dragonborn" }), { species: "dragon" });
  assert.deepEqual(raceLook({ race: "dragonborn", ancestry: "Gold" }), {
    species: "dragon",
    colours: { scales: looks.SCALE_COLOURS[5][0] },
  });
  assert.deepEqual(raceLook({ race: "elf" }), {});
  assert.deepEqual(raceLook(undefined), {});
  assert.deepEqual(
    checkLook(raceLook({ race: "dragonborn", ancestry: "red" })),
    raceLook({ race: "dragonborn", ancestry: "red" }),
  );
  const born = (chosen) => avatarLook("Rowan", "auto", mergeLooks(raceLook({ race: "dragonborn" }), chosen));
  assert.equal(born({}).species, "dragon", "a dragonborn is a dragon unless said");
  assert.equal(born({ shape: { weight: 0.3 } }).species, "dragon", "whatever else is chosen");
  assert.equal(born({ species: "human" }).species, "human", "a body chosen by hand wins");
  assert.equal(born({ species: "wolf" }).species, "wolf");

  // ── Every slider works one way, on every body ──
  // Its 0 is the model's own shape; the right is bigger, longer, wider or more and the left smaller, shorter,
  // narrower or less; a two-way slider's track has 0 in the middle, a one-way one's at the left end; and
  // each says what its two ends are.
  const SLIDERS = [...looks.SHAPES, ...looks.FACE, ...looks.ANTHRO_SHAPES];
  for (const entry of [...SLIDERS, ...looks.LIMBS]) {
    const [key, , least, most, what, ends] = entry;
    assert.ok(what && ends?.length === 2 && ends[0] !== ends[1], `${key} says what it changes, and its two ends`);
    assert.ok(least < most);
  }
  for (const [key, , least, most] of looks.LIMBS)
    assert.ok(Math.abs((least + most) / 2 - 1) < 1e-9, `${key}'s middle is the model's own (1)`);
  assert.ok(Math.abs((looks.HEIGHTS[0] + looks.HEIGHTS[1]) / 2 - 1) < 1e-9, "the height's middle is the model's own");
  const bodyFiles = { "human-male": files.male, "human-female": files.female, ...anthro };
  /** How far a look's shape keys move a body's surface, summed over it, measured `way` (metres × vertices). */
  const moved = (file, weights, way) => {
    let sum = 0;
    for (const mesh of file.meshes.filter((each) => !each.piece)) {
      const normal = arrayOf(Int8Array, mesh.normal);
      const position = arrayOf(Int16Array, mesh.position);
      for (const [key, morph] of Object.entries(mesh.morphs ?? {})) {
        if (!weights[key]) continue;
        const ids = arrayOf(mesh.count > 65535 ? Uint32Array : Uint16Array, morph.ids);
        const delta = arrayOf(Int16Array, morph.delta);
        ids.forEach((id, i) => {
          const [x, y, z] = [0, 1, 2].map((c) => (delta[i * 3 + c] / morph.q) * morph.d[c] * weights[key]);
          if (way === "outward")
            sum += (x * normal[id * 3] + y * normal[id * 3 + 1] + z * normal[id * 3 + 2]) / 127; // (along the surface's own normal)
          else if (way === "wider") {
            // (The model is centred: left and right move apart.)
            const side = mesh.box[0] + ((position[id * 3] + 32768) / 65535) * (mesh.box[3] - mesh.box[0]);
            sum += x * (side > 0 ? 1 : -1);
          } else sum += way === "up" ? y : z; // ("forward")
        });
      }
    }
    return sum;
  };
  // What "bigger" is for each slider. (Muscle and eyes aren't measured: more muscle is more shape, not more
  // of everything, and larger eyes open the lids; both were looked at.)
  const BIGGER = {
    weight: "outward",
    chest: "outward",
    hips: "wider",
    waist: "outward",
    belly: "outward",
    shoulders: "wider",
    neck: "outward",
    jaw: "outward",
    cheeks: "outward",
    nose: "outward",
    ears: "up",
    muzzle: "forward",
    earSize: "up",
    horns: "outward",
    tailLength: "outward",
    tail: "outward",
  };
  for (const [name, file] of Object.entries(bodyFiles)) {
    const sex = name.split("-")[1];
    const weightsAt = (shape) => keyWeights({ shape: { ...looks.NEUTRAL_LOOK.shape, ...shape } }, sex, file.keys);
    assert.ok(
      Object.values(weightsAt({})).every((weight) => weight === 0),
      `the ${name} body with every slider at 0 is the model's own shape`,
    );
    for (const entry of SLIDERS) {
      const [key] = entry;
      if (!looks.hasSlider(key, file.keys, sex)) continue;
      const [least, most] = looks.sliderRange(entry, file.keys);
      // Its track: 0 in the middle of −1…1, or at the left end of 0…1, and back to the same value.
      assert.equal(looks.toTrack(0, [least, most]), 0);
      assert.equal(looks.toTrack(most, [least, most]), 1);
      assert.equal(looks.toTrack(least, [least, most]), least < 0 ? -1 : 0, `${key}'s left end on the ${name} body`);
      for (const at of [-1, -0.35, 0, 0.6, 1].filter((each) => each >= 0 || least < 0))
        assert.ok(Math.abs(looks.toTrack(looks.fromTrack(at, [least, most]), [least, most]) - at) < 1e-9);
      if (!BIGGER[key]) continue;
      const right = moved(file, weightsAt({ [key]: most }), BIGGER[key]);
      assert.ok(right > 0, `${key} to the right is bigger on the ${name} body (${right.toFixed(3)})`);
      if (least < 0) {
        const left = moved(file, weightsAt({ [key]: least }), BIGGER[key]);
        assert.ok(left < 0, `${key} to the left is smaller on the ${name} body (${left.toFixed(3)})`);
      }
    }
  }
  // The player starts with every slider at the model's own shape (NEUTRAL_LOOK under their look, main.js),
  // which is what Reset goes back to; townsfolk start from their name, so they differ.
  const neutral = avatarLook("Rowan", "male", looks.NEUTRAL_LOOK);
  assert.ok(
    Object.values(neutral.shape).every((value) => value === 0),
    "every shape slider at 0",
  );
  assert.deepEqual(neutral.limbs, { arms: 1, legs: 1, head: 1 });
  assert.equal(neutral.height, 1);
  assert.deepEqual(checkLook(looks.NEUTRAL_LOOK), looks.NEUTRAL_LOOK, "the neutral look is a checked look");
  const own = avatarLook("Rowan", "male", mergeLooks(looks.NEUTRAL_LOOK, { shape: { weight: 0.4 } }));
  assert.equal(own.shape.weight, 0.4, "a slider moved by hand sits on it");
  assert.equal(own.shape.muscle, 0);
  assert.ok(
    Object.values(avatarLook("Rowan", "male").shape).some((value) => value !== 0),
    "someone in town is a little off the middle",
  );

  // Townsfolk stay human unless their look or lore says otherwise.
  for (const name of ["Bram", "Ivy", "Hank", "Lena", "Odo", "Sera"])
    assert.equal(avatarLook(name).species, "human", `${name} is human unless said`);
  assert.deepEqual(lookFromWords(["looks wolfkin"]), { species: "wolf" });
  assert.deepEqual(lookFromWords("One of the wolf-folk of the north."), { species: "wolf" });
  assert.deepEqual(lookFromWords("A tall dragonborn smith."), { height: 1.08, species: "dragon" });
  assert.equal(readKeyword("ww:looks:dragonborn").problem, "");
  assert.equal(avatarLook("Bram", "auto", lookFromWords("wolfkin")).species, "wolf");
  assert.equal(
    avatarLook("Bram", "auto", mergeLooks(lookFromWords("wolfkin"), { species: "human" })).species,
    "human",
    "their Look card's choice sits on lore",
  );
}

console.log("wanderworld avatar: ok");
