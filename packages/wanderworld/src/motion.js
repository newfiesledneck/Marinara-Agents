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
 * A motion clock for one body. Call `step(dt, speed)` every frame with the metres per second the body
 * really moved; it returns that frame's pose:
 * - `bones`: { [humanoid bone name]: [x, y, z] }
 * - `hips`: [x, y, z] to add to the hips' rest position, in the same units as `legs`
 * - `blink`: eyelid closure 0…1, for models with a blink expression
 *
 * `legs` gives the body's proportions (hip to knee, knee to ankle, and half the gap between the hip
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

  return function step(dt, speed) {
    dt = Math.min(0.1, Math.max(0, Number.isFinite(dt) ? dt : 0));
    speed = Math.max(0, Number.isFinite(speed) ? speed : 0);
    time += dt;
    pace = ease(pace, speed, dt, 0.1);
    walk = ease(walk, clamp01(speed / 0.6), dt, 0.12);
    run = ease(run, smoothstep(3, 4.4, speed), dt, 0.18);
    phase = (phase + (dt * pace * TAU) / strideAt(pace)) % TAU;
    const w = walk;
    const still = 1 - w;
    const mix = (walking, running) => walking + (running - walking) * run;
    const stride = Math.min(1, pace / 2.5);

    // ── Idle: breathing, and a slow shift of weight from foot to foot ──
    const breath = Math.sin((time * TAU) / breathEvery);
    const shiftWave = Math.sin((time * TAU) / shiftEvery + shiftStart);
    const lean = (Math.tanh(2.2 * shiftWave) / Math.tanh(2.2)) * still; // +1: weight on the left foot
    const idleBendLeft = 0.26 * Math.max(0, -lean);
    const idleBendRight = 0.26 * Math.max(0, lean);
    stepLook(dt, w);

    // ── Legs ──
    const thighSwing = w * mix(0.24 + 0.2 * stride, 0.62);
    const thighForward = w * mix(0.06, 0.28);
    const kneeSwing = w * mix(0.55 + 0.45 * stride, 1.75);
    const kneeBase = w * mix(0.05, 0.22);
    const kneeLoad = w * mix(0.18, 0.32);
    const push = w * mix(0.32, 0.55);
    function leg(p, idleBend) {
      const forward = thighForward + thighSwing * Math.sin(p) + idleBend * 0.3;
      const knee =
        kneeBase +
        kneeSwing * bump(p, -0.35, 1.65) + // folds as the foot leaves the ground and swings through
        kneeLoad * bump(p, Math.PI / 2 + 0.6, 0.7) + // gives a little as the heel lands
        idleBend;
      // The foot stays level with the ground while it carries weight, hangs a little in the swing, pushes
      // off with the toes, and lands heel first.
      const carrying = w * clamp01(0.5 - Math.cos(p) * 1.2) + still;
      const ankle =
        (forward - knee) * (0.5 + 0.5 * carrying) +
        push * bump(p, -Math.PI / 2 - 0.15, 0.9) -
        0.18 * w * bump(p, Math.PI / 2 - 0.1, 0.55);
      const toes = -push * 0.9 * bump(p, -Math.PI / 2 - 0.05, 0.6);
      // How far the ankle hangs below the hip joint.
      const reach = upperLeg * Math.cos(forward) + lowerLeg * Math.cos(forward - knee);
      return { thigh: [-forward, 0, 0], knee: [knee, 0, 0], ankle: [ankle, 0, 0], toes: [toes, 0, 0], reach };
    }
    const left = leg(phase, idleBendLeft);
    const right = leg(phase + Math.PI, idleBendRight);

    // ── Hips: turn with the striding leg, dip over the swinging one, and carry the weight side to side ──
    const hipsYaw = -w * mix(0.1, 0.16) * (0.5 + 0.5 * stride) * Math.sin(phase);
    const hipsRoll = -w * mix(0.05, 0.03) * Math.cos(phase) + 0.045 * lean;
    const sway = (-w * mix(0.025, 0.012) * Math.cos(phase) + 0.035 * lean) * legLength;
    // Rolling lifts one hip joint and lowers the other; the lower-reaching foot is the one on the ground.
    const lift = hipWidth * Math.sin(hipsRoll);
    const drop = Math.max(left.reach - lift, right.reach + lift) - legLength;

    // ── Upper body: shoulders turn against the hips, the head stays level and looks about ──
    const forwardLean = w * mix(0.04, 0.16);
    const spineYaw = -hipsYaw * 0.8;
    const chestYaw = -hipsYaw * 0.8 + look.yaw * 0.15;
    const shouldersYaw = hipsYaw + spineYaw + chestYaw;
    const spine = [forwardLean * 0.6 + breath * 0.01, spineYaw, -hipsRoll * 0.7 - 0.02 * lean];
    const chest = [forwardLean * 0.4 + breath * 0.016, chestYaw, -hipsRoll * 0.3];
    const neck = [-forwardLean * 0.4 + look.pitch * 0.4, look.yaw * 0.4 - shouldersYaw * 0.5, 0.01 * lean];
    const head = [-forwardLean * 0.5 + look.pitch * 0.6, look.yaw * 0.6 - shouldersYaw * 0.5, 0.02 * lean];

    // ── Arms: swing against the legs, a beat behind, elbows bending more as they come forward ──
    const armSwing = w * mix(0.12 + 0.25 * stride, 0.5);
    const armForward = w * mix(0.04, 0.12) + still * 0.02 * Math.sin((time * TAU) / 5.3);
    const leftArm = armForward - armSwing * Math.sin(phase - 0.25);
    const rightArm = armForward + armSwing * Math.sin(phase - 0.25);
    const down = armDown - run * w * 0.12 - breath * 0.012;
    const elbow = (swing) => ELBOW + w * mix(0.1 + 0.35 * Math.max(0, swing), 1.15 + 0.3 * swing);
    const curl = 0.32 + run * w * 0.6;

    const bones = {
      hips: [run * w * 0.06, hipsYaw, hipsRoll],
      spine,
      chest,
      neck,
      head,
      leftShoulder: [0, 0, breath * 0.012],
      rightShoulder: [0, 0, -breath * 0.012],
      leftUpperArm: [-leftArm, 0, -down],
      rightUpperArm: [-rightArm, 0, down],
      leftLowerArm: [0, -elbow(leftArm), 0],
      rightLowerArm: [0, elbow(rightArm), 0],
      leftHand: [0, -0.08, -0.12],
      rightHand: [0, 0.08, 0.12],
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
      const amount = curl * (0.85 + i * 0.1);
      for (const [joint, share] of [
        ["Proximal", 0.8],
        ["Intermediate", 1],
        ["Distal", 0.7],
      ]) {
        bones[`left${finger}${joint}`] = [0, 0, -amount * share];
        bones[`right${finger}${joint}`] = [0, 0, amount * share];
      }
    });
    return { bones, hips: [sway, drop, 0], blink: stepBlink(dt) };
  };
}
