// Keyboard (WASD or arrows, Shift to run, Q/E to turn the camera) and an on-screen touch stick.
// `read()` returns { x, y, run, turn }: x is right, y is forward, both in [-1, 1].

const KEYS = {
  w: "forward",
  arrowup: "forward",
  s: "back",
  arrowdown: "back",
  a: "left",
  arrowleft: "left",
  d: "right",
  arrowright: "right",
  q: "turnLeft",
  e: "turnRight",
  shift: "run",
};

const STICK_SIZE = 116;
const KNOB_SIZE = 48;
const STICK_REACH = (STICK_SIZE - KNOB_SIZE) / 2;

function isTyping(target) {
  return !!target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
}

export function createInput() {
  const held = new Set();
  const stick = { x: 0, y: 0, pointerId: null };

  const onKeyDown = (event) => {
    if (isTyping(event.target) || event.ctrlKey || event.metaKey || event.altKey) return;
    const action = KEYS[String(event.key).toLowerCase()];
    if (action) held.add(action);
  };
  const onKeyUp = (event) => {
    const action = KEYS[String(event.key).toLowerCase()];
    if (action) held.delete(action);
  };
  // A key released while the window is unfocused never sends keyup, so drop everything on blur.
  const onBlur = () => held.clear();
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
    let x = (held.has("right") ? 1 : 0) - (held.has("left") ? 1 : 0) + stick.x;
    let y = (held.has("forward") ? 1 : 0) - (held.has("back") ? 1 : 0) + stick.y;
    const length = Math.hypot(x, y);
    if (length > 1) {
      x /= length;
      y /= length;
    }
    // Positive turns the camera to the left (Q), negative to the right (E).
    const turn = (held.has("turnLeft") ? 1 : 0) - (held.has("turnRight") ? 1 : 0);
    return { x, y, run: held.has("run"), turn };
  }

  function dispose() {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("blur", onBlur);
    coarse?.removeEventListener?.("change", showStick);
    base.remove();
    held.clear();
  }

  return { stickElement: base, read, dispose };
}
