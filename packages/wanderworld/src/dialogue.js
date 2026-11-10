// Set conversations, for when the AI isn't writing them (AI conversations off, or a call failed): short back-and-forth
// exchanges townsfolk have with each other, and a few dialogue choices for the player, all picked by how
// the two people feel about each other. Lines can name people and places: {A} and {B} (the two in an
// exchange, A speaking first), {name} (the one the player talks to), {you} (the player), {town},
// {tavern}, {wild}, {street}, {greeting} ("Morning" / "Afternoon" / "Evening").

/** How someone feels, as a mood these lines are written for. `feeling`: { kind, warmth } (relationships.js). */
export function moodOf(feeling) {
  if (!feeling?.kind) return "stranger";
  if (feeling.kind === "family") return "family";
  if (feeling.warmth < -0.15) return "cold";
  if (feeling.warmth > 0.65) return "close";
  if (feeling.warmth > 0.3) return "warm";
  return "neutral";
}

/** Townsfolk talking to each other: whole exchanges, the lines taking turns, A first. */
export const EXCHANGES = {
  neutral: [
    [
      "{greeting}, {B}.",
      "{greeting}, {A}. Off to the market?",
      "Need flour before it's all gone.",
      "Save some for the rest of us!",
    ],
    ["Busy day today.", "Always is, this time of year.", "I don't know where the hours go.", "Nor me. Take care, now."],
    [
      "Did you hear the news?",
      "About the wolves? Aye, the watch was out last night.",
      "Makes you glad of a stout door.",
      "That it does.",
    ],
    [
      "Looks like rain later.",
      "My knee's been saying so all morning.",
      "Better get the washing in, then.",
      "Ha! Too right.",
    ],
    [
      "How's the family?",
      "All well, thank you. The little one's walking now.",
      "Already? Where does the time go.",
      "Come by and see for yourself.",
    ],
    [
      "Is the bakery open today?",
      "Since dawn. The smell's halfway down the street.",
      "Then I know where I'm going.",
      "Get there before the rolls are gone.",
    ],
  ],
  warm: [
    [
      "There you are, {B}!",
      "Here I am! What's the news?",
      "You have to hear what happened at the tavern…",
      "Go on, then. I'm all ears.",
    ],
    [
      "Same time at the tavern tonight?",
      "Wouldn't miss it.",
      "Your turn to buy, mind.",
      "Is it? I could swear it was yours.",
    ],
    [
      "Ha! Best thing I've heard all week.",
      "I told you you'd like it.",
      "Tell it again tonight, will you?",
      "Only if you buy the first round.",
    ],
    ["You look well, {B}.", "Do I? Must be the sunshine.", "Must be. Walk a while?", "Gladly."],
  ],
  close: [
    ["I was hoping I'd see you.", "And here I am. Missed me?", "Every minute.", "Liar. But a sweet one."],
    ["Walk with me?", "Anywhere you like.", "Down by the river, then.", "Lead the way."],
    ["Come and sit with me a while.", "I'd like that.", "I saved you the shady side.", "You always do."],
  ],
  family: [
    [
      "Don't forget supper tonight.",
      "As if I would. What are we having?",
      "Stew, if you bring the bread.",
      "Bread it is.",
    ],
    ["Mum's asking after you.", "I'll call in this evening.", "She'll want to feed you.", "She always does."],
    ["You look tired. Eating properly?", "Yes, yes. Stop fussing.", "Somebody has to.", "…Thank you."],
  ],
  cold: [
    ["Oh. It's you.", "Don't sound so pleased.", "I'll not keep you.", "Good."],
    ["Hmph.", "Something to say?", "Nothing worth your time.", "Then I'll be on my way."],
  ],
};

/** An exchange for two people: from how the first (`mood`) feels about the second. `random` () → 0…1. */
export function pickExchange(mood, random) {
  const pool = EXCHANGES[mood === "stranger" ? "neutral" : mood] ?? EXCHANGES.neutral;
  return pool[Math.floor(random() * pool.length)];
}

/** Puts names and places into a line (unknown words stay as they are). */
export function fill(line, words) {
  return line.replace(/\{(\w+)\}/gu, (match, key) => words[key] ?? match);
}

/** "Morning", "Afternoon" or "Evening" for an hour of the day. */
export function greetingFor(hour) {
  return hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";
}

