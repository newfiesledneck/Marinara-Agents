// Buildings from the Medieval Village MegaKit (Quaternius, CC0; kit/village/): a building's spec (from
// buildings.js) assembled from the kit's 2 m wall segments, window and door inserts, corner posts, a
// round-tile roof sized to the footprint with brick gables, and now and then a chimney, a balcony or a
// tower. Town buildings snap to the kit's grid (buildings.js), so the kit building has exactly the
// simple one's footprint, door and collision box, and either can stand in for the other.
//
// Every piece is placed in the building's own space: front (and door) facing +z, width along x.
import { Matrix4, Quaternion, Vector3 } from "three";
import { rng } from "./world.js";

const STOREY = 3.12; // the kit's wall height
/** A wall piece's outside face, in front of its origin. */
export const WALL_FACE = 0.09;
/** Where ivy hangs from on a wall piece: high up, on its outside face. */
const IVY_HOLD = new Matrix4().makeTranslation(0, 2.6, WALL_FACE + 0.05);
/** Roof spans (across the ridge) and lengths (along it) the kit has. */
const ROOFS = { 4: [4, 6, 8], 6: [4, 6, 8, 10, 12, 14], 8: [8, 10, 12, 14] };

/** The kit's door (world.js hangs and swings it; it isn't one of a building's fixed pieces). */
export const DOOR_PIECE = "door-1-round";

/** Every kit piece a building might use, and its door, for loading. */
export const HOUSE_PIECES = [
  DOOR_PIECE,
  "wall-unevenbrick-straight",
  "wall-unevenbrick-window-wide-round",
  "wall-unevenbrick-door-round",
  "wall-plaster-straight",
  "wall-plaster-woodgrid",
  "wall-plaster-window-wide-round",
  "wall-plaster-window-thin-round",
  "wall-plaster-door-round",
  "corner-exterior-wood",
  "window-wide-round1",
  "window-thin-round1",
  "windowshutters-wide-round-open",
  "doorframe-round-wooddark",
  ...Object.entries(ROOFS).flatMap(([span, lengths]) => lengths.map((length) => `roof-roundtiles-${span}x${length}`)),
  "roof-front-brick4",
  "roof-front-brick6",
  "roof-front-brick8",
  "roof-tower-roundtiles",
  "prop-chimney",
  "balcony-simple-straight",
  "prop-vine1",
  "prop-vine4",
];

/** Whether the kit can roof a footprint of `width` × `depth` (both even metres). */
export function kitFits(width, depth) {
  const span = Math.min(width, depth);
  return ROOFS[span]?.includes(Math.max(width, depth)) ?? false;
}

const place = (x, y, z, angle = 0, scale = 1) =>
  new Matrix4().compose(
    new Vector3(x, y, z),
    new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), angle),
    new Vector3(scale, scale, scale),
  );

/**
 * The kit pieces for one building: [{ model, matrix }] in the building's space. `doorX` is the door's
 * segment centre on the front; `seed` makes the same building come out the same every time.
 */
