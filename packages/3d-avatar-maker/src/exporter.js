// Saving an avatar as a file, and reading one back.
//
// A plain .glb (binary glTF) with everything inside it: the skeleton under its own bone names (the Unreal
// mannequin's, which the Engine's 3D Avatars agent recognises), each mesh with only the vertices it draws,
// standard materials, and the pictures. The look the avatar was made from is stored in the file too
// (`extras.avatarMaker`), so the maker can open the file again and carry on editing.
//
// three's GLTFExporter does the writing. Before it runs, each mesh is given a slimmed copy of its geometry
// and standard materials; afterwards the figure is put back as it was.
import {
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  FrontSide,
  MeshStandardMaterial,
  Uint16BufferAttribute,
  Uint32BufferAttribute,
} from "three";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { restPose } from "./figure.js";
import { texturesReady } from "./kitfiles.js";
import { PACK_PIECES } from "./looks.js";

export const FILE_FORMAT = 1;
export const GENERATOR = "3D Avatar Maker (Marinara Engine)";
const KIT_NOTE =
  "Body, hair, skin and clothing: MakeHuman base mesh and system assets (CC0 1.0), and parts made in Blender by ThatOneCan (CC0 1.0).";
/** What travels with every exported file. The kit is CC0, so the file asks nothing of whoever gets it. */
export const LICENCE_NOTE = `${KIT_NOTE} No credit required.`;
/** The file's licence note for a look: the kit's, and the credit each CC-BY piece from a wardrobe pack asks for. */
export function licenceNote(look) {
  const credits = [...new Set((look?.clothes ?? []).map((piece) => PACK_PIECES[piece]?.credit).filter(Boolean))];
  return credits.length ? `${KIT_NOTE} Clothing from wardrobe packs: ${credits.join("; ")}` : LICENCE_NOTE;
}

const GLB_MAGIC = 0x46546c67; // "glTF"
const CHUNK_JSON = 0x4e4f534a;
const CHUNK_BIN = 0x004e4942;

/** A .glb's two parts: { json (parsed), bin (Uint8Array, or null) }. Throws on anything that isn't a GLB 2.0. */
export function readGlb(buffer) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const data = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes.byteLength < 20 || data.getUint32(0, true) !== GLB_MAGIC || data.getUint32(4, true) !== 2)
    throw new Error("This isn't a .glb file.");
  let json = null;
  let bin = null;
  for (let at = 12; at + 8 <= bytes.byteLength;) {
    const length = data.getUint32(at, true);
    const type = data.getUint32(at + 4, true);
    const chunk = bytes.subarray(at + 8, at + 8 + length);
    if (type === CHUNK_JSON && !json) json = JSON.parse(new TextDecoder().decode(chunk));
    else if (type === CHUNK_BIN && !bin) bin = chunk;
    at += 8 + length;
  }
  if (!json) throw new Error("This .glb file has no description in it.");
  return { json, bin };
}

/** A .glb from its two parts (each padded to four bytes, as the format asks). */
export function writeGlb(json, bin = null) {
  const pad = (bytes, fill) => {
    const padded = new Uint8Array(Math.ceil(bytes.byteLength / 4) * 4).fill(fill);
    padded.set(bytes);
    return padded;
  };
  const jsonBytes = pad(new TextEncoder().encode(JSON.stringify(json)), 0x20);
  const binBytes = bin ? pad(bin, 0) : null;
  const total = 12 + 8 + jsonBytes.byteLength + (binBytes ? 8 + binBytes.byteLength : 0);
  const out = new Uint8Array(total);
  const data = new DataView(out.buffer);
  data.setUint32(0, GLB_MAGIC, true);
  data.setUint32(4, 2, true);
  data.setUint32(8, total, true);
  data.setUint32(12, jsonBytes.byteLength, true);
  data.setUint32(16, CHUNK_JSON, true);
  out.set(jsonBytes, 20);
  if (binBytes) {
    const at = 20 + jsonBytes.byteLength;
    data.setUint32(at, binBytes.byteLength, true);
    data.setUint32(at + 4, CHUNK_BIN, true);
    out.set(binBytes, at + 8);
  }
  return out;
}

/**
 * A geometry with only the vertices its drawn triangles use. `ranges` are the parts of the index that are
 * drawn: [{ start, count, materialIndex }]. Returns { geometry, vertices, triangles }.
 */
