// Wanderworld's lorebook keywords beyond places and relationships (keywords.js): the world's shape, a
// place's hours and owner, temperament and voice, factions, what a creature is like, and the check for
// keywords it doesn't understand. Keywords arrive here without their "ww:" prefix.
import assert from "node:assert/strict";
import {
  closedFromWords,
  creatureFromWords,
  structureFromKeywords,
  traitsFromWords,
  unknownKeywords,
  voiceFromWords,
  worldFromLore,
  worldFromWords,
} from "../packages/wanderworld/src/keywords.js";

// The world's shape, from the entry keyed "world" only.
assert.deepEqual(worldFromWords(["world", "city", "hamlet", "walls", "size Large", "season autumn"]), {
  settlement: "city",
  walls: true,
  size: "large",
  season: "fall",
});
assert.deepEqual(worldFromWords(["size enormous", "season monsoon"]), {}, "only sizes and seasons there are");
assert.deepEqual(
  worldFromLore([
    {
      id: "b",
      entries: [
        { id: "1", title: "A city", keys: ["town1", "city"] }, // that town's lore, not the world's shape
        { id: "2", title: "World", keys: ["world", "village", "season winter"] },
      ],
    },
  ]),
  { settlement: "village", season: "winter" },
);

// People: temperament, manner and voice.
assert.deepEqual(traitsFromWords(["shy", "Grumpy", "tall"]), { sociability: 15, aggression: 65 });
assert.equal(voiceFromWords(["voice Gruff"]), "gruff");
assert.equal(voiceFromWords(["voice operatic", "gruff"]), "", "only the voices there are, and only as 'voice …'");

// Places: hours.
assert.deepEqual(closedFromWords(["tavern1", "closed 22-6"]), { from: 22, to: 6 });
assert.deepEqual(closedFromWords(["closed 0:30 - 7:15"]), { from: 0.5, to: 7.25 });
assert.equal(closedFromWords(["closed on Sundays"]), null);

// Creatures.
assert.deepEqual(
  creatureFromWords([
    "monster",
    "found in forest1",
    "found in cave1",
    "night",
    "pack 4",
    "danger 22",
    "drops wolf pelt",
    "drop gold",
  ]),
  {
    found: ["forest1", "cave1"],
    when: "night",
    pack: 4,
    danger: 10,
    drops: ["wolf pelt", "gold"],
  },
);
assert.deepEqual(creatureFromWords(["creature"]), { found: [], when: "any", pack: 1, danger: 1, drops: [] });

// Owners by the place's entry, and factions with their members.
const zones = { byId: new Map([["building:1", { id: "building:1", kind: "building", buildingKind: "tavern" }]]) };
zones.zones = [...zones.byId.values()];
const world = { zones, names: {}, groups: [], name: "", characters: [{ id: "c-tam", name: "Tam" }] };
const structure = structureFromKeywords(
  [
    {
      id: "b",
      entries: [
        { id: "t", title: "The Stag", keys: ["tavern1", "owner Mira", "closed 23-7"] },
        { id: "o", title: "Owned", keys: ["owner of tavern1"] }, // the other way round: not an owner's name
        { id: "g", title: "Guild notes", keys: ["faction Thieves Guild"] },
        { id: "m", title: "File", keys: ["character", "name Mira Little", "member of Thieves Guild"] },
        { id: "n", title: "Tam's file", keys: ["Tam", "member of thieves guild"] },
      ],
    },
    { id: "cards", entries: [{ id: "c-x", title: "Fen", keys: ["member of Thieves Guild"], byTitle: true }] },
  ],
  world,
);
assert.deepEqual(structure.hours, { "building:1": { from: 23, to: 7 } });
assert.deepEqual(structure.owners, [{ place: "building:1", name: "Mira" }]);
assert.equal(structure.factions.length, 1, "one guild, however it's capitalised");
assert.deepEqual(
  [structure.factions[0].name, structure.factions[0].entryId, structure.factions[0].members],
  ["Thieves Guild", "g", ["Mira Little", "character:c-tam", "Fen"]],
);

// The check: what Wanderworld understands, and what it doesn't.
const unknown = unknownKeywords(
  [
    {
      id: "b",
      name: "Book",
      entries: [
        {
          id: "1",
          title: "Tam",
          keys: [
            "Tam",
            "man",
            "shy",
            "voice gruff",
            "lives in home3",
            "work 10:15-18:45",
            "sister of Mira",
            "enemy",
            "member of Guild",
            "lives at home3",
            "voice operatic",
            "tavern9",
          ],
        },
        {
          id: "2",
          title: "Goblin",
          keys: [
            "monster",
            "name Goblin",
            "night",
            "pack 3",
            "danger 2",
            "drops gold",
            "found in forest1",
            "pack many",
          ],
        },
        {
          id: "3",
          title: "World",
          keys: ["world", "city", "walls", "size large", "season winter", "smithy3", "Nobody"],
        },
      ],
    },
  ],
  world,
).map((item) => item.word);
assert.deepEqual(unknown, ["lives at home3", "voice operatic", "pack many", "Nobody"]);

console.log("wanderworld keywords regression: OK");
