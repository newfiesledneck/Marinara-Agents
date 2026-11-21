// Holds and throws: a creature that grabs someone and keeps hold of them, and one big enough to throw them.
//
// The holds are the 5e SRD's (SRD 5.1, CC BY 4.0; the credit is srd.js's): a roper's tendrils, which reel
// whoever they hold in; an otyugh's tentacle; a shambling mound that engulfs whoever both its slams land on;
// a giant frog's bite and a mimic's pseudopod. Each is in its SRD_CREATURES entry as `hold`, with the SRD's
// escape DC. Two rules here are Wanderworld's own, not the SRD's: vines that catch someone's legs (an
// awakened shrub, a shambling mound), a short hold with an escape DC of 10; and a big creature (Large or
// bigger, Strength 18 or more, and no hold of its own) that grabs someone Medium or smaller and throws them.
//
// Plain data in and out. main.js keeps who is held by what, moves the bodies and tells it; this module only
// works things out: whether a blow grabs, what an escape roll comes to, where someone held stays and where
// someone thrown lands.

import { proficiency } from "./combat.js";
import { modifier } from "./sheet.js";

/** The sizes, smallest first. */
export const SIZES = ["tiny", "small", "medium", "large", "huge", "gargantuan"];
const rank = (size) => Math.max(0, SIZES.indexOf(size ?? "medium"));

/** Vines round the legs (Wanderworld's own rule): restrained where they stand, for a few seconds, escape DC 10. */
export const VINES = { name: "Vines", escape: 10, restrained: true, vines: true, seconds: 8 };
/** The kinds whose blows catch legs in vines. */
export const VINE_KINDS = new Set(["awakened_shrub", "shambling_mound"]);
/** How often, of a big creature's blows, it grabs and throws instead (in a fight in real time, or left to the rules). */
export const TOSS_CHANCE = 0.25;

/**
 * Which of these the settings allow: { holds, vines, throws }. Nothing with fights off, or without the
 * character sheet, the SRD's creatures and their special attacks; holds and vines need conditions too (they
 * hold by them). Each has its own switch.
 */
export function gripRules(settings) {
  const on = !!settings?.sheet && settings.fights !== "off" && !!settings.srdCreatures && !!settings.creatureExtras;
  return {
    holds: on && !!settings.conditions && !!settings.creatureHolds,
    vines: on && !!settings.conditions && !!settings.vineHolds,
    throws: on && !!settings.giantThrows,
  };
}

/** Whether `hold` can take someone of `size` (a roper's tendril anyone; an otyugh's tentacle no one past Medium). */
export const holdFits = (hold, size = "medium") => !hold?.upTo || rank(size) <= rank(hold.upTo);

/**
 * Whether a creature grabs and throws (Wanderworld's own rule), and how: Large or bigger, Strength 18 or more,
 * and no hold of its own (one that has a hold keeps hold). { dc, metres }: the Strength or Dexterity save that
 * avoids the grab (8, its proficiency by its challenge rating, and its Strength modifier), and how far it
 * throws (3 metres for Strength 18, more for a stronger or bigger one, up to 9). null for one that doesn't.
 */
export function tossOf(stats, scale = 1) {
  if (!stats || stats.hold || rank(stats.size) < rank("large") || !(stats.str >= 18)) return null;
  const dc = 8 + proficiency(Math.max(1, Math.ceil(stats.cr ?? 1))) + modifier(stats.str);
  const bigger = (rank(stats.size) - rank("large")) * 2;
  const far = (3 + (stats.str - 18) * 0.5 + bigger) * Math.max(0.8, Math.min(1.5, Number(scale) || 1));
  return { dc, metres: Math.min(9, Math.round(far * 2) / 2) };
}

/**
 * What a creature does about its target before it strikes: grab and throw them, make its holding attack, or
 * neither. `stats`: its fight numbers (SRD_CREATURES); `rules`: gripRules; `held`: the target is held already
 * (by anything); `size`: the target's; `force`: a move chosen for it ("grapple", "throw"); `safe`: where the
 * target stands no fight may start (a town, where towns are safe). { move: "throw", toss } | { move: "grab",
 * hold } | null.
 */
export function gripOf(
  { stats, rules, held = false, size = "medium", force = "", safe = false, scale = 1 },
  random = Math.random,
) {
  if (!stats || held) return null;
  const toss = rules?.throws && !safe && rank(size) <= rank("medium") ? tossOf(stats, scale) : null;
  if (toss && (force === "throw" || (!force && random() < TOSS_CHANCE))) return { move: "throw", toss };
  const hold = rules?.holds ? stats.hold : null;
  // (A hold made by an attack of its own, or by a saving throw, is the blow. One that comes with its usual
  // blow, or with all of them landing, is looked at after they land: holdAfter.)
  if (hold && holdFits(hold, size) && (hold.attack !== undefined || hold.save || (force === "grapple" && hold.main)))
    return { move: "grab", hold };
  return null;
}

