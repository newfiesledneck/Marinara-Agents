// The skin picture each avatar wears, painted for it: the skin picture (or the body's own shading picture,
// coloured in the skin colour of one's own), with
// - the lips coloured through the body's paint mask (kit/avatar/avatar-<sex>-masks.png: green is the lips);
// - the skin under hair tinted in the hair's colour, and stubble, through the body's hair masks
//   (kit/avatar/avatar-<sex>-hair-masks-<n>.png: HAIR_MASKS);
// - makeup on, through the makeup mask (kit/avatar/avatar-makeup-masks.png, one for both bodies: red the
//   eyeshadow, green the eyeliner, blue the blush).
// The masks are made by scripts/build-3d-avatar-maker-masks.mjs. Painting through a mask gives the lips and
// makeup a clean edge; colouring the lips' faces followed the mesh's faces. (The nails are shells of their
// own, coloured by vertex, so they have nothing to paint here.)
//
// This is also where other skin layers (freckles, tattoos) are to be painted.
//
// A painted picture is a canvas, so it's the browser's: in Node (the tests) there's none, and the builder
// colours the skin and lips by vertex as before, without makeup.
import { CanvasTexture, SRGBColorSpace } from "three";
import { urlOf } from "./kitfiles.js";

const TILE = 64;
const WHITE = 0xffffff;
/** The smallest a painted picture is: the masks' size. */
const PAINT_SIZE = 2048;

/**
 * The makeup layers painted through the makeup mask, in the order they go on (the eyeliner last, over the
 * eyeshadow's edge): [the look's field (looks.js MAKEUP_LAYERS), the mask's channel].
 */
export const MAKEUP_ORDER = [
  ["blush", 2],
  ["eyeshadow", 0],
  ["eyeliner", 1],
];

const channels = (hex) => [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];

/** A look's makeup (looks.js: { layer: { colour, amount } }) as MAKEUP_ORDER's layers: [r, g, b, amount], or null. */
export const makeupLayers = (makeup) =>
  MAKEUP_ORDER.map(([layer]) => {
    const { colour, amount } = makeup?.[layer] ?? {};
    return Number.isInteger(colour) && amount > 0 ? [...channels(colour), Math.min(1, amount)] : null;
  });

/**
 * Texel `i` of `data` (RGBA bytes) with the skin's tint and the lips' colour on: `skin` ([r, g, b]) with
 * `lips` ([r, g, b]) in the lips as far as the lip mask's `l` (0 to 255) says, multiplied over the picture.
 */
export function lipTexel(data, i, skin, lips, l) {
  const t = l / 255;
  for (let c = 0; c < 3; c++) data[i + c] = (data[i + c] * (skin[c] + (lips[c] - skin[c]) * t)) / 255;
}

/**
 * Texel `i` of `data` (RGBA bytes) with makeup on: each of `layers` (makeupLayers) laid over it, its colour
 * replacing the picture's as far as its amount times its mask there says (`masks`, RGB bytes, texel `j`).
 * Painting over (not multiplying) lets a pale or bright colour show on any skin; a mask's soft edge and an
 * amount below full let the skin's own texture through.
 */
export function makeupTexel(data, i, layers, masks, j) {
  for (let k = 0; k < MAKEUP_ORDER.length; k++) {
    const layer = layers[k];
    const share = layer ? (layer[3] * masks[j * 3 + MAKEUP_ORDER[k][1]]) / 255 : 0;
    if (share) for (let c = 0; c < 3; c++) data[i + c] += (layer[c] - data[i + c]) * share;
  }
}

// ── Hair on the skin ──────────────────────────────────────────────────────────
// Facial hair and a hair style are cards cut out of a strand picture, and the skin shows between them. Under
// each, the skin is painted towards the hair's colour (a shaved shadow), so a gap reads as hair, not as pale
// skin under a dark beard. Stubble is painted the same way, with a grain of fine hairs in it. These layers go
// on after the lips and before the makeup, with the makeup's blend (painting over, `makeupTexel`).

/** The hair masks' files, each three channels (red, green, blue): which mask is in which. */
export const HAIR_MASK_FILES = [
  ["beard-01", "beard-02", "beard-03"],
  ["beard-04", "beard-05", "moustache-01"],
  ["beard-06", "scalp", "stubble"],
];
/** Each hair mask by name: [its file (avatar-<sex>-hair-masks-<file>.png), its channel]. */
export const HAIR_MASKS = Object.fromEntries(
  HAIR_MASK_FILES.flatMap((names, file) => names.map((name, channel) => [name, [file, channel]])),
);
/** How far the skin under facial hair and under a hair style goes towards the hair's colour, at most. */
export const UNDER_HAIR = { beard: 0.72, scalp: 0.6 };
/**
 * The stubble's shapes (looks.js STUBBLE): [value, the mask it's painted through, how much of the hair's colour
 * the skin takes all over, how many fine hairs there are (0..1, at full density)].
 */
