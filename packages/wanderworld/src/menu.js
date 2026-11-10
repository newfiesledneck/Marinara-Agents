// The main menu: Continue, New world, Load world and Settings, over a painted backdrop. It opens first,
// and the in-game Menu button comes back to it (saving the world first). The Load list shows each saved
// world with a thumbnail, when it was last played, and Rename and Delete.
import { INK_INPUT, INK_SMALL, PARCHMENT_EDGED, SERIF, STONE, WOOD } from "./ui.js";
import { mapCanvas, randomSeed } from "./map.js";

const FONT = "system-ui,sans-serif";
// The menu's card is parchment, its choices wooden boards with cream lettering.
const PANEL =
  `${PARCHMENT_EDGED}padding:26px 28px;display:flex;flex-direction:column;gap:10px;` +
  "width:min(420px,calc(100% - 32px));max-height:calc(100% - 32px);overflow-y:auto;box-sizing:border-box;pointer-events:auto;";
const BIG =
  `font:600 17px ${SERIF};border:1px solid #4e341d;border-radius:9px;padding:11px 16px;cursor:pointer;text-align:left;` +
  `${WOOD}box-shadow:0 2px 4px rgba(0,0,0,0.25);`;
const SMALL = INK_SMALL;
const INPUT = `${INK_INPUT}width:100%;`;

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

