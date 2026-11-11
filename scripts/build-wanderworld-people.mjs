#!/usr/bin/env node
// Converts Quaternius's Universal Base Characters and Modular Character Outfits - Fantasy (both CC0, free
// "Standard" downloads) into Wanderworld's people kit: packages/wanderworld/kit/generic/people/ and kit/fantasy/outfits/: meshes and
// *.webp textures, which the package serves as assets and the game loads only when someone needs a
// default look (src/people.js).
//
// Usage (unzip both packs first; ffmpeg must be on PATH, or set FFMPEG):
//   node scripts/build-wanderworld-people.mjs "<…>/Universal Base Characters[Standard]" "<…>/Modular Character Outfits - Fantasy[Standard]"
//
// Each part (an outfit, a head, a hairstyle) keeps its own joints' inverse bind matrices, and every part
// of a person binds to one shared skeleton built from the outfit's. So a head cut from the base body, or a
// hairstyle rigged to its head bone, sits right on an outfit's body without reshaping anything.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
// Where it all goes, by setting: the bodies (skeletons, heads, hair, skin, and the bare body for a piece
// left off) are any world's, in one file, bodies.json; the outfits and their cloth are the medieval
// one's. src/people.js tells them apart by name the same way.
const KIT = join(ROOT, "packages/wanderworld/kit");
const OUT = join(KIT, "generic/people");
const OUTFITS = join(KIT, "fantasy/outfits");
const BODY_FILE = /^(?:index|bodies|eyes|hair-|head-|plain-head-|plain-skin-|skin-|tunic-mask)/u;
const dirFor = (name) => (BODY_FILE.test(name) ? OUT : OUTFITS);
/** Everything of the bodies', for bodies.json: { parts: { "hair-long": …, "head-male": …, "skeleton-male": … }, bare: { male: { pieces } } }. */
const packed = { parts: {}, bare: {} };
const FFMPEG = process.env.FFMPEG || "ffmpeg";
const TEXTURE_SIZE = 512;

// ── A small glTF reader: accessors, skins and images, nothing else ──

function readGltf(path) {
  let json;
  let buffers;
  if (path.toLowerCase().endsWith(".glb")) {
    // A binary glTF: its JSON, then its one buffer, its images inside that (each read out by `imageOf`).
    const file = readFileSync(path);
    const jsonLength = file.readUInt32LE(12);
    json = JSON.parse(file.subarray(20, 20 + jsonLength).toString("utf8"));
    buffers = [file.subarray(20 + jsonLength + 8)];
  } else {
    json = JSON.parse(readFileSync(path, "utf8"));
    // (A buffer is a file beside it, or the data itself, written into the .gltf as base64.)
    buffers = json.buffers.map((buffer) =>
      buffer.uri.startsWith("data:")
        ? Buffer.from(buffer.uri.slice(buffer.uri.indexOf(",") + 1), "base64")
        : readFileSync(join(dirname(path), decodeURIComponent(buffer.uri))),
    );
  }
  const COMPONENTS = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
  const TYPES = {
    5120: Int8Array,
    5121: Uint8Array,
    5122: Int16Array,
    5123: Uint16Array,
    5125: Uint32Array,
    5126: Float32Array,
  };
  function accessor(index) {
    const info = json.accessors[index];
    const view = json.bufferViews[info.bufferView];
    const Type = TYPES[info.componentType];
    const size = COMPONENTS[info.type];
    const buffer = buffers[view.buffer];
    const start = buffer.byteOffset + (view.byteOffset ?? 0) + (info.byteOffset ?? 0);
    const stride = view.byteStride ?? size * Type.BYTES_PER_ELEMENT;
    const out = new Float64Array(info.count * size);
    const data = new DataView(buffer.buffer);
    const read = {
      5120: (o) => data.getInt8(o),
      5121: (o) => data.getUint8(o),
      5122: (o) => data.getInt16(o, true),
      5123: (o) => data.getUint16(o, true),
      5125: (o) => data.getUint32(o, true),
      5126: (o) => data.getFloat32(o, true),
    }[info.componentType];
    const scale = info.normalized ? { 5120: 127, 5121: 255, 5122: 32767, 5123: 65535 }[info.componentType] : 1;
    for (let i = 0; i < info.count; i++) {
      for (let c = 0; c < size; c++) out[i * size + c] = read(start + i * stride + c * Type.BYTES_PER_ELEMENT) / scale;
    }
    return { values: out, size, count: info.count };
  }
  const textureOf = (materialIndex) => {
    const material = json.materials?.[materialIndex];
    const texture = material?.pbrMetallicRoughness?.baseColorTexture;
    if (!texture) return null;
    const source = json.textures[texture.index].source;
    return json.images[source].uri ?? `image:${source}`;
  };
  /** The bytes of a .glb's own image (named "image:<n>" by `textureOf`). */
  const imageOf = (name) => {
    const view = json.bufferViews[json.images[Number(name.slice("image:".length))].bufferView];
    return buffers[0].subarray(view.byteOffset ?? 0, (view.byteOffset ?? 0) + view.byteLength);
  };
  return { json, accessor, textureOf, imageOf };
}

