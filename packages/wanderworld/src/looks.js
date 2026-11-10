// What a default person (people.js: someone without a 3D model) can look like, as plain data: the menus
// the Look card offers, and the check a saved look goes through. A look is the choices made by hand:
// { outfit, colour, hair, hairColour, skin, beard, height }, each optional; whatever isn't chosen stays
// as their name has it. (Which body, "male" or "female", is kept apart: save.bodies.)

/** Outfits, and the colours each comes in: [value (the kit's texture name), label]. */
export const OUTFITS = {
  peasant: {
    label: "Townsfolk",
    colours: [
      ["clothes-a", "Brown"],
      ["clothes-b", "Green"],
      ["clothes-blue", "Blue"],
      ["clothes-red", "Red"],
      ["clothes-teal", "Teal"],
      ["clothes-plum", "Plum"],
      ["clothes-grey", "Grey"],
    ],
  },
  ranger: {
    label: "Ranger",
    colours: [
      ["ranger-a", "Forest"],
      ["ranger-b", "Tan"],
      ["ranger-wine", "Wine"],
      ["ranger-dusk", "Dusk"],
      ["ranger-grey", "Grey"],
    ],
  },
};
/** How often a name alone gives each outfit (the rest are townsfolk). */
export const RANGER_SHARE = 0.25;

/** Hairstyles: [value, label]. "none" is a bare head. */
export const HAIRSTYLES = [
  ["simpleparted", "Parted"],
  ["long", "Long"],
  ["buns", "Buns"],
  ["buzzed", "Cropped"],
  ["buzzedfemale", "Cropped, soft"],
  ["none", "None"],
];
/** What a name alone picks from. */
export const USUAL_HAIR = {
  male: ["buzzed", "simpleparted", "long", "simpleparted"],
  female: ["buns", "long", "simpleparted", "buzzedfemale"],
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

/** Skin tones, as what the kit's skin texture is multiplied by: [[r, g, b], label]. */
export const SKIN_TONES = [
  [[1.12, 1.06, 1.02], "Pale"],
  [[1.0, 0.97, 0.94], "Fair"],
  [[0.9, 0.8, 0.72], "Light"],
  [[0.74, 0.6, 0.5], "Tan"],
  [[0.56, 0.43, 0.35], "Brown"],
  [[0.42, 0.31, 0.25], "Dark"],
];

/** Heights a look may have, as a share of the usual. */
export const HEIGHTS = [0.88, 1.12];

/**
 * A look as saved or sent, made safe: only the choices there are, each one of its menu (or left out).
 * Returns {} for anything else.
 */
export function checkLook(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const look = {};
  if (Object.hasOwn(OUTFITS, raw.outfit)) look.outfit = raw.outfit;
  // A colour belongs to its outfit: without one chosen, any outfit's colour names it.
  const outfit =
    look.outfit ?? Object.keys(OUTFITS).find((name) => OUTFITS[name].colours.some(([c]) => c === raw.colour));
  if (outfit && OUTFITS[outfit].colours.some(([colour]) => colour === raw.colour)) {
    look.colour = raw.colour;
    look.outfit = outfit;
  }
  if (HAIRSTYLES.some(([style]) => style === raw.hair)) look.hair = raw.hair;
  const within = (value, count) => Number.isInteger(value) && value >= 0 && value < count;
  if (within(raw.hairColour, HAIR_COLOURS.length)) look.hairColour = raw.hairColour;
  if (within(raw.skin, SKIN_TONES.length)) look.skin = raw.skin;
  if (typeof raw.beard === "boolean") look.beard = raw.beard;
  if (Number.isFinite(raw.height)) look.height = Math.max(HEIGHTS[0], Math.min(HEIGHTS[1], Number(raw.height)));
  return look;
}
