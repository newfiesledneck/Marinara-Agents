// What a default person (people.js: someone without a 3D model) can look like, as plain data: the menus
// the Look card offers, and the check a saved look goes through. A look is the choices made by hand, each
// optional; whatever isn't chosen stays as their name has it:
//
//   { outfit,                       the outfit they're dressed in, all of a piece
//     top, arms, legs, feet,        or any one piece of it from another outfit, or "none" (left off)
//     hood, pauldrons,              the ranger's, on or off (on with the ranger's top unless said)
//     colour, rangerColour,         the cloth of the townsfolk pieces, and of the ranger's
//     tints: { top, arms, … },      a colour of your own for any piece (0xRRGGBB), in place of its cloth's
//     hair, hairColour, hairTint,   the style, a colour from the list, or one of your own (0xRRGGBB)
//     skin, skinTint,               a skin tone from the list, or a colour of your own (0xRRGGBB)
//     beard, height }
//
// (Their gender is kept apart, save.bodies, and gives the body unless the look has one of its own,
// `body`: the base avatar's fields are below, by BODIES.)

/** Outfits, and the colours each comes in: [value (the kit's texture name), label]. */
export const OUTFITS = {
  peasant: {
    label: "Townsfolk",
    colours: [
      ["clothes-a", "Cream"],
      ["clothes-b", "Olive"],
      ["clothes-blue", "Blue"],
      ["clothes-red", "Rose"],
      ["clothes-teal", "Green"],
      ["clothes-plum", "Plum"],
      ["clothes-grey", "Grey"],
    ],
  },
  ranger: {
    label: "Ranger",
    colours: [
      ["ranger-a", "Forest"],
      ["ranger-b", "Tan"],
      ["ranger-wine", "Violet"],
      ["ranger-dusk", "Dusk blue"],
      ["ranger-rust", "Rust"],
      ["ranger-moss", "Moss"],
      ["ranger-grey", "Grey"],
    ],
  },
};
/** What a piece can be: one of the outfits', or left off ("none": the body shows there, in its underclothes). */
export const BARE = "none";
export const PIECE_KINDS = [...Object.keys(OUTFITS), BARE];
/** Which look field holds each outfit's colour. */
export const COLOUR_FIELD = { peasant: "colour", ranger: "rangerColour" };
/** The pieces every outfit has: [look field, label]. */
export const PIECES = [
  ["top", "Top"],
  ["arms", "Sleeves"],
  ["legs", "Legs"],
  ["feet", "Boots"],
];
/** Pieces only one outfit has, worn or not: [look field, label, the outfit]. */
export const EXTRAS = [
  ["hood", "Hood", "ranger"],
  ["pauldrons", "Pauldrons", "ranger"],
];
/** How often a name alone gives each outfit (the rest are townsfolk). */
export const RANGER_SHARE = 0.25;

/** Hairstyles: [value, label]. "none" is a bare head. The base avatar's (avatar.js) and the older kit's
 *  share the names; the kit has no ponytail, so it wears that long. */
// (Shortest first. The Look card offers the base avatar the styles its kit has: afro is the older kit's only.)
export const HAIRSTYLES = [
  ["shaved", "Shaved close"],
  ["crop", "Cropped"],
  ["short", "Short"],
  ["mohawk", "Mohawk"],
  ["slicked", "Slicked back"],
  ["fringe", "Short with a fringe"],
  ["parted", "Side-parted"],
  ["curly", "Curly"],
  ["afro", "Afro"],
  ["bob", "Bob"],
  ["bob_angled", "Angled bob"],
  ["bob_blunt", "Blunt bob"],
  ["bob_blunt_bangs", "Blunt bob with a fringe"],
  ["bob_curled", "Curled-under bob"],
  ["bob_curled_bangs", "Curled-under bob with a fringe"],
  ["bob_inverted", "Inverted bob"],
  ["bob_inverted_bangs", "Inverted bob with a fringe"],
  ["buns", "Two buns"],
  ["long", "Long"],
  ["ponytail", "Ponytail"],
  ["braid", "Braid"],
  ["none", "None (bald)"],
];
/** The older kit's file for a hairstyle: short hair is cut to each body's own head. (Older names too.) */
// (The older kit has only short, parted, long and buns: the newer styles are worn as the nearest of those.)
const OLDER_KIT_HAIR = {
  bob: "parted",
  bob_angled: "parted",
  bob_blunt: "parted",
  bob_blunt_bangs: "parted",
  bob_curled: "parted",
  bob_curled_bangs: "parted",
  bob_inverted: "parted",
  bob_inverted_bangs: "parted",
  fringe: "parted",
  braid: "long",
  curly: "short",
  afro: "short",
  shaved: "short",
  mohawk: "short",
  slicked: "short",
  crop: "short",
};
export const HAIR_FILE = (wanted, sex, hair = OLDER_KIT_HAIR[wanted] ?? wanted) =>
  hair === "short" || hair === "cropped"
    ? sex === "female"
      ? "buzzedfemale"
      : "buzzed"
    : hair === "parted"
      ? "simpleparted"
      : hair === "ponytail"
        ? "long"
        : hair;
/** Hairstyles' older names (before the base avatar), as they're read now. */
const OLDER_HAIR = { buzzed: "short", buzzedfemale: "short", cropped: "short", simpleparted: "parted" };
/** What a name alone picks from. */
export const USUAL_HAIR = {
  male: ["short", "parted", "long", "parted", "crop", "slicked", "fringe", "curly"],
  female: ["buns", "long", "parted", "short", "ponytail", "braid", "bob", "bob_angled"],
};

/** Hair colours: [hex, label]; a look holds the place in this list. */
export const HAIR_COLOURS = [
  [0x2b1d14, "Dark brown"],
  [0x4a2f1c, "Brown"],
  [0x7a4a26, "Chestnut"],
  [0xb08850, "Dark blond"],
  [0xe0c890, "Blond"],
  [0x1a1a1a, "Black"],
  [0x8c2f1e, "Red"],
  [0xbcbcbc, "Grey"],
  [0xf2f2f2, "White"],
  [0x4a6fa8, "Blue"],
  [0x7a4a9a, "Violet"],
  [0x3f8a5a, "Green"],
  [0xd06a8c, "Pink"],
];
/** How many of those a name alone picks from (the natural ones). */
export const USUAL_HAIR_COLOURS = 8;

/** Skin tones, lightest to darkest: [the colour the skin comes out as, label]. */
export const SKIN_TONES = [
  [0xf3d9cb, "Pale"],
  [0xedc0b0, "Rosy"],
  [0xe8c3a8, "Fair"],
  [0xd9a98a, "Light"],
  [0xd8a970, "Golden"],
  [0xc08a62, "Tan"],
  [0xb0895a, "Olive"],
  [0xa56c43, "Bronze"],
  [0x8d5a3a, "Brown"],
  [0x70432a, "Deep brown"],
  [0x5c3a26, "Dark"],
  [0x3d261a, "Ebony"],
];
/** Where the six tones of the first list (a look saved before 0.5.30) are in this one. */
const OLDER_SKIN = [0, 2, 3, 5, 8, 10];

/** Heights a look may have, as a share of the usual. */
// (Wide enough for a halfling at 0.58 of a human, which a race preset sets.)
export const HEIGHTS = [0.55, 1.15];

const isColour = (value) => Number.isInteger(value) && value >= 0 && value <= 0xffffff;
const isRecord = (value) => !!value && typeof value === "object" && !Array.isArray(value);
/** What a pack's piece or hair style id may be (packs.js reads them the same way), and a pack's package id. */
export const PIECE_ID = /^[a-z0-9_]{1,64}$/u;
const PACK_ID = /^3d-avatar-maker-[a-z0-9-]{1,80}$/u;
/** An id a look may keep while no installed pack has it: well-formed, and not one of every object's own names. */
const keepable = (id) => typeof id === "string" && PIECE_ID.test(id) && !(id in Object.prototype);
const shortText = (value, most) =>
  typeof value === "string" && value.trim() && value.length <= most ? value.trim() : null;

/**
 * A look as saved or sent, made safe: only the choices there are, each one of its menu (or left out).
 * Returns {} for anything else. (A look saved when a colour belonged to its outfit, with a ranger's
 * colour under `colour`, is read as that.)
 */
/** The avatars a look can ask for by name (models.js MODEL_KINDS and BUILT_IN). */
export const AVATARS = ["vrm", "glb-fbx", "mmd", "builtin"];

