// The Realistic body: a second kind of body beside the kit's MakeHuman ones, built from the Vitruvian
// character (assets/scripts/make_realistic.py; CC0). It has its own files in the kit (realistic-*), its own
// shape sliders, skin, eyes and strand hair, and for now no clothes. Nothing here reads the other bodies'
// files or code paths, so they stay as they were: a look with `body: "realistic"` is built here (avatar.js
// createAvatar hands it over), any other as before.
//
// What it gives back is the same figure the rest of the maker works with (figure.js standFigure): the stage
// poses and animates it, face.js moves its face by the same key names, and the exporter saves it.
import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DataTexture,
  DoubleSide,
  FrontSide,
  LinearFilter,
  Matrix4,
  MeshStandardMaterial,
  RGBAFormat,
  Skeleton,
  SkinnedMesh,
  SRGBColorSpace,
  Uint16BufferAttribute,
  Vector2,
  Vector3,
} from "three";
import { FACE_MOVES } from "./face.js";
import { standFigure } from "./figure.js";
import { geometryOf, load, rigOf, texture, urlOf, view } from "./kitfiles.js";
import { HAIR_COLOURS, NEUTRAL_LOOK, REALISTIC, REALISTIC_HAIR, REALISTIC_SHAPES } from "./looks.js";

const BODY_FILE = "realistic-body.pack.png";
const hairFile = (style) => `realistic-hair-${style}.pack.png`;
/** How smooth each part is (0 a mirror, 1 chalk) where no picture says, and whether both its sides are drawn. */
const ROUGHNESS = {
  mouth: 0.35,
  iris: 0.35,
  pupil: 0.6,
  eye_white: 0.25,
  cornea: 0.03,
  brows: 0.6,
  hair: 0.45,
  scalp: 0.7,
};
const CORNEA_SOLID = 0.3; // how much of the clear front of the eye's glint is kept (it's drawn see-through)
const CARRY_CELL = 0.012; // metres: the cells the head's skin is sorted into, to find the skin nearest a brow hair
const CARRY_NEAREST = 3;

/** A packed mesh's shape keys as floats: { key: { ids, delta, normal } } (scripts/build-3d-avatar-maker-kit.mjs packMesh). */
function morphsOf(mesh) {
  const out = {};
  for (const [key, packed] of Object.entries(mesh.morphs ?? {})) {
    const ids = Uint32Array.from(view(mesh.count > 65535 ? Uint32Array : Uint16Array, packed.ids));
    const q = packed.q ?? 32767;
    const delta = Float32Array.from(view(Int16Array, packed.delta), (value, i) => (value / q) * packed.d[i % 3]);
    const normal = Float32Array.from(view(Int8Array, packed.normal), (value, i) => (value / 127) * packed.n[i % 3]);
    out[key] = { ids, delta, normal };
  }
  return out;
}

