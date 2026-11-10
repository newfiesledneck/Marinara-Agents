// Buildings from the Medieval Village MegaKit (Quaternius, CC0; kit/village/): a building's spec (from
// buildings.js) assembled from the kit's 2 m wall segments, window and door inserts, corner posts, a
// round-tile roof sized to the footprint with brick gables, and now and then a chimney, a balcony or a
// tower. Town buildings snap to the kit's grid (buildings.js), so the kit building has exactly the
// simple one's footprint, door and collision box, and either can stand in for the other.
//
// A building's style (buildings.js `styleFor`, kept on its spec) varies it without moving anything: which
// way the ridge runs, the colour of its tiles and plaster, round or square windows, dormers, a lean-to
// porch, one chimney or the other, how much ivy. A smithy's forge (`spec.bay`) is left open under the
// roof, framed by arches.
//
// Every piece is placed in the building's own space: front (and door) facing +z, width along x.
import { Matrix4, Quaternion, Vector3 } from "three";
import { PORCH_HEIGHT, PORCH_OUT } from "./buildings.js";
import { rng } from "./world.js";

const STOREY = 3.12; // the kit's wall height
/** A wall piece's outside face, in front of its origin. */
export const WALL_FACE = 0.09;
/** Where ivy hangs from on a wall piece: high up, on its outside face. */
const IVY_HOLD = new Matrix4().makeTranslation(0, 2.6, WALL_FACE + 0.05);
/** Roof spans (across the ridge) and lengths (along it) the kit has. */
const ROOFS = { 4: [4, 6, 8], 6: [4, 6, 8, 10, 12, 14], 8: [8, 10, 12, 14] };
/** Each span's tiles: how high the ridge stands above the walls, and how steeply they fall from it. */
const ROOF_SHAPE = { 4: { ridge: 3.73, slope: 1.49 }, 6: { ridge: 4.89, slope: 1.34 }, 8: { ridge: 6, slope: 1.32 } };
/** The dormer: how far its window stands in front of its back, and how far in from the wall it sits. */
const DORMER_DEPTH = 1.9;
const DORMER_INSET = 0.5;
const POST_HEIGHT = 3; // the kit's corner post

/** The kit's door (world.js hangs and swings it; it isn't one of a building's fixed pieces). */
export const DOOR_PIECE = "door-1-round";

/** Every kit piece a building might use, and its door, for loading. */
export const HOUSE_PIECES = [
  DOOR_PIECE,
  "wall-unevenbrick-straight",
  "wall-unevenbrick-window-wide-round",
  "wall-unevenbrick-window-wide-flat",
  "wall-unevenbrick-door-round",
  "wall-plaster-straight",
  "wall-plaster-straight-base",
  "wall-plaster-woodgrid",
  "wall-plaster-window-wide-round",
  "wall-plaster-window-wide-flat",
  "wall-plaster-window-wide-flat2",
  "wall-plaster-window-thin-round",
  "wall-plaster-door-round",
  "wall-arch",
  "corner-exterior-wood",
  "window-wide-round1",
  "window-wide-flat1",
  "window-thin-round1",
  "windowshutters-wide-round-open",
  "windowshutters-wide-flat-open",
  "doorframe-round-wooddark",
  ...Object.entries(ROOFS).flatMap(([span, lengths]) => lengths.map((length) => `roof-roundtiles-${span}x${length}`)),
  "roof-front-brick4",
  "roof-front-brick6",
  "roof-front-brick8",
  "roof-tower-roundtiles",
  "roof-dormer-roundtile",
  "roof-wooden-2x1",
  "roof-wooden-2x1-l",
  "roof-wooden-2x1-r",
  "roof-wooden-2x1-center",
  "prop-chimney",
  "prop-chimney2",
  "balcony-simple-straight",
  "balcony-cross-straight",
  "prop-vine1",
  "prop-vine2",
  "prop-vine4",
];

/** Whether the kit can roof a footprint of `width` × `depth` (both even metres). */
export function kitFits(width, depth) {
  const span = Math.min(width, depth);
  return ROOFS[span]?.includes(Math.max(width, depth)) ?? false;
}

const UP = new Vector3(0, 1, 0);
/** A piece's place: at (x, y, z), turned `angle` about the upright, `scale` a number or [x, y, z]. */
const place = (x, y, z, angle = 0, scale = 1) =>
  new Matrix4().compose(
    new Vector3(x, y, z),
    new Quaternion().setFromAxisAngle(UP, angle),
    Array.isArray(scale) ? new Vector3(...scale) : new Vector3(scale, scale, scale),
  );

