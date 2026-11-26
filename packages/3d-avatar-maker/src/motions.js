// Animations for the preview: standing, walking, talking, dancing, sitting and more, so the user sees the
// avatar, its clothes and its hair move while they build it. Nothing here is saved: a file rests in its A- or
// T-pose (exporter.js), and `restPose` puts every bone back.
//
// Most are recorded: clips from Quaternius's Universal Animation Library and Universal Animation Library 2
// (CC0), converted by scripts/build-3d-avatar-maker-clips.mjs into clips/ual.json. Each frame there holds
// every humanoid bone's turn away from the T-pose in the model's own space, and the hips' movement in leg
// lengths, so a clip plays on either body at any height, limb length or head size: each bone is turned that
// far from where it stands in this body's own T-pose (`recordedPose`). The feet are then put back on the
// floor, whatever the legs' proportions.
//
// Waving and stretching have no clip, so they're written here: a function of the time that says where the
// hips go and how they turn, how the spine and head turn, where each arm points and each foot stands, put on
// the body in world space as figure.js does (`motionPose`):
// - lengths are shares of the leg;
// - each arm points where it's told, its elbow bending the way an elbow bends;
// - each leg reaches its foot (two-bone IK), its knee forward, the foot flat or on its toes, and the hips
//   come down when a foot couldn't otherwise reach the floor.
// A turn on the spot turns the whole figure on its hips (the camera stays where it is). The springs (hair, a
// tail) run after the pose each frame and follow on their own.
import { Euler, Quaternion, Vector3 } from "three";
import data from "./clips/ual.json" with { type: "json" };
import { talkingAt } from "./face.js";
import { aimBone, restPose, tPose, turnInWorld } from "./figure.js";

/**
 * The recorded motions: each the clips it goes through, over and over: "clip", "clip*times" for a clip played
 * more than once, "clip@speed" for one played slower or faster (a quick drop slowed, so long hair on its
 * springs follows rather than flies up). Going from one clip to another eases over FADE seconds. `spin`: the
 * seconds the figure takes to turn once round on its hips as it plays; `calm`: another clip mixed in, and how
 * much of it (the walk half the idle, for small steps).
 */
const RECORDED = {
  idle: { clips: "idle" },
  look: { clips: "lookAround" },
  talk: { clips: "talk" },
  phone: { clips: "phone" },
  walk: { clips: "walk" },
  "walk-formal": { clips: "walkFormal" },
  // (The library's own turns go a quarter round and back, so the turn is the walk, calmed, turning.)
  turn: { clips: "walk", calm: ["idle", 0.55], spin: 10 },
  dance: { clips: "dance" },
  celebrate: { clips: "celebrate idle" },
  yes: { clips: "yes idle" },
  no: { clips: "no" },
  "fold-arms": { clips: "foldArms" },
  surprise: { clips: "surprise idle" },
  cry: { clips: "cry" },
  drink: { clips: "drink idle" },
  // (The library's seated talk throws both hands up by the face, which reads as a glitch mid-loop: left out.)
  sit: { clips: "sitDown@0.6 sit*4 standUp idle" },
  "ground-sit": { clips: "groundSitDown@0.6 groundSit*3 groundStandUp idle" },
  crouch: { clips: "crouchDown@0.5 crouch crouchUp@0.6 idle" },
};

