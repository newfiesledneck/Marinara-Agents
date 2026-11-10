// The Illustrate window: "Illustrate the current moment" paints where you are, who's with you and what's
// going on, from a prompt template the player can edit; the latest picture fills the window and the
// world's gallery sits under it. It floats over the world (floating.js): drag it by its title, resize it
// from its corner, leave it open while you play. Its place, size, open state and template are remembered.
import { makeFloating } from "./floating.js";
import { INK, INK_BUTTON, INK_INPUT, INK_SMALL, INK_SOFT, PARCHMENT, SERIF } from "./ui.js";

/** The template a new player starts from; {placeholders} are filled in on the server from the moment. */
export const DEFAULT_TEMPLATE =
  "{persona} {activity} at {place}, {time_of_day}, {weather}. With them: {people}. " +
  "{persona_appearance}. {people_appearance}. {setting}. " +
  "A detailed illustration of this moment, {place_kind}, no text.";

/** What the model is told when it rewrites the prompt (server.mjs has the same, for when this is empty). */
export const DEFAULT_INSTRUCTION =
  "Rewrite what follows as a prompt for an image generator. Keep every fact in it: who is there, what they look like, where and when it is, the weather, what they're doing. Lead with the subject, then the setting, the light, the mood and the style. One paragraph, concrete and visual, under 120 words. No names of real artists, no words or captions in the picture. Answer with the prompt only.";

/** Picture sizes on offer: [width, height, what it's called]. Any other size can be typed in. */
export const SIZES = [
  [1024, 640, "Landscape"],
  [1280, 720, "Wide"],
  [1024, 1024, "Square"],
  [640, 1024, "Portrait"],
  [768, 512, "Small landscape"],
];

/** What each placeholder becomes, for the help under the template. */
export const PLACEHOLDERS = {
  persona: "your persona's name",
  persona_appearance: "how your persona looks, with their name (their card)",
  people: "who's with you, and what they're doing",
  people_appearance: "how they look, each with their name (their cards)",
  activity: "what you're doing: sitting, talking with someone, swimming…",
  place: "where you are, and the places it's in",
  place_kind: "what kind of place: a tavern, a street, the woods…",
  time: "the clock: 14:20",
  time_of_day: "morning, midday, dusk, night…",
  weather: "rain, snow or mist, if any",
  setting: "the world's setting words (New world, Journal → World)",
  recent: "the last line of narration",
};

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

/** A floating window's frame and title bar, in the parchment look. */
export function floatingFrame(titleText, onClose) {
  const frame = element(
    "div",
    `${PARCHMENT}display:none;flex-direction:column;min-width:200px;min-height:120px;` +
      `max-width:calc(100% - 8px);max-height:calc(100% - 8px);border-radius:10px;pointer-events:auto;` +
      `color:${INK};box-shadow:0 6px 24px rgba(0,0,0,0.35);`,
  );
  frame.setAttribute("data-wanderworld-ui", "");
  frame.addEventListener("keydown", (event) => event.stopPropagation()); // typing here doesn't walk
  const bar = element(
    "div",
    `display:flex;align-items:center;gap:8px;padding:5px 10px;border-bottom:1px solid rgba(107,74,43,0.4);` +
      `font:700 14px ${SERIF};`,
  );
  const title = element("span", "flex:1;", titleText);
  const close = button("×", `${INK_SMALL}padding:0 8px;font-size:16px;`, onClose);
  close.title = "Close (it stays as you left it)";
  bar.append(title, close);
  frame.append(bar);
  return { frame, bar };
}

/**
 * The window, added to `layer`. `handlers`: onIllustrate(template) → Promise<{ id, image, prompt, caption }>,
 * onGallery() → Promise<[{ id, caption, at }]>, onPicture(id) → Promise<{ image, prompt, caption }>,
 * onDelete(id) → Promise.
 */
