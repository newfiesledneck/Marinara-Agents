// Buttocks that move: a spring bone in each, made the way the bust's are (bust.js), so they shake a little
// as the hips move and are still again at once. Nothing changes at rest, in any pose.
//
// - Where (`findGlutes`, for each avatar of the kit's two bodies, from its body as shaped): the body's
//   "Buttocks" slider has a shape key that fills them out (`buttocks.hi`). The skin that key moves most is
//   the buttocks, so its middle, each point counted by how far the key moves it, is each buttock's middle, and
//   its rear-most point is how far back it reaches. (The Realistic body marks its own from its `glutes` key,
//   point by point: realistic-physics.js.)
// - The bones (`rigGlutes`): `glute_l` and `glute_r` under the hips (pelvis), each from 10 cm in front of its
//   buttock's middle, inside the body, back to that middle, with a tip there (`glute_l_tip`). springs.js
//   swings them. They meet no colliders.
// - The weights (`glutePlace`, into `gluteWeights`): round each middle, seen from behind, a share of a
//   point's weight on the hips' bone goes over onto its side's bone: all of it near the middle, easing to none
//   at the edge, at the cleft between them and towards the front of the hips. Only the hips' weight: about
//   two fifths of a buttock's weight is on the hips' bone and the rest on the thigh's, which stays, so the
//   buttocks still follow a leg as they did. The bone hangs from the hips, so with the spring at rest the
//   body bends as before, in any pose.
//   The skin and the body's own underwear take it from where they are; clothes take the share of the skin
//   nearest them (bust.js byNearest), so trousers and the buttocks under them move together.
// - Rest: the bones are placed where the body rests, so nothing moves until the hips do.
import { Bone, Matrix4, Vector3 } from "three";

/**
 * How the buttocks are found and weighted: `key` (the shape key that marks them on the kit's two bodies),
 * `core` (the share of that key's largest move a point must move to count as buttock), `reach` (metres round
 * each buttock's middle that move with it, seen from behind), `full` (metres round the middle that move with
 * it wholly), `deep` (metres in front of its rear-most point they reach), `cleft` (metres from the body's
 * middle over which they ease in), `ahead` (metres in front of the middle the bone turns from), `from` (the
 * bones whose weight goes over), `spare` (the bones a trace on which may go to those, to make room in a point
 * with four bones: gluteWeights) and `parent` (the bones' parent).
 */
export const GLUTES = {
  key: "buttocks.hi",
  core: 0.25,
  reach: 0.1,
  full: 0.04,
  deep: 0.08,
  cleft: 0.02,
  ahead: 0.1,
  from: ["pelvis"],
  spare: ["spine_01"],
  parent: "pelvis",
};

const SIDES = [
  ["l", 1],
  ["r", -1],
];
const ease = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

/** The skin's points the buttocks' key moves most, a list each side (left, right) of [point, how far], made once a body. */
function coreOf(kit) {
  if (kit.gluteCore === undefined) {
    const skin = new Uint8Array(kit.position.length / 3);
    for (const mesh of kit.meshes)
      if (!mesh.piece && mesh.part === "skin") skin.fill(1, mesh.start, mesh.start + mesh.count);
    const moved = [];
    let most = 0;
    for (const { ids, delta } of kit.morphs[GLUTES.key] ?? [])
      for (let i = 0; i < ids.length; i++) {
        if (!skin[ids[i]]) continue;
        const far = Math.hypot(delta[i * 3], delta[i * 3 + 1], delta[i * 3 + 2]);
        moved.push([ids[i], far]);
        most = Math.max(most, far);
      }
    const core = moved.filter(([, far]) => far >= most * GLUTES.core);
    const sides = SIDES.map(([, sign]) => core.filter(([v]) => kit.position[v * 3] * sign > 0));
    kit.gluteCore = sides.every((side) => side.length) ? sides : null;
  }
  return kit.gluteCore;
}

/**
 * The buttocks of a body as shaped: { sides: [{ side ("l" or "r"), sign (+1 left, -1 right), middle (its
 * middle, at its rear-most) }] }, or null for a body whose file has no key for them. `kit` is the body
 * (avatar.js bodyKit) and `position` its points as shaped.
 */
export function findGlutes(kit, position) {
  const core = coreOf(kit);
  if (!core) return null;
  const sides = SIDES.map(([side, sign], s) => {
    const middle = new Vector3();
    let total = 0;
    let rear = Infinity;
    for (const [v, far] of core[s]) {
      middle.x += position[v * 3] * far;
      middle.y += position[v * 3 + 1] * far;
      total += far;
      rear = Math.min(rear, position[v * 3 + 2]);
    }
    return { side, sign, middle: middle.divideScalar(total).setZ(rear) };
  });
  return { sides };
}

/**
 * How much of each point of the body (its points `position`, as shaped) moves with the buttocks `found`
 * (findGlutes): (i, hips) → [side (0 left, 1 right), weight], `hips` being the point's weight on the hips'
 * bone. For gluteWeights.
 */
export const glutePlace = (found, position) => (i, hips) => {
  const [x, y, z] = [position[i * 3], position[i * 3 + 1], position[i * 3 + 2]];
  const shares = found.sides.map(
    ({ sign, middle }) =>
      ease((GLUTES.reach - Math.hypot(x - middle.x, y - middle.y)) / (GLUTES.reach - GLUTES.full)) *
      ease((middle.z + GLUTES.deep - z) / 0.02) *
      ease((x * sign) / GLUTES.cleft),
  );
  const side = shares[0] >= shares[1] ? 0 : 1;
  return [side, shares[side] * hips];
};

