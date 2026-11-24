// The maker's controls: tabs of sliders, lists and colours, built from the look as filled in (avatar.js
// avatarLook) and what the kit has for the body (avatar.js avatarChoices). Every control says what it
// changes, and each change goes out through `onChange(patch, { rebuild })`: a patch of the look (a part of
// `shape`, `colours` and the like is merged, not replaced; `undefined` clears a choice).
import {
  AGES,
  AVATAR_COLOURS,
  BARE,
  BODIES,
  BODY_DETAIL,
  BODY_GROUPS,
  BUILT_IN_PRESETS,
  CLOTH_COLOURS,
  CLOTH_PARTS,
  CLOTH_SLOTS,
  CLOTH_VARIANTS,
  CLOTHES,
  DYES,
  EYE_COLOURS,
  EYE_PICTURES,
  FACE,
  FACE_DETAIL,
  FACE_GROUPS,
  FACE_PRESETS,
  fromTrack,
  presetFields,
  HAIR_COLOURS,
  HAIRSTYLES,
  hasSlider,
  HEIGHTS,
  HORN_COLOURS,
  LIMBS,
  MAKEUP_LAYERS,
  MAKEUP_PRESETS,
  makeupPreset,
  missingFromLook as missing,
  missingNotes,
  OUTFIT_PRESETS,
  outfitLook,
  packCredits,
  PACK_HAIR,
  PACK_PIECES,
  RACE_PARTS,
  STUBBLE,
  STUBBLE_DENSITY,
  RACE_SHAPES,
  RACES,
  racePreset,
  SHAPES,
  SKIN_TONES,
  SKINS,
  BROW_NAMES,
  LASH_NAMES,
  NAILS,
  skinsFor,
  STYLE_FIELDS,
  STYLES,
  sliderRange,
  TINT,
  toTrack,
  UNDERWEAR_BOTTOMS,
  UNDERWEAR_TOPS,
} from "./looks.js";
import { hexNumber, hexText } from "./util.js";

/** The terms a VRM file carries (exporter.js vrmTerms), in the words Marinara Engine's 3D Avatars agent shows. */
const TERM_LISTS = {
  avatarPermission: [
    ["onlyAuthor", "Only the author"],
    ["onlySeparatelyLicensedPerson", "Only people the author allows"],
    ["everyone", "Anyone"],
  ],
  commercialUsage: [
    ["personalNonProfit", "Personal use, not for money"],
    ["personalProfit", "Personal use, including for money"],
    ["corporation", "Any use, including by companies"],
  ],
  sharing: [
    ["none", "Don't share it or change it"],
    ["share", "May share it as it is"],
    ["change", "May change it, but not share the changed one"],
    ["changeAndShare", "May change it and share the changed one"],
  ],
  creditNotation: [
    ["required", "Required"],
    ["unnecessary", "Not needed"],
  ],
};
const TERM_FLAGS = [
  ["allowExcessivelyViolentUsage", "excessively violent use"],
  ["allowExcessivelySexualUsage", "excessively sexual use"],
  ["allowPoliticalOrReligiousUsage", "political or religious use"],
  ["allowAntisocialOrHateUsage", "hateful or antisocial use"],
];

export const TABS = [
  ["start", "Start"],
  ["body", "Body"],
  ["face", "Face"],
  ["skin", "Skin and eyes"],
  ["hair", "Hair"],
  ["clothes", "Clothes"],
  ["save", "Save"],
];

/** A DOM element: h("div", { class: "row", onclick }, child, "text", …). */
export function h(tag, props = {}, ...children) {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(props ?? {})) {
    if (value === undefined || value === null || value === false) continue;
    if (key.startsWith("on")) element.addEventListener(key.slice(2), value);
    else if (key === "class") element.className = value;
    else if (key in element && key !== "list") element[key] = value;
    else element.setAttribute(key, value === true ? "" : value);
  }
  for (const child of children.flat())
    if (child !== null && child !== undefined && child !== false) element.append(child);
  return element;
}

let ids = 0;
const nextId = () => `am-${++ids}`;
const labelOf = (list, value) => list.find(([key]) => key === value)?.[1] ?? value;

/** A labelled row: the name on the left, the control (and a line under it) on the right. */
function row(name, control, says = "") {
  const id = control.id || (control.id = nextId());
  return h(
    "div",
    { class: "row" },
    h("label", { class: "name", htmlFor: id, title: says || undefined }, name),
    h("div", {}, control, says ? h("div", { class: "ends" }, h("span", {}, says)) : null),
  );
}

