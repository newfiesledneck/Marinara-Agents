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

// How someone acts toward the player, and who knows whom.
{
  const { stanceFromWords, knowingFromWords } = await import("../packages/wanderworld/src/keywords.js");
  assert.equal(stanceFromWords(["Tam", "Rude"]), "rude");
  assert.equal(stanceFromWords(["confronts"]), "aggressive", "an aggressive temperament is its own keyword");
  assert.equal(stanceFromWords(["attacks"]), "attacks");
  assert.equal(stanceFromWords(["aggressive", "shy"]), "", "temperament words aren't stances");
  assert.deepEqual(knowingFromWords(["known", "Knows You"]), { known: true, knowsYou: true });
  assert.deepEqual(knowingFromWords(["knows"]), { known: false, knowsYou: false });
  // What there is to say depends on who it is, and introductions come first.
  const { choicesFor, labelOf } = await import("../packages/wanderworld/src/dialogue.js");
  const stranger = choicesFor([], { mood: "stranger", known: false, theyKnow: false, you: "Zoey", seed: "c-1" });
  assert.deepEqual(
    stranger.slice(0, 2).map((choice) => choice.id),
    ["whoAreYou", "introduce"],
  );
  assert.equal(stranger[1].label, "I'm Zoey.");
  assert.equal(stranger.at(-1).id, "bye");
  assert.equal(stranger.length, 6, "a handful, and Goodbye");
  const close = choicesFor([], { mood: "close", known: true, theyKnow: true, you: "Zoey", seed: "c-1" }).map(
    (choice) => choice.id,
  );
  assert.ok(
    !close.includes("whoAreYou") && !close.includes("problem"),
    "not what a stranger or an enemy would be asked",
  );
  const cold = choicesFor([], { mood: "cold", known: true, theyKnow: true, you: "Zoey", seed: "c-2" }).map(
    (choice) => choice.id,
  );
  assert.ok(cold.includes("problem") || cold.includes("truce"));
  assert.notDeepEqual(
    choicesFor([], { mood: "neutral", known: true, theyKnow: true, seed: "c-1" }),
    choicesFor([], { mood: "neutral", known: true, theyKnow: true, seed: "c-9" }),
    "not the same handful for everyone",
  );
  assert.equal(labelOf("introduce", "Zoey"), "I'm Zoey.");
}

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

