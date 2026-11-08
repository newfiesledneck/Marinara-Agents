// The world: rolling low-poly ground, a seeded town around the spawn point, and instanced trees and
// rocks outside it. Everything is seeded, so the same seed always gives the same layout.
//
// Draw calls stay flat however big the town is: every building, road and fountain is merged into one
// vertex-coloured mesh, and trees, rocks and lamps are instanced.
import {
  BoxGeometry,
  Color,
  DataTexture,
  DoubleSide,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  DodecahedronGeometry,
  Float32BufferAttribute,
  Fog,
  HemisphereLight,
  IcosahedronGeometry,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshLambertMaterial,
  Object3D,
  LinearFilter,
  PlaneGeometry,
  RepeatWrapping,
  Scene,
  SRGBColorSpace,
  Vector3,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { DOOR_PIECE, housePieces, WALL_FACE } from "./houses.js";
import {
  barrel,
  bench,
  box,
  buildBuilding,
  bush,
  crate,
  DOOR,
  DOOR_HEIGHT,
  DOOR_INSET,
  DOOR_WIDTH,
  fence,
  makeSpec,
  marketStall,
  painted,
} from "./buildings.js";

export const WORLD_SIZE = 320; // metres along each side
const BASE_TREES = 900;
const BASE_ROCKS = 260;
/** Prop multipliers the fps label cycles through, to stress-test a phone. */
export const DENSITIES = [1, 4, 10];
const MAX_DENSITY = DENSITIES[DENSITIES.length - 1];
const GRID_CELL = 4; // collision grid cell, metres

// Town layout: a 5 × 5 grid of 18 m blocks with 6 m streets between them; the middle block is the plaza.
const BLOCK = 18;
const STREET = 6;
const PITCH = BLOCK + STREET;
const BLOCKS_PER_SIDE = 5;
export const TOWN_HALF = (BLOCKS_PER_SIDE * PITCH) / 2; // 60 m from the centre to the outer street's edge
const FOUNTAIN_RADIUS = 2.4;
export const SPAWN = Object.freeze({ x: 0, z: FOUNTAIN_RADIUS + 4 });

const SEAT_HEIGHT = 0.45;
/** How far roofs reach past the walls (the kit's round-tile roofs): the camera stays out from under them. */
const ROOF_OVERHANG = 1.1;
/** How high the kit stall's counter is, drawn at the town's size. */
const STALL_COUNTER = 1.12;
/** Every kit prop the town uses, for loading. */
export const TOWN_PROPS = [
  "barrel",
  "barrel-apples",
  "crate-wooden",
  "bench",
  "stall-empty",
  "farmcrate-apple",
  "farmcrate-carrot",
  "farmcrate-empty",
  "bag",
  "bucket-wooden-1",
  "bucket-metal",
  "prop-wagon",
  "prop-woodenfence-single",
];
/** Clutter by a door: model, simple stand-in, collision radius. */
const DOORSTEP_CLUTTER = [
  ["barrel", () => barrel(), 0.34],
  ["barrel-apples", () => barrel(), 0.34],
  ["bag", () => crate(0.5), 0.3],
  ["bucket-wooden-1", () => crate(0.35), 0.22],
  ["bucket-metal", () => crate(0.35), 0.24],
  ["farmcrate-empty", () => crate(0.45), 0.3],
];
/** Plants by the town's walls and in its gardens: model, size. */
const GARDEN_PLANTS = [
  ["bush-common", 0.55],
  ["bush-common-flowers", 0.55],
  ["flower-3-group", 0.35],
  ["flower-4-group", 0.3],
  ["plant-7", 0.6],
  ["fern-1", 0.5],
];
/** The kit's wooden fence: one 2 m length. */
const FENCE_LENGTH = 2;
/** The kit door: hinged at its left edge, 1.12 m wide. */
const KIT_DOOR_WIDTH = 1.12;
/** Undergrowth (the kit's plants) grows this far out from the town's edge. */
const NATURE_RING = 45;
/** Of the trees, how many have a bush or fern at their foot. */
const TREE_UNDERGROWTH = 0.35;
const UNDERGROWTH = 700;
/** Kit trees, with how often each grows and how big it is drawn (its own size is 7–17 m). */
const KIT_TREES = [
  ["commontree-1", 3, 0.8],
  ["commontree-2", 3, 0.8],
  ["commontree-3", 2, 0.7],
  ["commontree-4", 2, 0.8],
  ["pine-1", 3, 0.9],
  ["pine-2", 3, 0.9],
  ["pine-3", 2, 0.9],
  ["pine-4", 2, 0.9],
  ["twistedtree-1", 1, 0.4],
  ["deadtree-1", 0.4, 0.7],
];
const KIT_ROCKS = ["rock-medium-1", "rock-medium-2", "rock-medium-3"];
/** Undergrowth: model, weight, size. */
const KIT_PLANTS = [
  ["bush-common", 3, 0.8],
  ["bush-common-flowers", 2, 0.8],
  ["fern-1", 3, 0.7],
  ["plant-1", 2, 0.8],
  ["plant-7", 1.5, 0.7],
  ["clover-1", 2, 0.6],
  ["mushroom-common", 0.6, 0.5],
  ["grass-common-short", 4, 0.5],
  ["flower-3-group", 2, 0.45],
  ["flower-4-group", 1.5, 0.4],
  ["grass-common-tall", 5, 0.45],
  ["grass-wispy-tall", 4, 0.45],
  ["pebble-round-1", 1, 1.4],
  ["pebble-round-3", 1, 1.4],
];
/** Every kit model the nature uses, for loading. */
export const NATURE_MODELS = [...KIT_TREES.map(([name]) => name), ...KIT_ROCKS, ...KIT_PLANTS.map(([name]) => name)];
/** How far a door swings open, outward onto the street (radians). */
const DOOR_SWING = 1.7;

const SKY = 0xbfd9ee;
// The sky through the day: deep blue at night, warm at dawn and dusk, pale blue by day.
const NIGHT_SKY = new Color(0x1b2338);
const DUSK_SKY = new Color(0xe0a27a);
const DAY_SKY = new Color(SKY);
const ROAD = 0xb3a184;
const PAVING = 0xc7bba5;
/** Metres per repeat of the road and paving textures. */
const ROAD_TILE = 2.6;
const PAVING_TILE = 2;
/** The paved edge round each block, inside its kerb. */
const SIDEWALK = 1.2;
const STONE_GREY = 0x9a9a94;
const WATER = 0x5b8fb8;

/** Deterministic 32-bit string hash (FNV-1a). */
export function hashString(text) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32: small deterministic PRNG returning numbers in [0, 1). */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Ground height at (x, z). Gentle hills outside town; the town and its edge are flat. */
export function heightAt(x, z) {
  const hills = Math.sin(x * 0.05) * 1.6 + Math.cos(z * 0.04) * 1.3 + Math.sin((x + z) * 0.11) * 0.5;
  const fromTown = Math.max(Math.abs(x), Math.abs(z)) - TOWN_HALF - 4;
  return hills * Math.min(1, Math.max(0, fromTown / 24));
}

/** True when (x, z) is inside the town's footprint plus a margin, where no trees or rocks grow. */
const inTown = (x, z, margin = 6) => Math.abs(x) < TOWN_HALF + margin && Math.abs(z) < TOWN_HALF + margin;

/**
 * Collision on the ground plane against circles (tree trunks, the fountain) and axis-aligned boxes
 * (buildings). A uniform grid means each check only looks at the 3×3 cells around the player.
 * Circles must have r < GRID_CELL; boxes are entered into every cell they cover. Every shape needs its own
 * `id`: a box in several cells is checked once per move by its id.
 */
export function createCollider(circles, boxes = []) {
  const grid = new Map();
  const cellKey = (cx, cz) => `${cx},${cz}`;
  const add = (cx, cz, shape) => {
    const key = cellKey(cx, cz);
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key).push(shape);
  };
  for (const circle of circles) {
    add(Math.floor(circle.x / GRID_CELL), Math.floor(circle.z / GRID_CELL), { kind: "circle", ...circle });
  }
  for (const box of boxes) {
    for (let cx = Math.floor(box.minX / GRID_CELL); cx <= Math.floor(box.maxX / GRID_CELL); cx++) {
      for (let cz = Math.floor(box.minZ / GRID_CELL); cz <= Math.floor(box.maxZ / GRID_CELL); cz++) {
        add(cx, cz, { kind: "box", ...box });
      }
    }
  }

  function pushOutOfCircle(position, radius, circle) {
    const ox = position.x - circle.x;
    const oz = position.z - circle.z;
    const distance = Math.hypot(ox, oz);
    const minimum = radius + circle.r;
    if (distance > 0 && distance < minimum) {
      position.x = circle.x + (ox / distance) * minimum;
      position.z = circle.z + (oz / distance) * minimum;
    }
  }

  function pushOutOfBox(position, radius, box) {
    const nearestX = Math.max(box.minX, Math.min(box.maxX, position.x));
    const nearestZ = Math.max(box.minZ, Math.min(box.maxZ, position.z));
    const ox = position.x - nearestX;
    const oz = position.z - nearestZ;
    const distance = Math.hypot(ox, oz);
    if (distance > 0) {
      if (distance < radius) {
        position.x = nearestX + (ox / distance) * radius;
        position.z = nearestZ + (oz / distance) * radius;
      }
      return;
    }
    // The centre is inside the box: leave through the nearest side.
    const exits = [
      [position.x - box.minX, -1, 0],
      [box.maxX - position.x, 1, 0],
      [position.z - box.minZ, 0, -1],
      [box.maxZ - position.z, 0, 1],
    ].sort((a, b) => a[0] - b[0]);
    const [depth, dx, dz] = exits[0];
    position.x += dx * (depth + radius);
    position.z += dz * (depth + radius);
  }

  return {
    /** True when (x, z) is inside a box grown by `margin`: the camera uses it to stay out of buildings. */
    /** Whether (x, z) is inside a box (with `margin`); `tallOnly` skips low ones (fences, benches, wagons). */
    insideBox(x, z, margin = 0, tallOnly = false) {
      // The 3×3 cells around the point, so a box just across a cell boundary still counts within the margin.
      const cx = Math.floor(x / GRID_CELL);
      const cz = Math.floor(z / GRID_CELL);
      for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) {
          for (const shape of grid.get(cellKey(cx + dx, cz + dz)) ?? []) {
            if (
              shape.kind === "box" &&
              !(tallOnly && shape.low) &&
              x > shape.minX - margin &&
              x < shape.maxX + margin &&
              z > shape.minZ - margin &&
              z < shape.maxZ + margin
            ) {
              return true;
            }
          }
        }
      }
      return false;
    },
    /** Pushes a circle at `position` (x, z) with `radius` out of anything it overlaps. Mutates `position`. */
    resolve(position, radius) {
      const cx = Math.floor(position.x / GRID_CELL);
      const cz = Math.floor(position.z / GRID_CELL);
      const seen = new Set();
      for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) {
          for (const shape of grid.get(cellKey(cx + dx, cz + dz)) ?? []) {
            if (seen.has(shape.id)) continue;
            seen.add(shape.id);
            if (shape.kind === "circle") pushOutOfCircle(position, radius, shape);
            else pushOutOfBox(position, radius, shape);
          }
        }
      }
    },
  };
}

