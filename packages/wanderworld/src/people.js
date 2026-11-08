// Default people: for anyone without a 3D model, a person put together from Quaternius's Universal Base
// Characters and Modular Character Outfits - Fantasy (CC0): an outfit, a head, a hairstyle, skin and hair
// tones and a height, all chosen from the name. Made by scripts/build-wanderworld-people.mjs into
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

// Skin tones as a tint on the pack's skin; hair colours as a tint on its pale hair.
const SKIN = [
  [1.12, 1.06, 1.02],
  [1.0, 0.97, 0.94],
  [0.9, 0.8, 0.72],
  [0.74, 0.6, 0.5],
  [0.56, 0.43, 0.35],
  [0.42, 0.31, 0.25],
];
const HAIR = [0x2b1d14, 0x4a2f1c, 0x7a4a26, 0xb08850, 0xe0c890, 0x1a1a1a, 0x8c2f1e, 0xbcbcbc];
const HAIRSTYLES = {
  male: ["buzzed", "simpleparted", "long", "simpleparted"],
  female: ["buns", "long", "simpleparted", "buzzedfemale"],
};

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

/** A person's look, from their name. */
export function lookFor(name, index) {
  const random = rng(hashString(`${name || "wanderer"}:kit`));
  const pick = (list) => list[Math.floor(random() * list.length)];
  const sex = random() < 0.5 ? "male" : "female";
  const outfit = pick(index.sexes[sex].outfits);
  return {
    sex,
    outfit: outfit.name,
    colourway: pick(outfit.colourways),
    hood: outfit.hood,
    hair: outfit.hood ? null : pick(HAIRSTYLES[sex]),
    beard: sex === "male" && random() < 0.3,
    skin: pick(SKIN),
    hairColour: pick(HAIR),
    height: 0.94 + random() * 0.12,
    seed: hashString(`${name}:motion`),
  };
}

/** The default person for `name`, as a walking character. Rejects if the kit can't be loaded. */
export async function createPerson(name) {
  const index = await load("index.json");
  const look = lookFor(name, index);
  const parts = [look.outfit, `head-${look.sex}`];
  if (look.hair) parts.push(`hair-${look.hair}`);
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
    const map = texture(name === look.outfit.split("-")[1] ? look.colourway : name);
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
