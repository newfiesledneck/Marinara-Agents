// The check page's script: loads a saved .glb the way Marinara Engine's 3D Avatars agent loads a "GLB or
// FBX model" (packages/client/src/features/avatars/renderers/glb-fbx/glb-fbx-renderer.ts on the Engine's
// staging branch): three's GLTFLoader, bones found by name, the arms straightened into a T-pose, a
// three-vrm humanoid built on them, and the blend shapes named blink, aa, happy and so on driven as
// expressions. Then it lowers the arms and, if the file has them, blinks and opens the mouth, so what a
// chat would show can be seen here without an Engine.
//
// A .vrm is loaded the way the Engine loads a "VRM model" (renderers/vrm/vrm-renderer.ts): three-vrm's own
// loader, which reads the file's humanoid bones, expressions and spring bones, with no T-pose made here
// (the file rests in one).
//
//   /viewer?file=/dev/out/last.glb
//   /viewer?file=/dev/out/last.vrm
//
// For development only; not part of the package.
import {
  AmbientLight,
  Box3,
  DirectionalLight,
  Group,
  PerspectiveCamera,
  Quaternion,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {
  VRMCore,
  VRMExpression,
  VRMExpressionManager,
  VRMExpressionMorphTargetBind,
  VRMHumanoid,
  VRMLoaderPlugin,
  VRMUtils,
} from "@pixiv/three-vrm";
import { HUMANOID_BONES } from "../src/kitfiles.js";

const said = document.getElementById("said");
const canvas = document.getElementById("view");
const file = new URL(location.href).searchParams.get("file") ?? "/dev/out/last.glb";
const SLOTS = ["neutral", "happy", "angry", "sad", "relaxed", "surprised", "aa", "ih", "ou", "ee", "oh", "blink"];
// The humanoid bones the Engine's poses turn (a rig without one is refused).
const BODY_BONES = Object.keys(HUMANOID_BONES).filter((bone) => !/Thumb|Index|Middle|Ring|Little/u.test(bone));

const worldA = new Vector3();
const worldB = new Vector3();
const turn = new Quaternion();
const parentTurn = new Quaternion();
function aimBone(bone, child, goal) {
  if (!bone || !child) return;
  const from = child.getWorldPosition(worldA).sub(bone.getWorldPosition(worldB));
  if (from.lengthSq() === 0) return;
  turn.setFromUnitVectors(from.normalize(), goal);
  parentTurn.identity();
  bone.parent?.getWorldQuaternion(parentTurn);
  bone.quaternion.premultiply(parentTurn).premultiply(turn).premultiply(parentTurn.invert());
  bone.updateMatrixWorld(true);
}

async function main() {
  const bytes = await (await fetch(file)).arrayBuffer();
  const isVrm = /\.vrm$/iu.test(file);
  const loader = new GLTFLoader();
  if (isVrm) loader.register((parser) => new VRMLoaderPlugin(parser));
  const gltf = await loader.parseAsync(bytes, "");
  const vrm = isVrm ? gltf.userData.vrm : null;
  if (isVrm && !vrm) throw new Error("This file has no VRM model in it.");
  if (vrm) {
    VRMUtils.removeUnnecessaryVertices(gltf.scene);
    VRMUtils.combineSkeletons(gltf.scene);
  }
  const root = new Group();
  root.add(gltf.scene);
  root.updateMatrixWorld(true);
  const byName = new Map();
  gltf.scene.traverse((object) => {
    if (object.isBone && !byName.has(object.name)) byName.set(object.name, object);
  });
  const nodes = {};
  const missing = [];
  for (const bone of BODY_BONES) {
    const found = vrm ? vrm.humanoid.getRawBoneNode(bone) : byName.get(HUMANOID_BONES[bone]);
    if (found) nodes[bone] = found;
    else missing.push(bone);
  }
  // T-pose, as the Engine makes it before it builds the humanoid (a VRM rests in one already).
  for (const [side, sign] of vrm
    ? []
    : [
        ["left", 1],
        ["right", -1],
      ]) {
    const goal = new Vector3(sign, 0, 0);
    aimBone(nodes[`${side}UpperArm`], nodes[`${side}LowerArm`], goal);
    aimBone(nodes[`${side}LowerArm`], nodes[`${side}Hand`], goal);
  }
  const humanoid =
    vrm?.humanoid ?? new VRMHumanoid(Object.fromEntries(Object.entries(nodes).map(([bone, node]) => [bone, { node }])));
  if (!vrm) root.add(humanoid.normalizedHumanBonesRoot);
  const manager = vrm?.expressionManager ?? new VRMExpressionManager();
  const meshes = [];
  root.traverse((object) => {
    object.frustumCulled = false;
    if (object.isMesh && object.morphTargetDictionary) meshes.push(object);
  });
  const have = vrm ? SLOTS.filter((slot) => manager.getExpression(slot)) : [];
  for (const slot of vrm ? [] : SLOTS) {
    const expression = new VRMExpression(slot);
    for (const mesh of meshes) {
      const index = mesh.morphTargetDictionary[slot];
      if (index !== undefined)
        expression.addBind(new VRMExpressionMorphTargetBind({ primitives: [mesh], index, weight: 1 }));
    }
    if (expression.binds.length) {
      manager.registerExpression(expression);
      have.push(slot);
    }
  }
  const model =
    vrm ??
    new VRMCore({
      scene: root,
      humanoid,
      expressionManager: manager,
      meta: { metaVersion: "1", name: "", authors: [], licenseUrl: "" },
    });
  const hipsToHead = nodes.head.getWorldPosition(worldA).y - nodes.hips.getWorldPosition(worldB).y;
  root.scale.setScalar(0.5 / hipsToHead); // the Engine's size for every model: half a metre, hips to head

  const renderer = new WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio));
  const scene = new Scene();
  // The Engine's own avatar lighting: one directional light and a dim ambient one.
  const light = new DirectionalLight(0xffffff, Math.PI);
  light.position.set(1, 1, 1).normalize();
  scene.add(light, new AmbientLight(0xffffff, 0.4), root);
  const camera = new PerspectiveCamera(25, 1, 0.05, 50);
  const controls = new OrbitControls(camera, canvas);
  root.updateMatrixWorld(true);
  const box = new Box3();
  for (const bone of byName.values()) box.expandByPoint(bone.getWorldPosition(worldA));
  const middle = (box.min.y + box.max.y) / 2;
  const portrait = new URL(location.href).searchParams.get("frame") === "portrait";
  const headAt = nodes.head.getWorldPosition(worldA).y;
  controls.target.set(0, portrait ? headAt + 0.02 : middle, 0);
  camera.position.set(0, portrait ? headAt + 0.02 : middle, portrait ? 0.9 : 3.2);
  controls.update();

  const info = gltf.parser.json;
  said.textContent = [
    `${file}: ${(bytes.byteLength / 1048576).toFixed(1)} MB`,
    `body bones found: ${BODY_BONES.length - missing.length} of ${BODY_BONES.length}${missing.length ? ` (missing: ${missing.join(", ")})` : ""}`,
    `face shapes the Engine would use: ${have.length ? have.join(", ") : "none (a still face)"}`,
    ...(vrm
      ? [
          `VRM ${vrm.meta?.metaVersion === "1" ? "1.0" : "0.x"}: "${vrm.meta?.name ?? ""}" by ${(vrm.meta?.authors ?? [vrm.meta?.author]).join(", ")}`,
          `spring bones: ${vrm.springBoneManager?.joints.size ?? 0}`,
        ]
      : []),
    `meshes ${info.meshes.length}, materials ${info.materials.length}, pictures ${info.images?.length ?? 0}`,
  ].join("\n");
  window.checked = {
    missing,
    have,
    bytes: bytes.byteLength,
    vrm: Boolean(vrm),
    springs: vrm?.springBoneManager?.joints.size ?? 0,
  };
  // (For looking closer from the console or a test: window.look("leftHand", 0.35) puts the camera on a bone.)
  window.look = (bone, distance = 0.5) => {
    const at = (byName.get(bone) ?? humanoid.getRawBoneNode(bone) ?? nodes.head).getWorldPosition(new Vector3());
    controls.target.copy(at);
    camera.position.set(at.x + distance * 0.25, at.y + distance * 0.2, at.z + distance);
    controls.update();
  };

  const started = performance.now();
  const frame = () => {
    const t = (performance.now() - started) / 1000;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== Math.round(width * renderer.getPixelRatio())) {
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    // Arms down (the Engine's resting pose turns the upper arms about this far) and a small sway.
    humanoid.getNormalizedBoneNode("leftUpperArm")?.rotation.set(0, 0, -1.2);
    humanoid.getNormalizedBoneNode("rightUpperArm")?.rotation.set(0, 0, 1.2);
    humanoid.getNormalizedBoneNode("spine")?.rotation.set(0, 0, Math.sin(t * 0.8) * 0.02);
    humanoid.getNormalizedBoneNode("head")?.rotation.set(0, Math.sin(t * 0.5) * 0.25, 0);
    if (have.includes("blink")) manager.setValue("blink", t % 3 < 0.15 ? 1 : 0);
    if (have.includes("aa")) manager.setValue("aa", Math.max(0, Math.sin(t * 6)) * 0.8);
    model.update(1 / 60);
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  };
  frame();
}

main().catch((error) => {
  said.textContent = `Couldn't load ${file}: ${error?.message ?? error}`;
  window.checked = { error: String(error?.message ?? error) };
});
