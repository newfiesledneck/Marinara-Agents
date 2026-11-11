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
// (Which body, "male" or "female", is kept apart: save.bodies.)

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

/** Hairstyles: [value, label]. "none" is a bare head. */
export const HAIRSTYLES = [
  ["simpleparted", "Parted"],
  ["long", "Long"],
  ["buns", "Buns"],
  ["cropped", "Cropped"],
  ["none", "None"],
];
/** The kit's file for a hairstyle: cropped hair is cut to each body's own head. */
export const HAIR_FILE = (hair, sex) => (hair === "cropped" ? (sex === "female" ? "buzzedfemale" : "buzzed") : hair);
/** What a name alone picks from. */
export const USUAL_HAIR = {
  male: ["cropped", "simpleparted", "long", "simpleparted"],
  female: ["buns", "long", "simpleparted", "cropped"],
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
  // (Cropped hair was once two styles, one for each body.)
  const hair = raw.hair === "buzzed" || raw.hair === "buzzedfemale" ? "cropped" : raw.hair;
  if (HAIRSTYLES.some(([style]) => style === hair)) look.hair = hair;
  const within = (value, count) => Number.isInteger(value) && value >= 0 && value < count;
  if (within(raw.hairColour, HAIR_COLOURS.length)) look.hairColour = raw.hairColour;
  if (isColour(raw.hairTint)) look.hairTint = raw.hairTint;
  // (`skinSet` says the number is from this list; without it, it's from the first six.)
  const skin = raw.skinSet === 2 ? raw.skin : OLDER_SKIN[raw.skin];
  if (within(skin, SKIN_TONES.length)) Object.assign(look, { skin, skinSet: 2 });
  if (isColour(raw.skinTint)) look.skinTint = raw.skinTint;
  if (typeof raw.beard === "boolean") look.beard = raw.beard;
  if (Number.isFinite(raw.height)) look.height = Math.max(HEIGHTS[0], Math.min(HEIGHTS[1], Number(raw.height)));
  // Which avatar shows: one of their card's 3D models, or the built-in person (missing: the card's own choice).
  if (AVATARS.includes(raw.avatar)) look.avatar = raw.avatar;
  return look;
}
