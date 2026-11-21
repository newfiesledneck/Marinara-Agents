// The natural deep places below a cave's mouth (deep.js): a small cave, a few winding passages and a
// chamber or two, and a cavern, one big open space with rock pillars, a pool or a stream, rubble and
// sometimes something built standing in it (a ruined tower, a camp, a shrine). Each is a level plan, plain
// data in the shape deep.js describes, made from its seed alone, so the same entrance always leads to the
// same place.
//
// The rock is the plan's rooms and passages, worn back a little by noise (`openAt`): deep.js carves the
// walls and roof from that, and the colliders are made from it here. The noise only ever widens, so no
// passage is narrower than its plan says.
import { noise3 } from "./caves.js";
import { rng } from "./world.js";

/** The narrowest a passage is, in metres: room for the player, a companion beside them and the camera. */
export const MIN_WIDTH = 3;
/** The colliders' grid, in metres: the rock is blocked a cell at a time. */
export const CELL = 0.5;
/** How many levels there are below an entrance: the last has no way further down. */
export const MAX_DEPTH = 4;
/** How far past the plan the rock may be worn back, in metres, for each kind. */
const ROUGH = { cave: 0.9, cavern: 1.4 };
/** How deep into the rock the colliders go, in metres (deeper in, nothing can reach). */
const BAND = 2;
/** Each kit piece used here: its set and its footprint (metres, at scale 1), for its collider. */
const KIT = {
  "crystal-1": { kit: "props", w: 5.8, d: 5.9 },
  "crystal-2": { kit: "props", w: 4, d: 4.9 },
  "crystal-3": { kit: "props", w: 4, d: 3.9 },
  "rock-medium-1": { kit: "nature", w: 3.2, d: 3 },
  "rock-medium-2": { kit: "nature", w: 3, d: 2.5 },
  "rock-medium-3": { kit: "nature", w: 3.4, d: 3.5 },
  "pebble-round-1": { kit: "nature", w: 0, d: 0 },
  "pebble-round-3": { kit: "nature", w: 0, d: 0 },
  "mushroom-common": { kit: "nature", w: 0, d: 0 },
  "mushroom-laetiporus": { kit: "nature", w: 0, d: 0 },
  "wall-unevenbrick-straight": { kit: "village", w: 2, d: 0.4 },
  barrel: { kit: "props", w: 0.7, d: 0.7 },
  "crate-wooden": { kit: "props", w: 0.8, d: 0.9 },
  "prop-crate": { kit: "props", w: 1.1, d: 1.1 },
  bag: { kit: "props", w: 0, d: 0 },
  "candlestick-stand": { kit: "props", w: 0.7, d: 0.7 },
  "chest-wood": { kit: "props", w: 1.3, d: 0.8 },
  "vase-2": { kit: "props", w: 0.7, d: 0.7 },
};
const CRYSTAL_LIGHTS = [0x6f8cff, 0x9a6cff, 0x5fd0c0];

/** How far (x, z) is from the line through `points`. */
export function fromLine(points, x, z) {
  let least = Infinity;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const dx = points[i].x - a.x;
    const dz = points[i].z - a.z;
    const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / (dx * dx + dz * dz || 1)));
    least = Math.min(least, Math.hypot(x - a.x - dx * t, z - a.z - dz * t));
  }
  return least;
}

/** How far inside `room` (x, z) is, in metres (below 0 outside it): an ellipse for a chamber, else a box
 * (and so is any room laid on a grid, dungeon.js). */
export function intoRoom(room, x, z) {
  const a = room.w / 2;
  const b = room.d / 2;
  const dx = x - room.x;
  const dz = z - room.z;
  if (room.shape === "chamber" && !room.grid) return (1 - Math.hypot(dx / a, dz / b)) * Math.min(a, b);
  const ox = Math.abs(dx) - a;
  const oz = Math.abs(dz) - b;
  return ox <= 0 && oz <= 0 ? -Math.max(ox, oz) : -Math.hypot(Math.max(ox, 0), Math.max(oz, 0));
}

/** Whether (x, z) is in `water` (an ellipse { x, z, w, d, angle }), grown by `grow` metres. */
export function inWater(water, x, z, grow = 0) {
  const dx = x - water.x;
  const dz = z - water.z;
  const across = dx * Math.cos(water.angle) - dz * Math.sin(water.angle);
  const along = dx * Math.sin(water.angle) + dz * Math.cos(water.angle);
  return (across / (water.w / 2 + grow)) ** 2 + (along / (water.d / 2 + grow)) ** 2 < 1;
}

