// Monsters Wanderworld builds itself, in code, for SRD creatures no pack has a model for. Each is built
// as the built-in person is (figure.js): parts bound wholly to the bones of a humanoid skeleton in one
// skinned mesh, so it walks, runs and strikes with the people's clips and costs no download. Sizes are
// the creature's own, in metres, and the same kind always looks the same.
import { ConeGeometry, CylinderGeometry, Quaternion, SphereGeometry, TorusGeometry, Vector3 } from "three";
import { blob, figureFrom } from "./figure.js";

const UP = new Vector3(0, 1, 0);
const SIDES = [
  ["left", 1],
  ["right", -1],
];

/** `hex` lighter (k > 1) or darker (k < 1). */
const shade = (hex, k) => {
  const r = Math.min(255, ((hex >> 16) & 255) * k);
  const g = Math.min(255, ((hex >> 8) & 255) * k);
  const b = Math.min(255, (hex & 255) * k);
  return (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b);
};

/** Turns and moves a geometry made along +y so it runs from a to b. */
function along(geometry, a, b) {
  const from = new Vector3(...a);
  const to = new Vector3(...b);
  const direction = to.clone().sub(from).normalize();
  return geometry
    .applyQuaternion(new Quaternion().setFromUnitVectors(UP, direction))
    .translate((from.x + to.x) / 2, (from.y + to.y) / 2, (from.z + to.z) / 2);
}
const length = (a, b) => Math.max(0.001, new Vector3(...a).distanceTo(new Vector3(...b)));

/** A tapered limb from a (radius ra) to b (radius rb), rounded at both ends: three geometries. */
function limb(ra, rb, a, b, sides = 8) {
  return [
    along(new CylinderGeometry(rb, ra, length(a, b), sides, 1, true), a, b),
    new SphereGeometry(ra, sides, 5).translate(...a),
    new SphereGeometry(rb, sides, 5).translate(...b),
  ];
}

/** A small, coarse ellipsoid, for what's too small to see the facets of (fingers, toes, warts). */
const nub = (rx, ry, rz, x, y, z) => new SphereGeometry(1, 6, 4).scale(rx, ry, rz).translate(x, y, z);

/** A cone from its base at a (radius r) to its point at b. */
const spike = (r, a, b, sides = 6) => along(new ConeGeometry(r, length(a, b), sides), a, b);

/** A horn along `points` (base first), from radius r down to a point. */
function horn(r, points) {
  const out = [];
  for (let i = 0; i < points.length - 1; i++) {
    const ra = r * (1 - i / (points.length - 1));
    const rb = r * (1 - (i + 1) / (points.length - 1));
    if (i === points.length - 2) out.push(spike(ra, points[i], points[i + 1], 8));
    else out.push(...limb(ra, Math.max(rb, 0.004), points[i], points[i + 1], 8));
  }
  return out;
}

/** A flat, pointed ear from a (width w, thickness d) to its tip at b. */
function ear(w, d, a, b) {
  return along(new ConeGeometry(1, length(a, b), 4).scale(w, 1, d).rotateY(Math.PI / 4), a, b);
}

/**
 * A body's skeleton and the parts every two-legged one shares (torso, arms, hands, legs, feet), from its
 * proportions in metres: `leg` (hip height), `torso` (hips to the base of the neck), `neck`, `shoulders`
 * and `hips` (between the joints), `arm` (shoulder to wrist), `thick` (how heavy the limbs are), `chest`
 * and `waist` ([across, front to back] radii), `belly`, `hunch` (how far forward the head sits), `hand`
 * and `foot` (sizes), `claws`, `hooves`, and colours: `skin`, `shirt`, `limbs` (sleeves), `forearms`,
 * `legs`, `shins`, `feet`, `nails`.
 */
