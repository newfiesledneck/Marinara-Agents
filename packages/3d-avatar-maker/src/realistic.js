// The Realistic body: a second kind of body beside the kit's MakeHuman ones, built from the Vitruvian
// character (assets/scripts/make_realistic.py; CC0). It has its own files in the kit (realistic-*), its own
// shape sliders, skin, eyes and strand hair, and for now no clothes. Nothing here reads the other bodies'
// files or code paths, so they stay as they were: a look with `body: "realistic"` is built here (avatar.js
// createAvatar hands it over), any other as before.
//
// What it gives back is the same figure the rest of the maker works with (figure.js standFigure): the stage
// poses and animates it, face.js moves its face by the same key names, and the exporter saves it.
import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DataTexture,
  DoubleSide,
  FrontSide,
  LinearFilter,
  Matrix4,
  MeshStandardMaterial,
  RGBAFormat,
  Skeleton,
  SkinnedMesh,
  SRGBColorSpace,
  Uint16BufferAttribute,
  Vector2,
  Vector3,
} from "three";
import { FACE_MOVES } from "./face.js";
import { standFigure } from "./figure.js";
import { geometryOf, load, rigOf, texture, urlOf, view } from "./kitfiles.js";
import {
  EYE_COLOURS,
  EYE_PICTURES,
  HAIR_COLOURS,
  NEUTRAL_LOOK,
  REALISTIC,
  REALISTIC_BROWS_USUAL,
  REALISTIC_HAIR,
  REALISTIC_SHAPES,
  TINT,
} from "./looks.js";
import { physicsOf } from "./physics.js";
import { softParts } from "./realistic-physics.js";

const BODY_FILE = "realistic-body.pack.png";
const hairFile = (style) => `realistic-hair-${style}.pack.png`;
const browsFile = (style) => `realistic-brows-${String(style).padStart(2, "0")}.pack.png`;
/** How smooth each part is (0 a mirror, 1 chalk) where no picture says, and whether both its sides are drawn. */
const ROUGHNESS = {
  mouth: 0.35,
  iris: 0.7, // (matt: its middle is the pupil, which a shine would turn grey; the glint is the clear front's)
  eye_white: 0.25,
  cornea: 0.03,
  brows: 0.6,
  lashes: 0.5,
  hair: 0.45,
};
// The irises' picture (realistic-eyes.webp, scripts/build-3d-avatar-maker-kit.mjs): EYES_ACROSS tiles each way,
// the eye pictures' in looks.js EYE_PICTURES' order and then the model's own in grey, each with the iris's
// middle in its tile's middle and its edge IRIS_FIT of the tile's width out (make_realistic.py IRIS_FIT).
const EYES_ACROSS = 5;
const IRIS_FIT = 0.47;
const TINT_BRIGHT = 1.5; // (the grey iris is mid grey: a colour is laid on it this much brighter)
const LASH_SHADE = 0.3; // how bright the lashes are, of the brows' colour
const SCALP_SHADE = 0.62; // how bright the scalp is painted under the hair, of the hair's own colour
/**
 * Makeup and nail colour laid on the skin as a tint: [how strong at full, how much of that is the colour
 * itself]. The rest keeps the skin's own light and dark under the colour, so lips keep their creases.
 */
const TINTS = { lips: [0.92, 0.55], eyeshadow: [0.85, 0.5], blush: [0.6, 0.2], nails: [0.96, 0.8] };
const LINER_STRENGTH = 0.9;
/** Stubble (looks.js STUBBLE): [the kit's picture of where, how strong at full density]. */
const STUBBLE_PAINT = {
  light: ["stubble", 0.2],
  heavy: ["stubble", 0.42],
  moustache: ["moustache", 0.45],
  goatee: ["goatee", 0.45],
  short: ["stubble", 0.72],
};
const STUBBLE_SHADE = 0.7; // how bright stubble is, of the hair's colour: short hairs and their shadow
const CORNEA_SOLID = 0.3; // how much of the clear front of the eye's glint is kept (it's drawn see-through)
const CARRY_CELL = 0.012; // metres: the cells the head's skin is sorted into, to find the skin nearest a brow hair
const CARRY_NEAREST = 3;

/** A packed mesh's shape keys as floats: { key: { ids, delta, normal } } (scripts/build-3d-avatar-maker-kit.mjs packMesh). */
function morphsOf(mesh) {
  const out = {};
  for (const [key, packed] of Object.entries(mesh.morphs ?? {})) {
    const ids = Uint32Array.from(view(mesh.count > 65535 ? Uint32Array : Uint16Array, packed.ids));
    const q = packed.q ?? 32767;
    const delta = Float32Array.from(view(Int16Array, packed.delta), (value, i) => (value / q) * packed.d[i % 3]);
    const normal = Float32Array.from(view(Int8Array, packed.normal), (value, i) => (value / 127) * packed.n[i % 3]);
    out[key] = { ids, delta, normal };
  }
  return out;
}

