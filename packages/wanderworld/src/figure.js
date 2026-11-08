// The built-in person, for anyone without a 3D model: a low-poly body (face, hair, clothes) on a humanoid
// skeleton, so it walks and stands with the same motion as a VRM. Its build, hair and clothes come from
// the name, so each person looks the same every time.
//
// One skinned mesh, one draw call: every part is bound wholly to one bone, like a jointed doll whose
// joints overlap.
import { VRMHumanoid } from "@pixiv/three-vrm";
import {
  Bone,
  CapsuleGeometry,
  Color,
  CylinderGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  MeshLambertMaterial,
  Quaternion,
  Skeleton,
  SkinnedMesh,
  SphereGeometry,
  Uint16BufferAttribute,
  Vector3,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { disposeTree, humanoidCharacter } from "./character.js";
import { hashString, rng } from "./world.js";

const TAU = Math.PI * 2;
const SKIN = [0xf3d2b3, 0xe8b996, 0xd29c74, 0xb07a52, 0x8a5a3c, 0x5e3b28];
const HAIR = [0x2b1d14, 0x4a2f1c, 0x6e4526, 0x9a6a3a, 0xd8b26a, 0x1a1a1a, 0x8c2f1e, 0xbdbdbd];
const EYES = [0x3b2a1e, 0x2f4f7a, 0x3f6b3a, 0x5a4632, 0x222222, 0x4d6f80];
const SHOES = [0x2a201a, 0x3d2b1f, 0x1c1c1c, 0x5b4636, 0xe8e4dc];
const HAIRSTYLES = ["short", "short", "bob", "long", "ponytail", "bun", "buzz"];
const OUTFITS = ["trousers", "trousers", "trousers", "shorts", "skirt", "dress"];
const UP = new Vector3(0, 1, 0);
const HEAD = 1.08;
const CHIN = 1.53;

/** A part's geometry, flattened, coloured and bound wholly to bone `boneIndex`. */
function bound(geometry, hex, boneIndex) {
  const flat = geometry.index ? geometry.toNonIndexed() : geometry;
  flat.deleteAttribute("uv");
  const count = flat.attributes.position.count;
  const color = new Color(hex);
  const colors = new Float32Array(count * 3);
  const indices = new Uint16Array(count * 4);
  const weights = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    color.toArray(colors, i * 3);
    indices[i * 4] = boneIndex;
    weights[i * 4] = 1;
  }
  flat.setAttribute("color", new Float32BufferAttribute(colors, 3));
  flat.setAttribute("skinIndex", new Uint16BufferAttribute(indices, 4));
  flat.setAttribute("skinWeight", new Float32BufferAttribute(weights, 4));
  return flat;
}

/** An ellipsoid with radii (rx, ry, rz) centred at (x, y, z). */
const blob = (rx, ry, rz, x, y, z) => new SphereGeometry(1, 12, 8).scale(rx, ry, rz).translate(x, y, z);

/** A capsule of `radius` from point a to point b. */
function capsule(radius, a, b) {
  const from = new Vector3(...a);
  const to = new Vector3(...b);
  const direction = to.clone().sub(from);
  const length = direction.length();
  return new CapsuleGeometry(radius, Math.max(0.001, length), 4, 10)
    .applyQuaternion(new Quaternion().setFromUnitVectors(UP, direction.normalize()))
    .translate((from.x + to.x) / 2, (from.y + to.y) / 2, (from.z + to.z) / 2);
}

/** Part of a sphere around the head (radii r, centre c), from polar angle `top` down by `span`, with a
 *  gap of `gap` radians either side of the face. */
function hairShell(r, c, top, span, gap) {
  return new SphereGeometry(1, 16, 8, Math.PI / 2 + gap, TAU - gap * 2, top, span).scale(...r).translate(...c);
}

/** A person's look, from their name. */
function lookFor(name) {
  const random = rng(hashString(name || "wanderer"));
  const pick = (list) => list[Math.floor(random() * list.length)];
  const frame = random(); // 0: narrow shoulders and wider hips … 1: broad shoulders and narrow hips
  const skin = pick(SKIN);
  return {
    height: 0.93 + random() * 0.13,
    shoulders: 0.9 + frame * 0.22,
    hips: 1.1 - frame * 0.18 + (random() - 0.5) * 0.06,
    girth: 0.94 + random() * 0.2,
    skin,
    lips: new Color(skin).lerp(new Color(0x9c4a44), 0.4).getHex(),
    hair: pick(HAIR),
    eyes: pick(EYES),
    hairstyle: pick(HAIRSTYLES),
    fringe: random() < 0.5,
    shirt: new Color().setHSL(random(), 0.3 + random() * 0.3, 0.35 + random() * 0.25).getHex(),
    lower: new Color().setHSL(random(), 0.15 + random() * 0.25, 0.2 + random() * 0.2).getHex(),
    outfit: pick(OUTFITS),
    longSleeves: random() < 0.55,
    shoes: pick(SHOES),
    seed: hashString(`${name}:motion`),
  };
}