function bodyOf(p) {
  const s = p.leg / 0.9; // the body's scale against a person
  const y = {
    hips: p.leg,
    spine: p.leg + p.torso * 0.2,
    chest: p.leg + p.torso * 0.5,
    neck: p.leg + p.torso,
    head: p.leg + p.torso + p.neck,
    arm: p.leg + p.torso * 0.88,
    knee: p.leg * 0.52,
    ankle: 0.085 * s,
  };
  const sx = p.shoulders / 2;
  const hx = p.hips / 2;
  const joints = [
    ["hips", null, 0, y.hips, 0],
    ["spine", "hips", 0, y.spine, 0],
    ["chest", "spine", 0, y.chest, p.hunch * 0.15],
    ["neck", "chest", 0, y.neck - p.hunch * 0.25, p.hunch * 0.6],
    ["head", "neck", 0, y.head - p.hunch * 0.45, p.hunch],
  ];
  for (const [side, sign] of SIDES) {
    joints.push(
      [`${side}UpperArm`, "chest", sign * sx, y.arm, 0],
      [`${side}LowerArm`, `${side}UpperArm`, sign * (sx + p.arm * 0.52), y.arm, 0],
      [`${side}Hand`, `${side}LowerArm`, sign * (sx + p.arm), y.arm, 0],
      [`${side}UpperLeg`, "hips", sign * hx, y.hips - 0.04 * s, 0],
      [`${side}LowerLeg`, `${side}UpperLeg`, sign * hx, y.knee, 0],
      [`${side}Foot`, `${side}LowerLeg`, sign * hx, y.ankle, 0],
    );
  }
  const t = p.thick * s;
  const skin = p.skin;
  const parts = [];
  const add = (bone, hex, ...geometries) => {
    for (const geometry of geometries.flat()) parts.push([bone, hex, geometry]);
  };
  const [chestX, chestZ] = p.chest;
  const [waistX, waistZ] = p.waist;
  // Torso: pelvis, waist, ribcage, shoulders' muscle, and a belly if it has one.
  add("hips", p.legs ?? skin, blob(waistX * 1.05, 0.09 * s, waistZ * 1.05, 0, y.hips + 0.02 * s, 0));
  add(
    "spine",
    p.shirt ?? skin,
    along(new CylinderGeometry(chestX * 0.86, waistX, y.chest - y.hips, 14), [0, y.hips, 0], [0, y.chest, 0]).scale(
      1,
      1,
      waistZ / waistX,
    ),
  );
  if (p.belly)
    add("spine", p.shirt ?? skin, blob(waistX * 0.95, p.belly * 0.9, p.belly, 0, y.spine + 0.02 * s, waistZ * 0.35));
  const ribY = y.chest + p.torso * 0.18;
  add("chest", p.shirt ?? skin, blob(chestX, p.torso * 0.34, chestZ, 0, ribY, p.hunch * 0.2));
  add(
    "chest",
    shade(p.shirt ?? skin, 0.96),
    blob(sx * 0.9, 0.05 * s * p.thick, chestZ * 0.7, 0, y.arm - 0.01 * s, p.hunch * 0.25),
  );
  // Neck
  add(
    "neck",
    skin,
    limb(0.05 * t, 0.045 * t, [0, y.arm - 0.04 * s, p.hunch * 0.45], [0, y.head - p.hunch * 0.45, p.hunch]),
  );
  for (const [side, sign] of SIDES) {
    const x = (offset) => sign * (sx + offset);
    const elbow = p.arm * 0.52;
    const wrist = p.arm;
    // Arms: shoulder, upper arm, forearm (thickest below the elbow).
    add(`${side}UpperArm`, p.limbs ?? skin, blob(0.064 * t, 0.06 * t, 0.06 * t, x(0.02 * s), y.arm, 0));
    add(`${side}UpperArm`, p.limbs ?? skin, limb(0.058 * t, 0.045 * t, [x(0.02 * s), y.arm, 0], [x(elbow), y.arm, 0]));
    add(
      `${side}LowerArm`,
      p.forearms ?? skin,
      limb(0.05 * t, 0.034 * t, [x(elbow), y.arm, 0], [x(wrist - 0.01 * s), y.arm, 0]),
    );
    // A hand: the palm, four fingers and a thumb, palm down in the T-pose.
    const h = p.hand * s;
    const palm = x(wrist + 0.05 * h);
    add(`${side}Hand`, skin, blob(0.05 * h, 0.022 * h, 0.042 * h, palm, y.arm, 0));
    for (let f = 0; f < 4; f++) {
      const z = (f - 1.5) * 0.022 * h;
      const to = [x(wrist + 0.15 * h), y.arm - 0.02 * h, z * 1.1];
      add(`${side}Hand`, skin, nub(0.038 * h, 0.011 * h, 0.011 * h, x(wrist + 0.115 * h), y.arm - 0.012 * h, z * 1.05));
      if (p.claws)
        add(
          `${side}Hand`,
          p.nails ?? 0x2a2420,
          spike(0.008 * h, to, [to[0] + sign * 0.03 * h, to[1] - 0.02 * h, to[2]]),
        );
    }
    add(`${side}Hand`, skin, nub(0.014 * h, 0.012 * h, 0.03 * h, x(wrist + 0.05 * h), y.arm - 0.005 * h, 0.055 * h));
    // Legs: thigh, calf (with its muscle behind), and a foot or a hoof.
    add(
      `${side}UpperLeg`,
      p.legs ?? skin,
      limb(0.085 * t, 0.06 * t, [sign * hx, y.hips - 0.03 * s, 0], [sign * hx, y.knee, 0]),
    );
    add(
      `${side}LowerLeg`,
      p.shins ?? p.legs ?? skin,
      limb(0.058 * t, 0.04 * t, [sign * hx, y.knee, 0], [sign * hx, y.ankle + 0.03 * s, 0]),
    );
    add(
      `${side}LowerLeg`,
      p.shins ?? p.legs ?? skin,
      blob(0.05 * t, 0.12 * s, 0.05 * t, sign * hx, y.knee - 0.12 * s, -0.02 * t),
    );
    const f = p.foot * s;
    if (p.hooves) {
      add(
        `${side}Foot`,
        p.hooves,
        along(
          new CylinderGeometry(0.06 * f, 0.075 * f, 0.1 * f, 10),
          [sign * hx, 0, 0.01 * f],
          [sign * hx, 0.1 * f, 0.01 * f],
        ),
      );
      add(`${side}Foot`, shade(p.hooves, 0.6), blob(0.012 * f, 0.05 * f, 0.03 * f, sign * hx, 0.05 * f, 0.075 * f));
    } else {
      add(`${side}Foot`, p.feet ?? skin, blob(0.055 * f, 0.045 * f, 0.11 * f, sign * hx, 0.045 * f, 0.04 * f));
      for (let toe = 0; toe < 3; toe++) {
        const tx = sign * hx + (toe - 1) * 0.03 * f;
        add(`${side}Foot`, p.feet ?? skin, nub(0.018 * f, 0.018 * f, 0.025 * f, tx, 0.02 * f, 0.14 * f));
        if (p.claws)
          add(
            `${side}Foot`,
            p.nails ?? 0x2a2420,
            spike(0.009 * f, [tx, 0.02 * f, 0.155 * f], [tx, 0.008 * f, 0.19 * f]),
          );
      }
    }
  }
  return { joints, parts, add, y, s, t, sx, hx };
}

