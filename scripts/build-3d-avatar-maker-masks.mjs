// 3D Avatar Maker's paint masks: for each body, a picture in the skin picture's layout saying where the
// fingernails and toenails are (red) and where the lips are (green), so the maker can colour them through
// the skin picture with a clean edge (src/skin.js). Written to packages/3d-avatar-maker/kit/avatar as
// avatar-<sex>-masks.png.
//
//   node scripts/build-3d-avatar-maker-masks.mjs
//
// Run it again after the bodies are repacked (scripts/build-3d-avatar-maker-kit.mjs).
//
// Why a mask: the body's nails are the faces of its fingertips that the body script took to be nail, and
// a fingertip has only a few large faces, so a colour given to those faces has a jagged edge. Here each
// nail is an oval worked out from the fingertip's shape in 3D (its middle, which way it faces, which way
// the digit points, how long and wide the nail faces reach) and drawn into the picture texel by texel,
// so its edge is smooth whatever faces lie under it. The lips' faces do follow the mouth's own rings, so
// their mask is those faces, softened at the edge.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { crc32, deflateSync } from "node:zlib";
import { Matrix4, Vector3 } from "three";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const KIT = join(ROOT, "packages/3d-avatar-maker/kit/avatar");
const { unpack } = await import(pathToFileURL(join(ROOT, "packages/3d-avatar-maker/src/packed.js")).href);
const { geometryOf } = await import(pathToFileURL(join(ROOT, "packages/3d-avatar-maker/src/kitfiles.js")).href);

export const MASK_SIZE = 2048;
const FINGERS = ["thumb", "index", "middle", "ring", "pinky"];
/** How square the nail's corners are (2 is an ellipse; higher is squarer). */
const NAIL_SQUARENESS = 2.6;
/** The width of the soft edge, in metres on the body. */
const NAIL_EDGE = 0.00035;
/** Below the nail's middle by more than this (as a share of its half-width), a texel is the digit's underside. */
const NAIL_DEPTH = [1.6, 1.25];

const smoothstep = (edge0, edge1, x) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

/** A PNG of `width` × `height` RGB bytes (`rgb`, row by row). */
export function writePng(path, width, height, rgb) {
  const chunk = (type, data) => {
    const head = Buffer.alloc(8);
    head.writeUInt32BE(data.length, 0);
    head.write(type, 4, "latin1");
    const tail = Buffer.alloc(4);
    tail.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])) >>> 0, 0);
    return Buffer.concat([head, data, tail]);
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8; // bits per channel
  header[9] = 2; // RGB
  const rows = Buffer.alloc((width * 3 + 1) * height);
  // (Each row starts with its filter byte, 0: none.)
  for (let y = 0; y < height; y++) rows.set(rgb.subarray(y * width * 3, (y + 1) * width * 3), y * (width * 3 + 1) + 1);
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(rows, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  writeFileSync(path, png);
  return png.length;
}

/** Calls `paint(x, y, u, v, w)` for every texel centre inside the triangle (in texel units), with its weights. */
function rasterise(a, b, c, paint) {
  const minX = Math.max(0, Math.floor(Math.min(a[0], b[0], c[0])));
  const maxX = Math.min(MASK_SIZE - 1, Math.ceil(Math.max(a[0], b[0], c[0])));
  const minY = Math.max(0, Math.floor(Math.min(a[1], b[1], c[1])));
  const maxY = Math.min(MASK_SIZE - 1, Math.ceil(Math.max(a[1], b[1], c[1])));
  const area = (b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1]);
  if (Math.abs(area) < 1e-12) return;
  for (let y = minY; y <= maxY; y++)
    for (let x = minX; x <= maxX; x++) {
      const px = x + 0.5;
      const py = y + 0.5;
      // (A texel a hair outside an edge is kept, so neighbouring triangles leave no gap between them.)
      const w0 = ((b[0] - px) * (c[1] - py) - (c[0] - px) * (b[1] - py)) / area;
      const w1 = ((c[0] - px) * (a[1] - py) - (a[0] - px) * (c[1] - py)) / area;
      const w2 = 1 - w0 - w1;
      if (w0 < -0.02 || w1 < -0.02 || w2 < -0.02) continue;
      paint(x, y, w0, w1, w2);
    }
}

/** A mesh's positions, normals, texture places and triangles, decoded. */
function decoded(mesh) {
  const geometry = geometryOf(mesh);
  return {
    position: geometry.attributes.position.array,
    normal: geometry.attributes.normal.array,
    uv: geometry.attributes.uv.array,
    index: geometry.index.array,
    skinIndex: geometry.attributes.skinIndex.array,
    skinWeight: geometry.attributes.skinWeight.array,
  };
}

