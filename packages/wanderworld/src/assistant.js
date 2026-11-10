// The AI assistant (Settings → AI assistant): a chat about this world with the model, which can also
// propose changes to the world's own lore and people. The model's answer is read and checked on the
// server (server.mjs `readAssistant`); what it asks to change is shown here first, each change in full,
// and only made (in main.js) once the player presses Confirm. What was changed, what was left out and
// why, and anything that couldn't be read are always said.
import { INK_BUTTON, INK_INPUT, INK_SMALL, INK_SOFT } from "./ui.js";

function element(tag, css, text) {
  const node = document.createElement(tag);
  if (css) node.style.cssText = css;
  if (text !== undefined) node.textContent = text;
  return node;
}

function button(label, css, onClick) {
  const node = element("button", css, label);
  node.type = "button";
  node.addEventListener("click", onClick);
  return node;
}

/**
 * The assistant's rows for the Settings panel. `onAsk(history)` → Promise<{ reply, problem,
 * proposed: [{ line, before, after, edit, fields }], skipped: [text], apply }>, where history is
 * [{ role: "user" | "assistant", text }], the newest last, and `apply(revised)` (null with nothing
 * proposed) makes the changes and returns { changes: [{ line }], skipped: [text], undo }. `edit` groups a
 * proposal's lines by the edit they come from, `fields` are that edit's parts the player may rewrite, and
 * `revised` is what they left: [{ edit, keep, values: { key: text } }].
 */
