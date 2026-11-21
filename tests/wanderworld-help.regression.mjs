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

console.log("ok: help for the assistant");
