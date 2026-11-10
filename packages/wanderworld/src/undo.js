// Undo for the assistant's changes, and only those: what it changed goes back, and anything that changed
// since by another hand (the Journal, play) stays. Plain data in, plain data out; nothing here knows the world.

const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

function equal(a, b) {
  if (a === b) return true;
  if (Array.isArray(a)) return Array.isArray(b) && a.length === b.length && a.every((item, at) => equal(item, b[at]));
  if (!isRecord(a) || !isRecord(b)) return false;
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every((key) => key in b && equal(a[key], b[key]));
}

/** What makes two items of a list the same thing: its id, a relationship's two ends, a lore tie's entry. */
function keyOf(item) {
  if (!isRecord(item)) return JSON.stringify(item);
  if (typeof item.id === "string") return `id:${item.id}`;
  if (typeof item.from === "string" && typeof item.to === "string") return `${item.from}→${item.to}`;
  if (typeof item.entryId === "string") return `${item.lorebookId}:${item.entryId}`;
  return JSON.stringify(item);
}

/**
 * `now` with the change from `before` to `after` taken back, and nothing else:
 * - what the change left alone stays as it is now;
 * - what is still as the change left it goes back to how it was before;
 * - what has changed again since stays as it is now (the later hand wins);
 * - in a list, what the change added goes, and what it took away comes back (unless it's back already).
 * `whole(path)` says a value is one thing, taken or left entire and never merged part by part.
 */
export function undoOnly(before, after, now, whole = () => false, path = []) {
  if (equal(before, after)) return now;
  if (equal(now, after)) return before;
  if (whole(path)) return now;
  if (isRecord(before) && isRecord(after) && isRecord(now)) {
    const out = {};
    for (const key of new Set([...Object.keys(now), ...Object.keys(before)])) {
      const value = undoOnly(before[key], after[key], now[key], whole, [...path, key]);
      if (value !== undefined) out[key] = value;
    }
    return out;
  }
  if (Array.isArray(before) && Array.isArray(after) && Array.isArray(now)) {
    const was = new Map(before.map((item) => [keyOf(item), item]));
    const left = new Map(after.map((item) => [keyOf(item), item]));
    const out = [];
    const seen = new Set();
    for (const item of now) {
      const key = keyOf(item);
      seen.add(key);
      if (left.has(key) && !was.has(key)) continue; // the change added it
      const value = undoOnly(was.get(key), left.get(key), item, whole, [...path, key]);
      if (value !== undefined) out.push(value);
    }
    for (const [key, item] of was) if (!left.has(key) && !seen.has(key)) out.push(item); // the change took it away
    return out;
  }
  return now;
}

/**
 * A world's fields with nothing left pointing at what an undo took away: the invented people ("local:…")
 * who are no longer in `locals`, and the world's own lore entries no longer in its book.
 */
export function withoutLeftovers(fields) {
  const locals = new Set(fields.locals.map((person) => person.id));
  const gone = (id) => typeof id === "string" && id.startsWith("local:") && !locals.has(id);
  const entries = new Set(fields.book.entries.map((entry) => entry.id));
  const kept = (map) => Object.fromEntries(Object.entries(map ?? {}).filter(([id]) => !gone(id)));
  const lore = {};
  for (const [target, ties] of Object.entries(fields.lore)) {
    if (target.startsWith("character:") && gone(target.slice("character:".length))) continue;
    const left = ties.filter((tie) => tie.lorebookId !== "world" || entries.has(tie.entryId));
    if (left.length) lore[target] = left;
  }
  return {
    ...fields,
    lore,
    cast: fields.cast.filter((id) => !gone(id)),
    known: fields.known.filter((id) => !gone(id)),
    knowsMe: fields.knowsMe.filter((id) => !gone(id)),
    relationships: fields.relationships.filter((record) => !gone(record.from) && !gone(record.to)),
    factions: fields.factions.map((faction) => ({
      ...faction,
      members: (faction.members ?? []).filter((id) => !gone(id)),
    })),
    housing: kept(fields.housing),
    schedules: kept(fields.schedules),
    traits: kept(fields.traits),
    voices: kept(fields.voices),
    stances: kept(fields.stances),
    bodies: fields.bodies ? kept(fields.bodies) : fields.bodies,
    errand: gone(fields.errand?.person) ? null : fields.errand,
  };
}