/**
 * How far into the open floor (x, z) is, in metres, for `plan` (below 0: in the rock). Rooms, passages
 * and a built level's doorways are open; a natural kind's edges are worn back by noise; rock pillars
 * stand in it. Water is open floor here (it has colliders of its own).
 */
export function openAt(plan) {
  const rough = ROUGH[plan.kind] ?? 0;
  const noise = noise3(plan.seed | 0);
  return (x, z) => {
    let open = -Infinity;
    for (const room of plan.rooms) open = Math.max(open, intoRoom(room, x, z));
    for (const passage of plan.passages) open = Math.max(open, passage.width / 2 - fromLine(passage.points, x, z));
    // (Through a wall's thickness, where a doorway is: dungeon.js.)
    for (const doorway of plan.doorways ?? []) open = Math.max(open, 1.4 - Math.hypot(x - doorway.x, z - doorway.z));
    // Worn back here and there, more at the edge and none deep in the rock: never in.
    if (rough) {
      const worn = rough * Math.max(0, 0.5 + 0.5 * noise(x * 0.21, 0.5, z * 0.21));
      open += worn * Math.max(0, Math.min(1, open / rough + 1));
    }
    for (const rock of plan.rock ?? []) open = Math.min(open, Math.hypot(x - rock.x, z - rock.z) - rock.r);
    return open;
  };
}

/**
 * Boxes over the rock beside the open floor, and over the water, a row of cells at a time, as plan
 * colliders ({ x, z, w, d, angle }).
 */
export function rockColliders(plan, open = openAt(plan)) {
  const { minX, minZ, maxX, maxZ } = plan.bounds;
  const boxes = [];
  for (let z = minZ + CELL / 2; z < maxZ; z += CELL) {
    let start = null;
    const close = (end) => {
      if (start === null) return;
      boxes.push({ x: (start + end) / 2, z, w: end - start, d: CELL, angle: 0 });
      start = null;
    };
    for (let x = minX + CELL / 2; x < maxX; x += CELL) {
      const here = open(x, z);
      const solid = (here < 0 && here > -BAND) || (plan.water ?? []).some((water) => inWater(water, x, z, 0.15));
      if (solid && start === null) start = x - CELL / 2;
      if (!solid) close(x - CELL / 2);
    }
    close(maxX);
  }
  return boxes;
}

/** A piece of the kit: where it stands and, when it's in the way, its collider. */
function piece(pieces, colliders, name, x, z, { angle = 0, scale = 1, y = 0, glow = false, solid = true } = {}) {
  const made = KIT[name];
  pieces.push({ kit: made.kit, name, x, y, z, angle, scale, ...(glow ? { glow: true } : {}) });
  if (solid && made.w) colliders.push({ x, z, w: made.w * scale * 0.75, d: made.d * scale * 0.75, angle });
}

/** A winding passage from room `a` to room `b` (or a point), `width` across, bending at a few points. */
function winding(random, a, b, width) {
  const points = [{ x: a.x, z: a.z }];
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  const length = Math.hypot(dx, dz) || 1;
  const bends = 2 + Math.floor(random() * 3);
  for (let i = 1; i <= bends; i++) {
    const t = i / (bends + 1);
    const side = (random() * 2 - 1) * Math.min(3.5, length * 0.18);
    points.push({ x: a.x + dx * t - (dz / length) * side, z: a.z + dz * t + (dx / length) * side });
  }
  points.push({ x: b.x, z: b.z });
  return { from: a.id, to: b.id ?? a.id, points, width };
}

/** A point `out` metres past the edge of `room` (a chamber) the way `angle` faces (+z at 0). */
const pastEdge = (room, angle, out) => {
  const a = room.w / 2;
  const b = room.d / 2;
  const s = Math.sin(angle);
  const c = Math.cos(angle);
  const edge = 1 / Math.hypot(s / a, c / b);
  return { x: room.x + s * (edge + out), z: room.z + c * (edge + out) };
};

