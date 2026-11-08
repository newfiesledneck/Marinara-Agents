#!/usr/bin/env node
// Converts animations from Quaternius's Universal Animation Library (CC0) into Wanderworld's compact
// recorded-motion file, packages/wanderworld/src/clips/ual.json.
//
// Usage: node scripts/build-wanderworld-clips.mjs <UAL1_Standard.glb> <UAL1_Standard_RM.glb>
// (both in the free "Universal Animation Library[Standard]" download, Unreal-Godot folder).
//
// For every frame it stores each humanoid bone's turn away from the T-pose, measured in the model's own
// space (a "world delta"), plus the hips' movement. Those play back on any humanoid rig, whatever its
// size or which optional bones it has: at runtime each bone's local turn is its delta relative to its
// nearest present parent's. Speeds come from the root-motion copy of each clip, in leg lengths per second.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { AnimationMixer, Quaternion, Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "packages/wanderworld/src/clips/ual.json");
/** Frames a second kept from each clip: more for the quick walking and running cycles. */
const FPS = 15;
const FAST_FPS = 30;
const FAST = new Set(["walk", "jog", "sprint"]);

/** The pack's (Unreal mannequin) bone names for each humanoid bone. */
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

/** Wanderworld's name for each clip it uses, and the pack's. */
const CLIPS = {
  idle: "Idle_Loop",
  walk: "Walk_Loop",
  jog: "Jog_Fwd_Loop",
  sprint: "Sprint_Loop",
  talk: "Idle_Talking_Loop",
  sitDown: "Sitting_Enter",
  sit: "Sitting_Idle_Loop",
  sitTalk: "Sitting_Talking_Loop",
  standUp: "Sitting_Exit",
};

async function load(path) {
  const bytes = readFileSync(path);
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  return new GLTFLoader().parseAsync(buffer, "");
}

function bonesOf(scene) {
  const found = {};
  scene.traverse((object) => {
    for (const [bone, name] of Object.entries(BONES)) if (object.name === name && !found[bone]) found[bone] = object;
  });
  return found;
}

const world = (object) => object.getWorldQuaternion(new Quaternion());
const where = (object) => object.getWorldPosition(new Vector3());

/** Poses the scene at `seconds` into `clip`. */
function poseAt(mixer, clip, seconds) {
  mixer.stopAllAction();
  const action = mixer.clipAction(clip);
  action.reset().play();
  mixer.setTime(seconds);
}

/** Turns `bone` in world space so the direction from it to `child` becomes `goal` (as the game does). */
function aim(bone, child, goal) {
  const from = where(child).sub(where(bone)).normalize();
  const turn = new Quaternion().setFromUnitVectors(from, goal);
  const parentTurn = bone.parent ? world(bone.parent) : new Quaternion();
  bone.quaternion.premultiply(parentTurn).premultiply(turn).premultiply(parentTurn.clone().invert());
  bone.updateMatrixWorld(true);
}

const round = (value) => Math.round(value * 10000) / 10000;

