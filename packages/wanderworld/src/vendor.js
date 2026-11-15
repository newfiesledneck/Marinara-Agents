// Vendors: which buildings and market stalls buy and sell, what trades each has, what's on its shelves,
// what things are worth, and haggling. A trade (general store, smith, …) is the setting pack's (pack.js
// `vendors.kinds`: its name, the names that mark a building as one, what it stocks, what it wants, and a
// line of guidance for a model stocking it) or one the player has made; the player can also rewrite a
// trade's guidance. A world keeps its trades as changed (`trades`), and for each vendor its trades once
// set by hand, its present stock, its own guidance and today's haggling. Money is an item in
// Quartermaster's inventory (main.js `purse`), so this only works out lists and prices.

/** The kinds of building that trade to begin with, and as what. Any building can be made a vendor later. */
const DEFAULT_KINDS = { shop: ["general"], smithy: ["smith"], tavern: ["tavern"], inn: ["tavern"] };
/** What a plain "shop" is when its name doesn't say: a town's shops are a mix, each always the same one. */
const SHOP_MIX = ["general", "apothecary", "tailor", "general"];
/** And a market's stalls. */
const STALL_MIX = ["produce", "produce", "general", "tailor", "apothecary"];

const words = (value, max) => (typeof value === "string" ? value.replace(/\s+/gu, " ").trim().slice(0, max) : "");

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

// ── Trades ───────────────────────────────────────────────────────────────────

/**
 * A trade's goods as the player types them, one to a line: "Name, price" or "Name, price, what it is".
 * [{ name, price, description }], twenty at most. Lines without a name and a price are left out.
 */
export function parseGoods(text) {
  const seen = new Set();
  return String(text ?? "")
    .split(/\r?\n/u)
    .map((line) => {
      const [name, price, ...rest] = line.split(",");
      return {
        name: words(name, 60),
        price: Math.round(Number(String(price ?? "").trim())),
        description: words(rest.join(","), 200),
      };
    })
    .filter(
      (item) =>
        item.name &&
        item.price >= 1 &&
        item.price <= 9999 &&
        !seen.has(item.name.toLowerCase()) &&
        seen.add(item.name.toLowerCase()),
    )
    .slice(0, 20);
}

/**
 * The world's own say about trades, checked: { [id]: { guidance } } for one of the setting's (its guidance
 * rewritten), { label, guidance, goods, custom: true } for one the player made. Twenty of their own at most.
 */
export function checkTrades(raw, packKinds) {
  const out = {};
  let own = 0;
  for (const [id, trade] of Object.entries(raw && typeof raw === "object" ? raw : {})) {
    if (!trade || typeof trade !== "object") continue;
    if (Object.hasOwn(packKinds, id)) {
      if (words(trade.guidance, 600)) out[id] = { guidance: words(trade.guidance, 600) };
    } else if (/^own:[a-z0-9-]{1,60}$/u.test(id) && words(trade.label, 40) && own < 20) {
      own++;
      out[id] = {
        label: words(trade.label, 40),
        guidance: words(trade.guidance, 600),
        goods: typeof trade.goods === "string" ? trade.goods.slice(0, 2000) : "",
        custom: true,
      };
    }
  }
  return out;
}

/** An id for a trade of the player's own called `label`, not one of `taken`. */
export function tradeId(label, taken) {
  const slug =
    words(label, 40)
      .toLowerCase()
      .replace(/[^a-z0-9]+/gu, "-")
      .replace(/^-|-$/gu, "") || "trade";
  let id = `own:${slug}`;
  for (let n = 2; taken.includes(id); n++) id = `own:${slug}-${n}`;
  return id;
}

/**
 * Every trade there is in a world: the setting's (each with its guidance, the player's where they've
 * rewritten it) and the player's own (their goods read from what they typed). The shape vendor code works
 * with: { [id]: { label, named, stock, wants, guidance, custom?, changed? } }.
 */
