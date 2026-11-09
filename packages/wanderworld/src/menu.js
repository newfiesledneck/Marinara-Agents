// The main menu: Continue, New world, Load world and Settings, over a painted backdrop. It opens first,
// and the in-game Menu button comes back to it (saving the world first). The Load list shows each saved
// world with a thumbnail, when it was last played, and Rename and Delete.
import { INK_INPUT, INK_SMALL, PARCHMENT_EDGED, SERIF } from "./ui.js";

const FONT = "system-ui,sans-serif";
// The menu's card is parchment, its choices wooden boards with cream lettering.
const PANEL =
  `${PARCHMENT_EDGED}padding:26px 28px;display:flex;flex-direction:column;gap:10px;` +
  "width:min(420px,calc(100% - 32px));max-height:calc(100% - 32px);overflow-y:auto;box-sizing:border-box;pointer-events:auto;";
const BIG =
  `font:600 17px ${SERIF};border:1px solid #4e341d;border-radius:9px;padding:11px 16px;cursor:pointer;text-align:left;` +
  "background:linear-gradient(#7a5532,#5f4126);color:#f6ecd6;box-shadow:0 2px 4px rgba(0,0,0,0.25);";
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
 * onRename(id, name), onDelete(id), onSettings(), suggestName() → a name for a new world.
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
    "display:flex;flex-direction:column;gap:14px;align-items:stretch;width:min(420px,100%);",
  );
  const title = element(
    "div",
    `font:800 clamp(34px,6vw,58px) Georgia,"Times New Roman",serif;color:#fff8e6;text-shadow:0 3px 14px rgba(40,25,10,0.55);letter-spacing:0.5px;`,
    "Wanderworld",
  );
  // The carved logo in place of the lettering, once it has loaded.
  if (art?.logo) {
    const logo = element("img", "width:min(460px,100%);height:auto;filter:drop-shadow(0 4px 14px rgba(30,18,6,0.45));");
    logo.alt = "Wanderworld";
    logo.addEventListener("load", () => title.replaceWith(logo));
    logo.src = art.logo;
  }
  const tagline = element(
    "div",
    "font:600 15px system-ui,sans-serif;color:#fff8e6;text-shadow:0 1px 3px rgba(0,0,0,0.85),0 0 14px rgba(0,0,0,0.5);margin-top:-8px;",
    "Your characters, living their days in a world of their own.",
  );
  const card = element("div", PANEL);
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
    );
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
    // The land round the town: each choice, or Surprise me (the seed decides).
    const choices = {};
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
      for (const [value, text] of [["surprise", "Surprise me"], ...options]) {
        const option = element("option", "", text);
        option.value = value;
        select.append(option);
      }
      select.addEventListener("change", () => (choices[key] = select.value));
      pickers.append(element("span", "opacity:0.8;", label), select);
    }
    // The world's setting in words, its lorebooks, and how their entries are linked to places.
    /** An explanation line (hidden with Settings → Show explanations off). */
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
    const linking = picker([
      ["keywords", "Places: link entries by matching names"],
      ["ai", "Places: let the AI link entries (with the AI update)"],
      ["none", "Places: I'll tie them myself"],
    ]);
    const characterLinking = picker([
      ["keywords", "Characters: link and set up by name (body, how they see you)"],
      ["ai", "Characters: let the AI do it (with the AI update)"],
      ["none", "Characters: I'll set them up myself"],
    ]);
    const create = button("Create and play", BIG, () =>
      handlers.onCreate({
        name: name.value.trim(),
        seed: seed.value.trim(),
        choices,
        setting: setting.value.trim(),
        lorebooks: [...lorebooks],
        loreLinking: linking.value,
        characterLinking: characterLinking.value,
      }),
    );
    card.append(
      element("div", "font:700 17px system-ui;", "New world"),
      element("div", "font:12px system-ui;opacity:0.75;", "Name"),
      name,
      seed,
      explainLine("The same seed always builds the same town. The setting tells the AI what kind of world to write."),
      setting,
      pickers,
      element("div", "font:12px system-ui;opacity:0.75;", "Lorebooks for this world"),
      explainLine(
        'Entries named or keyed after a place (the town\'s name, "tavern", "the woods"), a character or "world" are tied there; a character\'s entry keyed "enemy", "mentor", "male"… sets them up too.',
      ),
      bookList,
      linking,
      characterLinking,
      element(
        "div",
        "font:12px system-ui;opacity:0.7;",
        "Later, a world will be written from your persona, characters and lorebooks. For now it's a seeded town.",
      ),
      create,
      button("Back", SMALL, home),
    );
    name.focus();
    name.select();
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
