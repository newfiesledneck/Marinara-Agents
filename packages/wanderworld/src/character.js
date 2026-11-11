// Bodies that walk. Each character is { object, update(dt, speed, options), dispose() }: `object` faces +z
// and stands on y = 0, and `update` moves it for a frame in which it travelled at `speed` metres per
// second (options as motion.js takes them). `update` returns { footstep, running } for footstep sounds.
//
// Every body is a three-vrm humanoid, moved by motion.js on its normalized humanoid bones: a model in any
// of the Engine's 3D avatar formats (loaded by models.js), or the built-in person (figure.js).
import {
  BoxGeometry,
  CanvasTexture,
  ConeGeometry,
  CylinderGeometry,
  Euler,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  PlaneGeometry,
  Quaternion,
  SphereGeometry,
  TorusGeometry,
  Vector3,
} from "three";
import { createClipPlayer } from "./clips.js";
import { createMotion } from "./motion.js";

/** "recorded" plays the recorded clips (clips.js); "builtin" the hand-made motion (motion.js). */
let animationStyle = "recorded";
export function setAnimationStyle(style) {
  animationStyle = style === "builtin" ? "builtin" : "recorded";
}
const WAVE_BONES = ["rightUpperArm", "rightLowerArm", "rightHand"];
const LOW_ACTS = new Set(["ground", "lie", "tend", "ride"]);

/**
 * Things held in a hand while something is done with them: a hammer at the anvil, a mug to drink
 * from. Each is a few plain shapes, made once and shared (so never disposed: `userData.sharedShadow`
 * keeps disposeTree off them), laid out for a hand at rest in the T-pose: the grip at the origin, the
 * thing reaching out the thumb's side (+z).
 */
