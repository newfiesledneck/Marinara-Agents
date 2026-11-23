// 3D Avatar Maker's paint mask: for each body, a picture in the skin picture's layout saying where the lips
// are (green), so the maker can colour them through the skin picture with a clean edge (src/skin.js).
// Written to packages/3d-avatar-maker/kit/avatar as avatar-<sex>-masks.png.
//
//   node scripts/build-3d-avatar-maker-masks.mjs
//
// Run it again after the bodies are repacked (scripts/build-3d-avatar-maker-kit.mjs). (The nails are shells
// of their own in the body, made by assets/scripts/make_avatar.py, and need no mask.)
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { crc32, deflateSync } from "node:zlib";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const KIT = join(ROOT, "packages/3d-avatar-maker/kit/avatar");
const { unpack } = await import(pathToFileURL(join(ROOT, "packages/3d-avatar-maker/src/packed.js")).href);
const { geometryOf } = await import(pathToFileURL(join(ROOT, "packages/3d-avatar-maker/src/kitfiles.js")).href);

export const MASK_SIZE = 2048;

/** A PNG of `width` × `height` RGB bytes (`rgb`, row by row). */
export function writePng(path, width, height, rgb) {
  const chunk = (type, data) => {
    const head = Buffer.alloc(8);
    head.writeUInt32BE(data.length, 0);
    head.write(type, 4, "latin1");
    const tail = Buffer.alloc(4);
    tail.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])) >>> 0, 0);
    return Buffer.concat([head, data, tail]);
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8; // bits per channel
  header[9] = 2; // RGB
  const rows = Buffer.alloc((width * 3 + 1) * height);
  // (Each row starts with its filter byte, 0: none.)
  for (let y = 0; y < height; y++) rows.set(rgb.subarray(y * width * 3, (y + 1) * width * 3), y * (width * 3 + 1) + 1);
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(rows, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  writeFileSync(path, png);
  return png.length;
}

/** Calls `paint(x, y, u, v, w)` for every texel centre inside the triangle (in texel units), with its weights. */
function rasterise(a, b, c, paint) {
  const minX = Math.max(0, Math.floor(Math.min(a[0], b[0], c[0])));
  const maxX = Math.min(MASK_SIZE - 1, Math.ceil(Math.max(a[0], b[0], c[0])));
  const minY = Math.max(0, Math.floor(Math.min(a[1], b[1], c[1])));
  const maxY = Math.min(MASK_SIZE - 1, Math.ceil(Math.max(a[1], b[1], c[1])));
  const area = (b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1]);
  if (Math.abs(area) < 1e-12) return;
  for (let y = minY; y <= maxY; y++)
    for (let x = minX; x <= maxX; x++) {
      const px = x + 0.5;
      const py = y + 0.5;
      // (A texel a hair outside an edge is kept, so neighbouring triangles leave no gap between them.)
      const w0 = ((b[0] - px) * (c[1] - py) - (c[0] - px) * (b[1] - py)) / area;
      const w1 = ((c[0] - px) * (a[1] - py) - (a[0] - px) * (c[1] - py)) / area;
      const w2 = 1 - w0 - w1;
      if (w0 < -0.02 || w1 < -0.02 || w2 < -0.02) continue;
      paint(x, y, w0, w1, w2);
    }
}

/** A mesh's positions, normals, texture places and triangles, decoded. */
function decoded(mesh) {
  const geometry = geometryOf(mesh);
  return {
    position: geometry.attributes.position.array,
    normal: geometry.attributes.normal.array,
    uv: geometry.attributes.uv.array,
    index: geometry.index.array,
    skinIndex: geometry.attributes.skinIndex.array,
    skinWeight: geometry.attributes.skinWeight.array,
  };
}

/** Softens a channel's edge: a box blur of `radius` texels, twice (close to a Gaussian). */
function soften(channel, radius) {
  const size = MASK_SIZE;
  const tmp = new Float32Array(channel.length);
  for (let pass = 0; pass < 2; pass++) {
    for (let y = 0; y < size; y++) {
      let sum = 0;
      for (let x = -radius; x <= radius; x++) sum += channel[y * size + Math.min(size - 1, Math.max(0, x))];
      for (let x = 0; x < size; x++) {
        tmp[y * size + x] = sum / (radius * 2 + 1);
        sum += channel[y * size + Math.min(size - 1, x + radius + 1)] - channel[y * size + Math.max(0, x - radius)];
      }
    }
    for (let x = 0; x < size; x++) {
      let sum = 0;
      for (let y = -radius; y <= radius; y++) sum += tmp[Math.min(size - 1, Math.max(0, y)) * size + x];
      for (let y = 0; y < size; y++) {
        channel[y * size + x] = sum / (radius * 2 + 1);
        sum += tmp[Math.min(size - 1, y + radius + 1) * size + x] - tmp[Math.max(0, y - radius) * size + x];
      }
    }
  }
}

for (const sex of ["male", "female"]) {
  const file = await unpack(readFileSync(join(KIT, `avatar-${sex}.pack.png`)));
  const lipMesh = file.meshes.find((mesh) => mesh.part === "lips" && !mesh.piece);
  if (!lipMesh) throw new Error(`avatar-${sex}: no lips to mask`);
  const lipFaces = decoded(lipMesh);
  const lips = new Float32Array(MASK_SIZE * MASK_SIZE);
  const texel = (uv, i) => [uv[i * 2] * MASK_SIZE, uv[i * 2 + 1] * MASK_SIZE];
  // The lips: their own faces, softened a little at the edge.
  for (let t = 0; t < lipFaces.index.length; t += 3) {
    const ids = [lipFaces.index[t], lipFaces.index[t + 1], lipFaces.index[t + 2]];
    rasterise(...ids.map((id) => texel(lipFaces.uv, id)), (x, y) => (lips[y * MASK_SIZE + x] = 1));
  }
  soften(lips, 2);
  const rgb = Buffer.alloc(MASK_SIZE * MASK_SIZE * 3);
  for (let i = 0; i < lips.length; i++) rgb[i * 3 + 1] = Math.round(Math.min(1, lips[i]) * 255);
  const bytes = writePng(join(KIT, `avatar-${sex}-masks.png`), MASK_SIZE, MASK_SIZE, rgb);
  console.log(`avatar-${sex}-masks.png: ${bytes} bytes`);
}
