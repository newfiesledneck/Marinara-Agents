// Spring bones: the hair's and clothes' chains (hair.js), the bust (bust.js) and a tail, swinging as the body
// moves, kept out of the body by colliders. The settings and colliders are VRM 1.0's (`VRMC_springBone`): the
// saved VRM carries them (exporter.js), and the preview swings them here the way three-vrm (the Engine's VRM
// model) does, so what the maker shows is what a VRM app shows. In two things the preview does more, for
// its animations, which move the legs as a chat never does: a breast pressed by an arm is squashed, and
// hanging cloth is carried by the legs under it and tied side to side (createSprings), where a VRM app only
// pushes each chain away from its colliders.
import { Matrix4, Quaternion, Vector3 } from "three";
import { relaxedPose, tPose, restPose } from "./figure.js";

// Each joint's settings. Stiffness pulls a bone back to how it rests, gravity draws it down, and drag slows
// it (VRM 1.0's meanings). Both keep their shape at rest and swing a little after a turn of the head or body.
/** The tail: stiff enough to keep its curve, a little weight, and slowed so it sways rather than whips. */
export const TAIL_JOINT = {
  hitRadius: 0.02,
  stiffness: 1.5,
  gravityPower: 0.1,
  gravityDir: [0, -1, 0],
  dragForce: 0.4,
};
/** The hair: softer, with hardly any weight, so it holds its style at rest and sways after a turn. */
export const HAIR_JOINT = {
  hitRadius: 0.02,
  stiffness: 0.5,
  gravityPower: 0.02,
  gravityDir: [0, -1, 0],
  dragForce: 0.3,
};
/**
 * Cloth (a skirt, a dress, a coat's skirts): stiffer and slowed more than hair, so it keeps its drape at rest
 * and swings out of the legs' way as they move, then settles.
 */
export const CLOTH_JOINT = {
  hitRadius: 0.02,
  stiffness: 1,
  gravityPower: 0.01,
  gravityDir: [0, -1, 0],
  dragForce: 0.35,
};
/**
 * The bust (bust.js): stiffer and slowed more than cloth, with no weight of its own (it rests shaped as it is),
 * so it sways a few millimetres as the body turns and settles within a second, never wobbling. Each breast's
 * hit radius is its own ball's (bust.js bustRadius), which the arms push.
 */
export const BUST_JOINT = {
  hitRadius: 0.05,
  stiffness: 1.5,
  gravityPower: 0,
  gravityDir: [0, -1, 0],
  dragForce: 0.45,
};
export const TAIL_BONES = ["tail_01", "tail_02", "tail_03", "tail_04", "tail_05"];
const LEG_RADIUS = 0.07; // metres: the legs' colliders, so a swinging tail stays outside the thighs
const CLEAR = 0.005; // metres a collider stays clear of a joint at rest, so nothing is pushed while still
// Metres past a leg's own thickness a cloth joint is kept off the leg it hangs over (createSprings `carried`).
const LEG_CLEAR = 0.03;
const LEG_PAST = 0.08; // metres past the end of a thigh or calf at which cloth is no longer that bone's to push
const LEG_ASIDE = 0.1; // metres aside of a leg over which that eases to nothing
// Cloth's chains are tied side to side (createSprings `rings`), RING_PASSES times a frame: each joint's
// drift from where it hangs goes RING_EVEN of the way to that of the joints beside it, and two joints side by
// side may be RING_STRETCH times as far apart as they rest before the cloth between them draws them together.
const RING_STRETCH = 1.1;
const RING_EVEN = 0.5;
const RING_PASSES = 2;
const TURN_MOST = 0.35; // radians the arms may turn a breast in the preview; pressed further, it squashes

/**
 * The colliders a body's springs meet: { body: [...] (the hair's), legs: [...] (a tail's), cloth: [...] (the
 * clothes'), arms: [...] (the bust's) }. Each is { bone, radius, offset (a point in the bone's own space), tail
 * (one too, for a capsule) }. They're fitted to the body as shaped (`position`, the body's points; `kit`, its
 * file, avatar.js bodyKit), in the bind pose:
 * - the head a ball, and the neck, collarbones and upper arms capsules along them;
 * - the hips, waist, chest and back a capsule across the body at each spine bone, as deep as it is there;
 * - for cloth, those of the hips and back again (their own, fitted to the cloth), each half of each thigh
 *   and calf and each foot a capsule as thick as the leg is there with what's worn on it (`worn`: the
 *   clothes that don't hang, as [{ position, skinIndex, skinWeight, joints }]), and the arms' again;
 * - for the bust, each upper arm, forearm and hand a capsule along it, as thick as half its skin is from its
 *   bone (so an arm pressing on a breast pushes it about where the skins meet), and fitted in the relaxed
 *   pose too (`relaxed`), where the arms hang closest to it.
 * Each sits inside the body, so what rests on it isn't pushed.
 */
