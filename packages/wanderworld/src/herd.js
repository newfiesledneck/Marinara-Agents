// The animals of a world: which are where, and what each does. Farm animals keep to their farm, dogs to
// the settlement, horses stand by the taverns, inns and farms (to be ridden: main.js), and deer, foxes
// and wolves keep to the country, the timid ones running from anyone who comes close. Their bodies are
// animals.js's; this is only where they go.
//
// Which animals a world has comes from its seed, from numbers of their own, so a world's land, town and
// people are untouched by them.
import { ANIMALS, createAnimal } from "./animals.js";
import { blobShadow } from "./character.js";
import { hashString, heightAt, rng, waterAt } from "./world.js";

const NEAR = 110; // metres from the player within which an animal is moved and drawn
const FLEE_FROM = 8; // metres: a timid animal this close to the player runs
const FLEE_TO = 26; // and this far
const WADE = 0.3; // metres of water an animal will walk into

/**
 * Where a world's animals start: [{ kind, x, z, range (metres they stray), tied (stands about one spot) }].
 * `world`: its layout (townHalf, plaza, outposts), doors and size. Plain numbers in, plain data out.
 */
export function herdFor(world, seed) {
  const random = rng((seed ^ 0x6a09e667) >>> 0);
  const pick = (list) => list[Math.floor(random() * list.length)];
  const out = [];
  const add = (kind, x, z, range, more = {}) => out.push({ kind, x, z, range, tied: false, ...more });
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
  // Farms: cattle, now and then a bull or an alpaca, a donkey, and a horse in the yard.
  for (const outpost of layout.outposts) {
    if (outpost.kind === "farm") {
      for (const kind of ["cow", "cow", pick(["bull", "alpaca", "cow"]), "donkey", pick(["horse", "horse-white"])]) {
        const at = near(outpost.x, outpost.z, kind === "cow" ? 14 : 9);
        if (at) add(kind, at.x, at.z, kind.startsWith("horse") || kind === "donkey" ? 4 : 10);
      }
    } else if (outpost.kind === "inn" || outpost.kind === "hamlet") {
      const at = near(outpost.x, outpost.z, 7);
      if (at) add(outpost.kind === "inn" ? pick(["horse", "horse-white"]) : pick(["donkey", "shiba"]), at.x, at.z, 3);
    }
  }
  // In the settlement: a horse by each tavern, and a dog or two about the market.
  for (const door of world.doors) {
    if (door.kind !== "tavern") continue;
    const side = { x: door.x + Math.cos(door.angle) * 3.2, z: door.z - Math.sin(door.angle) * 3.2 };
    if (dry(side.x, side.z)) add(pick(["horse", "horse-white"]), side.x, side.z, 1.5, { tied: true });
  }
  const plaza = layout.plaza;
  for (const kind of [pick(["husky", "shiba"]), ...(random() < 0.5 ? [pick(["husky", "shiba"])] : [])]) {
    const at = near(plaza.x, plaza.z, 22);
    if (at) add(kind, at.x, at.z, 18);
  }
  // Out in the country: deer in twos and threes with a stag, a fox, and wolves well away from the houses.
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
  const scale = Math.max(1, Math.round((layout.worldHalf / 160) ** 2));
  for (let herd = 0; herd < 2 * scale; herd++) {
    const at = wild(25);
    if (!at) continue;
    for (const kind of ["deer", "deer", random() < 0.6 ? "stag" : "deer"]) {
      const spot = near(at.x, at.z, 7) ?? at;
      add(kind, spot.x, spot.z, 16);
    }
  }
  for (let i = 0; i < scale; i++) {
    const fox = wild(15);
    if (fox) add("fox", fox.x, fox.z, 20);
    const pack = wild(60);
    if (pack) for (let n = 0; n < 2; n++) add("wolf", pack.x + n * 2.5, pack.z + n, 24);
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

  function clear() {
    token++;
    for (const beast of beasts) {
      beast.group?.removeFromParent();
      beast.animal?.dispose();
    }
    beasts = [];
  }

  function setWorld(nextWorld, seed) {
    clear();
    world = nextWorld;
    if (!world) return;
    const mine = token;
    beasts = herdFor(world, seed).map((start, i) => ({
      ...start,
      id: `beast-${i}`,
      home: { x: start.x, z: start.z },
      angle: (hashString(`${seed}:${i}`) % 628) / 100,
      speed: 0,
      state: "idle",
      wait: (i % 7) * 0.7,
      target: null,
      graze: false,
      ridden: false,
      animal: null,
      group: null,
      random: rng(hashString(`beast:${seed}:${i}`)),
    }));
    for (const beast of beasts) {
      void createAnimal(beast.kind)
        .then((animal) => {
          if (mine !== token) return animal.dispose();
          beast.animal = animal;
          beast.group = animal.object;
          const shadow = blobShadow();
          shadow.scale.setScalar(
            beast.kind.startsWith("horse") || beast.kind === "cow" || beast.kind === "bull" ? 2.4 : 1.4,
          );
          beast.group.add(shadow);
          place(beast);
          world.scene.add(beast.group);
        })
        .catch((error) => console.warn(`[wanderworld] no ${beast.kind}: ${error?.message ?? error}`));
    }
  }

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
    const pace = beast.state === "flee" ? facts.gallop : facts.walk;
    const dx = beast.target.x - beast.x;
    const dz = beast.target.z - beast.z;
    const distance = Math.hypot(dx, dz);
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
        step(beast, dt, player);
        place(beast);
      }
      beast.animal.update(dt, beast.speed, { graze: beast.graze });
    }
  }

  return {
    setWorld,
    update,
    /** Takes everything out of the world (before it's disposed). */
    detach: clear,
    /** Everything here, as plain facts: [{ id, kind, x, z, state, ridden }]. */
    snapshot: () =>
      beasts.map((beast) => ({
        id: beast.id,
        kind: beast.kind,
        x: beast.x,
        z: beast.z,
        state: beast.state,
        ridden: beast.ridden,
        loaded: !!beast.group,
      })),
    /** The animals within `reach` of `at` that can be ridden: [{ id, kind, x, z, back }]. */
    mounts(at, reach) {
      return beasts
        .filter((beast) => beast.group && !beast.ridden && ANIMALS[beast.kind].back > 0)
        .filter((beast) => Math.hypot(beast.x - at.x, beast.z - at.z) < reach)
        .map((beast) => ({ id: beast.id, kind: beast.kind, x: beast.x, z: beast.z, back: ANIMALS[beast.kind].back }));
    },
    /** The rider takes `id`: it stops going about on its own. Returns { kind, x, z, angle, back, seat, walk, gallop } or null. */
    ride(id) {
      const beast = beasts.find((entry) => entry.id === id);
      if (!beast?.group || beast.ridden) return null;
      beast.ridden = true;
      beast.state = "idle";
      beast.target = null;
      beast.graze = false;
      const facts = ANIMALS[beast.kind];
      return { id, kind: beast.kind, x: beast.x, z: beast.z, angle: beast.angle, ...facts };
    },
    /** While ridden: where the rider has taken it, facing `angle`, at `speed` metres a second. */
    carry(id, x, z, angle, speed) {
      const beast = beasts.find((entry) => entry.id === id);
      if (!beast?.ridden) return;
      beast.x = x;
      beast.z = z;
      beast.angle = angle;
      beast.speed = speed;
      place(beast);
    },
    /** The rider gets down: it stays about where it was left. */
    release(id) {
      const beast = beasts.find((entry) => entry.id === id);
      if (!beast) return;
      beast.ridden = false;
      beast.speed = 0;
      beast.home = { x: beast.x, z: beast.z };
      beast.range = Math.min(beast.range, 4);
      beast.state = "idle";
      beast.wait = 6;
    },
  };
}