export function checkLook(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const look = {};
  const outfit = (value) => Object.hasOwn(OUTFITS, value);
  if (outfit(raw.outfit)) look.outfit = raw.outfit;
  for (const [piece] of PIECES) if (PIECE_KINDS.includes(raw[piece])) look[piece] = raw[piece];
  for (const [extra] of EXTRAS) if (typeof raw[extra] === "boolean") look[extra] = raw[extra];
  for (const [kind, field] of Object.entries(COLOUR_FIELD)) {
    const colours = OUTFITS[kind].colours.map(([name]) => name);
    const chosen = [raw[field], raw.colour].find((value) => colours.includes(value));
    if (chosen) look[field] = chosen;
  }
  // A colour of its own for any piece. (A look saved with one tint for all the clothes has it on each.)
  const tints = {};
  for (const [piece] of [...PIECES, ...EXTRAS]) {
    const colour = isRecord(raw.tints) && isColour(raw.tints[piece]) ? raw.tints[piece] : raw.tint;
    if (isColour(colour)) tints[piece] = colour;
  }
  if (Object.keys(tints).length) look.tints = tints;
  const hair = Object.hasOwn(OLDER_HAIR, raw.hair) ? OLDER_HAIR[raw.hair] : raw.hair;
  // (A style no installed pack has is kept, not worn: it comes back when its pack is installed again.)
  if (HAIRSTYLES.some(([style]) => style === hair) || (keepable(hair) && !Object.hasOwn(SLOT_OF, hair)))
    look.hair = hair;
  const within = (value, count) => Number.isInteger(value) && value >= 0 && value < count;
  if (within(raw.hairColour, HAIR_COLOURS.length)) look.hairColour = raw.hairColour;
  if (isColour(raw.hairTint)) look.hairTint = raw.hairTint;
  // (`skinSet` says the number is from this list; without it, it's from the first six.)
  const skin = raw.skinSet === 2 ? raw.skin : OLDER_SKIN[raw.skin];
  if (within(skin, SKIN_TONES.length)) Object.assign(look, { skin, skinSet: 2 });
  if (isColour(raw.skinTint)) look.skinTint = raw.skinTint;
  // The base avatar's age, skin picture, brow and lash styles and eye picture (avatar.js).
  if ([...SKINS, ...COMMUNITY_SKINS].some(([kind]) => kind === raw.skin)) look.skin = raw.skin;
  if (AGES.some(([age]) => age === raw.age)) look.age = raw.age;
  for (const [field, count] of [
    ["brows", BROWS],
    ["lashes", LASHES],
  ])
    if (Number.isFinite(raw[field])) look[field] = Math.max(1, Math.min(count, Math.round(raw[field])));
  if (raw.eyePicture === TINT || EYE_PICTURES.some(([picture]) => picture === raw.eyePicture))
    look.eyePicture = raw.eyePicture;
  if (NAILS.some(([length]) => length === raw.nails)) look.nails = raw.nails;
  if (typeof raw.toenails === "boolean") look.toenails = raw.toenails;
  if (typeof raw.beard === "boolean") look.beard = raw.beard;
  // Which of the kit's two figures someone of the custom gender has (missing: either, by their name).
  if (raw.figure === "male" || raw.figure === "female") look.figure = raw.figure;
  if (Number.isFinite(raw.height)) look.height = Math.max(HEIGHTS[0], Math.min(HEIGHTS[1], Number(raw.height)));
  // Which avatar shows: one of their card's 3D models, or the built-in person (missing: the card's own choice).
  if (AVATARS.includes(raw.avatar)) look.avatar = raw.avatar;
  // The base avatar's own (avatar.js): its body, sliders, colours, underwear, outfit pieces, and the preset it began from.
  if (BODIES.some(([body]) => body === raw.body)) look.body = raw.body;
  // Which kind of body (missing: a human, unless lore or their race says otherwise), and a dragon's wings.
  if (SPECIES.some(([species]) => species === raw.species)) look.species = raw.species;
  if (typeof raw.wings === "boolean") look.wings = raw.wings;
  // A human body's race (missing: human, unless lore or their build says otherwise) and its parts.
  if (RACES.some(([race]) => race === raw.race)) look.race = raw.race;
  for (const [field, list] of RACE_PARTS) if (list.some(([style]) => style === raw[field])) look[field] = raw[field];
  if (typeof raw.tail === "boolean") look.tail = raw.tail;
  for (const [field, list] of [
    ["shape", [...SHAPES, ...FACE, ...FACE_DETAIL, ...BODY_DETAIL, ...RACE_SHAPES, ...ANTHRO_SHAPES]],
    ["limbs", LIMBS],
  ]) {
    const kept = {};
    for (const [key, , least, most] of list) {
      const value = isRecord(raw[field]) ? raw[field][key] : undefined;
      // (A slider with a key of its own below the middle goes all the way down on a body that has it.)
      const lowest = KEY_PAIRS[key]?.[0] ? -1 : least;
      if (Number.isFinite(value)) kept[key] = Math.round(Math.max(lowest, Math.min(most, value)) * 1000) / 1000;
    }
    if (Object.keys(kept).length) look[field] = kept;
  }
  const colours = {};
  for (const [part] of [...AVATAR_COLOURS, ...RACE_COLOURS, ...Object.values(ANTHRO_COLOURS).flat()])
    if (isRecord(raw.colours) && isColour(raw.colours[part])) colours[part] = raw.colours[part];
  if (Object.keys(colours).length) look.colours = colours;
  const underwear = {};
  for (const [field, styles] of [
    ["top", UNDERWEAR_TOPS],
    ["bottom", UNDERWEAR_BOTTOMS],
  ]) {
    const value = isRecord(raw.underwear) ? raw.underwear[field] : undefined;
    if (value === BARE || styles.some(([style]) => style === value)) underwear[field] = value;
  }
  if (Object.keys(underwear).length) look.underwear = underwear;
  // Clothing: known pieces (CLOTHES), the first one a slot; an empty list is nothing on (not the name's
  // everyday clothes). Each piece's part colours, and the way it's worn (a cloak's hood up), when known.
  // A well-formed piece id no installed pack has (its pack was uninstalled) is kept but not worn, at most
  // one for each slot there is, so it's worn again once its pack is back.
  const waiting = [];
  if (Array.isArray(raw.clothes)) {
    const bySlot = new Map();
    for (const piece of raw.clothes) {
      if (Object.hasOwn(SLOT_OF, piece)) {
        if (!bySlot.has(SLOT_OF[piece])) bySlot.set(SLOT_OF[piece], piece);
      } else if (
        keepable(piece) &&
        !HAIRSTYLES.some(([style]) => style === piece) &&
        !waiting.includes(piece) &&
        waiting.length < CLOTH_SLOTS.length
      )
        waiting.push(piece);
    }
    look.clothes = [...bySlot.values(), ...waiting];
  }
  // Which pack each pack piece and hair style worn came from, so the maker can name it while it's missing:
  // { id: { pack, name, label } }, from the installed pack, else as the look recorded it.
  const fromPacks = {};
  for (const id of [...(look.clothes ?? []), ...(look.hair ? [look.hair] : [])]) {
    const own = packEntry(id);
    const said = isRecord(raw.fromPacks) && Object.hasOwn(raw.fromPacks, id) ? raw.fromPacks[id] : null;
    if (own) fromPacks[id] = { pack: own.pack, name: own.packName, label: own.label };
    else if (
      (waiting.includes(id) || (id === look.hair && !HAIRSTYLES.some(([style]) => style === id))) &&
      isRecord(said) &&
      PACK_ID.test(said.pack ?? "")
    )
      fromPacks[id] = {
        pack: said.pack,
        name: shortText(said.name, 80) ?? said.pack,
        label: shortText(said.label, 60) ?? id,
      };
  }
  if (Object.keys(fromPacks).length) look.fromPacks = fromPacks;
  const clothColours = {};
  for (const [piece, colours] of Object.entries(isRecord(raw.clothColours) ? raw.clothColours : {})) {
    if ((!Object.hasOwn(SLOT_OF, piece) && !waiting.includes(piece)) || !isRecord(colours)) continue;
    const kept = {};
    for (const [part] of CLOTH_PARTS) if (isColour(colours[part])) kept[part] = colours[part];
    if (Object.keys(kept).length) clothColours[piece] = kept;
  }
  if (Object.keys(clothColours).length) look.clothColours = clothColours;
  const variants = {};
  for (const [piece, variant] of Object.entries(isRecord(raw.variants) ? raw.variants : {}))
    if (variant && CLOTH_VARIANTS[piece]?.ways.some(([way]) => way === variant)) variants[piece] = variant;
  if (Object.keys(variants).length) look.variants = variants;
  if (typeof raw.preset === "string" && raw.preset.trim()) look.preset = raw.preset.trim().slice(0, PRESET_NAME);
  return look;
}

// ── The base avatar (avatar.js) ──────────────────────────────────────────────
//
// What its look adds, every part optional (missing: from the name, and lore words, keywords.js):
//
//   { body,                          "male" or "female": which of a kind's two models is loaded
//     species,                       "human", or an anthro kind, "wolf" or "dragon" (SPECIES)
//     wings,                         a dragon's wings shown (missing: yes) or left off
//     race,                          a human body's race (RACES): a shape key and proportions of its own
//     facialHair, tusks, horns,      a style of each (FACIAL_HAIR, TUSKS, HORNS), or "none"
//     tail,                          a tiefling's tail shown or left off (missing: a tiefling has one)
//     shape: { weight, muscle, … },  the build and face sliders (SHAPES, FACE, ANTHRO_SHAPES), each within its range
//     limbs: { arms, legs, head },   arm and leg length and head size, as a share of the usual
//     colours: { skin, eyes, … },    each part's colour (0xRRGGBB): AVATAR_COLOURS
//     underwear: { top, bottom },    a style of each (UNDERWEAR_TOPS, UNDERWEAR_BOTTOMS), or "none"
//     clothes: [piece, …],           outfit pieces worn (CLOTHES), one a slot; missing: their work's (avatar.js).
//                                    A pack's piece whose pack isn't installed stays here, not worn
//     clothColours: { piece: { part: 0xRRGGBB } },  a colour of one's own for a piece's part (CLOTH_PARTS)
//     variants: { piece: variant },  another way of wearing a piece (CLOTH_VARIANTS: a cloak's hood up)
//     fromPacks: { id: { pack, name, label } },  the wardrobe pack each pack piece and hair style came from
//     age,                           "young", "middle" or "old" (AGES): shape keys and skins of its own
//     skin,                          a skin picture (SKINS: MakeHuman's), or "custom": colours.skin
//     brows, lashes,                 which style of each (1 … BROWS, 1 … LASHES)
//     eyePicture,                    an eye picture (EYE_PICTURES), or "tint": the grey iris in colours.eyes
//     nails, toenails,               the fingernails' length (NAILS) or "none", and toenails or not (missing: short, on)
//     preset }                       the name of the preset it began from
//
// with `height`, `hair`, `hairColour` and `hairTint` shared with the older kit's look above, and a tone's
// place (`skin` as a number) or `skinTint` read as a skin of one's own when `colours.skin` isn't set, so a
// look saved before keeps its height, skin, hair and colours.

/** The bodies: [value, label]. Every kind (SPECIES) has both. */
export const BODIES = [
  ["male", "Male body"],
  ["female", "Female body"],
];
/**
 * The kinds of body: [value, label]. An anthro kind is a body of its own (kit/generic/avatar/
 * anthro-<kind>-<sex>), built on the human one: its skeleton with tail (and wing) bones, digitigrade legs,
 * a head, parts and shape keys of its own (docs/AVATAR.md).
 */
export const SPECIES = [
  ["human", "Human"],
  ["wolf", "Anthro wolf"],
  ["dragon", "Anthro dragon"],
];
/** An anthro kind's own sizes, with the look's (as a race's are): the wolf's head, made on the human skull's
 * size, looked small on the shoulders without a share more. */
export const SPECIES_SIZES = { wolf: { head: 1.18 } };
/**
 * The races a human body can be, the 5e SRD's (a dragonborn has the dragon body): [value, label, its shape
 * key, how far the key goes, what completes it: the whole figure's size and the legs', arms' and head's, each
 * as a share of a human's]. The key holds what scaling can't give: the build, the girth of trunk and limbs,
 * the hands and feet, and the face (assets/scripts/make_avatar.py RACE_SCALES). So a dwarf, a halfling and a
 * gnome are each their own shape, not a small human. A half-elf is half an elf.
 */
export const RACES = [
  ["human", "Human"],
  ["dwarf", "Dwarf", "race_dwarf", 1, { height: 0.87, legs: 0.7, arms: 0.8, head: 1.18 }],
  ["halfling", "Halfling", "race_halfling", 1, { height: 0.58, legs: 0.86, arms: 0.9, head: 1.2 }],
  ["gnome", "Gnome", "race_gnome", 1, { height: 0.62, legs: 0.85, arms: 0.98, head: 1.4 }],
  ["elf", "Elf", "race_elf", 1, { height: 1, legs: 1.03, arms: 1.02, head: 0.97 }],
  ["halfelf", "Half-elf", "race_elf", 0.5, { height: 1, legs: 1.015, arms: 1.01, head: 0.985 }],
  ["halforc", "Half-orc", "race_halforc", 1, { height: 1.05, legs: 1, arms: 1.03, head: 1 }],
  ["tiefling", "Tiefling", "race_tiefling", 1, { height: 1, legs: 1, arms: 1, head: 1 }],
];
/**
 * The races' shapes as sliders anyone can mix: [look field (the shape key's name), label, least, most, what it
 * changes, its ends]. A race (RACES) is only a preset: it sets one of these, the height and limbs its sizes
 * say, and what that race usually has (racePreset). Nothing about a race is a body of its own.
 */
export const RACE_SHAPES = [
  [
    "race_dwarf",
    "Dwarf build",
    0,
    1,
    "Broad and stocky: thick limbs, big hands, a broad strong face.",
    ["None", "Full"],
  ],
  ["race_halfling", "Halfling build", 0, 1, "A halfling's build and round, youthful face.", ["None", "Full"]],
  ["race_gnome", "Gnome build", 0, 1, "A gnome's build, big nose and round face.", ["None", "Full"]],
  [
    "race_elf",
    "Elf features",
    0,
    1,
    "Slender, with fine features and almond eyes (pointed ears are on the Face tab).",
    ["None", "Full"],
  ],
  ["race_halforc", "Orc features", 0, 1, "Heavy-boned and strong, with a broad nose and jaw.", ["None", "Full"]],
  ["race_tiefling", "Tiefling features", 0, 1, "Sharper cheekbones and a narrower face.", ["None", "Full"]],
];
/**
 * What choosing `race` sets in a look on `body`: its shape slider (the others back to none), its height and
 * limbs, pointed ears for an elf, and what that race usually has (a dwarf man's beard, a half-orc's tusks, a
 * tiefling's horns, tail and skin). All of it stays adjustable after.
 */
