// Regions beyond home (docs/QUESTS.md section 9): what kind of land each one is, what's made of it the
// first time it's entered, the people who live there, and what a quest can ask of one. By rules alone:
// no model is called here.
//
// A region's land comes from the world's seed and where the region lies on the map of regions: the far
// north turns cold, and two slow patterns (how wet, how high) give marsh and lakes, hills and badlands,
// forest and farmland, so neighbours tend to be alike. A quest can ask for a land before the region is
// made (`travel.planned`). Each land changes the landscape (land.js: hills, mountains, the river, the
// places out in the country, a lake), and world.js reads `landscape.land` for its trees, rocks and ground
// (`LAND_LOOK`). Its people are made once, the first time the region is built, from its houses and
// workplaces, and kept with the region (`folk`), so they're the same people when the player comes back.
//
// Everything is plain data in and out. What's kept in a save: `regions[key].landscape.land`, `folk`, and
// `save.travel` ({ planned, heard, targets }), each checked here.
import { checkSettlement, landscapeWith, SIDES } from "./land.js";
import { hashString, rng } from "./world.js";
import { HOME_REGION, regionNext } from "./zones.js";
import { landscapeForPurpose, PURPOSES } from "./factions.js";

const isRecord = (value) => !!value && typeof value === "object" && !Array.isArray(value);
const words = (value, max) => (typeof value === "string" ? value.replace(/\s+/gu, " ").trim().slice(0, max) : "");
const KEY = /^-?\d{1,3},-?\d{1,3}$/u;

// ── Lands ────────────────────────────────────────────────────────────────────

/**
 * Each kind of land: what it's called; the landscape it makes (`hills` to pick from, how many mountain
 * ranges, the chance of a river, places to add out in the country, the settlements it has by weight);
 * the weather it leans to (`weather`: what clear weather turns to, and how often); its word for where
 * monsters live (animals.js HABITATS); and the work its people do when they have no shop or inn. Its
 * trees, rocks and ground are world.js LAND_LOOK's.
 */
export const LANDS = {
  farmland: {
    label: "Farmland",
    about: "open fields and farms",
    hills: ["flat", "gentle", "gentle"],
    mountains: [0, 0, 1],
    river: 0.7,
    places: [
      ["farm", 2],
      ["farm", 1],
      ["mill", 1],
    ],
    settle: { hamlet: 1, village: 3, town: 2 },
    habitat: "open",
    jobs: ["farmhand", "shepherd", "carter"],
  },
  forest: {
    label: "Forest",
    about: "deep woods",
    hills: ["gentle", "rolling"],
    mountains: [0, 1],
    river: 0.5,
    places: [
      ["cottage", 2],
      ["ruins", 1],
    ],
    settle: { hamlet: 3, village: 2 },
    weather: { to: "mist", share: 0.12 },
    habitat: "forest",
    jobs: ["woodcutter", "hunter", "forager"],
  },
  hills: {
    label: "Hills",
    about: "high rolling hills",
    hills: ["rugged"],
    mountains: [1, 2],
    river: 0.4,
    places: [
      ["watchtower", 1],
      ["stones", 1],
      ["cave", 1],
    ],
    settle: { hamlet: 2, village: 2, town: 1 },
    weather: { to: "fog-light", share: 0.15 },
    habitat: "hills",
    jobs: ["shepherd", "quarryman", "goatherd"],
  },
  marsh: {
    label: "Marsh",
    about: "wet fens and reedbeds",
    hills: ["flat"],
    mountains: [0],
    river: 1,
    places: [
      ["pond", 2],
      ["pond", 1],
      ["graveyard", 1],
    ],
    settle: { hamlet: 3, village: 1 },
    weather: { to: "mist", share: 0.45 },
    habitat: "marsh",
    jobs: ["eel-catcher", "reed-cutter", "peat-digger"],
  },
  snow: {
    label: "Snowy highlands",
    about: "cold snowy highlands",
    hills: ["rolling", "rugged"],
    mountains: [2, 2, 3],
    river: 0.4,
    places: [
      ["cave", 1],
      ["watchtower", 1],
    ],
    settle: { hamlet: 3, village: 2 },
    habitat: "snow",
    jobs: ["trapper", "woodcutter", "furrier"],
  },
  badlands: {
    label: "Rocky badlands",
    about: "dry rocky badlands",
    hills: ["rugged", "rolling"],
    mountains: [1, 2],
    river: 0.15,
    places: [
      ["ruins", 1],
      ["cave", 1],
      ["stones", 1],
    ],
    settle: { hamlet: 3, village: 1 },
    weather: { dry: 0.8 },
    habitat: "badlands",
    jobs: ["miner", "goatherd", "prospector"],
  },
  lakes: {
    label: "Lakeside",
    about: "a broad lake and its shores",
    hills: ["gentle", "flat"],
    mountains: [0, 1],
    river: 0.5,
    places: [
      ["lake", 1],
      ["mill", 1],
    ],
    settle: { village: 3, town: 2 },
    weather: { to: "mist", share: 0.2 },
    habitat: "water",
    jobs: ["fisher", "boatwright", "net-maker"],
  },
};
export const LAND_KINDS = Object.keys(LANDS);

