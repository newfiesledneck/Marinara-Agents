// Bodies that walk. Each character is { object, update(dt, speed), dispose() }: `object` faces +z and
// stands on y = 0, and `update` animates a walk at `speed` metres per second.
//
// Two kinds: a humanoid model (any of the Engine's 3D avatar formats, loaded by models.js, walked on its
// normalized humanoid bones) and a low-poly figure for anyone without a model.
import { BoxGeometry, Color, Group, Mesh, MeshLambertMaterial, SphereGeometry } from "three";
import { hashString, rng } from "./world.js";

/** Metres covered by one full walk cycle (two steps). Longer strides at speed, as people take: about one
 *  cycle a second at a walk (2.5 m/s) and one and a half at a run (5 m/s). */
const strideAt = (speed) => 1.5 + 0.35 * speed;

/** Walk-cycle angles for a phase and an amount (0 standing, 1 full stride). */
function gait(phase, amount) {
  const swing = Math.sin(phase) * amount;
  return {
    leftLeg: -swing * 0.55,
    rightLeg: swing * 0.55,
    leftKnee: Math.max(0, Math.sin(phase + Math.PI / 2)) * 0.7 * amount,
    rightKnee: Math.max(0, Math.sin(phase - Math.PI / 2)) * 0.7 * amount,
    leftArm: swing * 0.45,
    rightArm: -swing * 0.45,
    bob: Math.abs(Math.cos(phase)) * 0.05 * amount,
  };
}

/** A walk-cycle clock: call it each frame with dt and speed for that frame's pose. */
export function walker() {
  let phase = 0;
  let amount = 0;
  return (dt, speed) => {
    phase += (dt * speed * Math.PI * 2) / strideAt(speed);
    amount += (Math.min(1, speed / 4) - amount) * Math.min(1, dt * 8);
    return gait(phase, amount);
  };
}

export function disposeTree(root) {
  root.traverse((object) => {
    object.geometry?.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) {
      if (!material) continue;
      for (const value of Object.values(material)) if (value?.isTexture) value.dispose();
      material.dispose();
    }
  });
}

/**
 * Walks a three-vrm humanoid: arms lowered from its T-pose and swung, legs swung, knees bent behind.
 * `afterPose(dt)` applies the normalized pose to the model (vrm.update, or humanoid.update for a
 * humanoid built from a GLB, FBX or MMD skeleton).
 */
export function humanoidCharacter({ object, humanoid, afterPose, dispose }) {
  const bone = (name) => humanoid?.getNormalizedBoneNode(name) ?? null;
  const bones = {
    hips: bone("hips"),
    leftUpperLeg: bone("leftUpperLeg"),
    rightUpperLeg: bone("rightUpperLeg"),
    leftLowerLeg: bone("leftLowerLeg"),
    rightLowerLeg: bone("rightLowerLeg"),
    leftUpperArm: bone("leftUpperArm"),
    rightUpperArm: bone("rightUpperArm"),
    leftLowerArm: bone("leftLowerArm"),
    rightLowerArm: bone("rightLowerArm"),
  };
  const hipsHeight = bones.hips?.position.y ?? 0;
  const step = walker();
  return {
    object,
    update(dt, speed) {
      const pose = step(dt, speed);
      if (bones.leftUpperArm) bones.leftUpperArm.rotation.set(pose.leftArm, 0, -1.2);
      if (bones.rightUpperArm) bones.rightUpperArm.rotation.set(pose.rightArm, 0, 1.2);
      if (bones.leftLowerArm) bones.leftLowerArm.rotation.set(0, 0, -0.15);
      if (bones.rightLowerArm) bones.rightLowerArm.rotation.set(0, 0, 0.15);
      if (bones.leftUpperLeg) bones.leftUpperLeg.rotation.x = pose.leftLeg;
      if (bones.rightUpperLeg) bones.rightUpperLeg.rotation.x = pose.rightLeg;
      if (bones.leftLowerLeg) bones.leftLowerLeg.rotation.x = pose.leftKnee;
      if (bones.rightLowerLeg) bones.rightLowerLeg.rotation.x = pose.rightKnee;
      if (bones.hips) bones.hips.position.y = hipsHeight + pose.bob;
      afterPose(dt);
    },
    dispose,
  };
}

