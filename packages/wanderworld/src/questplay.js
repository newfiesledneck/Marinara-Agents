// Quests in play: the glue between quests.js (plain data and rules) and the running game. It gathers the
// facts of the world as it is now, hands what happens to every open quest, offers new ones (the
// noticeboard, "Any work going?" in a conversation, the lore's ww:quest entries, the AI when it's on),
// gives rewards, puts in what quests own (creatures for a hunt, a captive in a cave), keeps the waypoint
// on the tracked quest and the line on screen. main.js makes one with `createQuestPlay(core, api)` and
// calls it from a handful of places, each marked "Quests".
//
// `api` (main.js): names() (zone id → name here), narrate(who, text), personaName(), level(),
// fighting(), animalAllowed(kind), regionName(key), addItem(item), readItems(), money() (the
// currency's name), changeStanding(faction, by, why, options), warmer(id, by), remember(ids, text),
// syncSpawns(), finishErrand(), dropErrand(), factionOf(id) (the first faction id or "").
import { ANIMALS } from "./animals.js";
import { purposeAhead } from "./factions.js";
import { SIDES } from "./land.js";
import { createPerson } from "./people.js";
import {
  accept,
  adaptQuest,
  builtInQuest,
  captivesAt,
  captiveSpot,
  errandQuest,
  errandRecord,
  finishingEvent,
  giveUp,
  loreQuest,
  moveOn,
  needsCave,
  OFFERS,
  questAsk,
  questCheck,
  questEvent,
  questFromWords,
  questLine,
  questSpawns,
  questState,
  questTarget,
  questView,
  rememberParts,
  rewardWords,
  spawnKeep,
  stageOf,
} from "./quests.js";
import { SRD_CREATURES } from "./srd.js";
import { hashString } from "./world.js";
import { HOME_REGION, regionNext } from "./zones.js";

/** What someone with no work says, the same all day. */
const NO_WORK = [
  "Nothing today, sorry. Ask again tomorrow.",
  "Not that I can think of. Try the noticeboard.",
  "Work? Not from me, not this week.",
];
const WRITE_WAIT = 20000; // ms a conversation waits for the AI's quest before the game's own stands in
const GATHERABLE = [
  { name: "Firewood", how: "chop wood at a tree" },
  { name: "Stone", how: "mine at a rock" },
  { name: "Fallen branch", how: "forage in the woods" },
  { name: "Flint", how: "forage or mine" },
  { name: "Plant fibre", how: "forage in the woods" },
];
const SCOUTED = ["stronghold", "outposts", "ruin", "caves"];
const WAYS = ["", "", "two regions", "three regions", "four regions", "five regions", "six regions"];

