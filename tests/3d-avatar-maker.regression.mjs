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
  // (Every kit style is made for both bodies; afro is the older kit's only.)
  for (const [style] of HAIRSTYLES.filter(([style]) => style !== "afro"))
    assert.ok(choices.hair.includes(style), `${body}: the kit has hair ${style}`);
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
  /** A mask PNG as written by the masks script (RGB, every row unfiltered): its width and (x, y, channel) → byte. */
  const maskOf = async (name) => {
    const png = await readFile(join(kitRoot, `avatar/${name}`));
    const width = png.readUInt32BE(16);
    let at = 8;
    const data = [];
    while (at < png.length) {
      const length = png.readUInt32BE(at);
      if (png.toString("latin1", at + 4, at + 8) === "IDAT") data.push(png.subarray(at + 8, at + 8 + length));
      at += 12 + length;
    }
    const rows = inflateSync(Buffer.concat(data));
    return { width, at: (x, y, c) => rows[y * (width * 3 + 1) + 1 + x * 3 + c] };
  };
  const lipsAt = {};
  for (const body of ["male", "female"]) {
    const { width, at } = await maskOf(`avatar-${body}-masks.png`);
    assert.equal(width, 2048, `${body}: masks are 2048 across, the size the skin is painted at`);
    lipsAt[body] = at;
    let lips = 0;
    for (let y = 0; y < width; y++) for (let x = 0; x < width; x++) if (at(x, y, 1) > 128) lips++;
    assert.ok(lips > 1000, `${body}: the mask has the lips (${lips} texels)`);
  }
  // The makeup mask, one for both bodies: red the eyeshadow, green the eyeliner, blue the blush, each in its
  // place in MakeHuman's skin layout (the eyes about x 1717, y 990 and 1127; the cheeks beside them, towards
  // the mouth), and none on another's place or the lips.
  {
    const { width, at } = await maskOf("avatar-makeup-masks.png");
    assert.equal(width, 2048, "the makeup mask is 2048 across");
    const places = {
      eyeshadow: { channel: 0, x: [1680, 1745], y: [945, 1175], least: 1000 },
      eyeliner: { channel: 1, x: [1695, 1740], y: [955, 1160], least: 1500 },
      blush: { channel: 2, x: [1710, 1870], y: [840, 1280], least: 10000 },
    };
    for (const [
      layer,
      {
        channel,
        x: [x0, x1],
        y: [y0, y1],
        least,
      },
    ] of Object.entries(places)) {
      let full = 0;
      let astray = 0;
      for (let y = 0; y < width; y++)
        for (let x = 0; x < width; x++) {
          const value = at(x, y, channel);
          if (!value) continue;
          if (value > 128) full++;
          if (x < x0 || x > x1 || y < y0 || y > y1) astray++;
          assert.ok(!lipsAt.female(x, y, 1) && !lipsAt.male(x, y, 1), `${layer} keeps off the lips (${x}, ${y})`);
          if (layer === "blush") assert.ok(!at(x, y, 0) && !at(x, y, 1), `the blush keeps off the eyes (${x}, ${y})`);
        }
      assert.ok(full >= least, `the ${layer} has its place (${full} texels at more than half)`);
      assert.equal(astray, 0, `the ${layer} stays in its place`);
    }
    // Both eyes have their eyeliner, each round its own oval.
    for (const eye of [990, 1127]) assert.ok(at(1717, eye, 1) > 200, `eyeliner at the eye at y ${eye}`);
  }
  const { canPaint, makeupLayers, makeupTexel } = await import("../packages/3d-avatar-maker/src/skin.js");
  assert.equal(canPaint(), false, "in Node there's no canvas, so the builder colours by vertex");
  // The makeup paints over: at full strength through a full mask a texel is the colour; half, half way; none, as it was.
  const layers = makeupLayers({ eyeliner: { colour: 0x102030, amount: 1 }, blush: { colour: 0xff0000, amount: 0.5 } });
  const texels = new Uint8ClampedArray([200, 100, 50, 255, 200, 100, 50, 255, 200, 100, 50, 255]);
  makeupTexel(texels, 0, layers, [0, 255, 0], 0); // eyeliner
  makeupTexel(texels, 4, layers, [0, 0, 255], 0); // blush
  makeupTexel(texels, 8, layers, [255, 0, 0], 0); // eyeshadow, which this makeup hasn't
  assert.deepEqual([...texels.subarray(0, 3)], [0x10, 0x20, 0x30], "full eyeliner is its colour");
  assert.deepEqual([...texels.subarray(4, 7)], [228, 50, 25], "half blush is half way to its colour");
  assert.deepEqual([...texels.subarray(8, 11)], [200, 100, 50], "no eyeshadow leaves the skin");
  assert.deepEqual(makeupLayers({}), [null, null, null], "no makeup, nothing to paint");

  // The hair masks: each body's three files, half the skin picture's size, every mask HAIR_MASKS names
  // there (each facial hair style's ground, the scalp, stubble's full beard), none on the lips, and the
  // smaller styles inside the full beard's ground.
  const { HAIR_MASKS, HAIR_MASK_FILES, STUBBLE_SHAPES, hairLayers, hairTexel } =
    await import("../packages/3d-avatar-maker/src/skin.js");
  for (const body of ["male", "female"]) {
    const files = await Promise.all(HAIR_MASK_FILES.map((_, n) => maskOf(`avatar-${body}-hair-masks-${n}.png`)));
    const count = {};
    for (const [name, [file, channel]] of Object.entries(HAIR_MASKS)) {
      const { width, at } = files[file];
      assert.equal(width, 1024, `${body}: the hair masks are 1024 across`);
      let full = 0;
      for (let y = 0; y < width; y++)
        for (let x = 0; x < width; x++) {
          const value = at(x, y, channel);
          if (value > 128) full++;
          if (value && lipsAt[body](x * 2, y * 2, 1) > 128 && name !== "scalp")
            assert.ok(value < 64, `${body}: ${name} keeps off the lips (${x}, ${y})`);
        }
      count[name] = full;
      assert.ok(full > 200, `${body}: the ${name} mask has its ground (${full} texels)`);
    }
    assert.ok(count["moustache-01"] < count["beard-05"], `${body}: a moustache grows on less than a goatee`);
    assert.ok(count["beard-05"] < count["beard-02"], `${body}: a goatee on less than a full beard`);
    assert.ok(count["beard-06"] < count["beard-02"], `${body}: mutton chops on less than a full beard`);
    assert.ok(count.scalp > count["beard-02"], `${body}: the scalp's mask is bigger than a beard's`);
  }
  // Under hair, the skin goes towards the hair's colour as far as the mask says; stubble adds fine hairs.
  const under = hairLayers({ facialHair: "beard-02", scalp: true, hair: 0x402010 });
  assert.deepEqual(
    under.map((layer) => layer.mask),
    [HAIR_MASKS.scalp, HAIR_MASKS["beard-02"]],
    "a hair style and a beard: the scalp's mask and the beard's",
  );
  const skinTexel = () => new Uint8ClampedArray([220, 180, 160, 255]);
  const beardOnly = under.filter((layer) => layer.mask === HAIR_MASKS["beard-02"]);
  const shaded = skinTexel();
  hairTexel(shaded, 0, beardOnly, [0, 255, 0], 0, 10, 10, 2048);
  assert.ok(shaded[0] < 120 && shaded[0] > 0x40, `under a beard the skin is near the hair's colour (${shaded[0]})`);
  const bare = skinTexel();
  hairTexel(bare, 0, beardOnly, [0, 0, 0], 0, 10, 10, 2048);
  assert.deepEqual([...bare.subarray(0, 3)], [220, 180, 160], "outside the mask the skin is as it was");
  assert.deepEqual(hairLayers({ facialHair: "none", scalp: false, hair: 0x402010 }), [], "no hair, nothing to paint");
  assert.deepEqual(
    STUBBLE_SHAPES.map(([shape]) => shape),
    looks.STUBBLE.map(([shape]) => shape),
    "the skin paints every stubble shape the look offers",
  );
  for (const [, mask] of STUBBLE_SHAPES) assert.ok(HAIR_MASKS[mask], `stubble's mask ${mask} is a hair mask`);
  // Stubble: some texels are fine hairs, darker than the shadow between them, and denser stubble has more.
  const hairsAt = (density) => {
    const [layer] = hairLayers({ facialHair: "none", hair: 0x201008, stubble: { shape: "heavy", density } });
    let hairs = 0;
    for (let x = 0; x < 400; x++) {
      const texel = skinTexel();
      hairTexel(texel, 0, [layer], [0, 0, 255], 0, x, 7, 2048);
      if (texel[0] < 120) hairs++;
    }
    return hairs;
  };
  assert.ok(
    hairsAt(1) > hairsAt(0.3) && hairsAt(0.3) > 0,
    `denser stubble, more hairs (${hairsAt(1)}, ${hairsAt(0.3)})`,
  );
}

// ── Facial hair and stubble in a look ──
{
  const { FACIAL_HAIR, STUBBLE, STUBBLE_DENSITY } = looks;
  // Every style id there has been still opens, the race presets' among them.
  for (const id of ["beard-01", "beard-02", "beard-03", "beard-04", "beard-05", "moustache-01", "beard-06"])
    assert.equal(checkLook({ facialHair: id }).facialHair, id, `${id} opens`);
  assert.ok(
    FACIAL_HAIR.some(([id]) => id === racePreset("dwarf", "male").facialHair),
    "the dwarf's beard is offered",
  );
  assert.equal(checkLook({ facialHair: "beard-99" }).facialHair, undefined, "an unknown style is left out");
  // Stubble: none unless chosen, one of its shapes, its density within 0 and 1 (missing: the usual), a colour
  // of its own or none.
  assert.equal(checkLook({ body: "male" }).stubble, undefined, "no stubble unless chosen");
  assert.deepEqual(checkLook({ stubble: { shape: "light" } }).stubble, { shape: "light", density: STUBBLE_DENSITY });
  assert.deepEqual(checkLook({ stubble: { shape: "heavy", density: 3, colour: 0x111111 } }).stubble, {
    shape: "heavy",
    density: 1,
    colour: 0x111111,
  });
  assert.equal(checkLook({ stubble: { shape: "short", density: -2 } }).stubble.density, 0, "density at least 0");
  assert.equal(checkLook({ stubble: { shape: "goatee", density: 0.12345 } }).stubble.density, 0.123, "rounded");
  for (const bad of [{ shape: "beard" }, { density: 0.5 }, "light", { shape: "light", colour: "red" }])
    assert.ok(
      !checkLook({ stubble: bad }).stubble || checkLook({ stubble: bad }).stubble.colour === undefined,
      `refused: ${JSON.stringify(bad)}`,
    );
  assert.equal(STUBBLE.length, 5, "light and heavy stubble, moustache and goatee shadows, a short beard");
}

// ── Makeup in a look: checked, bounded, and the made-up skins there were opening as their plain skin ──
{
  const { MADE_UP_SKINS, MAKEUP_LAYERS, MAKEUP_PRESETS, makeupPreset, readDesign } = looks;
  assert.equal(checkLook({ body: "female" }).makeup, undefined, "no makeup unless chosen");
  const checked = checkLook({
    makeup: {
      eyeshadow: { colour: 0x4577bc, amount: 1.7 }, // too strong: full
      eyeliner: { colour: 0x050505, amount: 0.12345 }, // rounded
      blush: { colour: 0xe584b2, amount: -0.3 }, // below none: none
      lipstick: { amount: 2 },
      glitter: { colour: 0xffffff, amount: 1 }, // not a layer
    },
  });
  assert.deepEqual(checked.makeup, {
    eyeshadow: { colour: 0x4577bc, amount: 1 },
    eyeliner: { colour: 0x050505, amount: 0.123 },
    lipstick: { amount: 1 },
  });
  for (const bad of [
    { eyeshadow: { colour: "blue", amount: 0.5 } },
    { eyeshadow: { colour: 0x1000000, amount: 0.5 } },
    { eyeshadow: { colour: 0x4577bc } },
    { eyeshadow: { colour: 0x4577bc, amount: "0.5" } },
    { eyeshadow: { colour: 0x4577bc, amount: 0 } },
    { eyeshadow: [0x4577bc, 0.5] },
    { lipstick: { amount: Number.NaN } },
  ])
    assert.equal(checkLook({ makeup: bad }).makeup, undefined, `refused: ${JSON.stringify(bad)}`);
  // The AI's design writes colours as "#rrggbb".
  assert.deepEqual(readDesign({ makeup: { blush: { colour: "#e584b2", amount: 0.5 } } }).makeup, {
    blush: { colour: 0xe584b2, amount: 0.5 },
  });
  // Every preset is in range, and a look keeps it as it is.
  assert.ok(MAKEUP_PRESETS.length >= 7, "a preset for each made-up skin there was");
  const layerNames = MAKEUP_LAYERS.map(([layer]) => layer);
  for (const [value, label, layers] of MAKEUP_PRESETS) {
    assert.ok(label && Object.keys(layers).length, `${value}: has a label and makeup`);
    for (const [layer, entry] of Object.entries(layers)) {
      if (layer === "lips") {
        assert.ok(Number.isInteger(entry) && entry >= 0 && entry <= 0xffffff, `${value}: its lips are a colour`);
        continue;
      }
      assert.ok(layerNames.includes(layer), `${value}: ${layer} is a layer`);
      const [colour, amount] = entry;
      assert.ok(Number.isInteger(colour) && colour >= 0 && colour <= 0xffffff, `${value}: its ${layer} is a colour`);
      assert.ok(amount > 0 && amount <= 1, `${value}: its ${layer} strength is in range (${amount})`);
    }
    const { makeup, lips } = makeupPreset(value);
    assert.deepEqual(checkLook({ makeup }).makeup, makeup, `${value}: kept as it is`);
    assert.equal(lips, layers.lips);
  }
  // A made-up skin there was opens as its plain skin with its preset's makeup and lipstick.
  for (const [old, [skin, preset]] of Object.entries(MADE_UP_SKINS)) {
    const look = checkLook({ body: skin === "caucasian" ? "male" : "female", skin: old });
    const { makeup, lips } = makeupPreset(preset);
    assert.equal(look.skin, skin, `${old} opens as ${skin}`);
    assert.deepEqual(look.makeup, makeup, `${old} brings the ${preset} makeup`);
    assert.equal(look.colours?.lips, lips, `${old} brings its lipstick`);
    assert.ok(
      looks.skinsFor(look.body).some(([value]) => value === skin) &&
        !looks.skinsFor("female").some(([value]) => value === old) &&
        !looks.skinsFor("male").some(([value]) => value === old),
      `${old}: its plain skin is offered, the made-up one no longer`,
    );
  }
  // …unless the look has makeup or lips of its own.
  const own = checkLook({ skin: "classic-makeup", makeup: {}, colours: { lips: 0x4a2a2a } });
  assert.deepEqual([own.skin, own.makeup, own.colours.lips], ["light", undefined, 0x4a2a2a]);
  // A lipstick's strength mixes its colour with the lips it's on; the built look carries the makeup.
  const { avatarLook } = await import("../packages/3d-avatar-maker/src/avatar.js");
  const lipstick = (amount) =>
    avatarLook(
      "a",
      "auto",
      checkLook({ body: "female", skin: "light", colours: { lips: 0x000000 }, makeup: { lipstick: { amount } } }),
    );
  assert.equal(lipstick(1).colours.lips, 0x000000, "full lipstick is its colour");
  assert.equal(lipstick(0.5).colours.lips, 0x808080, "half way to the skin picture's own lips (white: as painted)");
  assert.equal(lipstick(0).colours.lips, 0xffffff, "none: the picture's own lips");
  assert.deepEqual(lipstick(1).makeup, { lipstick: { amount: 1 } });
}

// ── A figure stands on the floor, on a full humanoid skeleton, in each pose ──
const startOf = (body, over = {}) => checkLook({ ...NEUTRAL_LOOK, body, ...over });
/** Every style in `styles` is worn on `body` from its bundle: a figure wearing it has more meshes than a bald one. */
async function offeredHairLoads(body, styles) {
  const drawn = async (hair) => {
    const figure = await createAvatar(startOf(body, { hair }), "Test", "auto");
    const result = [figure.meshes.length, figure.avatar.hair];
    figure.dispose();
    return result;
  };
  const [bald] = await drawn("none");
  for (const style of styles) {
    const [count, worn] = await drawn(style);
    assert.equal(worn, style, `${body}: hair ${style} is the look's`);
    assert.ok(count > bald, `${body}: hair ${style} loads from its bundle`);
  }
}
for (const body of ["male", "female"])
  await offeredHairLoads(
    body,
    (await avatarChoices(body)).hair.filter((style) => style !== "none"),
  );
/**
 * Hair style `hair` on `body`: if it `swings`, its locks hang on chains, rest exactly where they were made, clear of
 * every collider, hold the style standing still, swing as the head turns and settle again; if not, no springs.
 */
