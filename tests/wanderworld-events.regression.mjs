// Wanderworld's market days and festivals (src/events.js): which days they fall on, their hours, who goes,
// and where each stands. Plain rules from the world's day count: no model is called.
// Run: node tests/wanderworld-events.regression.mjs
import assert from "node:assert/strict";
import { eventOn, eventOpen, EVENTS, goesTo, standAt } from "../packages/wanderworld/src/events.js";
import { entryAt } from "../packages/wanderworld/src/schedules.js";

// ── Which days ───────────────────────────────────────────────────────────────
const days = Array.from({ length: 56 }, (_, day) => eventOn(day)?.id ?? null);
assert.equal(days.filter((id) => id === "market").length, 8, "a market day every week");
assert.equal(days.filter((id) => id === "festival").length, 2, "a festival every four");
assert.ok(days.filter((id) => id === null).length >= 40, "most days are like any other");
assert.equal(eventOn(0), null, "a new world's first day is an ordinary one");
assert.equal(eventOn(5).id, "market");
assert.equal(eventOn(5.9).id, "market", "any hour of that day");
assert.equal(eventOn(13).id, "festival");
assert.equal(eventOn(-3), null);
assert.equal(eventOn("soon"), null);
// A festival and a market never want the same day unless the festival is listed first (it wins).
for (let day = 0; day < 400; day++) {
  const both = EVENTS.filter((event) => day % event.every === event.on);
  if (both.length > 1) assert.equal(eventOn(day).id, both[0].id);
}

// ── Their hours, and the words ───────────────────────────────────────────────
for (const event of EVENTS) {
  assert.ok(event.from < event.to && event.to <= 24, `${event.id} is over by midnight`);
  assert.equal(eventOpen(event, event.from), true);
  assert.equal(eventOpen(event, event.to), false);
  assert.equal(eventOpen(event, event.from - 0.1), false);
  assert.ok(event.today.includes("{plaza}") && event.begins.includes("{plaza}"), "its lines name the square");
  // A schedule made from it finds people there for its hours.
  const entry = { from: event.from, to: event.to, activity: "visit" };
  assert.equal(entryAt([entry], (event.from + event.to) / 2)?.activity, "visit");
}
assert.equal(eventOpen(null, 12), false);

// ── Who goes, and where they stand ───────────────────────────────────────────
{
  const market = EVENTS.find((event) => event.id === "market");
  const ids = Array.from({ length: 200 }, (_, i) => `person-${i}`);
  const going = ids.filter((id) => goesTo(market, id, 5));
  assert.ok(
    going.length > 200 * (market.share - 0.15) && going.length < 200 * (market.share + 0.15),
    `about its share of the town goes (${going.length} of 200)`,
  );
  assert.deepEqual(
    ids.filter((id) => goesTo(market, id, 5)),
    going,
    "the same people whenever it's asked",
  );
  assert.notDeepEqual(
    ids.filter((id) => goesTo(market, id, 12)),
    going,
    "and not the same ones next week",
  );
  const centre = { x: 10, z: -4 };
  const spots = ids.map((id) => standAt(centre, id));
  for (const spot of spots) {
    const far = Math.hypot(spot.x - centre.x, spot.z - centre.z);
    assert.ok(far >= 2 - 1e-9 && far <= 7 + 1e-9, "in the square, not on its middle");
  }
  assert.deepEqual(standAt(centre, "person-3"), spots[3], "each has their own spot");
  assert.ok(new Set(spots.map((spot) => `${spot.x.toFixed(1)},${spot.z.toFixed(1)}`)).size > 120, "spread about");
}

console.log("wanderworld events regression: OK");