export function racePreset(race, body = "female") {
  const [, , key = "", weight = 0, sizes = {}] = RACES.find(([value]) => value === race) ?? RACES[0];
  const shape = Object.fromEntries(RACE_SHAPES.map(([field]) => [field, field === key ? weight : 0]));
  shape.ears = { elf: 1, halfelf: 0.5 }[race] ?? 0;
  const custom = { halforc: HALF_ORC_SKINS[0][0], tiefling: TIEFLING_SKINS[0][0] }[race];
  return {
    race,
    shape,
    height: sizes.height ?? 1,
    limbs: { arms: sizes.arms ?? 1, legs: sizes.legs ?? 1, head: sizes.head ?? 1 },
    facialHair: race === "dwarf" && body === "male" ? "beard-02" : BARE,
    tusks: race === "halforc" ? (body === "male" ? "tusks-02" : "tusks-01") : BARE,
    horns: race === "tiefling" ? "horns-01" : BARE,
    tail: race === "tiefling",
    ...(custom ? { skin: "custom", colours: { skin: custom, eyes: race === "tiefling" ? 0xe8c040 : 0xb08a2a } } : {}),
  };
}
/** What a race is made of: { key, weight, height, legs, arms, head } (a human: no key, every size 1). */
export const raceOf = (race) => {
  const [, , key = "", weight = 0, sizes = {}] = RACES.find(([value]) => value === race) ?? RACES[0];
  return { key, weight, height: 1, legs: 1, arms: 1, head: 1, ...sizes };
};
/** Facial hair, tusks and horns: [value (the model's mesh), label]. Any race may wear any. */
export const FACIAL_HAIR = [
  [BARE, "None"],
  ["moustache-01", "Moustache"],
  ["beard-05", "Moustache and goatee"],
  ["beard-01", "Short beard"],
  ["beard-02", "Full beard"],
  ["beard-03", "Long beard"],
  ["beard-04", "Long beard with braids"],
];
export const TUSKS = [
  [BARE, "None"],
  ["tusks-01", "Small"],
  ["tusks-02", "Large"],
];
export const HORNS = [
  [BARE, "None"],
  ["horns-03", "Nubs"],
  ["horns-01", "Swept back"],
  ["horns-02", "Ram's curl"],
  ["horns-04", "Tall"],
];
/** A race's parts in a look: [field, its list, label, what it is]. */
export const RACE_PARTS = [
  ["facialHair", FACIAL_HAIR, "Facial hair", "A beard or moustache, in the hair's colour."],
  ["tusks", TUSKS, "Tusks", "A half-orc's lower tusks."],
  ["horns", HORNS, "Horns", "A tiefling's horns."],
];
/** A tiefling's skin colours, and a half-orc's, which a name picks among: [hex, label]. */
export const TIEFLING_SKINS = [
  [0xb3423a, "Red"],
  [0x4a6aa8, "Blue"],
  [0x7a4a9a, "Purple"],
];
export const HALF_ORC_SKINS = [
  [0x7d8c6a, "Grey-green"],
  [0x8a8f82, "Grey"],
];
/** The clothing slots an anthro body leaves empty for now: head pieces don't fit a muzzle, nor shoes a paw. */
export const ANTHRO_BARE_SLOTS = new Set(["head", "brow", "feet"]);

// Every slider works one way: its value 0 is the model's own shape, the right is bigger, longer, wider or
// more, and the left smaller, shorter, narrower or less. A two-way slider has the model's shape in the
// middle of its track; a one-way slider has it at the left end. Each says what its two ends are.
// (tests/wanderworld-avatar.regression.mjs measures each key's direction on every body.)

/** The build sliders: [look field, label, least, most, what it changes, its ends: [left, right]]. */
export const SHAPES = [
  ["weight", "Weight", -1, 1, "Thinner to heavier, all over.", ["Thin", "Heavy"]],
  ["muscle", "Muscle", -0.5, 1, "Softer to more muscular.", ["Soft", "Muscular"]],
  ["chest", "Chest", -0.5, 1, "A flatter or fuller chest (her bust).", ["Flat", "Full"]],
  ["hips", "Hips", -0.5, 1, "Narrower or wider hips and seat.", ["Narrow", "Wide"]],
  ["waist", "Waist", -1, 0.5, "A narrower or wider waist.", ["Narrow", "Wide"]],
  ["belly", "Belly", -0.5, 1, "A flatter or rounder belly.", ["Flat", "Round"]],
  ["shoulders", "Shoulders", -0.5, 1, "Narrower or broader shoulders.", ["Narrow", "Broad"]],
  ["neck", "Neck", -0.5, 1, "A slimmer or thicker neck.", ["Slim", "Thick"]],
];
/** The face sliders, the same way. */
export const FACE = [
  ["jaw", "Jaw", -0.5, 1, "A softer or a squarer, stronger jaw and chin.", ["Soft", "Strong"]],
  ["cheeks", "Cheekbones", -0.5, 1, "Flatter or higher, fuller cheekbones.", ["Flat", "Full"]],
  ["nose", "Nose", -0.5, 1, "A smaller or larger nose.", ["Small", "Large"]],
  ["eyes", "Eyes", -0.5, 1, "Smaller or larger eyes.", ["Small", "Large"]],
  ["ears", "Pointed ears", 0, 1, "Round ears to long, pointed ones, as an elf's.", ["Round", "Pointed"]],
];
/**
 * The face in detail: [look field, label, least, most, what it changes, its ends, group]. Each drives two
 * shape keys, `<field>.lo` and `<field>.hi` (assets/scripts/make_avatar.py FACE_DETAIL, MakeHuman's CC0
 * targets), one each side of the face as made. A body made before them has none, and shows none.
 */
export const FACE_GROUPS = [
  ["eyes", "Eyes", "Where the eyes sit and their shape. Eye size is under Face shape."],
  ["brows", "Brows", "The brow line. The brow hair's style and colour are below."],
  ["nose", "Nose", "Its shape in detail. Overall size is under Face shape."],
  ["mouth", "Mouth and lips", ""],
  ["jaw", "Jaw and chin", ""],
  ["cheeks", "Cheeks", ""],
  ["ears", "Ears", "Pointed ears are under Face shape."],
  ["head", "Forehead, head and neck", "Hair and hats follow the head's shape."],
];
export const FACE_DETAIL = [
  ["eye_height", "Height", -1, 1, "Where the eyes sit on the face.", ["Lower", "Higher"], "eyes"],
  ["eye_spacing", "Spacing", -1, 1, "Closer together or further apart.", ["Close", "Wide"], "eyes"],
  ["eye_depth", "Depth", -1, 1, "Standing out or set deep under the brow.", ["Prominent", "Deep-set"], "eyes"],
  ["eye_tilt", "Tilt", -1, 1, "The outer corners lower or higher than the inner.", ["Down", "Up"], "eyes"],
  ["eye_opening", "Opening", -1, 1, "Narrower or wider open.", ["Narrow", "Wide"], "eyes"],
  ["eyelid", "Eyelids", -1, 1, "More of the upper lid showing, or a heavier, hooded lid.", ["Open", "Hooded"], "eyes"],
  ["eye_inner_fold", "Inner fold", -1, 1, "The fold of skin over the inner corner.", ["Less", "More"], "eyes"],
  ["eye_bags", "Under the eyes", -1, 1, "Smooth or puffy under the eyes.", ["Smooth", "Puffy"], "eyes"],
  ["brow_height", "Height", -1, 1, "The brows lower or higher.", ["Lower", "Higher"], "brows"],
  ["brow_angle", "Angle", -1, 1, "The brows' outer ends lower or higher.", ["Down", "Up"], "brows"],
  ["brow_ridge", "Ridge", -1, 1, "A flat brow, or a heavy ridge standing out.", ["Flat", "Heavy"], "brows"],
  ["nose_length", "Length", -1, 1, "A shorter or longer nose, top to tip.", ["Short", "Long"], "nose"],
  ["nose_width", "Width", -1, 1, "A narrower or wider nose.", ["Narrow", "Wide"], "nose"],
  ["nose_depth", "Projection", -1, 1, "How far the nose stands out from the face.", ["Flat", "Projecting"], "nose"],
  ["nose_bridge", "Bridge", -1, 1, "A scooped or a humped bridge.", ["Scooped", "Humped"], "nose"],
  ["nose_tip", "Tip", -1, 1, "The tip turned down or up.", ["Down", "Up"], "nose"],
  ["nose_tip_width", "Tip width", -1, 1, "A fine or a broad tip.", ["Fine", "Broad"], "nose"],
  ["nostrils", "Nostrils", -1, 1, "Narrower or flared nostrils.", ["Narrow", "Flared"], "nose"],
  ["nose_height", "Height", -1, 1, "The nose lower or higher on the face.", ["Lower", "Higher"], "nose"],
  ["mouth_width", "Width", -1, 1, "A narrower or wider mouth.", ["Narrow", "Wide"], "mouth"],
  ["mouth_height", "Height", -1, 1, "The mouth lower or higher on the face.", ["Lower", "Higher"], "mouth"],
  ["mouth_depth", "Depth", -1, 1, "The mouth set back or pushed forward.", ["Back", "Forward"], "mouth"],
  ["upper_lip", "Upper lip", -1, 1, "A thinner or fuller upper lip.", ["Thin", "Full"], "mouth"],
  ["lower_lip", "Lower lip", -1, 1, "A thinner or fuller lower lip.", ["Thin", "Full"], "mouth"],
  ["cupids_bow", "Cupid's bow", -1, 1, "A flat or a deeply curved upper lip line.", ["Flat", "Curved"], "mouth"],
  ["mouth_corners", "Corners", -1, 1, "The corners of the mouth turned down or up.", ["Down", "Up"], "mouth"],
  [
    "jaw_forward",
    "Jaw forward",
    -1,
    1,
    "The lower jaw back (an overbite) or forward (an underbite).",
    ["Back", "Forward"],
    "jaw",
  ],
  ["jaw_width", "Jaw width", -1, 1, "A narrower or wider jaw at its angles.", ["Narrow", "Wide"], "jaw"],
  ["chin_height", "Chin height", -1, 1, "A shorter or longer chin.", ["Short", "Long"], "jaw"],
  ["chin_width", "Chin width", -1, 1, "A pointed or a broad chin.", ["Pointed", "Broad"], "jaw"],
  ["chin_prominence", "Chin forward", -1, 1, "A receding or a prominent chin.", ["Receding", "Prominent"], "jaw"],
  ["chin_cleft", "Cleft", -1, 1, "A smooth chin or a cleft in it.", ["Smooth", "Cleft"], "jaw"],
  ["cheekbones", "Cheekbones", -1, 1, "Flat or high, strong cheekbones.", ["Flat", "High"], "cheeks"],
  ["cheek_fullness", "Fullness", -1, 1, "Thinner or fuller cheeks.", ["Thin", "Full"], "cheeks"],
  ["cheek_hollows", "Hollows", -1, 1, "Full under the cheekbones, or hollow.", ["Full", "Hollow"], "cheeks"],
  ["ear_size", "Size", -1, 1, "Smaller or larger ears.", ["Small", "Large"], "ears"],
  ["ear_angle", "Angle", -1, 1, "Ears lying flat or standing out.", ["Flat", "Out"], "ears"],
  ["ear_lobes", "Lobes", -1, 1, "Smaller or larger lobes.", ["Small", "Large"], "ears"],
  ["ear_height", "Height", -1, 1, "The ears lower or higher.", ["Lower", "Higher"], "ears"],
  ["forehead_height", "Forehead height", -1, 1, "A lower or higher forehead.", ["Low", "High"], "head"],
  ["forehead_slope", "Forehead slope", -1, 1, "A sloping or an upright forehead.", ["Sloping", "Upright"], "head"],
  ["temples", "Temples", -1, 1, "Hollow or full temples.", ["Hollow", "Full"], "head"],
  ["head_width", "Head width", -1, 1, "A narrower or wider head.", ["Narrow", "Wide"], "head"],
  ["head_height", "Head height", -1, 1, "A shorter or taller head.", ["Short", "Tall"], "head"],
  ["head_depth", "Head depth", -1, 1, "A shallower or deeper head, front to back.", ["Shallow", "Deep"], "head"],
  ["neck_length", "Neck length", -1, 1, "A shorter or longer neck.", ["Short", "Long"], "head"],
  // One-way shapes from MakeHuman's community packs (make_avatar.py's; each only `<field>.hi`, 0 the face as made).
  ["cheeks_round_high", "Round, high", 0, 1, "Round, chipmunk cheeks, high on the face.", ["None", "Round"], "cheeks"],
  ["cheeks_round_low", "Round, low", 0, 1, "Round, chipmunk cheeks, lower down.", ["None", "Round"], "cheeks"],
  [
    "cheekbones_chubby",
    "Soft cheekbones",
    0,
    1,
    "High cheekbones with soft, full flesh over them.",
    ["None", "Full"],
    "cheeks",
  ],
  ["jowls", "Jowls", 0, 1, "Flesh hanging at the jaw line, as with age.", ["None", "Heavy"], "cheeks"],
  ["cheeks_sunken", "Sunken", 0, 1, "Cheeks sunk in below the cheekbones.", ["None", "Sunken"], "cheeks"],
  ["ears_flared", "Flared", 0, 1, "The top of the ears flaring out.", ["None", "Flared"], "ears"],
  ["ears_flatter", "Flatter", 0, 1, "The ears' folds flatter.", ["None", "Flat"], "ears"],
  ["lobes_out", "Lobes out", 0, 1, "The lobes turned out from the head.", ["None", "Out"], "ears"],
  ["detail_ears", "Ear detail", 0, 1, "Finer folds and rims in the ears.", ["Plain", "Detailed"], "ears"],
  ["detail_ear_inner", "Inner ear", 0, 1, "A deeper bowl inside the ear.", ["Plain", "Deep"], "ears"],
  ["detail_ear_canal", "Ear canal", 0, 1, "An opening into the ear.", ["None", "Open"], "ears"],
  ["nose_bulbous", "Bulbous", 0, 1, "A round, bulbous tip.", ["None", "Bulbous"], "nose"],
  ["nose_base_wide", "Wide base", 0, 1, "The nose wider where it meets the face.", ["None", "Wide"], "nose"],
  [
    "nose_greek",
    "Greek",
    0,
    1,
    "A straight line from the brow to the tip, as on a Greek statue.",
    ["None", "Greek"],
    "nose",
  ],
  ["nostrils_up", "Nostrils up", 0, 1, "Nostrils turned up, showing more from the front.", ["None", "Up"], "nose"],
  ["nostrils_small", "Small nostrils", 0, 1, "Smaller nostril openings.", ["None", "Small"], "nose"],
  ["nostrils_round", "Round nostrils", 0, 1, "Rounder wings at the sides of the nostrils.", ["None", "Round"], "nose"],
  [
    "detail_nose_crease",
    "Crease",
    0,
    1,
    "The crease where the nostril wings meet the cheek.",
    ["Plain", "Creased"],
    "nose",
  ],
  [
    "detail_columella",
    "Columella",
    0,
    1,
    "A straight strip of skin between the nostrils.",
    ["Plain", "Straight"],
    "nose",
  ],
  ["detail_nostril_rims", "Nostril rims", 0, 1, "Sharper rims round the nostrils.", ["Soft", "Sharp"], "nose"],
];
/** The body in detail, the same way (make_avatar.py BODY_DETAIL and, hers only, BREAST_DETAIL). */
export const BODY_GROUPS = [
  ["arms", "Arms", "Arm length is under Proportions."],
  ["hands", "Hands", "The nails' length and colour are under Skin and eyes."],
  ["legs", "Legs", "Leg length is under Proportions."],
  ["torso", "Torso and hips", ""],
  ["bust", "Bust", "Its size is the Chest slider above."],
];
export const BODY_DETAIL = [
  ["upper_arms", "Upper arms", -1, 1, "Slimmer or thicker upper arms.", ["Slim", "Thick"], "arms"],
  ["forearms", "Forearms", -1, 1, "Slimmer or thicker forearms.", ["Slim", "Thick"], "arms"],
  ["arm_muscle", "Arm muscle", -1, 1, "Softer or more muscular arms.", ["Soft", "Muscular"], "arms"],
  ["thighs", "Thighs", -1, 1, "Slimmer or thicker thighs.", ["Slim", "Thick"], "legs"],
  ["calves", "Calves", -1, 1, "Slimmer or thicker calves.", ["Slim", "Thick"], "legs"],
  ["leg_muscle", "Leg muscle", -1, 1, "Softer or more muscular legs.", ["Soft", "Muscular"], "legs"],
  ["buttocks", "Buttocks", -1, 1, "Flatter or fuller buttocks.", ["Flat", "Full"], "torso"],
  [
    "torso_taper",
    "Taper",
    -1,
    1,
    "A straight torso, or one narrowing from the shoulders.",
    ["Straight", "V-shaped"],
    "torso",
  ],
  ["back_muscle", "Back", -1, 1, "A narrower or broader, more muscled back.", ["Narrow", "Broad"], "torso"],
  ["stomach_tone", "Stomach", -1, 1, "A softer or more toned stomach.", ["Soft", "Toned"], "torso"],
  [
    "hip_width",
    "Hip bones",
    -1,
    1,
    "Narrower or wider hip bones (Hips above is the hips and seat).",
    ["Narrow", "Wide"],
    "torso",
  ],
  ["bust_height", "Height", -1, 1, "The bust lower or higher.", ["Lower", "Higher"], "bust"],
  ["bust_spacing", "Spacing", -1, 1, "Closer together or further apart.", ["Close", "Apart"], "bust"],
  ["bust_shape", "Shape", -1, 1, "Rounder or more pointed.", ["Round", "Pointed"], "bust"],
  ["bust_lift", "Lift", -1, 1, "Fuller below or above.", ["Low", "Lifted"], "bust"],
  // One-way shapes from MakeHuman's community packs, as in FACE_DETAIL.
  ["detail_upper_arms", "Upper arm shape", 0, 1, "The shape of the upper arm's muscles.", ["Plain", "Shaped"], "arms"],
  ["detail_forearms", "Forearm shape", 0, 1, "The shape of the forearm's muscles.", ["Plain", "Shaped"], "arms"],
  ["detail_wrists", "Wrist bone", 0, 1, "The bone at the outside of the wrist.", ["Plain", "Showing"], "arms"],
  ["detail_armpits", "Armpits", 0, 1, "A truer hollow under the arm.", ["Plain", "Shaped"], "arms"],
  ["elbow_dimples", "Elbow dimples", 0, 1, "Soft dimples at the elbows.", ["None", "Dimpled"], "arms"],
  ["detail_fingers", "Fingers", 0, 1, "Truer fingers, with their joints.", ["Plain", "Shaped"], "hands"],
  ["detail_palm", "Palm", 0, 1, "The pad at the little finger's side of the palm.", ["Plain", "Shaped"], "hands"],
  ["detail_thumb", "Thumb pad", 0, 1, "The pad at the base of the thumb.", ["Plain", "Shaped"], "hands"],
  ["knuckles_knobby", "Knuckles", 0, 1, "Knobbly knuckles, as with age or hard work.", ["Smooth", "Knobbly"], "hands"],
];
/**
 * Ready-made shapes for a part of the face: { group: [[name, { field: value }], …] }. Choosing one sets
 * its group's sliders (those it doesn't name back to the face as made), and may set a slider of the face's
 * overall shape too (eye or nose size). Everything stays adjustable after. The "shape" group is the whole
 * face's outline and sets sliders across the jaw, cheeks and head.
 */
