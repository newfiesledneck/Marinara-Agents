// How people's relationships move by themselves, and the world's record of what's happened. By rules
// alone: no model is called. Time spent together (an outing, a shared table, travelling in a party) warms
// a relationship a little; two short-tempered people sometimes have words instead; friends who never
// meet drift apart, slowly. A relationship that's locked never moves; one set by hand moves on from
// where it was set.
//
// Everything is slow on purpose. One step of warmth takes several hours together, a pair gains only so
// many steps a day, and a tier (25 steps) takes weeks of days: nobody is a best friend by the weekend.
import { KINDS, NEIGHBOURS, tierOf } from "./relationships.js";

/** The pace of it all. Hours are the world's own (a day is 24 of them). */
export const SOCIAL = {
  HOURS_A_STEP: 6, // hours together for one step (of 100) of warmth
  STEPS_A_DAY: 2, // the most a pair gains in a day
  FADE_AFTER: 6, // days without meeting before a friendship fades a step, and every so many after
  FADE_FLOOR: 25, // never below this by fading alone
  WORDS: 0.2, // the chance two short-tempered people have words instead of warming
  LOG: 200, // lines of record kept
  GROUP_EVERY: 8, // hours before the same group together is noted again
};

/** Kinds that grow warmer with time together (the others, rivals and enemies and fear, don't mend by it). */
const WARMS = new Set(Object.keys(KINDS).filter((kind) => (KINDS[kind].warmth ?? 0) > 0));
/** Kinds that fade when people don't meet (family and partners don't). */
const FADES = new Set(["acquaintance", "friend", "colleague"]);
const pairKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);
const clamp = (level) => Math.max(0, Math.min(100, Math.round(level)));
const listOf = (names) =>
  names.length < 2 ? (names[0] ?? "") : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;

/**
 * A world's social life. `saved`: what `state` gave before ({ day, pairs, log }), or nothing.
 * `step(hour, hours, groups, world)` moves it on: `hour` is the clock (0…24), `hours` how many have
 * passed since the last step, `groups` who is together now ([{ ids, where, what }]: `where` a place's
 * name, `what` a few words like "at the tavern", `area` which part of the world it's in), and `world`:
 * { relations (relationships.js), traits(id) → { aggression }, name(id), random() → 0…1, moving (whether
 * relationships move at all), logging (whether the record is kept) }. Returns what happened, as the
 * lines added to the record.
 */
