// Dungeons and strongholds for the deep places (docs/QUESTS.md section 8): a crypt, a ruin or a sealed
// vault, or a bandit or faction keep with its hall, barracks, store rooms, cells and the leader's room.
// Each is laid on a 4 m grid of the Modular Dungeon kit's pieces (kit/fantasy/dungeon, its 2 m floor and
// wall drawn at twice their size), furnished from the props kit.
//
// dungeonPlan makes a level as plain data, in the level plan the deep places share with the caves and
// caverns; buildDungeon lays a plan out in a three.js Group from the kit.
//
// The level's own space: the floor's top at y = 0, +y up. A room's x, z is its middle and w, d its size in
// metres; a collider's too. A piece at angle a faces (sin a, cos a), as interiors.js turns furniture: a
// bed or a chest has its back to the wall, and the kit's wall-hung pieces (torch, banner) their backs at −z.
import { Group, InstancedMesh, Matrix4, Mesh, Quaternion, Vector3 } from "three";
import { kitModel } from "./kit.js";
import { hashString, rng } from "./world.js";

/** The grid's cell, in metres: one floor tile, one wall's length, one doorway. */
export const CELL = 4;
const HALF = CELL / 2;
/** A wall's thickness (the kit's 0.44 m wall at twice its size), and from its line to its face. */
const WALL = 0.9;
const FACE = WALL / 2;
/** An arch leaves 2.2 m open; its posts take the rest of the cell's edge. */
const OPENING = 1.1;
/** At most this many pieces in a level, so a phone can draw it. */
export const PIECE_BUDGET = 650;
const TORCH_LIGHT = 0xff9a4a;
const QUARTER = Math.PI / 2;

/**
 * Props by name: their kit, their footprint as the model stands facing +z (w across, d deep), and `flat`
 * for the small ones nothing bumps into (no collider).
 */
const PROPS = {
  barrel: { kit: "props", w: 0.7, d: 0.7 },
  "crate-wooden": { kit: "props", w: 0.84, d: 0.91 },
  bag: { kit: "props", w: 0.66, d: 0.54 },
  "chest-wood": { kit: "props", w: 1.28, d: 0.76 },
  weaponstand: { kit: "props", w: 1.39, d: 0.98 },
  "bed-twin1": { kit: "props", w: 1.88, d: 2.41 },
  "table-large": { kit: "props", w: 2.85, d: 1.1 },
  bench: { kit: "props", w: 2.78, d: 0.53 },
  "chair-1": { kit: "props", w: 0.58, d: 0.55 },
  "bucket-wooden-1": { kit: "props", w: 0.43, d: 0.38, flat: true },
  "coin-pile": { kit: "props", w: 0.2, d: 0.15, flat: true },
  pedestal: { kit: "dungeon", w: 1.95, d: 1.96 },
  woodfire: { kit: "dungeon", w: 0.8, d: 0.8 },
  skull: { kit: "dungeon", w: 0.6, d: 0.44, flat: true },
  cobweb: { kit: "dungeon", w: 1.21, d: 0.91, flat: true },
};

const cellKey = (i, j) => `${i},${j}`;
const SIDES = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];
/** Whether two boxes ({ x, z, w, d }) overlap by more than a hair. */
const overlaps = (a, b) => Math.abs(a.x - b.x) * 2 < a.w + b.w - 0.01 && Math.abs(a.z - b.z) * 2 < a.d + b.d - 0.01;
const round = (value) => Math.round(value * 1000) / 1000;

/**
 * What each kind is made of: rooms in the order they're laid, each with its size in cells [w, d], its
 * shape and tags, which room it hangs off (a tag; the first room with it) and what stands in its doorway.
 */
