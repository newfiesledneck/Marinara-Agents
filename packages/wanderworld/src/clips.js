// Recorded motion: animations from Quaternius's Universal Animation Library and Universal Animation
// Library 2 (CC0, public domain), converted by scripts/build-wanderworld-clips.mjs into clips/ual.json. Settings → Animation switches
// between these and the hand-made motion (motion.js), which stays the fallback; to drop the recorded
// clips entirely, delete clips/ and this file and the import in character.js.
//
// Each clip frame holds every humanoid bone's turn away from the T-pose in model space. A body plays
// them on its own normalized humanoid bones: a bone's local turn is its delta relative to its nearest
// present parent's, so rigs without optional bones (upper chest, shoulders, fingers) still play right.
// Walking and running blend between the walk, jog and sprint clips by speed, with their steps in step,
// and play at the rate that matches the ground actually covered, so feet don't skate.
//
// Standing still, a body can be doing something (`act`: ACTS below): working at an anvil, a field or a
// stall, kneeling at a flower bed, sitting or lying on the ground. It can make a gesture once (`gesture`:
// reaching for something, picking it up), and be in the air (`air`: a jump, then its landing).
import { Euler, Quaternion, Vector3 } from "three";
import data from "./clips/ual.json" with { type: "json" };

const PARENT = {
  hips: null,
  spine: "hips",
  chest: "spine",
  upperChest: "chest",
  neck: "upperChest",
  head: "neck",
  leftUpperLeg: "hips",
  leftLowerLeg: "leftUpperLeg",
  leftFoot: "leftLowerLeg",
  leftToes: "leftFoot",
  rightUpperLeg: "hips",
  rightLowerLeg: "rightUpperLeg",
  rightFoot: "rightLowerLeg",
  rightToes: "rightFoot",
};
for (const side of ["left", "right"]) {
  PARENT[`${side}Shoulder`] = "upperChest";
  PARENT[`${side}UpperArm`] = `${side}Shoulder`;
  PARENT[`${side}LowerArm`] = `${side}UpperArm`;
  PARENT[`${side}Hand`] = `${side}LowerArm`;
  for (const finger of ["Index", "Middle", "Ring", "Little"]) {
    PARENT[`${side}${finger}Proximal`] = `${side}Hand`;
    PARENT[`${side}${finger}Intermediate`] = `${side}${finger}Proximal`;
    PARENT[`${side}${finger}Distal`] = `${side}${finger}Intermediate`;
  }
  PARENT[`${side}ThumbMetacarpal`] = `${side}Hand`;
  PARENT[`${side}ThumbProximal`] = `${side}ThumbMetacarpal`;
  PARENT[`${side}ThumbDistal`] = `${side}ThumbProximal`;
}

/**
 * What a body can be doing on the spot: the clips it goes through, over and over, each [clip, times
 * through]. "ground" (sitting on the ground) and "lie" (lying down) are poses held, handled apart.
 */
const ACTS = {
  hammer: [
    ["chop", 5],
    ["idle", 1],
  ],
  craft: [
    ["interact", 1],
    ["idle", 1],
    ["pickUp", 1],
    ["idle", 1],
  ],
  farm: [
    ["harvest", 2],
    ["idle", 1],
    ["plant", 1],
    ["water", 1],
    ["idle", 1],
  ],
  tend: [
    ["kneel", 1],
    ["idle", 1],
  ],
  vend: [
    ["foldArms", 3],
    ["idle", 1],
  ],
  browse: [
    ["idle", 1],
    ["pickUp", 1],
    ["idle", 2],
    ["interact", 1],
  ],
  lean: [["lean", 1]],
  dance: [["dance", 1]],
  drink: [
    ["drink", 1],
    ["idle", 2],
  ],
  ground: [],
  lie: [],
  ride: [], // astride a horse: a pose held, like sitting on the ground
};
/** Every act there is, for whoever chooses one. */
export const ACT_NAMES = Object.keys(ACTS);
/** Seconds it takes to lie down, and to get up again (callers keep a body still that long). */
export const LIE_SECONDS = 1.55;
/** Gestures made once, over whatever else the body is doing. */
const GESTURES = new Set(["interact", "pickUp", "drink"]);
/** Sitting on the ground: how far the hips come down (leg lengths), and how the legs fold (radians
 *  from hanging straight down: thighs past level, knees up; shins sloping down to the feet). */
