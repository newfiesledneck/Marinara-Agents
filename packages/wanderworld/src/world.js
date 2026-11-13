// The world: rolling low-poly ground, a seeded town around the spawn point, and instanced trees and
// rocks outside it. Everything is seeded, so the same seed always gives the same layout.
//
// Draw calls stay flat however big the town is: every building, road and fountain is merged into one
// vertex-coloured mesh, and trees, rocks and lamps are instanced.
import {
  Box3,
  BoxGeometry,
  BufferGeometry,
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
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshPhongMaterial,
  Object3D,
  LinearFilter,
  PlaneGeometry,
  PointLight,
  RepeatWrapping,
  Scene,
  SRGBColorSpace,
  Vector3,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { DOOR_PIECE, housePieces, porchPosts, WALL_FACE } from "./houses.js";
import { caveGeometry } from "./caves.js";
import { createAwnings, createFountain, createLamps, createSmoke, createWindowLights } from "./fixtures.js";
import { CAVE_DEPTH, CAVE_RADIUS, checkLandscape, createLand, POND_RADIUS, WIDE_POND_RADIUS } from "./land.js";
import { createWeather, WEATHER_LOOK } from "./weather.js";
import {
  barrel,
  bench,
  box,
  buildBuilding,
  FLOOR_HEIGHT,
  PORCH_HEIGHT,
  PORCH_OUT,
  styleFor,
  wagon,
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
  slopedRoof,
} from "./buildings.js";

export const WORLD_SIZE = 320; // metres along each side of a Normal world
/** Each world size's side in metres (multiples of the ground's 80 m chunks). */
export const WORLD_SIZES = { small: 240, normal: 320, large: 480, huge: 640, massive: 960 };
// ponytail: the size of the world built last, module-wide like `land` below (same ceiling and upgrade).
let worldSize = WORLD_SIZE;
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
const BLOCKS_PER_SIDE = 5; // a town's blocks per side (each kind of settlement has its own)
export const TOWN_HALF = (BLOCKS_PER_SIDE * PITCH) / 2; // 60 m from the centre to the outer street's edge
const FOUNTAIN_RADIUS = 2.4;
export const SPAWN = Object.freeze({ x: 0, z: FOUNTAIN_RADIUS + 4 });

const SEAT_HEIGHT = 0.45;
/** How far roofs reach past the walls (the kit's round-tile roofs): the camera stays out from under them. */
const ROOF_OVERHANG = 1.1;
/** How high the kit stall's counter is, drawn at the town's size. */
const STALL_COUNTER = 1.12;
/** Every kit prop the town uses, for loading. */
// (A list of the usual ones; what's loaded for a world is its own `propModels`, so nothing is missed.)
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
/** Campsites are at least this far from each other (metres): each its own place, out of sight of the next. */
const CAMP_APART = 70;
/** Nothing grows within this of a campsite's fire (metres): room for its tent and the logs round it. */
const CAMP_CLEARING = 8;
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
/** How far each kind of detailed nature is drawn (metres, and never past the draw distance). */
const NATURE_REACH = { plant: 70, rock: 160, tree: 180 };
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
const ROAD_TILE = 4;
const PLAZA_TILE = 3.2;
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

// ponytail: one land at a time, module-wide, so every heightAt() caller (the player, townsfolk, signs)
// reads the world being played without passing it around. Ceiling: two worlds alive at once would share
// the newer one's ground; give each world its own heightAt if that's ever needed.
let land = null;

/** Ground height at (x, z) in the world built last: level in town, then its hills, mountains and river. */
export function heightAt(x, z) {
  return land ? land.heightAt(x, z) : 0;
}

/** Whether (x, z) is on a bridge's deck in the world built last. */
export function onBridgeAt(x, z) {
  return land ? land.onBridge(x, z, 0) : false;
}

/** How deep the water is at (x, z) in the world built last (0 on dry land), and where its surface is. */
export function waterAt(x, z) {
  return land ? { depth: land.depthAt(x, z), level: land.waterLevel } : { depth: 0, level: 0 };
}

/** Street lines: the middle of each street, the same along x and z. */
const STREET_LINES = Array.from({ length: BLOCKS_PER_SIDE + 1 }, (_, i) => (i - BLOCKS_PER_SIDE / 2) * PITCH);

/**
 * Each kind of settlement: blocks per side, its usual market and roads, the roles of the blocks round the
 * market (landmarks, shops, homes), what it always has (for the lore's needs on top), and about how many
 * homes it holds (a lore needing more makes it bigger, land.js).
 */
export const SETTLEMENTS = {
  hamlet: {
    blocks: 2,
    market: "green",
    roads: "dirt",
    ring: [],
    base: { hall: 0, temple: 0, tavern: 0, shop: 0, smithy: 0 },
    homes: 9,
  },
  village: {
    blocks: 3,
    market: "stalls",
    roads: "dirt",
    ring: ["tavern", "temple", "shops", "homes", "homes", "homes", "homes", "homes"],
    base: { hall: 0, temple: 1, tavern: 1, shop: 1, smithy: 0 },
    homes: 20,
  },
  town: {
    blocks: 5,
    market: "square",
    roads: "cobble",
    ring: ["hall", "temple", "tavern", "shops", "shops", "shops", "homes", "homes"],
    base: { hall: 1, temple: 1, tavern: 1, shop: 3, smithy: 0 },
    homes: 45,
  },
  city: {
    blocks: 7,
    market: "square",
    roads: "cobble",
    ring: ["hall", "temple", "tavern", "tavern", "shops", "shops", "shops", "shops"],
    base: { hall: 1, temple: 1, tavern: 2, shop: 4, smithy: 0 },
    homes: 100,
  },
};

// ponytail: the settlement of the world built last, module-wide like `worldSize` (same ceiling).
let blocksPerSide = BLOCKS_PER_SIDE;
let townHalf = (BLOCKS_PER_SIDE * PITCH) / 2;
let streetLines = STREET_LINES;
let plaza = { x: 0, z: 0 }; // the market's middle
let look = { kind: "town", market: "square", roads: "cobble", side: null, layout: "grid" };
let blocks = null; // "a,b" of every block that's built (null: all of them, the grid)
let openPlan = { pond: null, lots: [] }; // what stands on the blocks a layout leaves open (planOpenGround)

/** Whether block (a, b) of the settlement is built (its layout decides). */
const hasBlock = (a, b) =>
  a >= 0 && b >= 0 && a < blocksPerSide && b < blocksPerSide && (!blocks || blocks.has(`${a},${b}`));

/** Whether the street along z-line `k` over block column `a` is laid (a block either side of it). */
const hasStreetX = (k, a) => hasBlock(a, k - 1) || hasBlock(a, k);
/** Whether the street along x-line `k` over block row `b` is laid. */
const hasStreetZ = (k, b) => hasBlock(k - 1, b) || hasBlock(k, b);

/** Sets the settlement for the world being built (its size, market and roads). */
function useSettlement(settlement, seed = 0) {
  look = settlement;
  gateLanes = [];
  const layout = settlement.layout ?? "grid";
  // A crossroads or one long street needs more blocks along its lines to hold as many homes.
  const kindBlocks = SETTLEMENTS[settlement.kind]?.blocks ?? BLOCKS_PER_SIDE;
  blocksPerSide =
    layout === "grid"
      ? kindBlocks
      : layout === "scattered"
        ? Math.max(3, kindBlocks)
        : layout === "pond"
          ? settlement.wide
            ? Math.max(5, kindBlocks | 1) // an odd count: the pond has the middle block, with open ground all round it
            : Math.max(4, kindBlocks)
          : layout === "quarters"
            ? Math.max(3, kindBlocks | 1) // an odd count, so the green's cross runs through the middle
            : Math.max(3, kindBlocks + (layout === "ring" ? 0 : 2));
  townHalf = (blocksPerSide * PITCH) / 2;
  streetLines = Array.from({ length: blocksPerSide + 1 }, (_, i) => (i - blocksPerSide / 2) * PITCH);
  // The market's block: the middle one (for an even count, the one just short of it), or one to a side.
  const base = Math.floor((blocksPerSide - 1) / 2);
  // (Round a pond the market is out at an edge, the south one unless a side is chosen: the pond has the middle.)
  const side = layout === "pond" ? (settlement.side ?? "south") : settlement.side;
  const step = { north: [0, -1], south: [0, 1], west: [-1, 0], east: [1, 0] }[side] ?? [0, 0];
  // (A wide one has its market inside, on the block beside the pond's; the older kind, out at the edge.)
  const reach = layout === "pond" && !settlement.wide ? blocksPerSide : 1;
  const index = (axis) => Math.max(0, Math.min(blocksPerSide - 1, base + step[axis] * reach));
  const centre = (i) => (i - (blocksPerSide - 1) / 2) * PITCH;
  plaza = { x: centre(index(0)), z: centre(index(1)), i: index(0), j: index(1) };
  // The layout's blocks: all of them (grid), a plus along two main streets (crossroads), one long row
  // (along the road), or a rounded cluster round the market (ring). The market's block always.
  const middle = Math.floor((blocksPerSide - 1) / 2);
  const outer = blocksPerSide - 1;
  const keep =
    {
      grid: () => true,
      crossroads: (a, b) => a === middle || b === middle,
      street: (a, b) => b === middle,
      ring: (a, b) => !((a === 0 || a === outer) && (b === 0 || b === outer)),
      // Only the market: every house stands where it likes (planOpenGround).
      scattered: () => false,
      // The blocks along the edge, by the walls; the middle is open, with a pond in it.
      pond: (a, b) => a === 0 || a === outer || b === 0 || b === outer,
      // Four quarters, a cross of open green between them.
      quarters: (a, b) => a !== middle && b !== middle,
    }[layout] ?? (() => true);
  blocks = null;
  if (layout !== "grid") {
    blocks = new Set([`${plaza.i},${plaza.j}`]);
    for (let a = 0; a < blocksPerSide; a++)
      for (let b = 0; b < blocksPerSide; b++) if (keep(a, b)) blocks.add(`${a},${b}`);
  }
  openPlan = planOpenGround(seed);
}

/**
 * What stands on the ground a layout leaves open inside the settlement, so it isn't bare fields: a pond
 * where four open blocks meet, and here and there a house or two off the streets, a garden, a meadow, a
 * few trees. Seeded apart from everything else, and built after it (buildTown), so the buildings a world
 * already had keep their numbers.
 */
function planOpenGround(seed) {
  const plan = { pond: null, lots: [] };
  if (!blocks) return plan;
  const random = rng((seed ^ 0x6c8e9cf5) >>> 0);
  const centre = (i) => (i - (blocksPerSide - 1) / 2) * PITCH;
  const open = (a, b) => a >= 0 && b >= 0 && a < blocksPerSide && b < blocksPerSide && !hasBlock(a, b);
  const crossings = [];
  for (let i = 1; i < blocksPerSide; i++) {
    for (let j = 1; j < blocksPerSide; j++) {
      if (open(i - 1, j - 1) && open(i, j - 1) && open(i - 1, j) && open(i, j))
        crossings.push({ x: (i - blocksPerSide / 2) * PITCH, z: (j - blocksPerSide / 2) * PITCH });
    }
  }
  const style = look.layout;
  if (style === "pond" && look.wide) {
    // The middle block is the pond's, a bigger one, with the market on the block beside it.
    const m = (blocksPerSide - 1) / 2;
    if (open(m, m)) plan.pond = { x: 0, z: 0, radius: WIDE_POND_RADIUS };
  } else if (style === "pond") {
    // In the very middle: where four blocks meet (an even count), or on the middle block with open
    // ground on its four sides.
    const m = (blocksPerSide - 1) / 2;
    const fits = Number.isInteger(m)
      ? open(m, m) && open(m - 1, m) && open(m + 1, m) && open(m, m - 1) && open(m, m + 1)
      : crossings.some((at) => at.x === 0 && at.z === 0);
    if (fits) plan.pond = { x: 0, z: 0 };
  } else if (style === "scattered") {
    // Not on the lines the gates open onto: the ways in stay dry.
    const gate = (Math.floor((blocksPerSide + 1) / 2) - blocksPerSide / 2) * PITCH;
    const dry = crossings.filter((at) => at.x !== gate && at.z !== gate);
    if (dry.length) plan.pond = dry[Math.floor(random() * dry.length)];
  } else if (crossings.length) plan.pond = crossings[Math.floor(random() * crossings.length)];
  // How often an open block gets houses, a meadow, a garden, trees (the rest stays bare), and two houses.
  const [houses_, meadow_, garden_, trees_, pair_] = {
    scattered: [0.85, 0.9, 0.95, 1, 0.75],
    // (A wide one's green has something on every plot: a meadow, trees, now and then a house.)
    // No fenced gardens out on it: they'd look out of place in an open field.
    pond: look.wide ? [0.12, 0.45, 0.45, 1, 0.3] : [0.1, 0.45, 0.65, 0.9, 0.3],
  }[style] ?? [0.3, 0.5, 0.62, 0.8, 0.45];
  for (let a = 0; a < blocksPerSide; a++) {
    for (let b = 0; b < blocksPerSide; b++) {
      if (!open(a, b)) continue;
      const [x, z] = [centre(a), centre(b)];
      // The four blocks round the pond are its shore.
      if (plan.pond && Math.abs(x - plan.pond.x) < PITCH && Math.abs(z - plan.pond.z) < PITCH) continue;
      // Scattered: the lots round the market face it, one building each: its tavern, temple, shops (buildTown).
      if (style === "scattered" && Math.max(Math.abs(a - plaza.i), Math.abs(b - plaza.j)) === 1) {
        plan.lots.push({
          kind: "houses",
          x,
          z,
          ring: true,
          houses: [
            {
              x,
              z,
              width: 6 + random() * 1.5,
              depth: 5.5 + random() * 1.5,
              facing: facingFor(plaza.x - x, plaza.z - z),
            },
          ],
        });
        continue;
      }
      const roll = random();
      if (roll < houses_) {
        // A house, or two in opposite halves of the block, wherever they happened to be built.
        const two = random() < pair_;
        const alongX = random() < 0.5;
        const houses = (two ? [-1, 1] : [0]).map((half) => {
          const near = half * (4 + random() * 0.5);
          const far = (random() * 2 - 1) * 4.5;
          const at = {
            x: x + (alongX ? near : far) + (two ? 0 : (random() * 2 - 1) * 4),
            z: z + (alongX ? far : near),
          };
          return {
            ...at,
            width: 5.5 + random() * 2,
            depth: 5 + random() * 2,
            facing: random() < 0.7 ? facingFor(plaza.x - at.x, plaza.z - at.z) : Math.floor(random() * 4),
          };
        });
        plan.lots.push({ kind: "houses", x, z, houses });
      } else if (roll < meadow_) plan.lots.push({ kind: "meadow", x, z });
      else if (roll < garden_)
        plan.lots.push({
          kind: "garden",
          x: x + (random() * 2 - 1) * 4,
          z: z + (random() * 2 - 1) * 4,
          facing: Math.floor(random() * 4),
        });
      else if (roll < trees_) plan.lots.push({ kind: "trees", x, z });
    }
  }
  return plan;
}

/** True when (x, z) is inside the town's footprint plus a margin, where no trees or rocks grow. */
const inTown = (x, z, margin = 6) => Math.abs(x) < townHalf + margin && Math.abs(z) < townHalf + margin;
// The way out of each gate in a town's wall, kept clear of trees and undergrowth (placeWalls fills it).
let gateLanes = []; // [[from, to]]
const inGateLane = (x, z) =>
  gateLanes.some(([a, b]) => {
    const [dx, dz] = [b.x - a.x, b.z - a.z];
    const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / (dx * dx + dz * dz || 1)));
    return Math.hypot(x - (a.x + dx * t), z - (a.z + dz * t)) < 4.5;
  });

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
    /** Pushes `position` out of everything; a `swimmer` goes on into the water, and one `overLow`
     *  (a horse mid-jump) passes over the low, narrow things: fences and benches. */
    resolve(position, radius, swimmer = false, overLow = false) {
      const cx = Math.floor(position.x / GRID_CELL);
      const cz = Math.floor(position.z / GRID_CELL);
      const seen = new Set();
      for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) {
          for (const shape of grid.get(cellKey(cx + dx, cz + dz)) ?? []) {
            if (seen.has(shape.id)) continue;
            seen.add(shape.id);
            if (swimmer && shape.water) continue;
            // (Low and no deeper than a stride: a wagon is too much to clear.)
            if (overLow && shape.low && Math.min(shape.maxX - shape.minX, shape.maxZ - shape.minZ) <= 1.2) continue;
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
function placeKitPlant(town, fallback, { model, x, z, angle = 0, scale = 1, y = 0, tilt = null }) {
  if (fallback) town.naturePieces.push(fallback.translate(x, heightAt(x, z) + y, z));
  town.natureSlots.push({ model, x, z, angle, scale, y, tilt });
}

/**
 * A place to be doing something: { x, z, angle (which way they face there), approach (where to walk to
 * first, or null), act (what they do: clips.js ACTS), role ("work" | "rest" | "browse"), door (work: the
 * building's door it belongs to, or null), kind (work: for anyone working at a building of this kind),
 * taken (who has it) }.
 */
function placeSpot(town, spot) {
  town.spots.push({ approach: null, door: null, kind: null, taken: null, ...spot });
  return town.spots[town.spots.length - 1];
}

/**
 * A smithy's forge, in the part of its footprint left open (`bay`: buildings.js forgeBay): a stone floor,
 * the hearth against the back wall under its hood, the anvil on its block, a workbench, a rack of
 * weapons, a quenching bucket; the spots where the smith works; and what blocks the way.
 */
function placeForge(town, spec, bay, x, z, facing, door) {
  const turn = (facing * Math.PI) / 2;
  const at = (lx, lz) => toWorld(x, z, facing, lx, lz);
  const d = spec.depth / 2;
  const height = FLOOR_HEIGHT;
  const centre = (bay.x0 + bay.x1) / 2;
  const out = Math.abs(bay.x0) > Math.abs(bay.x1) ? -1 : 1; // which way the forge's open side is
  const [outer, inner] = out < 0 ? [bay.x0, bay.x1] : [bay.x1, bay.x0];
  const STONE = 0x6f6a62;
  const hearthZ = -d + 0.85;
  const anvil = { x: centre + out * 0.45, z: 0.55 };
  const pieces = [
    painted(
      new PlaneGeometry(bay.x1 - bay.x0 - 0.3, spec.depth - 0.3).rotateX(-Math.PI / 2).translate(centre, 0.05, 0),
      0x6a655c,
    ),
    box(1.6, 0.9, 1.1, centre, 0.45, hearthZ, STONE), // the hearth
    box(1.7, 0.12, 1.2, centre, 0.92, hearthZ, 0x5a564f),
    box(1.15, 0.1, 0.65, centre, 1.0, hearthZ + 0.05, 0xff7a1a), // its coals
    box(0.6, 0.08, 0.3, centre - 0.1, 1.06, hearthZ, 0xffc040),
    box(1.6, height - 1.9, 0.55, centre, 1.9 + (height - 1.9) / 2, -d + 0.58, 0x77726a), // the hood
    painted(new CylinderGeometry(0.3, 0.34, 0.5, 8).translate(anvil.x, 0.25, anvil.z), 0x6b4a2f), // the anvil's block
  ];
  town.pieces.push(mergeGeometries(pieces).rotateY(turn).translate(x, 0, z));
  const prop = (model, fallback, lx, lz, more = {}) => {
    const spot = at(lx, lz);
    placeKitProp(town, fallback, { model, x: spot.x, z: spot.z, angle: turn, ...more });
    return spot;
  };
  prop("anvil", box(0.9, 0.4, 0.35, 0, 0.2, 0, 0x3a3d40), anvil.x, anvil.z, { y: 0.5 });
  prop("workbench", box(1.9, 0.85, 0.9, 0, 0.42, 0, 0x8a6440), inner + out * 0.62, 0.9, { angle: turn + Math.PI / 2 });
  prop("weaponstand", box(1.2, 1.1, 0.8, 0, 0.55, 0, 0x6b4a2f), outer - out * 0.7, -d + 1.05, {
    angle: turn - (out * Math.PI) / 2,
  });
  prop("bucket-metal", crate(0.35), anvil.x + out * 0.85, anvil.z + 0.55);
  prop("barrel", barrel(), inner + out * 0.5, -d + 0.75);
  // What blocks the way: the back wall, the hearth, the bench, and what stands about.
  const block = (minX, maxX, minZ, maxZ, low = false) =>
    town.boxes.push({ ...footprintBox(x, z, facing, { minX, maxX, minZ, maxZ }), ...(low ? { low: true } : {}) });
  block(bay.x0, bay.x1, -d, -d + 0.3);
  block(centre - 0.85, centre + 0.85, -d, hearthZ + 0.6, true);
  block(Math.min(inner, inner + out * 1.15), Math.max(inner, inner + out * 1.15), -0.1, 1.9, true);
  const round = (lx, lz, r) => town.circles.push({ ...at(lx, lz), r });
  round(anvil.x, anvil.z, 0.42);
  round(outer - out * 0.7, -d + 1.05, 0.55);
  round(inner + out * 0.5, -d + 0.75, 0.38);
  // The feet of the arches along the front and the open side.
  for (let lx = bay.x0; lx <= bay.x1 + 0.01; lx += 2) round(lx, d - 0.1, 0.14);
  for (let lz = -d; lz < d - 0.5; lz += 2) round(outer, lz, 0.14);
  // The smith: at the anvil, facing the street; or at the bench.
  const way = at(centre + out * 0.4, d + 1.1); // in from the street, through the arches
  placeSpot(town, { ...at(anvil.x, anvil.z - 0.72), angle: turn, approach: way, act: "hammer", role: "work", door });
  placeSpot(town, {
    ...at(inner + out * 1.55, 0.9),
    angle: turn - (out * Math.PI) / 2,
    approach: way,
    act: "craft",
    role: "work",
    door,
  });
}

/**
 * A campsite at (x, z), its tent's mouth turned `angle`: a ring of stones round a small fire, two logs to
 * sit by, a tent with a bedroll in it, and places on the ground round the fire (spots that share `camp`).
 */
/** Lifts each point of `geometry` (in the world's x and z, its y from flat ground) by the ground under it. */
export function ontoGround(geometry) {
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i++)
    position.setY(i, position.getY(i) + heightAt(position.getX(i), position.getZ(i)));
  position.needsUpdate = true;
  return geometry;
}

function placeCamp(town, x, z, angle, camp) {
  const y = heightAt(x, z);
  const pieces = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    pieces.push(
      painted(
        new DodecahedronGeometry(0.16, 0).scale(1, 0.7, 1).translate(Math.sin(a) * 0.55, 0.08, Math.cos(a) * 0.55),
        0x7f7a72,
      ),
    );
  }
  for (const turn of [0.4, 1.9, 3.5]) {
    pieces.push(
      painted(
        new CylinderGeometry(0.06, 0.07, 0.7, 5)
          .rotateZ(Math.PI / 2)
          .rotateY(turn)
          .translate(0, 0.1, 0),
        0x3a2a1e,
      ),
    );
  }
  // (The flame, its light and its smoke are made with the world: createWorld, from town.camps.)
  // How it's laid out, from numbers of the campsite's own: one, two or three tents and one to three logs
  // (three with three tents), each somewhere of its own round the fire, unevenly, as people pitch them.
  // A bearing is round the fire from straight ahead of it; a tent's is the way its mouth looks out from.
  const tentRandom = rng(hashString(`tents:${Math.round(x)}:${Math.round(z)}`));
  const roll = tentRandom();
  const tentCount = roll > 0.75 ? 3 : roll > 0.4 ? 2 : 1;
  const logCount = tentCount === 3 ? 3 : tentRandom() < 0.5 ? 1 : 2;
  const apart = (a, b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
  // (Tents stand further out than the logs, so only a tent's mouth has to be kept clear of a log.)
  const TENT_APART = 1.05; // radians between two tents
  const LOG_APART = 0.85; // between two logs
  const MOUTH_CLEAR = 0.8; // between a log and a tent's mouth
  let tents = null;
  let logSpots = null;
  // One at a time, each tried a few times for somewhere that fits what's already there; a camp that
  // can't be finished is begun again.
  const somewhere = (make, fits) => {
    for (let tries = 0; tries < 24; tries++) {
      const made = make();
      if (fits(made)) return made;
    }
    return null;
  };
  for (let tries = 0; tries < 40 && !logSpots; tries++) {
    const pitched = [];
    const laid = [];
    for (let n = 0; n < tentCount && pitched.length === n; n++) {
      const tent = somewhere(
        // The first is about where a lone tent always was: across the fire from the way in.
        () => ({
          bearing: n === 0 ? Math.PI + (tentRandom() - 0.5) * 0.9 : tentRandom() * Math.PI * 2,
          back: -(3.3 + tentRandom() * 1),
        }),
        (tent) => pitched.every((other) => apart(tent.bearing, other.bearing) >= TENT_APART),
      );
      if (tent) pitched.push(tent);
    }
    for (let n = 0; n < logCount && pitched.length === tentCount && laid.length === n; n++) {
      const log = somewhere(
        () => ({
          bearing: tentRandom() * Math.PI * 2,
          out: 2.0 + tentRandom() * 0.4,
          skew: (tentRandom() - 0.5) * 0.5,
        }),
        (log) =>
          laid.every((other) => apart(log.bearing, other.bearing) >= LOG_APART) &&
          pitched.every((tent) => apart(log.bearing, tent.bearing) >= MOUTH_CLEAR),
      );
      if (log) laid.push(log);
    }
    if (pitched.length < tentCount || laid.length < logCount) continue;
    tents = pitched;
    logSpots = laid;
  }
  if (!logSpots) {
    // (Nothing fitted: the tidy camp, tents side by side across the fire from the logs.)
    tents = [0, 1.35, -1.35].slice(0, tentCount).map((turn) => ({ bearing: Math.PI + turn, back: -3 }));
    logSpots = (logCount === 1 ? [0] : logCount === 2 ? [-0.97, 0.97] : [-0.97, 0, 0.97]).map((bearing) => ({
      bearing,
      out: 2.3,
      skew: 0,
    }));
  }
  // (`turn`: how far a tent is turned round the fire from one lying straight back from it.)
  for (const tent of tents) tent.turn = tent.bearing - Math.PI;
  const [w, h, l] = [1.2, 1.45, 2.4];
  // The logs, each turned to face the fire, more or less.
  const logs = logSpots.map(({ bearing, out, skew }) => {
    const at = [Math.sin(bearing) * out, Math.cos(bearing) * out];
    pieces.push(
      painted(
        new CylinderGeometry(0.2, 0.22, 1.7, 7)
          .rotateX(Math.PI / 2)
          .rotateY(Math.PI / 2 + bearing + skew)
          .translate(at[0], 0.2, at[1]),
        0x6b4a2f,
      ),
    );
    return { at, bearing, along: [Math.cos(bearing + skew), -Math.sin(bearing + skew)] };
  });
  for (const { turn, back } of tents) {
    // Canvas over a ridge pole, its mouth toward the fire, a bedroll inside.
    const tent = new BufferGeometry();
    // prettier-ignore
    const skin = [
    [-w, 0, back], [0, h, back], [0, h, back - l],   [-w, 0, back], [0, h, back - l], [-w, 0, back - l], // one side
    [w, 0, back], [0, h, back - l], [0, h, back],    [w, 0, back], [w, 0, back - l], [0, h, back - l], // the other
    [-w, 0, back - l], [0, h, back - l], [w, 0, back - l], // the back
  ];
    // Each face twice, the second the other way round, so the canvas shows from inside as well.
    const inside = [];
    for (let i = 0; i < skin.length; i += 3) inside.push(skin[i], skin[i + 2], skin[i + 1]);
    tent.setAttribute("position", new Float32BufferAttribute([...skin, ...inside].flat(), 3));
    tent.computeVertexNormals();
    pieces.push(painted(tent, 0xcbbd9a).rotateY(turn));
    pieces.push(box(0.06, h, 0.06, 0, h / 2, back, 0x5a4636).rotateY(turn));
    pieces.push(box(0.7, 0.1, 1.7, 0.25, 0.06, back - 1.1, 0x8a4a3a).rotateY(turn));
  }
  const merged = mergeGeometries(pieces.map((piece) => (piece.index ? piece.toNonIndexed() : piece)));
  // Set down on the ground as it lies: every point is lifted by the ground's height under it, so on a
  // slope a tent's hem and a log's ends follow the ground, and nothing sinks in or hangs in the air.
  town.pieces.push(ontoGround(merged.rotateY(angle).translate(x, 0, z)));
  const local = (lx, lz) => ({
    x: x + lx * Math.cos(angle) + lz * Math.sin(angle),
    z: z - lx * Math.sin(angle) + lz * Math.cos(angle),
  });
  town.circles.push({ x, z, r: 0.6 });
  // A point of a tent turned `turn` round the fire, from where it is in a tent straight across.
  const inTent = (turn, lx, lz) =>
    local(lx * Math.cos(turn) + lz * Math.sin(turn), -lx * Math.sin(turn) + lz * Math.cos(turn));
  for (const { turn, back } of tents) town.circles.push({ ...inTent(turn, 0, back - l / 2), r: 1.15 });
  const facingFire = (at) => Math.atan2(x - at.x, z - at.z);
  // Two seats on each log, and a way to them from the fire's side.
  for (const log of logs) {
    for (const along of [-0.42, 0.42]) {
      const [lx, lz] = [log.at[0] + log.along[0] * along, log.at[1] + log.along[1] * along];
      const seat = local(lx, lz);
      town.seats.push({
        ...seat,
        angle: facingFire(seat),
        approach: local(lx * 0.72, lz * 0.72),
        height: 0.4,
        taken: null,
      });
    }
    town.circles.push({ ...local(log.at[0], log.at[1]), r: 0.45 });
  }
  // Each tent: lying on its bedroll (anyone, for a rest; the player, to sleep: main.js), in by its mouth.
  // (Lying down, the head goes back from the way they face: facing the fire, it's at the tent's far end.)
  const beds = tents.map(({ turn, back }) => {
    const mouth = inTent(turn, 0, back + 0.55);
    const bed = { ...inTent(turn, 0.25, back - 1.15), angle: angle + turn };
    placeSpot(town, { ...bed, approach: mouth, act: "lie", role: "rest", camp });
    return { mouth, bed };
  });
  // (`mouth` and `bed` are the first tent's; `tents` has them all.)
  town.camps.push({ id: camp, x, y, z, angle, ...beds[0], tents: beds });
  // Places round the fire, facing it (not on the tent's side).
  // (Up to five places round it, none in the way to a log's seats or a tent's mouth.)
  const firstPlace = tentRandom() * Math.PI * 2;
  for (let n = 0, i = 0; n < 8 && i < 5; n++) {
    const turn = firstPlace + (n / 8) * Math.PI * 2;
    if (logs.some((log) => apart(log.bearing, turn) < 0.42) || tents.some((tent) => apart(tent.bearing, turn) < 0.3))
      continue;
    i++;
    const at = local(Math.sin(turn) * 1.55, Math.cos(turn) * 1.55);
    placeSpot(town, {
      ...at,
      angle: Math.atan2(x - at.x, z - at.z),
      act: i % 2 ? "drink" : "ground",
      role: "camp",
      camp,
    });
  }
}

/** Builds a building from its spec at (x, z) facing `facing`, with its door, collision box and street clutter. */
function placeBuilding(random, town, spec, x, z, facing) {
  // How it's dressed, from where it stands: nothing the town's own numbers are spent on.
  spec.style = styleFor(spec, rng(hashString(`style:${Math.round(x * 10)}:${Math.round(z * 10)}`)));
  const { geometry, doorX, footprint, bay } = buildBuilding(random, spec);
  spec.bay = bay ?? null;
  const d = spec.depth / 2;
  const turn = (facing * Math.PI) / 2;
  // The simple building goes into its own mesh, hidden once the village kit's version stands in its place.
  town.buildingPieces.push(geometry.rotateY(turn).translate(x, 0, z));
  const outline = footprintBox(x, z, facing, footprint);
  // Its place on the map is its whole footprint; what blocks the way is its walls (a smithy's forge is open).
  const whole = footprintBox(x, z, facing, { minX: -spec.width / 2, maxX: spec.width / 2, minZ: -d, maxZ: d });
  town.buildings.push({ spec, doorX, x, z, facing, box: bay ? whole : outline });
  town.boxes.push(outline);
  if (bay) placeForge(town, spec, bay, x, z, facing, town.doors.length);
  // A lean-to porch's posts (and, till the kit's is in, a plain one), and benches under a tavern's.
  const posts = porchPosts(spec.style.porch, spec.width, doorX);
  if (posts.length) {
    const [from, to] = [posts[0], posts[posts.length - 1]];
    const plain = [
      painted(
        new BoxGeometry(to - from + 0.3, 0.08, PORCH_OUT + 0.2)
          .rotateX(0.5)
          .translate((from + to) / 2, PORCH_HEIGHT + 0.4, d + PORCH_OUT / 2),
        0x7a5a3c,
      ),
    ];
    for (const lx of posts) {
      plain.push(box(0.16, PORCH_HEIGHT, 0.16, lx, PORCH_HEIGHT / 2, d + PORCH_OUT - 0.12, 0x6b4a2f));
      town.circles.push({ ...toWorld(x, z, facing, lx, d + PORCH_OUT - 0.12), r: 0.13 });
    }
    town.buildingPieces.push(mergeGeometries(plain).rotateY(turn).translate(x, 0, z));
  }
  const frontPorch = spec.style.porch === "front";
  if (frontPorch) {
    for (const side of [-1, 1]) {
      const lx = side * (spec.width / 2 - 1.2);
      if (Math.abs(lx - doorX) < 3.4) continue;
      const seat = toWorld(x, z, facing, lx, d + 0.42);
      placeBench(town, seat.x, seat.z, facing);
    }
  }
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
      // Nothing stands in the forge's way in, or where a porch's benches are (the town's numbers are
      // spent all the same, so everything after stays where it was).
      const clear =
        (bay && lx > bay.x0 - 0.3 && lx < bay.x1 + 0.3) || (frontPorch && Math.abs(lx) > spec.width / 2 - 2.4);
      if (!trade && random() < 0.6) {
        const [model, size] = GARDEN_PLANTS[Math.floor(random() * GARDEN_PLANTS.length)];
        const stand = bush(random, 0.45);
        const scale = size * (0.8 + random() * 0.4);
        if (!clear) {
          placeKitPlant(town, stand, { model, x: at.x, z: at.z, angle, scale });
          town.circles.push({ x: at.x, z: at.z, r: 0.3 });
        }
        along += 0.9;
      } else if (random() < 0.3) {
        const size = 0.55 + random() * 0.2;
        if (!clear) {
          placeKitProp(town, crate(size), { model: "crate-wooden", x: at.x, z: at.z, angle, scale: size / 0.85 });
          town.circles.push({ x: at.x, z: at.z, r: 0.4 });
        }
        along += 0.85;
      } else {
        const [model, fallback, r] = DOORSTEP_CLUTTER[Math.floor(random() * DOORSTEP_CLUTTER.length)];
        if (!clear) {
          placeKitProp(town, fallback(), { model, x: at.x, z: at.z, angle });
          town.circles.push({ x: at.x, z: at.z, r });
        }
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
 * A wooden fence round a `width` × `depth` rectangle at (x, z) (whole numbers of fence lengths), its gate in
 * the middle of the front side (`facing`). It blocks like a wall, low, with the gate left open.
 */
function placeFence(town, x, z, width, depth, facing) {
  const turn = (facing * Math.PI) / 2;
  const [halfW, halfD] = [width / 2, depth / 2];
  const gate = Math.floor(width / FENCE_LENGTH / 2);
  for (let side = 0; side < 4; side++) {
    const lengths = (side % 2 === 0 ? width : depth) / FENCE_LENGTH;
    for (let i = 0; i < lengths; i++) {
      if (side === 0 && i === gate) continue; // the way in
      const along = -(side % 2 === 0 ? halfW : halfD) + FENCE_LENGTH * (i + 0.5);
      // Side 0 is the front (+z), then the right (+x), the back and the left; each length runs along its side.
      const [lx, lz, angle] = [
        [along, halfD, 0],
        [halfW, along, Math.PI / 2],
        [along, -halfD, 0],
        [-halfW, along, Math.PI / 2],
      ][side];
      const spot = toWorld(x, z, facing, lx, lz);
      placeKitProp(town, null, { model: "prop-woodenfence-single", x: spot.x, z: spot.z, angle: turn + angle });
    }
  }
  town.propPieces.push(fence(width, depth).rotateY(turn).translate(x, 0, z)); // the simple fence, till the kit's
  const gateFrom = -halfW + FENCE_LENGTH * gate;
  for (const [minX, maxX, minZ, maxZ] of [
    [-halfW, gateFrom, halfD - 0.1, halfD + 0.1],
    [gateFrom + FENCE_LENGTH, halfW, halfD - 0.1, halfD + 0.1],
    [-halfW, halfW, -halfD - 0.1, -halfD + 0.1],
    [-halfW - 0.1, -halfW + 0.1, -halfD, halfD],
    [halfW - 0.1, halfW + 0.1, -halfD, halfD],
  ]) {
    if (maxX - minX > 0.05) town.boxes.push({ ...footprintBox(x, z, facing, { minX, maxX, minZ, maxZ }), low: true });
  }
}

/**
 * A farm out in the country: the farmhouse and a red barn either side of the yard where its road ends,
 * fenced fields of crops in rows behind them (one of wheat, one of greens), crates, barrels and a wagon.
 */
function placeFarm(random, town, outpost) {
  const { x, z, facing } = outpost;
  const at = (lx, lz) => toWorld(x, z, facing, lx, lz);
  const turn = (facing * Math.PI) / 2;
  const house = at(-6.5, 1.5);
  const farmDoor = town.doors.length; // the farmhouse's, placed next: whoever works there works its fields
  placeBuilding(random, town, makeSpec(random, "home", { width: 7, depth: 6 }), house.x, house.z, facing);
  // The barn: plank walls under a steep roof, big doors to the yard. The kit's barn (Farm Buildings) stands
  // in its place once the props have loaded; this plain one shows till then, and with detailed props off.
  const barn = at(7, 0);
  const [width, depth, wall] = [9.4, 10.2, 4.2];
  const red = random() < 0.5 ? 0x8a3b2c : 0x7a4a2e;
  const pieces = [
    box(width, wall, depth, 0, wall / 2, 0, red),
    painted(
      slopedRoof(depth + 0.6, width + 0.8, 3.2, false)
        .rotateY(Math.PI / 2)
        .translate(0, wall, 0),
      0x5b4636,
    ),
    box(3.2, 3.2, 0.12, 0, 1.6, depth / 2 + 0.06, 0x5a3b26), // the doors
    box(3.5, 0.18, 0.16, 0, 3.25, depth / 2 + 0.08, 0xe8e0cc), // and their white trim
    box(0.18, 3.3, 0.16, -1.66, 1.65, depth / 2 + 0.08, 0xe8e0cc),
    box(0.18, 3.3, 0.16, 1.66, 1.65, depth / 2 + 0.08, 0xe8e0cc),
    box(1.1, 0.9, 0.1, 0, wall + 1.1, depth / 2 + 0.25, 0x3a2a1e), // the hayloft door in the gable
  ];
  placeKitProp(town, mergeGeometries(pieces), { model: "barn", x: barn.x, z: barn.z, angle: turn, scale: 1.22 });
  town.boxes.push(
    footprintBox(barn.x, barn.z, facing, { minX: -width / 2, maxX: width / 2, minZ: -depth / 2, maxZ: depth / 2 }),
  );
  // A windmill beyond the barn, its sails toward the yard: a stone tower in plain shapes till the kit's is in.
  const mill = at(16.5, -1.5);
  const tower = [
    painted(new CylinderGeometry(1.5, 2.1, 8, 10).translate(0, 4, 0), 0x8a857c),
    painted(new ConeGeometry(1.9, 2.2, 10).translate(0, 9.1, 0), 0x5b4636),
    box(0.3, 9, 0.12, 0, 8, 2.1, 0xd8d2c0),
    box(9, 0.3, 0.12, 0, 8, 2.1, 0xd8d2c0),
  ];
  placeKitProp(town, mergeGeometries(tower.map((piece) => (piece.index ? piece.toNonIndexed() : piece))), {
    model: "windmill",
    x: mill.x,
    z: mill.z,
    angle: turn,
    scale: 1,
  });
  town.circles.push({ x: mill.x, z: mill.z, r: 2.6 });
  // Fields behind, each in rows of crops on ridged earth, fenced with the gate toward the yard.
  for (const [side, crop] of [
    [-1, random() < 0.5 ? "wheat" : "greens"],
    [1, null],
  ]) {
    const kind = crop ?? (random() < 0.5 ? "wheat" : "greens");
    const centre = at(side * 9.5, -15);
    const [fieldW, fieldD] = [16, 14];
    placeFence(town, centre.x, centre.z, fieldW, fieldD, facing);
    const rows = [
      painted(new PlaneGeometry(fieldW - 0.6, fieldD - 0.6).rotateX(-Math.PI / 2).translate(0, 0.05, 0), 0x5e4630),
    ];
    const tall = kind === "wheat" ? 0.75 : 0.35;
    const colour = kind === "wheat" ? 0xcfae55 : 0x5f8f3a;
    for (let lx = -fieldW / 2 + 1.2; lx <= fieldW / 2 - 1.2; lx += 1.25) {
      rows.push(box(0.7, 0.16, fieldD - 1.6, lx, 0.08, 0, 0x6e5338));
      rows.push(box(0.42, tall, fieldD - 2, lx, 0.12 + tall / 2, 0, colour));
    }
    town.pieces.push(mergeGeometries(rows).rotateY(turn).translate(centre.x, 0, centre.z));
    // Between the rows, in through the gate: places to hoe, sow and water.
    const gate = at(side * 9.5, -15 + fieldD / 2 + 0.9);
    for (const [lx, lz, sideways] of [
      [-3.675, 3.5, 1],
      [0.075, -1, -1],
      [3.825, -4.5, 1],
    ]) {
      placeSpot(town, {
        ...at(side * 9.5 + lx, -15 + lz),
        angle: turn + (sideways * Math.PI) / 2,
        approach: gate,
        act: "farm",
        role: "work",
        door: farmDoor,
      });
    }
  }
  // The yard: crates of what the farm grows by the house, barrels by the barn, a wagon.
  for (const [model, lx, lz] of [
    ["farmcrate-apple", -2.4, 5.5],
    ["farmcrate-carrot", -1.4, 6.2],
    ["barrel-apples", 2.8, 6.5],
  ]) {
    const spot = at(lx, lz);
    placeKitProp(town, crate(0.6), { model, x: spot.x, z: spot.z, angle: turn + random() * 0.6 - 0.3 });
    town.circles.push({ x: spot.x, z: spot.z, r: 0.45 });
  }
  const wagon = at(12.5, 8);
  placeWagon(random, town, wagon.x, wagon.z, facing % 2 === 1);
}

const OLD_STONE = 0x8a857a;
/** A stone's simple shape: a box, tilted a little (`tilt` radians about x and z). */
const slab = (width, height, depth, tilt = 0) =>
  painted(
    new BoxGeometry(width, height, depth)
      .translate(0, height / 2, 0)
      .rotateX(tilt)
      .rotateZ(tilt * 0.6),
    OLD_STONE,
  );

/**
 * Old stone, weathered: moss creeping up from the ground, the faces a little lighter or darker each
 * (by where they are, so it's the same every time). `geometry` is painted, standing on y = 0.
 */
function weathered(geometry) {
  const position = geometry.attributes.position;
  const colour = geometry.attributes.color;
  const moss = new Color(0x5f6b45);
  const tint = new Color();
  for (let i = 0; i < position.count; i += 3) {
    // One shade per triangle (flat-shaded faces), from the triangle's middle.
    const [x, y, z] = [0, 1, 2].map(
      (k) => (position.getComponent(i, k) + position.getComponent(i + 1, k) + position.getComponent(i + 2, k)) / 3,
    );
    const shade = 0.9 + 0.18 * (Math.sin(x * 12.9898 + z * 78.233) * 0.5 + 0.5);
    for (let v = i; v < i + 3; v++) {
      tint.fromArray(colour.array, v * 3).multiplyScalar(shade);
      const low = Math.max(0, Math.min(1, (0.55 - position.getY(v)) / 0.55));
      tint.lerp(moss, low * 0.7);
      tint.toArray(colour.array, v * 3);
    }
  }
  return geometry;
}

/** Ferns, grass and bushes round a landmark's stones, `count` of them within `reach` of its middle. */
function overgrow(random, town, outpost, count, reach) {
  const plants = ["fern-1", "grass-wispy-tall", "grass-common-tall", "bush-common", "fern-1"];
  for (let i = 0; i < count; i++) {
    const angle = random() * Math.PI * 2;
    const distance = reach * (0.3 + random() * 0.8);
    const model = plants[Math.floor(random() * plants.length)];
    placeKitPlant(town, null, {
      model,
      x: outpost.x + Math.cos(angle) * distance,
      z: outpost.z + Math.sin(angle) * distance,
      angle: random() * 6.3,
      scale: model.startsWith("bush") ? 0.45 : 0.6 + random() * 0.3,
    });
  }
}

/** Puts local geometry (built round the place's middle, front +z) into the always-drawn pieces. */
function placeLocal(town, outpost, geometry) {
  town.pieces.push(geometry.rotateY((outpost.facing * Math.PI) / 2).translate(outpost.x, 0, outpost.z));
}

/**
 * Kit props that dress a place out in the country (the props kit's CC0 models by iPoly3D): the watch's
 * gallows, pillory and cage beside its tower, crystals among the standing stones, a signpost off the
 * corner of an inn or a cottage (`size`: its building's). From numbers of their own, seeded by where the
 * place is, so nothing built before them moves. With no props kit they simply aren't there.
 */
function dressPlace(town, outpost, size = null) {
  const random = rng(hashString(`${Math.round(outpost.x)}:${Math.round(outpost.z)}:dress`));
  const turn = (outpost.facing * Math.PI) / 2;
  /** `r`: how wide it stands in the way (0: walked through). */
  const put = (model, lx, lz, { angle = 0, scale = 1, r = 0 } = {}) => {
    const spot = toWorld(outpost.x, outpost.z, outpost.facing, lx, lz);
    placeKitProp(town, null, { model, x: spot.x, z: spot.z, angle: turn + angle, scale });
    if (r) town.circles.push({ x: spot.x, z: spot.z, r });
  };
  if (outpost.kind === "watchtower") {
    put("gallows", -7.5, 1, { angle: 0.3, r: 1.1 });
    put("pillory", 5.5, 3.5, { angle: -0.4, scale: 1.25, r: 0.6 });
    if (random() < 0.6) put("cage", 6.5, -3, { angle: random() * 6.3, r: 1.1 });
  } else if (outpost.kind === "stones") {
    for (const model of ["crystal-1", "crystal-2", "crystal-3"]) {
      const angle = random() * 6.3;
      const out = 2.6 + random() * 2.2;
      put(model, Math.cos(angle) * out, Math.sin(angle) * out, {
        angle: random() * 6.3,
        scale: 0.16 + random() * 0.1,
        r: 0.5,
      });
    }
  } else if (size) {
    const side = random() < 0.5 ? -1 : 1;
    put(random() < 0.5 ? "signpost" : "signpost-2", side * (size.width / 2 + 2.5), size.depth / 2 + 1.5, {
      angle: (random() - 0.5) * 0.6,
      r: 0.3,
    });
  }
}

/** Landmarks out in the country, each built from plain shapes (no kit models), with its colliders. */
const LANDMARKS = {
  /** A pond in a hollow: reeds and ferns round the shore, a few mossy stones, a bench looking over it. */
  pond(random, town, outpost) {
    const shore = (outpost.radius ?? POND_RADIUS) + 0.6;
    for (let i = 0; i < 26; i++) {
      const angle = random() * Math.PI * 2;
      const distance = shore + random() * 2.2;
      const model = ["grass-wispy-tall", "grass-wispy-tall", "grass-common-tall", "fern-1"][Math.floor(random() * 4)];
      placeKitPlant(town, null, {
        model,
        x: outpost.x + Math.sin(angle) * distance,
        z: outpost.z + Math.cos(angle) * distance,
        y: -0.25,
        angle: random() * 6.3,
        scale: 0.7 + random() * 0.4,
      });
    }
    const stones = [];
    for (let i = 0; i < 5; i++) {
      const angle = random() * Math.PI * 2;
      const distance = shore + 1.2 + random() * 1.5;
      const [lx, lz] = [Math.sin(angle) * distance, Math.cos(angle) * distance];
      stones.push(
        slab(0.8 + random() * 0.6, 0.4 + random() * 0.3, 0.6 + random() * 0.5, random() * 0.3)
          .rotateY(random() * 3)
          .translate(lx, -0.3, lz),
      );
    }
    placeLocal(town, outpost, weathered(mergeGeometries(stones)));
    // The bench on the town side, looking out over the water.
    const seat = toWorld(outpost.x, outpost.z, outpost.facing, 0, shore + 3.2);
    placeBench(town, seat.x, seat.z, (outpost.facing + 2) % 4);
  },
  /** Old ruins: broken stone walls round a long-gone hall, a fallen arch's stones in the grass. */
  ruins(random, town, outpost) {
    const at = (lx, lz) => toWorld(outpost.x, outpost.z, outpost.facing, lx, lz);
    const pieces = [];
    const [w, d] = [12, 9];
    const walls = [
      [-w / 2, -d / 2, w / 2, -d / 2],
      [w / 2, -d / 2, w / 2, d / 2],
      [w / 2, d / 2, 1.5, d / 2],
      [-1.5, d / 2, -w / 2, d / 2],
      [-w / 2, d / 2, -w / 2, -d / 2],
    ];
    for (const [ax, az, bx, bz] of walls) {
      const length = Math.hypot(bx - ax, bz - az);
      const pieceCount = Math.ceil(length / 2);
      for (let i = 0; i < pieceCount; i++) {
        if (random() < 0.22) continue; // a gap where it fell
        const t = (i + 0.5) / pieceCount;
        const height = 0.6 + random() * random() * 3.4;
        const lx = ax + (bx - ax) * t;
        const lz = az + (bz - az) * t;
        const along = Math.abs(bx - ax) > 0.1;
        pieces.push(
          painted(
            new BoxGeometry(
              along ? length / pieceCount + 0.05 : 0.7,
              height,
              along ? 0.7 : length / pieceCount + 0.05,
            ).translate(lx, height / 2, lz),
            random() < 0.5 ? OLD_STONE : 0x7c776c,
          ),
        );
        const spot = at(lx, lz);
        town.circles.push({ x: spot.x, z: spot.z, r: 1.05 });
      }
    }
    for (let i = 0; i < 7; i++) {
      const lx = (random() - 0.5) * (w + 6);
      const lz = (random() - 0.5) * (d + 6);
      pieces.push(
        slab(0.6 + random() * 0.6, 0.4 + random() * 0.3, 0.5 + random() * 0.5, random() * 0.3)
          .rotateY(random() * 3)
          .translate(lx, -0.05, lz),
      );
    }
    placeLocal(town, outpost, weathered(mergeGeometries(pieces)));
    overgrow(random, town, outpost, 16, 9);
  },
  /** A timber watchtower on four legs, a ladder up to its roofed platform. */
  watchtower(random, town, outpost) {
    const at = (lx, lz) => toWorld(outpost.x, outpost.z, outpost.facing, lx, lz);
    const timber = 0x6b4a2f;
    const [half, height] = [1.7, 7];
    const pieces = [];
    for (const [sx, sz] of [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ]) {
      pieces.push(box(0.32, height + 2.2, 0.32, sx * half, (height + 2.2) / 2, sz * half, timber));
      const leg = at(sx * half, sz * half);
      town.circles.push({ x: leg.x, z: leg.z, r: 0.35 });
    }
    pieces.push(box(half * 2 + 0.6, 0.25, half * 2 + 0.6, 0, height, 0, 0x7d5a3a)); // the platform
    for (const side of [-1, 1]) {
      pieces.push(box(half * 2 + 0.6, 0.12, 0.1, 0, height + 1, side * (half + 0.3), timber)); // rails
      pieces.push(box(0.1, 0.12, half * 2 + 0.6, side * (half + 0.3), height + 1, 0, timber));
      pieces.push(box(0.1, height, 0.1, side * 0.35, height / 2, half + 0.5, timber)); // the ladder's sides
    }
    for (let rung = 0.5; rung < height; rung += 0.45) pieces.push(box(0.8, 0.07, 0.07, 0, rung, half + 0.5, timber));
    pieces.push(box(1.4, 0.06, 1.4, 1, height - 0.9, -1, timber).rotateX(0.5)); // bracing
    pieces.push(painted(slopedRoof(half * 2 + 1.2, half * 2 + 1.2, 1.8, true).translate(0, height + 2.2, 0), 0x5b4636));
    placeLocal(town, outpost, mergeGeometries(pieces));
  },
  /** A ring of standing stones in a clearing, a flat stone in the middle. */
  stones(random, town, outpost) {
    const pieces = [];
    const count = 9 + Math.floor(random() * 4);
    for (let i = 0; i < count; i++) {
      if (random() < 0.12) continue; // one gone
      const angle = (i / count) * Math.PI * 2;
      const [lx, lz] = [Math.cos(angle) * 6.5, Math.sin(angle) * 6.5];
      const height = 2 + random() * 1.4;
      pieces.push(
        slab(1 + random() * 0.4, height, 0.6, (random() - 0.5) * 0.18)
          .rotateY(-angle + Math.PI / 2)
          .translate(lx, -0.1, lz),
      );
      const spot = toWorld(outpost.x, outpost.z, outpost.facing, lx, lz);
      town.circles.push({ x: spot.x, z: spot.z, r: 0.65 });
    }
    pieces.push(slab(2.4, 0.5, 1.3).translate(0, -0.05, 0));
    const middle = toWorld(outpost.x, outpost.z, outpost.facing, 0, 0);
    town.circles.push({ x: middle.x, z: middle.z, r: 1.2 });
    placeLocal(town, outpost, weathered(mergeGeometries(pieces)));
    overgrow(random, town, outpost, 12, 9);
  },
  /** A fenced graveyard: rows of headstones, a stone cross, a dark old tree. */
  graveyard(random, town, outpost) {
    const [w, d] = [14, 12];
    placeFence(town, outpost.x, outpost.z, w, d, outpost.facing);
    const pieces = [];
    for (let row = 0; row < 3; row++) {
      for (let i = 0; i < 5; i++) {
        if (random() < 0.15) continue;
        const lx = -4.6 + i * 2.3 + (random() - 0.5) * 0.3;
        const lz = -3.4 + row * 2.6;
        const height = 0.7 + random() * 0.4;
        pieces.push(slab(0.6, height, 0.16, (random() - 0.5) * 0.15).translate(lx, -0.05, lz));
        pieces.push(box(0.7, 0.06, 1.5, lx, 0.03, lz + 0.85, 0x5e6b3c)); // the grave's mound
      }
    }
    pieces.push(slab(0.3, 2.2, 0.3).translate(0, 0, -5));
    pieces.push(box(1.2, 0.3, 0.3, 0, 1.6, -5, OLD_STONE));
    placeLocal(town, outpost, weathered(mergeGeometries(pieces)));
    const tree = toWorld(outpost.x, outpost.z, outpost.facing, 5, -4.2);
    placeKitPlant(
      town,
      mergeGeometries([
        painted(new CylinderGeometry(0.2, 0.3, 2, 5).translate(0, 1, 0), 0x4a3424),
        painted(new ConeGeometry(1.6, 4.5, 7).translate(0, 4, 0), 0x2f4a2c),
      ]),
      { model: "pine-3", x: tree.x, z: tree.z, angle: random() * 6.3, scale: 0.55 },
    );
    town.circles.push({ x: tree.x, z: tree.z, r: 0.4 });
  },
  /** A mill on the river bank: a house with a door to the road, its waterwheel turning in the stream behind. */
  mill(random, town, outpost) {
    placeBuilding(random, town, makeSpec(random, "home", { width: 7, depth: 6 }), outpost.x, outpost.z, outpost.facing);
    const timber = 0x5e4330;
    const wheel = [painted(new CylinderGeometry(0.18, 0.18, 1.6, 6).rotateX(Math.PI / 2), timber)];
    const radius = 2.3;
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      wheel.push(box(0.12, radius, 0.12, 0, radius / 2, 0, timber).rotateZ(angle)); // spokes
      wheel.push(box(0.75, 0.1, 1.1, 0, radius, 0, 0x6f5038).rotateZ(angle)); // paddles
    }
    // Beside the back wall (toward the water), standing on the axle.
    const geometry = mergeGeometries(wheel)
      .rotateY(Math.PI / 2)
      .translate(0, 1.1, -4.4);
    placeLocal(town, outpost, geometry);
  },
};

/** How far out from the middle a settlement's wall runs: just past its outer streets. */
const wallLine = () => townHalf + STREET / 2 + 1.6;

/**
 * A stone wall round the settlement, crenellated, with a round tower at each corner and a gatehouse (two
 * towers and a walkway over the way through) wherever a road leaves town, and in the middle of each side.
 * The wall blocks walkers; street points outside each gate lead the townsfolk out and back in.
 */
function placeWalls(town, land) {
  const line = wallLine();
  const stone = 0x878177;
  const pieces = [];
  const gateWidth = STREET + 0.6;
  const tower = (x, z, height, radius) => {
    pieces.push(painted(new CylinderGeometry(radius, radius + 0.25, height, 10).translate(x, height / 2, z), stone));
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      pieces.push(
        box(
          0.7,
          0.8,
          0.7,
          x + Math.cos(angle) * (radius - 0.3),
          height + 0.4,
          z + Math.sin(angle) * (radius - 0.3),
          stone,
        ),
      );
    }
    town.circles.push({ x, z, r: radius + 0.2 });
  };
  // The gates on each side: where the roads from town start (their street), and the middle street.
  const middle = streetLines[Math.floor(streetLines.length / 2)];
  const roadGates = new Set(); // the gates a road goes out of (the rest get a short track)
  const gates = {
    north: new Set([middle]),
    south: new Set([middle]),
    east: new Set([middle]),
    west: new Set([middle]),
  };
  for (const road of land.roads) {
    if (!road.fromTown) continue;
    const start = road.points[0];
    const side =
      Math.abs(start.x) > Math.abs(start.z) ? (start.x > 0 ? "east" : "west") : start.z > 0 ? "south" : "north";
    gates[side].add(side === "east" || side === "west" ? start.z : start.x);
    roadGates.add(`${side}:${side === "east" || side === "west" ? start.z : start.x}`);
  }
  for (const [side, at] of Object.entries(gates)) {
    const alongX = side === "north" || side === "south";
    const out = side === "south" || side === "east" ? line : -line;
    const spot = (along, across = out) => (alongX ? { x: along, z: across } : { x: across, z: along });
    const openings = [...at].sort((a, b) => a - b);
    // Wall lengths between the corners and the gates.
    let from = -line;
    for (const gate of [...openings, null]) {
      const to = gate === null ? line : gate - gateWidth / 2;
      if (to - from > 0.5) {
        const centre = spot((from + to) / 2);
        const length = to - from;
        pieces.push(box(alongX ? length : 1.2, 4.2, alongX ? 1.2 : length, centre.x, 2.1, centre.z, stone));
        for (let t = from + 0.6; t < to - 0.4; t += 1.6) {
          const merlon = spot(t, out + (out > 0 ? 0.35 : -0.35));
          pieces.push(box(alongX ? 0.8 : 0.5, 0.7, alongX ? 0.5 : 0.8, merlon.x, 4.55, merlon.z, stone));
        }
        const half = { x: alongX ? length / 2 : 0.6, z: alongX ? 0.6 : length / 2 };
        town.boxes.push({
          minX: centre.x - half.x,
          maxX: centre.x + half.x,
          minZ: centre.z - half.z,
          maxZ: centre.z + half.z,
        });
      }
      if (gate === null) break;
      // The gatehouse: a tower either side and a walkway over the top.
      for (const edge of [-1, 1]) {
        const towerAt = spot(gate + edge * (gateWidth / 2 + 1.1));
        tower(towerAt.x, towerAt.z, 6.4, 1.5);
      }
      const top = spot(gate);
      pieces.push(box(alongX ? gateWidth + 1 : 2, 1.1, alongX ? 2 : gateWidth + 1, top.x, 5, top.z, stone));
      // Street points through the gate: just inside and just outside.
      town.waypoints.push(spot(gate, out + (out > 0 ? 5 : -5)), spot(gate, out + (out > 0 ? -2.5 : 2.5)));
      gateLanes.push([spot(gate, out - (out > 0 ? 3 : -3)), spot(gate, out + (out > 0 ? 18 : -18))]);
      // No road out of this one: a short dirt track from the gate, wearing away into the meadow.
      if (!roadGates.has(`${side}:${gate}`)) {
        const sign = out > 0 ? 1 : -1;
        town.gateTracks.push([spot(gate, out - sign * 2.6), spot(gate, out + sign * 16)]);
      }
      from = gate + gateWidth / 2;
    }
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) tower(sx * line, sz * line, 6, 2);
  town.pieces.push(weathered(mergeGeometries(pieces)));
}

/**
 * A fenced garden on an empty lot (`size` metres square, a whole number of fence lengths), its gate facing
 * `facing`: a tree in a back corner, bushes and flowers along the fence, and a bench at the back facing
 * the gate.
 */
function placeGarden(random, town, x, z, size, facing) {
  town.gardens.push({ x, z, size });
  const at = (lx, lz) => toWorld(x, z, facing, lx, lz);
  const half = size / 2;
  placeFence(town, x, z, size, size, facing);

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
  // By the beds along the side away from the tree: a place to kneel and tend them.
  placeSpot(town, {
    ...at(-corner * (half - 1.35), 0.4),
    angle: (facing * Math.PI) / 2 - (corner * Math.PI) / 2,
    approach: at(0, half + 0.8),
    act: "tend",
    role: "rest",
  });
}

/**
 * The path round a square of half-size `half` at (cx, cz), `inset` in from its edge, with rounded
 * corners of radius `round`: a closed loop starting halfway along one side (so the strip built on it
 * joins without a seam), going round the right way for a ribbon's +side to face inwards.
 */
function roundedLoop(cx, cz, half, inset, round) {
  const reach = half - inset;
  const straight = reach - round;
  const points = [];
  const corners = [
    [1, 1],
    [-1, 1],
    [-1, -1],
    [1, -1],
  ];
  points.push({ x: cx + reach, z: cz });
  for (const [sx, sz] of corners) {
    // Along the side to this corner, round it (8 steps), on to the next side.
    const centreX = cx + sx * straight;
    const centreZ = cz + sz * straight;
    const a0 = sx > 0 && sz > 0 ? 0 : sx < 0 && sz > 0 ? Math.PI / 2 : sx < 0 && sz < 0 ? Math.PI : (3 * Math.PI) / 2;
    for (let k = 0; k <= 8; k++) {
      const a = a0 + (k / 8) * (Math.PI / 2);
      points.push({ x: centreX + Math.cos(a) * round, z: centreZ + Math.sin(a) * round });
    }
  }
  points.push({ x: cx + reach, z: cz });
  return points;
}

/**
 * A block's edge: a raised stone kerb along the street and the sidewalk of setts inside it, fading into
 * the lawn over its last half metre, all with rounded corners. Built as strips in the ground's material.
 */
function blockEdge(town, cx, cz, half) {
  if (look.roads === "dirt") return; // dirt streets: the lots' grass meets the street, no kerb or sidewalk
  // The loop runs anticlockwise seen from above (+x towards +z), so a ribbon's +side faces the middle.
  const kerbLoop = roundedLoop(cx, cz, half, 0.12, 1.4);
  const walkLoop = roundedLoop(cx, cz, half, 0.24 + SIDEWALK / 2, 1.4 - 0.12 - SIDEWALK / 2);
  town.kerbs.push(kerbLoop);
  town.sidewalks.push(walkLoop);
  // The street's cobbles carry on into each corner the rounded kerb leaves (the sidewalk covers the rest).
  for (const [sx, sz] of [
    [1, 1],
    [-1, 1],
    [-1, -1],
    [1, -1],
  ]) {
    town.roadPieces.push(
      painted(
        new PlaneGeometry(1.8, 1.8)
          .rotateX(-Math.PI / 2)
          .translate(cx + sx * (half - 0.9), 0.032, cz + sz * (half - 0.9)),
        ROAD,
      ),
    );
  }
}

/** An empty block at the town's edge, left as a meadow: a few trees, wildflowers and long grass. */
function placeMeadow(random, town, cx, cz, kerbed = true) {
  if (kerbed) blockEdge(town, cx, cz, BLOCK / 2);
  town.meadows.push({ x: cx, z: cz, half: BLOCK / 2 });
  // Places in the grass to sit or lie a while (from numbers of their own, as with all the spots).
  const own = rng(hashString(`meadow:${Math.round(cx)}:${Math.round(cz)}`));
  for (const act of ["ground", "lie", "ground"]) {
    placeSpot(town, {
      x: cx + (own() * 2 - 1) * (BLOCK / 2 - 3),
      z: cz + (own() * 2 - 1) * (BLOCK / 2 - 3),
      angle: own() * Math.PI * 2,
      act,
      role: "rest",
    });
  }
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

/** What of a stall blocks the way: its counter and posts, not the ground behind where its seller stands. */
const STALL_BOX = { minX: -1.3, maxX: 1.3, minZ: -0.65, maxZ: 0.8 };

/** A wagon left at the side of a street at (x, z), lying along x (`alongX`) or z. */
function placeWagon(random, town, x, z, alongX) {
  const angle = (alongX ? Math.PI / 2 : 0) + (random() < 0.5 ? 0 : Math.PI);
  placeKitProp(town, wagon(), {
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

/** The noticeboard on the market's south side, facing in, near where people arrive. */
function placeNoticeboard(town, px, pz) {
  town.noticeboard = { x: px - 2.6, z: pz + 7.5, angle: Math.PI, use: { x: px - 2.6, z: pz + 6.5 } };
  town.boxes.push({ minX: px - 3.6, maxX: px - 1.6, minZ: pz + 7.25, maxZ: pz + 7.75, low: true });
}

/** Where a stall's seller stands behind its counter, and where someone looking at its goods stands. */
function stallSpots(town, x, z, facing) {
  const angle = (facing * Math.PI) / 2;
  const seller = placeSpot(town, {
    ...toWorld(x, z, facing, 0, -1.05),
    angle,
    approach: toWorld(x, z, facing, 1.9, -1.05),
    act: "vend",
    role: "work",
    kind: "shop",
  });
  placeSpot(town, {
    ...toWorld(x, z, facing, 0.25, 1.5),
    angle: angle + Math.PI,
    act: "browse",
    role: "browse",
    seller,
  });
}

/** A stall facing `facing`, with goods on its counter and a barrel or sack at its side. */
function placeStall(random, town, x, z, facing) {
  const angle = (facing * Math.PI) / 2;
  stallSpots(town, x, z, facing);
  placeKitProp(town, marketStall(random), { model: "stall-empty", x, z, angle, scale: 1.3 });
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
  town.boxes.push(footprintBox(x, z, facing, STALL_BOX));
  const beside = toWorld(x, z, facing, random() < 0.5 ? -1.6 : 1.6, 0);
  const [model, fallback, r] = DOORSTEP_CLUTTER[Math.floor(random() * 3)];
  placeKitProp(town, fallback(), { model, x: beside.x, z: beside.z, angle: random() * Math.PI * 2 });
  town.circles.push({ x: beside.x, z: beside.z, r });
}

/**
 * The market's furniture, by its kind: a square with the fountain, stalls in the corners and benches; a
 * stall market (two rows of stalls facing each other, benches at the ends); or a green (grass, a few
 * trees and bushes round its edge, benches facing in). Each has the noticeboard.
 */
function placeMarket(random, town) {
  const px = plaza.x;
  const pz = plaza.z;
  if (look.layout === "pond" && look.wide) {
    // By the pond: stalls set down here and there over the whole plot, each turned in toward the middle
    // and none quite in line, with the noticeboard and two benches. (The middle stays clear: a market
    // with a fountain has it there.)
    placeNoticeboard(town, px, pz);
    for (const [x, z] of [
      [-6.3, -5.9],
      [6.1, -6.3],
      [-6.7, 1.1],
      [6.6, 0.4],
      [2.9, 5.6],
    ]) {
      const [sx, sz] = [x + (random() - 0.5) * 0.9, z + (random() - 0.5) * 0.9];
      placeStall(random, town, px + sx, pz + sz, facingFor(-sx, -sz));
    }
    placeBench(town, px - 3.6, pz - 1.2, 1);
    placeBench(town, px + 3.6, pz - 1.2, 3);
    return;
  }
  if (look.market === "square") {
    // The fountain itself is built in createWorld (fixtures.js); here, only room for it.
    town.circles.push({ x: px, z: pz, r: FOUNTAIN_RADIUS + 0.7 }); // the stone rim and the plants round it

    // The noticeboard: on the square's south side, facing the fountain, near where people arrive.
    placeNoticeboard(town, px, pz);

    // Market day on the plaza: stalls in the corners facing the fountain, benches beside it.
    for (let [x, z] of [
      [-5.6, -5.6],
      [5.6, -5.6],
      [-5.6, 5.2],
      [5.6, 5.2],
    ]) {
      const facing = facingFor(-x, -z);
      const angle = (facing * Math.PI) / 2;
      x += px;
      z += pz;
      stallSpots(town, x, z, facing);
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
      town.boxes.push(footprintBox(x, z, facing, STALL_BOX));
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
      const bx = px + Math.cos(angle) * (FOUNTAIN_RADIUS + 0.45);
      const bz = pz + Math.sin(angle) * (FOUNTAIN_RADIUS + 0.45);
      placeKitPlant(town, bush(random, 0.45), { model, x: bx, z: bz, angle, scale: size * 0.8 });
    }
    for (const [x, z, facing] of [
      [-4, 0, 1],
      [4, 0, 3],
      [0, -4, 0],
      [-7.8, 0, 1],
      [7.8, 0, 3],
      [0, -7.8, 0],
    ]) {
      placeBench(town, px + x, pz + z, facing);
    }
    return;
  }
  placeNoticeboard(town, px, pz);
  if (look.market === "stalls") {
    for (const x of [-5.2, 0, 5.2]) {
      placeStall(random, town, px + x, pz - 4.2, 0); // facing south, across the lane
      placeStall(random, town, px + x, pz + 2.6, 2); // facing north
    }
    placeBench(town, px - 7.8, pz - 0.8, 1);
    placeBench(town, px + 7.8, pz - 0.8, 3);
    return;
  }
  // A green: trees and bushes round the edge, benches facing in.
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2;
    const reach = 7.2 + random() * 0.8;
    const [model, size] = GARDEN_PLANTS[i % GARDEN_PLANTS.length];
    placeKitPlant(town, bush(random, 0.5), {
      model,
      x: px + Math.cos(angle) * reach,
      z: pz + Math.sin(angle) * reach,
      angle,
      scale: size,
    });
  }
  for (const [x, z, facing] of [
    [-3.5, 0, 1],
    [3.5, 0, 3],
    [0, -3.5, 0],
  ]) {
    placeBench(town, px + x, pz + z, facing);
  }
}

/**
 * A hamlet out in the country: five to eight houses round a small green, facing in, the side towards its
 * road left open, with bushes and a bench on the green.
 */
function placeHamlet(random, town, outpost, doorOf, doorsOf) {
  const count = 5 + Math.floor(random() * 4);
  const doors = [];
  for (let i = 0; i < count; i++) {
    // Round the green, leaving a gap where the road comes in (the outpost's front).
    const angle = outpost.angle + Math.PI * 0.35 + (i / (count - 1)) * Math.PI * 1.3;
    const x = outpost.x + Math.sin(angle) * 15;
    const z = outpost.z + Math.cos(angle) * 15;
    const facing = ((Math.round(Math.atan2(outpost.x - x, outpost.z - z) / (Math.PI / 2)) % 4) + 4) % 4;
    doors.push(town.doors.length);
    const kind = i === 0 && random() < 0.5 ? "shop" : "home";
    placeBuilding(
      random,
      town,
      makeSpec(random, kind, { width: 5.5 + random() * 2, depth: 5 + random() * 2 }),
      x,
      z,
      facing,
    );
  }
  doorOf.set(outpost.index, doors[0]);
  doorsOf.set(outpost.index, doors);
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const [model, size] = GARDEN_PLANTS[i % GARDEN_PLANTS.length];
    placeKitPlant(town, bush(random, 0.45), {
      model,
      x: outpost.x + Math.cos(angle) * 4,
      z: outpost.z + Math.sin(angle) * 4,
      angle,
      scale: size,
    });
  }
  placeBench(town, outpost.x, outpost.z - 1.5, 0);
}

/**
 * One 18 m block. Around the plaza: a landmark (town hall, temple or tavern) filling the block, or shops
 * facing the plaza with homes behind. Elsewhere: up to four houses on the corner lots, now and then a shop
 * or the smithy, and gardens on the empty lots.
 */
function fillBlock(random, town, cx, cz, role) {
  const half = BLOCK / 2;
  blockEdge(town, cx, cz, half);
  const toPlaza = facingFor(plaza.x - cx, plaza.z - cz);
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
    const facesPlaza =
      role === "shops" && Math.sign(lx) * Math.sign(plaza.x - cx) + Math.sign(lz) * Math.sign(plaza.z - cz) > 0;
    if (!facesPlaza && random() < 0.16) {
      placeGarden(random, town, x, z, 6, random() < 0.5 ? (lz > 0 ? 0 : 2) : lx > 0 ? 1 : 3);
      continue;
    }
    let kind = facesPlaza
      ? "shop"
      : role === "smithy" && lx < 0 && lz < 0
        ? "smithy"
        : random() < 0.08
          ? "shop"
          : "home";
    // The world's lore needs more of some kind (a second tavern, three smithies): every so many houses
    // becomes one, spread through town.
    if (kind === "home" && town.extra.length && ++town.homeLots % town.extraEvery === 0) kind = town.extra.shift();
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

function buildTown(random, land, ground, needs = {}, seed = 0) {
  const kind = SETTLEMENTS[look.kind] ?? SETTLEMENTS.town;
  // Buildings the lore needs beyond what every town has (one hall, temple and tavern by the square, a
  // few shops facing it): they take the place of houses here and there.
  const town = {
    extra: [], // filled once the market's neighbours have their roles (below)
    homeLots: 0,
    extraEvery: 1,
    pieces: [],
    buildingPieces: [],
    buildings: [],
    propPieces: [],
    propSlots: [],
    naturePieces: [],
    natureSlots: [],
    roadPieces: [],
    plazaPieces: [],
    kerbs: [], // loops round each block (and the square) where a kerb runs
    sidewalks: [], // loops along the middle of each block's sidewalk
    waypoints: [],
    gardens: [],
    gateTracks: [], // short dirt tracks out of gates no road leaves by (placeWalls)
    meadows: [],
    boxes: [],
    circles: [],
    doors: [],
    seats: [],
    spots: [], // places to be doing something (placeSpot)
    camps: [], // campsites (placeCamp): { id, x, y, z, angle, mouth, bed, tents: [{ mouth, bed }] }
  };
  const centres = [];
  for (let i = 0; i < blocksPerSide; i++) centres.push((i - (blocksPerSide - 1) / 2) * PITCH);
  // The blocks round the market get the settlement's landmarks and shops, in a seeded order.
  const plazaRoles = [...kind.ring];
  for (let i = plazaRoles.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [plazaRoles[i], plazaRoles[j]] = [plazaRoles[j], plazaRoles[i]];
  }
  // Fewer blocks round the market than roles (a crossroads, one street): the landmarks come first, so
  // the settlement still has its hall, temple and tavern (a grid has room for them all).
  let around = 0;
  for (let da = -1; da <= 1; da++)
    for (let db = -1; db <= 1; db++) if ((da || db) && hasBlock(plaza.i + da, plaza.j + db)) around++;
  if (around < plazaRoles.length) {
    const rank = (role) => (role === "homes" ? 2 : role === "shops" ? 1 : 0);
    plazaRoles.sort((a, b) => rank(a) - rank(b));
  }
  // What it has anyway: the landmarks among the roles that found a block (a grid: the kind's usual), and
  // its usual shops on a grid (elsewhere they aren't sure, so the lore's shops all come as extras).
  const given = plazaRoles.slice(0, around);
  const base = blocks
    ? {
        hall: 0,
        temple: 0,
        tavern: 0,
        smithy: 0,
        shop: 0,
        ...Object.fromEntries(
          ["hall", "temple", "tavern"].map((role) => [role, given.filter((entry) => entry === role).length]),
        ),
      }
    : kind.base;
  for (const want of ["tavern", "smithy", "shop", "temple", "hall"]) {
    for (let n = base[want]; n < Math.min(12, needs[want] ?? 0); n++) town.extra.push(want);
  }
  // Spread through the house lots there are (about two per block; a town's grid keeps its old spacing).
  town.extraEvery = Math.max(1, Math.floor((blocks ? Math.max(3, blocks.size * 2) : 36) / (town.extra.length + 1)));
  const outer = centres[centres.length - 1];
  const smithyBlock = Math.floor(random() * 4);
  let ring = 0;
  let edgeIndex = 0;
  centres.forEach((cx, a) => {
    centres.forEach((cz, b) => {
      if (a === plaza.i && b === plaza.j) return; // the market
      if (!hasBlock(a, b)) return; // left open by the layout: meadow and woods
      const nearPlaza = Math.max(Math.abs(a - plaza.i), Math.abs(b - plaza.j)) <= 1;
      const edge = Math.max(Math.abs(cx), Math.abs(cz)) === outer;
      if (!blocks && edge && !nearPlaza && random() < 0.3) {
        placeMeadow(random, town, cx, cz); // a grid's ragged edge reads as a settlement, not a grid (other layouts are already ragged)
        return;
      }
      const corner = Math.abs(cx) === outer && Math.abs(cz) === outer;
      const role = nearPlaza
        ? (plazaRoles[ring++] ?? "homes")
        : corner && edgeIndex++ === smithyBlock
          ? "smithy"
          : "homes";
      fillBlock(random, town, cx, cz, role);
    });
  });

  // Streets: one strip per grid line in each direction, plus the paved plaza and its fountain.
  const span = PITCH + STREET; // a block's length of street, overlapping at the crossings
  for (let k = 0; k <= blocksPerSide; k++) {
    const line = (k - blocksPerSide / 2) * PITCH;
    for (let a = 0; a < blocksPerSide; a++) {
      const along = centres[a];
      if (hasStreetX(k, a)) town.roadPieces.push(streetPiece(span, STREET, along, 0.03, line));
      if (hasStreetZ(k, a)) town.roadPieces.push(streetPiece(STREET, span, line, 0.035, along));
    }
  }
  // The market: a paved square with a fountain (a town or city), stalls on paving or packed earth (a
  // village), or a green (a hamlet).
  const px = plaza.x;
  const pz = plaza.z;
  if (look.market === "square" || (look.market === "stalls" && look.roads === "cobble")) {
    town.plazaPieces.push(
      painted(new PlaneGeometry(BLOCK, BLOCK).rotateX(-Math.PI / 2).translate(px, 0.04, pz), PAVING),
    );
    town.kerbs.push(roundedLoop(px, pz, BLOCK / 2, 0.12, 0.6));
  } else if (look.market === "stalls") {
    town.roadPieces.push(streetPiece(BLOCK, BLOCK, px, 0.034, pz));
  }
  // Now and then a wagon left at the side of a street, halfway along a block (clear of the crossings'
  // lamps), never next to the plaza.
  for (let i = 1; i < blocksPerSide; i++) {
    const line = (i - blocksPerSide / 2) * PITCH;
    for (let j = 0; j < blocksPerSide; j++) {
      const middle = (j - (blocksPerSide - 1) / 2) * PITCH;
      const byMarket =
        (Math.abs(middle - px) < PITCH / 2 && Math.abs(line - pz) < PITCH) ||
        (Math.abs(middle - pz) < PITCH / 2 && Math.abs(line - px) < PITCH);
      if (byMarket || random() > 0.15) continue;
      const kerb = line + (random() < 0.5 ? -1 : 1) * (STREET / 2 - 1);
      if (random() < 0.5) {
        if (hasStreetX(i, j)) placeWagon(random, town, middle, kerb, true);
      } else if (hasStreetZ(i, j)) placeWagon(random, town, kerb, middle, false);
    }
  }
  placeMarket(random, town);

  if (look.walls) placeWalls(town, land);
  // The country round it (inns and cottages join the town's buildings before they're merged).
  const country = buildCountry(random, town, land, ground);
  // A campsite or two out past the edge of the settlement, on dry and fairly level ground: somewhere for
  // friends to sit round a fire. (From numbers of their own.)
  {
    const own = rng((seed ^ 0x51c0ffee) >>> 0);
    let made = 0;
    for (let tries = 0; tries < 40 && made < 2; tries++) {
      const angle = own() * Math.PI * 2;
      const reach = townHalf + 16 + own() * 26;
      const [x, z] = [Math.sin(angle) * reach, Math.cos(angle) * reach];
      const edge = worldSize / 2 - 12;
      if (Math.abs(x) > edge || Math.abs(z) > edge || inTown(x, z, 10)) continue;
      const heights = [0, 1, 2, 3].map((i) => heightAt(x + Math.sin(i * 1.57) * 3.5, z + Math.cos(i * 1.57) * 3.5));
      if (Math.max(...heights) - Math.min(...heights) > 0.7) continue;
      if ([0, 1, 2, 3, 4].some((i) => waterAt(x + Math.sin(i * 1.26) * 5, z + Math.cos(i * 1.26) * 5).depth > 0))
        continue;
      if (land.roads.some((road) => road.points.some((point) => Math.hypot(point.x - x, point.z - z) < 7))) continue;
      if (town.boxes.some((b) => x > b.minX - 6 && x < b.maxX + 6 && z > b.minZ - 6 && z < b.maxZ + 6)) continue;
      if (town.camps.some((camp) => Math.hypot(camp.x - x, camp.z - z) < CAMP_APART)) continue;
      placeCamp(town, x, z, Math.atan2(-x, -z), `camp${made++}`);
    }
  }
  // By each pond: places on the shore to sit and look at the water.
  for (const pond of land.ponds()) {
    const own = rng(hashString(`pond:${Math.round(pond.x)}:${Math.round(pond.z)}`));
    for (let i = 0; i < 4; i++) {
      const angle = ((i + own() * 0.7) / 4) * Math.PI * 2;
      const reach = pond.r + 1.3;
      placeSpot(town, {
        x: pond.x + Math.sin(angle) * reach,
        z: pond.z + Math.cos(angle) * reach,
        angle: angle + Math.PI, // facing the water
        act: "ground",
        role: "rest",
      });
    }
  }
  // The ground the layout leaves open, last of all (and from numbers of its own), so every building
  // before it keeps its number in a world made before there was anything here.
  const fill = rng((seed ^ 0x2f1b3a67) >>> 0);
  // Scattered houses have no blocks round the market for its landmarks: they take the lots facing it
  // (then any lot with one house): what the kind of settlement has, and what the lore needs beyond that.
  const landmarks = [];
  if (look.layout === "scattered") {
    landmarks.push(...kind.ring.filter((role) => role !== "homes").map((role) => (role === "shops" ? "shop" : role)));
    for (const want of ["tavern", "smithy", "shop", "temple", "hall"]) {
      for (let n = landmarks.filter((role) => role === want).length; n < Math.min(12, needs[want] ?? 0); n++)
        landmarks.push(want);
    }
    // Dirt ways in from each side, along the line its gate is on, as far as the market.
    const gate = streetLines[Math.floor(streetLines.length / 2)];
    for (const [alongX, sign] of [
      [true, 1],
      [true, -1],
      [false, 1],
      [false, -1],
    ]) {
      const spot = (along, across) => (alongX ? { x: along, z: across } : { x: across, z: along });
      const market = alongX ? plaza.z : plaza.x;
      if (Math.abs(gate - (alongX ? plaza.x : plaza.z)) > PITCH) continue; // the market isn't on this way in
      const [from, to] = [sign * (townHalf + 2), market + sign * (BLOCK / 2 + STREET)];
      if ((from - to) * sign > 6) town.gateTracks.push([spot(gate, from), spot(gate, to)]);
    }
  }
  const SIZES = { tavern: [11.5, 8.5], hall: [13.5, 10], temple: [13.5, 10] };
  const lots = [...openPlan.lots].sort((a, b) => (b.ring ? 1 : 0) - (a.ring ? 1 : 0)); // the market's lots first
  for (const lot of lots) {
    if (lot.kind === "houses" && lot.houses.length === 1 && landmarks.length) {
      const role = landmarks.shift();
      const [house] = lot.houses;
      const [width, depth] = SIZES[role] ?? [house.width, house.depth];
      // A big one stands in the middle of its lot, so it's clear of the lots beside it.
      const at = SIZES[role] ? { x: lot.x, z: lot.z } : house;
      placeBuilding(fill, town, makeSpec(fill, role, { width, depth }), at.x, at.z, house.facing);
    } else if (lot.kind === "houses") {
      for (const house of lot.houses)
        placeBuilding(
          fill,
          town,
          makeSpec(fill, "home", { width: house.width, depth: house.depth }),
          house.x,
          house.z,
          house.facing,
        );
    } else if (lot.kind === "meadow") placeMeadow(fill, town, lot.x, lot.z, false);
    else if (lot.kind === "garden") placeGarden(fill, town, lot.x, lot.z, 6, lot.facing);
    else {
      for (let i = 0; i < 1 + Math.floor(fill() * 3); i++) {
        const at = { x: lot.x + (fill() * 2 - 1) * 7, z: lot.z + (fill() * 2 - 1) * 7 };
        const model = ["commontree-1", "commontree-2", "commontree-4"][Math.floor(fill() * 3)];
        placeKitPlant(town, null, { model, x: at.x, z: at.z, angle: fill() * Math.PI * 2, scale: 0.6 + fill() * 0.2 });
        town.circles.push({ x: at.x, z: at.z, r: 0.35 });
      }
    }
  }
  const mesh = new Mesh(mergeOrEmpty(town.pieces), new MeshLambertMaterial({ vertexColors: true, flatShading: true }));
  // Lamp posts at every street crossing inside the town.
  const lamps = [];
  for (let i = 1; i < blocksPerSide; i++) {
    for (let j = 1; j < blocksPerSide; j++) {
      const lamp = {
        // Just inside the block's corner: on the kerb's sidewalk (or the lot's grass, by a dirt street).
        x: (i - blocksPerSide / 2) * PITCH + STREET / 2 + 0.5,
        z: (j - blocksPerSide / 2) * PITCH + STREET / 2 + 0.5,
      };
      // Dirt streets have lamps only at the market's corners; any street, only where streets meet.
      if (look.roads === "dirt" && Math.max(Math.abs(lamp.x - plaza.x), Math.abs(lamp.z - plaza.z)) > PITCH) continue;
      const meeting = [hasStreetX(j, i - 1), hasStreetX(j, i), hasStreetZ(i, j - 1), hasStreetZ(i, j)];
      if (meeting.filter(Boolean).length < 2) continue;
      lamps.push(lamp);
    }
  }
  const props = new Mesh(
    mergeOrEmpty(town.propPieces),
    new MeshLambertMaterial({ vertexColors: true, flatShading: true }),
  );
  const buildingMesh = new Mesh(
    mergeOrEmpty(town.buildingPieces),
    new MeshLambertMaterial({ vertexColors: true, flatShading: true }),
  );
  const natureMesh = new Mesh(
    mergeOrEmpty(town.naturePieces),
    new MeshLambertMaterial({ vertexColors: true, flatShading: true }),
  );
  return {
    country,
    mesh,
    props,
    buildingMesh,
    natureMesh,
    natureSlots: town.natureSlots,
    noticeboard: town.noticeboard,
    waypoints: town.waypoints,
    gardens: town.gardens,
    meadows: town.meadows,
    roads: groundMesh(town.roadPieces, ROAD_TILE),
    edges: blockEdges(town, ground),
    plaza: groundMesh(town.plazaPieces, PLAZA_TILE),
    buildings: town.buildings,
    propSlots: town.propSlots,
    boxes: town.boxes,
    circles: town.circles,
    lamps,
    doors: town.doors,
    seats: town.seats,
    spots: town.spots,
    camps: town.camps,
  };
}

const BRIDGE_WOOD = 0x7a5634;

/**
 * One continuous strip along `points`, lying on the ground (`lift` above `heightOf`): every point is
 * shared by the pieces either side of it and turned to the bend (mitred), so there are no gaps or
 * overlaps at corners. `columns` lay it out across: [{ at (−1 … 1 across `width`), colour, lift }],
 * so edges can fade into the grass. Texture coordinates match the ground's, so its grass texture lines
 * up across the join. `wobble` varies the width a little along the way, so edges aren't ruler-straight.
 */
function ribbon(points, width, { lift = 0, heightOf, columns, wobble = 0, fadeFrom = null, fadeTo = null }) {
  const dense = [];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const steps = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) / 1));
    for (let k = 0; k < steps; k++)
      dense.push({ x: a.x + ((b.x - a.x) * k) / steps, z: a.z + ((b.z - a.z) * k) / steps });
  }
  dense.push(points[points.length - 1]);
  let total = 0;
  for (let i = 1; i < dense.length; i++) total += Math.hypot(dense[i].x - dense[i - 1].x, dense[i].z - dense[i - 1].z);
  const positions = [];
  const colours = [];
  const uvs = [];
  const splats = []; // terrain layer weights per point, when the columns give them
  const splatsB = [];
  let travelled = 0;
  dense.forEach((point, i) => {
    const before = dense[Math.max(0, i - 1)];
    const after = dense[Math.min(dense.length - 1, i + 1)];
    const tx = after.x - before.x;
    const tz = after.z - before.z;
    const length = Math.hypot(tx, tz) || 1;
    if (i > 0) travelled += Math.hypot(point.x - before.x, point.z - before.z);
    const half = (width / 2) * (1 + wobble * (Math.sin(travelled * 0.45) * 0.6 + Math.sin(travelled * 1.3 + 2) * 0.4));
    for (const column of columns) {
      const x = point.x + (-tz / length) * half * column.at;
      const z = point.z + (tx / length) * half * column.at;
      positions.push(x, heightOf(x, z) + lift + (column.lift ?? 0), z);
      colours.push(column.colour.r, column.colour.g, column.colour.b);
      uvs.push((x + worldSize / 2) / worldSize, (worldSize / 2 - z) / worldSize);
      if (column.splat) {
        // `fadeFrom` / `fadeTo`: { length, splat, splatB }: over its first (last) metres the strip blends in
        // from (out to) these weights, so it doesn't start or end with a hard edge.
        const mix = (from, to, t) => to.map((value, i) => from[i] + (value - from[i]) * t);
        let weights = column.splat;
        let weightsB = column.splatB ?? [0, 0, 0, 0];
        const t = fadeFrom ? Math.min(1, travelled / fadeFrom.length) : 1;
        if (t < 1) [weights, weightsB] = [mix(fadeFrom.splat, weights, t), mix(fadeFrom.splatB, weightsB, t)];
        const end = fadeTo ? Math.min(1, (total - travelled) / fadeTo.length) : 1;
        if (end < 1) [weights, weightsB] = [mix(fadeTo.splat, weights, end), mix(fadeTo.splatB, weightsB, end)];
        splats.push(...weights);
        splatsB.push(...weightsB);
      }
    }
  });
  const across = columns.length;
  const index = [];
  for (let i = 1; i < dense.length; i++) {
    for (let c = 1; c < across; c++) {
      const a0 = (i - 1) * across + c - 1;
      const a1 = a0 + 1;
      const b0 = i * across + c - 1;
      const b1 = b0 + 1;
      index.push(a0, a1, b0, a1, b1, b0); // counter-clockwise from above, so it faces up
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new Float32BufferAttribute(colours, 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  if (splats.length) {
    geometry.setAttribute("splatA", new Float32BufferAttribute(splats, 4));
    geometry.setAttribute("splatB", new Float32BufferAttribute(splatsB, 4));
  }
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * The country round the town (land.js): inns and cottages with their doors, cave mouths in hillsides,
 * dirt roads out to them, the river's water and the bridges over it. Inns and cottages are ordinary
 * town buildings (so they get kit walls, doors, signs and collision like any other).
 */
/**
 * A wooden box with its texture laid in metres (`tile` metres to a repeat) and the grain along its
 * longest side, as beams and posts have it; `across` turns the top's grain the other way (deck planks
 * laid across a bridge).
 */
function woodBox(width, height, depth, x, y, z, { across = false, tile = 1.5 } = {}) {
  const geometry = new BoxGeometry(width, height, depth);
  const uv = geometry.getAttribute("uv");
  // BoxGeometry's faces, four corners each: ±x (depth by height), ±y (width by depth), ±z (width by height).
  const sides = [
    [depth, height],
    [depth, height],
    [width, depth],
    [width, depth],
    [width, height],
    [width, height],
  ];
  sides.forEach(([du, dv], face) => {
    // The texture's grain runs along v: put v along the longer side (or the shorter, for planks on top).
    const flip = du > dv !== (face === 2 && across);
    for (let corner = face * 4; corner < face * 4 + 4; corner++) {
      const u = uv.getX(corner);
      const v = uv.getY(corner);
      if (flip) uv.setXY(corner, (v * dv) / tile, (u * du) / tile);
      else uv.setXY(corner, (u * du) / tile, (v * dv) / tile);
    }
  });
  return geometry.translate(x, y, z);
}

function buildCountry(random, town, land, ground) {
  const meshes = [];
  const caves = [];
  const doorOf = new Map(); // outpost index → door index (its first, for a hamlet)
  const doorsOf = new Map(); // outpost index → every door index (a hamlet has several)
  const caveRock = [];
  const caveFloor = [];
  const seedOf = (outpost) => Math.round(outpost.x * 131 + outpost.z * 977) | 0;
  for (const outpost of land.outposts) {
    if (outpost.kind === "cave") {
      // One mass of rock with the entrance pushed into it (caves.js), set into the hill (land.js).
      const cave = caveGeometry(seedOf(outpost), { depth: CAVE_DEPTH, mouth: [CAVE_RADIUS, 3] });
      const place = (geometry) => geometry.rotateY(outpost.angle).translate(outpost.x, outpost.ground, outpost.z);
      caveRock.push(place(cave.rock));
      caveFloor.push(place(cave.floor));
      const toWorld = ({ x, z }) => ({
        x: outpost.x + x * Math.cos(outpost.angle) + z * Math.sin(outpost.angle),
        z: outpost.z - x * Math.sin(outpost.angle) + z * Math.cos(outpost.angle),
      });
      for (const collider of cave.colliders) town.circles.push({ ...toWorld(collider), r: collider.r });
      // Ferns, bushes and long grass along the foot of the rock face, and a few hanging over its top edge.
      const foot = ["fern-1", "grass-common-short", "grass-wispy-tall", "grass-common-tall", "plant-7", "fern-1"];
      for (let i = 0; i < 16; i++) {
        const side = i % 2 ? 1 : -1;
        const across = side * (CAVE_RADIUS + 1 + random() * 8);
        const at = toWorld({ x: across, z: 0.8 + random() * 1.4 - (across / 11) ** 2 * 4 });
        const model = foot[Math.floor(random() * foot.length)];
        placeKitPlant(town, null, {
          model,
          x: at.x,
          z: at.z,
          angle: random() * Math.PI * 2,
          scale: 0.55 + random() * 0.35,
        });
      }
      for (let i = 0; i < 6; i++) {
        const across = (random() * 2 - 1) * 6;
        const at = toWorld({ x: across, z: -0.8 - random() * 1.5 });
        const y = cave.top - heightAt(at.x, at.z) - 0.4;
        placeKitPlant(town, null, {
          model: random() < 0.5 ? "fern-1" : "grass-wispy-tall",
          x: at.x,
          z: at.z,
          y,
          angle: random() * 6.3,
          scale: 0.6 + random() * 0.3,
        });
      }
      const inside = toWorld(cave.use);
      caves.push({ x: inside.x, z: inside.z, angle: outpost.angle, mouth: inside, outpost: outpost.index });
      continue;
    }
    if (outpost.kind === "hamlet") {
      placeHamlet(random, town, outpost, doorOf, doorsOf);
      continue;
    }
    if (outpost.kind === "farm") {
      doorOf.set(outpost.index, town.doors.length);
      doorsOf.set(outpost.index, [town.doors.length]);
      placeFarm(random, town, outpost);
      continue;
    }
    if (outpost.kind === "mill") {
      doorOf.set(outpost.index, town.doors.length);
      doorsOf.set(outpost.index, [town.doors.length]);
    }
    if (LANDMARKS[outpost.kind]) {
      LANDMARKS[outpost.kind](random, town, outpost);
      dressPlace(town, outpost);
      continue;
    }
    const kind = outpost.kind === "inn" ? "tavern" : "home";
    const size = outpost.kind === "inn" ? { width: 10, depth: 8 } : { width: 6, depth: 6 };
    doorOf.set(outpost.index, town.doors.length);
    doorsOf.set(outpost.index, [town.doors.length]);
    placeBuilding(random, town, makeSpec(random, kind, size), outpost.x, outpost.z, outpost.facing);
    dressPlace(town, outpost, size);
  }
  if (caveRock.length) {
    meshes.push(new Mesh(mergeGeometries(caveRock), cliffMaterial(ground)));
    meshes.push(new Mesh(mergeGeometries(caveFloor), new MeshLambertMaterial({ vertexColors: true })));
  }
  // Dirt roads: in the ground's own material, dirt down the middle fading through trodden grass into the
  // meadow at the edges (the same grass texture as the ground, so the join doesn't show), drawn just over
  // the ground (polygon offset) so its facets never poke through.
  const plain = new Color(1, 1, 1);
  const roadColumns = [
    { at: -1.4, colour: plain, splat: [1, 0, 0, 0], lift: -0.04 },
    { at: -1, colour: plain, splat: [0.55, 0.45, 0, 0] },
    { at: -0.55, colour: plain, splat: [0, 1, 0, 0] },
    { at: 0.55, colour: plain, splat: [0, 1, 0, 0] },
    { at: 1, colour: plain, splat: [0.55, 0.45, 0, 0] },
    { at: 1.4, colour: plain, splat: [1, 0, 0, 0], lift: -0.04 },
  ];
  // Each road in stretches, broken where it crosses a bridge: the deck carries it over the water.
  const roads = [];
  for (const road of land.roads) {
    let stretch = [];
    const firstStretch = stretch;
    const GRASS = { length: 5, splat: [1, 0, 0, 0], splatB: [0, 0, 0, 0] };
    const finish = (last = false) => {
      if (stretch.length > 1) {
        roads.push(
          ribbon(stretch, road.width, {
            lift: 0.06,
            heightOf: land.groundAt,
            columns: roadColumns,
            wobble: 0.12,
            // Leaving town, the road starts as the street's cobbles and turns to dirt over a few metres.
            fadeFrom:
              stretch === firstStretch && road.fromTown !== false && look.roads === "cobble"
                ? { length: 4, splat: [0, 0, 0, 0], splatB: [0, 1, 0, 0] }
                : stretch === firstStretch && road.between
                  ? GRASS // a road between two hamlets starts on one's green
                  : null,
            // And it wears away into the grass where it arrives, instead of stopping square.
            fadeTo: last ? GRASS : null,
          }),
        );
      }
      stretch = [];
    };
    for (let i = 0; i < road.points.length; i++) {
      const a = road.points[i];
      const b = road.points[i + 1] ?? a;
      // Finer steps than the road's own points, so the break lands right at the bridge's ends.
      const steps = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) / 0.5));
      for (let k = 0; k < (i + 1 < road.points.length ? steps : 1); k++) {
        const point = { x: a.x + ((b.x - a.x) * k) / steps, z: a.z + ((b.z - a.z) * k) / steps };
        if (land.onBridge(point.x, point.z, 0.3)) finish();
        else stretch.push(point);
      }
    }
    finish(true);
  }
  for (const track of town.gateTracks) {
    roads.push(
      ribbon(track, 3.2, {
        lift: 0.06,
        heightOf: land.groundAt,
        columns: roadColumns,
        wobble: 0.12,
        fadeFrom: look.roads === "cobble" ? { length: 3, splat: [0, 0, 0, 0], splatB: [0, 1, 0, 0] } : null,
        fadeTo: { length: 9, splat: [1, 0, 0, 0], splatB: [0, 0, 0, 0] },
      }),
    );
  }
  if (roads.length) {
    meshes.push(
      new Mesh(
        mergeGeometries(roads),
        // Over the town's edge strip (−3), so the road reads on top where it leaves the street.
        terrainMaterial(ground, { polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }),
      ),
    );
  }
  const waters = [];
  // The water: deeper blue down the middle, lighter and clearer at the banks, with a soft sheen.
  const deep = new Color(0x3f7499);
  const shallow = new Color(0x6fa5b8);
  for (const pond of land.ponds()) {
    // A pond's water: a disc deep in the middle, clear at its edge (which runs under the shore).
    const positions = [];
    const colours = [];
    const uvs = [];
    const ring = 28;
    const point = (x, z, colour) => {
      positions.push(x, land.waterLevel, z);
      colours.push(colour.r, colour.g, colour.b);
      uvs.push((x + worldSize / 2) / worldSize, (worldSize / 2 - z) / worldSize);
    };
    for (let i = 0; i < ring; i++) {
      const [a, b] = [(i / ring) * Math.PI * 2, ((i + 1) / ring) * Math.PI * 2];
      const r = pond.r + 1.5;
      point(pond.x, pond.z, deep); // counter-clockwise from above, so it faces up
      point(pond.x + Math.sin(a) * r, pond.z + Math.cos(a) * r, shallow);
      point(pond.x + Math.sin(b) * r, pond.z + Math.cos(b) * r, shallow);
    }
    const disc = new BufferGeometry();
    disc.setAttribute("position", new Float32BufferAttribute(positions, 3));
    disc.setAttribute("color", new Float32BufferAttribute(colours, 3));
    disc.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
    disc.computeVertexNormals();
    waters.push(disc);
  }
  if (waters.length) meshes.push(new Mesh(mergeGeometries(waters), waterMaterial(ground)));
  if (land.river) {
    // Out to the top of each bank, so the water always meets the slope (its edges run under the ground).
    const water = ribbon(land.river.points, land.river.width + land.river.bank * 2, {
      heightOf: () => land.waterLevel,
      columns: [
        { at: -1, colour: shallow },
        { at: -0.25, colour: deep },
        { at: 0.25, colour: deep },
        { at: 1, colour: shallow },
      ],
      wobble: 0.06,
    });
    meshes.push(new Mesh(water, waterMaterial(ground)));
  }
  // Bridges: a plank deck (the planks run across it) on rails and posts of beams, textured in metres.
  const planks = [];
  const beams = [];
  for (const bridge of land.bridges) {
    const [ax, az] = bridge.along;
    const angle = Math.atan2(ax, az);
    const half = land.bridgeHalfWidth;
    const place = (geometry) => geometry.rotateY(angle).translate(bridge.x, bridge.deck, bridge.z);
    planks.push(place(woodBox(half * 2 + 0.2, 0.25, bridge.length, 0, -0.12, 0, { across: true, tile: 2 })));
    beams.push(
      place(woodBox(0.12, 0.12, bridge.length, -half, 0.85, 0)),
      place(woodBox(0.12, 0.12, bridge.length, half, 0.85, 0)),
      // stringers under the deck, so its edge isn't a bare slab
      place(woodBox(0.22, 0.3, bridge.length + 0.2, -half + 0.1, -0.3, 0)),
      place(woodBox(0.22, 0.3, bridge.length + 0.2, half - 0.1, -0.3, 0)),
    );
    for (let t = -bridge.length / 2; t <= bridge.length / 2 + 0.01; t += bridge.length / 4) {
      beams.push(place(woodBox(0.16, 0.95, 0.16, -half, 0.45, t)), place(woodBox(0.16, 0.95, 0.16, half, 0.45, t)));
    }
    // Piers down to the riverbed wherever the deck stands well above the ground, with a crossbeam.
    for (let t = -bridge.length / 2 + 2.5; t <= bridge.length / 2 - 2.5; t += 2.5) {
      const below = Math.min(
        ...[-1, 1].map((side) => {
          const x = bridge.x + ax * t + az * side * (half - 0.1);
          const z = bridge.z + az * t - ax * side * (half - 0.1);
          return land.groundAt(x, z);
        }),
      );
      const drop = bridge.deck - below;
      if (drop < 0.8) continue;
      const tall = drop + 0.2; // a little into the bed
      for (const side of [-1, 1]) beams.push(place(woodBox(0.26, tall, 0.26, side * (half - 0.1), -tall / 2, t)));
      beams.push(place(woodBox(half * 2, 0.2, 0.22, 0, -0.55, t)));
    }
  }
  const wood = { planks: null, beams: null };
  for (const [name, parts] of [
    ["planks", planks],
    ["beams", beams],
  ]) {
    if (!parts.length) continue;
    wood[name] = new MeshLambertMaterial({ color: BRIDGE_WOOD });
    meshes.push(new Mesh(mergeGeometries(parts), wood[name]));
  }
  return { meshes, caves, doorOf, doorsOf, wood };
}

/**
 * The town's kerbs, sidewalks and its edge into the meadow, as strips in the ground's material: kerbs a
 * low raised stone edge, sidewalks setts that fade into the grass on the lawn side, and the outermost
 * streets' cobbles fading into the meadow beyond the town.
 */
function blockEdges(town, ground) {
  const flat = (lift) => (x, z) => heightAt(x, z) + lift;
  const white = new Color(1, 1, 1);
  const kerbColumns = [
    { at: -1, colour: white, splat: [0, 0, 0, 0], splatB: [0, 0, 0, 1], lift: -0.06 },
    { at: -0.7, colour: white, splat: [0, 0, 0, 0], splatB: [0, 0, 0, 1], lift: 0.04 },
    { at: 0.7, colour: white, splat: [0, 0, 0, 0], splatB: [0, 0, 0, 1], lift: 0.04 },
    { at: 1, colour: white, splat: [0, 0, 0, 0], splatB: [0, 0, 0, 1], lift: 0 },
  ];
  const walkColumns = [
    { at: -1, colour: white, splat: [0, 0, 0, 0], splatB: [0, 0, 1, 0] },
    { at: 0.55, colour: white, splat: [0, 0, 0, 0], splatB: [0, 0, 1, 0] },
    { at: 1, colour: white, splat: [0.45, 0, 0, 0], splatB: [0, 0, 0.55, 0], lift: -0.015 },
    { at: 1.7, colour: white, splat: [1, 0, 0, 0], splatB: [0, 0, 0, 0], lift: -0.045 },
  ];
  const pieces = [
    ...town.kerbs.map((loop) => ribbon(loop, 0.26, { heightOf: flat(0.1), columns: kerbColumns })),
    ...town.sidewalks.map((loop) => ribbon(loop, SIDEWALK, { heightOf: flat(0.075), columns: walkColumns })),
  ];
  // Round the outside of the town, the outermost streets' cobbles fade into the meadow.
  const outside = (blocksPerSide * PITCH) / 2 + STREET / 2;
  const edgeLoop = roundedLoop(0, 0, outside + 0.9, 0, 3);
  if (!blocks)
    pieces.push(
      ribbon(edgeLoop, 1.8, {
        heightOf: flat(0.04),
        columns: [
          { at: -1, colour: white, splat: [1, 0, 0, 0], splatB: [0, 0, 0, 0], lift: -0.03 },
          look.roads === "dirt"
            ? { at: -0.2, colour: white, splat: [0.5, 0.5, 0, 0], splatB: [0, 0, 0, 0] }
            : { at: -0.2, colour: white, splat: [0.5, 0, 0, 0], splatB: [0, 0.5, 0, 0] },
          look.roads === "dirt"
            ? { at: 1, colour: white, splat: [0, 1, 0, 0], splatB: [0, 0, 0, 0] }
            : { at: 1, colour: white, splat: [0, 0, 0, 0], splatB: [0, 1, 0, 0] },
        ],
      }),
    );
  return new Mesh(
    mergeOrEmpty(pieces), // dirt streets in a crossroads or a ring: no kerbs, sidewalks or edge
    terrainMaterial(ground, { polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }),
  );
}

const SOFT_EDGE = 0.9; // metres a dirt street fades into the grass, each way from its edge

/**
 * A flat piece of street, `width` by `depth` at (x, y, z). Cobbles end at their kerb; a dirt street is a
 * path: its rim fades out over the grass (alpha in its colours, 0 round the outside), so no edge is sharp.
 */
function streetPiece(width, depth, x, y, z) {
  if (look.roads !== "dirt")
    return painted(new PlaneGeometry(width, depth).rotateX(-Math.PI / 2).translate(x, y, z), ROAD);
  const geometry = new PlaneGeometry(1, 1, 3, 3).rotateX(-Math.PI / 2);
  const across = (size) => [-size / 2 - SOFT_EDGE, -size / 2 + SOFT_EDGE, size / 2 - SOFT_EDGE, size / 2 + SOFT_EDGE];
  const xs = across(width);
  const zs = across(depth);
  const position = geometry.attributes.position;
  const colour = new Color(ROAD);
  const colours = new Float32Array(position.count * 4);
  for (let i = 0; i < position.count; i++) {
    const column = i % 4;
    const row = Math.floor(i / 4);
    position.setXYZ(i, x + xs[column], y, z + zs[row]);
    const rim = column === 0 || column === 3 || row === 0 || row === 3;
    colours.set([colour.r, colour.g, colour.b, rim ? 0 : 1], i * 4);
  }
  geometry.setAttribute("color", new Float32BufferAttribute(colours, 4));
  return geometry;
}

/** Flat pieces (roads, paving) merged into one mesh, with texture coordinates in metres / `tile`. */
/** Pieces merged into one geometry, or an empty one when there are none (a sparse hamlet). */
function mergeOrEmpty(pieces) {
  return pieces.length ? mergeGeometries(pieces) : new BufferGeometry();
}

function groundMesh(pieces, tile) {
  // None (a market that isn't paved): an empty mesh, so the rest of the town needn't ask.
  if (!pieces.length) return new Mesh(new BufferGeometry(), new MeshLambertMaterial({ vertexColors: true }));
  const geometry = mergeGeometries(pieces);
  const position = geometry.attributes.position;
  const uv = new Float32Array(position.count * 2);
  for (let i = 0; i < position.count; i++) {
    uv[i * 2] = position.getX(i) / tile;
    uv[i * 2 + 1] = position.getZ(i) / tile;
  }
  geometry.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  // Colours with alpha (dirt streets, fading at the rim): drawn over the grass without hiding it.
  const soft = geometry.attributes.color?.itemSize === 4;
  return new Mesh(geometry, new MeshLambertMaterial({ vertexColors: true, transparent: soft, depthWrite: !soft }));
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

/**
 * The ground's layers: how many metres one repeat of each texture covers, and the colour it shows until
 * (or without) its texture. Grass, dirt, rock, sand (riverbeds) and snow, blended per point by weights.
 */
const GROUND_LAYERS = {
  grass: { scale: 7, colour: 0x6f9244 },
  dirt: { scale: 4.5, colour: 0x8f7350 },
  rock: { scale: 9, colour: 0x857d72 },
  sand: { scale: 5, colour: 0xa58d6c },
  snow: { scale: 12, colour: 0xe4e9ee },
  cobbles: { scale: 4, colour: 0x8a8278 },
  setts: { scale: 3, colour: 0xa49a8c },
  plaza: { scale: 3.2, colour: 0xcbb99a },
  forest: { scale: 6, colour: 0x4f3e2a },
};

/** A 1 × 1 texture of one colour: a layer's stand-in until its painted texture loads. */
function flatTexture(hex) {
  const colour = new Color(hex);
  const data = new Uint8Array([
    Math.round(colour.r * 255),
    Math.round(colour.g * 255),
    Math.round(colour.b * 255),
    255,
  ]);
  const texture = new DataTexture(data, 1, 1);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/** The uniforms every terrain material of a world shares, so giving a layer its texture changes them all. */
function terrainUniforms() {
  const uniforms = {
    tMacro: { value: grassTexture(rng(7)) },
    tWater: { value: flatTexture(0x7fb0bd) },
    tCliff: { value: flatTexture(0xa39b8f) },
    uTime: { value: 0 },
  };
  for (const [name, layer] of Object.entries(GROUND_LAYERS)) {
    uniforms[`t${name}`] = { value: flatTexture(layer.colour) };
    uniforms[`s${name}`] = { value: layer.scale };
  }
  uniforms.uWinter = { value: 0 }; // how far the grass and forest floor lie under snow (a season)
  return uniforms;
}

/**
 * The ground's material: each point blends grass, dirt, rock, sand and snow by its weights (the
 * `splatA` (grass, dirt, rock, sand), `splatB` (snow, cobbles, setts, plaza slabs) and `splatC` (forest
 * floor) attributes), every texture laid out in world
 * metres and sampled twice at different sizes so its repeats don't show, under large soft light and dark
 * patches. The vertex colour adds a little brightness per facet, keeping the low-poly look.
 */
function terrainMaterial(uniforms, options = {}) {
  const material = new MeshLambertMaterial({ vertexColors: true, ...options });
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
attribute vec4 splatA;
attribute vec4 splatB;
attribute vec4 splatC;
varying vec4 vSplatA;
varying vec4 vSplatB;
varying vec4 vSplatC;
varying vec2 vGround;`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
vSplatA = splatA;
vSplatB = splatB;
vSplatC = splatC;
vGround = (modelMatrix * vec4(transformed, 1.0)).xz;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
uniform sampler2D tMacro, tgrass, tdirt, trock, tsand, tsnow, tcobbles, tsetts, tplaza, tforest;
uniform float sgrass, sdirt, srock, ssand, ssnow, scobbles, ssetts, splaza, sforest;
uniform float uWinter;
varying vec4 vSplatA;
varying vec4 vSplatB;
varying vec4 vSplatC;
varying vec2 vGround;
vec3 groundLayer(sampler2D map, float scale) {
  vec2 uv = vGround / scale;
  vec3 near = texture2D(map, uv).rgb;
  // The same texture, larger and turned, mixed in: the eye can't find one repeat to follow.
  vec2 far = mat2(0.8, -0.6, 0.6, 0.8) * uv * 0.31 + vec2(0.37, 0.71);
  return mix(near, texture2D(map, far).rgb, 0.4);
}`,
      )
      .replace(
        "#include <map_fragment>",
        `{
  float total = max(0.0001, dot(vSplatA, vec4(1.0)) + dot(vSplatB, vec4(1.0)) + vSplatC.x);
  vec3 ground = (groundLayer(tgrass, sgrass) * vSplatA.x * (1.0 - uWinter) + groundLayer(tdirt, sdirt) * vSplatA.y
    + groundLayer(trock, srock) * vSplatA.z + groundLayer(tsand, ssand) * vSplatA.w
    + groundLayer(tsnow, ssnow) * (vSplatB.x + uWinter * (vSplatA.x + vSplatC.x)) + groundLayer(tcobbles, scobbles) * vSplatB.y
    + groundLayer(tsetts, ssetts) * vSplatB.z + groundLayer(tplaza, splaza) * vSplatB.w
    + groundLayer(tforest, sforest) * vSplatC.x * (1.0 - uWinter)) / total;
  float patches = texture2D(tMacro, vGround / 52.0).r;
  diffuseColor.rgb *= ground * (0.78 + patches * 0.3);
}`,
      );
  };
  material.customProgramCacheKey = () => "wanderworld-terrain";
  return material;
}

/**
 * The river's material: the painted water texture (`tWater`) sampled twice, the two drifting slowly in
 * different directions and sizes (`uTime`), so the ripples move and never visibly repeat; tinted deep in
 * the middle and lighter at the banks by the vertex colour, with a soft sheen.
 */
function waterMaterial(uniforms) {
  const material = new MeshPhongMaterial({
    vertexColors: true,
    specular: 0x9fc3d6,
    shininess: 70,
    transparent: true,
    opacity: 0.88,
    depthWrite: false,
  });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.tWater = uniforms.tWater;
    shader.uniforms.uTime = uniforms.uTime;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec2 vWater;")
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvWater = (modelMatrix * vec4(transformed, 1.0)).xz;",
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nuniform sampler2D tWater;\nuniform float uTime;\nvarying vec2 vWater;",
      )
      .replace(
        "#include <map_fragment>",
        `{
  vec3 a = texture2D(tWater, vWater / 6.0 + uTime * vec2(0.021, 0.034)).rgb;
  vec3 b = texture2D(tWater, mat2(0.8, -0.6, 0.6, 0.8) * vWater / 9.5 - uTime * vec2(0.029, 0.012)).rgb;
  diffuseColor.rgb *= (a + b) * 0.85;
}`,
      );
  };
  material.customProgramCacheKey = () => "wanderworld-water";
  return material;
}

