// The Realistic body's parts that move on springs (realistic.js builds the body; springs.js swings them):
// its strand hair, a bone in each breast and a bone in each buttock. Each has a switch and an amount in the
// look (physics.js); with a part off, none of its bones or springs are made.
//
// - Hair (`hairPlanOf`, once a style). Each style is thousands of separate ribbons, one a strand, rooted on
//   the scalp. A strand's points are known in order from its root, so each has a place along it: how far
//   along the strand it is from where the strand leaves the head (the first point under the hang line, a
//   little below the eyes, or its root when that is lower, at the nape). A strand hangs from one side of the
//   head, where the middle of its hanging part is. From there on hair.js does what it does for the other
//   bodies' hair (`hangPlan`): a chain of bones down each side with enough hanging from it, and every point
//   weighted to its side's chain by how far along its strand it is, easing in from the head. So the roots
//   stay on the scalp, a short style has no chains or short ones, and a long one swings. The plan depends on
//   the style alone and is kept; each avatar only places the chains' bones in its own hair (`rigChains`).
// - Bust (`findBust`, each avatar). The `breasts` shape key marks the breasts point by point: the further
//   the key moves a point, the more of it is breast (`maskOf`). The gender key's bust, on a female build with
//   that slider at 0, lies on the same points (four fifths of the chest points that key pushes forward are
//   marked at 0.4 or more), so the one mask serves both. Whether a build has a bust at all is measured: its
//   front-most marked point must stand out in front of the breastbone (`SOFT.bust.least`) on the body as
//   shaped, and also on the body as the gender and breasts keys alone shape it. A female build's does, a male
//   build's flat chest doesn't, and neither does a muscular male build's, whose chest stands out but not by
//   either of those keys. Then a bone in each breast under the middle chest, as bust.js makes them for the
//   other bodies, its ball pushed by the arms, and a share of each marked point's chest weight onto it
//   (bust.js bustWeights).
// - Buttocks. The `glutes` key marks them the same way. On this body nearly all of a buttock's weight is on
//   its thigh's bone (the other bodies' is shared with the hips), so each buttock's bone hangs from its own
//   thigh (glutes.js rigGlutes) and takes a share of each marked point's weight on that thigh. With the
//   spring at rest the bone is fixed to the thigh, so the body bends exactly as before in every pose.
// - Colliders (`finish`): the head, neck, shoulders, upper arms and trunk for the hair, and the arms and hands
//   for the bust, fitted to the body as shaped by springs.js bodyColliders, which is handed this body's skin
//   in the form it reads the other bodies' in.
// Everything is bound where the body rests: nothing moves until the body does.
import { Box3, BufferAttribute, Matrix4, Skeleton, Uint16BufferAttribute, Vector3 } from "three";
import { ballIn, BUST, bustWeights, rigBust } from "./bust.js";
import { gluteWeights, rigGlutes } from "./glutes.js";
import { HAIR, hangPlan, rigChains } from "./hair.js";
import { jointAt } from "./physics.js";
import { bodyColliders, BUST_JOINT, fitColliders, GLUTE_JOINT, HAIR_JOINT } from "./springs.js";

/**
 * How the bust and buttocks are marked and weighted. For each: `key` (the shape key whose moves mark it),
 * `none` and `all` (the shares of the key's largest move at which a point is none of it, and all of it; eased
 * between) and `core` (the mark from which a point counts in finding its middle). The bust's `least` (metres
 * its front must stand out in front of the breastbone for a build to have one; its weight comes from the
 * chest's bones, as bust.js has it). The buttocks' `parent` (the bone each side's hangs from and takes its weight
 * from: its thigh) and `joint` (its spring's settings). `cleft`: metres from the body's middle over which both
 * ease in, so the two sides never pull on the same point.
 */
