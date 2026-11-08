// The Journal: what the world knows, on screen. Tabs:
// - Here: where you are, the lore that's active here, and who's nearby, in the same words the AI will get.
// - People: where everyone in town is and what they're doing.
// - Places: every named place; rename any (a shop's new name goes on its sign) and tie lorebook entries
//   to it, so they're active while you're there.
// - World: the world's name, town, time and seed.
// Relationships and the party join as their own tabs (docs/CONCEPT.md, W3 and W4).
import { INK, INK_SMALL, INK_SOFT, SERIF } from "./ui.js";

const TABS = [
  ["here", "Here"],
  ["people", "People"],
  ["party", "Party"],
  ["relations", "Relationships"],
  ["places", "Places"],
  ["world", "World"],
];
const TAB = `font:600 12px ${SERIF};border:1px solid rgba(107,74,43,0.6);border-radius:7px;padding:4px 10px;cursor:pointer;`;
const SMALL = INK_SMALL;
const MUTED = `color:${INK_SOFT};font-size:12px;font-style:italic;`;

function element(tag, css, textContent) {
  const node = document.createElement(tag);
  if (css) node.style.cssText = css;
  if (textContent !== undefined) node.textContent = textContent;
  return node;
}

function button(label, css, onClick) {
  const node = element("button", css, label);
  node.type = "button";
  node.addEventListener("click", onClick);
  return node;
}

/**
 * `handlers`: onRename(zoneId, name) (empty name puts the default back), onLore(zoneId),
 * onPartyWait(id, wait), onPartyLeave(id), onSetRelation(from, to, fields | null, both),
 * onSetTraits(id, { aggression, sociability }).
 */