async function hairMoves(body, hair, swings) {
  const { Vector3 } = await import("three");
  const { createSprings } = await import("../packages/3d-avatar-maker/src/springs.js");
  const { movingPose } = await import("../packages/3d-avatar-maker/src/figure.js");
  const tips = (figure) =>
    figure.springs.flatMap((spring) => spring.bones.slice(1).map((bone) => bone.getWorldPosition(new Vector3())));
  const furthest = (a, b) => Math.max(...a.map((point, i) => point.distanceTo(b[i])));
  // (Nothing worn, so no skirt swings beside the hair; the bust's springs are told apart by name.)
  const figure = await createAvatar(startOf(body, { hair, clothes: [] }), "Test", "auto");
  const label = `${body} ${hair}`;
  const hairSprings = figure.springs.filter((spring) => spring.name.startsWith("Hair"));
  if (!swings) {
    assert.equal(hairSprings.length, 0, `${label}: a short cut stays as it is`);
    figure.dispose();
    return;
  }
  assert.ok(hairSprings.length > 0, `${label}: its locks hang on chains`);
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
          const t = line.lengthSq() ? Math.max(0, Math.min(1, at.clone().sub(start).dot(line) / line.lengthSq())) : 0;
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
  const dress = await createAvatar(startOf("female", { hair: "none", clothes: ["dress"] }), "Test", "auto");
  for (const one of [tiefling, longHair, dress])
    for (const mesh of one.meshes) for (const material of [mesh.material].flat()) material.map = null;
  for (const [name, figure] of Object.entries({ plain: made.plain, dwarf: made.dwarf, tiefling, longHair, dress })) {
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
    if (name === "dress") {
      // (The dress's chains, with capsules on the thighs and calves among the colliders they meet: one for
      // each half of each, as thick as the leg is there.)
      const { springs, colliders, colliderGroups } = json.extensions.VRMC_springBone;
      assert.ok(
        springs.filter((spring) => spring.name.startsWith("Dress (")).length >= 3,
        "the dress hangs on springs",
      );
      const legs = colliders.filter((collider) => /^(?:thigh|calf)_[lr]$/u.test(json.nodes[collider.node].name));
      assert.ok(legs.length === 8 && legs.every((collider) => collider.shape.capsule), "with capsules on the legs");
      assert.ok(
        ["Bust (left)", "Bust (right)"].every((bust) => springs.some((spring) => spring.name === bust)),
        "and her bust on springs too",
      );
      // (Each breast's ball, as big as the figure's, meets capsules on both arms and hands.)
      for (const name of ["Bust (left)", "Bust (right)"]) {
        const spring = springs.find((one) => one.name === name);
        const own = figure.springs.find((one) => one.name === name);
        assert.equal(spring.joints[0].hitRadius, own.joint.hitRadius, `${name}: its ball's size in the VRM`);
        const met = (spring.colliderGroups ?? []).flatMap((group) => colliderGroups[group].colliders);
        const bones = met.map((at) => json.nodes[colliders[at].node].name);
        for (const bone of ["upperarm_l", "lowerarm_l", "hand_l", "upperarm_r", "lowerarm_r", "hand_r"])
          assert.ok(bones.includes(bone), `${name} meets ${bone}'s collider in the VRM`);
        assert.ok(
          met.every((at) => colliders[at].shape.capsule),
          `${name}'s colliders are capsules`,
        );
      }
    }
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
      // (The bust, its balls clear of the arms' capsules in the T-pose, stays exactly where it rests.)
      figure.springs.forEach((spring, i) => {
        if (!spring.name.startsWith("Bust (")) return;
        const off = ends[i].getWorldPosition(new Vector3()).distanceTo(start[i]);
        assert.ok(off < 0.0005, `${name}: three-vrm holds ${spring.name} at rest (${(off * 1000).toFixed(2)} mm)`);
      });
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
  dress.dispose();

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
    // Each eye turns about the middle of its eyeball, whatever the sliders (a female look turned male once put
    // it 7 to 11 mm off, and a glance swung the iris up under the lid), and the eyeball rests where it was made.
    {
      const { sphereThrough } = await import("../packages/3d-avatar-maker/src/avatar.js");
      const sliders = [...looks.SHAPES, ...looks.FACE, ...looks.FACE_DETAIL].map(([key]) => key);
      const shape = Object.fromEntries(sliders.map((key, i) => [key, ((i * 37) % 21) / 10 - 1]));
      // (The head as built: a bigger one moves the eyeballs out with it, by design.)
      const female = startOf("female", { shape });
      for (const look of [female, checkLook({ ...female, body: "male" })]) {
        const one = await createAvatar(look, "Test", "auto");
        one.root.updateMatrixWorld(true);
        const body = one.meshes.find((mesh) => mesh.name === "body");
        const { position } = body.geometry.attributes;
        for (const side of ["l", "r"]) {
          const bone = one.bones.get(`eye_${side}`);
          const left = bone.getWorldPosition(new Vector3()).x > 0;
          const points = [];
          let off = 0;
          for (const mesh of one.kit.meshes.filter((each) => each.part === "eye_white"))
            for (let v = mesh.start; v < mesh.start + mesh.count; v++) {
              const listed = new Vector3().fromBufferAttribute(position, v).applyMatrix4(body.matrixWorld);
              const p = body
                .applyBoneTransform(v, new Vector3().fromBufferAttribute(position, v))
                .applyMatrix4(body.matrixWorld);
              off = Math.max(off, p.distanceTo(listed));
              if (p.x > 0 === left) points.push(p);
            }
          const gap = sphereThrough(points).centre.distanceTo(bone.getWorldPosition(new Vector3()));
          assert.ok(
            gap < 0.0005,
            `${look.body}: eye_${side} turns about its eyeball's middle (off by ${(gap * 1000).toFixed(1)} mm)`,
          );
          assert.ok(
            off < 0.0005,
            `${look.body}: the eyeballs rest where they were made (off by ${(off * 1000).toFixed(2)} mm)`,
          );
        }
        one.dispose();
      }
    }
    figure.dispose();
  }

  // ── Hair movement: chains through the hanging locks, springs, colliders (hair.js, springs.js) ──
  {
    const { SWINGING_HAIR } = await import("../packages/3d-avatar-maker/src/hair.js");
    // (Every kit style each body is offered: the ones in SWINGING_HAIR swing, the rest stay as they are.)
    for (const body of ["female", "male"])
      for (const hair of (await avatarChoices(body)).hair.filter((style) => style !== "none"))
        await hairMoves(body, hair, SWINGING_HAIR.has(hair));
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

  // ── Clothes that hang: skirts, dresses, robes, coats and cloaks on chains (hair.js, springs.js) ──
  {
    const { HANGING_CLOTH } = await import("../packages/3d-avatar-maker/src/hair.js");
    const { CLOTH_JOINT, createSprings } = await import("../packages/3d-avatar-maker/src/springs.js");
    const { movingPose } = await import("../packages/3d-avatar-maker/src/figure.js");
    const { geometryOf, load } = await import("../packages/3d-avatar-maker/src/kitfiles.js");
    const index = JSON.parse(await readFile(join(kitRoot, "wardrobe/avatar-outfits-index.json"), "utf8"));
    const clothOf = (figure) => figure.springs.filter((spring) => spring.joint === CLOTH_JOINT);
    const hanging = (one) =>
      one.meshes.find((mesh) => mesh.skeleton.bones.some((bone) => bone.name.startsWith("cloth_")));
    /** How far a point at `at` is inside a capsule or ball (its middle's distance short of its radius). */
    const into = (collider, at, pad = 0) => {
      const start = collider.offset.clone().applyMatrix4(collider.bone.matrixWorld);
      const end = (collider.tail ?? collider.offset).clone().applyMatrix4(collider.bone.matrixWorld);
      const line = end.clone().sub(start);
      const t = line.lengthSq() ? Math.max(0, Math.min(1, at.clone().sub(start).dot(line) / line.lengthSq())) : 0;
      return collider.radius + pad - at.distanceTo(start.addScaledVector(line, t));
    };
    // Trousers, leggings and shorts follow each leg as they were fitted: no chains.
    for (const piece of ["trousers", "leggings", "shorts", "mh_jeans", "mh_female_jeans"]) {
      const body = index[piece].bodies[0];
      const figure = await createAvatar(startOf(body, { clothes: [piece], hair: "none" }), "Test", "auto");
      assert.equal(clothOf(figure).length, 0, `${piece}: follows the legs, with no chains`);
      figure.dispose();
    }
    for (const body of ["female", "male"])
      for (const piece of HANGING_CLOTH.keys()) {
        if (!index[piece]?.bodies.includes(body)) continue;
        const label = `${body} ${piece}`;
        const figure = await createAvatar(startOf(body, { clothes: [piece], hair: "none" }), "Test", "auto");
        const springs = clothOf(figure);
        assert.ok(springs.length >= 3, `${label}: its cloth hangs on chains (${springs.length})`);
        // Bound where it was fitted: every point drawn where it was made, and its weights whole.
        const mesh = hanging(figure);
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
        assert.ok(off < 0.001, `${label}: rests where it was fitted (off by ${off.toFixed(5)})`);
        assert.equal(unweighted, 0, `${label}: every point's weights add up to one`);
        // No collider a chain meets holds one of its joints at rest, as built or in the T-pose, and each meets
        // both legs.
        for (const spring of springs)
          assert.ok(
            ["thigh_l", "thigh_r", "calf_l", "calf_r"].every((bone) =>
              spring.colliders.some((collider) => collider.bone.name === bone),
            ),
            `${label}: ${spring.name} meets the thighs and calves`,
          );
        for (const pose of [restPose, tPose]) {
          pose(figure);
          for (const spring of springs)
            for (const bone of spring.bones.slice(1))
              for (const collider of spring.colliders)
                assert.ok(
                  into(collider, bone.getWorldPosition(new Vector3()), spring.joint.hitRadius) < 0,
                  `${label}: ${bone.name} rests clear of ${collider.bone.name}'s collider`,
                );
        }
        // Swinging: still, it keeps its drape; as the hips turn and a knee lifts, it swings, its joints no deeper
        // in the legs than they rest; standing still again, it settles within two seconds.
        const legs = [...new Set(springs.flatMap((spring) => spring.colliders))].filter((collider) =>
          /^(?:thigh|calf)_/u.test(collider.bone.name),
        );
        const joints = springs.flatMap((spring) => spring.bones.slice(1));
        const tips = () => joints.map((bone) => bone.getWorldPosition(new Vector3()));
        const depth = (at) => Math.max(0, ...legs.map((collider) => into(collider, at)));
        const furthest = (a, b) => Math.max(...a.map((at, i) => at.distanceTo(b[i])));
        relaxedPose(figure, 0);
        const moving = createSprings(figure);
        const rest = tips();
        const resting = rest.map(depth);
        for (let f = 0; f < 120; f++) {
          relaxedPose(figure, 0);
          moving.step(1 / 60);
        }
        const hung = tips();
        assert.ok(
          furthest(hung, rest) < 0.015,
          `${label}: keeps its drape at rest (${furthest(hung, rest).toFixed(3)} m)`,
        );
        // (How each of its bones hangs, to measure the swing from.)
        const turning = springs.flatMap((spring) => spring.bones);
        const still = turning.map((bone) => bone.quaternion.clone());
        let swung = 0;
        let deeper = 0;
        for (let f = 0; f < 600; f++) {
          movingPose(figure, f / 60);
          moving.step(1 / 60);
          const now = tips();
          now.forEach((at, i) => (deeper = Math.max(deeper, depth(at) - resting[i])));
          const held = turning.map((bone) => bone.quaternion.clone());
          turning.forEach((bone, i) => bone.quaternion.copy(still[i]));
          figure.root.updateMatrixWorld(true);
          swung = Math.max(swung, furthest(now, tips()));
          turning.forEach((bone, i) => bone.quaternion.copy(held[i]));
          figure.root.updateMatrixWorld(true);
        }
        // (A tunic's short tails swing least: about 1.5 cm on him, 4.5 on her; a long skirt's hem up to 40.)
        assert.ok(swung > 0.01, `${label}: swings as the hips turn and a knee lifts (${(swung * 100).toFixed(1)} cm)`);
        // (Half a centimetre: a chain that rests on a leg meets no collider of that leg, so the cloth beside it
        // can draw it a few millimetres into one that the other chains meet.)
        assert.ok(deeper < 0.005, `${label}: its joints go no deeper into the legs (${(deeper * 100).toFixed(2)} cm)`);
        for (let f = 0; f < 120; f++) {
          relaxedPose(figure, 0);
          moving.step(1 / 60);
        }
        const unsettled = furthest(tips(), hung);
        assert.ok(unsettled < 0.005, `${label}: and settles within two seconds (${(unsettled * 100).toFixed(2)} cm)`);
        figure.dispose();
      }
    // A skirt hangs from the waist, above the hip joints, on sixteen chains round; and as she walks, the chains
    // stay together as one piece of cloth: over the thighs (its first four rows), no two side by side are drawn
    // far further apart than they rest. (Its hem can be: a heel that kicks back pushes one chain's end out
    // further than the next chain, at its own length, can follow.)
    {
      const { motionPose } = await import("../packages/3d-avatar-maker/src/motions.js");
      const figure = await createAvatar(startOf("female", { clothes: ["skirt"], hair: "none" }), "Test", "auto");
      const chains = clothOf(figure).sort((one, other) => one.side - other.side);
      assert.equal(chains.length, 16, "a skirt has sixteen chains round");
      restPose(figure);
      const hip = figure.humanoid.leftUpperLeg.getWorldPosition(new Vector3()).y;
      const roots = chains.map((spring) => spring.bones[0].getWorldPosition(new Vector3()).y);
      assert.ok(Math.min(...roots) > hip, `its chains hang from over the hip joints (${Math.min(...roots) - hip} m)`);
      const tips = () =>
        chains.map((spring) => spring.bones.slice(0, 5).map((bone) => bone.getWorldPosition(new Vector3())));
      const apart = (all) =>
        all.flatMap((chain, i) => chain.map((at, k) => at.distanceTo(all[(i + 1) % all.length][k] ?? at)));
      const rests = apart(tips());
      motionPose(figure, "walk", 0);
      const moving = createSprings(figure); // (from rest in the walk's first pose, as the preview starts one)
      let widest = 0;
      for (let f = 0; f < 150; f++) {
        motionPose(figure, "walk", f / 30);
        moving.step(1 / 30);
        apart(tips()).forEach((gap, i) => (widest = Math.max(widest, gap - rests[i])));
      }
      // (About 13 cm at the most, where a thigh lifts one chain and the next lies beside the leg; each on its
      // own, as they were, a carried chain left its neighbours 30 cm and more behind.)
      assert.ok(widest < 0.16, `walking, no two chains side by side part far (${(widest * 100).toFixed(1)} cm)`);
      figure.dispose();
    }
    // On longer legs, the skirt rests where its own weights put it, so nothing tears where cloth that grew with
    // the legs meets cloth that didn't.
    {
      const plain = await createAvatar(startOf("female", { clothes: ["skirt"], hair: "none" }), "Test", "auto");
      const position = hanging(plain).geometry.attributes.position.clone();
      plain.dispose();
      const look = startOf("female", { clothes: ["skirt"], hair: "none", limbs: { legs: 1.15 } });
      const figure = await createAvatar(look, "Test", "auto");
      const mesh = hanging(figure);
      const made = geometryOf((await load("avatar-outfits-legs.pack.png")).pieces.skirt.female.meshes[0]);
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
      assert.ok(off < 0.0005, `a long-legged skirt rests where it did (off by ${off.toFixed(5)})`);
      figure.dispose();
    }
  }

  // ── A bust that moves: a spring bone in each breast, and what's worn over it moving with it (bust.js) ──
  {
    const { createSprings } = await import("../packages/3d-avatar-maker/src/springs.js");
    const { movingPose } = await import("../packages/3d-avatar-maker/src/figure.js");
    const bustOf = (figure) => figure.springs.filter((spring) => spring.name.startsWith("Bust ("));
    const build = (body, shape = {}, clothes = []) =>
      createAvatar(
        startOf(body, { shape: { ...startOf(body).shape, ...shape }, clothes, hair: "none" }),
        "Test",
        "auto",
      );
    // His chest only when it stands out as far as a small bust does: none as built, one with the fullest chest.
    for (const [shape, has] of [
      [{}, false],
      [{ muscle: 1, chest: 1 }, false],
      [{ chest: 1, race_halforc: 1 }, true],
    ]) {
      const figure = await build("male", shape);
      assert.equal(bustOf(figure).length, has ? 2 : 0, `his chest ${JSON.stringify(shape)}: ${has ? "a" : "no"} bust`);
      figure.dispose();
    }
    for (const [shape, clothes] of [
      [{}, ["t_shirt"]],
      [{ chest: 1, bust_height: 1, bust_shape: 1 }, ["dress"]],
    ]) {
      const label = `her bust ${JSON.stringify(shape)} under ${clothes}`;
      const figure = await build("female", shape, clothes);
      const springs = bustOf(figure);
      assert.equal(springs.length, 2, `${label}: a spring each side`);
      const skin = figure.meshes.find((mesh) => mesh.name === "body");
      const top = figure.meshes.find(
        (mesh) => mesh !== skin && mesh.skeleton.bones.some((bone) => bone.name === "breast_l"),
      );
      assert.ok(top, `${label}: the top over it moves with it`);
      // Bound where it rests, skin and top, with whole weights.
      const point = new Vector3();
      for (const mesh of [skin, top]) {
        const { position, skinWeight } = mesh.geometry.attributes;
        let off = 0;
        let unweighted = 0;
        for (let i = 0; i < position.count; i++) {
          const listed = point.fromBufferAttribute(position, i).clone().applyMatrix4(mesh.matrixWorld);
          mesh.applyBoneTransform(i, point.fromBufferAttribute(position, i));
          off = Math.max(off, point.applyMatrix4(mesh.matrixWorld).distanceTo(listed));
          const sum = [0, 1, 2, 3].reduce((total, c) => total + skinWeight.getComponent(i, c), 0);
          if (Math.abs(sum - 1) > 1e-4) unweighted++;
        }
        assert.ok(off < 0.001, `${label}: the ${mesh.name} rests where it was (off by ${off.toFixed(5)})`);
        assert.equal(unweighted, 0, `${label}: every point's weights add up to one`);
      }
      // The top's points over the bust, each with the skin point nearest it, to see that it stays outside.
      const fronts = springs.map((spring) => spring.bones[1].getWorldPosition(new Vector3()));
      const near = (at, most) => fronts.some((front) => front.distanceTo(at) < most);
      const skinAt = (i) => new Vector3().fromBufferAttribute(skin.geometry.attributes.position, i);
      const skinNear = [];
      for (let j = 0; j < skin.geometry.attributes.position.count; j++) if (near(skinAt(j), 0.1)) skinNear.push(j);
      const pairs = [];
      for (let i = 0; i < top.geometry.attributes.position.count; i++) {
        const at = new Vector3().fromBufferAttribute(top.geometry.attributes.position, i);
        if (!near(at, 0.08)) continue;
        let [best, gap] = [-1, Infinity];
        for (const j of skinNear) {
          const d = skinAt(j).distanceTo(at);
          if (d < gap) [best, gap] = [j, d];
        }
        const normal = new Vector3().fromBufferAttribute(skin.geometry.attributes.normal, best);
        if (at.clone().sub(skinAt(best)).dot(normal) > 0) pairs.push([i, best, normal]);
      }
      /** How far the top is behind the skin under it at its deepest, as it stands now (0 if outside). */
      const through = () => {
        let most = 0;
        const [a, b, n] = [new Vector3(), new Vector3(), new Vector3()];
        for (const [i, j, normal] of pairs) {
          skin.applyBoneTransform(j, a.copy(skinAt(j)));
          skin.applyBoneTransform(j, n.copy(skinAt(j)).addScaledVector(normal, 0.01));
          n.sub(a).normalize();
          top.applyBoneTransform(i, b.fromBufferAttribute(top.geometry.attributes.position, i));
          most = Math.max(most, -b.sub(a).dot(n));
        }
        return most;
      };
      const bones = springs.flatMap((spring) => spring.bones);
      const tips = () => springs.map((spring) => spring.bones[1].getWorldPosition(new Vector3()));
      const furthest = (a, b) => Math.max(...a.map((at, i) => at.distanceTo(b[i])));
      // Still, it rests as shaped; as the body turns it sways a little, the top with it; still again, it settles.
      relaxedPose(figure, 0);
      const moving = createSprings(figure);
      const rest = tips();
      for (let f = 0; f < 60; f++) {
        relaxedPose(figure, 0);
        moving.step(1 / 60);
      }
      assert.ok(furthest(tips(), rest) < 0.0005, `${label}: rests as shaped`);
      let swayed = 0;
      let deeper = 0;
      for (let f = 0; f < 600; f++) {
        movingPose(figure, f / 60);
        moving.step(1 / 60);
        const now = tips();
        const sunk = through();
        const held = bones.map((bone) => bone.quaternion.clone());
        for (const bone of bones) bone.quaternion.copy(figure.rest.get(bone.name));
        figure.root.updateMatrixWorld(true);
        swayed = Math.max(swayed, furthest(now, tips()));
        deeper = Math.max(deeper, sunk - through());
        bones.forEach((bone, i) => bone.quaternion.copy(held[i]));
        figure.root.updateMatrixWorld(true);
      }
      assert.ok(swayed > 0.001 && swayed < 0.01, `${label}: sways a little (${(swayed * 1000).toFixed(1)} mm)`);
      assert.ok(deeper < 0.0005, `${label}: the top stays outside it as it sways (${(deeper * 1000).toFixed(2)} mm)`);
      for (let f = 0; f < 60; f++) {
        relaxedPose(figure, 0);
        moving.step(1 / 60);
      }
      assert.ok(furthest(tips(), rest) < 0.0005, `${label}: and settles within a second`);

      // The arms press on it: each breast meets capsules on both upper arms, forearms and hands, and none holds
      // its ball at rest, as built, in the T-pose or with the arms hanging relaxed.
      for (const spring of springs) {
        const met = new Set(spring.colliders.map((collider) => collider.bone.name));
        for (const bone of ["upperarm", "lowerarm", "hand"].flatMap((name) => [`${name}_l`, `${name}_r`]))
          assert.ok(met.has(bone), `${label}: ${spring.name} meets ${bone}'s collider`);
      }
      for (const pose of [restPose, tPose, (one) => relaxedPose(one, 0)]) {
        pose(figure);
        for (const spring of springs)
          for (const collider of spring.colliders) {
            const at = spring.bones[1].getWorldPosition(new Vector3());
            const start = collider.offset.clone().applyMatrix4(collider.bone.matrixWorld);
            const line = collider.tail.clone().applyMatrix4(collider.bone.matrixWorld).sub(start);
            const t = Math.max(0, Math.min(1, at.clone().sub(start).dot(line) / line.lengthSq()));
            const gap = at.distanceTo(start.addScaledVector(line, t)) - collider.radius - spring.joint.hitRadius;
            assert.ok(gap > 0, `${label}: ${spring.name} rests clear of ${collider.bone.name}'s collider`);
          }
      }
      // Arms folded (motions.js), on the same body bare (the skin under a top isn't drawn): the bust is pushed
      // and the forearms stay outside its skin; the hands, tucked against its outer side, go less deep into it
      // than with the bust left as it rests. Lowered again, it settles.
      {
        const bare = await build("female", shape);
        const body = bare.meshes.find((mesh) => mesh.name === "body");
        const breasts = bustOf(bare);
        const own = breasts.flatMap((spring) => spring.bones);
        const ends = () => breasts.map((spring) => spring.bones[1].getWorldPosition(new Vector3()));
        const isBust = new Set(body.skeleton.bones.flatMap((bone, i) => (bone.name.startsWith("breast_") ? [i] : [])));
        const armOf = (name) =>
          /^upperarm_/u.test(name)
            ? "upper"
            : /^lowerarm_/u.test(name)
              ? "fore"
              : /^(?:hand|index|middle|ring|pinky|thumb)_/u.test(name)
                ? "hand"
                : null;
        const { position, normal, skinIndex: index, skinWeight: weight } = body.geometry.attributes;
        const breastPoints = [];
        const armPoints = [];
        for (const v of new Set(body.geometry.index.array)) {
          let [onBust, most] = [0, 0];
          for (let c = 0; c < 4; c++) {
            if (isBust.has(index.getComponent(v, c))) onBust += weight.getComponent(v, c);
            if (weight.getComponent(v, c) > weight.getComponent(v, most)) most = c;
          }
          if (onBust > 0.45) breastPoints.push(v);
          const part = armOf(body.skeleton.bones[index.getComponent(v, most)].name);
          if (part) armPoints.push([v, part]);
        }
        const placed = (v, out, along = 0) =>
          body
            .applyBoneTransform(
              v,
              out.fromBufferAttribute(position, v).addScaledVector(new Vector3().fromBufferAttribute(normal, v), along),
            )
            .applyMatrix4(body.matrixWorld);
        /** How deep each part of the arms is under the breasts' skin at its deepest, as the body stands now. */
        const under = () => {
          bare.root.updateMatrixWorld(true);
          const faces = breastPoints.map((v) => {
            const at = placed(v, new Vector3());
            return [at, placed(v, new Vector3(), 0.01).sub(at).normalize()];
          });
          const most = { upper: 0, fore: 0, hand: 0 };
          const a = new Vector3();
          for (const [v, part] of armPoints) {
            placed(v, a);
            let [best, gap] = [null, 0.04 ** 2];
            for (const face of faces) {
              const d = face[0].distanceToSquared(a);
              if (d < gap) [best, gap] = [face, d];
            }
            if (best) most[part] = Math.max(most[part], -a.sub(best[0]).dot(best[1]));
          }
          return most;
        };
        const { createMotionPlayer } = await import("../packages/3d-avatar-maker/src/motions.js");
        const player = createMotionPlayer();
        relaxedPose(bare, 0);
        const pressing = createSprings(bare);
        const resting = ends();
        player.play(bare, "fold-arms");
        const deepest = { pushed: { upper: 0, fore: 0, hand: 0 }, resting: { upper: 0, fore: 0, hand: 0 } };
        let pushed = 0;
        for (let f = 1; f <= 150; f++) {
          player.step(bare, 1 / 60, () => relaxedPose(bare, 0));
          pressing.step(1 / 60);
          if (f % 10) continue;
          const now = ends();
          const mostNow = under();
          const held = own.map((bone) => [bone.quaternion.clone(), bone.position.clone(), bone.scale.clone()]);
          for (const bone of own) {
            bone.quaternion.copy(bare.rest.get(bone.name));
            bone.position.copy(bare.restAt.get(bone.name));
            bone.scale.setScalar(1);
          }
          bare.root.updateMatrixWorld(true);
          pushed = Math.max(pushed, furthest(now, ends()));
          const mostResting = under();
          own.forEach((bone, i) => {
            bone.quaternion.copy(held[i][0]);
            bone.position.copy(held[i][1]);
            bone.scale.copy(held[i][2]);
          });
          bare.root.updateMatrixWorld(true);
          for (const part of ["upper", "fore", "hand"]) {
            deepest.pushed[part] = Math.max(deepest.pushed[part], mostNow[part]);
            deepest.resting[part] = Math.max(deepest.resting[part], mostResting[part]);
          }
        }
        const mm = (x) => (x * 1000).toFixed(1);
        assert.ok(pushed > 0.005, `${label}: folded arms push the bust (${mm(pushed)} mm)`);
        // (Within a centimetre: one ball under each breast's skin can't fill a large one's sides, so where an arm
        // presses beyond it, the skin it meets gives way only as the ball does.)
        assert.ok(
          deepest.pushed.fore < 0.01 && deepest.pushed.fore <= deepest.resting.fore / 2 + 0.001,
          `${label}: the forearms stay outside it (${mm(deepest.pushed.fore)} mm; ${mm(deepest.resting.fore)} unpushed)`,
        );
        assert.ok(
          deepest.pushed.hand < deepest.resting.hand - 0.002,
          `${label}: the hands go less deep into it (${mm(deepest.pushed.hand)} mm; ${mm(deepest.resting.hand)} unpushed)`,
        );
        player.stop(bare);
        for (let f = 0; f < 90; f++) {
          player.step(bare, 1 / 60, () => relaxedPose(bare, 0));
          pressing.step(1 / 60);
        }
        assert.ok(furthest(ends(), resting) < 0.0005, `${label}: and settles once they're lowered`);
        assert.ok(
          own.every(
            (bone) => Math.abs(bone.scale.x - 1) + Math.abs(bone.scale.y - 1) + Math.abs(bone.scale.z - 1) < 1e-6,
          ),
          `${label}: unsquashed`,
        );
        bare.dispose();
      }
      restPose(figure);
      // A GLB keeps the bones and their weights.
      for (const mesh of figure.meshes) for (const material of [mesh.material].flat()) material.map = null;
      const { json } = readGlb((await exportGlb(figure, { look: {} })).bytes);
      const named = new Set(json.skins.flatMap((one) => one.joints.map((at) => json.nodes[at].name)));
      assert.ok(
        ["breast_l", "breast_r"].every((name) => named.has(name)),
        `${label}: a GLB keeps the bust's bones`,
      );
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
  // Its hair styles: every one accepted and credited, offered and worn on each body it's for, and the ones
  // that hang swing on chains (hairMoves), the rest staying as they are.
  const { readHair } = await import("../packages/3d-avatar-maker/src/packs.js");
  const styles = readHair({ id, version: manifest.version, status: "active", manifest }, index);
  assert.equal(
    styles.length,
    Object.keys(index.hair ?? {}).length,
    "every hair style of the Accessories pack is accepted",
  );
  for (const each of styles)
    assert.ok(each.credit?.includes(`by ${each.author} (`), `${each.style}: CC BY, with its author credited`);
  looks.addHair(styles);
  for (const body of ["male", "female"]) {
    const mine = styles.filter((each) => each.bodies.includes(body));
    const offered = (await avatarChoices(body)).hair;
    for (const { style } of mine) assert.ok(offered.includes(style), `${body}: the Hair tab offers ${style}`);
    await offeredHairLoads(
      body,
      mine.map(({ style }) => style),
    );
    for (const { style, swing } of mine) await hairMoves(body, style, swing !== null);
  }
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
  for (const slot of ["necklace", "wrists", "ankles", "belly", "horns", "on_back", "tail", "hip", "hand_right"])
    assert.ok(slots.has(slot), `the pack has something to wear in "${slot}"`);
  // What covers what (looks.js COVERED_BY), with the pack's own pieces and the kit's.
  for (const [over, under, what] of [
    ["toigo_gloves_short", "elvs_bangle_bracelet1", "gloves hide a bangle"],
    ["bracers", "punkduck_bracelet_infinity_love", "bracers hide a bracelet"],
    ["joepal_crude_low_socks", "elvs_braided_anklet1", "socks hide an anklet"],
    ["scarf", "punkduck_spike_collar", "a scarf hides a collar"],
    ["dress", "wojackowl_belly_piercing", "a dress hides a belly piercing"],
    ["elvs_tophat1", "elvs_deer_antlers_1", "a hat hides antlers"],
  ])
    assert.equal(await meshes({ clothes: [over, under] }), await meshes({ clothes: [over] }), what);
  // Every piece is worn on each body it's for, and one fixed to a bone (its own, or its slot's: a held thing to
  // the hand, horns to the head) is drawn bound to that bone alone.
  // (Bald, with bare nails, so a piece that hides the hair or the nails still adds a mesh.)
  const worn = async (body, clothes) => {
    const look = startOf(body, { clothes, hair: "none", nails: "none", toenails: false });
    const figure = await createAvatar(look, "Test", "auto");
    const alone = figure.meshes
      .filter((mesh) => mesh.skeleton?.bones.length === 1)
      .map((mesh) => mesh.skeleton.bones[0].name);
    const count = figure.meshes.length;
    figure.dispose();
    return { count, alone };
  };
  const unworn = { male: await worn("male", []), female: await worn("female", []) };
  for (const { piece, slot, bone, bodies } of read)
    for (const body of bodies) {
      const { count, alone } = await worn(body, [piece]);
      assert.ok(count > unworn[body].count, `${piece} is worn on the ${body} body`);
      const fixed = looks.boneOf(slot, bone);
      const on = (bones, name) => bones.filter((each) => each === name).length;
      if (fixed) assert.ok(on(alone, fixed) > on(unworn[body].alone, fixed), `${piece} is fixed to ${fixed} alone`);
      else assert.equal(alone.length, unworn[body].alone.length, `${piece} bends with the body`);
    }
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
  // Its underwear is in the Underwear lists, not among the clothes, and a swimsuit is worn on bare skin.
  const underwear = read.filter(({ slot }) => slot.startsWith("underwear_"));
  assert.ok(
    underwear.some(({ piece }) => piece === "joepal_plain_bra") &&
      underwear.some(({ piece }) => piece === "elvs_lace_panty"),
    "the pack's bras and briefs are underwear",
  );
  for (const { piece, slot } of underwear) {
    assert.ok(!looks.SLOT_OF[piece], `${piece} isn't offered as clothing`);
    const list = slot === "underwear_top" ? looks.UNDERWEAR_TOPS : looks.UNDERWEAR_BOTTOMS;
    assert.ok(
      list.some(([style]) => style === piece),
      `${piece} is in the ${slot} list`,
    );
  }
  assert.ok(index.pieces.mindfront_f_one_piece_swimsuit_01.noUnderwear, "a swimsuit leaves the underwear off");
}

// ── Underwear from a pack, and underwear under clothes ──
{
  const { BODY_REVISION, readPack } = await import("../packages/3d-avatar-maker/src/packs.js");
  const { licenceNote } = await import("../packages/3d-avatar-maker/src/exporter.js");
  const { Color } = await import("three");
  const { missingNotes, wornLook } = looks;
  // A test pack whose underwear is the kit's own bikini, served as an installed pack's assets are.
  const id = "3d-avatar-maker-test-underwear";
  const tops = await (await import("../packages/3d-avatar-maker/src/kitfiles.js")).load("avatar-outfits-tops.pack.png");
  const legs = await (await import("../packages/3d-avatar-maker/src/kitfiles.js")).load("avatar-outfits-legs.pack.png");
  served.set(
    `${id}/wardrobe/underwear.pack.png`,
    Buffer.from(
      JSON.stringify(
        { pieces: { test_bra: tops.pieces.bikini_top, test_briefs: legs.pieces.bikini_bottom }, pictures: [] },
        (key, value) => (value instanceof Uint8Array ? Buffer.from(value).toString("base64") : value),
      ),
    ),
  );
  const installed = {
    id,
    version: "0.1.00",
    status: "active",
    manifest: { contributions: { assets: { paths: ["avatar-pack.json", "wardrobe/underwear.pack.png"] } } },
  };
  const entry = (label, slot, over = {}) => ({
    label,
    slot,
    bodies: ["female"],
    layer: 0,
    hides: [],
    parts: { female: [["cloth", 0xffffff]] },
    variants: [],
    bundle: "wardrobe/underwear.pack.png",
    licence: "CC0-1.0",
    author: "Tester",
    source: "http://example.test/",
    credit: null,
    ...over,
  });
  const index = {
    format: 1,
    for: "3d-avatar-maker",
    body: BODY_REVISION,
    maker: "0.1.11",
    name: "Test Underwear",
    pieces: {
      test_bra: entry("Test bra", "underwear_top", {
        tint: true,
        licence: "CC-BY-4.0",
        credit: "Test bra by Tester, CC BY 4.0",
      }),
      test_briefs: entry("Test briefs", "underwear_bottom"),
      thong: entry("Not the kit's", "underwear_bottom"), // (a kit underwear style's id)
      test_flag: entry("Bad", "underwear_top", { noUnderwear: "yes" }),
      test_tint: entry("Bad", "underwear_top", { tint: 1 }),
      test_slot: entry("Bad", "underwear"),
    },
  };
  const pieces = readPack(installed, index);
  assert.deepEqual(
    pieces.map(({ piece, slot, tint }) => [piece, slot, tint]),
    [
      ["test_bra", "underwear_top", true],
      ["test_briefs", "underwear_bottom", false],
    ],
    "pack underwear is read into the underwear slots; a kit style's id, a bad flag or slot is left out",
  );

  // Before the pack is installed: a look with its underwear keeps it, says so, and saves without it.
  const record = { pack: id, name: "Test Underwear", label: "Test bra" };
  const saved = startOf("female", {
    underwear: { top: "test_bra", bottom: "briefs", underClothes: false },
    fromPacks: { test_bra: record },
  });
  assert.deepEqual(saved.underwear, { top: "test_bra", bottom: "briefs", underClothes: false }, "kept");
  assert.deepEqual(saved.fromPacks, { test_bra: record });
  assert.deepEqual(checkLook(saved), saved, "through every later check, as a draft is");
  assert.match(missingNotes(saved).join(" "), /underwear "Test bra" isn't shown because its pack, Test Underwear/u);
  assert.equal(wornLook(saved).underwear.top, looks.BARE, "a saved avatar has no underwear top, as it's drawn");
  assert.equal(checkLook({ underwear: { top: "Bad-Id", bottom: "toString" } }).underwear, undefined, "ids checked");

  looks.addPieces(pieces);
  assert.ok(
    looks.UNDERWEAR_TOPS.some(([style]) => style === "test_bra"),
    "the Top list offers the pack's bra",
  );
  assert.ok(!looks.SLOT_OF.test_bra && !looks.CLOTHES.some(([piece]) => piece === "test_bra"), "not as clothing");
  const choices = await avatarChoices("female");
  assert.ok(choices.tops.includes("test_bra") && choices.bottoms.includes("test_briefs"), "offered on its body");
  assert.ok(!(await avatarChoices("male")).tops.includes("test_bra"), "and not on the other");
  assert.ok(!choices.clothes.some(({ piece }) => piece === "test_bra"));
  const back = checkLook(saved);
  assert.equal(back.underwear.top, "test_bra", "the look wears it again");
  assert.deepEqual(missingNotes(back), []);
  assert.equal(checkLook({ underwear: { bottom: "test_bra" } }).underwear, undefined, "a top isn't a bottom");
  assert.match(licenceNote({ underwear: { top: "test_bra" } }), /Test bra by Tester, CC BY 4\.0/u, "credited");

  // Drawn: the body's own briefs as triangles of the body, a pack's as a piece of its own.
  const made = async (look) => {
    const figure = await createAvatar(startOf("female", { hair: "none", ...look }), "Test", "auto");
    const body = figure.meshes.find((mesh) => mesh.name === "body");
    const briefs = figure.kit.meshes.find((mesh) => mesh.piece === "underwear-bottom-briefs");
    let shown = 0;
    for (const vertex of body.geometry.index.array)
      if (vertex >= briefs.start && vertex < briefs.start + briefs.count) shown++;
    // (Each piece's first colour, red, as a fraction: what it's dyed.)
    const reds = figure.meshes
      .filter((mesh) => mesh.name === "piece" && mesh.geometry.attributes.color)
      .map((mesh) => mesh.geometry.attributes.color.array[0] / 65535);
    const result = { meshes: figure.meshes.length, briefs: shown, reds };
    figure.dispose();
    return result;
  };
  const skirt = { clothes: ["short_skirt"] };
  const on = await made({ ...skirt, underwear: { bottom: "briefs", underClothes: true } });
  const off = await made({ ...skirt, underwear: { bottom: "briefs", underClothes: false } });
  assert.ok(on.briefs > 0, "the body's briefs show under a skirt with underwear shown under clothes");
  assert.equal(off.briefs, 0, "and are hidden under it with that off");
  // (Shown where a look doesn't say: avatar.js UNDER_CLOTHES.)
  assert.ok((await made({ ...skirt, underwear: { bottom: "briefs" } })).briefs > 0, "shown where a look doesn't say");
  assert.equal(
    (await made({ clothes: ["one_piece_swimsuit"], underwear: { bottom: "briefs", underClothes: true } })).briefs,
    0,
    "a swimsuit is worn without them",
  );
  const packOn = await made({ ...skirt, underwear: { bottom: "test_briefs", underClothes: true } });
  const packOff = await made({ ...skirt, underwear: { bottom: "test_briefs", underClothes: false } });
  assert.equal(packOn.briefs, 0, "the pack's briefs replace the body's own");
  assert.ok(packOn.meshes > packOff.meshes, "the pack's briefs show under the skirt with that on, and not with it off");
  // The underwear's colour dyes a pack's piece made to be dyed.
  const colour = 0x8a2a2a;
  // (Nothing worn over it: a look that names no clothes wears its everyday ones, which would hide it.)
  const { reds } = await made({ clothes: [], underwear: { top: "test_bra" }, colours: { underwear: colour } });
  const red = new Color().setHex(colour).r;
  assert.ok(
    reds.some((value) => Math.abs(value - red) < 1e-4),
    `the pack's bra takes the underwear's colour (${reds.join(", ")} for ${red})`,
  );
}

// ── Clothes keep their layers, and what's worn on the legs never follows the arms ──
{
  const { depthOf, LAYER_GAP, surfaceOf, tuckUnder } = await import("../packages/3d-avatar-maker/src/layers.js");
  assert.ok(depthOf("underwear_top", 1) < depthOf("socks", 1), "underwear is under everything");
  assert.ok(depthOf("socks", 1) < depthOf("legs", 1) && depthOf("legs", 1) < depthOf("top", 1), "socks, legs, a top");
  assert.ok(depthOf("top", 1) < depthOf("over", 2), "a jacket over the shirt");
  // An inner point just over an outer surface goes LAYER_GAP under it; one far under it, or past its edge, stays.
  {
    const outer = surfaceOf(new Float32Array([-1, -1, 0.01, 1, -1, 0.01, 0, 1, 0.01]), new Uint32Array([0, 1, 2]));
    const points = new Float32Array([0, 0, 0.012, 0, 0, -0.05, 0.9, 0.9, 0.012]);
    const near = { ids: new Uint32Array(3), shares: new Float32Array([1, 1, 1]) };
    assert.equal(tuckUnder(points, 0, 3, near, 1, new Float32Array([0, 0, 1]), [outer]), 1, "one point moved");
    assert.ok(Math.abs(points[2] - (0.01 - LAYER_GAP)) < 1e-6, "tucked to the gap under the surface");
    assert.ok(Math.abs(points[5] + 0.05) < 1e-6, "a point well under it stays");
    assert.ok(Math.abs(points[8] - 0.012) < 1e-6, "a point past its edge stays");
  }
  // What lies directly under cloth isn't drawn. A point under a surface within reach is covered (or just over
  // one it stands through); one far under it or past its edge isn't. Only triangles well in from where the
  // cover ends go: each edge of margin takes a ring of them back.
  {
    const { coveredBy, deepUnder, isUnder } = await import("../packages/3d-avatar-maker/src/layers.js");
    const outer = surfaceOf(new Float32Array([-1, -1, 0.01, 1, -1, 0.01, 0, 1, 0.01]), new Uint32Array([0, 1, 2]));
    const points = new Float32Array([0, 0, 0, 0, 0, -0.2, 0.9, 0.9, 0, 0, 0, 0.012]);
    const upwards = (v, out) => {
      out.splice(0, 3, 0, 0, 1);
      return true;
    };
    assert.deepEqual([...coveredBy(points, 0, 4, upwards, [{ surface: outer }])], [1, 0, 0, 1], "what's covered");
    const strip = new Uint32Array([0, 1, 2, 1, 2, 3, 2, 3, 4, 3, 4, 5]);
    const covered = new Uint8Array([1, 1, 1, 1, 1, 0]);
    const under = (margin) => {
      const deep = deepUnder(covered, strip, 0, 0, strip.length, margin);
      return [0, 3, 6, 9].map((i) => isUnder(deep, strip, i));
    };
    assert.deepEqual(under(0), [true, true, true, false], "with no margin, every covered triangle");
    assert.deepEqual(under(1), [true, false, false, false], "a ring back from where the cover ends");
    assert.deepEqual(under(2), [false, false, false, false], "and another");
  }
  // Worn: the skin directly under jeans and a tee isn't drawn (it would come through them as the body moves),
  // the head's and the hands' all is, and so are the legs under a long skirt, which only hangs over them.
  {
    const skinDrawn = async (body, clothes) => {
      const figure = await createAvatar(startOf(body, { clothes, hair: "none" }), "Test", "auto");
      const { geometry } = figure.meshes.find((mesh) => mesh.name === "body");
      const skin = figure.kit.meshes.find((mesh) => mesh.part === "skin" && !mesh.piece);
      const drawn = {};
      for (const { start, count } of geometry.groups)
        for (let i = start; i < start + count; i += 3) {
          const vertex = geometry.index.array[i];
          if (vertex < skin.start || vertex >= skin.start + skin.count) continue;
          drawn[figure.kit.regions[vertex]] = (drawn[figure.kit.regions[vertex]] ?? 0) + 1;
        }
      figure.dispose();
      return drawn;
    };
    const [bare, dressed] = [await skinDrawn("male", []), await skinDrawn("male", ["mh_jeans", "mh_tee"])];
    assert.ok(bare.thighs > 100 && bare.torso > 100, "bare, the skin is all drawn");
    assert.ok(dressed.thighs < bare.thighs * 0.2, `jeans: the thighs under them aren't drawn (${dressed.thighs})`);
    assert.ok(dressed.torso < bare.torso * 0.5, `a tee: nor the chest and back under it (${dressed.torso})`);
    assert.equal(dressed.head, bare.head, "the head is all there");
    assert.equal(dressed.hands, bare.hands, "and the hands");
    const [her, skirted] = [await skinDrawn("female", []), await skinDrawn("female", ["skirt"])];
    assert.ok(skirted.calves >= her.calves * 0.95, `under a long skirt the legs are there (${skirted.calves})`);
    assert.ok(skirted.thighs >= her.thighs * 0.5, `and most of the thighs (${skirted.thighs} of ${her.thighs})`);
  }
  // Let go, an avatar lets go of what it alone holds on the graphics card: each mesh's skeleton (its bones'
  // texture), and the weights a moving bust gave its body, still on the geometry when that is disposed of.
  {
    const figure = await createAvatar(startOf("female", { clothes: ["mh_female_tee"] }), "Test", "auto");
    const body = figure.meshes.find((mesh) => mesh.name === "body");
    let freed = 0;
    for (const mesh of figure.meshes) mesh.skeleton.dispose = () => freed++;
    let weights = null;
    body.geometry.addEventListener("dispose", () => (weights = Object.keys(body.geometry.attributes)));
    figure.dispose();
    assert.equal(freed, figure.meshes.length, "every mesh's skeleton is let go");
    assert.ok(weights.includes("skinIndex") && weights.includes("skinWeight"), "and the bust's own weights");
  }
  // Worn together, no point of an inner piece is left over the piece worn over it (along the skin's normals,
  // as the maker tucks it: looked for again, nothing more moves).
  const { nearestSkin } = await import("../packages/3d-avatar-maker/src/avatar.js");
  const pieceMeshes = (figure) => new Map(figure.meshes.map((mesh) => [mesh.userData.piece, mesh]));
  for (const [body, inner, outer] of [
    ["female", "joepal_crude_high_socks", "mh_female_leggings"],
    ["female", "mh_female_leggings", "punkduck_high_neck_crop_top"],
    ["male", "mh_jeans", "mh_tee"],
    ["female", "punkduck_v_neck_top", "elvs_hooded_sweat_jacket1"],
  ]) {
    const figure = await createAvatar(startOf(body, { clothes: [inner, outer] }), "Test", "auto");
    const meshes = pieceMeshes(figure);
    assert.ok(meshes.has(inner) && meshes.has(outer), `${inner} under ${outer}: both worn`);
    const { geometry: under } = meshes.get(inner);
    const { geometry: over } = meshes.get(outer);
    const points = under.attributes.position.array.slice();
    const count = points.length / 3;
    const skin = figure.meshes.find((mesh) => mesh.name === "body").geometry.attributes.normal.array;
    const surface = surfaceOf(over.attributes.position.array, over.index.array);
    tuckUnder(points, 0, count, nearestSkin(figure.kit, points), 4, skin, [surface]);
    const was = under.attributes.position.array;
    let left = 0; // (moved again by more than a fifth of a millimetre)
    for (let v = 0; v < count; v++)
      if (
        Math.hypot(points[v * 3] - was[v * 3], points[v * 3 + 1] - was[v * 3 + 1], points[v * 3 + 2] - was[v * 3 + 2]) >
        2e-4
      )
        left++;
    assert.ok(left <= count * 0.01, `${inner} under ${outer}: ${left} of ${count} points left over it`);
    figure.dispose();
  }
  // A piece on the legs or feet takes no weight from the arms or hands below the chest (they hang beside a
  // skirt in the A-pose, and would drag it when lowered). (Above it, overalls' straps rest on the shoulders.)
  const ARM_BONE = /^(?:upperarm|lowerarm|hand|thumb|index|middle|ring|pinky)_/u;
  for (const body of ["male", "female"]) {
    const { clothes } = await avatarChoices(body);
    for (const { piece } of clothes.filter(({ piece }) => ["legs", "feet", "socks"].includes(looks.SLOT_OF[piece]))) {
      const figure = await createAvatar(startOf(body, { clothes: [piece] }), "Test", "auto");
      const mesh = pieceMeshes(figure).get(piece);
      if (mesh) {
        const { position, skinIndex, skinWeight } = mesh.geometry.attributes;
        const chest = mesh.skeleton.bones.findIndex((bone) => bone.name === "spine_02");
        const below = chest < 0 ? Infinity : mesh.skeleton.boneInverses[chest].clone().invert().elements[13];
        let worst = 0;
        for (let i = 0; i < skinIndex.array.length; i++)
          if (
            position.array[(i >> 2) * 3 + 1] < below &&
            ARM_BONE.test(mesh.skeleton.bones[skinIndex.array[i]]?.name ?? "")
          )
            worst = Math.max(worst, skinWeight.array[i]);
        assert.ok(worst < 0.01, `${body} ${piece}: no weight on the arms (${worst.toFixed(3)})`);
      }
      figure.dispose();
    }
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
  // A piece's `hang` (where its cloth leaves the body to swing) is a number in HANG_RANGE, or nothing.
  const { HANG_RANGE } = await import("../packages/3d-avatar-maker/src/packs.js");
  const hangs = readPack(installed, {
    ...index,
    pieces: {
      test_skirt: piece("Skirt", "legs", { hang: 0.2 }),
      test_cape: piece("Cape", "back", { hang: HANG_RANGE[0] }),
      test_trousers: piece("Trousers", "legs"),
      test_still_skirt: piece("Skirt", "legs", { hang: null }),
      test_far_hang: piece("Bad", "legs", { hang: HANG_RANGE[1] + 0.1 }),
      test_text_hang: piece("Bad", "legs", { hang: "0.2" }),
    },
  });
  assert.deepEqual(
    hangs.map((entry) => [entry.piece, entry.hang]),
    [
      ["test_skirt", 0.2],
      ["test_cape", HANG_RANGE[0]],
      ["test_trousers", null],
      ["test_still_skirt", null],
    ],
    "a piece's hang line is read when it's a number in range; a piece without one follows the legs",
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

// ── Animations in the preview (motions.js): every motion on short and tall bodies, the feet on the floor,
// no joint past what a body does, back to rest when stopped, and nothing of it in a saved file ──
{
  const { Quaternion, Vector3 } = await import("three");
  const { MOTIONS, createMotionPlayer, motionPose } = await import("../packages/3d-avatar-maker/src/motions.js");
  const { createSprings } = await import("../packages/3d-avatar-maker/src/springs.js");
  const { exportVrm } = await import("../packages/3d-avatar-maker/src/exporter.js");
  assert.ok(MOTIONS.length >= 10, "walking, dancing, talking, waving and more");
  for (const [, label, about] of MOTIONS) assert.ok(label && about, `${label}: says what it does`);
  const bodies = {
    woman: await createAvatar(startOf("female", { hair: "long" }), "Test", "auto"),
    dwarf: await createAvatar(
      startOf("male", { ...racePreset("dwarf", "male"), hair: "ponytail", limbs: { legs: 0.7, head: 1.2 } }),
      "Test",
      "auto",
    ),
    tall: await createAvatar(
      startOf("female", { height: 1.12, limbs: { legs: 1.15, arms: 1.1, head: 0.9 } }),
      "Test",
      "auto",
    ),
  };
  // What a chat shows, as Marinara Engine stands an avatar: each upper arm 1.2 radians down from level. And a
  // clip is measured from straight fingers: where it holds the hand open (talking), the fingers are straight,
  // not curled further by the soft curl they rest in.
  {
    const figure = bodies.woman;
    const n = figure.humanoid;
    const place = (bone) => bone.getWorldPosition(new Vector3());
    for (const id of ["chat-idle", "chat-talking", "chat-thinking", "chat-listening"])
      assert.ok(
        MOTIONS.some(([offered]) => offered === id),
        `${id}: offered`,
      );
    assert.ok(motionPose(figure, "chat-idle", 0));
    for (const [side, sign] of [
      ["left", 1],
      ["right", -1],
    ]) {
      const arm = place(n[`${side}LowerArm`])
        .sub(place(n[`${side}UpperArm`]))
        .normalize();
      const down = Math.atan2(-arm.y, sign * arm.x);
      assert.ok(Math.abs(down - 1.2) < 0.03, `in a chat the ${side} arm hangs 1.2 radians below level (${down})`);
    }
    motionPose(figure, "talk", 1);
    const [a, b, c] = ["Proximal", "Intermediate", "Distal"].map((joint) => place(n[`leftIndex${joint}`]));
    const bend = b.clone().sub(a).angleTo(c.clone().sub(b));
    assert.ok(bend < 0.2, `an open hand in a clip is open (${bend.toFixed(2)} radians at the index finger)`);
    restPose(figure);
  }
  // How far each bone may turn from rest (radians): past these a body looks broken.
  const LIMITS = [
    [/^(lowerarm|calf)_/u, 2.8],
    [/^upperarm_/u, 2.8],
    [/^thigh_/u, 2.7],
    [/^(foot|ball)_/u, 1.6],
    [/^hand_/u, 2.0],
    [/^clavicle_/u, 0.8],
    [/^(spine_0|neck_01$|Head$)/u, 1.1],
  ];
  const at = (bone) => bone.getWorldPosition(new Vector3());
  const up = new Vector3(0, 1, 0);
  for (const [name, figure] of Object.entries(bodies)) {
    for (const mesh of figure.meshes) for (const material of [mesh.material].flat()) material.map = null;
    const n = figure.humanoid;
    restPose(figure);
    const feet = ["left", "right"].map((side) =>
      [n[`${side}Foot`], n[`${side}Toes`]].map((bone) => [bone, at(bone).y]),
    );
    const hipsUp = up.clone().applyQuaternion(n.hips.getWorldQuaternion(new Quaternion()));
    const hipsRest = n.hips.getWorldQuaternion(new Quaternion()).invert();
    const shins = ["left", "right"].map((side) => {
      const thigh = n[`${side}UpperLeg`];
      return [thigh, new Vector3(0, 0, 1).applyQuaternion(thigh.getWorldQuaternion(new Quaternion()).invert())];
    });
    const fronts = ["left", "right"].map((side) => {
      const upper = n[`${side}UpperArm`];
      return [upper, new Vector3(0, 0, 1).applyQuaternion(upper.getWorldQuaternion(new Quaternion()).invert())];
    });
    const restGlb = (await exportGlb(figure, { look: {} })).bytes;
    // The hips at rest, at their widest (round the hip joints): how far out and how deep the skin goes. A hand
    // whose joints come inside that, at that height, has gone into the hips.
    const hipY = at(n.leftUpperLeg).y;
    const band = { wide: 0, front: -Infinity, back: Infinity };
    {
      const body = figure.meshes[0];
      const { position, skinIndex, skinWeight } = body.geometry.attributes;
      const point = new Vector3();
      for (let i = 0; i < position.count; i++) {
        // (The skin the hips and thighs move most: not the hands, which hang at that height at rest.)
        let most = 0;
        for (let c = 1; c < 4; c++) if (skinWeight.getComponent(i, c) > skinWeight.getComponent(i, most)) most = c;
        if (!/^(pelvis|thigh_|spine_01)/u.test(body.skeleton.bones[skinIndex.getComponent(i, most)].name)) continue;
        point.fromBufferAttribute(position, i).applyMatrix4(body.matrixWorld);
        if (Math.abs(point.y - hipY) > 0.05) continue;
        band.wide = Math.max(band.wide, Math.abs(point.x));
        band.front = Math.max(band.front, point.z);
        band.back = Math.min(band.back, point.z);
      }
    }
    const hipsAtRest = n.hips.matrixWorld.clone();
    const handJoints = ["leftHand", "rightHand", "leftMiddleProximal", "rightMiddleProximal"].map((key) => n[key]);
    for (const [id] of MOTIONS) {
      const label = `${name} ${id}`;
      relaxedPose(figure, 0);
      const springs = createSprings(figure);
      const player = createMotionPlayer();
      player.play(figure, id);
      let worstFloor = 0;
      let lowest = 0;
      let bent = 0;
      const handMade = id === "wave" || id === "stretch";
      let inHips = 0;
      for (let f = 1; f <= 12 * 20; f++) {
        assert.ok(
          player.step(figure, 1 / 20, () => relaxedPose(figure, 0)),
          `${label}: plays`,
        );
        springs.step(1 / 20);
        // The hands stay out of the hips (measured as the hips stand now, back where they rest).
        const back = hipsAtRest.clone().multiply(n.hips.matrixWorld.clone().invert());
        for (const joint of handJoints) {
          const p = at(joint).applyMatrix4(back);
          if (p.y < hipY - 0.15 || p.y > hipY + 0.08) continue;
          const middle = (band.front + band.back) / 2;
          const inside = (p.x / band.wide) ** 2 + ((p.z - middle) / ((band.front - band.back) / 2)) ** 2;
          if (inside < 1) inHips = Math.max(inHips, 1 - inside);
        }
        for (const bone of figure.bones.values())
          assert.ok(bone.matrixWorld.elements.every(Number.isFinite), `${label}: ${bone.name} has no NaN`);
        // A foot on the floor: the lower of the two stands where a foot rests, and neither goes through it.
        const heights = feet.map((joints) => Math.min(...joints.map(([bone, rest]) => at(bone).y - rest)));
        lowest = Math.min(lowest, ...heights);
        if (f > 10) worstFloor = Math.max(worstFloor, Math.abs(Math.min(...heights)));
        for (const [bone, rest] of [...figure.bones].map(([key, bone]) => [bone, figure.rest.get(key)])) {
          const limit = LIMITS.find(([pattern]) => pattern.test(bone.name))?.[1];
          if (!limit) continue;
          const turned = 2 * Math.acos(Math.min(1, Math.abs(bone.quaternion.dot(rest))));
          assert.ok(turned <= limit, `${label}: ${bone.name} turns ${turned.toFixed(2)} at most ${limit}`);
        }
        const tipped = up.clone().applyQuaternion(n.hips.getWorldQuaternion(new Quaternion())).angleTo(hipsUp);
        assert.ok(tipped < 1.3, `${label}: the hips tip ${tipped.toFixed(2)}`);
        // Knees bend forward and elbows the way an elbow bends.
        const forward = new Vector3(0, 0, 1).applyQuaternion(
          n.hips.getWorldQuaternion(new Quaternion()).multiply(hipsRest),
        );
        for (const [thigh, front] of shins) {
          const calf = thigh.children.find((child) => /^calf_/u.test(child.name));
          const foot = calf.children.find((child) => /^foot_/u.test(child.name));
          const leg = at(calf).sub(at(thigh)).normalize();
          const shin = at(foot).sub(at(calf)).normalize();
          if (leg.angleTo(shin) < 0.3) continue;
          const ahead = front.clone().applyQuaternion(thigh.getWorldQuaternion(new Quaternion()));
          assert.ok(
            ahead.dot(shin.projectOnPlane(leg).normalize()) < 0.3,
            `${label}: ${thigh.name}'s knee bends the way a knee bends`,
          );
        }
        for (const [upper, front] of fronts) {
          const lower = upper.children.find((child) => child.isBone);
          const hand = lower.children.find((child) => /^hand_/u.test(child.name));
          const arm = at(lower).sub(at(upper)).normalize();
          const fore = at(hand).sub(at(lower)).normalize();
          // (The hand-made motions' elbows; a recorded clip's are as its animator made them.)
          if (arm.angleTo(fore) < 0.4 || !handMade) continue;
          bent++;
          const facing = front.clone().applyQuaternion(upper.getWorldQuaternion(new Quaternion()));
          assert.ok(
            facing.dot(fore.projectOnPlane(arm).normalize()) > 0.2,
            `${label}: ${upper.name}'s elbow bends the way an elbow bends`,
          );
        }
      }
      assert.ok(lowest > -0.01, `${label}: no foot goes through the floor (${(lowest * 100).toFixed(1)} cm)`);
      assert.ok(worstFloor < 0.01, `${label}: a foot stays on the floor (${(worstFloor * 100).toFixed(1)} cm off)`);
      if (id === "wave") assert.ok(bent > 0, `${label}: the elbow bends`);
      assert.equal(inHips, 0, `${label}: the hands stay out of the hips (${inHips.toFixed(2)} in)`);
      // Saved mid-motion, the file is the same as one saved at rest.
      const saved = (await exportGlb(figure, { look: {} })).bytes;
      assert.deepEqual(saved, restGlb, `${label}: a file saved mid-motion rests as one saved at rest`);
      // Stopped, it eases back to the pose it was in: here the rest pose, every bone as built.
      motionPose(figure, id, 2.3);
      player.stop(figure);
      for (let f = 0; f < 30; f++) player.step(figure, 1 / 30, () => restPose(figure));
      assert.equal(player.active, false, `${label}: has stopped`);
      assert.equal(
        player.step(figure, 1 / 30, () => {}),
        false,
        `${label}: and leaves the figure to the stage`,
      );
      for (const [key, bone] of figure.bones) {
        const off = bone.quaternion.toArray().map((value, i) => Math.abs(value - figure.rest.get(key).toArray()[i]));
        assert.ok(Math.max(...off) < 1e-9, `${label}: ${key} back at rest`);
        assert.ok(bone.position.distanceTo(figure.restAt.get(key)) < 1e-9, `${label}: ${key} back in place`);
      }
    }
    // Walking keeps the hips near their height standing, and lifts each foot in turn.
    {
      restPose(figure);
      const standing = at(n.hips).y;
      let lifted = [0, 0];
      for (let f = 0; f < 60; f++) {
        motionPose(figure, "walk", f / 30);
        assert.ok(Math.abs(at(n.hips).y - standing) < 0.1, `${name}: walking, the hips near their height standing`);
        lifted = lifted.map((most, i) => Math.max(most, at(feet[i][0][0]).y - feet[i][0][1]));
      }
      assert.ok(Math.min(...lifted) > 0.03, `${name}: walking lifts each foot (${lifted.map((y) => y.toFixed(2))})`);
      // A turn turns the figure, not the camera: by a quarter after a quarter of the turn.
      motionPose(figure, "turn", 2.5);
      const facing = new Vector3(0, 0, 1).applyQuaternion(
        n.hips.getWorldQuaternion(new Quaternion()).multiply(hipsRest),
      );
      assert.ok(facing.x > 0.9, `${name}: turned to its left (${facing.toArray().map((v) => v.toFixed(2))})`);
    }
  }
  // A saved VRM mid-motion is the same as one saved at rest.
  {
    const figure = bodies.woman;
    restPose(figure);
    const rest = (await exportVrm(figure, { look: {}, terms: { author: "Tester" } })).bytes;
    motionPose(figure, "crouch", 2.5);
    const crouched = (await exportVrm(figure, { look: {}, terms: { author: "Tester" } })).bytes;
    assert.deepEqual(crouched, rest, "a VRM saved mid-crouch rests in its T-pose as one saved at rest");
  }
  // The face: a motion's own face only while the Face list is on Lively; the user's other choices win.
  {
    const player = createMotionPlayer();
    player.play(bodies.woman, "talk");
    player.step(bodies.woman, 0.1, () => {});
    assert.deepEqual(player.face("lively", 9), ["talking", 0.1], "talking talks while the face is lively");
    assert.deepEqual(player.face("angry", 9), ["angry", 9], "and keeps an expression the user chose");
    player.pause(true);
    assert.deepEqual(player.face("lively", 9), ["lively", 9], "paused, the face is the user's again");
    // A new look while it plays goes on with the motion at once, with nothing to ease from.
    assert.equal(player.adopt(bodies.tall), true, "a new figure is posed in the motion playing");
    assert.equal(player.active, true);
    player.stop(bodies.tall);
    assert.equal(createMotionPlayer().adopt(bodies.tall), false, "with nothing playing, the stage poses it");
  }
  for (const figure of Object.values(bodies)) figure.dispose();
}

// ── Generate avatar (generate.js): what a card says, what the model is told, and how its answer is read ──
{
  const gen = await import("../packages/3d-avatar-maker/src/generate.js");
  const { checkLook, NEUTRAL_LOOK } = looks;
  // A character's V2 card kept as text, and a persona's flat row; only an Engine picture path is a portrait.
  const character = gen.cardOf({
    avatarPath: "/api/avatars/file/mira.png?v=2",
    data: JSON.stringify({ data: { name: "Mira", description: "A baker.", extensions: { appearance: "Red hair." } } }),
  });
  assert.equal(character.words, "Appearance: Red hair.\nDescription: A baker.");
  assert.equal(character.picture, "/api/avatars/file/mira.png?v=2");
  const persona = gen.cardOf({
    name: "Ash",
    appearance: "Tall.",
    personality: "Calm.",
    avatarPath: "https://x.test/a.png",
  });
  assert.deepEqual(
    persona,
    { words: "Appearance: Tall.\nPersonality: Calm.", picture: null },
    "no picture from elsewhere",
  );
  assert.equal(gen.cardOf({ avatarPath: "/api/avatars/file/../secret.png" }).picture, null);
  assert.ok(gen.cardOf({ description: "word ".repeat(2000) }).words.length <= gen.MOST_WORDS + 1, "long cards are cut");
  // Only chat connections, nothing but their names and models.
  assert.deepEqual(
    gen.textConnections([
      { id: "c1", name: "Main", provider: "openai", model: "m", isDefault: "true", apiKey: "secret" },
      { id: "c2", name: "Pictures", provider: "image_generation" },
      { name: "no id" },
    ]),
    [{ id: "c1", name: "Main", model: "m", isDefault: true }],
  );
  // The menu names what each body has: the kit's sliders, skins, hair, underwear and clothes by slot.
  const menu = await gen.designMenu("female");
  for (const word of [
    "eye_tilt:",
    "jaw_forward:",
    "race_dwarf:",
    "bronze (",
    "underwear:",
    "bra (",
    "Legs (",
    "stubble:",
  ])
    assert.ok(menu.includes(word), `the menu has ${word}`);
  assert.ok(!/species|\bwolf\b|scales/u.test(menu), "humans only");
  const female = await avatarChoices("female");
  for (const piece of female.clothes.map(({ piece }) => piece))
    assert.ok(menu.includes(`${piece} (`), `${piece} is offered`);
  assert.ok(menu.length < 60000, `the menu stays a size a model reads (${menu.length} characters)`);
  // Only the body the avatar has: no choice of body, nothing marked as another body's, none of its pieces.
  const male = await avatarChoices("male");
  const mens = await gen.designMenu("male");
  for (const [name, text] of [
    ["female", menu],
    ["male", mens],
  ]) {
    assert.ok(!/^body: /mu.test(text), `the ${name} menu offers no choice of body`);
    assert.ok(!/(?:male|female) only\)/u.test(text), `the ${name} menu marks nothing as one body's`);
    assert.ok(!/real(?:Shape|Tone|Hair|Brows)/u.test(text), `the ${name} menu has none of the Realistic body's fields`);
  }
  const hers = female.clothes
    .map(({ piece }) => piece)
    .filter((piece) => !male.clothes.some((each) => each.piece === piece));
  assert.ok(hers.length > 0, "some pieces are the female body's alone");
  for (const piece of hers) assert.ok(!mens.includes(`${piece} (`), `${piece} isn't offered to the male body`);
  for (const piece of male.clothes.map(({ piece }) => piece))
    assert.ok(mens.includes(`${piece} (`), `${piece} is offered to it`);
  // The messages: a portrait, and to revise, the look now and its pictures after it.
  const made = gen.designMessages({
    name: "Mira",
    words: "Red hair.",
    menu: "MENU",
    picture: "data:image/jpeg;base64,AA",
  });
  assert.equal(made[1].images.length, 1);
  assert.ok(!made[1].content.includes("settings now"), "a new design isn't shown a look");
  const revise = gen.designMessages({
    mode: "revise",
    name: "Mira",
    words: "",
    menu: "MENU",
    current: {
      body: "female",
      colours: { skin: 0x112233 },
      shape: { jaw: 0, nose: 0.5 },
      makeup: { lipstick: { amount: 1 } },
    },
    views: ["data:b", "data:f"],
    note: "older",
  });
  assert.deepEqual(revise[1].images, ["data:b", "data:f"]);
  assert.match(revise[1].content, /"skin":"#112233"/u);
  assert.match(revise[1].content, /"shape":\{"nose":0\.5\}/u, "a slider as made isn't listed");
  assert.match(revise[1].content, /"lipstick":\{"amount":1\}/u, "an amount stays a number");
  assert.match(revise[1].content, /What the user wants changed: older/u);
  assert.equal(gen.designMessages({ name: "A", words: "", menu: "M" })[1].images, undefined, "no pictures, no images");
  // What's said to the model is the body's own too: no word of clothes for the Realistic body, which has none.
  for (const mode of ["generate", "revise"]) {
    const said = (body) =>
      gen.designMessages({ mode, name: "A", words: "", menu: "M", current: { body }, body })[0].content;
    assert.match(said("female"), /clothes|dress them/u, `${mode}: a kit body is dressed`);
    assert.ok(!/clothes|dress/u.test(said("realistic")), `${mode}: the Realistic body isn't told of clothes`);
  }
  const shown = gen.lookForModel(
    checkLook({ body: "male", realShape: { fat: 1 }, realTone: 0.5, realHair: "bob", hair: "bob" }),
  );
  assert.deepEqual(
    Object.keys(shown).sort(),
    ["body", "hair"],
    "a kit body's look is shown without the Realistic body's fields",
  );
  // The answer: JSON past thinking and prose, read as a look of the maker's options only.
  assert.deepEqual(gen.readJson('<think>{"no":1}</think>Here: {"hair": "bob"} done'), { hair: "bob" });
  assert.equal(gen.readJson("no look"), null);
  const base = checkLook({ ...NEUTRAL_LOOK, body: "female", clothes: ["boots"], hair: "none" });
  const { look, design } = gen.designedLook(base, {
    race: "dwarf",
    shape: { nose: 0.4, nonsense: 3 },
    colours: { eyes: "#3366aa" },
    stubble: { shape: "light", colour: "#221100" },
    clothes: ["not_a_piece"],
    avatar: "vrm",
  });
  assert.equal(design.avatar, undefined, "never the avatar a card shows");
  const other = gen.designedLook(base, {
    body: "male",
    realShape: { fat: 1 },
    realTone: 0.7,
    realHair: "eve",
    hair: "bob",
    physics: { hair: { on: false } },
  });
  assert.equal(other.look.body, "female", "a design doesn't change the body the avatar has");
  assert.deepEqual(
    Object.keys(other.design),
    ["hair"],
    "or set what only the Realistic body has, or which parts move on springs",
  );
  assert.equal(look.race, "dwarf");
  assert.equal(look.shape.race_dwarf, 1, "a new race brings its build, as choosing it does");
  assert.equal(look.shape.nose, 0.4);
  assert.equal(look.colours.eyes, 0x3366aa);
  assert.equal(look.stubble.colour, 0x221100, "stubble's colour read from #rrggbb");
  assert.deepEqual(look.clothes, [], "a made-up piece isn't kept");
  const kept = gen.designedLook(base, { colours: { lips: "#aa2233" } }).look;
  assert.deepEqual(
    [kept.clothes, kept.hair, kept.colours.lips],
    [["boots"], "none", 0xaa2233],
    "a revision keeps the rest",
  );
}
// ── The Realistic body (realistic.js): a body of another make beside the kit's two, which stay as they are ──
{
  const { ALL_BODIES, BODIES, REALISTIC, REALISTIC_HAIR, REALISTIC_SHAPES } = looks;
  const { FACE_MOVES } = await import("../packages/3d-avatar-maker/src/face.js");
  const { exportVrm } = await import("../packages/3d-avatar-maker/src/exporter.js");
  const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
  const { VRMLoaderPlugin } = await import("@pixiv/three-vrm");
  const { Vector3 } = await import("three");
  assert.deepEqual(
    BODIES.map(([body]) => body),
    ["male", "female"],
    "the kit's two bodies are the ones the clothes, hair and presets are made for",
  );
  assert.ok(
    ALL_BODIES.some(([body]) => body === REALISTIC),
    "the Body tab offers the Realistic body beside them",
  );

  // Its file has every slider and face move the lists name, each going as far as the list says.
  const choices = await avatarChoices(REALISTIC);
  const ranges = new Map(choices.sliders.map(([key, least, most]) => [key, [least, most]]));
  for (const [key, label, tab, , ends, both] of REALISTIC_SHAPES) {
    assert.ok(choices.keys.includes(key), `the Realistic body has the ${label} slider's key`);
    assert.deepEqual(
      ranges.get(key),
      [both ? -1 : 0, 1],
      `${label} goes ${both ? "both ways" : "one way"} in its file`,
    );
    assert.ok(["body", "face"].includes(tab) && ends.length === 2, `${label} has a tab and two ends`);
  }
  for (const key of FACE_MOVES) assert.ok(choices.keys.includes(key), `the Realistic body's face has ${key}`);
  assert.deepEqual(choices.clothes, [], "it has no clothes yet");

  // A look keeps its own fields, held within what they can be.
  const kept = checkLook({
    body: REALISTIC,
    realShape: { gender: 5, fat: -1, waist: -0.4, made_up: 1 },
    realTone: 2,
    realHair: "made up",
  });
  assert.equal(kept.body, REALISTIC);
  assert.equal(kept.realShape.gender, 1, "a slider is held to its range");
  assert.ok(!(kept.realShape.fat < 0), "a one-way slider doesn't go backwards");
  assert.equal(kept.realShape.waist, -0.4, "a two-way slider goes both ways");
  assert.ok(!("made_up" in kept.realShape), "a slider it doesn't have isn't kept");
  assert.equal(kept.realTone, 1, "the skin's tone is held to 0…1");
  assert.equal(kept.realHair, undefined, "a hair style it doesn't have isn't kept");

  const start = (over = {}) => checkLook({ ...NEUTRAL_LOOK, body: REALISTIC, realShape: { gender: 1 }, ...over });
  const figure = await createAvatar(start(), "Test", "auto");
  assert.equal(figure.avatar.body, REALISTIC);
  for (const bone of [...VRM_REQUIRED, "leftEye", "rightEye", "leftIndexProximal", "rightThumbDistal"])
    assert.ok(figure.humanoid[bone], `realistic: has its ${bone} bone`);
  const names = figure.meshes.map((mesh) => mesh.name);
  for (const part of [
    ...["skin_head", "skin_torso", "skin_arms", "skin_legs"],
    ...["mouth", "iris", "eye_white", "cornea", "brows", "lashes", "hair"],
  ])
    assert.ok(names.includes(part), `realistic: has its ${part}`);
  assert.ok(
    figure.meshes.every((mesh) => mesh.isSkinnedMesh),
    "realistic: skinned meshes",
  );
  const box = new Box3().setFromObject(figure.object);
  assert.ok(Math.abs(box.min.y) < 0.01, `realistic: stands on the floor (lowest point ${box.min.y.toFixed(3)})`);
  assert.ok(box.max.y > 1.5 && box.max.y < 2, `realistic: a person's height (${box.max.y.toFixed(2)} m)`);
  const drop = (of) =>
    of.humanoid.leftUpperArm.getWorldPosition(new Vector3()).y - of.humanoid.leftHand.getWorldPosition(new Vector3()).y;
  restPose(figure);
  const atRest = drop(figure);
  tPose(figure);
  assert.ok(Math.abs(drop(figure)) < 0.01, `realistic: arms level in the T-pose (${drop(figure).toFixed(3)})`);
  relaxedPose(figure, 0);
  assert.ok(drop(figure) > atRest, "realistic: arms lower in the relaxed pose than at rest");
  restPose(figure);

  // The face's moves are live on the head, and on the brows that lie on it; each eye turns on its own bone,
  // which sits inside the eyeball.
  const mesh = (of, name) => of.meshes.find((each) => each.name === name);
  for (const key of FACE_MOVES)
    assert.ok(key in mesh(figure, "skin_head").morphTargetDictionary, `realistic: its head has the ${key} move`);
  assert.ok("surprised" in mesh(figure, "brows").morphTargetDictionary, "realistic: its brows rise with the face");
  // (From the points alone: a geometry's own box also takes in how far its face moves reach.)
  const boxOf = (of, name) => new Box3().setFromBufferAttribute(mesh(of, name).geometry.attributes.position);
  const eye = figure.bones.get("eye_l").getWorldPosition(new Vector3());
  const whites = boxOf(figure, "eye_white");
  assert.ok(
    eye.x > 0 && eye.y > whites.min.y && eye.y < whites.max.y,
    "realistic: the left eye's bone is in its eyeball",
  );

  // Sliders: a male build is broader in the shoulders; longer legs lengthen the bones; the height is a size.
  const shoulders = (of) =>
    of.humanoid.leftUpperArm.getWorldPosition(new Vector3()).x -
    of.humanoid.rightUpperArm.getWorldPosition(new Vector3()).x;
  const legs = (of) =>
    of.humanoid.leftUpperLeg.getWorldPosition(new Vector3()).y - of.humanoid.leftFoot.getWorldPosition(new Vector3()).y;
  const male = await createAvatar(start({ realShape: { gender: -1 } }), "Test", "auto");
  assert.ok(shoulders(male) > shoulders(figure) + 0.01, "realistic: a male build has wider shoulders, bones and all");
  const leggy = await createAvatar(start({ realShape: { gender: 1, proportions: 1 } }), "Test", "auto");
  assert.ok(legs(leggy) > legs(figure) + 0.01, "realistic: longer legs move the leg's joints");
  assert.ok(
    Math.abs(new Box3().setFromObject(leggy.object).min.y) < 0.01,
    "realistic: and it still stands on the floor",
  );
  const tall = await createAvatar(start({ height: 1.1 }), "Test", "auto");
  assert.ok(
    Math.abs(new Box3().setFromObject(tall.object).max.y / box.max.y - 1.1) < 0.01,
    "realistic: the height slider sizes the whole figure",
  );
  // The hair stays on the head whatever the sliders make of it: its top within a centimetre or so of the scalp's.
  for (const [name, shape] of [
    ["female", { gender: 1 }],
    ["male", { gender: -1 }],
    ["old and heavy", { gender: 1, old: 1, fat: 1 }],
    ["other features", { gender: -1, features_african: 1, proportions: -1 }],
  ]) {
    const made = await createAvatar(start({ realShape: shape }), "Test", "auto");
    const gap = boxOf(made, "hair").max.y - boxOf(made, "skin_head").max.y;
    assert.ok(
      gap > -0.002 && gap < 0.02,
      `realistic, ${name}: the hair sits on the head (${(gap * 1000).toFixed(1)} mm over it)`,
    );
    made.dispose();
  }
  // Every hair style loads; none is none.
  for (const [style] of REALISTIC_HAIR) {
    const made = await createAvatar(start({ realHair: style }), "Test", "auto");
    const hair = mesh(made, "hair");
    if (style === "none") assert.ok(!hair, "realistic: no hair is no hair");
    else {
      assert.ok(hair.geometry.index.count / 3 > 20000, `realistic: the ${style} style has its strands`);
      // (The scalp under it is painted in the hair's colour, from a picture of where it lies.)
      const scalp = await readFile(join(kitRoot, "avatar", `realistic-hair-${style}-scalp.webp`));
      assert.ok(scalp.length > 1000, `realistic: the kit has the ${style} style's scalp picture`);
    }
    made.dispose();
  }

  // Saved as a GLB and as a VRM, with its face and eyes, and its look back out.
  for (const each of figure.meshes)
    for (const material of [each.material].flat())
      Object.assign(material, { map: null, normalMap: null, roughnessMap: null }); // (no pictures in Node)
  const look = start({ realHair: "bob", realTone: 0.25 });
  const glb = await exportGlb(figure, { look, name: "Realistic" });
  const file = readGlb(glb.bytes).json;
  assert.equal(file.meshes.length, figure.meshes.length, "realistic: every mesh is in the saved file");
  assert.deepEqual(lookInGlb(glb.bytes), { name: "Realistic", look }, "realistic: the look comes back out");
  const cornea = file.materials.find((material) => material.name.startsWith("cornea"));
  assert.equal(cornea.alphaMode, "BLEND", "realistic: the eye's clear front is saved see-through");
  const vrmFile = await exportVrm(figure, { look, name: "Realistic", terms: { author: "Tester" } });
  const loader = new GLTFLoader();
  loader.register((parser) => new VRMLoaderPlugin(parser));
  const bytes = vrmFile.bytes;
  const gltf = await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), "");
  const vrm = gltf.userData.vrm;
  assert.ok(vrm?.humanoid, "realistic: three-vrm reads it as a VRM");
  vrm.scene.updateMatrixWorld(true);
  const at = (bone) => vrm.humanoid.getRawBoneNode(bone).getWorldPosition(new Vector3());
  assert.ok(Math.abs(at("leftUpperArm").y - at("leftHand").y) < 0.01, "realistic: its VRM rests with its arms level");
  assert.ok(at("leftToes").z > at("leftFoot").z, "realistic: its VRM faces +Z");
  for (const key of FACE_MOVES)
    assert.ok(vrm.expressionManager.getExpression(key), `realistic: its VRM has the ${key} expression`);
  assert.ok(vrm.lookAt, "realistic: its VRM's eyes can look");
  // Underwear is painted on the skin unless the look goes bare: panties and a bra on the female side of the
  // first slider, boxer briefs on the male side. Each is a picture of its own in the kit.
  {
    const pictures = (of) =>
      Object.fromEntries(
        ["head", "torso", "arms", "legs"].map((part) => {
          const { map, normalMap, roughnessMap } = mesh(of, `skin_${part}`).material;
          return [part, [map.name, normalMap.name, roughnessMap.name]];
        }),
      );
    const dressed = await createAvatar(start(), "Test", "auto");
    const boxers = await createAvatar(start({ realShape: { gender: -1 } }), "Test", "auto");
    const bare = await createAvatar(start({ realBare: true }), "Test", "auto");
    assert.equal(checkLook({ body: REALISTIC, realBare: "yes" }).realBare, undefined, "going bare takes a plain true");
    assert.deepEqual(pictures(dressed).torso, [
      "realistic-skin-torso-light-female",
      "realistic-skin-torso-normal-female",
      "realistic-skin-torso-rough-female",
    ]);
    assert.equal(pictures(dressed).legs[0], "realistic-skin-legs-light-female", "the panties' edge runs onto the legs");
    assert.equal(pictures(boxers).torso[0], "realistic-skin-torso-light-male", "a male build has boxer briefs");
    assert.equal(pictures(boxers).legs[2], "realistic-skin-legs-rough-male", "whose legs are on the legs' pictures");
    assert.equal(pictures(bare).torso[0], "realistic-skin-torso-light", "bare, the skin is as the model has it");
    assert.equal(pictures(bare).legs[1], "realistic-skin-legs-normal");
    for (const made of [dressed, boxers, bare]) {
      assert.equal(pictures(made).head[0], "realistic-skin-head-light", "nothing is painted on the head");
      assert.equal(pictures(made).arms[2], "realistic-skin-arms-rough", "or on the arms");
      for (const names of Object.values(pictures(made)))
        for (const name of names)
          assert.ok((await readFile(join(kitRoot, "avatar", `${name}.webp`))).length > 500, `the kit has ${name}`);
      made.dispose();
    }
  }
  // Eyes: an eye picture, or the model's own iris in a colour. Each is a tile of one picture, and the iris's
  // texture coordinates are moved into the look's tile, the iris's middle in the tile's middle.
  {
    const { EYE_PICTURES, TINT } = looks;
    const tileOf = (of) => {
      const uv = mesh(of, "iris").geometry.attributes.uv;
      const box = new Box3();
      for (let i = 0; i < uv.count; i++) box.expandByPoint(new Vector3(uv.getX(i), uv.getY(i), 0));
      const middle = box.getCenter(new Vector3());
      assert.ok(box.max.x - box.min.x < 0.2 && box.max.y - box.min.y < 0.2, "the iris stays inside one tile");
      return [
        Math.floor(middle.x * 5),
        Math.floor(middle.y * 5),
        +((middle.x * 5) % 1).toFixed(2),
        +((middle.y * 5) % 1).toFixed(2),
      ];
    };
    const tinted = await createAvatar(start({ colours: { eyes: 0x3f6f8a } }), "Test", "auto");
    assert.equal(tinted.avatar.eyePicture, TINT, "the eyes start as a colour of one's own");
    assert.deepEqual(tileOf(tinted), [4, 4, 0.5, 0.5], "a colour is laid on the grey iris, the last tile");
    const blue = mesh(tinted, "iris").material.color;
    assert.ok(blue.b > blue.r, "and the iris's material carries the colour");
    const at = EYE_PICTURES.findIndex(([picture]) => picture === "cat-green");
    const cat = await createAvatar(start({ eyePicture: "cat-green" }), "Test", "auto");
    assert.deepEqual(tileOf(cat), [at % 5, Math.floor(at / 5), 0.5, 0.5], "an eye picture is its own tile");
    assert.equal(mesh(cat, "iris").material.color.getHex(), 0xffffff, "shown as it is");
    assert.equal(mesh(cat, "iris").material.map.name, "realistic-eyes");
    assert.ok(
      (await readFile(join(kitRoot, "avatar", "realistic-eyes.webp"))).length > 50000,
      "the kit has the irises' picture",
    );
    assert.equal(EYE_PICTURES.length, 24, "24 eye pictures and the grey iris fill the picture's 25 tiles");
    for (const made of [tinted, cat]) made.dispose();
  }
  // Brows and lashes: strands tied to the skin under their roots. The lashes shut with the lid, the brows come
  // in fourteen styles of their own files, in the hair's colour unless given their own.
  {
    const { REALISTIC_BROWS, REALISTIC_BROWS_USUAL } = looks;
    const furthest = (of, name, key) => {
      const made = mesh(of, name);
      const moves = made.geometry.morphAttributes.position[made.morphTargetDictionary[key]];
      let most = 0;
      for (let i = 0; i < moves.count; i++) most = Math.max(most, -moves.getY(i));
      return most;
    };
    const lid = furthest(figure, "skin_head", "blink");
    const lash = furthest(figure, "lashes", "blink");
    assert.ok(lid > 0.006, `realistic: a blink brings the lid down (${(lid * 1000).toFixed(1)} mm)`);
    assert.ok(
      lash > lid * 0.85 && lash <= lid + 1e-6,
      `realistic: the upper lashes come down with it (${(lash * 1000).toFixed(1)} mm)`,
    );
    const lashes = mesh(figure, "lashes").geometry;
    assert.ok(lashes.index.count / 3 > 2000, "realistic: both eyes have their lashes");
    const lashBox = boxOf(figure, "lashes");
    const eyeBox = boxOf(figure, "eye_white");
    assert.ok(
      lashBox.min.y > eyeBox.min.y - 0.006 && lashBox.max.y < eyeBox.max.y + 0.006 && lashBox.max.z > eyeBox.max.z,
      "realistic: the lashes are on the lids, in front of the eyes",
    );
    assert.equal(figure.avatar.realBrows, REALISTIC_BROWS_USUAL, "the brows start as the model's usual style");
    assert.equal(checkLook({ body: REALISTIC, realBrows: REALISTIC_BROWS + 1 }).realBrows, undefined);
    assert.equal(checkLook({ body: REALISTIC, realBrows: 2.5 }).realBrows, undefined, "a brow style is a whole number");
    assert.equal(checkLook({ body: REALISTIC, realBrows: 3 }).realBrows, 3);
    const sizes = new Set();
    for (let style = 1; style <= REALISTIC_BROWS; style++) {
      const made = await createAvatar(start({ realBrows: style }), "Test", "auto");
      const brows = mesh(made, "brows");
      assert.ok(brows.geometry.index.count / 3 > 1000, `realistic: brow style ${style} has its hairs`);
      const gap = boxOf(made, "brows").getCenter(new Vector3()).y - boxOf(made, "eye_white").getCenter(new Vector3()).y;
      assert.ok(
        gap > 0.008 && gap < 0.035,
        `realistic: brow style ${style} is over the eyes (${(gap * 1000).toFixed(1)} mm up)`,
      );
      sizes.add(brows.geometry.attributes.position.count);
      made.dispose();
    }
    assert.ok(sizes.size > REALISTIC_BROWS / 2, "the brow styles are different brows");
    const red = await createAvatar(start({ colours: { brows: 0xaa2211 } }), "Test", "auto");
    const browColour = mesh(red, "brows").material.color;
    const lashColour = mesh(red, "lashes").material.color;
    assert.ok(browColour.r > browColour.b * 2, "the brows take a colour of their own");
    assert.ok(lashColour.r < browColour.r * 0.5, "and the lashes are that colour, darker");
    red.dispose();
  }
  // Paint on the skin: makeup, lips, stubble and nail colour, each laid through a picture of where in the kit.
  {
    const { paintsOf } = await import("../packages/3d-avatar-maker/src/realistic.js");
    const { Color } = await import("three");
    const hair = new Color(0x402010);
    const masks = (part, look) => paintsOf(part, look, hair).map((paint) => paint.mask.replace("realistic-", ""));
    const plain = { realHair: "bob" };
    assert.deepEqual(masks("head", plain), ["hair-bob-scalp"], "a plain look paints only the scalp under its hair");
    assert.deepEqual(masks("head", { realHair: "none" }), [], "and nothing with no hair");
    for (const part of ["torso", "arms", "legs"]) assert.deepEqual(masks(part, plain), [], `nothing on the ${part}`);
    const made = {
      realHair: "none",
      stubble: { shape: "goatee", density: 0.5 },
      makeup: {
        eyeshadow: { colour: 0x6a4fa0, amount: 0.8 },
        eyeliner: { colour: 0x111111, amount: 1 },
        blush: { colour: 0xd9838b, amount: 0.5 },
        lipstick: { amount: 0.5 },
      },
      colours: { lips: 0xaa2233, nails: 0xb91c3c },
    };
    assert.deepEqual(
      masks("head", made),
      ["paint-goatee", "paint-blush", "paint-eyeshadow", "paint-eyeliner", "paint-lips"],
      "stubble first, then the makeup, the lips last",
    );
    const lips = paintsOf("head", made, hair).at(-1);
    const full = paintsOf("head", { ...made, makeup: {} }, hair).at(-1);
    assert.equal(lips.colour, "#aa2233");
    assert.ok(
      lips.strength > 0 && Math.abs(lips.strength * 2 - full.strength) < 1e-9,
      "a lipstick at half is half as strong",
    );
    assert.ok(lips.body > 0 && lips.body < 1, "makeup is a tint: the skin's own light and dark stay under it");
    const stubble = (look) => paintsOf("head", { realHair: "none", stubble: look }, hair)[0];
    assert.ok(
      stubble({ shape: "heavy", density: 1 }).strength > stubble({ shape: "light", density: 1 }).strength,
      "heavy stubble is stronger than light",
    );
    assert.ok(
      stubble({ shape: "heavy", density: 1 }).strength > stubble({ shape: "heavy", density: 0.2 }).strength,
      "and denser is stronger",
    );
    assert.notEqual(
      stubble({ shape: "heavy", density: 1, colour: 0xaa5522 }).colour,
      stubble({ shape: "heavy", density: 1 }).colour,
      "stubble takes a colour of its own, else the hair's",
    );
    assert.deepEqual(masks("arms", made), ["paint-nails"], "the nails' colour is on the arms' picture");
    assert.deepEqual(masks("legs", made), ["paint-toenails"], "and the toenails' on the legs'");
    assert.deepEqual(masks("legs", { ...made, toenails: false }), [], "unless the toenails are left out");
    for (const style of looks.STUBBLE.map(([shape]) => shape))
      assert.equal(
        masks("head", { realHair: "none", stubble: { shape: style } }).length,
        1,
        `${style} stubble is painted`,
      );
    for (const name of [
      ...["lips", "eyeshadow", "eyeliner", "blush", "stubble", "moustache", "goatee", "nails", "toenails"],
    ])
      assert.ok(
        (await readFile(join(kitRoot, "avatar", `realistic-paint-${name}.webp`))).length > 1000,
        `the kit has the picture of where the ${name} go`,
      );
    // (A built avatar keeps these fields, so they are saved with it.)
    const painted = await createAvatar(start(made), "Test", "auto");
    assert.deepEqual(painted.avatar.makeup.blush, made.makeup.blush);
    assert.equal(painted.avatar.colours.nails, 0xb91c3c);
    painted.dispose();
  }
  // Sliders: every one is in a group of its tab, and moves the body. With the lids opened wider by a slider,
  // a blink still brings the upper lid's edge down to the lower lid's, as it does on the body as made.
  {
    assert.ok(REALISTIC_SHAPES.length > 140, `the Realistic body has its sliders (${REALISTIC_SHAPES.length})`);
    const groups = new Map();
    for (const [key, , tab, , , , group] of REALISTIC_SHAPES) {
      assert.ok(typeof group === "string" && group, `${key} is in a group`);
      assert.equal(groups.get(group) ?? tab, tab, `the ${group} group is on one tab`);
      groups.set(group, tab);
    }
    assert.ok(groups.size >= 14 && groups.size <= 20, `the sliders are in a handful of groups (${groups.size})`);
    const points = (of) =>
      ["skin_head", "skin_torso", "skin_arms", "skin_legs", "mouth", "iris"].flatMap((part) => [
        ...mesh(of, part).geometry.attributes.position.array,
      ]);
    const plain = points(figure);
    for (const key of ["asymmetry", "head_width", "pointed_ears", "cat_eyes", "fangs", "nail_length", "feet_size"]) {
      const made = await createAvatar(start({ realShape: { gender: 1, [key]: 1 } }), "Test", "auto");
      const moved = points(made);
      let most = 0;
      for (let i = 0; i < plain.length; i++) most = Math.max(most, Math.abs(moved[i] - plain[i]));
      assert.ok(most > 0.0005, `the ${key} slider moves the body (${(most * 1000).toFixed(1)} mm)`);
      made.dispose();
    }
    const shut = (of) => {
      // (The height of the lid's edge, the skin a blink moves furthest, with the eye shut.)
      const head = mesh(of, "skin_head");
      const blink = head.geometry.morphAttributes.position[head.morphTargetDictionary.blink];
      const at = head.geometry.attributes.position;
      let [most, height] = [0, 0];
      for (let i = 0; i < at.count; i++)
        if (at.getX(i) > 0 && -blink.getY(i) > most) [most, height] = [-blink.getY(i), at.getY(i) + blink.getY(i)];
      return height;
    };
    const wide = await createAvatar(start({ realShape: { gender: 1, upper_lids: 1, lower_lids: 1 } }), "Test", "auto");
    assert.ok(
      Math.abs(shut(wide) - shut(figure)) < 0.0003,
      `lids opened wider still shut in a blink (${((shut(wide) - shut(figure)) * 1000).toFixed(2)} mm off)`,
    );
    const lashDrop = (of) => {
      const made = mesh(of, "lashes");
      const blink = made.geometry.morphAttributes.position[made.morphTargetDictionary.blink];
      let most = 0;
      for (let i = 0; i < blink.count; i++) most = Math.max(most, -blink.getY(i));
      return most;
    };
    assert.ok(lashDrop(wide) > lashDrop(figure) + 0.0005, "and the lashes come down the further with them");
    wide.dispose();
  }
  // Generate on this body: a menu of its own fields, and a design read as those fields alone, on this body.
  {
    const gen = await import("../packages/3d-avatar-maker/src/generate.js");
    const menu = await gen.designMenu(REALISTIC);
    for (const [key] of REALISTIC_SHAPES) assert.ok(menu.includes(`  ${key}: `), `its menu lists the ${key} slider`);
    for (const [style] of REALISTIC_HAIR) assert.ok(menu.includes(`${style} (`), `its menu lists the ${style} hair`);
    assert.ok(
      !menu.includes("clothes: a list") && !/^body: /mu.test(menu),
      "its menu offers no clothes and no other body",
    );
    assert.ok(/clothes: a list/u.test(await gen.designMenu("female")), "the other bodies' menu is as it was");
    for (const field of ["makeup (only for someone who wears it)", "stubble: { shape: light", "lips, nails"])
      assert.ok(menu.includes(field), `its menu offers ${field.split(/[ :(]/u)[0]}`);
    const madeUp = gen.designedLook(start({ makeup: { blush: { colour: 0xd9838b, amount: 0.4 } } }), {
      makeup: { eyeshadow: { colour: "#6a4fa0", amount: 0.7 }, lipstick: { amount: 0.6 } },
      colours: { lips: "#aa2233", nails: "#b91c3c", skin: "#ffffff" },
      stubble: { shape: "light", colour: "#553311" },
      toenails: false,
    }).look;
    assert.deepEqual(madeUp.makeup.eyeshadow, { colour: 0x6a4fa0, amount: 0.7 }, "a design's makeup is read");
    assert.deepEqual(madeUp.makeup.blush, { colour: 0xd9838b, amount: 0.4 }, "over the makeup there was");
    assert.equal(madeUp.makeup.lipstick.amount, 0.6);
    assert.deepEqual(
      [madeUp.colours.lips, madeUp.colours.nails, madeUp.colours.skin],
      [0xaa2233, 0xb91c3c, undefined],
      "its lips and nails are this body's colours; another body's colour isn't kept",
    );
    assert.equal(madeUp.stubble.colour, 0x553311);
    assert.equal(madeUp.toenails, false);
    assert.equal(gen.lookForModel(madeUp).makeup.eyeshadow.colour, "#6a4fa0", "the model is shown colours as text");
    const base = start({ realHair: "bob", realTone: 0.3 });
    const { look: designed, design } = gen.designedLook(base, {
      body: "male",
      clothes: ["boots"],
      hair: "long",
      realShape: { gender: -1, fat: 0.5, made_up: 3 },
      realHair: "eve",
      hairTint: "#aa5522",
      height: 1.05,
    });
    assert.equal(designed.body, REALISTIC, "a design leaves the Realistic body the Realistic body");
    assert.deepEqual(designed.realShape, { gender: -1, fat: 0.5 }, "its sliders are set, and only its own");
    assert.deepEqual(
      [designed.realHair, designed.hairTint, designed.height, designed.realTone],
      ["eve", 0xaa5522, 1.05, 0.3],
    );
    assert.deepEqual(designed.clothes ?? [], base.clothes ?? [], "clothes named for another body aren't worn");
    assert.deepEqual(Object.keys(design).sort(), ["hairTint", "height", "realHair", "realShape"]);
    assert.deepEqual(
      gen.designedLook(base, { realShape: { waist: -0.2 } }).look.realShape,
      { gender: 1, waist: -0.2 },
      "a revision keeps the other sliders",
    );
    assert.deepEqual(gen.lookForModel(designed), {
      height: 1.05,
      realShape: { gender: -1, fat: 0.5 },
      realTone: 0.3,
      realHair: "eve",
      hairTint: "#aa5522",
    });
  }
  for (const made of [figure, male, leggy, tall]) made.dispose();
}
// ── Parts that move on springs, each with a switch and an amount in the look (physics.js): the hair, the bust
// and the buttocks, on the kit's two bodies (hair.js, bust.js, glutes.js) and the Realistic one (realistic-physics.js) ──
{
  const { Vector3 } = await import("three");
  const { exportVrm } = await import("../packages/3d-avatar-maker/src/exporter.js");
  const { turnInWorld } = await import("../packages/3d-avatar-maker/src/figure.js");
  const { createMotionPlayer, motionPose } = await import("../packages/3d-avatar-maker/src/motions.js");
  const { checkPhysics, jointAt, physicsOf } = await import("../packages/3d-avatar-maker/src/physics.js");
  const { BUST_JOINT, createSprings, HAIR_JOINT } = await import("../packages/3d-avatar-maker/src/springs.js");
  const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
  const { VRMLoaderPlugin } = await import("@pixiv/three-vrm");
  const { REALISTIC } = looks;
  const mm = (metres) => (metres * 1000).toFixed(1);

  // The look's record: each part { on, amount }, only what differs from the usual (on, amount 1), held to 0…2.
  const usual = { on: true, amount: 1 };
  assert.deepEqual(
    physicsOf({}),
    { hair: usual, bust: usual, butt: usual },
    "a look that says nothing has every part on",
  );
  assert.equal(checkLook({ body: "female" }).physics, undefined, "and keeps no physics field");
  assert.equal(startOf("female").physics, undefined, "a new avatar's look has none either");
  assert.deepEqual(
    checkLook({
      physics: { hair: { on: false }, bust: { amount: 5 }, butt: { on: true, amount: 1 }, tail: { on: false } },
    }).physics,
    { hair: { on: false, amount: 1 }, bust: { on: true, amount: 2 } },
    "a part is kept where it differs, its amount held to 2, and only the parts there are",
  );
  assert.deepEqual(checkLook({ physics: { butt: { amount: -3 } } }).physics, { butt: { on: true, amount: 0 } });
  assert.equal(
    checkLook({ physics: { hair: { on: "no", amount: "lots" } } }).physics,
    undefined,
    "off takes a plain false",
  );
  assert.equal(checkLook({ physics: "all" }).physics, undefined);
  assert.equal(checkPhysics([{ on: false }]), undefined);
  assert.deepEqual(physicsOf({ physics: { bust: { on: false, amount: 0.4 } } }).bust, { on: false, amount: 0.4 });
  // The amount is the spring's settings: its pull back to rest divided by it, its weight too (so it hangs at
  // rest as it does at 1), its drag and size left alone; at 0 it is held all but still.
  assert.equal(jointAt(HAIR_JOINT, 1), HAIR_JOINT, "at 1 a spring is as made");
  const loose = jointAt(HAIR_JOINT, 2);
  assert.equal(loose.stiffness, HAIR_JOINT.stiffness / 2, "at 2 it is half as stiff");
  assert.equal(loose.gravityPower / loose.stiffness, HAIR_JOINT.gravityPower / HAIR_JOINT.stiffness);
  assert.deepEqual(
    [loose.dragForce, loose.hitRadius, loose.gravityDir],
    [HAIR_JOINT.dragForce, HAIR_JOINT.hitRadius, HAIR_JOINT.gravityDir],
  );
  assert.ok(jointAt(BUST_JOINT, 0).stiffness >= BUST_JOINT.stiffness * 20, "at 0 it is held still");
  assert.deepEqual(Object.keys(loose).sort(), Object.keys(HAIR_JOINT).sort(), "nothing a VRM's joint doesn't have");

  const PARTS = {
    // (`hangs`: metres it may rest from where it was bound, its springs run on a body standing still: the
    // hair's own weight draws it down a little; `sways`: the least it must move when shaken; `settles`: how
    // near to that rest it must be two seconds after.)
    hair: { spring: /^Hair \(/u, bone: /^hair_/u, hangs: 0.025, sways: 0.02, settles: 0.003 },
    bust: { spring: /^Bust \(/u, bone: /^breast_/u, hangs: 0.0005, sways: 0.002, settles: 0.0005 },
    butt: { spring: /^Buttock \(/u, bone: /^glute_/u, hangs: 0.0005, sways: 0.001, settles: 0.0005 },
  };
  const BODIES = {
    female: { look: startOf("female", { hair: "long", clothes: [] }), parts: ["hair", "bust", "butt"] },
    male: { look: startOf("male", { hair: "long", clothes: [] }), parts: ["hair", "butt"] },
    realistic: {
      look: checkLook({ ...NEUTRAL_LOOK, body: REALISTIC, realShape: { gender: 1 }, realHair: "eve" }),
      parts: ["hair", "bust", "butt"],
    },
  };
  const build = (look, physics) => createAvatar(checkLook({ ...look, physics }), "Test", "auto");
  const springsOf = (figure, part) => figure.springs.filter((spring) => PARTS[part].spring.test(spring.name));
  /** The names of the part's bones the figure has, on its skeleton or in any mesh's. */
  const bonesOf = (figure, part) => [
    ...new Set(
      [...figure.bones.keys(), ...figure.meshes.flatMap((mesh) => mesh.skeleton.bones.map((bone) => bone.name))].filter(
        (name) => PARTS[part].bone.test(name),
      ),
    ),
  ];
  const point = new Vector3();
  /** Every `every`-th point of each of the figure's meshes, where its bones put it as it stands. */
  const drawnAt = (figure, every = 7) =>
    figure.meshes.map((mesh) => {
      const { position } = mesh.geometry.attributes;
      const out = [];
      for (let i = 0; i < position.count; i += every)
        out.push(
          mesh.applyBoneTransform(i, point.fromBufferAttribute(position, i)).clone().applyMatrix4(mesh.matrixWorld),
        );
      return out;
    });
  const furthest = (a, b) => a.reduce((most, at, i) => Math.max(most, at.distanceTo(b[i])), 0);
  const tipsOf = (springs) => springs.map((spring) => spring.bones.at(-1).getWorldPosition(new Vector3()));
  const UP = new Vector3(0, 1, 0);
  /**
   * The relaxed stand with the body moving, as sets a part swinging: for the hair the head turning slowly from
   * side to side; for the bust and the buttocks the hips bouncing and turning, the whole body with them.
   */
  const shaken = (figure, part, seconds) => {
    relaxedPose(figure, 0);
    const { hips, head } = figure.humanoid;
    if (part === "hair") {
      turnInWorld(hips, UP, 0.3 * Math.sin(seconds * 3));
      turnInWorld(head, UP, 0.3 * Math.sin(seconds * 2.5));
    } else {
      hips.position.y += 0.02 * Math.sin(seconds * 12);
      hips.position.x += 0.02 * Math.sin(seconds * 9);
      turnInWorld(hips, UP, 0.2 * Math.sin(seconds * 6));
    }
    figure.root.updateMatrixWorld(true);
  };
  /**
   * The part's springs on a body standing still, then shaken, then still again: { rests (metres its tips hang
   * from where they were bound, standing still: the hair's own weight draws it down a little), most (metres
   * they went from there as the body moved, measured on the body as it stood each frame), after (metres from
   * there two seconds after the body stops) }.
   */
  const swung = (figure, part) => {
    const springs = springsOf(figure, part);
    const own = springs.flatMap((spring) => spring.bones);
    /** How far each tip is from where its bones hold it at rest on the body as it stands, as a vector. */
    const drift = () => {
      const now = tipsOf(springs);
      const held = own.map((bone) => [bone.quaternion.clone(), bone.position.clone(), bone.scale.clone()]);
      for (const bone of own) {
        bone.quaternion.copy(figure.rest.get(bone.name));
        bone.position.copy(figure.restAt.get(bone.name));
        bone.scale.setScalar(1);
      }
      figure.root.updateMatrixWorld(true);
      const bound = tipsOf(springs);
      own.forEach((bone, i) => {
        bone.quaternion.copy(held[i][0]);
        bone.position.copy(held[i][1]);
        bone.scale.copy(held[i][2]);
      });
      figure.root.updateMatrixWorld(true);
      return now.map((at, i) => at.sub(bound[i]));
    };
    relaxedPose(figure, 0);
    const moving = createSprings(figure);
    const still = (frames) => {
      for (let f = 0; f < frames; f++) {
        relaxedPose(figure, 0);
        moving.step(1 / 60);
      }
      return drift();
    };
    const hung = still(90);
    let most = 0;
    for (let f = 1; f <= 150; f++) {
      shaken(figure, part, f / 60);
      moving.step(1 / 60);
      most = Math.max(most, furthest(drift(), hung));
    }
    const after = furthest(still(120), hung);
    restPose(figure);
    return { rests: Math.max(...hung.map((off) => off.length())), most, after };
  };
  const bare = (figure) => {
    for (const mesh of figure.meshes)
      for (const material of [mesh.material].flat())
        Object.assign(material, { map: null, normalMap: null, roughnessMap: null }); // (no pictures in Node)
    return figure;
  };
  const jointsIn = async (figure) => {
    const { json } = readGlb((await exportGlb(bare(figure), { look: {} })).bytes);
    return new Set(json.skins.flatMap((skin) => skin.joints.map((at) => json.nodes[at].name)));
  };

  for (const [body, { look, parts }] of Object.entries(BODIES)) {
    const on = await build(look);
    assert.deepEqual(
      on.avatar.physics,
      physicsOf({}),
      `${body}: built from a look without the field, every part is on`,
    );
    const none = await build(look, Object.fromEntries(Object.keys(PARTS).map((part) => [part, { on: false }])));
    assert.equal(none.springs.length, 0, `${body}: with every part off it has no springs`);
    for (const part of Object.keys(PARTS))
      assert.deepEqual(bonesOf(none, part), [], `${body}: and no bones for its ${part}`);
    // At rest nothing has moved: every mesh's points are where they are with the parts off, as listed and as
    // their bones draw them, in the pose it was built in and in the relaxed one (the springs at rest in it).
    assert.equal(on.meshes.length, none.meshes.length);
    on.meshes.forEach((mesh, m) => {
      const [mine, plain] = [
        mesh.geometry.attributes.position.array,
        none.meshes[m].geometry.attributes.position.array,
      ];
      assert.equal(mine.length, plain.length, `${body}: its ${mesh.name} has the same points`);
      let off = 0;
      for (let i = 0; i < mine.length; i++) off = Math.max(off, Math.abs(mine[i] - plain[i]));
      assert.equal(off, 0, `${body}: its ${mesh.name}'s points are where they were`);
      const { skinWeight } = mesh.geometry.attributes;
      for (let i = 0; i < skinWeight.count; i += 3) {
        const sum = [0, 1, 2, 3].reduce((total, c) => total + skinWeight.getComponent(i, c), 0);
        assert.ok(Math.abs(sum - 1) < 1e-4, `${body}: every point of its ${mesh.name} has whole weights`);
      }
    });
    restPose(on);
    restPose(none);
    const apart = (one, other, every) =>
      Math.max(...drawnAt(one, every).map((points, m) => furthest(points, drawnAt(other, every)[m])));
    assert.ok(
      apart(on, none) < 1e-4,
      `${body}: drawn where it was with the parts off (off by ${mm(apart(on, none))} mm)`,
    );
    // The buttocks' bones hang from the bones their points were on, so with the springs at rest the body bends
    // as it did in any pose: mid-stride and seated, it is drawn where it is without them. (On the kit's bodies
    // to a fraction of a millimetre: a trace of the lowest back bone's weight goes with the hips'.)
    {
      const still = { on: false };
      const seat = await build(look, { hair: still, bust: still });
      for (const [motion, seconds] of [
        ["walk", 0.4],
        ["sit", 2.5],
      ]) {
        for (const figure of [seat, none])
          assert.ok(motionPose(figure, motion, seconds), `the ${motion} motion poses it`);
        const off = apart(seat, none, 3);
        assert.ok(
          off < (body === REALISTIC ? 1e-4 : 0.0005),
          `${body}: its buttocks at rest, it bends as before in the ${motion} (off by ${(off * 1000).toFixed(2)} mm)`,
        );
      }
      restPose(none);
      seat.dispose();
    }
    const saved = await jointsIn(on);
    const savedNone = await jointsIn(none);
    for (const part of parts) {
      const label = `${body}'s ${part}`;
      const springs = springsOf(on, part);
      assert.ok(springs.length > 0, `${label}: on springs`);
      assert.ok(bonesOf(on, part).length >= springs.length * 2, `${label}: with bones of its own`);
      assert.ok(
        springs.every((spring) => spring.bones.every((bone) => saved.has(bone.name))),
        `${label}: a saved file has its bones`,
      );
      assert.ok(![...savedNone].some((name) => PARTS[part].bone.test(name)), `${label}: off, a saved file has none`);
      // Off: neither springs nor bones for it, and the other parts as they were.
      const off = await build(look, { [part]: { on: false } });
      assert.equal(springsOf(off, part).length, 0, `${label}: off, no springs`);
      assert.deepEqual(bonesOf(off, part), [], `${label}: off, no bones`);
      for (const other of parts.filter((one) => one !== part))
        assert.equal(
          springsOf(off, other).length,
          springsOf(on, other).length,
          `${label}: off, the ${other} still moves`,
        );
      off.dispose();
      // Shaken, it moves; still again, it comes back to rest. The amount says how far: more at 2, next to
      // nothing at 0, and at any amount it rests where it did.
      const moved = swung(on, part);
      assert.ok(
        moved.rests < PARTS[part].hangs,
        `${label}: on a body standing still it stays where it rests (${mm(moved.rests)} mm)`,
      );
      assert.ok(moved.most > PARTS[part].sways, `${label}: moves when the body does (${mm(moved.most)} mm)`);
      assert.ok(moved.after < PARTS[part].settles, `${label}: comes back to rest (${mm(moved.after)} mm off)`);
      const [still, more] = [
        await build(look, { [part]: { amount: 0 } }),
        await build(look, { [part]: { amount: 2 } }),
      ];
      for (const [name, figure] of [
        ["0", still],
        ["2", more],
      ]) {
        assert.equal(springsOf(figure, part).length, springs.length, `${label}: at amount ${name} it has its springs`);
        restPose(figure);
        const off0 = Math.max(...drawnAt(figure, 13).map((points, m) => furthest(points, drawnAt(none, 13)[m])));
        assert.ok(off0 < 1e-4, `${label}: at amount ${name} it rests where it did`);
      }
      const [least, most] = [swung(still, part), swung(more, part)];
      assert.ok(
        most.most > moved.most * 1.25,
        `${label}: moves further at amount 2 (${mm(most.most)} mm against ${mm(moved.most)})`,
      );
      assert.ok(
        least.most < moved.most * 0.35,
        `${label}: is held at amount 0 (${mm(least.most)} mm against ${mm(moved.most)})`,
      );
      assert.ok(
        most.after < PARTS[part].settles,
        `${label}: comes back to rest at amount 2 (${mm(most.after)} mm off)`,
      );
      still.dispose();
      more.dispose();
    }
    // No collider a spring meets holds one of its joints at rest, as built, in the T-pose or relaxed.
    for (const pose of [restPose, tPose, (one) => relaxedPose(one, 0)]) {
      pose(on);
      for (const spring of on.springs)
        for (const collider of spring.colliders) {
          if (pose !== restPose && pose !== tPose && !collider.relaxed) continue;
          for (const bone of spring.bones.slice(1)) {
            const at = bone.getWorldPosition(new Vector3());
            const start = collider.offset.clone().applyMatrix4(collider.bone.matrixWorld);
            const end = (collider.tail ?? collider.offset).clone().applyMatrix4(collider.bone.matrixWorld);
            const line = end.clone().sub(start);
            const t = line.lengthSq() ? Math.max(0, Math.min(1, at.clone().sub(start).dot(line) / line.lengthSq())) : 0;
            const gap = at.distanceTo(start.addScaledVector(line, t)) - collider.radius - spring.joint.hitRadius;
            assert.ok(gap > 0, `${body}: ${bone.name} rests clear of ${collider.bone.name}'s collider`);
          }
        }
    }
    restPose(on);
    on.dispose();
    none.dispose();
  }

  // His chest has a bust to switch off once it stands out (bust.js): with the switch off, none.
  {
    const chest = { shape: { ...startOf("male").shape, chest: 1, race_halforc: 1 }, hair: "none", clothes: [] };
    const [his, off] = [
      await build(startOf("male", chest)),
      await build(startOf("male", chest), { bust: { on: false } }),
    ];
    assert.equal(springsOf(his, "bust").length, 2, "his fullest chest has a bust");
    assert.equal(springsOf(off, "bust").length + bonesOf(off, "bust").length, 0, "and none with its switch off");
    his.dispose();
    off.dispose();
  }
  // A style that swings worn still, then swinging again: each is built as asked, whichever came first.
  {
    const long = startOf("female", { hair: "long", clothes: [] });
    for (const on of [false, true, false, true]) {
      const figure = await build(long, { hair: { on } });
      assert.equal(
        springsOf(figure, "hair").length > 0,
        on,
        `long hair ${on ? "swings" : "stays still"} as the look says`,
      );
      assert.equal(bonesOf(figure, "hair").length > 0, on);
      figure.dispose();
    }
  }

  // The buttocks on the kit's bodies: under the hips, shaking with them; what's worn over them moves with
  // them (trousers, a tight skirt) or hangs on its own chains over them (a skirt), and sits as it did.
  {
    const { GLUTES } = await import("../packages/3d-avatar-maker/src/glutes.js");
    for (const [body, clothes, follows, most] of [
      ["female", "mh_female_leggings", true, 0.0005],
      ["male", "mh_jeans", true, 0.0005],
      ["female", "mh_female_skirt", true, 0.0005],
      ["female", "skirt", false, 0.003],
    ]) {
      const label = `${body} in ${clothes}`;
      const look = startOf(body, { hair: "none", clothes: [clothes] });
      const [figure, plain] = [await build(look), await build(look, { butt: { on: false } })];
      const glutes = springsOf(figure, "butt");
      assert.equal(glutes.length, 2, `${label}: a spring each side`);
      for (const spring of glutes) {
        assert.equal(spring.bones[0].parent.name, GLUTES.parent, `${label}: ${spring.name} hangs from the hips`);
        assert.equal(spring.colliders.length, 0, `${label}: ${spring.name} meets no colliders`);
      }
      const skin = figure.meshes.find((mesh) => mesh.name === "body");
      const piece = figure.meshes.find((mesh) => mesh.userData.piece === clothes);
      if (follows)
        assert.ok(
          piece.skeleton.bones.some((bone) => bone.name === "glute_l"),
          `${label}: the piece over them moves with them`,
        );
      // Worn, it rests where it does without them.
      for (const pose of [restPose, (one) => relaxedPose(one, 0)]) {
        pose(figure);
        pose(plain);
        const off = Math.max(...drawnAt(figure, 3).map((points, m) => furthest(points, drawnAt(plain, 3)[m])));
        assert.ok(off < 1e-4, `${label}: body and clothes rest where they did (off by ${mm(off)} mm)`);
      }
      // The piece's points over the buttocks, each with the skin point nearest it: as the hips move in a walk,
      // the piece is no further behind the skin than with the buttocks left as they rest.
      restPose(figure);
      const tips = glutes.map((spring) => figure.root.worldToLocal(spring.bones[1].getWorldPosition(new Vector3())));
      const near = (at, reach) => tips.some((tip) => tip.distanceTo(at) < reach);
      const skinAt = (i) => new Vector3().fromBufferAttribute(skin.geometry.attributes.position, i);
      const skinNear = [];
      for (let j = 0; j < skin.geometry.attributes.position.count; j++) if (near(skinAt(j), 0.12)) skinNear.push(j);
      const drawn = new Set(skin.geometry.index.array);
      const pairs = [];
      let shown = 0;
      for (let i = 0; i < piece.geometry.attributes.position.count; i++) {
        const at = new Vector3().fromBufferAttribute(piece.geometry.attributes.position, i);
        if (!near(at, 0.09)) continue;
        let [best, gap] = [-1, Infinity];
        for (const j of skinNear) {
          const d = skinAt(j).distanceTo(at);
          if (d < gap) [best, gap] = [j, d];
        }
        const normal = new Vector3().fromBufferAttribute(skin.geometry.attributes.normal, best);
        if (at.clone().sub(skinAt(best)).dot(normal) <= 0) continue;
        pairs.push([i, best, normal]);
        if (drawn.has(best)) shown++;
      }
      assert.ok(pairs.length > 10, `${label}: the piece lies over the buttocks (${pairs.length} points)`);
      // (The skin right under cloth isn't drawn, layers.js, so it can't show through whatever it does.)
      assert.ok(shown < pairs.length * 0.15, `${label}: the skin under it isn't drawn (${shown} of ${pairs.length})`);
      const through = () => {
        let deepest = 0;
        const [a, b, n] = [new Vector3(), new Vector3(), new Vector3()];
        for (const [i, j, normal] of pairs) {
          skin.applyBoneTransform(j, a.copy(skinAt(j)));
          skin.applyBoneTransform(j, n.copy(skinAt(j)).addScaledVector(normal, 0.01));
          n.sub(a).normalize();
          piece.applyBoneTransform(i, b.fromBufferAttribute(piece.geometry.attributes.position, i));
          deepest = Math.max(deepest, -b.sub(a).dot(n));
        }
        return deepest;
      };
      const own = glutes.flatMap((spring) => spring.bones);
      const player = createMotionPlayer();
      relaxedPose(figure, 0);
      const moving = createSprings(figure);
      player.play(figure, "walk");
      let [deeper, shook] = [0, 0];
      for (let f = 1; f <= 180; f++) {
        player.step(figure, 1 / 60, () => relaxedPose(figure, 0));
        moving.step(1 / 60);
        if (f % 3) continue;
        const [now, ends] = [through(), tipsOf(glutes)];
        const held = own.map((bone) => bone.quaternion.clone());
        for (const bone of own) bone.quaternion.copy(figure.rest.get(bone.name));
        figure.root.updateMatrixWorld(true);
        deeper = Math.max(deeper, now - through());
        shook = Math.max(shook, furthest(ends, tipsOf(glutes)));
        own.forEach((bone, i) => bone.quaternion.copy(held[i]));
        figure.root.updateMatrixWorld(true);
      }
      player.stop(figure);
      assert.ok(shook > 0.001 && shook < 0.02, `${label}: the buttocks shake a little in a walk (${mm(shook)} mm)`);
      assert.ok(deeper < most, `${label}: the piece is no further behind the skin for it (${mm(deeper)} mm)`);
      figure.dispose();
      plain.dispose();
    }
    // Longer legs stretch the thighs' bones, which the buttocks' points are on too: they still move as one (no
    // point of a buttock's middle left behind), and rest where they did.
    const leggy = startOf("female", { hair: "none", clothes: [], limbs: { legs: 1.15 } });
    const [figure, plain] = [await build(leggy), await build(leggy, { butt: { on: false } })];
    const off = Math.max(...drawnAt(figure, 1).map((points, m) => furthest(points, drawnAt(plain, 1)[m])));
    assert.ok(off < 1e-4, `longer legs: the body rests where it did (off by ${mm(off)} mm)`);
    const skin = figure.meshes.find((mesh) => mesh.name === "body");
    const was = plain.meshes.find((mesh) => mesh.name === "body");
    const names = skin.skeleton.bones.map((bone) => bone.name);
    const tips = springsOf(figure, "butt").map((spring) =>
      figure.root.worldToLocal(spring.bones[1].getWorldPosition(new Vector3())),
    );
    let [middle, moved] = [0, 0];
    const { position, skinIndex, skinWeight } = skin.geometry.attributes;
    for (const v of new Set(skin.geometry.index.array)) {
      point.fromBufferAttribute(position, v);
      if (!tips.some((tip) => Math.hypot(tip.x - point.x, tip.y - point.y) < 0.04 && point.z < tip.z + 0.04)) continue;
      let [hips, onGlute] = [0, 0];
      for (let c = 0; c < 4; c++) {
        if (names[was.geometry.attributes.skinIndex.getComponent(v, c)] === "pelvis")
          hips += was.geometry.attributes.skinWeight.getComponent(v, c);
        if (/^glute_/u.test(names[skinIndex.getComponent(v, c)])) onGlute += skinWeight.getComponent(v, c);
      }
      if (hips < 0.2) continue;
      middle++;
      if (onGlute > 0.1) moved++;
    }
    assert.ok(
      middle > 50 && moved === middle,
      `longer legs: every point of the buttocks' middles moves (${moved} of ${middle})`,
    );
    figure.dispose();
    plain.dispose();
  }

  // The Realistic body's own.
  {
    const real = (over = {}) => checkLook({ ...NEUTRAL_LOOK, body: REALISTIC, realShape: { gender: 1 }, ...over });
    const mesh = (of, name) => of.meshes.find((each) => each.name === name);
    // Hair: the short style has no chains, the bob short ones that barely move, the long styles long ones that
    // swing. Every strand's root stays on the head (none of its weight on a chain), and its tip is on a chain.
    const sways = {};
    for (const [style, chains, joints] of [
      ["slicked", 0, 0],
      ["bob", 5, 1],
      ["back", 3, 3],
      ["eve", 5, 4],
    ]) {
      const figure = await createAvatar(real({ realHair: style }), "Test", "auto");
      const springs = springsOf(figure, "hair");
      if (!chains) {
        assert.equal(springs.length, 0, `realistic ${style}: too short to swing, no chains`);
        assert.deepEqual(bonesOf(figure, "hair"), []);
        figure.dispose();
        continue;
      }
      assert.ok(
        springs.length >= chains && springs.length <= 8,
        `realistic ${style}: a few chains round the head (${springs.length})`,
      );
      assert.ok(
        springs.every((spring) => spring.bones[0].parent.name === "Head"),
        `realistic ${style}: each hanging from the head`,
      );
      const longest = Math.max(...springs.map((spring) => spring.bones.length - 1));
      assert.ok(joints > 1 ? longest >= joints : longest === 1, `realistic ${style}: chains of ${longest} bones`);
      const hair = mesh(figure, "hair");
      const isChain = hair.skeleton.bones.map((bone) => PARTS.hair.bone.test(bone.name));
      const { skinIndex, skinWeight, uv } = hair.geometry.attributes;
      const onChains = (v) =>
        [0, 1, 2, 3].reduce(
          (sum, c) => sum + (isChain[skinIndex.getComponent(v, c)] ? skinWeight.getComponent(v, c) : 0),
          0,
        );
      let [strands, loose, swinging] = [0, 0, 0];
      for (let start = 0; start < uv.count;) {
        let [end, root, tip] = [start, start, start];
        while (end < uv.count && Math.abs(uv.getX(end) - uv.getX(start)) < 1e-4) {
          if (uv.getY(end) > uv.getY(root)) root = end;
          if (uv.getY(end) < uv.getY(tip)) tip = end;
          end++;
        }
        strands++;
        if (onChains(root) > 0) loose++;
        if (onChains(tip) > 0.9) swinging++;
        start = end;
      }
      assert.equal(loose, 0, `realistic ${style}: every strand's root stays on the head (${strands} strands)`);
      assert.ok(
        swinging > strands * (joints > 1 ? 0.7 : 0.2),
        `realistic ${style}: strands' tips swing (${swinging} of ${strands})`,
      );
      // (Its hair springs meet the head, the shoulders and the upper body.)
      const met = new Set(springs.flatMap((spring) => spring.colliders.map((collider) => collider.bone.name)));
      for (const bone of ["Head", "clavicle_l", "clavicle_r", "spine_03"])
        assert.ok(met.has(bone), `realistic ${style}: its hair meets ${bone}'s collider`);
      sways[style] = swung(figure, "hair").most;
      // What depends on the style alone is worked out once: a second avatar's hair has the very same weights.
      const again = await createAvatar(real({ realHair: style, realShape: { gender: -1, fat: 0.5 } }), "Test", "auto");
      assert.equal(
        mesh(again, "hair").geometry.attributes.skinWeight,
        skinWeight,
        `realistic ${style}: its chains' weights are kept`,
      );
      assert.equal(springsOf(again, "hair").length, springs.length);
      again.dispose();
      figure.dispose();
    }
    assert.ok(sways.bob < 0.02, `the bob barely moves (${mm(sways.bob)} mm)`);
    assert.ok(
      sways.back > sways.bob * 3 && sways.eve > sways.bob * 3,
      `the long styles swing (${mm(sways.back)} and ${mm(sways.eve)} mm)`,
    );
    // The hair is carried by the scalp under each strand's root, so a long style goes with a head the sliders
    // move: its top stays on the scalp and its ends come down as far as the head does.
    {
      const boxOf = (of, name) => new Box3().setFromBufferAttribute(mesh(of, name).geometry.attributes.position);
      const [base, moved] = [
        await createAvatar(real({ realHair: "eve" }), "Test", "auto"),
        await createAvatar(
          real({ realHair: "eve", realShape: { gender: -1, proportions: -1, features_african: 1 } }),
          "Test",
          "auto",
        ),
      ];
      const gap = boxOf(moved, "hair").max.y - boxOf(moved, "skin_head").max.y;
      assert.ok(gap > -0.002 && gap < 0.02, `realistic: long hair sits on a moved head (${mm(gap)} mm over it)`);
      const [headDown, endsDown] = [
        boxOf(base, "skin_head").max.y - boxOf(moved, "skin_head").max.y,
        boxOf(base, "hair").min.y - boxOf(moved, "hair").min.y,
      ];
      assert.ok(
        headDown > 0.03 && Math.abs(endsDown - headDown) < 0.015,
        `and its ends go with it (${mm(endsDown)} of ${mm(headDown)} mm)`,
      );
      base.dispose();
      moved.dispose();
    }
    // A bust: a female build has one with the breasts slider at 0, a male build's flat chest none, nor a
    // muscular one's (its chest stands out, but not by the keys that make a bust); the slider gives any build one.
    for (const [shape, has] of [
      [{ gender: 1 }, true],
      [{ gender: 1, old: 1 }, true],
      [{}, false],
      [{ gender: -1 }, false],
      [{ gender: -1, muscular: 1 }, false],
      [{ gender: -1, fat: 1 }, false],
      [{ gender: 1, thin: 1 }, false],
      [{ gender: -1, breasts: 0.5 }, true],
      [{ gender: 1, breasts: 1 }, true],
    ]) {
      const figure = await createAvatar(real({ realHair: "none", realShape: shape }), "Test", "auto");
      const springs = springsOf(figure, "bust");
      assert.equal(springs.length, has ? 2 : 0, `realistic ${JSON.stringify(shape)}: ${has ? "a" : "no"} bust`);
      assert.equal(bonesOf(figure, "bust").length, has ? 4 : 0);
      assert.equal(springsOf(figure, "butt").length, 2, `realistic ${JSON.stringify(shape)}: buttocks on springs`);
      for (const spring of springs) {
        assert.equal(spring.bones[0].parent.name, "spine_02", `${spring.name} is under the middle chest`);
        assert.ok(
          spring.joint.hitRadius > 0.02 && spring.joint.hitRadius < 0.09,
          `${spring.name}'s ball fits the breast`,
        );
        const met = new Set(spring.colliders.map((collider) => collider.bone.name));
        for (const bone of ["upperarm", "lowerarm", "hand"].flatMap((name) => [`${name}_l`, `${name}_r`]))
          assert.ok(met.has(bone), `realistic: ${spring.name} meets ${bone}'s collider`);
      }
      // (Each buttock hangs from its own thigh, where this body's buttocks are weighted.)
      for (const spring of springsOf(figure, "butt"))
        assert.match(spring.bones[0].parent.name, /^thigh_[lr]$/u, `${spring.name} hangs from its thigh`);
      if (has) {
        // The breasts' points are on their bones, and nothing at the body's middle is: the two never pull one point.
        const torso = mesh(figure, "skin_torso");
        const isBust = torso.skeleton.bones.map((bone) => PARTS.bust.bone.test(bone.name));
        const { position, skinIndex, skinWeight } = torso.geometry.attributes;
        let [full, atMiddle] = [0, 0];
        for (let v = 0; v < position.count; v++) {
          const on = [0, 1, 2, 3].reduce(
            (sum, c) => sum + (isBust[skinIndex.getComponent(v, c)] ? skinWeight.getComponent(v, c) : 0),
            0,
          );
          if (on > 0.5) full++;
          if (on > 0 && Math.abs(position.getX(v)) < 0.001) atMiddle++;
        }
        assert.ok(
          full > 300 && atMiddle === 0,
          `realistic: its breasts are on their bones (${full} points), the middle on neither`,
        );
      }
      figure.dispose();
    }
    // A saved VRM of a Realistic figure with long hair carries its springs: the hair's chains with their
    // colliders, the bust with the arms', the buttocks; three-vrm swings every segment and holds them at rest.
    const look = real({ realHair: "eve" });
    const figure = bare(await createAvatar(look, "Test", "auto"));
    const saved = await exportVrm(figure, { look, name: "Long hair", terms: { author: "Tester" } });
    const { json } = readGlb(saved.bytes);
    const block = json.extensions.VRMC_springBone;
    assert.ok(
      block && json.extensionsUsed.includes("VRMC_springBone"),
      "realistic: a VRM with long hair has spring bones",
    );
    const hairSprings = block.springs.filter((spring) => spring.name.startsWith("Hair ("));
    assert.ok(hairSprings.length >= 3 && hairSprings.some((spring) => spring.joints.length >= 5), "its hair's chains");
    for (const spring of hairSprings) {
      assert.ok(spring.joints.every((joint) => /^hair_/u.test(json.nodes[joint.node].name)));
      assert.equal(spring.joints[0].stiffness, HAIR_JOINT.stiffness);
      const met = spring.colliderGroups.flatMap((group) => block.colliderGroups[group].colliders);
      const bones = met.map((at) => json.nodes[block.colliders[at].node].name);
      assert.ok(
        bones.includes("Head") && bones.includes("spine_03"),
        `${spring.name} meets the head and upper body in the VRM`,
      );
    }
    for (const name of ["Bust (left)", "Bust (right)", "Buttock (left)", "Buttock (right)"])
      assert.ok(
        block.springs.some((spring) => spring.name === name),
        `realistic: its VRM has ${name}`,
      );
    assert.deepEqual(lookInGlb(saved.bytes).look, look, "and its look");
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));
    const bytes = saved.bytes;
    const gltf = await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), "");
    const vrm = gltf.userData.vrm;
    const joints = [...(vrm.springBoneManager?.joints ?? [])];
    assert.equal(
      joints.length,
      figure.springs.reduce((total, spring) => total + spring.bones.length - 1, 0),
      "realistic: every segment of its springs swings in three-vrm",
    );
    vrm.scene.updateMatrixWorld(true);
    const ends = figure.springs.map((spring) => gltf.scene.getObjectByName(spring.bones.at(-1).name));
    const start = ends.map((end) => end.getWorldPosition(new Vector3()));
    for (let i = 0; i < 120; i++) vrm.update(1 / 60);
    figure.springs.forEach((spring, i) => {
      const off = ends[i].getWorldPosition(new Vector3()).distanceTo(start[i]);
      assert.ok(
        off < (spring.name.startsWith("Hair") ? 0.03 : 0.0005),
        `realistic: three-vrm holds ${spring.name} at rest (${mm(off)} mm)`,
      );
    });
    // With the amount changed the VRM's joints carry it; with every part off it has no spring bones at all.
    const softLook = real({
      realHair: "eve",
      physics: { hair: { amount: 2 }, bust: { on: false }, butt: { on: false } },
    });
    const soft = bare(await createAvatar(softLook, "Test", "auto"));
    const softBlock = readGlb((await exportVrm(soft, { look: softLook, terms: { author: "Tester" } })).bytes).json
      .extensions.VRMC_springBone;
    assert.ok(
      softBlock.springs.every((spring) => spring.name.startsWith("Hair (")),
      "only the hair's, with the others off",
    );
    assert.equal(softBlock.springs[0].joints[0].stiffness, HAIR_JOINT.stiffness / 2, "at the look's amount");
    const noneLook = real({
      realHair: "eve",
      physics: { hair: { on: false }, bust: { on: false }, butt: { on: false } },
    });
    const none = bare(await createAvatar(noneLook, "Test", "auto"));
    const noneFile = readGlb((await exportVrm(none, { look: noneLook, terms: { author: "Tester" } })).bytes).json;
    assert.equal(
      noneFile.extensions.VRMC_springBone,
      undefined,
      "realistic: with every part off, a VRM has no spring bones",
    );
    assert.deepEqual(
      lookInGlb((await exportGlb(none, { look: noneLook })).bytes).look,
      noneLook,
      "and the look keeps its switches",
    );
    for (const made of [figure, soft, none]) made.dispose();
  }
}
console.log("3d-avatar-maker.regression: ok");
