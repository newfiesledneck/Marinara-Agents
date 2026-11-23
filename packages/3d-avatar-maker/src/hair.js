// Hair that moves: bone chains through the locks of a hair style that hang below the head, worked out from
// the style's own mesh, so no style needs a model of its own to swing.
//
// Only the styles that hang loose swing (SWINGING_HAIR): a short cut's hair at the nape lies on the skin.
//
// How a style is rigged (`hairPlan`, once per style and body):
// - Hair above the hang line (a little below the eyes, SWINGING_HAIR) stays on the head as it is.
// - Below it, each point is followed back up the hair, along the mesh, to where it leaves the hang line: how
//   far along the hair it is, and from which side of the head it hangs (eight sides, from the back round).
// - Each side with enough hanging hair gets a chain of bones down the middle of its locks, from the hang
//   line to near its tip, each bone a few centimetres to a tenth of a metre long.
// - The points are weighted to their side's chain (and the next side's, by how far round they are), along
//   it by how far down they are, easing in from the hang line.
// - The chains hang from the bone the locks followed before (the head for a bob or a ponytail, the upper
//   chest for hair down the back), so with nothing moving them the hair rests and follows the body as it did.
// The bones are made for each avatar (`rigHair`), where the locks rest on it. springs.js swings them.
import { Bone, BufferAttribute, Matrix4, Uint16BufferAttribute, Vector3 } from "three";
import { PACK_HAIR } from "./looks.js";

/**
 * The hair styles whose locks hang loose enough to swing (looks.js HAIRSTYLES), each with how far below the
 * eyes its hair leaves the head (metres); the rest stay as they are. (The braid wraps round the head from the
 * temple before it hangs down the back: only the part below the skull swings.)
 */
export const SWINGING_HAIR = new Map([
  ["long", 0.03],
  ["ponytail", 0.03],
  ["bob", 0.03],
  ["bob_angled", 0.03],
  ["braid", 0.12],
]);
/**
 * How far below the eyes style `style`'s locks leave the head to swing: the kit's (SWINGING_HAIR), else a
 * wardrobe pack's own `swing` (packs.js readHair), else undefined for a style that stays as it is.
 */
export const swingOf = (style) =>
  SWINGING_HAIR.get(style) ?? (Object.hasOwn(PACK_HAIR, style) ? PACK_HAIR[style].swing : null) ?? undefined;

/** The eight sides of the head, from straight behind, round by the avatar's left (+X). */
const HAIR_SIDES = ["back", "back_left", "left", "front_left", "front", "front_right", "right", "back_right"];
const STEP = (Math.PI * 2) / HAIR_SIDES.length;
const EASE = 0.04; // metres along the hair over which a point goes over from the head to its chain
const MIN_HANG = 0.06; // metres: shorter locks stay as they are
const BONE_LENGTH = 0.08; // metres: about how long each bone of a chain is
const MAX_BONES = 5;
/** The bones a chain may hang from: the head, neck and chest, never an arm. */
const HANGS_FROM = ["Head", "neck_01", "spine_03", "spine_02"];

/** A small binary heap of [distance, node], nearest first. */
function heap() {
  const items = [];
  return {
    get size() {
      return items.length;
    },
    push(item) {
      items.push(item);
      for (let i = items.length - 1; i > 0;) {
        const up = (i - 1) >> 1;
        if (items[up][0] <= items[i][0]) break;
        [items[up], items[i]] = [items[i], items[up]];
        i = up;
      }
    },
    pop() {
      const top = items[0];
      const last = items.pop();
      if (items.length) {
        items[0] = last;
        for (let i = 0; ;) {
          const [a, b] = [i * 2 + 1, i * 2 + 2];
          let least = i;
          if (a < items.length && items[a][0] < items[least][0]) least = a;
          if (b < items.length && items[b][0] < items[least][0]) least = b;
          if (least === i) break;
          [items[least], items[i]] = [items[i], items[least]];
          i = least;
        }
      }
      return top;
    },
  };
}

/**
 * For each point of the hair below `line` (a height): how far along the hair it is from the line, and the
 * side of the head (an angle about `centre`, 0 straight behind, growing towards +X) the hair it's on hangs
 * from. Points sharing a place are one (a texture seam), and a lock not joined to the rest is reached
 * through the air from the nearest hair.
 */
