// The skin picture each avatar wears, painted for it: the skin picture (or the body's own shading picture,
// coloured in the skin colour of one's own), with
// - the lips coloured through the body's paint mask (kit/avatar/avatar-<sex>-masks.png: green is the lips);
// - makeup on, through the makeup mask (kit/avatar/avatar-makeup-masks.png, one for both bodies: red the
//   eyeshadow, green the eyeliner, blue the blush).
// Both masks are made by scripts/build-3d-avatar-maker-masks.mjs. Painting through a mask gives the lips and
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
 * white), `lips` the lips' colour (white: the picture's own), `makeup` the look's makeup (looks.js). Returns a
 * texture, or null when nothing needs painting or the browser can't (the builder then colours by vertex).
 */
export async function paintedSkin({ sex, base, skin = WHITE, lips = WHITE, makeup = {} }) {
  const layers = makeupLayers(makeup);
  if (!canPaint() || (skin === WHITE && lips === WHITE && !layers.some(Boolean))) return null;
  const key = [sex, base, skin, lips, JSON.stringify(layers)].join("|");
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