export function slimGeometry(geometry, ranges) {
  const index = geometry.index.array;
  const remap = new Int32Array(geometry.attributes.position.count).fill(-1);
  const drawn = [];
  const groups = [];
  let next = 0;
  for (const range of ranges) {
    const start = drawn.length;
    for (let i = range.start; i < range.start + range.count; i++) {
      const vertex = index[i];
      if (remap[vertex] < 0) remap[vertex] = next++;
      drawn.push(remap[vertex]);
    }
    if (drawn.length > start) groups.push({ start, count: drawn.length - start, materialIndex: range.materialIndex });
  }
  const slim = new BufferGeometry();
  for (const [name, attribute] of Object.entries(geometry.attributes)) {
    const size = attribute.itemSize;
    const array = new attribute.array.constructor(next * size);
    for (let vertex = 0; vertex < remap.length; vertex++) {
      const to = remap[vertex];
      if (to < 0) continue;
      for (let c = 0; c < size; c++) array[to * size + c] = attribute.array[vertex * size + c];
    }
    // (glTF wants normals of length one; the kit's come back from single bytes a little off it.)
    if (name === "normal")
      for (let at = 0; at < array.length; at += 3) {
        const length = Math.hypot(array[at], array[at + 1], array[at + 2]) || 1;
        array[at] /= length;
        array[at + 1] /= length;
        array[at + 2] /= length;
      }
    slim.setAttribute(name, new BufferAttribute(array, size, attribute.normalized));
  }
  slim.setIndex(next > 65535 ? new Uint32BufferAttribute(drawn, 1) : new Uint16BufferAttribute(drawn, 1));
  for (const group of groups) slim.addGroup(group.start, group.count, group.materialIndex);
  return { geometry: slim, vertices: next, triangles: drawn.length / 3 };
}

/** The maker's material as a standard one (what glTF holds), named for its part. */
function standardMaterial(material, name) {
  const cutOut = material.alphaTest >= 0.5;
  return new MeshStandardMaterial({
    name,
    map: material.map ?? null,
    color: material.color,
    vertexColors: material.vertexColors,
    roughness: 0.9,
    metalness: 0,
    side: material.side === DoubleSide ? DoubleSide : FrontSide,
    // glTF has two kinds of see-through: cut out by the picture's alpha (MASK), or blended (BLEND).
    alphaTest: cutOut ? material.alphaTest : 0,
    transparent: !cutOut && material.transparent,
    depthWrite: cutOut || !material.transparent,
  });
}

/**
 * The figure as a .glb: { bytes (Uint8Array), vertices, triangles }. `look` and `name` are stored in the
 * file so it can be opened again. `maxTextureSize` shrinks the pictures (2048 keeps them as they are).
 */
export async function exportGlb(figure, { look = {}, name = "", maxTextureSize = 2048 } = {}) {
  await texturesReady();
  restPose(figure);
  const swapped = [];
  const made = [];
  const mimeTypes = new Map(); // a picture's type while exporting: JPEG unless something see-through uses it
  let vertices = 0;
  let triangles = 0;
  try {
    figure.meshes.forEach((mesh, at) => {
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const ranges = Array.isArray(mesh.material)
        ? mesh.geometry.groups.map(({ start, count, materialIndex }) => ({ start, count, materialIndex }))
        : [{ start: 0, count: mesh.geometry.index.count, materialIndex: 0 }];
      const slim = slimGeometry(mesh.geometry, ranges);
      vertices += slim.vertices;
      triangles += slim.triangles;
      const standard = materials.map((material, i) => {
        const converted = standardMaterial(material, `${mesh.name || "part"}-${at}-${i}`);
        if (converted.map) {
          const clear = converted.transparent || converted.alphaTest > 0;
          mimeTypes.set(
            converted.map,
            clear || mimeTypes.get(converted.map) === "image/png" ? "image/png" : "image/jpeg",
          );
        }
        return converted;
      });
      // (A part coloured by its material alone has no use for the colours a shared geometry carries.)
      if (!standard.some((material) => material.vertexColors)) slim.geometry.deleteAttribute("color");
      swapped.push({ mesh, geometry: mesh.geometry, material: mesh.material });
      made.push(slim.geometry, ...standard);
      mesh.geometry = slim.geometry;
      mesh.material = Array.isArray(mesh.material) ? standard : standard[0];
    });
    const before = new Map([...mimeTypes.keys()].map((map) => [map, map.userData.mimeType]));
    for (const [map, type] of mimeTypes) map.userData.mimeType = type;
    let glb;
    try {
      glb = await new GLTFExporter().parseAsync(figure.object, { binary: true, maxTextureSize });
    } finally {
      for (const [map, type] of before) {
        if (type === undefined) delete map.userData.mimeType;
        else map.userData.mimeType = type;
      }
    }
    const { json, bin } = readGlb(glb);
    json.asset = { ...json.asset, generator: GENERATOR, copyright: licenceNote(look) };
    json.extras = { ...json.extras, avatarMaker: { format: FILE_FORMAT, name: String(name ?? ""), look } };
    return { bytes: writeGlb(json, bin), vertices, triangles };
  } finally {
    for (const { mesh, geometry, material } of swapped) {
      mesh.geometry = geometry;
      mesh.material = material;
    }
    for (const item of made) item.dispose();
  }
}

/** The look stored in a .glb the maker saved: { name, look }, or null for any other file. */
export function lookInGlb(buffer) {
  try {
    const stored = readGlb(buffer).json.extras?.avatarMaker;
    return stored && typeof stored.look === "object" && stored.look
      ? { name: String(stored.name ?? ""), look: stored.look }
      : null;
  } catch {
    return null;
  }
}
