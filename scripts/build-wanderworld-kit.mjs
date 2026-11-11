#!/usr/bin/env node
// Converts static models (trees, rocks, plants, props) from Quaternius's CC0 packs into Wanderworld's kit:
// packages/wanderworld/kit/<set>/*.json meshes and *.webp textures, served as package assets and loaded
// by src/kit.js. Each model's node transforms are baked in, its meshes grouped by material, positions
// and texture coordinates quantized within their boxes.
//
// Usage (unzip the pack first; ffmpeg must be on PATH, or set FFMPEG):
//   node scripts/build-wanderworld-kit.mjs nature "<…>/Stylized Nature MegaKit[Standard]/glTF"
//   (props also takes the Farm Buildings pack's FBX folder, for the barn and the windmill)
//   node scripts/build-wanderworld-kit.mjs props "<…>/Fantasy Props MegaKit[Standard]/Exports/glTF" "<…>/Medieval Village MegaKit[Standard]/glTF"
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Matrix3, Matrix4, Quaternion, Vector3 } from "three";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FFMPEG = process.env.FFMPEG || "ffmpeg";

/**
 * What each set takes from its pack: where it goes in the kit (`dir`: by setting, "generic" for what any
 * world has, "fantasy" for the medieval one; src/kit.js has the same), model files, and the size each
 * texture is shrunk to. A set's models go in one file, models.json (a package may list only so many
 * files, and a world loads nearly all of a set anyway). To drop or swap a model, change its list and run
 * the script again.
 */
