// A character's build, the 5e SRD's way: a race, a class, a fighting style, a background and the skills they
// are proficient in, and what all of that comes to at their level: what is always on (a saving throw they're
// trained in, a monk's unarmoured defence, a rogue's Sneak Attack) and what they can use so many times
// between rests (Second Wind, Rage, Ki, Lay on Hands). The names and numbers are the SRD's (SRD 5.1, CC BY
// 4.0; the credit is srd.js's); which of a class's features a fight here can play is Wanderworld's choice.
//
// A build is plain data kept with the world: { race, style, background, skills: [ids] } (the class is kept
// where it always was). The user plans to move characters into Quartermaster: when that happens this
// module is what reads from there, and main.js need not change. This module only works things out.

import { SRD_BACKGROUNDS, SRD_CLASSES, SRD_CREATURES, SRD_RACES, SRD_SKILLS, SRD_STYLES } from "./srd.js";

/** A build from whatever was saved: only what the SRD has, and no more skills than the class allows. */
export function checkBuild(raw, classId = "") {
  const allowed = skillChoices(classId, raw?.background, raw?.race);
  const skills = [...new Set(Array.isArray(raw?.skills) ? raw.skills : [])]
    .filter((id) => allowed.from.includes(id))
    .slice(0, allowed.count);
  const style = SRD_STYLES[raw?.style]?.classes.includes(classId) ? raw.style : "";
  // (`extra`: skills had from somewhere else, a card's sheet: any of the SRD's, not counted against the class's number.)
  const extra = [...new Set(Array.isArray(raw?.extra) ? raw.extra : [])].filter((id) => skillNamed(id));
  return {
    race: SRD_RACES[raw?.race] ? raw.race : "",
    style,
    background: SRD_BACKGROUNDS[raw?.background] ? raw.background : "",
    skills,
    ...(extra.length ? { extra } : {}),
    ...(wildForms(20).includes(raw?.form) ? { form: raw.form } : {}),
    ...(Array.isArray(raw?.feats) && raw.feats.some((id) => SRD_FEATS[id])
      ? { feats: [...new Set(raw.feats.filter((id) => SRD_FEATS[id]))] }
      : {}),
  };
}

/**
 * The beasts a druid of `level` can take the shape of, of those Wanderworld has (its kinds): challenge 1/4 or
 * less from level 2, 1/2 from level 4 and 1 from level 8, and nothing that flies before level 8.
 */
export function wildForms(level) {
  if (level < 2) return [];
  const most = level >= 8 ? 1 : level >= 4 ? 0.5 : 0.25;
  return Object.entries(SRD_CREATURES)
    .filter(([kind, beast]) => beast.kin === "beast" && (beast.cr ?? 9) <= most)
    .filter(([kind]) => level >= 8 || !["bat", "wasp"].includes(kind))
    .map(([kind]) => kind);
}

/** The SRD's feats (it has the one). `needs`: the least of an ability it asks. */
export const SRD_FEATS = {
  grappler: {
    name: "Grappler",
    about: "Advantage on your attacks against a creature you're grappling. Needs Strength 13.",
    needs: { strength: 13 },
  },
};

const SHORT = {
  str: "strength",
  dex: "dexterity",
  con: "constitution",
  int: "intelligence",
  wis: "wisdom",
  cha: "charisma",
};

/**
 * A 5e sheet from a persona's or a character's card (the Engine's ruleset sheet for "5e-2014", as
 * character.js hands it over: { v, build: { abilities, skills, fields, lists } }), read as what Wanderworld
 * can use: { classId, level, race, background, style, abilities ({ strength: 15, … } as written, with the
 * race's increases in them), skills (ids they're proficient in), spells (names), hpMax }. null when it
 * isn't a sheet. Anything the SRD here doesn't have (a class, a race) comes out "".
 */
