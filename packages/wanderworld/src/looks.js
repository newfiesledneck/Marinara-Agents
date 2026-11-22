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
export const HEIGHTS = [0.88, 1.12];

const isColour = (value) => Number.isInteger(value) && value >= 0 && value <= 0xffffff;
const isRecord = (value) => !!value && typeof value === "object" && !Array.isArray(value);

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
  const hair = OLDER_HAIR[raw.hair] ?? raw.hair;
  if (HAIRSTYLES.some(([style]) => style === hair)) look.hair = hair;
  const within = (value, count) => Number.isInteger(value) && value >= 0 && value < count;
  if (within(raw.hairColour, HAIR_COLOURS.length)) look.hairColour = raw.hairColour;
  if (isColour(raw.hairTint)) look.hairTint = raw.hairTint;
  // (`skinSet` says the number is from this list; without it, it's from the first six.)
  const skin = raw.skinSet === 2 ? raw.skin : OLDER_SKIN[raw.skin];
  if (within(skin, SKIN_TONES.length)) Object.assign(look, { skin, skinSet: 2 });
  if (isColour(raw.skinTint)) look.skinTint = raw.skinTint;
  // The base avatar's age, skin picture, brow and lash styles and eye picture (avatar.js).
  if (SKINS.some(([kind]) => kind === raw.skin)) look.skin = raw.skin;
  if (AGES.some(([age]) => age === raw.age)) look.age = raw.age;
  for (const [field, count] of [
    ["brows", BROWS],
    ["lashes", LASHES],
  ])
    if (Number.isFinite(raw[field])) look[field] = Math.max(1, Math.min(count, Math.round(raw[field])));
  if (raw.eyePicture === TINT || EYE_PICTURES.some(([picture]) => picture === raw.eyePicture))
    look.eyePicture = raw.eyePicture;
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
  for (const [field, list] of [
    ["shape", [...SHAPES, ...FACE, ...ANTHRO_SHAPES]],
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
  for (const [part] of [...AVATAR_COLOURS, ...Object.values(ANTHRO_COLOURS).flat()])
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
  if (Array.isArray(raw.clothes)) {
    const bySlot = new Map();
    for (const piece of raw.clothes)
      if (Object.hasOwn(SLOT_OF, piece) && !bySlot.has(SLOT_OF[piece])) bySlot.set(SLOT_OF[piece], piece);
    look.clothes = [...bySlot.values()];
  }
  const clothColours = {};
  for (const [piece, colours] of Object.entries(isRecord(raw.clothColours) ? raw.clothColours : {})) {
    if (!Object.hasOwn(SLOT_OF, piece) || !isRecord(colours)) continue;
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
//     shape: { weight, muscle, … },  the build and face sliders (SHAPES, FACE, ANTHRO_SHAPES), each within its range
//     limbs: { arms, legs, head },   arm and leg length and head size, as a share of the usual
//     colours: { skin, eyes, … },    each part's colour (0xRRGGBB): AVATAR_COLOURS
//     underwear: { top, bottom },    a style of each (UNDERWEAR_TOPS, UNDERWEAR_BOTTOMS), or "none"
//     clothes: [piece, …],           outfit pieces worn (CLOTHES), one a slot; missing: their work's (avatar.js)
//     clothColours: { piece: { part: 0xRRGGBB } },  a colour of one's own for a piece's part (CLOTH_PARTS)
//     variants: { piece: variant },  another way of wearing a piece (CLOTH_VARIANTS: a cloak's hood up)
//     age,                           "young", "middle" or "old" (AGES): shape keys and skins of its own
//     skin,                          a skin picture (SKINS: MakeHuman's), or "custom": colours.skin
//     brows, lashes,                 which style of each (1 … BROWS, 1 … LASHES)
//     eyePicture,                    an eye picture (EYE_PICTURES), or "tint": the grey iris in colours.eyes
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
/** The clothing slots an anthro body leaves empty for now: head pieces don't fit a muzzle, nor shoes a paw. */
export const ANTHRO_BARE_SLOTS = new Set(["head", "brow", "feet"]);

/** The build sliders: [look field, label, least, most, what it changes]. 0 is an everyday person. */
export const SHAPES = [
  ["weight", "Weight", -1, 1, "Thinner to heavier, all over."],
  ["muscle", "Muscle", -0.5, 1, "Softer to more muscular."],
  ["chest", "Chest", -0.5, 1, "A flatter or fuller chest (her bust)."],
  ["hips", "Hips", -0.5, 1, "Narrower or wider hips and seat."],
  ["waist", "Waist", -1, 0.5, "A narrower or wider waist."],
  ["belly", "Belly", -0.5, 1, "A flatter or rounder belly."],
  ["shoulders", "Shoulders", -0.5, 1, "Narrower or broader shoulders."],
  ["neck", "Neck", -0.5, 1, "A slimmer or thicker neck."],
];
/** The face sliders, the same way. */
export const FACE = [
  ["jaw", "Jaw", -0.5, 1, "A softer or a squarer, stronger jaw and chin."],
  ["cheeks", "Cheekbones", -0.5, 1, "Flatter or higher, fuller cheekbones."],
  ["nose", "Nose", -0.5, 1, "A smaller or larger nose."],
  ["eyes", "Eyes", -0.5, 1, "Smaller or larger eyes."],
  ["ears", "Pointed ears", 0, 1, "Round ears to long, pointed ones, as an elf's."],
];
/** The anthro bodies' own sliders, the same way, and the card's section each is in. A body has those its
 *  model has the shape keys for (hasSlider). */
export const ANTHRO_SHAPES = [
  ["muzzle", "Muzzle", -1, 1, "A shorter or a longer muzzle.", "face"],
  ["earSize", "Ears", -1, 1, "Smaller or taller ears.", "face"],
  ["horns", "Horns", -1, 1, "Smaller or larger horns.", "face"],
  ["tailLength", "Tail length", -1, 1, "A shorter or a longer tail.", "build"],
  ["tail", "Tail thickness", 0, 1, "A thicker tail.", "build"],
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
/** Arm and leg length and head size: [field, label, least, most, what it changes]; 1 is the usual. */
export const LIMBS = [
  ["arms", "Arm length", 0.85, 1.15, "Shorter or longer arms, no thicker."],
  ["legs", "Leg length", 0.85, 1.15, "Shorter or longer legs, no thicker. Longer legs stand taller."],
  ["head", "Head size", 0.9, 1.1, "A smaller or larger head (and its hair)."],
];

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
];
/** How many brow and lash styles the bodies have (eyebrows-01 … and eyelashes-01 …). */
export const BROWS = 12;
export const LASHES = 4;

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
 * if the build names one): a dragonborn has the dragon body, its scales in its ancestry's colour. Laid
 * under what lore and the Look card choose (mergeLooks).
 */
export function raceLook(build) {
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

/** The slots, as the Look card lists them: [slot, label, what goes there, the kit bundle it's in]. */
export const CLOTH_SLOTS = [
  ["head", "Head", "A hood, a helm or a hat. Most hide the hair.", "head"],
  ["brow", "Brow", "A circlet on the brow.", "head"],
  ["neck", "Neck", "A scarf.", "accessories"],
  ["back", "Cloak or coat", "Worn over everything else.", "body"],
  ["body", "Whole outfit", "A dress, gown, robe or one-piece: top and legs in one.", "body"],
  ["top", "Shirt or top", "Next to the skin, under everything else.", "tops"],
  ["over", "Over the shirt", "A tunic, vest, corset, padded gambeson or jacket.", "tops"],
  ["armour", "Body armour", "Mail, scale, brigandine, leather or a harness.", "armour"],
  ["plate", "Breastplate", "A plate cuirass, over mail or a gambeson.", "armour"],
  ["shoulders", "Shoulders", "Plate pauldrons.", "armour"],
  ["arms", "Forearms", "Leather bracers.", "hands"],
  ["hands", "Hands", "Gloves or plate gauntlets.", "hands"],
  ["waist", "Belt", "A belt with pouches.", "accessories"],
  ["apron", "Apron", "A work apron, as a smith or a cook wears.", "accessories"],
  ["legs", "Legs", "Trousers, skirts, shorts and the like.", "legs"],
  ["thighs", "Thigh plates", "Plate tassets hung from the waist.", "armour"],
  ["shins", "Shins", "Plate greaves.", "armour"],
  ["feet", "Feet", "Boots, shoes or sandals.", "feet"],
];
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
];
/** A piece's slot, by its name. */
export const SLOT_OF = Object.fromEntries(CLOTHES.map(([piece, , slot]) => [piece, slot]));
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

/** `over` laid on `base` (two checked looks): each choice of `over` wins, part by part for the avatar's
 *  sliders and colours, so a look's own choices sit on what lore says. */
export function mergeLooks(base, over) {
  const out = { ...base, ...over };
  for (const field of ["shape", "limbs", "colours", "underwear", "tints", "clothColours", "variants"])
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
  "figure",
  "shape",
  "limbs",
  "colours",
  "underwear",
  "clothes",
  "clothColours",
  "variants",
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
      shape: { weight: -0.4, cheeks: 0.6, eyes: 0.3, ears: 1 },
      hair: "long",
      hairColour: 4,
      height: 1.04,
    },
  },
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
