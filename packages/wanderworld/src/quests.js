// Quests (docs/QUESTS.md): plain data the code checks, not prose the model judges. A quest is a list of
// stages, and each stage has one goal of a fixed kind, a verb, naming what it needs by id: a person, a
// place, a region, an item, a kind of creature and how many. The words are the game's own or the AI's;
// whether a stage is done is always decided here, from what happens in the world.
//
// Everything here is plain data in and out, so the regression suite can play every quest to its end in a
// pretend world. main.js gathers the facts of the world as it is now (`world` below) and hands in what
// happens (`questEvent`); questplay.js does the rest of the glue: offers, rewards, spawns and captives.
//
// THE WORLD, as these functions take it (main.js / questplay.js `questWorld`):
//   { seed, region, regionName, now (hours since the world began), level,
//     people: [{ id, name, place, placeName, x, z, faction }]  // who can be found here, and where
//     cast: [ids],                                             // everyone in the world, anywhere
//     places: [{ id, name, kind, x, z }],                      // named places here, with a spot
//     wilds: [{ id, name, x, z }],                             // country places here, for hunts
//     creatures: [{ kind, name, cr }],                         // hostile kinds that can be met
//     gatherables: [{ name, how }], items: bool,               // what can be gathered; whether there's an inventory
//     caves: [{ id, name, x, z }],                             // cave mouths here (the deep places' way in)
//     ahead: [{ side, key, name, kind, faction }],             // regions a quest can send you to
//     fights, deep, travel, failures, timeLimits: bool }      // what the settings allow
import { hashString, rng } from "./world.js";

export const QUEST = {
  KEPT: 40, // quests kept in a save; finished ones past it go, oldest first
  STAGES: 6, // the most stages on a quest's main line (branches beside it)
  PARTS: 8, // how many recent quests' parts are remembered, so the next one differs
  NEAR: 40, // metres from a hunt's spot that a creature beaten counts
  AT: 7, // metres from a place's spot that counts as being there
  HURRY: 36, // hours a stage with a time limit allows
};
export const VERBS = ["talk", "go", "bring", "gather", "defeat", "deep", "rescue", "region", "choose"];
export const STATES = ["offered", "active", "done", "failed", "given up"];
export const ARCHETYPES = ["hunt", "supply", "word", "investigate", "delve", "rescue", "scout"];
/** How often work is offered: the hours between quests on the board, and how likely someone asked has some. */
export const OFFERS = {
  rarely: { gap: 12, yes: 0.3 },
  sometimes: { gap: 4, yes: 0.6 },
  often: { gap: 1, yes: 0.9 },
};

/** What each of Settings → Quests does, what it costs and what it overrides (hud.js shows them under each). */
export const QUEST_EXPLAIN = {
  quests:
    "On: there's work to be had. The noticeboard posts a quest now and then, people you ask \"Any work going?\" may have some, and your lore's ww:quest entries are offered by their giver. Journal → Quests keeps them. Errands from the noticeboard are one-stage quests either way. Off: no new quests are offered and none move on; the ones you have wait in the Journal.",
  questsBuiltIn:
    "On: the game makes quests of its own from what this world has, with no AI: hunts near a place out in the country, things to find and bring, someone to ask and somewhere to look, a theft to get to the bottom of, a cave to go down into, a captive to free, a region to scout. Off: only the AI's quests and your lore's are offered.",
  questsAi: (s) =>
    `On: one AI call writes each quest, all its stages at once, from the people, places, creatures and items here, so it fits your world and your lore. Every name it uses is checked before the quest is offered; one that won't work is turned down and the game's own is offered instead. Calls are made only when a quest is wanted (the noticeboard is read, or you ask for work), at most ${s.questMax} open at a time. ${s.questsBuiltIn ? "When a call fails or is slow, a built-in quest stands in." : "With built-in quests off, a failed call means no quest."} Off: no calls.`,
  questAdapt:
    "On (with the AI's quests on): when something goes wrong that a quest has no plan for, one AI call writes a new stage or ends it with a reason. Off, or if the call fails: the quest ends as failed and the Journal says what happened.",
  questOffers: (s) => {
    const how = OFFERS[s.questOffers] ?? OFFERS.sometimes;
    return `How often new work turns up. Now: a new note on the noticeboard ${how.gap === 1 ? "an hour" : `${how.gap} hours`} (in the game) after you take one, and about ${Math.round(how.yes * 100)}% of people you ask have something. Asking the same person again the same day gets the same answer.`;
  },
  questMax:
    "How many quests (and an errand) can be open at once. With that many, nobody offers more until one is done.",
  questFailures:
    "On: a quest can take a turn when something goes wrong: the witness is gone, so someone else saw it too; you named the wrong thief, so you make it right with them; the one who asked is gone, so you tell their kin. Off: when a stage can't be done the quest just ends as failed.",
  questTimeLimits:
    "On: now and then a quest can't wait, and its first stage has a day and a half (game time) to be done. Off: no time limits, ever.",
  questLine:
    "The tracked quest's title and what to do now, at the top of the screen. Tap it to open Journal → Quests. Kept for each device.",
};

const isRecord = (value) => !!value && typeof value === "object" && !Array.isArray(value);
const str = (value, max = 200) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const num = (value, fallback = 0) => (Number.isFinite(value) ? value : fallback);
const pick = (random, list) => list[Math.floor(random() * list.length)];
const cap = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : text);
const words = (kind) => String(kind ?? "").replace(/_/gu, " ");
/** A creature's name for more than one of it ("wolves", "lizardfolk"). */
export function plural(name) {
  const word = words(name);
  if (/folk$|^gelatinous/u.test(word)) return word.endsWith("cube") ? `${word}s` : word;
  if (/wolf$/u.test(word)) return word.replace(/wolf$/u, "wolves");
  if (/(s|x|ch|sh)$/u.test(word)) return `${word}es`;
  return `${word}s`;
}
const many = (count, name) => (count === 1 ? `a ${words(name)}` : `${count} ${plural(name)}`);

// ── The words of the built-in quests ───────────────────────────────────────────

/** Why someone wants it done, by archetype: a few each, so two quests in a row don't read the same. */
const MOTIVES = {
  hunt: [
    "They've been at the sheep.",
    "The carters won't take the road past there any more.",
    "A child was chased all the way home.",
    "Nobody's dared gather wood there in a week.",
  ],
  supply: [
    "The cart didn't come, and we're short.",
    "It's for a cure, and it won't wait.",
    "There's an order to fill and nothing to fill it with.",
  ],
  word: [
    "Something's not right there, and nobody will say what.",
    "I heard a story I don't like, and I want it looked into.",
    "There was a light out there last night where there shouldn't be.",
  ],
  investigate: ["It was there in the evening and gone by morning.", "Someone took it, and I mean to know who."],
  delve: [
    "There's a cold draught out of it, and noises at night.",
    "Folk say it goes down further than anyone's been.",
    "I want to know what's living under our feet.",
  ],
  rescue: ["They went out and never came back.", "They were taken on the road, and nobody's gone after them."],
  scout: [
    "We hear things from that way, and none of them good.",
    "Somebody has to see it with their own eyes.",
    "If there's trouble coming, I'd sooner know now.",
  ],
};
/** Something that makes it harder, or different. "hurry" adds a time limit (when time limits are on). */
const COMPLICATIONS = ["", "", "hurry", "more", "quiet"];
const COMPLICATION_WORDS = {
  hurry: "And it can't wait: there's a day and a half at most.",
  more: "There may be more of them than I said.",
  quiet: "Keep it quiet, if you can.",
};
const MISSING = ["ledger", "silver brooch", "strongbox", "good knife", "seal ring", "purse"];
const KIN = ["brother", "sister", "cousin", "apprentice", "son", "daughter"];
const CAPTIVE_NAMES = ["Wat", "Edda", "Tamsin", "Hob", "Aldo", "Merry", "Cole", "Isolde", "Piers", "Bryn"];
const PURPOSE_WORDS = {
  stronghold: "a bandit stronghold",
  outposts: "a few outposts",
  ruin: "a ruin over a dungeon",
  caves: "a hillside of caves",
  town: "a smaller town",
  hamlets: "a cluster of hamlets",
  faction: "a faction's land",
};
/** Where a region's way in is, for a quest that sends you inside: what it's called. */
const WAY_IN = { stronghold: "its gate", ruin: "the dungeon by the ruins", caves: "one of its caves" };

