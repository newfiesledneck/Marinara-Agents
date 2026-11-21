// Factions and regions with a purpose (docs/QUESTS.md, sections 9 and 10). By rules alone: no model is
// called.
//
// Standing: how a faction regards the player, from −100 to 100, shown in words (Hated … Honoured). It
// moves a little at a time from what the player does (helping or hurting the faction's people, fighting
// its guards, trading with it), never more than so much in a day. Helping a faction costs a little with
// its enemies. Set by hand it moves on from there, unless it's locked. Standing sets a faction's prices,
// whether its people will talk, whether its guards fight on sight and whether its land is safe to cross.
//
// Regions with a purpose: when travel makes a new region, it can be made as a faction's land, a bandit
// stronghold, a few outposts, a smaller town, a cluster of hamlets, a ruin over a dungeon or a hillside of
// caves. A purpose comes from lore (`ww:region:east`), from a quest (purposeAhead) or from the world's
// seed, and once given it's kept. Only the entrances are placed here: a stronghold's gate and the mouths of
// caves and dungeons are cave mouths (caves.js), each with `deep` naming what kind of place it leads to.
import { BoxGeometry, Color, CylinderGeometry, Group, Mesh, MeshLambertMaterial } from "three";
import { checkSettlement, DEEP_KINDS, SIDES } from "./land.js";
import { hashString, rng } from "./world.js";
import { HOME_REGION, regionNext } from "./zones.js";

// ── Standing ─────────────────────────────────────────────────────────────────

/** Standing in words, each from the value given up (Hated is everything below Hostile). */
export const STANDING_WORDS = [
  ["Hated", -100],
  ["Hostile", -74],
  ["Wary", -39],
  ["Neutral", -9],
  ["Liked", 10],
  ["Trusted", 40],
  ["Honoured", 75],
];
/** At this standing and below, a faction's people won't talk, its guards fight and its land isn't safe. */
export const HOSTILE_AT = -40;

/** The pace of it, and what each thing the player does is worth. */
export const STANDING = {
  DAY_CAP: 10, // the most standing with one faction moves in a day by what the player does
  ENEMY_SHARE: 1 / 3, // helping a faction lowers its enemies' standing by this much of it (at least 1)
  TRADE: 1, // buying or selling at one of its vendors (once a day)
  ERRAND: 3, // an errand done for one of its people
  CLEARED: 1, // a hostile creature beaten on its land
  STRUCK_GUARD: -5, // a blow at one of its guards
  BEATEN_GUARD: -10, // one of its guards beaten
};

const clamp = (value) => Math.max(-100, Math.min(100, Math.round(Number.isFinite(value) ? value : 0)));
const isRecord = (value) => !!value && typeof value === "object" && !Array.isArray(value);

/** What a standing is called: "Neutral", "Hostile"… */
export function standingWord(value) {
  const level = clamp(value);
  let word = STANDING_WORDS[0][0];
  for (const [name, from] of STANDING_WORDS) if (level >= from) word = name;
  return word;
}

/**
 * A world's standings, checked: { [faction id]: { value, locked, day, moved, once } }. `day` and `moved`:
 * how far it has moved by itself on that day; `once`: { [what]: day } for what counts once a day.
 */
export function checkStanding(raw) {
  if (!isRecord(raw)) return {};
  const out = {};
  for (const [id, entry] of Object.entries(raw).slice(0, 60)) {
    if (!isRecord(entry) || typeof id !== "string" || !id) continue;
    out[id.slice(0, 80)] = {
      value: clamp(entry.value),
      locked: entry.locked === true,
      day: Number.isInteger(entry.day) ? entry.day : 0,
      moved: Number.isFinite(entry.moved) ? Math.max(0, Math.round(entry.moved)) : 0,
      once: isRecord(entry.once)
        ? Object.fromEntries(Object.entries(entry.once).filter(([, day]) => Number.isInteger(day)))
        : {},
    };
  }
  return out;
}

/** The standing with a faction now (0, Neutral, for one never met). */
export const standingOf = (standing, id) => standing?.[id]?.value ?? 0;

/** Every faction that's an enemy of `id`, either way round (`ww:enemy of:` on either's entry). */
export function enemiesOf(factions, id) {
  const own = factions.find((faction) => faction.id === id);
  return factions
    .filter((faction) => faction.id !== id)
    .filter((faction) => (own?.enemies ?? []).includes(faction.id) || (faction.enemies ?? []).includes(id))
    .map((faction) => faction.id);
}

