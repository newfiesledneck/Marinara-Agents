// Bodies that walk. Each character is { object, update(dt, speed), dispose() }: `object` faces +z and
// stands on y = 0, and `update` moves it for a frame in which it travelled at `speed` metres per second.
//
// Every body is a three-vrm humanoid, moved by motion.js on its normalized humanoid bones: a model in any
// of the Engine's 3D avatar formats (loaded by models.js), or the built-in person (figure.js).
import { createMotion } from "./motion.js";

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
 * Moves a three-vrm humanoid with motion.js: walking, running and standing.
 * - `afterPose(dt)` applies the normalized pose to the model (vrm.update, or humanoid.update for a
 *   humanoid built from a GLB, FBX or MMD skeleton, or the built-in person).
 * - `mirror` is -1 for a rig that faces -z in its own bone space (VRM 0.x, and skeletons turned round to
 *   face +z): x and z rotations and offsets flip there.
 * - `blink(amount)` closes the eyes, for models that have a blink expression.
 * - `seed` gives the body its own habits (breathing, weight shifts, glances).
 */
export function humanoidCharacter({ object, humanoid, afterPose, dispose, mirror = 1, blink, seed }) {
  const cache = new Map();
  const bone = (name) => {
    if (!cache.has(name)) cache.set(name, humanoid?.getNormalizedBoneNode(name) ?? null);
    return cache.get(name);
  };
  const hips = bone("hips");
  const rest = hips?.position.clone();
  const length = (name) => bone(name)?.position.length() || 0;
  const motion = createMotion({
    upperLeg: length("leftLowerLeg") || 0.42,
    lowerLeg: length("leftFoot") || 0.42,
    hipWidth: Math.abs(bone("leftUpperLeg")?.position.x ?? 0.09),
    seed: seed ?? Math.floor(Math.random() * 2 ** 32),
  });
  return {
    object,
    update(dt, speed) {
      const pose = motion(dt, speed);
      for (const [name, [x, y, z]] of Object.entries(pose.bones)) bone(name)?.rotation.set(x * mirror, y, z * mirror);
      if (hips && rest) {
        const [x, y, z] = pose.hips;
        hips.position.set(rest.x + x * mirror, rest.y + y, rest.z + z * mirror);
      }
      blink?.(pose.blink);
      afterPose(dt);
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