export const FACE_PRESETS = {
  shape: [
    ["Round", { head_width: 0.4, cheek_fullness: 0.6, jaw_width: -0.2, chin_width: 0.2, chin_height: -0.3 }],
    ["Oval", { head_height: 0.3, jaw_width: -0.3, chin_width: -0.2 }],
    ["Square", { jaw_width: 0.8, chin_width: 0.6, head_width: 0.3 }],
    ["Heart", { jaw_width: -0.6, chin_width: -0.8, temples: 0.5, forehead_height: 0.3 }],
    ["Long", { head_height: 0.7, chin_height: 0.6, head_width: -0.3 }],
    ["Diamond", { cheekbones: 0.8, jaw_width: -0.4, chin_width: -0.6, temples: -0.4 }],
  ],
  eyes: [
    ["Almond", { eye_opening: -0.3, eye_tilt: 0.3 }],
    ["Round", { eye_opening: 0.6, eyelid: -0.4 }],
    ["Upturned", { eye_tilt: 0.8 }],
    ["Downturned", { eye_tilt: -0.7, eyelid: 0.3 }],
    ["Hooded", { eyelid: 0.9, eye_opening: -0.2 }],
    ["Deep-set", { eye_depth: 0.8 }],
    ["Wide-set", { eye_spacing: 0.7 }],
    ["Close-set", { eye_spacing: -0.7 }],
    ["Inner fold", { eye_inner_fold: 0.9, eyelid: 0.4, eye_opening: -0.3 }],
  ],
  brows: [
    ["Arched", { brow_angle: 0.6, brow_height: 0.3 }],
    ["Straight", { brow_angle: -0.3 }],
    ["Heavy", { brow_ridge: 0.8, brow_height: -0.4 }],
    ["Raised", { brow_height: 0.8 }],
  ],
  nose: [
    ["Button", { nose_length: -0.5, nose_tip: 0.5, nose_tip_width: 0.3, nose_depth: -0.3 }],
    ["Roman", { nose_bridge: 0.8, nose_length: 0.4, nose_tip: -0.3 }],
    ["Snub", { nose_tip: 0.9, nose_length: -0.4 }],
    ["Narrow", { nose_width: -0.6, nose_tip_width: -0.5, nostrils: -0.4 }],
    ["Broad", { nose_width: 0.6, nostrils: 0.7, nose_tip_width: 0.5 }],
    ["Scooped", { nose_bridge: -0.8, nose_tip: 0.4 }],
  ],
  mouth: [
    ["Full lips", { upper_lip: 0.8, lower_lip: 0.8 }],
    ["Thin lips", { upper_lip: -0.7, lower_lip: -0.6 }],
    ["Wide", { mouth_width: 0.7 }],
    ["Small", { mouth_width: -0.6, upper_lip: 0.2, lower_lip: 0.2 }],
    ["Bow-shaped", { cupids_bow: 0.9, upper_lip: 0.4 }],
    ["Smiling corners", { mouth_corners: 0.6 }],
  ],
  jaw: [
    ["Strong", { jaw_width: 0.7, chin_width: 0.5, chin_prominence: 0.4 }],
    ["Soft", { jaw_width: -0.6, chin_width: -0.3 }],
    ["Pointed chin", { chin_width: -0.9, chin_height: 0.3 }],
    ["Underbite", { jaw_forward: 0.9, chin_prominence: 0.4 }],
    ["Overbite", { jaw_forward: -0.8, chin_prominence: -0.4 }],
    ["Cleft chin", { chin_cleft: 0.9 }],
  ],
  cheeks: [
    ["High cheekbones", { cheekbones: 0.8, cheek_hollows: 0.3 }],
    ["Full cheeks", { cheek_fullness: 0.8, cheek_hollows: -0.4 }],
    ["Gaunt", { cheek_fullness: -0.6, cheek_hollows: 0.8, temples: -0.3 }],
  ],
  ears: [
    ["Small and flat", { ear_size: -0.5, ear_angle: -0.6 }],
    ["Large", { ear_size: 0.7, ear_lobes: 0.4 }],
    ["Sticking out", { ear_angle: 0.9 }],
  ],
  head: [
    ["High forehead", { forehead_height: 0.8 }],
    ["Long neck", { neck_length: 0.8 }],
    ["Short neck", { neck_length: -0.7 }],
  ],
};
/**
 * Styles: [value, label, what it says, the look it sets]. A style is a starting point on the same body:
 * its face and head proportions (every face slider it doesn't name goes back to the face as made). How
 * the avatar is drawn (flat anime shading with outlines) is the saved file's to carry and comes later.
 */
