// The player's household, as plain rules (no model is called): which buildings are homes and which stand
// empty, what moving house does to who lives where, where someone asked to leave goes, and the stretch of
// a day someone asked round spends at the player's home. main.js applies these to the world's save
// (`housing`: { [id]: { home, work, owner } }, zones.js ids) and to people's schedules.

/** The kinds of building someone lives in. */
export const LIVED_IN = new Set(["home", "cottage", "farm"]);
/** How long someone asked round stays (hours of the world's day). */
export const VISIT_HOURS = 3;

const blank = { home: null, work: null, owner: false };

/** The zones that are homes: buildings of a lived-in kind, with a door. */
export function homesOf(zones) {
  return (zones ?? []).filter(
    (zone) => zone.kind === "building" && Number.isInteger(zone.door) && LIVED_IN.has(zone.buildingKind),
  );
}

/**
 * The homes nobody lives in, other than `mine` (a zone id or null). `people`: everyone here, each with
 * `home` (the door index of where they live, or null).
 */
export function vacantHomes(zones, people, mine = null) {
  const lived = new Set(people.map((person) => person.home).filter((door) => door !== null));
  return homesOf(zones).filter((zone) => zone.id !== mine && !lived.has(zone.door));
}

/**
 * Who lives where once `who` (an id) moves from `from` to `to` (zone ids; `from` null for no home yet):
 * of `mates` (the ids living at `from` with them), those in `bring` go too, and the rest are set down as
 * living at `from`, so nothing moves them by chance.
 */
export function housingAfterMove(housing, { who, from, to, mates = [], bring = [] }) {
  const next = { ...housing, [who]: { ...blank, ...housing?.[who], home: to } };
  for (const mate of mates) next[mate] = { ...blank, ...housing?.[mate], home: bring.includes(mate) ? to : from };
  return next;
}

/**
 * Where someone asked to leave `mine` goes: the home with the fewest people in it (an empty one, if there
 * is one), or null when there's no other home at all.
 */
export function homeToLeaveFor(zones, people, mine) {
  const count = (zone) => people.filter((person) => person.home === zone.door).length;
  return (
    homesOf(zones)
      .filter((zone) => zone.id !== mine)
      .sort((a, b) => count(a) - count(b))[0] ?? null
  );
}

/**
 * A visit that starts at `hour` (0…24) on `day`: the schedule's hours for it (quarter hours, as a
 * schedule's are; it may run past midnight) and `until`, when it's over, in hours since the world began.
 */
export function visitFrom(hour, day = 0, hours = VISIT_HOURS) {
  const from = Math.floor(hour * 4) / 4;
  return { from, to: (from + hours) % 24, until: day * 24 + hour + hours };
}

/** Whether a visit is over at `hour` of `day` (also when the clock's been set back to before it began). */
export function visitOver(visit, hour, day = 0, hours = VISIT_HOURS) {
  const now = day * 24 + hour;
  return now >= visit.until || now < visit.until - hours - 0.5;
}

// ── Furnishing ───────────────────────────────────────────────────────────────

/**
 * What a home can be furnished with: its name, the props kit's model, how wide and deep it stands (metres,
 * at `scale`), and whether it's sat on.
 */