/** The preview's animations: [id, label (its name and what it does), more about it]. */
export const MOTIONS = [
  // (What a chat shows: the Engine's own movement, which is all a chat plays. `chatPose`.)
  [
    "chat-idle",
    "In a chat: waiting",
    "As Marinara Engine shows the avatar in a chat: arms at its sides, breathing, swaying a little. A chat plays none of the animations below",
  ],
  [
    "chat-talking",
    "In a chat: talking",
    "As in a chat while it speaks: the same stand, the head nodding with the voice",
  ],
  [
    "chat-thinking",
    "In a chat: thinking",
    "As in a chat while a reply is on its way: the head tilted, looking up a little",
  ],
  ["chat-listening", "In a chat: listening", "As in a chat while you type: leaning in a little, the head tilted"],
  ["idle", "Standing at ease", "Stands, breathing, shifting its weight now and then"],
  ["look", "Looking around", "Looks one way and another, turning its head and shoulders"],
  ["talk", "Talking with its hands", "Talks with its hands and head; the mouth moves while the Face list is on Lively"],
  [
    "phone",
    "Talking on a phone",
    "Holds a phone (not shown) to its ear and talks; the mouth moves while the Face list is on Lively",
  ],
  ["walk", "Walking on the spot", "Walks without going anywhere, arms swinging"],
  ["walk-formal", "Walking smartly on the spot", "A stiffer, upright walk without going anywhere"],
  ["turn", "Turning round, step by step", "Steps slowly round on the spot, to show every side"],
  ["wave", "Waving hello", "Raises its right hand, waves hello and lowers it again"],
  ["dance", "Dancing", "Dances on the spot"],
  ["celebrate", "Celebrating", "Cheers with its arms up; smiles while the Face list is on Lively"],
  ["yes", "Nodding yes", "Nods yes, then stands"],
  ["no", "Shaking its head no", "Shakes its head and a hand, no"],
  ["fold-arms", "Arms folded", "Stands with its arms folded"],
  ["surprise", "Surprised", "Starts back in surprise; the face is surprised while the Face list is on Lively"],
  ["cry", "Crying", "Cries into its hands; the face is sad while the Face list is on Lively"],
  ["drink", "Drinking", "Drinks from a cup (not shown), then stands"],
  ["sit", "Sitting down and getting up", "Sits on a seat (not shown), rests and stands up again"],
  ["ground-sit", "Sitting on the ground", "Sits down on the floor, rests and gets up again"],
  ["crouch", "Crouching down and up", "Crouches, waits a moment and stands up again"],
  [
    "stretch",
    "Stretching: arms up, side to side",
    "Reaches both arms over its head, leans to each side and lowers them",
  ],
];

/** What a motion does with the face while the Face list is on Lively (the user's other choices win). */
const MOTION_FACES = {
  "chat-talking": "talking",
  talk: "talking",
  phone: "talking",
  celebrate: "happy",
  surprise: "surprised",
  cry: "sad",
};

const SIDE = new Vector3(1, 0, 0); // (the figure's left: it faces +Z)
const UP = new Vector3(0, 1, 0);
const FORWARD = new Vector3(0, 0, 1);
const TAU = Math.PI * 2;

const clamp = (x, low = 0, high = 1) => Math.min(high, Math.max(low, x));
/** 0 to 1, eased at both ends. */
const smooth = (x) => {
  const t = clamp(x);
  return t * t * (3 - 2 * t);
};
const lerp = (a, b, t) => a + (b - a) * t;
const mix = (a, b, t) => a.map((value, i) => lerp(value, b[i], t));
/** A number from 0 to 1 for `n`, the same every time (as face.js picks its blinks). */
const hashed = (n) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
/** A value from -0.5 to 0.5 that wanders smoothly, a new aim every `period` seconds. */
const drift = (t, period, seed) => {
  const k = Math.floor(t / period);
  return lerp(hashed(k + seed) - 0.5, hashed(k + 1 + seed) - 0.5, smooth(t / period - k));
};
/** The value at `t` of a loop `period` long through `keys` ([time, value] pairs from 0), eased between them. */
function keyed(t, period, keys) {
  const at = ((t % period) + period) % period;
  for (let i = 0; i < keys.length; i++) {
    const [from, a] = keys[i];
    const [to, b] = keys[i + 1] ?? [period, keys[0][1]];
    if (at >= from && at < to) return lerp(a, b, smooth((at - from) / (to - from)));
  }
  return keys[0][1];
}

// Each arm's direction is given for the left arm (x outward, y up, z forward) and mirrored for the right.
/** The arms hanging at the sides, as figure.js relaxedPose has them. */
const HANG = [0.3, -1, 0.03];
const HANG_FORE = [0.22, -1, 0.12];
const relaxedArm = () => ({ dir: HANG, fore: HANG_FORE });

/** A pose with nothing moved: each motion fills in what it moves. */
function still() {
  return {
    hips: { x: 0, y: 0, z: 0, pitch: 0, yaw: 0, lean: 0 },
    spine: { pitch: 0, yaw: 0, lean: 0 },
    head: { pitch: 0, yaw: 0, lean: 0 },
    left: relaxedArm(),
    right: relaxedArm(),
    armsSway: 0,
    feet: { left: { x: 0, y: 0, z: 0, pitch: 0 }, right: { x: 0, y: 0, z: 0, pitch: 0 } },
    kneesOut: 0,
    facing: 0,
  };
}

