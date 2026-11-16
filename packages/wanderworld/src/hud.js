// The overlay on top of the world: a title bar with the game's buttons (folded into a menu on narrow
// screens), the People and Settings panels, a performance readout, a clock, the "use" prompt, a controls
// hint, a status line and a loading screen. Only controls take pointer events; the rest lets touches through.
import { checkKeys, DEFAULT_KEYS, KEY_ACTIONS, keyAllowed, keyName } from "./input.js";
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
import { LAND_CHOICES } from "./land.js";
import { kindWords, SHEET_KINDS, xpNeeded } from "./sheet.js";
import {
  INK_BUTTON,
  INK_INPUT,
  INK_SMALL,
  INK_SOFT,
  NOTE_PAPER,
  PARCHMENT,
  PARCHMENT_EDGED,
  infoButton,
  SERIF,
  vendorCountsEditor,
} from "./ui.js";

const CHIP = "background:rgba(10,14,20,0.62);color:#f3f5f7;border-radius:8px;padding:4px 10px;";
const BUTTON = `${CHIP}font:600 13px system-ui,sans-serif;border:0;cursor:pointer;pointer-events:auto;`;
const PANEL =
  `${PARCHMENT}position:absolute;top:48px;right:8px;display:none;flex-direction:column;gap:4px;max-height:calc(100% - 64px);` +
  "overflow-y:auto;box-sizing:border-box;min-width:244px;max-width:min(364px,calc(100% - 16px));padding:10px 12px;pointer-events:auto;font-size:13px;";
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
    ["custom", genderLabel()],
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

// The third gender's name, as the player gave it (Settings → People → Genders): "Custom" until they do.
let genderName = "";
const genderLabel = () => genderName || "Custom";

