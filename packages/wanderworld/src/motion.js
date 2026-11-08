// How a body moves: a walk that turns into a run, and an idle that keeps standing people alive. Plain
// maths with no three.js import, so it is cheap to test. character.js applies each pose to a humanoid.
//
// Angles are Euler XYZ radians for three-vrm's normalized humanoid bones, in VRM 1.0 space: the body
// faces +z, its left side is on +x, and its rest pose is a T-pose (arms straight out along ±x).
// Signs, for reading the numbers below:
// - Legs and spine: a negative x swings a thigh forward, and a positive x bends a knee back, tips a foot's
//   toes down, or leans the spine forward.
// - Arms: z lowers them from the T-pose (negative on the left, positive on the right), a negative x
//   swings an arm forward, and y bends an elbow (negative on the left, positive on the right).

const TAU = Math.PI * 2;
/** Upper arms hang this far down from the T-pose (a little short of straight down, so they clear the hips). */
const ARM_DOWN = 1.25;
/** A relaxed elbow is never quite straight. */
const ELBOW = 0.28;
const FINGERS = ["Index", "Middle", "Ring", "Little"];

/** Metres covered by one full walk cycle (two steps): longer strides at speed, as people take. About 0.75
 *  cycles a second at an amble (1.3 m/s), 1 at a brisk walk (2.5 m/s) and 1.3 at a run (5 m/s). */
export const strideAt = (speed) => 1 + 0.55 * speed;

const clamp01 = (value) => Math.min(1, Math.max(0, value));
const smoothstep = (from, to, value) => {
  const t = clamp01((value - from) / (to - from));
  return t * t * (3 - 2 * t);
};
const ease = (current, target, dt, seconds) => current + (target - current) * (1 - Math.exp(-dt / seconds));
/** An angle brought into -π…π. */
const wrap = (angle) => angle - TAU * Math.round(angle / TAU);
/** A smooth hill over the cycle: 1 at `centre`, falling to 0 at `width` either side. */
function bump(phase, centre, width) {
  const distance = Math.abs(wrap(phase - centre));
  return distance >= width ? 0 : 0.5 + 0.5 * Math.cos((Math.PI * distance) / width);
}

