// The parts kit: buildings and town props assembled from low-poly parts, all vertex-coloured so a whole
// town merges into one mesh (one draw call).
//
// A building is a spec (what it is and how it looks) and the code that builds it. The seed chooses specs
// for now; later the world brief chooses them from the same menus (docs/CONCEPT.md, S2), so the model
// decides what a building is and looks like, and this code decides how it's put together.
import {
  BoxGeometry,
  BufferGeometry,
  Color,
  CylinderGeometry,
  Float32BufferAttribute,
  IcosahedronGeometry,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export const FLOOR_HEIGHT = 3.2;

/** The menus a spec chooses from. The world brief will choose from these same lists. */
export const KINDS = ["home", "shop", "tavern", "smithy", "temple", "hall"];
export const ROOFS = ["gable", "hip", "flat"];
export const WALLS = ["plaster", "timber", "stone", "brick", "planks"];

const PLASTER = [0xe8dcc4, 0xeadfc8, 0xd9c3a0, 0xe3d3b5, 0xd8cfc0, 0xc9d1c8, 0xe6c9b0];
const PLANKS = [0x9a7b55, 0x8a6a45, 0xa88a62, 0x7d6448];
const STONE = [0xa8a49a, 0x9a9a94, 0xb3ab9c, 0x8f8c84];
const BRICK = [0xa65a45, 0x9a4e3c, 0xb06a50, 0x8c4a3a];
const ROOF = [0x9c4a3a, 0x7a3b2e, 0x5b4a6b, 0x4a5d6b, 0x6b5b3a, 0x8a6a3a, 0x3f4a52];
const ACCENT = [0x4a6b8a, 0x6b8a4a, 0x8a4a4a, 0x8a7a3a, 0x5a4a7a, 0x3f6f6a];
const BEAM = 0x4a3526;
const TRIM = 0xefe9dd;
const GLASS = 0x3b4a5a;
/** Doors: the swinging panel (world.js), and the dark doorway it opens onto. */
export const DOOR = 0x5a3b26;
export const DOOR_WIDTH = 1.1;
export const DOOR_HEIGHT = 2.2;
/** How far in front of the wall the closed door panel sits (its middle). */
export const DOOR_INSET = 0.17;
const DOORWAY = 0x1c1612;
const IRON = 0x2f3438;
const WOOD = 0x8a6440;
const LEAF = 0x5a8a45;
const FLOWER = [0xd8506a, 0xe0b040, 0xb070d0, 0xf0f0f0];

const pick = (random, list) => list[Math.floor(random() * list.length)];

// ── Geometry helpers ─────────────────────────────────────────────────────────

/** Non-indexed position + normal + colour, the one layout every merged piece shares. */
export function painted(geometry, hex) {
  const flat = geometry.index ? geometry.toNonIndexed() : geometry;
  flat.deleteAttribute("uv");
  if (!flat.attributes.normal) flat.computeVertexNormals();
  const color = new Color(hex);
  const colors = new Float32Array(flat.attributes.position.count * 3);
  for (let i = 0; i < flat.attributes.position.count; i++) color.toArray(colors, i * 3);
  flat.setAttribute("color", new Float32BufferAttribute(colors, 3));
  return flat;
}

export function box(width, height, depth, x, y, z, hex) {
  return painted(new BoxGeometry(width, height, depth).translate(x, y, z), hex);
}

/**
 * A roof with its ridge along x over a `width` × `depth` rectangle, `height` from eave to ridge. A gable
 * has upright triangular ends; a hip slopes on all four sides (a pyramid when it is square).
 */
export function slopedRoof(width, depth, height, hip) {
  const w = width / 2;
  const d = depth / 2;
  const r = hip ? Math.max(0, w - d) : w; // half the ridge's length
  // prettier-ignore
  const positions = [
    -w, 0, d,    w, 0, d,    r, height, 0,    -w, 0, d,    r, height, 0,   -r, height, 0, // +z slope
    w, 0, -d,   -w, 0, -d,  -r, height, 0,     w, 0, -d,  -r, height, 0,    r, height, 0, // -z slope
    w, 0, d,     w, 0, -d,   r, height, 0, // +x end
    -w, 0, -d,  -w, 0, d,   -r, height, 0, // -x end
  ];
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  return geometry;
}

// ── Specs ────────────────────────────────────────────────────────────────────

/**
 * A building's look, chosen from the menus. `width` runs along its street front (x), `depth` back from it
 * (z). Unknown or missing choices fall back to the kind's defaults, so a brief can never break a building.
 */
export function makeSpec(random, kind, { width, depth } = {}) {
  const chance = (p) => random() < p;
  const spec = {
    kind: KINDS.includes(kind) ? kind : "home",
    width: width ?? 5 + random() * 3,
    depth: depth ?? 5 + random() * 2.5,
    floors: chance(0.35) ? 2 : 1,
    roof: chance(0.25) ? "hip" : "gable",
    walls: pick(random, ["plaster", "plaster", "timber", "planks", "stone", "brick"]),
    roofColor: pick(random, ROOF),
    accentColor: pick(random, ACCENT),
    chimney: chance(0.6),
    porch: chance(0.3),
    balcony: false,
    shutters: chance(0.5),
    flowerBoxes: chance(0.4),
    awning: false,
    sign: false,
    shopWindow: false,
    tower: false,
  };
  if (spec.kind === "shop") {
    Object.assign(spec, {
      floors: 2,
      porch: false,
      awning: true,
      sign: true,
      shopWindow: true,
      flowerBoxes: chance(0.6),
    });
    spec.walls = pick(random, ["plaster", "timber", "brick"]);
  } else if (spec.kind === "tavern") {
    Object.assign(spec, {
      floors: chance(0.5) ? 3 : 2,
      walls: "timber",
      sign: true,
      chimney: true,
      balcony: true,
      porch: false,
    });
  } else if (spec.kind === "smithy") {
    Object.assign(spec, {
      floors: 1,
      walls: "stone",
      chimney: true,
      awning: true,
      shutters: false,
      porch: false,
      flowerBoxes: false,
    });
  } else if (spec.kind === "temple") {
    Object.assign(spec, {
      floors: 2,
      walls: "stone",
      roof: "gable",
      tower: true,
      chimney: false,
      shutters: false,
      porch: false,
      flowerBoxes: false,
    });
  } else if (spec.kind === "hall") {
    Object.assign(spec, {
      floors: chance(0.5) ? 3 : 2,
      walls: pick(random, ["stone", "brick"]),
      roof: "hip",
      tower: chance(0.5),
      balcony: true,
      porch: false,
      shutters: false,
      chimney: false,
    });
  }
  if (spec.floors < 2) spec.balcony = false;
  spec.wallColor =
    spec.walls === "stone"
      ? pick(random, STONE)
      : spec.walls === "brick"
        ? pick(random, BRICK)
        : spec.walls === "planks"
          ? pick(random, PLANKS)
          : pick(random, PLASTER);
  return spec;
}

// ── Building ─────────────────────────────────────────────────────────────────

/** A window on the +z face at (x, y): frame, glass and sill, with shutters and a flower box if the spec has them. */
function windowParts(pieces, random, spec, x, y, z, { wide = false, tall = false } = {}) {
  const w = wide ? 2.2 : 1;
  const h = tall ? 2 : 1.2;
  const frame = spec.walls === "brick" || spec.walls === "stone" ? TRIM : spec.walls === "timber" ? BEAM : TRIM;
  pieces.push(box(w + 0.2, h + 0.2, 0.08, x, y, z + 0.04, frame));
  pieces.push(box(w, h, 0.1, x, y, z + 0.06, GLASS));
  pieces.push(box(w + 0.35, 0.1, 0.22, x, y - h / 2 - 0.12, z + 0.11, frame));
  if (spec.shutters && !wide) {
    for (const side of [-1, 1])
      pieces.push(box(0.42, h, 0.06, x + side * (w / 2 + 0.33), y, z + 0.05, spec.accentColor));
  }
  if (spec.flowerBoxes && !wide && random() < 0.7) {
    pieces.push(box(w + 0.1, 0.25, 0.3, x, y - h / 2 - 0.32, z + 0.17, WOOD));
    pieces.push(box(w, 0.18, 0.24, x, y - h / 2 - 0.14, z + 0.17, pick(random, FLOWER)));
  }
}

/** The details that make a wall material read: beams, planks, corner stones or a cornice. */
function wallDetail(pieces, random, spec, width, depth, height) {
  const w = width / 2;
  const d = depth / 2;
  if (spec.walls === "timber") {
    for (const z of [d + 0.03, -d - 0.03]) {
      for (let x = -w; x <= w + 0.01; x += width / Math.max(2, Math.round(width / 2.4))) {
        pieces.push(box(0.18, height, 0.08, x, height / 2, z, BEAM));
      }
    }
    for (const x of [w + 0.03, -w - 0.03])
      pieces.push(
        box(0.08, height, 0.18, x, height / 2, d - 0.09, BEAM),
        box(0.08, height, 0.18, x, height / 2, -d + 0.09, BEAM),
      );
    for (let floor = 1; floor <= spec.floors; floor++) {
      const y = floor * FLOOR_HEIGHT - 0.1;
      pieces.push(
        box(width + 0.1, 0.18, 0.08, 0, y, d + 0.04, BEAM),
        box(width + 0.1, 0.18, 0.08, 0, y, -d - 0.04, BEAM),
      );
      pieces.push(
        box(0.08, 0.18, depth + 0.1, w + 0.04, y, 0, BEAM),
        box(0.08, 0.18, depth + 0.1, -w - 0.04, y, 0, BEAM),
      );
    }
  } else if (spec.walls === "planks") {
    const shade = new Color(spec.wallColor).multiplyScalar(0.82).getHex();
    for (let y = 0.9; y < height; y += 0.6) {
      pieces.push(box(width + 0.06, 0.06, depth + 0.06, 0, y, 0, shade));
    }
  } else if (spec.walls === "stone") {
    const quoin = new Color(spec.wallColor).multiplyScalar(1.12).getHex();
    let row = 0;
    for (let y = 0.9; y < height - 0.3; y += 0.55, row++) {
      const long = row % 2 === 0;
      for (const sx of [-1, 1]) {
        for (const sz of [-1, 1]) {
          pieces.push(
            box(
              long ? 0.7 : 0.4,
              0.45,
              long ? 0.4 : 0.7,
              sx * (w - (long ? 0.3 : 0.15)),
              y,
              sz * (d - (long ? 0.15 : 0.3)),
              quoin,
            ),
          );
        }
      }
    }
  }
  if (spec.walls === "brick" || spec.walls === "stone") {
    pieces.push(box(width + 0.3, 0.3, depth + 0.3, 0, height - 0.15, 0, TRIM)); // cornice under the roof
  }
}

function roofParts(pieces, random, spec, width, depth, height) {
  const overhang = 0.4;
  if (spec.roof === "flat") {
    pieces.push(box(width + 0.1, 0.2, depth + 0.1, 0, height + 0.1, 0, spec.roofColor));
    for (const [w, d, x, z] of [
      [width + 0.3, 0.3, 0, depth / 2],
      [width + 0.3, 0.3, 0, -depth / 2],
      [0.3, depth + 0.3, width / 2, 0],
      [0.3, depth + 0.3, -width / 2, 0],
    ]) {
      pieces.push(box(w, 0.6, d, x, height + 0.3, z, spec.wallColor));
    }
    return height + 0.6;
  }
  const rise = Math.min(width, depth) * (spec.roof === "hip" ? 0.32 : 0.42 + random() * 0.12);
  pieces.push(
    painted(
      slopedRoof(width + overhang * 2, depth + overhang * 2, rise, spec.roof === "hip").translate(0, height, 0),
      spec.roofColor,
    ),
  );
  if (spec.roof === "gable") {
    // The gable ends are wall, not roof.
    const gable = slopedRoof(width, depth, rise - 0.02, false);
    const keepEnds = new BufferGeometry();
    keepEnds.setAttribute("position", new Float32BufferAttribute(gable.attributes.position.array.slice(36), 3));
    keepEnds.computeVertexNormals();
    pieces.push(painted(keepEnds.translate(0, height, 0), spec.walls === "timber" ? spec.wallColor : spec.wallColor));
  }
  return height + rise;
}

/**
 * Builds a building from its spec, facing +z (its street front) with its long side along x, centred on
 * the origin and standing on y = 0. Returns the merged geometry, where its door is (local x on the front)
 * and its footprint (for collision, including a tower or porch).
 */
export function buildBuilding(random, spec) {
  const { width, depth, floors } = spec;
  const height = floors * FLOOR_HEIGHT;
  const d = depth / 2;
  const pieces = [];
  // Body and a darker plinth it stands on.
  pieces.push(box(width, height, depth, 0, height / 2, 0, spec.wallColor));
  const plinth = new Color(spec.walls === "stone" ? spec.wallColor : 0x8a8478).multiplyScalar(0.85).getHex();
  pieces.push(
    box(
      width + 0.2,
      spec.walls === "stone" ? 0.8 : 0.45,
      depth + 0.2,
      0,
      spec.walls === "stone" ? 0.4 : 0.22,
      0,
      plinth,
    ),
  );
  wallDetail(pieces, random, spec, width, depth, height);

  // The door's frame, a dark doorway behind it and the step; a shop's door sits to one side of its window.
  // The door itself is separate (world.js) so it can swing open.
  const doorX = spec.shopWindow ? width / 2 - 1.4 : (random() - 0.5) * Math.max(0, width - 3);
  pieces.push(box(1.45, 2.45, 0.1, doorX, 1.22, d + 0.05, spec.walls === "timber" ? BEAM : TRIM));
  pieces.push(box(DOOR_WIDTH, DOOR_HEIGHT, 0.04, doorX, DOOR_HEIGHT / 2, d + 0.11, DOORWAY));
  pieces.push(box(1.7, 0.18, 0.7, doorX, 0.09, d + 0.35, plinth));

  // Windows: a row per floor on the front and back, one or two on each side.
  const perFloor = Math.max(1, Math.round(width / 2.7));
  const tall = spec.kind === "temple";
  for (let floor = 0; floor < floors; floor++) {
    const y = floor * FLOOR_HEIGHT + (tall ? 1.9 : 1.75);
    for (let i = 0; i < perFloor; i++) {
      const x = -width / 2 + (width / perFloor) * (i + 0.5);
      const clearOfDoor = Math.abs(x - doorX) > 1.6;
      if (floor === 0 && spec.shopWindow && x < doorX - 1.2) {
        if (i === 0)
          windowParts(pieces, random, spec, -width / 2 + (doorX - 1.2 + width / 2) / 2, 1.5, d, { wide: true });
      } else if (floor > 0 || clearOfDoor) {
        windowParts(pieces, random, spec, x, y, d, { tall });
      }
      const back = [];
      windowParts(back, random, { ...spec, flowerBoxes: false }, x, y, d, { tall });
      for (const piece of back) pieces.push(piece.rotateY(Math.PI));
    }
    if (depth >= 5.5) {
      for (const side of [1, -1]) {
        const sidePieces = [];
        windowParts(sidePieces, random, { ...spec, flowerBoxes: false }, 0, y, width / 2, { tall });
        for (const piece of sidePieces) pieces.push(piece.rotateY((side * Math.PI) / 2));
      }
    }
  }

  const top = roofParts(pieces, random, spec, width, depth, height);
  let footprint = { minX: -width / 2, maxX: width / 2, minZ: -d, maxZ: d };

  if (spec.chimney && spec.roof !== "flat") {
    const cx = (random() < 0.5 ? -1 : 1) * (width / 2 - 0.9);
    const big = spec.kind === "smithy";
    pieces.push(
      box(
        big ? 1 : 0.6,
        top - height + 1.4,
        big ? 1 : 0.6,
        cx,
        height + (top - height + 1.4) / 2,
        -d / 3,
        spec.walls === "brick" ? spec.wallColor : 0x7a6a5a,
      ),
    );
    pieces.push(box(big ? 1.2 : 0.8, 0.15, big ? 1.2 : 0.8, cx, top + 1.45, -d / 3, 0x5a4a3a));
  }
  if (spec.porch) {
    pieces.push(box(2.6, 0.22, 1.8, doorX, 0.11, d + 0.9, WOOD));
    for (const side of [-1, 1]) pieces.push(box(0.15, 2.6, 0.15, doorX + side * 1.15, 1.3, d + 1.65, WOOD));
    pieces.push(box(2.9, 0.12, 2, doorX, 2.65, d + 0.95, spec.roofColor));
    footprint = { ...footprint, maxZ: d + 1.8 };
  }
  if (spec.awning) {
    const span = spec.shopWindow ? width - 0.4 : 3;
    const awning = new BoxGeometry(span, 0.08, 1.4)
      .rotateX(0.35)
      .translate(spec.shopWindow ? 0 : doorX, 2.95, d + 0.62);
    pieces.push(painted(awning, spec.accentColor));
  }
  if (spec.sign) {
    const sx = Math.max(-width / 2 + 0.6, Math.min(width / 2 - 0.6, doorX + (doorX > 0 ? -1.6 : 1.6)));
    pieces.push(box(0.08, 0.08, 1.1, sx, 3.4, d + 0.55, IRON));
    pieces.push(box(0.1, 0.75, 0.95, sx, 2.95, d + 0.75, WOOD));
    pieces.push(box(0.12, 0.45, 0.65, sx, 2.95, d + 0.75, spec.accentColor));
  }
  if (spec.balcony) {
    const y = FLOOR_HEIGHT;
    const span = Math.min(width - 1, 4);
    pieces.push(box(span, 0.18, 1.1, 0, y, d + 0.55, WOOD));
    for (let x = -span / 2; x <= span / 2 + 0.01; x += span / 6)
      pieces.push(box(0.08, 0.9, 0.08, x, y + 0.5, d + 1.05, WOOD));
    pieces.push(box(span, 0.08, 0.1, 0, y + 0.95, d + 1.05, WOOD));
  }
  if (spec.tower) {
    // A square tower at the back corner with a pyramid spire (a temple) or a hip cap with a clock (a hall).
    const size = Math.min(3.6, depth * 0.55);
    const towerHeight = height + FLOOR_HEIGHT * (spec.kind === "temple" ? 2.4 : 1.6);
    const tx = width / 2 - size / 2;
    const tz = -d + size / 2;
    pieces.push(box(size, towerHeight, size, tx, towerHeight / 2, tz, spec.wallColor));
    pieces.push(box(size + 0.3, 0.3, size + 0.3, tx, towerHeight - 0.15, tz, TRIM));
    for (const angle of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
      const opening = box(0.9, 1.6, 0.12, 0, towerHeight - 1.3, size / 2 + 0.04, spec.kind === "temple" ? GLASS : TRIM);
      pieces.push(opening.rotateY(angle).translate(tx, 0, tz));
      if (spec.kind === "hall") {
        const clock = painted(
          new CylinderGeometry(0.55, 0.55, 0.1, 12)
            .rotateX(Math.PI / 2)
            .translate(0, towerHeight - 1.3, size / 2 + 0.12),
          0xf4efe2,
        );
        pieces.push(clock.rotateY(angle).translate(tx, 0, tz));
      }
    }
    const spire = slopedRoof(size + 0.5, size + 0.5, spec.kind === "temple" ? size * 1.6 : size * 0.5, true);
    pieces.push(painted(spire.translate(tx, towerHeight, tz), spec.roofColor));
  }
  return { geometry: mergeGeometries(pieces), doorX, footprint };
}

// ── Town props ───────────────────────────────────────────────────────────────

/** A market stall at the origin facing +z: counter, four poles and a canopy. Footprint 2.6 × 1.8. */
export function marketStall(random) {
  const canopy = pick(random, ACCENT);
  const pieces = [box(2.4, 0.9, 1, 0, 0.45, 0.3, WOOD), box(2.5, 0.08, 1.1, 0, 0.92, 0.3, 0x6a4a30)];
  for (const [x, z] of [
    [-1.2, -0.8],
    [1.2, -0.8],
    [-1.2, 0.8],
    [1.2, 0.8],
  ]) {
    pieces.push(box(0.1, 2.3, 0.1, x, 1.15, z, WOOD));
  }
  pieces.push(painted(new BoxGeometry(2.8, 0.08, 2).rotateX(0.18).translate(0, 2.35, 0), canopy));
  for (let i = 0; i < 3; i++) pieces.push(box(0.4, 0.3, 0.4, -0.7 + i * 0.7, 1.11, 0.3, pick(random, FLOWER))); // goods
  return mergeGeometries(pieces);
}

export function bench() {
  return mergeGeometries([
    box(1.8, 0.08, 0.45, 0, 0.45, 0, WOOD),
    box(1.8, 0.4, 0.08, 0, 0.75, -0.2, WOOD),
    box(0.08, 0.45, 0.4, -0.8, 0.22, 0, IRON),
    box(0.08, 0.45, 0.4, 0.8, 0.22, 0, IRON),
  ]);
}

export function barrel() {
  return mergeGeometries([
    painted(new CylinderGeometry(0.32, 0.32, 0.9, 8).translate(0, 0.45, 0), 0x8a5a35),
    painted(new CylinderGeometry(0.34, 0.34, 0.06, 8).translate(0, 0.2, 0), IRON),
    painted(new CylinderGeometry(0.34, 0.34, 0.06, 8).translate(0, 0.7, 0), IRON),
  ]);
}

export function crate(size = 0.6) {
  return mergeGeometries([
    box(size, size, size, 0, size / 2, 0, 0xa8865a),
    box(size + 0.02, 0.08, size + 0.02, 0, size * 0.5, 0, 0x7a5a3a),
  ]);
}

/** A bush: one squashed low-poly ball. */
export function bush(random, size = 0.8 + random() * 0.6) {
  const shade = new Color(LEAF).multiplyScalar(0.85 + random() * 0.3).getHex();
  return painted(new IcosahedronGeometry(size, 0).scale(1, 0.75, 1).translate(0, size * 0.55, 0), shade);
}

/** A picket fence around a `width` × `depth` lot centred on the origin, with a gap for a gate on +z. */
export function fence(width, depth) {
  const pieces = [];
  const run = (length, x, z, alongX) => {
    for (let t = -length / 2; t <= length / 2 + 0.01; t += 0.7) {
      pieces.push(box(0.08, 0.9, 0.08, alongX ? x + t : x, 0.45, alongX ? z : z + t, 0xe8e2d4));
    }
    pieces.push(box(alongX ? length : 0.06, 0.06, alongX ? 0.06 : length, x, 0.6, z, 0xe8e2d4));
    pieces.push(box(alongX ? length : 0.06, 0.06, alongX ? 0.06 : length, x, 0.3, z, 0xe8e2d4));
  };
  const half = (width - 1.4) / 2;
  run(half, -width / 2 + half / 2, depth / 2, true);
  run(half, width / 2 - half / 2, depth / 2, true);
  run(width, 0, -depth / 2, true);
  run(depth, -width / 2, 0, false);
  run(depth, width / 2, 0, false);
  return mergeGeometries(pieces);
}
