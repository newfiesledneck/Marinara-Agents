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
  names: { value: true },
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
  /** AI (the server part): conversations written by the model, on the connections chosen here ("" is
   *  the Engine's default), in a style and length; pictures through an image connection and style. */
  aiTalk: { value: true },
  /** Moments: what you do and say out loud gets a line of narration and replies from whoever hears. */
  aiMoments: { value: true },
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
  talkStyle: { value: "natural", options: ["natural", "cosy", "dramatic", "witty", "terse"] },
  replyLength: { value: "medium", options: ["short", "medium", "long"] },
  aiTemperature: { value: 0.9, min: 0, max: 1.5 },
  /** How Wanderworld's scenes are written (it plans them itself; the instructions are per world). */
  scenePov: { value: "second_person", options: ["second_person", "third_person", "first_person"] },
  sceneTense: { value: "present", options: ["present", "past"] },
  /** The prompt preset scenes start with ("" for none: the scene's own instructions alone). */
  scenePreset: { value: "", text: true },
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
  return Object.fromEntries(Object.keys(SETTINGS).map((name) => [name, checkSetting(name, saved[name])]));
}

export function saveSettings(settings) {
  try {
    globalThis.localStorage?.setItem(KEY, JSON.stringify(settings));
  } catch {
    // remembering settings is a convenience only
  }
}
