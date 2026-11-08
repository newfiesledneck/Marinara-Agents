// The town's fixtures that light up and move: iron lamp posts with glass lanterns that glow at night,
// pooling light on the cobbles (and lighting what's near the player for real), and the fountain on the
// square, a stone basin with a tiered bowl and water spilling from it.
//
// world.js builds them and passes the materials it shares with the ground (`water`, `stone`), so this
// module draws nothing of its own beyond its meshes.
import {
  AdditiveBlending,
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  CircleGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DoubleSide,
  Float32BufferAttribute,
  InstancedMesh,
  LatheGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Object3D,
  PlaneGeometry,
  PointLight,
  Points,
  PointsMaterial,
  RepeatWrapping,
  RingGeometry,
  Vector2,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const IRON = 0x24282b;
const PLINTH = 0x7f7a72;
const LANTERN_Y = 3.25; // the middle of the lantern's glass
/** Real lights: only the lamps nearest the player light the world around them; the rest just glow. */
const LIT_LAMPS = 4;

/** A soft round glow, white in the middle (shared; null without a canvas, as in tests). */
let glowTexture;
function glow() {
  if (glowTexture !== undefined) return glowTexture;
  glowTexture = null;
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const context = canvas.getContext("2d");
  if (!context) return null;
  const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.35, "rgba(255,255,255,0.45)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 64, 64);
  glowTexture = new CanvasTexture(canvas);
  return glowTexture;
}

/** Gives every vertex of `geometry` one colour (and drops its uvs), indexed or not. */
function tint(geometry, hex) {
  const flat = geometry.index ? geometry.toNonIndexed() : geometry;
  flat.deleteAttribute("uv");
  const color = new Color(hex);
  const colors = new Float32Array(flat.attributes.position.count * 3);
  for (let i = 0; i < flat.attributes.position.count; i++) color.toArray(colors, i * 3);
  flat.setAttribute("color", new Float32BufferAttribute(colors, 3));
  flat.computeVertexNormals();
  return flat;
}

/** The iron and stone of one lamp post, from its foot: plinth, fluted post, collar, lantern frame, cap. */
function lampPost() {
  const parts = [
    tint(new BoxGeometry(0.42, 0.3, 0.42).translate(0, 0.15, 0), PLINTH),
    tint(new CylinderGeometry(0.15, 0.19, 0.35, 8).translate(0, 0.47, 0), IRON),
    tint(new CylinderGeometry(0.06, 0.1, 2.25, 8).translate(0, 1.75, 0), IRON),
    tint(new CylinderGeometry(0.11, 0.07, 0.14, 8).translate(0, 2.9, 0), IRON), // collar
    tint(new CylinderGeometry(0.21, 0.13, 0.08, 4).rotateY(Math.PI / 4).translate(0, 3.0, 0), IRON), // lantern floor
  ];
  // Four corner bars round the glass.
  for (const [x, z] of [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ]) {
    parts.push(tint(new BoxGeometry(0.035, 0.46, 0.035).translate(x * 0.15, LANTERN_Y, z * 0.15), IRON));
  }
  parts.push(
    tint(new ConeGeometry(0.27, 0.24, 4).rotateY(Math.PI / 4).translate(0, 3.6, 0), IRON), // cap
    tint(new CylinderGeometry(0.03, 0.05, 0.12, 6).translate(0, 3.77, 0), IRON),
    tint(new ConeGeometry(0.05, 0.12, 6).translate(0, 3.88, 0), IRON), // finial
  );
  return mergeGeometries(parts);
}

/**
 * Lamp posts at each of `lamps` ({ x, z }, on the town's level ground). Returns { objects, setDark(dark),
 * follow(x, z) }: `setDark` (0 day … 1 night) lights the lanterns and their glow, `follow` moves the few
 * real lights to the lamps nearest the player.
 */
export function createLamps(lamps) {
  const objects = [];
  const posts = new InstancedMesh(lampPost(), new MeshLambertMaterial({ vertexColors: true }), lamps.length);
  const glassLook = new MeshLambertMaterial({
    color: 0xfff0c8,
    emissive: 0xffb84a,
    emissiveIntensity: 0,
    transparent: true,
    opacity: 0.85,
  });
  const glass = new InstancedMesh(
    new BoxGeometry(0.27, 0.42, 0.27).translate(0, LANTERN_Y, 0),
    glassLook,
    lamps.length,
  );
  const dummy = new Object3D();
  lamps.forEach((lamp, i) => {
    dummy.position.set(lamp.x, 0, lamp.z);
    dummy.rotation.set(0, (i * 0.7) % (Math.PI / 2), 0);
    dummy.updateMatrix();
    posts.setMatrixAt(i, dummy.matrix);
    glass.setMatrixAt(i, dummy.matrix);
  });
  objects.push(posts, glass);

  // Night: a halo round each lantern and a warm pool of light on the cobbles under it.
  const texture = glow();
  let halos = null;
  let pools = null;
  if (texture) {
    const haloGeometry = new BufferGeometry().setAttribute(
      "position",
      new Float32BufferAttribute(
        lamps.flatMap((lamp) => [lamp.x, LANTERN_Y, lamp.z]),
        3,
      ),
    );
    halos = new Points(
      haloGeometry,
      new PointsMaterial({
        map: texture,
        color: 0xffc46a,
        size: 2.2,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    );
    pools = new InstancedMesh(
      new PlaneGeometry(7, 7).rotateX(-Math.PI / 2),
      new MeshBasicMaterial({
        map: texture,
        color: 0xffb453,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: AdditiveBlending,
        polygonOffset: true,
        polygonOffsetFactor: -6,
        polygonOffsetUnits: -6,
      }),
      lamps.length,
    );
    lamps.forEach((lamp, i) => {
      dummy.position.set(lamp.x, 0.03, lamp.z);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      pools.setMatrixAt(i, dummy.matrix);
    });
    objects.push(halos, pools);
  }

  // The real lights: always in the scene (adding lights later would rebuild every material), dark by day.
  const lights = Array.from({ length: Math.min(LIT_LAMPS, lamps.length) }, () => {
    const light = new PointLight(0xffb85c, 0, 13, 1.6);
    light.position.set(0, -50, 0);
    objects.push(light);
    return light;
  });
  let glowing = 0;
  const at = new Vector2(Infinity, Infinity);

  return {
    objects,
    setDark(dark) {
      glowing = dark > 0.35 ? Math.min(1, (dark - 0.35) * 2.2) : 0;
      glassLook.emissiveIntensity = glowing * 1.6;
      if (halos) halos.material.opacity = glowing * 0.75;
      if (pools) pools.material.opacity = glowing * 0.45;
      for (const light of lights) light.intensity = glowing * 7;
    },
    follow(x, z) {
      if ((x - at.x) ** 2 + (z - at.y) ** 2 < 1) return; // only when the player has moved a metre
      at.set(x, z);
      const nearest = lamps
        .map((lamp) => ({ lamp, distance: at.distanceToSquared(new Vector2(lamp.x, lamp.z)) }))
        .sort((a, b) => a.distance - b.distance);
      lights.forEach((light, i) => {
        const lamp = nearest[i]?.lamp;
        if (lamp) light.position.set(lamp.x, LANTERN_Y, lamp.z);
      });
    },
  };
}

/** A stone shape turned round the y axis from a profile of [radius, height] points (8 sides: octagonal). */
const turned = (profile, sides = 8) =>
  new LatheGeometry(
    profile.map(([r, y]) => new Vector2(r, y)),
    sides,
  ).rotateY(Math.PI / 8);

/**
 * The fountain at (0, 0) with basin radius `radius`: an octagonal stone basin, a pedestal with a bowl
 * that brims over in a falling curtain of water, and a small jet on top. `stone` and `water` are the
 * materials to build it in (the plaza's stone and the river's water). Returns { objects, update(dt),
 * setWater(texture) } — `setWater` gives the falling water its texture once it has loaded.
 */
export function createFountain(radius, { stone, water }) {
  const objects = [];
  const inner = radius - 0.28;
  const basin = turned([
    [0.02, 0.22],
    [inner, 0.22],
    [inner, 0.74],
    [radius + 0.12, 0.74],
    [radius + 0.12, 0.62],
    [radius + 0.04, 0.58],
    [radius + 0.2, 0.06],
    [radius + 0.2, 0],
  ]);
  const pedestal = turned(
    [
      [0.62, 0.22],
      [0.55, 0.42],
      [0.34, 0.55],
      [0.26, 0.75],
      [0.24, 1.45],
      [0.34, 1.58],
      [0.3, 1.62],
      [0.95, 1.78],
      [1.06, 1.92],
      [0.98, 1.95],
      [0.92, 1.86],
      [0.2, 1.86],
      [0.15, 2.0],
      [0.13, 2.55],
      [0.24, 2.66],
      [0.16, 2.74],
      [0.06, 2.92],
      [0.01, 2.95],
    ],
    16,
  );
  const stoneMesh = new Mesh(mergeGeometries([basin, pedestal]), stone);
  stone.side = DoubleSide;
  objects.push(stoneMesh);

  // Still water in the basin and in the bowl (the river's water, rippling).
  const surface = (r, y) => {
    const disc = new CircleGeometry(r, 24).rotateX(-Math.PI / 2).translate(0, y, 0);
    return tint(disc, 0x5b90ad);
  };
  objects.push(new Mesh(mergeGeometries([surface(inner, 0.62), surface(0.94, 1.88)]), water));

  // Falling water: a thin curtain from the bowl's lip to the basin, and a jet from the top, both
  // streaming down; foam where the curtain lands.
  const falling = new MeshLambertMaterial({
    color: 0xd8eef5,
    emissive: 0x1c3644,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    side: DoubleSide,
  });
  const curtain = new CylinderGeometry(1.05, 1.22, 1.28, 32, 1, true).translate(0, 1.27, 0);
  const jet = new CylinderGeometry(0.035, 0.09, 0.42, 10, 1, true).translate(0, 3.12, 0);
  objects.push(new Mesh(mergeGeometries([curtain, jet]), falling));
  const foam = new MeshBasicMaterial({ color: 0xf2fbff, transparent: true, opacity: 0.35, depthWrite: false });
  objects.push(new Mesh(new RingGeometry(1.08, 1.5, 32).rotateX(-Math.PI / 2).translate(0, 0.635, 0), foam));

  let flow = 0;
  return {
    objects,
    update(dt) {
      flow += dt;
      if (falling.map) falling.map.offset.y = flow * 0.9;
      foam.opacity = 0.3 + Math.sin(flow * 3.1) * 0.05;
    },
    setWater(texture) {
      const map = texture.clone();
      map.wrapS = map.wrapT = RepeatWrapping;
      map.repeat.set(5, 1.2);
      map.needsUpdate = true;
      falling.map = map;
      falling.needsUpdate = true;
    },
  };
}
