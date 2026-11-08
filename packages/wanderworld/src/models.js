// A person's own 3D model from the Engine's avatar store (the one 3D Avatars sets up), in any of the
// Engine's 3D formats: VRM, GLB, FBX and MMD (PMX). Each loads into a three-vrm humanoid, so one walk
// drives them all (character.js `humanoidCharacter`).
//
// Loading follows the Engine's own avatar renderers (packages/client/src/features/avatars/renderers):
// textures load as images (the Engine's img-src allows blob: URLs, its connect-src does not), and a model
// may only use pictures packed inside it or stored beside it in the avatar store.
import {
  Bone,
  Box3,
  BufferGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  FrontSide,
  Group,
  LoadingManager,
  MeshToonMaterial,
  Quaternion,
  Skeleton,
  SkinnedMesh,
  SRGBColorSpace,
  TextureLoader,
  Uint16BufferAttribute,
  Vector3,
} from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { TGALoader } from "three/examples/jsm/loaders/TGALoader.js";
import { VRMHumanoid, VRMLoaderPlugin, VRMMetaLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import { Parser } from "mmd-parser";
import { disposeTree, getJson, humanoidCharacter } from "./character.js";

const TYPICAL_HEIGHT = 1.7;
const VRM1_LICENSE_URL = "https://vrm.dev/licenses/1.0/";
/** Hips to head bone, in metres, for a GLB or FBX of any unit (the Engine's own rule). */
const HIPS_TO_HEAD = 0.5;
/** MMD's unit is 8 cm. */
const MMD_SCALE = 0.08;
/** An FBX picture outside the file draws white instead of black (as in the Engine). */
const WHITE_PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4////fwAJ+wP9KobjigAAAABJRU5ErkJggg==";
const REQUIRED_BONES = [
  "hips",
  "spine",
  "head",
  "leftUpperArm",
  "leftLowerArm",
  "leftHand",
  "rightUpperArm",
  "rightLowerArm",
  "rightHand",
  "leftUpperLeg",
  "leftLowerLeg",
  "leftFoot",
  "rightUpperLeg",
  "rightLowerLeg",
  "rightFoot",
];
/** The standard MMD (Japanese) bone names for each humanoid bone, most specific first. */
const MMD_BONES = {
  hips: ["センター", "下半身"],
  spine: ["上半身"],
  chest: ["上半身2"],
  neck: ["首"],
  head: ["頭"],
  leftShoulder: ["左肩"],
  leftUpperArm: ["左腕"],
  leftLowerArm: ["左ひじ", "左肘"],
  leftHand: ["左手首"],
  rightShoulder: ["右肩"],
  rightUpperArm: ["右腕"],
  rightLowerArm: ["右ひじ", "右肘"],
  rightHand: ["右手首"],
  leftUpperLeg: ["左足"],
  leftLowerLeg: ["左ひざ", "左膝"],
  leftFoot: ["左足首"],
  rightUpperLeg: ["右足"],
  rightLowerLeg: ["右ひざ", "右膝"],
  rightFoot: ["右足首"],
};

const worldA = new Vector3();
const worldB = new Vector3();
const turn = new Quaternion();
const parentTurn = new Quaternion();

/** Only data packed inside the file (blob: and data: URLs) may load; anything else gets `blocked`. */
function embeddedOnly(blocked = "data:,") {
  const manager = new LoadingManager();
  manager.setURLModifier((url) => (/^(?:blob|data):/iu.test(url) ? url : blocked));
  return manager;
}

function fileUrl(owner, path) {
  const [folder, ...rest] = path.split("/");
  return `/api/avatar-models/${owner.type}/${encodeURIComponent(owner.id)}/files/${encodeURIComponent(folder)}/${encodeURIComponent(rest.join("/"))}`;
}

async function fetchBytes(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`GET model file → ${response.status}`);
  return response.arrayBuffer();
}

/**
 * Which of a character's or persona's models to load, or null when it has none in a format this loads.
 * `owner` is { type: "persona" | "character", id }.
 */