/** Every skinned mesh primitive in a file: geometry, its material's texture, and its skin's joints. */
function skinnedPrimitives(gltf) {
  const out = [];
  gltf.json.nodes.forEach((node) => {
    if (node.mesh === undefined || node.skin === undefined) return;
    const skin = gltf.json.skins[node.skin];
    const jointNames = skin.joints.map((j) => gltf.json.nodes[j].name);
    const ibm = gltf.accessor(skin.inverseBindMatrices).values;
    for (const primitive of gltf.json.meshes[node.mesh].primitives) {
      out.push({
        name: gltf.json.meshes[node.mesh].name,
        texture: gltf.textureOf(primitive.material),
        material: gltf.json.materials?.[primitive.material] ?? null,
        position: gltf.accessor(primitive.attributes.POSITION),
        normal: gltf.accessor(primitive.attributes.NORMAL),
        // (A mesh coloured by its material alone may have no texture coordinates: all zero, then.)
        uv:
          primitive.attributes.TEXCOORD_0 === undefined
            ? { values: new Float64Array(gltf.json.accessors[primitive.attributes.POSITION].count * 2) }
            : gltf.accessor(primitive.attributes.TEXCOORD_0),
        joints: gltf.accessor(primitive.attributes.JOINTS_0),
        weights: gltf.accessor(primitive.attributes.WEIGHTS_0),
        index: gltf.accessor(primitive.indices),
        jointNames,
        ibm,
      });
    }
  });
  return out;
}

// ── Packing: quantized arrays as base64 ──

const b64 = (typed) => Buffer.from(typed.buffer, typed.byteOffset, typed.byteLength).toString("base64");

/** One mesh, quantized: positions int16 within its box, normals int8, uvs uint16 (0…1, wrapped), joint
 *  indices uint8 into the part's joint list, weights uint8. `keep(triangle)` can drop triangles. */
