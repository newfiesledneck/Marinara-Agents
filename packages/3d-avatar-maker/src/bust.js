// A bust that moves: a short spring bone in each breast, as VRoid models have, so the chest sways a little as
// the body turns and settles. What's worn over it moves with it, so nothing clips.
//
// - Where (`findBust`, for each avatar, from its body as shaped): each breast's front-most point, between the
//   middle of the chest and the shoulder, and how far it stands out in front of the breastbone there.
// - Who: her body always; his only when his chest stands out as far as a small bust does (`BUST.least`), as
//   the Chest, Weight or a race's sliders can make it. A plain or muscular man's chest stays as it is.
// - The bones (`rigBust`): `breast_l` and `breast_r` under the upper chest (spine_03), from inside the chest
//   to the front of each breast, and a tip at the front (`breast_l_tip`). springs.js swings them.
// - The weights (`bustWeights`): round each front, a share of a point's upper-chest weight (spine_03, the
//   bones' parent) goes over onto its side's bone, all of it near the front and easing to none at the edge.
//   The skin and underwear take it from where they are; the clothes over them take the share of the skin
//   nearest them, so they move together.
// - Rest: the bones are placed where the body rests, so nothing moves until the chest does.
import { Bone, Matrix4, Vector3 } from "three";

/**
 * How a bust is found and weighted: `least` (metres a man's chest must stand out in front of his breastbone
 * to be given one), `reach` (metres round each breast's front that move with it, from the front, seen from
 * ahead), `full` (metres round the front that move with it wholly), `behind` (metres behind the front the
 * bone turns from), and `chest` (the bone whose weight goes over: the upper chest, the bones' own parent, so
 * with the bust at rest everything bends with the body as it did).
 */
export const BUST = { least: 0.016, reach: 0.085, full: 0.03, behind: 0.07, chest: "spine_03" };
const TRACE = 0.05; // a weight small enough to drop for the bust's bone
const SIDES = [
  ["l", 1],
  ["r", -1],
];

/**
 * The bust of a body as shaped: { sides: [{ side ("l" or "r"), front (its front-most point), out (how far it
 * stands out in front of the breastbone) }] }, or null when it has none: a man's chest that stands out less
 * than BUST.least. `kit` is the body (avatar.js bodyKit), `position` its points as shaped, and `sex` its body.
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
  return { sides, out };
}

/** How much of a point at (x, y, z) moves with each side of `bust`: [left share, right share]. */
function sharesAt(bust, x, y, z) {
  return bust.sides.map(({ front }) => {
    // (In front of the chest only, seen from ahead: round the front, wholly near it and easing to the edge.)
    if (z < front.z - BUST.behind) return 0;
    const d = Math.hypot(x - front.x, y - front.y);
    const t = Math.max(0, Math.min(1, (BUST.reach - d) / (BUST.reach - BUST.full)));
    return t * t * (3 - 2 * t);
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
 * The weights of a mesh (`index`, `weight`: four a point, naming `joints`) with some of its upper-chest weight
 * (BUST.chest) moved onto the bust's bones, as `amountOf` says (byPlace for the body, byNearest for
 * what's worn). The bones are numbered from `first` (left, its tip, right, its tip). A point whose weights are
 * full (four bones) and on a bone in `still` (those stretched or moved for this avatar, which would move it at
 * rest) keeps its weights. { skinIndex, skinWeight (new arrays), shares ([left, right]: the share of each
 * point's upper-chest weight that went onto each side) }, or null if nothing of it lies over the bust.
 */
export function bustWeights(index, weight, joints, first, amountOf, still = new Set()) {
  const chest = joints.indexOf(BUST.chest);
  if (chest < 0) return null;
  const count = index.length / 4;
  const skinIndex = Uint16Array.from(index);
  const skinWeight = Float32Array.from(weight);
  const shares = [new Float32Array(count), new Float32Array(count)];
  let changed = false;
  for (let i = 0; i < count; i++) {
    let own = 0;
    for (let c = 0; c < 4; c++) if (index[i * 4 + c] === chest) own += weight[i * 4 + c];
    if (!own) continue;
    const [side, amount] = amountOf(i, own);
    if (amount < 1e-4) continue;
    const share = amount / own;
    for (let c = 0; c < 4; c++) if (skinIndex[i * 4 + c] === chest) skinWeight[i * 4 + c] *= 1 - share;
    let moved = amount;
    // (Its bone takes an empty place, or the least one's when none is left and that one is a trace: dropping
    // more would change how the point bends as the arms move, and dropping one a stretch or a moved joint
    // shapes would move it at rest. Otherwise the point keeps its weights.)
    let place = -1;
    for (let c = 0; c < 4 && place < 0; c++) if (!skinWeight[i * 4 + c]) place = c;
    if (place < 0) {
      place = 0;
      for (let c = 1; c < 4; c++) if (skinWeight[i * 4 + c] < skinWeight[i * 4 + place]) place = c;
      if (skinWeight[i * 4 + place] > TRACE || [0, 1, 2, 3].some((c) => still.has(joints[index[i * 4 + c]]))) {
        skinWeight.set(weight.subarray(i * 4, i * 4 + 4), i * 4);
        continue;
      }
      const total = 1 - skinWeight[i * 4 + place];
      for (let c = 0; c < 4; c++) skinWeight[i * 4 + c] /= total;
      moved /= total;
    }
    skinIndex[i * 4 + place] = first + side * 2;
    skinWeight[i * 4 + place] = moved;
    shares[side][i] = share;
    changed = true;
  }
  return changed ? { skinIndex, skinWeight, shares } : null;
}

/**
 * The bones for `bust` on one avatar, under its upper chest (`bones`, built, in the bind pose): each from
 * BUST.behind inside its breast to its front, and a tip there. { bones (left, its tip, right, its tip),
 * inverses (each one's inverse bind matrix), springs: [{ name, bones }] }; the bones are added to `bones`.
 */
export function rigBust(bust, bones) {
  const chest = bones.get("spine_03");
  chest.updateMatrixWorld(true);
  const made = [];
  const springs = [];
  for (const { side, front } of bust.sides) {
    const base = new Bone();
    base.name = `breast_${side}`;
    chest.add(base);
    base.position.copy(chest.worldToLocal(front.clone().setZ(front.z - BUST.behind)));
    base.updateMatrixWorld(true);
    const tip = new Bone();
    tip.name = `breast_${side}_tip`;
    base.add(tip);
    tip.position.copy(base.worldToLocal(front.clone()));
    tip.updateMatrixWorld(true);
    for (const bone of [base, tip]) bones.set(bone.name, bone);
    made.push(base, tip);
    springs.push({ name: `Bust (${side === "l" ? "left" : "right"})`, bones: [base, tip] });
  }
  return { bones: made, inverses: made.map((bone) => new Matrix4().copy(bone.matrixWorld).invert()), springs };
}
