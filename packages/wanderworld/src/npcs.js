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
import { tagColourOf } from "./relationships.js";
import { fill, greetingFor, moodOf, pickExchange } from "./dialogue.js";
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
// Getting on with each other (relationships.js): who seeks out whom, who keeps away.
const SOCIAL_SEARCH = 35; // metres within which someone looks for company
const SOCIAL_CHANCE = 0.35; // of a new plan being to see someone
const CHAT_SECONDS = [10, 22];
const TOGETHER = 0.45; // warmth at which two who've chatted go and sit or walk together
const AVOID_DISTANCE = 7; // metres: someone they dislike this close, they move off
const AVOID_WARMTH = -0.3;
const GREET_DISTANCE = 9; // metres: someone fond of the player comes over to say hello
const GREET_WARMTH = 0.35;
const GREET_AGAIN = 150; // seconds
const HOSTILE_WARMTH = -0.85; // a sworn enemy confronts the player
const BUBBLE_DISTANCE = 18; // metres from the player within which townsfolk's chatter shows
/** What someone says as they move off from a person they dislike (conversations are in dialogue.js). */
const COLD_REMARKS = ["Hmph.", "Oh. It's you.", "Can't stop, sorry."];
const NIGHT_FROM = 21;
const NIGHT_TO = 6.5;

