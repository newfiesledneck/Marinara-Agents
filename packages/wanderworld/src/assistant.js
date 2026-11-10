// The AI assistant (Settings → AI assistant): a chat about this world with the model, which can also
// propose changes to the world's own lore and people. The model's answer is read and checked on the
// server (server.mjs `readAssistant`); what it asks to change is shown here first, each change in full,
// and only made (in main.js) once the player presses Confirm. What was changed, what was left out and
// why, and anything that couldn't be read are always said. Ready-made requests (assistant-context.js
// PICKS) sit above the box for anyone who doesn't know what to ask.
import { PICKS } from "./assistant-context.js";
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

const KEPT = 40; // turns of the chat kept with the world
const MOST_ENTRIES = 20; // lorebook entries a keyword draft takes (server.mjs takes no more)

/**
 * The assistant's rows for the Settings panel. `handlers`:
 * - `onAsk(history, options)` → Promise<{ reply, problem, proposed: [{ line, before, after, edit, kind,
 *   fields }], skipped: [text], sent: [text], copy, apply }>. `history` is [{ role: "user" | "assistant",
 *   text }], the newest last; `options` { pick (a PICKS id), book, entries (for the keyword draft) };
 *   `apply(revised)` (null with nothing proposed) makes the changes and returns { changes: [{ line }],
 *   skipped: [text], undo }. `edit` groups a proposal's lines by the edit they come from, `fields` are
 *   that edit's parts the player may change, and `revised` is what they left: [{ edit, keep, values }].
 * - `onChat(history)`: the chat as it stands, to keep with the world.
 * - `onLorebooks()` → Promise<[{ id, name, entries: [{ id, title }] }]>, for the keyword draft.
 * The node has `setChat(history)`: the chat a world was left with (when one is opened).
 */