export function createIllustrateWindow(layer, handlers) {
  const { frame, bar } = floatingFrame("Illustrate", () => setOpen(false));
  layer.append(frame);
  const floating = makeFloating(layer, frame, bar, "wanderworld.illustrate", {
    x: 24,
    y: 70,
    w: 420,
    h: 480,
    open: false,
    template: DEFAULT_TEMPLATE,
    width: 1024,
    height: 640,
    improve: false,
    review: false,
    instruction: DEFAULT_INSTRUCTION,
  });
  const { state } = floating;

  const body = element("div", "flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:8px;padding:8px 10px;");
  const paint = button(
    "Illustrate the current moment",
    `${INK_BUTTON}background:#6b4a2b;color:#f6ecd6;`,
    () => void illustrate(),
  );
  const status = element("div", `font-size:12px;color:${INK_SOFT};`);
  const picture = element(
    "img",
    "width:100%;flex:1 1 auto;min-height:120px;object-fit:contain;border-radius:8px;background:rgba(107,74,43,0.12);display:none;",
  );
  const caption = element("div", "font-size:12px;font-style:italic;");
  // The gallery: a strip of its own height that scrolls, however many pictures there are.
  const gallery = element(
    "div",
    "display:flex;flex-wrap:wrap;gap:6px;max-height:112px;overflow-y:auto;flex:0 0 auto;padding:2px;",
  );

  const templateFold = element("details", "font-size:12px;");
  templateFold.append(element("summary", "cursor:pointer;font-weight:700;", "Prompt template"));
  const template = element(
    "textarea",
    `${INK_INPUT}width:100%;box-sizing:border-box;min-height:90px;font:12px ui-monospace,monospace;resize:vertical;`,
  );
  template.value = state.template;
  template.addEventListener("input", () => {
    state.template = template.value;
    floating.save();
  });
  const help = element("div", `color:${INK_SOFT};line-height:1.4;margin-top:4px;`);
  help.textContent = Object.entries(PLACEHOLDERS)
    .map(([name, words]) => `{${name}}: ${words}`)
    .join(" · ");
  const reset = button("Back to the usual template", `${INK_SMALL}margin-top:4px;`, () => {
    template.value = state.template = DEFAULT_TEMPLATE;
    floating.save();
  });
  templateFold.append(template, help, reset);

  // How big the picture is: one of the usual sizes, or your own.
  const sizeFold = element("details", "font-size:12px;");
  sizeFold.append(element("summary", "cursor:pointer;font-weight:700;", "Picture size"));
  const number = (key) => {
    const input = element("input", `${INK_INPUT}width:74px;padding:3px 6px;`);
    input.type = "number";
    input.min = "256";
    input.max = "1536";
    input.step = "64";
    input.value = String(state[key]);
    input.setAttribute("aria-label", key === "width" ? "Width in pixels" : "Height in pixels");
    input.addEventListener("change", () => {
      state[key] = Math.max(256, Math.min(1536, Math.round(Number(input.value) / 64) * 64 || 1024));
      input.value = String(state[key]);
      floating.save();
    });
    return input;
  };
  const width = number("width");
  const height = number("height");
  const sizes = element("div", "display:flex;gap:4px;flex-wrap:wrap;margin-top:4px;");
  for (const [w, h, name] of SIZES) {
    sizes.append(
      button(`${name} ${w}×${h}`, INK_SMALL, () => {
        width.value = String((state.width = w));
        height.value = String((state.height = h));
        floating.save();
      }),
    );
  }
  const sizeRow = element("div", "display:flex;gap:6px;align-items:center;margin-top:4px;");
  sizeRow.append(
    width,
    element("span", "", "×"),
    height,
    element("span", `color:${INK_SOFT};`, "pixels (256 to 1536; your image model may round them)"),
  );
  sizeFold.append(sizes, sizeRow);

  // The prompt, rewritten by the model before it's painted, and looked over first if wanted.
  const improveFold = element("details", "font-size:12px;");
  improveFold.append(element("summary", "cursor:pointer;font-weight:700;", "Improve the prompt with AI"));
  const tick = (key, words) => {
    const row = element("label", "display:flex;gap:6px;align-items:flex-start;margin-top:4px;");
    const box = element("input");
    box.type = "checkbox";
    box.checked = !!state[key];
    box.addEventListener("change", () => {
      state[key] = box.checked;
      floating.save();
    });
    row.append(box, element("span", "", words));
    return row;
  };
  const instruction = element(
    "textarea",
    `${INK_INPUT}width:100%;box-sizing:border-box;min-height:80px;font:12px ui-monospace,monospace;resize:vertical;margin-top:4px;`,
  );
  instruction.value = state.instruction;
  instruction.setAttribute("aria-label", "What the model is told when it rewrites the prompt");
  instruction.addEventListener("input", () => {
    state.instruction = instruction.value;
    floating.save();
  });
  improveFold.append(
    element(
      "div",
      `color:${INK_SOFT};line-height:1.4;margin-top:4px;`,
      "The template above only fills in the facts. With this on, your model rewrites that into a fuller prompt first: one more call, on the conversations connection.",
    ),
    tick("improve", "Have the AI rewrite the prompt before painting"),
    tick("review", "Show me the rewritten prompt first, to change or approve"),
    element("div", "font-weight:700;margin-top:6px;", "What the AI is told"),
    instruction,
    button("Back to the usual instruction", `${INK_SMALL}margin-top:4px;`, () => {
      instruction.value = state.instruction = DEFAULT_INSTRUCTION;
      floating.save();
    }),
  );
  // The review: the rewritten prompt, to change, then paint or drop.
  const review = element("div", "display:none;flex-direction:column;gap:4px;font-size:12px;");
  const reviewText = element(
    "textarea",
    `${INK_INPUT}width:100%;box-sizing:border-box;min-height:110px;font:12px system-ui,sans-serif;resize:vertical;`,
  );
  reviewText.setAttribute("aria-label", "The prompt that will be painted");
  const reviewButtons = element("div", "display:flex;gap:6px;");
  reviewButtons.append(
    button("Paint this", INK_BUTTON, () => void illustrate(reviewText.value.trim())),
    button("Never mind", INK_SMALL, () => {
      review.style.display = "none";
      status.textContent = "";
    }),
  );
  review.append(element("div", "font-weight:700;", "The prompt, before it's painted"), reviewText, reviewButtons);
  const promptFold = element("details", "font-size:12px;");
  promptFold.append(element("summary", "cursor:pointer;font-weight:700;", "The prompt it made"));
  const promptText = element(
    "div",
    `color:${INK_SOFT};line-height:1.4;white-space:pre-wrap;`,
    "Nothing illustrated yet.",
  );
  promptFold.append(promptText);

  body.append(paint, status, review, picture, caption, gallery, templateFold, improveFold, sizeFold, promptFold);
  frame.append(body);

  const pictures = new Map(); // id → { image, prompt, caption }
  let shown = null;
  const show = (id, value) => {
    shown = id;
    picture.src = value.image;
    picture.style.display = "";
    caption.textContent = value.caption ?? "";
    promptText.textContent = value.prompt ?? "";
    for (const thumb of gallery.children) thumb.style.outline = thumb.dataset.id === id ? `2px solid ${INK}` : "";
  };
  async function load(id) {
    if (!pictures.has(id)) pictures.set(id, await handlers.onPicture(id));
    return pictures.get(id);
  }
  async function refresh() {
    let list;
    try {
      list = await handlers.onGallery();
    } catch (error) {
      status.textContent = error?.message ?? String(error);
      return;
    }
    gallery.replaceChildren(
      ...list.map((entry) => {
        // Each picture: click it to show it; the small × in its corner deletes it.
        const thumb = element("div", "position:relative;width:64px;height:44px;border-radius:4px;flex:0 0 auto;");
        thumb.dataset.id = entry.id;
        const image = element(
          "img",
          "width:100%;height:100%;object-fit:cover;border-radius:4px;cursor:pointer;background:rgba(107,74,43,0.15);display:block;",
        );
        image.title = entry.caption ?? "";
        image.alt = entry.caption ?? "A picture";
        image.addEventListener("click", async () => show(entry.id, await load(entry.id)));
        load(entry.id)
          .then((value) => (image.src = value.image))
          .catch(() => {});
        const cross = button(
          "×",
          "position:absolute;top:1px;right:1px;width:16px;height:16px;padding:0;border:0;border-radius:50%;" +
            "background:rgba(30,20,10,0.7);color:#fff;font:700 12px/16px system-ui,sans-serif;cursor:pointer;",
          (event) => {
            event.stopPropagation();
            void removePicture(entry.id);
          },
        );
        cross.title = "Delete this picture";
        cross.setAttribute("aria-label", `Delete ${entry.caption ?? "this picture"}`);
        thumb.append(image, cross);
        return thumb;
      }),
    );
    // Nothing chosen (or the chosen one gone): the newest.
    if ((!shown || !list.some((entry) => entry.id === shown)) && list[0]) {
      show(list[0].id, await load(list[0].id).catch(() => ({ image: "" })));
    }
    if (!list.length) {
      shown = null;
      picture.style.display = "none";
      caption.textContent = "";
    }
    if (!list.length && !status.textContent) status.textContent = "No pictures yet in this world.";
  }
  /** Paints the moment. `approved`: a prompt the player has looked over, painted as it is. */
  async function illustrate(approved = "") {
    const options = {
      template: state.template,
      width: state.width,
      height: state.height,
      improve: !!state.improve,
      instruction: state.instruction,
    };
    paint.disabled = true;
    try {
      // To be looked over first: the rewritten prompt comes back by itself.
      if (state.improve && state.review && !approved) {
        status.textContent = "Writing the prompt…";
        const draft = await handlers.onIllustrate({ ...options, previewOnly: true });
        reviewText.value = draft.prompt ?? "";
        review.style.display = "flex";
        status.textContent = draft.improved ? "" : "The AI didn't rewrite it, so this is the template's own prompt.";
        return;
      }
      review.style.display = "none";
      status.textContent = state.improve && !approved ? "Writing the prompt, then painting…" : "Painting the moment…";
      const made = await handlers.onIllustrate({ ...options, prompt: approved });
      pictures.set(made.id, made);
      status.textContent = "";
      shown = null;
      await refresh();
      show(made.id, made);
    } catch (error) {
      status.textContent = `No picture: ${error?.message ?? error}`;
    } finally {
      paint.disabled = false;
    }
  }
  async function removePicture(id) {
    try {
      await handlers.onDelete(id);
    } catch (error) {
      status.textContent = error?.message ?? String(error);
      return;
    }
    pictures.delete(id);
    if (shown === id) shown = null;
    await refresh();
  }
  function setOpen(open) {
    floating.setOpen(open);
    if (open) void refresh();
  }
  return {
    frame,
    toggle: () => setOpen(!floating.isOpen()),
    setOpen,
    isOpen: floating.isOpen,
    /** A new world: its own gallery. */
    reset() {
      pictures.clear();
      shown = null;
      picture.style.display = "none";
      caption.textContent = "";
      status.textContent = "";
      if (floating.isOpen()) void refresh();
    },
    /** Shows it again if it was left open (after the world loads). */
    restore() {
      if (floating.isOpen()) setOpen(true);
    },
  };
}