function packMesh(primitive, texture, jointIndex, keep = () => true) {
  const triangles = [];
  for (let i = 0; i < primitive.index.count; i += 3) {
    const tri = [primitive.index.values[i], primitive.index.values[i + 1], primitive.index.values[i + 2]];
    if (keep(tri)) triangles.push(tri);
  }
  // Only the vertices the kept triangles use, renumbered.
  const remap = new Map();
  for (const tri of triangles) for (const v of tri) if (!remap.has(v)) remap.set(v, remap.size);
  const count = remap.size;
  const p = primitive.position.values;
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (const v of remap.keys()) {
    for (let c = 0; c < 3; c++) {
      min[c] = Math.min(min[c], p[v * 3 + c]);
      max[c] = Math.max(max[c], p[v * 3 + c]);
    }
  }
  const position = new Int16Array(count * 3);
  const normal = new Int8Array(count * 3);
  const uv = new Uint16Array(count * 2);
  const joints = new Uint8Array(count * 4);
  const weights = new Uint8Array(count * 4);
  for (const [v, n] of remap) {
    for (let c = 0; c < 3; c++) {
      const span = max[c] - min[c] || 1;
      position[n * 3 + c] = Math.round(((p[v * 3 + c] - min[c]) / span) * 65535 - 32768);
      normal[n * 3 + c] = Math.round(primitive.normal.values[v * 3 + c] * 127);
    }
    for (let c = 0; c < 2; c++) {
      const value = primitive.uv.values[v * 2 + c];
      uv[n * 2 + c] = Math.round((value - Math.floor(value === 1 ? 0 : value)) * 65535);
    }
    let total = 0;
    for (let c = 0; c < 4; c++) total += primitive.weights.values[v * 4 + c];
    for (let c = 0; c < 4; c++) {
      joints[n * 4 + c] = jointIndex(primitive.jointNames[primitive.joints.values[v * 4 + c]]);
      weights[n * 4 + c] = Math.round((primitive.weights.values[v * 4 + c] / (total || 1)) * 255);
    }
  }
  const index = count > 65535 ? new Uint32Array(triangles.length * 3) : new Uint16Array(triangles.length * 3);
  triangles.forEach((tri, i) => tri.forEach((v, c) => (index[i * 3 + c] = remap.get(v))));
  return {
    texture,
    count,
    box: [...min, ...max].map((value) => Math.round(value * 1e5) / 1e5),
    position: b64(position),
    normal: b64(normal),
    uv: b64(uv),
    joints: b64(joints),
    weights: b64(weights),
    index: b64(index),
    wide: index instanceof Uint32Array,
  };
}

/** A part file: its joints (names and inverse bind matrices) and meshes; a body also carries the skeleton. */
function packPart(primitives, { texture, keep, skeleton } = {}) {
  const names = [];
  const ibms = [];
  const jointIndex = (name) => names.indexOf(name);
  for (const primitive of primitives) {
    primitive.jointNames.forEach((name, i) => {
      if (names.includes(name)) return;
      names.push(name);
      ibms.push(...Array.from(primitive.ibm.slice(i * 16, i * 16 + 16)).map((value) => Math.round(value * 1e6) / 1e6));
    });
  }
  const meshes = primitives.map((primitive) => packMesh(primitive, texture(primitive), jointIndex, keep?.(primitive)));
  return { joints: names, inverseBind: ibms, meshes, ...(skeleton ? { skeleton } : {}) };
}

/** The skeleton from an outfit file: each joint's name and parent (by index), in bind pose. */
function skeletonOf(gltf) {
  const skin = gltf.json.skins[0];
  const names = skin.joints.map((j) => gltf.json.nodes[j].name);
  const parents = names.map(() => -1);
  skin.joints.forEach((j, i) => {
    for (const child of gltf.json.nodes[j].children ?? []) {
      const at = skin.joints.indexOf(child);
      if (at >= 0) parents[at] = i;
    }
  });
  return { names, parents };
}

/**
 * Where the tunic and sleeves lie on the outfit texture: the texture coordinates of the pack's separate
 * Body and Arms pieces (both sexes), drawn into a greyscale mask file and grown by a pixel against seams.
 * The colourways below change only this, so trousers and boots keep their own colours.
 */
