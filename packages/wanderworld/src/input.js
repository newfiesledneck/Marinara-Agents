// The keyboard and the on-screen touch stick. WASD walks (Shift runs), the arrow keys look around, + / -
// zoom; and, to begin with (the player can set these: KEY_ACTIONS), E uses what's in front of you, F swings,
// Q blocks, R dodges, X draws or puts away a weapon, Z casts the spell that's ready, Ctrl alone turns running
// on or off, Space jumps, C sits down on the ground (again: lies down). Esc
// leaves (a seat, a conversation). Camera dragging, pinching and clicking live in main.js.
//
// `read()` returns { x, y, amount, run, yaw, pitch, zoom }: (x, y) is the walking direction (x right,
// y forward, a unit vector or zero), `amount` how hard (the stick walks gently when pushed a little),
// `yaw` and `pitch` the arrow keys' look direction, and `zoom` the + / - keys. `take("use")`,
// `take("leave")`, `take("jump")` and `take("rest")` report a press of E, Esc, Space or C once.

/** Keys that are always the same: looking round and zooming. */
const FIXED = {
  arrowleft: "lookLeft",
  arrowright: "lookRight",
  arrowup: "lookUp",
  arrowdown: "lookDown",
  "=": "zoomIn",
  "+": "zoomIn",
  "-": "zoomOut",
  _: "zoomOut",
};
/**
 * Every action a key can be set for (Settings → Controls → Keys): [its name, what it's called, the key it
 * has to begin with]. A key is `event.key` in lower case ("w", " ", "shift", "control").
 */
export const KEY_ACTIONS = [
  ["forward", "Walk forward", "w"],
  ["back", "Walk back", "s"],
  ["left", "Step left", "a"],
  ["right", "Step right", "d"],
  ["run", "Run (while held)", "shift"],
  ["runToggle", "Running on or off", "control"],
  ["use", "Use, gather, talk", "e"],
  ["jump", "Jump", " "],
  ["rest", "Sit, then lie down", "c"],
  ["journal", "Journal", "j"],
  ["attack", "Attack", "f"],
  ["block", "Block", "q"],
  ["dodge", "Dodge", "r"],
  ["draw", "Draw or put away a weapon", "x"],
  ["cast", "Cast the ready spell", "z"],
];
export const DEFAULT_KEYS = Object.fromEntries(KEY_ACTIONS.map(([action, , key]) => [action, key]));
/** The number keys are the hotkeys (what each does is the player's: the Inventory window's Hotkeys tab). */
const HOTKEYS = Object.fromEntries("1234567890".split("").map((digit) => [digit, `hot${digit}`]));
/** Actions that go on for as long as their key is held; the rest act once at each press. */
const HELD_ACTIONS = new Set(["forward", "back", "left", "right", "run"]);
/** Keys that can't be given to an action: Esc leaves, Enter and Tab are the page's, and the fixed ones above. */
const RESERVED = new Set([
  "escape",
  "enter",
  "tab",
  "meta",
  "os",
  "capslock",
  "dead",
  "unidentified",
  ...Object.keys(FIXED),
]);
for (const digit of Object.keys(HOTKEYS)) RESERVED.add(digit);
const MODIFIERS = new Set(["control", "shift", "alt"]);
export const keyAllowed = (key) => typeof key === "string" && key.length > 0 && key.length <= 12 && !RESERVED.has(key);

/**
 * The player's keys, checked: { [action]: key } for every action. `raw`: what was saved (an object, or its
 * JSON; only the actions changed need be in it). A key given to two actions stays with the first of them,
 * and the other keeps its own to begin with (or has none, "", if that is taken too).
 */
export function checkKeys(raw) {
  let given = raw;
  if (typeof raw === "string") {
    try {
      given = raw ? JSON.parse(raw) : {};
    } catch {
      given = {};
    }
  }
  const wanted = given && typeof given === "object" ? given : {};
  const keys = {};
  const taken = new Set();
  const changed = KEY_ACTIONS.filter(([action]) => keyAllowed(String(wanted[action] ?? "").toLowerCase()));
  for (const [action] of changed) {
    const key = String(wanted[action]).toLowerCase();
    if (taken.has(key)) continue;
    keys[action] = key;
    taken.add(key);
  }
  for (const [action, , first] of KEY_ACTIONS) {
    if (keys[action] !== undefined) continue;
    keys[action] = taken.has(first) ? "" : first;
    if (keys[action]) taken.add(first);
  }
  return keys;
}

