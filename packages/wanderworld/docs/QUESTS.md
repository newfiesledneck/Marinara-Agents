# Wanderworld quest plan

Status: a plan, written 2026-11-20; none of it is built. It covers quests, deep places and regions
with a purpose. It collects what was agreed in conversation on
2026-11-19 and 2026-11-20, and follows the design principles in [CONCEPT.md](CONCEPT.md): it works with
or without AI, every part can be switched off and is explained where it's switched, lore comes first,
changes come gradually, and anything set by hand can be locked.

What we want:

- Quests the AI can write, and built-in ones that need no AI.
- A quest can always be started, each stage always moves on, and every quest ends: done, failed or
  given up, never stuck.
- Enough variety that two quests in a row don't read the same.
- Quests that change when a stage fails or someone dies who shouldn't have.
- Places to go into for them: small caves, large caverns, dungeons and strongholds, which can lead
  deeper into each other.
- Regions with a purpose: a faction's land, a bandit stronghold, a cluster of hamlets.

---

## Existing systems quests build on

| Piece                      | Where                                                                                     |
| -------------------------- | ----------------------------------------------------------------------------------------- |
| Errands (one person, done) | `pack.js errandFor`, `main.js boardErrand`, `save.errand`, `save.errandsDone`             |
| A waypoint on the map      | `save.waypoint` (`{ region, x, z }`)                                                      |
| The noticeboard            | `save.notices`; the assistant can pin and take down notes                                 |
| Scenes and their recaps    | `startScene`, `pullRecaps` into `save.events`; whoever was in a scene remembers it        |
| Regions and travel         | `save.regions`, `travel(side)` at the map's edge, hamlets out in the country              |
| Factions and relationships | lore keywords: `ww:faction:`, `ww:enemy of:`, `ww:rival of:` and the rest (`keywords.js`) |
| People from lore           | `spawnsFromLore`; the party follows through `crowd.setFollowing`                          |
| Fights                     | SRD creatures with CR, loot and tactics; real-time or turn-based                          |
| Caves                      | outside only: rock and a dark mouth set into a hillside (`caves.js`)                      |
| Building interiors         | one furnished room per door (`interiors.js`), behind the `interiors` setting              |
| Changes the AI proposes    | the assistant's propose, confirm and undo                                                 |
| The inventory              | Wanderworld's own, or Quartermaster's sheet when it's installed                           |

Indoors there are no creatures and no fights yet: about 35 places in `main.js` check `core.interior` and
give nothing. Deep places need those opened up first (phase 4).

---

## 1. The rule: every quest can be finished

A quest the player can see must be finishable, or must end by itself with a line saying why. To keep
that true:

- **A quest is data the code checks, not prose the model judges.** Each stage has a goal of a fixed kind
  (the goal verbs in section 2), naming things by id: a person, a place, a region, an item, a kind of
  creature and how many. The model writes the words and picks from what exists. This is the same rule
  as the rest of the game: the model decides what exists, the code decides where it goes and when it's
  done.
- **Every id is checked before a quest is offered.** A person, place or item the world doesn't have is
  either swapped for a close match the code can find (the nearest smithy for "the forge"), or the quest
  is turned down and written again (or a built-in one is used).
- **A quest owns what it adds.** A named foe, a captive, a lost ring or a camp that the world doesn't
  already have is made by the quest and kept in it. The code puts it in the world when the player is in
  its region, and the clean-up that removes far-off creatures and passers-by skips it while a stage
  needs it.
- **Stages are checked when something happens and when a world loads.** Something happening means a
  conversation, an item gained or lost, a kill, an arrival somewhere, or the end of a scene. On load,
  and on every change of region, each open stage is checked again: is what it needs still there, and can
  the player reach it? If not, the code repairs it (puts a quest-owned thing back, or moves it somewhere
  reachable). When that can't work, for example when a character the quest needs was deleted in the
  Engine, the quest changes (section 4) or ends, and the Journal says why.
- **No stage without a way out.** Each stage says what finishes it and what fails it. Time limits are
  optional and off unless the quest asks for one.
- The Debug menu gets "Finish this stage", "Fail this stage" and "Show this quest's state", next to the
  failsafe respawn.
- A regression suite plays every built-in quest to its end in a pretend world, through each
  failure branch too, and feeds in AI-shaped quests with bad ids to check they are repaired or turned down.

---

## 2. Quest data and goal verbs

A sketch of the saved shape (`save.quests`):

