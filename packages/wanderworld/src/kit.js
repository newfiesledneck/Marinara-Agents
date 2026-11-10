// Static models from the kit (kit/<set>/, made from Quaternius's CC0 packs by
// scripts/build-wanderworld-kit.mjs): trees, rocks, plants, props. Each model loads once and its
// geometry and materials are shared by every copy (instanced or not), so they're marked shared and never
// disposed with a world.
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  FrontSide,
  MeshLambertMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  TextureLoader,
} from "three";

const BASE = "/api/capability-packages/wanderworld/assets/kit/";
const files = new Map();
const models = new Map();
const textures = new Map();
const loader = new TextureLoader();

function loadJson(path) {
  if (!files.has(path)) {
    files.set(
      path,
      fetch(`${BASE}${path}`).then((response) => {
        if (!response.ok) throw new Error(`GET kit/${path} → ${response.status}`);
        return response.json();
      }),
    );
  }
  return files.get(path);
}

function texture(set, name) {
  const key = `${set}/${name}`;
  if (!textures.has(key)) {
    const map = loader.load(`${BASE}${set}/${name}.webp`);
    map.flipY = false; // glTF texture coordinates
    map.colorSpace = SRGBColorSpace;
    map.userData.shared = true;
    textures.set(key, map);
  }
  return textures.get(key);
}

const bytes = (base64) => Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
const view = (Type, base64) => {
  const raw = bytes(base64);
  return new Type(raw.buffer, raw.byteOffset, raw.byteLength / Type.BYTES_PER_ELEMENT);
};

/** uint16 values back to floats within their per-axis box. */
function unbox(base64, box, size) {
  const quantized = view(Uint16Array, base64);
  const out = new Float32Array(quantized.length);
  for (let i = 0; i < quantized.length; i++) {
    const axis = i % size;
    out[i] = box[axis] + (quantized[i] / 65535) * (box[axis + size] - box[axis]);
  }
  return out;
}

function part(set, mesh) {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(unbox(mesh.position, mesh.box, 3), 3));
  geometry.setAttribute(
    "normal",
    new BufferAttribute(
      Float32Array.from(view(Int8Array, mesh.normal), (v) => v / 127),
      3,
    ),
  );
  geometry.setAttribute("uv", new BufferAttribute(unbox(mesh.uv, mesh.uvBox, 2), 2));
  if (mesh.colours) geometry.setAttribute("color", new BufferAttribute(view(Uint8Array, mesh.colours), 3, true));
  geometry.setIndex(new BufferAttribute(mesh.wide ? view(Uint32Array, mesh.index) : view(Uint16Array, mesh.index), 1));
  geometry.computeBoundingSphere();
  geometry.userData.shared = true;
  const material = new MeshLambertMaterial({
    map: mesh.texture ? texture(set, mesh.texture) : null,
    color: mesh.colour ? new Color(...mesh.colour) : 0xffffff,
    vertexColors: !!mesh.colours,
    alphaTest: mesh.cutout ? 0.5 : 0,
    side: mesh.cutout || mesh.doubleSided ? DoubleSide : FrontSide,
  });
  material.userData.shared = true;
  // `texture` names the part's texture ("" for none), for tinting some parts of a model and not others.
  return { geometry, material, texture: mesh.texture ?? "" };
}

/** A kit texture for tiling across the ground (its own copy, repeating; the image is shared). */
export function kitTexture(set, name) {
  const map = texture(set, name).clone();
  map.wrapS = map.wrapT = RepeatWrapping;
  return map;
}

/** A kit model as its parts ([{ geometry, material, texture }]), loaded once. Rejects if it can't be loaded. */
export function kitModel(set, name) {
  const key = `${set}/${name}`;
  if (!models.has(key)) {
    models.set(
      key,
      loadJson(`${set}/${name}.json`).then((data) => data.meshes.map((mesh) => part(set, mesh))),
    );
  }
  return models.get(key);
}

/** Several models of a set at once, as a Map from name to parts. */
export async function kitModels(set, names) {
  const loaded = await Promise.all(names.map((name) => kitModel(set, name)));
  return new Map(names.map((name, i) => [name, loaded[i]]));
}
