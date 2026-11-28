// Strand hair laid over the body it is worn on (the Realistic body's: realistic.js).
//
// A strand style is made on the body as built. On a body with wider shoulders, a fuller chest or more weight,
// hair that hangs past the neck would pass through the skin. So each avatar's hair is draped once it is
// shaped: every strand is walked from its root to its tip, each piece of it set down where the piece before
// ended and pointing the way it was made to, and where that would put it under the skin it is pushed out
// along the skin and keeps its length. So a strand that meets a shoulder slides off it and hangs on from
// there, as hair does.
//
// The skin is read as a cloud of points with their normals: a point of hair is under the skin when it is
// behind the plane of the skin point nearest it. That is exact enough on a body, whose skin points lie about
// a centimetre apart, and takes no mesh: a grid of cells finds the nearest point.

// Metres: the grid's cells. A hair point is tested against the skin in its cell and those round it, so against
// all the skin within a cell's width of it: as far as one step (STEP) can take it under the skin.
const CELL = 0.02;
// Metres: of the skin's points, one is kept for each cube this wide. A body's skin is finer than this on the
// neck and arms and about as fine on the chest and back, and a plane through a point this near is as good.
const THIN = 0.008;
const STEP = 0.02; // metres: a strand's piece longer than this is walked in steps, so it can't step through the skin
const SAME = 1e-4;
const PUSHES = 4; // times at most a point is pushed out again after sliding

/**
 * A strand mesh's points in order (hair, as the kit has it: ribbons whose `u` is a strand's own shade and
 * whose `v` falls from 1 at the root to 0 at the tip): { order (its vertices, strand after strand, each from
 * its root), points (where each point's vertices start in `order`: a ribbon has two a point; one more at the
 * end), strands (where each strand's points start in `points`; one more at the end) }.
 */
export function strandOrder(geometry) {
  const uv = geometry.attributes.uv.array;
  const count = uv.length / 2;
  const order = new Uint32Array(count);
  const points = [];
  const strands = [];
  for (let start = 0; start < count;) {
    let end = start + 1;
    while (end < count && Math.abs(uv[end * 2] - uv[start * 2]) < SAME) end++;
    const ids = Array.from({ length: end - start }, (_, i) => start + i).sort((a, b) => uv[b * 2 + 1] - uv[a * 2 + 1]);
    strands.push(points.length);
    ids.forEach((id, i) => {
      if (!i || Math.abs(uv[id * 2 + 1] - uv[ids[i - 1] * 2 + 1]) > SAME) points.push(start + i);
      order[start + i] = id;
    });
    start = end;
  }
  points.push(count);
  strands.push(points.length - 1);
  return { order, points: Uint32Array.from(points), strands: Uint32Array.from(strands) };
}

/**
 * The skin hair is draped over, as a cloud: `parts` are [{ position, normal, keep(x, y, z) }] (a mesh's
 * points and normals, and which of them count). Gives what `drape` reads: the points kept, and a grid of
 * cells to find them by. `thin`: one point is kept for each cube this wide (THIN unless said; a beard, which
 * lies a millimetre or two off the face, wants every point of it).
 */
