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
//   node scripts/build-wanderworld-people.mjs --avatar   (the base avatar, its hair styles and outfit pieces:
//     assets/models/avatar-*.glb and outfit-*.glb, into kit/generic/avatar and kit/fantasy/avatar)
//
// Each part (an outfit, a head, a hairstyle) keeps its own joints' inverse bind matrices, and every part
// of a person binds to one shared skeleton built from the outfit's. So a head cut from the base body, or a
// hairstyle rigged to its head bone, sits right on an outfit's body without reshaping anything.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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
        // (Shape keys: Blender's exporter names them in the mesh's extras.)
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
  // Shape keys (glTF morph targets), each only where it moves anything: the vertices (uint16 or uint32),
  // their moves (int16 within ±`d`, a scale per axis) and normals' changes (int8 within ±`n`).
  const morphs = {};
  (primitive.targets ?? []).forEach((target, k) => {
    const moved = [];
    for (const [v, n] of remap) {
      let size = 0;
      for (let c = 0; c < 3; c++) size = Math.max(size, Math.abs(target.position.values[v * 3 + c]));
      if (size > 1e-5) moved.push([v, n]);
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
        delta[i * 3 + c] = Math.round((target.position.values[v * 3 + c] / (d[c] || 1)) * 32767);
        normalDelta[i * 3 + c] = Math.round(((target.normal?.values[v * 3 + c] ?? 0) / (ns[c] || 1)) * 127);
      }
    });
    morphs[primitive.keyNames[k]] = {
      ids: b64(ids),
      d: d.map((value) => Number(value.toPrecision(6))),
      delta: b64(delta),
      n: ns.map((value) => Number(value.toPrecision(6))),
      normal: b64(normalDelta),
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
      if (!primitive.ibm) return;
      ibms.push(...Array.from(primitive.ibm.slice(i * 16, i * 16 + 16)).map((value) => Math.round(value * 1e6) / 1e6));
    });
  }
  const meshes = primitives.map((primitive) => packMesh(primitive, texture(primitive), jointIndex, keep?.(primitive)));
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
 * and the puglin), each as one part with its skeleton, into kit/fantasy/folk/folk.json with a texture
 * each. They have no animations of their own: the game moves them with the people's.
 */