// ── Town ─────────────────────────────────────────────────────────────────────

const facingFor = (dx, dz) => (Math.abs(dx) > Math.abs(dz) ? (dx > 0 ? 1 : 3) : dz > 0 ? 0 : 2);

/** Turns a local point (x, z) of something facing `facing` and centred at (cx, cz) into world space. */
function toWorld(cx, cz, facing, x, z) {
  const angle = (facing * Math.PI) / 2;
  return { x: cx + x * Math.cos(angle) + z * Math.sin(angle), z: cz - x * Math.sin(angle) + z * Math.cos(angle) };
}

/** The world-space box around a local footprint turned to `facing` at (cx, cz). */
function footprintBox(cx, cz, facing, { minX, maxX, minZ, maxZ }) {
  const corners = [
    [minX, minZ],
    [maxX, minZ],
    [minX, maxZ],
    [maxX, maxZ],
  ].map(([x, z]) => toWorld(cx, cz, facing, x, z));
  return {
    minX: Math.min(...corners.map((c) => c.x)),
    maxX: Math.max(...corners.map((c) => c.x)),
    minZ: Math.min(...corners.map((c) => c.z)),
    maxZ: Math.max(...corners.map((c) => c.z)),
  };
}

/** Puts a prop's local geometry into the town at (x, z), turned to `facing`. */
function placeProp(town, geometry, x, z, facing = 0) {
  town.pieces.push(geometry.rotateY((facing * Math.PI) / 2).translate(x, 0, z));
}

/**
 * A prop the kit can draw: its simple stand-in goes into the props mesh (hidden once the kit has loaded),
 * and its spot is kept for the kit model. `angle` in radians, `scale` a number or [x, y, z]; `y` lifts it.
 */
function placeKitProp(town, fallback, { model, x, z, angle = 0, scale = 1, y = 0 }) {
  if (fallback) town.propPieces.push(fallback.rotateY(angle).translate(x, y, z));
  town.propSlots.push({ model, x, y, z, angle, scale: Array.isArray(scale) ? scale : [scale, scale, scale] });
}

/** A plant the nature kit can draw (`model`, at (x, z)); its simple stand-in shows until then. */
function placeKitPlant(town, fallback, { model, x, z, angle = 0, scale = 1 }) {
  if (fallback) town.naturePieces.push(fallback.translate(x, 0, z));
  town.natureSlots.push({ model, x, z, angle, scale });
}