export function skinCloud(parts, thin = THIN) {
  let total = 0;
  for (const { position } of parts) total += position.length / 3;
  const at = new Float32Array(total * 3);
  const normal = new Float32Array(total * 3);
  const low = [Infinity, Infinity, Infinity];
  const high = [-Infinity, -Infinity, -Infinity];
  let count = 0;
  const taken = new Set(); // the `thin`-wide cubes that have their point
  for (const part of parts)
    for (let v = 0; v < part.position.length; v += 3) {
      if (!part.keep(part.position[v], part.position[v + 1], part.position[v + 2])) continue;
      if (thin > 0) {
        const cube =
          Math.floor(part.position[v] / thin) +
          1024 * (Math.floor(part.position[v + 1] / thin) + 1024 * Math.floor(part.position[v + 2] / thin));
        if (taken.has(cube)) continue;
        taken.add(cube);
      }
      const length = Math.hypot(part.normal[v], part.normal[v + 1], part.normal[v + 2]) || 1;
      for (let c = 0; c < 3; c++) {
        at[count * 3 + c] = part.position[v + c];
        normal[count * 3 + c] = part.normal[v + c] / length;
        if (at[count * 3 + c] < low[c]) low[c] = at[count * 3 + c];
        if (at[count * 3 + c] > high[c]) high[c] = at[count * 3 + c];
      }
      count++;
    }
  if (!count) return null;
  const size = low.map((least, c) => Math.floor((high[c] - least) / CELL) + 1);
  const cellOf = (v) =>
    Math.floor((at[v * 3] - low[0]) / CELL) +
    size[0] * (Math.floor((at[v * 3 + 1] - low[1]) / CELL) + size[1] * Math.floor((at[v * 3 + 2] - low[2]) / CELL));
  // (The points sorted by cell: `starts` says where each cell's are in `ids`.)
  const starts = new Uint32Array(size[0] * size[1] * size[2] + 1);
  for (let v = 0; v < count; v++) starts[cellOf(v) + 1]++;
  for (let c = 1; c < starts.length; c++) starts[c] += starts[c - 1];
  const filled = starts.slice(0, -1);
  const ids = new Uint32Array(count);
  for (let v = 0; v < count; v++) ids[filled[cellOf(v)]++] = v;
  // (Which cells have skin in them or beside them: hair in any other is clear of the skin, and most of it is.)
  const near = new Uint8Array(starts.length - 1);
  for (let z = 0; z < size[2]; z++)
    for (let y = 0; y < size[1]; y++)
      for (let x = 0; x < size[0]; x++) {
        const c = x + size[0] * (y + size[1] * z);
        if (starts[c] === starts[c + 1]) continue;
        for (let dz = -1; dz <= 1; dz++)
          for (let dy = -1; dy <= 1; dy++)
            for (let dx = -1; dx <= 1; dx++) {
              const [nx, ny, nz] = [x + dx, y + dy, z + dz];
              if (nx >= 0 && ny >= 0 && nz >= 0 && nx < size[0] && ny < size[1] && nz < size[2])
                near[nx + size[0] * (ny + size[1] * nz)] = 1;
            }
      }
  return { at, normal, low, size, starts, ids, near };
}

/**
 * Drapes strands over the skin, in place: `position` (the hair's points, as they are worn), `strands` (its
 * strandOrder), `cloud` (skinCloud), `top` (the height above which hair isn't tested: it lies on the head as
 * made) and `clear` (metres the hair is kept off the skin). Returns how many points it moved.
 */