/** The level's bounds: round every room and passage, with room for the rock's colliders. */
function boundsOf(rooms, passages, rough) {
  const pad = rough + BAND + 1;
  const bounds = { minX: Infinity, minZ: Infinity, maxX: -Infinity, maxZ: -Infinity };
  const take = (x, z, r) => {
    bounds.minX = Math.min(bounds.minX, x - r - pad);
    bounds.minZ = Math.min(bounds.minZ, z - r - pad);
    bounds.maxX = Math.max(bounds.maxX, x + r + pad);
    bounds.maxZ = Math.max(bounds.maxZ, z + r + pad);
  };
  for (const room of rooms) take(room.x, room.z, Math.max(room.w, room.d) / 2);
  for (const passage of passages) for (const point of passage.points) take(point.x, point.z, passage.width / 2);
  for (const key of Object.keys(bounds)) bounds[key] = Math.round(bounds[key]);
  return bounds;
}

/** What the way further down leads to from `kind`, or null at the deepest level. */
function downKind(random, kind, depth) {
  if (depth >= MAX_DEPTH) return null;
  const roll = random();
  if (kind === "cave") return roll < 0.5 ? "cavern" : roll < 0.78 ? "dungeon" : roll < 0.9 ? "stronghold" : "cave";
  return roll < 0.4 ? "cave" : roll < 0.8 ? "dungeon" : "stronghold";
}

/** Whether (x, z) keeps `clear` metres from every collider (as a box grown by that much). */
const clearOf = (colliders, x, z, clear) =>
  colliders.every((box) => {
    const reach = Math.max(box.w, box.d) / 2 + clear;
    return Math.abs(x - box.x) > reach || Math.abs(z - box.z) > reach;
  });

/** Whether (x, z) is within any of `away`: each a spot ({ x, z, r }) or a passage ({ points, r }) kept clear. */
const near = (away, x, z) =>
  away.some((spot) => (spot.points ? fromLine(spot.points, x, z) : Math.hypot(spot.x - x, spot.z - z)) < spot.r);

/** A spot in `room` at least `inside` metres in from its edge and `clear` from what's in the way. */
function spotIn(random, room, colliders, inside, clear, away = []) {
  for (let tries = 0; tries < 40; tries++) {
    const x = room.x + (random() * 2 - 1) * (room.w / 2);
    const z = room.z + (random() * 2 - 1) * (room.d / 2);
    if (intoRoom(room, x, z) < inside || !clearOf(colliders, x, z, clear)) continue;
    if (near(away, x, z)) continue;
    return { x, z };
  }
  return null;
}

/** Crystals growing from the wall of `room`, glowing: a light and two or three crystals. */
function crystals(random, room, pieces, colliders, lights, away) {
  for (let tries = 0; tries < 12; tries++) {
    const angle = random() * Math.PI * 2;
    const at = pastEdge(room, angle, -1.3);
    if (near(away, at.x, at.z)) continue;
    const count = 2 + Math.floor(random() * 2);
    for (let i = 0; i < count; i++) {
      const name = `crystal-${1 + Math.floor(random() * 3)}`;
      const side = (i - (count - 1) / 2) * 0.8;
      piece(pieces, colliders, name, at.x + Math.cos(angle) * side, at.z - Math.sin(angle) * side, {
        angle: random() * Math.PI * 2,
        scale: 0.1 + random() * 0.09,
        glow: true,
      });
    }
    const colour = CRYSTAL_LIGHTS[Math.floor(random() * CRYSTAL_LIGHTS.length)];
    lights.push({ x: at.x, y: 1.4, z: at.z, colour, range: 10 });
    return;
  }
}

/** Rocks fallen against the wall of `room`, and pebbles and mushrooms about it. */
function rubble(random, room, count, pieces, colliders, away) {
  for (let i = 0; i < count; i++) {
    const angle = random() * Math.PI * 2;
    const scale = 0.22 + random() * 0.2;
    const at = pastEdge(room, angle, -0.6 - scale * 1.2);
    if (near(away, at.x, at.z)) continue;
    if (!clearOf(colliders, at.x, at.z, MIN_WIDTH)) continue;
    piece(pieces, colliders, `rock-medium-${1 + Math.floor(random() * 3)}`, at.x, at.z, {
      angle: random() * Math.PI * 2,
      scale,
    });
    const bits = ["pebble-round-1", "pebble-round-3", "mushroom-common", "mushroom-laetiporus"];
    const beside = pastEdge(room, angle + (random() - 0.5) * 0.5, -0.8);
    piece(pieces, colliders, bits[Math.floor(random() * bits.length)], beside.x, beside.z, {
      angle: random() * Math.PI * 2,
      scale: 0.5 + random() * 0.4,
      solid: false,
    });
  }
}