/**
 * The weather in a region of `land`: what the world's changing weather (weather.js weatherAt) turns to there.
 * A marsh is often misty, the badlands seldom see rain; `roll` (0–1) is the same for the same few minutes.
 */
export function regionWeather(kind, land, roll) {
  const lean = LANDS[land]?.weather;
  if (!lean) return kind;
  if (lean.dry && /rain|storm/u.test(kind)) return roll < lean.dry ? "clear" : kind;
  return kind === "clear" && lean.to && roll < lean.share ? lean.to : kind;
}

/** A smooth pattern over the map of regions, 0–1, the same for the same world: neighbours are alike. */
function field(seed, salt, x, z, scale = 2.5) {
  const at = (i, j) => (hashString(`${seed}|${salt}|${i},${j}`) % 1000) / 999;
  const fx = x / scale;
  const fz = z / scale;
  const [i, j] = [Math.floor(fx), Math.floor(fz)];
  const [tx, tz] = [fx - i, fz - j].map((t) => t * t * (3 - 2 * t));
  const top = at(i, j) + (at(i + 1, j) - at(i, j)) * tx;
  const bottom = at(i, j + 1) + (at(i + 1, j + 1) - at(i, j + 1)) * tx;
  return top + (bottom - top) * tz;
}

/**
 * The land of the region at `key` for a world's seed: one of LAND_KINDS. The far north is colder (snow
 * from about three regions up, sooner where it's high), the wet low places are marsh or lakes, the high dry
 * ones badlands or hills, and the rest forest or farmland. Home has none of its own ("").
 */
export function landAt(worldSeed, key) {
  if (key === HOME_REGION || !KEY.test(key)) return "";
  const [x, z] = key.split(",").map(Number);
  const wet = field(worldSeed, "wet", x, z);
  const high = field(worldSeed, "high", x, z);
  const green = field(worldSeed, "green", x, z, 1.5);
  const cold = -z * 0.16 + high * 0.35 + field(worldSeed, "cold", x, z) * 0.3;
  if (cold > 0.62) return "snow";
  if (wet > 0.66) return high < 0.45 ? "marsh" : "lakes";
  if (high > 0.62) return wet < 0.4 ? "badlands" : "hills";
  if (wet < 0.3 && high > 0.45) return "badlands";
  if (wet > 0.55) return "lakes";
  return green > 0.5 ? "forest" : "farmland";
}

/** The land a region has or will have: the one it was made with, one a quest asked for, else the seed's. */
export function landOf(save, key) {
  if (key === HOME_REGION) return "";
  const made = save?.regions?.[key];
  if (made) return LANDS[made.landscape?.land] ? made.landscape.land : "";
  return LANDS[save?.travel?.planned?.[key]?.land] ? save.travel.planned[key].land : landAt(save?.seed ?? "", key);
}

// ── Names and flavour ────────────────────────────────────────────────────────
// ponytail: these are the fantasy setting's words, kept here beside the rules that use them; with a
// second setting they move into pack.js with the rest of the setting's words.

