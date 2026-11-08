#!/usr/bin/env node
// Converts Quaternius's Universal Base Characters and Modular Character Outfits - Fantasy (both CC0, free
// "Standard" downloads) into Wanderworld's people kit: packages/wanderworld/kit/people/*.json meshes and
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
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "packages/wanderworld/kit/people");
const FFMPEG = process.env.FFMPEG || "ffmpeg";
const TEXTURE_SIZE = 512;

// ── A small glTF reader: accessors, skins and images, nothing else ──

function readGltf(path) {
  const json = JSON.parse(readFileSync(path, "utf8"));
  const buffers = json.buffers.map((buffer) => readFileSync(join(dirname(path), decodeURIComponent(buffer.uri))));
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
    return texture ? json.images[json.textures[texture.index].source].uri : null;
  };
  return { json, accessor, textureOf };
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
        position: gltf.accessor(primitive.attributes.POSITION),
        normal: gltf.accessor(primitive.attributes.NORMAL),
        uv: gltf.accessor(primitive.attributes.TEXCOORD_0),
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
    join(OUT, `${name}.webp`),
  ]);
  return name;
}

/** A texture shrunk to its size. */
function texture(source, name, size = TEXTURE_SIZE) {
  execFileSync(FFMPEG, [
    "-v",
    "error",
    "-y",
    "-i",
    source,
    "-vf",
    `scale=${size}:${size}`,
    "-quality",
    "82",
    join(OUT, `${name}.webp`),
  ]);
  return name;
}

function main() {
  const [baseDir, outfitDir] = process.argv.slice(2);
  if (!baseDir || !outfitDir)
    throw new Error(
      "Usage: build-wanderworld-people.mjs <Universal Base Characters dir> <Modular Character Outfits dir>",
    );
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });
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
    texture(peasant2, "clothes-b"),
    recolour(peasant, "clothes-blue", "hue=h=190:s=1.3", mask),
    recolour(peasant, "clothes-red", "hue=h=-25:s=1.5", mask),
    recolour(peasant2, "clothes-teal", "hue=h=110:s=1.4", mask),
    recolour(peasant, "clothes-plum", "hue=h=-65:s=0.75", mask),
    recolour(peasant, "clothes-grey", "hue=s=0.25,eq=brightness=0.04", mask),
  ];
  rmSync(mask);

  for (const [sex, Sex] of [
    ["male", "Male"],
    ["female", "Female"],
  ]) {
    texture(join(outfitTextures, `Base/T_Regular_${Sex}_Dark_BaseColor.png`), `skin-${sex}`);
    const headSkin = sex === "male" ? "T_Superhero_Male_Dark.png" : "T_Superhero_Female_Dark_BaseColor.png";
    texture(join(bodies, headSkin), `head-${sex}`);

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
    writeFileSync(join(OUT, `head-${sex}.json`), JSON.stringify(head));

    // Outfits: the whole clothed body (hands and arms in the skin texture), with the skeleton. Only the
    // everyday clothes: the pack's ranger outfit reads as an adventurer, not a townsperson.
    index.sexes[sex] = { outfits: [] };
    for (const outfit of ["Peasant"]) {
      const gltf = readGltf(join(outfits, `${Sex}_${outfit}.gltf`));
      const part = packPart(skinnedPrimitives(gltf), {
        texture: (primitive) => (/Regular/iu.test(primitive.texture ?? "") ? `skin-${sex}` : "clothes"),
        skeleton: skeletonOf(gltf),
      });
      const name = `${sex}-${outfit.toLowerCase()}`;
      writeFileSync(join(OUT, `${name}.json`), JSON.stringify(part));
      index.sexes[sex].outfits.push({ name, colourways });
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
    writeFileSync(join(OUT, `${name}.json`), JSON.stringify(part));
    index.hair[style.toLowerCase()] = name;
  }
  writeFileSync(join(OUT, "index.json"), JSON.stringify(index, null, 2));
  console.log(`wrote ${OUT}`);
}

main();
