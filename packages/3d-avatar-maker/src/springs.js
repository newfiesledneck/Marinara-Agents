// Spring bones: the hair's and clothes' chains (hair.js), the bust (bust.js) and a tail, swinging as the body
// moves, kept out of the body by colliders. The settings and colliders are VRM 1.0's (`VRMC_springBone`): the
// saved VRM carries them (exporter.js), and the preview swings them here the way three-vrm (the Engine's VRM
// model) does, so what the maker shows is what a VRM app shows.
import { Matrix4, Quaternion, Vector3 } from "three";
import { tPose, restPose } from "./figure.js";

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
 * so it sways a few millimetres as the body turns and settles within a second, never wobbling.
 */
export const BUST_JOINT = {
  hitRadius: 0.01,
  stiffness: 1.5,
  gravityPower: 0,
  gravityDir: [0, -1, 0],
  dragForce: 0.45,
};
export const TAIL_BONES = ["tail_01", "tail_02", "tail_03", "tail_04", "tail_05"];
const LEG_RADIUS = 0.07; // metres: the legs' colliders, so a swinging tail stays outside the thighs
const CLEAR = 0.005; // metres a collider stays clear of a joint at rest, so nothing is pushed while still

/**
 * The colliders a body's springs meet: { body: [...] (the hair's), legs: [...] (a tail's), cloth: [...] (the
 * clothes') }. Each is { bone, radius, offset (a point in the bone's own space), tail (one too, for a capsule) }.
 * They're fitted to the body as shaped (`position`, the body's points; `kit`, its file, avatar.js bodyKit), in
 * the bind pose:
 * - the head a ball, and the neck, collarbones and upper arms capsules along them;
 * - the hips, waist, chest and back a capsule across the body at each spine bone, as deep as it is there;
 * - for cloth, those of the hips and back again (their own, fitted to the cloth), and the thighs and calves
 *   capsules along them, as thick as the leg is there.
 * Each sits inside the body, so what rests on it isn't pushed.
 */
export function bodyColliders(kit, position, bones) {
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
  const along = (into, name, next, scale = 0.85) => {
    const [bone, a, b, points] = [bones.get(name), at(name), at(next), by.get(name)];
    if (!bone || !a || !b || !points?.length) return;
    into.push({ bone, radius: reach(points, a, b) * scale, offset: local(bone, a), tail: local(bone, b) });
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
  // The cloth's: the hips and back, and each thigh and calf.
  const cloth = body
    .filter((collider) => collider.tail && /^(?:pelvis|spine_0[123])$/u.test(collider.bone.name))
    .map((collider) => ({ ...collider, offset: collider.offset.clone(), tail: collider.tail.clone() }));
  // (A leg's may shrink by half to fit, not a quarter: cloth that lies on the thigh, a tight robe's sides,
  // should still be kept out of it.)
  for (const side of ["l", "r"]) {
    along(cloth, `thigh_${side}`, `calf_${side}`);
    along(cloth, `calf_${side}`, `foot_${side}`);
  }
  for (const collider of cloth) if (/^(?:thigh|calf)_/u.test(collider.bone.name)) collider.least = 0.5;
  return { body, legs, cloth };
}

const a = new Vector3();
const b = new Vector3();
const c = new Vector3();
const d = new Vector3();
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
 * The colliders fitted so that none pushes the hair, clothes or tail while nothing moves, in the poses the
 * figure rests in (as built, and the T-pose a VRM rests in): each made a little smaller where a joint rests
 * close to it (by a quarter at most, or its own `least` share), and where a joint rests on one even so (a lock
 * lying on the shoulder), that spring meets it no more. Each spring's `colliders` are what it meets.
 */
export function fitColliders(figure) {
  const poses = [restPose, tPose];
  /** How far each spring's joints are from a collider's surface, at their nearest, in every pose. */
  const gaps = new Map(); // collider → spring → gap
  for (const pose of poses) {
    pose(figure);
    for (const spring of figure.springs)
      for (const collider of spring.colliders) {
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

/**
 * The figure's springs swinging: { step(seconds), reset() }. Call `step` each frame after the pose is set:
 * it turns the spring bones from where their tips were, as three-vrm does (VRM 1.0's springs: the tip carried
 * on by its own motion less the drag, pulled back by stiffness and down by gravity, kept its length, and
 * pushed out of the colliders). `reset` puts them back at rest on the body as it now stands.
 */
export function createSprings(figure) {
  const joints = [];
  for (const spring of figure.springs ?? []) {
    const { colliders } = spring;
    spring.bones.slice(0, -1).forEach((bone, i) => {
      bone.quaternion.copy(figure.rest.get(bone.name) ?? bone.quaternion);
      bone.updateMatrix();
      const child = spring.bones[i + 1].position.clone(); // (where the next joint is, in this bone's space)
      joints.push({
        bone,
        settings: spring.joint,
        colliders,
        local: bone.matrix.clone(),
        rest: bone.quaternion.clone(),
        child,
        axis: child.clone().normalize(),
        length: 0,
        tip: new Vector3(),
        last: new Vector3(),
      });
    });
  }
  const gravity = new Vector3();
  function reset() {
    figure.root.updateMatrixWorld(true);
    for (const joint of joints) {
      const { bone } = joint;
      bone.quaternion.copy(joint.rest);
      bone.updateMatrixWorld(true);
      joint.tip.copy(joint.child).applyMatrix4(bone.matrixWorld);
      joint.last.copy(joint.tip);
      joint.length = joint.tip.distanceTo(bone.getWorldPosition(a));
    }
  }
  function step(seconds) {
    const dt = Math.min(0.05, Math.max(0, seconds));
    if (!dt || !joints.length) return;
    figure.root.updateMatrixWorld(true);
    for (const joint of joints) {
      const { bone, settings } = joint;
      const parent = bone.parent.matrixWorld;
      initial.multiplyMatrices(parent, joint.local);
      const at = a.setFromMatrixPosition(initial); // (the joint, where its parent holds it)
      const rest = toward.copy(joint.child).applyMatrix4(initial).sub(at).normalize();
      gravity.fromArray(settings.gravityDir).normalize();
      const next = b
        .copy(joint.tip)
        .addScaledVector(c.copy(joint.tip).sub(joint.last), 1 - settings.dragForce)
        .addScaledVector(rest, settings.stiffness * dt)
        .addScaledVector(gravity, settings.gravityPower * dt);
      next.sub(at).normalize().multiplyScalar(joint.length).add(at);
      for (const collider of joint.colliders) {
        nearestOn(collider, next, d);
        const out = c.copy(next).sub(d);
        const gap = out.length() - collider.radius - settings.hitRadius;
        if (gap < 0) {
          next.addScaledVector(out.normalize(), -gap);
          next.sub(at).normalize().multiplyScalar(joint.length).add(at);
        }
      }
      joint.last.copy(joint.tip);
      joint.tip.copy(next);
      // The bone turned from its rest to point at the tip.
      back.copy(initial).invert();
      turn.setFromUnitVectors(joint.axis, toward.copy(next).applyMatrix4(back).normalize());
      bone.quaternion.copy(joint.rest).multiply(turn);
      bone.updateMatrix();
      bone.matrixWorld.multiplyMatrices(parent, bone.matrix);
      for (const child of bone.children) child.updateMatrixWorld(true);
    }
  }
  reset();
  return { step, reset, joints: joints.length };
}
