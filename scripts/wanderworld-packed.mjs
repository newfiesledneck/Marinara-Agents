// Writes Wanderworld's packed kit files (`<name>.pack.png`, read by packages/wanderworld/src/packed.js,
// which says what's in one): a kit document with its base64 arrays taken out, filtered, and deflated
// together into an 8-bit grey PNG. About half the bytes of the same document as JSON, and a third less
// than base64 of the deflated arrays would be.
//
// Each builder says which of its document's strings are arrays, and of what (`kinds`: key → a function of
// the string's object and its ancestors giving [bytes per element, components], or null for bytes kept
// as they are); everything else stays in the JSON.
//
// As a script, it packs kit files the builders wrote as JSON before they wrote packed ones:
//   node scripts/wanderworld-packed.mjs <kit file.json> …   (writes <name>.pack.png beside each, removes it)
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { crc32, deflateSync } from "node:zlib";

const WIDTH = 4096; // the picture's width (its rows are the file's bytes, 4,096 at a time)
const deflate = (bytes) => deflateSync(bytes, { level: 9, memLevel: 9 });

/** An index's element size: four bytes in a mesh (or under one) marked `wide`, else two. */
const wideOf = (parent, ancestors) => ([parent, ...ancestors].find((node) => node && "wide" in node)?.wide ? 4 : 2);
const indexKind = (parent, ancestors) => [wideOf(parent, ancestors), 1];

/** The packed people (scripts/build-wanderworld-people.mjs packMesh): bodies, outfits, folk, the avatar. */
export const MESH_KINDS = {
  position: () => [2, 3],
  normal: () => [1, 3],
  uv: () => [2, 2],
  joints: () => [1, 4],
  weights: () => [1, 4],
  index: indexKind,
  far: indexKind,
  ids: indexKind,
  delta: () => [2, 3],
  partOf: () => [1, 1], // (an outfit piece's colour part for each vertex)
  webp: () => null, // (a picture in a bundle: `pictures`, [{ name, webp }])
};
/** The creatures with skeletons of their own (build-wanderworld-people.mjs rigged): glTF buffer views. */
export const RIGGED_KINDS = {
  data: (view) => [view.size, view.comps],
  webp: () => null,
};
/** The static models (scripts/build-wanderworld-kit.mjs). */
export const MODEL_KINDS = {
  position: () => [2, 3],
  normal: () => [1, 3],
  uv: () => [2, 2],
  colours: () => [1, 3],
  index: indexKind,
};
/** The animals (scripts/build-wanderworld-animals.mjs): their clips' turns are frames × bones × 4. */
export const ANIMAL_KINDS = {
  position: () => [2, 3],
  normal: () => [1, 3],
  part: () => [1, 1],
  joints: () => [1, 4],
  weights: () => [1, 4],
  index: indexKind,
  turns: (clip, ancestors) => [2, 4 * ancestors.find((node) => Array.isArray(node?.bones)).bones.length],
};

/**
 * An array's bytes, filtered for deflate: its `size`-byte elements split by component (`comps` of them in
 * turn), each made the difference from the one before (wrapping), and their bytes split into planes.
 */
export function filter(input, size, comps) {
  const Type = { 1: Uint8Array, 2: Uint16Array, 4: Uint32Array }[size];
  const values = new Type(input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength));
  const items = values.length / comps;
  const split = new Type(values.length);
  for (let c = 0; c < comps; c++) for (let i = 0; i < items; i++) split[c * items + i] = values[i * comps + c];
  for (let i = split.length - 1; i > 0; i--) split[i] -= split[i - 1];
  const lanes = new Uint8Array(split.buffer);
  const out = new Uint8Array(input.length);
  const n = split.length;
  for (let b = 0; b < size; b++) for (let i = 0; i < n; i++) out[b * n + i] = lanes[i * size + b];
  return out;
}

/** A kit document (with its arrays as base64 strings, as the builders make it) as a packed file's bytes. */
export function pack(document, kinds) {
  const arrays = [];
  const walk = (value, ancestors) => {
    if (Array.isArray(value)) return value.map((item) => walk(item, ancestors));
    if (!value || typeof value !== "object") return value;
    const out = {};
    for (const [key, item] of Object.entries(value)) {
      const kind = typeof item === "string" && item ? kinds[key]?.(value, ancestors) : undefined;
      out[key] = kind === undefined ? walk(item, [value, ...ancestors]) : place(item, kind);
    }
    return out;
  };
  const place = (base64, kind) => {
    const raw = Buffer.from(base64, "base64");
    const [size, comps] = kind ?? [1, 0];
    let bytes = raw;
    let filtered = 0;
    // (Filtered only where it deflates smaller, and the array divides into its elements.)
    if (comps && raw.length % (size * comps) === 0) {
      const candidate = filter(raw, size, comps);
      if (deflate(candidate).length < deflate(raw).length) [bytes, filtered] = [candidate, comps];
    }
    const at = { "@": [0, bytes.length, size, filtered] };
    arrays.push({ at, bytes });
    return at;
  };
  const stripped = walk(document, []);
  // The arrays after the document, in its order; each one's offset filled in once the document's length is
  // known (offsets are whole numbers, so their length is fixed by trying it).
  let text = JSON.stringify(stripped);
  for (;;) {
    let offset = 4 + Buffer.byteLength(text);
    for (const { at, bytes } of arrays) {
      at["@"][0] = offset;
      offset += bytes.length;
    }
    const next = JSON.stringify(stripped);
    if (next.length === text.length) {
      text = next;
      break;
    }
    text = next;
  }
  const head = Buffer.alloc(4);
  head.writeUInt32LE(Buffer.byteLength(text));
  const payload = Buffer.concat([head, Buffer.from(text), ...arrays.map(({ bytes }) => bytes)]);
  return png(payload);
}

/** Bytes as the pixels of an 8-bit grey PNG, WIDTH wide (the last row padded with zeros). */
function png(payload) {
  const height = Math.max(1, Math.ceil(payload.length / WIDTH));
  const rows = Buffer.alloc(height * (WIDTH + 1));
  for (let row = 0; row < height; row++)
    payload.copy(rows, row * (WIDTH + 1) + 1, row * WIDTH, Math.min(payload.length, (row + 1) * WIDTH));
  const chunk = (type, data) => {
    const out = Buffer.alloc(12 + data.length);
    out.writeUInt32BE(data.length, 0);
    out.write(type, 4, "latin1");
    data.copy(out, 8);
    out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
    return out;
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(WIDTH, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8; // bit depth
  header[9] = 0; // grey
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", deflate(rows)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/** Writes `document` packed to `path` (a `.pack.png`). */
export function writePacked(path, document, kinds) {
  writeFileSync(path, pack(document, kinds));
}

/** Which kinds a kit file's arrays are, by where it is (for packing a file a builder wrote as JSON). */
export function kindsFor(path) {
  const name = basename(path);
  if (/[\\/]creatures[\\/]/u.test(path) && !name.startsWith("rigged-")) return ANIMAL_KINDS;
  if (name === "models.json") return MODEL_KINDS;
  return MESH_KINDS;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  for (const path of process.argv.slice(2)) {
    const packedPath = join(dirname(path), `${basename(path, ".json")}.pack.png`);
    writePacked(packedPath, JSON.parse(readFileSync(path, "utf8")), kindsFor(path));
    rmSync(path);
    console.log(`packed ${path}`);
  }
}
