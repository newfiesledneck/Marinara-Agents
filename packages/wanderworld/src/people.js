// Default people: for anyone without a 3D model, a person put together from Quaternius's Universal Base
// Characters and Modular Character Outfits - Fantasy (CC0): everyday clothes in one of several colours, a
// head, a hairstyle, skin and hair tones and a height, all chosen from the name. Made by scripts/build-wanderworld-people.mjs into
// kit/people/, served as package assets, and loaded only when needed (then cached).
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
import { HAIR_COLOURS, OUTFITS, RANGER_SHARE, SKIN_TONES, USUAL_HAIR, USUAL_HAIR_COLOURS } from "./looks.js";
import { hashString, rng } from "./world.js";

const BASE = "/api/capability-packages/wanderworld/assets/kit/people/";

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
      fetch(`${BASE}${name}`).then((response) => {
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
    const map = loader.load(`${BASE}${name}.webp`);
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
 */
export function lookFor(name, index, body = "auto", chosen = {}) {
  const random = rng(hashString(`${name || "wanderer"}:kit`));
  const pick = (list) => list[Math.floor(random() * list.length)];
  // The body chosen in the People menu (later: from the character card), or else one from the name.
  const fromName = random() < 0.5 ? "male" : "female";
  const sex = body === "male" || body === "female" ? body : fromName;
  const outfits = index.sexes[sex].outfits;
  const named = (kind) => outfits.find((entry) => entry.name === `${sex}-${kind}`);
  // Most are townsfolk; now and then someone is dressed for the road.
  const usual = (random() < RANGER_SHARE && named("ranger")) || named("peasant") || outfits[0];
  const usualColour = pick(usual.colourways);
  const outfit = (chosen.outfit && named(chosen.outfit)) || usual;
  const usualHair = pick(USUAL_HAIR[sex]);
  const usualBeard = sex === "male" && random() < 0.3;
  const usualSkin = Math.floor(random() * SKIN_TONES.length);
  const usualHairColour = Math.floor(random() * USUAL_HAIR_COLOURS);
  const usualHeight = 0.94 + random() * 0.12;
  const colours = outfit.colourways;
  return {
    sex,
    outfit: outfit.name,
    colourway: colours.includes(chosen.colour)
      ? chosen.colour
      : outfit === usual
        ? usualColour
        : colours[hashString(`${name}:colour`) % colours.length],
    hair: chosen.hair ?? usualHair,
    beard: sex === "male" && (chosen.beard ?? usualBeard),
    skin: SKIN_TONES[chosen.skin ?? usualSkin][0],
    hairColour: HAIR_COLOURS[chosen.hairColour ?? usualHairColour][0],
    height: chosen.height ?? usualHeight,
    seed: hashString(`${name}:motion`),
    // What's on show in the Look card: the same things as plain choices.
    choices: {
      outfit: outfit.name.slice(sex.length + 1),
      hair: chosen.hair ?? usualHair,
      beard: sex === "male" && (chosen.beard ?? usualBeard),
      skin: chosen.skin ?? usualSkin,
      hairColour: chosen.hairColour ?? usualHairColour,
      height: chosen.height ?? usualHeight,
    },
  };
}

/** How `name` looks now, as the Look card's choices (looks.js), with their sex: loads the kit's index. */
export async function lookChoices(name, body = "auto", chosen = {}) {
  const look = lookFor(name, await load("index.json"), body, chosen);
  return { ...look.choices, colour: look.colourway, sex: look.sex, outfits: Object.keys(OUTFITS) };
}

/** The default person for `name` with `build` ("male", "female" or "auto") and whatever look was
 *  `chosen` for them (looks.js), as a walking character. Rejects if the kit can't be loaded. */
export async function createPerson(name, build = "auto", chosen = {}) {
  const index = await load("index.json");
  const look = lookFor(name, index, build, chosen);
  const parts = [look.outfit, `head-${look.sex}`];
  if (look.hair !== "none") parts.push(`hair-${look.hair}`);
  if (look.beard) parts.push("hair-beard");
  const [body, ...rest] = await Promise.all(parts.map((part) => load(`${part}.json`)));

  // The skeleton, in bind pose: each joint's world matrix is its inverse bind matrix inverted.
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

  const skinTint = new Color(...look.skin);
  const hairTint = new Color(look.hairColour);
  const materialFor = (name) => {
    const isSkin = name.startsWith("skin-") || name.startsWith("head-");
    const isHair = name.startsWith("hair-");
    const map = texture(name === "clothes" ? look.colourway : name);
    return new MeshLambertMaterial({ map, color: isSkin ? skinTint : isHair ? hairTint : 0xffffff });
  };
  for (const part of [body, ...rest]) {
    const partBones = part.joints.map((jointName) => bones.get(jointName) ?? root);
    const inverses = part.joints.map((_, i) => new Matrix4().fromArray(part.inverseBind, i * 16));
    const skeleton = new Skeleton(partBones, inverses);
    for (const mesh of part.meshes) {
      const skinned = new SkinnedMesh(geometryOf(mesh), materialFor(mesh.texture));
      skinned.frustumCulled = false;
      root.add(skinned);
      skinned.bind(skeleton, skinned.matrixWorld);
    }
  }
  const nodes = {};
  for (const [humanoid, jointName] of Object.entries(BONES))
    if (bones.has(jointName)) nodes[humanoid] = bones.get(jointName);
  return humanoidFromSkeleton(root, nodes, () => look.height, look.seed);
}
