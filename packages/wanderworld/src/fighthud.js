// What a fight shows, as plain data: each fighter as a nameplate over them, a card in the turn order and a
// line in the real-time list; what just happened in a few words; the info card for a creature or a person;
// what the player knows of each kind of creature; and who stands over a beaten player and what they do.
// main.js gathers the fighters, plates.js draws the nameplates and hud.js the rest. Nothing here touches
// the page or the scene, so all of it can be tested without a browser.

/** The marks for what's on someone: a glyph for a nameplate, and a word for the cards. */
export const STATUS = {
  prone: { icon: "↓", label: "Prone" },
  poisoned: { icon: "☠", label: "Poisoned" },
  frightened: { icon: "!", label: "Frightened" },
  grappled: { icon: "✋", label: "Grappled" },
  restrained: { icon: "#", label: "Restrained" },
  blinded: { icon: "◐", label: "Blinded" },
  paralyzed: { icon: "ϟ", label: "Paralyzed" },
  stunned: { icon: "✶", label: "Stunned" },
  asleep: { icon: "z", label: "Asleep" },
  slowed: { icon: "≈", label: "Slowed" },
  hindered: { icon: "−", label: "Hindered" },
  marked: { icon: "◎", label: "Marked" },
  held: { icon: "✋", label: "Held" }, // (by a creature's hold: grapple.js)
  holding: { icon: "✊", label: "Holding someone" },
  rooted: { icon: "#", label: "Held in place" },
  calmed: { icon: "♥", label: "Calmed" },
  hidden: { icon: "◌", label: "Hidden" },
  raging: { icon: "▲", label: "Raging" },
  dodging: { icon: "◇", label: "Dodging" },
  dying: { icon: "✚", label: "Dying" },
  down: { icon: "✕", label: "Down" },
};

/** `ids` as marks to show: [{ id, icon, label }], each once, only those known. */
export const statusMarks = (ids = []) =>
  [...new Set(ids)].filter((id) => STATUS[id]).map((id) => ({ id, ...STATUS[id] }));

/** HP left as a share of the most (0 to 1). */
export const hpShare = (hp, max) => (max > 0 ? Math.max(0, Math.min(1, hp / max)) : 0);

/** A bar's colour by how much is left: green, yellow, orange, then red. */
export const hpColour = (share) =>
  share > 0.66 ? "#4fbf5a" : share > 0.4 ? "#e0c341" : share > 0.2 ? "#ec8a2e" : "#e5463b";

/** How hurt, in a word, for a foe whose numbers are hidden. */
export const hurtWord = (share) =>
  share >= 1
    ? "Unhurt"
    : share > 0.75
      ? "Scratched"
      : share > 0.4
        ? "Wounded"
        : share > 0.15
          ? "Badly wounded"
          : share > 0
            ? "Near death"
            : "Down";

/**
 * One fighter as the display shows them. `fighter`: { id, kind ("player" | "ally" | "foe" | "person": a
 * person fighting back), name, hp, max, statuses (ids of STATUS), current (their turn), down }. `exact`:
 * foes' HP shown as numbers; off, a foe has a word and a bar in quarters, so it can't be read off either.
 * { id, kind, name, foe, share, colour, numbers, statuses, current, down }.
 */
export function fighterView(fighter, exact = true) {
  const foe = fighter.kind === "foe" || fighter.kind === "person";
  const raw = hpShare(fighter.hp, fighter.max);
  const hidden = foe && !exact;
  const down = !!fighter.down || fighter.hp <= 0;
  return {
    id: fighter.id,
    kind: fighter.kind,
    name: fighter.name,
    foe,
    share: hidden ? Math.ceil(raw * 4) / 4 : raw,
    colour: hpColour(raw),
    numbers: hidden ? hurtWord(raw) : `${Math.max(0, Math.round(fighter.hp))}/${Math.round(fighter.max)}`,
    statuses: statusMarks([...(fighter.statuses ?? []), ...(down ? ["down"] : [])]),
    current: !!fighter.current,
    down,
  };
}

