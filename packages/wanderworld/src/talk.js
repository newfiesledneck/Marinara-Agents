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
function bubbleSprite(text, who = "") {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const font = "500 26px system-ui, sans-serif";
  context.font = font;
  // Who's speaking leads the words ("Stranger: Hi there!"): their name tag gives way to it while it's up.
  const words = `${who ? `${who}: ` : ""}${text}`.split(/\s+/u);
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
  // [i]: who knows whose name, explained, with a switch for each.
  const known = document.createElement("button");
  known.type = "button";
  known.textContent = "i";
  known.title = "Names: whether you know theirs, and they know yours";
  known.setAttribute("aria-label", "About names");
  known.style.cssText = `${leave.style.cssText}width:22px;height:22px;padding:0;border-radius:50%;font:italic 700 13px Georgia,serif;`;
  const info = document.createElement("div");
  info.style.cssText = `display:none;flex-direction:column;gap:4px;font-size:12px;line-height:1.35;border:1px solid rgba(107,74,43,0.4);border-radius:8px;padding:6px 8px;`;
  const knowing = (which) => {
    const row = document.createElement("label");
    row.style.cssText = "display:flex;gap:6px;align-items:flex-start;";
    const box = document.createElement("input");
    box.type = "checkbox";
    const words = document.createElement("span");
    box.addEventListener("change", () => handlers.onKnowing?.(which, box.checked));
    row.append(box, words);
    info.append(row);
    return { box, words };
  };
  const mine = knowing("mine");
  const theirs = knowing("theirs");
  known.addEventListener("click", () => (info.style.display = info.style.display === "none" ? "flex" : "none"));
  header.append(title, known, party, leave);
  // What they look like, folded away under the title.
  const looks = document.createElement("details");
  looks.style.cssText = `font-size:12px;color:${INK_SOFT};`;
  const looksTitle = document.createElement("summary");
  looksTitle.style.cssText = "cursor:pointer;";
  looksTitle.textContent = "Look at them";
  const looksText = document.createElement("div");
  looksText.style.cssText = "padding:3px 0 2px 12px;line-height:1.4;";
  looks.append(looksTitle, looksText);
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
  panel.append(header, info, looks, log, note, choices, form);
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
    for (const tag of bubble.tags) tag.visible = true;
    bubble.sprite.material.map.dispose();
    bubble.sprite.material.dispose();
    bubbles.delete(group);
  }

  return {
    get open() {
      return panel.style.display !== "none";
    },
    /**
     * Who knows whose name, for the [i] panel: `state` is { name (theirs), shown (what they're called
     * now), mine (the player knows it), theirs (they know the player's), you (the player's name),
     * fixed (both are known for good: a history together, or all names are shown) }.
     */
    setKnowing(state) {
      title.textContent = `Talking with ${state.shown}`;
      mine.box.checked = state.mine;
      theirs.box.checked = state.theirs;
      mine.box.disabled = theirs.box.disabled = !!state.fixed;
      mine.words.textContent = state.mine
        ? `You know their name: ${state.name}. Untick to forget it, and they're a Stranger again.`
        : "You don't know this person's name, so they're a Stranger to you. Tick this once you do (or ask them: it's learned when they say it).";
      theirs.words.textContent = state.theirs
        ? `They know your name: ${state.you}. Untick, and they won't use it.`
        : "They don't know your name, so they won't use it. Tick this once they do (or tell them: it's learned when you say it).";
      if (state.fixed) theirs.words.textContent += ` ${state.fixed}`;
    },
    /** What they look like, for the fold under the title ("" while it isn't known). */
    setLooks(words) {
      looksText.textContent = words || "Nothing stands out.";
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
    say(group, text, seconds = 4, who = "") {
      removeBubble(group);
      const sprite = bubbleSprite(text, who);
      // Their name tag (npcs.js) steps aside for the bubble, which says who it is.
      const tags = group.children.filter((child) => child.visible && child.userData?.nameTag);
      for (const tag of tags) tag.visible = false;
      group.add(sprite);
      bubbles.set(group, { sprite, left: seconds, tags });
    },
    /** Counts bubbles down and takes them away when their time is up. */
    update(dt) {
      for (const [group, bubble] of bubbles) {
        bubble.left -= dt;
        if (bubble.left <= 0) removeBubble(group);
      }
      // People standing together: each bubble sits above the ones already up, not over them.
      const placed = [];
      for (const [group, bubble] of bubbles) {
        let lift = 0;
        for (const below of placed) {
          if (Math.hypot(below.group.position.x - group.position.x, below.group.position.z - group.position.z) < 3.2)
            lift = Math.max(lift, below.top + 0.1);
        }
        bubble.sprite.position.y = BUBBLE_HEIGHT + lift;
        placed.push({ group, top: lift + bubble.sprite.scale.y });
      }
    },
    /** How many bubbles are up. */
    bubbleCount: () => bubbles.size,
    clearBubbles() {
      for (const group of [...bubbles.keys()]) removeBubble(group);
    },
    destroy() {
      this.clearBubbles();
      panel.remove();
    },
  };
}