export function createJournal(panelCss, handlers) {
  const panel = element("div", panelCss);
  panel.setAttribute("data-wanderworld-ui", "");
  panel.style.minWidth = "min(320px, calc(100% - 16px))";
  const tabs = element("div", "display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px;");
  const body = element("div", "display:flex;flex-direction:column;gap:6px;");
  panel.append(tabs, body);
  let tab = "here";
  let data = null;
  let picker = null; // { zone, lorebooks, chosen, onToggle } while choosing lore for a place

  const section = (label) => element("div", "font-weight:700;margin-top:4px;opacity:0.9;", label);
  const line = (text, css = "") => element("div", `font-size:13px;line-height:1.35;${css}`, text);

  function drawTabs() {
    tabs.replaceChildren(
      ...TABS.map(([id, label]) => {
        const node = button(label, TAB, () => {
          tab = id;
          picker = null;
          draw();
        });
        node.style.background = id === tab ? "#6b4a2b" : "rgba(107,74,43,0.08)";
        node.style.color = id === tab ? "#f6ecd6" : INK;
        return node;
      }),
    );
  }

  function drawHere() {
    const here = data.here;
    body.append(section(here.place), line(here.chain, MUTED));
    body.append(section("Active lore"));
    if (here.lore.length) for (const entry of here.lore) body.append(line(`📜 ${entry.title}`));
    else body.append(line("None here. Tie lorebook entries to a place in Places.", MUTED));
    body.append(section("Nearby"));
    if (here.nearby.length) for (const text of here.nearby) body.append(line(text));
    else body.append(line("Nobody close by.", MUTED));
  }

  function drawPeople() {
    if (!data.people.length) body.append(line("Nobody lives here yet. Choose characters in People.", MUTED));
    for (const text of data.people) body.append(line(text));
  }

  function drawParty() {
    if (!data.party.length) {
      body.append(line("Nobody's with you. Talk to someone and ask them to come with you.", MUTED));
      return;
    }
    for (const member of data.party) {
      const row = element("div", "display:flex;align-items:center;gap:6px;");
      row.append(
        element("span", "flex:1;font-size:13px;", member.waiting ? `${member.name} (waiting)` : member.name),
        button(member.waiting ? "Come along" : "Wait here", SMALL, () =>
          handlers.onPartyWait(member.id, !member.waiting),
        ),
        button("Part ways", SMALL, () => handlers.onPartyLeave(member.id)),
      );
      body.append(row);
    }
  }

  let whose = "player"; // whose relationships the tab shows
  let both = true; // a change goes both ways (from them to the other and back)

  function drawRelations() {
    const { kinds, people, records } = data.relations;
    if (people.length < 2) {
      body.append(line("Add characters in People to set how they see each other and you.", MUTED));
      return;
    }
    if (!people.some((person) => person.id === whose)) whose = people[0].id;
    const top = element("div", "display:flex;gap:8px;align-items:center;flex-wrap:wrap;");
    const pick = element(
      "select",
      "font:13px system-ui;border-radius:6px;border:1px solid #b89a6a;background:#fbf6e9;padding:2px 4px;",
    );
    for (const person of people) {
      const option = element("option", "", person.name);
      option.value = person.id;
      pick.append(option);
    }
    pick.value = whose;
    pick.addEventListener("change", () => {
      whose = pick.value;
      draw();
    });
    const mirror = element("label", "display:flex;gap:4px;align-items:center;font-size:12px;cursor:pointer;");
    const box = element("input");
    box.type = "checkbox";
    box.checked = both;
    box.addEventListener("change", () => (both = box.checked));
    mirror.append(box, element("span", "", "Both ways"));
    top.append(element("span", "font-size:12px;", "How"), pick, element("span", "font-size:12px;", "sees…"), mirror);
    body.append(top);
    body.append(
      line(
        "Friends seek each other out, sit and walk together; enemies keep away (a sworn enemy confronts you). Later the AI sets and changes these.",
        MUTED,
      ),
    );
    // Their temperament (not for the player, who acts for themselves).
    const traits = data.relations.traits[whose];
    if (traits) {
      for (const trait of data.relations.traitKinds) {
        const row = element("div", "display:flex;gap:6px;align-items:center;font-size:12px;");
        const range = element("input", "flex:1;");
        range.type = "range";
        range.min = "0";
        range.max = "100";
        range.value = String(traits[trait.id]);
        range.addEventListener("change", () =>
          handlers.onSetTraits(whose, { ...traits, [trait.id]: Number(range.value) }),
        );
        row.append(
          element("span", "width:70px;font-weight:600;", trait.label),
          element("span", "width:60px;text-align:right;", trait.low),
          range,
          element("span", "width:70px;", trait.high),
        );
        body.append(row);
      }
    }
    for (const other of people) {
      if (other.id === whose) continue;
      const record = records.find((entry) => entry.from === whose && entry.to === other.id);
      const row = element(
        "div",
        "display:flex;flex-direction:column;gap:3px;padding:6px 0;border-top:1px solid rgba(110,80,40,0.25);",
      );
      const head = element("div", "display:flex;gap:6px;align-items:center;");
      const kind = element(
        "select",
        "font:12px system-ui;border-radius:6px;border:1px solid #b89a6a;background:#fbf6e9;padding:1px 3px;",
      );
      for (const [value, label] of [["", "— none —"], ...kinds.map((entry) => [entry.id, entry.label])]) {
        const option = element("option", "", label);
        option.value = value;
        kind.append(option);
      }
      kind.value = record?.kind ?? "";
      head.append(element("span", "flex:1;font-weight:600;font-size:13px;", other.name), kind);
      row.append(head);
      kind.addEventListener("change", () => {
        handlers.onSetRelation(
          whose,
          other.id,
          kind.value ? { kind: kind.value, level: record?.level ?? 40 } : null,
          both,
        );
      });
      if (record) {
        const level = element("input", "flex:1;");
        level.type = "range";
        level.min = "0";
        level.max = "100";
        level.value = String(record.level);
        const tier = element("span", "font-size:12px;font-style:italic;min-width:96px;text-align:right;", record.tier);
        level.addEventListener("input", () => (tier.textContent = "…"));
        level.addEventListener("change", () =>
          handlers.onSetRelation(whose, other.id, { kind: record.kind, level: Number(level.value) }, both),
        );
        const slider = element("div", "display:flex;gap:6px;align-items:center;");
        slider.append(level, tier);
        row.append(slider);
        const roles = kinds.find((entry) => entry.id === record.kind)?.roles ?? [];
        const role = element(
          "input",
          "font:12px system-ui;border-radius:6px;border:1px solid #b89a6a;background:#fbf6e9;padding:2px 5px;",
        );
        role.placeholder = roles.length ? `Role (${roles.slice(0, 3).join(", ")}…)` : "Role (optional)";
        role.value = record.role ?? "";
        role.maxLength = 40;
        role.addEventListener("change", () => handlers.onSetRelation(whose, other.id, { role: role.value }, false));
        row.append(role, line(record.words, MUTED));
      }
      body.append(row);
    }
  }

  function drawPlaces() {
    if (picker) return drawPicker();
    body.append(line("Rename a place, or tie lorebook entries to it. Shops show their name on the sign.", MUTED));
    for (const place of data.places) {
      const row = element("div", "display:flex;align-items:center;gap:6px;");
      const name = element(
        "input",
        "flex:1;min-width:0;font:13px system-ui;border-radius:6px;border:1px solid #b89a6a;background:#fbf6e9;color:#2b1e10;padding:3px 6px;",
      );
      name.value = place.name;
      name.placeholder = place.defaultName;
      name.title = `${place.kind}: ${place.defaultName}`;
      name.maxLength = 60;
      const commit = () => {
        const value = name.value.trim();
        if (value !== place.name) handlers.onRename(place.id, value === place.defaultName ? "" : value);
      };
      name.addEventListener("change", commit);
      name.addEventListener("keydown", (event) => {
        if (event.key === "Enter") name.blur();
      });
      const lore = button(place.lore ? `Lore (${place.lore})` : "Lore", SMALL, () => handlers.onLore(place.id));
      row.append(element("span", "font-size:11px;opacity:0.6;width:58px;flex:none;", place.kind), name, lore);
      body.append(row);
    }
  }

  function drawPicker() {
    const { zone, lorebooks, chosen, onToggle } = picker;
    body.append(
      button("← Places", SMALL, () => ((picker = null), draw())),
      section(`Lore for ${zone}`),
    );
    if (!lorebooks) return body.append(line("Loading lorebooks…", MUTED));
    if (!lorebooks.length) return body.append(line("No lorebooks found.", MUTED));
    body.append(
      line("Ticked entries are active while you're here. (Sending them to the AI comes with the AI part.)", MUTED),
    );
    for (const book of lorebooks) {
      body.append(element("div", "font-weight:600;margin-top:6px;font-size:13px;", book.name));
      if (!book.entries.length) body.append(line("No entries.", MUTED));
      for (const entry of book.entries) {
        const label = element("label", "display:flex;gap:6px;align-items:center;font-size:13px;cursor:pointer;");
        const box = element("input");
        box.type = "checkbox";
        box.checked = chosen.has(`${book.id}/${entry.id}`);
        box.addEventListener("change", () => onToggle(book, entry, box.checked));
        label.append(box, element("span", "", entry.title));
        body.append(label);
      }
    }
  }

  function drawWorld() {
    const world = data.world;
    for (const [label, value] of [
      ["World", world.name],
      ["Town", world.town],
      ["Time", world.time],
      ["People", String(world.people)],
      ["Seed", world.seed],
    ]) {
      const row = element("div", "display:flex;justify-content:space-between;gap:12px;font-size:13px;");
      row.append(
        element("span", "opacity:0.7;", label),
        element("span", "text-align:right;word-break:break-all;", value),
      );
      body.append(row);
    }
  }

  function draw() {
    drawTabs();
    body.replaceChildren();
    if (!data) return;
    ({
      here: drawHere,
      people: drawPeople,
      party: drawParty,
      relations: drawRelations,
      places: drawPlaces,
      world: drawWorld,
    })[tab]();
  }

  return {
    panel,
    /** New contents. Skipped while something in the panel is being typed into. */
    render(next) {
      data = next;
      if (panel.style.display === "none" || panel.contains(document.activeElement)) return;
      // No redraw under the cursor in the lists with buttons and fields.
      const lists = tab === "places" || tab === "party" || tab === "relations";
      if (lists && !picker && body.childElementCount && !next.partyChanged && !next.relationsChanged) return;
      draw();
    },
    /** Shows the lore picker for a place; call again with `lorebooks` once they've loaded. */
    showLore(zone, lorebooks, chosen, onToggle) {
      tab = "places";
      picker = { zone, lorebooks, chosen, onToggle };
      draw();
    },
    /** Redraws now (after a rename or a lore change). */
    refresh() {
      draw();
    },
  };
}
