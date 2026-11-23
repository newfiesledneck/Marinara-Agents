// 3D Avatar Maker's paint masks, pictures in the skin picture's layout that src/skin.js paints through:
// - for each body, where the lips are (green), so the maker can colour them with a soft edge that stays on
//   the lips: avatar-<sex>-masks.png;
// - where makeup goes (red the eyeshadow, green the eyeliner, blue the blush), found in the community packs'
//   made-up skins: avatar-makeup-masks.png, one for both bodies (they share the skin's layout).
// Written to packages/3d-avatar-maker/kit/avatar.
//
//   node scripts/build-3d-avatar-maker-masks.mjs
//
// Run it again after the bodies are repacked (scripts/build-3d-avatar-maker-kit.mjs). (The nails are shells
// of their own in the body, made by assets/scripts/make_avatar.py, and need no mask.) The makeup masks are
// made from MakeHuman's pictures in the user's asset folder (MAKEHUMAN_ASSETS and MAKEHUMAN_PACKS, else
// _planning/Wanderworld asset packs/MakeHuman here or above), with ffmpeg (on PATH, or FFMPEG); without them,
// the makeup masks in the kit are kept as they are.
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
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

// The lip faces reach a few texels past the lips the skin pictures paint (4 on the darker made-up skins, 7 on
// the pale young ones), so a colour at full strength to their edge spills onto the skin round the mouth. The
// outer lips fade in from their edge instead: nothing for the first FADE_FROM texels, all of it from FADE_TO in.
// (Where the lips meet, they keep the colour right up to the mouth.)
export const FADE_FROM = 1.5;
export const FADE_TO = 6;

/**
 * How far (in texels) each texel of `inside` is from the nearest texel outside it: a two-pass chamfer
 * distance (3 across, 4 diagonally, divided by 3), close to the true distance. Past the picture's edge is
 * outside, unless `edge` says it's far.
 */
function distanceIn(inside, edge = 0) {
  const size = MASK_SIZE;
  const far = new Float32Array(size * size);
  for (let i = 0; i < far.length; i++) far[i] = inside[i] ? 1e9 : 0;
  const at = (x, y) => (x < 0 || y < 0 || x >= size || y >= size ? edge : far[y * size + x]);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const i = y * size + x;
      if (far[i])
        far[i] = Math.min(far[i], at(x - 1, y) + 3, at(x, y - 1) + 3, at(x - 1, y - 1) + 4, at(x + 1, y - 1) + 4);
    }
  for (let y = size - 1; y >= 0; y--)
    for (let x = size - 1; x >= 0; x--) {
      const i = y * size + x;
      if (far[i])
        far[i] = Math.min(far[i], at(x + 1, y) + 3, at(x, y + 1) + 3, at(x + 1, y + 1) + 4, at(x - 1, y + 1) + 4);
    }
  for (let i = 0; i < far.length; i++) far[i] /= 3;
  return far;
}

/** The texels joined to `start` (4-way) where `keep(i)` holds, as a list of indices. */
function region(start, keep, seen) {
  const size = MASK_SIZE;
  const found = [];
  const stack = [start];
  seen[start] = 1;
  while (stack.length) {
    const i = stack.pop();
    found.push(i);
    const [x, y] = [i % size, Math.floor(i / size)];
    for (const [nx, ny] of [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ]) {
      if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;
      const j = ny * size + nx;
      if (!seen[j] && keep(j)) {
        seen[j] = 1;
        stack.push(j);
      }
    }
  }
  return found;
}

