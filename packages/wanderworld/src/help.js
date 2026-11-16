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

/** The sections: [{ title, lines: [text] }], or { title, keywords: true } for the keyword list, or { title, prompt }. */
export const HELP = [
  {
    title: "Getting about",
    lines: [
      "WASD walks; Shift runs. Drag, or use the arrow keys, to look round; scroll, pinch or + and − to zoom. On a touch screen there's a stick in the corner: push it all the way, or tap Run, to run. Tapping the ground walks you there.",
      "Anyone without a 3D model, you included, can be given a look: the Look button beside the body choice (in People, and by Play as) sets the outfit or each piece of it (or None, to leave a piece off), the hood and pauldrons, colours (your own too, for any piece, the hair and the skin), hair, beard and height. Reset goes back to the look their name gives.",
      "Space jumps. C sits you down on the ground wherever you are, and C again lies you down; move, or press E, to get up. The chat window has Jump and Sit buttons, and on a touch screen they're along the bottom, with Run; Settings → Moving has a toggle for the C key, for each of the two touch buttons, and for the chat window's buttons. A home's bed (with Walk into buildings on) is somewhere to lie down. Anyone travelling with you finds a seat or stands by.",
      "There are animals: cattle, a donkey and a horse at farms, a dog or two about the market, a horse by each tavern and inn, and deer, foxes and wolves out in the country (the wild ones run from you). Walk up to a horse or a donkey and use it to ride: the same keys or stick move it, Shift gallops, Space or Jump jumps (over a fence or a bench, too), and E, Esc or Get down gets you off. It goes into water too: it wades, then swims where it's deep, so a river with no bridge can be crossed (you can't get down till it's in the shallows). Its saddle and you go up and down with its back. It stays where you leave it.",
      "Avatar: when a persona's or a character's card has a 3D model, their Look card has Avatar at the top. Leave it on their card's model, pick another kind the card has (VRM, GLB / FBX, MMD), or choose Built-in person to use the built-in body and the look below instead.",
      "A dog and a horse of your own: Menu, then Look beside your persona, has Dog and Horse at the bottom. Pick the coat and the size, give it a name if you like (it's called by it from then on), and whether each is With you (it follows you, swims after you, and turns up beside you if you leave it far behind or something keeps it from you) or At home (by your door; with no home of your own, by the tavern's). Ride your horse like any other; got down from, it comes after you or walks back home. At home, walk up to your dog and use it to call it along. The chat window has Call dog and Call horse while they're with you (it turns up beside you, wherever it had got to; typing /call does the same, and brings one from home), and Send dog home and Send horse home (each asks once more before it does it), and the Journal's Party tab lists them with Send home and Call along. Someone in town whose lore gives them a dog or a horse has it at their heel, and their Look card can change it or take it away. Their horse is theirs: it isn't offered to you to ride. A dog has five sizes, small to massive (as tall as a horse); a huge or a massive one can be ridden like a horse.",
      "A world that goes on without you: while you play, people who spend time together (an evening at the tavern, a campfire, travelling in your party) grow a little closer, slowly: about a step for an evening, a couple of steps a day at most, a tier in a few weeks. Two short-tempered people now and then have words instead; friends who never meet drift apart a step at a time (family and partners don't). Rivals and enemies don't mend by sharing a room. It all runs on rules: no AI is called, and nothing happens while Wanderworld is closed.",
      "Locks and attraction: Journal → Edit people → someone's window has, beside each relationship, a Lock (locked, it never changes by itself; a hand, lore or the AI assistant still can) and Attraction, how attractive they find the other, with a lock of its own. Everyone has a view before you touch it; moving the slider sets it, and only one that's set is told to the AI. A relationship you set by hand moves on from where you set it unless you lock it.",
      "What you missed: Journal → Relationships ends with Lately, the world's own record of who spent time with whom and what changed. Coming back into town, or out into the country, after a few hours away tells you what happened there. People in a moment are told only the recent things they themselves were part of. Menu → Settings → People → Relationships has a switch for each: relationships changing, keeping the record, and being told what you missed.",
      "What people remember: each person keeps a short memory of their own: what you said to them or in their hearing, and who they spent time with. When the AI speaks for someone it's given that person's memories and nobody else's, so it can't know what was said across town, and people can remember different things. Someone you said something to may come over within a few days to bring it up. Journal → Edit people → someone's window shows what they remember and can clear it; Menu → Settings → People → Memory switches it off altogether. No AI call is spent keeping them.",
      "Your home: Journal → Home shows where you live and who with. Move into any house that stands empty, and choose which of the people you live with come along (the rest stay where they are). Ask someone to move in, or ask a housemate to leave (they go to an empty house, or the least crowded one). Have someone round: they head for your home and stay about three hours. People who know you and don't dislike you say yes. It's all by rules, with no AI call; Journal → People still lets you put anyone anywhere.",
      'Furnishing your home: turn on Menu → Settings → World → Places → Walk into buildings, go inside your own home and open Journal → Home. Pick a piece (chairs, tables, a bench, a bookcase, a chest, a barrel, a candle stand and more) and "Put it here": it goes down a step in front of you, facing you, moved in from a wall if need be. Chairs and stools you add can be sat on. "Take away" removes a piece you added. The room\'s own furniture stays as it is. Up to 40 pieces a home, kept with the world.',
      "Hostile people: bandits, witches and wizards are out in the country with the monsters, and act as the Hostile animals setting says (keep away, threaten, or attack). They're nobody's character: they can't be talked to, and no AI is used for them. Each has its own switch under Menu → Settings → Animals, and lore can place them (ww:monster:bandit:pack3).",
      "How many animals: Menu → Settings → Animals has a slider for each sort (stray dogs, farm animals, peaceful wild animals, hostile ones, monsters): that many of the world's own, and 0 for none. Animals a lorebook asks for, and anyone's own dog or horse, are still there at 0 unless you turn that off. Under the sliders each kind has a switch: off, there are none of it anywhere, whatever else says. Most in the settlement keeps the town from filling up: any stray dogs and horses over it are put just outside. Hostile animals says what a wolf does about you where confrontations are allowed: keeps its distance, squares up to you, or comes for you (you're sent back a step; nothing is hurt yet). Journal → World has Animals in this world, for one world's own numbers.",
      "Outside each settlement there's a campsite or two: sit on the logs by the fire, or use the tent to sleep. You choose how long; the clock jumps on, and everyone not close by is where that hour has them.",
      "People have places to work and rest out of doors: the smith at the open forge, sellers and buyers at the market stalls, a farm's people in its fields, and others at a garden's beds, by a pond or in a meadow's grass.",
      "E, a click or a tap uses whatever the prompt names: a door, a bench, a person, a market stall.",
    ],
  },
  {
    title: "The bar, the Menu and your worlds",
    lines: [
      "Lore is active for the place you're in, the places that hold it, and a place you're beside: on a river's bank, by a pond's shore, at the foot of the mountains, at a cave's mouth, beside a road or near a place out in the country, a few metres past its edge. The Lore window marks those \"beside you\", and the AI and pictures are told (\"in Whisperwood, near the bank of the Silverrun\"). Menu → Settings → World → Places has the switch.",
      "The bar along the top has the Map, the Inventory (with the Quartermaster package), the Journal, the Lore active where you stand, the Chat window, Illustrate and the Menu.",
      "The Menu has who you play (with their Look), Settings, This world, Save world, Load world, full screen and the main menu.",
      "This world lists the world's name, its id, its Quartermaster sheet, the map seed, the land, the region you're in, who lives there, who's travelling with you, your animals, its lorebooks and its setting. The ids have a Copy button.",
      "Save world saves now and sends it to the Engine now, and says if the Engine didn't take it. The game also saves by itself as you play, and when you leave the tab or lock your phone.",
      "Load world lists your worlds as the Engine has them at that moment and opens the one you pick. The world you're in is saved first, under its own name; nothing of it goes into the one you open.",
      "Playing on a phone and a computer: worlds are kept by the Engine, so both see the same ones. A browser left open reads them again when you come back to it, and a world that was played somewhere else since is loaded from there. The newer save wins whole, so don't play one world in two browsers at the same moment.",
    ],
  },
  {
    title: "Inventory (with the Quartermaster package)",
    lines: [
      "With Quartermaster installed (0.1.35 or later) the bar has an Inventory button: its sheet of what your persona wears and carries, one for each persona in each world. It opens over the game, with your persona's name on it. Without Quartermaster there's no button and nothing here does anything.",
      "What the sheet says you're wearing is told to the AI wherever it's told who you are: conversations, moments, scenes and Illustrate. There is no macro to place.",
      "After a moment, one more AI call reads what was narrated and updates the sheet (picked up, put on, given away), by Quartermaster's own rules. The chat then says what changed (added, put on, took off, removed); it says nothing when no item changed.",
      "A scene started from the world uses the same sheet (Quartermaster 0.1.37 or later). For the AI to update it during the scene, turn the Quartermaster agent on in that chat.",
      "Menu → Settings → Inventory has a switch for each part: the button, telling the AI what you wear, when the sheet is updated (never, after moments, after moments and replies), scenes using the world's sheet, and the parchment colours. Deleting a world deletes its sheets.",
    ],
  },
  {
    title: "Talking, moments and scenes",
    lines: [
      "Walk up to someone and press E to talk. Pick something to say or type your own. What's offered depends on who they are to you. Someone travelling with you knows it, so they don't greet you as if you'd just met.",
      "The Chat window is for everything else: plain text is said to whoever's near, /s shouts, /w whispers, /p speaks to your party, /a does something instead of saying it. With AI on, the narrator tells what comes of it and people nearby may answer. That's a moment: one model call.",
      "A scene is a full roleplay chat in the Engine. Start one from a card's \"Play it as a scene\", the Chat window's Scene button, or /scene …; when it ends, its recap comes back to the world.",
      "/camp lights a campfire where you stand. /call brings your own dog and horse to you (/call horse or /call dog for one).",
      "What the AI is told about where you are: not only the place's name but how you stand to it. On the bank beside the pond, wading or swimming when you are, inside or outside a building, at the mouth of a cave, on a street. What you sit on is told as what it is: a log by the campfire, a bench, a chair, a stool.",
      "In a moment, each of the recent lines the AI is given says when and where it happened, so it can tell a minute ago here from this morning across town.",
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
      'Journal → People lists everyone by faction. "Edit people" opens a window for each person: body, voice, temperament and manner, home and work, their day, what they are to you and to each other, how they act toward you, and who knows whose name.',
      'Three things decide how someone behaves. What they are to you (friend, rival, sister) is the relationship. Temperament and manner are what they\'re like with everybody. "How they act toward you" overrides both for you alone: a sister can be rude, an enemy afraid.',
      "People with a character card keep who they are and their looks from the card. People a world made for itself can be changed entirely.",
    ],
  },
  {
    title: "Making a world",
    lines: [
      "Where worlds are kept: by the Engine, in Wanderworld's own storage there, so they're the same from any browser or device that opens your Engine and can grow as big as they need. The game's and the AI's settings (the living world, animals, memories, connections, narrators, what calls the AI) are kept there too; graphics, controls, sound and what's shown on screen are each device's own. If the menu says Wanderworld isn't fully loaded, restart the Engine.",
      'New world: a name, who you play, who lives there, the land, and under "Setting the world up" how much the AI does for you.',
      "The AI can set your characters up from their cards (bodies, homes, work, relationships), read your lorebooks and tie their lore to places, write the world's own lore and places from nothing, and invent people to live there. Each is a model call or two, and you see all of it before the land is built.",
      "Or do it by hand: lorebook keywords (below), and the Journal for anything else.",
      "Layouts: a grid of streets, a crossroads, one street, round the market, scattered houses with no streets, round a pond with the houses at the edge, or four quarters and a green. Ground a layout leaves open gets a pond, a few houses, gardens and meadows.",
      "Ages: the usual ages of people the AI invents (21 and up unless you change it; any age from 1). Your lore, setting and cards always win over it. Journal → World changes it later.",
      "The first map on New world is an idea, not a promise: lore adds places. With the AI, the review shows the real map, and Reroll the map there changes only the land.",
    ],
  },
  {
    title: "Settings, and where things are",
    lines: [
      "Menu → Settings is in sections, and a section with a lot in it has tabs of its own. Each section and tab starts with a line on what it is for, and each setting has a line under it (Display → On screen → Show explanations hides them).",
      "Display: graphics, what is shown on screen, sound. Controls: moving and the camera. World: time, weather, places. People: how they act around you, their relationships, their memory, the genders of people the game or the AI makes up (male, female, and a custom one you name; lore, cards and your own choices always come first), and the inventory. Animals: how many, which kinds, how they behave. AI: what the AI writes, scenes, pictures, connections. Token use: everything that affects what the AI costs, in one place.",
      "A setting set in a little under another only matters while that one is on, and is faint while it is off.",
      "Journal → Edit people opens someone's own window, in tabs: About, Day, You, Others and Memory. Journal → World is in tabs too (This world, Setting, Animals, Lore), and New world is a walkthrough in four steps, with Next and Back: you and your people, the land, the AI (its connections and main switches, so they're set before a world is made), lore and setup. Each step says what to know before you start. On the land step a Massive world can have at least one of every kind of place (an inn, a cottage, a cave, a hamlet, a farm, ruins, a watchtower, standing stones, a graveyard, a mill, a pond), with two of a kind kept well apart.",
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
      "The assistant can look after memories too. Under More things to ask: Check memories against the lore, Clear out memories that don't matter, Find repeated memories, Sum up old memories (several everyday ones into one lasting one) and Suggest memories to pin. Sum up old memories also has a button in Settings → People → Memory, in Settings → Token use, and in each person's window in Journal → Edit people. Each first asks whose memories to send, a tick for each person or All characters' memories, and says roughly what it costs in tokens. What it proposes (a rewording, a deletion, a pin, a new lasting memory) is shown in full for you to change or leave out, nothing happens until Confirm, and Undo brings it back.",
      "What it is sent, and what it looks up: everyone's name, home and work always go, with the titles of your lore; the rest goes when the request needs it. When it needs more, it looks it up itself, up to three times before answering: a lore entry by title or by words (this world's own and the lorebooks chosen for it; yours are read-only), everything about a person, what someone remembers, or a part of the world that was left out. Each look-up is one more AI call. The line under each answer says what was sent and what it looked up.",
      "The buttons under the chat are ready-made requests, for when you don't know what to ask: a few always in view, and More things to ask lists the rest with what each does. One ending in … is put in the box for you to finish.",
      "Draft ww: keywords (in that list) lets you pick a lorebook and tick its entries, twenty at most. Only those are sent, and you get each entry's keys as text to copy into your lorebook: the assistant can't change Engine lorebooks.",
      "Only the parts of the world your message needs are sent with it, and the small line under each answer says which. If the model needs a part that was left out it asks, and is asked again with it (a second call). The chat is kept with the world; Start over forgets it.",
      "It only changes the world you're in. Your character cards, personas and lorebooks in the Engine, these settings, the map and the buildings are never touched.",
    ],
  },
  {
    title: "AI, and what it costs",
    lines: [
      "Settings → Token use has every setting that changes how many tokens are spent, in one place: which things call the AI, how long replies are, how many memories are sent. They're the same settings as in AI and People → Memory, so changing one there changes it here, and the other way round. It also says what else adds up, and how to see exactly what is sent.",
      "Every AI call uses one of your Engine connections. A reply in a conversation, a moment, a day planned, a scene planned, a picture, a picture's prompt rewritten and a message to the AI assistant are one call each. Walking about calls nothing.",
      "Illustrate paints the moment. With \"Have the AI rewrite the prompt\" on, a model turns the facts into one full paragraph (each character's name and looks, what they're doing, the place, the light, a camera angle), and the last lines of the chat go with it, so the picture shows what you're doing now, not only where you stand. The instruction is yours to change, and there's a tag-style one for models that want tags. Lines that describe other places (told when you arrived there) are left out of what it's given (Settings → AI → Pictures has the switch), so a picture isn't of two places at once. If the place you're in hasn't been described in the chat yet, it's told first (there's a switch for that too).",
      "Inventory, on the top bar, opens a window in three tabs. Items: what you carry, from Quartermaster, each with Equip or Take off, Use and Drop. What you do there is done on Quartermaster's sheet too, and said in the chat. Using something applies what its description gives: a potion described as +10 HP heals 10, and one of a stack is used up. Sheet: your level, experience, HP, mana, AC and six attributes, with boxes to change them, ticks to choose what the AI is told, and a form to add your own stats, skills, feats and spells. Worn items whose descriptions say things like +2 AC are counted. Quartermaster: opens its own window for slots, outfits and pictures.",
      'A level gained raises what your HP can be (by 4 and your Constitution modifier) and your mana (by 2), and restores your HP; the chat says so. A better tool gathers better: one whose description says "+2 gathering" adds 2 to the roll, so it finds something more often and two of it more often. The smith\'s iron tools have it.',
      "Your ticked stats are told to a scene too, as a block at its start. Things you add to the sheet have a description you can edit: for a feat or a spell, the description is all the AI knows of it.",
      'A line of the sheet you untick moves to "Not in use" at the bottom, out of the way and not told to the AI; tick it there to bring it back. One you added yourself can be deleted there.',
      'The AI can keep the sheet for you (Menu → Settings → Inventory → "The AI updates your sheet", off to begin with): after something is narrated it answers with what changed, such as HP lost or experience earned, and a note in the chat says so. It shares the AI call the inventory tracker makes when both are on, so the two cost one call; on its own it is one more call each time.',
      "Gathering: where there's something to gather, buttons appear in the chat window under Jump and Sit. Each only at its resource. Fish beside water. Chop wood standing against a tree: each stroke may give a piece of wood, and the fourth brings the tree down, where it stays down for a week (a setting). Forage in the woods: what you find follows the season, and in winter it is only sticks, flint and fibre. Mine against a boulder or at a cave. Harvest on a farm in summer and fall. Each try rolls a d20 plus one of your attributes: under 8 finds nothing, 18 or more finds two. What you find goes into your inventory, and food says what eating it gives. A patch gives nothing more of that kind until the next day (Menu → Settings → Inventory sets how long).",
      "Ctrl, pressed by itself, turns running on until you press it again; Shift still runs while held. At a tree, a boulder or the water's edge, a prompt at its foot names what you can do there (Chop wood, Mine, Fish): press E, or tap the prompt on a touch screen. Your character turns to it. Foraging and harvesting prompt when you stand still away from those. The same are buttons in the chat window. A felled tree leaves a stump, and a mined boulder is smaller until it has had its days.",
      "Fighting (Menu → Settings → Inventory → Combat, off to begin with): set it to Real time and F swings, Q blocks, R dodges and X draws your weapon or puts it away. With it drawn, the view stays behind you: turning the view turns you, and you step sideways and backwards without turning away, as in an action game. You can swing without drawing. Z casts the spell that's ready. Spells come from the 5e SRD and from you, and from nowhere else: Inventory → Sheet has a list of the SRD's spells of level 0 to 3 to add from, and you can write your own. A spell is a line of your sheet whose description says what it does by rule, so one you add can be rewritten. A cantrip costs no mana; other spells cost one more than their level. Each spell has a button in the chat window, and casting one makes it the ready one. A spell flies at the nearest creature ahead of you within its range (and at a person, where blows can land on people): a spell attack is a d20 + 2 + your Intelligence modifier against AC, a saving throw is the target's roll against 10 + your Intelligence modifier, and some need no roll. Stunned, paralyzed, restrained and incapacitated hold a target where it stands; frightened sends it running. A healing spell mends you. Mana and HP come back slowly while you sit or lie down, and fully when you sleep (Settings → Inventory → Sheet). On a touch screen a Combat button by your thumb swaps Run, Sit and Jump for Attack, Block and Dodge, and back; the chat window has the three as well. A block lasts about a second, and an attack on you during it is rolled twice with the worse roll counting. A dodge rolls you a few steps (onward if you're moving, back if you're standing), and nothing lands on you mid-roll. You swing wherever you face, and can keep walking or running while you do. Nothing is aimed at: whatever animal is in front of you and in reach when the blow lands takes it, and a swing at nothing is just a swing. Each blow is an attack roll, a d20 plus your Strength modifier and your weapon's bonus, against the creature's AC: under it misses, at or over it hits, and a 20 on the die is a critical hit that rolls the damage dice twice. A weapon is anything whose description gives its damage (Weapon: 1d8 damage, +1 to attack): the one you have equipped, else the best you carry, else your fists. A hostile creature you strike fights back, and its attacks are rolled against your AC the same way; one badly hurt may run. A peaceful animal (a deer, a cow) runs when struck. People can't be struck unless you turn on Blows can land on people (Settings → Inventory → Combat): then a blow on someone is rolled like any other, they remember it for good and become your enemy, whoever saw it remembers, and at 0 HP they lie out cold for a couple of minutes before getting up. Nobody dies, and people don't strike back yet. Your own animals can't be struck. Beating one earns experience. The chat tells every roll.",
      "At 0 HP you go down. Then, as Settings → Inventory → Combat says, you come to where you fell with 1 HP, wake at home with half, or stay down: lying where you fell while the chat and the narration carry on, until you press Respawn at the top of the screen. Nothing is lost. Undefeatable, on the same page, holds your HP, mana and other resources at their most. A creature you beat lies where it fell for a few minutes (a setting; 0 keeps it). Stand at it and the prompt says Harvest for an animal (hide, meat and the like go into your inventory, and the body goes) or Search for an outlaw (what they carried). Something beaten can also be carried: stand at it and the chat window has a Carry button; you walk slowly under it, and the prompt puts it down again. Settings → Inventory → Combat has a button that clears everything lying about.  No AI call is made in a real-time fight. Combat can also be set to A narrated moment (when a creature gets to you, or you press Attack with one in reach, the game rolls one exchange of blows at once and the AI tells it as rolled; then the creature holds off a few seconds) or to A scene (the meeting opens a scene chat, with your stats, and the creatures let you be meanwhile). A defeat can cost a quarter of your money or your experience toward the next level, if you set it to. What you beat stays gone for some days (a setting).",
      'Tools: chopping needs an axe, mining a pickaxe and fishing a rod, carried in your inventory. Anything named for one counts, so a tool you were given or made yourself works. An axe or a pickaxe can also be swung as a weapon, and says so in its description; a fishing rod can\'t. Menu → Settings → Inventory → "Gathering needs tools" turns the need off.',
      'Crafting: Inventory → Craft lists what you can make, with what each needs and how many of it you have. The first tools (a stone axe, a stone pickaxe, a fishing rod) are made from a fallen branch, flint and plant fibre, all found by foraging. You can also cook fish, twist cord and make a torch, and more recipes come as your level rises. "Make something new" at the bottom lets you put things together, name and describe what comes of it, and save that as your own recipe, which then needs those same things each time.',
      "Shops: at the door of a vendor, or inside it, a Shop button appears in the chat window with the shop's name. The smithy sells tools, weapons and armour; a town's shops are a mix of general stores, apothecaries and tailors (the button says which); a tavern or an inn sells food and drink. A building named for a trade sells that. Buy with what's in your purse; Sell lists what you carry with what this shop pays, which is half a thing's worth for what it deals in and a quarter for anything else. Shelves are restocked every three days (a setting), with different things. A shop that's shut for the night doesn't trade.",
      "Market stalls trade too, by day: stand at one and the Shop button appears. Haggle, in a shop's window, rolls a Charisma check once a day at each vendor: it may take a tenth or a fifth off the prices for the rest of the day, leave them, or put them up. While a shop's window is open, Quartermaster's tracker doesn't run, so talk of buying something doesn't put it in your bag before you've paid.",
      'A vendor\'s sign says its name once you give it one, and its trade otherwise ("Apothecary", "Smith & Tailor"). In Menu → Settings → World → Vendors you can name a vendor, write what it in particular should stock (for the AI), rewrite a trade\'s guidance, and make trades of your own with a name, guidance and a list of goods.',
      'Menu → Settings → World → Vendors lists every vendor in the world. Tick the trades a shop has (one shop can be several), or open "Empty houses" and make a shop of one, if your world came without a trade you want. With "The AI stocks shop shelves" on (Settings → Inventory → Shops, and under AI), the AI writes each shop\'s stock to fit your world when it restocks.',
      "Your purse is the item named for the world's money. Inventory → Items shows how much you carry and lets you rename it (gold, caps, gems). Because it is an ordinary item, Quartermaster's tracker handles \"you pay 5 gold\" in narration.",
      "Dice: type /roll for a d20 or /roll 2d6+1 for other dice. /check strength rolls a d20 plus that line of your sheet (an attribute adds its modifier, a skill its number). With words after it, as in /check strength to lift the gate, what you try is then narrated with the result.",
      "\"Clear chat\", at the bottom of the chat window, empties it (it asks twice). What's cleared is no longer sent to the AI or to Illustrate as what was said and told. It doesn't touch what people remember, a conversation you're in, or the AI assistant's own chat.",
      "The chat window keeps the last 500 lines of each world, to scroll back through, and they're still there after you've been to another Engine screen. The AI is never sent all of it: each prompt takes only the last few lines.",
      "Places are told as you come to them: not streets and roads, not more often than the wait you set (Settings → World → Places, 10 to 60 seconds), and not a place already told until you've been back a set number of times (1 to 10). A place you reach during the wait is told when it's over, if you're still there.",
      'If your pictures are painted on this computer, the game and the painter share one graphics card. Settings → Display → Graphics has a frame rate limit (30, 60, 100 or none), and "Draw slower while a picture is painted", which holds the game to 30 frames a second until the picture arrives.',
      "Prompt caching: some AI providers charge less for the start of a prompt they've just seen. Wanderworld sends what never changes first (the world, your narrator's card, the world's lore, your party, the lore of the place, who else is near) and what changes last (the time, what each is doing, what was just said). In a conversation, and in the AI assistant's chat, the changing part goes after what was said; Menu → Settings → AI → Order prompts for caching turns that off, if a model starts talking about its \"context\". Whether anything is cached is up to your provider.",
      "Menu → Settings → AI has a switch for each thing that can call the model. With one off, the world answers with its own written lines.",
      "Narrator cards (your own characters): one for the world as you walk it (keep it short: a voice and a few rules), one for scenes, which also lets a scene start with nobody else there. They can be the same card or two.",
      "What people are to you, and to each other, is told to the AI as it is (brother, employer, good friend, bitter rival); how they speak is theirs, from their card and lore. A manner you set by hand (rude, afraid…) is told too.",
      "What people remember: everyday things fade as new ones come (the newest fourteen are kept by default). What mattered lasts: a scene you played together, a night at your campfire, travelling with you, moving house, an errand done, falling out or growing closer. How many of each is in Settings (Everyday memories each, Lasting memories each: up to a hundred, or All, which keeps everything until you delete it), and anyone can have numbers of their own.",
      "How many memories the AI is sent is set apart from how many are kept (Settings: Everyday and Lasting memories sent to the AI). That number is shared between whoever the AI is speaking for: 20 between three people is 7 each, rounded up, and someone with fewer than their share leaves the rest to the others. All sends everything they keep, however much: mind the tokens. A memory is never sent twice. A number of their own in Journal → Edit people is theirs alone, and a switch says whether it comes out of the shared count. More sent costs more tokens on every reply: keep the shared number low and raise it only for the people who matter.",
      "Setting memories right (Journal → Edit people): change a memory's words if it came out wrong, delete one with ✕, or tick it to pin it. A pinned memory is locked: nothing ever pushes it out, and only its age moves on. You can also write one yourself; it's pinned from the start.",
      "What people know: each person knows only what they saw, heard or were told. Someone new doesn't know what you said to others elsewhere, and what one of two listeners overheard stays theirs. People in sight also notice what you do (Settings → People notice what you do).",
      "Gossip (Settings → People pass on what they know, off to begin with): people who spend time together tell each other what they saw or heard of you. It arrives as hearsay, isn't passed further, and what you whisper stays where you said it.",
      "A separate call for each person who answers (Settings → AI → Writing, off to begin with): the strictest separation. Each person's reply is written by a call that's given only what they know. Slower, and up to four calls a moment.",
      "To see exactly what is sent, turn on the Engine's Debug Mode (Settings → Advanced): every request to a model and its answer, and every picture request with its connection, model, size and prompt, is written to the Engine's console.",
      "Menu → Settings → Debug shows the same in the game, with Debug Mode on or off: an overview that adds up requests, answers, failures and tokens (sent, received, cached, reasoning), and a list of the newest 50 calls, each opening to what was sent and what came back. It is kept in memory only and is gone when the Engine restarts. The cost is an estimate: each call's token counts times the prices in its connection's model list, the ones the Engine's model picker shows. What the provider actually charged isn't passed on to Agents. A connection that reports no token counts, or has no prices, is said so. Only Wanderworld's own calls are listed, never another Agent's.",
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
      SRD_CREDIT,
      "Medieval Torture Devices, Signs pack and Crystal Pack by iPoly3D (CC0, from Poly Pizza): the gallows, pillory and cage by a watchtower, signposts at inns and cottages, crystals among standing stones.",
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