/** The way out for depth 1, a faint daylight from above, else nothing: a light for `entry`. */
const daylight = (depth, entry) =>
  depth === 1 ? [{ x: entry.x, y: 3.2, z: entry.z, colour: 0xbcc8e0, range: 9 }] : [];

/**
 * A small cave for `seed` at `depth`: a little chamber where you come in, a winding passage or two on to
 * one or two chambers, and a side passage to a den. The way further down (when there is one) is at the
 * far side of the last chamber.
 */
export function cavePlan(seed, depth) {
  const random = rng(seed);
  const between = (low, high) => low + random() * (high - low);
  const rooms = [{ id: "in", x: 0, z: 0, w: between(6, 8), d: between(6, 8), shape: "chamber", tags: ["entry"] }];
  const passages = [];
  let heading = random() * Math.PI * 2;
  let from = rooms[0];
  const chambers = 1 + (random() < 0.5 ? 1 : 0);
  for (let i = 0; i < chambers; i++) {
    const w = between(10, 16);
    const d = between(9, 14);
    if (i) heading += between(-1, 1);
    const reach = Math.max(from.w, from.d) / 2 + Math.max(w, d) / 2 + between(8, 15);
    const room = {
      id: `chamber${i + 1}`,
      x: from.x + Math.sin(heading) * reach,
      z: from.z + Math.cos(heading) * reach,
      w,
      d,
      shape: "chamber",
      tags: [],
    };
    rooms.push(room);
    passages.push(winding(random, from, room, between(MIN_WIDTH, MIN_WIDTH + 1.2)));
    from = room;
  }
  // A side passage off a chamber to a den.
  const off = rooms[1 + Math.floor(random() * chambers)];
  const sideways = heading + (random() < 0.5 ? 1 : -1) * between(1.2, 1.9);
  const denAt = pastEdge(off, sideways, between(7, 11));
  const den = { id: "den", ...denAt, w: between(5, 7), d: between(5, 7), shape: "chamber", tags: ["den"] };
  rooms.push(den);
  passages.push(winding(random, off, den, between(MIN_WIDTH, MIN_WIDTH + 0.6)));

  const last = rooms[chambers];
  const toward = Math.atan2(rooms[1].x, rooms[1].z);
  const entry = { x: 0, z: 0, angle: toward };
  const kind = downKind(random, "cave", depth);
  const downAt = pastEdge(last, heading, -2.4);
  const down = kind ? { ...downAt, angle: heading, kind } : null;

  const pieces = [];
  const colliders = [];
  const lights = daylight(depth, entry);
  // Kept clear: where you come in, the way down, and every passage, end to end.
  const away = [
    { x: entry.x, z: entry.z, r: 3.5 },
    ...(down ? [{ x: down.x, z: down.z, r: 3.5 }] : []),
    ...passages.map((passage) => ({ points: passage.points, r: passage.width / 2 + 2.5 })),
  ];
  for (const room of rooms.slice(1, 1 + chambers)) {
    rubble(random, room, 2 + Math.floor(random() * 3), pieces, colliders, away);
    if (lights.length < 3 && random() < 0.8) crystals(random, room, pieces, colliders, lights, away);
  }
  if (lights.length < 3 && random() < 0.5) crystals(random, den, pieces, colliders, lights, away);

  // Who lives here: a den, one wandering the passages, and (deeper) something bigger in the last chamber.
  const spawns = [];
  const keep = [{ x: entry.x, z: entry.z, r: 8 }];
  const at = (room, tag) => {
    const spot = spotIn(random, room, colliders, 1.6, 1, keep);
    if (spot) spawns.push({ ...spot, tag });
  };
  at(den, "den");
  at(rooms[1], "den");
  const roaming = passages[Math.floor(random() * passages.length)];
  const middle = roaming.points[Math.floor(roaming.points.length / 2)];
  if (Math.hypot(middle.x - entry.x, middle.z - entry.z) >= 8) spawns.push({ x: middle.x, z: middle.z, tag: "wander" });
  if (depth >= 2 && random() < 0.5) at(last, "boss");

  const plan = {
    kind: "cave",
    seed,
    depth,
    bounds: boundsOf(rooms, passages, ROUGH.cave),
    rooms,
    passages,
    entry,
    down,
    pieces,
    colliders,
    lights,
    spawns,
  };
  plan.colliders = [...rockColliders(plan), ...colliders];
  return plan;
}

