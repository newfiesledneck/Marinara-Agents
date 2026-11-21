// Holds and throws (grapple.js): a creature's grab and hold, vines round the legs, and a big creature's throw.
// Run: node tests/wanderworld-grapple.regression.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  escapeRoll,
  fallDice,
  gripOf,
  gripRules,
  holdAfter,
  holdConditions,
  holdEnds,
  holdFits,
  landing,
  pinned,
  reeled,
  tossOf,
  VINES,
} from "../packages/wanderworld/src/grapple.js";
import { afflict, conditionMods } from "../packages/wanderworld/src/conditions.js";
import { SRD_CREATURES } from "../packages/wanderworld/src/srd.js";

const ON = {
  sheet: true,
  fights: "realtime",
  srdCreatures: true,
  creatureExtras: true,
  conditions: true,
  creatureHolds: true,
  vineHolds: true,
  giantThrows: true,
};
const rules = gripRules(ON);
const always = () => 0;

// The escape DC is the SRD's own: the ruleset package's creature catalog, as srd.js was built from it.
const catalog = new Map(
  JSON.parse(
    readFileSync(new URL("../packages/ruleset-5e-2014/catalogs/creatures.json", import.meta.url), "utf8"),
  ).entries.map((entry) => [entry.id, entry.creature]),
);
const escapeIn = (id) =>
  (catalog.get(id).actions ?? [])
    .flatMap((action) => [...(action.applies ?? []), ...(action.allHit?.applies ?? [])])
    .find((entry) => entry.escapeDc)?.escapeDc;
for (const [kind, id] of [
  ["roper", "roper"],
  ["otyugh", "otyugh"],
  ["shambling_mound", "shambling-mound"],
  ["frog", "giant-frog"],
  ["mimic", "mimic"],
])
  assert.equal(SRD_CREATURES[kind].hold.escape, escapeIn(id), `${kind}: the SRD's escape DC`);
assert.equal(SRD_CREATURES.roper.hold.escape, 15);
assert.equal(SRD_CREATURES.roper.hold.reach, 15, "a roper's tendril reaches 50 feet");
assert.equal(SRD_CREATURES.roper.hold.pull, 7.5, "and its Reel pulls 25 feet");
assert.equal(SRD_CREATURES.otyugh.hold.upTo, "medium");
assert.ok(holdFits(SRD_CREATURES.otyugh.hold, "medium") && !holdFits(SRD_CREATURES.otyugh.hold, "large"));
assert.deepEqual(SRD_CREATURES.shambling_mound.hold.engulf.save, { attribute: "constitution", dc: 14 });
assert.equal(SRD_CREATURES.awakened_shrub.hold, undefined, "the SRD's shrub only rakes");

// A hold stops movement: what it lays adds up to "can't move", and someone held is kept at its reach.
const tendril = SRD_CREATURES.roper.hold;
const held = holdConditions(tendril).reduce((state, name) => afflict(state, name, 600), {});
assert.deepEqual(holdConditions(tendril), ["grappled", "restrained"]);
assert.ok(conditionMods(held).still, "held, they can't move");
assert.ok(conditionMods(held).defendAdv, "restrained, attacks on them have advantage");
assert.ok(conditionMods(afflict({}, "restrained", VINES.seconds)).still, "vines hold the legs");
const roper = { x: 0, z: 0 };
const walkedOff = pinned(roper, { x: 0, z: 14 }, 10);
assert.ok(Math.abs(Math.hypot(walkedOff.x, walkedOff.z) - 10) < 1e-9, "pulled back to where it holds them");
assert.deepEqual(pinned(roper, { x: 3, z: 0 }, 10), { x: 3, z: 0 }, "nearer than its reach, they stay put");

