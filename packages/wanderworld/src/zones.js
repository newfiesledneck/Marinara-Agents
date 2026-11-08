// Places: every spot in a world belongs to a named zone (a building, the market square and its fountain,
// a street, a garden, a meadow, the edge of town, the woods), so the game can say where anyone is in
// words: "Jake is sitting on a bench by the fountain in the market square". Those lines are what the AI
// will be told (docs/CONCEPT.md, W1 and S4).
//
// Zones come from the town's layout (world.js `layout`) with default names from seeded lists. A world's
// save can rename any zone (`names`, by zone id), by hand now and by the AI later, and can give a zone
// lorebook entries that are active while you're there (`lore`). Ids stay the same for a seed, so both
// survive a reload.
import { rng } from "./world.js";

const TOWN_NAMES = [
  "Briarwood",
  "Oakhollow",
  "Millbrook",
  "Ashford",
  "Thornbury",
  "Elderglen",
  "Fernvale",
  "Kettlewick",
  "Larkspur",
  "Stonemere",
  "Willowmere",
  "Hollin's Cross",
];
const STREET_NAMES = [
  "Mill Lane",
  "Baker Street",
  "Chapel Row",
  "Well Street",
  "Market Lane",
  "Tanner's Way",
  "Weaver Street",
  "Cooper's Row",
  "Church Lane",
  "Orchard Way",
  "Smithy Lane",
  "Brook Street",
  "Lantern Row",
  "Goose Lane",
  "Candle Street",
  "Fuller's Way",
];
const WOOD_NAMES = ["Whisperwood", "the Greenwood", "Hartwood", "the Old Forest", "Mossy Wood", "Fernwood"];
const RIVER_NAMES = [
  "the River Wend",
  "the Silverrun",
  "the Alder",
  "the Brightwater",
  "the River Lune",
  "the Mere Brook",
];
const MOUNTAIN_NAMES = [
  "the Grey Peaks",
  "the Storm Fells",
  "the Ashen Hills",
  "the High Crags",
  "the Frostspine",
  "the Old Teeth",
];
const INN_NAMES = [
  "the Wayside Inn",
  "the Drowsy Fox",
  "the Crossroads Inn",
  "the Hearth and Kettle",
  "the Weary Wanderer",
];
const COTTAGE_NAMES = ["the woodcutter's cottage", "the old cottage", "the hermit's cottage", "the shepherd's cottage"];
const CAVE_NAMES = ["the cave", "Hollow Cave", "the Echoing Cave", "the bear's den", "Glimmer Cave"];

/** Default names and sign words by building kind. */
const BUILDING = {
  home: { name: "a house", sign: null },
  shop: { name: "the shop", sign: "General Store" },
  tavern: { name: "the tavern", sign: "Tavern" },
  temple: { name: "the temple", sign: "Temple" },
  hall: { name: "the town hall", sign: "Town Hall" },
  smithy: { name: "the smithy", sign: "Smithy" },
};

/** How a zone is named in a sentence: "by the fountain", "on Mill Lane", "in the tavern". */
const PREPOSITION = {
  fountain: "by",
  street: "on",
  road: "on",
  outskirts: "at",
  building: "in",
  outpost: "at",
  river: "by",
};

const pick = (random, list, used) => {
  const left = list.filter((name) => !used.has(name));
  const name = (left.length ? left : list)[Math.floor(random() * (left.length || list.length))];
  used.add(name);
  return name;
};

/**
 * The zones of a world, from its layout and seed. Each zone: { id, kind, name (default), shape, parent,
 * sign (default sign words, or null) }. Shapes: { box: { minX, maxX, minZ, maxZ } } or
 * { circle: { x, z, r } }; the forest has none (it's everywhere else).
 */
