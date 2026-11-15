// Gathering: fishing, chopping wood, foraging, mining and harvesting, wherever the land allows it. What is
// found goes into the player's inventory (Quartermaster's, through inventory.js). What each kind is called
// and what it yields are the setting pack's (pack.js `gather`); this is the rules: where each can be done,
// the roll that decides what's found, and how long a spot takes to give again.
import { modifier } from "./sheet.js";

/** Each kind: its button, the attribute its roll adds, and how the body shows it (a clip played once: clips.js). */
export const GATHER_KINDS = {
  fish: { label: "Fish", attribute: "dexterity", gesture: "fish" },
  chop: { label: "Chop wood", attribute: "strength", gesture: "chop" },
  forage: { label: "Forage", attribute: "wisdom", gesture: "pick" },
  mine: { label: "Mine", attribute: "strength", gesture: "mine" },
  harvest: { label: "Harvest", attribute: "constitution", gesture: "harvest" },
};

const WOODS = new Set(["forest", "outskirts", "meadow"]);
/** How many times a tree can be chopped at before it's down. */
export const TREE_WOOD = 4;

/**
 * What can be gathered where the player stands: each kind only at its resource. `where`: { zone (its
 * kind), outpost (its kind, or ""), beside (the kinds of the places they're beside), water (there's water
 * within reach), tree (they stand against one), rock (against a boulder), season, indoors }.
 */
export function gatherHere(where) {
  if (!where || where.indoors) return [];
  const beside = where.beside ?? [];
  const kinds = [];
  if (where.water) kinds.push("fish");
  if (where.tree) kinds.push("chop");
  if (WOODS.has(where.zone) && where.season !== "winter") kinds.push("forage");
  if (where.rock || where.zone === "cave" || beside.includes("cave")) kinds.push("mine");
  if (where.outpost === "farm" && ["", "summer", "fall"].includes(where.season ?? "")) kinds.push("harvest");
  return kinds;
}

/** The patch of ground a gathering uses up: ten metres square, one for each kind. */
export const spotKey = (kind, x, z) => `${kind}:${Math.floor(x / 10)}:${Math.floor(z / 10)}`;

/** Whether a spot gives again: it was last used `regrow` or more days ago (0: it always does). */
export function spotReady(used, key, day, regrow) {
  const last = used?.[key];
  return !Number.isFinite(last) || regrow <= 0 || day - last >= regrow || day < last;
}

/** A spot used today, with the oldest forgotten past 300 of them. */
export function spotUsed(used, key, day) {
  const next = { ...used, [key]: day };
  const keys = Object.keys(next);
  if (keys.length <= 300) return next;
  keys.sort((a, b) => next[a] - next[b]);
  for (const old of keys.slice(0, keys.length - 300)) delete next[old];
  return next;
}

/**
 * A tree chopped at once more on `day`: `trees` is the world's record ({ "region:number": { cut, day } }).
 * Gives the record as it then is and whether that brought the tree down.
 */
export function chopTree(trees, key, day) {
  const cut = (trees?.[key]?.cut ?? 0) + 1;
  return { trees: { ...trees, [key]: { cut, day } }, down: cut >= TREE_WOOD };
}

/**
 * The trees of `region` that are down on `day`, as their numbers, and the record without what has grown
 * back (a felled tree stands again after `grow` days; 0: never; one only chopped at is whole again then too).
 */
export function treesDown(trees, region, day, grow) {
  const kept = {};
  const down = [];
  for (const [key, tree] of Object.entries(trees ?? {})) {
    if (grow > 0 && Number.isFinite(tree?.day) && (day - tree.day >= grow || day < tree.day)) continue;
    kept[key] = tree;
    const [where, number] = key.split("|");
    if (where === region && tree.cut >= TREE_WOOD) down.push(Number(number));
  }
  return { trees: kept, down };
}

/**
 * One try at gathering: a d20 plus the modifier of `score` (the attribute for the kind). Under 8 nothing
 * is found; from 18 up, two. What's found comes from `lists[kind]` (for foraging, the season's list), the
 * things earlier in a list turning up more often. { roll, total, found: { name, description, quantity } | null }.
 */
export function gatherRoll(kind, score, lists, season = "", random = Math.random) {
  const roll = 1 + Math.floor(random() * 20);
  const total = roll + modifier(score);
  const all = lists?.[kind];
  const list = Array.isArray(all) ? all : (all?.[season || "summer"] ?? all?.summer ?? []);
  if (total < 8 || !list.length) return { roll, total, found: null };
  const pick = list[Math.min(list.length - 1, Math.floor(random() ** 1.7 * list.length))];
  // (A tree gives one piece at a stroke: four strokes, four at most.)
  return {
    roll,
    total,
    found: { name: pick.name, description: pick.description ?? "", quantity: total >= 18 && kind !== "chop" ? 2 : 1 },
  };
}
