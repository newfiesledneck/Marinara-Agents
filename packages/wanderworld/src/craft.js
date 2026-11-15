// Crafting and tools. A recipe turns things carried into something else: { id, name, description, makes
// (how many), needs: [{ name, quantity }], level (the character level it comes at; 1 when not given) }.
// The setting's own recipes are the pack's (pack.js `recipes`); the player's are kept with the world, made
// by putting things together, describing what comes of it and saving that as a recipe. Things are matched
// by name, as Quartermaster keeps them: this module only reads lists of items and says what to change.

const words = (value, max) => (typeof value === "string" ? value.replace(/\s+/gu, " ").trim().slice(0, max) : "");
const same = (a, b) => String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
const count = (value, most = 999) => Math.max(1, Math.min(most, Math.round(Number(value)) || 1));

/**
 * The tool each kind of gathering takes, told by an item's name (so one the player made or was given
 * counts), and whether it can be swung as a weapon. Foraging and harvesting are done by hand.
 */
export const TOOLS = {
  chop: { tool: "axe", named: /\b(?:axe|hatchet)\b/iu, need: "an axe", weapon: true },
  mine: { tool: "pick", named: /\bpick(?:axe)?\b/iu, need: "a pickaxe", weapon: true },
  fish: { tool: "rod", named: /\b(?:fishing (?:rod|pole|line)|rod)\b/iu, need: "a fishing rod", weapon: false },
};

/** The item among `items` that serves as the tool for gathering `kind`; null for none (or when none is needed). */
export function toolFor(kind, items) {
  const tool = TOOLS[kind];
  if (!tool) return null;
  return (Array.isArray(items) ? items : []).find((item) => tool.named.test(String(item?.name ?? ""))) ?? null;
}

/**
 * What a tool adds to the gathering roll: what its description says ("+2 gathering"), 0 when it says
 * nothing. So a better tool finds something more often, and two of it more often.
 */
export function toolBonus(item) {
  const match = /([+\-−])\s?(\d{1,2})\s*(?:to\s+)?gathering/iu.exec(String(item?.description ?? ""));
  return match ? (match[1] === "+" ? 1 : -1) * Number(match[2]) : 0;
}

/** How many of something named `name` are carried, over every stack of it. */
export const held = (items, name) =>
  (Array.isArray(items) ? items : [])
    .filter((item) => same(item?.name, name))
    .reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

function checkRecipe(raw, own) {
  const name = words(raw?.name, 60);
  const seen = new Set();
  const needs = (Array.isArray(raw?.needs) ? raw.needs : [])
    .map((need) => ({ name: words(need?.name, 60), quantity: count(need?.quantity) }))
    .filter((need) => need.name && !seen.has(need.name.toLowerCase()) && seen.add(need.name.toLowerCase()))
    .slice(0, 8);
  if (!name || !needs.length) return null;
  return {
    id: words(raw?.id, 80) || `own:${name.toLowerCase().replace(/[^a-z0-9]+/gu, "-")}`,
    name,
    description: words(raw?.description, 300),
    makes: count(raw?.makes, 99),
    needs,
    level: Math.max(1, Math.min(99, Math.round(Number(raw?.level)) || 1)),
    ...(own ? { own: true } : {}),
  };
}

/** The player's saved recipes, as kept with the world: checked, no two of an id, sixty at most. */
export function checkRecipes(raw) {
  const seen = new Set();
  return (Array.isArray(raw) ? raw : [])
    .map((recipe) => checkRecipe(recipe, true))
    .filter((recipe) => recipe && !seen.has(recipe.id) && seen.add(recipe.id))
    .slice(0, 60);
}

/**
 * A recipe of the player's own, saved: what was put in, and what comes of it. Gives the list as it then is
 * (one of the same name is replaced), or the list unchanged when there's no name or nothing was put in.
 */
export function saveRecipe(recipes, made) {
  const recipe = checkRecipe({ ...made, id: "", level: 1 }, true);
  if (!recipe) return recipes;
  return checkRecipes([...recipes.filter((entry) => entry.id !== recipe.id), recipe]);
}

/**
 * The recipes a character knows: the setting's that come by their `level` (all of them with `level` null,
 * when there's no sheet), and every one of their own. Also how many of the setting's are still to come.
 */
export function knownRecipes(packRecipes, own, level) {
  const pack = (packRecipes ?? []).map((recipe) => checkRecipe(recipe, false)).filter(Boolean);
  const known = pack.filter((recipe) => level === null || recipe.level <= level);
  return { recipes: [...known, ...own], locked: pack.length - known.length };
}

/** A recipe against what's carried: each need with how many are had, and whether it can be made. */
export function canCraft(recipe, items) {
  const needs = recipe.needs.map((need) => ({ ...need, have: held(items, need.name) }));
  return { needs, can: needs.every((need) => need.have >= need.quantity) };
}

/**
 * What making `recipe` once takes from `items`: [{ id, quantity }] for a stack that is left smaller, or
 * { id, quantity: 0 } for one used up. Null when something is missing. Things in the bag go before
 * things worn or stored.
 */
export function craftTakes(recipe, items) {
  const takes = [];
  for (const need of recipe.needs) {
    let left = need.quantity;
    const stacks = (Array.isArray(items) ? items : [])
      .filter((item) => same(item?.name, need.name))
      .sort((a, b) => Number(a.location !== "bag") - Number(b.location !== "bag"));
    for (const stack of stacks) {
      if (left <= 0) break;
      const has = Number(stack.quantity) || 1;
      const used = Math.min(has, left);
      left -= used;
      takes.push({ id: stack.id, quantity: has - used });
    }
    if (left > 0) return null;
  }
  return takes;
}