export async function findModel(owner) {
  const config = await getJson(`/api/avatar-models/${owner.type}/${encodeURIComponent(owner.id)}`);
  const kinds = config?.kinds;
  if (!kinds) return null;
  const usable = (kind) =>
    (kind === "vrm" && kinds.vrm?.file) ||
    (kind === "glb-fbx" && kinds["glb-fbx"]?.file && kinds["glb-fbx"]?.bones) ||
    (kind === "mmd" && kinds.mmd?.file);
  const kind = [config.activeKind, "vrm", "glb-fbx", "mmd"].find((candidate) => candidate && usable(candidate));
  return kind ? { owner, kind, data: kinds[kind] } : null;
}

// ── Humanoids from plain skeletons (GLB, FBX, MMD), as the Engine builds them ──

/** Turns `bone` in world space so the direction from it to `child` becomes `goal`. */
function aimBone(bone, child, goal) {
  if (!bone || !child) return;
  const from = child.getWorldPosition(worldA).sub(bone.getWorldPosition(worldB));
  if (from.lengthSq() === 0) return;
  turn.setFromUnitVectors(from.normalize(), goal);
  parentTurn.identity();
  bone.parent?.getWorldQuaternion(parentTurn);
  // world' = turn × world; local' = parent⁻¹ × world'.
  bone.quaternion.premultiply(parentTurn).premultiply(turn).premultiply(parentTurn.invert());
  bone.updateMatrixWorld(true);
}

/**
 * Builds a walking character from a loaded model and its humanoid bones: arms straightened into a
 * T-pose (the pose a humanoid walk starts from), turned to face +z, scaled by `scaleFor`, and stood on
 * the ground under its hips.
 */
function humanoidFromSkeleton(loaded, nodes, scaleFor) {
  const missing = REQUIRED_BONES.filter((bone) => !nodes[bone]);
  if (missing.length) throw new Error(`The model has no ${missing.join(", ")} bone`);
  const root = new Group();
  root.add(loaded);
  root.updateMatrixWorld(true);
  const facing =
    nodes.leftUpperArm.getWorldPosition(worldA).x >= nodes.rightUpperArm.getWorldPosition(worldB).x ? 1 : -1;
  for (const [side, sign] of [
    ["left", 1],
    ["right", -1],
  ]) {
    const goal = new Vector3(sign * facing, 0, 0);
    aimBone(nodes[`${side}UpperArm`], nodes[`${side}LowerArm`], goal);
    aimBone(nodes[`${side}LowerArm`], nodes[`${side}Hand`], goal);
  }
  const humanoid = new VRMHumanoid(Object.fromEntries(Object.entries(nodes).map(([bone, node]) => [bone, { node }])));
  root.add(humanoid.normalizedHumanBonesRoot);
  if (facing < 0) root.rotation.y = Math.PI;
  root.scale.setScalar(scaleFor(nodes));
  root.updateMatrixWorld(true);
  const hips = nodes.hips.getWorldPosition(worldA);
  const floor = new Box3().setFromObject(loaded).min.y;
  root.position.set(-hips.x, Number.isFinite(floor) ? -floor : 0, -hips.z);
  loaded.traverse((object) => {
    object.frustumCulled = false; // skinned meshes' bounds don't follow the pose
  });
  const object = new Group();
  object.add(root);
  return humanoidCharacter({
    object,
    humanoid,
    afterPose: () => humanoid.update(),
    dispose: () => disposeTree(loaded),
  });
}

const hipsToHeadScale = (nodes) => {
  const height = nodes.head.getWorldPosition(worldA).y - nodes.hips.getWorldPosition(worldB).y;
  if (!(height > 0)) throw new Error("The model's head isn't above its hips");
  return HIPS_TO_HEAD / height;
};

/** The model's bone for each stored humanoid bone name: bones before other nodes, the first of each name. */
function findBones(root, names, originalName) {
  const bones = new Map();
  const others = new Map();
  root.traverse((object) => {
    const name = originalName(object) ?? object.name;
    const list = object.isBone ? bones : others;
    if (name && !list.has(name)) list.set(name, object);
  });
  const found = {};
  for (const [bone, name] of Object.entries(names ?? {})) {
    const object = typeof name === "string" ? (bones.get(name) ?? others.get(name)) : undefined;
    if (object) found[bone] = object;
  }
  return found;
}

// ── Each format ──────────────────────────────────────────────────────────────