function tunicMask(partsDir, size) {
  const mask = new Uint8Array(size * size);
  for (const sex of ["Male", "Female"]) {
    for (const piece of ["Body", "Arms"]) {
      for (const primitive of skinnedPrimitives(readGltf(join(partsDir, `${sex}_Peasant_${piece}.gltf`)))) {
        if (!/Peasant/iu.test(primitive.texture ?? "")) continue; // bare arms are skin
        const uv = primitive.uv.values;
        const index = primitive.index.values;
        for (let t = 0; t < index.length; t += 3) {
          const corners = [0, 1, 2].map((k) => {
            const v = index[t + k];
            const wrap = (value) => value - Math.floor(value);
            return [wrap(uv[v * 2]) * size, wrap(uv[v * 2 + 1]) * size];
          });
          const [[ax, ay], [bx, by], [cx, cy]] = corners;
          const area = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
          if (!area) continue;
          const minX = Math.max(0, Math.floor(Math.min(ax, bx, cx)) - 1);
          const maxX = Math.min(size - 1, Math.ceil(Math.max(ax, bx, cx)) + 1);
          const minY = Math.max(0, Math.floor(Math.min(ay, by, cy)) - 1);
          const maxY = Math.min(size - 1, Math.ceil(Math.max(ay, by, cy)) + 1);
          for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
              const px = x + 0.5;
              const py = y + 0.5;
              const w0 = ((bx - px) * (cy - py) - (by - py) * (cx - px)) / area;
              const w1 = ((cx - px) * (ay - py) - (cy - py) * (ax - px)) / area;
              const w2 = 1 - w0 - w1;
              const slack = 1.5 / Math.sqrt(Math.abs(area)); // about a pixel's worth outside the edge
              if (w0 >= -slack && w1 >= -slack && w2 >= -slack) mask[y * size + x] = 255;
            }
          }
        }
      }
    }
  }
  const file = join(OUT, "tunic-mask.pgm"); // a scratch file: removed once the colourways are made
  writeFileSync(file, Buffer.concat([Buffer.from(`P5 ${size} ${size} 255\n`), Buffer.from(mask)]));
  return file;
}

/** `source` with `filter` (a colour change) applied only where `mask` is white. */
function recolour(source, name, filter, mask, size = TEXTURE_SIZE) {
  execFileSync(FFMPEG, [
    "-v",
    "error",
    "-y",
    "-i",
    source,
    "-i",
    mask,
    "-filter_complex",
    `[0]scale=${size}:${size},format=gbrp,split[a][b];[b]${filter},format=gbrp[c];[1]format=gray,format=gbrp[m];[a][c][m]maskedmerge`,
    "-quality",
    "82",
    join(dirFor(name), `${name}.webp`),
  ]);
  return name;
}

/** A texture shrunk to its size. */
function texture(source, name, size = TEXTURE_SIZE, filter = "") {
  execFileSync(FFMPEG, [
    "-v",
    "error",
    "-y",
    "-i",
    source,
    "-vf",
    `scale=${size}:${size}${filter ? `,${filter}` : ""}`,
    "-quality",
    "82",
    join(dirFor(name), `${name}.webp`),
  ]);
  return name;
}

/**
 * How light a made texture is (0–255), on average: over the texture coordinates given (`uvs`: arrays of
 * u, v pairs, a piece's own), or over all of it that isn't empty black.
 */
function toneOf(name, uvs = null) {
  const size = 128;
  const grey = execFileSync(
    FFMPEG,
    [
      "-v",
      "error",
      "-i",
      join(dirFor(name), `${name}.webp`),
      "-vf",
      `scale=${size}:${size},format=gray`,
      "-f",
      "rawvideo",
      "-",
    ],
    { maxBuffer: 1 << 24 },
  );
  let sum = 0;
  let count = 0;
  if (uvs?.length) {
    for (const values of uvs) {
      for (let i = 0; i + 1 < values.length; i += 2) {
        const wrap = (value) => value - Math.floor(value);
        const x = Math.min(size - 1, Math.floor(wrap(values[i]) * size));
        const y = Math.min(size - 1, Math.floor(wrap(values[i + 1]) * size));
        sum += grey[y * size + x];
        count++;
      }
    }
  } else {
    for (const value of grey) {
      if (value < 12) continue;
      sum += value;
      count++;
    }
  }
  return Math.max(16, Math.round(count ? sum / count : 128));
}

/**
 * The monsters that stand on the people's skeleton (Quaternius's Bestiary - Dungeon Monsters Kit: the imp
 * and the puglin), each as one part with its skeleton, into kit/fantasy/folk/folk.json with a texture
 * each. They have no animations of their own: the game moves them with the people's.
 */
