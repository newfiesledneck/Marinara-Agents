// The animals of a world: which are where, and what each does. Farm animals keep to their farm, dogs to
// the settlement, horses stand by the taverns, inns and farms (to be ridden: main.js), and deer, foxes
// and wolves keep to the country, the timid ones running from anyone who comes close. Their bodies are
// animals.js's; this is only where they go.
//
// Which animals a world has comes from its seed, from numbers of their own, so a world's land, town and
// people are untouched by them.
//
// Someone's own dog or horse (`setOwned`) is one more animal here: with its owner it follows them, and
// sent home it keeps to its spot by their door.
import { Group, Mesh } from "three";
import { ANIMALS, coatFor, createAnimal, dogBody, HABITATS, POPULATION } from "./animals.js";
import { blobShadow } from "./character.js";
import { kitModel } from "./kit.js";
import { hashString, heightAt as landHeight, rng, waterAt as landWater } from "./world.js";

const NEAR = 110; // metres from the player within which an animal is moved and drawn
const FLEE_FROM = 8; // metres: a timid animal this close to the player runs
const FLEE_TO = 26; // and this far
const WADE = 0.3; // metres of water an animal will walk into
const THREAT_FROM = 16; // metres from the player at which a hostile animal squares up to them
const BODY_SECONDS = 180; // how long one that's been beaten lies where it fell
const LUNGE_SECONDS = 0.4; // how long a lunge takes, there and back
const HUNT_FROM = 22; // and from which, let attack, it comes for them
const THREAT_EVERY = 45; // seconds between the game being told of one squaring up
/**
 * The saddle (the props kit's, from a Poly by Google model, CC-BY): how much smaller than it's made it
 * goes on a horse, and how far up its own height its underside is (the stirrups hang below that). It's
 * made narrower than the horse's barrel and the horse's back rises above where a rider's seat is
 * measured, so it's widened (`wide`) and set a little higher (`up`, metres on a horse of the usual size):
 * else the seat sinks into the back and the flaps into its sides.
 */
const SADDLE = { scale: 0.3, wide: 1.3, up: 0.1, under: 2.95, forward: 0.05 };
const AFLOAT = 0.8; // how much of the way up to its back an animal sits in deep water
const FOLLOW_LOST = 45; // metres behind its owner at which their animal gives up walking and turns up beside them

/**
 * How often a monster is bigger than most of its kind (Settings → Creatures → Bigger monsters), and by how
 * much: `big` and `huge` are the chances, the sizes are times its usual one. Size makes it tougher in a fight
 * as well (combat.js foeOf: more HP, harder blows, more XP). Only the first of a group may be huge.
 */
/** Within how far of a landmark or a cave mouth a spot counts as among ruins or by caves (metres). */
const LANDMARK_REACH = 45;
const RUINS = new Set(["ruins", "graveyard", "stones", "watchtower"]);
/**
 * What kind of place (x, z) is, for where monsters live (animals.js HABITATS): a Set of "open", "hills"
 * (5 m up and more), "mountains" (12 m and more), "water" (within 10 m of it), "ruins" and "caves" (near a
 * landmark of that sort or a cave mouth).
 */
export function habitatsAt(world, x, z) {
  const here = new Set();
  const height = landHeight(x, z);
  here.add(height >= 12 ? "mountains" : height >= 5 ? "hills" : "open");
  const wet = [
    [0, 0],
    [10, 0],
    [-10, 0],
    [0, 10],
    [0, -10],
    [7, 7],
    [-7, 7],
    [7, -7],
    [-7, -7],
  ];
  if (wet.some(([dx, dz]) => landWater(x + dx, z + dz).depth > 0)) here.add("water");
  for (const outpost of world.layout?.outposts ?? []) {
    if (Math.hypot(outpost.x - x, outpost.z - z) > LANDMARK_REACH) continue;
    if (RUINS.has(outpost.kind)) here.add("ruins");
    if (outpost.kind === "cave" || outpost.deep) here.add("caves");
  }
  if ((world.caves ?? []).some((cave) => Math.hypot(cave.x - x, cave.z - z) <= LANDMARK_REACH)) here.add("caves");
  return here;
}

/** How likely a rare monster kind (an ogre, a troll, a minotaur, a dragon) is next to a common one. */
export const RARE_SHARE = 0.5;
export const MONSTER_SIZES = {
  some: { big: 0.12, huge: 0.02 },
  more: { big: 0.25, huge: 0.065 },
  bigBy: [1.25, 1.4],
  hugeBy: [1.6, 1.8],
};
/** A monster's size when it's bigger than most (`seed`: its own number), or null: its usual size. */
export function monsterScale(kind, sizes, leader, seed) {
  const odds = MONSTER_SIZES[sizes];
  const facts = ANIMALS[kind];
  if (!odds || !facts || facts.fly || facts.person) return null;
  const own = rng(seed >>> 0);
  const roll = own();
  const within = ([low, high]) => low + own() * (high - low);
  if (leader && roll < odds.huge) return within(MONSTER_SIZES.hugeBy);
  if (roll < odds.huge + odds.big) return within(MONSTER_SIZES.bigBy);
  return null;
}

/**
 * Where a world's animals start: [{ kind, coat (a horse's or a dog's colours: animals.js COATS, or null),
 * scale (its size), x, z, range (metres they stray), tied (stands about one spot) }]. `world`: its layout
 * (townHalf, plaza, outposts), doors and size. `counts`: how many of each sort ({ strays, farm, wild,
 * hostile, monsters, town }; a sort at 0 has none; `town` is the most inside the settlement itself);
 * `off`: kinds there are none of at all; `quiet`: where none of the world's own are ({ all, wild (none
 * out in the country), areas: [{ x, z, r }] }). Plain numbers in, plain data out.
 */
/** How high an animal whose back is `back` metres up stands at (x, z): on the ground, or afloat in deep water. */
export function afloatAt(x, z, back) {
  const ground = landHeight(x, z);
  const water = landWater(x, z);
  return water.depth > 0 ? Math.max(ground, water.level - back * AFLOAT) : ground;
}