export function cardBuild(raw) {
  const build = raw?.build && typeof raw.build === "object" ? raw.build : raw;
  if (!build || typeof build !== "object" || (!build.fields && !build.abilities)) return null;
  const fields = build.fields && typeof build.fields === "object" ? build.fields : {};
  const text = (value) => String(value ?? "").toLowerCase();
  const levels = Object.keys(SRD_CLASSES)
    .map((id) => [id, Math.max(0, Math.round(Number(fields[`level_${id}`]) || 0))])
    .sort((a, b) => b[1] - a[1]);
  const named = text(fields.first_class) || text(fields.class);
  const classId =
    levels[0][1] > 0
      ? levels[0][0]
      : (Object.keys(SRD_CLASSES).find((id) => named.split(/[^a-z]+/u).includes(id)) ?? "");
  const total =
    levels.reduce((sum, [, level]) => sum + level, 0) + Math.max(0, Math.round(Number(fields.level_other) || 0));
  const race = text(`${fields.subrace ?? ""} ${fields.race ?? ""}`);
  const raceId =
    Object.entries(SRD_RACES).find(([, entry]) => race.includes(entry.name.toLowerCase()))?.[0] ??
    Object.keys(SRD_RACES)
      .sort((a, b) => b.length - a.length)
      .find((id) => race.includes(id.replace("-", " ")) || race.includes(id)) ??
    "";
  const abilities = {};
  for (const [short, name] of Object.entries(SHORT)) {
    const score = Number(build.abilities?.[short] ?? build.abilities?.[name]);
    if (Number.isFinite(score)) abilities[name] = Math.max(1, Math.min(30, Math.round(score)));
  }
  const rows = (list) => (Array.isArray(build.lists?.[list]) ? build.lists[list] : []);
  const features = rows("features").map((row) => text(row?.name));
  return {
    classId,
    level: Math.max(1, Math.min(20, total || 1)),
    race: raceId,
    background:
      Object.entries(SRD_BACKGROUNDS).find(([, entry]) =>
        text(fields.background).includes(entry.name.toLowerCase()),
      )?.[0] ?? "",
    style:
      Object.entries(SRD_STYLES).find(([, style]) =>
        features.some((name) => name.includes(style.name.toLowerCase())),
      )?.[0] ?? "",
    abilities,
    skills: Object.entries(build.skills && typeof build.skills === "object" ? build.skills : {})
      .filter(([id, tier]) => (tier === "proficient" || tier === "expertise") && skillNamed(id))
      .map(([id]) => id),
    spells: [
      ...new Set(
        rows("spells")
          .map((row) => String(row?.name ?? "").trim())
          .filter(Boolean),
      ),
    ],
    hpMax: Number(fields.hp_max) > 0 ? Math.round(Number(fields.hp_max)) : 0,
  };
}

/**
 * The skills a character may pick, and how many: their class's list and count. `given`: the ones they have
 * anyway, from their race and background, which don't count against the number.
 */
export function skillChoices(classId, background = "", race = "") {
  const from = SRD_CLASSES[classId]?.skills.from ?? [];
  const given = [...(SRD_BACKGROUNDS[background]?.skills ?? []), ...(SRD_RACES[race]?.skills ?? [])];
  return {
    count: SRD_CLASSES[classId]?.skills.count ?? 0,
    from: from.filter((id) => !given.includes(id)),
    given,
  };
}

/** Every skill the build is proficient in: the picked, and the given. */
export function skillsOf(build, classId = "") {
  const choices = skillChoices(classId, build?.background, build?.race);
  return [
    ...new Set([
      ...(build?.skills ?? []).filter((id) => choices.from.includes(id)),
      ...choices.given,
      ...(build?.extra ?? []),
    ]),
  ];
}

/** What a race adds to the abilities: { [ability]: amount } (nothing for none). */
export const raceBonuses = (race) => SRD_RACES[race]?.add ?? {};

/** A skill by its id: { id, name, ability }, or null. */
export const skillNamed = (id) => SRD_SKILLS.find((skill) => skill.id === id) ?? null;

/** The fighting styles a class may take (ids), from the level it gets one; none for the rest. */
export function stylesFor(classId, level = 1) {
  const from = { fighter: 1, paladin: 2, ranger: 2 }[classId];
  if (!from || level < from) return [];
  return Object.entries(SRD_STYLES)
    .filter(([id, style]) => style.classes.includes(classId) && PLAYED_STYLES.includes(id))
    .map(([id]) => id);
}
/** The styles a fight here can play (Protection needs a reaction for someone else, Two-Weapon Fighting an off hand). */
const PLAYED_STYLES = ["archery", "defense", "dueling", "great-weapon-fighting"];