/** The nail meshes' vertices in groups that touch (by triangles, and by sharing a place across a seam). */
function nailClusters(nails) {
  const count = nails.position.length / 3;
  const parent = Int32Array.from({ length: count }, (_, i) => i);
  const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  const join = (a, b) => (parent[find(a)] = find(b));
  for (let t = 0; t < nails.index.length; t += 3) {
    join(nails.index[t], nails.index[t + 1]);
    join(nails.index[t], nails.index[t + 2]);
  }
  const at = new Map();
  for (let i = 0; i < count; i++) {
    const key = [0, 1, 2].map((c) => Math.round(nails.position[i * 3 + c] * 5000)).join(",");
    if (at.has(key)) join(i, at.get(key));
    else at.set(key, i);
  }
  const groups = new Map();
  for (let i = 0; i < count; i++) {
    const root = find(i);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root).push(i);
  }
  return [...groups.values()].filter((group) => group.length >= 6);
}

/** A group of vertices' middle and their average normal. */
function middleOf(part, group) {
  const centre = new Vector3();
  const up = new Vector3();
  for (const i of group) {
    centre.x += part.position[i * 3];
    centre.y += part.position[i * 3 + 1];
    centre.z += part.position[i * 3 + 2];
    up.x += part.normal[i * 3];
    up.y += part.normal[i * 3 + 1];
    up.z += part.normal[i * 3 + 2];
  }
  return { centre: centre.divideScalar(group.length), up: up.normalize() };
}

const percentile = (values, share) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * share))];
};

/**
 * Each nail's oval: { centre (on the nail's surface), axis (along the digit), side, up (out of the nail),
 * halfLength, halfWidth, digit }.
 *
 * The body script's nail faces only say roughly where each nail is and which way it faces (a fingertip
 * has few faces, so they're a poor outline). The oval itself comes from the digit: a fingernail from its
 * finger's last bone (the skin that bone moves gives the fingertip and the finger's width); a toenail, as
 * the toes have no bones, from the top of the toe found in the skin around it. Each nail stops a little
 * short of the digit's tip and is about two thirds of its width.
 */