/** The skeleton in a T-pose, in metres, before the person's height is applied: [bone, parent, x, y, z]. */
function jointsFor(look) {
  const sx = 0.17 * look.shoulders;
  const hx = 0.09 * look.hips;
  const joints = [
    ["hips", null, 0, 0.94, 0],
    ["spine", "hips", 0, 1.04, 0],
    ["chest", "spine", 0, 1.22, 0],
    ["neck", "chest", 0, 1.45, 0],
    ["head", "neck", 0, 1.54, 0],
  ];
  for (const [side, sign] of [
    ["left", 1],
    ["right", -1],
  ]) {
    joints.push(
      [`${side}UpperArm`, "chest", sign * sx, 1.41, 0],
      [`${side}LowerArm`, `${side}UpperArm`, sign * (sx + 0.27), 1.41, 0],
      [`${side}Hand`, `${side}LowerArm`, sign * (sx + 0.5), 1.41, 0],
      [`${side}UpperLeg`, "hips", sign * hx, 0.9, 0],
      [`${side}LowerLeg`, `${side}UpperLeg`, sign * hx, 0.49, 0],
      [`${side}Foot`, `${side}LowerLeg`, sign * hx, 0.08, 0],
    );
  }
  return joints;
}

/** Every part of the body as [bone, colour, geometry], in the T-pose's own space. */
function partsFor(look) {
  const { shoulders: s, hips: h, girth: g } = look;
  const sx = 0.17 * s;
  const hx = 0.09 * h;
  const bareLegs = look.outfit !== "trousers";
  const skirt = look.outfit === "skirt" || look.outfit === "dress";
  const parts = [
    // Body
    ["hips", skirt && look.outfit === "dress" ? look.shirt : look.lower, blob(0.15 * h, 0.085, 0.1 * g, 0, 0.95, 0)],
    ["spine", look.shirt, new CylinderGeometry(0.135 * g, 0.145 * h, 0.24, 12).scale(1, 1, 0.72).translate(0, 1.08, 0)],
    ["chest", look.shirt, new CylinderGeometry(0.165 * s, 0.135 * g, 0.26, 12).scale(1, 1, 0.68).translate(0, 1.27, 0)],
    ["chest", look.shirt, blob(0.19 * s, 0.07, 0.1, 0, 1.39, 0)],
    ["neck", look.skin, capsule(0.045, [0, 1.4, 0], [0, 1.57, 0])],
    // Head and face
    ["head", look.skin, blob(0.098, 0.118, 0.108, 0, 1.64, 0.005)],
    ["head", look.skin, blob(0.014, 0.026, 0.012, 0.097, 1.635, 0)],
    ["head", look.skin, blob(0.014, 0.026, 0.012, -0.097, 1.635, 0)],
    ["head", new Color(look.skin).multiplyScalar(0.94).getHex(), blob(0.014, 0.022, 0.016, 0, 1.625, 0.112)],
    ["head", look.lips, blob(0.022, 0.005, 0.006, 0, 1.592, 0.101)],
  ];
  for (const x of [0.036, -0.036]) {
    parts.push(
      ["head", 0xf4f1ea, blob(0.019, 0.013, 0.008, x, 1.645, 0.1)],
      ["head", look.eyes, blob(0.01, 0.011, 0.006, x, 1.644, 0.106)],
      ["head", look.hair, blob(0.024, 0.006, 0.008, x * 1.03, 1.672, 0.103)],
    );
  }
  // Hair: a cap over the crown, then whatever hangs below it.
  const r = [0.108, 0.13, 0.12];
  const c = [0, 1.675, -0.006];
  if (look.hairstyle === "buzz") {
    parts.push(["head", look.hair, hairShell([0.102, 0.124, 0.114], [0, 1.668, 0], 0, Math.PI * 0.62, 0.95)]);
  } else {
    parts.push(["head", look.hair, hairShell(r, c, 0, Math.PI / 2, 0)]);
    const drop = { short: 0.45, bob: 0.95, long: 1.15, ponytail: 0.45, bun: 0.45 }[look.hairstyle];
    parts.push(["head", look.hair, hairShell(r, c, Math.PI / 2, drop, 1)]);
    if (look.fringe) parts.push(["head", look.hair, blob(0.085, 0.028, 0.03, 0, 1.69, 0.096)]);
    if (look.hairstyle === "long") parts.push(["head", look.hair, blob(0.1, 0.17, 0.045, 0, 1.5, -0.075)]);
    if (look.hairstyle === "ponytail") {
      parts.push(["head", look.hair, capsule(0.032, [0, 1.67, -0.13], [0, 1.47, -0.17])]);
    }
    if (look.hairstyle === "bun") parts.push(["head", look.hair, blob(0.055, 0.05, 0.055, 0, 1.73, -0.085)]);
  }
  for (const [side, sign] of [
    ["left", 1],
    ["right", -1],
  ]) {
    const x = (offset) => sign * (sx + offset);
    parts.push(
      // Arms: palms face down in the T-pose, thumbs forward.
      [`${side}UpperArm`, look.shirt, capsule(0.043 * g, [x(0), 1.41, 0], [x(0.27), 1.41, 0])],
      [
        `${side}LowerArm`,
        look.longSleeves ? look.shirt : look.skin,
        capsule(0.036, [x(0.27), 1.41, 0], [x(0.49), 1.41, 0]),
      ],
      [`${side}Hand`, look.skin, blob(0.055, 0.022, 0.042, x(0.555), 1.405, 0.005)],
      [`${side}Hand`, look.skin, blob(0.018, 0.014, 0.03, x(0.53), 1.405, 0.035)],
      // Legs and shoes
      [`${side}LowerLeg`, bareLegs ? look.skin : look.lower, capsule(0.052, [sign * hx, 0.49, 0], [sign * hx, 0.1, 0])],
      [`${side}Foot`, look.shoes, blob(0.052, 0.045, 0.115, sign * hx, 0.045, 0.04)],
    );
    // Thighs: in trousers, bare under a skirt, or shorts to mid-thigh.
    const thigh = (hex, radius, top, bottom) =>
      parts.push([`${side}UpperLeg`, hex, capsule(radius * g, [sign * hx, top, 0], [sign * hx, bottom, 0])]);
    if (skirt) thigh(look.skin, 0.068, 0.9, 0.49);
    else if (look.outfit === "shorts") {
      thigh(look.lower, 0.074, 0.92, 0.7);
      thigh(look.skin, 0.066, 0.7, 0.49);
    } else thigh(look.lower, 0.074, 0.92, 0.49);
  }
  if (skirt) {
    const colour = look.outfit === "dress" ? look.shirt : look.lower;
    parts.push(["hips", colour, new CylinderGeometry(0.155 * h, 0.27, 0.44, 14, 1, true).translate(0, 0.76, 0)]);
  }
  return parts;
}