/** Builds a building from its spec at (x, z) facing `facing`, with its door, collision box and street clutter. */
function placeBuilding(random, town, spec, x, z, facing) {
  const { geometry, doorX, footprint } = buildBuilding(random, spec);
  // The simple building goes into its own mesh, hidden once the village kit's version stands in its place.
  town.buildingPieces.push(geometry.rotateY((facing * Math.PI) / 2).translate(x, 0, z));
  town.buildings.push({ spec, doorX, x, z, facing });
  town.boxes.push(footprintBox(x, z, facing, footprint));
  const d = spec.depth / 2;
  // Dark behind the doorway: unseen inside the simple building, it's what an open kit door shows.
  placeProp(
    town,
    box(DOOR_WIDTH + 0.2, DOOR_HEIGHT + 0.2, 0.05, 0, (DOOR_HEIGHT + 0.2) / 2, 0, 0x120d0a).translate(
      doorX,
      0,
      d - 0.45,
    ),
    x,
    z,
    facing,
  );
  town.doors.push({
    // Where someone stands to use the door: in front of it, or in front of the porch when there is one.
    ...toWorld(x, z, facing, doorX, Math.max(d + 1.2, footprint.maxZ + 0.6)),
    kind: spec.kind,
    spec,
    centre: { x, z },
    angle: (facing * Math.PI) / 2, // the way the front faces
    hinge: toWorld(x, z, facing, doorX - DOOR_WIDTH / 2, d + DOOR_INSET),
    // Where the kit's door hangs: in the wall's doorway, under its frame (houses.js).
    kitHinge: toWorld(x, z, facing, doorX - KIT_DOOR_WIDTH / 2, d - WALL_FACE),
    step: toWorld(x, z, facing, doorX, d + 0.35), // on the step, right in the doorway
  });
  // Along the front, either side of the door: plants against the wall, and barrels, sacks and buckets
  // (more of them, and no plants, at a shop, the tavern or the smithy).
  const trade = spec.kind === "shop" || spec.kind === "tavern" || spec.kind === "smithy";
  const room = spec.width / 2 - 0.5;
  for (const side of [-1, 1]) {
    let along = 1.15;
    const things = (trade ? 1 : 0) + Math.floor(random() * 3);
    for (let i = 0; i < things; i++) {
      const lx = doorX + side * along;
      if (Math.abs(lx) > room) break;
      const at = toWorld(x, z, facing, lx, d + 0.45);
      const angle = random() * Math.PI * 2;
      if (!trade && random() < 0.6) {
        const [model, size] = GARDEN_PLANTS[Math.floor(random() * GARDEN_PLANTS.length)];
        placeKitPlant(town, bush(random, 0.45), {
          model,
          x: at.x,
          z: at.z,
          angle,
          scale: size * (0.8 + random() * 0.4),
        });
        town.circles.push({ x: at.x, z: at.z, r: 0.3 });
        along += 0.9;
      } else if (random() < 0.3) {
        const size = 0.55 + random() * 0.2;
        placeKitProp(town, crate(size), { model: "crate-wooden", x: at.x, z: at.z, angle, scale: size / 0.85 });
        town.circles.push({ x: at.x, z: at.z, r: 0.4 });
        along += 0.85;
      } else {
        const [model, fallback, r] = DOORSTEP_CLUTTER[Math.floor(random() * DOORSTEP_CLUTTER.length)];
        placeKitProp(town, fallback(), { model, x: at.x, z: at.z, angle });
        town.circles.push({ x: at.x, z: at.z, r });
        along += 0.75;
      }
    }
  }
}

/** A bench at (x, z) facing `facing`, with two seats to sit on. */
function placeBench(town, x, z, facing) {
  // The kit's bench is 2.8 m long; drawn at the town's 1.8 m.
  placeKitProp(town, bench(), { model: "bench", x, z, angle: (facing * Math.PI) / 2, scale: [0.66, 0.9, 0.95] });
  town.boxes.push({ ...footprintBox(x, z, facing, { minX: -0.9, maxX: 0.9, minZ: -0.25, maxZ: 0.25 }), low: true });
  for (const side of [-0.45, 0.45]) {
    town.seats.push({
      ...toWorld(x, z, facing, side, -0.02),
      angle: (facing * Math.PI) / 2, // a sitter faces the bench's front
      approach: toWorld(x, z, facing, side, 0.75), // where to stand before sitting down
      height: SEAT_HEIGHT,
      taken: null,
    });
  }
}

/**
 * A fenced garden on an empty lot (`size` metres square, a whole number of fence lengths), its gate facing
 * `facing`: a tree in a back corner, bushes and flowers along the fence, and a bench at the back facing
 * the gate.
 */
function placeGarden(random, town, x, z, size, facing) {
  const at = (lx, lz) => toWorld(x, z, facing, lx, lz);
  const turn = (facing * Math.PI) / 2;
  const half = size / 2;
  const lengths = size / FENCE_LENGTH;
  const gate = Math.floor(lengths / 2);
  for (let side = 0; side < 4; side++) {
    for (let i = 0; i < lengths; i++) {
      if (side === 0 && i === gate) continue; // the way in
      const along = -half + FENCE_LENGTH * (i + 0.5);
      // Side 0 is the front (+z), then the right (+x), the back and the left; each length runs along its side.
      const [lx, lz, angle] = [
        [along, half, 0],
        [half, along, Math.PI / 2],
        [along, -half, 0],
        [-half, along, Math.PI / 2],
      ][side];
      const spot = at(lx, lz);
      placeKitProp(town, null, { model: "prop-woodenfence-single", x: spot.x, z: spot.z, angle: turn + angle });
    }
  }
  town.propPieces.push(fence(size, size).rotateY(turn).translate(x, 0, z)); // the simple fence, till the kit's
  // The fence blocks like a wall: a thin box along each side, with the gate left open.
  const gateFrom = -half + FENCE_LENGTH * gate;
  for (const [minX, maxX, minZ, maxZ] of [
    [-half, gateFrom, half - 0.1, half + 0.1],
    [gateFrom + FENCE_LENGTH, half, half - 0.1, half + 0.1],
    [-half, half, -half - 0.1, -half + 0.1],
    [-half - 0.1, -half + 0.1, -half, half],
    [half - 0.1, half + 0.1, -half, half],
  ]) {
    if (maxX - minX > 0.05) town.boxes.push({ ...footprintBox(x, z, facing, { minX, maxX, minZ, maxZ }), low: true });
  }

  const corner = random() < 0.5 ? -1 : 1;
  const tree = at(corner * (half - 1.2), -half + 1.2);
  const height = 2.5 + random() * 1.5;
  placeKitPlant(
    town,
    mergeGeometries([
      painted(new CylinderGeometry(0.12, 0.18, height * 0.45, 5).translate(0, height * 0.22, 0), 0x6b4a2f),
      painted(new IcosahedronGeometry(height * 0.32, 0).translate(0, height * 0.65, 0), 0x4f7f3f),
    ]),
    {
      model: random() < 0.5 ? "commontree-3" : "commontree-4",
      x: tree.x,
      z: tree.z,
      angle: random() * Math.PI * 2,
      scale: 0.42,
    },
  );
  town.circles.push({ x: tree.x, z: tree.z, r: 0.3 });
  // Plants along the fence inside (the sides and the back, not across the gate), and short grass on the lawn.
  for (let i = 0; i < 9 + Math.floor(random() * 5); i++) {
    const t = (random() * 2 - 1) * (half - 0.6);
    const [lx, lz] = [
      [half - 0.55, t],
      [t, -half + 0.55],
      [-half + 0.55, t],
    ][Math.floor(random() * 3)];
    const spot = at(lx, lz);
    const [model, size] = GARDEN_PLANTS[Math.floor(random() * GARDEN_PLANTS.length)];
    placeKitPlant(town, bush(random, 0.5), {
      model,
      x: spot.x,
      z: spot.z,
      angle: random() * Math.PI * 2,
      scale: size * (1.1 + random() * 0.4),
    });
  }
  for (let i = 0; i < 8; i++) {
    const spot = at((random() * 2 - 1) * (half - 0.8), (random() * 2 - 1) * (half - 0.8));
    placeKitPlant(town, null, {
      model: "grass-common-short",
      x: spot.x,
      z: spot.z,
      angle: random() * Math.PI * 2,
      scale: 0.4,
    });
  }
  const seat = at(-corner, -half + 0.9);
  placeBench(town, seat.x, seat.z, facing);
  town.waypoints.push(at(0, half + 0.8)); // in front of the gate, so people find the way in to the bench
}

