// The fight display's parts on the page (hud.js puts them in): a card for each fighter (name, HP bar,
// numbers or a word, what's on them, whose turn it is), the last thing that happened with a few before it
// to open, the info card for a creature or a person (fighthud.js creatureCard, personCard), and the card
// with the choices a beaten player has while their victors stand over them. Large type and high contrast,
// and it all wraps on a phone rather than running off the screen.
import { INK_BUTTON, INK_SOFT, PARCHMENT, SERIF } from "./ui.js";

const NAME_COLOUR = { player: "#ffffff", ally: "#b9f0c3", foe: "#ffc2b0", person: "#ffc2b0" };

/** One fighter's card (`view`: fighthud.js fighterView); a tap on the name asks for their info card. */
function fighterCard(view, onInfo, compact) {
  const card = document.createElement("div");
  card.style.cssText =
    `display:flex;flex-direction:column;gap:3px;box-sizing:border-box;flex:0 1 auto;min-width:${compact ? 86 : 100}px;max-width:${compact ? 150 : 170}px;` +
    `padding:${compact ? "4px 6px" : "5px 7px"};border-radius:8px;background:${view.current ? "rgba(255,211,107,0.2)" : "rgba(255,255,255,0.08)"};` +
    `border:2px solid ${view.current ? "#ffd36b" : "transparent"};${view.down ? "opacity:0.55;" : ""}`;
  const name = document.createElement("button");
  name.type = "button";
  name.textContent = `${view.current ? "▶ " : ""}${view.name}`;
  name.title = `${view.name}: what's known of them`;
  name.style.cssText =
    `all:unset;cursor:pointer;font:700 ${compact ? 13 : 14}px system-ui,sans-serif;color:${NAME_COLOUR[view.kind] ?? "#fff"};` +
    "white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-decoration:underline dotted rgba(255,255,255,0.45);text-underline-offset:3px;";
  name.addEventListener("click", () => onInfo?.(view.id));
  const track = document.createElement("div");
  track.style.cssText = "height:8px;border-radius:4px;background:#30343a;overflow:hidden;";
  track.setAttribute("role", "meter");
  track.setAttribute("aria-label", `${view.name}'s HP`);
  track.setAttribute("aria-valuetext", view.numbers);
  const fill = document.createElement("div");
  fill.style.cssText = `height:100%;width:${Math.round(view.share * 100)}%;background:${view.colour};`;
  track.append(fill);
  const numbers = document.createElement("div");
  numbers.style.cssText = `font:600 ${compact ? 12 : 13}px system-ui,sans-serif;color:#e8ecf0;`;
  numbers.textContent = view.foe ? view.numbers : `HP ${view.numbers}`;
  card.append(name, track, numbers);
  if (view.statuses.length) {
    const marks = document.createElement("div");
    marks.style.cssText = "display:flex;flex-wrap:wrap;gap:3px;";
    for (const mark of view.statuses) {
      const chip = document.createElement("span");
      chip.textContent = view.statuses.length > 2 || compact ? mark.icon : `${mark.icon} ${mark.label}`;
      chip.title = mark.label;
      chip.setAttribute("aria-label", mark.label);
      chip.style.cssText =
        "font:700 11px system-ui,sans-serif;padding:1px 5px;border-radius:6px;background:rgba(255,233,168,0.18);color:#ffe9a8;";
      marks.append(chip);
    }
    card.append(marks);
  }
  return card;
}

/** The fighters as a row of cards that wraps (and scrolls, past a few rows) instead of running off the screen. */
export function cardRow(views, onInfo, compact = false) {
  const row = document.createElement("div");
  row.style.cssText =
    "display:flex;flex-wrap:wrap;gap:5px;justify-content:center;max-height:min(34vh,220px);overflow-y:auto;";
  for (const view of views) row.append(fighterCard(view, onInfo, compact));
  return row;
}

/**
 * What just happened, in a few words (`log`: [{ text, short }], newest last), and a button that opens the
 * lines before it. `open`: they're shown; `onToggle()` flips that.
 */
export function logLines(log, open, onToggle) {
  const box = document.createElement("div");
  box.style.cssText = "display:flex;flex-direction:column;gap:3px;";
  if (!log?.length) return box;
  const last = document.createElement("div");
  last.style.cssText = "display:flex;gap:6px;align-items:flex-start;";
  const words = document.createElement("div");
  words.style.cssText = "flex:1;font:600 14px/1.35 system-ui,sans-serif;color:#fff;";
  words.textContent = log.at(-1).short;
  words.title = log.at(-1).text;
  last.append(words);
  if (log.length > 1) {
    const more = document.createElement("button");
    more.type = "button";
    more.textContent = open ? "Less" : `Before (${log.length - 1})`;
    more.title = open ? "Hide the lines before" : "Show what happened before";
    more.setAttribute("aria-expanded", String(open));
    more.style.cssText =
      "flex:none;font:600 12px system-ui,sans-serif;border:0;border-radius:6px;padding:2px 8px;background:rgba(255,255,255,0.16);color:#fff;cursor:pointer;";
    more.addEventListener("click", onToggle);
    last.append(more);
  }
  box.append(last);
  if (open)
    for (const entry of log.slice(0, -1).reverse()) {
      const line = document.createElement("div");
      line.style.cssText = "font:13px/1.35 system-ui,sans-serif;color:#cfd6dd;";
      line.textContent = entry.short;
      line.title = entry.text;
      box.append(line);
    }
  return box;
}

