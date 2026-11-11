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
      "Anyone without a 3D model, you included, can be given a look: the Look button beside the body choice (in People, and by Play as) sets the outfit or each piece of it (or None, to leave a piece off), the hood and pauldrons, colours (your own too, for any piece, the hair and the skin), hair, beard and height. Reset goes back to the look their name gives.",
      "Space jumps. C sits you down on the ground wherever you are, and C again lies you down; move, or press E, to get up. The chat window has Jump and Sit buttons, and on a touch screen they're by your thumb too; Settings → Moving has a toggle for the C key, for each of the two touch buttons, and for the chat window's buttons. A home's bed (with Walk into buildings on) is somewhere to lie down. Anyone travelling with you finds a seat or stands by.",
      "There are animals: cattle, a donkey and a horse at farms, a dog or two about the market, a horse by each tavern and inn, and deer, foxes and wolves out in the country (the wild ones run from you). Walk up to a horse or a donkey and use it to ride: the same keys or stick move it, Shift gallops, Space or Jump jumps (over a fence or a bench, too), and E, Esc or Get down gets you off. It stays where you leave it.",
      "Avatar: when a persona's or a character's card has a 3D model, their Look card has Avatar at the top. Leave it on their card's model, pick another kind the card has (VRM, GLB / FBX, MMD), or choose Built-in person to use the built-in body and the look below instead.",
      "A dog and a horse of your own: Menu, then Look beside your persona, has Dog and Horse at the bottom. Pick the coat and the size, give it a name if you like (it's called by it from then on), and whether each is With you (it follows you, and turns up beside you if you leave it far behind) or At home (by your door; with no home of your own, by the tavern's). Ride your horse like any other; got down from, it comes after you or walks back home. At home, walk up to your dog and use it to call it along. The chat window has Send dog home and Send horse home while they're with you (each asks once more before it does it), and the Journal's Party tab lists them with Send home and Call along. Someone in town whose lore gives them a dog or a horse has it at their heel, and their Look card can change it or take it away. Their horse is theirs: it isn't offered to you to ride. A dog has five sizes, small to massive (as tall as a horse); a huge or a massive one can be ridden like a horse.",
      "A world that goes on without you: while you play, people who spend time together (an evening at the tavern, a campfire, travelling in your party) grow a little closer, slowly: about a step for an evening, a couple of steps a day at most, a tier in a few weeks. Two short-tempered people now and then have words instead; friends who never meet drift apart a step at a time (family and partners don't). Rivals and enemies don't mend by sharing a room. It all runs on rules: no AI is called, and nothing happens while Wanderworld is closed.",
      "Locks and attraction: Journal → Edit people → someone's window has, beside each relationship, a Lock (locked, it never changes by itself; a hand, lore or the AI assistant still can) and Attraction, how attractive they find the other, with a lock of its own. Everyone has a view before you touch it; moving the slider sets it, and only one that's set is told to the AI. A relationship you set by hand moves on from where you set it unless you lock it.",
      "What you missed: Journal → Relationships ends with Lately, the world's own record of who spent time with whom and what changed. Coming back into town, or out into the country, after a few hours away tells you what happened there. People in a moment are told only the recent things they themselves were part of. Menu → Settings → Living world has a switch for each: relationships changing, keeping the record, and being told what you missed.",
      "What people remember: each person keeps a short memory of their own: what you said to them or in their hearing, and who they spent time with. When the AI speaks for someone it's given that person's memories and nobody else's, so it can't know what was said across town, and people can remember different things. Someone you said something to may come over within a few days to bring it up. Journal → Edit people → someone's window shows what they remember and can clear it; Menu → Settings → Living world switches it off altogether. No AI call is spent keeping them.",
      "Your home: Journal → Home shows where you live and who with. Move into any house that stands empty, and choose which of the people you live with come along (the rest stay where they are). Ask someone to move in, or ask a housemate to leave (they go to an empty house, or the least crowded one). Have someone round: they head for your home and stay about three hours. People who know you and don't dislike you say yes. It's all by rules, with no AI call; Journal → People still lets you put anyone anywhere.",
      'Furnishing your home: turn on Menu → Settings → Walk into buildings, go inside your own home and open Journal → Home. Pick a piece (chairs, tables, a bench, a bookcase, a chest, a barrel, a candle stand and more) and "Put it here": it goes down a step in front of you, facing you, moved in from a wall if need be. Chairs and stools you add can be sat on. "Take away" removes a piece you added. The room\'s own furniture stays as it is. Up to 40 pieces a home, kept with the world.',
      'Costumes: in someone\'s Look card, "Dressed as" swaps the built-in person\'s clothes for a whole ready-made character: a king, a farmer, an adventurer (man or woman), a witch or a hooded rogue. Skin, hair colour and height stay their own; the outfit, its pieces and the hairstyle are the costume\'s. "Their own clothes" puts them back as they were.',
      "Hostile people: bandits, witches and wizards are out in the country with the monsters, and act as the Hostile animals setting says (keep away, threaten, or attack). They're nobody's character: they can't be talked to, and no AI is used for them. Each has its own switch under Menu → Settings → Animals, and lore can place them (ww:monster:bandit:pack3).",
      "How many animals: Menu → Settings → Animals has a slider for each sort (stray dogs, farm animals, peaceful wild animals, hostile ones, monsters): that many of the world's own, and 0 for none. Animals a lorebook asks for, and anyone's own dog or horse, are still there at 0 unless you turn that off. Under the sliders each kind has a switch: off, there are none of it anywhere, whatever else says. Most in the settlement keeps the town from filling up: any stray dogs and horses over it are put just outside. Hostile animals says what a wolf does about you where confrontations are allowed: keeps its distance, squares up to you, or comes for you (you're sent back a step; nothing is hurt yet). Journal → World has Animals in this world, for one world's own numbers.",
      "Outside each settlement there's a campsite or two: sit on the logs by the fire, or use the tent to sleep. You choose how long; the clock jumps on, and everyone not close by is where that hour has them.",
      "People have places to work and rest out of doors: the smith at the open forge, sellers and buyers at the market stalls, a farm's people in its fields, and others at a garden's beds, by a pond or in a meadow's grass.",
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
      "You see every change in full first (rewritten lore with what it says now) and nothing happens until you press Confirm. Before that you can rewrite any of the text it wrote (or have it written again), change its choices (a relationship's kind and strength, a home, work, body, voice), and untick a change to leave it out. Cancel drops it all. After a Confirm, Undo these changes takes back what the assistant changed, and only that: anything you changed yourself since stays.",
      "It can set relationships, homes and work, days, body, voice, temperament, manner, how someone acts toward you and who knows whose name; add people and remove ones this world invented; write this world's own lore about a person, a place or the whole world (keeping the detail that's there); rename places and set when they're closed; make groups of places and factions; change the setting, the picture look and the ages; pin notes and give you an errand.",
      "It can also write a faction's lore (every member then knows it), take notes down from the noticeboard, drop your errand, and suggest a scene that starts in the Engine when you confirm. Ask for people while you're in another region and they live there.",
      "The buttons under the chat are ready-made requests, for when you don't know what to ask: a few always in view, and More things to ask lists the rest with what each does. One ending in … is put in the box for you to finish.",
      "Draft ww: keywords (in that list) lets you pick a lorebook and tick its entries, twenty at most. Only those are sent, and you get each entry's keys as text to copy into your lorebook: the assistant can't change Engine lorebooks.",
      "Only the parts of the world your message needs are sent with it, and the small line under each answer says which. If the model needs a part that was left out it asks, and is asked again with it (a second call). The chat is kept with the world; Start over forgets it.",
      "It only changes the world you're in. Your character cards, personas and lorebooks in the Engine, these settings, the map and the buildings are never touched.",
    ],
  },
  {
    title: "AI, and what it costs",
    lines: [
      "Every AI call uses one of your Engine connections. A reply in a conversation, a moment, a day planned, a scene planned, a picture, a picture's prompt rewritten and a message to the AI assistant are one call each. Walking about calls nothing.",
      'Illustrate paints the moment. With "Have the AI rewrite the prompt" on, the last lines of the chat go with it, so the picture shows what you\'re doing now, not only where you stand.',
      "Menu → Settings → AI has a switch for each thing that can call the model. With one off, the world answers with its own written lines.",
      "Narrator cards (your own characters): one for the world as you walk it (keep it short: a voice and a few rules), one for scenes, which also lets a scene start with nobody else there. They can be the same card or two.",
      "What people know: someone you talk to is told only what they were in earshot of. What you said to others elsewhere, they don't know unless you tell them.",
      "To see exactly what is sent, turn on the Engine's Debug Mode (Settings → Advanced): every request to a model and its answer, and every picture request with its connection, model, size and prompt, is written to the Engine's console.",
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
      "Medieval Village MegaKit: the houses. Plaster, brick and wood-grid walls, round doors and door frames, thin and wide round windows, square windows and their shutters, round-tile roofs in every size, the tower roof, the dormer, the wooden lean-to roofs, brick roof fronts, the arches of the forge, exterior corners, the balconies, chimneys and vines, and their plaster, brick, tile, wood-trim and metal textures.",
      "Fantasy Props MegaKit (with pieces from the Medieval Village MegaKit): the market stalls and stall cart, wagon, barrels and apple barrels, crates and farm crates, wooden fences, benches, buckets, bags, and the furniture indoors: tables, chairs, stools, beds, cabinets, shelves and bookcases, books, bottles, mugs, pots and the cauldron, candlesticks, the chandelier, wall lanterns and torches, the anvil, workbenches, weapon stand, training dummy, chest, coin pile, banner and vase.",
      "Stylized Nature MegaKit: the common, twisted, dead and pine trees with their bark and leaves, bushes and flowering bushes, ferns, clover, flowers, grasses, mushrooms, plants, pebbles, rocks and the rock path.",
      "Universal Base Characters and Modular Character Outfits - Fantasy: the townsfolk. The male and female bodies and heads, the peasant outfits and their colours, eyes, and the hair and beards.",
      "Farm Buildings: the barn and the windmill.",
      "Medieval Torture Devices, Signs pack and Crystal Pack by iPoly3D (CC0, from Poly Pizza): the gallows, pillory and cage by a watchtower, signposts at inns and cottages, crystals among standing stones.",
      "Ultimate Modular Men and Ultimate Modular Women: the costumes.",
      "Credit required (CC-BY 3.0, https://creativecommons.org/licenses/by/3.0/): Saddle by Poly by Google, https://poly.pizza/m/dSMm_V4sKNr, modified (converted, resized, its texture shrunk). Its maker has not endorsed Wanderworld.",
      "Monster Pack Animated and Easy Animated Enemy Pack: the slime, skeleton, giant spider, giant rat, snake, bat, giant wasp, giant frog and dragon.",
      "Bestiary - Dungeon Monsters Kit: the imp and the puglin. (This pack is under the Quaternius Asset License, not CC0: free to use in a game, not to pass on as assets.)",
      "Ultimate Animated Animals: the horses, donkey, cow, bull, alpaca, deer, stag, wolf, fox and the two dogs, with their standing, grazing, walking and galloping, and the horses' and donkey's jump.",
      "Universal Animation Library: Idle, Walk, Jog, Sprint, Idle Talking, Sitting (enter, idle, talking, exit), Swim (forward, idle), Jump (loop, land), Fixing Kneeling, Interact, Pick Up Table and Dance.",
      "Universal Animation Library 2: Tree Chopping (the smith's hammer), Farm Harvest, Plant Seed and Watering, Idle Fold Arms, Idle Rail, Lay To Idle (lying down and getting up) and Consume.",
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
