// Conditions on the player: what a creature's bite, a spell or a fall can leave on them for a while, and
// what each does, after the 5e SRD's conditions (SRD 5.1, CC BY 4.0; the credit is srd.js's). A fight here
// is simpler than a tabletop's, so each condition keeps the part of its rule that a fight here can play:
// whether the player's own attacks are rolled twice with the worse counting, whether attacks on them are
// rolled twice with the better counting, whether they can move, whether they can act at all, whether they
// fail Strength and Dexterity saves by themselves (paralyzed, stunned, asleep), and whether a hit from
// within 1.5 m is a critical hit (paralyzed, asleep: the SRD's unconscious). The same names on a creature
// or a companion work the same way.
//
// The state is plain data, { [condition]: seconds left }, kept by main.js for as long as the world is open
// (it isn't saved: nothing here outlasts a fight by much). This module only works things out.

/**
 * The conditions that can land on the player. `seconds`: how long one lasts when what laid it doesn't say
 * (in a fight by turns, six seconds are a round). `attackDis`: their attacks are at a disadvantage.
 * `defendAdv`: attacks on them have advantage. `still`: they can't move. `helpless`: they can't act.
 * `slow`: half their pace. `wakes`: it ends when they're hurt. `escape`: they strain against it (a check,
 * now and then) and it ends when they win. `failsSaves`: their Strength and Dexterity saves fail without a
 * roll. `critClose`: an attack that hits them from within CRIT_REACH is a critical hit.
 */
export const CONDITIONS = {
  prone: {
    label: "Prone",
    about: "Knocked down. Your attacks are at a disadvantage and attacks on you have advantage until you're up.",
    seconds: 2,
    attackDis: true,
    defendAdv: true,
    still: true,
  },
  poisoned: {
    label: "Poisoned",
    about: "Your attacks and checks are at a disadvantage.",
    seconds: 30,
    attackDis: true,
    checkDis: true,
  },
  frightened: {
    label: "Frightened",
    about: "Your attacks and checks are at a disadvantage.",
    seconds: 12,
    attackDis: true,
    checkDis: true,
  },
  grappled: {
    label: "Grappled",
    about: "Held: you can't move until you break free (you try by yourself, Strength or Dexterity against the hold).",
    seconds: 60,
    still: true,
    escape: true,
  },
  restrained: {
    label: "Restrained",
    about: "You can't move, your attacks are at a disadvantage and attacks on you have advantage.",
    seconds: 12,
    attackDis: true,
    defendAdv: true,
    still: true,
  },
  blinded: {
    label: "Blinded",
    about: "Your attacks are at a disadvantage and attacks on you have advantage.",
    seconds: 12,
    attackDis: true,
    defendAdv: true,
  },
  paralyzed: {
    label: "Paralyzed",
    about:
      "You can't move or act, your Strength and Dexterity saves fail, attacks on you have advantage, and a hit from within 1.5 m is a critical hit.",
    seconds: 6,
    defendAdv: true,
    still: true,
    helpless: true,
    failsSaves: true,
    critClose: true,
  },
  stunned: {
    label: "Stunned",
    about: "You can't move or act, your Strength and Dexterity saves fail, and attacks on you have advantage.",
    seconds: 6,
    defendAdv: true,
    still: true,
    helpless: true,
    failsSaves: true,
  },
  asleep: {
    label: "Asleep",
    about:
      "You can't move or act until you're hurt or it wears off. Your Strength and Dexterity saves fail, attacks on you have advantage, and a hit from within 1.5 m is a critical hit.",
    seconds: 12,
    defendAdv: true,
    still: true,
    helpless: true,
    wakes: true,
    failsSaves: true,
    critClose: true,
  },
  slowed: { label: "Slowed", about: "You move at half your pace.", seconds: 6, slow: true },
  hindered: { label: "Hindered", about: "Your attacks are at a disadvantage.", seconds: 6, attackDis: true },
  marked: { label: "Marked", about: "Attacks on you have advantage.", seconds: 6, defendAdv: true },
};

/** A spell's effect as a condition on the player: the same name, or what stands in for it. */
const FROM_EFFECT = { incapacitated: "stunned", charmed: "", calmed: "" };
export const conditionFor = (effect) => {
  const name = FROM_EFFECT[effect] ?? effect;
  return CONDITIONS[name] ? name : "";
};

