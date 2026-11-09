// Relationships: how one person sees another. Each record runs one way (how Sarah sees Jake needn't be
// how Jake sees Sarah), with a kind, a level from 0 to 100 within that kind, an optional role ("sister",
// "boss"), notes and a history, so the AI can read them as words and change them as things happen
// (docs/CONCEPT.md, W4). Kinds and their tiers are open to more; numbers drive behaviour in town.
//
// People are ids: "player" for the persona being played, or a character's id.

export const RELATIONSHIP_VERSION = 1;

/**
 * Every kind, with its four tiers (levels 0–24, 25–49, 50–74, 75–100): a short name for each, and the
 * words for a sentence ("Sarah is best friends with Jake"); how warm it is (−1 … 1, scaled by level for
 * behaviour); and roles it suggests.
 */
export const KINDS = {
  acquaintance: {
    label: "Acquaintance",
    tiers: ["has met", "recognises", "knows", "knows well"],
    phrases: ["has met", "recognises", "knows", "knows well"],
    warmth: 0.25,
  },
  friend: {
    label: "Friend",
    tiers: ["friendly", "friend", "good friend", "best friend"],
    phrases: ["is friendly with", "is a friend of", "is a good friend of", "is best friends with"],
    warmth: 0.8,
  },
  romance: {
    label: "Romantic interest",
    tiers: ["fond", "crush", "smitten", "in love"],
    phrases: ["is fond of", "has a crush on", "is smitten with", "is in love with"],
    warmth: 0.9,
  },
  partner: {
    label: "Partner",
    tiers: ["seeing", "partner", "devoted", "soulmate"],
    phrases: ["is seeing", "is the partner of", "is devoted to", "is the soulmate of"],
    warmth: 1,
  },
  family: {
    label: "Family",
    tiers: ["distant", "relative", "close", "inseparable"],
    phrases: ["is distantly related to", "is related to", "is close to", "is inseparable from"],
    warmth: 0.85,
    roles: ["parent", "child", "sibling", "sister", "brother", "cousin", "aunt", "uncle", "grandparent", "spouse"],
  },
  colleague: {
    label: "Colleague",
    tiers: ["works alongside", "colleague", "trusted colleague", "right hand"],
    phrases: ["works alongside", "is a colleague of", "is a trusted colleague of", "is the right hand of"],
    warmth: 0.4,
    roles: ["employer", "employee", "apprentice", "partner in trade"],
  },
  mentor: {
    label: "Mentor",
    tiers: ["advises", "mentor", "guide", "devoted mentor"],
    phrases: ["advises", "mentors", "guides", "is a devoted mentor to"],
    warmth: 0.6,
    roles: ["mentor", "student"],
  },
  rival: {
    label: "Rival",
    tiers: ["competitive", "rival", "bitter rival", "nemesis"],
    phrases: ["competes with", "is a rival of", "is a bitter rival of", "is the nemesis of"],
    warmth: -0.4,
  },
  enemy: {
    label: "Enemy",
    tiers: ["dislikes", "distrusts", "hostile", "sworn enemy"],
    phrases: ["dislikes", "distrusts", "is hostile to", "is the sworn enemy of"],
    warmth: -1,
  },
  fear: {
    label: "Afraid of",
    tiers: ["uneasy", "wary", "afraid", "terrified"],
    phrases: ["is uneasy around", "is wary of", "is afraid of", "is terrified of"],
    warmth: -0.6,
  },
};

/** Townsfolk who share a town know each other a little even with no record: an acquaintance at this level. */
export const NEIGHBOURS = { kind: "acquaintance", level: 20 };

const isRecord = (value) => !!value && typeof value === "object" && !Array.isArray(value);
const clampLevel = (value) => Math.max(0, Math.min(100, Math.round(Number.isFinite(value) ? value : 30)));

/**
 * A character's temperament, each 0–100 (50 when unset; later the AI sets them from the character card):
 * aggression, how readily they confront someone they're against (a passive sworn enemy glares or keeps
 * away; an aggressive one comes at you even when they merely dislike you); sociability, how readily they
 * come over, wave and greet, and seek company.
 */
export const TRAITS = {
  aggression: { label: "Temperament", low: "Passive", high: "Aggressive" },
  sociability: { label: "Manner", low: "Shy", high: "Outgoing" },
};
export const DEFAULT_TRAITS = { aggression: 50, sociability: 50 };

