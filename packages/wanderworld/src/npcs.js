// The townsfolk: characters the player picked, each living in a house in town. Through the day they
// wander near home, sit on benches, and go into houses, shops, the tavern or the temple for a while; at
// night they go home. Anyone inside the building the player walks into is there in its room, and people
// come and go through its door. They look at the player who comes near, wave hello, and stop to talk.
// Each walks in its own 3D Avatars model when it has one, and as the built-in person otherwise.
//
// Everyone's plans are simple rules for now; docs/CONCEPT.md (S5) plans for the AI to decide them.
import { CanvasTexture, Group, LinearFilter, Sprite, SpriteMaterial } from "three";
import { blobShadow } from "./character.js";
import { createFigure } from "./figure.js";
import { findModel, loadModelCharacter } from "./models.js";
import { createPerson } from "./people.js";
import { hashString, heightAt, rng } from "./world.js";

export const MAX_PEOPLE = 30; // far-off and out-of-sight people animate less often, so thirty stays smooth
const WANDER_RADIUS = 9;
const SEAT_SEARCH = 30; // metres from home a free bench may be
const VISIT_SEARCH = 45; // metres from home a shop, the tavern or the temple may be
const HOMES = 30; // homes nearest the plaza that townsfolk live in
const WALK_SPEED = 1.3; // an easy stroll
const BODY_RADIUS = 0.35;
const STOP_DISTANCE = 2.2; // the player this close: stop and face them
const LOOK_DISTANCE = 6; // and this close: turn the head to them
const WAVE_DISTANCE = 4.5;
const WAVE_AGAIN = 40; // seconds before waving at the player again
const TAG_HEIGHT = 2.15;
const NEAR = 30; // metres within which a visible person animates every frame
// The party: how followers keep up.
const FOLLOW_GAP = 1.4; // metres behind the player for the first row
const FOLLOW_ROW = 1.1; // and between rows
const FOLLOW_SIDE = 0.75; // metres to either side
const FOLLOW_RUN = 3.5; // further behind than this: run to catch up
const RUN_SPEED = 4.8;
const FOLLOW_LOST = 35; // further than this (or stuck a while): catch up out of sight
const FOLLOW_SEAT = 9; // metres from a seated player a follower looks for a seat
const NIGHT_FROM = 21;
const NIGHT_TO = 6.5;

/** A name floating over someone's head. */
function nameTag(name) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const font = "600 30px system-ui, sans-serif";
  context.font = font;
  const width = Math.ceil(context.measureText(name).width) + 28;
  canvas.width = width;
  canvas.height = 48;
  context.font = font;
  context.fillStyle = "rgba(10, 14, 20, 0.62)";
  context.beginPath();
  context.roundRect(0, 0, width, 48, 14);
  context.fill();
  context.fillStyle = "#f3f5f7";
  context.textBaseline = "middle";
  context.fillText(name, 14, 25);
  const texture = new CanvasTexture(canvas);
  texture.minFilter = LinearFilter;
  const sprite = new Sprite(new SpriteMaterial({ map: texture, depthWrite: false, transparent: true }));
  sprite.scale.set((width / 48) * 0.32, 0.32, 1);
  sprite.position.y = TAG_HEIGHT;
  sprite.renderOrder = 10;
  return sprite;
}

export function approachAngle(current, target, amount) {
  const difference = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + difference * Math.min(1, amount);
}

const isNight = (hour) => hour >= NIGHT_FROM || hour < NIGHT_TO;
/** Buildings townsfolk visit besides their own homes. */
const PUBLIC_KINDS = new Set(["tavern", "shop", "temple", "hall", "smithy"]);