// ── Making a quest ──────────────────────────────────────────────────────────────

function makeStage(id, text, goal, extra = {}) {
  return { id, text, goal, next: null, fails: [], done: false, ...extra };
}

/** Links each main-line stage to the one after it (branches keep their own `next`). */
function chain(stages) {
  const main = stages.filter((stage) => !stage.branch);
  main.forEach((stage, i) => (stage.next ??= main[i + 1]?.id ?? null));
  return stages;
}

/** A new quest, offered, from what it was made of. */
export function newQuest(fields) {
  const quest = {
    id: fields.id,
    title: str(fields.title, 80) || "A quest",
    source: fields.source ?? "board",
    giver: fields.giver ?? null,
    giverName: str(fields.giverName, 80),
    region: fields.region ?? "0,0",
    parts: fields.parts ?? {},
    intro: str(fields.intro, 600),
    done: str(fields.done, 400),
    reward: fields.reward ?? { coin: 0, items: [], standing: null, warmth: 0 },
    stages: chain(fields.stages),
    at: fields.stages[0].id,
    state: "offered",
    owned: fields.owned ?? [],
    log: [],
    since: num(fields.now),
    lore: str(fields.lore, 120),
    ai: !!fields.ai,
  };
  return quest;
}

/** The reward the code gives for a quest, by how long it is and the party's level (the model never sets it). */
export function rewardFor(stages, level = 1, giver = null) {
  const main = stages.filter((stage) => !stage.branch).length;
  return {
    coin: 10 + main * 12 + Math.max(0, level - 1) * 6,
    items: [],
    standing: giver?.faction ? { faction: giver.faction, by: 6 } : null,
    warmth: 8,
  };
}

/** A creature that suits the party's level, from those that can be met. */
function creatureFor(random, world) {
  const most = Math.max(0.5, (world.level ?? 1) / 3);
  const fits = (world.creatures ?? []).filter((entry) => (entry.cr ?? 1) <= most);
  return fits.length ? pick(random, fits) : null;
}

/** Someone here other than those in `not`. */
const someoneElse = (random, world, not) => {
  const others = (world.people ?? []).filter((person) => !not.includes(person.id));
  return others.length ? pick(random, others) : null;
};

const talkGoal = (person, region) => ({
  verb: "talk",
  person: person.id,
  name: person.name,
  region,
  x: person.x,
  z: person.z,
});
const atPlace = (person) => (person.placeName ? ` (${person.placeName})` : "");

/** The stages of each archetype for `giver` (a person here), or null when this world can't have it. */
const BUILDERS = {
  hunt(random, world, giver, parts) {
    const wild = (world.wilds ?? []).length ? pick(random, world.wilds) : null;
    const beast = world.fights ? creatureFor(random, world) : null;
    if (!wild || !beast) return null;
    const count = Math.max(
      1,
      (beast.cr >= 1 ? 1 : 2 + Math.floor(random() * 2)) + (parts.complication === "more" ? 1 : 0),
    );
    return {
      title: `${cap(plural(beast.name))} near ${wild.name}`,
      ask: `Something has to be done about the ${plural(beast.name)} near ${wild.name}.`,
      stages: [
        makeStage("s1", `Beat ${many(count, beast.name)} near ${wild.name}.`, {
          verb: "defeat",
          creature: beast.kind,
          name: words(beast.name),
          count,
          got: 0,
          place: wild.id,
          region: world.region,
          x: wild.x,
          z: wild.z,
          r: QUEST.NEAR,
        }),
        makeStage("s2", `Tell ${giver.name} it's done${atPlace(giver)}.`, talkGoal(giver, world.region)),
      ],
      done: `${giver.name} breathes out. "That's a weight off. Here, you've earned this."`,
      place: wild.id,
    };
  },
  supply(random, world, giver) {
    if (!world.items || !(world.gatherables ?? []).length) return null;
    const item = pick(random, world.gatherables);
    const count = 2 + Math.floor(random() * 2);
    return {
      title: `${cap(item.name)} for ${giver.name}`,
      ask: `I need ${count} × ${item.name.toLowerCase()}, and I've no time to get them myself.`,
      stages: [
        makeStage("s1", `Find ${count} × ${item.name.toLowerCase()}${item.how ? ` (${item.how})` : ""}.`, {
          verb: "gather",
          item: item.name,
          count,
        }),
        makeStage("s2", `Bring them to ${giver.name}${atPlace(giver)}.`, {
          ...talkGoal(giver, world.region),
          verb: "bring",
          item: item.name,
          count,
        }),
      ],
      done: `${giver.name} counts them twice and nods. "Just what I needed."`,
    };
  },
  word(random, world, giver) {
    const witness = someoneElse(random, world, [giver.id]);
    const places = (world.places ?? []).filter((place) => place.id !== giver.place && place.id !== witness?.place);
    if (!witness || !places.length) return null;
    const place = pick(random, places);
    const other = someoneElse(random, world, [giver.id, witness.id]);
    const stages = [
      makeStage("s1", `Ask ${witness.name}${atPlace(witness)} what they saw.`, talkGoal(witness, world.region), {
        learn: `${witness.name} says to look round ${place.name}.`,
      }),
      makeStage("s2", `Look round ${place.name}.`, {
        verb: "go",
        place: place.id,
        name: place.name,
        region: world.region,
        x: place.x,
        z: place.z,
      }),
      makeStage("s3", `Tell ${giver.name} what you found${atPlace(giver)}.`, talkGoal(giver, world.region)),
    ];
    // The witness gone (deleted in the Engine): someone else saw it too.
    if (other) {
      stages[0].fails.push({ gone: witness.id, then: "s1b" });
      stages.push(
        makeStage(
          "s1b",
          `${witness.name} is gone. Ask ${other.name}${atPlace(other)} instead.`,
          talkGoal(other, world.region),
          {
            branch: true,
            next: "s2",
          },
        ),
      );
    }
    return {
      title: `What ${witness.name} saw`,
      ask: `Ask ${witness.name} about it. They were out by ${place.name}.`,
      stages,
      done: `${giver.name} hears you out. "I thought as much. Thank you."`,
      place: place.id,
    };
  },
  investigate(random, world, giver) {
    const pool = (world.people ?? []).filter((person) => person.id !== giver.id);
    if (pool.length < 4) return null;
    const shuffled = [...pool].sort(() => random() - 0.5);
    const [first, second, culprit, other] = shuffled;
    const thing = pick(random, MISSING);
    const suspects = [culprit, other, first].sort(() => random() - 0.5);
    const stages = [
      makeStage("s1", `Ask ${first.name}${atPlace(first)} what they know.`, talkGoal(first, world.region), {
        learn: `${first.name} saw ${culprit.name} near ${giver.placeName || "the house"} late that night.`,
      }),
      makeStage("s2", `Ask ${second.name}${atPlace(second)} as well.`, talkGoal(second, world.region), {
        learn: `${second.name} says ${culprit.name} has been short of money all week.`,
      }),
      makeStage("s3", `Name who took the ${thing}.`, {
        verb: "choose",
        options: suspects.map((person, i) => ({
          label: person.name,
          next: person.id === culprit.id ? "s4" : `s3w${i}`,
          fail: person.id !== culprit.id,
        })),
      }),
      makeStage("s4", `Tell ${giver.name} it was ${culprit.name}.`, talkGoal(giver, world.region)),
    ];
    // Naming the wrong one: the quest goes wrong, and ends once you've made it right with them.
    suspects.forEach((person, i) => {
      if (person.id === culprit.id) return;
      stages.push(
        makeStage(
          `s3w${i}`,
          `You named ${person.name}, and it wasn't them. Make it right with them.`,
          talkGoal(person, world.region),
          {
            branch: true,
            next: null,
            end: "failed",
          },
        ),
      );
    });
    return {
      title: `${giver.name}'s missing ${thing}`,
      ask: `My ${thing} is gone. ${first.name} or ${second.name} might know something.`,
      stages,
      done: `${giver.name} goes very quiet, then thanks you. "${culprit.name}. I'd never have thought it."`,
    };
  },
  delve(random, world, giver) {
    const cave = world.deep && (world.caves ?? []).length ? pick(random, world.caves) : null;
    if (!cave) return null;
    return {
      title: `Under ${cave.name}`,
      ask: `Go down into ${cave.name} and tell me what's there.`,
      stages: [
        makeStage("s1", `Go down into ${cave.name}.`, {
          verb: "deep",
          cave: cave.id,
          name: cave.name,
          depth: 1,
          region: world.region,
          x: cave.x,
          z: cave.z,
        }),
        makeStage("s2", `Tell ${giver.name} what's down there${atPlace(giver)}.`, talkGoal(giver, world.region)),
      ],
      done: `${giver.name} listens to every word. "And you came back. That's more than most."`,
      place: `cave:${cave.id}`,
    };
  },
  rescue(random, world, giver, parts, id) {
    const cave = world.deep && (world.caves ?? []).length ? pick(random, world.caves) : null;
    if (!cave) return null;
    const name = pick(random, CAPTIVE_NAMES);
    const kin = pick(random, KIN);
    const captive = { kind: "captive", id: `${id}:captive`, name, cave: cave.id, region: world.region, freed: false };
    return {
      title: `${giver.name}'s ${kin}`,
      ask: `My ${kin} ${name} is held in ${cave.name}. Please, bring them home.`,
      stages: [
        makeStage("s1", `Find ${name} in ${cave.name} and set them free.`, {
          verb: "rescue",
          captive: captive.id,
          cave: cave.id,
          name: cave.name,
          region: world.region,
          x: cave.x,
          z: cave.z,
        }),
        makeStage("s2", `Bring ${name} home to ${giver.name}${atPlace(giver)}.`, talkGoal(giver, world.region)),
      ],
      owned: [captive],
      done: `${giver.name} holds on to ${name} and won't let go. "I can't ever repay you. But take this."`,
      place: `cave:${cave.id}`,
    };
  },
  scout(random, world, giver) {
    const ahead = world.travel ? (world.ahead ?? []) : [];
    if (!ahead.length) return null;
    const target = pick(random, ahead);
    const about = PURPOSE_WORDS[target.kind] ?? "the land";
    const way = target.way ?? target.side;
    const stages = [
      makeStage("s1", `Travel ${way} to ${target.name}${target.kind ? `, ${about}` : ""}.`, {
        verb: "region",
        region: target.key,
        name: target.name,
        side: target.side,
        kind: target.kind ?? "",
        faction: target.faction ?? "",
      }),
    ];
    if (world.deep && WAY_IN[target.kind])
      stages.push(
        makeStage("s2", `Go in at ${WAY_IN[target.kind]} in ${target.name}.`, {
          verb: "deep",
          cave: null,
          name: `${target.name}'s way in`,
          depth: 1,
          region: target.key,
        }),
      );
    stages.push(
      makeStage(
        `s${stages.length + 1}`,
        `Come back and tell ${giver.name}${atPlace(giver)}.`,
        talkGoal(giver, world.region),
      ),
    );
    return {
      title: `What lies ${target.side}`,
      ask: `Go ${way} to ${target.name} and see what's there${target.kind ? `. They say it's ${about}` : ""}.`,
      stages,
      done: `${giver.name} hears it all and goes grim. "Then we know. Thank you."`,
      place: `region:${target.key}`,
      region: target,
    };
  },
};