function alongHair(position, index, line, centre) {
  const count = position.length / 3;
  const node = new Int32Array(count);
  const places = new Map();
  const at = [];
  for (let i = 0; i < count; i++) {
    const [x, y, z] = [position[i * 3], position[i * 3 + 1], position[i * 3 + 2]];
    const key = `${Math.round(x * 2000)},${Math.round(y * 2000)},${Math.round(z * 2000)}`;
    if (!places.has(key)) {
      places.set(key, at.length);
      at.push(new Vector3(x, y, z));
    }
    node[i] = places.get(key);
  }
  const n = at.length;
  const near = Array.from({ length: n }, () => new Set());
  for (let t = 0; t < index.length; t += 3)
    for (const [a, b] of [
      [0, 1],
      [1, 2],
      [2, 0],
    ]) {
      const [p, q] = [node[index[t + a]], node[index[t + b]]];
      if (p !== q) {
        near[p].add(q);
        near[q].add(p);
      }
    }
  const far = new Float32Array(n).fill(Infinity);
  const side = new Float32Array(n);
  const queue = heap();
  for (let i = 0; i < n; i++)
    if (at[i].y >= line) {
      far[i] = 0;
      side[i] = Math.atan2(at[i].x - centre.x, centre.z - at[i].z);
      queue.push([0, i]);
    }
  if (!queue.size) return null;
  const settle = () => {
    while (queue.size) {
      const [d, i] = queue.pop();
      if (d > far[i]) continue;
      for (const j of near[i]) {
        const next = d + at[i].distanceTo(at[j]);
        if (next < far[j]) {
          far[j] = next;
          side[j] = side[i];
          queue.push([next, j]);
        }
      }
    }
  };
  settle();
  // (A lock on its own: each of its points from the nearest hair reached, then along the lock.)
  const reached = [];
  const lost = [];
  for (let i = 0; i < n; i++) (far[i] < Infinity ? reached : lost).push(i);
  for (const i of lost) {
    let best = -1;
    let gap = Infinity;
    for (const j of reached) {
      const d = at[i].distanceToSquared(at[j]);
      if (d < gap) [gap, best] = [d, j];
    }
    far[i] = far[best] + Math.sqrt(gap);
    side[i] = side[best];
    queue.push([far[i], i]);
  }
  settle();
  return {
    far: Float32Array.from(node, (i) => far[i]),
    side: Float32Array.from(node, (i) => side[i]),
  };
}

/** Which of the head's sides an angle is nearest (0 to 7). */
const sideOf = (angle) => ((Math.round(angle / STEP) % HAIR_SIDES.length) + HAIR_SIDES.length) % HAIR_SIDES.length;

/**
 * How a hair style's mesh is rigged to move: { chains, skinIndex, skinWeight, was (its own weights:
 * { skinIndex, skinWeight }) }, or null when nothing of it
 * hangs far enough to swing. `geometry` is the style's (its points where the body was built), `joints` the
 * body bones its weights name, `line` the height its hair leaves the head and `centre` the head's middle (a
 * point).
 * Each chain: { name, side, from (the body bone it hangs from), bones (how many swing), bands (for each of
 * its joints, root to tip, the points round it) }. The new weights name a chain's bones after `joints`,
 * chain by chain, root to tip (rigHair makes them in that order).
 */
