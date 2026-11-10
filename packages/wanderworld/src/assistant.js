// The AI assistant (Settings → AI assistant): a chat about this world with the model, which can also
// change the world's own lore and people. The model's answer is read and checked on the server
// (server.mjs `readAssistant`); what it asks to change is applied in main.js and listed back here, so
// the player always sees what was changed, what was left out, and why.
import { INK_BUTTON, INK_INPUT, INK_SMALL, INK_SOFT } from "./ui.js";

function element(tag, css, text) {
  const node = document.createElement(tag);
  if (css) node.style.cssText = css;
  if (text !== undefined) node.textContent = text;
  return node;
}

/**
 * The assistant's rows for the Settings panel. `onAsk(history)` → Promise<{ reply, changes: [text],
 * skipped: [text], problem }>, where history is [{ role: "user" | "assistant", text }], the newest last.
 */
export function createAssistant(onAsk) {
  const box = element("div", "display:flex;flex-direction:column;gap:6px;");
  const log = element(
    "div",
    "display:flex;flex-direction:column;gap:6px;max-height:320px;overflow-y:auto;padding:2px;font-size:13px;line-height:1.4;",
  );
  log.setAttribute("aria-live", "polite");
  const input = element(
    "textarea",
    `${INK_INPUT}width:100%;box-sizing:border-box;min-height:64px;font:13px system-ui,sans-serif;resize:vertical;`,
  );
  input.placeholder = "Make Jake and Sarah a married couple who live together.";
  input.setAttribute("aria-label", "Ask the AI assistant");
  input.addEventListener("keydown", (event) => {
    event.stopPropagation(); // typing here doesn't walk
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void send();
    }
  });
  const status = element("div", `font-size:12px;color:${INK_SOFT};`);
  const sendButton = element("button", INK_BUTTON, "Send");
  sendButton.type = "button";
  sendButton.addEventListener("click", () => void send());
  const clear = element("button", INK_SMALL, "Start over");
  clear.type = "button";
  clear.title = "Forget this chat (nothing in the world is undone)";
  const buttons = element("div", "display:flex;gap:6px;align-items:center;");
  buttons.append(sendButton, clear, status);

  let history = [];
  let busy = false;
  const bubble = (mine) =>
    element(
      "div",
      `padding:6px 8px;border-radius:8px;white-space:pre-wrap;overflow-wrap:anywhere;` +
        (mine
          ? "align-self:flex-end;background:rgba(107,74,43,0.85);color:#f6ecd6;max-width:90%;"
          : "align-self:flex-start;background:rgba(107,74,43,0.12);max-width:95%;"),
    );
  const say = (text, mine) => {
    const node = bubble(mine);
    node.textContent = text;
    log.append(node);
    log.scrollTop = log.scrollHeight;
    return node;
  };
  /** What an answer did: the changes made, what was left out, and anything that went wrong. */
  const report = ({ changes = [], skipped = [], problem = "" }) => {
    if (!changes.length && !skipped.length && !problem) return;
    const node = element(
      "div",
      "align-self:stretch;border:1px solid rgba(107,74,43,0.45);border-radius:8px;padding:6px 8px;font-size:12px;",
    );
    const list = (title, lines) => {
      if (!lines.length) return;
      node.append(element("div", "font-weight:700;", title));
      for (const line of lines) node.append(element("div", "padding-left:10px;", `• ${line}`));
    };
    list("Changed in this world", changes);
    list("Left as it was", skipped);
    if (problem) node.append(element("div", "font-weight:700;color:#8e2a20;", problem));
    log.append(node);
    log.scrollTop = log.scrollHeight;
  };
  clear.addEventListener("click", () => {
    if (busy) return;
    history = [];
    log.replaceChildren();
    status.textContent = "";
  });

  async function send() {
    const text = input.value.trim();
    if (!text || busy) return;
    busy = true;
    sendButton.disabled = true;
    input.value = "";
    const asked = say(text, true);
    history.push({ role: "user", text });
    status.textContent = "Thinking…";
    try {
      const answer = await onAsk(history.slice(-12));
      const reply = answer?.reply || (answer?.changes?.length ? "Done." : "");
      if (reply) say(reply, false);
      report(answer ?? {});
      // What was done goes back with the chat, so a follow-up ("and their daughter too") knows of it.
      const did = [...(answer?.changes ?? []), ...(answer?.skipped ?? []).map((line) => `Not done: ${line}`)];
      history.push({ role: "assistant", text: [reply, ...did].filter(Boolean).join("\n") || "(no answer)" });
      status.textContent = "";
    } catch (error) {
      history.pop(); // not asked after all: ask again as it was
      asked.remove();
      input.value = text;
      status.textContent = error?.message ?? String(error);
    } finally {
      busy = false;
      sendButton.disabled = false;
    }
  }

  box.append(log, input, buttons);
  return box;
}
