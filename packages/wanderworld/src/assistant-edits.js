// What the player may change in the assistant's proposal before Confirm: the written parts of an edit, and
// its choices (a relationship's kind and strength, where someone lives and works, their body, voice and
// way with the player). Who an edit is about stays as proposed; a change can be left out instead. Plain
// data in, plain data out. The limits are the ones the server holds the model to (server.mjs
// `readAssistantEdit`), and whatever is chosen is checked against the world again when it's applied.
import { KINDS } from "./relationships.js";

const field = (key, label, max, multi = false, needed = false) => ({ key, label, max, multi, needed });
const choice = (key, label, options, more = {}) => ({ key, label, max: 80, options, ...more });

/** The kinds a relationship can be, to choose from: [{ value, label }], and "none" to end it. */
const KIND_OPTIONS = [
  ...Object.entries(KINDS).map(([value, kind]) => ({ value, label: kind.label })),
  { value: "none", label: "Nothing (end it)" },
];
const BODY_OPTIONS = [
  { value: "auto", label: "Either (chosen for them)" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "custom", label: "Custom (the gender you named in Settings)" },
];
const STANCE_OPTIONS = [
  { value: "", label: "As they feel (nothing set)" },
  { value: "rude", label: "Rude" },
  { value: "aggressive", label: "Aggressive" },
  { value: "attacks", label: "Attacks" },
  { value: "afraid", label: "Afraid" },
  { value: "avoids", label: "Avoids you" },
];
/** Places from the world (`lists.homes`, `lists.works`: [{ value, label }]), with a way to say none. */
const places = (list, none) => (lists) => [{ value: none, label: "None" }, ...(lists[list] ?? [])];
const voices = (lists) => [
  { value: "", label: "Their own" },
  ...(lists.voices ?? []).map((voice) => ({ value: voice, label: voice.charAt(0).toUpperCase() + voice.slice(1) })),
];

const FIELDS = {
  relate: [
    choice("kind", "Kind of relationship", KIND_OPTIONS),
    { key: "level", label: "How strong", number: [0, 100] },
    field("role", "What the first is to the second (optional: husband, mentor…)", 30),
    { ...field("backRole", "What the second is to the first (optional)", 30), when: (edit) => edit.both },
  ],
  home: [choice("place", "Home", places("homes", "none"), { loose: true, when: (edit) => !edit.with })],
  work: [choice("place", "Work", places("works", "none"), { loose: true })],
  set: [
    choice("body", "Body", BODY_OPTIONS),
    choice("voice", "Voice", voices, { loose: true }),
    choice("stance", "How they act toward you", STANCE_OPTIONS),
  ],
  lore: [field("text", "The lore", 200000, true, true)],
  card: [
    field("description", "Description", 200000, true),
    field("personality", "Personality", 200000, true),
    field("appearance", "Appearance", 200000, true),
  ],
  add_person: [
    field("name", "Name", 60, false, true),
    choice("body", "Body", [{ value: "", label: "Either (chosen for them)" }, ...BODY_OPTIONS.slice(1)]),
    field("description", "Description", 200000, true, true),
    field("personality", "Personality", 200000, true),
    field("appearance", "Appearance", 200000, true),
    choice("home", "Home", places("homes", ""), { loose: true, when: (edit) => !edit.with }),
    choice("work", "Work", places("works", ""), { loose: true }),
  ],
  rename: [field("name", "New name (empty for its first name)", 60)],
  world: [field("setting", "The setting", 600, true), field("look", "How it looks in pictures", 200)],
  notice: [field("text", "The note", 400, true, true), field("by", "From", 60)],
  errand: [field("text", "The errand", 400, true, true), field("done", "Told when it's done", 400, true)],
  scene: [field("premise", "How the scene opens", 600, true, true)],
  memory: [field("text", "The memory", 200, false, true)],
};

const partsOf = (edit) =>
  (FIELDS[edit?.do] ?? []).filter((part) => Object.hasOwn(edit, part.key) && (!part.when || part.when(edit)));

/**
 * The parts of `edit` the player may change: [{ key, label, max, multi, value, options, number }] (none
 * for some kinds). With `options` ([{ value, label }]) it's a choice from those, and what the edit has
 * now is always among them; with `number` ([least, most]) it's a number. `lists`: { homes, works: [{
 * value, label }], voices: [name] }, from the world.
 */
export function editableFields(edit, lists = {}) {
  return partsOf(edit).map(({ key, label, max, multi, options, number }) => {
    const value = edit[key] === null || edit[key] === undefined ? "" : String(edit[key]);
    const offered = typeof options === "function" ? options(lists) : options;
    return {
      key,
      label,
      max,
      multi: !!multi,
      value,
      ...(offered
        ? {
            options: offered.some((option) => option.value === value) ? offered : [{ value, label: value }, ...offered],
          }
        : {}),
      ...(number ? { number } : {}),
    };
  });
}

/**
 * The edits as the player left them in the proposal. `revised` is [{ edit: index, keep, values: { key:
 * text } }], one for each edit the proposal showed. An edit that isn't there (nothing was proposed from
 * it) or isn't kept is left out; text is trimmed and cut to its limit; a choice from a fixed list is one
 * of those offered, or stays as proposed; a number is kept within its range; an edit left with nothing in
 * a part it needs is left out and said. Returns { edits, skipped: [text] }.
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
      if (part.number) {
        const [least, most] = part.number;
        if (typed.trim() && Number.isFinite(Number(typed)))
          next[part.key] = Math.max(least, Math.min(most, Math.round(Number(typed))));
        continue;
      }
      if (part.options && !part.loose) {
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
