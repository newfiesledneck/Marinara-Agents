// The look of Wanderworld's panels: parchment (the author's painted texture, kit/generic/art/parchment) with
// brown ink and wood-brown buttons, for conversations, the Journal, the menu, building cards and the
// noticeboard. The bar along the top stays dark glass so it doesn't cover the world.
const ART = "/api/capability-packages/wanderworld/assets/kit/generic/art/";

export const INK = "#3b2a18";
export const INK_SOFT = "rgba(59,42,24,0.72)";
export const SERIF = `Georgia,"Times New Roman",serif`;

/** A parchment panel: background, ink, a thin brown edge and a soft shadow. */
export const PARCHMENT =
  `background:#efe3c6 url("${ART}parchment.webp") repeat;background-size:384px;color:${INK};` +
  "border:1px solid rgba(110,80,40,0.55);border-radius:10px;" +
  "box-shadow:0 6px 24px rgba(30,18,6,0.35),inset 0 0 28px rgba(120,80,30,0.16);";

/**
 * A sheet of old parchment with darkened, worn edges, stretched to the card (for cards that don't
 * scroll: the menu, a building's card, the noticeboard, conversations).
 */
export const PARCHMENT_EDGED =
  `background:#e8d5ad url("${ART}parchment-edged.webp") center/100% 100% no-repeat;color:${INK};` +
  "border-radius:6px;box-shadow:0 8px 28px rgba(30,18,6,0.45);";

/**
 * A wooden board for a button: the kit's wood grain under a brown wash dark enough for cream lettering
 * to read (the plain brown shows until the picture's in, and if it never comes).
 */
export const WOOD =
  `background:linear-gradient(rgba(96,64,34,0.5),rgba(52,33,16,0.62)),url("${ART}wood-beam.webp") #6b4a2b;` +
  "background-size:auto,260px;color:#f8eed8;text-shadow:0 1px 2px rgba(20,10,0,0.75);";

/** A slab of stone for a button that should stand apart: grey rock under a wash, lettering as on the wood. */
export const STONE =
  `background:linear-gradient(rgba(70,72,78,0.35),rgba(30,32,38,0.6)),url("${ART}cliff-rock.webp") #7d7a74;` +
  "background-size:auto,300px;color:#f8f1dd;text-shadow:0 1px 3px rgba(0,0,0,0.85);";

/** The main button on parchment: dark wood with cream lettering. */
export const INK_BUTTON =
  `font:600 13px ${SERIF};border:1px solid #4e341d;border-radius:7px;padding:5px 12px;cursor:pointer;` +
  `${WOOD}box-shadow:0 1px 2px rgba(0,0,0,0.25);`;

/** A small button on parchment: an inked outline. */
export const INK_SMALL =
  `font:600 11px system-ui,sans-serif;border:1px solid rgba(107,74,43,0.7);border-radius:6px;padding:2px 8px;` +
  `cursor:pointer;background:rgba(107,74,43,0.1);color:${INK};`;

/** A text field on parchment. */
export const INK_INPUT =
  "font:14px system-ui,sans-serif;border:1px solid #b89a6a;border-radius:7px;padding:7px 9px;" +
  "background:#fbf6e9;color:#2b1e10;box-sizing:border-box;";

/** A pinned note's paper (kit/generic/art/note): aged, with darkened edges. */
export const NOTE_PAPER = `background:#ead9b4 url("${ART}note.webp") center/cover;color:#2e2112;`;

/**
 * How many of each trade a world has, for New world and Regenerate: a row a trade (`kinds`: [{ id, label }])
 * with "at least" and "at most" (0 to 12; empty is no say), starting from `counts`. { node, value() }:
 * `value()` is { [id]: { min, max } } for the trades with a say (`max` null where it was left empty).
 */