export function bodyColliders(kit, position, bones, worn = []) {
  const { joints } = kit.file;
  const index = kit.shared.skinIndex.array;
  const weight = kit.shared.skinWeight.array;
  const by = new Map(); // bone name → the skin's points it moves most
  for (const mesh of kit.meshes) {
    if (mesh.part !== "skin" || mesh.piece) continue;
    for (let v = mesh.start; v < mesh.start + mesh.count; v++) {
      let best = 0;
      for (let c = 1; c < 4; c++) if (weight[v * 4 + c] > weight[v * 4 + best]) best = c;
      const name = joints[index[v * 4 + best]];
      if (!by.has(name)) by.set(name, []);
      by.get(name).push(new Vector3().fromArray(position, v * 3));
    }
  }
  const at = (name) => bones.get(name)?.getWorldPosition(new Vector3());
  const local = (bone, point) => bone.worldToLocal(point.clone());
  /** How far a share of the points lies from the line a→b (a low share: the body's narrowest there). */
  const reach = (points, a, b, share = 0.2) => {
    const line = b.clone().sub(a);
    const span = line.lengthSq() || 1;
    const gaps = points
      .map((p) => {
        const t = Math.max(0, Math.min(1, p.clone().sub(a).dot(line) / span));
        return p.distanceTo(a.clone().addScaledVector(line, t));
      })
      .sort((x, y) => x - y);
    return gaps[Math.floor(gaps.length * share)] ?? 0;
  };
  const body = [];
  /** A capsule along a bone, from its joint to the next one's, in a list `into`. */
  const along = (into, name, next, scale = 0.85, share = 0.2) => {
    const [bone, a, b, points] = [bones.get(name), at(name), at(next), by.get(name)];
    if (!bone || !a || !b || !points?.length) return;
    into.push({ bone, radius: reach(points, a, b, share) * scale, offset: local(bone, a), tail: local(bone, b) });
  };
  // The head: a ball at the middle of the skull, from ear to ear (the face's height round the eyes).
  const head = bones.get("Head");
  const eyes = at("eye_l")?.y ?? at("Head")?.y + 0.05;
  const skull = (by.get("Head") ?? []).filter((p) => Math.abs(p.y - eyes) < 0.03);
  if (head && skull.length) {
    const [low, high] = [new Vector3(Infinity, 0, Infinity), new Vector3(-Infinity, 0, -Infinity)];
    for (const p of skull) {
      low.min(p);
      high.max(p);
    }
    const middle = new Vector3(0, eyes, (low.z + high.z) / 2);
    body.push({ bone: head, radius: Math.min(high.x - low.x, high.z - low.z) * 0.46, offset: local(head, middle) });
  }
  along(body, "neck_01", "Head");
  for (const side of ["l", "r"]) {
    along(body, `clavicle_${side}`, `upperarm_${side}`, 0.8);
    along(body, `upperarm_${side}`, `lowerarm_${side}`);
  }
  // The hips, waist, chest and back: across the body, as deep as it is there, its ends rounded at the sides.
  for (const name of ["pelvis", "spine_01", "spine_02", "spine_03"]) {
    const [bone, points] = [bones.get(name), by.get(name)];
    if (!bone || !points?.length) continue;
    const ys = points.map((p) => p.y).sort((a, b) => a - b);
    const y = ys[Math.floor(ys.length / 2)];
    const band = points.filter((p) => Math.abs(p.y - y) < 0.04);
    const [low, high] = [new Vector3(Infinity, 0, Infinity), new Vector3(-Infinity, 0, -Infinity)];
    for (const p of band) {
      low.min(p);
      high.max(p);
    }
    const radius = ((high.z - low.z) / 2) * 0.9;
    const half = Math.max(0, (high.x - low.x) / 2 - radius);
    const middle = new Vector3((low.x + high.x) / 2, y, (low.z + high.z) / 2);
    body.push({
      bone,
      radius,
      offset: local(bone, middle.clone().setX(middle.x - half)),
      tail: local(bone, middle.clone().setX(middle.x + half)),
    });
  }
  // The legs, for a tail: a capsule down each thigh.
  const legs = ["l", "r"].flatMap((side) => {
    const [thigh, calf] = [bones.get(`thigh_${side}`), bones.get(`calf_${side}`)];
    return thigh && calf
      ? [{ bone: thigh, radius: LEG_RADIUS, offset: new Vector3(), tail: calf.position.clone() }]
      : [];
  });
  // The cloth's: the hips and back, and each leg and foot as thick as it is dressed, so a skirt is pushed by
  // the thigh that lifts under it and stays off a boot. A thigh or calf is two capsules, one for each half
  // of it (a thigh is far thicker at the hip than at the knee, and a capsule is one thickness all along):
  // each as thick as the middle of the skin's points round that half, or of what's worn there (trousers, a
  // boot's shaft) where that is thicker.
  const cloth = body
    .filter((collider) => collider.tail && /^(?:pelvis|spine_0[123])$/u.test(collider.bone.name))
    .map((collider) => ({ ...collider, offset: collider.offset.clone(), tail: collider.tail.clone() }));
  const dressed = new Map(); // bone name → the points of what's worn that it moves most
  for (const piece of worn)
    for (let v = 0; v < piece.position.length / 3; v++) {
      let best = 0;
      for (let c = 1; c < 4; c++) if (piece.skinWeight[v * 4 + c] > piece.skinWeight[v * 4 + best]) best = c;
      const name = piece.joints[piece.skinIndex[v * 4 + best]];
      if (!/^(?:thigh|calf|foot|ball)_[lr]$/u.test(name ?? "")) continue;
      if (!dressed.has(name)) dressed.set(name, []);
      dressed.get(name).push(new Vector3().fromArray(piece.position, v * 3));
    }
  /** A capsule along the share `from` to `to` of a bone's length (to the next bone's joint), in `cloth`. */
  const section = (name, next, from = 0, to = 1) => {
    const [bone, a, b] = [bones.get(name), at(name), at(next)];
    if (!bone || !a || !b) return;
    const line = b.clone().sub(a);
    const span = line.lengthSq() || 1;
    const within = (points = []) =>
      points.filter((p) => {
        const t = p.clone().sub(a).dot(line) / span;
        return (from === 0 || t >= from) && (to === 1 || t < to);
      });
    const [start, end] = [a.clone().addScaledVector(line, from), a.clone().addScaledVector(line, to)];
    const radius = Math.max(
      reach(within(by.get(name)), start, end, 0.5),
      reach(within(dressed.get(name)), start, end, 0.5),
    );
    // (It may shrink by half to fit, not a quarter: cloth that lies on the thigh, a tight robe's sides,
    // should still be kept out of it.)
    // (`full`: as thick as the leg is there, whatever fitColliders shrinks the collider to: createSprings keeps
    // the cloth it carries off the leg by it.)
    if (radius)
      cloth.push({
        bone,
        radius: radius * 0.95,
        full: radius,
        offset: local(bone, start),
        tail: local(bone, end),
        least: 0.5,
      });
  };
  for (const side of ["l", "r"]) {
    section(`thigh_${side}`, `calf_${side}`, 0, 0.5);
    section(`thigh_${side}`, `calf_${side}`, 0.5, 1);
    section(`calf_${side}`, `foot_${side}`, 0, 0.5);
    section(`calf_${side}`, `foot_${side}`, 0.5, 1);
    section(`foot_${side}`, `ball_${side}`);
  }
  // The bust's: each upper arm, forearm and hand (to the middle finger's second joint).
  const arms = [];
  for (const side of ["l", "r"]) {
    along(arms, `upperarm_${side}`, `lowerarm_${side}`, 1, 0.5);
    along(arms, `lowerarm_${side}`, `hand_${side}`, 1, 0.5);
    along(arms, `hand_${side}`, `middle_02_${side}`, 1, 0.5);
  }
  for (const collider of arms) collider.relaxed = true;
  // The cloth meets the arms and hands too (its own, fitted to it): a cape is pushed by an arm swung back, a
  // skirt by a hand at the hip.
  for (const collider of arms)
    cloth.push({ ...collider, offset: collider.offset.clone(), tail: collider.tail.clone(), least: 0.5 });
  return { body, legs, cloth, arms };
}

