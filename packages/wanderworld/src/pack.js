// The setting pack: everything about a setting that is words, not code. What the things standing about
// the world are and what can be done with them, what's said on arriving somewhere, what's noticed in
// passing, and the errands a noticeboard offers. This one is the fantasy village the kit's models make.
// A modern or science-fiction setting is another pack of the same shape (with its own models and
// bodies); nothing outside this file names a stall, a graveyard or a wolf.
//
// Every line here is also what's told when no AI is answering, so the world has something to say for
// itself. With AI on, a choice's `verb` is what the model is told the player does, and it writes the rest.
// In lines: {place} is where it happens, {time} the part of the day, {who} a person nearby.

/** A thing: `prompt` (on the E prompt), `title` (its card, when the place has no name), `reach` (metres), `choices`. */
const THINGS = {
  // A fire the player lights with "/camp": it stays until it's put out.
  campfire: {
    prompt: "Sit by the fire",
    title: "your campfire",
    reach: 2.6,
    choices: [
      {
        id: "sit",
        label: "Sit by the fire",
        verb: "sits by the campfire and watches it burn",
        lines: [
          "The fire settles, and the dark draws in to listen.",
          "Sparks go up and don't come down. The {time} is a good deal smaller with a fire in it.",
        ],
      },
      {
        id: "story",
        label: "Tell a story",
        verb: "tells a story by the campfire",
        lines: [
          "You tell it the way you were told it, and the fire puts in the pauses.",
          "It's a better story out here than it ever was indoors.",
        ],
      },
      {
        id: "douse",
        label: "Put it out",
        verb: "puts the campfire out and scatters the ashes",
        lines: [
          "A hiss, a last thread of smoke, and the place is only a place again.",
          "Cold ash. You were never here.",
        ],
      },
    ],
  },
  stall: {
    prompt: "Look over the stall",
    title: "a market stall",
    reach: 2.2,
    choices: [
      {
        id: "browse",
        label: "Browse",
        verb: "looks over what the stall has laid out",
        lines: [
          "Apples, onions, a wheel of cheese under a cloth. Everything smells of the cellar it came from.",
          "The trays hold more than they did yesterday: someone's cart came in this {time}.",
          "A hand-lettered slate lists prices that have been rubbed out and raised twice.",
        ],
      },
      {
        id: "haggle",
        label: "Haggle",
        verb: "haggles over a price at the stall",
        lines: [
          "You name a price. The silence that follows is itself an answer.",
          "A copper comes off, grudgingly, and something smaller goes into the bag than you pointed at.",
          "The trick, it turns out, is to start walking away. You get three steps.",
        ],
      },
      {
        id: "gossip",
        label: "Ask what's new",
        verb: "asks at the stall what the news is",
        lines: [
          "Nothing's new, you're told, at some length.",
          "Talk at the stalls this {time} is all about who was seen where they shouldn't have been.",
          "The news is the weather, and after the weather, everyone's opinion of it.",
        ],
      },
    ],
  },
  wagon: {
    prompt: "Look at the wagon",
    title: "a wagon",
    reach: 2.4,
    choices: [
      {
        id: "look",
        label: "Look it over",
        verb: "looks over the wagon and what it carries",
        lines: [
          "The axle's been mended with a different wood. Whatever it carried has left a ring of straw.",
          "Road dust to the hubs: this has come further than the next village.",
          "A tarpaulin is roped down tight over the load, with a knot nobody ties by accident.",
        ],
      },
      {
        id: "sit",
        label: "Sit on the tailboard",
        verb: "sits on the wagon's tailboard and watches the street",
        lines: [
          "From the tailboard the street is a slow river. Nobody minds you being part of the bank.",
          "The boards are warm. For a while {place} goes by without needing anything from you.",
        ],
      },
    ],
  },
  barrel: {
    prompt: "Look in",
    title: "barrels and crates",
    reach: 1.5,
    choices: [
      {
        id: "search",
        label: "Look inside",
        verb: "looks into the barrels and crates stacked there",
        lines: [
          "Rainwater, and your own face looking back up.",
          "Empty, but for a smell of apples that hasn't gone anywhere.",
          "Straw, a split cork, and a button that isn't yours.",
          "Packed and nailed. Someone expects this to travel.",
        ],
      },
      {
        id: "knock",
        label: "Rap on it",
        verb: "raps on a barrel to hear what's in it",
        lines: ["It answers full.", "Hollow. The echo is the most interesting thing in it."],
      },
    ],
  },
  farm: {
    prompt: "Look round the farm",
    title: "the farm",
    reach: 7,
    choices: [
      {
        id: "fields",
        label: "Walk the fields",
        verb: "walks along the edge of the fields",
        lines: [
          "The rows run straight until the ground stops letting them. Crows keep the count.",
          "Someone has been at the far strip since first light: the furrows are still dark.",
          "The {time} lies flat and gold on the stubble.",
        ],
      },
      {
        id: "help",
        label: "Lend a hand",
        verb: "lends a hand with the farm work",
        lines: [
          "An hour of it, and your hands know something your head had forgotten.",
          "You are given the job nobody wanted, and thanked as if you'd chosen it.",
        ],
      },
      {
        id: "animals",
        label: "See to the animals",
        verb: "leans on the fence to look over the animals",
        lines: [
          "They look you over in turn, come to a conclusion, and go back to the grass.",
          "The trough's full and the gate's shut. Somebody here is careful.",
        ],
      },
    ],
  },
  graveyard: {
    prompt: "Walk among the graves",
    title: "the graveyard",
    reach: 7,
    choices: [
      {
        id: "read",
        label: "Read the stones",
        verb: "reads the names on the gravestones",
        lines: [
          "The same four family names, over and over, and one stone with none at all.",
          "The oldest stones have gone back to being stones. The newest still has flowers.",
          "A whole row from one winter. Nobody in {place} talks about that winter.",
        ],
      },
      {
        id: "flowers",
        label: "Leave flowers",
        verb: "leaves a few picked flowers on a grave",
        lines: [
          "You leave them on one nobody else seems to visit.",
          "It's a small thing. The grass seems to lean toward it anyway.",
        ],
      },
      {
        id: "sit",
        label: "Sit a while",
        verb: "sits quietly among the graves",
        lines: ["It is the quietest company you've kept all day.", "The wind goes through, reading everyone's name."],
      },
    ],
  },
  stones: {
    prompt: "Go up to the stones",
    title: "the standing stones",
    reach: 7,
    choices: [
      {
        id: "touch",
        label: "Lay a hand on one",
        verb: "lays a hand on one of the standing stones",
        lines: [
          "Cold, even now. Colder than the day has any right to make it.",
          "The moss comes away under your palm, and the stone beneath is carved.",
          "Nothing happens. You find you were braced for something.",
        ],
      },
      {
        id: "circle",
        label: "Walk the ring",
        verb: "walks round the ring of standing stones",
        lines: [
          "You count them twice and get two different numbers.",
          "From the middle, every gap frames something: a hill, a notch, a single far tree.",
        ],
      },
      {
        id: "listen",
        label: "Listen",
        verb: "stands still among the stones and listens",
        lines: ["Wind, mostly. Mostly.", "The birds have stopped. They start again when you breathe out."],
      },
    ],
  },
  mill: {
    prompt: "Watch the mill",
    title: "the mill",
    reach: 7,
    choices: [
      {
        id: "wheel",
        label: "Watch the wheel",
        verb: "watches the mill wheel turn",
        lines: [
          "It turns as it has all your life and will after. The water doesn't mind the work.",
          "One paddle is newer than the rest and comes round like a clean tooth.",
        ],
      },
      {
        id: "flour",
        label: "Ask after flour",
        verb: "asks at the mill about flour",
        lines: [
          "There's flour on everything here, including the answer you're given.",
          "Come back after the next grinding, you're told, and bring your own sack.",
        ],
      },
    ],
  },
  pond: {
    prompt: "Go down to the water",
    title: "the pond",
    reach: 7,
    choices: [
      {
        id: "skip",
        label: "Skip a stone",
        verb: "skips a flat stone across the pond",
        lines: ["Four. A personal best, and nobody saw.", "It sinks at once, with what sounds like an opinion."],
      },
      {
        id: "fish",
        label: "Watch for fish",
        verb: "crouches at the edge to watch for fish",
        lines: [
          "A shape the length of your arm turns under the lilies and is gone.",
          "Rings, where something came up for the {time}'s first flies.",
        ],
      },
      {
        id: "rest",
        label: "Rest by the water",
        verb: "rests by the water",
        lines: ["The reeds do the talking.", "A dragonfly inspects you and moves on."],
      },
    ],
  },
  watchtower: {
    prompt: "Look up at the tower",
    title: "the watchtower",
    reach: 7,
    choices: [
      {
        id: "climb",
        label: "Climb up",
        verb: "climbs the watchtower to look out",
        lines: [
          "From the top, {place} is a handful of roofs, and the road a thread somebody dropped.",
          "The stair gives out before the top does. The view from the last sound step is enough.",
        ],
      },
      {
        id: "search",
        label: "Look round the foot",
        verb: "searches round the foot of the watchtower",
        lines: [
          "A cold fire ring, not so old. Somebody still keeps watch from here.",
          "Initials cut in the door, and a tally of days beside them.",
        ],
      },
    ],
  },
  ruins: {
    prompt: "Step into the ruins",
    title: "the ruins",
    reach: 7,
    choices: [
      {
        id: "search",
        label: "Search the rubble",
        verb: "searches through the rubble of the ruins",
        lines: [
          "A hearthstone, still black. A doorstep worn by feet that had somewhere to be.",
          "Under the ivy there's a carving, the face rubbed off on purpose.",
          "Nothing worth carrying. Something worth remembering, maybe.",
        ],
      },
      {
        id: "sit",
        label: "Sit in what's left",
        verb: "sits inside the roofless walls",
        lines: ["The room is still a room, if you don't look up.", "Swallows have the tenancy now."],
      },
    ],
  },
};

