// Wanderworld scene requests: using a door, a cave or the fountain makes a request for the AI part to play
// out, with the player's own line; it reads back as words and survives a save.
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

console.log("wanderworld scenes regression: OK");
