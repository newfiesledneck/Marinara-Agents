// Wanderworld's social life (src/social.js): relationships move by time spent together, slowly; two
// short-tempered people sometimes have words; friendships long unvisited fade; a locked one never moves;
// and a record is kept of what happened. No model is called.
// Run: node tests/wanderworld-social.regression.mjs
import assert from "node:assert/strict";
import { attractionOf, checkRelationship, createRelationships } from "../packages/wanderworld/src/relationships.js";
import { createSocial, SOCIAL } from "../packages/wanderworld/src/social.js";

const names = { mira: "Mira", tam: "Tam", rook: "Rook", player: "Bram" };
const worldOf = (relations, more = {}) => ({
  relations,
  traits: () => ({ aggression: 50 }),
  name: (id) => names[id],
  random: () => 0.99,
  moving: true,
  logging: true,
  ...more,
});
/** Runs `days` days with `groups` together for `hours` of each. */
function live(social, world, days, hours, groups) {
  for (let d = 0; d < days; d++) {
    for (let hour = 0; hour < 24; hour++) social.step(hour, 1, hour >= 18 && hour < 18 + hours ? groups : [], world);
  }
}
const evening = [{ ids: ["mira", "tam"], where: "The Gilded Stag", what: "at the tavern" }];

// ── Slowly ───────────────────────────────────────────────────────────────────
{
  const relations = createRelationships([
    { from: "mira", to: "tam", kind: "friend", level: 40 },
    { from: "tam", to: "mira", kind: "friend", level: 40 },
  ]);
  const social = createSocial();
  const world = worldOf(relations);
  live(social, world, 1, 6, evening);
  assert.equal(relations.get("mira", "tam").level, 41, "an evening together is one step");
  live(social, world, 1, 12, evening);
  assert.ok(relations.get("mira", "tam").level <= 41 + SOCIAL.STEPS_A_DAY, "a whole day together is only a couple");
  const before = relations.get("mira", "tam").level;
  live(social, world, 7, 6, evening);
  const week = relations.get("mira", "tam").level - before;
  assert.ok(week >= 5 && week <= 14, `a week of evenings is a few steps, not a tier (${week})`);
  assert.equal(relations.get("tam", "mira").level, relations.get("mira", "tam").level, "each way round moves");
  // The record: the occasion, and growing closer when a tier is crossed.
  assert.ok(social.log.some((line) => /Mira and Tam spent time together at the tavern/u.test(line.text)));
  assert.ok(social.log.every((line) => Number.isInteger(line.day) && line.who.length >= 2));
  live(social, world, 12, 6, evening);
  assert.ok(
    social.log.some((line) => /have grown closer \(good friend\)/u.test(line.text)),
    "a tier crossed is noted",
  );
  // Kept with the world and picked up again.
  const again = createSocial(JSON.parse(JSON.stringify(social.state)));
  assert.equal(again.day, social.day);
  assert.equal(again.log.length, social.log.length);
}

// ── Locks, and what's set by hand ────────────────────────────────────────────
{
  const relations = createRelationships([
    { from: "mira", to: "tam", kind: "friend", level: 40, locked: true },
    { from: "tam", to: "mira", kind: "friend", level: 40 },
  ]);
  const social = createSocial();
  live(social, worldOf(relations), 10, 6, evening);
  assert.equal(relations.get("mira", "tam").level, 40, "a locked one never moves");
  assert.ok(relations.get("tam", "mira").level > 40, "the other way round, unlocked, does");
  assert.equal(relations.get("mira", "tam").locked, true, "and stays locked");
  // Set by hand, it moves on from there.
  relations.set("tam", "mira", { level: 70 });
  live(social, worldOf(relations), 3, 6, evening);
  assert.ok(relations.get("tam", "mira").level > 70 && relations.get("tam", "mira").level <= 76);
}