/** For each of `points` (x, y, z each), the `skin` vertices nearest it and their shares: { ids, shares }, CARRY_NEAREST each. */
function nearestOf(points, skin) {
  // (The skin sorted into cells, each known by one number: a body is well within 512 cells of the middle.)
  const cellOf = (x, y, z) =>
    ((Math.floor(x / CARRY_CELL) + 512) << 20) |
    ((Math.floor(y / CARRY_CELL) + 512) << 10) |
    (Math.floor(z / CARRY_CELL) + 512);
  const cells = new Map();
  for (let v = 0; v < skin.length / 3; v++) {
    const cell = cellOf(skin[v * 3], skin[v * 3 + 1], skin[v * 3 + 2]);
    if (!cells.has(cell)) cells.set(cell, []);
    cells.get(cell).push(v);
  }
  const count = points.length / 3;
  const ids = new Uint32Array(count * CARRY_NEAREST);
  const shares = new Float32Array(count * CARRY_NEAREST);
  const best = new Float64Array(CARRY_NEAREST);
  const bestId = new Int32Array(CARRY_NEAREST);
  for (let p = 0; p < count; p++) {
    const [x, y, z] = [points[p * 3], points[p * 3 + 1], points[p * 3 + 2]];
    let found = 0;
    // (Wider and wider until enough skin is found: a brow hair or a strand's root lies within millimetres of it.)
    for (let reach = 1; reach <= 6 && found < CARRY_NEAREST; reach++) {
      found = 0;
      best.fill(Infinity);
      for (let dx = -reach; dx <= reach; dx++)
        for (let dy = -reach; dy <= reach; dy++)
          for (let dz = -reach; dz <= reach; dz++) {
            const list = cells.get(cellOf(x + dx * CARRY_CELL, y + dy * CARRY_CELL, z + dz * CARRY_CELL));
            if (!list) continue;
            for (const v of list) {
              const distance = Math.hypot(skin[v * 3] - x, skin[v * 3 + 1] - y, skin[v * 3 + 2] - z);
              found++;
              // (Kept in order, nearest first.)
              for (let k = 0; k < CARRY_NEAREST; k++)
                if (distance < best[k]) {
                  for (let j = CARRY_NEAREST - 1; j > k; j--) {
                    best[j] = best[j - 1];
                    bestId[j] = bestId[j - 1];
                  }
                  best[k] = distance;
                  bestId[k] = v;
                  break;
                }
            }
          }
    }
    let total = 0;
    for (let k = 0; k < CARRY_NEAREST; k++) {
      const at = Math.min(k, Math.max(0, found - 1));
      ids[p * CARRY_NEAREST + k] = found ? bestId[at] : 0;
      shares[p * CARRY_NEAREST + k] = found ? 1 / (best[at] + 1e-4) : 0;
      total += shares[p * CARRY_NEAREST + k];
    }
    for (let k = 0; k < CARRY_NEAREST; k++) shares[p * CARRY_NEAREST + k] /= total || 1;
  }
  return { ids, shares };
}

/**
 * The irises' texture coordinates as places in a tile of the irises' picture: the iris's middle at the tile's
 * middle, its edge IRIS_FIT out (x, y each, 0…1).
 */
function discOf(uv) {
  let [left, right, top, bottom] = [Infinity, -Infinity, Infinity, -Infinity];
  for (let at = 0; at < uv.length; at += 2) {
    left = Math.min(left, uv[at]);
    right = Math.max(right, uv[at]);
    top = Math.min(top, uv[at + 1]);
    bottom = Math.max(bottom, uv[at + 1]);
  }
  const radius = Math.max(right - left, bottom - top) / 2 || 1;
  return Float32Array.from(
    uv,
    (value, at) => 0.5 + ((value - (at % 2 ? (top + bottom) / 2 : (left + right) / 2)) / radius) * IRIS_FIT,
  );
}

/** The irises' texture coordinates for tile `tile` of the irises' picture (made once a tile and kept). */
function irisUvs(mesh, tile) {
  if (!mesh.tiles.has(tile)) {
    const [column, row] = [tile % EYES_ACROSS, Math.floor(tile / EYES_ACROSS)];
    mesh.tiles.set(
      tile,
      new BufferAttribute(
        Float32Array.from(mesh.disc, (value, at) => ((at % 2 ? row : column) + value) / EYES_ACROSS),
        2,
      ),
    );
  }
  return mesh.tiles.get(tile);
}