// The hand-made motions. Distances are shares of the leg's length; turns are radians. Pitch leans forward
// (or, for a foot, lifts the heel), yaw turns to the figure's left, lean tips to its left.
/** Standing at ease, breathing and shifting its weight: what waving and stretching start from. */
function standing(t) {
  const pose = still();
  const breath = Math.sin(t * 1.5);
  const shift = Math.tanh(Math.sin(t * 0.32) * 2.5) / Math.tanh(2.5); // (weight on one foot, then the other)
  pose.hips.x = shift * 0.025;
  pose.hips.y = -0.004;
  pose.hips.lean = -shift * 0.025;
  pose.spine.lean = shift * 0.03;
  pose.spine.pitch = -breath * 0.015;
  pose.head.lean = shift * 0.01 + drift(t, 4, 11) * 0.05;
  pose.head.yaw = drift(t, 5, 3) * 0.12;
  pose.head.pitch = breath * 0.01;
  pose.left = { dir: [0.3 + breath * 0.01, -1, 0.03], fore: HANG_FORE };
  pose.right = { dir: [0.3 + breath * 0.01, -1, 0.03], fore: HANG_FORE };
  return pose;
}

const POSES = {
  wave(t) {
    const pose = standing(t);
    const up = keyed(t, 5, [
      [0, 0],
      [0.7, 1],
      [3.6, 1],
      [4.3, 0],
    ]);
    const swing = Math.sin((TAU * t) / 0.65) * smooth((up - 0.6) / 0.4);
    pose.right = {
      dir: mix(HANG, [0.8, 0.42, 0.32], up),
      fore: mix(HANG_FORE, [0.05 + swing * 0.42, 1, 0.22], up),
      roll: 0.5 * up,
    };
    pose.spine.lean += 0.04 * up;
    pose.head.lean += -0.06 * up;
    return pose;
  },

  stretch(t) {
    const pose = standing(t);
    const period = 7.5;
    const up = keyed(t, period, [
      [0, 0],
      [1.1, 1],
      [5.9, 1],
      [7, 0],
    ]);
    const lean = keyed(t, period, [
      [0, 0],
      [1.8, 0],
      [2.7, 1],
      [3.4, 1],
      [4.4, -1],
      [5.1, -1],
      [5.9, 0],
    ]);
    const toes = keyed(t, period, [
      [0, 0],
      [1.1, 0],
      [1.5, 1],
      [1.9, 0],
    ]);
    for (const side of ["left", "right"])
      pose[side] = { dir: mix(HANG, [0.38, 1, 0.04], up), fore: mix(HANG_FORE, [0.18, 1, 0.08], up), roll: -0.4 * up };
    pose.spine.lean = lean * 0.3;
    pose.spine.pitch = -0.08 * up;
    pose.hips.x = -lean * 0.03;
    pose.hips.lean = -lean * 0.05;
    pose.head.pitch = -0.15 * up;
    pose.head.lean = lean * 0.08;
    pose.armsSway = lean * 0.08;
    pose.feet.left.pitch = toes * 0.5;
    pose.feet.right.pitch = toes * 0.5;
    return pose;
  },
};

// ── Recorded motion ──

const BONES = data.bones;
const COUNT = BONES.length;
const FADE = 0.3; // seconds one clip eases into the next
/** The clips, unpacked once: each bone's turn as x, y, z, w per frame, and the hips' offsets. */
const CLIPS = Object.fromEntries(
  Object.entries(data.clips).map(([name, clip]) => {
    const rotations = new Float32Array(clip.frames * COUNT * 4);
    for (let i = 0; i < clip.frames * COUNT; i++) {
      const [x, y, z] = [0, 1, 2].map((c) => clip.rotations[i * 3 + c] / data.scale);
      rotations.set([x, y, z, Math.sqrt(Math.max(0, 1 - x * x - y * y - z * z))], i * 4);
    }
    const hips = Float32Array.from(clip.hips, (value) => value / data.scale);
    return [name, { duration: clip.duration, frames: clip.frames, rotations, hips }];
  }),
);
/** Each recorded motion laid out: its clips one after another, each with when it starts and how it eases in. */
const PLANS = Object.fromEntries(
  Object.entries(RECORDED).map(([id, motion]) => {
    const names = motion.clips.split(" ").flatMap((entry) => {
      const [, name, times = 1, speed = 1] = /^(\w+)(?:\*(\d+))?(?:@([\d.]+))?$/u.exec(entry);
      return Array.from({ length: Number(times) }, () => [name, Number(speed)]);
    });
    // (A clip after itself goes straight on, as a loop does; another eases in over FADE.)
    const fadeInto = (i) => (names[i][0] === names.at(i - 1)[0] ? 0 : FADE);
    const plays = [];
    let at = 0;
    names.forEach(([name, speed], i) => {
      if (i) at -= fadeInto(i);
      const clip = CLIPS[name];
      plays.push({ clip, speed, start: at, fade: fadeInto(i), length: clip.duration / speed });
      at += clip.duration / speed;
    });
    // (The first clip eases in from the last as the loop comes round, so a round is that much shorter.)
    return [id, { ...motion, plays, length: at - plays[0].fade }];
  }),
);
const sampled = Array.from({ length: 2 }, () => ({ rotations: BONES.map(() => new Quaternion()), hips: [0, 0, 0] }));
const qa = new Quaternion();
const qb = new Quaternion();

