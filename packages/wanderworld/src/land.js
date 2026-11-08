// The land around the town: how hilly it is, mountain ranges along some edges, a river winding past
// outside the town, and places out in the country (a roadside inn, a cottage, a cave in a hillside) at
// the end of their own dirt roads, with a bridge wherever a road crosses the river.
//
// All of it comes from a world's `landscape`: a small description the seed fills in by default, the
// player can choose in New world, and the AI will write later from the world brief (docs/CONCEPT.md, S2),
// so no two worlds need look alike. Every field is optional and checked, so a partial or odd landscape
// still makes a world.
import { rng } from "./world.js";

export const SIDES = ["north", "east", "south", "west"]; // north is −z
export const HILLS = ["flat", "gentle", "rolling", "rugged"];
export const OUTPOST_KINDS = ["inn", "cottage", "cave"];
const HILL_SCALE = { flat: 0.15, gentle: 0.6, rolling: 1.2, rugged: 2.1 };
const RIVER_WIDTH = 7;
const RIVER_BED = -2.4; // deep enough to swim in mid-stream, wading near the banks
const WATER_LEVEL = -0.45;
const BANK = 4; // metres over which the ground slopes down into the river
const ROAD_WIDTH = 3.2;
const OUTPOST_FLAT = 11; // metres round an inn or cottage that are level
const OUTPOST_BLEND = 12; // and then blend back into the hills
const MOUNTAIN_REACH = 62; // how far in from the edge a range rises
const BRIDGE_HALF_WIDTH = 1.6;
const BRIDGE_END = 2.4; // metres of each bridge's end that rest on banked-up earth
const BRIDGE_RAMP = 3.5; // metres beyond each end over which that earth eases back into the land
/** A cave: a tunnel this deep into its hill and this wide (world.js builds the rock round it). */
export const CAVE_DEPTH = 7.5;
export const CAVE_RADIUS = 2.5;

const DIRECTION = { north: [0, -1], east: [1, 0], south: [0, 1], west: [-1, 0] };
const smooth = (t) => {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
};

/** A landscape the seed chooses: what a world gets when nobody (player or AI) says otherwise. */
export function landscapeFor(seed) {
  const random = rng(seed ^ 0x6c8e9cf5);
  const shuffled = [...SIDES].sort(() => random() - 0.5);
  const mountainCount = random() < 0.25 ? 0 : random() < 0.6 ? 1 : 2;
  const outposts = [];
  const count = 1 + Math.floor(random() * 3);
  for (let i = 0; i < count; i++) {
    outposts.push({ kind: OUTPOST_KINDS[Math.floor(random() * OUTPOST_KINDS.length)], side: shuffled[i % 4] });
  }
  return {
    hills: HILLS[1 + Math.floor(random() * 3)],
    mountains: shuffled.slice(0, mountainCount),
    river: random() < 0.75 ? { side: shuffled[(mountainCount + 1) % 4] } : null,
    outposts,
  };
}

/**
 * The seed's landscape with the player's choices from New world on top. `choices`: { hills (a HILLS name),
 * mountains ("none" | "one" | "two" | "three"), river ("yes" | "no"), places ("none" | "few" | "several") };
 * anything else (or "surprise") keeps the seed's.
 */
export function landscapeWith(seed, choices = {}) {
  const landscape = landscapeFor(seed);
  const random = rng(seed ^ 0x27d4eb2f);
  const sides = [...SIDES].sort(() => random() - 0.5);
  if (HILLS.includes(choices.hills)) landscape.hills = choices.hills;
  const mountainCount = { none: 0, one: 1, two: 2, three: 3 }[choices.mountains];
  if (mountainCount !== undefined) landscape.mountains = sides.slice(0, mountainCount);
  if (choices.river === "no") landscape.river = null;
  if (choices.river === "yes" && !landscape.river) {
    landscape.river = { side: sides.find((side) => !landscape.mountains.includes(side)) ?? sides[0] };
  }
  const placeCount = { none: 0, few: 2, several: 4 }[choices.places];
  if (placeCount !== undefined) {
    landscape.outposts = Array.from({ length: placeCount }, (_, i) => ({
      kind: OUTPOST_KINDS[(i + Math.floor(random() * 3)) % OUTPOST_KINDS.length],
      side: sides[(i + 1) % 4],
    }));
  }
  return landscape;
}

