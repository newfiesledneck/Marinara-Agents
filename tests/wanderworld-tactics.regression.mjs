// How creatures choose what to do in a fight (tactics.js). Run: node tests/wanderworld-tactics.regression.mjs
import assert from "node:assert/strict";
import {
  greaterCasts,
  mendSpell,
  pickSpell,
  roleOf,
  roleStats,
  standSpot,
} from "../packages/wanderworld/src/tactics.js";
import { spellIn, spellRule } from "../packages/wanderworld/src/combat.js";
import { SRD_CREATURES, SRD_SPELLS } from "../packages/wanderworld/src/srd.js";

// Each bandit has a role of its own, always the same for that one; a kind with one way to fight has that.
const bandit = SRD_CREATURES.bandit;
assert.equal(
  roleOf("bandit", "beast-7", bandit),
  roleOf("bandit", "beast-7", bandit),
  "the same bandit, the same role",
);
const roles = {};
for (let i = 0; i < 300; i++) {
  const role = roleOf("bandit", `beast-${i}`, bandit);
  roles[role] = (roles[role] ?? 0) + 1;
}
assert.ok(
  roles.melee > 90 && roles.ranged > 50 && roles.caster > 40,
  `bandits share the roles out (${JSON.stringify(roles)})`,
);
assert.equal(roleOf("wolf", "beast-1", SRD_CREATURES.wolf), "melee");
assert.equal(roleOf("wizard", "beast-1", SRD_CREATURES.wizard), "caster");
assert.equal(roleOf("bandit", "x", { ranged: null }), "melee", "a role it can't play is never given");

// What each role fights with.
assert.deepEqual(
  Object.keys(roleStats(bandit, "melee")).filter((key) => ["ranged", "spells"].includes(key)),
  [],
);
assert.equal(roleStats(bandit, "ranged").ranged.name, "Light Crossbow");
assert.equal(roleStats(bandit, "ranged").spells, undefined);
assert.deepEqual(
  roleStats(bandit, "caster").spells,
  bandit.caster.spells,
  "a bandit who casts has the acolyte's spells",
);
assert.equal(roleStats(bandit, "caster").ranged, undefined);
assert.deepEqual(roleStats(SRD_CREATURES.wizard, "caster").spells, SRD_CREATURES.wizard.spells);

// The spell for the moment.
const known = (...names) =>
  names.map((name) => {
    const found = SRD_SPELLS.find((spell) => spell.name === name);
    return { name, level: found.level, spell: spellIn({ about: spellRule(found) }) };
  });
const book = known("Fire Bolt", "Magic Missile", "Fireball", "Hold Person", "Cure Wounds");
const always = () => 0;
const never = () => 0.99;
assert.equal(pickSpell(book, { far: 10, clustered: 3, random: never }).name, "Fireball", "an area for a huddle");
assert.equal(pickSpell(book, { far: 10, clustered: 1, random: always }).name, "Hold Person", "a hold now and then");
assert.notEqual(
  pickSpell(book, { far: 10, afflicted: true, random: always }).name,
  "Hold Person",
  "not on one already held",
);
assert.equal(pickSpell(book, { far: 10, random: never }).name, "Fire Bolt", "a cantrip mostly");
assert.equal(
  pickSpell(book, { far: 10, clustered: 3, leveled: false, random: never }).name,
  "Fire Bolt",
  "greater spells spent",
);
assert.equal(pickSpell(book, { far: 60, random: never }), null, "nothing that reaches");
assert.equal(mendSpell(book).name, "Cure Wounds");
assert.equal(mendSpell(book, false), null, "a first-level mending needs a greater cast left");
assert.equal(mendSpell(known("Fire Bolt")), null);
assert.deepEqual([greaterCasts(0.125), greaterCasts(2), greaterCasts(6)], [1, 3, 7]);

// Where to stand: behind cover at a good distance, nearest first; else stay, unless crowded.
const spots = [
  { x: 1, z: 0, walk: 3, far: 4, cover: true }, // (too near)
  { x: 2, z: 0, walk: 6, far: 9, cover: true },
  { x: 3, z: 0, walk: 3, far: 8, cover: true },
  { x: 4, z: 0, walk: 3, far: 7, cover: false },
];
assert.equal(standSpot(spots, { range: 18 }).x, 3);
assert.equal(
  standSpot(
    spots.filter((spot) => !spot.cover),
    { range: 18 },
  ),
  null,
  "no cover: stay",
);
assert.equal(
  standSpot(
    spots.filter((spot) => !spot.cover),
    { range: 18, crowded: true },
  ).x,
  4,
  "crowded: a good distance",
);
assert.equal(standSpot(spots, { range: 6 }), null, "nothing within its reach");

console.log("ok: tactics");
