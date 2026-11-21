// The base avatar: Wanderworld's own person, made in Blender (assets/scripts/make_avatar.py) from MakeHuman's
// CC0 base mesh and shapes, packed into the kit by `scripts/build-wanderworld-people.mjs --avatar`
// (kit/generic/avatar: a body each, the hair styles; kit/fantasy/avatar: the outfit pieces). docs/AVATAR.md
// has the plan. A look (looks.js) shapes it: which body, the build and face sliders (shape keys), arm and
// leg length and head size (bones), each part's colour, underwear, hair and outfit pieces. Whatever the
// look leaves out comes from the name, within an everyday range, so a crowd differs without anyone
// setting it.
//
// What it costs: the shape keys are worked into each person's own copy of the positions and normals when
// they're made, so nobody, near or far, pays for shape keys while drawing; the rest of a body's data
// (texture places, bone weights, triangles) is shared by everyone with that body. The parts that share a
// texture are drawn as one, coloured by vertex: two draws for a body (skin and the rest, then brows and
// lashes), and one for each hair style or outfit piece worn. The Look card's preview makes a new one for
// each change; people in the world are made again only when their look changes.
import { BufferAttribute, BufferGeometry, Color, DoubleSide, Matrix4, MeshLambertMaterial, SkinnedMesh } from "three";
import { humanoidFromSkeleton } from "./models.js";
import {
  BARE,
  CLOTH_COLOURS,
  CLOTH_HEX,
  EYE_COLOURS,
  FACE,
  HAIR_COLOURS,
  HAIRSTYLES,
  HEIGHTS,
  LIMBS,
  SHAPES,
  SKIN_TONES,
  UNDERWEAR_BOTTOMS,
  UNDERWEAR_TOPS,
  USUAL_HAIR,
  USUAL_HAIR_COLOURS,
} from "./looks.js";
import { geometryOf, humanoidNodes, load, rigOf, sexFor, skeletonFor, texture, view } from "./people.js";
import { hashString, rng } from "./world.js";

/** The region of the body each bone's vertices are, for what an outfit piece `hides`. */
const REGION_OF = {
  Head: "head",
  neck_01: "neck",
  spine_01: "torso",
  spine_02: "torso",
  spine_03: "torso",
  clavicle_l: "torso",
  clavicle_r: "torso",
  pelvis: "hips",
  upperarm_l: "upperarms",
  upperarm_r: "upperarms",
  lowerarm_l: "forearms",
  lowerarm_r: "forearms",
  hand_l: "hands",
  hand_r: "hands",
  thigh_l: "thighs",
  thigh_r: "thighs",
  calf_l: "calves",
  calf_r: "calves",
  foot_l: "feet",
  foot_r: "feet",
  ball_l: "feet",
  ball_r: "feet",
};
// Whether someone with no underwear chosen wears the usual (a bra and briefs, or briefs): Settings → People
// → "Default skins with underwear". Off, the base skin shows as it is unless underwear is chosen by hand.
let underwearByDefault = true;
export function setUnderwearByDefault(on) {
  underwearByDefault = on !== false;
}

/** What an outfit piece can hide: these regions of skin (and underwear on them), or the underwear itself. */
export const HIDE_WORDS = [...new Set(Object.values(REGION_OF)), "underwear", "underwear-top", "underwear-bottom"];
/** The parts the regions hide (the skin, and underwear under the piece). */
const COVERED = new Set(["skin", "underwear", "underwear_trim"]);

/** The bones arm and leg length stretch: [bone, the next one along it]. */
const LIMB_BONES = {
  arms: [
    ["upperarm_l", "lowerarm_l"],
    ["lowerarm_l", "hand_l"],
    ["upperarm_r", "lowerarm_r"],
    ["lowerarm_r", "hand_r"],
  ],
  legs: [
    ["thigh_l", "calf_l"],
    ["calf_l", "foot_l"],
    ["thigh_r", "calf_r"],
    ["calf_r", "foot_r"],
  ],
};

const clamp = (value, least, most) => Math.max(least, Math.min(most, value));
const mixHex = (a, b, t) => {
  const channel = (shift) => Math.round(((a >> shift) & 255) * (1 - t) + ((b >> shift) & 255) * t);
  return (channel(16) << 16) | (channel(8) << 8) | channel(0);
};