/**
 * Rock faces (caves): the painted cliff texture (`tCliff`) wrapped on from three sides by the surface's
 * direction (triplanar), so a vertical face shows it as well as a ledge does, with no stretching; the
 * vertex colours still put moss on top and darkness deep inside.
 */
function cliffMaterial(uniforms, { texture = "tCliff", vertexColors = true, scale = 5.5, boost = 1.85 } = {}) {
  const material = new MeshLambertMaterial({ vertexColors });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.tCliff = uniforms[texture];
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
varying vec3 vCliffPos;
varying vec3 vCliffNormal;`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
#ifdef USE_INSTANCING
vCliffPos = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;
vCliffNormal = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * objectNormal);
#else
vCliffPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
vCliffNormal = normalize(mat3(modelMatrix) * objectNormal);
#endif`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
uniform sampler2D tCliff;
varying vec3 vCliffPos;
varying vec3 vCliffNormal;`,
      )
      .replace(
        "#include <map_fragment>",
        `{
  vec3 w = pow(abs(normalize(vCliffNormal)), vec3(4.0));
  w /= (w.x + w.y + w.z);
  vec3 p = vCliffPos / ${scale.toFixed(2)};
  vec3 rock = texture2D(tCliff, p.zy).rgb * w.x + texture2D(tCliff, p.xz).rgb * w.y + texture2D(tCliff, p.xy).rgb * w.z;
  diffuseColor.rgb *= rock * ${boost.toFixed(2)};
}`,
      );
  };
  material.customProgramCacheKey = () => `wanderworld-cliff-${texture}-${vertexColors}-${scale}-${boost}`;
  return material;
}

/** Layer weights at a point of the land from its height and how steep it is there: [grass, dirt, rock, sand, snow]. */
function groundWeights(y, steep, fromRiver = Infinity) {
  const smooth = (t) => {
    const c = Math.max(0, Math.min(1, t));
    return c * c * (3 - 2 * c);
  };
  const snow = smooth((y - 27) / 6);
  const rock = Math.max(smooth((y - 10) / 8), smooth((steep - 1.1) / 0.9)) * (1 - snow);
  // Sand and mud only in the river's bed and on its banks, not in every hollow of the hills.
  const sand = smooth((3.5 - fromRiver) / 2) * (1 - rock);
  const grass = Math.max(0, 1 - rock - sand - snow);
  return [grass, 0, rock, sand, snow];
}

/** The trees near each 6 m cell, for forest floor (the usual density's trees, so it's the same at any). */
function forestGrid(trees) {
  const grid = new Map();
  for (const tree of trees) {
    const key = `${Math.floor(tree.x / 6)},${Math.floor(tree.z / 6)}`;
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key).push(tree);
  }
  return grid;
}

/**
 * Leaves and needles under the trees at (x, z), 0…1: where trees stand close together the grass gives
 * way to forest floor, fading out into clearings.
 */
function forestCover(grid, x, z) {
  const cx = Math.floor(x / 6);
  const cz = Math.floor(z / 6);
  let cover = 0;
  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      for (const tree of grid.get(`${cx + dx},${cz + dz}`) ?? []) {
        const distance = Math.hypot(tree.x - x, tree.z - z);
        if (distance < 6.5) cover += 1 - distance / 6.5;
      }
    }
  }
  const thick = Math.min(1, Math.max(0, (cover - 0.75) / 1.4));
  return thick * thick * (3 - 2 * thick) * 0.85; // a little grass always shows through
}

const CHUNK = 80; // metres: the ground is built in squares this size
const FINE_CELL = 2; // near the player
const COARSE_CELL = 8; // everywhere else (the fog hides the difference)
const FINE_NEAR = 115; // a chunk's middle this close: its fine ground is built and shown
const FINE_FAR = 175; // further than this: its fine ground is let go
const SKIRT = 2.5; // metres the edges hang down, so no cracks show where fine and coarse chunks meet

/** A little brightness per facet (the low-poly look), the same wherever the facet is built. */
const facetShade = (x, z) => {
  const value = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
  return 1.02 + (value - Math.floor(value)) * 0.12;
};

/**
 * One square of ground at (x0, z0), `CHUNK` metres a side in cells of `cell` metres: its layers by
 * height and slope (grass gives way to rock on steep slopes and high up, snow on the peaks, sand by the
 * river, forest floor under trees), and a skirt round its edges.
 */
function groundChunk(x0, z0, cell, material, forest) {
  const cells = Math.round(CHUNK / cell);
  // Heights one cell past each edge too, for each point's slope.
  const side = cells + 3;
  const heights = [];
  for (let j = -1; j <= cells + 1; j++) {
    for (let i = -1; i <= cells + 1; i++) heights.push(land.groundAt(x0 + i * cell, z0 + j * cell)); // under bridges too
  }
  const height = (i, j) => heights[(j + 1) * side + i + 1];
  // How steep the ground is at each point (its slope over its neighbours, as the height a 2.6 m stretch
  // would climb), so rock blends in smoothly across the triangles instead of painting whole ones.
  const at = (i, j) => {
    const slope = Math.hypot(height(i + 1, j) - height(i - 1, j), height(i, j + 1) - height(i, j - 1)) / (2 * cell);
    return { x: x0 + i * cell, y: height(i, j), z: z0 + j * cell, steep: slope * 2.6 };
  };
  const positions = [];
  const colours = [];
  const splatA = [];
  const splatB = [];
  const splatC = [];
  const vertex = (point, shade, drop) => {
    const steep = point.steep;
    positions.push(point.x, point.y - drop, point.z);
    colours.push(shade, shade, shade);
    const [grass, dirt, rock, sand, snow] = groundWeights(point.y, steep, land.toRiverBank(point.x, point.z));
    const floor = grass * forestCover(forest, point.x, point.z);
    splatA.push(grass - floor, dirt, rock, sand);
    splatB.push(snow, 0, 0, 0);
    splatC.push(floor, 0, 0, 0);
  };
  const triangle = (a, b, c, drop = [0, 0, 0]) => {
    const shade = facetShade((a.x + b.x + c.x) / 3, (a.z + b.z + c.z) / 3);
    vertex(a, shade, drop[0]);
    vertex(b, shade, drop[1]);
    vertex(c, shade, drop[2]);
  };
  for (let j = 0; j < cells; j++) {
    for (let i = 0; i < cells; i++) {
      const p00 = at(i, j);
      const p10 = at(i + 1, j);
      const p01 = at(i, j + 1);
      const p11 = at(i + 1, j + 1);
      triangle(p00, p01, p10);
      triangle(p10, p01, p11);
    }
  }
  // The skirt: each edge hangs down a little, seen from both sides.
  const edges = [];
  for (let k = 0; k < cells; k++) {
    edges.push([at(k, 0), at(k + 1, 0)], [at(k, cells), at(k + 1, cells)]);
    edges.push([at(0, k), at(0, k + 1)], [at(cells, k), at(cells, k + 1)]);
  }
  for (const [a, b] of edges) {
    triangle(a, b, a, [0, 0, SKIRT]);
    triangle(b, b, a, [0, SKIRT, SKIRT]);
    triangle(b, a, a, [0, 0, SKIRT]);
    triangle(b, a, b, [0, SKIRT, SKIRT]);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new Float32BufferAttribute(colours, 3));
  geometry.setAttribute("splatA", new Float32BufferAttribute(splatA, 4));
  geometry.setAttribute("splatB", new Float32BufferAttribute(splatB, 4));
  geometry.setAttribute("splatC", new Float32BufferAttribute(splatC, 4));
  geometry.computeVertexNormals();
  const mesh = new Mesh(geometry, material);
  mesh.userData.ground = true;
  return mesh;
}

/**
 * The whole ground in 80 m chunks: coarse everywhere from the start, fine near the player (built as
 * they come near, let go as they leave). Returns { follow(x, z) }.
 */
function createGround(scene, uniforms, forest) {
  const material = terrainMaterial(uniforms, { flatShading: true });
  // The land goes on past the world's edge (two chunks of it, into the fog), so walking up to the edge
  // shows country beyond instead of the ground ending in a drop to the sky.
  const half = worldSize / 2 + CHUNK * 2;
  const chunks = [];
  for (let z0 = -half; z0 < half; z0 += CHUNK) {
    for (let x0 = -half; x0 < half; x0 += CHUNK) {
      const coarse = groundChunk(x0, z0, COARSE_CELL, material, forest);
      scene.add(coarse);
      chunks.push({ x0, z0, coarse, fine: null });
    }
  }
  let lastX = Infinity;
  let lastZ = Infinity;
  return {
    follow(x, z) {
      if ((x - lastX) ** 2 + (z - lastZ) ** 2 < 16) return; // every 4 m
      lastX = x;
      lastZ = z;
      for (const chunk of chunks) {
        const distance = Math.hypot(chunk.x0 + CHUNK / 2 - x, chunk.z0 + CHUNK / 2 - z);
        if (!chunk.fine && distance < FINE_NEAR) {
          chunk.fine = groundChunk(chunk.x0, chunk.z0, FINE_CELL, material, forest);
          scene.add(chunk.fine);
        } else if (chunk.fine && distance > FINE_FAR) {
          scene.remove(chunk.fine);
          chunk.fine.geometry.dispose();
          chunk.fine = null;
        }
        chunk.coarse.visible = !chunk.fine;
      }
    },
  };
}

/** Random points across the ground outside town. */
function scatter(random, count, scaleMin, scaleRange) {
  const points = [];
  const half = worldSize / 2 - 2;
  while (points.length < count) {
    const x = (random() * 2 - 1) * half;
    const z = (random() * 2 - 1) * half;
    if (inTown(x, z) || land?.clear(x, z, 1) || inGateLane(x, z) || heightAt(x, z) > 26) continue;
    points.push({ x, z, scale: scaleMin + random() * scaleRange, turn: random() * Math.PI * 2, tint: random() });
  }
  return points;
}

/**
 * Each street: a strip for every unbroken run of blocks it's laid along, on each grid line in each
 * direction, with an id that stays the same (a second run on a line, past a gap, gets "-2"). Open ground
 * is no street, and neither is a run of one block: the short way through between two houses of a
 * crossroads' arm has no name of its own.
 */
function streetStrips() {
  const strips = [];
  const runs = (test) => {
    const found = [];
    let from = null;
    for (let a = 0; a <= blocksPerSide; a++) {
      const laid = a < blocksPerSide && test(a);
      if (laid && from === null) from = a;
      if (laid || from === null) continue;
      if (a - from >= 2)
        found.push({
          min: (from - blocksPerSide / 2) * PITCH - STREET / 2,
          max: (a - blocksPerSide / 2) * PITCH + STREET / 2,
        });
      from = null;
    }
    return found;
  };
  const suffix = (n) => (n ? `-${n + 1}` : "");
  for (let i = 0; i <= blocksPerSide; i++) {
    const line = (i - blocksPerSide / 2) * PITCH;
    // The street with its sidewalks and doorsteps: someone at a front door is on the street.
    const across = { min: line - STREET / 2 - 2.5, max: line + STREET / 2 + 2.5 };
    runs((a) => hasStreetX(i, a)).forEach((run, n) =>
      strips.push({
        id: `street:x${i}${suffix(n)}`,
        box: { minX: run.min, maxX: run.max, minZ: across.min, maxZ: across.max },
      }),
    );
    runs((b) => hasStreetZ(i, b)).forEach((run, n) =>
      strips.push({
        id: `street:z${i}${suffix(n)}`,
        box: { minX: across.min, maxX: across.max, minZ: run.min, maxZ: run.max },
      }),
    );
  }
  return strips;
}

function streetWaypoints() {
  const points = [];
  const lines = [];
  for (let i = 0; i <= blocksPerSide; i++) lines.push((i - blocksPerSide / 2) * PITCH);
  // Crossings and the middle of each block's street, where those streets are laid.
  lines.forEach((a, k) => {
    for (let j = 0; j < lines.length; j++) {
      const onStreet = hasStreetX(j, k - 1) || hasStreetX(j, k) || hasStreetZ(k, j - 1) || hasStreetZ(k, j);
      if (onStreet) points.push({ x: a, z: lines[j] });
      // Open ground has no streets, but people still cross it: where the lines between its blocks
      // meet (houses stand inside the blocks), clear of the pond.
      else if (
        blocks &&
        k > 0 &&
        j > 0 &&
        k < lines.length - 1 &&
        j < lines.length - 1 &&
        !(openPlan.pond && Math.hypot(a - openPlan.pond.x, lines[j] - openPlan.pond.z) < 14)
      )
        points.push({ x: a, z: lines[j] });
      if (j < lines.length - 1) {
        const middle = (lines[j] + lines[j + 1]) / 2;
        if (hasStreetZ(k, j)) points.push({ x: a, z: middle });
        if (hasStreetX(k, j)) points.push({ x: middle, z: a });
      }
    }
  });
  return points;
}

/**
 * Builds the scene for one seed. Instanced meshes are allocated at the highest density once;
 * changing density only changes how many instances are drawn.
 */
/** What a map needs (map.js): the land as built with the settlement in use now (useSettlement). */
function mapInfo(built) {
  const blocksBuilt = [];
  const centre = (i) => (i - (blocksPerSide - 1) / 2) * PITCH;
  for (let a = 0; a < blocksPerSide; a++) {
    for (let b = 0; b < blocksPerSide; b++) {
      if (hasBlock(a, b)) blocksBuilt.push({ x: centre(a), z: centre(b), market: a === plaza.i && b === plaza.j });
    }
  }
  return {
    half: worldSize / 2,
    groundAt: built.groundAt,
    waterLevel: built.waterLevel,
    toRiverBank: built.toRiverBank,
    roads: built.roads.map((road) => ({ points: road.points })),
    outposts: built.outposts.map((outpost) => ({
      kind: outpost.kind,
      x: outpost.x,
      z: outpost.z,
      index: outpost.index,
    })),
    town: {
      // Houses off the streets, on ground the layout leaves open.
      houses: openPlan.lots.flatMap((lot) => lot.houses ?? []).map((house) => ({ x: house.x, z: house.z })),
      blocks: blocksBuilt,
      block: BLOCK,
      street: STREET,
      roads: look.roads,
      walls: look.walls ? wallLine() : null,
    },
  };
}

/**
 * The map of a world that isn't built (New world's preview, Regenerate's): its land and settlement from
 * `seed`, `landscape` and `size`, without touching the world being played.
 */
export function previewMap(seed, landscape, size = "normal") {
  const saved = { worldSize, look, blocksPerSide, townHalf, streetLines, plaza, blocks, gateLanes, openPlan };
  try {
    worldSize = WORLD_SIZES[size] ?? WORLD_SIZE;
    const checked = checkLandscape(landscape, seed);
    useSettlement(checked.settlement, seed);
    return mapInfo(
      createLand(checked, seed, { townHalf, worldHalf: worldSize / 2, streetLines, townPond: openPlan.pond }),
    );
  } finally {
    ({ worldSize, look, blocksPerSide, townHalf, streetLines, plaza, blocks, gateLanes, openPlan } = saved);
  }
}

export function createWorld(seed, landscape = null, needs = {}, size = "normal") {
  const random = rng(seed);
  worldSize = WORLD_SIZES[size] ?? WORLD_SIZE;
  // Trees and rocks grow with the area: a bigger world is as wooded as a Normal one.
  const areaScale = (worldSize / WORLD_SIZE) ** 2;
  const baseTrees = Math.round(BASE_TREES * areaScale);
  const baseRocks = Math.round(BASE_ROCKS * areaScale);
  const checked = checkLandscape(landscape, seed);
  useSettlement(checked.settlement, seed);
  const spawn = { x: plaza.x, z: plaza.z + (look.market === "square" ? FOUNTAIN_RADIUS + 4 : 4) };
  land = createLand(checked, seed, {
    townHalf: townHalf,
    worldHalf: worldSize / 2,
    streetLines,
    townPond: openPlan.pond,
  });
  const scene = new Scene();
  scene.background = new Color(SKY);
  scene.fog = new Fog(SKY, 60, 170);
  const sky = new HemisphereLight(0xe8f4ff, 0x4a5a3a, 1.6);
  scene.add(sky);
  const sun = new DirectionalLight(0xfff1d6, 1.8);
  sun.position.set(40, 80, 25);
  scene.add(sun);

  const ground = terrainUniforms();
  const town = buildTown(random, land, ground, needs ?? {}, seed);
  const { country } = town;
  scene.add(
    town.mesh,
    town.props,
    town.buildingMesh,
    town.natureMesh,
    town.roads,
    town.edges,
    town.plaza,
    ...country.meshes,
  );

  // Where nothing wild grows: in a campsite's clearing, and in or right against anything built or set
  // down (a cottage, a ruin's stones, a fence). `pad`: how much room to leave, in metres.
  const builtOver = (x, z, pad) =>
    town.camps.some((camp) => Math.hypot(camp.x - x, camp.z - z) < CAMP_CLEARING + pad) ||
    town.boxes.some((b) => x > b.minX - pad && x < b.maxX + pad && z > b.minZ - pad && z < b.maxZ + pad) ||
    town.circles.some((circle) => Math.hypot(circle.x - x, circle.z - z) < circle.r + pad);
  // (Scattered first and taken out after, so every other tree and rock stays where its world has it.)
  const trees = scatter(random, baseTrees * MAX_DENSITY, 1.6, 1.6).filter((tree) => !builtOver(tree.x, tree.z, 1.2));
  const rocks = scatter(random, baseRocks * MAX_DENSITY, 0.8, 1.4).filter((rock) => !builtOver(rock.x, rock.z, 0.9));
  // The ground, in chunks: coarse everywhere, fine near the player (forest floor under the usual trees).
  const terrain = createGround(scene, ground, forestGrid(trees.slice(0, baseTrees)));
  terrain.follow(spawn.x, spawn.z);

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
  // Lamp posts with lanterns that light up at night, and the fountain on the square (fixtures.js).
  const lamps = createLamps(town.lamps);
  // Rain, snow or mist round the player (weather.js), easing in and out.
  const weather = createWeather();
  scene.add(weather.group);
  const sky_ = { kind: "clear", target: "clear", amount: 0, x: spawn.x, z: spawn.z, distance: 170 };
  // Each campsite's fire: a flame that flickers, a light that comes up as the day goes, and its smoke.
  const fires = town.camps.map((camp) => {
    const flame = new Mesh(
      new ConeGeometry(0.2, 0.6, 6).translate(0, 0.3, 0),
      new MeshBasicMaterial({ color: 0xff8a1e }),
    );
    const heart = new Mesh(
      new ConeGeometry(0.11, 0.38, 5).translate(0, 0.19, 0),
      new MeshBasicMaterial({ color: 0xffd24a }),
    );
    flame.position.set(camp.x, camp.y + 0.1, camp.z);
    heart.position.set(camp.x + 0.03, camp.y + 0.1, camp.z + 0.03);
    const light = new PointLight(0xffa24a, 0, 16, 1.6);
    light.position.set(camp.x, camp.y + 0.9, camp.z);
    scene.add(flame, heart, light);
    return { flame, heart, light, phase: camp.x * 1.7 + camp.z };
  });
  const fireSmoke = town.camps.length
    ? createSmoke(town.camps.map((camp) => new Vector3(camp.x, camp.y + 0.7, camp.z)))
    : null;
  if (fireSmoke) scene.add(fireSmoke.object);
  let fireTime = 0;
  // Added with the kit's buildings (addBuildings): lit windows and chimney smoke.
  let windowLights = null;
  let smoke = null;
  let lastDark = 0;
  let lastHour = 12;
  const fountain = createFountain(FOUNTAIN_RADIUS, {
    stone: cliffMaterial(ground, { texture: "tplaza", vertexColors: false, scale: 1.8, boost: 1.0 }),
    water: waterMaterial(ground),
  });

  const dummy = new Object3D();
  const crownColor = new Color();
  const treeMatrices = []; // each simple tree's place, for drawing them far off once the kit's trees are in
  trees.forEach((tree, i) => {
    dummy.position.set(tree.x, heightAt(tree.x, tree.z) - 0.05, tree.z);
    dummy.rotation.set(0, tree.turn, 0);
    dummy.scale.setScalar(tree.scale);
    dummy.updateMatrix();
    treeMatrices.push(dummy.matrix.clone());
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
  scene.add(trunks, crowns, stones);
  // Beyond the world's edge, simple woods thinning out into the fog (no collisions: nobody goes there).
  const beyond = [];
  const edgeRandom = rng(seed ^ 0x7f4a7c15);
  const inner = worldSize / 2;
  const outer = inner + 110;
  const wanted = Math.round(((outer * 2) ** 2 - (inner * 2) ** 2) / 260);
  for (let tries = 0; beyond.length < wanted && tries < wanted * 4; tries++) {
    const x = (edgeRandom() * 2 - 1) * outer;
    const z = (edgeRandom() * 2 - 1) * outer;
    const out = Math.max(Math.abs(x), Math.abs(z)) - inner;
    if (out < 3 || edgeRandom() > 1 - out / 160 || land.clear(x, z, 1) || heightAt(x, z) > 26) continue;
    beyond.push({ x, z, scale: 1.4 + edgeRandom() * 1.8, turn: edgeRandom() * 6.3, tint: edgeRandom() });
  }
  const farTrunks = new InstancedMesh(trunkGeometry, trunks.material, Math.max(1, beyond.length));
  const farCrowns = new InstancedMesh(crownGeometry, crowns.material, Math.max(1, beyond.length));
  farTrunks.count = farCrowns.count = beyond.length;
  beyond.forEach((tree, i) => {
    dummy.position.set(tree.x, heightAt(tree.x, tree.z) - 0.05, tree.z);
    dummy.rotation.set(0, tree.turn, 0);
    dummy.scale.setScalar(tree.scale);
    dummy.updateMatrix();
    farTrunks.setMatrixAt(i, dummy.matrix);
    farCrowns.setMatrixAt(i, dummy.matrix);
    farCrowns.setColorAt(i, crownColor.setHSL(0.3 + tree.tint * 0.08, 0.45, 0.26 + tree.tint * 0.08));
  });
  farTrunks.userData.beyond = farCrowns.userData.beyond = true; // always the simple trees, past the edge
  scene.add(farTrunks, farCrowns);
  scene.add(...lamps.objects);
  // The fountain, on a square only.
  if (look.market === "square") {
    for (const object of fountain.objects) object.position.set(plaza.x, 0, plaza.z);
    scene.add(...fountain.objects);
  }
  // Striped awnings over the shops' fronts (and some taverns').
  const awnings = createAwnings(
    town.buildings
      .map((building, i) => ({ building, i }))
      .filter(({ building, i }) => building.spec.kind === "shop" || (building.spec.kind === "tavern" && i % 2 === 0))
      .map(({ building, i }) => ({
        x: building.x,
        z: building.z,
        facing: building.facing,
        width: building.spec.width,
        depth: building.spec.depth,
        doorX: building.doorX,
        colour: (seed + i * 7) >>> 0,
      })),
  );
  if (awnings) scene.add(awnings);

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
    ...land.waterCircles().map((circle) => ({ id: nextId++, water: true, ...circle })), // townsfolk stay dry
  ];
  const fixedBoxes = town.boxes.map((b) => ({ id: nextId++, ...b }));
  const treeCircles = trees.map((tree) => ({ id: nextId++, x: tree.x, z: tree.z, r: 0.25 * tree.scale }));

  // Detailed nature (addNature): every tree, rock and plant as instances of kit models, each model's
  // instances rewritten to just those within sight of the player and allowed by the density whenever the
  // player has moved a little way.
  const natureLayers = []; // { meshes: InstancedMesh[], items: [{ x, z, need, matrix }] }
  const view = { x: Infinity, z: Infinity, radius: 200, density: DENSITIES[0] };
  function refreshNature() {
    for (const { meshes, items, kind } of natureLayers) {
      // Small plants only nearby, rocks a little further, detailed trees out to a point; past that the
      // simple trees stand in (below), all under the fog.
      const reach = (Math.min(view.radius, NATURE_REACH[kind]) + 15) ** 2;
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
    // Far off (past the detailed trees, out to the draw distance): the simple trees, a hundredth of the cost.
    const far = natureLayers.length > 0 && view.radius > NATURE_REACH.tree;
    trunks.visible = crowns.visible = far || !natureLayers.length;
    if (!far) {
      if (natureLayers.length) return;
      trunks.count = crowns.count = Math.min(trees.length, baseTrees * view.density);
      return;
    }
    const near = NATURE_REACH.tree ** 2;
    const out = (view.radius + 15) ** 2;
    let count = 0;
    const limit = baseTrees * view.density;
    for (let i = 0; i < limit && i < trees.length; i++) {
      const distance = (trees[i].x - view.x) ** 2 + (trees[i].z - view.z) ** 2;
      if (distance < near || distance > out) continue;
      trunks.setMatrixAt(count, treeMatrices[i]);
      crowns.setMatrixAt(count, treeMatrices[i]);
      crowns.setColorAt(count, crownColor.setHSL(0.3 + trees[i].tint * 0.08, 0.45, 0.26 + trees[i].tint * 0.08));
      count++;
    }
    trunks.count = crowns.count = count;
    trunks.instanceMatrix.needsUpdate = true;
    crowns.instanceMatrix.needsUpdate = true;
    if (crowns.instanceColor) crowns.instanceColor.needsUpdate = true;
  }
  /** Where the player is, so the detailed nature near them is the nature drawn. Cheap to call every frame. */
  function follow(x, z) {
    sky_.x = x;
    sky_.z = z;
    lamps.follow(x, z);
    terrain.follow(x, z);
    if (!natureLayers.length || (x - view.x) ** 2 + (z - view.z) ** 2 < 64) return;
    view.x = x;
    view.z = z;
    refreshNature();
  }

  let collider = createCollider([], []);
  function setDensity(density) {
    const treeCount = Math.min(trees.length, baseTrees * density); // (a few were taken out of clearings)
    trunks.count = treeCount;
    crowns.count = treeCount;
    stones.count = Math.min(rocks.length, baseRocks * density);
    collider = createCollider([...fixedCircles, ...treeCircles.slice(0, treeCount)], fixedBoxes);
    view.density = density;
    refreshNature();
  }
  setDensity(DENSITIES[0]);
  const resolveCollisions = (position, radius, swimmer, overLow) =>
    collider.resolve(position, radius, swimmer, overLow);

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
    ground.uTime.value += dt;
    // The weather eases out of one kind before easing into the next.
    if (sky_.target !== sky_.kind) {
      sky_.amount = Math.max(0, sky_.amount - dt / 5);
      if (sky_.amount === 0) sky_.kind = sky_.target;
    } else if (sky_.kind !== "clear") sky_.amount = Math.min(1, sky_.amount + dt / 8);
    weather.update(dt, { x: sky_.x, y: heightAt(sky_.x, sky_.z), z: sky_.z }, sky_.kind, sky_.amount);
    fountain.update(dt);
    smoke?.update(dt);
    fireSmoke?.update(dt);
    fireTime += dt;
    for (const fire of fires) {
      // A flame that leaps and leans a little, and a light that wavers with it (brighter as it gets dark).
      const leap = 1 + Math.sin(fireTime * 9 + fire.phase) * 0.12 + Math.sin(fireTime * 23 + fire.phase * 2) * 0.07;
      fire.flame.scale.set(1 / Math.sqrt(leap), leap, 1 / Math.sqrt(leap));
      fire.heart.scale.set(1, 2 - leap, 1);
      fire.flame.rotation.z = Math.sin(fireTime * 5 + fire.phase) * 0.08;
      fire.light.intensity = (1.5 + 6.5 * lastDark) * (0.88 + (leap - 1) * 1.2);
    }
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
    sky_.distance = distance;
    scene.fog.near = distance * 0.4;
    scene.fog.far = distance;
    view.radius = distance;
    refreshNature();
  }

  const sunDirection = new Vector3();
  const skyColor = new Color();
  const weatherGrey = new Color();
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
    // Weather: a greyer sky, a dimmer sun and the fog drawn in, as much as it has set in.
    const look = WEATHER_LOOK[sky_.kind] ?? WEATHER_LOOK.clear;
    const weight = sky_.amount;
    if (weight > 0) {
      skyColor.lerp(weatherGrey.setHex(0x8f989f).multiplyScalar(0.3 + 0.7 * daylight), look.grey * weight);
      sun.intensity *= 1 - look.dim * weight;
      sky.intensity *= 1 - look.dim * weight * 0.5;
    }
    scene.fog.far = sky_.distance * (1 - look.fog * weight);
    scene.fog.near = scene.fog.far * 0.4 * (1 - look.fog * weight * 0.7);
    scene.background.copy(skyColor);
    scene.fog.color.copy(skyColor);
    const dark = 1 - daylight;
    lamps.setDark(dark);
    lastDark = dark;
    lastHour = hour;
    windowLights?.setTime(dark, hour);
    smoke?.setDark(dark);
    fireSmoke?.setDark(dark);
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
    // Rocks and boulders in the painted rock (the same as the mountains'), lit a touch brighter.
    const boulderLook = cliffMaterial(ground, { texture: "trock", vertexColors: false, scale: 2.2, boost: 1.05 });
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
      const need = needFor(i, baseTrees);
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
        if (!builtOver(x, z, 0.5)) place(plant, x, z, need);
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
        needFor(i, baseRocks),
      );
    });
    // Undergrowth on the grass around town: between the town's edge and the forest.
    for (let placed = 0, tries = 0; placed < UNDERGROWTH && tries < UNDERGROWTH * 6; tries++) {
      const x = (growth() * 2 - 1) * (townHalf + NATURE_RING);
      const z = (growth() * 2 - 1) * (townHalf + NATURE_RING);
      if (inTown(x, z, 1.5) || land.clear(x, z) || inGateLane(x, z)) continue;
      const [name, , size] = pickWeighted(KIT_PLANTS, growth());
      dummy.position.set(x, heightAt(x, z) - 0.03, z);
      dummy.rotation.set(0, growth() * Math.PI * 2, 0);
      dummy.scale.setScalar(size * (0.8 + growth() * 0.5));
      dummy.updateMatrix();
      if (!builtOver(x, z, 0.5)) place(name, x, z, 1);
      placed++;
    }
    // The town's own plants: gardens, doorsteps, round the fountain.
    for (const slot of town.natureSlots) {
      dummy.position.set(slot.x, heightAt(slot.x, slot.z) + (slot.y ?? 0), slot.z);
      dummy.rotation.set(slot.tilt?.[0] ?? 0, slot.angle, slot.tilt?.[1] ?? 0);
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
      const boulder = KIT_ROCKS.includes(name);
      const kind = boulder ? "rock" : KIT_TREES.some(([tree]) => tree === name) ? "tree" : "plant";
      const meshes = models.get(name).map(({ geometry, material }) => {
        const instanced = new InstancedMesh(geometry, boulder ? boulderLook : material, items.length);
        instanced.frustumCulled = false; // round the player anyway, and its instances change as they move
        instanced.userData.kit = true;
        instanced.userData.model = name;
        scene.add(instanced);
        return instanced;
      });
      natureLayers.push({ meshes, items, kind });
    }
    view.x = Infinity; // drawn from wherever the player is on the next follow()
    refreshNature();
  }

  /**
   * Gives the ground its textures as they load (`textures`: any of road, paving, plaza for the town's
   * streets, sidewalks and square; grass, dirt, rock, sand, snow for the land), each a repeating texture.
   */
  function addGround(textures) {
    for (const [mesh, map] of [
      [town.roads, look.roads === "dirt" ? textures.dirt : textures.road],

      [town.plaza, textures.plaza],
    ]) {
      if (!map) continue;
      mesh.material.map = map;
      const colours = mesh.geometry.attributes.color;
      if (colours?.itemSize === 4) {
        // A soft-edged street keeps its colours for their alpha: white, so the texture isn't tinted.
        for (let i = 0; i < colours.count; i++) colours.setXYZ(i, 1, 1, 1);
        colours.needsUpdate = true;
        mesh.material.needsUpdate = true;
        continue;
      }
      mesh.material.vertexColors = false;
      mesh.material.needsUpdate = true;
    }
    for (const name of Object.keys(GROUND_LAYERS)) {
      if (textures[name]) ground[`t${name}`].value = textures[name];
    }
    // The town's stone goes into the ground's layers too, for the kerbs, sidewalks and the town's edge.
    if (textures.road) ground.tcobbles.value = textures.road;
    if (textures.paving) ground.tsetts.value = textures.paving;
    if (textures.plaza) ground.tplaza.value = textures.plaza;
    if (textures.water) {
      ground.tWater.value = textures.water;
      fountain.setWater(textures.water);
    }
    if (textures.cliff) ground.tCliff.value = textures.cliff;
    for (const name of ["planks", "beams"]) {
      const material = country.wood[name];
      if (!material || !textures[name]) continue;
      material.map = textures[name];
      material.color.set(0xffffff);
      material.needsUpdate = true;
    }
  }

  /** Swaps the town's simple buildings for ones assembled from the village kit, once it has loaded. */
  function addBuildings(models) {
    const groups = new Map();
    const tintsOf = new Map(); // model → each copy's tints, in step with its matrices
    const at = new Matrix4();
    town.buildings.forEach((building, i) => {
      at.makeRotationY((building.facing * Math.PI) / 2).setPosition(building.x, 0, building.z);
      for (const { model, matrix, tints, skip } of housePieces(
        building.spec,
        building.doorX,
        seed ^ (i * 2654435761),
      )) {
        if (!groups.has(model)) {
          groups.set(model, []);
          tintsOf.set(model, []);
        }
        groups.get(model).push(at.clone().multiply(matrix));
        tintsOf.get(model).push({ tints, skip });
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
    const tint = new Color();
    for (const [model, matrices] of groups) {
      for (const { geometry, material, texture = "" } of models.get(model)) {
        // A copy may leave one part out (the stone course of an upstairs wall): this part's copies are the rest.
        const dressed = tintsOf.get(model);
        const kept = matrices.map((_, i) => i).filter((i) => !(dressed[i].skip && texture.includes(dressed[i].skip)));
        if (!kept.length) continue;
        const instanced = new InstancedMesh(geometry, material, kept.length);
        kept.forEach((from, i) => instanced.setMatrixAt(i, matrices[from]));
        // Each building's own colour of tiles and plaster: only the parts that are tiles or plaster.
        const part = ["roundtiles", "plaster"].find((name) => texture.includes(name));
        if (part) kept.forEach((from, i) => instanced.setColorAt(i, tint.setRGB(...dressed[from].tints[part])));
        instanced.computeBoundingSphere();
        instanced.userData.kit = true;
        scene.add(instanced);
      }
    }
    // Lit windows at night, and smoke from the chimneys (fixtures.js).
    const boxOf = (model) => {
      const box = new Box3();
      for (const { geometry } of models.get(model)) {
        geometry.computeBoundingBox();
        box.union(geometry.boundingBox);
      }
      return box;
    };
    const windows = [];
    for (const model of ["window-wide-round1", "window-wide-flat1", "window-thin-round1"]) {
      if (!groups.has(model)) continue;
      const box = boxOf(model);
      for (const matrix of groups.get(model)) windows.push({ matrix, box });
    }
    windowLights = createWindowLights(windows);
    scene.add(windowLights.mesh);
    windowLights.setTime(lastDark, lastHour);
    const tops = [];
    for (const model of ["prop-chimney", "prop-chimney2"]) {
      if (!groups.has(model)) continue;
      const box = boxOf(model);
      const top = new Vector3((box.min.x + box.max.x) / 2, box.max.y, (box.min.z + box.max.z) / 2);
      // About two chimneys in three have a fire lit.
      const lit = groups.get(model).filter((_, i) => (i * 7919) % 3 !== 0);
      tops.push(...lit.map((matrix) => top.clone().applyMatrix4(matrix)));
    }
    if (tops.length) {
      smoke = createSmoke(tops);
      scene.add(smoke.object);
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
    weather.dispose();
    scene.traverse((object) => {
      // Kit geometry and materials are shared by every world (kit.js keeps them).
      if (!object.geometry?.userData.shared) object.geometry?.dispose();
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) if (!material?.userData.shared) material?.dispose();
      object.dispose?.();
    });
  }

  const map = mapInfo(land);
  return {
    scene,
    /** Metres along each side. */
    size: worldSize,
    /** What map.js draws this world from. */
    map,
    setDensity,
    resolveCollisions,
    clearSight,
    dispose,
    /** The weather to ease into: "clear", "rain", "snow" or "mist" (weather.js). */
    /** The season the land wears: winter lies under snow; the others are the green land. */
    setSeason(season) {
      ground.uWinter.value = season === "winter" ? 0.85 : 0;
    },
    setWeather(kind) {
      sky_.target = WEATHER_LOOK[kind] ? kind : "clear";
    },
    /** The weather now and how far it has set in (0–1). */
    weatherNow: () => ({ kind: sky_.kind, amount: sky_.amount }),
    buildingCount: town.buildings.length,
    /** The town's plan for naming places (zones.js): buildings (door i is building i), gardens, meadows,
     *  streets and the square. */
    layout: {
      townHalf: townHalf,
      plaza: { x: plaza.x, z: plaza.z, half: BLOCK / 2 },
      fountainRadius: look.market === "square" ? FOUNTAIN_RADIUS : null,
      // The settlement: hamlet, village, town or city; its market (square, stalls, green) and roads.
      settlement: { ...look },
      walls: !!look.walls,
      streets: streetStrips(),
      buildings: town.buildings.map((building) => ({ kind: building.spec.kind, box: building.box })),
      // Out in the country: the river, each road (to its outpost), the mountain ranges, the outposts
      // (`door` is the door of an inn or cottage) and caves.
      river: land.river ? { points: land.river.points, width: land.river.width } : null,
      roads: land.roads.map((road) => ({
        points: road.points,
        width: road.width,
        to: road.to,
        ...(road.between ? { between: road.between } : {}),
      })),
      mountains: land.mountains.map((ridge) => ridge.side),
      worldHalf: worldSize / 2,
      outposts: land.outposts.map((outpost) => ({
        kind: outpost.kind,
        name: outpost.name ?? null,
        x: outpost.x,
        z: outpost.z,
        ...(outpost.inTown ? { inTown: true } : {}),
        door: country.doorOf.get(outpost.index) ?? null,
        doors: country.doorsOf.get(outpost.index) ?? [],
      })),
      gardens: town.gardens,
      meadows: town.meadows,
    },
    /** Each building's door: `x`/`z` is where to stand to use it, `step` the doorway, `open` 0–1. */
    doors,
    /** The noticeboard on the square: { x, z, angle, use (where to stand to read it) }. Later the world
     *  brief can place boards (and other things to use) wherever it likes. */
    /** The fountain on the square: its centre and rim radius. */
    fountain: look.market === "square" ? { x: plaza.x, z: plaza.z, r: FOUNTAIN_RADIUS } : null,
    /** Where a first visit starts: by the market. */
    spawn,
    noticeboard: town.noticeboard,
    /** The town's props, as placed: [{ model, x, z }] (main.js makes things to use of some: pack.js PROP_THINGS). */
    props: town.propSlots.map((slot) => ({ model: slot.model, x: slot.x, z: slot.z })),
    /** The kit props this world has somewhere (a smithy's anvil, a farm's crates): what to load for addProps. */
    propModels: [...new Set(town.propSlots.map((slot) => slot.model))],
    /** Cave mouths: { x, z (where to stand), angle, outpost }. */
    caves: country.caves,
    /** The world's landscape, as built (land.js), for saving with it. */
    landscape: land.landscape,
    /** Bench seats: { x, z, angle, approach, height, taken }. */
    seats: town.seats,
    /** Places to be doing something (placeSpot): the forge, stalls, fields, gardens, the shore, the grass. */
    spots: town.spots,
    /** Campsites: { id, x, y, z, angle, mouth (where to stand at the tent), bed ({ x, z, angle }: its bedroll) }. */
    camps: town.camps,
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
    /** Where to step on and off each bridge (just past its ends): [{ a: { x, z }, b: { x, z } }]. */
    bridges: land.bridges.map((bridge) => {
      const reach = bridge.length / 2 + 1.5;
      const [ax, az] = bridge.along;
      return {
        a: { x: bridge.x - ax * reach, z: bridge.z - az * reach },
        b: { x: bridge.x + ax * reach, z: bridge.z + az * reach },
      };
    }),
  };
}
