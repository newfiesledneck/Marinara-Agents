// Inside a building: one furnished room, made from the parts kit's boxes for the building's kind (a home's
// bed and hearth, a tavern's bar and tables, a shop's counter and shelves, a smithy's forge and anvil, a
// temple's pews and altar, a hall's long table). Seeded by the building, so the same door always opens
// onto the same room. The room has no ceiling, and whichever walls stand between the camera and the
// player are hidden, so the camera can look in from outside the room.
//
// It offers the same calls main.js uses on the town: resolveCollisions, clearSight, update, seats.
import { Color, CylinderGeometry, HemisphereLight, Mesh, MeshLambertMaterial, PointLight, Scene } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { box, DOOR, DOOR_HEIGHT, DOOR_WIDTH, painted } from "./buildings.js";
import { createCollider, hashString, rng } from "./world.js";

const WALL_HEIGHT = 3;
const WALL = 0.2;
const SEAT_HEIGHT = 0.45;
const PLANK = 0x8a6a48;
const FLAGSTONE = 0x8f8c84;
const WOOD = 0x7a5534;
const DARK_WOOD = 0x5a3d26;
const CLOTH = [0x8a3a3a, 0x3a5a8a, 0x4a7a4a, 0x8a7a3a, 0x6a4a7a];
const GOODS = [0xc8a050, 0x9a4a3a, 0x4a7a9a, 0x7a9a4a, 0xd8d0c0, 0xa86a3a];

/**
 * The room behind `door` (a door from world.js, carrying its building's spec). The player enters at
 * `entry` facing into the room; `exit` is where "Leave" is offered.
 */
