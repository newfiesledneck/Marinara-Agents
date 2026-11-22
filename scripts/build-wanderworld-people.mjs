#!/usr/bin/env node
// Converts Quaternius's Universal Base Characters and Modular Character Outfits - Fantasy (both CC0, free
// "Standard" downloads) into Wanderworld's people kit: packages/wanderworld/kit/generic/people/ and kit/fantasy/outfits/: meshes and
// *.webp textures, which the package serves as assets and the game loads only when someone needs a
// default look (src/people.js).
//
// Usage (unzip both packs first; ffmpeg must be on PATH, or set FFMPEG):
//   node scripts/build-wanderworld-people.mjs "<…>/Universal Base Characters[Standard]" "<…>/Modular Character Outfits - Fantasy[Standard]"
//   node scripts/build-wanderworld-people.mjs --folk "<…>/Bestiary - Dungeon Monsters Kit[Standard]/glTF"
//   node scripts/build-wanderworld-people.mjs --bestiary [name …]   (the models made in Blender: packages/wanderworld/AGENTS.md;
//     with names, only those are packed again)
//     (Two-legged ones on the people's skeleton go to kit/fantasy/folk; ones with a skeleton of their own, a
//     mimic or a roper, to kit/creatures/rigged-<name>.json, each with its own actions; avatar-* and anthro-*
//     bodies and outfit pieces are left for the avatar packing.)
//   node scripts/build-wanderworld-people.mjs --avatar [anthro]   (the base avatar, its anthro bodies, hair
//     styles and outfit pieces: assets/models/avatar-*.glb, anthro-*.glb and outfit-*.glb, into
//     kit/generic/avatar and kit/fantasy/avatar; with `anthro`, only the anthro bodies are packed again;
//     with `outfits [folder]`, only the outfit pieces, into `folder` if one is given)
//
// Each part (an outfit, a head, a hairstyle) keeps its own joints' inverse bind matrices, and every part
// of a person binds to one shared skeleton built from the outfit's. So a head cut from the base body, or a
// hairstyle rigged to its head bone, sits right on an outfit's body without reshaping anything.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { MeshoptSimplifier } from "three/examples/jsm/libs/meshopt_simplifier.module.js";
import { MESH_KINDS, RIGGED_KINDS, writePacked } from "./wanderworld-packed.mjs";
// (The avatar's hair styles and clothing slots are the game's own lists: a piece the game can't name isn't packed.)
import { CLOTH_PARTS, CLOTH_SLOTS, HAIRSTYLES, SLOT_OF } from "../packages/wanderworld/src/looks.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
await MeshoptSimplifier.ready;
/**
 * How many vertices' worth of triangles a model's distant version has: the Blender-made creatures and the
 * avatar get a second, smaller list of triangles over the same vertices, which the game draws past the
 * "Creature detail distance" (src/kit.js addDistant). A model this small or smaller has none.
 */
const DISTANT_VERTICES = 7000;

/**
 * A distant version of a mesh: about `share` of its triangles, chosen by meshoptimizer's simplifier
 * from the same vertices (`positions`: x, y, z each), so nothing else about the model changes; null when
 * it wouldn't save a tenth. `Type` is the full index's array type, which it's given back in.
 */
function distantIndex(index, positions, share, Type = Uint32Array) {
  if (!(share < 0.9) || index.length < 300) return null;
  const target = Math.max(3, Math.floor((index.length * share) / 3) * 3);
  const simplify = (flags) =>
    MeshoptSimplifier.simplify(Uint32Array.from(index), Float32Array.from(positions), 3, target, 1, flags)[0];
  // (A model shaded flat, or cut into many texture islands, is all seams, which the simplifier keeps;
  // past them it can still go, as only far-off copies are drawn this way.)
  let far = simplify([]);
  if (far.length > target * 1.5) far = simplify(["Permissive"]);
  return far.length && far.length < index.length * 0.9 ? Type.from(far) : null;
}
/**
 * The share of its triangles an outfit piece keeps (WW_OUTFIT_TRIM, to try another): clothes are the kit's
 * biggest part, and every vertex of a piece carries its shape keys' moves too.
 */
const OUTFIT_TRIM = Number(process.env.WW_OUTFIT_TRIM) || 1;
/** How far a trimmed piece may stray from the one made, as a share of its size (a shirt: about a millimetre). */
const TRIM_ERROR = 0.002;
/**
 * A piece's triangles trimmed to about `share` of them (in place), over the same vertices, the simplifier
 * minding its shading and texture seams as well as its shape; left alone where that wouldn't save a tenth,
 * or where TRIM_ERROR stops it first.
 */