/** "just now", "5 minutes ago", "yesterday", "3 days ago". */
function ago(time) {
  const minutes = Math.round((Date.now() - time) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}

/**
 * `handlers`: list() → saved worlds, last() → the last played or null, onPlay(id), lorebooks() → a promise
 * of [{ id, name }], onCreate({ name, seed, choices, setting, lorebooks, loreLinking }),
 * onRename(id, name), onDelete(id), onSettings(section: "Help" | "Credits" | none), suggestName() → a name for a new world.
 * `art`: { background, portrait (the backdrop on tall screens), logo } image URLs, or null for the painted
 * gradient and a lettered title.
 */
export function createMenu(layer, handlers, art = null) {
  const screen = element(
    "div",
    "position:absolute;inset:0;display:none;align-items:center;justify-content:flex-start;padding:0 6vw;" +
      `font-family:${FONT};pointer-events:auto;background:linear-gradient(180deg,#9cc4e4 0%,#e8d9b8 62%,#9fbf7c 100%) center/cover;`,
  );
  screen.setAttribute("data-wanderworld-ui", "");
  // The painted backdrop, the tall one on a phone held upright; the gradient shows until it loads.
  const tall = window.matchMedia?.("(orientation: portrait)");
  const backdrop = () => {
    const url = tall?.matches ? art?.portrait : art?.background;
    if (url)
      screen.style.backgroundImage = `url("${url}"), linear-gradient(180deg,#9cc4e4 0%,#e8d9b8 62%,#9fbf7c 100%)`;
  };
  backdrop();
  tall?.addEventListener?.("change", backdrop);
  const column = element(
    "div",
    // No taller than the window: the card below the logo shrinks and scrolls (a long New world form).
    "display:flex;flex-direction:column;gap:14px;align-items:stretch;width:min(420px,100%);max-height:calc(100% - 24px);padding:12px 0;box-sizing:border-box;",
  );
  const title = element(
    "div",
    `font:800 clamp(34px,6vw,58px) Georgia,"Times New Roman",serif;color:#fff8e6;text-shadow:0 3px 14px rgba(40,25,10,0.55);letter-spacing:0.5px;`,
    "Wanderworld",
  );
  // The carved logo in place of the lettering, once it has loaded.
  if (art?.logo) {
    const logo = element(
      "img",
      "flex:none;width:min(460px,100%);max-height:22vh;object-fit:contain;object-position:left;height:auto;filter:drop-shadow(0 4px 14px rgba(30,18,6,0.45));",
    );
    logo.alt = "Wanderworld";
    logo.addEventListener("load", () => title.replaceWith(logo));
    logo.src = art.logo;
  }
  const tagline = element(
    "div",
    "font:600 15px system-ui,sans-serif;color:#fff8e6;text-shadow:0 1px 3px rgba(0,0,0,0.85),0 0 14px rgba(0,0,0,0.5);margin-top:-8px;",
    "Your characters, living their days in a world of their own.",
  );
  const card = element("div", `${PANEL}flex:0 1 auto;min-height:0;`);
  // The card scrolls; nothing inside it is squeezed (the character and lorebook lists would shrink to nothing).
  card.setAttribute("data-wanderworld-menu-card", "");
  const noSqueeze = element("style", "");
  noSqueeze.textContent = "[data-wanderworld-menu-card] > * { flex-shrink: 0; }";
  screen.append(noSqueeze);
  for (const fixed of [title, tagline]) fixed.style.flex = "none";
  column.append(title, tagline, card);
  screen.append(column);
  layer.prepend(screen); // under the HUD's panels, so Settings opens over it

  function home() {
    card.replaceChildren();
    const last = handlers.last();
    if (last) {
      const resume = button("", BIG, () => handlers.onPlay(last.id));
      resume.append(element("div", "", "Continue"), element("div", "font:400 12px system-ui;opacity:0.75;", last.name));
      card.append(resume);
    }
    const loadButton = button("Load world", BIG, load);
    if (!handlers.list().length) loadButton.style.opacity = "0.5";
    card.append(
      button("New world", BIG, newWorld),
      loadButton,
      button("Settings", BIG, () => handlers.onSettings()),
      button("Help", BIG, () => handlers.onSettings("Help")),
    );
    // Credits and thanks: set apart from the rest, in gold.
    const credits = button("♥  Credits and Thanks", BIG, () => handlers.onSettings("Credits"));
    credits.style.cssText += `${STONE}border:2px solid #c9a24a;box-shadow:0 0 10px rgba(230,190,90,0.55);`;
    card.append(credits);
  }

  function newWorld() {
    card.replaceChildren();
    const name = element("input", INPUT);
    name.value = handlers.suggestName();
    name.maxLength = 60;
    name.setAttribute("aria-label", "World name");
    const seed = element("input", INPUT);
    seed.placeholder = "Seed (optional: the same seed builds the same town)";
    seed.maxLength = 80;
    // The seed the preview shows while the box is empty (and the world gets, unless one is typed).
    let previewSeed = randomSeed();
    const preview = mapCanvas(320, 260);
    let previewTimer = null;
    const redraw = () => {
      clearTimeout(previewTimer);
      previewTimer = setTimeout(
        () => handlers.preview?.(preview, seed.value.trim() || previewSeed, { ...choices }),
        150,
      );
    };
    seed.addEventListener("input", redraw);
    const reroll = button("Reroll", SMALL, () => {
      previewSeed = randomSeed();
      seed.value = "";
      redraw();
    });
    // The land round the town: each choice, or Surprise me (the seed decides).
    const choices = {};
    let sizePicker = null; // the review's size choice shows here too, a step back
    const pickers = element(
      "div",
      "display:grid;grid-template-columns:auto 1fr;gap:6px 10px;align-items:center;font-size:13px;",
    );
    for (const [key, label, options] of [
      [
        "hills",
        "Hills",
        [
          ["flat", "Flat"],
          ["gentle", "Gentle"],
          ["rolling", "Rolling"],
          ["rugged", "Rugged"],
        ],
      ],
      [
        "mountains",
        "Mountains",
        [
          ["none", "None"],
          ["one", "On one side"],
          ["two", "On two sides"],
          ["three", "On three sides"],
        ],
      ],
      [
        "river",
        "River",
        [
          ["yes", "Yes"],
          ["no", "No"],
        ],
      ],
      [
        "settlement",
        "Settlement",
        [
          ["hamlet", "A hamlet"],
          ["village", "A village"],
          ["town", "A town"],
          ["city", "A city"],
        ],
      ],
      [
        "layout",
        "Layout",
        [
          ["grid", "A grid of streets"],
          ["crossroads", "A crossroads"],
          ["street", "Along one street"],
          ["ring", "Round the market"],
          ["scattered", "Scattered houses, no streets"],
          ["pond", "Round a pond, houses at the edge"],
          ["quarters", "Four quarters and a green"],
        ],
      ],
      [
        "walls",
        "Walls",
        [
          ["no", "None"],
          ["yes", "Walls and gates"],
        ],
      ],
      [
        "marketAt",
        "Market",
        [
          ["middle", "In the middle"],
          ["side", "Off to one side"],
        ],
      ],
      [
        "roads",
        "Streets",
        [
          ["cobble", "Cobbled, with sidewalks"],
          ["dirt", "Dirt paths"],
        ],
      ],
      [
        "size",
        "World size",
        [
          ["small", "Small"],
          ["normal", "Normal"],
          ["large", "Large"],
          ["huge", "Huge"],
          ["massive", "Massive"],
        ],
      ],
      [
        "towns",
        "More settlements",
        [
          ["none", "None"],
          ["one", "A hamlet"],
          ["two", "Two hamlets"],
        ],
      ],
      [
        "farms",
        "Farms",
        [
          ["none", "None"],
          ["one", "One farm"],
          ["two", "Two farms"],
        ],
      ],
      [
        "landmarks",
        "Landmarks",
        [
          ["none", "None"],
          ["few", "A few (ruins, a watchtower…)"],
          ["several", "Several"],
        ],
      ],
      [
        "places",
        "Out in the country",
        [
          ["none", "Nothing"],
          ["few", "A few places"],
          ["several", "Several places"],
        ],
      ],
    ]) {
      const select = element("select", `${INPUT}padding:5px 8px;`);
      for (const [value, text] of [["surprise", key === "size" ? "Auto" : "Surprise me"], ...options]) {
        const option = element("option", "", text);
        option.value = value;
        select.append(option);
      }
      select.addEventListener("change", () => {
        choices[key] = select.value;
        redraw();
      });
      if (key === "size") sizePicker = select;
      pickers.append(element("span", "opacity:0.8;", label), select);
    }
    // The world's setting in words, its lorebooks, and how their entries are linked to places.
    /** An explanation line (hidden with Menu → Settings → Show explanations off). */
    const explainLine = (text) => {
      const node = element("div", "font:11px system-ui;opacity:0.7;line-height:1.35;", text);
      node.setAttribute("data-wanderworld-explain", "");
      return node;
    };
    const setting = element("textarea", `${INPUT}resize:vertical;min-height:44px;font:13px system-ui;`);
    setting.placeholder = 'Setting (optional), e.g. "a cosy fishing village where the old gods still listen"';
    setting.maxLength = 600;
    const lorebooks = new Set();
    const bookList = element(
      "div",
      "display:flex;flex-direction:column;gap:2px;max-height:110px;overflow-y:auto;font-size:13px;",
      "Reading your lorebooks…",
    );
    Promise.resolve(handlers.lorebooks?.())
      .then((books) => {
        if (!books?.length) return void (bookList.textContent = "No lorebooks found.");
        bookList.replaceChildren(
          ...books.map((book) => {
            const label = element("label", "display:flex;gap:6px;align-items:center;cursor:pointer;");
            const box = element("input");
            box.type = "checkbox";
            box.addEventListener("change", () => (box.checked ? lorebooks.add(book.id) : lorebooks.delete(book.id)));
            label.append(box, element("span", "", book.name));
            return label;
          }),
        );
      })
      .catch(() => (bookList.textContent = "Couldn't read your lorebooks."));
    const picker = (options) => {
      const select = element("select", `${INPUT}padding:5px 8px;`);
      for (const [value, text] of options) {
        const option = element("option", "", text);
        option.value = value;
        select.append(option);
      }
      return select;
    };
    // Off unless chosen: nothing is linked or set up for you until you opt in.
    const linking = picker([
      ["none", "Lore and places: I'll tie lore myself"],
      ["keywords", "Lore and places: link lorebook entries by their ww: keywords"],
      ["ai", "Lore and places: let the AI read the lorebooks"],
    ]);
    const characterLinking = picker([
      ["none", "Characters: I'll set them up myself"],
      ["keywords", "Characters: set up from ww: keywords (body, home, work, day, relationships)"],
      ["ai", "Characters: let the AI set them up (cards, persona, lorebooks)"],
    ]);
    // What the AI writes for this world itself: its lore and places, and people who have no card.
    const writeLore = picker([
      ["no", "World lore: only what my lorebooks say"],
      ["yes", "World lore: let the AI write this world and its places"],
    ]);
    const newPeople = element("input", `${INPUT}width:64px;`);
    newPeople.type = "number";
    newPeople.min = "0";
    newPeople.max = "12";
    newPeople.value = "0";
    newPeople.setAttribute("aria-label", "New people for the AI to invent");
    const newPeopleRow = element("label", "display:flex;gap:8px;align-items:center;font:13px system-ui;");
    newPeopleRow.append(
      newPeople,
      element("span", "", "new people for the AI to invent (they live in this world only)"),
    );
    // How old the people the AI makes may be: 21 and up unless changed; an empty box is no limit.
    const ageBox = (value, label) => {
      const box = element("input", `${INPUT}width:64px;`);
      box.type = "number";
      box.min = "1";
      box.max = "100000";
      box.value = value;
      box.placeholder = "any";
      box.setAttribute("aria-label", label);
      return box;
    };
    const ageMin = ageBox("21", "Youngest age of the people the AI makes");
    const ageMax = ageBox("", "Oldest age of the people the AI makes");
    const ageOf = (box) => {
      const value = Math.round(Number(box.value));
      return box.value.trim() !== "" && value >= 1 && value <= 100000 ? value : null;
    };
    const agesRow = element("label", "display:flex;gap:8px;align-items:center;flex-wrap:wrap;font:13px system-ui;");
    agesRow.append(
      element("span", "", "Ages of the people the AI makes: from"),
      ageMin,
      element("span", "", "to"),
      ageMax,
    );
    // Who you play: type a persona's name (an exact match picks it) or pick one from the list.
    const people = handlers.people?.() ?? {
      personas: [],
      characters: [],
      folders: [],
      cast: [],
      persona: null,
      max: 30,
    };
    let personaId = people.persona;
    const personaRow = element("div", "display:flex;gap:6px;align-items:center;");
    const personaInput = element("input", `${INPUT}flex:1;min-width:0;`);
    personaInput.placeholder = "Your persona's name";
    personaInput.setAttribute("aria-label", "Persona");
    const personaPick = element("select", `${INPUT}padding:5px 8px;max-width:45%;`);
    for (const [value, text] of [["", "Pick…"], ...people.personas.map((entry) => [entry.id, entry.name])]) {
      const option = element("option", "", text);
      option.value = value;
      personaPick.append(option);
    }
    const personaNote = element("div", "font:11px system-ui;opacity:0.75;");
    const showPersona = () => {
      const chosen = people.personas.find((entry) => entry.id === personaId);
      personaPick.value = chosen ? chosen.id : "";
      personaNote.textContent = chosen
        ? `Playing as ${chosen.name}.`
        : personaInput.value.trim()
          ? "No persona has exactly that name: pick one from the list."
          : "Type your persona's name, or pick one.";
    };
    personaInput.value = people.personas.find((entry) => entry.id === personaId)?.name ?? "";
    personaInput.addEventListener("input", () => {
      const typed = personaInput.value.trim().toLowerCase();
      personaId = people.personas.find((entry) => entry.name.trim().toLowerCase() === typed)?.id ?? null;
      showPersona();
    });
    personaPick.addEventListener("change", () => {
      personaId = personaPick.value || null;
      personaInput.value = people.personas.find((entry) => entry.id === personaId)?.name ?? personaInput.value;
      showPersona();
    });
    personaRow.append(personaInput, personaPick);
    showPersona();

    // Who lives there: the Engine's characters in their folders (fold one open to choose), up to the most a town holds.
    const cast = new Set(people.cast.filter((id) => people.characters.some((entry) => entry.id === id)));
    const castHeading = element("div", "font:12px system-ui;opacity:0.75;");
    const castList = element(
      "div",
      "display:flex;flex-direction:column;gap:2px;max-height:180px;overflow-y:auto;font-size:13px;",
    );
    const byId = new Map(people.characters.map((entry) => [entry.id, entry]));
    const inFolder = new Set(people.folders.flatMap((folder) => folder.memberIds));
    const boxes = new Map(); // character id → its checkboxes (one per folder it's in)
    const folderBoxes = []; // each folder's own checkbox: [{ box, members }]
    const refreshCast = () => {
      castHeading.textContent = `Characters living there (${cast.size} of up to ${people.max})`;
      // Each folder's box: ticked when all of it is chosen, half-ticked when some are.
      for (const { box, members } of folderBoxes) {
        const chosen = members.filter((entry) => cast.has(entry.id)).length;
        box.checked = chosen === members.length;
        box.indeterminate = chosen > 0 && chosen < members.length;
      }
      for (const [id, list] of boxes) {
        for (const box of list) {
          box.checked = cast.has(id);
          box.disabled = !box.checked && cast.size >= people.max;
        }
      }
    };
    const characterRow = (character) => {
      const label = element("label", "display:flex;gap:6px;align-items:center;cursor:pointer;padding-left:16px;");
      const box = element("input");
      box.type = "checkbox";
      box.addEventListener("change", () => {
        if (box.checked && cast.size < people.max) cast.add(character.id);
        else cast.delete(character.id);
        refreshCast();
      });
      if (!boxes.has(character.id)) boxes.set(character.id, []);
      boxes.get(character.id).push(box);
      label.append(box, element("span", "", character.name));
      return label;
    };
    // A folder: its own checkbox picks everyone in it (as many as fit) or nobody; open it to pick one by one.
    const folderFold = (name, members) => {
      const fold = element("details", "");
      const summary = element("summary", "cursor:pointer;font-weight:600;display:flex;gap:6px;align-items:center;");
      const all = element("input");
      all.type = "checkbox";
      all.title = `Everyone in ${name}`;
      all.addEventListener("click", (event) => event.stopPropagation()); // ticking doesn't open or close it
      all.addEventListener("change", () => {
        for (const entry of members) {
          if (!all.checked) cast.delete(entry.id);
          else if (cast.size < people.max) cast.add(entry.id);
        }
        refreshCast();
      });
      folderBoxes.push({ box: all, members });
      summary.append(all, element("span", "", `📁 ${name} (${members.length})`));
      fold.append(summary, ...members.map(characterRow));
      return fold;
    };
    for (const folder of people.folders) {
      const members = folder.memberIds.map((id) => byId.get(id)).filter(Boolean);
      if (members.length) castList.append(folderFold(folder.name, members));
    }
    const loose = people.characters.filter((entry) => !inFolder.has(entry.id));
    if (loose.length)
      castList.append(people.folders.length ? folderFold("Not in a folder", loose) : element("div", "", ""));
    if (!people.folders.length) castList.replaceChildren(...loose.map(characterRow));
    if (!people.characters.length) castList.textContent = "No characters found.";
    refreshCast();

    const chosen = () => ({
      name: name.value.trim(),
      seed: seed.value.trim() || previewSeed,
      choices,
      setting: setting.value.trim(),
      lorebooks: [...lorebooks],
      loreLinking: linking.value,
      characterLinking: characterLinking.value,
      cast: [...cast],
      persona: personaId,
      writeLore: writeLore.value === "yes",
      newPeople: Math.max(0, Math.min(12, Math.round(Number(newPeople.value)) || 0)),
      ages: { min: ageOf(ageMin), max: ageOf(ageMax) },
      onSize: (value) => {
        choices.size = value;
        if (sizePicker) sizePicker.value = value;
        redraw();
      },
      // The review rerolled the map: the settings a step back show the same one.
      onSeed: (value) => {
        previewSeed = value;
        seed.value = "";
        redraw();
      },
    });
    // With the AI setting the world up, its setup is shown for a look before the land is built.
    const byAi = (params) =>
      params.writeLore ||
      params.newPeople > 0 ||
      params.characterLinking === "ai" ||
      (params.loreLinking === "ai" && params.lorebooks.length > 0);
    const create = button("Create and play", BIG, () => {
      const params = chosen();
      if (byAi(params)) void review(params, [...card.childNodes]);
      else handlers.onCreate(params);
    });
    card.append(
      element("div", "font:700 17px system-ui;", "New world"),
      element("div", "font:12px system-ui;opacity:0.75;", "Name"),
      name,
      seed,
      element("div", "font:12px system-ui;opacity:0.75;", "You play as"),
      personaRow,
      personaNote,
      castHeading,
      castList,
      explainLine("The same seed always builds the same town. The setting tells the AI what kind of world to write."),
      setting,
      pickers,
      preview,
      explainLine(
        "A map these choices could make: a first idea, not a promise. Lorebooks, and the AI setting the world up, add the places the lore needs, so the map you get can differ. With the AI, you see the real one (and can reroll it) before the world is built.",
      ),
      reroll,
      element("div", "font:12px system-ui;opacity:0.75;", "Lorebooks for this world"),
      explainLine(
        "Wanderworld only acts on lorebook keys written ww:<what>:<value>, so a lorebook's ordinary trigger words never set anything by accident. ww:tavern1 ties an entry to the first tavern, ww:world to the whole world, ww:Mira to a character; on a character's entry ww:body:woman, ww:lives in:home3, ww:owner of:tavern1, ww:work:10:15-18:45, ww:friend of:you or ww:sister of:Tam set them up, and ww:character:Mira Saxton says an entry is that person. Once you're in a world, Menu → Settings → Help lists them all, with a prompt for your assistant.",
      ),
      bookList,
      element("div", "font:12px system-ui;opacity:0.75;", "Setting the world up"),
      explainLine(
        "The AI can make the world ready to play: who's a man or a woman, how people know each other and you, where everyone lives and works, and which lore belongs to which place, with the places that takes built in. It reads your characters' cards and persona (one model call) and the lorebooks chosen above (one call for every 40 entries), on the conversations connection. No lorebook is needed for the characters.",
      ),
      characterLinking,
      linking,
      writeLore,
      newPeopleRow,
      agesRow,
      explainLine(
        "The usual ages of people the AI invents or fills in, when nothing says how old they are. It never overrides your lore, setting or cards: an elf your lore makes a thousand years old stays a thousand. Any age from 1; empty either box for no limit that way. You can change it later in Journal → World.",
      ),
      explainLine(
        "With nothing chosen above, the AI can still make a whole world: it writes the world and its places first, then people who belong there, then fits your own characters in among them. Each is one more model call. The people it invents aren't Engine characters: they live, talk and keep their days in this world only, and can't be cast in scenes.",
      ),
      create,
      button("Back", SMALL, home),
    );
    name.focus();
    name.select();
    redraw();
  }

  // The last setup the AI gave, and what it was asked for: going back to change the land doesn't ask again.
  let reviewed = null; // { asked, result }

  /**
   * The AI's setup of a new world, for a look before the land is built: who's who, where they live and
   * work, how they know each other, the places the world gets and the lore tied to them. From here:
   * build it, ask again (only what failed, when something did), or go back to the settings (`form`:
   * the New world card's own nodes, put back as they were).
   */
  async function review(params, form, again = null) {
    const asked = JSON.stringify([
      params.name,
      params.setting,
      params.lorebooks,
      params.loreLinking,
      params.characterLinking,
      params.cast,
      params.persona,
      params.writeLore,
      params.newPeople,
      params.ages,
    ]);
    let result = !again && reviewed?.asked === asked ? reviewed.result : null;
    if (!result) {
      card.replaceChildren(element("div", "font:13px system-ui;opacity:0.8;", "Setting your world up…"));
      try {
        result = await handlers.onSetup(params, again === "failed" ? reviewed?.result.setup : null);
      } catch (error) {
        result = {
          setup: {
            loreKeys: {},
            loreNames: {},
            failed: [{ id: "all", label: "the setup", error: error?.message ?? String(error) }],
          },
          needs: {},
          summary: { people: [], named: [], lore: { placed: 0, world: 0, untied: 0 } },
        };
      }
      reviewed = { asked, result };
    }
    const { setup, needs, summary } = result;
    // The world's shape from its lore (ww:settlement:city, ww:walls, ww:size:large), where it was left to the seed.
    for (const [key, value] of Object.entries({
      settlement: result.shape?.settlement,
      walls: result.shape?.walls && "yes",
      size: result.shape?.size,
    }))
      if (value && (!params.choices[key] || params.choices[key] === "surprise")) params.choices[key] = value;
    const head = (text) => element("div", "font:700 13px system-ui;margin-top:6px;", text);
    const line = (text, style = "") => element("div", `font:12px system-ui;line-height:1.4;${style}`, text);
    const list = element("div", "display:flex;flex-direction:column;gap:3px;max-height:38vh;overflow-y:auto;");
    for (const person of summary.people) {
      const facts = [
        person.body === "male" ? "a man" : person.body === "female" ? "a woman" : "",
        person.home && `lives in ${setup.loreNames[person.home] ?? person.home}`,
        person.work && `${person.owner ? "owns" : "works at"} ${setup.loreNames[person.work] ?? person.work}`,
        person.toPlayer && `sees you as: ${person.toPlayer}`,
        ...person.links,
      ].filter(Boolean);
      list.append(line(`${person.name}${person.you ? " (you)" : ""}: ${facts.join(" · ") || "nothing set"}`));
    }
    const places = Object.entries(needs).map(([kind, count]) => `${kind} ×${count}`);
    const map = mapCanvas(320, 260);
    const size = element("select", `${INPUT}padding:5px 8px;`);
    for (const [value, text] of [
      ["surprise", "Auto"],
      ["small", "Small"],
      ["normal", "Normal"],
      ["large", "Large"],
      ["huge", "Huge"],
      ["massive", "Massive"],
    ]) {
      const option = element("option", "", text);
      option.value = value;
      size.append(option);
    }
    size.value = params.choices.size ?? "surprise";
    size.setAttribute("aria-label", "World size");
    const draw = () => handlers.preview?.(map, params.seed, { ...params.choices }, needs);
    size.addEventListener("change", () => {
      params.onSize(size.value);
      draw();
    });
    // Another map, same world: only the seed changes, so what the AI wrote still fits (the places it
    // needs are built into whichever land comes up).
    const mapRow = element("div", "display:flex;gap:8px;align-items:center;flex-wrap:wrap;");
    mapRow.append(
      button("Reroll the map", SMALL, () => {
        params.seed = randomSeed();
        params.onSeed?.(params.seed);
        draw();
      }),
      size,
    );
    const failed = setup.failed ?? [];
    card.replaceChildren(
      element("div", "font:700 17px system-ui;", `${params.name || "Your world"}, before it's built`),
      ...(failed.length
        ? [
            line(
              `The AI couldn't do ${failed.map((part) => part.label).join(", ")}: ${failed[0].error} You can ask again for what's missing, build with what's here (the rest can be set in the Journal, or by the AI later from Journal → World), or go back.`,
              "background:rgba(160,60,40,0.18);border-radius:6px;padding:6px 8px;",
            ),
          ]
        : []),
      head(`People (${summary.people.length})`),
      summary.people.length ? list : line("Nobody was set up.", "opacity:0.7;"),
      ...(setup.locals?.length
        ? [
            head(`New people (${setup.locals.length})`),
            ...setup.locals.map((person) => line(`${person.name}: ${person.description}`, "opacity:0.9;")),
          ]
        : []),
      ...(setup.book?.entries?.length
        ? [
            head("The world, as written"),
            ...setup.book.entries.map((entry) => line(`${entry.title}: ${entry.content}`, "opacity:0.9;")),
          ]
        : []),
      head("Places"),
      line(
        places.length ? `Built with at least: ${places.join(", ")}.` : "Nothing beyond what the land settings give.",
        "",
      ),
      ...(summary.named.length
        ? [line(`Named: ${summary.named.map(([place, placeName]) => `${placeName} (${place})`).join(", ")}.`)]
        : []),
      ...(summary.lore.placed + summary.lore.world + summary.lore.untied
        ? [
            head("Lore"),
            line(
              `${summary.lore.placed} entries tied to places and people, ${summary.lore.world} known to the whole world, ${summary.lore.untied} left untied.`,
            ),
          ]
        : []),
      head("The land"),
      map,
      line(
        "This is the map your world gets, with every place above on it. Reroll for another: the people, places and lore stay as they are, and the AI isn't asked again.",
        "opacity:0.8;",
      ),
      mapRow,
      line(
        "Other land settings are a step back. Everything above can be changed once you're in, in the Journal.",
        "opacity:0.7;",
      ),
      button("Build the world", BIG, () => handlers.onCreate({ ...params, setup })),
      button(failed.length ? "Ask the AI again for what's missing" : "Ask the AI again", SMALL, () =>
        review(params, form, failed.length ? "failed" : "all"),
      ),
      button("Back to the settings", SMALL, () => card.replaceChildren(...form)),
    );
    draw();
  }

  function load() {
    const worlds = handlers.list();
    card.replaceChildren(element("div", "font:700 17px system-ui;", "Load world"));
    if (!worlds.length) card.append(element("div", "opacity:0.75;font-size:14px;", "No saved worlds yet."));
    const list = element(
      "div",
      "display:flex;flex-direction:column;gap:8px;max-height:min(56vh,480px);overflow-y:auto;",
    );
    for (const world of worlds) {
      const row = element(
        "div",
        "display:flex;gap:10px;align-items:center;background:rgba(255,255,255,0.08);border-radius:10px;padding:8px;",
      );
      const thumb = element(
        "div",
        "width:96px;height:54px;border-radius:6px;flex:none;background:#4a5a6a center/cover;",
      );
      if (world.thumbnail) thumb.style.backgroundImage = `url("${world.thumbnail}")`;
      const info = element("div", "flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;");
      const name = element(
        "div",
        "font:600 14px system-ui;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;",
        world.name,
      );
      const when = element("div", "font:12px system-ui;opacity:0.7;", `Played ${ago(world.playedAt)}`);
      const actions = element("div", "display:flex;gap:6px;flex-wrap:wrap;");
      const play = button("Play", SMALL, () => handlers.onPlay(world.id));
      play.style.background = "#3f7d4f";
      const rename = button("Rename", SMALL, () => {
        const input = element("input", `${INPUT}padding:4px 6px;font-size:13px;`);
        input.value = world.name;
        input.maxLength = 60;
        const done = () => {
          if (input.value.trim()) handlers.onRename(world.id, input.value.trim());
          load();
        };
        input.addEventListener("keydown", (event) => {
          if (event.key === "Enter") done();
          if (event.key === "Escape") load();
          event.stopPropagation();
        });
        input.addEventListener("blur", done);
        name.replaceWith(input);
        input.focus();
        input.select();
      });
      // Delete asks once more on the same button: there's no undo.
      const remove = button("Delete", SMALL, () => {
        if (remove.dataset.sure !== "1") {
          remove.dataset.sure = "1";
          remove.textContent = "Delete for good?";
          remove.style.background = "#9a3b3b";
          return;
        }
        handlers.onDelete(world.id);
        load();
      });
      actions.append(play, rename, remove);
      info.append(name, when, actions);
      row.append(thumb, info);
      list.append(row);
    }
    card.append(list, button("Back", SMALL, home));
  }

  // Keys typed in the menu's fields must not walk the player around behind it.
  screen.addEventListener("keydown", (event) => event.stopPropagation());

  return {
    element: screen,
    show() {
      home();
      screen.style.display = "flex";
    },
    hide() {
      screen.style.display = "none";
    },
    get open() {
      return screen.style.display !== "none";
    },
  };
}