const step = (level, table) => table.reduce((value, [from, amount]) => (level >= from ? amount : value), 0);

/**
 * What a class has always on at `level`, with a fighting `style`:
 *   saves: the saving throws they add their proficiency bonus to
 *   unarmored: the ability their AC adds to Dexterity with no armour on ("" for none); a monk's with no shield either
 *   critFrom: the lowest roll of the die that's a critical hit (a Champion's 19 from fighter level 3)
 *   sneak: a rogue's Sneak Attack dice ("" for none)
 *   martial: a monk's unarmed dice ("" for none)
 *   rage: what a barbarian's Rage adds to damage
 *   evasion, uncanny, danger: a rogue's or monk's Evasion, a rogue's Uncanny Dodge, a barbarian's Danger Sense
 *   aura: a paladin adds their Charisma modifier to every saving throw (from level 6)
 *   archery, defense, dueling, greatWeapon: what the fighting style adds
 */
export function passives(classId = "", level = 1, style = "") {
  const kit = SRD_CLASSES[classId];
  const has = (id) => style === id && stylesFor(classId, level).includes(id);
  return {
    saves: kit?.saves ?? [],
    unarmored: kit?.unarmored ?? "",
    critFrom: classId === "fighter" && level >= 3 ? (level >= 15 ? 18 : 19) : 20,
    sneak: classId === "rogue" ? `${Math.ceil(level / 2)}d6` : "",
    martial:
      classId === "monk"
        ? step(level, [
            [1, "1d4"],
            [5, "1d6"],
            [11, "1d8"],
            [17, "1d10"],
          ])
        : "",
    rage:
      classId === "barbarian"
        ? step(level, [
            [1, 2],
            [9, 3],
            [16, 4],
          ])
        : 0,
    evasion: (classId === "rogue" || classId === "monk") && level >= 7,
    uncanny: classId === "rogue" && level >= 5,
    danger: classId === "barbarian" && level >= 2,
    aura: classId === "paladin" && level >= 6,
    archery: has("archery") ? 2 : 0,
    defense: has("defense") ? 1 : 0,
    dueling: has("dueling") ? 2 : 0,
    greatWeapon: has("great-weapon-fighting"),
  };
}

/**
 * What a class can use so many times between rests, at `level`: [{ id, name, about, cost ("action" | "bonus"
 * | "free": what it takes of a turn in a fight by turns), pool (what's counted: several may share one, as a
 * monk's Ki), max (how many, or how much, between rests), per ("short" | "long": the rest that gives it
 * back), spend (how much of the pool one use takes; 0: it's asked how much, as Lay on Hands) }].
 * `mods`: { charisma, wisdom } modifiers, for the ones that go by them.
 */