export function createInterior(door, seed) {
  const random = rng(hashString(`${seed}:inside:${door.index}`));
  const pick = (list) => list[Math.floor(random() * list.length)];
  const kind = door.spec.kind;
  const width = Math.max(5, Math.min(12, door.spec.width - 0.6));
  const depth = Math.max(4.5, Math.min(10, door.spec.depth - 0.6));
  const hx = width / 2;
  const hz = depth / 2;
  const pieces = []; // the room itself: floor, hearth, counters …
  const furniture = []; // simple furniture, hidden once kit props stand in its place
  const slots = []; // where each kit prop goes: { model, x, y, z, angle, scale: [x, y, z] }
  const boxes = [];
  const seats = [];
  const glows = [];
  /** A kit prop at (x, z), turned `angle`, scaled (a number or [x, y, z]), lifted `y`. */
  const kit = (model, x, z, { angle = 0, scale = 1, y = 0 } = {}) =>
    slots.push({ model, x, y, z, angle, scale: Array.isArray(scale) ? scale : [scale, scale, scale] });
  /** A solid piece of furniture: drawn (as furniture when the kit has `model` for it), and in the way. */
  const solid = (w, h, d, x, y, z, hex, model = null) => {
    (model ? furniture : pieces).push(box(w, h, d, x, y, z, hex));
    boxes.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2 });
    if (model) kit(model.name, x, z, model);
  };
  /** A chair or stool at (x, z) that a sitter faces `angle` on, with somewhere to stand in front. */
  const chair = (x, z, angle, back = true) => {
    const fx = Math.sin(angle);
    const fz = Math.cos(angle);
    kit(back ? "chair-1" : "stool", x, z, { angle });
    furniture.push(box(0.45, 0.06, 0.45, x, SEAT_HEIGHT - 0.03, z, WOOD));
    for (const [lx, lz] of [
      [-0.18, -0.18],
      [0.18, -0.18],
      [-0.18, 0.18],
      [0.18, 0.18],
    ]) {
      furniture.push(box(0.05, SEAT_HEIGHT - 0.06, 0.05, x + lx, (SEAT_HEIGHT - 0.06) / 2, z + lz, DARK_WOOD));
    }
    if (back)
      furniture.push(
        box(0.45 * Math.abs(fz) + 0.06, 0.5, 0.45 * Math.abs(fx) + 0.06, x - fx * 0.21, 0.72, z - fz * 0.21, WOOD),
      );
    seats.push({ x, z, angle, approach: { x: x + fx * 0.65, z: z + fz * 0.65 }, height: SEAT_HEIGHT, taken: null });
  };
  const table = (x, z, w, d, model = "table-large") => {
    furniture.push(box(w, 0.07, d, x, 0.76, z, WOOD));
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        furniture.push(box(0.07, 0.72, 0.07, x + sx * (w / 2 - 0.1), 0.36, z + sz * (d / 2 - 0.1), DARK_WOOD));
    boxes.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2 });
    if (model === "table-large") {
      // The kit's long table is 2.85 × 1.1 m and 0.81 m high; drawn at this table's size.
      kit(model, x, z, { scale: [w / 2.85, 0.76 / 0.81, d / 1.1] });
      // Something on it: plates and mugs, now and then a bottle.
      for (let i = 0; i < 1 + Math.floor(random() * 3); i++) {
        const thing = pick(["mug", "table-plate", "mug", "bottle-1"]);
        kit(thing, x + (random() - 0.5) * (w - 0.4), z + (random() - 0.5) * (d - 0.3), {
          y: 0.77,
          angle: random() * 6.28,
        });
      }
    } else kit(model, x, z, { scale: [w / 2.02, 0.76 / 0.89, d / 1.02] });
  };
  /** A table with chairs round it. */
  const dining = (x, z, w, d, sides) => {
    table(x, z, w, d);
    if (sides.includes("n")) chair(x, z - d / 2 - 0.45, 0);
    if (sides.includes("s")) chair(x, z + d / 2 + 0.45, Math.PI);
    if (sides.includes("w")) chair(x - w / 2 - 0.45, z, Math.PI / 2);
    if (sides.includes("e")) chair(x + w / 2 + 0.45, z, -Math.PI / 2);
  };
  const hearth = (x, z, alongX) => {
    const w = alongX ? 1.8 : 0.9;
    const d = alongX ? 0.9 : 1.8;
    solid(w, 1.4, d, x, 0.7, z, 0x7a6a5a);
    pieces.push(
      box(
        alongX ? 0.9 : 0.5,
        0.55,
        alongX ? 0.5 : 0.9,
        x + (alongX ? 0 : Math.sign(-x) * 0.25),
        0.4,
        z + (alongX ? Math.sign(-z) * 0.25 : 0),
        0x2a1d14,
      ),
    );
    glows.push({
      x: x + (alongX ? 0 : Math.sign(-x) * 0.5),
      z: z + (alongX ? Math.sign(-z) * 0.5 : 0),
      y: 0.5,
      colour: 0xff8a3a,
    });
  };
  const shelf = (x, z, alongX, goods = true) => {
    const w = alongX ? 1.8 : 0.4;
    const d = alongX ? 0.4 : 1.8;
    // The kit's bookcase faces +z; along a side wall it turns to face the room.
    const angle = alongX ? (z > 0 ? Math.PI : 0) : x < 0 ? Math.PI / 2 : -Math.PI / 2;
    solid(w, 1.9, d, x, 0.95, z, DARK_WOOD, {
      name: goods ? "bookcase-2" : "cabinet",
      angle,
      scale: goods ? [1.8 / 1.46, 1.9 / 2.54, 1] : 1,
    });
    if (!goods) return;
    for (let level = 0; level < 3; level++) {
      for (let i = 0; i < 4; i++) {
        const offset = -0.65 + i * 0.43;
        furniture.push(
          box(0.26, 0.24, 0.26, x + (alongX ? offset : 0), 0.55 + level * 0.55, z + (alongX ? 0 : offset), pick(GOODS)),
        );
      }
    }
  };
  const barrel = (x, z) => {
    furniture.push(painted(new CylinderGeometry(0.32, 0.32, 0.9, 8).translate(x, 0.45, z), 0x8a5a35));
    kit(random() < 0.4 ? "barrel-apples" : "barrel", x, z, { angle: random() * 6.28 });
    boxes.push({ minX: x - 0.32, maxX: x + 0.32, minZ: z - 0.32, maxZ: z + 0.32 });
  };
  const rug = (x, z, w, d) => pieces.push(box(w, 0.02, d, x, 0.02, z, pick(CLOTH)));

  // The room: floor, four walls with a doorway in the front one, and a closed door in it.
  const stoneFloor = kind === "temple" || kind === "hall" || kind === "smithy";
  pieces.push(box(width, 0.1, depth, 0, -0.05, 0, stoneFloor ? FLAGSTONE : PLANK));
  const wallColor = new Color(door.spec.wallColor).lerp(new Color(0xf2ead8), 0.55).getHex();
  const walls = [
    { normal: [0, -1], mesh: box(width + WALL * 2, WALL_HEIGHT, WALL, 0, WALL_HEIGHT / 2, -hz - WALL / 2, wallColor) },
    { normal: [-1, 0], mesh: box(WALL, WALL_HEIGHT, depth, -hx - WALL / 2, WALL_HEIGHT / 2, 0, wallColor) },
    { normal: [1, 0], mesh: box(WALL, WALL_HEIGHT, depth, hx + WALL / 2, WALL_HEIGHT / 2, 0, wallColor) },
    {
      normal: [0, 1],
      mesh: mergeGeometries([
        box(
          hx - DOOR_WIDTH / 2 + WALL,
          WALL_HEIGHT,
          WALL,
          -(hx + DOOR_WIDTH / 2 + WALL) / 2,
          WALL_HEIGHT / 2,
          hz + WALL / 2,
          wallColor,
        ),
        box(
          hx - DOOR_WIDTH / 2 + WALL,
          WALL_HEIGHT,
          WALL,
          (hx + DOOR_WIDTH / 2 + WALL) / 2,
          WALL_HEIGHT / 2,
          hz + WALL / 2,
          wallColor,
        ),
        box(DOOR_WIDTH, WALL_HEIGHT - DOOR_HEIGHT, WALL, 0, (WALL_HEIGHT + DOOR_HEIGHT) / 2, hz + WALL / 2, wallColor),
        box(DOOR_WIDTH, DOOR_HEIGHT, 0.08, 0, DOOR_HEIGHT / 2, hz + 0.02, DOOR),
      ]),
    },
  ];
  boxes.push(
    { minX: -hx - 1, maxX: hx + 1, minZ: -hz - 1, maxZ: -hz },
    { minX: -hx - 1, maxX: -hx, minZ: -hz - 1, maxZ: hz + 1 },
    { minX: hx, maxX: hx + 1, minZ: -hz - 1, maxZ: hz + 1 },
    { minX: -hx - 1, maxX: hx + 1, minZ: hz, maxZ: hz + 1 },
  );

  // Furniture for the kind of building, kept clear of the doorway (the front 1.6 m in the middle).
  const back = -hz + 0.5;
  if (kind === "tavern") {
    solid(Math.min(width - 2, 5), 1.05, 0.6, -0.4, 0.52, back + 0.5, DARK_WOOD); // the bar
    for (let i = 0; i < 3; i++) chair(-2 + i * 1.3, back + 1.25, Math.PI, false);
    // Bottles on a shelf behind the bar, and mugs on it.
    kit("shelf-small-bottles", -0.4, -hz + 0.18, { y: 1.45, scale: 1.2 });
    for (let i = 0; i < 3; i++)
      kit("mug", -1.8 + i * 1.2 + random() * 0.4, back + 0.45, { y: 1.05, angle: random() * 6.28 });
    barrel(hx - 0.5, back);
    barrel(hx - 0.5, back + 0.75);
    dining(-hx + 1.6, 0.4, 1.2, 0.8, "nsw");
    dining(hx - 1.8, 0.6, 1.2, 0.8, "nse");
    hearth(-hx + 0.45, back + 0.6, false);
  } else if (kind === "shop") {
    solid(Math.min(width - 2.5, 4), 1, 0.6, 0, 0.5, back + 1.4, WOOD); // the counter
    kit(pick(["farmcrate-apple", "farmcrate-carrot"]), -0.6, back + 1.4, { y: 1 });
    kit("coin-pile", 0.5, back + 1.35, { y: 1 });
    shelf(-hx + 0.3, -0.4, false);
    shelf(hx - 0.3, -0.4, false);
    shelf(-1, back, true);
    shelf(1, back, true);
    barrel(-hx + 0.5, hz - 1.2);
    solid(0.6, 0.6, 0.6, hx - 0.6, 0.3, hz - 1.2, 0xa8865a, { name: "crate-wooden", scale: 0.7 });
    chair(1.4, back + 0.75, Math.PI, false);
  } else if (kind === "smithy") {
    solid(1.6, 1, 1.2, -hx + 1, 0.5, back + 0.7, 0x6a5a4a); // the forge
    glows.push({ x: -hx + 1, z: back + 0.7, y: 1.1, colour: 0xff6a20 });
    pieces.push(box(1, 0.1, 0.7, -hx + 1, 1.02, back + 0.7, 0xff7a2a));
    solid(0.7, 0.75, 0.35, 0.6, 0.38, -0.2, 0x3a3d40, { name: "anvil", scale: 1.1 }); // the anvil
    table(hx - 1.2, back + 0.6, 1.8, 0.7, "workbench");
    kit("weaponstand", -hx + 0.8, hz - 2, { angle: Math.PI / 2 });
    kit("bucket-wooden-1", -0.2, 0.3);
    barrel(hx - 0.5, hz - 1.2);
    barrel(-hx + 0.5, hz - 1.2);
  } else if (kind === "temple") {
    solid(2, 1.1, 0.8, 0, 0.55, back + 0.5, 0xe8e2d4); // the altar
    for (const x of [-1.5, 1.5]) kit("candlestick-stand", x, back + 0.5);
    for (const x of [-0.7, 0.7]) {
      pieces.push(box(0.08, 0.3, 0.08, x, 1.25, back + 0.5, 0xf4efe2));
      glows.push({ x, z: back + 0.5, y: 1.45, colour: 0xffd27a, small: true });
    }
    for (let row = 0; row < Math.floor((depth - 3) / 1.2); row++) {
      const z = back + 2 + row * 1.2;
      for (const side of [-1, 1]) {
        const x = side * (DOOR_WIDTH / 2 + 0.4 + Math.min(1.6, hx - 1.4) / 2);
        kit("bench", x, z, { angle: Math.PI, scale: [Math.min(3.2, hx * 2 - 2.8) / 2 / 2.78, 0.9, 0.85] });
        furniture.push(
          box(
            Math.min(1.6, hx - 1.4) * 2 > 0 ? Math.min(3.2, hx * 2 - 2.8) / 2 : 1,
            0.06,
            0.4,
            x,
            SEAT_HEIGHT - 0.03,
            z,
            WOOD,
          ),
        );
        furniture.push(box(Math.min(3.2, hx * 2 - 2.8) / 2, 0.5, 0.06, x, 0.72, z - 0.22, WOOD));
        boxes.push({ minX: x - 0.7, maxX: x + 0.7, minZ: z - 0.25, maxZ: z + 0.2 });
        seats.push({ x, z, angle: Math.PI, approach: { x, z: z + 0.6 }, height: SEAT_HEIGHT, taken: null });
      }
    }
    rug(0, 0.5, DOOR_WIDTH + 0.2, depth - 2);
  } else if (kind === "hall") {
    const length = Math.min(width - 3, 6);
    table(0, -0.6, length, 1);
    for (let i = 0; i < Math.floor(length / 1.2); i++) {
      const x = -length / 2 + 0.6 + i * 1.2;
      chair(x, -1.55, 0);
      chair(x, 0.35, Math.PI);
    }
    for (const x of [-hx + 1, hx - 1]) {
      furniture.push(box(0.8, 1.6, 0.05, x, 1.9, -hz + 0.03, pick(CLOTH)));
      kit("banner-1", x, -hz + 0.12, { y: 0.4, scale: 0.8 });
    }
    shelf(-hx + 0.3, hz - 1.6, false, false);
  } else {
    // A home: bed, table and chairs, hearth, a chest and a rug.
    // The kit's bed is 1.9 × 2.4 m, its head at -z: drawn a little smaller to fit.
    solid(1.1, 0.5, 2, hx - 0.65, 0.25, back + 0.6, DARK_WOOD, {
      name: pick(["bed-twin1", "bed-twin2"]),
      scale: [0.62, 0.9, 0.85],
    });
    furniture.push(box(1, 0.12, 1.5, hx - 0.65, 0.56, back + 0.85, pick(CLOTH)));
    furniture.push(box(0.8, 0.12, 0.35, hx - 0.65, 0.58, back - 0.15, 0xf0ece0));
    kit("bucket-wooden-1", -hx + 1.2, back + 1.4);
    kit("pot-1", -hx + 0.95, back + 1.9);
    dining(-0.6, 0.2, 1, 0.75, random() < 0.5 ? "ns" : "nsw");
    hearth(-hx + 0.45, back + 0.4, false);
    solid(0.9, 0.5, 0.5, hx - 0.55, 0.25, hz - 1.4, WOOD, { name: "chest-wood", angle: -Math.PI / 2, scale: 0.7 });
    rug(-0.6, 0.2, 2.4, 1.8);
    shelf(0.6, back, true, random() < 0.7);
  }

  const scene = new Scene();
  scene.background = new Color(0x15100c);
  scene.add(new HemisphereLight(0xfff0dc, 0x3a2a1c, 1.1));
  const lamp = new PointLight(0xffd3a0, 14, 18, 1.4);
  lamp.position.set(0, 2.6, 0);
  scene.add(lamp);
  for (const glow of glows) {
    pieces.push(
      box(
        glow.small ? 0.08 : 0.4,
        glow.small ? 0.12 : 0.25,
        glow.small ? 0.08 : 0.4,
        glow.x,
        glow.y,
        glow.z,
        glow.colour,
      ),
    );
    if (!glow.small) {
      const fire = new PointLight(glow.colour, 6, 7, 1.6);
      fire.position.set(glow.x, glow.y + 0.3, glow.z);
      scene.add(fire);
    }
  }
  const material = new MeshLambertMaterial({ vertexColors: true, flatShading: true });
  scene.add(new Mesh(mergeGeometries(pieces), material));
  const furnitureMesh = furniture.length ? new Mesh(mergeGeometries(furniture), material) : null;
  if (furnitureMesh) scene.add(furnitureMesh);
  const wallMeshes = walls.map((wall) => {
    const mesh = new Mesh(wall.mesh, material);
    scene.add(mesh);
    return { mesh, normal: wall.normal };
  });
  // The grid tells shapes apart by id.
  const collider = createCollider(
    [],
    boxes.map((shape, id) => ({ id, ...shape })),
  );
  // Where to stand before sitting: in front of the seat if that's clear, else beside it or behind it (a
  // chair at a table faces the table).
  for (const seat of seats) {
    const fx = Math.sin(seat.angle);
    const fz = Math.cos(seat.angle);
    const spots = [
      [fx * 0.65, fz * 0.65],
      [fz * 0.6, -fx * 0.6],
      [-fz * 0.6, fx * 0.6],
      [-fx * 0.7, -fz * 0.7],
    ].map(([dx, dz]) => ({ x: seat.x + dx, z: seat.z + dz }));
    seat.approach = spots.find((spot) => !collider.insideBox(spot.x, spot.z, 0.15)) ?? spots[0];
  }

  return {
    scene,
    kind,
    halfWidth: hx,
    halfDepth: hz,
    entry: { x: 0, z: hz - 0.8, angle: Math.PI },
    exit: { x: 0, z: hz - 0.6 },
    seats,
    doors: [],
    resolveCollisions: (position, radius) => collider.resolve(position, radius),
    clearSight: () => 1,
    blocked: (x, z, margin = 0.3) => collider.insideBox(x, z, margin),
    /** Hides each wall the camera is outside of, so it never blocks the view of the player. */
    update(dt, camera) {
      for (const wall of wallMeshes) {
        const [nx, nz] = wall.normal;
        const outside = nx ? camera.position.x * nx > hx : camera.position.z * nz > hz;
        wall.mesh.visible = !outside;
      }
    },
    /** The kit props every room might use, for loading. */
    propNames: [...new Set(slots.map((slot) => slot.model))],
    /** Swaps the simple furniture for kit props once they've loaded (`models`: name → parts). */
    addProps(models) {
      if (slots.some((slot) => !models.has(slot.model))) return; // something missing: keep the simple ones
      if (furnitureMesh) furnitureMesh.visible = false;
      for (const slot of slots) {
        for (const { geometry, material: kitMaterial } of models.get(slot.model)) {
          const mesh = new Mesh(geometry, kitMaterial);
          mesh.position.set(slot.x, slot.y, slot.z);
          mesh.rotation.y = slot.angle;
          mesh.scale.set(...slot.scale);
          scene.add(mesh);
        }
      }
    },
    setTime: () => 0,
    setDrawDistance() {},
    dispose() {
      scene.traverse((object) => {
        // Kit geometry and materials are shared (kit.js keeps them).
        if (!object.geometry?.userData.shared) object.geometry?.dispose();
        if (!object.material?.userData?.shared) object.material?.dispose?.();
      });
    },
  };
}
