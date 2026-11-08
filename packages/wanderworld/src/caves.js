// A cave: one lumpy mass of rock set into a hillside, with its entrance pushed into the same surface, so
// the rock round the mouth, the walls and the roof inside are all one piece with no seams. The rock is
// layered and weathered, mossy where it faces the sky, and darkens to black deeper in.
//
// Built in the cave's own space: the mouth's floor at the origin, +z out of the hill, +y up. world.js
// turns and moves it into place and uses the colliders and the spot to use it from.
import { BufferGeometry, Color, Float32BufferAttribute, IcosahedronGeometry } from "three";

const STONE_LIGHT = new Color(0x9a9183);
const STONE_DARK = new Color(0x6e665b);
const MOSS = new Color(0x5f7a3c);
const DEEP = new Color(0x090807);
const FLOOR_NEAR = new Color(0x3b342c);

const smooth = (t) => {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
};

/** Smooth 3D value noise in about −1…1, from a seed. */
function noise3(seed) {
  const hash = (x, y, z) => {
    let h = (x * 374761393 + y * 668265263 + z * 2147483647 + seed * 144665) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) & 0xffff) / 0x7fff - 1;
  };
  return (x, y, z) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const zi = Math.floor(z);
    const tx = smooth(x - xi);
    const ty = smooth(y - yi);
    const tz = smooth(z - zi);
    const lerp = (a, b, t) => a + (b - a) * t;
    const corner = (dx, dy, dz) => hash(xi + dx, yi + dy, zi + dz);
    return lerp(
      lerp(lerp(corner(0, 0, 0), corner(1, 0, 0), tx), lerp(corner(0, 1, 0), corner(1, 1, 0), tx), ty),
      lerp(lerp(corner(0, 0, 1), corner(1, 0, 1), tx), lerp(corner(0, 1, 1), corner(1, 1, 1), tx), ty),
      tz,
    );
  };
}

/**
 * The cave for `seed`. Options: `size` [x, y, z] half-sizes of the rock (metres), `mouth` [width, height]
 * of the entrance, `depth` how far in it goes. Returns { rock (geometry), floor (geometry: the dark
 * floor inside), colliders ([{ x, z, r }]), use ({ x, z }: where to stand to use it) }, all in the
 * cave's own space.
 */