```js
{
  id: "quest-…",
  title: "The miller's missing son",
  source: "board" | "person" | "lore" | "ai" | "chain",
  giver: "<person id>" | null,
  region: "<region key>",
  parts: { archetype, motive, complication, place, reward }, // what it was made from (section 3)
  reward: { coin: 40, items: ["…"], standing: { faction: "Millers' Guild", by: 10 } },
  stages: [
    {
      id: "s1",
      text: "Ask at the mill who saw him last.",
      goal: { verb: "talk", person: "<id>" },
      mode: "play" | "scene" | "either",
      next: "s2",
      fails: [{ when: { dies: "<id>" }, then: "s1b" }],
    },
    // …
  ],
  at: "s1",
  state: "offered" | "active" | "done" | "failed" | "given up",
  owned: [/* what the quest put in the world */],
  log: [/* what happened, in words, for the Journal */],
}
```

**Goal verbs.** Every stage is one of these, so the code always knows what finishes it:

| Verb            | Finished when                                                       |
| --------------- | ------------------------------------------------------------------- |
| go to           | the player reaches a place, a region or a spot                      |
| talk to         | the player talks with a person (in a conversation or a scene)       |
| bring           | an item is given to a person                                        |
| gather or craft | the player has so many of an item                                   |
| defeat near     | so many of a kind of creature are beaten near a place               |
| defeat a named  | a quest-owned foe is beaten (or, by choice, spared)                 |
| escort          | a person reaches a place alive and with the player                  |
| rescue          | a captive is freed, then escorted                                   |
| find            | a clue is learned from the right person, or a spot is searched      |
| choose          | the player picks one of two or more endings, each with its own next |
| come back later | a set time has passed (optional; "come back tomorrow")              |

---

## 3. Variety

A quest is put together from parts, and the game remembers the parts of the last several quests so it
doesn't repeat them: **archetype × motive × complication × place × reward.** Lore and relationships feed
the motives: someone's rival, a faction's enemy, a sister who went missing.

**Six archetypes:**

1. **Bounties and hunts**, mostly from the noticeboard: beat creatures near a place, or a named foe.
2. **Faction work**: deliver, defend, sabotage or pick a side, which changes the player's standing.
3. **Investigation.** Find out who or what. Clues are put into what particular townsfolk know, so
   asking the right person, in a conversation or a scene, turns them up. It ends with a choose stage:
   the player names the answer.
4. **Supply and trade.** Gather, craft or bring: a shortage at the smithy, a cure the apothecary needs.
5. **Escort and rescue.** A captive held in a camp, a cave or a stronghold; someone to see safely home.
6. **Chains.** One quest's ending starts the next: a spared bandit comes back, a faction remembers what
   you did, a rescued captive has a favour to ask.

**Complications** the parts can add: the giver lied; a rival party wants the same thing; the target is
someone's kin; the weather or the hour matters; the item is a fake; the foe begs to be spared.

---

## 4. Failure branches

A stage can fail, and some failures shouldn't end the quest. They give it a new turn instead:

- A stage fails when someone the quest needs dies (the person being escorted, the captive, the giver, a
  witness); a time limit runs out; the player makes a choice; a quest item is lost or sold.
- **Built-in quests carry their own branches.** The escorted person dies: a new stage to bring word to
  their family. The giver dies: the reward comes from their kin, or not at all. The witness dies: a
  second clue turns up somewhere else.
- **With AI, an unplanned failure gets one call to adapt.** When something happens that the quest has no
  branch for, the model is given the quest, what happened and what exists, and returns either a new
  stage (checked like any other) or a line ending the quest. Without AI, or if the call fails, the quest
  ends as failed, and the Journal keeps it with what happened.
- Whether people a quest needs can die at all is a setting (section 14), since fights can reach allies.

---

## 5. Scene review

After a scene's recap comes back, an optional review (one AI call) can decide how the scene went for
the quest:

- It runs only when the scene was a quest stage and the setting is on. One call gets the stage's goal,
  the outcomes the stage allows (done, partly done, failed, and each branch, by id) and the recap. It
  picks one outcome and writes a line for the Journal, and the code applies it.
- **It picks from fixed outcomes.** It can't make up a stage; that's the adapt call's job (section 4).
- With review off, a scene that ends counts as the stage done; a scene that's dropped changes nothing,
  and the stage stays open.
- The player sees what it decided and can change it: Journal → Quests → the stage → "That's not how it
  went" picks another outcome. This works like the assistant's undo.

---

## 6. Scenes as a way to play a stage

A stage can be played in the 3D world (`mode: "play"`), as an Engine scene (`"scene"`), or either way.
A scene stage starts a scene with the stage's words as its prompt, and the people and place it names.
The recap comes back as it does now (`pullRecaps`), and the stage moves on by the review (section 5) or,
with review off, by the scene ending.