/** Joining someone in what they're doing, by what that is: a choice when talking to them. {who} is them. */
const JOINING = {
  work: {
    label: "Lend them a hand",
    verb: "lends {who} a hand with their work",
    lines: [
      "{who} finds you something to carry. It turns out there is always something to carry.",
      "You work alongside {who} a while. Little is said; it doesn't need to be.",
    ],
  },
  eat: {
    label: "Join them to eat",
    verb: "sits down to eat with {who}",
    lines: [
      "{who} makes room and pushes the bread your way.",
      "You eat with {who}. The talk comes easier with something on the table.",
    ],
  },
  sit: {
    label: "Sit with them",
    verb: "sits down beside {who}",
    lines: ["{who} shifts along. For a while you both watch {place} go by.", "You sit with {who}, in no hurry."],
  },
  other: {
    label: "Keep them company",
    verb: "keeps {who} company for a while",
    lines: ["You fall in beside {who} for a while.", "{who} seems glad enough of the company."],
  },
};

/** Told the first time the player comes to a kind of place, when it has no lore of its own to tell. */
const ARRIVALS = {
  town: {
    quiet: ["{place}. Smoke from the chimneys, and nobody about to see you come in."],
    busy: ["{place}. Smoke from the chimneys, and somebody's dog announcing you."],
  },
  plaza: {
    quiet: [
      "The square lies open and empty, the {time} to itself.",
      "Nobody in the square. Your steps sound larger than they are.",
    ],
    busy: ["The square opens out, and with it the {time}'s business."],
  },
  street: [],
  forest: [
    "Under the trees the light goes green and the road's noise falls away behind you.",
    "The wood takes you in without comment.",
  ],
  mountains: ["The ground steepens, and the wind has the smell of stone in it."],
  river: ["Water, moving the way it has always moved through {place}."],
  cave: ["Cold air breathes out of the dark, steady as something asleep."],
  meadow: ["Long grass, loud with insects."],
  garden: [],
  farm: ["Turned earth and woodsmoke: a working farm."],
  graveyard: ["A low wall, a leaning gate, and the quiet that goes with them."],
  stones: ["The stones stand as they were left, by nobody anyone remembers."],
  mill: ["You hear the wheel before you see it."],
  pond: ["Still water, and the sky lying in it."],
  watchtower: ["The tower watches the road, whether or not anyone's in it."],
  ruins: ["Walls with nothing to hold up."],
  inn: ["A lit window by the road: an inn."],
  cottage: ["A cottage, keeping to itself."],
  hamlet: ["A few roofs gathered round a well-trodden yard."],
  tavern: {
    quiet: ["Warmth, a banked fire, and nobody at the tables."],
    busy: ["Warmth, voices, and the smell of whatever's in the pot."],
  },
  smithy: ["Heat rolls out of the door, and the ring of a hammer."],
  temple: ["Cool stone, and voices kept low."],
  shop: [],
  hall: [],
  home: [],
};

