// Layers of clothing worn over each other (avatar.js). Every piece is fitted off the skin on its own, so two
// worn together can sit in the same place: leggings through a crop top's hem, socks through leggings, a bra
// through a tee. Here each inner layer's points are kept under every layer worn over it: where an outer
// layer's surface passes within LAYER_GAP above an inner point (or below it), the point is moved in along
// the skin's normal to LAYER_GAP under that surface. Only inner layers move, so what shows keeps its shape;
// what moves is under cloth. Where the outer layer ends (a hem, an open collar), nothing over the inner one
// is found and it stays as fitted, so a bra strap shows at an off-shoulder neckline and briefs under a skirt.

/** How far an inner layer is kept under the one over it (metres). */
export const LAYER_GAP = 0.0015;
/** How far from an inner point an outer surface is looked for, either way along the skin's normal (metres).
 *  An outer layer further off than this, a full skirt over leggings, leaves it alone. */
export const LAYER_REACH = 0.02;
/** How many edges out from the points moved under an outer layer their move fades (by half an edge). */
export const LAYER_FEATHER = 3;
const CELL = 0.03;
const cellAt = (x, y, z) => ((x + 512) << 20) | ((y + 512) << 10) | (z + 512);

/**
 * The order layers are worn in, innermost first: underwear on the skin (in an `underwear…` slot, or the
 * body's own, -1), then by a piece's layer; at the same layer, socks under trousers or leggings, and a top
 * over them (as a T-shirt worn out over jeans; a tucked shirt is made a layer lower).
 */
const SLOT_DEPTH = { socks: -0.4, legs: 0, top: 0.2 };
export function depthOf(slot, layer = 0) {
  if (/^underwear/u.test(slot ?? "")) return -1 + layer * 0.01;
  return layer + (SLOT_DEPTH[slot] ?? 0);
}

/**
 * An outer layer's surface to look through: its points (in the body's bind space, as shaped for this person)
 * and its triangles (`index`, from `start` for `count` indices), sorted into cells.
 */
export function surfaceOf(position, index, start = 0, count = index.length - start) {
  const cells = new Map();
  for (let i = start; i < start + count; i += 3) {
    let [x0, y0, z0, x1, y1, z1] = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
    for (let k = 0; k < 3; k++) {
      const v = index[i + k] * 3;
      x0 = Math.min(x0, position[v]);
      x1 = Math.max(x1, position[v]);
      y0 = Math.min(y0, position[v + 1]);
      y1 = Math.max(y1, position[v + 1]);
      z0 = Math.min(z0, position[v + 2]);
      z1 = Math.max(z1, position[v + 2]);
    }
    // (In every cell its box, grown by LAYER_REACH, touches: then the one cell a point is in holds every
    // triangle it can meet within reach.)
    const r = LAYER_REACH + LAYER_GAP;
    for (let cx = Math.floor((x0 - r) / CELL); cx <= Math.floor((x1 + r) / CELL); cx++)
      for (let cy = Math.floor((y0 - r) / CELL); cy <= Math.floor((y1 + r) / CELL); cy++)
        for (let cz = Math.floor((z0 - r) / CELL); cz <= Math.floor((z1 + r) / CELL); cz++) {
          const key = cellAt(cx, cy, cz);
          if (!cells.has(key)) cells.set(key, []);
          cells.get(key).push(i);
        }
  }
  return { position, index, cells };
}

/** How far along `dir` from `origin` the ray first meets the triangle at `i` of `surface` (either face), or Infinity. */
function meets(surface, i, ox, oy, oz, dx, dy, dz) {
  const { position: p, index } = surface;
  const a = index[i] * 3;
  const b = index[i + 1] * 3;
  const c = index[i + 2] * 3;
  const e1x = p[b] - p[a];
  const e1y = p[b + 1] - p[a + 1];
  const e1z = p[b + 2] - p[a + 2];
  const e2x = p[c] - p[a];
  const e2y = p[c + 1] - p[a + 1];
  const e2z = p[c + 2] - p[a + 2];
  const hx = dy * e2z - dz * e2y;
  const hy = dz * e2x - dx * e2z;
  const hz = dx * e2y - dy * e2x;
  const det = e1x * hx + e1y * hy + e1z * hz;
  if (Math.abs(det) < 1e-12) return Infinity;
  const f = 1 / det;
  const sx = ox - p[a];
  const sy = oy - p[a + 1];
  const sz = oz - p[a + 2];
  const u = f * (sx * hx + sy * hy + sz * hz);
  if (u < 0 || u > 1) return Infinity;
  const qx = sy * e1z - sz * e1y;
  const qy = sz * e1x - sx * e1z;
  const qz = sx * e1y - sy * e1x;
  const v = f * (dx * qx + dy * qy + dz * qz);
  if (v < 0 || u + v > 1) return Infinity;
  const t = f * (e2x * qx + e2y * qy + e2z * qz);
  return t >= 0 ? t : Infinity;
}

