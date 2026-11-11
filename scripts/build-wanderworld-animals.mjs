#!/usr/bin/env node
// Converts animals from Quaternius's Ultimate Animated Animals pack (CC0) into Wanderworld's kit:
// packages/wanderworld/kit/creatures/<group>.json (farm.json: the farm's and the town's; wild.json: the
// country's), served as package assets and loaded by src/animals.js when a world has one of that group.
//
// Usage: node scripts/build-wanderworld-animals.mjs "<…>/Ultimate Animated Animals - July 2021/glTF"
//
// Each animal in the pack is a skinned mesh in flat colours with a dozen animations, about 1.5 MB, most
// of it keyframes. Kept here: the mesh (drawn as one: each vertex says which of the pack's materials it
// was, "Main", "Hair", "Hooves", and the file lists their colours, so the game can give a horse or a dog
// another coat), the skeleton, and the few animations the game plays (standing, grazing, walking, galloping),
// sampled again at a few frames a second: about a tenth the size. Sizes are in metres: each animal is
// scaled so it stands as tall as ANIMALS says.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { AnimationMixer, Quaternion, Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "packages/wanderworld/kit/creatures");

/**
 * Each animal kept: the file it goes in (src/animals.js has the same groups), the pack's file, and how
 * tall it stands (metres, ground to the top of its head or antlers). `parts` renames the pack's
 * materials where it left them unnamed. To drop or swap one, change this list and run the script again.
 */
const ANIMALS = {
  horse: { group: "farm", file: "Horse", height: 2.25 },
  donkey: { group: "farm", file: "Donkey", height: 1.65 },
  cow: { group: "farm", file: "Cow", height: 1.7 },
  bull: { group: "farm", file: "Bull", height: 1.8 },
  alpaca: { group: "farm", file: "Alpaca", height: 1.7 },
  husky: {
    group: "farm",
    file: "Husky",
    height: 0.85,
    parts: {
      Material: "Main",
      "Material.006": "Black",
      "Material.001": "Main_Light",
      "Material.002": "Eyes_Black",
      "Material.003": "Eyes_White",
    },
  },
  shiba: { group: "farm", file: "ShibaInu", height: 0.62 },
  deer: { group: "wild", file: "Deer", height: 1.45 },
  stag: { group: "wild", file: "Stag", height: 1.95 },
  wolf: { group: "wild", file: "Wolf", height: 0.95 },
  fox: { group: "wild", file: "Fox", height: 0.6 },
};

/** The animations kept: the game's name, the pack's (either spelling), and frames a second. */
const CLIPS = [
  ["idle", ["Idle"], 8],
  ["look", ["Idle_2"], 8],
  ["graze", ["Eating"], 6],
  ["walk", ["Walk"], 15],
  ["gallop", ["Gallop"], 24],
  // The leap, for the ones that are ridden only (each clip adds to the file).
  ["jump", ["Gallop_Jump"], 24, ["horse", "donkey", "husky"]],
];

const b64 = (typed) => Buffer.from(typed.buffer, typed.byteOffset, typed.byteLength).toString("base64");
const round = (value, places = 5) => Math.round(value * 10 ** places) / 10 ** places;

/**
 * Loads one of the pack's files. They carry their buffer inside them as a data URI, which the loader
 * would fetch (it can't, outside a browser): so the file is put together as a binary glTF in memory, its
 * buffer beside its JSON, and parsed from that.
 */
async function load(path) {
  const json = JSON.parse(readFileSync(path, "utf8"));
  if (json.buffers.length !== 1 || !json.buffers[0].uri?.startsWith("data:"))
    throw new Error(`${path}: expected one buffer, inside the file`);
  const bin = Buffer.from(json.buffers[0].uri.slice(json.buffers[0].uri.indexOf(",") + 1), "base64");
  json.buffers[0] = { byteLength: bin.length };
  const pad = (buffer, fill) => Buffer.concat([buffer, Buffer.alloc((4 - (buffer.length % 4)) % 4, fill)]);
  const jsonChunk = pad(Buffer.from(JSON.stringify(json), "utf8"), 0x20);
  const binChunk = pad(bin, 0);
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0); // "glTF"
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(12 + 8 + jsonChunk.length + 8 + binChunk.length, 8);
  const chunk = (data, type) => {
    const head = Buffer.alloc(8);
    head.writeUInt32LE(data.length, 0);
    head.writeUInt32LE(type, 4);
    return Buffer.concat([head, data]);
  };
  const glb = Buffer.concat([header, chunk(jsonChunk, 0x4e4f534a), chunk(binChunk, 0x004e4942)]);
  return new GLTFLoader().parseAsync(glb.buffer.slice(glb.byteOffset, glb.byteOffset + glb.byteLength), "");
}

