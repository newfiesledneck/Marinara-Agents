// The player's body. Each character is { object, update(dt, speed), dispose() }: `object` faces +z
// and stands on y = 0, and `update` animates a walk at `speed` metres per second.
//
// A persona's own 3D model comes from the Engine's avatar store (the one 3D Avatars sets up):
// VRM models get a procedural walk on their humanoid bones; GLB models are shown as they are. Anything
// else (MMD, FBX, the Engine's mesh avatars, or no model at all) gets a low-poly figure instead.
import {
  Box3,
  BoxGeometry,
  Color,
  Group,
  LoadingManager,
  Mesh,
  MeshLambertMaterial,
  SphereGeometry,
  TextureLoader,
  Vector3,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRMLoaderPlugin, VRMMetaLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import { hashString, rng } from "./world.js";

const TYPICAL_HEIGHT = 1.7;
const STRIDE = 1.4; // metres per full walk cycle

/** Walk-cycle angles for a phase and an amount (0 standing, 1 full stride). */
function gait(phase, amount) {
  const swing = Math.sin(phase) * amount;
  return {
    leftLeg: -swing * 0.55,
    rightLeg: swing * 0.55,
    leftKnee: Math.max(0, Math.sin(phase + Math.PI / 2)) * 0.7 * amount,
    rightKnee: Math.max(0, Math.sin(phase - Math.PI / 2)) * 0.7 * amount,
    leftArm: swing * 0.45,
    rightArm: -swing * 0.45,
    bob: Math.abs(Math.cos(phase)) * 0.05 * amount,
  };
}

function walker() {
  let phase = 0;
  let amount = 0;
  return (dt, speed) => {
    phase += (dt * speed * Math.PI * 2) / STRIDE;
    amount += (Math.min(1, speed / 4) - amount) * Math.min(1, dt * 8);
    return gait(phase, amount);
  };
}

function disposeTree(root) {
  root.traverse((object) => {
    object.geometry?.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) {
      if (!material) continue;
      for (const value of Object.values(material)) if (value?.isTexture) value.dispose();
      material.dispose();
    }
  });
}

/** Scales a model to a believable height when its units are off (a 170 m or 1.7 cm person). */
function normaliseHeight(root) {
  const size = new Box3().setFromObject(root).getSize(new Vector3());
  if (size.y > 0.5 && size.y < 4) return;
  if (size.y > 0) root.scale.multiplyScalar(TYPICAL_HEIGHT / size.y);
}

// ── Low-poly figure ──────────────────────────────────────────────────────────

const SKIN = [0xf1c9a5, 0xe0ac85, 0xc68863, 0x9a6544, 0x6b4430];
const HAIR = [0x2b1d14, 0x5a3a22, 0x8a5a2b, 0xd9b26a, 0x1c1c1c, 0xa33a2a, 0xc9c9c9];