/** The info card's window, over the world. { show(card), hide(), shown() }. */
export function createInfoCard(layer) {
  const panel = document.createElement("div");
  panel.setAttribute("data-wanderworld-ui", "");
  panel.setAttribute("role", "dialog");
  panel.style.cssText =
    `${PARCHMENT}position:absolute;left:50%;top:calc(60px + env(safe-area-inset-top, 0px));transform:translateX(-50%);display:none;` +
    "flex-direction:column;gap:6px;box-sizing:border-box;width:min(420px,calc(100% - 16px));max-height:calc(100% - 90px);overflow-y:auto;" +
    "padding:12px 14px;pointer-events:auto;font:14px/1.4 system-ui,sans-serif;z-index:5;";
  layer.append(panel);
  const part = (text) => {
    const element = document.createElement("div");
    element.style.cssText = `font:700 13px ${SERIF};margin-top:4px;`;
    element.textContent = text;
    return element;
  };
  const line = (text, soft = false) => {
    const element = document.createElement("div");
    element.textContent = text;
    if (soft) element.style.cssText = `font-size:12px;color:${INK_SOFT};`;
    return element;
  };
  const hide = () => (panel.style.display = "none");
  return {
    /** `card`: fighthud.js creatureCard or personCard. */
    show(card) {
      const head = document.createElement("div");
      head.style.cssText = "display:flex;align-items:flex-start;gap:8px;";
      const title = document.createElement("div");
      title.style.cssText = "flex:1;min-width:0;";
      const name = document.createElement("div");
      name.style.cssText = `font:700 17px ${SERIF};`;
      name.textContent = card.title;
      title.append(name);
      if (card.sub) title.append(line(card.sub, true));
      const close = document.createElement("button");
      close.type = "button";
      close.textContent = "Close";
      close.style.cssText = INK_BUTTON;
      close.addEventListener("click", hide);
      head.append(title, close);
      const nodes = [head];
      const table = document.createElement("div");
      table.style.cssText = "display:grid;grid-template-columns:auto 1fr;gap:2px 10px;";
      for (const [label, text] of card.rows) {
        const key = document.createElement("b");
        key.textContent = label;
        table.append(key, line(text));
      }
      nodes.push(table);
      if (card.statuses?.length) nodes.push(line(`Now: ${card.statuses.map((mark) => mark.label).join(", ")}`));
      if (card.scores) {
        const scores = document.createElement("div");
        scores.style.cssText = "display:flex;flex-wrap:wrap;gap:4px;";
        for (const entry of card.scores) {
          const cell = document.createElement("div");
          cell.style.cssText =
            "flex:1 0 48px;text-align:center;border:1px solid rgba(110,80,40,0.4);border-radius:6px;padding:2px 0;font-size:13px;";
          cell.append(line(entry.id, true), line(`${entry.score} (${entry.mod})`));
          scores.append(cell);
        }
        nodes.push(scores);
      }
      for (const entry of card.defences) nodes.push(line(`${entry.label}: ${entry.items.join(", ")}`));
      if (card.traits.length) nodes.push(part("Traits"), ...card.traits.map((text) => line(text)));
      if (card.acts.length) nodes.push(part("Actions"), ...card.acts.map((text) => line(text)));
      if (card.spells.length) nodes.push(part("Spells"), line(card.spells.join(", ")));
      for (const note of card.notes) nodes.push(line(note, true));
      if (card.check) nodes.push(line(card.check, true));
      if (card.source) nodes.push(line(card.source, true));
      panel.replaceChildren(...nodes);
      panel.style.display = "flex";
    },
    hide,
    shown: () => panel.style.display !== "none",
  };
}

/**
 * The card a beaten player has while their victors stand over them: `state` { text, choices: [{ id, label,
 * title, ready }] }, each choice calling `onChoose(id)`; null takes it away.
 */
export function createOverCard(layer, onChoose) {
  const card = document.createElement("div");
  card.setAttribute("data-wanderworld-ui", "");
  card.style.cssText =
    "position:absolute;left:50%;top:calc(100px + env(safe-area-inset-top, 0px));transform:translateX(-50%);display:none;" +
    "flex-direction:column;gap:7px;box-sizing:border-box;width:min(440px,calc(100% - 16px));padding:9px 12px;border-radius:10px;" +
    "background:rgba(10,14,20,0.86);color:#fff;font:600 14px/1.4 system-ui,sans-serif;pointer-events:auto;";
  layer.append(card);
  let key = "";
  return {
    set(state) {
      const next = JSON.stringify(state);
      if (next === key) return;
      key = next;
      card.style.display = state ? "flex" : "none";
      if (!state) return;
      const text = document.createElement("div");
      text.textContent = state.text;
      const row = document.createElement("div");
      row.style.cssText = "display:flex;flex-wrap:wrap;gap:6px;";
      for (const choice of state.choices) {
        const node = document.createElement("button");
        node.type = "button";
        node.textContent = choice.label;
        node.title = choice.title;
        node.disabled = !choice.ready;
        node.style.cssText = `font:600 14px system-ui,sans-serif;border:0;border-radius:8px;padding:7px 14px;cursor:pointer;background:#3d4a5c;color:#fff;${choice.ready ? "" : "opacity:0.45;"}`;
        node.addEventListener("click", () => onChoose(choice.id));
        row.append(node);
      }
      card.replaceChildren(text, row);
    },
  };
}