/**
 * Moves the standing with `id` by `delta` for something the player did. Options: `day` (the world's day),
 * `enemies` (their ids: helping this faction lowers each a little), `cap` (the most it moves in a day;
 * Infinity for something counted in full, as a quest's reward is), `once` (a name: it counts once a day).
 * A locked standing never moves. Returns { standing (a new object), changes: [{ id, from, to, crossed }] },
 * `crossed` being true when the words for it changed.
 */
export function moveStanding(standing, id, delta, { day = 0, enemies = [], cap = STANDING.DAY_CAP, once = "" } = {}) {
  const next = { ...standing };
  const changes = [];
  const move = (who, amount, onceName) => {
    const record = next[who] ?? { value: 0, locked: false, day, moved: 0, once: {} };
    if (record.locked || !amount) return 0;
    if (onceName && record.once?.[onceName] === day) return 0;
    const moved = record.day === day ? record.moved : 0;
    const room = Math.max(0, cap - moved);
    const step = Math.sign(amount) * Math.min(Math.abs(amount), room);
    const value = clamp(record.value + step);
    next[who] = {
      ...record,
      value,
      day,
      moved: moved + Math.abs(value - record.value),
      once: onceName ? { ...record.once, [onceName]: day } : (record.once ?? {}),
    };
    if (value !== record.value)
      changes.push({
        id: who,
        from: record.value,
        to: value,
        crossed: standingWord(value) !== standingWord(record.value),
      });
    return value - record.value;
  };
  const done = move(id, delta, once);
  // Helping one side is held against its enemies, a little.
  if (done > 0) for (const enemy of enemies) move(enemy, -Math.max(1, Math.round(done * STANDING.ENEMY_SHARE)), "");
  return { standing: next, changes };
}

/** A standing set by hand (and locked, or not): it moves on from there unless it's locked. */
export function setStanding(standing, id, value, locked = false) {
  const record = standing?.[id] ?? { value: 0, day: 0, moved: 0, once: {} };
  return { ...standing, [id]: { ...record, value: clamp(value), locked: locked === true } };
}

/** What a faction's vendors multiply their prices by: a fifth more when Hated, a fifth off when Honoured. */
export function priceFactor(value) {
  return Math.round((1 - clamp(value) / 500) * 20) / 20;
}

/** Whether a faction's people will talk to the player. */
export const willTalk = (value) => clamp(value) > HOSTILE_AT;
/** Whether a faction's guards fight the player on sight, and its land is no refuge: Hostile and below. */
export const isHostile = (value) => clamp(value) <= HOSTILE_AT;

/** A faction's colour, the same for the same faction: "#rrggbb", for its banners and on the map. */
export function factionColour(id) {
  const hue = (hashString(`colour:${id}`) % 360) / 360;
  return `#${new Color().setHSL(hue, 0.62, 0.42).getHexString()}`;
}

/** The sentence the AI is told where one of a faction's people speaks: short, so it costs little. */
export function standingSentence(name, factionName, value, player) {
  return `${name} is of ${factionName}, who regard ${player} as ${standingWord(value).toLowerCase()} (standing ${clamp(value)} of ±100).`;
}

// ── Regions with a purpose ───────────────────────────────────────────────────

/** The purposes a region can be made for, and the words lore may use for each. */
export const PURPOSES = {
  faction: ["faction", "land", "lands", "territory"],
  stronghold: ["stronghold", "keep", "fort", "fortress", "bandits", "hold"],
  outposts: ["outposts", "outpost", "watchtowers", "towers"],
  town: ["town", "village", "smaller town"],
  hamlets: ["hamlets", "hamlet"],
  ruin: ["ruin", "ruins", "dungeon"],
  caves: ["caves", "cave", "caverns", "hillside"],
};
/** How a seed picks a purpose for a region nothing else gave one to: none often, then these by weight. */
const SEEDED = { none: 4, faction: 3, stronghold: 1.5, outposts: 1, town: 1.5, hamlets: 1.5, ruin: 1, caves: 1 };
const STRONGHOLD_NAMES = ["Blackrock Hold", "the Raven Keep", "Wolfgate", "the Iron Fort", "Thornwall", "Grimward"];
const DIRECTIONS = { north: [0, -1], east: [1, 0], south: [0, 1], west: [-1, 0] };