export const STUBBLE_SHAPES = [
  ["light", "stubble", 0.1, 0.22],
  ["heavy", "stubble", 0.3, 0.6],
  ["moustache", "moustache-01", 0.3, 0.6],
  ["goatee", "beard-05", 0.3, 0.6],
  ["short", "beard-01", 0.5, 0.85],
];

/**
 * The hair layers for a look: [{ mask: [file, channel], colour: [r, g, b], amount, grain }], in the order
 * they go on. `facialHair` (a style, or "none"), `scalp` (whether a hair style is worn and shown), `hair` (the
 * hair's colour), `stubble` (looks.js: { shape, colour, density }, or undefined).
 */
export function hairLayers({ facialHair, scalp, hair, stubble }) {
  const layers = [];
  const tint = channels(hair ?? WHITE);
  if (scalp) layers.push({ mask: HAIR_MASKS.scalp, colour: tint, amount: UNDER_HAIR.scalp, grain: 0 });
  const shape = STUBBLE_SHAPES.find(([value]) => value === stubble?.shape);
  if (shape) {
    const density = Math.min(1, Math.max(0, stubble.density ?? 1));
    // (Stubble a little darker than the hair it is: short hairs and their shadow.)
    const colour = channels(stubble.colour ?? hair ?? WHITE).map((c) => c * 0.85);
    layers.push({
      mask: HAIR_MASKS[shape[1]],
      colour,
      amount: shape[2] * (0.4 + 0.6 * density),
      grain: shape[3] * density,
    });
  }
  if (HAIR_MASKS[facialHair])
    layers.push({ mask: HAIR_MASKS[facialHair], colour: tint, amount: UNDER_HAIR.beard, grain: 0 });
  return layers;
}

/** A texel's grain (0..1): fixed for its place in the skin picture at 2048 texels, whatever size is painted. */
function grainAt(x, y) {
  let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/**
 * Texel `i` of `data` (RGBA bytes, at (`x`, `y`) in a picture `size` across) with `layers` (hairLayers, those in
 * one mask file) painted over it as far as each one's amount times its mask there says (`masks`, RGB bytes,
 * texel `j`). A layer with grain also lays fine hairs: a texel is one where its grain is under the grain
 * times the mask, and a hair is three texels long, so the stubble reads as hair, not a smear.
 */
export function hairTexel(data, i, layers, masks, j, x, y, size) {
  const gx = Math.floor((x * 2048) / size);
  const gy = Math.floor((y * 2048) / size);
  for (const layer of layers) {
    const m = masks[j * 3 + layer.mask[1]] / 255;
    if (!m) continue;
    let share = layer.amount * m;
    if (layer.grain) {
      const g = layer.grain * m;
      // (A hair is three texels along x: in MakeHuman's layout the face lies on its side, its chin to the right,
      // so that is down the face.)
      const k = g * 0.32;
      if (grainAt(gx, gy) < k || grainAt(gx - 1, gy) < k || grainAt(gx - 2, gy) < k)
        share = Math.min(1, share + 0.55 * m);
    }
    for (let c = 0; c < 3; c++) data[i + c] += (layer.colour[c] - data[i + c]) * share;
  }
}

export const canPaint = () => typeof globalThis.document?.createElement("canvas")?.getContext === "function";

const pictures = new Map();
/** A kit picture (by name, without .webp, or a .png by its full name) as an image, loaded once. */
function picture(name) {
  if (!pictures.has(name)) {
    const loaded = new Promise((resolve, reject) => {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`the picture ${name} couldn't be loaded`));
      image.src = urlOf(name.endsWith(".png") ? name : `${name}.webp`);
    });
    loaded.catch(() => pictures.delete(name));
    pictures.set(name, loaded);
  }
  return pictures.get(name);
}

const masks = new Map();
/**
 * A mask picture (a .png in the kit), read once at `size`: { rgb (a Uint8Array, three bytes a texel), tiles
 * (the 64-texel squares where `channels` have anything) }, or null when the kit has none.
 */
function maskOf(name, size, used) {
  const key = `${name}:${size}`;
  if (!masks.has(key)) {
    const read = picture(name)
      .then((image) => {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = size;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        context.drawImage(image, 0, 0, size, size);
        const { data } = context.getImageData(0, 0, size, size);
        const rgb = new Uint8Array(size * size * 3);
        const across = Math.ceil(size / TILE);
        const tiles = new Set();
        for (let i = 0; i < size * size; i++) {
          for (let c = 0; c < 3; c++) rgb[i * 3 + c] = data[i * 4 + c];
          if (used.some((c) => rgb[i * 3 + c]))
            tiles.add(Math.floor(Math.floor(i / size) / TILE) * across + Math.floor((i % size) / TILE));
        }
        return {
          rgb,
          tiles: [...tiles].map((tile) => ({ x: (tile % across) * TILE, y: Math.floor(tile / across) * TILE })),
        };
      })
      .catch(() => null);
    masks.set(key, read);
  }
  return masks.get(key);
}

