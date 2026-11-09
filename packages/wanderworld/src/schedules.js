// Daily schedules: what each person does at each hour of the day, and where. A schedule is a list of
// entries { from, to (hours 0–24, half hours; to < from runs past midnight), activity, place (a zone id,
// or "" for the person's own home or work, or anywhere for a walk) }. Townsfolk follow the entry for the
// hour (npcs.js); hours with no entry, and "walk" hours, leave them to the usual rules (company, benches,
// wandering). The player edits schedules in Journal → People, the AI can write a day or change it
// (server.mjs /plan and /moment), and anyone without one follows a usual day made from their home and work.

export const ACTIVITIES = ["home", "work", "eat", "visit", "sit", "walk"];
export const ACTIVITY_WORDS = {
  home: "at home",
  work: "at work",
  eat: "eating",
  visit: "visiting",
  sit: "sitting",
  walk: "out and about",
};

/** Whether `hour` falls in [from, to), wrapping past midnight when to < from. */
export function inRange(hour, from, to) {
  return from <= to ? hour >= from && hour < to : hour >= from || hour < to;
}

/** The entry for `hour`, or null. */
export function entryAt(entries, hour) {
  return (entries ?? []).find((entry) => inRange(hour, entry.from, entry.to)) ?? null;
}

/** A schedule entry, checked; null when it isn't usable. */
export function checkEntry(raw) {
  if (!raw || typeof raw !== "object") return null;
  const hour = (value) =>
    Number.isFinite(Number(value)) ? Math.round(Math.max(0, Math.min(24, Number(value))) * 2) / 2 : null;
  const from = hour(raw.from);
  const to = hour(raw.to);
  if (from === null || to === null || from === to || !ACTIVITIES.includes(raw.activity)) return null;
  const place = typeof raw.place === "string" ? raw.place.slice(0, 120) : "";
  return { from, to, activity: raw.activity, place };
}

/** A small number from an id, the same each time, to vary people's days a little. */
function nudge(id, spread) {
  let hash = 0;
  for (const char of String(id)) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return ((Math.abs(hash) % (spread * 2 + 1)) - spread) / 2; // in half hours
}

/**
 * A usual day for someone: `places` { tavern, square } (zone ids or ""), and whether they have work.
 * Someone with work works mornings and afternoons with a meal between; anyone else potters about,
 * looks in at the market, eats and sits a while. Everyone is home at night.
 */
export function usualDay(id, { work = false, tavern = "", square = "" } = {}) {
  const wake = 7 + nudge(id, 2); // 6–8
  const bed = 21.5 + nudge(`${id}:night`, 2); // 20.5–22.5
  const days = work
    ? [
        ["walk", wake, 8.5, ""],
        ["work", 8.5, 12, ""],
        ["eat", 12, 13, tavern],
        ["work", 13, 17, ""],
        ["walk", 17, 19, ""],
        ["sit", 19, bed, square],
      ]
    : [
        ["walk", wake, 10.5, ""],
        ["visit", 10.5, 11.5, square],
        ["walk", 11.5, 12.5, ""],
        ["eat", 12.5, 13.5, tavern],
        ["walk", 13.5, 17.5, ""],
        ["sit", 17.5, bed, square],
      ];
  return [
    ...days
      .filter(([activity, , , place]) => (activity === "visit" || activity === "sit" ? place : true))
      .map(([activity, from, to, place]) => ({ from, to, activity, place })),
    { from: bed, to: wake, activity: "home", place: "" },
  ];
}

/**
 * Puts `entry` into `entries`: it takes its hours over, and what was there before is cut back or split
 * round it. Returns a new list in order of hours (from midnight).
 */
export function putEntry(entries, entry) {
  const span = (from, to) =>
    from <= to
      ? [[from, to]]
      : [
          [from, 24],
          [0, to],
        ];
  const covered = span(entry.from, entry.to);
  const out = [];
  for (const old of entries) {
    for (const [from, to] of span(old.from, old.to)) {
      let pieces = [[from, to]];
      for (const [cutFrom, cutTo] of covered) {
        pieces = pieces.flatMap(([a, b]) =>
          b <= cutFrom || a >= cutTo
            ? [[a, b]]
            : [
                [a, cutFrom],
                [cutTo, b],
              ].filter(([x, y]) => y - x > 0),
        );
      }
      for (const [a, b] of pieces) out.push({ ...old, from: a, to: b });
    }
  }
  for (const [from, to] of covered) out.push({ ...entry, from, to });
  return out.sort((a, b) => a.from - b.from);
}

/** "08:30" for 8.5. */
export function hourText(hour) {
  const whole = Math.floor(hour) % 24;
  return `${String(whole).padStart(2, "0")}:${hour % 1 ? "30" : "00"}`;
}
