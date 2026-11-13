// What goes to the model with a message to the assistant, and the ready-made things to ask it. The world
// in full is a lot of text, most of it nothing to do with any one question, so each message takes only
// the parts it needs: a ready-made request names its own, and anything typed is read for what it's about.
// A short list of everyone, the groups and the factions always go. When the choice here falls short the
// model can ask for a part by name and is asked again with it (main.js askAssistant), so a wrong guess
// costs a second call, never a wrong answer. Plain data in, plain data out.

/** The parts that can be left out, and what each is called to the player and the model. */
export const PARTS = {
  people: "everyone in detail",
  relations: "relationships",
  places: "the places",
  days: "days and closing hours",
  here: "where you are",
  ties: "what lore is tied to",
  lore: "this world's own lore",
  board: "the noticeboard",
  help: "how Wanderworld works",
  ages: "ages",
  chat: "the recent chat",
  recaps: "scene recaps",
  memories: "what people remember",
};

/** What typed words are about: a part goes when one of its words is there. */
const TOPICS = [
  [
    ["people"],
    /\b(everyone|everybody|anyone|anybody|nobody|people|persons?|characters?|cast|townsfolk|villagers?|npcs?|who|whose|gaps?|missing|each)\b/u,
  ],
  [
    ["relations"],
    /\b(relationships?|relations?|related|married|marry|marries|wife|husband|spouse|partner|friends?|enem(y|ies)|rivals?|family|sister|brother|father|mother|son|daughter|parents?|child(ren)?|lovers?|loves?|hates?|feels?|mentor|colleague|knows?|likes?|dislikes?|trusts?|afraid|fears?|between)\b/u,
  ],
  [
    ["places"],
    /\b(places?|homes?|houses?|lives?|living|moves?|works?|jobs?|shops?|taverns?|inns?|smith(y|ies)|temples?|halls?|farms?|mills?|cottages?|where|rename|called|close[sd]?|opens?|hours|visits?|goes|streets?|square|ponds?|town|village|city|hamlet|buildings?|add|new|create|invent|populate|errand|scene|region|[a-z]+\d+)\b/u,
  ],
  [
    ["days"],
    /\b(days?|schedules?|routines?|mornings?|evenings?|nights?|hours?|close[sd]?|opens?|shifts?|sleeps?|when|time)\b/u,
  ],
  [["here", "ties"], /\b(lore|active|inactive|tied|ties?|why|entr(y|ies)|lorebooks?|here)\b/u],
  [
    ["lore"],
    /\b(lore|history|backstory|stor(y|ies)|legends?|rewrite|describe|description|premise|contradict\w*|consisten\w*|problems?)\b/u,
  ],
  [["board"], /\b(notices?|noticeboard|board|errands?|quests?|notes?|tasks?|pin(ned|s)?|rumou?rs?|news)\b/u],
  [
    ["help"],
    /\b(how (do|does|can|to|should|would)|what (is|are|does|do|can)|can (i|you|it)|wanderworld|keywords?|settings?|buttons?|journal|menu|help|explain|tutorial|features?|able to|possible)\b|ww:/u,
  ],
  [["ages"], /\b(ages?|aged|old|older|young|younger|years?|adults?|add|new|create|invent|populate)\b/u],
  [["memories"], /\b(memor(y|ies)|remembers?|remembered|forgets?|forgot(ten)?|recalls?)\b/u],
  [
    ["chat", "recaps"],
    /\b(happen(ed|ing|s)?|recaps?|lately|recent(ly)?|earlier|today|yesterday|just now|said|told|chat|conversations?|scenes?|remember|so far|last (time|night|scene)|events?)\b/u,
  ],
];

/** With nothing to go on, the parts most requests lean on (and none of the long ones). */
const USUAL = ["relations", "places", "board"];

/**
 * The parts a message needs. `texts` are the player's last messages, newest last (the one before rides
 * along, so "yes, do that" still has what it's about); `pick` a ready-made request's own parts; `more`
 * parts the model asked for. Returns a Set of PARTS keys.
 */
export function assistantNeeds(texts, pick = null, more = []) {
  const needs = new Set([...(pick?.needs ?? []), ...more].filter((part) => Object.hasOwn(PARTS, part)));
  if (pick) return needs;
  let found = false;
  for (const words of texts.slice(-2)) {
    const lower = String(words ?? "").toLowerCase();
    for (const [parts, pattern] of TOPICS)
      if (pattern.test(lower)) {
        found = true;
        for (const part of parts) needs.add(part);
      }
  }
  if (!found) for (const part of USUAL) needs.add(part);
  return needs;
}