/** Which tile of the irises' picture the look's eyes are: an eye picture's, or the grey one a colour is laid on. */
const eyeTile = (look) => {
  const at = EYE_PICTURES.findIndex(([picture]) => picture === look.eyePicture);
  return at >= 0 ? at : EYE_PICTURES.length;
};

/**
 * Ties for a mesh of strands (hair, brows, lashes: ribbons whose `u` is their strand's own shade and whose `v`
 * runs from 1 at the root to 0 at the tip, as the kit's files have it): every point tied to the `skin` under
 * its strand's root, so a strand moves whole with the skin it grows from and keeps its shape. A strand's points
 * come one after another: where `u` changes a new strand starts, and its root is the point with the most `v`.
 */
function strandTies(geometry, skin) {
  const position = geometry.attributes.position.array;
  const uv = geometry.attributes.uv.array;
  const count = position.length / 3;
  const strandOf = new Uint32Array(count);
  const roots = [];
  for (let start = 0; start < count;) {
    let end = start;
    let rootAt = start;
    while (end < count && Math.abs(uv[end * 2] - uv[start * 2]) < 1e-4) {
      if (uv[end * 2 + 1] > uv[rootAt * 2 + 1]) rootAt = end;
      strandOf[end] = roots.length / 3;
      end++;
    }
    roots.push(position[rootAt * 3], position[rootAt * 3 + 1], position[rootAt * 3 + 2]);
    start = end;
  }
  const each = nearestOf(Float32Array.from(roots), skin);
  const tied = { ids: new Uint32Array(count * CARRY_NEAREST), shares: new Float32Array(count * CARRY_NEAREST) };
  for (let v = 0; v < count; v++)
    for (let k = 0; k < CARRY_NEAREST; k++) {
      tied.ids[v * CARRY_NEAREST + k] = each.ids[strandOf[v] * CARRY_NEAREST + k];
      tied.shares[v * CARRY_NEAREST + k] = each.shares[strandOf[v] * CARRY_NEAREST + k];
    }
  return tied;
}

/** The face's moves (face.js FACE_MOVES) for a mesh tied to the head's skin: each as the skin under it moves. */
function tiedFaceMoves(body, tied, length) {
  return FACE_MOVES.map((key) => {
    if (!body.head.morphs[key]) return null;
    const moves = new Float32Array(length);
    carry(moves, tied, wholeMove(body.head, key), 1);
    const attribute = new BufferAttribute(moves, 3);
    attribute.name = key;
    return attribute;
  });
}

let kit = null;
/**
 * The body from the kit, read once and shared: each of its meshes with its points as floats, its shape keys,
 * and the face's moves as whole-mesh arrays; the brows tied to the skin of the head they lie on.
 */
async function bodyKit() {
  kit ??= load(BODY_FILE).then((file) => {
    const meshes = file.meshes.map((mesh) => {
      const geometry = geometryOf(mesh);
      return {
        part: mesh.part,
        piece: mesh.piece ?? null,
        alpha: mesh.alpha ?? null,
        geometry,
        position: geometry.attributes.position.array,
        normal: geometry.attributes.normal.array,
        morphs: morphsOf(mesh),
        disc: mesh.part === "iris" ? discOf(geometry.attributes.uv.array) : null,
        tiles: new Map(),
      };
    });
    const head = meshes.find((mesh) => mesh.part === "skin_head");
    for (const mesh of meshes) {
      // (A piece on the face, the lashes, has no keys of its own: each lash moves as the skin under its root does.)
      mesh.tied = mesh.piece && head ? strandTies(mesh.geometry, head.position) : null;
      mesh.faceMoves = FACE_MOVES.map((key) => {
        const moves = new Float32Array(mesh.position.length);
        const own = mesh.morphs[key];
        if (own)
          for (let i = 0; i < own.ids.length; i++)
            for (let c = 0; c < 3; c++) moves[own.ids[i] * 3 + c] = own.delta[i * 3 + c];
        else if (mesh.tied && head.morphs[key]) carry(moves, mesh.tied, wholeMove(head, key), 1);
        else return null;
        const attribute = new BufferAttribute(moves, 3);
        attribute.name = key;
        return attribute;
      });
    }
    return {
      file,
      meshes,
      head,
      sliders: new Map(file.sliders.map(([key, least, most]) => [key, [least, most]])),
    };
  });
  return kit;
}

/** A mesh's key as a move for every one of its vertices (made once a key and kept). */
function wholeMove(mesh, key) {
  mesh.whole ??= {};
  if (!mesh.whole[key]) {
    const moves = new Float32Array(mesh.position.length);
    const own = mesh.morphs[key];
    if (own)
      for (let i = 0; i < own.ids.length; i++)
        for (let c = 0; c < 3; c++) moves[own.ids[i] * 3 + c] = own.delta[i * 3 + c];
    mesh.whole[key] = moves;
  }
  return mesh.whole[key];
}