/** Noticed in passing now and then, about someone close by: {who} and what they're doing ({doing}). */
const SIGHTS = ["{who} is {doing}.", "Not far off, {who} is {doing}.", "You pass {who}, {doing}."];

/** A note for the noticeboard that asks for something: taken down, it's an errand to {person} at {place}. */
const ERRANDS = [
  {
    text: "A parcel wants carrying to {person}, at {place}. Thanks, and something for your trouble.",
    done: "{person} takes the parcel, weighs it, and looks at you properly for the first time.",
  },
  {
    text: "Would whoever passes {place} tell {person} their order is ready?",
    done: "{person} hears you out and is gone to fetch it almost before you finish.",
  },
  {
    text: "{person} has been asking after a lost glove. Found one. Bring word to {place}.",
    done: "It is the right glove. {person} puts it straight on, as if it might get away again.",
  },
  {
    text: "Someone to look in on {person} at {place}. They've not been seen this while.",
    done: "{person} is well enough, and gladder of the visit than they let on.",
  },
];

/** Told when the player makes camp. */
const CAMP = [
  "You clear a ring, find dry wood, and after the usual argument with it, have a fire.",
  "The fire takes. {place} looks different with a light of your own in it.",
];

export const PACK = {
  id: "fantasy",
  things: THINGS,
  arrivals: ARRIVALS,
  sights: SIGHTS,
  errands: ERRANDS,
  joining: JOINING,
  camp: CAMP,
};

