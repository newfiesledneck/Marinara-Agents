// Animals: four-legged bodies from Quaternius's Ultimate Animated Animals (CC0), made by
// scripts/build-wanderworld-animals.mjs into kit/creatures/ (a file a group: the farm's and the town's,
// the country's), served as package assets and loaded when a world has one of that group (then cached). A second kind of body beside the people's humanoid one
// (character.js): each animal has its own skeleton and its own few animations (standing, looking about,
// grazing, walking, galloping), played here by its own small player.
//
// A horse or a dog comes in several coats (COATS): the same body, its parts in other colours.
//
// An animal is { object, update(dt, speed, { graze }), dispose(), kind, coat, height, back }: `object` faces
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

const BASE = "/api/capability-packages/wanderworld/assets/kit/creatures/";

/**
 * What the game knows of each kind: how fast it walks and gallops (metres a second, the pace its clips
 * are played at: feet keep to the ground near these), how high the top of its back is where a rider sits (measured on the posed model; 0: not ridden),
 * how far along its back from its middle the rider sits, whether it runs from people, and which of the
 * kit's files it's in (`group`).
 */
export const ANIMALS = {
  horse: { group: "farm", walk: 1.7, gallop: 7.5, back: 1.62, seat: -0.05, timid: false },
  donkey: { group: "farm", walk: 1.3, gallop: 5.5, back: 1.2, seat: -0.05, timid: false },
  cow: { group: "farm", walk: 1.0, gallop: 4.5, back: 0, seat: 0, timid: false },
  bull: { group: "farm", walk: 1.0, gallop: 4.8, back: 0, seat: 0, timid: false },
  alpaca: { group: "farm", walk: 1.1, gallop: 5, back: 0, seat: 0, timid: false },
  // (A dog big enough is ridden: `rideFrom` is the size, as a multiple of its usual, from which it can be.)
  husky: { group: "farm", walk: 1.2, gallop: 5.5, back: 0.6, seat: 0, rideFrom: 1.9, timid: false },
  shiba: { group: "farm", walk: 1.0, gallop: 5, back: 0, seat: 0, timid: false },
  deer: { group: "wild", walk: 1.2, gallop: 7, back: 0, seat: 0, timid: true },
  stag: { group: "wild", walk: 1.2, gallop: 7, back: 0, seat: 0, timid: true },
  // (`hostile`: it would attack; how it acts on that is the player's setting. Kept off, it keeps its distance.)
  wolf: { group: "wild", walk: 1.3, gallop: 6.5, back: 0, seat: 0, timid: true, hostile: true },
  fox: { group: "wild", walk: 1.0, gallop: 5.5, back: 0, seat: 0, timid: true },
};

/**
 * Coats: for a kind, each coat's colours for the parts it changes ([r, g, b], 0…255; a part left out
 * keeps the pack's colour, and the first coat is the pack's own). The parts are the pack's materials:
 * Main (the body), Main_Dark and Main_Light (its shading and markings), Hair (mane and tail), Hooves,
 * Muzzle.
 */
