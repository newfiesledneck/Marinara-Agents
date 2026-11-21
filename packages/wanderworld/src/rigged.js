// Creatures with a skeleton of their own, made in Blender (a mimic, a roper, a grick): not on the people's
// skeleton, so they move with their own actions, played by three's AnimationMixer. From the kit:
// kit/creatures/rigged-<kind>.json (the model, its actions in it) and rigged-<kind>.webp (its texture), made
// by scripts/build-wanderworld-people.mjs --bestiary from packages/wanderworld/assets/models/<kind>.glb.
//
// Each has "Idle", "Walk", "Run" and "Attack", and a creature that lies in wait ("Hidden": the mimic as a
// plain chest, the roper as a stalagmite) goes still into it after standing a while, until it moves or strikes.
import {
  AnimationMixer,
  Color,
  FrontSide,
  Group,
  LoopOnce,
  MeshLambertMaterial,
  SRGBColorSpace,
  TextureLoader,
} from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { addDistant, drawDistant, forget } from "./kit.js";
import { parseGlb } from "./models.js";

const BASE = "/api/capability-packages/wanderworld/assets/kit/creatures/";
const HIDE_AFTER = 4; // seconds standing still before one that lies in wait hides again

const ease = (current, target, dt, seconds) => current + (target - current) * (1 - Math.exp(-dt / seconds));
const bytes = (base64) => Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));

// Each kind is read once and shared: its model (cloned for each one in the world), clips and material.
const kinds = new Map();
const textures = new TextureLoader();
/**
 * The material for a mesh of `kind`, by its name in the model: most are plain, but `draw` (its ANIMALS
 * entry's) can name meshes to draw see-through ({ opacity }: the gelatinous cube's ooze, a ghost) or
 * glowing ({ glow: 0xRRGGBB, strength }: the basilisk's eyes, fire).
 */
function materialFor(map, style) {
  const material = new MeshLambertMaterial({ map });
  if (style?.opacity !== undefined) {
    Object.assign(material, { transparent: true, opacity: style.opacity, depthWrite: false, side: FrontSide });
  }
  if (style?.glow !== undefined) {
    material.emissive = new Color(style.glow);
    material.emissiveMap = map; // (its dark parts, a pupil, stay dark)
    material.emissiveIntensity = style.strength ?? 1;
  }
  material.userData.shared = true;
  return material;
}

/**
 * Gives each skinned mesh of `scene` a bounding sphere that holds it in every pose its actions put it in
 * (each sampled at six moments, and a tenth more for between them), so it's drawn whenever any of it
 * could be in sight and left out when none could. Leaves it at rest.
 */
export function boundAllPoses(scene, clips) {
  const spheres = new Map();
  const sample = () => {
    scene.updateMatrixWorld(true);
    scene.traverse((node) => {
      if (!node.isSkinnedMesh) return;
      node.computeBoundingSphere();
      if (spheres.has(node)) spheres.get(node).union(node.boundingSphere);
      else spheres.set(node, node.boundingSphere.clone());
    });
  };
  sample();
  const mixer = new AnimationMixer(scene);
  for (const clip of clips) {
    const played = mixer.clipAction(clip).play();
    for (let i = 0; i <= 5; i++) {
      mixer.setTime((clip.duration * i) / 5);
      sample();
    }
    played.stop();
  }
  mixer.stopAllAction();
  mixer.uncacheRoot(scene);
  scene.updateMatrixWorld(true);
  for (const [mesh, sphere] of spheres) {
    sphere.radius *= 1.1;
    mesh.boundingSphere = sphere;
  }
}

function source(kind, draw = {}) {
  if (!kinds.has(kind)) {
    kinds.set(
      kind,
      (async () => {
        const response = await fetch(`${BASE}rigged-${kind}.json`);
        if (!response.ok) throw new Error(`GET kit/creatures/rigged-${kind}.json → ${response.status}`);
        const data = await response.json();
        const gltf = await parseGlb(bytes(data.glb).buffer);
        const map = textures.load(`${BASE}rigged-${kind}.webp`);
        map.flipY = false; // glTF texture coordinates
        map.colorSpace = SRGBColorSpace;
        map.userData.shared = true;
        const plain = materialFor(map);
        const styled = new Map(Object.entries(draw).map(([name, style]) => [name, materialFor(map, style)]));
        const meshes = [];
        gltf.scene.traverse((node) => {
          if (!node.isMesh) return;
          const name = styled.has(node.name) ? node.name : node.parent?.name;
          node.material = styled.get(name) ?? plain;
          if (draw[name]?.opacity !== undefined) node.renderOrder = 1; // (after what's inside it)
          node.geometry.userData.shared = true;
          meshes.push(node);
        });
        // Its distant version (an index of its own in the file, named in the mesh's extras: kit.js addDistant).
        for (const mesh of meshes)
          if (Number.isInteger(mesh.geometry.userData.far))
            addDistant(mesh.geometry, (await gltf.parser.getDependency("accessor", mesh.geometry.userData.far)).array);
        boundAllPoses(gltf.scene, gltf.animations);
        return { scene: gltf.scene, clips: gltf.animations, height: data.height };
      })().catch((error) => forget(kinds, kind, error)),
    );
  }
  return kinds.get(kind);
}

