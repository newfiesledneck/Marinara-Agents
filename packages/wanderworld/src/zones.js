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
const FARM_NAMES = ["Brookside Farm", "Applegarth Farm", "Thistledown Farm", "Hayward's Farm", "Old Mill Farm"];
const LANDMARK_NAMES = {
  ruins: ["the old ruins", "the fallen hall", "Greystone Ruins", "the broken keep"],
  watchtower: ["the watchtower", "the old lookout", "Hawk's Watch", "the beacon tower"],
  stones: ["the standing stones", "the Old Ring", "the Whispering Stones", "the Nine Maidens"],
  graveyard: ["the graveyard", "the old churchyard", "the quiet acre"],
  mill: ["the mill", "the watermill", "Millbrook Mill", "the old mill"],
  pond: ["the pond", "the duck pond", "Stillwater Pond", "the mere"],
};

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

const REGION_NAMES = [
  "the Greenvale",
  "Marrow Downs",
  "the Fenlands",
  "Highmoor",
  "the Amber Reach",
  "Brackenridge",
  "the Silverwood",
  "Dunmere",
  "the Hollow Wolds",
  "Kestrel Heath",
  "the Lantern Coast",
  "Oakhollow",
];

/** The home region of every world, where it starts (region1). */
export const HOME_REGION = "0,0";
const SIDE_STEP = { north: [0, -1], east: [1, 0], south: [0, 1], west: [-1, 0] };
/** The region next to `key` ("x,z" on the map of regions) across its `side` edge. */
export function regionNext(key, side) {
  const [x, z] = key.split(",").map(Number);
  const [dx, dz] = SIDE_STEP[side];
  return `${x + dx},${z + dz}`;
}
/**
 * A region's name: the same for the same world and place on the map of regions. Names go round a spiral
 * out from home, so home and the eight regions round it all have different ones (twelve names in all).
 */
