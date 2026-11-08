// The overlay on top of the world: a title bar with the game's buttons (folded into a menu on narrow
// screens), the People and Settings panels, a performance readout, a clock, the "use" prompt, a controls
// hint, a status line and a loading screen. Only controls take pointer events; the rest lets touches through.
import { SETTINGS } from "./settings.js";

const CHIP = "background:rgba(10,14,20,0.62);color:#f3f5f7;border-radius:8px;padding:4px 10px;";
const BUTTON = `${CHIP}font:600 13px system-ui,sans-serif;border:0;cursor:pointer;pointer-events:auto;`;
const PANEL =
  `${CHIP}position:absolute;top:48px;right:8px;display:none;flex-direction:column;gap:4px;max-height:calc(100% - 64px);` +
  "overflow-y:auto;min-width:220px;max-width:min(340px,calc(100% - 16px));padding:10px 12px;pointer-events:auto;font-size:13px;";
const NARROW = "(max-width: 640px)";

/** Auto / Male / Female: the default body for someone without a 3D model. */
function bodyPicker(onChange) {
  const select = document.createElement("select");
  select.title = "Default body when there's no 3D model";
  select.setAttribute("aria-label", "Default body");
  select.style.cssText = "font:12px system-ui,sans-serif;border-radius:6px;border:0;padding:1px 2px;";
  for (const [value, label] of [
    ["auto", "Auto"],
    ["male", "Male"],
    ["female", "Female"],
  ]) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    select.append(option);
  }
  select.addEventListener("change", () => onChange(select.value));
  return select;
}

function button(label, title, onClick) {
  const element = document.createElement("button");
  element.type = "button";
  element.textContent = label;
  element.title = title;
  element.style.cssText = BUTTON;
  element.addEventListener("click", onClick);
  return element;
}

const RESOLUTION_LABELS = { auto: "Auto (keeps it smooth)", 100: "Full", 75: "75%", 50: "50%" };
const DISTANCE_LABELS = { 90: "Near", 140: "Medium", 200: "Far" };
const TIME_LABELS = { cycle: "Day and night", day: "Always day", night: "Always night" };

/**
 * `handlers`: onNewWorld, onToggleFullscreen, onPickPersona(id), onToggleCharacter(id, chosen),
 * onSetBody(id, body),
 * onSetting(name, value), onUse(), and `maxPeople`.
 */