/** Someone's traits, checked, with defaults filled in. */
export function checkTraits(raw) {
  const out = { ...DEFAULT_TRAITS };
  if (!isRecord(raw)) return out;
  for (const name of Object.keys(TRAITS)) if (Number.isFinite(raw[name])) out[name] = clampLevel(raw[name]);
  return out;
}

/** A map of id → traits, checked (unknown or default entries dropped). */
export function checkTraitMap(raw) {
  if (!isRecord(raw)) return {};
  const out = {};
  for (const [id, traits] of Object.entries(raw)) {
    const checked = checkTraits(traits);
    if (Object.keys(TRAITS).some((name) => checked[name] !== DEFAULT_TRAITS[name])) out[id] = checked;
  }
  return out;
}

/** A relationship record, checked; null when it isn't usable. */
export function checkRelationship(raw) {
  if (!isRecord(raw) || typeof raw.from !== "string" || typeof raw.to !== "string" || raw.from === raw.to) return null;
  if (!KINDS[raw.kind]) return null;
  return {
    from: raw.from,
    to: raw.to,
    kind: raw.kind,
    level: clampLevel(raw.level),
    role: typeof raw.role === "string" ? raw.role.trim().slice(0, 40) : "",
    notes: typeof raw.notes === "string" ? raw.notes.slice(0, 600) : "",
    history: Array.isArray(raw.history)
      ? raw.history
          .filter((entry) => isRecord(entry) && typeof entry.text === "string")
          .slice(-30)
          .map((entry) => ({ text: entry.text.slice(0, 300), at: Number.isFinite(entry.at) ? entry.at : 0 }))
      : [],
    updatedAt: Number.isFinite(raw.updatedAt) ? raw.updatedAt : Date.now(),
  };
}

const tierIndex = (level) => Math.min(3, Math.floor(clampLevel(level) / 25));

/** What a level is called within its kind: "best friend", "sworn enemy". */
export function tierOf(kind, level) {
  return KINDS[kind]?.tiers[tierIndex(level)] ?? "";
}

/** The words for a sentence: "is best friends with", "is the sworn enemy of". */
export function phraseOf(kind, level) {
  return KINDS[kind]?.phrases[tierIndex(level)] ?? "knows";
}

/** How warm a relationship is, −1 (deadly) … 1 (devoted): the kind's warmth, stronger with level. */
export function warmthOf(kind, level) {
  const base = KINDS[kind]?.warmth ?? 0;
  return base * (0.35 + 0.65 * (clampLevel(level) / 100));
}

/** Each kind's hue (0–360) for name tags: friends green, romance and partners pink, enemies red… */
const HUES = {
  acquaintance: 50,
  friend: 128,
  romance: 330,
  partner: 318,
  family: 190,
  colleague: 215,
  mentor: 268,
  rival: 28,
  enemy: 0,
  fear: 285,
};

/**
 * The colour of someone's name tag for how they see the player: a dark grey box for a stranger, grey
 * warming to yellow for an acquaintance as they get to know you, and each kind's own colour, deeper and
 * stronger the higher the level. A CSS colour.
 */
export function tagColourOf(kind, level) {
  if (!KINDS[kind]) return "rgba(10, 14, 20, 0.62)";
  const amount = clampLevel(level) / 100;
  if (kind === "acquaintance") {
    return `hsla(${HUES.acquaintance}, ${Math.round(8 + amount * 62)}%, ${Math.round(30 + amount * 6)}%, 0.72)`;
  }
  return `hsla(${HUES[kind]}, ${Math.round(45 + amount * 40)}%, ${Math.round(44 - amount * 20)}%, 0.78)`;
}

/**
 * A set of relationships (a world's), with lookups. `records` are checked as they come in; `names`
 * (id → name) is for describing them in words.
 */