export function hairPlan(geometry, joints, line, centre) {
  const position = geometry.attributes.position.array;
  const along = alongHair(position, geometry.index.array, line, centre);
  if (!along) return null;
  const { far, side } = along;
  const count = position.length / 3;
  const members = HAIR_SIDES.map(() => []);
  let hanging = 0;
  for (let i = 0; i < count; i++)
    if (far[i] > 0) {
      hanging++;
      members[sideOf(side[i])].push(i);
    }
  const index = geometry.attributes.skinIndex.array;
  const weight = geometry.attributes.skinWeight.array;
  // Every chain hangs from the one bone the hanging hair followed most, of the head, neck and chest, so
  // neighbouring locks move together.
  const by = new Map();
  for (let i = 0; i < count; i++)
    if (far[i] > EASE)
      for (let c = 0; c < 4; c++) {
        const bone = joints[index[i * 4 + c]];
        if (HANGS_FROM.includes(bone)) by.set(bone, (by.get(bone) ?? 0) + weight[i * 4 + c]);
      }
  const from = [...by].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Head";
  const chains = [];
  const chainOf = new Array(HAIR_SIDES.length).fill(null);
  HAIR_SIDES.forEach((name, s) => {
    const points = members[s];
    if (points.length < Math.max(24, hanging * 0.03)) return;
    const lengths = points.map((i) => far[i]).sort((a, b) => a - b);
    const length = lengths[Math.floor(lengths.length * 0.95)];
    if (length < MIN_HANG) return;
    const bones = Math.max(1, Math.min(MAX_BONES, Math.round(length / BONE_LENGTH)));
    const step = length / bones;
    const bands = Array.from({ length: bones + 1 }, (_, k) =>
      Int32Array.from(points.filter((i) => Math.abs(far[i] - k * step) <= (k ? step / 2 : step / 4))),
    );
    if (bands.filter((band) => band.length).length < 2) return;
    chainOf[s] = chains.length;
    chains.push({ name: `hair_${name}`, side: name, from, bones, step, bands });
  });
  if (!chains.length) return null;
  // The first bone of each chain, as the new weights number them.
  const first = [];
  let next = joints.length;
  for (const chain of chains) {
    first.push(next);
    next += chain.bones + 1;
  }
  /** The chain for side `s`: its own, else the nearest round the head that has one. */
  const nearest = (s) => {
    for (let k = 0; k <= HAIR_SIDES.length / 2; k++)
      for (const t of [s + k, s - k]) {
        const c = chainOf[((t % HAIR_SIDES.length) + HAIR_SIDES.length) % HAIR_SIDES.length];
        if (c !== null) return c;
      }
    return 0;
  };
  const newIndex = new Uint16Array(index.length);
  const newWeight = new Float32Array(weight.length);
  const mix = new Map();
  for (let i = 0; i < count; i++) {
    mix.clear();
    const ease = Math.min(1, far[i] / EASE);
    const a = ease * ease * (3 - 2 * ease);
    for (let c = 0; c < 4; c++)
      if (weight[i * 4 + c]) mix.set(index[i * 4 + c], (mix.get(index[i * 4 + c]) ?? 0) + weight[i * 4 + c] * (1 - a));
    if (a > 0) {
      // Between this side's chain and the next one round, by how far round it hangs.
      const u = side[i] / STEP;
      const s0 = Math.floor(u);
      const g = u - s0;
      const wrap = (s) => ((s % HAIR_SIDES.length) + HAIR_SIDES.length) % HAIR_SIDES.length;
      for (const [s, share] of [
        [wrap(s0), 1 - g],
        [wrap(s0 + 1), g],
      ]) {
        if (!share) continue;
        const c = chainOf[s] ?? nearest(s);
        const chain = chains[c];
        // Along the chain: each bone for the hair round its middle, blended at its joints.
        const b = Math.max(0, Math.min(chain.bones - 1, far[i] / chain.step - 0.5));
        const lo = Math.floor(b);
        const f = lo >= chain.bones - 1 ? 0 : b - lo;
        for (const [k, w] of [
          [lo, 1 - f],
          [lo + 1, f],
        ])
          if (w) mix.set(first[c] + k, (mix.get(first[c] + k) ?? 0) + a * share * w);
      }
    }
    const top = [...mix].sort((p, q) => q[1] - p[1]).slice(0, 4);
    const total = top.reduce((sum, [, w]) => sum + w, 0) || 1;
    top.forEach(([joint, w], c) => {
      newIndex[i * 4 + c] = joint;
      newWeight[i * 4 + c] = w / total;
    });
  }
  return {
    chains,
    skinIndex: new Uint16BufferAttribute(newIndex, 4),
    skinWeight: new BufferAttribute(newWeight, 4),
    was: { skinIndex: index, skinWeight: weight },
  };
}

const blend = new Matrix4();
const point = new Vector3();

/** Each point of `position` moved by its bones' blend of `skins` (one Matrix4 per joint), into a new array. */
function skinned(position, skins, index, weight, invert = false) {
  const out = new Float32Array(position.length);
  for (let i = 0; i < position.length / 3; i++) {
    blend.elements.fill(0);
    for (let c = 0; c < 4; c++) {
      const w = weight[i * 4 + c];
      if (!w) continue;
      const e = skins[index[i * 4 + c]].elements;
      for (let k = 0; k < 16; k++) blend.elements[k] += w * e[k];
    }
    if (invert) blend.invert();
    point.fromArray(position, i * 3).applyMatrix4(blend);
    out.set([point.x, point.y, point.z], i * 3);
  }
  return out;
}