/**
 * The ready-made request that `text` is, when it was typed and not picked: its label, how its request
 * begins, or the start it puts in the box. Null when it's none of them. (Ones that ask something first,
 * a lorebook or whose memories, are found by their label alone.)
 */
export function pickFor(text) {
  const plain = (words) =>
    String(words ?? "")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim();
  const typed = plain(text);
  if (typed.length < 6) return null;
  return (
    // (The longest start first: "Write lore for the faction " before "Write lore for ".)
    [...PICKS]
      .sort((one, other) => (other.fill ?? "").length - (one.fill ?? "").length)
      .find((pick) => {
        const label = plain(pick.label);
        const asks = plain(pick.ask ?? pick.request ?? "").slice(0, 48);
        const fill = plain(pick.fill ?? "");
        return (
          typed === label ||
          (label.length > 9 && typed.startsWith(label)) ||
          (asks.length > 20 && typed.startsWith(asks)) ||
          (fill && typed.startsWith(fill))
        );
      }) ?? null
  );
}

/** Which of `names` (whole, or a first name alone) the texts speak of, lower case in and out. */
export function mentioned(names, texts) {
  const words = texts.map((entry) => String(entry ?? "").toLowerCase()).join("\n");
  const has = (name) =>
    name.length > 1 &&
    new RegExp(`(^|[^\\p{L}\\p{N}])${name.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}($|[^\\p{L}\\p{N}])`, "u").test(
      words,
    );
  return names.filter((name) => {
    const lower = String(name ?? "")
      .toLowerCase()
      .trim();
    return lower && (has(lower) || has(lower.split(/\s+/u)[0]));
  });
}

/**
 * The ready-made requests: `label` on the button, `note` what it asks or does, then either `ask` (sent
 * as it is), `fill` (put in the box for the player to finish) or `picker` (a choice to make first; with
 * "memories" it's whose memories go, and `request` is what's then asked).
 * `common` ones are always in view; the rest are in the list. `needs` are the parts that go with it.
 */