/** Adds to `out` the skin's `moves`, `weight` times over, as each tied point's nearest skin vertices share them. */
function carry(out, tied, moves, weight) {
  for (let p = 0; p < out.length / 3; p++)
    for (let k = 0; k < CARRY_NEAREST; k++) {
      const v = tied.ids[p * CARRY_NEAREST + k];
      const share = tied.shares[p * CARRY_NEAREST + k] * weight;
      for (let c = 0; c < 3; c++) out[p * 3 + c] += moves[v * 3 + c] * share;
    }
}

/** The sliders that open the lids wider (looks.js REALISTIC_SHAPES), and the face's moves that shut them. */
const LID_SLIDERS = ["upper_lids", "lower_lids"];
const BLINKS = ["blink", "blinkLeft", "blinkRight"];
/**
 * The head's blinks for a look whose lids a slider has opened wider: { blink…: every vertex's move }, or null
 * when no such slider is used. A blink brings the upper lid down to where the lower lid is on the body as
 * made, so with a lid opened wider the eye would stop short of shut. Each blink here also takes back what
 * those sliders moved, on the side of the face it shuts.
 */
function lidBlinks(body, weights) {
  const used = LID_SLIDERS.filter((key) => weights[key] && body.head.morphs[key]);
  if (!used.length) return null;
  const out = {};
  for (const key of BLINKS) {
    if (!body.head.morphs[key]) continue;
    const blink = wholeMove(body.head, key);
    const moves = blink.slice();
    // (Which side a one-eyed blink shuts: the side its own moves are on.)
    let side = 0;
    if (key !== "blink")
      for (let at = 0; at < blink.length; at += 3) if (blink[at + 1]) side += Math.sign(body.head.position[at]);
    for (const slider of used) {
      const opened = wholeMove(body.head, slider);
      for (let at = 0; at < moves.length; at += 3) {
        if (side && Math.sign(body.head.position[at]) !== Math.sign(side)) continue;
        for (let c = 0; c < 3; c++) moves[at + c] -= opened[at + c] * weights[slider];
      }
    }
    out[key] = moves;
  }
  return out;
}

/** The look's sliders as { key: weight }, each held within what the body's file says it goes to. */
function sliderWeights(body, look) {
  const weights = {};
  for (const [key, [least, most]] of body.sliders) {
    const value = Number(look.realShape?.[key]);
    if (Number.isFinite(value) && value !== 0) weights[key] = Math.max(least, Math.min(most, value));
  }
  return weights;
}

/** A mesh's points and normals with the sliders worked in. */
function shaped(body, mesh, weights) {
  const position = mesh.position.slice();
  const normal = mesh.normal.slice();
  let turned = false;
  for (const [key, weight] of Object.entries(weights)) {
    const own = mesh.morphs[key];
    if (own) {
      for (let i = 0; i < own.ids.length; i++) {
        const at = own.ids[i] * 3;
        for (let c = 0; c < 3; c++) {
          position[at + c] += own.delta[i * 3 + c] * weight;
          normal[at + c] += own.normal[i * 3 + c] * weight;
        }
      }
      turned = true;
    } else if (mesh.tied && body.head.morphs[key]) carry(position, mesh.tied, wholeMove(body.head, key), weight);
  }
  if (turned)
    for (let at = 0; at < normal.length; at += 3) {
      const length = Math.hypot(normal[at], normal[at + 1], normal[at + 2]) || 1;
      normal[at] /= length;
      normal[at + 1] /= length;
      normal[at + 2] /= length;
    }
  return { position, normal };
}

/** The skeleton as the file has it, each joint moved as the sliders move it (the file's `jointMoves`). */
function shapedRig(body, weights) {
  const { root, bones } = rigOf(body.file);
  const { names, parents } = body.file.skeleton;
  root.updateMatrixWorld(true);
  const at = names.map((name) => bones.get(name).getWorldPosition(new Vector3()));
  for (const [key, weight] of Object.entries(weights)) {
    for (const [joint, move] of Object.entries(body.file.jointMoves?.[key] ?? {})) {
      const i = names.indexOf(joint);
      if (i >= 0) at[i].add(new Vector3(move[0] * weight, move[1] * weight, move[2] * weight));
    }
  }
  // (Parents first: each bone is put where it now belongs under a parent already in its place.)
  const depth = (i) => (parents[i] < 0 ? 0 : 1 + depth(parents[i]));
  for (const i of names.map((_, n) => n).sort((a, b) => depth(a) - depth(b))) {
    const bone = bones.get(names[i]);
    bone.parent.updateWorldMatrix(true, false);
    bone.position.copy(bone.parent.worldToLocal(at[i].clone()));
  }
  root.updateMatrixWorld(true);
  return { root, bones };
}