/** For each of `points` (x, y, z each), the `skin` vertices nearest it and their shares: { ids, shares }, CARRY_NEAREST each. */
function nearestOf(points, skin) {
  // (The skin sorted into cells, each known by one number: a body is well within 512 cells of the middle.)
  const cellOf = (x, y, z) =>
    ((Math.floor(x / CARRY_CELL) + 512) << 20) |
    ((Math.floor(y / CARRY_CELL) + 512) << 10) |
    (Math.floor(z / CARRY_CELL) + 512);
  const cells = new Map();
  for (let v = 0; v < skin.length / 3; v++) {
    const cell = cellOf(skin[v * 3], skin[v * 3 + 1], skin[v * 3 + 2]);
    if (!cells.has(cell)) cells.set(cell, []);
    cells.get(cell).push(v);
  }
  const count = points.length / 3;
  const ids = new Uint32Array(count * CARRY_NEAREST);
  const shares = new Float32Array(count * CARRY_NEAREST);
  const best = new Float64Array(CARRY_NEAREST);
  const bestId = new Int32Array(CARRY_NEAREST);
  for (let p = 0; p < count; p++) {
    const [x, y, z] = [points[p * 3], points[p * 3 + 1], points[p * 3 + 2]];
    let found = 0;
    // (Wider and wider until enough skin is found: a brow hair or a strand's root lies within millimetres of it.)
    for (let reach = 1; reach <= 6 && found < CARRY_NEAREST; reach++) {
      found = 0;
      best.fill(Infinity);
      for (let dx = -reach; dx <= reach; dx++)
        for (let dy = -reach; dy <= reach; dy++)
          for (let dz = -reach; dz <= reach; dz++) {
            const list = cells.get(cellOf(x + dx * CARRY_CELL, y + dy * CARRY_CELL, z + dz * CARRY_CELL));
            if (!list) continue;
            for (const v of list) {
              const distance = Math.hypot(skin[v * 3] - x, skin[v * 3 + 1] - y, skin[v * 3 + 2] - z);
              found++;
              // (Kept in order, nearest first.)
              for (let k = 0; k < CARRY_NEAREST; k++)
                if (distance < best[k]) {
                  for (let j = CARRY_NEAREST - 1; j > k; j--) {
                    best[j] = best[j - 1];
                    bestId[j] = bestId[j - 1];
                  }
                  best[k] = distance;
                  bestId[k] = v;
                  break;
                }
            }
          }
    }
    let total = 0;
    for (let k = 0; k < CARRY_NEAREST; k++) {
      const at = Math.min(k, Math.max(0, found - 1));
      ids[p * CARRY_NEAREST + k] = found ? bestId[at] : 0;
      shares[p * CARRY_NEAREST + k] = found ? 1 / (best[at] + 1e-4) : 0;
      total += shares[p * CARRY_NEAREST + k];
    }
    for (let k = 0; k < CARRY_NEAREST; k++) shares[p * CARRY_NEAREST + k] /= total || 1;
  }
  return { ids, shares };
}

let kit = null;
/**
 * The body from the kit, read once and shared: each of its meshes with its points as floats, its shape keys,
 * and the face's moves as whole-mesh arrays; the brows tied to the skin of the head they lie on.
 */
async function bodyKit() {
  kit ??= load(BODY_FILE).then((file) => {
    const meshes = file.meshes.map((mesh) => {
      const geometry = geometryOf(mesh);
      return {
        part: mesh.part,
        piece: mesh.piece ?? null,
        alpha: mesh.alpha ?? null,
        geometry,
        position: geometry.attributes.position.array,
        normal: geometry.attributes.normal.array,
        morphs: morphsOf(mesh),
      };
    });
    const head = meshes.find((mesh) => mesh.part === "skin_head");
    for (const mesh of meshes) {
      // (A piece on the face has no keys of its own: it moves as the skin under it does.)
      mesh.tied = mesh.piece && head ? nearestOf(mesh.position, head.position) : null;
      mesh.faceMoves = FACE_MOVES.map((key) => {
        const moves = new Float32Array(mesh.position.length);
        const own = mesh.morphs[key];
        if (own)
          for (let i = 0; i < own.ids.length; i++)
            for (let c = 0; c < 3; c++) moves[own.ids[i] * 3 + c] = own.delta[i * 3 + c];
        else if (mesh.tied && head.morphs[key]) carry(moves, mesh.tied, wholeMove(head, key), 1);
        else return null;
        const attribute = new BufferAttribute(moves, 3);
        attribute.name = key;
        return attribute;
      });
    }
    return {
      file,
      meshes,
      head,
      sliders: new Map(file.sliders.map(([key, least, most]) => [key, [least, most]])),
    };
  });
  return kit;
}

/** A mesh's key as a move for every one of its vertices (made once a key and kept). */
function wholeMove(mesh, key) {
  mesh.whole ??= {};
  if (!mesh.whole[key]) {
    const moves = new Float32Array(mesh.position.length);
    const own = mesh.morphs[key];
    if (own)
      for (let i = 0; i < own.ids.length; i++)
        for (let c = 0; c < 3; c++) moves[own.ids[i] * 3 + c] = own.delta[i * 3 + c];
    mesh.whole[key] = moves;
  }
  return mesh.whole[key];
}

/** Adds to `out` the skin's `moves`, `weight` times over, as each tied point's nearest skin vertices share them. */
function carry(out, tied, moves, weight) {
  for (let p = 0; p < out.length / 3; p++)
    for (let k = 0; k < CARRY_NEAREST; k++) {
      const v = tied.ids[p * CARRY_NEAREST + k];
      const share = tied.shares[p * CARRY_NEAREST + k] * weight;
      for (let c = 0; c < 3; c++) out[p * 3 + c] += moves[v * 3 + c] * share;
    }
}