const GROUND_HIPS = -0.83;
const GROUND_LEGS = { UpperLeg: -1.95, LowerLeg: -0.85, Foot: -0.25, Toes: -0.25 };
const GROUND_SPLAY = 0.16; // each knee turned out this much
/** Astride a mount: the hips' drop (leg lengths), and each leg bone's lean forward (or back) and out to
 *  the side (radians from hanging straight down): knees wide round the animal's barrel, ankles back in. */
const RIDE_HIPS = -0.5;
const RIDE_LEGS = { UpperLeg: [-0.72, 0.78], LowerLeg: [0.28, -0.06], Foot: [-0.1, 0.05], Toes: [-0.1, 0.05] };
/** And the arms: which way each bone points for the left arm (out to +x at rest), the right's mirrored:
 *  down and forward from the shoulder, then forward, in and down toward the mane, as if on the reins. */
const RIDE_ARMS = { UpperArm: [0.2, -0.84, 0.5], LowerArm: [-0.28, -0.5, 0.82], Hand: [-0.28, -0.5, 0.82] };
/** Seconds of the landing clip that are the landing itself (the rest is standing back up, slowly). */
const LANDING = 0.55;

/** Leg lengths the swimming stroke is raised by, so the swimmer's back breaks the surface. */
const SWIM_LIFT = 0.1;

/** Running clips whose up-and-down is calmed, and by how much. */
const CALMER = new Set(["jog", "sprint"]);
const CALM = 0.6;
const BONES = data.bones;
const COUNT = BONES.length;
/** The clips, unpacked once: quaternions as x, y, z, w per bone per frame. */
const CLIPS = Object.fromEntries(
  Object.entries(data.clips).map(([name, clip]) => {
    const rotations = new Float32Array(clip.frames * COUNT * 4);
    for (let i = 0; i < clip.frames * COUNT; i++) {
      const x = clip.rotations[i * 3];
      const y = clip.rotations[i * 3 + 1];
      const z = clip.rotations[i * 3 + 2];
      rotations.set([x, y, z, Math.sqrt(Math.max(0, 1 - x * x - y * y - z * z))], i * 4);
    }
    // Running clips bounce a lot: their hips rise CALM times the recorded height.
    const hips = Float32Array.from(clip.hips);
    if (CALMER.has(name)) {
      // Measured from the lowest point (a foot landing), so landings still meet the ground and only the
      // time in the air is lower.
      let low = Infinity;
      for (let i = 1; i < hips.length; i += 3) low = Math.min(low, hips[i]);
      for (let i = 1; i < hips.length; i += 3) hips[i] = low + (hips[i] - low) * CALM;
    }
    return [name, { ...clip, rotations, hips }];
  }),
);

const smoothstep = (from, to, value) => {
  const t = Math.min(1, Math.max(0, (value - from) / (to - from)));
  return t * t * (3 - 2 * t);
};
const ease = (current, target, dt, seconds) => current + (target - current) * (1 - Math.exp(-dt / seconds));

const scratchA = new Quaternion();
const scratchB = new Quaternion();
const local = new Quaternion();
const warped = new Quaternion();
const change = new Quaternion();
const euler = new Euler();
const offsetScratch = new Vector3();
/** The walk's stride can be lengthened by up to this much before speeding it up does the rest. */
const MAX_STRIDE = 1.1;
/** Walking turns into running between these speeds (metres per second). */
const RUN_FROM = 2.8;
const RUN_TO = 3.8;

