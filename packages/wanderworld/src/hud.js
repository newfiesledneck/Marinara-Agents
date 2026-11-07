// The overlay on top of the world: a title bar with the game's buttons, a performance readout, a
// controls hint and a status line. Only the buttons take pointer events; the rest lets touches through.

const CHIP = "background:rgba(10,14,20,0.62);color:#f3f5f7;border-radius:8px;padding:4px 10px;";
const BUTTON = `${CHIP}font:600 13px system-ui,sans-serif;border:0;cursor:pointer;pointer-events:auto;`;

function button(label, title, onClick) {
  const element = document.createElement("button");
  element.type = "button";
  element.textContent = label;
  element.title = title;
  element.style.cssText = BUTTON;
  element.addEventListener("click", onClick);
  return element;
}

export function createHud(root, { onCycleDensity, onNewWorld, onToggleFullscreen }) {
  const layer = document.createElement("div");
  layer.style.cssText = "position:absolute;inset:0;pointer-events:none;font-family:system-ui,sans-serif;";

  const top = document.createElement("div");
  top.style.cssText =
    "position:absolute;top:8px;left:8px;right:8px;display:flex;flex-wrap:wrap;align-items:center;gap:6px;";

  const title = document.createElement("div");
  title.textContent = "Wanderworld";
  title.style.cssText = `${CHIP}font-size:14px;font-weight:700;`;

  const stats = button(
    "…",
    "Frame rate, draw calls and triangles. Tap to change how many trees and rocks are drawn.",
    onCycleDensity,
  );
  stats.style.font = "12px ui-monospace,monospace";
  stats.style.whiteSpace = "nowrap";

  const spacer = document.createElement("div");
  spacer.style.flex = "1";

  const fresh = button("New world", "Walk a different seeded world", onNewWorld);
  const fullscreen = button("Fullscreen", "Fill the screen with the world", onToggleFullscreen);
  fullscreen.style.display = "none";

  top.append(title, stats, spacer, fresh, fullscreen);

  const hint = document.createElement("div");
  hint.textContent = "WASD or arrows to walk · Shift runs · Q / E turn the camera";
  hint.style.cssText = `${CHIP}position:absolute;bottom:8px;right:8px;font-size:12px;opacity:0.8;`;
  // Touch screens get the stick instead of a keyboard hint.
  if (window.matchMedia?.("(pointer: coarse)").matches) hint.style.display = "none";

  const status = document.createElement("div");
  status.style.cssText = `${CHIP}position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:14px;display:none;max-width:80%;text-align:center;`;

  layer.append(top, hint, status);
  root.append(layer);

  return {
    layer,
    setStats({ fps, calls, triangles, density }) {
      stats.textContent = `${fps} fps · ${calls} draws · ${Math.round(triangles / 1000)}k tris · ${density}× props`;
    },
    /** `control` is the Engine's fullscreen toggle, or null when this Engine has none. */
    setFullscreen(control) {
      fullscreen.style.display = control ? "" : "none";
      if (!control) return;
      // The Engine passes its own translated labels; fall back to English.
      fullscreen.textContent = control.active
        ? (control.exitLabel ?? "Exit fullscreen")
        : (control.enterLabel ?? "Fullscreen");
    },
    setStatus(text) {
      status.textContent = text ?? "";
      status.style.display = text ? "block" : "none";
    },
    destroy() {
      layer.remove();
    },
  };
}