function program(kind, variant, depth, random) {
  const pick = (list) => list[Math.floor(random() * list.length)];
  const turn = (w, d) => (random() < 0.5 ? [w, d] : [d, w]);
  if (kind === "stronghold") {
    const rooms = [
      { tags: ["entry"], size: [2, 2] },
      { tags: ["hall"], shape: "hall", size: turn(4, pick([5, 6])), parent: "entry" },
      { tags: ["barracks"], size: turn(3, pick([3, 4])), parent: "hall" },
      { tags: ["store"], size: turn(2, 3), parent: pick(["hall", "barracks"]) },
      { tags: ["leader"], size: [3, 3], parent: "hall", door: "door" },
      { tags: ["gaol"], size: turn(2, 3), parent: pick(["hall", "barracks"]) },
    ];
    const cells = 2 + Math.floor(random() * 2);
    for (let n = 0; n < cells; n++)
      rooms.push({ tags: ["cell"], shape: "cell", size: [1, 1], parent: "gaol", door: "bars" });
    rooms.push({ tags: ["cellar"], size: [2, 2], parent: "store" });
    return rooms;
  }
  // A dungeon: rooms off one another, one big pillared hall in a crypt, and its end the farthest room.
  const purpose = { crypt: "tomb", ruin: "ruin", vault: "guardroom" }[variant];
  const rooms = [{ tags: ["entry"], size: [2, 2] }];
  const count = 4 + Math.floor(random() * 2) + Math.min(depth - 1, 2);
  for (let n = 0; n < count; n++) {
    const hall = variant === "crypt" && n === 1;
    const tags = hall ? ["hall"] : n === 2 && variant === "ruin" ? ["ruin", "camp"] : [purpose];
    rooms.push({
      tags,
      shape: hall ? "hall" : "room",
      size: hall ? turn(4, 5) : turn(2 + Math.floor(random() * 2), 2 + Math.floor(random() * 3)),
      parent: "recent",
    });
  }
  rooms.push({
    tags: variant === "vault" ? ["end", "vault"] : ["end", purpose],
    shape: "chamber",
    size: [3, 3],
    parent: "farthest",
    door: variant === "vault" ? "door" : null,
  });
  return rooms;
}

/** The rooms and corridors on the grid: which space each cell belongs to, and the doorways between them. */
function layOut(rooms, random) {
  const cells = new Map(); // cell key → space id (a room's or a passage's)
  const placed = [];
  const passages = [];
  const doorways = new Map(); // edge key → doorway
  const edgeKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);
  const free = (i, j) => !cells.has(cellKey(i, j));

  /** Where a room w × d could hang off `parent` by a corridor `run` cells long, or null if it doesn't fit. */
  const fit = (parent, w, d, [dx, dz], offset, run, childOffset) => {
    const along = dx ? parent.d : parent.w;
    const across = dx ? d : w;
    if (offset >= along || childOffset >= across) return null;
    const si = dx > 0 ? parent.i + parent.w - 1 : dx < 0 ? parent.i : parent.i + offset;
    const sj = dz > 0 ? parent.j + parent.d - 1 : dz < 0 ? parent.j : parent.j + offset;
    const corridor = [];
    for (let k = 1; k <= run; k++) corridor.push([si + dx * k, sj + dz * k]);
    const [ei, ej] = [si + dx * (run + 1), sj + dz * (run + 1)];
    const i = dx > 0 ? ei : dx < 0 ? ei - (w - 1) : ei - childOffset;
    const j = dz > 0 ? ej : dz < 0 ? ej - (d - 1) : ej - childOffset;
    if (!corridor.every(([ci, cj]) => free(ci, cj))) return null;
    const last = corridor[corridor.length - 1];
    // The room and a cell's margin round it are empty, but for the corridor coming in.
    for (let ci = i - 1; ci <= i + w; ci++) {
      for (let cj = j - 1; cj <= j + d; cj++) {
        if (ci === last[0] && cj === last[1]) continue;
        if (!free(ci, cj)) return null;
      }
    }
    return { i, j, start: [si, sj], corridor, end: [ei, ej] };
  };

  const commit = (room, spot, parent) => {
    Object.assign(room, { i: spot.i, j: spot.j });
    for (let ci = room.i; ci < room.i + room.w; ci++) {
      for (let cj = room.j; cj < room.j + room.d; cj++) cells.set(cellKey(ci, cj), room.id);
    }
    placed.push(room);
    if (!parent) return;
    const passage = { id: `p${passages.length}`, from: parent.id, to: room.id, cells: spot.corridor };
    passages.push(passage);
    for (const [ci, cj] of spot.corridor) cells.set(cellKey(ci, cj), passage.id);
    const first = spot.corridor[0];
    const last = spot.corridor[spot.corridor.length - 1];
    for (const [a, b, door, between] of [
      [spot.start, first, null, [parent.id, passage.id]],
      [last, spot.end, room.door ?? null, [passage.id, room.id]],
    ]) {
      const crossX = a[0] !== b[0];
      doorways.set(edgeKey(cellKey(...a), cellKey(...b)), {
        x: round(((a[0] + b[0]) / 2) * CELL),
        z: round(((a[1] + b[1]) / 2) * CELL),
        angle: crossX ? QUARTER : 0,
        door,
        between,
      });
    }
    passage.doorways = [
      edgeKey(cellKey(...spot.start), cellKey(...first)),
      edgeKey(cellKey(...last), cellKey(...spot.end)),
    ];
  };

  /** How many doorways from the entry to each room. */
  const steps = () => {
    const out = new Map([[placed[0].id, 0]]);
    for (let changed = true; changed;) {
      changed = false;
      for (const passage of passages) {
        if (out.has(passage.from) && !out.has(passage.to)) {
          out.set(passage.to, out.get(passage.from) + 1);
          changed = true;
        }
      }
    }
    return out;
  };

  rooms.forEach((spec, index) => {
    const [w, d] = spec.size;
    const room = { id: `r${index}`, w, d, shape: spec.shape ?? "room", tags: spec.tags, door: spec.door };
    if (!index) return commit(room, { i: 0, j: 0 });
    // The room it hangs off first, then any other, nearest the end of the list first.
    let parents;
    if (spec.parent === "recent") parents = placed.slice(-2).reverse();
    else if (spec.parent === "farthest") {
      const far = steps();
      parents = [...placed].sort((a, b) => far.get(b.id) - far.get(a.id));
    } else parents = placed.filter((other) => other.tags.includes(spec.parent));
    parents = [...parents, ...[...placed].reverse().filter((other) => !parents.includes(other))];
    // A few tries at random, then every way in turn, so a room always finds somewhere.
    const tries = [];
    for (let n = 0; n < 30; n++) {
      tries.push([
        parents[0],
        SIDES[Math.floor(random() * 4)],
        Math.floor(random() * 6),
        1 + Math.floor(random() * 3),
        Math.floor(random() * 6),
      ]);
    }
    for (const parent of parents) {
      for (let run = 1; run <= 4; run++) {
        for (const side of SIDES) {
          for (let offset = 0; offset < 6; offset++) {
            for (let childOffset = 0; childOffset < 6; childOffset++)
              tries.push([parent, side, offset, run, childOffset]);
          }
        }
      }
    }
    for (const [parent, side, offset, run, childOffset] of tries) {
      const spot = fit(parent, w, d, side, offset, run, childOffset);
      if (spot) return commit(room, spot, parent);
    }
    throw new Error(`no room for ${spec.tags.join(" ")}`);
  });
  return { rooms: placed, passages, cells, doorways, edgeKey, steps: steps() };
}