export function buildZones(layout, seed) {
  const random = rng(seed ^ 0x2545f491);
  const used = new Set();
  const town = pick(random, TOWN_NAMES, used);
  const zones = [
    { id: "forest", kind: "forest", name: pick(random, WOOD_NAMES, used), shape: null, parent: null, sign: null },
    {
      id: "outskirts",
      kind: "outskirts",
      name: `the edge of ${town}`,
      shape: { box: square(0, 0, layout.townHalf + 22) },
      parent: "forest",
      sign: null,
    },
    { id: "town", kind: "town", name: town, shape: { box: square(0, 0, layout.townHalf) }, parent: null, sign: null },
    {
      id: "plaza",
      kind: "plaza",
      name: "the market square",
      shape: { box: square(layout.plaza.x, layout.plaza.z, layout.plaza.half) },
      parent: "town",
      sign: null,
    },
    {
      id: "fountain",
      kind: "fountain",
      name: "the fountain",
      shape: { circle: { x: layout.plaza.x, z: layout.plaza.z, r: layout.fountainRadius + 2 } },
      parent: "plaza",
      sign: null,
    },
  ];
  for (const street of layout.streets) {
    zones.push({
      id: street.id,
      kind: "street",
      name: pick(random, STREET_NAMES, used),
      shape: { box: street.box },
      parent: "town",
      sign: null,
    });
  }
  layout.gardens.forEach((garden, i) => {
    zones.push({
      id: `garden:${i}`,
      kind: "garden",
      name: "a garden",
      shape: { box: square(garden.x, garden.z, garden.size / 2) },
      parent: "town",
      sign: null,
    });
  });
  layout.meadows.forEach((meadow, i) => {
    zones.push({
      id: `meadow:${i}`,
      kind: "meadow",
      name: "a meadow",
      shape: { box: square(meadow.x, meadow.z, meadow.half) },
      parent: "town",
      sign: null,
    });
  });
  // Out in the country: mountain ranges, the river, and each outpost with the road to it.
  for (const side of layout.mountains ?? []) {
    const half = layout.worldHalf;
    const band = {
      north: [-half, half, -half, -half + 60],
      south: [-half, half, half - 60, half],
      west: [-half, -half + 60, -half, half],
      east: [half - 60, half, -half, half],
    }[side];
    zones.push({
      id: `mountains:${side}`,
      kind: "mountains",
      name: pick(random, MOUNTAIN_NAMES, used),
      shape: { box: { minX: band[0], maxX: band[1], minZ: band[2], maxZ: band[3] } },
      parent: "forest",
      sign: null,
    });
  }
  if (layout.river) {
    zones.push({
      id: "river",
      kind: "river",
      name: pick(random, RIVER_NAMES, used),
      shape: { line: { points: layout.river.points, width: layout.river.width + 6 } },
      parent: "forest",
      sign: null,
    });
  }
  const outpostDoors = new Map();
  (layout.outposts ?? []).forEach((outpost, i) => {
    const names = { inn: INN_NAMES, cottage: COTTAGE_NAMES, cave: CAVE_NAMES }[outpost.kind];
    const name = outpost.name ?? pick(random, names, used);
    const id = outpost.kind === "cave" ? `cave:${i}` : `outpost:${i}`;
    zones.push({
      id,
      kind: outpost.kind === "cave" ? "cave" : "outpost",
      outpostKind: outpost.kind,
      name,
      shape: { circle: { x: outpost.x, z: outpost.z, r: outpost.kind === "cave" ? 7 : 15 } },
      parent: "forest",
      sign: null,
    });
    if (outpost.door !== null && outpost.door !== undefined)
      outpostDoors.set(outpost.door, { id, name, kind: outpost.kind });
    const road = (layout.roads ?? []).find((entry) => entry.to === i);
    if (road) {
      zones.push({
        id: `road:${i}`,
        kind: "road",
        name: `the road to ${name.replace(/^the /u, "")}`,
        shape: { line: { points: road.points, width: road.width + 3 } },
        parent: "forest",
        sign: null,
      });
    }
  });
  layout.buildings.forEach((building, i) => {
    const kind = BUILDING[building.kind] ?? BUILDING.home;
    const outpost = outpostDoors.get(i);
    zones.push({
      id: `building:${i}`,
      kind: "building",
      buildingKind: building.kind,
      door: i,
      // An inn or cottage out in the country is its outpost's place, by the same name.
      name: outpost ? outpost.name : kind.name,
      shape: { box: building.box },
      parent: outpost ? outpost.id : "town",
      sign: outpost ? (outpost.kind === "inn" ? outpost.name.replace(/^the /u, "") : null) : kind.sign,
    });
  });
  return { town, zones, byId: new Map(zones.map((zone) => [zone.id, zone])) };
}