function nailOvals(file, nails, skin) {
  const bonePlace = (name) => {
    const at = file.joints.indexOf(name);
    return at < 0
      ? null
      : new Vector3().setFromMatrixPosition(new Matrix4().fromArray(file.inverseBind, at * 16).invert());
  };
  const p = new Vector3();
  const ovals = [];
  const fingerOf = new Map();
  for (const side of ["l", "r"])
    for (const finger of FINGERS) {
      const name = `${finger}_03_${side}`;
      const place = bonePlace(name);
      if (place)
        fingerOf.set(name, {
          name: `${finger}_${side}`,
          joint: file.joints.indexOf(name),
          place,
          thumb: finger === "thumb",
        });
    }
  const groups = nailClusters(nails).map((group) => middleOf(nails, group));

  // Fingernails.
  for (const finger of fingerOf.values()) {
    // The skin this bone moves most: the finger's last segment.
    const own = [];
    for (let i = 0; i < skin.dominant.length; i++) if (skin.dominant[i] === finger.joint) own.push(i);
    if (own.length < 20) continue;
    const place = (i) => p.fromArray(skin.position, i * 3);
    let tipAt = own[0];
    for (const i of own) if (place(i).distanceTo(finger.place) > place(tipAt).distanceTo(finger.place)) tipAt = i;
    const tip = place(tipAt).clone();
    const axis = tip.clone().sub(finger.place).normalize();
    const length = tip.distanceTo(finger.place);
    // Which way the nail faces: towards the body script's nail faces on this finger.
    const near = groups.filter((group) => group.centre.distanceTo(finger.place) < length * 1.5);
    if (!near.length) continue;
    const marked = near.reduce((a, b) => (a.centre.distanceTo(tip) < b.centre.distanceTo(tip) ? a : b));
    const up = marked.centre.clone().sub(finger.place);
    up.addScaledVector(axis, -up.dot(axis)).normalize();
    const side = new Vector3().crossVectors(up, axis).normalize();
    // The finger's half-width, and the top of its surface, at a distance along it.
    const across = (t) => {
      const widths = [];
      let top = -Infinity;
      for (const i of own) {
        const d = place(i).sub(finger.place);
        const along = d.dot(axis);
        if (Math.abs(along - t) > 0.0025) continue;
        widths.push(Math.abs(d.dot(side)));
        top = Math.max(top, d.dot(up));
      }
      return { half: percentile(widths, 0.9), top };
    };
    let halfWidth = across(length * 0.6).half * FINGERNAIL_WIDTH;
    let halfLength = halfWidth * (finger.thumb ? THUMBNAIL_LENGTH : FINGERNAIL_LENGTH);
    let t = length - FINGERNAIL_TIP - halfLength;
    for (let pass = 0; pass < 2; pass++) {
      halfWidth = across(t).half * FINGERNAIL_WIDTH;
      halfLength = halfWidth * (finger.thumb ? THUMBNAIL_LENGTH : FINGERNAIL_LENGTH);
      t = length - FINGERNAIL_TIP - halfLength;
    }
    const centre = finger.place.clone().addScaledVector(axis, t).addScaledVector(up, across(t).top);
    ovals.push({ centre, axis, side, up, halfLength, halfWidth, digit: finger.name });
  }

  // Toenails. The toes have no bones of their own (the ball of the foot moves them all), and on these feet
  // the little toe sits back from the rest, so the front of the foot doesn't show five clean tips. So: the
  // body script's nail faces say which toe is which and roughly where its nail is; the top of each toe (its
  // highest line) centres the nail across it; the toe's tip sets where it ends; and its size is a share of
  // the foot's width, by the toe's place from the big toe out, as real toenails go.
  const UP = new Vector3(0, 1, 0);
  for (const s of ["l", "r"]) {
    const ballJoint = file.joints.indexOf(`ball_${s}`);
    const ball = bonePlace(`ball_${s}`);
    const heel = bonePlace(`foot_${s}`);
    if (!ball || !heel) continue;
    const forward = ball.clone().sub(heel).setY(0).normalize();
    const lateral = new Vector3().crossVectors(UP, forward).normalize();
    const toeSkin = [];
    for (let i = 0; i < skin.dominant.length; i++) {
      if (skin.dominant[i] !== ballJoint) continue;
      if (
        p
          .fromArray(skin.position, i * 3)
          .sub(ball)
          .dot(forward) > 0
      )
        toeSkin.push(i);
    }
    if (!toeSkin.length) continue;
    // The foot's width across the toes (its middle 96%).
    const across = toeSkin.map((i) =>
      p
        .fromArray(skin.position, i * 3)
        .sub(ball)
        .dot(lateral),
    );
    const footWidth = percentile(across, 0.98) - percentile(across, 0.02);
    // The nail faces on this foot, pieces of one toe joined, then the closest two joined until there are five.
    const marks = groups
      .filter((group) => group.centre.distanceTo(ball) < 0.12 && Math.sign(group.centre.x) === Math.sign(ball.x))
      .filter((group) => ![...fingerOf.values()].some((finger) => group.centre.distanceTo(finger.place) < 0.05))
      .map((group) => ({ centre: group.centre.clone(), up: group.up.clone(), weight: 1 }));
    while (marks.length > 5) {
      let pair = null;
      for (let a = 0; a < marks.length; a++)
        for (let b = a + 1; b < marks.length; b++) {
          const apart = marks[a].centre.distanceTo(marks[b].centre);
          if (!pair || apart < pair.apart) pair = { a, b, apart };
        }
      const [keep, gone] = [marks[pair.a], marks[pair.b]];
      keep.centre
        .multiplyScalar(keep.weight)
        .addScaledVector(gone.centre, gone.weight)
        .divideScalar(keep.weight + gone.weight);
      keep.up.add(gone.up).normalize();
      keep.weight += gone.weight;
      marks.splice(pair.b, 1);
    }
    // From the big toe out: the big toe is on the inside of the foot, towards the body's middle.
    const inward = -Math.sign(lateral.x * ball.x || 1);
    marks.sort((a, b) => inward * (b.centre.clone().sub(ball).dot(lateral) - a.centre.clone().sub(ball).dot(lateral)));
    marks.forEach((mark, rank) => {
      const axis = mark.centre.clone().sub(ball).setY(0).normalize();
      const sideways = new Vector3().crossVectors(UP, axis).normalize();
      const local = (i) => {
        const d = p.fromArray(skin.position, i * 3).sub(mark.centre);
        return { along: d.dot(axis), side: d.dot(sideways), height: d.y, i };
      };
      const nearby = toeSkin.map(local).filter(({ along, side }) => Math.abs(along) < 0.03 && Math.abs(side) < 0.012);
      // The toe's top line, near the mark: the highest skin in each millimetre across.
      let ridge = 0;
      let highest = -Infinity;
      for (let mm = -5; mm <= 5; mm++) {
        const column = nearby.filter(
          ({ side, along }) => Math.abs(side - mm * 0.001) < 0.0012 && Math.abs(along) < 0.004,
        );
        const top = Math.max(...column.map(({ height }) => height));
        if (top > highest) {
          highest = top;
          ridge = mm * 0.001;
        }
      }
      // The tip: the furthest skin along the toe, near its top line.
      const tipAlong = Math.max(
        ...nearby.filter(({ side }) => Math.abs(side - ridge) < 0.0025).map(({ along }) => along),
      );
      if (!Number.isFinite(tipAlong)) return;
      const halfWidth = (TOENAIL_WIDTHS[rank] ?? TOENAIL_WIDTHS.at(-1)) * footWidth;
      const halfLength = halfWidth * (rank === 0 ? 1 : TOENAIL_LENGTH);
      const along = tipAlong - TOENAIL_TIP - halfLength;
      // The nail's middle: on the toe's top there, and facing the way the skin there faces.
      const column = nearby.filter(
        ({ side, along: a }) => Math.abs(side - ridge) < 0.002 && Math.abs(a - along) < 0.002,
      );
      if (!column.length) return;
      const top = column.reduce((a, b) => (b.height > a.height ? b : a));
      const centre = p.fromArray(skin.position, top.i * 3).clone();
      const normal = new Vector3();
      for (const { i } of nearby) {
        if (p.fromArray(skin.position, i * 3).distanceTo(centre) > 0.004) continue;
        normal.x += skin.normal[i * 3];
        normal.y += skin.normal[i * 3 + 1];
        normal.z += skin.normal[i * 3 + 2];
      }
      const up = normal.lengthSq() ? normal.normalize() : UP.clone();
      const side = new Vector3().crossVectors(up, axis).normalize();
      const along3 = new Vector3().crossVectors(side, up).normalize();
      ovals.push({ centre, axis: along3, side, up, halfLength, halfWidth, digit: `toe_${s}${rank + 1}` });
    });
  }
  return ovals;
}