/** `state` with `name` on it for `seconds` (its own length when not given); one already there keeps the longer. */
export function afflict(state, name, seconds = 0) {
  const rule = CONDITIONS[name];
  if (!rule) return state ?? {};
  const length = seconds > 0 ? seconds : rule.seconds;
  return { ...state, [name]: Math.max(state?.[name] ?? 0, length) };
}

/** `state` without `name`. */
export function lift(state, name) {
  const { [name]: _gone, ...rest } = state ?? {};
  return rest;
}

/** `state` after `seconds` have passed: what has run out is gone. */
export function tickConditions(state, seconds) {
  const next = {};
  for (const [name, left] of Object.entries(state ?? {})) if (left - seconds > 0) next[name] = left - seconds;
  return next;
}

/** `state` after the player has been hurt: what a blow ends (sleep) is gone. */
export function hurtConditions(state) {
  const next = {};
  for (const [name, left] of Object.entries(state ?? {})) if (!CONDITIONS[name]?.wakes) next[name] = left;
  return next;
}

const NONE = {
  attackDis: false,
  checkDis: false,
  defendAdv: false,
  still: false,
  helpless: false,
  slow: false,
  failsSaves: false,
  critClose: false,
  names: [],
};

/** What `state` adds up to: { attackDis, checkDis, defendAdv, still, helpless, slow, failsSaves, critClose, names }. */
export function conditionMods(state) {
  const names = Object.keys(state ?? {}).filter((name) => CONDITIONS[name]);
  if (!names.length) return NONE;
  const any = (key) => names.some((name) => !!CONDITIONS[name][key]);
  return {
    attackDis: any("attackDis"),
    checkDis: any("checkDis"),
    defendAdv: any("defendAdv"),
    still: any("still"),
    helpless: any("helpless"),
    slow: any("slow"),
    failsSaves: any("failsSaves"),
    critClose: any("critClose"),
    names,
  };
}

/** How near an attacker must be for a hit on someone paralyzed or unconscious to be critical (metres: 5 ft). */
export const CRIT_REACH = 1.5;
/** Whether `mods` (conditionMods) fail a saving throw in `attribute` without a roll: Strength and Dexterity. */
export const failsSave = (mods, attribute) =>
  !!mods?.failsSaves && /^(strength|dexterity)$/iu.test(String(attribute ?? ""));
/** Whether a hit on someone with `mods` is a critical hit, from an attacker `gap` metres from them. */
export const critsClose = (mods, gap) => !!mods?.critClose && gap <= CRIT_REACH;

/** `state` for showing: [{ id, label, about, seconds }], the longest-lasting last. */
export function conditionChips(state) {
  return Object.entries(state ?? {})
    .filter(([name]) => CONDITIONS[name])
    .map(([name, left]) => ({
      id: name,
      label: CONDITIONS[name].label,
      about: CONDITIONS[name].about,
      seconds: Math.ceil(left),
    }))
    .sort((a, b) => a.seconds - b.seconds);
}

/**
 * Death saving throws, the SRD's: at 0 HP a d20 at the start of each turn (here, every few seconds too). Ten
 * or more is a success, under ten a failure; a 1 is two failures; a 20 and they're up with 1 HP. Three
 * successes and they're stable; three failures and they're beaten. A blow while down is a failure (two if it
 * was a critical hit). `state`: { wins, losses }. Gives { wins, losses, roll, outcome: "up" | "stable" |
 * "beaten" | "" }.
 */
export function deathSave(state, random = Math.random) {
  const roll = 1 + Math.floor(random() * 20);
  let wins = state?.wins ?? 0;
  let losses = state?.losses ?? 0;
  if (roll === 20) return { wins, losses, roll, outcome: "up" };
  if (roll === 1) losses += 2;
  else if (roll >= 10) wins += 1;
  else losses += 1;
  return { wins, losses, roll, outcome: losses >= 3 ? "beaten" : wins >= 3 ? "stable" : "" };
}
/** A blow on someone who's down and dying: a failure, two for a critical hit. */
export function deathBlow(state, crit = false) {
  const losses = (state?.losses ?? 0) + (crit ? 2 : 1);
  return { wins: state?.wins ?? 0, losses, outcome: losses >= 3 ? "beaten" : "" };
}