export function housePieces(spec, doorX, seed) {
  const random = rng(seed);
  const pieces = [];
  const add = (model, matrix) => pieces.push({ model, matrix });
  const { width, depth } = spec;
  const hx = width / 2;
  const hz = depth / 2;
  const brickBase = spec.walls === "stone" || spec.walls === "brick";
  const timber = spec.walls === "timber";

  /** Walls round one storey of a box (x0…x1, z0…z1) at height y; `front` says which side has the door. */
  function storey(x0, x1, z0, z1, y, level, withDoor) {
    const sides = [
      // [segment positions, fixed coordinate, angle, which side]
      { along: "x", from: x0, to: x1, at: z1 - WALL_FACE, angle: 0, front: true },
      { along: "x", from: x0, to: x1, at: z0 + WALL_FACE, angle: Math.PI, front: false },
      { along: "z", from: z0, to: z1, at: x0 + WALL_FACE, angle: -Math.PI / 2, front: false },
      { along: "z", from: z0, to: z1, at: x1 - WALL_FACE, angle: Math.PI / 2, front: false },
    ];
    for (const side of sides) {
      for (let c = side.from + 1; c < side.to; c += 2) {
        const x = side.along === "x" ? c : side.at;
        const z = side.along === "x" ? side.at : c;
        const ground = level === 0;
        const material = ground && brickBase ? "unevenbrick" : "plaster";
        const isDoor = withDoor && side.front && ground && Math.abs(c - doorX) < 0.01;
        const matrix = place(x, y, z, side.angle);
        if (isDoor) {
          add(`wall-${material}-door-round`, matrix);
          add("doorframe-round-wooddark", matrix);
          continue;
        }
        const windowChance = side.front ? 0.7 : 0.45;
        if (random() < windowChance) {
          const thin = material === "plaster" && random() < 0.3;
          add(`wall-${material}-window-${thin ? "thin" : "wide"}-round`, matrix);
          add(thin ? "window-thin-round1" : "window-wide-round1", matrix);
          if (!thin && spec.shutters && side.front && random() < 0.6) add("windowshutters-wide-round-open", matrix);
        } else {
          add(`wall-${material}-straight`, matrix);
          // Timber framing is only the beams: it goes over a plain plaster wall.
          if (material === "plaster" && (timber || !ground) && random() < 0.6) add("wall-plaster-woodgrid", matrix);
          // Ivy on a bare ground-floor wall, now and then: the kit's vines hang down from their origin, so
          // it goes up near the eaves and out onto the wall's face.
          else if (ground && random() < 0.25) {
            add(random() < 0.6 ? "prop-vine1" : "prop-vine4", matrix.clone().multiply(IVY_HOLD));
          }
        }
      }
    }
    for (const [x, z] of [
      [x0, z0],
      [x1, z0],
      [x0, z1],
      [x1, z1],
    ]) {
      add("corner-exterior-wood", place(x, y, z));
    }
  }

  for (let level = 0; level < spec.floors; level++) storey(-hx, hx, -hz, hz, level * STOREY, level, true);
  const top = spec.floors * STOREY;

  // The roof: its span across the narrower side, the ridge along the longer; brick gables close the ends.
  const span = Math.min(width, depth);
  const length = Math.max(width, depth);
  const ridgeAlongX = width > depth;
  add(`roof-roundtiles-${span}x${length}`, place(0, top, 0, ridgeAlongX ? Math.PI / 2 : 0));
  for (const end of [-1, 1]) {
    const gable = `roof-front-brick${span}`;
    if (ridgeAlongX) add(gable, place(end * (hx - WALL_FACE), top, 0, (end * Math.PI) / 2));
    else add(gable, place(0, top, end * (hz - WALL_FACE), end > 0 ? 0 : Math.PI));
  }

  if (spec.chimney) {
    const side = random() < 0.5 ? -1 : 1;
    const along = ridgeAlongX ? [side * (hx - 1.5), -hz / 3] : [-hx / 3, side * (hz - 1.5)];
    add("prop-chimney", place(along[0], top + 0.4, along[1]));
  }
  if (spec.balcony && spec.floors > 1) {
    const segment = doorX + (doorX > 0 ? -2 : 2);
    if (Math.abs(segment) < hx) add("balcony-simple-straight", place(segment, STOREY, hz - WALL_FACE));
  }
  if (spec.tower) {
    // A 4 m square tower at the back corner, two storeys above the roof line, under a tower roof.
    const x0 = hx - 4;
    const z0 = -hz;
    const storeys = spec.floors + 2;
    for (let level = spec.floors; level < storeys; level++) storey(x0, hx, z0, z0 + 4, level * STOREY, level, false);
    add("roof-tower-roundtiles", place(x0 + 2, storeys * STOREY, z0 + 2));
  }
  return pieces;
}
