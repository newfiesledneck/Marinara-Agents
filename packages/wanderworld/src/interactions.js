// Using things: what can be done with each kind of thing (a door, a cave's mouth, the fountain…), and
// the scene request an action makes for the AI to play out (docs/CONCEPT.md, S1). Every thing also takes
// the player's own line, "what you do or say", so nothing is limited to the listed actions.
//
// New kinds of things, or new actions on one, are an entry in ACTIONS; nothing else needs to change.

export const SCENE_VERSION = 1;

/** Each kind of thing's actions: an id, the button's label, and what the player does, for a sentence. */
export const ACTIONS = {
  door: [
    { id: "enter", label: "Go in", verb: "goes in" },
    { id: "knock", label: "Knock", verb: "knocks at the door and waits" },
  ],
  // The player's own home (from their lore).
  home: [
    { id: "enter", label: "Go inside", verb: "goes inside" },
    { id: "rest", label: "Rest a while", verb: "rests at home" },
  ],
  cave: [
    { id: "enter", label: "Go in", verb: "goes into the cave" },
    { id: "look", label: "Look around the mouth", verb: "looks around the mouth of the cave" },
  ],
  fountain: [
    { id: "wish", label: "Toss a coin", verb: "tosses a coin into the fountain and makes a wish" },
    { id: "drink", label: "Drink", verb: "drinks from the fountain" },
    { id: "rest", label: "Sit on the rim", verb: "sits on the fountain's rim to watch the square" },
  ],
  noticeboard: [{ id: "read", label: "Read the notes", verb: "reads the notes on the noticeboard" }],
  // Travelling to the next region, across the edge of this one: the road between them.
  travel: [{ id: "go", label: "Set off", verb: "sets off along the road" }],
};

/** Id of the action that's only the player's own line. */
export const OWN_LINE = "own";

/** An action of a kind of thing, or the own-line action. */
export function actionOf(kind, id) {
  if (id === OWN_LINE) return { id: OWN_LINE, label: "Do something else", verb: "" };
  return (ACTIONS[kind] ?? []).find((action) => action.id === id) ?? null;
}

const clean = (text, max) => (typeof text === "string" ? text.replace(/\s+/gu, " ").trim().slice(0, max) : "");
const people = (list) =>
  (Array.isArray(list) ? list : [])
    .filter((person) => person && typeof person.name === "string")
    .slice(0, 20)
    .map((person) => ({ id: typeof person.id === "string" ? person.id : null, name: clean(person.name, 80) }));

/**
 * The request a scene starts from, for the AI to set up and play: who does what where, who's there and
 * who came along, the player's own line, and the time. `input`: { thing: { kind, name, chain (names of the
 * places it's in, nearest first) }, action (id), line, inside: [{ id, name }], party: [{ id, name }],
 * persona: { id, name }, hour }. Null when the action isn't one the thing has (or an own line is empty).
 */
export function sceneRequest(input) {
  const kind = input?.thing?.kind;
  const action = actionOf(kind, input?.action);
  const line = clean(input?.line, 600);
  if (!action || (action.id === OWN_LINE && !line)) return null;
  return {
    version: SCENE_VERSION,
    thing: {
      kind,
      name: clean(input.thing.name, 120) || "somewhere",
      chain: (Array.isArray(input.thing.chain) ? input.thing.chain : []).map((name) => clean(name, 120)).slice(0, 6),
    },
    action: action.id,
    verb: action.verb,
    line,
    inside: people(input.inside),
    party: people(input.party),
    persona: { id: input.persona?.id ?? "player", name: clean(input.persona?.name, 80) || "The traveller" },
    hour: Number.isFinite(input.hour) ? Math.round(input.hour * 10) / 10 : 12,
    at: Date.now(),
  };
}

const list = (names) =>
  names.length < 2 ? (names[0] ?? "") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;

function partOfDay(hour) {
  if (hour < 5 || hour >= 22) return "night";
  if (hour < 8) return "early morning";
  if (hour < 12) return "morning";
  if (hour < 14) return "midday";
  if (hour < 18) return "afternoon";
  return "evening";
}

/**
 * A scene request in words, as the AI (and the player, in the preview) reads it: "At the Prancing
 * Pony, in Briarwood, Zoey goes in, with Mira. Inside: Tam and Rook. It's evening. Zoey: "I'll take the stew.""
 */