/** An empty block at the town's edge, left as a meadow: a few trees, wildflowers and long grass. */
function placeMeadow(random, town, cx, cz) {
  const spot = (margin) => ({
    x: cx + (random() * 2 - 1) * (BLOCK / 2 - margin),
    z: cz + (random() * 2 - 1) * (BLOCK / 2 - margin),
  });
  for (let i = 0; i < 2 + Math.floor(random() * 3); i++) {
    const at = spot(2.5);
    const model = ["commontree-1", "commontree-2", "commontree-4"][Math.floor(random() * 3)];
    placeKitPlant(town, null, { model, x: at.x, z: at.z, angle: random() * Math.PI * 2, scale: 0.6 + random() * 0.2 });
    town.circles.push({ x: at.x, z: at.z, r: 0.35 });
  }
  for (let i = 0; i < 18; i++) {
    const at = spot(1);
    const [model, size] = [...GARDEN_PLANTS, ["grass-wispy-tall", 0.45], ["grass-common-tall", 0.45]][
      Math.floor(random() * (GARDEN_PLANTS.length + 2))
    ];
    placeKitPlant(town, null, { model, x: at.x, z: at.z, angle: random() * Math.PI * 2, scale: size * 1.2 });
  }
}

/** A wagon left at the side of a street at (x, z), lying along x (`alongX`) or z. */
function placeWagon(random, town, x, z, alongX) {
  const angle = (alongX ? Math.PI / 2 : 0) + (random() < 0.5 ? 0 : Math.PI);
  placeKitProp(town, crate(1.4).scale(1.2, 1, 2.6), {
    model: "prop-wagon",
    x,
    z,
    angle,
    scale: 0.9,
  });
  town.boxes.push(
    alongX
      ? { minX: x - 1.8, maxX: x + 1.8, minZ: z - 0.9, maxZ: z + 0.9, low: true }
      : { minX: x - 0.9, maxX: x + 0.9, minZ: z - 1.8, maxZ: z + 1.8, low: true },
  );
}

/**
 * One 18 m block. Around the plaza: a landmark (town hall, temple or tavern) filling the block, or shops
 * facing the plaza with homes behind. Elsewhere: up to four houses on the corner lots, now and then a shop
 * or the smithy, and gardens on the empty lots.
 */
function fillBlock(random, town, cx, cz, role) {
  const half = BLOCK / 2;
  // A paved edge round the block, inside the kerb.
  for (const [w, d, ox, oz] of [
    [BLOCK, SIDEWALK, 0, half - SIDEWALK / 2],
    [BLOCK, SIDEWALK, 0, -half + SIDEWALK / 2],
    [SIDEWALK, BLOCK - 2 * SIDEWALK, half - SIDEWALK / 2, 0],
    [SIDEWALK, BLOCK - 2 * SIDEWALK, -half + SIDEWALK / 2, 0],
  ]) {
    town.pavingPieces.push(
      painted(new PlaneGeometry(w, d).rotateX(-Math.PI / 2).translate(cx + ox, 0.045, cz + oz), PAVING),
    );
  }
  const toPlaza = facingFor(-cx, -cz);
  if (role === "hall" || role === "temple" || role === "tavern") {
    const width = role === "tavern" ? 11 + random() * 2 : 13 + random() * 2;
    const depth = role === "tavern" ? 8 + random() * 1.5 : 9.5 + random() * 2;
    placeBuilding(random, town, makeSpec(random, role, { width, depth }), cx, cz, toPlaza);
    return;
  }
  for (const [lx, lz] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]) {
    const x = cx + lx * (half / 2 + (random() - 0.5) * 0.6);
    const z = cz + lz * (half / 2 + (random() - 0.5) * 0.6);
    // Lots on the plaza side of a shop block face the plaza and hold the shops.
    const facesPlaza = role === "shops" && Math.sign(lx) * Math.sign(-cx) + Math.sign(lz) * Math.sign(-cz) > 0;
    if (!facesPlaza && random() < 0.16) {
      placeGarden(random, town, x, z, 6, random() < 0.5 ? (lz > 0 ? 0 : 2) : lx > 0 ? 1 : 3);
      continue;
    }
    const kind = facesPlaza
      ? "shop"
      : role === "smithy" && lx < 0 && lz < 0
        ? "smithy"
        : random() < 0.08
          ? "shop"
          : "home";
    const facing = facesPlaza ? toPlaza : random() < 0.5 ? (lz > 0 ? 0 : 2) : lx > 0 ? 1 : 3;
    placeBuilding(
      random,
      town,
      makeSpec(random, kind, { width: 5.5 + random() * 2, depth: 5 + random() * 2 }),
      x,
      z,
      facing,
    );
  }
}

