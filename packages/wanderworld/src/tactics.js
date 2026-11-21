// How creatures and companions choose what to do in a fight, so they don't all do the same thing. Each
// creature has a role of its own, always the same for that one: it closes in, or shoots from a distance, or
// casts. A role settles which of its attacks it uses, how far it stands off, and whether it looks for cover.
// A caster picks its spell by what's in front of it. This module only works things out (main.js and herd.js
// move the bodies); nothing here needs a model, and with Settings → Inventory → Combat → "Creatures fight by
// their sort" off, none of it is used.

import { mean } from "./combat.js";

/**
 * The roles a kind's creatures are shared out among, by weight. A kind not listed has the one its numbers
 * give it: a caster if it has spells, else it closes in. A role its numbers can't play (no bow, no spells)
 * is left out of the sharing.
 */
const ROLES = {
  bandit: [
    ["melee", 45],
    ["ranged", 30],
    ["caster", 25],
  ],
  puglin: [
    ["melee", 55],
    ["ranged", 45],
  ],
  goblin: [
    ["melee", 60],
    ["ranged", 40],
  ],
  skeleton: [
    ["melee", 55],
    ["ranged", 45],
  ],
};

/** A number from text, always the same for the same text. */
function hash(text) {
  let value = 2166136261;
  for (const char of String(text)) value = Math.imul(value ^ char.charCodeAt(0), 16777619);
  return value >>> 0;
}

/**
 * The role of the creature `id` of `kind`: "melee" | "ranged" | "caster". `stats`: its numbers (srd.js
 * SRD_CREATURES: `ranged` a bow, `spells` its own, `caster` the spells of those of its kind who cast).
 */
export function roleOf(kind, id, stats = {}) {
  const can = { melee: true, ranged: !!stats.ranged, caster: !!(stats.spells?.length || stats.caster) };
  const shares = (ROLES[kind] ?? []).filter(([role]) => can[role]);
  if (!shares.length) return can.caster ? "caster" : "melee";
  const total = shares.reduce((sum, [, weight]) => sum + weight, 0);
  let at = hash(`role:${kind}:${id ?? ""}`) % total;
  return shares.find(([, weight]) => (at -= weight) < 0)[0];
}

/**
 * A creature's numbers as its role fights with them: one that closes in has no bow or spells to stand back
 * with; an archer has its bow and no spells; a caster has its spells (its kind's casters', where the kind
 * has those) and no bow.
 */
export function roleStats(stats, role) {
  const { ranged, spells, wit, caster, ...rest } = stats;
  if (role === "ranged") return { ...rest, ranged };
  if (role === "caster") return { ...rest, spells: spells ?? caster?.spells, wit: wit ?? caster?.wit ?? 0 };
  return rest;
}

/** How far one who shoots or casts likes to stand from what it's fighting, for a reach of `range` metres. */
export const standoff = (range) => Math.max(5, Math.min(range * 0.6, 11));

/**
 * The spell a caster chooses, of `spells` ([{ name, level, spell (combat.js spellIn) }]), or null for none
 * that fits (it uses what else it has):
 *   - nothing that doesn't reach `far` metres, and nothing above a cantrip once its greater spells are spent (`leveled` false)
 *   - with two or more together (`clustered`), its strongest spell that takes an area
 *   - now and then, on something not already under a condition (`afflicted`), one that holds or hinders
 *   - now and then its strongest spell; otherwise a cantrip
 */
export function pickSpell(
  spells,
  { far = 0, clustered = 1, afflicted = false, leveled = true, random = Math.random } = {},
) {
  const reach = (spells ?? []).filter((entry) => entry.spell.range >= far && (entry.level === 0 || leveled));
  const strongest = (list) => [...list].sort((a, b) => mean(b.spell.damage) - mean(a.spell.damage))[0] ?? null;
  const harm = reach.filter((entry) => entry.spell.damage);
  const area = harm.filter((entry) => entry.spell.area > 0 && entry.level > 0);
  if (clustered >= 2 && area.length) return strongest(area);
  const hinder = reach.filter((entry) => !entry.spell.damage && entry.spell.effect && entry.level > 0);
  if (!afflicted && hinder.length && random() < 0.35) return hinder[Math.floor(random() * hinder.length)];
  const great = harm.filter((entry) => entry.level > 0);
  if (great.length && random() < 0.4) return strongest(great);
  const cantrips = harm.filter((entry) => entry.level === 0);
  if (cantrips.length) return cantrips[Math.floor(random() * cantrips.length)];
  return strongest(great);
}

/** The spell a hurt caster mends itself with, if it has one in hand: one that heals and does nothing else. */
export const mendSpell = (spells, leveled = true) =>
  (spells ?? []).find((entry) => entry.spell.heal && !entry.spell.damage && (entry.level === 0 || leveled)) ?? null;

/** How many spells above a cantrip a creature of challenge `cr` casts in one fight. */
export const greaterCasts = (cr = 0) => 1 + Math.floor(Math.max(0, cr));

/**
 * Where one who shoots or casts wants to stand: of `spots` ([{ x, z, cover (it's behind something from the
 * target), far (metres to the target), walk (metres from where it is) }]), the nearest with cover at a good
 * distance (`least` to `range` metres); with none, the nearest that's just a good distance when it's being
 * crowded (`crowded`); else null, to stay where it is.
 */
export function standSpot(spots, { least = 4.5, range = 18, crowded = false } = {}) {
  const fits = (spots ?? []).filter((spot) => spot.far >= least && spot.far <= range - 1);
  const nearest = (list) => list.reduce((best, spot) => (!best || spot.walk < best.walk ? spot : best), null);
  return nearest(fits.filter((spot) => spot.cover)) ?? (crowded ? nearest(fits) : null);
}
