// Where saved worlds are kept: with the Engine, each save a document of the package's own (server.mjs
// `/saves`). A world is as big as it needs to be, is in the Engine's backups, and is the same from any
// browser that opens it. A browser left open reads them again when it's shown again (`pull`), since
// another one may have played meanwhile.
//
// saves.js reads and writes through `getItem`/`setItem`/`removeItem` and never waits, so what the Engine
// keeps is read once (`connect`) and held here. A write that changes something is held at once and sent
// a few seconds later, the newest one for each key; writes that keep coming (the world as it's played)
// still go at least every `maxWait`. Until the Engine has answered nothing is sent: what it keeps isn't
// known yet, and mustn't be written over.
//
// Each save has a revision, the Engine's count of its writes. A write names the revision it was made
// from, and the Engine refuses it when another browser has written that save since (a conflict). Then
// `onConflict(key)` says whose copy is kept: true takes the Engine's, false sends this one again over it.

/** The settings every browser shares (settings.js `sharedSettings`): gameplay and AI, not graphics or controls. */
export const SHARED_SETTINGS = "wanderworld.shared";

/**
 * `remote`: { all(have) → Promise<{ [key]: { revision, value? } }>, put(key, text, revision) →
 * Promise<{ revision }>, remove(key) }, each a Promise. `all` is given the revisions held here by key, and
 * leaves out the value of a save still at that revision. `put` throws an error with
 * `conflict: { value, revision }` when the Engine's save isn't at `revision` (null: there's none yet).
 * `delay`: how long a write waits for the next one (milliseconds); `maxWait`: how long writes that keep
 * coming wait at most. `onProblem(error)`: a write the Engine didn't take; it's still held here, and goes
 * with the next write or `flush`. `onChange(keys)`: saves another browser wrote, now held here.
 */
export function createStore(
  remote,
  { delay = 4000, maxWait = 15000, onProblem = () => {}, onChange = () => {}, onConflict = () => true } = {},
) {
  const memory = new Map(); // what the Engine keeps, as text by key
  const revisions = new Map(); // key → the revision of the Engine's save that `memory` was read from or written as
  const waiting = new Map(); // key → the timer of a write not sent yet
  const since = new Map(); // key → when the oldest write of it not sent yet was made
  const unsent = new Set(); // keys whose last send failed
  const sending = new Map(); // key → the send in hand, so two for one key never cross
  let ready = false;

  /** Takes the Engine's copy of `key` (`value` not text: it has none). */
  const take = (key, { value, revision }) => {
    if (typeof value === "string") memory.set(key, value);
    else memory.delete(key);
    if (revision === null || revision === undefined) revisions.delete(key);
    else revisions.set(key, revision);
  };

  /** Sends what's held for `key` now (or its removal), after whatever is being sent for it. */
  const send = (key) => {
    const run = async () => {
      try {
        if (memory.has(key)) {
          const kept = await remote.put(key, memory.get(key), revisions.get(key) ?? null);
          if (kept?.revision !== undefined) revisions.set(key, kept.revision);
        } else {
          await remote.remove(key);
          revisions.delete(key);
        }
        unsent.delete(key);
      } catch (error) {
        if (!error?.conflict) {
          unsent.add(key);
          onProblem(error);
        } else if (onConflict(key)) {
          unsent.delete(key);
          take(key, error.conflict);
          onChange([key]);
        } else {
          // This browser's copy is kept: it goes again, over what's there now.
          revisions.set(key, error.conflict.revision);
          await run();
        }
      }
    };
    const next = (sending.get(key) ?? Promise.resolve()).then(run);
    sending.set(key, next);
    return next;
  };
  const later = (key) => {
    if (!ready) return;
    const now = Date.now();
    for (const each of new Set([key, ...unsent])) {
      if (!since.has(each)) since.set(each, now);
      clearTimeout(waiting.get(each));
      const wait = Math.max(0, Math.min(delay, since.get(each) + maxWait - now));
      waiting.set(
        each,
        setTimeout(() => {
          waiting.delete(each);
          since.delete(each);
          void send(each);
        }, wait),
      );
    }
  };
  const read = async () => {
    const held = (await remote.all(Object.fromEntries(revisions))) ?? {};
    return Object.entries(held).filter(([, save]) => save && typeof save === "object");
  };

  return {
    getItem: (key) => memory.get(key) ?? null,
    setItem(key, value) {
      const text = String(value);
      if (memory.get(key) === text) return; // nothing changed: nothing to send
      memory.set(key, text);
      later(key);
    },
    removeItem(key) {
      if (!memory.has(key)) return;
      memory.delete(key);
      later(key);
    },
    /** Every key held. */
    keys: () => [...memory.keys()],
    /** Whether the Engine's saves have been read (`connect`): until then nothing is kept. */
    get ready() {
      return ready;
    },
    /** Reads what the Engine keeps. Throws when the server part isn't there or doesn't answer. */
    async connect() {
      revisions.clear();
      const held = await read();
      memory.clear();
      for (const [key, save] of held) take(key, save);
      ready = true;
    },
    /** How many writes haven't reached the Engine yet (waiting, or failed). */
    get pending() {
      return new Set([...waiting.keys(), ...unsent]).size;
    },
    /**
     * Reads what the Engine keeps again: another browser may have played since. A write of this
     * browser's that hasn't been sent yet is kept; everything else becomes what the Engine has. Only the
     * saves that changed are sent; their keys are returned (and given to `onChange`).
     */
    async pull() {
      if (!ready) return void (await this.connect());
      await Promise.all(sending.values());
      const held = new Map(await read());
      const mine = new Set([...waiting.keys(), ...unsent]);
      const changed = [];
      for (const key of [...memory.keys()])
        if (!mine.has(key) && !held.has(key)) {
          take(key, { value: null, revision: null });
          changed.push(key);
        }
      for (const [key, save] of held)
        if (!mine.has(key) && typeof save.value === "string" && save.revision !== revisions.get(key)) {
          take(key, save);
          changed.push(key);
        }
      if (changed.length) onChange(changed);
      return changed;
    },
    /** Sends every write still waiting, and any that failed, now (the tab is closing, or the world is). */
    flush() {
      const keys = new Set([...waiting.keys(), ...(ready ? unsent : [])]);
      for (const key of waiting.keys()) clearTimeout(waiting.get(key));
      waiting.clear();
      since.clear();
      return Promise.all([...keys].map(send));
    },
  };
}