/** The purpose word lore wrote, as one of PURPOSES' names; "" when it isn't one. */
export function purposeKind(word) {
  const plain = String(word ?? "")
    .toLowerCase()
    .trim();
  return Object.keys(PURPOSES).find((kind) => PURPOSES[kind].includes(plain)) ?? "";
}

/**
 * Where a lorebook's `ww:region:` says, as a region's key: "east" is the region east of home, "far
 * north" or "north 2" two away, "north-east" (or "northeast") across the corner. Then an optional
 * purpose: "east:stronghold". Returns { key, kind } or { problem }.
 */
export function readRegion(value) {
  const [where, kindWord = ""] = String(value ?? "").split(":");
  const words = where
    .toLowerCase()
    .replace(/(north|south)(east|west)/u, "$1 $2")
    .split(/[\s-]+/u)
    .filter(Boolean);
  let steps = 1;
  let [x, z] = [0, 0];
  let named = false;
  for (const word of words) {
    if (word === "far") steps = 2;
    else if (/^\d+$/u.test(word)) steps = Math.max(1, Math.min(6, Number(word)));
    else if (DIRECTIONS[word]) {
      x += DIRECTIONS[word][0];
      z += DIRECTIONS[word][1];
      named = true;
    } else
      return { problem: `"${word}" isn't a way to go: north, east, south or west (north-east, far north, north 2)` };
  }
  if (!named || (x === 0 && z === 0)) return { problem: "a region is north, east, south or west of home" };
  const kind = kindWord.trim() ? purposeKind(kindWord) : "";
  if (kindWord.trim() && !kind) return { problem: `a region's purpose is one of: ${Object.keys(PURPOSES).join(", ")}` };
  return { key: `${x * steps},${z * steps}`, kind };
}

/** A purpose, checked: { kind, faction (id or ""), from ("lore" | "quest" | "seed" | "hand") }, or null. */
export function checkPurpose(raw) {
  if (!isRecord(raw) || !Object.hasOwn(PURPOSES, raw.kind)) return null;
  return {
    kind: raw.kind,
    faction: typeof raw.faction === "string" ? raw.faction.slice(0, 80) : "",
    from: ["lore", "quest", "seed", "hand"].includes(raw.from) ? raw.from : "seed",
  };
}

/** A world's purposes, checked: { [region key]: purpose }. */
export function checkPurposes(raw) {
  if (!isRecord(raw)) return {};
  return Object.fromEntries(
    Object.entries(raw)
      .filter(([key]) => /^-?\d{1,3},-?\d{1,3}$/u.test(key) && key !== HOME_REGION)
      .slice(0, 80)
      .map(([key, purpose]) => [key, checkPurpose(purpose)])
      .filter(([, purpose]) => purpose),
  );
}

/**
 * The purpose a new region gets when nothing gave it one: from the world's seed and where it is, so the
 * same world always makes the same. A faction's land goes to a faction that has none yet (`factions`:
 * the world's; `purposes`: those given so far). Null: plain countryside and hamlets, as before.
 */
export function seededPurpose(worldSeed, key, factions = [], purposes = {}) {
  const random = rng(hashString(`${worldSeed}|purpose|${key}`));
  const landed = new Set(Object.values(purposes).map((purpose) => purpose.faction));
  const landless = factions.filter((faction) => !landed.has(faction.id)).sort((a, b) => a.id.localeCompare(b.id));
  const weights = Object.entries(SEEDED).filter(([kind]) => kind !== "faction" || landless.length);
  let roll = random() * weights.reduce((sum, [, weight]) => sum + weight, 0);
  const [kind] = weights.find(([, weight]) => (roll -= weight) < 0) ?? weights[0];
  if (kind === "none") return null;
  const faction = kind === "faction" ? landless[Math.floor(random() * landless.length)].id : "";
  return { kind, faction, from: "seed" };
}

/**
 * Gives the next region from `from` across `side` that isn't made yet and has no purpose a purpose of its
 * own (a quest's "the next region that way needs a stronghold"). `regions`: the ones made. Returns {
 * purposes (new), key } or null when none within six regions is free.
 */
export function purposeAhead(purposes, regions, from, side, kind, faction = "", by = "quest") {
  if (!Object.hasOwn(PURPOSES, kind) || !SIDES.includes(side) || (kind === "faction" && !faction)) return null;
  let key = from;
  for (let step = 0; step < 6; step++) {
    key = regionNext(key, side);
    if (key === HOME_REGION || regions[key] || purposes[key]) continue;
    return { key, purposes: { ...purposes, [key]: { kind, faction, from: by } } };
  }
  return null;
}

