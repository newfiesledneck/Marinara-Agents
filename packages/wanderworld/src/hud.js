// The overlay on top of the world: a title bar with the game's buttons (folded into a menu on narrow
// screens), the People and Settings panels, a performance readout, a clock, the "use" prompt, a controls
// hint, a status line and a loading screen. Only controls take pointer events; the rest lets touches through.
import { createJournal } from "./journal.js";
import { SETTINGS } from "./settings.js";
import { INK_BUTTON, INK_INPUT, INK_SMALL, INK_SOFT, NOTE_PAPER, PARCHMENT, PARCHMENT_EDGED, SERIF } from "./ui.js";

const CHIP = "background:rgba(10,14,20,0.62);color:#f3f5f7;border-radius:8px;padding:4px 10px;";
const BUTTON = `${CHIP}font:600 13px system-ui,sans-serif;border:0;cursor:pointer;pointer-events:auto;`;
const PANEL =
  `${PARCHMENT}position:absolute;top:48px;right:8px;display:none;flex-direction:column;gap:4px;max-height:calc(100% - 64px);` +
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
 * `handlers`: onMenu, onToggleFullscreen, onPickPersona(id), onToggleCharacter(id, chosen),
 * onSetBody(id, body), onSetting(name, value), onUse(), onRenameZone(id, name), onZoneLore(id), and
 * `maxPeople`.
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
  // Where you are: the place, and the lore active there.
  const place = document.createElement("div");
  place.style.cssText = `${CHIP}font-size:12px;display:none;max-width:min(360px,60vw);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;`;
  place.title = "Where you are, and the lore that's active here";
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
  slider("walkSpeed", "Walk speed", 0.1, times);
  slider("runSpeed", "Run speed", 0.1, times);
  slider("lookSpeed", "Camera turn speed", 0.1, times);
  toggle("invertLook", "Invert up and down");
  heading("World");
  choice("time", "Time", TIME_LABELS);
  toggle("interiors", "Walk into buildings (unfinished)");
  choice("combat", "Confrontations and combat", {
    anywhere: "Anywhere",
    outsideTowns: "Outside towns",
    outsideSafe: "Outside safe places",
    off: "Off",
  });
  toggle("sound", "Sound");
  slider("volume", "Volume", 0.05, (value) => `${Math.round(value * 100)}%`);
  heading("Display");
  toggle("names", "Names over people");
  toggle("hint", "Controls hint");
  toggle("stats", "Frame rate");

  // The Journal: where everyone is, places and their lore.
  const journal = createJournal(PANEL, {
    onRename: (id, name) => handlers.onRenameZone(id, name),
    onLore: (id) => handlers.onZoneLore(id),
    onPartyWait: (id, wait) => handlers.onPartyWait(id, wait),
    onPartyLeave: (id) => handlers.onPartyLeave(id),
    onSetRelation: (from, to, fields, both) => handlers.onSetRelation(from, to, fields, both),
    onSetTraits: (id, traits) => handlers.onSetTraits(id, traits),
  });
  panels.push(journal.panel);
  const journalButton = button("Journal", "Where you are, who's around, places and their lore (J)", () =>
    togglePanel(journal.panel),
  );
  // Lore: every lorebook entry active where you are, from the place and the places it's in.
  const lorePanel = document.createElement("div");
  lorePanel.setAttribute("data-wanderworld-ui", "");
  lorePanel.style.cssText = PANEL;
  lorePanel.style.display = "none";
  panels.push(lorePanel);
  const loreButton = button("Lore", "The lore active where you are", () => {
    togglePanel(lorePanel);
    if (lorePanel.style.display !== "none") handlers.onOpenLore?.();
  });
  const fresh = button("Menu", "Save and go back to the main menu", handlers.onMenu);
  const fullscreen = button("Fullscreen", "Fill the screen with the world", handlers.onToggleFullscreen);
  fullscreen.style.display = "none";
  controls.append(personaLabel, peopleButton, journalButton, loreButton, settingsButton, fresh, fullscreen);

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
  top.append(title, clock, place, stats, spacer, menuButton, controls);

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

  // The loading screen: the painted lantern-lit street (its sign already says Loading…), with what's
  // happening in small type at the bottom.
  const loading = document.createElement("div");
  loading.style.cssText =
    "position:absolute;inset:0;display:none;align-items:flex-end;justify-content:center;padding-bottom:6vh;" +
    "background:#1b2338 center/cover;color:#f3f5f7;font:600 15px system-ui,sans-serif;pointer-events:auto;";
  if (handlers.loadingArt) loading.style.backgroundImage = `url("${handlers.loadingArt}")`;
  const loadingText = document.createElement("div");
  loadingText.style.cssText = `${CHIP}padding:6px 14px;`;
  loading.append(loadingText);
  const fade = document.createElement("div");
  fade.style.cssText =
    "position:absolute;inset:0;background:#000;opacity:0;transition:opacity 0.35s;pointer-events:none;";

  // The card a door (or a cave, the fountain…) shows: the place, who is there, what you can do, your own
  // line, who comes along; then the scene that sets up, for the AI to play out.
  const scene = document.createElement("div");
  scene.setAttribute("data-wanderworld-ui", "");
  scene.style.cssText = `${PARCHMENT_EDGED}position:absolute;left:50%;bottom:48px;transform:translateX(-50%);width:min(420px,calc(100% - 24px));display:none;flex-direction:column;gap:8px;padding:20px 24px;font-size:14px;pointer-events:auto;`;
  const sceneTitle = document.createElement("div");
  sceneTitle.style.cssText = `font:700 17px ${SERIF};`;
  const sceneBody = document.createElement("div");
  sceneBody.style.cssText = "display:flex;flex-direction:column;gap:8px;";
  const sceneClose = button("Close", "Close this card", () => (scene.style.display = "none"));
  sceneClose.style.cssText = INK_BUTTON;
  const sceneButtons = document.createElement("div");
  sceneButtons.style.cssText = "display:flex;gap:8px;justify-content:flex-end;";
  sceneButtons.append(sceneClose);
  scene.append(sceneTitle, sceneBody, sceneButtons);
  // Keys typed into the card's line stay out of the game's controls.
  scene.addEventListener("keydown", (event) => event.stopPropagation());

  // A place's name, large for a moment, on walking into it.
  const zoneTitle = document.createElement("div");
  zoneTitle.style.cssText =
    "position:absolute;top:18%;left:50%;transform:translateX(-50%);font:700 clamp(22px,3.4vw,34px) Georgia,'Times New Roman',serif;" +
    "color:#fff8e6;text-shadow:0 2px 10px rgba(0,0,0,0.6);opacity:0;transition:opacity 0.6s;pointer-events:none;text-align:center;white-space:nowrap;";
  let zoneTimer = 0;

  // The noticeboard: the notes pinned on it, and a place to pin your own.
  const board = document.createElement("div");
  board.setAttribute("data-wanderworld-ui", "");
  board.style.cssText = `${PARCHMENT_EDGED}position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(560px,calc(100% - 24px));max-height:calc(100% - 96px);overflow-y:auto;display:none;flex-direction:column;gap:10px;padding:24px 28px;pointer-events:auto;font-size:14px;`;
  let boardHandlers = null;
  board.addEventListener("keydown", (event) => event.stopPropagation());

  layer.append(
    board,
    top,
    peoplePanel,
    journal.panel,
    lorePanel,
    settingsPanel,
    notice,
    scene,
    prompt,
    use,
    hint,
    zoneTitle,
    status,
    fade,
    loading,
  );
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
    /** The place line: `text` ("Briarwood · Mill Lane") and the titles of the lore active there. */
    setPlace(text, lore = []) {
      place.style.display = text ? "" : "none";
      place.textContent = lore.length ? `${text} · 📜 ${lore.join(", ")}` : text;
    },
    /** Whether the Lore panel is open. */
    loreOpen() {
      return lorePanel.style.display !== "none";
    },
    /** The Lore panel's contents: { place, entries: [{ title, book, from, content }], loading }. */
    setLore(info) {
      const key = JSON.stringify(info);
      if (lorePanel.dataset.key === key) return; // unchanged: keep folds as they are
      lorePanel.dataset.key = key;
      const text = (content, style) => {
        const node = document.createElement("div");
        node.style.cssText = style;
        node.textContent = content;
        return node;
      };
      const nodes = [text(`Lore here: ${info.place}`, `font:700 15px ${SERIF};`)];
      if (!info.entries.length)
        nodes.push(
          text(
            "No lore is active here. Tie lorebook entries to places in Journal → Places.",
            "font-size:12px;opacity:0.75;",
          ),
        );
      for (const entry of info.entries) {
        const fold = document.createElement("details");
        fold.style.cssText = "border-top:1px solid rgba(110,80,40,0.25);padding:4px 0;";
        const summary = document.createElement("summary");
        summary.style.cssText = "cursor:pointer;font-size:13px;font-weight:600;";
        summary.textContent = `📜 ${entry.title}`;
        fold.append(
          summary,
          text(
            [entry.book, `from ${entry.from}`].filter(Boolean).join(" · "),
            "font-size:11px;opacity:0.65;margin:2px 0 4px 18px;",
          ),
          text(
            entry.content ?? (info.loading ? "Reading the lorebook…" : "(This entry has no text.)"),
            "font-size:12px;line-height:1.45;white-space:pre-wrap;margin-left:18px;max-height:220px;overflow:auto;",
          ),
        );
        nodes.push(fold);
      }
      lorePanel.replaceChildren(...nodes);
    },
    /** Shows a place's name large for a few seconds. */
    showZone(name) {
      zoneTitle.textContent = name;
      zoneTitle.style.opacity = "1";
      clearTimeout(zoneTimer);
      zoneTimer = setTimeout(() => (zoneTitle.style.opacity = "0"), 2600);
    },
    journal,
    /** Opens or closes the Journal. */
    toggleJournal() {
      togglePanel(journal.panel);
    },
    /** Opens the Settings panel (from the main menu). */
    openSettings() {
      if (settingsPanel.style.display === "none") togglePanel(settingsPanel);
    },
    /** While the main menu is up: the bar, hint and panels go. */
    setMenuOpen(open) {
      top.style.display = open ? "none" : "flex";
      hint.style.visibility = open ? "hidden" : "";
      for (const panel of panels) panel.style.display = "none";
      if (open) {
        scene.style.display = "none";
        board.style.display = "none";
        zoneTitle.style.opacity = "0";
      }
    },
    /**
     * The noticeboard: { title, notes: [{ id, text, by, mine }] }, with `handlers` onPin(text) and
     * onRemove(id); or null to close it.
     */
    /** Whether the noticeboard is open (no use prompts over it). */
    get boardOpen() {
      return board.style.display !== "none";
    },
    setNoticeboard(info, handlers = boardHandlers) {
      boardHandlers = handlers;
      board.style.display = info ? "flex" : "none";
      if (!info) return;
      const header = document.createElement("div");
      header.style.cssText = "display:flex;align-items:center;gap:8px;";
      const title = document.createElement("div");
      title.style.cssText = `font:700 18px ${SERIF};flex:1;`;
      title.textContent = info.title;
      const close = button("Close", "Close the noticeboard", () => (board.style.display = "none"));
      close.style.cssText = INK_BUTTON;
      header.append(title, close);
      const grid = document.createElement("div");
      grid.style.cssText = "display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;";
      info.notes.forEach((note, i) => {
        const card = document.createElement("div");
        card.style.cssText = `${NOTE_PAPER}padding:16px 14px 12px;border-radius:3px;font:15px ${SERIF};line-height:1.35;box-shadow:0 2px 6px rgba(40,25,10,0.3);transform:rotate(${((i * 37) % 7) - 3}deg);position:relative;`;
        const pin = document.createElement("div");
        pin.style.cssText =
          "position:absolute;top:5px;left:50%;width:9px;height:9px;margin-left:-4px;border-radius:50%;background:#9b2a22;box-shadow:0 1px 2px rgba(0,0,0,0.4);";
        const words = document.createElement("div");
        words.textContent = note.text;
        card.append(pin, words);
        if (note.by) {
          const by = document.createElement("div");
          by.style.cssText = `margin-top:6px;font-size:12px;font-style:italic;color:${INK_SOFT};text-align:right;`;
          by.textContent = `— ${note.by}`;
          card.append(by);
        }
        if (note.mine) {
          const remove = button("Take down", "Take this note down", () => boardHandlers?.onRemove(note.id));
          remove.style.cssText = `${INK_SMALL}margin-top:8px;`;
          card.append(remove);
        }
        grid.append(card);
      });
      const hint = document.createElement("div");
      hint.style.cssText = `font-size:12px;font-style:italic;color:${INK_SOFT};`;
      hint.textContent = "Quests and news the AI writes will be pinned here once Wanderworld can call it.";
      const form = document.createElement("form");
      form.style.cssText = "display:flex;gap:8px;";
      const input = document.createElement("input");
      input.style.cssText = `${INK_INPUT}flex:1;min-width:0;`;
      input.placeholder = "Write a note to pin up…";
      input.maxLength = 400;
      const pin = button("Pin it up", "Pin your note to the board", () => {});
      pin.type = "submit";
      pin.style.cssText = INK_BUTTON;
      form.append(input, pin);
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const text = input.value.trim();
        if (text) boardHandlers?.onPin(text);
      });
      board.replaceChildren(header, grid, hint, form);
    },
    /**
     * The card for a place or thing, or null: { title, people: [names there], party: [{ id, name }],
     * actions: [{ id, label }], placeholder }. `onStart(actionId, line, partyIds)` sets up the scene and
     * returns its words, which the card then shows.
     */
    setScene(info, onStart) {
      scene.style.display = info ? "flex" : "none";
      if (!info) return;
      sceneTitle.textContent = info.title;
      const text = (content, style = "") => {
        const node = document.createElement("div");
        node.style.cssText = style;
        node.textContent = content;
        return node;
      };
      const there = info.people.length ? `There: ${info.people.join(", ")}.` : (info.empty ?? "");
      const nodes = there ? [text(there)] : [];
      // Who comes along: everyone in the party who's with you, ticked.
      const along = new Set(info.party.map((member) => member.id));
      if (info.party.length) {
        const row = text("", "display:flex;gap:10px;flex-wrap:wrap;align-items:center;font-size:13px;");
        row.append(text("With you:", "opacity:0.75;"));
        for (const member of info.party) {
          const label = document.createElement("label");
          label.style.cssText = "display:flex;gap:4px;align-items:center;cursor:pointer;";
          const box = document.createElement("input");
          box.type = "checkbox";
          box.checked = true;
          box.addEventListener("change", () => (box.checked ? along.add(member.id) : along.delete(member.id)));
          label.append(box, text(member.name));
          row.append(label);
        }
        nodes.push(row);
      }
      const line = document.createElement("textarea");
      line.rows = 2;
      line.maxLength = 600;
      line.placeholder = info.placeholder ?? "Your own line: what you do or say (optional)";
      line.style.cssText = `${INK_INPUT}resize:vertical;font:13px system-ui,sans-serif;`;
      const start = (id) => {
        const words = onStart?.(id, line.value, [...along]);
        if (!words) return;
        sceneBody.replaceChildren(
          text("The scene is set:", `font:700 13px ${SERIF};`),
          text(words, `${NOTE_PAPER}padding:8px 10px;font-size:13px;line-height:1.45;`),
          text(
            "The AI part of Wanderworld will play it out from here, with everyone there taking part. It's kept in the Journal (Here).",
            "font-size:12px;opacity:0.75;",
          ),
        );
      };
      const actions = text("", "display:flex;gap:6px;flex-wrap:wrap;");
      for (const action of info.actions) {
        const go = button(action.label, `${action.label}, with your line if you wrote one`, () => start(action.id));
        go.style.cssText = INK_BUTTON;
        actions.append(go);
      }
      const own = button("Just my line", "Start the scene from your own line alone", () => {
        if (line.value.trim()) start("own");
        else line.focus();
      });
      own.style.cssText = INK_BUTTON;
      actions.append(own);
      nodes.push(line, actions);
      sceneBody.replaceChildren(...nodes);
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
      loadingText.textContent = text ?? "";
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