/** A picture read as numbers, not colours (a normal or roughness map). */
const dataMap = (name) => texture(name, null, true);

const pictures = new Map();
/** A kit picture as something a canvas draws, loaded once. */
function pictureOf(name) {
  if (!pictures.has(name))
    pictures.set(
      name,
      fetch(urlOf(`${name}.webp`))
        .then((response) =>
          response.ok ? response.blob() : Promise.reject(new Error(`GET ${name}.webp → ${response.status}`)),
        )
        .then((blob) => createImageBitmap(blob)),
    );
  return pictures.get(name);
}

/**
 * What's painted on the skin of `part` for `look`, as its pictures' suffix: underwear unless the look goes
 * bare (`realBare`). Panties and a bra on the female side of the first slider, boxer briefs on the male side;
 * only the torso and the legs have any (assets/scripts/make_realistic.py write_textures).
 */
export function coverOf(part, look) {
  if (look.realBare || (part !== "torso" && part !== "legs")) return "";
  return (Number(look.realShape?.gender) || 0) >= 0 ? "-female" : "-male";
}

const tones = new Map(); // a skin picture (its part and its cover) → { recipe, map, users }: the last one made of it, kept while in use
/**
 * A part of the skin at `tone` (0 the light skin's picture, 1 the dark's, between them a blend of the two),
 * with `cover` painted on it (coverOf), and then `paints` laid over that: [{ mask (a kit picture whose alpha
 * says where), colour ("#rrggbb"), strength (0…1), body }], in order. A paint with a `body` is a tint: the
 * colour over the skin's own light and dark, and then `body` of its strength as the colour itself. Gives
 * { map, letGo }. Where there's no canvas to draw on, the nearer of the two pictures, unpainted.
 */
async function skinMap(part, tone, cover, paints = []) {
  const light = `realistic-skin-${part}-light${cover}`;
  const dark = `realistic-skin-${part}-dark${cover}`;
  const canDraw = typeof document !== "undefined" && typeof createImageBitmap === "function";
  const laid = canDraw ? paints.filter((paint) => paint.strength > 0) : [];
  if (!laid.length) {
    if (tone <= 0.001 || (!canDraw && tone < 0.5)) return { map: texture(light), letGo: () => {} };
    if (tone >= 0.999 || !canDraw) return { map: texture(dark), letGo: () => {} };
  }
  const which = `${part}${cover}`;
  const recipe = JSON.stringify([tone, laid]);
  let made = tones.get(which);
  if (!made || made.recipe !== recipe) {
    const [a, b, ...masks] = await Promise.all([
      pictureOf(light),
      tone > 0.001 ? pictureOf(dark) : null,
      ...laid.map((paint) => pictureOf(paint.mask)),
    ]);
    const canvas = document.createElement("canvas");
    canvas.width = a.width;
    canvas.height = a.height;
    const context = canvas.getContext("2d");
    context.drawImage(a, 0, 0);
    if (b) {
      context.globalAlpha = Math.min(1, tone);
      context.drawImage(b, 0, 0, a.width, a.height);
    }
    if (laid.length) {
      // (Each paint: its colour, kept only where its mask is, laid over the skin as strongly as it says.)
      const layer = document.createElement("canvas");
      layer.width = a.width;
      layer.height = a.height;
      const brush = layer.getContext("2d");
      laid.forEach((paint, i) => {
        brush.globalCompositeOperation = "source-over";
        brush.fillStyle = paint.colour;
        brush.fillRect(0, 0, layer.width, layer.height);
        brush.globalCompositeOperation = "destination-in";
        brush.drawImage(masks[i], 0, 0, layer.width, layer.height);
        const strength = Math.min(1, paint.strength);
        if (paint.body !== undefined) {
          context.globalCompositeOperation = "color";
          context.globalAlpha = strength;
          context.drawImage(layer, 0, 0);
          context.globalCompositeOperation = "source-over";
        }
        context.globalAlpha = strength * (paint.body ?? 1);
        context.drawImage(layer, 0, 0);
      });
    }
    context.globalAlpha = 1;
    const map = new CanvasTexture(canvas);
    map.flipY = false; // glTF texture coordinates
    map.colorSpace = SRGBColorSpace;
    map.name = `realistic-skin-${which}`;
    made = { recipe, map, users: 0 };
    tones.set(which, made);
  }
  const mine = made;
  mine.users++;
  return {
    map: mine.map,
    letGo: () => {
      mine.users--;
      if (!mine.users && tones.get(which) !== mine) mine.map.dispose();
    },
  };
}