/** Each body's lips, as masked (the makeup keeps away from them). */
const lipsOf = {};
for (const sex of ["male", "female"]) {
  const file = await unpack(readFileSync(join(KIT, `avatar-${sex}.pack.png`)));
  const lipMesh = file.meshes.find((mesh) => mesh.part === "lips" && !mesh.piece);
  if (!lipMesh) throw new Error(`avatar-${sex}: no lips to mask`);
  const lipFaces = decoded(lipMesh);
  const faces = new Uint8Array(MASK_SIZE * MASK_SIZE);
  const texel = (uv, i) => [uv[i * 2] * MASK_SIZE, uv[i * 2 + 1] * MASK_SIZE];
  for (let t = 0; t < lipFaces.index.length; t += 3) {
    const ids = [lipFaces.index[t], lipFaces.index[t + 1], lipFaces.index[t + 2]];
    rasterise(...ids.map((id) => texel(lipFaces.uv, id)), (x, y) => (faces[y * MASK_SIZE + x] = 1));
  }
  // The outer lips (the biggest piece of the lip faces in the picture; the rest are inside the mouth), with
  // the mouth's slit filled, so only their outer edge fades.
  const seen = new Uint8Array(faces.length);
  const outside = new Uint8Array(faces.length);
  for (const i of region(0, (j) => !faces[j], seen)) outside[i] = 1;
  seen.fill(0);
  let outer = [];
  for (let i = 0; i < faces.length; i++)
    if (!outside[i] && !seen[i]) {
      const piece = region(i, (j) => !outside[j], seen);
      if (piece.length > outer.length) outer = piece;
    }
  const inside = new Uint8Array(faces.length);
  for (const i of outer) inside[i] = 1;
  const far = distanceIn(inside);
  const lips = new Float32Array(faces.length);
  for (let i = 0; i < lips.length; i++) {
    if (inside[i]) {
      const t = Math.min(1, Math.max(0, (far[i] - FADE_FROM) / (FADE_TO - FADE_FROM)));
      lips[i] = faces[i] || far[i] > FADE_TO ? t * t * (3 - 2 * t) : 0;
    } else lips[i] = faces[i];
  }
  soften(lips, 1);
  lipsOf[sex] = lips;
  const rgb = Buffer.alloc(MASK_SIZE * MASK_SIZE * 3);
  for (let i = 0; i < lips.length; i++) rgb[i * 3 + 1] = Math.round(Math.min(1, lips[i]) * 255);
  const bytes = writePng(join(KIT, `avatar-${sex}-masks.png`), MASK_SIZE, MASK_SIZE, rgb);
  console.log(`avatar-${sex}-masks.png: ${bytes} bytes`);
}

// ── Makeup: where the made-up skins paint it ─────────────────────────────────
// MargaretToigo's made-up skins (CC0) are MakeHuman's young light skins with their colours graded and makeup
// painted on. Over its plain picture, graded the same way, each differs only where its makeup is. Every one
// paints the same oval round each eye, which on the mesh is the rim of both lids: the eyeliner. The women's also
// paint a crescent on the upper lid (the eyeshadow) and one on each cheek (the blush); the dark-eyed men's
// smudge goes all round the eye, so the eyeshadow is taken from the women's alone. Each mask is the mean of
// what the skins that have it paint, full where they agree, softened, and kept on its own place: the
// eyeshadow out of the oval's middle, the blush 6 texels or more from the eyes and 12 from the lips.
// (A made-up skin shows plain lips again only through its lipstick, which the lip mask above paints.)

/** The made-up skins: [the made-up picture, its plain picture, whether it has eyeshadow and blush]; a picture is
 * [the folder, its item]: "system" is MakeHuman's own skins, else a community pack. */
const MADE_UP = [
  [["skins01_cc0", "toigo_light_skin_with_natural_makeup"], ["system", "young_caucasian_female2"], true],
  [["skins01_cc0", "toigo_light_skin_with_makeup"], ["system", "young_caucasian_female2"], true],
  [["skins01_cc0", "toigo_light_skin_female_with_violet_makeup"], ["system", "young_caucasian_female2"], true],
  [["skins01_cc0", "toigo_light_skin_female_bronze_with_makeup"], ["system", "young_caucasian_female2"], true],
  [
    ["skins01_cc0", "toigo_light_skin_female_ginger_with_makeup"],
    ["skins01_cc0", "toigo_light_skin_female_ginger"],
    true,
  ],
  [["skins02_cc0", "toigo_light_skin_male_with_eyeliner"], ["system", "young_caucasian_male"], false],
  [["skins02_cc0", "toigo_light_skin_male_with_goth_makeup"], ["system", "young_caucasian_male"], false],
  [["skins02_cc0", "toigo_light_skin_male_with_emo_eyes"], ["system", "young_caucasian_male"], false],
];
const EYELINER = 5; // (the one with nothing but eyeliner: where the ovals are)

