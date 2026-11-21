// The Help the AI assistant reads for a question (help.js helpFor). Run: node tests/wanderworld-help.regression.mjs
import assert from "node:assert/strict";
import { HELP, helpFor } from "../packages/wanderworld/src/help.js";

// The sections given, in the order given (a section starts its own line with "<title>: ").
const titles = (text) =>
  HELP.map((part) => ({ title: part.title, at: `\n${text}`.indexOf(`\n${part.title}: `) }))
    .filter((part) => part.at >= 0)
    .sort((a, b) => a.at - b.at)
    .map((part) => part.title);

// Where things are always comes first; then what matches the question best.
const fight = titles(helpFor("How does grappling and shoving work in a fight?", 80000));
assert.match(fight[0], /^Settings, and where/u);
assert.equal(fight[1], "Fighting", "the fighting section next");
assert.ok(fight.includes("Getting about"), "with room, the rest follows");

const keys = titles(helpFor("What lorebook keywords can I use for a tavern?", 80000));
assert.ok(keys.indexOf("Lorebook keywords") <= 2, "the keyword list for a keyword question");

// Never more than it's allowed, and never a section cut in half.
const small = helpFor("How do I fish?", 12000);
assert.ok(small.length <= 12000);
for (const title of titles(small)) {
  const part = HELP.find((entry) => entry.title === title);
  if (Array.isArray(part.lines)) assert.ok(small.includes(`${title}: ${part.lines.join(" ")}`), `${title} whole`);
}
assert.ok(titles(small).includes("Gathering, crafting and shops"), "what matches fits first");

// All of Help is well within the most it can be set to.
// (The most the assistant can be given is Settings → AI assistant → Help at its highest, 25,000 tokens: about 100,000 characters.)
assert.ok(helpFor("", 1e9).length < 100000);

// The Blender-made models' credits come from one list (help.js BLENDER_MODELS): it is what the kit holds,
// by where it is, and Help, the README and kit/CREDITS.md each name them all, as made by ThatOneCan, with
// the built-in body's MakeHuman credit and the giants' base body.
{
  const { readdirSync, readFileSync } = await import("node:fs");
  const { BLENDER_MODELS, CREDITS, MAKEHUMAN_CREDIT, namesOf } = await import("../packages/wanderworld/src/help.js");
  const pkg = new URL("../packages/wanderworld/", import.meta.url);
  // (Each folder's index of its bundles names every model in them.)
  const kitNames = (index) => Object.keys(JSON.parse(readFileSync(new URL(index, pkg), "utf8"))).sort();
  assert.deepEqual([...BLENDER_MODELS.folk].sort(), kitNames("kit/fantasy/folk/folk-built-index.json"));
  assert.deepEqual([...BLENDER_MODELS.rigged].sort(), kitNames("kit/creatures/rigged-index.json"));
  const flat = (text) => text.replace(/\s+/gu, " ");
  const help = flat(CREDITS.flatMap((part) => part.lines).join(" "));
  for (const [where, text] of [
    ["Help", help],
    ["the README", flat(readFileSync(new URL("README.md", pkg), "utf8"))],
    ["kit/CREDITS.md", flat(readFileSync(new URL("kit/CREDITS.md", pkg), "utf8"))],
  ]) {
    for (const list of Object.values(BLENDER_MODELS))
      assert.ok(text.includes(namesOf(list)), `${where} names ${namesOf(list)}`);
    assert.ok(text.includes(MAKEHUMAN_CREDIT), `${where} gives the MakeHuman credit`);
    assert.ok(text.includes("giant-base.glb"), `${where} names the giants' base body`);
    assert.ok(text.includes("ThatOneCan"), `${where} credits ThatOneCan`);
  }
  console.log("ok: one list of the Blender-made models' credits");
}

console.log("ok: help for the assistant");
