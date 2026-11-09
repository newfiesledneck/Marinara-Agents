// Wanderworld's setting pack (pack.js): the things to use and what's said about them, places and people
// when no AI is answering, and the noticeboard's errands. A pack is words, so these check its shape:
// another setting's pack must pass the same.
import assert from "node:assert/strict";
import { arrivalLine, errandFor, PACK, pickLine, PROP_THINGS, thingLine } from "../packages/wanderworld/src/pack.js";
import { ACTIONS, sceneRequest } from "../packages/wanderworld/src/interactions.js";

// Every thing has a prompt, a title, a reach, and choices that each say something without AI.
for (const [kind, thing] of Object.entries(PACK.things)) {
  assert.ok(thing.prompt && thing.title && thing.reach > 0, `${kind} is a whole thing`);
  assert.ok(thing.choices.length >= 2, `${kind} has things to do`);
  for (const choice of thing.choices) {
    assert.ok(choice.id && choice.label && choice.verb, `${kind}/${choice.id} can be chosen and told to the AI`);
    assert.ok(choice.lines.length >= 2, `${kind}/${choice.id} has lines of its own`);
    for (const line of choice.lines) {
      assert.doesNotMatch(
        line.replace(/\{(place|time|who)\}/gu, ""),
        /[{}]/u,
        `${kind}/${choice.id}: only known words`,
      );
    }
  }
  assert.equal(new Set(thing.choices.map((choice) => choice.id)).size, thing.choices.length, `${kind}: ids differ`);
}
for (const kind of Object.values(PROP_THINGS)) assert.ok(PACK.things[kind], `a prop is a thing the pack has: ${kind}`);

// The pack's things are things to do like any other: a card's choice makes a scene request.
assert.deepEqual(
  ACTIONS.stall.map((action) => action.id),
  PACK.things.stall.choices.map((choice) => choice.id),
);
assert.ok(ACTIONS.fountain && ACTIONS.door, "what every world has is still there");
const request = sceneRequest({
  thing: { kind: "stall", name: "a market stall", chain: ["Ashford"] },
  action: "haggle",
  line: "",
  inside: [],
  party: [],
  persona: { id: "player", name: "Zoey" },
  hour: 9,
});
assert.equal(request.verb, "haggles over a price at the stall");

// Lines: the same for the same key, filled with where and when; nothing for what the pack doesn't have.
const words = { place: "Ashford", time: "morning", who: "Mira" };
assert.equal(thingLine("stall", "browse", "a", words), thingLine("stall", "browse", "a", words));
assert.doesNotMatch(thingLine("watchtower", "climb", "k", words), /\{/u, "the place is filled in");
assert.equal(thingLine("stall", "juggle", "a", words), "");
assert.equal(thingLine("spaceship", "board", "a", words), "");
assert.equal(pickLine([], "a"), "");
assert.equal(pickLine(["{who} is {doing}."], "k", { who: "Tam", doing: "at work" }), "Tam is at work.");
assert.ok(arrivalLine("forest", "seed:forest", words));
assert.equal(arrivalLine("street", "seed:street", words), "", "a street has nothing to say for itself");

// Errands: to someone, found where they usually are; the same until it's done, then another.
const people = [
  { id: "c-mira", name: "Mira", place: { id: "building:2", name: "the bakery" } },
  { id: "c-tam", name: "Tam", place: { id: "building:5", name: "Harrow's Forge" } },
];
const errand = errandFor("seed:0,0:0", people);
assert.deepEqual(errand, errandFor("seed:0,0:0", people));
const sent = people.find((person) => person.id === errand.person);
assert.equal(errand.place, sent.place.id);
assert.match(errand.text, new RegExp(sent.name, "u"));
assert.doesNotMatch(errand.text + errand.done, /[{}]/u);
assert.notEqual(
  new Set(Array.from({ length: 12 }, (_, done) => errandFor(`seed:0,0:${done}`, people).text)).size,
  1,
  "errands change as they're done",
);
assert.equal(errandFor("seed", []), null, "nobody to send the player to");

console.log("wanderworld pack regression: OK");