export function vendorCountsEditor(kinds, counts = {}) {
  const node = document.createElement("div");
  node.style.cssText =
    "display:grid;grid-template-columns:1fr auto auto;gap:5px 8px;align-items:center;font-size:13px;";
  const small = (text) => {
    const span = document.createElement("span");
    span.style.cssText = "font-size:11px;opacity:0.7;text-align:center;";
    span.textContent = text;
    return span;
  };
  if (kinds.length) node.append(small(""), small("At least"), small("At most"));
  const fields = kinds.map(({ id, label }) => {
    const name = document.createElement("span");
    name.textContent = label;
    const box = (now, placeholder, what) => {
      const input = document.createElement("input");
      Object.assign(input, { type: "number", min: "0", max: "12", step: "1", inputMode: "numeric", placeholder });
      input.setAttribute("aria-label", `${label}: ${what}`);
      input.style.cssText = `${INK_INPUT}width:64px;text-align:center;`;
      if (Number.isInteger(now) && now > 0) input.value = String(now);
      return input;
    };
    const least = box(counts[id]?.min, "0", "at least");
    const most = box(counts[id]?.max ?? null, "Any", "at most");
    if (counts[id]?.max === 0) most.value = "0";
    node.append(name, least, most);
    return { id, least, most };
  });
  const whole = (input) => {
    const typed = Math.round(Number(input.value));
    return input.value.trim() !== "" && Number.isFinite(typed) ? Math.min(12, Math.max(0, typed)) : null;
  };
  return {
    node,
    value: () =>
      Object.fromEntries(
        fields
          .map(({ id, least, most }) => [id, { min: whole(least) ?? 0, max: whole(most) }])
          .filter(([, entry]) => entry.min > 0 || entry.max !== null),
      ),
  };
}

/**
 * An [i] before a label or a line, there while Show explanations is off: `explain` shows while the pointer is
 * over it, and a tap or click keeps it open until the next one.
 */
/**
 * One line with an (i) that is always there, and what it opens: a short reference (the keys a description
 * or a lorebook entry can use), folded away until the (i) is pressed or hovered whatever the explanations
 * setting. { row, detail }: put both where they go, the detail after the row.
 */
export function keysLine(text, keys) {
  const detail = document.createElement("div");
  detail.setAttribute("data-wanderworld-keys", "");
  detail.style.cssText =
    "font:11px/1.45 ui-monospace,Consolas,monospace;white-space:pre-wrap;overflow-wrap:anywhere;opacity:0.85;padding:4px 6px 2px 28px;max-height:42vh;overflow-y:auto;";
  detail.textContent = keys;
  const row = document.createElement("div");
  row.style.cssText = "display:flex;align-items:center;font-size:12px;line-height:1.35;";
  const control = infoButton(detail);
  control.setAttribute("data-always", "");
  const words = document.createElement("span");
  words.textContent = text;
  row.append(control, words);
  return { row, detail };
}

export function infoButton(explain) {
  const node = document.createElement("button");
  node.type = "button";
  node.textContent = "i";
  node.setAttribute("data-wanderworld-info", "");
  explain?.setAttribute?.("data-info", ""); // (it has its (i): hud.js gives one to any that hasn't)
  node.setAttribute("aria-label", "What this does");
  node.setAttribute("aria-expanded", "false");
  node.style.cssText =
    "flex:none;align-items:center;justify-content:center;width:22px;height:22px;margin-right:6px;padding:0;border-radius:50%;border:1px solid currentColor;background:none;color:inherit;opacity:0.6;font:italic 700 12px Georgia,serif;cursor:pointer;vertical-align:middle;";
  let kept = false;
  const show = (on) => {
    explain.toggleAttribute("data-open", on);
    node.setAttribute("aria-expanded", String(on));
    node.style.opacity = on ? "1" : "0.6";
  };
  node.addEventListener("click", (event) => {
    event.preventDefault(); // it sits in the setting's label: a tap mustn't flip the setting
    event.stopPropagation();
    kept = !kept;
    show(kept);
  });
  // (Hovering shows the words in a tooltip, read afresh each time since some change with other settings.
  // Opening on hover moved what was under the pointer, so it opened and shut over and over.)
  node.addEventListener("pointerenter", () => {
    const words = explain?.textContent?.trim() ?? "";
    if (words) node.title = words;
  });
  return node;
}
