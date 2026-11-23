// Deep places: the levels below a cave's mouth (a cave, a cavern, a dungeon or a stronghold), one loaded at
// a time. A level is made from its plan, plain data from a seed alone (deepcave.js makes the natural ones,
// dungeon.js the built ones), so the same entrance always leads to the same place. Built, it offers the
// calls main.js uses on a house's room (interiors.js: resolveCollisions, clearSight, blocked, update,
// seats, entry, exit) and the ones the herd needs (scene, layout, heightAt, waterAt), so creatures live
// and fight down there as they do outside.
//
// It's dark: the player carries a light, crystals glow, and a little daylight comes in at the way out.
// Whatever stands between the camera and the player (rock, roof or wall) isn't drawn, so the camera can
// always see in, as a room's walls are hidden.
//
// THE PLAN (the same shape for every kind; dungeon.js returns it too):
//   {
//     kind: "cave" | "cavern" | "dungeon" | "stronghold",
//     seed, depth,                        // depth 1 is the first level below the entrance
//     bounds: { minX, minZ, maxX, maxZ }, // metres, in the level's own space
//     rooms: [{ id, x, z, w, d, shape: "chamber" | "room" | "hall" | "cell", tags: [] }],
//     passages: [{ from, to, points: [{ x, z }], width }],
//     entry: { x, z, angle },             // where you arrive, and the way up (or out)
//     down: { x, z, angle, kind } | null, // the way further down, and to what kind of place
//     floorAt: undefined,                 // (optional; the floor is flat at 0 for now)
//     pieces: [{ kit, name, x, y, z, angle, scale, glow? }], // kit models to place ("props", "village"…)
//     colliders: [{ x, z, w, d, angle }], // boxes nothing can walk into
//     lights: [{ x, y, z, colour, range }],
//     spawns: [{ x, z, tag: "den" | "guard" | "captive" | "boss" | "wander" }],
//     rock: [{ x, z, r }],                // (optional) rock pillars standing in the open
//     water: [{ x, z, w, d, angle }],     // (optional) pools, an ellipse each
//   }
// An angle turns about +y as three.js turns things (0 faces +z); a box's `w` is along its own x and `d`
// along its own z. A chamber is an ellipse w by d; a room, hall or cell a box. Rooms and passages are the
// open floor: anywhere else is rock (or wall) to everything that moves.
import {
  BufferGeometry,
  CircleGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Fog,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshPhongMaterial,
  PointLight,
  Scene,
  Vector3,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { ANIMALS } from "./animals.js";
import { box } from "./buildings.js";
import { noise3 } from "./caves.js";
import { cavePlan, cavernPlan, MAX_DEPTH, openAt } from "./deepcave.js";
import { buildDungeon, dungeonPlan } from "./dungeon.js";
import { kitModel, kitModels } from "./kit.js";
import { DEEP_KINDS } from "./land.js";
import { SRD_CREATURES } from "./srd.js";
import { createCollider, disposeOwn, hashString, rng } from "./world.js";

const NATURAL = new Set(["cave", "cavern"]);
const DRY = { depth: 0, level: 0 };
const VIS = 1; // metres: the rock's mesh is carved on a grid this fine
const LAMPS = 4; // the most of a level's own lights lit at once (the nearest the player), for phones
/** How high the roof is: at the walls (`low`), at the most (`high`) and how far in it takes to rise. */
const ROOF = { cave: { low: 3.4, high: 5.8, spread: 5 }, cavern: { low: 4.2, high: 15, spread: 13 } };
const STONE_DARK = new Color(0x5a534a);
const STONE_LIGHT = new Color(0x857c70);
const FLOOR_DARK = new Color(0x3a332b);
const FLOOR_LIGHT = new Color(0x5a5145);
const ROOF_COLOUR = new Color(0x3a342d);
const FOG = 0x040302;
const smooth = (t) => {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
};

/** The seed of the level `depth` below the entrance `entrance` (a world's seed and its cave, as text). */
export const deepSeed = (entrance, depth) => hashString(`${entrance}:deep:${depth}`);

/** Whether the cave `entrance` leads down at all, for `share` of a world's caves (0…1). */
export const leadsDown = (entrance, share) => (hashString(`${entrance}:leads down`) % 1000) / 1000 < share;

/**
 * The way down from a cave's mouth, as the kinds of its first level (enterDeep's), or null for a shallow
 * cave: `share` of a world's caves lead down, into a small cave first; one a region's purpose made the way
 * into somewhere (its `deep`: a stronghold's gate, a ruin over a dungeon) always does, straight into it;
 * and so does one a quest needs (`wanted`).
 */
export const wayDown = (cave, entrance, share, wanted = false) =>
  cave.deep || wanted || leadsDown(entrance, share) ? [DEEP_KINDS.includes(cave.deep) ? cave.deep : "cave"] : null;

/**
 * The plan for the level of `kind` at `depth` with seed `seed`: a cavern or a cave from deepcave.js, a
 * dungeon or a stronghold from dungeon.js, and anything else a cave.
 */
export function deepPlan(seed, depth, kind) {
  if (kind === "cavern") return cavernPlan(seed, depth);
  if (kind === "dungeon" || kind === "stronghold") {
    const plan = dungeonPlan(seed, depth, kind);
    return depth >= MAX_DEPTH ? { ...plan, down: null } : plan; // (no deeper than the caves go)
  }
  return cavePlan(seed, depth);
}

/** Who lives in each kind of place: the common sort, and what's bigger (at a "boss" spot). */
const DWELLERS = {
  cave: {
    common: ["rat", "spider", "snake", "bat", "slime", "wolf", "kobold", "goblin", "grick"],
    boss: ["bugbear", "ogre", "troll"],
  },
  cavern: {
    common: ["spider", "bat", "slime", "goblin", "kobold", "lizardfolk", "gnoll", "basilisk"],
    boss: ["ogre", "minotaur", "troll", "roper", "otyugh", "stone_giant", "fire_elemental", "earth_elemental"],
  },
  dungeon: {
    common: ["skeleton", "ghoul", "rat", "slime", "spider", "mimic", "gelatinous_cube", "zombie"],
    boss: ["ghoul", "minotaur", "wizard", "otyugh", "ghost", "specter"],
  },
  stronghold: { common: ["bandit", "bandit", "hobgoblin", "orc"], boss: ["bugbear", "witch", "wizard", "ogre"] },
};
/** How many stand at each kind of spot, least and most. */
const HOW_MANY = { den: [2, 4], guard: [1, 2], wander: [1, 1], boss: [1, 1], captive: [0, 0] };

/**
 * The creatures at a level's spawn spots, for herd.js setSpawns: what lives in that kind of place, no
 * tougher than the party can take (`level`: the player's; deeper is tougher) and only the kinds
 * `allowed(kind)` lets be. The same level always has the same ones. [{ id, kind, count, at, temper }]
 */
export function creaturesFor(plan, level = 1, allowed = () => true) {
  const random = rng(hashString(`${plan.seed}:dwellers`));
  const dwellers = DWELLERS[plan.kind] ?? DWELLERS.cave;
  const toughest = Math.max(1, level) + plan.depth - 1;
  const fits = (list, most) =>
    list.filter((kind) => ANIMALS[kind] && allowed(kind) && (SRD_CREATURES[kind]?.cr ?? 0) <= most);
  const common = fits(dwellers.common, Math.max(0.5, toughest / 4));
  const bosses = fits(dwellers.boss, Math.max(1, toughest / 2));
  return plan.spawns.flatMap((spawn, i) => {
    const [least, most] = HOW_MANY[spawn.tag] ?? [1, 1];
    const count = least + Math.floor(random() * (most - least + 1));
    const pool = spawn.tag === "boss" && bosses.length ? bosses : common;
    const kind = pool[Math.floor(random() * pool.length)];
    if (!count || !kind) return [];
    return [
      { id: `deep:${plan.seed}:${i}`, kind, count, at: { x: spawn.x, z: spawn.z }, temper: "hostile", sized: true },
    ];
  });
}

/**
 * `collider` ({ x, z, w, d, angle }) as boxes lined up with the axes, as the collision grid takes them:
 * itself when it's square to them, else in strips half a metre long along its length.
 */
export function boxesOf({ x, z, w, d, angle = 0 }) {
  const quarter = Math.round(angle / (Math.PI / 2));
  if (Math.abs(angle - quarter * (Math.PI / 2)) < 0.01) {
    const [hw, hd] = quarter % 2 ? [d / 2, w / 2] : [w / 2, d / 2];
    return [{ minX: x - hw, maxX: x + hw, minZ: z - hd, maxZ: z + hd }];
  }
  // Its own x runs along (cos, −sin), its own z along (sin, cos).
  const long = w >= d;
  const length = long ? w : d;
  const thick = long ? d : w;
  const along = long ? [Math.cos(angle), -Math.sin(angle)] : [Math.sin(angle), Math.cos(angle)];
  const strips = Math.max(1, Math.ceil(length / 0.5));
  const step = length / strips;
  const half = (Math.abs(along[0]) * step + Math.abs(along[1]) * thick) / 2;
  const halfZ = (Math.abs(along[1]) * step + Math.abs(along[0]) * thick) / 2;
  const boxes = [];
  for (let i = 0; i < strips; i++) {
    const t = -length / 2 + step * (i + 0.5);
    const cx = x + along[0] * t;
    const cz = z + along[1] * t;
    boxes.push({ minX: cx - half, maxX: cx + half, minZ: cz - halfZ, maxZ: cz + halfZ });
  }
  return boxes;
}

/**
 * Has `material` leave out whatever is between the camera (`cut.eye`) and the player (`cut.focus`), in a
 * tube that widens toward them, above the floor: rock, roof and walls alike; and the roof over the player,
 * as a house's room has none. One shader change, no extra meshes.
 */
function cutAway(material, cut) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.deepEye = { value: cut.eye };
    shader.uniforms.deepFocus = { value: cut.focus };
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 deepAt;")
      .replace(
        "#include <project_vertex>",
        `#include <project_vertex>
        #ifdef USE_INSTANCING
          deepAt = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;
        #else
          deepAt = (modelMatrix * vec4(transformed, 1.0)).xyz;
        #endif`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying vec3 deepAt;\nuniform vec3 deepEye;\nuniform vec3 deepFocus;",
      )
      .replace(
        "#include <clipping_planes_fragment>",
        `#include <clipping_planes_fragment>
        vec3 deepWay = deepFocus - deepEye;
        float deepLength = max(length(deepWay), 1.0);
        float deepT = dot(deepAt - deepEye, deepWay) / (deepLength * deepLength);
        vec3 deepNear = deepEye + deepWay * clamp(deepT, 0.0, 1.0);
        float deepReach = mix(0.8, 2.4, clamp(deepT, 0.0, 1.0));
        if (deepAt.y > 0.25 && deepT < 1.0 - 0.6 / deepLength && distance(deepAt, deepNear) < deepReach) discard;
        if (deepAt.y > deepFocus.y + 2.0 && distance(deepAt.xz, deepFocus.xz) < 8.0) discard;`,
      );
  };
  material.customProgramCacheKey = () => "wanderworld-deep-cut";
  return material;
}

