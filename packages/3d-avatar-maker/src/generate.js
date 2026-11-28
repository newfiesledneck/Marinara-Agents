// Generate avatar: a model the user picks designs a look from who the avatar is for (their card's words, and
// their portrait if the user says so), or revises the look on show from its settings and pictures of it.
//
// It's off until the user turns it on (the Generate tab), and every call says what it sends. A call goes to
// the Engine's own POST /api/generate/raw on one of the user's connections, from this page: the maker has no
// server part. The answer is only ever read as data: readDesign keeps what the maker's lists have, and the
// look it makes is shown like any other change, with an Undo.
import { avatarChoices } from "./avatar.js";
import { PACKAGE_ID } from "./kitfiles.js";
import {
  AGES,
  AVATAR_COLOURS,
  BODIES,
  REALISTIC,
  REALISTIC_FIELDS,
  REALISTIC_HAIR,
  REALISTIC_SHAPES,
  readRealisticDesign,
  BODY_DETAIL,
  BROWS,
  CLOTH_PARTS,
  CLOTH_SLOTS,
  CLOTHES,
  EYE_PICTURES,
  FACE,
  FACE_DETAIL,
  hasSlider,
  HAIRSTYLES,
  HEIGHTS,
  LASHES,
  LIMBS,
  MAKEUP_LAYERS,
  mergeLooks,
  NAILS,
  RACE_PARTS,
  RACE_SHAPES,
  racePreset,
  RACES,
  readDesign,
  SHAPES,
  skinsFor,
  sliderRange,
  STUBBLE,
  TINT,
  UNDERWEAR_BOTTOMS,
  UNDERWEAR_TOPS,
  checkLook,
} from "./looks.js";
import { h } from "./panel.js";
import { getJson, hexText } from "./util.js";

const SETTINGS_KEY = `${PACKAGE_ID}:generate`;
/** The most of a card's words sent, and of what the user writes to change. */
export const MOST_WORDS = 4000;
const MOST_NOTE = 600;
/** The longest side of a picture sent, in pixels: enough to see a face and clothes by. */
const PICTURE_SIDE = 768;
const ASK = { temperature: 0.4, maxTokens: 4000 };
const WAIT = 240_000; // ms: a model that thinks first can take minutes