const NAME_PARTS = {
  farmland: [
    ["Barley", "Wheat", "Hay", "Clover", "Honey", "Apple", "Oat", "Bramble", "Mill"],
    ["the {} Fields", "{}vale", "the {} Downs"],
  ],
  forest: [
    ["Ash", "Elder", "Briar", "Thorn", "Fern", "Oak", "Hazel", "Yew", "Alder"],
    ["the {}wood", "the {} Weald", "{}holt"],
  ],
  hills: [
    ["Ridge", "Crag", "Wind", "Heather", "Stone", "Cairn", "Hawk", "High"],
    ["the {} Hills", "{}moor", "the {} Fells"],
  ],
  marsh: [
    ["Reed", "Mire", "Sedge", "Willow", "Black", "Eel", "Mist", "Heron"],
    ["the {} Fens", "{}marsh", "the {} Mires"],
  ],
  snow: [
    ["Frost", "White", "Winter", "Ice", "Snow", "Rime", "Pale", "Storm"],
    ["the {} Heights", "the {}peaks", "{}mark"],
  ],
  badlands: [
    ["Red", "Dust", "Scar", "Bone", "Ash", "Cinder", "Dry", "Rust"],
    ["the {} Barrens", "the {} Wastes", "{}rock"],
  ],
  lakes: [
    ["Silver", "Still", "Swan", "Glass", "Long", "Deep", "Clear", "Kingfisher"],
    ["{}mere", "the {}water", "the {} Lakes"],
  ],
};

/** A region's name for its land: the same for the same world and place ("the Reed Fens", "Frostmark"). */
export function landName(worldSeed, key, land) {
  const parts = NAME_PARTS[land];
  if (!parts) return "";
  const random = rng(hashString(`${worldSeed}|name|${key}`));
  const stem = parts[0][Math.floor(random() * parts[0].length)];
  const shape = parts[1][Math.floor(random() * parts[1].length)];
  // ("{}vale" reads "Barleyvale"; "the {} Fields" "the Barley Fields".)
  return shape.replace("{}", stem);
}

const TOWN_ENDS = ["by", "ford", "stead", "holm", "wick", "ton", "bridge", "well"];
/**
 * The name of a region's settlement, from its land, never the region's own stem ("Reedwick" in the Heron
 * Fens): the town's name in a region of a land (main.js keeps it as the region's `names.town`).
 */
export function townName(worldSeed, key, land) {
  const parts = NAME_PARTS[land];
  if (!parts) return "";
  const random = rng(hashString(`${worldSeed}|town|${key}`));
  const own = landName(worldSeed, key, land);
  const stems = parts[0].filter((stem) => !own.includes(stem));
  return `${stems[Math.floor(random() * stems.length)]}${TOWN_ENDS[Math.floor(random() * TOWN_ENDS.length)]}`;
}

const FLAVOUR = {
  farmland: [
    "Fields of {crop} run to every edge, and the lanes smell of hay.",
    "Hedgerows and stone walls cut the land into farms.",
  ],
  forest: [
    "The trees close in on every side, and the paths are soft with needles.",
    "Woodsmoke hangs among the trunks.",
  ],
  hills: [
    "The wind never quite drops up here, and sheep dot the slopes.",
    "Grey rock breaks through the grass on every rise.",
  ],
  marsh: [
    "Reeds and black pools stretch out from the causeways, and mist sits low.",
    "Frogs call from the water, and the ground gives underfoot.",
  ],
  snow: [
    "Snow lies deep on the pines, and the breath steams in the cold.",
    "The peaks stand white above a quiet, frozen land.",
  ],
  badlands: [
    "Red rock and dry gullies, with hardly a tree to give shade.",
    "Dust blows across bare stone, and the sun is hard.",
  ],
  lakes: [
    "A wide lake shines under the sky, with boats drawn up on the shore.",
    "Water laps at the shingle, and gulls wheel overhead.",
  ],
};
const CROPS = ["barley", "wheat", "oats", "rye"];

/**
 * A line about a region on arriving there, from its land, its settlement and its name: the same each time.
 * `town`: the settlement's name; `kind`: hamlet, village, town or city.
 */
export function regionFlavour(worldSeed, key, land, town = "", kind = "") {
  const random = rng(hashString(`${worldSeed}|flavour|${key}`));
  const lines = FLAVOUR[land];
  const place = town ? `${town}, a ${kind || "settlement"} of ${LANDS[land]?.about ?? "the country"}. ` : "";
  if (!lines) return place.trim();
  const line = lines[Math.floor(random() * lines.length)].replace("{crop}", CROPS[Math.floor(random() * CROPS.length)]);
  return `${place}${line}`;
}

