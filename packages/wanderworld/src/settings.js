// The player's settings, kept in this package's own browser storage. Every value is checked on the way
// in, so a damaged or old saved copy falls back to the defaults instead of breaking the game.

const KEY = "wanderworld.settings";

/** Each setting: its default and what it may be. */
export const SETTINGS = {
  /** Render resolution: "auto" adjusts to keep the frame rate up; the rest are a share of the screen's. */
  resolution: { value: "auto", options: ["auto", "100", "75", "50"] },
  /** How far you can see before the haze, in metres. */
  drawDistance: { value: 140, options: [90, 140, 200] },
  /** Trees and rocks outside town, as a multiple of the usual. */
  density: { value: 1, options: [1, 4, 10] },
  shadows: { value: true },
  /** "recorded" plays the Universal Animation Library clips; "builtin" the hand-made motion. */
  animation: { value: "recorded", options: ["recorded", "builtin"] },
  /** Your walking and running speed, as a multiple. */
  walkSpeed: { value: 1, min: 0.5, max: 2 },
  /** How fast dragging and the arrow keys turn the camera. */
  lookSpeed: { value: 1, min: 0.4, max: 2.5 },
  invertLook: { value: false },
  names: { value: true },
  hint: { value: true },
  stats: { value: true },
  /** "cycle" runs a day in 20 minutes; "day" and "night" hold it there. */
  time: { value: "cycle", options: ["cycle", "day", "night"] },
  sound: { value: true },
  volume: { value: 0.6, min: 0, max: 1 },
};

/** `value` if it is allowed for `name`, else the default. */
export function checkSetting(name, value) {
  const setting = SETTINGS[name];
  if (!setting) return undefined;
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
