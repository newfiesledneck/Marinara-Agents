// Vendors: which buildings buy and sell, what kinds of shop each is, what's on its shelves and what things
// are worth. What a kind of shop is called, stocks and wants is the setting pack's (pack.js `vendors`); a
// world keeps each vendor's kinds (once the player or the lore has set them) and its present stock. Money
// is an item in Quartermaster's inventory (main.js `purse`), so this only works out lists and prices.

/** The kinds of building that trade to begin with, and as what. Any building can be made a vendor later. */
const DEFAULT_KINDS = { shop: ["general"], smithy: ["smith"], tavern: ["tavern"], inn: ["tavern"] };
/** What a plain "shop" is when its name doesn't say: a town's shops are a mix, each always the same one. */
const SHOP_MIX = ["general", "apothecary", "tailor", "general"];

function hash(text) {
  let value = 2166136261;
  for (let i = 0; i < text.length; i++) value = Math.imul(value ^ text.charCodeAt(i), 16777619) >>> 0;
  return value;
}
/** A run of numbers from 0 to 1 that is the same for the same `seed`. */
function chance(seed) {
  let state = hash(seed) || 1;
  return () => {
    state = (Math.imul(state ^ (state >>> 15), 2246822507) + 0x9e3779b9) >>> 0;
    return ((state ^ (state >>> 13)) >>> 0) / 4294967296;
  };
}

/**
 * What kinds of shop a building is. `saved`: what the world keeps for it ({ kinds } once set by hand: an
 * empty list is "not a vendor"). Else by its name where that says ("the Apothecary"), else by the kind of
 * building it is. [] for a building that doesn't trade.
 */
export function vendorKinds(zone, name, saved, kinds) {
  const known = (list) => list.filter((kind) => Object.hasOwn(kinds, kind));
  if (Array.isArray(saved?.kinds)) return known(saved.kinds);
  if (zone?.kind !== "building") return [];
  const named = Object.keys(kinds).filter((kind) => kinds[kind].named?.test(String(name ?? "")));
  if (named.length && DEFAULT_KINDS[zone.buildingKind]) return named;
  if (zone.buildingKind === "shop") return known([SHOP_MIX[hash(String(zone.id ?? "")) % SHOP_MIX.length]]);
  return known(DEFAULT_KINDS[zone.buildingKind] ?? []);
}

/**
 * A vendor's shelves for one restocking `period`: up to six things of each of its kinds (the same for
 * the same shop and period), each [{ name, description, price, quantity }], prices a little up or down.
 */
export function stockFor(kindIds, kinds, seed, period) {
  const random = chance(`${seed}:${period}`);
  const stock = [];
  for (const id of kindIds) {
    const all = [...(kinds[id]?.stock ?? [])];
    for (let taken = 0; taken < 6 && all.length; taken++) {
      const [item] = all.splice(Math.floor(random() * all.length), 1);
      if (stock.some((entry) => entry.name === item.name)) continue;
      stock.push({
        name: item.name,
        description: item.description ?? "",
        price: Math.max(1, Math.round(item.price * (0.9 + random() * 0.25))),
        quantity: 1 + Math.floor(random() * (item.price > 20 ? 2 : 5)),
      });
    }
  }
  return stock;
}

/** What something is worth: its price where any kind of shop stocks it, else the pack's `values`; 0 unknown. */
export function worth(name, pack) {
  const wanted = String(name ?? "")
    .trim()
    .toLowerCase();
  for (const kind of Object.values(pack.kinds))
    for (const item of kind.stock ?? []) if (item.name.toLowerCase() === wanted) return item.price;
  for (const [known, value] of Object.entries(pack.values ?? {})) if (known.toLowerCase() === wanted) return value;
  return 0;
}

/**
 * What a vendor of `kindIds` pays for one of `name`: half its worth for what the shop deals in (its
 * kinds' `wants`, or something it stocks), a quarter for anything else, and nothing for what has no worth.
 */
export function offerFor(name, kindIds, pack) {
  const value = worth(name, pack);
  if (value <= 0) return 0;
  const deals = kindIds.some(
    (id) =>
      pack.kinds[id]?.wants?.test(String(name)) ||
      (pack.kinds[id]?.stock ?? []).some((item) => item.name.toLowerCase() === String(name).trim().toLowerCase()),
  );
  return Math.max(deals ? 1 : 0, Math.floor(value * (deals ? 0.5 : 0.25)));
}

/**
 * A vendor's stock now: what the world has kept if it's from this `period` (and of these kinds), else
 * fresh shelves. { stock, fresh } (`fresh`: it was restocked, and is to be kept).
 */
export function stockNow(saved, kindIds, kinds, seed, period) {
  const same = Array.isArray(saved?.stock) && saved.period === period && saved.stocked === kindIds.join(",");
  if (same) return { stock: saved.stock, fresh: false };
  return { stock: stockFor(kindIds, kinds, seed, period), fresh: true };
}