export const SOFT = {
  bust: { key: "breasts", none: 0.35, all: 0.8, core: 0.5, least: 0.008 },
  butt: {
    key: "glutes",
    none: 0.2,
    all: 0.7,
    core: 0.5,
    parent: (side) => `thigh_${side}`,
    // (Stiffer than the other bodies': hung from the thigh, which swings further than the hips do, and with
    // all of a point's weight where theirs have two fifths. Its skin moves about 4 mm in a walk.)
    joint: { ...GLUTE_JOINT, stiffness: 8, dragForce: 0.2 },
  },
  cleft: 0.02,
};
/** The shape keys that give a build a bust: the female side of the first slider, and the breasts' own. */
const BUST_KEYS = ["gender", "breasts"];
/** How far below the eyes this body's hair leaves the head to hang (metres), as hair.js has it for the others. */
const HAIR_BELOW = 0.03;
const SCALP_CELL = 0.02; // metres: the cells the scalp is sorted into, to tell a strand's root from its tip
const COLLIDER_EVERY = 3; // every which point of the skin the colliders are fitted to (skinKitOf)
const BAND_EVERY = 8; // every which point of a chain's band its joint is placed by (hairPlanOf)

const ease = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
const isSkin = (mesh) => !mesh.piece && mesh.part.startsWith("skin_");

const masks = new WeakMap(); // a body (realistic.js bodyKit) → { bust, butt }: each a Map of mesh → { mark, side }
/**
 * Where `part` ("bust" or "butt") is on the body's skin, made once: for each skin mesh its key moves, each
 * point's `mark` (0 none of it, 1 all of it) and `side` (0 the figure's left, 1 its right).
 */
function maskOf(body, part) {
  if (!masks.has(body)) masks.set(body, {});
  const kept = masks.get(body);
  if (!kept[part]) {
    const { key, none, all } = SOFT[part];
    const skins = body.meshes.filter((mesh) => isSkin(mesh) && mesh.morphs[key]);
    const sizeOf = ({ delta }, i) => Math.hypot(delta[i * 3], delta[i * 3 + 1], delta[i * 3 + 2]);
    let most = 0;
    for (const mesh of skins)
      for (let i = 0; i < mesh.morphs[key].ids.length; i++) most = Math.max(most, sizeOf(mesh.morphs[key], i));
    const mask = new Map();
    for (const mesh of skins) {
      const count = mesh.position.length / 3;
      const mark = new Float32Array(count);
      const side = new Uint8Array(count);
      const moves = mesh.morphs[key];
      let any = false;
      for (let i = 0; i < moves.ids.length; i++) {
        const v = moves.ids[i];
        const x = mesh.position[v * 3];
        mark[v] = ease((sizeOf(moves, i) / (most || 1) - none) / (all - none)) * ease(Math.abs(x) / SOFT.cleft);
        side[v] = x >= 0 ? 0 : 1;
        any ||= mark[v] > 0;
      }
      if (any) mask.set(mesh, { mark, side });
    }
    kept[part] = mask;
  }
  return kept[part];
}

/** A body mesh's points with the sliders worked in (realistic.js `shaped`, without the normals). */
function positionsOf(mesh, weights) {
  const position = mesh.position.slice();
  for (const [key, weight] of Object.entries(weights)) {
    const own = mesh.morphs[key];
    if (!own) continue;
    for (let i = 0; i < own.ids.length; i++)
      for (let c = 0; c < 3; c++) position[own.ids[i] * 3 + c] += own.delta[i * 3 + c] * weight;
  }
  return position;
}

/** The marked points of `mask` that count in finding a part's middle, each side's in a list: [x, y, z, mark]. */
function coreOf(mask, at, least) {
  const sides = [[], []];
  for (const [mesh, { mark, side }] of mask) {
    const position = at(mesh);
    for (let v = 0; v < mark.length; v++)
      if (mark[v] >= least) sides[side[v]].push([position[v * 3], position[v * 3 + 1], position[v * 3 + 2], mark[v]]);
  }
  return sides;
}

