// Wanderworld's daily schedules (schedules.js) and townsfolk following them (npcs.js): entries by hour,
// across midnight; a usual day from home and work; a new entry cutting into what was there; and someone
// going in to work for their shift and coming back out when it ends.
// Run: node tests/wanderworld-schedules.regression.mjs
import assert from "node:assert/strict";

const context = new Proxy(
  { measureText: (text) => ({ width: String(text).length * 14 }) },
  { get: (target, key) => target[key] ?? (() => ({ addColorStop() {} })), set: () => true },
);
globalThis.document = { createElement: () => ({ getContext: () => context, width: 0, height: 0 }) };
globalThis.fetch = async () => new Response("null", { status: 404 });

const { checkEntry, entryAt, inRange, putEntry, usualDay } = await import("../packages/wanderworld/src/schedules.js");
const { createCrowd } = await import("../packages/wanderworld/src/npcs.js");
const { createWorld } = await import("../packages/wanderworld/src/world.js");

assert.ok(inRange(23, 21, 7) && inRange(3, 21, 7) && !inRange(12, 21, 7), "a night across midnight");
const day = usualDay("c-mira", { work: true, tavern: "building:4", square: "plaza" });
for (let hour = 0; hour < 24; hour += 0.5) assert.ok(entryAt(day, hour), `the usual day covers ${hour}:00`);
assert.equal(entryAt(day, 10).activity, "work");
assert.equal(entryAt(day, 12.5).place, "building:4", "lunch at the tavern");
assert.equal(entryAt(day, 2).activity, "home");
assert.equal(entryAt(usualDay("c-tam"), 10.5)?.activity !== "work", true, "no work without a job");
assert.equal(checkEntry({ from: 9, to: 9, activity: "work" }), null);
assert.equal(checkEntry({ from: 9, to: 10, activity: "dance" }), null);
const meet = putEntry(day, { from: 12, to: 13, activity: "visit", place: "fountain" });
assert.equal(entryAt(meet, 12.5).place, "fountain", "the new entry takes its hours");
assert.equal(entryAt(meet, 11).activity, "work", "what was around it stays");
const late = putEntry(day, { from: 23, to: 1, activity: "visit", place: "tavern" });
assert.equal(entryAt(late, 0.5).place, "tavern", "an entry across midnight cuts into the night");
assert.equal(entryAt(late, 3).activity, "home");

// Someone with a shift at a workshop goes in for it and comes out after.
const world = createWorld(4242);
const crowd = createCrowd();
crowd.setDressed(false);
crowd.setWorld(world);
crowd.setCast([{ id: "c-smith", name: "Smith" }]);
const workDoor = world.doors.find((door) => door.kind !== "home");
crowd.setHousing({ "c-smith": { home: null, work: workDoor.index } });
crowd.setSchedules({
  "c-smith": [
    { from: 0, to: 9, activity: "walk", door: null, point: null },
    { from: 9, to: 11, activity: "work", door: null, point: null },
    { from: 11, to: 24, activity: "walk", door: null, point: null },
  ],
});
const player = { x: 0, y: 0, z: 400 };
let time = 0;
const run = (seconds, hour) => {
  for (let elapsed = 0; elapsed < seconds; elapsed += 0.1) {
    time += 0.1;
    crowd.update(0.1, {
      player,
      space: world,
      playerSitting: false,
      hour,
      time,
      isVisible: () => false,
      onFootstep() {},
    });
    world.update(0.1);
  }
};
run(5, 8);
assert.equal(crowd.scheduledNow("c-smith", 10).activity, "work");
run(120, 10);
const atWork = crowd.snapshot().find((person) => person.id === "c-smith");
assert.equal(atWork.state, "inside", "in at work during the shift");
assert.equal(atWork.inDoor, workDoor.index, "at their workplace");
run(5, 11.5);
const after = crowd.snapshot().find((person) => person.id === "c-smith");
assert.notEqual(after.state, "inside", "out once the shift is over");
world.dispose();

console.log("wanderworld schedules regression: OK");