export function createAssistant(handlers) {
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
    keep();
  });
  clear.title = "Forget this chat (nothing in the world is undone)";
  const buttons = element("div", "display:flex;gap:6px;align-items:center;");
  buttons.append(sendButton, clear, status);

  let history = [];
  let busy = false;
  let pending = null; // a proposal waiting for Confirm or Cancel: { cancel(said) }
  let filled = null; // the ready-made request whose start is in the box, for the player to finish
  const scroll = () => (log.scrollTop = log.scrollHeight);
  const keep = () => handlers.onChat?.(history.slice(-KEPT).map((turn) => ({ role: turn.role, text: turn.text })));
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
  const note = (text) => {
    const node = element("div", `align-self:flex-start;font-size:11px;color:${INK_SOFT};`, text);
    log.append(node);
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
  const setBusy = (on, words = "") => {
    busy = on;
    sendButton.disabled = on;
    status.textContent = words;
  };

  /** The box an edit's part is changed in: a choice, a number or words. */
  const control = (part) => {
    const css = `${INK_INPUT}width:100%;box-sizing:border-box;font:13px system-ui,sans-serif;`;
    if (part.options) {
      const typed = element("select", css);
      for (const option of part.options) {
        const entry = element("option", "", option.label);
        entry.value = option.value;
        typed.append(entry);
      }
      typed.value = part.value;
      return { typed, shown: typed };
    }
    if (part.number) {
      const typed = element("input", "flex:1;min-width:0;");
      typed.type = "range";
      [typed.min, typed.max] = part.number.map(String);
      typed.value = part.value || String(part.number[1]);
      const told = element("span", "flex:none;min-width:5.5em;text-align:right;", `${typed.value} of ${typed.max}`);
      typed.addEventListener("input", () => (told.textContent = `${typed.value} of ${typed.max}`));
      const shown = element("div", "display:flex;gap:8px;align-items:center;");
      shown.append(typed, told);
      return { typed, shown };
    }
    const typed = element(
      part.multi ? "textarea" : "input",
      `${css}${part.multi ? "min-height:84px;resize:vertical;" : ""}`,
    );
    if (!part.multi) typed.type = "text";
    typed.maxLength = part.max;
    typed.value = part.value;
    return { typed, shown: typed };
  };

  /**
   * A proposal: every change in full (a rewrite with its new text, and what it says now folded under it),
   * what can't be done, and Confirm / Cancel. Each change has a tick to leave it out, its written parts
   * and choices can be changed before Confirm, and its text can be asked for again. `turn` is the chat's
   * record of it, filled in with the outcome; `options` what it was asked with.
   */
  const propose = ({ proposed, skipped, problem, apply }, turn, reply, options) => {
    const node = card();
    node.append(element("div", "font-weight:700;", "Proposed changes (nothing is changed yet)"));
    node.append(
      element(
        "div",
        `color:${INK_SOFT};`,
        "Untick a change to leave it out. You can rewrite the text and change the choices before you confirm.",
      ),
    );
    const groups = new Map(); // an edit's index → { keep: its tick, inputs: Map(key → the box it's set in) }
    const againButtons = [];
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
        const { typed, shown } = control(part);
        typed.setAttribute("aria-label", part.label);
        typed.addEventListener("keydown", (event) => event.stopPropagation()); // typing here doesn't walk
        const wrap = element("div", "margin:2px 0 2px 26px;display:flex;flex-direction:column;gap:2px;");
        wrap.append(element("div", `color:${INK_SOFT};`, part.label), shown);
        node.append(wrap);
        group.inputs.set(part.key, typed);
      }
      // Written by the model: it can write it again, into the same boxes.
      const written = (change.fields ?? []).filter((part) => part.multi);
      if (written.length) {
        const mine = group;
        const again = button("Write it again", INK_SMALL, async () => {
          if (busy || pending !== own) return;
          setBusy(true, "Writing it again…");
          try {
            const answer = await handlers.onAsk(
              [
                ...history.slice(-11).map((entry) => ({ role: entry.role, text: entry.text })),
                {
                  role: "user",
                  text: `Write this one change again, differently, as the same kind of edit about the same thing, and propose nothing else: "${change.line}"`,
                },
              ],
              options,
            );
            const match = (answer?.proposed ?? []).find((other) => other.kind === change.kind && other.fields?.length);
            if (!match) status.textContent = "It didn't come back with another version.";
            else {
              for (const part of match.fields)
                if (part.multi && mine.inputs.has(part.key)) mine.inputs.get(part.key).value = part.value;
              status.textContent = "";
            }
          } catch (error) {
            status.textContent = error?.message ?? String(error);
          } finally {
            busy = false;
            sendButton.disabled = false;
          }
        });
        again.style.cssText += "align-self:flex-start;margin-left:26px;";
        again.title = "Asks the model for this text again (one more call)";
        againButtons.push(again);
        node.append(again);
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
      for (const again of againButtons) again.remove();
      for (const group of groups.values()) {
        group.keep.disabled = true;
        for (const typed of group.inputs.values()) {
          typed.readOnly = true;
          if (typed.tagName === "SELECT" || typed.type === "range") typed.disabled = true;
        }
      }
      outcome.textContent = words;
      node.append(outcome);
      turn.text = `${said}\n${record}`;
      keep();
      scroll();
    };
    const own = {
      cancel: (shown = true) =>
        close(shown ? "Cancelled: nothing was changed." : "", "The player cancelled: nothing was changed."),
    };
    row.append(
      button("Confirm", `${INK_BUTTON}background:#6b4a2b;color:#f6ecd6;`, () => {
        if (pending !== own || busy) return;
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
              ? `The player confirmed (after any changes of their own). Changed: ${done.changes.map((change) => change.line).join(" ")}`
              : "The player left every change out: nothing was changed.",
          );
          const after = card();
          list(
            after,
            "Changed in this world",
            done.changes.map((change) => change.line),
          );
          list(after, "Left as it was", done.skipped);
          // Undo takes back these changes only (what changed since stays), so each set keeps its own:
          // an older one can still be undone after a newer.
          const undo = button("Undo these changes", INK_SMALL, () => {
            if (busy) return;
            undo.remove();
            try {
              done.undo();
              after.append(
                element(
                  "div",
                  "font-weight:700;",
                  "Undone: these changes are taken back. Anything changed since is kept.",
                ),
              );
              turn.text += "\nThe player then undid these changes: they are taken back.";
              keep();
            } catch (error) {
              after.append(element("div", "font-weight:700;color:#8e2a20;", `Not undone: ${error?.message ?? error}`));
            }
            scroll();
          });
          undo.style.alignSelf = "flex-start";
          if (done.undo) after.append(undo);
          if (after.childElementCount) log.append(after);
        } catch (error) {
          close(`Not changed: ${error?.message ?? error}`, "It failed: nothing was changed.");
        }
        scroll();
      }),
      button("Cancel", INK_SMALL, () => pending === own && !busy && own.cancel()),
    );
    node.append(row);
    turn.text = `${said}\n(Waiting for the player to confirm or cancel.)`;
    pending = own;
    log.append(node);
    scroll();
  };

  /** Sends `words` (or what's in the box), with what it was asked with: { pick, book, entries, shown }. */
  async function send(words = null, options = {}) {
    const typed = words === null;
    const text = (typed ? input.value : words).trim();
    if (!text || busy) return;
    // A ready-made request the player finished in the box keeps its own parts of the world.
    if (typed && filled && text.startsWith(filled.fill.trim()) && text.length > filled.fill.trim().length)
      options = { pick: filled.id };
    filled = null;
    pending?.cancel(); // asking something else drops a proposal that wasn't confirmed
    if (typed) input.value = "";
    setBusy(true, "Thinking…");
    const asked = say(options.shown ?? text, true);
    history.push({ role: "user", text: options.shown ?? text });
    try {
      const answer =
        (await handlers.onAsk(
          history.slice(-12).map((turn) => ({ role: turn.role, text: turn.text })),
          { pick: options.pick ?? null, book: options.book ?? null, entries: options.entries ?? null },
        )) ?? {};
      const reply = answer.reply || "";
      if (reply) {
        say(reply, false);
        if (answer.copy) {
          const copy = button("Copy", INK_SMALL, async () => {
            try {
              await navigator.clipboard.writeText(reply);
              copy.textContent = "Copied";
            } catch {
              copy.textContent = "Couldn't copy: select the text instead";
            }
          });
          copy.style.alignSelf = "flex-start";
          log.append(copy);
        }
      }
      if (answer.sent?.length) note(`Sent with this: ${answer.sent.join("; ")}.`);
      const turn = { role: "assistant", text: reply || "(no answer)" };
      history.push(turn);
      if (answer.apply && answer.proposed?.length) propose(answer, turn, reply, { pick: options.pick ?? null });
      else if (answer.skipped?.length || answer.problem) {
        // Nothing to confirm: what it asked for can't be done, or couldn't be read.
        const node = card();
        list(node, "Can't be done", answer.skipped ?? []);
        trouble(node, answer.problem);
        log.append(node);
        turn.text = [reply, ...(answer.skipped ?? []).map((line) => `Not done: ${line}`), answer.problem]
          .filter(Boolean)
          .join("\n");
      }
      keep();
      scroll();
      setBusy(false);
    } catch (error) {
      history.pop(); // not asked after all: ask again as it was
      asked.remove();
      if (typed) input.value = text;
      setBusy(false, error?.message ?? String(error));
    }
  }

  // ── Ready-made requests: a few always in view, the rest in a list with what each asks or does ──
  const picker = element(
    "div",
    "display:none;flex-direction:column;gap:5px;border:1px solid rgba(107,74,43,0.45);border-radius:8px;padding:6px 8px;font-size:12px;",
  );
  const more = element("details", "font-size:12px;");

  /** The keyword draft's choice: a lorebook, then its entries. Only what's ticked is sent. */
  async function openKeywords() {
    picker.replaceChildren(
      element("div", "font-weight:700;", "Draft ww: keywords"),
      element("div", "", "Reading your lorebooks…"),
    );
    picker.style.display = "flex";
    let books = [];
    try {
      books = (await handlers.onLorebooks?.()) ?? [];
    } catch {
      books = [];
    }
    const close = button("Close", INK_SMALL, () => (picker.style.display = "none"));
    if (!books.length) {
      picker.replaceChildren(
        element("div", "font-weight:700;", "Draft ww: keywords"),
        element("div", "", "No lorebooks were found in the Engine."),
        close,
      );
      return;
    }
    const choose = element("select", `${INK_INPUT}width:100%;box-sizing:border-box;font:13px system-ui,sans-serif;`);
    choose.setAttribute("aria-label", "Lorebook");
    for (const book of books) {
      const entry = element("option", "", `${book.name} (${book.entries.length})`);
      entry.value = book.id;
      choose.append(entry);
    }
    const entries = element(
      "div",
      "display:flex;flex-direction:column;gap:4px;max-height:190px;overflow-y:auto;padding:2px;",
    );
    const count = element("div", `color:${INK_SOFT};`);
    const ticks = () => [...entries.querySelectorAll("input")];
    const tell = () => {
      const chosen = ticks().filter((tick) => tick.checked).length;
      count.textContent = `${chosen} chosen (${MOST_ENTRIES} at most a time). Only these entries are sent.`;
      for (const tick of ticks()) tick.disabled = !tick.checked && chosen >= MOST_ENTRIES;
    };
    const fill = () => {
      const book = books.find((entry) => entry.id === choose.value);
      entries.replaceChildren(
        ...(book?.entries ?? []).map((entry) => {
          const row = element("label", "display:flex;gap:6px;align-items:flex-start;");
          const tick = element("input", "flex:none;width:18px;height:18px;margin:0;");
          tick.type = "checkbox";
          tick.value = entry.id;
          tick.addEventListener("change", tell);
          row.append(tick, element("span", "overflow-wrap:anywhere;", entry.title));
          return row;
        }),
      );
      tell();
    };
    choose.addEventListener("change", fill);
    const draft = button("Draft keywords", INK_BUTTON, () => {
      const book = books.find((entry) => entry.id === choose.value);
      const chosen = ticks()
        .filter((tick) => tick.checked)
        .map((tick) => tick.value);
      if (!book || !chosen.length) {
        count.textContent = "Tick at least one entry first.";
        return;
      }
      picker.style.display = "none";
      void send(
        `Draft ww: keywords for ${chosen.length === 1 ? "one entry" : `${chosen.length} entries`} of my lorebook "${book.name}".`,
        {
          pick: "keywords",
          book: book.id,
          entries: chosen,
        },
      );
    });
    const first = button("Tick the first twenty", INK_SMALL, () => {
      ticks().forEach((tick, at) => (tick.checked = at < MOST_ENTRIES));
      tell();
    });
    const none = button("Untick all", INK_SMALL, () => {
      for (const tick of ticks()) tick.checked = false;
      tell();
    });
    const tools = element("div", "display:flex;gap:6px;flex-wrap:wrap;");
    tools.append(first, none);
    const row = element("div", "display:flex;gap:6px;");
    row.append(draft, close);
    picker.replaceChildren(
      element("div", "font-weight:700;", "Draft ww: keywords"),
      element(
        "div",
        `color:${INK_SOFT};`,
        "You get each entry's keys as text to copy into your lorebook: the assistant can't change Engine lorebooks.",
      ),
      choose,
      tools,
      entries,
      count,
      row,
    );
    fill();
  }

  const run = (pick) => {
    if (busy) return;
    more.open = false;
    if (pick.picker === "keywords") void openKeywords();
    else if (pick.fill) {
      filled = pick;
      input.value = pick.fill;
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
      status.textContent = "Finish it, then Send.";
    } else void send(pick.ask, { pick: pick.id });
  };
  const quick = element("div", "display:flex;gap:6px;flex-wrap:wrap;");
  for (const pick of PICKS.filter((entry) => entry.common)) {
    const node = button(pick.label, INK_SMALL, () => run(pick));
    node.title = pick.note;
    quick.append(node);
  }
  more.append(element("summary", "cursor:pointer;font-weight:600;", "More things to ask"));
  const choices = element("div", "display:flex;flex-direction:column;gap:4px;margin-top:4px;");
  for (const pick of PICKS) {
    const node = button(
      "",
      `${INK_SMALL}text-align:left;display:flex;flex-direction:column;gap:1px;padding:5px 8px;`,
      () => run(pick),
    );
    node.append(element("span", "font-weight:700;", pick.label), element("span", "font-weight:400;", pick.note));
    choices.append(node);
  }
  more.append(choices);

  /** The chat a world was left with (its words; proposals and undos don't come back). */
  box.setChat = (turns) => {
    pending = null;
    filled = null;
    history = (Array.isArray(turns) ? turns : [])
      .filter((turn) => turn && typeof turn.text === "string" && turn.text)
      .slice(-KEPT)
      .map((turn) => ({ role: turn.role === "assistant" ? "assistant" : "user", text: turn.text }));
    log.replaceChildren();
    picker.style.display = "none";
    status.textContent = "";
    if (history.length) note("Earlier in this world:");
    for (const turn of history) say(turn.text, turn.role === "user");
  };

  box.append(log, quick, more, picker, input, buttons);
  return box;
}
