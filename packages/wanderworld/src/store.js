// Where saved worlds are kept. With the Engine, when Wanderworld's server part is there: each save is a
// document of the package's own (server.mjs `/saves`), so a world is as big as it needs to be, is in the
// Engine's backups, and is there from any browser. In this browser's storage when it isn't, as before.
//
// saves.js reads and writes through `getItem`/`setItem`/`removeItem` and never waits, so what the Engine
// keeps is read once (`connect`) and held here; a write is held at once and sent a few seconds later,
// the newest one for each key. Worlds still in the browser's storage go to the Engine on connecting (a
// world played since its Engine copy was written wins), and then leave the browser.

const INDEX = "wanderworld.worlds";
const LAST = "wanderworld.lastWorld";
const WORLD = "wanderworld.world.";
/** The settings every browser shares (settings.js `sharedSettings`): gameplay and AI, not graphics or controls. */
export const SHARED_SETTINGS = "wanderworld.shared";
// MIGRATION 0.5.69: where a browser's copy of a save goes once the Engine has it. Take out, with the
// `backup` option and its use in `connect`, once worlds have moved (and delete these keys then).
const BACKUP = "wanderworld.backup.";
/** The keys the Engine keeps (anything else of the package's stays in the browser: this device's settings, window places). */
const kept = (key) =>
  key === INDEX || key === LAST || key === SHARED_SETTINGS || (typeof key === "string" && key.startsWith(WORLD));

const parsed = (json, fallback) => {
  try {
    return JSON.parse(json ?? "null") ?? fallback;
  } catch {
    return fallback;
  }
};

/**
 * `local`: the browser's storage (getItem, setItem, removeItem, key, length). `remote`: { all() →
 * Promise<{ [key]: text }>, put(key, text), remove(key) }, each a Promise. `delay`: how long a write
 * waits to be sent (milliseconds). `onProblem(error)`: a write the Engine didn't take (it's kept in the
 * browser instead, and goes to the Engine the next time). `backup`: a save brought over from the browser
 * stays there under another name ("wanderworld.backup.…"), in case the move went wrong.
 */
export function createStore(local, remote, { delay = 4000, onProblem = () => {}, backup = true } = {}) {
  const memory = new Map(); // what the Engine keeps, as text by key
  const waiting = new Map(); // key → the timer of a write not sent yet
  const sending = new Map(); // key → the send in hand, so two for one key never cross
  let engine = false;

  const localGet = (key) => {
    try {
      return local?.getItem(key) ?? null;
    } catch {
      return null;
    }
  };
  const localDrop = (key) => {
    try {
      local?.removeItem(key);
    } catch {
      // blocked storage: it just stays
    }
  };
  const localKeys = () => {
    try {
      return Array.from({ length: local?.length ?? 0 }, (_, at) => local.key(at)).filter(kept);
    } catch {
      return [];
    }
  };

  /** Sends what's held for `key` now (or its removal), after whatever is being sent for it. */
  const send = (key) => {
    const run = async () => {
      try {
        if (memory.has(key)) await remote.put(key, memory.get(key));
        else await remote.remove(key);
        localDrop(key); // (a copy left by a failed send before)
      } catch (error) {
        // Not lost: in the browser until the Engine takes it (connect brings the newer one over).
        try {
          if (memory.has(key)) local?.setItem(key, memory.get(key));
        } catch {
          // full or blocked: it's still held here while the tab is open
        }
        onProblem(error);
      }
    };
    const next = (sending.get(key) ?? Promise.resolve()).then(run);
    sending.set(key, next);
    return next;
  };
  const later = (key) => {
    clearTimeout(waiting.get(key));
    waiting.set(
      key,
      setTimeout(() => {
        waiting.delete(key);
        void send(key);
      }, delay),
    );
  };
  const mine = (key) => engine && kept(key);

  return {
    getItem: (key) => (mine(key) ? (memory.get(key) ?? null) : localGet(key)),
    setItem(key, value) {
      if (!mine(key)) return local?.setItem(key, value); // (a full or blocked browser throws: saves.js carries on)
      memory.set(key, String(value));
      later(key);
      return undefined;
    },
    removeItem(key) {
      if (!mine(key)) return local?.removeItem(key);
      memory.delete(key);
      later(key);
      return undefined;
    },
    /** Whether saves are with the Engine (after `connect`), not in the browser. */
    get engine() {
      return engine;
    },
    /**
     * Reads what the Engine keeps and brings over what the browser still has. Throws when the server
     * part isn't there or doesn't answer, or didn't keep what it was sent: saves stay in the browser, as
     * they were. → the ids of the worlds brought over.
     */
    async connect() {
      const held = new Map(
        Object.entries((await remote.all()) ?? {}).filter(([key, text]) => kept(key) && typeof text === "string"),
      );
      const played = (text) => Number(parsed(text, {})?.playedAt) || 0;
      const moved = new Set();
      const sent = new Set(); // every key put here, to be read back before the browser's copy goes
      const put = async (key, text) => {
        await remote.put(key, text);
        held.set(key, text);
        sent.add(key);
      };
      const here = localKeys();
      for (const key of here.filter((entry) => entry.startsWith(WORLD))) {
        const text = localGet(key);
        if (text === null || (held.has(key) && played(text) <= played(held.get(key)))) continue;
        await put(key, text);
        moved.add(key.slice(WORLD.length));
      }
      // The list of worlds: the Engine's, with the browser's entry for each world it brought (or only it has).
      const list = (text) =>
        (Array.isArray(parsed(text, [])) ? parsed(text, []) : []).filter((entry) => typeof entry?.id === "string");
      const before = list(held.get(INDEX));
      const mineOnly = list(localGet(INDEX)).filter(
        (entry) =>
          held.has(WORLD + entry.id) && (moved.has(entry.id) || !before.some((other) => other.id === entry.id)),
      );
      if (mineOnly.length) {
        const ids = new Set(mineOnly.map((entry) => entry.id));
        const text = JSON.stringify([...before.filter((entry) => !ids.has(entry.id)), ...mineOnly]);
        await put(INDEX, text);
      }
      const last = localGet(LAST);
      if (last && (moved.has(last) || !held.has(LAST)) && held.has(WORLD + last)) {
        await put(LAST, last);
      }
      // Read back: the Engine has every one of them, letter for letter, or nothing is taken from the browser.
      if (sent.size) {
        const now = (await remote.all()) ?? {};
        const lost = [...sent].filter((key) => now[key] !== held.get(key));
        if (lost.length) throw new Error(`The Engine didn't keep ${lost.length} of ${sent.size} saves it was sent.`);
      }
      // Everything is with the Engine: from here on it's read from there, and the browser's copies go.
      memory.clear();
      for (const [key, text] of held) memory.set(key, text);
      engine = true;
      for (const key of here) {
        const text = localGet(key);
        localDrop(key);
        if (!backup || text === null) continue;
        try {
          local?.setItem(BACKUP + key.slice("wanderworld.".length), text);
        } catch {
          // full or blocked: the Engine has it (read back above)
        }
      }
      return [...moved];
    },
    /** Sends every write still waiting, now (the tab is closing, or the world is). */
    flush() {
      const keys = [...waiting.keys()];
      for (const key of keys) {
        clearTimeout(waiting.get(key));
        waiting.delete(key);
      }
      return Promise.all(keys.map(send));
    },
  };
}