const a = new Vector3();
const b = new Vector3();
const c = new Vector3();
const d = new Vector3();
const e = new Vector3();
const fan = new Vector3();
const start = new Vector3();
const line = new Vector3();
const offset = new Vector3();

/** The point of a collider's middle (a ball's centre, or on a capsule's line) nearest `point`, into `out`. */
function nearestOn(collider, point, out) {
  start.copy(collider.offset).applyMatrix4(collider.bone.matrixWorld);
  if (!collider.tail) return out.copy(start);
  line.copy(collider.tail).applyMatrix4(collider.bone.matrixWorld).sub(start);
  const span = line.lengthSq();
  const t = span ? Math.max(0, Math.min(1, offset.copy(point).sub(start).dot(line) / span)) : 0;
  return out.copy(start).addScaledVector(line, t);
}

/**
 * The colliders fitted so that none pushes the hair, clothes, tail or bust while nothing moves, in the poses
 * the figure rests in (as built, and the T-pose a VRM rests in, and for the arms' the relaxed pose the maker
 * shows): each made a little smaller where a joint rests close to it (by a quarter at most, or its own `least`
 * share), and where a joint rests on one even so (a lock lying on the shoulder), that spring meets it no more.
 * Each spring's `colliders` are what it meets.
 */
export function fitColliders(figure) {
  const poses = [restPose, tPose, relaxedPose];
  /** How far each spring's joints are from a collider's surface, at their nearest, in every pose. */
  const gaps = new Map(); // collider → spring → gap
  for (const pose of poses) {
    pose(figure);
    for (const spring of figure.springs)
      for (const collider of spring.colliders) {
        if (pose === relaxedPose && !collider.relaxed) continue;
        let least = Infinity;
        for (const bone of spring.bones.slice(1)) {
          bone.getWorldPosition(a);
          least = Math.min(least, a.distanceTo(nearestOn(collider, a, b)) - spring.joint.hitRadius - CLEAR);
        }
        if (!gaps.has(collider)) gaps.set(collider, new Map());
        const was = gaps.get(collider).get(spring) ?? Infinity;
        gaps.get(collider).set(spring, Math.min(was, least));
      }
  }
  restPose(figure);
  for (const [collider, bySpring] of gaps) {
    const least = Math.min(...bySpring.values());
    collider.radius = Math.max(collider.radius * (collider.least ?? 0.75), Math.min(collider.radius, least));
    for (const [spring, gap] of bySpring)
      if (gap < collider.radius) spring.colliders = spring.colliders.filter((other) => other !== collider);
  }
}

