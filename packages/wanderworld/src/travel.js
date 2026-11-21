// Journeys between regions (regions.js knows the regions): walking a road to a region you know, or a coach
// from an inn for a fare, with the hours it takes and what may meet you on the way. Plain rules and plain
// data: main.js moves the party, passes the time, takes the fare and puts any encounter in the world.
import { ANIMALS, HABITATS } from "./animals.js";
import { LANDS, routeTo } from "./regions.js";
import { hashString, rng } from "./world.js";

/** The longest a journey takes, in hours, however far (time jumps less than a day: social.js counts days by the clock turning over). */
export const MOST_HOURS = 20;
/** The chance, for each region on the way, that something meets you on foot (a coach: half). */
export const ENCOUNTER_ODDS = { off: 0, rare: 0.16, often: 0.33 };

/**
 * A journey from where the player is (`save.region`) to `to`: { path ([{ key, side }]), hours, fare, how,
 * problem }. `how`: "walk" or "coach". `settings`: travelRoads, travelCoach, coachFare, journeyHours. A
 * coach goes only to regions the player has been to, and only from an inn (`atInn`). `problem` says why
 * it can't go (and then nothing else is given).
 */
export function journeyTo(save, to, how, settings, atInn = false) {
  if (how === "coach" && !settings.travelCoach)
    return { problem: "Coaches are off (Settings → World → Regions and travel)." };
  if (how === "walk" && !settings.travelRoads)
    return { problem: "Travel by road is off (Settings → World → Regions and travel)." };
  if (how === "coach" && !atInn) return { problem: "Coaches leave from an inn or a tavern." };
  if (how === "coach" && !save.regions?.[to] && to !== "0,0")
    return { problem: "A coach only goes where you've been." };
  const path = routeTo(save, save.region ?? "0,0", to);
  if (!path) return { problem: "There's no road you know of from here." };
  const each = Math.max(1, Number(settings.journeyHours) || 5) * (how === "coach" ? 0.5 : 1);
  const hours = Math.min(MOST_HOURS, Math.round(path.length * each * 2) / 2);
  const fare = how === "coach" ? path.length * Math.max(0, Math.round(Number(settings.coachFare) || 0)) : 0;
  return { path, hours, fare, how };
}

/**
 * The coins to take for a fare: `items` (the inventory's), `currency` (the purse's name), `fare`. Returns
 * { change: { id, quantity } | { id, gone: true } } (what to do to the purse), { free: true } for no fare,
 * or { problem } when there isn't enough.
 */
export function chargeFare(items, currency, fare) {
  if (!(fare > 0)) return { free: true };
  const name = String(currency).trim().toLowerCase();
  const coins = (items ?? []).find((item) => String(item.name).trim().toLowerCase() === name);
  const have = Number(coins?.quantity) || 0;
  if (have < fare) return { problem: `The coach costs ${fare} ${currency}. You have ${have}.` };
  return { change: have - fare > 0 ? { id: coins.id, quantity: have - fare } : { id: coins.id, gone: true } };
}

/**
 * What meets the party on the road, if anything: { kind, count } of a hostile kind that lives in the land
 * they arrive in, or null. `odds`: an ENCOUNTER_ODDS name; `steps`: regions on the way; `allowed(kind)`:
 * whether that kind is on (Settings → Creatures); `seed`: this journey's own (the same journey, the same).
 */
export function encounterFor(land, odds, steps, how, allowed, seed) {
  const chance = (ENCOUNTER_ODDS[odds] ?? 0) * (how === "coach" ? 0.5 : 1);
  const random = rng(hashString(`road:${seed}`));
  let met = false;
  for (let i = 0; i < steps && !met; i++) met = random() < chance;
  if (!met) return null;
  const word = LANDS[land]?.habitat ?? "open";
  const kinds = Object.keys(ANIMALS).filter(
    (kind) =>
      ANIMALS[kind].group === "monsters" &&
      !ANIMALS[kind].rare &&
      !ANIMALS[kind].fly &&
      allowed(kind) &&
      (HABITATS[kind] ?? ["open"]).includes(word),
  );
  const wolves = allowed("wolf") && ANIMALS.wolf ? ["wolf"] : [];
  const list = kinds.length ? kinds : wolves;
  if (!list.length) return null;
  return { kind: list[Math.floor(random() * list.length)], count: 2 + Math.floor(random() * 2) };
}