export const COATS = {
  horse: {
    bay: {},
    white: {
      Main: [176, 177, 161],
      Main_Dark: [160, 160, 148],
      Main_Light: [144, 142, 144],
      Hooves: [144, 130, 82],
      Hair: [170, 158, 134],
      Muzzle: [149, 123, 98],
    },
    black: {
      Main: [44, 42, 42],
      Main_Dark: [32, 31, 31],
      Main_Light: [62, 59, 57],
      Hooves: [52, 50, 48],
      Hair: [22, 22, 22],
      Muzzle: [34, 32, 31],
    },
    grey: {
      Main: [128, 130, 132],
      Main_Dark: [100, 102, 105],
      Main_Light: [166, 168, 168],
      Hooves: [80, 78, 74],
      Hair: [64, 66, 70],
      Muzzle: [72, 68, 66],
    },
    chestnut: {
      Main: [150, 84, 44],
      Main_Dark: [118, 64, 34],
      Main_Light: [178, 112, 62],
      Hair: [134, 74, 38],
      Muzzle: [96, 60, 38],
    },
    palomino: {
      Main: [196, 160, 98],
      Main_Dark: [170, 134, 80],
      Main_Light: [214, 184, 128],
      Hooves: [120, 108, 90],
      Hair: [232, 222, 196],
      Muzzle: [150, 118, 84],
    },
    brown: {
      Main: [80, 56, 40],
      Main_Dark: [60, 42, 31],
      Main_Light: [102, 72, 50],
      Hooves: [70, 66, 60],
      Hair: [28, 26, 26],
      Muzzle: [46, 38, 32],
    },
  },
  // (The two dogs come in the same coats, so a dog keeps its coat whichever of them its size makes it.)
  husky: {
    grey: {},
    brown: { Main: [112, 82, 56] },
    black: { Main: [40, 40, 40] },
    red: { Main: [142, 88, 54] },
    white: { Main: [196, 196, 188], Main_Light: [228, 228, 220] },
    cream: { Main: [214, 196, 160], Main_Light: [234, 228, 212] },
  },
  shiba: {
    red: {},
    black: { Main: [46, 44, 42], Main_Light: [192, 162, 122] },
    cream: { Main: [214, 196, 160], Main_Light: [234, 228, 212] },
    brown: { Main: [112, 82, 56] },
    grey: { Main: [120, 122, 120] },
    white: { Main: [226, 224, 216], Main_Light: [240, 238, 232] },
  },
};

/**
 * Which sort each kind is, for how many of each a world has (Settings → Animals): strays about the
 * settlement, the farms' animals, the country's that keep their distance, the country's that would
 * attack, and monsters (none with a body yet).
 */
export const SORT_OF = {
  husky: "strays",
  shiba: "strays",
  horse: "farm",
  donkey: "farm",
  cow: "farm",
  bull: "farm",
  alpaca: "farm",
  deer: "wild",
  stag: "wild",
  fox: "wild",
  wolf: "hostile",
};
/** How many of each sort a world has when nothing says otherwise, and the most the slider goes to. */
// (`town`: the most of them that are inside the settlement itself; the rest are put outside it.)
export const POPULATION = { strays: 2, farm: 12, wild: 12, hostile: 5, monsters: 8, town: 5 };
export const POPULATION_MAX = { strays: 12, farm: 40, wild: 40, hostile: 30, monsters: 30, town: 20 };
/** The kinds as a player switches them on and off: the two dogs are one ("dog"). */
export const SWITCHES = {
  dog: ["husky", "shiba"],
  horse: ["horse"],
  donkey: ["donkey"],
  cow: ["cow"],
  bull: ["bull"],
  alpaca: ["alpaca"],
  deer: ["deer"],
  stag: ["stag"],
  fox: ["fox"],
  wolf: ["wolf"],
};

/**
 * A dog's sizes, as how tall it stands (metres, to the top of its head): evenly spaced from a small dog
 * to one as tall as a horse. The two smaller are the small dog's body, the rest the big dog's;
 * the two largest can be ridden.
 */
export const DOG_SIZES = { small: 0.5, medium: 0.9125, large: 1.325, huge: 1.7375, massive: 2.15 };
const DOG_HEIGHT = { shiba: 0.62, husky: 0.85 }; // how tall each body stands at its usual size
/** The body a dog of `size` has: { kind, scale }. Anything else is a medium dog. */
export function dogBody(size) {
  const tall = DOG_SIZES[size] ?? DOG_SIZES.medium;
  const kind = tall <= DOG_SIZES.medium ? "shiba" : "husky";
  return { kind, scale: tall / DOG_HEIGHT[kind] };
}
/** The size nearest a dog of `kind` at `scale` (a dog kept from before sizes had names). */
export function dogSizeOf(kind, scale = 1) {
  const tall = (DOG_HEIGHT[kind] ?? DOG_HEIGHT.husky) * scale;
  return Object.keys(DOG_SIZES).reduce((best, size) =>
    Math.abs(DOG_SIZES[size] - tall) < Math.abs(DOG_SIZES[best] - tall) ? size : best,
  );
}

