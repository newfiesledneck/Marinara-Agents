// What each person remembers: only what they themselves saw, heard or were told. Kept apart for each of
// them, so when one is spoken to the model is given their memories and nobody else's: it can't know what
// someone across town was told, and it can't bring someone into a moment on the strength of it.
//
// A memory is a line of plain words with the day it happened. They're written by the game from what
// happens (what the player said in someone's hearing, who spent an evening with whom): no model is
// called to make or keep them. The newest few are what's told; old ones drop off the end.

/** How much is kept. */
export const MEMORY = {
  EACH: 14, // memories a person keeps
  PEOPLE: 80, // people with memories
  TEXT: 200, // characters a memory runs to
  TOPIC_DAYS: 3, // how long something the player said stays worth bringing up
};

const cut = (value) =>
  String(value ?? "")
    .replace(/\s+/gu, " ")
    .trim()
    .slice(0, MEMORY.TEXT);

/**
 * A world's memories. `saved`: what `state` gave before ({ [id]: [{ day, text, said, raised }] }).
 * `said` marks something the player said to them (worth bringing up later); `raised`, that they have.
 */
export function createMemories(saved = {}) {
  const store = new Map(
    Object.entries(saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {})
      .slice(0, MEMORY.PEOPLE)
      .map(([id, list]) => [
        id,
        (Array.isArray(list) ? list : [])
          .filter((entry) => entry && typeof entry.text === "string" && entry.text.trim())
          .slice(-MEMORY.EACH)
          .map((entry) => ({
            day: Number.isInteger(entry.day) ? entry.day : 0,
            text: cut(entry.text),
            ...(entry.said === true ? { said: true } : {}),
            ...(entry.raised === true ? { raised: true } : {}),
          })),
      ]),
  );
  return {
    /**
     * Each of `ids` remembers `text` (on `day`); `said`: it's something the player said to them. The same
     * thing twice running is one memory. Nobody else learns it.
     */
    remember(ids, text, day = 0, said = false) {
      const line = cut(text);
      if (!line) return;
      for (const id of new Set(ids)) {
        if (!id || id === "player") continue;
        const list = store.get(id) ?? [];
        if (list.at(-1)?.text === line) continue;
        if (!store.has(id) && store.size >= MEMORY.PEOPLE) store.delete(store.keys().next().value);
        store.set(id, [...list, { day, text: line, ...(said ? { said: true } : {}) }].slice(-MEMORY.EACH));
      }
    },
    /** The newest `count` things `id` remembers, oldest first: plain lines. */
    of(id, count = 6) {
      return (store.get(id) ?? []).slice(-count).map((entry) => entry.text);
    },
    /** Everything `id` remembers, newest first, for showing: [{ day, text }]. */
    list(id) {
      return [...(store.get(id) ?? [])].reverse().map(({ day, text }) => ({ day, text }));
    },
    /** Whether `id` has something the player said lately that they haven't brought up (as of `day`). */
    hasTopic(id, day = 0) {
      return (store.get(id) ?? []).some((entry) => entry.said && !entry.raised && day - entry.day <= MEMORY.TOPIC_DAYS);
    },
    /**
     * The newest thing the player said to `id` that they haven't brought up yet, marked as brought up
     * now; null when there's nothing. What they'd cross the square to mention.
     */
    raise(id, day = 0) {
      const entry = [...(store.get(id) ?? [])]
        .reverse()
        .find((memory) => memory.said && !memory.raised && day - memory.day <= MEMORY.TOPIC_DAYS);
      if (!entry) return null;
      entry.raised = true;
      return entry.text;
    },
    /** `id` forgets everything (or everyone does, with no id). */
    forget(id) {
      if (id === undefined) store.clear();
      else store.delete(id);
    },
    /** What to keep with the world. */
    get state() {
      return Object.fromEntries(store);
    },
  };
}