/** A landscape with every field checked; anything missing comes from the seed's own. */
export function checkLandscape(raw, seed) {
  const fallback = landscapeFor(seed);
  if (!raw || typeof raw !== "object") return fallback;
  const sides = (list) => (Array.isArray(list) ? [...new Set(list.filter((side) => SIDES.includes(side)))] : null);
  const river = raw.river === null ? null : SIDES.includes(raw.river?.side) ? { side: raw.river.side } : fallback.river;
  const outposts = Array.isArray(raw.outposts)
    ? raw.outposts
        .filter((entry) => entry && OUTPOST_KINDS.includes(entry.kind) && SIDES.includes(entry.side))
        .slice(0, 6)
        .map((entry) => ({
          kind: entry.kind,
          side: entry.side,
          ...(typeof entry.name === "string" && entry.name.trim() ? { name: entry.name.trim().slice(0, 60) } : {}),
        }))
    : fallback.outposts;
  return {
    hills: HILLS.includes(raw.hills) ? raw.hills : fallback.hills,
    mountains: sides(raw.mountains) ?? fallback.mountains,
    river,
    outposts,
  };
}

/** Distance from (x, z) to the polyline `points`, and the nearest segment's direction. */
function toLine(points, x, z) {
  let best = Infinity;
  let along = [1, 0];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const length = dx * dx + dz * dz || 1;
    const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / length));
    const distance = Math.hypot(x - (a.x + dx * t), z - (a.z + dz * t));
    if (distance < best) {
      best = distance;
      along = [dx / Math.sqrt(length), dz / Math.sqrt(length)];
    }
  }
  return { distance: best, along };
}

/** The bounding box of a polyline grown by `margin`, for skipping distance checks far away. */
function boundsOf(points, margin) {
  const xs = points.map((point) => point.x);
  const zs = points.map((point) => point.z);
  return {
    minX: Math.min(...xs) - margin,
    maxX: Math.max(...xs) + margin,
    minZ: Math.min(...zs) - margin,
    maxZ: Math.max(...zs) + margin,
  };
}
const inBounds = (box, x, z) => x >= box.minX && x <= box.maxX && z >= box.minZ && z <= box.maxZ;

/** Where two polylines cross, if they do: { x, z, along (the first line's direction) }. */
function crossing(a, b) {
  for (let i = 1; i < a.length; i++) {
    for (let j = 1; j < b.length; j++) {
      const p = a[i - 1];
      const r = { x: a[i].x - p.x, z: a[i].z - p.z };
      const q = b[j - 1];
      const s = { x: b[j].x - q.x, z: b[j].z - q.z };
      const denominator = r.x * s.z - r.z * s.x;
      if (Math.abs(denominator) < 1e-9) continue;
      const t = ((q.x - p.x) * s.z - (q.z - p.z) * s.x) / denominator;
      const u = ((q.x - p.x) * r.z - (q.z - p.z) * r.x) / denominator;
      if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        const length = Math.hypot(r.x, r.z) || 1;
        // `sine`: of the angle between them (1 square across, small when they cross at a slant).
        const sine = Math.abs(denominator) / (length * (Math.hypot(s.x, s.z) || 1));
        return { x: p.x + r.x * t, z: p.z + r.z * t, along: [r.x / length, r.z / length], sine };
      }
    }
  }
  return null;
}

/**
 * The land for a checked `landscape`: { heightAt(x, z), river, roads, outposts, bridges, mountains,
 * clear(x, z, margin) (nothing grows or stands there), waterLevel }. `townHalf` is the town's half-size,
 * `worldHalf` the world's; the town itself stays level.
 */