const isRecord = (value) => !!value && typeof value === "object" && !Array.isArray(value);
const block = (value) => (typeof value === "string" ? value.trim() : "");
/** Cut to `most` characters at the end of a sentence or word, never mid-word. */
export function cutWords(value, most) {
  const whole = block(value);
  if (whole.length <= most) return whole;
  const cut = whole.slice(0, most + 1);
  const sentence = Math.max(...[". ", ".\n", "! ", "? ", "\n"].map((mark) => cut.lastIndexOf(mark)));
  if (sentence > most * 0.6) return cut.slice(0, sentence + 1).trim();
  const word = cut.lastIndexOf(" ");
  return `${cut.slice(0, word > 0 ? word : most).replace(/[\s,;:]+$/u, "")}…`;
}
/** `value` as a record: itself, or what a JSON text of one holds (a card's data is kept as text). */
function recordOf(value) {
  if (isRecord(value)) return value;
  if (typeof value !== "string" || !value.trim().startsWith("{")) return null;
  try {
    const parsed = JSON.parse(value);
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** The Engine's own picture paths a card's portrait may have: an image under /api, nothing else. */
const PICTURE_PATH = /^\/api\/[\w./-]{1,300}\.(?:png|jpe?g|webp|gif)(?:\?[\w=&.%-]{0,200})?$/iu;

/**
 * What a character's or persona's row (the Engine's /api/characters or personas list) says of them, for
 * the model: { words, picture (the portrait's path, or null) }. Their appearance, description and
 * personality, as a V2 card keeps them (under `data`, maybe as text) or as a persona's row has them.
 */
export function cardOf(row) {
  const data = recordOf(row?.data) ?? (isRecord(row) ? row : {});
  const inner = recordOf(data.data) ?? data;
  const extensions = isRecord(inner.extensions) ? inner.extensions : {};
  const field = (name) => block(inner[name]) || block(row?.[name]);
  const words = [
    ["Appearance", block(extensions.appearance) || field("appearance")],
    ["Description", field("description")],
    ["Personality", field("personality")],
  ]
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");
  const path = typeof row?.avatarPath === "string" ? row.avatarPath : "";
  return {
    words: cutWords(words, MOST_WORDS),
    picture: PICTURE_PATH.test(path) && !path.includes("..") ? path : null,
  };
}

/** The user's connections a look can be designed on: chat ones, as { id, name, model, isDefault }. */
export function textConnections(rows) {
  const list = Array.isArray(rows) ? rows : Array.isArray(rows?.items) ? rows.items : [];
  return list
    .filter((row) => isRecord(row) && typeof row.id === "string" && row.id && row.provider !== "image_generation")
    .map((row) => ({
      id: row.id,
      name: block(row.name).slice(0, 80) || row.id,
      model: block(row.model).slice(0, 120),
      isDefault: row.isDefault === true || row.isDefault === "true",
    }));
}

// ── The menu: every field of a look and its options, in words ──

/**
 * The look's fields and their options for the model, from what the kit and the installed wardrobe packs
 * have for each body (avatarChoices), each marked when only one body has it. Its answer is read by
 * looks.js readDesign, which keeps only what these lists have.
 */
export async function designMenu(body = "") {
  if (body === REALISTIC) return realisticMenu();
  const bodies = BODIES.map(([body]) => body);
  const choices = Object.fromEntries(await Promise.all(bodies.map(async (body) => [body, await avatarChoices(body)])));
  /** "female only" when only one body has `has(its choices)`, "" when both do, null when neither. */
  const only = (has) => {
    const with_ = bodies.filter((body) => has(choices[body]));
    return with_.length === bodies.length ? "" : with_.length ? `${with_[0]} only` : null;
  };
  const named = (list, has) =>
    list
      .map(([value, label]) => [value, label, only((made) => has(made, value))])
      .filter(([, , mark]) => mark !== null)
      .map(([value, label, mark]) => `${value} (${label}${mark ? `, ${mark}` : ""})`)
      .join(", ");
  const sliders = (list) =>
    list
      .map((entry) => [
        entry,
        only((made) => hasSlider(entry[0], made.keys, made === choices.male ? "male" : "female")),
      ])
      .filter(([, mark]) => mark !== null)
      .map(([entry, mark]) => {
        const [key, label, , , what, ends] = entry;
        const [least, most] = sliderRange(entry, choices.female.keys);
        return `  ${key}: ${least} to ${most}${ends ? ` (${ends[0]} to ${ends[1]})` : ""}: ${label}${what ? `. ${what}` : ""}${mark ? ` (${mark})` : ""}`;
      });
  const labelOf = new Map(CLOTHES.map(([piece, label]) => [piece, label]));
  const bySlot = new Map(CLOTH_SLOTS.map(([slot, label, what]) => [slot, { label, what, pieces: new Map() }]));
  for (const body of bodies)
    for (const { piece, slot } of choices[body].clothes) {
      const pieces = bySlot.get(slot)?.pieces;
      if (pieces) pieces.set(piece, [...(pieces.get(piece) ?? []), body]);
    }
  const skins = [...new Map(bodies.flatMap((body) => skinsFor(body))).entries()];
  return [
    'The look\'s fields. Use these names and values exactly, colours as "#rrggbb". A field left out keeps the',
    "body as made (every slider at 0 unless said, limbs at 1).",
    `body: ${BODIES.map(([body]) => body).join(", ")}`,
    `race: ${RACES.map(([race, label]) => `${race} (${label})`).join(", ")}. A race sets its build slider, height and usual parts; anything given here goes over them.`,
    `height: ${HEIGHTS[0]} to ${HEIGHTS[1]}, a share of a usual adult's height (1 is usual)`,
    `age: ${AGES.map(([age, label]) => `${age} (${label})`).join(", ")}`,
    "shape: { field: number }. The build:",
    ...sliders(SHAPES),
    "  The face:",
    ...sliders([...FACE, ...FACE_DETAIL]),
    "  The body in detail:",
    ...sliders(BODY_DETAIL),
    "  A race's build, mixed in (0 is none):",
    ...sliders(RACE_SHAPES),
    "limbs: { field: number }:",
    ...LIMBS.map(([key, label, least, most, what]) => `  ${key}: ${least} to ${most} (1 is usual): ${label}. ${what}`),
    `skin: a skin picture, ${named(
      skins.filter(([value]) => value !== "custom"),
      (made, value) => skinsFor(made === choices.male ? "male" : "female").some(([skin]) => skin === value),
    )}; or "custom", and then colours.skin is their skin's colour`,
    `colours: { ${AVATAR_COLOURS.map(([field, label]) => `${field} (${label.toLowerCase()})`).join(", ")}, horns }`,
    `makeup (only for someone who wears it): { ${MAKEUP_LAYERS.filter(([layer]) => layer !== "lipstick")
      .map(([layer]) => layer)
      .join(", ")}: { colour, amount (0 to 1) } each, lipstick: { amount (0 to 1) } (its colour is colours.lips) }`,
    `eyePicture: ${TINT} (then colours.eyes is their eye colour), or a real eye: ${EYE_PICTURES.map(([value]) => value).join(", ")}`,
    `brows: 1 to ${BROWS} (the brows' style); lashes: 1 to ${LASHES}`,
    `nails: ${NAILS.map(([value]) => value).join(", ")}; toenails: true or false (colours.nails is their colour)`,
    `hair: ${named(HAIRSTYLES, (made, value) => made.hair.includes(value))}; hairTint: their hair's colour`,
    ...RACE_PARTS.map(
      ([field, list, label, what]) =>
        `${field}: ${named(list, (made, value) => value === "none" || made[field].includes(value))}. ${label}: ${what}`,
    ),
    `stubble: { shape: ${STUBBLE.map(([value]) => value).join(", ")}, density (0 to 1), colour (left out: the hair's) }, or left out for none`,
    "tail: true or false (a tiefling's tail)",
    `underwear: { top: ${named(UNDERWEAR_TOPS, (made, value) => made.tops.includes(value))}, or none; bottom: ${named(UNDERWEAR_BOTTOMS, (made, value) => made.bottoms.includes(value))}, or none }`,
    "clothes: a list of pieces worn, at most one for each slot, only pieces the chosen body has. By slot:",
    ...[...bySlot.values()]
      .filter(({ pieces }) => pieces.size)
      .map(
        ({ label, what, pieces }) =>
          `  ${label} (${what.replace(/\.$/u, "")}): ${[...pieces]
            .map(
              ([piece, has]) =>
                `${piece} (${labelOf.get(piece) ?? piece}${has.length < bodies.length ? `, ${has[0]} only` : ""})`,
            )
            .join(", ")}`,
      ),
    `clothColours: { piece: { part: colour } }, to dye a piece's parts: ${CLOTH_PARTS.map(([part]) => part).join(", ")}`,
  ].join("\n");
}

/** The same for the Realistic body, which has fields of its own (looks.js REALISTIC_FIELDS) and no clothes yet. */
export function realisticMenu() {
  return [
    'The look\'s fields. Use these names and values exactly, colours as "#rrggbb". A field left out keeps the',
    "body as made (every slider at 0 unless said).",
    `height: ${HEIGHTS[0]} to ${HEIGHTS[1]}, a share of a usual adult's height (1 is usual)`,
    "realShape: { field: number }. The build, then the face:",
    ...REALISTIC_SHAPES.map(
      ([key, label, , what, ends, both]) =>
        `  ${key}: ${both ? -1 : 0} to 1 (${ends[0]} to ${ends[1]}): ${label}. ${what}`,
    ),
    "realTone: 0 to 1, their skin from light (0) to dark (1)",
    `realHair: ${REALISTIC_HAIR.map(([value, label]) => `${value} (${label})`).join(", ")}; hairTint: their hair's colour`,
    "This body has no clothes to choose yet: describe none.",
  ].join("\n");
}

// ── What the model is told ──

const hexes = (record) =>
  Object.fromEntries(
    Object.entries(record).map(([key, value]) => [key, Number.isInteger(value) ? hexText(value) : value]),
  );
const withColour = (entry) => (Number.isInteger(entry?.colour) ? { ...entry, colour: hexText(entry.colour) } : entry);
/**
 * The look as the model is shown it: the menu's own terms, colours as "#rrggbb", without what's only the
 * maker's (pack records, the preset's name) or what's as made (a slider at 0, a limb at 1).
 */
export function lookForModel(look) {
  if (look?.body === REALISTIC) {
    // (The Realistic body's own fields alone: the rest of a look is the other bodies'.)
    const out = Object.fromEntries(
      REALISTIC_FIELDS.filter((field) => look[field] !== undefined).map((field) => [field, look[field]]),
    );
    if (isRecord(out.realShape))
      out.realShape = Object.fromEntries(Object.entries(out.realShape).filter(([, value]) => value !== 0));
    if (Number.isInteger(out.hairTint)) out.hairTint = hexText(out.hairTint);
    return out;
  }
  const { fromPacks: _packs, preset: _preset, skinSet: _set, avatar: _avatar, ...rest } = look ?? {};
  const out = { ...rest };
  if (isRecord(out.shape)) out.shape = Object.fromEntries(Object.entries(out.shape).filter(([, value]) => value !== 0));
  if (isRecord(out.limbs)) out.limbs = Object.fromEntries(Object.entries(out.limbs).filter(([, value]) => value !== 1));
  for (const field of ["shape", "limbs"])
    if (isRecord(out[field]) && !Object.keys(out[field]).length) delete out[field];
  if (isRecord(out.colours)) out.colours = hexes(out.colours);
  if (isRecord(out.clothColours))
    out.clothColours = Object.fromEntries(
      Object.entries(out.clothColours).map(([piece, parts]) => [piece, hexes(parts)]),
    );
  if (isRecord(out.makeup))
    out.makeup = Object.fromEntries(Object.entries(out.makeup).map(([layer, entry]) => [layer, withColour(entry)]));
  if (isRecord(out.stubble)) out.stubble = withColour(out.stubble);
  if (Number.isInteger(out.hairTint)) out.hairTint = hexText(out.hairTint);
  return out;
}

/**
 * The messages for a design: `mode` "generate" (a new look) or "revise" (what to change on `current`, seen
 * in `views`: data URLs of the avatar now, whole body then face). `picture` is their portrait (a data URL)
 * or null, `note` what the user asks to change. Pictures go as the user message's `images`, which the
 * Engine sends to a model that can see (and, on a connection set up for it, has described to one that can't).
 */
export function designMessages({
  mode = "generate",
  name,
  words,
  menu,
  picture = null,
  current = null,
  views = [],
  note = "",
}) {
  const revise = mode === "revise";
  const shown = [
    picture ? "their portrait" : null,
    ...views.map((_, at) => (at === 0 ? "the avatar now, whole body" : "the avatar now, face")),
  ].filter(Boolean);
  const system = revise
    ? [
        "You revise a 3D avatar made in a character maker, choosing only from the options you're given, so it looks more like the person it's for.",
        "You're given the maker's options, who the avatar is for, the avatar's settings now" +
          (views.length ? ", and pictures of how it looks now" : "") +
          (picture ? ", and their portrait, the best guide to how they look" : "") +
          ".",
        "Compare them and answer with one JSON object and nothing else: only the fields to change, each set to one of the options listed for it. A field you leave out stays as it is; a record (shape, colours, makeup) changes only the keys you give; clothes, when given, is the whole list worn after the change.",
        "Where the user says what to change, do that first.",
        "Never describe or comment: the JSON object only.",
      ]
    : [
        "You design how a person looks as a 3D avatar in a character maker, choosing only from the options you're given.",
        "Answer with one JSON object and nothing else: the look's fields, each set to one of the options listed for it, numbers within their ranges.",
        picture
          ? "Their portrait is the best guide to their face, skin, hair, eyes, build and clothes; their description says the rest."
          : "Follow what their description says of their body, face, skin, hair, eyes and clothes.",
        "Shape the face and build with the sliders where they differ from usual, choose hair, colours and makeup to match, and dress them as they're shown or described, one piece a slot.",
        "Where nothing says, choose what suits who they are. Leave out a field you have no reason to set.",
        "Never describe or comment: the JSON object only.",
      ];
  const parts = [
    menu,
    `Who: ${name || "Someone"}\n${words || "(Nothing is said of them.)"}`,
    revise ? `The avatar's settings now:\n${JSON.stringify(lookForModel(current))}` : "",
    revise && note ? `What the user wants changed: ${note}` : "",
    shown.length ? `Attached, in order: ${shown.join("; ")}.` : "",
  ].filter(Boolean);
  const images = [picture, ...views].filter(Boolean);
  return [
    { role: "system", content: system.join(" ") },
    { role: "user", content: parts.join("\n\n"), ...(images.length ? { images } : {}) },
  ];
}

/** The first JSON object in a model's answer, past any thinking it wrote first; null when there's none. */
export function readJson(content) {
  const raw = typeof content === "string" ? content.replace(/<think>[\s\S]*?<\/think>/giu, "") : "";
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const value = JSON.parse(raw.slice(start, end + 1));
    return isRecord(value) ? value : null;
  } catch {
    return null;
  }
}

/**
 * The look a design makes, laid on `base` (a new avatar's look to generate on, or the look on show to
 * revise): the model's answer read by readDesign, over what its race sets when it names a new one (as
 * choosing the race does), part by part for the sliders and colours. Clothes given replace what's worn.
 */
export function designedLook(base, raw) {
  if (base?.body === REALISTIC) {
    // (The Realistic body stays the Realistic body: its own fields are read, its sliders part by part.)
    const design = readRealisticDesign(raw);
    return { look: checkLook({ ...base, ...design, realShape: { ...base.realShape, ...design.realShape } }), design };
  }
  const design = readDesign(raw);
  // (From here a design is for one of the kit's two bodies; one started from anything else is a female body's.)
  const body = design.body ?? (BODIES.some(([each]) => each === base.body) ? base.body : "female");
  const raced = design.race && design.race !== base.race ? mergeLooks(base, racePreset(design.race, body)) : base;
  return { look: checkLook(mergeLooks({ ...raced, body }, design)), design };
}

// ── Calls ──

/** The admin secret the Engine's own client keeps, for a session on another device (loopback needs none). */
// ponytail: read from the Engine client's storage, as Wanderworld and Quartermaster do; replace with a
// host-provided fetch if packages are given one.
function adminSecret() {
  try {
    return globalThis.localStorage?.getItem("marinara_admin_secret")?.trim() || "";
  } catch {
    return "";
  }
}

/** The model's answer to `messages` on connection `connectionId`, through the Engine's raw route. */
export async function askModel(connectionId, messages, signal) {
  const headers = { "Content-Type": "application/json", Accept: "application/json", "x-marinara-csrf": "1" };
  const secret = adminSecret();
  if (secret) headers["X-Admin-Secret"] = secret;
  const timer = AbortSignal.timeout(WAIT);
  const response = await fetch("/api/generate/raw", {
    method: "POST",
    headers,
    credentials: "same-origin",
    body: JSON.stringify({ connectionId, messages, parameters: ASK }),
    signal: signal && AbortSignal.any ? AbortSignal.any([signal, timer]) : (signal ?? timer),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const said = typeof body?.error === "string" ? body.error : "";
    if (response.status === 403 && /admin.secret/iu.test(said))
      throw new Error(
        "The Engine blocked this on this device: enter its Admin Secret in Settings → Advanced → Admin Access.",
      );
    throw new Error(said || `The Engine answered ${response.status}.`);
  }
  if (body?.aborted) throw Object.assign(new Error("Stopped."), { name: "AbortError" });
  return typeof body?.content === "string" ? body.content : "";
}

/** A picture (an Engine path or a file the user chose) as a JPEG data URL no wider or taller than PICTURE_SIDE. */
export async function pictureData(source) {
  const blob = typeof source === "string" ? await (await fetch(source, { credentials: "same-origin" })).blob() : source;
  if (!blob?.type?.startsWith("image/")) throw new Error("That isn't a picture.");
  const bitmap = await createImageBitmap(blob);
  const scale = Math.min(1, PICTURE_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  context.fillStyle = "#808080"; // (under a transparent picture: JPEG has no transparency)
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  return canvas.toDataURL("image/jpeg", 0.85);
}

// ── The Generate tab ──

function readSettings() {
  try {
    const kept = JSON.parse(globalThis.localStorage?.getItem(SETTINGS_KEY) ?? "null");
    return {
      on: kept?.on === true,
      connectionId: typeof kept?.connectionId === "string" ? kept.connectionId : "",
      portrait: kept?.portrait === true,
      views: kept?.views !== false,
    };
  } catch {
    return { on: false, connectionId: "", portrait: false, views: true };
  }
}

/**
 * The Generate tab's controls, kept between renders (what's typed stays): { element(info), setOwner(owner) }.
 * `actions`: { look() (the look on show), fresh(body) (a new avatar's look), views() (data URLs of the
 * avatar now: whole body, face), apply(look, note) (shows a designed look; returns the look it replaced) }.
 */
export function createGenerator(actions) {
  const settings = readSettings();
  const keep = () => {
    try {
      globalThis.localStorage?.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // (a setting not kept is asked again next time)
    }
  };
  let owner = null; // { type, id, name, card: { words, picture } }
  let connections = null; // null until read
  let menuSize = 0;
  let busy = null; // the AbortController of the call under way
  let undo = null; // the look before the last design
  let chosenPicture = null; // { data, label } a file the user chose in place of the portrait
  let filledFrom = ""; // the words the box was last filled with from a card

  const status = h("p", { class: "says", role: "status", "aria-live": "polite" });
  const say = (text, bad = false) => {
    status.textContent = text;
    status.className = bad ? "says bad" : "says";
  };
  const onSwitch = h("input", {
    type: "checkbox",
    checked: settings.on,
    onchange: () => {
      settings.on = onSwitch.checked;
      keep();
      draw();
      if (settings.on) void loadConnections();
    },
  });
  const connectionSelect = h("select", {
    "aria-label": "Connection",
    onchange: () => {
      settings.connectionId = connectionSelect.value;
      keep();
      describe();
    },
  });
  const wordsBox = h("textarea", {
    rows: 7,
    maxLength: MOST_WORDS,
    "aria-label": "What the model is told about them",
    placeholder: "Describe them: their build, face, skin, hair, eyes and what they wear.",
    oninput: () => describe(),
  });
  const portraitBox = h("input", {
    type: "checkbox",
    checked: settings.portrait,
    onchange: () => {
      settings.portrait = portraitBox.checked;
      keep();
      describe();
    },
  });
  const thumb = h("img", { class: "thumb", alt: "", hidden: true });
  const fileInput = h("input", {
    type: "file",
    accept: "image/png,image/jpeg,image/webp,image/gif",
    class: "visually-hidden",
    tabIndex: -1,
    "aria-hidden": "true",
    onchange: () => {
      const [file] = fileInput.files ?? [];
      fileInput.value = "";
      if (file)
        void pictureData(file)
          .then((data) => {
            chosenPicture = { data, label: file.name };
            portraitBox.checked = settings.portrait = true;
            keep();
            describe();
          })
          .catch(() => say("That picture couldn't be read.", true));
    },
  });
  const noteBox = h("textarea", {
    rows: 3,
    maxLength: MOST_NOTE,
    "aria-label": "What to change",
    placeholder: "What to change (or leave empty): older, longer hair, a darker coat, closer to the portrait…",
  });
  const viewsBox = h("input", {
    type: "checkbox",
    checked: settings.views,
    onchange: () => {
      settings.views = viewsBox.checked;
      keep();
      describe();
    },
  });
  const generateButton = h(
    "button",
    { class: "main", type: "button", onclick: () => void run("generate") },
    "Generate avatar",
  );
  const reviseButton = h("button", { type: "button", onclick: () => void run("revise") }, "Revise avatar");
  const stopButton = h("button", { type: "button", hidden: true, onclick: () => busy?.abort() }, "Stop");
  const undoButton = h(
    "button",
    {
      type: "button",
      hidden: true,
      onclick: () => {
        if (!undo) return;
        actions.apply(undo, "Put back the look from before the design.");
        say("Put back the look from before the design.");
        undo = null;
        undoButton.hidden = true;
      },
    },
    "Undo the design",
  );
  const sends = h("p", { class: "says" });
  const answer = h("pre", { class: "answer" });
  const answerBox = h("details", { hidden: true }, h("summary", {}, "The model's last answer"), answer);

  const connection = () => connections?.find((row) => row.id === settings.connectionId) ?? null;
  const portrait = () => (chosenPicture ? chosenPicture.data : owner?.card?.picture) ?? null;

  /** Says what a call sends, and to whom. */
  function describe() {
    const chosen = connection();
    const picture = settings.portrait && portrait();
    thumb.hidden = !(settings.portrait && portrait());
    if (!thumb.hidden) thumb.src = portrait();
    sends.textContent = chosen
      ? `Each call sends ${chosen.name}${chosen.model ? ` (${chosen.model})` : ""}: the words above, the list of the maker's options (about ${Math.round(menuSize / 1000) || "?"} thousand characters)${picture ? ", the picture" : ""}; and to revise, the avatar's settings now${settings.views ? " and two pictures of it" : ""}, and what you ask to change. Nothing is saved in the Engine.`
      : "Choose a connection to see what is sent.";
    const ready = !!chosen && !busy;
    generateButton.disabled = reviseButton.disabled = !ready;
  }

  async function loadConnections() {
    if (connections) return;
    const rows = await getJson("/api/connections");
    connections = textConnections(rows);
    connectionSelect.replaceChildren(
      ...(connections.length
        ? connections.map(
            (row) =>
              new Option(
                `${row.name}${row.model ? ` (${row.model})` : ""}${row.isDefault ? ", the default" : ""}`,
                row.id,
              ),
          )
        : [new Option("No connections found", "")]),
    );
    if (!connection()) settings.connectionId = (connections.find((row) => row.isDefault) ?? connections[0])?.id ?? "";
    connectionSelect.value = settings.connectionId;
    if (rows === null) say("Your connections couldn't be read from the Engine. Reload the page to try again.", true);
    else if (!connections.length) say("Add a connection in the Engine (Connections) to use this.", true);
    describe();
  }

  /** Asks the model for a new look ("generate") or for what to change ("revise"), and shows it. */
  async function run(mode) {
    const chosen = connection();
    if (!chosen || busy) return;
    busy = new AbortController();
    stopButton.hidden = false;
    describe();
    say(mode === "revise" ? "Asking the model what to change…" : "Asking the model to design the avatar…");
    try {
      const current = actions.look();
      const menu = await designMenu(current.body);
      menuSize = menu.length;
      let picture = null;
      if (settings.portrait && portrait()) {
        picture = await (chosenPicture ? chosenPicture.data : pictureData(portrait())).catch(() => null);
        if (!picture) say("Their picture couldn't be read, so only the words are sent…");
      }
      const views = mode === "revise" && settings.views ? actions.views() : [];
      const ask = (withPictures) =>
        askModel(
          chosen.id,
          designMessages({
            mode,
            name: owner?.name ?? "",
            words: cutWords(wordsBox.value, MOST_WORDS),
            menu,
            picture: withPictures ? picture : null,
            current,
            views: withPictures ? views : [],
            note: cutWords(noteBox.value, MOST_NOTE),
          }),
          busy.signal,
        );
      const pictures = !!picture || views.length > 0;
      let content;
      let seen = pictures;
      try {
        content = await ask(true);
      } catch (error) {
        if (!pictures || error?.name === "AbortError") throw error;
        // (A model that can't see pictures may refuse them: asked again with the words alone.)
        seen = false;
        content = await ask(false);
      }
      answer.textContent = content;
      answerBox.hidden = false;
      const raw = readJson(content);
      if (!raw) throw new Error("The model's answer had no look in it. Try again, or another connection.");
      const base =
        mode === "revise"
          ? current
          : actions.fresh(
              current.body !== REALISTIC && (raw.body === "male" || raw.body === "female") ? raw.body : current.body,
            );
      const { look, design } = designedLook(base, raw);
      if (!Object.keys(design).length)
        throw new Error(
          "Nothing in the model's answer is one of the maker's options. Try again, or another connection.",
        );
      undo = actions.apply(
        look,
        mode === "revise" ? "Revised by the model." : "Designed by the model. Everything can be changed as usual.",
      );
      undoButton.hidden = false;
      const fields = Object.keys(design).length;
      say(
        `${mode === "revise" ? "Changed" : "Set"} ${fields} of the look's fields.${pictures && !seen ? " The pictures couldn't be used (the model may not see pictures), so this is from the words alone." : ""}`,
      );
    } catch (error) {
      if (error?.name === "AbortError" || error?.name === "TimeoutError")
        say(error?.name === "TimeoutError" ? "The model took too long." : "Stopped.", error?.name === "TimeoutError");
      else say(`The design didn't work: ${error?.message ?? error}`, true);
    } finally {
      busy = null;
      stopButton.hidden = true;
      describe();
    }
  }

  const box = h("div");
  function draw() {
    const switchRow = h("label", { class: "check" }, onSwitch, " Let a model design avatars");
    const intro = h(
      "p",
      { class: "says" },
      "A model on one of your Engine connections designs the avatar from who it's for: their card's words, and their portrait if you like. Or it revises the avatar on show. It's off until you turn it on, and everything else in the maker works without it.",
    );
    if (!settings.on) {
      box.replaceChildren(h("section", { class: "group" }, h("h2", {}, "Generate with AI"), intro, switchRow));
      return;
    }
    const pictureRow = h(
      "div",
      { class: "row" },
      h("span", { class: "name" }, "Picture"),
      h(
        "div",
        {},
        h("label", { class: "check" }, portraitBox, " Send their portrait too"),
        thumb,
        h(
          "div",
          { class: "swatches" },
          h("button", { type: "button", onclick: () => fileInput.click() }, "Use another picture…"),
          fileInput,
        ),
        h(
          "div",
          { class: "ends" },
          h(
            "span",
            {},
            "Only for a connection whose model can see pictures. Sent at most 768 pixels across. If the model refuses it, the words are sent alone.",
          ),
        ),
      ),
    );
    box.replaceChildren(
      h(
        "section",
        { class: "group" },
        h("h2", {}, "Generate with AI"),
        intro,
        switchRow,
        h(
          "div",
          { class: "row" },
          h(
            "label",
            { class: "name", htmlFor: connectionSelect.id || (connectionSelect.id = "am-generate-connection") },
            "Connection",
          ),
          h("div", {}, connectionSelect),
        ),
        h(
          "div",
          { class: "row" },
          h("label", { class: "name", htmlFor: wordsBox.id || (wordsBox.id = "am-generate-words") }, "About them"),
          h(
            "div",
            {},
            wordsBox,
            h(
              "div",
              { class: "swatches" },
              h("button", { type: "button", onclick: () => fillFromCard(true) }, "Fill from their card"),
            ),
            h(
              "div",
              { class: "ends" },
              h(
                "span",
                {},
                "What the model is told about them. Filled from their card's appearance, description and personality; change it as you like.",
              ),
            ),
          ),
        ),
        pictureRow,
        h("div", { class: "swatches" }, generateButton, stopButton),
        h("p", { class: "says" }, "Generate makes a new look, in place of the one on show."),
      ),
      h(
        "section",
        { class: "group" },
        h("h2", {}, "Revise this avatar"),
        h(
          "p",
          { class: "says" },
          "Sends the avatar's settings now with the words and picture above, and asks the model only for what to change.",
        ),
        noteBox,
        h("label", { class: "check" }, viewsBox, " Send pictures of the avatar as it looks now (whole body and face)"),
        h("div", { class: "swatches" }, reviseButton, undoButton),
      ),
      h("section", { class: "group" }, status, sends, answerBox),
    );
    describe();
  }

  /** Fills the words from the owner's card: always when asked, else only if the box holds nothing of the user's. */
  function fillFromCard(asked = false) {
    const words = owner?.card?.words ?? "";
    if (!asked && wordsBox.value.trim() && wordsBox.value !== filledFrom) return;
    wordsBox.value = words;
    filledFrom = words;
    if (asked && !words)
      say(
        owner
          ? "Their card says nothing of them; describe them yourself."
          : "Choose who the avatar is for first, or describe them yourself.",
      );
    describe();
  }

  draw();
  if (settings.on) void loadConnections();
  return {
    element() {
      return box;
    },
    /** Who the avatar is for changed: their card fills the words (unless the user wrote their own). */
    setOwner(next) {
      owner = next;
      chosenPicture = null;
      undo = null;
      undoButton.hidden = true;
      fillFromCard();
    },
  };
}
