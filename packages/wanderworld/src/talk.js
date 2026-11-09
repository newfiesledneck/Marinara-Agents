// Conversations: the chat panel at the bottom of the screen and speech bubbles over heads.
//
// For now characters answer with short placeholder lines, and the panel says so: real replies, written by
// the user's own AI connection from the character's and persona's details, come with Wanderworld's server
// part (docs/CONCEPT.md, S3). Everything else here is what that will use.
import { CanvasTexture, LinearFilter, Sprite, SpriteMaterial } from "three";
import { INK_BUTTON, INK_INPUT, INK_SOFT, PARCHMENT_EDGED, SERIF } from "./ui.js";

const BUBBLE_HEIGHT = 2.5;
const BUBBLE_WIDTH = 420; // canvas pixels a line wraps at

/** A speech bubble: wrapped text on a rounded card, drawn once to a canvas. */
function bubbleSprite(text) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const font = "500 26px system-ui, sans-serif";
  context.font = font;
  const words = String(text).split(/\s+/u);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (context.measureText(next).width > BUBBLE_WIDTH && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  const shown = lines.slice(0, 4);
  if (lines.length > 4) shown[3] = `${shown[3]}…`;
  const width = Math.ceil(Math.max(...shown.map((entry) => context.measureText(entry).width))) + 36;
  const height = shown.length * 34 + 26;
  canvas.width = width;
  canvas.height = height + 14;
  context.font = font;
  context.fillStyle = "rgba(255, 255, 255, 0.94)";
  context.beginPath();
  context.roundRect(0, 0, width, height, 16);
  context.moveTo(width / 2 - 12, height);
  context.lineTo(width / 2, height + 14);
  context.lineTo(width / 2 + 12, height);
  context.fill();
  context.fillStyle = "#1d232b";
  context.textBaseline = "top";
  shown.forEach((entry, i) => context.fillText(entry, 18, 14 + i * 34));
  const texture = new CanvasTexture(canvas);
  texture.minFilter = LinearFilter;
  const sprite = new Sprite(
    new SpriteMaterial({ map: texture, depthWrite: false, depthTest: false, transparent: true }),
  );
  const scale = 0.0042;
  sprite.scale.set(canvas.width * scale, canvas.height * scale, 1);
  sprite.center.set(0.5, 0);
  sprite.position.y = BUBBLE_HEIGHT;
  sprite.renderOrder = 20;
  return sprite;
}

/** `handlers`: onSend(text), onLeave(), and onParty() (they join or leave the party). */
export function createTalk(layer, handlers) {
  const bubbles = new Map(); // speaker group → { sprite, left }

  const panel = document.createElement("div");
  panel.setAttribute("data-wanderworld-ui", "");
  panel.style.cssText =
    `${PARCHMENT_EDGED}position:absolute;left:50%;bottom:12px;transform:translateX(-50%);width:min(560px,calc(100% - 24px));` +
    "display:none;flex-direction:column;gap:6px;padding:18px 22px;pointer-events:auto;font:14px system-ui,sans-serif;";
  const header = document.createElement("div");
  header.style.cssText = "display:flex;align-items:center;gap:8px;";
  const title = document.createElement("div");
  title.style.cssText = `font:700 16px ${SERIF};flex:1;`;
  const leave = document.createElement("button");
  leave.type = "button";
  leave.textContent = "Leave (Esc)";
  leave.style.cssText = INK_BUTTON;
  leave.addEventListener("click", () => handlers.onLeave());
  // Come with me / Part ways: whether they join the party.
  const party = document.createElement("button");
  party.type = "button";
  party.style.cssText = leave.style.cssText;
  party.addEventListener("click", () => handlers.onParty?.());
  header.append(title, party, leave);
  const log = document.createElement("div");
  log.style.cssText = "max-height:140px;overflow-y:auto;display:flex;flex-direction:column;gap:3px;";
  const note = document.createElement("div");
  note.style.cssText = `font-size:12px;color:${INK_SOFT};font-style:italic;`;
  const form = document.createElement("form");
  form.style.cssText = "display:flex;gap:6px;";
  const input = document.createElement("input");
  input.type = "text";
  input.maxLength = 300;
  input.placeholder = "Say something…";
  input.style.cssText = `${INK_INPUT}flex:1;min-width:0;`;
  const send = document.createElement("button");
  send.type = "submit";
  send.textContent = "Say";
  send.style.cssText = INK_BUTTON;
  form.append(input, send);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    handlers.onSend(text);
  });
  // Things to say: a few choices (dialogue.js), above the box for your own words.
  const choices = document.createElement("div");
  choices.style.cssText = "display:flex;gap:6px;flex-wrap:wrap;";
  panel.append(header, log, note, choices, form);
  layer.append(panel);

  function line(who, text, muted = false) {
    const entry = document.createElement("div");
    entry.style.cssText = muted ? "opacity:0.65;font-style:italic;" : "";
    const name = document.createElement("b");
    name.textContent = who ? `${who}: ` : "";
    entry.append(name, document.createTextNode(text));
    log.append(entry);
    log.scrollTop = log.scrollHeight;
  }

  function removeBubble(group) {
    const bubble = bubbles.get(group);
    if (!bubble) return;
    bubble.sprite.removeFromParent();
    bubble.sprite.material.map.dispose();
    bubble.sprite.material.dispose();
    bubbles.delete(group);
  }

  return {
    get open() {
      return panel.style.display !== "none";
    },
    /** The party button: "Part ways" when they're with you, else "Come with me". */
    setInParty(inParty) {
      party.textContent = inParty ? "Part ways" : "Come with me";
    },
    /** Opens the panel for a conversation with `name` (`ai`: replies come from the model). */
    start(name, ai = false) {
      title.textContent = `Talking with ${name}`;
      log.replaceChildren();
      note.textContent = ai
        ? `${name} answers in their own words (Menu → Settings → AI). The choices below are things you could say.`
        : "Set lines: turn on AI conversations in Menu → Settings → AI (with Wanderworld's server part running) for replies in character.";
      panel.style.display = "flex";
      setTimeout(() => input.focus(), 0);
    },
    stop() {
      panel.style.display = "none";
      input.blur();
    },
    /** Adds a line to the log. */
    line,
    /** The things the player can say: [{ id, label }], each calling `onChoose(id)`; empty for none. */
    setChoices(list, onChoose) {
      choices.replaceChildren(
        ...list.map(({ id, label }) => {
          const choice = document.createElement("button");
          choice.type = "button";
          choice.textContent = label;
          choice.style.cssText = `${INK_BUTTON}font-size:13px;padding:4px 10px;`;
          choice.addEventListener("click", () => onChoose(id));
          return choice;
        }),
      );
    },
    /** A bubble over `group` (someone's group) saying `text` for `seconds`. */
    say(group, text, seconds = 4) {
      removeBubble(group);
      const sprite = bubbleSprite(text);
      group.add(sprite);
      bubbles.set(group, { sprite, left: seconds });
    },
    /** Counts bubbles down and takes them away when their time is up. */
    update(dt) {
      for (const [group, bubble] of bubbles) {
        bubble.left -= dt;
        if (bubble.left <= 0) removeBubble(group);
      }
    },
    clearBubbles() {
      for (const group of [...bubbles.keys()]) removeBubble(group);
    },
    destroy() {
      this.clearBubbles();
      panel.remove();
    },
  };
}