const painted = new Map(); // key → CanvasTexture: the last few, so going back and forth costs nothing
const KEPT = 3;

/**
 * The skin picture for one avatar, painted: `base` is the picture to start from (a skin picture, or the
 * body's own shading picture), `skin` a colour to multiply it all by (a skin colour of one's own, else
 * white), `lips` the lips' colour (white: the picture's own), `makeup` the look's makeup (looks.js), and the
 * hair on the skin (hairLayers): `facialHair`, `scalp`, `hair`, `stubble`. Returns a texture, or null when
 * nothing needs painting or the browser can't (the builder then colours by vertex).
 */
export async function paintedSkin({ sex, base, skin = WHITE, lips = WHITE, makeup = {}, ...onSkin }) {
  const layers = makeupLayers(makeup);
  const hair = hairLayers(onSkin);
  if (!canPaint() || (skin === WHITE && lips === WHITE && !layers.some(Boolean) && !hair.length)) return null;
  const key = [sex, base, skin, lips, JSON.stringify(layers), JSON.stringify(hair)].join("|");
  if (painted.has(key)) {
    const texture = painted.get(key);
    painted.delete(key);
    painted.set(key, texture);
    return texture;
  }
  const image = await picture(base);
  // (At least the masks' size: a smaller skin picture, the young skins' 1024, is drawn larger first, so the
  // lips' and makeup's edges stay sharp.)
  const size = Math.max(PAINT_SIZE, image.naturalWidth || image.width);
  const mask = await maskOf(`avatar-${sex}-masks.png`, size, [1]);
  const makeupMask = layers.some(Boolean) ? await maskOf("avatar-makeup-masks.png", size, [0, 1, 2]) : null;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.drawImage(image, 0, 0, size, size);
  const original = mask ? mask.tiles.map(({ x, y }) => context.getImageData(x, y, TILE, TILE)) : [];
  if (skin !== WHITE) {
    context.globalCompositeOperation = "multiply";
    context.fillStyle = `#${skin.toString(16).padStart(6, "0")}`;
    context.fillRect(0, 0, size, size);
    context.globalCompositeOperation = "source-over";
  }
  // The lips: the skin's tint, with the lip colour in the lips, multiplied over the picture as it was.
  const [skinRgb, lipRgb] = [channels(skin), channels(lips)];
  mask?.tiles.forEach(({ x, y }, t) => {
    const tile = original[t];
    for (let row = 0; row < TILE; row++)
      for (let column = 0; column < TILE; column++)
        lipTexel(
          tile.data,
          (row * TILE + column) * 4,
          skinRgb,
          lipRgb,
          mask.rgb[((y + row) * size + x + column) * 3 + 1],
        );
    context.putImageData(tile, x, y);
  });
  // The hair on the skin, a mask file at a time.
  for (const [file] of HAIR_MASK_FILES.entries()) {
    const here = hair.filter((layer) => layer.mask[0] === file);
    if (!here.length) continue;
    // (All three channels' squares: the mask is read once for every look.)
    const hairMask = await maskOf(`avatar-${sex}-hair-masks-${file}.png`, size, [0, 1, 2]);
    hairMask?.tiles.forEach(({ x, y }) => {
      const tile = context.getImageData(x, y, TILE, TILE);
      for (let row = 0; row < TILE; row++)
        for (let column = 0; column < TILE; column++) {
          const j = (y + row) * size + x + column;
          hairTexel(tile.data, (row * TILE + column) * 4, here, hairMask.rgb, j, x + column, y + row, size);
        }
      context.putImageData(tile, x, y);
    });
  }
  // The makeup, over all that.
  makeupMask?.tiles.forEach(({ x, y }) => {
    const tile = context.getImageData(x, y, TILE, TILE);
    for (let row = 0; row < TILE; row++)
      for (let column = 0; column < TILE; column++)
        makeupTexel(tile.data, (row * TILE + column) * 4, layers, makeupMask.rgb, (y + row) * size + x + column);
    context.putImageData(tile, x, y);
  });
  const texture = new CanvasTexture(canvas);
  texture.flipY = false; // glTF texture coordinates
  texture.colorSpace = SRGBColorSpace;
  texture.name = `${base}-painted`;
  texture.userData.shared = true;
  painted.set(key, texture);
  while (painted.size > KEPT) {
    const [oldest] = painted.keys();
    painted.get(oldest).dispose();
    painted.delete(oldest);
  }
  return texture;
}
