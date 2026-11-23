// Face movement: the face's shape keys, named as VRM names its expressions, and the eyes' bones, which the
// saved file carries (exporter.js) and the preview plays here.
//
// The keys come from the body's model (assets/scripts/make_avatar.py FACE_MOVES: mixes of MakeHuman's
// expression units). The body mesh keeps them live as morph targets (avatar.js), each 0 to 1. The eyes turn
// on their bones, eye_l and eye_r, about each eyeball's centre.
import { Quaternion, Vector3 } from "three";

/** The face's keys, in the model's order: VRM 1.0's expression presets (blinks, mouth shapes, feelings). */
export const FACE_MOVES = [
  "blink",
  "blinkLeft",
  "blinkRight",
  "aa",
  "ih",
  "ou",
  "ee",
  "oh",
  "happy",
  "angry",
  "sad",
  "relaxed",
  "surprised",
];
const VOWELS = ["aa", "ih", "ou", "ee", "oh"];

/** What the preview's face does: [mode, label]. */
export const FACE_MODES = [
  ["lively", "Lively: blinks and looks at you"],
  ["talking", "Talking"],
  ["still", "Still"],
  ["happy", "Happy"],
  ["angry", "Angry"],
  ["sad", "Sad"],
  ["relaxed", "Relaxed"],
  ["surprised", "Surprised"],
  ["blink", "Eyes closed"],
];

// How far the eyes turn from straight ahead (radians): VRM apps keep theirs within about this.
const LOOK_SIDEWAYS = 0.35;
const LOOK_UP = 0.2;
const LOOK_DOWN = 0.25;

/** A number from 0 to 1 for `n`, the same every time: when the next blink or glance comes. */
const hashed = (n) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** How closed the eyes are at `seconds`: a blink every two to six seconds, a fifth of a second long. */
export function blinkAt(seconds) {
  let at = 0;
  for (let n = 0; n < 1000; n++) {
    const next = at + 2 + hashed(n) * 4;
    if (seconds < next) {
      const into = seconds - at;
      return into < 0.2 ? Math.sin((into / 0.2) * Math.PI) : 0;
    }
    at = next;
  }
  return 0;
}

/** The mouth's shapes at `seconds` of talking: a vowel every eighth of a second or so, blended, with pauses. */
export function talkingAt(seconds) {
  const weights = Object.fromEntries(VOWELS.map((vowel) => [vowel, 0]));
  const phrase = Math.floor(seconds / 2.4);
  const into = seconds - phrase * 2.4;
  if (into > 1.9) return weights; // (a pause between phrases)
  const step = into / 0.13;
  const syllable = Math.floor(step);
  const t = step - syllable;
  const vowel = VOWELS[Math.floor(hashed(phrase * 31 + syllable) * VOWELS.length)];
  weights[vowel] = Math.sin(t * Math.PI) * (0.55 + 0.45 * hashed(phrase * 7 + syllable));
  return weights;
}

/** The figure's face keys set to `weights` ({ key: 0..1 }); keys not named go to 0. */
export function setFace(figure, weights = {}) {
  for (const mesh of figure.meshes) {
    const names = mesh.morphTargetDictionary;
    if (!names) continue;
    for (const [key, at] of Object.entries(names)) mesh.morphTargetInfluences[at] = weights[key] ?? 0;
  }
}

const turn = new Quaternion();
const parentTurn = new Quaternion();
const headTurn = new Quaternion();
const forward = new Vector3();
const to = new Vector3();
const eyeAt = new Vector3();
const up = new Vector3();

/**
 * The eyes turned towards `target` (a point in the world), no further than VRM apps turn them, or straight
 * ahead with no target. Each eye bone starts from its rest turn, so this can run every frame in any pose.
 */
export function lookTowards(figure, target = null) {
  const head = figure.humanoid.head;
  for (const side of ["l", "r"]) {
    const eye = figure.bones.get(`eye_${side}`);
    if (!eye) continue;
    eye.quaternion.copy(figure.rest.get(eye.name));
    eye.updateMatrixWorld(true);
    if (!target || !head) continue;
    // (Straight ahead: where the head faces, as it faced +Z when built.)
    head.getWorldQuaternion(headTurn).multiply(figure.headRest.clone().invert());
    forward.set(0, 0, 1).applyQuaternion(headTurn);
    up.set(0, 1, 0).applyQuaternion(headTurn);
    eye.getWorldPosition(eyeAt);
    to.copy(target).sub(eyeAt).normalize();
    // Sideways and up or down from straight ahead, each held within its reach.
    const side_ = new Vector3().crossVectors(up, forward);
    const yaw = Math.max(-LOOK_SIDEWAYS, Math.min(LOOK_SIDEWAYS, Math.atan2(to.dot(side_), to.dot(forward))));
    const pitch = Math.max(-LOOK_DOWN, Math.min(LOOK_UP, Math.asin(Math.max(-1, Math.min(1, to.dot(up))))));
    turn.setFromAxisAngle(up, yaw).multiply(new Quaternion().setFromAxisAngle(side_, -pitch));
    parentTurn.identity();
    eye.parent?.getWorldQuaternion(parentTurn);
    // world' = turn × world; local' = parent⁻¹ × world'.
    eye.quaternion.premultiply(parentTurn).premultiply(turn).premultiply(parentTurn.invert());
    eye.updateMatrixWorld(true);
  }
}

/**
 * The face for the preview's `mode` (FACE_MODES) at `seconds`: its keys, and its eyes on `viewer` (the
 * camera's place) while lively or talking. `still` motion (the user asked for less) keeps blinks and talk
 * out and the eyes ahead.
 */
export function animateFace(figure, mode, seconds, viewer = null, still = false) {
  const weights = {};
  const lively = mode === "lively" || mode === "talking";
  if (lively && !still) {
    weights.blink = blinkAt(seconds);
    if (mode === "talking") Object.assign(weights, talkingAt(seconds));
  } else if (mode === "talking") weights.aa = 0.5;
  else if (mode !== "lively" && mode !== "still") weights[mode] = 1;
  setFace(figure, weights);
  // (Now and then, while lively, a glance a little aside before coming back.)
  let target = lively && !still ? viewer : null;
  if (target && mode === "lively") {
    const glance = Math.floor(seconds / 3);
    if (hashed(glance + 500) < 0.35 && seconds - glance * 3 < 0.9) {
      target = target.clone().add(new Vector3((hashed(glance) - 0.5) * 0.8, (hashed(glance + 9) - 0.5) * 0.4, 0));
    }
  }
  lookTowards(figure, target);
}