// An escape roll frees the target: the better of Athletics and Acrobatics against the DC.
const high = escapeRoll({ athletics: 3, acrobatics: 1, dc: 15 }, () => 0.7); // (a 15)
assert.ok(high.freed && high.skill === "Athletics" && high.total === 18, high.words);
assert.match(high.words, /^Athletics 15 \+ 3 = 18 against DC 15$/u);
const low = escapeRoll({ athletics: 3, acrobatics: 1, dc: 15 }, () => 0.1); // (a 3)
assert.ok(!low.freed);
// (A roper's hold: Strength at a disadvantage, so the worse of two dice for Athletics.)
const rolls = [0.9, 0.0];
const weak = escapeRoll({ athletics: 5, acrobatics: 0, dc: 12, weak: true }, () => rolls.shift());
assert.equal(weak.skill, "Acrobatics", "with Strength hampered, Acrobatics' 19 beats Athletics' 1 + 5");
assert.ok(weak.freed);

// The hold ends when the creature is beaten, runs, is stunned, lets go, or is knocked back.
const hold = { hold: tendril, at: { x: 0, z: 5 }, keep: 5 };
assert.equal(holdEnds({ ...hold, foe: { x: 0, z: 0 } }), null, "it holds on");
assert.equal(holdEnds({ ...hold, foe: null }), "beaten");
assert.equal(holdEnds({ ...hold, foe: { x: 0, z: 0, fled: true } }), "fled");
assert.equal(holdEnds({ ...hold, foe: { x: 0, z: 0, stunned: true } }), "let go");
assert.equal(holdEnds({ ...hold, foe: { x: 0, z: 0 }, until: 60, clock: 61 }), "let go");
assert.equal(holdEnds({ ...hold, foe: { x: 0, z: -3 } }), "knocked back", "shoved 3 m off");
assert.equal(holdEnds({ ...hold, foe: { x: 0, z: 0 }, lasting: false }), "worn");
assert.equal(
  holdEnds({ hold: VINES, at: { x: 0, z: 0 }, keep: 0, foe: { x: 9, z: 9 } }),
  null,
  "vines hold where they are",
);

// A roper's reel pulls towards it, 7.5 metres a turn, never past its bite.
let keep = 15;
keep = reeled(keep, tendril.pull, 1.1);
assert.equal(keep, 7.5);
const reeledTo = pinned(roper, { x: 0, z: 15 }, keep);
assert.equal(reeledTo.z, 7.5, "pulled straight towards it");
keep = reeled(keep, tendril.pull, 1.1);
assert.equal(keep, 1.1, "in to its bite");

// A throw lands on dry open ground, never through a collider: a wall 2 m ahead and a pool to the left.
const wall = (x, z) => z < 2 || x > 3;
const pool = (x, z) => Math.hypot(x + 2, z - 2) > 1.5;
const clear = (x, z) => wall(x, z) && pool(x, z);
const thrown = landing({ from: { x: 0, z: -1 }, at: { x: 0, z: 0 }, metres: 4, clear });
assert.ok(thrown.metres > 2, `round the wall (${thrown.metres} m)`);
for (let t = 0; t <= 1.0001; t += 0.02) assert.ok(clear(thrown.x * t, thrown.z * t), "every step of the way is clear");
const boxed = landing({
  from: { x: 0, z: -1 },
  at: { x: 0, z: 0 },
  metres: 4,
  clear: (x, z) => Math.hypot(x, z) < 0.1,
});
assert.deepEqual(boxed, { x: 0, z: 0, metres: 0 }, "nowhere to go: slammed down where they stand");
const open = landing({ from: { x: 0, z: -1 }, at: { x: 0, z: 0 }, metres: 3.5, clear: () => true });
assert.ok(Math.abs(open.z - 3.5) < 1e-9 && Math.abs(open.x) < 1e-9, "on open ground, straight away");

// Falling damage scales with how far: 1d6 for every 3 metres, at least 1d6.
assert.equal(fallDice(1), "1d6");
assert.equal(fallDice(3), "1d6");
assert.equal(fallDice(6), "2d6");
assert.equal(fallDice(9), "3d6");