export function caveGeometry(seed, { size = [11, 11, 8.5], mouth = [2.5, 3], depth = 7.5 } = {}) {
  const [rx, ry, rz] = size;
  const [mw, mh] = mouth;
  const noise = noise3(seed);
  const fbm = (x, y, z) =>
    noise(x, y, z) * 0.6 + noise(x * 2.1, y * 2.1, z * 2.1) * 0.28 + noise(x * 4.3, y * 4.3, z * 4.3) * 0.12;
  const centreY = -ry * 0.3; // the rock sits sunk into the ground, a cliff rising over the mouth
  const mouthY = mh * 0.42; // the middle of the opening
  const front = rz * Math.sqrt(Math.max(0.05, 1 - ((mouthY - centreY) / ry) ** 2));
  const centreZ = -front; // so the rock's face passes through the mouth

  /** How far in a point of the face is pushed to make the entrance: 0 outside it, `depth` at its middle. */
  const pushAt = (x, y) => {
    const e = Math.hypot(x / mw, Math.max(0, y - mouthY) / mh, Math.min(0, y - mouthY) / (mh * 2.2));
    return e < 1 ? depth * (1 - e * e) ** 0.33 : 0;
  };

  // Fine enough for a rough rim round a 5 m opening; every corner its faces share lands in the same spot.
  const sphere = new IcosahedronGeometry(1, 18);
  const position = sphere.attributes.position;
  const colours = new Float32Array(position.count * 3);
  const colour = new Color();
  for (let i = 0; i < position.count; i++) {
    const dx = position.getX(i);
    const dy = position.getY(i);
    const dz = position.getZ(i);
    // Lumps, and ledges of layered rock (stronger on the sides than on top).
    const lumps = fbm(dx * 1.7 + 3, dy * 1.7, dz * 1.7) + noise(dx * 0.8 + 9, dy * 0.8, dz * 0.8) * 0.5;
    const ledges = Math.sin((dy * ry + lumps * 1.4) * 2.2) * 0.06 * (1 - Math.abs(dy));
    const out = 1 + lumps * 0.24 + ledges;
    let x = dx * rx * out;
    let y = dy * ry * out + centreY;
    // A cliff, not a dome: the top is squashed into a rough, grassy shelf.
    const shelf = centreY + ry * 0.9 + noise(dx * 2, 5, dz * 2) * 0.8;
    if (y > shelf) y = shelf + (y - shelf) * 0.2;
    let z = dz * rz * out + centreZ;
    // The entrance: points on the front face within the opening are pushed in, the rim kept rough and
    // standing a little proud of the face, like the brow of a real cave.
    let inside = 0;
    if (dz > 0.2) {
      const push = pushAt(x, y);
      if (push > 0) {
        const roughness = fbm(x * 0.9, y * 0.9, 7) * 0.2 * (1 - push / depth);
        z = Math.min(z, 0.25) - push;
        x += roughness * Math.sign(x || 1);
        inside = push / depth;
      } else {
        const e = Math.hypot(x / mw, Math.max(0, y - mouthY) / mh);
        if (e < 1.5 && y > -0.2) z += 0.55 * smooth((1.5 - e) / 0.5) * smooth(y + 0.2);
      }
    }
    position.setXYZ(i, x, y, z);
    // Colour: weathered stone in bands, moss where it faces the sky, soil at the foot, black deep inside.
    colour.copy(STONE_DARK).lerp(STONE_LIGHT, smooth(0.5 + fbm(x * 0.35, y * 0.5, z * 0.35) * 0.9));
    // Bands of layered rock, and streaks down the face where water runs.
    colour.multiplyScalar(0.9 + Math.sin(y * 2.2 + lumps * 2) * 0.07 + noise(x * 0.9, 0, z * 0.9) * 0.08);
    if (inside === 0) colour.lerp(MOSS, smooth((y - shelf + 0.4) * 1.5) * 0.85);
    if (y < 0.4 && inside === 0) colour.multiplyScalar(0.8 + y * 0.25);
    if (inside > 0) colour.lerp(DEEP, smooth(0.25 + inside * 2.2) * 0.98);
    colour.toArray(colours, i * 3);
  }
  sphere.setAttribute("color", new Float32BufferAttribute(colours, 3));
  sphere.deleteAttribute("uv");
  sphere.computeVertexNormals(); // per face: the rock reads as chiselled facets

  // The floor inside: dark from the mouth to black at the back.
  const floor = new BufferGeometry();
  const floorPoints = [];
  const floorColours = [];
  const reach = depth + 1;
  const steps = 8;
  for (let s = 0; s < steps; s++) {
    const z0 = 0.4 - (reach * s) / steps;
    const z1 = 0.4 - (reach * (s + 1)) / steps;
    const near = FLOOR_NEAR.clone().lerp(DEEP, smooth((s / steps) * 2.2));
    const far = FLOOR_NEAR.clone().lerp(DEEP, smooth(((s + 1) / steps) * 2.2));
    const w = mw + 0.6;
    floorPoints.push(-w, 0.03, z0, w, 0.03, z0, -w, 0.03, z1, w, 0.03, z0, w, 0.03, z1, -w, 0.03, z1);
    for (const c of [near, near, far, near, far, far]) floorColours.push(c.r, c.g, c.b);
  }
  floor.setAttribute("position", new Float32BufferAttribute(floorPoints, 3));
  floor.setAttribute("color", new Float32BufferAttribute(floorColours, 3));
  floor.computeVertexNormals();

  // Colliders: the tunnel's walls (narrowing as it goes in) and its back, and the rock round about.
  const colliders = [];
  const halfWidthAt = (t) => mw * Math.sqrt(Math.max(0, 1 - (t / depth) ** (1 / 0.33)));
  let back = depth;
  for (let t = 0; t < depth; t += 0.6) {
    const half = halfWidthAt(t);
    if (half < 0.85) {
      back = t;
      break;
    }
    colliders.push({ x: -(half + 0.45), z: -t, r: 0.55 }, { x: half + 0.45, z: -t, r: 0.55 });
  }
  colliders.push({ x: 0, z: -back - 0.3, r: 0.9 });
  for (let x = -rx * 0.85; x <= rx * 0.85; x += 2.4) {
    for (let z = centreZ - rz * 0.85; z <= centreZ + rz * 0.85; z += 2.4) {
      const inEllipse = (x / (rx * 0.9)) ** 2 + ((z - centreZ) / (rz * 0.9)) ** 2 < 1;
      const inTunnel = Math.abs(x) < mw + 1.6 && z > -back - 1.6;
      if (inEllipse && !inTunnel) colliders.push({ x, z, r: 1.6 });
    }
  }
  // `top`: about how high the shelf over the mouth is, for plants along its edge.
  return {
    rock: sphere,
    floor,
    colliders,
    use: { x: 0, z: -Math.min(back - 1.2, depth * 0.55) },
    top: centreY + ry * 0.9,
  };
}
