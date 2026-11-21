import { SRD_CREDIT } from "./srd.js";
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

/**
 * Help for the AI assistant, for a question (`asked`): the sections that share the most words with it first,
 * then the rest in order, each whole, until `most` characters are used. "Settings, and where things are"
 * always comes first, since it says where everything is. The lorebook keyword list is a section too.
 */
export function helpFor(asked, most) {
  const words = (text) =>
    new Set(
      String(text)
        .toLowerCase()
        .match(/[a-z]{4,}/gu)
        ?.map((word) => word.replace(/(?:ies|es|s)$/u, "")) ?? [],
    );
  const want = words(asked);
  const parts = HELP.map((part, order) => {
    const text = part.keywords ? keywordText : Array.isArray(part.lines) ? part.lines.join(" ") : "";
    const have = words(`${part.title} ${text}`);
    let score = 0;
    for (const word of want) if (have.has(word)) score += 1;
    if (/^settings, and where/iu.test(part.title)) score = Infinity;
    return { title: part.title, text, score, order };
  }).filter((part) => part.text);
  parts.sort((a, b) => b.score - a.score || a.order - b.order);
  const kept = [];
  let used = 0;
  for (const part of parts) {
    const block = `${part.title}: ${part.text}`;
    if (used + block.length > most) continue;
    kept.push(block);
    used += block.length + 1;
  }
  return kept.join("\n");
}

