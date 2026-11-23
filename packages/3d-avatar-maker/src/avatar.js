// The avatar builder: a person made from a look (looks.js) and the kit's files (kitfiles.js).
//
// Began as a copy of Wanderworld's src/avatar.js (0.7.62) and is this package's own from here: changes
// made here don't reach Wanderworld, and Wanderworld's don't reach here. It still carries the anthro
// bodies' code paths, which this package's kit has no files for yet (humans only), and the low-detail
// "distant" triangle lists a crowd uses, which an avatar maker doesn't draw.
//
// A look shapes the body: which body, the build and face sliders (shape keys), arm and leg length and head
// size (bones), each part's colour, underwear, hair and outfit pieces, and MakeHuman's (CC0) age shape
// keys, skin and eye pictures, brow and lash styles. The shape keys are worked into the person's own copy
// of the positions and normals when they're made.
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  Matrix4,
  MeshLambertMaterial,
  Quaternion,
  SkinnedMesh,
  Vector3,
} from "three";
import { standFigure } from "./figure.js";
import {
  ANTHRO_BARE_SLOTS,
  ANTHRO_SHAPES,
  BARE,
  BEAST_EYES,
  CLOTH_PARTS,
  CLOTH_SLOTS,
  CLOTHES,
  CLAW_COLOURS,
  CLOTH_COLOURS,
  CLOTH_HEX,
  DYES,
  SLOT_OF,
  NAIL_COVERS,
  NAILS,
  EYE_COLOURS,
  EYE_PICTURES,
  EYE_GRID,
  FACE,
  FACE_DETAIL,
  BODY_DETAIL,
  RACE_SHAPES,
  FUR_COLOURS,
  HALF_ORC_SKINS,
  HORNS,
  RACE_PARTS,
  RACES,
  raceOf,
  SKINS,
  COMMUNITY_SKINS,
  skinsFor,
  skinPicture as skinPictureOf,
  TIEFLING_SKINS,
  TINT,
  HAIR_COLOURS,
  HAIRSTYLES,
  HEIGHTS,
  HORN_COLOURS,
  LIMBS,
  NOSE_COLOURS,
  SCALE_COLOURS,
  SHAPES,
  SKIN_TONES,
  SPECIES,
  SPECIES_SIZES,
  sliderKeys,
  sliderRange,
  UNDERWEAR_BOTTOMS,
  UNDERWEAR_TOPS,
  USUAL_HAIR,
  USUAL_HAIR_COLOURS,
} from "./looks.js";
import { geometryOf, load, rigOf, sexFor, skeletonFor, texture, view } from "./kitfiles.js";
import { paintedSkin } from "./skin.js";
import { hashString, rng } from "./util.js";

/** The region of the body each bone's vertices are, for what an outfit piece `hides`. */
const REGION_OF = {
  Head: "head",
  neck_01: "neck",
  spine_01: "torso",
  spine_02: "torso",
  spine_03: "torso",
  clavicle_l: "torso",
  clavicle_r: "torso",
  pelvis: "hips",
  upperarm_l: "upperarms",
  upperarm_r: "upperarms",
  lowerarm_l: "forearms",
  lowerarm_r: "forearms",
  hand_l: "hands",
  hand_r: "hands",
  // (The fingers' own bones are the hand's too: a glove hides them.)
  ...Object.fromEntries(
    ["l", "r"].flatMap((side) =>
      ["thumb", "index", "middle", "ring", "pinky"].flatMap((finger) =>
        [1, 2, 3].map((joint) => [`${finger}_0${joint}_${side}`, "hands"]),
      ),
    ),
  ),
  thigh_l: "thighs",
  thigh_r: "thighs",
  calf_l: "calves",
  calf_r: "calves",
  foot_l: "feet",
  foot_r: "feet",
  ball_l: "feet",
  ball_r: "feet",
};
// Whether someone with no underwear chosen wears the usual (a bra and briefs, or briefs): Settings → People
// → "Default skins with underwear". Off, the base skin shows as it is unless underwear is chosen by hand.
let underwearByDefault = true;
export function setUnderwearByDefault(on) {
  underwearByDefault = on !== false;
}

/** What an outfit piece can hide: these regions of skin (and underwear on them), or the underwear itself. */
export const HIDE_WORDS = [...new Set(Object.values(REGION_OF)), "underwear", "underwear-top", "underwear-bottom"];
/** The parts the regions hide (the skin, and underwear under the piece; an anthro body's fur or scales, and
 *  its claws and pads, which gloves would otherwise let through). */
const COVERED = new Set([
  "skin",
  "nails", // (the nails' own shells: under gloves and shoes with the fingertips and toes)
  "underwear",
  "underwear_trim",
  ...["fur", "fur2", "fur_tufts", "fur2_tufts", "nose", "claws", "scales", "scales2", "horns"],
]);
/** A piece in one of these slots lies over a wolf's neck ruff, whatever it hides. */
const RUFF_SLOTS = new Set(["neck", "back", "armour", "plate"]);
/** A body's kit file: the human's, or an anthro kind's. */
const bodyFile = (species, sex) => (species === "human" ? `avatar-${sex}` : `anthro-${species}-${sex}`);

/** The bones arm and leg length stretch: [bone, the next one along it]. */
const LIMB_BONES = {
  arms: [
    ["upperarm_l", "lowerarm_l"],
    ["lowerarm_l", "hand_l"],
    ["upperarm_r", "lowerarm_r"],
    ["lowerarm_r", "hand_r"],
  ],
  legs: [
    ["thigh_l", "calf_l"],
    ["calf_l", "foot_l"],
    ["thigh_r", "calf_r"],
    ["calf_r", "foot_r"],
  ],
};

// ── MakeHuman skins, ages, eye pictures, brows and lashes (CC0) ──
const WHITE = 0xffffff;
/** The brow and lash styles a name picks from, by body (the first is the usual). */
const USUAL_BROWS = { male: [1, 2, 4, 9, 10, 12], female: [3, 5, 6, 7, 8, 11] };
const USUAL_LASHES = { male: [1, 3], female: [2, 4] };
/** A name's age: mostly young adults, some middle-aged, a few old. */
const ageOf = (roll) => (roll < 0.65 ? "young" : roll < 0.9 ? "middle" : "old");