// ── Having words, and what doesn't mend ──────────────────────────────────────
{
  const relations = createRelationships([
    { from: "mira", to: "tam", kind: "friend", level: 40 },
    { from: "tam", to: "mira", kind: "friend", level: 40 },
    { from: "mira", to: "rook", kind: "enemy", level: 60 },
  ]);
  const hot = worldOf(relations, { traits: () => ({ aggression: 90 }), random: () => 0.01 });
  const social = createSocial();
  live(social, hot, 1, 6, evening);
  assert.equal(relations.get("mira", "tam").level, 38, "two short-tempered people have words");
  assert.ok(social.log.some((line) => /had words/u.test(line.text)));
  live(social, worldOf(relations), 5, 6, [{ ids: ["mira", "rook"] }]);
  assert.equal(relations.get("mira", "rook").level, 60, "enemies don't mend by sharing a room");
  assert.equal(relations.get("rook", "mira").kind, "acquaintance", "someone with nothing set starts as a neighbour");
}

// ── The player ───────────────────────────────────────────────────────────────
{
  const relations = createRelationships([{ from: "mira", to: "player", kind: "friend", level: 30 }]);
  const social = createSocial();
  live(social, worldOf(relations), 4, 6, [{ ids: ["player", "mira", "tam"], what: "on the road" }]);
  assert.ok(relations.get("mira", "player").level > 30, "travelling with someone who knows you warms them");
  assert.equal(relations.get("tam", "player"), null, "nobody becomes yours by standing near you");
  assert.equal(relations.get("player", "tam"), null);
}

// ── Drifting apart ───────────────────────────────────────────────────────────
{
  const relations = createRelationships([
    { from: "mira", to: "tam", kind: "friend", level: 60 },
    { from: "tam", to: "mira", kind: "family", level: 60, role: "sister" },
  ]);
  const social = createSocial();
  const world = worldOf(relations);
  live(social, world, 1, 6, evening);
  const met = relations.get("mira", "tam").level;
  live(social, world, SOCIAL.FADE_AFTER * 3, 0, evening);
  const faded = met - relations.get("mira", "tam").level;
  assert.ok(faded >= 2 && faded <= 3, `friends who never meet drift a step now and then (${faded})`);
  assert.equal(relations.get("tam", "mira").level, 61, "family doesn't fade");
}

// ── Switched off ─────────────────────────────────────────────────────────────
{
  const relations = createRelationships([{ from: "mira", to: "tam", kind: "friend", level: 40 }]);
  const social = createSocial();
  live(social, worldOf(relations, { moving: false }), 5, 6, evening);
  assert.equal(relations.get("mira", "tam").level, 40, "with moving off, nothing moves");
  assert.ok(social.log.length > 0, "but the record is still kept");
  const quiet = createSocial();
  live(quiet, worldOf(relations, { logging: false }), 5, 6, evening);
  assert.equal(quiet.log.length, 0, "and with the record off, none is kept");
  assert.ok(relations.get("mira", "tam").level > 40);
}

// ── Attraction, and what a record keeps ──────────────────────────────────────
{
  const record = checkRelationship({
    from: "mira",
    to: "player",
    kind: "friend",
    level: 50,
    attraction: 130,
    locked: 1,
  });
  assert.deepEqual([record.attraction, record.locked, record.attractionLocked], [100, false, false]);
  assert.equal(
    checkRelationship({ from: "a", to: "b", kind: "friend" }).attraction,
    null,
    "unset till someone sets it",
  );
  const felt = attractionOf("mira", "player", null);
  assert.ok(
    felt >= 15 && felt <= 85 && felt === attractionOf("mira", "player", null),
    "everyone has a view, always the same",
  );
  assert.notEqual(attractionOf("mira", "player", null), attractionOf("tam", "player", null));
  assert.equal(attractionOf("mira", "player", { attraction: 5 }), 5, "what's set is what it is");
  const relations = createRelationships([{ from: "mira", to: "player", kind: "friend", level: 50, attraction: 65 }]);
  assert.match(relations.describe("mira", "player", names), /finds Bram attractive/u);
  assert.doesNotMatch(
    createRelationships([{ from: "mira", to: "player", kind: "friend", level: 50 }]).describe("mira", "player", names),
    /attract/u,
    "an unset one isn't told to the model",
  );
}

console.log("wanderworld social regression: OK");