/** The kind of animal a word means ("wolves", "hound"), or null for one the game has no body for ("goblin"). */
export function animalKind(word) {
  const plain = String(word ?? "")
    .toLowerCase()
    .trim()
    .replace(/s$/u, "");
  const other = {
    wolve: "wolf",
    dog: "husky",
    hound: "husky",
    doe: "deer",
    mule: "donkey",
    cattle: "cow",
    ox: "bull",
    llama: "alpaca",
    pony: "horse",
  };
  const kind = other[plain] ?? plain;
  return ANIMALS[kind] ? kind : null;
}

/** The coat a kind's `n`th animal has (any whole number: a hash); null for a kind with only the one. */
export function coatFor(kind, n) {
  const coats = Object.keys(COATS[kind] ?? {});
  return coats.length ? coats[Math.abs(Math.trunc(n)) % coats.length] : null;
}

// A group's file holds its animals: { animals: { horse: {…}, cow: {…} } }.
const files = new Map();
function load(kind) {
  const group = ANIMALS[kind].group;
  if (!files.has(group)) {
    files.set(
      group,
      fetch(`${BASE}${group}.json`).then((response) => {
        if (!response.ok) throw new Error(`GET kit/creatures/${group}.json → ${response.status}`);
        return response.json();
      }),
    );
  }
  return files.get(group).then((file) => {
    if (!file.animals?.[kind]) throw new Error(`kit/creatures/${group}.json has no ${kind}`);
    return file.animals[kind];
  });
}

const bytes = (base64) => Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
const view = (Type, base64) => {
  const raw = bytes(base64);
  return new Type(raw.buffer, raw.byteOffset, raw.byteLength / Type.BYTES_PER_ELEMENT);
};

// Each kind's shape and clips are made once and shared by every animal of that kind; each coat of it is
// that shape with its own colours, made once too. One material draws them all.
const material = new MeshLambertMaterial({ vertexColors: true, flatShading: true });
material.userData.shared = true;
const kinds = new Map();
function partsOf(name, data, coat) {
  const key = `${name}:${coat ?? ""}`;
  if (kinds.has(key)) return kinds.get(key);
  const base = shapeOf(name, data);
  const colours = data.mesh.parts.map(([part, ...rgb]) => COATS[name]?.[coat]?.[part] ?? rgb);
  const colour = new Uint8Array(base.part.length * 3);
  for (let i = 0; i < base.part.length; i++) colour.set(colours[base.part[i]], i * 3);
  const geometry = new BufferGeometry();
  for (const [attribute, values] of Object.entries(base.geometry.attributes)) geometry.setAttribute(attribute, values);
  geometry.setAttribute("color", new BufferAttribute(colour, 3, true));
  geometry.setIndex(base.geometry.index);
  geometry.boundingSphere = base.geometry.boundingSphere;
  geometry.userData.shared = true;
  const parts = { geometry, material, clips: base.clips };
  kinds.set(key, parts);
  return parts;
}

const shapes = new Map();
function shapeOf(name, data) {
  if (shapes.has(name)) return shapes.get(name);
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
  const clips = Object.fromEntries(
    Object.entries(data.clips).map(([key, clip]) => [key, { ...clip, turns: view(Int16Array, clip.turns) }]),
  );
  const shape = { geometry, clips, part: view(Uint8Array, mesh.part) };
  shapes.set(name, shape);
  return shape;
}

const ease = (current, target, dt, seconds) => current + (target - current) * (1 - Math.exp(-dt / seconds));
const scratch = new Quaternion();
const next = new Quaternion();

/**
 * The animal `name` (a key of ANIMALS) in `coat` (a key of its COATS; anything else is its first), as
 * a body that walks. Rejects if the kit can't be loaded.
 */
export async function createAnimal(name, wanted = null) {
  const kind = ANIMALS[name] ? name : "deer";
  const coat = COATS[kind] ? (COATS[kind][wanted] ? wanted : Object.keys(COATS[kind])[0]) : null;
  const data = await load(kind);
  const { geometry, clips } = partsOf(kind, data, coat);
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
    coat,
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