/** A name floating over someone's head; `sprite.paint(colour)` redraws its box in a colour. */
function nameTag(name) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const font = "600 30px system-ui, sans-serif";
  context.font = font;
  const width = Math.ceil(context.measureText(name).width) + 28;
  canvas.width = width;
  canvas.height = 48;
  const paint = (colour) => {
    context.clearRect(0, 0, width, 48);
    context.font = font;
    context.fillStyle = colour;
    context.beginPath();
    context.roundRect(0, 0, width, 48, 14);
    context.fill();
    context.fillStyle = "#f3f5f7";
    context.textBaseline = "middle";
    context.fillText(name, 14, 25);
  };
  paint(tagColourOf(null));
  const texture = new CanvasTexture(canvas);
  texture.minFilter = LinearFilter;
  const sprite = new Sprite(new SpriteMaterial({ map: texture, depthWrite: false, transparent: true }));
  sprite.scale.set((width / 48) * 0.32, 0.32, 1);
  sprite.position.y = TAG_HEIGHT;
  sprite.renderOrder = 10;
  sprite.paint = (colour) => {
    paint(colour);
    texture.needsUpdate = true;
  };
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
  let viewNow = null; // the last frame's view, for steps that speak
  // How one person sees another (relationships.js feeling()): { kind, level, warmth }. "player" is the
  // persona being played. Until a world gives one, everyone is a neighbour.
  let feeling = () => ({ kind: "acquaintance", level: 20, warmth: 0.12 });
  // Each person's temperament (relationships.js): aggression and sociability, 0–100.
  let traitsOf = () => ({ aggression: 50, sociability: 50 });
  let lastApproach = -Infinity; // when someone last set off to come up to the player
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
      partner: null, // the person they're chatting with, or meeting, or sitting or walking alongside
      chatUntil: 0,
      nextLine: 0, // when they next say something in a chat
      socialUntil: 0, // no seeking company again before this
      greetedAt: -Infinity, // when they last came over to greet the player
      watchAt: 0, // when they next look round for people to greet or avoid
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
    if (
      clock > person.socialUntil &&
      // a shy person seeks company half as often as most, an outgoing one half as often again
      person.random() < SOCIAL_CHANCE * (0.5 + traitsOf(person.id).sociability / 100) * (1 + warmestFriend(person)) &&
      seekCompany(person)
    )
      return;
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

  // ── Company ──

  /** Whether someone is free to be sought out: out in town, not busy with the player or anyone else. */
  const available = (other) =>
    other.space === world && !other.following && !other.partner && (other.state === "idle" || other.state === "walk");

  /**
   * Looks for someone to see, warmer company more likely: walks over to them (they wait), and they chat.
   * Returns true when a plan was made.
   */
  function seekCompany(person) {
    const here = person.group.position;
    const choices = [];
    let total = 0;
    for (const other of people.values()) {
      const seated =
        other.state === "sit" && other.seat && !other.together && other.space === world && clock > person.restUntil;
      if (other === person || (!available(other) && !seated)) continue;
      const distance = Math.hypot(other.group.position.x - here.x, other.group.position.z - here.z);
      const warmth = feeling(person.id, other.id).warmth;
      // Friends look further for each other, and much prefer each other's company to a passing neighbour's.
      if (distance > SOCIAL_SEARCH * (1 + 3 * Math.max(0, warmth))) continue; // a best friend: across town
      const weight = Math.max(0, warmth + 0.12) ** 2;
      if (weight <= 0) continue;
      choices.push([other, weight]);
      total += weight;
    }
    if (!choices.length) return false;
    let at = person.random() * total;
    const [other] = choices.find(([, weight]) => (at -= weight) <= 0) ?? choices[0];
    if (other.state === "sit") {
      // Sitting: join them on their bench, when the seat beside them is free.
      const index = world.seats.indexOf(other.seat);
      const beside = world.seats[index ^ 1];
      if (!beside || beside.taken) return false;
      takeSeat(person, beside, Math.max(10, other.wait));
      person.together = other;
      other.together = person;
      person.socialUntil = clock + 60 + person.random() * 60;
      return true;
    }
    // They wait where they are, turned to the one coming over.
    person.partner = other;
    other.partner = person;
    other.plan = [{ wait: 40 }];
    other.state = "idle";
    other.wait = 40;
    leaveSeat(other);
    const there = other.group.position;
    const away = Math.hypot(here.x - there.x, here.z - there.z) || 1;
    person.plan = [
      {
        walk: { x: there.x + ((here.x - there.x) / away) * 1.15, z: there.z + ((here.z - there.z) / away) * 1.15 },
        direct: away < 14, // close by: straight over; further: by the streets
      },
      { chat: other },
    ];
    person.socialUntil = clock + 60 + person.random() * 60;
    return true;
  }

  /** How warm someone is toward the person they like best in town (0 when there's nobody special). */
  function warmestFriend(person) {
    let best = 0;
    for (const other of people.values())
      if (other !== person) best = Math.max(best, feeling(person.id, other.id).warmth);
    return best;
  }

  /** Two people stop and chat for a while, facing each other, taking turns to speak. */
  function startChat(person, other) {
    const seconds = CHAT_SECONDS[0] + person.random() * (CHAT_SECONDS[1] - CHAT_SECONDS[0]);
    for (const [a, b] of [
      [person, other],
      [other, person],
    ]) {
      a.partner = b;
      a.state = "chat";
      a.plan = [];
      a.chatUntil = clock + seconds;
      a.nextLine = clock + (a === person ? 0.3 : 2.2);
      a.speaking = false;
    }
  }

  /** A chat has ended: warm company goes on together (to a bench, or a stroll); the rest part ways. */
  function endChat(person) {
    const other = person.partner;
    for (const who of [person, other]) {
      if (!who) continue;
      const chatting = who.state === "chat";
      who.partner = null;
      who.speaking = false;
      if (!chatting) continue; // gone indoors or off with someone else: leave them to it
      who.state = "idle";
      who.wait = 0.5 + who.random();
      // A word with a neighbour leaves them free to look for a friend soon; time with a friend lasts.
      const fond =
        other && who === person ? feeling(person.id, other.id).warmth : other ? feeling(other.id, person.id).warmth : 0;
      who.socialUntil = clock + (fond > 0.3 ? 60 + who.random() * 90 : 15 + who.random() * 20);
    }
    if (!other || person.space !== world) return;
    const warmth = Math.min(feeling(person.id, other.id).warmth, feeling(other.id, person.id).warmth);
    if (warmth < TOGETHER || person.random() < 0.3) return;
    // Two seats side by side on one bench (each bench's two seats sit next to each other in the list).
    const benches = [];
    for (let i = 0; i + 1 < world.seats.length; i += 2) {
      const [a, b] = [world.seats[i], world.seats[i + 1]];
      if (a.taken || b.taken) continue;
      const distance = Math.hypot(a.x - person.group.position.x, a.z - person.group.position.z);
      if (distance < SEAT_SEARCH) benches.push([distance, a, b]);
    }
    benches.sort((p1, p2) => p1[0] - p2[0]);
    const seconds = 30 + person.random() * 40;
    if (benches.length && person.random() < 0.6) {
      const [, a, b] = benches[0];
      takeSeat(person, a, seconds);
      takeSeat(other, b, seconds);
    } else {
      // A stroll side by side to a spot nearby.
      const angle = person.random() * Math.PI * 2;
      const spot = {
        x: person.group.position.x + Math.cos(angle) * 10,
        z: person.group.position.z + Math.sin(angle) * 10,
      };
      if (world.blocked(spot.x, spot.z)) return;
      const side = { x: -Math.sin(angle) * 0.9, z: Math.cos(angle) * 0.9 };
      person.plan = [{ walk: spot }, { wait: 4 }];
      other.plan = [{ walk: { x: spot.x + side.x, z: spot.z + side.z } }, { wait: 4 }];
    }
    person.together = other;
    other.together = person;
  }

  /** Something to say in a chat with `other`, by how they feel about each other. */
  /** How many are coming up to the player (or just have): greeting, confronting, or in the last 10 s. */
  function approachers() {
    let count = 0;
    for (const other of people.values()) {
      if (other.greeting || (other.confronting && clock < other.confronting) || clock - other.greetedAt < 10) count++;
    }
    return count;
  }

  /**
   * Two people's conversation (dialogue.js): a whole exchange, taking turns, the one who began first;
   * when it's done, the next to speak begins another. Returns whether it's `person`'s turn to speak.
   */
  function conversationOf(person, other) {
    let talk = person.conversation;
    // A new exchange when there's none between them, the last one is over, or it went quiet a while ago.
    if (!talk || talk !== other.conversation || talk.at >= talk.lines.length || clock - talk.lastAt > 25) {
      const first = talk && talk === other.conversation ? (talk.at % 2 ? talk.second : talk.first) : person;
      const second = first === person ? other : person;
      const lines = pickExchange(moodOf(feeling(first.id, second.id)), first.random);
      talk = { lines, at: 0, first, second, lastAt: clock };
      person.conversation = other.conversation = talk;
    }
    return talk;
  }
  const turnOf = (person, other) => {
    const talk = conversationOf(person, other);
    return (talk.at % 2 ? talk.second : talk.first) === person;
  };
  /** `person`'s next line in their conversation with `other` (it must be their turn). */
  function chatLine(person, other) {
    const talk = conversationOf(person, other);
    const line = talk.lines[talk.at++];
    talk.lastAt = clock;
    return fill(line, {
      A: talk.first.name,
      B: talk.second.name,
      greeting: greetingFor(viewNow?.hour ?? 12),
    });
  }

  /**
   * Keeping away from people they dislike or fear (and the player, when that's who), and coming over to
   * greet a player they're fond of. Checked about once a second while they're out and about.
   */
  function watchOthers(person, view, playerDistance) {
    if (clock < person.watchAt || person.space !== world || person.following) return false;
    person.watchAt = clock + 0.8 + person.random() * 0.4; // about once a second, whatever the frame rate
    const here = person.group.position;
    const flee = (from) => {
      const dx = here.x - from.x;
      const dz = here.z - from.z;
      const away = Math.hypot(dx, dz) || 1;
      const spot = { x: here.x + (dx / away) * 12, z: here.z + (dz / away) * 12 };
      if (world.blocked(spot.x, spot.z)) return false;
      if (person.state === "sit" && person.seat) {
        const { approach } = person.seat;
        person.group.position.set(approach.x, groundY(person, approach.x, approach.z), approach.z);
      }
      leaveSeat(person);
      person.together = null;
      person.plan = [{ walk: spot, direct: true }, { wait: 3 }];
      person.state = "idle";
      person.wait = 0;
      return true;
    };
    // The player first. (Hostility toward the player comes before any company; the rest waits for it.)
    if (Number.isFinite(playerDistance)) {
      const toPlayer = feeling(person.id, "player");
      // Temperament moves the lines: an aggressive person comes at someone they merely dislike, a passive
      // one never does (keeping away instead); an outgoing one greets acquaintances from further off.
      const traits = traitsOf(person.id);
      const aggression = traits.aggression / 100;
      const sociability = traits.sociability / 100;
      const hostileAt = HOSTILE_WARMTH + (aggression - 0.5); // −0.35 (aggressive) … −1.35 (passive: never)
      const allowed = view.aggressionAllowed ? view.aggressionAllowed(view.player.x, view.player.z) : true;
      // How often people come up to the player (Settings: 0 never … 2 twice as often), and how many at once.
      const approach = view.approach ?? 1;
      const room = approach > 0 && approachers() < (view.approachMax ?? 2) && clock - lastApproach > 20 / approach;
      if (
        room &&
        allowed &&
        toPlayer.warmth <= hostileAt &&
        playerDistance < GREET_DISTANCE * 1.5 &&
        clock - person.greetedAt > 40
      ) {
        // A sworn enemy marches up to have it out (a fight, once there's combat), dropping whatever else.
        person.greetedAt = clock;
        lastApproach = clock;
        if (person.partner?.partner === person) person.partner.partner = null;
        person.partner = null;
        leaveSeat(person);
        person.plan = [{ walk: towardSpot(here, view.player, 2.4), direct: true }, { confront: true }];
        person.state = "idle";
        person.wait = 0;
        return true;
      }
      if (person.partner) return false; // busy with someone: greeting and keeping away wait
      // Keeping away from a player they dislike (a sworn enemy doesn't back off: it comes at them).
      const dislikes = toPlayer.warmth < AVOID_WARMTH && (toPlayer.warmth > hostileAt || !allowed);
      if (dislikes && playerDistance < AVOID_DISTANCE && person.state !== "sit") {
        if (flee(view.player)) {
          if (person.random() < 0.5) say(person, view, COLD_REMARKS[Math.floor(person.random() * COLD_REMARKS.length)]);
          return true;
        }
      }
      if (
        room &&
        toPlayer.warmth >= GREET_WARMTH - 0.3 * (sociability - 0.5) &&
        playerDistance < GREET_DISTANCE * (0.6 + 0.8 * sociability) &&
        playerDistance > STOP_DISTANCE + 0.5 &&
        clock - person.greetedAt > GREET_AGAIN / approach &&
        person.state !== "sit"
      ) {
        person.greetedAt = clock;
        lastApproach = clock;
        person.plan = [{ walk: towardSpot(here, view.player, 1.8), direct: true }, { greet: true }];
        person.greeting = true; // walking over: not stopping short when the player is close
        person.state = "idle";
        person.wait = 0;
        return true;
      }
    }
    if (person.partner) return false;
    // Then anyone else nearby they'd rather not be near.
    for (const other of people.values()) {
      if (other === person || other.space !== world || other.state === "inside") continue;
      const distance = Math.hypot(other.group.position.x - here.x, other.group.position.z - here.z);
      if (distance > AVOID_DISTANCE) continue;
      if (feeling(person.id, other.id).warmth < AVOID_WARMTH) return flee(other.group.position); // up off a bench too
    }
    return false;
  }

  /** A spot `gap` metres short of `target`, on the way from `from`. */
  function towardSpot(from, target, gap) {
    const dx = from.x - target.x;
    const dz = from.z - target.z;
    const away = Math.hypot(dx, dz) || 1;
    return { x: target.x + (dx / away) * gap, z: target.z + (dz / away) * gap };
  }

  /** A speech bubble over someone, when they're near enough to the player to be seen saying it. */
  function say(person, view, text) {
    if (!view.onSay) return;
    const distance = Math.hypot(person.group.position.x - view.player.x, person.group.position.z - view.player.z);
    if (person.space === view.space && distance < BUBBLE_DISTANCE) view.onSay(person.group, text);
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
      // Straight (a doorstep, no collisions) or direct (a short way to someone: straight at them, stepping
      // round what's in the way) skip the street points.
      person.next = step.straight || step.direct ? step.walk : nextPoint(person, step.walk);
      person.stuck = 0;
      person.tries = 0;
      person.detour = null;
    } else if (step.chat) {
      // Arrived: if they're still waiting, chat; if not, never mind.
      if (step.chat.partner === person && step.chat.space === world) startChat(person, step.chat);
      else {
        person.partner = null;
        person.state = "idle";
        person.wait = 0.5;
      }
    } else if (step.greet) {
      person.greeting = false;
      person.state = "idle";
      person.wait = 3;
      person.lastWave = -Infinity; // a wave as they say hello
      say(person, viewNow, `Hey, ${viewNow?.playerName ?? "you"}!`);
    } else if (step.confront) {
      person.state = "idle";
      person.wait = 6;
      person.confronting = clock + 6;
      say(person, viewNow, "You! You've got some nerve showing your face here.");
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
    const near =
      playerDistance < STOP_DISTANCE &&
      !view.playerSitting &&
      !person.leaving &&
      !person.greeting &&
      feeling(person.id, "player").warmth >= AVOID_WARMTH;
    const space = person.space;

    if (person.state !== "talk" && person.state !== "chat" && watchOthers(person, view, playerDistance)) {
      // A new plan to greet, keep away or confront: it starts on the next step below.
    }
    if (person.state === "talk") {
      person.group.rotation.y = approachAngle(person.group.rotation.y, towardPlayer, 6 * dt);
    } else if (person.state === "chat") {
      // Chatting: facing each other, taking turns to say something.
      const other = person.partner;
      if (!other || other.partner !== person || other.space !== person.space || clock > person.chatUntil) {
        endChat(person);
      } else {
        const op = other.group.position;
        person.group.rotation.y = approachAngle(
          person.group.rotation.y,
          Math.atan2(op.x - position.x, op.z - position.z),
          6 * dt,
        );
        if (clock > person.nextLine && turnOf(person, other)) {
          person.speaking = true;
          other.speaking = false;
          person.nextLine = clock + 3 + person.random() * 2;
          other.nextLine = Math.max(other.nextLine, clock + 2.6);
          say(person, view, chatLine(person, other));
        }
      }
    } else if (
      person.partner &&
      person.partner.partner === person &&
      person.partner.state === "walk" &&
      person.state === "idle"
    ) {
      // Waiting for someone coming over: turned to them.
      const op = person.partner.group.position;
      person.group.rotation.y = approachAngle(
        person.group.rotation.y,
        Math.atan2(op.x - position.x, op.z - position.z),
        4 * dt,
      );
      person.wait -= dt;
      if (person.wait <= 0) person.partner = null;
    } else if (person.confronting && clock < person.confronting) {
      // Squaring up to the player.
      person.group.rotation.y = approachAngle(person.group.rotation.y, towardPlayer, 6 * dt);
    } else if (person.following) {
      if (follow(person, dt, view, playerDistance)) return;
    } else if (person.state === "sit") {
      person.wait -= dt;
      const beside = person.together;
      if (beside && beside.state === "sit" && clock > person.nextLine) {
        // Sitting together: talking a while, then quiet for a while.
        const quiet = person.conversation?.at >= person.conversation?.lines.length && person.random() < 0.6;
        person.nextLine = clock + (quiet ? 10 + person.random() * 10 : 3 + person.random() * 2);
        person.speaking = !quiet && turnOf(person, beside);
        if (person.speaking) {
          say(person, view, chatLine(person, beside));
          beside.nextLine = Math.max(beside.nextLine, clock + 2.6);
        }
      }
      if (person.wait <= 0 || (space === world && isNight(view.hour))) {
        const seat = person.seat;
        leaveSeat(person);
        person.together = null;
        person.speaking = false;
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
      talk: (person.state === "talk" || person.state === "chat" || person.state === "sit") && person.speaking,
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
        with:
          person.state === "chat"
            ? (person.partner?.name ?? null)
            : person.state === "sit" && person.together?.state === "sit"
              ? person.together.name
              : null,
        inRoom: !!person.space && person.space !== world,
      }));
    },
    /** Each person's temperament: `fn(id)` → { aggression, sociability } (0–100). */
    setTraits(fn) {
      traitsOf = fn;
    },
    /** How people see each other: `fn(fromId, toId)` → { kind, level, warmth } ("player" is the persona). */
    setRelations(fn) {
      feeling = fn;
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
      if (person.state !== "talk" && person.state !== "inside") person.state = "idle";
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
      viewNow = view;
      for (const person of people.values()) {
        stepPerson(person, dt, view);
        // The name tag's colour: how they see the player (checked now and then; redrawn when it changes).
        if (clock > (person.tagAt ?? 0)) {
          person.tagAt = clock + 0.6;
          const toPlayer = feeling(person.id, "player");
          const colour = tagColourOf(toPlayer.kind, toPlayer.level);
          if (colour !== person.tagColour) {
            person.tagColour = colour;
            person.tag.paint(colour);
          }
        }
      }
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