/** Every bone's model-space turn and the hips' offset at `t` (0…1 through the clip), into `out`. */
function sample(clip, t, out) {
  const position = Math.min(0.999999, Math.max(0, t)) * (clip.frames - 1);
  const frame = Math.floor(position);
  const mix = position - frame;
  const next = Math.min(clip.frames - 1, frame + 1);
  for (let bone = 0; bone < COUNT; bone++) {
    const a = (frame * COUNT + bone) * 4;
    const b = (next * COUNT + bone) * 4;
    scratchA.fromArray(clip.rotations, a);
    scratchB.fromArray(clip.rotations, b);
    out.rotations[bone].slerpQuaternions(scratchA, scratchB, mix);
  }
  for (let axis = 0; axis < 3; axis++) {
    out.hips[axis] = clip.hips[frame * 3 + axis] * (1 - mix) + clip.hips[next * 3 + axis] * mix;
  }
  return out;
}

const makePose = () => ({ rotations: BONES.map(() => new Quaternion()), hips: [0, 0, 0] });

/** Copies pose `from` into `to`. */
function copyPose(to, from) {
  for (let bone = 0; bone < COUNT; bone++) to.rotations[bone].copy(from.rotations[bone]);
  for (let axis = 0; axis < 3; axis++) to.hips[axis] = from.hips[axis];
  return to;
}

/** Blends `from` towards `to` by `amount` (0 keeps `from`), in place. */
function blend(from, to, amount) {
  if (amount <= 0) return from;
  for (let bone = 0; bone < COUNT; bone++) from.rotations[bone].slerp(to.rotations[bone], Math.min(1, amount));
  for (let axis = 0; axis < 3; axis++) from.hips[axis] += (to.hips[axis] - from.hips[axis]) * Math.min(1, amount);
  return from;
}

/**
 * A recorded-motion player for one body. `present(name)` says whether the rig has that humanoid bone;
 * `offset(name)` is that bone's rest offset from its humanoid parent in metres (a Vector3), and
 * `legLength` the body's hip-to-ankle length in metres.
 *
 * Speeds are measured on the body itself when it's made: where its own feet go through each clip, worked
 * out from its own bone lengths, gives how fast a planted foot slides back at normal playback. Playing at
 * real speed ÷ that keeps its feet planted, whatever its proportions.
 *
 * `step(dt, speed, { sit, talk, swim, act, gesture, air })` returns { locals: Map(bone → local
 * Quaternion), hips: [x, y, z] in metres, footstep: "left" | "right" | null, running }. `act` is one
 * of ACT_NAMES (or nothing); `gesture` a gesture to make once, given on the frame it starts; `air`
 * true while the body is off the ground.
 */