/**
 * A cavern for `seed` at `depth`: one big open space, come into by a short passage from a little chamber,
 * with rock pillars, a pool or a stream, rubble against its walls, crystals, sometimes a ruined tower, a
 * camp or a shrine standing in it, and a nook on the far side with the way further down.
 */
export function cavernPlan(seed, depth) {
  const random = rng(seed);
  const between = (low, high) => low + random() * (high - low);
  const cavern = { id: "cavern", x: 0, z: 0, w: between(34, 46), d: between(28, 38), shape: "chamber", tags: [] };
  const inAngle = random() * Math.PI * 2;
  const inRoom = { id: "in", ...pastEdge(cavern, inAngle, 9), w: 6, d: 6, shape: "chamber", tags: ["entry"] };
  const rooms = [cavern, inRoom];
  const mouthIn = { id: "cavern", ...pastEdge(cavern, inAngle, -3) };
  const passages = [winding(random, inRoom, mouthIn, between(MIN_WIDTH + 0.5, MIN_WIDTH + 1.5))];
  const kind = downKind(random, "cavern", depth);
  const downAngle = inAngle + Math.PI + between(-0.6, 0.6);
  let down = null;
  const mouths = [{ x: mouthIn.x, z: mouthIn.z }];
  if (kind) {
    const nook = { id: "down", ...pastEdge(cavern, downAngle, 7), w: 6, d: 6, shape: "chamber", tags: ["down"] };
    rooms.push(nook);
    const mouthOut = { id: "cavern", ...pastEdge(cavern, downAngle, -3) };
    passages.push(winding(random, mouthOut, nook, between(MIN_WIDTH, MIN_WIDTH + 1)));
    mouths.push({ x: mouthOut.x, z: mouthOut.z });
    down = { x: nook.x, z: nook.z, angle: downAngle, kind };
  }
  const entry = { x: inRoom.x, z: inRoom.z, angle: Math.atan2(-inRoom.x, -inRoom.z) };

  // What stands in it: each thing a circle, kept a passage's width from every other and from the walls,
  // and well away from the passages' mouths, so there's always a way round.
  const things = mouths.map((mouth) => ({ ...mouth, r: 6 }));
  const place = (r, inside = r + MIN_WIDTH + 0.5) => {
    for (let tries = 0; tries < 50; tries++) {
      const x = (random() * 2 - 1) * (cavern.w / 2);
      const z = (random() * 2 - 1) * (cavern.d / 2);
      if (intoRoom(cavern, x, z) < inside) continue;
      if (things.some((thing) => Math.hypot(thing.x - x, thing.z - z) < thing.r + r + MIN_WIDTH + 0.5)) continue;
      things.push({ x, z, r });
      return { x, z };
    }
    return null;
  };
  const rock = [];
  const pillars = 3 + Math.floor(random() * 4);
  for (let i = 0; i < pillars; i++) {
    const r = between(1.2, 2.4);
    const spot = place(r);
    if (spot) rock.push({ ...spot, r });
  }
  const water = [];
  const stream = random() < 0.3;
  const pool = stream ? { w: between(2.4, 3), d: between(12, 17) } : { w: between(6, 10), d: between(4, 7) };
  const poolAt = place(Math.max(pool.w, pool.d) / 2);
  if (poolAt) water.push({ ...poolAt, ...pool, angle: random() * Math.PI });

  const pieces = [];
  const colliders = [];
  const lights = [];
  const spawns = [];
  // Sometimes something built, standing in it.
  if (random() < 0.55) {
    const kinds = ["tower", "camp", "shrine"];
    const what = kinds[Math.floor(random() * kinds.length)];
    const at = place(3.4);
    if (at) structure(random, what, at, pieces, colliders, lights, spawns);
  }
  const away = [
    { x: entry.x, z: entry.z, r: 3.5 },
    ...(down ? [{ x: down.x, z: down.z, r: 3.5 }] : []),
    ...things.map((thing) => ({ x: thing.x, z: thing.z, r: thing.r + MIN_WIDTH + 1 })),
    ...passages.map((passage) => ({ points: passage.points, r: passage.width / 2 + 2.5 })),
  ];
  rubble(random, cavern, 5 + Math.floor(random() * 5), pieces, colliders, away);
  for (let i = 0; i < 2; i++) crystals(random, cavern, pieces, colliders, lights, away);

  const keep = [
    { x: entry.x, z: entry.z, r: 10 },
    ...rock.map((pillar) => ({ x: pillar.x, z: pillar.z, r: pillar.r + 1.2 })),
    ...water.map((pond) => ({ x: pond.x, z: pond.z, r: Math.max(pond.w, pond.d) / 2 + 1.2 })),
  ];
  for (const tag of ["den", "den", "wander", ...(depth >= 2 || random() < 0.4 ? ["boss"] : [])]) {
    const spot = spotIn(random, cavern, colliders, 2, 1, keep);
    if (spot) spawns.push({ ...spot, tag });
  }

  const plan = {
    kind: "cavern",
    seed,
    depth,
    bounds: boundsOf(rooms, passages, ROUGH.cavern),
    rooms,
    passages,
    entry,
    down,
    pieces,
    colliders,
    lights,
    spawns,
    rock,
    water,
  };
  plan.colliders = [...rockColliders(plan), ...colliders];
  return plan;
}