export function regionName(worldSeed, key) {
  const [x, z] = key.split(",").map(Number);
  const ring = Math.max(Math.abs(x), Math.abs(z));
  let index = 0;
  if (ring) {
    // Round the ring: along its top edge, down its right, back along its bottom, up its left.
    const step =
      z === -ring
        ? x + ring
        : x === ring
          ? 2 * ring + z + ring
          : z === ring
            ? 4 * ring + ring - x
            : 6 * ring + ring - z;
    index = (2 * ring - 1) ** 2 + step;
  }
  const offset = ((hashOf(String(worldSeed)) % REGION_NAMES.length) + REGION_NAMES.length) % REGION_NAMES.length;
  return REGION_NAMES[(offset + index) % REGION_NAMES.length];
}
function hashOf(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
  return hash | 0;
}

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
      // The market by its kind: a square with a fountain, a stall market, or a hamlet's green.
      name: { stalls: "the market", green: "the green" }[layout.settlement?.market] ?? "the market square",
      shape: { box: square(layout.plaza.x, layout.plaza.z, layout.plaza.half) },
      parent: "town",
      sign: null,
    },
    ...(layout.fountainRadius
      ? [
          {
            id: "fountain",
            kind: "fountain",
            name: "the fountain",
            shape: { circle: { x: layout.plaza.x, z: layout.plaza.z, r: layout.fountainRadius + 2 } },
            parent: "plaza",
            sign: null,
          },
        ]
      : []),
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
  const outpostNames = [];
  (layout.outposts ?? []).forEach((outpost, i) => {
    const names = {
      inn: INN_NAMES,
      cottage: COTTAGE_NAMES,
      cave: CAVE_NAMES,
      hamlet: TOWN_NAMES,
      farm: FARM_NAMES,
      ...LANDMARK_NAMES,
    }[outpost.kind];
    const name = outpost.name ?? pick(random, names, used);
    outpostNames[i] = name;
    // A hamlet is a settlement of its own (a town zone: town2, town3…), the rest are places.
    const id = outpost.kind === "cave" ? `cave:${i}` : outpost.kind === "hamlet" ? `town:${i}` : `outpost:${i}`;
    zones.push({
      id,
      kind: outpost.kind === "cave" ? "cave" : outpost.kind === "hamlet" ? "town" : "outpost",
      outpostKind: outpost.kind,
      name,
      shape: {
        circle: {
          x: outpost.x,
          z: outpost.z,
          r:
            // (A pond's holds its shore, the reeds and the bench looking over it.)
            { cave: 7, hamlet: 24, farm: 26, ruins: 12, watchtower: 8, stones: 10, graveyard: 10, mill: 9, pond: 15 }[
              outpost.kind
            ] ?? 15,
        },
      },
      parent: outpost.inTown ? "town" : "forest",
      sign: null,
    });
    for (const door of outpost.doors?.length
      ? outpost.doors
      : outpost.door !== null && outpost.door !== undefined
        ? [outpost.door]
        : [])
      outpostDoors.set(door, { id, name, kind: outpost.kind });
    const road = (layout.roads ?? []).find((entry) => entry.to === i);
    if (road) {
      zones.push({
        id: `road:${i}`,
        kind: "road",
        name: `the road to ${name}`,
        shape: { line: { points: road.points, width: road.width + 3 } },
        parent: "forest",
        sign: null,
      });
    }
  });
  // Roads joining two settlements out in the country.
  for (const road of (layout.roads ?? []).filter((entry) => entry.between)) {
    const [a, b] = road.between;
    zones.push({
      id: `road:${a}-${b}`,
      kind: "road",
      between: true,
      name: `the road between ${outpostNames[a]} and ${outpostNames[b]}`,
      shape: { line: { points: road.points, width: road.width + 3 } },
      parent: "forest",
      sign: null,
    });
  }
  // Each town building belongs to the street (or the square) it stands on: town → street → building.
  const streetsAndSquare = zones.filter((zone) => zone.kind === "street" || zone.kind === "plaza");
  const onStreet = (box) => {
    let best = "town";
    let bestGap = 14; // further from any street than this (a house out on open ground): just in town
    for (const zone of streetsAndSquare) {
      const other = zone.shape.box;
      const gap =
        Math.max(0, other.minX - box.maxX, box.minX - other.maxX) +
        Math.max(0, other.minZ - box.maxZ, box.minZ - other.maxZ);
      if (gap < bestGap) {
        best = zone.id;
        bestGap = gap;
      }
    }
    return best;
  };
  layout.buildings.forEach((building, i) => {
    const kind = BUILDING[building.kind] ?? BUILDING.home;
    const outpost = outpostDoors.get(i);
    zones.push({
      id: `building:${i}`,
      kind: "building",
      // An inn's or cottage's building is its own kind, never one of the town's taverns or houses (so
      // "home" lore, home numbers and the Homes group stay in the settlements).
      buildingKind: outpost && outpost.kind !== "hamlet" ? outpost.kind : building.kind,
      door: i,
      // An inn or cottage out in the country is its outpost's place, by the same name.
      name: outpost && outpost.kind !== "hamlet" ? outpost.name : kind.name,
      shape: { box: building.box },
      parent: outpost ? outpost.id : onStreet(building.box),
      sign:
        outpost && outpost.kind !== "hamlet"
          ? outpost.kind === "inn"
            ? outpost.name.replace(/^the /u, "")
            : null
          : kind.sign,
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
    // A hamlet holds the end of its road, like any place out in the country.
    const level = (zone.outpostKind === "hamlet" ? LEVEL.outpost : LEVEL[zone.kind]) ?? 0;
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
    {
      id: `${GROUP_PREFIX}wilds`,
      name: "The wilds",
      members: members((zone) => WILD_KINDS.has(zone.kind) && zone.parent !== "town"),
    },
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
      // A group can sit inside another (the homes of Mill Lane inside the town's homes).
      parent: typeof group.parent === "string" && group.parent !== group.id ? group.parent : null,
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

/** The groups that hold any of `zones` (a place and the places it sits in), and the groups those sit in. */
export function groupsAt(groups, zones) {
  const ids = new Set(zones.map((zone) => zone.id));
  const found = groups.filter((group) => group.members.some((id) => ids.has(id)));
  const byId = new Map(groups.map((group) => [group.id, group]));
  for (let i = 0; i < found.length; i++) {
    const parent = byId.get(found[i].parent);
    if (parent && !found.includes(parent)) found.push(parent); // a loop of parents stops at the first repeat
  }
  return found;
}

// ── The world's setup, kept through a regenerate ─────────────────────────────

/** The whole world: the top of every place's chain, for lore that's active everywhere. */
export const WORLD_ID = "world";
/** The player (their persona): lore tied to them is active wherever they go. */
export const PLAYER_ID = "player";

/**
 * A place's identity apart from where it ended up: its kind and which one of that kind it is (the third
 * home, the first inn), or its own id where that never moves (the town, the square, the river, a street).
 */
function keysOf(zones) {
  const counts = new Map();
  const keys = new Map();
  for (const zone of zones.zones) {
    const sort = zone.between
      ? "road:between"
      : zone.kind === "building"
        ? `building:${zone.buildingKind}`
        : zone.outpostKind
          ? `${zone.kind}:${zone.outpostKind}`
          : zone.kind;
    if (
      !zone.outpostKind &&
      ["town", "plaza", "fountain", "forest", "outskirts", "river", "street"].includes(zone.kind)
    ) {
      keys.set(zone.id, zone.id);
      continue;
    }
    const n = counts.get(sort) ?? 0;
    counts.set(sort, n + 1);
    keys.set(zone.id, `${sort}#${n}`);
  }
  return keys;
}

/**
 * Which place in a rebuilt world (`next` zones) each place of the old one (`old`) has become, by kind
 * and order: old id → new id. A place with no counterpart (fewer homes now) is left out. Roads go with
 * their outposts.
 */
export function remapZones(old, next) {
  const oldKeys = keysOf(old);
  const byKey = new Map([...keysOf(next)].map(([id, key]) => [key, id]));
  const map = new Map();
  for (const [id, key] of oldKeys) if (byKey.has(key)) map.set(id, byKey.get(key));
  for (const [id, to] of [...map]) {
    if (id.startsWith("outpost:") || id.startsWith("cave:") || (id.startsWith("town:") && to.startsWith("town:"))) {
      const road = `road:${id.split(":")[1]}`;
      if (old.byId.has(road) && next.byId.has(`road:${to.split(":")[1]}`)) map.set(road, `road:${to.split(":")[1]}`);
    }
  }
  map.set(WORLD_ID, WORLD_ID);
  return map;
}

/** Carries a world's setup over to its rebuilt places: names, lore and groups by `map` (old → new id). */
export function carrySetup({ names = {}, lore = {}, groups = null, housing = {} }, map) {
  const move = (record) =>
    Object.fromEntries(
      Object.entries(record)
        .map(([id, value]) => [
          id.startsWith("group:") || id.startsWith("character:") || id === PLAYER_ID ? id : map.get(id),
          value,
        ])
        .filter(([id]) => id),
    );
  return {
    names: move(names),
    lore: move(lore),
    groups: groups
      ? groups.map((group) => ({ ...group, members: group.members.map((id) => map.get(id)).filter(Boolean) }))
      : null,
    housing: Object.fromEntries(
      Object.entries(housing).map(([id, entry]) => [
        id,
        { ...entry, home: map.get(entry.home) ?? null, work: map.get(entry.work) ?? null },
      ]),
    ),
  };
}

// ── Lore from the world's lorebooks, matched to its places ───────────────────

/** Words that name each kind of place, besides its own name ("the smithy" answers to "blacksmith"). */
const KIND_WORDS = {
  town: ["town"],
  plaza: ["market square", "square", "market"],
  fountain: ["fountain"],
  forest: ["forest", "woods"],
  river: ["river"],
  mountains: ["mountains", "mountain"],
  road: ["road"],
  cave: ["cave"],
  garden: ["garden"],
  meadow: ["meadow"],
  "building:home": ["home", "house"],
  "building:shop": ["shop", "store", "general store"],
  "building:tavern": ["tavern", "pub"],
  "building:smithy": ["smithy", "blacksmith", "forge"],
  "building:temple": ["temple", "chapel", "shrine"],
  "building:hall": ["hall", "town hall"],
  "outpost:inn": ["inn"],
  "outpost:cottage": ["cottage"],
  "outpost:hamlet": ["hamlet", "town"],
  "outpost:farm": ["farm", "farmstead", "barn", "fields"],
  "outpost:ruins": ["ruins", "ruin"],
  "outpost:watchtower": ["watchtower", "tower", "lookout"],
  "outpost:stones": ["standing stones", "stone circle", "stones"],
  "outpost:graveyard": ["graveyard", "cemetery", "churchyard"],
  "outpost:mill": ["mill", "watermill", "miller"],
  "outpost:pond": ["pond", "lake", "mere"],
};

const plain = (word) =>
  String(word ?? "")
    .toLowerCase()
    .trim()
    .replace(/^(the|a|an)\s+/u, "");

/** A place's sort for kind words and numbered names: "home", "tavern", "inn", "cave", "forest"… */
function sortOf(zone) {
  if (zone.kind === "building") return zone.buildingKind;
  if (zone.outpostKind && zone.outpostKind !== "hamlet") return zone.outpostKind; // a hamlet is a town (town2…)
  return zone.kind === "plaza" ? "square" : zone.kind;
}

/**
 * Every place's numbered name, by kind and order: "town1", "forest1", "tavern1", "home1" … "home50",
 * "inn1", "cave2". The same order a regenerate keeps places by, so a numbered name always means the same
 * place in a world. "wilds1" is the forest too. Returns a Map of name → zone id.
 */
export function slotsOf(zones) {
  const counts = new Map();
  const slots = new Map();
  for (const zone of zones.zones) {
    // An inn's or cottage's building goes by its place's number (inn1, cottage1), not one of its own.
    if (zone.kind === "building" && zone.parent && zones.byId.get(zone.parent)?.kind === "outpost") continue;
    const sort = sortOf(zone);
    const n = (counts.get(sort) ?? 0) + 1;
    counts.set(sort, n);
    slots.set(`${sort}${n}`, zone.id);
  }
  if (slots.has("forest1")) slots.set("wilds1", slots.get("forest1"));
  return slots;
}

/** Every word a lorebook can use for something in the world → the ids it means (places, groups, characters, the world). */
export function placeTargets(world) {
  const targets = new Map(); // plain word → ids
  const add = (word, id) => {
    const key = plain(word);
    if (!key) return;
    if (!targets.has(key)) targets.set(key, new Set());
    targets.get(key).add(id);
  };
  for (const zone of world.zones.zones) {
    add(nameOf(zone, world.names), zone.id);
    add(zone.name, zone.id);
    const kind =
      zone.kind === "building"
        ? `building:${zone.buildingKind}`
        : zone.outpostKind
          ? `outpost:${zone.outpostKind}`
          : zone.kind;
    for (const word of KIND_WORDS[kind] ?? []) add(word, zone.id);
  }
  for (const [slot, id] of slotsOf(world.zones)) add(slot, id);
  for (const group of world.groups ?? []) add(group.name, group.id);
  for (const character of world.characters ?? []) add(character.name, `character:${character.id}`);
  add(world.name, WORLD_ID);
  add("world", WORLD_ID);
  // The player's own entry: "you", "player" or "persona" for any persona, or "player <name>" / "persona
  // <name>" for one persona only (never the bare name: a character may share it).
  for (const word of ["you", "player", "persona"]) add(word, PLAYER_ID);
  if (world.persona) for (const word of ["player", "persona"]) add(`${word} ${world.persona}`, PLAYER_ID);
  return targets;
}

/** Every place of the kind a word names ("home", "houses", "tavern", "inn"…): zone ids. */
export function placesOfKind(zones, word) {
  const wanted = plain(word).replace(/s$/u, "");
  return zones.zones
    .filter((zone) => {
      const kind =
        zone.kind === "building"
          ? `building:${zone.buildingKind}`
          : zone.outpostKind
            ? `outpost:${zone.outpostKind}`
            : zone.kind;
      return sortOf(zone) === wanted || (KIND_WORDS[kind] ?? []).some((kindWord) => plain(kindWord) === wanted);
    })
    .map((zone) => zone.id);
}

export { plain as plainWord };

/**
 * The words a lore entry is linked by: its Wanderworld keywords (in a lorebook, the keys written
 * "ww:…": keywords.js `readKeys`). Its title counts only where Wanderworld named the entry itself
 * (`byTitle`: someone's card), never for a lorebook's: "Home" or "The Forest" is just what it's called.
 */
const wordsOf = (entry) => (entry.byTitle ? [entry.title, ...(entry.keys ?? [])] : (entry.keys ?? []));

/** What a lore entry calls the thing it's about: its "name …" keyword ("name Mira Saxton"), or else its title. */
export function loreName(entry) {
  const named = (entry.keys ?? []).map((word) => /^named?\s+(.+)$/iu.exec(String(word).trim())?.[1]).find(Boolean);
  return (named ?? entry.title ?? "").trim().slice(0, 60);
}

/** True when an entry's keywords say it's about a creature ("monster", "creature", "hostile"), not a person. */
export function isCreature(entry) {
  return (entry.keys ?? []).some((word) =>
    ["monster", "creature", "hostile"].includes(String(word).toLowerCase().trim()),
  );
}

/**
 * The creatures a world's lore describes, for what will use them later (encounters, the wilds): entries
 * keyed "monster" or "creature", and "hostile" for ones that attack (a monster always is). Returns
 * [{ lorebookId, entryId, name, kind: "monster" | "creature", hostile }].
 */
export function creaturesFromLore(books) {
  const out = [];
  for (const book of books) {
    for (const entry of book.entries) {
      if (!isCreature(entry)) continue;
      const has = (word) => entry.keys.some((key) => String(key).toLowerCase().trim() === word);
      const kind = has("monster") ? "monster" : "creature";
      out.push({
        lorebookId: book.id,
        entryId: entry.id,
        name: loreName(entry),
        words: entry.keys,
        kind,
        hostile: kind === "monster" || has("hostile"),
      });
    }
  }
  return out;
}

/**
 * Names a lorebook gives places: an entry about a place ("tavern1") with the keyword "name The Gilded
 * Stag". Returns { [zone id]: name }.
 */
export function namesFromLore(books, world) {
  const targets = placeTargets(world);
  const names = {};
  for (const book of books) {
    for (const entry of book.entries) {
      const words = wordsOf(entry);
      const name = words.map((word) => /^named?\s+(.+)$/iu.exec(String(word).trim())?.[1]).find(Boolean);
      if (!name) continue;
      for (const word of words)
        for (const id of targets.get(plain(word)) ?? [])
          if (world.zones.byId.has(id)) names[id] ??= name.trim().slice(0, 60);
    }
  }
  return names;
}

/**
 * Lore for a new world from its lorebooks: every entry whose name or a keyword is exactly the name of a
 * place (as named in this world, or its kind: "tavern", "forest"), a group, a character or the world
 * itself is tied to it. `books`: [{ id, entries: [{ id, title, keys }] }]; `world`: { zones, names,
 * groups, name, characters: [{ id, name }] }. Returns { [id]: [{ lorebookId, entryId, title }] }.
 */
export function matchLore(books, world) {
  const targets = placeTargets(world);
  const lore = {};
  for (const book of books) {
    for (const entry of book.entries) {
      const ids = new Set();
      for (const word of wordsOf(entry)) for (const id of targets.get(plain(word)) ?? []) ids.add(id);
      for (const id of ids) {
        lore[id] ??= [];
        lore[id].push({ lorebookId: book.id, entryId: entry.id, title: entry.title });
      }
    }
  }
  return lore;
}

/** Adds `extra` lore to `lore` (both { id: entries }), leaving out entries a place already has. */
export function mergeLore(lore, extra) {
  const out = { ...lore };
  for (const [id, entries] of Object.entries(extra)) {
    const have = new Set((out[id] ?? []).map((entry) => `${entry.lorebookId}/${entry.entryId}`));
    const added = entries.filter((entry) => !have.has(`${entry.lorebookId}/${entry.entryId}`));
    if (added.length) out[id] = [...(out[id] ?? []), ...added];
  }
  return out;
}

/**
 * The world's structure as a lorebook spells it out, in plain keywords on its entries:
 * - "group of <kind>" ("group of home"): the entry becomes a group of every place of that kind, with
 *   the entry as its lore.
 * - "located in <place>" ("located in town1", "located in Ashfall", "located in world"): what the
 *   entry is (a place or group) sits inside that place or group.
 * - on a character's entry, "lives in <place>", "works at <place>", "owner of <place>" ("home6",
 *   "smithy1", or a place's name): their home and work.
 * `world`: as placeTargets takes. Returns { groups: [new groups], placements: [{ place, in, title }],
 * housing: { [characterId]: { home, work, owner } } (zone ids) }.
 */
export function structureFromLore(books, world) {
  const targets = placeTargets(world);
  const first = (word) => [...(targets.get(plain(word)) ?? [])][0] ?? null;
  const groups = [];
  const placements = [];
  const housing = {};
  for (const book of books) {
    for (const entry of book.entries) {
      const words = wordsOf(entry);
      const subjects = new Set();
      for (const word of words) for (const id of targets.get(plain(word)) ?? []) subjects.add(id);
      for (const word of words) {
        const match = /^group of\s+(.+)$/iu.exec(String(word).trim());
        if (!match) continue;
        const id = `group:lore-${book.id}-${entry.id}`;
        groups.push({ id, name: entry.title, members: placesOfKind(world.zones, match[1]), parent: null });
        subjects.add(id);
      }
      for (const word of words) {
        const match = /^(located in|lives in|works at|owner of)\s+(.+)$/iu.exec(String(word).trim());
        if (!match) continue;
        const how = match[1].toLowerCase();
        let target = first(match[2]);
        // Living or working at an inn or cottage out in the country means its building.
        if (target && how !== "located in" && world.zones.byId.get(target)?.kind === "outpost") {
          target = world.zones.zones.find((zone) => zone.kind === "building" && zone.parent === target)?.id ?? target;
        }
        if (!target) continue;
        for (const subject of subjects) {
          if (how === "located in") {
            if (!subject.startsWith("character:") && subject !== target)
              placements.push({ place: subject, in: target, title: entry.title });
          } else if (
            (subject.startsWith("character:") || subject === PLAYER_ID) &&
            world.zones.byId.get(target)?.kind === "building"
          ) {
            const id = subject === PLAYER_ID ? PLAYER_ID : subject.slice("character:".length);
            housing[id] ??= { home: null, work: null, owner: false };
            if (how === "lives in") housing[id].home ??= target;
            else {
              housing[id].work ??= target;
              if (how === "owner of") housing[id].owner = true;
            }
          }
        }
      }
    }
  }
  return { groups, placements, housing };
}

/** The kinds a world can be asked for by number in its lore ("smithy3", "town2"). */
export const NEEDED_KINDS = [
  "town",
  "forest",
  "wilds",
  "river",
  "mountains",
  "square",
  "fountain",
  "tavern",
  "shop",
  "temple",
  "hall",
  "smithy",
  "home",
  "inn",
  "cottage",
  "farm",
  "ruins",
  "watchtower",
  "stones",
  "graveyard",
  "mill",
  "pond",
  "cave",
  "road",
  "garden",
  "meadow",
];

/**
 * What a world must have for its lorebooks: the highest number used for each kind anywhere in their
 * entries' names and keywords ("smithy3" alone, or inside "lives in home6", "located in cave1"). A world
 * is built with at least that many of each it can make; past that it's random. Returns { kind: count }.
 */
export function needsFromLore(books) {
  const pattern = new RegExp(String.raw`\b(${NEEDED_KINDS.join("|")})(\d+)\b`, "giu");
  const needs = {};
  for (const book of books) {
    for (const entry of book.entries) {
      for (const word of wordsOf(entry)) {
        for (const [, kind, number] of String(word).matchAll(pattern)) {
          const sort = kind.toLowerCase() === "wilds" ? "forest" : kind.toLowerCase();
          needs[sort] = Math.max(needs[sort] ?? 0, Math.min(60, Number(number)));
        }
      }
    }
  }
  return needs;
}