function select(options, value, onPick, label) {
  const control = h("select", { "aria-label": label, onchange: () => onPick(control.value) });
  for (const [key, text] of options) control.append(new Option(text, key, false, key === value));
  return control;
}

/**
 * A slider on a track from `least` to `most`, with what its ends are under it. `onInput` hears every move
 * (the figure follows the thumb), with the value the look keeps.
 */
function slider({ name, says, ends, least, most, step = 0.01, at, onInput }) {
  const id = nextId();
  const control = h("input", {
    id,
    type: "range",
    min: least,
    max: most,
    step,
    value: at,
    "aria-describedby": `${id}-says`,
    oninput: () => onInput(Number(control.value)),
  });
  return h(
    "div",
    { class: "row" },
    h("label", { class: "name", htmlFor: id, title: says }, name),
    h(
      "div",
      {},
      control,
      h("div", { class: "ends", id: `${id}-says` }, h("span", {}, ends?.[0] ?? ""), h("span", {}, ends?.[1] ?? "")),
    ),
  );
}

/** Round swatches to pick a colour from `list` ([hex, label]), and a colour of one's own beside them. */
function colours(name, list, current, onPick, says = "") {
  const box = h("div", { class: "swatches", role: "group", "aria-label": name });
  for (const [hex, label] of list)
    box.append(
      h("button", {
        class: "swatch",
        type: "button",
        title: label,
        "aria-label": `${name}: ${label}`,
        "aria-pressed": String(hex === current),
        style: `background:${hexText(hex)}`,
        onclick: () => onPick(hex, true),
      }),
    );
  const own = h("input", {
    type: "color",
    value: hexText(current ?? list[0]?.[0] ?? 0x808080),
    title: `${name}: a colour of your own`,
    "aria-label": `${name}: a colour of your own`,
    oninput: () => onPick(hexNumber(own.value), false),
  });
  box.append(own);
  return h(
    "div",
    { class: "row" },
    h("span", { class: "name", title: says || undefined }, name),
    h("div", {}, box, says ? h("div", { class: "ends" }, h("span", {}, says)) : null),
  );
}

/** Where a pack's piece or hair style (id in list, looks.js PACK_PIECES or PACK_HAIR) is from, or null. */
const fromPack = (list, id) => {
  const pack = Object.hasOwn(list, id) ? list[id] : null;
  return pack
    ? h(
        "p",
        { class: "says" },
        `From ${pack.packName}, by ${pack.author}${pack.credit ? ` (${pack.licence.replace(/-/gu, " ")})` : ""}.`,
      )
    : null;
};

const group = (title, says, ...children) =>
  h("section", { class: "group" }, h("h2", {}, title), says ? h("p", { class: "says" }, says) : null, ...children);

/**
 * The panel: { element, render(info), setStatus(text, bad) }. `info` is { look (as chosen), filled (every
 * field filled in), choices (what the kit has for this body), tab, exported (the last export's numbers) }.
 * `actions` are the Save tab's and the header's doings: { onChange, onTab, onNew, onOpen, onSaveLook,
 * onExport }.
 */