/** The look's sliders as { key: weight }, each held within what the body's file says it goes to. */
function sliderWeights(body, look) {
  const weights = {};
  for (const [key, [least, most]] of body.sliders) {
    const value = Number(look.realShape?.[key]);
    if (Number.isFinite(value) && value !== 0) weights[key] = Math.max(least, Math.min(most, value));
  }
  return weights;
}

/** A mesh's points and normals with the sliders worked in. */
function shaped(body, mesh, weights) {
  const position = mesh.position.slice();
  const normal = mesh.normal.slice();
  let turned = false;
  for (const [key, weight] of Object.entries(weights)) {
    const own = mesh.morphs[key];
    if (own) {
      for (let i = 0; i < own.ids.length; i++) {
        const at = own.ids[i] * 3;
        for (let c = 0; c < 3; c++) {
          position[at + c] += own.delta[i * 3 + c] * weight;
          normal[at + c] += own.normal[i * 3 + c] * weight;
        }
      }
      turned = true;
    } else if (mesh.tied && body.head.morphs[key]) carry(position, mesh.tied, wholeMove(body.head, key), weight);
  }
  if (turned)
    for (let at = 0; at < normal.length; at += 3) {
      const length = Math.hypot(normal[at], normal[at + 1], normal[at + 2]) || 1;
      normal[at] /= length;
      normal[at + 1] /= length;
      normal[at + 2] /= length;
    }
  return { position, normal };
}

/** The skeleton as the file has it, each joint moved as the sliders move it (the file's `jointMoves`). */
function shapedRig(body, weights) {
  const { root, bones } = rigOf(body.file);
  const { names, parents } = body.file.skeleton;
  root.updateMatrixWorld(true);
  const at = names.map((name) => bones.get(name).getWorldPosition(new Vector3()));
  for (const [key, weight] of Object.entries(weights)) {
    for (const [joint, move] of Object.entries(body.file.jointMoves?.[key] ?? {})) {
      const i = names.indexOf(joint);
      if (i >= 0) at[i].add(new Vector3(move[0] * weight, move[1] * weight, move[2] * weight));
    }
  }
  // (Parents first: each bone is put where it now belongs under a parent already in its place.)
  const depth = (i) => (parents[i] < 0 ? 0 : 1 + depth(parents[i]));
  for (const i of names.map((_, n) => n).sort((a, b) => depth(a) - depth(b))) {
    const bone = bones.get(names[i]);
    bone.parent.updateWorldMatrix(true, false);
    bone.position.copy(bone.parent.worldToLocal(at[i].clone()));
  }
  root.updateMatrixWorld(true);
  return { root, bones };
}

/** A picture read as numbers, not colours (a normal or roughness map). */
const dataMap = (name) => texture(name, null, true);

const pictures = new Map();
/** A kit picture as something a canvas draws, loaded once. */
function pictureOf(name) {
  if (!pictures.has(name))
    pictures.set(
      name,
      fetch(urlOf(`${name}.webp`))
        .then((response) =>
          response.ok ? response.blob() : Promise.reject(new Error(`GET ${name}.webp → ${response.status}`)),
        )
        .then((blob) => createImageBitmap(blob)),
    );
  return pictures.get(name);
}

/**
 * What's painted on the skin of `part` for `look`, as its pictures' suffix: underwear unless the look goes
 * bare (`realBare`). Panties and a bra on the female side of the first slider, boxer briefs on the male side;
 * only the torso and the legs have any (assets/scripts/make_realistic.py write_textures).
 */
export function coverOf(part, look) {
  if (look.realBare || (part !== "torso" && part !== "legs")) return "";
  return (Number(look.realShape?.gender) || 0) >= 0 ? "-female" : "-male";
}

const tones = new Map(); // a skin picture (its part and what's painted on it) → { tone, map, users }: the last blend made of it, kept while in use
/**
 * A part of the skin at `tone` (0 the light skin's picture, 1 the dark's, between them a blend of the two),
 * with `cover` painted on it (coverOf): { map, letGo }. Where there's no canvas to blend on, the nearer of
 * the two pictures.
 */
