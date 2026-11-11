// The look of Wanderworld's panels: parchment (the author's painted texture, kit/generic/art/parchment) with
// brown ink and wood-brown buttons, for conversations, the Journal, the menu, building cards and the
// noticeboard. The bar along the top stays dark glass so it doesn't cover the world.
const ART = "/api/capability-packages/wanderworld/assets/kit/generic/art/";

export const INK = "#3b2a18";
export const INK_SOFT = "rgba(59,42,24,0.72)";
export const SERIF = `Georgia,"Times New Roman",serif`;

/** A parchment panel: background, ink, a thin brown edge and a soft shadow. */
export const PARCHMENT =
  `background:#efe3c6 url("${ART}parchment.webp") repeat;background-size:384px;color:${INK};` +
  "border:1px solid rgba(110,80,40,0.55);border-radius:10px;" +
  "box-shadow:0 6px 24px rgba(30,18,6,0.35),inset 0 0 28px rgba(120,80,30,0.16);";

/**
 * A sheet of old parchment with darkened, worn edges, stretched to the card (for cards that don't
 * scroll: the menu, a building's card, the noticeboard, conversations).
 */
export const PARCHMENT_EDGED =
  `background:#e8d5ad url("${ART}parchment-edged.webp") center/100% 100% no-repeat;color:${INK};` +
  "border-radius:6px;box-shadow:0 8px 28px rgba(30,18,6,0.45);";

/**
 * A wooden board for a button: the kit's wood grain under a brown wash dark enough for cream lettering
 * to read (the plain brown shows until the picture's in, and if it never comes).
 */
export const WOOD =
  `background:linear-gradient(rgba(96,64,34,0.5),rgba(52,33,16,0.62)),url("${ART}wood-beam.webp") #6b4a2b;` +
  "background-size:auto,260px;color:#f8eed8;text-shadow:0 1px 2px rgba(20,10,0,0.75);";

/** A slab of stone for a button that should stand apart: grey rock under a wash, lettering as on the wood. */
export const STONE =
  `background:linear-gradient(rgba(70,72,78,0.35),rgba(30,32,38,0.6)),url("${ART}cliff-rock.webp") #7d7a74;` +
  "background-size:auto,300px;color:#f8f1dd;text-shadow:0 1px 3px rgba(0,0,0,0.85);";

/** The main button on parchment: dark wood with cream lettering. */
export const INK_BUTTON =
  `font:600 13px ${SERIF};border:1px solid #4e341d;border-radius:7px;padding:5px 12px;cursor:pointer;` +
  `${WOOD}box-shadow:0 1px 2px rgba(0,0,0,0.25);`;

/** A small button on parchment: an inked outline. */
export const INK_SMALL =
  `font:600 11px system-ui,sans-serif;border:1px solid rgba(107,74,43,0.7);border-radius:6px;padding:2px 8px;` +
  `cursor:pointer;background:rgba(107,74,43,0.1);color:${INK};`;

/** A text field on parchment. */
export const INK_INPUT =
  "font:14px system-ui,sans-serif;border:1px solid #b89a6a;border-radius:7px;padding:7px 9px;" +
  "background:#fbf6e9;color:#2b1e10;box-sizing:border-box;";

/** A heading in the panels' serif. */
export const HEADING = `font:700 16px ${SERIF};color:${INK};`;

/** A pinned note's paper (kit/generic/art/note): aged, with darkened edges. */
export const NOTE_PAPER = `background:#ead9b4 url("${ART}note.webp") center/cover;color:#2e2112;`;