/** MakeHuman's system skins and the community packs, as make_avatar.py finds them, or null. */
function makeHumanFolders() {
  let system = process.env.MAKEHUMAN_ASSETS;
  for (let here = ROOT; !system;) {
    const found = join(here, "_planning/Wanderworld asset packs/MakeHuman/makehuman_system_assets_cc0");
    if (existsSync(found)) system = found;
    else if (dirname(here) === here) return null;
    else here = dirname(here);
  }
  const packs = process.env.MAKEHUMAN_PACKS || join(dirname(system), "extracted");
  return existsSync(system) && existsSync(packs) ? { system, packs } : null;
}

/** A skin item's picture (its first .png, not a normal or specular map) as MASK_SIZE² RGB, 0 to 1. */
function readSkin(folders, [pack, item]) {
  const folder = pack === "system" ? join(folders.system, "skins", item) : join(folders.packs, pack, "skins", item);
  const [png] = readdirSync(folder)
    .filter((name) => /\.png$/iu.test(name) && !/_(?:nrm|spec)\.png$/iu.test(name))
    .sort();
  const raw = execFileSync(
    process.env.FFMPEG ?? "ffmpeg",
    ["-v", "error", "-i", join(folder, png), "-vf", `scale=${MASK_SIZE}:${MASK_SIZE}:flags=bicubic`].concat([
      "-f",
      "rawvideo",
      "-pix_fmt",
      "rgb24",
      "-",
    ]),
    { maxBuffer: MASK_SIZE * MASK_SIZE * 3 + 1024 },
  );
  const out = new Float32Array(MASK_SIZE * MASK_SIZE * 3);
  for (let i = 0; i < out.length; i++) out[i] = raw[i] / 255;
  return out;
}

/** The value `share` of the way up the sorted `values` (a Float32Array, sorted in place). */
const percentile = (values, share) => values.sort()[Math.round(share * (values.length - 1))];

/**
 * `plain` graded to look like `made`: each texel's colour times a 3 × 3 matrix plus an offset, fitted by least
 * squares to every seventh texel, three times over, each time leaving out those that differ most (the makeup).
 */
function graded(made, plain) {
  const count = MASK_SIZE * MASK_SIZE;
  let keep = null;
  let fit = null;
  const residual = new Float32Array(count);
  for (let pass = 0; pass < 3; pass++) {
    const a = Array.from({ length: 4 }, () => [0, 0, 0, 0, 0, 0, 0]); // [XᵀX | XᵀY]
    for (let i = 0; i < count; i += 7) {
      if (keep && !keep[i]) continue;
      const x = [plain[i * 3], plain[i * 3 + 1], plain[i * 3 + 2], 1];
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) a[r][c] += x[r] * x[c];
        for (let c = 0; c < 3; c++) a[r][4 + c] += x[r] * made[i * 3 + c];
      }
    }
    // (Gauss-Jordan with partial pivoting: the 4 × 3 matrix in columns 4 to 6.)
    for (let col = 0; col < 4; col++) {
      let pivot = col;
      for (let r = col + 1; r < 4; r++) if (Math.abs(a[r][col]) > Math.abs(a[pivot][col])) pivot = r;
      [a[col], a[pivot]] = [a[pivot], a[col]];
      for (let r = 0; r < 4; r++) {
        if (r === col) continue;
        const f = a[r][col] / a[col][col];
        for (let c = col; c < 7; c++) a[r][c] -= f * a[col][c];
      }
    }
    fit = a.map((row, r) => row.slice(4).map((value) => value / a[r][r]));
    const sample = new Float32Array(Math.ceil(count / 7));
    for (let i = 0; i < count; i++) {
      let most = 0;
      for (let c = 0; c < 3; c++) {
        const value =
          plain[i * 3] * fit[0][c] + plain[i * 3 + 1] * fit[1][c] + plain[i * 3 + 2] * fit[2][c] + fit[3][c];
        most = Math.max(most, Math.abs(value - made[i * 3 + c]));
      }
      residual[i] = most;
      if (i % 7 === 0) sample[i / 7] = most;
    }
    const limit = Math.max(0.02, percentile(sample, 0.7));
    keep = residual.map((value) => (value < limit ? 1 : 0));
  }
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++)
    for (let c = 0; c < 3; c++)
      out[i * 3 + c] =
        plain[i * 3] * fit[0][c] + plain[i * 3 + 1] * fit[1][c] + plain[i * 3 + 2] * fit[2][c] + fit[3][c];
  return out;
}