export function describeScene(request) {
  const who = request.persona.name;
  const where = [request.thing.name, ...request.thing.chain].filter(Boolean);
  const place = where.length > 1 ? `${where[0]}, in ${where.slice(1).join(", ")}` : where[0];
  const company = request.party.length ? `, with ${list(request.party.map((person) => person.name))}` : "";
  const sentences = [
    request.verb ? `At ${place}, ${who} ${request.verb}${company}.` : `${who} is at ${place}${company}.`,
  ];
  if (request.inside.length) sentences.push(`There: ${list(request.inside.map((person) => person.name))}.`);
  else if (request.thing.kind === "door" || request.thing.kind === "cave") sentences.push("Nobody seems to be there.");
  sentences.push(`It's ${partOfDay(request.hour)}.`);
  if (request.line) sentences.push(`${who}: "${request.line}"`);
  return sentences.join(" ");
}

/** A scene request read back from a save, checked; null when it isn't usable. */
export function checkScene(raw) {
  if (!raw || typeof raw !== "object" || typeof raw.thing !== "object" || !raw.thing) return null;
  const request = sceneRequest({ ...raw, action: raw.action });
  return request ? { ...request, at: Number.isFinite(raw.at) ? raw.at : 0 } : null;
}

/** The Speak bar's commands: "/s" shouts, "/w" whispers, "/p" speaks to the party, "/a" is an action. */
const SPEECH_COMMANDS = {
  s: { voice: "shout" },
  shout: { voice: "shout" },
  w: { voice: "whisper" },
  whisper: { voice: "whisper" },
  p: { audience: "party" },
  party: { audience: "party" },
  a: { action: true },
  action: { action: true },
};

/**
 * What the player typed in the Speak bar: { line, action, voice ("talk" | "shout" | "whisper"), audience
 * ("nearby" | "party") }. Plain text is said normally to everyone nearby; "/s hello!" shouts it, "/w"
 * whispers, "/p" talks to the party, "/a casts a spell" does something instead of saying it. An unknown
 * command is said as typed. Null for nothing at all.
 */
export function parseSpeech(input) {
  const typed = clean(input, 600);
  if (!typed) return null;
  const match = /^\/(\w+)\s*(.*)$/su.exec(typed);
  const command = match ? SPEECH_COMMANDS[match[1].toLowerCase()] : null;
  const rest = command ? match[2].trim() : typed;
  if (!rest) return null;
  return {
    line: command?.action ? "" : rest,
    action: command?.action ? rest : "",
    voice: command?.voice ?? "talk",
    audience: command?.audience ?? "nearby",
  };
}

/** The chat window's list of commands: what to type, and what it does. Grows as commands are added. */
export const SPEECH_HELP = [
  ["text", "say it out loud to everyone nearby"],
  ["/s text, /shout", "shout it: heard across a square"],
  ["/w text, /whisper", "whisper it: only someone right beside you hears"],
  ["/p text, /party", "say it to your party only"],
  [
    "/a text, /action",
    "do something instead of saying it (open a chest, cast a spell); the narrator and people nearby respond",
  ],
];

/** How many people hear a moment at most (the model writes for each, so it's kept small). */
export const MAX_LISTENERS = 5;

/** Whether `text` names someone called `name`: their whole name, or their first name, as a word. */
export function mentions(text, name) {
  const words = String(text ?? "").toLowerCase();
  const full = String(name ?? "")
    .trim()
    .toLowerCase();
  if (!full || !words) return false;
  const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const names = [...new Set([full, full.split(/\s+/u)[0]])].filter((entry) => entry.length > 1);
  return names.some((entry) => new RegExp(`(^|[^\\p{L}\\p{N}])${escape(entry)}($|[^\\p{L}\\p{N}])`, "u").test(words));
}

/**
 * Who hears a moment: from `candidates` ([{ id, name, distance }] already in earshot), anyone the player
 * named in `text` first (nearest first), then the nearest of the rest, `max` in all.
 */
export function pickListeners(candidates, text, max = MAX_LISTENERS) {
  const byDistance = [...candidates].sort((a, b) => a.distance - b.distance);
  const named = byDistance.filter((person) => mentions(text, person.name));
  const rest = byDistance.filter((person) => !named.includes(person));
  return [...named, ...rest].slice(0, max);
}