// Who throws, and how hard: Large or bigger, Strength 18 or more, no hold of its own.
const ogre = tossOf(SRD_CREATURES.ogre);
assert.deepEqual(ogre, { dc: 14, metres: 3.5 }, "8 + 2 + 4; 3.5 m");
assert.equal(tossOf(SRD_CREATURES.troll).dc, 15, "a troll's proficiency is +3 at CR 5");
assert.ok(tossOf(SRD_CREATURES.minotaur));
assert.equal(tossOf(SRD_CREATURES.roper), null, "a roper holds instead");
assert.equal(tossOf(SRD_CREATURES.wolf), null);
const hillGiant = tossOf({ size: "huge", str: 21, cr: 5 });
assert.ok(hillGiant.metres > ogre.metres, "a bigger, stronger one throws further");
assert.equal(hillGiant.dc, 16);

// What a creature does before its blow: throw (now and then), or its holding attack.
assert.equal(gripOf({ stats: SRD_CREATURES.ogre, rules }, always).move, "throw");
assert.equal(
  gripOf({ stats: SRD_CREATURES.ogre, rules }, () => 0.9),
  null,
  "mostly it just strikes",
);
assert.equal(gripOf({ stats: SRD_CREATURES.ogre, rules, force: "throw" }, () => 0.9).move, "throw");
assert.equal(gripOf({ stats: SRD_CREATURES.ogre, rules, size: "large" }, always), null, "too big to throw");
assert.equal(gripOf({ stats: SRD_CREATURES.ogre, rules, safe: true }, always), null, "not in a safe town");
assert.equal(gripOf({ stats: SRD_CREATURES.ogre, rules, held: true }, always), null);
assert.equal(gripOf({ stats: SRD_CREATURES.roper, rules }, always).hold.name, "Tendril");
assert.equal(gripOf({ stats: SRD_CREATURES.otyugh, rules, size: "large" }, always), null);
// And after its blows land.
const after = (kind, hits, blows = 1, use = rules) =>
  holdAfter({ stats: SRD_CREATURES[kind], kind, rules: use, hits, blows });
assert.equal(after("frog", 1).name, "Bite", "a frog's bite holds");
assert.equal(after("frog", 0), null);
assert.ok(after("shambling_mound", 2, 2).engulf, "both slams: engulfed");
assert.equal(after("shambling_mound", 1, 2), VINES, "one slam: vines round the legs");
assert.equal(after("awakened_shrub", 1), VINES);
assert.equal(after("wolf", 1), null);

// Nothing grapples or throws with fights off, or with the switches off.
for (const off of [{ fights: "off" }, { sheet: false }, { srdCreatures: false }, { creatureExtras: false }]) {
  const none = gripRules({ ...ON, ...off });
  assert.deepEqual(none, { holds: false, vines: false, throws: false }, JSON.stringify(off));
  assert.equal(gripOf({ stats: SRD_CREATURES.ogre, rules: none, force: "throw" }, always), null);
  assert.equal(gripOf({ stats: SRD_CREATURES.roper, rules: none }, always), null);
  assert.equal(after("frog", 1, 1, none), null);
  assert.equal(after("awakened_shrub", 1, 1, none), null);
}
const own = (key) => gripRules({ ...ON, [key]: false });
assert.equal(gripOf({ stats: SRD_CREATURES.ogre, rules: own("giantThrows") }, always), null);
assert.equal(gripOf({ stats: SRD_CREATURES.roper, rules: own("creatureHolds") }, always), null);
assert.equal(after("frog", 1, 1, own("creatureHolds")), null);
assert.equal(after("shambling_mound", 2, 2, own("creatureHolds")), VINES, "vines have a switch of their own");
assert.equal(after("awakened_shrub", 1, 1, own("vineHolds")), null);
assert.equal(after("frog", 1, 1, own("conditions")), null, "holds need conditions");
assert.ok(own("conditions").throws, "a throw doesn't");
assert.equal(gripRules(null).holds, false);

console.log("ok: holds and throws");