export function herdFor(
  world,
  seed,
  { counts = POPULATION, off = [], quiet = {}, sizes = "some", favour = [], habitats = true } = {},
) {
  if (quiet.all) return [];
  // Each sort is counted out from numbers of its own, so changing how many there are of one sort leaves
  // the others where they were.
  let random = rng((seed ^ 0x6a09e667) >>> 0);
  const from = (sort) => (random = rng(hashString(`herd:${seed}:${sort}`)));
  const pick = (list) => list[Math.floor(random() * list.length)];
  const on = (kind) => !off.includes(kind);
  const out = [];
  // Coats and sizes come from numbers of their own (the seed and which animal it is), not from `random`.
  const add = (kind, x, z, range, more = {}) => {
    const own = rng(hashString(`own:${seed}:${out.length}`));
    out.push({
      kind,
      coat: coatFor(kind, hashString(`coat:${seed}:${out.length}`)),
      scale: 0.92 + own() * 0.2,
      x,
      z,
      range,
      tied: false,
      ...more,
    });
  };
  // (Not in the water, not inside anything, and not somewhere the lore keeps animals out of.)
  const dry = (x, z) =>
    landWater(x, z).depth <= 0 &&
    !world.blocked(x, z, 0.8) &&
    !(quiet.areas ?? []).some((area) => Math.hypot(area.x - x, area.z - z) < area.r);
  const near = (x, z, reach) => {
    for (let tries = 0; tries < 12; tries++) {
      const angle = random() * Math.PI * 2;
      const far = reach * (0.35 + random() * 0.65);
      const at = { x: x + Math.sin(angle) * far, z: z + Math.cos(angle) * far };
      if (dry(at.x, at.z)) return at;
    }
    return null;
  };
  const layout = world.layout;
  const want = (sort) => Math.max(0, Math.round(counts[sort] ?? 0));
  // Only so many inside the settlement itself (dogs and horses share it); the rest go just outside it.
  let townLeft = Math.max(0, Math.round(counts.town ?? Infinity));
  const inTown = (x, z) => Math.max(Math.abs(x), Math.abs(z)) < layout.townHalf;
  const outskirts = () => {
    for (let tries = 0; tries < 30; tries++) {
      const angle = random() * Math.PI * 2;
      const far = layout.townHalf * 1.42 + 6 + random() * 22;
      const at = { x: Math.sin(angle) * far, z: Math.cos(angle) * far };
      if (dry(at.x, at.z) && !inTown(at.x, at.z)) return at;
    }
    return null;
  };

  // The farms' animals: cattle, now and then a bull or an alpaca, a donkey and a horse at each farm; a
  // horse by each tavern and inn and a donkey at a hamlet; then the farms again, till there are enough.
  {
    from("farm");
    const farms = layout.outposts.filter((outpost) => outpost.kind === "farm");
    const stands = [
      ...layout.outposts
        .filter((outpost) => outpost.kind === "inn" || outpost.kind === "hamlet")
        .map((outpost) => ({
          kind: outpost.kind === "inn" ? "horse" : "donkey",
          x: outpost.x,
          z: outpost.z,
          reach: 7,
          range: 3,
        })),
      ...world.doors
        .filter((door) => door.kind === "tavern")
        .map((door) => ({
          kind: "horse",
          x: door.x + Math.cos(door.angle) * 3.2,
          z: door.z - Math.sin(door.angle) * 3.2,
          reach: 0,
          range: 1.5,
          tied: true,
        })),
    ];
    let left = want("farm");
    const place = (kind, site) => {
      if (left <= 0 || !on(kind)) return;
      let at = site.reach ? near(site.x, site.z, site.reach) : dry(site.x, site.z) ? site : null;
      let tied = !!site.tied;
      // (One the settlement has no more room for stands outside it, loose.)
      if (at && inTown(at.x, at.z)) {
        if (townLeft > 0) townLeft--;
        else [at, tied] = [outskirts(), false];
      }
      if (!at) return;
      add(kind, at.x, at.z, tied ? site.range : Math.max(site.range, 4), tied ? { tied: true } : {});
      left--;
    };
    for (let round = 0; round < 8 && left > 0 && (farms.length || (round === 0 && stands.length)); round++) {
      for (const farm of farms)
        for (const kind of ["cow", "cow", pick(["bull", "alpaca", "cow"]), "donkey", "horse"])
          place(kind, {
            x: farm.x,
            z: farm.z,
            reach: kind === "cow" ? 14 : 9,
            range: kind === "horse" || kind === "donkey" ? 4 : 10,
          });
      if (round === 0) for (const stand of stands) place(stand.kind, stand);
    }
  }
  // Strays: dogs about the market, of whatever size (animals.js DOG_SIZES).
  if (on("husky") || on("shiba")) {
    from("strays");
    const plaza = layout.plaza;
    for (let n = 0; n < want("strays"); n++) {
      // (About the market while the settlement has room; after that, about its edges.)
      const at = townLeft > 0 ? near(plaza.x, plaza.z, 22) : outskirts();
      if (at && inTown(at.x, at.z)) townLeft--;
      const { kind, scale } = dogBody(pick(["small", "small", "medium"]));
      if (at) add(kind, at.x, at.z, 18, { scale });
    }
  }
  // Out in the country, well away from the houses.
  const half = layout.worldHalf - 14;
  const wild = (from) => {
    for (let tries = 0; tries < 40; tries++) {
      const at = { x: (random() * 2 - 1) * half, z: (random() * 2 - 1) * half };
      if (Math.max(Math.abs(at.x), Math.abs(at.z)) < layout.townHalf + from) continue;
      if (layout.outposts.some((outpost) => Math.hypot(outpost.x - at.x, outpost.z - at.z) < 28)) continue;
      if (dry(at.x, at.z) && landHeight(at.x, at.z) < 22) return at;
    }
    return null;
  };
  /** Open ground a little way out from the settlement's edge: near enough to be seen from its last houses. */
  const edge = () => {
    for (let tries = 0; tries < 30; tries++) {
      const angle = random() * Math.PI * 2;
      const far = layout.townHalf * 1.42 + 14 + random() * 40;
      const at = { x: Math.sin(angle) * far, z: Math.cos(angle) * far };
      if (Math.max(Math.abs(at.x), Math.abs(at.z)) > half) continue;
      if (layout.outposts.some((outpost) => Math.hypot(outpost.x - at.x, outpost.z - at.z) < 28)) continue;
      if (dry(at.x, at.z) && landHeight(at.x, at.z) < 22) return at;
    }
    return null;
  };
  // The ones that keep their distance: a fox here and there on its own, deer in twos to fours, a stag among them.
  if (!quiet.wild) {
    from("wild");
    let left = want("wild");
    const grazers = ["deer", "stag"].filter(on);
    let foxes = on("fox") ? (grazers.length ? Math.round(left * 0.2) : left) : 0;
    for (let guard = 0; guard < 80 && left > 0 && (foxes > 0 || grazers.length); guard++) {
      if (foxes > 0) {
        const at = wild(15) ?? wild(6);
        if (!at) continue; // (no room found this time: try again)
        add("fox", at.x, at.z, 20);
        foxes--;
        left--;
        continue;
      }
      // (Every other herd grazes within sight of the settlement's edge; the rest are anywhere out there.)
      const at = (guard % 2 === 0 ? edge() : null) ?? wild(25) ?? wild(10);
      if (!at) continue;
      const size = Math.min(left, 2 + Math.floor(random() * 3));
      for (let n = 0; n < size; n++) {
        const kind = on("deer") && !(on("stag") && n > 0 && random() < 0.3) ? "deer" : (grazers.at(-1) ?? "deer");
        const spot = near(at.x, at.z, 7) ?? at;
        add(kind, spot.x, spot.z, 16);
      }
      left -= size;
    }
  }
  // The ones that would attack: wolves, some alone and some in packs of two to five that keep together.
  if (on("wolf") && !quiet.wild) {
    from("hostile");
    let left = want("hostile");
    for (let guard = 0; guard < 60 && left > 0; guard++) {
      const size = Math.min(left, random() < 0.4 ? 1 : 2 + Math.floor(random() * 4));
      // (Well out from the houses where there's room; nearer in on a small map.)
      const pack = wild(60) ?? wild(30) ?? wild(12);
      if (!pack) continue;
      for (let n = 0; n < size; n++) {
        const spot = near(pack.x, pack.z, 6) ?? pack;
        add("wolf", spot.x, spot.z, 26, { home: { x: pack.x, z: pack.z } });
      }
      left -= size;
    }
  }
  // Monsters: alone or in twos and threes of a kind, out in the country like the wolves; the night's ones
  // (a kind's `when`) are about only then. As many as asked for, whichever kinds are on: with only trolls
  // on, a hundred is a hundred trolls; with others on, a rare kind is only less likely.
  {
    const kinds = Object.keys(ANIMALS).filter((kind) => ANIMALS[kind].group === "monsters" && on(kind));
    from("monsters");
    let left = quiet.wild || !kinds.length ? 0 : want("monsters");
    // (How likely each kind is: a rare one, an ogre or a dragon, `RARE_SHARE` of a common one; one not
    // about yet when the monsters are counted out again, `favour`, twice as likely as it would be.)
    const weightOf = (kind) => (ANIMALS[kind].rare ? RARE_SHARE : 1) * (favour.includes(kind) ? 2 : 1);
    const weighted = (list) => {
      let roll = random() * list.reduce((sum, kind) => sum + weightOf(kind), 0);
      for (const kind of list) if ((roll -= weightOf(kind)) < 0) return kind;
      return list.at(-1);
    };
    // With habitats on, the den is found first and the kind is one that lives in such a place. Should no
    // kind that's on live anywhere this world has (only frost giants, and no mountains), they're put
    // anywhere after all, so the Monsters number still holds.
    let fitting = habitats;
    const tries = left * 6 + 60;
    for (let guard = 0; guard < tries && left > 0; guard++) {
      const den = wild(45) ?? wild(20) ?? wild(8);
      if (!den) continue;
      let kind;
      if (fitting) {
        const here = habitatsAt(world, den.x, den.z);
        const fit = kinds.filter((name) => !HABITATS[name] || HABITATS[name].some((place) => here.has(place)));
        if (!fit.length) {
          if (guard > tries / 2 && left === want("monsters")) fitting = false; // (nothing fits anywhere)
          continue;
        }
        kind = weighted(fit);
      } else kind = weighted(kinds);
      // (A rare one is alone.)
      const size = ANIMALS[kind].rare ? 1 : Math.min(left, random() < 0.5 ? 1 : 2 + Math.floor(random() * 2));
      for (let n = 0; n < size; n++) {
        const spot = near(den.x, den.z, 5) ?? den;
        const scale = monsterScale(kind, sizes, n === 0, hashString(`size:${seed}:${out.length}`));
        add(kind, spot.x, spot.z, 20, {
          ...(scale ? { scale } : {}),
          home: { x: den.x, z: den.z },
          ...(ANIMALS[kind].when ? { when: ANIMALS[kind].when } : {}),
        });
      }
      left -= size;
    }
  }
  return out;
}

