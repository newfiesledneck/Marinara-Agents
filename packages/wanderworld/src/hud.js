// The overlay on top of the world: a title bar with the game's buttons (folded into a menu on narrow
// screens), the People and Settings panels, a performance readout, a clock, the "use" prompt, a controls
// hint, a status line and a loading screen. Only controls take pointer events; the rest lets touches through.
import { createAssistant } from "./assistant.js";
import { createJournal } from "./journal.js";
import { createIllustrateWindow, floatingFrame } from "./illustrate.js";
import { createPersonEditor } from "./person.js";
import { CREDITS, HELP, KEYWORD_GUIDE, keywordGroups } from "./help.js";
import { makeFloating } from "./floating.js";
import { BARE, COLOUR_FIELD, EXTRAS, HAIR_COLOURS, HAIRSTYLES, HEIGHTS, OUTFITS, PIECES, SKIN_TONES } from "./looks.js";
import { SPEECH_HELP } from "./interactions.js";
import { mapCanvas, randomSeed } from "./map.js";
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

/** A colour (0xRRGGBB) as hue (0–360), strength and light (0–100 each), and back. */
function toHsl(colour) {
  const [r, g, b] = [(colour >> 16) & 255, (colour >> 8) & 255, colour & 255].map((value) => value / 255);
  const [max, min] = [Math.max(r, g, b), Math.min(r, g, b)];
  const l = (max + min) / 2;
  const d = max - min;
  if (!d) return { h: 0, s: 0, l: l * 100 };
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = max === r ? ((g - b) / d + 6) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: h * 60, s: s * 100, l: l * 100 };
}
function fromHsl({ h, s, l }) {
  const [sat, light] = [s / 100, l / 100];
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = light - c / 2;
  const [r, g, b] = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ][Math.floor(h / 60) % 6];
  const byte = (value) => Math.max(0, Math.min(255, Math.round((value + m) * 255)));
  return (byte(r) << 16) | (byte(g) << 8) | byte(b);
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
const DISTANCE_LABELS = { 60: "Tiny", 90: "Near", 140: "Medium", 200: "Far", 300: "Very far", 450: "Max" };
const TIME_LABELS = { cycle: "Day and night", day: "Always day", night: "Always night" };

