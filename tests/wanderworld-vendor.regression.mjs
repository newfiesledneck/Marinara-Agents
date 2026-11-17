// Vendors (packages/wanderworld/src/vendor.js): which buildings trade and as what, their shelves, what
// things are worth and what a shop pays. And that the setting's shops hang together with what's gathered.
import assert from "node:assert/strict";
import { PACK } from "../packages/wanderworld/src/pack.js";
import {
  checkTrades,
  haggled,
  haggleOutcome,
  offerAfter,
  offerFor,
  parseGoods,
  priceAfter,
  stockFor,
  stockNow,
  tradeId,
  tradeKinds,
  tradeSign,
  vendorKinds,
  worth,
} from "../packages/wanderworld/src/vendor.js";

const kinds = PACK.vendors.kinds;
const building = (buildingKind) => ({ kind: "building", buildingKind });

// Which buildings trade: by the kind of building, by a name that says, or as the player set it.
assert.deepEqual(vendorKinds(building("smithy"), "the smithy", null, kinds), ["smith"]);
// (A town's plain shops are a mix of trades, each shop always the same one.)
{
  const shops = Array.from(
    { length: 40 },
    (_, i) => vendorKinds({ ...building("shop"), id: `building:${i}` }, "the shop", null, kinds)[0],
  );
  assert.deepEqual([...new Set(shops)].sort(), ["apothecary", "general", "tailor"]);
  assert.deepEqual(vendorKinds({ ...building("shop"), id: "building:7" }, "the shop", null, kinds), [shops[7]]);
}
assert.deepEqual(vendorKinds(building("shop"), "Mother Hale's Apothecary", null, kinds), ["apothecary"]);
assert.deepEqual(vendorKinds(building("inn"), "the Crossroads Inn", null, kinds), ["tavern"]);
assert.deepEqual(
  vendorKinds(building("home"), "the Tailor's house", null, kinds),
  [],
  "a home doesn't trade for its name",
);
assert.deepEqual(
  vendorKinds(building("home"), "a house", { kinds: ["tailor", "nonsense"] }, kinds),
  ["tailor"],
  "unless it's made a vendor",
);
assert.deepEqual(
  vendorKinds(building("smithy"), "the smithy", { kinds: [] }, kinds),
  [],
  "and a shop can be closed for good",
);
assert.deepEqual(vendorKinds({ kind: "street" }, "Smithy Lane", null, kinds), []);

// Shelves: the same for the same shop and period, different the next; several kinds together.
const first = stockFor(["smith"], kinds, "world:building:3", 0);
assert.deepEqual(stockFor(["smith"], kinds, "world:building:3", 0), first);
assert.notDeepEqual(stockFor(["smith"], kinds, "world:building:3", 1), first);
assert.ok(first.length >= 4 && first.length <= 6 && first.every((item) => item.price >= 1 && item.quantity >= 1));
const both = stockFor(["smith", "apothecary"], kinds, "s", 0);
assert.ok(both.length > first.length && new Set(both.map((item) => item.name)).size === both.length, "no thing twice");

// Kept while the period and the kinds are the same; fresh when either changes.
const kept = { stock: [{ name: "X", price: 1, quantity: 1 }], period: 2, stocked: "smith" };
assert.deepEqual(stockNow(kept, ["smith"], kinds, "s", 2), { stock: kept.stock, fresh: false });
assert.equal(stockNow(kept, ["smith"], kinds, "s", 3).fresh, true);
assert.equal(stockNow(kept, ["smith", "tailor"], kinds, "s", 2).fresh, true);

// Worth and offers: half for what a shop deals in, a quarter elsewhere, nothing for what's worthless.
assert.equal(worth("iron ore", PACK.vendors), PACK.vendors.values["Iron ore"]);
assert.equal(worth("A rumour", PACK.vendors), 0);
const ore = worth("Iron ore", PACK.vendors);
assert.equal(offerFor("Iron ore", ["smith"], PACK.vendors), Math.max(1, Math.floor(ore / 2)));
assert.equal(offerFor("Iron ore", ["tavern"], PACK.vendors), Math.floor(ore / 4));
assert.equal(offerFor("A rumour", ["smith"], PACK.vendors), 0);
assert.ok(offerFor("River trout", ["tavern"], PACK.vendors) >= 1, "a tavern buys fish");

