// Conversations: the chat panel at the bottom of the screen and speech bubbles over heads.
//
// For now characters answer with short placeholder lines, and the panel says so: real replies, written by
// the user's own AI connection from the character's and persona's details, come with Wanderworld's server
// part (docs/CONCEPT.md, S3). Everything else here is what that will use.
import { CanvasTexture, LinearFilter, Sprite, SpriteMaterial } from "three";

const CHIP = "background:rgba(10,14,20,0.78);color:#f3f5f7;border-radius:10px;";
const BUBBLE_HEIGHT = 2.5;
const BUBBLE_WIDTH = 420; // canvas pixels a line wraps at
const PLACEHOLDER_REPLIES = [
  "Oh, hello there!",
  "Nice day for a walk, isn't it?",
  "Mm, I was just thinking the same.",
  "Ha! You don't say.",
  "Good to see you around town.",
  "I'll have to remember that.",
];

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
    `${CHIP}position:absolute;left:50%;bottom:12px;transform:translateX(-50%);width:min(560px,calc(100% - 24px));` +
    "display:none;flex-direction:column;gap:6px;padding:10px 12px;pointer-events:auto;font:14px system-ui,sans-serif;";
  const header = document.createElement("div");
  header.style.cssText = "display:flex;align-items:center;gap:8px;";
  const title = document.createElement("div");
  title.style.cssText = "font-weight:700;flex:1;";
  const leave = document.createElement("button");
  leave.type = "button";
  leave.textContent = "Leave (Esc)";
  leave.style.cssText =
    "font:600 13px system-ui,sans-serif;border:0;border-radius:8px;padding:4px 10px;cursor:pointer;";
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
  note.style.cssText = "font-size:12px;opacity:0.7;";
  const form = document.createElement("form");
  form.style.cssText = "display:flex;gap:6px;";
  const input = document.createElement("input");
  input.type = "text";
  input.maxLength = 300;
  input.placeholder = "Say something…";
  input.style.cssText =
    "flex:1;font:14px system-ui,sans-serif;border:0;border-radius:8px;padding:8px 10px;min-width:0;";
  const send = document.createElement("button");
  send.type = "submit";
  send.textContent = "Say";
  send.style.cssText = "font:600 14px system-ui,sans-serif;border:0;border-radius:8px;padding:6px 14px;cursor:pointer;";
  form.append(input, send);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    handlers.onSend(text);
  });
  panel.append(header, log, note, form);
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
    /** Opens the panel for a conversation with `name`. */
    start(name) {
      title.textContent = `Talking with ${name}`;
      log.replaceChildren();
      note.textContent = `Preview: ${name} answers with placeholder lines for now. Real replies, in character, come with Wanderworld's AI update.`;
      panel.style.display = "flex";
      setTimeout(() => input.focus(), 0);
    },
    stop() {
      panel.style.display = "none";
      input.blur();
    },
    /** Adds a line to the log. */
    line,
    /** A bubble over `group` (someone's group) saying `text` for `seconds`. */
    say(group, text, seconds = 4) {
      removeBubble(group);
      const sprite = bubbleSprite(text);
      group.add(sprite);
      bubbles.set(group, { sprite, left: seconds });
    },
    /** A stand-in reply until the server part writes real ones. */
    placeholderReply(count) {
      return PLACEHOLDER_REPLIES[count % PLACEHOLDER_REPLIES.length];
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
