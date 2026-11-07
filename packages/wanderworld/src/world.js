// The M0 world: rolling low-poly ground, instanced trees and rocks, and a capsule to walk.
// Everything is seeded, so the same chat always gets the same layout.
import {
  BoxGeometry,
  CapsuleGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  DodecahedronGeometry,
  Float32BufferAttribute,
  Fog,
  Group,
  HemisphereLight,
  InstancedMesh,
  Mesh,
  MeshLambertMaterial,
  Object3D,
  PlaneGeometry,
  Scene,
} from "three";

export const WORLD_SIZE = 240; // metres along each side
const CLEAR_RADIUS = 8; // no props this close to the spawn point
const BASE_TREES = 1200;
const BASE_ROCKS = 300;
/** Prop multipliers the fps label cycles through, to stress-test a phone. */
export const DENSITIES = [1, 4, 10];
const MAX_DENSITY = DENSITIES[DENSITIES.length - 1];
const GRID_CELL = 4; // collision grid cell, metres

const SKY = 0xbfd9ee;

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
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Ground height at (x, z). Gentle hills, flattened near the spawn point. */
export function heightAt(x, z) {
  const hills = Math.sin(x * 0.05) * 1.2 + Math.cos(z * 0.04) * 1.0 + Math.sin((x + z) * 0.11) * 0.4;
  const flatten = Math.min(1, Math.hypot(x, z) / 20);
  return hills * flatten;
}

/**
 * Collision against circles (tree trunks) on the ground plane. A uniform grid means each check only looks
 * at the 3×3 cells around the player, however many trees there are. Circles must have r < GRID_CELL.
 */
export function createCollider(circles) {
  const grid = new Map();
  const cellKey = (cx, cz) => `${cx},${cz}`;
  for (const circle of circles) {
    const key = cellKey(Math.floor(circle.x / GRID_CELL), Math.floor(circle.z / GRID_CELL));
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key).push(circle);
  }
  return {
    /** Pushes a circle at `position` (x, z) with `radius` out of any circle it overlaps. Mutates `position`. */
    resolve(position, radius) {
      const cx = Math.floor(position.x / GRID_CELL);
      const cz = Math.floor(position.z / GRID_CELL);
      for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) {
          for (const circle of grid.get(cellKey(cx + dx, cz + dz)) ?? []) {
            const ox = position.x - circle.x;
            const oz = position.z - circle.z;
            const distance = Math.hypot(ox, oz);
            const minimum = radius + circle.r;
            if (distance > 0 && distance < minimum) {
              position.x = circle.x + (ox / distance) * minimum;
              position.z = circle.z + (oz / distance) * minimum;
            }
          }
        }
      }
    },
  };
}

function buildGround(random) {
  const geometry = new PlaneGeometry(WORLD_SIZE, WORLD_SIZE, 60, 60).toNonIndexed();
  geometry.rotateX(-Math.PI / 2);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i++) {
    position.setY(i, heightAt(position.getX(i), position.getZ(i)));
  }
  // One color per triangle, so the flat shading reads as facets.
  const colors = new Float32Array(position.count * 3);
  const color = new Color();
  for (let i = 0; i < position.count; i += 3) {
    const y = (position.getY(i) + position.getY(i + 1) + position.getY(i + 2)) / 3;
    color.setHSL(0.27 + random() * 0.03, 0.42, 0.36 + y * 0.03 + random() * 0.04);
    for (let k = 0; k < 3; k++) color.toArray(colors, (i + k) * 3);
  }
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return new Mesh(geometry, new MeshLambertMaterial({ vertexColors: true, flatShading: true }));
}

/** Random points across the ground, kept out of the spawn clearing. */
function scatter(random, count) {
  const points = [];
  const half = WORLD_SIZE / 2 - 2;
  while (points.length < count) {
    const x = (random() * 2 - 1) * half;
    const z = (random() * 2 - 1) * half;
    if (Math.hypot(x, z) < CLEAR_RADIUS) continue;
    points.push({ x, z, scale: 0.7 + random() * 0.9, turn: random() * Math.PI * 2, tint: random() });
  }
  return points;
}

function buildPlayer() {
  const player = new Group();
  const material = new MeshLambertMaterial({ color: 0xe0874a, flatShading: true });
  const body = new Mesh(new CapsuleGeometry(0.35, 0.9, 2, 8), material);
  body.position.y = 0.8;
  // A small nose so you can see which way the capsule faces.
  const nose = new Mesh(new BoxGeometry(0.18, 0.14, 0.3), new MeshLambertMaterial({ color: 0x3b2a20 }));
  nose.position.set(0, 1.2, 0.36);
  player.add(body, nose);
  return player;
}

/**
 * Builds the scene for one seed. Instanced meshes are allocated at the highest density once;
 * changing density only changes how many instances are drawn.
 */
export function createWorld(seed) {
  const random = rng(seed);
  const scene = new Scene();
  scene.background = new Color(SKY);
  scene.fog = new Fog(SKY, 45, 130);
  scene.add(new HemisphereLight(0xe8f4ff, 0x4a5a3a, 1.6));
  const sun = new DirectionalLight(0xfff1d6, 1.8);
  sun.position.set(40, 80, 25);
  scene.add(sun);

  const ground = buildGround(random);
  scene.add(ground);

  const trees = scatter(random, BASE_TREES * MAX_DENSITY);
  const rocks = scatter(random, BASE_ROCKS * MAX_DENSITY);

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
  scene.add(trunks, crowns, stones);

  const player = buildPlayer();
  player.position.set(0, heightAt(0, 0), 0);
  scene.add(player);

  let collider = createCollider([]);
  function setDensity(density) {
    const treeCount = BASE_TREES * density;
    trunks.count = treeCount;
    crowns.count = treeCount;
    stones.count = BASE_ROCKS * density;
    collider = createCollider(
      trees.slice(0, treeCount).map((tree) => ({ x: tree.x, z: tree.z, r: 0.25 * tree.scale })),
    );
  }
  setDensity(DENSITIES[0]);
  const resolveCollisions = (position, radius) => collider.resolve(position, radius);

  function dispose() {
    scene.traverse((object) => {
      object.geometry?.dispose();
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) material?.dispose();
      object.dispose?.();
    });
  }

  return { scene, player, setDensity, resolveCollisions, dispose };
}
