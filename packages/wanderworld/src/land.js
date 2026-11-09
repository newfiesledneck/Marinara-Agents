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
/** Every kind of place out in the country, with hamlets (more settlements beyond the main one). */
/** Landmarks out in the country: old ruins, a watchtower, a ring of standing stones, a graveyard, a mill. */
export const LANDMARK_KINDS = ["ruins", "watchtower", "stones", "graveyard", "mill"];
export const PLACE_KINDS = [...OUTPOST_KINDS, "hamlet", "farm", ...LANDMARK_KINDS];
const HAMLET_FLAT = 24; // metres round a hamlet's middle that are level
const FARM_FLAT = 28; // and round a farm's yard and fields
/** Kinds of settlement, smallest first, with their usual market and roads and about how many homes they hold. */
export const SETTLEMENT_KINDS = ["hamlet", "village", "town", "city"];
export const SETTLEMENT_LAYOUTS = ["grid", "crossroads", "street", "ring"];
/** The layouts each kind is usually laid out in, when left to the seed. */
const USUAL_LAYOUTS = {
  hamlet: ["street", "crossroads"],
  village: ["crossroads", "street", "ring"],
  town: ["grid", "ring", "crossroads"],
  city: ["grid", "grid", "ring"],
};
const SETTLEMENT_LOOK = {
  hamlet: { market: "green", roads: "dirt", homes: 9 },
  village: { market: "stalls", roads: "dirt", homes: 20 },
  town: { market: "square", roads: "cobble", homes: 45 },
  city: { market: "square", roads: "cobble", homes: 100 },
};

/**
 * A settlement checked: { kind, market ("square" | "stalls" | "green"), roads ("cobble" | "dirt"), side
 * (where the market sits off the middle: a side, or null) }. A world saved before settlements were kept
 * is the town it always was: a fountain square in the middle and cobbled streets.
 */
export function checkSettlement(raw) {
  const kind = SETTLEMENT_KINDS.includes(raw?.kind) ? raw.kind : "town";
  const usual = SETTLEMENT_LOOK[kind];
  return {
    kind,
    market: ["square", "stalls", "green"].includes(raw?.market) ? raw.market : usual.market,
    roads: ["cobble", "dirt"].includes(raw?.roads) ? raw.roads : usual.roads,
    side: SIDES.includes(raw?.side) ? raw.side : null,
    // How its blocks are laid out: all of them (grid), a plus (crossroads), one long street, or a ring.
    layout: SETTLEMENT_LAYOUTS.includes(raw?.layout) ? raw.layout : "grid",
    // A stone wall round it with gates where its roads leave (new cities have them; older worlds don't).
    walls: raw?.walls === true,
  };
}
const HILL_SCALE = { flat: 0.15, gentle: 0.6, rolling: 1.2, rugged: 2.1 };
const RIVER_WIDTH = 7;
const RIVER_BED = -2.4; // deep enough to swim in mid-stream, wading near the banks
const WATER_LEVEL = -0.45;
const BANK = 4; // metres over which the ground slopes down into the river
const ROAD_WIDTH = 3.2;
const OUTPOST_FLAT = 11; // metres round an inn or cottage that are level
const OUTPOST_BLEND = 12; // and then blend back into the hills
/** Metres of level ground round a place of this kind (a cave's is its own, see createLand). */
const flatOf = (kind) =>
  ({ hamlet: HAMLET_FLAT, farm: FARM_FLAT, ruins: 13, watchtower: 8, stones: 11, graveyard: 11, mill: 9 })[kind] ??
  OUTPOST_FLAT;
