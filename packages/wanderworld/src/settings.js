// The player's settings. All of them are kept in this browser's storage; the ones that are about the
// game and the AI, not this device (`sharedSettings`), are kept by the Engine as well when its server
// part is there (store.js), and those win: they're the same in every browser. Graphics, controls, sound
// and what's shown on screen stay each device's own. Every value is checked on the way in, so a damaged
// or old saved copy falls back to the defaults instead of breaking the game.

const KEY = "wanderworld.settings";

/** Each setting: its default and what it may be. */
export const SETTINGS = {
  /** Render resolution: "100" is the screen's own; the rest are picture heights in pixels (1080p…), never
   *  more than the screen has. (There was an "auto" that changed it as frames came and went: it flickered.) */
  resolution: { value: "1080", options: ["100", "1440", "1080", "720", "540"] },
  /** Antialiasing. "auto": on where the picture is drawn no finer than the page and a graphics card draws it. */
  smooth: { value: "auto", options: ["auto", "on", "off"] },
  /** The ground's textures in full, or the cheaper simple ground. */
  ground: { value: "full", options: ["full", "simple"] },
  /** How far you can see before the haze, in metres. */
  drawDistance: { value: 140, options: [60, 90, 140, 200, 300, 450] },
  /** Trees and rocks outside town, as a multiple of the forest the world was laid out with (0.5 is "Normal"). */
  density: { value: 0.5, options: [0.25, 0.5, 1, 4, 10] },
  /** How many rocks and boulders lie about, apart from the trees and plants (`density`). */
  rockDensity: { value: 0.5, options: [0.25, 0.5, 1, 4, 10] },
  /** How far out trees are drawn in detail, in metres; past it simple ones stand in. */
  treeDetail: { value: 180, options: [30, 70, 180, 300, 450] },
  shadows: { value: true },
  /** The most frames drawn a second (0 is as many as the screen shows). */
  frameLimit: { value: 0, options: [0, 30, 60, 100] },
  /** While a picture is being painted, no more than 30 frames a second: the graphics card is the painter's too. */
  paintSlow: { value: true },
  /** Detailed trees, rocks and plants (the kit); off keeps the simple low-poly ones. */
  nature: { value: true },
  /** Detailed furniture and props, in town and indoors (the kit); off keeps the simple ones. */
  props: { value: true },
  /** Where people may confront or attack: anywhere, only outside towns, only outside safe places (town
   *  and inns), or nowhere. (Confrontations now; combat when there is some.) */
  /** How often townsfolk come up to greet (or confront) you, 0 never … 2 twice as often, and how many at once. */
  approach: { value: 1, min: 0, max: 2 },
  approachMax: { value: 2, options: [1, 2, 3, 5] },
  combat: { value: "outsideSafe", options: ["anywhere", "outsideTowns", "outsideSafe", "off"] },
  /** Walking into buildings' rooms (unfinished); off, a door shows who's inside instead. */
  interiors: { value: false },
  /** Buildings assembled from the village kit; off keeps the simple ones. */
  buildings: { value: true },
  /** People without a 3D model: "kit" dresses them from the Quaternius characters; "simple" uses the
   *  built-in low-poly person (lighter on slow devices). */
  people: { value: "kit", options: ["kit", "simple"] },
  /** "recorded" plays the Universal Animation Library clips; "builtin" the hand-made motion. */
  animation: { value: "recorded", options: ["recorded", "builtin"] },
  /** Your walking and running speed, as a multiple. */
  walkSpeed: { value: 1, min: 0.5, max: 2 },
  runSpeed: { value: 1, min: 0.5, max: 2 },
  /** How fast dragging and the arrow keys turn the camera. */
  lookSpeed: { value: 1, min: 0.4, max: 2.5 },
  invertLook: { value: false },
  /** C sits you down on the ground (and again lies you down). Off for anyone who'd rather the key did nothing. */
  restKey: { value: true },
  /** On touch screens, the Jump button and the Sit (then Lie down) button by the thumb, each on its own. */
  jumpButton: { value: true },
  restButton: { value: true },
  /** And the Run button beside them: tapped, you run until it's tapped again. */
  runButton: { value: true },
  /** The Jump and Sit (then Lie down, then Get up) buttons in the chat window. */
  chatMoves: { value: true },
  // Whose name is over their head: everyone's, only people the player knows (a stranger is "Stranger"), or nobody's.
  names: { value: "known", options: ["all", "known", "none"] },
  /** Short explanations under settings, in the Journal and on New world. */
  explanations: { value: true },
  hint: { value: true },
  stats: { value: false },
  /** The clock and the line saying where you are, at the top. */
  clock: { value: true },
  place: { value: true },
  /** The size of the words in Wanderworld's windows and menus, as a multiple. */
  textSize: { value: 1, options: [0.85, 1, 1.15, 1.3, 1.5] },
  /** "cycle" runs a day in 20 minutes; "day" and "night" hold it there. */
  time: { value: "cycle", options: ["cycle", "day", "night"] },
  /** How fast the day goes: 1 is a day in 20 minutes; ½ takes 40, 4 takes 5. */
  timeSpeed: { value: 1, options: [0.25, 0.5, 1, 2, 4, 8] },
  /** "off" keeps it clear; "changing" turns now and then; or one kind always (weather.js WEATHER_LOOK). */
  weather: {
    value: "off",
    options: [
      "off",
      "changing",
      "mist",
      "fog-light",
      "fog",
      "fog-heavy",
      "rain-light",
      "rain",
      "rain-heavy",
      "storm",
      "snow-light",
      "snow",
      "snow-heavy",
    ],
  },
  /** The trees, plants and streets wear the world's season: snow, fall's colours, spring's blossom. */
  seasonLook: { value: true },
  /** The season shown and played: "world" is the world's own (Journal → World); else this one, whatever the world says. */
  season: { value: "world", options: ["world", "none", "spring", "summer", "fall", "winter"] },
  /** The seasons turn by themselves, each lasting `seasonDays` of the world's days (off: it stays as set). */
  seasonsTurn: { value: false },
  seasonDays: { value: 7, min: 1, max: 999 },
  /** With changing weather: some clear mornings start in mist. */
  morningMist: { value: true },
  /** Lightning lights the sky in a storm (off: thunder only, for anyone flashes bother). */
  lightning: { value: true },
  // The world's own voice: a line on first coming somewhere and now and then about who's near. "lines"
  // are the setting pack's (no AI); "ai" has the model write the arrival (one call each new place).
  narration: { value: "lines", options: ["off", "lines", "ai"] },
  /** Seconds between one place being told and the next. */
  arriveGap: { value: 45, min: 10, max: 60 },
  /** How many visits to a place that's been told before it's told again (1: every visit). */
  arriveVisits: { value: 5, min: 1, max: 10 },
  /** A place you're beside (a river's bank, a pond's shore) counts too: its lore is active, the AI is told. */
  besidePlaces: { value: true },
  /** AI (the server part): conversations written by the model, on the connections chosen here ("" is
   *  the Engine's default), in a style and length; pictures through an image connection and style. */
  aiTalk: { value: true },
  /** Moments: what you do and say out loud gets a line of narration and replies from whoever hears. */
  aiMoments: { value: true },
  // What may call the model for a moment, each on its own (what's typed in the chat always may): arriving
  // somewhere, using things (and doors' and caves' cards), the noticeboard, sitting down, joining someone.
  aiArrive: { value: false },
  aiThings: { value: true },
  aiBoard: { value: true },
  aiSeats: { value: true },
  aiJoin: { value: true },
  // A moment told in separate calls: one for the narration and who answers, then one for each person who
  // does, given their own knowledge alone. Off: one call for everything.
  aiSeparate: { value: false },
  // The Quartermaster package as the inventory (inventory.js), when it's installed: its button and sheets;
  // what is worn told to the AI; and its tracker asked what changed after a moment, or after every reply too.
  inventory: { value: true },
  inventoryWorn: { value: true },
  inventoryTrack: { value: "moments", options: ["off", "moments", "all"] },
  // A scene's chat uses the world's sheet; and Quartermaster's window in Wanderworld's parchment colours.
  inventoryScenes: { value: true },
  inventoryTheme: { value: true },
  // The character sheet (sheet.js): kept and shown; and what's switched on in it told to the AI.
  sheet: { value: true },
  sheetTold: { value: true },
  // Gathering (gather.js): fishing, chopping, foraging, mining, harvesting; and how many of the world's
  // days a spot takes to give again (0: it always does).
  gathering: { value: true },
  regrowDays: { value: 1, min: 0, max: 30 },
  // Vendors (vendor.js): shops buy and sell; and how many of the world's days pass between restockings.
  vendors: { value: true },
  restockDays: { value: 3, min: 1, max: 60 },
  /** The AI writes what's on a shop's shelves when it restocks, to fit the world (off: the setting's own lists). */
  vendorAi: { value: false },
  /** Haggling: once a day at each vendor, a Charisma check that may lower its prices, or raise them. */
  haggling: { value: true },
  /** Chopping, mining and fishing each need their tool carried (off: bare hands will do). */
  gatherTools: { value: true },
  // Fighting (combat.js): off, or in real time; and where the player comes to when their HP runs out.
  fights: { value: "off", options: ["off", "realtime", "turns", "moment", "scene"] },
  // Fights by turns: spells are cast with the SRD's spell slots, not mana.
  srdSlots: { value: false },
  // What a defeat costs: nothing, a quarter of the purse, or the experience gathered toward the next level.
  defeatCost: { value: "none", options: ["none", "coins", "xp"] },
  // Days before something beaten is about again (0: when the world is next opened).
  beatenDays: { value: 2, min: 0, max: 60 },
  defeat: { value: "home", options: ["here", "home", "stay"] },
  // HP, mana and every other resource held at their most.
  undefeatable: { value: false },
  // The keys the player has changed (input.js KEY_ACTIONS), as JSON: {"block":"h"}. "" for none.
  keys: { value: "", text: true },
  // Sitting or lying down slowly restores HP and mana; a sleep restores them fully.
  restRestores: { value: true },
  // Whether a blow can land on a person (the townsfolk, your companions, anyone with a name).
  fightPeople: { value: false },
  // Whether the party joins a real-time fight (each by their class: main.js alliesTick).
  partyFights: { value: true },
  // How many minutes something beaten lies where it fell (0: until it's harvested or cleared).
  bodyMinutes: { value: 3, min: 0, max: 120 },
  /** How many of the world's days a felled tree takes to stand again (0: it never does). */
  treeDays: { value: 7, min: 0, max: 365 },
  /** The AI reads what was narrated and changes the sheet (HP lost, mana spent, experience earned): one more call. */
  sheetTrack: { value: "off", options: ["off", "moments", "all"] },
  /** Quartermaster's window stays open when you click in the game (it closes at a click anywhere else). */
  inventoryPinned: { value: true },
  textConnection: { value: "", text: true },
  sceneConnection: { value: "", text: true },
  /** The connection the trackers use (the inventory's and the sheet's); "" is the same as conversations. */
  trackerConnection: { value: "", text: true },
  imageConnection: { value: "", text: true },
  /** Illustrate isn't given the lines that describe other places than the one you're in (the rest of the chat it is). */
  illustrateHere: { value: true },
  /** Illustrate has the place you're in told first, when the chat has no line describing it yet. */
  illustrateTell: { value: true },
  imageStyle: {
    value: "",
    options: [
      "",
      "off",
      "auto",
      "anime",
      "danbooru",
      "realistic",
      "photorealistic",
      "cinematic",
      "digital-painting",
      "painterly",
      "z-image-turbo",
    ],
  },
  talkStyle: {
    value: "natural",
    options: ["natural", "cosy", "dramatic", "witty", "terse", "gruff", "formal", "cheerful", "sly"],
  },
  replyLength: { value: "medium", options: ["short", "medium", "long"] },
  /** Prompts ordered for a provider's prompt cache: in a conversation, what changes each line goes last. */
  promptCache: { value: true },
  aiTemperature: { value: 0.9, min: 0, max: 1.5 },
  /** How Wanderworld's scenes are written (it plans them itself; the instructions are per world). */
  scenePov: { value: "second_person", options: ["second_person", "third_person", "first_person"] },
  sceneTense: { value: "present", options: ["present", "past"] },
  /** The prompt preset scenes start with ("" for none: the scene's own instructions alone). */
  scenePreset: { value: "", text: true },
  // The user's character cards as narrators ("" is none). One tells the world as you walk it (moments and
  // narration: a short card, a voice and a few rules); one tells scenes, and lets a scene start with nobody
  // else in it (a roleplay narrator's card suits that).
  narratorCard: { value: "", text: true },
  sceneNarratorCard: { value: "", text: true },
  // Animals: how many of each sort a world has of its own (0: none of that sort), whether the ones its
  // lore asks for and the ones someone owns are there even so, and each kind on or off altogether
  // (animals.js POPULATION, SWITCHES).
  animalsStrays: { value: 2, min: 0, max: 12 },
  animalsFarm: { value: 12, min: 0, max: 40 },
  animalsWild: { value: 12, min: 0, max: 40 },
  animalsHostile: { value: 5, min: 0, max: 30 },
  animalsMonsters: { value: 8, min: 0, max: 30 },
  /** The most of them inside the settlement itself (dogs and horses share it); the rest are outside it. */
  animalsTown: { value: 5, min: 0, max: 20 },
  loreAnimals: { value: true },
  /** People and animals keep out of one another (off: they may walk through each other, as they used to). */
  keepApart: { value: true },
  /** What a hostile animal does about you, where confrontations are allowed at all (`combat`). */
  hostileAnimals: { value: "threaten", options: ["avoid", "threaten", "attack"] },
  animalDog: { value: true },
  animalHorse: { value: true },
  animalDonkey: { value: true },
  animalCow: { value: true },
  animalBull: { value: true },
  animalAlpaca: { value: true },
  animalDeer: { value: true },
  animalStag: { value: true },
  animalFox: { value: true },
  animalWolf: { value: true },
  animalSlime: { value: true },
  animalSkeleton: { value: true },
  animalSpider: { value: true },
  animalRat: { value: true },
  animalSnake: { value: true },
  animalBat: { value: true },
  animalWasp: { value: true },
  animalFrog: { value: true },
  animalDragon: { value: true },
  animalImp: { value: true },
  animalBandit: { value: true },
  animalWitch: { value: true },
  animalWizard: { value: true },
  animalPuglin: { value: true },
  // The living world, by rules alone (no model is called): relationships that move with time spent
  // together, the record of what's happened, and being told what you missed on coming back somewhere.
  relationsMove: { value: true },
  worldLog: { value: true },
  awayRecap: { value: true },
  worldEvents: { value: true },
  /** Each person remembers what they themselves saw and heard (memory.js), and the model is told theirs alone. */
  memories: { value: true },
  /** People in sight remember what the player does (getting on a horse, going into a house), not only what's said. */
  memorySights: { value: true },
  /** How many everyday and lasting memories each person keeps (memory.js; a person can have numbers of their own). */
  // (The last step of each of these, 101, is "All": memory.js MEMORY.ALL.)
  memoryEach: { value: 14, min: 4, max: 101 },
  memoryKept: { value: 8, min: 0, max: 101 },
  /**
   * How many of them the model is told, shared between the people it's speaking for (memory.js toldShares;
   * a person can have numbers of their own), and whether those numbers come out of the shared count.
   */
  memoryTold: { value: 12, min: 0, max: 101 },
  memoryKeptTold: { value: 8, min: 0, max: 101 },
  memoryToldCounted: { value: false },
  /**
   * How many of the people the game or the AI makes up are men, women, or a third gender the player names
   * (`genderName`; "Custom" until they do): weights, each against the others. Only for people whose
   * gender nothing says: lore, a card and the player's own choice always win.
   */
  genderMale: { value: 50, min: 0, max: 100 },
  genderFemale: { value: 50, min: 0, max: 100 },
  genderCustom: { value: 0, min: 0, max: 100 },
  genderName: { value: "", text: true },
  /** People who spend time together pass on what they saw or heard (memory.js pass): hearsay, by rule. */
  gossip: { value: false },
  sound: { value: true },
  volume: { value: 0.6, min: 0, max: 1 },
};