/**
 * A head's eyes: whites (or a colour) and pupils, with a brow over each that dips towards the nose by
 * `browTilt` for a scowl. `at` is the left eye's centre, `r` its size.
 */
function eyes(add, { at, r, white = 0xf2ecd8, pupil = 0x1a1410, brow, browTilt = 0.4, browWidth = 1.5 }) {
  const [ex, ey, ez] = at;
  for (const sign of [1, -1]) {
    add("head", white, blob(r, r * 0.8, r * 0.6, sign * ex, ey, ez));
    add("head", pupil, nub(r * 0.5, r * 0.55, r * 0.35, sign * ex * 1.02, ey, ez + r * 0.45));
    if (brow === undefined) continue;
    add("head", brow, blob(r * browWidth, r * 0.42, r * 0.7, sign * ex, ey + r * 1.05, ez + r * 0.2));
    add("head", brow, blob(r * 0.8, r * 0.4, r * 0.6, sign * ex * 0.55, ey + r * (1.05 - browTilt), ez + r * 0.35));
  }
}

/** Loincloth: a belt round the hips and a cloth hanging in front and behind. */
function loincloth(add, b, { cloth, belt, waistX, waistZ, drop, studs }) {
  const { y, s } = b;
  add(
    "hips",
    belt,
    new TorusGeometry(1, 0.11, 6, 18)
      .rotateX(Math.PI / 2)
      .scale(waistX * 1.02, s * 0.25, waistZ * 1.06)
      .translate(0, y.hips + 0.04 * s, 0),
  );
  add("hips", cloth, blob(waistX * 0.55, drop / 2, 0.02 * s, 0, y.hips - drop * 0.42, waistZ * 1.02));
  add("hips", shade(cloth, 0.85), blob(waistX * 0.6, drop / 2, 0.02 * s, 0, y.hips - drop * 0.4, -waistZ * 1.02));
  if (studs)
    for (const x of [-0.6, -0.2, 0.2, 0.6])
      add("hips", studs, nub(0.015 * s, 0.015 * s, 0.01 * s, x * waistX, y.hips + 0.04 * s, waistZ * 1.06));
}

