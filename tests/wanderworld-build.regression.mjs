// A character's build (build.js): race, class, style, background, skills, what a class has and can call on,
// and what a rest gives back. Run: node tests/wanderworld-build.regression.mjs
import assert from "node:assert/strict";
import {
  abilities,
  checkBuild,
  hitDiceOf,
  passives,
  raceBonuses,
  rested,
  skillChoices,
  skillsOf,
  stylesFor,
} from "../packages/wanderworld/src/build.js";
import { armourOf, gearWorn, playerStrike, turnBudget, witOf } from "../packages/wanderworld/src/combat.js";
import { attackRoll, changeSheet, checkSheet } from "../packages/wanderworld/src/sheet.js";
import { SRD_RACES, SRD_SKILLS } from "../packages/wanderworld/src/srd.js";

// Races: what they add, how far they go, what they see.
assert.deepEqual(raceBonuses("dwarf"), { constitution: 2, wisdom: 1 });
assert.deepEqual(raceBonuses("nobody"), {});
assert.equal(SRD_RACES.dwarf.name, "Hill Dwarf");
assert.equal(SRD_RACES.halfling.name, "Lightfoot Halfling");
assert.deepEqual([SRD_RACES.dwarf.speed, SRD_RACES.human.speed, SRD_RACES.elf.dark], [7.5, 9, true]);
assert.equal(SRD_SKILLS.length, 18);

// A build is checked: only what the SRD has, a style only for a class that gets one, no more skills than allowed.
assert.deepEqual(checkBuild(null), { race: "", style: "", background: "", skills: [] });
const raw = {
  race: "elf",
  style: "defense",
  background: "acolyte",
  skills: ["athletics", "perception", "acrobatics", "arcana"],
};
assert.deepEqual(checkBuild(raw, "fighter"), {
  race: "elf",
  style: "defense",
  background: "acolyte",
  skills: ["athletics", "acrobatics"], // (perception is the elf's anyway; arcana isn't a fighter's; two at most)
});
assert.equal(checkBuild(raw, "wizard").style, "", "a wizard has no fighting style");
assert.deepEqual(skillChoices("fighter", "acolyte", "elf").given, ["insight", "religion", "perception"]);
assert.deepEqual(skillsOf(checkBuild(raw, "fighter"), "fighter").sort(), [
  "acrobatics",
  "athletics",
  "insight",
  "perception",
  "religion",
]);
assert.deepEqual(stylesFor("fighter", 1), ["archery", "defense", "dueling", "great-weapon-fighting"]);
assert.deepEqual(stylesFor("ranger", 1), [], "a ranger's comes at level 2");
assert.ok(stylesFor("ranger", 2).includes("archery"));
assert.deepEqual(stylesFor("wizard", 20), []);

// What a class has always on.
assert.deepEqual(passives("fighter", 1).saves, ["strength", "constitution"]);
assert.deepEqual(
  [passives("fighter", 2).critFrom, passives("fighter", 3).critFrom, passives("fighter", 15).critFrom],
  [20, 19, 18],
);
assert.deepEqual(
  [1, 2, 3, 19].map((level) => passives("rogue", level).sneak),
  ["1d6", "1d6", "2d6", "10d6"],
);
assert.deepEqual(
  [1, 5, 11, 17].map((level) => passives("monk", level).martial),
  ["1d4", "1d6", "1d8", "1d10"],
);
assert.deepEqual(
  [passives("barbarian", 1).rage, passives("barbarian", 9).rage, passives("barbarian", 16).rage],
  [2, 3, 4],
);
assert.deepEqual(
  [passives("monk", 1).unarmored, passives("barbarian", 1).unarmored, passives("fighter", 1).unarmored],
  ["wisdom", "constitution", ""],
);
assert.equal(passives("fighter", 1, "archery").archery, 2);
assert.equal(passives("wizard", 1, "archery").archery, 0, "a style only where the class has it");
assert.equal(passives("", 1).critFrom, 20);

