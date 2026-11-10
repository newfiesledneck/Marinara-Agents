// The instructions (Menu → Settings → Help): what there is and how it works, a section at a time, as a
// readme would have it. Words only: the HUD draws each section as a fold. A new feature adds a section
// here. The lorebook keywords come from the one list the reader keeps (keywords.js KEYWORD_GUIDE), and
// the prompt at the end is for handing to an assistant (Professor Mari, or any) with a lorebook.
import { KEYWORD_GUIDE } from "./keywords.js";

const keywordGroups = [...new Set(KEYWORD_GUIDE.map((entry) => entry.group))];

/** The keyword list as plain text, for the prompt. */
const keywordText = keywordGroups
  .map(
    (group) =>
      `${group}:\n${KEYWORD_GUIDE.filter((entry) => entry.group === group)
        .map((entry) => `- ${entry.write} (on ${entry.on}): ${entry.does}`)
        .join("\n")}`,
  )
  .join("\n\n");

/**
 * A prompt to give an assistant along with a lorebook, so it adds or corrects the Wanderworld keys.
 * Kept in step with the keyword list above it.
 */
export const KEYWORD_PROMPT = `I use Wanderworld, a 3D world for Marinara Engine that builds itself from my lorebook. It reads special keys on lorebook entries. Please go through my lorebook and, for each entry, add the Wanderworld keys that fit it, and correct any that are written wrongly. Keep every existing key that isn't a Wanderworld key exactly as it is.

How the keys are written:
- Each one is its own key, in the entry's list of keys: ww:<what>:<value>
- "ww" marks it as Wanderworld's. <what> says what it's for. <value> is what's given.
- Spaces round the colons and capitals don't matter: "ww : owned by : Mira" is the same as "ww:owned by:Mira".
- A key never contains a comma (commas separate keys). One thing per key: repeat a key for more (two ww:drops:… keys for two drops).
- A key with no <what> names what the entry is about: ww:tavern1 (a place), ww:Mira (a character), ww:world (lore for everywhere).
- "you", "me", "I", "player" and "persona" all mean the player. "them", "they", "him", "her", "char" and "character" all mean the person the entry is about.
- Only keys that start with ww: do anything. Ordinary trigger words (town, man, enemy) are ignored, so leave them alone.

Places are numbered by kind, counting from 1: town1 is the main settlement, tavern1 the first tavern, home3 the third house. The kinds: town, home, tavern, shop, smithy, temple, hall, inn, cottage, farm, mill, pond, ruins, watchtower, stones, graveyard, cave, mountains, forest, river, square, fountain. Give each distinct place in the lore its own number, and use the same number everywhere that place is meant.

The keys:

${keywordText}

For each entry, tell me the keys to add (and any to remove or fix), then give me the entry's full list of keys. If an entry fits nothing here (an item, a spell, someone only mentioned), give it no Wanderworld keys.`;

/** The sections: [{ title, lines: [text] }], or { title, keywords: true } for the keyword list, or { title, prompt }. */
export const HELP = [
  {
    title: "Getting about",
    lines: [
      "WASD or the arrow keys walk; Shift runs. Drag to look round, scroll (or pinch) to zoom. On a touch screen there's a stick in the corner.",
      "E, a click or a tap uses whatever the prompt names: a door, a bench, a person, a market stall.",
      "The bar along the top has the Journal, the Lore active where you stand, Illustrate, the Chat window and the Menu (who you play, Settings, full screen, the main menu).",
    ],
  },
  {
    title: "Talking, moments and scenes",
    lines: [
      "Walk up to someone and press E to talk. Pick something to say or type your own. What's offered depends on who they are to you.",
      "The Chat window is for everything else: plain text is said to whoever's near, /s shouts, /w whispers, /p speaks to your party, /a does something instead of saying it. With AI on, the narrator tells what comes of it and people nearby may answer. That's a moment: one model call.",
      "A scene is a full roleplay chat in the Engine. Start one from a card's \"Play it as a scene\", the Chat window's Scene button, or /scene …; when it ends, its recap comes back to the world.",
      "/camp lights a campfire where you stand.",
    ],
  },
  {
    title: "Strangers, and people you know",
    lines: [
      "Someone you haven't met is a Stranger until you learn their name: they say it, a note names them, they join you, or you tick it in the \"i\" beside a conversation's title.",
      "It goes both ways: someone who doesn't know your name won't use it until you say it.",
      "Menu → Settings → Display chooses whose names show: everyone's, only people you know, or nobody's.",
    ],
  },
  {
    title: "People: managing them",
    lines: [
      'Journal → People lists everyone by faction. "Edit people" opens a window for each person: body, voice, temperament and manner, home and work, their day, what they are to you and to each other, how they act toward you, and who knows whose name.',
      'Three things decide how someone behaves. What they are to you (friend, rival, sister) is the relationship. Temperament and manner are what they\'re like with everybody. "How they act toward you" overrides both for you alone: a sister can be rude, an enemy afraid.',
      "People with a character card keep who they are and their looks from the card. People a world made for itself can be changed entirely.",
    ],
  },
  {
    title: "Making a world",
    lines: [
      'New world: a name, who you play, who lives there, the land, and under "Setting the world up" how much the AI does for you.',
      "The AI can set your characters up from their cards (bodies, homes, work, relationships), read your lorebooks and tie their lore to places, write the world's own lore and places from nothing, and invent people to live there. Each is a model call or two, and you see all of it before the land is built.",
      "Or do it by hand: lorebook keywords (below), and the Journal for anything else.",
      "Layouts: a grid of streets, a crossroads, one street, round the market, scattered houses with no streets, round a pond with the houses at the edge, or four quarters and a green. Ground a layout leaves open gets a pond, a few houses, gardens and meadows.",
      "Ages: the usual ages of people the AI invents (21 and up unless you change it; any age from 1). Your lore, setting and cards always win over it. Journal → World changes it later.",
      "The first map on New world is an idea, not a promise: lore adds places. With the AI, the review shows the real map, and Reroll the map there changes only the land.",
    ],
  },
  {
    title: "The AI assistant",
    lines: [
      "Menu → Settings → AI assistant is a chat about the world you're in. Ask about its people, places and lore, why a lore entry is or isn't active where you stand, or how something works.",
      'Ask for a change and it proposes one: "make Jake and Sarah a married couple who live together", "add a blacksmith\'s apprentice who lives with Oswin", "Mira works mornings and is at the tavern every evening", "call the tavern the Drowned Bell, closed after midnight", "make a Thieves\' Guild with Jake and Fen", "pin a note about the lost cat".',
      "You see every change in full first (rewritten lore with what it says now) and nothing happens until you press Confirm. Cancel drops it. After a Confirm, Undo these changes puts the world back as it was before them.",
      "It can set relationships, homes and work, days, body, voice, temperament, manner, how someone acts toward you and who knows whose name; add people and remove ones this world invented; write this world's own lore about a person, a place or the whole world (keeping the detail that's there); rename places and set when they're closed; make groups of places and factions; change the setting, the picture look and the ages; pin notes and give you an errand.",
      "It only changes the world you're in. Your character cards, personas and lorebooks in the Engine, these settings, the map and the buildings are never touched. One model call a message.",
    ],
  },
  {
    title: "AI, and what it costs",
    lines: [
      "Every AI call uses one of your Engine connections. A reply in a conversation, a moment, a day planned, a scene planned, a picture, a picture's prompt rewritten and a message to the AI assistant are one call each. Walking about calls nothing.",
      'Illustrate paints the moment. With "Have the AI rewrite the prompt" on, the last lines of the chat go with it, so the picture shows what you\'re doing now, not only where you stand.',
      "Menu → Settings → AI has a switch for each thing that can call the model. With one off, the world answers with its own written lines.",
      "A narrator card (one of your characters) can tell scenes, moments or both in its voice, and lets a scene start with nobody else there.",
    ],
  },
  { title: "Lorebook keywords", keywords: true },
  {
    title: "A prompt for writing your keywords",
    lines: [
      "Copy this and give it to Professor Mari (or any assistant) along with your lorebook. It explains the keywords and asks for each entry's keys to be added or corrected.",
    ],
    prompt: KEYWORD_PROMPT,
  },
];