/** Every bone's turn and the hips' offset `seconds` into `clip`, into `out`. */
function sample(clip, seconds, out) {
  const position = clamp(seconds / clip.duration, 0, 0.999999) * (clip.frames - 1);
  const frame = Math.floor(position);
  const t = position - frame;
  const next = Math.min(clip.frames - 1, frame + 1);
  for (let bone = 0; bone < COUNT; bone++) {
    qa.fromArray(clip.rotations, (frame * COUNT + bone) * 4);
    qb.fromArray(clip.rotations, (next * COUNT + bone) * 4);
    out.rotations[bone].slerpQuaternions(qa, qb, t);
  }
  for (let axis = 0; axis < 3; axis++)
    out.hips[axis] = lerp(clip.hips[frame * 3 + axis], clip.hips[next * 3 + axis], t);
  return out;
}

/** Recorded motion `id`'s pose `seconds` in: { rotations, hips, facing }. */
function recordedAt(id, seconds) {
  const { plays, length, spin, calm } = PLANS[id];
  const round = Math.floor(seconds / length);
  const at = seconds - round * length;
  let i = plays.length - 1;
  while (i > 0 && plays[i].start > at) i--;
  const play = plays[i];
  const into = at - play.start;
  const pose = sample(play.clip, into * play.speed, sampled[0]);
  if (into < play.fade) {
    // (Easing in from the clip before, which goes on meanwhile.)
    const before = plays.at(i - 1);
    const from = sample(before.clip, (before.length - play.fade + into) * before.speed, sampled[1]);
    const w = smooth(into / play.fade);
    for (let bone = 0; bone < COUNT; bone++)
      pose.rotations[bone].slerpQuaternions(from.rotations[bone], pose.rotations[bone], w);
    for (let axis = 0; axis < 3; axis++) pose.hips[axis] = lerp(from.hips[axis], pose.hips[axis], w);
  }
  if (calm) {
    const [clip, amount] = calm;
    const other = sample(CLIPS[clip], seconds % CLIPS[clip].duration, sampled[1]);
    for (let bone = 0; bone < COUNT; bone++) pose.rotations[bone].slerp(other.rotations[bone], amount);
    for (let axis = 0; axis < 3; axis++) pose.hips[axis] = lerp(pose.hips[axis], other.hips[axis], amount);
  }
  return { rotations: pose.rotations, hips: pose.hips, facing: spin ? (TAU * seconds) / spin : 0 };
}
const references = new WeakMap();
/**
 * Each humanoid bone's turn in this body's own T-pose, the pose the clips are measured from: the arms level
 * and the fingers straight along them (figure.js tPose), as the clips' own figure rests. (Measured from the
 * fingers' soft curl at rest, every clip curled them that much further, through the palm.)
 */
function referenceOf(figure) {
  let reference = references.get(figure);
  if (reference) return reference;
  tPose(figure);
  const n = figure.humanoid;
  reference = BONES.map((name) => n[name]?.getWorldQuaternion(new Quaternion()) ?? null);
  restPose(figure);
  references.set(figure, reference);
  return reference;
}

const worlds = new Map();
/** The figure in recorded motion `id` at `seconds`, from rest. */
function recordedPose(figure, id, seconds) {
  const rig = rigOf(figure);
  const reference = referenceOf(figure);
  const pose = recordedAt(id, seconds);
  restPose(figure);
  const n = figure.humanoid;
  // Each bone turned as far from its T-pose as the clip's was, in the world; its own turn is that against its
  // parent's (worked out here for a humanoid parent, as the parents come first).
  worlds.clear();
  BONES.forEach((name, i) => {
    const bone = n[name];
    if (!bone || !reference[i]) return;
    const world = pose.rotations[i].clone().multiply(reference[i]);
    const parent = worlds.get(bone.parent) ?? bone.parent.getWorldQuaternion(new Quaternion());
    bone.quaternion.copy(parent.clone().invert().multiply(world));
    worlds.set(bone, world);
  });
  figure.root.updateMatrixWorld(true);
  moveHips(rig, v1.set(pose.hips[0], pose.hips[1], pose.hips[2]).multiplyScalar(rig.leg));
  // The feet back on the floor: the lower of them where a foot rests, whatever the legs' proportions.
  let low = Infinity;
  for (const side of ["left", "right"]) {
    const leg = rig.legs[side];
    low = Math.min(low, leg.foot.getWorldPosition(v1).y - leg.ankle.y, leg.toes.getWorldPosition(v1).y - leg.toesAt.y);
  }
  if (Number.isFinite(low)) moveHips(rig, v1.set(0, -low, 0));
  turnInWorld(rig.hips, UP, pose.facing);
  figure.root.updateMatrixWorld(true);
}