// What a class can call on.
const names = (classId, level) => abilities(classId, level).map((ability) => ability.id);
assert.deepEqual(names("fighter", 1), ["wind"]);
assert.deepEqual(names("fighter", 2), ["wind", "surge"]);
assert.deepEqual(names("monk", 1), []);
assert.deepEqual(names("monk", 5), ["flurry", "patient", "stun"]);
assert.deepEqual(
  abilities("monk", 5).map((ability) => [ability.pool, ability.max]),
  [
    ["ki", 5],
    ["ki", 5],
    ["ki", 5],
  ],
);
assert.equal(abilities("paladin", 4)[0].max, 20, "Lay on Hands: five for each level");
assert.deepEqual(
  [1, 3, 6, 17].map((level) => abilities("barbarian", level)[0].max),
  [2, 3, 4, 6],
);
assert.equal(abilities("bard", 1, { charisma: 3 })[0].max, 3);
assert.equal(abilities("bard", 1, { charisma: -1 })[0].max, 1, "one at least");
assert.deepEqual(names("", 5), []);

// Rests.
assert.deepEqual(hitDiceOf("fighter", 4), { die: 10, max: 4 });
assert.deepEqual(hitDiceOf("", 1), { die: 8, max: 1 });
const used = { wind: 1, surge: 1, hitDice: 3, 1: 2, 2: 1 };
assert.deepEqual(rested(used, "short", "fighter", 4), { hitDice: 3, 1: 2, 2: 1 }, "a short rest: the class's own");
assert.deepEqual(rested(used, "long", "fighter", 4), { hitDice: 1 }, "a long rest: all of it, and half the hit dice");
assert.deepEqual(rested({ rage: 2 }, "short", "barbarian", 1), { rage: 2 }, "Rage comes back with a long rest only");
assert.deepEqual(rested({ 1: 1, 2: 1 }, "short", "warlock", 3), {}, "a warlock's slots come back with a short rest");

// Armour Class without armour: a barbarian adds Constitution, a monk Wisdom (and no shield); Defense adds 1 in armour.
{
  let sheet = checkSheet(null);
  for (const [id, value] of [
    ["dexterity", 14],
    ["constitution", 16],
    ["wisdom", 12],
  ])
    sheet = changeSheet(sheet, { set: id, field: "value", value });
  const on = (name) => ({ name, description: "", location: "equipped:body" });
  assert.equal(armourOf(sheet, gearWorn(sheet, [], { unarmored: "constitution" })), 15);
  assert.equal(armourOf(sheet, gearWorn(sheet, [], { unarmored: "wisdom" })), 13);
  assert.equal(
    armourOf(sheet, gearWorn(sheet, [on("Shield")], { unarmored: "wisdom" })),
    14,
    "a monk with a shield: no Wisdom",
  );
  assert.equal(armourOf(sheet, gearWorn(sheet, [on("Shield")], { unarmored: "constitution" })), 17);
  assert.equal(armourOf(sheet, gearWorn(sheet, [on("Chain mail")], { unarmored: "constitution", defense: 1 })), 17);
  assert.equal(armourOf(sheet, gearWorn(sheet, [], { defense: 1 })), 12, "Defense needs armour on");
  // A race's bonuses count wherever what's worn does.
  const worn = gearWorn(sheet, [], { add: raceBonuses("elf") });
  assert.equal(worn.dexterity, 2);
  assert.equal(armourOf(sheet, worn), 13, "Dexterity 16 now");
  assert.equal(witOf(sheet, { wisdom: 2 }, "wisdom"), 2);
}

// A blow with what the build adds: more to hit, more damage, a wider critical, dice that come with a hit.
{
  const sheet = checkSheet(null);
  const weapon = { name: "Rapier", damage: "1d8", attack: 0, held: "sword", range: 0, type: "piercing", finesse: true };
  const faces = (...list) => {
    let i = 0;
    return () => (list[i++ % list.length][0] - 0.5) / list[i - 1][1];
  };
  // 10 on the die, +2 from the build against AC 12: a hit; 4 on the d8, 3 and 5 on the Sneak Attack's 2d6, +1.
  const hit = playerStrike(
    { sheet, weapon, foe: { ac: 12 }, mods: { attack: 2, damage: 1, more: ["2d6"] } },
    faces([10, 20], [4, 8], [3, 6], [5, 6]),
  );
  assert.deepEqual([hit.hit, hit.total, hit.damage], [true, 12, 13]);
  // A 19 is a critical hit for one whose critical is from 19: every die twice.
  const crit = attackRoll({ ac: 30, damage: "1d8", critFrom: 19 }, faces([19, 20], [4, 8], [6, 8]));
  assert.deepEqual([crit.crit, crit.damage], [true, 10]);
  assert.equal(attackRoll({ ac: 30, damage: "1d8" }, faces([19, 20])).hit, false);
}