/** A simple jointed figure, coloured from `name` so each persona looks the same every time. */
export function createFigure(name = "") {
  const random = rng(hashString(name || "wanderer"));
  const pick = (list) => list[Math.floor(random() * list.length)];
  const material = (hex) => new MeshLambertMaterial({ color: hex, flatShading: true });
  const skin = material(pick(SKIN));
  const shirt = material(new Color().setHSL(random(), 0.45, 0.45));
  const trousers = material(new Color().setHSL(random(), 0.3, 0.25));
  const hair = material(pick(HAIR));
  const part = (geometry, mat, x, y, z) => {
    const mesh = new Mesh(geometry, mat);
    mesh.position.set(x, y, z);
    return mesh;
  };
  /** A limb hanging from a joint at (x, y), so rotating the joint swings it. */
  const limb = (x, y, length, width, mat) => {
    const joint = new Group();
    joint.position.set(x, y, 0);
    joint.add(part(new BoxGeometry(width, length, width), mat, 0, -length / 2, 0));
    return joint;
  };

  const object = new Group();
  const body = new Group();
  object.add(body);
  body.add(part(new BoxGeometry(0.42, 0.58, 0.24), shirt, 0, 1.2, 0));
  body.add(part(new SphereGeometry(0.17, 8, 6), skin, 0, 1.66, 0));
  body.add(part(new SphereGeometry(0.18, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), hair, 0, 1.69, -0.01));
  body.add(part(new BoxGeometry(0.08, 0.05, 0.05), material(0x2a2a2a), 0, 1.66, 0.16)); // shows which way it faces
  const leftLeg = limb(0.11, 0.9, 0.86, 0.15, trousers);
  const rightLeg = limb(-0.11, 0.9, 0.86, 0.15, trousers);
  const leftArm = limb(0.27, 1.46, 0.62, 0.11, shirt);
  const rightArm = limb(-0.27, 1.46, 0.62, 0.11, shirt);
  body.add(leftLeg, rightLeg, leftArm, rightArm);

  const step = walker();
  return {
    object,
    update(dt, speed) {
      const pose = step(dt, speed);
      leftLeg.rotation.x = pose.leftLeg;
      rightLeg.rotation.x = pose.rightLeg;
      leftArm.rotation.x = pose.leftArm;
      rightArm.rotation.x = pose.rightArm;
      body.position.y = pose.bob;
    },
    dispose() {
      disposeTree(object);
    },
  };
}

// ── A persona's own model ────────────────────────────────────────────────────

function vrmCharacter(gltf) {
  const vrm = gltf.userData.vrm;
  VRMUtils.removeUnnecessaryVertices(gltf.scene);
  VRMUtils.combineSkeletons(gltf.scene);
  VRMUtils.rotateVRM0(vrm); // VRM 0.x models face -z; turn them to face +z like VRM 1.0
  vrm.scene.traverse((object) => {
    object.frustumCulled = false; // skinned meshes' bounds don't follow the pose
  });
  const object = new Group();
  object.add(vrm.scene);
  normaliseHeight(vrm.scene);

  const bone = (name) => vrm.humanoid?.getNormalizedBoneNode(name) ?? null;
  const bones = {
    hips: bone("hips"),
    leftUpperLeg: bone("leftUpperLeg"),
    rightUpperLeg: bone("rightUpperLeg"),
    leftLowerLeg: bone("leftLowerLeg"),
    rightLowerLeg: bone("rightLowerLeg"),
    leftUpperArm: bone("leftUpperArm"),
    rightUpperArm: bone("rightUpperArm"),
    leftLowerArm: bone("leftLowerArm"),
    rightLowerArm: bone("rightLowerArm"),
  };
  const hipsHeight = bones.hips?.position.y ?? 0;
  const step = walker();
  return {
    object,
    update(dt, speed) {
      const pose = step(dt, speed);
      // Arms down from the T-pose, then swung; legs swung forward and back, knees bent behind.
      if (bones.leftUpperArm) bones.leftUpperArm.rotation.set(pose.leftArm, 0, -1.2);
      if (bones.rightUpperArm) bones.rightUpperArm.rotation.set(pose.rightArm, 0, 1.2);
      if (bones.leftLowerArm) bones.leftLowerArm.rotation.set(0, 0, -0.15);
      if (bones.rightLowerArm) bones.rightLowerArm.rotation.set(0, 0, 0.15);
      if (bones.leftUpperLeg) bones.leftUpperLeg.rotation.x = pose.leftLeg;
      if (bones.rightUpperLeg) bones.rightUpperLeg.rotation.x = pose.rightLeg;
      if (bones.leftLowerLeg) bones.leftLowerLeg.rotation.x = pose.leftKnee;
      if (bones.rightLowerLeg) bones.rightLowerLeg.rotation.x = pose.rightKnee;
      if (bones.hips) bones.hips.position.y = hipsHeight + pose.bob;
      vrm.update(dt); // applies the normalized pose, spring bones (hair, clothes) and constraints
    },
    dispose() {
      VRMUtils.deepDispose(vrm.scene);
    },
  };
}

