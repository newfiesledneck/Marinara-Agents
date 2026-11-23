// A built avatar standing on the floor, and the poses the maker puts it in.
//
// The kit's bodies rest in an A-pose: arms 45 degrees below level, elbows bent a little, fingers in a soft
// curl (assets/scripts/make_avatar.py). That is the pose the maker shows and the pose a plain GLB is saved
// in (the Engine's 3D Avatars agent straightens a GLB's arms itself). A VRM must rest in a T-pose, arms
// level, so `tPose` turns the arm and finger bones there, and `restPose` puts them back.
import { Box3, Group, Quaternion, Vector3 } from "three";
import { HUMANOID_BONES } from "./kitfiles.js";

const worldA = new Vector3();
const worldB = new Vector3();
const turn = new Quaternion();
const parentTurn = new Quaternion();

/** Turns `bone` in world space so the direction from it to `child` becomes `goal`. */
export function aimBone(bone, child, goal) {
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
 * The skeleton's root with its skinned meshes on it, scaled to `height` (a share of the body's own) and
 * stood on the floor: { object (add this to a scene), root, bones (name → Bone), meshes, humanoid (VRM
 * bone name → Bone), rest (each bone's turn as built), restAt (its place), headRest (the head's turn in the world as built) }.
 */
export function standFigure(root, bones, height = 1) {
  const object = new Group();
  object.add(root);
  root.scale.setScalar(height);
  root.updateMatrixWorld(true);
  const meshes = root.children.filter((child) => child.isSkinnedMesh);
  // (A skinned mesh's box is worked out from its vertices as posed, so longer legs still stand on the floor.)
  const floor = new Box3().setFromObject(root).min.y;
  const hips = bones.get(HUMANOID_BONES.hips)?.getWorldPosition(worldA) ?? worldA.set(0, 0, 0);
  root.position.set(-hips.x, Number.isFinite(floor) ? -floor : 0, -hips.z);
  root.updateMatrixWorld(true);
  const humanoid = {};
  for (const [name, joint] of Object.entries(HUMANOID_BONES)) if (bones.has(joint)) humanoid[name] = bones.get(joint);
  const rest = new Map([...bones].map(([name, bone]) => [name, bone.quaternion.clone()]));
  // (Where each bone sits on its parent as built: the preview's motions move the hips.)
  const restAt = new Map([...bones].map(([name, bone]) => [name, bone.position.clone()]));
  // (How the head is turned as built, facing +Z: the face's eyes measure "straight ahead" from it.)
  const headRest = humanoid.head?.getWorldQuaternion(new Quaternion()) ?? new Quaternion();
  return { object, root, bones, meshes, humanoid, rest, restAt, headRest };
}

/** Arms level and fingers straight along them: the rest pose a VRM asks for. */
export function tPose(figure) {
  restPose(figure);
  const nodes = figure.humanoid;
  for (const [side, sign] of [
    ["left", 1],
    ["right", -1],
  ]) {
    const goal = new Vector3(sign, 0, 0);
    aimBone(nodes[`${side}UpperArm`], nodes[`${side}LowerArm`], goal);
    aimBone(nodes[`${side}LowerArm`], nodes[`${side}Hand`], goal);
    for (const finger of ["Index", "Middle", "Ring", "Little"]) {
      aimBone(nodes[`${side}${finger}Proximal`], nodes[`${side}${finger}Intermediate`], goal);
      aimBone(nodes[`${side}${finger}Intermediate`], nodes[`${side}${finger}Distal`], goal);
    }
  }
  figure.root.updateMatrixWorld(true);
}

/** Every bone back as the body was built: the A-pose. */
export function restPose(figure) {
  for (const [name, bone] of figure.bones) {
    bone.quaternion.copy(figure.rest.get(name));
    const at = figure.restAt?.get(name);
    if (at) bone.position.copy(at);
  }
  figure.root.updateMatrixWorld(true);
}

/**
 * A relaxed stand for the preview: arms lowered from the A-pose towards the sides, and a little life
 * (breathing in the chest, a slow sway) from `seconds`.
 */
export function relaxedPose(figure, seconds = 0) {
  restPose(figure);
  const nodes = figure.humanoid;
  const down = new Vector3();
  for (const [side, sign] of [
    ["left", 1],
    ["right", -1],
  ]) {
    // (Mostly down, a little out, so the hands clear the hips and a wide skirt.)
    down.set(sign * 0.3, -1, 0.03).normalize();
    aimBone(nodes[`${side}UpperArm`], nodes[`${side}LowerArm`], down);
    down.set(sign * 0.22, -1, 0.12).normalize();
    aimBone(nodes[`${side}LowerArm`], nodes[`${side}Hand`], down);
  }
  const breath = Math.sin(seconds * 1.6) * 0.012;
  const sway = Math.sin(seconds * 0.55) * 0.012;
  if (nodes.chest) nodes.chest.rotateX(-breath);
  if (nodes.spine) nodes.spine.rotateZ(sway);
  if (nodes.head) nodes.head.rotateZ(-sway * 0.6);
  figure.root.updateMatrixWorld(true);
}

const UP = new Vector3(0, 1, 0);
const SIDEWAYS = new Vector3(1, 0, 0);
/** Turns `bone` by `angle` about `axis` in the world, as the figure stands now. */
export function turnInWorld(bone, axis, angle) {
  if (!bone || !angle) return;
  parentTurn.identity();
  bone.parent?.getWorldQuaternion(parentTurn);
  turn.setFromAxisAngle(axis, angle);
  bone.quaternion.premultiply(parentTurn).premultiply(turn).premultiply(parentTurn.invert());
  bone.updateMatrixWorld(true);
}

/**
 * The relaxed stand, looking about: every few seconds the head turns quickly to one side, holds, and turns
 * to the other, the hips and body following a little, with a nod now and then; and now and then one knee
 * lifts in a small step. It shows how the hair, a skirt or coat (and a tail) swing.
 */
export function movingPose(figure, seconds = 0) {
  relaxedPose(figure, seconds);
  const nodes = figure.humanoid;
  // (A quick turn, then a hold: the sine pushed towards a square wave.)
  const look = Math.tanh(Math.sin(seconds * 0.9) * 3) / Math.tanh(3);
  // (A step: each knee in turn lifts forward and back down, then both stand a while.)
  const beat = Math.sin(seconds * 1.3);
  for (const [side, lift] of [
    ["left", Math.max(0, beat)],
    ["right", Math.max(0, -beat)],
  ]) {
    const up = Math.max(0, (lift - 0.3) / 0.7) ** 2;
    turnInWorld(nodes[`${side}UpperLeg`], SIDEWAYS, -up * 0.45);
    turnInWorld(nodes[`${side}LowerLeg`], SIDEWAYS, up * 0.7);
  }
  turnInWorld(nodes.hips, UP, look * 0.12);
  turnInWorld(nodes.spine, UP, look * 0.1);
  turnInWorld(nodes.head, UP, look * 0.4);
  turnInWorld(nodes.head, SIDEWAYS, Math.max(0, Math.sin(seconds * 1.7)) * 0.12);
  figure.root.updateMatrixWorld(true);
}
