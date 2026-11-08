// The world: rolling low-poly ground, a seeded town around the spawn point, and instanced trees and
// rocks outside it. Everything is seeded, so the same seed always gives the same layout.
//
// Draw calls stay flat however big the town is: every building, road and fountain is merged into one
// vertex-coloured mesh, and trees, rocks and lamps are instanced.
import {
  BoxGeometry,
  BufferGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  DodecahedronGeometry,
  Float32BufferAttribute,
  Fog,
  HemisphereLight,
  InstancedMesh,
  Mesh,
  MeshLambertMaterial,
  Object3D,
  PlaneGeometry,
  Scene,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

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
const FLOOR_HEIGHT = 3.2;
const FOUNTAIN_RADIUS = 2.4;
export const SPAWN = Object.freeze({ x: 0, z: FOUNTAIN_RADIUS + 4 });

const SKY = 0xbfd9ee;
const WALLS = [0xe8dcc4, 0xd9c3a0, 0xc9b79c, 0xb8a58a, 0xe3d3b5, 0xa8b3b8, 0xc98f6b];
const ROOFS = [0x9c4a3a, 0x7a3b2e, 0x5b4a6b, 0x4a5d6b, 0x6b5b3a, 0x8a6a3a];
const ROAD = 0xb3a184;
const PAVING = 0xc7bba5;
const WINDOW = 0x3b4a5a;
const DOOR = 0x5a3b26;
const STONE = 0x9a9a94;
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

const pick = (random, list) => list[Math.floor(random() * list.length)];

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
 * Circles must have r < GRID_CELL; boxes are entered into every cell they cover.
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
    insideBox(x, z, margin = 0) {
      // The 3×3 cells around the point, so a box just across a cell boundary still counts within the margin.
      const cx = Math.floor(x / GRID_CELL);
      const cz = Math.floor(z / GRID_CELL);
      for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) {
          for (const shape of grid.get(cellKey(cx + dx, cz + dz)) ?? []) {
            if (
              shape.kind === "box" &&
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

// ── Geometry helpers ─────────────────────────────────────────────────────────

/** Non-indexed position + normal + colour, the one layout every merged piece shares. */
function painted(geometry, hex) {
  const flat = geometry.index ? geometry.toNonIndexed() : geometry;
  flat.deleteAttribute("uv");
  if (!flat.attributes.normal) flat.computeVertexNormals();
  const color = new Color(hex);
  const colors = new Float32Array(flat.attributes.position.count * 3);
  for (let i = 0; i < flat.attributes.position.count; i++) color.toArray(colors, i * 3);
  flat.setAttribute("color", new Float32BufferAttribute(colors, 3));
  return flat;
}

function box(width, height, depth, x, y, z, hex) {
  return painted(new BoxGeometry(width, height, depth).translate(x, y, z), hex);
}

/** A gable roof with its ridge along x: `width` long, `depth` across, `height` from eave to ridge. */
function gableRoof(width, depth, height) {
  const w = width / 2;
  const d = depth / 2;
  // prettier-ignore
  const positions = [
    -w, 0, d,   w, 0, d,   w, height, 0,    -w, 0, d,   w, height, 0,   -w, height, 0, // +z slope
    w, 0, -d,  -w, 0, -d, -w, height, 0,     w, 0, -d, -w, height, 0,    w, height, 0, // -z slope
    w, 0, d,    w, 0, -d,  w, height, 0, // +x gable
    -w, 0, -d, -w, 0, d,  -w, height, 0, // -x gable
  ];
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * One house: walls, a gable roof, a door on the street side and a row of windows per floor. Built
 * facing +z with its long side along x, then turned to face `facing` (0 = +z, 1 = +x, 2 = -z, 3 = -x).
 */
function buildHouse(random, { x, z, width, depth, floors, facing }) {
  const height = floors * FLOOR_HEIGHT;
  const wall = pick(random, WALLS);
  const pieces = [box(width, height, depth, 0, height / 2, 0, wall)];
  const roof = gableRoof(width + 0.8, depth + 0.8, Math.min(width, depth) * (0.35 + random() * 0.2));
  pieces.push(painted(roof.translate(0, height, 0), pick(random, ROOFS)));
  const doorX = (random() - 0.5) * (width - 3);
  pieces.push(box(1.2, 2.2, 0.12, doorX, 1.1, depth / 2 + 0.06, DOOR));
  const perFloor = Math.max(1, Math.floor(width / 2.6));
  for (let floor = 0; floor < floors; floor++) {
    const y = floor * FLOOR_HEIGHT + 1.7;
    for (let i = 0; i < perFloor; i++) {
      const wx = -width / 2 + (width / perFloor) * (i + 0.5);
      // No front window where the door is.
      if (!(floor === 0 && Math.abs(wx - doorX) < 1.3))
        pieces.push(box(0.9, 1.1, 0.1, wx, y, depth / 2 + 0.05, WINDOW));
      pieces.push(box(0.9, 1.1, 0.1, wx, y, -depth / 2 - 0.05, WINDOW));
    }
  }
  const house = mergeGeometries(pieces);
  house.rotateY((facing * Math.PI) / 2);
  house.translate(x, 0, z);
  return house;
}

/** Buildings for one 18 m block: either one large hall, or up to four houses on its corner lots. */
function fillBlock(random, cx, cz, buildings, boxes) {
  const half = BLOCK / 2;
  const facingFor = (dx, dz) => (Math.abs(dx) > Math.abs(dz) ? (dx > 0 ? 1 : 3) : dz > 0 ? 0 : 2);
  const nearPlaza = Math.abs(cx) <= PITCH && Math.abs(cz) <= PITCH;
  if (nearPlaza && random() < 0.45) {
    // A hall or inn facing the plaza.
    const facing = facingFor(-cx, -cz);
    const along = 12 + random() * 3;
    const across = 9 + random() * 2;
    const [width, depth] = facing % 2 === 0 ? [along, across] : [across, along];
    buildings.push(
      buildHouse(random, { x: cx, z: cz, width: along, depth: across, floors: 2 + (random() < 0.4), facing }),
    );
    boxes.push({ minX: cx - width / 2, maxX: cx + width / 2, minZ: cz - depth / 2, maxZ: cz + depth / 2 });
    return;
  }
  for (const [lx, lz] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]) {
    if (random() < 0.18) continue; // an empty lot: a yard or garden
    const along = 5 + random() * 3;
    const across = 5 + random() * 2.5;
    // Face the nearer street: the lot's outward side along x or z.
    const facing = random() < 0.5 ? (lz > 0 ? 0 : 2) : lx > 0 ? 1 : 3;
    const [width, depth] = facing % 2 === 0 ? [along, across] : [across, along];
    const x = cx + lx * (half / 2 + (random() - 0.5));
    const z = cz + lz * (half / 2 + (random() - 0.5));
    const floors = random() < 0.35 ? 2 : 1;
    buildings.push(buildHouse(random, { x, z, width: along, depth: across, floors, facing }));
    boxes.push({ minX: x - width / 2, maxX: x + width / 2, minZ: z - depth / 2, maxZ: z + depth / 2 });
  }
}

function buildTown(random) {
  const buildings = [];
  const boxes = [];
  const centres = [];
  for (let i = 0; i < BLOCKS_PER_SIDE; i++) centres.push((i - (BLOCKS_PER_SIDE - 1) / 2) * PITCH);
  for (const cx of centres) {
    for (const cz of centres) {
      if (cx === 0 && cz === 0) continue; // the plaza
      const edge = Math.max(Math.abs(cx), Math.abs(cz)) === centres[centres.length - 1];
      if (edge && random() < 0.3) continue; // a ragged edge reads as a town, not a grid
      fillBlock(random, cx, cz, buildings, boxes);
    }
  }

  // Streets: one strip per grid line in each direction, plus the paved plaza and its fountain.
  const surface = [];
  const length = BLOCKS_PER_SIDE * PITCH + STREET;
  for (let i = 0; i <= BLOCKS_PER_SIDE; i++) {
    const line = (i - BLOCKS_PER_SIDE / 2) * PITCH;
    surface.push(painted(new PlaneGeometry(length, STREET).rotateX(-Math.PI / 2).translate(0, 0.03, line), ROAD));
    surface.push(painted(new PlaneGeometry(STREET, length).rotateX(-Math.PI / 2).translate(line, 0.035, 0), ROAD));
  }
  surface.push(painted(new PlaneGeometry(BLOCK, BLOCK).rotateX(-Math.PI / 2).translate(0, 0.04, 0), PAVING));
  surface.push(
    painted(new CylinderGeometry(FOUNTAIN_RADIUS, FOUNTAIN_RADIUS + 0.2, 0.7, 12).translate(0, 0.35, 0), STONE),
  );
  surface.push(
    painted(new CylinderGeometry(FOUNTAIN_RADIUS - 0.3, FOUNTAIN_RADIUS - 0.3, 0.1, 12).translate(0, 0.66, 0), WATER),
  );
  surface.push(painted(new CylinderGeometry(0.35, 0.5, 2.2, 6).translate(0, 1.1, 0), STONE));

  const mesh = new Mesh(
    mergeGeometries([...buildings, ...surface]),
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
  return { mesh, boxes, lamps };
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
  return new Mesh(geometry, new MeshLambertMaterial({ vertexColors: true, flatShading: true }));
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

/**
 * Builds the scene for one seed. Instanced meshes are allocated at the highest density once;
 * changing density only changes how many instances are drawn.
 */
export function createWorld(seed) {
  const random = rng(seed);
  const scene = new Scene();
  scene.background = new Color(SKY);
  scene.fog = new Fog(SKY, 60, 170);
  scene.add(new HemisphereLight(0xe8f4ff, 0x4a5a3a, 1.6));
  const sun = new DirectionalLight(0xfff1d6, 1.8);
  sun.position.set(40, 80, 25);
  scene.add(sun);

  scene.add(buildGround(random));
  const town = buildTown(random);
  scene.add(town.mesh);

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
    mergeGeometries([
      painted(new CylinderGeometry(0.08, 0.1, 3.4, 5).translate(0, 1.7, 0), 0x2f3438),
      painted(new BoxGeometry(0.45, 0.45, 0.45).translate(0, 3.55, 0), 0xffe3a0),
    ]),
    new MeshLambertMaterial({ vertexColors: true, flatShading: true }),
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
  });
  scene.add(trunks, crowns, stones, lampPosts);

  // Fixed obstacles: buildings, the fountain and the lamp posts. Trees join per density.
  let nextId = 0;
  const fixedCircles = [
    { id: nextId++, x: 0, z: 0, r: FOUNTAIN_RADIUS + 0.2 },
    ...town.lamps.map((lamp) => ({ id: nextId++, x: lamp.x, z: lamp.z, r: 0.15 })),
  ];
  const fixedBoxes = town.boxes.map((b) => ({ id: nextId++, ...b }));
  const treeCircles = trees.map((tree) => ({ id: nextId++, x: tree.x, z: tree.z, r: 0.25 * tree.scale }));

  let collider = createCollider([], []);
  function setDensity(density) {
    const treeCount = BASE_TREES * density;
    trunks.count = treeCount;
    crowns.count = treeCount;
    stones.count = BASE_ROCKS * density;
    collider = createCollider([...fixedCircles, ...treeCircles.slice(0, treeCount)], fixedBoxes);
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
      if (collider.insideBox(fromX + (toX - fromX) * t, fromZ + (toZ - fromZ) * t, 0.4)) return (i - 1) / steps;
    }
    return 1;
  }

  function dispose() {
    scene.traverse((object) => {
      object.geometry?.dispose();
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) material?.dispose();
      object.dispose?.();
    });
  }

  return { scene, setDensity, resolveCollisions, clearSight, dispose, buildingCount: town.boxes.length };
}