/** Remembers a quest's parts with the ones before it, the newest last. */
export function rememberParts(recent, parts) {
  return [...(Array.isArray(recent) ? recent : []), parts].slice(-QUEST.PARTS);
}

/**
 * A built-in quest for this world, from `giver` (a person here; else someone here is picked), the same
 * for the same `key`. Its archetype, motive and complication avoid the `recent` ones where they can, and
 * `only` limits the archetypes. Null when the world has nothing a quest could be made of.
 */
export function builtInQuest(key, world, { giver = null, recent = [], only = ARCHETYPES, source = "board" } = {}) {
  const random = rng(hashString(`quest:${world.seed}:${key}`));
  const people = world.people ?? [];
  const who = giver ? people.find((person) => person.id === giver) : people.length ? pick(random, people) : null;
  if (!who) return null;
  const lately = recent.slice(-3).map((parts) => parts.archetype);
  const order = [...only].sort((a, b) => (lately.includes(a) ? 1 : 0) - (lately.includes(b) ? 1 : 0) || random() - 0.5);
  const id = `quest-${hashString(`${world.seed}:${key}`).toString(36)}`;
  for (const archetype of order) {
    const motives = MOTIVES[archetype];
    const used = recent.map((parts) => parts.motive);
    const motive = motives.find((line) => !used.includes(line) && random() < 0.7) ?? pick(random, motives);
    let complication = pick(random, COMPLICATIONS);
    if (complication === "hurry" && !world.timeLimits) complication = "";
    if (complication === "more" && archetype !== "hunt") complication = ""; // (more of what? only a hunt's foes)
    const parts = { archetype, motive, complication, place: "", reward: "coin" };
    const made = BUILDERS[archetype](random, world, who, parts, id);
    if (!made) continue;
    parts.place = made.place ?? "";
    if (complication === "hurry") {
      const first = made.stages[0];
      first.by = (world.now ?? 0) + QUEST.HURRY;
      first.fails.push({ late: true, then: "late" });
      made.stages.push(
        makeStage("late", `Too late. Tell ${who.name} what happened${atPlace(who)}.`, talkGoal(who, world.region), {
          branch: true,
          next: null,
          end: "failed",
        }),
      );
    }
    // The giver gone before it's over: their kin or a friend has the reward, or nobody does.
    const last = made.stages.filter((stage) => !stage.branch).at(-1);
    const kin = someoneElse(random, world, [who.id, ...made.stages.map((stage) => stage.goal.person)]);
    if (last.goal.person === who.id && kin) {
      last.fails.push({ gone: who.id, then: "kin" });
      made.stages.push(
        makeStage("kin", `${who.name} is gone. Tell ${kin.name}${atPlace(kin)} instead.`, talkGoal(kin, world.region), {
          branch: true,
          next: null,
        }),
      );
    }
    const quest = newQuest({
      id,
      title: made.title,
      source,
      giver: who.id,
      giverName: who.name,
      region: world.region,
      parts,
      intro: [made.ask, motive, COMPLICATION_WORDS[complication]].filter(Boolean).join(" "),
      done: made.done,
      stages: made.stages,
      owned: made.owned,
      reward: rewardFor(made.stages, world.level, who),
      now: world.now,
    });
    if (made.region) quest.reserve = { key: made.region.key, kind: made.region.kind, faction: made.region.faction };
    return quest;
  }
  return null;
}

// ── Errands are one-stage quests ────────────────────────────────────────────────

/** The errand the player has (save.errand), as a one-stage quest for the Journal and the quest line. */
export function errandQuest(errand) {
  if (!errand) return null;
  return {
    id: errand.id,
    title: "An errand",
    source: "errand",
    giver: errand.person,
    giverName: "",
    region: "",
    parts: { archetype: "errand" },
    intro: errand.text,
    done: errand.done,
    reward: { coin: 0, items: [], standing: null, warmth: 8 },
    stages: [makeStage("s1", errand.text, { verb: "talk", person: errand.person, place: errand.place })],
    at: "s1",
    state: "active",
    owned: [],
    log: [],
    since: 0,
    errand: true,
  };
}

/** The record of an errand done (or dropped), kept with the quests so the Journal lists it. */
export function errandRecord(errand, state, now, line) {
  const quest = errandQuest(errand);
  quest.stages[0].done = state === "done";
  quest.state = state;
  quest.at = null;
  quest.log = [{ at: now, text: line }];
  return quest;
}

// ── Quests from lore (ww:quest) ─────────────────────────────────────────────────

