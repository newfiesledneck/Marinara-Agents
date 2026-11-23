// The skin picture each avatar wears, painted for it: the skin picture (or the body's own shading picture,
// coloured in the skin colour of one's own), with the lips and nails coloured through the body's paint
// masks (kit/avatar/avatar-<sex>-masks.png: red is the nails, green the lips; made by
// scripts/build-3d-avatar-maker-masks.mjs). Painting through a mask gives the nails and lips a clean edge;
// colouring their faces, as before, followed the fingertips' few large faces and left jagged patches.
//
// This is also where skin layers (freckles, makeup, tattoos) are to be painted.
//
// A painted picture is a canvas, so it's the browser's: in Node (the tests) there's none, and the builder
// colours the skin, lips and nails by vertex as before.
import { CanvasTexture, SRGBColorSpace } from "three";
import { urlOf } from "./kitfiles.js";

const TILE = 64;
const WHITE = 0xffffff;
/** How much of the picture's own shading shows through a nail colour (the rest is the colour). */
const POLISH_SHADING = 0.15;
/** The smallest a painted picture is: the masks' size. */
const PAINT_SIZE = 2048;

export const canPaint = () => typeof globalThis.document?.createElement("canvas")?.getContext === "function";

const pictures = new Map();
/** A kit picture (by name, without .webp) as an image, loaded once. */
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

/** The pixels of `image` drawn at `size`, as ImageData. */
function pixelsOf(image, size) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.drawImage(image, 0, 0, size, size);
  return context.getImageData(0, 0, size, size);
}

const masks = new Map();
/**
 * A body's masks, read once: { size, nails, lips (each a Uint8Array, one byte a texel), tiles (the
 * 64-texel squares where either has anything) }, or null when the kit has none.
 */
function masksOf(sex, size) {
  const key = `${sex}:${size}`;
  if (!masks.has(key)) {
    const read = picture(`avatar-${sex}-masks.png`)
      .then((image) => {
        const { data } = pixelsOf(image, size);
        const nails = new Uint8Array(size * size);
        const lips = new Uint8Array(size * size);
        const tiles = new Set();
        for (let i = 0; i < nails.length; i++) {
          nails[i] = data[i * 4];
          lips[i] = data[i * 4 + 1];
          if (nails[i] || lips[i]) {
            const x = i % size;
            const y = (i - x) / size;
            tiles.add(Math.floor(y / TILE) * Math.ceil(size / TILE) + Math.floor(x / TILE));
          }
        }
        const across = Math.ceil(size / TILE);
        return {
          size,
          nails,
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
 * white), `lips` and `nails` the colours for those (white: the picture's own). Returns a texture, or null
 * when nothing needs painting or the browser can't (the builder then colours by vertex).
 */
export async function paintedSkin({ sex, base, skin = WHITE, lips = WHITE, nails = WHITE }) {
  if (!canPaint() || (skin === WHITE && lips === WHITE && nails === WHITE)) return null;
  const key = [sex, base, skin, lips, nails].join("|");
  if (painted.has(key)) {
    const texture = painted.get(key);
    painted.delete(key);
    painted.set(key, texture);
    return texture;
  }
  const image = await picture(base);
  // (At least the masks' size: a smaller skin picture, the young skins' 1024, is drawn larger first, so the
  // nails' and lips' edges stay sharp.)
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
    const [nr, ng, nb] = channels(nails);
    const polish = nails !== WHITE;
    mask.tiles.forEach(({ x, y }, t) => {
      const tile = original[t];
      const data = tile.data;
      for (let row = 0; row < TILE; row++)
        for (let column = 0; column < TILE; column++) {
          const at = (y + row) * size + x + column;
          const l = mask.lips[at] / 255;
          const n = polish ? mask.nails[at] / 255 : 0;
          const i = (row * TILE + column) * 4;
          // The skin's tint, the lip colour in the lips (each multiplied over the picture)…
          const tr = sr + (lr - sr) * l;
          const tg = sg + (lg - sg) * l;
          const tb = sb + (lb - sb) * l;
          let r = (data[i] * tr) / 255;
          let g = (data[i + 1] * tg) / 255;
          let b = (data[i + 2] * tb) / 255;
          // …then a nail colour over the nails, with a little of the picture's shading left in it.
          if (n > 0) {
            const shade = 1 - POLISH_SHADING + (POLISH_SHADING * (data[i] + data[i + 1] + data[i + 2])) / 765;
            r += (nr * shade - r) * n;
            g += (ng * shade - g) * n;
            b += (nb * shade - b) * n;
          }
          data[i] = r;
          data[i + 1] = g;
          data[i + 2] = b;
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