/** A colour as "#rrggbb", `times` as bright. */
const cssOf = (colour, times = 1) => `#${colour.clone().multiplyScalar(times).getHexString(SRGBColorSpace)}`;

/** A look's colour (a number) as "#rrggbb". */
const hexOf = (colour) => `#${colour.toString(16).padStart(6, "0")}`;

/**
 * What the look paints over a part of the skin (skinMap's `paints`), each through a picture of where in the
 * kit (assets/scripts/make_realistic.py scalp_paint, write_paints). `hair` is the hair's colour.
 *
 * - The head: the scalp under the hair, in the hair's colour a little darker, so no skin shows between the
 *   strands; stubble (`stubble`: its shape, density and colour, else the hair's); then makeup (`makeup`: blush,
 *   eyeshadow and eyeliner, each a colour and an amount) and the lips (`colours.lips`, as strong as
 *   `makeup.lipstick.amount`, full unless said).
 * - The arms and legs: the nails in `colours.nails`; the toenails unless `toenails` is false.
 */
export function paintsOf(part, look, hair) {
  const paints = [];
  const makeup = look.makeup ?? {};
  const tint = (kind, mask, colour, amount = 1) =>
    paints.push({
      mask: `realistic-paint-${mask}`,
      colour: hexOf(colour),
      strength: TINTS[kind][0] * amount,
      body: TINTS[kind][1],
    });
  if (part === "head") {
    if (look.realHair !== "none")
      paints.push({ mask: `realistic-hair-${look.realHair}-scalp`, colour: cssOf(hair, SCALP_SHADE), strength: 0.96 });
    const stubble = STUBBLE_PAINT[look.stubble?.shape];
    if (stubble) {
      const density = Math.min(1, Math.max(0, look.stubble.density ?? 1));
      const colour = Number.isInteger(look.stubble.colour)
        ? new Color().setHex(look.stubble.colour, SRGBColorSpace)
        : hair;
      paints.push({
        mask: `realistic-paint-${stubble[0]}`,
        colour: cssOf(colour, STUBBLE_SHADE),
        strength: stubble[1] * (0.4 + 0.6 * density),
      });
    }
    for (const layer of ["blush", "eyeshadow"])
      if (Number.isInteger(makeup[layer]?.colour)) tint(layer, layer, makeup[layer].colour, makeup[layer].amount ?? 1);
    if (Number.isInteger(makeup.eyeliner?.colour))
      paints.push({
        mask: "realistic-paint-eyeliner",
        colour: hexOf(makeup.eyeliner.colour),
        strength: LINER_STRENGTH * (makeup.eyeliner.amount ?? 1),
      });
    if (Number.isInteger(look.colours?.lips)) tint("lips", "lips", look.colours.lips, makeup.lipstick?.amount ?? 1);
  }
  if (Number.isInteger(look.colours?.nails)) {
    if (part === "arms") tint("nails", "nails", look.colours.nails);
    if (part === "legs" && look.toenails !== false) tint("nails", "toenails", look.colours.nails);
  }
  return paints;
}

let strandMap = null;
/**
 * The hair ribbons' picture: across it each strand's own shade, along it the strand from tip to root (darker;
 * the kit's ribbons have `v` 1 at the root).
 */
function strandPicture() {
  if (!strandMap) {
    const size = 64;
    const data = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) {
        const along = 1 - y / (size - 1);
        const shade = 0.74 + 0.26 * Math.abs((Math.sin(x * 12.9898) * 43758.5453) % 1);
        const value = shade * (0.6 + 0.4 * Math.min(1, along * 3.5));
        data.set([value * 255, value * 255, value * 255, 255], (y * size + x) * 4);
      }
    strandMap = new DataTexture(data, size, size, RGBAFormat);
    strandMap.colorSpace = SRGBColorSpace;
    strandMap.magFilter = LinearFilter;
    strandMap.minFilter = LinearFilter;
    strandMap.needsUpdate = true;
    strandMap.userData.shared = true;
    strandMap.name = "realistic-strands";
  }
  return strandMap;
}

/** The hair's colour (a list colour or one's own) as a Color. */
const hairColourOf = (look) =>
  new Color().setHex(look.hairTint ?? HAIR_COLOURS[look.hairColour ?? 0]?.[0] ?? HAIR_COLOURS[0][0], SRGBColorSpace);