async function skinMap(part, tone, cover) {
  const light = `realistic-skin-${part}-light${cover}`;
  const dark = `realistic-skin-${part}-dark${cover}`;
  const canDraw = typeof document !== "undefined" && typeof createImageBitmap === "function";
  if (tone <= 0.001 || (!canDraw && tone < 0.5)) return { map: texture(light), letGo: () => {} };
  if (tone >= 0.999 || !canDraw) return { map: texture(dark), letGo: () => {} };
  const which = `${part}${cover}`;
  let made = tones.get(which);
  if (!made || made.tone !== tone) {
    const [a, b] = await Promise.all([pictureOf(light), pictureOf(dark)]);
    const canvas = document.createElement("canvas");
    canvas.width = a.width;
    canvas.height = a.height;
    const context = canvas.getContext("2d");
    context.drawImage(a, 0, 0);
    context.globalAlpha = tone;
    context.drawImage(b, 0, 0, a.width, a.height);
    const map = new CanvasTexture(canvas);
    map.flipY = false; // glTF texture coordinates
    map.colorSpace = SRGBColorSpace;
    map.name = `realistic-skin-${which}`;
    made = { tone, map, users: 0 };
    tones.set(which, made);
  }
  const mine = made;
  mine.users++;
  return {
    map: mine.map,
    letGo: () => {
      mine.users--;
      if (!mine.users && tones.get(which) !== mine) mine.map.dispose();
    },
  };
}

let strandMap = null;
/** The hair ribbons' picture: across it each strand's own shade, along it the strand from root (darker) to tip. */
function strandPicture() {
  if (!strandMap) {
    const size = 64;
    const data = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) {
        const along = y / (size - 1);
        const shade = 0.74 + 0.26 * Math.abs((Math.sin(x * 12.9898) * 43758.5453) % 1);
        const value = shade * (0.6 + 0.4 * Math.min(1, along * 3.5));
        data.set([value * 255, value * 255, value * 255, 255], (y * size + x) * 4);
      }
    strandMap = new DataTexture(data, size, size, RGBAFormat);
    strandMap.colorSpace = SRGBColorSpace;
    strandMap.magFilter = LinearFilter;
    strandMap.minFilter = LinearFilter;
    strandMap.needsUpdate = true;
    strandMap.userData.shared = true;
    strandMap.name = "realistic-strands";
  }
  return strandMap;
}

let capMap = null;
/** The scalp cap's picture: solid across most of it, clear at one edge, so the hairline fades into the skin. */
function capPicture() {
  if (!capMap) {
    const size = 64;
    const data = new Uint8Array(size * 4 * 4);
    for (let y = 0; y < 4; y++)
      for (let x = 0; x < size; x++) data.set([255, 255, 255, Math.round((x / (size - 1)) * 255)], (y * size + x) * 4);
    capMap = new DataTexture(data, size, 4, RGBAFormat);
    capMap.colorSpace = SRGBColorSpace;
    capMap.magFilter = LinearFilter;
    capMap.minFilter = LinearFilter;
    capMap.needsUpdate = true;
    capMap.userData.shared = true;
    capMap.name = "realistic-scalp";
  }
  return capMap;
}

/** The hair's colour (a list colour or one's own) as a Color. */
const hairColourOf = (look) =>
  new Color().setHex(look.hairTint ?? HAIR_COLOURS[look.hairColour ?? 0]?.[0] ?? HAIR_COLOURS[0][0], SRGBColorSpace);