/**
 * The level plan for one dungeon or stronghold. `kind`: "dungeon" (a crypt, a ruin or a sealed vault,
 * chosen by the seed) or "stronghold" (a bandit or faction keep). `depth` 1 is the first level below the
 * entrance. The same seed, depth and kind always give the same level.
 *
 * Besides the shared fields it has `variant` ("crypt", "ruin", "vault" or "keep"), `doorways`
 * ([{ x, z, angle, door: null | "door" | "bars", between: [space ids] }]: a door or bars stand closed in
 * its arch; nothing stops anyone going through yet), each collider's `what`, and each room's `grid`
 * ({ i, j, w, d } in cells).
 */
export function dungeonPlan(seed, depth = 1, kind = "dungeon") {
  const random = rng(hashString(`${seed}:deep:${kind}:${depth}`));
  const chance = (p) => random() < p;
  const pickFrom = (list) => list[Math.floor(random() * list.length)];
  const variant = kind === "stronghold" ? "keep" : pickFrom(["crypt", "ruin", "vault"]);
  const level = layOut(program(kind, variant, depth, random), random);
  const { cells, doorways, edgeKey } = level;

  const pieces = [];
  const colliders = [];
  const lights = [];
  const spawns = [];
  const taken = []; // footprints of what stands on the floor, so nothing is put through anything
  const reserved = []; // kept clear of furniture: in front of doorways, the stairs, the way down
  const slots = []; // a wall's inside face, by its edge: { x, z, fx, fz, angle, space, cell }
  const mounted = new Set(); // slots with a torch or banner on them
  const piece = (kit, name, x, y, z, angle = 0, scale = 1) =>
    pieces.push({ kit, name, x: round(x), y: round(y), z: round(z), angle: round(angle), scale });
  const collide = (x, z, w, d, what) =>
    colliders.push({ x: round(x), z: round(z), w: round(w), d: round(d), angle: 0, what });

  // ── The structure: floors, walls, arches and the pillars where walls meet ──
  const corners = new Map(); // vertex key → { x: along x, z: along z } lines meeting there
  const meet = (vx, vz, line) => {
    const key = `${vx},${vz}`;
    corners.set(key, { ...corners.get(key), [line]: true });
  };
  const done = new Set();
  for (const [key, space] of cells) {
    const [i, j] = key.split(",").map(Number);
    piece("dungeon", "floor-modular", i * CELL, -0.26, j * CELL, 0, 2);
    for (const [dx, dz] of SIDES) {
      const other = cellKey(i + dx, j + dz);
      if (cells.get(other) === space) continue;
      const edge = edgeKey(key, other);
      const x = (i + dx / 2) * CELL;
      const z = (j + dz / 2) * CELL;
      const angle = dx ? QUARTER : 0;
      // The edge's two ends, in half cells, and which way its line runs.
      const ends = dx
        ? [
            [2 * i + dx, 2 * j - 1],
            [2 * i + dx, 2 * j + 1],
          ]
        : [
            [2 * i - 1, 2 * j + dz],
            [2 * i + 1, 2 * j + dz],
          ];
      for (const [vx, vz] of ends) meet(vx, vz, dx ? "z" : "x");
      // Each side of a wall that has a floor gets a slot on its face.
      if (!doorways.has(edge)) {
        for (const [ci, cj, sx, sz] of [
          [i, j, -dx, -dz],
          [i + dx, j + dz, dx, dz],
        ]) {
          const owner = cells.get(cellKey(ci, cj));
          if (owner === undefined || done.has(edge)) continue;
          slots.push({
            x: x + sx * FACE,
            z: z + sz * FACE,
            fx: sx,
            fz: sz,
            angle: Math.atan2(sx, sz),
            space: owner,
            cell: cellKey(ci, cj),
            edge,
          });
        }
      }
      if (done.has(edge)) continue;
      done.add(edge);
      const doorway = doorways.get(edge);
      if (!doorway) {
        piece("dungeon", "wall-modular", x, HALF, z, angle, 2);
        collide(x, z, dx ? WALL : CELL, dx ? CELL : WALL, "wall");
        continue;
      }
      piece("dungeon", "arch", x, 0, z, angle);
      if (doorway.door) piece("dungeon", doorway.door === "bars" ? "arch-bars" : "arch-door", x, 0, z, angle);
      // The arch's two posts, from the opening to the cell's corner.
      const post = HALF - OPENING - 0.05;
      for (const side of [-1, 1]) {
        const along = side * (OPENING + 0.05 + post / 2);
        collide(x + (dx ? 0 : along), z + (dx ? along : 0), dx ? 1 : post, dx ? post : 1, "arch");
      }
      // Furniture keeps out of the way in: from the middle of one cell to the middle of the other.
      reserved.push({ x, z, w: dx ? CELL + 0.6 : 2.6, d: dx ? 2.6 : CELL + 0.6 });
    }
  }
  for (const [key, lines] of corners) {
    if (!lines.x || !lines.z) continue;
    const [vx, vz] = key.split(",").map(Number);
    piece("dungeon", "column", vx * HALF, 0, vz * HALF);
    collide(vx * HALF, vz * HALF, 1.3, 1.3, "column");
    taken.push({ x: vx * HALF, z: vz * HALF, w: 1.3, d: 1.3 });
  }

  const rooms = level.rooms;
  const inner = (room) => ({
    x: (room.i + (room.w - 1) / 2) * CELL,
    z: (room.j + (room.d - 1) / 2) * CELL,
    w: room.w * CELL - WALL,
    d: room.d * CELL - WALL,
  });
  const inside = (box, room) => {
    const area = inner(room);
    return (
      Math.abs(box.x - area.x) * 2 <= area.w - box.w + 0.01 && Math.abs(box.z - area.z) * 2 <= area.d - box.d + 0.01
    );
  };

  /** A prop at (x, z) facing `angle` (a quarter turn), if it fits in `room` clear of everything else. */
  const prop = (room, name, x, z, angle, { scale = 1, anywhere = false } = {}) => {
    const info = PROPS[name];
    const across = Math.round(angle / QUARTER) % 2 !== 0;
    const box = {
      x,
      z,
      w: (across ? info.d : info.w) * scale,
      d: (across ? info.w : info.d) * scale,
    };
    if (!inside(box, room) || taken.some((other) => overlaps(box, other))) return false;
    if (!anywhere && reserved.some((other) => overlaps(box, other))) return false;
    taken.push(box);
    piece(info.kit, name, x, 0, z, angle, scale);
    if (!info.flat) collide(x, z, box.w, box.d, "prop");
    return true;
  };
  /** A prop with its back to the wall at `slot` (or its side, `along`). */
  const againstWall = (room, slot, name, { scale = 1, along = false } = {}) => {
    const info = PROPS[name];
    const depth = (along ? info.w : info.d) * scale;
    const angle = along ? slot.angle + QUARTER : slot.angle;
    return prop(room, name, slot.x + slot.fx * (depth / 2 + 0.05), slot.z + slot.fz * (depth / 2 + 0.05), angle, {
      scale,
    });
  };
  const slotsOf = (space) => {
    const list = slots.filter((slot) => slot.space === space);
    // Shuffled by the seed (Fisher–Yates), so the same level always has the same things in the same places.
    for (let n = list.length - 1; n > 0; n--) {
      const k = Math.floor(random() * (n + 1));
      [list[n], list[k]] = [list[k], list[n]];
    }
    return list;
  };

  // ── The way in: stairs up against an outer wall of the first room ──
  const entryRoom = rooms[0];
  const stairsSlot = slotsOf(entryRoom.id).find((slot) => {
    const [i, j] = slot.cell.split(",").map(Number);
    // Its cell has no doorway, and the cell in front of the stairs is the room's too.
    const clear = SIDES.every(([dx, dz]) => !doorways.has(edgeKey(slot.cell, cellKey(i + dx, j + dz))));
    return clear && cells.get(cellKey(i + slot.fx, j + slot.fz)) === entryRoom.id;
  });
  const [si, sj] = stairsSlot.cell.split(",").map(Number);
  // The kit's stairs climb towards −z: towards the wall, away from the room.
  piece("dungeon", "stairs-modular", si * CELL, HALF, sj * CELL, stairsSlot.angle, 2);
  collide(si * CELL, sj * CELL, CELL - WALL, CELL - WALL, "stairs");
  taken.push({ x: si * CELL, z: sj * CELL, w: CELL - WALL, d: CELL - WALL });
  const entry = {
    x: round(si * CELL + stairsSlot.fx * (HALF + 0.9)),
    z: round(sj * CELL + stairsSlot.fz * (HALF + 0.9)),
    angle: round(stairsSlot.angle),
  };
  reserved.push({ x: entry.x, z: entry.z, w: 2.6, d: 2.6 });
  const stairsCell = stairsSlot.cell;
  for (let n = slots.length - 1; n >= 0; n--) if (slots[n].cell === stairsCell) slots.splice(n, 1);

  // ── The way further down, sometimes ──
  let down = null;
  if (kind === "stronghold" && chance(0.6)) {
    // A trapdoor in the cellar's floor, down to a cave below.
    const cellar = rooms.find((room) => room.tags.includes("cellar"));
    const spot = inner(cellar);
    piece("dungeon", "trapdoor", spot.x, 0, spot.z, 0);
    taken.push({ x: spot.x, z: spot.z, w: 1.8, d: 1.8 });
    reserved.push({ x: spot.x, z: spot.z, w: 2.6, d: 2.6 });
    down = { x: round(spot.x), z: round(spot.z), angle: 0, kind: "cave" };
  } else if (kind === "dungeon" && chance(0.5)) {
    // The far wall has given way into natural rock: the room farthest in, a wall with nothing behind it.
    const far = [...rooms].sort((a, b) => level.steps.get(b.id) - level.steps.get(a.id));
    for (const room of far) {
      const slot = slotsOf(room.id).find((candidate) => {
        const [i, j] = candidate.cell.split(",").map(Number);
        return !cells.has(cellKey(i - candidate.fx, j - candidate.fz));
      });
      if (!slot) continue;
      const lineX = slot.x - slot.fx * FACE;
      const lineZ = slot.z - slot.fz * FACE;
      const wall = pieces.findIndex(
        (one) => one.name === "wall-modular" && Math.abs(one.x - lineX) < 0.01 && Math.abs(one.z - lineZ) < 0.01,
      );
      pieces.splice(wall, 1);
      const collider = colliders.find(
        (one) => one.what === "wall" && Math.abs(one.x - lineX) < 0.01 && Math.abs(one.z - lineZ) < 0.01,
      );
      collider.what = "rock"; // still in the way: the way down is a place to stand, not a hole to fall in
      const ax = slot.fz; // along the wall
      const az = slot.fx;
      for (const side of [-1, 1]) {
        piece(
          "nature",
          "rock-medium-2",
          lineX + ax * side * 1.4 - slot.fx * 0.3,
          0,
          lineZ + az * side * 1.4 - slot.fz * 0.3,
          random() * 6.28,
          0.6,
        );
      }
      // Rock fills the gap from behind: the natural rock the wall gave way into.
      piece("nature", "rock-big-1", lineX - slot.fx * 2.4, -0.3, lineZ - slot.fz * 2.4, random() * 6.28, 0.8);
      down = {
        x: round(slot.x + slot.fx * 1.2),
        z: round(slot.z + slot.fz * 1.2),
        angle: round(slot.angle + Math.PI),
        kind: "cave",
      };
      reserved.push({ x: down.x, z: down.z, w: 2.6, d: 2.6 });
      mounted.add(slot);
      break;
    }
  }

  // ── Torches and banners on the walls ──
  const hang = (slot, what) => {
    mounted.add(slot);
    if (what === "torch") {
      piece("dungeon", "torch", slot.x + slot.fx * 0.3, 2, slot.z + slot.fz * 0.3, slot.angle);
      lights.push({
        x: round(slot.x + slot.fx * 0.65),
        y: 2.7,
        z: round(slot.z + slot.fz * 0.65),
        colour: TORCH_LIGHT,
        range: 8,
      });
    } else piece("dungeon", "banner-wall", slot.x + slot.fx * 0.5, 3.7, slot.z + slot.fz * 0.5, slot.angle);
  };
  const bare = (list) => list.filter((slot) => !mounted.has(slot));
  for (const room of rooms) {
    const list = slotsOf(room.id);
    const size = room.w * room.d;
    const torches = room.shape === "cell" ? 0 : room.shape === "hall" ? 4 : size >= 9 ? 2 : 1;
    for (const slot of bare(list).slice(0, torches)) hang(slot, "torch");
    const banners = kind === "stronghold" ? { hall: 2, leader: 1, barracks: 1 } : {};
    const count = room.tags.reduce((sum, tag) => sum + (banners[tag] ?? 0), 0);
    for (const slot of bare(list).slice(0, count)) hang(slot, "banner");
  }
  for (const passage of level.passages) {
    if (passage.cells.length < 2 || (kind === "dungeon" && chance(0.4))) continue;
    const slot = bare(slotsOf(passage.id))[0];
    if (slot) hang(slot, "torch");
  }

  // ── What's in each room, by what it's for ──
  const fill = (room, names, opts) => {
    let n = 0;
    for (const slot of slotsOf(room.id)) {
      if (n >= names.length) break;
      if (againstWall(room, slot, names[n], opts)) n++;
    }
    return n;
  };
  const scatter = (room, names, count) => {
    const list = slotsOf(room.id);
    for (let n = 0; n < count && n < list.length; n++) againstWall(room, list[n], pickFrom(names), { scale: 0.9 });
  };
  for (const room of rooms) {
    const area = inner(room);
    const tags = room.tags;
    if (room.shape === "hall") {
      // Two rows of pillars down the long sides, a long table down the middle.
      const long = room.d > room.w;
      for (let a = 0; a < (long ? room.d : room.w) - 1; a += 2) {
        for (const b of [0, 2]) {
          const vi = long ? room.i + b : room.i + a;
          const vj = long ? room.j + a : room.j + b;
          const x = (vi + 0.5) * CELL;
          const z = (vj + 0.5) * CELL;
          piece("dungeon", "column", x, 0, z);
          collide(x, z, 1.3, 1.3, "column");
          taken.push({ x, z, w: 1.3, d: 1.3 });
        }
      }
      const angle = long ? QUARTER : 0;
      if (kind === "stronghold" && prop(room, "table-large", area.x, area.z, angle, { anywhere: true })) {
        for (const side of [-1, 1]) {
          prop(room, "bench", area.x + (long ? side * 0.95 : 0), area.z + (long ? 0 : side * 0.95), angle, {
            anywhere: true,
          });
        }
      }
      if (kind === "dungeon") scatter(room, ["skull", "cobweb"], 3);
      else fill(room, ["barrel", "barrel", "weaponstand"]);
    }
    if (tags.includes("barracks")) {
      fill(room, ["bed-twin1", "bed-twin1", "bed-twin1", "bed-twin1"], { scale: 0.7, along: true });
      fill(room, ["weaponstand", "chest-wood", "barrel"]);
    }
    if (tags.includes("store"))
      fill(room, ["barrel", "crate-wooden", "barrel", "crate-wooden", "bag", "barrel", "crate-wooden"]);
    if (tags.includes("cellar")) fill(room, ["barrel", "barrel", "crate-wooden", "bag"]);
    if (tags.includes("leader")) {
      fill(room, ["bed-twin1"], { scale: 0.8, along: true });
      fill(room, ["chest-wood", "weaponstand"]);
      prop(room, "table-large", area.x, area.z, 0, { scale: 0.7 });
      prop(room, "chair-1", area.x, area.z - 1.1, 0);
    }
    if (tags.includes("gaol")) fill(room, ["bench", "barrel", "bucket-wooden-1"]);
    if (tags.includes("cell")) {
      // The captive sits in the middle; a bucket and old bones in the corners of the back wall.
      const way = [...doorways.values()].find((doorway) => doorway.between.includes(room.id));
      const back = slotsOf(room.id).sort(
        (a, b) => Math.hypot(b.x - way.x, b.z - way.z) - Math.hypot(a.x - way.x, a.z - way.z),
      )[0];
      for (const [name, side] of [
        ["bucket-wooden-1", -1],
        ["skull", 1],
      ]) {
        const x = back.x + back.fx * 0.4 + back.fz * side * 1.1;
        const z = back.z + back.fz * 0.4 + back.fx * side * 1.1;
        prop(room, name, x, z, back.angle, { anywhere: true });
      }
    }
    if (tags.includes("tomb")) {
      if (room.shape !== "hall" && prop(room, "pedestal", area.x, area.z, 0, { scale: 0.6 }) && tags.includes("end")) {
        piece("props", "coin-pile", area.x, 1.32, area.z); // on the pedestal
      }
      scatter(room, ["skull", "cobweb"], 3);
    }
    if (tags.includes("ruin")) {
      fill(room, ["crate-wooden", "barrel", "cobweb"], { scale: 0.9 });
      scatter(room, ["skull", "cobweb"], 2);
    }
    if (tags.includes("camp") && prop(room, "woodfire", area.x, area.z, 0)) {
      lights.push({ x: round(area.x), y: 0.9, z: round(area.z), colour: TORCH_LIGHT, range: 7 });
      fill(room, ["bag", "barrel"]);
    }
    if (tags.includes("guardroom")) fill(room, ["weaponstand", "barrel", "crate-wooden"]);
    if (tags.includes("vault")) {
      prop(room, "pedestal", area.x, area.z, 0, { scale: 0.6 });
      fill(room, ["chest-wood", "chest-wood", "coin-pile"]);
    }
    if (tags.includes("end") && tags.includes("ruin")) fill(room, ["chest-wood"]);
  }

  // ── Who's where: guards in the hall and barracks, the boss at the end, captives in the cells ──
  const blocked = (x, z, margin) =>
    colliders.some((box) => Math.abs(x - box.x) < box.w / 2 + margin && Math.abs(z - box.z) < box.d / 2 + margin) ||
    taken.some((box) => Math.abs(x - box.x) < box.w / 2 + margin && Math.abs(z - box.z) < box.d / 2 + margin);
  const standOn = (room, tag, count) => {
    const area = inner(room);
    const spots = [];
    for (let ci = room.i; ci < room.i + room.w; ci++) {
      for (let cj = room.j; cj < room.j + room.d; cj++) {
        for (const [ox, oz] of [
          [0, 0],
          [-1, -1],
          [1, 1],
          [-1, 1],
          [1, -1],
        ])
          spots.push({ x: ci * CELL + ox, z: cj * CELL + oz });
      }
    }
    if (room.shape === "cell") spots.unshift({ x: area.x, z: area.z });
    else {
      for (let n = spots.length - 1; n > 0; n--) {
        const k = Math.floor(random() * (n + 1));
        [spots[n], spots[k]] = [spots[k], spots[n]];
      }
    }
    let added = 0;
    for (const spot of spots) {
      if (added >= count) break;
      if (blocked(spot.x, spot.z, 0.5) || Math.hypot(spot.x - entry.x, spot.z - entry.z) < 4) continue;
      if (spawns.some((other) => Math.hypot(other.x - spot.x, other.z - spot.z) < 1.5)) continue;
      if (down && Math.hypot(spot.x - down.x, spot.z - down.z) < 1.5) continue;
      spawns.push({ x: round(spot.x), z: round(spot.z), tag });
      added++;
    }
  };
  for (const room of rooms) {
    const tags = room.tags;
    if (tags.includes("entry")) continue;
    if (kind === "stronghold") {
      if (tags.includes("hall")) {
        standOn(room, "guard", 2);
        standOn(room, "wander", 1);
      }
      if (tags.includes("barracks")) standOn(room, "guard", 2 + Math.floor(random() * 2));
      if (tags.includes("leader")) {
        standOn(room, "boss", 1);
        standOn(room, "guard", 1);
      }
      if (tags.includes("gaol")) standOn(room, "guard", 1);
      if (tags.includes("cell")) standOn(room, "captive", 1);
      if (tags.includes("store") || tags.includes("cellar")) standOn(room, "wander", chance(0.5) ? 1 : 0);
    } else if (tags.includes("end")) {
      standOn(room, "boss", 1);
      standOn(room, variant === "vault" ? "guard" : "wander", 1);
    } else if (tags.includes("guardroom")) standOn(room, "guard", 2);
    else standOn(room, "wander", 1 + Math.floor(random() * 2));
  }

  // ── Over budget, the last props go first ──
  while (pieces.length > PIECE_BUDGET) {
    const last = pieces.findLastIndex((one) => PROPS[one.name]);
    if (last < 0) break;
    const [gone] = pieces.splice(last, 1);
    const index = colliders.findIndex((one) => one.what === "prop" && one.x === gone.x && one.z === gone.z);
    if (index >= 0) colliders.splice(index, 1);
  }

  const xs = [...cells.keys()].map((key) => Number(key.split(",")[0]));
  const zs = [...cells.keys()].map((key) => Number(key.split(",")[1]));
  return {
    kind,
    seed,
    depth,
    variant,
    bounds: {
      minX: Math.min(...xs) * CELL - HALF - FACE,
      minZ: Math.min(...zs) * CELL - HALF - FACE,
      maxX: Math.max(...xs) * CELL + HALF + FACE,
      maxZ: Math.max(...zs) * CELL + HALF + FACE,
    },
    rooms: rooms.map((room) => {
      const area = inner(room);
      return {
        id: room.id,
        x: round(area.x),
        z: round(area.z),
        w: room.w * CELL,
        d: room.d * CELL,
        shape: room.shape,
        tags: room.tags,
        grid: { i: room.i, j: room.j, w: room.w, d: room.d },
      };
    }),
    passages: level.passages.map((passage) => ({
      id: passage.id,
      from: passage.from,
      to: passage.to,
      points: passage.doorways.map((edge) => ({ x: doorways.get(edge).x, z: doorways.get(edge).z })),
      width: CELL - WALL,
    })),
    doorways: [...doorways.values()],
    entry,
    down,
    pieces,
    colliders,
    lights,
    spawns,
  };
}

