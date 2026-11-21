#!/usr/bin/env node
// Writes packages/wanderworld/src/srd.js from the 5e ruleset package's catalogs
// (packages/ruleset-5e-2014/catalogs: spells, classes, weapons, creatures; SRD 5.1, CC BY 4.0). Wanderworld's spells,
// its classes and each class's weapon are taken from there and nowhere else, so nothing of 5e that isn't
// in the SRD gets in. Run it again whenever that package's catalogs change:
//
//   node scripts/build-wanderworld-srd.mjs
//
// What's taken: every spell of level 0 to 3 that Wanderworld's simple fights can play (damage by a spell
// attack, by a saving throw or without a roll; healing; a save against being held or frightened), with its
// name, level, classes, dice, damage type, save and range; the twelve classes with their hit die; and one
// weapon for each class. What a spell costs in mana and how its rule is worded are Wanderworld's own.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FROM = join(ROOT, "packages/ruleset-5e-2014/catalogs");
const OUT = join(ROOT, "packages/wanderworld/src/srd.js");
const read = (name) => JSON.parse(readFileSync(join(FROM, name), "utf8")).entries;

const SAVES = {
  str_save: "Strength",
  dex_save: "Dexterity",
  con_save: "Constitution",
  int_save: "Intelligence",
  wis_save: "Wisdom",
  cha_save: "Charisma",
};
/** The SRD's conditions Wanderworld can play, and as what: held where it stands, or sent running. */
const CONDITIONS = {
  paralyzed: "paralyzed",
  incapacitated: "incapacitated",
  restrained: "restrained",
  slept: "asleep",
  frightened: "frightened",
  charmed_by_person: "charmed",
  charmed_by_creature: "charmed",
  calmed: "calmed",
  blinded: "blinded",
  slowed: "slowed",
  chilled: "slowed",
  baned: "hindered",
  mocked: "hindered",
  enfeebled: "hindered",
  outlined: "marked",
  guided: "marked",
  prone: "prone",
};
/** The conditions a creature's blow can leave on whoever it hits, that a fight here plays. */
const PLAYER_CONDITIONS = {
  prone: "prone",
  poisoned: "poisoned",
  grappled: "grappled",
  restrained: "restrained",
  frightened: "frightened",
  blinded: "blinded",
  paralyzed: "paralyzed",
  stunned: "stunned",
};
/** Which of a spell's conditions is played, when it leaves several: the first of these it has. */
const CONDITION_ORDER = [...new Set(Object.values(CONDITIONS))];
/** How long a condition lasts here: an instant one (knocked prone) a moment, one round six seconds, longer ones twelve. */
const lasts = (duration) => (duration === "instant" ? 3 : (duration?.rounds ?? 1) <= 1 ? 6 : 12);
/** A spell's area as a reach round its target, in metres: a burst's radius, half a cube or a cone, a line's width. */
const areaOf = (area) => {
  const size = Number(area?.size) || 0;
  const reach = { burst: size * 0.3, box: size * 0.15, cone: size * 0.15, line: 2 }[area?.shape] ?? 0;
  return reach ? Math.max(1.5, Math.min(8, Math.round(reach * 2) / 2)) : 0;
};
/** Feet to metres, kept within what a fight here can see. A touch is arm's reach; a cone or a burst from the caster, a few paces. */
const metres = (feet) => (feet === 0 ? 2.5 : feet == null ? 5 : Math.max(3, Math.min(24, Math.round(feet * 0.3))));

const spells = [];
for (const entry of read("spells.json")) {
  const level = entry.filters?.level;
  const mechanics = entry.mechanics ?? {};
  if (!(level >= 0 && level <= 9) || /[(:]/u.test(entry.label) || !entry.filters.classes?.length) continue;
  const dice = mechanics.amount?.dice ?? null;
  const save = SAVES[mechanics.save?.save] ?? null;
  const applied = (Array.isArray(mechanics.applies) ? mechanics.applies : [])
    .filter((entry) => CONDITIONS[entry.condition])
    .sort(
      (a, b) => CONDITION_ORDER.indexOf(CONDITIONS[a.condition]) - CONDITION_ORDER.indexOf(CONDITIONS[b.condition]),
    )[0];
  const condition = applied ? CONDITIONS[applied.condition] : null;
  const push = mechanics.push > 0 ? Math.round(mechanics.push * 0.3 * 2) / 2 : 0;
  const spell = {
    name: entry.label,
    level,
    classes: entry.filters.classes.map((name) => name.toLowerCase()),
    range: metres(mechanics.range),
  };
  // (Cast as a bonus action, by its casting time: that matters where fights go by turns.)
  if (/Casting time: bonus action/iu.test(entry.rows?.[0]?.values?.notes ?? "")) spell.bonus = true;
  // (The two that are cast in answer to something: they cast themselves when it happens.)
  const answers = { shield: "shield", counterspell: "counter" }[entry.id];
  if (answers) {
    spell.reaction = answers;
    spells.push(spell);
    continue;
  }
  if (mechanics.kind === "heal" && dice) spell.heal = dice;
  else if (mechanics.kind === "attack" && dice) {
    spell.damage = dice;
    spell.type = mechanics.damageType ?? "";
    if (save) spell.save = { attribute: save, onSave: mechanics.save.onSuccess === "half" ? "half" : "none" };
    else if (!mechanics.attackRoll) spell.sure = true; // no roll: it always hits
    if (mechanics.drain?.share) spell.drain = true; // the caster is healed for half of what it deals
  } else if (mechanics.kind === "debuff" && (condition || push)) {
    if (save) spell.save = { attribute: save, onSave: "none" };
    else if (!mechanics.attackRoll) spell.sure = true;
  } else continue;
  // What it leaves on what it lands on (a failed save, a hit): a condition for a while, a shove back.
  if (condition && !spell.heal) {
    spell.effect = condition;
    spell.seconds = lasts(applied.duration);
  }
  if (push && !spell.heal) spell.push = push;
  // (One whose effect lasts only while the caster keeps their mind on it.)
  if (mechanics.concentration && spell.effect) spell.conc = true;
  if (areaOf(mechanics.area) && !spell.heal) {
    spell.area = areaOf(mechanics.area);
    spell.shape = { box: "cube" }[mechanics.area.shape] ?? mechanics.area.shape;
  }
  // How it grows: a cantrip with the caster's level, any other with the slot it's cast from (dice a level above its own).
  if (level === 0 && mechanics.scales && dice) spell.grows = true;
  if (level > 0 && /^\d*d\d+$/u.test(mechanics.perCostStep?.dice ?? "") && dice) spell.up = mechanics.perCostStep.dice;
  spells.push(spell);
}
spells.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));