/** The material of a part of the body: { material, letGo }. */
async function materialFor(mesh, look, hair) {
  const { part } = mesh;
  if (part.startsWith("skin_")) {
    const name = part.slice("skin_".length);
    const cover = coverOf(name, look);
    const skin = await skinMap(name, look.realTone ?? 0, cover, paintsOf(name, look, hair));
    const material = new MeshStandardMaterial({
      name: part,
      map: skin.map,
      normalMap: dataMap(`realistic-skin-${name}-normal${cover}`),
      // (glTF texture coordinates, and no tangents on the mesh: the map's up is the other way, as three's own loader has it.)
      normalScale: new Vector2(1, -1),
      roughnessMap: dataMap(`realistic-skin-${name}-rough${cover}`),
      roughness: 1,
      metalness: 0,
    });
    return { material, letGo: skin.letGo };
  }
  const base = { name: part, roughness: ROUGHNESS[part] ?? 0.6, metalness: 0 };
  if (part === "mouth") return { material: new MeshStandardMaterial({ ...base, map: texture("realistic-mouth") }) };
  if (part === "iris") {
    // (An eye picture as it is; the grey iris in the look's eye colour.)
    const tinted = eyeTile(look) === EYE_PICTURES.length;
    const colour = tinted
      ? new Color().setHex(look.colours?.eyes ?? EYE_COLOURS[1][0], SRGBColorSpace).multiplyScalar(TINT_BRIGHT)
      : new Color(0xffffff);
    return { material: new MeshStandardMaterial({ ...base, map: texture("realistic-eyes"), color: colour }) };
  }
  if (part === "eye_white") return { material: new MeshStandardMaterial({ ...base, map: texture("realistic-eye") }) };
  if (part === "cornea")
    return {
      material: new MeshStandardMaterial({
        ...base,
        color: 0x000000,
        transparent: true,
        opacity: CORNEA_SOLID,
        depthWrite: false,
      }),
    };
  if (part === "brows" || part === "lashes") {
    // (The brows in their own colour, else the hair's a little darker; the lashes darker than the brows.)
    const brows = Number.isInteger(look.colours?.brows)
      ? new Color().setHex(look.colours.brows, SRGBColorSpace)
      : hair.clone().multiplyScalar(0.8);
    return {
      material: new MeshStandardMaterial({
        ...base,
        color: part === "lashes" ? brows.multiplyScalar(LASH_SHADE) : brows,
        side: DoubleSide,
      }),
    };
  }
  if (part === "hair")
    return { material: new MeshStandardMaterial({ ...base, color: hair, map: strandPicture(), side: DoubleSide }) };
  return { material: new MeshStandardMaterial({ ...base, side: FrontSide }) };
}

/** A skinned mesh of `geometry` on `bones` (the file's joints, in its order), bound as they stand. */
function skinned(name, geometry, material, joints, bones, root) {
  const mesh = new SkinnedMesh(geometry, material);
  mesh.name = name;
  mesh.frustumCulled = false; // (its box is the rest pose's; an animation moves it out of it)
  root.add(mesh);
  mesh.bind(new Skeleton(joints.map((joint) => bones.get(joint) ?? root)), new Matrix4());
  return mesh;
}

const strandKits = new Map();
/**
 * A file of strands from the kit (a hair style, a brow style), read once and shared: its ribbons, each point
 * tied to the head's skin under its strand's root (strandTies). `faces`: also the face's moves for it, as the
 * skin under it moves (the brows rise and fall with the face; hair on the scalp doesn't).
 */
function strandKit(body, file, faces = false) {
  if (!strandKits.has(file))
    strandKits.set(
      file,
      load(file).then((packed) => ({
        file: packed,
        meshes: packed.meshes.map((each) => {
          const geometry = geometryOf(each);
          const position = geometry.attributes.position.array;
          const tied = strandTies(geometry, body.head.position);
          return {
            part: each.part,
            geometry,
            position,
            tied,
            faceMoves: faces ? tiedFaceMoves(body, tied, position.length).filter(Boolean) : [],
          };
        }),
      })),
    );
  return strandKits.get(file);
}

/** What the kit has for this body: what the maker's controls offer (avatar.js avatarChoices, for the other bodies). */
export async function realisticChoices() {
  const body = await bodyKit();
  return {
    keys: body.file.keys,
    sliders: body.file.sliders,
    hair: REALISTIC_HAIR.map(([style]) => style),
    races: [],
    tops: [],
    bottoms: [],
    brows: [],
    lashes: [],
    clothes: [],
    wings: false,
    tail: false,
  };
}

