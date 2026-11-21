// Wanderworld's packed kit files (scripts/wanderworld-packed.mjs writes them, src/packed.js reads them):
// every array comes back byte for byte, plain JSON kit files still load, each file in the kit is a
// well-formed PNG that unpacks, and the biggest one unpacks quickly.
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { crc32 } from "node:zlib";
import { filter, MESH_KINDS, pack } from "../scripts/wanderworld-packed.mjs";
import { arrayOf, bytesOf, unfilter, unpack } from "../packages/wanderworld/src/packed.js";

const b64 = (typed) => Buffer.from(typed.buffer, typed.byteOffset, typed.byteLength).toString("base64");
const random = (() => {
  let seed = 7;
  return () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
})();

// The filter undoes itself, for each element size and number of components, wrapping included.
for (const [Type, comps] of [
  [Uint8Array, 4],
  [Int8Array, 3],
  [Int16Array, 3],
  [Uint16Array, 2],
  [Uint32Array, 1],
  [Int16Array, 4 * 23],
]) {
  const values = Type.from({ length: comps * 50 }, () => Math.floor(random() * 2 ** (8 * Type.BYTES_PER_ELEMENT)));
  const bytes = new Uint8Array(values.buffer);
  const back = unfilter(filter(bytes, Type.BYTES_PER_ELEMENT, comps), Type.BYTES_PER_ELEMENT, comps);
  assert.deepEqual(new Type(back.buffer), values, `${Type.name} × ${comps} filters and back`);
}

// A document packed and unpacked: its arrays as bytes of their own, everything else as it was.
{
  const position = Int16Array.from({ length: 300 }, (_, i) => Math.round(Math.sin(i) * 30000));
  const index = Uint32Array.from({ length: 99 }, (_, i) => i * 70000);
  const odd = new Uint8Array([1, 2, 3, 4, 5]); // (not a whole number of its elements: kept as it is)
  const document = {
    name: "test",
    part: "skin", // (not an array: `part` isn't a kind here)
    meshes: [
      { count: 100, wide: true, position: b64(position), index: b64(index), uv: b64(odd), normal: "", box: [1, 2] },
      { morphs: { thin: { ids: b64(new Uint16Array([3, 1, 2])), d: [0.1, 0.2, 0.3] } } },
    ],
    pictures: [{ name: "a", webp: b64(new Uint8Array([82, 73, 70, 70])) }],
  };
  const back = await unpack(pack(document, MESH_KINDS));
  assert.equal(back.name, "test");
  assert.equal(back.part, "skin");
  assert.deepEqual(back.meshes[0].box, [1, 2]);
  assert.equal(back.meshes[0].normal, "", "an empty array stays empty");
  assert.deepEqual(arrayOf(Int16Array, back.meshes[0].position), position);
  assert.deepEqual(arrayOf(Uint32Array, back.meshes[0].index), index, "a wide index (uint32)");
  assert.deepEqual([...back.meshes[0].uv], [...odd]);
  assert.deepEqual([...arrayOf(Uint16Array, back.meshes[1].morphs.thin.ids)], [3, 1, 2]);
  assert.deepEqual([...back.pictures[0].webp], [82, 73, 70, 70]);
  // A plain JSON file (base64 arrays) still loads, and its arrays read the same way.
  const plain = await unpack(Buffer.from(JSON.stringify(document)));
  assert.deepEqual(arrayOf(Int16Array, plain.meshes[0].position), position);
  assert.deepEqual(bytesOf(plain.meshes[0].uv), odd);
}

// Every packed file in the kit: a PNG with good chunks (what the Engine keeps of a picture), that unpacks.
{
  const kit = new URL("../packages/wanderworld/kit/", import.meta.url);
  const found = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true }))
      if (entry.isDirectory()) walk(join(dir, entry.name));
      else if (entry.name.endsWith(".pack.png")) found.push(join(dir, entry.name));
  };
  walk(fileURLToPath(kit));
  assert.ok(found.length >= 15, `the kit's packed files (${found.length})`);
  let biggest = { bytes: 0 };
  for (const path of found) {
    const file = readFileSync(path);
    assert.equal(file.subarray(0, 8).toString("hex"), "89504e470d0a1a0a", `${path} is a PNG`);
    const types = [];
    for (let at = 8; at < file.length;) {
      const length = file.readUInt32BE(at);
      types.push(file.toString("latin1", at + 4, at + 8));
      assert.equal(file.readUInt32BE(at + 8 + length), crc32(file.subarray(at + 4, at + 8 + length)), `${path} CRC`);
      at += 12 + length;
    }
    assert.deepEqual(types, ["IHDR", "IDAT", "IEND"], `${path}'s chunks`);
    const document = await unpack(file);
    assert.ok(document && typeof document === "object", `${path} unpacks`);
    if (file.length > biggest.bytes) biggest = { path, bytes: file.length, file };
  }
  const start = performance.now();
  await unpack(biggest.file);
  const took = performance.now() - start;
  console.log(
    `unpacked the biggest, ${biggest.path} (${(biggest.bytes / 1e6).toFixed(1)} MB), in ${took.toFixed(0)} ms`,
  );
  assert.ok(took < 2000, "the biggest file unpacks in well under two seconds");
}

console.log("wanderworld packed kit files: OK");