// The setting hangs together: every kind has a name, shelves and prices; everything gathering finds and
// every recipe makes is worth something somewhere (bar plain rubbish); nothing is bought for more than
// it's sold (a thing worth one coin sells for one: no gain in that).
for (const [id, kind] of Object.entries(kinds)) {
  assert.ok(kind.label && kind.stock.length >= 5, `${id} has shelves`);
  for (const item of kind.stock) assert.ok(item.name && item.price >= 1, `${id}: ${item.name} has a price`);
}
const found = [...Object.values(PACK.gather).filter(Array.isArray).flat(), ...Object.values(PACK.gather.forage).flat()];
for (const item of found)
  if (item.name !== "Old boot") assert.ok(worth(item.name, PACK.vendors) > 0, `${item.name} is worth something`);
for (const recipe of PACK.recipes) assert.ok(worth(recipe.name, PACK.vendors) > 0, `${recipe.name} is worth something`);
for (const kind of Object.values(kinds))
  for (const item of kind.stock)
    assert.ok(
      offerFor(item.name, Object.keys(kinds), PACK.vendors) <= Math.max(1, Math.floor(item.price / 2)),
      `${item.name} can't be sold back for a gain`,
    );

// Market stalls are a mix of trades too, each stall always the same.
{
  const stallKinds = Array.from(
    { length: 40 },
    (_, i) => vendorKinds({ kind: "stall", id: `stall:${i}` }, "", null, kinds)[0],
  );
  assert.ok(new Set(stallKinds).size >= 3 && stallKinds.includes("produce"));
  assert.deepEqual(vendorKinds({ kind: "stall", id: "stall:2" }, "", { kinds: ["smith"] }, kinds), ["smith"]);
}

// Trades: a setting's guidance rewritten, and trades of the player's own with their goods typed in.
{
  assert.deepEqual(parseGoods("Stimpak, 20, +15 HP when used\nRad-X,12\n\nnonsense\nFree, 0\nstimpak, 3"), [
    { name: "Stimpak", price: 20, description: "+15 HP when used" },
    { name: "Rad-X", price: 12, description: "" },
  ]);
  const id = tradeId("Chem Dealer!", Object.keys(kinds));
  assert.equal(id, "own:chem-dealer");
  assert.equal(tradeId("Chem dealer", [id]), "own:chem-dealer-2");
  const saved = checkTrades(
    {
      smith: { guidance: "Only farm tools.", label: "Hacked" },
      [id]: { label: "Chem dealer", guidance: "Wasteland medicine.", goods: "Stimpak, 20", custom: true },
      "bad id": { label: "X" },
      "own:nameless": { guidance: "no name" },
    },
    kinds,
  );
  assert.deepEqual(Object.keys(saved), ["smith", id]);
  const all = tradeKinds(kinds, saved);
  assert.deepEqual(
    [all.smith.guidance, all.smith.label, all.smith.changed],
    ["Only farm tools.", kinds.smith.label, true],
  );
  assert.equal(all.general.guidance, kinds.general.guidance, "untouched trades keep the setting's");
  assert.deepEqual(
    [all[id].label, all[id].custom, all[id].stock],
    ["Chem dealer", true, [{ name: "Stimpak", price: 20, description: "" }]],
  );
  assert.deepEqual(vendorKinds(building("home"), "a house", { kinds: [id, "smith"] }, all), [id, "smith"]);
  assert.equal(tradeSign([id, "smith", "tailor"], all), "Chem dealer & Smith", "a sign has room for two");
  assert.equal(stockFor([id], all, "s", 0)[0].name, "Stimpak");
  for (const kind of Object.values(kinds)) assert.ok(kind.guidance, `${kind.label} has guidance for the model`);
}

