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
    const duty = mix(Math.max(0.5, 0.62 - 0.03 * pace), 0.32);
    const travel = Math.min(1.45 * legLength, duty * cycle); // how far a planted foot goes, front to back
    const centre = mix(0.04, 0.1) * legLength; // feet land a little further ahead than they leave
    const pushAt = Math.PI / 2 + TAU * (duty - 0.06); // the toes push off just before the foot lifts
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
    const kneeSwing = w * mix(0.55 + 0.45 * stride, 1.75);
    const kneeBase = w * mix(0.05, 0.22);
    const kneeLoad = w * mix(0.18, 0.32);
    const push = w * mix(0.32, 0.55);
    /** How far ahead of the hip the ankle is at stride point `u` (0 heel down … 1 the next heel down):
     *  straight back at the ground's speed while planted, then a smooth swing that leaves and lands
     *  moving with the ground. */
    function footAhead(u) {
      const front = centre + travel / 2;
      const back = centre - travel / 2;
      if (u < duty) return front - (u / duty) * travel;
      const t = (u - duty) / (1 - duty);
      // A runner's foot leaves the ground fast; following that speed through the swing would fling it far
      // behind and in front, so the swing eases it.
      const slope = (-travel / duty) * (1 - duty) * (1 - run * 0.8);
      const t2 = t * t;
      const t3 = t2 * t;
      return (2 * t3 - 3 * t2 + 1) * back + (t3 - 2 * t2 + t) * slope + (3 * t2 - 2 * t3) * front + (t3 - t2) * slope;
    }
    /** The thigh angle that puts the ankle `ahead` metres in front of the hip with the knee bent `knee`. */
    function thighFor(ahead, knee) {
      let angle = Math.asin(Math.max(-0.95, Math.min(0.95, ahead / legLength)));
      for (let i = 0; i < 3; i++) {
        const error = upperLeg * Math.sin(angle) + lowerLeg * Math.sin(angle - knee) - ahead;
        angle -= error / (upperLeg * Math.cos(angle) + lowerLeg * Math.cos(angle - knee));
      }
      return Number.isFinite(angle) ? angle : 0;
    }
    function leg(p, idleBend, outward) {
      // A resting leg bends at the knee with its foot where it was: the thigh comes forward just enough
      // to keep the ankle over the same spot.
      const rest = Math.atan2(lowerLeg * Math.sin(idleBend), upperLeg + lowerLeg * Math.cos(idleBend));
      const stepBend =
        kneeBase +
        kneeSwing * bump(p, -0.35, 1.65) + // folds as the foot leaves the ground and swings through
        kneeLoad * bump(p, Math.PI / 2 + 0.6, 0.7); // gives a little as the heel lands
      const bend = stepBend + idleBend;
      // Where the ankle should be, ahead of the hip, at this point of the stride; then the thigh angle
      // that puts it there with the knee bent as it is.
      const u = ((((p - Math.PI / 2) / TAU) % 1) + 1) % 1; // 0 as the heel lands
      const walking = w * thighFor(footAhead(u), stepBend) + rest;
      // Seated: thighs level, shins straight down, feet a little apart.
      const forward = toSeat(walking, 1.45);
      const knee = toSeat(bend, 1.5);
      // The foot stays level with the ground while it carries weight, hangs a little in the swing, pushes
      // off with the toes, and lands heel first.
      const carrying = w * (1 - smoothstep(duty - 0.04, duty + 0.08, u) + smoothstep(0.92, 1, u)) + (1 - w);
      const ankle = toSeat(
        (walking - bend) * (0.5 + 0.5 * carrying) +
          push * bump(p, pushAt, 0.9) -
          0.18 * w * bump(p, Math.PI / 2 - 0.1, 0.55),
        forward - knee,
      );
      const toes = -push * 0.9 * bump(p, pushAt + 0.1, 0.6) * standing;
      // How far the ankle hangs below the hip joint.
      const reach = upperLeg * Math.cos(forward) + lowerLeg * Math.cos(forward - knee);
      return {
        thigh: [-forward, -hipsYaw, legRoll * standing + outward * 0.07 * s],
        knee: [knee, 0, 0],
        ankle: [ankle, 0, 0],
        toes: [toes, 0, 0],
        reach,
      };
    }
    const left = leg(phase, idleBendLeft, 1);
    const right = leg(phase + Math.PI, idleBendRight, -1);
    // Rolling lifts one hip joint and lowers the other; the lower-reaching foot is the one on the ground.
    const lift = hipWidth * Math.sin(hipsRoll);
    const drop = Math.max(left.reach - lift, right.reach + lift) - legLength;

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
    const armSwing = w * mix(0.12 + 0.25 * stride, 0.5) * standing;
    const armForward = w * mix(0.04, 0.12) + still * 0.02 * Math.sin((time * TAU) / 5.3);
    // Talking, the hands move with the words: the right one more than the left.
    const gesture = talking * (1 - w);
    const leftArm =
      toSeat(armForward - armSwing * Math.sin(phase - 0.25), 0.3) + gesture * 0.12 * (1 + Math.sin(time * 1.3));
    const rightArm =
      toSeat(armForward + armSwing * Math.sin(phase - 0.25), 0.3) + gesture * (0.3 + 0.15 * Math.sin(time * 1.7));
    const down = toSeat(armDown - run * w * 0.12, armDown - 0.1) - breath * 0.012;
    const elbow = (swing) => toSeat(ELBOW + w * mix(0.1 + 0.35 * Math.max(0, swing), 1.15 + 0.3 * swing), 0.6);
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