/**
 * A new region's landscape made for its purpose (land.js describes landscapes). `arrive`: the side the
 * player comes in by (no mountains there). The same purpose and seed always make the same.
 */
export function landscapeForPurpose(landscape, purpose, seed, arrive = null) {
  if (!purpose) return landscape;
  const random = rng(hashString(`purpose:${seed}`));
  const out = { ...landscape, mountains: [...(landscape.mountains ?? [])], outposts: [...(landscape.outposts ?? [])] };
  const open = SIDES.filter((side) => side !== arrive).sort(() => random() - 0.5);
  const settle = (kind, fields = {}) => (out.settlement = checkSettlement({ ...out.settlement, kind, ...fields }));
  /** A side with hills to set cave mouths in: one there already, else a new range. */
  const hillside = () => {
    const side = out.mountains.find((entry) => entry !== arrive) ?? open.find((entry) => out.river?.side !== entry);
    if (side && !out.mountains.includes(side)) out.mountains.push(side);
    return side ?? open[0];
  };
  const add = (entry) => out.outposts.push(entry);
  switch (purpose.kind) {
    case "faction":
      // Their town: a walled town (now and then a city), cobbled, round a square, with a watchtower out on a road.
      settle(random() < 0.25 ? "city" : "town", {
        market: "square",
        roads: "cobble",
        layout: random() < 0.5 ? "grid" : "ring",
        walls: true,
      });
      add({ kind: "watchtower", side: open[0] });
      break;
    case "stronghold": {
      settle("hamlet", { market: "green", roads: "dirt", layout: "street", walls: false });
      const side = hillside();
      const name = STRONGHOLD_NAMES[Math.floor(random() * STRONGHOLD_NAMES.length)];
      add({ kind: "cave", side, deep: "stronghold", name });
      add({ kind: "watchtower", side });
      break;
    }
    case "outposts":
      settle("hamlet", { market: "green", roads: "dirt", layout: "crossroads", walls: false });
      for (const side of open.slice(0, 3)) add({ kind: "watchtower", side });
      break;
    case "town":
      settle("village", { market: "stalls", roads: "dirt", layout: "crossroads", walls: false });
      break;
    case "hamlets":
      settle("hamlet", { market: "green", roads: "dirt", layout: "street", walls: false });
      for (const side of open.slice(0, 2 + Math.floor(random() * 2))) add({ kind: "hamlet", side });
      break;
    case "ruin": {
      const side = hillside();
      add({ kind: "ruins", side });
      add({ kind: "cave", side, deep: "dungeon" });
      break;
    }
    case "caves": {
      out.hills = "rugged";
      const first = hillside();
      const second = open.find((side) => side !== first && side !== out.river?.side);
      if (second && !out.mountains.includes(second)) out.mountains.push(second);
      ["cave", "cavern", "cave"].forEach((deep, i) =>
        add({ kind: "cave", side: i === 1 && second ? second : first, deep }),
      );
      break;
    }
  }
  // (The purpose's own places first, so a full landscape keeps them.)
  const own = out.outposts.slice((landscape.outposts ?? []).length);
  out.outposts = [...own, ...(landscape.outposts ?? [])].slice(0, 14);
  return out;
}

/**
 * Who keeps a region with a purpose, as the herd's lore spawns take them (main.js syncSpawns): a
 * faction's guards in its town and at its towers, bandits at a stronghold's gate and the outposts.
 * `layout`: the world's (world.js); `standing`: the value with the purpose's faction; `guardsFight`:
 * whether guards fight a Hostile player (Settings). [{ id, kind, count, at: { x, z }, temper }].
 */
export function purposeSpawns(purpose, layout, standing = 0, guardsFight = true) {
  if (!purpose || !layout) return [];
  const guardTemper = guardsFight && isHostile(standing) ? "hostile" : "tame";
  // A faction's own people answer to its standing; a stronghold or outposts with no faction are bandits.
  const keeper = (where, count, n) =>
    purpose.faction
      ? { id: `guard|${purpose.faction}|${where}${n}`, kind: "bandit", count, temper: guardTemper }
      : { id: `bandits|${where}${n}`, kind: "bandit", count, temper: "hostile" };
  const out = [];
  const outposts = layout.outposts ?? [];
  if (purpose.kind === "faction" && layout.plaza)
    out.push({ ...keeper("town", 4, 0), at: { x: layout.plaza.x, z: layout.plaza.z } });
  outposts.forEach((outpost, i) => {
    if (outpost.kind === "cave" && outpost.deep === "stronghold")
      out.push({ ...keeper("gate", 4, i), at: { x: outpost.x, z: outpost.z } });
    if (outpost.kind === "watchtower" && ["faction", "outposts", "stronghold"].includes(purpose.kind))
      out.push({ ...keeper("tower", 2, i), at: { x: outpost.x, z: outpost.z } });
  });
  return out;
}