const SETS = {
  nature: {
    dir: "generic/nature",
    source: "Stylized Nature MegaKit (Standard) by Quaternius, CC0 1.0",
    models: [
      "CommonTree_1",
      "CommonTree_2",
      "CommonTree_3",
      "CommonTree_4",
      "Pine_1",
      "Pine_2",
      "Pine_3",
      "Pine_4",
      "TwistedTree_1",
      "DeadTree_1",
      "Bush_Common",
      "Bush_Common_Flowers",
      "Fern_1",
      "Plant_1",
      "Plant_7",
      "Clover_1",
      "Mushroom_Common",
      "Flower_3_Group",
      "Flower_4_Group",
      "Grass_Common_Tall",
      "Grass_Common_Short",
      "Grass_Wispy_Tall",
      "Rock_Medium_1",
      "Rock_Medium_2",
      "Rock_Medium_3",
      "Pebble_Round_1",
      "Pebble_Round_3",
      "RockPath_Round_Wide",
    ],
    textureSize: (name) => (/grass/iu.test(name) ? 128 : 256),
  },
  village: {
    dir: "fantasy/village",
    source: "Medieval Village MegaKit (Standard) by Quaternius, CC0 1.0",
    models: [
      "Wall_UnevenBrick_Straight",
      "Wall_UnevenBrick_Window_Wide_Round",
      "Wall_UnevenBrick_Door_Round",
      "Wall_Plaster_Straight",
      "Wall_Plaster_WoodGrid",
      "Wall_Plaster_Window_Wide_Round",
      "Wall_Plaster_Window_Thin_Round",
      "Wall_Plaster_Door_Round",
      "Corner_Exterior_Wood",
      "Corner_Exterior_Brick",
      "Window_Wide_Round1",
      "Window_Thin_Round1",
      "WindowShutters_Wide_Round_Open",
      "DoorFrame_Round_WoodDark",
      "Door_1_Round",
      "Roof_RoundTiles_4x4",
      "Roof_RoundTiles_4x6",
      "Roof_RoundTiles_4x8",
      "Roof_RoundTiles_6x4",
      "Roof_RoundTiles_6x6",
      "Roof_RoundTiles_6x8",
      "Roof_RoundTiles_6x10",
      "Roof_RoundTiles_6x12",
      "Roof_RoundTiles_6x14",
      "Roof_RoundTiles_8x8",
      "Roof_RoundTiles_8x10",
      "Roof_RoundTiles_8x12",
      "Roof_RoundTiles_8x14",
      "Roof_Front_Brick4",
      "Roof_Front_Brick6",
      "Roof_Front_Brick8",
      "Roof_Tower_RoundTiles",
      "Prop_Chimney",
      "Balcony_Simple_Straight",
      "Prop_Vine1",
      "Prop_Vine4",
      "Wall_UnevenBrick_Window_Wide_Flat",
      "Wall_Plaster_Window_Wide_Flat",
      "Wall_Plaster_Window_Wide_Flat2",
      "Wall_Plaster_Straight_Base",
      "Wall_Arch",
      "Window_Wide_Flat1",
      "WindowShutters_Wide_Flat_Open",
      "Roof_Dormer_RoundTile",
      "Roof_Wooden_2x1",
      "Roof_Wooden_2x1_L",
      "Roof_Wooden_2x1_R",
      "Roof_Wooden_2x1_Center",
      "Prop_Chimney2",
      "Balcony_Cross_Straight",
      "Prop_Vine2",
    ],
    textureSize: () => 512,
  },
  props: {
    dir: "fantasy/props",
    source: "Fantasy Props MegaKit (Standard) and Medieval Village MegaKit (Standard) by Quaternius, CC0 1.0",
    models: [
      // Furniture
      "Bed_Twin1",
      "Bed_Twin2",
      "Table_Large",
      "Chair_1",
      "Stool",
      "Bench",
      "Bookcase_2",
      "Shelf_Simple",
      "Shelf_Small_Bottles",
      "Cabinet",
      "Chest_Wood",
      "Nightstand_Shelf",
      "Workbench",
      "Workbench_Drawers",
      "BookStand",
      "Peg_Rack",
      "WeaponStand",
      "Dummy",
      // Lights
      "CandleStick_Stand",
      "CandleStick_Triple",
      "Chandelier",
      "Lantern_Wall",
      "Torch_Metal",
      // Work and storage
      "Anvil",
      "Cauldron",
      "Barrel",
      "Barrel_Apples",
      "Crate_Wooden",
      "FarmCrate_Apple",
      "FarmCrate_Carrot",
      "Bucket_Wooden_1",
      "Bucket_Metal",
      "Bag",
      "FarmCrate_Empty",
      "Stall_Empty",
      "Stall_Cart_Empty",
      // Small things on tables and shelves
      "Mug",
      "Bottle_1",
      "Pot_1",
      "Vase_2",
      "Table_Plate",
      "Book_Stack_1",
      "BookGroup_Medium_1",
      "Coin_Pile",
      "Banner_1",
      // From the village kit
      "Prop_Wagon",
      "Prop_Crate",
      "Prop_WoodenFence_Single",
      "Prop_WoodenFence_Extension1",
    ],
    // From Farm Buildings (CC0), which ships FBX and no glTF: flat colours, no textures, in centimetres.
    fbx: ["Barn", "Windmill"],
    textureSize: () => 512,
  },
};

// ── glTF: accessors, nodes, materials ──

function readGltf(path) {
  const json = JSON.parse(readFileSync(path, "utf8"));
  const buffers = json.buffers.map((buffer) => readFileSync(join(dirname(path), decodeURIComponent(buffer.uri))));
  const COMPONENTS = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
  const SIZES = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 };
  function accessor(index) {
    const info = json.accessors[index];
    const view = json.bufferViews[info.bufferView];
    const size = COMPONENTS[info.type];
    const bytes = SIZES[info.componentType];
    const buffer = buffers[view.buffer];
    const data = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    const start = (view.byteOffset ?? 0) + (info.byteOffset ?? 0);
    const stride = view.byteStride ?? size * bytes;
    const read = {
      5120: (o) => data.getInt8(o),
      5121: (o) => data.getUint8(o),
      5122: (o) => data.getInt16(o, true),
      5123: (o) => data.getUint16(o, true),
      5125: (o) => data.getUint32(o, true),
      5126: (o) => data.getFloat32(o, true),
    }[info.componentType];
    const scale = info.normalized ? { 5120: 127, 5121: 255, 5122: 32767, 5123: 65535 }[info.componentType] : 1;
    const out = new Float64Array(info.count * size);
    for (let i = 0; i < info.count; i++) {
      for (let c = 0; c < size; c++) out[i * size + c] = read(start + i * stride + c * bytes) / scale;
    }
    return out;
  }
  return { json, accessor };
}

