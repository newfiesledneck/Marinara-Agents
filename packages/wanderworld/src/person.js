// The person editor: one window with everything Wanderworld keeps about someone, to change and then
// Save or Cancel. For a character with an Engine card, what the card says (who they are, their looks)
// is shown but stays the card's; someone a world made for itself can have those changed here too.
// It floats over the world like the chat (floating.js). Opened from Journal → People → Edit people.
import { makeFloating } from "./floating.js";
import { floatingFrame } from "./illustrate.js";
import { ACTIVITIES, ACTIVITY_WORDS, hourText } from "./schedules.js";
import { attractionOf } from "./relationships.js";
import { ago } from "./memory.js";
import { INK_BUTTON, INK_INPUT, INK_SMALL, INK_SOFT, SERIF } from "./ui.js";

function element(tag, css = "", textContent) {
  const node = document.createElement(tag);
  if (css) node.style.cssText = css;
  if (textContent !== undefined) node.textContent = textContent;
  return node;
}

function choice(options, value, label) {
  const select = element("select", `${INK_INPUT}padding:3px 6px;max-width:190px;`);
  for (const [id, name] of options) {
    const option = element("option", "", name);
    option.value = id;
    select.append(option);
  }
  select.value = value ?? "";
  select.setAttribute("aria-label", label);
  return select;
}

/**
 * A relationship's fields: a kind (or none), a role where the kind has them (family: sister, parent…;
 * colleague: employer…; mentor: student), and how strong, 0–100. `kinds`: [{ id, label, roles }].
 * With them: a lock (locked, it never moves by itself), and how attractive they find them, with a lock
 * of its own. `from` and `to` are whose view of whom it is.
 * Returns { row, read() → { kind, level, role, locked, attraction, attractionLocked } | null }.
 */
function relationFields(kinds, record, label, from, to) {
  const kind = choice(
    [["", "Nothing set"], ...kinds.map((entry) => [entry.id, entry.label])],
    record?.kind ?? "",
    label,
  );
  const role = element("select", `${INK_INPUT}padding:3px 6px;max-width:130px;`);
  role.setAttribute("aria-label", `${label}: as what`);
  const drawRoles = () => {
    const roles = [...(kinds.find((entry) => entry.id === kind.value)?.roles ?? [])];
    // A role set some other way (a lorebook's "father", "wife") stays on offer for the kind it came with.
    const had = record?.kind === kind.value ? (record.role ?? "") : "";
    if (had && !roles.includes(had)) roles.unshift(had);
    role.replaceChildren();
    for (const [value, name] of [["", "no role"], ...roles.map((name) => [name, name])]) {
      const option = element("option", "", name);
      option.value = value;
      role.append(option);
    }
    role.value = had;
    role.style.display = roles.length ? "" : "none";
  };
  kind.addEventListener("change", drawRoles);
  drawRoles();
  const level = element("input", "width:90px;");
  level.type = "range";
  level.min = "0";
  level.max = "100";
  level.step = "1"; // (a relationship moves a step at a time by itself; the slider mustn't round that away)
  level.value = String(record?.level ?? 50);
  level.setAttribute("aria-label", `${label}: how strongly`);
  const tick = (text, title, on) => {
    const wrap = element("label", "display:inline-flex;gap:3px;align-items:center;font-size:12px;");
    const box = element("input", "");
    box.type = "checkbox";
    box.checked = on;
    box.title = title;
    box.setAttribute("aria-label", `${label}: ${title}`);
    wrap.append(box, element("span", "", text));
    return [wrap, box];
  };
  const [lockWrap, lock] = tick("Lock", "locked, it never changes by itself", record?.locked === true);
  // How attractive they find them: their own view till it's moved (then it's set, and can be locked too).
  const felt = attractionOf(from, to, record);
  const attraction = element("input", "width:70px;");
  attraction.type = "range";
  attraction.min = "0";
  attraction.max = "100";
  attraction.step = "1";
  attraction.value = String(felt);
  attraction.setAttribute("aria-label", `${label}: how attractive they find them`);
  const [drawnLockWrap, drawnLock] = tick(
    "Lock",
    "locked, attraction never changes by itself",
    record?.attractionLocked === true,
  );
  const row = element("span", "display:inline-flex;gap:6px;align-items:center;flex-wrap:wrap;");
  const drawn = element("span", "display:inline-flex;gap:4px;align-items:center;font-size:12px;");
  drawn.append(element("span", "", "Attraction"), attraction, drawnLockWrap);
  row.append(kind, role, level, lockWrap, drawn);
  return {
    row,
    read: () =>
      kind.value
        ? {
            kind: kind.value,
            level: Number(level.value),
            role: role.value,
            locked: lock.checked,
            // (Left where their own view has it, it stays unset.)
            attraction:
              Number(attraction.value) === felt && !Number.isFinite(record?.attraction)
                ? null
                : Number(attraction.value),
            attractionLocked: drawnLock.checked,
          }
        : null,
  };
}