const RESOLUTION_LABELS = {
  100: "Full (your screen's)",
  1440: "1440p",
  1080: "1080p",
  720: "720p",
  540: "540p",
};
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
  if (touch) {
    // A phone's browser zooms the whole page in on a text box whose words are under 16px, and stays
    // zoomed afterwards (half the stick off the screen). So on a touch screen none is.
    layer.classList.add("wanderworld-touch");
    const noZoom = document.createElement("style");
    noZoom.textContent =
      ".wanderworld-touch input, .wanderworld-touch textarea, .wanderworld-touch select{font-size:16px!important}";
    layer.append(noZoom);
  }
  // The bar, the panels and the cards live in `pages`, which Text size scales as one (CSS zoom: its own size stays
  // the view's, and what's inside is laid out in bigger pixels). What is placed in real pixels stays in `layer`.
  const pages = document.createElement("div");
  pages.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;";

  const top = document.createElement("div");
  top.style.cssText =
    "position:absolute;top:8px;left:8px;right:8px;display:flex;flex-wrap:wrap;align-items:center;gap:6px;";
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
    pages.append(card);
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
      // Their gender (what the People menu's picker sets; Auto leaves it to their name and the world's
      // shares), and for the custom gender which of the two figures they have.
      const gender = bodyPicker((value) => {
        info.body = value;
        handlers.onSetBody(id, value);
        void handlers.lookOf(id).then((next) => {
          if (!next || lookCard !== card) return;
          now = next.now;
          card.replaceChildren(...draw());
        });
      });
      gender.style.cssText = "font:inherit;padding:6px;border-radius:6px;min-height:36px;min-width:0;";
      gender.setAttribute("aria-label", "Gender");
      gender.title = "Their gender, and so the body of the built-in person";
      gender.value = info.body ?? "auto";
      row("Gender", gender);
      if (now.gender === "custom")
        pick(
          "Figure",
          "figure",
          [
            ["", "Either (by their name)"],
            ["male", "Male figure"],
            ["female", "Female figure"],
          ],
          chosen.figure ?? "",
          (value) => value || undefined,
        );
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
        // How big it is: the nearest of the three to what it is now (a keyword may have made it bigger).
        const SIZES = [
          ["0.82", "Small"],
          ["1", "Usual"],
          ["1.25", "Large"],
          ["1.5", "Huge"],
        ];
        const sizing = (label, role, pet) =>
          choose(
            label,
            SIZES,
            SIZES.reduce(
              (best, [value]) =>
                Math.abs(Number(value) - (pet.scale ?? 1)) < Math.abs(Number(best) - (pet.scale ?? 1)) ? value : best,
              "1",
            ),
            (value) => [role, { ...pet, lore: undefined, scale: Number(value) }],
          );
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
          [
            ["", "None"],
            ["owned", "Owned"],
          ],
          dog ? "owned" : "",
          (owned) => ["dog", owned ? { size: "medium", coat: pets.dogCoats[0][0], out: true } : null],
        );
        if (dog) {
          choose(
            "Dog's coat",
            pets.dogCoats.map(([coat, word]) => [coat, capital(word)]),
            dog.coat,
            (coat) => ["dog", { ...dog, lore: undefined, coat }],
          );
          // (Small and medium are the small dog's body, the rest the big dog's; huge and massive can be ridden.)
          choose("Dog's size", pets.dogSizes, dog.size, (size) => [
            "dog",
            { ...dog, lore: undefined, kind: undefined, scale: undefined, size },
          ]);
          naming("Dog's name", "dog", dog);
          choose("Dog is", where, dog.out !== false ? "out" : "home", (at) => [
            "dog",
            { ...dog, lore: undefined, out: at === "out" },
          ]);
        }
        {
          const horse = pets.horse;
          choose(
            "Horse",
            [["", "None"], ...pets.horses.map(([coat, word]) => [coat, capital(word)])],
            horse?.coat ?? "",
            (coat) => ["horse", coat ? { ...horse, lore: undefined, coat, out: horse?.out !== false } : null],
          );
          if (horse) sizing("Horse's size", "horse", horse);
          if (horse) naming("Horse's name", "horse", horse);
          if (horse)
            choose("Horse is", where, horse.out !== false ? "out" : "home", (at) => [
              "horse",
              { ...horse, lore: undefined, out: at === "out" },
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
  const peopleButton = button("Who lives here…", "Choose characters to live in town", () => {
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
  // Everything in the panel belongs to a section, and within it to a sub-tab or to all of them: said by
  // where it was added (`at`), so what's built later can still go where it belongs.
  let shownSection = "";
  const sections = new Map(); // section → { subs: [names], shown: name }
  let spot = { section: "", sub: "" };
  const subTabs = document.createElement("div");
  subTabs.style.cssText = "display:flex;gap:4px;flex-wrap:wrap;margin-bottom:2px;";
  settingsPanel.append(subTabs);
  const add = (...nodes) => {
    for (const node of nodes) {
      node.dataset.section = spot.section;
      if (spot.sub) node.dataset.sub = spot.sub;
    }
    settingsPanel.append(...nodes);
  };
  const showSection = (name, sub = null) => {
    if (!sections.has(name)) name = shownSection || [...sections.keys()][0];
    shownSection = name;
    const section = sections.get(name);
    if (sub && section.subs.includes(sub)) section.shown = sub;
    // A sub-tab that says what it's for is enough: the section's own line isn't shown above it as well.
    const own = [...settingsPanel.children].some(
      (child) => child.dataset.intro && child.dataset.section === name && child.dataset.sub === section.shown,
    );
    for (const child of settingsPanel.children) {
      if (!child.dataset.section) continue; // the tabs themselves
      if (child.dataset.intro && child.dataset.section === name && !child.dataset.sub && own && section.shown) {
        child.toggleAttribute("data-wanderworld-settings-hidden", true);
        continue;
      }
      // Hidden by an attribute, so each row's own display (and whatever shows or hides it) is left alone.
      child.toggleAttribute(
        "data-wanderworld-settings-hidden",
        child.dataset.section !== name || (!!child.dataset.sub && child.dataset.sub !== section.shown),
      );
    }
    for (const tab of sectionTabs.children)
      if (tab !== closeSettings) tab.style.opacity = tab.textContent === name ? "1" : "0.6";
    subTabs.replaceChildren(
      ...section.subs.map((text) => {
        const tab = document.createElement("button");
        tab.type = "button";
        tab.textContent = text;
        tab.style.cssText = `${INK_SMALL}opacity:${text === section.shown ? "1" : "0.6"};${text === section.shown ? "font-weight:700;" : ""}`;
        tab.setAttribute("aria-pressed", String(text === section.shown));
        tab.addEventListener("click", () => showSection(name, text));
        return tab;
      }),
    );
    subTabs.style.display = section.subs.length ? "flex" : "none";
    if (name === "Debug") void refreshDebug();
    if (name === "World" && section.shown === "Vendors") refreshVendors();
  };
  /** What a section or a sub-tab is for, in a line or two at its top. */
  const intro = (text) => {
    const element = document.createElement("div");
    element.setAttribute("data-wanderworld-explain", "");
    element.style.cssText = `font-size:12px;line-height:1.4;color:${INK_SOFT};margin-bottom:2px;`;
    element.textContent = text;
    element.dataset.intro = "1";
    add(element);
  };
  /** What's added next goes in `section` (and its sub-tab `sub`; none: shown whichever is open). */
  const at = (section, sub = "") => {
    spot = { section, sub };
  };
  /** A section: its tab, its sub-tabs if it has any, and what it's for. */
  const heading = (text, about = "", subs = []) => {
    sections.set(text, { subs, shown: subs[0] ?? "" });
    const tab = document.createElement("button");
    tab.type = "button";
    tab.textContent = text;
    tab.style.cssText = INK_BUTTON;
    tab.addEventListener("click", () => showSection(text));
    sectionTabs.append(tab, closeSettings); // the close button stays last
    if (!shownSection) shownSection = text;
    at(text);
    if (about) intro(about);
  };
  /** A small heading inside a sub-tab. */
  const part = (text) => {
    const element = document.createElement("div");
    element.style.cssText = "font-weight:600;margin-top:6px;";
    element.textContent = text;
    add(element);
  };
  // What each setting does, in a line or two under it (behind its [i] with Show explanations off): what it does,
  // an example where there are numbers, what it costs or needs. One that's a function states what
  // other settings are set to, and is written again when they change.
  const sentNow = (count) =>
    count > 100
      ? "Now: all of them, for everyone. That can cost a lot."
      : `Now ${count}: one person gets ${count}, two get ${Math.ceil(count / 2)} each, three get ${Math.ceil(count / 3)} each.`;
  const EXPLAIN = {
    genderMale: (s) => {
      const total = s.genderMale + s.genderFemale + s.genderCustom;
      const of = (value) => (total ? Math.round((value / total) * 100) : 0);
      const third = s.genderName || "custom";
      return total
        ? `The three sliders are weighed against each other. Now: ${of(s.genderMale)}% male, ${of(s.genderFemale)}% female, ${of(s.genderCustom)}% ${third}.`
        : "All three are at 0, so it's half male and half female.";
    },
    genderCustom: "0 means nobody is given the custom gender unless lore, a card or you say so.",
    genderName:
      "What the custom gender is called. It is shown wherever a gender is chosen and is what the AI is told. Empty: Custom.",
    resolution:
      "How sharp the picture is: Full is every pixel of your screen, the others a smaller picture stretched to fit (never more than your screen has). On a 4K screen, 1080p is a quarter of the work.",
    ground:
      "Simple: plainer ground, with less work for every pixel of it. Helps most on a big screen without a graphics card.",
    drawDistance: "How far away things are drawn. Further looks grander but is slower.",
    smooth:
      "Softens jagged edges, which show most at a low resolution. Auto: on when the picture is no sharper than the page and a graphics card draws it. Without a graphics card it costs speed. A change shows after the page is reloaded.",
    density: "How many trees and plants grow round the town. Sparse is half of Normal, and the fastest.",
    rockDensity:
      "How many rocks and boulders lie about, set apart from the trees: a thick forest needn't be a field of boulders.",
    treeDetail:
      "Trees further off than this are drawn as simple shapes. Detailed trees are the costliest thing on screen, so Near is much faster; you'll see trees change as you walk up to them. Never further than the draw distance.",
    shadows: "Soft shadows under people.",
    frameLimit:
      "The most frames drawn a second. A lower limit leaves more of the graphics card for other things (a picture being painted on this computer) and keeps a laptop or phone cooler. Never more than your screen shows.",
    paintSlow:
      "While a picture is being painted, Wanderworld draws no more than 30 frames a second, and goes back when the picture arrives. For when the pictures are painted on this computer's graphics card.",
    nature: "On: detailed trees and plants. Off: simple shapes, which is faster.",
    props: "On: detailed barrels, crates, benches and stalls. Off: simple shapes.",
    buildings: "On: detailed buildings. Off: simple boxes.",
    people: "How characters with no 3D model of their own look.",
    animation: "Recorded: motion from the animation library. Built-in: a simple hand-made walk.",
    walkSpeed: "How fast you walk.",
    runSpeed: "How fast you run (hold Shift).",
    lookSpeed: "How fast the camera turns when you drag or use the arrow keys.",
    invertLook: "On: dragging up looks down, like a flight stick.",
    restKey: "On: the Sit key (C, unless you've changed it below) sits you down, and again lies you down.",
    jumpButton: "On a touch screen: a Jump button along the bottom.",
    restButton: "On a touch screen: a Sit button along the bottom. It becomes Lie down once you're sitting.",
    runButton:
      "On a touch screen: a Run button along the bottom. Tap it and you run, by the stick or to where you tap, until you tap it again.",
    chatMoves:
      "Jump and Sit buttons in the chat window, for a mouse. A touch screen has them along the bottom instead.",
    time: "Let the day pass, or keep it always day or always night.",
    timeSpeed: "How long a full day takes.",
    weather:
      "Changing picks every few minutes: mostly clear, sometimes rain, fog or snow, the heavy kinds least often; a winter world gets snow where others get rain. Off keeps the sky clear. How far you can see in each kind is the same at every draw distance.",
    season:
      'Which season is shown and played. As this world has it: the world\'s own, set in Journal → World and turned by "Seasons change". Any other choice holds that season here whatever the world says, as picking a kind of weather holds that weather. It changes how the land looks, what foraging finds, and which weather comes.',
    seasonsTurn:
      "On: the seasons follow one another (spring, summer, fall, winter), and the chat says when one begins. A world with no season set counts as summer. Days are the world's own, so with the time held at always day or always night no season passes. Off: the season stays as it is set in Journal → World → Season.",
    seasonDays:
      "How many of the world's days a season lasts: any number from 1 to 999. At the usual speed a day is 20 minutes, so 7 days is a little over two hours of play for each season.",
    morningMist: "With changing weather, about one clear morning in three starts in mist, from five until eight.",
    lightning: "On: lightning lights the sky in a thunderstorm. Off: a storm has rain and thunder but no flashes.",
    besidePlaces:
      "On: a place you're beside counts as well as the one you're in. On a river's bank in the woods, the river's lore is active with the forest's, and the AI and pictures are told you're near the river. It reaches a few metres past water, the mountains, a cave's mouth, a road and places out in the country. Off: only the place you're in.",
    narration:
      'A short written line when you arrive somewhere new, and now and then about who is near. No AI is used. To have the AI write it, turn on AI → Writing → "…when you arrive somewhere".',
    arriveGap:
      "The shortest time between one place being told and the next. A place you reach sooner is told when the wait is over, if you're still there; places you only pass through aren't told.",
    arriveVisits:
      "A place that's been told isn't told again until you've come back this many times. 1 tells it on every visit.",
    illustrateHere:
      "On: the lines that describe other places (told when you arrived there) are left out of what Illustrate is given, so the picture is of one place. What was said and done is always given. Off: the last eight lines whatever they are.",
    illustrateTell:
      "On: when the chat has no line describing the place you're in yet, Illustrate has it told first, so the picture matches where you are. The AI writes it if arrivals use the AI, else it's a written line. Needs \"Lines about where you are\" on; not indoors.",
    interiors: "On: you can walk into furnished rooms (unfinished). Off: a door shows who's inside.",
    worldEvents:
      "On: once a week is market day and every fourth week an evening festival, when much of the town gathers in the square. Off: every day is the same.",
    approach: "How often townsfolk walk up to greet you, or to confront you. 0 is never.",
    approachMax: "The most people who come up to you at the same time.",
    combat:
      "Where unfriendly people and hostile animals may square up to you. Safe places are towns, inns and cottages. Nothing is hurt yet.",
    names:
      "Name tags over people's heads, tinted by how they see you. With \"Only people I know\", someone you haven't met is a Stranger until you learn their name.",
    relationsMove:
      "On: people who spend time together slowly grow closer, short-tempered ones sometimes fall out, and friends who never meet drift apart. A relationship you lock in Journal → Edit people never changes. Off: only you change them.",
    worldLog:
      "On: who spent time with whom, and what changed between them, is noted in Journal → Relationships → Lately. Off: nothing is noted.",
    awayRecap: "On: when you come back after a few hours away, one line says what happened meanwhile.",
    memories: (s) =>
      `On: each person remembers what was said near them and who they spent time with (${s.memoryEach > 100 ? "every one" : `the newest ${s.memoryEach}`}), and separately what mattered, like a scene together or a night at your campfire (${s.memoryKept > 100 ? "every one" : `up to ${s.memoryKept}`}). Off: nothing is remembered, and nothing is sent to the AI.`,
    memorySights:
      "On: anyone who can see you also remembers what you do, like getting on a horse or lighting a fire. Off: only what was said near them.",
    inventory:
      "On: an Inventory button in the top bar opens Quartermaster's sheet for the persona you play in this world. Each world and each persona has its own. Off: no button, and Wanderworld asks nothing of Quartermaster.",
    inventoryWorn:
      "On: what the sheet says you're wearing is added after your persona's appearance when the AI speaks, narrates, plans a scene or paints a picture. It is written the way the sheet's own Feed setting says (Quartermaster → Settings); while that is Off, as names with descriptions. Off: the AI only knows your persona's card.",
    inventoryTrack:
      "After moments: when something is narrated, one more AI call reads it and updates the sheet (picked up, put on, given away), by Quartermaster's own rules for hidden items. After moments and replies: the same after each reply in a conversation, so about twice the calls there. Never: you keep the sheet yourself.",
    inventoryScenes:
      "On: a scene started from here is linked to this world's sheet, so the scene's chat shows and changes the same inventory, and its narrator is told what you carry. For the AI to update it during the scene, the Quartermaster agent has to be on in that chat. Off: a scene's chat has a sheet of its own. Needs Quartermaster 0.1.37 or later.",
    sheet:
      "On: you have a character sheet in each world (Inventory → Sheet): level, experience, HP, mana, AC, six attributes, and any stats, skills, feats or spells you add. Using an item applies what its description gives (a potion that says +10 HP heals 10), and worn items that say things like +2 AC count. Off: no sheet, and the Inventory window is Quartermaster's items alone.",
    sheetTold:
      "On: the ticked lines of your sheet are told to the AI in conversations and moments, so it knows you're hurt or what you're good at. Off: the sheet is yours to keep, and the AI isn't told. Adds a line or two to those prompts.",
    sheetTrack:
      "The AI reads what was narrated and changes your sheet to match: HP lost to a bite, mana spent on a spell, experience for something done. It answers with a short list of changes, which the game checks against your sheet, and a note in the chat says what changed. After moments: read each time something is narrated. It shares the inventory tracker's AI call when that is on, and is one more call when it isn't. After moments and replies: also after each reply in a conversation. Off: only you and the game's own rules (using an item) change it.",
    fights:
      "Off: nothing can be hurt, and hostile creatures only see you off. Real time: F swings, Q blocks, R dodges and X draws your weapon or puts it away. With it drawn the view stays behind you, turning the view turns you, and you step sideways and back without turning away (on a touch screen the Combat button by your thumb swaps Run, Sit and Jump for Attack, Block and Dodge; the chat window has the three too). A block lasts a moment: an attack on you while it does is rolled twice and the worse roll counts. A dodge rolls you a few steps, and nothing lands on you while you roll. You swing wherever you face, standing or on the move, and whatever animal is in front of you and in reach when the blow lands takes it. Each blow is an attack roll: a d20 plus your Strength modifier and your weapon's bonus against the creature's AC. Under its AC misses, at or over hits, and a 20 on the die is a critical hit that rolls the damage dice twice. A hostile creature you strike fights back, its attacks rolled the same way against your AC; a peaceful one runs. No AI call is made: the game rolls and tells what was rolled. By turns: a fight stops the clock for those in it. Everyone rolls initiative (a d20 plus Dexterity's modifier for you) and acts in that order. On your turn you may move nine metres, take one action (Attack, Cast a spell, Dodge, or use something you carry) and one bonus action (a spell cast as one), then end your turn; a bar at the top shows whose turn it is and what you have left. Companions and creatures take their turns by the same rules. A narrated moment: nothing is swung in real time. When a creature gets to you, or you press Attack with one in reach, the game rolls one exchange (its attack and yours) and, with AI moments on, the AI tells it as rolled; then the creature holds off a few seconds before the next. A scene: the same meeting opens a scene chat instead, with your stats sent to it, and the creatures let you be while you play it out.",
    defeatCost:
      "Taken when you get up after a defeat, however you get up. A quarter of your money (rounded up) is gone, or the experience you had toward your next level. Never a level, and never an item.",
    beatenDays:
      "How many days pass before something you've beaten is about again, back where it lives. 0: it's back the next time the world is opened.",
    bodyMinutes:
      "How long something you've beaten lies where it fell before it goes. 0 keeps it until you harvest it or clear it with the button below. While it lies there you can harvest an animal (hide, meat and the like go into your inventory, and the body goes) or search an outlaw (what they carried; the body stays).",
    defeat:
      "What happens at 0 HP. Come to where you fell: you get up there with 1 HP, and what beat you has drawn off. Wake at home: you wake at your own door (by the market if you have no home) with half your HP. Stay down until you choose: you lie where you fell while the chat and the narration go on, and a Respawn button at the top gets you up at home whenever you like. Nothing is lost either way, and nobody dies for good.",
    srdSlots:
      "Only where combat is By turns. Off: a spell costs its level in mana, as in real time. On: a spell is cast with a spell slot of its level or higher, as the 5e SRD has it, and mana is left alone. You have the slots of a full caster of your level (two first-level slots at level 1, three at level 2, four and two second-level at level 3, and so on up to third-level slots), and a sleep gives them back. Cantrips need neither.",
    partyFights:
      "On: in real-time combat the people travelling with you join in. Each has a class from the 5e SRD (Inventory → Sheet → Your companions), which gives them a weapon and spells: they strike what comes within reach, cast at what doesn't, and one who can heal mends you when you're below half your HP. Their rolls are told in the chat like yours. They move with the fight: one who strikes closes with a creature and works round it, one who casts keeps a few paces off. Creatures go for them as well as for you; each has HP from their class, and at 0 is out of the fight for a while, then up again. Off: they stand by, and nothing goes for them.",
    fightPeople:
      "Off: a swing passes people by, and only animals, monsters and outlaws can be struck. On: a blow can land on anyone in front of you, your companions too. It's rolled like any other. Whoever you strike remembers it for good and becomes your enemy, anyone who sees it remembers, and at 0 HP they are out cold for a couple of minutes, then get up. Nobody dies.",
    fightBack:
      "Real-time combat only. On: someone you strike or cast at turns on you. They close in and swing their class's weapon, or keep their distance and cast their class's spells at you; each is rolled against your AC or your saving throw and told in the chat, and Block and Dodge work against them. They stop when they're down to a third of their HP, when you go down, when you get well away, or about 45 seconds after you last went for them. Off: they take it, remember it and become your enemy, as before.",
    restRestores:
      "On: while you sit or lie down (on the ground, a bench, a bed) a point of mana comes back every few seconds and a point of HP a little slower, until both are full. A sleep in a tent or a bed restores both completely. Off: only items, spells and levelling restore them.",
    undefeatable:
      "On: your HP, mana and every other resource with a most are held at their most, whatever happens. Fights are still rolled and told, and nothing can put you down.",
    gathering:
      "On: buttons in the chat window let you gather where the land allows it. Each kind only at its resource: fish by water, chop wood standing against a tree (four strokes bring it down), forage in the woods, mine at a boulder or a cave, harvest on a farm in summer and fall. A roll with one of your attributes decides what you find, and it goes into your inventory. Needs the Quartermaster package for the items. Off: no gathering.",
    treeDays: "How many of the world's days a tree you cut down takes to stand again. 0: it never grows back.",
    vendors:
      "On: shops buy and sell. At a vendor's door or inside (the smithy, a shop, a tavern, an inn), a Shop button appears in the chat window. You pay from your purse and sell what you carry: a shop pays half a thing's worth for what it deals in and a quarter for anything else. Needs the Quartermaster package for the items. Off: no trading.",
    restockDays: "How many of the world's days pass before a shop's shelves are filled again, with different things.",
    haggling:
      "On: a shop's window has a Haggle button. Once a day at each vendor it rolls a Charisma check: 15 or more takes a tenth off the prices for the rest of the day (and it pays a tenth more for what you sell), 20 or more a fifth, 5 or less puts them up a tenth. With AI moments on, the haggling is narrated too. Off: prices are as marked.",
    vendorAi:
      "On: when a shop restocks, the AI writes what's on its shelves to fit your world's setting and the shop's trade, so a wasteland store and a fantasy apothecary sell different things. One AI call for each shop each restocking, made when you open the shop (the trackers' connection is used). If the call fails, the setting's own lists stand in. Off: the setting's own lists always.",
    gatherTools:
      "On: chopping wood needs an axe, mining a pickaxe and fishing a rod, carried in your inventory (anything named for one counts). The first of each is made in Inventory → Craft from a fallen branch, flint and plant fibre, which foraging finds. Foraging and harvesting are done by hand. Off: bare hands will do for everything.",
    regrowDays:
      "After you gather somewhere, that patch (about ten metres square) gives nothing more of that kind for this many of the world's days. 0: it always gives.",
    inventoryPinned:
      "On: the inventory window stays open while you play. Close it with its own close button or the Inventory button. A click elsewhere in the Engine, outside the game, still closes it. Off: it closes at any click outside it, as it does in a chat.",
    seasonLook:
      "On: the land wears the world's season (Journal → World → Season). Winter: snow on the trees, bushes, stones, roads and streets, the grass and flowers gone, drifts under the trees. Fall: leaves turned yellow, orange and red, the birches orange, dry grass, no flowers; pines stay green. Spring: the cherry trees in blossom, the rest a fresh green. Off: only winter's snowy ground shows.",
    inventoryTheme:
      "On: Quartermaster's window opens in Wanderworld's parchment colours and lettering. Off: it looks as it does in the Engine. The item and outfit editors it opens keep the Engine's look either way.",
    gossip:
      "On: people who spend time together sometimes tell each other something they saw or heard of you. The listener knows it as hearsay and doesn't pass it on. Whispers are never passed on. Off: people only know what they were there for.",
    memoryEach:
      "Small things: what was said, what they saw. When full, the oldest is forgotten. All keeps everything until you delete it. Keeping more costs no tokens.",
    memoryKept:
      "Things that mattered. Only another lasting memory pushes one out. All keeps everything. Memories you pin are locked and don't count.",
    memoryTold: (s) =>
      `One total, split evenly between the people the AI is speaking for. ${sentNow(s.memoryTold)} Someone with fewer than their share leaves the rest to the others. Each memory sent costs roughly 30 to 60 tokens per reply.`,
    memoryKeptTold: (s) =>
      `Split the same way. ${sentNow(s.memoryKeptTold)} Pinned memories are always sent as well (the newest six).`,
    memoryToldCounted:
      'Only matters if someone has their own "sent to the AI" number in Journal → Edit people → Memory. Off: everyone else still gets their normal share (total 20, three people, one set to 10: they get 7, 7 and 10). On: that person\'s number comes out of the total first (same case: 5, 5 and 10).',
    animalsStrays: "Dogs with no owner about the settlement.",
    animalsFarm: "Cattle, donkeys and horses at the farms, and horses by taverns and inns.",
    animalsWild: "Deer, stags and foxes out in the country.",
    animalsHostile: "Wolves, alone and in packs of two to five. A pack of three counts as three.",
    animalsMonsters:
      "Slimes, skeletons, giant spiders and rats, snakes, bats, wasps, frogs, imps, puglins, bandits, witches and wizards out in the country, and rarely a dragon overhead. Skeletons and bats only at night.",
    animalsTown: "The most stray dogs and horses inside the settlement itself. Any more are put just outside it.",
    loreAnimals:
      "On: animals a lorebook places, and anyone's own dog or horse, appear even when their sort is at 0. Off: 0 means none at all.",
    keepApart:
      "On: animals keep out of one another, and so do people walking, so a pack runs side by side and nobody walks through anybody. Off: they may pass through each other, as before.",
    hostileAnimals:
      "Keep their distance: they run if you come close. Square up: they come to about six paces and hold you off. Come for you: they run in and snap, sending you back a step. With combat off nothing is hurt; with it on (Settings → Inventory → Combat) each attack is rolled against your AC.",
    sound: "Footsteps, doors and the world's sounds.",
    volume: "How loud those sounds are.",
    hint: "The line that lists the controls. Its × turns this off.",
    textSize: "How big the words are in Wanderworld's windows and menus on this device.",
    clock: "The time of day, at the top.",
    place: "The place you are in and the lore active there, at the top.",
    stats: "Frames per second and other numbers at the top.",
    explanations:
      "On: every setting has its line under it, and the Journal and New world have theirs. Off: a setting's (i) shows its line while you point at it, and a tap keeps it open.",
    aiTalk:
      "On: when you talk to someone, your model writes their replies from their character card, your persona and the world. Off: they use short set lines.",
    aiMoments:
      "On: when something happens, the AI narrates it and people nearby may answer. Typing in the chat always counts; the switches below add more. One AI call each time. Off: the game uses its own written lines.",
    aiArrive: "One call each time you reach a new place. Off to start with, because it adds up.",
    aiThings: "One call when you use something: a stall, the fountain, a door, a campfire.",
    aiBoard: "One call when you read the noticeboard.",
    aiSeats: "One call when you sit down near someone.",
    aiJoin: "One call when you join someone in what they're doing.",
    aiSeparate:
      "For strict secrets between characters. Off: one call writes everyone's lines, with each person's knowledge kept apart inside it; strong models respect that. On: the narrator gets one call, and each person who answers gets their own with only what they know. Up to four calls per moment, so slower and dearer.",
    narratorCard:
      "One of your character cards as the narrator's voice in moments. The whole card is sent with every moment, so a short one costs less. None: a plain narrator.",
    talkStyle:
      "A general tone on top of each person's own character. Someone given a voice of their own in Journal → Edit people keeps it.",
    replyLength: "How long people's replies are. Longer replies cost more tokens.",
    promptCache:
      "For AI providers that charge less for a prompt they've seen before (prompt caching). On: in a conversation, what changes with every line (the time, who's near, what they remember, what you have on) is sent last, after what was said, so everything before it can be reused; and the lines sent back start from the same place for several turns. Off: it is all sent at the top, as before. Replies should be the same either way; turn it off if a model starts talking about its \"context\". Moments are always sent in the cache-friendly order. The AI assistant's chat is ordered the same way: the world as it is now goes on your newest message.",
    aiTemperature: "Higher: more surprising. Lower: more predictable.",
    sceneNarratorCard:
      "One of your character cards as the narrator in scenes. With one chosen, a scene can start with nobody else there.",
    scenePov: "Who the scene is told as. Each world's own scene instructions are in Journal → World.",
    sceneTense: "The tense scenes are written in.",
    scenePreset: "The Engine prompt preset a scene starts with. None: the scene's own instructions alone.",
    textConnection:
      "The model that writes conversations and moments. Engine default: your Engine's agent or main connection.",
    sceneConnection: "The model that plans and plays scenes. Leave it to use the same as conversations.",
    trackerConnection:
      "The model that reads what was narrated for the trackers: Quartermaster's inventory and your character sheet. They answer with short lists, so a small, cheap model does well here. Leave it to use the same as conversations.",
    imageConnection: "The image generation connection for pictures of places and moments.",
    imageStyle:
      "The look of pictures, from the Engine's style profiles. The style's own words are put in the prompt ({style} in Illustrate's template, or at the end if the template leaves it out) and what it keeps out is sent with it. Engine default is your default profile in the Engine. Auto and No style add no words.",
  };
  const info = infoButton; // the [i] before a label (ui.js)
  const explainers = []; // descriptions that state what other settings are set to
  const dependents = []; // rows that only matter while another setting is on: [{ nodes, under }]
  const row = (label, control, name = null, under = "") => {
    const element = document.createElement("label");
    element.style.cssText = "display:flex;align-items:center;justify-content:space-between;gap:10px;";
    const text = document.createElement("span");
    text.style.cssText = "display:flex;align-items:center;min-width:0;";
    text.textContent = label;
    element.append(text, control);
    add(element);
    const nodes = [element];
    // (A setting with nothing to explain keeps the [i]'s room, so the names line up.)
    if (!(name && EXPLAIN[name])) {
      const gap = document.createElement("span");
      gap.setAttribute("data-wanderworld-info", "");
      gap.style.cssText = "flex:none;width:22px;margin-right:6px;";
      text.prepend(gap);
    }
    if (name && EXPLAIN[name]) {
      const explain = document.createElement("div");
      explain.setAttribute("data-wanderworld-explain", "");
      explain.style.cssText = "font-size:11px;opacity:0.7;margin:-4px 0 2px;line-height:1.3;";
      // A description that states a number another setting sets is written again whenever settings change.
      const about = EXPLAIN[name];
      const write = (settings) => (explain.textContent = typeof about === "function" ? about(settings) : about);
      write(Object.fromEntries(Object.entries(SETTINGS).map(([key, setting]) => [key, setting.value])));
      if (typeof about === "function") explainers.push(write);
      text.prepend(info(explain));
      add(explain);
      nodes.push(explain);
    }
    // Under the setting it hangs on: set in, and faint while that one is off.
    if (under) {
      for (const node of nodes) node.style.marginLeft = "16px";
      dependents.push({ nodes, under });
    }
  };
  const addField = (name, field) => {
    const first = fields[name];
    fields[name] = first
      ? {
          set: (value) => {
            first.set(value);
            field.set(value);
          },
        }
      : field;
  };
  const choice = (name, label, labels, under = "") => {
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
    addField(name, { set: (value) => (select.value = String(value)) });
    row(label, select, name, under);
  };
  const toggle = (name, label, under = "") => {
    const box = document.createElement("input");
    box.type = "checkbox";
    box.addEventListener("change", () => handlers.onSetting(name, box.checked));
    addField(name, { set: (value) => (box.checked = value) });
    row(label, box, name, under);
  };
  /** A number typed in (kept within the setting's own least and most). */
  const number = (name, label, under = "") => {
    const input = document.createElement("input");
    input.type = "number";
    input.min = String(SETTINGS[name].min);
    input.max = String(SETTINGS[name].max);
    input.step = "1";
    input.inputMode = "numeric";
    input.style.cssText = `${INK_INPUT}width:76px;text-align:right;`;
    input.addEventListener("change", () => {
      const typed = Math.round(Number(input.value));
      if (!Number.isFinite(typed)) return;
      const within = Math.min(SETTINGS[name].max, Math.max(SETTINGS[name].min, typed));
      input.value = String(within);
      handlers.onSetting(name, within);
    });
    addField(name, { set: (next) => (input.value = String(next)) });
    row(label, input, name, under);
  };
  const slider = (name, label, step, format, under = "") => {
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
    addField(name, {
      set: (next) => {
        range.value = String(next);
        value.textContent = format(next);
      },
    });
    row(label, wrap, name, under);
  };
  const times = (value) => `${value.toFixed(1)}×`;
  const orAll = (value) => (value > 100 ? "All" : String(value));
  heading(
    "Display",
    "How Wanderworld looks and sounds on this device. These are kept for each device, so a phone and a desktop can differ.",
    ["Graphics", "On screen", "Sound"],
  );
  at("Display", "Graphics");
  choice("resolution", "Resolution", RESOLUTION_LABELS);
  choice("smooth", "Smooth edges", { auto: "Auto", on: "On", off: "Off" });
  choice("drawDistance", "Draw distance", DISTANCE_LABELS);
  choice("density", "Trees and plants", { 0.25: "Sparse", 0.5: "Normal", 1: "2×", 4: "8×", 10: "20×" });
  choice("rockDensity", "Rocks and boulders", { 0.25: "Sparse", 0.5: "Normal", 1: "2×", 4: "8×", 10: "20×" });
  toggle("shadows", "Shadows under people");
  choice("frameLimit", "Frame rate limit", { 0: "No limit", 30: "30", 60: "60", 100: "100" });
  toggle("paintSlow", "Draw slower while a picture is painted");
  toggle("seasonLook", "Trees, plants and streets wear the season");
  choice("ground", "Ground", { full: "Full", simple: "Simple" });
  toggle("nature", "Detailed trees and plants");
  choice(
    "treeDetail",
    "Detailed trees out to",
    { 30: "Near (30 m)", 70: "Medium (70 m)", 180: "Far (180 m)", 300: "Very far (300 m)", 450: "Max (450 m)" },
    "nature",
  );
  toggle("props", "Detailed furniture and props");
  toggle("buildings", "Detailed buildings");
  choice("people", "People without a model", { kit: "Dressed (Quaternius)", simple: "Simple" });
  choice("animation", "Animation", { recorded: "Recorded (Quaternius)", builtin: "Built-in" });
  at("Display", "On screen");
  choice("textSize", "Text size", { 0.85: "Small", 1: "Normal", 1.15: "Large", 1.3: "Larger", 1.5: "Largest" });
  toggle("clock", "Time");
  toggle("place", "Where you are");
  toggle("hint", "Controls hint");
  toggle("stats", "Frame rate");
  toggle("explanations", "Show explanations");
  at("Display", "Sound");
  toggle("sound", "Sound");
  slider("volume", "Volume", 0.05, (value) => `${Math.round(value * 100)}%`, "sound");

  // The player's keys (input.js), and the controls hint that names them (set once the hint is made).
  let keyBinds = { ...DEFAULT_KEYS };
  let updateHint = null;
  heading("Controls", "How you move and look around. The buttons and camera are kept for each device.");
  slider("walkSpeed", "Walk speed", 0.1, times);
  slider("runSpeed", "Run speed", 0.1, times);
  slider("lookSpeed", "Camera turn speed", 0.1, times);
  toggle("invertLook", "Invert up and down");
  toggle("restKey", "The Sit key sits and lies down");
  toggle("jumpButton", "Jump button (touch screens)");
  toggle("restButton", "Sit and lie down button (touch screens)");
  toggle("runButton", "Run button (touch screens)");
  toggle("chatMoves", "Jump and Sit buttons in the chat window");
  if (!touch) {
    // Keys: a button for each action; press it, then the key it should have.
    const head = document.createElement("div");
    head.style.cssText = "font-weight:700;margin-top:8px;font-size:13px;";
    head.textContent = "Keys";
    const about = document.createElement("div");
    about.setAttribute("data-wanderworld-explain", "");
    about.style.cssText = "font-size:11px;opacity:0.75;line-height:1.35;margin:-2px 0 2px;";
    about.textContent =
      "Press an action's button, then the key you want for it. A key another action has is swapped with it. Esc cancels. The arrow keys (look round), + and - (zoom), Esc, Enter and Tab can't be given away. These are kept for this device.";
    head.prepend(info(about));
    const list = document.createElement("div");
    list.style.cssText = "display:grid;grid-template-columns:1fr auto;gap:4px 10px;align-items:center;font-size:12px;";
    let listening = null; // the listener while a button waits for its key
    const stop = () => {
      if (listening) window.removeEventListener("keydown", listening, true);
      listening = null;
    };
    const keep = (next) => {
      // Only what differs from the usual keys is kept.
      const changed = Object.fromEntries(Object.entries(next).filter(([action, key]) => DEFAULT_KEYS[action] !== key));
      handlers.onSetting("keys", Object.keys(changed).length ? JSON.stringify(changed) : "");
    };
    const draw = (value) => {
      stop();
      keyBinds = checkKeys(value);
      updateHint?.();
      list.replaceChildren();
      for (const [action, label] of KEY_ACTIONS) {
        const name = document.createElement("div");
        name.textContent = label;
        const control = button(keyName(keyBinds[action]), `Change the key for: ${label}`, () => {
          stop();
          control.textContent = "Press a key…";
          listening = (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            const key = String(event.key).toLowerCase();
            if (key === "escape") return draw(keyBinds);
            if (!keyAllowed(key)) return void (control.textContent = `${keyName(key)} can't be used. Another?`);
            const other = Object.keys(keyBinds).find((name) => name !== action && keyBinds[name] === key);
            // (Listed first, so it's the one that keeps the key should the two ever clash.)
            const next = { [action]: key, ...keyBinds, [action]: key };
            if (other) next[other] = keyBinds[action];
            keep(next);
            draw(next);
          };
          window.addEventListener("keydown", listening, true);
        });
        control.style.cssText += "padding:3px 10px;font-size:12px;min-width:64px;";
        list.append(name, control);
      }
    };
    const reset = button("Reset keys", "Put every key back as it was to begin with", () => {
      handlers.onSetting("keys", "");
      draw("");
    });
    reset.style.cssText += "align-self:flex-start;padding:3px 10px;font-size:12px;";
    addField("keys", { set: draw });
    draw("");
    add(head, about, list, reset);
  }

  heading("World", "The world itself: its time, its weather, its places and its shops.", [
    "Time and weather",
    "Places",
    "Vendors",
  ]);
  at("World", "Time and weather");
  choice("time", "Time", TIME_LABELS);
  choice("timeSpeed", "Time speed", {
    0.25: "¼× (a day in 80 min)",
    0.5: "½× (a day in 40 min)",
    1: "1× (a day in 20 min)",
    2: "2× (a day in 10 min)",
    4: "4× (a day in 5 min)",
    8: "8× (a day in 2½ min)",
  });
  choice("weather", "Weather", {
    off: "Off (always clear)",
    changing: "Changing",
    mist: "Mist",
    "fog-light": "Light fog",
    fog: "Fog",
    "fog-heavy": "Heavy fog",
    "rain-light": "Light rain",
    rain: "Rain",
    "rain-heavy": "Heavy rain",
    storm: "Thunderstorm",
    "snow-light": "Light snow",
    snow: "Snow",
    "snow-heavy": "Heavy snow",
  });
  choice("season", "Season", {
    world: "As this world has it",
    none: "None (green land)",
    spring: "Spring",
    summer: "Summer",
    fall: "Fall",
    winter: "Winter",
  });
  toggle("seasonsTurn", "Seasons change");
  number("seasonDays", "A season lasts (days)", "seasonsTurn");
  toggle("morningMist", "Misty mornings");
  toggle("lightning", "Lightning flashes");
  at("World", "Places");
  choice("narration", "Lines about where you are", { off: "Off", lines: "On" });
  slider("arriveGap", "Wait between places told", 5, (value) => `${value} s`);
  slider("arriveVisits", "Visits before a place is told again", 1, String);
  toggle("besidePlaces", "Places you're beside count too");
  toggle("interiors", "Walk into buildings (unfinished)");
  toggle("worldEvents", "Market days and festivals");

  // People: how they act round the player, how they get on, what they remember. Rules alone.
  heading(
    "People",
    "How the people of the world act around you, how they get on with each other, and what they remember. All of it runs on the game's own rules: none of it calls the AI. Nothing happens while Wanderworld is closed.",
    ["Around you", "Relationships", "Memory", "Genders"],
  );
  at("People", "Around you");
  add(peopleButton); // who lives in this world
  slider("approach", "How often people come up to you", 0.1, (value) => (value === 0 ? "never" : times(value)));
  choice("approachMax", "At most at once", { 1: "1", 2: "2", 3: "3", 5: "5" });
  choice("combat", "Where people may confront you", {
    anywhere: "Anywhere",
    outsideTowns: "Outside towns",
    outsideSafe: "Outside safe places",
    off: "Nowhere",
  });
  choice("names", "Names over people", {
    all: "Show all names",
    known: "Only people I know",
    none: "Hide all names",
  });
  at("People", "Relationships");
  intro("How people feel about you and each other can change as they spend time together.");
  toggle("relationsMove", "Relationships change over time");
  toggle("worldLog", "Keep a diary of what happens");
  toggle("awayRecap", "Tell me what I missed", "worldLog");
  at("People", "Memory");
  intro(
    "Each person remembers what they saw, heard or were told. The game keeps these itself, so remembering costs no tokens. Sending memories to the AI when it speaks for someone does, so you choose how many are kept and how many are sent. Anyone can have limits of their own in Journal → Edit people → Memory.",
  );
  toggle("memories", "People remember things");
  toggle("memorySights", "Remember what you do, not only what you say", "memories");
  toggle("gossip", "People tell each other about you", "memories");
  part("How many are kept");
  slider("memoryEach", "Everyday memories kept, per person", 1, orAll, "memories");
  slider("memoryKept", "Lasting memories kept, per person", 1, orAll, "memories");
  part("How many are sent to the AI");
  slider("memoryTold", "Everyday memories sent to the AI", 1, orAll, "memories");
  slider("memoryKeptTold", "Lasting memories sent to the AI", 1, orAll, "memories");
  toggle("memoryToldCounted", "Count personal limits against the total", "memories");
  part("Keeping memories short");
  sumUpRow();
  // Inventory: everything about what you carry and what you can do with it, in four parts. (Its tab comes
  // after People's; People's own last part, Genders, is added below.)
  heading(
    "Inventory",
    "What you carry, your character sheet, gathering and shops. The things themselves are kept by the Quartermaster package, if you have it installed; your sheet is Wanderworld's own and works without it.",
    ["Items", "Sheet", "Gathering", "Shops", "Combat"],
  );
  at("Inventory", "Items");
  intro(
    "The Inventory button opens a window in tabs: Items, Craft, Sheet and Quartermaster. What you wear and carry is kept by the Quartermaster package: without it the Items and Craft tabs are empty and these settings do nothing.",
  );
  toggle("inventory", "Use Quartermaster for the inventory");
  toggle("inventoryWorn", "Tell the AI what you're wearing", "inventory");
  choice(
    "inventoryTrack",
    "The AI keeps the inventory up to date",
    { off: "Never", moments: "After moments", all: "After moments and replies" },
    "inventory",
  );
  toggle("inventoryScenes", "Scenes use this world's inventory", "inventory");
  toggle("inventoryTheme", "Parchment colours for the inventory window", "inventory");
  toggle("inventoryPinned", "Keep the inventory window open while you play", "inventory");
  at("Inventory", "Sheet");
  intro(
    "Your character sheet (Inventory → Sheet): level, experience, HP, mana, AC, attributes, and whatever you add. A level gained raises what your HP and mana can be, and restores your HP.",
  );
  toggle("sheet", "Character sheet");
  toggle("sheetTold", "Tell the AI your stats", "sheet");
  choice(
    "sheetTrack",
    "The AI updates your sheet",
    { off: "Off", moments: "After moments", all: "After moments and replies" },
    "sheet",
  );
  at("Inventory", "Gathering");
  intro(
    "Fishing, chopping wood, foraging, mining and harvesting, each at its own resource. What you find goes into your inventory.",
  );
  toggle("gathering", "Gathering");
  toggle("gatherTools", "Gathering needs tools", "gathering");
  number("regrowDays", "Days until a spot gives again", "gathering");
  number("treeDays", "Days until a felled tree grows back", "gathering");
  at("Inventory", "Shops");
  intro("Buying and selling. Which buildings and stalls trade, and as what, is in Settings → World → Vendors.");
  toggle("vendors", "Shops buy and sell");
  number("restockDays", "Days between a shop's restocking", "vendors");
  toggle("vendorAi", "The AI stocks shop shelves", "vendors");
  toggle("haggling", "Haggling", "vendors");
  at("Inventory", "Combat");
  intro(
    "Fighting what would attack you: wolves, monsters and outlaws. It uses your character sheet (HP, AC, Strength), so the sheet has to be on. How hostile creatures behave when you're near is in Settings → Creatures → Behaviour.",
  );
  choice(
    "fights",
    "Combat",
    { off: "Off", realtime: "Real time", turns: "By turns", moment: "A narrated moment", scene: "A scene" },
    "sheet",
  );
  choice(
    "defeat",
    "When your HP runs out",
    { here: "Come to where you fell", home: "Wake at home", stay: "Stay down until you choose" },
    "sheet",
  );
  choice(
    "defeatCost",
    "What a defeat costs",
    { none: "Nothing", coins: "A quarter of your money", xp: "Your experience toward the next level" },
    "sheet",
  );
  toggle("undefeatable", "Undefeatable", "sheet");
  toggle("restRestores", "Resting restores HP and mana", "sheet");
  toggle("fightPeople", "Blows can land on people", "sheet");
  toggle("fightBack", "People you attack fight back", "fightPeople");
  toggle("partyFights", "Your companions fight beside you", "sheet");
  toggle("srdSlots", "Fights by turns use spell slots", "sheet");
  number("bodyMinutes", "Minutes the beaten lie where they fell", "sheet");
  number("beatenDays", "Days before the beaten are about again", "sheet");
  {
    const clear = button("Clear the beaten now", "Everything beaten and still lying about goes", () =>
      handlers.onClearBodies?.(),
    );
    clear.style.alignSelf = "flex-start";
    add(clear);
  }
  at("People", "Genders");
  intro(
    "How many of the people the game or the AI makes up are men, women, or a third gender you name. Lore comes first: a gender set by a lorebook, a character card, or by you in Journal → Edit people is never changed. These only decide people whose gender nothing says: townsfolk left on Auto, and people the AI invents. Each world keeps its own (New world, then Journal → World): what's here is what a new world starts from, and what a world made before 0.5.83 follows.",
  );
  const share = (value) => String(Math.round(value));
  slider("genderMale", "Male", 1, share);
  slider("genderFemale", "Female", 1, share);
  slider("genderCustom", "Custom", 1, share);
  {
    const name = document.createElement("input");
    name.type = "text";
    name.maxLength = 40;
    name.placeholder = "e.g. Non-binary";
    name.style.cssText = `${INK_INPUT}width:150px;padding:3px 6px;`;
    name.addEventListener("change", () => handlers.onSetting("genderName", name.value.trim()));
    addField("genderName", { set: (value) => (name.value = value ?? "") });
    row("Name of the custom gender", name, "genderName");
  }
  // Animals: how many of each sort a world has of its own, and each kind on or off altogether.
  heading("Creatures", "Which animals and monsters live in your worlds, how many, and how they act.", [
    "How many",
    "Kinds",
    "Behaviour",
  ]);
  at("Creatures", "How many");
  // In groups, each with a line on what it's for and what wins over what, so it isn't a wall of switches.
  const group = (title, note) => {
    const head = document.createElement("div");
    head.style.cssText = "font-weight:700;margin-top:8px;font-size:13px;";
    head.textContent = title;
    const about = document.createElement("div");
    about.setAttribute("data-wanderworld-explain", "");
    about.style.cssText = "font-size:11px;opacity:0.75;line-height:1.35;margin:-2px 0 2px;";
    about.textContent = note;
    head.prepend(info(about));
    add(head, about);
  };
  /** A row of small switches side by side (one for each kind), kept like any other setting. */
  const switches = (list) => {
    const grid = document.createElement("div");
    grid.style.cssText = "display:grid;grid-template-columns:repeat(auto-fill,minmax(128px,1fr));gap:4px 10px;";
    for (const [name, label] of list) {
      const item = document.createElement("label");
      item.style.cssText = "display:flex;align-items:center;gap:6px;font-size:13px;min-height:28px;";
      const box = document.createElement("input");
      box.type = "checkbox";
      box.addEventListener("change", () => handlers.onSetting(name, box.checked));
      fields[name] = { set: (value) => (box.checked = value) };
      const text = document.createElement("span");
      text.textContent = label;
      item.append(box, text);
      grid.append(item);
    }
    add(grid);
  };
  const whole = (value) => String(Math.round(value));
  group(
    "How many",
    "How many of each sort a world has of its own. 0 is none of that sort. A world can have numbers of its own (Journal → World → Creatures in this world), which are used in place of these.",
  );
  slider("animalsStrays", "Stray dogs", 1, whole);
  slider("animalsFarm", "Farm animals", 1, whole);
  slider("animalsWild", "Wild animals (peaceful)", 1, whole);
  slider("animalsHostile", "Wild animals (hostile)", 1, whole);
  slider("animalsMonsters", "Monsters", 1, whole);
  slider("animalsTown", "Most in the settlement", 1, whole);
  group(
    "Lore and owned animals",
    "Animals a lorebook places (ww:monster:wolf:pack5), and anyone's own dog or horse, are extra to the numbers above.",
  );
  toggle("loreAnimals", "They appear even when their sort is at 0");
  at("Creatures", "Behaviour");
  toggle("keepApart", "People and animals keep out of one another");
  group(
    "How hostile ones behave",
    "Wolves and monsters. Only where \"Where people may confront you\" (Settings → People → Around you) allows it: off there, they always keep their distance. A lorebook's ww:tame or ww:hostile on a creature's entry decides which kinds are hostile at all.",
  );
  choice("hostileAnimals", "When you're near", {
    avoid: "Keep their distance",
    threaten: "Square up to you",
    attack: "Come for you",
  });
  at("Creatures", "Kinds");
  group(
    "Which kinds there are",
    "Off, there are none of that kind anywhere. This beats everything else: the numbers above, a lorebook, and ownership.",
  );
  const kindHead = (text) => {
    const head = document.createElement("div");
    head.style.cssText =
      "font-size:11px;font-weight:700;opacity:0.65;text-transform:uppercase;letter-spacing:0.04em;margin-top:2px;";
    head.textContent = text;
    add(head);
  };
  kindHead("Farm and town");
  switches([
    ["animalDog", "Dogs"],
    ["animalHorse", "Horses"],
    ["animalDonkey", "Donkeys"],
    ["animalCow", "Cows"],
    ["animalBull", "Bulls"],
    ["animalAlpaca", "Alpacas"],
  ]);
  kindHead("Wild");
  switches([
    ["animalDeer", "Deer"],
    ["animalStag", "Stags"],
    ["animalFox", "Foxes"],
    ["animalWolf", "Wolves"],
  ]);
  kindHead("Monsters");
  switches([
    ["animalSlime", "Slimes"],
    ["animalSkeleton", "Skeletons (night)"],
    ["animalSpider", "Giant spiders"],
    ["animalRat", "Giant rats"],
    ["animalSnake", "Snakes"],
    ["animalBat", "Bats (night)"],
    ["animalWasp", "Giant wasps"],
    ["animalFrog", "Giant frogs"],
    ["animalDragon", "Dragons (rare, overhead)"],
    ["animalImp", "Imps"],
    ["animalBandit", "Bandits"],
    ["animalWitch", "Witches"],
    ["animalWizard", "Wizards"],
    ["animalPuglin", "Puglins (pig-goblins)"],
  ]);
  // AI: the server part's connections and styles. The connection lists come from the Engine when the
  // panel opens (they're the user's own, so they can change while playing).
  heading(
    "AI",
    "The AI is optional: the world works without it. With it, people answer in their own words and a narrator tells what happens. It uses the connections you set up in the Engine, and every call spends tokens (Settings → Token use).",
    ["Writing", "Scenes", "Pictures", "Connections"],
  );
  at("AI", "Connections");
  intro("Which of your Engine connections does what.");
  const aiStatus = document.createElement("div");
  aiStatus.style.cssText = "font-size:12px;line-height:1.35;opacity:0.85;";
  aiStatus.textContent = "Checking that Wanderworld is fully loaded…";
  const aiDebug = document.createElement("div");
  aiDebug.style.cssText = "font-size:12px;line-height:1.35;opacity:0.85;";
  aiDebug.textContent =
    "To see what is sent: turn on the Engine's Debug Mode (Settings → Advanced). Every request Wanderworld makes to a model, with its answer, and every picture request (connection, model, size, prompt) is then written to the Engine's console.";
  add(aiStatus, aiDebug);
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
  connectionChoice("textConnection", "Conversations and moments use", "text", "Engine default");
  connectionChoice("sceneConnection", "Scenes use", "text", "Same as conversations");
  connectionChoice("trackerConnection", "Trackers use", "text", "Same as conversations");
  connectionChoice("imageConnection", "Pictures use", "image", "Engine default");
  // (The trackers' connection again, with the inventory's own settings. Here, since the picker is made above.)
  at("Inventory", "Items");
  connectionChoice("trackerConnection", "Trackers use", "text", "Same as conversations");
  at("AI", "Writing");
  intro(
    "A moment is one thing that happens and is told: you say or do something, sit down with someone, arrive somewhere. The narrator describes it and people nearby may answer.",
  );
  toggle("aiTalk", "AI conversations");
  toggle("aiMoments", "AI moments");
  toggle("aiArrive", "…when you arrive somewhere", "aiMoments");
  toggle("aiThings", "…when you use things", "aiMoments");
  toggle("aiBoard", "…when you read the noticeboard", "aiMoments");
  toggle("aiSeats", "…when you sit down", "aiMoments");
  toggle("aiJoin", "…when you join someone", "aiMoments");
  toggle("aiSeparate", "A separate call for each person who answers", "aiMoments");
  connectionChoice("narratorCard", "Narrator for moments", "characters", "None");
  part("How it's written");
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
  toggle("promptCache", "Order prompts for caching");
  slider("aiTemperature", "Creativity", 0.1, (value) => value.toFixed(1));
  // (The AI's part in shops and the sheet: the same settings as in Inventory, gathered here too.)
  toggle("vendorAi", "The AI stocks shop shelves");
  choice("sheetTrack", "The AI updates your sheet", {
    off: "Off",
    moments: "After moments",
    all: "After moments and replies",
  });
  at("AI", "Scenes");
  intro(
    "A scene is a full roleplay chat in the Engine, started from where you stand with whoever is there (the chat window's Scene button). These choose how it's written.",
  );
  connectionChoice("sceneNarratorCard", "Narrator for scenes", "characters", "None");
  choice("scenePov", "Point of view", {
    second_person: "Second person (you)",
    third_person: "Third person",
    first_person: "First person",
  });
  choice("sceneTense", "Tense", { present: "Present", past: "Past" });
  connectionChoice("scenePreset", "Prompt preset", "presets", "None");
  at("AI", "Pictures");
  intro("Pictures of places and moments (the Illustrate button) are made by the Engine's image generation.");
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
  toggle("illustrateHere", "Illustrate: leave out other places' descriptions");
  toggle("illustrateTell", "Illustrate: describe the place first if it hasn't been");
  /** Reads the server part's status and the user's connections into the AI section. */
  const loadAi = async () => {
    const status = await handlers.onAiStatus?.();
    if (!status) {
      aiStatus.textContent =
        "Wanderworld isn't fully loaded yet: restart the Engine (needed once after installing or updating Wanderworld). Until then people use set lines.";
      return;
    }
    aiStatus.textContent = status.scenes
      ? "Ready: conversations, pictures and scenes use your Engine's connections."
      : "Ready: conversations and pictures. This Engine can't start scenes from packages yet.";
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
      "This builds this world again from its setup, with everything this version adds. Change anything below to build it differently: bigger, another kind of settlement, more places out in the country. Your people, relationships, party, notes and lore stay; you start again at the square. It can't be undone.";
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
    // What New world asks about the land and the settlement, each as it is unless changed here.
    const now = handlers.onRegenerateNow?.() ?? { choices: {}, size: "normal", counts: {}, kinds: [] };
    const changes = {};
    const pickers = document.createElement("div");
    pickers.style.cssText =
      "display:grid;grid-template-columns:auto 1fr;gap:5px 8px;align-items:center;font-size:12px;";
    for (const [key, text, options] of LAND_CHOICES) {
      const select = document.createElement("select");
      select.style.cssText =
        "font:12px system-ui,sans-serif;border-radius:6px;border:0;padding:4px;min-width:0;width:100%;";
      const has = key === "size" ? now.size : now.choices?.[key];
      const known = options.find(([value]) => value === has)?.[1];
      for (const [value, words] of [["keep", known ? `As it is (${known})` : "As it is"], ...options]) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = words;
        select.append(option);
      }
      select.setAttribute("aria-label", text);
      select.addEventListener("change", () => {
        if (select.value === "keep") delete changes[key];
        else changes[key] = select.value;
        syncEverything();
        redraw();
      });
      const name = document.createElement("span");
      name.textContent = text;
      pickers.append(name, select);
    }
    // One of everything: only a Massive world has the room.
    const everything = document.createElement("label");
    everything.style.cssText = "display:none;gap:6px;align-items:center;font-size:12px;cursor:pointer;";
    const everythingBox = document.createElement("input");
    everythingBox.type = "checkbox";
    everythingBox.checked = now.choices?.everything === "yes";
    everythingBox.addEventListener("change", () => {
      changes.everything = everythingBox.checked ? "yes" : "no";
      redraw();
    });
    everything.append(
      everythingBox,
      document.createTextNode("At least one of every kind of place (Massive worlds only)"),
    );
    function syncEverything() {
      const massive = (changes.size ?? now.size) === "massive";
      everything.style.display = massive ? "flex" : "none";
      if (!massive && everythingBox.checked) {
        everythingBox.checked = false;
        changes.everything = "no";
      }
    }
    syncEverything();
    // Vendors: how many of each trade, at least and at most.
    const vendorsHead = document.createElement("div");
    vendorsHead.style.cssText = "font-weight:700;font-size:12px;margin-top:4px;";
    vendorsHead.textContent = "Vendors: how many of each trade";
    const vendorsAbout = document.createElement("div");
    vendorsAbout.setAttribute("data-wanderworld-explain", "");
    vendorsAbout.style.cssText = "font-size:11px;opacity:0.75;line-height:1.35;";
    vendorsAbout.textContent =
      "At least: shops are built to make up the number (they take the place of houses). At most: any over it sell something else, or shut. Trades you set by hand under Vendors stand, and are counted. Empty: no say.";
    vendorsHead.prepend(info(vendorsAbout));
    const vendorBox = vendorCountsEditor(now.kinds, now.counts);
    const asked = () => {
      const { size: newSize = null, ...land } = changes;
      return { size: newSize, land };
    };
    // The map of what it will be: its own layout, or a new one (Reroll picks another).
    let seed = randomSeed();
    const map = mapCanvas(320, 240);
    const redraw = () =>
      handlers.onRegeneratePreview?.(map, {
        reshuffle: reshuffle.checked,
        size: asked().size,
        seed,
        changes: asked().land,
      });
    reshuffle.addEventListener("change", redraw);
    const reroll = button("Reroll", "Another new layout", () => {
      seed = randomSeed();
      reshuffle.checked = true;
      redraw();
    });
    reroll.style.cssText = INK_BUTTON;
    const yes = button("Regenerate", "Rebuild this world now", () => {
      drawRegenerate(false);
      handlers.onRegenerate(reshuffle.checked, asked().size, seed, asked().land, vendorBox.value());
    });
    yes.style.cssText = DANGER;
    const no = button("Cancel", "Keep the world as it is", () => drawRegenerate(false));
    no.style.cssText = INK_BUTTON;
    const buttons = document.createElement("div");
    buttons.style.cssText = "display:flex;gap:6px;";
    buttons.append(yes, no);
    regenerate.replaceChildren(
      warning,
      label,
      pickers,
      everything,
      vendorsHead,
      vendorsAbout,
      vendorBox.node,
      map,
      reroll,
      buttons,
    );
    redraw();
  };
  drawRegenerate(false);
  at("World", "Places");
  add(regenerate);
  // Token use: every setting that changes how much is sent to a model, in one place. Each is the same
  // setting as in its own section (addField): changed in either, it's changed in both.
  heading(
    "Token use",
    "Every setting that changes how many tokens Wanderworld spends, in one place. They are the same settings as in AI and People → Memory: change one here or there and it changes in both. Each AI call sends the speaker's card, your persona, the lore active where you stand, the recent chat and their memories, so fewer calls and less in each are the two ways to spend less.",
    ["How often", "How much", "Tips"],
  );
  at("Token use", "How often");
  intro("Each of these is one AI call when it happens. Off, the game uses its own written lines.");
  toggle("aiTalk", "AI conversations");
  toggle("aiMoments", "AI moments");
  toggle("aiArrive", "…when you arrive somewhere", "aiMoments");
  toggle("aiThings", "…when you use things", "aiMoments");
  toggle("aiBoard", "…when you read the noticeboard", "aiMoments");
  toggle("aiSeats", "…when you sit down", "aiMoments");
  toggle("aiJoin", "…when you join someone", "aiMoments");
  toggle("aiSeparate", "A separate call for each person who answers", "aiMoments");
  toggle("vendorAi", "The AI stocks shop shelves");
  choice("sheetTrack", "The AI updates your sheet", {
    off: "Off",
    moments: "After moments",
    all: "After moments and replies",
  });
  at("Token use", "How much");
  intro("What each call carries. Memories are usually the part that grows.");
  choice("replyLength", "Reply length", { short: "Short", medium: "Medium", long: "Long" });
  toggle("promptCache", "Order prompts for caching");
  toggle("memories", "People remember things");
  slider("memoryTold", "Everyday memories sent to the AI", 1, orAll, "memories");
  slider("memoryKeptTold", "Lasting memories sent to the AI", 1, orAll, "memories");
  toggle("memoryToldCounted", "Count personal limits against the total", "memories");
  sumUpRow();
  at("Token use", "Tips");
  for (const tip of [
    "Keep the shared memory totals low, and give the few people who matter numbers of their own in Journal → Edit people → Memory.",
    "Cards, personas and lore are sent whole, never cut. A narrator card goes with every moment and each listener's card with every moment they hear, so long cards cost more on every call.",
    "Lore tied to the whole world, or to you, goes with every call. Lore tied to a place or a person goes only there (Journal → Places, Journal → Lore).",
    "The AI assistant lists what it sent under each answer, and its memory requests show a rough count before you ask.",
    "To see exactly what was sent and how many tokens each call used, open Menu → Settings → Debug.",
  ])
    intro(`• ${tip}`);
  // The AI assistant: a chat about this world, which can change its lore and people (assistant.js).
  let assistant = null;
  /** Opens the assistant on a ready-made request; with `people` ([{ id, name }]) it's asked about theirs at once. */
  function assistantPick(pickId, people = null) {
    if (settingsPanel.style.display === "none") togglePanel(settingsPanel);
    showSection("AI assistant");
    assistant?.pick(pickId, people);
  }
  /** A button for the assistant's "Sum up old memories", where memories are set. */
  function sumUpRow() {
    const node = button(
      "Sum up old memories…",
      "The AI assistant proposes one lasting memory in place of several old everyday ones",
      () => assistantPick("memory-sum"),
    );
    node.style.alignSelf = "flex-start";
    const explain = document.createElement("div");
    explain.setAttribute("data-wanderworld-explain", "");
    explain.style.cssText = "font-size:11px;opacity:0.7;margin:-4px 0 2px;line-height:1.3;";
    explain.textContent =
      "The AI assistant reads the memories of whoever you choose and proposes one lasting memory in place of several old ones, so less is kept and less is sent. You approve every change, and can undo it. One AI call.";
    add(node, explain);
  }
  heading("AI assistant");
  {
    const about = document.createElement("div");
    about.style.cssText = `font-size:12px;line-height:1.4;color:${INK_SOFT};`;
    about.textContent =
      "Ask about the world you're in, or ask for a change to it. You see every change first, can rewrite it or leave it out, and nothing happens until you press Confirm; Undo takes it back. It never touches your cards, personas or lorebooks in the Engine. Not sure what to ask? The buttons under the chat are ready-made requests, and Help lists everything it can do.";
    add(
      about,
      (assistant = createAssistant({
        onAsk: (history, options) => handlers.onAssistant(history, options),
        onChat: (turns) => handlers.onAssistantChat?.(turns),
        onLorebooks: () => handlers.onAssistantBooks?.() ?? Promise.resolve([]),
        onMemoryPeople: () => handlers.onAssistantMemories?.() ?? [],
      })),
    );
  }
  // Debug: every AI call since the Engine started, with its tokens, and their totals (server.mjs's call log).
  heading(
    "Debug",
    "Every AI call Wanderworld has made since the Engine started: what was sent, what came back and the tokens it used. It's kept in memory only (the newest 50 calls, gone when the Engine restarts) and never holds a key. Scenes aren't listed: they're Engine chats.",
    ["Overview", "Calls"],
  );
  const debugBar = document.createElement("div");
  debugBar.style.cssText = "display:flex;flex-wrap:wrap;gap:6px;align-items:center;";
  const debugState = document.createElement("span");
  debugState.style.cssText = `font-size:11px;color:${INK_SOFT};`;
  const inkSmall = (label, onClick) => {
    const node = document.createElement("button");
    node.type = "button";
    node.textContent = label;
    node.style.cssText = INK_SMALL;
    node.addEventListener("click", onClick);
    return node;
  };
  debugBar.append(
    inkSmall("Refresh", () => void refreshDebug()),
    inkSmall("Reset", async () => {
      await handlers.onDebugClear?.().catch(() => null);
      void refreshDebug();
    }),
    debugState,
  );
  add(debugBar);
  const debugPart = (sub) => {
    at("Debug", sub);
    const node = document.createElement("div");
    node.style.cssText = "display:flex;flex-direction:column;gap:3px;font-size:12px;line-height:1.4;";
    add(node);
    return node;
  };
  const debugOverview = debugPart("Overview");
  const debugCalls = debugPart("Calls");
  const count = (value) => Math.round(value ?? 0).toLocaleString();
  const seconds = (ms) => `${(ms / 1000).toFixed(1)} s`;
  const timeOf = (at) => new Date(at).toLocaleTimeString();
  /** A row of the log: what it is on the left, its value on the right. */
  const debugRow = (label, value, indent = false) => {
    const row = document.createElement("div");
    row.style.cssText = `display:flex;justify-content:space-between;gap:12px;${indent ? "padding-left:12px;opacity:0.85;" : ""}`;
    const left = document.createElement("span");
    left.textContent = label;
    const right = document.createElement("span");
    right.style.cssText = "font-variant-numeric:tabular-nums;text-align:right;";
    right.textContent = value;
    row.append(left, right);
    return row;
  };
  const debugNote = (text) => {
    const node = document.createElement("div");
    node.style.cssText = `font-size:11px;color:${INK_SOFT};margin-top:4px;`;
    node.textContent = text;
    return node;
  };
  const debugWords = (title, text) => {
    const head = document.createElement("div");
    head.style.cssText = "font-weight:600;margin-top:6px;";
    head.textContent = title;
    const body = document.createElement("pre");
    body.style.cssText =
      "margin:0;padding:6px;white-space:pre-wrap;overflow-wrap:anywhere;max-height:260px;overflow:auto;font:11px/1.4 ui-monospace,monospace;background:rgba(107,74,43,0.1);border-radius:6px;user-select:text;";
    body.textContent = text || "(nothing)";
    return [head, body];
  };
  const money = (amount, currency = "USD") => {
    const digits = Math.abs(amount) < 0.01 ? 6 : Math.abs(amount) < 1 ? 4 : 2;
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        currencyDisplay: "narrowSymbol",
        minimumFractionDigits: 2,
        maximumFractionDigits: digits,
      }).format(amount);
    } catch {
      return `${amount.toFixed(digits)} ${currency}`; // not a currency the browser knows
    }
  };
  /** A call's token counts, one to a row; or that there are none. */
  const usageRows = (usage) =>
    usage
      ? [
          debugRow("Tokens sent (prompt)", count(usage.prompt)),
          debugRow("read from the cache", usage.cached === null ? "not reported" : count(usage.cached), true),
          debugRow("written to the cache", usage.cacheWrite === null ? "not reported" : count(usage.cacheWrite), true),
          debugRow("Tokens received (completion)", count(usage.completion)),
          debugRow("of them reasoning", usage.reasoning === null ? "not reported" : count(usage.reasoning), true),
          debugRow("Tokens in total", count(usage.total)),
          ...(usage.cost === null ? [] : [debugRow("Cost (reported)", money(usage.cost))]),
        ]
      : [debugNote("This connection reported no token counts for this call.")];
  /** One call of the list: its line, and when opened everything about it (read then). */
  const debugCall = (call) => {
    const fold = document.createElement("details");
    fold.style.cssText = "border-top:1px solid rgba(107,74,43,0.25);padding:4px 0;";
    const line = document.createElement("summary");
    line.style.cssText = "cursor:pointer;";
    const tokens = call.usage
      ? `${count(call.usage.prompt)} in${call.usage.cached ? ` (${count(call.usage.cached)} cached)` : ""}, ${count(call.usage.completion)} out`
      : call.kind === "image"
        ? call.note
        : "no token counts";
    line.textContent = [
      timeOf(call.at),
      call.what,
      call.model,
      call.error ? "FAILED" : tokens,
      ...(call.estimate ? [`about ${money(call.estimate.amount, call.estimate.currency)}`] : []),
      seconds(call.ms),
    ].join(" · ");
    if (call.error) line.style.color = "#8a1f11";
    fold.append(line);
    fold.addEventListener("toggle", async () => {
      if (!fold.open || fold.dataset.read) return;
      fold.dataset.read = "1";
      const body = document.createElement("div");
      body.style.cssText = "display:flex;flex-direction:column;gap:3px;padding:4px 0 6px;";
      fold.append(body);
      const rows = [
        debugRow("Request", `${call.what}, ${timeOf(call.at)}`),
        debugRow(call.kind === "image" ? "Connection's model" : "Model", call.model),
        ...(call.kind === "image"
          ? [debugRow("Result", call.note || "?")]
          : [
              debugRow("Temperature", String(call.temperature ?? "the connection's")),
              debugRow(
                "Most tokens allowed back",
                call.maxTokens === null ? "the connection's" : count(call.maxTokens),
              ),
              debugRow("Characters sent / received", `${count(call.sent)} / ${count(call.got)}`),
              debugRow("How it ended", call.finish === "length" ? "cut off at the token limit" : call.finish || "?"),
            ]),
        debugRow("Took", seconds(call.ms)),
        ...(call.kind === "image" ? [] : usageRows(call.usage)),
        ...(call.estimate
          ? [
              debugRow("Cost (estimated)", `about ${money(call.estimate.amount, call.estimate.currency)}`),
              debugRow(
                "by the model's prices",
                Object.entries({
                  prompt: "in",
                  completion: "out",
                  cacheRead: "cache read",
                  cacheWrite: "cache write",
                  perCall: "a call",
                })
                  .filter(([key]) => call.estimate.rates?.[key] !== null && call.estimate.rates?.[key] !== undefined)
                  .map(([key, label]) => `${label} ${money(call.estimate.rates[key], call.estimate.currency)}`)
                  .join(", ") + (call.estimate.rates?.perCall === null ? " per 1M tokens" : ""),
                true,
              ),
            ]
          : []),
        ...(call.error ? debugWords("Error", call.error) : []),
      ];
      body.append(...rows);
      try {
        const whole = await handlers.onDebugCall?.(call.id);
        for (const message of whole?.messages ?? [])
          body.append(...debugWords(`Sent: ${message.role}`, message.content));
        if (call.kind !== "image") body.append(...debugWords("Received", whole?.reply ?? ""));
      } catch (error) {
        body.append(debugNote(error?.message ?? "Couldn't read this call."));
      }
    });
    return fold;
  };
  async function refreshDebug() {
    debugState.textContent = "Reading…";
    let log;
    try {
      log = await handlers.onDebugLog?.();
    } catch (error) {
      debugState.textContent = error?.message ?? "Couldn't read the log.";
      return;
    }
    if (!log?.totals) {
      debugState.textContent = "Not available here.";
      return;
    }
    const sum = log.totals;
    debugState.textContent = `As of ${timeOf(Date.now())}`;
    const share = sum.prompt ? ` (${Math.round((sum.cached / sum.prompt) * 100)}% of what was sent)` : "";
    debugOverview.replaceChildren(
      debugRow("Requests sent", count(sum.requests)),
      debugRow("Answers received", count(sum.responses)),
      debugRow("Failed", count(sum.failed)),
      debugRow("Cut off at the token limit", count(sum.cutOff)),
      debugRow("Tokens in total", count(sum.total)),
      debugRow("Tokens sent (prompt)", count(sum.prompt)),
      debugRow("read from the cache", sum.cacheKnown ? `${count(sum.cached)}${share}` : "not reported", true),
      debugRow("written to the cache", sum.cacheKnown ? count(sum.cacheWrite) : "not reported", true),
      debugRow("Tokens received (completion)", count(sum.completion)),
      debugRow("of them reasoning", count(sum.reasoning), true),
      debugRow(
        sum.cost === null ? "Cost (estimated)" : "Cost (reported)",
        sum.cost !== null
          ? money(sum.cost)
          : sum.priced
            ? `about ${money(sum.estimate, sum.currency)}`
            : "no prices known",
      ),
      debugRow("Time spent waiting", seconds(sum.ms)),
      debugRow(
        "Pictures asked for",
        `${count(sum.pictures)}${sum.picturesFailed ? ` (${count(sum.picturesFailed)} failed)` : ""}`,
      ),
      ...Object.entries(sum.byKind)
        .sort((a, b) => b[1].total - a[1].total || b[1].requests - a[1].requests)
        .map(([what, kind], at) =>
          debugRow(
            `${at ? "" : "By kind of call: "}${what}`,
            `${count(kind.requests)} ${kind.requests === 1 ? "call" : "calls"}, ${count(kind.total)} tokens`,
            at > 0,
          ),
        ),
      debugNote(
        `Counted since ${new Date(sum.since).toLocaleString()}. "Reset" empties the log and starts the count again.`,
      ),
      ...(sum.responses > sum.counted
        ? [
            debugNote(
              `${count(sum.responses - sum.counted)} of ${count(sum.responses)} answers came without token counts: the connection that gave them doesn't report any, so the totals leave them out.`,
            ),
          ]
        : []),
      ...(sum.counted && !sum.cacheKnown
        ? [
            debugNote(
              "No answer said how much was read from a cache: the connection doesn't report it, or doesn't cache.",
            ),
          ]
        : []),
      ...(sum.cost === null
        ? [
            debugNote(
              sum.priced
                ? `The cost is an estimate: each call's token counts times the prices in its connection's model list, the ones the Engine's model picker shows. It isn't the provider's bill, which the Engine doesn't pass on to Agents. ${count(sum.priced)} of ${count(sum.counted)} counted calls had prices.`
                : "No cost estimate yet. It needs a call with token counts, on a connection whose model list has prices (the ones the Engine's model picker shows). What a provider actually charged isn't passed on to Agents by the Engine.",
            ),
          ]
        : []),
      debugNote("Pictures have no token counts: an image connection is paid for by the picture, not by the token."),
    );
    debugCalls.replaceChildren(
      ...(log.calls.length
        ? log.calls.map(debugCall)
        : [debugNote("No calls yet. Talk to someone, or let something happen near you, then press Refresh.")]),
      ...(log.calls.length >= log.kept
        ? [debugNote(`Only the newest ${log.kept} calls are kept. The totals count all of them.`)]
        : []),
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
    add(fold);
  }
  // Credits and thanks.
  heading("Credits");
  for (const part of CREDITS) {
    const title = document.createElement("div");
    title.style.cssText = `font:700 14px ${SERIF};margin-top:8px;`;
    title.textContent = part.title;
    add(title);
    for (const words of part.lines) {
      const line = document.createElement("div");
      line.style.cssText = "font-size:12px;line-height:1.45;margin-top:4px;";
      line.textContent = words;
      add(line);
    }
  }

  // The Journal: where everyone is, places and their lore.
  const journalHandlers = {
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
    onMoveHome: (zoneId, bring) => handlers.onMoveHome?.(zoneId, bring),
    onMoveIn: (id) => handlers.onMoveIn?.(id),
    onMoveOut: (id) => handlers.onMoveOut?.(id),
    onInviteOver: (id) => handlers.onInviteOver?.(id),
    onFurnish: (piece) => handlers.onFurnish?.(piece),
    onUnfurnish: (index) => handlers.onUnfurnish?.(index),
    onPicture: () => handlers.onPicture?.(),
    onMap: (canvas, view) => handlers.onMap?.(canvas, view),
    onWaypoint: (at) => handlers.onWaypoint?.(at),
  };
  const journal = createJournal(PANEL, journalHandlers, (id) => id !== "map");
  // The Map: the Journal's map in a window of its own, with a button of its own.
  const mapView = createJournal(PANEL, journalHandlers, (id) => id === "map");
  panels.push(journal.panel, mapView.panel);
  const mapButton = button("Map", "The map of where you are: places, you, and where each edge leads", () =>
    togglePanel(mapView.panel),
  );
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
  // Settings → World → Vendors: every vendor in this world, with its trades to tick, and the empty houses
  // that can be made shops of. Drawn when the tab is shown (showSection).
  at("World", "Vendors");
  const vendorsBox = document.createElement("div");
  vendorsBox.style.cssText = "display:flex;flex-direction:column;gap:5px;font-size:12px;line-height:1.4;";
  add(vendorsBox);
  function refreshVendors() {
    const now = handlers.onVendors?.() ?? { vendors: [], vacant: [], kinds: [], trades: [] };
    const again = (work) => () => {
      work();
      refreshVendors();
    };
    const set = (id, kinds) => again(() => handlers.onVendorKinds?.(id, kinds))();
    const line = (placeholder, value, onChange) => {
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = placeholder;
      input.value = value;
      input.setAttribute("aria-label", placeholder);
      input.style.cssText = `${INK_INPUT}width:100%;padding:2px 6px;box-sizing:border-box;`;
      input.addEventListener("change", () => onChange(input.value.trim()));
      return input;
    };
    const area = (placeholder, value, onChange, rows = 2) => {
      const input = document.createElement("textarea");
      input.rows = rows;
      input.placeholder = placeholder;
      input.value = value;
      input.setAttribute("aria-label", placeholder);
      input.style.cssText = `${INK_INPUT}width:100%;padding:3px 6px;box-sizing:border-box;resize:vertical;font:12px system-ui,sans-serif;`;
      input.addEventListener("change", () => onChange(input.value.trim()));
      return input;
    };
    const fold = (title, open, onToggle, ...children) => {
      const node = document.createElement("details");
      node.open = open;
      node.style.cssText = "margin-top:6px;border-top:1px solid rgba(107,74,43,0.25);padding-top:4px;";
      node.addEventListener("toggle", () => onToggle(node.open));
      const head = document.createElement("summary");
      head.style.cssText = "cursor:pointer;font-weight:700;";
      head.textContent = title;
      const list = piece("display:flex;flex-direction:column;gap:5px;margin-top:4px;");
      list.append(...children);
      node.append(head, list);
      return node;
    };
    const nodes = [
      debugNote(
        "Every building and market stall that buys and sells in this world. Tick the trades a vendor has: one can be several at once. Give one a name and its sign says it; without a name its sign says its trade. If a world came without a trade you want, add it here, or make a shop of an empty house below. What a vendor stocks follows its trades when it next restocks.",
      ),
    ];
    if (!now.kinds.length) nodes.push(debugNote("Open a world to see its vendors."));
    for (const vendor of now.vendors) {
      const box = piece(
        "border-top:1px solid rgba(107,74,43,0.25);padding-top:4px;display:flex;flex-direction:column;gap:3px;",
      );
      box.append(piece("font-weight:600;", `${vendor.name}${vendor.kinds.length ? "" : " · not trading"}`));
      const ticks = piece("display:flex;flex-wrap:wrap;gap:2px 10px;");
      for (const kind of now.kinds) {
        const label = document.createElement("label");
        label.style.cssText = "display:flex;align-items:center;gap:4px;cursor:pointer;";
        const tick = document.createElement("input");
        tick.type = "checkbox";
        tick.checked = vendor.kinds.includes(kind.id);
        tick.addEventListener("change", () =>
          set(vendor.id, tick.checked ? [...vendor.kinds, kind.id] : vendor.kinds.filter((id) => id !== kind.id)),
        );
        label.append(tick, kind.label);
        ticks.append(label);
      }
      box.append(ticks);
      if (vendor.canName)
        box.append(
          line("Its own name (its sign says this)", vendor.own, (name) =>
            again(() => handlers.onRenameZone?.(vendor.id, name))(),
          ),
        );
      box.append(
        area("For the AI: what this vendor in particular should stock", vendor.guidance, (text) =>
          again(() => handlers.onVendorGuidance?.(vendor.id, text))(),
        ),
      );
      if (vendor.set) {
        const back = inkSmall("Back to its own trade", () => set(vendor.id, null));
        back.style.alignSelf = "flex-start";
        box.append(back);
      }
      nodes.push(box);
    }
    if (now.vacant.length) {
      const houses = now.vacant.map((house) => {
        const row = piece("display:flex;align-items:center;gap:6px;flex-wrap:wrap;");
        const trade = document.createElement("select");
        trade.style.cssText = `${INK_INPUT}padding:2px 4px;`;
        trade.setAttribute("aria-label", `A trade for ${house.name}`);
        for (const kind of now.kinds) {
          const option = document.createElement("option");
          option.value = kind.id;
          option.textContent = kind.label;
          trade.append(option);
        }
        row.append(
          piece("flex:1;min-width:90px;", house.name),
          trade,
          inkSmall("Make it a shop", () => set(house.id, [trade.value])),
        );
        return row;
      });
      nodes.push(
        fold(
          `Empty houses (${now.vacant.length})`,
          vendorsVacantOpen,
          (open) => (vendorsVacantOpen = open),
          debugNote("Nobody lives in these. Pick a trade and the house becomes a shop of that kind."),
          ...houses,
        ),
      );
    }
    // The trades themselves: what each is told to stock, and trades of your own.
    if (now.kinds.length) {
      const boxes = now.trades.map((trade) => {
        const box = piece(
          "border-top:1px solid rgba(107,74,43,0.25);padding-top:4px;display:flex;flex-direction:column;gap:3px;",
        );
        box.append(piece("font-weight:600;", `${trade.label}${trade.custom ? " · yours" : ""}`));
        if (trade.custom)
          box.append(
            line("Its name", trade.label, (label) => label && again(() => handlers.onTrade?.(trade.id, { label }))()),
          );
        box.append(
          area("For the AI: what this trade stocks", trade.guidance, (guidance) =>
            again(() => handlers.onTrade?.(trade.id, { guidance }))(),
          ),
        );
        if (trade.custom)
          box.append(
            area(
              "Its goods without the AI, one to a line: Name, price, what it is",
              trade.goods,
              (goods) => again(() => handlers.onTrade?.(trade.id, { goods }))(),
              3,
            ),
          );
        if (trade.custom || trade.changed) {
          const remove = inkSmall(trade.custom ? "Delete trade" : "Back to the usual guidance", () => {
            if (trade.custom && !remove.dataset.sure) {
              remove.dataset.sure = "1";
              remove.textContent = "Delete it? Tap again";
              return;
            }
            again(() => handlers.onTrade?.(trade.id, null))();
          });
          remove.style.alignSelf = "flex-start";
          box.append(remove);
        }
        return box;
      });
      const name = line("A new trade's name", "", () => {});
      const guidance = area("For the AI: what it stocks", "", () => {});
      const goods = area("Its goods without the AI, one to a line: Name, price, what it is", "", () => {}, 3);
      const add = inkSmall("Add this trade", () => {
        if (!name.value.trim()) return;
        again(() => handlers.onTrade?.(null, { label: name.value, guidance: guidance.value, goods: goods.value }))();
      });
      add.style.alignSelf = "flex-start";
      nodes.push(
        fold(
          `Trades (${now.trades.length})`,
          vendorsTradesOpen,
          (open) => (vendorsTradesOpen = open),
          debugNote(
            'What each trade stocks. The guidance is what the AI is told when "The AI stocks shop shelves" is on: rewrite it to change what it comes up with. A trade of your own needs a name; give it guidance for the AI, goods for when the AI is off, or both. Then tick it on a vendor above.',
          ),
          ...boxes,
          piece("font-weight:700;margin-top:6px;", "A trade of your own"),
          name,
          guidance,
          goods,
          add,
        ),
      );
    }
    vendorsBox.replaceChildren(...nodes);
  }
  // A shop's window (vendor.js): what it sells and what it would buy of yours, opened from the chat window
  // when you're at a vendor's door or inside.
  const shopPanel = document.createElement("div");
  shopPanel.setAttribute("data-wanderworld-ui", "");
  shopPanel.style.cssText = PANEL;
  shopPanel.style.display = "none";
  shopPanel.style.minWidth = "min(344px, calc(100% - 16px))";
  panels.push(shopPanel);
  let shopTab = "buy";
  let shopNote = "";
  let shopDrawn = 0;
  async function drawShop() {
    const drawn = ++shopDrawn;
    const answer = await Promise.resolve(handlers.onShop?.()).catch(() => null);
    if (drawn !== shopDrawn) return;
    const body = piece("display:flex;flex-direction:column;gap:5px;font-size:12px;line-height:1.4;");
    if (!answer?.open) {
      body.append(debugNote("There's no shop here now. Go to a vendor's door, or inside, while it's open."));
      return void shopPanel.replaceChildren(body);
    }
    body.append(
      piece(`font:700 15px ${SERIF};`, answer.name),
      piece(`color:${INK_SOFT};font-size:11px;`, answer.kinds.join(", ")),
      piece("font-weight:700;", `Your purse: ${answer.purse.amount} ${answer.purse.name}`),
    );
    if (!answer.ready) {
      body.append(
        debugNote(
          "Buying and selling uses your inventory, which the Quartermaster package keeps. Install it from Agents → Download Agents and turn on Settings → Inventory.",
        ),
      );
      return void shopPanel.replaceChildren(body);
    }
    // Haggling: once a day here. What it came to is said for the rest of the day.
    if (answer.haggle?.on) {
      const row = piece("display:flex;align-items:center;gap:6px;flex-wrap:wrap;");
      const go = inkSmall("Haggle", async () => {
        shopNote = "";
        try {
          await handlers.onHaggle?.();
        } catch (error) {
          shopNote = error?.message ?? "That couldn't be done.";
        }
        void drawShop();
      });
      go.title = "A Charisma check, once a day here: it may lower the prices, or raise them";
      go.disabled = answer.haggle.done;
      if (answer.haggle.done) go.style.cssText += "opacity:0.5;cursor:default;";
      const off = Math.round((1 - answer.haggle.factor) * 100);
      row.append(
        go,
        piece(
          `color:${INK_SOFT};font-size:11px;flex:1;`,
          !answer.haggle.done
            ? "Once a day: a Charisma check."
            : off > 0
              ? `Haggled today: prices are ${off}% lower, and it pays ${off}% more.`
              : off < 0
                ? `Haggled today, badly: prices are ${-off}% higher, and it pays ${-off}% less.`
                : "Haggled today: the prices stand.",
        ),
      );
      body.append(row);
    }
    const tabs = piece("display:flex;gap:4px;");
    for (const [id, label] of [
      ["buy", "Buy"],
      ["sell", "Sell"],
    ]) {
      const tab = inkSmall(label, () => {
        shopTab = id;
        shopNote = "";
        void drawShop();
      });
      tab.style.cssText += `font-size:12px;padding:3px 10px;opacity:${id === shopTab ? "1" : "0.6"};${id === shopTab ? "font-weight:700;" : ""}`;
      tab.setAttribute("aria-pressed", String(id === shopTab));
      tabs.append(tab);
    }
    body.append(tabs);
    if (shopNote) body.append(debugNote(shopNote));
    const trade = (work) => async () => {
      shopNote = "";
      try {
        await work();
      } catch (error) {
        shopNote = error?.message ?? "That couldn't be done.";
      }
      void drawShop();
    };
    const row = (title, about, price, label, onClick, can) => {
      const box = piece(
        "border-top:1px solid rgba(107,74,43,0.25);padding-top:4px;display:flex;gap:6px;align-items:flex-start;",
      );
      const words = piece("flex:1;min-width:0;display:flex;flex-direction:column;gap:1px;");
      words.append(piece("font-weight:600;", title));
      if (about) words.append(piece(`color:${INK_SOFT};font-size:11px;`, about));
      const act = inkSmall(`${label} · ${price}`, onClick);
      act.disabled = !can;
      if (!can) act.style.cssText += "opacity:0.5;cursor:default;";
      box.append(words, act);
      return box;
    };
    if (shopTab === "buy") {
      if (!answer.stock.length) body.append(debugNote("The shelves are bare until it restocks."));
      for (const item of answer.stock)
        body.append(
          row(
            `${item.name}${item.quantity > 1 ? ` (${item.quantity} left)` : ""}`,
            item.description,
            item.price,
            "Buy",
            trade(() => handlers.onBuy?.(item.name)),
            answer.purse.amount >= item.price,
          ),
        );
    } else {
      if (!answer.sell.length) body.append(debugNote("You carry nothing to sell."));
      for (const item of answer.sell)
        body.append(
          row(
            `${item.name}${item.quantity > 1 ? ` ×${item.quantity}` : ""}${item.worn ? " · worn" : ""}`,
            item.price > 0 ? "" : "No use for it here.",
            item.price,
            "Sell one",
            trade(() => handlers.onSell?.(item.id)),
            item.price > 0,
          ),
        );
      body.append(
        debugNote("A shop pays half what a thing is worth for what it deals in, and a quarter for anything else."),
      );
    }
    shopPanel.replaceChildren(body);
  }
  // The Inventory window, in tabs: what you carry (Quartermaster's items, with something to do with each),
  // your character sheet, and Quartermaster's own window.
  const inventoryPanel = document.createElement("div");
  inventoryPanel.setAttribute("data-wanderworld-ui", "");
  inventoryPanel.style.cssText = PANEL;
  inventoryPanel.style.display = "none";
  inventoryPanel.style.minWidth = "min(344px, calc(100% - 16px))";
  panels.push(inventoryPanel);
  let inventoryTab = "items";
  let inventoryNote = "";
  let inventoryDrawn = 0;
  let sheetOffOpen = false; // whether the sheet's "Not in use" fold is open
  let craftOwnOpen = false; // and the Craft tab's "Make something new"
  let vendorsVacantOpen = false; // and Settings → World → Vendors' "Empty houses"
  let vendorsTradesOpen = false; // and its "Trades"
  // The sheet's own copies of its two AI settings (the same settings as in Settings: changed in either, changed in both).
  const sheetSettings = { sheetTold: true, sheetTrack: "off" };
  for (const name of Object.keys(sheetSettings))
    addField(name, {
      set: (value) => {
        sheetSettings[name] = value;
      },
    });
  const piece = (css, text = "") => {
    const node = document.createElement("div");
    node.style.cssText = css;
    node.textContent = text;
    return node;
  };
  async function drawInventory() {
    const drawn = ++inventoryDrawn;
    const tabs = piece("display:flex;gap:4px;flex-wrap:wrap;margin-bottom:4px;");
    for (const [id, label] of [
      ["items", "Items"],
      ["craft", "Craft"],
      ["sheet", "Sheet"],
      ["hotkeys", "Hotkeys"],
      ["quartermaster", "Quartermaster"],
    ]) {
      const tab = inkSmall(label, () => {
        inventoryTab = id;
        inventoryNote = "";
        void drawInventory();
      });
      tab.style.cssText += `font-size:12px;padding:3px 10px;opacity:${id === inventoryTab ? "1" : "0.6"};${id === inventoryTab ? "font-weight:700;" : ""}`;
      tab.setAttribute("aria-pressed", String(id === inventoryTab));
      tabs.append(tab);
    }
    const body = piece("display:flex;flex-direction:column;gap:5px;font-size:12px;line-height:1.4;");
    if (inventoryNote) body.append(debugNote(inventoryNote));
    if (inventoryTab === "sheet") drawSheet(body);
    else if (inventoryTab === "hotkeys") {
      // The number keys, each with what it does: a spell to cast, something to use, something to put on or take off.
      body.append(debugNote("Reading…"));
      inventoryPanel.replaceChildren(tabs, body);
      const answer = await Promise.resolve(handlers.hotkeys?.()).catch(() => null);
      if (drawn !== inventoryDrawn) return;
      body.replaceChildren(
        debugNote(
          "Each number key does one thing of your choosing: casts a spell from your sheet, uses up something you carry (a potion, food), or puts something on and takes it off again (a weapon, armour, clothing). Only things with a slot in Quartermaster can be put on: give an item its slot in the Quartermaster tab. On a touch screen, and with a mouse, the same are buttons in the chat window.",
        ),
      );
      for (const key of "1234567890") {
        const row = piece("display:flex;align-items:center;gap:6px;");
        const choose = document.createElement("select");
        choose.style.cssText = `${INK_INPUT}padding:2px 4px;flex:1;min-width:0;`;
        choose.setAttribute("aria-label", `What ${key} does`);
        const groups = new Map();
        const none = document.createElement("option");
        none.value = "";
        none.textContent = "Nothing";
        choose.append(none);
        const now = answer?.slots?.[key] ?? "";
        for (const option of answer?.options ?? []) {
          if (!groups.has(option.group)) {
            const group = document.createElement("optgroup");
            group.label = option.group;
            groups.set(option.group, group);
            choose.append(group);
          }
          const node = document.createElement("option");
          node.value = option.value;
          node.textContent = option.label;
          groups.get(option.group).append(node);
        }
        // (Something set that isn't there any more, an item used up or a spell deleted, is still shown as set.)
        if (now && ![...choose.options].some((option) => option.value === now)) {
          const gone = document.createElement("option");
          gone.value = now;
          gone.textContent = `${now.slice(now.indexOf(":") + 1)} (not there now)`;
          choose.append(gone);
        }
        choose.value = now;
        choose.addEventListener("change", () => handlers.onSetHotkey?.(key, choose.value));
        row.append(piece("font-weight:700;width:14px;", key), choose);
        body.append(row);
      }
    } else if (inventoryTab === "quartermaster") {
      body.append(
        debugNote(
          "Quartermaster's own window: slots, outfits, item pictures, hidden items and everything else it does. It is the same sheet as the Items tab, so a change in either shows in both.",
        ),
        inkSmall("Open Quartermaster's window", () => handlers.onInventory?.()),
      );
    } else {
      body.append(debugNote("Reading…"));
      inventoryPanel.replaceChildren(tabs, body);
      const crafting = inventoryTab === "craft";
      const answer = await Promise.resolve(crafting ? handlers.onRecipes?.() : handlers.onItems?.()).catch(() => null);
      if (drawn !== inventoryDrawn) return; // drawn again meanwhile
      body.replaceChildren(...(inventoryNote ? [debugNote(inventoryNote)] : []));
      if (crafting) drawCraft(body, answer);
      else drawItems(body, answer);
    }
    if (drawn === inventoryDrawn) inventoryPanel.replaceChildren(tabs, body);
  }
  /** Runs something to do with a recipe, then shows the tab again (with why it couldn't be done, if so). */
  const withRecipe = (work) => async () => {
    inventoryNote = "";
    try {
      await work();
    } catch (error) {
      inventoryNote = error?.message ?? "That couldn't be done.";
    }
    void drawInventory();
  };
  function drawCraft(body, answer) {
    if (!answer?.ready) {
      body.append(
        debugNote(
          "Crafting uses the things you carry, which the Quartermaster package keeps. Install it from Agents → Download Agents and turn on Settings → Inventory.",
        ),
      );
      return;
    }
    body.append(
      debugNote(
        "Make things out of what you carry. A recipe you can make has its button lit; the numbers are what you have of what it needs. New recipes come as your level rises, and you can save your own at the bottom.",
      ),
    );
    const ready = answer.recipes.filter((recipe) => recipe.can);
    const rest = answer.recipes.filter((recipe) => !recipe.can);
    for (const recipe of [...ready, ...rest]) {
      const box = piece(
        `border-top:1px solid rgba(107,74,43,0.25);padding-top:4px;display:flex;flex-direction:column;gap:2px;${recipe.can ? "" : "opacity:0.7;"}`,
      );
      box.append(
        piece(
          "font-weight:600;",
          `${recipe.name}${recipe.makes > 1 ? ` ×${recipe.makes}` : ""}${recipe.own ? " · yours" : ""}`,
        ),
      );
      if (recipe.description) box.append(piece(`color:${INK_SOFT};font-size:11px;`, recipe.description));
      box.append(
        piece(
          "font-size:11px;",
          `Needs: ${recipe.needs.map((need) => `${need.name} ${Math.min(need.have, 999)}/${need.quantity}`).join(", ")}`,
        ),
      );
      const actions = piece("display:flex;gap:4px;flex-wrap:wrap;");
      const make = inkSmall(
        "Make",
        withRecipe(() => handlers.onCraft?.(recipe.id)),
      );
      make.disabled = !recipe.can;
      if (!recipe.can) make.style.cssText += "opacity:0.5;cursor:default;";
      actions.append(make);
      if (recipe.own) {
        const forget = inkSmall("Delete recipe", () => {
          if (forget.dataset.sure) {
            handlers.onForgetRecipe?.(recipe.id);
            return void drawInventory();
          }
          forget.dataset.sure = "1";
          forget.textContent = "Delete it? Tap again";
        });
        actions.append(forget);
      }
      box.append(actions);
      body.append(box);
    }
    if (answer.locked)
      body.append(
        debugNote(`${answer.locked} more ${answer.locked === 1 ? "recipe comes" : "recipes come"} at higher levels.`),
      );
    // Something new: what goes in, what it's called and what it is; saved, that is its recipe from then on.
    const fold = document.createElement("details");
    fold.open = craftOwnOpen;
    fold.style.cssText = "margin-top:6px;border-top:1px solid rgba(107,74,43,0.25);padding-top:4px;";
    fold.addEventListener("toggle", () => (craftOwnOpen = fold.open));
    const title = document.createElement("summary");
    title.style.cssText = "cursor:pointer;font-weight:700;";
    title.textContent = "Make something new";
    const form = piece("display:flex;flex-direction:column;gap:4px;margin-top:4px;");
    form.append(
      debugNote(
        'Say how many of each thing goes in, name what comes of it and describe it, then save. From then on it is a recipe that needs those same things. A description can say what it does: "+10 HP when eaten", "+1 AC", "Weapon: 1d6 damage".',
      ),
    );
    const puts = [];
    if (!answer.items.length) form.append(debugNote("You carry nothing to make anything from yet."));
    for (const item of answer.items) {
      const row = piece("display:flex;align-items:center;gap:6px;");
      const amount = document.createElement("input");
      amount.type = "number";
      amount.inputMode = "numeric";
      amount.min = "0";
      amount.max = String(item.quantity);
      amount.value = "0";
      amount.setAttribute("aria-label", `How many ${item.name} go in`);
      amount.style.cssText = `${INK_INPUT}width:52px;text-align:right;padding:2px 4px;`;
      row.append(amount, piece("flex:1;min-width:0;", `${item.name} (you have ${item.quantity})`));
      form.append(row);
      puts.push([item.name, amount]);
    }
    const text = (placeholder, width) => {
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = placeholder;
      input.setAttribute("aria-label", placeholder);
      input.style.cssText = `${INK_INPUT}width:${width};padding:2px 6px;box-sizing:border-box;`;
      return input;
    };
    const name = text("What it's called", "100%");
    const about = text("What it is and does", "100%");
    const makes = text("Makes how many (1)", "150px");
    makes.inputMode = "numeric";
    const made = () => ({
      name: name.value,
      description: about.value,
      makes: Number(makes.value) || 1,
      needs: puts
        .map(([item, amount]) => ({ name: item, quantity: Math.round(Number(amount.value)) || 0 }))
        .filter((need) => need.quantity > 0),
    });
    const buttons = piece("display:flex;gap:4px;flex-wrap:wrap;");
    buttons.append(
      inkSmall(
        "Save recipe",
        withRecipe(() => handlers.onSaveRecipe?.(made(), false)),
      ),
      inkSmall(
        "Save and make it",
        withRecipe(() => handlers.onSaveRecipe?.(made(), true)),
      ),
    );
    form.append(name, about, makes, buttons);
    fold.append(title, form);
    body.append(fold);
  }
  /** Runs something done with an item, then shows the list again (with why it couldn't be done, if so). */
  const withItem = (id, action) => async () => {
    inventoryNote = "";
    try {
      await handlers.onItemAction?.(id, action);
    } catch (error) {
      inventoryNote = error?.message ?? "That couldn't be done.";
    }
    void drawInventory();
  };
  function drawItems(body, answer) {
    if (!answer?.ready) {
      body.append(
        debugNote(
          "Items are kept by the Quartermaster package. Install it from Agents → Download Agents and turn on Settings → Inventory, and what you carry shows here. The Sheet tab works without it.",
        ),
      );
      return;
    }
    // The purse: the item named for this world's money. Its name is yours to change.
    {
      const row = piece("display:flex;align-items:center;gap:6px;");
      const name = document.createElement("input");
      name.type = "text";
      name.value = answer.purse?.name ?? "Coins";
      name.setAttribute("aria-label", "What money is called in this world");
      name.title = "What money is called in this world: the item of this name is your purse";
      name.style.cssText = `${INK_INPUT}width:110px;padding:2px 6px;`;
      name.addEventListener("change", () => {
        handlers.onCurrency?.(name.value);
        void drawInventory();
      });
      row.append(piece("font-weight:700;", "Purse:"), piece("", String(answer.purse?.amount ?? 0)), name);
      body.append(row);
    }
    const worn = (item) => typeof item.location === "string" && item.location.startsWith("equipped:");
    const items = [...answer.items].sort((a, b) => Number(worn(b)) - Number(worn(a)) || a.name.localeCompare(b.name));
    if (!items.length)
      body.append(
        debugNote("Nothing carried yet. Add things in the Quartermaster tab, or let the story hand you some."),
      );
    for (const item of items) {
      const box = piece(
        "border-top:1px solid rgba(107,74,43,0.25);padding-top:4px;display:flex;flex-direction:column;gap:2px;",
      );
      const where = worn(item)
        ? ` · worn (${item.location.slice("equipped:".length)})`
        : String(item.location).startsWith("stored:")
          ? ` · stored (${item.location.slice("stored:".length)})`
          : "";
      box.append(piece("font-weight:600;", `${item.name}${item.quantity > 1 ? ` ×${item.quantity}` : ""}${where}`));
      if (item.description) box.append(piece(`color:${INK_SOFT};font-size:11px;`, item.description));
      const actions = piece("display:flex;gap:4px;flex-wrap:wrap;");
      const drop = inkSmall("Drop", () => {
        if (drop.dataset.sure) return void withItem(item.id, "drop")();
        drop.dataset.sure = "1";
        drop.textContent = "Drop it? Tap again";
      });
      actions.append(
        worn(item) ? inkSmall("Take off", withItem(item.id, "unequip")) : inkSmall("Equip", withItem(item.id, "equip")),
        inkSmall("Use", withItem(item.id, "use")),
        drop,
      );
      box.append(actions);
      body.append(box);
    }
  }
  function drawSheet(body) {
    const { sheet, worn } = handlers.onSheet?.() ?? { sheet: { entries: [] }, worn: {} };
    const change = (next) => {
      handlers.onSheetChange?.(next);
      void drawInventory();
    };
    const numberBox = (value, label, onChange) => {
      const input = document.createElement("input");
      input.type = "number";
      input.inputMode = "numeric";
      input.value = String(value);
      input.setAttribute("aria-label", label);
      input.style.cssText = `${INK_INPUT}width:58px;text-align:right;padding:2px 4px;`;
      input.addEventListener(
        "change",
        () => Number.isFinite(Number(input.value)) && onChange(Math.round(Number(input.value))),
      );
      return input;
    };
    body.append(
      debugNote(
        "Your character in this world. Untick what you don't use: only ticked lines are told to the AI. Add your own stats, skills, feats and spells at the bottom, each with a few words saying what it is.",
      ),
    );
    /** One line of the sheet: its tick, its name, and (in use) its boxes; switched off, a Delete for one of your own. */
    const sheetRow = (entry) => {
      const row = piece("display:flex;align-items:center;gap:6px;");
      row.title = entry.about;
      const on = document.createElement("input");
      on.type = "checkbox";
      on.checked = entry.on;
      on.setAttribute("aria-label", `Use ${entry.name}`);
      on.addEventListener("change", () => change({ set: entry.id, field: "on", value: on.checked }));
      const bonus = worn[entry.id] ? ` (${worn[entry.id] > 0 ? "+" : ""}${worn[entry.id]} worn)` : "";
      row.append(on, piece("flex:1;min-width:0;", `${entry.name}${bonus}`));
      if (!entry.on) {
        row.append(piece(`color:${INK_SOFT};font-size:11px;`, kindWords(entry.kind)));
        if (entry.own) {
          const remove = inkSmall("Delete", () => {
            if (remove.dataset.sure) return change({ remove: entry.id });
            remove.dataset.sure = "1";
            remove.textContent = "Delete it? Tap again";
          });
          remove.title = `Delete ${entry.name} for good`;
          row.append(remove);
        }
        return [row];
      }
      if ("value" in entry)
        row.append(numberBox(entry.value, entry.name, (value) => change({ set: entry.id, field: "value", value })));
      if ("max" in entry)
        row.append(
          piece("", "/"),
          numberBox(entry.max, `Max ${entry.name}`, (value) => change({ set: entry.id, field: "max", value })),
        );
      if (entry.id === "xp")
        row.append(
          piece(`color:${INK_SOFT};`, `/ ${xpNeeded(sheet.entries.find((one) => one.id === "level")?.value ?? 1)}`),
        );
      if (!entry.own) return [row];
      // What it is, to edit: this is what the AI is told of it (a feat or a spell is nothing but its description).
      const about = document.createElement("input");
      about.type = "text";
      about.value = entry.about;
      about.placeholder = "What it is and does (for the AI)";
      about.setAttribute("aria-label", `What ${entry.name} is`);
      about.style.cssText = `${INK_INPUT}margin:-2px 0 0 24px;width:calc(100% - 24px);box-sizing:border-box;padding:2px 6px;font-size:11px;`;
      about.addEventListener("change", () => change({ set: entry.id, field: "about", value: about.value }));
      return [row, about];
    };
    // The AI and the sheet: the same two settings as Settings → Inventory, here where they're used.
    {
      const told = piece("display:flex;align-items:center;gap:6px;");
      const tick = document.createElement("input");
      tick.type = "checkbox";
      tick.checked = sheetSettings.sheetTold !== false;
      tick.setAttribute("aria-label", "Tell the AI your stats");
      tick.addEventListener("change", () => handlers.onSetting("sheetTold", tick.checked));
      told.append(tick, piece("flex:1;", "Tell the AI your stats"));
      const keeps = piece("display:flex;align-items:center;gap:6px;");
      const when = document.createElement("select");
      when.style.cssText = `${INK_INPUT}padding:2px 4px;`;
      when.setAttribute("aria-label", "The AI updates your sheet");
      for (const [value, label] of [
        ["off", "Off"],
        ["moments", "After moments"],
        ["all", "After moments and replies"],
      ]) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = label;
        when.append(option);
      }
      when.value = sheetSettings.sheetTrack ?? "off";
      when.addEventListener("change", () => handlers.onSetting("sheetTrack", when.value));
      keeps.append(piece("flex:1;", "The AI updates your sheet"), when);
      const about = debugNote(
        "With updating on, the AI reads what was narrated and changes these numbers to match (one more AI call each time). Which model does it: Settings → AI → Connections → Trackers use.",
      );
      about.setAttribute("data-wanderworld-explain", "");
      body.append(told, keeps, about);
    }
    for (const kind of SHEET_KINDS) {
      const entries = sheet.entries.filter((entry) => entry.kind === kind && entry.on);
      if (!entries.length) continue;
      body.append(piece("font-weight:700;margin-top:4px;", kindWords(kind)));
      for (const entry of entries) body.append(...sheetRow(entry));
    }
    // Add your own.
    body.append(piece("font-weight:700;margin-top:6px;", "Add your own"));
    const form = piece("display:flex;flex-wrap:wrap;gap:4px;align-items:center;");
    const kind = document.createElement("select");
    kind.style.cssText = `${INK_INPUT}padding:2px 4px;`;
    kind.setAttribute("aria-label", "What it is");
    for (const [value, label] of [
      ["stat", "Stat"],
      ["resource", "Resource"],
      ["attribute", "Attribute"],
      ["skill", "Skill"],
      ["feat", "Feat"],
      ["spell", "Spell"],
    ]) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      kind.append(option);
    }
    const field = (placeholder, width) => {
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = placeholder;
      input.setAttribute("aria-label", placeholder);
      input.style.cssText = `${INK_INPUT}width:${width};padding:2px 6px;`;
      return input;
    };
    const name = field("Name", "110px");
    const value = field("Number", "64px");
    value.inputMode = "numeric";
    const most = field("Max (optional)", "104px");
    most.inputMode = "numeric";
    const about = field("What it is, in a few words (for the AI)", "100%");
    const add = inkSmall("Add", () => {
      if (!name.value.trim()) return;
      change({
        add: {
          kind: kind.value,
          name: name.value,
          about: about.value,
          value: Number(value.value) || 0,
          // With a most it reads "2/40"; without, a plain number ("Fame 15"). A resource always has one.
          max:
            Number(most.value) > 0
              ? Number(most.value)
              : kind.value === "resource"
                ? Number(value.value) || 1
                : undefined,
        },
      });
    });
    form.append(kind, name, value, most, about, add);
    body.append(
      debugNote(
        'Fill in "Max" for a line that reads like 2/40 (Collected cars 2/40). Leave it empty for a plain number (Fame 15).',
      ),
    );
    body.append(form);
    // A spell from the 5e SRD, by name: it becomes a line of the sheet with its rule written out.
    const spellPick = document.createElement("select");
    spellPick.style.cssText = `${INK_INPUT}padding:2px 4px;max-width:100%;`;
    spellPick.setAttribute("aria-label", "A spell from the 5e SRD");
    const levels = new Map();
    for (const spell of handlers.spellList?.() ?? []) {
      if (!levels.has(spell.level)) {
        const group = document.createElement("optgroup");
        group.label = spell.level > 0 ? `Level ${spell.level} (${spell.cost} mana)` : "Cantrips (no mana)";
        levels.set(spell.level, group);
        spellPick.append(group);
      }
      const option = document.createElement("option");
      option.value = spell.name;
      option.textContent = `${spell.name} · ${spell.classes}`;
      option.title = spell.rule;
      levels.get(spell.level).append(option);
    }
    const spellAdd = inkSmall("Add spell", () => {
      handlers.onAddSpell?.(spellPick.value);
      void drawInventory();
    });
    const spellForm = piece("display:flex;flex-wrap:wrap;gap:4px;align-items:center;");
    spellForm.append(spellPick, spellAdd);
    body.append(
      piece("font-weight:700;margin-top:6px;", "Add a spell from the 5e SRD"),
      debugNote(
        'These are the SRD\'s spells of level 0 to 3 that a fight here can play. A cantrip costs no mana; a spell costs its level in mana (1 for a first-level spell, 2 for a second). Once added it is yours: its description is its rule, and you can rewrite it. Your own spells are written the same way: "2 mana. 1d10 fire damage. Range 20." is an attack roll; "Dexterity save for half" asks the target for a saving throw; "Always hits" needs no roll; "Wisdom save or paralyzed 8 seconds" leaves an effect (stunned, paralyzed, restrained and incapacitated hold the target; frightened sends it running); "+1d8 HP" heals you. No mana named makes it a cantrip. A spell with none of these is only told to the AI.',
      ),
      spellForm,
    );
    // The party, each with a class: what they fight with and what they cast.
    const companions = handlers.companions?.() ?? [];
    if (companions.length) {
      body.append(
        piece("font-weight:700;margin-top:6px;", "Your companions"),
        debugNote(
          "Each companion has a class from the 5e SRD, which gives them a weapon and spells. In real-time combat they fight beside you: they strike what's in reach, cast at what isn't, and a healer mends you when you're badly hurt. Choose a class here; until you do, each has one of their own.",
        ),
      );
      for (const member of companions) {
        const row = piece("display:flex;align-items:center;gap:6px;");
        const choose = document.createElement("select");
        choose.style.cssText = `${INK_INPUT}padding:2px 4px;`;
        choose.setAttribute("aria-label", `${member.name}'s class`);
        for (const option of handlers.classList?.() ?? []) {
          const node = document.createElement("option");
          node.value = option.id;
          node.textContent = option.label;
          node.selected = option.id === member.classId;
          choose.append(node);
        }
        choose.addEventListener("change", () => handlers.onSetClass?.(member.id, choose.value));
        row.append(piece("flex:1;min-width:0;", member.name), choose);
        body.append(row);
      }
    }
    // What's switched off, folded away at the bottom: tick one to bring it back.
    const unused = sheet.entries.filter((entry) => !entry.on);
    if (unused.length) {
      const fold = document.createElement("details");
      fold.open = sheetOffOpen;
      fold.style.cssText = "margin-top:6px;border-top:1px solid rgba(107,74,43,0.25);padding-top:4px;";
      fold.addEventListener("toggle", () => (sheetOffOpen = fold.open));
      const title = document.createElement("summary");
      title.style.cssText = "cursor:pointer;font-weight:700;";
      title.textContent = `Not in use (${unused.length})`;
      const list = piece("display:flex;flex-direction:column;gap:5px;margin-top:4px;");
      list.append(
        debugNote(
          "Switched off: not on your sheet and not told to the AI. Tick one to bring it back. One you added yourself can be deleted here.",
        ),
        ...unused.flatMap(sheetRow),
      );
      fold.append(title, list);
      body.append(fold);
    }
  }
  // What you wear and carry, and your sheet: the Inventory window.
  const inventoryButton = button(
    "Inventory",
    "What you carry, your character sheet, and Quartermaster's window",
    () => {
      togglePanel(inventoryPanel);
      if (inventoryPanel.style.display !== "none") void drawInventory();
    },
  );
  inventoryButton.style.display = "none";
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
  // This world: what it's called, its id, its map, who and what is in it (for looking things up).
  const worldPanel = document.createElement("div");
  worldPanel.setAttribute("data-wanderworld-ui", "");
  worldPanel.style.cssText = PANEL;
  panels.push(worldPanel);
  const worldButton = button("This world", "This world's name, id, map, characters and lorebooks", () => {
    togglePanel(worldPanel);
    if (worldPanel.style.display === "none") return;
    const title = document.createElement("div");
    title.style.cssText = "font-weight:700;font-size:14px;display:flex;align-items:center;gap:8px;";
    title.textContent = "This world";
    const close = button("×", "Close", () => togglePanel(worldPanel));
    close.style.cssText = `${INK_SMALL}margin-left:auto;padding:0 9px;font-size:16px;`;
    title.append(close);
    worldPanel.replaceChildren(title);
    for (const row of handlers.onWorldDetails?.() ?? []) {
      const line = document.createElement("div");
      line.style.cssText = "border-top:1px solid rgba(107,74,43,0.3);padding:4px 0;";
      const label = document.createElement("div");
      label.style.cssText = `font-size:11px;color:${INK_SOFT};display:flex;align-items:center;gap:8px;`;
      label.textContent = row.label;
      const value = document.createElement("div");
      value.style.cssText = "user-select:text;-webkit-user-select:text;overflow-wrap:anywhere;line-height:1.35;";
      value.textContent = row.value;
      if (row.copy) {
        const copy = button("Copy", `Copy ${row.label.toLowerCase()}`, () => {
          const done = () => (copy.textContent = "Copied");
          // (The clipboard needs a secure page; without one, the text is selected to copy by hand.)
          if (navigator.clipboard?.writeText) void navigator.clipboard.writeText(row.value).then(done, () => {});
          else window.getSelection?.()?.selectAllChildren(value);
        });
        copy.style.cssText = `${INK_SMALL}margin-left:auto;`;
        label.append(copy);
      }
      line.append(label, value);
      worldPanel.append(line);
    }
  });
  // Save world: now, and sent to the Engine now. Load world: another of your worlds, as the Engine has them.
  const saveButton = button("Save world", "Save this world now, and send it to the Engine now", () => {
    togglePanel(menuPanel);
    handlers.onSaveWorld?.();
  });
  const worldsPanel = document.createElement("div");
  worldsPanel.setAttribute("data-wanderworld-ui", "");
  worldsPanel.style.cssText = PANEL;
  panels.push(worldsPanel);
  const loadButton = button("Load world", "Leave this world (saved) for another of your worlds", () => {
    togglePanel(worldsPanel);
    if (worldsPanel.style.display === "none") return;
    const title = document.createElement("div");
    title.style.cssText = "font-weight:700;font-size:14px;display:flex;align-items:center;gap:8px;";
    title.textContent = "Load world";
    const close = button("×", "Close", () => togglePanel(worldsPanel));
    close.style.cssText = `${INK_SMALL}margin-left:auto;padding:0 9px;font-size:16px;`;
    title.append(close);
    const note = document.createElement("div");
    note.style.cssText = `font-size:12px;color:${INK_SOFT};line-height:1.35;`;
    note.textContent = "Reading your worlds from the Engine…";
    worldsPanel.replaceChildren(title, note);
    void Promise.resolve(handlers.onWorlds?.() ?? []).then((worlds) => {
      if (worldsPanel.style.display === "none") return;
      note.textContent = worlds.length
        ? "This world is saved first, then the one you pick opens where you left it."
        : "No saved worlds.";
      for (const world of worlds) {
        const pick = button("", world.current ? "The world you're in" : `Load ${world.name}`, () => {
          togglePanel(worldsPanel);
          handlers.onLoadWorld?.(world.id);
        });
        pick.style.cssText += "width:100%;text-align:left;white-space:normal;";
        const name = document.createElement("div");
        name.style.cssText = "font-weight:600;overflow-wrap:anywhere;";
        name.textContent = world.current ? `${world.name} (you're here)` : world.name;
        const played = document.createElement("div");
        played.style.cssText = "font-size:11px;opacity:0.8;";
        played.textContent = world.played ? `Last played ${world.played}` : "";
        pick.append(name, played);
        worldsPanel.append(pick);
      }
    });
  });
  for (const item of [settingsButton, worldButton, saveButton, loadButton, fullscreen, fresh])
    item.style.width = "100%";
  menuPanel.append(personaLabel, settingsButton, worldButton, saveButton, loadButton, fullscreen, fresh);
  panels.push(menuPanel);
  const gameMenuButton = button(
    "Menu",
    "Who you play, Settings, this world's details, full screen and the main menu",
    () => togglePanel(menuPanel),
  );
  controls.append(mapButton, inventoryButton, journalButton, loreButton, chatButton, illustrateButton, gameMenuButton);

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
    menuButton.textContent = open ? "×" : "☰";
    // Under its own button, which stays in reach to close it again.
    controls.style.cssText =
      `${CHIP}position:absolute;top:100%;margin-top:6px;right:0;z-index:6;display:${open ? "flex" : "none"};flex-direction:column;` +
      "align-items:stretch;gap:6px;padding:8px;pointer-events:auto;";
  }
  const onNarrow = () => setMenu(false);
  narrow.addEventListener?.("change", onNarrow);
  setMenu(false);
  const menuWrap = document.createElement("div");
  menuWrap.style.cssText = "position:relative;display:flex;align-items:center;";
  menuWrap.append(menuButton, controls);
  top.append(clock, place, stats, spacer, menuWrap);

  // The "use" prompt over whatever you could use, and on touch screens a Use button by the stick.
  const prompt = document.createElement("button");
  prompt.type = "button";
  prompt.setAttribute("data-wanderworld-ui", "");
  prompt.style.cssText = `${CHIP}position:absolute;left:0;top:0;transform:translate(-50%,-100%);font:600 13px system-ui,sans-serif;display:none;white-space:nowrap;border:0;cursor:pointer;pointer-events:auto;min-height:32px;`;
  prompt.addEventListener("click", () => handlers.onUse());
  const use = button("Use", "Use what's in front of you", () => handlers.onUse());
  // On touch screens, a row along the bottom (the stick sits above its left end): Run, Sit (which becomes
  // Lie down once you're sitting on the ground), Jump, and Use at the right, under the other thumb.
  let sleepCard = null; // the tent's card, while it's open (openSleep)
  const wanted = { jump: true, rest: true, run: true, chat: true, place: true }; // Settings: the thumb's buttons, the chat window's, the place line
  const jump = button("Jump", "Jump", () => handlers.onJump());
  const strike = button("Attack", "Swing at whatever is in front of you", () => handlers.onAttack?.());
  const rest = button("Sit", "Sit down on the ground; again to lie down", () => handlers.onRest());
  let runOn = false;
  const run = button("Run", "Run until this is tapped again", () => {
    runOn = !runOn;
    run.style.background = runOn ? "#2e8c96" : "rgba(10,14,20,0.62)";
    run.setAttribute("aria-pressed", String(runOn));
    handlers.onRun?.(runOn);
  });
  run.setAttribute("aria-pressed", "false");
  const THUMB = "padding:10px 12px;font-size:13px;white-space:nowrap;flex:0 0 auto;";
  for (const control of [run, rest, jump]) control.style.cssText += `${THUMB}display:${touch ? "" : "none"};`;
  // Fighting's own: Block and Dodge with Attack, behind the Combat button (which swaps them in for Run, Sit and Jump).
  const guard = button("Block", "Block: attacks on you are rolled twice and the worse counts", () =>
    handlers.onBlock?.(),
  );
  const roll = button("Dodge", "Roll out of the way: nothing lands on you while you do", () => handlers.onDodge?.());
  let combatOn = false;
  const combatToggle = button("Combat", "Swap these buttons for Attack, Block and Dodge, and back", () => {
    handlers.onDraw?.(); // (the weapon is drawn or put away with it: setDrawn says which)
  });
  combatToggle.setAttribute("aria-pressed", "false");
  const spellThumb = button("Cast", "Cast the spell that's ready", () => handlers.onCast?.());
  for (const control of [strike, guard, roll, spellThumb, combatToggle])
    control.style.cssText += `${THUMB}display:none;`;
  use.style.cssText += `${THUMB}flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;display:none;`;
  const thumbs = document.createElement("div");
  thumbs.style.cssText =
    "position:absolute;left:8px;right:8px;bottom:calc(10px + env(safe-area-inset-bottom, 0px));display:flex;gap:6px;justify-content:flex-end;align-items:center;";
  thumbs.append(combatToggle, run, rest, jump, strike, guard, roll, spellThumb, use);

  const hint = document.createElement("div");
  const hintText = document.createElement("div");
  hintText.style.flex = "1";
  hintText.textContent = touch
    ? "Stick to walk: push it all the way, or tap Run, to run · or tap the ground to walk there · drag to look · pinch to zoom · tap someone or something to use it"
    : "";
  // (With a keyboard, the hint names the keys as the player has them: Settings → Controls → Keys.)
  updateHint = () => {
    if (touch) return;
    const key = (action) => keyName(keyBinds[action]);
    hintText.textContent = `${["forward", "left", "back", "right"].map(key).join("")} walk · ${key("run")} run (${key("runToggle")} keeps it on) · ${key("jump")} jump · ${key("rest")} sit · drag or arrows to look · scroll to zoom · ${key("use")} or click to use · with combat on: ${key("attack")} swing, ${key("block")} block, ${key("dodge")} dodge, ${key("draw")} draw, ${key("cast")} cast · Esc to leave`;
  };
  updateHint();
  // Read once, it can go: its × turns off Settings → Display → On screen → Controls hint.
  const hintClose = button("×", "Hide this (Settings → Display → On screen brings it back)", () =>
    handlers.onSetting("hint", false),
  );
  hintClose.setAttribute("aria-label", "Hide the controls hint");
  hintClose.style.cssText += "padding:0 7px;font-size:15px;background:rgba(255,255,255,0.16);";
  hint.append(hintText, hintClose);
  // On touch screens the hint is a line of its own under the bar, clear of the stick and the buttons.
  hint.style.cssText = touch
    ? `${CHIP}display:flex;gap:8px;align-items:flex-start;font-size:12px;opacity:0.85;flex:0 1 100%;box-sizing:border-box;`
    : `${CHIP}display:flex;gap:8px;align-items:flex-start;position:absolute;bottom:8px;right:8px;font-size:12px;opacity:0.85;max-width:min(60%,560px);`;

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
  const chatFloat = makeFloating(
    layer,
    chat.frame,
    chat.bar,
    "wanderworld.chat",
    // On a touch screen it starts under the bar, clear of the stick and the buttons along the bottom.
    touch
      ? { w: 340, h: 200, x: 8, y: 150, open: true }
      : { w: 380, h: 260, right: undefined, bottom: 70, x: 12, open: true },
  );
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
    "display:grid;grid-template-columns:auto 1fr;gap:2px 10px;margin-top:3px;line-height:1.35;max-height:150px;overflow-y:auto;";
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
    "display:flex;flex-direction:column;gap:4px;padding-top:3px;max-height:150px;overflow-y:auto;";
  peopleHere.append(peopleTitle, peopleLooks);
  // Jump, and Sit (then Lie down, then Get up): what Space and C do, for a click or a tap.
  const moves = document.createElement("div");
  moves.style.cssText = "display:flex;gap:6px;padding:0 10px 6px;";
  const chatJump = button("Jump", "Jump", () => handlers.onJump());
  const chatRest = button("Sit", "Sit down on the ground, then lie down, then get up", () =>
    chatRest.textContent.startsWith("Get ") ? handlers.onUse() : handlers.onRest(),
  );
  const chatStrike = button("Attack", "Swing at whatever is in front of you", () => handlers.onAttack?.());
  const chatGuard = button("Block", "Block: attacks on you are rolled twice and the worse counts", () =>
    handlers.onBlock?.(),
  );
  const chatRoll = button("Dodge", "Roll out of the way", () => handlers.onDodge?.());
  const chatDraw = button(
    "Draw",
    "Draw your weapon, or put it away: drawn, the view stays behind you and turning it turns you",
    () => handlers.onDraw?.(),
  );
  const chatFight = [chatDraw, chatStrike, chatGuard, chatRoll];
  for (const control of [chatJump, chatRest, ...chatFight]) control.style.cssText += "padding:4px 10px;font-size:12px;";
  for (const control of chatFight) control.style.display = "none";
  moves.append(chatJump, chatRest, ...chatFight);
  // The hotkeys that are set, a button each (setHotbar): what the number keys do, for a tap or a click.
  const hotRow = document.createElement("div");
  hotRow.style.cssText = "display:none;gap:6px;padding:0 10px 6px;flex-wrap:wrap;";
  let hotKey = "";
  // The spells that can be cast, a button each (setSpells).
  const spellRow = document.createElement("div");
  spellRow.style.cssText = "display:none;gap:6px;padding:0 10px 6px;flex-wrap:wrap;";
  let spellsKey = "";
  let spellsShown = [];
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
    // Call: it turns up beside you, wherever it had got to.
    const call = button(`Call ${role}`, `Call your ${role} to you, wherever it has got to`, () =>
      handlers.onPetCall?.(role),
    );
    call.style.cssText = control.style.cssText;
    control.call = call;
    petMoves.append(call, control);
    /** Called by its name once it has one ("Send Shadowmere home"). */
    control.rename = (name) => {
      const next = `Send ${name || role} home`;
      if (next === plain) return;
      call.textContent = `Call ${name || role}`;
      plain = next;
      reset();
    };
    return control;
  };
  const petButtons = { dog: sendHome("dog"), horse: sendHome("horse") };
  // Clear chat: empties the window, and with it what any prompt is given of what was said and told here.
  // Asked twice, as it can't be taken back.
  const clearChat = document.createElement("button");
  clearChat.type = "button";
  clearChat.textContent = "Clear chat";
  clearChat.title = "Empties this window. What's cleared is no longer sent to the AI or to Illustrate.";
  clearChat.style.cssText = `${INK_SMALL}align-self:flex-start;margin:0 10px 8px;`;
  let clearAsked = 0;
  clearChat.addEventListener("click", () => {
    if (!clearAsked) {
      clearChat.textContent = "Clear it all? Tap again";
      clearAsked = setTimeout(() => {
        clearAsked = 0;
        clearChat.textContent = "Clear chat";
      }, 4000);
      return;
    }
    clearTimeout(clearAsked);
    clearAsked = 0;
    clearChat.textContent = "Clear chat";
    handlers.onClearChat?.();
  });
  // What can be gathered where you stand (gather.js): a button for each, there only while there's something.
  const gatherRow = document.createElement("div");
  gatherRow.style.cssText = "display:none;gap:6px;padding:0 10px 6px;flex-wrap:wrap;";
  let gatherShown = "";
  // The vendor you're at: a button to its shop window, there only at a vendor's door or inside.
  const shopRow = document.createElement("div");
  shopRow.style.cssText = "display:none;gap:6px;padding:0 10px 6px;flex-wrap:wrap;";
  const shopButton = button("Shop", "Buy and sell here", () => {
    togglePanel(shopPanel);
    if (shopPanel.style.display !== "none") void drawShop();
  });
  shopButton.style.cssText += "padding:4px 10px;font-size:12px;";
  shopRow.append(shopButton);
  let shopAt = "";
  chat.frame.append(
    narration,
    speakBar,
    moves,
    shopRow,
    gatherRow,
    hotRow,
    spellRow,
    petMoves,
    commands,
    peopleHere,
    clearChat,
  );
  let narrationTimer = null;
  // Narration with the chat window closed: a caption over the world for a few seconds, then gone (it's
  // in the window when it's opened).
  const caption = document.createElement("div");
  caption.setAttribute("data-wanderworld-ui", "");
  caption.style.cssText =
    `${CHIP}position:absolute;left:50%;top:84px;transform:translateX(-50%);width:max-content;max-width:min(560px,calc(100% - 32px));box-sizing:border-box;` +
    "padding:8px 14px;font:italic 14px/1.4 Georgia,serif;text-align:center;pointer-events:none;opacity:0;transition:opacity 400ms;";
  layer.append(caption);
  let captionTimer = null;
  const personEditor = createPersonEditor(layer, {
    onSave: (id, changes) => handlers.onSavePerson(id, changes),
    onSumUp: (person) => {
      personEditor.close();
      assistantPick("memory-sum", [person]);
    },
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
  explainRule.textContent =
    ".wanderworld-no-explain [data-wanderworld-explain]:not([data-open]){display:none!important}[data-wanderworld-info]{display:none}.wanderworld-no-explain [data-wanderworld-info]{display:inline-flex}";
  layer.append(explainRule);
  pages.append(
    board,
    top,
    peoplePanel,
    journal.panel,
    mapView.panel,
    inventoryPanel,
    shopPanel,
    lorePanel,
    settingsPanel,
    menuPanel,
    worldPanel,
    worldsPanel,
    notice,
    scene,
  );
  // The world's own controls (the prompt over a thing, the row under your thumbs, and the stick, which
  // main.js puts with them) go underneath every window, panel and card: an open one is what gets the tap.
  layer.prepend(prompt, thumbs);
  layer.append(pages, hint, zoneTitle, status, fade, loading);
  root.append(layer);
  if (touch) top.append(hint);

  // Every panel can be closed where it is: an × on its top right corner (Settings has its own, in its tabs).
  const panelClose = button("×", "Close", () => {
    for (const panel of panels) panel.style.display = "none";
  });
  panelClose.setAttribute("aria-label", "Close");
  panelClose.style.cssText +=
    "position:absolute;display:none;z-index:4;width:30px;height:30px;padding:0;border-radius:50%;font-size:17px;line-height:1;background:#6b4a2b;color:#f6ecd6;box-shadow:0 1px 4px rgba(0,0,0,0.4);";
  layer.append(panelClose);
  const placeClose = () => {
    const open = panels.find((panel) => panel !== settingsPanel && panel.style.display !== "none");
    panelClose.style.display = open ? "" : "none";
    if (!open) return;
    const [box, within] = [open.getBoundingClientRect(), layer.getBoundingClientRect()];
    panelClose.style.left = `${Math.min(within.width - 32, box.right - within.left - 20)}px`;
    panelClose.style.top = `${Math.max(2, box.top - within.top - 10)}px`;
  };
  if (globalThis.MutationObserver) {
    const watch = new MutationObserver(placeClose);
    for (const panel of panels) watch.observe(panel, { attributes: true, attributeFilter: ["style"] });
  }

  // Someone comes at the player: there's no combat yet, so the card says so and offers what there is.
  const confront = document.createElement("div");
  confront.setAttribute("data-wanderworld-ui", "");
  confront.style.cssText =
    `${PARCHMENT}position:absolute;left:50%;top:22%;transform:translateX(-50%);display:none;flex-direction:column;gap:8px;` +
    "max-width:min(420px,calc(100% - 24px));padding:12px 14px;border-radius:10px;pointer-events:auto;font-size:13px;line-height:1.4;";
  layer.append(confront);
  // A fight by turns: who's in it and in what order, whose turn it is, and what the player has left (setBattle).
  const battleBar = document.createElement("div");
  battleBar.setAttribute("data-wanderworld-ui", "");
  battleBar.style.cssText =
    "position:absolute;left:50%;top:calc(46px + env(safe-area-inset-top, 0px));transform:translateX(-50%);max-width:min(560px,calc(100% - 16px));display:none;flex-direction:column;gap:5px;padding:7px 10px;border-radius:10px;background:rgba(10,14,20,0.78);color:#fff;font:13px system-ui,sans-serif;pointer-events:auto;";
  let battleKey = "null";
  layer.append(battleBar);
  const respawn = button("Respawn", "Get up: you wake at home, with half your HP", () => handlers.onRespawn?.());
  respawn.style.cssText +=
    "position:absolute;left:50%;top:calc(52px + env(safe-area-inset-top, 0px));transform:translateX(-50%);padding:10px 18px;font-size:14px;background:#96422e;display:none;";
  layer.append(respawn);

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
        '"Stop aggressive approaches" turns them off in Menu → Settings → People; you can turn them back on there.';
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
    setStats({ fps, calls, triangles, height }) {
      stats.textContent = `${fps} fps · ${calls} draws · ${Math.round(triangles / 1000)}k tris · ${height}p`;
    },
    setClock(text) {
      clock.textContent = text;
    },
    /** Shows each setting's current value, and applies the display ones. */
    setSettings(settings, custom = settings.genderName ?? "") {
      for (const [name, field] of Object.entries(fields)) field.set(settings[name]);
      for (const write of explainers) write(settings);
      genderName = custom; // the world's own name for the third gender, when it has one
      for (const { nodes, under } of dependents)
        for (const node of nodes) node.style.opacity = settings[under] ? "" : "0.45";
      wanted.jump = settings.jumpButton !== false;
      wanted.rest = settings.restButton !== false;
      wanted.run = settings.runButton !== false;
      wanted.chat = settings.chatMoves !== false;
      wanted.place = settings.place !== false;
      hint.style.display = settings.hint ? "flex" : "none";
      stats.style.display = settings.stats ? "" : "none";
      clock.style.display = settings.clock !== false ? "" : "none";
      place.style.display = wanted.place && place.textContent ? "" : "none";
      // Text size: the windows and menus, not the buttons under your thumbs. A floating window is sized
      // and placed in real pixels, so it's what is inside it that grows.
      const textZoom =
        Number(settings.textSize) > 0 && Number(settings.textSize) !== 1 ? String(settings.textSize) : "";
      pages.style.zoom = textZoom;
      for (const frame of layer.querySelectorAll("[data-wanderworld-floating]"))
        for (const child of frame.children) if (child.title !== "Drag to resize") child.style.zoom = textZoom;
      placeClose();
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
    /** Draws the Inventory window again if it's open (the sheet changed from outside it). */
    refreshInventory() {
      if (inventoryPanel.style.display !== "none" && !inventoryPanel.contains(document.activeElement))
        void drawInventory();
    },
    /** The Inventory button: there with the character sheet on, or with Quartermaster installed and in use. */
    setInventory(on) {
      inventoryButton.style.display = on ? "" : "none";
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
      peopleButton.textContent = chosen.size ? `Who lives here (${chosen.size})…` : "Who lives here…";
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
    setThumbs(resting, shown, fighting = false) {
      const show = (want) => (shown && touch && want ? "" : "none");
      const riding = resting === "ride";
      // Fighting's buttons: only with fighting on. On a touch screen the Combat button swaps them in for
      // Run, Sit and Jump, so the row stays short; in the chat window they sit beside Jump and Sit.
      const fight = !!fighting && !resting && combatOn;
      const realtime = fighting === "realtime" || fighting === "turns"; // (Block and Dodge are these two's; the others only have Attack)
      combatToggle.style.display = resting ? "none" : show(fighting);
      strike.style.display = show(fight);
      for (const control of [guard, roll]) control.style.display = show(fight && realtime);
      spellThumb.style.display = show(fight && realtime && spellsShown.length > 0);
      chatStrike.style.display = fighting && !resting ? "" : "none";
      chatDraw.style.display = realtime && !resting ? "" : "none";
      for (const control of [chatGuard, chatRoll]) control.style.display = realtime && !resting ? "" : "none";
      jump.style.display = fight || (resting && !riding) ? "none" : show(wanted.jump);
      run.style.display = fight || (resting && !riding) ? "none" : show(wanted.run);
      rest.style.display = fight || resting === "lie" || resting === "seat" || riding ? "none" : show(wanted.rest);
      rest.textContent = resting === "ground" ? "Lie down" : "Sit";
      // The chat window's: Sit, Lie down, Get up (also up from a bench or a bed).
      const label = resting === "ground" ? "Lie down" : riding ? "Get down" : resting ? "Get up" : "Sit";
      if (chatRest.textContent !== label) chatRest.textContent = label;
      moves.style.display = shown && wanted.chat && !touch ? "flex" : "none"; // (a touch screen has them along the bottom)
      chatJump.disabled = !!resting && !riding;
    },
    /** Whether a shop's window is open (main.js holds the inventory tracker back while it is). */
    shopOpen: () => shopPanel.style.display !== "none",
    /** The vendor the player is at, by name ("" for none: the button goes, and the shop window with it). */
    setShop(name) {
      if (name === shopAt) return;
      shopAt = name;
      shopButton.textContent = name ? `Shop: ${name.replace(/^the /u, "")}` : "Shop";
      shopRow.style.display = name ? "flex" : "none";
      if (shopPanel.style.display !== "none") {
        if (name) void drawShop();
        else shopPanel.style.display = "none";
      }
    },
    /** What can be gathered here: [{ kind, label }] (none hides the row). */
    setGather(options) {
      const key = options.map((option) => option.kind).join(",");
      if (key === gatherShown) return;
      gatherShown = key;
      gatherRow.replaceChildren(
        ...options.map((option) => {
          const control = button(option.label, `${option.label} here: what you find goes into your inventory`, () =>
            handlers.onGather?.(option.kind),
          );
          control.style.cssText += "padding:4px 10px;font-size:12px;";
          return control;
        }),
      );
      gatherRow.style.display = options.length ? "flex" : "none";
    },
    /** Which of your animals are with you (and so can be sent home from the chat window): { dog, horse }. */
    setPets(withYou) {
      let any = false;
      for (const [role, control] of Object.entries(petButtons)) {
        control.rename(withYou.names?.[role] ?? "");
        const show = withYou[role] ? "" : "none";
        if (control.style.display !== show) control.style.display = control.call.style.display = show;
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
      pages.append(card);
      sleepCard = card;
    },
    closeSleep() {
      sleepCard?.remove();
      sleepCard = null;
    },
    /** The place line: `text` ("Briarwood · Mill Lane") and the titles of the lore active there. */
    setPlace(text, lore = []) {
      place.style.display = text && wanted.place ? "" : "none";
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
    // (The Map is given what the Journal is: it draws from the same.)
    journal: {
      ...journal,
      render(next) {
        journal.render(next);
        mapView.render(next);
      },
    },
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
    /**
     * A fight by turns, shown along the top: { round, order: [{ name, current, kind }], mine, move, action,
     * bonus, slots } (`mine`: it's the player's turn; `slots`: "1st 2/2 · 2nd 0/0" or ""); null: no fight.
     */
    setBattle(state) {
      const key = JSON.stringify(state);
      if (key === battleKey) return;
      battleKey = key;
      battleBar.style.display = state ? "flex" : "none";
      if (!state) return;
      const order = document.createElement("div");
      order.style.cssText = "display:flex;gap:4px;flex-wrap:wrap;justify-content:center;";
      for (const entry of state.order) {
        const chip = document.createElement("span");
        chip.textContent = entry.name;
        chip.style.cssText = `padding:2px 7px;border-radius:9px;font-size:11px;background:${entry.current ? "#c9a15a" : "rgba(255,255,255,0.12)"};color:${entry.current ? "#1a1408" : entry.kind === "foe" ? "#ffb4a0" : "#fff"};${entry.current ? "font-weight:700;" : ""}`;
        order.append(chip);
      }
      const line = document.createElement("div");
      line.style.cssText = "font-size:12px;text-align:center;";
      line.textContent = state.mine
        ? `Round ${state.round} · Your turn · Move ${state.move.toFixed(1)} m · Action ${state.action ? "ready" : "used"} · Bonus ${state.bonus ? "ready" : "used"}${state.slots ? ` · Slots ${state.slots}` : ""}`
        : `Round ${state.round} · ${state.order.find((entry) => entry.current)?.name ?? ""}'s turn`;
      const row = document.createElement("div");
      row.style.cssText = "display:flex;gap:6px;justify-content:center;";
      const end = button("End turn", "End your turn", () => handlers.onEndTurn?.());
      end.style.cssText += `padding:6px 14px;font-size:13px;background:#2e6f3a;display:${state.mine ? "" : "none"};`;
      const flee = button("Leave the fight", "Break off: the fight ends, and what you fought lets you go", () =>
        handlers.onFlee?.(),
      );
      flee.style.cssText += "padding:6px 10px;font-size:12px;";
      row.append(end, flee);
      battleBar.replaceChildren(order, line, row);
    },
    /** The hotkeys that are set: [{ key, label }]. A button each in the chat window (none hides the row). */
    setHotbar(slots) {
      const key = slots.map((slot) => `${slot.key}:${slot.label}`).join("|");
      if (key === hotKey) return;
      hotKey = key;
      hotRow.replaceChildren(
        ...slots.map((slot) => {
          const control = button(`${slot.key} ${slot.label}`, `${slot.label} (the ${slot.key} key)`, () =>
            handlers.onHotkey?.(slot.key),
          );
          control.style.cssText += "padding:4px 10px;font-size:12px;";
          return control;
        }),
      );
      hotRow.style.display = slots.length ? "flex" : "none";
    },
    /**
     * The spells that can be cast: [{ id, name, cost }], and which is ready. A button each in the chat
     * window (casting one makes it the ready one), and the touch screen's Cast button names the ready one.
     */
    setSpells(spells, readyId) {
      const key = `${spells.map((spell) => `${spell.id}:${spell.name}:${spell.cost}`).join("|")}>${readyId}`;
      if (key === spellsKey) return;
      spellsKey = key;
      spellsShown = spells;
      spellRow.replaceChildren(
        ...spells.map((spell) => {
          const control = button(
            `${spell.name}${spell.cost ? ` (${spell.cost})` : ""}`,
            `Cast ${spell.name}${spell.cost ? `: ${spell.cost} mana` : ""}${spell.id === readyId ? " (the ready one)" : ""}`,
            () => handlers.onCast?.(spell.id),
          );
          control.style.cssText += `padding:4px 10px;font-size:12px;${spell.id === readyId ? "outline:1px solid #c9a15a;" : ""}`;
          return control;
        }),
      );
      spellRow.style.display = spells.length ? "flex" : "none";
      const ready = spells.find((spell) => spell.id === readyId);
      spellThumb.textContent = ready ? ready.name : "Cast";
    },
    /** Whether the weapon is drawn: the Combat button shows it, and a touch screen's row is the fighting one. */
    setDrawn(on) {
      if (combatOn === !!on) return;
      combatOn = !!on;
      combatToggle.style.background = combatOn ? "#96422e" : "rgba(10,14,20,0.62)";
      combatToggle.setAttribute("aria-pressed", String(combatOn));
      chatDraw.textContent = combatOn ? "Put away" : "Draw";
    },
    /** The Respawn button at the top, while the player lies beaten and has chosen to stay down. */
    setRespawn(shown) {
      respawn.style.display = shown ? "" : "none";
    },
    /** The Run button shown as on or off (Ctrl turned running on or off). */
    setRun(on) {
      runOn = !!on;
      run.style.background = runOn ? "#2e8c96" : "rgba(10,14,20,0.62)";
      run.setAttribute("aria-pressed", String(runOn));
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