export function createClipPlayer({ present, offset, legLength }) {
  const parentOf = {};
  for (const bone of BONES) {
    let parent = PARENT[bone];
    while (parent && !present(parent)) parent = PARENT[parent];
    parentOf[bone] = parent;
  }
  const index = Object.fromEntries(BONES.map((bone, i) => [bone, i]));
  const used = BONES.filter((bone) => present(bone));
  const poses = {
    a: makePose(),
    b: makePose(),
    c: makePose(),
    out: makePose(),
    act: makePose(),
    last: makePose(), // the act's pose as it was when its clip last changed, to ease from
  };
  // Sitting on the ground: the legs' turns, the same every frame.
  const groundLegs = [];
  for (const [side, sign] of [
    ["left", 1],
    ["right", -1],
  ]) {
    for (const [part, angle] of Object.entries(GROUND_LEGS)) {
      const at = BONES.indexOf(`${side}${part}`);
      if (at < 0) continue;
      groundLegs.push([at, new Quaternion().setFromEuler(new Euler(angle, sign * GROUND_SPLAY, 0, "YXZ"))]);
    }
  }
  const legChain = (side) => [`${side}UpperLeg`, `${side}LowerLeg`, `${side}Foot`].filter((bone) => present(bone));

  /** Where an ankle is in the body's space for a pose: hips, then down the leg (each bone's turn is in
   *  model space, so its rest offset just turns with its parent's turn). */
  function ankle(pose, side, out) {
    out.set(pose.hips[0] * legLength, pose.hips[1] * legLength, pose.hips[2] * legLength);
    let parent = "hips";
    for (const bone of legChain(side)) {
      out.add(offsetScratch.copy(offset(bone)).applyQuaternion(pose.rotations[index[parent]]));
      parent = bone;
    }
    return out;
  }

  /** How fast this body's planted foot slides back in `name` at normal playback (metres per second). */
  function footSpeed(name, stride = 1) {
    const clip = CLIPS[name];
    const samples = 60;
    const feet = [];
    for (let i = 0; i <= samples; i++) {
      const pose = sample(clip, i / samples, poses.a);
      if (name === "walk") lengthenStride(pose, stride);
      feet.push([ankle(pose, "left", new Vector3()), ankle(pose, "right", new Vector3())]);
    }
    const lowest = Math.min(...feet.flat().map((foot) => foot.y));
    let sum = 0;
    let count = 0;
    for (let i = 1; i <= samples; i++) {
      for (const side of [0, 1]) {
        if (feet[i][side].y > lowest + 0.02 || feet[i - 1][side].y > lowest + 0.02) continue;
        sum += -(feet[i][side].z - feet[i - 1][side].z) / (clip.duration / samples);
        count++;
      }
    }
    // A clip with no planted foot found falls back to its measured speed on the pack's model.
    return count >= 3 && sum > 0 ? sum / count : clip.speed * legLength;
  }
  const locals = new Map(used.map((bone) => [bone, new Quaternion()]));
  // Astride: the legs' and arms' turns, the same every frame.
  const rideLimbs = [];
  for (const [side, sign] of [
    ["left", 1],
    ["right", -1],
  ]) {
    for (const [part, [forward, out]] of Object.entries(RIDE_LEGS)) {
      const at = BONES.indexOf(`${side}${part}`);
      if (at < 0) continue;
      // Leaning forward first, then out to its own side.
      const lean = new Quaternion().setFromEuler(new Euler(forward, 0, 0));
      rideLimbs.push([at, new Quaternion().setFromEuler(new Euler(0, 0, sign * out)).multiply(lean)]);
    }
    for (const [part, [x, y, z]] of Object.entries(RIDE_ARMS)) {
      const at = BONES.indexOf(`${side}${part}`);
      if (at < 0) continue;
      const turn = new Quaternion().setFromUnitVectors(
        new Vector3(sign, 0, 0),
        new Vector3(sign * x, y, z).normalize(),
      );
      rideLimbs.push([at, turn]);
    }
  }
  let pace = 0;
  let phase = Math.random();
  let idleTime = Math.random() * 10;
  let talking = 0;
  let moving = 0;
  // Sitting: "none" → "down" (sitting down) → "seated" → "up" (standing up) → "none".
  let seat = "none";
  let seatTime = 0;
  let swimming = 0;
  let stroke = 0; // through the swimming stroke, 0…1
  // Doing something on the spot: the act, how far it has faded in, which of its clips and how far into it.
  let act = null;
  let acting = 0;
  let actPart = 0;
  let actTime = 0;
  let actClip = null;
  let actEase = 1; // 0…1 from the last clip's pose into this one's
  // Lying down: "none" → "down" (lying down) → "lying" → "up" (getting up) → "none".
  let lying = "none";
  let lieTime = 0;
  let gesture = null;
  let gestureTime = 0;
  let airborne = 0;
  let wasInAir = false;
  let landing = Infinity; // seconds since coming down

  /** The pose of `name` (an act but "lie") after another `dt`, into poses.act. */
  function actPose(name, dt, talkAmount) {
    const pose = poses.act;
    actClip = null; // (only an act of clips has one: not riding, sitting on the ground or lying down)
    if (name === "ride") {
      // The seated body's back and head, with the legs down either side and the hands forward.
      sample(CLIPS.sit, (idleTime / CLIPS.sit.duration) % 1, pose);
      for (const [at, turn] of rideLimbs) pose.rotations[at].copy(turn);
      pose.hips[0] = 0;
      pose.hips[1] = RIDE_HIPS;
      pose.hips[2] = 0;
      return pose;
    }
    if (name === "ground") {
      sample(CLIPS.sit, (idleTime / CLIPS.sit.duration) % 1, pose);
      if (talkAmount > 0.01)
        blend(pose, sample(CLIPS.sitTalk, (idleTime / CLIPS.sitTalk.duration) % 1, poses.a), talkAmount);
      for (const [at, turn] of groundLegs) pose.rotations[at].copy(turn);
      pose.hips[0] = 0;
      pose.hips[1] = GROUND_HIPS;
      pose.hips[2] = 0;
      return pose;
    }
    const parts = ACTS[name];
    let [clipName, times] = parts[actPart % parts.length];
    actTime += dt;
    if (actTime >= CLIPS[clipName].duration * times) {
      // On to its next clip, easing from where this one left the body.
      copyPose(poses.last, pose);
      actEase = parts.length > 1 ? 0 : 1;
      actPart = (actPart + 1) % parts.length;
      actTime = 0;
      [clipName] = parts[actPart];
    }
    const clip = CLIPS[clipName];
    actClip = clipName;
    sample(clip, (actTime / clip.duration) % 1, pose);
    if (actEase < 1) {
      actEase = Math.min(1, actEase + dt / 0.3);
      blend(copyPose(poses.b, poses.last), pose, smoothstep(0, 1, actEase));
      copyPose(pose, poses.b);
    }
    return pose;
  }

  /**
   * How to play walking and running at a pace: the walk clip is a slow stroll, so a faster walk both
   * lengthens its stride (a little: more lifts the knees like marching) and speeds it up; running blends the jog towards the sprint.
   * Returns `run` (0 walking … 1 running), `stride` (the walk's stride factor), `fast` (jog … sprint)
   * and `cycles`, how many cycles a second to play so the feet match the ground.
   */
  function gaits(atPace) {
    const stride = Math.min(MAX_STRIDE, Math.max(1, (atPace / walkSpeed) ** 0.35));
    const walkAt = walkSpeed + ((walkSpeedLong - walkSpeed) * (stride - 1)) / (MAX_STRIDE - 1);
    const run = smoothstep(RUN_FROM, RUN_TO, atPace);
    const fast = smoothstep(jogSpeed * 1.1, sprintSpeed, atPace);
    const walkCycles = atPace / walkAt / CLIPS.walk.duration;
    const runCycles =
      (atPace / jogSpeed / CLIPS.jog.duration) * (1 - fast) + (atPace / sprintSpeed / CLIPS.sprint.duration) * fast;
    return { run, stride, fast, cycles: walkCycles * (1 - run) + runCycles * run };
  }

  /** Swings the thighs `factor` times further forward and back (feet and shins follow), in place. */
  function lengthenStride(pose, factor) {
    if (factor <= 1.001) return pose;
    const hipsTurn = pose.rotations[index.hips];
    for (const side of ["left", "right"]) {
      const thigh = pose.rotations[index[`${side}UpperLeg`]];
      local.copy(hipsTurn).invert().multiply(thigh);
      euler.setFromQuaternion(local, "YXZ");
      euler.x *= factor;
      warped.copy(hipsTurn).multiply(local.setFromEuler(euler));
      // Below the thigh, everything turns with it: child' = thigh' × thigh⁻¹ × child.
      change.copy(warped).multiply(thigh.clone().invert());
      for (const below of ["LowerLeg", "Foot", "Toes"]) {
        const i = index[`${side}${below}`];
        if (i !== undefined) pose.rotations[i].premultiply(change);
      }
      thigh.copy(warped);
    }
    // Wider legs reach less far down: lower the hips a little so the feet still meet the ground.
    pose.hips[1] -= (factor - 1) * 0.06;
    return pose;
  }

  const walkSpeed = footSpeed("walk");
  const walkSpeedLong = footSpeed("walk", MAX_STRIDE);
  const jogSpeed = footSpeed("jog");
  const sprintSpeed = Math.max(jogSpeed * 1.2, footSpeed("sprint"));

  const swimSpeed = Math.max(0.3, CLIPS.swim.speed * legLength);

  return function step(
    dt,
    speed,
    { sit = false, talk = false, swim = false, act: wanted = null, gesture: made = null, air = false } = {},
  ) {
    dt = Math.min(0.1, Math.max(0, Number.isFinite(dt) ? dt : 0));
    speed = Math.max(0, Number.isFinite(speed) ? speed : 0);
    pace = ease(pace, speed, dt, 0.12);
    moving = ease(moving, smoothstep(0.08, 0.6, speed), dt, 0.15);
    talking = ease(talking, talk ? 1 : 0, dt, 0.3);
    idleTime += dt;

    // Standing: idle, or the talking idle while speaking.
    const out = poses.out;
    sample(CLIPS.idle, (idleTime / CLIPS.idle.duration) % 1, out);
    if (talking > 0.01) blend(out, sample(CLIPS.talk, (idleTime / CLIPS.talk.duration) % 1, poses.a), talking);

    // Doing something on the spot. One act fades out before another fades in.
    const want = wanted && ACTS[wanted] && !sit && !swim ? wanted : null;
    if (want === "lie" && (lying === "none" || lying === "up")) {
      lying = "down";
      lieTime = 0;
    } else if (want !== "lie" && (lying === "down" || lying === "lying")) {
      lying = "up";
      lieTime = 0;
    }
    const standing = want === "lie" ? null : want;
    if (act !== standing && acting < 0.02) {
      act = standing;
      actPart = 0;
      actTime = 0;
      actEase = 1;
    }
    acting = ease(acting, act && act === standing ? 1 : 0, dt, act === "ground" || act === "ride" ? 0.22 : 0.14);
    if (act && acting > 0.01) blend(out, actPose(act, dt, talking), acting * (1 - moving));

    // Moving: walk, jog and sprint in step with each other, at the rate that matches the ground.
    const before = phase;
    if (moving > 0.01 && seat === "none") {
      const { run, stride, fast, cycles } = gaits(Math.max(pace, 0.2));
      phase = (phase + dt * cycles) % 1;
      const gait = poses.b;
      lengthenStride(sample(CLIPS.walk, phase, gait), stride);
      if (run > 0.001) {
        const running = sample(CLIPS.jog, phase, poses.c);
        if (fast > 0.001) blend(running, sample(CLIPS.sprint, phase, poses.a), fast);
        blend(gait, running, run);
      }
      blend(out, gait, moving);
    }

    // Sitting down, seated (talking or not), standing up.
    if (sit && (seat === "none" || seat === "up")) {
      seat = "down";
      seatTime = 0;
    } else if (!sit && (seat === "down" || seat === "seated")) {
      seat = "up";
      seatTime = 0;
    }
    seatTime += dt;
    if (seat === "down" && seatTime >= CLIPS.sitDown.duration) seat = "seated";
    if (seat === "up" && seatTime >= CLIPS.standUp.duration) seat = "none";
    if (seat !== "none") {
      const seated = poses.c;
      if (seat === "down") sample(CLIPS.sitDown, seatTime / CLIPS.sitDown.duration, seated);
      else if (seat === "up") sample(CLIPS.standUp, seatTime / CLIPS.standUp.duration, seated);
      else {
        sample(CLIPS.sit, (idleTime / CLIPS.sit.duration) % 1, seated);
        if (talking > 0.01)
          blend(seated, sample(CLIPS.sitTalk, (idleTime / CLIPS.sitTalk.duration) % 1, poses.a), talking);
      }
      // The game puts the body on the seat itself; only the clip's lowering of the hips is kept.
      seated.hips[0] = 0;
      seated.hips[2] = 0;
      // Fade in at the start of sitting down and out at the end of standing up.
      const amount =
        seat === "down"
          ? smoothstep(0, 0.25, seatTime)
          : seat === "up"
            ? 1 - smoothstep(CLIPS.standUp.duration - 0.25, CLIPS.standUp.duration, seatTime)
            : 1;
      blend(out, seated, amount);
    }

    // Lying down, lying there, getting up: the getting-up clip, played backwards to lie down.
    if (lying !== "none") {
      lieTime += dt;
      const clip = CLIPS.getUp;
      if (lying === "down" && lieTime >= clip.duration) lying = "lying";
      if (lying === "up" && lieTime >= clip.duration) lying = "none";
      if (lying !== "none") {
        const through = lying === "down" ? 1 - lieTime / clip.duration : lying === "up" ? lieTime / clip.duration : 0;
        const down = sample(clip, through, poses.c);
        const amount =
          lying === "down"
            ? smoothstep(0, 0.2, lieTime)
            : lying === "up"
              ? 1 - smoothstep(clip.duration - 0.2, clip.duration, lieTime)
              : 1;
        blend(out, down, amount);
      }
    }

    // A gesture made once (reaching out, picking something up), standing.
    if (made && GESTURES.has(made) && !gesture) {
      gesture = made;
      gestureTime = 0;
    }
    if (gesture) {
      const clip = CLIPS[gesture];
      gestureTime += dt;
      if (gestureTime >= clip.duration) gesture = null;
      else {
        const amount = Math.min(
          smoothstep(0, 0.15, gestureTime),
          1 - smoothstep(clip.duration - 0.25, clip.duration, gestureTime),
        );
        blend(
          out,
          sample(clip, gestureTime / clip.duration, poses.c),
          amount * (1 - moving) * (seat === "none" ? 1 : 0),
        );
      }
    }

    // In the air (a jump), and the landing after it.
    airborne = ease(airborne, air ? 1 : 0, dt, 0.07);
    if (wasInAir && !air) landing = 0;
    wasInAir = air;
    landing += dt;
    if (landing < LANDING)
      blend(
        out,
        sample(CLIPS.land, landing / CLIPS.land.duration, poses.c),
        (1 - smoothstep(0.15, LANDING, landing)) * (1 - moving * 0.6),
      );
    if (airborne > 0.01) blend(out, sample(CLIPS.jump, (idleTime / CLIPS.jump.duration) % 1, poses.c), airborne);

    // Swimming: treading water, blending into the stroke as they move, at the rate that matches the pace.
    swimming = ease(swimming, swim ? 1 : 0, dt, 0.25);
    if (swimming > 0.01) {
      const water = sample(CLIPS.swimIdle, (idleTime / CLIPS.swimIdle.duration) % 1, poses.c);
      if (moving > 0.01) {
        stroke = (stroke + (dt * Math.max(pace, 0.4)) / swimSpeed / CLIPS.swim.duration) % 1;
        const swimPose = sample(CLIPS.swim, stroke, poses.a);
        swimPose.hips[1] += SWIM_LIFT; // the stroke lies a little deep in the pack: back and head at the surface
        blend(water, swimPose, moving);
      }
      water.hips[0] = 0;
      water.hips[2] = 0;
      blend(out, water, swimming);
    }

    // Local turns for this rig: each bone's turn relative to its nearest present parent's.
    for (const bone of used) {
      const own = out.rotations[index[bone]];
      const parent = parentOf[bone];
      const local = locals.get(bone);
      if (parent) local.copy(out.rotations[index[parent]]).invert().multiply(own);
      else local.copy(own);
    }
    const hips = out.hips.map((value) => value * legLength);
    // Heels land at the start and halfway through each walk and run cycle (the clips start on the left foot).
    let footstep = null;
    if (moving > 0.5 && seat === "none" && swimming < 0.5 && airborne < 0.5) {
      const crossed = (mark) => (before <= phase ? before < mark && mark <= phase : mark > before || mark <= phase);
      if (crossed(0.02)) footstep = "left";
      else if (crossed(0.52)) footstep = "right";
    }
    // (`part`: which clip of an act is playing, for whoever puts the right tool in its hand.)
    return { locals, hips, footstep, running: pace > 3, part: acting > 0.5 ? actClip : null };
  };
}
