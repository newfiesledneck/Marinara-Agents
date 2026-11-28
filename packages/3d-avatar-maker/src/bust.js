// A bust that moves: a spring bone in each breast, as VRoid models have, so the chest sways a little as the
// body turns and settles, and an arm pressing on it pushes it up, aside or in. What's worn over it moves with
// it, so nothing clips.
//
// - Where (`findBust`, for each avatar, from its body as shaped): each breast's front-most point, between the
//   middle of the chest and the shoulder, and how far it stands out in front of the breastbone there; and the
//   ball that fills it best while staying under the skin (`ballIn`), which the arms press on.
// - Who: her body always; his only when his chest stands out as far as a small bust does (`BUST.least`), as
//   the Chest, Weight or a race's sliders can make it. A plain or muscular man's chest stays as it is.
// - The bones (`rigBust`): `breast_l` and `breast_r` under the middle chest (spine_02), from deep in the chest
//   to the middle of that ball, and a tip there (`breast_l_tip`). springs.js swings them, and keeps the ball
//   out of the arms' colliders: an arm pressing on it turns the bone, so the breast is pushed up or aside,
//   and in the maker's preview it is squashed in as well.
// - The weights (`bustWeights`): round each front, a share of a point's middle and upper chest weight
//   (spine_02 and spine_03) goes over onto its side's bone, all of it near the front and easing to none at
//   the edge. The skin and underwear take it from where they are; the clothes over them take the share of the
//   skin nearest them, so they move together.
// - Rest: the bones are placed where the body rests, so nothing moves until the chest does.
import { Bone, Matrix4, Quaternion, Vector3 } from "three";

/**
 * How a bust is found and weighted: `least` (metres a man's chest must stand out in front of his breastbone
 * to be given one), `reach` (metres round each breast's front that move with it, from the front, seen from
 * ahead), `full` (metres round the front that move with it wholly), `deep` (metres behind the front they
 * reach), `behind` (metres behind the ball's middle the bone turns from), `chest` (the bones whose weight
 * goes over: the middle and upper chest) and `parent` (the bones' parent, the middle chest, which most of
 * that weight is on).
 */
export const BUST = {
  least: 0.016,
  reach: 0.085,
  full: 0.03,
  deep: 0.07,
  behind: 0.1,
  chest: ["spine_02", "spine_03"],
  parent: "spine_02",
};

/**
 * The ball that fills a breast best and stays under the skin: { middle, radius }. Of the balls whose middles
 * lie round and behind its `front` (a coarse grid, then a fine one about the best), each as big as reaches
 * the nearest point of `around` (the skin about the breast, so it stays under that too), the one that leaves
 * least room between it and `breast` (the breast's own skin, in front of the breastbone). Both are points.
 */
export function ballIn(front, breast, around) {
  const place = new Vector3();
  let best = { gap: Infinity, middle: front.clone(), radius: 0.01 };
  const tryAt = (x, y, z) => {
    place.set(x, y, z);
    let radius = Infinity;
    for (const point of around) radius = Math.min(radius, place.distanceTo(point));
    let gap = 0;
    for (const point of breast) gap += place.distanceTo(point) - radius;
    if (radius > 0.01 && gap < best.gap) best = { gap, middle: place.clone(), radius };
  };
  for (let dx = -0.02; dx <= 0.0201; dx += 0.01)
    for (let dy = -0.06; dy <= 0.0201; dy += 0.01)
      for (let dz = 0.01; dz <= 0.1201; dz += 0.01) tryAt(front.x + dx, front.y + dy, front.z - dz);
  const coarse = best.middle.clone();
  for (let dx = -0.006; dx <= 0.0061; dx += 0.003)
    for (let dy = -0.006; dy <= 0.0061; dy += 0.003)
      for (let dz = -0.006; dz <= 0.0061; dz += 0.003) tryAt(coarse.x + dx, coarse.y + dy, coarse.z + dz);
  return { middle: best.middle, radius: best.radius };
}

const TRACE = 0.05; // a weight small enough to drop for the bust's bone
const SIDES = [
  ["l", 1],
  ["r", -1],
];

/**
 * The bust of a body as shaped: { sides: [{ side ("l" or "r"), front (its front-most point), out (how far it
 * stands out in front of the breastbone), middle and radius (its ball: ballIn) }] }, or null when it has none:
 * a man's chest that stands out less than BUST.least. `kit` is the body (avatar.js bodyKit), `position` its
 * points as shaped, and `sex` its body.
 */