/** A fingernail's half-width as a share of the finger's; its half-length as a share of its half-width. */
const FINGERNAIL_WIDTH = 0.7;
const FINGERNAIL_LENGTH = 1.2;
const THUMBNAIL_LENGTH = 1.1;
/** How far short of the fingertip a fingernail stops (metres). */
const FINGERNAIL_TIP = 0.0012;
/** Toenails: each one's half-width as a share of the foot's width, from the big toe out; length as a share
 * of width (the big toe's is square); how far short of the tip (metres). */
const TOENAIL_WIDTHS = [0.082, 0.05, 0.044, 0.038, 0.032];
const TOENAIL_LENGTH = 0.95;
const TOENAIL_TIP = 0.0018;

/** How much nail a point on the skin is (0 to 1), for one oval. */
function nailAt(oval, p) {
  const d = p.clone().sub(oval.centre);
  const depth = d.dot(oval.up);
  const x = Math.abs(d.dot(oval.axis)) / oval.halfLength;
  const y = Math.abs(d.dot(oval.side)) / oval.halfWidth;
  const r = (x ** NAIL_SQUARENESS + y ** NAIL_SQUARENESS) ** (1 / NAIL_SQUARENESS);
  const edge = NAIL_EDGE / Math.min(oval.halfLength, oval.halfWidth);
  // (The depth cut only keeps out the digit's underside, which lies a whole digit's thickness below: set
  // shallower, it would trim the nail's own curved edge along the coarse mesh's facets, raggedly.)
  return (
    smoothstep(1 + edge, 1 - edge, r) *
    smoothstep(-NAIL_DEPTH[0] * oval.halfWidth, -NAIL_DEPTH[1] * oval.halfWidth, depth)
  );
}

/** Softens a channel's edge: a box blur of `radius` texels, twice (close to a Gaussian). */
function soften(channel, radius) {
  const size = MASK_SIZE;
  const tmp = new Float32Array(channel.length);
  for (let pass = 0; pass < 2; pass++) {
    for (let y = 0; y < size; y++) {
      let sum = 0;
      for (let x = -radius; x <= radius; x++) sum += channel[y * size + Math.min(size - 1, Math.max(0, x))];
      for (let x = 0; x < size; x++) {
        tmp[y * size + x] = sum / (radius * 2 + 1);
        sum += channel[y * size + Math.min(size - 1, x + radius + 1)] - channel[y * size + Math.max(0, x - radius)];
      }
    }
    for (let x = 0; x < size; x++) {
      let sum = 0;
      for (let y = -radius; y <= radius; y++) sum += tmp[Math.min(size - 1, Math.max(0, y)) * size + x];
      for (let y = 0; y < size; y++) {
        channel[y * size + x] = sum / (radius * 2 + 1);
        sum += tmp[Math.min(size - 1, y + radius + 1) * size + x] - tmp[Math.max(0, y - radius) * size + x];
      }
    }
  }
}

