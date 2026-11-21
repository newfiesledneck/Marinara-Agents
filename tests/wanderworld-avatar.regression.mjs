// Wanderworld's base avatar (src/avatar.js), from the kit files on disk (kit/generic/avatar, packed from
// assets/models/avatar-*.glb by `scripts/build-wanderworld-people.mjs --avatar`): both bodies with every
// shape key, a person built from each in Node (pictures stubbed), shape keys, limb lengths, underwear and
// outfit pieces applied, looks checked and older ones carried over, presets read back as written, and
// townsfolk's looks the same every time from their name and lore.
// Run: node tests/wanderworld-avatar.regression.mjs
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Box3, Vector3 } from "three";

const kitRoot = join(dirname(fileURLToPath(import.meta.url)), "../packages/wanderworld/kit");
const extra = new Map(); // kit files made up here (an outfit piece), by their path under kit/
globalThis.fetch = async (url) => {
  const name = String(url).split("/kit/")[1];
  if (extra.has(name)) return new Response(JSON.stringify(extra.get(name)), { status: 200 });
  try {
    return new Response(await readFile(join(kitRoot, name)), { status: 200 });
  } catch {
    return new Response("missing", { status: 404 });
  }
};
const image = () => ({ addEventListener() {}, removeEventListener() {}, setAttribute() {}, style: {} });
globalThis.document = { createElementNS: image, createElement: image };

const { avatarChoices, avatarLook, createAvatar } = await import("../packages/wanderworld/src/avatar.js");
const looks = await import("../packages/wanderworld/src/looks.js");
const { checkLook, checkPresets, mergeLooks, presetFile, readPresetFile, BUILT_IN_PRESETS, SKIN_TONES } = looks;
const { lookFromWords, readKeyword } = await import("../packages/wanderworld/src/keywords.js");
const { checkSetting } = await import("../packages/wanderworld/src/settings.js");
const { sexFor } = await import("../packages/wanderworld/src/people.js");

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
];
const PARTS = ["skin", "underwear", "eye_white", "iris", "eyebrows", "eyelashes", "lips", "nails"];
const files = {};
for (const sex of ["male", "female"]) {
  const file = JSON.parse(await readFile(join(kitRoot, `generic/avatar/avatar-${sex}.json`), "utf8"));
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
  // (Only one underwear top and one bottom are ever shown, so the body is counted without them, and each
  // underwear style on its own.)
  const isUnder = (mesh) => /^underwear-/u.test(mesh.piece ?? "");
  const vertices = file.meshes.filter((mesh) => !isUnder(mesh)).reduce((sum, mesh) => sum + mesh.count, 0);
  assert.ok(vertices < 32000, `the ${sex} body stays within its budget (${vertices} vertices)`);
  for (const mesh of file.meshes.filter(isUnder))
    assert.ok(
      mesh.count < 9000,
      `the ${sex} ${mesh.piece} ${mesh.part} stays within its budget (${mesh.count} vertices)`,
    );
}

// An outfit piece, made up here from the body's nails (the kit has none yet), to wear below.
{
  const nails = files.male.meshes.find((mesh) => mesh.part === "nails");
  extra.set("fantasy/avatar/avatar-outfits.json", {
    pieces: {
      vest: {
        hides: ["torso", "underwear"],
        male: { joints: files.male.joints, inverseBind: files.male.inverseBind, meshes: [nails] },
      },
    },
  });
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
    if (object.isSkinnedMesh && object.geometry.attributes.color) found = object;
  });
  return found;
};
const EVERYDAY = {
  shape: Object.fromEntries([...looks.SHAPES, ...looks.FACE].map(([key]) => [key, 0])),
  limbs: { arms: 1, legs: 1, head: 1 },
  height: 1,
};
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
  // (The body itself, not its hair: a kit with hair adds a draw or two.)
  person.object.traverse((object) => {
    if (object.isSkinnedMesh && object.name === "body") draws += object.geometry.groups.length || 1;
  });
  assert.ok(draws <= 3, `the ${sex} body is a few draws (${draws})`);
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

  // The outfit piece made up above hides the torso's skin and the underwear.
  assert.deepEqual((await avatarChoices("male")).clothes, ["vest"], "the kit's pieces are offered");
  const dressed = await createAvatar({ ...EVERYDAY, body: "male", clothes: ["vest", "cloak"] }, "Rowan");
  let meshes = 0;
  dressed.object.traverse((object) => object.isSkinnedMesh && meshes++);
  assert.equal(meshes, 2, "the body and the one piece the kit has");
  const under = files.male.meshes.find((mesh) => mesh.part === "underwear");
  assert.ok(count(male) - count(dressed) > under.count * 3, "the piece hides the underwear and the skin under it");
  for (const person of [female, bare, male, dressed]) person.dispose();
}

// ── Looks: checked and clamped, older ones carried over ─────────────────────
{
  const checked = checkLook({
    body: "wolf",
    shape: { weight: 5, jaw: -3, ears: 0.5, tail: 1 },
    limbs: { arms: 2, legs: 0.5, head: "big" },
    colours: { skin: 0x123456, eyes: -1, fur: 0xffffff },
    underwear: { top: "corset", bottom: "thong" },
    clothes: ["vest", "Vest!", 3, "vest"],
    preset: "  My look  ",
    wings: true,
  });
  assert.deepEqual(checked, {
    shape: { weight: 1, jaw: -0.5, ears: 0.5 },
    limbs: { arms: 1.15, legs: 0.85 },
    colours: { skin: 0x123456 },
    underwear: { bottom: "thong" },
    clothes: ["vest"],
    preset: "My look",
  });
  assert.equal(checkLook({ body: "female" }).body, "female");
  assert.deepEqual(checkLook({ underwear: { top: "none" } }), { underwear: { top: "none" } });
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

console.log("wanderworld avatar: ok");