/**
 * Something built, standing at `at` in a cavern (within about 3.4 m of it): a ruined tower of brick
 * walls with a doorway, a camp of barrels and crates round a fire, or a shrine of candlesticks before an
 * offering chest and a glowing crystal. Who keeps it stands at it.
 */
function structure(random, what, at, pieces, colliders, lights, spawns) {
  const turn = Math.floor(random() * 4) * (Math.PI / 2);
  const local = (x, z) => ({
    x: at.x + x * Math.cos(turn) + z * Math.sin(turn),
    z: at.z - x * Math.sin(turn) + z * Math.cos(turn),
  });
  if (what === "tower") {
    // Four sides of two walls each, round a 4 m floor; one wall is the doorway and another has fallen.
    const walls = [];
    for (let side = 0; side < 4; side++)
      for (const along of [-1, 1]) {
        const angle = (side * Math.PI) / 2;
        walls.push({
          x: Math.sin(angle) * 2.2 + Math.cos(angle) * along,
          z: Math.cos(angle) * 2.2 - Math.sin(angle) * along,
          angle,
        });
      }
    const doorway = Math.floor(random() * walls.length);
    const fallen = (doorway + 2 + Math.floor(random() * 5)) % walls.length;
    walls.forEach((wall, i) => {
      if (i === doorway || i === fallen) return;
      const spot = local(wall.x, wall.z);
      piece(pieces, colliders, "wall-unevenbrick-straight", spot.x, spot.z, { angle: wall.angle + turn });
      if (random() < 0.4)
        piece(pieces, colliders, "wall-unevenbrick-straight", spot.x, spot.z, {
          angle: wall.angle + turn,
          y: 3.1,
          solid: false,
        });
    });
    const fall = local(walls[fallen].x * 1.3, walls[fallen].z * 1.3);
    piece(pieces, colliders, "pebble-round-3", fall.x, fall.z, { scale: 1.4, solid: false });
    spawns.push({ ...local(0, 0), tag: "guard" });
    return;
  }
  if (what === "camp") {
    const ring = ["barrel", "crate-wooden", "bag", "prop-crate", "barrel"];
    ring.forEach((name, i) => {
      const angle = (i / ring.length) * Math.PI * 2 + random() * 0.3;
      const spot = local(Math.sin(angle) * 2.6, Math.cos(angle) * 2.6);
      piece(pieces, colliders, name, spot.x, spot.z, { angle: random() * Math.PI * 2 });
    });
    lights.push({ ...local(0, 0), y: 0.6, colour: 0xff8a3a, range: 9 });
    spawns.push({ ...local(1.2, 0), tag: "guard" });
    return;
  }
  // A shrine.
  for (const x of [-1.3, 1.3]) {
    const spot = local(x, 0);
    piece(pieces, colliders, "candlestick-stand", spot.x, spot.z, { angle: turn });
  }
  const chest = local(0, 0.2);
  piece(pieces, colliders, "chest-wood", chest.x, chest.z, { angle: turn, scale: 0.8 });
  const vase = local(0.8, 1.2);
  piece(pieces, colliders, "vase-2", vase.x, vase.z, { scale: 0.8 });
  const stone = local(0, -1.2);
  piece(pieces, colliders, "crystal-3", stone.x, stone.z, { angle: random() * 6.3, scale: 0.18, glow: true });
  lights.push({ ...local(0, 0), y: 1.6, colour: 0xffd27a, range: 9 });
  spawns.push({ ...local(0, 2.2), tag: "guard" });
}
