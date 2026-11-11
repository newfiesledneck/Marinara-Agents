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
