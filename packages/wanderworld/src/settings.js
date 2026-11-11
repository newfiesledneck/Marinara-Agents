// The player's settings, kept in this package's own browser storage. Every value is checked on the way
// in, so a damaged or old saved copy falls back to the defaults instead of breaking the game.

const KEY = "wanderworld.settings";

/** Each setting: its default and what it may be. */
export const SETTINGS = {
  /** Render resolution: "auto" adjusts to keep the frame rate up; the rest are a share of the screen's. */
  resolution: { value: "auto", options: ["auto", "100", "75", "50"] },
  /** How far you can see before the haze, in metres. */
  drawDistance: { value: 140, options: [60, 90, 140, 200, 300, 450] },
  /** Trees and rocks outside town, as a multiple of the usual. */
  density: { value: 1, options: [1, 4, 10] },
  shadows: { value: true },
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
  /** The Jump and Sit (then Lie down, then Get up) buttons in the chat window. */
  chatMoves: { value: true },
  // Whose name is over their head: everyone's, only people the player knows (a stranger is "Stranger"), or nobody's.
  names: { value: "known", options: ["all", "known", "none"] },
  /** Short explanations under settings, in the Journal and on New world. */
  explanations: { value: true },
  hint: { value: true },
  stats: { value: true },
  /** "cycle" runs a day in 20 minutes; "day" and "night" hold it there. */
  time: { value: "cycle", options: ["cycle", "day", "night"] },
  /** How fast the day goes: 1 is a day in 20 minutes; ½ takes 40, 4 takes 5. */
  timeSpeed: { value: 1, options: [0.25, 0.5, 1, 2, 4, 8] },
  /** "off" keeps it clear; "changing" turns now and then (rain, mist, snow); or one kind always. */
  weather: { value: "off", options: ["off", "changing", "rain", "snow", "mist"] },
  // The world's own voice: a line on first coming somewhere and now and then about who's near. "lines"
  // are the setting pack's (no AI); "ai" has the model write the arrival (one call each new place).
  narration: { value: "lines", options: ["off", "lines", "ai"] },
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
  textConnection: { value: "", text: true },
  sceneConnection: { value: "", text: true },
  imageConnection: { value: "", text: true },
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
  sound: { value: true },
  volume: { value: 0.6, min: 0, max: 1 },
};

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

/** The saved settings, each checked, with defaults for anything missing. */
export function loadSettings() {
  let saved = {};
  try {
    saved = JSON.parse(globalThis.localStorage?.getItem(KEY) ?? "{}") ?? {};
  } catch {
    saved = {}; // blocked storage or a damaged copy: start from the defaults
  }
  // Before 0.5.58 there was one narrator card and what it was used for: now a card for each.
  if (saved.narratorCard && saved.sceneNarratorCard === undefined) {
    if (saved.narratorUse !== "moments") saved.sceneNarratorCard = saved.narratorCard;
    if (saved.narratorUse === "scenes") saved.narratorCard = "";
  }
  return Object.fromEntries(Object.keys(SETTINGS).map((name) => [name, checkSetting(name, saved[name])]));
}

export function saveSettings(settings) {
  try {
    globalThis.localStorage?.setItem(KEY, JSON.stringify(settings));
  } catch {
    // remembering settings is a convenience only
  }
}
