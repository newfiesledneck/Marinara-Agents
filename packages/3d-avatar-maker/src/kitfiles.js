// The kit's files: the bodies, hair, skins and eyes (kit/avatar) and the clothing (kit/wardrobe), served by
// the Engine as this package's assets. Each is fetched once and shared. A `.pack.png` is a packed kit file
// (packed.js), not a picture.
//
// Began as a copy of Wanderworld's src/people.js (the parts the base avatar uses); this package keeps its
// own copy of the kit, so nothing here reads Wanderworld's.
import {
  Bone,
  BufferAttribute,
  BufferGeometry,
  Group,
  Matrix4,
  Skeleton,
  SRGBColorSpace,
  TextureLoader,
  Uint16BufferAttribute,
} from "three";
import { arrayOf, fetchKit, pictureTexture } from "./packed.js";

export const PACKAGE_ID = "3d-avatar-maker";

let base = `/api/capability-packages/${PACKAGE_ID}/assets/kit/`;
let version = "";
/** Where the kit is served from: the Engine's asset route for this package, or a folder (the test page's). */
export function setKitBase(url, packageVersion = "") {
  base = url.endsWith("/") ? url : `${url}/`;
  version = packageVersion;
}
/** Clothing is in kit/wardrobe; everything else (bodies, hair, skins, eyes) in kit/avatar. */
const dirOf = (name) => (name.startsWith("avatar-outfit") ? "wardrobe" : "avatar");
export const urlOf = (name) => `${base}${dirOf(name)}/${name}${version ? `?v=${encodeURIComponent(version)}` : ""}`;

const files = new Map();
const textures = new Map();
const loader = new TextureLoader();

/** A kit file (packed, or JSON), fetched once and shared; a failed fetch is tried again next time. */
export function load(name) {
  if (!files.has(name)) {
    const made = fetchKit(urlOf(name), name);
    made.catch(() => files.delete(name));
    files.set(name, made);
  }
  return files.get(name);
}

/**
 * A kit texture, loaded once and shared: the .webp of that name, or the picture of that name in `pictures`
 * (a bundle's, packed.js).
 */
export function texture(name, pictures = null) {
  if (!textures.has(name)) {
    const packed = pictures?.find((picture) => picture.name === name)?.webp;
    const map = packed ? pictureTexture(packed) : loader.load(urlOf(`${name}.webp`));
    map.flipY = false; // glTF texture coordinates
    map.colorSpace = SRGBColorSpace;
    map.name = name;
    map.userData.shared = true;
    textures.set(name, map);
  }
  return textures.get(name);
}

/** Resolves when every kit texture asked for so far has its picture (the exporter draws them). */
export function texturesReady() {
  return Promise.all(
    [...textures.values()].map(
      (map) =>
        new Promise((resolve) => {
          const wait = (tries) => {
            if (map.image?.complete !== false && (map.image?.width || tries <= 0)) resolve();
            else setTimeout(() => wait(tries - 1), 50);
          };
          wait(200);
        }),
    ),
  );
}

/** A packed array as a typed array of `Type`. */
export const view = arrayOf;

/** One packed mesh as geometry (positions back from their int16 box, normals from int8, uvs from uint16). */
export function geometryOf(mesh) {
  const quantized = view(Int16Array, mesh.position);
  const position = new Float32Array(quantized.length);
  for (let i = 0; i < quantized.length; i++) {
    const axis = i % 3;
    const min = mesh.box[axis];
    const span = mesh.box[axis + 3] - min;
    position[i] = min + ((quantized[i] + 32768) / 65535) * span;
  }
  const normal = Float32Array.from(view(Int8Array, mesh.normal), (value) => value / 127);
  // (A mesh coloured by material alone has no texture coordinates.)
  const uv = mesh.uv ? Float32Array.from(view(Uint16Array, mesh.uv), (value) => value / 65535) : null;
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(position, 3));
  geometry.setAttribute("normal", new BufferAttribute(normal, 3));
  if (uv) geometry.setAttribute("uv", new BufferAttribute(uv, 2));
  geometry.setAttribute("skinIndex", new Uint16BufferAttribute(Uint16Array.from(view(Uint8Array, mesh.joints)), 4));
  // Each vertex's four weights made to add up to one again: rounded to bytes they can be a few 255ths out.
  const weights = Float32Array.from(view(Uint8Array, mesh.weights));
  for (let at = 0; at < weights.length; at += 4) {
    const total = weights[at] + weights[at + 1] + weights[at + 2] + weights[at + 3] || 1;
    for (let c = 0; c < 4; c++) weights[at + c] /= total;
  }
  geometry.setAttribute("skinWeight", new BufferAttribute(weights, 4));
  const Index = mesh.wide ? Uint32Array : Uint16Array;
  // (The kit also holds a low-detail version of each mesh, `far`, for crowds; an avatar maker has no use for it.)
  geometry.setIndex(new BufferAttribute(view(Index, mesh.index), 1));
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

/** A body's skeleton in bind pose (each joint's world matrix is its inverse bind matrix inverted): { root, bones }. */
export function rigOf(body) {
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

/**
 * A part's skeleton: its joints on the body's bones, with its own inverse bind matrices (or `fallback`'s, a
 * body's, for a part that has none: one hung on a bone). `stretch` (joint name → Matrix4) reshapes a bone's
 * own vertices in its own space without its children (longer arms, a bigger head). `moved` (joint name →
 * Matrix4) is for a joint whose rest place was moved: the move undone, so its skin stays where it was.
 */
export function skeletonFor(root, bones, part, stretch = null, fallback = null, moved = null) {
  const partBones = part.joints.map((jointName) => bones.get(jointName) ?? root);
  const inverses = part.joints.map((jointName, i) => {
    const inverse = part.inverseBind
      ? new Matrix4().fromArray(part.inverseBind, i * 16)
      : new Matrix4().fromArray(fallback.inverseBind, Math.max(0, fallback.joints.indexOf(jointName)) * 16);
    const back = moved?.get(jointName);
    if (back) inverse.multiply(back);
    const reshape = stretch?.get(jointName);
    return reshape ? inverse.premultiply(reshape) : inverse;
  });
  return new Skeleton(partBones, inverses);
}

/** The body's bone for each humanoid bone, named as VRM names them (the Unreal mannequin's names in the kit). */
export const HUMANOID_BONES = {
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
    HUMANOID_BONES[`${side}${finger}Proximal`] = `${name}_01_${s}`;
    HUMANOID_BONES[`${side}${finger}Intermediate`] = `${name}_02_${s}`;
    HUMANOID_BONES[`${side}${finger}Distal`] = `${name}_03_${s}`;
  }
  HUMANOID_BONES[`${side}ThumbMetacarpal`] = `thumb_01_${s}`;
  HUMANOID_BONES[`${side}ThumbProximal`] = `thumb_02_${s}`;
  HUMANOID_BONES[`${side}ThumbDistal`] = `thumb_03_${s}`;
}

/** Which body someone has: the look's own choice, else the gender given, else one from their name. */
export function sexFor(name, gender = "auto", chosen = {}, random = Math.random) {
  if (chosen.body === "male" || chosen.body === "female") return { sex: chosen.body };
  if (gender === "male" || gender === "female") return { sex: gender };
  return { sex: random() < 0.5 ? "male" : "female" };
}