/**
 * What holds the target after a creature's blows have landed: its own hold where that comes with its usual
 * blow (a frog's bite) or with every blow of its Multiattack landing (a shambling mound's two slams), else vines
 * where it has them. `hits` of `blows` landed. The hold, or null.
 */
export function holdAfter({ stats, kind, rules, hits, blows = 1, held = false, size = "medium" }) {
  if (!hits || held) return null;
  const hold = rules?.holds ? stats?.hold : null;
  if (hold && holdFits(hold, size) && (hold.main || (hold.both && blows > 1 && hits >= blows))) return hold;
  return rules?.vines && VINE_KINDS.has(kind) ? VINES : null;
}

/** The conditions a hold lays on whoever it holds, the first being the one it lasts by. */
export const holdConditions = (hold) =>
  hold.vines
    ? ["restrained"]
    : ["grappled", ...(hold.restrained ? ["restrained"] : []), ...(hold.blinded ? ["blinded"] : [])];

/**
 * A try at breaking free, the SRD's: a Strength (Athletics) or Dexterity (Acrobatics) check, whichever is
 * better, against the hold's escape DC. `weak`: Strength checks are at a disadvantage (a roper's hold).
 * { roll, total, skill, freed, words: "Athletics 9 + 3 = 12 against DC 15" }.
 */
export function escapeRoll({ athletics = 0, acrobatics = 0, dc = 10, weak = false }, random = Math.random) {
  const die = () => 1 + Math.floor(random() * 20);
  const roll = die();
  const strong = weak ? Math.min(roll, die()) : roll;
  const [skill, used, total] =
    strong + athletics >= roll + acrobatics
      ? ["Athletics", strong, strong + athletics]
      : ["Acrobatics", roll, roll + acrobatics];
  const added = total - used;
  const sum = added ? `${used} ${added < 0 ? "-" : "+"} ${Math.abs(added)} = ${total}` : String(total);
  return { roll: used, total, skill, freed: total >= dc, words: `${skill} ${sum} against DC ${dc}` };
}

/**
 * Why a hold is over, or null while it lasts. `foe`: what holds them as the herd has it ({ x, z, fled, stunned }),
 * null once it's beaten; `at`: where the held one is; `keep`: how far off it holds them; `lasting`: the
 * condition it holds by is still on them (it wears off: vines). "worn" | "beaten" | "fled" | "let go" |
 * "knocked back" (it's further off than it holds them at: a Shove, Thunderwave).
 */
export function holdEnds({ hold, foe, at, keep, until = Infinity, clock = 0, lasting = true }) {
  if (!lasting) return "worn";
  if (!foe) return "beaten";
  if (hold.vines) return null;
  if (foe.fled) return "fled";
  if (foe.stunned || clock > until) return "let go";
  if (Math.hypot(at.x - foe.x, at.z - foe.z) > keep + 1.6) return "knocked back";
  return null;
}

/** Where someone held at `keep` metres from what holds them stays: no further off than that ({ x, z }). */
export function pinned(holder, target, keep) {
  const far = Math.hypot(target.x - holder.x, target.z - holder.z);
  if (far <= keep || far < 1e-6) return { x: target.x, z: target.z };
  return { x: holder.x + ((target.x - holder.x) / far) * keep, z: holder.z + ((target.z - holder.z) / far) * keep };
}

/** How far off someone held is kept once reeled in `metres`, never nearer than `closest`. */
export const reeled = (keep, metres, closest) => Math.max(closest, keep - metres);

/**
 * Where someone thrown from `at`, away from `from`, lands: the furthest of a few ways (straight away first,
 * then turning off to either side) that goes `metres` (or as far as it can) over ground that's `clear`
 * (x, z) the whole way, looked at every quarter metre, so never through a wall, a tree or a fence, nor into
 * deep water. { x, z, metres }; metres 0 where there's nowhere to go (they're slammed down where they stand).
 */
export function landing({ from, at, metres, clear }) {
  const away = Math.atan2(at.x - from.x, at.z - from.z);
  let best = { x: at.x, z: at.z, metres: 0 };
  for (const turn of [0, 0.6, -0.6, 1.2, -1.2]) {
    const way = away + turn;
    let gone = 0;
    for (let next = 0.25; next <= metres + 1e-6; next += 0.25) {
      if (!clear(at.x + Math.sin(way) * next, at.z + Math.cos(way) * next)) break;
      gone = next;
    }
    // (Straight away is kept unless another way goes clearly further.)
    if (gone > best.metres + (best.metres > 0 ? 0.75 : 0))
      best = { x: at.x + Math.sin(way) * gone, z: at.z + Math.cos(way) * gone, metres: gone };
    if (gone >= metres) break;
  }
  return best;
}

/** The falling damage of a throw `metres` long: 1d6 for every 3 metres (the SRD's 1d6 per 10 feet), at least 1d6. */
export const fallDice = (metres) => `${Math.max(1, Math.round(metres / 3))}d6`;

/** How high a throw `metres` long goes at the top of its arc, and how long it's in the air (seconds). */
export const tossArc = (metres) => ({ height: 0.8 + metres * 0.2, seconds: 0.45 + metres * 0.07 });