async function main() {
  const [plainPath, rootMotionPath] = process.argv.slice(2);
  if (!plainPath || !rootMotionPath)
    throw new Error("Usage: build-wanderworld-clips.mjs <UAL1_Standard.glb> <UAL1_Standard_RM.glb>");
  const plain = await load(plainPath);
  const moving = await load(rootMotionPath);
  const scene = plain.scene;
  const bones = bonesOf(scene);
  const missing = Object.keys(BONES).filter((bone) => !bones[bone]);
  if (missing.length) throw new Error(`The pack has no ${missing.join(", ")} bone`);
  const clipNamed = (gltf, name) => {
    const clip = gltf.animations.find((entry) => entry.name === name);
    if (!clip) throw new Error(`The pack has no ${name} animation`);
    return clip;
  };
  const mixer = new AnimationMixer(scene);

  // The reference pose: the pack's T-pose, arms straightened out to the sides, facing +z.
  poseAt(mixer, clipNamed(plain, "A_TPose"), 0);
  scene.updateMatrixWorld(true);
  const facing = where(bones.leftUpperArm).x >= where(bones.rightUpperArm).x ? 1 : -1;
  for (const [side, sign] of [
    ["left", 1],
    ["right", -1],
  ]) {
    const goal = new Vector3(sign * facing, 0, 0);
    aim(bones[`${side}UpperArm`], bones[`${side}LowerArm`], goal);
    aim(bones[`${side}LowerArm`], bones[`${side}Hand`], goal);
  }
  scene.updateMatrixWorld(true);
  const rest = Object.fromEntries(Object.entries(bones).map(([bone, node]) => [bone, world(node).invert()]));
  const legLength =
    where(bones.leftUpperLeg).distanceTo(where(bones.leftLowerLeg)) +
    where(bones.leftLowerLeg).distanceTo(where(bones.leftFoot));
  const hipsRest = where(bones.hips);
  // A pack facing -z is turned round: deltas are conjugated by a half turn about y, so x and z flip.
  const turnRound = (q) => (facing > 0 ? q : new Quaternion(-q.x, q.y, -q.z, q.w));

  const names = Object.keys(BONES);
  const clips = {};
  for (const [key, name] of Object.entries(CLIPS)) {
    const clip = clipNamed(plain, name);
    const frames = Math.max(2, Math.round(clip.duration * (FAST.has(key) ? FAST_FPS : FPS)) + 1);
    const rotations = [];
    const hips = [];
    for (let frame = 0; frame < frames; frame++) {
      poseAt(mixer, clip, (frame / (frames - 1)) * clip.duration);
      scene.updateMatrixWorld(true);
      for (const bone of names) {
        const delta = turnRound(world(bones[bone]).multiply(rest[bone]));
        if (delta.w < 0) delta.set(-delta.x, -delta.y, -delta.z, -delta.w); // keep w ≥ 0, so it can be left out
        rotations.push(round(delta.x), round(delta.y), round(delta.z));
      }
      const offset = where(bones.hips).sub(hipsRest).divideScalar(legLength);
      hips.push(round(offset.x * facing), round(offset.y), round(offset.z * facing));
    }
    // Speed: how fast the planted foot slides back under the body in the walk-in-place copy, in leg
    // lengths per second. Playing a clip at the rate that matches that to the real speed keeps the feet
    // planted. (The root-motion copy only says whether the clip moves at all.)
    const movingScene = moving.scene;
    const movingHips = bonesOf(movingScene).hips;
    const movingMixer = new AnimationMixer(movingScene);
    const movingClip = clipNamed(moving, name);
    poseAt(movingMixer, movingClip, 0);
    movingScene.updateMatrixWorld(true);
    const start = where(movingHips);
    poseAt(movingMixer, movingClip, movingClip.duration * 0.999);
    movingScene.updateMatrixWorld(true);
    const travelled = Math.hypot(where(movingHips).x - start.x, where(movingHips).z - start.z);
    let speed = 0;
    if (travelled > 0.05) {
      const samples = 160;
      const feet = [];
      for (let i = 0; i <= samples; i++) {
        poseAt(mixer, clip, (i / samples) * clip.duration * 0.9999);
        scene.updateMatrixWorld(true);
        feet.push([where(bones.leftFoot), where(bones.rightFoot)]);
      }
      const lowest = Math.min(...feet.flat().map((foot) => foot.y));
      let sum = 0;
      let count = 0;
      let anyDown = 0;
      for (let i = 1; i <= samples; i++) {
        if (feet[i].some((foot) => foot.y <= lowest + 0.02)) anyDown++;
        for (const side of [0, 1]) {
          const now = feet[i][side];
          const was = feet[i - 1][side];
          if (now.y > lowest + 0.02 || was.y > lowest + 0.02) continue; // only a foot on the ground
          sum += -((now.z - was.z) * facing) / (clip.duration / samples);
          count++;
        }
      }
      // Running is mostly in the air, where no foot is planted: there the root-motion distance is the truer speed.
      speed = count && anyDown / samples > 0.6 ? sum / count / legLength : travelled / movingClip.duration / legLength;
    }
    clips[key] = { duration: round(clip.duration), frames, speed: round(speed), rotations, hips };
    console.log(
      `${key.padEnd(8)} ${name.padEnd(22)} ${clip.duration.toFixed(2)} s, ${frames} frames, ${(speed * legLength).toFixed(2)} m/s on the pack's model`,
    );
  }

  mkdirSync(dirname(OUT), { recursive: true });
  const file = {
    source: "Universal Animation Library (Standard) by Quaternius, CC0 1.0 (public domain), quaternius.com",
    fps: FPS, // the walking and running clips keep FAST_FPS
    bones: names,
    clips,
  };
  writeFileSync(OUT, `${JSON.stringify(file)}\n`);
  console.log(`wrote ${OUT} (${(JSON.stringify(file).length / 1024).toFixed(0)} KB)`);
}

await main();
