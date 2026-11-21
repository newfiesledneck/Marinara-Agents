// Static models from the kit (made from Quaternius's CC0 packs by scripts/build-wanderworld-kit.mjs):
// trees, rocks, plants, props, building pieces. The kit is kept by setting: kit/generic/ is what any
// world has (nature, people's bodies, the painted art), kit/fantasy/ the medieval one's buildings, props
// and outfits, kit/creatures/ the animals; a modern or a sci-fi setting would be a folder beside them. A
// set's models are one file (models.json), fetched the first time one of them is wanted. Each model loads once and its
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
  Vector3,
} from "three";

const BASE = "/api/capability-packages/wanderworld/assets/kit/";

// ── Distant versions ─────────────────────────────────────────────────────────
// The Blender-made creatures and the built-in bodies carry a second, smaller list of triangles over the
// same vertices (scripts/build-wanderworld-people.mjs), drawn past the camera distance Settings → Display
// → "Creature detail distance" says. It's the same mesh with the same skin, so it moves as it always does.

/** CREATURE_DETAIL's metres for each choice (settings.js): "full" draws everything in full, always. */
export const DETAIL_DISTANCES = { near: 20, normal: 35, far: 60, full: Infinity };
let detailFar = DETAIL_DISTANCES.normal;
/** Sets how far off, in metres from the camera, a creature or person is drawn in its distant version. */
export function setDetailDistance(metres) {
  detailFar = Number.isFinite(metres) || metres === Infinity ? metres : DETAIL_DISTANCES.normal;
}

/**
 * Puts a mesh's distant version (`far`: indices into its own vertices) after its full index, in one index
 * buffer, so a mesh drawing it can pick either by its draw range (drawDistant). Once a geometry.
 */
export function addDistant(geometry, far) {
  const full = geometry.index;
  if (!full || !far?.length || geometry.userData.distant) return;
  const both = new full.array.constructor(full.count + far.length);
  both.set(full.array);
  both.set(far, full.count);
  geometry.setIndex(new BufferAttribute(both, 1));
  geometry.userData.distant = { full: { start: 0, count: full.count }, far: { start: full.count, count: far.length } };
  geometry.setDrawRange(0, full.count);
}

const seen = new Vector3();
/** Whether `object` is further from `camera` than the distant versions start. */
export const isDistant = (object, camera) =>
  seen.setFromMatrixPosition(object.matrixWorld).distanceToSquared(camera.position) > detailFar * detailFar;

/**
 * Draws `mesh` in its distant version while it's far off: its geometry's (addDistant), or for a geometry
 * in parts, each group's (`group.distant`: { full, far }, each { start, count }). Set each time it's drawn,
 * so meshes sharing one geometry each draw their own.
 */
export function drawDistant(mesh) {
  if (!mesh.geometry?.userData.distant) return;
  mesh.onBeforeRender = (renderer, scene, camera, geometry, material, group) => {
    const lod = group?.distant ?? geometry.userData.distant;
    const range = isDistant(mesh, camera) ? lod.far : lod.full;
    if (group?.distant) Object.assign(group, range);
    else if (lod.full) geometry.setDrawRange(range.start, range.count);
  };
}
/** Where each set is in the kit. */
export const KIT_DIRS = {
  nature: "generic/nature",
  art: "generic/art",
  village: "fantasy/village",
  props: "fantasy/props",
  tools: "fantasy/tools",
  market: "fantasy/market",
  dungeon: "fantasy/dungeon",
};
/** The address of a set's folder, for what's fetched by name (the menu's art, a sign's board). */
export const kitUrl = (set) => `${BASE}${KIT_DIRS[set]}/`;
const files = new Map();
const models = new Map();
const textures = new Map();
const loader = new TextureLoader();

function loadJson(path) {
  if (!files.has(path)) {
    files.set(
      path,
      fetch(`${BASE}${path}`)
        .then((response) => {
          if (!response.ok) throw new Error(`GET kit/${path} → ${response.status}`);
          return response.json();
        })
        .catch((error) => forget(files, path, error)),
    );
  }
  return files.get(path);
}

/** A load that failed is let go, so the next ask tries again (a dropped connection isn't for good). */
export function forget(cache, key, error) {
  cache.delete(key);
  throw error;
}

function texture(set, name) {
  const key = `${set}/${name}`;
  if (!textures.has(key)) {
    const map = loader.load(`${kitUrl(set)}${name}.webp`);
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
  map.userData.shared = false; // (the copy is the world's own, let go with it; the picture stays shared)
  map.wrapS = map.wrapT = RepeatWrapping;
  return map;
}

/** A kit model as its parts ([{ geometry, material, texture }]), loaded once. Rejects if it can't be loaded. */
export function kitModel(set, name) {
  const key = `${set}/${name}`;
  if (!models.has(key)) {
    models.set(
      key,
      loadJson(`${KIT_DIRS[set]}/models.json`)
        .then((file) => {
          const data = file.models?.[name];
          if (!data) throw new Error(`kit/${KIT_DIRS[set]}/models.json has no ${name}`);
          return data.meshes.map((mesh) => part(set, mesh));
        })
        .catch((error) => forget(models, key, error)),
    );
  }
  return models.get(key);
}

/** Several models of a set at once, as a Map from name to parts. */
export async function kitModels(set, names) {
  const loaded = await Promise.all(names.map((name) => kitModel(set, name)));
  return new Map(names.map((name, i) => [name, loaded[i]]));
}