export function findBust(kit, position, sex) {
  const { joints } = kit.file;
  const index = kit.shared.skinIndex.array;
  const weight = kit.shared.skinWeight.array;
  const chest = ["spine_03", "spine_02"].map((name) => joints.indexOf(name));
  const top = kit.spine.find(([bone]) => bone === "spine_03")?.[1];
  const low = kit.spine.find(([bone]) => bone === "spine_02")?.[1];
  if (top === undefined || low === undefined) return null;
  // The skin over the chest: mostly on the chest's bones, between the upper and middle chest's joints and a
  // little above.
  const onChest = (v) => {
    let own = 0;
    for (let c = 0; c < 4; c++) if (chest.includes(index[v * 4 + c])) own += weight[v * 4 + c];
    return own >= 0.5;
  };
  const skin = [];
  for (const mesh of kit.meshes) {
    if (mesh.piece || mesh.part !== "skin") continue;
    for (let v = mesh.start; v < mesh.start + mesh.count; v++) {
      const y = position[v * 3 + 1];
      if (y > low && y < top + 0.08 && onChest(v)) skin.push(v);
    }
  }
  const at = (v) => new Vector3().fromArray(position, v * 3);
  const sides = [];
  for (const [side, sign] of SIDES) {
    let front = null;
    for (const v of skin) {
      const x = position[v * 3] * sign;
      if (x > 0.04 && x < 0.17 && (!front || position[v * 3 + 2] > front.z)) front = at(v);
    }
    if (!front) return null;
    // (The breastbone in front, at the same height.)
    let bone = -Infinity;
    for (const v of skin)
      if (Math.abs(position[v * 3]) < 0.015 && Math.abs(position[v * 3 + 1] - front.y) < 0.025)
        bone = Math.max(bone, position[v * 3 + 2]);
    if (!Number.isFinite(bone)) return null;
    sides.push({ side, front, out: front.z - bone });
  }
  const out = Math.min(...sides.map((one) => one.out));
  if (sex !== "female" && out < BUST.least) return null;
  // Each breast's ball: under all the skin about it (within 14 cm), filling the breast's own skin, from the
  // front to where half of it moves with the bust (byPlace) and in front of the breastbone.
  const half = (BUST.full + BUST.reach) / 2;
  for (const one of sides) {
    const { front } = one;
    const around = [];
    const breast = [];
    for (const mesh of kit.meshes) {
      if (mesh.piece || mesh.part !== "skin") continue;
      for (let v = mesh.start; v < mesh.start + mesh.count; v++) {
        const point = at(v);
        if (point.distanceTo(front) > 0.14) continue;
        around.push(point);
        if (point.z > front.z - one.out && Math.hypot(point.x - front.x, point.y - front.y) < half) breast.push(point);
      }
    }
    Object.assign(one, ballIn(front, breast, around));
  }
  return { sides, out };
}

/** How much of a point at (x, y, z) moves with each side of `bust`: [left share, right share]. */
function sharesAt(bust, x, y, z) {
  return bust.sides.map(({ front }) => {
    // (In front of the chest only, seen from ahead: round the front, wholly near it and easing to the edge, and
    // easing out over the last 2 cm of BUST.deep, so a bust pushed far doesn't tear there.)
    const ease = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
    const d = Math.hypot(x - front.x, y - front.y);
    return ease((BUST.reach - d) / (BUST.reach - BUST.full)) * ease((z - front.z + BUST.deep) / 0.02);
  });
}

/**
 * How much of each point of the body (its points `position`, as shaped) moves with `bust`'s sides: (i, chest)
 * â†’ [side (0 left, 1 right), weight], `chest` being the point's weight on the chest's bones. Round each
 * breast's front, a share of that chest weight, from all of it near the front to none at the edge.
 */
export const byPlace = (bust, position) => (i, chest) => {
  const shares = sharesAt(bust, position[i * 3], position[i * 3 + 1], position[i * 3 + 2]);
  const side = shares[0] >= shares[1] ? 0 : 1;
  return [side, shares[side] * chest];
};

/**
 * The same for what's worn: each point takes the share the skin nearest it took (`near`, avatar.js
 * nearestSkin: four skin points a point, and how much each counts; `skin`, the body's bustWeights `shares`), so
 * a top and the breast under it move as one.
 */
export const byNearest = (skin, near) => (i, chest) => {
  const share = [0, 0];
  for (let n = 0; n < 4; n++) {
    const counts = near.shares[i * 4 + n];
    const id = near.ids[i * 4 + n];
    share[0] += counts * skin[0][id];
    share[1] += counts * skin[1][id];
  }
  const side = share[0] >= share[1] ? 0 : 1;
  return [side, Math.min(1, share[side]) * chest];
};

/**
 * The weights of a mesh (`index`, `weight`: four a point, naming `joints`) with some of its chest weight
 * (BUST.chest) moved onto the bust's bones, as `amountOf` says (byPlace for the body, byNearest for
 * what's worn). The bones are numbered from `first` (left, its tip, right, its tip). A point whose weights are
 * full (four bones) and on a bone in `still` (those stretched or moved for this avatar, which would move it at
 * rest) keeps its weights. { skinIndex, skinWeight (new arrays), shares ([left, right]: the share of each
 * point's chest weight that went onto each side) }, or null if nothing of it lies over the bust.
 */
