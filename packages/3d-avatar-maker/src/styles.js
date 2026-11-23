// The maker's own styles, kept inside its shadow root so they neither reach the Engine's page nor are
// reached by it. Colours follow the browser's light or dark setting.
export const STYLES = `
:host { display: block; width: 100%; height: 100%; }
* { box-sizing: border-box; }
.app {
  --bg: #16181d; --panel: #1f2229; --raised: #2a2e37; --line: #3a3f4b; --text: #e8eaf0; --soft: #a9afbd;
  --accent: #7aa2f7; --accent-text: #0f1320; --warn: #e0af68; --bad: #f7768e;
  position: absolute; inset: 0; display: flex; flex-direction: column; background: var(--bg); color: var(--text);
  font: 14px/1.45 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}
@media (prefers-color-scheme: light) {
  .app { --bg: #eef0f4; --panel: #ffffff; --raised: #f1f3f7; --line: #cfd4de; --text: #1c1f26; --soft: #5a6172;
    --accent: #2f5fd0; --accent-text: #ffffff; --warn: #9a6a00; --bad: #c0304a; }
}
header { display: flex; flex-wrap: wrap; gap: 8px 12px; align-items: center; padding: 8px 12px;
  background: var(--panel); border-bottom: 1px solid var(--line); }
header h1 { font-size: 16px; margin: 0 8px 0 0; font-weight: 650; }
header .grow { flex: 1 1 auto; }
label.field { display: inline-flex; gap: 6px; align-items: center; color: var(--soft); }
main { flex: 1 1 auto; min-height: 0; display: grid; grid-template-columns: minmax(0, 1fr) minmax(320px, 440px); }
.stage { position: relative; min-height: 0; background: radial-gradient(ellipse at 50% 35%, #3b4254 0%, #20242d 70%); }
@media (prefers-color-scheme: light) { .stage { background: radial-gradient(ellipse at 50% 35%, #ffffff 0%, #cfd6e4 75%); } }
.stage canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; touch-action: none; outline: none; }
.stage .views { position: absolute; left: 10px; bottom: 10px; display: flex; flex-wrap: wrap; gap: 6px; }
.stage .note { position: absolute; left: 10px; top: 10px; right: 10px; color: var(--text); pointer-events: none;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5); }
.stage .note.bad { color: var(--bad); pointer-events: auto; }
.panel { display: flex; flex-direction: column; min-height: 0; background: var(--panel); border-left: 1px solid var(--line); }
.tabs { display: flex; flex-wrap: wrap; gap: 4px; padding: 8px; border-bottom: 1px solid var(--line); }
.tabs button[aria-selected="true"] { background: var(--accent); color: var(--accent-text); border-color: var(--accent); }
.body { flex: 1 1 auto; min-height: 0; overflow-y: auto; padding: 10px 12px 24px; }
.group { margin: 0 0 16px; }
.group > h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--soft); margin: 0 0 6px; font-weight: 650; }
.says { color: var(--soft); margin: 0 0 8px; }
.row { display: grid; grid-template-columns: 118px minmax(0, 1fr); gap: 6px 10px; align-items: center; margin: 0 0 8px; }
.row > .name { color: var(--text); }
.row .ends { display: flex; justify-content: space-between; color: var(--soft); font-size: 12px; }
button, select, input[type="text"] { font: inherit; color: var(--text); background: var(--raised); border: 1px solid var(--line);
  border-radius: 6px; padding: 6px 10px; min-height: 34px; }
button { cursor: pointer; }
button:hover:not(:disabled) { border-color: var(--accent); }
button:disabled { opacity: 0.55; cursor: default; }
button.main { background: var(--accent); color: var(--accent-text); border-color: var(--accent); font-weight: 600; }
select { max-width: 100%; }
input[type="range"] { width: 100%; accent-color: var(--accent); min-height: 28px; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.swatches { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.swatch { width: 28px; height: 28px; min-height: 28px; padding: 0; border-radius: 50%; border: 2px solid var(--line); }
.swatch[aria-pressed="true"] { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent); }
input[type="color"] { width: 38px; height: 30px; padding: 0; border: 1px solid var(--line); border-radius: 6px; background: var(--raised); }
.piece { border: 1px solid var(--line); border-radius: 8px; padding: 8px; margin: 0 0 8px; background: var(--raised); }
.piece .row { margin-bottom: 6px; }
.status { color: var(--soft); min-height: 1.4em; }
.status.bad { color: var(--bad); }
ol.steps { margin: 6px 0 0; padding-left: 20px; color: var(--soft); }
.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
@media (max-width: 820px) {
  main { grid-template-columns: 1fr; grid-template-rows: minmax(240px, 42%) minmax(0, 1fr); }
  .panel { border-left: 0; border-top: 1px solid var(--line); }
  .row { grid-template-columns: 96px minmax(0, 1fr); }
}
@media (prefers-reduced-motion: reduce) { * { scroll-behavior: auto; } }
`;