export function abilities(classId = "", level = 1, mods = {}) {
  const list = [];
  const add = (entry) => list.push({ cost: "bonus", per: "short", spend: 1, pool: entry.id, ...entry });
  if (classId === "fighter") {
    add({ id: "wind", name: "Second Wind", about: "Regain 1d10 + your level HP.", max: 1 });
    if (level >= 2)
      add({
        id: "surge",
        name: "Action Surge",
        about:
          "Turn-based combat: one more action this turn. Real time: your swings come twice as fast for six seconds.",
        cost: "free",
        max: level >= 17 ? 2 : 1,
      });
  }
  if (classId === "barbarian") {
    add({
      id: "rage",
      name: "Rage",
      about: `For a minute: +${passives(classId, level).rage} damage with what you swing, and half damage from weapons, teeth and claws.`,
      max: step(level, [
        [1, 2],
        [3, 3],
        [6, 4],
        [12, 5],
        [17, 6],
      ]),
      per: "long",
    });
    if (level >= 2)
      add({
        id: "reckless",
        name: "Reckless Attack",
        about: "Until your next turn (six seconds): your attacks have advantage, and so do attacks on you.",
        cost: "free",
        max: 0,
      });
  }
  if (classId === "rogue" && level >= 2) {
    add({ id: "bdash", name: "Dash (bonus)", about: "Cunning Action: Dash as a bonus action.", max: 0, turns: true });
    add({
      id: "bdisengage",
      name: "Disengage (bonus)",
      about: "Cunning Action: Disengage as a bonus action.",
      max: 0,
      turns: true,
    });
  }
  if (classId === "monk" && level >= 2) {
    const ki = { pool: "ki", max: level };
    add({ id: "flurry", name: "Flurry of Blows", about: "1 ki: two unarmed strikes at once.", ...ki });
    add({
      id: "patient",
      name: "Patient Defense",
      about: "1 ki: Dodge as a bonus action (attacks on you are rolled twice, the worse counting).",
      ...ki,
    });
    if (level >= 5)
      add({
        id: "stun",
        name: "Stunning Strike",
        about: "1 ki: your next blow that lands stuns what it hits unless it makes a Constitution save.",
        cost: "free",
        ...ki,
      });
  }
  if (classId === "paladin") {
    add({
      id: "lay",
      name: "Lay on Hands",
      about: "Heal yourself from a pool of five HP for each of your levels.",
      cost: "action",
      max: level * 5,
      per: "long",
      spend: 0,
    });
    if (level >= 2)
      add({
        id: "smite",
        name: "Divine Smite",
        about:
          "Your next blow that lands spends a spell slot (or its level in mana) for 2d8 radiant damage more, 1d8 more for each level of slot above the first, and 1d8 more against the undead and fiends.",
        cost: "free",
        max: 0,
      });
  }
  if (classId === "bard")
    add({
      id: "inspire",
      name: "Bardic Inspiration",
      about: `Your next attack roll adds a d${step(level, [
        [1, 6],
        [5, 8],
        [10, 10],
        [15, 12],
      ])}.`,
      max: Math.max(1, mods.charisma ?? 1),
      per: level >= 5 ? "short" : "long",
    });
  if (classId === "cleric" && level >= 2)
    add({
      id: "turn",
      name: "Turn Undead",
      about: "Every undead thing within nine metres makes a Wisdom save or flees from you.",
      cost: "action",
      max: step(level, [
        [2, 1],
        [6, 2],
        [18, 3],
      ]),
    });
  if (classId === "druid" && level >= 2) {
    add({
      id: "wild",
      name: "Wild Shape",
      about:
        "Take a beast's shape (which one is in Inventory → Sheet): its HP, AC and bite stand in for yours, and you can't cast, until its HP run out or you change back.",
      cost: "action",
      max: 2,
    });
    add({ id: "unwild", name: "Own shape", about: "Back to your own shape.", max: 0 });
  }
  if (classId === "sorcerer" && level >= 2)
    add({
      id: "font",
      name: "Font of Magic",
      about: "2 sorcery points: a first-level spell slot back (or 1 mana).",
      pool: "sorcery",
      max: level,
      per: "long",
      spend: 2,
    });
  return list;
}

/** A character's hit dice: as many as their level, of their class's die (a d8 with no class). */
export const hitDiceOf = (classId, level) => ({
  die: SRD_CLASSES[classId]?.hitDie ?? 8,
  max: Math.max(1, Math.round(level) || 1),
});

/**
 * What a rest gives back. `used`: { [pool]: how much is spent, hitDice: how many are spent }. A short rest
 * restores what comes back on a short rest (and a warlock's spell slots: `pact`); a long rest restores
 * everything, and half the hit dice (one at least). Gives the `used` that's left.
 */
export function rested(used, kind, classId = "", level = 1) {
  const next = { ...used };
  const list = abilities(classId, level, { charisma: 5 });
  for (const ability of list) if (kind === "long" || ability.per === "short") delete next[ability.pool];
  if (kind === "long") {
    for (const slot of [1, 2, 3, 4, 5, 6, 7, 8, 9]) delete next[slot];
    delete next.recovery;
    const back = Math.max(1, Math.floor(hitDiceOf(classId, level).max / 2));
    next.hitDice = Math.max(0, (next.hitDice ?? 0) - back);
    if (!next.hitDice) delete next.hitDice;
  } else if (classId === "warlock") for (const slot of [1, 2, 3, 4, 5]) delete next[slot];
  return next;
}