const MOUNTAIN_REACH = 62; // how far in from the edge a range rises
const BRIDGE_HALF_WIDTH = 1.6;
const MAX_OUTPOSTS = 14; // places out in the country (a few per side)
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
    settlement: checkSettlement(null),
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
  // The settlement: the kind chosen or a seeded one, its market (in the middle, or off to one side) and
  // its roads (each by the kind's usual, unless chosen).
  const pick = rng(seed ^ 0x5e771e);
  const roll = pick();
  const kind = SETTLEMENT_KINDS.includes(choices.settlement)
    ? choices.settlement
    : roll < 0.15
      ? "hamlet"
      : roll < 0.5
        ? "village"
        : roll < 0.85
          ? "town"
          : "city";
  const offside = choices.marketAt === "side" || (choices.marketAt !== "middle" && pick() < 0.4);
  const usual = USUAL_LAYOUTS[kind];
  landscape.settlement = checkSettlement({
    kind,
    roads: ["cobble", "dirt"].includes(choices.roads) ? choices.roads : undefined,
    side: offside ? SIDES[Math.floor(pick() * SIDES.length)] : null,
    layout: SETTLEMENT_LAYOUTS.includes(choices.layout) ? choices.layout : usual[Math.floor(pick() * usual.length)],
    walls: choices.walls === "yes" || (choices.walls !== "no" && kind === "city"),
  });
  // More settlements out in the country: as chosen, or now and then a hamlet.
  const more = { none: 0, one: 1, two: 2 }[choices.towns] ?? (pick() < 0.25 ? 1 : 0);
  for (let i = 0; i < more && landscape.outposts.length < MAX_OUTPOSTS; i++) {
    landscape.outposts.push({ kind: "hamlet", side: SIDES[Math.floor(pick() * SIDES.length)] });
  }
  // Farms: as chosen, or often one.
  const farms = { none: 0, one: 1, two: 2 }[choices.farms] ?? (pick() < 0.4 ? 1 : 0);
  for (let i = 0; i < farms && landscape.outposts.length < MAX_OUTPOSTS; i++) {
    landscape.outposts.push({ kind: "farm", side: SIDES[Math.floor(pick() * SIDES.length)] });
  }
  // Landmarks: as chosen (a few, several), or now and then one or two. A mill only with a river to turn it.
  const landmarks =
    { none: 0, few: 2, several: 4 }[choices.landmarks] ?? (pick() < 0.6 ? 1 + Math.floor(pick() * 2) : 0);
  const kinds = LANDMARK_KINDS.filter((kind) => kind !== "mill" || landscape.river);
  const start = Math.floor(pick() * kinds.length);
  for (let i = 0; i < landmarks && landscape.outposts.length < MAX_OUTPOSTS; i++) {
    const kind = kinds[(start + i) % kinds.length];
    const side = kind === "mill" ? landscape.river.side : SIDES[Math.floor(pick() * SIDES.length)];
    landscape.outposts.push({ kind, side });
  }
  return landscape;
}

/**
 * A landscape with what a world's lore needs (zones.js `needsFromLore`): enough mountain sides, a river,
 * and enough inns, cottages and caves. A cave needs hills to sit in, so asking for one brings mountains
 * with it. Anything already there stays.
 */
export function landscapeNeeds(landscape, needs = {}, seed = 0) {
  const out = { ...landscape, mountains: [...landscape.mountains], outposts: [...landscape.outposts] };
  // A settlement too small for the homes the lore names grows to the next kind up.
  let settlement = checkSettlement(landscape.settlement);
  while ((needs.home ?? 0) > SETTLEMENT_LOOK[settlement.kind].homes && settlement.kind !== "city") {
    const kind = SETTLEMENT_KINDS[SETTLEMENT_KINDS.indexOf(settlement.kind) + 1];
    settlement = { ...settlement, kind, market: SETTLEMENT_LOOK[kind].market };
  }
  out.settlement = settlement;
  const random = rng(seed ^ 0x51ed270b);
  const free = () => SIDES.filter((side) => !out.mountains.includes(side) && out.river?.side !== side);
  const count = (kind) => out.outposts.filter((entry) => entry.kind === kind).length;
  const mountains = Math.min(3, Math.max(needs.mountains ?? 0, (needs.cave ?? 0) > 0 ? 1 : 0));
  while (out.mountains.length < mountains) {
    const side = free()[0] ?? SIDES.find((s) => !out.mountains.includes(s));
    if (!side) break;
    out.mountains.push(side);
  }
  if ((needs.river ?? 0) > 0 && !out.river) {
    out.river = { side: free()[0] ?? SIDES.find((side) => !out.mountains.includes(side)) ?? SIDES[0] };
  }
  // More settlements: a hamlet for each town the lore numbers past the first (town2, town3…).
  while (1 + count("hamlet") < Math.min(4, needs.town ?? 0) && out.outposts.length < MAX_OUTPOSTS) {
    const side = [...SIDES].sort(
      (a, b) =>
        out.outposts.filter((entry) => entry.side === a).length -
          out.outposts.filter((entry) => entry.side === b).length || random() - 0.5,
    )[0];
    out.outposts.push({ kind: "hamlet", side });
  }
  for (const kind of [...OUTPOST_KINDS, "farm", ...LANDMARK_KINDS.filter((kind) => kind !== "mill" || out.river)]) {
    while (count(kind) < Math.min(4, needs[kind] ?? 0) && out.outposts.length < MAX_OUTPOSTS) {
      // Caves on a mountain side, a mill on the river's; the rest on whichever side has fewest so far.
      const sides =
        kind === "cave" && out.mountains.length ? out.mountains : kind === "mill" ? [out.river.side] : SIDES;
      const side = [...sides].sort(
        (a, b) =>
          out.outposts.filter((entry) => entry.side === a).length -
            out.outposts.filter((entry) => entry.side === b).length || random() - 0.5,
      )[0];
      out.outposts.push({ kind, side });
    }
  }
  return out;
}