/**
 * Everything about how `name` looks as the base avatar, filled in: what was `chosen` (a checked look,
 * with any lore words' look under it, looks.js mergeLooks) over what the name gives. `gender`: the People
 * menu's ("male", "female", "custom" or "auto"). Plain data: { body, gender, shape, limbs, height,
 * colours, hair, hairColour (0xRRGGBB), underwear, clothes, seed }. The Look card shows these.
 */
export function avatarLook(name, gender = "auto", chosen = {}) {
  const { sex, gender: own } = sexFor(name, gender, chosen);
  const random = rng(hashString(`${name || "wanderer"}:avatar`));
  // About an everyday middle: most near it, a few further out (the sum of two rolls).
  const around = (spread) => (random() + random() - 1) * spread;
  const NATURAL = {
    weight: 0.5,
    muscle: 0.35,
    chest: 0.35,
    hips: 0.3,
    waist: 0.3,
    belly: 0.25,
    shoulders: 0.3,
    neck: 0.25,
  };
  const shape = {};
  for (const [key, , least, most] of [...SHAPES, ...FACE]) {
    const usual = key === "ears" ? 0 : clamp(around(NATURAL[key] ?? 0.35), least, most);
    shape[key] = chosen.shape?.[key] ?? Math.round(usual * 100) / 100;
  }
  const limbs = {};
  for (const [key, , least, most] of LIMBS)
    limbs[key] =
      chosen.limbs?.[key] ?? Math.round(clamp(1 + around(key === "head" ? 0.02 : 0.03), least, most) * 1000) / 1000;
  const usualHeight = 0.94 + random() * 0.12;
  const usualSkin = Math.floor(random() * SKIN_TONES.length);
  const usualEyes = EYE_COLOURS[Math.floor(random() * 7)][0];
  const usualHair = USUAL_HAIR[sex][Math.floor(random() * USUAL_HAIR[sex].length)];
  const usualHairColour = Math.floor(random() * USUAL_HAIR_COLOURS);
  const usualCloth = CLOTH_COLOURS[Math.floor(random() * 4)][0];
  // (An older look's skin and hair carry over: a tone's place in the list, or a colour of one's own.)
  const skin = chosen.colours?.skin ?? chosen.skinTint ?? SKIN_TONES[chosen.skin ?? usualSkin][0];
  const hairColour = chosen.hairTint ?? HAIR_COLOURS[chosen.hairColour ?? usualHairColour][0];
  const colours = {
    skin,
    eyes: chosen.colours?.eyes ?? usualEyes,
    // (Lips a little redder and darker than the skin, nails a little paler, brows a little darker than the hair.)
    lips: chosen.colours?.lips ?? mixHex(mixHex(skin, 0xa04040, 0.35), 0x000000, 0.12),
    nails: chosen.colours?.nails ?? mixHex(skin, 0xf6e6e0, 0.4),
    brows: chosen.colours?.brows ?? mixHex(hairColour, 0x000000, 0.25),
    underwear:
      chosen.colours?.underwear ??
      chosen.tints?.top ??
      CLOTH_HEX[chosen.colour] ??
      CLOTH_HEX[chosen.rangerColour] ??
      usualCloth,
  };
  return {
    body: sex,
    gender: own,
    shape,
    limbs,
    height: clamp(chosen.height ?? usualHeight, HEIGHTS[0], HEIGHTS[1]),
    colours,
    hair: HAIRSTYLES.some(([style]) => style === chosen.hair) ? chosen.hair : usualHair,
    hairColour,
    underwear: {
      top: chosen.underwear?.top ?? (underwearByDefault && sex === "female" ? "bra" : BARE),
      bottom: chosen.underwear?.bottom ?? (underwearByDefault ? "briefs" : BARE),
    },
    clothes: chosen.clothes ?? [],
    seed: hashString(`${name}:motion`),
  };
}

/** The shape keys' influences for a filled-in look: one weight slider is the thin and heavy keys. */
function keyWeights(look, sex) {
  const { shape } = look;
  return {
    thin: Math.max(0, -shape.weight),
    heavy: Math.max(0, shape.weight),
    muscle: shape.muscle,
    [sex === "female" ? "bust" : "chest"]: shape.chest,
    hips: shape.hips,
    waist: -shape.waist, // (the key narrows; the slider widens)
    belly: shape.belly,
    shoulders: shape.shoulders,
    neck: shape.neck,
    jaw: shape.jaw,
    cheeks: shape.cheeks,
    nose: shape.nose,
    eyes: shape.eyes,
    ears_pointed: shape.ears,
  };
}