/**
 * How far the marked chest stands out on a body whose meshes' points `at` gives: { sides: [{ side, front (its
 * front-most marked point), out (metres that is in front of the breastbone at its height) }], out (the lesser
 * side's), points (the marked meshes' points) }, or null if nothing is marked. bust.js findBust measures the
 * other bodies' the same way.
 */
function standsOut(mask, at) {
  const core = coreOf(mask, at, SOFT.bust.core);
  if (core.some((side) => !side.length)) return null;
  const points = [...mask.keys()].map(at);
  const sides = [];
  for (const [s, side] of ["l", "r"].entries()) {
    const [x, y, z] = core[s].reduce((best, point) => (point[2] > best[2] ? point : best));
    let bone = -Infinity;
    for (const position of points)
      for (let v = 0; v < position.length; v += 3)
        if (Math.abs(position[v]) < 0.015 && Math.abs(position[v + 1] - y) < 0.025)
          bone = Math.max(bone, position[v + 2]);
    if (!Number.isFinite(bone)) return null;
    sides.push({ side, front: new Vector3(x, y, z), out: z - bone });
  }
  return { sides, out: Math.min(...sides.map((one) => one.out)), points };
}

/**
 * The bust of a body as shaped, in the form bust.js rigBust takes: { sides: [{ side, front, out, middle,
 * radius }], out }, or null for a build without one. `mask` is maskOf's for the bust, `at` gives a mesh's
 * points as shaped, and `grown` its points with the gender and breasts keys alone worked in.
 *
 * A build has a bust when its marked chest stands out in front of the breastbone by SOFT.bust.least both as
 * shaped and as those two keys alone shape it. The second is what tells a bust from a chest: a muscular male
 * build's chest stands out further than a female build's does with the breasts slider at 0 (17 mm against
 * 11), but muscle isn't a bust, and neither key gives him one. The first leaves out a female build the Thin
 * slider has flattened.
 */
function findBust(mask, at, grown) {
  const shaped = standsOut(mask, at);
  if (!shaped || shaped.out < SOFT.bust.least) return null;
  if ((standsOut(mask, grown)?.out ?? 0) < SOFT.bust.least) return null;
  // Each breast's ball, which the arms press on: under the skin about it, filling the breast's own (bust.js).
  const half = (BUST.full + BUST.reach) / 2;
  const around = [];
  const breast = [];
  for (const one of shaped.sides) {
    const { front } = one;
    around.length = 0;
    breast.length = 0;
    for (const position of shaped.points)
      for (let v = 0; v < position.length; v += 3) {
        const [x, y, z] = [position[v], position[v + 1], position[v + 2]];
        if (Math.hypot(x - front.x, y - front.y, z - front.z) > 0.14) continue;
        const point = new Vector3(x, y, z);
        around.push(point);
        if (z > front.z - one.out && Math.hypot(x - front.x, y - front.y) < half) breast.push(point);
      }
    Object.assign(one, ballIn(front, breast, around));
  }
  return { sides: shaped.sides, out: shaped.out };
}

/** The buttocks of a body as shaped, in the form glutes.js rigGlutes takes: { sides: [{ side, middle }] }, or null. */
function findGlutes(mask, at) {
  const core = coreOf(mask, at, SOFT.butt.core);
  if (core.some((side) => !side.length)) return null;
  const sides = ["l", "r"].map((side, s) => {
    const middle = new Vector3();
    let total = 0;
    let rear = Infinity;
    for (const [x, y, z, mark] of core[s]) {
      middle.x += x * mark;
      middle.y += y * mark;
      total += mark;
      rear = Math.min(rear, z);
    }
    return { side, middle: middle.divideScalar(total).setZ(rear) };
  });
  return { sides };
}

/**
 * For each point of a strand hair mesh (`mesh`, a hair style's as realistic.js hairKit reads it): how far
 * along its strand it hangs (`far`, 0 on the head) and which side of the head its strand hangs from (`side`,
 * an angle about `centre`, 0 straight behind, growing towards +X), in the form hair.js hangPlan takes as
 * `along`. `scalp` is the head's skin (its points), which tells a strand's root from its tip; `line` the
 * height under which hair hangs.
 */