/** A landscape with every field checked; anything missing comes from the seed's own. */
export function checkLandscape(raw, seed) {
  const fallback = landscapeFor(seed);
  if (!raw || typeof raw !== "object") return fallback;
  const sides = (list) => (Array.isArray(list) ? [...new Set(list.filter((side) => SIDES.includes(side)))] : null);
  const river = raw.river === null ? null : SIDES.includes(raw.river?.side) ? { side: raw.river.side } : fallback.river;
  const outposts = Array.isArray(raw.outposts)
    ? raw.outposts
        .filter((entry) => entry && PLACE_KINDS.includes(entry.kind) && SIDES.includes(entry.side))
        .slice(0, MAX_OUTPOSTS)
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
    settlement: checkSettlement(raw.settlement),
  };
}

/** Distance from (x, z) to the polyline `points`, and the nearest segment's direction. */
function toLine(points, x, z) {
  let best = Infinity;
  let along = [1, 0];
  let nearest = points[0] ?? { x, z };
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
      nearest = { x: a.x + dx * t, z: a.z + dz * t };
    }
  }
  return { distance: best, along, x: nearest.x, z: nearest.z };
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
    // On past the world's edge with the land beyond it (world.js draws two chunks more each way).
    for (let t = -worldHalf - 172; t <= worldHalf + 172; t += 6) {
      // 162 m more each way, on the same 6 m steps
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
  const placed = []; // the places so far, to keep each one's level ground clear of the others'
  const roomOf = (kind) => (kind === "cave" ? 14 : flatOf(kind));
  const outposts = landscape.outposts.map((original, index) => {
    // A graveyard close by the town goes on a side the river doesn't cut it off on, and so does a hamlet
    // or farm when there's no room for its ground between the river and the world's edge.
    const beyondRiver = townHalf + 58 + flatOf(original.kind) + RIVER_WIDTH / 2 + BANK + 6;
    const wantsDry =
      original.kind === "graveyard" ||
      ((original.kind === "hamlet" || original.kind === "farm") && beyondRiver > edge - flatOf(original.kind) - 6);
    const entry =
      wantsDry && river && landscape.river.side === original.side
        ? { ...original, side: SIDES[(SIDES.indexOf(original.side) + 1) % SIDES.length] }
        : original;
    const [dx, dz] = DIRECTION[entry.side];
    const slot = (perSide[entry.side] = (perSide[entry.side] ?? -1) + 1);
    // A bigger world spreads its places further apart and further out (a Normal world: as before).
    const room = worldHalf / 160;
    const across =
      (slot % 2 === 0 ? -1 : 1) * (18 + slot * 22) * room * (random() < 0.5 ? 1 : -1) + (random() - 0.5) * 16 * room;
    // Caves sit at the foot of the hills; inns and cottages a fair walk out.
    const reach = Math.max(20, worldHalf - townHalf - 110);
    let out =
      entry.kind === "cave"
        ? Math.max(townHalf + 30, worldHalf - 46 - random() * 8) // clear of the town, even in a small world
        : townHalf + 48 + random() * reach;
    // A hamlet or farm wants open, level country: in front of a mountain range, not up it.
    if ((entry.kind === "hamlet" || entry.kind === "farm") && landscape.mountains.includes(entry.side)) {
      out = Math.min(out, Math.max(townHalf + 40, worldHalf - MOUNTAIN_REACH - flatOf(entry.kind)));
    }
    if (entry.kind === "graveyard") out = townHalf + 24 + random() * 10; // just outside town
    // Inside the world, however small; a hamlet, farm or landmark with all its ground inside too.
    const inside = OUTPOST_KINDS.includes(entry.kind) ? 14 : Math.max(14, roomOf(entry.kind) + 6);
    out = Math.min(out, edge - inside);
    // A graveyard keeps close by the town, level with it; the rest spread along their side.
    const spread = entry.kind === "graveyard" ? Math.max(-townHalf * 0.6, Math.min(townHalf * 0.6, across)) : across;
    const sideways = Math.max(20, inside); // and as far from the side edges
    let lateral = Math.max(-edge + sideways, Math.min(edge - sideways, spread));
    const spot = (distance) => (dx !== 0 ? { x: dx * distance, z: lateral } : { x: lateral, z: dz * distance });
    // Never on the river: a place whose ground would reach the water or its banks steps further out.
    const dry = entry.kind === "hamlet" || entry.kind === "farm" ? flatOf(entry.kind) + 6 : 14; // more for a hamlet or farm
    const clearOfRiver = (at) => !river || toLine(river.points, at.x, at.z).distance > RIVER_WIDTH / 2 + BANK + dry;
    if (entry.kind === "mill" && river) {
      // On the town's bank (its road needn't cross): beside the nearest bit of river, its back to the water
      // (the wheel turns in it).
      const at = spot(out);
      const near = toLine(river.points, at.x, at.z);
      const across = Math.hypot(near.x, near.z) || 1;
      const reach = RIVER_WIDTH / 2 + 5.5;
      const x = near.x - (near.x / across) * reach;
      const z = near.z - (near.z / across) * reach;
      const facing = ((Math.round(Math.atan2(x - near.x, z - near.z) / (Math.PI / 2)) % 4) + 4) % 4;
      const mill = { ...entry, index, x, z, facing, angle: (facing * Math.PI) / 2 };
      placed.push(mill);
      return mill;
    }
    // Off the river: further out (inns, cottages and caves as always; the rest only as far as their room).
    const furthest = OUTPOST_KINDS.includes(entry.kind) ? edge - 18 : edge - inside;
    while (!clearOfRiver(spot(out)) && out < furthest) out += 4;
    // Clear of the places already there and of the river: along the side (one way, turned back at the
    // edge), now and then further out too.
    let away = 0;
    for (let tries = 0; tries < 30; tries++) {
      const at = spot(out);
      const clash = placed.find(
        (other) => Math.hypot(other.x - at.x, other.z - at.z) < roomOf(other.kind) + roomOf(entry.kind) + 4,
      );
      if (!clash && clearOfRiver(at)) break;
      if (!away) away = clash ? Math.sign(dx !== 0 ? at.z - clash.z : at.x - clash.x) || 1 : 1;
      if (Math.abs(lateral + away * 9) > edge - sideways) away = -away;
      lateral += away * 9;
      if (tries % 3 === 2) out = Math.min(out + 10, furthest);
    }
    let { x, z } = spot(out);
    let side = entry.side;
    const free = (at) =>
      clearOfRiver(at) &&
      placed.every(
        (other) => Math.hypot(other.x - at.x, other.z - at.z) >= roomOf(other.kind) + roomOf(entry.kind) + 4,
      );
    if (!free({ x, z })) {
      // Its side is full: the free spot nearest where it wanted to be, anywhere out in the country (and
      // the side that spot is on).
      let best = null;
      for (let gx = -edge + inside; gx <= edge - inside; gx += 8) {
        for (let gz = -edge + inside; gz <= edge - inside; gz += 8) {
          if (Math.max(Math.abs(gx), Math.abs(gz)) < townHalf + 24 + roomOf(entry.kind)) continue;
          const distance = Math.hypot(gx - x, gz - z);
          if ((!best || distance < best.distance) && free({ x: gx, z: gz })) best = { x: gx, z: gz, distance };
        }
      }
      if (best) {
        ({ x, z } = best);
        side = Math.abs(x) > Math.abs(z) ? (x > 0 ? "east" : "west") : z > 0 ? "south" : "north";
      }
    }
    // The front looks back toward town, squared to a quarter turn like every building in town.
    const facing = ((Math.round(Math.atan2(-x, -z) / (Math.PI / 2)) % 4) + 4) % 4;
    const place = { ...entry, side, index, x, z, facing, angle: (facing * Math.PI) / 2 };
    placed.push(place);
    return place;
  });

  // Roads. Hamlets and farms each get one from the end of the street on their side nearest them, out and
  // round to the front. An inn on a side with one of those roads stands beside it, where its own short
  // track meets the road; inns and cottages take a track off the nearest such road when that's shorter
  // than a road of their own from town. Hamlets on neighbouring sides are joined round the town's corner.
  // Caves have none: they're found up on the hillsides.
  const curve = (start, bend, end) => {
    const points = [];
    const steps = Math.max(4, Math.ceil(Math.hypot(end.x - start.x, end.z - start.z) / 3));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const [a, b, c] = [(1 - t) * (1 - t), 2 * (1 - t) * t, t * t];
      points.push({ x: a * start.x + b * bend.x + c * end.x, z: a * start.z + b * bend.z + c * end.z });
    }
    return points;
  };
  const frontOf = (outpost, distance) => ({
    x: outpost.x + Math.sin(outpost.angle) * distance,
    z: outpost.z + Math.cos(outpost.angle) * distance,
  });
  const roadFor = (outpost, points, fromTown) => {
    points.push(frontOf(outpost, 3));
    return { points, width: ROAD_WIDTH, to: outpost.index, fromTown, bounds: boundsOf(points, ROAD_WIDTH + 2) };
  };
  const townStart = (outpost) => {
    const [dx, dz] = DIRECTION[outpost.side];
    const lateral = dx !== 0 ? outpost.z : outpost.x;
    const line = streetLines.reduce((best, value) =>
      Math.abs(value - lateral) < Math.abs(best - lateral) ? value : best,
    );
    // From just inside the end of the street (its cobbles reach townHalf + 3), so the road can fade out of them.
    const out0 = townHalf + 2.2;
    return dx !== 0 ? { x: dx * out0, z: line } : { x: line, z: dz * out0 };
  };
  const fromTown = (outpost) => {
    const [dx, dz] = DIRECTION[outpost.side];
    const start = townStart(outpost);
    const front = frontOf(outpost, 8);
    const bend = {
      x: dx !== 0 ? (start.x + front.x) / 2 : start.x + (front.x - start.x) * 0.2,
      z: dz !== 0 ? (start.z + front.z) / 2 : start.z + (front.z - start.z) * 0.2,
    };
    return roadFor(outpost, curve(start, bend, front), true);
  };
  const isMain = (outpost) => outpost.kind === "hamlet" || outpost.kind === "farm";
  const mainRoads = outposts.filter(isMain).map(fromTown);
  const face = (outpost, toward) => {
    outpost.facing = ((Math.round(Math.atan2(toward.x - outpost.x, toward.z - outpost.z) / (Math.PI / 2)) % 4) + 4) % 4;
    outpost.angle = (outpost.facing * Math.PI) / 2;
  };
  // Room for an inn at `at`: inside the world, out of town, off the river, and clear of every other place's
  // level ground (the inn's own building is about 9 m across its corners).
  const roomAt = (at, except) =>
    Math.abs(at.x) < edge - 18 &&
    Math.abs(at.z) < edge - 18 &&
    Math.max(Math.abs(at.x), Math.abs(at.z)) > townHalf + 12 &&
    (!river || toLine(river.points, at.x, at.z).distance > RIVER_WIDTH / 2 + BANK + 14) &&
    outposts.every((other) => other === except || Math.hypot(other.x - at.x, other.z - at.z) > flatOf(other.kind) + 9);
  // Inns by the roads: beside the main road on their side, part way along it, wherever there's room.
  for (const inn of outposts.filter((outpost) => outpost.kind === "inn")) {
    const road = mainRoads.find((entry) => outposts[entry.to].side === inn.side);
    if (!road) continue;
    const last = road.points.length - 2;
    spots: for (const share of [0.5, 0.35, 0.65, 0.25, 0.75]) {
      const i = Math.min(last, Math.max(1, Math.round(road.points.length * share)));
      const [at, next] = [road.points[i], road.points[i + 1]];
      const length = Math.hypot(next.x - at.x, next.z - at.z) || 1;
      for (const sign of [1, -1]) {
        const spot = {
          x: at.x - ((next.z - at.z) / length) * sign * (OUTPOST_FLAT + 3),
          z: at.z + ((next.x - at.x) / length) * sign * (OUTPOST_FLAT + 3),
        };
        if (!roomAt(spot, inn)) continue;
        Object.assign(inn, spot, { by: at });
        face(inn, at);
        break spots;
      }
    }
  }
  const nearestOnMain = (to) => {
    let best = null;
    for (const road of mainRoads) {
      // Not from the very start (that's the town's street) or the end (that's the place itself).
      for (const point of road.points.slice(3, -4)) {
        const distance = Math.hypot(point.x - to.x, point.z - to.z);
        if (!best || distance < best.distance) best = { point, distance };
      }
    }
    return best;
  };
  const sideRoads = outposts
    .filter((outpost) => ["inn", "cottage", "watchtower", "graveyard", "mill"].includes(outpost.kind))
    .map((outpost) => {
      const front = frontOf(outpost, 8);
      if (outpost.by) return roadFor(outpost, curve(outpost.by, outpost.by, front), false);
      const branch = nearestOnMain(front);
      const own = Math.hypot(front.x - townStart(outpost).x, front.z - townStart(outpost).z);
      if (!branch || branch.distance > own * 0.6) return fromTown(outpost);
      const middle = { x: (branch.point.x + front.x) / 2, z: (branch.point.z + front.z) / 2 };
      return roadFor(outpost, curve(branch.point, middle, front), false);
    });
  // Hamlets on neighbouring sides (north and east, say) joined by a road curving round the town's corner.
  const joins = [];
  const hamlets = outposts.filter((outpost) => outpost.kind === "hamlet");
  hamlets.forEach((a, i) => {
    for (const b of hamlets.slice(i + 1)) {
      const [ax, az] = DIRECTION[a.side];
      const [bx, bz] = DIRECTION[b.side];
      if (ax * bx + az * bz !== 0) continue; // the same side or opposite ones
      const start = frontOf(a, 8);
      const end = frontOf(b, 8);
      // The corner between them: a's distance out along its own axis, b's along its.
      const corner = { x: ax !== 0 ? start.x : end.x, z: az !== 0 ? start.z : end.z };
      const points = curve(start, corner, end);
      joins.push({
        points,
        width: ROAD_WIDTH,
        to: null,
        between: [a.index, b.index],
        fromTown: false,
        bounds: boundsOf(points, ROAD_WIDTH + 2),
      });
    }
  });
  const roads = [...mainRoads, ...sideRoads].sort((a, b) => a.to - b.to).concat(joins);

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
    // Never below the banks (filled up over the water, groundAt), so the earth under its ends can't drag them under.
    bridge.deck =
      Math.max(
        natural(bridge.x - ax * half, bridge.z - az * half),
        natural(bridge.x + ax * half, bridge.z + az * half),
        WATER_LEVEL + 0.35,
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
      const flat = flatOf(outpost.kind);
      if (distance < flat + OUTPOST_BLEND) {
        height = outpost.ground + (height - outpost.ground) * smooth((distance - flat) / OUTPOST_BLEND);
      }
    }
    if (river && inBounds(river.bounds, x, z)) {
      const { distance } = toLine(river.points, x, z);
      const half = river.width / 2;
      // The banks always stand above the water: a hollow beside the river is filled up to a little over
      // its level (else the water would show its edges, floating over the low ground).
      const reach = half + BANK + 8;
      if (distance < reach && height < WATER_LEVEL + 0.35) {
        height += (WATER_LEVEL + 0.35 - height) * smooth((reach - distance) / 6);
      }
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
      const reach = outpost.kind === "cave" ? 13 : flatOf(outpost.kind) + 1;
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