const ABILITIES = {
  str: "strength",
  dex: "dexterity",
  con: "constitution",
  int: "intelligence",
  wis: "wisdom",
  cha: "charisma",
};
/** One weapon for each class: which of the SRD's it carries is Wanderworld's choice; what it does is the SRD's. */
const CLASS_WEAPON = {
  barbarian: "greataxe",
  bard: "rapier",
  cleric: "mace",
  druid: "quarterstaff",
  fighter: "longsword",
  monk: "quarterstaff",
  paladin: "longsword",
  ranger: "shortsword",
  rogue: "shortsword",
  sorcerer: "dagger",
  warlock: "dagger",
  wizard: "quarterstaff",
};
/** The classes that carry something to shoot with, and what (ours again; the rest cast, or close in). */
const CLASS_RANGED = { fighter: "crossbow-light", ranger: "longbow", rogue: "shortbow" };
const weapons = new Map(read("weapons.json").map((entry) => [entry.id, entry]));
const classes = {};
for (const entry of read("classes.json")) {
  const weapon = weapons.get(CLASS_WEAPON[entry.id]);
  if (!weapon) continue;
  classes[entry.id] = {
    name: entry.label,
    hitDie: Number(String(entry.grants?.sets?.hp_first_die ?? "d8").slice(1)) || 8,
    weapon: { name: weapon.label, damage: weapon.mechanics.amount.dice },
    // What it's trained in: its two saving throws, how many skills of which, what it casts with, and what
    // its Armor Class adds to Dexterity when it wears no armour.
    saves: (entry.grants?.trained?.saves ?? []).map((id) => SAVES[id].toLowerCase()),
    skills: {
      count: entry.grants?.trained?.choose?.[0]?.count ?? 2,
      from: entry.grants?.trained?.choose?.[0]?.from ?? [],
    },
  };
  const casts = ABILITIES[entry.grants?.sets?.spellcasting_ability];
  if (casts) classes[entry.id].casting = casts;
  const bare = ABILITIES[entry.grants?.sets?.unarmored_defense];
  if (bare) classes[entry.id].unarmored = bare;
  const shot = weapons.get(CLASS_RANGED[entry.id]);
  if (shot) {
    // ("Crossbow, light" in the catalog reads "Light crossbow" here.)
    const [what, sort] = shot.label.split(", ");
    classes[entry.id].ranged = {
      name: sort ? `${sort[0].toUpperCase()}${sort.slice(1)} ${what.toLowerCase()}` : what,
      damage: shot.mechanics.amount.dice,
      range: metres(shot.mechanics.range),
    };
  }
}
/**
 * Spell slots by caster level, for slot levels 1 to 3: the ruleset's own step tables (its derived values
 * `slots_N_from_level`), each [[from this caster level, this many slots], …].
 */
const ruleset = JSON.parse(readFileSync(join(ROOT, "packages/ruleset-5e-2014/ruleset.json"), "utf8"));
const slots = {};
(function find(node) {
  if (Array.isArray(node)) return node.forEach(find);
  if (!node || typeof node !== "object") return;
  const level = /^slots_([1-9])_from_level$/u.exec(node.id ?? "")?.[1];
  if (level && Array.isArray(node.table)) slots[level] = node.table;
  Object.values(node).forEach(find);
})(ruleset);
if (Object.keys(slots).length !== 9) throw new Error("The ruleset's spell slot tables weren't found.");

if (Object.keys(classes).length !== 12)
  throw new Error(`Expected the SRD's twelve classes, found ${Object.keys(classes).length}`);
if (spells.length < 30)
  throw new Error(`Too few spells came through (${spells.length}): has the catalog's shape changed?`);

/**
 * Which of the SRD's creatures each of Wanderworld's is, in a fight (the choice is ours: the SRD has no fox,
 * so a fox is a jackal; a husky is a mastiff; the slime a gray ooze; the dragon a red wyrmling). Kinds
 * with nothing close in the SRD (cattle, the alpaca, the shiba) keep Wanderworld's own numbers, as do
 * people, who fight by their class.
 */