/** Which kind of thing a prop the town places is, by its model's name; undefined for plain clutter. */
export const PROP_THINGS = {
  "stall-empty": "stall",
  "prop-wagon": "wagon",
  barrel: "barrel",
  "barrel-apples": "barrel",
  "crate-wooden": "barrel",
};

/** A small number from a string, the same each time. */
function hash(text) {
  let value = 0;
  for (const char of String(text)) value = (value * 31 + char.charCodeAt(0)) | 0;
  return Math.abs(value);
}

/** One of `lines`, the same for the same `key` (a place and a day, say), with its {words} filled from `words`. */
export function pickLine(lines, key, words = {}) {
  if (!lines?.length) return "";
  return lines[hash(key) % lines.length].replace(/\{(\w+)\}/gu, (whole, name) => words[name] ?? whole);
}

/** What's told when the player does `choice` with a thing of `kind` and no AI answers; "" when there's nothing. */
export function thingLine(kind, choice, key, words) {
  return pickLine(PACK.things[kind]?.choices.find((entry) => entry.id === choice)?.lines, key, words);
}

/**
 * What's told on coming to a kind of place. A kind can have lines for when people are about (`busy`)
 * and for when nobody is, so an empty square isn't called bustling.
 */
export function arrivalLine(kind, key, words, busy = false) {
  const lines = PACK.arrivals[kind];
  return pickLine(Array.isArray(lines) ? lines : lines?.[busy ? "busy" : "quiet"], key, words);
}

/**
 * The errand a noticeboard offers for `key` (the world, and how many are done already): to one of
 * `people` ([{ id, name, place: { id, name } }], `place` being where they're usually found). The same
 * for the same key; null with nobody to send the player to.
 */
export function errandFor(key, people) {
  if (!people.length) return null;
  const person = people[hash(`who${key}`) % people.length];
  const errand = PACK.errands[hash(`what${key}`) % PACK.errands.length];
  const fill = (text) => text.replaceAll("{person}", person.name).replaceAll("{place}", person.place.name);
  return {
    id: `errand-${hash(key)}`,
    person: person.id,
    place: person.place.id,
    text: fill(errand.text),
    done: fill(errand.done),
  };
}