const HELD_FOR = { hammer: "hammer", drink: "mug", tend: "trowel" };
/** In an act of several clips, what each clip is done with (the farm: cutting, sowing, watering). */
const HELD_FOR_PART = { harvest: "sickle", plant: "basket", water: "can" };
/** Which hand each is held in (the drinking clip lifts the left). */
const HELD_HAND = {
  hammer: "right",
  mug: "left",
  sickle: "right",
  basket: "left",
  can: "right",
  trowel: "right",
  staff: "right",
  sword: "right",
};
let heldParts = null;
function heldThing(name) {
  if (!heldParts) {
    const part = (geometry, hex) => {
      const mesh = new Mesh(geometry, new MeshLambertMaterial({ color: hex, flatShading: true }));
      mesh.userData.sharedShadow = true;
      return mesh;
    };
    const along = (geometry) => geometry.rotateX(Math.PI / 2); // a cylinder's length along z
    heldParts = {
      hammer: [
        part(along(new CylinderGeometry(0.014, 0.016, 0.34, 6)).translate(0, 0, 0.1), 0x6b4a2f),
        part(new BoxGeometry(0.11, 0.05, 0.055).translate(0, 0, 0.27), 0x3a3d40),
      ],
      // A sickle: a short handle and a curved blade (a part of a ring) at its end.
      sickle: [
        part(along(new CylinderGeometry(0.014, 0.016, 0.16, 6)).translate(0, 0, 0.03), 0x6b4a2f),
        part(
          new TorusGeometry(0.09, 0.008, 4, 10, Math.PI * 1.1).rotateY(Math.PI / 2).translate(0, 0.09, 0.11),
          0x9aa0a6,
        ),
      ],
      // A seed basket, carried by its rim: wider at the top, hanging below the hand.
      basket: [
        part(new CylinderGeometry(0.11, 0.08, 0.1, 10, 1, true).translate(0, -0.09, 0.02), 0xa9824f),
        part(new CylinderGeometry(0.08, 0.08, 0.01, 10).translate(0, -0.135, 0.02), 0x8a6a3f),
        part(new CylinderGeometry(0.1, 0.1, 0.01, 10).translate(0, -0.07, 0.02), 0xd9c27a),
      ],
      // A watering can: its body below the hand, the spout reaching forward and up.
      can: [
        part(new CylinderGeometry(0.06, 0.065, 0.13, 10).translate(0, -0.08, 0.02), 0x6f7d86),
        part(
          along(new CylinderGeometry(0.012, 0.016, 0.17, 6))
            .rotateX(-0.6)
            .translate(0, -0.05, 0.14),
          0x6f7d86,
        ),
        part(
          along(new CylinderGeometry(0.03, 0.012, 0.025, 8))
            .rotateX(-0.6)
            .translate(0, -0.005, 0.215),
          0x59656d,
        ),
      ],
      // A trowel: a handle and a small pointed blade.
      trowel: [
        part(along(new CylinderGeometry(0.013, 0.015, 0.11, 6)).translate(0, 0, 0.01), 0x6b4a2f),
        part(
          along(new ConeGeometry(0.035, 0.12, 4))
            .scale(1, 0.25, 1)
            .translate(0, 0, 0.13),
          0x9aa0a6,
        ),
      ],
      // A staff, carried upright at the side: its length lies along the arm (x), a knob at its top.
      staff: [
        part(new CylinderGeometry(0.016, 0.02, 1.55, 6).rotateZ(Math.PI / 2).translate(0.05, 0, 0.05), 0x5a3d24),
        part(new SphereGeometry(0.05, 8, 6).translate(0.85, 0, 0.05), 0x7fd4e8),
      ],
      // A short sword: a grip, a guard and a blade out the thumb's side.
      sword: [
        part(along(new CylinderGeometry(0.014, 0.014, 0.12, 6)).translate(0, 0, 0), 0x3b2a1c),
        part(new BoxGeometry(0.11, 0.02, 0.02).translate(0, 0, 0.07), 0x8a8f96),
        part(new BoxGeometry(0.035, 0.01, 0.56).translate(0, 0, 0.36), 0xb9c0c8),
      ],
      mug: [
        part(along(new CylinderGeometry(0.042, 0.038, 0.11, 8)).translate(0, 0, 0.03), 0x8a6440),
        part(along(new CylinderGeometry(0.044, 0.044, 0.012, 8)).translate(0, 0, 0.07), 0x3a3d40),
        part(along(new CylinderGeometry(0.03, 0.03, 0.004, 8)).translate(0, 0, 0.086), 0xe8dcc0),
      ],
    };
  }
  const group = new Group();
  for (const mesh of heldParts[name]) group.add(mesh.clone());
  return group;
}
/** A pointed hat's two shapes, by colour: made once and shared, as the things held are. */
const hatParts = new Map();
/** How far above the head bone (the base of the skull) a hat's brim sits, in metres. */
const HAT_UP = 0.2;
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
      // Textures shared by many people (the default people's kit) stay loaded.
      for (const value of Object.values(material)) if (value?.isTexture && !value.userData.shared) value.dispose();
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
  // What's in hand (a hammer, a mug), by what the body is doing; a drink taken as a gesture
  // keeps its mug for as long as the drinking takes.
  let held = null;
  let heldName = null;
  let sipping = 0;
  function hold(name) {
    if (name === heldName) return;
    held?.removeFromParent();
    heldName = name;
    held = null;
    const side = HELD_HAND[name] === "left" ? -1 : 1; // the left hand lies the other way along x
    const hand = name && bone(`${HELD_HAND[name]}Hand`);
    if (!hand) return;
    held = heldThing(name);
    // In the hand's own space: a little way into the palm, turned with the rig, at the model's own size.
    held.position.set(-0.075 * side * unit * mirror, -0.025 * unit, 0.01 * unit * mirror);
    held.rotation.y = mirror < 0 ? Math.PI : 0;
    held.scale.setScalar(unit);
    hand.add(held);
  }
  return {
    object,
    /** Puts a pointed hat of `colour` on their head (a witch's, a wizard's): a brim and a cone. */
    wear(colour) {
      const head = bone("head");
      if (!head) return;
      if (!hatParts.has(colour)) {
        const material = new MeshLambertMaterial({ color: colour, flatShading: true });
        const parts = [
          new Mesh(new CylinderGeometry(0.21, 0.21, 0.015, 12), material),
          new Mesh(new ConeGeometry(0.115, 0.36, 10).translate(0, 0.18, 0), material),
        ];
        for (const mesh of parts) mesh.userData.sharedShadow = true; // (made once, for everyone in that colour)
        hatParts.set(colour, parts);
      }
      const hat = new Group();
      for (const mesh of hatParts.get(colour)) hat.add(mesh.clone());
      hat.position.set(0, HAT_UP * unit, 0.01 * unit * mirror);
      hat.rotation.x = -0.12 * mirror; // tipped back a little
      hat.scale.setScalar(unit);
      head.add(hat);
    },
    update(dt, speed, options) {
      if (options?.gesture === "drink") sipping = 1.3;
      sipping = Math.max(0, sipping - dt);
      // The hand-made motion has nothing for the acts (clips.js): low ones it sits for, the rest it stands.
      const low = animationStyle !== "recorded" && LOW_ACTS.has(options?.act);
      const pose = motion(dt, speed, low ? { ...options, sit: true } : options);
      // (`carry`: something they always have in hand, a wizard's staff, unless busy with something else.)
      const carried = HELD_HAND[options?.carry] ? options.carry : null;
      if (animationStyle !== "recorded") hold(sipping > 0 ? "mug" : (HELD_FOR[options?.act] ?? carried));
      if (animationStyle === "recorded") {
        const clip = player(dt, speed, options);
        hold(sipping > 0 ? "mug" : (HELD_FOR_PART[clip.part] ?? HELD_FOR[options?.act] ?? carried));
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
/**
 * The Engine's character folders (its character groups), as [{ id, name, memberIds }]; empty when they
 * can't be read.
 */
export async function listCharacterFolders() {
  return rows(await getJson("/api/characters/groups/list"))
    .filter((row) => typeof row?.id === "string" && row.id)
    .map((row) => {
      let members = row.characterIds;
      if (typeof members === "string") {
        try {
          members = JSON.parse(members);
        } catch {
          members = [];
        }
      }
      return {
        id: row.id,
        name: typeof row.name === "string" && row.name.trim() ? row.name.trim() : "Folder",
        memberIds: Array.isArray(members) ? members.filter((id) => typeof id === "string") : [],
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function listCharacters() {
  return rows(await getJson("/api/characters"))
    .filter((row) => typeof row?.id === "string" && row.id)
    .map((row) => ({ id: row.id, name: cardName(row) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