// Haggling: what a Charisma check comes to, kept for the day, and what it does to prices and offers.
assert.deepEqual(
  [haggleOutcome(22).factor, haggleOutcome(15).factor, haggleOutcome(10).factor, haggleOutcome(3).factor],
  [0.8, 0.9, 1, 1.1],
);
assert.deepEqual(
  [haggled({ haggle: { day: 4, factor: 0.9 } }, 4), haggled({ haggle: { day: 4, factor: 0.9 } }, 5), haggled(null, 1)],
  [0.9, 1, 1],
);
assert.deepEqual([priceAfter(20, 0.9), priceAfter(1, 0.8), priceAfter(20, 1.1)], [18, 1, 22]);
assert.deepEqual([offerAfter(10, 0.9), offerAfter(10, 1.1), offerAfter(0, 0.8), offerAfter(1, 1.1)], [11, 9, 0, 1]);

// Shelves written by the model are checked before they're handed back: named, priced, none twice.
{
  const server = await import("../packages/wanderworld/server.mjs");
  assert.deepEqual(
    server.checkStock({
      stock: [
        { name: "Stimpak", description: "[+15 HP when used]", price: 20.4, quantity: 3 },
        { name: "stimpak", description: "again", price: 5 },
        { name: "", price: 3 },
        { name: "Free lunch", price: "nothing" },
        { name: "Rad-X", price: 99999, quantity: 40 },
        "junk",
      ],
    }),
    [
      { name: "Stimpak", description: "[+15 HP when used]", price: 20, quantity: 3 },
      { name: "Rad-X", description: "", price: 9999, quantity: 9 },
    ],
  );
  assert.deepEqual(server.checkStock(null), []);
  const asked = server.vendorStockMessages({
    worldName: "Ashfall",
    setting: "A wasteland.",
    shop: "Doc's",
    kinds: "Apothecary",
    currency: "caps",
    usual: "Health potion 15",
  });
  assert.match(
    asked[1].content,
    /The world: Ashfall: A wasteland\.\nThe shop: Doc's\. Its trade: Apothecary\.\nThe money is called caps\.\nUsual prices here: Health potion 15\./u,
  );
}

// How many of each trade (New world, Regenerate): the counts checked, what they need built, who takes what.
{
  const { assignVendors, checkVendorCounts, vendorNeeds } = await import("../packages/wanderworld/src/vendor.js");
  const counts = checkVendorCounts(
    { smith: { min: 2, max: 1 }, apothecary: { min: 0, max: 0 }, tailor: { min: 2 }, madeUp: { min: 3 }, general: {} },
    kinds,
  );
  assert.deepEqual(counts, {
    smith: { min: 2, max: 2 },
    apothecary: { min: 0, max: 0 },
    tailor: { min: 2, max: null },
  });
  assert.deepEqual(vendorNeeds({ tavern: 2, cave: 1 }, counts), { tavern: 2, cave: 1, smithy: 2, shop: 2 });
  const town = [
    { id: "building:1", kinds: ["smith"], flexible: false, fixed: false },
    { id: "building:2", kinds: ["general"], flexible: true, fixed: false },
    { id: "building:3", kinds: ["apothecary"], flexible: true, fixed: false },
    { id: "building:4", kinds: ["apothecary"], flexible: true, fixed: true },
    { id: "stall:0", kinds: ["produce"], flexible: true, fixed: false },
    { id: "stall:1", kinds: ["produce"], flexible: true, fixed: false },
  ];
  const set = assignVendors(town, { apothecary: { min: 0, max: 0 }, tailor: { min: 2, max: null } }, kinds);
  const after = town.map((vendor) => set[vendor.id] ?? vendor.kinds);
  const count = (id) => after.filter((list) => list.includes(id)).length;
  assert.equal(count("tailor"), 2, "the least of a trade is made up from shops and stalls");
  assert.equal(count("apothecary"), 1, "over the most, they give the trade up: all but the one set by hand");
  assert.deepEqual(after[0], ["smith"], "a smithy stays a smithy");
  assert.ok(!set["building:4"], "a vendor set by hand is never changed");
  assert.deepEqual(assignVendors(town, {}, kinds), {}, "no say: nothing changes");
  const shut = assignVendors(
    [{ id: "stall:0", kinds: ["produce"], flexible: true, fixed: false }],
    Object.fromEntries(Object.keys(kinds).map((id) => [id, { min: 0, max: 0 }])),
    kinds,
  );
  assert.deepEqual(shut, { "stall:0": [] }, "with no trade allowed, it shuts");
}

console.log("ok: vendors");