/** The player's dialogue choices: what the player says, and how the other answers by mood. */
const TOPICS = {
  howAreYou: {
    label: "How are you?",
    reply: {
      stranger: ["Well enough, thanks for asking.", "Can't complain. Do I know you?"],
      neutral: ["Not bad, not bad. Yourself?", "Keeping busy. You know how it is."],
      warm: ["All the better for seeing you!", "Good! Better now you're here."],
      close: ["Happier now. I was thinking about you.", "Better now you're here, {you}."],
      family: ["Tired, but well. Are you eating properly?", "Fine, fine. Have you called on Mum?"],
      cold: ["What's it to you?", "Fine. Was there something?"],
    },
  },
  news: {
    label: "What's new in town?",
    reply: {
      stranger: ["Not much. The watch heard wolves near {wild}, they say.", "Market's busy. That's about all."],
      neutral: [
        "They say wolves were heard near {wild}. Travel in company.",
        "{tavern} has a new barrel in. That's news enough for some.",
      ],
      warm: [
        "Oh, you'll love this: someone lost a cat on {street}. The whole street's out looking!",
        "Wolves near {wild}, they say. Keep safe, won't you?",
      ],
      close: [
        "Nothing that matters as much as you being here.",
        "Let's not talk about the town. Tell me about your day.",
      ],
      family: [
        "Your cousin's courting, didn't you hear?",
        "Same as ever. Come for supper and I'll tell you all of it.",
      ],
      cold: ["Ask someone else.", "Nothing I'd tell you."],
    },
  },
  about: {
    label: "Tell me about yourself.",
    reply: {
      stranger: ["Not much to tell. I live here, I work, I sleep.", "Me? Born and raised in {town}."],
      neutral: [
        "I've lived in {town} all my life. Wouldn't trade it.",
        "I keep to myself, mostly. It's a good town for that.",
      ],
      warm: ["You know me! Though I'll tell you a secret one day.", "I'm an open book, {you}. A dull one, but open."],
      close: ["You already know me better than anyone.", "What more is there? You know my heart."],
      family: ["You know everything there is to know!", "Ha! You were there for most of it."],
      cold: ["I don't see why I should.", "Mind your own business."],
    },
  },
  // More to say, by who it is. `when(context)` says whether it's offered: context is { mood, known (the
  // player knows their name), theyKnow (they know the player's) }. Without AI the answer is `reply`.
  whoAreYou: {
    label: "I don't think we've met. What's your name?",
    when: (context) => !context.known,
    reply: {
      neutral: ["{name}. And you are?", "Folk call me {name}.", "{name}. Who's asking?"],
      cold: ["{name}. Not that it's your business."],
    },
  },
  introduce: {
    label: "I'm {you}.",
    when: (context) => !context.theyKnow,
    reply: { neutral: ["Well met, {you}.", "{you}. I'll remember that."], cold: ["If you say so, {you}."] },
  },
  newHere: {
    label: "I'm new around here.",
    when: (context) => context.mood === "stranger",
    reply: { neutral: ["Then mind the river after rain, and try {tavern}.", "Welcome to {town}. It grows on you."] },
  },
  weather: {
    label: "Some weather we're having.",
    when: (context) => ["stranger", "neutral"].includes(context.mood),
    reply: { neutral: ["It'll turn by evening. It always does.", "Can't complain. Well, I can."] },
  },
  work: {
    label: "How's work?",
    when: (context) => ["neutral", "warm", "family"].includes(context.mood),
    reply: { neutral: ["Never done. You?", "Keeps me fed."], warm: ["Better for a visit. Stay a minute?"] },
  },
  rumours: {
    label: "Heard any rumours?",
    when: (context) => context.mood !== "cold",
    reply: {
      neutral: [
        "Only that something's been at the hens up by {wild}.",
        "They say {tavern} waters the ale. I wouldn't know.",
      ],
    },
  },
  help: {
    label: "Need a hand with anything?",
    when: (context) => ["neutral", "warm", "close", "family"].includes(context.mood),
    reply: {
      neutral: ["Kind of you. Not today.", "Ask me tomorrow, when the cart comes in."],
      warm: ["From you? Always. Later, though."],
    },
  },
  goodToSee: {
    label: "It's good to see you.",
    when: (context) => ["warm", "close", "family"].includes(context.mood),
    reply: {
      warm: ["And you! It's been too long.", "You too. Truly."],
      close: ["I was hoping you'd come by."],
      family: ["Look at you. Come here."],
    },
  },
  walkLater: {
    label: "Fancy a walk later?",
    when: (context) => ["warm", "close"].includes(context.mood),
    reply: { warm: ["I'd like that. By {street}?", "If the weather holds, yes."], close: ["With you? Anywhere."] },
  },
  missed: {
    label: "I've missed you.",
    when: (context) => context.mood === "close",
    reply: { close: ["Don't. You'll make me say it back.", "Then stay longer this time."] },
  },
  family: {
    label: "How's the family?",
    when: (context) => context.mood === "family",
    reply: { family: ["Loud. Come to supper and see.", "Asking after you, as ever."] },
  },
  problem: {
    label: "What's your problem with me?",
    when: (context) => context.mood === "cold",
    reply: { cold: ["You know what you did.", "Where would you like me to start?"] },
  },
  truce: {
    label: "Can we call a truce?",
    when: (context) => context.mood === "cold",
    reply: { cold: ["We'll see.", "Words are cheap. Show me."] },
  },
  eat: {
    label: "Know a good place to eat?",
    reply: {
      stranger: ["{tavern} does a decent stew.", "Try {tavern}. Can't miss it."],
      neutral: ["{tavern}. The stew's warm and the ale's cold.", "{tavern}, for my money. Mind the bench by the fire."],
      warm: ["{tavern}! I'll come with you if you're buying.", "{tavern}, of course. Shall we?"],
      close: ["Somewhere quiet, with you? {tavern} has a corner table.", "I could cook for you, if you like."],
      family: ["Come home and eat, silly.", "There's stew on at home. Don't waste coin at {tavern}."],
      cold: ["Anywhere I'm not.", "{tavern}. Go on, then."],
    },
  },
};