export function createPanel(actions) {
  const tabs = h("div", { class: "tabs", role: "tablist", "aria-label": "Avatar sections" });
  const body = h("div", { class: "body", role: "tabpanel", tabIndex: 0 });
  const element = h("section", { class: "panel", "aria-label": "Avatar controls" }, tabs, body);
  let status = { text: "", bad: false };
  let statusLine = null;

  // (`redraw` false: the control that changed stays as it is, so a slider being dragged keeps the pointer.)
  const change = (patch, redraw = true) => actions.onChange(patch, { redraw });

  /** The stubble painted on the skin (looks.js STUBBLE): its shape, and once there is one, its colour and density. */
  const stubbleRows = (filled) => {
    const stubble = filled.stubble;
    const rows = [
      row(
        "Stubble",
        select(
          [[BARE, "None"], ...STUBBLE.map(([value, label]) => [value, label])],
          stubble?.shape ?? BARE,
          (value) =>
            change({ stubble: value === BARE ? undefined : { density: STUBBLE_DENSITY, ...stubble, shape: value } }),
          "Stubble",
        ),
        "Short facial hair painted on the skin, alone or under a beard: light or heavy stubble, a moustache or goatee shadow, or a close-cropped beard.",
      ),
    ];
    if (!stubble) return rows;
    let now = stubble;
    rows.push(
      colours(
        "Stubble colour",
        HAIR_COLOURS,
        stubble.colour ?? filled.hairColour,
        (hex, redraw) => {
          now = { ...now, colour: hex };
          change({ stubble: now }, redraw);
        },
        "Its colour. Left alone, it's the hair's.",
      ),
      slider({
        name: "Stubble density",
        says: "How many hairs there are, from a few to many.",
        ends: ["Sparse", "Dense"],
        least: 0,
        most: 1,
        at: stubble.density,
        onInput: (value) => {
          now = { ...now, density: value };
          change({ stubble: now }, false);
        },
      }),
    );
    if (stubble.colour !== undefined) {
      const { colour: _colour, ...rest } = stubble;
      rows.push(
        h("button", { type: "button", onclick: () => change({ stubble: rest }) }, "Stubble in the hair's colour"),
      );
    }
    return rows;
  };

  const sections = {
    start: ({ filled }) => [
      group(
        "Start from a ready-made look",
        "A preset sets the body and its shape. Everything can be changed afterwards.",
        row(
          "Preset",
          select(
            [["", "Choose one…"], ...BUILT_IN_PRESETS.map((preset, i) => [String(i), preset.name])],
            "",
            (value) => {
              const preset = BUILT_IN_PRESETS[Number(value)];
              if (value !== "" && preset) actions.onNew(preset.look);
            },
            "Start from a preset",
          ),
        ),
        h(
          "div",
          { class: "swatches" },
          h("button", { type: "button", onclick: () => actions.onNew({ body: "female" }) }, "New female avatar"),
          h("button", { type: "button", onclick: () => actions.onNew({ body: "male" }) }, "New male avatar"),
        ),
      ),
      group(
        "Style",
        "A starting point for the face and head. It sets the Face tab's sliders, so everything stays adjustable. An anime drawing style (flat shading and outlines) is planned for the saved file.",
        row(
          "Style",
          select(
            [["", "Choose one…"], ...STYLES.map(([value, label]) => [value, label])],
            "",
            (value) => {
              const style = STYLES.find(([key]) => key === value);
              if (!style) return;
              const cleared = Object.fromEntries(STYLE_FIELDS.map((field) => [field, 0]));
              change({ shape: { ...cleared, ...style[3].shape }, limbs: style[3].limbs });
            },
            "Style",
          ),
          STYLES.map(([, label, says]) => `${label}: ${says}`).join(" "),
        ),
      ),
      group(
        "Where this avatar is",
        `Body: ${labelOf(BODIES, filled.body)}. Your work is kept in this browser as you go. Use the Save tab to keep it as a file.`,
      ),
    ],

    body: ({ filled, choices }) => [
      group(
        "Body",
        "",
        row(
          "Body",
          select(BODIES, filled.body, (value) => change({ body: value }), "Body"),
          "Each body has its own hair fits, underwear and some clothes.",
        ),
        row(
          "Race",
          select(
            [
              ["", "Choose one…"],
              ...RACES.filter(([race]) => choices.races.includes(race)).map(([race, label]) => [race, label]),
            ],
            "",
            (value) => {
              if (!value) return;
              const preset = racePreset(value, filled.body);
              change({ ...preset, shape: preset.shape, limbs: preset.limbs, colours: preset.colours ?? {} });
            },
            "Start from a race",
          ),
          "A preset: it sets the race sliders below, height, limb lengths and that race's usual extras. Change any of them after.",
        ),
        row(
          "Age",
          select(AGES, filled.age, (value) => change({ age: value }), "Age"),
          "Changes the body's shape and the skin picture.",
        ),
        middleSlider({
          name: "Height",
          says: "The whole figure, taller or shorter.",
          ends: ["Short", "Tall"],
          least: HEIGHTS[0],
          most: HEIGHTS[1],
          at: filled.height,
          onInput: (value) => change({ height: value }, false),
        }),
      ),
      foldable(
        "race",
        "Race features",
        "Each race's build and face, mixed as you like. A race chosen above sets these.",
        ...RACE_SHAPES.filter(([key]) => hasSlider(key, choices.keys, filled.body)).map((entry) =>
          shapeSlider(entry, filled, choices),
        ),
      ),
      group(
        "Build",
        "The middle of each slider is the body's own shape.",
        ...SHAPES.filter(([key]) => hasSlider(key, choices.keys, filled.body)).map((entry) =>
          shapeSlider(entry, filled, choices),
        ),
      ),
      ...BODY_GROUPS.map(([part, title, says]) => {
        const sliders = BODY_DETAIL.filter(
          ([key, , , , , , belongs]) => belongs === part && hasSlider(key, choices.keys, filled.body),
        );
        if (!sliders.length) return null;
        return foldable(
          `body-${part}`,
          title,
          says,
          ...sliders.map((entry) => shapeSlider(entry, filled, choices)),
          h(
            "button",
            {
              type: "button",
              onclick: () => change({ shape: Object.fromEntries(sliders.map(([field]) => [field, 0])) }),
            },
            `Back to the ${title.toLowerCase()} as made`,
          ),
        );
      }),
      group(
        "Proportions",
        "",
        ...LIMBS.map(([key, label, least, most, says, ends]) =>
          middleSlider({
            name: label,
            says,
            ends,
            least,
            most,
            step: 0.005,
            at: filled.limbs[key],
            onInput: (value) => change({ limbs: { [key]: value } }, false),
          }),
        ),
      ),
    ],

    face: ({ filled, choices }) => [
      group(
        "Face shape",
        "The face's overall shape. Each part of the face has more below.",
        presetRow("shape", "Face outline"),
        ...FACE.filter(([key]) => hasSlider(key, choices.keys, filled.body)).map((entry) =>
          shapeSlider(entry, filled, choices),
        ),
      ),
      ...FACE_GROUPS.map(([part, title, says]) => {
        const sliders = FACE_DETAIL.filter(
          ([key, , , , , , belongs]) => belongs === part && hasSlider(key, choices.keys, filled.body),
        );
        if (!sliders.length) return null;
        return foldable(
          part,
          title,
          says,
          FACE_PRESETS[part] ? presetRow(part, "Ready-made") : null,
          ...sliders.map((entry) => shapeSlider(entry, filled, choices)),
          h(
            "button",
            {
              type: "button",
              onclick: () => change({ shape: Object.fromEntries(presetFields(part).map((field) => [field, 0])) }),
            },
            `Back to the ${title.toLowerCase()} as made`,
          ),
        );
      }),
      group(
        "Brows and lashes",
        "",
        row(
          "Brows",
          select(
            choices.brows.map((style) => [String(style), BROW_NAMES[style] ?? `Style ${style}`]),
            String(filled.brows),
            (value) => change({ brows: Number(value) }),
            "Brow style",
          ),
        ),
        row(
          "Lashes",
          select(
            choices.lashes.map((style) => [String(style), LASH_NAMES[style] ?? `Style ${style}`]),
            String(filled.lashes),
            (value) => change({ lashes: Number(value) }),
            "Lash style",
          ),
        ),
        colours("Brow colour", HAIR_COLOURS, filled.colours.brows, (hex, redraw) =>
          change({ colours: { brows: hex } }, redraw),
        ),
      ),
      group(
        "Accessories",
        "Anyone can wear any of these, whatever their race.",
        ...RACE_PARTS.filter(([field]) => (choices[field] ?? []).length).map(([field, list, label, says]) =>
          row(
            label,
            select(
              list.filter(([style]) => style === BARE || choices[field].includes(style)),
              filled[field],
              (value) => change({ [field]: value }),
              label,
            ),
            says,
          ),
        ),
        ...stubbleRows(filled),
        filled.horns !== BARE
          ? colours("Horn colour", HORN_COLOURS, filled.colours.horns, (hex, redraw) =>
              change({ colours: { horns: hex } }, redraw),
            )
          : null,
        choices.tail
          ? row(
              "Tail",
              select(
                [
                  ["no", "No tail"],
                  ["yes", "A tiefling's tail"],
                ],
                filled.tail ? "yes" : "no",
                (value) => change({ tail: value === "yes" }),
                "Tail",
              ),
            )
          : null,
      ),
    ],

    skin: ({ look, filled }) => [
      group(
        "Skin",
        "",
        row(
          "Skin",
          select(skinsFor(filled.body), filled.skin, (value) => change({ skin: value }), "Skin"),
          "A skin picture, or the plain skin in a colour of your own.",
        ),
        filled.skin === "custom"
          ? colours("Skin colour", SKIN_TONES, filled.colours.skin, (hex, redraw) =>
              change({ skin: "custom", colours: { skin: hex } }, redraw),
            )
          : null,
      ),
      group(
        "Eyes",
        "",
        row(
          "Eyes",
          select(
            [[TINT, "A colour of your own"], ...EYE_PICTURES],
            filled.eyePicture,
            (value) => change({ eyePicture: value }),
            "Eyes",
          ),
          "A pictured eye, or the grey iris in a colour.",
        ),
        filled.eyePicture === TINT
          ? colours("Eye colour", EYE_COLOURS, filled.colours.eyes, (hex, redraw) =>
              change({ colours: { eyes: hex } }, redraw),
            )
          : null,
      ),
      group(
        "Makeup",
        "On any skin. Each layer is a colour and a strength; at none, the skin is as it is.",
        row(
          "Preset",
          select(
            [["", "Choose one…"], ["none", "No makeup"], ...MAKEUP_PRESETS.map(([value, label]) => [value, label])],
            "",
            (value) => {
              if (!value) return;
              const { makeup, lips } = makeupPreset(value);
              change({ makeup: { $set: makeup }, colours: { lips } });
            },
            "Makeup preset",
          ),
          "Ready-made makeup. It sets every layer below, which stay adjustable.",
        ),
        ...MAKEUP_LAYERS.flatMap(([layer, label, says, list, usual]) => {
          // (The lipstick's colour is the lips' colour, colours.lips; its strength is makeup.lipstick.)
          const lipstick = layer === "lipstick";
          const colour = lipstick ? look.colours?.lips : filled.makeup[layer]?.colour;
          const amount =
            colour === undefined ? 0 : lipstick ? (filled.makeup.lipstick?.amount ?? 1) : filled.makeup[layer].amount;
          const set = (hex, strength) =>
            lipstick
              ? {
                  colours: { lips: strength ? hex : undefined },
                  makeup: { lipstick: strength && strength < 1 ? { amount: strength } : undefined },
                }
              : { makeup: { [layer]: strength ? { colour: hex, amount: strength } : undefined } };
          // (The colour and strength as they are now: a slider being dragged doesn't redraw the panel.)
          let now = { hex: colour ?? list[0][0], strength: amount };
          const strength = slider({
            name: `${label} strength`,
            says: `How strongly the ${label.toLowerCase()} shows, from none to full.`,
            ends: ["None", "Full"],
            least: 0,
            most: 1,
            at: amount,
            onInput: (value) => {
              now = { ...now, strength: value };
              change(set(now.hex, value), false);
            },
          });
          return [
            colours(
              label,
              list,
              colour,
              (hex, redraw) => {
                // (Picking a colour while there's none puts it on at its usual strength.)
                const was = now.strength;
                now = { hex, strength: was || usual };
                change(set(hex, now.strength), redraw || !was);
              },
              says,
            ),
            strength,
          ];
        }),
        h(
          "button",
          { type: "button", onclick: () => change({ makeup: undefined, colours: { lips: undefined } }) },
          "No makeup (the skin's own lips)",
        ),
      ),
      group(
        "Nails",
        "Left alone, their colour follows the skin.",
        row(
          "Fingernails",
          select(NAILS, filled.nails, (value) => change({ nails: value }), "Fingernails"),
          "Their length, or none. Gloves hide them.",
        ),
        row(
          "Toenails",
          select(
            [
              ["on", "On"],
              ["off", "Off"],
            ],
            filled.toenails ? "on" : "off",
            (value) => change({ toenails: value === "on" }),
            "Toenails",
          ),
          "Shoes hide them.",
        ),
        ...AVATAR_COLOURS.filter(([field]) => field === "nails").map(([field, label, list, says]) =>
          colours(
            label,
            list,
            filled.colours[field],
            (hex, redraw) => change({ colours: { [field]: hex } }, redraw),
            says,
          ),
        ),
        h(
          "button",
          { type: "button", onclick: () => change({ colours: { nails: undefined } }) },
          "Back to the skin's own nails",
        ),
      ),
    ],

    hair: ({ look, filled, choices }) => [
      group(
        "Hair",
        "",
        missing(look).hair ? h("p", { class: "says" }, missingNotes({ ...look, clothes: [] }).join(" ")) : null,
        row(
          "Style",
          select(
            HAIRSTYLES.filter(([style]) => choices.hair.includes(style)),
            filled.hair,
            (value) => change({ hair: value }),
            "Hair style",
          ),
          "A hood or helm that covers the head hides the hair.",
        ),
        fromPack(PACK_HAIR, filled.hair),
        colours("Hair colour", HAIR_COLOURS, filled.hairColour, (hex, redraw) =>
          change({ hairTint: hex, hairColour: undefined }, redraw),
        ),
      ),
    ],

    clothes: ({ look, filled, choices }) => {
      const gone = missing(look).clothes;
      const bySlot = new Map(CLOTH_SLOTS.map(([slot]) => [slot, []]));
      for (const entry of choices.clothes) bySlot.get(entry.slot)?.push(entry);
      const worn = new Set(filled.clothes);
      const wear = (slot, piece) => {
        const kept = filled.clothes.filter((other) => bySlot.get(slot).every((entry) => entry.piece !== other));
        change({ clothes: piece ? [...kept, piece] : kept });
      };
      return [
        gone.length
          ? group(
              "Not shown",
              "Pieces from a wardrobe pack that isn't installed. They stay in the look and come back when the pack is installed again; a saved avatar leaves them out.",
              ...gone.map((piece) =>
                h(
                  "div",
                  { class: "piece" },
                  h("p", { class: "says" }, missingNotes({ clothes: [piece], fromPacks: look.fromPacks }).join(" ")),
                  h(
                    "button",
                    {
                      type: "button",
                      onclick: () => change({ clothes: filled.clothes.filter((other) => other !== piece) }),
                    },
                    "Take it out of the look",
                  ),
                ),
              ),
            )
          : null,
        group(
          "Ready-made outfits",
          "Changes the clothes only.",
          row(
            "Outfit",
            select(
              [
                ["", "Choose one…"],
                ...OUTFIT_PRESETS.map((preset, i) => [String(i), preset.name]),
                ["none", "Nothing on"],
              ],
              "",
              (value) => {
                if (value === "none") change({ clothes: [], clothColours: undefined, variants: undefined });
                else if (value !== "") change(wholeOutfit(outfitLook(OUTFIT_PRESETS[Number(value)], filled.body)));
              },
              "Put on a ready-made outfit",
            ),
          ),
        ),
        group(
          "Underwear",
          "Hidden by whatever is worn over it.",
          choices.tops.length
            ? row(
                "Top",
                select(
                  [[BARE, "None"], ...UNDERWEAR_TOPS.filter(([style]) => choices.tops.includes(style))],
                  filled.underwear.top,
                  (value) => change({ underwear: { top: value } }),
                  "Underwear top",
                ),
              )
            : null,
          row(
            "Bottom",
            select(
              [[BARE, "None"], ...UNDERWEAR_BOTTOMS.filter(([style]) => choices.bottoms.includes(style))],
              filled.underwear.bottom,
              (value) => change({ underwear: { bottom: value } }),
              "Underwear bottom",
            ),
          ),
          colours("Colour", CLOTH_COLOURS, filled.colours.underwear, (hex, redraw) =>
            change({ colours: { underwear: hex } }, redraw),
          ),
        ),
        group(
          "Clothes and armour",
          "One piece in each place. Pieces further down the list are worn over the ones above where they overlap.",
          ...CLOTH_SLOTS.filter(([slot]) => bySlot.get(slot).length).map(([slot, label, says]) => {
            const entries = bySlot.get(slot);
            const on = entries.find((entry) => worn.has(entry.piece));
            const pick = row(
              label,
              select(
                [["", "None"], ...entries.map((entry) => [entry.piece, labelOf(CLOTHES, entry.piece)])],
                on?.piece ?? "",
                (value) => wear(slot, value),
                label,
              ),
              says,
            );
            if (!on) return pick;
            const variants = CLOTH_VARIANTS[on.piece];
            return h(
              "div",
              { class: "piece" },
              pick,
              fromPack(PACK_PIECES, on.piece),
              variants && on.variants?.length
                ? row(
                    variants.label,
                    select(
                      variants.ways,
                      filled.variants[on.piece] ?? "",
                      (value) => change({ variants: { [on.piece]: value || undefined } }),
                      variants.label,
                    ),
                    variants.says,
                  )
                : null,
              ...on.parts.map(([part, made]) =>
                colours(
                  labelOf(CLOTH_PARTS, part),
                  DYES,
                  filled.clothColours[on.piece]?.[part] ?? made,
                  (hex, redraw) =>
                    change({ clothColours: { [on.piece]: { ...filled.clothColours[on.piece], [part]: hex } } }, redraw),
                ),
              ),
            );
          }),
        ),
      ];
    },

    save: ({ exported, terms, look }) => [
      group(
        "Keep working on it later",
        "A small file with every choice you made. Open it here again to carry on.",
        h(
          "div",
          { class: "swatches" },
          h("button", { type: "button", onclick: actions.onSaveLook }, "Save the look (.json)"),
          h("button", { type: "button", onclick: actions.onOpen }, "Open a look or avatar…"),
        ),
      ),
      group(
        "Save as a 3D avatar",
        "A file with the body, hair, clothes and pictures in it, which also remembers your choices so it can be opened here again. A VRM stands in a T-pose, names its bones for any VRM app, carries the terms below, and swings long hair and a tail as the avatar moves. A GLB is a plain 3D model.",
        row(
          "Picture size",
          (pictureSize = select(
            [
              ["2048", "Full (sharpest, largest file)"],
              ["1024", "Half (smaller file, good for phones)"],
              ["512", "Quarter (smallest)"],
            ],
            pictureSize?.value ?? "2048",
            () => {},
            "Picture size",
          )),
          "How large the skin and clothing pictures are in the file.",
        ),
        h(
          "div",
          { class: "swatches" },
          h(
            "button",
            {
              class: "main",
              type: "button",
              onclick: () => actions.onExport({ format: "vrm", maxTextureSize: Number(pictureSize.value) }),
            },
            "Save as VRM",
          ),
          h(
            "button",
            {
              type: "button",
              onclick: () => actions.onExport({ format: "glb", maxTextureSize: Number(pictureSize.value) }),
            },
            "Save as GLB",
          ),
        ),
        exported
          ? h(
              "p",
              { class: "says" },
              `Saved ${exported.file}: ${(exported.bytes / 1048576).toFixed(1)} MB, ${exported.vertices.toLocaleString()} points, ${exported.triangles.toLocaleString()} triangles.`,
            )
          : null,
      ),
      // (A change here is kept without drawing the tab again, so the author box keeps its cursor.)
      foldable(
        "terms",
        "The VRM's terms",
        "What you allow others to do with the avatar, written into a VRM file under the VRM Public License 1.0 for the apps that open it. Kept in this browser for every avatar you save. A GLB carries none of this.",
        row(
          "Author",
          h("input", {
            type: "text",
            value: terms.author,
            maxLength: 120,
            placeholder: "Your name or handle",
            "aria-label": "Author",
            oninput: (event) => actions.onTerms({ author: event.target.value }),
          }),
          "Who made the avatar. Left empty, the file says Unknown.",
        ),
        ...[
          ["avatarPermission", "Who may use it", "Who may appear as this avatar."],
          ["commercialUsage", "Commercial use", "Whether it may be used to earn money, and by whom."],
          ["sharing", "Sharing", "Whether others may pass the file on, or change the avatar."],
          [
            "creditNotation",
            "Credit",
            packCredits(look).length
              ? "Whether whoever uses it must name you. Always required while it wears a CC BY piece or hair style from a wardrobe pack, whose maker must be credited."
              : "Whether whoever uses it must name you.",
          ],
        ].map(([field, name, says]) =>
          row(
            name,
            select(TERM_LISTS[field], terms[field], (value) => actions.onTerms({ [field]: value }), name),
            says,
          ),
        ),
        h("p", { class: "says" }, "Uses VRM forbids unless allowed:"),
        ...TERM_FLAGS.map(([flag, name]) =>
          h(
            "label",
            { class: "check" },
            h("input", {
              type: "checkbox",
              checked: terms[flag],
              onchange: (event) => actions.onTerms({ [flag]: event.target.checked }),
            }),
            ` Allow ${name}`,
          ),
        ),
      ),
      group(
        "Use it in a chat",
        "The 3D Avatars agent shows the file. It blinks, its mouth moves as it talks, and its face shows how the character feels. In a VRM the eyes move and long hair swings too.",
        h(
          "ol",
          { class: "steps" },
          h("li", {}, "Open Agents and install 3D Avatars from the Agent Organizer if you haven't."),
          h("li", {}, "Open 3D Avatars and pick the character or persona."),
          h(
            "li",
            {},
            "For a .vrm, under Avatar type choose VRM model, then Import VRM. For a .glb, choose GLB or FBX model, then Import GLB or FBX.",
          ),
          h(
            "li",
            {},
            "Turn on Show this avatar in chats, and add 3D Avatars to the chat under Chat Settings → Agents.",
          ),
        ),
      ),
    ],
  };
  let pictureSize = null;
  const opened = new Set(["eyes"]); // the face's folding sections open now

  /**
   * A slider for a size whose usual is 1 (height, limb lengths, head size): its track has 1 in the middle
   * whatever its range each way, so a long reach down (a halfling's height) doesn't crowd the usual.
   */
  function middleSlider({ least, most, at, onInput, ...rest }) {
    const toAt = (value) => (value < 1 ? -(1 - value) / (1 - least) : (value - 1) / (most - 1));
    const fromAt = (track) => Math.round((track < 0 ? 1 + track * (1 - least) : 1 + track * (most - 1)) * 1000) / 1000;
    return slider({ ...rest, least: -1, most: 1, at: toAt(at), onInput: (track) => onInput(fromAt(track)) });
  }

  /** A section that folds away, remembered open or shut while the maker is open. */
  function foldable(name, title, says, ...children) {
    const section = h(
      "details",
      {
        class: "group fold",
        open: opened.has(name),
        ontoggle: () => (section.open ? opened.add(name) : opened.delete(name)),
      },
      h("summary", {}, title),
      says ? h("p", { class: "says" }, says) : null,
      ...children,
    );
    return section;
  }

  /** A ready-made shape for a part of the face (FACE_PRESETS): sets that part's sliders. */
  function presetRow(part, label) {
    const presets = FACE_PRESETS[part] ?? [];
    return row(
      label,
      select(
        [["", "Choose one…"], ...presets.map(([name], i) => [String(i), name])],
        "",
        (value) => {
          const preset = presets[Number(value)];
          if (!preset) return;
          const cleared = Object.fromEntries(presetFields(part).map((field) => [field, 0]));
          change({ shape: { ...cleared, ...preset[1] } });
        },
        `${label} for the ${part === "shape" ? "face" : part}`,
      ),
      "Sets the sliders below; adjust them after.",
    );
  }

  /** One of the build or face sliders: its track has the body's own shape in the middle (or at the left). */
  function shapeSlider(entry, filled, choices) {
    const [key, label, , , says, ends] = entry;
    const range = sliderRange(entry, choices.keys);
    return slider({
      name: label,
      says,
      ends,
      least: range[0] < 0 ? -1 : 0,
      most: 1,
      at: toTrack(filled.shape[key], range),
      onInput: (at) => change({ shape: { [key]: Math.round(fromTrack(at, range) * 1000) / 1000 } }, false),
    });
  }

  /** An outfit preset as a patch that replaces what's worn (`$set`: not merged into the colours already chosen). */
  const wholeOutfit = (outfit) => ({
    clothes: outfit.clothes ?? [],
    clothColours: { $set: outfit.clothColours ?? {} },
    variants: { $set: outfit.variants ?? {} },
  });

  function render(info) {
    tabs.replaceChildren(
      ...TABS.map(([tab, label]) =>
        h(
          "button",
          {
            type: "button",
            role: "tab",
            id: `am-tab-${tab}`,
            "aria-selected": String(tab === info.tab),
            onclick: () => actions.onTab(tab),
          },
          label,
        ),
      ),
    );
    body.setAttribute("aria-labelledby", `am-tab-${info.tab}`);
    const scroll = body.scrollTop;
    statusLine = h(
      "p",
      { class: `status${status.bad ? " bad" : ""}`, role: "status", "aria-live": "polite" },
      status.text,
    );
    body.replaceChildren(statusLine, ...(info.filled && info.choices ? sections[info.tab](info) : []).filter(Boolean));
    body.scrollTop = scroll;
  }

  function setStatus(text, bad = false) {
    status = { text, bad };
    if (statusLine) {
      statusLine.textContent = text;
      statusLine.className = `status${bad ? " bad" : ""}`;
    }
  }

  return { element, render, setStatus };
}