/** The `count` biggest 4-way joined pieces of `mask` (a Uint8Array), as a Uint8Array. */
function biggest(mask, count) {
  const seen = new Uint8Array(mask.length);
  const pieces = [];
  for (let i = 0; i < mask.length; i++) if (mask[i] && !seen[i]) pieces.push(region(i, (j) => mask[j], seen));
  const out = new Uint8Array(mask.length);
  for (const piece of pieces.sort((a, b) => b.length - a.length).slice(0, count)) for (const i of piece) out[i] = 1;
  return out;
}
/** How far each texel is from `mask` (0 on it). */
const distanceFrom = (mask) =>
  distanceIn(
    mask.map((value) => (value ? 0 : 1)),
    1e9,
  );
const where = (count, test) => {
  const out = new Uint8Array(count);
  for (let i = 0; i < count; i++) out[i] = test(i) ? 1 : 0;
  return out;
};

/**
 * How far `made` has gone from `plain` towards its makeup's colour, 0 to 1, in each texel of `area`: the
 * colour is the middle of the most changed fifth of the area, and the share is along the line from `plain`'s
 * colour to it (the blend src/skin.js paints with).
 */
function towards(made, plain, change, area) {
  const inArea = [];
  for (let i = 0; i < area.length; i++) if (area[i]) inArea.push(i);
  const most = percentile(
    Float32Array.from(inArea, (i) => change[i]),
    0.8,
  );
  const core = inArea.filter((i) => change[i] >= most);
  const colour = [0, 1, 2].map((c) =>
    percentile(
      Float32Array.from(core, (i) => made[i * 3 + c]),
      0.5,
    ),
  );
  const out = new Float32Array(area.length);
  for (const i of inArea) {
    let along = 0;
    let length = 0;
    for (let c = 0; c < 3; c++) {
      const to = colour[c] - plain[i * 3 + c];
      along += (made[i * 3 + c] - plain[i * 3 + c]) * to;
      length += to * to;
    }
    out[i] = Math.min(1, Math.max(0, along / Math.max(length, 1e-4)));
  }
  return out;
}

/** A mask scaled so the most of it (its 95th percentile above 0.1) is 1. */
function normalise(channel) {
  const top = percentile(
    channel.filter((value) => value > 0.1),
    0.95,
  );
  return top ? channel.map((value) => Math.min(1, value / top)) : channel;
}
/** A mask without its faint edge (below 0.06) or specks (all but its two biggest pieces), softened. */
function cleaned(channel, radius) {
  const kept = biggest(
    channel.map((value) => (value >= 0.06 ? 1 : 0)),
    2,
  );
  const out = channel.map((value, i) => (kept[i] ? value : 0));
  soften(out, radius);
  return out;
}