/**
 * A world's animals, alive. `setWorld(world, seed)` puts them in it (their bodies load as they can; one
 * that can't be loaded just isn't there); `update(dt, view)` moves them (`view`: { player: { x, z } });
 * `mounts(at, reach)` lists those that can be ridden within reach; `ride(beast)` and `release(beast, at)`
 * hand one to the rider and back (while ridden, the rider moves it: `carry`).
 */
export function createHerd() {
  let world = null;
  let beasts = [];
  let token = 0;
  let spawned = ""; // the lore's animals as last asked for (setSpawns)
  let tempers = {}; // what the lore says a kind is like here: { wolf: "tame", deer: "hostile" } (setTempers)
  let clock = 0; // seconds it has run
  let lastThreat = -Infinity; // when a hostile one last squared up to the player
  let events = []; // what's happened that the game should tell: [{ type: "threat" | "attack", kind, x, z }]
  // The ground and water where they are: the land's, or a level's own below ground (deep.js: flat and dry).
  const heightAt = (x, z) => (world?.heightAt ?? landHeight)(x, z);
  const waterAt = (x, z) => (world?.waterAt ?? landWater)(x, z);

  /** What `beast` is like: "tame", "hostile", "timid" or "calm" (its own, the lore's for its kind, or its kind's). */
  const temperOf = (beast) =>
    beast.owned
      ? "tame"
      : (beast.temper ??
        tempers[beast.kind] ??
        (ANIMALS[beast.kind].hostile ? "hostile" : ANIMALS[beast.kind].timid ? "timid" : "calm"));

  function clear() {
    token++;
    spawned = "";
    for (const beast of beasts) {
      beast.group?.removeFromParent();
      beast.animal?.dispose();
    }
    beasts = [];
  }

  let made = null; // { seed, options }: what the world's own were last counted out from (setWorld)
  let round = 0; // how many times the monsters have been counted out again (respawn)

  function setWorld(nextWorld, seed, options) {
    clear();
    world = nextWorld;
    made = { seed, options: options ?? {} };
    round = 0;
    if (!world) return;
    const mine = token;
    beasts = herdFor(world, seed, options).map((start, i) => ({
      ...alive(`${seed}:${i}`, i),
      home: { x: start.x, z: start.z }, // (a pack shares one: `start.home`)
      ...start,
      id: `beast-${i}`,
    }));
    for (const beast of beasts) embody(beast, mine);
  }

  /**
   * Counts the world's own monsters out again (Settings → Creatures → New monsters every): the ones far from
   * `player` go and new ones come, out of sight, up to the Monsters number again, with kinds not about yet
   * more likely. Kept: any within sight of the player (`NEAR`), any after someone or in a fight, those the
   * lore placed, anyone's own, and every id in `keep` (a quest's, a fight's). How many came.
   */
  function respawn(player, keep = new Set()) {
    if (!world || !made) return 0;
    const own = (beast) => ANIMALS[beast.kind]?.group === "monsters" && !beast.owned && !beast.lore;
    const stays = (beast) =>
      !own(beast) ||
      beast.ridden ||
      beast.carried ||
      beast.angry ||
      beast.chasing ||
      keep.has(beast.id) ||
      (player && Math.hypot(beast.x - player.x, beast.z - player.z) < NEAR);
    beasts = beasts.filter((beast) => {
      if (stays(beast)) return true;
      beast.gone = true;
      beast.group?.removeFromParent();
      beast.animal?.dispose();
      return false;
    });
    const about = beasts.filter((beast) => own(beast) && beast.down === undefined && !beast.gone);
    const counts = made.options.counts ?? POPULATION;
    const wanted = Math.max(0, (counts.monsters ?? POPULATION.monsters) - about.length);
    if (!wanted) return 0;
    round++;
    const quiet = made.options.quiet ?? {};
    const fresh = herdFor(world, (made.seed ^ hashString(`round:${round}`)) >>> 0, {
      ...made.options,
      counts: { strays: 0, farm: 0, wild: 0, hostile: 0, monsters: wanted, town: 0 },
      // (Out of sight: none where the player can see them come.)
      quiet: { ...quiet, areas: [...(quiet.areas ?? []), ...(player ? [{ x: player.x, z: player.z, r: NEAR }] : [])] },
      favour: Object.keys(ANIMALS).filter((kind) => !about.some((beast) => beast.kind === kind)),
    });
    fresh.forEach((start, i) => {
      const id = `beast-r${round}-${i}`;
      const beast = { ...alive(`${made.seed}:${id}`, i), home: { x: start.x, z: start.z }, ...start, id };
      beasts.push(beast);
      embody(beast, token);
    });
    return fresh.length;
  }

  /** What every animal here carries besides where it started. */
  const alive = (key, n = 0) => ({
    angle: (hashString(key) % 628) / 100,
    speed: 0,
    state: "idle",
    wait: (n % 7) * 0.7,
    target: null,
    graze: false,
    ridden: false,
    animal: null,
    group: null,
    random: rng(hashString(`beast:${key}`)),
  });

  /**
   * A saddle on `beast`'s back (a horse that's someone's own), once the props kit has it: set on its
   * body, so it's the size the horse is. Without the kit's model, it goes bare.
   */
  function saddle(beast, mine) {
    void kitModel("props", "saddle")
      .then((parts) => {
        if (mine !== token || beast.gone || !beast.animal) return;
        const seat = new Group();
        for (const { geometry, material } of parts) seat.add(new Mesh(geometry, material));
        seat.scale.set(SADDLE.scale * SADDLE.wide, SADDLE.scale, SADDLE.scale);
        seat.position.set(0, ANIMALS[beast.kind].back + SADDLE.up - SADDLE.under * SADDLE.scale, SADDLE.forward);
        beast.saddled = true;
        beast.animal.carryOn(seat); // on its body's bone: it moves as the back does
      })
      .catch(() => {}); // no props kit: no saddle
  }

  /** Loads `beast`'s body and puts it in the world. */
  function embody(beast, mine) {
    {
      void createAnimal(beast.kind, beast.coat)
        .then((animal) => {
          if (mine !== token || beast.gone) return animal.dispose();
          beast.animal = animal;
          animal.object.scale.setScalar(beast.scale ?? 1); // (its size: a large wolf, a small dog)
          if (beast.owned && beast.kind === "horse") saddle(beast, mine);
          beast.group = animal.object;
          const shadow = blobShadow();
          shadow.scale.setScalar(beast.kind === "horse" || beast.kind === "cow" || beast.kind === "bull" ? 2.4 : 1.4);
          beast.group.add(shadow);
          place(beast);
          world.scene.add(beast.group);
        })
        .catch((error) => console.warn(`[wanderworld] no ${beast.kind}: ${error?.message ?? error}`));
    }
  }

  /**
   * The animals that are someone's own: `list` is [{ id, kind, coat, owner (an id; the player's is
   * whatever main.js calls them), out (with their owner, or at home), home: { x, z } }]. Ones no longer
   * listed (or listed as another kind or coat) go; new ones appear at home.
   */
  function setOwned(list) {
    if (!world) return;
    const wanted = new Map(list.map((entry) => [entry.id, entry]));
    beasts = beasts.filter((beast) => {
      if (!beast.owned) return true;
      const entry = wanted.get(beast.id);
      if (entry && entry.kind === beast.kind && entry.coat === beast.coat) return true;
      beast.gone = true;
      beast.group?.removeFromParent();
      beast.animal?.dispose();
      return false;
    });
    for (const entry of list) {
      if (!ANIMALS[entry.kind]) continue;
      let beast = beasts.find((other) => other.id === entry.id);
      if (!beast) {
        beast = {
          ...alive(entry.id),
          id: entry.id,
          kind: entry.kind,
          coat: entry.coat,
          x: entry.home.x,
          z: entry.home.z,
          range: 3,
          tied: false,
          owned: true,
        };
        beasts.push(beast);
        embody(beast, token);
      }
      beast.owner = entry.owner;
      beast.scale = entry.scale ?? 1;
      beast.animal?.object.scale.setScalar(beast.scale);
      beast.out = entry.out;
      beast.home = { x: entry.home.x, z: entry.home.z };
    }
  }

  /**
   * The animals a world's lore asks for: `list` is [{ id, kind, scale, count, at: { x, z } or null for
   * anywhere out in the country }]. Each is a pack keeping together about one spot. Ones no longer
   * listed go.
   */
  function setSpawns(list) {
    if (!world) return;
    const key = JSON.stringify(list);
    if (key === spawned) return;
    spawned = key;
    beasts = beasts.filter((beast) => {
      if (!beast.lore) return true;
      beast.gone = true;
      beast.group?.removeFromParent();
      beast.animal?.dispose();
      return false;
    });
    const layout = world.layout;
    const half = layout.worldHalf - 14;
    for (const entry of list) {
      if (!ANIMALS[entry.kind]) continue;
      const random = rng(hashString(`lore:${entry.id}`));
      const dry = (x, z) => waterAt(x, z).depth <= 0 && !world.blocked(x, z, 0.8);
      let home = entry.at && dry(entry.at.x, entry.at.z) ? entry.at : null;
      for (let tries = 0; tries < 60 && !home; tries++) {
        // Near where it's asked for; else out in the country, away from the houses.
        const spot = entry.at
          ? { x: entry.at.x + (random() * 2 - 1) * 14, z: entry.at.z + (random() * 2 - 1) * 14 }
          : { x: (random() * 2 - 1) * half, z: (random() * 2 - 1) * half };
        if (!entry.at && Math.max(Math.abs(spot.x), Math.abs(spot.z)) < layout.townHalf + 30) continue;
        if (dry(spot.x, spot.z) && heightAt(spot.x, spot.z) < 22) home = spot;
      }
      if (!home) continue;
      const count = entry.count || 1 + Math.floor(random() * 4);
      for (let n = 0; n < count; n++) {
        const angle = random() * Math.PI * 2;
        const out = n ? 1.5 + random() * 4.5 : 0;
        const at = { x: home.x + Math.sin(angle) * out, z: home.z + Math.cos(angle) * out };
        const spot = dry(at.x, at.z) ? at : home;
        const beast = {
          ...alive(`${entry.id}:${n}`, n),
          id: `lore:${entry.id}:${n}`,
          kind: entry.kind,
          coat: coatFor(entry.kind, hashString(`coat:${entry.id}:${n}`)),
          scale: (entry.scale ?? 1) * (entry.sized ? 1 : 0.92 + random() * 0.2),
          x: spot.x,
          z: spot.z,
          home: { x: home.x, z: home.z },
          range: 22,
          tied: false,
          lore: true,
          ...(entry.temper ? { temper: entry.temper } : {}),
          ...(entry.when ? { when: entry.when } : {}),
        };
        beasts.push(beast);
        embody(beast, token);
      }
    }
  }

  /** With its owner (`at`: { x, z, inside }, or nothing when they aren't about): keeping up, close by. */
  function follow(beast, dt, at) {
    const facts = ANIMALS[beast.kind];
    beast.state = "idle";
    beast.target = null;
    beast.graze = false;
    beast.speed = 0;
    if (!at || at.inside) return; // waits where it is, by the door they went in at
    const dx = at.x - beast.x;
    const dz = at.z - beast.z;
    const distance = Math.hypot(dx, dz);
    const keep = facts.back > 0 ? 3.4 : 1.9;
    // Left far behind (a journey made), or kept from them by something for a while: it turns up beside them.
    if (distance > FOLLOW_LOST || (beast.stuck ?? 0) > 4) return turnUp(beast, at, keep + 1);
    if (distance <= keep) {
      beast.stuck = 0;
      return;
    }
    const pace = Math.min(
      facts.gallop,
      distance > 9 ? facts.gallop : distance > 4.5 ? facts.walk * 2.4 : facts.walk * 1.4,
    );
    const move = Math.min(distance - keep, pace * dt);
    const next = { x: beast.x + (dx / distance) * move, y: 0, z: beast.z + (dz / distance) * move };
    world.resolveCollisions(next, 0.45, true); // (into the river too: it swims after them)
    const moved = Math.hypot(next.x - beast.x, next.z - beast.z);
    beast.stuck = moved < move * 0.25 && distance > keep + 4 ? (beast.stuck ?? 0) + dt : 0;
    beast.x = next.x;
    beast.z = next.z;
    beast.speed = moved / Math.max(dt, 1e-4);
    const heading = Math.atan2(dx, dz);
    beast.angle += Math.atan2(Math.sin(heading - beast.angle), Math.cos(heading - beast.angle)) * Math.min(1, dt * 7);
  }

  /** Whether `beast` can be ridden: a horse or a donkey, or a dog grown big enough. */
  const rideable = (beast) => ANIMALS[beast.kind].back > 0 && (beast.scale ?? 1) >= (ANIMALS[beast.kind].rideFrom ?? 0);

  /** Puts `beast` a few steps from `at` (its owner), on dry open ground when there is some. */
  function turnUp(beast, at, far) {
    beast.stuck = 0;
    for (let tries = 0; tries < 12; tries++) {
      const angle = beast.random() * Math.PI * 2;
      const spot = { x: at.x + Math.sin(angle) * far, z: at.z + Math.cos(angle) * far };
      if (waterAt(spot.x, spot.z).depth > WADE || world.blocked(spot.x, spot.z, 0.6)) continue;
      beast.x = spot.x;
      beast.z = spot.z;
      beast.angle = Math.atan2(at.x - spot.x, at.z - spot.z);
      return;
    }
  }

  function place(beast) {
    if (!beast.group) return;
    // (A flyer keeps off the ground, more so the bigger it is; in deep water the others float.)
    const size = beast.scale ?? 1;
    const up = (ANIMALS[beast.kind].fly ?? 0) * size;
    // (A lunge: half a pace forward and back again, for the ones with no clip of their own for an attack.)
    const through = beast.lungeAt === undefined ? 1 : (clock - beast.lungeAt) / LUNGE_SECONDS;
    const lunge = through >= 0 && through < 1 ? Math.sin(through * Math.PI) * 0.55 * size : 0;
    beast.group.position.set(
      beast.x + Math.sin(beast.angle) * lunge,
      (world.heightAt
        ? world.heightAt(beast.x, beast.z)
        : afloatAt(beast.x, beast.z, (ANIMALS[beast.kind].back || 0.6) * size)) +
        up +
        lunge * 0.25,
      beast.z + Math.cos(beast.angle) * lunge,
    );
    beast.group.rotation.y = beast.angle;
  }

  /**
   * `beast` acts out an attack: one built as a person is swings what it carries, or casts ("strike" | "cast");
   * any other lunges when it strikes. ponytail: the animals' and monsters' kit has no attack clips (only idle,
   * walk and gallop were baked); bake them from the packs in scripts/build-wanderworld-animals.mjs to replace the lunge.
   */
  function actOut(beast, name) {
    // (One whose kit has no attack of its own lunges.)
    if (!beast.animal?.act?.(name) && name === "strike") beast.lungeAt = clock;
  }

  /** Somewhere to go: a dry, open spot within its range of home. */
  function wander(beast) {
    for (let tries = 0; tries < 6; tries++) {
      const angle = beast.random() * Math.PI * 2;
      const far = beast.range * (0.3 + beast.random() * 0.7);
      const at = { x: beast.home.x + Math.sin(angle) * far, z: beast.home.z + Math.cos(angle) * far };
      if (waterAt(at.x, at.z).depth <= WADE && !world.blocked(at.x, at.z, 0.6)) return at;
    }
    return null;
  }

  /** One step toward (x, z) at `pace`, round what's in the way and not into the river; faces that way. */
  function toward(beast, x, z, pace, dt) {
    const dx = x - beast.x;
    const dz = z - beast.z;
    const distance = Math.hypot(dx, dz);
    if (distance < 0.05) return (beast.speed = 0);
    if ((beast.rootUntil ?? 0) > clock) return (beast.speed = 0); // (held where it is: grappled)
    // (Slowed by a spell: half its pace until it wears off.)
    const move = Math.min(distance, pace * ((beast.slowUntil ?? 0) > clock ? 0.5 : 1) * dt);
    const next = { x: beast.x + (dx / distance) * move, y: 0, z: beast.z + (dz / distance) * move };
    world.resolveCollisions(next, 0.5, false);
    if (waterAt(next.x, next.z).depth > WADE * 2) return (beast.speed = 0);
    const moved = Math.hypot(next.x - beast.x, next.z - beast.z);
    beast.x = next.x;
    beast.z = next.z;
    beast.speed = moved / Math.max(dt, 1e-4);
    const heading = Math.atan2(dx, dz);
    beast.angle += Math.atan2(Math.sin(heading - beast.angle), Math.cos(heading - beast.angle)) * Math.min(1, dt * 7);
    return beast.speed;
  }

  /**
   * A hostile one with the player in reach, where the player lets them be hostile (`view.hostile`:
   * "threaten" or "attack"; `view.safe`: not here): it squares up to them about six metres off, backing
   * away if they come on; or it runs in and snaps, then draws off till it's ready again. Returns false
   * when it has nothing to do with them (it goes about as any animal does).
   */
  /** How far `beast` can shoot or cast from (metres; 0: it has to close in): its own (`view.rangeOf`), else its kind's. */
  const reachOf = (beast, view) => (view.rangeOf ? view.rangeOf(beast) : (view.ranged?.[beast.kind] ?? 0));

  function hunt(beast, dt, player, view) {
    // (`angry`: it's been struck, and fights back whatever the settings say of hostile ones, and wherever.)
    if (view.down) return false; // (they're beaten: it has no more business with them)
    if ((beast.calmUntil ?? 0) > clock) return false; // (charmed or calmed by a spell, until it's struck)
    // In a fight it may go for one of the player's companions instead (`view.allies`: [{ id, x, z }]). It
    // keeps to whom it chose for a few seconds, then looks again: the nearest as often as not, else any.
    const near = Math.hypot(player.x - beast.x, player.z - beast.z);
    if (view.allies?.length && (beast.angry || view.hostile === "attack") && near < HUNT_FROM) {
      let chosen = beast.foeId ? view.allies.find((ally) => ally.id === beast.foeId) : null;
      if (clock >= (beast.foeUntil ?? 0) || (beast.foeId && !chosen)) {
        const all = [{ id: null, x: player.x, z: player.z }, ...view.allies];
        const byDistance = [...all].sort(
          (a, b) => Math.hypot(a.x - beast.x, a.z - beast.z) - Math.hypot(b.x - beast.x, b.z - beast.z),
        );
        chosen = beast.random() < 0.65 ? byDistance[0] : all[Math.floor(beast.random() * all.length)];
        beast.foeId = chosen.id;
        beast.foeUntil = clock + 4 + beast.random() * 4;
        if (!chosen.id) chosen = null;
      }
      if (chosen) player = chosen;
    } else beast.foeId = null;
    const mode = beast.angry ? "attack" : view.hostile;
    if (!beast.angry && (temperOf(beast) !== "hostile" || view.safe || (mode !== "threaten" && mode !== "attack")))
      return false;
    const facts = ANIMALS[beast.kind];
    const dx = player.x - beast.x;
    const dz = player.z - beast.z;
    const distance = Math.hypot(dx, dz);
    if (distance > (mode === "attack" ? HUNT_FROM : THREAT_FROM)) {
      beast.angry = false; // (they got away)
      beast.chasing = false;
      return false;
    }
    // (The moment it starts coming for them is told once, for a fight by turns to begin before it lands a blow.)
    if (mode === "attack" && !beast.chasing && (view.combat || beast.angry)) {
      beast.chasing = true;
      events.push({ type: "chase", id: beast.id, kind: beast.kind, scale: beast.scale ?? 1, x: beast.x, z: beast.z });
    }
    beast.state = "idle";
    beast.target = null;
    beast.graze = false;
    beast.wait = 2;
    const face = () => {
      beast.speed = 0;
      const heading = Math.atan2(dx, dz);
      beast.angle += Math.atan2(Math.sin(heading - beast.angle), Math.cos(heading - beast.angle)) * Math.min(1, dt * 6);
    };
    beast.cool = Math.max(0, (beast.cool ?? 0) - dt);
    if (mode === "attack" && beast.cool <= 0) {
      if (distance < 1.5) {
        actOut(beast, "strike");
        events.push({
          type: "attack",
          target: player.id ?? null, // (a companion's id when it's them it went for)
          id: beast.id,
          kind: beast.kind,
          scale: beast.scale ?? 1,
          x: beast.x,
          z: beast.z,
        });
        // (In a fight it comes again sooner than when it's only seeing someone off.)
        if (view.combat || beast.angry) {
          // What it does next is its own choice, with chance in it: come again at once, stay on them,
          // circle for an opening, or draw off a way.
          const choice = beast.random();
          beast.cool = beast.random() < 0.2 ? 0.9 : 2 + beast.random() * 2.4;
          beast.stance = choice < 0.5 ? "press" : choice < 0.8 ? "circle" : "back";
          beast.side = beast.random() < 0.5 ? 1 : -1;
        } else {
          beast.cool = 6 + beast.random() * 4;
          beast.stance = "back";
        }
        face();
      } else if (
        (view.combat || beast.angry) &&
        reachOf(beast, view) >= distance &&
        distance > 3.5 &&
        beast.random() < 0.8
      ) {
        // It has something for a distance (`view.ranged`: how far, by kind): it shoots or casts from where it
        // stands, then keeps off till it's ready again. (Now and then it runs in all the same.)
        actOut(beast, "cast");
        events.push({
          type: "attack",
          ranged: true,
          target: player.id ?? null,
          id: beast.id,
          kind: beast.kind,
          scale: beast.scale ?? 1,
          x: beast.x,
          z: beast.z,
        });
        beast.cool = 2.6 + beast.random() * 2.6;
        beast.stance = "back";
        face();
      } else toward(beast, player.x, player.z, facts.gallop, dt);
      return true;
    }
    // One that shoots or casts, between its shots: to where it wants to stand (behind something, where there
    // is something: `view.spotOf`), else off a way from them, giving ground when they come on and closing
    // when they get out of its reach.
    const reach = mode === "attack" && (view.combat || beast.angry) ? reachOf(beast, view) : 0;
    if (reach > 0 && distance > 0.01) {
      const spot = view.spotOf?.(beast) ?? null;
      const keep = Math.max(5, Math.min(reach * 0.6, 11));
      if (spot && Math.hypot(spot.x - beast.x, spot.z - beast.z) > 0.6)
        toward(beast, spot.x, spot.z, facts.walk * 2, dt);
      else if (!spot && distance < keep - 2)
        toward(beast, beast.x - (dx / distance) * 3, beast.z - (dz / distance) * 3, facts.walk * 2, dt);
      else if (!spot && distance > Math.min(reach - 1, keep + 5)) toward(beast, player.x, player.z, facts.walk * 2, dt);
      else face();
      return true;
    }
    // In a fight, between its attacks: close on them, or going round them, unless it chose to draw off.
    if (
      mode === "attack" &&
      (view.combat || beast.angry) &&
      beast.stance &&
      beast.stance !== "back" &&
      distance > 0.01
    ) {
      const ring = beast.stance === "press" ? 1.9 : 2.9;
      const round = Math.atan2(-dx, -dz) + beast.side * (beast.stance === "press" ? 0.35 : 0.7);
      const spot = { x: player.x + Math.sin(round) * ring, z: player.z + Math.cos(round) * ring };
      if (Math.hypot(spot.x - beast.x, spot.z - beast.z) > 0.5) toward(beast, spot.x, spot.z, facts.walk * 1.5, dt);
      else face();
      return true;
    }
    // Squared up to them (or drawn off after a lunge): about six metres off, giving ground if they come on.
    if (distance > 7)
      toward(beast, player.x - (dx / distance) * 6, player.z - (dz / distance) * 6, facts.walk * 1.8, dt);
    else if (distance < 4.5)
      toward(beast, beast.x - (dx / distance) * 3, beast.z - (dz / distance) * 3, facts.walk * 1.8, dt);
    else face();
    if (!player.id && distance < 9 && clock - lastThreat > THREAT_EVERY) {
      lastThreat = clock;
      events.push({ type: "threat", kind: beast.kind, x: beast.x, z: beast.z });
    }
    return true;
  }

  function step(beast, dt, player, view = {}) {
    const facts = ANIMALS[beast.kind];
    const toPlayer = Math.hypot(player.x - beast.x, player.z - beast.z);
    // A timid one bolts from anyone close, straight away from them; so does a hostile one kept from hostility.
    const temper = temperOf(beast);
    const wary =
      !beast.angry &&
      (temper === "timid" || (temper === "hostile" && view.hostile !== "threaten" && view.hostile !== "attack"));
    if (wary && toPlayer < FLEE_FROM && beast.state !== "flee") {
      const away = Math.atan2(beast.x - player.x, beast.z - player.z) + (beast.random() - 0.5) * 0.8;
      beast.target = { x: beast.x + Math.sin(away) * FLEE_TO, z: beast.z + Math.cos(away) * FLEE_TO };
      beast.state = "flee";
      beast.graze = false;
    }
    if (beast.state === "idle") {
      beast.speed = 0;
      beast.wait -= dt;
      if (beast.wait <= 0) {
        const target = beast.tied && beast.random() < 0.6 ? null : wander(beast);
        if (target) {
          beast.target = target;
          beast.state = "walk";
        } else beast.wait = 3 + beast.random() * 5;
        beast.graze = false;
      }
      return;
    }
    const dx = beast.target.x - beast.x;
    const dz = beast.target.z - beast.z;
    const distance = Math.hypot(dx, dz);
    // (One sent home from far off trots there.)
    const pace = beast.state === "flee" ? facts.gallop : beast.owned && distance > 12 ? facts.gallop * 0.6 : facts.walk;
    const stop = () => {
      beast.state = "idle";
      beast.target = null;
      beast.speed = 0;
      beast.wait = 4 + beast.random() * 9;
      // Grazers put their heads down for a while, as often as not. Having run, they settle where they are.
      beast.graze = beast.random() < 0.55 && !["wolf", "fox", "husky", "shiba"].includes(beast.kind);
    };
    if (distance < 0.4) return stop();
    const before = { x: beast.x, z: beast.z };
    const move = Math.min(distance, pace * dt);
    const at = { x: beast.x + (dx / distance) * move, y: 0, z: beast.z + (dz / distance) * move };
    world.resolveCollisions(at, 0.5, false);
    // Not into the river (one left in it, got down from, may still walk out).
    const deep = waterAt(at.x, at.z).depth;
    if (deep > WADE && deep >= waterAt(beast.x, beast.z).depth) return stop();
    beast.x = at.x;
    beast.z = at.z;
    const moved = Math.hypot(beast.x - before.x, beast.z - before.z);
    if (moved < move * 0.25) return stop(); // something's in the way: never mind
    beast.speed = moved / Math.max(dt, 1e-4);
    const heading = Math.atan2(dx, dz);
    const turn = Math.atan2(Math.sin(heading - beast.angle), Math.cos(heading - beast.angle));
    beast.angle += turn * Math.min(1, dt * (beast.state === "flee" ? 8 : 4));
    // A wild one that ran makes its new ground its home, so it doesn't walk straight back to the player.
    if (beast.state === "flee" && distance < 1.5) beast.home = { x: beast.x, z: beast.z };
  }

  /**
   * Keeps the animals in `shown` out of one another: two closer than their bodies allow each step aside,
   * so a pack runs side by side and stands round what it's after instead of all in one spot. One on the
   * move gives way by no more than 0.6 of its own speed, so it still gets where it's going; one standing
   * steps aside freely. Never one that's ridden or tied, and never into a wall or deeper water.
   */
  function spread(dt, shown) {
    const room = (beast) => (ANIMALS[beast.kind].back > 0 ? 0.75 : 0.45) * (beast.scale ?? 1);
    const shift = (beast, x, z, by) => {
      if (beast.ridden || beast.tied) return;
      const move = Math.min(by, (beast.speed > 0.1 ? beast.speed * 0.6 : 1.5) * dt);
      const next = { x: beast.x + x * move, y: 0, z: beast.z + z * move };
      world.resolveCollisions(next, 0.5, true);
      const deep = waterAt(next.x, next.z).depth;
      if (deep > WADE && deep > waterAt(beast.x, beast.z).depth) return;
      beast.x = next.x;
      beast.z = next.z;
      place(beast);
    };
    for (let a = 0; a < shown.length; a++)
      for (let b = a + 1; b < shown.length; b++) {
        const one = shown[a];
        const other = shown[b];
        let dx = other.x - one.x;
        let dz = other.z - one.z;
        const least = room(one) + room(other);
        if (Math.abs(dx) >= least || Math.abs(dz) >= least) continue;
        const distance = Math.hypot(dx, dz);
        if (distance >= least) continue;
        if (distance < 1e-3) {
          // (In the very same spot: any way apart will do, a different one for each pair.)
          dx = Math.sin(a * 2.4 + b);
          dz = Math.cos(a * 2.4 + b);
        }
        const by = (least - distance) / 2;
        const length = Math.hypot(dx, dz);
        shift(one, -dx / length, -dz / length, by);
        shift(other, dx / length, dz / length, by);
      }
  }

  function update(dt, view) {
    if (!world) return;
    const player = view.player;
    clock += dt;
    const shown = [];
    for (const beast of beasts) {
      if (!beast.group) continue;
      // One beaten on an earlier day, not yet due back (setBeaten).
      if (beast.away) {
        beast.group.visible = false;
        continue;
      }
      // One that's been beaten lies where it fell for a while, then is gone (until it's due back).
      if (beast.down !== undefined && beast.carried) {
        beast.group.visible = true; // (on someone's shoulder: main.js puts it there, holdBody)
        continue;
      }
      if (beast.down !== undefined) {
        // (`view.bodySeconds`: how long, from the player's settings; 0 leaves it until it's taken or cleared.)
        const lies = view.bodySeconds ?? BODY_SECONDS;
        if (lies > 0 && clock - beast.down > lies) beast.gone = true;
        beast.group.visible = !beast.gone && Math.hypot(player.x - beast.x, player.z - beast.z) <= NEAR;
        continue;
      }
      const far = Math.hypot(player.x - beast.x, player.z - beast.z) > NEAR;
      // In a fight by turns it waits for its turn; on it, it goes where it's sent (hold, march).
      if (beast.held && !far) {
        beast.group.visible = true;
        if (beast.march) {
          const left = Math.hypot(beast.march.x - beast.x, beast.march.z - beast.z);
          if (left > 0.3) toward(beast, beast.march.x, beast.march.z, ANIMALS[beast.kind].gallop, dt);
          else beast.march = null;
        }
        if (!beast.march) beast.speed = 0;
        if (beast.face) {
          const heading = Math.atan2(beast.face.x - beast.x, beast.face.z - beast.z);
          beast.angle +=
            Math.atan2(Math.sin(heading - beast.angle), Math.cos(heading - beast.angle)) * Math.min(1, dt * 6);
        }
        place(beast);
        beast.animal.update(dt, beast.speed, {});
        continue;
      }
      // Stunned (a spell): it stands where it is until it wears off.
      if ((beast.stunUntil ?? 0) > clock && !far) {
        beast.group.visible = true;
        beast.speed = 0;
        place(beast);
        beast.animal.update(dt, 0, {});
        continue;
      }
      // One that's about only by night (or only by day) is out of sight, in its den, the rest of the time.
      const away = beast.when === "night" ? !view.night : beast.when === "day" ? !!view.night : false;
      beast.group.visible = !far && !away;
      if (far || away) continue;
      shown.push(beast);
      if (!beast.ridden) {
        if (beast.owned && beast.out) follow(beast, dt, view.owners?.get(beast.owner));
        else if (!hunt(beast, dt, player, view)) step(beast, dt, player, view);
        place(beast);
      }
      beast.animal.update(dt, beast.speed, { graze: beast.graze, jump: beast.ridden ? (beast.leap ?? null) : null });
    }
    if (view.apart !== false) spread(dt, shown);
  }

  return {
    setWorld,
    setOwned,
    setSpawns,
    respawn,
    /** What the lore says a kind is like in this world: { wolf: "tame", deer: "hostile" }. */
    setTempers(next) {
      tempers = { ...next };
    },
    /** What's happened since this was last asked, for the game to tell: [{ type, kind, x, z }]. */
    takeEvents() {
      const taken = events;
      events = [];
      return taken;
    },
    update,
    /** Takes everything out of the world (before it's disposed). */
    detach: clear,
    /** Everything here, as plain facts: [{ id, kind, coat, x, z, state, ridden }]. */
    snapshot: () =>
      beasts.map((beast) => ({
        id: beast.id,
        kind: beast.kind,
        coat: beast.coat,
        owner: beast.owned ? beast.owner : null,
        out: beast.owned ? !!beast.out : null,
        scale: beast.scale ?? 1,
        lore: !!beast.lore,
        x: beast.x,
        z: beast.z,
        state: beast.state,
        temper: temperOf(beast),
        down: beast.down !== undefined,
        when: beast.when ?? "any",
        shown: !!beast.group?.visible,
        ridden: beast.ridden,
        loaded: !!beast.group,
      })),
    /**
     * Those within `reach` of `at` that a blow can land on: any animal but someone's own, one being ridden,
     * or one already beaten. [{ id, kind, scale, x, z, hp, max, hostile, room }] (`hp` and `max` once it has
     * been struck; `hostile`: it would fight; `room`: about how far its body reaches from its middle).
     */
    foes(at, reach) {
      return beasts
        .filter((beast) => beast.group?.visible && !beast.owned && !beast.ridden && beast.down === undefined)
        .filter((beast) => !beast.away && Math.hypot(beast.x - at.x, beast.z - at.z) < reach)
        .map((beast) => ({
          id: beast.id,
          kind: beast.kind,
          scale: beast.scale ?? 1,
          x: beast.x,
          z: beast.z,
          hp: beast.hp,
          max: beast.max,
          hostile: beast.angry || (ANIMALS[beast.kind].hostile && temperOf(beast) !== "tame"),
          fled: beast.temper === "timid", // (it has had enough, and runs)
          stunned: (beast.stunUntil ?? 0) > clock,
          // (For the fight display: it's after someone or fighting back, and what holds or calms it.)
          engaged: !!(beast.angry || beast.chasing),
          slowed: (beast.slowUntil ?? 0) > clock,
          rooted: (beast.rootUntil ?? 0) > clock,
          calmed: (beast.calmUntil ?? 0) > clock,
          room: (ANIMALS[beast.kind].back > 0 ? 0.75 : 0.45) * (beast.scale ?? 1),
        }));
    },
    /**
     * `id` is struck for `damage` (0: a miss, which still rouses it); `max` is its HP whole, for one not
     * struck before; `nerve` "flee" has it turn and run, else it fights back. { hp, max, down }, or null.
     */
    strike(id, damage, max, nerve = "fight") {
      const beast = beasts.find((entry) => entry.id === id);
      if (!beast?.group || beast.down !== undefined) return null;
      beast.max ??= Math.max(1, max);
      beast.hp = Math.max(0, (beast.hp ?? beast.max) - Math.max(0, damage));
      if (damage > 0) beast.calmUntil = 0; // (hurt, it's calm no longer)
      if (beast.hp <= 0) {
        beast.down = clock;
        beast.angry = false;
        beast.speed = 0;
        beast.state = "idle";
        beast.target = null;
        // (On its side, where it stood.)
        beast.group.rotation.z = Math.PI / 2;
        beast.group.position.y += 0.25 * (beast.scale ?? 1);
      } else if (nerve === "flee") {
        beast.angry = false;
        beast.temper = "timid"; // it has had enough: it runs from them from now on
        beast.state = "idle";
        beast.wait = 0;
      } else {
        beast.angry = true;
        beast.cool = Math.min(beast.cool ?? 0, 1.2);
      }
      return { hp: beast.hp, max: beast.max, down: beast.hp <= 0 };
    },
    /**
     * Which are beaten and not yet due back (their ids, from the world's save): they're not about. One no
     * longer listed is whole again, back where it lives. Cheap to call often.
     */
    setBeaten(ids) {
      const away = new Set(ids);
      for (const beast of beasts) {
        if (away.has(beast.id)) {
          if (beast.down === undefined || beast.gone) beast.away = true; // (one still lying there lies on)
        } else if (beast.away || (beast.gone && beast.down !== undefined && beast.counted)) {
          beast.away = false;
          beast.gone = false;
          beast.down = undefined;
          beast.hp = undefined;
          beast.searched = false;
          beast.angry = false;
          beast.counted = false;
          beast.temper = undefined;
          beast.x = beast.home.x;
          beast.z = beast.home.z;
          if (beast.group) beast.group.rotation.z = 0;
        }
        if (away.has(beast.id)) beast.counted = true;
      }
    },
    /** Which are in a fight by turns (their ids): they wait for their turn. None: every one is let go. */
    hold(ids) {
      const held = new Set(ids);
      for (const beast of beasts) {
        beast.held = held.has(beast.id) && beast.down === undefined;
        if (!beast.held) {
          beast.march = null;
          beast.face = null;
        }
      }
    },
    /** On its turn, a held one goes to (x, z), then turns to (faceX, faceZ). */
    march(id, x, z, faceX, faceZ) {
      const beast = beasts.find((entry) => entry.id === id);
      if (!beast?.held) return;
      beast.march = { x, z };
      beast.face = { x: faceX, z: faceZ };
    },
    /** `id` acts out an attack ("strike" | "cast"): for one that main.js rolls itself, on its turn in a fight by turns. */
    act(id, name) {
      const beast = beasts.find((entry) => entry.id === id);
      if (beast?.group && beast.down === undefined) actOut(beast, name);
    },
    /** `id` moves at half its pace for `seconds`. */
    slow(id, seconds) {
      const beast = beasts.find((entry) => entry.id === id);
      if (beast && beast.down === undefined) beast.slowUntil = clock + seconds;
    },
    /** Whatever holds, slows or calms `id` is over (the caster's concentration broke). */
    clear(id) {
      const beast = beasts.find((entry) => entry.id === id);
      if (!beast) return;
      beast.stunUntil = 0;
      beast.slowUntil = 0;
      beast.calmUntil = 0;
    },
    /** `id`'s body, for something to be shown over it (a speech bubble), or null. */
    bodyOf: (id) => beasts.find((entry) => entry.id === id && entry.down === undefined)?.group ?? null,
    /** `id` is mended by `amount` HP, up to its most. What it has then, or null if it isn't there or isn't hurt. */
    mend(id, amount) {
      const beast = beasts.find((entry) => entry.id === id);
      if (!beast || beast.down !== undefined || beast.hp === undefined) return null;
      beast.hp = Math.min(beast.max ?? beast.hp, beast.hp + Math.max(0, amount));
      return { hp: beast.hp, max: beast.max ?? beast.hp };
    },
    /** `id` can't move from where it is for `seconds` (0 lets it go), though it can still strike what's beside it. */
    root(id, seconds) {
      const beast = beasts.find((entry) => entry.id === id);
      if (beast && beast.down === undefined) beast.rootUntil = seconds > 0 ? clock + seconds : 0;
    },
    /** `id` leaves off fighting for `seconds`, or until it's hurt. */
    soothe(id, seconds) {
      const beast = beasts.find((entry) => entry.id === id);
      if (!beast || beast.down !== undefined) return;
      beast.angry = false;
      beast.calmUntil = clock + seconds;
    },
    /** `id` is shoved `metres` straight away from (fromX, fromZ), as far as the way is clear and dry. */
    push(id, fromX, fromZ, metres) {
      const beast = beasts.find((entry) => entry.id === id);
      if (!beast?.group || beast.down !== undefined) return;
      const far = Math.hypot(beast.x - fromX, beast.z - fromZ) || 1;
      const way = { x: (beast.x - fromX) / far, z: (beast.z - fromZ) / far };
      for (let gone = 0; gone < metres; gone += 0.5) {
        const next = { x: beast.x + way.x * 0.5, y: 0, z: beast.z + way.z * 0.5 };
        world.resolveCollisions(next, 0.5, false);
        if (waterAt(next.x, next.z).depth > WADE * 2) break;
        beast.x = next.x;
        beast.z = next.z;
      }
      place(beast);
    },
    /** `id` can do nothing for `seconds`. */
    stun(id, seconds) {
      const beast = beasts.find((entry) => entry.id === id);
      if (beast && beast.down === undefined) beast.stunUntil = clock + seconds;
    },
    /** The beaten lying within `reach` of `at`: [{ id, kind, x, z, searched }]. */
    bodies(at, reach) {
      return beasts
        .filter((beast) => beast.down !== undefined && !beast.gone && !beast.away && !beast.carried && beast.group)
        .filter((beast) => Math.hypot(beast.x - at.x, beast.z - at.z) < reach)
        .map((beast) => ({ id: beast.id, kind: beast.kind, x: beast.x, z: beast.z, searched: !!beast.searched }));
    },
    /** A body is seen to: `take` true takes it away (harvested), else it's only marked as searched. */
    tend(id, take) {
      const beast = beasts.find((entry) => entry.id === id);
      if (!beast || beast.down === undefined) return;
      beast.searched = true;
      if (take) {
        beast.gone = true;
        if (beast.group) beast.group.visible = false;
      }
    },
    /** A body is taken up to be carried. Returns whether it was there to take. */
    liftBody(id) {
      const beast = beasts.find((entry) => entry.id === id);
      if (!beast?.group || beast.down === undefined || beast.gone || beast.away) return false;
      beast.carried = true;
      return true;
    },
    /** Where a carried body is this frame: over a shoulder at (x, y, z), lying across the way `angle` faces. */
    holdBody(id, x, y, z, angle) {
      const beast = beasts.find((entry) => entry.id === id);
      if (!beast?.carried || !beast.group) return false;
      beast.x = x;
      beast.z = z;
      beast.group.position.set(x, y, z);
      beast.group.rotation.y = angle + Math.PI / 2;
      return true;
    },
    /** A carried body is put down at (x, z); how long it lies starts again. */
    putDown(id, x, z) {
      const beast = beasts.find((entry) => entry.id === id);
      if (!beast?.carried) return;
      beast.carried = false;
      beast.x = x;
      beast.z = z;
      beast.down = clock;
      place(beast);
      if (beast.group) beast.group.position.y += 0.25 * (beast.scale ?? 1);
    },
    /** Every body goes, now. Returns how many there were. */
    clearBodies() {
      let cleared = 0;
      for (const beast of beasts) {
        if (beast.down === undefined || beast.gone || beast.carried) continue;
        beast.gone = true;
        if (beast.group) beast.group.visible = false;
        cleared++;
      }
      return cleared;
    },
    /** Every roused one lets be (the player is down): they draw off, and don't come again for a while. */
    calm() {
      for (const beast of beasts) {
        beast.angry = false;
        beast.cool = 20;
      }
    },
    /** The animals within `reach` of `at` that can be ridden: [{ id, kind, x, z, back }]. */
    mounts(at, reach) {
      return beasts
        .filter((beast) => beast.group && !beast.ridden && rideable(beast) && beast.down === undefined && !beast.away)
        .filter((beast) => Math.hypot(beast.x - at.x, beast.z - at.z) < reach)
        .map((beast) => ({
          id: beast.id,
          kind: beast.kind,
          coat: beast.coat,
          owner: beast.owned ? beast.owner : null, // (someone's own: theirs to ride, not anyone's)
          x: beast.x,
          z: beast.z,
          back: ANIMALS[beast.kind].back * (beast.scale ?? 1),
        }));
    },
    /** The rider takes `id`: it stops going about on its own. Returns { kind, x, z, angle, back, seat, walk, gallop } or null. */
    ride(id) {
      const beast = beasts.find((entry) => entry.id === id);
      if (!beast?.group || beast.ridden || !rideable(beast)) return null;
      beast.ridden = true;
      beast.state = "idle";
      beast.target = null;
      beast.graze = false;
      const facts = ANIMALS[beast.kind];
      return {
        id,
        kind: beast.kind,
        coat: beast.coat,
        x: beast.x,
        z: beast.z,
        angle: beast.angle,
        ...facts,
        // (A big horse's back is higher; and a saddled one is sat on its saddle, which is set that much up.)
        back: (facts.back + (beast.saddled ? SADDLE.up : 0)) * (beast.scale ?? 1),
      };
    },
    /** While ridden: where the rider has taken it, facing `angle`, at `speed` metres a second; in a
     *  jump, `leap` of the way through it (0…1; null on the ground). Returns how far its back has risen
     *  (or dipped, gathering itself) at that point, in metres. */
    carry(id, x, z, angle, speed, leap = null) {
      const beast = beasts.find((entry) => entry.id === id);
      if (!beast?.ridden) return;
      beast.x = x;
      beast.z = z;
      beast.angle = angle;
      beast.speed = speed;
      beast.leap = leap;
      place(beast);
      return leap === null ? 0 : (beast.animal?.rise(leap) ?? 0) * (beast.scale ?? 1); // (a bigger one rises further)
    },
    /** How far the back of the one being ridden has moved from where it stands still (metres): its stride, its leap. */
    bob(id) {
      const beast = beasts.find((entry) => entry.id === id);
      return beast?.animal ? beast.animal.bob() : 0;
    },
    /** Its owner calls `id` (someone's own, with them): it turns up a few steps from `at`. Returns whether it has one to call. */
    call(id, at) {
      const beast = beasts.find((entry) => entry.id === id && entry.owned);
      if (!beast || beast.ridden || !world) return false;
      turnUp(beast, at, 5);
      place(beast);
      return true;
    },
    /** The rider gets down: it stays about where it was left. */
    release(id) {
      const beast = beasts.find((entry) => entry.id === id);
      if (!beast) return;
      beast.ridden = false;
      beast.speed = 0;
      beast.leap = null;
      // (Someone's own goes back to them, or to its place at home.)
      if (!beast.owned) {
        beast.home = { x: beast.x, z: beast.z };
        beast.range = Math.min(beast.range, 4);
      }
      beast.state = "idle";
      beast.wait = 6;
    },
  };
}