const GREETINGS = {
  stranger: ["Hello. Can I help you?", "{greeting}. Don't think we've met."],
  neutral: ["{greeting}, {you}.", "Oh, hello there."],
  warm: ["{you}! Good to see you.", "There you are! How have you been?"],
  close: ["{you}… I was hoping you'd come by.", "There you are. I missed you."],
  family: ["There you are! Come here.", "{you}! Have you eaten?"],
  cold: ["What do you want?", "Oh. It's you."],
};

const FAREWELLS = {
  stranger: ["Good day to you.", "Safe travels."],
  neutral: ["Take care, now.", "See you around."],
  warm: ["Don't be a stranger!", "Come find me later!"],
  close: ["Don't be long.", "I'll be thinking of you."],
  family: ["Mind how you go!", "Come home for supper!"],
  cold: ["Finally.", "Good riddance."],
};

/** For whatever the player types, when the AI isn't answering. */
const ANSWERS = {
  stranger: ["Is that so?", "Hm. I'll take your word for it.", "If you say so."],
  neutral: ["Mm, I was just thinking the same.", "Ha! You don't say.", "I'll have to remember that."],
  warm: ["Ha! That's just like you.", "You always know what to say.", "Really? Tell me more!"],
  close: ["I love hearing you talk.", "Mm. Stay a while longer?", "You always make me smile."],
  family: ["Listen to you!", "Your mother would say the same.", "Ha! Where did you learn that?"],
  cold: ["Are you finished?", "I don't care.", "Hmph."],
};

/**
 * Choices for the player: `[{ id, label }]`, by who it is (`context`: { mood, known, theyKnow, you (the
 * player's name), seed }), not ones asked already, a handful at a time and not the same handful for
 * everyone, and always Goodbye.
 */
export function choicesFor(asked = [], context = {}) {
  const offered = Object.entries(TOPICS)
    .filter(([id, topic]) => !asked.includes(id) && (topic.when ? topic.when(context) : true))
    .map(([id, topic], at) => ({ id, label: topic.label.replace("{you}", context.you ?? "a traveller"), at }));
  // Introductions first; the rest in an order of this person's own.
  const mix = (text) => {
    let value = 7;
    for (const char of text) value = (Math.imul(value, 31) + char.charCodeAt(0)) | 0;
    return Math.abs(value);
  };
  const rank = (entry) =>
    ["whoAreYou", "introduce"].includes(entry.id) ? -1 : mix(`${context.seed ?? ""}:${entry.id}`);
  offered.sort((a, b) => rank(a) - rank(b));
  return [...offered.slice(0, 5).map(({ id, label }) => ({ id, label })), { id: "bye", label: "Goodbye." }];
}

const one = (lines, random) => lines[Math.floor(random() * lines.length)];

/** What someone says to the player: `what` is "greet", "bye", "answer" (to typed words) or a topic id. */
export function lineFor(what, mood, words, random = Math.random) {
  const pools = { greet: GREETINGS, bye: FAREWELLS, answer: ANSWERS };
  const pool = pools[what]?.[mood] ?? TOPICS[what]?.reply[mood] ?? TOPICS[what]?.reply.neutral ?? ANSWERS.neutral;
  return fill(one(pool, random), words);
}

/** What the player's choice is, as they say it. */
export function labelOf(id, you = "a traveller") {
  return id === "bye" ? "Goodbye." : (TOPICS[id]?.label ?? "").replace("{you}", you);
}
