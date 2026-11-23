// The skin picture each avatar wears, painted for it: the skin picture (or the body's own shading picture,
// coloured in the skin colour of one's own), with the lips coloured through the body's paint mask
// (kit/avatar/avatar-<sex>-masks.png: green is the lips; made by scripts/build-3d-avatar-maker-masks.mjs).
// Painting through a mask gives the lips a clean edge; colouring their faces followed the mesh's faces. (The
// nails are shells of their own, coloured by vertex, so they have nothing to paint here.)
//
// This is also where skin layers (freckles, makeup, tattoos) are to be painted.
//
// A painted picture is a canvas, so it's the browser's: in Node (the tests) there's none, and the builder
// colours the skin and lips by vertex as before.
import { CanvasTexture, SRGBColorSpace } from "three";
import { urlOf } from "./kitfiles.js";

const TILE = 64;
const WHITE = 0xffffff;
/** The smallest a painted picture is: the mask's size. */
const PAINT_SIZE = 2048;

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
 * A body's lip mask, read once at `size`: { lips (a Uint8Array, one byte a texel), tiles (the 64-texel squares
 * where it has anything) }, or null when the kit has none.
 */
function masksOf(sex, size) {
  const key = `${sex}:${size}`;
  if (!masks.has(key)) {
    const read = picture(`avatar-${sex}-masks.png`)
      .then((image) => {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = size;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        context.drawImage(image, 0, 0, size, size);
        const { data } = context.getImageData(0, 0, size, size);
        const lips = new Uint8Array(size * size);
        const across = Math.ceil(size / TILE);
        const tiles = new Set();
        for (let i = 0; i < lips.length; i++) {
          lips[i] = data[i * 4 + 1];
          if (lips[i]) tiles.add(Math.floor(Math.floor(i / size) / TILE) * across + Math.floor((i % size) / TILE));
        }
        return {
          lips,
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

const channels = (hex) => [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];

/**
 * The skin picture for one avatar, painted: `base` is the picture to start from (a skin picture, or the
 * body's own shading picture), `skin` a colour to multiply it all by (a skin colour of one's own, else
 * white), `lips` the lips' colour (white: the picture's own). Returns a texture, or null when nothing needs
 * painting or the browser can't (the builder then colours by vertex).
 */
export async function paintedSkin({ sex, base, skin = WHITE, lips = WHITE }) {
  if (!canPaint() || (skin === WHITE && lips === WHITE)) return null;
  const key = [sex, base, skin, lips].join("|");
  if (painted.has(key)) {
    const texture = painted.get(key);
    painted.delete(key);
    painted.set(key, texture);
    return texture;
  }
  const image = await picture(base);
  // (At least the mask's size: a smaller skin picture, the young skins' 1024, is drawn larger first, so the
  // lips' edge stays sharp.)
  const size = Math.max(PAINT_SIZE, image.naturalWidth || image.width);
  const mask = await masksOf(sex, size);
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
  if (mask) {
    const [sr, sg, sb] = channels(skin);
    const [lr, lg, lb] = channels(lips);
    mask.tiles.forEach(({ x, y }, t) => {
      const tile = original[t];
      const data = tile.data;
      for (let row = 0; row < TILE; row++)
        for (let column = 0; column < TILE; column++) {
          const l = mask.lips[(y + row) * size + x + column] / 255;
          const i = (row * TILE + column) * 4;
          // The skin's tint, with the lip colour in the lips, multiplied over the picture.
          data[i] = (data[i] * (sr + (lr - sr) * l)) / 255;
          data[i + 1] = (data[i + 1] * (sg + (lg - sg) * l)) / 255;
          data[i + 2] = (data[i + 2] * (sb + (lb - sb) * l)) / 255;
        }
      context.putImageData(tile, x, y);
    });
  }
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
