// Default people: for anyone without a 3D model, a person put together from Quaternius's Universal Base
// Characters and Modular Character Outfits - Fantasy (CC0): everyday clothes in one of several colours, a
// head, a hairstyle, skin and hair tones and a height, all chosen from the name. Made by scripts/build-wanderworld-people.mjs into
// kit/generic/people/ and kit/fantasy/outfits/, served as package assets, and loaded only when needed (then cached).
//
// Every part keeps its own joints' inverse bind matrices and binds to one shared skeleton (the outfit's),
// so a head cut from the base body and a hairstyle rigged to its head bone sit right on any outfit. The
// result becomes a humanoid exactly like a GLB model from 3D Avatars (models.js), so it walks, sits and
// plays the recorded clips the same way.
import {
  Bone,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  Matrix4,
  MeshLambertMaterial,
  Skeleton,
  SkinnedMesh,
  SRGBColorSpace,
  TextureLoader,
  Uint16BufferAttribute,
} from "three";
import { humanoidFromSkeleton } from "./models.js";
import {
  BARE,
  COLOUR_FIELD,
  EXTRAS,
  HAIR_COLOURS,
  HAIR_FILE,
  OUTFITS,
  PIECES,
  RANGER_SHARE,
  SKIN_TONES,
  USUAL_HAIR,
  USUAL_HAIR_COLOURS,
} from "./looks.js";
import { hashString, rng } from "./world.js";

// The bodies (skeletons, heads, hair, skin) are any world's, in kit/generic/people, one file for them
// all (bodies.json); the outfits and their cloth are the medieval one's, in kit/fantasy/outfits. A file's
// name says which it is.
const KIT = "/api/capability-packages/wanderworld/assets/kit/";
const BODY_FILE = /^(?:index|bodies|eyes|hair-|head-|plain-head-|plain-skin-|skin-)/u;
const FOLK_FILE = /^folk[-.]/u; // the monsters on the people's skeleton (the imp, the puglin)
const urlOf = (name) =>
  `${KIT}${FOLK_FILE.test(name) ? "fantasy/folk" : BODY_FILE.test(name) ? "generic/people" : "fantasy/outfits"}/${name}`;

/** The pack's (Unreal mannequin) bone for each humanoid bone. */
const BONES = {
  hips: "pelvis",
  spine: "spine_01",
  chest: "spine_02",
  upperChest: "spine_03",
  neck: "neck_01",
  head: "Head",
  leftShoulder: "clavicle_l",
  leftUpperArm: "upperarm_l",
  leftLowerArm: "lowerarm_l",
  leftHand: "hand_l",
  rightShoulder: "clavicle_r",
  rightUpperArm: "upperarm_r",
  rightLowerArm: "lowerarm_r",
  rightHand: "hand_r",
  leftUpperLeg: "thigh_l",
  leftLowerLeg: "calf_l",
  leftFoot: "foot_l",
  leftToes: "ball_l",
  rightUpperLeg: "thigh_r",
  rightLowerLeg: "calf_r",
  rightFoot: "foot_r",
  rightToes: "ball_r",
};
for (const [side, s] of [
  ["left", "l"],
  ["right", "r"],
]) {
  for (const [finger, name] of [
    ["Index", "index"],
    ["Middle", "middle"],
    ["Ring", "ring"],
    ["Little", "pinky"],
  ]) {
    BONES[`${side}${finger}Proximal`] = `${name}_01_${s}`;
    BONES[`${side}${finger}Intermediate`] = `${name}_02_${s}`;
    BONES[`${side}${finger}Distal`] = `${name}_03_${s}`;
  }
  BONES[`${side}ThumbMetacarpal`] = `thumb_01_${s}`;
  BONES[`${side}ThumbProximal`] = `thumb_02_${s}`;
  BONES[`${side}ThumbDistal`] = `thumb_03_${s}`;
}

const files = new Map();
const textures = new Map();
const loader = new TextureLoader();

function load(name) {
  if (!files.has(name)) {
    files.set(
      name,
      fetch(urlOf(name)).then((response) => {
        if (!response.ok) throw new Error(`GET ${name} → ${response.status}`);
        return response.json();
      }),
    );
  }
  return files.get(name);
}