function strandsAlong(mesh, scalp, line, centre) {
  const position = mesh.position;
  const uv = mesh.geometry.attributes.uv.array;
  const count = position.length / 3;
  // (A strand's points come one after another and share one `u`: realistic.js hairKit.)
  const runs = [];
  for (let start = 0; start < count;) {
    let end = start + 1;
    while (end < count && Math.abs(uv[end * 2] - uv[start * 2]) < 1e-4) end++;
    runs.push([start, end]);
    start = end;
  }
  // Which end of a strand is its root: the one on the scalp. Along a strand `v` runs one way in every strand
  // of a file, so a sample of strands settles it: the end, greatest `v` or least, that lies nearer the scalp.
  const cellOf = (x, y, z) =>
    ((Math.floor(x / SCALP_CELL) + 512) << 20) |
    ((Math.floor(y / SCALP_CELL) + 512) << 10) |
    (Math.floor(z / SCALP_CELL) + 512);
  const cells = new Map();
  for (let v = 0; v < scalp.length / 3; v++) {
    const cell = cellOf(scalp[v * 3], scalp[v * 3 + 1], scalp[v * 3 + 2]);
    if (!cells.has(cell)) cells.set(cell, []);
    cells.get(cell).push(v);
  }
  const gapAt = (p) => {
    const [x, y, z] = [position[p * 3], position[p * 3 + 1], position[p * 3 + 2]];
    let least = SCALP_CELL * 2;
    for (let dx = -1; dx <= 1; dx++)
      for (let dy = -1; dy <= 1; dy++)
        for (let dz = -1; dz <= 1; dz++)
          for (const v of cells.get(cellOf(x + dx * SCALP_CELL, y + dy * SCALP_CELL, z + dz * SCALP_CELL)) ?? [])
            least = Math.min(least, Math.hypot(scalp[v * 3] - x, scalp[v * 3 + 1] - y, scalp[v * 3 + 2] - z));
    return least;
  };
  let [high, low] = [0, 0];
  for (let r = 0; r < runs.length; r += Math.max(1, Math.floor(runs.length / 200))) {
    let [most, least] = [runs[r][0], runs[r][0]];
    for (let p = runs[r][0]; p < runs[r][1]; p++) {
      if (uv[p * 2 + 1] > uv[most * 2 + 1]) most = p;
      if (uv[p * 2 + 1] < uv[least * 2 + 1]) least = p;
    }
    high += gapAt(most);
    low += gapAt(least);
  }
  const rootFirst = high <= low ? -1 : 1; // (the order along a strand, root first: falling `v`, or rising)
  const far = new Float32Array(count);
  const side = new Float32Array(count);
  const order = [];
  const places = []; // (a strand's points along it, each the middle of the ribbon's two edges there: x, y, z, how far along)
  for (const [start, end] of runs) {
    order.length = 0;
    for (let p = start; p < end; p++) order.push(p);
    order.sort((a, b) => (uv[a * 2 + 1] - uv[b * 2 + 1]) * rootFirst);
    places.length = 0;
    const placeOf = new Array(order.length);
    for (let i = 0; i < order.length;) {
      let j = i;
      const middle = [0, 0, 0];
      while (j < order.length && Math.abs(uv[order[j] * 2 + 1] - uv[order[i] * 2 + 1]) < 1e-4) {
        for (let c = 0; c < 3; c++) middle[c] += position[order[j] * 3 + c];
        placeOf[j] = places.length;
        j++;
      }
      for (let c = 0; c < 3; c++) middle[c] /= j - i;
      const before = places.at(-1);
      const along = before
        ? before[3] + Math.hypot(middle[0] - before[0], middle[1] - before[1], middle[2] - before[2])
        : 0;
      places.push([...middle, along]);
      i = j;
    }
    // Where it leaves the head: at its root if that is under the line, else where it first crosses the line.
    let from = Infinity;
    if (places[0][1] < line) from = 0;
    else
      for (let k = 1; k < places.length && from === Infinity; k++)
        if (places[k][1] < line) {
          const [above, below] = [places[k - 1], places[k]];
          from = above[3] + ((above[1] - line) / (above[1] - below[1] || 1)) * (below[3] - above[3]);
        }
    if (from === Infinity) continue;
    // (Its side: where the middle of its hanging part is, about the head's middle.)
    let [x, z, hanging] = [0, 0, 0];
    for (const place of places)
      if (place[3] > from) {
        x += place[0];
        z += place[2];
        hanging++;
      }
    if (!hanging) continue;
    const angle = Math.atan2(x / hanging - centre.x, centre.z - z / hanging);
    order.forEach((p, i) => {
      far[p] = Math.max(0, places[placeOf[i]][3] - from);
      side[p] = angle;
    });
  }
  return { far, side };
}