/**
 * The quests a world's lorebooks hold: an entry keyed `ww:quest:<title>` is one, its text the premise,
 * with `ww:quest giver:`, `ww:quest place:` and `ww:quest reward:` beside it. `books`: [{ id, entries:
 * [{ id, title, content, keys }] }] with the keys as plain words (keywords.js readKeys). [{ key, title,
 * premise, giver, place, reward }]
 */
export function questsFromLore(books) {
  const out = [];
  for (const book of books ?? [])
    for (const entry of book.entries ?? []) {
      const keys = (entry.keys ?? []).map((key) => String(key).trim());
      const of = (what) =>
        keys.map((key) => new RegExp(`^quest ${what} (.+)$`, "iu").exec(key)?.[1]).find(Boolean) ?? "";
      const titles = keys
        .filter((key) => !/^quest (giver|place|reward) /iu.test(key))
        .map((key) => /^quest (.+)$/iu.exec(key)?.[1])
        .filter(Boolean);
      for (const title of titles)
        out.push({
          key: `${book.id}:${entry.id}:${title}`.slice(0, 120),
          title: title.slice(0, 80),
          premise: str(entry.content, 600),
          giver: of("giver"),
          place: of("place"),
          reward: of("reward"),
        });
    }
  return out.slice(0, 40);
}