/** The built-in person for `name`, walking like any other humanoid. */
export function createFigure(name = "") {
  const look = lookFor(name);
  const joints = jointsFor(look);
  const bones = {};
  const list = [];
  for (const [boneName, parent, x, y, z] of joints) {
    const bone = new Bone();
    bone.name = boneName;
    const base = parent ? joints.find(([other]) => other === parent) : null;
    bone.position.set(x - (base?.[2] ?? 0), y - (base?.[3] ?? 0), z - (base?.[4] ?? 0));
    if (parent) bones[parent].add(bone);
    bones[boneName] = bone;
    list.push(bone);
  }
  const index = new Map(list.map((bone, i) => [bone.name, i]));
  const geometry = mergeGeometries(
    partsFor(look).map(([bone, hex, part]) => {
      // A head a touch larger than life reads better from the camera's distance; it grows from the chin.
      if (bone === "head") part.translate(0, -CHIN, 0).scale(HEAD, HEAD, HEAD).translate(0, CHIN, 0);
      return bound(part, hex, index.get(bone));
    }),
  );
  const mesh = new SkinnedMesh(geometry, new MeshLambertMaterial({ vertexColors: true, side: DoubleSide }));
  mesh.frustumCulled = false; // a skinned mesh's bounds don't follow the pose
  mesh.add(bones.hips);

  const rig = new Group();
  rig.add(mesh);
  rig.updateMatrixWorld(true);
  mesh.bind(new Skeleton(list));
  const humanoid = new VRMHumanoid(Object.fromEntries(list.map((bone) => [bone.name, { node: bone }])));
  rig.add(humanoid.normalizedHumanBonesRoot);
  rig.scale.setScalar(look.height);

  const object = new Group();
  object.add(rig);
  return humanoidCharacter({
    object,
    humanoid,
    afterPose: () => humanoid.update(),
    dispose: () => disposeTree(object),
    seed: look.seed,
  });
}