export function tradeKinds(packKinds, saved) {
  const mine = checkTrades(saved, packKinds);
  const kinds = {};
  for (const [id, kind] of Object.entries(packKinds))
    kinds[id] = mine[id] ? { ...kind, guidance: mine[id].guidance, changed: true } : kind;
  for (const [id, trade] of Object.entries(mine)) {
    if (!trade.custom) continue;
    kinds[id] = {
      label: trade.label,
      named: null,
      stock: parseGoods(trade.goods),
      wants: null,
      guidance: trade.guidance,
      goods: trade.goods,
      custom: true,
    };
  }
  return kinds;
}

// ── Which vendors, and what's on their shelves ───────────────────────────────

/**
 * What trades a vendor has. `zone`: its building's zone, or { kind: "stall", id } for a market stall.
 * `saved`: what the world keeps for it ({ kinds } once set by hand: an empty list is "not a vendor").
 * Else by its name where that says ("the Apothecary"), else by what it is. [] for what doesn't trade.
 */
export function vendorKinds(zone, name, saved, kinds) {
  const known = (list) => list.filter((kind) => Object.hasOwn(kinds, kind));
  if (Array.isArray(saved?.kinds)) return known(saved.kinds);
  if (zone?.kind === "stall") return known([STALL_MIX[hash(String(zone.id ?? "")) % STALL_MIX.length]]);
  if (zone?.kind !== "building") return [];
  const named = Object.keys(kinds).filter((kind) => kinds[kind].named?.test(String(name ?? "")));
  if (named.length && DEFAULT_KINDS[zone.buildingKind]) return named;
  if (zone.buildingKind === "shop") return known([SHOP_MIX[hash(String(zone.id ?? "")) % SHOP_MIX.length]]);
  return known(DEFAULT_KINDS[zone.buildingKind] ?? []);
}

/**
 * What a vendor's sign says when it hasn't a name of its own: its trades ("Apothecary", "Smith & Tailor").
 * "" when it has none.
 */
export const tradeSign = (kindIds, kinds) =>
  kindIds
    .slice(0, 2)
    .map((id) => kinds[id]?.label)
    .filter(Boolean)
    .join(" & ");

/**
 * A vendor's shelves for one restocking `period`: up to six things of each of its trades (the same for
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

/** What something is worth: its price where any trade stocks it, else the pack's `values`; 0 unknown. */
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
 * trades' `wants`, or something it stocks), a quarter for anything else, and nothing for what has no worth.
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
 * A vendor's stock now: what the world has kept if it's from this `period` (and of these trades), else
 * fresh shelves. { stock, fresh } (`fresh`: it was restocked, and is to be kept).
 */
export function stockNow(saved, kindIds, kinds, seed, period) {
  const same = Array.isArray(saved?.stock) && saved.period === period && saved.stocked === kindIds.join(",");
  if (same) return { stock: saved.stock, fresh: false };
  return { stock: stockFor(kindIds, kinds, seed, period), fresh: true };
}

// ── Haggling ─────────────────────────────────────────────────────────────────

/**
 * What a try at haggling comes to, by a Charisma check's `total`: { factor, words }. `factor` is what
 * prices are multiplied by for the rest of the day at that vendor (0.8 is a fifth off; over 1 is worse).
 */
export function haggleOutcome(total) {
  if (total >= 20) return { factor: 0.8, words: "takes a fifth off for the rest of the day" };
  if (total >= 15) return { factor: 0.9, words: "takes a tenth off for the rest of the day" };
  if (total >= 6) return { factor: 1, words: "won't move on the price" };
  return { factor: 1.1, words: "takes offence, and wants a tenth more for the rest of the day" };
}

/** The factor haggling has left on a vendor's prices today (1 when it hasn't been tried today). */
export const haggled = (saved, day) => (saved?.haggle?.day === day ? saved.haggle.factor : 1);

/** A price to buy at, and an offer to sell at, after haggling: a better price to buy is a better offer too. */
export const priceAfter = (price, factor) => Math.max(1, Math.round(price * factor));
export const offerAfter = (offer, factor) => (offer <= 0 ? 0 : Math.max(1, Math.floor(offer * (2 - factor))));
