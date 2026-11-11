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
  SIGHTS: 5, // of them, things only seen in passing (the oldest sight goes first)
  HEARSAY: 3, // and things only told by someone else (the oldest goes first)
  GOSSIP_PER_HOUR: 0.5, // how likely one of two people together is to pass something on, each hour
};

const cut = (value) =>
  String(value ?? "")
    .replace(/\s+/gu, " ")
    .trim()
    .slice(0, MEMORY.TEXT);

/**
 * A world's memories. `saved`: what `state` gave before ({ [id]: [{ day, text, said, raised, how, from }] }).
 * `said` marks something the player said to them (worth bringing up later); `raised`, that they have;
 * `how` is how they came by it ("saw", "heard", or "told" by `from`: second-hand).
 */
/** How a memory was come by, in the words the model is given. */
const HOW = { saw: "saw", heard: "heard", told: "was told" };

/** `day` as against `today`, in words. */
const ago = (day, today) => {
  const days = Math.max(0, Math.round(today - day));
  return days === 0 ? "today" : days === 1 ? "yesterday" : `${days} days ago`;
};

/**
 * The chat as those in earshot now know it, for the model. `log` is the chat ([{ who, text, heard: [ids] }]:
 * `heard` is who was in earshot when it was said), `listeners` who's here ([{ id }]).
 * → { shared: [{ who, text }], own: { [id]: [{ who, text }] } }: `shared` is what every one of them heard
 * (the last `max`, in order), `own` what each heard that not all of them did (the last four). A line none
 * of them heard is in neither, so nobody can speak of what they weren't there for. With nobody listening,
 * `shared` is the narrator's own last three lines, kept so the telling doesn't repeat itself.
 */
export function heardLines(log, listeners, max = 12) {
  const plain = ({ who, text }) => ({ who, text });
  if (!listeners.length)
    return {
      shared: log
        .filter((line) => line.who === "Narrator")
        .slice(-3)
        .map(plain),
      own: {},
    };
  const shared = [];
  const own = Object.fromEntries(listeners.map((person) => [person.id, []]));
  for (const line of log) {
    const heard = new Set(line.heard ?? []);
    const there = listeners.filter((person) => heard.has(person.id));
    if (!there.length) continue;
    if (there.length === listeners.length) shared.push(plain(line));
    else for (const person of there) own[person.id].push(plain(line));
  }
  for (const id of Object.keys(own)) own[id] = own[id].slice(-4);
  return { shared: shared.slice(-max), own };
}

/** The chat's last `max` lines that any of `ids` heard (a scene's cast: what they bring to it). */
export function heardBy(log, ids, max = 8) {
  const cast = new Set(ids);
  return log
    .filter((line) => (line.heard ?? []).some((id) => cast.has(id)))
    .slice(-max)
    .map(({ who, text }) => ({ who, text }));
}

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
            ...(HOW[entry.how] ? { how: entry.how } : {}),
            ...(typeof entry.from === "string" && entry.from.trim() ? { from: entry.from.trim().slice(0, 60) } : {}),
          })),
      ]),
  );
  return {
    /**
     * Each of `ids` remembers `text` (on `day`); `said`: it's something the player said to them; `how`:
     * "saw", "heard" or "told" (by `from`). The same thing twice running is one memory. Nobody else
     * learns it. Things only seen are kept to a few, so they don't crowd out what was said.
     */
    remember(ids, text, day = 0, said = false, how = "", from = "") {
      const line = cut(text);
      if (!line) return;
      for (const id of new Set(ids)) {
        if (!id || id === "player") continue;
        const list = store.get(id) ?? [];
        if (list.at(-1)?.text === line) continue;
        if (!store.has(id) && store.size >= MEMORY.PEOPLE) store.delete(store.keys().next().value);
        const most = { saw: MEMORY.SIGHTS, told: MEMORY.HEARSAY }[how];
        const kept =
          most && list.filter((entry) => entry.how === how).length >= most
            ? list.filter((entry, i) => i !== list.findIndex((old) => old.how === how))
            : list;
        const entry = {
          day,
          text: line,
          ...(said ? { said: true } : {}),
          ...(HOW[how] ? { how } : {}),
          ...(how === "told" && from ? { from: String(from).slice(0, 60) } : {}),
        };
        store.set(id, [...kept, entry].slice(-MEMORY.EACH));
      }
    },
    /** The newest `count` things `id` remembers, oldest first: plain lines. */
    of(id, count = 6) {
      return (store.get(id) ?? []).slice(-count).map((entry) => entry.text);
    },
    /**
     * The newest `count` things `id` knows, oldest first, each said with when and how they came by it,
     * as the model is told: "(yesterday, heard) …", "(today, was told by Corvin) …".
     */
    known(id, count = 5, today = 0) {
      return (store.get(id) ?? []).slice(-count).map((entry) => {
        const how = entry.how
          ? `, ${HOW[entry.how]}${entry.how === "told" && entry.from ? ` by ${entry.from}` : ""}`
          : "";
        return `(${ago(entry.day, today)}${how}) ${entry.text}`;
      });
    },
    /**
     * Gossip: `from` (called `fromName`) tells `to` the newest thing they saw or heard themselves in the
     * last few days that `to` doesn't know: `to` remembers it as told by them. → what was passed on, or
     * null. Only first-hand things are passed (hearsay stops with whoever was told it), and nothing that
     * was whispered.
     */
    pass(from, to, fromName, day = 0) {
      if (!from || !to || from === to || from === "player" || to === "player") return null;
      const retold = (text) => text.replace(/ said to you: /u, ` said to ${fromName}: `);
      const has = new Set((store.get(to) ?? []).map((entry) => entry.text));
      const entry = [...(store.get(from) ?? [])].reverse().find(
        (memory) =>
          (memory.how === "saw" || memory.how === "heard") &&
          day - memory.day <= MEMORY.TOPIC_DAYS &&
          !/ whispered: /u.test(memory.text) && // ponytail: told by its wording; a flag on the memory if more kinds need keeping
          !has.has(retold(memory.text)),
      );
      if (!entry) return null;
      this.remember([to], retold(entry.text), day, false, "told", fromName);
      return retold(entry.text);
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