/** Rings round a forearm (bracers) or ankle. */
function band(add, bone, hex, at, r, s) {
  add(bone, hex, new TorusGeometry(r, 0.012 * s, 5, 12).rotateY(Math.PI / 2).translate(...at));
}

// ── The monsters ─────────────────────────────────────────────────────────────────────────────────────

/** Goblin (SRD: Small humanoid): about a metre, big-headed and long-eared, in rags. */
function goblin() {
  const skin = 0x7d9446;
  const p = {
    leg: 0.42,
    torso: 0.3,
    neck: 0.05,
    shoulders: 0.22,
    hips: 0.12,
    arm: 0.38,
    thick: 0.85,
    chest: [0.11, 0.08],
    waist: [0.085, 0.065],
    hunch: 0.07,
    hand: 1.45,
    foot: 1.4,
    claws: true,
    nails: 0x3a3428,
    skin,
    shirt: 0x6b5238,
    limbs: 0x6b5238,
  };
  const b = bodyOf(p);
  const { add, y, s } = b;
  const hy = y.head - p.hunch * 0.45 + 0.1;
  const hz = p.hunch + 0.02;
  // A big head, wide at the cheeks, with a long hooked nose and ears that sweep back.
  add("head", skin, blob(0.115, 0.11, 0.115, 0, hy + 0.02, hz - 0.01));
  add("head", skin, blob(0.112, 0.07, 0.1, 0, hy - 0.05, hz + 0.02));
  add("head", shade(skin, 0.92), limb(0.024, 0.015, [0, hy + 0.005, hz + 0.1], [0, hy - 0.02, hz + 0.155], 8));
  add("head", shade(skin, 0.92), spike(0.015, [0, hy - 0.02, hz + 0.155], [0, hy - 0.05, hz + 0.165], 8));
  for (const sign of [1, -1]) {
    add("head", skin, ear(0.05, 0.012, [sign * 0.095, hy + 0.01, hz - 0.01], [sign * 0.27, hy + 0.07, hz - 0.08]));
    add("head", 0xa86a5c, ear(0.03, 0.008, [sign * 0.1, hy + 0.01, hz], [sign * 0.22, hy + 0.055, hz - 0.055]));
  }
  eyes(add, { at: [0.045, hy + 0.01, hz + 0.09], r: 0.022, white: 0xe6c840, brow: shade(skin, 0.7), browTilt: 0.55 });
  add("head", 0x2a1a14, blob(0.07, 0.009, 0.014, 0, hy - 0.07, hz + 0.1));
  for (const sign of [1, -1])
    add(
      "head",
      0xece4cc,
      spike(0.009, [sign * 0.04, hy - 0.075, hz + 0.105], [sign * 0.042, hy - 0.045, hz + 0.11], 4),
    );
  // Rags: a short tunic with a rope belt, and wraps on the wrists.
  loincloth(add, b, { cloth: 0x5a4430, belt: 0x8a7350, waistX: p.waist[0], waistZ: p.waist[1], drop: 0.14 });
  for (const [side, sign] of SIDES)
    band(add, `${side}LowerArm`, 0x9a8a68, [sign * (b.sx + p.arm * 0.9), y.arm, 0], 0.03, s);
  return { ...b, height: 1, seed: 1 };
}

