// Wardrobe packs: separate packages (`3d-avatar-maker-wardrobe-<theme>`) whose clothes and hair styles the
// Clothes and Hair tabs offer beside the kit's own. A pack is found by convention, as the Engine has no
// package dependencies: an installed, active package whose id starts with "3d-avatar-maker-" and that
// declares `avatar-pack.json` among its assets. That index says which pieces and hair styles it has and
// which of its bundles (packed like the kit's own wardrobe and hair bundles) each is in. Everything a pack
// says is read as untrusted data: an entry that names anything this maker doesn't know is left out, and a
// pack that can't be read is simply not there.
//
// The index (format 1; each field below `pieces` checked by readPack, `hair` by readHair):
//   { format: 1, for: "3d-avatar-maker", body: BODY_REVISION, maker, name,
//     pieces: { piece: { label, slot, bodies, layer, hides, parts, variants, bundle, licence, author,
//                        source, credit, bone?, hang?, noUnderwear?, tint? } },
//     hair?: { style: { label, bodies, bundle, licence, author, source, credit, swing? } } }
// `bone`, `hang`, `hair`, `noUnderwear`, `tint` and the underwear slots came later and are optional, so a pack
// made before them reads as it did. A piece in an underwear slot (looks.js UNDERWEAR_SLOTS: `underwear_top`,
// `underwear_bottom`) is a choice in the Underwear lists; `tint` says its picture is grey under its parts'
// colours, so the underwear's colour dyes it. `noUnderwear` says a piece is worn on bare skin (a swimsuit):
// the underwear its hide words name is left off under it even when underwear shows under clothes.
import { HIDE_WORDS } from "./avatar.js";
import { PACKAGE_ID } from "./kitfiles.js";
import {
  addHair,
  addPieces,
  CLOTH_PARTS,
  CLOTH_SLOTS,
  HAIRSTYLES,
  PIECE_BONES,
  PIECE_ID,
  SLOT_OF,
  UNDERWEAR_BOTTOMS,
  UNDERWEAR_SLOTS,
  UNDERWEAR_TOPS,
} from "./looks.js";
import { getJson } from "./util.js";

/** The bodies' revision the packs are fitted to (the bodies made in 0.1.02); a pack made for another is skipped. */
export const BODY_REVISION = 1;
const INDEX = "avatar-pack.json";
const BUNDLE = /^(?:[a-z0-9_-]+\/)*[a-z0-9_-]+\.pack\.png$/u;
const BODIES = ["male", "female"];
const LICENCES = /^(?:CC0-1\.0|CC-BY-[34]\.0)$/u;
const MOST_PIECES = 500;
const MOST_HAIR = 100;
/** How far below the eyes (metres) a pack's hair style may say its locks leave the head to swing (hair.js). */
export const MOST_SWING = 0.3;
/**
 * Where a pack's piece may say its cloth leaves the body to hang and swing on chains (hair.js): a share of the
 * way from the hip joints down to the knees, from a cloak's middle of the back to below the knees.
 */
export const HANG_RANGE = [-1, 1.5];

const text = (value, most) => (typeof value === "string" && value.trim() && value.length <= most ? value.trim() : null);
const isColour = (value) => Number.isInteger(value) && value >= 0 && value <= 0xffffff;
const words = (value, known) => Array.isArray(value) && value.every((word) => known.includes(word));

/** Where an installed package's asset `path` is served, as its installed version (so a new one isn't cached). */
const assetUrl = (installed, path) => {
  const version = text(installed.version, 40);
  return `/api/capability-packages/${installed.id}/assets/${path}${version ? `?v=${encodeURIComponent(version)}` : ""}`;
};

/** Whether an installed package (a row of /api/capability-packages/installed) is a wardrobe pack to read. */
export function isPack(installed) {
  const id = installed?.id;
  return (
    typeof id === "string" &&
    /^[a-z0-9-]{1,100}$/u.test(id) &&
    id.startsWith(`${PACKAGE_ID}-`) &&
    installed.status === "active" &&
    Array.isArray(installed.manifest?.contributions?.assets?.paths) &&
    installed.manifest.contributions.assets.paths.includes(INDEX)
  );
}