function folk(dir) {
  const out = join(KIT, "fantasy/folk");
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  const all = { source: "Bestiary - Dungeon Monsters Kit by Quaternius", folk: {} };
  for (const [name, file] of [
    ["imp", "Imp.glb"],
    ["puglin", "Puglin.glb"],
  ]) {
    const gltf = readGltf(join(dir, file));
    const primitives = skinnedPrimitives(gltf);
    const png = join(out, `${name}.png`);
    writeFileSync(png, gltf.imageOf(primitives[0].texture));
    execFileSync(FFMPEG, [
      "-v",
      "error",
      "-y",
      "-i",
      png,
      "-vf",
      `scale=${TEXTURE_SIZE}:${TEXTURE_SIZE}`,
      "-quality",
      "82",
      join(out, `folk-${name}.webp`),
    ]);
    rmSync(png);
    let top = 0;
    for (const primitive of primitives)
      for (let i = 1; i < primitive.position.values.length; i += 3) top = Math.max(top, primitive.position.values[i]);
    all.folk[name] = {
      height: Math.round(top * 100) / 100,
      ...packPart(primitives, { texture: () => `folk-${name}`, skeleton: skeletonOf(gltf) }),
    };
  }
  writeFileSync(join(out, "folk.json"), JSON.stringify(all));
  console.log(`wrote ${out}`);
}

/**
 * Costumes: whole ready-made characters (Quaternius's Ultimate Modular Men and Women, CC0: their
 * `Individual Characters/glTF` folders), each a body, its clothes and its hair in one, coloured by its
 * materials (no textures). One file each in kit/fantasy/costumes: its skeleton, its meshes (each named for
 * its material, `texture`), and the materials' colours. The game moves them with the people's clips.
 */
const COSTUMES = {
  // [our name, which folder (0: men, 1: women), the file]
  king: [0, "King"],
  farmer: [0, "Farmer"],
  adventurer: [0, "Adventurer"],
  witch: [1, "Witch"],
  rogue: [1, "Medieval"],
  wanderer: [1, "Adventurer"],
};
function costumes(dirs) {
  const out = join(KIT, "fantasy/costumes");
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  for (const [name, [folder, file]] of Object.entries(COSTUMES)) {
    const gltf = readGltf(join(dirs[folder], `${file}.gltf`));
    const primitives = skinnedPrimitives(gltf);
    const colours = {};
    let top = 0;
    for (const primitive of primitives) {
      const colour = primitive.material?.pbrMetallicRoughness?.baseColorFactor ?? [0.5, 0.5, 0.5];
      colours[primitive.material?.name ?? "Plain"] = colour.slice(0, 3).map((value) => Math.round(value * 1e4) / 1e4);
      for (let i = 1; i < primitive.position.values.length; i += 3) top = Math.max(top, primitive.position.values[i]);
    }
    // The pack's feet are steered from the root (for its own animations); here each is its shin's, as the
    // people's clips move a leg.
    const skeleton = skeletonOf(gltf);
    for (const side of ["L", "R"]) {
      const foot = skeleton.names.indexOf(`Foot.${side}`);
      const shin = skeleton.names.indexOf(`LowerLeg.${side}`);
      if (foot >= 0 && shin >= 0) skeleton.parents[foot] = shin;
    }
    const body = {
      source: "Ultimate Modular Men and Ultimate Modular Women by Quaternius, CC0 1.0",
      height: Math.round(top * 100) / 100,
      colours,
      ...packPart(primitives, {
        texture: (primitive) => primitive.material?.name ?? "Plain",
        skeleton,
      }),
    };
    // (They're coloured by material, not painted: the texture coordinates aren't needed.)
    for (const mesh of body.meshes) delete mesh.uv;
    writeFileSync(join(out, `costume-${name}.json`), JSON.stringify(body));
    console.log(`${name.padEnd(11)} ${primitives.length} meshes, ${Math.round(JSON.stringify(body).length / 1024)} KB`);
  }
  console.log(`wrote ${out}`);
}