const b64 = (typed) => Buffer.from(typed.buffer, typed.byteOffset, typed.byteLength).toString("base64");

/** Values quantized to uint16 within their per-axis box. */
function quantize(values, size) {
  const min = Array(size).fill(Infinity);
  const max = Array(size).fill(-Infinity);
  for (let i = 0; i < values.length; i++) {
    min[i % size] = Math.min(min[i % size], values[i]);
    max[i % size] = Math.max(max[i % size], values[i]);
  }
  const out = new Uint16Array(values.length);
  for (let i = 0; i < values.length; i++) {
    const span = max[i % size] - min[i % size] || 1;
    out[i] = Math.round(((values[i] - min[i % size]) / span) * 65535);
  }
  const box = [...min, ...max].map((value) => Math.round(value * 1e5) / 1e5);
  return { data: b64(out), box };
}

/**
 * One model from a static FBX, as packModel gives one: its meshes by material, each a flat colour (the
 * older packs have no textures), in metres (the packs are in centimetres).
 */
async function packFbx(path) {
  // (The loader only wants these to exist: nothing is drawn here.)
  globalThis.self ??= globalThis;
  globalThis.document ??= {
    createElementNS: () => ({ addEventListener() {}, removeEventListener() {}, style: {} }),
    createElement: () => ({ getContext: () => null, style: {} }),
  };
  const { FBXLoader } = await import("three/examples/jsm/loaders/FBXLoader.js");
  const buffer = readFileSync(path);
  const scene = new FBXLoader().parse(
    buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
    "",
  );
  scene.updateMatrixWorld(true);
  const groups = new Map(); // material name → { positions, normals, indices, colour }
  const v = new Vector3();
  scene.traverse((mesh) => {
    if (!mesh.isMesh) return;
    const geometry = mesh.geometry;
    const p = geometry.attributes.position;
    const n = geometry.attributes.normal;
    const normalMatrix = new Matrix3().getNormalMatrix(mesh.matrixWorld);
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    // (A mesh with several materials says which each run of its corners has; one with one has no need to.)
    const runs = geometry.groups.length
      ? geometry.groups
      : [{ start: 0, count: geometry.index ? geometry.index.count : p.count, materialIndex: 0 }];
    for (const run of runs) {
      const material = materials[run.materialIndex] ?? materials[0];
      const group = groups.get(material.name) ?? { positions: [], normals: [], indices: [], colour: material.color };
      groups.set(material.name, group);
      for (let k = run.start; k < run.start + run.count; k++) {
        const i = geometry.index ? geometry.index.getX(k) : k;
        v.fromBufferAttribute(p, i).applyMatrix4(mesh.matrixWorld).multiplyScalar(0.01);
        group.indices.push(group.positions.length / 3);
        group.positions.push(v.x, v.y, v.z);
        v.fromBufferAttribute(n, i).applyMatrix3(normalMatrix).normalize();
        group.normals.push(v.x, v.y, v.z);
      }
    }
  });
  const meshes = [...groups.values()].map((group) => {
    const count = group.positions.length / 3;
    const position = quantize(group.positions, 3);
    const uv = quantize(new Array(count * 2).fill(0), 2);
    const indices = count > 65535 ? new Uint32Array(group.indices) : new Uint16Array(group.indices);
    return {
      texture: null,
      colour: group.colour.toArray().map((value) => Math.round(value * 1000) / 1000),
      cutout: false,
      doubleSided: true,
      count,
      box: position.box,
      uvBox: uv.box,
      position: position.data,
      normal: b64(new Int8Array(group.normals.map((value) => Math.round(value * 127)))),
      uv: uv.data,
      index: b64(indices),
      wide: indices instanceof Uint32Array,
    };
  });
  return { meshes, textures: [] };
}