// How keywords are written: ww:<what>:<value>, read into the plain words the rest works on.
{
  const { readKeyword, readKeys, KEYWORD_GUIDE } = await import("../packages/wanderworld/src/keywords.js");
  const words = (key) => readKeyword(key)?.words;
  assert.equal(readKeyword("town"), null, "not Wanderworld's: an ordinary trigger word");
  assert.equal(readKeyword("wwii"), null);
  // Names of what an entry is about, and flags.
  assert.deepEqual(readKeyword("ww:tavern1"), { words: ["tavern1"], problem: "", id: true });
  assert.deepEqual(words("WW : Mira Saxton"), ["Mira Saxton"]);
  assert.deepEqual(words("ww:world"), ["world"]);
  assert.deepEqual(words("ww:walls"), ["walls"]);
  assert.deepEqual(words("ww:walls:no"), []);
  assert.deepEqual(words("ww:character"), ["character"]);
  assert.deepEqual(words("ww:character:Mira Saxton"), ["character", "name Mira Saxton"]);
  assert.deepEqual(words("ww:monster:Goblin"), ["monster", "name Goblin"]);
  // <what>:<value>, spaces and capitals as they come, colons inside a value kept.
  assert.deepEqual(words("ww : owned by : Mira"), ["owner Mira"]);
  assert.deepEqual(words("ww:owned by:Mira"), ["owner Mira"]);
  assert.deepEqual(words("ww:Lives In:home3"), ["lives in home3"]);
  assert.deepEqual(words("ww:work:10:15-18:45"), ["work 10:15-18:45"]);
  assert.deepEqual(words("ww:eat:12-13 at tavern1"), ["eat 12-13 at tavern1"]);
  assert.deepEqual(words("ww:closed:22:30-6"), ["closed 22:30-6"]);
  assert.deepEqual(words("ww:name:The Gilded Stag"), ["name The Gilded Stag"]);
  assert.deepEqual(words("ww:body:Woman"), ["woman"]);
  assert.deepEqual(words("ww:temperament:aggressive"), ["aggressive"]);
  assert.deepEqual(words("ww:manner:shy"), ["shy"]);
  assert.deepEqual(words("ww:acts:aggressive"), ["confronts"], "how they act isn't their temperament");
  assert.deepEqual(words("ww:acts:rude"), ["rude"]);
  assert.deepEqual(words("ww:settlement:city"), ["city"]);
  assert.deepEqual(words("ww:active:night"), ["night"]);
  assert.deepEqual(words("ww:drops:wolf pelt"), ["drops wolf pelt"]);
  // Relationships: to the player however they're called, or to someone by name.
  for (const you of ["you", "me", "I", "player", "persona"]) assert.deepEqual(words(`ww:enemy of:${you}`), ["enemy"]);
  assert.deepEqual(words("ww:sister of:Tam"), ["sister of Tam"]);
  assert.deepEqual(words("ww:friends with:Mira"), ["friends with Mira"]);
  // Who knows whom, said either way.
  for (const key of ["ww:i know:char", "ww:you know:them", "ww:I know:her", "ww:player knows:character"])
    assert.deepEqual(words(key), ["known"], key);
  for (const key of ["ww:knows:you", "ww:they know:me", "ww:char knows:player", "ww:she knows:you"])
    assert.deepEqual(words(key), ["knows you"], key);
  // What doesn't read says why, and an old one-word keyword says how it's written now.
  assert.match(readKeyword("ww:shy").problem, /ww:manner:shy/u);
  assert.match(readKeyword("ww:aggressive").problem, /ww:temperament:aggressive/u);
  assert.match(readKeyword("ww:man").problem, /ww:body:man/u);
  assert.match(readKeyword("ww:rude").problem, /ww:acts:rude/u);
  assert.match(readKeyword("ww:city").problem, /ww:settlement:city/u);
  assert.match(readKeyword("ww:lives in home3").problem, /colon before the value/u);
  assert.match(readKeyword("ww:body:tall").problem, /one of/u);
  assert.match(readKeyword("ww:dances with:Mira").problem, /isn't something Wanderworld sets/u);
  assert.match(readKeyword("ww:").problem, /nothing after/u);
  assert.deepEqual(readKeyword("ww:shy").words, [], "and it sets nothing");
  // An entry's keys, told apart.
  assert.deepEqual(readKeys(["town", "ww:tavern1", "ww:owned by:Mira", "ww:shy", "ale"]), {
    keys: ["tavern1", "owner Mira"],
    own: ["ww:tavern1", "ww:owned by:Mira", "ww:shy"],
    triggers: ["town", "ale"],
  });
  assert.deepEqual(readKeys("gods, ww : world").keys, ["world"]);
  // Everything the instructions list reads cleanly.
  for (const entry of KEYWORD_GUIDE) {
    for (const key of entry.write.replace(/\(.*?\)/gu, "").split(",")) {
      const written = key.trim();
      if (!written) continue;
      assert.equal(readKeyword(written)?.problem, "", `the guide's own example reads: ${written}`);
    }
  }
}

// The check: what Wanderworld understands, and what it doesn't, with why.
const unknown = unknownKeywords(
  [
    {
      id: "b",
      name: "Book",
      entries: [
        {
          id: "1",
          title: "Tam",
          own: [
            "ww:Tam",
            "ww:body:man",
            "ww:manner:shy",
            "ww:lives in:home3",
            "ww:lives at:home3",
            "ww:shy",
            "ww:tavern9",
          ],
        },
        { id: "2", title: "Goblin", own: ["ww:monster:Goblin", "ww:active:night", "ww:pack:3", "ww:Nobody"] },
      ],
    },
  ],
  world,
);
assert.deepEqual(
  unknown.map((item) => item.word),
  ["ww:lives at:home3", "ww:shy", "ww:Nobody"],
);
assert.match(unknown[1].why, /ww:manner:shy/u);
assert.equal(unknown[2].why, "nothing here is called that");

console.log("wanderworld keywords regression: OK");