---

## 7. Quests from lore

A lorebook entry with `ww:quest:<title>` is a quest, and its text is the premise. It can also have
`ww:quest giver:<name>`, `ww:quest place:<place>`, `ww:quest reward:<words>`. With AI, the model turns
it into stages. Without AI, it becomes a short quest from the keys: talk to the giver, then go to the
place. The keys go in Help's lorebook keyword list with the others.

---

## 8. Deep places

A setting of its own, separate from house interiors: **"Caves, dungeons and strongholds"**. It needs
creatures and fights indoors first.

**Kinds**, each generated from the world's seed, so the same entrance always leads to the same place:

- **Small cave.** A few winding passages and one or two chambers: a wolves' den, a spider nest, a
  smugglers' hideout. Narrow, but never narrower than the player, a companion and the camera need.
- **Large cavern.** One big open space with height: rock pillars, an underground pool or stream, rubble,
  and sometimes structures standing in it, such as a ruined tower, a camp, a shrine, or a few houses of a
  lost village built from the same kit as the town.
- **Dungeon.** Rooms and corridors from the Modular Dungeon packs (walls, floors, doors, stairs,
  torches): a crypt, a ruin, a sealed vault. Traps, locks and keys come later.
- **Stronghold.** A bandit or faction keep: a hall, barracks, store rooms, cells for captives, the
  leader's room.

**Connected depths.** A place can have a way further down, to another place of a different kind:

- a small cave narrows, then opens into a cavern or breaks into a dungeon;
- a stronghold's cellars lead down into a cave below it;
- a dungeon's far wall has given way into natural rock.

Each level is generated the first time it's entered, as rooms are now, and only one is loaded at a time.

**How they're built:**

- A seeded layout first: chambers or rooms, and the passages between them.
- Then the shapes. Caves and caverns are carved from the same noisy rock as `caves.js`; dungeons and
  strongholds are laid on a grid of kit pieces; a cavern's structures are placed on its floor the way
  buildings are placed in town.
- Colliders come from the layout, and the roof is hidden over the player the way room walls are now, so
  the camera can always see in.
- It's dark: the player's light (a torch, a light spell) and glowing crystals (iPoly3D's CC0 crystals,
  already in the kit).
- What lives there depends on the kind of place and the party's level: undead in crypts, oozes and
  spiders in caves, bandits in strongholds. Only SRD creatures with models.
- A phone budget: one level at a time, merged geometry, the same draw-distance settings.

Quests use them: a stage's target can be "in the cave above the mill, two levels down", and the quest
owns what it puts there.

---

## 9. Regions with a purpose

Travel at the map's edge already makes new regions of countryside and hamlets. Next, a region can be
made for a purpose:

- a faction's land: their town, their banners, their people;
- a bandit stronghold, or a few outposts;
- a smaller town, or several hamlets;
- a ruin over a dungeon, or a hillside of caves.

Purposes come from lore (a faction or place entry) or from a quest (a quest needs a stronghold, so the
next region that way gets one, and keeps it). The map can show each faction's regions in its colour, as
far as the player knows them.

---

## 10. Factions

- **Standing** with each faction, from −100 to 100, shown in words: Hated, Hostile, Wary, Neutral, Liked,
  Trusted, Honoured. Quests, fights and choices change it, and it can be set and locked by hand.
- Standing changes prices, who will talk to the player, whether a faction's guards fight on sight,
  which quests they offer, and whether their land is safe to cross.
- `ww:faction:` already exists in lore. Enmity between factions would be `ww:enemy of:<faction>`.

---

## 11. Pacing and cost

- **Written in the background.** One AI call writes a quest when one is wanted (the board has no work,
  or someone is asked "any work?"), without making the player wait. Built-in quests fill in when AI is
  off or slow.
- Each quest costs one call to write it (all its stages at once), and at most one more for each unplanned
  failure (adapt) and each scene reviewed. Each of those can be switched off, and each shows in "What
  the AI is told".
- **Difficulty** comes from the party's level, through the SRD's challenge ratings.

---

## 12. Quest items and Quartermaster

- Quest items are marked so they can't be sold or dropped by accident until the quest is over.
- With Quartermaster as the inventory, that needs a flag Quartermaster respects. That's a request for
  the Quartermaster session. Until then, Wanderworld marks them in its own lists and warns before a sale.
- Rewards go into the inventory the same way bought and looted things do.

---

## 13. What the player sees