/** Where a porch's posts stand along the front (local x), for a porch of `kind` on a building `width` wide. */
export function porchPosts(kind, width, doorX) {
  if (kind === "door") return [doorX - 1, doorX + 1];
  if (kind !== "front") return [];
  const posts = [];
  for (let x = -width / 2; x <= width / 2 + 0.01; x += 2) posts.push(x);
  return posts;
}

/**
 * The kit pieces for one building: [{ model, matrix, tints, skip }] in the building's space (`skip` names
 * a texture whose part of the model is left out, "" for none). `doorX` is the
 * door's segment centre on the front; `seed` makes the same building come out the same every time.
 * `tints` (the same for all of a building's pieces) says what its tiles and plaster are multiplied by:
 * { roundtiles: [r, g, b], plaster: [r, g, b] }, matched against each part's texture.
 */
export function housePieces(spec, doorX, seed) {
  const random = rng(seed);
  const style = spec.style ?? {};
  const bay = spec.bay ?? null;
  const tints = { roundtiles: style.roofTint ?? [1, 1, 1], plaster: style.wallTint ?? [1, 1, 1] };
  const pieces = [];
  const add = (model, matrix, skip = "") => pieces.push({ model, matrix, tints, skip });
  const { width, depth } = spec;
  const hx = width / 2;
  const hz = depth / 2;
  const brickBase = spec.walls === "stone" || spec.walls === "brick";
  const timber = spec.walls === "timber";
  const flat = style.windows === "flat";
  const ivy = style.vines ?? 0.25;

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
        // A plaster ground floor stands on a course of stone all the way round (its windowed walls and its
        // door's have one, so the plain walls between do too); upstairs has none.
        const based = ground && material === "plaster";
        const isDoor = withDoor && side.front && ground && Math.abs(c - doorX) < 0.01;
        const matrix = place(x, y, z, side.angle);
        if (isDoor) {
          add(`wall-${material}-door-round`, matrix);
          add("doorframe-round-wooddark", matrix);
          continue;
        }
        const windowChance = side.front ? 0.7 : 0.45;
        if (random() < windowChance) {
          const thin = !flat && material === "plaster" && random() < 0.3;
          if (flat) {
            // Square windows: the kit's plaster wall for them comes with a stone course at its foot (the
            // ground floor's) and without (upstairs).
            const wall =
              material !== "plaster"
                ? `wall-${material}-window-wide-flat`
                : based
                  ? "wall-plaster-window-wide-flat"
                  : "wall-plaster-window-wide-flat2";
            add(wall, matrix);
            add("window-wide-flat1", matrix);
            if (spec.shutters && side.front && random() < 0.6) add("windowshutters-wide-flat-open", matrix);
          } else {
            // (The round-windowed plaster walls all have the stone course: upstairs it's left off.)
            const upstairs = material === "plaster" && !ground;
            add(`wall-${material}-window-${thin ? "thin" : "wide"}-round`, matrix, upstairs ? "brick" : "");
            // (Where the course was, the wall behind is set back: the timbering piece's strip of plaster,
            // without its beams, fills it flush.)
            if (upstairs) add("wall-plaster-woodgrid", matrix, "woodtrim");
            add(thin ? "window-thin-round1" : "window-wide-round1", matrix);
            if (!thin && spec.shutters && side.front && random() < 0.6) add("windowshutters-wide-round-open", matrix);
          }
        } else {
          add(based ? "wall-plaster-straight-base" : `wall-${material}-straight`, matrix);
          // Timber framing is only the beams: it goes over a plain plaster wall.
          if (material === "plaster" && (timber || !ground) && random() < 0.6) {
            // (Its own strip of plaster at the foot lies where the stone course does: left off there.)
            add("wall-plaster-woodgrid", matrix, based ? "plaster" : "");
          }
          // Ivy on a bare ground-floor wall, now and then: the kit's vines hang down from their origin, so
          // it goes up near the eaves and out onto the wall's face.
          else if (ground && random() < ivy) {
            const vine = ["prop-vine1", "prop-vine1", "prop-vine2", "prop-vine4"][Math.floor(random() * 4)];
            add(vine, matrix.clone().multiply(IVY_HOLD));
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

  // A smithy's walls go round its room; the forge beside it is open, framed by arches, its back walled.
  const [wallX0, wallX1] = bay ? [bay.roomX - bay.roomWidth / 2, bay.roomX + bay.roomWidth / 2] : [-hx, hx];
  for (let level = 0; level < spec.floors; level++) storey(wallX0, wallX1, -hz, hz, level * STOREY, level, true);
  if (bay) {
    const outer = Math.abs(bay.x0) > Math.abs(bay.x1) ? bay.x0 : bay.x1;
    for (let c = bay.x0 + 1; c < bay.x1; c += 2) {
      add("wall-unevenbrick-straight", place(c, 0, -hz + WALL_FACE, Math.PI));
      add("wall-arch", place(c, 0, hz - WALL_FACE, 0));
    }
    for (let c = -hz + 1; c < hz; c += 2) {
      add("wall-arch", place(outer - Math.sign(outer) * WALL_FACE, 0, c, (Math.sign(outer) * Math.PI) / 2));
    }
    for (const z of [-hz, hz]) add("corner-exterior-wood", place(outer, 0, z));
  }
  const top = spec.floors * STOREY;

  // The roof: its ridge along the front or front to back, whichever the kit has a roof for (the style
  // chooses when it has both); brick gables close the ends.
  const alongX = ROOFS[depth]?.includes(width) ?? false;
  const alongZ = ROOFS[width]?.includes(depth) ?? false;
  const ridgeAlongX = alongX && alongZ ? (style.ridge ? style.ridge === "x" : width > depth) : alongX;
  const span = ridgeAlongX ? depth : width;
  const length = ridgeAlongX ? width : depth;
  const roofAt = place(0, top, 0, ridgeAlongX ? Math.PI / 2 : 0);
  add(`roof-roundtiles-${span}x${length}`, roofAt);
  for (const end of [-1, 1]) {
    const gable = `roof-front-brick${span}`;
    if (ridgeAlongX) add(gable, place(end * (hx - WALL_FACE), top, 0, (end * Math.PI) / 2));
    else add(gable, place(0, top, end * (hz - WALL_FACE), end > 0 ? 0 : Math.PI));
  }

  // Dormers, on the slope facing the street (or, the ridge running front to back, the one clear of the
  // chimney): in the roof's own space its ridge lies along z, and a dormer's window looks along +x.
  const shape = ROOF_SHAPE[span];
  if (style.dormers && span >= 6 && shape && !spec.tower) {
    const front = span / 2 - DORMER_INSET; // how far from the ridge its window stands
    const lift = shape.ridge - shape.slope * front - 0.12;
    const count = Math.min(style.dormers, length >= 8 ? 2 : 1);
    for (let i = 0; i < count; i++) {
      const along = count === 1 ? 0 : (i === 0 ? -1 : 1) * (length / 4);
      const onSlope = new Matrix4()
        .makeRotationY(ridgeAlongX ? Math.PI : 0)
        .multiply(new Matrix4().makeTranslation(front - DORMER_DEPTH, lift, along));
      add("roof-dormer-roundtile", roofAt.clone().multiply(onSlope));
    }
  }

  if (spec.chimney) {
    const side = random() < 0.5 ? -1 : 1;
    const along = ridgeAlongX ? [side * (hx - 1.5), -hz / 3] : [-hx / 3, side * (hz - 1.5)];
    add(style.chimney === 2 ? "prop-chimney2" : "prop-chimney", place(along[0], top + 0.4, along[1]));
  }
  // A lean-to on posts: over the door, or all along the front (then there's no balcony).
  const posts = porchPosts(style.porch, width, doorX);
  if (style.porch === "door") add("roof-wooden-2x1", place(doorX, PORCH_HEIGHT, hz, 0));
  if (style.porch === "front") {
    for (let c = -hx + 1; c < hx; c += 2) {
      const piece = c < -hx + 1.5 ? "roof-wooden-2x1-l" : c > hx - 1.5 ? "roof-wooden-2x1-r" : "roof-wooden-2x1-center";
      add(piece, place(c, PORCH_HEIGHT, hz, 0));
    }
  }
  for (const x of posts) {
    add("corner-exterior-wood", place(x, 0, hz + PORCH_OUT - 0.12, 0, [1, PORCH_HEIGHT / POST_HEIGHT, 1]));
  }
  if (spec.balcony && spec.floors > 1 && style.porch !== "front") {
    const segment = doorX + (doorX > 0 ? -2 : 2);
    const balcony = random() < 0.5 ? "balcony-cross-straight" : "balcony-simple-straight";
    if (Math.abs(segment) < hx) add(balcony, place(segment, STOREY, hz - WALL_FACE));
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