// ── Making a region ──────────────────────────────────────────────────────────

const WEIGHTED = (random, weights) => {
  const entries = Object.entries(weights);
  let roll = random() * entries.reduce((sum, [, weight]) => sum + weight, 0);
  return (entries.find(([, weight]) => (roll -= weight) < 0) ?? entries[0])[0];
};
const LAYOUTS = { hamlet: ["street", "crossroads"], village: ["crossroads", "street", "ring"], town: ["grid", "ring"] };
/** The least a region's settlement has: an inn to stay at and a shop to trade in (world.js builds them as extras). */
export const REGION_NEEDS = { tavern: 1, shop: 1 };

/**
 * A landscape (land.js) made for a land: its hills, mountain ranges (never on `arrive`, the side the player
 * comes in by), river, its places out in the country (a lake for lakeside), and its settlement. The same
 * land and seed always make the same; `landscape` is what the seed made without a land.
 */
export function landscapeForLand(landscape, land, seed, arrive = null) {
  const look = LANDS[land];
  if (!look) return landscape;
  const random = rng(hashString(`land:${seed}`));
  const pick = (list) => list[Math.floor(random() * list.length)];
  const out = { ...landscape, land, outposts: [...(landscape.outposts ?? [])] };
  out.hills = pick(look.hills);
  const sides = SIDES.filter((side) => side !== arrive).sort(() => random() - 0.5);
  out.mountains = sides.slice(0, pick(look.mountains));
  const riverSide = SIDES.filter((side) => !out.mountains.includes(side)).sort(() => random() - 0.5)[0] ?? null;
  out.river =
    random() < look.river && riverSide
      ? out.river && !out.mountains.includes(out.river.side)
        ? out.river
        : { side: riverSide }
      : null;
  // What's out in the country: the seed's, less a mill with no river and caves with no hills, then the land's own.
  out.outposts = out.outposts.filter((entry) => (entry.kind !== "mill" || out.river) && entry.kind !== "pond");
  for (const [kind, count] of look.places) {
    if (kind === "mill" && !out.river) continue;
    for (let i = 0; i < count; i++) {
      const side =
        kind === "mill"
          ? out.river.side
          : kind === "cave" && out.mountains.length
            ? pick(out.mountains)
            : pick(sides.length ? sides : SIDES);
      out.outposts.push(kind === "lake" ? { kind: "pond", side, lake: true } : { kind, side });
    }
  }
  out.outposts = out.outposts.slice(0, 12);
  const kind = WEIGHTED(random, look.settle);
  out.settlement = checkSettlement({ kind, side: random() < 0.3 ? pick(SIDES) : null, layout: pick(LAYOUTS[kind]) });
  return out;
}

/**
 * Everything a new region is made with: { name, number, seed, landscape, needs }. `land`: its land ("" for
 * the plain countryside of old, as when Settings turns lands off); `purpose`: what it's for (factions.js),
 * or null; `arrive`: the side the player comes in by; `deep`: a cave mouth a quest asked for ({ deep, name }).
 * `number`: its place in the order regions were made.
 */
export function makeRegion(
  worldSeed,
  key,
  { land = "", purpose = null, arrive = null, deep = null, number = 2, name = "" } = {},
) {
  const seed = `${worldSeed}|${key}`;
  let landscape = landscapeWith(hashString(seed), {});
  landscape.mountains = landscape.mountains.filter((edge) => edge !== arrive);
  if (land) landscape = landscapeForLand(landscape, land, hashString(seed), arrive);
  landscape = landscapeForPurpose(landscape, purpose, hashString(seed), arrive);
  if (deep) {
    const side = landscape.mountains[0] ?? SIDES.find((entry) => entry !== arrive) ?? "north";
    landscape.outposts = [
      { kind: "cave", side, deep: deep.deep, ...(deep.name ? { name: deep.name } : {}) },
      ...landscape.outposts,
    ].slice(0, 14);
  }
  return { name, number, seed, landscape, ...(land ? { needs: { ...REGION_NEEDS } } : {}) };
}

// ── The people of a region ───────────────────────────────────────────────────