/** The faction id of a guard by its herd id ("lore:guard|faction:…|town0:2"), or "". */
export function guardFaction(id) {
  return /^lore:guard\|([^|]+)\|/u.exec(String(id ?? ""))?.[1] ?? "";
}

/** A purpose in a few words, for the Journal: "the Thieves Guild's land", "a bandit stronghold". */
export function purposeWords(purpose, factionName = "") {
  if (!purpose) return "countryside";
  const theirs = factionName ? `${factionName}'s ` : "";
  return {
    faction: `${theirs || "a faction's "}land`,
    stronghold: theirs ? `${theirs}stronghold` : "a bandit stronghold",
    outposts: theirs ? `${theirs}outposts` : "bandits' outposts",
    town: "a smaller town",
    hamlets: "a cluster of hamlets",
    ruin: "a ruin over a dungeon",
    caves: "a hillside of caves",
  }[purpose.kind];
}

/** The regions the player knows, for the map of regions: those they've been to, and any lore or a quest told of. */
export function knownRegions(regions, purposes, here) {
  const keys = new Set([HOME_REGION, here, ...Object.keys(regions ?? {})]);
  for (const [key, purpose] of Object.entries(purposes ?? {})) if (purpose.from !== "seed") keys.add(key);
  return [...keys].map((key) => {
    const [x, z] = key.split(",").map(Number);
    return { key, x, z, visited: key === HOME_REGION || key === here || !!regions?.[key] };
  });
}

/** The map of regions' squares (map.js drawRegions): each one known, a faction's land in its colour. */
export function regionCells(save) {
  const marks = { stronghold: "S", outposts: "O", town: "T", hamlets: "H", ruin: "R", caves: "C" };
  return knownRegions(save.regions, save.purposes, save.region).map((cell) => {
    const purpose = save.purposes?.[cell.key];
    return {
      ...cell,
      colour: purpose?.faction ? factionColour(purpose.faction) : null,
      mark: marks[purpose?.kind] ?? "",
    };
  });
}

/**
 * What Journal → Factions shows (journal.js drawFactions): each faction with its standing and what it
 * means now, the regions known, and the purposes to give one by hand. `save` and `settings` as the game
 * keeps them; `names`: id → name; `regionName(key)`.
 */
export function factionsView(save, settings, { names = {}, regionName = (key) => key } = {}) {
  const factions = save.factions ?? [];
  const nameOf = (id) => factions.find((faction) => faction.id === id)?.name ?? "";
  const known = knownRegions(save.regions, save.purposes, save.region);
  const list = factions.map((faction) => {
    const value = standingOf(save.standing, faction.id);
    const hostile = isHostile(value);
    const price = Math.round((priceFactor(value) - 1) * 100);
    const effects = [
      settings.factionPrices && price ? `their prices ${price > 0 ? "up" : "down"} ${Math.abs(price)}%` : "",
      settings.factionTalk && hostile ? "their people won't talk to you" : "",
      settings.factionGuards && hostile ? "their guards fight you" : "",
      settings.factionLand && hostile ? "their land isn't safe" : "",
    ].filter(Boolean);
    const lands = known.filter((cell) => save.purposes?.[cell.key]?.faction === faction.id);
    const enemies = enemiesOf(factions, faction.id).map(nameOf).filter(Boolean);
    return {
      id: faction.id,
      name: faction.name,
      colour: factionColour(faction.id),
      value,
      word: standingWord(value),
      locked: !!save.standing?.[faction.id]?.locked,
      lines: [
        faction.members.length ? `People: ${faction.members.map((id) => names[id] ?? id).join(", ")}.` : "",
        lands.length ? `Their land: ${lands.map((cell) => regionName(cell.key)).join(", ")}.` : "",
        enemies.length ? `Enemies: ${enemies.join(", ")}.` : "",
        effects.length ? `Now: ${effects.join("; ")}.` : "",
      ].filter(Boolean),
    };
  });
  const about = (key) =>
    key === HOME_REGION
      ? "where you began"
      : purposeWords(save.purposes?.[key], nameOf(save.purposes?.[key]?.faction ?? ""));
  return {
    list,
    regions: known.map((cell) => `${cell.visited ? "" : "(heard of) "}${regionName(cell.key)}: ${about(cell.key)}`),
    kinds: Object.keys(PURPOSES).map((kind) => [kind, purposeWords({ kind })]),
  };
}