export function createHud(root, handlers) {
  const { maxPeople } = handlers;
  const layer = document.createElement("div");
  layer.style.cssText = "position:absolute;inset:0;pointer-events:none;font-family:system-ui,sans-serif;";
  const touch = window.matchMedia?.("(pointer: coarse)").matches;

  const top = document.createElement("div");
  top.style.cssText =
    "position:absolute;top:8px;left:8px;right:8px;display:flex;flex-wrap:wrap;align-items:center;gap:6px;";
  const title = document.createElement("div");
  title.textContent = "Wanderworld";
  title.style.cssText = `${CHIP}font-size:14px;font-weight:700;`;
  const clock = document.createElement("div");
  clock.style.cssText = `${CHIP}font:12px ui-monospace,monospace;`;
  clock.title = "Time of day in town";
  const stats = document.createElement("div");
  stats.style.cssText = `${CHIP}font:12px ui-monospace,monospace;white-space:nowrap;`;
  stats.title = "Frame rate, draw calls, triangles and render resolution";
  const spacer = document.createElement("div");
  spacer.style.flex = "1";

  // The game's controls: in the bar on wide screens, in a drop-down menu on narrow ones.
  const controls = document.createElement("div");
  controls.setAttribute("data-wanderworld-ui", "");
  const personaLabel = document.createElement("label");
  personaLabel.style.cssText = `${CHIP}font-size:13px;display:none;align-items:center;gap:6px;pointer-events:auto;`;
  personaLabel.textContent = "Play as";
  const persona = document.createElement("select");
  persona.style.cssText = "font:13px system-ui,sans-serif;max-width:160px;border-radius:6px;border:0;padding:2px 4px;";
  // Which default body the persona gets when it has no 3D model.
  const personaBody = bodyPicker((body) => handlers.onSetBody(persona.value, body));
  persona.addEventListener("change", () => {
    handlers.onPickPersona(persona.value);
    personaBody.value = bodies[persona.value] ?? "auto";
  });
  personaLabel.append(persona, personaBody);
  let bodies = {};

  const panels = [];
  const togglePanel = (panel) => {
    const opening = panel.style.display === "none";
    for (const other of panels) other.style.display = "none";
    panel.style.display = opening ? "flex" : "none";
    if (narrow.matches) setMenu(false);
  };

  // People: which characters live in town.
  const peoplePanel = document.createElement("div");
  peoplePanel.setAttribute("data-wanderworld-ui", "");
  peoplePanel.style.cssText = PANEL;
  const peopleNote = document.createElement("div");
  peopleNote.style.cssText = "opacity:0.75;font-size:12px;margin-bottom:4px;";
  peopleNote.textContent = `Up to ${maxPeople} characters live in town, in their 3D Avatars model when they have one.`;
  const peopleList = document.createElement("div");
  peopleList.style.cssText = "display:flex;flex-direction:column;gap:2px;";
  peoplePanel.append(peopleNote, peopleList);
  panels.push(peoplePanel);
  const peopleButton = button("People", "Choose characters to live in town", () => togglePanel(peoplePanel));
  peopleButton.style.display = "none";

  // Settings.
  const settingsPanel = document.createElement("div");
  settingsPanel.setAttribute("data-wanderworld-ui", "");
  settingsPanel.style.cssText = PANEL;
  panels.push(settingsPanel);
  const settingsButton = button("Settings", "Resolution, speed, camera, sound and more", () =>
    togglePanel(settingsPanel),
  );
  const fields = {};
  const heading = (text) => {
    const element = document.createElement("div");
    element.textContent = text;
    element.style.cssText = "font-weight:700;margin-top:6px;opacity:0.85;";
    settingsPanel.append(element);
  };
  const row = (label, control) => {
    const element = document.createElement("label");
    element.style.cssText = "display:flex;align-items:center;justify-content:space-between;gap:10px;";
    const text = document.createElement("span");
    text.textContent = label;
    element.append(text, control);
    settingsPanel.append(element);
  };
  const choice = (name, label, labels) => {
    const select = document.createElement("select");
    select.style.cssText = "font:13px system-ui,sans-serif;border-radius:6px;border:0;padding:2px 4px;";
    for (const option of SETTINGS[name].options) {
      const element = document.createElement("option");
      element.value = String(option);
      element.textContent = labels[option] ?? String(option);
      select.append(element);
    }
    select.addEventListener("change", () => {
      const raw = select.value;
      handlers.onSetting(name, typeof SETTINGS[name].value === "number" ? Number(raw) : raw);
    });
    fields[name] = { set: (value) => (select.value = String(value)) };
    row(label, select);
  };
  const toggle = (name, label) => {
    const box = document.createElement("input");
    box.type = "checkbox";
    box.addEventListener("change", () => handlers.onSetting(name, box.checked));
    fields[name] = { set: (value) => (box.checked = value) };
    row(label, box);
  };
  const slider = (name, label, step, format) => {
    const wrap = document.createElement("span");
    wrap.style.cssText = "display:flex;align-items:center;gap:6px;";
    const range = document.createElement("input");
    range.type = "range";
    range.min = String(SETTINGS[name].min);
    range.max = String(SETTINGS[name].max);
    range.step = String(step);
    range.style.width = "110px";
    const value = document.createElement("span");
    value.style.cssText = "min-width:38px;text-align:right;font:12px ui-monospace,monospace;";
    range.addEventListener("input", () => {
      value.textContent = format(Number(range.value));
      handlers.onSetting(name, Number(range.value));
    });
    wrap.append(range, value);
    fields[name] = {
      set: (next) => {
        range.value = String(next);
        value.textContent = format(next);
      },
    };
    row(label, wrap);
  };
  const times = (value) => `${value.toFixed(1)}×`;
  heading("Graphics");
  choice("resolution", "Resolution", RESOLUTION_LABELS);
  choice("drawDistance", "Draw distance", DISTANCE_LABELS);
  choice("density", "Trees and rocks", { 1: "Normal", 4: "4×", 10: "10×" });
  toggle("shadows", "Shadows under people");
  toggle("nature", "Detailed trees and plants");
  toggle("props", "Detailed furniture and props");
  toggle("buildings", "Detailed buildings");
  choice("people", "People without a model", { kit: "Dressed (Quaternius)", simple: "Simple" });
  heading("Moving");
  choice("animation", "Animation", { recorded: "Recorded (Quaternius)", builtin: "Built-in" });
  slider("walkSpeed", "Walk and run speed", 0.1, times);
  slider("lookSpeed", "Camera turn speed", 0.1, times);
  toggle("invertLook", "Invert up and down");
  heading("World");
  choice("time", "Time", TIME_LABELS);
  toggle("interiors", "Walk into buildings (unfinished)");
  toggle("sound", "Sound");
  slider("volume", "Volume", 0.05, (value) => `${Math.round(value * 100)}%`);
  heading("Display");
  toggle("names", "Names over people");
  toggle("hint", "Controls hint");
  toggle("stats", "Frame rate");

  const fresh = button("New world", "Walk a different seeded world", handlers.onNewWorld);
  const fullscreen = button("Fullscreen", "Fill the screen with the world", handlers.onToggleFullscreen);
  fullscreen.style.display = "none";
  controls.append(personaLabel, peopleButton, settingsButton, fresh, fullscreen);

  const menuButton = button("☰", "Menu", () => setMenu(controls.dataset.open !== "1"));
  menuButton.setAttribute("aria-label", "Menu");
  const narrow = window.matchMedia?.(NARROW) ?? { matches: false };
  function setMenu(open) {
    controls.dataset.open = open ? "1" : "0";
    if (!narrow.matches) {
      controls.style.cssText = "display:flex;flex-wrap:wrap;align-items:center;gap:6px;";
      menuButton.style.display = "none";
      return;
    }
    menuButton.style.display = "";
    controls.style.cssText =
      `${CHIP}position:absolute;top:40px;right:0;display:${open ? "flex" : "none"};flex-direction:column;` +
      "align-items:stretch;gap:6px;padding:8px;pointer-events:auto;";
  }
  const onNarrow = () => setMenu(false);
  narrow.addEventListener?.("change", onNarrow);
  setMenu(false);
  top.append(title, clock, stats, spacer, menuButton, controls);

  // The "use" prompt over whatever you could use, and on touch screens a Use button by the stick.
  const prompt = document.createElement("div");
  prompt.style.cssText = `${CHIP}position:absolute;left:0;top:0;transform:translate(-50%,-100%);font:600 13px system-ui,sans-serif;display:none;white-space:nowrap;`;
  const use = button("Use", "Use what's in front of you", () => handlers.onUse());
  // Bottom right, under the thumb that isn't on the stick.
  use.style.cssText += "position:absolute;bottom:32px;right:20px;padding:16px 20px;font-size:15px;display:none;";

  const hint = document.createElement("div");
  hint.textContent = touch
    ? "Stick to walk · drag to look · pinch to zoom · tap someone or something to use it"
    : "WASD walk · Shift run · drag or arrows to look · scroll to zoom · E or click to use · Esc to leave";
  // On touch screens the hint sits under the bar, clear of the stick and the Use button.
  hint.style.cssText = touch
    ? `${CHIP}position:absolute;top:84px;left:8px;font-size:12px;opacity:0.8;max-width:min(80%,420px);`
    : `${CHIP}position:absolute;bottom:8px;right:8px;font-size:12px;opacity:0.8;max-width:min(60%,560px);`;

  const status = document.createElement("div");
  status.style.cssText = `${CHIP}position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:14px;display:none;max-width:80%;text-align:center;`;

  // A notice that stays until it's closed, for advice like turning on hardware acceleration.
  const notice = document.createElement("div");
  notice.setAttribute("data-wanderworld-ui", "");
  notice.style.cssText = `${CHIP}position:absolute;top:48px;left:50%;transform:translateX(-50%);width:min(520px,calc(100% - 24px));display:none;gap:10px;align-items:flex-start;padding:10px 12px;font-size:13px;pointer-events:auto;`;
  const noticeText = document.createElement("div");
  noticeText.style.flex = "1";
  const noticeClose = button("Close", "Close this notice", () => (notice.style.display = "none"));
  notice.append(noticeText, noticeClose);

  const loading = document.createElement("div");
  loading.style.cssText =
    "position:absolute;inset:0;display:none;align-items:center;justify-content:center;flex-direction:column;gap:10px;" +
    "background:linear-gradient(#bfd9ee,#e9e1cf);color:#2b3440;font:600 18px system-ui,sans-serif;pointer-events:auto;";
  const fade = document.createElement("div");
  fade.style.cssText =
    "position:absolute;inset:0;background:#000;opacity:0;transition:opacity 0.35s;pointer-events:none;";

  // The card a door shows: the building, who is in it, and (later) a button to start a scene with them.
  const scene = document.createElement("div");
  scene.setAttribute("data-wanderworld-ui", "");
  scene.style.cssText = `${CHIP}position:absolute;left:50%;bottom:48px;transform:translateX(-50%);width:min(420px,calc(100% - 24px));display:none;flex-direction:column;gap:8px;padding:12px 14px;font-size:14px;pointer-events:auto;`;
  const sceneTitle = document.createElement("div");
  sceneTitle.style.cssText = "font-weight:700;font-size:15px;";
  const scenePeople = document.createElement("div");
  const sceneNote = document.createElement("div");
  sceneNote.style.cssText = "font-size:12px;opacity:0.75;";
  sceneNote.textContent =
    "Starting a scene here, with everyone inside taking part, comes with the AI part of Wanderworld.";
  const sceneButtons = document.createElement("div");
  sceneButtons.style.cssText = "display:flex;gap:8px;justify-content:flex-end;";
  const sceneStart = button("Start scene", "Coming with the AI part", () => {});
  sceneStart.disabled = true;
  sceneStart.style.opacity = "0.5";
  sceneStart.style.cursor = "default";
  const sceneClose = button("Close", "Close this card", () => (scene.style.display = "none"));
  sceneButtons.append(sceneStart, sceneClose);
  scene.append(sceneTitle, scenePeople, sceneNote, sceneButtons);

  layer.append(top, peoplePanel, settingsPanel, notice, scene, prompt, use, hint, status, fade, loading);
  root.append(layer);

  return {
    layer,
    setStats({ fps, calls, triangles, scale }) {
      stats.textContent = `${fps} fps · ${calls} draws · ${Math.round(triangles / 1000)}k tris · ${Math.round(scale * 100)}% res`;
    },
    setClock(text) {
      clock.textContent = text;
    },
    /** Shows each setting's current value, and applies the display ones. */
    setSettings(settings) {
      for (const [name, field] of Object.entries(fields)) field.set(settings[name]);
      hint.style.display = settings.hint ? "" : "none";
      stats.style.display = settings.stats ? "" : "none";
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
    /** Fills the "Play as" menu; an empty list hides it. */
    setPersonas(personas, selectedId, chosenBodies = {}) {
      bodies = chosenBodies;
      persona.replaceChildren(
        ...personas.map((entry) => {
          const option = document.createElement("option");
          option.value = entry.id;
          option.textContent = entry.name;
          return option;
        }),
      );
      persona.value = selectedId ?? "";
      personaBody.value = bodies[selectedId] ?? "auto";
      personaLabel.style.display = personas.length ? "flex" : "none";
    },
    /** Fills the People checklist; `chosen` is a Set of character ids, `chosenBodies` their default bodies.
     *  An empty list hides the button. */
    setCharacters(characters, chosen, chosenBodies = {}) {
      bodies = chosenBodies;
      peopleButton.style.display = characters.length ? "" : "none";
      peopleButton.textContent = chosen.size ? `People (${chosen.size})` : "People";
      peopleList.replaceChildren(
        ...characters.map((character) => {
          const entry = document.createElement("label");
          entry.style.cssText = "display:flex;align-items:center;gap:8px;cursor:pointer;padding:2px 0;";
          const box = document.createElement("input");
          box.type = "checkbox";
          box.checked = chosen.has(character.id);
          box.disabled = !box.checked && chosen.size >= maxPeople;
          box.addEventListener("change", () => handlers.onToggleCharacter(character.id, box.checked));
          const name = document.createElement("span");
          name.textContent = character.name;
          name.style.flex = "1";
          const body = bodyPicker((value) => handlers.onSetBody(character.id, value));
          body.value = bodies[character.id] ?? "auto";
          entry.append(box, name, body);
          return entry;
        }),
      );
    },
    /** The use prompt: `label` ("Sit", "Talk to Mira") at screen point (x, y), or null to hide it. */
    setPrompt(label, x, y) {
      const show = !!label;
      use.style.display = show && touch ? "" : "none";
      prompt.style.display = show && !touch && Number.isFinite(x) ? "" : "none";
      if (!show) return;
      use.textContent = label;
      prompt.textContent = `E  ${label}`;
      prompt.style.left = `${x}px`;
      prompt.style.top = `${y}px`;
    },
    /** The card for a building: { title, people: [names] }, or null to close it. */
    setScene(info) {
      scene.style.display = info ? "flex" : "none";
      if (!info) return;
      sceneTitle.textContent = info.title;
      scenePeople.textContent = info.people.length ? `Inside: ${info.people.join(", ")}` : "Nobody seems to be in.";
    },
    /** A notice with `text` and a Close button, or null to take it away. */
    setNotice(text) {
      noticeText.textContent = text ?? "";
      notice.style.display = text ? "flex" : "none";
    },
    setStatus(text) {
      status.textContent = text ?? "";
      status.style.display = text ? "block" : "none";
    },
    /** A full-screen loading card with `text`, or null to hide it. */
    setLoading(text) {
      loading.textContent = text ?? "";
      loading.style.display = text ? "flex" : "none";
    },
    /** Fades the view to black (true) or back (false), for going through doors. */
    setFade(dark) {
      fade.style.opacity = dark ? "1" : "0";
    },
    /** Hides the bar and hint while a conversation has the screen. */
    setBusy(busy) {
      top.style.visibility = busy ? "hidden" : "";
      hint.style.visibility = busy ? "hidden" : "";
      if (busy) for (const panel of panels) panel.style.display = "none";
    },
    destroy() {
      narrow.removeEventListener?.("change", onNarrow);
      layer.remove();
    },
  };
}