export function createAssistant(onAsk) {
  const box = element("div", "display:flex;flex-direction:column;gap:6px;");
  const log = element(
    "div",
    "display:flex;flex-direction:column;gap:6px;max-height:360px;overflow-y:auto;padding:2px;font-size:13px;line-height:1.4;",
  );
  log.setAttribute("aria-live", "polite");
  const input = element(
    "textarea",
    `${INK_INPUT}width:100%;box-sizing:border-box;min-height:64px;font:13px system-ui,sans-serif;resize:vertical;`,
  );
  input.placeholder =
    "Write your request or ask about your world. (Ex. Make Jason an old elven warrior who is married to Sothera)";
  input.setAttribute("aria-label", "Ask the AI assistant");
  input.addEventListener("keydown", (event) => {
    event.stopPropagation(); // typing here doesn't walk
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void send();
    }
  });
  const status = element("div", `font-size:12px;color:${INK_SOFT};`);
  const sendButton = button("Send", INK_BUTTON, () => void send());
  const clear = button("Start over", INK_SMALL, () => {
    if (busy) return;
    pending?.cancel(false);
    history = [];
    log.replaceChildren();
    status.textContent = "";
  });
  clear.title = "Forget this chat (nothing in the world is undone)";
  const buttons = element("div", "display:flex;gap:6px;align-items:center;");
  buttons.append(sendButton, clear, status);

  let history = [];
  let busy = false;
  let pending = null; // a proposal waiting for Confirm or Cancel: { cancel(said) }
  let lastUndo = null; // the Undo button of the changes made last
  const scroll = () => (log.scrollTop = log.scrollHeight);
  const say = (text, mine) => {
    const node = element(
      "div",
      `padding:6px 8px;border-radius:8px;white-space:pre-wrap;overflow-wrap:anywhere;` +
        (mine
          ? "align-self:flex-end;background:rgba(107,74,43,0.85);color:#f6ecd6;max-width:90%;"
          : "align-self:flex-start;background:rgba(107,74,43,0.12);max-width:95%;"),
      text,
    );
    log.append(node);
    scroll();
    return node;
  };
  const card = () =>
    element(
      "div",
      "align-self:stretch;border:1px solid rgba(107,74,43,0.45);border-radius:8px;padding:6px 8px;font-size:12px;display:flex;flex-direction:column;gap:3px;",
    );
  const list = (node, title, lines) => {
    if (!lines.length) return;
    node.append(element("div", "font-weight:700;", title));
    for (const line of lines) node.append(element("div", "padding-left:10px;", `• ${line}`));
  };
  const trouble = (node, text) => text && node.append(element("div", "font-weight:700;color:#8e2a20;", text));

  /**
   * A proposal: every change in full (a rewrite with its new text, and what it says now folded under it),
   * what can't be done, and Confirm / Cancel. Each change has a tick to leave it out, and its written
   * parts can be rewritten before Confirm. `turn` is the chat's record of it, filled in with the outcome.
   */
  const propose = ({ proposed, skipped, problem, apply }, turn, reply) => {
    const node = card();
    node.append(element("div", "font-weight:700;", "Proposed changes (nothing is changed yet)"));
    node.append(
      element(
        "div",
        `color:${INK_SOFT};`,
        "Untick a change to leave it out. You can rewrite the text, or pick another kind, before you confirm.",
      ),
    );
    const groups = new Map(); // an edit's index → { keep: its tick, inputs: Map(key → the box it's typed in) }
    for (const change of proposed) {
      let group = groups.get(change.edit);
      const line = element("label", "display:flex;gap:6px;align-items:flex-start;padding-left:2px;");
      if (group)
        line.style.paddingLeft = "26px"; // more of the same edit
      else {
        group = { keep: element("input", "flex:none;width:18px;height:18px;margin:0;"), inputs: new Map() };
        group.keep.type = "checkbox";
        group.keep.checked = true;
        group.keep.setAttribute("aria-label", "Make this change");
        groups.set(change.edit, group);
        line.append(group.keep);
      }
      line.append(element("span", "", change.line));
      node.append(line);
      for (const part of change.fields ?? []) {
        const typed = element(
          part.options ? "select" : part.multi ? "textarea" : "input",
          `${INK_INPUT}width:100%;box-sizing:border-box;font:13px system-ui,sans-serif;${part.multi ? "min-height:84px;resize:vertical;" : ""}`,
        );
        if (part.options)
          for (const option of part.options) {
            const choice = element("option", "", option.label);
            choice.value = option.value;
            typed.append(choice);
          }
        else if (part.multi) typed.maxLength = part.max;
        else {
          typed.type = "text";
          typed.maxLength = part.max;
        }
        typed.value = part.value;
        typed.setAttribute("aria-label", part.label);
        typed.addEventListener("keydown", (event) => event.stopPropagation()); // typing here doesn't walk
        const wrap = element("div", "margin:2px 0 2px 26px;display:flex;flex-direction:column;gap:2px;");
        wrap.append(element("div", `color:${INK_SOFT};`, part.label), typed);
        node.append(wrap);
        group.inputs.set(part.key, typed);
      }
      if (!change.after) continue;
      if (!change.fields?.length)
        node.append(
          element(
            "div",
            "margin:2px 0 2px 26px;padding:5px 7px;border-radius:6px;background:rgba(107,74,43,0.1);white-space:pre-wrap;overflow-wrap:anywhere;",
            change.after,
          ),
        );
      if (change.before) {
        const fold = element("details", "margin-left:26px;");
        fold.append(
          element("summary", "cursor:pointer;", "What it says now"),
          element("div", `white-space:pre-wrap;overflow-wrap:anywhere;color:${INK_SOFT};`, change.before),
        );
        node.append(fold);
      } else if (change.before === "")
        node.append(element("div", `margin-left:26px;color:${INK_SOFT};`, "(Nothing is written there yet.)"));
    }
    list(node, "Can't be done", skipped);
    trouble(node, problem);
    const row = element("div", "display:flex;gap:6px;align-items:center;margin-top:4px;");
    const outcome = element("div", "font-weight:700;");
    const said = [reply, "Proposed:", ...proposed.map((change) => change.line)].filter(Boolean).join("\n");
    const close = (words, record) => {
      pending = null;
      row.remove();
      for (const group of groups.values()) {
        group.keep.disabled = true;
        for (const typed of group.inputs.values()) {
          typed.readOnly = true;
          if (typed.tagName === "SELECT") typed.disabled = true;
        }
      }
      outcome.textContent = words;
      node.append(outcome);
      turn.text = `${said}\n${record}`;
      scroll();
    };
    const mine = {
      cancel: (shown = true) =>
        close(shown ? "Cancelled: nothing was changed." : "", "The player cancelled: nothing was changed."),
    };
    row.append(
      button("Confirm", `${INK_BUTTON}background:#6b4a2b;color:#f6ecd6;`, () => {
        if (pending !== mine) return;
        try {
          const done = apply(
            [...groups].map(([edit, group]) => ({
              edit,
              keep: group.keep.checked,
              values: Object.fromEntries([...group.inputs].map(([key, typed]) => [key, typed.value])),
            })),
          );
          close(
            done.changes.length ? "Done." : "Nothing was changed.",
            done.changes.length
              ? `The player confirmed (after any rewriting of their own). Changed: ${done.changes.map((change) => change.line).join(" ")}`
              : "The player left every change out: nothing was changed.",
          );
          const after = card();
          list(
            after,
            "Changed in this world",
            done.changes.map((change) => change.line),
          );
          list(after, "Left as it was", done.skipped);
          // Undo, for the changes made last (it takes back those changes only; what changed since stays).
          lastUndo?.remove();
          const undo = button("Undo these changes", INK_SMALL, () => {
            if (busy) return;
            undo.remove();
            lastUndo = null;
            try {
              done.undo();
              after.append(
                element(
                  "div",
                  "font-weight:700;",
                  "Undone: these changes are taken back. Anything you changed since is kept.",
                ),
              );
              turn.text += "\nThe player then undid these changes: they are taken back.";
            } catch (error) {
              after.append(element("div", "font-weight:700;color:#8e2a20;", `Not undone: ${error?.message ?? error}`));
            }
            scroll();
          });
          undo.style.alignSelf = "flex-start";
          if (done.undo) {
            after.append(undo);
            lastUndo = undo;
          }
          if (after.childElementCount) log.append(after);
        } catch (error) {
          close(`Not changed: ${error?.message ?? error}`, "It failed: nothing was changed.");
        }
        scroll();
      }),
      button("Cancel", INK_SMALL, () => pending === mine && mine.cancel()),
    );
    node.append(row);
    turn.text = `${said}\n(Waiting for the player to confirm or cancel.)`;
    pending = mine;
    log.append(node);
    scroll();
  };

  async function send() {
    const text = input.value.trim();
    if (!text || busy) return;
    busy = true;
    sendButton.disabled = true;
    pending?.cancel(); // asking something else drops a proposal that wasn't confirmed
    input.value = "";
    const asked = say(text, true);
    history.push({ role: "user", text });
    status.textContent = "Thinking…";
    try {
      const answer = (await onAsk(history.slice(-12))) ?? {};
      const reply = answer.reply || "";
      if (reply) say(reply, false);
      const turn = { role: "assistant", text: reply || "(no answer)" };
      history.push(turn);
      if (answer.apply && answer.proposed?.length) propose(answer, turn, reply);
      else if (answer.skipped?.length || answer.problem) {
        // Nothing to confirm: what it asked for can't be done, or couldn't be read.
        const node = card();
        list(node, "Can't be done", answer.skipped ?? []);
        trouble(node, answer.problem);
        log.append(node);
        turn.text = [reply, ...(answer.skipped ?? []).map((line) => `Not done: ${line}`), answer.problem]
          .filter(Boolean)
          .join("\n");
        scroll();
      }
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
