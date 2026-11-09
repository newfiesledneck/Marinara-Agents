// A floating window over the world: dragged by its title bar, resized from its corner, kept inside the
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
  frame.style.resize = "both";
  frame.style.overflow = "hidden";
  bar.style.cursor = "move";
  bar.style.userSelect = "none";
  bar.style.touchAction = "none";
  const place = () => {
    const width = layer.clientWidth || 800;
    const height = layer.clientHeight || 600;
    if (!Number.isFinite(state.x)) state.x = Math.max(4, width - (state.right ?? 0) - state.w);
    if (!Number.isFinite(state.y)) state.y = Math.max(4, height - (state.bottom ?? 0) - state.h);
    state.w = Math.max(200, Math.min(state.w, width - 8));
    state.h = Math.max(120, Math.min(state.h, height - 8));
    // Wholly inside the view: a smaller browser window pulls it back in rather than losing it off the edge.
    state.x = Math.max(4, Math.min(width - state.w - 4, state.x));
    state.y = Math.max(4, Math.min(height - state.h - 4, state.y));
    frame.style.left = `${state.x}px`;
    frame.style.top = `${state.y}px`;
    frame.style.width = `${state.w}px`;
    frame.style.height = `${state.h}px`;
  };
  let dragging = null;
  bar.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button")) return;
    dragging = { x: event.clientX - state.x, y: event.clientY - state.y };
    bar.setPointerCapture?.(event.pointerId);
  });
  bar.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    state.x = event.clientX - dragging.x;
    state.y = event.clientY - dragging.y;
    place();
  });
  const drop = () => {
    if (!dragging) return;
    dragging = null;
    save();
  };
  bar.addEventListener("pointerup", drop);
  bar.addEventListener("pointercancel", drop);
  let timer = null;
  if (globalThis.ResizeObserver)
    new ResizeObserver(() => {
      if (frame.style.display !== "none") place();
    }).observe(layer);
  if (globalThis.ResizeObserver)
    new ResizeObserver(() => {
      if (frame.style.display === "none") return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        state.w = frame.offsetWidth;
        state.h = frame.offsetHeight;
        save();
      }, 250);
    }).observe(frame);
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