function buildTown(random) {
  const town = {
    pieces: [],
    buildingPieces: [],
    buildings: [],
    propPieces: [],
    propSlots: [],
    naturePieces: [],
    natureSlots: [],
    roadPieces: [],
    pavingPieces: [],
    waypoints: [],
    boxes: [],
    circles: [],
    doors: [],
    seats: [],
  };
  const centres = [];
  for (let i = 0; i < BLOCKS_PER_SIDE; i++) centres.push((i - (BLOCKS_PER_SIDE - 1) / 2) * PITCH);
  // The eight blocks around the plaza get the town's landmarks and shops, in a seeded order.
  const plazaRoles = ["hall", "temple", "tavern", "shops", "shops", "shops", "homes", "homes"];
  for (let i = plazaRoles.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [plazaRoles[i], plazaRoles[j]] = [plazaRoles[j], plazaRoles[i]];
  }
  const outer = centres[centres.length - 1];
  const smithyBlock = Math.floor(random() * 4);
  let ring = 0;
  let edgeIndex = 0;
  for (const cx of centres) {
    for (const cz of centres) {
      if (cx === 0 && cz === 0) continue; // the plaza
      const nearPlaza = Math.abs(cx) <= PITCH && Math.abs(cz) <= PITCH;
      const edge = Math.max(Math.abs(cx), Math.abs(cz)) === outer;
      if (edge && random() < 0.3) {
        placeMeadow(random, town, cx, cz); // a ragged edge reads as a town, not a grid
        continue;
      }
      const corner = Math.abs(cx) === outer && Math.abs(cz) === outer;
      const role = nearPlaza ? plazaRoles[ring++] : corner && edgeIndex++ === smithyBlock ? "smithy" : "homes";
      fillBlock(random, town, cx, cz, role);
    }
  }

  // Streets: one strip per grid line in each direction, plus the paved plaza and its fountain.
  const length = BLOCKS_PER_SIDE * PITCH + STREET;
  for (let i = 0; i <= BLOCKS_PER_SIDE; i++) {
    const line = (i - BLOCKS_PER_SIDE / 2) * PITCH;
    town.roadPieces.push(
      painted(new PlaneGeometry(length, STREET).rotateX(-Math.PI / 2).translate(0, 0.03, line), ROAD),
    );
    town.roadPieces.push(
      painted(new PlaneGeometry(STREET, length).rotateX(-Math.PI / 2).translate(line, 0.035, 0), ROAD),
    );
  }
  town.pavingPieces.push(painted(new PlaneGeometry(BLOCK, BLOCK).rotateX(-Math.PI / 2).translate(0, 0.04, 0), PAVING));
  // Now and then a wagon left at the side of a street, halfway along a block (clear of the crossings'
  // lamps), never next to the plaza.
  for (let i = 1; i < BLOCKS_PER_SIDE; i++) {
    const line = (i - BLOCKS_PER_SIDE / 2) * PITCH;
    for (let j = 0; j < BLOCKS_PER_SIDE; j++) {
      const middle = (j - (BLOCKS_PER_SIDE - 1) / 2) * PITCH;
      if ((Math.abs(middle) < PITCH / 2 && Math.abs(line) < PITCH) || random() > 0.15) continue;
      const kerb = line + (random() < 0.5 ? -1 : 1) * (STREET / 2 - 1);
      if (random() < 0.5) placeWagon(random, town, middle, kerb, true);
      else placeWagon(random, town, kerb, middle, false);
    }
  }
  town.pieces.push(
    painted(new CylinderGeometry(FOUNTAIN_RADIUS, FOUNTAIN_RADIUS + 0.2, 0.7, 12).translate(0, 0.35, 0), STONE_GREY),
  );
  town.pieces.push(
    painted(new CylinderGeometry(FOUNTAIN_RADIUS - 0.3, FOUNTAIN_RADIUS - 0.3, 0.1, 12).translate(0, 0.66, 0), WATER),
  );
  town.pieces.push(painted(new CylinderGeometry(0.35, 0.5, 2.2, 6).translate(0, 1.1, 0), STONE_GREY));
  town.circles.push({ x: 0, z: 0, r: FOUNTAIN_RADIUS + 0.7 }); // the stone rim and the plants round it

  // Market day on the plaza: stalls in the corners facing the fountain, benches beside it.
  for (const [x, z] of [
    [-5.6, -5.6],
    [5.6, -5.6],
    [-5.6, 5.2],
    [5.6, 5.2],
  ]) {
    const facing = facingFor(-x, -z);
    const angle = (facing * Math.PI) / 2;
    placeKitProp(town, marketStall(random), { model: "stall-empty", x, z, angle, scale: 1.3 });
    // Goods on the counter, in the kit's crates.
    for (const side of [-0.45, 0.45]) {
      const at = toWorld(x, z, facing, side, 0.15);
      placeKitProp(town, null, {
        model: random() < 0.5 ? "farmcrate-apple" : "farmcrate-carrot",
        x: at.x,
        z: at.z,
        y: STALL_COUNTER,
        angle: angle + (random() - 0.5) * 0.3,
      });
    }
    town.boxes.push(footprintBox(x, z, facing, { minX: -1.3, maxX: 1.3, minZ: -0.9, maxZ: 0.9 }));
    // A barrel or a sack at the stall's side.
    const beside = toWorld(x, z, facing, random() < 0.5 ? -1.6 : 1.6, 0);
    const [model, fallback, r] = DOORSTEP_CLUTTER[Math.floor(random() * 3)];
    placeKitProp(town, fallback(), { model, x: beside.x, z: beside.z, angle: random() * Math.PI * 2 });
    town.circles.push({ x: beside.x, z: beside.z, r });
  }
  // Bushes and flowers round the fountain.
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const [model, size] = GARDEN_PLANTS[i % 4];
    const px = Math.cos(angle) * (FOUNTAIN_RADIUS + 0.45);
    const pz = Math.sin(angle) * (FOUNTAIN_RADIUS + 0.45);
    placeKitPlant(town, bush(random, 0.45), { model, x: px, z: pz, angle, scale: size * 0.8 });
  }
  for (const [x, z, facing] of [
    [-4, 0, 1],
    [4, 0, 3],
    [0, -4, 0],
    [-7.8, 0, 1],
    [7.8, 0, 3],
    [0, -7.8, 0],
  ]) {
    placeBench(town, x, z, facing);
  }

  const mesh = new Mesh(
    mergeGeometries(town.pieces),
    new MeshLambertMaterial({ vertexColors: true, flatShading: true }),
  );
  // Lamp posts at every street crossing inside the town.
  const lamps = [];
  for (let i = 1; i < BLOCKS_PER_SIDE; i++) {
    for (let j = 1; j < BLOCKS_PER_SIDE; j++) {
      lamps.push({
        x: (i - BLOCKS_PER_SIDE / 2) * PITCH + STREET / 2 - 0.4,
        z: (j - BLOCKS_PER_SIDE / 2) * PITCH + STREET / 2 - 0.4,
      });
    }
  }
  const props = new Mesh(
    mergeGeometries(town.propPieces),
    new MeshLambertMaterial({ vertexColors: true, flatShading: true }),
  );
  const buildingMesh = new Mesh(
    mergeGeometries(town.buildingPieces),
    new MeshLambertMaterial({ vertexColors: true, flatShading: true }),
  );
  const natureMesh = new Mesh(
    mergeGeometries(town.naturePieces),
    new MeshLambertMaterial({ vertexColors: true, flatShading: true }),
  );
  return {
    mesh,
    props,
    buildingMesh,
    natureMesh,
    natureSlots: town.natureSlots,
    waypoints: town.waypoints,
    roads: groundMesh(town.roadPieces, ROAD_TILE),
    paving: groundMesh(town.pavingPieces, PAVING_TILE),
    buildings: town.buildings,
    propSlots: town.propSlots,
    boxes: town.boxes,
    circles: town.circles,
    lamps,
    doors: town.doors,
    seats: town.seats,
  };
}

/** Flat pieces (roads, paving) merged into one mesh, with texture coordinates in metres / `tile`. */
function groundMesh(pieces, tile) {
  const geometry = mergeGeometries(pieces);
  const position = geometry.attributes.position;
  const uv = new Float32Array(position.count * 2);
  for (let i = 0; i < position.count; i++) {
    uv[i * 2] = position.getX(i) / tile;
    uv[i * 2 + 1] = position.getZ(i) / tile;
  }
  geometry.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  return new Mesh(geometry, new MeshLambertMaterial({ vertexColors: true }));
}

/**
 * Soft light and dark patches for the grass, tiling: value noise over a few octaves, made as data (no
 * canvas needed). It's multiplied over the ground's colours, so the grass isn't one flat green.
 */