function glbCharacter(gltf) {
  const object = new Group();
  object.add(gltf.scene);
  normaliseHeight(gltf.scene);
  gltf.scene.traverse((child) => {
    child.frustumCulled = false;
  });
  let phase = 0;
  return {
    object,
    update(dt, speed) {
      phase += dt * speed * 4;
      gltf.scene.position.y = speed > 0.1 ? Math.abs(Math.sin(phase)) * 0.06 : 0;
    },
    dispose() {
      disposeTree(gltf.scene);
    },
  };
}

/** Same-origin JSON GET; the Engine's session cookie rides along. Null on any failure. */
async function getJson(path) {
  try {
    const response = await fetch(path, { headers: { Accept: "application/json" } });
    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
}

/** The persona's model file and kind from the Engine's avatar store, or null when it has none we load. */
export async function findPersonaModel(personaId) {
  const config = await getJson(`/api/avatar-models/persona/${encodeURIComponent(personaId)}`);
  if (!config?.kinds) return null;
  const usable = (kind) =>
    (kind === "vrm" && config.kinds.vrm?.file) || (kind === "glb-fbx" && config.kinds["glb-fbx"]?.format === "glb");
  const kind = [config.activeKind, "vrm", "glb-fbx"].find((candidate) => candidate && usable(candidate));
  if (!kind) return null;
  const file = config.kinds[kind].file; // "vrm/name.vrm" or "glb-fbx/name.glb"
  const [folder, ...rest] = file.split("/");
  const url = `/api/avatar-models/persona/${encodeURIComponent(personaId)}/files/${encodeURIComponent(folder)}/${encodeURIComponent(rest.join("/"))}`;
  return { kind, url };
}

const VRM1_LICENSE_URL = "https://vrm.dev/licenses/1.0/";

/**
 * Loads a persona's model as a character, the way the Engine's own 3D Avatars does
 * (vrm-renderer.ts `loadStoredGltf`). Throws when the file can't be loaded.
 */
export async function loadModelCharacter({ kind, url }) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`GET model → ${response.status}`);
  const bytes = await response.arrayBuffer();
  // Only the file's own embedded data may load: a model can't make the page fetch anything else.
  const manager = new LoadingManager();
  manager.setURLModifier((target) => (/^(?:blob|data):/iu.test(target) ? target : "data:,"));
  const loader = new GLTFLoader(manager);
  loader.register((parser) => {
    // Textures load as images, which the Engine's img-src allows from blob: URLs. GLTFLoader's default
    // ImageBitmapLoader reads them with fetch, which the Engine's connect-src refuses for blob: URLs, so
    // every texture failed quietly and the model drew plain white.
    parser.textureLoader = new TextureLoader(manager);
    if (kind !== "vrm") return { name: "wanderworld-embedded-textures" };
    // An unusual licence URL is a spec slip, not a reason to show nothing (the Engine accepts it too).
    const licenseUrl = parser.json?.extensions?.VRMC_vrm?.meta?.licenseUrl;
    return new VRMLoaderPlugin(parser, {
      metaPlugin: new VRMMetaLoaderPlugin(parser, { acceptLicenseUrls: [VRM1_LICENSE_URL, licenseUrl] }),
    });
  });
  const gltf = await loader.parseAsync(bytes, "");
  if (kind === "vrm") {
    if (!gltf.userData.vrm) throw new Error("The file is not a VRM model");
    return vrmCharacter(gltf);
  }
  return glbCharacter(gltf);
}

/** The Engine's personas, as [{ id, name }]; empty when the list can't be read. */
export async function listPersonas() {
  const list = await getJson("/api/characters/personas/list");
  const items = Array.isArray(list) ? list : Array.isArray(list?.items) ? list.items : [];
  return items
    .filter((persona) => typeof persona?.id === "string" && persona.id)
    .map((persona) => ({
      id: persona.id,
      name: typeof persona.name === "string" && persona.name ? persona.name : "Unnamed",
    }));
}