function folk(dir) {
  const out = join(KIT, "fantasy/folk");
  mkdirSync(out, { recursive: true });
  // (Only its own files: the folder also holds the Blender-made ones, `bestiary` below.)
  for (const name of ["folk.json", "folk-imp.webp", "folk-puglin.webp"]) rmSync(join(out, name), { force: true });
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
 * The monsters made in Blender (packages/wanderworld/assets/scripts/make_*.py, each a .glb in
 * assets/models/ on the people's skeleton, with one texture of its own), into
 * kit/fantasy/folk/folk-built-<name>.json with a texture each (folk-<name>.webp): a file each, so the game
 * fetches only the creatures a world has. The game moves them with the people's animations, as it does the imp and the puglin; their
 * own actions stay in the .glb for anyone using the model elsewhere.
 */
function bestiary(only = []) {
  const dir = join(ROOT, "packages/wanderworld/assets/models");
  const out = join(KIT, "fantasy/folk");
  mkdirSync(out, { recursive: true });
  const creatures = join(KIT, "creatures");
  // (Named ones only, when some are named: the rest of the kit is left as it is, so a model still being
  // made beside them isn't packed half done.)
  if (!only.length) {
    for (const old of readdirSync(out).filter((name) => /^folk-built/u.test(name))) rmSync(join(out, old));
    for (const old of readdirSync(creatures).filter((name) => /^rigged-/u.test(name))) rmSync(join(creatures, old));
  }
  let count = 0;
  let own = 0;
  for (const file of readdirSync(dir)
    .filter((name) => name.endsWith(".glb") && !/^(?:avatar|anthro|outfit)-|^giant-base/u.test(name))
    .filter((name) => !only.length || only.includes(name.slice(0, -4)))
    .sort()) {
    const name = file.slice(0, -4);
    const gltf = readGltf(join(dir, file));
    const bones = skeletonOf(gltf).names;
    if (!bones.includes("pelvis") || !bones.includes("hand_r")) {
      rigged(name, join(dir, file), creatures);
      own++;
      continue;
    }
    const primitives = skinnedPrimitives(gltf);
    const png = join(out, `${name}.png`);
    writeFileSync(png, gltf.imageOf(primitives[0].texture));
    execFileSync(FFMPEG, ["-v", "error", "-y", "-i", png, "-quality", "90", join(out, `folk-${name}.webp`)]);
    rmSync(png);
    let top = 0;
    for (const primitive of primitives)
      for (let i = 1; i < primitive.position.values.length; i += 3) top = Math.max(top, primitive.position.values[i]);
    const body = {
      height: Math.round(top * 100) / 100,
      ...packPart(primitives, { texture: () => `folk-${name}`, skeleton: skeletonOf(gltf) }),
    };
    const packed = {
      source: "Made in Blender by ThatOneCan (packages/wanderworld/assets/scripts)",
      folk: { [name]: body },
    };
    writeFileSync(join(out, `folk-built-${name}.json`), JSON.stringify(packed));
    count++;
  }
  console.log(`wrote ${count} to ${out}, and ${own} with skeletons of their own to ${creatures}`);
}

/**
 * A creature with a skeleton of its own (a mimic, a roper): its .glb as it is, actions and all, played by
 * three's AnimationMixer in the game (src/rigged.js), but with its texture taken out into a .webp beside
 * it (smaller, and loaded without holding the model up). `kit/creatures/rigged-<name>.json`: { source,
 * height, glb (base64) }, and `rigged-<name>.webp`.
 * ponytail: the whole .glb in base64 (a third bigger than the bytes); a packed format like the animals'
 * would be smaller, once the format keeps textures and move and scale tracks.
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
  execFileSync(FFMPEG, ["-v", "error", "-y", "-i", png, "-quality", "90", join(out, `rigged-${name}.webp`)]);
  rmSync(png);
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
  if (normals) {
    json.extensionsUsed = [...new Set([...(json.extensionsUsed ?? []), "KHR_mesh_quantization"])];
    json.extensionsRequired = [...new Set([...(json.extensionsRequired ?? []), "KHR_mesh_quantization"])];
  }
  // The model without its images: their buffer views dropped and the rest packed up again.
  const dropped = new Set((json.images ?? []).map((entry) => entry.bufferView));
  const renumber = new Map();
  const parts = [];
  let offset = 0;
  json.bufferViews = json.bufferViews.filter((view, i) => {
    if (dropped.has(i)) return false;
    const bytes = replaced.get(i) ?? bin.subarray(view.byteOffset ?? 0, (view.byteOffset ?? 0) + view.byteLength);
    const pad = (4 - (offset % 4)) % 4;
    if (pad) parts.push(Buffer.alloc(pad));
    offset += pad;
    renumber.set(i, renumber.size);
    view.byteOffset = offset;
    parts.push(bytes);
    offset += bytes.length;
    return true;
  });
  for (const accessor of json.accessors) accessor.bufferView = renumber.get(accessor.bufferView);
  delete json.images;
  delete json.textures;
  delete json.samplers;
  for (const material of json.materials ?? []) delete material.pbrMetallicRoughness?.baseColorTexture;
  const body = Buffer.concat(parts);
  json.buffers = [{ byteLength: body.length }];
  const text = Buffer.from(JSON.stringify(json));
  const jsonChunk = Buffer.concat([text, Buffer.alloc((4 - (text.length % 4)) % 4, 0x20)]);
  const binChunk = Buffer.concat([body, Buffer.alloc((4 - (body.length % 4)) % 4)]);
  const header = Buffer.alloc(12);
  header.write("glTF", 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(12 + 8 + jsonChunk.length + 8 + binChunk.length, 8);
  const chunk = (data, type) => {
    const head = Buffer.alloc(8);
    head.writeUInt32LE(data.length, 0);
    head.write(type, 4);
    return Buffer.concat([head, data]);
  };
  const glb = Buffer.concat([header, chunk(jsonChunk, "JSON"), chunk(binChunk, "BIN\0")]);
  // How tall it stands: the highest point of its meshes at rest.
  let top = 0;
  for (const mesh of json.meshes)
    for (const primitive of mesh.primitives) top = Math.max(top, json.accessors[primitive.attributes.POSITION].max[1]);
  writeFileSync(
    join(out, `rigged-${name}.json`),
    JSON.stringify({
      source: "Made in Blender by ThatOneCan (packages/wanderworld/assets/scripts)",
      height: Math.round(top * 100) / 100,
      glb: glb.toString("base64"),
    }),
  );
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

/** Which body a mesh is for, by its name ("male", "hair_female"): "male", "female", or null (both). */
const sexOfName = (name) =>
  /(?:^|[^a-z])female/u.test(name.toLowerCase())
    ? "female"
    : /(?:^|[^a-z])male/u.test(name.toLowerCase())
      ? "male"
      : null;

/**
 * The base avatar (assets/scripts/make_avatar.py) into the kit, with its shape keys, for src/avatar.js:
 * - kit/generic/avatar/avatar-<sex>.json, a body each (the skeleton, every part with its material's name and
 *   colour, the underwear's styles, shape keys), and its textures avatar-<sex>.webp, avatar-<sex>-1.webp;
 * - kit/generic/avatar/avatar-hair.json, every hair style (avatar-hair-<style>.glb, a `male` and a `female`
 *   mesh, skinned or hung on the head bone), and their textures;
 * - kit/fantasy/avatar/avatar-outfits.json, every outfit piece (outfit-<piece>.glb, a `male` and a `female`
 *   mesh with the body's shape keys, and `hides`, the body's regions it covers, in its extras), and theirs.
 * One file a body and one for each kind of the rest, as a package may list at most 256 asset files.
 */
function avatar() {
  const dir = join(ROOT, "packages/wanderworld/assets/models");
  const out = join(KIT, "generic/avatar");
  const outfitsOut = join(KIT, "fantasy/avatar");
  for (const folder of [out, outfitsOut]) {
    rmSync(folder, { recursive: true, force: true });
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
  const glbs = readdirSync(dir).filter((name) => name.endsWith(".glb"));
  for (const sex of ["male", "female"]) {
    if (!glbs.includes(`avatar-${sex}.glb`)) continue;
    const gltf = readGltf(join(dir, `avatar-${sex}.glb`));
    const primitives = skinnedPrimitives(gltf);
    const body = part(primitives, namer(gltf, `avatar-${sex}`, out), { skeleton: skeletonOf(gltf) });
    // The underwear's styles, each a mesh of its own ("underwear-bottom-briefs", "underwear-top-bra"); a body
    // made before they were has one layer in its own mesh, "underwear-legacy" (briefs, and a bra on her).
    body.meshes.forEach((mesh, i) => {
      const name = [primitives[i].nodeName, primitives[i].name].find((text) =>
        /^underwear-(?:top|bottom)-/u.test(text ?? ""),
      );
      if (name) mesh.piece = name;
      else if (/^underwear/u.test(mesh.part)) mesh.piece = "underwear-legacy";
    });
    let top = 0;
    for (const primitive of primitives)
      for (let i = 1; i < primitive.position.values.length; i += 3) top = Math.max(top, primitive.position.values[i]);
    const keys = [...new Set(primitives.flatMap((primitive) => primitive.keyNames))];
    writeFileSync(
      join(out, `avatar-${sex}.json`),
      JSON.stringify({ source, height: Math.round(top * 100) / 100, keys, ...body }),
    );
  }
  /** Each body's meshes of a hair or outfit file: { male, female }, a part each (a mesh for both goes in both). */
  const bySex = (gltf, base, folder) => {
    const primitives = meshPrimitives(gltf).filter(
      (primitive) => !/^avatar-/u.test(primitive.nodeName ?? primitive.name ?? ""),
    );
    const texture = namer(gltf, base, folder);
    const sexes = {};
    for (const sex of ["male", "female"]) {
      const own = primitives.filter(
        (primitive) => (sexOfName(primitive.nodeName || primitive.name || "") ?? sex) === sex,
      );
      if (own.length) sexes[sex] = part(own, texture);
    }
    return { sexes, primitives };
  };
  const styles = {};
  for (const file of glbs.filter((name) => /^avatar-hair-[a-z0-9_]+\.glb$/u.test(name)).sort()) {
    const style = file.slice("avatar-hair-".length, -4);
    styles[style] = bySex(readGltf(join(dir, file)), `avatar-hair-${style}`, out).sexes;
  }
  if (Object.keys(styles).length) writeFileSync(join(out, "avatar-hair.json"), JSON.stringify({ source, styles }));
  const pieces = {};
  for (const file of glbs.filter((name) => /^outfit-[a-z0-9_]+\.glb$/u.test(name)).sort()) {
    const piece = file.slice("outfit-".length, -4);
    const gltf = readGltf(join(dir, file));
    const { sexes, primitives } = bySex(gltf, `avatar-outfit-${piece}`, outfitsOut);
    // What it covers: `hides` in its meshes', nodes' or scene's extras, a list or words ("torso, upperarms").
    const said = [
      ...primitives.map((primitive) => primitive.extras?.hides),
      ...(gltf.json.scenes ?? []).map((scene) => scene.extras?.hides),
    ];
    const hides = [
      ...new Set(
        said.flatMap((value) => (Array.isArray(value) ? value : String(value ?? "").split(/[\s,]+/u))).filter(Boolean),
      ),
    ];
    pieces[piece] = { hides, ...sexes };
  }
  if (Object.keys(pieces).length)
    writeFileSync(join(outfitsOut, "avatar-outfits.json"), JSON.stringify({ source, pieces }));
  for (const folder of [out, outfitsOut]) if (!readdirSync(folder).length) rmSync(folder, { recursive: true });
  console.log(
    `wrote the avatar: ${readdirSync(out).join(", ")}${Object.keys(pieces).length ? `; outfits: ${Object.keys(pieces).join(", ")}` : ""}`,
  );
}

function main() {
  if (process.argv[2] === "--bestiary") return bestiary(process.argv.slice(3));
  if (process.argv[2] === "--avatar") return avatar();
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