export const FURNITURE = {
  chair: { label: "Chair", model: "chair-1", width: 0.58, depth: 0.55, seat: true },
  stool: { label: "Stool", model: "stool", width: 0.47, depth: 0.47, seat: true },
  table: { label: "Long table", model: "table-large", width: 2.85, depth: 1.1 },
  smallTable: { label: "Small table", model: "table-large", width: 1.43, depth: 0.77, scale: [0.5, 1, 0.7] },
  bench: { label: "Bench", model: "bench", width: 2.78, depth: 0.53 },
  bookcase: { label: "Bookcase", model: "bookcase-2", width: 1.46, depth: 0.43 },
  cabinet: { label: "Cabinet", model: "cabinet", width: 1.36, depth: 0.36 },
  nightstand: { label: "Nightstand", model: "nightstand-shelf", width: 0.69, depth: 0.39 },
  chest: { label: "Chest", model: "chest-wood", width: 1.28, depth: 0.76 },
  barrel: { label: "Barrel", model: "barrel", width: 0.7, depth: 0.7 },
  crate: { label: "Crate", model: "crate-wooden", width: 0.84, depth: 0.91 },
  candles: { label: "Candle stand", model: "candlestick-stand", width: 0.73, depth: 0.73 },
  vase: { label: "Vase", model: "vase-2", width: 0.69, depth: 0.69 },
  cauldron: { label: "Cauldron", model: "cauldron", width: 0.99, depth: 0.94 },
  lectern: { label: "Lectern", model: "bookstand", width: 0.51, depth: 0.51 },
  workbench: { label: "Workbench", model: "workbench", width: 2.02, depth: 1.02 },
  weapons: { label: "Weapon stand", model: "weaponstand", width: 1.39, depth: 0.98 },
  dummy: { label: "Training dummy", model: "dummy", width: 0.81, depth: 0.58 },
};
/** The most pieces one home holds. */
export const FURNITURE_MAX = 40;
/** How close to the way in nothing may stand (metres from where you come in). */
const DOORWAY = 1.3;

/** The floor a piece stands on, turned as it is: { minX, maxX, minZ, maxZ }. */
export function footprint({ piece, x, z, angle }) {
  const { width, depth } = FURNITURE[piece];
  const halfX = (Math.abs(Math.cos(angle)) * width + Math.abs(Math.sin(angle)) * depth) / 2;
  const halfZ = (Math.abs(Math.sin(angle)) * width + Math.abs(Math.cos(angle)) * depth) / 2;
  return { minX: x - halfX, maxX: x + halfX, minZ: z - halfZ, maxZ: z + halfZ };
}

/** A home's pieces as saved, made safe: only pieces there are, at places a room could have. */
export function checkFurniture(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (entry) =>
        entry &&
        typeof entry === "object" &&
        Object.hasOwn(FURNITURE, entry.piece) &&
        [entry.x, entry.z, entry.angle].every(Number.isFinite) &&
        Math.abs(entry.x) <= 8 &&
        Math.abs(entry.z) <= 8,
    )
    .slice(0, FURNITURE_MAX)
    .map(({ piece, x, z, angle }) => ({ piece, x: Math.round(x * 100) / 100, z: Math.round(z * 100) / 100, angle }));
}

/** Every home's pieces as saved ({ [zone id]: pieces }), made safe; homes with none are left out. */
export function checkFurnished(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return Object.fromEntries(
    Object.entries(raw)
      .map(([id, list]) => [id, checkFurniture(list)])
      .filter(([, list]) => list.length),
  );
}

/**
 * Puts `piece` down at `at` ({ x, z, angle }) in a room (`halfWidth`, `halfDepth`, and `entry`, where you
 * come in): moved in from the walls if it would stand in one. Returns { list } (the home's pieces with it
 * added) or { error } (words for the player) when it can't go there.
 */
export function placeFurniture(list, piece, at, room) {
  if (!Object.hasOwn(FURNITURE, piece)) return { error: "There's no such piece." };
  if (list.length >= FURNITURE_MAX)
    return { error: `A home holds ${FURNITURE_MAX} pieces of your own. Take one away first.` };
  const entry = { piece, x: at.x, z: at.z, angle: at.angle };
  const box = footprint(entry);
  const [halfX, halfZ] = [(box.maxX - box.minX) / 2, (box.maxZ - box.minZ) / 2];
  const [roomX, roomZ] = [room.halfWidth - halfX - 0.05, room.halfDepth - halfZ - 0.05];
  if (roomX < 0 || roomZ < 0) return { error: "That won't fit in this room." };
  entry.x = Math.round(Math.max(-roomX, Math.min(roomX, entry.x)) * 100) / 100;
  entry.z = Math.round(Math.max(-roomZ, Math.min(roomZ, entry.z)) * 100) / 100;
  const placed = footprint(entry);
  const nearX = Math.max(placed.minX, Math.min(room.entry.x, placed.maxX));
  const nearZ = Math.max(placed.minZ, Math.min(room.entry.z, placed.maxZ));
  if (Math.hypot(nearX - room.entry.x, nearZ - room.entry.z) < DOORWAY)
    return { error: "Not there: it would block the way in." };
  return { list: [...list, entry] };
}