function trimTriangles(primitive, share) {
  const count = primitive.position.count;
  if (!(share < 0.9) || primitive.index.count < 300) return;
  const attributes = new Float32Array(count * 5);
  for (let v = 0; v < count; v++) {
    attributes.set(primitive.normal.values.subarray(v * 3, v * 3 + 3), v * 5);
    attributes.set(primitive.uv.values.subarray(v * 2, v * 2 + 2), v * 5 + 3);
  }
  const [index] = MeshoptSimplifier.simplifyWithAttributes(
    Uint32Array.from(primitive.index.values),
    Float32Array.from(primitive.position.values),
    3,
    attributes,
    5,
    [0.5, 0.5, 0.5, 1, 1],
    null,
    Math.floor((primitive.index.count * share) / 3) * 3,
    TRIM_ERROR,
    [],
  );
  if (index.length && index.length < primitive.index.count * 0.9)
    primitive.index = { values: index, count: index.length };
}
/** The share of its triangles a model of `vertices` keeps far off. */
const distantShare = (vertices) => DISTANT_VERTICES / Math.max(1, vertices);
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
    const view = json.bufferViews[info.bufferView ?? info.sparse?.values.bufferView];
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
    // (A sparse accessor, as a shape key comes, may have no buffer view: all zero, then its few values.)
    if (info.bufferView !== undefined) {
      for (let i = 0; i < info.count; i++) {
        for (let c = 0; c < size; c++)
          out[i * size + c] = read(start + i * stride + c * Type.BYTES_PER_ELEMENT) / scale;
      }
    }
    if (info.sparse) {
      const { count, indices, values } = info.sparse;
      const at = (part) =>
        buffer.byteOffset + (json.bufferViews[part.bufferView].byteOffset ?? 0) + (part.byteOffset ?? 0);
      const readIndex = {
        5121: (o) => data.getUint8(o),
        5123: (o) => data.getUint16(o, true),
        5125: (o) => data.getUint32(o, true),
      }[indices.componentType];
      const indexSize = { 5121: 1, 5123: 2, 5125: 4 }[indices.componentType];
      for (let i = 0; i < count; i++) {
        const v = readIndex(at(indices) + i * indexSize);
        for (let c = 0; c < size; c++)
          out[v * size + c] = read(at(values) + (i * size + c) * Type.BYTES_PER_ELEMENT) / scale;
      }
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
    const mesh = gltf.json.meshes[node.mesh];
    for (const primitive of mesh.primitives) {
      out.push({
        name: mesh.name,
        nodeName: node.name,
        extras: { ...mesh.extras, ...node.extras },
        // (Shape keys: Blender's exporter names them in the mesh's extras. A mesh's default weights are
        // left unread: the mesh is packed at rest, and the look drives every key.)
        targets: primitive.targets?.map((target) => ({
          position: gltf.accessor(target.POSITION),
          normal: target.NORMAL === undefined ? null : gltf.accessor(target.NORMAL),
        })),
        keyNames: mesh.extras?.targetNames ?? [],
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
// A shape key's moves in fewer steps than int16 holds (packMesh), which packs smaller and is still far
// finer than can be seen (src/avatar.js morphsOf reads `q`). (Its normals keep int8's: fewer turned the
// shading by a degree or two in places.)
const MORPH_STEPS = 511;

/** One mesh, quantized: positions int16 within its box, normals int8, uvs uint16 (0…1, wrapped), joint
 *  indices uint8 into the part's joint list, weights uint8. `keep(triangle)` can drop triangles. With
 *  `share`, a distant version too (`far`, distantIndex). A merged outfit piece (mergePrimitives) also
 *  says each vertex's colour part (`partOf`, uint8 into its `parts`). A shape key keeps the vertices it
 *  moves more than `still` metres. */
function packMesh(primitive, texture, jointIndex, keep = () => true, share = 1, still = 1e-5) {
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
  const partOf = primitive.partOf ? new Uint8Array(count) : null;
  if (partOf) for (const [v, n] of remap) partOf[n] = primitive.partOf[v];
  const index = count > 65535 ? new Uint32Array(triangles.length * 3) : new Uint16Array(triangles.length * 3);
  triangles.forEach((tri, i) => tri.forEach((v, c) => (index[i * 3 + c] = remap.get(v))));
  const places = new Float32Array(count * 3);
  for (const [v, n] of remap) for (let c = 0; c < 3; c++) places[n * 3 + c] = p[v * 3 + c];
  const far = distantIndex(index, places, share, index.constructor);
  // Shape keys (glTF morph targets), each only where it moves anything: the vertices (uint16 or uint32),
  // their moves (int16 in ±MORPH_STEPS steps of `d`, a scale per axis, saying its steps in `q`: within
  // 0.06 mm for a key moving 6 cm) and normals' changes (int8 within ±`n`).
  const morphs = {};
  (primitive.targets ?? []).forEach((target, k) => {
    const moved = [];
    for (const [v, n] of remap) {
      let size = 0;
      for (let c = 0; c < 3; c++) size = Math.max(size, Math.abs(target.position.values[v * 3 + c]));
      if (size > still) moved.push([v, n]);
    }
    if (!moved.length) return;
    const d = [0, 0, 0];
    const ns = [0, 0, 0];
    for (const [v] of moved)
      for (let c = 0; c < 3; c++) {
        d[c] = Math.max(d[c], Math.abs(target.position.values[v * 3 + c]));
        ns[c] = Math.max(ns[c], Math.abs(target.normal?.values[v * 3 + c] ?? 0));
      }
    const ids = count > 65535 ? new Uint32Array(moved.length) : new Uint16Array(moved.length);
    const delta = new Int16Array(moved.length * 3);
    const normalDelta = new Int8Array(moved.length * 3);
    moved.forEach(([v, n], i) => {
      ids[i] = n;
      for (let c = 0; c < 3; c++) {
        delta[i * 3 + c] = Math.round((target.position.values[v * 3 + c] / (d[c] || 1)) * MORPH_STEPS);
        normalDelta[i * 3 + c] = Math.round(((target.normal?.values[v * 3 + c] ?? 0) / (ns[c] || 1)) * 127);
      }
    });
    morphs[primitive.keyNames[k]] = {
      ids: b64(ids),
      d: d.map((value) => Number(value.toPrecision(6))),
      delta: b64(delta),
      n: ns.map((value) => Number(value.toPrecision(6))),
      normal: b64(normalDelta),
      q: MORPH_STEPS,
    };
  });
  return {
    ...(Object.keys(morphs).length ? { morphs } : {}),
    texture,
    count,
    box: [...min, ...max].map((value) => Math.round(value * 1e5) / 1e5),
    position: b64(position),
    normal: b64(normal),
    uv: b64(uv),
    joints: b64(joints),
    weights: b64(weights),
    index: b64(index),
    ...(far ? { far: b64(far) } : {}),
    ...(partOf ? { partOf: b64(partOf) } : {}),
    wide: index instanceof Uint32Array,
  };
}

/**
 * A part file: its joints (names and inverse bind matrices) and meshes; a body also carries the skeleton.
 * `distant`: the share of its triangles each mesh keeps in its distant version (packMesh).
 */
function packPart(primitives, { texture, keep, skeleton, distant = 1, still } = {}) {
  const names = [];
  const ibms = [];
  const jointIndex = (name) => names.indexOf(name);
  for (const primitive of primitives) {
    primitive.jointNames.forEach((name, i) => {
      if (names.includes(name)) return;
      names.push(name);
      if (!primitive.ibm) return;
      ibms.push(...Array.from(primitive.ibm.slice(i * 16, i * 16 + 16)).map((value) => Math.round(value * 1e6) / 1e6));
    });
  }
  const meshes = primitives.map((primitive) =>
    packMesh(primitive, texture(primitive), jointIndex, keep?.(primitive), distant, still),
  );
  // (A mesh hung on a bone rather than skinned has no inverse bind matrices of its own: the game binds it
  // with the body's, avatar.js.)
  const bound = primitives.every((primitive) => primitive.ibm);
  return { joints: names, inverseBind: bound ? ibms : null, meshes, ...(skeleton ? { skeleton } : {}) };
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
 * and the puglin), each as one part with its skeleton, into kit/fantasy/folk/folk.pack.png with a texture
 * each in it (`pictures`). They have no animations of their own: the game moves them with the people's.
 */
function folk(dir) {
  const out = join(KIT, "fantasy/folk");
  mkdirSync(out, { recursive: true });
  // (Only its own files: the folder also holds the Blender-made ones, `bestiary` below.)
  for (const name of ["folk.json", "folk.pack.png", "folk-imp.webp", "folk-puglin.webp"])
    rmSync(join(out, name), { force: true });
  const all = { source: "Bestiary - Dungeon Monsters Kit by Quaternius", folk: {}, pictures: [] };
  for (const [name, file] of [
    ["imp", "Imp.glb"],
    ["puglin", "Puglin.glb"],
  ]) {
    const gltf = readGltf(join(dir, file));
    const primitives = skinnedPrimitives(gltf);
    const png = join(out, `${name}.png`);
    writeFileSync(png, gltf.imageOf(primitives[0].texture));
    all.pictures.push({ name: `folk-${name}`, webp: webp(png, 82, ["-vf", `scale=${TEXTURE_SIZE}:${TEXTURE_SIZE}`]) });
    let top = 0;
    for (const primitive of primitives)
      for (let i = 1; i < primitive.position.values.length; i += 3) top = Math.max(top, primitive.position.values[i]);
    all.folk[name] = {
      height: Math.round(top * 100) / 100,
      ...packPart(primitives, { texture: () => `folk-${name}`, skeleton: skeletonOf(gltf) }),
    };
  }
  writePacked(join(out, "folk.pack.png"), all, MESH_KINDS);
  console.log(`wrote ${out}`);
}

/**
 * Which bundle each Blender-made model goes in (a package may list at most 256 files, so they share files
 * by family, and a world fetches only the families it has). A model not named here goes in "others".
 */
const FAMILIES = {
  folk: {
    giants: ["hill_giant", "stone_giant", "frost_giant", "fire_giant"],
    undead: ["skeleton", "zombie", "ghoul", "ghost", "specter"],
    humanoids: ["goblin", "hobgoblin", "bugbear", "orc", "kobold", "gnoll", "lizardfolk"],
    brutes: ["ogre", "troll", "minotaur", "earth_elemental"],
  },
  rigged: {
    elementals: ["air_elemental", "fire_elemental", "water_elemental"],
    plants: ["awakened_shrub", "shambling_mound"],
    dungeon: ["mimic", "roper", "grick", "gelatinous_cube", "otyugh", "basilisk"],
  },
};
const familyOf = (kind, name) =>
  Object.keys(FAMILIES[kind]).find((family) => FAMILIES[kind][family].includes(name)) ?? "others";

/** A picture (a file, removed after) as WebP bytes in base64 (ffmpeg at `quality`), for a bundle's `pictures`. */
function webp(png, quality, filters = []) {
  const out = `${png.slice(0, -4)}.webp`;
  execFileSync(FFMPEG, ["-v", "error", "-y", "-i", png, ...filters, "-quality", String(quality), out]);
  const bytes = readFileSync(out);
  rmSync(png);
  rmSync(out);
  return bytes.toString("base64");
}

/**
 * The monsters made in Blender (packages/wanderworld/assets/scripts/make_*.py, each a .glb in
 * assets/models/ on the people's skeleton, with one texture of its own), into
 * kit/fantasy/folk/folk-built-<family>.pack.png (FAMILIES), each model's texture in it (`pictures`), and
 * folk-built-index.json saying which file has which. The game moves them with the people's animations, as
 * it does the imp and the puglin; their own actions stay in the .glb for anyone using the model elsewhere.
 * Those with a skeleton of their own go to kit/creatures the same way (rigged).
 */
function bestiary(only = []) {
  const dir = join(ROOT, "packages/wanderworld/assets/models");
  const out = join(KIT, "fantasy/folk");
  mkdirSync(out, { recursive: true });
  const creatures = join(KIT, "creatures");
  // (Only the models in git, as the bestiary test counts them: one saved but not committed may be half done.)
  let tracked = null;
  try {
    tracked = new Set(
      execFileSync("git", ["ls-files", "assets/models"], { cwd: join(ROOT, "packages/wanderworld"), encoding: "utf8" })
        .split(/\r?\n/u)
        .map((path) => path.split("/").pop()),
    );
  } catch {
    // (no git: every model there counts)
  }
  const files = readdirSync(dir)
    .filter((name) => name.endsWith(".glb") && !/^(?:avatar|anthro|outfit)-|^giant-base/u.test(name))
    .filter((name) => {
      if (!tracked || tracked.has(name)) return true;
      console.warn(`left out ${name}: it isn't in git yet`);
      return false;
    })
    .sort();
  const kindOf = (file) => {
    const bones = skeletonOf(readGltf(join(dir, file))).names;
    return bones.includes("pelvis") && bones.includes("hand_r") ? "folk" : "rigged";
  };
  const kinds = new Map(files.map((file) => [file, kindOf(file)]));
  // (Named ones only, when some are named: those families are packed again, and the rest of the kit is
  // left as it is, so a model still being made beside them isn't packed half done.)
  const families = new Set(
    files
      .filter((file) => only.includes(file.slice(0, -4)))
      .map((file) => `${kinds.get(file)}:${familyOf(kinds.get(file), file.slice(0, -4))}`),
  );
  const wanted = (file) =>
    !only.length || families.has(`${kinds.get(file)}:${familyOf(kinds.get(file), file.slice(0, -4))}`);
  if (!only.length) {
    for (const old of readdirSync(out).filter((name) => /^folk-built/u.test(name))) rmSync(join(out, old));
    for (const old of readdirSync(creatures).filter((name) => /^rigged-/u.test(name))) rmSync(join(creatures, old));
  }
  const source = "Made in Blender by ThatOneCan (packages/wanderworld/assets/scripts)";
  const bundles = { folk: {}, rigged: {} };
  const bundleOf = (kind, name) => (bundles[kind][familyOf(kind, name)] ??= { source, [kind]: {}, pictures: [] });
  for (const file of files.filter(wanted)) {
    const name = file.slice(0, -4);
    if (kinds.get(file) === "rigged") {
      const bundle = bundleOf("rigged", name);
      const { model, picture } = rigged(name, join(dir, file), creatures);
      bundle.rigged[name] = model;
      bundle.pictures.push({ name: `rigged-${name}`, webp: picture });
      continue;
    }
    const gltf = readGltf(join(dir, file));
    const primitives = skinnedPrimitives(gltf);
    const png = join(out, `${name}.png`);
    writeFileSync(png, gltf.imageOf(primitives[0].texture));
    let top = 0;
    for (const primitive of primitives)
      for (let i = 1; i < primitive.position.values.length; i += 3) top = Math.max(top, primitive.position.values[i]);
    const vertices = primitives.reduce((sum, primitive) => sum + primitive.position.count, 0);
    const bundle = bundleOf("folk", name);
    bundle.folk[name] = {
      height: Math.round(top * 100) / 100,
      ...packPart(primitives, {
        texture: () => `folk-${name}`,
        skeleton: skeletonOf(gltf),
        distant: distantShare(vertices),
      }),
    };
    bundle.pictures.push({ name: `folk-${name}`, webp: webp(png, 90) });
  }
  // The bundles, and each folder's index of them (merged with the one there, after packing only some).
  for (const [kind, folder, KINDS] of [
    ["folk", out, MESH_KINDS],
    ["rigged", creatures, RIGGED_KINDS],
  ]) {
    const prefix = kind === "folk" ? "folk-built" : "rigged";
    const indexPath = join(folder, `${prefix}-index.json`);
    const index = only.length && existsSync(indexPath) ? JSON.parse(readFileSync(indexPath, "utf8")) : {};
    for (const [family, bundle] of Object.entries(bundles[kind])) {
      writePacked(join(folder, `${prefix}-${family}.pack.png`), bundle, KINDS);
      for (const name of Object.keys(bundle[kind])) index[name] = `${prefix}-${family}`;
    }
    const sorted = Object.fromEntries(Object.entries(index).sort(([a], [b]) => a.localeCompare(b)));
    if (Object.keys(sorted).length) writeFileSync(indexPath, `${JSON.stringify(sorted, null, 2)}\n`);
  }
  const count = (kind) =>
    Object.values(bundles[kind]).reduce((sum, bundle) => sum + Object.keys(bundle[kind]).length, 0);
  console.log(`wrote ${count("folk")} to ${out}, and ${count("rigged")} with skeletons of their own to ${creatures}`);
}

/**
 * A creature with a skeleton of its own (a mimic, a roper): its .glb, actions and all, played by three's
 * AnimationMixer in the game (src/rigged.js), with its texture taken out as a WebP (`picture`). The model
 * comes back as { height, gltf (the glTF's JSON), views (its buffer views' bytes, each with its elements'
 * size and components, for packing) }, which src/rigged.js puts back together into a .glb.
 */
function rigged(name, path, out) {
  const file = readFileSync(path);
  const jsonLength = file.readUInt32LE(12);
  const json = JSON.parse(file.subarray(20, 20 + jsonLength).toString("utf8"));
  const bin = file.subarray(20 + jsonLength + 8);
  // The texture out to a .webp, through a .png.
  const image = json.images?.[0];
  if (!image) throw new Error(`${name}.glb has no texture`);
  const imageView = json.bufferViews[image.bufferView];
  const png = join(out, `${name}.png`);
  writeFileSync(png, bin.subarray(imageView.byteOffset ?? 0, (imageView.byteOffset ?? 0) + imageView.byteLength));
  const picture = webp(png, 90);
  // Smaller numbers where glTF allows them: bone weights and texture places as whole numbers (core glTF),
  // normals as bytes (KHR_mesh_quantization, which three's GLTFLoader reads). About 40% off the mesh.
  const replaced = new Map(); // buffer view → its new bytes
  const shrink = (index, Type, componentType, scale, components) => {
    const accessor = json.accessors[index];
    const view = json.bufferViews[accessor.bufferView];
    const shared = json.accessors.filter((other) => other.bufferView === accessor.bufferView).length > 1;
    if (accessor.componentType !== 5126 || view.byteStride || shared || replaced.has(accessor.bufferView)) return;
    const start = (view.byteOffset ?? 0) + (accessor.byteOffset ?? 0);
    const floats = new Float32Array(
      bin.buffer.slice(bin.byteOffset + start, bin.byteOffset + start + accessor.count * components * 4),
    );
    if (Type === Uint16Array && floats.some((value) => value < 0 || value > 1)) return; // (texture places outside 0…1 stay as they are)
    // (A byte normal is padded to four, as glTF wants each element on a four-byte boundary.)
    const stride = Type === Int8Array && components === 3 ? 4 : components;
    const out = new Type(accessor.count * stride);
    for (let i = 0; i < accessor.count; i++)
      for (let c = 0; c < components; c++) out[i * stride + c] = Math.round(floats[i * components + c] * scale);
    // (Bone weights rounded one by one may not add up to 255 any more, which skinning would draw as the
    // vertex pulled towards the origin: what's out goes to the biggest one.)
    if (Type === Uint8Array && components === 4)
      for (let i = 0; i < accessor.count; i++) {
        const weights = out.subarray(i * 4, i * 4 + 4);
        const total = weights.reduce((sum, weight) => sum + weight, 0);
        if (total) weights[weights.indexOf(Math.max(...weights))] += 255 - total;
      }
    replaced.set(accessor.bufferView, Buffer.from(out.buffer));
    Object.assign(accessor, { componentType, normalized: true, byteOffset: 0 });
    if (stride !== components) view.byteStride = stride;
    delete accessor.min;
    delete accessor.max;
    view.byteLength = out.byteLength;
  };
  let normals = false;
  for (const mesh of json.meshes)
    for (const primitive of mesh.primitives) {
      const { WEIGHTS_0: weights, TEXCOORD_0: uv, NORMAL: normal } = primitive.attributes;
      if (weights !== undefined) shrink(weights, Uint8Array, 5121, 255, 4);
      if (uv !== undefined) shrink(uv, Uint16Array, 5123, 65535, 2);
      if (normal !== undefined && !primitive.targets) {
        shrink(normal, Int8Array, 5120, 127, 3);
        normals = true;
      }
    }
  // Turns in the actions as int16 (normalized, which core glTF allows for rotations): within 1/32767.
  for (const animation of json.animations ?? [])
    for (const channel of animation.channels)
      if (channel.target.path === "rotation")
        shrink(animation.samplers[channel.sampler].output, Int16Array, 5122, 32767, 4);
  if (normals) {
    json.extensionsUsed = [...new Set([...(json.extensionsUsed ?? []), "KHR_mesh_quantization"])];
    json.extensionsRequired = [...new Set([...(json.extensionsRequired ?? []), "KHR_mesh_quantization"])];
  }
  // A distant version of each of its meshes (distantIndex), in the same file: an index accessor of its
  // own over the same vertices, named in the primitive's extras (`far`), which src/rigged.js draws far off.
  const readAccessor = (index, Type) => {
    const accessor = json.accessors[index];
    const view = json.bufferViews[accessor.bufferView];
    const start = bin.byteOffset + (view.byteOffset ?? 0) + (accessor.byteOffset ?? 0);
    const size = { SCALAR: 1, VEC3: 3 }[accessor.type];
    return view.byteStride
      ? null
      : new Type(bin.buffer.slice(start, start + accessor.count * size * Type.BYTES_PER_ELEMENT));
  };
  const primitives = json.meshes.flatMap((mesh) => mesh.primitives);
  const vertices = primitives.reduce((sum, primitive) => sum + json.accessors[primitive.attributes.POSITION].count, 0);
  for (const primitive of primitives) {
    const type = json.accessors[primitive.indices]?.componentType;
    const Type = { 5123: Uint16Array, 5125: Uint32Array }[type];
    const index = Type && readAccessor(primitive.indices, Type);
    const positions = Type && readAccessor(primitive.attributes.POSITION, Float32Array);
    const far = index && positions && distantIndex(index, positions, distantShare(vertices), Type);
    if (!far) continue;
    json.bufferViews.push({ buffer: 0, byteLength: far.byteLength, target: 34963 });
    replaced.set(json.bufferViews.length - 1, Buffer.from(far.buffer, far.byteOffset, far.byteLength));
    json.accessors.push({
      bufferView: json.bufferViews.length - 1,
      componentType: type,
      count: far.length,
      type: "SCALAR",
    });
    primitive.extras = { ...primitive.extras, far: json.accessors.length - 1 };
  }
  // The model without its images: their buffer views dropped and the rest packed up again.
  const dropped = new Set((json.images ?? []).map((entry) => entry.bufferView));
  const renumber = new Map();
  const viewBytes = [];
  let offset = 0;
  json.bufferViews = json.bufferViews.filter((view, i) => {
    if (dropped.has(i)) return false;
    const bytes = replaced.get(i) ?? bin.subarray(view.byteOffset ?? 0, (view.byteOffset ?? 0) + view.byteLength);
    offset += (4 - (offset % 4)) % 4;
    renumber.set(i, renumber.size);
    view.byteOffset = offset;
    viewBytes.push(bytes);
    offset += bytes.length;
    return true;
  });
  for (const accessor of json.accessors) accessor.bufferView = renumber.get(accessor.bufferView);
  delete json.images;
  delete json.textures;
  delete json.samplers;
  for (const material of json.materials ?? []) delete material.pbrMetallicRoughness?.baseColorTexture;
  json.buffers = [{ byteLength: offset }];
  // Each view's elements, for packing: the size and count of components of the accessor reading it.
  const SIZES = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 };
  const COMPONENTS = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
  const views = json.bufferViews.map((view, i) => {
    const accessor = json.accessors.find((entry) => entry.bufferView === i);
    const size = accessor ? SIZES[accessor.componentType] : 1;
    const comps = accessor ? (view.byteStride ? view.byteStride / size : COMPONENTS[accessor.type]) : 1;
    return { size, comps, data: viewBytes[i].toString("base64") };
  });
  // How tall it stands: the highest point of its meshes at rest.
  let top = 0;
  for (const mesh of json.meshes)
    for (const primitive of mesh.primitives) top = Math.max(top, json.accessors[primitive.attributes.POSITION].max[1]);
  return { model: { height: Math.round(top * 100) / 100, gltf: json, views }, picture };
}

// ── The base avatar (src/avatar.js) ──

/** A glTF node's own transform as a column-major 4×4 matrix. */
function nodeMatrix(node) {
  if (node.matrix) return node.matrix;
  const [x, y, z, w] = node.rotation ?? [0, 0, 0, 1];
  const [sx, sy, sz] = node.scale ?? [1, 1, 1];
  const [tx, ty, tz] = node.translation ?? [0, 0, 0];
  return [
    (1 - 2 * (y * y + z * z)) * sx,
    2 * (x * y + z * w) * sx,
    2 * (x * z - y * w) * sx,
    0,
    2 * (x * y - z * w) * sy,
    (1 - 2 * (x * x + z * z)) * sy,
    2 * (y * z + x * w) * sy,
    0,
    2 * (x * z + y * w) * sz,
    2 * (y * z - x * w) * sz,
    (1 - 2 * (x * x + y * y)) * sz,
    0,
    tx,
    ty,
    tz,
    1,
  ];
}
const multiply = (a, b) =>
  Array.from({ length: 16 }, (_, i) => {
    const [column, row] = [Math.floor(i / 4), i % 4];
    let sum = 0;
    for (let k = 0; k < 4; k++) sum += a[k * 4 + row] * b[column * 4 + k];
    return sum;
  });

/**
 * Every mesh in a file, each primitive as `skinnedPrimitives` gives it. A mesh hung on a bone (a hair style
 * parented to the head in Blender) rather than skinned comes out in the file's rest pose, wholly on the
 * `Head` bone, for the game to bind with the body's own matrices.
 */
function meshPrimitives(gltf) {
  const skinned = skinnedPrimitives(gltf);
  const parents = new Map();
  gltf.json.nodes.forEach((node, i) => (node.children ?? []).forEach((child) => parents.set(child, i)));
  const world = (i) =>
    parents.has(i) ? multiply(world(parents.get(i)), nodeMatrix(gltf.json.nodes[i])) : nodeMatrix(gltf.json.nodes[i]);
  const out = [...skinned];
  gltf.json.nodes.forEach((node, i) => {
    if (node.mesh === undefined || node.skin !== undefined) return;
    const m = world(i);
    const mesh = gltf.json.meshes[node.mesh];
    for (const primitive of mesh.primitives) {
      const position = gltf.accessor(primitive.attributes.POSITION);
      const normal = gltf.accessor(primitive.attributes.NORMAL);
      const count = position.count;
      for (let v = 0; v < count; v++) {
        const [x, y, z] = position.values.slice(v * 3, v * 3 + 3);
        const [nx, ny, nz] = normal.values.slice(v * 3, v * 3 + 3);
        for (let c = 0; c < 3; c++) {
          position.values[v * 3 + c] = m[c] * x + m[4 + c] * y + m[8 + c] * z + m[12 + c];
          normal.values[v * 3 + c] = m[c] * nx + m[4 + c] * ny + m[8 + c] * nz;
        }
        const length = Math.hypot(...normal.values.slice(v * 3, v * 3 + 3)) || 1;
        for (let c = 0; c < 3; c++) normal.values[v * 3 + c] /= length;
      }
      out.push({
        name: mesh.name,
        nodeName: node.name,
        extras: { ...mesh.extras, ...node.extras },
        targets: primitive.targets?.map((target) => ({
          position: gltf.accessor(target.POSITION),
          normal: target.NORMAL === undefined ? null : gltf.accessor(target.NORMAL),
        })),
        keyNames: mesh.extras?.targetNames ?? [],
        texture: gltf.textureOf(primitive.material),
        material: gltf.json.materials?.[primitive.material] ?? null,
        position,
        normal,
        uv:
          primitive.attributes.TEXCOORD_0 === undefined
            ? { values: new Float64Array(count * 2) }
            : gltf.accessor(primitive.attributes.TEXCOORD_0),
        joints: { values: new Float64Array(count * 4) },
        weights: { values: Float64Array.from({ length: count * 4 }, (_, j) => (j % 4 === 0 ? 1 : 0)) },
        index: gltf.accessor(primitive.indices),
        jointNames: ["Head"],
        ibm: null,
      });
    }
  });
  return out;
}

/** The joint (its place in `jointNames`) with the most weight on vertex `v`. */
function mainJoint(primitive, v) {
  let best = 0;
  for (let c = 1; c < 4; c++)
    if (primitive.weights.values[v * 4 + c] > primitive.weights.values[v * 4 + best]) best = c;
  return primitive.joints.values[v * 4 + best];
}

/** How far each shape key moves the body on each bone: bone → key → metres (the most any vertex moves). */
function keyReach(primitives) {
  const reach = new Map();
  for (const primitive of primitives)
    for (let v = 0; v < primitive.position.count; v++) {
      const bone = primitive.jointNames[mainJoint(primitive, v)];
      if (!reach.has(bone)) reach.set(bone, new Map());
      (primitive.targets ?? []).forEach((target, k) => {
        const p = target.position.values;
        const size = Math.hypot(p[v * 3], p[v * 3 + 1], p[v * 3 + 2]);
        const key = primitive.keyNames[k];
        reach.get(bone).set(key, Math.max(reach.get(bone).get(key) ?? 0, size));
      });
    }
  return reach;
}

// A key that moves a bone's skin less than this leaves a piece on that bone where it is.
const STILL_KEY = 0.0005;
/**
 * A hair style's or outfit piece's shape keys made to follow only the body (in place): a key moves a vertex
 * only if it moves the body on the vertex's bone (`reach`, keyReach), so "nose" no longer moves a boot.
 * Fitting left the same move in every key at some vertices (a few millimetres to centimetres), which
 * adds up as more sliders are moved: the middle of the keys that shouldn't move it is taken out of them
 * all. (The piece at rest, what's seen with every slider in the middle, stays as it was made.)
 */
function followBody(primitive, reach) {
  const targets = primitive.targets ?? [];
  const keys = primitive.keyNames;
  const median = (values) => {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = sorted.length >> 1;
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };
  for (let v = 0; v < primitive.position.count; v++) {
    const moves = reach.get(primitive.jointNames[mainJoint(primitive, v)]);
    if (!moves) continue; // (a bone the body has no skin on: left as made)
    const still = keys.map((key) => (moves.get(key) ?? 0) < STILL_KEY);
    const quiet = targets.filter((_, k) => still[k]);
    const common = [0, 1, 2].map((c) =>
      quiet.length >= 2 ? median(quiet.map((target) => target.position.values[v * 3 + c])) : 0,
    );
    targets.forEach((target, k) => {
      for (let c = 0; c < 3; c++) {
        target.position.values[v * 3 + c] = still[k] ? 0 : target.position.values[v * 3 + c] - common[c];
        if (still[k] && target.normal) target.normal.values[v * 3 + c] = 0;
      }
    });
  }
}

/**
 * Shape keys' normal changes put right (in place): some turn a normal the other way round (a change of
 * nearly twice its length), which flips the shading wherever that key is used. Each key's normal is made
 * to face the same side as the normal at rest, at unit length, and its change is the difference.
 */
function keyNormals(primitive) {
  const normal = primitive.normal.values;
  for (const target of primitive.targets ?? []) {
    if (!target.normal) continue;
    const d = target.normal.values;
    for (let v = 0; v < primitive.position.count; v++) {
      const at = v * 3;
      let [x, y, z] = [normal[at] + d[at], normal[at + 1] + d[at + 1], normal[at + 2] + d[at + 2]];
      if (x * normal[at] + y * normal[at + 1] + z * normal[at + 2] < 0) [x, y, z] = [-x, -y, -z];
      const length = Math.hypot(x, y, z);
      if (length < 1e-6) [x, y, z] = [normal[at], normal[at + 1], normal[at + 2]];
      else [x, y, z] = [x / length, y / length, z / length];
      [d[at], d[at + 1], d[at + 2]] = [x - normal[at], y - normal[at + 1], z - normal[at + 2]];
    }
  }
}

/**
 * One node's meshes (an outfit piece's parts: cloth, trim, metal…, one texture) as one primitive, drawn at
 * once: `partOf` says each vertex's part (its place in `parts`, [{ part, colour }]), so the game colours
 * each part on its own, by vertex.
 */
function mergePrimitives(primitives) {
  const [first] = primitives;
  for (const primitive of primitives)
    if (primitive.jointNames.join() !== first.jointNames.join() || primitive.texture !== first.texture)
      throw new Error(`${first.nodeName}: its meshes need one skin and one texture to be one piece`);
  const count = primitives.reduce((sum, primitive) => sum + primitive.position.count, 0);
  const join = (get, size) => {
    const out = new Float64Array(count * size);
    let at = 0;
    for (const primitive of primitives) {
      out.set(get(primitive) ?? new Float64Array(primitive.position.count * size), at * size);
      at += primitive.position.count;
    }
    return { values: out, size, count };
  };
  const index = [];
  const partOf = new Uint8Array(count);
  const parts = [];
  let offset = 0;
  for (const primitive of primitives) {
    for (const v of primitive.index.values) index.push(v + offset);
    const material = primitive.material;
    const part =
      material?.extras?.part ??
      String(material?.name ?? "cloth")
        .split("-")
        .pop();
    const colour = (material?.pbrMetallicRoughness?.baseColorFactor ?? [1, 1, 1]).slice(0, 3);
    let at = parts.findIndex((each) => each.part === part);
    if (at < 0) at = parts.push({ part, colour: colour.map((value) => Math.round(value * 1e4) / 1e4) }) - 1;
    partOf.fill(at, offset, offset + primitive.position.count);
    offset += primitive.position.count;
  }
  const keyNames = first.keyNames;
  return {
    ...first,
    position: join((primitive) => primitive.position.values, 3),
    normal: join((primitive) => primitive.normal.values, 3),
    uv: join((primitive) => primitive.uv.values, 2),
    joints: join((primitive) => primitive.joints.values, 4),
    weights: join((primitive) => primitive.weights.values, 4),
    index: { values: index, count: index.length },
    targets: keyNames.map((key) => ({
      position: join((primitive) => primitive.targets?.[primitive.keyNames.indexOf(key)]?.position.values, 3),
      normal: join((primitive) => primitive.targets?.[primitive.keyNames.indexOf(key)]?.normal?.values, 3),
    })),
    partOf,
    parts,
  };
}

/** A linear colour (a glTF factor) as 0xRRGGBB in sRGB, as the Look card shows colours. */
const srgbHex = (linear) =>
  linear
    .map((value) => Math.round(255 * (value <= 0.0031308 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055)))
    .reduce((hex, value) => (hex << 8) | Math.max(0, Math.min(255, value)), 0);

/** Which body a mesh is for, by its name ("male", "hair_female"): "male", "female", or null (both). */
const sexOfName = (name) =>
  /(?:^|[^a-z])female/u.test(name.toLowerCase())
    ? "female"
    : /(?:^|[^a-z])male/u.test(name.toLowerCase())
      ? "male"
      : null;

/**
 * The base avatar (assets/scripts/make_avatar.py) into the kit, with its shape keys, for src/avatar.js:
 * - kit/generic/avatar/avatar-<sex>.pack.png (scripts/wanderworld-packed.mjs), a body each (the skeleton, every part with its material's name and
 *   colour, the underwear's, brows' and lashes' styles, shape keys), and its textures avatar-<sex>.webp,
 *   avatar-<sex>-1.webp; MakeHuman's skins (avatar-<sex>-skin-<age>-<ethnicity>.webp) and eye pictures
 *   (avatar-eyes.webp) from assets/textures/avatar;
 * - kit/generic/avatar/anthro-<kind>-<sex>.pack.png, an anthro body each (assets/scripts/make_anthro_*.py: the
 *   human body's skeleton with tail and wing bones, its own parts and shape keys, the underwear's styles and
 *   a dragon's `wings` as pieces), its textures inside (`pictures`: the body's at most 2,048 pixels, the
 *   underwear's 1,024; the normal maps are left out, as the game doesn't use them);
 * - kit/generic/avatar/avatar-hair-short.pack.png and avatar-hair-long.pack.png, every hair style
 *   (avatar-hair-<style>.glb, a `male` and a `female` mesh, skinned or hung on the head bone) with its
 *   textures inside (`pictures`), and avatar-hair-index.json saying which file has which;
 * - kit/fantasy/avatar/avatar-outfits-<group>.pack.png, every outfit piece (outfit-<piece>.glb, a `male` and
 *   a `female` mesh, and another way of wearing it as a mesh of its own: `female_hood_up`, with the body's
 *   shape keys and in its extras `slot`, `layer`, `hides`, `variant`), grouped by its slot (looks.js
 *   CLOTH_SLOTS), its textures inside at most 1,024 pixels, and avatar-outfits-index.json saying which file
 *   has which, the bodies it's made for, its parts and their colours, and its variants.
 * A file a body and a bundle a group of the rest, as a package may list at most 256 asset files. The hair's
 * and clothes' shape keys move them only where they move the body (followBody), and every key's normals
 * are put right (keyNormals).
 */
function avatar(only = "", to = "") {
  // (`--avatar anthro`: only the anthro bodies are packed again, the rest of the kit left as it is.
  // `--avatar outfits [folder]`: only the outfit pieces, into `folder` if given, to set a trim beside the kit's.)
  const anthroOnly = only === "anthro";
  const outfitsOnly = only === "outfits";
  const dir = join(ROOT, "packages/wanderworld/assets/models");
  const out = join(KIT, "generic/avatar");
  const outfitsOut = outfitsOnly && to ? resolve(to) : join(KIT, "fantasy/avatar");
  for (const folder of [out, outfitsOut]) {
    if (!anthroOnly && !(outfitsOnly && folder === out)) rmSync(folder, { recursive: true, force: true });
    mkdirSync(folder, { recursive: true });
  }
  const source =
    "Base mesh and shapes: MakeHuman (CC0), adapted in Blender by ThatOneCan (packages/wanderworld/assets/scripts)";
  const written = new Map(); // a picture's bytes → its kit name (the same picture twice is one file)
  /** A file's picture (`image:<n>`) as a .webp in `folder`, named `name` unless it's already there. */
  const picture = (gltf, image, name, folder) => {
    const bytes = gltf.imageOf(image);
    const key = bytes.toString("base64");
    if (written.has(key)) return written.get(key);
    const raw = join(
      folder,
      `${name}.${gltf.json.images[Number(image.slice(6))].mimeType === "image/jpeg" ? "jpg" : "png"}`,
    );
    writeFileSync(raw, bytes);
    execFileSync(FFMPEG, ["-v", "error", "-y", "-i", raw, "-quality", "82", join(folder, `${name}.webp`)]);
    rmSync(raw);
    written.set(key, name);
    return name;
  };
  /** Pictures named `<base>`, `<base>-1`, … in the order a file's meshes use them. */
  const namer = (gltf, base, folder) => {
    const names = new Map();
    return (primitive) => {
      if (!primitive.texture?.startsWith("image:")) return null;
      if (!names.has(primitive.texture))
        names.set(
          primitive.texture,
          picture(gltf, primitive.texture, names.size ? `${base}-${names.size}` : base, folder),
        );
      return names.get(primitive.texture);
    };
  };
  /** A part: packPart, each mesh saying its material (`part`), colour (linear) and how its alpha is used. */
  const part = (primitives, texture, extra = {}) => {
    const packed = packPart(primitives, { texture, ...extra });
    packed.meshes.forEach((mesh, i) => {
      const material = primitives[i].material;
      mesh.part = material?.name ?? "part";
      mesh.colour = (material?.pbrMetallicRoughness?.baseColorFactor ?? [1, 1, 1])
        .slice(0, 3)
        .map((value) => Math.round(value * 1e4) / 1e4);
      if (material?.alphaMode && material.alphaMode !== "OPAQUE") mesh.alpha = material.alphaMode;
    });
    return packed;
  };
  const glbs = readdirSync(dir).filter(
    (name) =>
      name.endsWith(".glb") &&
      (!anthroOnly || name.startsWith("anthro-")) &&
      (!outfitsOnly || /^(?:avatar-(?:male|female)|outfit-[a-z0-9_]+)\.glb$/u.test(name)),
  );
  /**
   * A body file's document (its skeleton, parts and pieces, shape keys and height; `texture` names each
   * mesh's picture), with its meshes as read and the share of its triangles its distant version keeps
   * (DISTANT_VERTICES' worth; its hair and outfit pieces keep the same share of theirs).
   */
  const bodyOf = (gltf, texture) => {
    // (A halfling's foot hair is left out until it's remade: it reads as flecks.)
    const primitives = skinnedPrimitives(gltf).filter((primitive) => !/^foothair-/u.test(primitive.nodeName ?? ""));
    // (The underwear is packed without the races' keys, megabytes of them: the game carries a race's build
    // onto it from the skin, as it does onto hair and clothes, src/avatar.js `carried`.)
    for (const primitive of primitives) {
      if (!/^underwear-/u.test(primitive.nodeName ?? "") || !primitive.targets) continue;
      const kept = primitive.keyNames.filter((key) => !key.startsWith("race_"));
      primitive.targets = kept.map((key) => primitive.targets[primitive.keyNames.indexOf(key)]);
      primitive.keyNames = kept;
    }
    primitives.forEach(keyNormals);
    const share = distantShare(primitives.reduce((sum, primitive) => sum + primitive.position.count, 0));
    const body = part(primitives, texture, { skeleton: skeletonOf(gltf), distant: share });
    // The underwear's styles, each a mesh of its own ("underwear-bottom-briefs", "underwear-top-bra"); a body
    // made before they were has one layer in its own mesh, "underwear-legacy" (briefs, and a bra on her).
    // The brow and lash styles ("eyebrows-01", "eyelashes-01") are pieces too: one of each shows. A dragon's
    // "wings" are a piece the look can leave off, and so are the races' parts: tusks, horns, a tiefling's
    // tail, beards and a moustache.
    body.meshes.forEach((mesh, i) => {
      const name = [primitives[i].nodeName, primitives[i].name].find((text) =>
        /^(?:underwear-(?:top|bottom)|eyebrows|eyelashes)-|^(?:tusks|horns|beard|moustache)-\d+$|^tail-tiefling$|^wings$/u.test(
          text ?? "",
        ),
      );
      if (name) mesh.piece = name;
      else if (/^underwear/u.test(mesh.part)) mesh.piece = "underwear-legacy";
    });
    let top = 0;
    for (const primitive of primitives)
      for (let i = 1; i < primitive.position.values.length; i += 3) top = Math.max(top, primitive.position.values[i]);
    const keys = [...new Set(primitives.flatMap((primitive) => primitive.keyNames))];
    return { primitives, share, document: { source, height: Math.round(top * 100) / 100, keys, ...body } };
  };
  const shares = {};
  const reach = {}; // each body's keyReach, for its hair and clothes (followBody)
  for (const sex of ["male", "female"]) {
    if (!glbs.includes(`avatar-${sex}.glb`)) continue;
    const gltf = readGltf(join(dir, `avatar-${sex}.glb`));
    // (For the outfits alone, a body is only read: for where its keys reach and its distant share.)
    const { primitives, share, document } = bodyOf(gltf, outfitsOnly ? () => null : namer(gltf, `avatar-${sex}`, out));
    reach[sex] = keyReach(primitives);
    shares[sex] = share;
    if (!outfitsOnly) writePacked(join(out, `avatar-${sex}.pack.png`), document, MESH_KINDS);
  }
  // ── MakeHuman skins and eye pictures (assets/textures/avatar, written by make_avatar.py) ──
  // The skins as they are, a file each, loaded only when worn. The nine eye pictures in one file
  // (avatar-eyes.webp), to spare asset paths: 3 × 3 tiles of each picture's top 512 × 384, the part its
  // iris and eye white use (src/looks.js EYE_PICTURES, in this order). (avatar-eyes-grey-tint.webp is the
  // model's own eye texture, packed with the body above.)
  const pictures = join(ROOT, "packages/wanderworld/assets/textures/avatar");
  if (!anthroOnly && !outfitsOnly && existsSync(pictures)) {
    for (const name of readdirSync(pictures).filter((file) => /^avatar-(?:male|female)-skin-/u.test(file)))
      writeFileSync(join(out, name), readFileSync(join(pictures, name)));
    const eyes = ["brownlight", "brown", "green", "bluegreen", "blue", "lightblue", "deepblue", "grey", "ice"];
    if (eyes.every((eye) => existsSync(join(pictures, `avatar-eyes-${eye}.webp`))))
      execFileSync(FFMPEG, [
        ...["-v", "error", "-y"],
        ...eyes.flatMap((eye) => ["-i", join(pictures, `avatar-eyes-${eye}.webp`)]),
        "-filter_complex",
        `${eyes.map((_, i) => `[${i}]scale=512:512,crop=512:384:0:0[t${i}]`).join(";")};${eyes.map((_, i) => `[t${i}]`).join("")}xstack=inputs=9:layout=${eyes.map((_, i) => `${(i % 3) * 512}_${Math.floor(i / 3) * 384}`).join("|")}`,
        ...["-frames:v", "1", "-quality", "88", join(out, "avatar-eyes.webp")],
      ]);
  }
  // ── Hair styles and outfit pieces: bundles with their pictures inside, and an index of which has which ──
  // (A file a bundle, not a piece or a picture: the package may list at most 256 asset files. A bundle is
  // loaded the first time someone wears one of its pieces, so a shirt doesn't fetch the armour.)
  const bundles = new Map(); // a bundle's path → { …its document, pictures }
  const seen = new Map(); // `${bundle}:${a picture's bytes}` → its name there
  const bundleAt = (path, document) => {
    if (!bundles.has(path)) bundles.set(path, { source, ...document, pictures: [] });
    return bundles.get(path);
  };
  /** A .glb's picture into a bundle as WebP, at most `most` pixels a side, once however often it's used. */
  const pictureIn = (path, gltf, image, name, most = 1024) => {
    const bytes = gltf.imageOf(image);
    const key = `${path}:${bytes.toString("base64")}`;
    if (!seen.has(key)) {
      const jpeg = gltf.json.images[Number(image.slice(6))].mimeType === "image/jpeg";
      const raw = join(dirname(path), `${name}.${jpeg ? "jpg" : "png"}`);
      writeFileSync(raw, bytes);
      const scale = ["-vf", `scale=w='min(${most},iw)':h='min(${most},ih)'`];
      bundles.get(path).pictures.push({ name, webp: webp(raw, 82, scale) });
      seen.set(key, name);
    }
    return seen.get(key);
  };
  /** A file's meshes for `sex` (a mesh named for neither body is both's), read afresh, so each body's
   *  shape keys can be put right on its own. */
  const meshesFor = (gltf, sex) =>
    meshPrimitives(gltf).filter((primitive) => {
      const name = primitive.nodeName || primitive.name || "";
      return !/^avatar-/u.test(name) && (sexOfName(name) ?? sex) === sex;
    });
  /** Words from an extras value: a list, or a string of words ("torso, upperarms"). */
  const wordsOf = (value) => [
    ...new Set((Array.isArray(value) ? value : String(value ?? "").split(/[\s,]+/u)).filter(Boolean)),
  ];
  // A shape key's moves under a tenth of a millimetre are left out of hair and clothes.
  const PIECE_STILL = 1e-4;
  const sexes = Object.keys(reach);

  // The anthro bodies: a file each, with its pictures inside (the package may list only so many files).
  for (const file of glbs.filter((name) => /^anthro-[a-z]+-(?:male|female)\.glb$/u.test(name)).sort()) {
    const name = file.slice(0, -4);
    const path = join(out, `${name}.pack.png`);
    const gltf = readGltf(join(dir, file));
    const bundle = bundleAt(path, {});
    const texture = (primitive) =>
      primitive.texture?.startsWith("image:")
        ? pictureIn(
            path,
            gltf,
            primitive.texture,
            `${name}-${primitive.texture.slice(6)}`,
            /^underwear/u.test(primitive.material?.name ?? "") ? 1024 : 2048,
          )
        : null;
    Object.assign(bundle, bodyOf(gltf, texture).document);
  }

  // Hair: in two bundles, the short styles and the long. Each keeps only the keys that move the head.
  const hairIndex = {};
  for (const file of glbs.filter((name) => /^avatar-hair-[a-z0-9_]+\.glb$/u.test(name)).sort()) {
    const style = file.slice("avatar-hair-".length, -4);
    if (!HAIRSTYLES.some(([name]) => name === style))
      throw new Error(`${file}: add "${style}" to HAIRSTYLES in packages/wanderworld/src/looks.js`);
    const name = `avatar-hair-${LONG_HAIR.has(style) ? "long" : "short"}`;
    const path = join(out, `${name}.pack.png`);
    const bundle = bundleAt(path, { styles: {} });
    const gltf = readGltf(join(dir, file));
    const entry = {};
    for (const sex of sexes) {
      const own = meshesFor(gltf, sex);
      if (!own.length) continue;
      for (const primitive of own) {
        followBody(primitive, reach[sex]);
        keyNormals(primitive);
      }
      const texture = (primitive) =>
        primitive.texture?.startsWith("image:")
          ? pictureIn(path, gltf, primitive.texture, `avatar-hair-${style}-${primitive.texture.slice(6)}`)
          : null;
      entry[sex] = part(own, texture, { distant: shares[sex] ?? 1, still: PIECE_STILL });
    }
    bundle.styles[style] = entry;
    hairIndex[style] = { bundle: name, bodies: Object.keys(entry) };
  }

  // Outfit pieces: a bundle for each group of slots (looks.js CLOTH_SLOTS), each piece's parts drawn as
  // one (mergePrimitives), the face keys only on what's worn on the head, and another way of wearing it
  // (a cloak's hood up) a variant of its own, never shown with the usual one.
  const FACE_KEYS = new Set(["jaw", "cheeks", "nose", "eyes", "ears_pointed"]);
  const HEAD_SLOTS = new Set(["head", "brow", "neck"]);
  const PART_NAMES = new Set(CLOTH_PARTS.map(([name]) => name));
  const outfitIndex = {};
  for (const file of glbs.filter((name) => /^outfit-[a-z0-9_]+\.glb$/u.test(name)).sort()) {
    const piece = file.slice("outfit-".length, -4);
    const slot = SLOT_OF[piece];
    if (!slot) throw new Error(`${file}: add "${piece}" to CLOTHES in packages/wanderworld/src/looks.js`);
    const name = `avatar-outfits-${CLOTH_SLOTS.find(([each]) => each === slot)[3]}`;
    const path = join(outfitsOut, `${name}.pack.png`);
    const bundle = bundleAt(path, { pieces: {} });
    const gltf = readGltf(join(dir, file));
    const entry = { slot, layer: 0, hides: [] };
    const info = { bundle: name, slot, bodies: [], parts: {} };
    for (const sex of sexes) {
      const nodes = new Map(); // node name ("female", "female_hood_up") → its meshes
      for (const primitive of meshesFor(gltf, sex)) {
        if (!nodes.has(primitive.nodeName)) nodes.set(primitive.nodeName, []);
        nodes.get(primitive.nodeName).push(primitive);
      }
      for (const meshes of nodes.values()) {
        const merged = mergePrimitives(meshes);
        const kept = merged.keyNames.filter((key) => HEAD_SLOTS.has(slot) || !FACE_KEYS.has(key));
        merged.targets = kept.map((key) => merged.targets[merged.keyNames.indexOf(key)]);
        merged.keyNames = kept;
        trimTriangles(merged, OUTFIT_TRIM);
        followBody(merged, reach[sex]);
        keyNormals(merged);
        for (const { part: partName } of merged.parts)
          if (!PART_NAMES.has(partName))
            throw new Error(`${file}: add the part "${partName}" to CLOTH_PARTS in packages/wanderworld/src/looks.js`);
        const texture = (primitive) =>
          primitive.texture?.startsWith("image:")
            ? pictureIn(path, gltf, primitive.texture, `avatar-outfit-${piece}-${primitive.texture.slice(6)}`)
            : null;
        const packed = part([merged], texture, { distant: shares[sex] ?? 1, still: PIECE_STILL });
        const [mesh] = packed.meshes;
        delete mesh.part;
        delete mesh.colour;
        mesh.parts = merged.parts;
        const extras = meshes[0].extras ?? {};
        const variant = extras.variant ?? "";
        const into = variant ? ((entry.variants ??= {})[variant] ??= {}) : entry;
        into.hides = wordsOf(extras.hides);
        into[sex] = packed;
        entry.layer = Number(extras.layer) || entry.layer;
        if (variant && !(info.variants ??= []).includes(variant)) info.variants.push(variant);
        if (!variant) info.parts[sex] = merged.parts.map(({ part: partName, colour }) => [partName, srgbHex(colour)]);
      }
      if (entry[sex]) info.bodies.push(sex);
    }
    bundle.pieces[piece] = entry;
    outfitIndex[piece] = info;
  }
  const sorted = (index) => Object.fromEntries(Object.entries(index).sort(([a], [b]) => a.localeCompare(b)));
  for (const [path, bundle] of bundles) writePacked(path, bundle, MESH_KINDS);
  if (Object.keys(hairIndex).length)
    writeFileSync(join(out, "avatar-hair-index.json"), `${JSON.stringify(sorted(hairIndex), null, 1)}\n`);
  if (Object.keys(outfitIndex).length)
    writeFileSync(join(outfitsOut, "avatar-outfits-index.json"), `${JSON.stringify(sorted(outfitIndex), null, 1)}\n`);
  for (const folder of [out, outfitsOut]) if (!readdirSync(folder).length) rmSync(folder, { recursive: true });
  console.log(
    `wrote the avatar: ${readdirSync(out).join(", ")}; ${Object.keys(hairIndex).length} hair styles and ${Object.keys(outfitIndex).length} outfit pieces in ${[...bundles.keys()].map((path) => path.split(/[\\/]/u).pop()).join(", ")}`,
  );
}
/** The hair styles packed with the long ones (avatar-hair-long.pack.png); the rest are the short ones'. */
const LONG_HAIR = new Set(["long", "ponytail", "braid", "bob", "bob_angled", "curly", "buns"]);

function main() {
  if (process.argv[2] === "--bestiary") return bestiary(process.argv.slice(3));
  if (process.argv[2] === "--avatar") return avatar(process.argv[3], process.argv[4]);
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
      writePacked(join(OUTFITS, `${sex}-${kind}.pack.png`), { pieces: bundle }, MESH_KINDS);
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
  writePacked(join(OUT, "bodies.pack.png"), packed, MESH_KINDS);
  writeFileSync(join(OUT, "index.json"), JSON.stringify(index, null, 2));
  console.log(`wrote ${OUT} and ${OUTFITS}`);
}

main();