/** One model: every mesh primitive, transformed by its node's world matrix and grouped by material. */
function packModel(path, textureName) {
  const gltf = readGltf(path);
  const groups = new Map(); // material index → { positions, normals, uvs, indices }
  const visit = (nodeIndex, parent) => {
    const node = gltf.json.nodes[nodeIndex];
    const local = new Matrix4();
    if (node.matrix) local.fromArray(node.matrix);
    else {
      local.compose(
        new Vector3(...(node.translation ?? [0, 0, 0])),
        new Quaternion(...(node.rotation ?? [0, 0, 0, 1])),
        new Vector3(...(node.scale ?? [1, 1, 1])),
      );
    }
    const world = parent.clone().multiply(local);
    if (node.mesh !== undefined) {
      const normalMatrix = new Matrix3().getNormalMatrix(world);
      for (const primitive of gltf.json.meshes[node.mesh].primitives) {
        const group = groups.get(primitive.material) ?? {
          positions: [],
          normals: [],
          uvs: [],
          colours: [],
          indices: [],
        };
        groups.set(primitive.material, group);
        const base = group.positions.length / 3;
        const p = gltf.accessor(primitive.attributes.POSITION);
        const n = gltf.accessor(primitive.attributes.NORMAL);
        const uv =
          primitive.attributes.TEXCOORD_0 !== undefined ? gltf.accessor(primitive.attributes.TEXCOORD_0) : null;
        // Vertex colours tint the texture on materials made for it ("…_Vertex"): fruit and vegetables.
        const tinted = /vertex/iu.test(gltf.json.materials?.[primitive.material]?.name ?? "");
        const colour =
          tinted && primitive.attributes.COLOR_0 !== undefined ? gltf.accessor(primitive.attributes.COLOR_0) : null;
        const channels = colour ? colour.length / (p.length / 3) : 0;
        const v = new Vector3();
        for (let i = 0; i < p.length / 3; i++) {
          v.set(p[i * 3], p[i * 3 + 1], p[i * 3 + 2]).applyMatrix4(world);
          group.positions.push(v.x, v.y, v.z);
          v.set(n[i * 3], n[i * 3 + 1], n[i * 3 + 2])
            .applyMatrix3(normalMatrix)
            .normalize();
          group.normals.push(v.x, v.y, v.z);
          group.uvs.push(uv ? uv[i * 2] : 0, uv ? uv[i * 2 + 1] : 0);
          for (let c = 0; c < 3; c++) group.colours.push(colour ? colour[i * channels + c] : 1);
        }
        const index =
          primitive.indices !== undefined ? gltf.accessor(primitive.indices) : [...Array(p.length / 3).keys()];
        for (const i of index) group.indices.push(base + i);
      }
    }
    for (const child of node.children ?? []) visit(child, world);
  };
  const scene = gltf.json.scenes[gltf.json.scene ?? 0];
  for (const root of scene.nodes) visit(root, new Matrix4());

  const meshes = [];
  const textures = [];
  for (const [materialIndex, group] of groups) {
    const material = gltf.json.materials?.[materialIndex] ?? {};
    const texture = material.pbrMetallicRoughness?.baseColorTexture;
    const image = texture ? gltf.json.images[gltf.json.textures[texture.index].source].uri : null;
    const count = group.positions.length / 3;
    const normals = new Int8Array(group.normals.map((value) => Math.round(value * 127)));
    const indices = count > 65535 ? new Uint32Array(group.indices) : new Uint16Array(group.indices);
    const position = quantize(group.positions, 3);
    const uv = quantize(group.uvs, 2);
    const colour = material.pbrMetallicRoughness?.baseColorFactor;
    const tinted = group.colours.some((value) => value < 0.999);
    meshes.push({
      texture: image ? textureName(image) : null,
      colour: colour ? colour.slice(0, 3).map((value) => Math.round(value * 1000) / 1000) : null,
      cutout: material.alphaMode === "MASK" || material.alphaMode === "BLEND",
      doubleSided: !!material.doubleSided,
      count,
      box: position.box,
      uvBox: uv.box,
      position: position.data,
      normal: b64(normals),
      uv: uv.data,
      index: b64(indices),
      wide: indices instanceof Uint32Array,
      // Linear vertex colours as bytes, only where they tint anything.
      ...(tinted ? { colours: b64(new Uint8Array(group.colours.map((value) => Math.round(value * 255)))) } : {}),
    });
    if (image) textures.push(image);
  }
  return { meshes, textures };
}

