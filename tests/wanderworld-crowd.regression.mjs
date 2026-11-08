// Wanderworld's townsfolk, run without a browser over a simulated day: thirty of them go about town,
// sit on benches (and don't hop straight back up and down), go into houses, shops and the tavern, head
// home at night, and show up in the room of the building the player walks into, coming and going
// through its door. Name tags and shadows draw on a canvas, so a small stand-in canvas is supplied.
// Run: node tests/wanderworld-crowd.regression.mjs
import assert from "node:assert/strict";

const context = new Proxy(
  { measureText: (text) => ({ width: String(text).length * 14 }) },
  { get: (target, key) => target[key] ?? (() => ({ addColorStop() {} })), set: () => true },
);
globalThis.document = { createElement: () => ({ getContext: () => context, width: 0, height: 0 }) };
globalThis.fetch = async () => new Response("null", { status: 404 }); // nobody has a 3D model

const { createCrowd, MAX_PEOPLE } = await import("../packages/wanderworld/src/npcs.js");
const { createInterior } = await import("../packages/wanderworld/src/interiors.js");
const { createWorld } = await import("../packages/wanderworld/src/world.js");

assert.equal(MAX_PEOPLE, 30, "up to thirty characters live in town");
const world = createWorld(4242);
const crowd = createCrowd();
crowd.setWorld(world);
crowd.setCast(Array.from({ length: 40 }, (_, i) => ({ id: `c-${i}`, name: `Person ${i}` })));
assert.equal(crowd.size, 30, "a cast larger than thirty is cut to thirty");

const player = { x: 0, y: 0, z: 200 }; // far away, out of everyone's way
let time = 0;
const step = (seconds, hour, space = world) => {
  for (let elapsed = 0; elapsed < seconds; elapsed += 0.1) {
    time += 0.1;
    crowd.update(0.1, {
      player,
      space,
      playerSitting: false,
      hour,
      time,
      isVisible: () => false,
      onFootstep: () => {},
    });
    world.update(0.1);
  }
};

// A day in town: count who is out, who sits, and how often someone sits right after getting up.
const seen = { sitting: new Set(), indoors: new Set() };
const lastSat = new Map();
let quickResits = 0;
for (let minute = 0; minute < 20; minute++) {
  for (let i = 0; i < 6; i++) {
    step(10, 12);
    const out = new Map(crowd.present(world).map((person) => [person.id, person]));
    for (let n = 0; n < 30; n++) {
      const id = `c-${n}`;
      const person = out.get(id);
      if (!person) seen.indoors.add(id);
      else if (person.sitting) {
        if (!seen.sitting.has(id) || lastSat.get(id) === "up") {
          if (lastSat.get(id) === "up" && time - (lastSat.get(`${id}:at`) ?? 0) < 40) quickResits++;
        }
        seen.sitting.add(id);
        lastSat.set(id, "down");
      } else if (lastSat.get(id) === "down") {
        lastSat.set(id, "up");
        lastSat.set(`${id}:at`, time);
      }
    }
  }
}
assert.ok(seen.sitting.size >= 5, `people sit on benches (${seen.sitting.size} of 30 did)`);
assert.ok(seen.indoors.size >= 15, `people go indoors during the day (${seen.indoors.size} of 30 did)`);
assert.equal(quickResits, 0, "nobody sits straight back down after getting up");

// Night: everyone ends up indoors, and comes out again in the morning.
step(240, 23);
assert.equal(crowd.present(world).length, 0, "at night everyone is at home");
step(120, 8);
assert.ok(crowd.present(world).length >= 20, "in the morning they come back out");

// The player walks into a building where someone is: they're in its room, and leave through its door.
step(240, 23); // everyone home again
const homes = world.doors.filter((door) => door.kind === "home");
let shown = null;
for (const door of homes) {
  const room = createInterior(door, "crowd-test");
  crowd.showRoom(door, room);
  if (crowd.present(room).length) {
    shown = { door, room };
    break;
  }
  crowd.hideRoom();
  room.dispose();
}
assert.ok(shown, "someone is at home in one of the houses");
const residents = crowd.present(shown.room).map((person) => person.id);
for (const person of crowd.present(shown.room)) {
  assert.ok(!shown.room.blocked(person.position.x, person.position.z, 0.2), "they stand somewhere clear in the room");
}
step(30, 23, shown.room);
assert.ok(crowd.present(shown.room).length >= residents.length, "at night they stay in");
// Morning: they head out of the room's door and onto the street, and stay out a while.
const outdoors = () => residents.some((id) => crowd.present(world).some((person) => person.id === id));
let left = false;
for (let k = 0; k < 24 && !left; k++) {
  step(5, 8, shown.room);
  left = outdoors();
}
assert.ok(left, "in the morning they leave the room through the door, out to the street");
step(40, 9, shown.room);
assert.ok(outdoors(), "having come out, they stay out a while instead of going straight back in");
crowd.hideRoom();
shown.room.dispose();

console.log("wanderworld crowd regression: OK");
