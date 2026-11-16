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
    label: "Spend some time with them",
    verb: "keeps {who} company for a while",
    lines: ["You fall in beside {who} for a while.", "{who} seems glad enough of the company."],
  },
};

/**
 * What people do at the places the world makes for it (world.js spots; the clips are clips.js ACTS):
 * `doing` is what's said of someone at it, `calls` what they say aloud now and then.
 */
const ACTS = {
  hammer: {
    doing: "hammering at the anvil in the open forge",
    calls: ["Mind the sparks.", "Hot work, this.", "Nearly there."],
  },
  craft: { doing: "working at the forge's bench", calls: ["Where did I put the tongs?"] },
  farm: { doing: "working in the field", calls: ["The weeds never rest.", "Good soil, this."] },
  tend: { doing: "kneeling at the flower beds, tending them", calls: ["There. That's better."] },
  vend: {
    doing: "minding a market stall",
    calls: [
      "Fresh this morning!",
      "Have a look. No charge for looking.",
      "Best in {place}, and that's a promise.",
      "Apples! Carrots! Get them while they're crisp!",
    ],
  },
  browse: {
    doing: "looking over a stall's goods",
    calls: ["How much for these?", "Hm. And that one?", "I'll think about it."],
  },
  ground: { doing: "sitting on the ground, taking it easy", calls: [] },
  drink: { doing: "sitting with a drink in hand", calls: ["Here's to that.", "Pass it round."] },
  lie: { doing: "lying in the grass", calls: [] },
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

/** Sleeping in a tent: what's told on waking, by how long it was ({hours}) and the hour it is now ({clock}). */
/** A hostile animal near the player: squaring up to them, and running in ({kind}: "wolf"). */
const BEASTS = {
  threat: [
    "A {kind} stands a few paces off, head low, watching you.",
    "A {kind} has seen you. It comes no closer, and it doesn't leave.",
    "Hackles up, a {kind} holds its ground in front of you.",
  ],
  attack: [
    "A {kind} lunges and snaps; you stumble back a step.",
    "The {kind} comes in fast, teeth first. You get clear of it, just.",
    "A {kind} goes for you and you throw yourself back out of its way.",
  ],
};

/**
 * What each creature is in a fight (combat.js): its HP, AC, what it adds to its attack roll, its damage,
 * the experience for beating it, and how its attack is told ("The wolf snaps at you"). `default` is for
 * any kind not listed. A bigger one of its kind has more HP and hits harder.
 */
const FOES = {
  default: { hp: 6, ac: 11, attack: 2, damage: "1d4", xp: 5, verb: "strikes" },
  // (One of the townsfolk, or anyone with a name: struck only where the player has allowed it.)
  person: { hp: 10, ac: 10, attack: 2, damage: "1d4", xp: 0, verb: "swings" },
  wolf: { hp: 11, ac: 13, attack: 4, damage: "2d4", xp: 15, verb: "snaps" },
  // (The peaceful ones run when struck; these are for one that's cornered, or that lore has made hostile.)
  deer: { hp: 8, ac: 13, attack: 2, damage: "1d4", xp: 5, verb: "kicks out" },
  stag: { hp: 13, ac: 13, attack: 4, damage: "1d6+1", xp: 10, verb: "lowers its antlers" },
  fox: { hp: 5, ac: 13, attack: 3, damage: "1d4", xp: 4, verb: "snaps" },
  horse: { hp: 19, ac: 10, attack: 4, damage: "2d4+2", xp: 10, verb: "kicks out" },
  donkey: { hp: 11, ac: 10, attack: 2, damage: "1d4+2", xp: 5, verb: "kicks out" },
  cow: { hp: 15, ac: 10, attack: 3, damage: "1d6+2", xp: 5, verb: "butts" },
  bull: { hp: 19, ac: 10, attack: 5, damage: "1d8+3", xp: 12, verb: "charges" },
  alpaca: { hp: 9, ac: 10, attack: 2, damage: "1d4", xp: 4, verb: "kicks out" },
  husky: { hp: 8, ac: 12, attack: 3, damage: "1d6", xp: 5, verb: "snaps" },
  shiba: { hp: 5, ac: 12, attack: 2, damage: "1d4", xp: 3, verb: "snaps" },
  slime: { hp: 8, ac: 8, attack: 2, damage: "1d6", xp: 8, verb: "lunges" },
  skeleton: { hp: 13, ac: 13, attack: 4, damage: "1d6+2", xp: 15, verb: "swings" },
  spider: { hp: 7, ac: 12, attack: 4, damage: "1d6", xp: 10, verb: "bites" },
  rat: { hp: 4, ac: 10, attack: 2, damage: "1d4", xp: 4, verb: "bites" },
  snake: { hp: 5, ac: 12, attack: 3, damage: "1d4+1", xp: 6, verb: "strikes" },
  bat: { hp: 4, ac: 12, attack: 2, damage: "1d4", xp: 4, verb: "swoops" },
  wasp: { hp: 5, ac: 13, attack: 3, damage: "1d4", xp: 5, verb: "darts" },
  frog: { hp: 6, ac: 10, attack: 2, damage: "1d4", xp: 5, verb: "lunges" },
  dragon: { hp: 90, ac: 17, attack: 8, damage: "2d10+4", xp: 300, verb: "snaps" },
  bandit: { hp: 11, ac: 12, attack: 3, damage: "1d6+1", xp: 15, verb: "swings" },
  witch: { hp: 14, ac: 11, attack: 3, damage: "1d8", xp: 25, verb: "lashes out" },
  wizard: { hp: 16, ac: 12, attack: 4, damage: "1d10", xp: 30, verb: "lashes out" },
  imp: { hp: 8, ac: 13, attack: 4, damage: "1d4+2", xp: 12, verb: "claws" },
  puglin: { hp: 9, ac: 12, attack: 3, damage: "1d6+1", xp: 12, verb: "swings" },
};
/**
 * What's had from each creature once it's beaten (combat.js spoilsOf): an animal is harvested, a person
 * searched. Each thing: its name, a description, how many (a number or [least, most]) and, for what isn't
 * always there, a chance. `coins`: [least, most] of the world's money. A kind not listed gives nothing.
 */
const meat = (name, heals) => ({ name, description: `Raw meat, better cooked. +${heals} HP when eaten.` });
const SPOILS = {
  wolf: {
    items: [
      { name: "Wolf pelt", description: "A thick grey pelt." },
      { ...meat("Wolf meat", 2), quantity: [1, 2] },
    ],
  },
  deer: {
    items: [
      { name: "Deer hide", description: "A soft hide, good for leather." },
      { ...meat("Venison", 4), quantity: [1, 3] },
    ],
  },
  stag: {
    items: [
      { name: "Deer hide", description: "A soft hide, good for leather." },
      { ...meat("Venison", 4), quantity: [2, 3] },
      { name: "Antler", description: "A branching antler.", quantity: [1, 2] },
    ],
  },
  fox: { items: [{ name: "Fox pelt", description: "A russet pelt with a white tip." }] },
  cow: {
    items: [
      { name: "Cowhide", description: "A heavy hide." },
      { ...meat("Beef", 4), quantity: [2, 4] },
    ],
  },
  bull: {
    items: [
      { name: "Cowhide", description: "A heavy hide." },
      { ...meat("Beef", 4), quantity: [2, 4] },
    ],
  },
  horse: { items: [{ name: "Horsehide", description: "A big, tough hide." }] },
  donkey: { items: [{ name: "Horsehide", description: "A big, tough hide." }] },
  alpaca: { items: [{ name: "Wool", description: "A soft fleece.", quantity: [1, 2] }] },
  slime: { items: [{ name: "Slime jelly", description: "A cold, quivering lump. It keeps." }] },
  skeleton: { items: [{ name: "Old bone", description: "A dry bone.", quantity: [1, 2] }], coins: [0, 4] },
  spider: { items: [{ name: "Spider silk", description: "A skein of strong, sticky thread." }] },
  rat: { items: [{ name: "Rat tail", description: "Somebody will pay for these.", chance: 0.6 }] },
  snake: { items: [{ name: "Snake skin", description: "A patterned skin." }] },
  bat: { items: [{ name: "Bat wing", description: "A leathery wing.", chance: 0.7 }] },
  wasp: { items: [{ name: "Giant sting", description: "A sting as long as a finger.", chance: 0.7 }] },
  frog: { items: [{ ...meat("Frog legs", 2), quantity: 1 }] },
  dragon: {
    items: [{ name: "Dragon scale", description: "A scale the size of a plate.", quantity: [2, 4] }],
    coins: [40, 120],
  },
  imp: { items: [{ name: "Imp horn", description: "A small curled horn.", chance: 0.7 }], coins: [0, 5] },
  puglin: { items: [{ name: "Tusk", description: "A yellowed tusk.", chance: 0.7 }], coins: [0, 6] },
  bandit: {
    items: [{ name: "Knife", description: "A plain belt knife. Weapon: 1d4 damage.", chance: 0.5 }],
    coins: [2, 12],
  },
  witch: {
    items: [{ name: "Healing herb", description: "A soft-leaved herb for wounds. +5 HP when used.", quantity: [1, 2] }],
    coins: [0, 8],
  },
  wizard: {
    items: [{ name: "Mana potion", description: "A blue draught. +10 Mana when drunk.", chance: 0.6 }],
    coins: [3, 15],
  },
};

/**
 * Spells the player can put on their sheet with one button (Inventory → Sheet): a name and a description
 * that says what it does by rule (combat.js spellIn). They're the player's own from then on, to rewrite.
 */
const SPELLS = [
  { name: "Fire bolt", about: "A dart of flame. 2 mana. 1d10 fire damage." },
  { name: "Frost burst", about: "A burst of cold. 3 mana. 2d6 cold damage. Dexterity save for half." },
  { name: "Daze", about: "A word that stops a mind. 2 mana. Wisdom save or stunned 6 seconds." },
  { name: "Dread", about: "A shadow of fear. 2 mana. Wisdom save or frightened." },
  { name: "Mend", about: "Knits a wound. 3 mana. +8 HP." },
];

/** What's told when the player's HP runs out, and when they come to ({who}). */
const FIGHT = {
  down: "{who} goes down, and everything goes dark.",
  here: "{who} comes to where they fell, sore and alone. Whatever it was has gone.",
  home: "{who} wakes at home, sore, with no memory of the way back.",
  square: "{who} wakes by the market, sore, with no memory of the way back.",
};

/** The same of a hostile person (a bandit, a witch, a wizard: {kind}). */
const OUTLAWS = {
  threat: [
    "A {kind} steps into your way, a few paces off, and looks you over.",
    "A {kind} has seen you, and stands watching, one hand ready.",
    "\u201cThat's far enough,\u201d says a {kind}, not moving out of your path.",
  ],
  attack: [
    "The {kind} comes at you; you stumble back a step, out of reach.",
    "A {kind} swings for you. You get clear of it, just.",
    "The {kind} rushes in and you throw yourself back out of the way.",
  ],
};

const SLEEP = [
  "You sleep. When you wake it's {clock}, and the fire has burned low.",
  "{hours} later you crawl out of the tent. It's {clock}.",
  "You wake stiff, rested, and unsure for a moment where you are. It's {clock}.",
];

/** The animals, in words: what each is called ("the horse"), for a prompt or a line about it; and a
 *  horse's coat, said before it ("the grey horse"). */
const COATS = {
  bay: "bay",
  white: "white",
  black: "black",
  grey: "grey",
  chestnut: "chestnut",
  palomino: "palomino",
  brown: "brown",
  red: "red",
  cream: "cream",
};
/** What lore says of someone with a dog of their own ("her old hound", "has a dog"). */
/** And of someone with a horse of their own ("his grey mare", "rides a horse"). */
const HORSE_LORE =
  /\b(?:his|her|their|has an?|have an?|owns? an?|keeps? an?|rides? an?|loyal|faithful|trusty)\s+(?:[\w'-]+\s+){0,2}(?:horse|mare|stallion|gelding|steed|pony|charger|destrier|palfrey)\b/iu;
const DOG_LORE =
  /\b(?:his|her|their|has an?|have an?|owns? an?|keeps? an?|pet|loyal|faithful|trusty)\s+(?:[\w'-]+\s+){0,2}(?:dog|hound|puppy|pup|mutt|mastiff|wolfhound|sheepdog)\b/iu;
const ANIMALS = {
  horse: "the horse",
  donkey: "the donkey",
  cow: "the cow",
  bull: "the bull",
  alpaca: "the alpaca",
  deer: "the deer",
  stag: "the stag",
  wolf: "the wolf",
  fox: "the fox",
  husky: "the dog",
  shiba: "the dog",
  slime: "the slime",
  skeleton: "the skeleton",
  spider: "the giant spider",
  rat: "the giant rat",
  snake: "the snake",
  bat: "the bat",
  wasp: "the giant wasp",
  frog: "the giant frog",
  dragon: "the dragon",
  imp: "the imp",
  bandit: "the bandit",
  witch: "the witch",
  wizard: "the wizard",
  puglin: "the puglin",
};

/**
 * What gathering finds (gather.js): for each kind a list, the commoner things first; foraging by season.
 * A description that says "+N HP" is what eating it gives (sheet.js reads it when the thing is used).
 * `lines`: what's said when something is found ({who}, {what}), when nothing is, and when the spot is spent.
 */
const GATHER = {
  fish: [
    { name: "River trout", description: "A fresh fish. +4 HP when eaten." },
    { name: "Perch", description: "A small striped fish. +3 HP when eaten." },
    { name: "Pike", description: "A long, toothy fish, enough for two. +6 HP when eaten." },
    { name: "Old boot", description: "Somebody's boot, a long time in the water." },
  ],
  chop: [
    { name: "Firewood", description: "A split log, good for a fire." },
    { name: "Kindling", description: "A bundle of dry sticks." },
    { name: "Straight branch", description: "A straight length of wood, fit for a handle or a staff." },
  ],
  forage: {
    spring: [
      { name: "Fallen branch", description: "A sound length of fallen wood: a handle, a pole, a start." },
      { name: "Plant fibre", description: "Tough stems that twist into cord." },
      { name: "Flint", description: "A nodule of flint, for sparks and edges." },
      { name: "Wild garlic", description: "Broad green leaves with a sharp smell. +1 HP when eaten." },
      { name: "Morel", description: "A honeycombed spring mushroom. +2 HP when eaten." },
      { name: "Healing herb", description: "A soft-leaved herb for wounds. +5 HP when used." },
    ],
    summer: [
      { name: "Fallen branch", description: "A sound length of fallen wood: a handle, a pole, a start." },
      { name: "Plant fibre", description: "Tough stems that twist into cord." },
      { name: "Flint", description: "A nodule of flint, for sparks and edges." },
      { name: "Wild berries", description: "A handful of ripe berries. +2 HP when eaten." },
      { name: "Field mushroom", description: "A plain white mushroom. +2 HP when eaten." },
      { name: "Healing herb", description: "A soft-leaved herb for wounds. +5 HP when used." },
      { name: "Bird's egg", description: "A small speckled egg. +2 HP when eaten." },
    ],
    fall: [
      { name: "Fallen branch", description: "A sound length of fallen wood: a handle, a pole, a start." },
      { name: "Plant fibre", description: "Tough stems that twist into cord." },
      { name: "Flint", description: "A nodule of flint, for sparks and edges." },
      { name: "Hazelnuts", description: "A pocketful of nuts. +2 HP when eaten." },
      { name: "Crab apples", description: "Small sour apples. +2 HP when eaten." },
      { name: "Chanterelle", description: "A golden autumn mushroom. +3 HP when eaten." },
      { name: "Healing herb", description: "A soft-leaved herb for wounds. +5 HP when used." },
    ],
    // (Winter: nothing grows, but what tools are made of can still be found.)
    winter: [
      { name: "Fallen branch", description: "A sound length of fallen wood: a handle, a pole, a start." },
      { name: "Flint", description: "A nodule of flint, for sparks and edges." },
      { name: "Plant fibre", description: "Tough stems that twist into cord." },
    ],
  },
  mine: [
    { name: "Stone", description: "A good squared lump of stone." },
    { name: "Flint", description: "A nodule of flint, for sparks and edges." },
    { name: "Iron ore", description: "Rusty, heavy rock a smith can use." },
    { name: "Copper ore", description: "Green-streaked rock." },
    { name: "Rough gem", description: "An uncut stone with colour in it." },
  ],
  harvest: [
    { name: "Turnips", description: "A few turnips. +2 HP when eaten." },
    { name: "Wheat sheaf", description: "A bound sheaf of wheat, for a miller." },
    { name: "Apples", description: "Sound eating apples. +3 HP when eaten." },
    { name: "Cabbage", description: "A firm head of cabbage. +2 HP when eaten." },
  ],
  lines: {
    fish: {
      found: "{who} casts a line and lands {what}.",
      none: "{who} casts a line. Nothing bites.",
      spent: "The fish here have been put off for today. Try further along, or tomorrow.",
    },
    chop: {
      found: "{who} sets to the tree with an axe and comes away with {what}.",
      none: "{who} swings at the tree and gets nothing worth carrying.",
      spent: "The good wood here is taken. Try a little further on, or another day.",
      down: "The tree comes down.",
    },
    forage: {
      found: "{who} searches the undergrowth and finds {what}.",
      none: "{who} searches the undergrowth and finds nothing fit to keep.",
      spent: "This patch has been picked over. Try a little further on, or another day.",
    },
    mine: {
      found: "{who} works at the rock and prises out {what}.",
      none: "{who} works at the rock and gets only dust.",
      spent: "This rock is worked out for now. Try another, or come back another day.",
    },
    harvest: {
      found: "{who} works along the rows and gathers {what}.",
      none: "{who} works along the rows. Nothing here is ready.",
      spent: "These rows are picked. Try further along, or another day.",
    },
  },
};

/**
 * What can be made (craft.js): `needs` by name, `makes` how many, `level` the character level it comes at
 * (1 when not given). A tool's description says what it's for; one that can be swung says what it does
 * as a weapon, for when there are fights. The first of each tool is made only of what foraging finds.
 */
const RECIPES = [
  {
    id: "stone-axe",
    name: "Stone axe",
    description: "A flint head bound to a branch. Tool: chops wood. Weapon: 1d6 damage.",
    needs: [
      { name: "Fallen branch", quantity: 1 },
      { name: "Flint", quantity: 1 },
      { name: "Plant fibre", quantity: 1 },
    ],
  },
  {
    id: "stone-pickaxe",
    name: "Stone pickaxe",
    description: "Two flints lashed across a branch. Tool: mines rock. Weapon: 1d6 damage.",
    needs: [
      { name: "Fallen branch", quantity: 1 },
      { name: "Flint", quantity: 2 },
      { name: "Plant fibre", quantity: 1 },
    ],
  },
  {
    id: "fishing-rod",
    name: "Fishing rod",
    description: "A springy branch with a twisted line. Tool: catches fish.",
    needs: [
      { name: "Fallen branch", quantity: 1 },
      { name: "Plant fibre", quantity: 2 },
    ],
  },
  {
    id: "cord",
    name: "Cord",
    description: "A length of twisted cord.",
    needs: [{ name: "Plant fibre", quantity: 2 }],
  },
  {
    id: "kindling",
    name: "Kindling",
    description: "A bundle of dry sticks.",
    makes: 2,
    needs: [{ name: "Firewood", quantity: 1 }],
  },
  {
    id: "torch",
    name: "Torch",
    description: "A branch wound with fibre, to burn for an hour.",
    needs: [
      { name: "Fallen branch", quantity: 1 },
      { name: "Plant fibre", quantity: 1 },
    ],
  },
  {
    id: "cooked-trout",
    name: "Cooked trout",
    description: "A trout cooked over a fire. +8 HP when eaten.",
    needs: [
      { name: "River trout", quantity: 1 },
      { name: "Firewood", quantity: 1 },
    ],
  },
  {
    id: "cooked-perch",
    name: "Cooked perch",
    description: "A perch cooked over a fire. +6 HP when eaten.",
    needs: [
      { name: "Perch", quantity: 1 },
      { name: "Firewood", quantity: 1 },
    ],
  },
  {
    id: "cooked-pike",
    name: "Cooked pike",
    description: "A pike cooked over a fire, enough for two. +12 HP when eaten.",
    makes: 2,
    needs: [
      { name: "Pike", quantity: 1 },
      { name: "Firewood", quantity: 1 },
    ],
  },
  {
    id: "poultice",
    name: "Herbal poultice",
    description: "Crushed herbs bound in fibre. +12 HP when used.",
    level: 2,
    needs: [
      { name: "Healing herb", quantity: 2 },
      { name: "Plant fibre", quantity: 1 },
    ],
  },
  {
    id: "staff",
    name: "Quarterstaff",
    description: "A straight, balanced length of wood. Weapon: 1d6 damage.",
    level: 2,
    needs: [{ name: "Straight branch", quantity: 1 }],
  },
  {
    id: "iron-ingot",
    name: "Iron ingot",
    description: "Iron smelted out of its ore.",
    level: 3,
    needs: [
      { name: "Iron ore", quantity: 2 },
      { name: "Firewood", quantity: 2 },
    ],
  },
  {
    id: "iron-axe",
    name: "Iron axe",
    description: "A forged head on a straight haft. Tool: chops wood, +2 gathering. Weapon: 1d8 damage, +1 to attack.",
    level: 4,
    needs: [
      { name: "Iron ingot", quantity: 2 },
      { name: "Straight branch", quantity: 1 },
    ],
  },
  {
    id: "iron-pickaxe",
    name: "Iron pickaxe",
    description: "A forged pick on a straight haft. Tool: mines rock, +2 gathering. Weapon: 1d8 damage, +1 to attack.",
    level: 4,
    needs: [
      { name: "Iron ingot", quantity: 2 },
      { name: "Straight branch", quantity: 1 },
    ],
  },
];

/**
 * The kinds of shop (vendor.js): what each is called, the names that mark a building as one (`named`),
 * what it stocks with its usual price, and what it pays well for (`wants`). `values`: what things that
 * no shop stocks are worth (what gathering finds, what's made). A description says what a thing does,
 * as everywhere: "+15 HP when drunk", "+1 AC", "Weapon: 1d6 damage".
 */
const VENDORS = {
  // What a trade looks like where the kit has something for it (kit/fantasy/market): a dressed market
  // stall in place of the bare one, and a painted sign to hang by a shop's door.
  looks: {
    smith: { stall: "stall-blacksmith", sign: "sign-blacksmith" },
    apothecary: { stall: "stall-potions", sign: "sign-potions" },
    produce: { stall: "stall-vegetables-full", sign: "sign-food" },
    tavern: { stall: "stall-vegetables-full", sign: "sign-pub" },
  },
  kinds: {
    general: {
      label: "General store",
      guidance: "Everyday gear for travel and a household: rope, light, containers, bedding, simple tools.",
      named: /general|store|sundr|chandl|provision/iu,
      stock: [
        { name: "Rope", description: "Fifty feet of hempen rope.", price: 4 },
        { name: "Torch", description: "A branch wound with fibre, to burn for an hour.", price: 2 },
        { name: "Tinderbox", description: "Flint, steel and dry tinder in a tin.", price: 3 },
        { name: "Waterskin", description: "A stitched skin that holds a day's water.", price: 5 },
        { name: "Bedroll", description: "A wool blanket rolled in oilcloth.", price: 8 },
        { name: "Sack", description: "A stout cloth sack.", price: 2 },
        { name: "Lantern", description: "A horn-paned lantern.", price: 12 },
        { name: "Candle", description: "A tallow candle.", price: 1 },
        { name: "Fishing rod", description: "A springy rod with a twisted line. Tool: catches fish.", price: 6 },
        {
          name: "Jointed fishing rod",
          description: "A well-made rod in two pieces. Tool: catches fish, +2 gathering.",
          price: 18,
        },
        { name: "Cord", description: "A length of twisted cord.", price: 1 },
      ],
      wants: /branch|fibre|cord|firewood|kindling|flint|stone|torch|rope|sack/iu,
    },
    smith: {
      label: "Smith",
      guidance: "Forged goods: tools, blades, shields and plain armour, with ingots and what keeps an edge.",
      named: /smith|forge|armou?r|weapon|ironmonger/iu,
      stock: [
        {
          name: "Iron axe",
          description:
            "A forged head on a straight haft. Tool: chops wood, +2 gathering. Weapon: 1d8 damage, +1 to attack.",
          price: 30,
        },
        {
          name: "Iron pickaxe",
          description:
            "A forged pick on a straight haft. Tool: mines rock, +2 gathering. Weapon: 1d8 damage, +1 to attack.",
          price: 30,
        },
        {
          name: "Short sword",
          description: "A plain, well-balanced blade. Weapon: 1d6 damage, +1 to attack.",
          price: 40,
        },
        { name: "Dagger", description: "A hand's length of sharp iron. Weapon: 1d4 damage.", price: 15 },
        { name: "Wooden shield", description: "Limewood boards rimmed with iron. +2 AC.", price: 20 },
        { name: "Iron helm", description: "A riveted iron cap. +1 AC.", price: 25 },
        { name: "Iron ingot", description: "Iron smelted out of its ore.", price: 12 },
        { name: "Whetstone", description: "A stone for keeping an edge.", price: 2 },
      ],
      wants: /ore|ingot|axe|pick|sword|dagger|shield|helm|iron|copper|flint|stone|gem/iu,
    },
    apothecary: {
      label: "Apothecary",
      guidance: "Remedies and draughts: healing and mana potions, bandages, herbs, cures for common ills.",
      named: /apothecar|herbal|potion|alchem|healer|physic/iu,
      stock: [
        { name: "Health potion", description: "A red draught. +15 HP when drunk.", price: 15 },
        { name: "Mana potion", description: "A blue draught. +10 Mana when drunk.", price: 15 },
        { name: "Bandages", description: "Clean linen strips. +6 HP when used.", price: 5 },
        { name: "Herbal poultice", description: "Crushed herbs bound in fibre. +12 HP when used.", price: 9 },
        { name: "Antidote", description: "A bitter grey tincture against poisons.", price: 12 },
        { name: "Healing herb", description: "A soft-leaved herb for wounds. +5 HP when used.", price: 4 },
        { name: "Smelling salts", description: "A stoppered vial that would wake the dead.", price: 6 },
      ],
      wants: /herb|mushroom|morel|chanterelle|garlic|potion|poultice|berries/iu,
    },
    tailor: {
      label: "Tailor",
      guidance: "Clothing and leatherwork: cloaks, shirts, boots, hoods, gloves, light hide armour, pouches.",
      named: /tailor|cloth|draper|weaver|seamstress|outfitter/iu,
      stock: [
        { name: "Wool cloak", description: "A heavy cloak against the weather.", price: 12 },
        { name: "Linen shirt", description: "A plain linen shirt.", price: 5 },
        { name: "Leather boots", description: "Stout boots, already broken in.", price: 9 },
        { name: "Travelling hood", description: "A deep hood with a short cape.", price: 6 },
        { name: "Leather gloves", description: "Supple gloves.", price: 6 },
        { name: "Leather jerkin", description: "A thick hide jerkin. +1 AC.", price: 22 },
        { name: "Belt pouch", description: "A small pouch for the belt.", price: 4 },
      ],
      wants: /fibre|cord|cloak|shirt|boots|hood|gloves|jerkin|cloth|wool|leather|pouch/iu,
    },
    tavern: {
      label: "Tavern",
      guidance: "Food and drink to have now or carry: ale, wine, bread, cheese, stew, roast meat.",
      named: /tavern|\binn\b|alehouse|\bpub\b|taproom/iu,
      stock: [
        { name: "Mug of ale", description: "A mug of the house ale. +1 HP when drunk.", price: 1 },
        { name: "Bowl of stew", description: "Whatever went in the pot. +6 HP when eaten.", price: 2 },
        { name: "Loaf of bread", description: "A round brown loaf. +3 HP when eaten.", price: 1 },
        { name: "Wedge of cheese", description: "Hard yellow cheese. +3 HP when eaten.", price: 2 },
        { name: "Roast fowl", description: "A whole roast bird. +10 HP when eaten.", price: 4 },
        { name: "Skin of wine", description: "A skin of red wine. +2 HP when drunk.", price: 3 },
      ],
      wants:
        /trout|perch|pike|fish|berries|apple|turnip|cabbage|egg|nuts|wheat|mushroom|morel|chanterelle|garlic|firewood|kindling/iu,
    },
    produce: {
      label: "Greengrocer",
      guidance: "Fresh food from farms and gardens nearby: vegetables, fruit, eggs, bread, cheese, honey.",
      named: /grocer|produce|fruiter|market garden/iu,
      stock: [
        { name: "Apples", description: "Sound eating apples. +3 HP when eaten.", price: 2 },
        { name: "Turnips", description: "A few turnips. +2 HP when eaten.", price: 1 },
        { name: "Cabbage", description: "A firm head of cabbage. +2 HP when eaten.", price: 1 },
        { name: "Basket of eggs", description: "Half a dozen eggs. +4 HP when eaten.", price: 3 },
        { name: "Loaf of bread", description: "A round brown loaf. +3 HP when eaten.", price: 1 },
        { name: "Pot of honey", description: "A sealed pot of honey. +4 HP when eaten.", price: 5 },
        { name: "Wedge of cheese", description: "Hard yellow cheese. +3 HP when eaten.", price: 2 },
      ],
      wants: /apple|turnip|cabbage|egg|berries|nuts|wheat|mushroom|morel|chanterelle|garlic|trout|perch|pike/iu,
    },
  },
  values: {
    "Wolf pelt": 8,
    "Deer hide": 6,
    Venison: 3,
    "Wolf meat": 1,
    Antler: 4,
    "Fox pelt": 7,
    Cowhide: 8,
    Beef: 3,
    Horsehide: 8,
    Wool: 3,
    "Slime jelly": 2,
    "Old bone": 1,
    "Spider silk": 5,
    "Rat tail": 1,
    "Snake skin": 4,
    "Bat wing": 2,
    "Giant sting": 3,
    "Frog legs": 2,
    "Dragon scale": 60,
    "Imp horn": 5,
    Tusk: 4,
    Knife: 4,
    "River trout": 3,
    Perch: 2,
    Pike: 6,
    Firewood: 1,
    Kindling: 1,
    "Straight branch": 2,
    "Fallen branch": 1,
    "Plant fibre": 1,
    Flint: 1,
    Stone: 1,
    "Iron ore": 5,
    "Copper ore": 4,
    "Rough gem": 24,
    "Wild garlic": 1,
    Morel: 3,
    "Wild berries": 1,
    "Field mushroom": 1,
    "Bird's egg": 2,
    Hazelnuts: 1,
    "Crab apples": 1,
    Chanterelle: 3,
    Turnips: 1,
    "Wheat sheaf": 2,
    Apples: 2,
    Cabbage: 1,
    "Stone axe": 4,
    "Stone pickaxe": 5,
    "Cooked trout": 5,
    "Cooked perch": 4,
    "Cooked pike": 5,
    Quarterstaff: 4,
  },
};

export const PACK = {
  id: "fantasy",
  recipes: RECIPES,
  vendors: VENDORS,
  /** What money is called here, until the player names it (Inventory → Items). */
  currency: "Coins",
  gather: GATHER,
  /** What this setting looks like wherever you are, in a picture's prompt ({world_look}), unless the world has its own. */
  look: "medieval fantasy",
  things: THINGS,
  arrivals: ARRIVALS,
  sights: SIGHTS,
  errands: ERRANDS,
  joining: JOINING,
  camp: CAMP,
  acts: ACTS,
  animals: ANIMALS,
  coats: COATS,
  dogLore: DOG_LORE,
  horseLore: HORSE_LORE,
  sleep: SLEEP,
  beasts: BEASTS,
  outlaws: OUTLAWS,
  foes: FOES,
  spoils: SPOILS,
  spells: SPELLS,
  fight: FIGHT,
};

/** What's said of someone doing `act` at a place made for it ("minding a market stall"); "" for none. */
export function actWords(act) {
  return PACK.acts[act]?.doing ?? "";
}

/** Something said aloud by someone doing `act`, the same for the same `key`; "" when they keep quiet. */
export function actCall(act, key, words) {
  return pickLine(PACK.acts[act]?.calls, key, words);
}

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