export const STYLES = [
  ["semireal", "Semi-real", "The body and face as made.", { shape: {}, limbs: { head: 1 } }],
  [
    "anime",
    "Anime proportions (trial)",
    "Large eyes set low and apart, a small nose and mouth, a narrow pointed chin and a slightly larger head. A trial on the semi-real head: the anime look itself (its eyes, flat shading and outlines) is still to come.",
    {
      shape: {
        eyes: 1,
        eye_height: -0.35,
        eye_spacing: 0.35,
        eye_opening: 0.7,
        eye_tilt: 0.15,
        eyelid: -0.5,
        eye_depth: -0.5,
        brow_ridge: -0.8,
        brow_height: 0.4,
        nose: -0.5,
        nose_width: -0.6,
        nose_depth: -0.6,
        nose_length: -0.4,
        nostrils: -0.8,
        nose_tip: 0.4,
        nose_bridge: -0.4,
        mouth_width: -0.5,
        upper_lip: -0.5,
        lower_lip: -0.2,
        jaw: -0.5,
        jaw_width: -0.7,
        chin_width: -0.8,
        chin_height: -0.2,
        chin_prominence: -0.2,
        cheeks: -0.3,
        cheekbones: -0.4,
        cheek_fullness: 0.3,
        cheek_hollows: -0.6,
        forehead_height: 0.5,
        head_height: 0.2,
        head_width: 0.1,
      },
      limbs: { head: 1.1 },
    },
  ],
];
/** The face's fields a style sets (those it doesn't name go back to the face as made). */
// (Neither touches the finer anatomy, the detail_ sliders.)
const shaping = ([field]) => !field.startsWith("detail_");
export const STYLE_FIELDS = [...FACE.map(([field]) => field), ...FACE_DETAIL.filter(shaping).map(([field]) => field)];
/** The fields a preset of `group` puts back to the face as made when it doesn't name them. */
export const presetFields = (group) =>
  group === "shape"
    ? FACE_DETAIL.filter(shaping)
        .filter(([, , , , , , part]) => ["jaw", "cheeks", "head"].includes(part))
        .map(([field]) => field)
    : FACE_DETAIL.filter(shaping)
        .filter(([, , , , , , part]) => part === group)
        .map(([field]) => field);
/** The anthro bodies' own sliders, the same way, and the card's section each is in. A body has those its
 *  model has the shape keys for (hasSlider). */
export const ANTHRO_SHAPES = [
  ["muzzle", "Muzzle", -1, 1, "A shorter or a longer muzzle.", ["Short", "Long"], "face"],
  ["earSize", "Ears", -1, 1, "Smaller or taller ears.", ["Small", "Tall"], "face"],
  ["horns", "Horns", -1, 1, "Smaller or larger horns.", ["Small", "Large"], "face"],
  ["tailLength", "Tail length", -1, 1, "A shorter or a longer tail.", ["Short", "Long"], "build"],
  ["tail", "Tail thickness", 0, 1, "A slim tail to a thicker one.", ["Slim", "Thick"], "build"],
];
/**
 * The shape keys a slider drives when they aren't one of its own name: [the key below the middle, the key
 * above]. With a key below the middle the slider is two-way, each side its own key; with none (null) the
 * one key is also run backwards, as far as the slider's least.
 */
const KEY_PAIRS = {
  weight: ["thin", "heavy"],
  neck: ["neck_slim", "neck"],
  ears: [null, "ears_pointed"],
  muzzle: ["muzzle_short", "muzzle"],
  earSize: ["ears_small", "ears_tall"],
  horns: ["horns_small", "horns"],
  tailLength: ["tail_short", "tail_long"],
  // (Eye size's smaller end came with the face in detail.)
  eyes: ["eye_size.lo", "eyes"],
  ...Object.fromEntries([...FACE_DETAIL, ...BODY_DETAIL].map(([field]) => [field, [`${field}.lo`, `${field}.hi`]])),
};
/** The keys `slider` drives on `sex`'s body: [below the middle (or null), above]. (Her chest key is "bust".) */
export const sliderKeys = (slider, sex) =>
  KEY_PAIRS[slider] ?? [null, slider === "chest" && sex === "female" ? "bust" : slider];
/** Whether a body with shape keys `keys` has `slider`. */
export const hasSlider = (slider, keys, sex) => keys.includes(sliderKeys(slider, sex)[1]);
/** A slider's [least, most] on a body with shape keys `keys`: all the way down when it has the key for it. */
export const sliderRange = ([slider, , least, most], keys) => [
  keys.includes(KEY_PAIRS[slider]?.[0]) ? -1 : least,
  most,
];
/**
 * Where a slider's value is on its track, and back: the track runs from −1 to 1 with the model's own shape
 * in the middle (a one-way slider's from 0 to 1), whatever the key's own reach each way (`range`:
 * sliderRange's). So a key that only runs backwards half way (muscle, to −0.5) still fills its left half.
 */
export const toTrack = (value, [least, most]) => (value < 0 ? -value / least : value / most);
export const fromTrack = (at, [least, most]) => (at < 0 ? -at * least : at * most);
/** Arm and leg length and head size: [field, label, least, most, what it changes, its ends]; 1, the middle,
 *  is the model's own. */
export const LIMBS = [
  ["arms", "Arm length", 0.75, 1.2, "Shorter or longer arms, no thicker.", ["Short", "Long"]],
  ["legs", "Leg length", 0.65, 1.2, "Shorter or longer legs, no thicker. Longer legs stand taller.", ["Short", "Long"]],
  ["head", "Head size", 0.85, 1.45, "A smaller or larger head (and its hair).", ["Small", "Large"]],
];
/**
 * Every slider at the model's own shape (but the finer anatomy, below): where a new avatar starts, and
 * what the Look card's Reset goes back to. (Townsfolk start from their name instead, so a crowd differs: avatar.js avatarLook.)
 */
export const NEUTRAL_LOOK = {
  shape: {
    ...Object.fromEntries(
      [...SHAPES, ...FACE, ...FACE_DETAIL, ...BODY_DETAIL, ...RACE_SHAPES, ...ANTHRO_SHAPES].map(([key]) => [key, 0]),
    ),
    // (Except the finer anatomy, which a new avatar starts with partly on: truer ears, nose and hands.)
    detail_ears: 1,
    detail_ear_inner: 0.5,
    detail_ear_canal: 0.6,
    detail_nose_crease: 0.6,
    detail_nostril_rims: 0.5,
    detail_fingers: 1,
    detail_palm: 0.6,
    detail_thumb: 0.6,
    detail_armpits: 1,
    detail_wrists: 0.5,
  },
  limbs: Object.fromEntries(LIMBS.map(([key]) => [key, 1])),
  height: 1,
};

// ── MakeHuman's system assets (CC0): ages, skins, eye pictures, brows and lashes ──
/** Ages: [value, label]. All grown-ups; middle-aged and old have shape keys and skins of their own. */
export const AGES = [
  ["young", "Young adult"],
  ["middle", "Middle-aged (about 50)"],
  ["old", "Old (about 72)"],
];
/** Skins: [value, label]. MakeHuman's three skin pictures, each in every age, or the plain skin in a colour of one's own. */
export const SKINS = [
  ["caucasian", "Caucasian"],
  ["african", "African"],
  ["asian", "Asian"],
  ["custom", "A colour of your own"],
];
/**
 * Skins from MakeHuman's community packs (CC0, make_avatar.py COMMUNITY_SKINS; authors in kit/CREDITS.md):
 * [value, label, the bodies that have it]. Each is one picture at its own age (avatar-<sex>-skin-<value>),
 * whatever the age chosen; the age's shape keys still apply.
 */
export const COMMUNITY_SKINS = [
  ["creamy", "Creamy", ["female"]],
  ["redhead", "Redhead's", ["female"]],
  ["freckles", "Light, freckled", ["female", "male"]],
  ["ginger", "Light, ginger", ["female", "male"]],
  ["bronze", "Bronzed", ["female", "male"]],
  ["eurasian-young", "Eurasian, young", ["female"]],
  ["eurasian-middle", "Eurasian, middle-aged", ["female"]],
  ["eurasian-old", "Eurasian, old", ["female", "male"]],
  ["aksel", "Fair, weathered", ["male"]],
  ["natural-makeup", "Light, natural make-up", ["female"]],
  ["classic-makeup", "Light, make-up", ["female"]],
  ["violet-makeup", "Light, violet make-up", ["female"]],
  ["bronze-makeup", "Bronzed, make-up", ["female"]],
  ["eyeliner", "Light, eyeliner", ["male"]],
  ["goth-makeup", "Light, goth make-up", ["male"]],
  ["emo-eyes", "Light, dark eye make-up", ["male"]],
  ["tattooed", "Tattooed", ["male"]],
];
/** The skins `sex`'s body has: MakeHuman's three, its community ones, then a colour of one's own. */
export const skinsFor = (sex) => [
  ...SKINS.slice(0, -1),
  ...COMMUNITY_SKINS.filter(([, , bodies]) => bodies.includes(sex)).map(([value, label]) => [value, label]),
  ...SKINS.slice(-1),
];
/** A skin's picture in the kit (no extension), or null for a colour of one's own. */
export const skinPicture = (skin, sex, age) =>
  skin === "custom"
    ? null
    : COMMUNITY_SKINS.some(([value]) => value === skin)
      ? `avatar-${sex}-skin-${skin}`
      : `avatar-${sex}-skin-${age}-${skin}`;
/** Eye pictures: [value, label], in the order of the kit's avatar-eyes.webp (the packer's). "tint" is the
 *  grey iris in the eye colour. (MakeHuman's "brown" reads reddish, so its "brownlight" is the brown.) */
export const TINT = "tint";
export const EYE_PICTURES = [
  ["brownlight", "Brown"],
  ["brown", "Red-brown"],
  ["green", "Green"],
  ["bluegreen", "Blue-green"],
  ["blue", "Blue"],
  ["lightblue", "Light blue"],
  ["deepblue", "Deep blue"],
  ["grey", "Grey"],
  ["ice", "Ice"],
  // From MakeHuman's community packs (CC0; make_avatar.py COMMUNITY_EYES): by bobby_03, Mindfront, Nyloseth,
  // Hatshj and spamrakuen.
  ["amber", "Amber"],
  ["hazel", "Hazel"],
  ["seabreeze", "Sea green"],
  ["clearblue", "Clear blue"],
  ["steel", "Steel grey"],
  ["darkbrown", "Dark brown"],
  ["sapphire", "Sapphire"],
  ["cat-blue", "Cat's eye, blue"],
  ["cat-brown", "Cat's eye, brown"],
  ["cat-green", "Cat's eye, green"],
  ["cat-sapphire", "Cat's eye, sapphire"],
  ["cat-yellow", "Cat's eye, yellow"],
  ["reptile", "Reptile, fiery"],
  ["dragon", "Dragon"],
  ["anime-navy", "Anime, navy (trial)"],
];
/** How many eye pictures avatar-eyes.webp has across (the packer's grid). */
export const EYE_GRID = 5;
/** How many brow and lash styles the bodies have (eyebrows-01 … and eyelashes-01 …). */
export const BROWS = 16;
export const LASHES = 6;
/** Names for the styles baked from Mindfront's strands (make_avatar.py HAIR_STYLES); the rest are "Style <n>". */
export const BROW_NAMES = {
  13: "Thin, fine hairs",
  14: "Natural, fine hairs",
  15: "Thick, fine hairs",
  16: "Arched, fine hairs",
};
export const LASH_NAMES = { 5: "Natural, fine", 6: "Full, fine" };

