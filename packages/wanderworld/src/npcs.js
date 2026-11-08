// The townsfolk: characters the player picked, each living at a door in town. They wander near home,
// pause, and turn to face the player who comes close. Each walks in its own 3D model from 3D Avatars
// when it has one, and as a low-poly figure otherwise.
import { CanvasTexture, Group, LinearFilter, Sprite, SpriteMaterial } from "three";
import { createFigure } from "./character.js";
import { findModel, loadModelCharacter } from "./models.js";
import { hashString, heightAt, rng } from "./world.js";

export const MAX_PEOPLE = 12; // each model is several draw calls; a dozen keeps a phone smooth
const WANDER_RADIUS = 9;
const WALK_SPEED = 1.3; // an easy stroll
const BODY_RADIUS = 0.35;
const GREET_DISTANCE = 3;
const TAG_HEIGHT = 2.15;

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

function approachAngle(current, target, amount) {
  const difference = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + difference * Math.min(1, amount);
}

export function createCrowd() {
  const people = new Map();
  let world = null;

  /** Townsfolk live in the houses nearest the plaza, so the player meets them soon after arriving. */
  const NEAR_DOORS = 16;
  function place(person) {
    const doors = [...(world?.doors ?? [])].sort((a, b) => Math.hypot(a.x, a.z) - Math.hypot(b.x, b.z));
    const near = doors.slice(0, NEAR_DOORS);
    const door = near.length ? near[hashString(person.id) % near.length] : { x: 0, z: 0 };
    person.home = door;
    person.group.position.set(door.x, heightAt(door.x, door.z), door.z);
    person.target = null;
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
      home: { x: 0, z: 0 },
      target: null,
      wait: 0,
      stuck: 0,
      random: rng(hashString(`npc:${id}`)),
      tag: nameTag(name),
    };
    person.group.add(person.tag);
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
    people.delete(id);
    person.group.removeFromParent();
    person.character?.dispose();
    person.tag.material.map.dispose();
    person.tag.material.dispose();
  }

  function stepPerson(person, dt, player) {
    const position = person.group.position;
    const startX = position.x;
    const startZ = position.z;
    const toPlayerX = player.x - position.x;
    const toPlayerZ = player.z - position.z;
    if (Math.hypot(toPlayerX, toPlayerZ) < GREET_DISTANCE) {
      // Someone came to talk: stop and face them.
      person.group.rotation.y = approachAngle(person.group.rotation.y, Math.atan2(toPlayerX, toPlayerZ), 6 * dt);
    } else if (person.wait > 0) {
      person.wait -= dt;
    } else if (!person.target) {
      const angle = person.random() * Math.PI * 2;
      const reach = 2 + person.random() * WANDER_RADIUS;
      const x = person.home.x + Math.cos(angle) * reach;
      const z = person.home.z + Math.sin(angle) * reach;
      if (!world.blocked(x, z)) person.target = { x, z };
    } else {
      const dx = person.target.x - position.x;
      const dz = person.target.z - position.z;
      const distance = Math.hypot(dx, dz);
      if (distance < 0.4) {
        person.target = null;
        person.wait = 2 + person.random() * 5;
      } else {
        const stride = Math.min(distance, WALK_SPEED * dt);
        position.x += (dx / distance) * stride;
        position.z += (dz / distance) * stride;
        world.resolveCollisions(position, BODY_RADIUS);
        person.group.rotation.y = approachAngle(person.group.rotation.y, Math.atan2(dx, dz), 8 * dt);
      }
    }
    const moved = Math.hypot(position.x - startX, position.z - startZ);
    // Walking into a wall for a second means the spot can't be reached: try somewhere else.
    if (person.target && moved < WALK_SPEED * dt * 0.2) {
      person.stuck += dt;
      if (person.stuck > 1) {
        person.target = null;
        person.stuck = 0;
      }
    } else {
      person.stuck = 0;
    }
    position.y = heightAt(position.x, position.z);
    person.character.update(dt, dt > 0 ? moved / dt : 0);
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
      for (const person of people.values()) person.group.removeFromParent();
    },
    /** Makes the townsfolk exactly `characters` ([{ id, name }]), keeping anyone already here. */
    setCast(characters) {
      const wanted = new Map(characters.slice(0, MAX_PEOPLE).map((entry) => [entry.id, entry]));
      for (const id of [...people.keys()]) if (!wanted.has(id)) remove(id);
      for (const entry of wanted.values()) if (!people.has(entry.id)) add(entry);
    },
    update(dt, player) {
      if (!world) return;
      for (const person of people.values()) stepPerson(person, dt, player);
    },
    /** Keeps the player from walking through anyone. Mutates `position`. */
    pushOut(position, radius) {
      for (const person of people.values()) {
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
  };
}
