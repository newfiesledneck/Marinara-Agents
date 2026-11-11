// Wanderworld's household rules (src/household.js): which houses stand empty, what moving house does to
// who lives where (some come along, the rest stay put), where someone asked to leave goes, and how long a
// visit lasts. Plain rules: no model is called.
// Run: node tests/wanderworld-household.regression.mjs
import assert from "node:assert/strict";
import {
  homesOf,
  homeToLeaveFor,
  housingAfterMove,
  vacantHomes,
  VISIT_HOURS,
  visitFrom,
  visitOver,
} from "../packages/wanderworld/src/household.js";
import { entryAt } from "../packages/wanderworld/src/schedules.js";

const building = (id, buildingKind, door) => ({ id, kind: "building", buildingKind, door });
const zones = [
  building("building:0", "home", 0),
  building("building:1", "home", 1),
  building("building:2", "tavern", 2),
  building("building:3", "cottage", 3),
  building("building:4", "farm", 4),
  { id: "plaza", kind: "plaza" },
  building("building:5", "home", null), // (no door: nobody can live there)
];
const people = [
  { id: "mira", home: 0 },
  { id: "tam", home: 0 },
  { id: "rook", home: 3 },
  { id: "hank", home: null },
];

// ── Homes, and the empty ones ────────────────────────────────────────────────
assert.deepEqual(
  homesOf(zones).map((zone) => zone.id),
  ["building:0", "building:1", "building:3", "building:4"],
  "houses, cottages and farms with a door; not the tavern",
);
assert.deepEqual(
  vacantHomes(zones, people).map((zone) => zone.id),
  ["building:1", "building:4"],
);
assert.deepEqual(
  vacantHomes(zones, people, "building:1").map((zone) => zone.id),
  ["building:4"],
  "your own home isn't one to move to",
);
assert.deepEqual(vacantHomes([], people), []);

// ── Moving house ─────────────────────────────────────────────────────────────
{
  const housing = {
    player: { home: "building:0", work: "building:2", owner: true },
    mira: { home: null, work: "building:2", owner: false },
  };
  const next = housingAfterMove(housing, {
    who: "player",
    from: "building:0",
    to: "building:1",
    mates: ["mira", "tam"],
    bring: ["mira"],
  });
  assert.deepEqual(next.player, { home: "building:1", work: "building:2", owner: true }, "only the home changes");
  assert.deepEqual(next.mira, { home: "building:1", work: "building:2", owner: false }, "Mira comes too");
  assert.deepEqual(next.tam, { home: "building:0", work: null, owner: false }, "Tam stays, set down at the old house");
  assert.equal(housing.player.home, "building:0", "the old record isn't changed in place");
  // A first home: nobody to bring.
  assert.deepEqual(housingAfterMove({}, { who: "player", from: null, to: "building:4" }), {
    player: { home: "building:4", work: null, owner: false },
  });
  // Alone: everyone else stays.
  const alone = housingAfterMove(housing, { who: "player", from: "building:0", to: "building:1", mates: ["mira"] });
  assert.equal(alone.mira.home, "building:0");
}

// ── Asked to leave ───────────────────────────────────────────────────────────
assert.equal(homeToLeaveFor(zones, people, "building:0").id, "building:1", "an empty house first");
assert.equal(
  homeToLeaveFor(zones.slice(0, 4), [...people, { id: "odo", home: 1 }, { id: "sera", home: 1 }], "building:0").id,
  "building:3",
  "or else the least crowded",
);
assert.equal(homeToLeaveFor([zones[0]], people, "building:0"), null, "nowhere else: nowhere to go");

// ── A visit ──────────────────────────────────────────────────────────────────
{
  const visit = visitFrom(14.1, 2);
  assert.deepEqual([visit.from, visit.to], [14, 14 + VISIT_HOURS], "on the schedule's quarter hours");
  assert.equal(entryAt([{ ...visit, activity: "visit" }], 15)?.activity, "visit", "a schedule finds them there");
  assert.equal(visitOver(visit, 15, 2), false);
  assert.equal(visitOver(visit, 14.1 + VISIT_HOURS + 0.01, 2), true, "over when its hours are up");
  assert.equal(visitOver(visit, 9, 3), true, "and the next day");
  assert.equal(visitOver(visit, 8, 2), true, "and if the clock is set back to before it began");
  // Late at night it runs past midnight, and the schedule still finds it.
  const late = visitFrom(23, 0);
  assert.equal(late.to, (23 + VISIT_HOURS) % 24);
  assert.equal(entryAt([{ ...late, activity: "visit" }], 0.5)?.activity, "visit");
  assert.equal(visitOver(late, 0.5, 1), false, "still on after midnight");
  assert.equal(visitOver(late, 3, 1), true);
}

console.log("wanderworld household regression: OK");