/** The sections: [{ title, lines: [text] }], or { title, keywords: true } for the keyword list, or { title, prompt }. */
export const HELP = [
  {
    title: "Getting about",
    lines: [
      "WASD walks and Shift runs. Drag, or use the arrow keys, to look round; scroll, pinch, or press + and − to zoom. On a touch screen there's a stick in the corner: push it all the way, or tap Run, to run. Tap the ground to walk there.",
      "Ctrl, pressed by itself, turns running on until you press it again; Shift still runs while held. Every key named in this Help is the one it starts with. With a keyboard, Menu → Settings → Controls → Keys lets you give any action another key (H to block, say): press the action's button, then the key.",
      "Anyone without a 3D model, you included, can be given a look. The Look button beside the body choice (in People, and by Play as) sets the outfit or each piece of it (None leaves a piece off), the hood and pauldrons, colours (a colour of your own too, for any piece, the hair and the skin), hair, beard and height. Reset goes back to the look their name gives.",
      "Space jumps. C sits you down on the ground wherever you are, and C again lies you down; move, or press E, to get up. The chat window has Jump and Sit buttons, and on a touch screen they're along the bottom, with Run. Settings → Controls has a switch for the C key, for each touch button, and for the chat window's buttons. A home's bed (with Walk into buildings on) is somewhere to lie down. Anyone travelling with you finds a seat or stands by.",
      "There are animals: cattle, a donkey and a horse at farms, a dog or two about the market, a horse by each tavern and inn, and deer, foxes and wolves out in the country (the wild ones run from you). To ride a horse or a donkey, walk up to it and use it. The same keys or stick move it, Shift gallops, Space or Jump jumps (over a fence or a bench, too), and E, Esc or Get down gets you off. It goes into water too: it wades, then swims where it's deep, so you can cross a river with no bridge (you can't get down until it's in the shallows). The saddle, and you, rise and fall with its back. It stays where you leave it.",
      "Avatar: when a persona's or a character's card has a 3D model, their Look card has Avatar at the top. Leave it on their card's model, pick another kind the card has (VRM, GLB / FBX, MMD), or choose Built-in person to use the built-in body and the look below it instead.",
      "A dog and a horse of your own: Menu, then Look beside your persona, has Dog and Horse at the bottom. Pick the coat and the size, give it a name if you like (it's called by it from then on), and choose With you or At home. With you, it follows you, swims after you, and turns up beside you if you leave it far behind or something keeps it from you. At home, it waits by your door (with no home of your own, by the tavern's). Ride your horse like any other; when you get down, it follows you or walks back home. To bring your dog along from home, walk up to it and use it.",
      "While they're with you, the chat window has Call dog and Call horse (it turns up beside you, wherever it had got to; typing /call does the same, and brings one from home), and Send dog home and Send horse home (each asks once more first). The Journal's Party tab lists them with Send home and Call along. Someone in town whose lore gives them a dog or a horse has it at their heel, and their Look card can change it or take it away. Their horse is theirs: you aren't offered it to ride. A dog has five sizes, small to massive (as tall as a horse); a huge or a massive one can be ridden like a horse.",
      "A world that goes on without you: while you play, people who spend time together (an evening at the tavern, a campfire, travelling in your party) slowly grow closer: about a step for an evening, a couple of steps a day at most, a tier in a few weeks. Two short-tempered people sometimes have words instead, and friends who never meet drift apart a step at a time (family and partners don't). Rivals and enemies don't make up just by sharing a room. It all runs on rules: no AI is called, and nothing happens while Wanderworld is closed.",
      "Locks and attraction: in Journal → Edit people, someone's window has a Lock beside each relationship (locked, it never changes by itself, though you, lore or the AI assistant still can) and Attraction, how attractive they find the other, with a lock of its own. Everyone has a view before you touch it; moving the slider sets it, and only one that's set is told to the AI. A relationship you set by hand moves on from where you set it unless you lock it.",
      "What you missed: Journal → Relationships ends with Lately, the world's own record of who spent time with whom and what changed. Coming back into town, or out into the country, after a few hours away tells you what happened there. People in a moment are told only the recent things they themselves were part of. Menu → Settings → People → Relationships has a switch for each: relationships changing, keeping the record, and being told what you missed.",
      "What people remember: each person keeps a short memory of their own: what you said to them or in their hearing, and who they spent time with. When the AI speaks for someone, it's given that person's memories and nobody else's, so it can't know what was said across town, and people can remember different things. Someone you said something to may come over within a few days to bring it up. Journal → Edit people → someone's window shows what they remember and can clear it; Menu → Settings → People → Memory switches it off altogether. Keeping memories costs no AI calls.",
      "Your home: Journal → Home shows where you live and who with. Move into any empty house, and choose which of the people you live with come along (the rest stay where they are). Ask someone to move in, or ask a housemate to leave (they go to an empty house, or the least crowded one). Have someone round: they head for your home and stay about three hours. People who know you and don't dislike you say yes. It all runs on rules, with no AI call; Journal → People still lets you put anyone anywhere.",
      'Furnishing your home: turn on Menu → Settings → World → Places → Walk into buildings, go inside your own home and open Journal → Home. Pick a piece (chairs, tables, a bench, a bookcase, a chest, a barrel, a candle stand and more) and "Put it here": it goes down a step in front of you, facing you, moved in from a wall if need be. Chairs and stools you add can be sat on. "Take away" removes a piece you added. The room\'s own furniture stays as it is. Up to 40 pieces a home, kept with the world.',
      "Hostile people: bandits, witches and wizards are out in the country with the monsters, and act as Menu → Settings → Creatures → Behaviour → \"When you're near\" says (keep their distance, square up to you, or come for you). They're nobody's character: they can't be talked to, and no AI is used for them. Each has its own switch under Menu → Settings → Creatures, and lore can place them (ww:monster:bandit:pack3).",
      "How many animals: wild animals and monsters live out in the country, away from the houses, so from the market you may see none however many there are: walk out past the last houses. Each sort is counted out by itself, so changing one slider leaves the others' animals where they were. Menu → Settings → Creatures has a slider for each sort (stray dogs, farm animals, peaceful wild animals, hostile ones, monsters): that many of the world's own, and 0 for none. Animals a lorebook asks for, and anyone's own dog or horse, are still there at 0 unless you turn that off. Each kind also has a switch: off, there are none of it anywhere, whatever else says. Most in the settlement keeps the town from filling up: any stray dogs and horses over it are put just outside. \"When you're near\" says what a wolf does about you where confrontations are allowed: keeps its distance, squares up to you, or comes for you (you're sent back a step; with combat off, nothing is hurt). Journal → World has Creatures in this world, for one world's own numbers.",
      "Bigger monsters: now and then a monster is bigger than the rest of its kind, and once in a while the first of a group is huge, called a big or a huge troll, ogre or goblin. A bigger one is tougher: more HP, harder blows and more XP. Menu → Settings → Creatures → Bigger monsters sets how often: never, now and then, or often. Bats, wasps, dragons and people keep their usual size.",
      "Where monsters live: with Menu → Settings → Creatures → \"Only where they'd be found\" on (it is to begin with), each kind turns up only where it would be found: lizardfolk, frogs and shambling mounds by water, ogres, trolls and orcs in the hills and mountains, skeletons and ghouls among ruins and graveyards, kobolds and gricks by caves, gnolls and hobgoblins on open ground. Off, any kind that's switched on can be anywhere out in the country. The Monsters slider still says how many there are; if no kind that's on lives anywhere the world has, they turn up anywhere instead. Caves, dungeons and strongholds have their own creatures either way.",
      "New monsters: every so often (Menu → Settings → Creatures → New monsters every, 10 minutes of play unless changed; 0 for never) the monsters out of sight go and others come in their place, so over time you meet every kind that's switched on, the rare ogres, trolls, minotaurs and dragons too. Kinds not about yet are likelier to turn up. Nothing you can see goes, nothing you're fighting, nothing a lorebook placed and nobody's own animal. The Monsters slider is always how many there are: with only trolls switched on and the slider at 100, there are 100 trolls; with other kinds on, a rare kind is only less likely.",
      "Outside each settlement there's a campsite or two: sit on the logs by the fire, or use the tent to lie down awake, or to sleep. Sleeping, you choose how long; the clock jumps on, and everyone not close by is where that hour has them.",
      "People have places to work and rest out of doors: the smith at the open forge, sellers and buyers at the market stalls, a farm's people in its fields, and others at a garden's beds, by a pond or in a meadow's grass.",
      "E, a click or a tap uses whatever the prompt names: a door, a bench, a person, a market stall.",
    ],
  },
  {
    title: "The bar, the Menu and your worlds",
    lines: [
      'Lore is active for the place you\'re in, the places that hold it, and a place you\'re beside: on a riverbank, by a pond\'s shore, at the foot of the mountains, at a cave mouth, beside a road or near a place out in the country, a few metres past its edge. The Lore window marks those "beside you", and the AI and pictures are told ("in Whisperwood, near the bank of the Silverrun"). Menu → Settings → World → Places has the switch.',
      "The bar along the top has the Map, the Inventory (with the Quartermaster package), the Journal, the Lore active where you stand, the Chat window, Illustrate and the Menu.",
      "The Menu has who you play (with their Look), Settings, This world, Save world, Load world, full screen and the main menu.",
      "This world lists the world's name, its id, its Quartermaster sheet, the map seed, the land, the region you're in, who lives there, who's travelling with you, your animals, its lorebooks and its setting. The ids have a Copy button.",
      "Save world saves and sends the world to the Engine at once, and says if the Engine didn't take it. The game also saves by itself as you play, and when you leave the tab or lock your phone.",
      "Load world lists your worlds as the Engine has them at that moment and opens the one you pick. The world you're in is saved first, under its own name; nothing of it goes into the one you open.",
      "Playing on a phone and a computer: worlds are kept by the Engine, so both see the same ones. A browser left open reads them again when you come back to it, and a world played somewhere else since is loaded from there. If one world is played in two browsers at once, the browser that saved it first keeps it and the other loads that save, so don't play one world in two browsers at the same time. The other browser saves nothing more of its copy: it loads the saved one at once, or when you close the menu if it's open, and says why.",
    ],
  },
  {
    title: "Inventory (with the Quartermaster package)",
    lines: [
      "With Quartermaster installed (0.1.35 or later), the bar has an Inventory button: Quartermaster's sheet of what your persona wears and carries, one for each persona in each world. It opens over the game, with your persona's name on it. Without Quartermaster there's no button and nothing here does anything.",
      "What the sheet says you're wearing is told to the AI wherever it's told who you are: conversations, moments, scenes and Illustrate. There's no macro to set up.",
      "After a moment, one more AI call reads what was narrated and updates the sheet (picked up, put on, given away), by Quartermaster's own rules. The chat then says what changed (added, put on, took off, removed); it says nothing when no item changed.",
      "A scene started from the world uses the same sheet (Quartermaster 0.1.37 or later). For the AI to update it during the scene, turn the Quartermaster agent on in that chat.",
      "Menu → Settings → Inventory has a switch for each part: the button, telling the AI what you wear, when the sheet is updated (never, after moments, after moments and replies), scenes using the world's sheet, and the parchment colours. Deleting a world deletes its sheets.",
    ],
  },
  {
    title: "Talking, moments and scenes",
    lines: [
      "Walk up to someone and press E to talk. Pick something to say or type your own. What's offered depends on who they are to you. Someone travelling with you knows it, so they don't greet you as if you'd just met.",
      "The Chat window is for everything else: plain text is said to whoever's near, /s shouts, /w whispers, /p speaks to your party, and /a does something instead of saying it. With the AI on, the narrator tells what comes of it and people nearby may answer. That's a moment: one AI call.",
      "A scene is a full roleplay chat in the Engine. Start one from a card's \"Play it as a scene\", the Chat window's Scene button, or /scene …; when it ends, its recap comes back to the world.",
      "/camp lights a campfire where you stand. /call brings your own dog and horse to you (/call horse or /call dog for one).",
      "What the AI is told about where you are: not only the place's name but how you stand to it. On the bank beside the pond, wading or swimming when you are, inside or outside a building, at the mouth of a cave, on a street. What you sit on is told as what it is: a log by the campfire, a bench, a chair, a stool.",
      "In a moment, each recent line the AI is given says when and where it happened, so it can tell a minute ago here from this morning across town.",
    ],
  },
  {
    title: "Strangers, and people you know",
    lines: [
      "Someone you haven't met is a Stranger until you learn their name: they say it, a note names them, they join you, or you tick it in the \"i\" beside a conversation's title.",
      "It goes both ways: someone who doesn't know your name won't use it until you say it.",
      "Menu → Settings → People chooses whose names show: everyone's, only people you know, or nobody's.",
    ],
  },
  {
    title: "People: managing them",
    lines: [
      'Journal → People lists everyone by faction. "Edit people" opens a window for each person: body, voice, temperament and manner, home and work, their day, what they are to you and to each other, how they act towards you, and who knows whose name.',
      'Three things decide how someone behaves. What they are to you (friend, rival, sister) is the relationship. Temperament and manner are what they\'re like with everybody. "How they act toward you" overrides both, for you alone: a sister can be rude, an enemy afraid.',
      "People with a character card keep who they are and their looks from the card. People a world made for itself can be changed entirely.",
    ],
  },
  {
    title: "Your party: following, sitting together, and in a fight",
    lines: [
      "The people travelling with you walk behind you, close, normal or loose (Menu → Settings → People → Your party → How closely they follow). Normal and loose give them room: a little further back and out to the sides, and when you stand still a few seconds they wander a step or two and look about. They hurry back when you move off, and run when they fall behind.",
      'When you sit or lie down (a bench, a log by a campfire, a bed, a tent, or the ground with C), each of them takes a free seat near you, or a free bed when you lie down on one. With none free, they sit on the ground beside you. If you\'re on a log, a bench, a bed or a tent\'s bedroll, one of them asks in the chat whether they can squeeze in beside you: answer with the Yes or No buttons, or type yes or no. Up to four of you fit on one, closer the more there are, and the chat and the AI are told you\'re squeezed together. "With no seat for them" can have them just squeeze in, or never share; "The AI words their asking" (off to begin with, one AI call each time) has the AI write what they say. They get up when you do.',
      "A campsite's tent has Lie down as well as Sleep: lie down awake, to rest and talk as on a bench, with the time going on as usual. Your party may lie down beside you there too.",
      'In a fight (Settings → Inventory → Combat), each of them moves about by how they fight, instead of keeping their place behind you: one who strikes closes in on a creature and works round it, an archer keeps their distance where nothing\'s in the way of a shot, and a caster stays back behind you. In turn-based combat they move on their own turn, as far as a turn allows. When the fight is over they come back to follow you. "They move about in a fight" turns it off.',
    ],
  },
  {
    title: "Your look: the built-in body",
    lines: [
      'Underwear: each body has underwear styles to choose, top and bottom, in the Look card. Menu → Settings → People → "Default skins with underwear" (on to begin with) dresses anyone who has none chosen in the usual: a bra and briefs, or briefs. Off, the base skin shows unless underwear is chosen. A choice made by hand always wins.',
      "Without a 3D model of your own you are Wanderworld's own body, male or female, made in Blender. The Look button beside your persona (or Look on anyone in town) opens its card, with a small turning picture of them at the top. Each part folds away: Presets, Body, Build, Face, Colours, Underwear and Hair.",
      "Build has height, weight, muscle, chest, hips, waist, belly, shoulders and neck, and arm length, leg length and head size. Face has the jaw, cheekbones, nose, eyes and pointed ears. Each slider's middle is an everyday person; drag one and the picture follows, let go and it's set. Anything you never touch comes from their name, so everyone in town looks a little different.",
      "Body also has the age: young adult, middle-aged or old, which changes the face and build a little and the skin picture's lines (lore words old, elderly, grey-haired and middle-aged set it too). Face also has a brow style and a lash style.",
      "Colours: the skin is a skin picture (Caucasian, African or Asian) or the plain skin in a colour of your own; the eyes a real eye picture or the plain grey eye in a colour of your own; lips, nails and brows each from a list or a colour of your own. Underwear: a top and a bottom, or none, and their colour. An outfit piece covering it hides it.",
      "Presets: save a look under a name and start anyone's Look card from it, or from a ready-made one. Yours are kept with your settings, so they're there in every world; Export saves one as a small file and Import reads one back.",
      'Townsfolk without a model of their own get the same body, shaped by their name and by their lore: ww:looks:tall, ww:looks:stocky, ww:looks:red hair, ww:looks:elf for pointed ears. Menu → Settings → People → "Townsfolk use the new bodies" turns that off, for the lighter Quaternius townsfolk on a slow phone.',
    ],
  },
  {
    title: "Making a world",
    lines: [
      "Where worlds are kept: by the Engine, in Wanderworld's own storage there, so they're the same from any browser or device that opens your Engine, and can grow as big as they need. The game's and the AI's settings (the living world, animals, memories, connections, narrators, what calls the AI) are kept there too; graphics, controls, sound and what's shown on screen belong to each device. If the menu says Wanderworld isn't fully loaded, restart the Engine.",
      'New world: a name, who you play, who lives there, the land, and under "Setting the world up" how much the AI does for you.',
      "The AI can set your characters up from their cards (bodies, homes, work, relationships), read your lorebooks and tie their lore to places, write the world's own lore and places from nothing, and invent people to live there. Each is an AI call or two, and you see all of it before the land is built.",
      "Or do it by hand: lorebook keywords (below), and the Journal for anything else.",
      "Layouts: a grid of streets, a crossroads, one street, round the market, scattered houses with no streets, round a pond with the houses at the edge, or four quarters and a green. Ground a layout leaves open gets a pond, a few houses, gardens and meadows.",
      "Ages: the usual ages of people the AI invents (21 and up unless you change it; any age from 1). Your lore, setting and cards always win over it. Journal → World changes it later.",
      "The first map on New world is an idea, not a promise: lore adds places. With the AI, the review shows the real map, and Reroll the map there changes only the land.",
    ],
  },
  {
    title: "Settings, and where things are",
    lines: [
      "Menu → Settings is in sections, and a section with a lot in it has tabs of its own. Each setting has an (i) before its name: point at it to read what the setting does, or tap it to keep the line open. Display → On screen → Show explanations shows every line at once, with a line at the top of each section and each Journal tab saying what it's for. New world's lines each have an (i) too.",
      "Display: graphics, what's shown on screen, sound. Controls: moving and the camera. World: time, weather, places, factions, vendors. People: how they act around you, their relationships, their memory, and the genders of people the game or the AI makes up (male, female, and a custom one you name; lore, cards and your own choices always come first). Inventory: what you carry, your sheet, gathering, shops, combat and the 5e rules. Creatures: the animals and monsters, how many, which kinds, how they behave. AI: what the AI writes, scenes, pictures, connections. Token use: everything that affects what the AI costs, in one place.",
      "A setting indented under another only matters while that one is on, and is faded while it's off.",
      "Regenerate this world (Settings → World → Places) builds the world again, and asks what New world asks about the land: hills, mountains, a river, the kind of settlement and its layout, walls, the market, streets, the world's size, more settlements, farms, landmarks and places out in the country. Each starts as it is; change any of them and the map shows what you'd get. Your people, relationships, lore and names stay, moved to the same kind of place.",
      "Vendors, at least and at most: New world (the land step) and Regenerate have a row for each trade. At least 2 smiths: a second smithy is built. At most 1 apothecary: any more sell something else, or shut if nothing has room. Empty boxes leave the town as it comes. Trades you set by hand in Settings → World → Vendors are counted and never changed.",
      "Journal → Edit people opens someone's own window, in tabs: About, Day, You, Others and Memory. Journal → World is in tabs too (This world, Setting, Creatures, Lore). New world is a walkthrough in four steps, with Next and Back: you and your people, the land, the AI (its connections and main switches, so they're set before a world is made), and lore and setup. Each step says what to know before you start. On the land step, a Massive world can have at least one of every kind of place (an inn, a cottage, a cave, a hamlet, a farm, ruins, a watchtower, standing stones, a graveyard, a mill, a pond), with two of a kind kept well apart.",
    ],
  },
  {
    title: "The AI assistant",
    lines: [
      "Menu → Settings → AI assistant is a chat about the world you're in. Ask about its people, places and lore, why a lore entry is or isn't active where you stand, or how something works.",
      'Ask for a change and it proposes one: "make Jake and Sarah a married couple who live together", "add a blacksmith\'s apprentice who lives with Oswin", "Mira works mornings and is at the tavern every evening", "call the tavern the Drowned Bell, closed after midnight", "make a Thieves\' Guild with Jake and Fen", "pin a note about the lost cat".',
      "You see every change in full first (rewritten lore shows what it says now), and nothing happens until you press Confirm. Before that you can rewrite any text it wrote (or have it written again), change its choices (a relationship's kind and strength, a home, work, body, voice), and untick a change to leave it out. Cancel drops it all. After a Confirm, Undo these changes takes back what the assistant changed, and only that: anything you've changed yourself since stays.",
      "It can set relationships, homes and work, days, body, voice, temperament, manner, how someone acts towards you and who knows whose name; add people and remove ones this world invented; write this world's own lore about a person, a place or the whole world (keeping the detail that's there); rename places and set when they're closed; make groups of places and factions; change the setting, the picture look and the ages; pin notes and give you an errand.",
      "It can also write a faction's lore (every member then knows it), take notes down from the noticeboard, drop your errand, and suggest a scene that starts in the Engine when you confirm. Ask for people while you're in another region and they live there.",
      "The assistant can look after memories too. Under More things to ask: Check memories against the lore, Clear out memories that don't matter, Find repeated memories, Sum up old memories (several everyday ones into one lasting one) and Suggest memories to pin. Sum up old memories also has a button in Settings → People → Memory, in Settings → Token use, and in each person's window in Journal → Edit people. Each first asks whose memories to send (a tick for each person, or All characters' memories) and says roughly what it costs in tokens. What it proposes (a rewording, a deletion, a pin, a new lasting memory) is shown in full for you to change or leave out, nothing happens until Confirm, and Undo brings it back.",
      "What it's sent, and what it looks up: everyone's name, home and work always go, with the titles of your lore; the rest goes when the request needs it. When it needs more, it looks it up itself, up to three times before answering: a lore entry by title or by words (this world's own and the lorebooks chosen for it; yours are read-only), everything about a person, what someone remembers, or a part of the world that was left out. Each look-up is one more AI call. The line under each answer says what was sent and what it looked up. For a question about how something works, it reads the parts of Help that match it first, then the rest, up to the number of tokens set in Settings → AI assistant (10,000 to begin with; all of Help is about 13,000).",
      "The buttons under the chat are ready-made requests, for when you don't know what to ask: a few always in view, and More things to ask lists the rest with what each does. One ending in … is put in the box for you to finish.",
      "Draft ww: keywords (in that list) lets you pick a lorebook and tick its entries, twenty at most. Only those are sent, and you get each entry's keys as text to copy into your lorebook: the assistant can't change Engine lorebooks.",
      "Only the parts of the world your message needs are sent with it, and the small line under each answer says which. If the model needs a part that was left out, it asks, and is asked again with it (a second call). The chat is kept with the world; Start over forgets it.",
      "It only changes the world you're in. Your character cards, personas and lorebooks in the Engine, these settings, the map and the buildings are never touched.",
    ],
  },
  {
    title: "AI, and what it costs",
    lines: [
      "Settings → Token use has every setting that changes how many tokens are spent, in one place: which things call the AI, how long replies are, how many memories are sent. They're the same settings as in AI and People → Memory, so a change in one place shows in the other. It also says what else adds up, and how to see exactly what is sent.",
      "Every AI call uses one of your Engine connections. A reply in a conversation, a moment, a day planned, a scene planned, a picture, a picture's prompt rewritten and a message to the AI assistant are one call each. Walking about calls nothing.",
      "Illustrate paints the moment. With \"Have the AI rewrite the prompt before painting\" on, a model turns the facts into one full paragraph (each character's name and looks, what they're doing, the place, the light, a camera angle), and the last lines of the chat go with it, so the picture shows what you're doing now, not only where you stand. The instruction is yours to change, and there's a tag-style one for models that want tags. Lines that describe other places (told when you arrived there) are left out of what it's given (Settings → AI → Pictures has the switch), so a picture isn't of two places at once. If the place you're in hasn't been described in the chat yet, it's told first (there's a switch for that too).",
      'If your pictures are painted on this computer, the game and the painter share one graphics card. Settings → Display → Graphics has a frame rate limit (30, 60, 100 or none), and "Draw slower while a picture is painted", which holds the game to 30 frames a second until the picture arrives.',
      "Settings → Display → Graphics → Creature detail distance: monsters and people further from the camera than this (Near 20 m, Normal 35 m, Far 60 m) are drawn with fewer triangles, which you hardly notice at that distance and which keeps a crowd of them quick on a phone. Always full detail turns that off.",
      "Prompt caching: some AI providers charge less for the start of a prompt they've just seen. Wanderworld sends what never changes first (the world, your narrator's card, the world's lore, your party, the lore of the place, who else is near) and what changes last (the time, what each is doing, what was just said). In a conversation, and in the AI assistant's chat, the changing part goes after what was said; Menu → Settings → AI → Order prompts for caching turns that off, if a model starts talking about its \"context\". Whether anything is cached is up to your provider.",
      "Menu → Settings → AI has a switch for each thing that can call the AI. With one off, the world answers with its own written lines.",
      "Narrator cards (your own characters): one for the world as you walk it (keep it short: a voice and a few rules), and one for scenes, which also lets a scene start with nobody else there. They can be the same card or two.",
      "What people are to you, and to each other, is told to the AI as it is (brother, employer, good friend, bitter rival); how they speak is their own, from their card and lore. A manner you set by hand (rude, afraid…) is told too.",
      "A separate call for each person who answers (Settings → AI → Writing, off to begin with): the strictest separation. Each person's reply is written by a call that's given only what they know. Slower, and up to four calls a moment.",
      "To see exactly what is sent, turn on the Engine's Debug Mode (Settings → Advanced): every request to a model and its answer, and every picture request with its connection, model, size and prompt, is written to the Engine's console.",
      "Menu → Settings → Debug shows the same in the game, with Debug Mode on or off: an overview that adds up requests, answers, failures and tokens (sent, received, cached, reasoning), and a list of the newest 50 calls, each opening to what was sent and what came back. It's kept in memory only and is gone when the Engine restarts. The cost is an estimate: each call's token counts times the prices in its connection's model list, the ones the Engine's model picker shows. What the provider actually charged isn't passed on to Agents. A connection that reports no token counts, or has no prices, is marked as such. Only Wanderworld's own calls are listed, never another Agent's.",
    ],
  },
  {
    title: "Your sheet, items and money",
    lines: [
      "Inventory, on the top bar, opens a window in tabs. Items: what you carry, from Quartermaster, each with Equip or Take off, Use and Drop. What you do there is done on Quartermaster's sheet too, and said in the chat. Using something applies what its description says: a potion described as +10 HP heals 10, and one of a stack is used up. Sheet: your level, experience, HP, mana, AC and six attributes, with boxes to change them, ticks to choose what the AI is told, and a form to add your own stats, skills, feats and spells. Worn items whose descriptions say things like +2 AC are counted. Craft and Hotkeys are described below. Quartermaster: opens its own window for slots, outfits and pictures.",
      "Gaining a level raises your maximum HP (by 4 plus your Constitution modifier) and your mana (by 2), and restores your HP; the chat says so.",
      "Your ticked stats are told to a scene too, as a block at its start. Things you add to the sheet have a description you can edit: for a feat or a spell, the description is all the AI knows of it.",
      'A line of the sheet you untick moves to "Not in use" at the bottom, out of the way and not told to the AI; tick it there to bring it back. One you added yourself can be deleted there.',
      "The AI can keep the sheet for you (Menu → Settings → Inventory → \"The AI updates your sheet\", off to begin with): after something is narrated, it answers with what changed, such as HP lost or experience earned, and a note in the chat says so. When both are on, it shares the inventory tracker's AI call, so the two cost one call; on its own it's one more call each time.",
      "Your purse is the item named for the world's money. Inventory → Items shows how much you carry and lets you rename it (gold, caps, gems). Because it's an ordinary item, Quartermaster's tracker handles \"you pay 5 gold\" in narration.",
      "Dice: type /roll for a d20, or /roll 2d6+1 for other dice. /check strength rolls a d20 plus that line of your sheet (an attribute adds its modifier, a skill its number). With words after it, as in /check strength to lift the gate, what you try is then narrated with the result.",
    ],
  },
  {
    title: "Abilities of your own",
    lines: [
      'Inventory → Sheet → "Add your own ability" writes something you can do onto your sheet: a name and what it does, and if you like a number of uses and when they come back (per short rest, per long rest, per day; left empty, it\'s at will), dice for what it does (damage, or healing), and a saving throw against it (a DC and the ability it\'s made with). "Fire Breath, 2 uses per short rest, 2d6 damage, DC 13 Dexterity" breathes fire at what\'s in front of you, and whatever fails the save takes it all, half if it makes it.',
      "Use it with its Use button on the sheet, from Abilities on the fight bar (in turn-based combat it takes your action), a number key (Inventory → Hotkeys), or by typing /use and its name in the chat (/use Fire Breath). A use is counted off each time, and the uses come back with a short rest (the Sheet's button), a sleep (a long rest, which brings back the per-day ones too), or each new day. One with damage dice needs combat on; one with healing dice heals you; one with no dice is told in the chat as done.",
      'The AI is told your abilities with your sheet, with how many uses are left. Edit changes one in place; untick it and it moves to "Not in use", where Delete takes it away. Your companions can have abilities too: Inventory → Sheet → Your companions → "Add an ability for…". In a fight they use theirs now and then while they have uses: damage at the creature they\'re after, healing on you when you\'re hurt (or on themselves).',
    ],
  },
  {
    title: "Gathering, crafting and shops",
    lines: [
      "Gathering: where there's something to gather, buttons appear in the chat window under Jump and Sit, each only in its own place. Fish beside water. Chop wood standing at a tree: each stroke may give a piece of wood, and the fourth brings the tree down, where it stays down for a week (a setting). Forage in the woods: what you find follows the season, and in winter it's only sticks, flint and fibre. Mine at a boulder or a cave. Harvest on a farm in summer and fall. Each try rolls a d20 plus one of your attributes: under 8 finds nothing, 18 or more finds two. What you find goes into your inventory, and food says what eating it gives. A patch gives nothing more of that kind until the next day (Menu → Settings → Inventory sets how long).",
      "At a tree, a boulder or the water's edge, a prompt at its foot names what you can do there (Chop wood, Mine, Fish): press E, or tap the prompt on a touch screen. Your character turns to face it. Foraging and harvesting prompt when you stand still away from those. The same are buttons in the chat window. A felled tree leaves a stump, and a mined boulder is smaller until it has had its days.",
      'A better tool gathers better: one whose description says "+2 gathering" adds 2 to the roll, so it finds something, and two of it, more often. The smith\'s iron tools have it.',
      'Tools: chopping needs an axe, mining a pickaxe and fishing a rod, carried in your inventory. Anything named for one counts, so a tool you were given or made yourself works. An axe or a pickaxe can also be swung as a weapon, and says so in its description; a fishing rod can\'t. Menu → Settings → Inventory → "Gathering needs tools" turns the need off.',
      'Crafting: Inventory → Craft lists what you can make, with what each needs and how many of it you have. The first tools (a stone axe, a stone pickaxe, a fishing rod) are made from a fallen branch, flint and plant fibre, all found by foraging. You can also cook fish, twist cord and make a torch, and more recipes come as you level up. "Make something new" at the bottom lets you put things together, name and describe what it makes, and save that as your own recipe, which then needs those same things each time.',
      "Shops: at the door of a vendor, or inside it, a Shop button appears in the chat window with the shop's name. The smithy sells tools, weapons and armour; a town's shops are a mix of general stores, apothecaries and tailors (the button says which); a tavern or an inn sells food and drink. A building named for a trade sells that. Buy with what's in your purse. Sell lists what you carry with what this shop pays: half a thing's worth for what it deals in, and a quarter for anything else. Shelves are restocked every three days (a setting), with different things. A shop that's shut for the night doesn't trade.",
      "Market stalls trade too, by day: stand at one and the Shop button appears. Haggle, in a shop's window, rolls a Charisma check once a day at each vendor: it may take a tenth or a fifth off the prices for the rest of the day, leave them, or put them up. While a shop's window is open, Quartermaster's tracker doesn't run, so talk of buying something doesn't put it in your bag before you've paid.",
      'A vendor\'s sign shows its name once you give it one, and its trade otherwise ("Apothecary", "Smith & Tailor"). In Menu → Settings → World → Vendors you can name a vendor, write what it in particular should stock (for the AI), rewrite a trade\'s guidance, and make trades of your own with a name, guidance and a list of goods.',
      'Menu → Settings → World → Vendors lists every vendor in the world. Tick the trades a shop has (one shop can have several), or open "Empty houses" and make a shop of one, if your world came without a trade you want. With "The AI stocks shop shelves" on (Settings → Inventory → Shops, and under AI), the AI writes each shop\'s stock to fit your world when it restocks.',
    ],
  },
  {
    title: "Fighting",
    lines: [
      "Fighting is off to begin with (Menu → Settings → Inventory → Combat). Set it to Real time and F swings, Q blocks, R dodges, and X draws your weapon or puts it away. With it drawn, the camera stays behind you: turning the camera turns you, and you step sideways and backwards without turning away, as in an action game, animated as that. You can swing without drawing. On a touch screen, a Combat button by your thumb swaps Run, Sit and Jump for Attack, Block and Dodge, and back; the chat window has those three as well.",
      "A block lasts about a second, and an attack on you during it is rolled twice with the worse roll counting. A dodge rolls you a few steps (onward if you're moving, back if you're standing), and nothing lands on you mid-roll. You swing wherever you face, and can keep walking or running while you do. Nothing is aimed at: whatever animal is in front of you and in reach when the blow lands takes it, and a swing at nothing is just a swing.",
      "Each blow is an attack roll: a d20 plus your Strength modifier and your weapon's bonus, against the creature's AC. Under it misses, at or over it hits, and a 20 on the die is a critical hit that rolls the damage dice twice. A weapon is anything whose description gives its damage in square brackets ([1d8 damage, +1 to attack]): the one you have equipped, else the best you carry, else your fists. A hostile creature you strike fights back, its attacks rolled against your AC the same way. One badly hurt may run: the blow that first leaves it a quarter of its HP or less (half, for a coward) has it make a Wisdom save against DC 10, and undead, oozes, constructs and the mindless never run. You can chase one that runs and strike it; by turns it stays in the fight, running on its turns, until it is 24 metres away. After a minute it may come for you again. A peaceful animal (a deer, a cow) runs when struck. Your own animals can't be struck. Beating a creature earns experience. The chat tells every roll.",
      "A bow, a crossbow or a sling you carry is shot with the same key when nothing is in reach of a swing: at whatever is ahead of you within its range (24 metres unless its description says Range and a number), by a d20 plus your Dexterity modifier. The smith sells a shortbow and a light crossbow. Arrows aren't counted. While swimming, a swing is at a disadvantage unless it's with a dagger, a javelin, a shortsword, a spear or a trident. You can swing, shoot and cast from the saddle, and in turn-based combat the mount's speed is how far you go: 18 metres on a horse, 12 on a donkey.",
      "Z casts the spell that's ready; if nothing is in front of you, you first turn to the nearest enemy it can reach (a bow does the same). Spells come from the 5e SRD and from you, and nowhere else: Inventory → Sheet has a list of the SRD's spells of level 0 to 9 to add from, and you can write your own. A spell is a line of your sheet whose description says what it does by rule, so one you add can be rewritten. A cantrip costs no mana; other spells cost their level in mana (1 for a first-level spell, 2 for a second, up to 9 for a ninth). Each spell has a button in the chat window, and casting one makes it the ready one. A healing spell mends you.",
      "A spell flies at the nearest creature ahead of you within its range (and at a person, where blows can land on people). A spell attack is a d20 + 2 + your Intelligence modifier against AC; a saving throw is the target's roll against 10 + your Intelligence modifier; some spells need no roll. What a spell leaves on its target is written in its rule. Stunned, paralyzed, restrained, incapacitated, asleep and prone hold a target where it stands; frightened sends it running; slowed halves its pace; blinded or hindered, its attacks are rolled twice with the worse counting; marked, your blows on it are rolled twice with the better counting; charmed or calmed, it stops fighting until it's hurt.",
      "Pushed 3 m shoves it back (Thunderwave, on a failed save). Area 6 catches everything within that many metres of the target, each rolling for itself (Fireball). Heals the caster for half gives you back half of what it dealt (Vampiric Touch). A cantrip whose rule says Grows with level rolls its dice again at levels 5, 11 and 17. A rule that says Higher: +1d6 a level adds that for each level of spell slot above the spell's own, where spells are cast with slots. Area 2.5 (cone), (line), (cube) or (burst) is the area's shape, which is also how the spell looks as it's cast. Your own spells can use the same words. Where turn-based combat uses spell slots, your sheet and the spell buttons show slots instead of mana.",
      "The number keys 1 to 0 are hotkeys, and you set what each does in Inventory → Hotkeys: cast one particular spell, use up something you carry (a potion), or put something on and take it off again (a weapon, armour, clothing; only what has a slot in Quartermaster can be put on). The ones you've set are buttons in the chat window too. Mana and HP come back slowly while you sit or lie down, and fully when you sleep (Settings → Inventory → Combat).",
      "The people travelling with you fight too, in real-time combat. Each has a class from the 5e SRD (Inventory → Sheet → Your companions; one of their own until you choose), which gives them a weapon and spells. They strike what comes within reach, cast at what doesn't, and one who can heal mends you when you're below half your HP. They move with the fight: one who strikes closes with a creature and works round it, and one who casts keeps a few paces off. Creatures go for them as well as for you. Each has HP from their class; at 0 they're out of the fight for a while, then get up, and they're whole again once a fight is well over. Settings → Inventory → Combat turns this off.",
      "Your companions fight by the same rules where they can: their attack bonus and HP go by their level (their card's 5e sheet, else yours), a rogue adds a Sneak Attack when someone is beside the creature, a paladin a Divine Smite once a fight, a barbarian rages, a fighter takes a Second Wind below half HP, and those with Extra Attack strike twice from level 5. A creature's venom and conditions land on them as on you. With death saving throws on, one at 0 HP falls, dying, and rolls every few seconds; a healer among them, or a healing spell of yours aimed at them, gets them up, and nobody dies. Companions fight by class: barbarians, fighters, monks, paladins and rogues close in; rangers and casters keep off and take cover. A companion who is a fighter, a ranger or a rogue shoots a crossbow or a bow when a creature is out of reach, and so does someone fighting back.",
      'Creatures\' numbers (HP, AC, attack, damage) are the 5e SRD\'s where it has the creature, with "Creatures use the 5e SRD\'s numbers" on (it is to begin with); off, they\'re the game\'s own. Weapons and armour go by the 5e SRD (Settings → Inventory → 5e rules). While "An item\'s description is its stats" is on, a thing does what its description says ("[1d8 slashing damage, +1 to attack]", "[+2 AC]"), and only one that states nothing goes by its name. Off, the name decides: anything with sword, knife, dagger, axe, hammer, mace, spear, staff, bow or crossbow in its name is that SRD weapon, and leather armor, a chain shirt, scale mail, chain mail, plate and a shield are that armour. Armour you wear sets your AC in place of 10 and limits how much of your Dexterity counts; with none, your AC is 10 plus your Dexterity modifier. Attacks and spells add a proficiency bonus that grows with your level.',
      "Some creatures resist a kind of damage, shrug it off or can't bear it: a skeleton takes a blunt blow twice over. Creatures use their special attacks (a switch in the same place): a wolf's bite can knock you prone on a failed Strength save, a pack attacks with advantage, venom does more on a failed Constitution save, a frog holds you, and a dragon breathes fire and then has to wait for it to come back. Creatures shoot and cast too (Settings → Inventory → Combat, with the SRD's numbers on): a bandit has a light crossbow, a puglin and a skeleton a shortbow, a wizard Fire Bolt and Magic Missile, a witch Sacred Flame.",
      "Conditions that land on you show at the top left with their seconds. Prone, restrained or blinded: your attacks are rolled twice with the worse counting, and attacks on you with the better. Poisoned or frightened: your attacks are rolled twice with the worse counting. Grappled or restrained: you can't move (grappled, you try to break free every few seconds, or at the start of your turn). Paralyzed, stunned or asleep: you can't move or act, your Strength and Dexterity saves fail without a roll, and attacks on you have advantage. Slowed: you move at half pace. In turn-based combat, getting up from prone takes half your movement.",
      "As the SRD has it, an attack that hits someone paralyzed or asleep (the SRD's unconscious) from within 1.5 m is a critical hit, and their Strength and Dexterity saves fail. That goes for you, your companions and creatures alike. Where the game is simpler than the SRD on purpose: a blow that lands always deals at least 1 damage.",
      "With Death saving throws on, at 0 HP you fall, dying, and roll a d20 every few seconds: 10 or more is a success, less a failure, a 1 two failures, and a 20 gets you up with 1 HP. Three successes and you come round with 1 HP; three failures and you're beaten. A spell whose rule says Concentration ends when you're hurt and fail a Constitution save (DC 10, or half the damage), or when you cast another such spell. A tree or a boulder between a shot or a spell attack and its target is half cover: +2 AC.",
      "Inventory → Sheet has your build, all of it optional: a race (it adds to your abilities, and a dwarf, a gnome or a halfling goes 7.5 metres a turn), a class, a fighting style where the class has one (Archery, Defense, Dueling, Great Weapon Fighting), a background, and the skills you're proficient in, which add your proficiency bonus (Perception to noticing what comes for you, Athletics or Acrobatics to breaking a hold). A class adds its proficiency to two saving throws and gains more as you level up: a rogue's Sneak Attack (more dice once a turn with a finesse or ranged weapon, when you have advantage or a companion is beside the target), a monk's bare hands and Ki, a barbarian's Rage, a paladin's Lay on Hands and Divine Smite, a bard's Inspiration, a cleric's Turn Undead. What a class can call on is a row of buttons in the Sheet tab, can go on a number key in the Hotkeys tab, and is on the bar in turn-based combat.",
      "A druid has Wild Shape from level 2 (Abilities): you take the shape of a beast picked in Inventory → Sheet, a wolf to begin with, and fight with its HP, AC and attack instead of yours. You can't cast while in it, and you return to your own shape when its HP run out (what's left of the blow is yours to take) or when you choose Own shape.",
      "Short rest (the Sheet tab) spends hit dice to heal, a die plus your Constitution modifier each, and brings back what a short rest restores; a sleep is a long rest. If your persona's card has a sheet for the Engine's 5e ruleset, it's taken into each world once: class, level, race, background, abilities, max HP, skills and the spells Wanderworld can play. Change anything afterwards as you like; the Sheet tab has a button to take it from the card again. A companion with such a sheet on their character card fights by it (class, max HP, spells) unless you choose a class for them. Settings → Inventory → 5e rules turns this off.",
      "Worn magic from the SRD is known by its name, like weapons and armour: a Ring of Protection (+1 AC and saving throws), Bracers of Defense (+2 AC with no armour or shield), an Amulet of Health (Constitution 19), Gauntlets of Ogre Power (Strength 19) and others. A potion heals by its dice: a Potion of Healing is 2d4+2, and any description with dice and HP in it (+2d4+2 HP) is rolled when it's used. A beaten creature that carries money (a bandit, a goblin or hobgoblin, an orc, a puglin, a skeleton, a ghoul, a witch, a wizard, an imp, a troll, a minotaur, a dragon, and others like them) has pocket treasure on it when you search it: coin, sometimes a potion, rarely a magic item.",
      "More to do in a fight (Settings → Inventory → 5e rules), on the bar in turn-based combat, as buttons in the Sheet tab, and on number keys: Shove (your Athletics against the creature's; it's pushed back and knocked down), Grapple (the same contest; it's held where it is for a while), Help (a companion's next attack has advantage), Hide (your Stealth against what the creatures near you notice; hidden, nothing comes for you and your next attack has advantage, until you attack or cast) and, with two light weapons equipped, an Off-hand attack as a bonus action. Ready (Moves) holds your attack: it goes off by itself at the first creature that comes within reach in the next six seconds, or before your next turn. Shield and Counterspell, added to your sheet from the SRD's list, cast themselves when they'd help, once every six seconds.",
      "Aiming: in turn-based combat, or with your weapon drawn in real time, tap or click a creature or a companion to aim at them. A ring marks them: red for a creature in reach of what you fight with, grey for one out of range, green for a companion. Your attacks and spells then go for that creature whichever way you face, a healing spell mends that companion instead of you, and anything too far away says Out of range and costs nothing. Tap them again, or yourself, to stop aiming.",
      "In a fight there's also a row of buttons, Abilities, Moves and (on a touch screen) Spells: each opens to what it holds, with a Back button, and a kind with nothing in it isn't shown. Where combat is turn-based, a button's letter says what it takes of your turn: (A) an action, (B) a bonus action; a number beside it is the spell slot's level or how many uses are left.",
      "Item stats are written in square brackets in a description, and only what's inside them is read: A notched blade with a pale blue glow. [1d8 slashing damage, +1 to attack]. A weapon's block can say its dice and kind of damage, +N to attack, Range N, finesse and light; something worn, +N AC or +N of any stat on your sheet; something used up, +N HP, +N Mana or dice of HP; a tool, +N gathering. A weapon's block can also say two-handed, versatile and its dice in both hands (versatile 1d10), reach (a swing lands a pace and a half further off), thrown and a number of metres (it's thrown at what's out of reach of a swing, by Strength) and heavy (halflings and gnomes swing it at a disadvantage). An item with no block goes by its name. The Inventory window has the whole list behind the (i) at its top, and the Lore window has the same for lorebook keywords.",
      "+5 Max HP raises a stat's maximum: while the item is worn, or for good when it's used up. A used-up item changes any number on your sheet for good: +15 HP mends, +1 Souls adds to a stat of your own that has no maximum, +1 Strength raises it. The six abilities answer to str, dex, con, int, wis and cha wherever a stat is named.",
      "What you carried before this was converted once: its loose stats were moved into a block. Things the game adds to your bag are given the slot they're worn or held in. Quartermaster's tracker is told the format, so a new item from the story can have stats, while one that has a block is left alone (Settings → Inventory → Items).",
      "Creatures fight by their sort (Settings → Inventory → 5e rules): of the bandits, some close in, some shoot and some cast, and goblins, hobgoblins, gnolls, kobolds, puglins and skeletons are fighters or archers, each always the same one. One that shoots or casts keeps its distance, backs off when you crowd it, and puts a tree or a boulder between you where there is one. A caster chooses its spell: an area spell when you stand together, a hold now and then, sometimes its strongest, and it heals itself when badly hurt; its greater spells run out for the fight. Talk in fights (Settings → Inventory → 5e rules) has creatures and companions say things now and then, and the AI can write those lines. In turn-based combat, the AI can choose each creature's move from the moves it really has; it waits a few seconds for an answer, then the creature does what its sort does.",
      "People can't be struck unless you turn on \"Blows can land on people\" (Settings → Inventory → Combat). Then a blow on someone is rolled like any other, they remember it for good and become your enemy, whoever saw it remembers, and at 0 HP they lie out cold for a couple of minutes before getting up. Nobody dies. In real-time combat they fight back (\"People you attack fight back\", on to begin with): they swing their class's weapon or cast its spells at you until they're down to a third of their HP, you go down or get well away, or you've left them alone for most of a minute.",
      "At 0 HP you go down. Then, as Settings → Inventory → Combat says, you come to where you fell with 1 HP, wake at home with half, or stay down: lying where you fell while the chat and the narration carry on, until you press Respawn at the top of the screen. If you're ever stuck, down or otherwise, Menu → Settings → Debug has a Respawn button that puts you at your door on your feet. Nothing is lost, unless you set a defeat to cost a quarter of your money or your experience towards the next level. Undefeatable, on the same page, keeps your HP, mana and other resources at their maximum.",
      "A creature you beat lies where it fell for a few minutes (a setting; 0 keeps it). Stand at it and the prompt says Harvest for an animal (hide, meat and the like go into your inventory, and the body goes) or Search for an outlaw (what they carried). You can also carry something beaten: stand at it and the chat window has a Carry button; you walk slowly under it, and the prompt puts it down again. Settings → Inventory → Combat has a button that clears everything lying about. What you beat stays gone for some days (a setting).",
      "Combat can also be turn-based: a fight stops the clock for those in it, everyone rolls initiative, and they act in that order. A fight begins the moment a creature starts coming for you, before it can land anything. Its Stealth is rolled against your passive Perception (10 plus your Wisdom modifier), and if you don't notice it you're surprised: you and your companions lose your first turn.",
      "On your turn, a circle on the ground shows how far you can go: anywhere inside it, and back again, as often as you like, but not past it (nine metres from where the turn began). You have one action (Attack, Cast a spell, Dash, Disengage, Dodge, or use something you carry by its hotkey) and one bonus action (a spell cast as one, such as Healing Word); then end your turn with T or the bar's button. Dash doubles the circle for the turn. Dodge has every attack on you rolled twice until your next turn. Walk out of a creature's reach and it gets one strike at you as you go, an opportunity attack, unless you took Disengage. Creatures with a bow or spells use them from where they stand.",
      'Inventory → Sheet → Your class is optional: a fighter has Second Wind and, from level 2, Action Surge, and more attacks for one action from level 5; a rogue from level 2 can Dash or Disengage as a bonus action; a barbarian can Rage. How many actions, bonus actions, attacks and metres a turn gives are numbers in Settings → Inventory → Combat: 0 leaves each to the rules, anything else is yours. Companions and creatures take their turns by the same rules, and a bar along the top shows the order, whose turn it is and what you have left. Leave the fight breaks it off. With "Turn-based combat uses spell slots" on (Settings → Inventory → Combat), a spell is cast with a spell slot of its level or higher, as the 5e SRD has it (a full caster\'s slots for your level, back after a sleep), and mana is left alone.',
      "No AI call is made in a real-time fight. Combat can also be set to A narrated moment (when a creature reaches you, or you press Attack with one in reach, the game rolls one exchange of blows at once and the AI tells it as rolled; then the creature holds off a few seconds) or to A scene (the meeting opens a scene chat, with your stats, and the creatures leave you alone meanwhile).",
    ],
  },
  {
    title: "Holds and throws",
    lines: [
      "Some creatures catch hold of you or a companion, as the 5e SRD has them: a roper's tendril from up to 15 metres off, which then reels you in 7.5 metres at a time; an otyugh's tentacle; a giant frog's bite and a mimic's pseudopod; and a shambling mound that lands both its slams engulfs you (blinded and restrained, with a DC 14 Constitution save every few seconds or 2d8 + 4 more). Held, you can't walk away and you stay where it holds you. A bar at the top says what holds you and its escape DC, the SRD's own (the roper's 15, the otyugh's 13, the mound's 14, the frog's 11).",
      "To break free, press Break free, or push hard on the move keys for a second: each try is a d20 with the better of your Athletics and your Acrobatics against the escape DC (a roper's hold puts Strength at a disadvantage). By turns, a try is your action (Break free on the bar). Companions try on their own turns. A hold ends when the creature is beaten, knocked back (a Shove, Thunderwave), stunned or runs, or after a minute when it lets go.",
      "Two rules here are Wanderworld's own, not the SRD's. Vines: an awakened shrub's blow, and a shambling mound's slam that doesn't engulf you, can catch your legs, restrained for about eight seconds (a turn by turns), escape DC 10. Throws: something Large or bigger with a Strength of 18 or more (an ogre, a troll, a minotaur, and giants) now and then grabs someone Medium or smaller and throws them a few metres, further the bigger and stronger it is. A Strength or Dexterity save, the better, against 8 + its proficiency + its Strength modifier avoids it. You land prone, take 1d6 falling damage for every full 3 metres thrown (at least 1d6: 4.5 metres is 1d6, 6 metres 2d6) and get up; nobody is thrown through a wall, a tree or a rock, into deep water, or at all where fights are kept out (towns, unless fights are allowed anywhere).",
      'Each has its own switch in Settings → Inventory → 5e rules, under "Creatures use their special attacks", all on to begin with: "Creatures grab and hold", "Vines catch your legs" and "Giants grab and throw". With fights off, or that switch off, nothing grabs or throws. Holds need "Conditions can land on you" too; with "Creatures grab and hold" off, a frog\'s or a mimic\'s grab is the plain Grappled condition you shake off by yourself. By turns, "grapple" and "throw" are among the moves the rules or the AI choose from for a creature that has them. In a narrated moment, who is held or thrown is in the lines the AI tells.',
    ],
  },
  {
    title: "Fight display and defeat",
    lines: [
      "In a fight, each creature has its name and an HP bar over its head, green, then yellow, orange and red as it's hurt, with a mark for each condition on it (↓ prone, ☠ poisoned, ! frightened, ✋ held, # restrained, ✶ stunned, ≈ slowed). Your companions and anyone fighting you have the bar over their name tag. A bigger creature has its plate higher, and plates fade with distance. Settings → Inventory → Fight display → \"Name and HP over heads\" sets them always in fights, only sometimes (when one is hurt, has a condition, is aimed at, or it's its turn), or off; another switch puts them over hostile creatures in sight before a fight begins.",
      "By turns, the bar at the top shows the turn order as cards: each fighter's name, HP bar and numbers, what's on them, and a gold edge on whoever's turn it is. Under the cards, the last thing that happened is told in a few words (who did what to whom, the roll, the damage); Before opens the few lines before it, and the chat keeps them all. In real time a smaller list at the top shows you, your companions and what you're fighting the same way (a switch). With \"Show foes' exact HP\" off, a foe's HP is a word (Unhurt, Wounded, Near death) and a bar in quarters.",
      "Tap or click a name on a card, or a creature's plate, for its info card. A creature's card comes from the 5e SRD: size and type, AC, HP, speed, senses, ability scores, what it resists and is immune or vulnerable to, the conditions it can't be put in, and its traits and actions in a line each. A companion's shows their class, level, HP, AC and conditions. With \"What you know of a creature\" at Only what you've learned, a creature's card shows only what you've seen: its attacks once it has attacked, its AC once you've fought it, and how each kind of damage you dealt it went. The first time you open a kind's card you roll to recall it (Intelligence: Arcana, Nature, Religion or History by its type, against DC 10 plus its challenge rating); pass and you know all of it. That roll is made once a kind and kept with the world.",
      'With "When your HP runs out" at Stay down until you choose, and "Staying down: those who beat you stay over you" on (Settings → Inventory → Combat), what beat you stays by you: an outlaw stands over you and, if a defeat costs money, takes it then; a beast circles; a monster stands guard. They aren\'t counted away by New monsters every. A card offers Plead (Persuasion, or Animal Handling with beasts, against DC 10 plus the strongest one\'s challenge rating), Wait (they may lose interest) and Struggle (Constitution against DC 10: up with 1 HP, and the fight starts again). With AI moments on, the narrator is told in a line who stands over you, so you can play it out in the chat. Respawn still gets you up at home. In places where fights are kept out, and indoors, they let you be.',
    ],
  },
  {
    title: "Factions and regions",
    lines: [
      "A faction comes from your lore: an entry keyed ww:faction:Thieves Guild is its lore, and ww:member of:Thieves Guild on someone's entry puts them in it. ww:enemy of:The Crown on a faction's entry makes the two enemies.",
      "Journal → Factions shows how each faction regards you, from −100 to 100: Hated, Hostile, Wary, Neutral, Liked, Trusted, Honoured. It moves a little with what you do: an errand done for one of its people, monsters beaten on its land, trading at its vendors (once a day) all raise it; a blow at one of its guards lowers it, and beating one lowers it more. It moves at most 10 a day. Helping a faction lowers your standing with its enemies a little. The slider sets it by hand, and Lock keeps it there.",
      "What it changes, each with its own switch in Settings → World → Factions: a faction's vendors charge up to a fifth more or less; while you're Hostile or Hated its people won't talk to you, its guards come for you, and nowhere in its land is safe, not even its town. With AI conversations on, one short sentence tells the AI how a speaker's faction regards you.",
      "Travelling off the edge of the map makes a new region. It can be made for a purpose: a faction's walled town with its banners and guards, a bandit stronghold with its gate set into a hillside, a few outposts with watchtowers, a smaller town, several hamlets, a ruin over a dungeon, or a hillside of caves. ww:region:east on a faction's entry makes the region east of home its land (ww:region:far north, ww:region:north-east:stronghold, ww:region:west:ruin on any entry). Journal → Factions can give the next region one way a purpose by hand. Otherwise the world's seed chooses, the same every time, and once a region has a purpose it keeps it.",
      "A stronghold's gate and the mouths of ruins and caves are entrances to deep places. Journal → Map shows the regions round you that you know of under the region's map, each faction's land in its colour, and the edge of the region map is in that colour when you're on its land.",
    ],
  },
  {
    title: "Regions, travel and coaches",
    lines: [
      "Every region beyond home has a land of its own: farmland, forest, hills, marsh, snowy highlands, rocky badlands or a lakeside. It comes from the world's seed and where the region lies, so the same world always has the same lands, neighbours tend to be alike and the far north is cold. Each land has its own trees, rocks and ground, its own weather (a marsh is often misty, the badlands seldom see rain, the highlands are always under snow), its own places out in the country, and its own monsters, with Settings → Creatures → Only where they'd be found on.",
      "Each region's settlement has an inn and a shop, and its own people: someone at the inn, the shops, the smithy, the temple, the hall and the farms, and the rest in the houses, each with a name, a job, a home and a usual day. They're made the first time you arrive and kept with the world, so you meet the same people when you come back, and what they think of you and remember is kept too. Only the people of the region you're in are about. Someone from another region who joins your party comes along wherever you go.",
      "Walk off the edge of the map to go to the next region, as before. Journal → Map also lists every region you know (the ones you've been to, and those your lore or a quest told you of), nearest first, with what each one is. Walk there goes by road through regions you know: the hours pass on the way, and something may be waiting where you arrive. At an inn or tavern, a coach goes to any region you've been to, quicker, for a fare taken from your coins (the inventory needs the Quartermaster package). The map of regions shows each land in its colour, the roads between them, and a ! where a quest has something for you.",
      "Settings → World → Regions and travel switches each part: lands, the regions' own people, the AI describing a region when you arrive (one call, off at first), travel by road, coaches, the coach fare, the hours a region takes on foot, and how often something meets you on the road. Settings → World → Time standing still keeps journeys from taking time, and regions already made keep their land with lands switched off.",
    ],
  },
  {
    title: "The chat window and places",
    lines: [
      "\"Clear chat\", at the bottom of the chat window, empties it (it asks twice). What's cleared is no longer sent to the AI or to Illustrate as what was said and told. It doesn't touch what people remember, a conversation you're in, or the AI assistant's own chat.",
      "The chat window keeps the last 500 lines of each world, to scroll back through, and they're still there after you've been to another Engine screen. The AI is never sent all of it: each prompt takes only the last few lines.",
      "Places are told as you come to them: not streets and roads, not more often than the wait you set (Settings → World → Places, 10 to 60 seconds), and not a place already told until you've been back a set number of times (1 to 10). A place you reach during the wait is told when it's over, if you're still there.",
    ],
  },
  {
    title: "What people remember and know",
    lines: [
      'What people remember: everyday things fade as new ones come (the newest fourteen are kept by default). What mattered lasts: a scene you played together, a night at your campfire, travelling with you, moving house, an errand done, falling out or growing closer. How many of each are kept is in Settings ("Everyday memories kept, per person" and "Lasting memories kept, per person": up to a hundred, or All, which keeps everything until you delete it), and anyone can have numbers of their own.',
      'How many memories the AI is sent is set apart from how many are kept ("Everyday memories sent to the AI" and "Lasting memories sent to the AI"). That number is shared between whoever the AI is speaking for: 20 between three people is 7 each, rounded up, and someone with fewer than their share leaves the rest to the others. All sends everything they keep, however much, so mind the tokens. A memory is never sent twice. A number of their own in Journal → Edit people is theirs alone, and a switch says whether it comes out of the shared count. More sent costs more tokens on every reply: keep the shared number low and raise it only for the people who matter.',
      "Setting memories right (Journal → Edit people): change a memory's words if it came out wrong, delete one with ✕, or tick it to pin it. A pinned memory is locked: nothing ever pushes it out, and only its age moves on. You can also write one yourself; it's pinned from the start.",
      'What people know: each person knows only what they saw, heard or were told. Someone new doesn\'t know what you said to others elsewhere, and what one of two listeners overheard stays theirs. People in sight also notice what you do (Settings → People → Memory → "Remember what you do, not only what you say").',
      'Gossip ("People tell each other about you", in Settings → People → Memory, off to begin with): people who spend time together tell each other what they saw or heard of you. It arrives as hearsay, isn\'t passed further, and what you whisper stays where you said it.',
    ],
  },
  {
    title: "Caves, and going down",
    lines: [
      "Most caves out in the country lead down into the rock. Stand in a cave's mouth and use \"Go in\": you go down to the first level, a small cave of winding passages and a chamber or two. Your party comes with you, apart from anyone you've told to wait. Your dog and horse wait outside.",
      'Further in there may be a dark hole in the floor, or in a dungeon a breach in the wall or a trapdoor: "Go further down" takes you to the next level. That can be a cavern (one big open space with rock pillars, a pool or a stream, fallen rocks and glowing crystals, and sometimes a ruined tower, a camp or a shrine standing in it), a dungeon, a stronghold or another cave. It goes down four levels at most. Where you came in, "Go back up" takes you up a level, and on the first level "Leave" takes you back out to the cave\'s mouth.',
      "It's dark down there. You carry a light, crystals glow, and the first level has a little daylight where you came in. Whatever stands between the camera and you, rock, roof or wall, isn't drawn, so you can always see where you are.",
      "Creatures live there, the kinds that suit the place: rats, spiders, snakes, bats, slimes and wolves in caves; goblins, kobolds, lizardfolk and gnolls in caverns; skeletons and ghouls in dungeons; bandits in strongholds. Something bigger can wait at the bottom. They're picked to suit your level, and the deeper you go the tougher they are. Fights work as they do outside, in real time or by turns, by Settings → Inventory → Combat. What you beat stays beaten for as many days as you've set.",
      "The same cave always leads to the same places. Only one level is loaded at a time. If you close the game or load the world while you're down there, you come back at the cave's mouth.",
      "Settings → World → Places → Caves, dungeons and strongholds: whether caves lead down at all, how many of a world's caves do (a few, half, most or all; the rest show their card for starting a scene, as before), and whether creatures live down there.",
    ],
  },
  {
    title: "Dungeons and strongholds",
    lines: [
      "Below ground there can be dungeons and strongholds as well as caves. A dungeon is a crypt, a ruin or a sealed vault: rooms and corridors of stone with torches on the walls. A crypt has tombs and a pillared hall, a ruin has rubble, crates and sometimes a camp, and a vault has guardrooms and a treasure room behind a door at the end. Doors and bars don't lock yet.",
      "A stronghold is a bandit or faction keep: a gatehouse, a hall with a long table and banners, barracks with bunks, store rooms, a gaol with barred cells where captives are held, the leader's room behind a door, and a cellar.",
      "Each one is built from the world's seed, so the same way down always leads to the same rooms. Guards keep to the hall and barracks, the leader or the dungeon's master waits in the last room, captives sit in the cells, and others wander. Sometimes there's a way further down: a dungeon's far wall that has given way into natural rock, or a trapdoor in a keep's cellar, both leading to a cave below.",
    ],
  },
  {
    title: "Quests",
    lines: [
      'Quests are work to take on. The noticeboard posts one now and then (take the note down to see it), people you ask "Any work going?" in a conversation may have some, and an entry in your lore keyed ww:quest:<title> is a quest its giver offers. A card shows who\'s asking, what they want, the first step and the reward: Accept or Decline. Errands from the noticeboard are quests of one stage.',
      "A quest is a few stages, each one thing to do: talk to someone, go somewhere, find or gather so many of something, bring it to someone, beat so many creatures near a place, go down into a cave, free a captive held in one, travel to another region. Each is done when it happens in the world: you arrive, you talk to them, the last creature goes down. The game checks every stage before a quest is offered, so every quest you see can be finished.",
      "Journal → Quests lists them: open ones first, each with its stages done (✓), the one you're on (▸) and how many are still to come, then the finished ones. Track puts one on the line at the top of the screen and on the map; tap the line to open the Journal. Give up keeps it in the Journal, given up. A stage that asks you to choose (who took the ledger?) has its answers as buttons there.",
      'Quests can take you away. A stage in another region marks the edge that way on your map, and the region map shows it with a "!". A region a quest sends you to is given what it\'s for (a bandit stronghold, outposts, a ruin, a hillside of caves) and keeps it. A cave a quest needs always leads down, and a captive sits on its first level: walk up and Free them, then take them home.',
      "Things go wrong. If someone a quest needs is gone from your world, the place has changed, or time ran out, the quest takes a turn when it has one (someone else saw it too, their kin hears the news, you make it right with the one you wrongly named) or ends, and the Journal says why. With the AI's quests on, a quest with no plan for what happened can be given one more stage by one AI call (Settings → Quests).",
      "The game makes its own quests from what your world has, with no AI. With \"The AI writes quests\" on (Settings → Quests, off to begin with), one AI call writes each quest, all its stages at once, from your people, places and lore; anything it names that your world hasn't got is turned down and the game's own quest is offered instead. The quests you've had lately are remembered, so the next one is different.",
      'Settings → Debug has "Finish this stage", "Fail this stage" and "Show this quest\'s state" for the tracked quest, for when one is stuck or you want to see what it\'s waiting for.',
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
 * Every model made in Blender by ThatOneCan, by where it is: `folk` on the people's skeleton
 * (kit/fantasy/folk/folk-built-<name>.json), `rigged` with a skeleton of its own
 * (kit/creatures/rigged-<name>.json). The one list the credits come from: Help's lines below are made
 * from it, and wanderworld-help.regression.mjs checks the kit, the README and kit/CREDITS.md against it.
 */
export const BLENDER_MODELS = {
  folk: [
    "goblin",
    "hobgoblin",
    "bugbear",
    "orc",
    "gnoll",
    "kobold",
    "lizardfolk",
    "ghoul",
    "ogre",
    "troll",
    "minotaur",
    "skeleton",
    "zombie",
    "ghost",
    "specter",
    "earth_elemental",
    "hill_giant",
    "stone_giant",
    "frost_giant",
    "fire_giant",
  ],
  rigged: [
    "mimic",
    "awakened_shrub",
    "shambling_mound",
    "grick",
    "otyugh",
    "roper",
    "gelatinous_cube",
    "basilisk",
    "air_elemental",
    "fire_elemental",
    "water_elemental",
  ],
};
/** The built-in body's credit, word for word wherever it's given. */
export const MAKEHUMAN_CREDIT = "Base mesh and shapes: MakeHuman (CC0), adapted in Blender by ThatOneCan";
/** Model names as a list in words: "the goblin, the hill giant and the troll" without the repeated "the". */
export const namesOf = (names) => {
  const words = names.map((name) => name.replace(/_/gu, " "));
  return words.length > 1 ? `the ${words.slice(0, -1).join(", ")} and ${words.at(-1)}` : `the ${words[0] ?? ""}`;
};

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
      "Updated Modular Dungeon: the dungeons and strongholds. Their floors, walls, arches, doors, cell bars, columns, stairs, wall torches and banners, pedestals, the trapdoor, skulls, cobwebs and the campfire.",
      SRD_CREDIT,
      "Medieval Torture Devices, Signs pack and Crystal Pack by iPoly3D (CC0, from Poly Pizza): the gallows, pillory and cage by a watchtower, signposts at inns and cottages, crystals among standing stones.",
      "Credit required (CC-BY 3.0, https://creativecommons.org/licenses/by/3.0/): Saddle by Poly by Google, https://poly.pizza/m/dSMm_V4sKNr, modified (converted, resized, its texture shrunk). Its maker has not endorsed Wanderworld.",
      "Monster Pack Animated and Easy Animated Enemy Pack: the slime, skeleton, giant spider, giant rat, snake, bat, giant wasp, giant frog and dragon.",
      "Bestiary - Dungeon Monsters Kit: the imp and the puglin. (This pack is under the Quaternius Asset License, not CC0: free to use in a game, not to pass on as assets.)",
      `Made in Blender by ThatOneCan, on the people's skeleton (they move with the Universal Animation Library's clips like the people): ${namesOf(BLENDER_MODELS.folk)}, with their gear and weapons. The giants start from one base body, a copy of the built-in body (giant-base.glb).`,
      `Made in Blender by ThatOneCan, each with a skeleton and movements of its own: ${namesOf(BLENDER_MODELS.rigged)}.`,
      "Ultimate Animated Animals: the horses, donkey, cow, bull, alpaca, deer, stag, wolf, fox and the two dogs, with their standing, grazing, walking and galloping, and the horses' and donkey's jump.",
      "Universal Animation Library: Idle, Walk, Jog, Sprint, Idle Talking, Sitting (enter, idle, talking, exit), Swim (forward, idle), Jump (loop, land), Fixing Kneeling, Interact, Pick Up Table and Dance.",
      "Universal Animation Library 2: Tree Chopping (the smith's hammer), Farm Harvest, Plant Seed and Watering, Idle Fold Arms, Idle Rail, Lay To Idle (lying down and getting up) and Consume.",
    ],
  },
  {
    title: "The built-in body",
    lines: [
      `${MAKEHUMAN_CREDIT}: the built-in body, and the giants' base body made from it.`,
      "MakeHuman system assets (skins, eyes, eyebrows, eyelashes): CC0.",
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