/**
 * A banner on a pole in a faction's colour, about 4.5 m tall, its feet at the origin: three.js meshes in
 * a group, to stand in its town.
 */
export function bannerMesh(colour) {
  const group = new Group();
  const pole = new Mesh(new CylinderGeometry(0.05, 0.06, 4.4, 6), new MeshLambertMaterial({ color: 0x5a4632 }));
  pole.position.y = 2.2;
  const cloth = new Mesh(new BoxGeometry(0.9, 1.6, 0.04), new MeshLambertMaterial({ color: colour }));
  cloth.position.set(0.5, 3.4, 0);
  const bar = new Mesh(new BoxGeometry(1.05, 0.06, 0.06), new MeshLambertMaterial({ color: 0x5a4632 }));
  bar.position.set(0.5, 4.22, 0);
  group.add(pole, cloth, bar);
  return group;
}

/** Which kinds of deep place an entrance can lead to (`deep` on a cave mouth): for the deep places' code. */
export { DEEP_KINDS };

// ── Settings → World → Factions ──────────────────────────────────────────────

/** The Factions settings in the order shown, with their labels (hud.js). */
export const FACTION_SETTINGS = [
  ["regionPurposes", "New regions can have a purpose"],
  ["factionStanding", "Standing changes by what you do"],
  ["factionPrices", "Standing sets their prices"],
  ["factionTalk", "Their people won't talk when Hostile"],
  ["factionGuards", "Their guards fight you when Hostile"],
  ["factionLand", "Their land isn't safe when Hostile"],
  ["factionTold", "Tell the AI their standing"],
];

/** What each one does, what overrides it and what it overrides (hud.js shows them under each). */
export const FACTION_EXPLAIN = {
  regionPurposes:
    "On: a region that travel makes for the first time can be made for a purpose: a faction's walled town with its banners and guards, a bandit stronghold, a few outposts, a smaller town, several hamlets, a ruin over a dungeon, or a hillside of caves. Lore (ww:region:east on a faction's entry) and quests choose first; the rest come from the world's seed, the same every time. Regions already made keep what they are. Off: every new region is countryside and hamlets, and a purpose waiting for it is dropped.",
  factionStanding:
    "On: how each faction regards you moves a little with what you do. An errand for one of its people or beating monsters on its land raises it, and so does trading at its vendors once a day. A blow at one of its guards lowers it. It moves at most 10 a day, and helping a faction costs a little with its enemies (ww:enemy of: on its entry). A standing you lock in Journal → Factions never moves. Off: standings stay where they are, unless you set them by hand.",
  factionPrices:
    "On: a faction's vendors (in its land, or where one of its people works) charge a fifth more when you're Hated and a fifth less when you're Honoured, and pay you the other way round. It's on top of haggling. Off: their prices are as marked.",
  factionTalk:
    "On: a faction's people won't talk to you while you're Hostile or Hated to them. Off: anyone will talk, whatever their faction thinks of you.",
  factionGuards:
    "On: while you're Hostile or Hated to a faction, its guards come for you as hostile creatures do (Settings → Creatures → Behaviour). In their own town they only do that with \"Their land isn't safe\" on, since towns are safe places. Where people may confront you set to Nowhere stops them. Off: guards keep the peace and only fight back when struck.",
  factionLand:
    "On: while you're Hostile or Hated to a faction, nowhere in its land counts as safe, not even its town. Its guards, its hostile people and the monsters there can come for you anywhere. This overrides \"Where people may confront you\" in that land, unless that's set to Nowhere. Off: its towns and places are as safe as anyone else's.",
  factionTold:
    "On: when one of a faction's people speaks with the AI, it's told in one short sentence how their faction regards you, so they talk the way their faction feels about you. A few words each time, and nothing is sent without AI conversations on. Off: the AI isn't told.",
};
