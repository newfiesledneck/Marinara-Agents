// Saving an avatar as a file, and reading one back.
//
// A plain .glb (binary glTF) with everything inside it: the skeleton under its own bone names (the Unreal
// mannequin's, which the Engine's 3D Avatars agent recognises), each mesh with only the vertices it draws,
// standard materials, and the pictures. The look the avatar was made from is stored in the file too
// (`extras.avatarMaker`), so the maker can open the file again and carry on editing.
//
// three's GLTFExporter does the writing. Before it runs, each mesh is given a slimmed copy of its geometry
// and standard materials; afterwards the figure is put back as it was.
//
// A .vrm (VRM 1.0) is the same file with three changes: the figure rests in a T-pose, as VRM asks, with that
// pose made the meshes' own (their points moved there and the bones bound there, so a tool that reads the
// bind pose sees a T-pose too); a `VRMC_vrm` block names the humanoid bones and holds the author's terms;
// and the hair's locks and a tail, when worn, swing on spring bones (`VRMC_springBone`, springs.js).
import {
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  FrontSide,
  Matrix4,
  MeshStandardMaterial,
  Uint16BufferAttribute,
  Uint32BufferAttribute,
  Vector3,
} from "three";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { FACE_MOVES } from "./face.js";
import { restPose, tPose } from "./figure.js";
import { HUMANOID_BONES, texturesReady } from "./kitfiles.js";
import { packCredits } from "./looks.js";

export const FILE_FORMAT = 1;
export const GENERATOR = "3D Avatar Maker (Marinara Engine)";
const KIT_NOTE =
  "Body, hair, skin and clothing: MakeHuman base mesh and system assets (CC0 1.0), and parts made in Blender by ThatOneCan (CC0 1.0).";
/** What travels with every exported file. The kit is CC0, so the file asks nothing of whoever gets it. */
export const LICENCE_NOTE = `${KIT_NOTE} No credit required.`;
/**
 * The file's licence note for a look: the kit's, and the credit each CC-BY piece and hair style from a
 * wardrobe pack asks for.
 */