export function createRelationships(records = []) {
  let list = records.map(checkRelationship).filter(Boolean);
  const key = (from, to) => `${from}→${to}`;
  let index = new Map(list.map((record) => [key(record.from, record.to), record]));
  const reindex = () => {
    index = new Map(list.map((record) => [key(record.from, record.to), record]));
  };
  return {
    /** Every record, for saving. */
    get all() {
      return list;
    },
    /** How `from` sees `to`: the record, or null. */
    get(from, to) {
      return index.get(key(from, to)) ?? null;
    },
    /**
     * How `from` sees `to` for behaviour: { kind, level, warmth, tier }. Townsfolk with no record are
     * neighbours (acquaintances); toward the player with no record, strangers.
     */
    feeling(from, to) {
      const record = index.get(key(from, to));
      if (record)
        return { ...record, warmth: warmthOf(record.kind, record.level), tier: tierOf(record.kind, record.level) };
      if (to === "player" || from === "player") return { kind: null, level: 0, warmth: 0, tier: "doesn't know" };
      return {
        ...NEIGHBOURS,
        warmth: warmthOf(NEIGHBOURS.kind, NEIGHBOURS.level),
        tier: tierOf(NEIGHBOURS.kind, NEIGHBOURS.level),
      };
    },
    /** Sets how `from` sees `to` (merging into any record there), or removes it with `null`. */
    set(from, to, fields) {
      const old = index.get(key(from, to));
      list = list.filter((record) => record !== old);
      if (fields) {
        const next = checkRelationship({ ...(old ?? {}), ...fields, from, to, updatedAt: Date.now() });
        if (next) list.push(next);
      }
      reindex();
    },
    /** Adds a line to the history of how `from` sees `to` (when there's a record). */
    remember(from, to, text) {
      const record = index.get(key(from, to));
      if (!record) return;
      record.history = [...record.history, { text: String(text).slice(0, 300), at: Date.now() }].slice(-30);
    },
    /** Everyone `from` has a record about: [{ to, … }]. */
    of(from) {
      return list.filter((record) => record.from === from);
    },
    /** A relationship in words: "Sarah is best friends with Jake", "Mira is Tam's sister and is close to them". */
    describe(from, to, names) {
      const record = index.get(key(from, to));
      if (!record) return null;
      const a = names[from] ?? from;
      const b = names[to] ?? to;
      const phrase = phraseOf(record.kind, record.level);
      return record.role ? `${a} is ${b}'s ${record.role} and ${phrase} them` : `${a} ${phrase} ${b}`;
    },
  };
}

/** Keywords that say someone's body: "male", "woman"… */
const GENDER_WORDS = {
  male: "male",
  man: "male",
  boy: "male",
  female: "female",
  woman: "female",
  girl: "female",
};
/** Keywords that say how someone sees the player, besides each kind's name, label and tiers. */
const RELATION_WORDS = {
  lover: { kind: "romance", level: 80 },
  sweetheart: { kind: "romance", level: 60 },
  wife: { kind: "partner", level: 80, role: "wife" },
  husband: { kind: "partner", level: 80, role: "husband" },
  spouse: { kind: "partner", level: 80, role: "spouse" },
  nemesis: { kind: "rival", level: 90 },
  boss: { kind: "colleague", level: 50, role: "employer" },
  student: { kind: "mentor", level: 50, role: "student" },
  apprentice: { kind: "colleague", level: 40, role: "apprentice" },
};

/**
 * What a character's lore entries say about them, from their keywords: their body ("male", "female")
 * and how they see the player ("enemy", "sworn enemy", "mentor", "sister"…). The first word of each sort
 * wins. Returns { body: "male" | "female" | null, relation: { kind, level, role } | null }.
 */
export function setupFromWords(words) {
  let body = null;
  let relation = null;
  for (const raw of words) {
    const word = String(raw ?? "")
      .toLowerCase()
      .trim();
    if (!word) continue;
    body ??= GENDER_WORDS[word] ?? null;
    if (relation) continue;
    if (RELATION_WORDS[word]) relation = { role: "", ...RELATION_WORDS[word] };
    else if (KINDS.family.roles.includes(word)) relation = { kind: "family", level: 60, role: word };
    else {
      for (const [kind, spec] of Object.entries(KINDS)) {
        const tier = spec.tiers.indexOf(word);
        if (word === kind || word === spec.label.toLowerCase()) relation = { kind, level: 50, role: "" };
        else if (tier >= 0) relation = { kind, level: tier * 25 + 12, role: "" };
        if (relation) break;
      }
    }
  }
  return { body, relation };
}