/**
 * Lays a plan out in a three.js Group from the kit: one InstancedMesh per part of each model, so a level
 * is a few dozen draw calls; doors and bars are meshes of their own, to open or hide. `load(set, name)`
 * gives a model's parts (kit.js kitModel; a test passes its own). Returns { object, colliders (boxes for
 * world.js createCollider), doors ([{ doorway, objects }]), ready (resolves once every model is in; a
 * model that won't load leaves a gap) }. Lights are left to the caller, which knows how many a phone takes.
 */
export function buildDungeon(plan, load = kitModel) {
  const object = new Group();
  object.name = `${plan.kind} ${plan.seed}:${plan.depth}`;
  const byModel = new Map();
  for (const one of plan.pieces) {
    const key = `${one.kit}/${one.name}`;
    if (!byModel.has(key)) byModel.set(key, []);
    byModel.get(key).push(one);
  }
  const doors = (plan.doorways ?? []).filter((doorway) => doorway.door).map((doorway) => ({ doorway, objects: [] }));
  const doorAt = (one) =>
    doors.find(({ doorway }) => Math.abs(doorway.x - one.x) < 0.01 && Math.abs(doorway.z - one.z) < 0.01);
  const matrix = (one) =>
    new Matrix4().compose(
      new Vector3(one.x, one.y, one.z),
      new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), one.angle),
      new Vector3(one.scale, one.scale, one.scale),
    );
  const ready = Promise.all(
    [...byModel].map(async ([key, list]) => {
      const [set, name] = key.split("/");
      let parts;
      try {
        parts = await load(set, name);
      } catch {
        return;
      }
      const isDoor = name === "arch-door" || name === "arch-bars";
      for (const { geometry, material } of parts) {
        if (isDoor) {
          for (const one of list) {
            const mesh = new Mesh(geometry, material);
            mesh.applyMatrix4(matrix(one));
            object.add(mesh);
            doorAt(one)?.objects.push(mesh);
          }
          continue;
        }
        const mesh = new InstancedMesh(geometry, material, list.length);
        list.forEach((one, index) => mesh.setMatrixAt(index, matrix(one)));
        mesh.computeBoundingSphere();
        mesh.name = name;
        object.add(mesh);
      }
    }),
  ).then(() => object);
  const colliders = plan.colliders.map((box, index) => ({
    id: `deep-${index}`,
    minX: box.x - box.w / 2,
    maxX: box.x + box.w / 2,
    minZ: box.z - box.d / 2,
    maxZ: box.z + box.d / 2,
  }));
  return { object, colliders, doors, ready };
}