/** The material of a part of the body: { material, letGo }. */
async function materialFor(mesh, look, hair) {
  const { part } = mesh;
  if (part.startsWith("skin_")) {
    const name = part.slice("skin_".length);
    const cover = coverOf(name, look);
    const skin = await skinMap(name, look.realTone ?? 0, cover);
    const material = new MeshStandardMaterial({
      name: part,
      map: skin.map,
      normalMap: dataMap(`realistic-skin-${name}-normal${cover}`),
      // (glTF texture coordinates, and no tangents on the mesh: the map's up is the other way, as three's own loader has it.)
      normalScale: new Vector2(1, -1),
      roughnessMap: dataMap(`realistic-skin-${name}-rough${cover}`),
      roughness: 1,
      metalness: 0,
    });
    return { material, letGo: skin.letGo };
  }
  const base = { name: part, roughness: ROUGHNESS[part] ?? 0.6, metalness: 0 };
  if (part === "mouth") return { material: new MeshStandardMaterial({ ...base, map: texture("realistic-mouth") }) };
  if (part === "iris") return { material: new MeshStandardMaterial({ ...base, map: texture("realistic-iris") }) };
  if (part === "eye_white") return { material: new MeshStandardMaterial({ ...base, map: texture("realistic-eye") }) };
  if (part === "pupil") return { material: new MeshStandardMaterial({ ...base, color: 0x050505 }) };
  if (part === "cornea")
    return {
      material: new MeshStandardMaterial({
        ...base,
        color: 0x000000,
        transparent: true,
        opacity: CORNEA_SOLID,
        depthWrite: false,
      }),
    };
  if (part === "brows")
    return {
      material: new MeshStandardMaterial({ ...base, color: hair.clone().multiplyScalar(0.8), side: DoubleSide }),
    };
  if (part === "scalp")
    return {
      material: new MeshStandardMaterial({
        ...base,
        color: hair.clone().multiplyScalar(0.7),
        map: capPicture(),
        transparent: true,
        depthWrite: false,
      }),
    };
  if (part === "hair")
    return { material: new MeshStandardMaterial({ ...base, color: hair, map: strandPicture(), side: DoubleSide }) };
  return { material: new MeshStandardMaterial({ ...base, side: FrontSide }) };
}

/** A skinned mesh of `geometry` on `bones` (the file's joints, in its order), bound as they stand. */
function skinned(name, geometry, material, joints, bones, root) {
  const mesh = new SkinnedMesh(geometry, material);
  mesh.name = name;
  mesh.frustumCulled = false; // (its box is the rest pose's; an animation moves it out of it)
  root.add(mesh);
  mesh.bind(new Skeleton(joints.map((joint) => bones.get(joint) ?? root)), new Matrix4());
  return mesh;
}

const hairKits = new Map();
/**
 * A hair style from the kit, read once and shared: its ribbons and scalp cap, each point tied to the head's
 * skin. A cap's point is tied to the skin it lies on; a ribbon's, to the skin under its strand's root, so a
 * strand moves whole with the scalp it grows from and keeps its shape.
 */
function hairKit(body, style) {
  if (!hairKits.has(style))
    hairKits.set(
      style,
      load(hairFile(style)).then((file) => ({
        file,
        meshes: file.meshes.map((packed) => {
          const geometry = geometryOf(packed);
          const position = geometry.attributes.position.array;
          if (packed.part !== "hair")
            return { part: packed.part, geometry, position, tied: nearestOf(position, body.head.position) };
          // (A strand's points come one after another and share its shade, which the picture's `u` is: where
          // `u` changes a new strand starts. Its root is the point furthest back along it, the least `v`. One
          // tie a strand, for its root, then given to each of its points.)
          const uv = geometry.attributes.uv.array;
          const count = position.length / 3;
          const strandOf = new Uint32Array(count);
          const roots = [];
          for (let start = 0; start < count;) {
            let end = start;
            let rootAt = start;
            while (end < count && Math.abs(uv[end * 2] - uv[start * 2]) < 1e-4) {
              if (uv[end * 2 + 1] < uv[rootAt * 2 + 1]) rootAt = end;
              strandOf[end] = roots.length / 3;
              end++;
            }
            roots.push(position[rootAt * 3], position[rootAt * 3 + 1], position[rootAt * 3 + 2]);
            start = end;
          }
          const each = nearestOf(Float32Array.from(roots), body.head.position);
          const tied = { ids: new Uint32Array(count * CARRY_NEAREST), shares: new Float32Array(count * CARRY_NEAREST) };
          for (let v = 0; v < count; v++)
            for (let k = 0; k < CARRY_NEAREST; k++) {
              tied.ids[v * CARRY_NEAREST + k] = each.ids[strandOf[v] * CARRY_NEAREST + k];
              tied.shares[v * CARRY_NEAREST + k] = each.shares[strandOf[v] * CARRY_NEAREST + k];
            }
          return { part: packed.part, geometry, position, tied };
        }),
      })),
    );
  return hairKits.get(style);
}

