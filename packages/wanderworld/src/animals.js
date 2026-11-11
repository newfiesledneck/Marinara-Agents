// Animals: four-legged bodies from Quaternius's Ultimate Animated Animals (CC0), made by
// scripts/build-wanderworld-animals.mjs into kit/animals/, served as package assets and loaded when a
// world has one of that kind (then cached). A second kind of body beside the people's humanoid one
// (character.js): each animal has its own skeleton and its own few animations (standing, looking about,
// grazing, walking, galloping), played here by its own small player.
//
// An animal is { object, update(dt, speed, { graze }), dispose(), kind, height, back }: `object` faces
// +z and stands on y = 0, in metres; `update` moves it for a frame in which it travelled at `speed`
// metres a second; `back` is how high a rider sits (a horse, a donkey), in metres.
import {
  Bone,
  BufferAttribute,
  BufferGeometry,
  Group,
  Matrix4,
  MeshLambertMaterial,
  Quaternion,
  Skeleton,
  SkinnedMesh,
} from "three";

const BASE = "/api/capability-packages/wanderworld/assets/kit/animals/";

/**
 * What the game knows of each kind: how fast it walks and gallops (metres a second, the pace its clips
 * are played at: feet keep to the ground near these), how high the top of its back is where a rider sits (measured on the posed model; 0: not ridden),
 * how far along its back from its middle the rider sits, and whether it runs from people.
 */
export const ANIMALS = {
  horse: { walk: 1.7, gallop: 7.5, back: 1.62, seat: -0.05, timid: false },
  "horse-white": { walk: 1.7, gallop: 7.5, back: 1.62, seat: -0.05, timid: false },
  donkey: { walk: 1.3, gallop: 5.5, back: 1.2, seat: -0.05, timid: false },
  cow: { walk: 1.0, gallop: 4.5, back: 0, seat: 0, timid: false },
  bull: { walk: 1.0, gallop: 4.8, back: 0, seat: 0, timid: false },
  alpaca: { walk: 1.1, gallop: 5, back: 0, seat: 0, timid: false },
  deer: { walk: 1.2, gallop: 7, back: 0, seat: 0, timid: true },
  stag: { walk: 1.2, gallop: 7, back: 0, seat: 0, timid: true },
  wolf: { walk: 1.3, gallop: 6.5, back: 0, seat: 0, timid: true },
  fox: { walk: 1.0, gallop: 5.5, back: 0, seat: 0, timid: true },
  husky: { walk: 1.2, gallop: 5.5, back: 0, seat: 0, timid: false },
  shiba: { walk: 1.0, gallop: 5, back: 0, seat: 0, timid: false },
};

const files = new Map();
function load(name) {
  if (!files.has(name)) {
    files.set(
      name,
      fetch(`${BASE}${name}.json`).then((response) => {
        if (!response.ok) throw new Error(`GET kit/animals/${name}.json → ${response.status}`);
        return response.json();
      }),
    );
  }
  return files.get(name);
}

const bytes = (base64) => Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
const view = (Type, base64) => {
  const raw = bytes(base64);
  return new Type(raw.buffer, raw.byteOffset, raw.byteLength / Type.BYTES_PER_ELEMENT);
};

// Each kind's geometry, material and clips are made once and shared by every animal of that kind.
const kinds = new Map();
function partsOf(name, data) {
  if (kinds.has(name)) return kinds.get(name);
  const mesh = data.mesh;
  const packed = view(Int16Array, mesh.position);
  const position = new Float32Array(packed.length);
  for (let i = 0; i < packed.length; i++) {
    const axis = i % 3;
    position[i] = mesh.box[axis] + ((packed[i] + 32768) / 65535) * (mesh.box[axis + 3] - mesh.box[axis]);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(position, 3));
  geometry.setAttribute(
    "normal",
    new BufferAttribute(
      Float32Array.from(view(Int8Array, mesh.normal), (value) => value / 127),
      3,
    ),
  );
  geometry.setAttribute("color", new BufferAttribute(view(Uint8Array, mesh.colour), 3, true));
  geometry.setAttribute("skinIndex", new BufferAttribute(Uint16Array.from(view(Uint8Array, mesh.joints)), 4));
  geometry.setAttribute(
    "skinWeight",
    new BufferAttribute(
      Float32Array.from(view(Uint8Array, mesh.weights), (value) => value / 255),
      4,
    ),
  );
  geometry.setIndex(new BufferAttribute(mesh.wide ? view(Uint32Array, mesh.index) : view(Uint16Array, mesh.index), 1));
  geometry.computeBoundingSphere();
  geometry.userData.shared = true;
  const material = new MeshLambertMaterial({ vertexColors: true, flatShading: true });
  material.userData.shared = true;
  const clips = Object.fromEntries(
    Object.entries(data.clips).map(([key, clip]) => [key, { ...clip, turns: view(Int16Array, clip.turns) }]),
  );
  const parts = { geometry, material, clips };
  kinds.set(name, parts);
  return parts;
}

const ease = (current, target, dt, seconds) => current + (target - current) * (1 - Math.exp(-dt / seconds));
const scratch = new Quaternion();
const next = new Quaternion();