// ── The kit, read once a body ────────────────────────────────────────────────

/** A packed mesh's shape keys: { key: { ids (its own vertex numbers), delta, normal } }, as floats. */
function morphsOf(mesh, offset = 0) {
  const out = {};
  for (const [key, packed] of Object.entries(mesh.morphs ?? {})) {
    const ids = Uint32Array.from(view(mesh.count > 65535 ? Uint32Array : Uint16Array, packed.ids), (id) => id + offset);
    const delta = Float32Array.from(view(Int16Array, packed.delta), (value, i) => (value / 32767) * packed.d[i % 3]);
    const normal = Float32Array.from(view(Int8Array, packed.normal), (value, i) => (value / 127) * packed.n[i % 3]);
    out[key] = { ids, delta, normal };
  }
  return out;
}

/** Shape keys worked into a copy of `position` and `normal`, by `weights` ({ key: influence }). */
function shaped(position, normal, morphs, weights) {
  const p = position.slice();
  const n = normal.slice();
  let moved = false;
  for (const [key, list] of Object.entries(morphs)) {
    const weight = weights[key] ?? 0;
    if (!weight) continue;
    for (const { ids, delta, normal: turn } of list) {
      for (let i = 0; i < ids.length; i++) {
        const at = ids[i] * 3;
        for (let c = 0; c < 3; c++) {
          p[at + c] += delta[i * 3 + c] * weight;
          n[at + c] += turn[i * 3 + c] * weight;
        }
      }
    }
    moved = true;
  }
  if (moved)
    for (let at = 0; at < n.length; at += 3) {
      const length = Math.hypot(n[at], n[at + 1], n[at + 2]) || 1;
      n[at] /= length;
      n[at + 1] /= length;
      n[at + 2] /= length;
    }
  return { position: p, normal: n };
}

const bodies = new Map();
/**
 * A body from the kit, made ready once and shared: its file, its meshes laid end to end (parts sharing a
 * texture together, opaque before see-through), what's shared by everyone with it, the shape keys, each
 * vertex's region, and the underwear styles it has.
 */
function bodyKit(sex) {
  if (!bodies.has(sex)) {
    const made = load(`avatar-${sex}.json`).then((file) => {
      // (Opaque parts first, then the cut-out ones; within each, a texture's parts together.)
      const order = file.meshes
        .map((mesh, i) => ({ mesh, i }))
        .sort(
          (a, b) =>
            !!a.mesh.alpha - !!b.mesh.alpha ||
            String(a.mesh.texture).localeCompare(String(b.mesh.texture)) ||
            a.i - b.i,
        );
      const total = order.reduce((sum, { mesh }) => sum + mesh.count, 0);
      const position = new Float32Array(total * 3);
      const normal = new Float32Array(total * 3);
      const uv = new Float32Array(total * 2);
      const skinIndex = new Uint16Array(total * 4);
      const skinWeight = new Float32Array(total * 4);
      const regions = new Array(total);
      const morphs = {};
      const meshes = [];
      let offset = 0;
      for (const { mesh } of order) {
        const geometry = geometryOf(mesh);
        const { attributes } = geometry;
        position.set(attributes.position.array, offset * 3);
        normal.set(attributes.normal.array, offset * 3);
        if (attributes.uv) uv.set(attributes.uv.array, offset * 2);
        skinIndex.set(attributes.skinIndex.array, offset * 4);
        skinWeight.set(attributes.skinWeight.array, offset * 4);
        for (let v = 0; v < mesh.count; v++) {
          let best = 0;
          for (let c = 1; c < 4; c++)
            if (attributes.skinWeight.array[v * 4 + c] > attributes.skinWeight.array[v * 4 + best]) best = c;
          regions[offset + v] = REGION_OF[file.joints[attributes.skinIndex.array[v * 4 + best]]] ?? "";
        }
        const index = Uint32Array.from(geometry.index.array, (vertex) => vertex + offset);
        for (const [key, morph] of Object.entries(morphsOf(mesh, offset))) (morphs[key] ??= []).push(morph);
        meshes.push({ ...mesh, start: offset, index, group: `${mesh.alpha ? "cut" : "solid"}:${mesh.texture}` });
        geometry.dispose();
        offset += mesh.count;
      }
      // The underwear styles its model has: a mesh each, or one layer (a body made before them) that is
      // the briefs, and a bra on her.
      const tops = new Set();
      const bottoms = new Set();
      for (const mesh of meshes) {
        const style = /^underwear-(top|bottom)-(.+)$/u.exec(mesh.piece ?? "");
        if (style) (style[1] === "top" ? tops : bottoms).add(style[2]);
        if (mesh.piece === "underwear-legacy") {
          bottoms.add("briefs");
          if (sex === "female") tops.add("bra");
        }
      }
      const known = (list, have) => list.filter(([style]) => have.has(style)).map(([style]) => style);
      const box = new BufferGeometry();
      box.setAttribute("position", new BufferAttribute(position, 3));
      box.computeBoundingBox();
      box.computeBoundingSphere();
      return {
        file,
        sex,
        position,
        normal,
        regions,
        morphs,
        meshes,
        boundingBox: box.boundingBox,
        boundingSphere: box.boundingSphere,
        shared: {
          uv: new BufferAttribute(uv, 2),
          skinIndex: new BufferAttribute(skinIndex, 4),
          skinWeight: new BufferAttribute(skinWeight, 4),
        },
        indices: new Map(), // which triangles show (by underwear and what's hidden) → { index, groups }
        tops: known(UNDERWEAR_TOPS, tops),
        bottoms: known(UNDERWEAR_BOTTOMS, bottoms),
      };
    });
    made.catch(() => bodies.delete(sex)); // (tried again next time)
    bodies.set(sex, made);
  }
  return bodies.get(sex);
}