/**
 * The creature `kind` as a body that moves, with the handles herd.js uses on an animal (`facts`: its
 * ANIMALS entry: `walk` and `gallop` speeds, and `hides` for one that lies in wait). Rejects if the kit
 * can't be loaded.
 */
export async function createRigged(kind, facts) {
  const { scene, clips } = await source(kind, facts.draw);
  const model = clone(scene);
  model.traverse((node) => node.isMesh && drawDistant(node)); // (each copy picks its own: kit.js)
  const root = new Group();
  root.add(model);
  const mixer = new AnimationMixer(model);
  const action = (name, once = false) => {
    const clip = clips.find((entry) => entry.name === name);
    if (!clip) return null;
    const played = mixer.clipAction(clip);
    if (once) {
      played.setLoop(LoopOnce, 1);
      played.clampWhenFinished = false;
    } else played.play();
    played.setEffectiveWeight(0);
    return played;
  };
  const idle = action("Idle");
  const walk = action("Walk") ?? idle;
  const run = action("Run") ?? walk;
  const hidden = facts.hides ? action("Hidden") : null;
  const attack = action("Attack", true);
  let moving = 0;
  let running = 0;
  let hiding = hidden ? 1 : 0; // (one that lies in wait starts hidden)
  let still = hidden ? HIDE_AFTER : 0;
  let striking = 0; // seconds left of an attack being played

  /** Plays its attack once ("strike"; it has nothing else for "cast"). Whether it has one. */
  function act() {
    if (!attack) return false;
    attack.reset().play();
    striking = attack.getClip().duration;
    still = 0;
    return true;
  }

  function update(dt, speed = 0) {
    dt = Math.min(0.1, Math.max(0, Number.isFinite(dt) ? dt : 0));
    speed = Math.max(0, Number.isFinite(speed) ? speed : 0);
    moving = ease(moving, speed > 0.08 ? 1 : 0, dt, 0.18);
    const between = (speed - facts.walk * 1.5) / Math.max(0.1, facts.gallop * 0.6 - facts.walk * 1.5);
    running = ease(running, Math.min(1, Math.max(0, between)), dt, 0.2);
    still = speed > 0.08 || striking > 0 ? 0 : still + dt;
    hiding = ease(hiding, hidden && still >= HIDE_AFTER ? 1 : 0, dt, hiding > 0.5 ? 0.6 : 0.15);
    striking = Math.max(0, striking - dt);
    // Each gait at the rate that matches the ground covered at its own pace.
    walk.timeScale = Math.max(0.5, speed / facts.walk);
    run.timeScale = Math.max(0.6, speed / facts.gallop);
    // The weights add up to one: an attack over whatever else, in quickly and out as it ends.
    const strike = attack && striking > 0 ? Math.min(1, striking * 6, (attack.getClip().duration - striking) * 8) : 0;
    const rest = 1 - strike;
    const stand = rest * (1 - moving);
    idle.setEffectiveWeight(stand * (1 - hiding));
    hidden?.setEffectiveWeight(stand * hiding);
    if (walk !== idle) walk.setEffectiveWeight(rest * moving * (1 - running));
    if (run !== walk) run.setEffectiveWeight(rest * moving * running);
    attack?.setEffectiveWeight(strike);
    mixer.update(dt);
  }
  update(0);

  return {
    act,
    object: root,
    kind,
    coat: null,
    /** Nothing rides one of these, so nothing is set on its back. */
    carryOn() {},
    bob: () => 0,
    back: 0,
    seat: 0,
    update,
    rise: () => 0,
    /** Whether it's lying in wait as what it pretends to be (a chest, a stalagmite). */
    hidden: () => hiding > 0.5,
    dispose() {
      mixer.stopAllAction();
      mixer.uncacheRoot(model);
      root.removeFromParent();
    },
  };
}