// ── As in a chat ──
// What a saved avatar does in a chat. Marinara Engine's 3D Avatars agent plays no clip: it stands the avatar
// with its arms at its sides, and turns nine bones a little by a few sums of the time (the Engine's
// packages/client/src/features/avatars/renderers/vrm/vrm-motion.ts, computeBodyPose): breathing, a slow sway,
// and the head set for what the chat is doing. The same sums here, so the preview shows what a chat will.
// Every turn is from the T-pose, about the model's own axes (x to its left, y up, z the way it faces), in
// radians, each bone's on top of the one it hangs from. The fingers stay as the file rests them.

/** The chat's states: what the head does in each ({ tilt, nod, lean }), and whether it talks. */
const CHAT = {
  "chat-idle": { tilt: 0, nod: 0, lean: 0 },
  "chat-thinking": { tilt: 0.08, nod: -0.06, lean: 0 },
  "chat-listening": { tilt: -0.05, nod: 0.03, lean: 0.03 },
  "chat-talking": { tilt: 0, nod: 0, lean: 0, talks: true },
};
const CHAT_ARM_DOWN = 1.2;
const CHAT_ELBOW = 0.25;
const chatParents = new WeakMap();
const euler = new Euler();
const NO_TURN = new Quaternion();

/** The figure as a chat shows it in `state` (CHAT) at `seconds`, from rest. */
function chatPose(figure, state, seconds) {
  const reference = referenceOf(figure);
  const n = figure.humanoid;
  // (For each of BONES, the place in BONES of the humanoid bone it hangs from, or -1.)
  let parents = chatParents.get(figure);
  if (!parents) {
    const placeOf = new Map(BONES.map((name, i) => [n[name], i]));
    parents = BONES.map((name) => {
      for (let up = n[name]?.parent; up; up = up.parent) if (placeOf.has(up)) return placeOf.get(up);
      return -1;
    });
    chatParents.set(figure, parents);
  }
  const t = seconds * TAU;
  const breath = Math.sin(t / 4.2);
  // (Talking, the head nods a little with the voice: here with the preview's own talking mouth.)
  const nod = state.talks
    ? Object.values(talkingAt(seconds)).reduce((most, open) => Math.max(most, open), 0) * 0.04
    : state.nod;
  const turns = {
    hips: [0, Math.sin(t / 7.3) * 0.025, 0],
    spine: [breath * 0.012 + state.lean, 0, Math.sin(t / 5.9) * 0.012],
    chest: [breath * 0.015, 0, 0],
    neck: [nod * 0.4, Math.sin(t / 6.7) * 0.02, 0],
    head: [nod * 0.6 + Math.sin(t / 3.1) * 0.006, Math.sin(t / 8.3) * 0.03, state.tilt],
    leftUpperArm: [0, 0, -CHAT_ARM_DOWN + breath * 0.012],
    rightUpperArm: [0, 0, CHAT_ARM_DOWN - breath * 0.012],
    leftLowerArm: [0, -CHAT_ELBOW, 0],
    rightLowerArm: [0, CHAT_ELBOW, 0],
  };
  restPose(figure);
  worlds.clear();
  const turned = [];
  BONES.forEach((name, i) => {
    const bone = n[name];
    if (!bone || !reference[i]) return;
    const turn = (turned[parents[i]] ?? NO_TURN).clone();
    if (turns[name]) turn.multiply(q1.setFromEuler(euler.set(...turns[name])));
    turned[i] = turn;
    const world = turn.clone().multiply(reference[i]);
    const parent = worlds.get(bone.parent) ?? bone.parent.getWorldQuaternion(new Quaternion());
    bone.quaternion.copy(parent.clone().invert().multiply(world));
    worlds.set(bone, world);
  });
  figure.root.updateMatrixWorld(true);
}

// ── Putting a pose on the figure ──