// ── Low-poly figure ──────────────────────────────────────────────────────────

const SKIN = [0xf1c9a5, 0xe0ac85, 0xc68863, 0x9a6544, 0x6b4430];
const HAIR = [0x2b1d14, 0x5a3a22, 0x8a5a2b, 0xd9b26a, 0x1c1c1c, 0xa33a2a, 0xc9c9c9];

/** A simple jointed figure, coloured from `name` so each person looks the same every time. */
export function createFigure(name = "") {
  const random = rng(hashString(name || "wanderer"));
  const pick = (list) => list[Math.floor(random() * list.length)];
  const material = (hex) => new MeshLambertMaterial({ color: hex, flatShading: true });
  const skin = material(pick(SKIN));
  const shirt = material(new Color().setHSL(random(), 0.45, 0.45));
  const trousers = material(new Color().setHSL(random(), 0.3, 0.25));
  const hair = material(pick(HAIR));
  const part = (geometry, mat, x, y, z) => {
    const mesh = new Mesh(geometry, mat);
    mesh.position.set(x, y, z);
    return mesh;
  };
  /** A limb hanging from a joint at (x, y), so rotating the joint swings it. */
  const limb = (x, y, length, width, mat) => {
    const joint = new Group();
    joint.position.set(x, y, 0);
    joint.add(part(new BoxGeometry(width, length, width), mat, 0, -length / 2, 0));
    return joint;
  };

  const object = new Group();
  const body = new Group();
  object.add(body);
  body.add(part(new BoxGeometry(0.42, 0.58, 0.24), shirt, 0, 1.2, 0));
  body.add(part(new SphereGeometry(0.17, 8, 6), skin, 0, 1.66, 0));
  body.add(part(new SphereGeometry(0.18, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), hair, 0, 1.69, -0.01));
  body.add(part(new BoxGeometry(0.08, 0.05, 0.05), material(0x2a2a2a), 0, 1.66, 0.16)); // shows which way it faces
  const leftLeg = limb(0.11, 0.9, 0.86, 0.15, trousers);
  const rightLeg = limb(-0.11, 0.9, 0.86, 0.15, trousers);
  const leftArm = limb(0.27, 1.46, 0.62, 0.11, shirt);
  const rightArm = limb(-0.27, 1.46, 0.62, 0.11, shirt);
  body.add(leftLeg, rightLeg, leftArm, rightArm);

  const step = walker();
  return {
    object,
    update(dt, speed) {
      const pose = step(dt, speed);
      leftLeg.rotation.x = pose.leftLeg;
      rightLeg.rotation.x = pose.rightLeg;
      leftArm.rotation.x = pose.leftArm;
      rightArm.rotation.x = pose.rightArm;
      body.position.y = pose.bob;
    },
    dispose() {
      disposeTree(object);
    },
  };
}

// ── The Engine's people ──────────────────────────────────────────────────────

/** Same-origin JSON GET; the Engine's session cookie rides along. Null on any failure. */
export async function getJson(path) {
  try {
    const response = await fetch(path, { headers: { Accept: "application/json" } });
    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
}

const rows = (list) => (Array.isArray(list) ? list : Array.isArray(list?.items) ? list.items : []);

/** The Engine's personas, as [{ id, name }]; empty when the list can't be read. */
export async function listPersonas() {
  return rows(await getJson("/api/characters/personas/list"))
    .filter((persona) => typeof persona?.id === "string" && persona.id)
    .map((persona) => ({
      id: persona.id,
      name: typeof persona.name === "string" && persona.name ? persona.name : "Unnamed",
    }));
}

/** A character card's name: rows keep the card as JSON in `data` (a string or an object). */
function cardName(row) {
  let card = row?.data;
  if (typeof card === "string") {
    try {
      card = JSON.parse(card);
    } catch {
      card = null;
    }
  }
  const name = card?.name ?? card?.data?.name ?? row?.name;
  return typeof name === "string" && name.trim() ? name.trim() : "Unnamed";
}

/** The Engine's characters, as [{ id, name }] sorted by name; empty when the list can't be read. */
export async function listCharacters() {
  return rows(await getJson("/api/characters"))
    .filter((row) => typeof row?.id === "string" && row.id)
    .map((row) => ({ id: row.id, name: cardName(row) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