const FIRST = {
  male: [
    "Aldric",
    "Bram",
    "Cedric",
    "Dunstan",
    "Edmund",
    "Fenwick",
    "Garrick",
    "Hob",
    "Ivo",
    "Jory",
    "Kester",
    "Lorcan",
    "Merrick",
    "Ned",
    "Osric",
    "Piers",
    "Rowan",
    "Silas",
    "Tobin",
    "Wat",
  ],
  female: [
    "Agnes",
    "Bryony",
    "Cressa",
    "Dilys",
    "Edda",
    "Fen",
    "Greta",
    "Hollis",
    "Isolde",
    "Jessa",
    "Kit",
    "Linnet",
    "Maud",
    "Nell",
    "Orla",
    "Petra",
    "Rosamund",
    "Sabine",
    "Tilda",
    "Wren",
  ],
};
const FAMILY = [
  "Ashdown",
  "Barrow",
  "Cobb",
  "Dale",
  "Eastwick",
  "Fairweather",
  "Gale",
  "Hartley",
  "Ivers",
  "Kettle",
  "Lark",
  "Marsh",
  "Nettle",
  "Oakes",
  "Pike",
  "Quill",
  "Reed",
  "Sallow",
  "Thorne",
  "Underhill",
  "Vane",
  "Wynn",
  "Yarrow",
];
const TEMPERS = [
  "cheerful and chatty",
  "gruff but fair",
  "shy and watchful",
  "talkative and nosy",
  "careful with every coin",
  "kindly and slow to anger",
  "sharp-tongued",
  "dreamy and distracted",
  "proud of the place",
  "wary of strangers",
];
/** Who works at each kind of building, by its zone's buildingKind. */
const JOBS = {
  tavern: "innkeeper",
  inn: "innkeeper",
  shop: "shopkeeper",
  smithy: "smith",
  temple: "priest",
  hall: "reeve",
  farm: "farmer",
  mill: "miller",
};
/** The workplaces staffed, in this order, and how many of each kind at most (a town's tenth shop has nobody of its own). */
const JOB_ORDER = [
  ["tavern", 2],
  ["inn", 1],
  ["shop", 3],
  ["smithy", 1],
  ["temple", 1],
  ["hall", 1],
  ["farm", 2],
  ["mill", 1],
];
/** How many people a settlement of each kind has (the region's crowd: few enough for a phone). */
export const FOLK_COUNT = { hamlet: 6, village: 9, town: 12, city: 14 };

/** A region person's id: "local:" like every person a world makes, then where they live and their number. */
export const folkId = (key, n) => `local:folk.${key.replace(",", ".")}.${n}`;
/** Whether `id` is one of the people of a region (not home's own locals or an Engine character). */
export const isFolkId = (id) => typeof id === "string" && id.startsWith("local:folk.");

/**
 * The people of the region at `key`, made from its places: someone at each inn, shop, smithy, temple, hall,
 * farm and mill (as many as `count`), and the rest living in its houses with the land's work. `zones`: the
 * region's (zones.js buildZones). Returns { folk: [{ id, name, body, job, temper, of }], housing: { [id]:
 * { home, work, owner } } } (place ids), the same for the same world, place and zones.
 */
export function regionFolk(worldSeed, key, zones, { land = "", settlement = "village", town = "" } = {}) {
  const random = rng(hashString(`${worldSeed}|folk|${key}`));
  const buildings = zones.filter((zone) => zone.kind === "building");
  const homes = buildings.filter((zone) => zone.buildingKind === "home");
  const workplaces = JOB_ORDER.flatMap(([kind, most]) =>
    buildings.filter((zone) => zone.buildingKind === kind).slice(0, most),
  );
  const count = Math.max(1, FOLK_COUNT[settlement] ?? 8);
  const used = new Set();
  const folk = [];
  const housing = {};
  const jobs = LANDS[land]?.jobs ?? ["labourer", "weaver", "carter"];
  for (let n = 0; n < count; n++) {
    const work = workplaces[n] ?? null;
    const body = random() < 0.5 ? "male" : "female";
    let name = "";
    // (Nobody shares a first name with a neighbour, if it can be helped.)
    for (let tries = 0; tries < 12 && (!name || used.has(name.split(" ")[0])); tries++)
      name = `${FIRST[body][Math.floor(random() * FIRST[body].length)]} ${FAMILY[Math.floor(random() * FAMILY.length)]}`;
    used.add(name.split(" ")[0]);
    const id = folkId(key, n);
    const home = homes.length ? homes[(n * 7 + Math.floor(random() * 3)) % homes.length] : null;
    folk.push({
      id,
      name,
      body,
      job: work ? JOBS[work.buildingKind] : jobs[Math.floor(random() * jobs.length)],
      temper: TEMPERS[Math.floor(random() * TEMPERS.length)],
      of: town,
    });
    housing[id] = {
      home: home?.id ?? work?.id ?? null,
      work: work?.id ?? null,
      owner: !!work && work.buildingKind !== "temple",
    };
  }
  return { folk, housing };
}