function grassTexture(random) {
  const size = 64;
  const octaves = [
    [4, 0.5],
    [8, 0.3],
    [16, 0.2],
  ].map(([cells, weight]) => ({ cells, weight, values: Array.from({ length: cells * cells }, random) }));
  const smooth = (t) => t * t * (3 - 2 * t);
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let value = 0;
      for (const { cells, weight, values } of octaves) {
        const fx = (x / size) * cells;
        const fy = (y / size) * cells;
        const x0 = Math.floor(fx);
        const y0 = Math.floor(fy);
        const at = (i, j) => values[(j % cells) * cells + (i % cells)];
        const tx = smooth(fx - x0);
        const ty = smooth(fy - y0);
        const top = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * tx;
        const bottom = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * tx;
        value += (top + (bottom - top) * ty) * weight;
      }
      const i = (y * size + x) * 4;
      // Light patches lean yellow, dark ones blue-green.
      data[i] = Math.round(255 * (0.74 + value * 0.3));
      data[i + 1] = Math.round(255 * (0.78 + value * 0.24));
      data[i + 2] = Math.round(255 * (0.74 + value * 0.18));
      data[i + 3] = 255;
    }
  }
  const texture = new DataTexture(data, size, size);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(WORLD_SIZE / 14, WORLD_SIZE / 14);
  texture.colorSpace = SRGBColorSpace;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function buildGround(random) {
  const geometry = new PlaneGeometry(WORLD_SIZE, WORLD_SIZE, 80, 80).toNonIndexed();
  geometry.rotateX(-Math.PI / 2);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i++) {
    position.setY(i, heightAt(position.getX(i), position.getZ(i)));
  }
  // One colour per triangle, so the flat shading reads as facets.
  const colors = new Float32Array(position.count * 3);
  const color = new Color();
  for (let i = 0; i < position.count; i += 3) {
    const y = (position.getY(i) + position.getY(i + 1) + position.getY(i + 2)) / 3;
    color.setHSL(0.27 + random() * 0.03, 0.42, 0.36 + y * 0.025 + random() * 0.04);
    for (let k = 0; k < 3; k++) color.toArray(colors, (i + k) * 3);
  }
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return new Mesh(
    geometry,
    new MeshLambertMaterial({ vertexColors: true, flatShading: true, map: grassTexture(rng(7)) }),
  );
}

/** Random points across the ground outside town. */
function scatter(random, count, scaleMin, scaleRange) {
  const points = [];
  const half = WORLD_SIZE / 2 - 2;
  while (points.length < count) {
    const x = (random() * 2 - 1) * half;
    const z = (random() * 2 - 1) * half;
    if (inTown(x, z)) continue;
    points.push({ x, z, scale: scaleMin + random() * scaleRange, turn: random() * Math.PI * 2, tint: random() });
  }
  return points;
}

function streetWaypoints() {
  const points = [];
  const lines = [];
  for (let i = 0; i <= BLOCKS_PER_SIDE; i++) lines.push((i - BLOCKS_PER_SIDE / 2) * PITCH);
  for (const a of lines) {
    for (let j = 0; j < lines.length; j++) {
      points.push({ x: a, z: lines[j] });
      if (j < lines.length - 1) {
        const middle = (lines[j] + lines[j + 1]) / 2;
        points.push({ x: a, z: middle }, { x: middle, z: a });
      }
    }
  }
  return points;
}

/**
 * Builds the scene for one seed. Instanced meshes are allocated at the highest density once;
 * changing density only changes how many instances are drawn.
 */