async function loadGltf(bytes, plugin) {
  const manager = embeddedOnly();
  const loader = new GLTFLoader(manager);
  loader.register((parser) => {
    // Textures as images: GLTFLoader's default ImageBitmapLoader fetches blob: URLs, which the Engine's
    // connect-src refuses, and every texture failed quietly to plain white.
    parser.textureLoader = new TextureLoader(manager);
    return plugin?.(parser) ?? { name: "wanderworld-embedded-textures" };
  });
  return loader.parseAsync(bytes, "");
}

async function loadVrm({ owner, data }) {
  const gltf = await loadGltf(await fetchBytes(fileUrl(owner, data.file)), (parser) => {
    // An unusual licence URL is a spec slip, not a reason to show nothing (the Engine accepts it too).
    const licenseUrl = parser.json?.extensions?.VRMC_vrm?.meta?.licenseUrl;
    return new VRMLoaderPlugin(parser, {
      metaPlugin: new VRMMetaLoaderPlugin(parser, { acceptLicenseUrls: [VRM1_LICENSE_URL, licenseUrl] }),
    });
  });
  const vrm = gltf.userData.vrm;
  if (!vrm) throw new Error("The file is not a VRM model");
  VRMUtils.removeUnnecessaryVertices(gltf.scene);
  VRMUtils.combineSkeletons(gltf.scene);
  VRMUtils.rotateVRM0(vrm); // VRM 0.x models face -z; turn them to face +z like VRM 1.0
  vrm.scene.traverse((object) => {
    object.frustumCulled = false;
  });
  const size = new Box3().setFromObject(vrm.scene).getSize(new Vector3());
  if (size.y > 0 && (size.y < 0.5 || size.y > 4)) vrm.scene.scale.multiplyScalar(TYPICAL_HEIGHT / size.y);
  const object = new Group();
  object.add(vrm.scene);
  return humanoidCharacter({
    object,
    humanoid: vrm.humanoid,
    afterPose: (dt) => vrm.update(dt), // the pose, spring bones (hair, clothes) and constraints
    dispose: () => VRMUtils.deepDispose(vrm.scene),
  });
}

async function loadGlbFbx({ owner, data }) {
  const bytes = await fetchBytes(fileUrl(owner, data.file));
  let scene;
  let originalName;
  if (data.format === "fbx") {
    scene = new FBXLoader(embeddedOnly(WHITE_PIXEL)).parse(bytes, "");
    originalName = (object) => object.userData?.originalName;
  } else {
    const gltf = await loadGltf(bytes);
    const nodes = gltf.parser.json?.nodes ?? [];
    scene = gltf.scene;
    originalName = (object) => {
      const index = gltf.parser.associations.get(object)?.nodes;
      const name = index === undefined ? undefined : nodes[index]?.name;
      return typeof name === "string" ? name : undefined;
    };
  }
  try {
    return humanoidFromSkeleton(scene, findBones(scene, data.bones, originalName), hipsToHeadScale);
  } catch (error) {
    disposeTree(scene);
    throw error;
  }
}

/** Loads the MMD textures the model names, from the files stored beside it, as textures by reference. */
async function loadMmdTextures(owner, data, references) {
  const textures = new Map();
  const tga = new TGALoader();
  const images = new TextureLoader();
  for (const reference of new Set(references)) {
    const path = data.texturePaths?.[reference];
    if (!path) continue; // a sphere map or a texture the import left out: draw without it
    try {
      const bytes = await fetchBytes(fileUrl(owner, path));
      let texture;
      if (/\.tga$/iu.test(path)) {
        texture = tga.parse(bytes);
      } else {
        const url = URL.createObjectURL(new Blob([bytes]));
        try {
          texture = await images.loadAsync(url);
        } finally {
          URL.revokeObjectURL(url);
        }
      }
      texture.flipY = false; // MMD UVs are used as they are
      texture.colorSpace = SRGBColorSpace;
      texture.needsUpdate = true;
      textures.set(reference, texture);
    } catch (error) {
      console.warn("[wanderworld] an MMD texture failed to load", path, error);
    }
  }
  return textures;
}

/**
 * Builds a skinned mesh from a PMX file with plain toon materials. The Engine's MMD renderer uses
 * @takahirox/three-mmd, whose materials need three's WebGPU renderer; Wanderworld draws with WebGL, so it
 * reads the file with the same parser (mmd-parser) and builds the mesh itself, following three-mmd's
 * MMDLoader for the geometry, groups and bones.
 */