/** Whether a pack's index is one this maker reads, for this pack. */
const readable = (installed, index) =>
  isPack(installed) && index?.format === 1 && index.for === PACKAGE_ID && index.body === BODY_REVISION;

/**
 * What every entry (a piece or a hair style) must have: a label, its bodies, a declared bundle, and an
 * author and licence, CC BY only with its credit. { label, bodies, licence, author, credit, url } or null.
 */
function common(installed, entry) {
  if (!entry || typeof entry !== "object") return null;
  const label = text(entry.label, 60);
  const author = text(entry.author, 80);
  const licence = text(entry.licence, 20);
  const credit = entry.credit === null || entry.credit === undefined ? null : text(entry.credit, 300);
  const bodies = Array.isArray(entry.bodies) ? [...new Set(entry.bodies)] : [];
  const ok =
    label &&
    author &&
    LICENCES.test(licence ?? "") &&
    // (A CC-BY entry is only worn with its credit, which goes into every file it's saved in.)
    (licence === "CC0-1.0" || credit) &&
    (entry.credit === null || entry.credit === undefined || credit) &&
    bodies.length &&
    words(bodies, BODIES) &&
    typeof entry.bundle === "string" &&
    BUNDLE.test(entry.bundle) &&
    installed.manifest.contributions.assets.paths.includes(entry.bundle);
  return ok ? { label, bodies, licence, author, credit, url: assetUrl(installed, entry.bundle) } : null;
}

/** An id an entry may have: well-formed, not one of every object's own names, and not taken yet. */
const freeId = (id) =>
  PIECE_ID.test(id) &&
  !(id in Object.prototype) &&
  !Object.hasOwn(SLOT_OF, id) &&
  ![HAIRSTYLES, UNDERWEAR_TOPS, UNDERWEAR_BOTTOMS].some((list) => list.some(([style]) => style === id));
/** An optional yes-or-no field: missing, or true or false. */
const flag = (value) => value === undefined || typeof value === "boolean";

/**
 * The pieces a pack's index (`avatar-pack.json`, parsed) adds, checked against this maker's own lists:
 * [{ piece, label, slot, bodies, layer, hides, parts, variants, bone, hang, noUnderwear, tint, url, pack,
 * packName, licence, author, credit }]. `bone` is the body bone the piece is fixed to (looks.js PIECE_BONES), or
 * null; `hang` where its cloth leaves the body to swing (HANG_RANGE, hair.js), or null for one that follows the
 * legs (a piece fixed to a bone never swings). A piece in an underwear slot (UNDERWEAR_SLOTS) is underwear, not
 * clothing (looks.js addPieces). A piece is left out when anything in it is unknown or malformed, when its
 * bundle isn't one of the pack's declared assets, or when its id is taken already (by the kit, or an earlier
 * pack).
 */