export function createSocial(saved = {}) {
  let day = Number.isInteger(saved.day) ? saved.day : 0;
  const pairs = new Map(
    Object.entries(saved.pairs ?? {})
      .filter(([, value]) => Array.isArray(value))
      .map(([key, [hours, last, steps]]) => [key, { hours: hours || 0, last: last || 0, steps: steps || 0 }]),
  );
  let log = (Array.isArray(saved.log) ? saved.log : []).slice(-SOCIAL.LOG);
  let lastHour = null;
  const noted = new Map(); // a group together → when it was last put in the record (day × 24 + hour)

  /** Moves how `from` sees `to` by `delta` steps; returns "tier" when that crosses into another tier. */
  function move(world, from, to, delta) {
    const { relations } = world;
    const record = relations.get(from, to);
    if (record?.locked) return null;
    if (!record) {
      // Neighbours with nothing set are acquaintances; the player is nobody's till something makes them so.
      if (from === "player" || to === "player") return null;
      relations.set(from, to, { kind: NEIGHBOURS.kind, level: clamp(NEIGHBOURS.level + delta) });
      return null;
    }
    if (delta > 0 && !WARMS.has(record.kind)) return null;
    const before = tierOf(record.kind, record.level);
    let { kind, level } = record;
    level = clamp(level + delta);
    // Someone known as well as an acquaintance can be is a friend, from the bottom of that.
    if (kind === "acquaintance" && level >= 95 && delta > 0) [kind, level] = ["friend", 30];
    relations.set(from, to, { kind, level });
    return tierOf(kind, level) === before && kind === record.kind ? null : "tier";
  }

  function step(hour, hours, groups, world) {
    const lines = [];
    const add = (text, who, where = "", area = "") => {
      if (!world.logging) return;
      const line = { day, hour: Math.floor(hour), text, who, where, area };
      log = [...log, line].slice(-SOCIAL.LOG);
      lines.push(line);
    };
    // A new day: yesterday's steps are forgotten, and friendships long unvisited fade a step.
    if (lastHour !== null && hour < lastHour) {
      day += 1;
      for (const [key, pair] of pairs) {
        pair.steps = 0;
        const apart = day - pair.last;
        if (!world.moving || apart < SOCIAL.FADE_AFTER || apart % SOCIAL.FADE_AFTER) continue;
        const [a, b] = key.split("|");
        for (const [from, to] of [
          [a, b],
          [b, a],
        ]) {
          const record = world.relations.get(from, to);
          if (record && !record.locked && FADES.has(record.kind) && record.level > SOCIAL.FADE_FLOOR)
            world.relations.set(from, to, { level: record.level - 1 });
        }
      }
    }
    lastHour = hour;
    const now = day * 24 + hour;
    for (const group of groups) {
      const ids = [...new Set(group.ids)].sort();
      if (ids.length < 2) continue;
      // The occasion itself, once in a while.
      const groupKey = `${ids.join("|")}:${group.what ?? ""}`;
      if (now - (noted.get(groupKey) ?? -Infinity) >= SOCIAL.GROUP_EVERY) {
        noted.set(groupKey, now);
        const names = ids.map((id) => world.name(id)).filter(Boolean);
        if (names.length > 1)
          add(
            `${listOf(names)} spent time together${group.what ? ` ${group.what}` : ""}.`,
            ids,
            group.where,
            group.area,
          );
      }
      if (!world.moving) continue;
      for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
          const [a, b] = [ids[i], ids[j]];
          const key = pairKey(a, b);
          const pair = pairs.get(key) ?? { hours: 0, last: day, steps: 0 };
          pairs.set(key, pair);
          pair.hours += hours;
          pair.last = day;
          if (pair.hours < SOCIAL.HOURS_A_STEP) continue;
          if (pair.steps >= SOCIAL.STEPS_A_DAY) {
            pair.hours = SOCIAL.HOURS_A_STEP; // (nothing banked for tomorrow)
            continue;
          }
          pair.hours -= SOCIAL.HOURS_A_STEP;
          pair.steps += 1;
          // Two short-tempered people (or one very much so) now and then have words instead.
          const tempers = [a, b].map((id) => (id === "player" ? 0 : (world.traits(id)?.aggression ?? 50)));
          const prickly = Math.min(...tempers) >= 60 || Math.max(...tempers) >= 85;
          const words = prickly && world.random() < SOCIAL.WORDS;
          const delta = words ? -2 : 1;
          const crossed = [move(world, a, b, delta), move(world, b, a, delta)].some(Boolean);
          const names = [world.name(a), world.name(b)];
          if (words) add(`${names[0]} and ${names[1]} had words.`, [a, b], group.where, group.area);
          else if (crossed) {
            const record = world.relations.get(a, b) ?? world.relations.get(b, a);
            const tier = record ? tierOf(record.kind, record.level) : "";
            add(
              `${names[0]} and ${names[1]} have grown closer${tier ? ` (${tier})` : ""}.`,
              [a, b],
              group.where,
              group.area,
            );
          }
        }
      }
    }
    return lines;
  }

  return {
    step,
    /** The record, oldest first: [{ day, hour, text, who: [ids], where, area }]. */
    get log() {
      return log;
    },
    /** How many days this world has seen. */
    get day() {
      return day;
    },
    /** What to keep with the world. */
    get state() {
      return {
        day,
        pairs: Object.fromEntries(
          [...pairs].map(([key, pair]) => [key, [Math.round(pair.hours * 100) / 100, pair.last, pair.steps]]),
        ),
        log,
      };
    },
  };
}
