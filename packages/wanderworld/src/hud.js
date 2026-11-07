// The top-layer overlay: where the party is, a performance readout, and a status line.
// The Engine's top mount lets clicks through by default, so only the controls take pointer events.

const CHIP = "background:rgba(10,14,20,0.62);color:#f3f5f7;border-radius:8px;padding:4px 10px;";

export function createHud(root, { onCycleDensity }) {
  const layer = document.createElement("div");
  layer.style.cssText = "position:absolute;inset:0;pointer-events:none;font-family:system-ui,sans-serif;";

  const top = document.createElement("div");
  top.style.cssText =
    "position:absolute;top:8px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;" +
    "align-items:center;gap:4px;max-width:calc(100% - 32px);";

  const location = document.createElement("div");
  location.setAttribute("role", "status");
  location.style.cssText = `${CHIP}font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;`;

  const stats = document.createElement("button");
  stats.type = "button";
  stats.title = "Frame rate, draw calls and triangles. Tap to change how many trees and rocks are drawn.";
  stats.style.cssText = `${CHIP}font:12px ui-monospace,monospace;white-space:nowrap;border:0;cursor:pointer;pointer-events:auto;`;
  stats.addEventListener("click", onCycleDensity);

  const status = document.createElement("div");
  status.style.cssText = `${CHIP}position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:14px;display:none;max-width:80%;text-align:center;`;

  top.append(location, stats);
  layer.append(top, status);
  root.replaceChildren(layer);

  return {
    layer,
    /** `undefined` while the first read is in flight, `null` when there is no World Maps location. */
    setLocation(name) {
      location.textContent = name === undefined ? "Finding where you are…" : (name ?? "No World Maps location");
      location.style.opacity = name ? "1" : "0.7";
    },
    setStats({ fps, calls, triangles, density }) {
      stats.textContent = `${fps} fps · ${calls} draws · ${Math.round(triangles / 1000)}k tris · ${density}× props`;
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