/** Ogre (SRD: Large giant): about three metres, heavy and pot-bellied, with a small head and tusks. */
function ogre() {
  const skin = 0x9c9060;
  const p = {
    leg: 1.15,
    torso: 0.95,
    neck: 0.11,
    shoulders: 0.82,
    hips: 0.46,
    arm: 1.05,
    thick: 1.9,
    chest: [0.42, 0.3],
    waist: [0.36, 0.3],
    belly: 0.34,
    hunch: 0.1,
    hand: 1.6,
    foot: 1.5,
    skin,
    nails: 0x4a3e2a,
  };
  const b = bodyOf(p);
  const { add, y, s } = b;
  const hy = y.head - p.hunch * 0.45 + 0.14;
  const hz = p.hunch + 0.04;
  // A small head on a thick neck: heavy brow, flat nose, an underbite with two tusks.
  add("head", skin, blob(0.19, 0.18, 0.18, 0, hy + 0.03, hz - 0.02));
  add("head", skin, blob(0.2, 0.11, 0.17, 0, hy - 0.09, hz + 0.04));
  add("head", shade(skin, 0.9), blob(0.17, 0.045, 0.06, 0, hy + 0.07, hz + 0.12));
  add("head", shade(skin, 0.88), blob(0.05, 0.04, 0.045, 0, hy - 0.01, hz + 0.17));
  for (const sign of [1, -1]) add("head", 0x2a1e16, blob(0.012, 0.01, 0.01, sign * 0.022, hy - 0.035, hz + 0.2));
  eyes(add, { at: [0.06, hy + 0.035, hz + 0.135], r: 0.022, white: 0xd8ccae, brow: shade(skin, 0.8), browTilt: 0.3 });
  add("head", shade(skin, 0.95), blob(0.13, 0.06, 0.07, 0, hy - 0.13, hz + 0.13));
  add("head", 0x3a2418, blob(0.09, 0.012, 0.02, 0, hy - 0.1, hz + 0.18));
  for (const sign of [1, -1]) {
    add("head", 0xe8dcbc, spike(0.022, [sign * 0.07, hy - 0.11, hz + 0.17], [sign * 0.085, hy - 0.02, hz + 0.18], 6));
    add("head", skin, ear(0.04, 0.02, [sign * 0.16, hy + 0.01, hz - 0.03], [sign * 0.24, hy + 0.05, hz - 0.06]));
  }
  // A few strands of hair tied up on top.
  add("head", 0x2a2018, blob(0.05, 0.06, 0.05, 0, hy + 0.21, hz - 0.05));
  // A hide round the waist, a shoulder strap, and iron bands on the wrists.
  loincloth(add, b, {
    cloth: 0x6e5236,
    belt: 0x3a2a1e,
    waistX: p.waist[0],
    waistZ: p.waist[1] + p.belly * 0.3,
    drop: 0.5,
    studs: 0x8a8a8a,
  });
  add("chest", 0x8a6a48, blob(0.2 * s, 0.09 * s, 0.19 * s, 0.25 * s, y.arm + 0.01, p.hunch * 0.25));
  add("chest", 0x6a5034, blob(0.15 * s, 0.13 * s, 0.17 * s, 0.29 * s, y.arm - 0.08 * s, p.hunch * 0.25));
  // A cord of teeth lying on the chest, sagging in the middle.
  const cord = (u) => [u * 0.16 * s, y.arm - 0.06 * s - (1 - u * u) * 0.07 * s, p.hunch * 0.2 + p.chest[1] * 0.97];
  for (let i = 0; i < 4; i++)
    add("chest", 0x3a2a1e, limb(0.008 * s, 0.008 * s, cord(-1 + i * 0.667), cord(-1 + (i + 1) * 0.667), 5));
  for (const u of [-0.6, -0.2, 0.2, 0.6]) {
    const [nx, ny, nz] = cord(u);
    add("chest", 0xe8dcbc, spike(0.014 * s, [nx, ny, nz], [nx, ny - 0.06 * s, nz + 0.012 * s], 5));
  }
  for (const [side, sign] of SIDES) {
    band(add, `${side}LowerArm`, 0x5a5a5e, [sign * (b.sx + p.arm * 0.88), y.arm, 0], 0.075 * s, s * 2);
  }
  return { ...b, height: 1, seed: 2 };
}

