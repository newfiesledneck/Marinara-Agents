// The world: rolling low-poly ground, a seeded town around the spawn point, and instanced trees and
// rocks outside it. Everything is seeded, so the same seed always gives the same layout.
//
// Draw calls stay flat however big the town is: every building, road and fountain is merged into one
// vertex-coloured mesh, and trees, rocks and lamps are instanced.
import {
  BoxGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  DodecahedronGeometry,
  Float32BufferAttribute,
  Fog,
  HemisphereLight,
  IcosahedronGeometry,
  InstancedMesh,
  Mesh,
  MeshLambertMaterial,
  Object3D,
  PlaneGeometry,
  Scene,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { barrel, bench, buildBuilding, bush, crate, fence, makeSpec, marketStall, painted } from "./buildings.js";

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

const SKY = 0xbfd9ee;
const ROAD = 0xb3a184;
const PAVING = 0xc7bba5;
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

/** Builds a building from its spec at (x, z) facing `facing`, with its door, collision box and street clutter. */
function placeBuilding(random, town, spec, x, z, facing) {
  const { geometry, doorX, footprint } = buildBuilding(random, spec);
  placeProp(town, geometry, x, z, facing);
  town.boxes.push(footprintBox(x, z, facing, footprint));
  const d = spec.depth / 2;
  town.doors.push({ ...toWorld(x, z, facing, doorX, d + 1.2), kind: spec.kind });
  if (spec.kind === "shop" || spec.kind === "tavern" || spec.kind === "smithy") {
    // Barrels and crates by the door, on the side away from the sign.
    const side = doorX > 0 ? 1 : -1;
    for (let i = 0; i < 1 + Math.floor(random() * 3); i++) {
      const local = { x: doorX + side * (1.2 + i * 0.75), z: d + 0.55 };
      const at = toWorld(x, z, facing, local.x, local.z);
      if (random() < 0.5) {
        placeProp(town, barrel(), at.x, at.z);
        town.circles.push({ x: at.x, z: at.z, r: 0.34 });
      } else {
        placeProp(town, crate(0.55 + random() * 0.2), at.x, at.z, Math.floor(random() * 4));
        town.circles.push({ x: at.x, z: at.z, r: 0.4 });
      }
    }
  }
}

/** A fenced garden on an empty lot: bushes and a small tree. */
function placeGarden(random, town, x, z, size) {
  placeProp(town, fence(size, size), x, z, Math.floor(random() * 4));
  for (let i = 0; i < 3 + Math.floor(random() * 4); i++) {
    placeProp(town, bush(random), x + (random() - 0.5) * (size - 1.5), z + (random() - 0.5) * (size - 1.5));
  }
  const tx = x + (random() - 0.5) * (size - 3);
  const tz = z + (random() - 0.5) * (size - 3);
  const height = 2.5 + random() * 1.5;
  placeProp(
    town,
    mergeGeometries([
      painted(new CylinderGeometry(0.12, 0.18, height * 0.45, 5).translate(0, height * 0.22, 0), 0x6b4a2f),
      painted(new IcosahedronGeometry(height * 0.32, 0).translate(0, height * 0.65, 0), 0x4f7f3f),
    ]),
    tx,
    tz,
  );
  town.circles.push({ x: tx, z: tz, r: 0.25 });
}

/**
 * One 18 m block. Around the plaza: a landmark (town hall, temple or tavern) filling the block, or shops
 * facing the plaza with homes behind. Elsewhere: up to four houses on the corner lots, now and then a shop
 * or the smithy, and gardens on the empty lots.
 */
function fillBlock(random, town, cx, cz, role) {
  const half = BLOCK / 2;
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
      placeGarden(random, town, x, z, 7);
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
  const town = { pieces: [], boxes: [], circles: [], doors: [] };
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
      if (edge && random() < 0.3) continue; // a ragged edge reads as a town, not a grid
      const corner = Math.abs(cx) === outer && Math.abs(cz) === outer;
      const role = nearPlaza ? plazaRoles[ring++] : corner && edgeIndex++ === smithyBlock ? "smithy" : "homes";
      fillBlock(random, town, cx, cz, role);
    }
  }

  // Streets: one strip per grid line in each direction, plus the paved plaza and its fountain.
  const length = BLOCKS_PER_SIDE * PITCH + STREET;
  for (let i = 0; i <= BLOCKS_PER_SIDE; i++) {
    const line = (i - BLOCKS_PER_SIDE / 2) * PITCH;
    town.pieces.push(painted(new PlaneGeometry(length, STREET).rotateX(-Math.PI / 2).translate(0, 0.03, line), ROAD));
    town.pieces.push(painted(new PlaneGeometry(STREET, length).rotateX(-Math.PI / 2).translate(line, 0.035, 0), ROAD));
  }
  town.pieces.push(painted(new PlaneGeometry(BLOCK, BLOCK).rotateX(-Math.PI / 2).translate(0, 0.04, 0), PAVING));
  town.pieces.push(
    painted(new CylinderGeometry(FOUNTAIN_RADIUS, FOUNTAIN_RADIUS + 0.2, 0.7, 12).translate(0, 0.35, 0), STONE_GREY),
  );
  town.pieces.push(
    painted(new CylinderGeometry(FOUNTAIN_RADIUS - 0.3, FOUNTAIN_RADIUS - 0.3, 0.1, 12).translate(0, 0.66, 0), WATER),
  );
  town.pieces.push(painted(new CylinderGeometry(0.35, 0.5, 2.2, 6).translate(0, 1.1, 0), STONE_GREY));
  town.circles.push({ x: 0, z: 0, r: FOUNTAIN_RADIUS + 0.2 });

  // Market day on the plaza: stalls in the corners facing the fountain, benches beside it.
  for (const [x, z] of [
    [-5.6, -5.6],
    [5.6, -5.6],
    [-5.6, 5.2],
    [5.6, 5.2],
  ]) {
    const facing = facingFor(-x, -z);
    placeProp(town, marketStall(random), x, z, facing);
    town.boxes.push(footprintBox(x, z, facing, { minX: -1.3, maxX: 1.3, minZ: -0.9, maxZ: 0.9 }));
  }
  for (const [x, z, facing] of [
    [-4, 0, 1],
    [4, 0, 3],
    [0, -4, 0],
  ]) {
    placeProp(town, bench(), x, z, facing);
    town.boxes.push(footprintBox(x, z, facing, { minX: -0.9, maxX: 0.9, minZ: -0.25, maxZ: 0.25 }));
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
  return { mesh, boxes: town.boxes, circles: town.circles, lamps, doors: town.doors };
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
    ...town.circles.map((circle) => ({ id: nextId++, ...circle })),
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

  return {
    scene,
    setDensity,
    resolveCollisions,
    clearSight,
    dispose,
    buildingCount: town.boxes.length,
    /** Points just outside each building's front door, where its people start. */
    doors: town.doors,
    /** True when (x, z) is inside a building (with `margin`), so someone walking there would be stopped. */
    blocked: (x, z, margin = 0.3) => collider.insideBox(x, z, margin),
  };
}
