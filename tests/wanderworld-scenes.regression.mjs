// Wanderworld scene requests: using a door, a cave or the fountain makes a request for the AI part to play
// out, with the player's own line; it reads back as words and survives a save. And the placeholder
// conversations (dialogue.js): whole exchanges between townsfolk, and the player's choices.
import assert from "node:assert/strict";
import {
  ACTIONS,
  checkScene,
  describeScene,
  OWN_LINE,
  sceneRequest,
} from "../packages/wanderworld/src/interactions.js";

const base = {
  thing: { kind: "door", name: "the Prancing Pony", chain: ["Briarwood"] },
  inside: [
    { id: "c-2", name: "Tam" },
    { id: "c-3", name: "Rook" },
  ],
  party: [{ id: "c-1", name: "Mira" }],
  persona: { id: "player", name: "Zoey" },
  hour: 19,
};

const enter = sceneRequest({ ...base, action: "enter", line: "  I'll take the stew.  " });
assert.equal(enter.action, "enter");
assert.equal(enter.line, "I'll take the stew.", "the line is tidied");
assert.equal(
  describeScene(enter),
  `At the Prancing Pony, in Briarwood, Zoey goes in, with Mira. There: Tam and Rook. It's evening. Zoey: "I'll take the stew."`,
);

assert.equal(sceneRequest({ ...base, action: "fly" }), null, "an action the thing doesn't have is refused");
assert.equal(sceneRequest({ ...base, action: OWN_LINE, line: "   " }), null, "an own line needs words");
const own = sceneRequest({ ...base, action: OWN_LINE, line: "I peek through the window." });
assert.ok(describeScene(own).startsWith("Zoey is at the Prancing Pony"), "an own line alone sets the scene too");

const cave = sceneRequest({
  ...base,
  thing: { kind: "cave", name: "the Hollow" },
  inside: [],
  party: [],
  action: "enter",
  hour: 2,
});
assert.ok(describeScene(cave).includes("Nobody seems to be there. It's night."));

for (const [kind, actions] of Object.entries(ACTIONS)) {
  for (const action of actions) {
    assert.ok(sceneRequest({ ...base, thing: { kind, name: "here" }, action: action.id }), `${kind}: ${action.id}`);
  }
}

const saved = JSON.parse(JSON.stringify(enter));
assert.deepEqual(checkScene(saved), saved, "a saved scene reads back the same");
assert.equal(checkScene({ action: "enter" }), null);

// ── Placeholder conversations ──
const { choicesFor, EXCHANGES, fill, lineFor, moodOf, pickExchange } =
  await import("../packages/wanderworld/src/dialogue.js");
assert.equal(moodOf({ kind: null, warmth: 0 }), "stranger");
assert.equal(moodOf({ kind: "enemy", warmth: -0.9 }), "cold");
assert.equal(moodOf({ kind: "friend", warmth: 0.8 }), "close");
assert.equal(moodOf({ kind: "family", warmth: 0.8 }), "family");
for (const [mood, exchanges] of Object.entries(EXCHANGES)) {
  for (const lines of exchanges)
    assert.ok(lines.length >= 2 && lines.length % 2 === 0, `${mood}: each exchange ends on a reply`);
}
assert.ok(pickExchange("stranger", () => 0).length, "strangers make small talk");
assert.equal(fill("{greeting}, {B}.", { greeting: "Morning", B: "Jake" }), "Morning, Jake.");
const words = {
  name: "Hank",
  you: "Zoey",
  town: "Briarwood",
  tavern: "The Pony",
  wild: "Elmwood",
  street: "Mill Lane",
  greeting: "Evening",
};
assert.ok(!/[{}]/u.test(lineFor("eat", "warm", words, () => 0)), "every word in a line is filled");
assert.ok(lineFor("greet", "warm", words, () => 0).includes("Zoey"), "a friend greets you by name");
const first = choicesFor();
assert.equal(first.at(-1).id, "bye", "there's always a way to say goodbye");
assert.ok(!choicesFor(["news"]).some((choice) => choice.id === "news"), "asked topics drop off");

// Regions: travelling makes a travel request, the map of regions steps by side, names stay put, and a
// save keeps the regions and the home region's setup while away (dropping anything malformed).
{
  const { regionName, regionNext, HOME_REGION } = await import("../packages/wanderworld/src/zones.js");
  const { checkWorld } = await import("../packages/wanderworld/src/saves.js");
  assert.equal(regionNext(HOME_REGION, "east"), "1,0");
  assert.equal(regionNext("1,0", "north"), "1,-1");
  assert.equal(regionName("seed-a", "1,0"), regionName("seed-a", "1,0"), "a region keeps its name");
  const trip = sceneRequest({
    thing: { kind: "travel", name: "the road to Highmoor", chain: ["the Greenvale"] },
    action: "go",
    party: [{ id: "c-1", name: "Mira" }],
    persona: { id: "player", name: "Zoey" },
    hour: 8,
  });
  assert.match(describeScene(trip), /Zoey sets off along the road, with Mira/u, "a travel request reads as words");
  const save = checkWorld({
    id: "w1",
    seed: "seed-a",
    region: "1,0",
    regions: {
      "1,0": { name: "Highmoor", number: 2, seed: "seed-a|1,0", landscape: { hills: "flat" }, lore: { town: [] } },
      "0,0": { seed: "x", landscape: {} },
      nonsense: { seed: "y", landscape: {} },
      "2,0": { name: "No land", seed: "z" },
    },
    homeSetup: { names: { town: "Briarwood" }, housing: { "c-1": { home: "building:3" } } },
  });
  assert.equal(save.region, "1,0", "away in region 1,0");
  assert.deepEqual(Object.keys(save.regions), ["1,0"], "only well-formed other regions are kept");
  assert.equal(save.homeSetup.names.town, "Briarwood", "home's names wait while away");
  assert.equal(save.homeSetup.housing["c-1"].home, "building:3", "and its homes");
  assert.equal(checkWorld({ id: "w2", seed: "s", region: "far away" }).region, HOME_REGION, "a bad region is home");
}

console.log("wanderworld scenes regression: OK");