function main() {
  if (process.argv[2] === "--costumes") {
    if (!process.argv[4])
      throw new Error("Usage: build-wanderworld-people.mjs --costumes <men glTF dir> <women glTF dir>");
    return costumes(process.argv.slice(3, 5));
  }
  if (process.argv[2] === "--folk") {
    if (!process.argv[3]) throw new Error("Usage: build-wanderworld-people.mjs --folk <Bestiary GLB dir>");
    return folk(process.argv[3]);
  }
  const [baseDir, outfitDir] = process.argv.slice(2);
  if (!baseDir || !outfitDir)
    throw new Error(
      "Usage: build-wanderworld-people.mjs <Universal Base Characters dir> <Modular Character Outfits dir>",
    );
  for (const dir of [OUT, OUTFITS]) {
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
  }
  const bodies = join(baseDir, "Base Characters/Godot - UE");
  const hairs = join(baseDir, "Hairstyles/Rigged to Head Bone/glTF (Godot -Unreal)");
  const outfits = join(outfitDir, "Exports/glTF (Godot-Unreal)/Outfits");
  const outfitTextures = join(outfitDir, "Textures");
  const index = {
    source: "Universal Base Characters and Modular Character Outfits - Fantasy by Quaternius, CC0 1.0",
    sexes: {},
    hair: {},
  };

  // Textures: skin, eyes, hair, and the everyday (peasant) clothes in the pack's two colourways plus a few
  // more made by turning their colours, so a town of people isn't all in brown.
  texture(join(bodies, "T_Eye_Brown.png"), "eyes", 128);
  texture(join(bodies, "T_Hair_1_BaseColor.png"), "hair-1");
  texture(join(bodies, "T_Hair_2_BaseColor.png"), "hair-2");
  const peasant = join(outfitTextures, "Peasant/T_Peasant_BaseColor.png");
  const peasant2 = join(outfitTextures, "Peasant/T_Peasant_2_BaseColor.png");
  const mask = tunicMask(join(outfitDir, "Exports/glTF (Godot-Unreal)/Modular Parts"), TEXTURE_SIZE);
  const colourways = [
    texture(peasant, "clothes-a"),
    // (The pack's second colourway is very dark: lifted, so it reads as brown and olive, not black.)
    texture(peasant2, "clothes-b", TEXTURE_SIZE, "eq=gamma=1.5"),
    recolour(peasant, "clothes-blue", "hue=h=190:s=1.3", mask),
    recolour(peasant, "clothes-red", "hue=h=-25:s=1.5", mask),
    recolour(peasant2, "clothes-teal", "hue=h=110:s=1.4,eq=gamma=1.7", mask),
    recolour(peasant, "clothes-plum", "hue=h=-65:s=0.75", mask),
    recolour(peasant, "clothes-grey", "hue=s=0.25,eq=brightness=0.04", mask),
  ];
  rmSync(mask);
  // Plain cloth and skin: the same textures with their colour taken out, for a piece (or skin) given a
  // colour of its own. Multiplying a coloured cloth by another colour only muddies it; a grey one, times
  // the colour over the piece's own tone (index.tones, measured below), comes out as the colour picked.
  index.tones = {};
  const plain = (source, name) => texture(source, name, TEXTURE_SIZE, "hue=s=0,eq=gamma=1.25");
  plain(peasant, "plain-peasant");
  // The ranger outfit: the pack's two colourways, and a few more by turning the whole cloth's colours.
  const ranger = join(outfitTextures, "Ranger/T_Ranger_BaseColor.png");
  const ranger3 = join(outfitTextures, "Ranger/T_Ranger_3_BaseColor.png");
  plain(ranger, "plain-ranger");
  const rangerColourways = [
    texture(ranger, "ranger-a"),
    texture(ranger3, "ranger-b"),
    // (The outfit is dark leather and wool: each of these is lifted as well as turned, or it reads as black.)
    texture(ranger, "ranger-wine", TEXTURE_SIZE, "hue=h=-100:s=0.85,eq=gamma=1.25"),
    texture(ranger3, "ranger-dusk", TEXTURE_SIZE, "hue=h=150:s=0.9,eq=gamma=1.3"),
    texture(ranger, "ranger-grey", TEXTURE_SIZE, "hue=s=0.15,eq=gamma=1.6:brightness=0.03"),
    texture(ranger3, "ranger-rust", TEXTURE_SIZE, "hue=h=-20:s=1.15,eq=gamma=1.3"),
    texture(ranger, "ranger-moss", TEXTURE_SIZE, "hue=h=25:s=1.05,eq=gamma=1.3"),
  ];

  for (const [sex, Sex] of [
    ["male", "Male"],
    ["female", "Female"],
  ]) {
    texture(join(outfitTextures, `Base/T_Regular_${Sex}_Dark_BaseColor.png`), `skin-${sex}`);
    plain(join(outfitTextures, `Base/T_Regular_${Sex}_Dark_BaseColor.png`), `plain-skin-${sex}`);
    index.tones[`skin-${sex}`] = toneOf(`plain-skin-${sex}`);
    const headSkin = sex === "male" ? "T_Superhero_Male_Dark.png" : "T_Superhero_Female_Dark_BaseColor.png";
    texture(join(bodies, headSkin), `head-${sex}`);
    plain(join(bodies, headSkin), `plain-head-${sex}`);
    index.tones[`head-${sex}`] = toneOf(`plain-head-${sex}`);

    // The head: the base body's triangles held by the head and neck, plus its eyes and eyebrows.
    const base = readGltf(join(bodies, `Superhero_${Sex}_FullBody.gltf`));
    const headParts = skinnedPrimitives(base);
    const roles = (primitive) =>
      /eye/iu.test(primitive.texture ?? "") ? "eyes" : /hair/iu.test(primitive.texture ?? "") ? "brows" : "head";
    const head = packPart(headParts, {
      texture: (primitive) => ({ eyes: "eyes", brows: "hair-1", head: `head-${sex}` })[roles(primitive)],
      keep: (primitive) => {
        if (roles(primitive) !== "head") return () => true;
        const headJoints = new Set(["Head", "neck_01"].map((name) => primitive.jointNames.indexOf(name)));
        const dominant = (v) => {
          let best = 0;
          for (let c = 1; c < 4; c++)
            if (primitive.weights.values[v * 4 + c] > primitive.weights.values[v * 4 + best]) best = c;
          return primitive.joints.values[v * 4 + best];
        };
        return (tri) => tri.every((v) => headJoints.has(dominant(v)));
      },
    });
    packed.parts[`head-${sex}`] = head;

    // The rest of the base body, cut the same way into the pieces an outfit has, for a piece left off:
    // the body shows there, in the underclothes painted on its skin. Each triangle goes to the piece that
    // holds most of it (the hips go with the legs, so trousers or a bare top never leave a gap there).
    const regionOf = (joint) =>
      /^(Head|neck)/u.test(joint)
        ? "head"
        : /^(spine|clavicle)/u.test(joint)
          ? "top"
          : /^(upperarm|lowerarm|hand|index|middle|pinky|ring|thumb)/u.test(joint)
            ? "arms"
            : /^(foot|ball)/u.test(joint)
              ? "feet"
              : /^calf/u.test(joint)
                ? "shins"
                : "legs";
    const skin = headParts.filter((primitive) => roles(primitive) === "head");
    const bareBody = {};
    for (const piece of ["top", "arms", "legs", "feet"]) {
      const bare = packPart(skin, {
        texture: () => `head-${sex}`,
        keep: (primitive) => {
          const region = (v) => {
            let best = 0;
            for (let c = 1; c < 4; c++)
              if (primitive.weights.values[v * 4 + c] > primitive.weights.values[v * 4 + best]) best = c;
            return regionOf(primitive.jointNames[primitive.joints.values[v * 4 + best]]);
          };
          return (tri) => {
            const regions = tri.map(region);
            // The piece two of its corners are in, or its first corner's.
            const most = regions.find((name, i) => regions.indexOf(name) !== i) ?? regions[0];
            // (What's all the head's is the head's file; a triangle the head only shares goes to the top.)
            if (most === "head") return piece === "top" && !regions.every((name) => name === "head");
            // (The shins go with the legs and with the feet: bare feet under trousers still have ankles.)
            return most === piece || (most === "shins" && (piece === "legs" || piece === "feet"));
          };
        },
      });
      bareBody[piece] = bare;
    }
    // (One file for all its pieces: a package may list only so many asset files.)
    packed.bare[sex] = { pieces: bareBody };

    // Outfits, in the pack's own pieces (top, arms, legs, feet; the ranger's hood and pauldrons), so a
    // person can wear any mix of them: each piece its own file, the skeleton they all bind to in another.
    // A piece's cloth is marked by its outfit ("clothes-peasant"), so each outfit keeps its own colours.
    index.sexes[sex] = { outfits: [], pieces: { top: ["none"], arms: ["none"], legs: ["none"], feet: ["none"] } };
    const parts = join(outfitDir, "Exports/glTF (Godot-Unreal)/Modular Parts");
    const whole = readGltf(join(outfits, `${Sex}_Peasant.gltf`));
    const frame = packPart(skinnedPrimitives(whole), { texture: () => "", skeleton: skeletonOf(whole) });
    packed.parts[`skeleton-${sex}`] = { ...frame, meshes: [] };
    for (const outfit of ["Peasant", "Ranger"]) {
      const kind = outfit.toLowerCase();
      const pieces = { top: "Body", arms: "Arms", legs: "Legs", feet: "Feet" };
      if (outfit === "Ranger") Object.assign(pieces, { hood: "Head_Hood", pauldrons: "Acc_Pauldrons" });
      const bundle = {}; // every piece of this outfit, in one file
      for (const [piece, file] of Object.entries(pieces)) {
        // (The pack names two of the man's pieces differently.)
        const path = [file, `${file}_Boots`, file.replace(/s$/u, "")]
          .map((name) => join(parts, `${Sex}_${outfit}_${name}.gltf`))
          .find((candidate) => existsSync(candidate));
        if (!path) throw new Error(`No ${Sex} ${outfit} ${file} piece in the pack`);
        const primitives = skinnedPrimitives(readGltf(path));
        const part = packPart(primitives, {
          texture: (primitive) => (/Regular/iu.test(primitive.texture ?? "") ? `skin-${sex}` : `clothes-${kind}`),
        });
        const name = `${sex}-${kind}-${piece}`;
        // How light this piece's cloth is in the plain texture, where its own triangles lie on it.
        index.tones[name] = toneOf(
          `plain-${kind}`,
          primitives
            .filter((primitive) => !/Regular/iu.test(primitive.texture ?? ""))
            .map((primitive) => primitive.uv.values),
        );
        bundle[piece] = part;
        (index.sexes[sex].pieces[piece] ??= []).push(kind);
      }
      writeFileSync(join(OUTFITS, `${sex}-${kind}.json`), JSON.stringify({ pieces: bundle }));
      index.sexes[sex].outfits.push({
        name: `${sex}-${kind}`,
        colourways: outfit === "Ranger" ? rangerColourways : colourways,
      });
    }
  }

  // Hairstyles, rigged to the head bone.
  for (const style of ["Buns", "Buzzed", "BuzzedFemale", "Long", "SimpleParted", "Beard"]) {
    const gltf = readGltf(join(hairs, `Hair_${style}.gltf`));
    const primitives = skinnedPrimitives(gltf);
    const part = packPart(primitives, {
      texture: (primitive) => (/2/u.test(primitive.texture ?? "") ? "hair-2" : "hair-1"),
    });
    const name = `hair-${style.toLowerCase()}`;
    packed.parts[name] = part;
    index.hair[style.toLowerCase()] = name;
  }
  writeFileSync(join(OUT, "bodies.json"), JSON.stringify(packed));
  writeFileSync(join(OUT, "index.json"), JSON.stringify(index, null, 2));
  console.log(`wrote ${OUT} and ${OUTFITS}`);
}

main();