/** A region person as the crowd and the AI take people: { id, name, description, personality, appearance, folk, region, body }. */
export function folkPerson(entry, key) {
  const where = entry.of ? ` in ${entry.of}` : "";
  return {
    id: entry.id,
    name: entry.name,
    description: entry.about || `${entry.name} is the ${entry.job}${where}.`,
    personality: entry.temper ? `${entry.name} is ${entry.temper}.` : "",
    appearance: "",
    folk: true,
    region: key,
    body: entry.body,
    ...(entry.quest ? { quest: entry.quest } : {}),
  };
}

/** A region's people as kept, checked: [{ id, name, body, job, temper, of, about?, quest? }]. */
export function checkFolk(raw) {
  return (Array.isArray(raw) ? raw : [])
    .filter((entry) => isRecord(entry) && isFolkId(entry.id) && words(entry.name, 60))
    .slice(0, 24)
    .map((entry) => ({
      id: entry.id.slice(0, 80),
      name: words(entry.name, 60),
      body: ["male", "female", "custom"].includes(entry.body) ? entry.body : "auto",
      job: words(entry.job, 40),
      temper: words(entry.temper, 60),
      of: words(entry.of, 60),
      ...(words(entry.about, 400) ? { about: words(entry.about, 400) } : {}),
      ...(words(entry.quest, 80) ? { quest: words(entry.quest, 80) } : {}),
    }));
}

// ── What a save keeps for travel ─────────────────────────────────────────────

export const TARGET_KINDS = ["person", "item", "creature", "deep"];

/**
 * `save.travel`, checked: { planned: { [key]: { land, quest, deep } } (asked for before the region is
 * made), heard: [keys] (regions the player was told of: on the map, paler), targets: [a quest's things to
 * find, see placeTarget] }.
 */
export function checkTravel(raw) {
  const travel = isRecord(raw) ? raw : {};
  const planned = Object.fromEntries(
    Object.entries(isRecord(travel.planned) ? travel.planned : {})
      .filter(([key, plan]) => KEY.test(key) && key !== HOME_REGION && isRecord(plan))
      .slice(0, 40)
      .map(([key, plan]) => [
        key,
        {
          ...(LANDS[plan.land] ? { land: plan.land } : {}),
          ...(words(plan.quest, 80) ? { quest: words(plan.quest, 80) } : {}),
          ...(isRecord(plan.deep) && ["cave", "cavern", "dungeon", "stronghold"].includes(plan.deep.deep)
            ? {
                deep: {
                  deep: plan.deep.deep,
                  ...(words(plan.deep.name, 60) ? { name: words(plan.deep.name, 60) } : {}),
                },
              }
            : {}),
        },
      ]),
  );
  const heard = [...new Set((Array.isArray(travel.heard) ? travel.heard : []).filter((key) => KEY.test(key)))].slice(
    0,
    60,
  );
  const targets = (Array.isArray(travel.targets) ? travel.targets : [])
    .filter(
      (target) =>
        isRecord(target) &&
        typeof target.id === "string" &&
        TARGET_KINDS.includes(target.kind) &&
        KEY.test(target.region ?? ""),
    )
    .slice(-40)
    .map((target) => ({
      id: target.id.slice(0, 80),
      quest: words(target.quest, 80),
      region: target.region,
      kind: target.kind,
      name: words(target.name, 60) || target.kind,
      what: words(target.what, 60),
      near: words(target.near, 30),
      ...(Number.isFinite(target.at?.x) && Number.isFinite(target.at?.z)
        ? { at: { x: target.at.x, z: target.at.z } }
        : {}),
      ...(words(target.person, 80) ? { person: words(target.person, 80) } : {}),
      done: target.done === true,
    }));
  return { planned, heard, targets };
}