export function bustWeights(index, weight, joints, first, amountOf, still = new Set()) {
  const chest = BUST.chest.map((name) => joints.indexOf(name)).filter((at) => at >= 0);
  if (!chest.length) return null;
  const count = index.length / 4;
  const skinIndex = Uint16Array.from(index);
  const skinWeight = Float32Array.from(weight);
  const shares = [new Float32Array(count), new Float32Array(count)];
  let changed = false;
  for (let i = 0; i < count; i++) {
    let own = 0;
    for (let c = 0; c < 4; c++) if (chest.includes(index[i * 4 + c])) own += weight[i * 4 + c];
    if (!own) continue;
    const [side, amount] = amountOf(i, own);
    if (amount < 1e-4) continue;
    const share = amount / own;
    for (let c = 0; c < 4; c++) if (chest.includes(skinIndex[i * 4 + c])) skinWeight[i * 4 + c] *= 1 - share;
    let moved = amount;
    // (Its bone takes an empty place; or, when none is left, the least one's if that one is a trace (dropping
    // more would change how the point bends as the arms move); or else, when it's on both chest bones, the
    // smaller one's, whose weight goes over to the other: it bends a little more with the middle chest or the
    // upper one, where left behind it would tear from the points about it as the bust moved. Dropping one a
    // stretch or a moved joint shapes would move it at rest, so then the point keeps its weights.)
    let place = -1;
    for (let c = 0; c < 4 && place < 0; c++) if (!skinWeight[i * 4 + c]) place = c;
    if (place < 0) {
      if ([0, 1, 2, 3].some((c) => still.has(joints[index[i * 4 + c]]))) {
        skinWeight.set(weight.subarray(i * 4, i * 4 + 4), i * 4);
        continue;
      }
      place = 0;
      for (let c = 1; c < 4; c++) if (skinWeight[i * 4 + c] < skinWeight[i * 4 + place]) place = c;
      const pair = [0, 1, 2, 3].filter((c) => chest.includes(skinIndex[i * 4 + c]));
      if (skinWeight[i * 4 + place] <= TRACE) {
        const total = 1 - skinWeight[i * 4 + place];
        for (let c = 0; c < 4; c++) skinWeight[i * 4 + c] /= total;
        moved /= total;
      } else if (pair.length === 2) {
        const [keep, give] = skinWeight[i * 4 + pair[0]] >= skinWeight[i * 4 + pair[1]] ? pair : [pair[1], pair[0]];
        skinWeight[i * 4 + keep] += skinWeight[i * 4 + give];
        place = give;
      } else {
        skinWeight.set(weight.subarray(i * 4, i * 4 + 4), i * 4);
        continue;
      }
    }
    skinIndex[i * 4 + place] = first + side * 2;
    skinWeight[i * 4 + place] = moved;
    shares[side][i] = share;
    changed = true;
  }
  return changed ? { skinIndex, skinWeight, shares } : null;
}

// (A bone's own axes as the bust's stand: y forward along the bone, x to the figure's left, z down.)
const FACING = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2);

/**
 * The bones for `bust` on one avatar, under its middle chest (`bones`, built, in the bind pose): each from
 * BUST.behind behind the middle of its breast's ball to that middle, and a tip there; each bone's own y axis
 * along it. { bones (left, its tip, right, its tip), inverses (each one's inverse bind matrix), springs:
 * [{ name, bones, radius (its ball's), squash }] }; the bones are added to `bones`.
 */
export function rigBust(bust, bones) {
  const chest = bones.get(BUST.parent);
  chest.updateMatrixWorld(true);
  const facing = chest.getWorldQuaternion(new Quaternion()).invert().multiply(FACING);
  const made = [];
  const springs = [];
  for (const { side, middle, radius } of bust.sides) {
    const base = new Bone();
    base.name = `breast_${side}`;
    base.userData.squashes = true; // (figure.js restPose puts its size back: springs.js squashes it)
    chest.add(base);
    base.position.copy(chest.worldToLocal(middle.clone().setZ(middle.z - BUST.behind)));
    base.quaternion.copy(facing);
    base.updateMatrixWorld(true);
    const tip = new Bone();
    tip.name = `breast_${side}_tip`;
    base.add(tip);
    tip.position.copy(base.worldToLocal(middle.clone()));
    tip.updateMatrixWorld(true);
    for (const bone of [base, tip]) bones.set(bone.name, bone);
    made.push(base, tip);
    springs.push({ name: `Bust (${side === "l" ? "left" : "right"})`, bones: [base, tip], radius, squash: true });
  }
  return { bones: made, inverses: made.map((bone) => new Matrix4().copy(bone.matrixWorld).invert()), springs };
}