- Journal → Quests lists open, done and failed quests. Each shows its stages (finished ones ticked, the
  current one, later ones hidden until reached) and what happened, with an (i) for the details.
- **A line on screen** for the tracked quest's current stage, and its waypoint on the map.
- **The noticeboard** posts bounties and other work. **Asking someone "any work?"** in a conversation
  can offer their quest.
- **A quest card** when one is offered: who's asking, what they want, the reward, and Accept or Decline.
- Phones first: all of it works by tapping, and hover only adds tooltips.

---

## 14. Settings (a sketch)

Each one explained where it's set, as every setting is.

**Quests**

- Quests: on or off.
- Who writes them: built-in only, or the AI when it can.
- How many can be open at once.
- Review scenes for quests (one AI call per scene): off to begin with.
- Change a quest when something goes wrong (one AI call): on when AI is on.
- People a quest needs can die: on or off.
- Time limits: on or off.

**Places**

- Caves, dungeons and strongholds: on or off (separate from house interiors).
- How many levels deep they go.

---

## 15. Build order

1. **The structure:** quests in the save, Journal → Quests, the on-screen line, and built-in quests made
   from goal verbs that work with what already exists (talk to, go to, bring, gather, defeat near), with
   the checks from section 1, the Debug buttons and the simulation tests. Errands become one-stage quests.
2. **AI-written quests:** one call per quest, checked before it's offered, plus quests from lore
   (`ww:quest`), the memory of recent parts, and "any work?" in conversation.
3. **Branching stages:** failure branches and the adapt call, clues placed in what townsfolk know,
   choices, scenes as stages, and scene review.
4. **Deep places:** creatures and fights indoors, then small caves, caverns, dungeons and strongholds
   with connected depths, and quest-owned spawns, captives and escorts.
5. **The wider world:** faction standing, regions with a purpose, faction maps, and quest chains.

---

## 16. Creatures for the deep places

Only creatures with both a 3D model and an SRD stat block (`packages/ruleset-5e-2014`), or stats the user
writes. What's in the kit now: wolf, slime, skeleton, spider, rat, snake, bat, wasp, frog, dragon, imp,
puglin, and bandits, witches and wizards as people.

**Built in code (0.7.27):** the goblin, ogre, troll and minotaur are made by `src/bestiary.js` from
simple shapes bound to the built-in person's skeleton, so they walk, run and strike with the people's
clips and need no kit files. More two-legged SRD creatures can be built the same way: hobgoblin, bugbear,
gnoll, kobold, lizardfolk, ghoul, orc. Each is a recipe of proportions, a head and what it wears, checked
in a viewer and revised until it looks right.

**Already downloaded, not yet used** (`_planning/Wanderworld asset packs/Quaternius Assets`):

| Model                      | Pack (licence)                                              | SRD stat block                 |
| -------------------------- | ----------------------------------------------------------- | ------------------------------ |
| Zombie                     | Zombie by Quaternius (CC0, no licence file in the zip)      | Zombie                         |
| Orc (male, female)         | Characters - Fantasy Races Kit (QAL)                        | Orc                            |
| Tyrannosaurus, Triceratops | Dinosaur Animated Pack (CC0)                                | Tyrannosaurus Rex, Triceratops |
| Knight                     | Knight Character Animated (CC0, no licence file in the zip) | Knight                         |

The Bestiary kit's free tier has only the imp and the puglin, which are in. The zombie and knight zips
have no licence file; Quaternius released them as CC0, but check that before they ship.

**Downloaded 2026-11-20:** Quaternius's **Ultimate Monsters** pack, CC0 by its licence file: 50
animated monsters in glTF (16 big, 17 blobs, 17 flying), each with Idle, Walk, Run, Punch, Weapon,
HitReact, Death and a few more. Most are cartoon-cute, with big eyes, round shapes and bright colours,
so few suit Wanderworld as they are. Possible SRD fits:

- Ghost → Ghost, Specter or Wraith
- the blobs → Gray Ooze, Ochre Jelly or Black Pudding (recoloured)
- Demon, Blue Demon → a fiend (which one depends on the model)
- Orc → Orc (the Fantasy Races orc may suit people better)
- Yeti → no SRD stat block; it would need the user's own

---

## Open questions

- How long a quest should usually be: two or three stages, or up to six?
- Failure and time limits: on by default, or only when a quest asks?
- Can people a quest needs die by default?
- Is `ww:quest` the right shape for lore quests, or should a quest be a whole lorebook entry of its own?
- Should there be fast travel between regions a quest sends the player to?
- Creatures with models but no SRD stat block (the Yeti): leave them out, or let the user write stats?
