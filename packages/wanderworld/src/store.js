// Where saved worlds are kept: with the Engine, each save a document of the package's own (server.mjs
// `/saves`). A world is as big as it needs to be, is in the Engine's backups, and is the same from any
// browser that opens it.
//
// saves.js reads and writes through `getItem`/`setItem`/`removeItem` and never waits, so what the Engine
// keeps is read once (`connect`) and held here; a write is held at once and sent a few seconds later,
// the newest one for each key. Until the Engine has answered nothing is sent: what it keeps isn't known
// yet, and mustn't be written over.

/** The settings every browser shares (settings.js `sharedSettings`): gameplay and AI, not graphics or controls. */
export const SHARED_SETTINGS = "wanderworld.shared";

/**
 * `remote`: { all() → Promise<{ [key]: text }>, put(key, text), remove(key) }, each a Promise. `delay`:
 * how long a write waits to be sent (milliseconds). `onProblem(error)`: a write the Engine didn't take;
 * it's still held here, and goes with the next write or `flush`.
 */
export function createStore(remote, { delay = 4000, onProblem = () => {} } = {}) {
  const memory = new Map(); // what the Engine keeps, as text by key
  const waiting = new Map(); // key → the timer of a write not sent yet
  const unsent = new Set(); // keys whose last send failed
  const sending = new Map(); // key → the send in hand, so two for one key never cross
  let ready = false;

  /** Sends what's held for `key` now (or its removal), after whatever is being sent for it. */
  const send = (key) => {
    const run = async () => {
      try {
        if (memory.has(key)) await remote.put(key, memory.get(key));
        else await remote.remove(key);
        unsent.delete(key);
      } catch (error) {
        unsent.add(key);
        onProblem(error);
      }
    };
    const next = (sending.get(key) ?? Promise.resolve()).then(run);
    sending.set(key, next);
    return next;
  };
  const later = (key) => {
    if (!ready) return;
    for (const each of new Set([key, ...unsent])) {
      clearTimeout(waiting.get(each));
      waiting.set(
        each,
        setTimeout(() => {
          waiting.delete(each);
          void send(each);
        }, delay),
      );
    }
  };

  return {
    getItem: (key) => memory.get(key) ?? null,
    setItem(key, value) {
      memory.set(key, String(value));
      later(key);
    },
    removeItem(key) {
      memory.delete(key);
      later(key);
    },
    /** Whether the Engine's saves have been read (`connect`): until then nothing is kept. */
    get ready() {
      return ready;
    },
    /** Reads what the Engine keeps. Throws when the server part isn't there or doesn't answer. */
    async connect() {
      const held = Object.entries((await remote.all()) ?? {}).filter(([, text]) => typeof text === "string");
      memory.clear();
      for (const [key, text] of held) memory.set(key, text);
      ready = true;
    },
    /** Sends every write still waiting, and any that failed, now (the tab is closing, or the world is). */
    flush() {
      const keys = new Set([...waiting.keys(), ...(ready ? unsent : [])]);
      for (const key of waiting.keys()) clearTimeout(waiting.get(key));
      waiting.clear();
      return Promise.all([...keys].map(send));
    },
  };
}