/**
 * Keeps an inner layer under the `outers` (surfaceOf each): its points `position` (changed in place) from
 * vertex `start` for `count`, each with its nearest skin (`near`: { ids, shares }, CARRY_NEAREST a point, as
 * avatar.js nearestSkin, numbered from `start`'s first) on the body's shaped `skinNormal`; `index`, its triangles,
 * feathers the edge. Returns how many points moved under an outer layer.
 */
export function tuckUnder(position, start, count, near, per, skinNormal, outers, index = null) {
  let moved = 0;
  const move = new Float32Array(count * 3);
  const done = new Uint8Array(count); // (1: moved under an outer layer; 2, 3…: feathered from those, a ring further each)
  for (let v = 0; v < count; v++) {
    const at = (start + v) * 3;
    let [nx, ny, nz] = [0, 0, 0];
    for (let k = 0; k < per; k++) {
      const id = near.ids[v * per + k] * 3;
      const share = near.shares[v * per + k];
      nx += skinNormal[id] * share;
      ny += skinNormal[id + 1] * share;
      nz += skinNormal[id + 2] * share;
    }
    const length = Math.hypot(nx, ny, nz);
    if (length < 1e-6) continue;
    [nx, ny, nz] = [nx / length, ny / length, nz / length];
    const [px, py, pz] = [position[at], position[at + 1], position[at + 2]];
    const [ox, oy, oz] = [px - nx * LAYER_REACH, py - ny * LAYER_REACH, pz - nz * LAYER_REACH];
    let first = Infinity;
    const key = cellAt(Math.floor(px / CELL), Math.floor(py / CELL), Math.floor(pz / CELL));
    for (const surface of outers)
      for (const tri of surface.cells.get(key) ?? []) {
        const t = meets(surface, tri, ox, oy, oz, nx, ny, nz);
        if (t < first) first = t;
      }
    // (The outer surface's height over the point: first - LAYER_REACH. Not met within reach above: left be.)
    const over = first - LAYER_REACH;
    if (over > LAYER_GAP - 1e-5) continue; // (already under it: a hundredth of a millimetre is float noise)
    const by = over - LAYER_GAP;
    move[v * 3] = nx * by;
    move[v * 3 + 1] = ny * by;
    move[v * 3 + 2] = nz * by;
    done[v] = 1;
    moved++;
  }
  // Feathered: the points next to those moved (within LAYER_FEATHER edges along `index`, the inner layer's
  // triangles, numbered as `position`) follow them part of the way, less each edge further, so where an inner
  // layer comes out from under an outer one (briefs over a low waistband) its edge is smooth, not jagged.
  if (index && moved) {
    const neighbours = Array.from({ length: count }, () => []);
    for (let i = 0; i + 2 < index.length; i += 3)
      for (let k = 0; k < 3; k++) {
        const a = index[i + k] - start;
        const b = index[i + ((k + 1) % 3)] - start;
        if (a < 0 || b < 0 || a >= count || b >= count) continue;
        neighbours[a].push(b);
        neighbours[b].push(a);
      }
    for (let ring = 1; ring <= LAYER_FEATHER; ring++) {
      const reached = [];
      for (let v = 0; v < count; v++) {
        if (done[v]) continue;
        let [x, y, z, n] = [0, 0, 0, 0];
        for (const w of neighbours[v])
          if (done[w] && done[w] <= ring) {
            x += move[w * 3];
            y += move[w * 3 + 1];
            z += move[w * 3 + 2];
            n++;
          }
        if (n) reached.push([v, (x / n) * 0.5, (y / n) * 0.5, (z / n) * 0.5]);
      }
      for (const [v, x, y, z] of reached) {
        move[v * 3] = x;
        move[v * 3 + 1] = y;
        move[v * 3 + 2] = z;
        done[v] = ring + 1;
      }
    }
  }
  for (let v = 0; v < count; v++) {
    if (!done[v]) continue;
    const at = (start + v) * 3;
    position[at] += move[v * 3];
    position[at + 1] += move[v * 3 + 1];
    position[at + 2] += move[v * 3 + 2];
  }
  return moved;
}

// ── What's directly under cloth isn't drawn ──
// Kept under an outer layer at rest, an inner layer or the skin still comes through it when the body moves:
// each is weighted to the bones a little differently, so a bent knee pushes through jeans and a bra through
// a tee. So the triangles lying directly under cloth aren't drawn (nor saved in the file). Only those: a
// point counts as covered where an outer surface passes within COVER_NEAR of it along the skin's normal (or
// within COVER_FAR, for skin in a region the piece says it hides), so the thighs under a full skirt, the
// collar bones in an open neckline and a shoulder a strap leaves bare stay, and COVER_MARGIN edges in from
// where the cover ends stay too, so nothing is missing at a hem, a cuff or a collar seen from the side.
// Cloth that hangs and swings (a skirt below its line) covers nothing: avatar.js leaves it out of `covers`.