export function drape(position, { order, points, strands }, cloud, { top, clear }) {
  const { at, normal, low, size, starts, ids, near } = cloud;
  const [lowX, lowY, lowZ] = low;
  const [sizeX, sizeY, sizeZ] = size;
  // (The point being placed, kept in plain numbers and set one by one: this runs for every point of a hundred
  // thousand, where a list made and taken apart again is what takes the time.)
  let px = 0;
  let py = 0;
  let pz = 0;
  /** Pushes the point out along the skin where it is under it; says whether it was. */
  const pushOut = () => {
    const cx = Math.floor((px - lowX) / CELL);
    const cy = Math.floor((py - lowY) / CELL);
    const cz = Math.floor((pz - lowZ) / CELL);
    // (Outside the skin's own box nothing is under the skin; nor is anything in a cell with no skin in or beside it.)
    if (cx < 0 || cy < 0 || cz < 0 || cx >= sizeX || cy >= sizeY || cz >= sizeZ) return false;
    if (!near[cx + sizeX * (cy + sizeY * cz)]) return false;
    let best = -1;
    let nearest = CELL * CELL * 4;
    for (let z = Math.max(0, cz - 1); z <= cz + 1 && z < sizeZ; z++)
      for (let y = Math.max(0, cy - 1); y <= cy + 1 && y < sizeY; y++) {
        const row = sizeX * (y + sizeY * z);
        const first = Math.max(0, cx - 1);
        const last = Math.min(sizeX - 1, cx + 1);
        if (last < first) continue;
        // (A row's cells lie one after another, so their points do too.)
        for (let i = starts[row + first]; i < starts[row + last + 1]; i++) {
          const v = ids[i] * 3;
          const dx = at[v] - px;
          const dy = at[v + 1] - py;
          const dz = at[v + 2] - pz;
          const gap = dx * dx + dy * dy + dz * dz;
          if (gap < nearest) {
            best = v;
            nearest = gap;
          }
        }
      }
    if (best < 0) return false;
    const over =
      (px - at[best]) * normal[best] + (py - at[best + 1]) * normal[best + 1] + (pz - at[best + 2]) * normal[best + 2];
    if (over >= clear) return false;
    px += (clear - over) * normal[best];
    py += (clear - over) * normal[best + 1];
    pz += (clear - over) * normal[best + 2];
    return true;
  };
  /** The middle of a strand's point `k` (its vertices are order[points[k]] … order[points[k + 1] - 1]), into px, py, pz. */
  const middle = (k) => {
    px = py = pz = 0;
    const n = points[k + 1] - points[k];
    for (let i = points[k]; i < points[k + 1]; i++) {
      const v = order[i] * 3;
      px += position[v] / n;
      py += position[v + 1] / n;
      pz += position[v + 2] / n;
    }
  };
  let moved = 0;
  for (let s = 0; s + 1 < strands.length; s++) {
    middle(strands[s]);
    // The point before, as made, and as draped (the root stays where it grows).
    let wasX = px;
    let wasY = py;
    let wasZ = pz;
    let nowX = px;
    let nowY = py;
    let nowZ = pz;
    let draped = false;
    for (let k = strands[s] + 1; k < strands[s + 1]; k++) {
      middle(k);
      const madeX = px;
      const madeY = py;
      const madeZ = pz;
      const pieceX = px - wasX;
      const pieceY = py - wasY;
      const pieceZ = pz - wasZ;
      wasX = px;
      wasY = py;
      wasZ = pz;
      const length = Math.sqrt(pieceX * pieceX + pieceY * pieceY + pieceZ * pieceZ);
      const steps = Math.max(1, Math.ceil(length / STEP));
      const stride = length / steps;
      for (let step = 0; step < steps; step++) {
        const fromX = nowX;
        const fromY = nowY;
        const fromZ = nowZ;
        px = fromX + pieceX / steps;
        py = fromY + pieceY / steps;
        pz = fromZ + pieceZ / steps;
        if ((draped || py < top) && pushOut()) {
          // (Pushed out, the step is brought back to its length, sliding it along the skin, and pushed out again.)
          const reach = Math.sqrt((px - fromX) ** 2 + (py - fromY) ** 2 + (pz - fromZ) ** 2);
          if (reach > stride * 0.3) {
            px = fromX + ((px - fromX) / reach) * stride;
            py = fromY + ((py - fromY) / reach) * stride;
            pz = fromZ + ((pz - fromZ) / reach) * stride;
          }
          // (Again until it holds, a few times at most: where the skin bends inwards, as under the jaw, a point
          // pushed out from one patch of skin can land under the next.)
          for (let again = 0; again < PUSHES && pushOut(); again++);
          draped = true;
        }
        nowX = px;
        nowY = py;
        nowZ = pz;
      }
      if (!draped) continue;
      // (Every vertex of the point moves as its middle did.)
      for (let i = points[k]; i < points[k + 1]; i++) {
        const v = order[i] * 3;
        position[v] += nowX - madeX;
        position[v + 1] += nowY - madeY;
        position[v + 2] += nowZ - madeZ;
      }
      moved++;
    }
  }
  return moved;
}
