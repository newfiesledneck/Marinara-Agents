// Wardrobe packs: separate packages (`3d-avatar-maker-wardrobe-<theme>`) whose clothes the Clothes tab
// offers beside the kit's own. A pack is found by convention, as the Engine has no package dependencies:
// an installed, active package whose id starts with "3d-avatar-maker-" and that declares `avatar-pack.json`
// among its assets. That index says which pieces it has and which of its bundles (packed like the kit's own
// wardrobe bundles) each is in. Everything a pack says is read as untrusted data: a piece that names
// anything this maker doesn't know is left out, and a pack that can't be read is simply not there.
import { HIDE_WORDS } from "./avatar.js";
import { PACKAGE_ID } from "./kitfiles.js";
import { addPieces, CLOTH_PARTS, CLOTH_SLOTS, SLOT_OF } from "./looks.js";
import { getJson } from "./util.js";

/** The bodies' revision the packs are fitted to (the bodies made in 0.1.02); a pack made for another is skipped. */
export const BODY_REVISION = 1;
const INDEX = "avatar-pack.json";
const PIECE_ID = /^[a-z0-9_]{1,64}$/u;
const BUNDLE = /^(?:[a-z0-9_-]+\/)*[a-z0-9_-]+\.pack\.png$/u;
const BODIES = ["male", "female"];
const LICENCES = /^(?:CC0-1\.0|CC-BY-[34]\.0)$/u;
const MOST_PIECES = 500;

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

/**
 * The pieces a pack's index (`avatar-pack.json`, parsed) adds, checked against this maker's own lists:
 * [{ piece, label, slot, bodies, layer, hides, parts, variants, url, pack, packName, licence, author,
 * credit }]. A piece is left out when anything in it is unknown or malformed, when its bundle isn't one
 * of the pack's declared assets, or when its id is taken already (by the kit, or an earlier pack).
 */
export function readPack(installed, index) {
  if (!isPack(installed) || index?.format !== 1 || index.for !== PACKAGE_ID || index.body !== BODY_REVISION) return [];
  const paths = installed.manifest.contributions.assets.paths;
  const packName = text(index.name, 80) ?? text(installed.manifest.name, 80) ?? installed.id;
  const entries = index.pieces && typeof index.pieces === "object" ? Object.entries(index.pieces) : [];
  const slots = CLOTH_SLOTS.map(([slot]) => slot);
  const parts = CLOTH_PARTS.map(([part]) => part);
  const found = [];
  for (const [piece, entry] of entries.slice(0, MOST_PIECES)) {
    if (!PIECE_ID.test(piece) || piece in Object.prototype || Object.hasOwn(SLOT_OF, piece)) continue;
    if (found.some((other) => other.piece === piece) || !entry || typeof entry !== "object") continue;
    const label = text(entry.label, 60);
    const author = text(entry.author, 80);
    const licence = text(entry.licence, 20);
    const credit = entry.credit === null || entry.credit === undefined ? null : text(entry.credit, 300);
    const bodies = Array.isArray(entry.bodies) ? [...new Set(entry.bodies)] : [];
    const ok =
      label &&
      author &&
      LICENCES.test(licence ?? "") &&
      // (A CC-BY piece is only worn with its credit, which goes into every file it's saved in.)
      (licence === "CC0-1.0" || credit) &&
      (entry.credit === null || entry.credit === undefined || credit) &&
      slots.includes(entry.slot) &&
      bodies.length &&
      words(bodies, BODIES) &&
      Number.isInteger(entry.layer) &&
      entry.layer >= 0 &&
      entry.layer <= 9 &&
      words(entry.hides, HIDE_WORDS) &&
      (entry.variants === undefined ||
        (Array.isArray(entry.variants) && entry.variants.every((way) => PIECE_ID.test(way)))) &&
      entry.parts &&
      typeof entry.parts === "object" &&
      bodies.every(
        (body) =>
          entry.parts[body] === undefined ||
          (Array.isArray(entry.parts[body]) &&
            entry.parts[body].every(
              (pair) => Array.isArray(pair) && pair.length === 2 && parts.includes(pair[0]) && isColour(pair[1]),
            )),
      ) &&
      typeof entry.bundle === "string" &&
      BUNDLE.test(entry.bundle) &&
      paths.includes(entry.bundle);
    if (!ok) continue;
    found.push({
      piece,
      label,
      slot: entry.slot,
      bodies,
      layer: entry.layer,
      hides: [...entry.hides],
      parts: Object.fromEntries(
        bodies.map((body) => [body, (entry.parts[body] ?? []).map(([part, hex]) => [part, hex])]),
      ),
      // (Another way of wearing a pack's piece isn't offered yet: looks.js CLOTH_VARIANTS has no words for it.)
      variants: [],
      url: assetUrl(installed, entry.bundle),
      pack: installed.id,
      packName,
      licence,
      author,
      credit,
    });
  }
  return found;
}

let found = null;
/**
 * Finds the installed wardrobe packs and adds their pieces (looks.js addPieces), once a page; resolves with
 * the pieces added. Never fails: with no Engine to ask (an older Engine, the test page without packs, a
 * failed fetch), there are no packs.
 */
export function loadPacks() {
  found ??= (async () => {
    try {
      const installed = await getJson("/api/capability-packages/installed", 10_000);
      const packs = (Array.isArray(installed) ? installed : []).filter(isPack).sort((a, b) => a.id.localeCompare(b.id));
      const indexes = await Promise.all(packs.map((pack) => getJson(assetUrl(pack, INDEX), 10_000)));
      const pieces = [];
      // (One pack at a time, so a piece id an earlier pack took is left out of a later one.)
      packs.forEach((pack, at) => {
        const read = readPack(pack, indexes[at]);
        addPieces(read);
        pieces.push(...read);
      });
      return pieces;
    } catch (error) {
      console.warn(`[${PACKAGE_ID}] the wardrobe packs couldn't be read`, error);
      return [];
    }
  })();
  return found;
}
