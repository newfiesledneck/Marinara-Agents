// What the player may rewrite in the assistant's proposal before Confirm: the written parts of an edit and
// the kind of a relationship (who and where stay as proposed; a change can be left out instead). Plain data in, plain data out.
// The limits are the ones the server holds the model to (server.mjs `readAssistantEdit`).

import { KINDS } from "./relationships.js";

const field = (key, label, max, multi = false, needed = false) => ({ key, label, max, multi, needed });

/** The kinds a relationship can be, to choose from: [{ value, label }], and "none" to end it. */
const KIND_OPTIONS = [
  ...Object.entries(KINDS).map(([value, kind]) => ({ value, label: kind.label })),
  { value: "none", label: "Nothing (end it)" },
];

const FIELDS = {
  relate: [
    { ...field("kind", "Kind of relationship", 20), options: KIND_OPTIONS },
    field("role", "What the first is to the second (optional: husband, mentor…)", 30),
    { ...field("backRole", "What the second is to the first (optional)", 30), when: (edit) => edit.both },
  ],
  lore: [field("text", "The lore", 1400, true, true)],
  card: [
    field("description", "Description", 1200, true),
    field("personality", "Personality", 600, true),
    field("appearance", "Appearance", 600, true),
  ],
  add_person: [
    field("name", "Name", 60, false, true),
    field("description", "Description", 1200, true, true),
    field("personality", "Personality", 500, true),
    field("appearance", "Appearance", 500, true),
  ],
  rename: [field("name", "New name (empty for its first name)", 60)],
  world: [field("setting", "The setting", 600, true), field("look", "How it looks in pictures", 200)],
  notice: [field("text", "The note", 400, true, true), field("by", "From", 60)],
  errand: [field("text", "The errand", 400, true, true), field("done", "Told when it's done", 400, true)],
};

const partsOf = (edit) =>
  (FIELDS[edit?.do] ?? []).filter((part) => Object.hasOwn(edit, part.key) && (!part.when || part.when(edit)));

/**
 * The parts of `edit` the player may rewrite: [{ key, label, max, multi, value, options }] (none for most
 * kinds); with `options` ([{ value, label }]) it's a choice from those.
 */
export function editableFields(edit) {
  return partsOf(edit).map(({ key, label, max, multi, options }) => ({
    key,
    label,
    max,
    multi,
    value: String(edit[key] ?? ""),
    ...(options ? { options } : {}),
  }));
}

/**
 * The edits as the player left them in the proposal. `revised` is [{ edit: index, keep, values: { key:
 * text } }], one for each edit the proposal showed. An edit that isn't there (nothing was proposed from
 * it) or isn't kept is left out; text is trimmed and cut to its limit; a choice is one of those offered; an edit left with nothing in a
 * part it needs is left out and said. Returns { edits, skipped: [text] }.
 */
export function reviseEdits(edits, revised) {
  const by = new Map((Array.isArray(revised) ? revised : []).map((entry) => [entry.edit, entry]));
  const out = [];
  const skipped = [];
  edits.forEach((edit, at) => {
    const mine = by.get(at);
    if (!mine?.keep) return;
    const parts = partsOf(edit);
    const next = { ...edit };
    for (const part of parts) {
      const typed = mine.values?.[part.key];
      if (typeof typed !== "string") continue;
      if (part.options) {
        // A choice: one of those offered, or it stays as proposed.
        if (part.options.some((option) => option.value === typed)) next[part.key] = typed;
        continue;
      }
      const words = (
        part.multi ? typed.replace(/[ \t]+/gu, " ").replace(/\n{3,}/gu, "\n\n") : typed.replace(/\s+/gu, " ")
      )
        .trim()
        .slice(0, part.max);
      // A card's part left empty is a part left as it is.
      if (edit.do === "card" && !words) delete next[part.key];
      else next[part.key] = words;
    }
    const empty =
      parts.find((part) => part.needed && !next[part.key]) ??
      (edit.do === "card" && !parts.some((part) => next[part.key]) ? parts[0] : null);
    if (empty) skipped.push(`"${empty.label}" was left empty, so that change wasn't made.`);
    else out.push(next);
  });
  return { edits: out, skipped };
}