// A turn's movement goes by the race's speed.
assert.equal(turnBudget("fighter", 1, {}, 7.5).move, 7.5);
assert.equal(turnBudget("monk", 2, {}, 7.5).move, 10.5);
assert.equal(turnBudget("", 1).move, 9);

// A 5e sheet from a card (the Engine's ruleset sheet), read as what's used here.
{
  const { cardBuild } = await import("../packages/wanderworld/src/build.js");
  assert.equal(cardBuild(null), null);
  assert.equal(cardBuild({ v: 1 }), null);
  const mage = cardBuild({
    v: 3,
    build: {
      abilities: { str: 9, dex: 14, con: 11, int: 17, wis: 12, cha: 11 },
      skills: { arcana: "proficient", history: "expertise", stealth: "none", nonsense: "proficient" },
      fields: { level_wizard: 9, class: "Wizard", race: "Elf", subrace: "High Elf", background: "Acolyte", hp_max: 40 },
      lists: {
        spells: [{ name: "Fire Bolt" }, { name: "Mage Hand" }, { name: "Fire Bolt" }, { name: "" }],
        features: [{ name: "Fighting Style: Archery" }],
      },
    },
  });
  assert.deepEqual(mage, {
    classId: "wizard",
    level: 9,
    race: "elf",
    background: "acolyte",
    style: "archery",
    abilities: { strength: 9, dexterity: 14, constitution: 11, intelligence: 17, wisdom: 12, charisma: 11 },
    skills: ["arcana", "history"],
    spells: ["Fire Bolt", "Mage Hand"],
    hpMax: 40,
  });
  // Two classes: the higher is theirs, and the level is both together. A bare build reads too.
  const both = cardBuild({ fields: { level_fighter: 2, level_rogue: 5, race: "Half-Orc" }, abilities: {} });
  assert.deepEqual([both.classId, both.level, both.race], ["rogue", 7, "half-orc"]);
  assert.deepEqual(
    [cardBuild({ fields: { class: "Fighter" } }).classId, cardBuild({ fields: { class: "Artificer" } }).classId],
    ["fighter", ""],
  );
  // Skills from a card are kept beside the class's own picks.
  const kept = checkBuild({ skills: ["athletics"], extra: ["arcana", "nonsense"] }, "fighter");
  assert.deepEqual(kept.extra, ["arcana"]);
  assert.deepEqual(skillsOf(kept, "fighter").sort(), ["arcana", "athletics"]);
}

// The SRD's one feat.
{
  const { SRD_FEATS } = await import("../packages/wanderworld/src/build.js");
  assert.deepEqual(Object.keys(SRD_FEATS), ["grappler"]);
  assert.deepEqual(checkBuild({ feats: ["grappler", "lucky"] }, "fighter").feats, ["grappler"]);
  assert.equal(checkBuild({ feats: ["lucky"] }, "fighter").feats, undefined);
}

// Wild Shape: which beasts, by level; and Great Weapon Fighting's reroll.
{
  const { wildForms } = await import("../packages/wanderworld/src/build.js");
  assert.deepEqual(wildForms(1), []);
  assert.ok(wildForms(2).includes("wolf") && !wildForms(2).includes("bat"), "a wolf at 2; nothing that flies");
  assert.ok(!wildForms(2).includes("skeleton") && !wildForms(2).includes("dragon"), "beasts only");
  assert.ok(wildForms(8).includes("bat"));
  assert.deepEqual(names("druid", 1), []);
  assert.deepEqual(names("druid", 2), ["wild", "unwild"]);
  assert.equal(checkBuild({ form: "wolf" }, "druid").form, "wolf");
  assert.equal(checkBuild({ form: "dragon" }, "druid").form, undefined);
  // A 1 and a 2 on 2d6 are each rolled again (to a 5 and a 6); a 3 stands.
  const faces = (...list) => {
    let i = 0;
    return () => (list[i++ % list.length][0] - 0.5) / list[i - 1][1];
  };
  const again = attackRoll({ ac: 5, damage: "2d6", reroll: 2 }, faces([15, 20], [1, 6], [2, 6], [5, 6], [6, 6]));
  assert.equal(again.damage, 11);
  const stands = attackRoll({ ac: 5, damage: "2d6", reroll: 2 }, faces([15, 20], [3, 6], [4, 6]));
  assert.equal(stands.damage, 7);
  assert.equal(attackRoll({ ac: 5, damage: "2d6" }, faces([15, 20], [1, 6], [2, 6])).damage, 3, "no style: as rolled");
}

console.log("ok: the build");