/** The animal `name` (a key of ANIMALS), as a body that walks. Rejects if the kit can't be loaded. */
export async function createAnimal(name) {
  const kind = ANIMALS[name] ? name : "deer";
  const data = await load(kind);
  const { geometry, material, clips } = partsOf(kind, data);
  const count = data.bones.length;

  const root = new Group();
  const rig = new Group();
  rig.scale.setScalar(data.scale);
  root.add(rig);
  const bones = data.bones.map((boneName, i) => {
    const bone = new Bone();
    bone.name = boneName;
    const at = i * 10;
    bone.position.fromArray(data.rest, at);
    bone.quaternion.fromArray(data.rest, at + 3);
    bone.scale.fromArray(data.rest, at + 7);
    return bone;
  });
  bones.forEach((bone, i) => (data.parents[i] >= 0 ? bones[data.parents[i]] : rig).add(bone));
  const inverses = bones.map((_, i) => new Matrix4().fromArray(data.inverseBind, i * 16));
  const skinned = new SkinnedMesh(geometry, material);
  skinned.frustumCulled = false;
  rig.add(skinned);
  root.updateMatrixWorld(true);
  // Its vertices are stored where they stand at rest, so it binds as it is.
  skinned.bind(new Skeleton(bones, inverses), new Matrix4());

  /** Poses the bones as `clip` has them at `t` (0…1 through it), blended in by `amount` over what's there. */
  function pose(clip, t, amount) {
    if (amount <= 0) return;
    const position = Math.min(0.999999, Math.max(0, t)) * (clip.frames - 1);
    const frame = Math.floor(position);
    const mix = position - frame;
    const after = Math.min(clip.frames - 1, frame + 1);
    for (let i = 0; i < count; i++) {
      scratch.fromArray(clip.turns, (frame * count + i) * 4);
      next.fromArray(clip.turns, (after * count + i) * 4);
      scratch.slerp(next, mix).normalize();
      if (amount >= 1) bones[i].quaternion.copy(scratch);
      else bones[i].quaternion.slerp(scratch, amount);
      const places = clip.places[i];
      if (places) {
        const [a, b] = [frame * 3, after * 3];
        const x = places[a] + (places[b] - places[a]) * mix;
        const y = places[a + 1] + (places[b + 1] - places[a + 1]) * mix;
        const z = places[a + 2] + (places[b + 2] - places[a + 2]) * mix;
        if (amount >= 1) bones[i].position.set(x, y, z);
        else {
          bones[i].position.x += (x - bones[i].position.x) * amount;
          bones[i].position.y += (y - bones[i].position.y) * amount;
          bones[i].position.z += (z - bones[i].position.z) * amount;
        }
      }
    }
  }

  const facts = ANIMALS[kind];
  const body = data.bones.indexOf("Body"); // the bone its leap lifts
  let idleTime = Math.random() * 10;
  let stride = Math.random(); // through the walk or gallop, 0…1
  let moving = 0;
  let running = 0;
  let grazing = 0;
  let looking = 0;
  let lookUntil = 0;
  let leaping = 0;
  let leapAt = 0;

  /** `jump`: how far through a leap it is (0…1), or null on the ground (only the ridden kinds leap). */
  function update(dt, speed = 0, { graze = false, jump = null } = {}) {
    dt = Math.min(0.1, Math.max(0, Number.isFinite(dt) ? dt : 0));
    speed = Math.max(0, Number.isFinite(speed) ? speed : 0);
    idleTime += dt;
    moving = ease(moving, speed > 0.08 ? 1 : 0, dt, 0.18);
    // Walking turns into galloping between the two paces.
    const between = (speed - facts.walk * 1.5) / Math.max(0.1, facts.gallop * 0.6 - facts.walk * 1.5);
    running = ease(running, Math.min(1, Math.max(0, between)), dt, 0.2);
    grazing = ease(grazing, graze && speed < 0.08 ? 1 : 0, dt, 0.5);
    // Standing, now and then it looks about for a while.
    if (idleTime > lookUntil + 6 + (idleTime % 5)) lookUntil = idleTime + clips.look.duration;
    looking = ease(looking, idleTime < lookUntil && !graze ? 1 : 0, dt, 0.4);

    // From rest each frame: a clip moves only some bones about, and the rest stay where they belong.
    for (let i = 0; i < count; i++) bones[i].position.fromArray(data.rest, i * 10);
    pose(clips.idle, (idleTime / clips.idle.duration) % 1, 1);
    pose(clips.look, (idleTime / clips.look.duration) % 1, looking);
    pose(clips.graze, (idleTime / clips.graze.duration) % 1, grazing);
    if (moving > 0.01) {
      // Each gait at the rate that matches the ground covered at its own pace.
      const walkRate = Math.max(0.5, speed / facts.walk) / clips.walk.duration;
      const gallopRate = Math.max(0.6, speed / facts.gallop) / clips.gallop.duration;
      stride = (stride + dt * (walkRate * (1 - running) + gallopRate * running)) % 1;
      pose(clips.walk, stride, moving * (1 - running));
      pose(clips.gallop, stride, moving * running);
    }
    if (clips.jump) {
      if (jump !== null) leapAt = jump;
      leaping = ease(leaping, jump === null ? 0 : 1, dt, 0.07);
      pose(clips.jump, leapAt, leaping);
    }
  }
  update(0);

  return {
    object: root,
    kind,
    /** Metres from the ground to its back where a rider sits (0: nobody rides this one), and how far along. */
    back: facts.back,
    seat: facts.seat,
    update,
    /** How far its back is above (or below) where it stands, `t` of the way through its leap (metres). */
    rise(t) {
      const places = clips.jump?.places[body];
      if (!places) return 0;
      const at = Math.min(0.999999, Math.max(0, t)) * (clips.jump.frames - 1);
      const frame = Math.floor(at);
      const y = places[frame * 3 + 1] + (places[frame * 3 + 4] - places[frame * 3 + 1]) * (at - frame);
      return (y - places[1]) * data.scale;
    },
    dispose() {
      root.removeFromParent();
      skinned.skeleton.dispose();
    },
  };
}