export function readPack(installed, index) {
  if (!readable(installed, index)) return [];
  const packName = text(index.name, 80) ?? text(installed.manifest.name, 80) ?? installed.id;
  const entries = index.pieces && typeof index.pieces === "object" ? Object.entries(index.pieces) : [];
  const slots = [...CLOTH_SLOTS, ...UNDERWEAR_SLOTS].map(([slot]) => slot);
  const parts = CLOTH_PARTS.map(([part]) => part);
  const found = [];
  for (const [piece, entry] of entries.slice(0, MOST_PIECES)) {
    if (!freeId(piece) || found.some((other) => other.piece === piece)) continue;
    const said = common(installed, entry);
    const ok =
      said &&
      slots.includes(entry.slot) &&
      Number.isInteger(entry.layer) &&
      entry.layer >= 0 &&
      entry.layer <= 9 &&
      words(entry.hides, HIDE_WORDS) &&
      (entry.variants === undefined ||
        (Array.isArray(entry.variants) && entry.variants.every((way) => PIECE_ID.test(way)))) &&
      (entry.bone === undefined || entry.bone === null || PIECE_BONES.includes(entry.bone)) &&
      (entry.hang === undefined ||
        entry.hang === null ||
        (Number.isFinite(entry.hang) && entry.hang >= HANG_RANGE[0] && entry.hang <= HANG_RANGE[1])) &&
      flag(entry.noUnderwear) &&
      flag(entry.tint) &&
      entry.parts &&
      typeof entry.parts === "object" &&
      said.bodies.every(
        (body) =>
          entry.parts[body] === undefined ||
          (Array.isArray(entry.parts[body]) &&
            entry.parts[body].every(
              (pair) => Array.isArray(pair) && pair.length === 2 && parts.includes(pair[0]) && isColour(pair[1]),
            )),
      );
    if (!ok) continue;
    found.push({
      piece,
      label: said.label,
      slot: entry.slot,
      bodies: said.bodies,
      layer: entry.layer,
      hides: [...entry.hides],
      parts: Object.fromEntries(
        said.bodies.map((body) => [body, (entry.parts[body] ?? []).map(([part, hex]) => [part, hex])]),
      ),
      // (Another way of wearing a pack's piece isn't offered yet: looks.js CLOTH_VARIANTS has no words for it.)
      variants: [],
      bone: entry.bone ?? null,
      hang: entry.hang ?? null,
      noUnderwear: entry.noUnderwear === true,
      tint: entry.tint === true,
      url: said.url,
      pack: installed.id,
      packName,
      licence: said.licence,
      author: said.author,
      credit: said.credit,
    });
  }
  return found;
}

/**
 * The hair styles a pack's index adds (its `hair`, optional), checked the same way: [{ style, label, bodies,
 * swing, url, pack, packName, licence, author, credit }]. `swing` is how far below the eyes (metres) the
 * style's locks leave the head to swing on chains (hair.js), or null for a style that stays as it is. A style
 * is left out when anything in it is malformed or its id is taken (by the kit's styles, a piece, or an
 * earlier pack). Its bundle holds `styles: { style: { male, female } }`, as the kit's hair bundles do.
 */
export function readHair(installed, index) {
  if (!readable(installed, index) || !index.hair || typeof index.hair !== "object") return [];
  const packName = text(index.name, 80) ?? text(installed.manifest.name, 80) ?? installed.id;
  const pieces = index.pieces && typeof index.pieces === "object" ? index.pieces : {};
  const found = [];
  for (const [style, entry] of Object.entries(index.hair).slice(0, MOST_HAIR)) {
    if (!freeId(style) || Object.hasOwn(pieces, style) || found.some((other) => other.style === style)) continue;
    const said = common(installed, entry);
    const swing = entry?.swing ?? null;
    if (!said || !(swing === null || (Number.isFinite(swing) && swing >= 0 && swing <= MOST_SWING))) continue;
    found.push({
      style,
      label: said.label,
      bodies: said.bodies,
      swing,
      url: said.url,
      pack: installed.id,
      packName,
      licence: said.licence,
      author: said.author,
      credit: said.credit,
    });
  }
  return found;
}

let found = null;
/**
 * Finds the installed wardrobe packs and adds their pieces (looks.js addPieces) and hair styles (addHair),
 * once a page; resolves with the pieces and styles added. Never fails: with no Engine to ask (an older
 * Engine, the test page without packs, a failed fetch), there are no packs.
 */
export function loadPacks() {
  found ??= (async () => {
    try {
      const installed = await getJson("/api/capability-packages/installed", 10_000);
      const packs = (Array.isArray(installed) ? installed : []).filter(isPack).sort((a, b) => a.id.localeCompare(b.id));
      const indexes = await Promise.all(packs.map((pack) => getJson(assetUrl(pack, INDEX), 10_000)));
      const added = [];
      // (One pack at a time, so an id an earlier pack took is left out of a later one.)
      packs.forEach((pack, at) => {
        const pieces = readPack(pack, indexes[at]);
        addPieces(pieces);
        const hair = readHair(pack, indexes[at]);
        addHair(hair);
        added.push(...pieces, ...hair);
      });
      return added;
    } catch (error) {
      console.warn(`[${PACKAGE_ID}] the wardrobe packs couldn't be read`, error);
      return [];
    }
  })();
  return found;
}
