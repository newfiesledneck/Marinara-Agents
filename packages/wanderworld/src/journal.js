// The Journal: what the world knows, on screen. Tabs:
// - Here: where you are, the lore that's active here, and who's nearby, in the same words the AI will get.
// - People: where everyone in town is and what they're doing.
// - Places: every named place; rename any (a shop's new name goes on its sign) and tie lorebook entries
//   to it, so they're active while you're there.
// - World: the world's name, town, time and seed.
// Relationships and the party join as their own tabs (docs/CONCEPT.md, W3 and W4).
import { INK, INK_SMALL, INK_SOFT, SERIF } from "./ui.js";
import { clampView, mapCanvas } from "./map.js";
import { ACTIVITIES, ACTIVITY_WORDS, hourText } from "./schedules.js";

const TABS = [
  ["here", "Here"],
  ["people", "People"],
  ["party", "Party"],
  ["places", "Places"],
  ["map", "Map"],
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
const SHOWN_BOOKS = "wanderworld-lorebooks-shown";
const FIELD =
  "font:13px system-ui;border-radius:6px;border:1px solid #b89a6a;background:#fbf6e9;color:#2b1e10;padding:3px 6px;";

/** The lorebooks chosen to show in the lore picker, as saved in this browser; null when none saved. */
function readShownBooks() {
  try {
    const saved = JSON.parse(localStorage.getItem(SHOWN_BOOKS) ?? "null");
    return Array.isArray(saved) ? new Set(saved.filter((id) => typeof id === "string")) : null;
  } catch {
    return null;
  }
}

function saveShownBooks(ids) {
  try {
    localStorage.setItem(SHOWN_BOOKS, JSON.stringify([...ids]));
  } catch {
    // private window or blocked storage: it just isn't remembered
  }
}

export function createJournal(panelCss, handlers) {
  const panel = element("div", panelCss);
  panel.setAttribute("data-wanderworld-ui", "");
  panel.style.minWidth = "min(320px, calc(100% - 16px))";
  const tabs = element("div", "display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px;");
  const body = element("div", "display:flex;flex-direction:column;gap:6px;");
  panel.append(tabs, body);
  let tab = "here";
  let data = null;
  let groupEdit = null;
  let worldClock = null; // the World tab's time, updated in place
  const openNodes = new Set(["world", "places", "town", "groups"]); // which rows of the Places tree are open // the id of the group whose places are being chosen
  let peopleView = "roster"; // which part of the People tab is showing
  let picker = null; // { zone, lorebooks, chosen, onToggle } while choosing lore for a place

  const section = (label) => element("div", "font-weight:700;margin-top:4px;opacity:0.9;", label);
  const line = (text, css = "") => element("div", `font-size:13px;line-height:1.35;${css}`, text);
  /** An explanation: shown unless Settings → Show explanations is off. */
  const explain = (text) => {
    const node = line(text, `${MUTED}font-size:12px;`);
    node.setAttribute("data-wanderworld-explain", "");
    return node;
  };

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

  const pictureImage = element("img", "width:100%;border-radius:8px;border:1px solid rgba(107,74,43,0.6);");
  function drawHere() {
    const here = data.here;
    body.append(
      explain("Where you are, the lore active here, and who's close by: what the AI is told when people answer."),
    );
    body.append(section(here.place), line(here.chain, MUTED));
    body.append(section("Active lore"));
    if (here.lore.length) for (const entry of here.lore) body.append(line(`📜 ${entry.title}`));
    else body.append(line("None here. Tie lorebook entries to a place in Places.", MUTED));
    body.append(section("Nearby"));
    if (here.nearby.length) for (const text of here.nearby) body.append(line(text));
    else body.append(line("Nobody close by.", MUTED));
    if (here.recaps?.length) {
      body.append(section("What happened"));
      for (const text of here.recaps) body.append(line(`🎬 ${text}`));
    }
    if (here.canPicture) {
      body.append(section("A picture"));
      const picture = here.picture;
      if (picture?.url) {
        // The same image element each time, so the Journal's redraws don't make it flicker.
        if (pictureImage.src !== picture.url) pictureImage.src = picture.url;
        pictureImage.alt = `A picture of ${picture.place}`;
        body.append(pictureImage);
      } else if (picture?.pending) body.append(line("Painting it…", MUTED));
      else if (picture?.error) body.append(line(`No picture: ${picture.error}`, MUTED));
      const paint = button(picture?.url ? "Picture it again" : "Picture this place", SMALL, () =>
        handlers.onPicture?.(),
      );
      paint.disabled = !!picture?.pending;
      body.append(paint);
    }
    if (here.scenes?.length) {
      body.append(section("Scenes set up"));
      for (const text of here.scenes) body.append(line(text));
    }
  }

  /**
   * The schedule editor: each person's day as rows (from, to, what, where), changed here, written by
   * the AI (with what you ask for), or back to their usual day. Every change applies at once.
   */
  // People: who's in this world, set out to be read (it doesn't shift about), and behind buttons what
  // they're doing right now, and Edit people: everything about someone, in their own window (person.js).
  const PEOPLE_VIEWS = [
    ["roster", "People in this world"],
    ["doing", "Right now"],
    ["edit", "Edit people"],
  ];
  function drawPeople() {
    const views = element("div", "display:flex;gap:4px;flex-wrap:wrap;margin-bottom:4px;");
    for (const [id, label] of PEOPLE_VIEWS) {
      const tabButton = button(label, SMALL, () => {
        peopleView = id;
        draw();
      });
      tabButton.style.opacity = id === peopleView ? "1" : "0.6";
      views.append(tabButton);
    }
    body.append(views);
    if (peopleView === "doing") {
      body.append(explain("What everyone's doing at the moment, and how they see you."));
      if (!data.people.length) body.append(line("Nobody lives here yet.", MUTED));
      for (const text of data.people) body.append(line(text));
      return;
    }
    if (peopleView === "edit") return drawDetails();
    body.append(
      explain(
        "Everyone who lives in this world, by the groups they belong to. Who lives here is chosen in Settings → World.",
      ),
    );
    const { groups, creatures } = data.roster;
    if (!groups.length) body.append(line("Nobody lives here yet. Choose characters in Settings → World.", MUTED));
    for (const group of groups) {
      body.append(section(`${group.name} (${group.members.length})`));
      for (const member of group.members) {
        const row = element("div", "font-size:13px;line-height:1.4;");
        row.append(element("span", "font-weight:600;", member.name));
        if (member.facts) row.append(element("span", `color:${INK_SOFT};`, `  ${member.facts}`));
        body.append(row);
      }
    }
    if (creatures.length) {
      body.append(section(`Creatures (${creatures.length})`));
      body.append(explain("From the lore, kept for when the wilds have them."));
      for (const creature of creatures) body.append(line(creature, "font-size:13px;"));
    }
  }

  /** Everyone, each with an Edit button that opens their window (person.js): everything about them in one place. */
  function drawDetails() {
    body.append(
      explain(
        "Everything about each person is changed here, in their own window: body, voice, temperament, home and work, their day, and how they and everyone else see each other. For someone with a character card, who they are and their looks stay the card's; someone made for this world can have those changed too.",
      ),
    );
    if (!data.voices.people.length) body.append(line("Nobody lives here yet.", MUTED));
    const made = new Set(data.locals.map((person) => person.id));
    for (const person of data.voices.people) {
      const row = element("div", "display:flex;gap:8px;align-items:center;font-size:13px;");
      row.append(
        button("Edit", SMALL, () => handlers.onEditPerson?.(person.id)),
        element("span", "font-weight:600;", person.name),
        element(
          "span",
          `color:${INK_SOFT};font-size:12px;`,
          made.has(person.id) ? "made for this world" : "character card",
        ),
      );
      body.append(row);
    }
  }

  function drawParty() {
    body.append(
      explain(
        'Who\'s travelling with you: they follow you, wait where you ask, and come into scenes with you. "Everyone near me" brings along whoever is standing right round you.',
      ),
    );
    const all = element("div", "display:flex;gap:6px;flex-wrap:wrap;");
    all.append(button("Everyone near me comes along", SMALL, () => handlers.onPartyGather()));
    if (data.party.length) all.append(button("Everyone parts ways", SMALL, () => handlers.onPartyDisband()));
    body.append(all);
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

  // The Places lore picker: which lorebooks it lists, and which are folded open.
  let shownBooks = null;
  const openBooks = new Set();
  let chooserOpen = null; // whether "Lorebooks shown" is open (null: open only when none are shown)

  /**
   * The world's setup as a tree, each level with its own lore: the whole world; its characters (their
   * lore is active while you talk to them or they're in your party); the places, each inside the one it
   * sits in (town → street → building); and groups of places, which can sit inside other groups.
   */
  function drawPlaces() {
    if (picker) return drawPicker();
    if (groupEdit && data.groups.some((group) => group.id === groupEdit)) return drawGroup();
    groupEdit = null;
    const loreButton = (node) =>
      button(node.lore ? `Lore (${node.lore})` : "Lore", SMALL, () => handlers.onLore(node.id));
    /** A row in the tree at `depth`, with a fold toggle when it has `children`. */
    const treeRow = (depth, key, hasChildren, ...parts) => {
      const row = element("div", `display:flex;align-items:center;gap:6px;padding-left:${depth * 14}px;`);
      const open = openNodes.has(key);
      const fold = element(
        "button",
        "width:18px;flex:none;border:0;background:none;cursor:pointer;font-size:11px;color:inherit;padding:0;",
        hasChildren ? (open ? "▾" : "▸") : "",
      );
      fold.type = "button";
      if (hasChildren)
        fold.addEventListener("click", () => {
          if (open) openNodes.delete(key);
          else openNodes.add(key);
          draw();
        });
      row.append(fold, ...parts);
      body.append(row);
      return open;
    };
    const nameField = (value, placeholder, onChange) => {
      const name = element("input", `flex:1;min-width:0;${FIELD}`);
      name.value = value;
      name.placeholder = placeholder;
      name.maxLength = 60;
      name.addEventListener("change", () => onChange(name.value.trim()));
      name.addEventListener("keydown", (event) => {
        if (event.key === "Enter") name.blur();
      });
      return name;
    };
    const kindTag = (kind) => element("span", "font-size:11px;opacity:0.6;width:54px;flex:none;", kind);

    body.append(
      explain(
        "The world's setup: tie lore to the whole world, a character, any place, or a group. Lore is active where you are, in every place above it, and for whoever you're with.",
      ),
    );
    // The whole world, at the top.
    const worldOpen = treeRow(
      0,
      "world",
      true,
      element("span", "flex:1;font-weight:700;font-size:13px;", `🌍 ${data.worldLore.name}`),
      loreButton(data.worldLore),
    );
    if (!worldOpen) return;

    // Characters.
    if (
      data.characters.length &&
      treeRow(1, "characters", true, element("span", "flex:1;font-weight:600;font-size:13px;", "Characters"))
    ) {
      for (const character of data.characters) {
        treeRow(
          2,
          character.id,
          false,
          element("span", "flex:1;font-size:13px;", character.name),
          loreButton(character),
        );
      }
    }

    // Places, each under the one it sits in.
    const children = new Map();
    for (const place of data.places) {
      const parent = place.parent ?? "";
      if (!children.has(parent)) children.set(parent, []);
      children.get(parent).push(place);
    }
    const drawPlace = (place, depth) => {
      const kids = children.get(place.id) ?? [];
      const open = treeRow(
        depth,
        place.id,
        kids.length > 0,
        kindTag(place.slot ?? place.kind),
        nameField(place.name, place.defaultName, (value) => {
          if (value !== place.name) handlers.onRename(place.id, value === place.defaultName ? "" : value);
        }),
        loreButton(place),
      );
      if (open) for (const kid of kids) drawPlace(kid, depth + 1);
    };
    if (treeRow(1, "places", true, element("span", "flex:1;font-weight:600;font-size:13px;", "Places"))) {
      for (const place of children.get("") ?? []) drawPlace(place, 2);
    }

    // Groups, each under the group it sits in.
    const groupKids = new Map();
    const ids = new Set(data.groups.map((group) => group.id));
    for (const group of data.groups) {
      const parent = group.parent && ids.has(group.parent) ? group.parent : "";
      if (!groupKids.has(parent)) groupKids.set(parent, []);
      groupKids.get(parent).push(group);
    }
    const drawGroupRow = (group, depth, seen) => {
      if (seen.has(group.id)) return; // a loop of parents is drawn once
      seen.add(group.id);
      const kids = groupKids.get(group.id) ?? [];
      const inside = element("select", `${FIELD}max-width:90px;`);
      inside.title = "The group this one sits inside";
      for (const [value, label] of [
        ["", "(top)"],
        ...data.groups.filter((other) => other.id !== group.id).map((other) => [other.id, other.name]),
      ]) {
        const option = element("option", "", label);
        option.value = value;
        inside.append(option);
      }
      inside.value = group.parent && ids.has(group.parent) ? group.parent : "";
      inside.addEventListener("change", () => handlers.onGroupParent(group.id, inside.value));
      const open = treeRow(
        depth,
        group.id,
        kids.length > 0,
        nameField(group.name, "Group", (value) => handlers.onGroupRename(group.id, value)),
        inside,
        button(`Places (${group.members.length})`, SMALL, () => ((groupEdit = group.id), draw())),
        loreButton(group),
        confirmDelete(group),
      );
      if (open) for (const kid of kids) drawGroupRow(kid, depth + 1, seen);
    };
    if (treeRow(1, "groups", true, element("span", "flex:1;font-weight:600;font-size:13px;", "Groups"))) {
      const seen = new Set();
      for (const group of groupKids.get("") ?? []) drawGroupRow(group, 2, seen);
      const add = button("+ New group", SMALL, () => handlers.onGroupCreate("New group"));
      add.style.marginLeft = "28px";
      body.append(add);
    }
  }

  /** A group's ✕: asks "Delete?" first (a second press within a few seconds removes it and its lore). */
  function confirmDelete(group) {
    const remove = button("✕", SMALL, () => {
      if (remove.dataset.asking) return handlers.onGroupDelete(group.id);
      remove.dataset.asking = "1";
      remove.textContent = "Delete?";
      remove.title = `Delete ${group.name} and the lore tied to it`;
      setTimeout(() => {
        if (!remove.isConnected) return;
        delete remove.dataset.asking;
        remove.textContent = "✕";
      }, 3000);
    });
    remove.title = `Delete ${group.name}`;
    return remove;
  }

  /** One group's places: tick the ones in it. */
  function drawGroup() {
    const group = data.groups.find((entry) => entry.id === groupEdit);
    body.append(
      button("← Places", SMALL, () => ((groupEdit = null), draw())),
      section(`Places in ${group.name}`),
    );
    const members = new Set(group.members);
    for (const place of data.places) {
      const label = element("label", "display:flex;gap:6px;align-items:center;font-size:13px;cursor:pointer;");
      const box = element("input");
      box.type = "checkbox";
      box.checked = members.has(place.id);
      box.addEventListener("change", () => handlers.onGroupMember(group.id, place.id, box.checked));
      label.append(
        box,
        element("span", "font-size:11px;opacity:0.6;width:58px;flex:none;", place.kind),
        element("span", "", place.name),
      );
      body.append(label);
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
      explain(
        "Ticked entries are active here and in every place inside it: they're what the AI is told when people here answer.",
      ),
    );
    // Which lorebooks to list: chosen in a dropdown at the top (remembered in this browser); at first,
    // the ones with an entry ticked for this place.
    const ticked = (book) => book.entries.filter((entry) => chosen.has(`${book.id}/${entry.id}`)).length;
    if (!shownBooks)
      shownBooks = readShownBooks() ?? new Set(lorebooks.filter((book) => ticked(book)).map((book) => book.id));
    const choose = element(
      "details",
      "border:1px solid rgba(110,80,40,0.35);border-radius:6px;padding:4px 8px;background:rgba(255,250,235,0.5);",
    );
    const shown = lorebooks.filter((book) => shownBooks.has(book.id));
    choose.append(
      element(
        "summary",
        "cursor:pointer;font-size:13px;font-weight:600;",
        `Lorebooks shown: ${shown.length ? `${shown.length} of ${lorebooks.length}` : "none"}`,
      ),
    );
    for (const book of lorebooks) {
      const label = element(
        "label",
        "display:flex;gap:6px;align-items:center;font-size:13px;cursor:pointer;padding:1px 0;",
      );
      const box = element("input");
      box.type = "checkbox";
      box.checked = shownBooks.has(book.id);
      box.addEventListener("change", () => {
        if (box.checked) shownBooks.add(book.id);
        else shownBooks.delete(book.id);
        saveShownBooks(shownBooks);
        chooserOpen = true;
        draw();
      });
      label.append(box, element("span", "", book.name));
      choose.append(label);
    }
    choose.open = chooserOpen ?? !shown.length; // open until you close it yourself
    choose.addEventListener("toggle", () => (chooserOpen = choose.open));
    body.append(choose);
    if (!shown.length) return body.append(line("Choose the lorebooks to show above.", MUTED));
    // Each shown lorebook folds open to its entries.
    for (const book of shown) {
      const fold = element("details", "border-top:1px solid rgba(110,80,40,0.25);padding:4px 0;");
      const count = element("span", "font-weight:400;opacity:0.7;", "");
      const recount = () => (count.textContent = ` (${ticked(book)} of ${book.entries.length} ticked)`);
      recount();
      const summary = element("summary", "cursor:pointer;font-weight:600;font-size:13px;", book.name);
      summary.append(count);
      fold.append(summary);
      fold.open = openBooks.has(book.id);
      fold.addEventListener("toggle", () => (fold.open ? openBooks.add(book.id) : openBooks.delete(book.id)));
      if (!book.entries.length) fold.append(line("No entries.", MUTED));
      for (const entry of book.entries) {
        const label = element(
          "label",
          "display:flex;gap:6px;align-items:center;font-size:13px;cursor:pointer;padding-left:12px;",
        );
        const box = element("input");
        box.type = "checkbox";
        box.checked = chosen.has(`${book.id}/${entry.id}`);
        box.addEventListener("change", () => {
          onToggle(book, entry, box.checked);
          if (box.checked) chosen.add(`${book.id}/${entry.id}`);
          else chosen.delete(`${book.id}/${entry.id}`);
          recount();
        });
        label.append(box, element("span", "", entry.title));
        fold.append(label);
      }
      body.append(fold);
    }
  }

  function drawWorld() {
    const world = data.world;
    // The world's setup: its setting words, its lorebooks, and how their entries are linked to places.
    body.append(
      explain(
        "Your world's setup: what it's like, the lorebooks it uses, and how their entries link to places and characters.",
      ),
    );
    body.append(section("Setup"));
    const setting = element("textarea", `${FIELD}resize:vertical;min-height:44px;width:100%;box-sizing:border-box;`);
    setting.value = world.setting;
    setting.placeholder = 'Setting, e.g. "a cosy fishing village"';
    setting.maxLength = 600;
    setting.addEventListener("change", () => handlers.onSetSetup({ setting: setting.value.trim() }));
    body.append(setting);
    body.append(element("div", "font-size:12px;opacity:0.75;margin-top:4px;", "Scene instructions for this world"));
    body.append(
      explain(
        "Extra instructions for every scene you start here (play it as a scene): tone, what to avoid, how much detail. Point of view and tense are in Settings → AI.",
      ),
    );
    const instructions = element(
      "textarea",
      `${FIELD}resize:vertical;min-height:44px;width:100%;box-sizing:border-box;`,
    );
    instructions.value = world.sceneInstructions ?? "";
    instructions.placeholder = 'e.g. "Slow-burn, cosy, keep it SFW; describe the food"';
    instructions.maxLength = 1000;
    instructions.addEventListener("change", () =>
      handlers.onSetSetup({ sceneInstructions: instructions.value.trim() }),
    );
    body.append(instructions);
    body.append(element("div", "font-size:12px;opacity:0.75;margin-top:4px;", "Lorebooks for this world"));
    if (!world.allLorebooks) {
      body.append(line("Reading your lorebooks…", MUTED));
      handlers.onWantLorebooks();
    } else if (!world.allLorebooks.length) body.append(line("No lorebooks found.", MUTED));
    else {
      const chosen = new Set(world.lorebooks);
      const list = element("div", "display:flex;flex-direction:column;gap:2px;max-height:120px;overflow-y:auto;");
      for (const book of world.allLorebooks) {
        const label = element("label", "display:flex;gap:6px;align-items:center;font-size:13px;cursor:pointer;");
        const box = element("input");
        box.type = "checkbox";
        box.checked = chosen.has(book.id);
        box.addEventListener("change", () => {
          if (box.checked) chosen.add(book.id);
          else chosen.delete(book.id);
          handlers.onSetSetup({ lorebooks: [...chosen] });
        });
        label.append(box, element("span", "", book.name));
        list.append(label);
      }
      body.append(list);
    }
    const picker = (field, options) => {
      const select = element("select", `${FIELD}width:100%;`);
      for (const [value, text] of options) {
        const option = element("option", "", text);
        option.value = value;
        select.append(option);
      }
      select.value = world[field];
      select.addEventListener("change", () => handlers.onSetSetup({ [field]: select.value }));
      body.append(select);
    };
    picker("loreLinking", [
      ["none", "Lore and places: I'll tie lore myself"],
      ["keywords", "Lore and places: link lorebook entries by their ww: keywords"],
      ["ai", "Lore and places: let the AI read the lorebooks"],
    ]);
    picker("characterLinking", [
      ["none", "Characters: I'll set them up myself"],
      ["keywords", "Characters: set up from ww: keywords"],
      ["ai", "Characters: let the AI set them up (cards, persona, lorebooks)"],
    ]);
    const byAi = world.loreLinking === "ai" || world.characterLinking === "ai";
    if (byAi || world.loreLinking === "keywords" || world.characterLinking === "keywords")
      body.append(
        button(byAi ? "Have the AI set the world up now" : "Link lore by its ww: keywords now", SMALL, () =>
          handlers.onLinkLore(),
        ),
      );
    const needed = Object.entries(world.needs).map(([kind, count]) => `${kind} ×${count}`);
    if (needed.length) {
      body.append(line(`Built with at least: ${needed.join(", ")}.`, MUTED));
    }
    body.append(
      explain(
        "With places linked, the world is built with at least every numbered place its lorebooks name (smithy3 makes three smithies; a cave brings mountains). The AI reads the characters' cards, your persona and any lorebook and works those out itself (one model call for the cast, one for every 40 lorebook entries, on the conversations connection); the other way needs ww: keywords on the entries (ww: smithy3). It only fills in what isn't set yet. After changing lorebooks or reading them again, Settings → Regenerate this world builds what's new.",
      ),
    );
    body.append(element("div", "font-size:12px;opacity:0.75;margin-top:4px;", "Season"));
    const season = element("select", FIELD);
    for (const [value, label] of [
      ["", "None (green land)"],
      ["spring", "Spring"],
      ["summer", "Summer"],
      ["fall", "Fall"],
      ["winter", "Winter (snow lies)"],
    ]) {
      const option = element("option", "", label);
      option.value = value;
      season.append(option);
    }
    season.value = world.season;
    season.addEventListener("change", () => handlers.onSetSetup({ season: season.value }));
    body.append(season);
    body.append(section("Keywords"));
    body.append(
      explain(
        "Wanderworld acts only on lorebook keywords that start with \"ww:\". This lists any it didn't understand: a typo, a place this world doesn't have, a name nobody here has.",
      ),
    );
    body.append(
      button("Check ww: keywords", SMALL, (event) => {
        event.currentTarget.blur(); // the answer redraws this tab, which waits while something in it has focus
        handlers.onCheckKeywords?.();
      }),
    );
    if (world.keywords) {
      body.append(
        line(
          world.keywords.unknown.length
            ? `${world.keywords.found} found, ${world.keywords.unknown.length} not understood:`
            : `${world.keywords.found} found, all understood.`,
        ),
      );
      for (const item of world.keywords.unknown)
        body.append(line(`ww: ${item.word}  (${item.entry}, in ${item.book})`, "font-size:12px;"));
    }
    if (world.book.length) {
      body.append(section("Written for this world"));
      body.append(explain("Lore the AI wrote for this world. It's yours to change: it's what people here know."));
      for (const entry of world.book) {
        body.append(element("div", "font-weight:600;font-size:13px;margin-top:4px;", entry.title));
        const area = element("textarea", `${FIELD}resize:vertical;width:100%;box-sizing:border-box;`);
        area.rows = 3;
        area.value = entry.content;
        area.setAttribute("aria-label", `Lore: ${entry.title}`);
        area.addEventListener("change", () => handlers.onEditBook?.(entry.id, area.value.trim()));
        body.append(area);
      }
    }
    if (world.creatures.length) {
      body.append(
        explain(`Creatures from the lore, kept for when the wilds have them: ${world.creatures.join(", ")}.`),
      );
    }
    if (world.waiting.length) {
      body.append(
        explain(
          `Waiting for the world builder (the lore puts them somewhere this world hasn't built them): ${world.waiting.join(", ")}.`,
        ),
      );
    }
    body.append(section("This world"));
    for (const [label, value] of [
      ["World", world.name],
      ["Town", world.town],
      ["Time", world.time],
      ["People", String(world.people)],
      ["Seed", world.seed],
    ]) {
      const row = element("div", "display:flex;justify-content:space-between;gap:12px;font-size:13px;");
      const shown = element("span", "text-align:right;word-break:break-all;", value);
      if (label === "Time") worldClock = shown; // ticks on while the tab is open (render)
      row.append(element("span", "opacity:0.7;", label), shown);
      body.append(row);
    }
  }

  let map = null; // the Map tab's canvas, redrawn in place as you walk
  let mapView = { x: 0, z: 0, zoom: 1 }; // what the map shows: its middle, and how close
  let mapHalf = 160; // half the region's side, in metres (from the last drawing)
  let mapNote = null;
  function redrawMap() {
    if (!map?.isConnected) return;
    mapView = clampView(mapView, mapHalf);
    const drawn = handlers.onMap?.(map, mapView);
    if (drawn?.half) mapHalf = drawn.half;
    if (mapNote) mapNote.textContent = drawn?.waypoint ?? "";
  }
  function drawMap() {
    body.append(
      explain(
        "This region from above: you (yellow), your home, the town, places out in the country, and where each edge leads. Scroll or use the buttons to look closer, drag to move about, and click to set a waypoint.",
      ),
    );
    map = mapCanvas(420, 420);
    map.style.cursor = "crosshair";
    map.style.touchAction = "none";
    // Where on the map a pointer is, in the world's metres.
    const at = (event) => {
      const box = map.getBoundingClientRect();
      const across = (mapHalf * 2) / mapView.zoom;
      return {
        x: mapView.x + ((event.clientX - box.left) / box.width - 0.5) * across,
        z: mapView.z + ((event.clientY - box.top) / box.height - 0.5) * across,
      };
    };
    const zoomTo = (zoom, keep = null) => {
      const before = keep ? at(keep) : null;
      mapView = clampView({ ...mapView, zoom }, mapHalf);
      if (before) {
        // The spot under the pointer stays under it.
        const after = at(keep);
        mapView = clampView(
          { ...mapView, x: mapView.x + before.x - after.x, z: mapView.z + before.z - after.z },
          mapHalf,
        );
      }
      redrawMap();
    };
    map.addEventListener(
      "wheel",
      (event) => {
        event.preventDefault();
        zoomTo(mapView.zoom * (event.deltaY < 0 ? 1.25 : 0.8), event);
      },
      { passive: false },
    );
    let drag = null;
    map.addEventListener("pointerdown", (event) => {
      drag = { x: event.clientX, y: event.clientY, view: { ...mapView }, moved: false };
      map.setPointerCapture?.(event.pointerId);
    });
    map.addEventListener("pointermove", (event) => {
      if (!drag) return;
      const box = map.getBoundingClientRect();
      const perPixel = (mapHalf * 2) / mapView.zoom / box.width;
      if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 4) drag.moved = true;
      if (!drag.moved) return;
      mapView = {
        ...mapView,
        x: drag.view.x - (event.clientX - drag.x) * perPixel,
        z: drag.view.z - (event.clientY - drag.y) * perPixel,
      };
      redrawMap();
    });
    map.addEventListener("pointerup", (event) => {
      const clicked = drag && !drag.moved;
      drag = null;
      if (!clicked) return;
      handlers.onWaypoint?.(at(event));
      redrawMap();
    });
    map.addEventListener("pointercancel", () => (drag = null));
    const controls = element("div", "display:flex;gap:4px;flex-wrap:wrap;align-items:center;");
    mapNote = element("span", `font-size:12px;color:${INK_SOFT};`, "");
    controls.append(
      button("+", SMALL, () => zoomTo(mapView.zoom * 1.5)),
      button("−", SMALL, () => zoomTo(mapView.zoom / 1.5)),
      button("Whole region", SMALL, () => {
        mapView = { x: 0, z: 0, zoom: 1 };
        redrawMap();
      }),
      button("Clear waypoint", SMALL, () => {
        handlers.onWaypoint?.(null);
        redrawMap();
      }),
      mapNote,
    );
    body.append(map, controls);
    redrawMap();
  }

  function draw() {
    drawTabs();
    body.replaceChildren();
    if (!data) return;
    ({
      here: drawHere,
      people: drawPeople,
      party: drawParty,
      places: drawPlaces,
      map: drawMap,
      world: drawWorld,
    })[tab]();
  }

  return {
    panel,
    /** New contents. Skipped while something in the panel is being typed into. */
    render(next) {
      data = next;
      if (panel.style.display === "none" || panel.contains(document.activeElement)) return;
      if (tab === "map" && map?.isConnected) return void redrawMap();
      // Only "Right now" follows the world; the rest of People stays put until something in it changes.
      const peopleChanged = next.placesChanged || next.relationsChanged || next.partyChanged;
      if (tab === "people" && peopleView !== "doing" && body.childElementCount && !peopleChanged) return;
      // No redraw under the cursor in the lists with buttons and fields.
      const lists = tab === "places" || tab === "party" || tab === "relations" || tab === "world";
      // The lore picker redraws only when it's opened or its lorebooks arrive (showLore), never under you.
      if (picker && body.childElementCount) return;
      // The World tab's clock ticks on even when the tab isn't redrawn.
      if (tab === "world" && worldClock?.isConnected) worldClock.textContent = next.world.time;
      const changed = next.partyChanged || next.relationsChanged || next.placesChanged;
      if (lists && !picker && body.childElementCount && (!changed || groupEdit)) return; // a group's ticks are already shown
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