const plain = (text) =>
  String(text ?? "")
    .toLowerCase()
    .replace(/^the\s+/u, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
/** The one of `list` whose name (or kind) best matches `name`: the same, then one inside the other, by whole words. */
function match(list, name, kinds = false) {
  const want = plain(name);
  if (!want) return null;
  const within = (a, b) => !!a && !!b && ` ${b} `.includes(` ${a} `);
  return (
    list.find((entry) => plain(entry.name) === want) ??
    (kinds ? list.find((entry) => plain(entry.kind) === want) : null) ??
    list.find((entry) => within(want, plain(entry.name)) || within(plain(entry.name), want)) ??
    (kinds ? list.find((entry) => within(plain(entry.kind), want)) : null) ??
    null
  );
}

/**
 * A lore quest without the AI: talk to its giver, then go to its place, then back to the giver (or, with
 * no giver here, go to the place and it's done). Null when neither its giver nor its place is here.
 */
export function loreQuest(lore, world) {
  const giver = match(world.people ?? [], lore.giver);
  const place = match(world.places ?? [], lore.place, true);
  if (!giver && !place) return null;
  const stages = [];
  if (giver) stages.push(makeStage("s1", `Hear ${giver.name} out${atPlace(giver)}.`, talkGoal(giver, world.region)));
  if (place)
    stages.push(
      makeStage(`s${stages.length + 1}`, `Go to ${place.name}.`, {
        verb: "go",
        place: place.id,
        name: place.name,
        region: world.region,
        x: place.x,
        z: place.z,
      }),
    );
  if (giver && place)
    stages.push(makeStage(`s${stages.length + 1}`, `Go back to ${giver.name}.`, talkGoal(giver, world.region)));
  return newQuest({
    id: `quest-lore-${hashString(lore.key).toString(36)}`,
    title: lore.title,
    source: "lore",
    giver: giver?.id ?? null,
    giverName: giver?.name ?? "",
    region: world.region,
    parts: { archetype: "lore", motive: "", complication: "", place: place?.id ?? "", reward: "coin" },
    intro: lore.premise || lore.title,
    done: lore.reward ? `For your trouble: ${lore.reward}.` : "",
    stages,
    reward: rewardFor(stages, world.level, giver),
    now: world.now,
    lore: lore.key,
  });
}

// ── AI-written quests: what the model is given, and its answer checked ─────────

/** What one call to write a quest is given: names only, a few of each, so it's cheap (server.mjs /quest-write). */
export function questAsk(world, { giver = null, premise = "", recent = [] } = {}) {
  const who = (world.people ?? []).find((person) => person.id === giver);
  const few = (list, n) => list.slice(0, n);
  return {
    giver: who ? `${who.name}${who.placeName ? `, at ${who.placeName}` : ""}` : "",
    premise: str(premise, 600),
    avoid: recent.slice(-4).map((parts) => [parts.archetype, parts.motive].filter(Boolean).join(": ")),
    people: few(world.people ?? [], 12).map(
      (person) => `${person.name}${person.placeName ? ` (${person.placeName})` : ""}`,
    ),
    places: few(world.places ?? [], 12).map((place) => place.name),
    wilds: few(world.wilds ?? [], 6).map((place) => place.name),
    creatures: world.fights ? few(world.creatures ?? [], 8).map((entry) => words(entry.name)) : [],
    items: world.items ? few(world.gatherables ?? [], 8).map((item) => item.name) : [],
    caves: world.deep ? few(world.caves ?? [], 4).map((cave) => cave.name) : [],
    regions: world.travel
      ? few(world.ahead ?? [], 4).map(
          (target) => `${target.side}: ${target.name}${target.kind ? `, ${PURPOSE_WORDS[target.kind]}` : ""}`,
        )
      : [],
  };
}

/**
 * One stage the model wrote ({ verb, target, count, text }), as a goal on this world's ids, or null when
 * what it names isn't here and nothing close is. A place or a creature can be swapped for a close match
 * (the nearest of its kind); a person can't.
 */
export function stageFromWords(raw, world, id) {
  if (!isRecord(raw)) return null;
  const verb = str(raw.verb, 20).toLowerCase();
  const target = str(raw.target, 120);
  const count = Math.max(1, Math.min(6, Math.round(num(raw.count, 1))));
  const text = str(raw.text, 240);
  const person = () => match(world.people ?? [], target);
  const here = world.region;
  let goal;
  if (verb === "talk" || verb === "bring") {
    const who = person();
    if (!who) return null;
    goal = talkGoal(who, here);
    if (verb === "bring") {
      const item = world.items ? match(world.gatherables ?? [], str(raw.item, 80) || target) : null;
      if (!item) return null;
      goal = { ...goal, verb: "bring", item: item.name, count };
    }
  } else if (verb === "go") {
    const place = match([...(world.places ?? []), ...(world.wilds ?? [])], target, true);
    if (!place) return null;
    goal = { verb: "go", place: place.id, name: place.name, region: here, x: place.x, z: place.z };
  } else if (verb === "gather") {
    const item = world.items ? match(world.gatherables ?? [], target) : null;
    if (!item) return null;
    goal = { verb: "gather", item: item.name, count };
  } else if (verb === "defeat") {
    if (!world.fights) return null;
    const beast =
      match(world.creatures ?? [], target, true) ?? match(world.creatures ?? [], target.replace(/s$/u, ""), true);
    const near = match(world.wilds ?? [], str(raw.near, 120)) ?? (world.wilds ?? [])[0];
    if (!beast || !near) return null;
    goal = {
      verb: "defeat",
      creature: beast.kind,
      name: words(beast.name),
      count: Math.min(count, beast.cr >= 1 ? 1 : 4),
      got: 0,
      place: near.id,
      region: here,
      x: near.x,
      z: near.z,
      r: QUEST.NEAR,
    };
  } else if (verb === "deep" || verb === "rescue") {
    const cave = world.deep ? (match(world.caves ?? [], target) ?? (world.caves ?? [])[0]) : null;
    if (!cave) return null;
    goal = { verb, cave: cave.id, name: cave.name, depth: 1, region: here, x: cave.x, z: cave.z };
    if (verb === "rescue") goal.captive = `${id}:captive`;
  } else if (verb === "region") {
    const ahead = world.travel ? (world.ahead ?? []) : [];
    const want = plain(target);
    const found =
      ahead.find((entry) => want.includes(entry.side) && (!entry.kind || want.includes(entry.kind))) ??
      ahead.find((entry) => want.includes(entry.side)) ??
      match(ahead, target);
    if (!found) return null;
    goal = {
      verb: "region",
      region: found.key,
      name: found.name,
      side: found.side,
      kind: found.kind ?? "",
      faction: found.faction ?? "",
    };
  } else return null;
  return { goal, text: text || null };
}

/**
 * The model's quest ({ title, intro, stages: [{ verb, target, count, text }], done, archetype, motive,
 * complication }) as a quest of this world, checked: every stage on ids that exist, a person's stage with
 * that person, a captive owned by the quest. Null (with `why`) when it can't be made to work, so the
 * caller writes it again or uses a built-in one.
 */
export function questFromWords(data, world, { giver = null, key = "", source = "ai", lore = "" } = {}) {
  const why = (text) => ({ quest: null, why: text });
  if (!isRecord(data) || !Array.isArray(data.stages)) return why("no stages");
  const id = `quest-ai-${hashString(`${world.seed}:${key}:${JSON.stringify(data)}`).toString(36)}`;
  const who = (world.people ?? []).find((person) => person.id === giver) ?? null;
  const stages = [];
  const owned = [];
  for (const raw of data.stages.slice(0, QUEST.STAGES)) {
    const made = stageFromWords(raw, world, id);
    if (!made) return why(`a stage names what isn't here: ${str(raw?.verb, 20)} ${str(raw?.target, 60)}`);
    const sid = `s${stages.length + 1}`;
    const text = made.text ?? defaultText(made.goal);
    stages.push(makeStage(sid, text, made.goal));
    if (made.goal.verb === "rescue" && !owned.length) {
      const name = str(data.captive, 40) || pick(rng(hashString(id)), CAPTIVE_NAMES);
      owned.push({
        kind: "captive",
        id: made.goal.captive,
        name,
        cave: made.goal.cave,
        region: world.region,
        freed: false,
      });
    }
  }
  if (!stages.length) return why("no stages");
  // A quest someone gave ends with them, unless the model already has it so.
  if (who && stages.at(-1).goal.person !== who.id && stages.length < QUEST.STAGES)
    stages.push(
      makeStage(`s${stages.length + 1}`, `Go back to ${who.name}${atPlace(who)}.`, talkGoal(who, world.region)),
    );
  const archetype = ARCHETYPES.includes(data.archetype) ? data.archetype : "ai";
  const quest = newQuest({
    id,
    title: str(data.title, 80) || "Work to be done",
    source,
    giver: who?.id ?? null,
    giverName: who?.name ?? "",
    region: world.region,
    parts: {
      archetype,
      motive: str(data.motive, 120),
      complication: str(data.complication, 120),
      place: "",
      reward: "coin",
    },
    intro: str(data.intro, 600),
    done: str(data.done, 400),
    stages,
    owned,
    reward: rewardFor(stages, world.level, who),
    now: world.now,
    lore,
    ai: true,
  });
  const region = stages.find((stage) => stage.goal.verb === "region")?.goal;
  if (region) quest.reserve = { key: region.region, kind: region.kind, faction: region.faction };
  const checked = checkQuest(quest, world);
  return checked.quest ? { quest: checked.quest, why: "" } : why(checked.problems.join("; "));
}

/** A stage's words when the model gave none. */
function defaultText(goal) {
  return {
    talk: `Talk to ${goal.name}.`,
    bring: `Bring ${goal.count} × ${String(goal.item).toLowerCase()} to ${goal.name}.`,
    go: `Go to ${goal.name}.`,
    gather: `Find ${goal.count} × ${String(goal.item).toLowerCase()}.`,
    defeat: `Beat ${many(goal.count, goal.name)}.`,
    deep: `Go down into ${goal.name}.`,
    rescue: `Free the captive in ${goal.name}.`,
    region: `Travel ${goal.side} to ${goal.name}.`,
    choose: "Choose.",
  }[goal.verb];
}

// ── The checks from section 1: every quest can be finished ─────────────────────

/** Whether a goal can be done in this world as it is now (its things are here, the settings allow it). "" if so. */
function blocked(goal, world) {
  const here = !goal.region || goal.region === world.region;
  switch (goal.verb) {
    case "talk":
    case "bring":
      if (!(world.cast ?? []).includes(goal.person)) return "gone";
      return goal.verb === "bring" && !world.items ? "no inventory" : "";
    case "go":
      return here && !(world.places ?? []).concat(world.wilds ?? []).some((place) => place.id === goal.place)
        ? "no place"
        : "";
    case "gather":
      return world.items ? "" : "no inventory";
    case "defeat":
      if (!world.fights) return "no fights";
      return (world.creatures ?? []).some((entry) => entry.kind === goal.creature) ? "" : "no creature";
    case "deep":
    case "rescue":
      if (!world.deep) return "closed";
      return here && goal.cave !== null && !(world.caves ?? []).some((cave) => cave.id === goal.cave) ? "no cave" : "";
    case "region":
      return world.travel ? "" : "no travel";
    case "choose":
      return Array.isArray(goal.options) && goal.options.length ? "" : "no options";
    default:
      return "unknown";
  }
}

/** Every stage reaches an end: its `next` and its branches lead on to null, never round in a circle. */
function ends(quest) {
  const byId = new Map(quest.stages.map((stage) => [stage.id, stage]));
  const reaches = (id, seen = new Set()) => {
    if (id === null || id === undefined) return true;
    const stage = byId.get(id);
    if (!stage || seen.has(id)) return false;
    seen.add(id);
    const onward = stage.goal.verb === "choose" ? stage.goal.options.map((option) => option.next) : [stage.next];
    return onward.every((next) => reaches(next, new Set(seen)));
  };
  const dangling = quest.stages.flatMap((stage) => [
    ...stage.fails.map((fail) => fail.then).filter((then) => then && !byId.has(then)),
    ...(stage.next && !byId.has(stage.next) ? [stage.next] : []),
  ]);
  return !dangling.length && quest.stages.every((stage) => reaches(stage.id));
}

/**
 * Checks a quest before it's offered (and again on load): every stage's goal on things the world has, a
 * close match swapped in where one can be (another place of the kind, another creature), every stage
 * leading to an end. { quest, problems }: quest null when it can't be finished.
 */
export function checkQuest(quest, world) {
  const problems = [];
  if (!quest?.stages?.length) return { quest: null, problems: ["no stages"] };
  if (!ends(quest)) return { quest: null, problems: ["a stage leads nowhere"] };
  const stages = quest.stages.map((stage) => {
    const why = blocked(stage.goal, world);
    if (!why) return stage;
    const swapped = swap(stage, why, world);
    if (swapped) return swapped;
    if (!stage.branch) problems.push(`${stage.id}: ${why}`);
    return stage;
  });
  return problems.length ? { quest: null, problems } : { quest: { ...quest, stages }, problems };
}

/** A stage with what it lacks swapped for something close that's here, or null when nothing is. */
function swap(stage, why, world) {
  const goal = stage.goal;
  if (why === "no place") {
    const kind = (world.places ?? []).find((place) => place.id === goal.place)?.kind;
    const all = [...(world.places ?? []), ...(world.wilds ?? [])];
    const near = all
      .filter((place) => !kind || place.kind === kind)
      .sort((a, b) => Math.hypot(a.x - goal.x, a.z - goal.z) - Math.hypot(b.x - goal.x, b.z - goal.z))[0];
    if (!near) return null;
    return {
      ...stage,
      text: stage.text.replace(goal.name, near.name),
      goal: { ...goal, place: near.id, name: near.name, x: near.x, z: near.z },
    };
  }
  if (why === "no creature") {
    const other = (world.creatures ?? [])[0];
    if (!other) return null;
    const text = stage.text.replace(plural(goal.name), plural(other.name)).replace(goal.name, words(other.name));
    return { ...stage, text, goal: { ...goal, creature: other.kind, name: words(other.name) } };
  }
  if (why === "no cave") {
    const cave = (world.caves ?? [])[0];
    if (!cave) return null;
    return {
      ...stage,
      text: stage.text.replace(goal.name, cave.name),
      goal: { ...goal, cave: cave.id, name: cave.name, x: cave.x, z: cave.z },
    };
  }
  return null;
}

// ── Playing a quest ─────────────────────────────────────────────────────────────

/** The stage a quest is at, or null. */
export const stageOf = (quest) => quest?.stages.find((stage) => stage.id === quest.at) ?? null;
const logged = (quest, now, text) => ({ ...quest, log: [...quest.log, { at: now, text }].slice(-30) });

/**
 * Moves a quest on from its stage: `how` "done" (to its next), "failed" (to its failure branch, else the
 * quest fails) or a stage id (a choice's, a branch's). `line`: what the Journal says of it.
 * Returns the quest as it now is.
 */
export function moveOn(quest, how, now = 0, line = "", { failures = true, why = "" } = {}) {
  const stage = stageOf(quest);
  if (!stage || quest.state !== "active") return quest;
  let next = quest;
  if (how === "failed") {
    const fail = why ? stage.fails.find((entry) => (why === "late" ? entry.late : entry.gone === why)) : stage.fails[0];
    next = logged(next, now, line || `${stage.text} It went wrong.`);
    if (!failures || !fail?.then) return { ...next, state: "failed", at: null };
    return enter(next, fail.then);
  }
  const done = { ...stage, done: true };
  next = { ...next, stages: next.stages.map((entry) => (entry.id === stage.id ? done : entry)) };
  next = logged(next, now, line || stage.learn || `Done: ${stage.text}`);
  if (stage.learn && line) next = logged(next, now, stage.learn);
  const to = how === "done" ? stage.next : how;
  if (!to) return { ...next, state: stage.end === "failed" ? "failed" : "done", at: null };
  return enter(next, to);
}
const enter = (quest, id) =>
  quest.stages.some((stage) => stage.id === id) ? { ...quest, at: id } : { ...quest, state: "failed", at: null };

/**
 * What happens, told to a quest: { type, … } (see below). Returns { quest, lines, take } where `lines`
 * are for the chat and `take` lists items to take from the player (a bring stage done). Kinds of event:
 * talk { person }, at { region, zone, x, z }, have { have: { lowercase name: count } }, beat { kind, id,
 * region, x, z }, deep { region, cave, depth }, free { captive }, choose { option (index) }.
 */
export function questEvent(quest, event, world = {}) {
  const out = { quest, lines: [], take: [] };
  const stage = stageOf(quest);
  if (!stage || quest.state !== "active") return out;
  const goal = stage.goal;
  const now = world.now ?? 0;
  const failures = world.failures !== false;
  const finish = (how = "done", line = "") => {
    out.quest = moveOn(quest, how, now, line, { failures });
    out.lines.push(line || `${quest.title}: ${stage.text.replace(/\.$/u, "")}, done.`);
    if (stage.learn) out.lines.push(stage.learn);
  };
  const sameRegion = (region) => !goal.region || goal.region === region;
  switch (event.type) {
    case "talk":
      if (goal.verb === "talk" && goal.person === event.person) finish();
      else if (goal.verb === "bring" && goal.person === event.person) {
        const have = event.have?.[String(goal.item).toLowerCase()] ?? 0;
        if (have >= goal.count) {
          out.take.push({ item: goal.item, count: goal.count });
          finish();
        } else
          out.lines.push(
            `${quest.title}: you have ${have} of the ${goal.count} × ${String(goal.item).toLowerCase()} wanted.`,
          );
      }
      break;
    case "at":
      if (goal.verb === "go" && sameRegion(event.region)) {
        const near = Number.isFinite(goal.x) && Math.hypot(event.x - goal.x, event.z - goal.z) < QUEST.AT;
        if (event.zone === goal.place || near) finish();
      } else if (goal.verb === "region" && event.region === goal.region)
        finish("done", `${quest.title}: you've reached ${goal.name}.`);
      break;
    case "have":
      if (goal.verb === "gather" && (event.have?.[String(goal.item).toLowerCase()] ?? 0) >= goal.count) finish();
      break;
    case "beat": {
      if (goal.verb !== "defeat" || event.kind !== goal.creature || !sameRegion(event.region)) break;
      const ours = String(event.id ?? "").startsWith(`lore:${spawnId(quest, stage)}:`);
      if (!ours && Math.hypot(event.x - goal.x, event.z - goal.z) > (goal.r ?? QUEST.NEAR)) break;
      const got = (goal.got ?? 0) + 1;
      if (got >= goal.count) finish();
      else {
        out.quest = {
          ...quest,
          stages: quest.stages.map((entry) => (entry.id === stage.id ? { ...stage, goal: { ...goal, got } } : entry)),
        };
        out.lines.push(`${quest.title}: ${got} of ${goal.count}.`);
      }
      break;
    }
    case "deep":
      if (
        goal.verb === "deep" &&
        sameRegion(event.region) &&
        (goal.cave === null || goal.cave === event.cave) &&
        event.depth >= (goal.depth ?? 1)
      )
        finish();
      break;
    case "free":
      if (goal.verb === "rescue" && goal.captive === event.captive) {
        finish();
        out.quest = {
          ...out.quest,
          owned: out.quest.owned.map((own) => (own.id === event.captive ? { ...own, freed: true } : own)),
        };
      }
      break;
    case "choose": {
      const option = goal.verb === "choose" ? goal.options?.[event.option] : null;
      if (!option) break;
      const line = `${quest.title}: you chose ${option.label}.${option.fail ? " It was the wrong answer." : ""}`;
      out.quest =
        option.fail && !failures
          ? { ...logged(quest, now, line), state: "failed", at: null }
          : moveOn(quest, option.next ?? "done", now, line, { failures });
      out.lines.push(line);
      break;
    }
    default:
      break;
  }
  return out;
}

/**
 * Checks an open quest against the world as it is now (on load, on every change of region, and now and
 * then): a stage whose person was deleted, whose place or cave is gone, whose creatures can't be met or
 * whose time ran out is repaired where it can be, else fails (to its branch). { quest, lines, adapt }:
 * `adapt` when it failed with no branch to go to (the AI can be asked for one, section 4).
 */
export function questCheck(quest, world) {
  const out = { quest, lines: [], adapt: false };
  const stage = stageOf(quest);
  if (!stage || quest.state !== "active") return out;
  const now = world.now ?? 0;
  const failures = world.failures !== false;
  let why = blocked(stage.goal, world);
  if (!why && Number.isFinite(stage.by) && world.timeLimits !== false && now > stage.by) why = "late";
  if (!why) return out;
  const swapped = why !== "late" && why !== "gone" ? swap(stage, why, world) : null;
  if (swapped) {
    out.quest = logged(
      { ...quest, stages: quest.stages.map((entry) => (entry.id === stage.id ? swapped : entry)) },
      now,
      `Things changed: ${swapped.text}`,
    );
    out.lines.push(`${quest.title}: ${swapped.text}`);
    return out;
  }
  const reason =
    {
      gone: `${stage.goal.name || "Someone the quest needs"} is gone from this world.`,
      late: "Time ran out.",
      closed: "The deep places are closed (Settings → World → Places).",
      "no fights": "Fights are off (Settings → Inventory → Combat).",
      "no travel": "There's no travelling now.",
      "no inventory": "There's no inventory to carry it in (Settings → Inventory).",
    }[why] ?? `It can't be done any more (${why}).`;
  const key = why === "gone" ? stage.goal.person : why === "late" ? "late" : "";
  const branch = stage.fails.find((entry) => (key === "late" ? entry.late : entry.gone === key));
  out.quest = moveOn(quest, "failed", now, `${stage.text} ${reason}`, { failures, why: key || "-" });
  out.adapt = out.quest.state === "failed" && !branch;
  out.lines.push(
    `${quest.title}: ${reason}${out.quest.state === "failed" ? " The quest is over." : ` ${stageOf(out.quest)?.text ?? ""}`}`,
  );
  return out;
}

/** Gives a quest up: kept in the Journal with that said. */
export const giveUp = (quest, now = 0) =>
  quest.state === "active" || quest.state === "offered"
    ? logged({ ...quest, state: "given up", at: null }, now, "You gave it up.")
    : quest;

/** Accepts an offered quest. */
export const accept = (quest, now = 0) =>
  quest.state === "offered" ? logged({ ...quest, state: "active", since: now }, now, "You took it on.") : quest;

/** A stage the AI's adapt call wrote (section 4), put in after the stage that failed; the quest goes on from it. */
export function adaptQuest(quest, data, world) {
  if (!isRecord(data)) return null;
  const now = world.now ?? 0;
  if (!isRecord(data.stage))
    return { ...logged(quest, now, str(data.end, 300) || "It ended there."), state: "failed", at: null };
  const id = `a${quest.stages.length + 1}`;
  const made = stageFromWords(data.stage, world, quest.id);
  if (!made) return null;
  const stage = makeStage(id, made.text ?? defaultText(made.goal), made.goal, { branch: true, next: null });
  const next = logged(
    { ...quest, stages: [...quest.stages, stage], state: "active", at: id },
    now,
    str(data.line, 300) || stage.text,
  );
  return checkQuest(next, world).quest;
}

// ── What the world puts in for a quest ──────────────────────────────────────────

const spawnId = (quest, stage) => `quest:${quest.id}:${stage.id}`;

/**
 * The creatures open quests own in `region` (herd.js setSpawns takes them as the lore's): the ones a
 * defeat stage needs, at its spot. [{ id, kind, count, at, temper }]
 */
export function questSpawns(quests, region) {
  return (quests ?? [])
    .filter((quest) => quest.state === "active")
    .flatMap((quest) => {
      const stage = stageOf(quest);
      const goal = stage?.goal;
      if (goal?.verb !== "defeat" || (goal.region && goal.region !== region)) return [];
      return [
        {
          id: spawnId(quest, stage),
          kind: goal.creature,
          count: goal.count,
          at: { x: goal.x, z: goal.z },
          temper: "hostile",
        },
      ];
    });
}

/** The ids of the creatures `spawns` (questSpawns) puts in the world, for herd.js respawn's `keep`. */
export const spawnKeep = (spawns) =>
  new Set(spawns.flatMap((spawn) => Array.from({ length: spawn.count }, (_, n) => `lore:${spawn.id}:${n}`)));

/** The captives held in level `depth` below cave `cave` of `region`, still to be freed: [{ id, name, quest }]. */
export function captivesAt(quests, region, cave, depth) {
  if (depth !== 1) return [];
  return (quests ?? [])
    .filter((quest) => quest.state === "active")
    .flatMap((quest) =>
      quest.owned
        .filter((own) => own.kind === "captive" && !own.freed && own.region === region && own.cave === cave)
        .filter(() => stageOf(quest)?.goal.verb === "rescue")
        .map((own) => ({ id: own.id, name: own.name, quest: quest.id })),
    );
}

/** Where in a level's plan a captive is held: a `captive` spot, else the spot (or room) furthest from the way in. */
export function captiveSpot(plan) {
  const spots = (plan.spawns ?? []).filter((spawn) => spawn.tag === "captive");
  if (spots.length) return { x: spots[0].x, z: spots[0].z };
  const far = (list) =>
    [...list].sort(
      (a, b) => Math.hypot(b.x - plan.entry.x, b.z - plan.entry.z) - Math.hypot(a.x - plan.entry.x, a.z - plan.entry.z),
    )[0];
  const spot = far(plan.spawns ?? []) ?? far(plan.rooms ?? []);
  return spot ? { x: spot.x, z: spot.z } : { x: plan.entry.x, z: plan.entry.z };
}

/** Whether any open quest needs cave `cave` of `region` to lead down (so it always does, for the quest). */
export const needsCave = (quests, region, cave) =>
  (quests ?? []).some((quest) => {
    const goal = quest.state === "active" ? stageOf(quest)?.goal : null;
    return (
      (goal?.verb === "deep" || goal?.verb === "rescue") &&
      goal.region === region &&
      (goal.cave === cave || goal.cave === null)
    );
  });

/**
 * Where a quest's stage is, for the waypoint: { region, x, z } in this region, { region, away: true } in
 * another, or null when it's nowhere in particular (gathering, a choice). A person is where they are now.
 */
export function questTarget(quest, world) {
  const goal = stageOf(quest)?.goal;
  if (!goal) return null;
  if (goal.verb === "region") return { region: goal.region, away: goal.region !== world.region };
  if (goal.region && goal.region !== world.region) return { region: goal.region, away: true };
  if (goal.person) {
    const person = (world.people ?? []).find((entry) => entry.id === goal.person);
    return person ? { region: world.region, x: person.x, z: person.z } : null;
  }
  return Number.isFinite(goal.x) ? { region: goal.region || world.region, x: goal.x, z: goal.z } : null;
}

// ── What the player sees ────────────────────────────────────────────────────────

/** The line on screen for a quest: its title and what to do now, with how far along a hunt is. */
export function questLine(quest) {
  const stage = stageOf(quest);
  if (!stage) return "";
  const goal = stage.goal;
  const progress = goal.verb === "defeat" && goal.count > 1 ? ` (${goal.got ?? 0} of ${goal.count})` : "";
  return `${quest.title}: ${stage.text}${progress}`;
}

/** The reward in words. */
export function rewardWords(reward, money = "coins") {
  if (!reward) return "";
  return [
    reward.coin ? `${reward.coin} ${money}` : "",
    ...(reward.items ?? []).map((item) => item.name),
    reward.standing ? "their faction's good will" : "",
  ]
    .filter(Boolean)
    .join(", ");
}

/**
 * What Journal → Quests shows of each quest: { id, title, state, from, intro, stages: [{ text, mark }],
 * log, reward, tracked, choose: [labels] when it waits on a choice }. Stages not reached yet are hidden;
 * a branch shows only once it's been reached.
 */
export function questView(quest, { tracked = "", money = "coins" } = {}) {
  const shown = quest.stages
    .filter((stage) => stage.done || stage.id === quest.at)
    .map((stage) => ({ text: stage.text, mark: stage.done ? "done" : stage.id === quest.at ? "now" : "" }));
  const later =
    quest.state === "active"
      ? quest.stages.filter((stage) => !stage.branch && !stage.done && stage.id !== quest.at).length
      : 0;
  const goal = stageOf(quest)?.goal;
  return {
    id: quest.id,
    title: quest.title,
    state: quest.state,
    from: quest.giverName ? `From ${quest.giverName}` : quest.source === "board" ? "From the noticeboard" : "",
    intro: quest.intro,
    stages: shown,
    later,
    log: quest.log.map((entry) => entry.text),
    reward: rewardWords(quest.reward, money),
    tracked: quest.id === tracked,
    errand: !!quest.errand,
    choose: goal?.verb === "choose" && quest.state === "active" ? goal.options.map((option) => option.label) : null,
  };
}

/** A short account of a quest's state, for Settings → Debug → "Show this quest's state". */
export function questState(quest) {
  if (!quest) return "No quest is tracked.";
  const stage = stageOf(quest);
  return [
    `${quest.title} (${quest.id}): ${quest.state}${stage ? `, at ${stage.id}` : ""}`,
    stage ? `Goal: ${JSON.stringify(stage.goal)}` : "",
    stage?.fails.length ? `Fails to: ${stage.fails.map((fail) => fail.then ?? "the end").join(", ")}` : "",
    quest.owned.length
      ? `Owns: ${quest.owned.map((own) => `${own.kind} ${own.name ?? own.id}${own.freed ? " (freed)" : ""}`).join(", ")}`
      : "",
    `Stages: ${quest.stages.map((entry) => `${entry.id}${entry.done ? "✓" : ""}${entry.branch ? "(branch)" : ""}`).join(" ")}`,
  ]
    .filter(Boolean)
    .join("\n");
}

// ── Saved ───────────────────────────────────────────────────────────────────────

function checkGoal(raw) {
  if (!isRecord(raw) || !VERBS.includes(raw.verb)) return null;
  const goal = { verb: raw.verb };
  for (const key of ["person", "place", "name", "region", "item", "creature", "captive", "side", "kind", "faction"])
    if (typeof raw[key] === "string") goal[key] = raw[key].slice(0, 200);
  for (const key of ["count", "got", "depth", "x", "z", "r"]) if (Number.isFinite(raw[key])) goal[key] = raw[key];
  if (raw.cave === null || Number.isFinite(raw.cave)) goal.cave = raw.cave;
  if (raw.verb === "choose")
    goal.options = (Array.isArray(raw.options) ? raw.options : [])
      .filter(isRecord)
      .slice(0, 6)
      .map((option) => ({
        label: str(option.label, 80),
        next: typeof option.next === "string" ? option.next.slice(0, 20) : null,
        fail: option.fail === true,
      }));
  return goal;
}

function checkStage(raw) {
  if (!isRecord(raw) || typeof raw.id !== "string") return null;
  const goal = checkGoal(raw.goal);
  if (!goal) return null;
  const stage = {
    id: raw.id.slice(0, 20),
    text: str(raw.text, 300),
    goal,
    next: typeof raw.next === "string" ? raw.next.slice(0, 20) : null,
    fails: (Array.isArray(raw.fails) ? raw.fails : [])
      .filter(isRecord)
      .slice(0, 6)
      .map((fail) => ({
        ...(typeof fail.gone === "string" ? { gone: fail.gone.slice(0, 200) } : {}),
        ...(fail.late === true ? { late: true } : {}),
        then: typeof fail.then === "string" ? fail.then.slice(0, 20) : null,
      })),
    done: raw.done === true,
  };
  if (raw.branch === true) stage.branch = true;
  if (raw.end === "failed") stage.end = "failed";
  if (typeof raw.learn === "string") stage.learn = raw.learn.slice(0, 300);
  if (Number.isFinite(raw.by)) stage.by = raw.by;
  return stage;
}

/** One quest as saved, checked; null when it isn't usable. */
export function checkSavedQuest(raw) {
  if (!isRecord(raw) || typeof raw.id !== "string" || !STATES.includes(raw.state)) return null;
  const stages = (Array.isArray(raw.stages) ? raw.stages : []).map(checkStage).filter(Boolean).slice(0, 20);
  if (!stages.length) return null;
  const at = typeof raw.at === "string" && stages.some((stage) => stage.id === raw.at) ? raw.at : null;
  const open = raw.state === "active" || raw.state === "offered";
  const reward = isRecord(raw.reward) ? raw.reward : {};
  const quest = {
    id: raw.id.slice(0, 80),
    title: str(raw.title, 80) || "A quest",
    source: ["board", "person", "lore", "ai", "chain", "errand"].includes(raw.source) ? raw.source : "board",
    giver: typeof raw.giver === "string" ? raw.giver.slice(0, 200) : null,
    giverName: str(raw.giverName, 80),
    region: typeof raw.region === "string" ? raw.region.slice(0, 20) : "",
    parts: isRecord(raw.parts)
      ? Object.fromEntries(
          Object.entries(raw.parts)
            .filter(([, value]) => typeof value === "string")
            .map(([key, value]) => [key.slice(0, 20), value.slice(0, 120)]),
        )
      : {},
    intro: str(raw.intro, 600),
    done: str(raw.done, 400),
    reward: {
      coin: Math.max(0, Math.min(10000, Math.round(num(reward.coin)))),
      items: (Array.isArray(reward.items) ? reward.items : [])
        .filter((item) => isRecord(item) && typeof item.name === "string")
        .slice(0, 5)
        .map((item) => ({
          name: item.name.slice(0, 60),
          description: str(item.description, 300),
          quantity: Math.max(1, Math.round(num(item.quantity, 1))),
        })),
      standing:
        isRecord(reward.standing) && typeof reward.standing.faction === "string"
          ? {
              faction: reward.standing.faction.slice(0, 120),
              by: Math.max(-50, Math.min(50, Math.round(num(reward.standing.by)))),
            }
          : null,
      warmth: Math.max(0, Math.min(30, Math.round(num(reward.warmth)))),
    },
    stages,
    at: open ? (at ?? stages[0].id) : null,
    state: raw.state,
    owned: (Array.isArray(raw.owned) ? raw.owned : [])
      .filter((own) => isRecord(own) && own.kind === "captive" && typeof own.id === "string")
      .slice(0, 4)
      .map((own) => ({
        kind: "captive",
        id: own.id.slice(0, 120),
        name: str(own.name, 40),
        cave: Number.isFinite(own.cave) ? own.cave : null,
        region: str(own.region, 20),
        freed: own.freed === true,
      })),
    log: (Array.isArray(raw.log) ? raw.log : [])
      .filter((entry) => isRecord(entry) && typeof entry.text === "string")
      .slice(-30)
      .map((entry) => ({ at: num(entry.at), text: entry.text.slice(0, 400) })),
    since: num(raw.since),
    lore: str(raw.lore, 120),
    ai: raw.ai === true,
  };
  if (isRecord(raw.reserve) && typeof raw.reserve.key === "string")
    quest.reserve = {
      key: raw.reserve.key.slice(0, 20),
      kind: str(raw.reserve.kind, 20),
      faction: str(raw.reserve.faction, 120),
    };
  return quest;
}

/** The quests as saved (save.quests), checked: open ones all kept, finished ones the newest up to QUEST.KEPT. */
export function checkQuests(raw) {
  const all = (Array.isArray(raw) ? raw : []).map(checkSavedQuest).filter(Boolean);
  const open = all.filter((quest) => quest.state === "active" || quest.state === "offered");
  const over = all.filter((quest) => !open.includes(quest)).slice(-Math.max(0, QUEST.KEPT - open.length));
  const keep = new Set([...open, ...over]);
  return all.filter((quest) => keep.has(quest));
}

/** The parts of recent quests (save.questParts), checked. */
export function checkParts(raw) {
  return (Array.isArray(raw) ? raw : [])
    .filter(isRecord)
    .slice(-QUEST.PARTS)
    .map((parts) =>
      Object.fromEntries(
        ["archetype", "motive", "complication", "place", "reward"].map((key) => [key, str(parts[key], 120)]),
      ),
    );
}

// ── Pretend play, for the tests and for "Finish this stage" ─────────────────────

/** The event that would finish a quest's stage as it is now (for Debug → Finish this stage and the tests). */
export function finishingEvent(quest) {
  const stage = stageOf(quest);
  const goal = stage?.goal;
  if (!goal) return null;
  const have = goal.item ? { [String(goal.item).toLowerCase()]: goal.count } : {};
  switch (goal.verb) {
    case "talk":
      return { type: "talk", person: goal.person };
    case "bring":
      return { type: "talk", person: goal.person, have };
    case "go":
      return { type: "at", region: goal.region, zone: goal.place, x: goal.x, z: goal.z };
    case "gather":
      return { type: "have", have };
    case "defeat":
      return {
        type: "beat",
        kind: goal.creature,
        id: `lore:${spawnId(quest, stage)}:0`,
        region: goal.region,
        x: goal.x,
        z: goal.z,
      };
    case "deep":
      return { type: "deep", region: goal.region, cave: goal.cave, depth: goal.depth ?? 1 };
    case "rescue":
      return { type: "free", captive: goal.captive };
    case "region":
      return { type: "at", region: goal.region, zone: "", x: 0, z: 0 };
    case "choose":
      return {
        type: "choose",
        option: Math.max(
          0,
          goal.options.findIndex((option) => !option.fail),
        ),
      };
    default:
      return null;
  }
}

/**
 * Plays an accepted quest to its end in `world`, each stage done by the event that finishes it, except
 * the stages in `failAt`, which fail instead (and `choose` picks a wrong answer at a choice there).
 * Returns { quest, steps } (the stage ids passed through). Stops after 40 steps.
 */
export function simulateQuest(quest, world, { failAt = [] } = {}) {
  let now = quest;
  const steps = [];
  for (let n = 0; n < 40 && now.state === "active"; n++) {
    const stage = stageOf(now);
    steps.push(stage.id);
    if (failAt.includes(stage.id)) {
      if (stage.goal.verb === "choose") {
        const wrong = stage.goal.options.findIndex((option) => option.fail);
        now = questEvent(now, { type: "choose", option: wrong }, world).quest;
      } else {
        const why = stage.fails.find((fail) => fail.late) ? "late" : (stage.fails[0]?.gone ?? "");
        now = moveOn(now, "failed", world.now ?? 0, "", { failures: world.failures !== false, why });
      }
      continue;
    }
    const before = JSON.stringify(now);
    now = questEvent(now, finishingEvent(now), world).quest;
    // A hunt takes one blow per creature: the same event again until it's done.
    if (JSON.stringify(now) === before) break;
  }
  return { quest: now, steps };
}