// ── For quests ───────────────────────────────────────────────────────────────

/**
 * A region for a quest: `ask` { from (a region key; default where the player is), side (north, east, south,
 * west; none: whichever way the quest's id picks), distance (regions away, 1–6; default 1), land (a
 * LAND_KINDS name, or ""), purpose (a factions.js PURPOSES kind, or ""), faction (an id, for a faction's
 * land), quest (its id) }. Walks `distance` regions that way and on until it finds one that fits: one
 * already made fits if its land and purpose are what's asked (or nothing is asked); one not made yet is
 * planned to fit (its land kept in `travel.planned`, its purpose in `purposes`, never one given before).
 * Returns { key, made, travel, purposes } (the save's two, updated) or null when none within six regions fits.
 */
export function regionForQuest(save, ask = {}) {
  const from = KEY.test(ask.from ?? "") ? ask.from : (save.region ?? HOME_REGION);
  const land = LANDS[ask.land] ? ask.land : "";
  const purpose = Object.hasOwn(PURPOSES, ask.purpose ?? "") ? ask.purpose : "";
  if (purpose === "faction" && !ask.faction) return null;
  const distance = Math.max(1, Math.min(6, Math.round(Number(ask.distance) || 1)));
  const travel = checkTravel(save.travel);
  const purposes = { ...save.purposes };
  const sides = SIDES.includes(ask.side)
    ? [ask.side]
    : [...SIDES].sort((a, b) => hashString(`${ask.quest ?? ""}|${a}`) - hashString(`${ask.quest ?? ""}|${b}`));
  for (const side of sides) {
    let key = from;
    for (let step = 1; step <= distance + 5; step++) {
      key = regionNext(key, side);
      if (step < distance || key === HOME_REGION) continue;
      const made = save.regions?.[key];
      const had = purposes[key];
      if (made) {
        if ((!land || made.landscape?.land === land) && (!purpose || had?.kind === purpose))
          return { key, made: true, travel, purposes };
        continue;
      }
      const planned = travel.planned[key];
      if ((land && planned?.land && planned.land !== land) || (purpose && had && had.kind !== purpose)) continue;
      if (land || ask.quest)
        travel.planned[key] = {
          ...planned,
          ...(land ? { land } : {}),
          ...(ask.quest ? { quest: String(ask.quest).slice(0, 80) } : {}),
        };
      if (purpose && !had)
        purposes[key] = { kind: purpose, faction: purpose === "faction" ? String(ask.faction) : "", from: "quest" };
      if (!travel.heard.includes(key)) travel.heard.push(key);
      return { key, made: false, travel, purposes };
    }
  }
  return null;
}

/**
 * Adds a quest's target to `travel` (checkTravel's shape): `target` { id, quest, region, kind (person, item,
 * creature or deep), name, what (a creature's kind, an item's description, a deep place's kind), near (a
 * kind of place to put it by: "inn", "ruins", "cave", "town"…; "" anywhere fitting) }. A deep place's
 * entrance has to be in the land before the region is made, so it's planned (`planned[region].deep`); in a
 * region already made it waits for the quest to choose another. Returns the new travel, or null when the
 * target can't be placed.
 */
export function placeTarget(travel, target, made = false) {
  const next = checkTravel(travel);
  const checked = checkTravel({ targets: [target] }).targets[0];
  if (!checked) return null;
  if (checked.kind === "deep") {
    if (made) return null;
    const deep = ["cave", "cavern", "dungeon", "stronghold"].includes(checked.what) ? checked.what : "cave";
    next.planned[checked.region] = { ...next.planned[checked.region], deep: { deep, name: checked.name } };
  }
  next.targets = [...next.targets.filter((entry) => entry.id !== checked.id), checked];
  if (!next.heard.includes(checked.region) && checked.region !== HOME_REGION) next.heard.push(checked.region);
  return next;
}

/** The open targets in a region. */
export const targetsIn = (travel, key) =>
  (travel?.targets ?? []).filter((target) => target.region === key && !target.done);

// ── The map of regions and the roads between them ────────────────────────────