const initial = new Matrix4();
const back = new Matrix4();
const turn = new Quaternion();
const toward = new Vector3();
const facing = new Quaternion();
const pressed = [new Vector3(), new Vector3()]; // (how far a breast is pressed on each side of each axis)
const size = new Vector3();
const shift = new Vector3();

/**
 * A breast (bust.js) squashed where the arms still press into its ball after the spring has turned it (the
 * maker's preview only: a VRM app turns it alone). Along each of the bone's own axes it is made shorter by as
 * much as it's pressed in, from the side it's pressed on, and wider the other ways to keep its size; with
 * nothing pressing, as it rests.
 */
function squash(joint, tip) {
  const { bone, settings, colliders } = joint;
  pressed[0].set(0, 0, 0);
  pressed[1].set(0, 0, 0);
  bone.parent.getWorldQuaternion(facing).multiply(bone.quaternion).invert(); // (the world into the bone's axes)
  for (const collider of colliders) {
    nearestOn(collider, tip, d);
    const out = c.copy(tip).sub(d);
    const gap = out.length() - collider.radius - settings.hitRadius;
    if (gap >= 0) continue;
    out.normalize().multiplyScalar(-gap).applyQuaternion(facing);
    for (let axis = 0; axis < 3; axis++) {
      const by = out.getComponent(axis); // (pushed towards + from the - side, or towards - from the + side)
      pressed[by > 0 ? 0 : 1].setComponent(axis, pressed[by > 0 ? 0 : 1].getComponent(axis) + Math.abs(by));
    }
  }
  const across = settings.hitRadius * 2;
  shift.set(0, 0, 0);
  for (let axis = 0; axis < 3; axis++) {
    const [from, to] = [pressed[0].getComponent(axis), pressed[1].getComponent(axis)];
    const short = Math.max(0.5, 1 - (from + to) / across);
    size.setComponent(axis, short);
    // (It keeps the side opposite the press, or between two presses, where they balance: in world metres from
    // the ball's middle.)
    shift.setComponent(axis, from + to ? ((from - to) * settings.hitRadius) / (from + to) : 0);
  }
  // (Wider the other ways, about the ball's middle, by as much as it's shorter.)
  const [x, y, z] = [size.x, size.y, size.z];
  const grown = [x / Math.sqrt(y * z), y / Math.sqrt(x * z), z / Math.sqrt(x * y)];
  // In the bone's own space, each axis scaled so the kept point stays: the bone moves by what that leaves.
  for (let axis = 0; axis < 3; axis++) {
    const short = size.getComponent(axis);
    const kept = shift.getComponent(axis) / joint.scale;
    const middle = joint.child.getComponent(axis);
    shift.setComponent(axis, middle * (1 - grown[axis]) + kept * (1 - short) * (grown[axis] / short));
  }
  bone.scale.set(...grown);
  bone.position.copy(shift.applyQuaternion(bone.quaternion)).add(joint.restAt);
}

