// The kit's packed files (`<name>.pack.png`, written by scripts/wanderworld-packed.mjs): a kit document
// and its binary arrays in one compressed file, about half the size of the same document as JSON with
// base64 arrays. A package may only ship pictures and JSON, and a PNG is the one of those that holds
// bytes losslessly and compressed: an 8-bit grey picture whose pixels are the file's bytes. Nothing draws
// it; it's read here, with the browser's own DecompressionStream (no picture decoding, so no colour
// management or canvas in the way).
//
// The bytes: a uint32 (little-endian) length, the document as JSON, then the arrays. In the document an
// array stands as { "@": [offset, length, size, comps] }, its bytes at `offset` in the file; with
// `comps`, its elements of `size` bytes were split by component, each made the difference from the one
// before and their bytes split into planes, which deflate packs much tighter (decoded below). Each comes
// back as a Uint8Array of its own, where the JSON kit files had a base64 string: `bytesOf` takes either,
// so packed and plain files can be mixed.

import { TextureLoader } from "three";

const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/** A base64 string (a plain JSON kit file's array) or a packed file's Uint8Array, as bytes. */
export const bytesOf = (value) =>
  typeof value === "string" ? Uint8Array.from(atob(value), (char) => char.charCodeAt(0)) : value;

/** A packed array of `Type` (bytesOf's, on a buffer of its own, so always aligned). */
export function arrayOf(Type, value) {
  const raw = bytesOf(value);
  return new Type(raw.buffer, raw.byteOffset, raw.byteLength / Type.BYTES_PER_ELEMENT);
}

/** One array back from its filtered bytes (scripts/wanderworld-packed.mjs `filter`, the other way). */
export function unfilter(input, size, comps) {
  const n = input.length / size;
  const out = new Uint8Array(input.length);
  const Type = { 1: Uint8Array, 2: Uint16Array, 4: Uint32Array }[size];
  const values = new Type(n);
  // The planes of bytes back into values, adding up the differences as it goes (wrapping, as the encoder's
  // subtraction did), then the components back in their places.
  const lanes = new Uint8Array(values.buffer);
  for (let b = 0; b < size; b++) for (let i = 0; i < n; i++) lanes[i * size + b] = input[b * n + i];
  for (let i = 1; i < n; i++) values[i] += values[i - 1];
  const items = n / comps;
  const ordered = new Type(out.buffer);
  for (let c = 0; c < comps; c++) for (let i = 0; i < items; i++) ordered[i * comps + c] = values[c * items + i];
  return out;
}

/** A packed file's document from its bytes; a plain JSON file's too. */
export async function unpack(buffer) {
  const file = new Uint8Array(buffer);
  if (!PNG.every((byte, i) => file[i] === byte)) return JSON.parse(new TextDecoder().decode(file));
  const data = new DataView(file.buffer, file.byteOffset, file.byteLength);
  const chunks = [];
  let width = 0;
  for (let at = 8; at + 8 <= file.length;) {
    const length = data.getUint32(at);
    const type = String.fromCharCode(...file.subarray(at + 4, at + 8));
    if (type === "IHDR") width = data.getUint32(at + 8);
    if (type === "IDAT") chunks.push(file.subarray(at + 8, at + 8 + length));
    if (type === "IEND") break;
    at += 12 + length;
  }
  const stream = new Blob(chunks).stream().pipeThrough(new DecompressionStream("deflate"));
  const rows = new Uint8Array(await new Response(stream).arrayBuffer());
  // Each row of the picture starts with its filter byte (always 0, "none", as written): dropped.
  const height = rows.length / (width + 1);
  const bytes = new Uint8Array(height * width);
  for (let row = 0; row < height; row++) {
    if (rows[row * (width + 1)] !== 0) throw new Error("A packed kit file has a filtered row");
    bytes.set(rows.subarray(row * (width + 1) + 1, (row + 1) * (width + 1)), row * width);
  }
  const length = new DataView(bytes.buffer).getUint32(0, true);
  const arrays = (key, value) => {
    const at = value?.["@"];
    if (!Array.isArray(at)) return value;
    const [offset, count, size, comps] = at;
    const raw = bytes.slice(offset, offset + count);
    return comps ? unfilter(raw, size, comps) : raw;
  };
  return JSON.parse(new TextDecoder().decode(bytes.subarray(4, 4 + length)), arrays);
}

const pictures = new TextureLoader();
/**
 * A picture packed in a bundle (`pictures`: [{ name, webp }]) as a texture, loaded as a kit .webp would be,
 * through a URL of its own that's let go once it's loaded.
 */
export function pictureTexture(bytes) {
  const url = URL.createObjectURL(new Blob([bytesOf(bytes)], { type: "image/webp" }));
  const done = () => URL.revokeObjectURL(url);
  return pictures.load(url, done, undefined, done);
}

/** Fetches a kit file (packed or plain) as its document; `what` names it in the error. */
export async function fetchKit(url, what = url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`GET ${what} → ${response.status}`);
  return unpack(await response.arrayBuffer());
}