const busts = new WeakMap(); // a body → { shape, bust }: the bust last found on it, and the sliders it was found with
const hairPlans = new WeakMap(); // a hair style's mesh (realistic.js hairKit) → its plan (hair.js hangPlan), or null
/** How a hair style's mesh is rigged to swing, made once a style; null for a style with nothing hanging far enough. */
function hairPlanOf(body, mesh, joints) {
  if (!hairPlans.has(mesh)) {
    const { joints: named, inverseBind } = body.file;
    const jointAtRest = (name) =>
      new Vector3().setFromMatrixPosition(new Matrix4().fromArray(inverseBind, named.indexOf(name) * 16).invert());
    const centre = jointAtRest("Head");
    const line = (named.includes("eye_l") ? jointAtRest("eye_l").y : centre.y + 0.05) - HAIR_BELOW;
    const along = strandsAlong(mesh, body.head.position, line, centre);
    const plan = hangPlan(mesh.geometry, joints, { ...HAIR, along, line, centre, from: "Head" });
    // (Each chain's joints are placed in the middle of the points round them, on every rebuild: a band has
    // thousands of a strand style's points, and every BAND_EVERY-th of them has the same middle.)
    for (const chain of plan?.chains ?? [])
      chain.bands = chain.bands.map((band) =>
        band.length > BAND_EVERY * 8 ? band.filter((_, i) => i % BAND_EVERY === 0) : band,
      );
    hairPlans.set(mesh, plan);
  }
  return hairPlans.get(mesh);
}

const skinKits = new WeakMap(); // a body → its skin in the form springs.js bodyColliders reads a body in
/**
 * The body's skin as one "kit" for springs.js bodyColliders, made once: every COLLIDER_EVERY-th point of each
 * skin mesh, their weights end to end. (A third of the skin's 28,000 points tells how thick a limb is as well
 * as all of them, in a third of the time, and the colliders are fitted on every rebuild.)
 */
function skinKitOf(body) {
  if (!skinKits.has(body)) {
    const skins = body.meshes.filter(isSkin);
    const total = skins.reduce((sum, mesh) => sum + Math.ceil(mesh.position.length / 3 / COLLIDER_EVERY), 0);
    const skinIndex = new Uint16Array(total * 4);
    const skinWeight = new Float32Array(total * 4);
    const meshes = [];
    let start = 0;
    for (const mesh of skins) {
      const count = Math.ceil(mesh.position.length / 3 / COLLIDER_EVERY);
      const { skinIndex: index, skinWeight: weight } = mesh.geometry.attributes;
      for (let i = 0; i < count; i++)
        for (let c = 0; c < 4; c++) {
          skinIndex[(start + i) * 4 + c] = index.array[i * COLLIDER_EVERY * 4 + c];
          skinWeight[(start + i) * 4 + c] = weight.array[i * COLLIDER_EVERY * 4 + c];
        }
      meshes.push({ part: "skin", start, count, of: mesh });
      start += count;
    }
    skinKits.set(body, {
      file: { joints: body.file.joints },
      shared: { skinIndex: { array: skinIndex }, skinWeight: { array: skinWeight } },
      meshes,
      total,
    });
  }
  return skinKits.get(body);
}