const CREATURE_OF = {
  wolf: "wolf",
  deer: "deer",
  stag: "elk",
  fox: "jackal",
  horse: "riding-horse",
  donkey: "mule",
  husky: "mastiff",
  slime: "gray-ooze",
  skeleton: "skeleton",
  spider: "giant-wolf-spider",
  rat: "giant-rat",
  snake: "poisonous-snake",
  bat: "giant-bat",
  wasp: "giant-wasp",
  frog: "giant-frog",
  dragon: "red-dragon-wyrmling",
  bandit: "bandit",
  witch: "cult-fanatic",
  wizard: "mage",
  imp: "imp",
  puglin: "goblin",
  goblin: "goblin",
  ogre: "ogre",
  troll: "troll",
  minotaur: "minotaur",
  hobgoblin: "hobgoblin",
  bugbear: "bugbear",
  gnoll: "gnoll",
  kobold: "kobold",
  lizardfolk: "lizardfolk",
  ghoul: "ghoul",
  orc: "orc",
  mimic: "mimic",
  awakened_shrub: "awakened-shrub",
  shambling_mound: "shambling-mound",
  grick: "grick",
  otyugh: "otyugh",
  roper: "roper",
  gelatinous_cube: "gelatinous-cube",
  basilisk: "basilisk",
  zombie: "zombie",
  ghost: "ghost",
  specter: "specter",
  earth_elemental: "earth-elemental",
  fire_elemental: "fire-elemental",
  water_elemental: "water-elemental",
  air_elemental: "air-elemental",
  hill_giant: "hill-giant",
  stone_giant: "stone-giant",
  frost_giant: "frost-giant",
  fire_giant: "fire-giant",
};
/** A dice expression's average, rounded down, as the SRD gives a creature's hit points ("2d8+2" is 11). */
const average = (dice) => {
  const match = /^(\d+)d(\d+)\s*([+-]\s*\d+)?$/u.exec(String(dice).trim());
  if (!match) return null;
  return Math.floor((Number(match[1]) * (Number(match[2]) + 1)) / 2 + Number((match[3] ?? "0").replace(/\s/gu, "")));
};
const bestiary = new Map(read("creatures.json").map((entry) => [entry.id, entry]));
/** The ruleset's own conditions that harm whoever is in them each round (engulfed in a shambling mound). */
const HARMS = new Map(
  (ruleset.combat?.conditions ?? [])
    .filter((entry) => entry.harms?.dice)
    .map((entry) => [entry.condition, entry.harms]),
);
/** And those that put Strength checks at a disadvantage while they hold (a roper's). */
const WEAKENS = new Set(
  (ruleset.combat?.conditions ?? [])
    .filter((entry) =>
      (entry.modifiers ?? []).some(
        (change) => change.to === "checks" && change.abilities?.includes("str") && change.mode === "disadvantage",
      ),
    )
    .map((entry) => entry.condition),
);
const feetToMetres = (feet) => Math.max(1.5, Math.round(feet * 0.3 * 2) / 2);
const diceWithFlat = (damage) =>
  damage?.dice ? `${damage.dice}${damage.flat > 0 ? `+${damage.flat}` : damage.flat < 0 ? damage.flat : ""}` : "";
/**
 * What a creature grabs and holds with, where the SRD gives it one: the action whose hit grapples (a roper's
 * tendril, an otyugh's tentacle, a frog's bite), the one that engulfs by a saving throw (a gelatinous cube),
 * or a Multiattack whose blows all landing grapple and engulf (a shambling mound). { name, escape (the DC),
 * restrained, reach (metres), and where it has them: main (it's the creature's own attack up close), attack
 * and damage (dice) and type (a holding attack of its own), save { attribute, dc } (it engulfs by a save),
 * both (every blow of its Multiattack must land), times (how many of these its Multiattack makes), upTo (the
 * biggest size it holds), pull (metres its Reel draws the held in), blinded, weak (Strength checks against
 * it are at a disadvantage), engulf { damage, type, save } (what being inside it does each round) }.
 */
function holdOf(sheet, main) {
  const actions = sheet.actions ?? [];
  const grabs = (action) =>
    (action?.applies ?? []).find((entry) => entry.escapeDc && /^(grappled|engulfed)/u.test(entry.condition));
  const multi = actions.find((action) => grabs(action.allHit));
  const action = multi
    ? actions.find((entry) => entry.id === multi.allHit.uses)
    : actions.find((entry) => grabs(entry) && (Number.isInteger(entry.toHit) || entry.engulf));
  const grip = multi ? grabs(multi.allHit) : grabs(action);
  if (!action || !grip) return null;
  const applies = [...(multi?.allHit.applies ?? []), ...(action.applies ?? [])];
  const hold = { name: action.name, escape: grip.escapeDc };
  if (applies.some((entry) => entry.condition === "restrained")) hold.restrained = true;
  hold.reach = feetToMetres(action.reach ?? 5);
  if (action === main) hold.main = true;
  else if (Number.isInteger(action.toHit)) {
    hold.attack = action.toHit;
    if (action.damage?.dice) {
      hold.damage = diceWithFlat(action.damage);
      hold.type = action.damage.type ?? "";
    }
  }
  if (action.engulf?.save) {
    hold.save = { attribute: SAVES[action.engulf.save.save].toLowerCase(), dc: action.engulf.save.difficulty };
    if (action.damage?.dice) {
      hold.damage = diceWithFlat(action.damage);
      hold.type = action.damage.type ?? "";
    }
  }
  if (multi) hold.both = true;
  const steps = actions.find((entry) => Array.isArray(entry.sequence))?.sequence ?? [];
  const times = steps.filter((step) => step.action === action.id).reduce((sum, step) => sum + (step.times ?? 1), 0);
  if (times > 1) hold.times = times;
  const upTo =
    (action.applies ?? []).find((entry) => entry.targetIs?.upToSize)?.targetIs.upToSize ?? action.engulf?.upToSize;
  if (upTo) hold.upTo = upTo;
  const reel = actions.find((entry) => entry.pull > 0 && entry.targetHolds);
  if (reel) hold.pull = feetToMetres(reel.pull);
  if (applies.some((entry) => entry.condition === "blinded")) hold.blinded = true;
  if (applies.some((entry) => WEAKENS.has(entry.condition))) hold.weak = true;
  const harm = applies.map((entry) => HARMS.get(entry.condition)).find(Boolean);
  if (harm)
    hold.engulf = {
      damage: diceWithFlat(harm),
      type: harm.type ?? "",
      ...(harm.save ? { save: { attribute: SAVES[harm.save.save].toLowerCase(), dc: harm.save.difficulty } } : {}),
    };
  return hold;
}
/** Feet written in a rule's text, as metres: "within 60 ft." is "within 18 m". */
const textInMetres = (text) =>
  text.replace(/(\d+)(?:\s|-)?(?:feet|foot|ft\.?)(?![a-z])/gu, (_, feet) => `${feetToMetres(Number(feet))} m`);