/** A kit texture, loaded once and shared by everyone (never disposed with a person). */
function texture(name) {
  if (!textures.has(name)) {
    const map = loader.load(urlOf(`${name}.webp`));
    map.flipY = false; // glTF texture coordinates
    map.colorSpace = SRGBColorSpace;
    map.userData.shared = true;
    textures.set(name, map);
  }
  return textures.get(name);
}

const bytes = (base64) => Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
const view = (Type, base64) => {
  const raw = bytes(base64);
  return new Type(raw.buffer, raw.byteOffset, raw.byteLength / Type.BYTES_PER_ELEMENT);
};

/** One packed mesh as geometry (positions back from their int16 box, normals from int8, uvs from uint16). */
function geometryOf(mesh) {
  const quantized = view(Int16Array, mesh.position);
  const position = new Float32Array(quantized.length);
  for (let i = 0; i < quantized.length; i++) {
    const axis = i % 3;
    const min = mesh.box[axis];
    const span = mesh.box[axis + 3] - min;
    position[i] = min + ((quantized[i] + 32768) / 65535) * span;
  }
  const normalRaw = view(Int8Array, mesh.normal);
  const normal = Float32Array.from(normalRaw, (value) => value / 127);
  const uv = Float32Array.from(view(Uint16Array, mesh.uv), (value) => value / 65535);
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(position, 3));
  geometry.setAttribute("normal", new BufferAttribute(normal, 3));
  geometry.setAttribute("uv", new BufferAttribute(uv, 2));
  geometry.setAttribute("skinIndex", new Uint16BufferAttribute(Uint16Array.from(view(Uint8Array, mesh.joints)), 4));
  geometry.setAttribute(
    "skinWeight",
    new BufferAttribute(
      Float32Array.from(view(Uint8Array, mesh.weights), (value) => value / 255),
      4,
    ),
  );
  geometry.setIndex(new BufferAttribute(mesh.wide ? view(Uint32Array, mesh.index) : view(Uint16Array, mesh.index), 1));
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

/**
 * A person's look: from their name, with whatever was chosen for them by hand (`chosen`: looks.js) over
 * it. The name's choices are made the same way whatever is chosen, so changing one thing changes only that.
 *
 * Returns what createPerson builds from ({ sex, parts: the kit's piece files, colourways: { outfit: its
 * cloth's texture }, tint, hair, beard, skin, hairColour, height, seed }), `choices` (every field of a
 * look, filled in, as the Look card shows it) and `worn` (the outfits with a piece on show).
 */