/** The Realistic body for `look` as a figure (figure.js standFigure), its face's keys live and its eyes on bones. */
export async function createRealistic(look = {}) {
  const body = await bodyKit();
  const filled = {
    ...NEUTRAL_LOOK,
    clothes: [],
    ...look,
    body: REALISTIC,
    realShape: Object.fromEntries(REALISTIC_SHAPES.map(([key]) => [key, Number(look.realShape?.[key]) || 0])),
    realTone: Math.max(0, Math.min(1, Number(look.realTone) || 0)),
    realHair: REALISTIC_HAIR.some(([style]) => style === look.realHair) ? look.realHair : REALISTIC_HAIR[1][0],
    realBare: look.realBare === true,
    makeup: look.makeup ?? {},
    colours: look.colours ?? {},
    eyePicture: look.eyePicture ?? TINT,
    realBrows: Number.isInteger(look.realBrows) ? look.realBrows : REALISTIC_BROWS_USUAL,
    height: Number.isFinite(look.height) ? look.height : 1,
  };
  const weights = sliderWeights(body, filled);
  const { root, bones } = shapedRig(body, weights);
  const hairColour = hairColourOf(filled);
  // (The hair, bust and buttocks on springs, each with the look's switch and amount: realistic-physics.js.)
  filled.physics = physicsOf(look);
  const soft = softParts(body, weights, bones, filled.physics);
  const lids = lidBlinks(body, weights);
  const owned = [];
  let headMoved = body.head.position;
  for (const mesh of body.meshes) {
    const { position, normal } = shaped(body, mesh, weights);
    if (mesh === body.head) headMoved = position;
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(position, 3));
    geometry.setAttribute("normal", new BufferAttribute(normal, 3));
    for (const name of ["uv", "skinIndex", "skinWeight"]) geometry.setAttribute(name, mesh.geometry.attributes[name]);
    if (mesh.disc) geometry.setAttribute("uv", irisUvs(mesh, eyeTile(filled)));
    geometry.setIndex(mesh.geometry.index);
    const moves = mesh.faceMoves.filter(Boolean).map((move) => {
      // (With the lids opened wider by a slider, the blinks are this look's own: lidBlinks. The lashes take
      // theirs from the skin under them, as ever.)
      const lid = lids?.[move.name];
      if (!lid || !(mesh === body.head || mesh.tied)) return move;
      const own = mesh === body.head ? lid : new Float32Array(mesh.position.length);
      if (mesh !== body.head) carry(own, mesh.tied, lid, 1);
      const attribute = new BufferAttribute(own, 3);
      attribute.name = move.name;
      return attribute;
    });
    if (moves.length) {
      geometry.morphAttributes.position = moves;
      geometry.morphTargetsRelative = true;
    }
    const { material, letGo } = await materialFor(mesh, filled, hairColour);
    const made = skinned(mesh.piece ?? mesh.part, geometry, material, body.file.joints, bones, root);
    soft.wear(made, mesh);
    if (moves.length) {
      made.morphTargetDictionary = Object.fromEntries(moves.map((move, i) => [move.name, i]));
      made.morphTargetInfluences = moves.map(() => 0);
    }
    if (mesh.part === "cornea") made.renderOrder = 2;
    owned.push(() => {
      geometry.dispose();
      material.dispose();
      letGo?.();
    });
  }
  // The hair and the brows: strands from files of their own, carried by the skin the sliders moved.
  const headMove = new Float32Array(headMoved.length);
  for (let i = 0; i < headMove.length; i++) headMove[i] = headMoved[i] - body.head.position[i];
  const strands = [[browsFile(filled.realBrows), true]];
  if (filled.realHair !== "none") strands.push([hairFile(filled.realHair), false]);
  for (const [file, faces] of strands) {
    const kept = await strandKit(body, file, faces);
    for (const mesh of kept.meshes) {
      const position = mesh.position.slice();
      carry(position, mesh.tied, headMove, 1);
      const geometry = new BufferGeometry();
      geometry.setAttribute("position", new BufferAttribute(position, 3));
      for (const name of ["normal", "uv", "skinIndex", "skinWeight"])
        geometry.setAttribute(name, mesh.geometry.attributes[name]);
      geometry.setIndex(mesh.geometry.index);
      if (mesh.faceMoves.length) {
        geometry.morphAttributes.position = mesh.faceMoves;
        geometry.morphTargetsRelative = true;
      }
      const { material } = await materialFor(mesh, filled, hairColour);
      const made = skinned(mesh.part, geometry, material, kept.file.joints, bones, root);
      if (mesh.faceMoves.length) {
        made.morphTargetDictionary = Object.fromEntries(mesh.faceMoves.map((move, i) => [move.name, i]));
        made.morphTargetInfluences = mesh.faceMoves.map(() => 0);
      }
      soft.wearHair(made, mesh);
      owned.push(() => {
        geometry.dispose();
        material.dispose();
      });
    }
  }
  const figure = standFigure(root, bones, filled.height);
  figure.springs = [];
  figure.colliders = [];
  soft.finish(figure);
  figure.dispose = () => {
    for (const letGo of owned) letGo();
    for (const mesh of figure.meshes) mesh.skeleton?.dispose();
  };
  figure.avatar = filled;
  figure.kit = body;
  return figure;
}
