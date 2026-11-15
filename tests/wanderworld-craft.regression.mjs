// Crafting and tools (packages/wanderworld/src/craft.js): which item is a tool for what, what a recipe
// needs and takes, the player's own recipes, and that the setting's recipes can be made from what
// gathering finds.
import assert from "node:assert/strict";
import {
  canCraft,
  checkRecipes,
  craftTakes,
  held,
  knownRecipes,
  saveRecipe,
  toolBonus,
  toolFor,
  TOOLS,
} from "../packages/wanderworld/src/craft.js";
import { PACK } from "../packages/wanderworld/src/pack.js";

// Tools are told by their names: whatever the player made or was given counts.
const bag = [
  { id: "a", name: "Stone axe", quantity: 1, location: "bag" },
  { id: "b", name: "Fallen branch", quantity: 3, location: "bag" },
  { id: "c", name: "Flint", quantity: 1, location: "bag" },
  { id: "d", name: "Flint", quantity: 2, location: "stored:chest" },
  { id: "e", name: "Old fishing rod", quantity: 1, location: "equipped:mainhand" },
];
assert.equal(toolFor("chop", bag).id, "a");
assert.equal(toolFor("fish", bag).id, "e");
assert.equal(toolFor("mine", bag), null, "no pick");
assert.equal(toolFor("mine", [{ name: "Dwarven Pickaxe" }]).name, "Dwarven Pickaxe");
assert.equal(toolFor("chop", [{ name: "Relaxed attitude" }]), null, "an axe is a word of its own");
assert.equal(toolFor("forage", bag), null, "done by hand");
// What a tool adds is what its description says; the setting's iron tools say so, its stone ones don't.
assert.deepEqual(
  [
    toolBonus({ description: "Tool: chops wood, +2 gathering." }),
    toolBonus({ description: "A plain axe." }),
    toolBonus({ description: "-1 to gathering" }),
    toolBonus(null),
  ],
  [2, 0, -1, 0],
);
assert.equal(toolBonus(PACK.recipes.find((recipe) => recipe.id === "iron-axe")), 2);
assert.equal(toolBonus(PACK.recipes.find((recipe) => recipe.id === "stone-axe")), 0);
assert.deepEqual([TOOLS.chop.weapon, TOOLS.mine.weapon, TOOLS.fish.weapon], [true, true, false]);

// What a recipe needs, against what's carried (over every stack), and what making it takes.
assert.equal(held(bag, "flint"), 3);
const pick = {
  id: "p",
  name: "Stone pickaxe",
  makes: 1,
  needs: [
    { name: "Fallen branch", quantity: 1 },
    { name: "Flint", quantity: 2 },
  ],
};
assert.deepEqual(canCraft(pick, bag), {
  needs: [
    { name: "Fallen branch", quantity: 1, have: 3 },
    { name: "Flint", quantity: 2, have: 3 },
  ],
  can: true,
});
assert.deepEqual(
  craftTakes(pick, bag),
  [
    { id: "b", quantity: 2 },
    { id: "c", quantity: 0 },
    { id: "d", quantity: 1 },
  ],
  "the bag's before what's stored; a stack used up is left at none",
);
assert.equal(craftTakes({ needs: [{ name: "Flint", quantity: 9 }] }, bag), null);
assert.equal(canCraft({ needs: [{ name: "Gold", quantity: 1 }] }, bag).can, false);

// The player's own: what was put in and what comes of it, saved; one of the same name replaces the old.
let own = saveRecipe([], {
  name: "Flint knife",
  description: "A sharp flake on a grip. +1 to attack.",
  makes: 1,
  needs: [
    { name: "Flint", quantity: 1 },
    { name: "Fallen branch", quantity: 1 },
  ],
});
assert.deepEqual([own.length, own[0].id, own[0].own, own[0].level], [1, "own:flint-knife", true, 1]);
own = saveRecipe(own, { name: "Flint knife", needs: [{ name: "Flint", quantity: 2 }] });
assert.deepEqual([own.length, own[0].needs], [1, [{ name: "Flint", quantity: 2 }]]);
assert.equal(saveRecipe(own, { name: "", needs: [{ name: "Flint", quantity: 1 }] }), own, "it needs a name");
assert.equal(saveRecipe(own, { name: "Nothing", needs: [] }), own, "and something put in");
assert.deepEqual(
  checkRecipes([
    { name: "X", needs: [{ name: "A", quantity: -3 }, { name: "a", quantity: 2 }, { name: "" }] },
    "junk",
  ])[0].needs,
  [{ name: "A", quantity: 1 }],
);

// What's known: the setting's by level, and all of one's own. With no sheet, all of the setting's.
const pack = [
  { id: "one", name: "One", needs: [{ name: "A", quantity: 1 }] },
  { id: "three", name: "Three", level: 3, needs: [{ name: "A", quantity: 1 }] },
];
assert.deepEqual(
  knownRecipes(pack, own, 1).recipes.map((recipe) => recipe.id),
  ["one", "own:flint-knife"],
);
assert.equal(knownRecipes(pack, own, 1).locked, 1);
assert.equal(knownRecipes(pack, own, 3).locked, 0);
assert.equal(knownRecipes(pack, [], null).recipes.length, 2);

// The setting's recipes hang together: every first-level one is made only of things gathering finds or
// another first-level recipe makes, and there's a first tool for each kind of gathering that needs one.
{
  const found = new Set();
  for (const list of Object.values(PACK.gather))
    for (const item of [Array.isArray(list) ? list : (Object.values(list).flat?.() ?? [])].flat())
      if (item?.name) found.add(item.name);
  const first = knownRecipes(PACK.recipes, [], 1).recipes;
  for (const recipe of first) found.add(recipe.name);
  for (const recipe of knownRecipes(PACK.recipes, [], null).recipes)
    for (const need of recipe.needs)
      assert.ok(
        found.has(need.name) || PACK.recipes.some((other) => other.name === need.name),
        `${recipe.name} needs ${need.name}, which nothing gives`,
      );
  for (const kind of Object.keys(TOOLS))
    assert.ok(
      first.some((recipe) => toolFor(kind, [recipe])),
      `a first ${TOOLS[kind].tool} can be made at level 1`,
    );
  // And the first tools need nothing that takes a tool to get: all of it is foraged.
  const foraged = new Set(
    Object.values(PACK.gather.forage)
      .flat()
      .map((item) => item.name),
  );
  for (const kind of Object.keys(TOOLS)) {
    const recipe = first.find((entry) => toolFor(kind, [entry]));
    for (const need of recipe.needs) assert.ok(foraged.has(need.name), `${recipe.name}: ${need.name} can be foraged`);
  }
}

console.log("ok: crafting and tools");