/**
 * The bones for `plan` (hairPlan) on one avatar, hung from the body's `bones` (built, in the bind pose):
 * each chain's joints in the middle of its locks, as they rest on this avatar. `part` is the style's (its
 * joints and inverse bind matrices), `position` its points as this avatar's shape put them, and `stretch`
 * (joint name → Matrix4) the body's (avatar.js): a head made bigger or smaller.
 *
 * With nothing stretched, the points rest where they are. With a stretch, a point rests where its old weights
 * would have put it, and the chains are placed there; then each point in `position` (the avatar's own copy)
 * is moved so its new weights rest it there too, and nothing tears where hair that grew with the head meets
 * hair that didn't. `prefix` keeps a second mesh's bones apart.
 *
 * Returns { bones, inverses (each bone's inverse bind matrix, in the plan's order), springs: [{ name, bones
 * (root to tip) }], moved (whether `position` was changed) }; the bones are added to `bones`.
 */
export function rigHair(plan, part, position, bones, stretch = null, prefix = "") {
  const moved = part.joints.some((name) => stretch?.has(name));
  // Each joint's skin matrix at rest (bone world · stretch · inverse bind): the stretch alone, in the world.
  const skins = part.joints.map((name, j) => {
    const bone = bones.get(name);
    if (!bone) return new Matrix4();
    const inverse = part.inverseBind
      ? new Matrix4().fromArray(part.inverseBind, j * 16)
      : bone.matrixWorld.clone().invert();
    const shape = stretch?.get(name);
    if (shape) inverse.premultiply(shape);
    return bone.matrixWorld.clone().multiply(inverse);
  });
  const rests = moved ? skinned(position, skins, plan.was.skinIndex, plan.was.skinWeight) : position;
  const made = [];
  const inverses = [];
  const springs = [];
  for (const chain of plan.chains) {
    const parent = bones.get(chain.from) ?? bones.get("Head");
    parent.updateMatrixWorld(true);
    const points = chain.bands.map((band) => {
      if (!band.length) return null;
      const middle = new Vector3();
      for (const i of band) middle.add(point.fromArray(rests, i * 3));
      return middle.divideScalar(band.length);
    });
    // (A band with no hair in it: between the bands either side of it, or on from the last two.)
    const known = points.flatMap((at, k) => (at ? [k] : []));
    points.forEach((at, k) => {
      if (at) return;
      const before = known.filter((j) => j < k).at(-1);
      const after = known.find((j) => j > k);
      const [a, b] =
        before === undefined ? [after, known[1]] : after === undefined ? [known.at(-2), before] : [before, after];
      points[k] = points[a].clone().lerp(points[b], (k - a) / (b - a));
    });
    // (Smoothed, the root and tip kept: a band's middle wanders as locks join and leave it, and a chain that
    // zigzags swings unevenly.)
    const smooth = points.map((at, k) =>
      k && k < points.length - 1
        ? at
            .clone()
            .multiplyScalar(0.5)
            .addScaledVector(points[k - 1].clone().add(points[k + 1]), 0.25)
        : at,
    );
    let holder = parent;
    const chainBones = smooth.map((at, k) => {
      const bone = new Bone();
      bone.name = `${prefix}${chain.name}_${k}`;
      holder.add(bone);
      bone.position.copy(holder.worldToLocal(at.clone()));
      bone.updateMatrixWorld(true);
      bones.set(bone.name, bone);
      inverses.push(bone.matrixWorld.clone().invert());
      holder = bone;
      return bone;
    });
    made.push(...chainBones);
    springs.push({ name: `Hair (${chain.side.replace("_", " ")})`, bones: chainBones });
  }
  // (Each point back through its new weights' blend at rest, the chains' bones adding nothing: there it rests.)
  if (moved) {
    const all = [...skins, ...made.map(() => new Matrix4())];
    position.set(skinned(rests, all, plan.skinIndex.array, plan.skinWeight.array, true));
  }
  return { bones: made, inverses, springs, moved };
}