/** Troll (SRD: Large giant): tall and lanky, arms to its knees, a long nose, claws, matted hair. */
function troll() {
  const skin = 0x5f7550;
  const p = {
    leg: 1.15,
    torso: 0.85,
    neck: 0.12,
    shoulders: 0.58,
    hips: 0.3,
    arm: 1.3,
    thick: 1.15,
    chest: [0.27, 0.2],
    waist: [0.18, 0.14],
    hunch: 0.32,
    hand: 1.9,
    foot: 1.7,
    claws: true,
    nails: 0x1e1a14,
    skin,
  };
  const b = bodyOf(p);
  const { add, y } = b;
  const hy = y.head - p.hunch * 0.45 + 0.13;
  const hz = p.hunch + 0.06;
  // A long face: low brow, deep-set eyes, a drooping nose, a wide mouth of crooked teeth.
  add("head", skin, blob(0.13, 0.14, 0.14, 0, hy + 0.03, hz - 0.03));
  add("head", skin, blob(0.12, 0.09, 0.13, 0, hy - 0.08, hz + 0.04));
  add("head", shade(skin, 0.85), blob(0.11, 0.03, 0.035, 0, hy + 0.055, hz + 0.115));
  add("head", shade(skin, 0.9), limb(0.034, 0.02, [0, hy + 0.03, hz + 0.12], [0, hy - 0.04, hz + 0.2], 8));
  add("head", shade(skin, 0.9), spike(0.02, [0, hy - 0.04, hz + 0.2], [0, hy - 0.085, hz + 0.215], 8));
  for (const sign of [1, -1])
    add("head", shade(skin, 0.9), blob(0.022, 0.016, 0.02, sign * 0.022, hy - 0.05, hz + 0.18));
  eyes(add, {
    at: [0.045, hy + 0.025, hz + 0.115],
    r: 0.018,
    white: 0xd8a040,
    pupil: 0x200c08,
    brow: shade(skin, 0.7),
    browTilt: 0.5,
  });
  add("head", 0x1e1210, blob(0.08, 0.014, 0.03, 0, hy - 0.13, hz + 0.13));
  for (const sign of [1, -1])
    add("head", 0xd0c49a, spike(0.016, [sign * 0.055, hy - 0.14, hz + 0.15], [sign * 0.062, hy - 0.08, hz + 0.165], 5));
  for (const x of [-0.02, 0.015])
    add("head", 0xd0c49a, spike(0.008, [x, hy - 0.122, hz + 0.155], [x, hy - 0.142, hz + 0.158], 4));
  for (const sign of [1, -1])
    add("head", skin, ear(0.04, 0.012, [sign * 0.12, hy + 0.02, hz - 0.02], [sign * 0.25, hy - 0.06, hz - 0.08]));
  // Matted hair down the back of the head and neck, and warts.
  add("head", 0x2b3622, blob(0.135, 0.12, 0.12, 0, hy + 0.07, hz - 0.07));
  for (const [x, len, z] of [
    [-0.1, 0.3, -0.06],
    [-0.05, 0.38, -0.12],
    [0, 0.42, -0.14],
    [0.05, 0.36, -0.12],
    [0.1, 0.28, -0.06],
  ])
    add("head", 0x2b3622, limb(0.03, 0.012, [x, hy + 0.06, hz + z], [x * 1.3, hy + 0.06 - len, hz + z - 0.05], 6));
  for (const [x, wy, z] of [
    [0.08, 0.05, 0.1],
    [-0.1, -0.02, 0.08],
    [0.03, -0.06, 0.2],
  ])
    add("head", shade(skin, 0.8), nub(0.012, 0.012, 0.012, x, hy + wy, hz + z));
  loincloth(add, b, { cloth: 0x4a3a2a, belt: 0x2e2418, waistX: p.waist[0], waistZ: p.waist[1], drop: 0.38 });
  return { ...b, height: 1, seed: 3 };
}