for (const sex of ["male", "female"]) {
  const file = await unpack(readFileSync(join(KIT, `avatar-${sex}.pack.png`)));
  const skinMesh = file.meshes.find((mesh) => mesh.part === "skin" && !mesh.piece);
  const skinParts = file.meshes.filter((mesh) => mesh.texture === skinMesh.texture && !mesh.alpha && !mesh.piece);
  const parts = Object.fromEntries(skinParts.map((mesh) => [mesh.part, decoded(mesh)]));
  if (!parts.nails || !parts.lips) throw new Error(`avatar-${sex}: no nails or lips to mask`);
  // The skin and nails together, each vertex with the bone that moves it most.
  const bare = [parts.skin, parts.nails];
  const skin = {
    position: Float32Array.from(bare.flatMap((part) => [...part.position])),
    normal: Float32Array.from(bare.flatMap((part) => [...part.normal])),
    dominant: Int32Array.from(
      bare.flatMap((part) =>
        Array.from({ length: part.position.length / 3 }, (_, v) => {
          let best = 0;
          for (let c = 1; c < 4; c++) if (part.skinWeight[v * 4 + c] > part.skinWeight[v * 4 + best]) best = c;
          return part.skinIndex[v * 4 + best];
        }),
      ),
    ),
  };
  const ovals = nailOvals(file, parts.nails, skin);
  const nails = new Float32Array(MASK_SIZE * MASK_SIZE);
  const lips = new Float32Array(MASK_SIZE * MASK_SIZE);
  const texel = (uv, i) => [uv[i * 2] * MASK_SIZE, uv[i * 2 + 1] * MASK_SIZE];

  // Nails: every skin, nail and lip triangle near a nail, drawn texel by texel through the nail's oval.
  const reach = Math.max(...ovals.map((oval) => Math.max(oval.halfLength, oval.halfWidth))) * 1.6 + 0.004;
  const p = new Vector3();
  const corner = [new Vector3(), new Vector3(), new Vector3()];
  for (const part of Object.values(parts))
    for (let t = 0; t < part.index.length; t += 3) {
      const ids = [part.index[t], part.index[t + 1], part.index[t + 2]];
      ids.forEach((id, k) => corner[k].fromArray(part.position, id * 3));
      const near = ovals.filter((oval) => corner.some((c) => c.distanceTo(oval.centre) < reach));
      if (!near.length) continue;
      rasterise(texel(part.uv, ids[0]), texel(part.uv, ids[1]), texel(part.uv, ids[2]), (x, y, w0, w1, w2) => {
        p.set(0, 0, 0).addScaledVector(corner[0], w0).addScaledVector(corner[1], w1).addScaledVector(corner[2], w2);
        let most = 0;
        for (const oval of near) most = Math.max(most, nailAt(oval, p));
        const at = y * MASK_SIZE + x;
        if (most > nails[at]) nails[at] = most;
      });
    }

  // Lips: their own faces, softened a little at the edge.
  for (let t = 0; t < parts.lips.index.length; t += 3) {
    const ids = [parts.lips.index[t], parts.lips.index[t + 1], parts.lips.index[t + 2]];
    rasterise(...ids.map((id) => texel(parts.lips.uv, id)), (x, y) => (lips[y * MASK_SIZE + x] = 1));
  }
  soften(lips, 2);

  const rgb = Buffer.alloc(MASK_SIZE * MASK_SIZE * 3);
  for (let i = 0; i < nails.length; i++) {
    rgb[i * 3] = Math.round(Math.min(1, nails[i]) * 255);
    rgb[i * 3 + 1] = Math.round(Math.min(1, lips[i]) * 255);
  }
  const bytes = writePng(join(KIT, `avatar-${sex}-masks.png`), MASK_SIZE, MASK_SIZE, rgb);
  const digits = ovals.map(
    (oval) => `${oval.digit} ${(oval.halfLength * 2000).toFixed(1)}×${(oval.halfWidth * 2000).toFixed(1)}mm`,
  );
  console.log(`avatar-${sex}-masks.png: ${bytes} bytes, ${ovals.length} nails (${digits.join(", ")})`);
}
