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
import { ANIMALS, coatFor, createAnimal, dogBody, POPULATION } from "./animals.js";
import { blobShadow } from "./character.js";
import { hashString, heightAt, rng, waterAt } from "./world.js";

const NEAR = 110; // metres from the player within which an animal is moved and drawn
const FLEE_FROM = 8; // metres: a timid animal this close to the player runs
const FLEE_TO = 26; // and this far
const WADE = 0.3; // metres of water an animal will walk into
const FOLLOW_LOST = 45; // metres behind its owner at which their animal gives up walking and turns up beside them

/**
 * Where a world's animals start: [{ kind, coat (a horse's or a dog's colours: animals.js COATS, or null),
 * scale (its size), x, z, range (metres they stray), tied (stands about one spot) }]. `world`: its layout
 * (townHalf, plaza, outposts), doors and size. `counts`: how many of each sort ({ strays, farm, wild,
 * hostile, monsters }; a sort at 0 has none); `off`: kinds there are none of at all. Plain numbers in,
 * plain data out.
 */
export function herdFor(world, seed, { counts = POPULATION, off = [] } = {}) {
  const random = rng((seed ^ 0x6a09e667) >>> 0);
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
  const dry = (x, z) => waterAt(x, z).depth <= 0 && !world.blocked(x, z, 0.8);
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

  // The farms' animals: cattle, now and then a bull or an alpaca, a donkey and a horse at each farm; a
  // horse by each tavern and inn and a donkey at a hamlet; then the farms again, till there are enough.
  {
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
      const at = site.reach ? near(site.x, site.z, site.reach) : dry(site.x, site.z) ? site : null;
      if (!at) return;
      add(kind, at.x, at.z, site.range, site.tied ? { tied: true } : {});
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
    const plaza = layout.plaza;
    for (let n = 0; n < want("strays"); n++) {
      const at = near(plaza.x, plaza.z, 22);
      const { kind, scale } = dogBody(pick(["small", "medium", "medium", "large"]));
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
      if (dry(at.x, at.z) && heightAt(at.x, at.z) < 22) return at;
    }
    return null;
  };
  // The ones that keep their distance: a fox here and there on its own, deer in twos to fours, a stag among them.
  {
    let left = want("wild");
    const grazers = ["deer", "stag"].filter(on);
    let foxes = on("fox") ? (grazers.length ? Math.round(left * 0.2) : left) : 0;
    for (let guard = 0; guard < 80 && left > 0 && (foxes > 0 || grazers.length); guard++) {
      if (foxes > 0) {
        const at = wild(15);
        if (at) add("fox", at.x, at.z, 20);
        foxes--;
        left--;
        continue;
      }
      const at = wild(25);
      const size = Math.min(left, 2 + Math.floor(random() * 3));
      for (let n = 0; n < size; n++) {
        const kind = on("deer") && !(on("stag") && n > 0 && random() < 0.3) ? "deer" : (grazers.at(-1) ?? "deer");
        const spot = at ? (near(at.x, at.z, 7) ?? at) : null;
        if (spot) add(kind, spot.x, spot.z, 16);
      }
      left -= size;
    }
  }
  // The ones that would attack: wolves, some alone and some in packs of two to five that keep together.
  if (on("wolf")) {
    let left = want("hostile");
    for (let guard = 0; guard < 60 && left > 0; guard++) {
      const size = Math.min(left, random() < 0.4 ? 1 : 2 + Math.floor(random() * 4));
      const pack = wild(60);
      for (let n = 0; n < size && pack; n++) {
        const spot = near(pack.x, pack.z, 6) ?? pack;
        add("wolf", spot.x, spot.z, 26, { home: { x: pack.x, z: pack.z } });
      }
      left -= size;
    }
  }
  // (Monsters: none has a body yet; `counts.monsters` waits for them.)
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

  function clear() {
    token++;
    spawned = "";
    for (const beast of beasts) {
      beast.group?.removeFromParent();
      beast.animal?.dispose();
    }
    beasts = [];
  }

  function setWorld(nextWorld, seed, options) {
    clear();
    world = nextWorld;
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

  /** Loads `beast`'s body and puts it in the world. */
  function embody(beast, mine) {
    {
      void createAnimal(beast.kind, beast.coat)
        .then((animal) => {
          if (mine !== token || beast.gone) return animal.dispose();
          beast.animal = animal;
          animal.object.scale.setScalar(beast.scale ?? 1); // (its size: a large wolf, a small dog)
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
    if (distance > FOLLOW_LOST) {
      // Left far behind (a river crossed, a journey made): it turns up again beside them.
      for (let tries = 0; tries < 8; tries++) {
        const angle = beast.random() * Math.PI * 2;
        const spot = { x: at.x + Math.sin(angle) * (keep + 1), z: at.z + Math.cos(angle) * (keep + 1) };
        if (waterAt(spot.x, spot.z).depth > WADE || world.blocked(spot.x, spot.z, 0.6)) continue;
        beast.x = spot.x;
        beast.z = spot.z;
        break;
      }
      return;
    }
    if (distance <= keep) return;
    const pace = Math.min(
      facts.gallop,
      distance > 9 ? facts.gallop : distance > 4.5 ? facts.walk * 2.4 : facts.walk * 1.4,
    );
    const move = Math.min(distance - keep, pace * dt);
    const next = { x: beast.x + (dx / distance) * move, y: 0, z: beast.z + (dz / distance) * move };
    world.resolveCollisions(next, 0.45, false);
    if (waterAt(next.x, next.z).depth > WADE * 2) return; // not into the river: it waits on the bank
    const moved = Math.hypot(next.x - beast.x, next.z - beast.z);
    beast.x = next.x;
    beast.z = next.z;
    beast.speed = moved / Math.max(dt, 1e-4);
    const heading = Math.atan2(dx, dz);
    beast.angle += Math.atan2(Math.sin(heading - beast.angle), Math.cos(heading - beast.angle)) * Math.min(1, dt * 7);
  }

  /** Whether `beast` can be ridden: a horse or a donkey, or a dog grown big enough. */
  const rideable = (beast) => ANIMALS[beast.kind].back > 0 && (beast.scale ?? 1) >= (ANIMALS[beast.kind].rideFrom ?? 0);

  function place(beast) {
    if (!beast.group) return;
    beast.group.position.set(beast.x, heightAt(beast.x, beast.z), beast.z);
    beast.group.rotation.y = beast.angle;
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

  function step(beast, dt, player) {
    const facts = ANIMALS[beast.kind];
    const toPlayer = Math.hypot(player.x - beast.x, player.z - beast.z);
    // A timid one bolts from anyone close, straight away from them.
    if (facts.timid && toPlayer < FLEE_FROM && beast.state !== "flee") {
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
    if (waterAt(at.x, at.z).depth > WADE) return stop(); // not into the river
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

  function update(dt, view) {
    if (!world) return;
    const player = view.player;
    for (const beast of beasts) {
      if (!beast.group) continue;
      const far = Math.hypot(player.x - beast.x, player.z - beast.z) > NEAR;
      beast.group.visible = !far;
      if (far) continue;
      if (!beast.ridden) {
        if (beast.owned && beast.out) follow(beast, dt, view.owners?.get(beast.owner));
        else step(beast, dt, player);
        place(beast);
      }
      beast.animal.update(dt, beast.speed, { graze: beast.graze, jump: beast.ridden ? (beast.leap ?? null) : null });
    }
  }

  return {
    setWorld,
    setOwned,
    setSpawns,
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
        ridden: beast.ridden,
        loaded: !!beast.group,
      })),
    /** The animals within `reach` of `at` that can be ridden: [{ id, kind, x, z, back }]. */
    mounts(at, reach) {
      return beasts
        .filter((beast) => beast.group && !beast.ridden && rideable(beast))
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
        back: facts.back * (beast.scale ?? 1), // (a big horse's back is higher)
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