/** The turn order as cards: each fighter's view, the one whose turn it is (`at`) marked. */
export const turnCards = (order, at, exact = true) =>
  order.map((fighter, i) => fighterView({ ...fighter, current: i === at }, exact));

/**
 * What a nameplate says of a fighter: { name ("" for a person, whose name tag already says it), share,
 * colour, icons, key } (`key` changes only when the picture would: the plate is drawn again only then).
 */
export function plateData(fighter, exact = true) {
  const view = fighterView(fighter, exact);
  const name = fighter.kind === "foe" ? view.name : "";
  const icons = view.statuses.map((mark) => mark.icon).join("");
  return {
    name,
    share: view.share,
    colour: view.colour,
    icons,
    current: view.current,
    key: `${name}|${view.share.toFixed(3)}|${icons}|${view.current ? 1 : 0}`,
  };
}

/**
 * Whether a fighter's plate is up (Settings → Inventory → Fight display → "Name and HP over heads"): "off"
 * never; "some" only for one that's hurt, has something on it, is aimed at or whose turn it is; "all"
 * every one in a fight.
 */
export function plateShown(mode, fighter) {
  if (mode === "off") return false;
  if (mode === "all") return true;
  return !!fighter.current || !!fighter.aimed || hpShare(fighter.hp, fighter.max) < 1 || !!fighter.statuses?.length;
}

/** How clear a plate is at `distance` metres: whole up to 10, gone by 32, so far ones never clutter the view. */
export const plateFade = (distance) => Math.max(0, Math.min(1, (32 - distance) / 22));

/** About how tall each size stands (metres), for a plate over one whose body can't be measured. */
const SIZE_TALL = { tiny: 0.5, small: 1, medium: 1.9, large: 3, huge: 5.5, gargantuan: 9 };
/** How high over its feet a plate floats: a little over its body (`measured`, metres), else over its size. */
export const plateHeight = ({ measured = 0, size = "medium", scale = 1 } = {}) =>
  (Number.isFinite(measured) && measured > 0.2 ? Math.min(14, measured) : (SIZE_TALL[size] ?? 1.9) * scale) + 0.35;

/** A narrated line in a few words, for the top of the screen (the whole line stays in the chat). */
export function shortLine(text) {
  const line = String(text ?? "")
    .replace(/\s+/gu, " ")
    .trim();
  // "The wolf bites at Zoey (Attack roll: 9 + 5 = 14 against AC 12): a hit, for 4 (Damage: …). Zoey has …"
  const head = /^(.+?) \(([^()]*)\): ([^.]*)\.(.*)$/u.exec(line);
  if (!head) return clip(line, 120);
  const [, start, inside, outcome, rest] = head;
  const roll = /(\d+) against ((?:AC|DC) \d+)/u.exec(inside);
  const result = outcome
    .replace(/\s*\([^()]*\)/gu, "")
    .replace(/\bfor (\d+)\b/u, "$1 damage")
    .trim();
  const down = /goes down|falls|is down/u.test(rest) ? " · down" : "";
  return clip(`${start}: ${result}${roll ? ` · ${roll[1]} vs ${roll[2]}` : ""}${down}`, 140);
}
const clip = (text, most) => (text.length > most ? `${text.slice(0, most - 1).replace(/\s+\S*$/u, "")}…` : text);

/** The fight's log with `text` added: the last `most` lines, each { text, short }. */
export const logged = (log, text, most = 6) => [...(log ?? []), { text, short: shortLine(text) }].slice(-most);

// ── The info card ──

const ABILITY_NAMES = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
const modWords = (score) => {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
};
/** A resistance as the SRD writes it ("fire", or { type, except: ["magical"] }), in words. */
const defenceWords = (entry) =>
  typeof entry === "string" ? entry : `${entry.type}${entry.except?.includes("magical") ? " (unless magical)" : ""}`;