export function createLand(landscape, seed, { townHalf, worldHalf, streetLines }) {
  const random = rng(seed ^ 0x1b873593);
  const hillScale = HILL_SCALE[landscape.hills] ?? 1;
  const edge = worldHalf - 4;

  // The river: across the world on its side of town, between the town's edge and the far country,
  // meandering.
  let river = null;
  if (landscape.river) {
    const [dx, dz] = DIRECTION[landscape.river.side];
    const offset = townHalf + 34 + random() * 10;
    const phase = random() * Math.PI * 2;
    const swing = 8 + random() * 6;
    const points = [];
    for (let t = -worldHalf - 10; t <= worldHalf + 10; t += 6) {
      const wobble = Math.sin(t / 34 + phase) * swing + Math.sin(t / 13 + phase * 2) * 2.5;
      // Along the side's axis it runs across; out from town by `offset` plus the wobble.
      const out = offset + wobble;
      points.push(dx !== 0 ? { x: dx * out, z: t } : { x: t, z: dz * out });
    }
    river = { points, width: RIVER_WIDTH, bank: BANK, bounds: boundsOf(points, RIVER_WIDTH / 2 + BANK + 2) };
  }

  // Places out in the country, each at the end of a road from the nearest street leaving town. Two on
  // the same side share the side, spread apart.
  const perSide = {};
  const outposts = landscape.outposts.map((entry, index) => {
    const [dx, dz] = DIRECTION[entry.side];
    const slot = (perSide[entry.side] = (perSide[entry.side] ?? -1) + 1);
    const across = (slot % 2 === 0 ? -1 : 1) * (18 + slot * 22) * (random() < 0.5 ? 1 : -1) + (random() - 0.5) * 16;
    // Caves sit at the foot of the hills; inns and cottages a fair walk out.
    const out = entry.kind === "cave" ? worldHalf - 46 - random() * 8 : townHalf + 48 + random() * 20;
    const x = dx !== 0 ? dx * out : Math.max(-edge + 20, Math.min(edge - 20, across));
    const z = dz !== 0 ? dz * out : Math.max(-edge + 20, Math.min(edge - 20, across));
    // The front looks back toward town, squared to a quarter turn like every building in town.
    const facing = ((Math.round(Math.atan2(-x, -z) / (Math.PI / 2)) % 4) + 4) % 4;
    return { ...entry, index, x, z, facing, angle: (facing * Math.PI) / 2 };
  });

  // Roads: from the end of the street on that side nearest the outpost, out and round to its door.
  const roads = outposts.map((outpost) => {
    const [dx, dz] = DIRECTION[outpost.side];
    const lateral = dx !== 0 ? outpost.z : outpost.x;
    const line = streetLines.reduce((best, value) =>
      Math.abs(value - lateral) < Math.abs(best - lateral) ? value : best,
    );
    // From just inside the end of the street (its cobbles reach townHalf + 3), so the road can fade out of them.
    const out0 = townHalf + 2.2;
    const start = dx !== 0 ? { x: dx * out0, z: line } : { x: line, z: dz * out0 };
    const front = { x: outpost.x + Math.sin(outpost.angle) * 8, z: outpost.z + Math.cos(outpost.angle) * 8 };
    const bend = {
      x: dx !== 0 ? (start.x + front.x) / 2 : start.x + (front.x - start.x) * 0.2,
      z: dz !== 0 ? (start.z + front.z) / 2 : start.z + (front.z - start.z) * 0.2,
    };
    const points = [];
    const length = Math.hypot(front.x - start.x, front.z - start.z);
    const steps = Math.max(4, Math.ceil(length / 3));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const a = (1 - t) * (1 - t);
      const b = 2 * (1 - t) * t;
      const c = t * t;
      points.push({ x: a * start.x + b * bend.x + c * front.x, z: a * start.z + b * bend.z + c * front.z });
    }
    points.push({ x: outpost.x + Math.sin(outpost.angle) * 3, z: outpost.z + Math.cos(outpost.angle) * 3 });
    return { points, width: ROAD_WIDTH, to: outpost.index, bounds: boundsOf(points, ROAD_WIDTH + 2) };
  });

  // Bridges where a road crosses the river.
  const bridges = [];
  if (river) {
    for (const road of roads) {
      const at = crossing(road.points, river.points);
      if (!at) continue;
      // Long enough to reach past both banks onto level ground, however slanted the crossing.
      const length = Math.min(34, (RIVER_WIDTH + BANK * 2) / Math.max(0.45, at.sine) + 3);
      bridges.push({ x: at.x, z: at.z, along: at.along, length, deck: 0 });
    }
  }

  // Mountain ranges: a ridge along each chosen edge, rising from about 60 m in.
  const ridges = landscape.mountains.map((side) => ({
    side,
    height: 26 + random() * 16,
    phase: random() * 100,
  }));

  /** The ground before carving the river and levelling places: town, hills and mountains. */
  function natural(x, z) {
    const hills = (Math.sin(x * 0.05) * 1.6 + Math.cos(z * 0.04) * 1.3 + Math.sin((x + z) * 0.11) * 0.5) * hillScale;
    const fromTown = Math.max(Math.abs(x), Math.abs(z)) - townHalf - 4;
    let height = hills * smooth(fromTown / 24);
    for (const ridge of ridges) {
      const [dx, dz] = DIRECTION[ridge.side];
      const inward = worldHalf - (dx !== 0 ? dx * x : dz * z); // metres from that edge
      const rise = smooth(1 - inward / MOUNTAIN_REACH);
      if (rise <= 0) continue;
      const along = dx !== 0 ? z : x;
      const peaks =
        0.65 +
        0.25 * Math.sin(along * 0.045 + ridge.phase) +
        0.1 * Math.sin(along * 0.13 + ridge.phase * 3) +
        0.08 * Math.sin((along + inward) * 0.21);
      height += ridge.height * rise * rise * peaks;
    }
    return height;
  }

  // Each outpost's level: buildings stand at the town's level (they're built at height 0), so the ground
  // round them is levelled to it; a cave's mouth is at the foot of the slope in front of it.
  for (const outpost of outposts) {
    const front = { x: outpost.x + Math.sin(outpost.angle) * 6, z: outpost.z + Math.cos(outpost.angle) * 6 };
    outpost.ground = outpost.kind === "cave" ? natural(front.x, front.z) : 0;
  }
  for (const bridge of bridges) {
    // The deck sits level with the higher bank.
    const [ax, az] = bridge.along;
    const half = bridge.length / 2;
    bridge.deck =
      Math.max(
        natural(bridge.x - ax * half, bridge.z - az * half),
        natural(bridge.x + ax * half, bridge.z + az * half),
      ) + 0.25;
  }

  /** Whether (x, z) is on a bridge's deck: its height then, else null. */
  function onBridge(x, z) {
    for (const bridge of bridges) {
      const [ax, az] = bridge.along;
      const rx = x - bridge.x;
      const rz = z - bridge.z;
      const along = rx * ax + rz * az;
      const across = -rx * az + rz * ax;
      if (Math.abs(along) <= bridge.length / 2 && Math.abs(across) <= BRIDGE_HALF_WIDTH) return bridge.deck;
    }
    return null;
  }

  /** How deep the river's water is at (x, z): 0 out of it (or on a bridge). */
  function depthAt(x, z) {
    if (!river || !inBounds(river.bounds, x, z) || onBridge(x, z) !== null) return 0;
    if (toLine(river.points, x, z).distance > river.width / 2 + BANK) return 0;
    return Math.max(0, WATER_LEVEL - groundAt(x, z));
  }

  /** Where someone stands at (x, z): on a bridge's deck where there is one, else on the ground. */
  function heightAt(x, z) {
    const deck = bridges.length ? onBridge(x, z) : null;
    return deck !== null ? deck : groundAt(x, z);
  }

  /** The ground itself at (x, z): under a bridge it's the riverbed, with the water over it. */
  function groundAt(x, z) {
    let height = natural(x, z);
    // Level ground round inns and cottages; a cave's hill rises behind its mouth.
    for (const outpost of outposts) {
      const distance = Math.hypot(x - outpost.x, z - outpost.z);
      if (outpost.kind === "cave") {
        if (distance > 26) continue;
        const rx = x - outpost.x;
        const rz = z - outpost.z;
        const behind = -rx * Math.sin(outpost.angle) - rz * Math.cos(outpost.angle);
        const across = Math.abs(rx * Math.cos(outpost.angle) - rz * Math.sin(outpost.angle));
        // A steep hill rising right behind the mouth…
        height += 5 * smooth(1 - distance / 26) * smooth((behind + 2) / 8);
        // …with the tunnel's floor cut into it: level with the mouth, the hill's flanks either side. The cut
        // is wider than the tunnel by more than a ground cell (2 m), so the ground's triangles never reach
        // inside the tunnel's roof (world.js); the rock roof covers the rest of the cut.
        const cut = CAVE_RADIUS + 2.6;
        if (behind > -7 && behind < CAVE_DEPTH + 6 && across < cut + 2.4) {
          const inside =
            smooth((cut + 2.4 - across) / 2.4) * smooth((CAVE_DEPTH + 6 - behind) / 2.5) * smooth((behind + 7) / 6); // level at the mouth, easing out into the ground in front
          height = height + (outpost.ground - height) * inside;
        }
        continue;
      }
      if (distance < OUTPOST_FLAT + OUTPOST_BLEND) {
        height = outpost.ground + (height - outpost.ground) * smooth((distance - OUTPOST_FLAT) / OUTPOST_BLEND);
      }
    }
    if (river && inBounds(river.bounds, x, z)) {
      const { distance } = toLine(river.points, x, z);
      const half = river.width / 2;
      if (distance < half + BANK) height = RIVER_BED + (height - RIVER_BED) * smooth((distance - half) / BANK);
    }
    // Earth banked up under each end of a bridge, so its deck rests on the ground and walks off level.
    for (const bridge of bridges) {
      const rx = x - bridge.x;
      const rz = z - bridge.z;
      const along = Math.abs(rx * bridge.along[0] + rz * bridge.along[1]) - bridge.length / 2;
      const across = Math.abs(-rx * bridge.along[1] + rz * bridge.along[0]);
      if (along < -BRIDGE_END || along > BRIDGE_RAMP || across > BRIDGE_HALF_WIDTH + 2.5) continue;
      const weight =
        smooth((along + BRIDGE_END) / 1.2) *
        smooth((BRIDGE_RAMP - along) / BRIDGE_RAMP) *
        smooth((BRIDGE_HALF_WIDTH + 2.5 - across) / 2);
      height += (bridge.deck - 0.15 - height) * weight;
    }
    return height;
  }

  /** Whether nothing should grow or stand at (x, z): the river and its banks, roads, outposts, bridges. */
  function clear(x, z, margin = 0) {
    if (
      river &&
      inBounds(river.bounds, x, z) &&
      toLine(river.points, x, z).distance < river.width / 2 + BANK * 0.5 + margin
    )
      return true;
    for (const road of roads) {
      if (inBounds(road.bounds, x, z) && toLine(road.points, x, z).distance < road.width / 2 + 0.6 + margin)
        return true;
    }
    for (const outpost of outposts) {
      const reach = outpost.kind === "cave" ? 13 : OUTPOST_FLAT + 1;
      if (Math.hypot(x - outpost.x, z - outpost.z) < reach + margin) return true;
    }
    return false;
  }

  /**
   * Circles that keep walkers out of the water (every 2.5 m along the river), leaving the bridges open.
   */
  function waterCircles() {
    if (!river) return [];
    const circles = [];
    const radius = river.width / 2 - 0.3;
    for (let i = 1; i < river.points.length; i++) {
      const a = river.points[i - 1];
      const b = river.points[i];
      const length = Math.hypot(b.x - a.x, b.z - a.z);
      for (let d = 0; d < length; d += 2.5) {
        const x = a.x + ((b.x - a.x) * d) / length;
        const z = a.z + ((b.z - a.z) * d) / length;
        if (Math.abs(x) > worldHalf || Math.abs(z) > worldHalf) continue;
        const nearBridge = bridges.some((bridge) => {
          const rx = x - bridge.x;
          const rz = z - bridge.z;
          const across = Math.abs(-rx * bridge.along[1] + rz * bridge.along[0]);
          return Math.hypot(rx, rz) < river.width && across < BRIDGE_HALF_WIDTH + radius + 0.3;
        });
        if (!nearBridge) circles.push({ x, z, r: radius });
      }
    }
    return circles;
  }

  return {
    landscape,
    heightAt,
    groundAt,
    /** How far (x, z) is from the river's banks: 0 or less in the riverbed, Infinity with no river. */
    toRiverBank: (x, z) =>
      river && inBounds(river.bounds, x, z) ? toLine(river.points, x, z).distance - river.width / 2 : Infinity,
    /** Whether (x, z) is on (or within `margin` of) a bridge's deck. */
    onBridge: (x, z, margin = 0) =>
      bridges.some((bridge) => {
        const [ax, az] = bridge.along;
        const rx = x - bridge.x;
        const rz = z - bridge.z;
        return (
          Math.abs(rx * ax + rz * az) <= bridge.length / 2 + margin &&
          Math.abs(-rx * az + rz * ax) <= BRIDGE_HALF_WIDTH + margin
        );
      }),
    clear,
    waterCircles,
    depthAt,
    river,
    roads,
    outposts,
    bridges,
    mountains: ridges,
    waterLevel: WATER_LEVEL,
    bridgeHalfWidth: BRIDGE_HALF_WIDTH,
  };
}
