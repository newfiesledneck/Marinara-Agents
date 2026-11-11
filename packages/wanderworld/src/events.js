// Days that aren't like the others: a market day once a week, a festival once in four. Plain rules from
// the world's own day count (social.js; days pass only while Wanderworld is open): no model is called.
// main.js sends a share of the townsfolk to the square for an event's hours, and says so in a line.
import { hashString } from "./world.js";

/**
 * The events there are: how often each comes round (`every` days, on day `on` of those), its hours, and
 * the words for it: `today` when the day begins, `begins` when its hours do. `share`: how many of the
 * townsfolk go (0…1).
 */
export const EVENTS = [
  {
    id: "festival",
    name: "the festival",
    every: 28,
    on: 13,
    from: 17,
    to: 23,
    share: 0.8,
    today: "There's a festival in {plaza} this evening.",
    begins: "The festival has begun in {plaza}: half the town is there, and somebody has brought a fiddle.",
  },
  {
    id: "market",
    name: "market day",
    every: 7,
    on: 5,
    from: 9,
    to: 14,
    share: 0.6,
    today: "It's market day: {plaza} will be busy till the afternoon.",
    begins: "The market is in full swing in {plaza}.",
  },
];

/** The event on `day` (a whole number of days since the world began), or null: a festival comes before a market. */
export function eventOn(day) {
  const whole = Math.max(0, Math.floor(Number(day) || 0));
  return EVENTS.find((event) => whole % event.every === event.on) ?? null;
}

/** Whether `event`'s hours are on at `hour`. */
export function eventOpen(event, hour) {
  return !!event && hour >= event.from && hour < event.to;
}

/** Whether `id` goes to `event` on `day`: the same people each time it's asked, others another day. */
export function goesTo(event, id, day) {
  return ((hashString(`${id}:${event.id}:${day}`) >>> 0) % 1000) / 1000 < event.share;
}

/** Where `id` stands at an event round `centre` ({ x, z }): their own spot within `radius` metres. */
export function standAt(centre, id, radius = 7) {
  const hash = hashString(`${id}:stand`) >>> 0; // (never negative)
  const angle = ((hash % 360) / 180) * Math.PI;
  const out = 2 + (((hash >>> 9) % 100) / 100) * (radius - 2);
  return { x: centre.x + Math.sin(angle) * out, z: centre.z + Math.cos(angle) * out };
}