/**
 * The rock of a natural level, as one mesh: the floor, the walls round it and the roof over it, carved
 * from where it's open (`open`, deepcave.js openAt). The walls follow the edge (marching squares), are
 * pushed back into the rock by noise in lumps and ledges, and meet the roof above where they stand.
 */
function rockGeometry(plan, open) {
  const { minX, minZ, maxX, maxZ } = plan.bounds;
  const nx = Math.ceil((maxX - minX) / VIS);
  const nz = Math.ceil((maxZ - minZ) / VIS);
  const value = new Float32Array((nx + 1) * (nz + 1));
  for (let j = 0; j <= nz; j++)
    for (let i = 0; i <= nx; i++) value[j * (nx + 1) + i] = open(minX + i * VIS, minZ + j * VIS);
  const roof = ROOF[plan.kind] ?? ROOF.cave;
  const noise = noise3((plan.seed ^ 0x5bd1e995) | 0);
  const roofAt = (x, z, o) =>
    roof.low + (roof.high - roof.low) * smooth(Math.max(0, o) / roof.spread) + noise(x * 0.3, 2, z * 0.3) * 0.6;
  const positions = [];
  const colours = [];
  const colour = new Color();
  const corner = (x, y, z, hex) => {
    positions.push(x, y, z);
    colours.push(hex.r, hex.g, hex.b);
  };
  /** A face of two triangles, a → b → c → d, each corner its own colour. */
  const quad = (a, b, c, d) => {
    for (const p of [a, b, c, a, c, d]) corner(p.x, p.y, p.z, p.colour);
  };
  const floorColour = (x, z, o) =>
    colour
      .copy(FLOOR_DARK)
      .lerp(FLOOR_LIGHT, smooth(0.5 + noise(x * 0.4, 0, z * 0.4) * 0.8))
      .multiplyScalar(0.65 + 0.35 * smooth(o / 2))
      .clone();
  // Where a wall stands at (x, z): pushed back into the rock (away from the open) by up to `amp`.
  const outward = (x, z) => {
    const e = 0.25;
    const gx = open(x + e, z) - open(x - e, z);
    const gz = open(x, z + e) - open(x, z - e);
    const length = Math.hypot(gx, gz) || 1;
    return [-gx / length, -gz / length];
  };
  const wallPoint = (point, s, rows) => {
    const top = roofAt(point.x, point.z, 0) + 0.3;
    const y = -0.3 + ((top + 0.3) * s) / rows;
    const lump = noise(point.x * 0.7, y * 0.6, point.z * 0.7) + noise(point.x * 1.9, y * 1.7, point.z * 1.9) * 0.5;
    const push = 0.1 + 0.8 * Math.max(0, 0.5 + 0.5 * lump);
    const bands = 0.9 + Math.sin(y * 2.2 + noise(point.x * 0.3, 7, point.z * 0.3) * 2) * 0.08;
    const tint = colour
      .copy(STONE_DARK)
      .lerp(STONE_LIGHT, smooth(0.5 + noise(point.x * 0.35, y * 0.5, point.z * 0.35)));
    return {
      x: point.x + point.out[0] * push,
      y,
      z: point.z + point.out[1] * push,
      colour: tint.multiplyScalar(bands * (0.55 + 0.45 * smooth(y / 3))).clone(),
    };
  };
  const wall = (p, q) => {
    const rows = Math.max(2, Math.ceil(Math.max(roofAt(p.x, p.z, 0), roofAt(q.x, q.z, 0)) / 0.9));
    for (let s = 0; s < rows; s++)
      quad(wallPoint(p, s, rows), wallPoint(q, s, rows), wallPoint(q, s + 1, rows), wallPoint(p, s + 1, rows));
  };
  const edgePoint = (a, b) => {
    const t = a.o / (a.o - b.o);
    const x = a.x + (b.x - a.x) * t;
    const z = a.z + (b.z - a.z) * t;
    return { x, z, out: outward(x, z) };
  };
  for (let j = 0; j < nz; j++) {
    for (let i = 0; i < nx; i++) {
      const at = (di, dj) => ({
        x: minX + (i + di) * VIS,
        z: minZ + (j + dj) * VIS,
        o: value[(j + dj) * (nx + 1) + i + di],
      });
      const cell = [at(0, 0), at(1, 0), at(1, 1), at(0, 1)];
      if (cell.every((c) => c.o < -0.6)) continue;
      // The floor (reaching a little under the walls) and the roof over it.
      quad(...cell.map((c) => ({ x: c.x, y: 0, z: c.z, colour: floorColour(c.x, c.z, c.o) })));
      quad(
        ...cell.map((c) => {
          const shade = 0.8 + noise(c.x * 0.5, 4, c.z * 0.5) * 0.25;
          return { x: c.x, y: roofAt(c.x, c.z, c.o), z: c.z, colour: ROOF_COLOUR.clone().multiplyScalar(shade) };
        }),
      );
      // The walls through the cell: where its edges cross from open to rock.
      const inside = cell.map((c) => c.o >= 0);
      if (inside.every(Boolean) || !inside.some(Boolean)) continue;
      const cross = [0, 1, 2, 3].map((k) =>
        inside[k] !== inside[(k + 1) % 4] ? edgePoint(cell[k], cell[(k + 1) % 4]) : null,
      );
      const found = cross.filter(Boolean);
      if (found.length === 2) wall(found[0], found[1]);
      else {
        // A saddle: the walls go round the corners that differ from the middle.
        const middle = cell.reduce((sum, c) => sum + c.o, 0) / 4 >= 0;
        for (let k = 0; k < 4; k++) if (inside[k] !== middle) wall(cross[(k + 3) % 4], cross[k]);
      }
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new Float32BufferAttribute(colours, 3));
  geometry.computeVertexNormals(); // per face: chiselled facets, as the cave mouths have
  return geometry;
}

/** A built level's floor (a dungeon's, a stronghold's), under its rooms and passages: dark flagstone. */
function floorGeometry(plan) {
  const slabs = [];
  for (const room of plan.rooms) slabs.push(box(room.w, 0.1, room.d, room.x, -0.07, room.z, 0x47423b));
  for (const passage of plan.passages) {
    for (let i = 1; i < passage.points.length; i++) {
      const a = passage.points[i - 1];
      const b = passage.points[i];
      const length = Math.hypot(b.x - a.x, b.z - a.z);
      slabs.push(
        box(passage.width, 0.1, length + passage.width, 0, -0.07, 0, 0x3f3a34)
          .rotateY(Math.atan2(b.x - a.x, b.z - a.z))
          .translate((a.x + b.x) / 2, 0, (a.z + b.z) / 2),
      );
    }
  }
  return mergeGeometries(slabs);
}

/** A dark round hole in the floor at `spot`: the way down. */
function hole(spot) {
  return new Mesh(
    new CircleGeometry(1.3, 20).rotateX(-Math.PI / 2).translate(spot.x, 0.03, spot.z),
    new MeshBasicMaterial({ color: 0x000000 }),
  );
}

/**
 * The level for `plan`, ready to walk: its scene (dark, lit by the player's light and its own), what's in
 * the way, and where you come in, go out and go further down. Kit pieces come with `dress()`.
 */
export function createDeep(plan) {
  const natural = NATURAL.has(plan.kind);
  const open = openAt(plan);
  const cut = { eye: new Vector3(0, 50, 0), focus: new Vector3() };
  const scene = new Scene();
  scene.background = new Color(FOG);
  scene.fog = plan.kind === "cavern" ? new Fog(FOG, 16, 60) : new Fog(FOG, 10, 38);
  scene.add(new HemisphereLight(0x6a7088, 0x1a140e, 0.9));
  // The light the player carries (moved with them in update).
  const torch = new PointLight(0xffb36a, 30, 22, 1.2);
  scene.add(torch);
  // The plan's own lights (crystals, a camp's fire, a dungeon's torches): only the few nearest the player
  // are lit at once (update), so a level with many costs no more than one with few.
  const lights = plan.lights ?? [];
  const lamps = lights.slice(0, LAMPS).map(() => {
    const lamp = new PointLight(0xffffff, 0, 10, 1.5);
    scene.add(lamp);
    return lamp;
  });
  const light = (lamp, from) => {
    lamp.color.setHex(from.colour);
    lamp.intensity = 10;
    lamp.distance = from.range;
    lamp.position.set(from.x, from.y, from.z);
  };
  lamps.forEach((lamp, i) => light(lamp, lights[i]));
  const materials = new Map(); // a kit material → this level's copy of it, cut away like the rock
  const own = (kitMaterial, glow = false) => {
    const key = `${kitMaterial.uuid}:${glow ? 1 : 0}`;
    if (!materials.has(key)) {
      const copy = kitMaterial.clone();
      copy.userData = {};
      if (glow) {
        copy.emissive = new Color(0xffffff);
        copy.emissiveMap = copy.map;
        copy.emissiveIntensity = 0.7;
      }
      materials.set(key, cutAway(copy, cut));
    }
    return materials.get(key);
  };
  // A built level is dungeon.js's to lay out from the kit, with its materials cut away like the rock.
  const built = natural
    ? null
    : buildDungeon(plan, (set, name) =>
        kitModel(set, name).then((parts) => parts.map((part) => ({ ...part, material: own(part.material) }))),
      );
  if (built) scene.add(built.object);
  const material = cutAway(new MeshLambertMaterial({ vertexColors: true, flatShading: true, side: DoubleSide }), cut);
  scene.add(new Mesh(natural ? rockGeometry(plan, open) : floorGeometry(plan), material));
  for (const water of plan.water ?? []) {
    const pool = new CircleGeometry(1, 28)
      .rotateX(-Math.PI / 2)
      .scale(water.w / 2, 1, water.d / 2)
      .rotateY(water.angle)
      .translate(water.x, 0.05, water.z);
    scene.add(new Mesh(pool, new MeshPhongMaterial({ color: 0x16313d, specular: 0x557788, shininess: 90 })));
  }
  if (plan.down && natural) scene.add(hole(plan.down)); // (a built level shows its own: a trapdoor, a breach)

  const collider = createCollider(
    [],
    (plan.colliders ?? []).flatMap(boxesOf).map((shape, id) => ({ id, ...shape })),
  );
  const blocked = (x, z, margin = 0.3) => open(x, z) < margin || collider.insideBox(x, z, margin);
  const { minX, minZ, maxX, maxZ } = plan.bounds;
  let gone = false;
  let clock = 0;
  let lampsAt = 0;

  return {
    plan,
    scene,
    kind: plan.kind,
    halfWidth: (maxX - minX) / 2,
    halfDepth: (maxZ - minZ) / 2,
    entry: plan.entry,
    exit: { x: plan.entry.x, z: plan.entry.z },
    down: plan.down,
    seats: [],
    doors: [],
    // For the herd (herd.js): a level of its own, flat and dry.
    layout: { worldHalf: Math.max(maxX - minX, maxZ - minZ), townHalf: 0 },
    heightAt: () => 0,
    waterAt: () => DRY,
    resolveCollisions: (position, radius) => collider.resolve(position, radius),
    clearSight: () => 1,
    blocked,
    /** The player's light goes with them, and what's between the camera and them isn't drawn. */
    update(dt, camera, player) {
      clock += dt;
      if (!player) return;
      torch.position.set(player.x, player.y + 2.1, player.z);
      torch.intensity = 30 + Math.sin(clock * 13) * 1.4 + Math.sin(clock * 7.3) * 1.1;
      cut.eye.copy(camera.position);
      cut.focus.set(player.x, player.y + 1.4, player.z);
      if (lights.length > lamps.length && clock >= lampsAt) {
        lampsAt = clock + 0.5;
        const near = [...lights].sort(
          (a, b) => Math.hypot(a.x - player.x, a.z - player.z) - Math.hypot(b.x - player.x, b.z - player.z),
        );
        lamps.forEach((lamp, i) => light(lamp, near[i]));
      }
    },
    /**
     * A natural level's kit pieces (crystals, rubble, a tower's walls …), once they've loaded; without the
     * kit, none. (A built level's are laid out as it's made: its walls aren't something to do without.)
     */
    async dress() {
      if (built) return;
      const sets = new Map();
      for (const item of plan.pieces ?? []) {
        if (!sets.has(item.kit)) sets.set(item.kit, new Set());
        sets.get(item.kit).add(item.name);
      }
      for (const [set, names] of sets) {
        const models = await kitModels(set, [...names]).catch(() => null);
        if (gone) return;
        if (!models) continue;
        for (const item of plan.pieces.filter((entry) => entry.kit === set)) {
          for (const part of models.get(item.name)) {
            const mesh = new Mesh(part.geometry, own(part.material, item.glow));
            mesh.position.set(item.x, item.y ?? 0, item.z);
            mesh.rotation.y = item.angle ?? 0;
            mesh.scale.setScalar(item.scale ?? 1);
            scene.add(mesh);
          }
        }
      }
    },
    setTime: () => 0,
    setDrawDistance() {},
    dispose() {
      gone = true;
      scene.traverse((object) => {
        // Kit geometry is shared (kit.js keeps it); this level's own copies of its materials aren't.
        disposeOwn(object);
        if (object.isInstancedMesh) object.dispose();
      });
    },
  };
}
