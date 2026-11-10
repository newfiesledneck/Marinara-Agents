// The person editor: one window with everything Wanderworld keeps about someone, to change and then
// Save or Cancel. For a character with an Engine card, what the card says (who they are, their looks)
// is shown but stays the card's; someone a world made for itself can have those changed here too.
// It floats over the world like the chat (floating.js). Opened from Journal → People → Edit people.
import { makeFloating } from "./floating.js";
import { floatingFrame } from "./illustrate.js";
import { ACTIVITIES, ACTIVITY_WORDS, hourText } from "./schedules.js";
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
 * Returns { row, read() → { kind, level, role } | null }.
 */
function relationFields(kinds, record, label) {
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
  level.step = "5";
  level.value = String(record?.level ?? 50);
  level.setAttribute("aria-label", `${label}: how strongly`);
  const row = element("span", "display:inline-flex;gap:6px;align-items:center;flex-wrap:wrap;");
  row.append(kind, role, level);
  return {
    row,
    read: () => (kind.value ? { kind: kind.value, level: Number(level.value), role: role.value } : null),
  };
}

/**
 * The editor, added to `layer`. `handlers`: onSave(id, changes), onPlan(id, request) → Promise<{ words,
 * day: { entries, by } }> (the AI plans their day; it's kept at once). `open(person)` shows it for: { id, name, local, card: { description, personality,
 * appearance }, body, voice, voices: [names], traits: { aggression, sociability }, traitKinds: [{ id,
 * label, low, high }], home, work, owner, homes, workplaces: [{ id, name }], kinds: [{ id, label }],
 * toPlayer, fromPlayer: record | null, others: [{ id, name, out, back: record | null }], schedule:
 * [{ from, to, words }], scheduleBy, day: { entries, by }, places: [{ id, name }], canPlan }.
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
  frame.append(body, foot);

  const head = (text) => element("div", `font:700 13px ${SERIF};margin-top:6px;`, text);
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

    body.append(head("You and them"));
    const toPlayer = relationFields(person.kinds, person.toPlayer, `How ${person.name} sees you`);
    const fromPlayer = relationFields(person.kinds, person.fromPlayer, `How you see ${person.name}`);
    body.append(field(`${person.name} sees you as`, toPlayer.row), field(`You see ${person.name} as`, fromPlayer.row));
    const knows = element("input");
    knows.type = "checkbox";
    knows.checked = !!person.known;
    const knowsRow = element("label", "display:flex;gap:6px;align-items:center;");
    knowsRow.append(knows, element("span", "", "You know their name (a stranger otherwise)"));
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
    body.append(knowsRow, field("How they act toward you", stance));
    reads.push((changes) => {
      changes.known = knows.checked;
      changes.stance = stance.value;
    });
    const relations = [
      { from: person.id, to: "player", fields: toPlayer },
      { from: "player", to: person.id, fields: fromPlayer },
    ];
    if (person.others.length) {
      body.append(head("Them and the others"));
      body.append(note("Each way round is its own: how they see someone, and how that someone sees them."));
      for (const other of person.others) {
        const out = relationFields(person.kinds, other.out, `How ${person.name} sees ${other.name}`);
        const back = relationFields(person.kinds, other.back, `How ${other.name} sees ${person.name}`);
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
    float.setOpen(true);
    body.scrollTop = 0;
  }

  return { open, close: () => float.setOpen(false) };
}