async function main() {
  const [setName, ...sourceDirs] = process.argv.slice(2);
  const set = SETS[setName];
  if (!set || !sourceDirs.length) {
    throw new Error(
      `Usage: build-wanderworld-kit.mjs <${Object.keys(SETS).join("|")}> <pack glTF folder> [more folders]`,
    );
  }
  const out = join(ROOT, "packages/wanderworld/kit", set.dir);
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  const textureName = (image) =>
    image
      .replace(/\.[a-z]+$/iu, "")
      .replace(/[^a-z0-9]+/giu, "-")
      .toLowerCase();
  const images = new Set();
  const index = { source: set.source, models: {} };
  const models = {};
  for (const model of [...set.models, ...(set.fbx ?? [])]) {
    const fbx = (set.fbx ?? []).includes(model);
    const path = sourceDirs
      .map((dir) => join(dir, `${model}.${fbx ? "fbx" : "gltf"}`))
      .find((candidate) => existsSync(candidate));
    if (!path) throw new Error(`No pack has ${model}.${fbx ? "fbx" : "gltf"}`);
    const packed = fbx ? await packFbx(path) : packModel(path, textureName);
    for (const image of packed.textures) images.add(image);
    const name = model.toLowerCase().replace(/_/gu, "-");
    models[name] = { meshes: packed.meshes };
    const box = packed.meshes.reduce(
      (acc, mesh) =>
        [0, 1, 2].map((axis) => [Math.min(acc[axis][0], mesh.box[axis]), Math.max(acc[axis][1], mesh.box[axis + 3])]),
      [
        [Infinity, -Infinity],
        [Infinity, -Infinity],
        [Infinity, -Infinity],
      ],
    );
    index.models[name] = {
      size: box.map(([min, max]) => Math.round((max - min) * 100) / 100),
      triangles: packed.meshes.reduce(
        (sum, mesh) => sum + Buffer.from(mesh.index, "base64").length / (mesh.wide ? 12 : 6),
        0,
      ),
    };
  }
  for (const image of images) {
    const source = sourceDirs
      .flatMap((dir) => [join(dir, image), join(dir, "../Textures", image), join(dir, "../../Textures", image)])
      .find((path) => existsSync(path));
    if (!source) throw new Error(`Missing texture ${image}`);
    const size = set.textureSize(image);
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
      join(out, `${textureName(image)}.webp`),
    ]);
  }
  writeFileSync(join(out, "models.json"), JSON.stringify({ models }));
  writeFileSync(join(out, "index.json"), JSON.stringify(index, null, 2));
  console.log(`wrote ${out}: ${set.models.length} models, ${images.size} textures`);
  for (const [name, info] of Object.entries(index.models))
    console.log(`  ${name.padEnd(22)} ${info.size.join(" × ")} m, ${info.triangles} triangles`);
}

await main();
