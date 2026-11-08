// Wanderworld's MMD loader, run on a small humanoid PMX written here: standard MMD bone names in an
// A-pose and a box body skinned to them. Checks the model becomes a walking humanoid that stands on the
// ground at a person's height and faces +z. The model has no textures, so no browser is needed.
// Run: node tests/wanderworld-mmd.regression.mjs
import assert from "node:assert/strict";
import { Box3, Vector3 } from "three";
import { loadModelCharacter } from "../packages/wanderworld/src/models.js";

function humanoidPmx() {
  const parts = [];
  const f32 = (...v) => {
    const b = Buffer.alloc(4 * v.length);
    v.forEach((x, i) => b.writeFloatLE(x, i * 4));
    parts.push(b);
  };
  const i32 = (v) => {
    const b = Buffer.alloc(4);
    b.writeInt32LE(v);
    parts.push(b);
  };
  const u16 = (v) => {
    const b = Buffer.alloc(2);
    b.writeUInt16LE(v);
    parts.push(b);
  };
  const i8 = (v) => {
    const b = Buffer.alloc(1);
    b.writeInt8(v);
    parts.push(b);
  };
  const u8 = (v) => parts.push(Buffer.from([v]));
  const text = (s) => {
    const b = Buffer.from(s, "utf16le");
    i32(b.length);
    parts.push(b);
  };
  // [name, absolute position in MMD units (8 cm), parent]
  const bones = [
    ["センター", [0, 8, 0], -1],
    ["上半身", [0, 11, 0], 0],
    ["首", [0, 16.2, 0], 1],
    ["頭", [0, 17.2, 0], 2],
    ["左腕", [1.8, 15.6, 0], 1],
    ["左ひじ", [3.9, 13.8, 0], 4],
    ["左手首", [5.8, 12.2, 0], 5],
    ["右腕", [-1.8, 15.6, 0], 1],
    ["右ひじ", [-3.9, 13.8, 0], 7],
    ["右手首", [-5.8, 12.2, 0], 8],
    ["下半身", [0, 10.6, 0], 0],
    ["左足", [1, 10, 0], 10],
    ["左ひざ", [1, 5.6, 0], 11],
    ["左足首", [1, 1, 0], 12],
    ["右足", [-1, 10, 0], 10],
    ["右ひざ", [-1, 5.6, 0], 14],
    ["右足首", [-1, 1, 0], 15],
  ];
  // One cube per bone, 0.6 units across, centred on the bone and skinned to it.
  const vertices = [];
  const indices = [];
  bones.forEach(([, [x, y, z]], bone) => {
    const base = vertices.length;
    for (const [dx, dy, dz] of [
      [-1, -1, -1],
      [1, -1, -1],
      [1, 1, -1],
      [-1, 1, -1],
      [-1, -1, 1],
      [1, -1, 1],
      [1, 1, 1],
      [-1, 1, 1],
    ]) {
      vertices.push([[x + dx * 0.3, y + dy * 0.3, z + dz * 0.3], bone]);
    }
    for (const [a, b, c] of [
      [0, 1, 2],
      [0, 2, 3],
      [4, 6, 5],
      [4, 7, 6],
      [0, 4, 5],
      [0, 5, 1],
      [3, 2, 6],
      [3, 6, 7],
      [0, 3, 7],
      [0, 7, 4],
      [1, 5, 6],
      [1, 6, 2],
    ]) {
      indices.push(base + a, base + b, base + c);
    }
  });
  parts.push(Buffer.from("PMX "));
  f32(2);
  u8(8);
  [0, 0, 2, 1, 1, 1, 1, 1].forEach(u8);
  text("テスト");
  text("Test");
  text("");
  text("");
  i32(vertices.length);
  for (const [position, bone] of vertices) {
    f32(...position);
    f32(0, 1, 0);
    f32(0, 0);
    u8(0); // BDEF1
    i8(bone);
    f32(1);
  }
  i32(indices.length);
  for (const index of indices) u16(index);
  i32(0); // textures
  i32(1); // materials
  text("体");
  text("");
  f32(1, 0.8, 0.7, 1);
  f32(0, 0, 0);
  f32(5);
  f32(0.3, 0.3, 0.3);
  u8(0x1);
  f32(0, 0, 0, 1);
  f32(1);
  i8(-1);
  i8(-1);
  u8(0);
  u8(1);
  u8(0);
  text("");
  i32(indices.length / 3);
  i32(bones.length);
  for (const [name, position, parent] of bones) {
    text(name);
    text("");
    f32(...position);
    i8(parent);
    i32(0);
    u16(0x0002 | 0x0008 | 0x0010);
    f32(0, 0, 0);
  }
  i32(0); // morphs
  i32(0); // display frames
  i32(0); // rigid bodies
  i32(0); // joints
  return Buffer.concat(parts);
}

const pmx = humanoidPmx();
globalThis.fetch = async () => new Response(pmx);

const character = await loadModelCharacter({
  owner: { type: "persona", id: "test" },
  kind: "mmd",
  data: { file: "mmd/test.pmx", texturePaths: {} },
});
character.update(0.1, 0);
character.object.updateMatrixWorld(true);

let skinned = 0;
character.object.traverse((object) => object.isSkinnedMesh && skinned++);
assert.equal(skinned, 1, "the PMX becomes one skinned mesh");

const size = new Box3().setFromObject(character.object).getSize(new Vector3());
const floor = new Box3().setFromObject(character.object).min.y;
assert.ok(size.y > 1.2 && size.y < 1.8, `MMD units become metres: a person-sized model (got ${size.y.toFixed(2)} m)`);
assert.ok(Math.abs(floor) < 0.05, `the model stands on the ground (lowest point ${floor.toFixed(3)})`);

// Facing +z means the model's left (左) side is on +x, as a VRM's is.
let leftX = 0;
let rightX = 0;
character.object.traverse((object) => {
  if (object.isBone && object.name === "左足") leftX = object.getWorldPosition(new Vector3()).x;
  if (object.isBone && object.name === "右足") rightX = object.getWorldPosition(new Vector3()).x;
});
assert.ok(leftX > rightX, "the model faces +z, its left leg on +x");

// The walk moves the legs: a stride swings them apart.
const before = new Vector3();
let leftKnee = null;
character.object.traverse((object) => {
  if (object.isBone && object.name === "左ひざ") leftKnee = object;
});
leftKnee.getWorldPosition(before);
for (let i = 0; i < 6; i++) character.update(0.1, 2.5);
character.object.updateMatrixWorld(true);
assert.ok(leftKnee.getWorldPosition(new Vector3()).distanceTo(before) > 0.02, "walking moves the knees");
character.dispose();

console.log("wanderworld MMD regression: OK");