/** How many edges in from where its cover ends a covered triangle still shows. */
export const COVER_MARGIN = 2;
/** How far under a point cloth still covers it (metres): cloth the skin stands a little through at rest.
 *  (Not the full reach: through an ear or a finger, the far side of a hat or glove is that close.) */
export const COVER_SINK = 0.004;

/** The skin's normal at point `v` of a layer (its nearest skin `near`, as tuckUnder's), into `out`; false if it has none. */
export function normalNear(near, per, skinNormal, v, out) {
  let [nx, ny, nz] = [0, 0, 0];
  for (let k = 0; k < per; k++) {
    const id = near.ids[v * per + k] * 3;
    const share = near.shares[v * per + k];
    nx += skinNormal[id] * share;
    ny += skinNormal[id + 1] * share;
    nz += skinNormal[id + 2] * share;
  }
  const length = Math.hypot(nx, ny, nz);
  if (length < 1e-6) return false;
  out[0] = nx / length;
  out[1] = ny / length;
  out[2] = nz / length;
  return true;
}

/** How far over a point cloth still covers it (metres): further than LAYER_REACH, as a tee stands off the
 *  skin under the arm and jeans off the crease of the hip, where a moving body comes through first. */
export const COVER_NEAR = 0.04;
/** How far over the skin a piece's cloth still hides a region the piece says it hides (metres): a robe's
 *  sleeve over the arm, wide trousers over the calf. */
export const COVER_FAR = 0.08;

/**
 * Which of the `count` points of `position` from vertex `start` lie under cloth: 1 where one of the `covers`
 * ({ surface (surfaceOf) }) passes within `reach` (COVER_NEAR unless said) over the point along its normal
 * (`normalAt(v, out)`, v from 0, false for none), or COVER_SINK under it. `counts(v, cover)`, when given, says whether a cover counts for
 * a point at all.
 */
export function coveredBy(position, start, count, normalAt, covers, reach = COVER_NEAR, counts = null) {
  const covered = new Uint8Array(count);
  if (!covers.length) return covered;
  const n = [0, 0, 0];
  for (let v = 0; v < count; v++) {
    if (!normalAt(v, n)) continue;
    const at = (start + v) * 3;
    const [px, py, pz] = [position[at], position[at + 1], position[at + 2]];
    const [ox, oy, oz] = [px - n[0] * COVER_SINK, py - n[1] * COVER_SINK, pz - n[2] * COVER_SINK];
    // (Cell by cell out along the normal: each cell holds every triangle within LAYER_REACH of it.)
    search: for (let out = 0; out <= reach; out += CELL) {
      const key = cellAt(
        Math.floor((px + n[0] * out) / CELL),
        Math.floor((py + n[1] * out) / CELL),
        Math.floor((pz + n[2] * out) / CELL),
      );
      for (const cover of covers) {
        if (counts && !counts(v, cover)) continue;
        for (const tri of cover.surface.cells.get(key) ?? [])
          if (meets(cover.surface, tri, ox, oy, oz, n[0], n[1], n[2]) <= COVER_SINK + reach) {
            covered[v] = 1;
            break search;
          }
      }
    }
  }
  return covered;
}

/**
 * The covered points far enough in from where their cover ends: `covered` (coveredBy) with every point of a
 * triangle that has an uncovered point taken out, COVER_MARGIN times over. `index` is the layer's triangles
 * (from `from` for `length` indices), numbered from vertex `start`.
 */
export function deepUnder(covered, index, start = 0, from = 0, length = index.length - from, margin = COVER_MARGIN) {
  let deep = covered;
  for (let ring = 0; ring < margin; ring++) {
    const next = deep.slice();
    for (let i = from; i + 2 < from + length; i += 3) {
      const [a, b, c] = [index[i] - start, index[i + 1] - start, index[i + 2] - start];
      if (deep[a] && deep[b] && deep[c]) continue;
      if (a >= 0 && a < next.length) next[a] = 0;
      if (b >= 0 && b < next.length) next[b] = 0;
      if (c >= 0 && c < next.length) next[c] = 0;
    }
    deep = next;
  }
  return deep;
}

/** Whether the triangle at `i` of `index` (numbered from vertex `start`) is wholly `deep` (deepUnder) under cloth. */
export const isUnder = (deep, index, i, start = 0) =>
  deep[index[i] - start] === 1 && deep[index[i + 1] - start] === 1 && deep[index[i + 2] - start] === 1;
