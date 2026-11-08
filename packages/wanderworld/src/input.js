// The keyboard and the on-screen touch stick. WASD walks (Shift runs), the arrow keys look around, + / -
// zoom, E uses what's in front of you and Esc leaves (a seat, a conversation). Camera dragging, pinching
// and clicking live in main.js.
//
// `read()` returns { x, y, amount, run, yaw, pitch, zoom }: (x, y) is the walking direction (x right,
// y forward, a unit vector or zero), `amount` how hard (the stick walks gently when pushed a little),
// `yaw` and `pitch` the arrow keys' look direction, and `zoom` the + / - keys. `take("use")` and
// `take("leave")` report a press of E or Esc once.

const KEYS = {
  w: "forward",
  s: "back",
  a: "left",
  d: "right",
  arrowleft: "lookLeft",
  arrowright: "lookRight",
  arrowup: "lookUp",
  arrowdown: "lookDown",
  shift: "run",
  "=": "zoomIn",
  "+": "zoomIn",
  "-": "zoomOut",
  _: "zoomOut",
};
/** Keys that act once per press rather than while held. */
const PRESSES = { e: "use", escape: "leave", j: "journal" };

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

  const onKeyDown = (event) => {
    const key = String(event.key).toLowerCase();
    // Esc still leaves while typing in the chat box; nothing else does.
    if (key === "escape" && !event.repeat) pressed.add("leave");
    if (isTyping(event.target) || event.ctrlKey || event.metaKey || event.altKey) return;
    if (PRESSES[key] && !event.repeat) pressed.add(PRESSES[key]);
    const action = KEYS[key];
    if (!action) return;
    held.add(action);
    if (action.startsWith("look")) event.preventDefault(); // look around; don't scroll the Home panel
  };
  const onKeyUp = (event) => {
    const action = KEYS[String(event.key).toLowerCase()];
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
    `position:absolute;left:24px;bottom:24px;width:${STICK_SIZE}px;height:${STICK_SIZE}px;border-radius:50%;` +
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
    const run = held.has("run") || (!keyboard && pushed > STICK_RUN);
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

  return { stickElement: base, read, take, release, dispose };
}
