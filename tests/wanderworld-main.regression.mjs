// Wanderworld's main.js needs a page and a graphics card, so it can't be run here. These check, in its
// source, the few rules that broke before without a test noticing.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const main = readFileSync(new URL("../packages/wanderworld/src/main.js", import.meta.url), "utf8");
const body = (name) => {
  const start = main.search(new RegExp(`^(async )?function ${name}\\(`, "mu"));
  assert.ok(start >= 0, `${name} is there`);
  const end = main.indexOf("\n}\n", start);
  return main.slice(start, end);
};

// `core.looks` is the outfits chosen by hand (saved with the world); what the AI says people look like is
// `core.appearances`. One of them once reset the other on every load, and the next Look change wiped the
// world's saved outfits.
assert.ok(!/core\.looks\s*=\s*new Map/u.test(main), "the chosen looks are never replaced by a Map");
assert.ok(!/core\.looks\.(get|set|has|delete)\(/u.test(main), "nor used as one");
assert.match(body("looksOf"), /core\.appearances/u);
assert.match(body("playWorld"), /core\.looks = \{ \.\.\.\(save\.looks \?\? \{\}\) \}/u);

// A world opened doesn't run what was still to happen in the one left (a reply read out, a fade).
assert.match(body("playWorld"), /core\.timers = \[\];/u);

// Attaching to the page again doesn't add another sound-unlock listener (one function, added once).
assert.match(main, /addEventListener\("keydown", unlockSound\)/u);

// Settings → Controls waits for a key with a listener on the whole window: a key pressed outside the
// game, or after the panel or the game has gone, isn't swallowed and doesn't become a key binding.
const hud = readFileSync(new URL("../packages/wanderworld/src/hud.js", import.meta.url), "utf8");
const waiting = hud.slice(
  hud.indexOf("listening = (event) => {"),
  hud.indexOf('window.addEventListener("keydown", listening, true)'),
);
const guard = waiting.indexOf("!list.isConnected || !layer.contains(event.target)");
assert.ok(
  guard >= 0 && guard < waiting.indexOf("event.preventDefault()"),
  "it looks where the key was pressed before it takes it",
);

console.log("wanderworld main regression: OK");