const TRACE = 0.05; // a weight small enough to give to the hips' bone, to make room for a buttock's

/**
 * The weights of a mesh (`index`, `weight`: four a point, naming `joints`) with some of its weight on the bones
 * `from` moved onto the buttocks' bones, as `amountOf` says: (i, own) → [side (0 left, 1 right), weight], `own`
 * being point i's weight on `from` (glutePlace for the body, bust.js byNearest for what's worn). The bones are
 * numbered from `first` (left, its tip, right, its tip). { skinIndex, skinWeight (new arrays), shares ([left,
 * right]: the share of each point's `from` weight that went onto each side) }, or null if nothing of it lies
 * over the buttocks.
 *
 * Nothing here moves a point at rest, in any pose: weight only goes from a bone to a bone that hangs from it.
 * So a point that has four bones already isn't made room in by dropping its least one, as the bust's are
 * (bust.js bustWeights): on a buttock that is often the other leg's thigh, and a twentieth of a point going
 * with the wrong leg dents the skin by millimetres mid-stride. Instead:
 * - a trace it has on a bone in `spare` (the lowest back bone, which moves with the hips but for a slight
 *   bend) goes to the `from` bone, and the buttock's bone takes its place;
 * - failing that, the buttock's bone takes the `from` bone's place whole when at least half of that weight was
 *   to go over, and the point keeps its weights when less was. Such a point moves a little more or less than
 *   the points about it (by under a millimetre in a dance), and only while the buttock shakes.
 */
export function gluteWeights(index, weight, joints, first, amountOf, from = GLUTES.from, spare = GLUTES.spare) {
  const sources = from.map((name) => joints.indexOf(name)).filter((at) => at >= 0);
  if (!sources.length) return null;
  const spares = spare.map((name) => joints.indexOf(name)).filter((at) => at >= 0);
  const count = index.length / 4;
  const skinIndex = Uint16Array.from(index);
  const skinWeight = Float32Array.from(weight);
  const shares = [new Float32Array(count), new Float32Array(count)];
  let changed = false;
  for (let i = 0; i < count; i++) {
    const at = i * 4;
    let own = 0;
    let most = -1; // (the place of the `from` bone it's most on)
    for (let c = 0; c < 4; c++)
      if (sources.includes(index[at + c]) && weight[at + c] > 0) {
        own += weight[at + c];
        if (most < 0 || weight[at + c] > weight[at + most]) most = c;
      }
    if (!own) continue;
    const [side, amount] = amountOf(i, own);
    if (amount < 1e-4) continue;
    let share = Math.min(1, amount / own);
    let place = -1;
    for (let c = 0; c < 4 && place < 0; c++) if (!weight[at + c]) place = c;
    let trace = -1;
    if (place < 0) {
      for (let c = 0; c < 4; c++)
        if (
          spares.includes(index[at + c]) &&
          weight[at + c] <= TRACE &&
          (trace < 0 || weight[at + c] < weight[at + trace])
        )
          trace = c;
      if (trace >= 0) place = trace;
      else if (share >= 0.5) {
        share = 1;
        place = most;
      } else continue;
    }
    for (let c = 0; c < 4; c++) if (sources.includes(index[at + c])) skinWeight[at + c] *= 1 - share;
    if (trace >= 0) skinWeight[at + most] += weight[at + trace];
    skinIndex[at + place] = first + side * 2;
    skinWeight[at + place] = own * share;
    shares[side][i] = share;
    changed = true;
  }
  return changed ? { skinIndex, skinWeight, shares } : null;
}

/**
 * The bones for the buttocks `found` on one avatar, under its hips (`bones`, built, in the bind pose): each
 * from GLUTES.ahead in front of its buttock's middle to that middle, and a tip there. { bones (left, its tip,
 * right, its tip: the order bustWeights numbers them in), inverses (each one's inverse bind matrix), springs:
 * [{ name, bones }] }; the bones are added to `bones`. `parentOf` names the bone each side's hangs from, where
 * that isn't the hips: on the Realistic body the buttocks' weight is on the thighs (realistic-physics.js).
 */
export function rigGlutes(found, bones, parentOf = () => GLUTES.parent) {
  const made = [];
  const springs = [];
  for (const { side, middle } of found.sides) {
    const hips = bones.get(parentOf(side));
    hips.updateMatrixWorld(true);
    const base = new Bone();
    base.name = `glute_${side}`;
    hips.add(base);
    base.position.copy(hips.worldToLocal(middle.clone().setZ(middle.z + GLUTES.ahead)));
    base.updateMatrixWorld(true);
    const tip = new Bone();
    tip.name = `glute_${side}_tip`;
    base.add(tip);
    tip.position.copy(base.worldToLocal(middle.clone()));
    tip.updateMatrixWorld(true);
    for (const bone of [base, tip]) bones.set(bone.name, bone);
    made.push(base, tip);
    springs.push({ name: `Buttock (${side === "l" ? "left" : "right"})`, bones: [base, tip] });
  }
  return { bones: made, inverses: made.map((bone) => new Matrix4().copy(bone.matrixWorld).invert()), springs };
}