/** Eye colours: [hex, label]. */
export const EYE_COLOURS = [
  [0x3b2a1e, "Dark brown"],
  [0x6b4a2a, "Brown"],
  [0x8a6a3a, "Hazel"],
  [0x9a7a2a, "Amber"],
  [0x4f7a3f, "Green"],
  [0x3f6f8a, "Blue"],
  [0x7a8a9a, "Grey"],
  [0x5a4a7a, "Violet"],
];
/** Lip colours: [hex, label]. (A name alone gives lips a little redder than the skin.) */
export const LIP_COLOURS = [
  [0xb8746c, "Rose"],
  [0xc98a7e, "Pale pink"],
  [0x9a5048, "Deep rose"],
  [0xa83a3a, "Red"],
  [0x6a2a3a, "Berry"],
  [0x7a4a3a, "Brown"],
  [0x4a2a2a, "Dark"],
];
/** Nail colours: [hex, label]. */
export const NAIL_COLOURS = [
  [0xf0c8bc, "Natural"],
  [0xf4e8e0, "Pale"],
  [0xc0303a, "Red"],
  [0xd890a8, "Pink"],
  [0x3a5a9a, "Blue"],
  [0x2a6a4a, "Green"],
  [0x1a1a1a, "Black"],
];
/** Cloth colours for underwear: [hex, label]. */
export const CLOTH_COLOURS = [
  [0xe8e4dc, "Off-white"],
  [0xf6f6f6, "White"],
  [0xd8c8a8, "Cream"],
  [0x8a8a8a, "Grey"],
  [0x2a2a2e, "Black"],
  [0x3a4a7a, "Navy"],
  [0x8a3a3a, "Red"],
  [0x4a6a4a, "Green"],
  [0x6a4a32, "Brown"],
  [0xd0a0b0, "Pink"],
  [0x6a4a7a, "Violet"],
];
/** The parts that can be coloured: [field, label, its list, what it changes]. */
export const AVATAR_COLOURS = [
  ["skin", "Skin", SKIN_TONES, "The skin all over."],
  ["eyes", "Eyes", EYE_COLOURS, "The colour of the eyes."],
  ["lips", "Lips", LIP_COLOURS, "The lips."],
  ["nails", "Nails", NAIL_COLOURS, "Finger and toe nails."],
  ["brows", "Brows", HAIR_COLOURS, "Eyebrows and lashes (else the hair's colour, a little darker)."],
  ["underwear", "Underwear", CLOTH_COLOURS, "The underwear's cloth."],
];

// ── The anthro bodies' colours: each part its own, over the model's grey texture ──
/** Wolf coats, natural ones: [hex, label, the lighter fur that goes with it]. */
export const FUR_COLOURS = [
  [0x6e6862, "Grey", 0xe8dfd0],
  [0x8f8a80, "Timber grey", 0xe8dfd0],
  [0xa9a8a4, "Silver", 0xf4f1ea],
  [0xe9e6de, "White", 0xf4f1ea],
  [0x24211f, "Black", 0x3a3633],
  [0x5c4433, "Brown", 0xc9a97c],
  [0x8a5230, "Red", 0xe8dfd0],
  [0xa5825a, "Tawny", 0xe8dfd0],
  [0xd8c8a8, "Cream", 0xf4f1ea],
];
/** The lighter fur (muzzle, chest, belly, inner limbs): [hex, label]. */
export const FUR2_COLOURS = [
  [0xe8dfd0, "Cream"],
  [0xf4f1ea, "White"],
  [0xc2beb6, "Pale grey"],
  [0xc9a97c, "Tan"],
  [0x7d7a74, "Grey"],
  [0x3a3633, "Charcoal"],
];
export const NOSE_COLOURS = [
  [0x2b2725, "Black"],
  [0x3d2b22, "Dark brown"],
  [0x6a4638, "Liver"],
  [0xc08a84, "Pink"],
];
/** A wolf's or a dragon's eyes: [hex, label]. A name alone picks from the first five. */
export const BEAST_EYES = [
  [0xd99a2b, "Amber"],
  [0xe0b63a, "Gold"],
  [0xd8c84a, "Yellow"],
  [0xe07a1e, "Orange"],
  [0x6b4a2a, "Brown"],
  [0x5f8a3f, "Green"],
  [0x8ab8d8, "Ice blue"],
  [0x3f6f9a, "Blue"],
  [0xb02a22, "Red"],
  [0x7a4a9a, "Violet"],
];
export const CLAW_COLOURS = [
  [0x2b2826, "Black"],
  [0x4a3d33, "Dark horn"],
  [0x8a7458, "Horn"],
  [0xd8cdb4, "Bone"],
  [0xf0ece2, "White"],
];
/** Dragon scales, named for the SRD's ten draconic ancestries: [hex, label, the underside that goes with it]. */
export const SCALE_COLOURS = [
  [0x2a2a2e, "Black", 0x6a6a70],
  [0x2f5f9a, "Blue", 0xd9c28a],
  [0xb89a4a, "Brass", 0xe4dcc8],
  [0x8a6a3a, "Bronze", 0xd9c28a],
  [0xb86a3a, "Copper", 0xe4dcc8],
  [0xd4a82a, "Gold", 0xf0e6c8],
  [0x3f7a3f, "Green", 0xd9c28a],
  [0xa02a22, "Red", 0xd9c28a],
  [0xb4b8c0, "Silver", 0xe6eaee],
  [0xe6eaee, "White", 0xa8c0d8],
];
/** A dragon's underside (throat, chest, belly): [hex, label]. */
export const SCALE2_COLOURS = [
  [0xd9c28a, "Pale gold"],
  [0xe4dcc8, "Bone"],
  [0xf0e6c8, "Cream"],
  [0xe6eaee, "White"],
  [0x6a6a70, "Ash"],
  [0x3a3a3e, "Charcoal"],
  [0xa8c0d8, "Pale blue"],
  [0xa8c8a0, "Pale green"],
  [0xd8a8a0, "Rose"],
];
export const HORN_COLOURS = [
  [0xd7c9a7, "Bone"],
  [0xf0ead8, "Ivory"],
  [0x6a5038, "Horn brown"],
  [0x2a2826, "Black"],
  [0x8a8884, "Grey"],
  [0xc8a050, "Gold"],
];
/** A race's parts that can be coloured, when worn: [field, label, its list, what it changes]. */
export const RACE_COLOURS = [["horns", "Horns", HORN_COLOURS, "The horns."]];
/** An anthro kind's parts that can be coloured (with its underwear, AVATAR_COLOURS): [field, label, its list,
 *  what it changes]. */
export const ANTHRO_COLOURS = {
  wolf: [
    ["fur", "Fur", FUR_COLOURS, "The coat: the back, head, limbs and tail. The neck ruff's tufts follow it."],
    ["fur2", "Lighter fur", FUR2_COLOURS, "The muzzle, throat, chest, belly and the tail's underside."],
    ["nose", "Nose", NOSE_COLOURS, "The nose and the paw pads."],
    ["eyes", "Eyes", BEAST_EYES, "The colour of the eyes."],
    ["claws", "Claws", CLAW_COLOURS, "The claws on hands and feet."],
  ],
  dragon: [
    ["scales", "Scales", SCALE_COLOURS, "The scales all over: the back, head, limbs, tail and wings."],
    ["scales2", "Underside", SCALE2_COLOURS, "The throat, chest, belly and the wings' skin."],
    ["horns", "Horns", HORN_COLOURS, "The horns, spines and claws."],
    ["eyes", "Eyes", BEAST_EYES, "The colour of the eyes."],
  ],
};

/**
 * The look a character's race gives when nothing else says (build.js: an SRD race, and a draconic ancestry
 * if the build names one): a dragonborn has the dragon body, its scales in its ancestry's colour, and a
 * dwarf, elf, gnome, half-elf, half-orc, halfling or tiefling the human body as that race (RACES). Laid
 * under what lore and the Look card choose (mergeLooks).
 */
export function raceLook(build) {
  // (The other races are the human body's own: an elf's ears are a slider, so they can still be changed.)
  const race = String(build?.race ?? "").replace("-", "");
  if (race !== "human" && RACES.some(([value]) => value === race))
    return { race, ...(race === "elf" || race === "halfelf" ? { shape: { ears: race === "elf" ? 1 : 0.5 } } : {}) };
  if (build?.race !== "dragonborn") return {};
  const ancestry = String(build.ancestry ?? "").toLowerCase();
  const scales = SCALE_COLOURS.find(([, label]) => label.toLowerCase() === ancestry)?.[0];
  return { species: "dragon", ...(scales === undefined ? {} : { colours: { scales } }) };
}

/** Underwear styles, top and bottom: [value, label]. A body offers only those its model has (avatar.js). */
export const UNDERWEAR_TOPS = [
  ["bra", "Bra"],
  ["sports_bra", "Sports bra"],
  ["bralette", "Bralette"],
  ["undershirt", "Undershirt"],
];
export const UNDERWEAR_BOTTOMS = [
  ["briefs", "Briefs"],
  ["boxer_briefs", "Boxer briefs"],
  ["boxers", "Boxers"],
  ["boyshorts", "Boyshorts"],
  ["bikini", "Bikini"],
  ["thong", "Thong"],
];

// ── The base avatar's clothing (avatar.js; kit/fantasy/avatar) ──
//
// Each piece is worn in a slot, one piece a slot, so a shirt, a tunic over it and a cloak over both go
// together. A slot's pieces are packed into one of the kit's bundles (the last column), so wearing a shirt
// loads the tops and not the armour. "mh_" pieces are MakeHuman's (CC0) modern clothes.

/**
 * The slots, as the Look card lists them: [slot, label, what goes there, the kit bundle it's in, and for a
 * slot whose pieces are always held stiff, the bone they're fixed to (PIECE_BONES)].
 */
export const CLOTH_SLOTS = [
  ["head", "Head", "A hood, a helm or a hat. Most hide the hair.", "head"],
  ["brow", "Brow", "A circlet on the brow.", "head"],
  [
    "horns",
    "Horns or antlers",
    "Horns or antlers fixed to the head, beside any horns chosen on the Face tab. A hat, hood or helm hides them.",
    "extras",
    "Head",
  ],
  ["face", "Glasses", "Glasses or a mask over the eyes.", "accessories"],
  ["mouth", "Face mask", "A mask over the mouth and nose.", "accessories"],
  ["ears", "Earrings", "A pair of earrings.", "accessories"],
  ["neck", "Neck", "A scarf.", "accessories"],
  ["necklace", "Necklace", "A necklace, a chain or a collar. A scarf hides it.", "accessories"],
  ["back", "Cloak or coat", "Worn over everything else.", "body"],
  ["on_back", "On the back", "Wings, a backpack, or a guitar slung across the back.", "objects"],
  ["body", "Whole outfit", "A dress, gown, robe or one-piece: top and legs in one.", "body"],
  ["top", "Shirt or top", "Next to the skin, under everything else.", "tops"],
  ["over", "Over the shirt", "A tunic, vest, corset, padded gambeson or jacket.", "tops"],
  ["armour", "Body armour", "Mail, scale, brigandine, leather or a harness.", "armour"],
  ["plate", "Breastplate", "A plate cuirass, over mail or a gambeson.", "armour"],
  ["shoulders", "Shoulders", "Plate pauldrons.", "armour"],
  ["arms", "Forearms", "Leather bracers.", "hands"],
  ["hands", "Hands", "Gloves or plate gauntlets.", "hands"],
  ["fingers", "Rings", "A ring. Gloves hide it.", "accessories"],
  ["wrists", "Wrists", "Bracelets or bangles. Gloves and bracers hide them.", "accessories"],
  ["waist", "Belt", "A belt with pouches.", "accessories"],
  [
    "belly",
    "Belly",
    "A belly piercing or a belly chain. A one-piece outfit, a breastplate or an apron hides it.",
    "accessories",
  ],
  ["hip", "At the hip", "A sword, a purse or a bag hung at the hip.", "objects"],
  ["apron", "Apron", "A work apron, as a smith or a cook wears.", "accessories"],
  ["legs", "Legs", "Trousers, skirts, shorts and the like.", "legs"],
  [
    "tail",
    "Tail",
    "A tail worn as an item, such as a cat's. The tiefling tail on the Face tab is separate from this.",
    "extras",
  ],
  ["thighs", "Thigh plates", "Plate tassets hung from the waist.", "armour"],
  ["shins", "Shins", "Plate greaves.", "armour"],
  ["socks", "Socks", "Socks or leg warmers, under the shoes.", "feet"],
  ["ankles", "Ankles", "Anklets. Socks and greaves hide them.", "accessories"],
  ["feet", "Feet", "Boots, shoes or sandals.", "feet"],
  [
    "hand_right",
    "Right hand",
    "Something held in the right hand: a sword, a microphone, a bag. It moves with the hand and doesn't bend.",
    "objects",
    "hand_r",
  ],
  [
    "hand_left",
    "Left hand",
    "Something held in the left hand. It moves with the hand and doesn't bend.",
    "objects",
    "hand_l",
  ],
];
/**
 * The body bones a piece can be fixed to, so it moves with that bone alone and never bends with the skin:
 * a sword in a hand, horns on the head, wings on the upper back. These are the skeleton's own names (the
 * Unreal mannequin's, kitfiles.js HUMANOID_BONES): the head, neck, spine, hips and the limbs, not the
 * fingers, toes, eyes or the tail's and hair's bones.
 */