/** Every region the player knows: home, where they are, those made, and those heard of. [{ key, x, z, visited }]. */
export function knownKeys(save) {
  const keys = new Set([HOME_REGION, save.region ?? HOME_REGION, ...Object.keys(save.regions ?? {})]);
  for (const [key, purpose] of Object.entries(save.purposes ?? {})) if (purpose.from !== "seed") keys.add(key);
  for (const key of save.travel?.heard ?? []) keys.add(key);
  return [...keys];
}

/**
 * The way from `from` to `to` along roads: from one known region to the next across their shared edge, as
 * few as there can be. Returns [{ key, side }] (each region entered and the side it was left by), or null.
 */
export function routeTo(save, from, to) {
  const known = new Set(knownKeys(save));
  if (!known.has(to) || from === to) return null;
  const back = new Map([[from, null]]);
  const queue = [from];
  while (queue.length) {
    const key = queue.shift();
    if (key === to) break;
    for (const side of SIDES) {
      const next = regionNext(key, side);
      if (!known.has(next) || back.has(next)) continue;
      back.set(next, { key, side });
      queue.push(next);
    }
  }
  if (!back.has(to)) return null;
  const path = [];
  for (let key = to; back.get(key); key = back.get(key).key) path.unshift({ key, side: back.get(key).side });
  return path;
}

/** Colours on the map of regions by land, for one that isn't a faction's. */
export const LAND_COLOUR = {
  "": "#b9c79a",
  farmland: "#d8cc86",
  forest: "#7f9d62",
  hills: "#a9a77a",
  marsh: "#8c9a7a",
  snow: "#e8edf0",
  badlands: "#c69a6a",
  lakes: "#9cbfcc",
};

// ── Settings → World → Regions and travel ────────────────────────────────────

/** The settings in the order shown, with their labels (hud.js). */
export const REGION_SETTINGS = [
  ["regionLands", "New regions have a land of their own"],
  ["regionFolk", "Regions have their own people"],
  ["regionFlavourAi", "The AI describes a region you arrive in"],
  ["travelRoads", "Travel by road from the map"],
  ["travelCoach", "Coaches from inns"],
];

/** What each one does, what overrides it and what it overrides (hud.js shows them under each). */
export const REGION_EXPLAIN = {
  regionLands:
    "On: a region that travel makes for the first time has a land of its own, from the world's seed and where it lies: farmland, forest, hills, marsh, snowy highlands, rocky badlands or a lakeside, each with its own trees, rocks, ground, weather, places and monsters (with Settings → Creatures → Only where they'd be found on). The far north is colder. A quest can ask for a land first. Regions already made keep theirs, and home is as it always was. Off: new regions are the plain countryside of home. A region's purpose (Factions) is given either way.",
  regionFolk:
    "On: each region beyond home has its own people, made the first time you arrive: someone at its inn, shops, smithy, temple, hall and farms, and the rest in its houses, each with a name, a job, a home and a usual day. They're kept with the world, the same people when you come back, with what they think of you and what they remember. Only the people of the region you're in are about, so a phone keeps up. Off: nobody is made, and the people already made aren't shown (they're kept).",
  regionFlavourAi:
    "On: arriving in a region, the AI narrates what you see there (one call each time, as a moment; it needs AI moments on in Settings → AI). Off, or with no AI: a line of the game's own about the land and the settlement.",
  travelRoads:
    "On: Journal → Map lists the regions you know, with Walk there for each one you can reach by road (through regions you know). The journey takes time (Journey hours), your party and animals come along, and you may meet something on the way (Encounters on the road). Settings → World → Time standing still keeps the clock where it is. Off: you travel by walking off the map's edge only, as before.",
  travelCoach:
    "On: at an inn or tavern, Journal → Map offers a coach to any region you've been to, for a fare (Coach fare, per region on the way) paid from your coins. It's quicker than walking and meets trouble half as often, and you arrive at the inn there. It needs the inventory (Quartermaster) for the coins. Off: no coaches.",
  coachFare:
    "What a coach costs for each region on the way, in your world's coins. Taken from your purse when you set off; you can't go without the fare.",
  journeyHours:
    "How many hours walking through one region takes; a coach takes half. A journey of more than one region adds them up, to at most 20 hours.",
  travelEncounters:
    "How often something meets you on the road: hostile creatures of the land you arrive in, near where you arrive (only kinds that are on in Settings → Creatures). Rare is about one walk in six per region; often, about one in three. By coach, half as often. Off: nothing.",
};