/** Minotaur (SRD: Large monstrosity): a bull's head and horns on a huge man's body, on hooves. */
function minotaur() {
  const fur = 0x5c3c26;
  const p = {
    leg: 1.1,
    torso: 0.92,
    neck: 0.2,
    shoulders: 0.78,
    hips: 0.38,
    arm: 0.98,
    thick: 1.75,
    chest: [0.4, 0.27],
    waist: [0.26, 0.2],
    hunch: 0.16,
    hand: 1.5,
    foot: 1.5,
    hooves: 0x26201c,
    skin: fur,
    shins: shade(fur, 0.8),
    nails: 0x2a2420,
  };
  const b = bodyOf(p);
  const { add, y, s } = b;
  const hy = y.head - p.hunch * 0.45 + 0.15;
  const hz = p.hunch + 0.02;
  const muzzle = 0x3a2a20;
  // A bull's head: broad skull, long muzzle, wide nostrils and a ring, ears out to the sides.
  add("head", fur, blob(0.18, 0.14, 0.17, 0, hy + 0.04, hz - 0.02));
  add("head", fur, limb(0.13, 0.115, [0, hy + 0.01, hz + 0.06], [0, hy - 0.06, hz + 0.17], 12));
  add("head", muzzle, blob(0.125, 0.085, 0.075, 0, hy - 0.08, hz + 0.21));
  for (const sign of [1, -1]) add("head", 0x140e0a, blob(0.02, 0.022, 0.012, sign * 0.045, hy - 0.07, hz + 0.28));
  add("head", 0xc8a040, new TorusGeometry(0.04, 0.008, 6, 14).translate(0, hy - 0.13, hz + 0.285));
  eyes(add, {
    at: [0.115, hy + 0.04, hz + 0.08],
    r: 0.022,
    white: 0xd8c8b0,
    pupil: 0x140a06,
    brow: shade(fur, 0.7),
    browTilt: 0.45,
    browWidth: 1.3,
  });
  for (const sign of [1, -1]) {
    add("head", fur, ear(0.05, 0.015, [sign * 0.14, hy + 0.07, hz - 0.03], [sign * 0.28, hy + 0.04, hz - 0.02]));
    // Horns: out to the side, then up and forward.
    add(
      "head",
      0xd8cdb2,
      horn(0.065, [
        [sign * 0.13, hy + 0.13, hz],
        [sign * 0.27, hy + 0.17, hz + 0.01],
        [sign * 0.37, hy + 0.27, hz + 0.05],
        [sign * 0.39, hy + 0.42, hz + 0.12],
      ]),
    );
    add("head", 0x3a3026, spike(0.012, [sign * 0.385, hy + 0.37, hz + 0.1], [sign * 0.39, hy + 0.43, hz + 0.125], 6));
  }
  add("head", shade(fur, 0.7), blob(0.07, 0.05, 0.06, 0, hy + 0.17, hz + 0.02));
  // A mane down the thick neck, a red kilt on a studded belt, and bracers.
  add("neck", shade(fur, 0.75), blob(0.18 * s, 0.22 * s, 0.14 * s, 0, y.head - 0.15, p.hunch * 0.3));
  loincloth(add, b, {
    cloth: 0x7a2a20,
    belt: 0x3a2a1e,
    waistX: p.waist[0],
    waistZ: p.waist[1],
    drop: 0.45,
    studs: 0xb8a060,
  });
  add(
    "hips",
    0x7a2a20,
    new CylinderGeometry(p.waist[0] * 1.05, p.waist[0] * 1.35, 0.36 * s, 14, 1, true)
      .scale(1, 1, p.waist[1] / p.waist[0])
      .translate(0, y.hips - 0.16 * s, 0),
  );
  for (const [side, sign] of SIDES)
    band(add, `${side}LowerArm`, 0x4a3424, [sign * (b.sx + p.arm * 0.86), y.arm, 0], 0.07 * s, s * 2);
  return { ...b, height: 1, seed: 4 };
}

export const BESTIARY = { goblin, ogre, troll, minotaur };

/** The monster `kind` (a key of BESTIARY), walking like any other humanoid. */
export function createBuilt(kind) {
  const made = (BESTIARY[kind] ?? goblin)();
  return figureFrom(made.joints, made.parts, { height: made.height, seed: made.seed });
}