/** A rule's first sentence, in metres, "It" for the creature, and no longer than `most` characters. */
function firstSentence(text, most = 80) {
  const first = textInMetres(String(text ?? "").trim())
    .split(/(?<!\bm|\bft)\.\s/u)[0]
    .replace(/\.$/u, "")
    .replace(/^The [a-z' -]+? (?=(?:has|can|is|regains|adheres|takes|sheds|makes|moves)\b)/iu, "It ");
  return first.length > most ? `${first.slice(0, most - 1).replace(/\s+\S*$/u, "")}…` : first;
}
/**
 * An action in a few words: "+7 to hit, 2d6+4 slashing, reach 1.5 m"; "7d6 fire, DC 13 Dexterity save for
 * half, cone 4.5 m"; "+4 to hit, 2d4+2 piercing, DC 11 Strength save or prone".
 */
function actionWords(action, actions) {
  if (Array.isArray(action.sequence))
    return action.sequence
      .map((step) => {
        const name = actions.find((entry) => entry.id === step.action)?.name ?? step.action;
        return step.times > 1 ? `${name} ×${step.times}` : name;
      })
      .join(", ");
  const dice = diceWithFlat(action.damage);
  const laid = [
    ...new Set(
      (action.applies ?? [])
        .map((entry) => PLAYER_CONDITIONS[entry.condition] ?? CONDITIONS[entry.condition])
        .filter(Boolean),
    ),
  ].join(" or ");
  const parts = [];
  if (Number.isInteger(action.toHit)) parts.push(`+${action.toHit} to hit`);
  if (dice) parts.push(`${dice} ${action.damage.type ?? ""}`.trim());
  const save = action.save ? `DC ${action.save.difficulty} ${SAVES[action.save.save]} save` : "";
  if (save) parts.push(laid ? `${save} or ${laid}` : `${save}${action.save.onSuccess === "half" ? " for half" : ""}`);
  else if (laid) parts.push(laid);
  const reach = action.reach ? `reach ${feetToMetres(action.reach)} m` : "";
  const range = action.range?.normal ? `range ${feetToMetres(action.range.normal)} m` : "";
  if (reach || range) parts.push([reach, range].filter(Boolean).join(" or "));
  if (action.area?.size) parts.push(`${action.area.shape ?? "area"} ${feetToMetres(action.area.size)} m`);
  if (action.recharge?.from) parts.push(`recharge ${action.recharge.from}–6`);
  return parts.join(", ");
}
/**
 * What the info card shows of a creature besides its fighting numbers (fighthud.js creatureCard): its six
 * ability scores, speed and senses in metres, the conditions it can't be put in, its alignment, and its
 * traits and actions in a line each. Short on purpose: srd.js stays small.
 */
function cardFacts(sheet) {
  const scores = sheet.abilities ?? sheet.sheet?.abilities ?? {};
  const facts = {};
  const order = ["str", "dex", "con", "int", "wis", "cha"];
  if (order.every((id) => Number.isInteger(scores[id]))) facts.scores = order.map((id) => scores[id]);
  const walk = sheet.speed ?? sheet.sheet?.fields?.speed ?? 0;
  const speeds = [
    ...(walk ? [`${feetToMetres(walk)} m`] : []),
    ...Object.entries(sheet.speeds ?? {}).map(([how, feet]) => `${how} ${feetToMetres(feet)} m`),
  ];
  if (speeds.length) facts.speed = `${speeds.join(", ")}${sheet.hover ? " (hover)" : ""}`;
  const senses = Object.entries(sheet.senses ?? {}).map(([sense, feet]) => `${sense} ${feetToMetres(feet)} m`);
  if (senses.length) facts.senses = senses.join(", ");
  // (Only the SRD's own conditions; a spell's own, "antipathy_frightened", is left out.)
  const shrugs = (sheet.conditionImmunities ?? []).filter((name) => /^[a-z]+$/u.test(name));
  if (shrugs.length) facts.unmoved = shrugs;
  if (sheet.alignment) facts.alignment = sheet.alignment;
  const actions = sheet.actions ?? [];
  const named = new Set(actions.map((action) => action.name.toLowerCase()));
  const traits = (sheet.traits ?? [])
    .filter(
      (trait) => !/^variant/iu.test(trait.name) && !named.has(trait.name.toLowerCase()) && !/^hit:/iu.test(trait.text),
    )
    .slice(0, 3)
    .map((trait) => `${trait.name}: ${firstSentence(trait.text)}`);
  if (traits.length) facts.traits = traits;
  const acts = actions
    .filter((action) => !/^multiattack \(/iu.test(action.name))
    .slice(0, 5)
    .map((action) => {
      const words = actionWords(action, actions);
      return words ? `${action.name}: ${words}` : action.name;
    });
  if (acts.length) facts.acts = acts;
  return facts;
}

const creatures = {};
for (const [kind, id] of Object.entries(CREATURE_OF)) {
  const entry = bestiary.get(id);
  const sheet = entry?.creature;
  // (One with a class, a spellcaster, has its hit points and Armor Class on a character sheet of its own.)
  const hp = average(sheet?.health?.dice) ?? sheet?.sheet?.fields?.hp_max;
  const ac = sheet?.defense ?? sheet?.sheet?.fields?.ac;
  // Its attack up close: the first with a roll to hit and a reach, else the first with a roll to hit. (A
  // bite that is all venom, the poisonous snake's, has its dice under what the bite adds.)
  const diceOf = (action) => action.damage?.dice ?? action.damage?.plus?.[0]?.dice;
  const attacks = (sheet?.actions ?? []).filter((action) => Number.isInteger(action.toHit) && diceOf(action));
  const attack = attacks.find((action) => action.reach) ?? attacks[0];
  if (!hp || !Number.isInteger(ac) || !attack) {
    console.warn(`no numbers for ${kind} (${id}): it keeps Wanderworld's own`);
    continue;
  }
  const flat = attack.damage.flat > 0 ? `+${attack.damage.flat}` : "";
  creatures[kind] = {
    name: entry.label,
    hp,
    ac,
    attack: attack.toHit,
    damage: `${diceOf(attack)}${flat}`,
    dex: sheet.initiativeModifier ?? 0,
  };
  const made = creatures[kind];
  // What its blow is (slashing, piercing, …) and what it shrugs off or can't bear.
  const type = attack.damage?.type ?? attack.damage?.plus?.[0]?.type;
  if (type) made.type = type;
  for (const [ours, theirs] of [
    ["resist", "resist"],
    ["immune", "immune"],
    ["vulnerable", "vulnerable"],
  ])
    if (Array.isArray(sheet[theirs]) && sheet[theirs].length) made[ours] = sheet[theirs];
  // Its saving throws and what it notices and hides with, where the SRD gives them.
  const saves = sheet.saves ?? {};
  made.saves = Object.fromEntries(
    Object.entries(SAVES)
      .filter(([id]) => Number.isInteger(saves[id]))
      .map(([id, name]) => [name.toLowerCase(), saves[id]]),
  );
  if (!Object.keys(made.saves).length) delete made.saves;
  if (Number.isInteger(sheet.checks?.stealth)) made.stealth = sheet.checks.stealth;
  if (Number.isInteger(sheet.checks?.perception)) made.perception = sheet.checks.perception;
  // What comes with its blow: more damage of another kind (venom, fire) with a save for half, and a
  // condition on a failed save (a wolf's bite knocks prone) or outright (a frog's bite holds).
  const more = attack.damage?.dice ? attack.damage?.plus?.[0] : null;
  if (more?.dice)
    made.rider = {
      damage: more.dice,
      type: more.type ?? "",
      ...(more.save
        ? {
            save: {
              attribute: SAVES[more.save.save].toLowerCase(),
              dc: more.save.difficulty,
              onSave: more.save.onSuccess === "half" ? "half" : "none",
            },
          }
        : {}),
    };
  const laid = (attack.applies ?? []).find((entry) => PLAYER_CONDITIONS[entry.condition]);
  if (laid)
    made.inflict = {
      condition: PLAYER_CONDITIONS[laid.condition],
      ...(attack.save
        ? { save: { attribute: SAVES[attack.save.save].toLowerCase(), dc: attack.save.difficulty } }
        : {}),
      ...(laid.escapeDc ? { escape: laid.escapeDc } : {}),
    };
  // Its size and Strength (what a grab, a hold and a throw go by), and what it grabs and holds with.
  if (sheet.size) made.size = sheet.size;
  if (Number.isInteger(sheet.abilities?.str)) made.str = sheet.abilities.str;
  const held = holdOf(sheet, attack);
  if (held) made.hold = held;
  // How many blows its Multiattack is, of this attack.
  const multi = (sheet.actions ?? []).find((action) => Array.isArray(action.sequence));
  const times = multi?.sequence.reduce((sum, step) => sum + (Number(step.times) || 1), 0) ?? 0;
  if (times > 1) made.multi = Math.min(4, times);
  // Pack Tactics: the better of two rolls with one of its own beside what it attacks.
  if ((sheet.attackModes ?? []).some((mode) => mode.mode === "advantage" && mode.allyAdjacent)) made.pack = true;
  // A breath (or the like): an area with a save, back on a roll of the die each round.
  const breath = (sheet.actions ?? []).find((action) => action.area && action.save && action.recharge);
  if (breath?.damage?.dice)
    made.breath = {
      name: breath.name,
      damage: breath.damage.dice,
      type: breath.damage.type ?? "",
      save: { attribute: SAVES[breath.save.save].toLowerCase(), dc: breath.save.difficulty, onSave: "half" },
      reach: Math.max(3, Math.round(breath.area.size * 0.3)),
      recharge: breath.recharge.from ?? 5,
    };
  // How it behaves, where the ruleset says: whom it goes for, and how brave it is.
  const behavior = sheet.behavior ?? {};
  if (behavior.targets?.length) made.targets = behavior.targets[0];
  if (behavior.temperament) made.temperament = behavior.temperament;
  if (sheet.mind === "mindless") made.temperament = "mindless";
  if (sheet.loot) made.loot = sheet.loot;
  if (typeof entry.filters?.challenge === "number") made.cr = entry.filters.challenge;
  if (sheet.type) made.kin = sheet.type; // (what sort of thing it is: beast, undead, fiend, …)
  Object.assign(made, cardFacts(sheet));
  // What it has for a distance: a bow or a crossbow before something thrown.
  const far = attacks.filter((action) => action.range?.normal);
  const shot = far.find((action) => !action.reach) ?? far[0];
  if (shot)
    creatures[kind].ranged = {
      name: shot.name,
      attack: shot.toHit,
      damage: `${diceOf(shot)}${shot.damage.flat > 0 ? `+${shot.damage.flat}` : ""}`,
      range: metres(shot.range.normal),
    };
  // A spellcaster's spells: those of its list that a fight here can play as damage, to the second level (the
  // greater ones would end a fight in one go), and what its casting adds.
  const known = (sheet.sheet?.lists?.spells ?? [])
    .map((spell) => spells.find((ours) => ours.name === spell.name))
    .filter((spell) => spell && !spell.reaction && (spell.damage || spell.effect || spell.heal) && spell.level <= 3);
  if (known.length) {
    creatures[kind].spells = known.map((spell) => spell.name);
    const ability = sheet.sheet.fields?.spellcasting_ability;
    creatures[kind].wit = Math.floor(((sheet.sheet.abilities?.[ability] ?? 10) - 10) / 2);
  }
}
// Some of a kind fight another way: a bandit who casts has an acolyte's spells (the SRD's nearest: a
// first-level caster among common folk). Which SRD creature stands in is Wanderworld's choice.
const CASTER_OF = { bandit: "acolyte" };
for (const [kind, id] of Object.entries(CASTER_OF)) {
  const sheet = bestiary.get(id)?.creature?.sheet;
  const known = (sheet?.lists?.spells ?? [])
    .map((spell) => spells.find((ours) => ours.name === spell.name))
    .filter((spell) => spell && !spell.reaction && (spell.damage || spell.effect || spell.heal) && spell.level <= 3);
  if (!creatures[kind] || !known.length) continue;
  const ability = sheet.fields?.spellcasting_ability;
  creatures[kind].caster = {
    name: bestiary.get(id).label,
    spells: known.map((spell) => spell.name),
    wit: Math.floor(((sheet.abilities?.[ability] ?? 10) - 10) / 2),
  };
}
if (Object.keys(creatures).length < 15)
  throw new Error(
    `Too few creatures came through (${Object.keys(creatures).length}): has the catalog's shape changed?`,
  );

// The weapon table: what each does, its kind of damage and its properties. And armour: what it makes of
// Armor Class and how much of Dexterity still counts. Prices are the SRD's, in gold pieces.
const gear = new Map(read("equipment.json").map((entry) => [entry.id, entry]));
const weaponTable = {};
for (const entry of read("weapons.json")) {
  const row = entry.rows?.[0]?.values ?? {};
  const has = (name) => (entry.filters?.properties ?? []).some((property) => property.toLowerCase().startsWith(name));
  if (!row.damage || !/^\d*d\d+$/u.test(row.damage)) continue;
  const ranged = /ranged/iu.test(entry.filters?.category ?? "");
  const [what, sort] = entry.label.split(", ");
  const made = {
    name: sort ? `${sort[0].toUpperCase()}${sort.slice(1)} ${what.toLowerCase()}` : what,
    damage: row.damage,
    type: row.damage_type ?? "",
  };
  const two = /Versatile: (\d*d\d+)/u.exec(entry.summary ?? "")?.[1];
  if (two) made.versatile = two;
  if (has("finesse")) made.finesse = true;
  if (has("light")) made.light = true;
  if (has("heavy")) made.heavy = true;
  if (has("two-handed")) made.two = true;
  if (has("reach")) made.reach = true;
  if (ranged) made.range = metres(row.range);
  else if (has("thrown")) made.thrown = metres(row.range);
  if (/martial/iu.test(entry.filters?.category ?? "")) made.martial = true;
  const cost = gear.get(entry.id)?.item?.cost;
  if (cost?.amount)
    made.cost = Math.max(1, Math.round(cost.amount * ({ cp: 0.01, sp: 0.1, gp: 1, pp: 10 }[cost.unit] ?? 1)));
  weaponTable[entry.id] = made;
}
const armourTable = {};
for (const entry of gear.values()) {
  const item = entry.item ?? {};
  if (!item.tags?.includes("mundane")) continue;
  const cost = item.cost?.amount
    ? Math.max(1, Math.round(item.cost.amount * ({ cp: 0.01, sp: 0.1, gp: 1, pp: 10 }[item.cost.unit] ?? 1)))
    : 0;
  if (item.category === "shield" && item.stats?.ac_bonus)
    armourTable[entry.id] = { name: entry.label, kind: "shield", bonus: item.stats.ac_bonus, cost };
  if (item.category !== "armor" || !item.stats?.ac_base) continue;
  const kind = ["light", "medium", "heavy"].find((sort) => item.tags.includes(`${sort}_armor`));
  if (!kind) continue;
  armourTable[entry.id] = {
    name: entry.label,
    kind,
    ac: item.stats.ac_base,
    // (How much of the Dexterity modifier still counts: all of it in light armour, two in medium, none in heavy.)
    dex: kind === "light" ? 9 : kind === "medium" ? (item.stats.dex_cap ?? 2) : 0,
    ...(item.worn?.skills?.includes("stealth") ? { noisy: true } : {}),
    cost,
  };
}
if (Object.keys(weaponTable).length < 30 || Object.keys(armourTable).length < 10)
  throw new Error(
    `Too little gear came through (${Object.keys(weaponTable).length} weapons, ${Object.keys(armourTable).length} armours).`,
  );

// Races: what each adds to the six abilities, how far it walks in a turn, whether it sees in the dark, and
// the skills it has from birth. One with subraces is given as its SRD subrace (a dwarf is a hill dwarf).
const allRaces = read("races.json");
const races = {};
for (const entry of allRaces) {
  if (entry.filters?.parent) continue;
  const sub = allRaces.find((other) => other.filters?.parent === entry.id && !other.id.startsWith("draconic"));
  const add = {};
  for (const from of [entry, sub])
    for (const [ability, amount] of Object.entries(from?.grants?.abilities?.add ?? {}))
      add[ABILITIES[ability]] = (add[ABILITIES[ability]] ?? 0) + amount;
  const feet = (entry.rows ?? []).map((row) => row.values?.speed).find(Boolean) ?? 30;
  races[entry.id] = {
    name: sub ? (sub.label.includes(entry.label) ? sub.label : `${sub.label} ${entry.label}`) : entry.label,
    add,
    speed: Math.round(feet * 0.3 * 2) / 2,
    ...(/darkvision/iu.test(entry.summary ?? "") ? { dark: true } : {}),
    ...(entry.grants?.trained?.skills?.length ? { skills: entry.grants.trained.skills } : {}),
  };
}
const skillList = ruleset.sheet.skills
  .filter((skill) => ABILITIES[skill.ability] && !/tools/u.test(skill.id))
  .map((skill) => ({ id: skill.id, name: skill.label, ability: ABILITIES[skill.ability] }));
const styles = Object.fromEntries(
  read("fighting_styles.json").map((entry) => [
    entry.id,
    { name: entry.label, about: entry.summary, classes: entry.filters?.class_ids ?? [] },
  ]),
);
const backgrounds = Object.fromEntries(
  read("backgrounds.json").map((entry) => [
    entry.id,
    { name: entry.label, skills: entry.grants?.trained?.skills ?? [] },
  ]),
);
if (Object.keys(races).length < 9 || skillList.length !== 18)
  throw new Error(
    `Races or skills didn't come through (${Object.keys(races).length} races, ${skillList.length} skills).`,
  );

// Magic things that are worn, where what they do is something a fight here can play: Armor Class, saving
// throws, an ability set to a number, a caster's attack and DC. And the potions that heal, with their dice.
// And the package's own pocket-treasure tables (the SRD has none): coin, a potion, now and then a magic item.
const gpOf = (cost) =>
  cost?.amount ? Math.max(1, Math.round(cost.amount * ({ cp: 0.01, sp: 0.1, gp: 1, pp: 10 }[cost.unit] ?? 1))) : 0;
const magic = {};
const potions = {};
for (const entry of read("magic_items.json")) {
  const item = entry.item ?? {};
  if (item.category === "potion" && item.use?.kind === "heal" && item.use.amount?.dice) {
    potions[entry.id] = {
      name: entry.label,
      heal: item.use.amount.dice,
      rarity: item.rarity ?? "common",
      cost: gpOf(item.cost),
    };
    continue;
  }
  if (!["ring", "wondrous", "rod", "wand", "staff"].includes(item.category) || /[(:]/u.test(entry.label)) continue;
  const made = { name: entry.label, rarity: item.rarity ?? "uncommon" };
  if (item.stats?.ac_bonus) made.ac = item.stats.ac_bonus;
  if (item.stats?.unarmored_ac_bonus) made.bare = item.stats.unarmored_ac_bonus;
  const saves = (item.worn?.modifiers ?? []).find((modifier) => modifier.to === "saves" && modifier.flat);
  if (saves) made.saves = saves.flat;
  for (const [ability, change] of Object.entries(item.worn?.abilities ?? {})) {
    if (!ABILITIES[ability]) continue;
    if (Number.isFinite(change?.set)) (made.set ??= {})[ABILITIES[ability]] = change.set;
    if (Number.isFinite(change?.add)) (made.add ??= {})[ABILITIES[ability]] = change.add;
  }
  if (item.stats?.spell_attack_bonus) made.spell = item.stats.spell_attack_bonus;
  if (Object.keys(made).length <= 2) continue; // (nothing of it that a fight here plays)
  made.cost = gpOf(item.cost);
  magic[entry.id] = made;
}
const loot = {};
for (const table of ruleset.items?.lootTables ?? []) {
  if (!/^treasure_/u.test(table.id)) continue;
  loot[table.id] = {
    rolls: String(table.rolls ?? 1),
    entries: table.entries.map(
      (entry) =>
        entry.coins
          ? { weight: entry.weight, coins: entry.coins, count: entry.count }
          : entry.filter?.category === "potion"
            ? { weight: entry.weight, potion: entry.filter.rarity }
            : entry.filter && !entry.filter.category
              ? { weight: entry.weight, magic: entry.filter.rarity }
              : { weight: entry.weight }, // (a scroll, say: nothing Wanderworld has)
    ),
  };
}
if (Object.keys(magic).length < 8 || Object.keys(potions).length < 2 || !loot.treasure_low)
  throw new Error(
    `Magic items or loot didn't come through (${Object.keys(magic).length} items, ${Object.keys(potions).length} potions).`,
  );

const text = `// Generated by scripts/build-wanderworld-srd.mjs from packages/ruleset-5e-2014 (its spell, class and weapon
// catalogs). Do not edit by hand: change the script, or the ruleset package, and run it again.
//
// This file includes material from the System Reference Document 5.1 ("SRD 5.1") by Wizards of the Coast
// LLC, available at https://dnd.wizards.com/resources/systems-reference-document and licensed under the
// Creative Commons Attribution 4.0 International License (https://creativecommons.org/licenses/by/4.0/legalcode),
// in the machine-readable form of the Open5e API project (https://github.com/open5e/open5e-api, srd-2014).
// The material has been adapted: only names, levels, classes, dice, damage types, saving throws, casting times,
// ranges and the spell slot table are kept, ranges are in metres, and what a spell costs in mana is Wanderworld's own. Not affiliated with
// or endorsed by Wizards of the Coast.

/** The credit this material needs, shown in Help → Credits. */
export const SRD_CREDIT =
  "Spells, classes, races, skills, fighting styles, weapons, armour, magic items and creatures' numbers include material from the System Reference Document 5.1 by Wizards of the Coast LLC (https://dnd.wizards.com/resources/systems-reference-document), licensed under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/legalcode), by way of the Open5e API project. Adapted: only names, levels, dice, damage types, saving throws, conditions, areas, ranges, weapons' and armour's numbers and creatures' hit points, Armor Class, ability scores, speeds, senses, attacks, saving throws, what they resist or are immune to, and their traits and actions shortened to a line each, are kept. Not affiliated with or endorsed by Wizards of the Coast.";

/**
 * The SRD's spells of level 0 (cantrips) to 3 that a fight here can play: { name, level, classes, range
 * (metres), and damage (dice) with type, save { attribute, onSave } or sure (no roll); or heal (dice); or
 * save with effect (a condition) }.
 */
export const SRD_SPELLS = ${JSON.stringify(spells)};

/** Spell slots of levels 1 to 3 by caster level: { [slot level]: [[from this caster level, this many], …] }. */
export const SRD_SLOTS = ${JSON.stringify(slots)};

/**
 * The SRD's classes: { [id]: { name, hitDie, weapon: { name, damage }, saves (the two saving throws it's
 * proficient in), skills: { count, from }, and where it has them ranged { name, damage, range (metres) },
 * casting (the ability it casts with) and unarmored (what its AC adds to Dexterity with no armour on) } }.
 */
export const SRD_CLASSES = ${JSON.stringify(classes)};

/**
 * The SRD's numbers for Wanderworld's creatures, by Wanderworld's kind: { name (the SRD creature it's taken
 * as), hp (its hit dice's average), ac, attack (what its attack up close adds to the roll), damage (dice),
 * dex (what it adds to initiative), and where it has them ranged { name, attack, damage, range (metres) },
 * spells (names from SRD_SPELLS) and wit (what its casting adds), size, str (its Strength) and hold (what it
 * grabs and holds with, with its escape DC); and for the info card scores (the six ability scores, Strength
 * first), speed and senses (in metres), unmoved (the conditions it is immune to), alignment, and traits and
 * acts (a line each, shortened) }.
 */
export const SRD_CREATURES = ${JSON.stringify(creatures)};

/**
 * The SRD's weapons: { [id]: { name, damage (dice), type (slashing | piercing | bludgeoning), and where it
 * has them versatile (its dice in two hands), finesse, light, heavy, two (two-handed), reach, range (metres:
 * it's shot), thrown (metres), martial, cost (gold pieces) } }.
 */
export const SRD_WEAPONS = ${JSON.stringify(weaponTable)};

/**
 * The SRD's armour and shield: { [id]: { name, kind (light | medium | heavy | shield), ac (what Armor Class
 * starts from in it), dex (how much of the Dexterity modifier still counts), noisy (it hinders Stealth),
 * bonus (a shield's), cost (gold pieces) } }.
 */
export const SRD_ARMOUR = ${JSON.stringify(armourTable)};

/**
 * The SRD's races: { [id]: { name, add ({ [ability]: how much it adds }), speed (metres a turn), dark (it has
 * darkvision), skills (ids it's proficient in) } }. One with subraces is its SRD subrace.
 */
export const SRD_RACES = ${JSON.stringify(races)};

/** The SRD's skills: [{ id, name, ability }]. */
export const SRD_SKILLS = ${JSON.stringify(skillList)};

/** The SRD's fighting styles: { [id]: { name, about, classes (ids that may take it) } }. */
export const SRD_STYLES = ${JSON.stringify(styles)};

/** The SRD's backgrounds: { [id]: { name, skills (ids it's proficient in) } }. */
export const SRD_BACKGROUNDS = ${JSON.stringify(backgrounds)};

/**
 * The SRD's magic things that are worn and do something a fight here plays: { [id]: { name, rarity, ac (added
 * to Armor Class), bare (added to it with no armour or shield on), saves (added to every saving throw), set
 * ({ [ability]: what it becomes, if that's more }), add ({ [ability]: amount }), spell (added to a spell's
 * attack and DC), cost (gold pieces) } }.
 */
export const SRD_MAGIC = ${JSON.stringify(magic)};

/** The SRD's potions that heal: { [id]: { name, heal (dice), rarity, cost (gold pieces) } }. */
export const SRD_POTIONS = ${JSON.stringify(potions)};

/**
 * Pocket treasure by tier (the ruleset package's own tables; the SRD has none): { [tier]: { rolls (dice),
 * entries: [{ weight, and coins (cp | sp | gp | pp) with count (dice), or potion (a rarity), or magic (a
 * rarity), or nothing }] } }.
 */
export const SRD_LOOT = ${JSON.stringify(loot)};
`;
writeFileSync(OUT, text);
console.log(`wrote ${OUT}: ${spells.length} spells, ${Object.keys(classes).length} classes`);
for (const spell of spells)
  console.log(
    `${spell.level} ${spell.name.padEnd(22)} ${spell.heal ? `heal ${spell.heal}` : (spell.damage ?? spell.effect)} ${spell.save ? `${spell.save.attribute} save (${spell.save.onSave})` : spell.sure ? "sure" : spell.heal ? "" : "attack"} ${spell.effect ?? ""} ${spell.range} m`,
  );