/** The settings that are this device's own: how it draws, how it's controlled, what it shows and plays. */
export const DEVICE_SETTINGS = new Set([
  "resolution",
  "smooth",
  "drawDistance",
  "seasonLook",
  "density",
  "rockDensity",
  "ground",
  "treeDetail",
  "shadows",
  "frameLimit",
  "paintSlow",
  "nature",
  "props",
  "buildings",
  "people",
  "animation",
  "lookSpeed",
  "invertLook",
  "restKey",
  "jumpButton",
  "restButton",
  "runButton",
  "chatMoves",
  "explanations",
  "hint",
  "stats",
  "clock",
  "place",
  "textSize",
  "sound",
  "volume",
]);

/** The settings every browser shares (the game's and the AI's), out of `settings`. */
export const sharedSettings = (settings) =>
  Object.fromEntries(Object.entries(settings).filter(([name]) => SETTINGS[name] && !DEVICE_SETTINGS.has(name)));

/** The most frames a second for these settings (0: no limit), `painting` while a picture is being made. */
export const frameLimitOf = (settings, painting) =>
  painting && settings.paintSlow ? Math.min(30, settings.frameLimit || 30) : settings.frameLimit;

/** `value` if it is allowed for `name`, else the default. */
export function checkSetting(name, value) {
  const setting = SETTINGS[name];
  if (!setting) return undefined;
  if (setting.text) return typeof value === "string" ? value.trim().slice(0, 120) : setting.value;
  if (setting.options) return setting.options.includes(value) ? value : setting.value;
  if (typeof setting.value === "boolean") return typeof value === "boolean" ? value : setting.value;
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(setting.max, Math.max(setting.min, value))
    : setting.value;
}

/**
 * The saved settings, each checked, with defaults for anything missing. `shared`: what the Engine keeps
 * (the text store.js holds, or null): its values are used for everything that isn't this device's own.
 */
export function loadSettings(shared = null) {
  let saved = {};
  try {
    saved = JSON.parse(globalThis.localStorage?.getItem(KEY) ?? "{}") ?? {};
  } catch {
    saved = {}; // blocked storage or a damaged copy: start from the defaults
  }
  let common = {};
  try {
    common = (typeof shared === "string" ? JSON.parse(shared) : shared) ?? {};
  } catch {
    common = {}; // a damaged copy: this browser's own
  }
  const from = (name) => (!DEVICE_SETTINGS.has(name) && Object.hasOwn(common, name) ? common[name] : saved[name]);
  return Object.fromEntries(Object.keys(SETTINGS).map((name) => [name, checkSetting(name, from(name))]));
}

export function saveSettings(settings) {
  try {
    globalThis.localStorage?.setItem(KEY, JSON.stringify(settings));
  } catch {
    // remembering settings is a convenience only
  }
}
