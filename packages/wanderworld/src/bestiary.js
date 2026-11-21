// Monsters Wanderworld builds itself, in code, for SRD creatures no pack has a model for. Each is built
// as the built-in person is (figure.js): parts bound wholly to the bones of a humanoid skeleton in one
// skinned mesh, so it walks, runs and strikes with the people's clips and costs no download. What it
// carries is part of the same mesh, in its right hand, so it swings with the arm. Sizes are the
// creature's own, in metres, and the same kind always looks the same.
import { BoxGeometry, ConeGeometry, CylinderGeometry, Quaternion, SphereGeometry, TorusGeometry, Vector3 } from "three";
import { blob, figureFrom } from "./figure.js";
import { hashString, rng } from "./world.js";

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
 * A head's eyes: whites (or a colour) and pupils (`slit` for a reptile's), with a brow over each that
 * dips towards the nose by `browTilt` for a scowl, and a heavy upper `lid` if asked. `at` is the left
 * eye's centre, `r` its size.
 */
function eyes(add, { at, r, white = 0xf2ecd8, pupil = 0x1a1410, brow, browTilt = 0.4, browWidth = 1.5, lid, slit }) {
  const [ex, ey, ez] = at;
  for (const sign of [1, -1]) {
    add("head", white, blob(r, r * 0.8, r * 0.6, sign * ex, ey, ez));
    add(
      "head",
      pupil,
      nub(r * (slit ? 0.16 : 0.5), r * (slit ? 0.68 : 0.55), r * 0.35, sign * ex * 1.02, ey, ez + r * 0.45),
    );
    // (A heavy upper lid over the top half: a hooded, wary look.)
    if (lid !== undefined)
      add("head", lid, blob(r * 1.12, r * 0.55, r * 0.74, sign * ex, ey + r * 0.55, ez + r * 0.06));
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

// ── What they wear and carry ─────────────────────────────────────────────────────────────────────────

/** A box w × h × d centred at (x, y, z). */
const box = (w, h, d, x, y, z) => new BoxGeometry(w, h, d).translate(x, y, z);

/** A pole along z, from z = a to z = b, of radius r (the far end can be thicker: r2). */
const pole = (r, a, b, r2 = r, sides = 6) => along(new CylinderGeometry(r2, r, b - a, sides), [0, 0, a], [0, 0, b]);

/** A flat blade along z from z = a for `long`, `wide` across x and `thin` in y, ending in a point. */
function blade(wide, thin, a, long, hex) {
  const point = Math.min(long * 0.25, wide * 2);
  const tip = new ConeGeometry(wide / Math.SQRT2, point, 4).rotateY(Math.PI / 4).scale(1, 1, thin / wide);
  return [
    [hex, box(wide, thin, long - point, 0, 0, a + (long - point) / 2)],
    [hex, along(tip, [0, 0, a + long - point], [0, 0, a + long])],
  ];
}

/**
 * Weapons, each made with the grip at the origin, running along +z, its flat facing +y (the back of the
 * hand) and anything to one side (an axe's head) towards −x, `k` times a person's size: a list of
 * [colour, geometry] for `wield`.
 */
const WEAPONS = {
  sword: (k, { len = 0.8, steel = 0xb9bec2, grip = 0x3a2a1e, guard = 0x8a7448 } = {}) => [
    [grip, pole(0.016 * k, -0.085 * k, 0.06 * k)],
    [guard, nub(0.024 * k, 0.024 * k, 0.024 * k, 0, 0, -0.095 * k)],
    [guard, box(0.17 * k, 0.026 * k, 0.03 * k, 0, 0, 0.07 * k)],
    ...blade(0.05 * k, 0.012 * k, 0.085 * k, len * k, steel),
  ],
  scimitar: (k, { len = 0.65, steel = 0xa8adb0, grip = 0x4a3424, guard = 0x6a5a3a } = {}) => {
    const out = [
      [grip, pole(0.015 * k, -0.08 * k, 0.05 * k)],
      [guard, box(0.12 * k, 0.022 * k, 0.025 * k, 0, 0, 0.06 * k)],
    ];
    // The blade curves back towards +x as it goes, widening towards the end.
    const at = (u) => [0.12 * k * u * u, 0, (0.075 + len * u) * k];
    for (let i = 0; i < 4; i++) {
      const a = at(i / 4);
      const b = at((i + 1) / 4);
      out.push([steel, along(new BoxGeometry((0.045 + i * 0.008) * k, length(a, b) * 1.08, 0.01 * k), a, b)]);
    }
    const end = at(1);
    out.push([steel, spike(0.035 * k, end, [end[0] + 0.05 * k, 0, end[2] + 0.06 * k], 4)]);
    return out;
  },
  dagger: (k, { steel = 0xb0b4b8, grip = 0x3a2a1e } = {}) => [
    [grip, pole(0.013 * k, -0.06 * k, 0.04 * k)],
    [steel, box(0.08 * k, 0.018 * k, 0.02 * k, 0, 0, 0.05 * k)],
    ...blade(0.035 * k, 0.01 * k, 0.06 * k, 0.22 * k, steel),
  ],
  // An axe: a long haft and a broad, curved head to one side at its end (`double`: both sides).
  axe: (k, { len = 1.1, head = 0x6a6e72, edge = 0xb0b4b8, wood = 0x5a3e26, double = false } = {}) => {
    const z = len * 0.88 * k;
    const out = [
      [wood, pole(0.022 * k, -0.15 * k, len * k)],
      [head, box(0.07 * k, 0.04 * k, 0.12 * k, 0, 0, z)],
    ];
    for (const side of double ? [-1, 1] : [-1]) {
      const fan = new CylinderGeometry(0.16 * k, 0.16 * k, 0.02 * k, 12, 1, false, side < 0 ? Math.PI : 0, Math.PI);
      out.push([head, box(0.11 * k, 0.022 * k, 0.1 * k, side * 0.08 * k, 0, z)]);
      out.push([edge, fan.scale(1, 1, 1.15).translate(side * 0.1 * k, 0, z)]);
    }
    return out;
  },
  // A club: thickening to a knotted end; `spikes` of iron driven through it.
  club: (k, { len = 0.75, wood = 0x6a4a2c, spikes = 0, iron = 0x5a5e62 } = {}) => {
    const out = [
      [wood, pole(0.025 * k, -0.1 * k, len * k, 0.065 * k, 8)],
      [wood, nub(0.068 * k, 0.068 * k, 0.068 * k, 0, 0, len * k)],
      [shade(wood, 0.8), nub(0.03 * k, 0.03 * k, 0.03 * k, 0.05 * k, 0.02 * k, len * 0.7 * k)],
      [shade(wood, 0.8), nub(0.025 * k, 0.025 * k, 0.025 * k, -0.04 * k, -0.03 * k, len * 0.5 * k)],
    ];
    for (let i = 0; i < spikes; i++) {
      const a = (i / spikes) * Math.PI * 2;
      const zz = len * k * (0.75 + 0.2 * (i % 2));
      const r = 0.055 * k;
      const from = [Math.cos(a) * r, Math.sin(a) * r, zz];
      out.push([iron, spike(0.012 * k, from, [from[0] * 2.2, from[1] * 2.2, zz], 4)]);
    }
    return out;
  },
  // A spear, held a third of the way along: a shaft, a leaf-shaped head and a binding below it.
  spear: (k, { len = 2, wood = 0x7a5a3a, steel = 0xa8acb0, binding = 0x3a2a1e } = {}) => [
    [wood, pole(0.017 * k, -len * 0.35 * k, len * 0.62 * k)],
    [binding, pole(0.022 * k, len * 0.6 * k, len * 0.64 * k)],
    ...blade(0.06 * k, 0.014 * k, len * 0.63 * k, 0.24 * k, steel),
  ],
  // A morningstar: a haft and a spiked iron ball.
  morningstar: (k, { len = 0.7, wood = 0x5a3e26, iron = 0x55585c } = {}) => {
    const end = len * k;
    const out = [
      [wood, pole(0.02 * k, -0.1 * k, end - 0.05 * k)],
      [iron, nub(0.075 * k, 0.075 * k, 0.075 * k, 0, 0, end)],
      [iron, pole(0.03 * k, end - 0.12 * k, end - 0.06 * k)],
    ];
    const r = 0.07 * k;
    for (const [dx, dy, dz] of [
      [1, 0, 0],
      [-1, 0, 0],
      [0, 1, 0],
      [0, -1, 0],
      [0, 0, 1],
      [0.7, 0.7, 0.3],
      [-0.7, 0.7, 0.3],
      [0.7, -0.7, 0.3],
      [-0.7, -0.7, 0.3],
    ]) {
      const from = [dx * r, dy * r, end + dz * r];
      out.push([iron, spike(0.016 * k, from, [dx * r * 1.9, dy * r * 1.9, end + dz * r * 1.9], 4)]);
    }
    return out;
  },
};

/**
 * Puts a weapon (WEAPONS) in the right hand, turned by `tilt` (radians): 0 points it the way the hand's
 * thumb does, and as the people's clips hold the hand, below 0 lowers it (a blade held ready, forward and
 * down; an axe or a club hanging at rest) and above 0 raises it (a spear held upright).
 */
function wield(b, p, parts, tilt = -0.5) {
  const h = p.hand * b.s;
  const grip = [-(b.sx + p.arm + 0.06 * h), b.y.arm - 0.014 * h, 0];
  for (const [hex, geometry] of parts) b.add("rightHand", hex, geometry.rotateY(tilt).translate(...grip));
}

/** A round shield on the back of the left forearm: its face, rim and boss, with `spikes` and an emblem. */
function shield(b, p, { r, face, rim, boss, spikes = 0, tip = 0xd8cfb8, emblem }) {
  const { s, t } = b;
  const x = b.sx + p.arm * 0.75;
  const y0 = b.y.arm + 0.044 * t + 0.022 * s;
  const bone = "leftLowerArm";
  b.add(bone, face, new CylinderGeometry(r, r, 0.03 * s, 18).translate(x, y0, 0));
  b.add(bone, rim, new TorusGeometry(r, 0.014 * s, 5, 20).rotateX(Math.PI / 2).translate(x, y0, 0));
  if (emblem !== undefined)
    b.add(bone, emblem, new CylinderGeometry(r * 0.55, r * 0.55, 0.032 * s, 3).translate(x, y0 + 0.002 * s, 0));
  b.add(
    bone,
    boss,
    new SphereGeometry(r * 0.22, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2).translate(x, y0 + 0.012 * s, 0),
  );
  for (let i = 0; i < spikes; i++) {
    const a = (i / spikes) * Math.PI * 2;
    const at = [x + Math.cos(a) * r * 0.62, y0 + 0.012 * s, Math.sin(a) * r * 0.62];
    b.add(bone, tip, spike(0.018 * s, at, [at[0], at[1] + 0.08 * s, at[2]], 5));
  }
}

/** A cap of armour over a shoulder (`side`, `sign`: ±1), with a rim and, if asked, spikes. */
function pauldron(b, side, sign, { hex, rim, size = 1, spikes = 0, spikeHex }) {
  const { s, t, sx, y } = b;
  const r = 0.085 * t * size;
  const at = [sign * (sx + 0.035 * s), y.arm + 0.025 * s, 0];
  const bone = `${side}UpperArm`;
  const cap = new SphereGeometry(r, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.55).scale(1.15, 0.85, 1.1);
  b.add(bone, hex, cap.translate(...at));
  const ring = new TorusGeometry(r * 1.1, 0.011 * s, 5, 16).rotateX(Math.PI / 2).scale(1.05, 1, 1);
  b.add(bone, rim, ring.translate(at[0], at[1] - r * 0.12, at[2]));
  for (let i = 0; i < spikes; i++) {
    const from = [at[0] + sign * r * 0.3, at[1] + r * 0.6, at[2] + (i - (spikes - 1) / 2) * r * 0.55];
    b.add(bone, spikeHex ?? rim, spike(0.02 * s, from, [from[0] + sign * 0.03 * s, from[1] + 0.1 * s, from[2]], 5));
  }
}

/** A belt round the hips with a buckle in front and, if asked, a pouch at the side. */
function belt(b, { hex, buckle, waistX, waistZ, pouch, drop = 0 }) {
  const { y, s } = b;
  const at = y.hips + 0.05 * s - drop;
  const ring = new TorusGeometry(1, 0.1, 6, 20).rotateX(Math.PI / 2).scale(waistX * 1.04, s * 0.28, waistZ * 1.08);
  b.add("hips", hex, ring.translate(0, at, 0));
  if (buckle !== undefined) {
    b.add("hips", buckle, box(0.055 * s, 0.045 * s, 0.012 * s, 0, at, waistZ * 1.11));
    b.add("hips", hex, box(0.03 * s, 0.022 * s, 0.014 * s, 0, at, waistZ * 1.115));
  }
  if (pouch !== undefined) {
    b.add("hips", pouch, box(0.06 * s, 0.07 * s, 0.035 * s, waistX * 0.85, at - 0.04 * s, waistZ * 0.7));
    b.add("hips", shade(pouch, 0.8), box(0.064 * s, 0.022 * s, 0.038 * s, waistX * 0.85, at - 0.01 * s, waistZ * 0.7));
  }
}

/** A cloth panel hanging in front (and behind, `back`) from the chest to below the hips: a tabard. */
function tabard(b, { hex, trim, wide, top, bottom, chestZ, waistZ, back = true }) {
  const { y, s } = b;
  const mid = y.hips + 0.04 * s;
  for (const dir of back ? [1, -1] : [1]) {
    const k = dir < 0 ? 0.85 : 1;
    b.add(
      "chest",
      shade(hex, k),
      box(wide, top - mid, 0.016 * s, 0, (top + mid) / 2, dir * (chestZ * 0.98 + 0.008 * s)),
    );
    b.add(
      "hips",
      shade(hex, k),
      box(wide * 0.95, mid - bottom, 0.016 * s, 0, (mid + bottom) / 2, dir * (waistZ * 1.1)),
    );
    if (trim !== undefined)
      b.add("hips", trim, box(wide * 0.97, 0.02 * s, 0.018 * s, 0, bottom + 0.01 * s, dir * (waistZ * 1.1)));
  }
}

/** A tail from the small of the back, drooping as it goes, `len` long, `r` thick at the root. */
function tail(b, hex, { len, r, droop = 0.25, waistZ, tip }) {
  const { y, s } = b;
  const at = (u) => [0, y.hips - 0.02 * s - droop * len * u * u * 1.4 + len * 0.15 * u, -waistZ * 0.8 - len * u];
  const n = 5;
  for (let i = 0; i < n; i++) {
    const ra = r * (1 - i / n) + r * 0.08;
    const rb = r * (1 - (i + 1) / n) + r * 0.08;
    b.add("hips", hex, limb(ra, rb, at(i / n), at((i + 1) / n), 8));
  }
  if (tip !== undefined) b.add("hips", tip, spike(r * 0.15, at(1), [0, at(1)[1] - 0.02 * s, at(1)[2] - 0.08 * s], 5));
}

/** Tufts or spines: a cone from each base to each tip. */
function tufts(b, bone, hex, list, r) {
  for (const [from, to] of list) b.add(bone, hex, spike(r, from, to, 5));
}

/** Spots scattered over an ellipsoid (centre, radii) on the side facing `facing` (±1 in z, or 0: all round). */
function spots(b, bone, hex, { centre, radii, count, r, random, facing = 0 }) {
  for (let i = 0; i < count; i++) {
    const a = random() * Math.PI * 2;
    const h = random() * 1.4 - 0.7;
    const round = Math.sqrt(1 - h * h);
    const dz = facing ? Math.abs(Math.cos(a)) * round * facing : Math.cos(a) * round;
    const dx = Math.sin(a) * round;
    const size = r * (0.7 + random() * 0.6);
    b.add(
      bone,
      hex,
      nub(size, size, size, centre[0] + dx * radii[0], centre[1] + h * radii[1], centre[2] + dz * radii[2]),
    );
  }
}

/** Muscle that shows on a bare chest and arms: pectorals, the belly's ridges, biceps. */
function muscle(b, p, hex) {
  const { y, s, t, sx } = b;
  const [chestX, chestZ] = p.chest;
  const [waistX, waistZ] = p.waist;
  const ribY = y.chest + p.torso * 0.18;
  for (const sign of [1, -1]) {
    const pec = blob(
      chestX * 0.48,
      p.torso * 0.12,
      chestZ * 0.32,
      sign * chestX * 0.42,
      ribY + p.torso * 0.04,
      chestZ * 0.78 + p.hunch * 0.2,
    );
    b.add("chest", hex, pec);
    for (let row = 0; row < 3; row++) {
      const ridge = blob(
        waistX * 0.24,
        0.035 * s,
        waistZ * 0.18,
        sign * waistX * 0.25,
        y.hips + 0.08 * s + row * 0.075 * s,
        waistZ * 0.86,
      );
      b.add("spine", shade(hex, 0.97), ridge);
    }
    const side = sign > 0 ? "left" : "right";
    b.add(
      `${side}UpperArm`,
      hex,
      blob(p.arm * 0.16, 0.045 * t, 0.04 * t, sign * (sx + p.arm * 0.27), y.arm + 0.006 * t, 0.018 * t),
    );
  }
}

/** Where a head sits: its centre's height `hy`, `lift` above the head joint, and how far forward `hz`. */
const headAt = (b, p, lift) => ({ hy: b.y.head - p.hunch * 0.45 + lift, hz: p.hunch });

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
  belt(b, { hex: 0x8a7350, waistX: p.waist[0], waistZ: p.waist[1], pouch: 0x5a4430, drop: -0.01 });
  wield(b, p, WEAPONS.scimitar(0.62), -0.5);
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
  wield(b, p, WEAPONS.club(s * 1.5, { len: 0.85, spikes: 6 }), -0.9);
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
  wield(b, p, WEAPONS.axe(s * 1.25, { len: 1.15, double: true }), -1.0);
  return { ...b, height: 1, seed: 4 };
}

/** Hobgoblin (SRD: Medium humanoid): a soldier, rust-skinned, in mail and a red tabard, sword and shield. */
function hobgoblin() {
  const skin = 0xb5603a;
  const hair = 0x1c1612;
  const p = {
    leg: 0.86,
    torso: 0.6,
    neck: 0.08,
    shoulders: 0.4,
    hips: 0.2,
    arm: 0.6,
    thick: 1.15,
    chest: [0.19, 0.13],
    waist: [0.15, 0.11],
    hunch: 0.03,
    hand: 1.05,
    foot: 1.1,
    skin,
    shirt: 0x50545a,
    limbs: 0x50545a,
    legs: 0x3e3028,
    shins: 0x2a221c,
    feet: 0x2a221c,
  };
  const b = bodyOf(p);
  const { add, y, s } = b;
  const { hy, hz } = headAt(b, p, 0.12);
  // A broad, hard face: square jaw, heavy brow, a flat nose, ears swept back, a topknot.
  add("head", skin, blob(0.1, 0.11, 0.105, 0, hy + 0.01, hz - 0.005));
  add("head", skin, blob(0.09, 0.062, 0.088, 0, hy - 0.058, hz + 0.02));
  add("head", shade(skin, 0.86), blob(0.085, 0.02, 0.028, 0, hy + 0.035, hz + 0.078));
  add("head", shade(skin, 0.92), blob(0.032, 0.026, 0.026, 0, hy - 0.008, hz + 0.1));
  for (const sign of [1, -1]) add("head", 0x2a1410, nub(0.008, 0.006, 0.006, sign * 0.014, hy - 0.022, hz + 0.122));
  eyes(add, {
    at: [0.038, hy + 0.014, hz + 0.084],
    r: 0.016,
    white: 0xe8b030,
    lid: shade(skin, 0.9),
    brow: hair,
    browTilt: 0.5,
    browWidth: 1.6,
  });
  add("head", 0x2a1410, blob(0.042, 0.006, 0.01, 0, hy - 0.05, hz + 0.098));
  for (const sign of [1, -1]) {
    add(
      "head",
      0xece2c8,
      spike(0.006, [sign * 0.024, hy - 0.056, hz + 0.098], [sign * 0.026, hy - 0.036, hz + 0.104], 4),
    );
    add("head", skin, ear(0.034, 0.01, [sign * 0.094, hy + 0.012, hz - 0.012], [sign * 0.19, hy + 0.062, hz - 0.075]));
  }
  add("head", hair, blob(0.098, 0.05, 0.098, 0, hy + 0.075, hz - 0.02));
  add("head", hair, blob(0.03, 0.035, 0.03, 0, hy + 0.135, hz - 0.045));
  add("head", hair, limb(0.016, 0.008, [0, hy + 0.13, hz - 0.06], [0, hy + 0.0, hz - 0.15], 6));
  // Mail under a red tabard, iron on the shoulders, a belt with a brass buckle, leather bracers, boots.
  tabard(b, {
    hex: 0x8a2a20,
    trim: 0xb89a50,
    wide: 0.2 * s,
    top: y.arm - 0.04 * s,
    bottom: y.knee + 0.12 * s,
    chestZ: p.chest[1],
    waistZ: p.waist[1],
  });
  add(
    "chest",
    0x1e1a18,
    new CylinderGeometry(0.045 * s, 0.045 * s, 0.02 * s, 3)
      .rotateX(Math.PI / 2)
      .translate(0, y.chest + 0.12 * s, p.chest[1] * 0.98 + 0.02 * s),
  );
  for (const [side, sign] of SIDES) {
    pauldron(b, side, sign, { hex: 0x6a6e74, rim: 0x3e4246 });
    band(add, `${side}LowerArm`, 0x5a3a24, [sign * (b.sx + p.arm * 0.8), y.arm, 0], 0.042 * b.t, s * 1.6);
    band(add, `${side}LowerArm`, 0x5a3a24, [sign * (b.sx + p.arm * 0.68), y.arm, 0], 0.046 * b.t, s * 1.6);
    add(
      `${side}LowerLeg`,
      shade(0x2a221c, 1.3),
      new TorusGeometry(0.05 * b.t, 0.012 * s, 5, 12).rotateX(Math.PI / 2).translate(sign * b.hx, y.knee - 0.05 * s, 0),
    );
  }
  belt(b, { hex: 0x3a2618, buckle: 0xb89a50, waistX: p.waist[0], waistZ: p.waist[1] * 1.15, pouch: 0x5a3a24 });
  wield(b, p, WEAPONS.sword(s), -0.5);
  shield(b, p, { r: 0.25 * s, face: 0x7a2018, rim: 0x5a5e64, boss: 0x6a6e74, emblem: 0x1e1a18 });
  return { ...b, height: 1, seed: 5 };
}

/** Bugbear (SRD: Medium humanoid): a huge, hairy goblin, bear-faced and long-armed, with a morningstar. */
function bugbear() {
  const fur = 0x8a5c34;
  const dark = 0x5e3e24;
  const p = {
    leg: 1.0,
    torso: 0.72,
    neck: 0.08,
    shoulders: 0.5,
    hips: 0.26,
    arm: 0.86,
    thick: 1.35,
    chest: [0.25, 0.19],
    waist: [0.2, 0.16],
    hunch: 0.18,
    hand: 1.35,
    foot: 1.3,
    claws: true,
    nails: 0x241a12,
    skin: fur,
    shirt: 0x5c4028,
    legs: 0x4e3a28,
  };
  const b = bodyOf(p);
  const { add, y, s, t } = b;
  const { hy, hz } = headAt(b, p, 0.14);
  // (The vest hangs open over a shaggy chest.)
  add(
    "chest",
    0x9a6a3e,
    blob(p.chest[0] * 0.34, p.torso * 0.3, 0.05 * s, 0, y.chest + p.torso * 0.16, p.chest[1] * 0.86 + p.hunch * 0.2),
  );
  // A bear's face on a goblin's skull: a heavy jaw, a short dark snout, small pointed ears, a snarl.
  add("head", fur, blob(0.13, 0.12, 0.14, 0, hy + 0.02, hz - 0.02));
  add("head", fur, blob(0.14, 0.078, 0.115, 0, hy - 0.06, hz + 0.02));
  add("head", 0x7a5030, blob(0.064, 0.05, 0.085, 0, hy - 0.045, hz + 0.12));
  add("head", 0x1e1612, blob(0.025, 0.018, 0.018, 0, hy - 0.025, hz + 0.198));
  add("head", 0x1e120c, blob(0.06, 0.02, 0.03, 0, hy - 0.085, hz + 0.145));
  for (const sign of [1, -1]) {
    add(
      "head",
      0xe8dcc0,
      spike(0.013, [sign * 0.032, hy - 0.072, hz + 0.165], [sign * 0.034, hy - 0.115, hz + 0.17], 4),
    );
    add(
      "head",
      0xe8dcc0,
      spike(0.008, [sign * 0.045, hy - 0.092, hz + 0.15], [sign * 0.047, hy - 0.068, hz + 0.155], 4),
    );
    add("head", fur, ear(0.045, 0.018, [sign * 0.1, hy + 0.08, hz - 0.03], [sign * 0.17, hy + 0.17, hz - 0.08]));
    add(
      "head",
      0x3a2418,
      ear(0.026, 0.01, [sign * 0.102, hy + 0.085, hz - 0.018], [sign * 0.15, hy + 0.15, hz - 0.055]),
    );
  }
  eyes(add, { at: [0.052, hy + 0.03, hz + 0.112], r: 0.016, white: 0xd06a20, lid: dark, brow: dark, browTilt: 0.65 });
  // A shaggy ruff round the face and a crest on top.
  const ruff = [];
  for (let i = 0; i < 9; i++) {
    const a = -1.2 + (i / 8) * 2.4;
    const from = [Math.sin(a) * 0.12, hy - 0.06 - Math.cos(a) * 0.04, hz + 0.02 + Math.cos(a) * 0.04];
    ruff.push([from, [from[0] * 1.5, from[1] - 0.07, from[2] - 0.02]]);
  }
  tufts(b, "head", dark, ruff, 0.03);
  tufts(
    b,
    "head",
    dark,
    [
      [
        [0, hy + 0.13, hz],
        [0, hy + 0.2, hz - 0.05],
      ],
      [
        [0.04, hy + 0.12, hz - 0.03],
        [0.06, hy + 0.18, hz - 0.09],
      ],
      [
        [-0.04, hy + 0.12, hz - 0.03],
        [-0.06, hy + 0.18, hz - 0.09],
      ],
    ],
    0.03,
  );
  // A hide vest trimmed with fur, fur on the shoulders and forearms, a hide kilt, iron wrist bands.
  add(
    "neck",
    dark,
    new TorusGeometry(0.11 * s, 0.05 * s, 6, 14)
      .rotateX(Math.PI / 2 - 0.25)
      .translate(0, y.arm + 0.01 * s, p.hunch * 0.45),
  );
  for (const [side, sign] of SIDES) {
    const tops = [];
    for (let i = 0; i < 4; i++) {
      const from = [sign * (b.sx + 0.0 * s + i * 0.05 * s), y.arm + 0.05 * t, (i % 2 ? 0.035 : -0.035) * s];
      tops.push([from, [from[0] + sign * 0.035 * s, from[1] + 0.05 * s, from[2] - 0.02 * s]]);
    }
    tufts(b, `${side}UpperArm`, dark, tops, 0.04 * s);
    band(add, `${side}LowerArm`, 0x55585c, [sign * (b.sx + p.arm * 0.88), y.arm, 0], 0.04 * t, s * 1.8);
  }
  loincloth(add, b, {
    cloth: 0x6a4a30,
    belt: 0x3a2618,
    waistX: p.waist[0],
    waistZ: p.waist[1],
    drop: 0.4,
    studs: 0x8a8a8a,
  });
  wield(b, p, WEAPONS.morningstar(s * 1.05), -0.8);
  return { ...b, height: 1, seed: 6 };
}

/** Gnoll (SRD: Medium monstrosity): a hyena on two legs, spotted and maned, with a spear. */
function gnoll() {
  const fur = 0xb8975e;
  const mane = 0x3a2c20;
  const p = {
    leg: 1.0,
    torso: 0.68,
    neck: 0.15,
    shoulders: 0.42,
    hips: 0.22,
    arm: 0.78,
    thick: 1.0,
    chest: [0.21, 0.16],
    waist: [0.14, 0.11],
    hunch: 0.28,
    hand: 1.2,
    foot: 1.35,
    claws: true,
    nails: 0x2a2018,
    skin: fur,
  };
  const b = bodyOf(p);
  const { add, y, s } = b;
  const { hy, hz } = headAt(b, p, 0.12);
  const random = rng(hashString("gnoll"));
  // A hyena's head: a broad skull, a thick blunt snout ending dark, dark round the eyes, short upright ears.
  const mask = 0x3a2e24;
  add("head", fur, blob(0.105, 0.095, 0.11, 0, hy + 0.03, hz - 0.02));
  add("head", fur, blob(0.1, 0.07, 0.09, 0, hy - 0.03, hz + 0.02));
  add("head", shade(fur, 0.82), limb(0.058, 0.044, [0, hy + 0.0, hz + 0.07], [0, hy - 0.04, hz + 0.18], 10));
  add("head", mask, blob(0.046, 0.04, 0.038, 0, hy - 0.044, hz + 0.198));
  add("head", 0x0e0a08, nub(0.02, 0.015, 0.012, 0, hy - 0.028, hz + 0.236));
  add("head", shade(fur, 0.85), blob(0.055, 0.028, 0.08, 0, hy - 0.085, hz + 0.12));
  add("head", 0x1e1410, blob(0.054, 0.008, 0.065, 0, hy - 0.07, hz + 0.14));
  for (const sign of [1, -1]) {
    add("head", 0xe8dcc0, spike(0.01, [sign * 0.032, hy - 0.066, hz + 0.18], [sign * 0.033, hy - 0.1, hz + 0.185], 4));
    add("head", mask, blob(0.03, 0.026, 0.02, sign * 0.05, hy + 0.03, hz + 0.07));
    add("head", fur, blob(0.032, 0.05, 0.016, sign * 0.07, hy + 0.115, hz - 0.04));
    add("head", mask, blob(0.02, 0.036, 0.01, sign * 0.07, hy + 0.115, hz - 0.026));
  }
  eyes(add, {
    at: [0.052, hy + 0.04, hz + 0.075],
    r: 0.016,
    white: 0xc8781e,
    lid: shade(fur, 0.8),
    brow: shade(fur, 0.75),
    browTilt: 0.45,
  });
  // A dark mane from the crown down the neck and back, and spots.
  const crest = [];
  for (let i = 0; i < 5; i++)
    crest.push([
      [0, hy + 0.1 - i * 0.02, hz - 0.02 - i * 0.03],
      [0, hy + 0.17 - i * 0.035, hz - 0.08 - i * 0.035],
    ]);
  tufts(b, "head", mane, crest, 0.025);
  const back = [];
  for (let i = 0; i < 5; i++) {
    const yy = y.arm + 0.06 * s - i * 0.09 * s;
    back.push([
      [0, yy, -p.chest[1] * 0.8 + p.hunch * 0.2],
      [0, yy + 0.04 * s, -p.chest[1] * 0.8 - 0.1 * s + p.hunch * 0.2],
    ]);
  }
  tufts(b, "chest", mane, back, 0.03 * s);
  tufts(
    b,
    "neck",
    mane,
    [
      [
        [0, y.head - p.hunch * 0.6, p.hunch * 0.5 - 0.05 * s],
        [0, y.head - p.hunch * 0.5, p.hunch * 0.5 - 0.15 * s],
      ],
    ],
    0.035 * s,
  );
  spots(b, "chest", 0x5a4630, {
    centre: [0, y.chest + p.torso * 0.18, p.hunch * 0.2],
    radii: [p.chest[0], p.torso * 0.3, p.chest[1]],
    count: 14,
    r: 0.018 * s,
    random,
  });
  spots(b, "spine", 0x5a4630, {
    centre: [0, y.spine, 0],
    radii: [p.waist[0] * 1.02, 0.1 * s, p.waist[1] * 1.02],
    count: 8,
    r: 0.016 * s,
    random,
  });
  for (const [side, sign] of SIDES) {
    spots(b, `${side}UpperArm`, 0x5a4630, {
      centre: [sign * (b.sx + p.arm * 0.25), y.arm, 0],
      radii: [p.arm * 0.2, 0.05 * b.t, 0.05 * b.t],
      count: 4,
      r: 0.014 * s,
      random,
    });
    spots(b, `${side}UpperLeg`, 0x5a4630, {
      centre: [sign * b.hx, (y.hips + y.knee) / 2, 0],
      radii: [0.075 * b.t, (y.hips - y.knee) * 0.4, 0.075 * b.t],
      count: 5,
      r: 0.016 * s,
      random,
    });
  }
  // A leather harness crossing the chest, a necklace of bones, a ragged loincloth.
  const front = p.chest[1] * 0.95 + p.hunch * 0.2;
  for (const sign of [1, -1])
    add(
      "chest",
      0x3e2c1e,
      along(
        new BoxGeometry(0.035 * s, 0.6 * s, 0.012 * s),
        [sign * b.sx * 0.8, y.arm, front * 0.9],
        [-sign * p.chest[0] * 0.7, y.chest - 0.02 * s, front * 1.02],
      ),
    );
  for (const u of [-0.6, -0.3, 0, 0.3, 0.6])
    add(
      "chest",
      0xe8dcc0,
      spike(
        0.012 * s,
        [u * 0.12 * s, y.arm - 0.07 * s - (1 - u * u) * 0.04 * s, front * 1.05],
        [u * 0.12 * s, y.arm - 0.12 * s - (1 - u * u) * 0.04 * s, front * 1.08],
        4,
      ),
    );
  loincloth(add, b, { cloth: 0x4a3a2c, belt: 0x2e2218, waistX: p.waist[0], waistZ: p.waist[1], drop: 0.36 });
  wield(b, p, WEAPONS.spear(s), 0.95);
  return { ...b, height: 1, seed: 7 };
}

/** Kobold (SRD: Small humanoid): knee-high to a person, scaly and dog-snouted, with little horns and a tail. */
function kobold() {
  const scales = 0x9a4e2c;
  const belly = 0xc89060;
  const p = {
    leg: 0.34,
    torso: 0.24,
    neck: 0.06,
    shoulders: 0.17,
    hips: 0.1,
    arm: 0.27,
    thick: 0.85,
    chest: [0.075, 0.06],
    waist: [0.06, 0.05],
    hunch: 0.05,
    hand: 1.4,
    foot: 1.6,
    claws: true,
    nails: 0x2a1a10,
    skin: scales,
  };
  const b = bodyOf(p);
  const { add, y, s } = b;
  const { hy, hz } = headAt(b, p, 0.065);
  // A long snout, big slit-pupilled eyes, two horns sweeping back, fins for ears.
  add("head", scales, blob(0.065, 0.06, 0.07, 0, hy + 0.01, hz - 0.01));
  add("head", scales, limb(0.042, 0.026, [0, hy - 0.005, hz + 0.04], [0, hy - 0.02, hz + 0.13], 10));
  add("head", belly, limb(0.03, 0.02, [0, hy - 0.04, hz + 0.03], [0, hy - 0.04, hz + 0.12], 8));
  add("head", 0x2a1410, blob(0.028, 0.004, 0.05, 0, hy - 0.03, hz + 0.09));
  for (const sign of [1, -1]) {
    add("head", 0x1e0e08, nub(0.006, 0.005, 0.005, sign * 0.012, hy - 0.01, hz + 0.152));
    add(
      "head",
      0xd8cbb0,
      horn(0.012, [
        [sign * 0.03, hy + 0.05, hz - 0.01],
        [sign * 0.045, hy + 0.075, hz - 0.06],
        [sign * 0.05, hy + 0.08, hz - 0.12],
      ]),
    );
    add(
      "head",
      shade(scales, 0.8),
      ear(0.03, 0.006, [sign * 0.055, hy + 0.005, hz - 0.03], [sign * 0.12, hy + 0.02, hz - 0.08]),
    );
    add(
      "head",
      0xece2c8,
      spike(0.005, [sign * 0.02, hy - 0.028, hz + 0.11], [sign * 0.021, hy - 0.042, hz + 0.112], 4),
    );
  }
  eyes(add, { at: [0.036, hy + 0.02, hz + 0.04], r: 0.018, white: 0xe8c030, slit: true, lid: shade(scales, 0.85) });
  // A pale belly, a tail, ridges down the back, a loincloth, a strap and a dagger.
  add(
    "chest",
    belly,
    blob(
      p.chest[0] * 0.62,
      p.torso * 0.3,
      p.chest[1] * 0.6,
      0,
      y.chest + p.torso * 0.15,
      p.chest[1] * 0.45 + p.hunch * 0.2,
    ),
  );
  add("spine", belly, blob(p.waist[0] * 0.65, 0.08 * s, 0.02 * s, 0, y.spine, p.waist[1] * 0.85));
  tail(b, scales, { len: 0.4, r: 0.042, droop: 0.5, waistZ: p.waist[1] });
  const ridges = [];
  for (let i = 0; i < 4; i++)
    ridges.push([
      [0, y.arm - i * 0.04, -p.chest[1] * 0.85],
      [0, y.arm - i * 0.04 + 0.01, -p.chest[1] * 0.85 - 0.025],
    ]);
  tufts(b, "chest", shade(scales, 0.75), ridges, 0.012);
  loincloth(add, b, { cloth: 0x5a4a38, belt: 0x3a2a1e, waistX: p.waist[0], waistZ: p.waist[1], drop: 0.12 });
  add(
    "chest",
    0x3a2a1e,
    along(
      new BoxGeometry(0.018, 0.22, 0.006),
      [b.sx * 0.8, y.arm, p.chest[1] * 0.8],
      [-p.chest[0] * 0.7, y.chest - 0.02, p.chest[1] * 0.95],
    ),
  );
  wield(b, p, WEAPONS.dagger(0.75), -0.4);
  return { ...b, height: 1, seed: 8 };
}

/** Lizardfolk (SRD: Medium humanoid): a tall, green, crested reptile with a long tail, club and spiked shield. */
function lizardfolk() {
  const scales = 0x4e7a3c;
  const belly = 0xb4ae6e;
  const crest = 0xb0442c;
  const p = {
    leg: 0.92,
    torso: 0.66,
    neck: 0.15,
    shoulders: 0.44,
    hips: 0.24,
    arm: 0.66,
    thick: 1.2,
    chest: [0.22, 0.17],
    waist: [0.17, 0.13],
    hunch: 0.14,
    hand: 1.15,
    foot: 1.4,
    claws: true,
    nails: 0x1e2416,
    skin: scales,
  };
  const b = bodyOf(p);
  const { add, y, s } = b;
  const { hy, hz } = headAt(b, p, 0.09);
  // A long, rounded snout full of teeth, eyes high on the sides, a crest of spines.
  add("head", scales, blob(0.085, 0.075, 0.1, 0, hy + 0.02, hz - 0.01));
  add("head", scales, limb(0.06, 0.036, [0, hy + 0.0, hz + 0.06], [0, hy - 0.02, hz + 0.25], 10));
  add("head", belly, limb(0.046, 0.028, [0, hy - 0.05, hz + 0.03], [0, hy - 0.048, hz + 0.23], 10));
  add("head", 0x1e2416, blob(0.04, 0.006, 0.11, 0, hy - 0.035, hz + 0.15));
  for (const sign of [1, -1]) {
    add("head", 0x141a10, nub(0.007, 0.006, 0.006, sign * 0.014, hy - 0.004, hz + 0.278));
    for (let i = 0; i < 4; i++) {
      const z = hz + 0.1 + i * 0.035;
      add(
        "head",
        0xe8e0c4,
        spike(0.006, [sign * (0.038 - i * 0.003), hy - 0.034, z], [sign * (0.039 - i * 0.003), hy - 0.052, z], 4),
      );
    }
  }
  eyes(add, { at: [0.062, hy + 0.04, hz + 0.05], r: 0.017, white: 0xd8b030, slit: true, lid: shade(scales, 0.75) });
  const spines = [];
  for (let i = 0; i < 6; i++)
    spines.push([
      [0, hy + 0.085 - i * 0.012, hz + 0.04 - i * 0.035],
      [0, hy + 0.15 - i * 0.018, hz - 0.01 - i * 0.04],
    ]);
  tufts(b, "head", crest, spines, 0.018);
  const neckSpines = [];
  for (let i = 0; i < 3; i++) {
    const yy = y.head - p.hunch * 0.45 - 0.03 - i * 0.05;
    neckSpines.push([
      [0, yy, p.hunch * 0.75 - 0.07 - i * 0.02],
      [0, yy + 0.03, p.hunch * 0.75 - 0.14 - i * 0.02],
    ]);
  }
  tufts(b, "neck", crest, neckSpines, 0.02);
  // A pale, plated belly and throat, ridges down the back, a long tail.
  add("neck", belly, blob(0.05 * s, 0.07 * s, 0.03 * s, 0, y.head - p.hunch * 0.45 - 0.05, p.hunch * 0.75 + 0.03));
  for (let row = 0; row < 6; row++) {
    const yy = y.chest - 0.02 * s + row * 0.045 * s;
    const wide = p.chest[0] * (0.42 - Math.abs(row - 2.5) * 0.03);
    add("chest", belly, blob(wide, 0.019 * s, p.chest[1] * 0.5, 0, yy, p.chest[1] * 0.42 + p.hunch * 0.2));
  }
  for (let row = 0; row < 4; row++)
    add(
      "spine",
      belly,
      blob(p.waist[0] * 0.4, 0.019 * s, p.waist[1] * 0.5, 0, y.hips + 0.05 * s + row * 0.045 * s, p.waist[1] * 0.48),
    );
  const ridges = [];
  for (let i = 0; i < 5; i++)
    ridges.push([
      [0, y.arm - i * 0.07 * s, -p.chest[1] * 0.85],
      [0, y.arm - i * 0.07 * s + 0.02, -p.chest[1] * 0.85 - 0.06 * s],
    ]);
  tufts(b, "chest", shade(scales, 0.7), ridges, 0.022 * s);
  tail(b, scales, { len: 1.0, r: 0.09, droop: 0.35, waistZ: p.waist[1] });
  // Hide round the waist, a bone necklace, armbands; a heavy club and a shield studded with spikes.
  loincloth(add, b, { cloth: 0x6a5238, belt: 0x3a2a1e, waistX: p.waist[0], waistZ: p.waist[1], drop: 0.3 });
  for (const u of [-0.7, -0.35, 0, 0.35, 0.7])
    add(
      "chest",
      0xe8dcc0,
      nub(
        0.016 * s,
        0.022 * s,
        0.012 * s,
        u * 0.13 * s,
        y.arm - 0.06 * s - (1 - u * u) * 0.05 * s,
        p.chest[1] * 0.78 + p.hunch * 0.2,
      ),
    );
  for (const [side, sign] of SIDES)
    band(add, `${side}UpperArm`, 0x8a6a3a, [sign * (b.sx + p.arm * 0.32), y.arm, 0], 0.05 * b.t, s * 1.6);
  wield(b, p, WEAPONS.club(s * 1.1, { wood: 0x5a3e24 }), -0.9);
  shield(b, p, { r: 0.24 * s, face: 0x6a4a2c, rim: 0x3a2a1e, boss: 0xd8cfb8, spikes: 6 });
  return { ...b, height: 1, seed: 9 };
}

/** Ghoul (SRD: Medium undead): gaunt and grey, stooped, with long claws, a mouth of teeth and eyes that glow. */
function ghoul() {
  const skin = 0x8c9282;
  const dark = 0x5c6254;
  const p = {
    leg: 0.86,
    torso: 0.56,
    neck: 0.12,
    shoulders: 0.34,
    hips: 0.17,
    arm: 0.7,
    thick: 0.78,
    chest: [0.15, 0.105],
    waist: [0.095, 0.075],
    hunch: 0.26,
    hand: 1.35,
    foot: 1.15,
    claws: true,
    nails: 0x1a1612,
    skin,
  };
  const b = bodyOf(p);
  const { add, y, s } = b;
  const { hy, hz } = headAt(b, p, 0.1);
  // A skull-like head: sunken cheeks, dark sockets with a glow in them, a wide mouth of teeth.
  add("head", skin, blob(0.09, 0.1, 0.1, 0, hy + 0.02, hz - 0.01));
  add("head", skin, blob(0.064, 0.055, 0.07, 0, hy - 0.06, hz + 0.03));
  for (const sign of [1, -1]) {
    add("head", dark, blob(0.022, 0.03, 0.02, sign * 0.055, hy - 0.03, hz + 0.06));
    add("head", skin, ear(0.03, 0.008, [sign * 0.085, hy + 0.01, hz - 0.01], [sign * 0.17, hy + 0.06, hz - 0.05]));
    add("head", 0x1a1c18, nub(0.005, 0.01, 0.005, sign * 0.008, hy - 0.012, hz + 0.1));
  }
  eyes(add, {
    at: [0.035, hy + 0.018, hz + 0.075],
    r: 0.018,
    white: 0x22241e,
    pupil: 0xf0e070,
    brow: shade(skin, 0.8),
    browTilt: 0.5,
  });
  add("head", 0x1a1210, blob(0.05, 0.016, 0.02, 0, hy - 0.058, hz + 0.088));
  for (let i = 0; i < 6; i++) {
    const x = -0.035 + i * 0.014;
    add("head", 0xd8d0b0, spike(0.0055, [x, hy - 0.046, hz + 0.095], [x, hy - 0.064, hz + 0.098], 4));
    add("head", 0xd8d0b0, spike(0.0055, [x + 0.007, hy - 0.072, hz + 0.093], [x + 0.007, hy - 0.054, hz + 0.096], 4));
  }
  const random = rng(hashString("ghoul"));
  spots(b, "head", dark, {
    centre: [0, hy + 0.03, hz - 0.02],
    radii: [0.088, 0.09, 0.095],
    count: 7,
    r: 0.012,
    random,
    facing: -1,
  });
  // Ribs and the knobs of the spine showing, collarbones, and rags.
  for (let i = 0; i < 4; i++)
    for (const sign of [1, -1])
      add(
        "chest",
        shade(skin, 1.08),
        blob(
          0.055 * s,
          0.009 * s,
          0.03 * s,
          sign * p.chest[0] * 0.55,
          y.chest + 0.02 * s + i * 0.045 * s,
          p.chest[1] * 0.75 + p.hunch * 0.2,
        ),
      );
  for (let i = 0; i < 5; i++)
    add(
      "chest",
      shade(skin, 1.05),
      nub(0.014 * s, 0.012 * s, 0.012 * s, 0, y.arm - i * 0.06 * s, -p.chest[1] * 0.98 + p.hunch * 0.15),
    );
  for (const sign of [1, -1])
    add(
      "chest",
      shade(skin, 1.06),
      limb(
        0.01 * s,
        0.009 * s,
        [sign * 0.02 * s, y.arm - 0.02 * s, p.chest[1] * 0.8 + p.hunch * 0.3],
        [sign * b.sx * 0.85, y.arm + 0.01 * s, p.chest[1] * 0.4],
        5,
      ),
    );
  loincloth(add, b, { cloth: 0x4a443c, belt: 0x2e2a24, waistX: p.waist[0], waistZ: p.waist[1], drop: 0.3 });
  for (const [x, len] of [
    [-0.06, 0.34],
    [0.05, 0.4],
    [0.0, 0.28],
  ])
    add("hips", 0x3e3a32, box(0.03 * s, len * s, 0.008 * s, x * s, y.hips - len * s * 0.5, p.waist[1] * 1.05));
  return { ...b, height: 1, seed: 10 };
}

/** Orc (SRD: Medium humanoid): broad and grey-green, tusked, with a spiked pauldron and a greataxe. */
function orc() {
  const skin = 0x6f8a52;
  const hair = 0x1a1612;
  const p = {
    leg: 0.92,
    torso: 0.66,
    neck: 0.08,
    shoulders: 0.5,
    hips: 0.25,
    arm: 0.68,
    thick: 1.45,
    chest: [0.25, 0.17],
    waist: [0.18, 0.14],
    hunch: 0.06,
    hand: 1.2,
    foot: 1.15,
    skin,
    legs: 0x4a3a2c,
    shins: 0x6a5238,
    feet: 0x3a2a1e,
  };
  const b = bodyOf(p);
  const { add, y, s } = b;
  const { hy, hz } = headAt(b, p, 0.12);
  // A heavy jaw with two great tusks, a flat nose, small red eyes under a heavy brow, a crest of hair.
  add("head", skin, blob(0.105, 0.11, 0.11, 0, hy + 0.02, hz - 0.01));
  add("head", skin, blob(0.1, 0.066, 0.096, 0, hy - 0.064, hz + 0.024));
  add("head", shade(skin, 0.86), blob(0.09, 0.022, 0.03, 0, hy + 0.038, hz + 0.078));
  add("head", shade(skin, 0.9), blob(0.038, 0.028, 0.028, 0, hy - 0.006, hz + 0.104));
  for (const sign of [1, -1]) add("head", 0x1e1a12, nub(0.009, 0.007, 0.006, sign * 0.016, hy - 0.022, hz + 0.128));
  eyes(add, {
    at: [0.042, hy + 0.016, hz + 0.088],
    r: 0.016,
    white: 0xe8dcc8,
    pupil: 0x8a1a10,
    lid: shade(skin, 0.88),
    brow: shade(skin, 0.7),
    browTilt: 0.55,
  });
  add("head", 0x2a1810, blob(0.05, 0.007, 0.012, 0, hy - 0.056, hz + 0.106));
  for (const sign of [1, -1]) {
    add(
      "head",
      0xe8dcbc,
      spike(0.016, [sign * 0.036, hy - 0.072, hz + 0.1], [sign * 0.044, hy - 0.016, hz + 0.112], 6),
    );
    add("head", skin, ear(0.034, 0.01, [sign * 0.1, hy + 0.01, hz - 0.01], [sign * 0.18, hy + 0.05, hz - 0.06]));
  }
  add("head", shade(skin, 1.15), blob(0.025, 0.004, 0.006, 0.06, hy - 0.035, hz + 0.088));
  const mohawk = [];
  for (let i = 0; i < 7; i++)
    mohawk.push([
      [0, hy + 0.1 - (i > 3 ? (i - 3) * 0.02 : 0), hz + 0.06 - i * 0.03],
      [0, hy + 0.17 - (i > 3 ? (i - 3) * 0.035 : 0), hz + 0.03 - i * 0.035],
    ]);
  tufts(b, "head", hair, mohawk, 0.022);
  add("head", hair, limb(0.016, 0.008, [0, hy + 0.06, hz - 0.11], [0, hy - 0.12, hz - 0.15], 6));
  // Bare and muscled: a spiked iron pauldron, a strap across the chest, a belt with a skull, fur wraps.
  muscle(b, p, shade(skin, 1.03));
  pauldron(b, "left", 1, { hex: 0x5a5e64, rim: 0x3a3e42, size: 1.1, spikes: 3, spikeHex: 0x8a8e92 });
  add(
    "chest",
    0x3a2a1e,
    along(
      new BoxGeometry(0.05 * s, 0.75 * s, 0.014 * s),
      [b.sx * 0.85, y.arm + 0.02 * s, p.chest[1] * 0.6],
      [-p.chest[0] * 0.75, y.chest - 0.06 * s, p.chest[1] * 0.98],
    ),
  );
  belt(b, { hex: 0x3a2a1e, waistX: p.waist[0], waistZ: p.waist[1] * 1.12, pouch: 0x5a4632 });
  add("hips", 0xe0d6bc, blob(0.035 * s, 0.04 * s, 0.03 * s, 0, y.hips + 0.05 * s, p.waist[1] * 1.22));
  for (const sign of [1, -1])
    add(
      "hips",
      0x1e1a14,
      nub(0.009 * s, 0.009 * s, 0.006 * s, sign * 0.013 * s, y.hips + 0.055 * s, p.waist[1] * 1.22 + 0.025 * s),
    );
  loincloth(add, b, { cloth: 0x4a3a2c, belt: 0x3a2a1e, waistX: p.waist[0], waistZ: p.waist[1] * 1.05, drop: 0.38 });
  for (const [side, sign] of SIDES) {
    band(add, `${side}LowerArm`, 0x3a2a1e, [sign * (b.sx + p.arm * 0.82), y.arm, 0], 0.045 * b.t, s * 1.8);
    add(
      `${side}LowerLeg`,
      shade(0x6a5238, 1.2),
      new TorusGeometry(0.052 * b.t, 0.02 * s, 5, 12).rotateX(Math.PI / 2).translate(sign * b.hx, y.knee - 0.04 * s, 0),
    );
  }
  wield(b, p, WEAPONS.axe(s), -1.0);
  return { ...b, height: 1, seed: 11 };
}

export const BESTIARY = { goblin, ogre, troll, minotaur, hobgoblin, bugbear, gnoll, kobold, lizardfolk, ghoul, orc };

/** The monster `kind` (a key of BESTIARY), walking like any other humanoid. */
export function createBuilt(kind) {
  const made = (BESTIARY[kind] ?? goblin)();
  return figureFrom(made.joints, made.parts, { height: made.height, seed: made.seed });
}