const rigs = new WeakMap();
/** What the motions measure of a body, at rest: each leg's lengths, where its foot stands, and more. */
function rigOf(figure) {
  let rig = rigs.get(figure);
  if (rig) return rig;
  restPose(figure);
  const n = figure.humanoid;
  const at = (bone) => bone.getWorldPosition(new Vector3());
  const legs = {};
  for (const side of ["left", "right"]) {
    const [thigh, calf, foot, toes] = ["UpperLeg", "LowerLeg", "Foot", "Toes"].map((part) => n[`${side}${part}`]);
    const [hip, knee, ankle] = [thigh, calf, foot].map(at);
    const line = ankle.clone().sub(hip).normalize();
    // (Which way the knee points at rest, square to the leg: the knee bends that way.)
    const pole = knee.clone().sub(hip).projectOnPlane(line);
    if (pole.lengthSq() < 1e-8 || pole.z < 0) pole.copy(FORWARD);
    legs[side] = {
      thigh,
      calf,
      foot,
      toes: toes ?? foot,
      toesAt: at(toes ?? foot), // (where the ball of the foot rests)
      upper: hip.distanceTo(knee),
      lower: knee.distanceTo(ankle),
      ankle,
      ball: toes ? at(toes).sub(ankle) : new Vector3(0, -0.05, 0.1), // (the ball of the foot, from the ankle)
      turn: foot.getWorldQuaternion(new Quaternion()),
      pole: pole.normalize(),
    };
  }
  const arms = {};
  for (const side of ["left", "right"]) {
    const upper = n[`${side}UpperArm`];
    // (The arm's front, in its own space: the elbow bends towards it. At rest the arm hangs out with it forward.)
    const front = FORWARD.clone().applyQuaternion(upper.getWorldQuaternion(new Quaternion()).invert());
    arms[side] = { upper, lower: n[`${side}LowerArm`], hand: n[`${side}Hand`], shoulder: n[`${side}Shoulder`], front };
  }
  const leg = (legs.left.upper + legs.left.lower + legs.right.upper + legs.right.lower) / 2;
  rig = { legs, arms, leg, hips: n.hips };
  rigs.set(figure, rig);
  return rig;
}

const v1 = new Vector3();
const v2 = new Vector3();
const v3 = new Vector3();
const knee = new Vector3();
const goal = new Vector3();
const q1 = new Quaternion();
const q2 = new Quaternion();

/** Turns `bone` by `pitch`, `yaw` and `lean` about the world's axes (as this file names them). */
function tilt(bone, { pitch = 0, yaw = 0, lean = 0 }, share = 1) {
  turnInWorld(bone, SIDE, pitch * share);
  turnInWorld(bone, UP, yaw * share);
  turnInWorld(bone, FORWARD, -lean * share);
}

/** One arm to `spec` ({ dir, fore, roll }: where the upper arm and forearm point, and the palm's turn). */
function poseArm(arm, spec, sign, sway) {
  const dir = v1.set(spec.dir[0] * sign, spec.dir[1], spec.dir[2]).normalize();
  const fore = v2.set(spec.fore[0] * sign, spec.fore[1], spec.fore[2]).normalize();
  if (sway) {
    dir.applyAxisAngle(FORWARD, -sway);
    fore.applyAxisAngle(FORWARD, -sway);
  }
  // The shoulder rises a little as the arm goes above level.
  turnInWorld(arm.shoulder, FORWARD, sign * Math.max(0, dir.y) * 0.3);
  aimBone(arm.upper, arm.lower, dir);
  // The upper arm turned about itself so its front faces the way the forearm bends: an elbow bends one way.
  const bend = dir.angleTo(fore);
  const weight = smooth((bend - 0.12) / 0.3);
  if (weight > 0) {
    const front = v3.copy(arm.front).applyQuaternion(arm.upper.getWorldQuaternion(q1)).projectOnPlane(dir);
    const want = goal.copy(fore).projectOnPlane(dir);
    if (front.lengthSq() > 1e-8 && want.lengthSq() > 1e-8) {
      front.normalize();
      want.normalize();
      const twist = Math.atan2(front.clone().cross(want).dot(dir), front.dot(want));
      turnInWorld(arm.upper, dir, clamp(twist, -1.9, 1.9) * weight);
    }
  }
  aimBone(arm.lower, arm.hand, fore);
  // (Roll: the forearm turned about itself, the palm towards up for more than 0.)
  if (spec.roll) turnInWorld(arm.lower, fore, -sign * spec.roll);
}