const folders = makeHumanFolders();
if (!folders) console.log("avatar-makeup-masks.png: MakeHuman's pictures not found; kept as it is");
else {
  const count = MASK_SIZE * MASK_SIZE;
  const pairOf = ([made, plain]) => {
    const picture = readSkin(folders, made);
    const plainPicture = graded(picture, readSkin(folders, plain));
    const change = new Float32Array(count);
    for (let i = 0; i < count; i++)
      for (let c = 0; c < 3; c++)
        change[i] = Math.max(change[i], Math.abs(picture[i * 3 + c] - plainPicture[i * 3 + c]));
    return { picture, plainPicture, change };
  };
  // The ovals round the eyes: the eyeliner skin's two biggest changes, holes and all.
  const eyeliner = pairOf(MADE_UP[EYELINER]);
  const lined = biggest(
    eyeliner.change.map((value) => (value > 0.12 ? 1 : 0)),
    2,
  );
  const outside = new Uint8Array(count);
  for (const i of region(0, (j) => !lined[j], new Uint8Array(count))) outside[i] = 1;
  const oval = outside.map((value) => 1 - value);
  const fromOval = distanceFrom(oval);
  const lips = where(count, (i) => lipsOf.male[i] > 0.02 || lipsOf.female[i] > 0.02);
  const fromLips = distanceFrom(lips);
  const nearEyes = where(count, (i) => fromOval[i] <= 22);
  const nearOval = where(count, (i) => fromOval[i] <= 3);
  const awayFromBoth = where(count, (i) => fromLips[i] > 12 && fromOval[i] > 26);
  const sums = {
    eyeliner: new Float32Array(count),
    eyeshadow: new Float32Array(count),
    blush: new Float32Array(count),
  };
  const counts = { eyeliner: 0, eyeshadow: 0, blush: 0 };
  const add = (layer, share) => {
    for (let i = 0; i < count; i++) sums[layer][i] += share[i];
    counts[layer]++;
  };
  for (const [n, entry] of MADE_UP.entries()) {
    const { picture, plainPicture, change } = n === EYELINER ? eyeliner : pairOf(entry);
    add("eyeliner", towards(picture, plainPicture, change, nearOval));
    if (!entry[2]) continue;
    // The lid: the two biggest changes round the eyes, a little wider, outside the oval.
    const lids = distanceFrom(
      biggest(
        where(count, (i) => change[i] > 0.05 && nearEyes[i]),
        2,
      ),
    );
    add(
      "eyeshadow",
      towards(
        picture,
        plainPicture,
        change,
        where(count, (i) => lids[i] <= 3 && nearEyes[i] && !oval[i]),
      ),
    );
    // The cheeks: the two biggest changes away from the eyes and lips, a little wider.
    const cheeks = distanceFrom(
      biggest(
        where(count, (i) => change[i] > 0.03 && awayFromBoth[i]),
        2,
      ),
    );
    add(
      "blush",
      towards(
        picture,
        plainPicture,
        change,
        where(count, (i) => cheeks[i] <= 6 && awayFromBoth[i]),
      ),
    );
  }
  const mean = (layer) => sums[layer].map((value) => value / counts[layer]);
  const liner = cleaned(normalise(mean("eyeliner")), 1);
  // (The eyeshadow stays out of the oval's middle: the eyeliner's place, and on the mesh the inside of the lids.)
  const middle = distanceIn(oval).map((value) => (value > 3 ? 1 : 0));
  soften(middle, 1);
  const shadow = cleaned(normalise(mean("eyeshadow")), 1).map((value, i) => value * (1 - middle[i]));
  const blush = cleaned(normalise(mean("blush")), 5);
  const fromMakeup = distanceFrom(where(count, (i) => liner[i] > 0.03 || shadow[i] > 0.03));
  const rgb = Buffer.alloc(count * 3);
  for (let i = 0; i < count; i++) {
    const clear = Math.min(1, Math.max(0, (fromMakeup[i] - 6) / 6));
    rgb[i * 3] = Math.round(Math.min(1, shadow[i]) * 255);
    rgb[i * 3 + 1] = Math.round(Math.min(1, liner[i]) * 255);
    rgb[i * 3 + 2] = Math.round(Math.min(1, blush[i] * clear) * 255);
  }
  const bytes = writePng(join(KIT, "avatar-makeup-masks.png"), MASK_SIZE, MASK_SIZE, rgb);
  console.log(`avatar-makeup-masks.png: ${bytes} bytes`);
}
