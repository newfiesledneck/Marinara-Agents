// Bodies that walk. Each character is { object, update(dt, speed, options), dispose() }: `object` faces +z
// and stands on y = 0, and `update` moves it for a frame in which it travelled at `speed` metres per
// second (options as motion.js takes them). `update` returns { footstep, running } for footstep sounds.
//
// Every body is a three-vrm humanoid, moved by motion.js on its normalized humanoid bones: a model in any
// of the Engine's 3D avatar formats (loaded by models.js), or the built-in person (figure.js).
import { CanvasTexture, Euler, Mesh, MeshBasicMaterial, PlaneGeometry, Quaternion, Vector3 } from "three";
import { createClipPlayer } from "./clips.js";
import { createMotion } from "./motion.js";

/** "recorded" plays the recorded clips (clips.js); "builtin" the hand-made motion (motion.js). */
let animationStyle = "recorded";
export function setAnimationStyle(style) {
  animationStyle = style === "builtin" ? "builtin" : "recorded";
}
const WAVE_BONES = ["rightUpperArm", "rightLowerArm", "rightHand"];
const overlay = new Quaternion();
const overlayEuler = new Euler(0, 0, 0, "YXZ");

let shadowParts = null;
/** A soft dark patch on the ground under someone, so they stand on it instead of floating. Shared
 *  geometry and material (never disposed: every shadow in the page uses them). */
export function blobShadow() {
  if (!shadowParts) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 64;
    const context = canvas.getContext("2d");
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(0,0,0,0.45)");
    gradient.addColorStop(0.6, "rgba(0,0,0,0.25)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);
    shadowParts = {
      geometry: new PlaneGeometry(0.9, 0.9).rotateX(-Math.PI / 2),
      material: new MeshBasicMaterial({
        map: new CanvasTexture(canvas),
        transparent: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
      }),
    };
  }
  const mesh = new Mesh(shadowParts.geometry, shadowParts.material);
  mesh.position.y = 0.06; // above the roads and paving
  mesh.renderOrder = 1;
  mesh.userData.sharedShadow = true;
  return mesh;
}

export function disposeTree(root) {
  root.traverse((object) => {
    if (object.userData.sharedShadow) return;
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
 * Moves a three-vrm humanoid with motion.js: walking, running and standing.
 * - `afterPose(dt)` applies the normalized pose to the model (vrm.update, or humanoid.update for a
 *   humanoid built from a GLB, FBX or MMD skeleton, or the built-in person).
 * - `mirror` is -1 for a rig that faces -z in its own bone space (VRM 0.x, and skeletons turned round to
 *   face +z): x and z rotations and offsets flip there.
 * - `blink(amount)` closes the eyes, for models that have a blink expression.
 * - `seed` gives the body its own habits (breathing, weight shifts, glances).
 */
const spanA = new Vector3();
const spanB = new Vector3();

export function humanoidCharacter({ object, humanoid, afterPose, dispose, mirror = 1, blink, seed }) {
  const cache = new Map();
  const bone = (name) => {
    if (!cache.has(name)) {
      const node = humanoid?.getNormalizedBoneNode(name) ?? null;
      // Turn first, then bend: a thigh can undo the hips' turn before it swings, so the foot keeps to
      // its line. Bones that never turn (y = 0) pose the same in either order.
      if (node) node.rotation.order = "YXZ";
      cache.set(name, node);
    }
    return cache.get(name);
  };
  const hips = bone("hips");
  const rest = hips?.position.clone();
  // Leg lengths in metres, measured in the world: a model's own units can be anything (MMD's are 8 cm),
  // and strides have to match the metres the body really walks. `unit` turns metres back into the model's
  // own units for moving its hips.
  object.updateMatrixWorld(true);
  const span = (a, b) => {
    const from = bone(a);
    const to = bone(b);
    return from && to ? from.getWorldPosition(spanA).distanceTo(to.getWorldPosition(spanB)) : 0;
  };
  const upperLeg = span("leftUpperLeg", "leftLowerLeg") || 0.42;
  const unit = (bone("leftLowerLeg")?.position.length() || upperLeg) / upperLeg;
  const lowerLeg = span("leftLowerLeg", "leftFoot") || 0.42;
  const player = createClipPlayer({
    present: (name) => !!bone(name),
    // Normalized bones rest with no turn, so a bone's position is its offset from its parent; in metres.
    offset: (name) => bone(name).position.clone().divideScalar(unit),
    legLength: upperLeg + lowerLeg,
  });
  const motion = createMotion({
    upperLeg,
    lowerLeg,
    hipWidth: span("leftUpperLeg", "rightUpperLeg") / 2 || 0.09,
    seed: seed ?? Math.floor(Math.random() * 2 ** 32),
  });
  return {
    object,
    update(dt, speed, options) {
      const pose = motion(dt, speed, options);
      if (animationStyle === "recorded") {
        const clip = player(dt, speed, options);
        for (const [name, local] of clip.locals) {
          const node = bone(name);
          node.quaternion.copy(local);
          if (mirror < 0) node.quaternion.set(-local.x, local.y, -local.z, local.w);
        }
        // On top: the hand-made wave (the clips have none) and turning the head to look at someone.
        if (pose.waving > 0.01) {
          for (const name of WAVE_BONES) {
            const [x, y, z] = pose.bones[name];
            overlay.setFromEuler(overlayEuler.set(x * mirror, y, z * mirror));
            bone(name)?.quaternion.slerp(overlay, pose.waving);
          }
        }
        if (Math.abs(pose.lookYaw) > 0.001) {
          bone("neck")?.quaternion.multiply(overlay.setFromEuler(overlayEuler.set(0, pose.lookYaw * 0.4, 0)));
          bone("head")?.quaternion.multiply(overlay.setFromEuler(overlayEuler.set(0, pose.lookYaw * 0.6, 0)));
        }
        if (hips && rest) {
          const [x, y, z] = clip.hips;
          hips.position.set(rest.x + x * unit * mirror, rest.y + y * unit, rest.z + z * unit * mirror);
        }
        blink?.(pose.blink);
        afterPose(dt);
        return { ...pose, footstep: clip.footstep, running: clip.running };
      }
      for (const [name, [x, y, z]] of Object.entries(pose.bones)) bone(name)?.rotation.set(x * mirror, y, z * mirror);
      if (hips && rest) {
        const [x, y, z] = pose.hips;
        hips.position.set(rest.x + x * unit * mirror, rest.y + y * unit, rest.z + z * unit * mirror);
      }
      blink?.(pose.blink);
      afterPose(dt);
      return pose;
    },
    dispose,
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