export function createCrowd() {
  const people = new Map();
  let world = null;
  let room = null; // { door, room } while the player is inside a building
  let namesVisible = true;
  let shadowsVisible = true;
  let dressPeople = true; // people without a model get a kit person (people.js), else the simple figure
  let clock = 0;
  const party = []; // ids of followers, in order (their place in the line)

  /** Where someone is standing now: the town or the room. */
  const groundY = (person, x, z) => (person.space === world ? heightAt(x, z) : 0);

  /** Townsfolk live in the houses nearest the plaza, so the player meets them soon after arriving. */
  function place(person) {
    const doors = [...(world?.doors ?? [])].sort((a, b) => Math.hypot(a.x, a.z) - Math.hypot(b.x, b.z));
    const homes = doors.filter((door) => door.kind === "home").slice(0, HOMES);
    const choices = homes.length ? homes : doors;
    person.home = choices.length ? choices[hashString(person.id) % choices.length] : null;
    person.space = world;
    person.inDoor = null;
    const start = person.home ?? { x: 0, z: 0 };
    person.group.position.set(start.x, heightAt(start.x, start.z), start.z);
    person.group.visible = true;
    leaveSeat(person);
    person.plan = [];
    person.state = "idle";
    person.wait = person.random() * 2;
  }

  function setBody(person, character) {
    if (person.character) {
      person.group.remove(person.character.object);
      person.character.dispose();
    }
    person.character = character;
    person.group.add(character.object);
  }

  async function loadModel(person) {
    const model = await findModel({ type: "character", id: person.id });
    if (!people.has(person.id)) return;
    person.hasModel = !!model;
    if (!model && !dressPeople) return;
    try {
      const character = model ? await loadModelCharacter(model) : await createPerson(person.name, person.body);
      if (people.get(person.id) !== person) {
        character.dispose();
        return;
      }
      setBody(person, character);
    } catch (error) {
      console.warn(`[wanderworld] ${person.name}'s model failed to load`, error);
    }
  }

  function add({ id, name, body = "auto" }) {
    const person = {
      id,
      name,
      body, // "male", "female" or "auto": which default body they get without a 3D model
      group: new Group(),
      character: null,
      home: null,
      space: null, // the town (world) or the room the player is in
      inDoor: null, // the building they're inside, if any
      stay: 0, // seconds left inside a building (Infinity: until morning)
      state: "idle", // idle | walk | sit | inside (out of sight) | talk
      plan: [], // steps still to do: { walk } | { door } | { enter } | { leave } | { sit } | { wait }
      target: null,
      wait: 0,
      stuck: 0,
      seat: null,
      restUntil: 0, // no sitting down again before this (game seconds)
      visitUntil: 0, // no going indoors again before this
      lastWave: -Infinity,
      following: false, // in the party: walks with the player instead of following a plan
      waiting: null, // in the party but told to wait here: { x, z }
      speaking: false,
      animate: 0, // seconds of animation owed while updates are spaced out
      frame: 0,
      random: rng(hashString(`npc:${id}`)),
      tag: nameTag(name),
      shadow: blobShadow(),
    };
    person.tag.visible = namesVisible;
    person.shadow.visible = shadowsVisible;
    person.group.add(person.tag, person.shadow);
    setBody(person, createFigure(name));
    people.set(id, person);
    if (world) {
      world.scene.add(person.group);
      place(person);
    }
    void loadModel(person);
  }

  function remove(id) {
    const person = people.get(id);
    if (!person) return;
    if (party.includes(id)) party.splice(party.indexOf(id), 1);
    leaveSeat(person);
    people.delete(id);
    person.group.removeFromParent();
    person.character?.dispose();
    person.tag.material.map.dispose();
    person.tag.material.dispose();
  }

  function leaveSeat(person) {
    if (person.seat && person.seat.taken === person.id) person.seat.taken = null;
    person.seat = null;
  }

  // ── Finding the way ──

  /** True when a body can walk straight from `a` to `b` in `space` without walking into anything. */
  function clearPath(space, a, b) {
    const steps = Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) / 0.5);
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      if (space.blocked(a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t, BODY_RADIUS * 0.8)) return false;
    }
    return true;
  }

  /**
   * Where to head next on the way to `target`: straight there when nothing is in the way, otherwise the
   * street point that can be reached directly and leads best towards it. Points already used on this walk
   * are skipped, so nobody paces back and forth between two of them.
   */
  function nextPoint(person, target) {
    const from = person.group.position;
    if (person.space !== world || clearPath(world, from, target)) return target;
    let best = null;
    let bestCost = Infinity;
    for (const point of world.waypoints) {
      if (person.visited.has(point)) continue;
      const near = Math.hypot(point.x - from.x, point.z - from.z);
      if (near < 0.5 || !clearPath(world, from, point)) continue;
      const cost = near + Math.hypot(target.x - point.x, target.z - point.z);
      if (cost < bestCost) {
        best = point;
        bestCost = cost;
      }
    }
    if (best) person.visited.add(best);
    return best ?? null;
  }

  // ── Plans: what someone does next ──

  function freeSeat(person, seats, near, radius) {
    const free = seats.filter((seat) => !seat.taken && Math.hypot(seat.x - near.x, seat.z - near.z) < radius);
    return free.length ? free[Math.floor(person.random() * free.length)] : null;
  }

  function takeSeat(person, seat, seconds) {
    seat.taken = person.id;
    person.seat = seat;
    person.plan = [{ walk: seat.approach }, { sit: seconds }];
  }

  /** Walks to `door`, opens it, steps in and stays `seconds` (Infinity: until morning). */
  function goInto(person, door, seconds) {
    person.plan = [
      { walk: { x: door.x, z: door.z } },
      { door: door.index },
      { wait: 0.7 },
      { walk: door.step, straight: true },
      { enter: door, seconds },
    ];
  }

  /** A spot in the room clear of furniture, for standing about. */
  function roomSpot(person) {
    for (let tries = 0; tries < 12; tries++) {
      const x = (person.random() - 0.5) * 2 * (room.room.halfWidth - 0.6);
      const z = (person.random() - 0.5) * 2 * (room.room.halfDepth - 0.6);
      if (!room.room.blocked(x, z, 0.4)) return { x, z };
    }
    return { x: room.room.entry.x, z: room.room.entry.z - 1 };
  }

  function nextPlan(person, hour) {
    if (person.space !== world) {
      // In the room with the player: sit for a while, or stand somewhere and look about.
      const seat = clock > person.restUntil ? freeSeat(person, room.room.seats, { x: 0, z: 0 }, 50) : null;
      if (seat && person.random() < 0.6) return takeSeat(person, seat, 15 + person.random() * 25);
      person.plan = [{ walk: roomSpot(person) }, { wait: 5 + person.random() * 10 }];
      return;
    }
    if (isNight(hour) && person.home) return goInto(person, person.home, Infinity);
    const home = person.home ?? { x: 0, z: 0 };
    const roll = person.random();
    if (roll < 0.3 && clock > person.restUntil) {
      const seat = freeSeat(person, world.seats, home, SEAT_SEARCH);
      if (seat) return takeSeat(person, seat, 15 + person.random() * 30);
    }
    if (roll < 0.5 && clock > person.visitUntil) {
      // Somewhere to go: a shop, the tavern, the temple … or home for a bit.
      const places = world.doors.filter(
        (door) => PUBLIC_KINDS.has(door.kind) && Math.hypot(door.x - home.x, door.z - home.z) < VISIT_SEARCH,
      );
      const goHome = !places.length || person.random() < 0.35;
      const door = goHome ? person.home : places[Math.floor(person.random() * places.length)];
      if (door) return goInto(person, door, 20 + person.random() * 40);
    }
    for (let tries = 0; tries < 6; tries++) {
      const angle = person.random() * Math.PI * 2;
      const reach = 3 + person.random() * WANDER_RADIUS;
      const x = home.x + Math.cos(angle) * reach;
      const z = home.z + Math.sin(angle) * reach;
      if (!world.blocked(x, z)) {
        person.plan = [{ walk: { x, z } }, { wait: 4 + person.random() * 8 }];
        return;
      }
    }
    person.plan = [{ wait: 2 }];
  }

  /** Starts the next step of someone's plan. */
  function startStep(person, hour) {
    if (!person.plan.length) nextPlan(person, hour);
    const step = person.plan.shift();
    if (!step) return;
    if (step.walk) {
      person.state = "walk";
      person.target = step.walk;
      person.straight = !!step.straight;
      person.visited = new Set();
      person.next = step.straight ? step.walk : nextPoint(person, step.walk);
      person.stuck = 0;
      person.tries = 0;
      person.detour = null;
    } else if (step.door !== undefined) {
      world.setDoor(step.door, true, 3);
      person.state = "idle";
      person.wait = 0;
    } else if (step.enter) {
      person.inDoor = step.enter;
      person.stay = step.seconds;
      person.visitUntil = clock + 40 + person.random() * 40;
      if (room?.door.index === step.enter.index) enterRoom(person, true);
      else hide(person);
    } else if (step.leave) {
      leaveRoom(person);
    } else if (step.sit !== undefined) {
      const seat = person.seat;
      if (!seat) return;
      person.group.position.set(seat.x, groundY(person, seat.x, seat.z), seat.z);
      person.group.rotation.y = seat.angle;
      person.state = "sit";
      person.wait = step.sit;
    } else {
      person.state = "idle";
      person.wait = step.wait ?? 1;
    }
  }

  /** Out of sight inside a building. */
  function hide(person) {
    leaveSeat(person);
    person.group.removeFromParent();
    person.space = null;
    person.state = "inside";
  }

  /** Into the room the player is in: through the door (`arriving`), or already there when the player came in. */
  function enterRoom(person, arriving) {
    person.space = room.room;
    room.room.scene.add(person.group);
    person.group.visible = true;
    const spot = arriving ? room.room.entry : roomSpot(person);
    person.group.position.set(spot.x, 0, spot.z);
    person.group.rotation.y = arriving ? room.room.entry.angle : person.random() * Math.PI * 2;
    person.plan = arriving ? [{ walk: roomSpot(person) }] : [];
    person.state = "idle";
    person.wait = arriving ? 0 : person.random() * 3;
  }

  /** From the room back out through the door to the street. */
  function leaveRoom(person) {
    leaveSeat(person);
    person.group.removeFromParent();
    comeOut(person);
  }

  /** Comes back out of the building, through its door. */
  function comeOut(person) {
    const door = person.inDoor ?? person.home;
    person.inDoor = null;
    person.space = world;
    world.scene.add(person.group);
    person.group.position.set(door.step.x, heightAt(door.step.x, door.step.z), door.step.z);
    person.group.rotation.y = door.angle;
    person.group.visible = true;
    world.setDoor(door.index, true, 2.5);
    person.visitUntil = clock + 60 + person.random() * 60; // out for a while before going in anywhere again
    person.plan = [{ wait: 0.6 }, { walk: { x: door.x, z: door.z }, straight: true }];
    person.state = "idle";
    person.wait = 0;
  }

  /** Whether their time indoors is up (a visit's length, or night's end for the night at home). */
  function timeToLeave(person, hour) {
    return Number.isFinite(person.stay) ? person.stay <= 0 : !isNight(hour);
  }

  /**
   * One frame of walking with the player: to a place in a loose line behind them (by their place in the
   * party), running when they fall behind, round buildings by the street points, sitting near the player
   * when they sit, and catching up out of sight when lost. Returns true when there's nothing more to do
   * this frame (they were moved somewhere new).
   */
  function follow(person, dt, view, playerDistance) {
    const position = person.group.position;
    const player = view.player;
    // Told to wait: stand there, facing the player when they're close.
    if (person.waiting) {
      if (person.state === "walk" || Math.hypot(person.waiting.x - position.x, person.waiting.z - position.z) > 0.4) {
        stepToward(person, person.waiting, WALK_SPEED, dt);
      } else person.state = "idle";
      return false;
    }
    // In different places (the player is in a room): wait where they are until the player is back.
    if (person.space !== view.space) {
      person.state = "idle";
      return false;
    }
    // The player sat down: take a free seat close by, or stand near them.
    if (view.playerSitting) {
      if (person.state === "sit") return false;
      if (!person.seat) {
        const seat = freeSeat(person, person.space.seats ?? [], player, FOLLOW_SEAT);
        if (seat) {
          seat.taken = person.id;
          person.seat = seat;
        }
      }
      if (person.seat) {
        const { approach } = person.seat;
        if (Math.hypot(approach.x - position.x, approach.z - position.z) > 0.4) {
          stepToward(person, approach, WALK_SPEED, dt);
          return false;
        }
        position.set(person.seat.x, groundY(person, person.seat.x, person.seat.z), person.seat.z);
        person.group.rotation.y = person.seat.angle;
        person.state = "sit";
        return false;
      }
    } else if (person.state === "sit" || person.seat) {
      // The player stood up: up too.
      const seat = person.seat;
      leaveSeat(person);
      if (seat && person.state === "sit")
        position.set(seat.approach.x, groundY(person, seat.approach.x, seat.approach.z), seat.approach.z);
      person.state = "idle";
    }
    // A place in the line: rows of two behind the player.
    const slot = Math.max(0, party.indexOf(person.id));
    const row = Math.floor(slot / 2);
    const side = slot % 2 === 0 ? -1 : 1;
    const back = FOLLOW_GAP + row * FOLLOW_ROW;
    const angle = view.playerAngle ?? 0;
    const spot = {
      x: player.x - Math.sin(angle) * back + Math.cos(angle) * side * FOLLOW_SIDE,
      z: player.z - Math.cos(angle) * back - Math.sin(angle) * side * FOLLOW_SIDE,
    };
    if (person.space.blocked?.(spot.x, spot.z, BODY_RADIUS)) {
      spot.x = player.x - Math.sin(angle) * back;
      spot.z = player.z - Math.cos(angle) * back;
    }
    // Lost (far away, or stuck a while): catch up out of sight, at their place in the line.
    if (playerDistance > FOLLOW_LOST || person.stuck > 3) {
      position.set(spot.x, groundY(person, spot.x, spot.z), spot.z);
      person.stuck = 0;
      person.next = null;
      person.state = "idle";
      return true;
    }
    const away = Math.hypot(spot.x - position.x, spot.z - position.z);
    if (away < 0.45 || (playerDistance < FOLLOW_GAP + 0.3 && away < 1.2)) {
      person.state = "idle";
      person.group.rotation.y = approachAngle(person.group.rotation.y, angle, 4 * dt);
      return false;
    }
    const speed =
      away > FOLLOW_RUN ? RUN_SPEED : Math.max(WALK_SPEED, Math.min(view.playerSpeed ?? WALK_SPEED, RUN_SPEED));
    stepToward(person, spot, speed, dt);
    return false;
  }

  /** A step toward `target` at `speed`: straight when nothing's in the way, else by the street points. */
  function stepToward(person, target, speed, dt) {
    const position = person.group.position;
    person.state = "walk";
    person.rethink = (person.rethink ?? 0) - dt;
    if (!person.next || person.rethink <= 0) {
      person.rethink = 0.5;
      person.visited = new Set();
      person.next = nextPoint(person, target) ?? target;
    }
    const next =
      person.next === target || Math.hypot(person.next.x - position.x, person.next.z - position.z) < 0.6
        ? target
        : person.next;
    if (next === target) person.next = target;
    const dx = next.x - position.x;
    const dz = next.z - position.z;
    const distance = Math.hypot(dx, dz);
    if (distance < 0.05) return;
    const stride = Math.min(distance, speed * dt);
    const beforeX = position.x;
    const beforeZ = position.z;
    position.x += (dx / distance) * stride;
    position.z += (dz / distance) * stride;
    person.space.resolveCollisions(position, BODY_RADIUS);
    person.group.rotation.y = approachAngle(person.group.rotation.y, Math.atan2(dx, dz), 10 * dt);
    const moved = Math.hypot(position.x - beforeX, position.z - beforeZ);
    person.stuck = moved < stride * 0.2 ? (person.stuck ?? 0) + dt : Math.max(0, (person.stuck ?? 0) - dt);
  }

  function stepPerson(person, dt, view) {
    if (person.inDoor) person.stay -= dt;
    if (person.state === "inside") {
      if (timeToLeave(person, view.hour)) comeOut(person);
      return;
    }
    // In the player's room and time to go: head for the door first.
    if (person.space !== world && timeToLeave(person, view.hour) && person.state !== "talk" && !person.leaving) {
      person.leaving = true;
      leaveSeat(person);
      person.plan = [{ walk: room.room.exit, straight: true }, { leave: true }];
      person.state = "idle";
      person.wait = 0;
    }
    if (person.space === world) person.leaving = false;

    const position = person.group.position;
    const startX = position.x;
    const startZ = position.z;
    const together = person.space === view.space;
    const player = view.player;
    const toPlayerX = player.x - position.x;
    const toPlayerZ = player.z - position.z;
    const playerDistance = together ? Math.hypot(toPlayerX, toPlayerZ) : Infinity;
    const towardPlayer = Math.atan2(toPlayerX, toPlayerZ);
    const near = playerDistance < STOP_DISTANCE && !view.playerSitting && !person.leaving;
    const space = person.space;

    if (person.state === "talk") {
      person.group.rotation.y = approachAngle(person.group.rotation.y, towardPlayer, 6 * dt);
    } else if (person.following) {
      if (follow(person, dt, view, playerDistance)) return;
    } else if (person.state === "sit") {
      person.wait -= dt;
      if (person.wait <= 0 || (space === world && isNight(view.hour))) {
        const seat = person.seat;
        leaveSeat(person);
        if (seat) position.set(seat.approach.x, groundY(person, seat.approach.x, seat.approach.z), seat.approach.z);
        person.restUntil = clock + 60 + person.random() * 90; // not straight back down again
        person.state = "idle";
        person.wait = 0.6;
      }
    } else if (near) {
      // Someone came up to them: stop and face them.
      person.group.rotation.y = approachAngle(person.group.rotation.y, towardPlayer, 6 * dt);
    } else if (person.state === "walk") {
      // Reaching a street point on the way: pick the next one (or the spot itself, once it's in sight).
      const next = person.next;
      if (next && next !== person.target && Math.hypot(next.x - position.x, next.z - position.z) < 0.6) {
        person.next = nextPoint(person, person.target);
      }
      // No way there (or a long way round with no end): give up on this plan and think again.
      if (!person.next || person.visited.size > 14) {
        leaveSeat(person);
        person.plan = [];
        person.state = "idle";
        person.wait = 1;
        return;
      }
      const dx = person.next.x - position.x;
      const dz = person.next.z - position.z;
      const distance = Math.hypot(dx, dz);
      if (distance < 0.35 && person.next === person.target) {
        person.state = "idle";
        person.wait = 0;
      } else if (distance < 0.35) {
        person.next = nextPoint(person, person.target) ?? person.target;
      } else {
        // Heading for the spot, or stepping sideways round something in the way for a moment.
        let headX = dx / distance;
        let headZ = dz / distance;
        if (person.detour) {
          person.detour.left -= dt;
          headX = person.detour.x;
          headZ = person.detour.z;
          if (person.detour.left <= 0) person.detour = null;
        }
        const stride = Math.min(distance, WALK_SPEED * dt);
        position.x += headX * stride;
        position.z += headZ * stride;
        if (!person.straight) space.resolveCollisions(position, BODY_RADIUS);
        person.group.rotation.y = approachAngle(person.group.rotation.y, Math.atan2(headX, headZ), 8 * dt);
        const moved = Math.hypot(position.x - startX, position.z - startZ);
        person.stuck = moved < stride * 0.2 ? person.stuck + dt : Math.max(0, person.stuck - dt);
        if (person.stuck > 0.4 && !person.detour) {
          // Blocked: step off to one side (a seeded choice), then try the straight line again.
          const side = person.random() < 0.5 ? 1 : -1;
          person.detour = { x: -(dz / distance) * side, z: (dx / distance) * side, left: 0.9 };
          person.tries = (person.tries ?? 0) + 1;
          person.stuck = 0;
        }
        // Still blocked after a few side steps: the spot can't be reached. Leaving a room, step out
        // anyway; otherwise give up on the plan.
        if (person.tries > 4) {
          person.tries = 0;
          person.detour = null;
          if (person.leaving) {
            leaveRoom(person);
            return;
          }
          leaveSeat(person);
          person.plan = [];
          person.state = "idle";
          person.wait = 0.5;
        }
      }
    } else {
      person.wait -= dt;
      if (person.wait <= 0) startStep(person, view.hour);
    }
    if (person.state === "inside" || !person.space) return;
    position.y = groundY(person, position.x, position.z);

    // Looking at and waving to the player.
    const relative = Math.atan2(
      Math.sin(towardPlayer - person.group.rotation.y),
      Math.cos(towardPlayer - person.group.rotation.y),
    );
    const lookAt = playerDistance < LOOK_DISTANCE && Math.abs(relative) < 1.7 ? relative : null;
    let wave = false;
    if (playerDistance < WAVE_DISTANCE && view.time - person.lastWave > WAVE_AGAIN && person.state !== "talk") {
      person.lastWave = view.time;
      wave = Math.abs(relative) < 1.2;
    } else if (playerDistance < WAVE_DISTANCE) {
      person.lastWave = Math.max(person.lastWave, view.time - WAVE_AGAIN + 5); // no wave while they stay close
    }

    // Spaced-out animation for people far away or out of sight; every frame for those nearby.
    const moved = Math.hypot(position.x - startX, position.z - startZ);
    const speed = dt > 0 ? moved / dt : 0;
    person.animate += dt;
    person.frame++;
    const visible = together && view.isVisible(position);
    const every = !visible ? 6 : playerDistance > NEAR ? 3 : 1;
    if (person.frame % every !== 0 && !wave) return;
    const pose = person.character.update(person.animate, speed, {
      sit: person.state === "sit",
      lookAt,
      talk: person.state === "talk" && person.speaking,
      wave,
    });
    person.animate = 0;
    if (pose?.footstep && visible && playerDistance < 14) view.onFootstep?.(position, pose.running, playerDistance);
  }

  return {
    get size() {
      return people.size;
    },
    /** Moves everyone into a newly built world, each at their own door. */
    setWorld(nextWorld) {
      world = nextWorld;
      room = null;
      for (const person of people.values()) {
        world.scene.add(person.group);
        place(person);
      }
    },
    /** Takes everyone out of the current world first, so disposing it leaves them intact. */
    detach() {
      for (const person of people.values()) {
        leaveSeat(person);
        person.group.removeFromParent();
      }
    },
    /**
     * Everyone as plain facts, for saying where they are (zones.js): [{ id, name, state, x, z,
     * inDoor (door index or null), home (door index or null), seated, inRoom }].
     */
    snapshot() {
      return [...people.values()].map((person) => ({
        id: person.id,
        name: person.name,
        state: person.state,
        x: person.group.position.x,
        z: person.group.position.z,
        inDoor: person.inDoor?.index ?? null,
        home: person.home?.index ?? null,
        seated: !!person.seat && person.state === "sit",
        inRoom: !!person.space && person.space !== world,
      }));
    },
    /** The party, in order: [{ id, name, waiting }]. */
    party() {
      return party
        .map((id) => people.get(id))
        .filter(Boolean)
        .map((person) => ({
          id: person.id,
          name: person.name,
          waiting: !!person.waiting,
        }));
    },
    /** Whether `id` walks with the player. */
    inParty(id) {
      return party.includes(id);
    },
    /** `id` joins the party (true) or goes back to their own day (false). */
    setFollowing(id, following) {
      const person = people.get(id);
      if (!person) return;
      if (following && !party.includes(id)) party.push(id);
      if (!following && party.includes(id)) party.splice(party.indexOf(id), 1);
      person.following = following;
      person.waiting = null;
      leaveSeat(person);
      person.plan = [];
      person.next = null;
      if (person.state !== "talk") person.state = "idle";
      person.wait = following ? 0 : 1;
    },
    /** A follower waits where they stand (`wait` true) or comes along again. */
    setWaiting(id, wait) {
      const person = people.get(id);
      if (!person?.following) return;
      person.waiting = wait ? { x: person.group.position.x, z: person.group.position.z } : null;
      person.next = null;
    },
    /** Puts the party back together after a load: `ids` follow, starting near `at`. */
    restoreParty(ids, at) {
      for (const id of [...party]) this.setFollowing(id, false);
      for (const id of ids) {
        const person = people.get(id);
        if (!person || person.state === "inside") continue;
        this.setFollowing(id, true);
        person.group.position.set(at.x, groundY(person, at.x, at.z), at.z);
      }
    },
    /** Everyone inside `door`'s building, out of sight. */
    inside(door) {
      return [...people.values()].filter((person) => person.state === "inside" && person.inDoor?.index === door.index);
    },
    /** The player went into `door`'s building, whose room is `inside`: anyone in there shows up in it. */
    showRoom(door, inside) {
      room = { door, room: inside };
      for (const person of people.values()) {
        if (person.state === "inside" && person.inDoor?.index === door.index) enterRoom(person, false);
      }
    },
    /** The player left the building: anyone still in the room goes back out of sight inside it. */
    hideRoom() {
      if (!room) return;
      for (const person of people.values()) {
        if (person.space === room.room) {
          if (person.state === "talk") person.state = "idle";
          hide(person);
          person.leaving = false;
        }
      }
      room = null;
    },
    /** Makes the townsfolk exactly `characters` ([{ id, name }]), keeping anyone already here. */
    setCast(characters) {
      const wanted = new Map(characters.slice(0, MAX_PEOPLE).map((entry) => [entry.id, entry]));
      for (const id of [...people.keys()]) if (!wanted.has(id)) remove(id);
      for (const entry of wanted.values()) {
        const person = people.get(entry.id);
        if (!person) add(entry);
        else if ((entry.body ?? "auto") !== person.body) {
          // A new body choice: redress them (only matters without their own 3D model).
          person.body = entry.body ?? "auto";
          if (!person.hasModel && dressPeople) void loadModel(person);
        }
      }
    },
    /**
     * Moves everyone on by `dt`. `view`: { player (position), space (where the player is: the town or a
     * room), playerSitting, hour, time (seconds), isVisible(position), onFootstep(position, running, distance) }.
     */
    update(dt, view) {
      if (!world) return;
      clock = view.time;
      for (const person of people.values()) stepPerson(person, dt, view);
    },
    /** Keeps the player from walking through anyone in `space`. Mutates `position`. */
    pushOut(position, radius, space) {
      for (const person of people.values()) {
        if (person.space !== space || person.state === "inside") continue;
        const other = person.group.position;
        const dx = position.x - other.x;
        const dz = position.z - other.z;
        const distance = Math.hypot(dx, dz);
        const minimum = radius + BODY_RADIUS;
        if (distance > 0 && distance < minimum) {
          position.x = other.x + (dx / distance) * minimum;
          position.z = other.z + (dz / distance) * minimum;
        }
      }
    },
    /** Everyone in `space` (the town or the player's room), for talking to: [{ id, name, position, sitting }]. */
    present(space) {
      return [...people.values()]
        .filter((person) => person.space === space && person.state !== "inside")
        .map((person) => ({
          id: person.id,
          name: person.name,
          position: person.group.position,
          sitting: person.state === "sit",
        }));
    },
    /** Starts a conversation: they stop what they're doing (standing up if seated) and face the player. */
    beginTalk(id) {
      const person = people.get(id);
      if (!person || person.state === "inside" || !person.space) return null;
      if (person.state === "sit" && person.seat) {
        const { approach } = person.seat;
        person.group.position.set(approach.x, groundY(person, approach.x, approach.z), approach.z);
      }
      leaveSeat(person);
      person.plan = [];
      person.leaving = false;
      person.state = "talk";
      return person.group;
    },
    /** Whether they're speaking right now (they gesture while they do). */
    setSpeaking(id, speaking) {
      const person = people.get(id);
      if (person) person.speaking = speaking;
    },
    endTalk(id) {
      const person = people.get(id);
      if (!person || person.state !== "talk") return;
      person.state = "idle";
      person.speaking = false;
      person.wait = 2 + person.random() * 2;
    },
    setNamesVisible(visible) {
      namesVisible = visible;
      for (const person of people.values()) person.tag.visible = visible;
    },
    /** Whether people without a 3D model are dressed from the kit (true) or drawn simply (false). */
    setDressed(dressed) {
      if (dressed === dressPeople) return;
      dressPeople = dressed;
      for (const person of people.values()) {
        if (person.hasModel) continue;
        if (dressed) void loadModel(person);
        else setBody(person, createFigure(person.name));
      }
    },
    setShadows(visible) {
      shadowsVisible = visible;
      for (const person of people.values()) person.shadow.visible = visible;
    },
  };
}