export const PIECE_BONES = [
  "Head",
  "neck_01",
  "spine_01",
  "spine_02",
  "spine_03",
  "pelvis",
  "clavicle_l",
  "clavicle_r",
  "upperarm_l",
  "upperarm_r",
  "lowerarm_l",
  "lowerarm_r",
  "hand_l",
  "hand_r",
  "thigh_l",
  "thigh_r",
  "calf_l",
  "calf_r",
  "foot_l",
  "foot_r",
];
/** The bone a piece in `slot` is fixed to: its own (`bone`, from PIECE_BONES), else its slot's, else none. */
export const boneOf = (slot, bone = null) =>
  PIECE_BONES.includes(bone) ? bone : (CLOTH_SLOTS.find(([each]) => each === slot)?.[4] ?? null);
/**
 * The nails' slots, the same way: pieces the packer bundles with the gloves and the shoes, which the Skin tab
 * chooses (NAILS) rather than the Clothes tab. Gloves hide the fingernails, shoes and socks the toenails
 * (COVERED_BY).
 */
export const NAIL_SLOTS = [
  ["nails", "Fingernails", "Short, medium or long.", "hands"],
  ["toenails", "Toenails", "On the toes.", "feet"],
];
/** The fingernails' lengths: [value, label]; each but "none" is the piece `nails_<value>`. */
export const NAILS = [
  ["short", "Short"],
  ["medium", "Medium"],
  ["long", "Long"],
  ["none", "None"],
];
/** The slots whose pieces are left off while a piece in one of these slots is worn over them. */
export const COVERED_BY = {
  nails: ["hands"],
  toenails: ["feet", "socks"],
  fingers: ["hands"],
  wrists: ["hands", "arms"],
  ankles: ["socks", "shins"],
  necklace: ["neck"],
  belly: ["body", "plate", "apron"],
  horns: ["head"],
};
/** Whether a piece in `slot` is left off under the slots worn (a Set): a ring under gloves. */
export const isCovered = (slot, worn) => (COVERED_BY[slot] ?? []).some((over) => worn.has(over));
/** The pieces: [piece (the kit's name), label, slot]. The kit says which body each is made for. */
export const CLOTHES = [
  ["hood", "Hood", "head"],
  ["helm", "Open helm", "head"],
  ["full_helm", "Full helm", "head"],
  ["mh_fedora", "Fedora", "head"],
  ["mh_fedora_cocked", "Fedora, tilted", "head"],
  ["circlet", "Circlet", "brow"],
  ["scarf", "Scarf", "neck"],
  ["cloak", "Cloak", "back"],
  ["long_coat", "Long coat", "back"],
  ["dress", "Dress", "body"],
  ["gown", "Gown", "body"],
  ["robe", "Robe", "body"],
  ["one_piece_swimsuit", "Swimsuit", "body"],
  ["mh_workwear", "Work overalls and shirt", "body"],
  ["shirt", "Linen shirt", "top"],
  ["t_shirt", "T-shirt", "top"],
  ["tank_top", "Tank top", "top"],
  ["crop_top", "Crop top", "top"],
  ["blouse", "Blouse", "top"],
  ["bikini_top", "Bikini top", "top"],
  ["mh_tee", "Tee", "top"],
  ["mh_long_tee", "Long tee", "top"],
  ["mh_longsleeve_tee", "Long-sleeved tee", "top"],
  ["mh_denim_shirt", "Denim shirt", "top"],
  ["mh_plaid_shirt", "Plaid shirt", "top"],
  ["mh_female_tee", "Tee", "top"],
  ["mh_female_loose_tee", "Loose tee", "top"],
  ["mh_female_sport_top", "Sports top", "top"],
  ["tunic", "Tunic", "over"],
  ["vest", "Vest", "over"],
  ["corset", "Corset", "over"],
  ["gambeson", "Gambeson", "over"],
  ["mh_jacket", "Jacket", "over"],
  ["mh_suit_jacket", "Suit jacket", "over"],
  ["mh_female_blazer", "Blazer", "over"],
  ["chainmail", "Chainmail", "armour"],
  ["scale_mail", "Scale mail", "armour"],
  ["brigandine", "Brigandine", "armour"],
  ["leather_armour", "Leather armour", "armour"],
  ["bikini_armour", "Bikini armour", "armour"],
  ["barbarian_harness", "Barbarian harness", "armour"],
  ["plate_cuirass", "Plate cuirass", "plate"],
  ["pauldrons", "Pauldrons", "shoulders"],
  ["bracers", "Bracers", "arms"],
  ["gloves", "Leather gloves", "hands"],
  ["gauntlets", "Gauntlets", "hands"],
  ["belt_pouches", "Belt and pouches", "waist"],
  ["apron", "Apron", "apron"],
  ["trousers", "Trousers", "legs"],
  ["leggings", "Leggings", "legs"],
  ["shorts", "Shorts", "legs"],
  ["skirt", "Long skirt", "legs"],
  ["short_skirt", "Short skirt", "legs"],
  ["pleated_skirt", "Pleated skirt", "legs"],
  ["loincloth", "Loincloth", "legs"],
  ["swim_trunks", "Swim trunks", "legs"],
  ["bikini_bottom", "Bikini bottom", "legs"],
  ["mh_jeans", "Jeans", "legs"],
  ["mh_jeans_dark", "Dark jeans", "legs"],
  ["mh_suit_trousers", "Suit trousers", "legs"],
  ["mh_overalls", "Overalls", "legs"],
  ["mh_female_jeans", "Jeans", "legs"],
  ["mh_female_leggings", "Leggings", "legs"],
  ["mh_female_shorts", "Shorts", "legs"],
  ["mh_female_skirt", "Skirt", "legs"],
  ["tassets", "Tassets", "thighs"],
  ["greaves", "Greaves", "shins"],
  ["boots", "Boots", "feet"],
  ["tall_boots", "Tall boots", "feet"],
  ["shoes", "Shoes", "feet"],
  ["sandals", "Sandals", "feet"],
  ["sabatons", "Sabatons", "feet"],
  ["mh_boots_black", "Black boots", "feet"],
  ["mh_shoes_black", "Black shoes", "feet"],
  ["mh_shoes_brown", "Brown shoes", "feet"],
  ["mh_trainers_white", "White trainers", "feet"],
  ["mh_trainers_blue", "Blue trainers", "feet"],
  ["mh_trainers_worn", "Worn trainers", "feet"],
  // (The nails: Mindfront's, CC0, fitted by make_mh_clothes.py; NAIL_SLOTS.)
  ["nails_short", "Short nails", "nails"],
  ["nails_medium", "Medium nails", "nails"],
  ["nails_long", "Long nails", "nails"],
  ["toenails", "Toenails", "toenails"],
];
/** A piece's slot, by its name. */
export const SLOT_OF = Object.fromEntries(CLOTHES.map(([piece, , slot]) => [piece, slot]));
/** The pieces installed wardrobe packs add (packs.js), each its checked index entry: { piece: entry }. */
export const PACK_PIECES = {};
/**
 * Adds wardrobe packs' pieces ([{ piece, label, slot, … }], checked by packs.js) to the lists above, so the
 * Clothes tab offers them and checkLook keeps them.
 */
// ponytail: CLOTHES, SLOT_OF and PACK_PIECES are module lists changed in place, so the packs are found once
// a page (a pack installed while the maker is open shows after a reload); a registry object passed to the
// builder and the panel is the upgrade if packs are ever added or removed while the page is open.
export function addPieces(pieces) {
  for (const entry of pieces) {
    if (Object.hasOwn(SLOT_OF, entry.piece)) continue;
    CLOTHES.push([entry.piece, entry.label, entry.slot]);
    SLOT_OF[entry.piece] = entry.slot;
    PACK_PIECES[entry.piece] = entry;
  }
}
/** The hair styles installed wardrobe packs add (packs.js readHair), each its checked index entry: { style: entry }. */
export const PACK_HAIR = {};
/** Adds packs' hair styles ([{ style, label, … }]) to HAIRSTYLES, before "None", so the Hair tab offers them. */
export function addHair(styles) {
  for (const entry of styles) {
    if (HAIRSTYLES.some(([style]) => style === entry.style) || Object.hasOwn(SLOT_OF, entry.style)) continue;
    HAIRSTYLES.splice(HAIRSTYLES.length - 1, 0, [entry.style, entry.label]);
    PACK_HAIR[entry.style] = entry;
  }
}
/** The pack that added a piece or hair style id, if one did. */
export const packEntry = (id) =>
  Object.hasOwn(PACK_PIECES, id) ? PACK_PIECES[id] : Object.hasOwn(PACK_HAIR, id) ? PACK_HAIR[id] : null;

/**
 * The CC BY credits of the pack pieces and hair a look wears, each once, for a saved file (exporter.js).
 * A piece or style whose pack isn't installed isn't worn, so it has none.
 */
export const packCredits = (look) => [
  ...new Set(
    [...(look?.clothes ?? []), ...(look?.hair ? [look.hair] : [])].map((id) => packEntry(id)?.credit).filter(Boolean),
  ),
];

/** What a look has that no installed pack has (checkLook keeps it): { clothes: [piece], hair: style or null }. */
export function missingFromLook(look) {
  const clothes = (look?.clothes ?? []).filter((piece) => !Object.hasOwn(SLOT_OF, piece));
  const hair = look?.hair && !HAIRSTYLES.some(([style]) => style === look.hair) ? look.hair : null;
  return { clothes, hair };
}
/**
 * The look as it's worn, for a saved avatar file: without the pieces and hair style whose packs aren't
 * installed (and their colours and pack notes). A look file and the draft keep them.
 */
export function wornLook(look) {
  const { clothes, hair } = missingFromLook(look);
  if (!clothes.length && !hair) return look;
  const gone = new Set([...clothes, hair]);
  const out = { ...look };
  if (out.clothes) out.clothes = out.clothes.filter((piece) => !gone.has(piece));
  if (hair) delete out.hair;
  for (const field of ["clothColours", "fromPacks"]) {
    if (!out[field]) continue;
    out[field] = Object.fromEntries(Object.entries(out[field]).filter(([id]) => !gone.has(id)));
    if (!Object.keys(out[field]).length) delete out[field];
  }
  return out;
}
/**
 * In plain words, what the look has that isn't shown because its pack isn't installed, one line each,
 * naming the pack where the look recorded it: [] when everything is there.
 */
export function missingNotes(look) {
  const { clothes, hair } = missingFromLook(look);
  const said = (id, kind) => {
    const from = look.fromPacks?.[id];
    return from
      ? `${kind} "${from.label}" isn't shown because its pack, ${from.name}, isn't installed. Install it again to bring it back.`
      : `${kind} "${id}" isn't shown: none of the installed wardrobe packs has it.`;
  };
  return [
    ...clothes.map((piece) => said(piece, "The piece")),
    ...(hair ? [`${said(hair, "The hair style")} Another style shows until then.`] : []),
  ];
}
/** The other ways a piece can be worn: { piece: { label, says, ways: [[variant ("" is the usual), label]] } }.
 *  One shows at a time. */