/** Whether a mesh of the body shows with this underwear: the body's own always, a style only if chosen. */
function worn(mesh, underwear, sex) {
  if (!mesh.piece) return true;
  if (mesh.piece === "underwear-legacy")
    return underwear.bottom === "briefs" || (sex === "female" && underwear.top === "bra");
  const style = /^underwear-(top|bottom)-(.+)$/u.exec(mesh.piece);
  return !!style && underwear[style[1]] === style[2];
}

/** The body's triangles that show (shared by everyone wearing the same and hiding the same), in groups. */
function trianglesOf(kit, underwear, hides) {
  const key = `${underwear.top}|${underwear.bottom}|${[...hides].sort().join(",")}`;
  if (!kit.indices.has(key)) {
    const hidden = (mesh) => {
      if (
        /^underwear/u.test(mesh.part) &&
        (hides.has("underwear") || (mesh.piece && hides.has(mesh.piece.replace(/-[^-]+$/u, ""))))
      )
        return () => true;
      if (!COVERED.has(mesh.part)) return () => false;
      return (a, b, c) => hides.has(kit.regions[a]) && hides.has(kit.regions[b]) && hides.has(kit.regions[c]);
    };
    const groups = [];
    const kept = [];
    for (const mesh of kit.meshes) {
      if (!worn(mesh, underwear, kit.sex)) continue;
      const hide = hidden(mesh);
      if (groups.at(-1)?.name !== mesh.group) groups.push({ name: mesh.group, start: kept.length, count: 0, mesh });
      for (let i = 0; i < mesh.index.length; i += 3) {
        const [a, b, c] = [mesh.index[i], mesh.index[i + 1], mesh.index[i + 2]];
        if (hide(a, b, c)) continue;
        kept.push(a, b, c);
      }
      groups.at(-1).count = kept.length - groups.at(-1).start;
    }
    const Type = kit.position.length / 3 > 65535 ? Uint32Array : Uint16Array;
    kit.indices.set(key, {
      index: new BufferAttribute(Type.from(kept), 1),
      groups: groups.filter((group) => group.count),
    });
  }
  return kit.indices.get(key);
}

const parts = new Map(); // a hair style's or outfit piece's meshes, made once: "hair:long:male" → [{ mesh, geometry, morphs }]
/** A hair style's or outfit piece's meshes, decoded once and shared. */
function partMeshes(key, part) {
  if (!parts.has(key))
    parts.set(
      key,
      part.meshes.map((mesh) => {
        const geometry = geometryOf(mesh);
        geometry.userData.shared = true;
        return {
          mesh,
          geometry,
          morphs: Object.fromEntries(Object.entries(morphsOf(mesh)).map(([k, morph]) => [k, [morph]])),
        };
      }),
    );
  return parts.get(key);
}