export function createQuestPlay(core, api) {
  let lastTick = -9;
  let checked = { region: null, at: -99 };
  let mark = ""; // the waypoint quests last set, so one the player sets by hand isn't moved again
  let figures = []; // the captives standing in the deep level loaded now: { id, quest, name, x, z, character }
  let writing = false; // a quest being written for the noticeboard

  const save = () => core.save;
  const write = () => core.saves.write(core.save);
  const on = () => core.settings.quests !== false && !!core.save;
  const hours = () => (core.social?.day ?? 0) * 24 + (core.hour ?? 0);
  const here = () => core.save?.region ?? HOME_REGION;
  const aiOn = () => core.settings.questsAi && !!core.ai.known()?.quests;
  const open = () => (save()?.quests ?? []).filter((quest) => quest.state === "active");
  const openCount = () => open().length + (save()?.errand ? 1 : 0);
  const errand = () => errandQuest(save()?.errand);

  /** A spot for a place: its door, else the middle of its shape. */
  function spotOf(zone) {
    const door = zone.door !== undefined && zone.door !== null ? core.world?.doors?.[zone.door] : null;
    if (door) return { x: door.x, z: door.z };
    const shape = zone.shape;
    if (shape?.circle) return { x: shape.circle.x, z: shape.circle.z };
    if (shape?.box) return { x: (shape.box.minX + shape.box.maxX) / 2, z: (shape.box.minZ + shape.box.maxZ) / 2 };
    return null;
  }

  /** The regions a quest could send you to from here: the next free one each way, with a purpose kept for it. */
  function aheadOf(seed) {
    const { purposes = {}, regions = {} } = save();
    const from = here();
    return SIDES.flatMap((side, i) => {
      const kind = core.settings.regionPurposes ? SCOUTED[(seed + i) % SCOUTED.length] : "";
      const next = kind ? purposeAhead(purposes, regions, from, side, kind, "") : null;
      const key = next?.key ?? regionNext(from, side);
      if (key === HOME_REGION) return [];
      const [fx, fz] = from.split(",").map(Number);
      const [tx, tz] = key.split(",").map(Number);
      const far = Math.max(Math.abs(tx - fx), Math.abs(tz - fz));
      return [
        {
          side,
          key,
          name: api.regionName(key),
          kind: next ? kind : "",
          faction: "",
          way: far > 1 ? `${WAYS[far] ?? `${far} regions`} ${side}` : side,
        },
      ];
    });
  }

  /**
   * The world as it is now, as quests.js takes it (see THE WORLD there). Cheap enough to make once a second.
   * ponytail: the regions ahead are the ones travel.js makes now (main.js travel); when travel gains more
   * (roads, fast travel) only `aheadOf` and `questRegion` need to know.
   */
  function facts() {
    const s = save();
    const names = api.names();
    const zones = core.zones?.zones ?? [];
    const snapshot = core.crowd?.snapshot() ?? [];
    const spotted = (zone) => {
      const spot = spotOf(zone);
      return spot && names[zone.id]
        ? { id: zone.id, name: names[zone.id], kind: zone.buildingKind ?? zone.outpostKind ?? zone.kind, ...spot }
        : null;
    };
    const places = zones
      .filter(
        (zone) =>
          ["building", "plaza", "fountain", "garden", "outpost"].includes(zone.kind) || zone.id.startsWith("town:"),
      )
      .filter((zone) => zone.buildingKind !== "home")
      .map(spotted)
      .filter(Boolean);
    const wilds = zones
      .filter(
        (zone) =>
          ["mountains", "meadow"].includes(zone.kind) ||
          (zone.kind === "outpost" && ["ruins", "stones", "graveyard", "watchtower"].includes(zone.outpostKind)),
      )
      .map(spotted)
      .filter(Boolean);
    const people = (core.characters ?? [])
      .filter((person) => core.cast?.has(person.id))
      .map((person) => {
        const house = s.housing?.[person.id];
        const placeId = [house?.work, house?.home].find((id) => id && names[id]);
        const zone = placeId ? core.zones.byId.get(placeId) : null;
        const live = snapshot.find((entry) => entry.id === person.id);
        const spot = live ? { x: live.x, z: live.z } : zone ? spotOf(zone) : null;
        // (Someone with no home or work found yet is wherever they are: the waypoint follows them.)
        if (!spot) return null;
        return {
          id: person.id,
          name: person.name,
          place: placeId ?? "",
          placeName: placeId ? names[placeId] : "",
          ...spot,
          faction: api.factionOf(person.id),
        };
      })
      .filter(Boolean);
    const creatures = Object.keys(ANIMALS)
      .filter((kind) => ANIMALS[kind].hostile && !ANIMALS[kind].rare && api.animalAllowed(kind))
      .map((kind) => ({ kind, name: kind.replace(/_/gu, " "), cr: SRD_CREATURES[kind]?.cr ?? 1 }));
    const caves = (core.world?.caves ?? []).map((cave) => ({
      id: cave.outpost,
      name: names[`cave:${cave.outpost}`] ?? "the cave",
      x: cave.x,
      z: cave.z,
    }));
    return {
      seed: s.seed,
      region: here(),
      regionName: api.regionName(here()),
      now: hours(),
      level: api.level(),
      people,
      cast: [...new Set([...(s.cast ?? []), ...(core.characters ?? []).map((person) => person.id)])],
      places,
      wilds,
      creatures,
      gatherables: GATHERABLE,
      items: !!core.inventory?.ready(),
      caves,
      ahead: aheadOf(hashString(`${s.seed}:${s.questParts?.length ?? 0}:${(s.quests ?? []).length}`)),
      fights: api.fighting(),
      deep: !!core.settings.deepPlaces,
      travel: true,
      failures: core.settings.questFailures !== false,
      timeLimits: !!core.settings.questTimeLimits,
    };
  }

  /** What the player holds, by lowercase name: { name: count }. */
  function held() {
    const have = {};
    for (const item of core.items ?? []) {
      const name = String(item.name ?? "")
        .trim()
        .toLowerCase();
      have[name] = (have[name] ?? 0) + Math.max(1, Math.round(item.quantity ?? 1));
    }
    return have;
  }

  /** Takes `count` of `name` from the inventory (a bring stage done), from as many stacks as it takes. */
  async function takeItems(name, count) {
    let left = count;
    for (const item of core.items ?? []) {
      if (left <= 0) break;
      if (String(item.name).trim().toLowerCase() !== name.toLowerCase()) continue;
      const quantity = Math.max(1, Math.round(item.quantity ?? 1));
      const used = Math.min(quantity, left);
      left -= used;
      await core.inventory.change(item.id, quantity - used > 0 ? { quantity: quantity - used } : null).catch(() => {});
    }
    await api.readItems();
  }

  /**
   * Gives a region a quest's purpose and keeps it (factions.js purposeAhead's rule: a purpose once given
   * is never replaced). Only regions not made yet, and only with Settings → World → Factions → "New
   * regions can have a purpose" on. The one place a quest touches regions: the travel being built in
   * parallel connects here.
   */
  function questRegion(reserve) {
    const s = save();
    if (!reserve?.key || !reserve.kind || !core.settings.regionPurposes) return;
    if (s.purposes?.[reserve.key] || s.regions?.[reserve.key]) return;
    core.save = {
      ...s,
      purposes: { ...s.purposes, [reserve.key]: { kind: reserve.kind, faction: reserve.faction ?? "", from: "quest" } },
    };
    core.factionsChanged = true;
  }

  async function reward(quest) {
    const { coin, items, standing, warmth } = quest.reward ?? {};
    if (core.inventory?.ready()) {
      if (coin > 0) await api.addItem({ name: api.money(), description: "", quantity: coin }).catch(() => {});
      for (const item of items ?? []) await api.addItem(item).catch(() => {});
      await api.readItems();
    }
    if (standing?.faction) api.changeStanding(standing.faction, standing.by, "for the work you did", { whole: true });
    if (quest.giver && warmth) api.warmer(quest.giver, warmth);
    if (quest.giver) api.remember([quest.giver], `${api.personaName()} did what you asked: ${quest.title}.`);
    const got = rewardWords(quest.reward, api.money());
    api.narrate(
      null,
      [quest.done, got && core.inventory?.ready() ? `(${got})` : ""].filter(Boolean).join(" ") ||
        `${quest.title}: done.`,
    );
  }

  /** Puts a quest back in the save after something changed it, and tells what came of it. */
  function settle(before, after, lines = []) {
    if (after === before) return false;
    core.save = { ...save(), quests: save().quests.map((quest) => (quest.id === before.id ? after : quest)) };
    for (const line of lines) api.narrate(null, line);
    if (before.state === "active" && after.state === "done") void reward(after);
    else if (before.state === "active" && after.state !== "active")
      api.narrate(
        null,
        `${after.title}: ${after.state === "given up" ? "given up" : "failed"}. It stays in your Journal.`,
      );
    if (stageOf(before)?.id !== stageOf(after)?.id || after.state !== before.state) {
      mark = "";
      api.syncSpawns();
    }
    return true;
  }

  /** Tells every open quest what happened. */
  function event(happened, world = facts()) {
    if (!on() || !happened) return;
    let changed = false;
    for (const quest of open()) {
      const result = questEvent(quest, happened, world);
      for (const take of result.take) void takeItems(take.item, take.count);
      changed = settle(quest, result.quest, result.lines) || changed;
    }
    if (changed) write();
  }

  /** Every open quest checked again: repaired, or failed (to a branch, or the AI asked for one). */
  function checkAll(world) {
    let changed = false;
    for (const quest of open()) {
      const result = questCheck(quest, world);
      changed = settle(quest, result.quest, result.lines) || changed;
      if (result.adapt && aiOn() && core.settings.questAdapt) void adapt(result.quest, result.lines.join(" "), world);
    }
    if (changed) write();
  }

  /** The adapt call (section 4): a new stage the model writes, checked like any other, or the quest stays failed. */
  async function adapt(quest, happened, world) {
    const ask = questAsk(world);
    try {
      const answer = await core.ai.questAdapt({
        quest: `${quest.title}. ${quest.intro} Stages: ${quest.stages.map((stage) => `${stage.text}${stage.done ? " (done)" : ""}`).join(" ")}`,
        happened,
        lists: ask,
        connectionId: core.settings.textConnection || null,
      });
      const now = save()?.quests.find((entry) => entry.id === quest.id);
      const next = now?.state === "failed" ? adaptQuest(now, answer, facts()) : null;
      if (!next || next.state !== "active") return;
      core.save = { ...save(), quests: save().quests.map((entry) => (entry.id === quest.id ? next : entry)) };
      write();
      api.narrate(null, `${next.title} isn't over: ${stageOf(next).text}`);
      mark = "";
      api.syncSpawns();
    } catch {
      // the quest stays failed, as it would without AI
    }
  }

  /** The quest on screen and on the map: the one chosen in the Journal, else the newest open one, else the errand. */
  function tracked() {
    const list = open();
    return list.find((quest) => quest.id === save()?.questTracked) ?? list.at(-1) ?? errand() ?? null;
  }

  /** The waypoint on the tracked quest's stage: there in this region, or the edge toward another. */
  function waypoint(world) {
    const quest = tracked();
    if (!quest || quest.errand) return;
    const target = questTarget(quest, world);
    if (!target) return;
    const key = `${quest.id}:${quest.at}:${target.region}`;
    if (key === mark) return;
    mark = key;
    let spot = target;
    if (target.away) {
      // Toward the region: the middle of the edge that way.
      const [hx, hz] = here().split(",").map(Number);
      const [tx, tz] = target.region.split(",").map(Number);
      const half = (core.world?.map?.half ?? 150) - 6;
      spot =
        Math.abs(tx - hx) >= Math.abs(tz - hz)
          ? { x: Math.sign(tx - hx) * half, z: 0 }
          : { x: 0, z: Math.sign(tz - hz) * half };
    }
    core.save = { ...save(), waypoint: { region: here(), x: spot.x, z: spot.z } };
    write();
  }

  /** A new quest offered: the card (who's asking, what they want, the reward), Accept or Decline. */
  function offer(quest, onAnswer = () => {}) {
    const steps = quest.stages.filter((stage) => !stage.branch).length;
    core.hud?.offerQuest?.(
      {
        title: quest.title,
        from: quest.giverName ? `${quest.giverName} asks` : "A note on the noticeboard",
        text: quest.intro,
        first: quest.stages[0].text,
        steps,
        // (Coins and things only go into an inventory: without one, it's thanks and good will.)
        reward: (core.inventory?.ready() && rewardWords(quest.reward, api.money())) || "their thanks and good will",
      },
      (yes) => {
        if (yes) take(quest);
        onAnswer(yes);
      },
    );
  }

  /** Takes a quest on: in the Journal, tracked, its region given its purpose, its waypoint set. */
  function take(quest) {
    if (!core.save) return;
    const now = hours();
    const taken = accept(quest, now);
    questRegion(taken.reserve);
    core.save = {
      ...save(),
      quests: [...save().quests.filter((entry) => entry.id !== taken.id), taken],
      questParts: rememberParts(save().questParts, taken.parts),
      questTracked: taken.id,
      questOffered: now,
      questBoard: save().questBoard?.id === taken.id ? null : save().questBoard,
    };
    write();
    mark = "";
    api.narrate(null, `New quest: ${taken.title}. ${taken.stages[0].text} (It's in your Journal → Quests.)`);
    api.syncSpawns();
    waypoint(facts());
  }

  /** Whether a quest with this id or from this lore entry is open or was taken already. */
  const taken = (quest) =>
    (save()?.quests ?? []).some(
      (entry) => entry.id === quest.id || (quest.lore && entry.lore === quest.lore && entry.state !== "given up"),
    );

  /** One AI call for a quest (with what to avoid and the names it may use), checked; null if it can't be used. */
  async function written(world, { giver = null, premise = "", lore = "", source = "ai", wait = 0 } = {}) {
    if (!aiOn()) return null;
    const ask = questAsk(world, { giver, premise, recent: save().questParts ?? [] });
    const call = core.ai.questWrite({
      worldName: save().name,
      setting: save().setting ?? "",
      giver: ask.giver,
      premise: ask.premise,
      avoid: ask.avoid,
      lists: ask,
      connectionId: core.settings.textConnection || null,
    });
    try {
      const answer = await (wait
        ? Promise.race([call, new Promise((_, no) => setTimeout(() => no(new Error("slow")), wait))])
        : call);
      const made = questFromWords(answer?.quest, world, { giver, key: `${Date.now()}`, source, lore });
      if (!made.quest) console.warn("[wanderworld] the AI's quest was turned down:", made.why);
      return made.quest;
    } catch (error) {
      console.warn("[wanderworld] the AI couldn't write a quest; the game's own stands in", error);
      return null;
    }
  }

  /** The lore quest (ww:quest) someone here gives, or one with no giver, not taken yet. */
  function loreFor(world, giverId = null) {
    const person = (world.people ?? []).find((entry) => entry.id === giverId);
    return (save()?.loreQuests ?? []).find((lore) => {
      if ((save().quests ?? []).some((quest) => quest.lore === lore.key)) return false;
      if (!person) return !lore.giver;
      return lore.giver && lore.giver.toLowerCase() === person.name.toLowerCase();
    });
  }

  /** Whether enough time has passed since work was last offered (Settings → Quests → How often). */
  const due = () =>
    hours() - (save()?.questOffered ?? -Infinity) >= (OFFERS[core.settings.questOffers] ?? OFFERS.sometimes).gap;

  /** Posts a quest on the noticeboard: the lore's, the AI's (in the background) or the game's own. */
  async function post(world) {
    if (writing || save().questBoard || openCount() >= core.settings.questMax || !due()) return;
    const lore = loreFor(world);
    const key = `board:${(save().quests ?? []).length}:${Math.floor(hours() / 24)}`;
    let quest = null;
    if (aiOn()) {
      writing = true;
      const id = save().id;
      quest = await written(world, {
        premise: lore?.premise ?? "",
        lore: lore?.key ?? "",
        source: lore ? "lore" : "board",
      });
      writing = false;
      if (save()?.id !== id) return;
      if (quest) {
        quest = { ...quest, source: "board" };
        core.hud?.setNotice("A new note has gone up on the noticeboard.");
      }
    }
    if (!quest && lore) quest = loreQuest(lore, world);
    if (!quest && core.settings.questsBuiltIn) quest = builtInQuest(key, world, { recent: save().questParts ?? [] });
    if (quest && !taken(quest)) {
      core.save = { ...save(), questBoard: quest };
      write();
    }
  }

  return {
    facts,
    held,
    /** Called with the zone check: arrivals, what's held, the checks on load and on a change of region. */
    tick(zone) {
      if (!on()) core.hud?.setQuestLine?.("");
      if (!on() || !core.zones || core.clock - lastTick < 1) return;
      lastTick = core.clock;
      const world = facts();
      if (world.region !== checked.region || core.clock - checked.at > 10) {
        checked = { region: world.region, at: core.clock };
        checkAll(world);
      }
      const at = core.interior ? null : core.player.position;
      if (at) event({ type: "at", region: world.region, zone: zone?.id ?? "", x: at.x, z: at.z }, world);
      if (core.items?.length) event({ type: "have", have: held() }, world);
      waypoint(world);
      const quest = tracked();
      core.hud?.setQuestLine?.(core.settings.questLine !== false && quest ? questLine(quest) : "");
    },
    event,
    /** Talking to someone: a talk or bring stage with them done. */
    talked(id) {
      event({ type: "talk", person: id, have: held() });
    },
    /** A creature beaten (main.js foeBeaten). */
    beaten(foe) {
      event({ type: "beat", kind: foe.kind, id: foe.id, region: here(), x: foe.x, z: foe.z });
    },
    /** What quests own in this region (herd.js setSpawns, beside the lore's), and their ids for respawn's keep. */
    spawns: () => (on() ? questSpawns(save().quests, here()).filter((spawn) => api.animalAllowed(spawn.kind)) : []),
    keep() {
      return spawnKeep(this.spawns());
    },
    /** Whether a quest needs this cave to lead down (it always does, then). */
    wantsCave: (cave) => on() && needsCave(save().quests, here(), cave.outpost),
    /**
     * Into a deep level (main.js enterDeep), or out of one (no level): a deep stage done, and the quests'
     * captives put where they're held, sitting, to be freed.
     */
    enterDeep(level = null, plan = null, cave = null, depth = 0) {
      for (const figure of figures) {
        figure.character?.object.removeFromParent();
        figure.character?.dispose?.();
      }
      figures = [];
      if (!level || !on()) return;
      event({ type: "deep", region: here(), cave: cave.outpost, depth });
      for (const captive of captivesAt(save().quests, here(), cave.outpost, depth)) {
        const spot = captiveSpot(plan);
        const figure = { ...captive, ...spot, character: null };
        figures.push(figure);
        void createPerson(captive.name)
          .then((character) => {
            if (!figures.includes(figure) || core.interior?.room !== level) return character.dispose?.();
            figure.character = character;
            character.object.position.set(spot.x, 0, spot.z);
            level.scene.add(character.object);
            for (let n = 0; n < 8; n++) character.update(0.12, 0, { sit: true });
          })
          .catch(() => {}); // no kit: the captive is there all the same, to be freed
      }
    },
    /** What can be done here for a quest (main.js usable): free a captive. */
    usable() {
      return figures.map((figure) => ({
        kind: "person",
        label: `Free ${figure.name}`,
        x: figure.x,
        z: figure.z,
        y: 1.6,
        reach: 2.6,
        act: () => {
          figures = figures.filter((entry) => entry !== figure);
          figure.character?.object.removeFromParent();
          api.narrate(null, `You cut ${figure.name} loose. "Thank you. Get me out of here, and home."`);
          event({ type: "free", captive: figure.id });
        },
      }));
    },
    /** The conversation's choice for asking after work, while quests are on. */
    choices: () => (on() ? [{ id: "work", label: "Any work going?" }] : []),
    /** "Any work going?": the lore's quest for them, else the AI's or the game's own, by how often work is offered. */
    async askWork(talking) {
      if (!on()) return NO_WORK[0];
      if (openCount() >= core.settings.questMax) return "You've enough on your plate already, by the look of you.";
      const world = facts();
      const giver = (world.people ?? []).find((person) => person.id === talking.id);
      if (!giver) return "I've nothing for you here. Find me where I live or work.";
      const lore = loreFor(world, giver.id);
      let quest;
      if (lore)
        quest =
          (await written(world, {
            giver: giver.id,
            premise: lore.premise,
            lore: lore.key,
            source: "lore",
            wait: WRITE_WAIT,
          })) ?? loreQuest(lore, world);
      else {
        const roll = (hashString(`${save().seed}:${giver.id}:${Math.floor(hours() / 24)}`) % 1000) / 1000;
        if (roll >= (OFFERS[core.settings.questOffers] ?? OFFERS.sometimes).yes)
          return NO_WORK[Math.floor(roll * 1000) % NO_WORK.length];
        quest =
          (await written(world, { giver: giver.id, source: "person", wait: WRITE_WAIT })) ??
          (core.settings.questsBuiltIn
            ? builtInQuest(`person:${giver.id}:${Math.floor(hours() / 24)}`, world, {
                giver: giver.id,
                recent: save().questParts ?? [],
                source: "person",
              })
            : null);
      }
      if (!quest || taken(quest)) return "Nothing that wants doing just now.";
      if (core.talking?.id !== talking.id) return "";
      offer(quest);
      return quest.intro;
    },
    /** The noticeboard's posted quest, as a note that can be taken, or null; posts one when it's time. */
    boardNote() {
      if (!on()) return null;
      void post(facts());
      const quest = save().questBoard;
      if (!quest) return null;
      return {
        id: `quest:${quest.id}`,
        text: `${quest.title}. ${quest.intro}`,
        by: quest.giverName || null,
        errand: true,
      };
    },
    /** Takes the posted quest down: its card, then Accept or Decline. Returns whether `id` was it. */
    takeBoard(id, then = () => {}) {
      const quest = save()?.questBoard;
      if (!quest || id !== `quest:${quest.id}`) return false;
      offer(quest, then);
      return true;
    },
    /** An errand done or dropped (main.js finishErrand), kept with the quests as a one-stage quest. */
    errandOver(done, state = "done") {
      if (!done || !core.save) return;
      const line = state === "done" ? `Done: ${done.done || done.text}` : "Dropped.";
      core.save = { ...save(), quests: [...save().quests, errandRecord(done, state, hours(), line)] };
    },
    /** Journal → Quests: open first, then the rest, newest first. */
    journal() {
      const money = api.money();
      const id = tracked()?.id ?? "";
      const all = [...(errand() ? [errand()] : []), ...(save()?.quests ?? [])];
      const rank = (quest) => (quest.state === "active" ? 0 : 1);
      return {
        on: on(),
        list: all
          .map((quest, i) => ({ quest, i }))
          .sort((a, b) => rank(a.quest) - rank(b.quest) || b.i - a.i)
          .map(({ quest }) => questView(quest, { tracked: id, money }))
          .map((view) =>
            core.inventory?.ready() ? view : { ...view, reward: view.reward && "their thanks and good will" },
          ),
      };
    },
    track(id) {
      if (!core.save) return;
      core.save = { ...save(), questTracked: id };
      mark = "";
      write();
    },
    giveUp(id) {
      if (save()?.errand?.id === id) return void api.dropErrand();
      const quest = open().find((entry) => entry.id === id);
      if (quest && settle(quest, giveUp(quest, hours()))) write();
    },
    choose(id, option) {
      const quest = open().find((entry) => entry.id === id);
      if (!quest) return;
      const result = questEvent(quest, { type: "choose", option }, facts());
      if (settle(quest, result.quest, result.lines)) write();
    },
    /** Settings → Debug: finish or fail the tracked quest's stage, or show its state. Returns what to say. */
    debug(action) {
      const quest = tracked();
      if (!quest) return "No quest is open.";
      if (quest.errand) {
        if (action === "finish") api.finishErrand();
        else if (action === "fail") api.dropErrand();
        return action === "show" ? questState(quest) : `The errand: ${action === "finish" ? "done" : "dropped"}.`;
      }
      if (action === "show") return questState(quest);
      const world = facts();
      let now = quest;
      if (action === "finish") {
        // (A hunt takes one blow per creature: the same event until the stage moves on.)
        for (let n = 0; n < 12 && now.state === "active" && now.at === quest.at; n++) {
          const result = questEvent(now, finishingEvent(now), world);
          if (result.quest === now) break;
          now = result.quest;
        }
        if (now.at === quest.at && now.state === "active")
          now = moveOn(now, "done", world.now, "Finished by hand (Debug).");
      } else now = moveOn(quest, "failed", world.now, "Failed by hand (Debug).", { failures: world.failures, why: "" });
      if (settle(quest, now)) write();
      return now.state === "active" ? `Now: ${stageOf(now).text}` : `The quest is ${now.state}.`;
    },
    /** The regions a quest is sending you to, marked on Journal → Map's map of regions. */
    markRegions(cells) {
      const keys = new Set(
        open()
          .map((quest) => stageOf(quest)?.goal)
          .filter((goal) => goal?.region)
          .map((goal) => goal.region),
      );
      const out = cells.map((cell) => (keys.has(cell.key) ? { ...cell, mark: `${cell.mark}!` } : cell));
      for (const key of keys)
        if (!cells.some((cell) => cell.key === key)) {
          const [x, z] = key.split(",").map(Number);
          out.push({ key, x, z, visited: false, colour: null, mark: "!" });
        }
      return out;
    },
  };
}