/**
 * The figure's springs swinging: { step(seconds), reset() }. Call `step` each frame after the pose is set:
 * it turns the spring bones from where their tips were, as three-vrm does (VRM 1.0's springs: the tip carried
 * on by its own motion less the drag, pulled back by stiffness and down by gravity, kept its length, and
 * pushed out of the colliders). A breast still pressed into after that is squashed (`squash`). `reset` puts
 * them back at rest on the body as it now stands.
 */
export function createSprings(figure) {
  const joints = [];
  const pieces = new Map(); // a piece of cloth (a spring's `ring`) → its chains: [{ side, sides, joints }]
  for (const spring of figure.springs ?? []) {
    const { colliders } = spring;
    const chain = [];
    spring.bones.slice(0, -1).forEach((bone, i) => {
      bone.quaternion.copy(figure.rest.get(bone.name) ?? bone.quaternion);
      bone.updateMatrix();
      const child = spring.bones[i + 1].position.clone(); // (where the next joint is, in this bone's space)
      chain.push({
        bone,
        settings: spring.joint,
        colliders,
        root: spring.meets === "cloth" ? spring.bones[0] : null, // (a chain of cloth: pushed out from the body)
        squashes: !!spring.squash,
        restAt: bone.position.clone(),
        local: bone.matrix.clone(),
        rest: bone.quaternion.clone(),
        child,
        axis: child.clone().normalize(),
        length: 0,
        scale: 1, // (world metres to the bone's own units)
        tip: new Vector3(),
        last: new Vector3(),
        // (Each frame's working: where its parent holds it, where its tip is going, the way it rests, and more.)
        at: new Vector3(),
        next: new Vector3(),
        aim: new Vector3(),
        outward: new Vector3(),
        initial: new Matrix4(),
        held: false,
        // (Tied cloth: where it would have gone left alone, how far it is from where it hangs, and the joints
        // beside it.)
        free: new Vector3(),
        drift: new Vector3(),
        beside: [],
      });
    });
    joints.push(...chain);
    if (spring.meets === "cloth" && spring.ring) {
      if (!pieces.has(spring.ring)) pieces.set(spring.ring, []);
      pieces.get(spring.ring).push({ side: spring.side ?? 0, sides: spring.sides ?? 1, joints: chain });
    }
  }
  // A piece of cloth's chains tied side to side (the maker's preview only: a VRM's springs each swing alone).
  // Row by row down the cloth, each joint is tied to the one at its level in the chain beside it (`ties`:
  // [one, other, how far apart they rest]), all the way round a skirt; a gap of more than one missing chain
  // (the open front of a coat, a cloak's sides) isn't tied across.
  const rings = [...pieces.values()].map((chains) => {
    chains.sort((one, other) => one.side - other.side);
    const levels = Math.max(...chains.map((chain) => chain.joints.length));
    const rows = Array.from({ length: levels }, (_, level) => chains.flatMap((chain) => chain.joints[level] ?? []));
    const ties = rows.map(() => []);
    chains.forEach((chain, i) => {
      const beside = chains[(i + 1) % chains.length];
      const round = (beside.side - chain.side + chain.sides) % chain.sides;
      if (beside === chain || round > 2 || (chains.length === 2 && i)) return;
      for (let level = 0; level < Math.min(chain.joints.length, beside.joints.length); level++) {
        ties[level].push([chain.joints[level], beside.joints[level], 0]);
        chain.joints[level].beside.push(beside.joints[level]);
        beside.joints[level].beside.push(chain.joints[level]);
      }
    });
    return { rows, ties };
  });
  const tied = new Set(rings.flatMap((ring) => ring.rows.flat()));
  const loose = joints.filter((joint) => !tied.has(joint));
  // Cloth kept off the legs under it (the maker's preview only). A thigh that lifts carries the skirt's front
  // with it; colliders alone can't show that: they push a chain away from the leg, so the chains either side
  // of it part and the leg comes through between them. So each joint of a cloth chain knows, for each thigh
  // and calf it rests on the outer side of, which way is out from the body as that leg sees it (`carried`),
  // and each frame the tip is kept clear of the leg that way wherever it is over it (`hold`): forward for a
  // thigh at rest, up for one lifted level. Measured in the pose the body was built in, whatever pose it's in
  // now.
  const cloth = joints.filter((joint) => joint.root);
  if (cloth.length) {
    const posed = [...figure.bones.values()].map((bone) => [bone, bone.quaternion.clone(), bone.position.clone()]);
    restPose(figure);
    const legs = ["l", "r"].flatMap((side) =>
      [
        [`thigh_${side}`, `calf_${side}`],
        [`calf_${side}`, `foot_${side}`],
      ].flatMap(([name, next]) => {
        const [bone, to] = [figure.bones.get(name), figure.bones.get(next)];
        return bone && to
          ? [{ bone, from: bone.getWorldPosition(new Vector3()), to: to.getWorldPosition(new Vector3()) }]
          : [];
      }),
    );
    for (const joint of cloth) {
      const tip = joint.child.clone().applyMatrix4(joint.bone.matrixWorld);
      // (Which way it hangs at rest, as the bone its chain hangs from sees it: where it's drawn back to, however
      // the joints above it are turned. Drawn back to its own bone's line, as a VRM app does, a skirt lifted at
      // the thigh would stand straight out from there down.)
      joint.hangs = tip
        .clone()
        .sub(joint.bone.getWorldPosition(new Vector3()))
        .normalize()
        .applyQuaternion(joint.root.parent.getWorldQuaternion(new Quaternion()).invert());
      // (Out from the body, for this chain: from the bone it hangs from to its root, level.)
      const out = joint.root.getWorldPosition(new Vector3()).sub(joint.root.parent.getWorldPosition(new Vector3()));
      out.setY(0).normalize();
      joint.carried = legs.flatMap(({ bone, from, to }) => {
        const span = line.copy(to).sub(from);
        const along = offset.copy(tip).sub(from).dot(span) / (span.lengthSq() || 1);
        const t = Math.max(0, Math.min(1, along));
        // (Beside the bone, not past its ends: cloth under the knee is the calf's to push, not the thigh's, or
        // a seated thigh, lying level, would lift the hem hanging under it up over itself.)
        const share = Math.max(0, 1 - (Math.max(0, along - 1, -along) * span.length()) / LEG_PAST);
        // (How thick the leg is, the thickest of its colliders as made, and how far out from its line the tip
        // rests. A tip that rests on the leg's inner side isn't this leg's to push out.)
        const made = joint.colliders.filter((each) => each.bone === bone).map((each) => each.full ?? each.radius);
        const radius = Math.max(0, ...made) || LEG_RADIUS;
        const rests = tip.clone().sub(from).addScaledVector(span, -t).dot(out);
        if (!share || rests < radius / 2) return [];
        const inverse = new Matrix4().copy(bone.matrixWorld).invert();
        return [
          {
            bone,
            out: out.clone().transformDirection(inverse),
            tail: to.clone().applyMatrix4(inverse),
            radius,
            share,
            // (How far off the leg's line it's kept: no further than it rests, so nothing is pushed while still.)
            clear: Math.min(radius + LEG_CLEAR, rests),
          },
        ];
      });
    }
    // (How far apart each pair of tied joints rests.)
    const tipOf = (joint) => joint.child.clone().applyMatrix4(joint.bone.matrixWorld);
    for (const ring of rings)
      for (const ties of ring.ties) for (const each of ties) each[2] = tipOf(each[0]).distanceTo(tipOf(each[1]));
    for (const [bone, turn_, place] of posed) {
      bone.quaternion.copy(turn_);
      bone.position.copy(place);
    }
    figure.root.updateMatrixWorld(true);
  }
  const gravity = new Vector3();
  function reset() {
    figure.root.updateMatrixWorld(true);
    for (const joint of joints) {
      const { bone } = joint;
      bone.quaternion.copy(joint.rest);
      if (joint.squashes) {
        bone.scale.setScalar(1);
        bone.position.copy(joint.restAt);
      }
      bone.updateMatrixWorld(true);
      joint.tip.copy(joint.child).applyMatrix4(bone.matrixWorld);
      joint.last.copy(joint.tip);
      joint.length = joint.tip.distanceTo(bone.getWorldPosition(a));
      joint.scale = joint.length / (joint.child.length() || 1);
    }
  }
  const keepLength = (joint) => joint.next.sub(joint.at).normalize().multiplyScalar(joint.length).add(joint.at);

  /** Where a joint's tip goes this frame left to itself (`joint.next`): carried on, drawn back and down. */
  function advance(joint, dt) {
    const { bone, settings, at, next } = joint;
    joint.initial.multiplyMatrices(bone.parent.matrixWorld, joint.local);
    at.setFromMatrixPosition(joint.initial); // (the joint, where its parent holds it)
    const rest = joint.aim.copy(joint.child).applyMatrix4(joint.initial).sub(at).normalize();
    if (joint.hangs) rest.copy(joint.hangs).applyQuaternion(joint.root.parent.getWorldQuaternion(facing));
    gravity.fromArray(settings.gravityDir).normalize();
    next
      .copy(joint.tip)
      .addScaledVector(c.copy(joint.tip).sub(joint.last), 1 - settings.dragForce)
      .addScaledVector(rest, settings.stiffness * dt)
      .addScaledVector(gravity, settings.gravityPower * dt);
    keepLength(joint);
    joint.free.copy(next);
    joint.held = false;
    // (Which way is out from the body for a chain of cloth: from the bone it hangs from to its root, level.)
    if (joint.root)
      joint.outward
        .setFromMatrixPosition(joint.root.matrixWorld)
        .sub(e.setFromMatrixPosition(joint.root.parent.matrixWorld))
        .setY(0)
        .normalize();
  }

  /** The tip kept out of what it meets: the legs that carry cloth (`carried`), and the colliders. */
  function hold(joint) {
    const { settings, at, next } = joint;
    const outward = joint.root && joint.outward.lengthSq() ? joint.outward : null;
    if (outward && joint.carried?.length) {
      // Clear of each leg it hangs over, the way that leg has turned "out": within the leg's own thickness to
      // either side of its line all of the way, easing to nothing over LEG_ASIDE further aside. (More than the
      // leg's thickness: the cloth between two chains is flat, and cuts into a leg that a chain only just
      // clears.)
      let need = 0;
      for (const { bone: leg, out, tail, radius, share, clear } of joint.carried) {
        c.copy(out).transformDirection(leg.matrixWorld);
        start.setFromMatrixPosition(leg.matrixWorld);
        line.copy(tail).applyMatrix4(leg.matrixWorld).sub(start);
        const t = Math.max(0, Math.min(1, offset.copy(next).sub(start).dot(line) / (line.lengthSq() || 1)));
        offset.copy(next).sub(start).addScaledVector(line, -t); // (from the leg's line to the tip)
        const over = offset.dot(c);
        const aside = Math.sqrt(Math.max(0, offset.lengthSq() - over * over));
        const beside = Math.max(0, Math.min(1, 1 - (aside - radius) / LEG_ASIDE));
        const by = (clear - over) * beside * beside * (3 - 2 * beside) * share;
        if (by > need) {
          need = by;
          d.copy(c);
        }
      }
      if (need > 0) {
        next.addScaledVector(d, need);
        keepLength(joint);
        joint.held = true;
      }
    }
    for (const collider of joint.colliders) {
      nearestOn(collider, next, d);
      const out = c.copy(next).sub(d);
      const gap = out.length() - collider.radius - settings.hitRadius;
      if (gap < 0) {
        out.normalize().multiplyScalar(-gap);
        // (A breast in the preview is pushed only across its bone, which turns it; a push along the bone is
        // left to `squash` below, where a VRM app slides the ball off sideways, however far it must turn.)
        if (joint.squashes) out.projectOnPlane(line.copy(next).sub(at).normalize());
        next.add(out);
        keepLength(joint);
      }
    }
  }

  /**
   * Two joints side by side in a piece of cloth kept no further apart than the cloth between them reaches
   * (`apart`, as they rest, and RING_STRETCH more): pushed out by a leg, a chain draws the ones beside it
   * after it, as a curtain pushed at one fold. What a leg holds stays where the leg put it, and the cloth
   * beside it comes to it; otherwise each comes half the way.
   */
  function tie(one, other, apart) {
    const gap = c.copy(other.next).sub(one.next);
    const far = gap.length();
    const over = far - apart * RING_STRETCH;
    if (over <= 0) return;
    gap.multiplyScalar(over / far);
    const share = one.held === other.held ? 0.5 : one.held ? 0 : 1;
    if (share) {
      one.next.addScaledVector(gap, share);
      keepLength(one);
    }
    if (share < 1) {
      other.next.addScaledVector(gap, share - 1);
      keepLength(other);
    }
  }

  /**
   * A row of cloth evened out round the piece: each joint's drift from where it would hang goes part of the way
   * (RING_EVEN) to the mean drift of the joints beside it. A leg lifting one chain then lifts the ones beside
   * it less, and the ones beside those less again, so the cloth takes a curve over the leg, not a corner.
   */
  function even(row) {
    for (const joint of row) joint.drift.copy(joint.next).sub(joint.at).addScaledVector(joint.aim, -joint.length);
    for (const joint of row) {
      if (!joint.beside.length) continue;
      c.set(0, 0, 0);
      for (const other of joint.beside) c.add(other.drift);
      d.copy(joint.drift).lerp(c.multiplyScalar(1 / joint.beside.length), RING_EVEN);
      joint.next.copy(joint.at).addScaledVector(joint.aim, joint.length).add(d);
      keepLength(joint);
    }
  }

  /** The joint's bone turned to its new tip, and the tip kept for the next frame. */
  function settle(joint) {
    const { bone, at, next } = joint;
    if (joint.squashes) {
      // (Turned TURN_MOST at most: pressed further, it is squashed instead.)
      const now = line.copy(next).sub(at).normalize();
      if (now.angleTo(joint.aim) > TURN_MOST) {
        const across = offset.copy(now).addScaledVector(joint.aim, -now.dot(joint.aim)).normalize();
        next.copy(at).addScaledVector(joint.aim, Math.cos(TURN_MOST) * joint.length);
        next.addScaledVector(across, Math.sin(TURN_MOST) * joint.length);
      }
    }
    // (Tied cloth carries on only as it would have left alone: what a leg, or the cloth beside it, moved it by
    // isn't carried on, or cloth a leg pushes would fly off it. A VRM's spring carries a collider's push on.)
    joint.last.copy(joint.tip);
    if (joint.beside.length) joint.last.add(next).sub(joint.free);
    joint.tip.copy(next);
    // The bone turned from its rest to point at the tip.
    back.copy(joint.initial).invert();
    turn.setFromUnitVectors(joint.axis, toward.copy(next).applyMatrix4(back).normalize());
    bone.quaternion.copy(joint.rest).multiply(turn);
    if (joint.squashes) squash(joint, next);
    bone.updateMatrix();
    bone.matrixWorld.multiplyMatrices(bone.parent.matrixWorld, bone.matrix);
    for (const child of bone.children) child.updateMatrixWorld(true);
  }

  function step(seconds) {
    const dt = Math.min(0.05, Math.max(0, seconds));
    if (!dt || !joints.length) return;
    figure.root.updateMatrixWorld(true);
    for (const joint of loose) {
      advance(joint, dt);
      hold(joint);
      settle(joint);
    }
    // A piece of cloth, row by row down from where it hangs: each row's joints moved, evened out with and
    // tied to the ones beside them, and kept off the legs again (the legs have the last word), then its bones
    // turned, which the row under it hangs from.
    for (const ring of rings)
      ring.rows.forEach((row, level) => {
        for (const joint of row) {
          advance(joint, dt);
          hold(joint);
        }
        for (let pass = 0; pass < RING_PASSES; pass++) {
          even(row);
          for (const [one, other, apart] of ring.ties[level]) tie(one, other, apart);
          for (const joint of row) hold(joint);
        }
        for (const joint of row) settle(joint);
      });
  }
  reset();
  return { step, reset, joints: joints.length };
}