/**
 * The moving parts of one Realistic avatar: `body` is its kit (realistic.js bodyKit), `weights` its sliders
 * ({ key: weight }), `bones` its skeleton as shaped (the bust's and buttocks' bones are added to it here) and
 * `physics` the look's (physics.js physicsOf). Gives { wear(made, mesh), wearHair(made, mesh),
 * finish(figure) }:
 * - `wear`, for each of the body's meshes once it's made (`made`, the skinned mesh; `mesh`, the kit's): the
 *   torso and legs get their weights on the bust's and buttocks' bones, and those bones in their skeletons;
 * - `wearHair`, for the hair's mesh the same way: its points weighted to its chains, and the chains' bones
 *   made where this avatar's hair rests;
 * - `finish`, once the figure stands (figure.js standFigure): its springs and colliders, fitted so nothing is
 *   pushed at rest.
 */
export function softParts(body, weights, bones, physics) {
  const { joints } = body.file;
  const springs = [];
  const drawn = new Map(); // a body mesh → its skinned mesh, for the colliders
  const worn = new Map(); // a body mesh → { skinIndex, skinWeight, bones, inverses }: its own weights and added bones
  const shapes = new Map();
  const at = (mesh) => {
    if (!shapes.has(mesh)) shapes.set(mesh, positionsOf(mesh, weights));
    return shapes.get(mesh);
  };
  /**
   * A share of each marked point's weight onto `rig`'s bones (left, its tip, right, its tip), as `passes` say:
   * each { weigh (bust.js bustWeights or glutes.js gluteWeights, given the weights so far, the bones' first
   * number and each point's share), only (the one side it is for, 0 left or 1 right; missing: both) }.
   */
  const give = (mask, rig, passes) => {
    for (const [mesh, { mark, side }] of mask) {
      const had = worn.get(mesh);
      const first = joints.length + (had?.bones.length ?? 0);
      let index = had?.skinIndex ?? mesh.geometry.attributes.skinIndex.array;
      let weight = had?.skinWeight ?? mesh.geometry.attributes.skinWeight.array;
      let any = false;
      for (const { weigh, only } of passes) {
        const share = (i, own) => [side[i], only === undefined || side[i] === only ? mark[i] * own : 0];
        const made = weigh(index, weight, first, share);
        if (!made) continue;
        ({ skinIndex: index, skinWeight: weight } = made);
        any = true;
      }
      if (any)
        worn.set(mesh, {
          skinIndex: index,
          skinWeight: weight,
          bones: [...(had?.bones ?? []), ...rig.bones],
          inverses: [...(had?.inverses ?? []), ...rig.inverses],
        });
    }
  };
  if (physics.bust.on) {
    const mask = maskOf(body, "bust");
    // (The body as the gender and breasts keys alone shape it: what tells a bust from a chest, findBust.)
    // (Found again only when the sliders have changed: a change of colour, hair or amount rebuilds the same body.)
    const shape = JSON.stringify(weights);
    if (busts.get(body)?.shape !== shape) {
      const only = Object.fromEntries(BUST_KEYS.filter((key) => weights[key]).map((key) => [key, weights[key]]));
      busts.set(body, { shape, bust: findBust(mask, at, (mesh) => positionsOf(mesh, only)) });
    }
    const { bust } = busts.get(body);
    if (bust) {
      const rig = rigBust(bust, bones);
      give(mask, rig, [{ weigh: (index, weight, first, share) => bustWeights(index, weight, joints, first, share) }]);
      // (Each breast's ball is its own size, and meets the arms.)
      for (const { radius, ...spring } of rig.springs)
        springs.push({
          ...spring,
          joint: { ...jointAt(BUST_JOINT, physics.bust.amount), hitRadius: radius },
          meets: "arms",
        });
    }
  }
  if (physics.butt.on) {
    const mask = maskOf(body, "butt");
    const glutes = findGlutes(mask, at);
    if (glutes) {
      // (Each buttock's bone hangs from its own thigh, and takes that thigh's weight alone: SOFT.butt.)
      const rig = rigGlutes(glutes, bones, SOFT.butt.parent);
      give(
        mask,
        rig,
        ["l", "r"].map((side, only) => ({
          only,
          weigh: (index, weight, first, share) =>
            gluteWeights(index, weight, joints, first, share, [SOFT.butt.parent(side)], []),
        })),
      );
      for (const spring of rig.springs)
        springs.push({ ...spring, joint: jointAt(SOFT.butt.joint, physics.butt.amount), meets: "none" });
    }
  }
  /** `made` bound again with `more` bones (and their inverse bind matrices) after its own. */
  const addBones = (made, more, inverses) => {
    const { bones: own, boneInverses } = made.skeleton;
    made.bind(new Skeleton([...own, ...more], [...boneInverses, ...inverses]), made.bindMatrix);
  };
  return {
    wear(made, mesh) {
      drawn.set(mesh, made);
      const own = worn.get(mesh);
      if (!own) return;
      made.geometry.setAttribute("skinIndex", new Uint16BufferAttribute(own.skinIndex, 4));
      made.geometry.setAttribute("skinWeight", new BufferAttribute(own.skinWeight, 4));
      addBones(made, own.bones, own.inverses);
    },
    wearHair(made, mesh) {
      // (Its box, which standing the figure on the floor asks for: bound where it rests, it is its points'
      // own. Left to three, each of a style's 100,000 points is put through its bones for it, which took
      // 12 ms of a 30 ms rebuild, and on chains each point has up to four bones. Swinging or not.)
      made.boundingBox = new Box3().setFromBufferAttribute(made.geometry.attributes.position);
      if (!physics.hair.on || mesh.part !== "hair") return;
      const part = { joints: made.skeleton.bones.map((bone) => bone.name) };
      const plan = hairPlanOf(body, mesh, part.joints);
      if (!plan) return;
      // (The plan's weights are the style's, shared by every avatar wearing it, as its other attributes are.)
      made.geometry.setAttribute("skinIndex", plan.skinIndex);
      made.geometry.setAttribute("skinWeight", plan.skinWeight);
      const rig = rigChains(plan, part, made.geometry.attributes.position.array, bones);
      addBones(made, rig.bones, rig.inverses);
      for (const spring of rig.springs)
        springs.push({ ...spring, joint: jointAt(HAIR_JOINT, physics.hair.amount), meets: "body", ring: rig });
    },
    finish(figure) {
      figure.springs = springs;
      figure.colliders = [];
      if (!springs.length) return;
      // The colliders, fitted to the skin as shaped. They're measured with the skeleton where it was built
      // (as avatar.js measures the other bodies', before the figure is sized and stood on the floor), so
      // the figure is put back there for a moment. (The buttocks meet none: with only those, none are made.)
      let colliders = {};
      if (springs.some((spring) => spring.meets !== "none")) {
        const kit = skinKitOf(body);
        const position = new Float32Array(kit.total * 3);
        for (const { of, start, count } of kit.meshes) {
          const own = drawn.get(of)?.geometry.attributes.position.array ?? at(of);
          for (let i = 0; i < count; i++)
            for (let c = 0; c < 3; c++) position[(start + i) * 3 + c] = own[i * COLLIDER_EVERY * 3 + c];
        }
        const { root } = figure;
        const [place, size] = [root.position.clone(), root.scale.clone()];
        root.position.set(0, 0, 0);
        root.scale.setScalar(1);
        root.updateMatrixWorld(true);
        colliders = bodyColliders(kit, position, figure.bones);
        root.position.copy(place);
        root.scale.copy(size);
        root.updateMatrixWorld(true);
      }
      for (const spring of springs) spring.colliders = [...(colliders[spring.meets] ?? [])];
      figure.colliders = [...new Set(springs.flatMap((spring) => spring.colliders))];
      fitColliders(figure);
    },
  };
}
