// The townsfolk: characters the player picked, each living behind a door in town. Through the day they
// wander near home, sit on benches, and pop in and out of their houses; at night they go home. They look
// at the player who comes near, wave hello, and stop to talk. Each walks in its own 3D Avatars model when
// it has one, and as the built-in person otherwise.
import { CanvasTexture, Group, LinearFilter, Sprite, SpriteMaterial } from "three";
import { blobShadow } from "./character.js";
import { createFigure } from "./figure.js";
import { findModel, loadModelCharacter } from "./models.js";
import { hashString, heightAt, rng } from "./world.js";

export const MAX_PEOPLE = 12; // each model is several draw calls; a dozen keeps a phone smooth
const WANDER_RADIUS = 9;
const SEAT_SEARCH = 30; // metres from home a free bench may be
const WALK_SPEED = 1.3; // an easy stroll
const BODY_RADIUS = 0.35;
const STOP_DISTANCE = 2.2; // the player this close: stop and face them
const LOOK_DISTANCE = 6; // and this close: turn the head to them
const WAVE_DISTANCE = 4.5;
const WAVE_AGAIN = 40; // seconds before waving at the player again
const TAG_HEIGHT = 2.15;
const NEAR = 30; // metres within which a visible person animates every frame
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

export function createCrowd() {
  const people = new Map();
  let world = null;
  let namesVisible = true;
  let shadowsVisible = true;

  /** Townsfolk live in the houses nearest the plaza, so the player meets them soon after arriving. */
  const NEAR_DOORS = 16;
  function place(person) {
    const doors = [...(world?.doors ?? [])].sort((a, b) => Math.hypot(a.x, a.z) - Math.hypot(b.x, b.z));
    const near = doors.slice(0, NEAR_DOORS);
    person.home = near.length ? near[hashString(person.id) % near.length] : null;
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
    if (!model || !people.has(person.id)) return;
    try {
      const character = await loadModelCharacter(model);
      if (people.get(person.id) !== person) {
        character.dispose();
        return;
      }
      setBody(person, character);
    } catch (error) {
      console.warn(`[wanderworld] ${person.name}'s model failed to load`, error);
    }
  }

  function add({ id, name }) {
    const person = {
      id,
      name,
      group: new Group(),
      character: null,
      home: null,
      state: "idle", // idle | walk | sit | inside | talk
      plan: [], // steps still to do: { walk: {x, z} } | { door: open/shut } | { hide } | { show } | { sit } | { wait }
      target: null,
      wait: 0,
      stuck: 0,
      seat: null,
      lastWave: -Infinity,
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

  // ── Plans: what someone does next ──

  function freeSeatNear(person) {
    const home = person.home ?? { x: 0, z: 0 };
    const free = (world?.seats ?? []).filter(
      (seat) => !seat.taken && Math.hypot(seat.x - home.x, seat.z - home.z) < SEAT_SEARCH,
    );
    return free.length ? free[Math.floor(person.random() * free.length)] : null;
  }

  function goInside(person, minutes) {
    const door = person.home;
    if (!door) return;
    person.plan = [
      { walk: { x: door.x, z: door.z } },
      { door: true },
      { wait: 0.7 },
      { walk: door.step },
      { hide: minutes },
    ];
  }

  function nextPlan(person, hour) {
    if (isNight(hour) && person.home) return goInside(person, Infinity);
    const roll = person.random();
    if (roll < 0.25) {
      const seat = freeSeatNear(person);
      if (seat) {
        seat.taken = person.id;
        person.seat = seat;
        person.plan = [{ walk: seat.approach }, { sit: 8 + person.random() * 14 }];
        return;
      }
    }
    if (roll < 0.37 && person.home) return goInside(person, 10 + person.random() * 20);
    const home = person.home ?? { x: 0, z: 0 };
    for (let tries = 0; tries < 6; tries++) {
      const angle = person.random() * Math.PI * 2;
      const reach = 2 + person.random() * WANDER_RADIUS;
      const x = home.x + Math.cos(angle) * reach;
      const z = home.z + Math.sin(angle) * reach;
      if (!world.blocked(x, z)) {
        person.plan = [{ walk: { x, z } }, { wait: 2 + person.random() * 5 }];
        return;
      }
    }
    person.plan = [{ wait: 1 }];
  }

  /** Starts the next step of someone's plan. */
  function startStep(person, hour) {
    if (!person.plan.length) nextPlan(person, hour);
    const step = person.plan.shift();
    if (!step) return;
    const door = person.home;
    if (step.walk) {
      person.state = "walk";
      person.target = step.walk;
      person.stuck = 0;
      person.tries = 0;
      person.detour = null;
    } else if (step.door !== undefined) {
      if (door) world.setDoor(door.index, step.door, step.door ? 3 : 0);
      person.state = "idle";
      person.wait = 0;
    } else if (step.hide !== undefined) {
      person.group.visible = false;
      person.state = "inside";
      person.wait = step.hide;
    } else if (step.sit !== undefined) {
      const seat = person.seat;
      if (!seat) return;
      person.group.position.set(seat.x, heightAt(seat.x, seat.z), seat.z);
      person.group.rotation.y = seat.angle;
      person.state = "sit";
      person.wait = step.sit;
    } else {
      person.state = "idle";
      person.wait = step.wait ?? 1;
    }
  }

  /** Comes back out of the house, through the door. */
  function comeOut(person) {
    const door = person.home;
    person.group.position.set(door.step.x, heightAt(door.step.x, door.step.z), door.step.z);
    person.group.rotation.y = door.angle;
    person.group.visible = true;
    world.setDoor(door.index, true, 2.5);
    person.plan = [{ wait: 0.6 }, { walk: { x: door.x, z: door.z } }];
    person.state = "idle";
    person.wait = 0;
  }

  function stepPerson(person, dt, view) {
    const position = person.group.position;
    const startX = position.x;
    const startZ = position.z;
    const player = view.player;
    const toPlayerX = player.x - position.x;
    const toPlayerZ = player.z - position.z;
    const playerDistance = Math.hypot(toPlayerX, toPlayerZ);
    const towardPlayer = Math.atan2(toPlayerX, toPlayerZ);
    const near = person.state !== "inside" && playerDistance < STOP_DISTANCE && !view.playerSitting;

    if (person.state === "talk") {
      person.group.rotation.y = approachAngle(person.group.rotation.y, towardPlayer, 6 * dt);
    } else if (person.state === "inside") {
      person.wait -= dt;
      const morning = !isNight(view.hour);
      if ((person.wait <= 0 && Number.isFinite(person.wait)) || (!Number.isFinite(person.wait) && morning)) {
        comeOut(person);
      }
    } else if (person.state === "sit") {
      person.wait -= dt;
      if (person.wait <= 0 || isNight(view.hour)) {
        const seat = person.seat;
        leaveSeat(person);
        if (seat) position.set(seat.approach.x, heightAt(seat.approach.x, seat.approach.z), seat.approach.z);
        person.state = "idle";
        person.wait = 0.4;
      }
    } else if (near) {
      // Someone came up to them: stop and face them.
      person.group.rotation.y = approachAngle(person.group.rotation.y, towardPlayer, 6 * dt);
    } else if (person.state === "walk") {
      const dx = person.target.x - position.x;
      const dz = person.target.z - position.z;
      const distance = Math.hypot(dx, dz);
      if (distance < 0.35) {
        person.state = "idle";
        person.wait = 0;
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
        world.resolveCollisions(position, BODY_RADIUS);
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
        // Still blocked after a few side steps: the spot can't be reached, so give up on the plan.
        if (person.tries > 4) {
          leaveSeat(person);
          person.plan = [];
          person.state = "idle";
          person.wait = 0.5;
          person.tries = 0;
          person.detour = null;
        }
      }
    } else {
      person.wait -= dt;
      if (person.wait <= 0) startStep(person, view.hour);
    }
    if (person.state === "inside") return;
    position.y = heightAt(position.x, position.z);

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
    const visible = view.isVisible(position);
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
    /** Makes the townsfolk exactly `characters` ([{ id, name }]), keeping anyone already here. */
    setCast(characters) {
      const wanted = new Map(characters.slice(0, MAX_PEOPLE).map((entry) => [entry.id, entry]));
      for (const id of [...people.keys()]) if (!wanted.has(id)) remove(id);
      for (const entry of wanted.values()) if (!people.has(entry.id)) add(entry);
    },
    /**
     * Moves everyone on by `dt`. `view`: { player (position), playerSitting, hour, time (seconds),
     * isVisible(position), onFootstep(position, running, distance) }.
     */
    update(dt, view) {
      if (!world) return;
      for (const person of people.values()) stepPerson(person, dt, view);
    },
    /** Keeps the player from walking through anyone. Mutates `position`. */
    pushOut(position, radius) {
      for (const person of people.values()) {
        if (person.state === "inside") continue;
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
    /** Everyone out and about, for talking to: [{ id, name, position, sitting }]. */
    present() {
      return [...people.values()]
        .filter((person) => person.state !== "inside")
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
      if (!person || person.state === "inside") return null;
      if (person.state === "sit" && person.seat) {
        const { approach } = person.seat;
        person.group.position.set(approach.x, heightAt(approach.x, approach.z), approach.z);
      }
      leaveSeat(person);
      person.plan = [];
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
    /** The head height of someone, for speech bubbles: their group and a height. */
    anchor(id) {
      return people.get(id)?.group ?? null;
    },
    setNamesVisible(visible) {
      namesVisible = visible;
      for (const person of people.values()) person.tag.visible = visible;
    },
    setShadows(visible) {
      shadowsVisible = visible;
      for (const person of people.values()) person.shadow.visible = visible;
    },
  };
}