/** Which hair styles, underwear and outfit pieces the kit has for `sex`: what the Look card offers. */
export async function avatarChoices(sex) {
  const kit = await bodyKit(sex);
  const hair = await load("avatar-hair.json").catch(() => null);
  const outfits = await load("avatar-outfits.json").catch(() => null);
  return {
    tops: kit.tops,
    bottoms: kit.bottoms,
    hair: HAIRSTYLES.map(([style]) => style).filter((style) => style === BARE || hair?.styles?.[style]?.[sex]),
    clothes: Object.entries(outfits?.pieces ?? {})
      .filter(([, piece]) => piece[sex])
      .map(([piece]) => piece),
  };
}

// ── Making one ───────────────────────────────────────────────────────────────

/**
 * The base avatar for `name` with `look` (a checked look, looks.js; lore's under it already) and
 * `gender` (the People menu's), as a walking character like createFigure's and createFolk's: { object,
 * update, dispose, wear, … }. Rejects if the kit's body can't be loaded; a hair style or outfit piece the
 * kit hasn't got is left off.
 */
export async function createAvatar(look = {}, name = "", gender = "auto") {
  const filled = avatarLook(name, gender, look);
  const sex = filled.body;
  const [kit, hairFile, outfitFile] = await Promise.all([
    bodyKit(sex),
    filled.hair === BARE ? null : load("avatar-hair.json").catch(() => null),
    filled.clothes.length ? load("avatar-outfits.json").catch(() => null) : null,
  ]);
  const { root, bones } = rigOf(kit.file);
  const weights = keyWeights(filled, sex);

  // Arm and leg length: each bone of the limb stretched along itself in its own space (its inverse bind
  // matrix), and the next one moved out to match, so the limb grows longer, not thicker, and the hands and
  // feet stay their size. The head is scaled from its joint at the neck.
  const stretch = new Map();
  for (const [limb, chain] of Object.entries(LIMB_BONES)) {
    const k = filled.limbs[limb] - 1;
    if (!k) continue;
    for (const [boneName, nextName] of chain) {
      const next = bones.get(nextName);
      if (!bones.has(boneName) || !next) continue;
      const { x, y, z } = next.position.clone().normalize();
      stretch.set(
        boneName,
        new Matrix4().set(
          1 + k * x * x,
          k * x * y,
          k * x * z,
          0,
          k * y * x,
          1 + k * y * y,
          k * y * z,
          0,
          k * z * x,
          k * z * y,
          1 + k * z * z,
          0,
          0,
          0,
          0,
          1,
        ),
      );
      next.position.multiplyScalar(1 + k);
    }
  }
  if (filled.limbs.head !== 1)
    stretch.set("Head", new Matrix4().makeScale(filled.limbs.head, filled.limbs.head, filled.limbs.head));
  root.updateMatrixWorld(true);

  const owned = []; // what this person alone has, to let go of with them
  const bind = (geometry, materials, part, fallback = null) => {
    const mesh = new SkinnedMesh(geometry, materials);
    mesh.frustumCulled = false;
    mesh.userData.sharedShadow = true; // (disposed here, so the shared data stays: avatar.js `dispose`)
    root.add(mesh);
    mesh.bind(skeletonFor(root, bones, part, stretch, fallback), mesh.matrixWorld);
    return mesh;
  };

  // Outfit pieces first: what they cover is hidden on the body.
  const hides = new Set();
  const pieces = filled.clothes.map((piece) => outfitFile?.pieces?.[piece]).filter((piece) => piece?.[sex]);
  for (const piece of pieces) for (const word of piece.hides ?? []) hides.add(word);

  // The body: its shape keys worked in, each vertex coloured by its part.
  const { position, normal } = shaped(kit.position, kit.normal, kit.morphs, weights);
  const colourOf = (part) =>
    ({
      skin: filled.colours.skin,
      underwear: filled.colours.underwear,
      underwear_trim: mixHex(filled.colours.underwear, 0x000000, 0.3),
      iris: filled.colours.eyes,
      eyebrows: filled.colours.brows,
      eyelashes: mixHex(filled.colours.brows, 0x000000, 0.5),
      lips: filled.colours.lips,
      nails: filled.colours.nails,
    })[part];
  const colour = new Uint16Array(position.length);
  const tint = new Color();
  for (const mesh of kit.meshes) {
    const hex = colourOf(mesh.part);
    if (hex === undefined) tint.setRGB(...mesh.colour);
    else tint.setHex(hex); // (an sRGB colour, as the material's linear factor)
    for (let v = mesh.start; v < mesh.start + mesh.count; v++) {
      colour[v * 3] = Math.round(tint.r * 65535);
      colour[v * 3 + 1] = Math.round(tint.g * 65535);
      colour[v * 3 + 2] = Math.round(tint.b * 65535);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(position, 3));
  geometry.setAttribute("normal", new BufferAttribute(normal, 3));
  geometry.setAttribute("color", new BufferAttribute(colour, 3, true));
  for (const [attribute, shared] of Object.entries(kit.shared)) geometry.setAttribute(attribute, shared);
  const { index, groups } = trianglesOf(kit, filled.underwear, hides);
  geometry.setIndex(index);
  const materials = groups.map((group, i) => {
    geometry.addGroup(group.start, group.count, i);
    const cut = !!group.mesh.alpha;
    // Brows and lashes are cut out by their texture (alpha-tested, so they need no sorting). Every part is
    // seen from both sides, as the model's materials say: some faces (the irises) face inwards, and shown
    // from the front only they'd show what's behind them.
    // ponytail: two-sided costs a little; once make_avatar.py turns those faces outwards, the opaque
    // parts can be front-only again.
    return new MeshLambertMaterial({
      map: group.mesh.texture ? texture(group.mesh.texture) : null,
      vertexColors: true,
      side: DoubleSide,
      ...(cut ? { alphaTest: 0.3 } : {}),
    });
  });
  geometry.boundingBox = kit.boundingBox.clone();
  geometry.boundingSphere = kit.boundingSphere.clone();
  bind(geometry, materials, kit.file);
  owned.push(() => {
    // (Only what's this person's: the shared texture places, weights and triangles stay for the rest.)
    for (const attribute of Object.keys(kit.shared)) geometry.deleteAttribute(attribute);
    geometry.setIndex(null);
    geometry.dispose();
    for (const material of materials) material.dispose();
  });

  // Hair and outfit pieces: shared meshes, or each person's own when they have shape keys to follow.
  const wearPart = (key, part, colourFor) => {
    for (const { mesh, geometry: shared, morphs } of partMeshes(key, part)) {
      let geometry = shared;
      if (Object.keys(morphs).length) {
        const moved = shaped(shared.attributes.position.array, shared.attributes.normal.array, morphs, weights);
        geometry = new BufferGeometry();
        geometry.setAttribute("position", new BufferAttribute(moved.position, 3));
        geometry.setAttribute("normal", new BufferAttribute(moved.normal, 3));
        for (const attribute of ["uv", "skinIndex", "skinWeight"])
          if (shared.attributes[attribute]) geometry.setAttribute(attribute, shared.attributes[attribute]);
        geometry.setIndex(shared.index);
        geometry.boundingBox = shared.boundingBox;
        geometry.boundingSphere = shared.boundingSphere;
        const own = geometry;
        owned.push(() => {
          for (const attribute of ["uv", "skinIndex", "skinWeight"]) own.deleteAttribute(attribute);
          own.setIndex(null);
          own.dispose();
        });
      }
      const material = new MeshLambertMaterial({
        map: mesh.texture ? texture(mesh.texture) : null,
        color: colourFor(mesh),
        ...(mesh.alpha ? { alphaTest: 0.5, side: DoubleSide } : {}),
      });
      owned.push(() => material.dispose());
      bind(geometry, material, part, kit.file);
    }
  };
  const hair = hairFile?.styles?.[filled.hair]?.[sex];
  if (hair) wearPart(`hair:${filled.hair}:${sex}`, hair, () => new Color(filled.hairColour));
  for (const [i, piece] of pieces.entries())
    wearPart(`outfit:${filled.clothes[i]}:${sex}`, piece[sex], (mesh) => new Color().setRGB(...mesh.colour));

  const character = humanoidFromSkeleton(root, humanoidNodes(bones), () => filled.height, filled.seed);
  const disposeRest = character.dispose;
  character.dispose = () => {
    for (const letGo of owned) letGo();
    disposeRest();
  };
  character.avatar = filled; // (what it was made from, for the Look card and the tests)
  return character;
}