/**
 * Credits and thanks (Menu → Settings → Credits, and the main menu): [{ title, lines }]. The models and
 * animations are listed as the kit's own notes have them (kit/CREDITS.md, src/clips/CREDITS.md).
 */
export const CREDITS = [
  {
    title: "Wanderworld",
    lines: ["Made by ThatOneCan, for Marinara Engine."],
  },
  {
    title: "Thank you, Marinara",
    lines: [
      "To Marinara, and to every one of the developers who build Marinara Engine with her: thank you.",
      "A few short months ago I had never done any kind of project with code, and I never would have tried if it weren't for Marinara Engine and the community around it. The openness here, letting regular users make feature requests and build their own things to contribute, is what got me to take that first step with third-party extensions, then to make Quartermaster, and now this: a project I never would have guessed I'd attempt.",
      "Wanderworld only exists because of what you made. You built an engine where a package can have a place of its own, reach the characters, personas and lorebooks people have already poured themselves into, and call on their own models, and then you left the door open for the rest of us to build in it. That kind of openness is rare, and it takes real generosity to keep it that way.",
      "Thank you for building it, and for letting us build on it.",
    ],
  },
  {
    title: "Models and animations: Quaternius",
    lines: [
      "The buildings, props, plants, people and recorded animations are converted from free packs by Quaternius (quaternius.com), who releases them into the public domain (CC0 1.0). No credit is asked for. It's given gladly: none of this would look like anything without them.",
      "Medieval Village MegaKit: the houses. Plaster, brick and wood-grid walls, round doors and door frames, thin and wide round windows, round-tile roofs in every size, the tower roof, brick roof fronts, exterior corners, the balcony, chimneys and vines, and their plaster, brick, tile, wood-trim and metal textures.",
      "Fantasy Props MegaKit (with pieces from the Medieval Village MegaKit): the market stalls and stall cart, wagon, barrels and apple barrels, crates and farm crates, wooden fences, benches, buckets, bags, and the furniture indoors: tables, chairs, stools, beds, cabinets, shelves and bookcases, books, bottles, mugs, pots and the cauldron, candlesticks, the chandelier, wall lanterns and torches, the anvil, workbenches, weapon stand, training dummy, chest, coin pile, banner and vase.",
      "Stylized Nature MegaKit: the common, twisted, dead and pine trees with their bark and leaves, bushes and flowering bushes, ferns, clover, flowers, grasses, mushrooms, plants, pebbles, rocks and the rock path.",
      "Universal Base Characters and Modular Character Outfits - Fantasy: the townsfolk. The male and female bodies and heads, the peasant outfits and their colours, eyes, and the hair and beards.",
      "Universal Animation Library: Idle, Walk, Jog, Sprint, Idle Talking, Sitting (enter, idle, talking, exit) and Swim (forward, idle).",
    ],
  },
  {
    title: "Art, and the code underneath",
    lines: [
      "The art and textures not credited above were generated in ComfyUI by ThatOneCan.",
      "Drawn with three.js. Your own 3D avatars come from the 3D Avatars package, made by Marinara: Wanderworld reads the model you set up there, so you walk about as yourself.",
    ],
  },
];

export { KEYWORD_GUIDE, keywordGroups };
