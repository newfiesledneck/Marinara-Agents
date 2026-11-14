// A floating window over the world: dragged by its title bar, resized from its corner (mouse or finger), kept inside the
// view, and its place, size and open state remembered in this browser under `key`. Used by the chat
// window (narration and speaking) and the Illustrate window.

function readState(key) {
  try {
    const saved = JSON.parse(globalThis.localStorage?.getItem(key) ?? "null");
    return saved && typeof saved === "object" ? saved : {};
  } catch {
    return {};
  }
}

/**
 * Makes `frame` (absolutely placed in `layer`) float: `bar` drags it. `defaults`: { x, y, w, h, open,
 * right, bottom } (right/bottom place it from those edges the first time). Returns { state, save, place,
 * setOpen(open), isOpen() }; `state` also carries anything else the caller keeps there.
 */
export function makeFloating(layer, frame, bar, key, defaults) {
  const state = { ...defaults, ...readState(key) };
  const save = () => {
    try {
      globalThis.localStorage?.setItem(key, JSON.stringify(state));
    } catch {
      // blocked storage: it just isn't remembered
    }
  };
  frame.style.position = "absolute";
  frame.style.overflow = "hidden";
  frame.style.isolation = "isolate"; // its corner stays its own: not over a panel opened on top of it
  bar.style.cursor = "move";
  bar.style.userSelect = "none";
  bar.style.touchAction = "none";
  // The corner to resize it by: its own, since the browser's (CSS resize) can't be dragged by a finger.
  const grip = document.createElement("div");
  grip.title = "Drag to resize";
  const INK = "rgba(107,74,43,0.6)";
  grip.style.cssText =
    "position:absolute;right:0;bottom:0;width:26px;height:26px;cursor:nwse-resize;touch-action:none;z-index:2;" +
    `background:linear-gradient(135deg,transparent 52%,${INK} 52%,${INK} 60%,transparent 60%,transparent 72%,${INK} 72%,${INK} 80%,transparent 80%);`;
  frame.append(grip);
  // `state` is where and how big the player left it; `shown` is that, fitted into the view as it is now.
  // (A view that is small for a moment, a phone turned or a page still laying out, mustn't shrink it for good.)
  const shown = { x: 0, y: 0, w: 0, h: 0 };
  const place = () => {
    const width = layer.clientWidth || 800;
    const height = layer.clientHeight || 600;
    if (!Number.isFinite(state.x)) state.x = Math.max(4, width - (state.right ?? 0) - state.w);
    if (!Number.isFinite(state.y)) state.y = Math.max(4, height - (state.bottom ?? 0) - state.h);
    shown.w = Math.max(200, Math.min(state.w, width - 8));
    shown.h = Math.max(120, Math.min(state.h, height - 8));
    // Wholly inside the view: a smaller browser window pulls it back in rather than losing it off the edge.
    shown.x = Math.max(4, Math.min(width - shown.w - 4, state.x));
    shown.y = Math.max(4, Math.min(height - shown.h - 4, state.y));
    frame.style.left = `${shown.x}px`;
    frame.style.top = `${shown.y}px`;
    frame.style.width = `${shown.w}px`;
    frame.style.height = `${shown.h}px`;
  };
  /** Drags by `handle`: `start(event)` gives what's held, `move(held, event)` moves or sizes the window. */
  const drag = (handle, start, move) => {
    let held = null;
    handle.addEventListener("pointerdown", (event) => {
      if (event.target.closest("button")) return;
      Object.assign(state, shown); // from where it is on screen
      held = start(event);
      handle.setPointerCapture?.(event.pointerId);
      event.preventDefault();
    });
    handle.addEventListener("pointermove", (event) => {
      if (!held) return;
      move(held, event);
      place();
    });
    const drop = () => {
      if (!held) return;
      held = null;
      Object.assign(state, shown);
      save();
    };
    handle.addEventListener("pointerup", drop);
    handle.addEventListener("pointercancel", drop);
  };
  drag(
    bar,
    (event) => ({ x: event.clientX - state.x, y: event.clientY - state.y }),
    (held, event) => {
      state.x = event.clientX - held.x;
      state.y = event.clientY - held.y;
    },
  );
  drag(
    grip,
    (event) => ({ x: event.clientX - state.w, y: event.clientY - state.h }),
    (held, event) => {
      state.w = event.clientX - held.x;
      state.h = event.clientY - held.y;
    },
  );
  if (globalThis.ResizeObserver)
    new ResizeObserver(() => {
      if (frame.style.display !== "none") place();
    }).observe(layer);
  return {
    state,
    save,
    place,
    setOpen(open) {
      state.open = open;
      save();
      frame.style.display = open ? "flex" : "none";
      if (open) place();
    },
    isOpen: () => !!state.open,
  };
}