export const PICKS = [
  {
    id: "gaps",
    label: "Fill in the gaps",
    common: true,
    note: "Finds people with no lore, home, work or relationships, and proposes what's missing.",
    ask: "Fill in the gaps in this world: find the people who have no lore, no home, no work, or no relationship with anyone, and propose what's missing for each, fitting what is already written. Leave alone what is already set.",
    needs: ["people", "relations", "places", "lore", "ages"],
  },
  {
    id: "check",
    label: "Check for problems",
    common: true,
    note: "Looks for contradictions: lore against relationships, two spouses, work at a closed place.",
    ask: "Check this world for contradictions and problems: lore that disagrees with a relationship, someone with two spouses, someone whose day has them working where it's closed then, anything else that doesn't add up. List what you find, plainly. Change nothing yet: I'll say which to fix.",
    needs: ["people", "relations", "places", "days", "lore"],
  },
  {
    id: "lately",
    label: "What's happened lately?",
    common: true,
    note: "A short recap, from the chat and the scenes you've played.",
    ask: "Recap what has happened in this world lately, from the chat and the scenes, in a few sentences.",
    needs: ["chat", "recaps"],
  },
  {
    id: "can",
    label: "What can you do?",
    common: true,
    note: "A list of what the assistant can help with, and how to ask.",
    ask: "What can you help me with here? Give me a short list, with an example of how to ask for each.",
    needs: ["help"],
  },
  {
    id: "notes",
    label: "Write noticeboard notes",
    note: "Proposes a few notes that fit the people and lore, and an errand if you have none.",
    ask: "Propose three or four notes for the noticeboard that fit this world's people, relationships and lore, each from someone who lives here, and one errand for me if I have none.",
    needs: ["people", "relations", "places", "lore", "board"],
  },
  {
    id: "place-lore",
    label: "Write lore for a place…",
    note: "Type the place after it. Written from who lives and works there.",
    fill: "Write lore for ",
    needs: ["people", "places", "lore"],
  },
  {
    id: "faction-lore",
    label: "Write lore for a faction…",
    note: "Type the faction after it. Written from who is in it; its members all know it.",
    fill: "Write lore for the faction ",
    needs: ["people", "relations", "lore"],
  },
  {
    id: "populate",
    label: "Add people to this region",
    note: "Invents a few people who live here only, each with a home, work and someone they know.",
    ask: "Add four new people to this region who fit it: each with a name, a description, a home here, work here, and a relationship or two with people already here or with each other.",
    needs: ["people", "relations", "places", "lore", "ages"],
  },
  {
    id: "about",
    label: "Tell me about someone…",
    note: "Type a name after it: what they're like, who they know, how they see you.",
    fill: "Tell me about ",
    needs: ["relations", "chat", "recaps"],
  },
  {
    id: "scene",
    label: "Suggest a scene",
    note: "Who, where and a premise that grows out of what's going on. Confirm starts it.",
    ask: "Suggest one scene I could play now: who is in it, where, and a premise of a sentence or two that grows out of the relationships, the lore and what has happened lately. Propose it as a scene.",
    needs: ["people", "relations", "places", "lore", "chat", "recaps"],
  },
  {
    id: "recap-changes",
    label: "Turn my last scene into changes",
    note: "Reads your newest scene recap and proposes what it changes: relationships, lore.",
    ask: "Read the recap of my last scene and propose the changes it implies for this world: relationships that changed, lore to add to, anything now out of date. Only what the recap supports.",
    needs: ["people", "relations", "lore", "recaps"],
  },
  {
    id: "why-lore",
    label: "Why isn't my lore active here?",
    note: "Says what lore is active where you stand, why, and what would change it.",
    ask: "Which lore is active where I'm standing, and why? What would I change to make other entries active here?",
    needs: ["here", "ties", "help"],
  },
  {
    id: "homeless",
    label: "Who has no home or work?",
    note: "Lists them, so you can ask for homes and work next.",
    ask: "List who has no home, and who has no work.",
    needs: [],
  },
  {
    id: "clear-board",
    label: "Clear the noticeboard",
    note: "Proposes taking down every pinned note.",
    ask: "Take down every note on the noticeboard.",
    needs: ["board"],
  },
  {
    id: "memory-check",
    label: "Check memories against the lore…",
    note: "Choose whose. Finds memories that contradict lore, cards or relationships, and proposes rewordings or deletions.",
    picker: "memories",
    request:
      "Review these people's memories against this world's lore, their cards and their relationships. Find the ones that are wrong, contradict what is written, or were garbled, and propose for each a rewording that sets it right, or its deletion if nothing of it holds. Say briefly why for each. Leave alone what is sound.",
    needs: ["memories", "people", "relations", "lore"],
  },
  {
    id: "memory-clean",
    label: "Clear out memories that don't matter…",
    note: "Choose whose. Proposes deleting small talk and passing sights nobody would remember, and keeps what matters.",
    picker: "memories",
    request:
      "Review these people's memories and propose deleting the ones that don't matter and could be cleaned out: small talk, passing sights, things with no bearing on who they are or how they stand with anyone. Keep what a person would really remember, and never propose deleting a pinned memory. Say in a line what you kept and why.",
    needs: ["memories", "relations"],
  },
  {
    id: "memory-repeats",
    label: "Find repeated memories…",
    note: "Choose whose. Finds memories that say the same thing twice, or disagree with each other, and proposes which to keep.",
    picker: "memories",
    request:
      "Look through these people's memories for ones that say the same thing more than once, and for ones that contradict each other. For repeats, propose deleting all but the best one (reword it if that makes it complete). For contradictions, say what disagrees and propose the fix that fits the lore and the newer memory.",
    needs: ["memories", "lore"],
  },
  {
    id: "memory-sum",
    label: "Sum up old memories…",
    note: "Choose whose. Proposes one lasting memory in place of several old everyday ones, so less is kept and sent.",
    picker: "memories",
    request:
      "For each of these people, find groups of older everyday memories that belong together (one evening, one journey, one quarrel) and propose replacing each group with a single new lasting memory that keeps what mattered, dated like the oldest of the group, and deleting the ones it replaces. Leave the last few days, lasting memories and pinned ones as they are.",
    needs: ["memories"],
  },
  {
    id: "memory-pin",
    label: "Suggest memories to pin…",
    note: "Choose whose. Picks the few memories that define how each person sees you and others, and proposes pinning them.",
    picker: "memories",
    request:
      "For each of these people, pick the few memories that matter most to who they are and how they stand with the player and others (three at most each), and propose pinning them so they are never pushed out. Say in a line why each.",
    needs: ["memories", "relations"],
  },
  {
    id: "keywords",
    label: "Draft ww: keywords for lorebook entries…",
    note: "Pick a lorebook and its entries: only those are sent. You get keys to copy into your lorebook (the assistant can't edit Engine lorebooks).",
    picker: "keywords",
    needs: ["places"],
  },
];