const typeOf = (entry) => (typeof entry === "string" ? entry : entry?.type);
const sizeWord = (size) => (size ? `${size[0].toUpperCase()}${size.slice(1)}` : "");
const crWords = (cr) => (cr === 0.125 ? "1/8" : cr === 0.25 ? "1/4" : cr === 0.5 ? "1/2" : String(cr ?? "?"));

/**
 * Which skill recalls what a creature is, by its type: Intelligence (Arcana) for the magical and the
 * strange, (Nature) for beasts, giants, oozes and plants, (Religion) for the undead, fiends and celestials,
 * and (History) for people of all sorts.
 */
export function knowSkill(kin = "") {
  const type = String(kin).toLowerCase();
  if (["undead", "fiend", "celestial"].includes(type)) return "religion";
  if (["beast", "giant", "ooze", "plant"].includes(type)) return "nature";
  if (type === "humanoid") return "history";
  return "arcana"; // (aberrations, constructs, dragons, elementals, fey, monstrosities)
}
/** The DC of recalling a creature: 10 and its challenge rating. */
export const knowDc = (cr = 0) => 10 + Math.max(0, Math.floor(cr));

/**
 * What the player has learned of one kind of creature, with a knowledge check rolled for it if none has been
 * (once a kind: the result is kept with the world). `facts`: { kin, cr, add (what the player adds with that
 * skill) }. { ...record, check: { skill, roll, total, dc, passed } }.
 */
export function knowCheck(record, { kin, cr, add = 0 }, random = Math.random) {
  if (record?.check) return record;
  const skill = knowSkill(kin);
  const roll = 1 + Math.floor(random() * 20);
  const dc = knowDc(cr);
  return { ...record, check: { skill, roll, total: roll + add, dc, passed: roll + add >= dc } };
}

/**
 * The same record after something was learned in a fight: `acts` (seen it attack, or been hit by it),
 * `struck` (it's been attacked: its AC is known), and `type` with `how` (what that kind of damage did to it:
 * "resists", "immune", "vulnerable" or "" for as rolled). The record itself when nothing is new.
 */
export function learned(record = {}, { acts = false, struck = false, type = "", how = "" } = {}) {
  const was = record.types?.[type];
  const fresh = (acts && !record.acts) || (struck && !record.struck) || (!!type && was !== (how || "normal"));
  if (!fresh) return record;
  return {
    ...record,
    ...(acts ? { acts: true } : {}),
    ...(struck ? { struck: true } : {}),
    types: { ...record.types, ...(type ? { [type]: how || "normal" } : {}) },
  };
}

/**
 * How much of a creature the card shows (Settings → "What you know of a creature"): "all" everything;
 * "learned" only what the player has learned: everything once they've passed its knowledge check, else what
 * they've seen (its attacks, its AC once they've fought it, how each kind of damage they've dealt it went).
 */
export function revealed(record, mode = "learned") {
  if (mode === "all" || record?.check?.passed) return { all: true, acts: true, ac: true, types: {} };
  return { all: false, acts: !!record?.acts, ac: !!record?.struck, types: record?.types ?? {} };
}

/**
 * A creature's info card. `stats`: its SRD_CREATURES entry; `record`: what's been learned of its kind
 * (`learned`, `knowCheck`); `mode`: as `revealed`; `fighter`: how it is now ({ hp, max, statuses }) and
 * `exact` (foes' numbers shown). { title, sub, rows: [[label, text]], scores: [{ id, score, mod }] | null,
 * defences: [{ label, items }], traits, acts, spells, notes, check, source }.
 */