export function lookFor(name, index, body = "auto", chosen = {}) {
  const random = rng(hashString(`${name || "wanderer"}:kit`));
  const pick = (list) => list[Math.floor(random() * list.length)];
  // The body chosen in the People menu (later: from the character card), or else one from the name.
  const fromName = random() < 0.5 ? "male" : "female";
  const sex = body === "male" || body === "female" ? body : fromName;
  const outfits = index.sexes[sex].outfits;
  const has = (kind) => outfits.some((entry) => entry.name === `${sex}-${kind}`);
  const coloursOf = (kind) => outfits.find((entry) => entry.name === `${sex}-${kind}`)?.colourways ?? [];
  // Most are townsfolk; now and then someone is dressed for the road.
  const usual = random() < RANGER_SHARE && has("ranger") ? "ranger" : "peasant";
  const usualColour = pick(coloursOf(usual));
  const usualHair = pick(USUAL_HAIR[sex]);
  const usualBeard = sex === "male" && random() < 0.3;
  const usualSkin = Math.floor(random() * SKIN_TONES.length);
  const usualHairColour = Math.floor(random() * USUAL_HAIR_COLOURS);
  const usualHeight = 0.94 + random() * 0.12;

  const outfit = chosen.outfit && has(chosen.outfit) ? chosen.outfit : usual;
  const choices = { outfit };
  // Each piece is the outfit's unless another's was chosen for it (and the kit has that piece).
  for (const [piece] of PIECES) {
    const kind = chosen[piece];
    choices[piece] = kind && index.sexes[sex].pieces?.[piece]?.includes(kind) ? kind : outfit;
  }
  // The ranger's hood and pauldrons go with the ranger's top, unless said.
  for (const [extra, , kind] of EXTRAS) choices[extra] = chosen[extra] ?? choices.top === kind;
  // Each outfit's cloth: the colour chosen for it, the name's own for the outfit the name gave, or one
  // from the name for the other.
  const colourways = {};
  for (const [kind, field] of Object.entries(COLOUR_FIELD)) {
    const colours = coloursOf(kind);
    if (!colours.length) continue;
    colourways[kind] = colours.includes(chosen[field])
      ? chosen[field]
      : kind === usual
        ? usualColour
        : colours[hashString(`${name}:${kind}`) % colours.length];
    choices[field] = colourways[kind];
  }
  Object.assign(choices, {
    tints: { ...(chosen.tints ?? {}) },
    skinTint: chosen.skinTint ?? null,
    hair: chosen.hair ?? usualHair,
    hairColour: chosen.hairColour ?? usualHairColour,
    hairTint: chosen.hairTint ?? null,
    skin: chosen.skin ?? usualSkin,
    beard: sex === "male" && (chosen.beard ?? usualBeard),
    height: chosen.height ?? usualHeight,
  });
  const parts = PIECES.map(([piece]) => `${sex}-${choices[piece]}-${piece}`);
  for (const [extra, , kind] of EXTRAS) if (choices[extra]) parts.push(`${sex}-${kind}-${extra}`);
  const worn = new Set(PIECES.map(([piece]) => choices[piece]).filter((kind) => kind !== BARE));
  for (const [extra, , kind] of EXTRAS) if (choices[extra]) worn.add(kind);
  return {
    sex,
    parts,
    colourways,
    tints: choices.tints,
    // (A tone from the list is painted on just as a colour of one's own is: it comes out as that colour.)
    skinTint: choices.skinTint ?? SKIN_TONES[choices.skin][0],
    hair: choices.hair,
    beard: choices.beard,
    skin: [1, 1, 1],
    hairColour: choices.hairTint ?? HAIR_COLOURS[choices.hairColour][0],
    height: choices.height,
    seed: hashString(`${name}:motion`),
    choices,
    worn: [...worn],
  };
}

/** How `name` looks now, as the Look card's choices (looks.js), with their sex: loads the kit's index. */
export async function lookChoices(name, body = "auto", chosen = {}) {
  const look = lookFor(name, await load("index.json"), body, chosen);
  return { ...look.choices, sex: look.sex, worn: look.worn, outfits: Object.keys(OUTFITS) };
}

/** The default person for `name` with `build` ("male", "female" or "auto") and whatever look was
 *  `chosen` for them (looks.js), as a walking character. Rejects if the kit can't be loaded. */
export async function createPerson(name, build = "auto", chosen = {}) {
  const index = await load("index.json");
  const look = lookFor(name, index, build, chosen);
  const parts = [`skeleton-${look.sex}`, ...look.parts, `head-${look.sex}`];
  if (look.hair !== "none") parts.push(`hair-${HAIR_FILE(look.hair, look.sex)}`);
  if (look.beard) parts.push("hair-beard");
  // An outfit's pieces come in one file ("male-ranger.json": { pieces: { top, arms, … } }); a part named
  // "male-ranger-top" is that file's top.
  const [body, ...rest] = await Promise.all(
    parts.map((part) => {
      const piece = /^(male|female)-([a-z]+)-([a-z]+)$/u.exec(part);
      const whole = piece && !part.startsWith("hair-") && !part.startsWith("head-") && !part.startsWith("skeleton-");
      // (A piece left off is the bare body's there; that, and every head, hair and skeleton, is in bodies.json.)
      if (!whole) return load("bodies.json").then((file) => file.parts[part]);
      if (piece[2] === "none") return load("bodies.json").then((file) => file.bare[piece[1]].pieces[piece[3]]);
      return load(`${piece[1]}-${piece[2]}.json`).then((file) => file.pieces[piece[3]]);
    }),
  );

  const { root, bones } = rigOf(body);

  const skinTint = new Color(...look.skin);
  const hairTint = new Color(look.hairColour);
  // A colour of one's own (a piece's, or the skin's) goes on the plain, grey texture: times the colour
  // over how light that piece is there (the kit's `tones`), it comes out as the colour picked.
  const painted = (colour, tone) => {
    const [want, grey] = [new Color(colour), new Color().setRGB(tone / 255, tone / 255, tone / 255, SRGBColorSpace)];
    return new Color(Math.min(6, want.r / grey.r), Math.min(6, want.g / grey.g), Math.min(6, want.b / grey.b));
  };
  const tones = index.tones ?? {};
  const materialFor = (name, partName) => {
    const isSkin = name.startsWith("skin-") || name.startsWith("head-");
    const isHair = name.startsWith("hair-");
    if (isSkin && look.skinTint !== null && tones[name]) {
      return new MeshLambertMaterial({ map: texture(`plain-${name}`), color: painted(look.skinTint, tones[name]) });
    }
    // A piece's cloth is named for its outfit ("clothes-ranger"): that outfit's colour, or the piece's own.
    const kind = name.startsWith("clothes-") ? name.slice("clothes-".length) : null;
    const piece = partName.slice(partName.lastIndexOf("-") + 1);
    if (kind && look.tints[piece] !== undefined && tones[partName]) {
      return new MeshLambertMaterial({
        map: texture(`plain-${kind}`),
        color: painted(look.tints[piece], tones[partName]),
      });
    }
    const map = texture(kind ? look.colourways[kind] : name);
    return new MeshLambertMaterial({ map, color: isSkin ? skinTint : isHair ? hairTint : 0xffffff });
  };
  for (const [at, part] of rest.entries())
    skinOnto(root, bones, part, (mesh) => materialFor(mesh.texture, parts[at + 1]));
  return humanoidFromSkeleton(root, humanoidNodes(bones), () => look.height, look.seed);
}