function distanceToLine(points, x, z) {
  let best = Infinity;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / (dx * dx + dz * dz || 1)));
    best = Math.min(best, Math.hypot(x - (a.x + dx * t), z - (a.z + dz * t)));
  }
  return best;
}

function square(x, z, half) {
  return { minX: x - half, maxX: x + half, minZ: z - half, maxZ: z + half };
}

function contains(shape, x, z) {
  if (shape.box) {
    const { minX, maxX, minZ, maxZ } = shape.box;
    return x >= minX && x <= maxX && z >= minZ && z <= maxZ;
  }
  if (shape.circle) return Math.hypot(x - shape.circle.x, z - shape.circle.z) <= shape.circle.r;
  if (shape.line) return distanceToLine(shape.line.points, x, z) <= shape.line.width / 2;
  return false;
}

/** How deep each kind sits, so the smaller of two zones holding a point wins. */
// Streets (with their sidewalks) reach a little into the blocks, so the square, gardens and meadows
// sit above them.
const LEVEL = {
  forest: 0,
  mountains: 1,
  outskirts: 1,
  town: 2,
  river: 3,
  road: 3,
  street: 3,
  plaza: 4,
  garden: 4,
  meadow: 4,
  building: 4,
  outpost: 4,
  cave: 5,
  fountain: 5,
};

/**
 * The zone at (x, z) outdoors: the smallest one that holds the point (a building only counts from the
 * inside, through `zoneOf`). Streets win over the square they cross; the woods hold everything else.
 */
export function zoneAt(zones, x, z) {
  let best = zones.byId.get("forest");
  let bestDepth = -1;
  for (const zone of zones.zones) {
    if (!zone.shape || zone.kind === "building" || !contains(zone.shape, x, z)) continue;
    const level = LEVEL[zone.kind] ?? 0;
    if (level > bestDepth) {
      best = zone;
      bestDepth = level;
    }
  }
  return best;
}

/** A zone's name in this world: the save's rename (`names`), or the default. */
export function nameOf(zone, names = {}) {
  const renamed = names[zone.id];
  return typeof renamed === "string" && renamed.trim() ? renamed.trim() : zone.name;
}

/** The words on a building's sign: its renamed name (without a leading "the"), or the default sign. */
export function signOf(zone, names = {}) {
  if (!zone.sign) return null;
  const renamed = names[zone.id];
  if (typeof renamed === "string" && renamed.trim()) return renamed.trim().replace(/^the\s+/iu, "");
  return zone.sign;
}

/** The zone and the ones it sits in, smallest first: fountain → market square → town. */
export function chainOf(zones, zone) {
  const chain = [];
  for (let at = zone; at; at = at.parent ? zones.byId.get(at.parent) : null) chain.push(at);
  return chain;
}

/**
 * Where a zone is, as words: "by the fountain in the market square", "on Mill Lane", "in the tavern",
 * "in Whisperwood". A zone inside the square or a building says so; streets and gardens stand alone.
 */