/** What the kit has for this body: what the maker's controls offer (avatar.js avatarChoices, for the other bodies). */
export async function realisticChoices() {
  const body = await bodyKit();
  return {
    keys: body.file.keys,
    sliders: body.file.sliders,
    hair: REALISTIC_HAIR.map(([style]) => style),
    races: [],
    tops: [],
    bottoms: [],
    brows: [],
    lashes: [],
    clothes: [],
    wings: false,
    tail: false,
  };
}

/** The Realistic body for `look` as a figure (figure.js standFigure), its face's keys live and its eyes on bones. */
export async function createRealistic(look = {}) {
  const body = await bodyKit();
  const filled = {
    ...NEUTRAL_LOOK,
    clothes: [],
    ...look,
    body: REALISTIC,
    realShape: Object.fromEntries(REALISTIC_SHAPES.map(([key]) => [key, Number(look.realShape?.[key]) || 0])),
    realTone: Math.max(0, Math.min(1, Number(look.realTone) || 0)),
    realHair: REALISTIC_HAIR.some(([style]) => style === look.realHair) ? look.realHair : REALISTIC_HAIR[1][0],
    realBare: look.realBare === true,
    height: Number.isFinite(look.height) ? look.height : 1,
  };
  const weights = sliderWeights(body, filled);
  const { root, bones } = shapedRig(body, weights);
  const hairColour = hairColourOf(filled);
  const owned = [];
  let headMoved = body.head.position;
  for (const mesh of body.meshes) {
    const { position, normal } = shaped(body, mesh, weights);
    if (mesh === body.head) headMoved = position;
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(position, 3));
    geometry.setAttribute("normal", new BufferAttribute(normal, 3));
    for (const name of ["uv", "skinIndex", "skinWeight"]) geometry.setAttribute(name, mesh.geometry.attributes[name]);
    geometry.setIndex(mesh.geometry.index);
    const moves = mesh.faceMoves.filter(Boolean);
    if (moves.length) {
      geometry.morphAttributes.position = moves;
      geometry.morphTargetsRelative = true;
    }
    const { material, letGo } = await materialFor(mesh, filled, hairColour);
    const made = skinned(mesh.piece ?? mesh.part, geometry, material, body.file.joints, bones, root);
    if (moves.length) {
      made.morphTargetDictionary = Object.fromEntries(moves.map((move, i) => [move.name, i]));
      made.morphTargetInfluences = moves.map(() => 0);
    }
    if (mesh.part === "cornea") made.renderOrder = 2;
    owned.push(() => {
      geometry.dispose();
      material.dispose();
      letGo?.();
    });
  }
  if (filled.realHair !== "none") {
    const hair = await hairKit(body, filled.realHair);
    // (How far the sliders moved each point of the head's skin: what the hair on it is carried by.)
    const headMove = new Float32Array(headMoved.length);
    for (let i = 0; i < headMove.length; i++) headMove[i] = headMoved[i] - body.head.position[i];
    for (const mesh of hair.meshes) {
      const position = mesh.position.slice();
      carry(position, mesh.tied, headMove, 1);
      const geometry = new BufferGeometry();
      geometry.setAttribute("position", new BufferAttribute(position, 3));
      for (const name of ["normal", "uv", "skinIndex", "skinWeight"])
        geometry.setAttribute(name, mesh.geometry.attributes[name]);
      geometry.setIndex(mesh.geometry.index);
      const { material } = await materialFor(mesh, filled, hairColour);
      const made = skinned(mesh.part, geometry, material, hair.file.joints, bones, root);
      if (mesh.part === "scalp") made.renderOrder = 1;
      owned.push(() => {
        geometry.dispose();
        material.dispose();
      });
    }
  }
  const figure = standFigure(root, bones, filled.height);
  figure.springs = [];
  figure.colliders = [];
  figure.dispose = () => {
    for (const letGo of owned) letGo();
    for (const mesh of figure.meshes) mesh.skeleton?.dispose();
  };
  figure.avatar = filled;
  figure.kit = body;
  return figure;
}
