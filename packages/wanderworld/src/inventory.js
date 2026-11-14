// What the player wears and carries, kept by the Quartermaster package when it's installed (its README,
// "For other packages"): a character sheet for each persona in each world, opened from the Inventory
// button, with what is worn told to the AI and, after something is narrated, its tracker asked what
// changed. Wanderworld never needs it: without Quartermaster (or with Settings → People → Inventory off)
// there is no button and nothing here does anything.
import { request } from "./ai.js";

const BASE = "/api/quartermaster";
// What Wanderworld uses of it (`features` in its GET /status); an older Quartermaster shows no button.
const NEEDS = ["scopes", "owners", "appearance", "tracker-routes"];
// A sheet's Feed setting says how worn things are written; a new sheet's is Off (it is a chat's macro
// that Off turns off), and then this stands in.
const FEED = "equippedNamesDescriptions";

const clean = (value) =>
  String(value ?? "")
    .replace(/[^A-Za-z0-9_-]/gu, "_")
    .slice(0, 100);

/** The sheet of persona `personaId` in world `worldId`: { scope, owner }, or null with no world. */
export function sheetFor(worldId, personaId) {
  if (!clean(worldId)) return null;
  return {
    scope: `wanderworld:${clean(worldId)}`,
    owner: clean(personaId) ? `persona:${clean(personaId)}` : "persona",
  };
}

const keyOf = (sheet) => `${sheet.scope}|${sheet.owner}`;
const pathOf = (sheet, rest = "") =>
  `/inventory/${encodeURIComponent(sheet.scope)}/${encodeURIComponent(sheet.owner)}${rest}`;

/**
 * `ai()` is the server part (ai.js), `sheet()` the sheet being played ({ scope, owner } or null),
 * `persona()` who it's about ({ personaId, name }), `settings()` the player's settings, and `onReady()`
 * is called when it's known whether Quartermaster is there.
 */
export function createInventory({ ai, sheet, persona, settings, onReady }) {
  let status = null;
  let checking = null;
  let worn = { key: "", text: "" };
  let queue = Promise.resolve();
  const introduced = new Set();
  const call = (path, options) => request(path, { base: BASE, timeout: 20000, ...options });

  function check() {
    checking ??= call("/status", { timeout: 8000 })
      .then((answer) => {
        status = NEEDS.every((feature) => answer?.features?.includes(feature)) ? answer : null;
      })
      .catch(() => {
        status = null;
      })
      .then(() => onReady?.());
    return checking;
  }
  const ready = () => !!status && settings().inventory === true;

  /** Says who a sheet is about, once: Quartermaster has no chat to take the persona from. */
  async function introduce(current) {
    if (introduced.has(keyOf(current))) return;
    const who = persona();
    await call(pathOf(current, "/owner"), {
      method: "PATCH",
      body: who.personaId ? { personaId: who.personaId } : { name: who.name },
    });
    introduced.add(keyOf(current));
  }

  /** Reads what is worn again (the sheet may have changed in the dock or by the tracker). */
  async function refresh() {
    await check();
    const current = sheet();
    if (!ready() || !current) return;
    try {
      let answer = await call(pathOf(current, "/appearance"));
      if (answer?.mode === "off" && answer.equipped?.length) {
        answer = await call(pathOf(current, `/appearance?mode=${FEED}`));
      }
      worn = { key: keyOf(current), text: typeof answer?.text === "string" ? answer.text : "" };
    } catch {
      worn = { key: keyOf(current), text: "" }; // nothing told, and not asked again with every line
    }
  }
  globalThis.addEventListener?.("quartermaster:changed", (event) => {
    if (event.detail?.scope === sheet()?.scope) void refresh();
  });

  return {
    check,
    ready,
    refresh,
    /** What the persona is wearing, in words for a prompt; "" when unknown, off or nothing. */
    worn() {
      const current = sheet();
      if (!ready() || !current || settings().inventoryWorn !== true) return "";
      if (worn.key !== keyOf(current)) {
        void refresh(); // another world or persona: known by the next line
        return "";
      }
      return worn.text;
    },
    /** Opens Quartermaster's dock on the sheet being played, or closes it. */
    async toggle() {
      const current = sheet();
      if (!ready() || !current) throw new Error("Quartermaster isn't installed, or it is an older version.");
      // The Engine loads Quartermaster's client only once a Roleplay chat shows it; this is the same
      // address, so the browser keeps one copy.
      if (!globalThis.Quartermaster) {
        await import(`/api/capability-packages/quartermaster/client?v=${encodeURIComponent(status.version)}`);
      }
      const who = persona();
      await globalThis.Quartermaster.toggle({
        ...current,
        persona: who.personaId ? { personaId: who.personaId } : { name: who.name },
      });
      introduced.add(keyOf(current));
    },
    /** Closes the dock (the world is left). */
    close() {
      if (globalThis.Quartermaster?.isOpen?.()) globalThis.Quartermaster.close();
    },
    /**
     * Quartermaster's tracker reads `told` (what was just said and narrated) with Wanderworld's own model
     * call, and the sheet takes what changed by Quartermaster's own rules. One at a time, in order.
     * Resolves true when the sheet changed; rejects when a step failed.
     */
    track(told, connectionId) {
      const current = sheet();
      if (!ready() || !current || !told) return Promise.resolve(false);
      const run = async () => {
        await introduce(current);
        const asked = await call(pathOf(current, "/tracker/context"));
        const { data } = await ai().inventoryTrack({
          promptTemplate: asked.promptTemplate,
          context: asked.context,
          personaName: persona().name,
          text: told,
          connectionId,
        });
        const answer = await call(pathOf(current, "/tracker/apply"), { method: "POST", body: { data } });
        if (answer?.applied !== true) return false;
        await refresh();
        globalThis.Quartermaster?.reload?.(current.scope, current.owner);
        return true;
      };
      const result = queue.then(run);
      queue = result.catch(() => {});
      return result;
    },
    /** A world is deleted: its sheets go with it. */
    forget(worldId) {
      const gone = sheetFor(worldId, null);
      if (!gone) return;
      void check()
        .then(() => status && call(`/scopes/${encodeURIComponent(gone.scope)}`, { method: "DELETE" }))
        .catch(() => {});
    },
  };
}
