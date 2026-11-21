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

// The SRD's paralyzed and unconscious (review L-09): every attack on a creature, the player or a companion,
// in real time or by turns, asks whether it's a critical hit from within 1.5 m, and a Strength or Dexterity
// save by one of them fails without a roll. A creature held by a spell keeps the spell's effect for it.
for (const name of [
  "landOn",
  "shapeStrike",
  "spellOnFoe",
  "allyStrikes",
  "allyAttacked",
  "foeGrabs",
  "foeAttacks",
  "foeShoots",
  "personActs",
]) {
  assert.match(body(name), /critHit: |critHit = crit/u, `${name} passes critHit`);
}
assert.match(body("playerSave"), /if \(failsSave\(afflicted\(\), attribute\)\)/u);
assert.match(body("allySave"), /if \(failsSave\(allyMods\(id\), attribute\)\)/u);
assert.match(body("spellOnFoe"), /fails: failsSave\(foeMods\(foe\), spell\.save\?\.attribute\)/u);
assert.match(body("foeShoots"), /fails: failsSave\(afflicted\(\), chosen\.spell\.save\?\.attribute\)/u);
assert.match(body("spellOnFoe"), /core\.herd\.stun\(foe\.id, seconds, result\.effect\.name\)/u);

// Review H-03: a world the Engine has a newer copy of (another browser saved it, or refused this one's save)
// is never saved over. Every save goes through saves.js `write`, which is given the stale mark; savePlace and
// Save world check it too. It's loaded again at once, or when the menu closes (resume), and says why.
assert.match(main, /createSaves\(core\.store, \{ stale: \(id\) => !!id && id === core\.staleWorld \}\)/u);
assert.equal((main.match(/createSaves\(/gu) ?? []).length, 1, "one set of saves, made with the mark");
assert.ok(
  !/core\.store\.setItem\(WORLD_KEY|core\.store\.setItem\(`wanderworld\.world/u.test(main),
  "no world written round it",
);
assert.match(body("savePlace"), /core\.staleWorld === core\.save\.id\) return;/u);
assert.match(body("saveWorldNow"), /if \(core\.staleWorld === core\.save\.id\)/u);
assert.match(body("savesChanged"), /core\.staleWorld = kept\.id;\n {2}if \(!core\.paused\) reloadStale\(\);/u);
assert.match(
  body("resume"),
  /^function resume\(\) \{\n.*\n {2}if \(core\.world && core\.save && core\.staleWorld === core\.save\.id\) return void reloadStale\(\);/u,
);
assert.match(body("playWorld"), /if \(stale && core\.save\?\.id === id\) core\.hud\?\.setNotice\(STALE_NOTICE\);/u);

console.log("wanderworld main regression: OK");