export const CLOTH_VARIANTS = {
  cloak: {
    label: "Hood",
    says: "The cloak's hood down on the shoulders, or up over the head (which hides the hair).",
    ways: [
      ["", "Down"],
      ["hood_up", "Up"],
    ],
  },
};
/** What a piece's parts can be called (its materials'), each recoloured on its own: [part, label]. */
export const CLOTH_PARTS = [
  ["cloth", "Cloth"],
  ["nail", "Nail"],
  ["trim", "Trim"],
  ["lining", "Lining"],
  ["bodice", "Bodice"],
  ["shirt", "Shirt"],
  ["suit", "Suit"],
  ["under", "Underlayer"],
  ["felt", "Felt"],
  ["laces", "Laces"],
  ["cord", "Cord"],
  ["leather", "Leather"],
  ["belt", "Belt"],
  ["pouch", "Pouches"],
  ["fur", "Fur"],
  ["sole", "Soles"],
  ["shoe", "Shoe"],
  ["sock", "Sock"],
  ["mail", "Mail"],
  ["scale", "Scales"],
  ["plate", "Plate"],
  ["metal", "Metal fittings"],
  ["gem", "Gem"],
  ["frame", "Frame"],
];
/** Dyes for clothing parts: [hex, label]. */
export const DYES = [
  [0xe8e0cc, "Undyed linen"],
  [0xf4f4f0, "White"],
  [0x2a2a2e, "Black"],
  [0x7a7a7a, "Grey"],
  [0x6a4a32, "Brown"],
  [0x9a7a52, "Tan"],
  [0x8a2a2a, "Red"],
  [0x6a2a4a, "Wine"],
  [0xb07a2a, "Ochre"],
  [0x5a6a2a, "Olive"],
  [0x2f5a3a, "Green"],
  [0x2f4a7a, "Blue"],
  [0x1f2a4a, "Navy"],
  [0x5a3a7a, "Purple"],
  [0xc08a9a, "Rose"],
  [0xb8b8c0, "Steel"],
  [0xc8a050, "Brass"],
  [0xd8b860, "Gold"],
];

/** The older kit's cloth colours (OUTFITS), as a colour: an older look's underwear takes its outfit's. */
export const CLOTH_HEX = {
  "clothes-a": 0xe0d4b8,
  "clothes-b": 0x7d7a4a,
  "clothes-blue": 0x4a6a9a,
  "clothes-red": 0xb06a6a,
  "clothes-teal": 0x4f8a78,
  "clothes-plum": 0x75506f,
  "clothes-grey": 0x8a8a8a,
  "ranger-a": 0x3f5a35,
  "ranger-b": 0xb09a70,
  "ranger-wine": 0x6a3a5a,
  "ranger-dusk": 0x45557a,
  "ranger-rust": 0x9a5a35,
  "ranger-moss": 0x6a7a3f,
  "ranger-grey": 0x6f6f6f,
};

/**
 * A look the AI designed (server.mjs `/look-design`), as a checked look: colours written "#rrggbb" (as the
 * model is asked to) read as numbers, then every field through checkLook, so only what the lists have is
 * kept. Never the avatar (which 3D model shows) or a preset's name: a design is the built-in body's alone.
 */
export function readDesign(raw) {
  if (!isRecord(raw)) return {};
  const colour = (value) => {
    if (isColour(value)) return value;
    const match = /^#?([0-9a-f]{6})$/iu.exec(typeof value === "string" ? value.trim() : "");
    return match ? Number.parseInt(match[1], 16) : undefined;
  };
  const colours = (record) =>
    isRecord(record)
      ? Object.fromEntries(Object.entries(record).map(([key, value]) => [key, colour(value)]))
      : undefined;
  const {
    avatar: _avatar,
    preset: _preset,
    ...look
  } = checkLook({
    ...raw,
    colours: colours(raw.colours),
    hairTint: colour(raw.hairTint),
    clothColours: isRecord(raw.clothColours)
      ? Object.fromEntries(Object.entries(raw.clothColours).map(([piece, parts]) => [piece, colours(parts)]))
      : undefined,
    fromPacks: undefined,
  });
  // (A design names only what's here: a piece or hair style it made up isn't kept for a pack to bring.)
  return wornLook(look);
}

/** `over` laid on `base` (two checked looks): each choice of `over` wins, part by part for the avatar's
 *  sliders and colours, so a look's own choices sit on what lore says. */
export function mergeLooks(base, over) {
  const out = { ...base, ...over };
  for (const field of ["shape", "limbs", "colours", "underwear", "tints", "clothColours", "variants", "fromPacks"])
    if (base?.[field] || over?.[field]) out[field] = { ...base?.[field], ...over?.[field] };
  return out;
}

/** The longest a preset's name may be, and how many of one's own are kept. */
const PRESET_NAME = 40;
const PRESETS_KEPT = 24;
/** The base avatar's choices, which starting from a preset puts back to the preset's (or the name's). */
export const PRESET_FIELDS = [
  "body",
  "species",
  "wings",
  "race",
  "facialHair",
  "tusks",
  "horns",
  "tail",
  "figure",
  "shape",
  "limbs",
  "colours",
  "underwear",
  "clothes",
  "clothColours",
  "variants",
  "fromPacks",
  "hair",
  "hairColour",
  "hairTint",
  "height",
  "skin",
  "skinSet",
  "skinTint",
  "age",
  "brows",
  "lashes",
  "eyePicture",
  "nails",
  "toenails",
];
/** What a preset carries of a look: the whole look, never which 3D model shows. */
export const presetOf = (look) => {
  const { avatar: _avatar, preset: _preset, ...rest } = checkLook(look);
  return rest;
};

/**
 * The player's own presets as kept (Settings: `lookPresets`), made safe: [{ name, look }], each look
 * through checkLook, names unique and short, at most 24. Anything else is [].
 */
export function checkPresets(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const entry of raw) {
    const name = typeof entry?.name === "string" ? entry.name.trim().slice(0, PRESET_NAME) : "";
    if (!name || out.some((kept) => kept.name === name)) continue;
    out.push({ name, look: presetOf(entry.look) });
    if (out.length >= PRESETS_KEPT) break;
  }
  return out;
}

/** A preset as a small file to save (exported) and read back (imported): its text, and the reading. */
export const presetFile = (preset) =>
  JSON.stringify({ wanderworld: "look", name: preset.name, look: presetOf(preset.look) }, null, 1);
export function readPresetFile(text) {
  try {
    const read = JSON.parse(text);
    if (read?.wanderworld !== "look") return null;
    return checkPresets([{ name: read.name || "Imported look", look: read.look }])[0] ?? null;
  } catch {
    return null;
  }
}

/** Ready-made looks, a few for each body, to start from. */
export const BUILT_IN_PRESETS = [
  { name: "Everyday man", look: { body: "male" } },
  {
    name: "Broad smith",
    look: {
      body: "male",
      shape: { weight: 0.35, muscle: 0.8, shoulders: 0.7, neck: 0.5, jaw: 0.5 },
      limbs: { arms: 1.04 },
      height: 1.04,
    },
  },
  {
    name: "Lean ranger",
    look: { body: "male", shape: { weight: -0.45, muscle: 0.35, cheeks: 0.4 }, limbs: { legs: 1.05 }, height: 1.05 },
  },
  {
    name: "Stout elder",
    look: {
      body: "male",
      shape: { weight: 0.7, belly: 0.8, muscle: -0.2 },
      age: "old",
      hairColour: 7,
      hair: "short",
      height: 0.95,
    },
  },
  {
    name: "Male elf",
    look: {
      body: "male",
      race: "elf",
      shape: { weight: -0.35, jaw: -0.2, cheeks: 0.6, ears: 1 },
      hair: "long",
      hairColour: 4,
      height: 1.06,
    },
  },
  { name: "Everyday woman", look: { body: "female" } },
  {
    name: "Strong woman",
    look: { body: "female", shape: { muscle: 0.8, shoulders: 0.5, weight: 0.15 }, height: 1.04 },
  },
  {
    name: "Slender woman",
    look: { body: "female", shape: { weight: -0.5, waist: -0.4, hips: 0.2 }, limbs: { legs: 1.05 } },
  },
  { name: "Curvy woman", look: { body: "female", shape: { weight: 0.3, chest: 0.6, hips: 0.7, waist: -0.3 } } },
  {
    name: "Female elf",
    look: {
      body: "female",
      race: "elf",
      shape: { weight: -0.4, cheeks: 0.6, eyes: 0.3, ears: 1 },
      hair: "long",
      hairColour: 4,
      height: 1.04,
    },
  },
  // The other races, on the body their gender gives: each brings its own build, and what it usually has
  // (a dwarf man's beard, a half-orc's tusks and skin, a tiefling's horns, tail and skin).
  ...["dwarf", "halfling", "gnome", "halfelf", "halforc", "tiefling"].map((race) => ({
    name: RACES.find(([value]) => value === race)[1],
    look: { race },
  })),
  // The anthro bodies, each in a coat or an ancestry's colours (the body follows their gender).
  ...[
    ["Grey wolf", 0, 0xd99a2b],
    ["White wolf", 3, 0x8ab8d8],
    ["Black wolf", 4, 0xe0b63a],
  ].map(([name, coat, eyes]) => ({
    name,
    look: { species: "wolf", colours: { fur: FUR_COLOURS[coat][0], fur2: FUR_COLOURS[coat][2], eyes } },
  })),
  ...[
    ["Red dragon", 7, 0xe0b63a],
    ["Gold dragon", 5, 0xe07a1e],
    ["Blue dragon", 1, 0xd8c84a],
    ["Silver dragon", 8, 0x8ab8d8],
  ].map(([name, ancestry, eyes]) => ({
    name,
    look: {
      species: "dragon",
      colours: { scales: SCALE_COLOURS[ancestry][0], scales2: SCALE_COLOURS[ancestry][2], eyes },
    },
  })),
].map((preset) => ({ ...preset, look: checkLook(preset.look) }));

/**
 * Ready-made outfits: only the clothes, so the body stays as it is. Each body's pieces (some are made for
 * one body only), their colours and the way they're worn.
 */
export const OUTFIT_PRESETS = [
  {
    name: "Peasant",
    male: ["tunic", "trousers", "shoes"],
    female: ["blouse", "skirt", "shoes"],
    clothColours: { tunic: { cloth: 0x9a7a52 }, skirt: { cloth: 0x6a4a32 }, trousers: { cloth: 0x6a4a32 } },
  },
  {
    name: "Townsperson",
    male: ["shirt", "vest", "trousers", "shoes"],
    female: ["dress", "shoes"],
    clothColours: { vest: { cloth: 0x2f4a7a }, dress: { cloth: 0x2f5a3a } },
  },
  {
    name: "Ranger",
    both: ["shirt", "leather_armour", "trousers", "tall_boots", "gloves", "cloak"],
    clothColours: { cloak: { cloth: 0x2f5a3a }, trousers: { cloth: 0x5a6a2a } },
    variants: { cloak: "hood_up" },
  },
  {
    name: "Mage",
    both: ["robe", "shoes", "circlet"],
    clothColours: { robe: { cloth: 0x1f2a4a, trim: 0xc8a050 } },
  },
  {
    name: "Knight",
    both: [
      "gambeson",
      "chainmail",
      "plate_cuirass",
      "pauldrons",
      "gauntlets",
      "trousers",
      "tassets",
      "greaves",
      "sabatons",
      "full_helm",
    ],
  },
  {
    name: "Barbarian",
    male: ["loincloth", "barbarian_harness", "bracers", "sandals"],
    female: ["bikini_armour", "loincloth", "bracers", "sandals"],
  },
  {
    name: "Beach",
    male: ["swim_trunks", "sandals"],
    female: ["bikini_top", "bikini_bottom", "sandals"],
    clothColours: {
      swim_trunks: { cloth: 0x2f4a7a },
      bikini_top: { cloth: 0x8a2a2a },
      bikini_bottom: { cloth: 0x8a2a2a },
    },
  },
  {
    name: "Modern casual",
    male: ["mh_tee", "mh_jeans", "mh_trainers_white"],
    female: ["mh_female_tee", "mh_female_jeans", "mh_trainers_white"],
  },
];

/** What putting on `preset` (OUTFIT_PRESETS) sets in a look on `body`: { clothes, clothColours, variants }, checked. */
export function outfitLook(preset, body) {
  const clothes = preset[body] ?? preset.both ?? [];
  const pick = (record = {}) => Object.fromEntries(Object.entries(record).filter(([piece]) => clothes.includes(piece)));
  return checkLook({ clothes, clothColours: pick(preset.clothColours), variants: pick(preset.variants) });
}