/** The hips moved by `by` (metres, in the world) from where the pose put them. */
function moveHips(rig, by) {
  const { hips } = rig;
  const at = hips.getWorldPosition(new Vector3()).add(by);
  hips.position.copy(hips.parent.worldToLocal(at));
  hips.updateMatrixWorld(true);
}

/** One leg reaching its ankle to `ankle`, its knee towards `pole`, its foot turned to `turn` (in the world). */
function poseLeg(leg, ankle, turn, pole) {
  const hip = leg.thigh.getWorldPosition(v1);
  const reach = leg.upper + leg.lower;
  const to = v2.copy(ankle).sub(hip);
  const length = clamp(to.length(), reach * 0.25, reach * 0.9995);
  to.normalize();
  const along = (leg.upper ** 2 - leg.lower ** 2 + length ** 2) / (2 * length);
  const out = Math.sqrt(Math.max(0, leg.upper ** 2 - along ** 2));
  const bendTo = v3.copy(pole).projectOnPlane(to).normalize();
  knee.copy(hip).addScaledVector(to, along).addScaledVector(bendTo, out);
  goal.copy(knee).sub(hip).normalize();
  aimBone(leg.thigh, leg.calf, goal);
  goal.copy(hip).addScaledVector(to, length).sub(knee).normalize();
  aimBone(leg.calf, leg.foot, goal);
  leg.foot.parent.getWorldQuaternion(q2).invert();
  leg.foot.quaternion.copy(q2.multiply(turn));
  leg.foot.updateMatrixWorld(true);
}

/** The figure in motion `id` at `seconds` from its start, from rest. Returns false for an unknown motion. */
export function motionPose(figure, id, seconds) {
  if (!figure?.humanoid?.hips) return false;
  if (CHAT[id]) {
    chatPose(figure, CHAT[id], Math.max(0, seconds));
    return true;
  }
  if (RECORDED[id]) {
    recordedPose(figure, id, seconds);
    return true;
  }
  const make = POSES[id];
  if (!make) return false;
  const rig = rigOf(figure);
  const pose = make(Math.max(0, seconds));
  restPose(figure);
  const { leg } = rig;
  moveHips(rig, v1.set(pose.hips.x * leg, pose.hips.y * leg, pose.hips.z * leg));
  tilt(rig.hips, pose.hips);
  const n = figure.humanoid;
  for (const bone of [n.spine, n.chest, n.upperChest]) tilt(bone, pose.spine, 1 / 3);
  tilt(n.neck, pose.head, 0.4);
  tilt(n.head, pose.head, 0.6);
  for (const [side, sign] of [
    ["left", 1],
    ["right", -1],
  ])
    poseArm(rig.arms[side], pose[side], sign, pose.armsSway);
  // Each foot's ankle: where it rests, moved as the pose says, and raised as the heel lifts so the ball of
  // the foot stays down.
  const ankles = {};
  for (const [side, sign] of [
    ["left", 1],
    ["right", -1],
  ]) {
    const { x, y, z, pitch } = pose.feet[side];
    const one = rig.legs[side];
    const lifted = one.ball.clone().applyAxisAngle(SIDE, Math.max(0, pitch));
    ankles[side] = one.ankle
      .clone()
      .add(v2.set(x * sign * leg, y * leg, z * leg))
      .add(v3.set(0, one.ball.y - lifted.y, one.ball.z - lifted.z));
  }
  // The hips down as far as they must be for each foot to reach where it stands (a leg can't stretch).
  let lower = 0;
  for (const side of ["left", "right"]) {
    const one = rig.legs[side];
    const hip = one.thigh.getWorldPosition(v1);
    const reach = (one.upper + one.lower) * 0.998;
    const across = Math.hypot(ankles[side].x - hip.x, ankles[side].z - hip.z);
    const high = hip.y - ankles[side].y - Math.sqrt(Math.max(0, reach ** 2 - across ** 2));
    lower = Math.max(lower, high);
  }
  if (lower > 0) moveHips(rig, v1.set(0, -lower, 0));
  for (const [side, sign] of [
    ["left", 1],
    ["right", -1],
  ]) {
    const one = rig.legs[side];
    const pole = v1
      .copy(one.pole)
      .addScaledVector(SIDE, sign * pose.kneesOut)
      .normalize();
    // (The foot as it rests, flat on the floor, then lifted at the heel by its pitch.)
    const turn = new Quaternion().setFromAxisAngle(SIDE, pose.feet[side].pitch).multiply(one.turn);
    poseLeg(one, ankles[side], turn, pole.clone());
  }
  // A turn on the spot: the whole figure, on its hips.
  turnInWorld(rig.hips, UP, pose.facing);
  figure.root.updateMatrixWorld(true);
  return true;
}