async function convert(name, { file, height, parts: renamed = {} }, dir) {
  const gltf = await load(join(dir, `${file}.gltf`));
  const scene = gltf.scene;
  scene.updateMatrixWorld(true);
  const meshes = [];
  scene.traverse((object) => object.isSkinnedMesh && meshes.push(object));
  if (!meshes.length) throw new Error(`${file} has no skinned mesh`);
  const skeleton = meshes[0].skeleton;
  const bones = skeleton.bones;
  const at = new Map(bones.map((bone, i) => [bone, i]));

  // The mesh: every part into one, its material's colour on each vertex, in the skeleton's bind space.
  const position = [];
  const normal = [];
  const part = []; // which of `parts` each vertex is
  const parts = []; // [name, r, g, b] (0…255): the pack's materials
  const joints = [];
  const weights = [];
  const index = [];
  for (const mesh of meshes) {
    if (mesh.skeleton !== skeleton && mesh.skeleton.bones.length !== bones.length)
      throw new Error(`${file}: its parts don't share a skeleton`);
    const geometry = mesh.geometry;
    const base = position.length / 3;
    const p = geometry.attributes.position;
    const n = geometry.attributes.normal;
    const j = geometry.attributes.skinIndex;
    const w = geometry.attributes.skinWeight;
    const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    const tint = material.color.clone().convertLinearToSRGB();
    const partName = renamed[material.name] ?? material.name;
    let partAt = parts.findIndex((entry) => entry[0] === partName);
    if (partAt < 0) partAt = parts.push([partName, ...tint.toArray().map((value) => Math.round(value * 255))]) - 1;
    const v = new Vector3();
    for (let i = 0; i < p.count; i++) {
      // Into the bind space the bones' inverses expect (the mesh's own bind matrix).
      v.fromBufferAttribute(p, i).applyMatrix4(mesh.bindMatrix);
      position.push(v.x, v.y, v.z);
      v.fromBufferAttribute(n, i).transformDirection(mesh.bindMatrix);
      normal.push(v.x, v.y, v.z);
      part.push(partAt);
      let total = 0;
      for (let c = 0; c < 4; c++) total += w.getComponent(i, c);
      for (let c = 0; c < 4; c++) {
        joints.push(at.get(mesh.skeleton.bones[j.getComponent(i, c)]) ?? 0);
        weights.push(w.getComponent(i, c) / (total || 1));
      }
    }
    const order = geometry.index ? Array.from(geometry.index.array) : [...Array(p.count).keys()];
    for (const i of order) index.push(base + i);
  }
  // How tall it stands in the pack's units, standing: the scale to metres.
  let top = -Infinity;
  let bottom = Infinity;
  for (let i = 1; i < position.length; i += 3) {
    top = Math.max(top, position[i]);
    bottom = Math.min(bottom, position[i]);
  }
  // (Bind space is the pack's scene as it stands: the mesh's vertices where they are at rest.)
  const scale = height / (top - bottom);

  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < position.length; i++) {
    min[i % 3] = Math.min(min[i % 3], position[i]);
    max[i % 3] = Math.max(max[i % 3], position[i]);
  }
  const count = position.length / 3;
  const packedPosition = new Int16Array(position.length);
  for (let i = 0; i < position.length; i++) {
    const span = max[i % 3] - min[i % 3] || 1;
    packedPosition[i] = Math.round(((position[i] - min[i % 3]) / span) * 65535 - 32768);
  }
  const mesh = {
    count,
    box: [...min, ...max].map((value) => round(value)),
    position: b64(packedPosition),
    normal: b64(new Int8Array(normal.map((value) => Math.round(value * 127)))),
    part: b64(new Uint8Array(part)),
    parts,
    joints: b64(new Uint8Array(joints)),
    weights: b64(new Uint8Array(weights.map((value) => Math.round(value * 255)))),
    index: b64(count > 65535 ? new Uint32Array(index) : new Uint16Array(index)),
    wide: count > 65535,
  };

  // The skeleton: each bone's parent, where it rests, and its inverse bind matrix. A bone whose parent
  // isn't a bone hangs from the root, with everything above it in the scene folded into where it rests.
  const parents = bones.map((bone) => at.get(bone.parent) ?? -1);
  const restOf = (bone, i) => {
    if (parents[i] >= 0) return [bone.position, bone.quaternion, bone.scale];
    const p = new Vector3();
    const q = new Quaternion();
    const s = new Vector3();
    bone.matrixWorld.decompose(p, q, s);
    return [p, q, s];
  };

  // The animations, sampled again: every bone's turn each frame, and its place where that moves.
  const mixer = new AnimationMixer(scene);
  const clips = {};
  for (const [key, names, fps, only] of CLIPS) {
    if (only && !only.includes(name)) continue;
    const clip = gltf.animations.find((entry) => names.includes(entry.name));
    if (!clip) throw new Error(`${file} has no ${names.join(" or ")} animation`);
    const frames = Math.max(2, Math.round(clip.duration * fps) + 1);
    const turns = new Int16Array(frames * bones.length * 4);
    const places = bones.map(() => []);
    mixer.stopAllAction();
    const action = mixer.clipAction(clip);
    action.reset().play();
    for (let frame = 0; frame < frames; frame++) {
      // (Just short of the end, where the mixer is back at the start.)
      mixer.setTime(Math.min((frame / (frames - 1)) * clip.duration, clip.duration - 0.002));
      scene.updateMatrixWorld(true);
      bones.forEach((bone, i) => {
        const [p, q] = restOf(bone, i);
        const turn = q.clone().normalize();
        if (turn.w < 0) turn.set(-turn.x, -turn.y, -turn.z, -turn.w);
        turns.set(
          [turn.x, turn.y, turn.z, turn.w].map((value) => Math.round(value * 32767)),
          (frame * bones.length + i) * 4,
        );
        places[i].push(p.x, p.y, p.z);
      });
    }
    action.stop();
    // Only the bones that are moved about (the hips, mostly) keep their places.
    const moved = {};
    places.forEach((values, i) => {
      let spread = 0;
      for (let c = 0; c < 3; c++) {
        let low = Infinity;
        let high = -Infinity;
        for (let f = c; f < values.length; f += 3) {
          low = Math.min(low, values[f]);
          high = Math.max(high, values[f]);
        }
        spread = Math.max(spread, high - low);
      }
      if (spread * scale > 0.004) moved[i] = values.map((value) => round(value, 4));
    });
    clips[key] = { duration: round(clip.duration, 4), frames, turns: b64(turns), places: moved };
  }
  mixer.stopAllAction();
  scene.updateMatrixWorld(true);

  const animal = {
    scale: round(scale, 6),
    mesh,
    bones: bones.map((bone) => bone.name),
    parents,
    rest: bones.flatMap((bone, i) => {
      const [p, q, s] = restOf(bone, i);
      return [p.x, p.y, p.z, q.x, q.y, q.z, q.w, s.x, s.y, s.z].map((value) => round(value));
    }),
    inverseBind: skeleton.boneInverses.flatMap((matrix) => matrix.toArray().map((value) => round(value, 6))),
    clips,
  };
  return {
    animal,
    info: { triangles: index.length / 3, bones: bones.length, bytes: JSON.stringify(animal).length, height },
  };
}

async function main() {
  const [dir] = process.argv.slice(2);
  if (!dir) throw new Error('Usage: build-wanderworld-animals.mjs "<Ultimate Animated Animals>/glTF"');
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });
  const index = { source: "Ultimate Animated Animals by Quaternius, CC0 1.0", animals: {} };
  const groups = {};
  for (const [name, entry] of Object.entries(ANIMALS)) {
    const { animal, info } = await convert(name, entry, dir);
    (groups[entry.group] ??= {})[name] = animal;
    index.animals[name] = { group: entry.group, ...info };
    console.log(
      `${name.padEnd(12)} ${info.triangles} triangles, ${info.bones} bones, ${(info.bytes / 1024).toFixed(0)} KB`,
    );
  }
  // One file a group: a package may list only so many, and a world has most of a group anyway.
  for (const [group, animals] of Object.entries(groups)) {
    const text = JSON.stringify({ animals });
    writeFileSync(join(OUT, `${group}.json`), text);
    console.log(`${group}.json: ${Object.keys(animals).join(", ")} (${(text.length / 1024).toFixed(0)} KB)`);
  }
  writeFileSync(join(OUT, "index.json"), JSON.stringify(index, null, 2));
  console.log(`wrote ${OUT}`);
}

await main();