export function creatureCard({ name, stats = {}, record = null, mode = "learned", fighter = null, exact = true }) {
  const seen = revealed(record, mode);
  const view = fighter ? fighterView({ kind: "foe", name, ...fighter }, exact) : null;
  const rows = [];
  rows.push(["AC", seen.ac || seen.all ? String(stats.ac ?? "?") : "Not yet known"]);
  rows.push([
    "HP",
    view ? `${view.numbers}${seen.all && exact ? ` (of ${stats.hp ?? view.numbers})` : ""}` : String(stats.hp ?? "?"),
  ]);
  if (seen.all) {
    if (stats.speed) rows.push(["Speed", stats.speed]);
    if (stats.senses) rows.push(["Senses", stats.senses]);
    if (stats.cr !== undefined) rows.push(["Challenge", crWords(stats.cr)]);
  }
  const scores =
    seen.all && Array.isArray(stats.scores)
      ? stats.scores.map((score, i) => ({ id: ABILITY_NAMES[i], score, mod: modWords(score) }))
      : null;
  const defences = [];
  const notes = [];
  const listed = (label, list) => {
    const known = (list ?? []).filter((entry) => seen.all || seen.types[typeOf(entry)]);
    if (known.length) defences.push({ label, items: known.map(defenceWords) });
  };
  listed("Vulnerable to", stats.vulnerable);
  listed("Resists", stats.resist);
  listed("Immune to", stats.immune);
  if (seen.all) {
    if (stats.unmoved?.length) defences.push({ label: "Can't be", items: stats.unmoved });
  } else {
    const plain = Object.entries(seen.types)
      .filter(([, how]) => how === "normal")
      .map(([type]) => type);
    if (plain.length) defences.push({ label: "Takes as rolled", items: plain });
    notes.push("Its other strengths and weaknesses: not yet learned. Fight it, or recall it (the check below).");
  }
  const traits = seen.all ? (stats.traits ?? []) : [];
  const acts = seen.all || seen.acts ? (stats.acts ?? []) : [];
  if (!seen.all && !seen.acts) notes.push("What it does: not yet seen.");
  const spells = seen.all || seen.acts ? (stats.spells ?? []) : [];
  const check = record?.check
    ? `${skillName(record.check.skill)} check ${record.check.total} against DC ${record.check.dc}: ${record.check.passed ? "you know it well." : "you recall little."}`
    : "";
  return {
    title: name ?? stats.name ?? "Creature",
    sub: [`${sizeWord(stats.size)} ${stats.kin ?? ""}`.trim(), seen.all ? stats.alignment : ""]
      .filter(Boolean)
      .join(", "),
    rows,
    scores,
    defences,
    traits,
    acts,
    spells,
    statuses: view?.statuses ?? [],
    notes,
    check,
    source: stats.name ? `The 5e SRD's ${stats.name} (SRD 5.1, CC BY 4.0).` : "",
  };
}
const skillName = (id) => `Intelligence (${id ? `${id[0].toUpperCase()}${id.slice(1)}` : ""})`;

/**
 * A companion's (or the player's, or anyone's) info card, from their sheet: `person` { name, cls (a class's
 * name), level, hp, max, ac, statuses, role ("You", "Companion", "Fighting you") }. Shaped as creatureCard's.
 */
export function personCard(person) {
  const view = fighterView({ kind: person.foe ? "person" : "ally", ...person }, true);
  return {
    title: person.name,
    sub: [person.role, person.cls ? `${person.cls}${person.level ? `, level ${person.level}` : ""}` : ""]
      .filter(Boolean)
      .join(" · "),
    rows: [
      ["HP", view.numbers],
      ["AC", String(person.ac ?? "?")],
    ],
    scores: null,
    defences: [],
    traits: [],
    acts: [],
    spells: person.spells ?? [],
    statuses: view.statuses,
    notes: view.statuses.length ? [] : ["Nothing on them."],
    check: "",
    source: "",
  };
}

// ── After a defeat ──

/**
 * Who stands over a beaten player: the creatures of the fight (`fighters`, as gathered for the display)
 * still on their feet within `reach` metres of `at`, the nearest four. Their ids.
 */
export function victorsOf(fighters, at, reach = 16) {
  return fighters
    .filter((entry) => entry.kind === "foe" && !entry.down && entry.hp > 0 && entry.x !== undefined)
    .map((entry) => ({ id: entry.id, far: Math.hypot(entry.x - at.x, entry.z - at.z) }))
    .filter((entry) => entry.far <= reach)
    .sort((a, b) => a.far - b.far)
    .slice(0, 4)
    .map((entry) => entry.id);
}