/** A body's skeleton in bind pose (each joint's world matrix is its inverse bind matrix inverted): { root, bones }. */
function rigOf(body) {
  const root = new Group();
  const bones = new Map();
  const worlds = body.skeleton.names.map((jointName) => {
    const at = body.joints.indexOf(jointName);
    return new Matrix4().fromArray(body.inverseBind, at * 16).invert();
  });
  body.skeleton.names.forEach((jointName, i) => {
    const bone = new Bone();
    bone.name = jointName;
    const parent = body.skeleton.parents[i];
    const local = parent >= 0 ? worlds[parent].clone().invert().multiply(worlds[i]) : worlds[i].clone();
    local.decompose(bone.position, bone.quaternion, bone.scale);
    bones.set(jointName, bone);
  });
  body.skeleton.names.forEach((jointName, i) => {
    const parent = body.skeleton.parents[i];
    (parent >= 0 ? bones.get(body.skeleton.names[parent]) : root).add(bones.get(jointName));
  });
  root.updateMatrixWorld(true);
  return { root, bones };
}

/** A part's meshes, skinned to the skeleton's bones; `materialOf(mesh)` is each one's material. */
function skinOnto(root, bones, part, materialOf) {
  const partBones = part.joints.map((jointName) => bones.get(jointName) ?? root);
  const inverses = part.joints.map((_, i) => new Matrix4().fromArray(part.inverseBind, i * 16));
  const skeleton = new Skeleton(partBones, inverses);
  for (const mesh of part.meshes) {
    const skinned = new SkinnedMesh(geometryOf(mesh), materialOf(mesh));
    skinned.frustumCulled = false;
    root.add(skinned);
    skinned.bind(skeleton, skinned.matrixWorld);
  }
}

/** The skeleton's bone for each humanoid bone it has. */
function humanoidNodes(bones) {
  const nodes = {};
  for (const [humanoid, jointName] of Object.entries(BONES))
    if (bones.has(jointName)) nodes[humanoid] = bones.get(jointName);
  return nodes;
}

/**
 * One of the monsters that stand on the people's skeleton (`kind`: "imp" or "puglin", from
 * kit/fantasy/folk), as a walking character moved by the people's clips, `scale` times the size it's
 * made. Rejects if the kit hasn't got it.
 */
export async function createFolk(kind, scale = 1) {
  const body = (await load("folk.json")).folk[kind];
  if (!body) throw new Error(`The kit has no ${kind}`);
  const { root, bones } = rigOf(body);
  const material = new MeshLambertMaterial({ map: texture(`folk-${kind}`) });
  skinOnto(root, bones, body, () => material);
  return humanoidFromSkeleton(root, humanoidNodes(bones), () => scale);
}