/** A small seeded random source, so each person keeps their own habits. */
function seeded(seed) {
  let state = seed >>> 0 || 1;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/**
 * A motion clock for one body. Call `step(dt, speed, options)` every frame with the metres per second the
 * body really moved. Options: `sit` (sit down, or stand up when false), `lookAt` (an angle to turn the
 * head to, positive to the body's left, or null), `talk` (gesture while speaking) and `wave` (start a
 * wave). It returns that frame's pose:
 * - `bones`: { [humanoid bone name]: [x, y, z] }
 * - `hips`: [x, y, z] to add to the hips' rest position, in the same units as `legs`
 * - `blink`: eyelid closure 0…1, for models with a blink expression
 * - `footstep`: "left" or "right" on the frame a heel lands, else null; `running` while running
 *
 * `legs` gives the body's proportions in metres (hip to knee, knee to ankle, and half the gap between the hip
 * joints). With them the standing foot stays on the ground: the hips drop as far as the legs' angles
 * need, which is also what makes the body rise and fall as it walks.
 */
export function createMotion({ upperLeg = 0.42, lowerLeg = 0.42, hipWidth = 0.09, seed = 1 } = {}) {
  const random = seeded(seed);
  const legLength = upperLeg + lowerLeg;
  // Habits: how fast this person breathes and shifts their weight, and how they hold their arms.
  const breathEvery = 3.6 + random() * 1.4;
  const shiftEvery = 8 + random() * 6;
  const shiftStart = random() * TAU;
  const armDown = ARM_DOWN + (random() - 0.5) * 0.08;
  let time = random() * 60;
  let phase = random() * TAU;
  let pace = 0;
  let walk = 0;
  let run = 0;
  const look = { yaw: 0, pitch: 0, goalYaw: 0, goalPitch: 0, wait: 1 + random() * 3 };
  const blink = { wait: 1 + random() * 4, at: -1 };

  function stepLook(dt, moving) {
    look.wait -= dt;
    if (look.wait <= 0) {
      look.wait = 2.5 + random() * 4;
      const glance = random() < 0.6;
      look.goalYaw = glance ? (random() < 0.5 ? -1 : 1) * (0.15 + random() * 0.4) : 0;
      look.goalPitch = glance ? (random() - 0.6) * 0.25 : 0;
    }
    // Walking, people mostly look where they're going.
    const keep = 1 - moving * 0.8;
    look.yaw = ease(look.yaw, look.goalYaw * keep, dt, 0.5);
    look.pitch = ease(look.pitch, look.goalPitch * keep, dt, 0.5);
  }

  /** A blink every 2 to 6 seconds: shut in 60 ms, held 30 ms, open in 90 ms. */
  function stepBlink(dt) {
    if (blink.at < 0) {
      blink.wait -= dt;
      if (blink.wait > 0) return 0;
      blink.at = 0;
    }
    blink.at += dt;
    const t = blink.at;
    if (t < 0.06) return t / 0.06;
    if (t < 0.09) return 1;
    if (t < 0.18) return 1 - (t - 0.09) / 0.09;
    blink.at = -1;
    blink.wait = 2 + random() * 4;
    return 0;
  }

  let sitting = 0;
  let talking = 0;
  let waveAt = -1;
  /** How far into its stride a foot is when its heel lands (see `leg`). */
  const HEEL_DOWN = Math.PI / 2 - 0.1;
  const crossed = (from, advance, mark) => advance > 0 && (((mark - from) % TAU) + TAU) % TAU < advance;

  return function step(dt, speed, { sit = false, lookAt = null, talk = false, wave = false } = {}) {
    dt = Math.min(0.1, Math.max(0, Number.isFinite(dt) ? dt : 0));
    speed = Math.max(0, Number.isFinite(speed) ? speed : 0);
    time += dt;
    pace = ease(pace, speed, dt, 0.1);
    walk = ease(walk, clamp01(speed / 0.6), dt, 0.12);
    run = ease(run, smoothstep(3, 4.4, speed), dt, 0.18);
    sitting = ease(sitting, sit ? 1 : 0, dt, 0.3);
    talking = ease(talking, talk ? 1 : 0, dt, 0.4);
    if (wave && waveAt < 0) waveAt = 0;
    let waving = 0;
    if (waveAt >= 0) {
      waveAt += dt;
      waving = smoothstep(0, 0.3, waveAt) * (1 - smoothstep(1.5, 1.9, waveAt));
      if (waveAt > 1.9) waveAt = -1;
    }
    const w = walk;
    const s = sitting;
    const standing = 1 - s;
    const still = (1 - w) * standing;
    const mix = (walking, running) => walking + (running - walking) * run;
    const toSeat = (value, seated) => value + (seated - value) * s;
    const stride = Math.min(1, pace / 2.5);

    // A cycle covers `cycle` metres. Each foot carries the body for `duty` of it, moving back under the
    // hips at exactly the walking speed so it never skates, then swings forward again. Running spends less
    // of the cycle on the ground and more in the air.
    const cycle = mix(0.85 + 0.4 * pace, strideAt(pace));
    const duty = mix(Math.max(0.5, 0.62 - 0.03 * pace), 0.27);
    // How far a planted ankle goes, front to back: the body's travel while the foot is down, less what the
    // foot itself rolls through from heel to toe.
    const travel = Math.min(1.45 * legLength, Math.max(0.2, duty * cycle - mix(0.07, 0.03) * legLength));
    const centre = mix(0.04, 0.0) * legLength; // walking feet land a little further ahead than they leave
    const advance = (dt * pace * TAU) / Math.max(0.5, cycle);
    const before = phase;
    phase = (phase + advance) % TAU;

    // ── Idle: breathing, and a slow shift of weight from foot to foot ──
    const breath = Math.sin((time * TAU) / breathEvery);
    const shiftWave = Math.sin((time * TAU) / shiftEvery + shiftStart);
    const lean = (Math.tanh(2.2 * shiftWave) / Math.tanh(2.2)) * still; // +1: weight on the left foot
    const idleBendLeft = 0.26 * Math.max(0, -lean);
    const idleBendRight = 0.26 * Math.max(0, lean);
    if (lookAt !== null && Number.isFinite(lookAt)) {
      // Someone worth looking at: turn the head to them (and the chest a little), as far as a neck turns.
      look.goalYaw = Math.max(-1.1, Math.min(1.1, lookAt));
      look.goalPitch = 0;
      look.wait = 1.5;
    }
    stepLook(dt, w);

    // ── Hips: turn with the striding leg, dip over the swinging one, and carry the weight side to side ──
    const hipsYaw = -w * mix(0.1, 0.16) * (0.5 + 0.5 * stride) * Math.sin(phase) * standing;
    const hipsRoll = -w * mix(0.05, 0.03) * Math.cos(phase) * standing + 0.045 * lean;
    const sway = (-w * mix(0.025, 0.012) * Math.cos(phase) * standing + 0.035 * lean) * legLength;
    // The legs undo all three at the hip joint, so the feet stay on their own lines on the ground while
    // the hips move above them (like a real hip joint, instead of the legs swinging with the pelvis).
    const legRoll = -hipsRoll - sway / legLength;

    // ── Legs ──
    // Each foot has a path: planted, it slides straight back under the hips at the ground's speed (so it
    // never skates) and rolls up onto its toes before it lifts; then it swings forward in a low arc and
    // lands heel first. The hip and knee angles are worked out from where the ankle should be (two-bone
    // IK), so the planted leg keeps a soft knee and the swinging foot clears the ground instead of the
    // shin kicking up behind.
    const footLength = 0.17 * legLength;
    const heelRise = w * mix(0.06, 0.09) * legLength; // how high the ankle rolls up before the foot lifts
    const clearance = w * mix(0.12, 0.3) * legLength; // how high the ankle swings (early, as the knee folds)
    const crouch = w * standing * mix(0.03, 0.07) * legLength; // hips a little lower than standing
    // The hips rise and fall in one smooth wave per step: lowest just after each heel lands (walking) or in
    // the middle of each stance (running). The legs reach for the ground from wherever the hips are.
    const bob = w * standing * mix(0.024 * (0.6 + 0.4 * stride), 0.05) * legLength;
    const lowAt = mix(Math.max(0, duty - 0.5) / 2 + 0.02, duty / 2);
    const stepPoint = ((((phase - Math.PI / 2) / TAU - lowAt) % 0.5) + 0.5) % 0.5; // 0 at each low point
    const hipHeight = legLength - crouch - bob * (0.5 + 0.5 * Math.cos(stepPoint * 2 * TAU));
    /** How far ahead of the hip the ankle is at stride point `u` (0 heel down … 1 the next heel down). */
    function footAhead(u) {
      const front = centre + travel / 2;
      const back = centre - travel / 2;
      if (u < duty) return front - (u / duty) * travel;
      const t = (u - duty) / (1 - duty);
      // Leaving the ground the foot still drifts back a little, then swings through and reaches forward.
      const slope = (-travel / duty) * (1 - duty) * mix(0.3, 0.15);
      const t2 = t * t;
      const t3 = t2 * t;
      return (2 * t3 - 3 * t2 + 1) * back + (t3 - 2 * t2 + t) * slope + (3 * t2 - 2 * t3) * front + (t3 - t2) * slope;
    }
    /** How high the ankle is above where it rests on the ground, at stride point `u`. */
    function footHeight(u) {
      if (u < duty) return heelRise * smoothstep(duty * 0.55, duty, u); // rolling up onto the toes
      const t = (u - duty) / (1 - duty);
      // Up early in the swing while the foot is still behind (so the knee folds), then skimming low as it
      // reaches forward to land.
      return heelRise * (1 - t) * (1 - t) + clearance * Math.sin(Math.PI * Math.min(1, t / 0.72));
    }
    /** Hip and knee angles that put the ankle `ahead` in front of and `down` below the hip joint. */
    function reachFor(ahead, down) {
      const longest = (upperLeg + lowerLeg) * 0.9995;
      const distance = Math.min(longest, Math.max(0.05, Math.hypot(ahead, down)));
      const cosKnee = (upperLeg ** 2 + lowerLeg ** 2 - distance ** 2) / (2 * upperLeg * lowerLeg);
      const cosHip = (upperLeg ** 2 + distance ** 2 - lowerLeg ** 2) / (2 * upperLeg * distance);
      const knee = Math.PI - Math.acos(Math.max(-1, Math.min(1, cosKnee)));
      const thigh = Math.atan2(ahead, down) + Math.acos(Math.max(-1, Math.min(1, cosHip)));
      return { thigh, knee };
    }
    function leg(p, idleBend, outward) {
      // A resting leg bends at the knee with its foot where it was: the thigh comes forward just enough
      // to keep the ankle over the same spot.
      const rest = Math.atan2(lowerLeg * Math.sin(idleBend), upperLeg + lowerLeg * Math.cos(idleBend));
      const u = ((((p - Math.PI / 2) / TAU) % 1) + 1) % 1; // 0 as the heel lands
      const height = footHeight(u);
      const step = reachFor(footAhead(u), hipHeight - height);
      // Seated: thighs level, shins straight down, feet a little apart.
      const forward = toSeat(w * step.thigh + rest, 1.45);
      const knee = toSeat(w * step.knee + idleBend, 1.5);
      // The foot stays level while planted, tips onto its toes as the heel rises, hangs a little after it
      // lifts, and turns its toes up to land on the heel.
      const roll = height > 0 && u < duty ? Math.asin(Math.min(0.9, height / footLength)) : 0;
      const t = u < duty ? 0 : (u - duty) / (1 - duty);
      const swingTip = u < duty ? 0 : 0.45 * (1 - t) * (1 - t) - 0.22 * smoothstep(0.65, 1, t);
      const landing = -0.15 * (1 - smoothstep(0, 0.08, u)) * (u < duty ? 1 : 0);
      const ankle = toSeat(forward - knee + w * (roll + swingTip + landing), forward - knee);
      const toes = -w * roll * standing;
      // How far the ankle hangs below the hip joint, and whether this foot is (nearly) on the ground: an
      // ankle rolled onto the toes, or about to land on the heel, still counts as standing on it.
      const reach = upperLeg * Math.cos(forward) + lowerLeg * Math.cos(forward - knee) + w * height;
      const grounded = w < 0.5 || s > 0.5 || u < duty + 0.02 || u > 0.96;
      return {
        thigh: [-forward, -hipsYaw, legRoll * standing + outward * 0.07 * s],
        knee: [knee, 0, 0],
        ankle: [ankle, 0, 0],
        toes: [toes, 0, 0],
        reach,
        grounded,
      };
    }
    const left = leg(phase, idleBendLeft, 1);
    const right = leg(phase + Math.PI, idleBendRight, -1);
    // Standing or sitting, the hips rest on the leg that reaches lowest (rolling lifts one hip joint and
    // lowers the other). Walking and running, they follow their smooth wave, and the legs reach from there.
    const lift = hipWidth * Math.sin(hipsRoll);
    const reaches = [left.grounded ? left.reach - lift : -Infinity, right.grounded ? right.reach + lift : -Infinity];
    const lowest = Math.max(...reaches);
    const resting = (Number.isFinite(lowest) ? Math.min(legLength, lowest) : legLength) - legLength;
    const moving = w * standing;
    const drop = resting + (hipHeight - legLength - resting) * moving;

    // ── Upper body: shoulders turn against the hips, the head stays level and looks about ──
    const forwardLean = w * mix(0.04, 0.16) + s * 0.06;
    const spineYaw = -hipsYaw * 0.8;
    const chestYaw = -hipsYaw * 0.8 + look.yaw * 0.15;
    const shouldersYaw = hipsYaw + spineYaw + chestYaw;
    const nod = talking * 0.04 * Math.sin(time * 3.1);
    const spine = [forwardLean * 0.6 + breath * 0.01, spineYaw, -hipsRoll * 0.7 - 0.02 * lean];
    const chest = [forwardLean * 0.4 + breath * 0.016, chestYaw, -hipsRoll * 0.3];
    const neck = [-forwardLean * 0.4 + look.pitch * 0.4, look.yaw * 0.4 - shouldersYaw * 0.5, 0.01 * lean];
    const head = [-forwardLean * 0.5 + look.pitch * 0.6 + nod, look.yaw * 0.6 - shouldersYaw * 0.5, 0.02 * lean];

    // ── Arms: swing against the legs, a beat behind, elbows bending more as they come forward ──
    const armSwing = w * mix(0.2 + 0.3 * stride, 0.55) * standing;
    const armForward = w * mix(0.04, 0.12) + still * 0.02 * Math.sin((time * TAU) / 5.3);
    // Talking, the hands move with the words: the right one more than the left.
    const gesture = talking * (1 - w);
    const leftArm =
      toSeat(armForward - armSwing * Math.sin(phase - 0.25), 0.3) + gesture * 0.12 * (1 + Math.sin(time * 1.3));
    const rightArm =
      toSeat(armForward + armSwing * Math.sin(phase - 0.25), 0.3) + gesture * (0.3 + 0.15 * Math.sin(time * 1.7));
    // Walking, the arms hang a little away from the body so they swing clear of it.
    const down = toSeat(armDown - w * 0.06 - run * w * 0.1, armDown - 0.1) - breath * 0.012;
    const elbow = (swing) => toSeat(ELBOW + w * mix(0.15 + 0.45 * Math.max(0, swing), 1.15 + 0.3 * swing), 0.6);
    const leftElbow = elbow(leftArm) + gesture * 0.35 * (1 + Math.sin(time * 1.9));
    const rightElbow = elbow(rightArm) + gesture * (0.75 + 0.3 * Math.sin(time * 2.3));
    const curl = 0.32 + run * w * 0.6;
    // A wave: the right arm out to the side, the forearm up, the hand going back and forth.
    const raise = (value, raised) => value + (raised - value) * waving;

    const bones = {
      hips: [run * w * 0.06, hipsYaw, hipsRoll],
      spine,
      chest,
      neck,
      head,
      leftShoulder: [0, 0, breath * 0.012],
      rightShoulder: [0, 0, -breath * 0.012],
      leftUpperArm: [-leftArm, 0, -down],
      rightUpperArm: [-raise(rightArm, 0.25), 0, raise(down, -0.15)],
      leftLowerArm: [0, -leftElbow, 0],
      rightLowerArm: [0, raise(rightElbow, 0.2), waving * (-1.35 + 0.35 * Math.sin(time * 11))],
      leftHand: [0, -0.08, -0.12],
      rightHand: [0, 0.08, raise(0.12, 0)],
      leftUpperLeg: left.thigh,
      rightUpperLeg: right.thigh,
      leftLowerLeg: left.knee,
      rightLowerLeg: right.knee,
      leftFoot: left.ankle,
      rightFoot: right.ankle,
      leftToes: left.toes,
      rightToes: right.toes,
    };
    // Relaxed fingers curl a little, more towards the little finger; running, they close.
    FINGERS.forEach((finger, i) => {
      const amount = curl * (0.85 + i * 0.1) * (1 - waving * 0.8);
      for (const [joint, share] of [
        ["Proximal", 0.8],
        ["Intermediate", 1],
        ["Distal", 0.7],
      ]) {
        bones[`left${finger}${joint}`] = [0, 0, -amount * share];
        bones[`right${finger}${joint}`] = [0, 0, amount * share];
      }
    });
    // A heel landing, for footstep sounds.
    let footstep = null;
    if (w > 0.4 && s < 0.5) {
      if (crossed(before, advance, HEEL_DOWN)) footstep = "left";
      else if (crossed(before, advance, HEEL_DOWN + Math.PI)) footstep = "right";
    }
    return { bones, hips: [sway, drop, 0], blink: stepBlink(dt), footstep, running: run > 0.5 };
  };
}
