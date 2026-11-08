// The Journal: what the world knows, on screen. Tabs:
// - Here: where you are, the lore that's active here, and who's nearby, in the same words the AI will get.
// - People: where everyone in town is and what they're doing.
// - Places: every named place; rename any (a shop's new name goes on its sign) and tie lorebook entries
//   to it, so they're active while you're there.
// - World: the world's name, town, time and seed.
// Relationships and the party join as their own tabs (docs/CONCEPT.md, W3 and W4).
const TABS = [
  ["here", "Here"],
  ["people", "People"],
  ["places", "Places"],
  ["world", "World"],
];
const TAB = "font:600 12px system-ui,sans-serif;border:0;border-radius:7px;padding:4px 9px;cursor:pointer;";
const SMALL =
  "font:600 11px system-ui,sans-serif;border:0;border-radius:6px;padding:2px 7px;cursor:pointer;background:rgba(255,255,255,0.16);color:#f3f5f7;";
const MUTED = "opacity:0.7;font-size:12px;";

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

/** `handlers`: onRename(zoneId, name) (empty name puts the default back), onLore(zoneId). */
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
        node.style.background = id === tab ? "#e8eef5" : "rgba(255,255,255,0.14)";
        node.style.color = id === tab ? "#1a2230" : "#f3f5f7";
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

  function drawPlaces() {
    if (picker) return drawPicker();
    body.append(line("Rename a place, or tie lorebook entries to it. Shops show their name on the sign.", MUTED));
    for (const place of data.places) {
      const row = element("div", "display:flex;align-items:center;gap:6px;");
      const name = element(
        "input",
        "flex:1;min-width:0;font:13px system-ui;border-radius:6px;border:0;padding:3px 6px;",
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
    ({ here: drawHere, people: drawPeople, places: drawPlaces, world: drawWorld })[tab]();
  }

  return {
    panel,
    /** New contents. Skipped while something in the panel is being typed into. */
    render(next) {
      data = next;
      if (panel.style.display === "none" || panel.contains(document.activeElement)) return;
      if (tab === "places" && !picker && body.childElementCount) return; // no redraw under the cursor
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