/** A key as it's shown: "W", "Space", "Ctrl", "Shift", "F5". */
export function keyName(key) {
  if (!key) return "None";
  if (key === " ") return "Space";
  if (key === "control") return "Ctrl";
  return key.length === 1 ? key.toUpperCase() : key[0].toUpperCase() + key.slice(1);
}

const STICK_SIZE = 116;
const KNOB_SIZE = 48;
const STICK_REACH = (STICK_SIZE - KNOB_SIZE) / 2;
const STICK_WALK = 0.8; // pushed this far (of the reach) walks at full walking speed
const STICK_RUN = 0.95; // pushed past this, all the way out, runs

function isTyping(target) {
  return !!target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
}

export function createInput() {
  const held = new Set();
  const pressed = new Set();
  const stick = { x: 0, y: 0, pointerId: null };
  let running = false; // the touch screen's Run button, or the run-toggle key: on until it's pressed again
  let toggleAlone = false; // the run-toggle key, a modifier, went down and nothing else has since (so it's not Ctrl+C)
  let onRunToggle = null;
  let keys = { ...DEFAULT_KEYS };
  let byKey = new Map(Object.entries(keys).map(([action, key]) => [key, action]));

  /** The player's keys (Settings → Controls → Keys): an object or its JSON, only what differs from the usual. */
  function setKeys(raw) {
    keys = checkKeys(raw);
    byKey = new Map(
      Object.entries(keys)
        .filter(([, key]) => key)
        .map(([action, key]) => [key, action]),
    );
    held.clear();
  }
  const toggleRun = () => {
    running = !running;
    onRunToggle?.(running);
  };

  const onKeyDown = (event) => {
    const key = String(event.key).toLowerCase();
    const typing = isTyping(event.target);
    const isToggle = key === keys.runToggle;
    // The run toggle on a modifier (Ctrl, to begin with) counts when it's pressed and let go by itself.
    if (isToggle && MODIFIERS.has(key)) toggleAlone = event.repeat ? toggleAlone : !typing;
    else toggleAlone = false;
    // Esc still leaves while typing in the chat box; nothing else does.
    if (key === "escape" && !event.repeat) pressed.add("leave");
    // (A key pressed with Ctrl, Alt or the system key is the browser's; the modifier itself may be an action's.)
    const combo =
      (event.ctrlKey && key !== "control") || (event.altKey && key !== "alt") || (event.metaKey && key !== "meta");
    if (typing || combo) return;
    if (isToggle) {
      if (!MODIFIERS.has(key) && !event.repeat) toggleRun();
      return;
    }
    const action = byKey.get(key) ?? FIXED[key] ?? HOTKEYS[key];
    if (!action) return;
    if (key === " ") event.preventDefault(); // don't scroll the Home panel
    if (HELD_ACTIONS.has(action) || FIXED[key]) {
      held.add(action);
      if (action.startsWith("look")) event.preventDefault(); // look around; don't scroll the Home panel
    } else if (!event.repeat) pressed.add(action);
  };
  const onKeyUp = (event) => {
    const key = String(event.key).toLowerCase();
    // The run toggle, pressed and let go by itself: running stays on (or goes off) until it's pressed again.
    if (key === keys.runToggle && toggleAlone) {
      toggleAlone = false;
      toggleRun();
    }
    const action = byKey.get(key) ?? FIXED[key];
    if (action) held.delete(action);
  };
  // A key released while the window is unfocused never sends keyup, so drop everything on blur.
  const onBlur = () => {
    held.clear();
    pressed.clear();
  };
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", onBlur);

  const base = document.createElement("div");
  base.setAttribute("aria-hidden", "true");
  base.style.cssText =
    `position:absolute;left:24px;bottom:calc(64px + env(safe-area-inset-bottom, 0px));width:${STICK_SIZE}px;height:${STICK_SIZE}px;border-radius:50%;` +
    "background:rgba(0,0,0,0.22);border:2px solid rgba(255,255,255,0.35);pointer-events:auto;touch-action:none;";
  const knob = document.createElement("div");
  knob.style.cssText =
    `position:absolute;left:${STICK_REACH}px;top:${STICK_REACH}px;width:${KNOB_SIZE}px;height:${KNOB_SIZE}px;` +
    "border-radius:50%;background:rgba(255,255,255,0.7);pointer-events:none;";
  base.appendChild(knob);

  const moveStick = (event) => {
    const rect = base.getBoundingClientRect();
    let dx = event.clientX - (rect.left + rect.width / 2);
    let dy = event.clientY - (rect.top + rect.height / 2);
    const distance = Math.hypot(dx, dy);
    if (distance > STICK_REACH) {
      dx = (dx / distance) * STICK_REACH;
      dy = (dy / distance) * STICK_REACH;
    }
    stick.x = dx / STICK_REACH;
    stick.y = -dy / STICK_REACH;
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
  };
  const releaseStick = () => {
    stick.pointerId = null;
    stick.x = 0;
    stick.y = 0;
    knob.style.transform = "";
  };
  base.addEventListener("pointerdown", (event) => {
    stick.pointerId = event.pointerId;
    base.setPointerCapture(event.pointerId);
    moveStick(event);
    event.preventDefault();
    event.stopPropagation(); // the stick's finger is not half of a pinch
  });
  base.addEventListener("pointermove", (event) => {
    if (event.pointerId === stick.pointerId) moveStick(event);
  });
  base.addEventListener("pointerup", releaseStick);
  base.addEventListener("pointercancel", releaseStick);

  // Show the stick on touch screens only; a mouse user has the keyboard.
  const coarse = window.matchMedia?.("(pointer: coarse)");
  const showStick = () => {
    base.style.display = coarse?.matches ? "block" : "none";
    if (!coarse?.matches) releaseStick();
  };
  showStick();
  coarse?.addEventListener?.("change", showStick);

  function read() {
    const keyX = (held.has("right") ? 1 : 0) - (held.has("left") ? 1 : 0);
    const keyY = (held.has("forward") ? 1 : 0) - (held.has("back") ? 1 : 0);
    const keyboard = keyX !== 0 || keyY !== 0;
    let x = keyX + stick.x;
    let y = keyY + stick.y;
    const length = Math.hypot(x, y);
    if (length > 0) {
      x /= length;
      y /= length;
    }
    // The stick is analogue: a little push strolls, most of the way walks, all the way out runs.
    const pushed = Math.hypot(stick.x, stick.y);
    const amount = keyboard ? 1 : Math.min(1, pushed / STICK_WALK);
    const run = held.has("run") || running || (!keyboard && pushed > STICK_RUN);
    // Positive yaw turns the view left; positive pitch raises the camera to look down.
    const yaw = (held.has("lookLeft") ? 1 : 0) - (held.has("lookRight") ? 1 : 0);
    const pitch = (held.has("lookDown") ? 1 : 0) - (held.has("lookUp") ? 1 : 0);
    // Positive zooms out (-), negative zooms in (+).
    const zoom = (held.has("zoomOut") ? 1 : 0) - (held.has("zoomIn") ? 1 : 0);
    return { x, y, amount: length > 0 ? amount : 0, run, yaw, pitch, zoom };
  }

  /** True once for each press of `name` ("use" or "leave") since the last call. */
  function take(name) {
    return pressed.delete(name);
  }

  /** Lets go of every held key, e.g. when a conversation takes the keyboard. */
  function release() {
    held.clear();
    releaseStick();
  }

  function dispose() {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("blur", onBlur);
    coarse?.removeEventListener?.("change", showStick);
    base.remove();
    held.clear();
  }

  return {
    stickElement: base,
    read,
    take,
    release,
    dispose,
    setRun: (on) => (running = !!on),
    setKeys,
    /** `listener(on)` is told when Ctrl turns running on or off. */
    onRunToggle: (listener) => (onRunToggle = listener),
  };
}