async function loadMmd({ owner, data }) {
  const pmx = new Parser().parsePmx(await fetchBytes(fileUrl(owner, data.file)), true);
  const positions = [];
  const normals = [];
  const uvs = [];
  const skinIndices = [];
  const skinWeights = [];
  for (const vertex of pmx.vertices) {
    positions.push(...vertex.position);
    normals.push(...vertex.normal);
    uvs.push(vertex.uv[0], vertex.uv[1]);
    for (let j = 0; j < 4; j++) skinIndices.push(vertex.skinIndices[j] ?? 0);
    for (let j = 0; j < 4; j++) skinWeights.push(vertex.skinWeights[j] ?? 0);
  }
  const indices = [];
  for (const face of pmx.faces) indices.push(...face.indices);
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  geometry.setAttribute("skinIndex", new Uint16BufferAttribute(skinIndices, 4));
  geometry.setAttribute("skinWeight", new Float32BufferAttribute(skinWeights, 4));
  geometry.setIndex(indices);

  const references = pmx.materials.map((material) =>
    material.textureIndex >= 0 ? pmx.textures[material.textureIndex] : null,
  );
  const textures = await loadMmdTextures(owner, data, references.filter(Boolean));
  let offset = 0;
  const materials = pmx.materials.map((source, i) => {
    geometry.addGroup(offset * 3, source.faceCount * 3, i);
    offset += source.faceCount;
    const map = references[i] ? (textures.get(references[i]) ?? null) : null;
    const [r, g, b, alpha] = source.diffuse;
    return new MeshToonMaterial({
      color: map ? new Color(1, 1, 1) : new Color(r, g, b),
      map,
      opacity: alpha,
      transparent: alpha < 1,
      alphaTest: map ? 0.3 : 0, // hair and lace cut-outs without sorting trouble
      side: source.flag & 0x1 ? DoubleSide : FrontSide,
    });
  });

  // Bones: PMX positions are absolute; three wants each relative to its parent. Bad parent links detach.
  const parents = pmx.bones.map((bone, i) =>
    Number.isInteger(bone.parentIndex) &&
    bone.parentIndex >= 0 &&
    bone.parentIndex < pmx.bones.length &&
    bone.parentIndex !== i
      ? bone.parentIndex
      : -1,
  );
  for (let i = 0; i < parents.length; i++) {
    const seen = new Set();
    for (let index = i; index !== -1; index = parents[index]) {
      if (seen.has(index)) {
        parents[i] = -1; // a cycle
        break;
      }
      seen.add(index);
    }
  }
  const bones = pmx.bones.map((source) => {
    const bone = new Bone();
    bone.name = source.name;
    return bone;
  });
  pmx.bones.forEach((source, i) => {
    const parent = parents[i];
    const [x, y, z] = source.position;
    if (parent === -1) {
      bones[i].position.set(x, y, z);
    } else {
      const [px, py, pz] = pmx.bones[parent].position;
      bones[i].position.set(x - px, y - py, z - pz);
      bones[parent].add(bones[i]);
    }
  });
  const mesh = new SkinnedMesh(geometry, materials);
  for (let i = 0; i < bones.length; i++) if (parents[i] === -1) mesh.add(bones[i]);
  mesh.updateMatrixWorld(true); // the skeleton's inverse bind matrices are read from the bones' world matrices
  mesh.bind(new Skeleton(bones));

  const byName = new Map(bones.map((bone) => [bone.name, bone]));
  const nodes = {};
  for (const [humanBone, names] of Object.entries(MMD_BONES)) {
    const found = names.map((name) => byName.get(name)).find(Boolean);
    if (found) nodes[humanBone] = found;
  }
  try {
    return humanoidFromSkeleton(mesh, nodes, () => MMD_SCALE);
  } catch (error) {
    disposeTree(mesh);
    throw error;
  }
}

/** Loads a model `findModel` chose as a walking character. Throws when it can't be loaded. */
export function loadModelCharacter(model) {
  if (model.kind === "vrm") return loadVrm(model);
  if (model.kind === "glb-fbx") return loadGlbFbx(model);
  if (model.kind === "mmd") return loadMmd(model);
  return Promise.reject(new Error(`Unsupported model kind ${model.kind}`));
}