/**
 * The editor, added to `layer`. `handlers`: onSave(id, changes), onPlan(id, request) → Promise<{ words,
 * day: { entries, by } }> (the AI plans their day; it's kept at once). `open(person)` shows it for: { id, name, local, card: { description, personality,
 * appearance }, body, voice, voices: [names], traits: { aggression, sociability }, traitKinds: [{ id,
 * label, low, high }], home, work, owner, homes, workplaces: [{ id, name }], kinds: [{ id, label }],
 * toPlayer, fromPlayer: record | null, others: [{ id, name, out, back: record | null }], schedule:
 * [{ from, to, words }], scheduleBy, day: { entries, by }, places: [{ id, name }], canPlan }.
 * `onSumUp({ id, name })`: have the assistant sum up their old memories (the window is closed for it).
 */
export function createPersonEditor(layer, handlers) {
  const { frame, bar } = floatingFrame("Edit", () => float.setOpen(false));
  layer.append(frame);
  const float = makeFloating(layer, frame, bar, "wanderworld.person", { w: 460, h: 520, x: 40, y: 96, open: false });
  float.state.open = false; // it opens for someone, never by itself
  frame.style.display = "none";
  const title = bar.querySelector("span");
  const body = element(
    "div",
    "flex:1;overflow-y:auto;padding:8px 12px;display:flex;flex-direction:column;gap:6px;font:13px system-ui,sans-serif;",
  );
  const foot = element(
    "div",
    "display:flex;gap:8px;justify-content:flex-end;padding:6px 12px;border-top:1px solid rgba(107,74,43,0.4);",
  );
  // A tab for each part of them, so it isn't one long page.
  const tabBar = element(
    "div",
    "display:flex;gap:4px;flex-wrap:wrap;padding:6px 12px 0;border-bottom:1px solid rgba(107,74,43,0.25);padding-bottom:6px;",
  );
  frame.append(tabBar, body, foot);
  let shownTab = "About";

  const head = (text) => {
    const node = element("div", `font:700 13px ${SERIF};margin-top:6px;`, text);
    node.dataset.head = text;
    return node;
  };
  /** Which tab each heading's part is under. */
  const TABS = {
    "Who they are": "About",
    "In this world": "About",
    "Their day": "Day",
    "How they see you": "You",
    "How they see other people": "Others",
    "What they remember": "Memory",
  };
  /** Puts what's in `body` into tabs: a part runs from its heading to the next. `only`: the tab to open on. */
  const intoTabs = (only = null) => {
    const panes = new Map();
    let pane = null;
    for (const node of [...body.children]) {
      const tab = TABS[node.dataset.head];
      if (tab) {
        pane = panes.get(tab) ?? element("div", "display:none;flex-direction:column;gap:6px;");
        panes.set(tab, pane);
      }
      pane?.append(node);
    }
    body.append(...panes.values());
    const show = (name) => {
      shownTab = panes.has(name) ? name : "About";
      for (const [tab, node] of panes) node.style.display = tab === shownTab ? "flex" : "none";
      for (const tab of tabBar.children) {
        tab.style.opacity = tab.textContent === shownTab ? "1" : "0.6";
        tab.style.fontWeight = tab.textContent === shownTab ? "700" : "";
        tab.setAttribute("aria-pressed", String(tab.textContent === shownTab));
      }
      body.scrollTop = 0;
    };
    tabBar.replaceChildren(
      ...[...panes.keys()].map((name) => {
        const tab = element("button", INK_SMALL, name);
        tab.type = "button";
        tab.addEventListener("click", () => show(name));
        return tab;
      }),
    );
    show(only ?? shownTab);
  };
  const part = (text) => element("div", "font-weight:600;margin-top:6px;", text);
  const note = (text) => element("div", `font-size:12px;color:${INK_SOFT};line-height:1.35;`, text);
  const field = (label, control) => {
    const row = element("label", "display:flex;gap:8px;align-items:center;flex-wrap:wrap;");
    row.append(element("span", "min-width:120px;", label), control);
    return row;
  };

  function open(person) {
    title.textContent = `Edit ${person.name}`;
    const reads = []; // each adds what it holds to the changes on Save
    body.replaceChildren();

    // Who they are: the card's for a carded character, theirs to change for someone of this world.
    body.append(head("Who they are"));
    if (person.local) {
      body.append(note("Made for this world: this is their card, and it's yours to change."));
      const local = {};
      for (const [key, label, rows] of [
        ["description", "Who they are", 5],
        ["personality", "Personality, and how they talk", 2],
        ["appearance", "Looks", 2],
      ]) {
        const area = element(
          "textarea",
          `${INK_INPUT}resize:vertical;width:100%;box-sizing:border-box;font:13px system-ui;`,
        );
        area.rows = rows;
        area.value = person.card[key] ?? "";
        area.placeholder = label;
        area.setAttribute("aria-label", label);
        local[key] = area;
        body.append(area);
      }
      reads.push((changes) => {
        changes.local = Object.fromEntries(Object.entries(local).map(([key, area]) => [key, area.value.trim()]));
      });
    } else {
      body.append(note("From their character card, which Wanderworld doesn't change. Edit the card in the Engine."));
    }

    body.append(head("In this world"));
    const bodyChoice = choice(
      [
        ["auto", "Auto"],
        ["male", "Man"],
        ["female", "Woman"],
        ["custom", person.genderName || "Custom"],
      ],
      person.body ?? "auto",
      "Body",
    );
    const voice = choice(
      [["", "As in Settings"], ...person.voices.map((name) => [name, name[0].toUpperCase() + name.slice(1)])],
      person.voice ?? "",
      "Voice",
    );
    body.append(field("Body (without a 3D model)", bodyChoice), field("How they talk", voice));
    const traits = {};
    for (const kind of person.traitKinds) {
      const slider = element("input", "width:140px;");
      slider.type = "range";
      slider.min = "0";
      slider.max = "100";
      slider.step = "5";
      slider.value = String(person.traits[kind.id] ?? 50);
      slider.setAttribute("aria-label", kind.label);
      traits[kind.id] = slider;
      const row = element("span", "display:inline-flex;gap:6px;align-items:center;font-size:12px;");
      row.append(element("span", "", kind.low), slider, element("span", "", kind.high));
      body.append(field(kind.label, row));
    }
    const home = choice(
      [["", "Auto"], ...person.homes.map((place) => [place.id, place.name])],
      person.home ?? "",
      "Home",
    );
    const work = choice(
      [["", "No work"], ...person.workplaces.map((place) => [place.id, place.name])],
      person.work ?? "",
      "Work",
    );
    const owner = element("input");
    owner.type = "checkbox";
    owner.checked = !!person.owner;
    const ownerRow = element("span", "display:inline-flex;gap:6px;align-items:center;");
    ownerRow.append(work, owner, element("span", "", "owns it"));
    body.append(field("Home", home), field("Work", ownerRow));
    reads.push((changes) => {
      changes.body = bodyChoice.value;
      changes.voice = voice.value;
      changes.traits = Object.fromEntries(Object.entries(traits).map(([id, slider]) => [id, Number(slider.value)]));
      changes.housing = { home: home.value || null, work: work.value || null, owner: !!work.value && owner.checked };
    });

    // Their day: rows of hours, what they do and where. Hours not listed, and walks, are theirs to fill.
    body.append(head("Their day"));
    const dayNote = note("");
    const dayRows = element("div", "display:flex;flex-direction:column;gap:3px;");
    let day = person.day.entries.map((entry) => ({ ...entry })); // null: back to the usual day
    let dayBy = person.day.by;
    let dayChanged = false;
    const hours = Array.from({ length: 97 }, (_, i) => [String(i / 4), hourText(i / 4)]);
    const drawDay = () => {
      dayNote.textContent =
        day === null
          ? "Back to the usual day for someone like them, once saved."
          : dayChanged
            ? "Changed here; kept when you save."
            : ({ usual: "The usual day for someone like them.", ai: "Planned by the AI.", lore: "Set by a lorebook." }[
                dayBy
              ] ?? "Set by you.");
      dayRows.replaceChildren();
      (day ?? []).forEach((entry, at) => {
        const touch = (key, value) => {
          entry[key] = value;
          dayChanged = true;
          drawDay();
        };
        const from = choice(hours, String(entry.from), "From");
        const to = choice(hours, String(entry.to), "To");
        const what = choice(
          ACTIVITIES.map((activity) => [activity, ACTIVITY_WORDS[activity]]),
          entry.activity,
          "What they do",
        );
        const where = choice(
          [
            ["", entry.activity === "home" || entry.activity === "work" ? "their own" : "anywhere"],
            ...person.places.map((place) => [place.id, place.name]),
          ],
          entry.place ?? "",
          "Where",
        );
        from.addEventListener("change", () => touch("from", Number(from.value)));
        to.addEventListener("change", () => touch("to", Number(to.value)));
        what.addEventListener("change", () => touch("activity", what.value));
        where.addEventListener("change", () => touch("place", where.value));
        const remove = element("button", INK_SMALL, "✕");
        remove.type = "button";
        remove.title = "Remove this line";
        remove.addEventListener("click", () => {
          day.splice(at, 1);
          dayChanged = true;
          drawDay();
        });
        const row = element("div", "display:flex;gap:4px;align-items:center;flex-wrap:wrap;font-size:12px;");
        row.append(from, element("span", "", "to"), to, what, where, remove);
        dayRows.append(row);
      });
    };
    const dayButtons = element("div", "display:flex;gap:6px;flex-wrap:wrap;");
    const add = element("button", INK_SMALL, "Add a line");
    add.type = "button";
    add.addEventListener("click", () => {
      day ??= [];
      const last = day.at(-1);
      const from = last ? last.to % 24 : 9;
      day.push({ from, to: (from + 1) % 24 || 24, activity: "walk", place: "" });
      dayChanged = true;
      drawDay();
    });
    const usual = element("button", INK_SMALL, "Back to their usual day");
    usual.type = "button";
    usual.addEventListener("click", () => {
      day = null;
      dayChanged = true;
      drawDay();
    });
    dayButtons.append(add, usual);
    body.append(dayNote, dayRows, dayButtons);
    if (person.canPlan) {
      const ask = element("div", "display:flex;gap:6px;align-items:center;");
      const request = element("input", `${INK_INPUT}flex:1;min-width:0;`);
      request.placeholder = "Ask for something (optional): early riser, temple at dusk…";
      request.maxLength = 300;
      request.setAttribute("aria-label", "What to ask the AI for");
      const plan = element("button", INK_SMALL, "Plan with AI");
      plan.type = "button";
      plan.addEventListener("click", async () => {
        plan.disabled = true;
        dayNote.textContent = "Planning…";
        const planned = await handlers.onPlan?.(person.id, request.value.trim());
        plan.disabled = false;
        if (planned?.day) {
          day = planned.day.entries.map((entry) => ({ ...entry }));
          dayBy = planned.day.by;
          dayChanged = false; // the AI's plan is kept at once
        }
        drawDay();
        if (planned?.words) dayNote.textContent = planned.words;
      });
      ask.append(request, plan);
      body.append(ask);
    }
    drawDay();
    reads.push((changes) => {
      if (dayChanged) changes.schedule = day && day.length ? day : null;
    });

    body.append(head("How they see you"));
    const toPlayer = relationFields(person.kinds, person.toPlayer, `How ${person.name} sees you`, person.id, "player");
    const fromPlayer = relationFields(
      person.kinds,
      person.fromPlayer,
      `How you see ${person.name}`,
      "player",
      person.id,
    );
    body.append(field(`${person.name} sees you as`, toPlayer.row), field(`You see ${person.name} as`, fromPlayer.row));
    const knows = element("input");
    knows.type = "checkbox";
    knows.checked = !!person.known;
    const knowsRow = element("label", "display:flex;gap:6px;align-items:center;");
    knowsRow.append(knows, element("span", "", "You know their name (a stranger otherwise)"));
    const knowsYou = element("input");
    knowsYou.type = "checkbox";
    knowsYou.checked = !!person.knowsYou;
    const knowsYouRow = element("label", "display:flex;gap:6px;align-items:center;");
    knowsYouRow.append(knowsYou, element("span", "", "They know your name (they won't use it otherwise)"));
    const stance = choice(
      [
        ["", "As they feel about you"],
        ["rude", "Rude to you"],
        ["aggressive", "Aggressive: comes at you"],
        ["attacks", "Attacks you on sight"],
        ["afraid", "Afraid of you"],
        ["avoids", "Avoids you"],
      ],
      person.stance ?? "",
      "How they act toward you",
    );
    body.append(knowsRow, knowsYouRow, field("How they act toward you", stance));
    reads.push((changes) => {
      changes.known = knows.checked;
      changes.knowsYou = knowsYou.checked;
      changes.stance = stance.value;
    });
    // What they remember: their own, and all the AI is told of what's happened when it speaks for them.
    {
      body.append(head("What they remember"));
      body.append(
        note(
          "What this person saw, heard or was told. When the AI speaks for them it is given these, and nobody else's.",
        ),
      );
      // How many they keep, and how many the AI is sent: their own numbers, All, or blank for the setting's.
      const count = (key, label, blank) => {
        const input = element("input", `${INK_INPUT}padding:3px 6px;width:84px;`);
        input.type = "number";
        input.min = "0";
        input.max = "100";
        input.step = "1";
        input.inputMode = "numeric";
        input.placeholder = blank;
        const all = element("input", "flex:none;width:18px;height:18px;margin:0;");
        all.type = "checkbox";
        all.setAttribute("aria-label", `${label}: all of them`);
        const own = person.memoryLimits?.[key];
        if (own > 100) all.checked = true;
        else if (Number.isFinite(own)) input.value = String(own);
        const sync = () => (input.disabled = all.checked);
        all.addEventListener("change", sync);
        sync();
        const wrap = element("span", "display:flex;gap:6px;align-items:center;");
        wrap.append(input, all, element("span", "font-size:12px;", "All"));
        body.append(field(label, wrap));
        return () => (all.checked ? 101 : input.value.trim() === "" ? null : Math.min(100, Number(input.value)));
      };
      const usual = (key) => {
        const value = person.memoryDefaults?.[key];
        return value > 100 ? "All" : String(value ?? "");
      };
      body.append(part("Limits for this person"));
      const each = count("each", "Everyday memories kept", usual("each"));
      const lasting = count("kept", "Lasting memories kept", usual("kept"));
      body.append(note("Blank: the number in Settings → People → Memory. All: keep everything until you delete it."));
      const told = count("told", "Everyday memories sent to the AI", "share");
      const keptTold = count("keptTold", "Lasting memories sent to the AI", "share");
      body.append(
        note(
          "Blank: a share of the total in Settings. A number here is theirs alone. All: send everything they keep, which can cost a lot of tokens.",
        ),
      );
      body.append(part("Their memories"));
      // Pinned first, then what lasted, then the everyday (each newest first). Any of them can be set
      // right, deleted, or pinned: a pinned one is locked, and nothing pushes it out.
      const rank = (memory) => (memory.pinned ? 2 : memory.kept ? 1 : 0);
      const kept = [...(person.memories ?? [])].sort((a, b) => rank(b) - rank(a));
      if (!kept.length) body.append(element("div", `color:${INK_SOFT};font-size:12px;`, "Nothing yet."));
      const listed = element("div", "");
      body.append(listed);
      const makeRow = (memory) => {
        const row = element("div", "display:flex;gap:6px;align-items:center;flex-wrap:wrap;padding:3px 0;");
        const pin = element("input", "flex:none;width:18px;height:18px;");
        pin.type = "checkbox";
        pin.checked = memory.pinned;
        pin.title = "Pin: locked, never forgotten";
        pin.setAttribute("aria-label", `Pin so it's never forgotten: ${memory.text}`);
        const words = element("input", `${INK_INPUT}padding:4px 6px;flex:1 1 170px;min-width:0;font-size:12px;`);
        words.type = "text";
        words.maxLength = 200;
        words.value = memory.text;
        const when = ago(memory.day, person.today ?? memory.day);
        words.setAttribute("aria-label", `A memory from ${when}`);
        const tag = element(
          "span",
          `flex:none;color:${INK_SOFT};font-size:11px;`,
          `${when}${memory.pinned ? ", pinned" : memory.kept ? ", lasting" : ""}`,
        );
        const drop = element("button", INK_SMALL, "✕");
        drop.type = "button";
        drop.setAttribute("aria-label", `Delete this memory: ${memory.text}`);
        const state = { memory, pin, words, remove: false };
        drop.addEventListener("click", () => {
          state.remove = !state.remove;
          words.disabled = state.remove;
          pin.disabled = state.remove;
          words.style.textDecoration = state.remove ? "line-through" : "";
          drop.textContent = state.remove ? "Undo" : "✕";
          drop.setAttribute("aria-label", `${state.remove ? "Keep" : "Delete"} this memory: ${memory.text}`);
        });
        row.append(pin, words, tag, drop);
        listed.append(row);
        return state;
      };
      const rows = kept.slice(0, 60).map(makeRow);
      if (kept.length > rows.length) {
        const older = element("button", INK_SMALL, "");
        older.type = "button";
        const tell = () => (older.textContent = `Show more (${kept.length - rows.length} not shown)`);
        older.addEventListener("click", () => {
          rows.push(...kept.slice(rows.length, rows.length + 100).map(makeRow));
          if (rows.length >= kept.length) older.remove();
          else tell();
        });
        tell();
        body.append(older);
      }
      if (kept.length)
        body.append(
          note(
            "Tick: pin it, so it is never forgotten (thirty at most). Edit the words to correct it. ✕: delete it when you save.",
          ),
        );
      if (kept.length && handlers.onSumUp) {
        const sum = element("button", INK_SMALL, "Sum up old memories (AI)…");
        sum.type = "button";
        sum.style.alignSelf = "flex-start";
        sum.addEventListener("click", () => handlers.onSumUp({ id: person.id, name: person.name }));
        body.append(
          sum,
          note(
            `The AI assistant proposes one lasting memory in place of several old ones, for you to approve (one AI call). This window closes without saving, so save your changes first.`,
          ),
        );
      }
      const own = element("input", `${INK_INPUT}padding:4px 6px;width:100%;box-sizing:border-box;margin-top:2px;`);
      own.type = "text";
      own.maxLength = 200;
      own.placeholder = "Write a memory for them (pinned from the start)";
      own.setAttribute("aria-label", `Something ${person.name} will always remember`);
      body.append(own);
      reads.push((changes) => {
        changes.memoryEdits = rows
          .filter(
            ({ memory, pin, words, remove }) =>
              remove || pin.checked !== memory.pinned || (words.value.trim() && words.value.trim() !== memory.text),
          )
          .map(({ memory, pin, words, remove }) => ({
            day: memory.day,
            text: memory.text,
            remove,
            newText: words.value.trim(),
            pinned: pin.checked,
          }));
        changes.memory = own.value.trim();
        changes.memoryLimits = { each: each(), kept: lasting(), told: told(), keptTold: keptTold() };
      });
      if (kept.length) {
        const wrap = element("label", "display:flex;gap:6px;align-items:center;font-size:12px;margin-top:2px;");
        const forget = element("input", "");
        forget.type = "checkbox";
        forget.setAttribute("aria-label", `${person.name} forgets everything when you save`);
        wrap.append(forget, element("span", "", "Forget all of it when I save"));
        body.append(wrap);
        reads.push((changes) => {
          changes.forget = forget.checked;
        });
      }
    }
    const relations = [
      { from: person.id, to: "player", fields: toPlayer },
      { from: "player", to: person.id, fields: fromPlayer },
    ];
    if (person.others.length) {
      body.append(head("How they see other people"));
      body.append(note("Each way round is its own: how they see someone, and how that someone sees them."));
      for (const other of person.others) {
        const out = relationFields(
          person.kinds,
          other.out,
          `How ${person.name} sees ${other.name}`,
          person.id,
          other.id,
        );
        const back = relationFields(
          person.kinds,
          other.back,
          `How ${other.name} sees ${person.name}`,
          other.id,
          person.id,
        );
        body.append(element("div", "font-weight:600;margin-top:2px;", other.name));
        body.append(field(`${person.name} sees them as`, out.row), field(`They see ${person.name} as`, back.row));
        relations.push({ from: person.id, to: other.id, fields: out }, { from: other.id, to: person.id, fields: back });
      }
    }
    reads.push((changes) => {
      changes.relations = relations.map(({ from, to, fields }) => ({ from, to, fields: fields.read() }));
    });

    const save = element("button", INK_BUTTON, "Save");
    save.type = "button";
    save.addEventListener("click", () => {
      const changes = {};
      for (const read of reads) read(changes);
      handlers.onSave?.(person.id, changes);
      float.setOpen(false);
    });
    const cancel = element("button", INK_SMALL, "Cancel");
    cancel.type = "button";
    cancel.addEventListener("click", () => float.setOpen(false));
    foot.replaceChildren(cancel, save);
    intoTabs();
    float.setOpen(true);
    body.scrollTop = 0;
  }

  return { open, close: () => float.setOpen(false) };
}
