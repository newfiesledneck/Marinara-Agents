#!/usr/bin/env node
// Converts animations from Quaternius's Universal Animation Library and Universal Animation Library 2 (both
// CC0) into the 3D Avatar Maker's recorded-motion file, packages/3d-avatar-maker/src/clips/ual.json, which
// the preview's animations play (src/motions.js).
//
// Usage: node scripts/build-3d-avatar-maker-clips.mjs <UAL1.glb> <UAL2.glb>
// (each library's Unreal-Godot .glb, as downloaded from quaternius.com; the free Standard tiers have every clip
// used here). The files are read as data.
//
// Began as a copy of scripts/build-wanderworld-clips.mjs; this package keeps its own. For every frame it
// stores each humanoid bone's turn away from the T-pose, measured in the model's own space, and the hips'
// movement in leg lengths, so a clip plays on any body at any size (motions.js). To keep the file small, a
// turn is three whole numbers (x, y and z of the quaternion times SCALE; w is worked out, kept at 0 or
// above), and most clips keep 12 frames a second.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { AnimationMixer, Quaternion, Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { HUMANOID_BONES } from "../packages/3d-avatar-maker/src/kitfiles.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "packages/3d-avatar-maker/src/clips/ual.json");
const SCALE = 1000;
const FPS = 12;

/** The humanoid bones a clip turns: all of the maker's but the eyes, which the face turns. */
const BONES = Object.fromEntries(Object.entries(HUMANOID_BONES).filter(([bone]) => !/Eye$/u.test(bone)));

/** The clips the preview plays: the maker's name for each → [the library's name, library (1 or 2), frames a second]. */
const CLIPS = {
  idle: ["Idle_Loop", 1, FPS],
  lookAround: ["Idle_LookAround_Loop", 1, FPS],
  talk: ["Idle_Talking_Loop", 1, FPS],
  phone: ["Idle_TalkingPhone_Loop", 2, FPS],
  walk: ["Walk_Loop", 1, 20],
  walkFormal: ["Walk_Formal_Loop", 1, 20],
  dance: ["Dance_Loop", 1, 20],
  celebrate: ["Celebration", 1, 15],
  yes: ["Yes", 2, FPS],
  no: ["Idle_No_Loop", 2, FPS],
  foldArms: ["Idle_FoldArms_Loop", 2, 8],
  surprise: ["Surprise", 2, 15],
  cry: ["Crying", 1, FPS],
  drink: ["Drink", 1, FPS],
  sitDown: ["Sitting_Enter", 1, 15],
  sit: ["Sitting_Idle_Loop", 1, FPS],
  sitTalk: ["Sitting_Talking_Loop", 1, FPS],
  standUp: ["Sitting_Exit", 1, 15],
  groundSitDown: ["GroundSit_Enter", 1, 15],
  groundSit: ["GroundSit_Idle_Loop", 1, FPS],
  groundStandUp: ["GroundSit_Exit", 1, 15],
  crouchDown: ["Crouch_Enter", 1, 15],
  crouch: ["Crouch_Idle_Loop", 1, FPS],
  crouchUp: ["Crouch_Exit", 1, 15],
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
  mixer.clipAction(clip).reset().play();
  mixer.setTime(seconds);
}

/** Turns `bone` in world space so the direction from it to `child` becomes `goal`. */
function aim(bone, child, goal) {
  const from = where(child).sub(where(bone)).normalize();
  const turn = new Quaternion().setFromUnitVectors(from, goal);
  const parentTurn = bone.parent ? world(bone.parent) : new Quaternion();
  bone.quaternion.premultiply(parentTurn).premultiply(turn).premultiply(parentTurn.clone().invert());
  bone.updateMatrixWorld(true);
}

function clipNamed(gltf, name) {
  const clip = gltf.animations.find((entry) => entry.name === name);
  if (!clip) throw new Error(`The library has no ${name} animation`);
  return clip;
}

/**
 * A library ready to be posed: its scene and bones, each bone's turn at rest (its T-pose, the upper and lower
 * arms straightened out to the sides), its leg length, where its hips rest and which way it faces.
 */
function rig(gltf) {
  const { scene } = gltf;
  const bones = bonesOf(scene);
  const missing = Object.keys(BONES).filter((bone) => !bones[bone]);
  if (missing.length) throw new Error(`The library has no ${missing.join(", ")} bone`);
  const mixer = new AnimationMixer(scene);
  poseAt(mixer, clipNamed(gltf, "A_TPose"), 0);
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
  return { scene, bones, mixer, facing, rest, legLength, hipsRest: where(bones.hips) };
}

async function main() {
  const [first, second] = process.argv.slice(2);
  if (!first || !second) throw new Error("Usage: build-3d-avatar-maker-clips.mjs <UAL1.glb> <UAL2.glb>");
  const gltfs = { 1: await load(first), 2: await load(second) };
  const rigs = { 1: rig(gltfs[1]), 2: rig(gltfs[2]) };
  const names = Object.keys(BONES);
  const clips = {};
  for (const [key, [name, library, fps]] of Object.entries(CLIPS)) {
    const { scene, bones, mixer, facing, rest, legLength, hipsRest } = rigs[library];
    // (A library facing -z is turned round: its turns conjugated by a half turn about y, so x and z flip.)
    const turnRound = (q) => (facing > 0 ? q : new Quaternion(-q.x, q.y, -q.z, q.w));
    const clip = clipNamed(gltfs[library], name);
    const frames = Math.max(2, Math.round(clip.duration * fps) + 1);
    const rotations = [];
    const hips = [];
    for (let frame = 0; frame < frames; frame++) {
      // (The last frame is taken just before the end: at the end itself the mixer is back at the start.)
      poseAt(mixer, clip, Math.min((frame / (frames - 1)) * clip.duration, clip.duration - 0.002));
      scene.updateMatrixWorld(true);
      for (const bone of names) {
        const delta = turnRound(world(bones[bone]).multiply(rest[bone]));
        if (delta.w < 0) delta.set(-delta.x, -delta.y, -delta.z, -delta.w);
        rotations.push(Math.round(delta.x * SCALE), Math.round(delta.y * SCALE), Math.round(delta.z * SCALE));
      }
      const offset = where(bones.hips).sub(hipsRest).divideScalar(legLength);
      hips.push(
        Math.round(offset.x * facing * SCALE),
        Math.round(offset.y * SCALE),
        Math.round(offset.z * facing * SCALE),
      );
    }
    clips[key] = { duration: Math.round(clip.duration * 1000) / 1000, frames, rotations, hips };
    console.log(`${key.padEnd(14)} ${name.padEnd(24)} ${clip.duration.toFixed(2)} s, ${frames} frames`);
  }
  mkdirSync(dirname(OUT), { recursive: true });
  const file = {
    source:
      "Universal Animation Library and Universal Animation Library 2 by Quaternius (quaternius.com), CC0 1.0 (public domain)",
    scale: SCALE,
    bones: names,
    clips,
  };
  const text = `${JSON.stringify(file)}\n`;
  writeFileSync(OUT, text);
  console.log(`wrote ${OUT} (${(text.length / 1024).toFixed(0)} KB)`);
}

await main();