/**
 * What a victor does over a beaten player: "rob" (an outlaw: one that talks, of the humanoid sort),
 * "captive" (one that would take them away, when something offers it: `captors(kind)`, a hook for the
 * quests to come), "circle" (a beast: it paces round them) or "guard" (anything else stands over them).
 */
export function overRole({ kind = "", talks = false, kin = "", captors = null } = {}) {
  if (captors?.(kind)) return "captive";
  if (talks && kin === "humanoid") return "rob";
  return kin === "beast" ? "circle" : "guard";
}

/**
 * Where each victor stands this time round (`step` counts up every few seconds): one who robs close
 * (1.3 m), one on guard a little off (2.6 m), one that circles pacing round (3.2 m, a step further each time).
 * `victors`: [{ id, role }]. [{ id, x, z }].
 */
export function overSpots(victors, at, step = 0) {
  return victors.map((victor, i) => {
    const room = victor.role === "rob" ? 1.3 : victor.role === "circle" ? 3.2 : 2.6;
    const angle = (i / Math.max(1, victors.length)) * Math.PI * 2 + (victor.role === "circle" ? step * 0.55 : 0);
    return { id: victor.id, x: at.x + Math.sin(angle) * room, z: at.z + Math.cos(angle) * room };
  });
}

/** The ids the herd keeps when it counts monsters out again: those in a fight, and those standing over the player. */
export const keepIds = (order = [], victors = []) =>
  new Set([...order.map((entry) => entry.id), ...victors.map((entry) => entry.id ?? entry)]);

const COUNT = ["", "a", "two", "three", "four", "five"];
const plural = (word) =>
  /(?:wolf|elf)$/u.test(word)
    ? word.replace(/f$/u, "ves")
    : /(?:s|x|ch|sh)$/u.test(word)
      ? `${word}es`
      : /[^aeiou]y$/u.test(word)
        ? word.replace(/y$/u, "ies")
        : `${word}s`;
/** A list in words: "a bandit", "a bandit and two wolves". `victors`: [{ name }]. */
export function victorList(victors) {
  const counts = new Map();
  for (const victor of victors) counts.set(victor.name, (counts.get(victor.name) ?? 0) + 1);
  const parts = [...counts].map(([name, n]) =>
    n === 1 ? `${/^[aeiou]/iu.test(name) ? "an" : "a"} ${name}` : `${COUNT[n] ?? n} ${plural(name)}`,
  );
  return parts.length > 1 ? `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}` : (parts[0] ?? "");
}

/** The plain line when they close in: "A bandit and two wolves stand over Zoey." */
export function overWords(victors, who) {
  const list = victorList(victors);
  if (!list) return "";
  const many = victors.length > 1;
  return `${list[0].toUpperCase()}${list.slice(1)} ${many ? "stand" : "stands"} over ${who}.`;
}

/** The short line the AI narrator is told, only while it applies: "Zoey lies beaten; a bandit stands over them." */
export function overTold(victors, who) {
  const list = victorList(victors);
  return list ? `${who} lies beaten on the ground; ${list} ${victors.length > 1 ? "stand" : "stands"} over them` : "";
}

/**
 * What pleading takes: Charisma (Persuasion) with any that talk, Wisdom (Animal Handling) with beasts alone;
 * nothing with the mindless (they can't be pleaded with). The DC is 10 and the strongest one's challenge
 * rating, and 2 more for every plea already made. `victors`: [{ talks, kin, cr, temperament }].
 * { skill, dc } or null.
 */
export function pleaOf(victors, tries = 0) {
  if (!victors.length || victors.every((victor) => victor.temperament === "mindless")) return null;
  const skill = victors.some((victor) => victor.talks) ? "persuasion" : "animal_handling";
  const dc = 10 + Math.max(0, ...victors.map((victor) => Math.floor(victor.cr ?? 0))) + tries * 2;
  return { skill, dc };
}

/** Whether, after the player waits (`waits`: how many times now), the victors lose interest and go. */
export const waitsOut = (waits, random = Math.random) => random() < 0.2 + 0.2 * waits;