const BLEND = 0.45; // seconds to ease from one pose into the next
const SIDES = ["left", "right"];
/** Where a foot stands and how it's turned, in the world: [place, turn]. */
const footOf = (figure, side) => {
  const foot = figure.humanoid[`${side}Foot`];
  return [foot.getWorldPosition(new Vector3()), foot.getWorldQuaternion(new Quaternion())];
};

/**
 * The preview's player: { play(figure, id), stop(figure), pause(paused), adopt(figure), step(figure, seconds,
 * base), face(mode, seconds), playing, active, paused }. Starting, changing or stopping a motion eases from
 * the pose the figure was in over a moment, so nothing jumps and the hair doesn't whip. `step` poses the
 * figure for the frame and returns true while a motion plays or eases out (into `base`, the stage's own
 * pose); otherwise it leaves the figure alone and returns false.
 */
export function createMotionPlayer() {
  let id = null;
  let clock = 0;
  let paused = false;
  let from = null; // (each bone's turn and place when the blend began)
  let feet = null; // (and where each foot stood, in the world)
  let blend = 1;

  function remember(figure) {
    if (!figure) return;
    from = new Map([...figure.bones.values()].map((bone) => [bone, [bone.quaternion.clone(), bone.position.clone()]]));
    feet = SIDES.map((side) => footOf(figure, side));
    if (!rigs.has(figure) && figure.humanoid?.hips) {
      rigOf(figure); // (measured at rest, then the pose put back)
      for (const [bone, [turn, place]] of from) {
        bone.quaternion.copy(turn);
        bone.position.copy(place);
      }
      figure.root.updateMatrixWorld(true);
    }
    blend = 0;
  }

  return {
    get playing() {
      return id !== null;
    },
    get active() {
      return id !== null || blend < 1;
    },
    get paused() {
      return paused;
    },
    play(figure, next) {
      if (!POSES[next] && !RECORDED[next] && !CHAT[next]) return this.stop(figure);
      remember(figure);
      id = next;
      clock = 0;
      paused = false;
    },
    stop(figure) {
      if (id === null) return;
      remember(figure);
      id = null;
      paused = false;
    },
    pause(next) {
      paused = Boolean(next);
    },
    /** A new figure (the look changed): posed at once in the motion playing, with nothing to ease from. */
    adopt(figure) {
      from = null;
      blend = 1;
      return id !== null && motionPose(figure, id, clock);
    },
    step(figure, seconds, base) {
      if (!figure) return false;
      const dt = Math.min(0.1, Math.max(0, seconds));
      if (id !== null && !paused) clock += dt;
      if (id === null && blend >= 1) return false;
      if (id !== null) motionPose(figure, id, clock);
      else base?.();
      if (from && blend < 1) {
        blend = Math.min(1, blend + dt / BLEND);
        const w = smooth(blend);
        if (w < 1) {
          const to = SIDES.map((side) => footOf(figure, side));
          for (const [bone, [turn, place]] of from) {
            q1.copy(bone.quaternion);
            bone.quaternion.copy(turn).slerp(q1, w);
            bone.position.lerpVectors(place, v1.copy(bone.position), w);
          }
          figure.root.updateMatrixWorld(true);
          // Turns eased one by one would let a foot on the floor slide into it or lift off: each foot goes
          // from where it stood to where it's going, and its leg reaches it.
          const rig = rigs.get(figure);
          if (rig && feet)
            SIDES.forEach((side, i) => {
              const leg = rig.legs[side];
              const ankle = feet[i][0].clone().lerp(to[i][0], w);
              const hip = leg.thigh.getWorldPosition(new Vector3());
              const pole = leg.calf
                .getWorldPosition(new Vector3())
                .sub(hip)
                .projectOnPlane(ankle.clone().sub(hip).normalize());
              poseLeg(
                leg,
                ankle,
                feet[i][1].clone().slerp(to[i][1], w),
                pole.lengthSq() > 1e-10 ? pole.normalize() : FORWARD,
              );
            });
          figure.root.updateMatrixWorld(true);
        }
      }
      if (blend >= 1) from = null;
      return true;
    },
    /** The face's mode and time: a motion's own face while the Face list is on Lively and it plays. */
    face(mode, seconds) {
      const own = id !== null && !paused && mode === "lively" ? MOTION_FACES[id] : null;
      return own ? [own, clock] : [mode, seconds];
    },
  };
}