// ── Everyday clothes by work ──
// Someone whose look doesn't choose their clothes wears what their work would have them in, from their
// name: [job, how many in a hundred, { body: the outfits it picks from }], each outfit a few pieces (a
// phone draws one more mesh for each). Their cloth is dyed from `dyes`, the rest stays as made.
const EVERYDAY_DYES = [0, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((at) => DYES[at][0]);
const RICH_DYES = [6, 7, 10, 12, 13, 2].map((at) => DYES[at][0]);
const PLAIN_DYES = [0, 3, 4, 5].map((at) => DYES[at][0]);
export const JOBS = [
  {
    job: "townsperson",
    share: 40,
    male: [
      ["shirt", "vest", "trousers", "shoes"],
      ["shirt", "tunic", "trousers", "boots"],
    ],
    female: [
      ["dress", "shoes"],
      ["blouse", "skirt", "shoes"],
      ["blouse", "corset", "skirt", "shoes"],
    ],
  },
  {
    job: "farmer",
    share: 22,
    male: [["tunic", "trousers", "boots"]],
    female: [
      ["tunic", "skirt", "boots"],
      ["blouse", "skirt", "boots"],
    ],
  },
  {
    job: "smith",
    share: 8,
    male: [["shirt", "trousers", "boots", "apron"]],
    female: [["shirt", "trousers", "boots", "apron"]],
  },
  {
    job: "guard",
    share: 14,
    male: [
      ["gambeson", "trousers", "boots"],
      ["shirt", "brigandine", "trousers", "boots"],
    ],
    female: [
      ["gambeson", "trousers", "boots"],
      ["shirt", "brigandine", "trousers", "boots"],
    ],
  },
  {
    job: "noble",
    share: 8,
    dyes: RICH_DYES,
    male: [["shirt", "long_coat", "trousers", "tall_boots"]],
    female: [
      ["gown", "shoes"],
      ["blouse", "long_coat", "skirt", "tall_boots"],
    ],
  },
  { job: "priest", share: 8, dyes: PLAIN_DYES, male: [["robe", "sandals"]], female: [["robe", "sandals"]] },
];

/** The everyday clothes a name gives on `sex`'s body: { job, clothes, clothColours } (looks.js fields). */
export function everydayClothes(name, sex) {
  const random = rng(hashString(`${name || "wanderer"}:clothes`));
  let roll = random() * JOBS.reduce((sum, job) => sum + job.share, 0);
  const job = JOBS.find((each) => (roll -= each.share) < 0) ?? JOBS[0];
  const outfits = job[sex] ?? job.male;
  const clothes = outfits[Math.floor(random() * outfits.length)];
  const dyes = job.dyes ?? EVERYDAY_DYES;
  const clothColours = {};
  for (const piece of clothes) {
    const dye = dyes[Math.floor(random() * dyes.length)];
    // (Leather, metal and the like stay as made; the cloth, or a gown's bodice, takes the dye.)
    if (!["apron", "boots", "shoes", "tall_boots", "sandals"].includes(piece))
      clothColours[piece] = piece === "gown" ? { bodice: dye, cloth: dye } : { cloth: dye };
  }
  return { job: job.job, clothes, clothColours };
}

const clamp = (value, least, most) => Math.max(least, Math.min(most, value));
const mixHex = (a, b, t) => {
  const channel = (shift) => Math.round(((a >> shift) & 255) * (1 - t) + ((b >> shift) & 255) * t);
  return (channel(16) << 16) | (channel(8) << 8) | channel(0);
};

/**
 * Everything about how `name` looks as the base avatar, filled in: what was `chosen` (a checked look,
 * with any lore words' look under it, looks.js mergeLooks) over what the name gives. `gender`: the People
 * menu's ("male", "female", "custom" or "auto"). Plain data: { body, species, wings, race, facialHair, tusks,
 * horns, tail, gender, shape, limbs,
 * height, colours, hair, hairColour (0xRRGGBB), underwear, clothes, age, skin, brows, lashes, eyePicture,
 * seed }. The Look card shows these. An anthro body has no hair, no eye or skin picture, and nothing worn
 * that's made for a human head or foot.
 */
export function avatarLook(name, gender = "auto", chosen = {}) {
  const { sex, gender: own } = sexFor(name, gender, chosen);
  const species = SPECIES.some(([kind]) => kind === chosen.species) ? chosen.species : "human";
  const anthro = species !== "human";
  // A human body's race (looks.js RACES), and what it usually has, a roll of its own again.
  const race = !anthro && RACES.some(([value]) => value === chosen.race) ? chosen.race : "human";
  const folk = rng(hashString(`${name || "wanderer"}:avatar-race`));
  const oneOf = (list) => list[Math.floor(folk() * list.length)];
  const usualParts = {
    facialHair: race === "dwarf" && sex === "male" ? oneOf(["beard-02", "beard-03", "beard-04", "beard-04"]) : BARE,
    tusks: race === "halforc" ? (sex === "male" ? oneOf(["tusks-01", "tusks-02"]) : "tusks-01") : BARE,
    horns: race === "tiefling" ? oneOf(HORNS.slice(1))[0] : BARE,
  };
  // An older look that names a race but not its slider: the race folded in once, its sizes multiplying the
  // look's own as they used to, so it opens as it was. (A race is otherwise only a preset: looks.js racePreset.)
  const { key: legacyKey, weight: legacyWeight, ...legacySizes } = raceOf(race);
  const legacy = !!legacyKey && chosen.shape?.[legacyKey] === undefined;
  const sized = (field) => (legacy ? legacySizes[field] : 1);
  const raceSkin = { halforc: HALF_ORC_SKINS, tiefling: TIEFLING_SKINS }[race];
  const usualRaceSkin = raceSkin ? oneOf(raceSkin)[0] : undefined;
  const random = rng(hashString(`${name || "wanderer"}:avatar`));
  // About an everyday middle: most near it, a few further out (the sum of two rolls).
  const around = (spread) => (random() + random() - 1) * spread;
  const NATURAL = {
    weight: 0.5,
    muscle: 0.35,
    chest: 0.35,
    hips: 0.3,
    waist: 0.3,
    belly: 0.25,
    shoulders: 0.3,
    neck: 0.25,
  };
  const shape = {};
  for (const [key, , least, most] of [...SHAPES, ...FACE]) {
    // (Pointed ears are an elf's, and half as much a half-elf's.)
    const usual =
      key === "ears" ? ({ elf: 1, halfelf: 0.5 }[race] ?? 0) : clamp(around(NATURAL[key] ?? 0.35), least, most);
    shape[key] = chosen.shape?.[key] ?? Math.round(usual * 100) / 100;
  }
  const limbs = {};
  // (The face in detail is the face as made unless chosen: no roll, so a look keeps its face.)
  for (const [key] of [...FACE_DETAIL, ...BODY_DETAIL]) shape[key] = chosen.shape?.[key] ?? 0;
  for (const [key] of RACE_SHAPES) shape[key] = chosen.shape?.[key] ?? (legacy && key === legacyKey ? legacyWeight : 0);
  for (const [key, , least, most] of LIMBS) {
    const own =
      chosen.limbs?.[key] ?? Math.round(clamp(1 + around(key === "head" ? 0.02 : 0.03), least, most) * 1000) / 1000;
    limbs[key] = clamp(own * sized(key), least, most);
  }
  const usualHeight = 0.94 + random() * 0.12;
  const usualSkin = Math.floor(random() * SKIN_TONES.length);
  const usualEyes = EYE_COLOURS[Math.floor(random() * 7)][0];
  const usualHair = USUAL_HAIR[sex][Math.floor(random() * USUAL_HAIR[sex].length)];
  const usualHairColour = Math.floor(random() * USUAL_HAIR_COLOURS);
  const usualCloth = CLOTH_COLOURS[Math.floor(random() * 4)][0];
  // (An older look's skin and hair carry over: a tone's place in the list, or a colour of one's own.)
  const ownSkin =
    chosen.colours?.skin ?? chosen.skinTint ?? (Number.isInteger(chosen.skin) ? SKIN_TONES[chosen.skin][0] : undefined);
  // (A half-orc's or tiefling's skin is a colour of their race's, unless a skin is chosen.)
  const skin = ownSkin ?? usualRaceSkin ?? SKIN_TONES[usualSkin][0];
  // The skin picture: the look's, else "custom" for a colour of one's own (an older look's), else the one
  // nearest the name's tone. The age, brows and lashes the name gives are a roll of their own, so the rest
  // of the name's look stays as it was.
  // (A community skin the other body doesn't have is read as MakeHuman's light one.)
  const kind = skinsFor(sex).some(([value]) => value === chosen.skin)
    ? chosen.skin
    : COMMUNITY_SKINS.some(([value]) => value === chosen.skin)
      ? "caucasian"
      : (ownSkin ?? usualRaceSkin) !== undefined
        ? "custom"
        : ["caucasian", "asian", "african"][Math.floor((usualSkin * 3) / SKIN_TONES.length)];
  const picture = kind !== "custom"; // (its lips and nails are the picture's own unless coloured by hand)
  const more = rng(hashString(`${name || "wanderer"}:avatar-age`));
  const usualAge = ageOf(more());
  const usualBrows = USUAL_BROWS[sex][Math.floor(more() * USUAL_BROWS[sex].length)];
  const usualLashes = USUAL_LASHES[sex][Math.floor(more() * USUAL_LASHES[sex].length)];
  // An anthro body's own sliders and colours, rolls of their own again: a natural coat or one of the ten
  // ancestries, the lighter fur or underside that goes with it, and eyes from the first few.
  const beast = rng(hashString(`${name || "wanderer"}:avatar-anthro`));
  for (const [key, , least, most] of ANTHRO_SHAPES) {
    const usual = clamp((beast() + beast() - 1) * 0.35, least, most);
    shape[key] = chosen.shape?.[key] ?? Math.round(usual * 100) / 100;
  }
  const said = chosen.colours ?? {};
  const pairOf = (list, colour, pale) => list.find(([hex]) => hex === colour)?.[2] ?? mixHex(colour, pale, 0.6);
  const usualFur = FUR_COLOURS[Math.floor(beast() * FUR_COLOURS.length)][0];
  const usualScales = SCALE_COLOURS[Math.floor(beast() * SCALE_COLOURS.length)][0];
  const beastEyes = BEAST_EYES[Math.floor(beast() * 5)][0];
  const [fur, scales] = [said.fur ?? usualFur, said.scales ?? usualScales];
  const hairColour = chosen.hairTint ?? HAIR_COLOURS[chosen.hairColour ?? usualHairColour][0];
  // Clothes: the look's (an empty list is nothing on), else the everyday clothes of the name's work.
  const everyday = everydayClothes(name, sex);
  const clothes = (chosen.clothes ?? everyday.clothes).filter(
    (piece) => !anthro || !ANTHRO_BARE_SLOTS.has(SLOT_OF[piece]),
  );
  const clothColours = {};
  for (const piece of clothes) {
    const dyed = { ...(chosen.clothes ? {} : everyday.clothColours[piece]), ...chosen.clothColours?.[piece] };
    if (Object.keys(dyed).length) clothColours[piece] = dyed;
  }
  const colours = {
    skin,
    eyes: said.eyes ?? (anthro ? beastEyes : ({ halforc: 0xb08a2a, tiefling: 0xe8c040 }[race] ?? usualEyes)),
    ...(anthro ? {} : { horns: said.horns ?? HORN_COLOURS[3][0] }),
    ...(species === "wolf"
      ? {
          fur,
          fur2: said.fur2 ?? pairOf(FUR_COLOURS, fur, 0xf0e8d8),
          nose: said.nose ?? NOSE_COLOURS[0][0],
          claws: said.claws ?? CLAW_COLOURS[0][0],
        }
      : {}),
    ...(species === "dragon"
      ? {
          scales,
          scales2: said.scales2 ?? pairOf(SCALE_COLOURS, scales, 0xf0e6c8),
          horns: said.horns ?? HORN_COLOURS[0][0],
        }
      : {}),
    // (Lips a little redder and darker than the skin, nails a little paler, brows a little darker than the hair.)
    // (On a race's own skin colour the lips are the skin, darker.)
    lips:
      chosen.colours?.lips ??
      (picture
        ? WHITE
        : skin === usualRaceSkin
          ? mixHex(skin, 0x000000, 0.3)
          : mixHex(mixHex(skin, 0xa04040, 0.35), 0x000000, 0.12)),
    nails: chosen.colours?.nails ?? (picture ? WHITE : mixHex(skin, 0xf6e6e0, 0.4)),
    brows: chosen.colours?.brows ?? mixHex(hairColour, 0x000000, 0.25),
    underwear:
      chosen.colours?.underwear ??
      chosen.tints?.top ??
      CLOTH_HEX[chosen.colour] ??
      CLOTH_HEX[chosen.rangerColour] ??
      usualCloth,
  };
  return {
    body: sex,
    species,
    wings: chosen.wings !== false,
    race,
    ...Object.fromEntries(RACE_PARTS.map(([field]) => [field, anthro ? BARE : (chosen[field] ?? usualParts[field])])),
    tail: !anthro && (chosen.tail ?? race === "tiefling"),
    gender: own,
    shape,
    limbs,
    height: clamp((chosen.height ?? usualHeight) * sized("height"), HEIGHTS[0], HEIGHTS[1]),
    colours,
    hair: anthro ? BARE : HAIRSTYLES.some(([style]) => style === chosen.hair) ? chosen.hair : usualHair,
    hairColour,
    underwear: {
      top: chosen.underwear?.top ?? (underwearByDefault && sex === "female" ? "bra" : BARE),
      bottom: chosen.underwear?.bottom ?? (underwearByDefault ? "briefs" : BARE),
    },
    clothes,
    clothColours,
    variants: anthro ? {} : (chosen.variants ?? {}), // (a hood up is made for a human head)
    job: chosen.clothes ? null : everyday.job, // (whose everyday clothes they wear, if the look doesn't say)
    age: chosen.age ?? usualAge,
    skin: anthro ? "custom" : kind,
    brows: chosen.brows ?? usualBrows,
    lashes: chosen.lashes ?? usualLashes,
    eyePicture: anthro ? TINT : (chosen.eyePicture ?? TINT),
    // (Nails are on unless chosen off: the body always had them.)
    nails: anthro ? "none" : (chosen.nails ?? "short"),
    toenails: !anthro && chosen.toenails !== false,
    seed: hashString(`${name}:motion`),
  };
}

/**
 * The shape keys' influences for a filled-in look on a body with shape keys `keys`. A two-way slider drives
 * a key each side of its middle (weight: thin or heavy; an anthro's neck, muzzle, ears, horns and tail
 * length), when the body has the one below; else its one key is run backwards (the human neck). `flat`
 * lays a wolf's neck ruff flat, and brings a dragon's neck in, under a piece that covers it.
 */
export function keyWeights(look, sex, keys, flat = false) {
  const weights = {
    age_middle: look.age === "middle" ? 1 : 0,
    age_old: look.age === "old" ? 1 : 0,
    ruff_flat: flat ? 1 : 0,
    collar_fit: flat ? 1 : 0, // (a dragon's deep neck, brought in to a person's where a collar goes round it)
  };
  for (const entry of [...SHAPES, ...FACE, ...FACE_DETAIL, ...BODY_DETAIL, ...RACE_SHAPES, ...ANTHRO_SHAPES]) {
    const [slider] = entry;
    const [low, high] = sliderKeys(slider, sex);
    const [least, most] = sliderRange(entry, keys);
    // (The waist key narrows; its slider widens.)
    const value = clamp(look.shape[slider], least, most) * (slider === "waist" ? -1 : 1);
    if (low && keys.includes(low)) {
      weights[low] = Math.max(0, -value);
      weights[high] = Math.max(0, value);
    } else weights[high] = value;
  }
  // A race's own key (a half-elf's is the elf's, half as far).
  // (Only the keys the body has: a human piece on an anthro body follows the ones they share.)
  for (const key of Object.keys(weights)) if (!keys.includes(key)) delete weights[key];
  return weights;
}

// ── The kit, read once a body ────────────────────────────────────────────────

/** A packed mesh's shape keys: { key: { ids (its own vertex numbers), delta, normal } }, as floats. */
function morphsOf(mesh, offset = 0) {
  const out = {};
  for (const [key, packed] of Object.entries(mesh.morphs ?? {})) {
    const ids = Uint32Array.from(view(mesh.count > 65535 ? Uint32Array : Uint16Array, packed.ids), (id) => id + offset);
    // (Moves in `q` steps of `d`: scripts/build-wanderworld-people.mjs packMesh.)
    const q = packed.q ?? 32767;
    const delta = Float32Array.from(view(Int16Array, packed.delta), (value, i) => (value / q) * packed.d[i % 3]);
    const normal = Float32Array.from(view(Int8Array, packed.normal), (value, i) => (value / 127) * packed.n[i % 3]);
    out[key] = { ids, delta, normal };
  }
  return out;
}

/** Shape keys worked into a copy of `position` and `normal`, by `weights` ({ key: influence }). */
function shaped(position, normal, morphs, weights) {
  const p = position.slice();
  const n = normal.slice();
  let moved = false;
  for (const [key, list] of Object.entries(morphs)) {
    const weight = weights[key] ?? 0;
    if (!weight) continue;
    for (const { ids, delta, normal: turn } of list) {
      for (let i = 0; i < ids.length; i++) {
        const at = ids[i] * 3;
        for (let c = 0; c < 3; c++) {
          p[at + c] += delta[i * 3 + c] * weight;
          n[at + c] += turn[i * 3 + c] * weight;
        }
      }
    }
    moved = true;
  }
  if (moved)
    for (let at = 0; at < n.length; at += 3) {
      const length = Math.hypot(n[at], n[at + 1], n[at + 2]) || 1;
      n[at] /= length;
      n[at + 1] /= length;
      n[at + 2] /= length;
    }
  return { position: p, normal: n };
}

const bodies = new Map();
/**
 * A body from the kit, made ready once and shared: its file, its meshes laid end to end (parts sharing a
 * texture together, opaque before see-through), what's shared by everyone with it, the shape keys, each
 * vertex's region, and the underwear styles it has.
 */
function bodyKit(sex, species = "human") {
  const name = bodyFile(species, sex);
  if (!bodies.has(name)) {
    const made = load(`${name}.pack.png`).then((file) => {
      // (Opaque parts first, then the cut-out ones; within each, a texture's parts together.)
      const order = file.meshes
        .map((mesh, i) => ({ mesh, i }))
        .sort(
          (a, b) =>
            !!a.mesh.alpha - !!b.mesh.alpha ||
            String(a.mesh.alpha).localeCompare(String(b.mesh.alpha)) ||
            String(a.mesh.texture).localeCompare(String(b.mesh.texture)) ||
            a.i - b.i,
        );
      const total = order.reduce((sum, { mesh }) => sum + mesh.count, 0);
      // (A long neck's skin is partly on the chest's bones, a dragon's most of all: what's above the neck
      // joint is neck all the same, so a tunic that hides the chest leaves it.)
      const jointAt = (joint) =>
        new Vector3().setFromMatrixPosition(
          new Matrix4().fromArray(file.inverseBind, file.joints.indexOf(joint) * 16).invert(),
        );
      const neckTop = jointAt("neck_01").y + 0.03;
      const position = new Float32Array(total * 3);
      const normal = new Float32Array(total * 3);
      const uv = new Float32Array(total * 2);
      const skinIndex = new Uint16Array(total * 4);
      const skinWeight = new Float32Array(total * 4);
      const regions = new Array(total);
      const morphs = {};
      const meshes = [];
      let offset = 0;
      for (const { mesh } of order) {
        const geometry = geometryOf(mesh);
        const { attributes } = geometry;
        position.set(attributes.position.array, offset * 3);
        normal.set(attributes.normal.array, offset * 3);
        if (attributes.uv) uv.set(attributes.uv.array, offset * 2);
        skinIndex.set(attributes.skinIndex.array, offset * 4);
        skinWeight.set(attributes.skinWeight.array, offset * 4);
        for (let v = 0; v < mesh.count; v++) {
          let best = 0;
          for (let c = 1; c < 4; c++)
            if (attributes.skinWeight.array[v * 4 + c] > attributes.skinWeight.array[v * 4 + best]) best = c;
          const region = REGION_OF[file.joints[attributes.skinIndex.array[v * 4 + best]]] ?? "";
          regions[offset + v] = region === "torso" && attributes.position.array[v * 3 + 1] > neckTop ? "neck" : region;
        }
        // (Its triangles, and those of its distant version: the full ones again where it has none.)
        const { full, far } = geometry.userData.distant ?? { full: { count: geometry.index.count } };
        const at = (range) =>
          Uint32Array.from(
            geometry.index.array.subarray(range.start ?? 0, (range.start ?? 0) + range.count),
            (vertex) => vertex + offset,
          );
        const index = at(full);
        for (const [key, morph] of Object.entries(morphsOf(mesh, offset))) (morphs[key] ??= []).push(morph);
        meshes.push({
          ...mesh,
          start: offset,
          index,
          far: far ? at(far) : index,
          group: `${mesh.alpha || "solid"}:${mesh.texture}`,
        });
        geometry.dispose();
        offset += mesh.count;
      }
      // The underwear styles its model has: a mesh each, or one layer (a body made before them) that is
      // the briefs, and a bra on her.
      const tops = new Set();
      const bottoms = new Set();
      const styles = { brows: [], lashes: [] }; // (the brow and lash styles it has, by number)
      for (const mesh of meshes) {
        const style = /^underwear-(top|bottom)-(.+)$/u.exec(mesh.piece ?? "");
        if (style) (style[1] === "top" ? tops : bottoms).add(style[2]);
        const face = /^eye(brows|lashes)-(\d+)$/u.exec(mesh.piece ?? "");
        if (face) styles[face[1]].push(Number(face[2]));
        if (mesh.piece === "underwear-legacy") {
          bottoms.add("briefs");
          if (sex === "female") tops.add("bra");
        }
      }
      const known = (list, have) => list.filter(([style]) => have.has(style)).map(([style]) => style);
      const box = new BufferGeometry();
      box.setAttribute("position", new BufferAttribute(position, 3));
      box.computeBoundingBox();
      box.computeBoundingSphere();
      return {
        file,
        sex,
        position,
        normal,
        regions,
        morphs,
        meshes,
        boundingBox: box.boundingBox,
        boundingSphere: box.boundingSphere,
        shared: {
          uv: new BufferAttribute(uv, 2),
          skinIndex: new BufferAttribute(skinIndex, 4),
          skinWeight: new BufferAttribute(skinWeight, 4),
        },
        indices: new Map(), // which triangles show (by underwear and what's hidden) → { index, groups }
        tops: known(UNDERWEAR_TOPS, tops),
        bottoms: known(UNDERWEAR_BOTTOMS, bottoms),
        brows: styles.brows.sort((a, b) => a - b),
        lashes: styles.lashes.sort((a, b) => a - b),
        eyeUvs: new Map(), // an eye picture's texture places (eyeUvsOf)
        // (A place inside the head and one in the hips, where a race's parts are tucked when they aren't worn.)
        tucked: {
          head: jointAt("Head")
            .add(new Vector3(0, 0.08, 0))
            .toArray(),
          hips: jointAt("pelvis").toArray(),
        },
      };
    });
    made.catch(() => bodies.delete(name)); // (tried again next time)
    bodies.set(name, made);
  }
  return bodies.get(name);
}

/** Whether a mesh of the body shows with this look's underwear, brows, lashes, wings and race's parts (facial
 *  hair, tusks, horns, a tail): the body's own always, a style only if chosen. */
function isWorn(mesh, look, sex) {
  if (!mesh.piece) return true;
  if (mesh.piece === "wings") return look.wings;
  if (mesh.piece === "tail-tiefling") return look.tail;
  const racePart = /^(beard|moustache|tusks|horns)-\d+$/u.exec(mesh.piece);
  if (racePart) return mesh.piece === look[{ tusks: "tusks", horns: "horns" }[racePart[1]] ?? "facialHair"];
  const face = /^eye(brows|lashes)-(\d+)$/u.exec(mesh.piece);
  if (face) return Number(face[2]) === look[face[1]];
  const { underwear } = look;
  if (mesh.piece === "underwear-legacy")
    return underwear.bottom === "briefs" || (sex === "female" && underwear.top === "bra");
  const style = /^underwear-(top|bottom)-(.+)$/u.exec(mesh.piece);
  return !!style && underwear[style[1]] === style[2];
}

/** The body's triangles that show (shared by everyone wearing the same and hiding the same), in groups. */
function trianglesOf(kit, look, hides) {
  const { underwear } = look;
  const key = `${underwear.top}|${underwear.bottom}|${look.brows}|${look.lashes}|${look.wings}|${look.facialHair}|${look.tusks}|${look.horns}|${look.tail}|${[...hides].sort().join(",")}`;
  if (!kit.indices.has(key)) {
    const hidden = (mesh) => {
      if (
        /^underwear/u.test(mesh.part) &&
        (hides.has("underwear") || (mesh.piece && hides.has(mesh.piece.replace(/-[^-]+$/u, ""))))
      )
        return () => true;
      if (!COVERED.has(mesh.part)) return () => false;
      return (a, b, c) => hides.has(kit.regions[a]) && hides.has(kit.regions[b]) && hides.has(kit.regions[c]);
    };
    // (Twice: the full triangles, then the distant version's, each group with its part of both.)
    const groups = [];
    const kept = [];
    const far = [];
    const keep = (list, index, hide) => {
      for (let i = 0; i < index.length; i += 3) {
        const [a, b, c] = [index[i], index[i + 1], index[i + 2]];
        if (!hide(a, b, c)) list.push(a, b, c);
      }
    };
    for (const mesh of kit.meshes) {
      if (!isWorn(mesh, look, kit.sex)) continue;
      const hide = hidden(mesh);
      if (groups.at(-1)?.name !== mesh.group)
        groups.push({ name: mesh.group, start: kept.length, count: 0, farStart: far.length, farCount: 0, mesh });
      keep(kept, mesh.index, hide);
      keep(far, mesh.far ?? mesh.index, hide);
      groups.at(-1).count = kept.length - groups.at(-1).start;
      groups.at(-1).farCount = far.length - groups.at(-1).farStart;
    }
    const Type = kit.position.length / 3 > 65535 ? Uint32Array : Uint16Array;
    const index = new Type(kept.length + far.length);
    index.set(kept);
    index.set(far, kept.length);
    kit.indices.set(key, {
      index: new BufferAttribute(index, 1),
      groups: groups
        .filter((group) => group.count)
        .map((group) => ({ ...group, farStart: kept.length + group.farStart })),
    });
  }
  return kit.indices.get(key);
}

/**
 * The body's texture places with the eyes' moved onto eye picture `picture`'s tile in avatar-eyes.webp (the
 * packer's EYE_GRID × EYE_GRID tiles, each the top 512 × 384 of a 512 picture: all its iris and eye white
 * use), made once a body and picture and shared. (One file for every picture spares the package's asset paths.)
 */
function eyeUvsOf(kit, picture) {
  if (!kit.eyeUvs.has(picture)) {
    const at = EYE_PICTURES.findIndex(([value]) => value === picture);
    const [column, row] = [at % EYE_GRID, Math.floor(at / EYE_GRID)];
    const uv = kit.shared.uv.array.slice();
    const eyes = kit.meshes.find((mesh) => mesh.part === "iris")?.texture;
    for (const mesh of kit.meshes.filter((each) => each.texture === eyes && !each.alpha))
      for (let v = mesh.start; v < mesh.start + mesh.count; v++) {
        uv[v * 2] = (column + uv[v * 2]) / EYE_GRID;
        uv[v * 2 + 1] = (row + (uv[v * 2 + 1] * 512) / 384) / EYE_GRID;
      }
    kit.eyeUvs.set(picture, new BufferAttribute(uv, 2));
  }
  return kit.eyeUvs.get(picture);
}

// ── Hair styles and outfit pieces: bundles, loaded when someone wears one ──
// The kit keeps them in a few bundles (scripts/build-wanderworld-people.mjs --avatar: the short and long
// hair; outfit pieces by their slots' group, looks.js CLOTH_SLOTS), each with its pictures inside, and an
// index of which bundle has which. Only a bundle someone wears from is fetched, once, and shared.
const HAIR_INDEX = "avatar-hair-index.json";
const OUTFIT_INDEX = "avatar-outfits-index.json";
/** A kit index ({} if the kit hasn't got it). */
const indexOf = (file) => load(file).catch(() => ({}));

/** Hair style `style` for `sex` from its bundle: { part, pictures }, or null if the kit hasn't got it. */
async function hairOf(style, sex) {
  const entry = (await indexOf(HAIR_INDEX))[style];
  if (!entry?.bodies.includes(sex)) return null;
  const bundle = await load(`${entry.bundle}.pack.png`).catch(() => null);
  const part = bundle?.styles?.[style]?.[sex];
  return part ? { key: `hair:${style}:${sex}`, part, pictures: bundle.pictures } : null;
}

/**
 * Outfit piece `piece` for `sex` from its bundle, worn the usual way or as `variant` (a cloak's hood up),
 * never both: { key, piece, slot, layer, hides, part, pictures }, or null if the kit hasn't got it.
 */
async function pieceOf(piece, sex, variant = "") {
  const entry = (await indexOf(OUTFIT_INDEX))[piece];
  if (!entry?.bodies.includes(sex)) return null;
  const bundle = await load(`${entry.bundle}.pack.png`).catch(() => null);
  const data = bundle?.pieces?.[piece];
  const way = data?.variants?.[variant]?.[sex] ? data.variants[variant] : data;
  if (!way?.[sex]) return null;
  const shown = way === data ? "" : variant;
  return {
    key: `outfit:${piece}:${sex}:${shown}`,
    piece,
    slot: data.slot,
    layer: data.layer ?? 0,
    hides: way.hides ?? [],
    part: way[sex],
    pictures: bundle.pictures,
  };
}

/** Pieces in these slots are small enough to leave out far from the camera (kit.js drawDistant). */
const SMALL_SLOTS = new Set(["brow", "neck", "waist", "arms"]);

const parts = new Map(); // a hair style's or outfit piece's meshes, made once: "hair:long:male" → [{ mesh, geometry, morphs, colours }]
/** A hair style's or outfit piece's meshes, decoded once and shared; `small` ones aren't drawn far off. */
function partMeshes(key, part, small = false) {
  if (!parts.has(key))
    parts.set(
      key,
      part.meshes.map((mesh) => {
        const geometry = geometryOf(mesh);
        geometry.userData.shared = true;
        if (small) {
          const full = geometry.userData.distant?.full ?? { start: 0, count: geometry.index.count };
          geometry.userData.distant = { full, far: { start: full.start, count: 0 } };
        }
        return {
          mesh,
          geometry,
          morphs: Object.fromEntries(Object.entries(morphsOf(mesh)).map(([k, morph]) => [k, [morph]])),
          colours: new Map(), // a piece's part colours (by vertex), shared by everyone wearing it in them
        };
      }),
    );
  return parts.get(key);
}

/**
 * Which shape keys, hair styles, underwear and outfit pieces the kit has for `sex`'s body of `species`:
 * what the Look card offers. Each piece as { piece, slot, parts: [[part, its colour as made (0xRRGGBB)]],
 * variants }. Only the indexes are read, not the bundles. An anthro body is offered no hair, nothing in
 * the slots made for a human head or foot (looks.js ANTHRO_BARE_SLOTS), and no other way of wearing a piece
 * (a hood up).
 */
export async function avatarChoices(sex, species = "human") {
  const anthro = species !== "human";
  const kit = await bodyKit(sex, species);
  const [hair, outfits] = await Promise.all([indexOf(HAIR_INDEX), indexOf(OUTFIT_INDEX)]);
  return {
    keys: kit.file.keys,
    wings: kit.meshes.some((mesh) => mesh.piece === "wings"),
    // (A race's parts this body's model has: the styles of facial hair, tusks and horns, and a tail.)
    ...Object.fromEntries(
      RACE_PARTS.map(([field, list]) => [
        field,
        list.map(([style]) => style).filter((style) => kit.meshes.some((mesh) => mesh.piece === style)),
      ]),
    ),
    tail: kit.meshes.some((mesh) => mesh.piece === "tail-tiefling"),
    races: RACES.map(([race]) => race).filter((race) => !raceOf(race).key || kit.file.keys.includes(raceOf(race).key)),
    tops: kit.tops,
    bottoms: kit.bottoms,
    brows: kit.brows,
    lashes: kit.lashes,
    hair: anthro
      ? []
      : HAIRSTYLES.map(([style]) => style).filter((style) => style === BARE || hair[style]?.bodies.includes(sex)),
    clothes: Object.entries(outfits)
      .filter(([piece, entry]) => entry.bodies.includes(sex) && SLOT_OF[piece] && !NAIL_COVERS[SLOT_OF[piece]])
      .filter(([piece]) => !anthro || !ANTHRO_BARE_SLOTS.has(SLOT_OF[piece]))
      .map(([piece, entry]) => ({
        piece,
        slot: entry.slot,
        parts: entry.parts[sex] ?? [],
        variants: anthro ? [] : (entry.variants ?? []),
      })),
  };
}

// ── The menu for a look designed by the AI ──
/**
 * Every field of a look and its options, in words, for the model that designs someone's built-in body from
 * their card (server.mjs `/look-design`); its answer is read by looks.js readDesign. The clothes are the
 * kit's, each marked when it's made for one body only. Made once (the kit's index is read once).
 */
let menuMade = null;
export function designMenu() {
  menuMade ??= indexOf(OUTFIT_INDEX).then((outfits) => {
    const listOf = (list) => list.map(([value]) => value).join(", ");
    const range = ([key, label, least, most, what, ends]) =>
      `  ${key}: ${least} to ${most}${ends ? ` (${ends[0]} to ${ends[1]})` : ""}, 0 is usual: ${label}${what ? `. ${what}` : ""}`;
    const bySlot = new Map(CLOTH_SLOTS.map(([slot, label]) => [slot, { label, pieces: [] }]));
    for (const [piece, label, slot] of CLOTHES) {
      const bodies = outfits[piece]?.bodies;
      if (!bodies?.length) continue;
      bySlot.get(slot)?.pieces.push(`${piece} (${label}${bodies.length === 1 ? `, ${bodies[0]} only` : ""})`);
    }
    return [
      'The look\'s fields (use these names and values exactly; colours as "#rrggbb"):',
      `body: male, female`,
      `species: human, or an anthro body, wolf or dragon (only for someone who is one)`,
      `race (a human): ${listOf(RACES)}`,
      `height: ${HEIGHTS[0]} to ${HEIGHTS[1]}, a share of a usual adult's height (1 is usual)`,
      `age: young (18 to 40), middle (about 50), old (70 and over)`,
      "shape: { field: number }, each:",
      ...[...SHAPES, ...FACE].map(range),
      "  (a wolf or dragon also has these)",
      ...ANTHRO_SHAPES.map(range),
      "limbs: { field: number }, each:",
      ...LIMBS.map(([key, label, least, most]) => `  ${key}: ${least} to ${most} (1 is usual): ${label}`),
      `skin: "custom" (then colours.skin is their skin's colour), or a skin picture: ${listOf(SKINS.filter(([value]) => value !== "custom"))}, or one of these (the body named after each): ${COMMUNITY_SKINS.map(([value, , bodies]) => `${value} (${bodies.join("/")})`).join(", ")}`,
      "colours: { skin, eyes, lips, nails, brows, underwear, horns, and for an anthro body its own: fur, fur2 (lighter fur), nose, claws (a wolf), scales, scales2 (underside) (a dragon) }",
      `eyePicture: tint (then colours.eyes is their eye colour), or a real eye: ${listOf(EYE_PICTURES)}`,
      `nails: ${listOf(NAILS)}; toenails: true or false (colours.nails is their colour)`,
      `hair: ${listOf(HAIRSTYLES)}; hairTint: their hair's colour`,
      ...RACE_PARTS.map(([field, list]) => `${field}: ${listOf(list)}`),
      "tail: true or false (a tiefling's tail); wings: true or false (a dragon's)",
      "clothes: a list of pieces, at most one for each slot (pieces made for one body only don't fit the other):",
      ...[...bySlot.values()]
        .filter(({ pieces }) => pieces.length)
        .map(({ label, pieces }) => `  ${label}: ${pieces.join(", ")}`),
      `clothColours: { piece: { part: colour } }, parts: ${listOf(CLOTH_PARTS)}`,
      "A wolf or dragon wears no hair, hats or shoes.",
    ].join("\n");
  });
  menuMade.catch(() => (menuMade = null));
  return menuMade;
}

// ── A race's build carried onto what's worn ──
// A race's shape key is the skin's, and the face's own pieces'. Underwear, hair and clothes carry none: on
// every piece they'd add several megabytes to the kit. Each of their vertices moves instead as the skin
// nearest it does (its four nearest vertices, the closer the more), worked out once a piece and shared.
// On the head too: a race's key leaves the skull as it is, but moves the brow, temples and nape under a
// hairline or a helm's edge, which would show through hair that stayed behind. The ears are left out of
// the skin that's followed: an elf's grow by centimetres, and would drag the hair beside them along.
// ponytail: a carried move leaves the piece's normals as they were (a change of girth barely turns them);
// if a race ever needs more, bake its key into the pieces when the kit is packed.
const CARRY_CELL = 0.04; // metres: the cells the skin's vertices are sorted into
const CARRY_NEAREST = 4;
const CARRY_REACH = 8; // cells: further than this from any skin, a vertex stays where it is
const cellAt = (x, y, z) => ((x + 512) << 20) | ((y + 512) << 10) | (z + 512);

/** A body's skin vertices (but the ears': what the pointed-ears key moves) sorted into cells, made once:
 *  cell → the vertices in it. */
function skinCells(kit) {
  if (!kit.cells) {
    kit.cells = new Map();
    const ears = new Set();
    for (const { ids, delta } of kit.morphs.ears_pointed ?? [])
      for (let i = 0; i < ids.length; i++)
        if (Math.hypot(delta[i * 3], delta[i * 3 + 1], delta[i * 3 + 2]) > 0.001) ears.add(ids[i]);
    for (const mesh of kit.meshes) {
      if (mesh.piece || mesh.part !== "skin") continue;
      for (let v = mesh.start; v < mesh.start + mesh.count; v++) {
        if (ears.has(v)) continue;
        const cell = cellAt(
          Math.floor(kit.position[v * 3] / CARRY_CELL),
          Math.floor(kit.position[v * 3 + 1] / CARRY_CELL),
          Math.floor(kit.position[v * 3 + 2] / CARRY_CELL),
        );
        if (!kit.cells.has(cell)) kit.cells.set(cell, []);
        kit.cells.get(cell).push(v);
      }
    }
  }
  return kit.cells;
}

/** For each vertex of `positions`, the body's skin vertices nearest it and their shares: { ids, shares }. */
function nearestSkin(kit, positions) {
  const cells = skinCells(kit);
  const skin = kit.position;
  const count = positions.length / 3;
  const ids = new Uint32Array(count * CARRY_NEAREST);
  const shares = new Float32Array(count * CARRY_NEAREST);
  const best = new Float64Array(CARRY_NEAREST); // the nearest so far, nearest first: how far (squared), and who
  const who = new Uint32Array(CARRY_NEAREST);
  for (let v = 0; v < count; v++) {
    const [x, y, z] = [positions[v * 3], positions[v * 3 + 1], positions[v * 3 + 2]];
    const [cx, cy, cz] = [x, y, z].map((value) => Math.floor(value / CARRY_CELL));
    let found = 0;
    // (Wider and wider, until the nearest few can't be bettered by a cell not yet looked in.)
    for (let reach = 1; reach <= CARRY_REACH; reach++) {
      found = 0;
      for (let i = -reach; i <= reach; i++)
        for (let j = -reach; j <= reach; j++)
          for (let k = -reach; k <= reach; k++)
            for (const id of cells.get(cellAt(cx + i, cy + j, cz + k)) ?? []) {
              const d = (skin[id * 3] - x) ** 2 + (skin[id * 3 + 1] - y) ** 2 + (skin[id * 3 + 2] - z) ** 2;
              if (found === CARRY_NEAREST && d >= best[found - 1]) continue;
              let at = found < CARRY_NEAREST ? found++ : found - 1;
              for (; at > 0 && best[at - 1] > d; at--) {
                best[at] = best[at - 1];
                who[at] = who[at - 1];
              }
              best[at] = d;
              who[at] = id;
            }
      if (found === CARRY_NEAREST && best[found - 1] <= (reach * CARRY_CELL) ** 2) break;
    }
    let total = 0;
    for (let n = 0; n < found; n++) total += 1 / (best[n] + 1e-6);
    for (let n = 0; n < found; n++) {
      ids[v * CARRY_NEAREST + n] = who[n];
      shares[v * CARRY_NEAREST + n] = 1 / (best[n] + 1e-6) / total;
    }
  }
  return { ids, shares };
}

/**
 * Shape key `key` of the body as a key for other vertices (`positions`, with their `near`est skin, numbered
 * from `offset`), in morphsOf's form: each moves as the skin near it does.
 */
function carried(kit, key, positions, near, offset = 0) {
  kit.moves ??= new Map(); // a key's moves, a vertex of the body each
  if (!kit.moves.has(key)) {
    const moves = new Float32Array(kit.position.length);
    for (const { ids, delta } of kit.morphs[key] ?? [])
      for (let i = 0; i < ids.length; i++) for (let c = 0; c < 3; c++) moves[ids[i] * 3 + c] += delta[i * 3 + c];
    kit.moves.set(key, moves);
  }
  const moves = kit.moves.get(key);
  const ids = [];
  const delta = [];
  for (let v = 0; v < positions.length / 3; v++) {
    const move = [0, 0, 0];
    for (let n = 0; n < CARRY_NEAREST; n++) {
      const share = near.shares[v * CARRY_NEAREST + n];
      const id = near.ids[v * CARRY_NEAREST + n];
      for (let c = 0; c < 3; c++) move[c] += moves[id * 3 + c] * share;
    }
    if (Math.max(Math.abs(move[0]), Math.abs(move[1]), Math.abs(move[2])) < 1e-4) continue;
    ids.push(v + offset);
    delta.push(...move);
  }
  return { ids: Uint32Array.from(ids), delta: Float32Array.from(delta), normal: new Float32Array(ids.length * 3) };
}

// ── Joints that follow the body's shape ──
/**
 * Moves the rig's joints by what the look's keys move them (`moves`: { key: { joint: [x, y, z] } }, the
 * kit's; `weights`: { key: influence }), each staying on its parent. Returns what binding needs to keep the
 * skin where it was (people.js skeletonFor's `moved`: joint → the move undone), or null if nothing moved.
 */
function moveJoints(root, bones, moves, weights) {
  const by = new Map();
  for (const [key, joints] of Object.entries(moves ?? {})) {
    const weight = weights[key] ?? 0;
    if (!weight) continue;
    for (const [joint, move] of Object.entries(joints)) {
      if (!bones.has(joint)) continue;
      if (!by.has(joint)) by.set(joint, new Vector3());
      by.get(joint).add(new Vector3(...move).multiplyScalar(weight));
    }
  }
  if (!by.size) return null;
  root.updateMatrixWorld(true);
  const rootInverse = root.matrixWorld.clone().invert();
  // Each joint's place in the body's space, moved; then each joint's place on its parent from those.
  const places = new Map();
  for (const [name, bone] of bones) {
    const place = rootInverse.clone().multiply(bone.matrixWorld);
    const move = by.get(name);
    if (move) place.premultiply(new Matrix4().makeTranslation(move.x, move.y, move.z));
    places.set(name, place);
  }
  for (const [name, bone] of bones) {
    const parent = bone.parent?.isBone ? places.get(bone.parent.name) : null;
    const local = parent ? parent.clone().invert().multiply(places.get(name)) : places.get(name);
    local.decompose(bone.position, bone.quaternion, bone.scale);
  }
  root.updateMatrixWorld(true);
  return new Map([...by].map(([name, move]) => [name, new Matrix4().makeTranslation(-move.x, -move.y, -move.z)]));
}

// ── Making one ───────────────────────────────────────────────────────────────

/**
 * The avatar for `name` with `look` (a checked look, looks.js) and `gender` ("male", "female" or "auto"),
 * as a standing figure (figure.js standFigure): { object, root, bones, meshes, dispose, avatar (the look
 * filled in), kit }. Rejects if the kit's body can't be loaded; a hair style or outfit piece the kit
 * hasn't got is left off.
 */
export async function createAvatar(look = {}, name = "", gender = "auto") {
  const filled = avatarLook(name, gender, look);
  const sex = filled.body;
  // The nails: pieces of their own, worn unless gloves or shoes cover them, in the look's nail colour (or as
  // made, beside a skin picture). They go on with the clothes but aren't among them.
  const covered = new Set(filled.clothes.map((piece) => SLOT_OF[piece]));
  const nails = [
    ...(filled.nails !== "none" && !covered.has(NAIL_COVERS.nails) ? [`nails_${filled.nails}`] : []),
    ...(filled.toenails && !covered.has(NAIL_COVERS.toenails) ? ["toenails"] : []),
  ];
  const dyes = { ...filled.clothColours };
  if (filled.colours.nails !== WHITE) for (const piece of nails) dyes[piece] = { nail: filled.colours.nails };
  const [kit, hair, worn] = await Promise.all([
    bodyKit(sex, filled.species),
    filled.hair === BARE ? null : hairOf(filled.hair, sex),
    Promise.all([...filled.clothes, ...nails].map((piece) => pieceOf(piece, sex, filled.variants[piece]))),
  ]);
  const { root, bones } = rigOf(kit.file);
  let moved = null; // joints moved with the body's shape (below), for binding
  // Outfit pieces (innermost first, by their layer): what they cover is hidden on the body, a hood or helm
  // that hides the hair hides it, and one over the neck or chest lays a wolf's ruff flat under it.
  const hides = new Set();
  const pieces = worn.filter(Boolean).sort((a, b) => a.layer - b.layer);
  for (const piece of pieces) for (const word of piece.hides) hides.add(word);
  const flat = hides.has("neck") || hides.has("torso") || pieces.some((piece) => RUFF_SLOTS.has(piece.slot));
  const weights = keyWeights(filled, sex, kit.file.keys, flat);
  // The finger joints go where the look's keys put the knuckles (the kit's jointMoves: a dwarf's bigger
  // hand, an old back's lower one), or a finger would turn about a pivot left behind in the plain hand.
  moved = moveJoints(root, bones, kit.file.jointMoves, weights);
  // A race: its key on the skin, carried onto the underwear worn (and, below, the hair and clothes), and its
  // sizes: the legs, arms and head with the look's own, and the whole figure.
  // (A race is its sliders now; only an anthro kind still brings sizes of its own.)
  const race = { height: 1, legs: 1, arms: 1, head: 1, ...SPECIES_SIZES[filled.species] };
  const isRace = (key) => key.startsWith("race_");
  // Keys the body's own pieces don't carry, worked out from the skin the first time a worn piece needs one:
  // a race's onto the underwear, and the face and body in detail (`<slider>.lo`, `.hi`) onto the underwear,
  // brows, lashes, facial hair, horns, tusks and tail (the model leaves them out of those, to stay small).
  for (const [key, weight] of Object.entries(weights)) {
    if (!weight || !(isRace(key) || key.includes(".")) || !kit.morphs[key]) continue;
    for (const mesh of kit.meshes) {
      if (!mesh.piece || mesh.morphs?.[key] || !isWorn(mesh, filled, sex)) continue;
      if (isRace(key) && !/^underwear/u.test(mesh.piece)) continue; // (the face's pieces have the races' keys)
      mesh.carried ??= new Set();
      if (mesh.carried.has(key)) continue;
      mesh.carried.add(key);
      const own = kit.position.subarray(mesh.start * 3, (mesh.start + mesh.count) * 3);
      kit.morphs[key].push(carried(kit, key, own, (mesh.near ??= nearestSkin(kit, own)), mesh.start));
    }
  }

  // Arm and leg length: each bone of the limb stretched along itself in its own space (its inverse bind
  // matrix), and the next one moved out to match, so the limb grows longer, not thicker, and the hands and
  // feet stay their size. The head is scaled from its joint at the neck.
  const stretch = new Map();
  for (const [limb, chain] of Object.entries(LIMB_BONES)) {
    const k = filled.limbs[limb] * race[limb] - 1;
    if (!k) continue;
    for (const [boneName, nextName] of chain) {
      const next = bones.get(nextName);
      if (!bones.has(boneName) || !next) continue;
      const { x, y, z } = next.position.clone().normalize();
      stretch.set(
        boneName,
        new Matrix4().set(
          1 + k * x * x,
          k * x * y,
          k * x * z,
          0,
          k * y * x,
          1 + k * y * y,
          k * y * z,
          0,
          k * z * x,
          k * z * y,
          1 + k * z * z,
          0,
          0,
          0,
          0,
          1,
        ),
      );
      next.position.multiplyScalar(1 + k);
    }
  }
  const head = filled.limbs.head * race.head;
  if (head !== 1) stretch.set("Head", new Matrix4().makeScale(head, head, head));
  root.updateMatrixWorld(true);

  const owned = []; // what this person alone has, to let go of with them
  const bind = (geometry, materials, part, fallback = null) => {
    const mesh = new SkinnedMesh(geometry, materials);
    mesh.frustumCulled = false;
    mesh.name = fallback ? "piece" : "body"; // (hair and outfit pieces are bound to the body's skeleton)
    mesh.userData.sharedShadow = true; // (disposed here, so the shared data stays: avatar.js `dispose`)
    root.add(mesh);
    mesh.bind(skeletonFor(root, bones, part, stretch, fallback, moved), mesh.matrixWorld);
    return mesh;
  };

  // The body: its shape keys worked in, each vertex coloured by its part. A skin picture (of their age) or
  // an eye picture is drawn white, in place of the model's own tinted texture, loaded the first time
  // someone wears it and shared.
  const { position, normal } = shaped(kit.position, kit.normal, kit.morphs, weights);
  // (A race's part that isn't worn is drawn by no triangle, but its vertices would still count in the
  // person's size, tall horns most of all: they're tucked inside the head, a tail's in the hips.)
  for (const mesh of kit.meshes) {
    if (!/^(?:beard|moustache|tusks|horns|tail)-/u.test(mesh.piece ?? "") || isWorn(mesh, filled, sex)) continue;
    const place = kit.tucked[mesh.piece.startsWith("tail") ? "hips" : "head"];
    for (let v = mesh.start; v < mesh.start + mesh.count; v++) position.set(place, v * 3);
  }
  const textureOfPart = (part) => kit.meshes.find((mesh) => mesh.part === part)?.texture;
  const swapped = new Map();
  const skinPicture = skinPictureOf(filled.skin, sex, filled.age);
  if (skinPicture) swapped.set(textureOfPart("skin"), texture(skinPicture));
  if (filled.eyePicture !== TINT) swapped.set(textureOfPart("iris"), texture("avatar-eyes"));
  const anthro = filled.species !== "human";
  // The skin and lips share one picture: painted for this avatar (skin.js) with its skin colour and its
  // lips coloured through the body's mask, so their edge is clean. Where it can't be painted (no canvas,
  // as in Node, or no mask for the body), they're coloured by vertex as before. (The nails are pieces of
  // their own, worn with the clothes.)
  const painted =
    anthro || !kit.file.keys
      ? null
      : await paintedSkin({
          sex,
          base: skinPicture ?? textureOfPart("skin"),
          skin: filled.skin === "custom" ? filled.colours.skin : WHITE,
          lips: filled.colours.lips,
        }).catch(() => null);
  if (painted) swapped.set(textureOfPart("skin"), painted);
  const paintedParts = new Set(painted ? ["skin", "lips"] : []);
  // (An anthro body's parts are its own: fur and its tufts, scales, horns…; what isn't here stays as made.)
  const colourOf = (part) =>
    paintedParts.has(part)
      ? WHITE
      : {
          skin: filled.skin === "custom" ? filled.colours.skin : WHITE,
          underwear: filled.colours.underwear,
          underwear_trim: mixHex(filled.colours.underwear, 0x000000, 0.3),
          iris: filled.eyePicture === TINT ? filled.colours.eyes : WHITE,
          eyes: filled.colours.eyes,
          eyebrows: filled.colours.brows,
          eyelashes: anthro ? undefined : mixHex(filled.colours.brows, 0x000000, 0.5),
          lips: filled.colours.lips,
          nails: filled.colours.nails,
          fur: filled.colours.fur,
          fur_tufts: filled.colours.fur,
          fur2: filled.colours.fur2,
          fur2_tufts: filled.colours.fur2,
          nose: filled.colours.nose,
          claws: filled.colours.claws ?? filled.colours.horns, // (a dragon's are its horns' colour)
          scales: filled.colours.scales,
          scales2: filled.colours.scales2,
          horns: filled.colours.horns,
          hair: filled.hairColour, // (facial hair)
        }[part];
  const colour = new Uint16Array(position.length);
  const tint = new Color();
  for (const mesh of kit.meshes) {
    const hex = colourOf(mesh.part);
    if (hex === undefined) tint.setRGB(...mesh.colour);
    else tint.setHex(hex); // (an sRGB colour, as the material's linear factor)
    for (let v = mesh.start; v < mesh.start + mesh.count; v++) {
      colour[v * 3] = Math.round(tint.r * 65535);
      colour[v * 3 + 1] = Math.round(tint.g * 65535);
      colour[v * 3 + 2] = Math.round(tint.b * 65535);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(position, 3));
  geometry.setAttribute("normal", new BufferAttribute(normal, 3));
  geometry.setAttribute("color", new BufferAttribute(colour, 3, true));
  for (const [attribute, shared] of Object.entries(kit.shared)) geometry.setAttribute(attribute, shared);
  if (filled.eyePicture !== TINT) geometry.setAttribute("uv", eyeUvsOf(kit, filled.eyePicture));
  const { index, groups } = trianglesOf(kit, filled, hides);
  geometry.setIndex(index);
  geometry.userData.distant = { groups: true }; // (each group has its own: kit.js drawDistant)
  const materials = groups.map((group, i) => {
    geometry.addGroup(group.start, group.count, i);
    geometry.groups[i].distant = {
      full: { start: group.start, count: group.count },
      far: { start: group.farStart, count: group.farCount },
    };
    const cut = !!group.mesh.alpha;
    const masked = group.mesh.alpha === "MASK"; // (a beard's cards: cut out by their texture, solid otherwise)
    // Brows and lashes (MakeHuman's) are blended by their texture's alpha, softer than a cut-out: drawn
    // with the see-through things, after everything solid, without hiding what's behind them. Every part is
    // seen from both sides, as the model's materials say: some faces (the irises) face inwards, and shown
    // from the front only they'd show what's behind them.
    // ponytail: two-sided costs a little; once make_avatar.py turns those faces outwards, the opaque
    // parts can be front-only again.
    return new MeshLambertMaterial({
      map:
        swapped.get(group.mesh.texture) ?? (group.mesh.texture ? texture(group.mesh.texture, kit.file.pictures) : null),
      vertexColors: true,
      side: DoubleSide,
      // (The faint alpha test leaves the empty parts of a card out of shadows too.)
      ...(masked ? { alphaTest: 0.5 } : cut ? { transparent: true, depthWrite: false, alphaTest: 0.05 } : {}),
    });
  });
  geometry.boundingBox = kit.boundingBox.clone();
  geometry.boundingSphere = kit.boundingSphere.clone();
  bind(geometry, materials, kit.file);
  owned.push(() => {
    // (Only what's this person's: the shared texture places, weights and triangles stay for the rest.)
    for (const attribute of Object.keys(kit.shared)) geometry.deleteAttribute(attribute);
    geometry.setIndex(null);
    geometry.dispose();
    for (const material of materials) material.dispose();
  });

  // Hair and outfit pieces: shared meshes, or each person's own when they have shape keys to follow. An
  // outfit piece is one mesh coloured by vertex, each of its parts (cloth, trim, metal…) the look's colour
  // or as made, those colours shared by everyone wearing the same.
  const wearPart = ({ key, part, pictures, slot, piece }, colourFor) => {
    for (const made of partMeshes(key, part, SMALL_SLOTS.has(slot))) {
      const { mesh, geometry: shared, morphs, colours } = made;
      // (A race's build, carried onto the piece from the skin the first time one of that race wears it.)
      // (The face in detail, the same way: hair, hats and collars follow a wider head, a longer neck or a
      // higher forehead. Each key is carried the first time it's used on the piece, and kept.)
      for (const [name, weight] of Object.entries(weights))
        if (weight && (name.includes(".") || isRace(name)) && !morphs[name] && kit.morphs[name]) {
          const own = shared.attributes.position.array;
          morphs[name] = [carried(kit, name, own, (made.near ??= nearestSkin(kit, own)))];
        }
      let geometry = shared;
      let colour = null;
      if (mesh.partOf) {
        const hexes = mesh.parts.map(({ part: name }) => dyes[piece]?.[name] ?? null);
        const said = hexes.join();
        if (!colours.has(said)) {
          const tints = mesh.parts.map(({ colour: made }, i) =>
            hexes[i] === null ? new Color().setRGB(...made) : new Color().setHex(hexes[i]),
          );
          const partOf = view(Uint8Array, mesh.partOf);
          const values = new Uint16Array(partOf.length * 3);
          partOf.forEach((at, v) => {
            values[v * 3] = Math.round(tints[at].r * 65535);
            values[v * 3 + 1] = Math.round(tints[at].g * 65535);
            values[v * 3 + 2] = Math.round(tints[at].b * 65535);
          });
          colours.set(said, new BufferAttribute(values, 3, true));
        }
        colour = colours.get(said);
      }
      const keyed = Object.keys(morphs).length > 0;
      if (keyed || colour) {
        // (Its own geometry over the shared data: its positions and normals shaped, its colours.)
        const moved = keyed
          ? shaped(shared.attributes.position.array, shared.attributes.normal.array, morphs, weights)
          : null;
        const borrowed = ["uv", "skinIndex", "skinWeight", ...(keyed ? [] : ["position", "normal"])];
        geometry = new BufferGeometry();
        if (moved) {
          geometry.setAttribute("position", new BufferAttribute(moved.position, 3));
          geometry.setAttribute("normal", new BufferAttribute(moved.normal, 3));
        }
        for (const attribute of borrowed)
          if (shared.attributes[attribute]) geometry.setAttribute(attribute, shared.attributes[attribute]);
        if (colour) {
          geometry.setAttribute("color", colour);
          borrowed.push("color");
        }
        geometry.setIndex(shared.index);
        geometry.userData.distant = shared.userData.distant;
        geometry.boundingBox = shared.boundingBox;
        geometry.boundingSphere = shared.boundingSphere;
        const own = geometry;
        owned.push(() => {
          for (const attribute of borrowed) own.deleteAttribute(attribute);
          own.setIndex(null);
          own.dispose();
        });
      }
      const material = new MeshLambertMaterial({
        map: mesh.texture ? texture(mesh.texture, pictures) : null,
        color: colourFor(mesh),
        vertexColors: !!colour,
        ...(mesh.alpha ? { alphaTest: 0.5, side: DoubleSide } : {}),
      });
      owned.push(() => material.dispose());
      bind(geometry, material, part, kit.file);
    }
  };
  // (A hood or helm that hides the hair leaves it off.)
  if (hair && !hides.has("hair")) wearPart(hair, () => new Color(filled.hairColour));
  for (const piece of pieces) wearPart(piece, (mesh) => (mesh.partOf ? 0xffffff : new Color().setRGB(...mesh.colour)));

  const figure = standFigure(root, bones, filled.height * race.height);
  figure.dispose = () => {
    for (const letGo of owned) letGo();
  };
  figure.avatar = filled; // (what it was made from, for the maker's controls and the exporter)
  figure.kit = kit;
  return figure;
}