export function createWorld(seed) {
  const random = rng(seed);
  const scene = new Scene();
  scene.background = new Color(SKY);
  scene.fog = new Fog(SKY, 60, 170);
  const sky = new HemisphereLight(0xe8f4ff, 0x4a5a3a, 1.6);
  scene.add(sky);
  const sun = new DirectionalLight(0xfff1d6, 1.8);
  sun.position.set(40, 80, 25);
  scene.add(sun);

  scene.add(buildGround(random));
  const town = buildTown(random);
  scene.add(town.mesh, town.props, town.buildingMesh, town.natureMesh, town.roads, town.paving);

  const trees = scatter(random, BASE_TREES * MAX_DENSITY, 1.6, 1.6);
  const rocks = scatter(random, BASE_ROCKS * MAX_DENSITY, 0.8, 1.4);

  const trunkGeometry = new CylinderGeometry(0.15, 0.22, 1.2, 5).translate(0, 0.6, 0);
  const crownGeometry = new ConeGeometry(0.95, 2.4, 6).translate(0, 2.3, 0);
  const rockGeometry = new DodecahedronGeometry(0.6, 0);
  const trunks = new InstancedMesh(
    trunkGeometry,
    new MeshLambertMaterial({ color: 0x6b4a2f, flatShading: true }),
    trees.length,
  );
  const crowns = new InstancedMesh(crownGeometry, new MeshLambertMaterial({ flatShading: true }), trees.length);
  const stones = new InstancedMesh(
    rockGeometry,
    new MeshLambertMaterial({ color: 0x8a8d8f, flatShading: true }),
    rocks.length,
  );
  const lampPosts = new InstancedMesh(
    new CylinderGeometry(0.08, 0.1, 3.4, 5).translate(0, 1.7, 0),
    new MeshLambertMaterial({ color: 0x2f3438, flatShading: true }),
    town.lamps.length,
  );
  const lampGlow = new MeshLambertMaterial({ color: 0xffe3a0, emissive: 0xffc860, emissiveIntensity: 0 });
  const lampHeads = new InstancedMesh(
    new BoxGeometry(0.45, 0.45, 0.45).translate(0, 3.55, 0),
    lampGlow,
    town.lamps.length,
  );

  const dummy = new Object3D();
  const crownColor = new Color();
  trees.forEach((tree, i) => {
    dummy.position.set(tree.x, heightAt(tree.x, tree.z) - 0.05, tree.z);
    dummy.rotation.set(0, tree.turn, 0);
    dummy.scale.setScalar(tree.scale);
    dummy.updateMatrix();
    trunks.setMatrixAt(i, dummy.matrix);
    crowns.setMatrixAt(i, dummy.matrix);
    crowns.setColorAt(i, crownColor.setHSL(0.3 + tree.tint * 0.08, 0.45, 0.26 + tree.tint * 0.08));
  });
  rocks.forEach((rock, i) => {
    dummy.position.set(rock.x, heightAt(rock.x, rock.z), rock.z);
    dummy.rotation.set(rock.tint * 3, rock.turn, 0);
    dummy.scale.set(rock.scale, rock.scale * 0.7, rock.scale * 1.1);
    dummy.updateMatrix();
    stones.setMatrixAt(i, dummy.matrix);
  });
  town.lamps.forEach((lamp, i) => {
    dummy.position.set(lamp.x, 0, lamp.z);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    lampPosts.setMatrixAt(i, dummy.matrix);
    lampHeads.setMatrixAt(i, dummy.matrix);
  });
  scene.add(trunks, crowns, stones, lampPosts, lampHeads);

  // Doors: one instanced panel each, hinged on its left edge, swinging out onto the street.
  const doorPanels = new InstancedMesh(
    new BoxGeometry(DOOR_WIDTH, DOOR_HEIGHT, 0.08).translate(DOOR_WIDTH / 2, DOOR_HEIGHT / 2, 0),
    new MeshLambertMaterial({ color: DOOR, flatShading: true, side: DoubleSide }),
    Math.max(1, town.doors.length),
  );
  doorPanels.count = town.doors.length;
  const doors = town.doors.map((door, index) => ({ ...door, index, open: 0, target: 0, closeIn: Infinity }));
  // The simple panel, or once the village kit has loaded, its door's parts (addBuildings).
  let doorMeshes = [doorPanels];
  const placeDoor = (door) => {
    dummy.position.set(door.hinge.x, 0, door.hinge.z);
    dummy.rotation.set(0, door.angle - DOOR_SWING * door.open, 0);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    for (const mesh of doorMeshes) mesh.setMatrixAt(door.index, dummy.matrix);
  };
  for (const door of doors) placeDoor(door);
  scene.add(doorPanels);

  // Fixed obstacles: buildings, the fountain and the lamp posts. Trees join per density.
  let nextId = 0;
  const fixedCircles = [
    ...town.circles.map((circle) => ({ id: nextId++, ...circle })),
    ...town.lamps.map((lamp) => ({ id: nextId++, x: lamp.x, z: lamp.z, r: 0.15 })),
  ];
  const fixedBoxes = town.boxes.map((b) => ({ id: nextId++, ...b }));
  const treeCircles = trees.map((tree) => ({ id: nextId++, x: tree.x, z: tree.z, r: 0.25 * tree.scale }));

  // Detailed nature (addNature): every tree, rock and plant as instances of kit models, each model's
  // instances rewritten to just those within sight of the player and allowed by the density whenever the
  // player has moved a little way.
  const natureLayers = []; // { meshes: InstancedMesh[], items: [{ x, z, need, matrix }] }
  const view = { x: Infinity, z: Infinity, radius: 200, density: DENSITIES[0] };
  function refreshNature() {
    const reach = (view.radius + 15) ** 2;
    for (const { meshes, items } of natureLayers) {
      let count = 0;
      for (const item of items) {
        if (item.need > view.density) continue;
        if ((item.x - view.x) ** 2 + (item.z - view.z) ** 2 > reach) continue;
        for (const mesh of meshes) mesh.setMatrixAt(count, item.matrix);
        count++;
      }
      for (const mesh of meshes) {
        mesh.count = count;
        mesh.instanceMatrix.needsUpdate = true;
      }
    }
  }
  /** Where the player is, so the detailed nature near them is the nature drawn. Cheap to call every frame. */
  function follow(x, z) {
    if (!natureLayers.length || (x - view.x) ** 2 + (z - view.z) ** 2 < 64) return;
    view.x = x;
    view.z = z;
    refreshNature();
  }

  let collider = createCollider([], []);
  function setDensity(density) {
    const treeCount = BASE_TREES * density;
    trunks.count = treeCount;
    crowns.count = treeCount;
    stones.count = BASE_ROCKS * density;
    collider = createCollider([...fixedCircles, ...treeCircles.slice(0, treeCount)], fixedBoxes);
    view.density = density;
    refreshNature();
  }
  setDensity(DENSITIES[0]);
  const resolveCollisions = (position, radius) => collider.resolve(position, radius);

  /**
   * How far the camera can sit from (fromX, fromZ) toward (toX, toZ) before a building is in the way,
   * as a fraction of the full distance. Buildings are boxes on the ground plane, so a 2D march is enough.
   */
  function clearSight(fromX, fromZ, toX, toZ) {
    const steps = 24;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      if (collider.insideBox(fromX + (toX - fromX) * t, fromZ + (toZ - fromZ) * t, ROOF_OVERHANG, true))
        return (i - 1) / steps;
    }
    return 1;
  }

  /** Swings door `index` towards open (true) or shut (false); an open door shuts by itself after
   *  `closeAfter` seconds when that is given. */
  function setDoor(index, open, closeAfter = 0) {
    const door = doors[index];
    if (!door) return;
    door.target = open ? 1 : 0;
    door.closeIn = open && closeAfter > 0 ? closeAfter : Infinity;
  }

  /** Moves the doors on: each swings about a second to open or shut. */
  function update(dt) {
    let moved = false;
    for (const door of doors) {
      if (door.target === 1 && Number.isFinite(door.closeIn)) {
        door.closeIn -= dt;
        if (door.closeIn <= 0) setDoor(door.index, false);
      }
      if (door.open === door.target) continue;
      const step = dt * 1.4;
      door.open =
        door.target > door.open ? Math.min(door.target, door.open + step) : Math.max(door.target, door.open - step);
      placeDoor(door);
      moved = true;
    }
    if (moved) for (const mesh of doorMeshes) mesh.instanceMatrix.needsUpdate = true;
  }

  /** How far you can see: the fog closes in from 40% of `distance` to all of it. */
  function setDrawDistance(distance) {
    scene.fog.near = distance * 0.4;
    scene.fog.far = distance;
    view.radius = distance;
    refreshNature();
  }

  const sunDirection = new Vector3();
  const skyColor = new Color();
  /**
   * Lights the world for `hour` (0–24): the sun rises at 6 and sets at 18, the sky warms at dawn and
   * dusk, and the lamps glow from evening until morning. Returns how dark it is (0 day … 1 night).
   */
  function setTime(hour) {
    const angle = ((hour - 6) / 12) * Math.PI; // 0 at sunrise, π/2 at noon, π at sunset
    const height = Math.sin(angle);
    const daylight = Math.min(1, Math.max(0, height * 2.5 + 0.25));
    sunDirection.set(Math.cos(angle) * 60, Math.max(8, height * 80), 25);
    sun.position.copy(sunDirection);
    sun.intensity = 0.15 + 1.65 * daylight;
    sky.intensity = 0.45 + 1.15 * daylight;
    // Warm light low in the sky, white overhead, and a cool moonlight at night.
    const low = Math.max(0, 1 - Math.abs(height) * 3);
    sun.color.setRGB(1, 0.95 - low * 0.25, 0.84 - low * 0.4);
    if (daylight < 0.05) sun.color.setRGB(0.6, 0.7, 1);
    skyColor
      .copy(NIGHT_SKY)
      .lerp(DUSK_SKY, Math.min(1, daylight * 2))
      .lerp(DAY_SKY, Math.max(0, daylight * 2 - 1));
    scene.background.copy(skyColor);
    scene.fog.color.copy(skyColor);
    const dark = 1 - daylight;
    lampGlow.emissiveIntensity = dark > 0.35 ? Math.min(1.4, (dark - 0.35) * 3) : 0;
    return dark;
  }

  /**
   * Swaps every simple tree and rock for a detailed one once the kit has loaded (`models`: a Map from
   * model name to parts), adds undergrowth round the town and at the foot of some trees, and the plants
   * in the town's gardens and by its doors. The simple ones are hidden, so only kit nature shows; how
   * much of it is drawn follows the density and the draw distance (refreshNature).
   */
  function addNature(models) {
    const placements = new Map(); // model name → [{ x, z, need, matrix }]
    const place = (name, x, z, need) => {
      if (!placements.has(name)) placements.set(name, []);
      placements.get(name).push({ x, z, need, matrix: dummy.matrix.clone() });
    };
    const pickWeighted = (list, value) => {
      const total = list.reduce((sum, entry) => sum + entry[1], 0);
      let at = value * total;
      for (const entry of list) {
        at -= entry[1];
        if (at <= 0) return entry;
      }
      return list[list.length - 1];
    };
    // A tree or rock is drawn once the density reaches the first setting whose count includes it.
    const needFor = (i, base) => DENSITIES.find((density) => i < base * density) ?? MAX_DENSITY;
    const growth = rng(seed ^ 0x5bd1e995);
    trees.forEach((tree, i) => {
      const [name, , size] = pickWeighted(KIT_TREES, tree.tint);
      const need = needFor(i, BASE_TREES);
      dummy.position.set(tree.x, heightAt(tree.x, tree.z) - 0.1, tree.z);
      dummy.rotation.set(0, tree.turn, 0);
      dummy.scale.setScalar(size * (0.75 + tree.scale * 0.15));
      dummy.updateMatrix();
      place(name, tree.x, tree.z, need);
      if (growth() < TREE_UNDERGROWTH) {
        const [plant, , plantSize] = pickWeighted(KIT_PLANTS.slice(0, 5), growth());
        const angle = growth() * Math.PI * 2;
        const x = tree.x + Math.cos(angle) * 1.3;
        const z = tree.z + Math.sin(angle) * 1.3;
        dummy.position.set(x, heightAt(x, z) - 0.03, z);
        dummy.rotation.set(0, angle, 0);
        dummy.scale.setScalar(plantSize);
        dummy.updateMatrix();
        place(plant, x, z, need);
      }
    });
    rocks.forEach((rock, i) => {
      dummy.position.set(rock.x, heightAt(rock.x, rock.z) - 0.15, rock.z);
      dummy.rotation.set(0, rock.turn, 0);
      dummy.scale.setScalar(rock.scale * 0.35);
      dummy.updateMatrix();
      place(
        KIT_ROCKS[Math.floor(rock.tint * KIT_ROCKS.length) % KIT_ROCKS.length],
        rock.x,
        rock.z,
        needFor(i, BASE_ROCKS),
      );
    });
    // Undergrowth on the grass around town: between the town's edge and the forest.
    for (let placed = 0, tries = 0; placed < UNDERGROWTH && tries < UNDERGROWTH * 6; tries++) {
      const x = (growth() * 2 - 1) * (TOWN_HALF + NATURE_RING);
      const z = (growth() * 2 - 1) * (TOWN_HALF + NATURE_RING);
      if (inTown(x, z, 1.5)) continue;
      const [name, , size] = pickWeighted(KIT_PLANTS, growth());
      dummy.position.set(x, heightAt(x, z) - 0.03, z);
      dummy.rotation.set(0, growth() * Math.PI * 2, 0);
      dummy.scale.setScalar(size * (0.8 + growth() * 0.5));
      dummy.updateMatrix();
      place(name, x, z, 1);
      placed++;
    }
    // The town's own plants: gardens, doorsteps, round the fountain.
    for (const slot of town.natureSlots) {
      dummy.position.set(slot.x, heightAt(slot.x, slot.z), slot.z);
      dummy.rotation.set(0, slot.angle, 0);
      dummy.scale.setScalar(slot.scale);
      dummy.updateMatrix();
      place(slot.model, slot.x, slot.z, 1);
    }
    if ([...placements.keys()].some((name) => !models.has(name))) return; // something missing: keep the simple ones
    trunks.visible = false;
    crowns.visible = false;
    stones.visible = false;
    town.natureMesh.visible = false;
    for (const [name, items] of placements) {
      const meshes = models.get(name).map(({ geometry, material }) => {
        const instanced = new InstancedMesh(geometry, material, items.length);
        instanced.frustumCulled = false; // round the player anyway, and its instances change as they move
        instanced.userData.kit = true;
        instanced.userData.model = name;
        scene.add(instanced);
        return instanced;
      });
      natureLayers.push({ meshes, items });
    }
    view.x = Infinity; // drawn from wherever the player is on the next follow()
    refreshNature();
  }

  /** Roads in cobbles and paving in brick (`textures`: { road, paving }, from the village kit). */
  function addGround({ road, paving }) {
    for (const [mesh, map] of [
      [town.roads, road],
      [town.paving, paving],
    ]) {
      mesh.material.map = map;
      mesh.material.vertexColors = false;
      mesh.material.needsUpdate = true;
    }
  }

  /** Swaps the town's simple buildings for ones assembled from the village kit, once it has loaded. */
  function addBuildings(models) {
    const groups = new Map();
    const at = new Matrix4();
    town.buildings.forEach((building, i) => {
      at.makeRotationY((building.facing * Math.PI) / 2).setPosition(building.x, 0, building.z);
      for (const { model, matrix } of housePieces(building.spec, building.doorX, seed ^ (i * 2654435761))) {
        if (!groups.has(model)) groups.set(model, []);
        groups.get(model).push(at.clone().multiply(matrix));
      }
    });
    if ([...groups.keys(), DOOR_PIECE].some((model) => !models.has(model))) return; // something missing: keep the simple ones
    town.buildingMesh.visible = false;
    // The kit's door in each doorway, in place of the simple panel.
    doorPanels.visible = false;
    doorMeshes = models.get(DOOR_PIECE).map(({ geometry, material }) => {
      const instanced = new InstancedMesh(geometry, material, Math.max(1, doors.length));
      instanced.count = doors.length;
      instanced.frustumCulled = false;
      instanced.userData.kit = true;
      scene.add(instanced);
      return instanced;
    });
    for (const door of doors) {
      door.hinge = door.kitHinge;
      placeDoor(door);
    }
    for (const [model, matrices] of groups) {
      for (const { geometry, material } of models.get(model)) {
        const instanced = new InstancedMesh(geometry, material, matrices.length);
        matrices.forEach((matrix, i) => instanced.setMatrixAt(i, matrix));
        instanced.computeBoundingSphere();
        instanced.userData.kit = true;
        scene.add(instanced);
      }
    }
  }

  /** Swaps the town's simple barrels, crates, benches and stalls for kit props once they've loaded. */
  function addProps(models) {
    const groups = new Map();
    for (const slot of town.propSlots) {
      if (!models.has(slot.model)) return; // something missing: keep the simple ones
      if (!groups.has(slot.model)) groups.set(slot.model, []);
      dummy.position.set(slot.x, heightAt(slot.x, slot.z) + slot.y, slot.z);
      dummy.rotation.set(0, slot.angle, 0);
      dummy.scale.set(...slot.scale);
      dummy.updateMatrix();
      groups.get(slot.model).push(dummy.matrix.clone());
    }
    town.props.visible = false;
    for (const [model, matrices] of groups) {
      for (const { geometry, material } of models.get(model)) {
        const instanced = new InstancedMesh(geometry, material, matrices.length);
        matrices.forEach((matrix, i) => instanced.setMatrixAt(i, matrix));
        instanced.computeBoundingSphere();
        instanced.userData.kit = true;
        scene.add(instanced);
      }
    }
  }

  function dispose() {
    scene.traverse((object) => {
      // Kit geometry and materials are shared by every world (kit.js keeps them).
      if (!object.geometry?.userData.shared) object.geometry?.dispose();
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) if (!material?.userData.shared) material?.dispose();
      object.dispose?.();
    });
  }

  return {
    scene,
    setDensity,
    resolveCollisions,
    clearSight,
    dispose,
    buildingCount: town.buildings.length,
    /** Each building's door: `x`/`z` is where to stand to use it, `step` the doorway, `open` 0–1. */
    doors,
    /** Bench seats: { x, z, angle, approach, height, taken }. */
    seats: town.seats,
    /** Points along the middle of every street (crossings and halfway between), for finding a way round
     *  buildings. */
    waypoints: [...streetWaypoints(), ...town.waypoints],
    setDoor,
    addNature,
    addProps,
    addBuildings,
    addGround,
    follow,
    update,
    setDrawDistance,
    setTime,
    /** True when (x, z) is inside a building (with `margin`), so someone walking there would be stopped. */
    blocked: (x, z, margin = 0.3) => collider.insideBox(x, z, margin),
  };
}