export function placeWords(zones, zone, names = {}) {
  const words = `${PREPOSITION[zone.kind] ?? "in"} ${nameOf(zone, names)}`;
  const parent = zone.parent ? zones.byId.get(zone.parent) : null;
  if (parent && (parent.kind === "plaza" || (parent.kind === "building" && zone.kind !== "building"))) {
    return `${words} ${PREPOSITION[parent.kind] ?? "in"} ${nameOf(parent, names)}`;
  }
  return words;
}

/** What someone is doing, as words ("sitting on a bench", "walking"), from the crowd's state. */
const DOING = {
  sit: "sitting",
  walk: "walking",
  idle: "standing",
  talk: "talking",
  inside: "",
};

/**
 * One line saying where someone is and what they're doing: "Jake is sitting on a bench by the fountain
 * in the market square". `who`: { name, state, zone, seat (true when on a bench or chair), talkingTo, with
 * (who they're chatting or sitting with) }.
 */
export function describe(zones, who, names = {}) {
  const place = placeWords(zones, who.zone, names);
  if (who.state === "inside") return `${who.name} is ${place}`;
  let doing = DOING[who.state] ?? "standing";
  if (who.state === "sit" && who.seat) doing = who.with ? `sitting on a bench with ${who.with}` : "sitting on a bench";
  if (who.state === "talk" && who.talkingTo) doing = `talking with ${who.talkingTo}`;
  if (who.state === "chat") doing = who.with ? `chatting with ${who.with}` : "chatting";
  return `${who.name} is ${doing} ${place}`;
}

// ── Place groups ─────────────────────────────────────────────────────────────
// Groups gather places that belong together however they lie: every home in town, or the forest, the
// mountains, a shepherd's cottage and the meadows as "the wilds". Lore tied to a group is active anywhere
// in it, on top of each place's own. A world's groups are plain data ({ id, name, members: [zone ids] })
// in its save, so the player edits them in the Journal and the AI can make or change them later.

const GROUP_PREFIX = "group:";
const WILD_KINDS = new Set(["forest", "outskirts", "mountains", "river", "road", "cave", "outpost"]);

/** A world's groups before anyone has changed them: the wilds round the town, and the town's homes. */
export function defaultGroups(zones) {
  const members = (test) => zones.zones.filter(test).map((zone) => zone.id);
  return [
    { id: `${GROUP_PREFIX}wilds`, name: "The wilds", members: members((zone) => WILD_KINDS.has(zone.kind)) },
    {
      id: `${GROUP_PREFIX}homes`,
      name: "Homes",
      members: members((zone) => zone.kind === "building" && zone.buildingKind === "home"),
    },
  ].filter((group) => group.members.length);
}

/** Groups read back from a save (or written by the AI), checked; null when there are none saved yet. */
export function checkGroups(raw) {
  if (!Array.isArray(raw)) return null;
  const seen = new Set();
  return raw
    .filter((group) => group && typeof group.id === "string" && group.id.startsWith(GROUP_PREFIX))
    .filter((group) => !seen.has(group.id) && seen.add(group.id))
    .slice(0, 60)
    .map((group) => ({
      id: group.id.slice(0, 80),
      name: (typeof group.name === "string" ? group.name.trim() : "").slice(0, 60) || "A group",
      members: [
        ...new Set((Array.isArray(group.members) ? group.members : []).filter((id) => typeof id === "string")),
      ].slice(0, 1000),
    }));
}

/** A new group's id, unused among `groups`. */
export function newGroupId(groups, name) {
  const base = `${GROUP_PREFIX}${
    String(name || "group")
      .toLowerCase()
      .replace(/[^a-z0-9]+/gu, "-")
      .replace(/^-|-$/gu, "")
      .slice(0, 30) || "group"
  }`;
  let id = base;
  for (let n = 2; groups.some((group) => group.id === id); n++) id = `${base}-${n}`;
  return id;
}

/** The groups that hold any of `zones` (a place and the places it sits in). */
export function groupsAt(groups, zones) {
  const ids = new Set(zones.map((zone) => zone.id));
  return groups.filter((group) => group.members.some((id) => ids.has(id)));
}