export function licenceNote(look) {
  const credits = packCredits(look);
  return credits.length ? `${KIT_NOTE} From wardrobe packs: ${credits.join("; ")}` : LICENCE_NOTE;
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
  const slimmed = (attribute) => {
    const size = attribute.itemSize;
    const array = new attribute.array.constructor(next * size);
    for (let vertex = 0; vertex < remap.length; vertex++) {
      const to = remap[vertex];
      if (to < 0) continue;
      for (let c = 0; c < size; c++) array[to * size + c] = attribute.array[vertex * size + c];
    }
    const out = new BufferAttribute(array, size, attribute.normalized);
    out.name = attribute.name;
    return out;
  };
  const slim = new BufferGeometry();
  for (const [name, attribute] of Object.entries(geometry.attributes)) {
    const out = slimmed(attribute);
    // (glTF wants normals of length one; the kit's come back from single bytes a little off it.)
    if (name === "normal")
      for (let at = 0; at < out.array.length; at += 3) {
        const length = Math.hypot(out.array[at], out.array[at + 1], out.array[at + 2]) || 1;
        out.array[at] /= length;
        out.array[at + 1] /= length;
        out.array[at + 2] /= length;
      }
    slim.setAttribute(name, out);
  }
  // (The face's moves, slimmed the same way: face.js.)
  for (const [name, list] of Object.entries(geometry.morphAttributes)) slim.morphAttributes[name] = list.map(slimmed);
  slim.morphTargetsRelative = geometry.morphTargetsRelative;
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
 * `geometry` (a slimmed copy of `mesh`'s) moved, in world space, to where three draws it in the pose its
 * bones are in now: each point by its bones' blend of (mesh world · bind⁻¹ · bone world · bone inverse ·
 * bind). Normals and the face's moves (morph targets) turn with it.
 */
function bakePose(geometry, mesh) {
  const { bones, boneInverses } = mesh.skeleton;
  const placed = mesh.matrixWorld.clone().multiply(mesh.bindMatrixInverse);
  const moves = bones.map((bone, i) =>
    new Matrix4().multiplyMatrices(bone.matrixWorld, boneInverses[i]).premultiply(placed).multiply(mesh.bindMatrix),
  );
  const { position, normal, skinIndex, skinWeight } = geometry.attributes;
  const points = new Float32Array(position.count * 3);
  const normals = normal ? new Float32Array(normal.count * 3) : null;
  const blend = new Float32Array(16);
  const targets = geometry.morphAttributes.position ?? [];
  const turned = targets.map((target) => new Float32Array(target.array.length));
  for (let v = 0; v < position.count; v++) {
    blend.fill(0);
    for (let k = 0; k < 4; k++) {
      const weight = skinWeight.getComponent(v, k);
      if (!weight) continue;
      const bone = skinIndex.getComponent(v, k);
      const e = moves[bone].elements;
      for (let c = 0; c < 16; c++) blend[c] += weight * e[c];
    }
    const [x, y, z] = [position.getX(v), position.getY(v), position.getZ(v)];
    points[v * 3] = blend[0] * x + blend[4] * y + blend[8] * z + blend[12];
    points[v * 3 + 1] = blend[1] * x + blend[5] * y + blend[9] * z + blend[13];
    points[v * 3 + 2] = blend[2] * x + blend[6] * y + blend[10] * z + blend[14];
    targets.forEach((target, t) => {
      const [dx, dy, dz] = [target.getX(v), target.getY(v), target.getZ(v)];
      turned[t][v * 3] = blend[0] * dx + blend[4] * dy + blend[8] * dz;
      turned[t][v * 3 + 1] = blend[1] * dx + blend[5] * dy + blend[9] * dz;
      turned[t][v * 3 + 2] = blend[2] * dx + blend[6] * dy + blend[10] * dz;
    });
    if (!normals) continue;
    const [a, b, c] = [normal.getX(v), normal.getY(v), normal.getZ(v)];
    const nx = blend[0] * a + blend[4] * b + blend[8] * c;
    const ny = blend[1] * a + blend[5] * b + blend[9] * c;
    const nz = blend[2] * a + blend[6] * b + blend[10] * c;
    const length = Math.hypot(nx, ny, nz) || 1;
    normals.set([nx / length, ny / length, nz / length], v * 3);
  }
  geometry.setAttribute("position", new BufferAttribute(points, 3));
  if (normals) geometry.setAttribute("normal", new BufferAttribute(normals, 3));
  if (targets.length)
    geometry.morphAttributes.position = targets.map((target, t) => {
      const out = new BufferAttribute(turned[t], 3);
      out.name = target.name;
      return out;
    });
}

/** The licence VRM 1.0 files point to; the author's terms are the fields beside it. */
export const VRM_LICENSE_URL = "https://vrm.dev/licenses/1.0/";
/** The choices the Save tab offers for a VRM's terms (the VRM 1.0 meta fields), the first of each the usual. */
export const VRM_TERM_CHOICES = {
  avatarPermission: ["onlyAuthor", "onlySeparatelyLicensedPerson", "everyone"],
  commercialUsage: ["personalNonProfit", "personalProfit", "corporation"],
  // (One choice in the maker for two fields: allowRedistribution and modification.)
  sharing: ["none", "share", "change", "changeAndShare"],
  creditNotation: ["required", "unnecessary"],
};
const ALLOW_FLAGS = [
  "allowExcessivelyViolentUsage",
  "allowExcessivelySexualUsage",
  "allowPoliticalOrReligiousUsage",
  "allowAntisocialOrHateUsage",
];
/** Terms as the maker keeps them, every field known and valid: VRM's own defaults, the most careful, unless chosen. */
export function vrmTerms(terms = {}) {
  const checked = {};
  for (const [field, choices] of Object.entries(VRM_TERM_CHOICES))
    checked[field] = choices.includes(terms?.[field]) ? terms[field] : choices[0];
  for (const flag of ALLOW_FLAGS) checked[flag] = terms?.[flag] === true;
  checked.author = typeof terms?.author === "string" ? terms.author.trim().slice(0, 120) : "";
  return checked;
}

/** The VRM 1.0 `meta` for an avatar: its name, author and terms, and the credits of what it wears. */
export function vrmMeta(name, look, terms) {
  const chosen = vrmTerms(terms);
  const credited = licenceNote(look) !== LICENCE_NOTE;
  return {
    name: String(name ?? "").trim() || "Avatar",
    version: "1",
    authors: [chosen.author || "Unknown"],
    licenseUrl: VRM_LICENSE_URL,
    avatarPermission: chosen.avatarPermission,
    commercialUsage: chosen.commercialUsage,
    allowRedistribution: chosen.sharing === "share" || chosen.sharing === "changeAndShare",
    modification:
      { change: "allowModification", changeAndShare: "allowModificationRedistribution" }[chosen.sharing] ??
      "prohibited",
    // (A CC BY piece's maker must be credited wherever the avatar goes, whatever its author asks for themselves.)
    creditNotation: credited ? "required" : chosen.creditNotation,
    ...Object.fromEntries(ALLOW_FLAGS.map((flag) => [flag, chosen[flag]])),
    thirdPartyLicenses: licenceNote(look),
  };
}

const FEELINGS = new Set(["happy", "angry", "sad", "relaxed", "surprised"]);
/** How far a VRM's eyes turn (degrees): as far as the maker's preview turns them (face.js). */
const LOOK_RANGE = { sideways: 20, up: 11, down: 14 };

/** The `VRMC_vrm` (and, with hair that hangs or a tail, `VRMC_springBone`) blocks added to an exported file's description. */
function addVrm(json, figure, meta) {
  const nodeOf = new Map();
  for (const skin of json.skins ?? [])
    for (const index of skin.joints) if (!nodeOf.has(json.nodes[index].name)) nodeOf.set(json.nodes[index].name, index);
  const humanBones = {};
  for (const [bone, joint] of Object.entries(HUMANOID_BONES))
    if (nodeOf.has(joint)) humanBones[bone] = { node: nodeOf.get(joint) };
  const block = { specVersion: "1.0", meta, humanoid: { humanBones } };
  // The face (face.js): each of VRM's expressions bound to the morph target of its name on every mesh that has
  // one. A feeling eases a blink off while it's shown, as its own eyes are already narrowed or wide.
  const preset = {};
  json.nodes.forEach((node, index) => {
    const names = node.mesh === undefined ? null : json.meshes[node.mesh].extras?.targetNames;
    names?.forEach((name, at) => {
      if (!FACE_MOVES.includes(name)) return;
      preset[name] ??= {
        morphTargetBinds: [],
        isBinary: false,
        ...(FEELINGS.has(name) ? { overrideBlink: "blend" } : {}),
      };
      preset[name].morphTargetBinds.push({ node: index, index: at, weight: 1 });
    });
  });
  if (Object.keys(preset).length) block.expressions = { preset };
  // The eyes turn on their bones to look (as far as LOOK_RANGE), from between them.
  const [left, right] = [figure.bones.get("eye_l"), figure.bones.get("eye_r")];
  if (humanBones.leftEye && humanBones.rightEye && left && right && figure.humanoid.head) {
    const between = left.getWorldPosition(new Vector3()).add(right.getWorldPosition(new Vector3())).multiplyScalar(0.5);
    const offset = figure.humanoid.head.worldToLocal(between);
    const range = (degrees) => ({ inputMaxValue: 90, outputScale: degrees });
    block.lookAt = {
      type: "bone",
      offsetFromHeadBone: offset.toArray().map((value) => Math.round(value * 1e5) / 1e5),
      rangeMapHorizontalInner: range(LOOK_RANGE.sideways),
      rangeMapHorizontalOuter: range(LOOK_RANGE.sideways),
      rangeMapVerticalDown: range(LOOK_RANGE.down),
      rangeMapVerticalUp: range(LOOK_RANGE.up),
    };
  }
  json.extensions = { ...json.extensions, VRMC_vrm: block };
  const extensions = new Set(json.extensionsUsed ?? []).add("VRMC_vrm");
  // The springs (springs.js): the hair's chains and a tail, each with the colliders it meets, as fitted.
  const springs = (figure.springs ?? [])
    .map((spring) => ({ ...spring, bones: spring.bones.filter((bone) => nodeOf.has(bone.name)) }))
    .filter((spring) => spring.bones.length > 1);
  if (springs.length) {
    const round = (value) => Math.round(value * 1e5) / 1e5;
    const shapes = [...new Set(springs.flatMap((spring) => spring.colliders))].filter((collider) =>
      nodeOf.has(collider.bone.name),
    );
    const colliders = shapes.map(({ bone, radius, offset, tail }) => {
      const shape = { offset: offset.toArray().map(round), radius: round(radius) };
      return {
        node: nodeOf.get(bone.name),
        shape: tail ? { capsule: { ...shape, tail: tail.toArray().map(round) } } : { sphere: shape },
      };
    });
    // (A group for each set of colliders a spring meets.)
    const colliderGroups = [];
    const groupOf = new Map();
    const springList = springs.map(({ name, bones, joint, colliders: met }) => {
      const members = met.map((collider) => shapes.indexOf(collider)).filter((at) => at >= 0);
      const key = members.join();
      if (members.length && !groupOf.has(key)) {
        groupOf.set(key, colliderGroups.length);
        colliderGroups.push({ name: `Colliders for ${name}`, colliders: members });
      }
      return {
        name,
        joints: bones.map((bone) => ({ node: nodeOf.get(bone.name), ...joint })),
        ...(members.length ? { colliderGroups: [groupOf.get(key)] } : {}),
      };
    });
    json.extensions.VRMC_springBone = { specVersion: "1.0", colliders, colliderGroups, springs: springList };
    extensions.add("VRMC_springBone");
  }
  json.extensionsUsed = [...extensions];
}

/**
 * The figure as a .glb: { bytes (Uint8Array), vertices, triangles }. `look` and `name` are stored in the
 * file so it can be opened again. `maxTextureSize` shrinks the pictures (2048 keeps them as they are).
 */
export function exportGlb(figure, options = {}) {
  return exportFile(figure, options, null);
}

/**
 * The figure as a VRM 1.0 .vrm, the same way: { bytes, vertices, triangles }. `terms` are the author's
 * (vrmTerms); the file rests in a T-pose.
 */
export function exportVrm(figure, { terms, ...options } = {}) {
  return exportFile(figure, options, terms ?? {});
}

async function exportFile(figure, { look = {}, name = "", maxTextureSize = 2048 } = {}, terms) {
  await texturesReady();
  const vrm = terms !== null;
  if (vrm) tPose(figure);
  else restPose(figure);
  const children = [...figure.root.children]; // (a VRM's meshes leave the root while it's written)
  // (The face at rest in the file, whatever the preview is playing: its keys' weights are written too.)
  const faces = figure.meshes.map((mesh) => mesh.morphTargetInfluences?.slice());
  for (const mesh of figure.meshes) mesh.morphTargetInfluences?.fill(0);
  const swapped = [];
  const made = [];
  const mimeTypes = new Map(); // a picture's type while exporting: JPEG unless something see-through uses it
  const inverses = new Map(); // (a VRM's skeletons as they were: they're bound in the T-pose while it's written)
  let vertices = 0;
  let triangles = 0;
  try {
    figure.meshes.forEach((mesh, at) => {
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const ranges = Array.isArray(mesh.material)
        ? mesh.geometry.groups.map(({ start, count, materialIndex }) => ({ start, count, materialIndex }))
        : [{ start: 0, count: mesh.geometry.index.count, materialIndex: 0 }];
      const slim = slimGeometry(mesh.geometry, ranges);
      if (vrm) bakePose(slim.geometry, mesh);
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
    // A VRM's points are in world space now, so its meshes go to the top of the file with no transform of
    // their own (three's loader moves a skinned mesh by its node's transform where glTF says not to, so with
    // one, three and other readers would draw it apart), bound where the bones stand: each inverse bind
    // matrix (bone inverse · bind) the bone's world inverted.
    if (vrm)
      for (const mesh of figure.meshes) {
        if (mesh.position.lengthSq() || mesh.scale.manhattanLength() !== 3 || mesh.quaternion.w !== 1)
          throw new Error("A part of the avatar is placed in a way the VRM writer doesn't expect.");
        figure.object.add(mesh);
        const { skeleton } = mesh;
        if (inverses.has(skeleton)) continue;
        inverses.set(
          skeleton,
          skeleton.boneInverses.map((inverse) => inverse.clone()),
        );
        // (The bind matrix itself inverted: the maker's parts can carry a bindMatrixInverse that isn't.)
        const unbind = mesh.bindMatrix.clone().invert();
        skeleton.bones.forEach((bone, i) => skeleton.boneInverses[i].copy(bone.matrixWorld).invert().multiply(unbind));
      }
    figure.object.updateMatrixWorld(true);
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
    if (vrm) addVrm(json, figure, vrmMeta(name, look, terms));
    return { bytes: writeGlb(json, bin), vertices, triangles };
  } finally {
    for (const { mesh, geometry, material } of swapped) {
      mesh.geometry = geometry;
      mesh.material = material;
    }
    for (const item of made) item.dispose();
    figure.meshes.forEach(
      (mesh, at) => faces[at] && mesh.morphTargetInfluences.splice(0, faces[at].length, ...faces[at]),
    );
    for (const [skeleton, saved] of inverses) saved.forEach((inverse, i) => skeleton.boneInverses[i].copy(inverse));
    if (vrm) {
      for (const mesh of figure.meshes) if (mesh.parent !== figure.root) figure.root.add(mesh);
      figure.root.children.splice(0, figure.root.children.length, ...children); // (in their order, as drawn)
      restPose(figure);
    }
  }
}

/** The look stored in a .glb or .vrm the maker saved: { name, look }, or null for any other file. */
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