/**
 * `handlers`: onMenu, onToggleFullscreen, onPickPersona(id), onToggleCharacter(id, chosen),
 * onSetBody(id, body), onSetLook(id, look), onSetPet(id, role, pet), lookOf(id), onSetting(name, value), onUse(), onJump(),
 * onRest(), onRenameZone(id, name), onZoneLore(id), and `maxPeople`.
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
  // And how it's dressed, coloured and so on (the Look card, below).
  const personaLook = button("Look", "Choose your avatar and how you look", () => openLook(persona.value));
  personaLook.style.cssText += "padding:2px 8px;font-size:12px;";
  personaLabel.append(persona, personaBody, personaLook);
  let bodies = {};

  // The Look card: what someone without a 3D model wears and looks like. Every change shows at once.
  let lookCard = null;
  const closeLook = () => {
    lookCard?.remove();
    lookCard = null;
  };
  async function openLook(id) {
    closeLook();
    const info = await handlers.lookOf(id);
    if (!info) return;
    const card = document.createElement("div");
    card.setAttribute("data-wanderworld-ui", "");
    card.style.cssText = `${PANEL}display:flex;top:56px;right:auto;left:8px;gap:6px;width:min(300px,calc(100% - 16px));z-index:5;`;
    lookCard = card;
    layer.append(card);
    let chosen = { ...info.chosen };
    let now = info.now;
    let pets = info.pets;
    let picking = null; // which colour of one's own is being picked ("tint:top", "hairTint", "skinTint")
    let draft = null; // the colour in the picker, as { h, s, l }, until it's used or cancelled
    const draw = () => {
      const title = document.createElement("div");
      title.style.cssText = "font-weight:700;font-size:14px;";
      title.textContent = `${info.name || "Their"} look`;
      const note = document.createElement("div");
      note.style.cssText = "font-size:12px;opacity:0.8;line-height:1.35;";
      const ownModel = info.models?.kinds.length > 0 && chosen.avatar !== "builtin";
      note.textContent = ownModel
        ? "Their card's 3D model is what's shown. The rest of this look is for the built-in person."
        : "The built-in person, dressed as below. Changes show at once and are kept with this world.";
      const rows = [title, note];
      // `patch`: the choices to make; one given as undefined is unmade (back to how the name has it).
      const set = (patch) => {
        chosen = { ...chosen, ...patch };
        if ("skin" in patch) chosen.skinSet = 2; // (looks.js: which list its number is from)
        for (const key of Object.keys(chosen)) if (chosen[key] === undefined) delete chosen[key];
        handlers.onSetLook(id, chosen);
        void handlers.lookOf(id).then((next) => {
          if (!next || lookCard !== card) return;
          now = next.now;
          card.replaceChildren(...draw());
        });
      };
      const row = (label, control) => {
        // (Not a <label>: a row may hold a second control, the square for a colour of one's own.)
        const line = document.createElement("div");
        line.style.cssText = "display:flex;align-items:center;gap:8px;font-size:13px;";
        const name = document.createElement("span");
        name.style.cssText = "min-width:92px;";
        name.textContent = label;
        control.style.flex = "1";
        line.append(name, control);
        rows.push(line);
      };
      const pick = (label, key, options, value, read = (text) => text, also = {}) => {
        const select = document.createElement("select");
        select.style.cssText = "font:inherit;padding:6px;border-radius:6px;min-height:36px;min-width:0;";
        select.setAttribute("aria-label", label);
        for (const [option, text] of options) {
          const item = document.createElement("option");
          item.value = String(option);
          item.textContent = text;
          select.append(item);
        }
        select.value = String(value);
        select.addEventListener("change", () => set({ ...also, [key]: read(select.value) }));
        row(label, select);
      };
      // Which avatar: their card's own 3D model (each kind it has), or the built-in person instead.
      if (info.models?.kinds.length) {
        const MODEL_NAMES = { vrm: "VRM", "glb-fbx": "GLB / FBX", mmd: "MMD" };
        const { kinds, active } = info.models;
        pick(
          "Avatar",
          "avatar",
          [
            ["", `Their card's 3D model (${MODEL_NAMES[active]})`],
            ...kinds.filter((kind) => kind !== active).map((kind) => [kind, `Their card's ${MODEL_NAMES[kind]} model`]),
            ["builtin", "Built-in person"],
          ],
          kinds.includes(chosen.avatar) && chosen.avatar !== active
            ? chosen.avatar
            : chosen.avatar === "builtin"
              ? "builtin"
              : "",
          (value) => value || undefined,
        );
      }
      const hex = (value) => `#${value.toString(16).padStart(6, "0")}`;
      const outfitNames = now.outfits.map((name) => [name, OUTFITS[name].label]);
      // A colour of your own, for a piece, the hair or the skin: a small square beside its row opens the
      // picker under it, and nothing changes until "Use this colour".
      const square = (key, colour, label) => {
        const open = button(colour === null ? "Colour" : "", label, () => {
          picking = picking === key ? null : key;
          draft = null;
          card.replaceChildren(...draw());
        });
        open.style.cssText += `flex:0 0 auto;min-width:36px;min-height:36px;padding:0 8px;font-size:11px;${
          colour === null ? "" : `background:${hex(colour)};border:2px solid rgba(0,0,0,0.35);`
        }`;
        open.setAttribute("aria-label", label);
        return open;
      };
      const picker = (key, colour, onUse, onClear) => {
        if (picking !== key) return;
        // Hue, strength and light, so it works the same on a phone as with a mouse.
        draft ??= toHsl(colour ?? 0x8a6a4a);
        const panel = document.createElement("div");
        panel.style.cssText =
          "display:flex;flex-direction:column;gap:4px;padding:8px;border-radius:8px;background:rgba(0,0,0,0.12);font-size:12px;";
        const preview = document.createElement("div");
        preview.style.cssText = "height:26px;border-radius:6px;border:2px solid rgba(0,0,0,0.35);";
        const show = () => (preview.style.background = hex(fromHsl(draft)));
        panel.append(preview);
        for (const [part, label, max] of [
          ["h", "Colour", 360],
          ["s", "Strength", 100],
          ["l", "Light", 100],
        ]) {
          const line = document.createElement("label");
          line.style.cssText = "display:flex;align-items:center;gap:8px;";
          const name = document.createElement("span");
          name.style.cssText = "min-width:56px;";
          name.textContent = label;
          const slider = document.createElement("input");
          slider.type = "range";
          slider.min = "0";
          slider.max = String(max);
          slider.value = String(Math.round(draft[part]));
          slider.style.flex = "1";
          slider.setAttribute("aria-label", label);
          slider.addEventListener("input", () => {
            draft = { ...draft, [part]: Number(slider.value) };
            show();
          });
          line.append(name, slider);
          panel.append(line);
        }
        show();
        const buttons = document.createElement("div");
        buttons.style.cssText = "display:flex;gap:6px;flex-wrap:wrap;";
        const close = () => {
          picking = null;
          draft = null;
        };
        const use = button("Use this colour", "Set this colour", () => {
          const chosenColour = fromHsl(draft);
          close();
          onUse(chosenColour);
        });
        const cancel = button("Cancel", "Leave it as it was", () => {
          close();
          card.replaceChildren(...draw());
        });
        buttons.append(use);
        if (onClear) {
          buttons.append(
            button("No colour", "Back to the cloth's own colour", () => {
              close();
              onClear();
            }),
          );
        }
        buttons.append(cancel);
        for (const control of buttons.children) control.style.cssText += "flex:1;padding:8px 6px;font-size:12px;";
        panel.append(buttons);
        rows.push(panel);
      };
      const tintOf = (piece) => now.tints[piece] ?? null;
      const setTint = (piece, colour) => {
        const tints = { ...now.tints };
        if (colour === null) delete tints[piece];
        else tints[piece] = colour;
        set({ tints: Object.keys(tints).length ? tints : undefined });
      };
      const tintRow = (piece, label) => {
        rows[rows.length - 1].append(
          square(`tint:${piece}`, tintOf(piece), `A colour of your own for the ${label.toLowerCase()}`),
        );
        picker(
          `tint:${piece}`,
          tintOf(piece),
          (colour) => setTint(piece, colour),
          () => setTint(piece, null),
        );
      };
      // A whole outfit: choosing one puts every piece back to it.
      pick("Outfit", "outfit", outfitNames, now.outfit, (text) => text, {
        top: undefined,
        arms: undefined,
        legs: undefined,
        feet: undefined,
        hood: undefined,
        pauldrons: undefined,
      });
      // Its pieces, each from any outfit and in a colour of its own if you like; the ranger's hood and
      // pauldrons on or off.
      for (const [piece, label] of PIECES) {
        pick(label, piece, [...outfitNames, [BARE, "None"]], now[piece]);
        // (A piece left off is skin: its colour is the skin's.)
        if (now[piece] !== BARE) tintRow(piece, label);
      }
      for (const [extra, label] of EXTRAS) {
        pick(
          label,
          extra,
          [
            ["yes", "On"],
            ["no", "Off"],
          ],
          now[extra] ? "yes" : "no",
          (text) => text === "yes",
        );
        if (now[extra]) tintRow(extra, label);
      }
      // Each outfit's cloth has its own colours: only those with a piece on show.
      for (const kind of now.worn) {
        const field = COLOUR_FIELD[kind];
        pick(now.worn.length > 1 ? `${OUTFITS[kind].label} cloth` : "Cloth", field, OUTFITS[kind].colours, now[field]);
      }
      pick(
        "Hair",
        "hair",
        HAIRSTYLES.map(([style, text]) => [style, text]),
        now.hair,
      );
      // Hair and skin: one from the list, or a colour of your own.
      const listOrOwn = (label, list, at, own, key, ownKey) => {
        const select = document.createElement("select");
        select.style.cssText = "font:inherit;padding:6px;border-radius:6px;min-height:36px;min-width:0;";
        select.setAttribute("aria-label", label);
        for (const [value, text] of [...list.map((name, i) => [String(i), name]), ["own", "Your own…"]]) {
          const item = document.createElement("option");
          item.value = value;
          item.textContent = text;
          select.append(item);
        }
        select.value = own === null ? String(at) : "own";
        select.addEventListener("change", () => {
          if (select.value === "own") {
            // Nothing changes yet: the picker opens, and its button sets the colour.
            picking = ownKey;
            draft = null;
            card.replaceChildren(...draw());
          } else set({ [key]: Number(select.value), [ownKey]: undefined });
        });
        row(label, select);
        if (own !== null) rows[rows.length - 1].append(square(ownKey, own, `Change your own ${label.toLowerCase()}`));
        picker(ownKey, own, (colour) => set({ [ownKey]: colour }));
      };
      listOrOwn(
        "Hair colour",
        HAIR_COLOURS.map(([, name]) => name),
        now.hairColour,
        now.hairTint,
        "hairColour",
        "hairTint",
      );
      listOrOwn(
        "Skin",
        SKIN_TONES.map(([, name]) => name),
        now.skin,
        now.skinTint,
        "skin",
        "skinTint",
      );
      if (now.sex === "male") {
        pick(
          "Beard",
          "beard",
          [
            ["yes", "Bearded"],
            ["no", "Clean-shaven"],
          ],
          now.beard ? "yes" : "no",
          (text) => text === "yes",
        );
      }
      const height = document.createElement("input");
      height.type = "range";
      height.min = String(HEIGHTS[0]);
      height.max = String(HEIGHTS[1]);
      height.step = "0.02";
      height.value = String(now.height);
      height.setAttribute("aria-label", "Height");
      height.addEventListener("change", () => set({ height: Number(height.value) }));
      row("Height", height);
      // Their animals: a dog for anyone, and a horse of your own. Each is with them, or kept at home.
      if (pets) {
        const choose = (label, options, value, onChange) => {
          const select = document.createElement("select");
          select.style.cssText = "font:inherit;padding:6px;border-radius:6px;min-height:36px;min-width:0;";
          select.setAttribute("aria-label", label);
          for (const [option, text] of options) {
            const item = document.createElement("option");
            item.value = option;
            item.textContent = text;
            select.append(item);
          }
          select.value = value;
          select.addEventListener("change", () => {
            handlers.onSetPet(id, ...onChange(select.value));
            void handlers.lookOf(id).then((next) => {
              if (!next || lookCard !== card) return;
              pets = next.pets;
              card.replaceChildren(...draw());
            });
          });
          row(label, select);
        };
        const capital = (text) => text.charAt(0).toUpperCase() + text.slice(1);
        // Its name: said in place of "your dog" wherever it's spoken of.
        const naming = (label, role, pet) => {
          const name = document.createElement("input");
          name.maxLength = 30;
          name.value = pet.name ?? "";
          name.placeholder = "A name (optional)";
          name.style.cssText =
            "font:inherit;padding:6px;border-radius:6px;min-height:36px;min-width:0;box-sizing:border-box;";
          name.setAttribute("aria-label", label);
          name.addEventListener("change", () => {
            handlers.onSetPet(id, role, { ...pet, lore: undefined, name: name.value.trim() || undefined });
            void handlers.lookOf(id).then((next) => {
              if (!next || lookCard !== card) return;
              pets = next.pets;
              card.replaceChildren(...draw());
            });
          });
          row(label, name);
        };
        const where = [
          ["out", pets.mine ? "With you" : "With them"],
          ["home", "At home"],
        ];
        const dog = pets.dog;
        choose(
          "Dog",
          [["", "None"], ...Object.entries(pets.dogs).map(([kind, entry]) => [kind, entry.label])],
          dog?.kind ?? "",
          (kind) => [
            "dog",
            kind ? { kind, coat: pets.dogs[kind].coats[0][0], out: dog?.out !== false, name: dog?.name } : null,
          ],
        );
        if (dog) {
          choose(
            "Dog's coat",
            pets.dogs[dog.kind].coats.map(([coat, word]) => [coat, capital(word)]),
            dog.coat,
            (coat) => ["dog", { kind: dog.kind, coat, out: dog.out !== false, name: dog.name }],
          );
          naming("Dog's name", "dog", dog);
          choose("Dog is", where, dog.out !== false ? "out" : "home", (at) => [
            "dog",
            { kind: dog.kind, coat: dog.coat, out: at === "out", name: dog.name },
          ]);
        }
        if (pets.mine) {
          const horse = pets.horse;
          choose(
            "Horse",
            [["", "None"], ...pets.horses.map(([coat, word]) => [coat, capital(word)])],
            horse?.coat ?? "",
            (coat) => ["horse", coat ? { coat, out: horse?.out !== false, name: horse?.name } : null],
          );
          if (horse) naming("Horse's name", "horse", horse);
          if (horse)
            choose("Horse is", where, horse.out !== false ? "out" : "home", (at) => [
              "horse",
              { coat: horse.coat, out: at === "out", name: horse.name },
            ]);
        }
      }
      const buttons = document.createElement("div");
      buttons.style.cssText = "display:flex;gap:8px;";
      const reset = button("Reset", "Forget these choices: back to the look their name gives", () => {
        picking = null;
        chosen = {};
        handlers.onSetLook(id, null);
        void handlers.lookOf(id).then((next) => {
          if (!next || lookCard !== card) return;
          now = next.now;
          card.replaceChildren(...draw());
        });
      });
      const done = button("Done", "Close", closeLook);
      for (const control of [reset, done]) control.style.cssText += "flex:1;padding:8px 10px;";
      buttons.append(reset, done);
      rows.push(buttons);
      return rows;
    };
    card.append(...draw());
  }

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
  // Who's in town is listed first: sorted each time the panel opens (not while ticking, so rows stay put).
  let peopleOrder = null; // character ids in the order shown
  let lastPeople = null; // the last setCharacters arguments, to redraw sorted
  const peopleButton = button("People", "Choose characters to live in town", () => {
    peopleOrder = null;
    if (lastPeople) hud.setCharacters(...lastPeople);
    togglePanel(peoplePanel);
  });
  peopleButton.style.display = "none";

  // Settings.
  const settingsPanel = document.createElement("div");
  settingsPanel.setAttribute("data-wanderworld-ui", "");
  settingsPanel.style.cssText = PANEL;
  panels.push(settingsPanel);
  const settingsButton = button("Settings", "Resolution, speed, camera, sound and more", () => {
    togglePanel(settingsPanel);
    showSection(shownSection);
  });
  const fields = {};
  // Settings come a section at a time: tabs along the top, and only that section's rows below.
  const sectionTabs = document.createElement("div");
  sectionTabs.style.cssText = "display:flex;gap:4px;flex-wrap:wrap;margin-bottom:4px;";
  const sectionStyle = document.createElement("style");
  sectionStyle.textContent = "[data-wanderworld-settings-hidden]{display:none!important}";
  settingsPanel.append(sectionStyle, sectionTabs);
  const closeSettings = document.createElement("button");
  closeSettings.type = "button";
  closeSettings.textContent = "×";
  closeSettings.title = "Close";
  closeSettings.setAttribute("aria-label", "Close settings");
  closeSettings.style.cssText = `${INK_SMALL}margin-left:auto;padding:0 9px;font-size:16px;`;
  closeSettings.addEventListener("click", () => (settingsPanel.style.display = "none"));
  let shownSection = "";
  const showSection = (name) => {
    shownSection = name;
    let current = "";
    for (const child of settingsPanel.children) {
      if (child === sectionTabs || child === sectionStyle) continue;
      if (child.dataset.settingsHeading) current = child.dataset.settingsHeading;
      // Rows added later (connection lists, the regenerate card) belong to the heading above them. Hidden
      // by an attribute, so each row's own display (and whatever shows or hides it) is left alone.
      child.toggleAttribute("data-wanderworld-settings-hidden", !!child.dataset.settingsHeading || current !== name);
    }
    for (const tab of sectionTabs.children)
      if (tab !== closeSettings) tab.style.opacity = tab.textContent === name ? "1" : "0.6";
  };
  const heading = (text) => {
    const element = document.createElement("div");
    element.textContent = text;
    element.dataset.settingsHeading = text;
    element.style.cssText = "font-weight:700;margin-top:6px;opacity:0.85;";
    settingsPanel.append(element);
    const tab = document.createElement("button");
    tab.type = "button";
    tab.textContent = text;
    tab.style.cssText = INK_BUTTON;
    tab.addEventListener("click", () => showSection(text));
    sectionTabs.append(tab, closeSettings); // the close button stays last
    if (!shownSection) shownSection = text;
  };
  // What each setting does, in a line under it (hidden with Show explanations off).
  const EXPLAIN = {
    resolution: "How sharp the picture is. Auto lowers it when frames drop, to keep things smooth.",
    drawDistance:
      "How far buildings, people, trees and things are drawn; fog hides what's past it. Further looks grand but costs speed.",
    density: "How many trees, rocks and plants grow round the town.",
    shadows: "Soft shadows under people.",
    nature: "Detailed trees and plants from the nature kit, instead of simple shapes.",
    props: "Detailed barrels, crates, benches and stalls, instead of simple shapes.",
    buildings: "Buildings assembled from the village kit, instead of simple boxes.",
    people: "How characters without their own 3D model look: dressed townsfolk, or simple figures.",
    animation: "Recorded motion from the animation library, or the hand-made walk.",
    walkSpeed: "How fast you walk.",
    runSpeed: "How fast you run (hold Shift).",
    lookSpeed: "How fast the camera turns when you drag or use the arrow keys.",
    invertLook: "Dragging up looks down, like a flight stick.",
    restKey:
      "The C key sits you down on the ground, and pressed again lies you down. The chat window's buttons do the same.",
    jumpButton: "On a touch screen, a Jump button above Use.",
    restButton: "On a touch screen, a Sit button above Use; it becomes Lie down once you're sitting on the ground.",
    chatMoves: "Jump and Sit buttons in the chat window. Sit becomes Lie down, then Get up.",
    time: "Let the day pass, or keep it at one time of day.",
    aiMoments:
      "The model narrates what you do and people nearby may answer: one call each time. Off, the world answers with its own written lines. What you type in the chat is always a moment while this is on.",
    aiArrive:
      "A call each time you come somewhere new (not streets, not places told lately). Off by default: it adds up.",
    aiThings: "A call when you choose something on a card: a stall, the fountain, a door, a campfire.",
    aiBoard: "A call when you stop at the noticeboard.",
    aiSeats: "A call when you sit down with someone near.",
    aiJoin: "A call when you join someone in what they're doing.",
    narratorCard:
      "One of your character cards as the narrator. It tells things in its voice, and a scene can start with nobody else there: alone in the woods, with only the narrator.",
    narratorUse: "What the narrator card is used for.",
    narration:
      "A line on coming somewhere new (its lore, when it has some) and now and then about who's near. Written lines, unless Settings → AI lets arrivals call the model.",
    weather: "Rain, snow or mist, changing every few minutes or always one. Off keeps the sky clear.",
    timeSpeed: "How fast the day passes while it's moving.",
    interiors: "Walk into furnished rooms (unfinished). Off, a door shows who's inside and offers a scene.",
    approach: "How often townsfolk come up to greet you, or confront you. 0 means never.",
    approachMax: "The most people coming up to you at the same time.",
    combat: "Where people may confront (and later fight) you: safe places are towns, inns and cottages.",
    sound: "Footsteps, doors and the world's sounds.",
    volume: "How loud those sounds are.",
    names:
      'Names over people\'s heads, tinted by how they see you. With "Only people I know", someone you haven\'t met is a Stranger, here and in what\'s written, until you learn their name (it comes up, or you tick it in the "i" of a conversation).',
    hint: "The line of controls at the bottom of the screen.",
    stats: "Frames per second and other numbers at the top.",
    explanations: "These lines under settings, and the ones in the Journal and on New world.",
    aiTalk:
      "People answer in their own words, written by your model from their card, your persona and the world. Off, they use set lines.",
    textConnection: "The model that writes conversations. Engine default uses your Engine's agent or main connection.",
    sceneConnection:
      "The model that plans and plays scenes you start in the world. Same as conversations unless chosen.",
    imageConnection: "The image generation connection for pictures of places and moments.",
    imageStyle:
      "The look of pictures, from the Engine's style profiles. Engine default uses the one you set in the Engine.",
    talkStyle:
      "How people talk to you, on top of who they are. Someone with a voice of their own (Journal, or a lorebook's ww:voice:gruff) keeps it.",
    replyLength: "How long people's replies are.",
    aiTemperature: "Higher is more surprising, lower more predictable.",
    scenePov:
      "How scenes you start in the world are written. Each world's own scene instructions are in Journal → World.",
    sceneTense: "The tense scenes are written in.",
    scenePreset:
      "The Engine prompt preset a scene starts with, picked for you each time. None: the scene's own instructions alone.",
  };
  const row = (label, control, name = null) => {
    const element = document.createElement("label");
    element.style.cssText = "display:flex;align-items:center;justify-content:space-between;gap:10px;";
    const text = document.createElement("span");
    text.textContent = label;
    element.append(text, control);
    settingsPanel.append(element);
    if (name && EXPLAIN[name]) {
      const explain = document.createElement("div");
      explain.setAttribute("data-wanderworld-explain", "");
      explain.style.cssText = "font-size:11px;opacity:0.7;margin:-4px 0 2px;line-height:1.3;";
      explain.textContent = EXPLAIN[name];
      settingsPanel.append(explain);
    }
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
    row(label, select, name);
  };
  const toggle = (name, label) => {
    const box = document.createElement("input");
    box.type = "checkbox";
    box.addEventListener("change", () => handlers.onSetting(name, box.checked));
    fields[name] = { set: (value) => (box.checked = value) };
    row(label, box, name);
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
    row(label, wrap, name);
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
  toggle("restKey", "C sits and lies down");
  toggle("jumpButton", "Jump button (touch screens)");
  toggle("restButton", "Sit and lie down button (touch screens)");
  toggle("chatMoves", "Jump and Sit/lie down buttons in the chat window");
  heading("World");
  settingsPanel.append(peopleButton); // who lives in this world
  choice("time", "Time", TIME_LABELS);
  choice("narration", "The world's voice", { off: "Off", lines: "On" });
  choice("weather", "Weather", {
    off: "Off (always clear)",
    changing: "Changing",
    rain: "Rain",
    snow: "Snow",
    mist: "Mist",
  });
  choice("timeSpeed", "Time speed", {
    0.25: "¼× (a day in 80 min)",
    0.5: "½× (a day in 40 min)",
    1: "1× (a day in 20 min)",
    2: "2× (a day in 10 min)",
    4: "4× (a day in 5 min)",
    8: "8× (a day in 2½ min)",
  });
  toggle("interiors", "Walk into buildings (unfinished)");
  slider("approach", "People coming up to you", 0.1, (value) => (value === 0 ? "never" : times(value)));
  choice("approachMax", "At most at once", { 1: "1", 2: "2", 3: "3", 5: "5" });
  choice("combat", "Confrontations and combat", {
    anywhere: "Anywhere",
    outsideTowns: "Outside towns",
    outsideSafe: "Outside safe places",
    off: "Off",
  });
  // AI: the server part's connections and styles. The connection lists come from the Engine when the
  // panel opens (they're the user's own, so they can change while playing).
  heading("AI");
  const aiStatus = document.createElement("div");
  aiStatus.style.cssText = "font-size:12px;line-height:1.35;opacity:0.85;";
  aiStatus.textContent = "Checking for Wanderworld's server part…";
  const aiDebug = document.createElement("div");
  aiDebug.style.cssText = "font-size:12px;line-height:1.35;opacity:0.85;";
  aiDebug.textContent =
    "To see what is sent: turn on the Engine's Debug Mode (Settings → Advanced). Every request Wanderworld makes to a model, with its answer, and every picture request (connection, model, size, prompt) is then written to the Engine's console.";
  settingsPanel.append(aiStatus, aiDebug);
  const connectionLists = [];
  const connectionChoice = (name, label, kind, empty) => {
    const select = document.createElement("select");
    select.style.cssText = "font:13px system-ui,sans-serif;border-radius:6px;border:0;padding:2px 4px;max-width:170px;";
    let current = "";
    const fill = (list) => {
      const options = [
        ["", empty],
        ...list.map((entry) => [entry.id, entry.model ? `${entry.name} (${entry.model})` : entry.name]),
      ];
      if (current && !list.some((entry) => entry.id === current)) options.push([current, "(not found)"]);
      select.replaceChildren(
        ...options.map(([value, text]) => {
          const option = document.createElement("option");
          option.value = value;
          option.textContent = text;
          return option;
        }),
      );
      select.value = current;
    };
    fill([]);
    select.addEventListener("change", () => {
      current = select.value;
      handlers.onSetting(name, current);
    });
    fields[name] = {
      set: (value) => {
        current = value ?? "";
        if (![...select.options].some((option) => option.value === current)) fill([]);
        select.value = current;
      },
    };
    connectionLists.push({ kind, fill });
    row(label, select, name);
  };
  toggle("aiTalk", "AI conversations");
  toggle("aiMoments", "AI moments");
  toggle("aiArrive", "…when you arrive somewhere");
  toggle("aiThings", "…when you use things");
  toggle("aiBoard", "…when you read the noticeboard");
  toggle("aiSeats", "…when you sit down");
  toggle("aiJoin", "…when you join someone");
  connectionChoice("textConnection", "Conversations use", "text", "Engine default");
  connectionChoice("sceneConnection", "Scenes use", "text", "Same as conversations");
  choice("talkStyle", "How people talk", {
    natural: "Naturally",
    cosy: "Cosy",
    dramatic: "Dramatic",
    witty: "Witty",
    terse: "Few words",
    gruff: "Gruff",
    formal: "Formal",
    cheerful: "Cheerful",
    sly: "Sly",
  });
  choice("replyLength", "Reply length", { short: "Short", medium: "Medium", long: "Long" });
  choice("scenePov", "Scene point of view", {
    second_person: "Second person (you)",
    third_person: "Third person",
    first_person: "First person",
  });
  choice("sceneTense", "Scene tense", { present: "Present", past: "Past" });
  connectionChoice("scenePreset", "Scene prompt preset", "presets", "None");
  connectionChoice("narratorCard", "Narrator card", "characters", "None");
  choice("narratorUse", "The narrator tells", {
    scenes: "Scenes",
    moments: "Moments and narration",
    both: "Both",
  });
  slider("aiTemperature", "Creativity", 0.1, (value) => value.toFixed(1));
  connectionChoice("imageConnection", "Pictures use", "image", "Engine default");
  choice("imageStyle", "Picture style", {
    "": "Engine default",
    off: "No style",
    auto: "Auto",
    anime: "Anime",
    danbooru: "Danbooru / Illustrious",
    realistic: "Realistic SDXL",
    photorealistic: "Photorealistic",
    cinematic: "Cinematic",
    "digital-painting": "Digital painting",
    painterly: "Painterly fantasy",
    "z-image-turbo": "Z-Image Turbo",
  });
  /** Reads the server part's status and the user's connections into the AI section. */
  const loadAi = async () => {
    const status = await handlers.onAiStatus?.();
    if (!status) {
      aiStatus.textContent =
        "Wanderworld's server part isn't running yet, so people use set lines. Restart the Engine after installing or updating Wanderworld.";
      return;
    }
    aiStatus.textContent = status.scenes
      ? "Server part running: conversations, pictures and scenes use your Engine's connections."
      : "Server part running: conversations and pictures. This Engine can't start scenes from packages yet.";
    try {
      const lists = await handlers.onConnections();
      for (const { kind, fill } of connectionLists) fill(lists?.[kind] ?? []);
    } catch (error) {
      aiStatus.textContent = `Couldn't read your connections: ${error?.message ?? error}`;
    }
  };
  settingsButton.addEventListener("click", () => {
    if (settingsPanel.style.display !== "none") void loadAi();
  });

  // Regenerate: the world on screen built afresh from its setup (red, and asked twice: it's for good).
  const regenerate = document.createElement("div");
  regenerate.style.cssText = "display:flex;flex-direction:column;gap:6px;margin:4px 0;";
  const DANGER = `${INK_BUTTON}background:#8e2a20;color:#fff4e8;border-color:#5e1a12;`;
  const drawRegenerate = (asking) => {
    if (!asking) {
      const open = button("Regenerate this world…", "Build this world again with this version's land", () =>
        drawRegenerate(true),
      );
      open.style.cssText = DANGER;
      regenerate.replaceChildren(open);
      return;
    }
    const warning = document.createElement("div");
    warning.style.cssText = "font-size:12px;line-height:1.4;";
    warning.textContent =
      "This builds this world again from its setup, with everything this version adds. Your people, relationships, party, notes and lore stay; you start again at the square. It can't be undone.";
    const label = document.createElement("label");
    label.style.cssText = "display:flex;gap:6px;align-items:center;font-size:12px;cursor:pointer;";
    const reshuffle = document.createElement("input");
    reshuffle.type = "checkbox";
    label.append(
      reshuffle,
      document.createTextNode(
        "A new town layout too (names, lore and groups move to the same kind of place: the tavern stays the tavern)",
      ),
    );
    // Its size can change too (keeping it, or Small … Massive).
    const sizeRow = document.createElement("label");
    sizeRow.style.cssText = "display:flex;gap:6px;align-items:center;font-size:12px;";
    const size = document.createElement("select");
    size.style.cssText = "font:12px system-ui,sans-serif;border-radius:6px;border:0;padding:2px 4px;";
    for (const [value, text] of [
      ["keep", "Keep its size"],
      ["small", "Small"],
      ["normal", "Normal"],
      ["large", "Large"],
      ["huge", "Huge"],
      ["massive", "Massive"],
    ]) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = text;
      size.append(option);
    }
    sizeRow.append(document.createTextNode("World size"), size);
    // The map of what it will be: its own layout, or a new one (Reroll picks another).
    let seed = randomSeed();
    const map = mapCanvas(320, 240);
    const redraw = () =>
      handlers.onRegeneratePreview?.(map, {
        reshuffle: reshuffle.checked,
        size: size.value === "keep" ? null : size.value,
        seed,
      });
    reshuffle.addEventListener("change", redraw);
    size.addEventListener("change", redraw);
    const reroll = button("Reroll", "Another new layout", () => {
      seed = randomSeed();
      reshuffle.checked = true;
      redraw();
    });
    reroll.style.cssText = INK_BUTTON;
    const yes = button("Regenerate", "Rebuild this world now", () => {
      drawRegenerate(false);
      handlers.onRegenerate(reshuffle.checked, size.value === "keep" ? null : size.value, seed);
    });
    yes.style.cssText = DANGER;
    const no = button("Cancel", "Keep the world as it is", () => drawRegenerate(false));
    no.style.cssText = INK_BUTTON;
    const buttons = document.createElement("div");
    buttons.style.cssText = "display:flex;gap:6px;";
    buttons.append(yes, no);
    regenerate.replaceChildren(warning, label, sizeRow, map, reroll, buttons);
    redraw();
  };
  drawRegenerate(false);
  settingsPanel.append(regenerate);
  toggle("sound", "Sound");
  slider("volume", "Volume", 0.05, (value) => `${Math.round(value * 100)}%`);
  // The AI assistant: a chat about this world, which can change its lore and people (assistant.js).
  let assistant = null;
  heading("AI assistant");
  {
    const about = document.createElement("div");
    about.style.cssText = `font-size:12px;line-height:1.4;color:${INK_SOFT};`;
    about.textContent =
      "Ask about the world you're in, or ask for a change to it. You see every change first, can rewrite it or leave it out, and nothing happens until you press Confirm; Undo takes it back. It never touches your cards, personas or lorebooks in the Engine. Not sure what to ask? The buttons under the chat are ready-made requests, and Help lists everything it can do.";
    settingsPanel.append(
      about,
      (assistant = createAssistant({
        onAsk: (history, options) => handlers.onAssistant(history, options),
        onChat: (turns) => handlers.onAssistantChat?.(turns),
        onLorebooks: () => handlers.onAssistantBooks?.() ?? Promise.resolve([]),
      })),
    );
  }
  // Help: the instructions, a fold for each part (help.js).
  heading("Help");
  for (const part of HELP) {
    const fold = document.createElement("details");
    fold.style.cssText = "border-top:1px solid rgba(107,74,43,0.3);padding:4px 0;";
    const summary = document.createElement("summary");
    summary.style.cssText = "cursor:pointer;font-weight:600;";
    summary.textContent = part.title;
    fold.append(summary);
    const say = (words, css = "") => {
      const node = document.createElement("div");
      node.style.cssText = `font-size:12px;line-height:1.4;margin-top:4px;${css}`;
      node.textContent = words;
      fold.append(node);
      return node;
    };
    for (const words of part.lines ?? []) say(words);
    if (part.keywords) {
      say(
        'Wanderworld acts only on lorebook keys written ww:<what>:<value>. "ww" marks it as Wanderworld\'s, <what> says what it\'s for, <value> is what\'s given. Spaces round the colons and capitals don\'t matter. A key with no <what> (ww:tavern1, ww:Mira, ww:world) names what the entry is about. "you", "me" and "player" all mean you; "them", "char" and "character" all mean the person the entry is about. Journal → World → Check ww: keywords lists any it didn\'t understand.',
      );
      for (const group of keywordGroups) {
        say(group, "font-weight:700;margin-top:8px;");
        for (const entry of KEYWORD_GUIDE.filter((item) => item.group === group)) {
          say(entry.write, "font-family:ui-monospace,Consolas,monospace;font-size:11px;margin-top:6px;");
          say(`On ${entry.on}. ${entry.does}`, `color:${INK_SOFT};margin-top:1px;`);
        }
      }
    }
    if (part.prompt) {
      const box = document.createElement("textarea");
      box.readOnly = true;
      box.value = part.prompt;
      box.rows = 8;
      box.setAttribute("aria-label", part.title);
      box.style.cssText = `${INK_INPUT}width:100%;box-sizing:border-box;font:11px ui-monospace,Consolas,monospace;margin-top:4px;resize:vertical;`;
      const copy = button("Copy the prompt", "Copy it, to paste to your assistant", async () => {
        try {
          await navigator.clipboard.writeText(part.prompt);
          copy.textContent = "Copied";
        } catch {
          box.select(); // no clipboard here: it's selected, so Ctrl+C takes it
          copy.textContent = "Selected: press Ctrl+C";
        }
        setTimeout(() => (copy.textContent = "Copy the prompt"), 2500);
      });
      copy.style.cssText = `${INK_SMALL}margin-top:4px;`;
      fold.append(box, copy);
    }
    settingsPanel.append(fold);
  }
  // Credits and thanks.
  heading("Credits");
  for (const part of CREDITS) {
    const title = document.createElement("div");
    title.style.cssText = `font:700 14px ${SERIF};margin-top:8px;`;
    title.textContent = part.title;
    settingsPanel.append(title);
    for (const words of part.lines) {
      const line = document.createElement("div");
      line.style.cssText = "font-size:12px;line-height:1.45;margin-top:4px;";
      line.textContent = words;
      settingsPanel.append(line);
    }
  }
  heading("Display");
  choice("names", "Names over people", {
    all: "Show all names",
    known: "Only people I know",
    none: "Hide all names",
  });
  toggle("hint", "Controls hint");
  toggle("stats", "Frame rate");
  toggle("explanations", "Show explanations");

  // The Journal: where everyone is, places and their lore.
  const journal = createJournal(PANEL, {
    onRename: (id, name) => handlers.onRenameZone(id, name),
    onLore: (id) => handlers.onZoneLore(id),
    onGroupCreate: (name) => handlers.onGroupCreate(name),
    onGroupRename: (id, name) => handlers.onGroupRename(id, name),
    onGroupDelete: (id) => handlers.onGroupDelete(id),
    onGroupMember: (id, zoneId, on) => handlers.onGroupMember(id, zoneId, on),
    onGroupParent: (id, parent) => handlers.onGroupParent(id, parent),
    onSetSetup: (fields) => handlers.onSetSetup(fields),
    onEditPerson: (id) => handlers.onEditPerson(id),
    onCheckKeywords: () => handlers.onCheckKeywords(),
    onEditBook: (id, content) => handlers.onEditBook(id, content),
    onPartyGather: () => handlers.onPartyGather(),
    onPartyDisband: () => handlers.onPartyDisband(),
    onLinkLore: () => handlers.onLinkLore(),
    onWantLorebooks: () => handlers.onWantLorebooks(),
    onPartyWait: (id, wait) => handlers.onPartyWait(id, wait),
    onPartyLeave: (id) => handlers.onPartyLeave(id),
    onPetOut: (role, out) => handlers.onPetOut?.(role, out),
    onPicture: () => handlers.onPicture?.(),
    onMap: (canvas, view) => handlers.onMap?.(canvas, view),
    onWaypoint: (at) => handlers.onWaypoint?.(at),
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
  const illustrateButton = button("Illustrate", "Paint the current moment, and see the world's pictures", () =>
    illustrate.toggle(),
  );
  const chatButton = button("Chat", "What's happening around you, and saying something out loud", () => {
    chatFloat.setOpen(!chatFloat.isOpen());
    chatButton.textContent = "Chat"; // read
    if (chatFloat.isOpen()) narration.scrollTop = narration.scrollHeight;
  });
  const fresh = button("Main menu", "Save and go back to the main menu", handlers.onMenu);
  const fullscreen = button("Fullscreen", "Fill the screen with the world", handlers.onToggleFullscreen);
  fullscreen.style.display = "none";
  // The Menu: what's used now and then (who you play, Settings, full screen, the way out), out of the bar.
  const menuPanel = document.createElement("div");
  menuPanel.setAttribute("data-wanderworld-ui", "");
  menuPanel.style.cssText = PANEL;
  personaLabel.style.cssText = "font-size:13px;display:none;align-items:center;gap:6px;flex-wrap:wrap;";
  for (const item of [settingsButton, fullscreen, fresh]) item.style.width = "100%";
  menuPanel.append(personaLabel, settingsButton, fullscreen, fresh);
  panels.push(menuPanel);
  const gameMenuButton = button("Menu", "Who you play, Settings, full screen and the main menu", () =>
    togglePanel(menuPanel),
  );
  controls.append(journalButton, loreButton, illustrateButton, chatButton, gameMenuButton);

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
  const prompt = document.createElement("button");
  prompt.type = "button";
  prompt.setAttribute("data-wanderworld-ui", "");
  prompt.style.cssText = `${CHIP}position:absolute;left:0;top:0;transform:translate(-50%,-100%);font:600 13px system-ui,sans-serif;display:none;white-space:nowrap;border:0;cursor:pointer;pointer-events:auto;min-height:32px;`;
  prompt.addEventListener("click", () => handlers.onUse());
  const use = button("Use", "Use what's in front of you", () => handlers.onUse());
  // Bottom right, under the thumb that isn't on the stick.
  use.style.cssText += "position:absolute;bottom:32px;right:20px;padding:16px 20px;font-size:15px;display:none;";
  // On touch screens, above it: Jump, and Sit (which becomes Lie down once you're sitting on the ground).
  let sleepCard = null; // the tent's card, while it's open (openSleep)
  const wanted = { jump: true, rest: true, chat: true }; // Settings → Moving: the thumb's two buttons, the chat window's
  const jump = button("Jump", "Jump", () => handlers.onJump());
  const rest = button("Sit", "Sit down on the ground; again to lie down", () => handlers.onRest());
  const THUMB = `position:absolute;right:20px;padding:12px 16px;font-size:14px;display:${touch ? "" : "none"};`;
  jump.style.cssText += `${THUMB}bottom:96px;`;
  rest.style.cssText += `${THUMB}bottom:148px;`;

  const hint = document.createElement("div");
  hint.textContent = touch
    ? "Stick to walk · drag to look · pinch to zoom · tap someone or something to use it"
    : "WASD walk · Shift run · Space jump · C sit · drag or arrows to look · scroll to zoom · E or click to use · Esc to leave";
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

  // The chat window: what the narrator says and what people answer in moments, the box to say (or do)
  // something, and the commands under it. It floats: drag it by its title, resize it from its corner.
  const chat = floatingFrame("Around you", () => chatFloat.setOpen(false));
  layer.append(chat.frame);
  const chatFloat = makeFloating(layer, chat.frame, chat.bar, "wanderworld.chat", {
    w: 380,
    h: 260,
    right: undefined,
    bottom: 70,
    x: 12,
    open: true,
  });
  const narration = document.createElement("div");
  narration.style.cssText = "flex:1;overflow-y:auto;padding:6px 10px;font:13px/1.4 system-ui,sans-serif;";
  const speakBar = document.createElement("form");
  speakBar.style.cssText = "display:flex;gap:6px;padding:6px 8px 2px;";
  const speakInput = document.createElement("input");
  speakInput.maxLength = 600;
  speakInput.style.cssText = `${INK_INPUT}width:100%;box-sizing:border-box;font:13px system-ui,sans-serif;`;
  speakInput.setAttribute("aria-label", "Say something, or /a (or /action) to do something");
  // Its hint, drawn over the empty box (a placeholder can't dim part of itself): "/a" is what to type,
  // and the rest of the word, dimmer, says what it's short for and that the whole word works too.
  const speakBox = document.createElement("div");
  speakBox.style.cssText = "position:relative;flex:1;min-width:0;";
  const speakHint = document.createElement("div");
  speakHint.setAttribute("aria-hidden", "true");
  speakHint.style.cssText =
    "position:absolute;inset:0;display:flex;align-items:center;padding:0 9px;pointer-events:none;" +
    "font:13px system-ui,sans-serif;opacity:0.6;white-space:nowrap;overflow:hidden;";
  const hintRest = document.createElement("span");
  hintRest.style.opacity = "0.55";
  hintRest.textContent = "(ction)";
  speakHint.append("Say something, or /a", hintRest, "\u00a0to do something");
  speakBox.append(speakInput, speakHint);
  const showHint = () => (speakHint.style.display = speakInput.value ? "none" : "flex");
  speakInput.addEventListener("input", showHint);
  const speakSend = document.createElement("button");
  speakSend.type = "submit";
  speakSend.textContent = "Say";
  speakSend.style.cssText = INK_BUTTON;
  const sceneHere = button("Scene", "Start a full scene right here, opening with what you've written", () => {
    const typed = speakInput.value.trim();
    speakInput.value = "";
    showHint();
    handlers.onSceneHere?.(typed);
  });
  sceneHere.style.cssText = INK_SMALL;
  speakBar.append(speakBox, speakSend, sceneHere);
  speakInput.addEventListener("keydown", (event) => {
    if (event.key === "Escape") speakInput.blur();
  });
  speakBar.addEventListener("submit", (event) => {
    event.preventDefault();
    const typed = speakInput.value.trim();
    if (!typed) return;
    speakInput.value = "";
    showHint();
    handlers.onSpeak?.(typed);
  });
  // The commands, folded away under the box (the list grows as commands are added).
  const commands = document.createElement("details");
  commands.style.cssText = `padding:0 10px 6px;font-size:11px;color:${INK_SOFT};`;
  const commandsTitle = document.createElement("summary");
  commandsTitle.style.cssText = "cursor:pointer;";
  commandsTitle.textContent = "Commands";
  const commandList = document.createElement("div");
  commandList.style.cssText =
    "display:grid;grid-template-columns:auto 1fr;gap:2px 10px;margin-top:3px;line-height:1.35;";
  for (const [typed, does] of SPEECH_HELP) {
    const code = document.createElement("span");
    code.style.cssText = "font-family:ui-monospace,monospace;white-space:nowrap;";
    code.textContent = typed;
    const words = document.createElement("span");
    words.textContent = does;
    commandList.append(code, words);
  }
  commands.append(commandsTitle, commandList);
  // Who's close by and what they look like, folded away like the commands.
  const peopleHere = document.createElement("details");
  peopleHere.style.cssText = `padding:0 10px 6px;font-size:11px;color:${INK_SOFT};`;
  const peopleTitle = document.createElement("summary");
  peopleTitle.style.cssText = "cursor:pointer;";
  peopleTitle.textContent = "People here";
  const peopleLooks = document.createElement("div");
  peopleLooks.style.cssText =
    "display:flex;flex-direction:column;gap:4px;padding-top:3px;max-height:120px;overflow-y:auto;";
  peopleHere.append(peopleTitle, peopleLooks);
  // Jump, and Sit (then Lie down, then Get up): what Space and C do, for a click or a tap.
  const moves = document.createElement("div");
  moves.style.cssText = "display:flex;gap:6px;padding:0 10px 6px;";
  const chatJump = button("Jump", "Jump (Space)", () => handlers.onJump());
  const chatRest = button("Sit", "Sit down on the ground, then lie down, then get up (C)", () =>
    chatRest.textContent.startsWith("Get ") ? handlers.onUse() : handlers.onRest(),
  );
  for (const control of [chatJump, chatRest]) control.style.cssText += "padding:4px 10px;font-size:12px;";
  moves.append(chatJump, chatRest);
  const petMoves = document.createElement("div");
  petMoves.style.cssText = "display:none;gap:6px;padding:0 10px 6px;flex-wrap:wrap;";
  const sendHome = (role) => {
    let plain = `Send ${role} home`;
    let sure = null; // the timer while it's asking "Sure?"
    const control = button(plain, `Send your ${role} home: it goes back to your door and waits there`, () => {
      if (sure === null) {
        control.textContent = `Sure? Send ${role} home`;
        sure = setTimeout(reset, 4000);
        return;
      }
      reset();
      handlers.onPetOut?.(role, false);
    });
    const reset = () => {
      clearTimeout(sure);
      sure = null;
      control.textContent = plain;
    };
    control.style.cssText += "padding:4px 10px;font-size:12px;display:none;";
    petMoves.append(control);
    /** Called by its name once it has one ("Send Shadowmere home"). */
    control.rename = (name) => {
      const next = `Send ${name || role} home`;
      if (next === plain) return;
      plain = next;
      reset();
    };
    return control;
  };
  const petButtons = { dog: sendHome("dog"), horse: sendHome("horse") };
  chat.frame.append(narration, speakBar, moves, petMoves, commands, peopleHere);
  let narrationTimer = null;
  // Narration with the chat window closed: a caption over the world for a few seconds, then gone (it's
  // in the window when it's opened).
  const caption = document.createElement("div");
  caption.setAttribute("data-wanderworld-ui", "");
  caption.style.cssText =
    `${CHIP}position:absolute;left:50%;bottom:92px;transform:translateX(-50%);max-width:min(560px,calc(100% - 32px));` +
    "padding:8px 14px;font:italic 14px/1.4 Georgia,serif;text-align:center;pointer-events:none;opacity:0;transition:opacity 400ms;";
  layer.append(caption);
  let captionTimer = null;
  const personEditor = createPersonEditor(layer, {
    onSave: (id, changes) => handlers.onSavePerson(id, changes),
    onPlan: async (id, request) => ({
      words: await handlers.onPlanSchedule(id, request),
      day: handlers.onPersonDay(id),
    }),
  });
  // Every button shows it was clicked: it dips while pressed, and stays lit for a moment after. A button
  // that's redrawn by its own click (the Journal's lists) passes the light to the one that took its place.
  const pressStyle = document.createElement("style");
  pressStyle.textContent =
    "[data-wanderworld-layer] button{transition:transform 80ms,filter 80ms,box-shadow 160ms}" +
    "[data-wanderworld-layer] button:active{transform:translateY(1px) scale(0.97);filter:brightness(0.85)}" +
    "[data-wanderworld-layer] button[data-wanderworld-pressed]{filter:brightness(1.18);box-shadow:0 0 0 2px rgba(255,236,170,0.95),0 0 10px rgba(255,220,120,0.8)}";
  layer.setAttribute("data-wanderworld-layer", "");
  layer.append(pressStyle);
  layer.addEventListener(
    "click",
    (event) => {
      const pressed = event.target.closest?.("button");
      if (!pressed) return;
      const words = pressed.textContent;
      const light = (node) => {
        node.setAttribute("data-wanderworld-pressed", "");
        setTimeout(() => node.removeAttribute("data-wanderworld-pressed"), 420);
      };
      light(pressed);
      setTimeout(() => {
        if (pressed.isConnected) return;
        const again = [...layer.querySelectorAll("button")].find(
          (node) => node.textContent === words && node.offsetParent,
        );
        if (again) light(again);
      }, 60);
    },
    true,
  );
  const illustrate = createIllustrateWindow(layer, {
    onIllustrate: (options) => handlers.onIllustrate(options),
    onConnections: () => handlers.onConnections(),
    onGallery: () => handlers.onGallery(),
    onPicture: (id) => handlers.onPictureOf(id),
    onDelete: (id) => handlers.onDeletePicture(id),
  });

  const explainRule = document.createElement("style");
  explainRule.textContent = ".wanderworld-no-explain [data-wanderworld-explain]{display:none!important}";
  layer.append(explainRule);
  layer.append(
    board,
    top,
    peoplePanel,
    journal.panel,
    lorePanel,
    settingsPanel,
    menuPanel,
    notice,
    scene,
    prompt,
    use,
    jump,
    rest,
    hint,
    zoneTitle,
    status,
    fade,
    loading,
  );
  root.append(layer);

  // Someone comes at the player: there's no combat yet, so the card says so and offers what there is.
  const confront = document.createElement("div");
  confront.setAttribute("data-wanderworld-ui", "");
  confront.style.cssText =
    `${PARCHMENT}position:absolute;left:50%;top:22%;transform:translateX(-50%);display:none;flex-direction:column;gap:8px;` +
    "max-width:min(420px,calc(100% - 24px));padding:12px 14px;border-radius:10px;pointer-events:auto;font-size:13px;line-height:1.4;";
  layer.append(confront);

  const hud = {
    /**
     * The card for someone coming at the player: `info` is { name, attacks }, `actions` { onTalk, onSay,
     * onScene, onStop (no more aggressive approaches) }; null takes it away.
     */
    setConfront(info, actions = {}) {
      confront.style.display = info ? "flex" : "none";
      if (!info) return;
      const title = document.createElement("div");
      title.style.cssText = `font:700 15px ${SERIF};`;
      title.textContent = info.attacks
        ? `${info.name} attacks you!`
        : `${info.name} comes at you, looking for trouble.`;
      const words = document.createElement("div");
      words.textContent =
        "There's no fighting in Wanderworld yet, so nothing happens by itself. You can talk to them, say or do something about it in the chat (a moment), or play it out as a scene.";
      const row = document.createElement("div");
      row.style.cssText = "display:flex;gap:6px;flex-wrap:wrap;";
      const act = (label, run, small = false) => {
        const node = button(label, label, () => {
          confront.style.display = "none";
          run?.();
        });
        node.style.cssText = small ? INK_SMALL : INK_BUTTON;
        return node;
      };
      row.append(
        act("Talk to them", actions.onTalk),
        act("Say something", actions.onSay),
        act("Play it as a scene", actions.onScene),
      );
      const foot = document.createElement("div");
      foot.style.cssText = "display:flex;gap:6px;flex-wrap:wrap;align-items:center;";
      foot.append(act("Stop aggressive approaches", actions.onStop, true), act("Close", null, true));
      const hintLine = document.createElement("div");
      hintLine.style.cssText = `font-size:12px;color:${INK_SOFT};`;
      hintLine.textContent =
        '"Stop aggressive approaches" turns them off in Menu → Settings → World; you can turn them back on there.';
      confront.replaceChildren(title, words, row, foot, hintLine);
    },
    /** Opens the chat window with the cursor in its box. */
    focusChat() {
      if (!chatFloat.isOpen()) chatFloat.setOpen(true);
      chatButton.textContent = "Chat";
      speakInput.focus();
    },
    /** Who's close by, for the chat window's "People here": [{ name, looks }]. */
    setPeopleHere(list) {
      peopleTitle.textContent = list.length ? `People here (${list.length})` : "People here";
      peopleLooks.replaceChildren(
        ...list.map((person) => {
          const line = document.createElement("div");
          const name = document.createElement("b");
          name.textContent = `${person.name}  `;
          line.append(name, document.createTextNode(person.looks || "…"));
          return line;
        }),
      );
    },
    /** Opens the person editor (person.js) for `person`. */
    editPerson: (person) => personEditor.open(person),
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
      wanted.jump = settings.jumpButton !== false;
      wanted.rest = settings.restButton !== false;
      wanted.chat = settings.chatMoves !== false;
      hint.style.display = settings.hint ? "" : "none";
      stats.style.display = settings.stats ? "" : "none";
      // Explanations anywhere in Wanderworld's screens (settings, Journal, New world) show or hide together.
      layer.classList.toggle("wanderworld-no-explain", !settings.explanations);
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
      lastPeople = [characters, chosen, chosenBodies];
      bodies = chosenBodies;
      peopleButton.style.display = characters.length ? "" : "none";
      peopleButton.textContent = chosen.size ? `People (${chosen.size})` : "People";
      // Living in town first, then everyone else, each in the Engine's order; kept while the panel is open.
      const ids = characters.map((character) => character.id);
      if (!peopleOrder || peopleOrder.length !== ids.length || ids.some((id) => !peopleOrder.includes(id))) {
        peopleOrder = [...ids.filter((id) => chosen.has(id)), ...ids.filter((id) => !chosen.has(id))];
      }
      const byId = new Map(characters.map((character) => [character.id, character]));
      const sorted = peopleOrder.map((id) => byId.get(id));
      const firstOut = sorted.findIndex((character) => !chosen.has(character.id));
      const heading = (text) => {
        const element = document.createElement("div");
        element.style.cssText =
          "font-size:11px;font-weight:700;opacity:0.65;margin-top:4px;text-transform:uppercase;letter-spacing:0.04em;";
        element.textContent = text;
        return element;
      };
      const rows = sorted.map((character) => {
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
        // Their look can be chosen once they're in town (a look is kept with this world's people).
        const look = button("Look", `Choose ${character.name}'s avatar and how they look`, () =>
          openLook(character.id),
        );
        look.style.cssText += "padding:2px 8px;font-size:12px;";
        look.style.display = chosen.has(character.id) ? "" : "none";
        entry.append(box, name, body, look);
        return entry;
      });
      const inTown = sorted.filter((character) => chosen.has(character.id)).length;
      // Headings where the sorted groups start (ticking more while open adds below without reordering).
      const split = firstOut < 0 ? rows.length : firstOut;
      peopleList.replaceChildren(
        ...(split > 0 ? [heading(`Living in town (${inTown})`)] : []),
        ...rows.slice(0, split),
        ...(split < rows.length ? [heading("Not in town")] : []),
        ...rows.slice(split),
      );
    },
    /** The use prompt: `label` ("Sit", "Talk to Mira") at screen point (x, y), or null to hide it. */
    setPrompt(label, x, y) {
      const show = !!label;
      // On a touch screen the thumb's Use button does it too; the prompt over the thing can always be tapped.
      use.style.display = show && touch ? "" : "none";
      prompt.style.display = show && Number.isFinite(x) ? "" : "none";
      if (!show) return;
      use.textContent = label;
      prompt.textContent = touch ? label : `[E] ${label}`;
      prompt.style.padding = touch ? "8px 14px" : "";
      prompt.style.left = `${x}px`;
      prompt.style.top = `${y}px`;
    },
    /**
     * The Jump and Sit buttons (by the thumb on a touch screen, and in the chat window): `resting` is ""
     * (walking), "ground", "lie", "seat" (on a bench) or "ride" (on a horse: Jump only); hidden when
     * `shown` is false.
     */
    setThumbs(resting, shown) {
      const show = (want) => (shown && touch && want ? "" : "none");
      const riding = resting === "ride";
      jump.style.display = resting && !riding ? "none" : show(wanted.jump);
      rest.style.display = resting === "lie" || resting === "seat" || riding ? "none" : show(wanted.rest);
      rest.textContent = resting === "ground" ? "Lie down" : "Sit";
      // The chat window's: Sit, Lie down, Get up (also up from a bench or a bed).
      const label = resting === "ground" ? "Lie down" : riding ? "Get down" : resting ? "Get up" : "Sit";
      if (chatRest.textContent !== label) chatRest.textContent = label;
      moves.style.display = shown && wanted.chat ? "flex" : "none";
      chatJump.disabled = !!resting && !riding;
    },
    /** Which of your animals are with you (and so can be sent home from the chat window): { dog, horse }. */
    setPets(withYou) {
      let any = false;
      for (const [role, control] of Object.entries(petButtons)) {
        control.rename(withYou.names?.[role] ?? "");
        const show = withYou[role] ? "" : "none";
        if (control.style.display !== show) control.style.display = show;
        any ||= !!withYou[role];
      }
      const show = any ? "flex" : "none";
      if (petMoves.style.display !== show) petMoves.style.display = show;
    },
    /**
     * The tent's card: how long to sleep, then Sleep or Not now. `onSleep(hours)` is given the choice
     * (a number of hours, or "morning"). Closes itself either way; `closeSleep()` closes it from outside.
     */
    openSleep(onSleep) {
      hud.closeSleep();
      const card = document.createElement("div");
      card.setAttribute("data-wanderworld-ui", "");
      card.style.cssText = `${PANEL}display:flex;top:auto;right:auto;left:50%;bottom:120px;transform:translateX(-50%);gap:8px;min-width:240px;`;
      const title = document.createElement("div");
      title.style.cssText = "font-weight:700;font-size:14px;";
      title.textContent = "Sleep in the tent";
      const note = document.createElement("div");
      note.style.cssText = "font-size:12px;opacity:0.8;line-height:1.35;";
      note.textContent = "Time moves on while you sleep, and people go about their day.";
      const length = document.createElement("select");
      length.style.cssText = "font:inherit;padding:8px;border-radius:6px;min-height:40px;";
      for (const [value, label] of [
        ["1", "An hour"],
        ["2", "Two hours"],
        ["4", "Four hours"],
        ["8", "Eight hours"],
        ["morning", "Until morning (7:00)"],
        ["evening", "Until evening (19:00)"],
      ]) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = label;
        length.append(option);
      }
      length.value = "8";
      const row = document.createElement("div");
      row.style.cssText = "display:flex;gap:8px;";
      const go = button("Sleep", "Lie down in the tent and sleep", () => {
        const chosen = length.value;
        hud.closeSleep();
        onSleep(Number(chosen) || chosen);
      });
      const no = button("Not now", "Leave the tent be", () => hud.closeSleep());
      for (const control of [go, no]) control.style.cssText += "flex:1;padding:10px 12px;";
      row.append(go, no);
      card.append(title, note, length, row);
      layer.append(card);
      sleepCard = card;
    },
    closeSleep() {
      sleepCard?.remove();
      sleepCard = null;
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
    /** Closes whichever panel is open. */
    closePanels() {
      for (const panel of panels) panel.style.display = "none";
    },
    /** Opens the Settings panel (from the main menu). */
    openSettings(section = null) {
      if (settingsPanel.style.display === "none") togglePanel(settingsPanel);
      showSection(section ?? shownSection);
      void loadAi(); // the connections, presets and characters its lists offer, as the in-world button does
    },
    /** While the main menu is up: the bar, hint and panels go. */
    setMenuOpen(open) {
      top.style.display = open ? "none" : "flex";
      chat.frame.style.display = open ? "none" : chatFloat.isOpen() ? "flex" : "none";
      if (!open) chatFloat.place();
      illustrate.frame.style.display = open ? "none" : illustrate.isOpen() ? "flex" : "none";
      hint.style.visibility = open ? "hidden" : "";
      if (open) {
        // Nothing of the world left over the menu: the use prompt, the thumb's button, a caption.
        hud.setPrompt(null);
        hud.setThumbs("", false);
        closeLook();
        caption.style.opacity = "0";
      }
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
        if (note.errand) {
          const take = button("Take it", "Take this errand: it's marked on your map", () =>
            boardHandlers?.onTake(note.id),
          );
          take.style.cssText = `${INK_SMALL}margin-top:8px;`;
          card.append(take);
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
      hint.textContent =
        "A note that asks for something can be taken: it's marked on your map, and the Journal's Here keeps it.";
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
            'With AI on it plays out as a moment, or as a full scene from "Play it as a scene". It\'s kept in the Journal (Here).',
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
      // Play it out now as a real Engine scene (the server part).
      const sceneNote = text("", "font-size:12px;opacity:0.8;");
      const narratorBox = document.createElement("input");
      narratorBox.type = "checkbox";
      narratorBox.checked = true;
      if (info.playScene && info.narrator) {
        // With the people there and the narrator, or the people alone (when there are any).
        const label = document.createElement("label");
        label.style.cssText = "display:flex;gap:6px;align-items:center;font-size:12px;";
        label.append(narratorBox, document.createTextNode(`With the narrator (${info.narrator})`));
        if (info.needsNarrator) {
          narratorBox.disabled = true;
          label.append(document.createTextNode(": nobody else is here, so the narrator tells it"));
        }
        nodes.push(label);
      }
      if (info.playScene) {
        const play = button(
          "Play it as a scene",
          "Open this as a roleplay scene in the Engine, with everyone here",
          async () => {
            play.disabled = true;
            play.textContent = "Starting…";
            const words = await info.playScene(
              info.actions[0]?.id ?? null,
              line.value,
              [...along],
              narratorBox.checked,
            );
            play.disabled = false;
            play.textContent = "Play it as a scene";
            sceneNote.textContent = words;
          },
        );
        play.style.cssText = `${INK_BUTTON}background:#6b4a2b;color:#f6ecd6;`;
        actions.append(play);
      }
      nodes.push(line, actions, sceneNote);
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
    /** Speaking up and narration show while walking about (not in a conversation or the menu). */
    setSpeakable(on) {
      chat.frame.style.display = on && chatFloat.isOpen() ? "flex" : "none";
    },
    /** Opens the chat window (after a world loads, if it was left open). */
    restoreChat() {
      if (chatFloat.isOpen()) chatFloat.setOpen(true);
    },
    /** The assistant's chat as a world left it: [{ role, text }]. */
    setAssistantChat(turns) {
      assistant?.setChat(turns);
    },
    /** The chat as a world left it: [{ who, text, mine }], in place of what's there. */
    setChat(lines) {
      narration.replaceChildren();
      for (const line of lines) hud.narrate(line.who, line.text, line.mine, true);
    },
    /** A line in the narration box: `who` null for the narrator. */
    /**
     * A line for the chat window: narration (no `who`: set apart, in italics), something the player
     * said or did (`mine`), or someone else's. With the window closed, narration shows as a caption
     * over the world instead of opening it, and the Chat button shows there's something to read.
     */
    narrate(who, text, mine = false, quiet = false) {
      const line = document.createElement("div");
      if (who && who !== "Narrator") {
        // Who's speaking, in their colour: the player's lines one side of the eye, everyone else's the other.
        line.style.cssText = `margin:3px 0;padding:3px 8px;border-radius:8px;background:${
          mine ? "rgba(52,92,140,0.13)" : "rgba(140,74,32,0.12)"
        };${mine ? "margin-left:22px;" : "margin-right:22px;"}`;
        const name = document.createElement("b");
        name.style.color = mine ? "#274f7d" : "#7a3a12";
        name.textContent = `${who}  `;
        line.append(name, document.createTextNode(text));
      } else {
        line.style.cssText =
          "margin:5px 0;padding:2px 0 2px 9px;border-left:3px solid rgba(107,74,43,0.45);font-style:italic;color:rgba(59,42,24,0.82);";
        line.textContent = text;
      }
      narration.append(line);
      while (narration.childElementCount > 60) narration.firstElementChild.remove();
      narration.scrollTop = narration.scrollHeight;
      if (quiet) return; // the chat put back as it was: nothing new to point at
      if (!chatFloat.isOpen()) {
        chatButton.textContent = "Chat •"; // something to read
        if (!who) {
          caption.textContent = text;
          caption.style.opacity = "1";
          clearTimeout(captionTimer);
          captionTimer = setTimeout(() => (caption.style.opacity = "0"), Math.min(11000, 3500 + text.length * 45));
        }
        return;
      }
      chat.frame.style.opacity = "1";
      clearTimeout(narrationTimer);
      narrationTimer = setTimeout(() => (chat.frame.style.opacity = "0.85"), 20000);
    },
    illustrate,
    setBusy(busy) {
      chat.frame.style.visibility = busy ? "hidden" : "";
      top.style.visibility = busy ? "hidden" : "";
      hint.style.visibility = busy ? "hidden" : "";
      if (busy) for (const panel of panels) panel.style.display = "none";
    },
    destroy() {
      narrow.removeEventListener?.("change", onNarrow);
      layer.remove();
    },
  };
  return hud;
}
