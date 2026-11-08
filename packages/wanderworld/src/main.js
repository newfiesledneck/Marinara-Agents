// Wanderworld: a Home screen game that draws a low-poly three.js town and walks your persona around it.
//
// The Engine mounts this element once, with view="browser", as the package's Home tab. The canvas, the
// HUD and the touch stick all live inside it. The renderer is created once per page and reused when the
// tab is closed and reopened, so switching tabs never piles up WebGL contexts.
//
// The player is in one of four modes: walking, sitting (on a bench or chair), talking (to a townsperson)
// or going through a door. "Space" is wherever they are: the town, or the room inside a building; both
// offer the same collision, camera and seat calls.
import { Frustum, Group, Matrix4, PerspectiveCamera, Plane, Raycaster, Vector2, Vector3, WebGLRenderer } from "three";
import { blobShadow, listCharacters, listPersonas, setAnimationStyle } from "./character.js";
import { createFigure } from "./figure.js";
import { createHud } from "./hud.js";
import { createInput } from "./input.js";
import { createInterior } from "./interiors.js";
import { findModel, loadModelCharacter } from "./models.js";
import { createPerson } from "./people.js";
import { approachAngle, createCrowd, MAX_PEOPLE } from "./npcs.js";
import { checkSetting, loadSettings, saveSettings } from "./settings.js";
import { createSound } from "./sound.js";
import { createTalk } from "./talk.js";
import { HOUSE_PIECES } from "./houses.js";
import { kitModels, kitTexture } from "./kit.js";
import { createWorld, hashString, heightAt, NATURE_MODELS, SPAWN, TOWN_PROPS, WORLD_SIZE } from "./world.js";

const PACKAGE_ID = "wanderworld";
const TAG = `marinara-capability-${PACKAGE_ID}`;
const FIRST_SEED = "wanderworld";
const WALK_SPEED = 1.4; // metres per second: a natural walking pace (times the walk speed setting)
const RUN_SPEED = 5; // with Shift
const CAMERA_DISTANCE = 8; // the starting zoom
const CAMERA_HEIGHT = 4.2; // the starting height, which sets the starting tilt
const MIN_ZOOM = 2.5;
const MAX_ZOOM = 18;
const INSIDE_ZOOM = 7; // rooms are small: the camera stays closer indoors
const KEY_ZOOM_RATE = 1; // how fast + and - zoom, per second
const LOOK_HEIGHT = 1.4;
const MIN_CAMERA_DISTANCE = 2;
const START_PITCH = Math.atan2(CAMERA_HEIGHT - LOOK_HEIGHT, CAMERA_DISTANCE); // about 19° above the player
const MIN_PITCH = -0.35; // the camera below head height, looking up at towers and spires
const MAX_PITCH = 1.25; // nearly overhead
const YAW_KEY_SPEED = 1.8; // radians per second with the arrow keys
const PITCH_KEY_SPEED = 1.1;
const DRAG_YAW = 0.006; // radians per pixel dragged
const DRAG_PITCH = 0.005;
const CLICK_SLOP = 5; // pixels a press may move and still be a click, not a drag
const CAMERA_FOLLOW = 12; // how quickly the camera catches up (higher is snappier)
/** Presses on these never start a camera drag: they're the HUD's own controls. */
const UI_SELECTOR = "button, select, input, label, textarea, form, [data-wanderworld-ui]";
const PERSONA_KEY = "wanderworld.persona"; // this package's own browser storage keys
const CAST_KEY = "wanderworld.cast";
const PLACE_KEY = "wanderworld.place";
const BODIES_KEY = "wanderworld.bodies"; // { [character or persona id]: "male" | "female" }
const PLAYER_RADIUS = 0.35;
const STATS_INTERVAL_MS = 500;
const NO_INPUT = { x: 0, y: 0, amount: 0, run: false, yaw: 0, pitch: 0, zoom: 0 };
/** "Auto" resolution aims for about this many pixels (1080p), then lowers it if frames drop. */
const AUTO_PIXELS = 1920 * 1080;
const DAY_SECONDS = 20 * 60; // a whole day in town takes 20 minutes
const START_HOUR = 9;
const USE_RANGE = { seat: 1.6, door: 1.9, person: 2.6, exit: 1.6 };
const TALK_DISTANCE = 1.2; // how far apart two people stand to talk
const TAP_RADIUS = 70; // screen pixels a tap may land from something and still pick it
const WALK_TO_LIMIT = 40; // metres: a tap further away than this is ignored
const STREET_VIEW = 0.6; // coming out of a door, the camera sits this far round from straight out
/** What a building is called on its scene card, by kind. */
const PLACE_NAMES = {
  home: "A house",
  shop: "The shop",
  tavern: "The tavern",
  temple: "The temple",
  hall: "The town hall",
  smithy: "The smithy",
};

const core = {
  element: null,
  props: null,
  stage: null,
  resizeObserver: null,
  renderer: null,
  camera: null,
  world: null,
  space: null, // the town, or the interior the player is in
  interior: null, // { door, room } while inside a building
  sceneDoor: null, // the door whose card is showing
  seed: FIRST_SEED,
  player: new Group(), // position and facing; the persona's body sits inside it
  shadow: blobShadow(),
  character: null,
  personas: null,
  personaId: null,
  personaLoad: 0,
  characters: null, // [{ id, name }] from the Engine
  cast: new Set(), // the character ids living in town
  bodies: {}, // chosen default bodies by id ("male" | "female"; missing means auto)
  crowd: createCrowd(),
  sound: createSound(),
  settings: loadSettings(),
  hud: null,
  talk: null,
  input: null,
  mode: "walk", // walk | sit | talk | door
  seat: null, // the seat the player is on
  talking: null, // { id, name, group, said } in a conversation
  glide: null, // { fromX, fromZ, toX, toZ, fromAngle, toAngle, t, seconds, then } easing the player somewhere
  walkTo: null, // { x, z, near, then } after a tap
  timers: [], // [{ at, run }] small delays, counted in game seconds
  clock: 0, // game seconds since the page opened
  hour: START_HOUR,
  dark: 0,
  autoScale: 1, // "auto" resolution's own extra factor, lowered when frames drop
  steadyChecks: 0,
  cameraYaw: 0,
  cameraPitch: START_PITCH,
  zoom: CAMERA_DISTANCE,
  pinch: new Map(), // touch pointers on the world, for pinch-to-zoom
  drag: null, // { id, x, y, travelled } while a mouse button or one finger drags the view
  target: null, // what "use" would act on now
  raf: 0,
  lastTime: 0,
  statsFrames: 0,
  statsSince: 0,
  savedAt: 0,
  software: false, // drawing without the graphics card
  softwareTold: false,
  failed: null,
};
core.player.add(core.shadow);

const cameraTarget = new Vector3();
const lookTarget = new Vector3();
const projected = new Vector3();
const frustum = new Frustum();
const viewProjection = new Matrix4();
const raycaster = new Raycaster();
const groundPlane = new Plane(new Vector3(0, 1, 0), 0);
const tapPoint = new Vector2();
const groundHit = new Vector3();

function reportError(element, error) {
  console.error("[wanderworld]", error);
  try {
    const message = `Wanderworld: ${error?.message ?? String(error)}`;
    element?.dispatchEvent(new CustomEvent("marinara-capability-runtime-error", { detail: { message } }));
  } catch {
    // reporting must never throw
  }
}

/** This package's own remembered choices. Storage can be blocked; then nothing is remembered. */
function readStored(key) {
  try {
    return globalThis.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function store(key, value) {
  try {
    globalThis.localStorage?.setItem(key, value);
  } catch {
    // remembering the choice is a convenience only
  }
}

/** Runs `run` after `seconds` of game time. */
function later(seconds, run) {
  core.timers.push({ at: core.clock + seconds, run });
}

// ── Rendering ────────────────────────────────────────────────────────────────

/** One renderer for the page's lifetime. Returns false when the device has no WebGL. */
function ensureRenderer() {
  if (core.renderer) return true;
  if (core.failed) return false;
  try {
    // Antialiasing only where pixels are big; on a high-density screen it costs more than it shows.
    core.renderer = new WebGLRenderer({ antialias: window.devicePixelRatio <= 1, powerPreference: "high-performance" });
  } catch (error) {
    console.warn("[wanderworld] WebGL unavailable", error);
    core.failed = "This device can't draw the 3D world (WebGL is unavailable).";
    return false;
  }
  core.renderer.domElement.style.cssText = "position:absolute;inset:0;display:block;width:100%;height:100%;";
  core.camera = new PerspectiveCamera(60, 1, 0.1, 160);
  core.software = drawsInSoftware(core.renderer);
  return true;
}

/** True when the browser draws WebGL on the processor instead of the graphics card (hardware acceleration
 *  off, or no usable driver): then everything is many times slower, and no setting here can fix it. */
function drawsInSoftware(renderer) {
  try {
    const gl = renderer.getContext();
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const name = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
    return /swiftshader|llvmpipe|softpipe|software|basic render/iu.test(name);
  } catch {
    return false; // can't tell: say nothing
  }
}

/** The render resolution, as a pixel ratio. "Auto" aims for about 1080p worth of pixels, lowered further
 *  while frames drop; the percentages are a share of the screen's own resolution. */
function pixelRatio(width, height) {
  const native = window.devicePixelRatio || 1;
  if (core.settings.resolution !== "auto") return (native * Number(core.settings.resolution)) / 100;
  const budget = Math.sqrt(AUTO_PIXELS / Math.max(1, width * height));
  return Math.max(0.4, Math.min(native, budget) * core.autoScale);
}

function resize() {
  if (!core.stage || !core.renderer) return;
  const width = core.stage.clientWidth;
  const height = core.stage.clientHeight;
  if (!width || !height) return;
  core.renderer.setPixelRatio(pixelRatio(width, height));
  core.renderer.setSize(width, height, false);
  core.camera.aspect = width / height;
  core.camera.updateProjectionMatrix();
}

/** "Auto" resolution steps down quickly when frames drop under 48 a second, and back up slowly. */
function adaptResolution(fps) {
  if (core.settings.resolution !== "auto") return;
  if (fps < 48 && core.autoScale > 0.5) {
    core.autoScale = Math.max(0.5, core.autoScale - 0.1);
    core.steadyChecks = 0;
    resize();
  } else if (fps > 57 && core.autoScale < 1) {
    if (++core.steadyChecks >= 6) {
      core.autoScale = Math.min(1, core.autoScale + 0.05);
      core.steadyChecks = 0;
      resize();
    }
  } else {
    core.steadyChecks = 0;
  }
}

// ── Settings ─────────────────────────────────────────────────────────────────

function applySettings() {
  const { settings } = core;
  core.world?.setDensity(settings.density);
  core.world?.setDrawDistance(settings.drawDistance);
  if (core.camera) {
    core.camera.far = settings.drawDistance + 20;
    core.camera.updateProjectionMatrix();
  }
  setAnimationStyle(settings.animation);
  core.shadow.visible = settings.shadows;
  core.crowd.setShadows(settings.shadows);
  core.crowd.setNamesVisible(settings.names);
  core.crowd.setDressed(settings.people === "kit");
  core.sound.setEnabled(settings.sound);
  core.sound.setVolume(settings.volume);
  core.hud?.setSettings(settings);
  resize();
}

function changeSetting(name, value) {
  const checked = checkSetting(name, value);
  if (checked === undefined) return;
  core.settings = { ...core.settings, [name]: checked };
  if (name === "resolution") core.autoScale = 1;
  if (name === "people") void choosePersona(core.personaId); // redress the player too
  if (["nature", "props", "buildings"].includes(name) && core.world) buildWorld(core.seed, currentPlace()); // redrawn
  saveSettings(core.settings);
  applySettings();
}

// ── The world and where the player is ────────────────────────────────────────

/** Builds the town for `seed`, with the player at `place` (a remembered spot) or the spawn point. */
function buildWorld(seed, place = null) {
  leaveInterior(true);
  core.seed = seed;
  // Take the player and townsfolk out first: disposing the old world frees everything still in its scene.
  core.player.removeFromParent();
  core.crowd.detach();
  core.world?.dispose();
  core.world = createWorld(hashString(seed));
  core.space = core.world;
  core.world.scene.add(core.player);
  core.crowd.setWorld(core.world);
  resetMode();
  const spot = place && !core.world.blocked(place.x, place.z, PLAYER_RADIUS) ? place : null;
  const x = spot?.x ?? SPAWN.x;
  const z = spot?.z ?? SPAWN.z;
  core.player.position.set(x, heightAt(x, z), z);
  core.player.rotation.y = spot?.angle ?? 0;
  core.cameraYaw = spot?.yaw ?? 0;
  core.cameraPitch = spot?.pitch ?? START_PITCH;
  core.zoom = spot?.zoom ?? CAMERA_DISTANCE;
  core.camera?.position.set(x, CAMERA_HEIGHT, z + CAMERA_DISTANCE);
  applySettings();
  savePlace(true);
  // Detailed trees, rocks and plants arrive when the kit has loaded; until then (or without it) the
  // simple ones stand in.
  if (core.settings.nature) {
    const world = core.world;
    kitModels("nature", NATURE_MODELS)
      .then((models) => {
        if (core.world === world) world.addNature(models);
      })
      .catch((error) => console.warn("[wanderworld] detailed nature failed to load", error));
  }
  if (core.settings.buildings) {
    const world = core.world;
    kitModels("village", HOUSE_PIECES)
      .then((models) => {
        if (core.world === world) world.addBuildings(models);
      })
      .catch((error) => console.warn("[wanderworld] detailed buildings failed to load", error));
    // Cobbled roads and brick paving, in the same kit's textures.
    core.world.addGround({
      road: kitTexture("village", "t-unevenbrick-basecolor"),
      paving: kitTexture("village", "t-brick-basecolor"),
    });
  }
  if (core.settings.props) {
    const world = core.world;
    kitModels("props", TOWN_PROPS)
      .then((models) => {
        if (core.world === world) world.addProps(models);
      })
      .catch((error) => console.warn("[wanderworld] detailed props failed to load", error));
  }
}

/** Where the player is now, as buildWorld takes a remembered spot. */
function currentPlace() {
  const at = core.interior ? core.interior.door : core.player.position;
  return {
    x: at.x,
    z: at.z,
    angle: core.player.rotation.y,
    yaw: core.cameraYaw,
    pitch: core.cameraPitch,
    zoom: core.zoom,
  };
}

function newWorld() {
  buildWorld(`world-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`);
}

/** Remembers the world and where the player stands, at most every two seconds. */
function savePlace(now = false) {
  if (!core.world || (!now && core.clock - core.savedAt < 2)) return;
  core.savedAt = core.clock;
  // Indoors, remember the street in front of the door: that's where the player comes back.
  const door = core.interior?.door;
  const outside = door ?? core.player.position;
  store(
    PLACE_KEY,
    JSON.stringify({
      seed: core.seed,
      x: outside.x,
      z: outside.z,
      angle: door ? door.angle : core.player.rotation.y,
      yaw: door ? door.angle + STREET_VIEW : core.cameraYaw,
      pitch: core.cameraPitch,
      zoom: core.zoom,
      hour: core.hour,
    }),
  );
}

function readPlace() {
  try {
    const place = JSON.parse(readStored(PLACE_KEY) ?? "null");
    const numbers = ["x", "z", "angle", "yaw", "pitch", "zoom", "hour"];
    if (!place || typeof place.seed !== "string" || !numbers.every((key) => Number.isFinite(place[key]))) return null;
    const edge = WORLD_SIZE / 2 - 2;
    return {
      ...place,
      x: Math.max(-edge, Math.min(edge, place.x)),
      z: Math.max(-edge, Math.min(edge, place.z)),
      pitch: Math.max(MIN_PITCH, Math.min(MAX_PITCH, place.pitch)),
      zoom: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, place.zoom)),
      hour: ((place.hour % 24) + 24) % 24,
    };
  } catch {
    return null;
  }
}

function setCharacter(character) {
  if (core.character) {
    core.player.remove(core.character.object);
    core.character.dispose();
  }
  core.character = character;
  core.player.add(character.object);
}

/** Shows the persona's own 3D model when it has one, and the built-in person until then or instead. */
async function choosePersona(id) {
  const persona = core.personas?.find((entry) => entry.id === id) ?? null;
  core.personaId = persona?.id ?? null;
  if (persona) store(PERSONA_KEY, persona.id);
  const load = ++core.personaLoad;
  setCharacter(createFigure(persona?.name ?? ""));
  const model = persona ? await findModel({ type: "persona", id: persona.id }) : null;
  if (load !== core.personaLoad) return;
  if (!model && core.settings.people !== "kit") return;
  if (model) core.hud?.setStatus(`Loading ${persona.name}'s model…`);
  try {
    // Their own 3D model, or else a person dressed from the kit.
    const character = model
      ? await loadModelCharacter(model)
      : await createPerson(persona?.name ?? "", core.bodies[persona?.id] ?? "auto");
    if (load !== core.personaLoad) {
      character.dispose();
      return;
    }
    setCharacter(character);
  } catch (error) {
    console.warn("[wanderworld] persona model failed to load", error);
  } finally {
    if (load === core.personaLoad) core.hud?.setStatus(null);
  }
}

function updateCast() {
  const chosen = (core.characters ?? [])
    .filter((character) => core.cast.has(character.id))
    .map((character) => ({ ...character, body: core.bodies[character.id] ?? "auto" }));
  core.crowd.setCast(chosen);
  core.crowd.setShadows(core.settings.shadows);
  core.crowd.setNamesVisible(core.settings.names);
  core.hud?.setCharacters(core.characters ?? [], core.cast, core.bodies);
  store(CAST_KEY, JSON.stringify([...core.cast]));
}

/** Sets which default body `id` (a character or persona) gets: "male", "female" or "auto". */
function setBody(id, body) {
  if (body === "male" || body === "female") core.bodies[id] = body;
  else delete core.bodies[id];
  store(BODIES_KEY, JSON.stringify(core.bodies));
  if (id === core.personaId) void choosePersona(id);
  else updateCast();
}

function toggleCharacter(id, chosen) {
  if (chosen && core.cast.size < MAX_PEOPLE) core.cast.add(id);
  else core.cast.delete(id);
  updateCast();
}

/** Reads the Engine's personas and characters once, then restores the remembered persona and cast. */
async function loadPeople() {
  if (core.personas) return;
  core.hud?.setLoading("Loading Wanderworld…");
  const [personas, characters] = await Promise.all([listPersonas(), listCharacters()]);
  core.personas = personas;
  core.characters = characters;
  let stored;
  try {
    stored = JSON.parse(readStored(CAST_KEY) ?? "[]");
  } catch {
    stored = []; // a damaged saved cast starts empty
  }
  try {
    const bodies = JSON.parse(readStored(BODIES_KEY) ?? "{}");
    core.bodies = Object.fromEntries(
      Object.entries(bodies && typeof bodies === "object" ? bodies : {}).filter(
        ([, body]) => body === "male" || body === "female",
      ),
    );
  } catch {
    core.bodies = {}; // a damaged saved copy: everyone is auto
  }
  const known = new Set(characters.map((character) => character.id));
  core.cast = new Set((Array.isArray(stored) ? stored : []).filter((id) => known.has(id)).slice(0, MAX_PEOPLE));
  updateCast();
  const remembered = readStored(PERSONA_KEY);
  const selected = personas.find((entry) => entry.id === remembered) ?? personas[0] ?? null;
  core.hud?.setPersonas(personas, selected?.id, core.bodies);
  // The loading card stays up until the persona's own model is in, so the first view is the real one.
  const slow = setTimeout(() => core.hud?.setLoading(null), 10000);
  await choosePersona(selected?.id ?? null);
  clearTimeout(slow);
  core.hud?.setLoading(null);
}

function personaName() {
  return core.personas?.find((entry) => entry.id === core.personaId)?.name ?? "You";
}

// ── Modes: sitting, talking, doors ───────────────────────────────────────────

function resetMode() {
  if (core.seat?.taken === "player") core.seat.taken = null;
  core.seat = null;
  if (core.talking) core.crowd.endTalk(core.talking.id);
  core.talking = null;
  core.talk?.stop();
  core.talk?.clearBubbles();
  core.hud?.setBusy(false);
  core.glide = null;
  core.walkTo = null;
  core.mode = "walk";
}

/** Eases the player to (x, z) facing `angle` over `seconds`, then runs `then`. */
function glideTo(x, z, angle, seconds, then) {
  const position = core.player.position;
  core.glide = {
    fromX: position.x,
    fromZ: position.z,
    toX: x,
    toZ: z,
    fromAngle: core.player.rotation.y,
    toAngle: angle,
    t: 0,
    seconds,
    then,
  };
}

function sit(seat) {
  if (seat.taken && seat.taken !== "player") return;
  seat.taken = "player";
  core.seat = seat;
  core.mode = "sit";
  glideTo(seat.x, seat.z, seat.angle, 0.45);
}

function standUp() {
  const seat = core.seat;
  if (!seat) return;
  core.mode = "walk";
  core.seat = null;
  if (seat.taken === "player") seat.taken = null;
  glideTo(seat.approach.x, seat.approach.z, seat.angle, 0.35);
}

function talkTo(person) {
  const group = core.crowd.beginTalk(person.id);
  if (!group) return;
  core.mode = "talk";
  core.input?.release();
  const position = core.player.position;
  const dx = position.x - group.position.x;
  const dz = position.z - group.position.z;
  const distance = Math.hypot(dx, dz) || 1;
  const x = group.position.x + (dx / distance) * TALK_DISTANCE;
  const z = group.position.z + (dz / distance) * TALK_DISTANCE;
  core.talking = { id: person.id, name: person.name, group, said: 0 };
  glideTo(x, z, Math.atan2(-dx, -dz), 0.5);
  core.hud?.setBusy(true);
  core.hud?.setPrompt(null);
  core.talk.start(person.name);
}

function say(text) {
  const talking = core.talking;
  if (!talking) return;
  core.talk.line(personaName(), text);
  core.talk.say(core.player, text, 4);
  later(0.7, () => {
    if (core.talking !== talking) return;
    core.talk.say(talking.group, "…", 1.2);
    core.crowd.setSpeaking(talking.id, true);
  });
  later(1.6, () => {
    if (core.talking !== talking) return;
    const reply = core.talk.placeholderReply(talking.said++);
    core.talk.say(talking.group, reply, 4.5);
    core.talk.line(talking.name, reply);
  });
  later(4.2, () => {
    if (core.talking === talking) core.crowd.setSpeaking(talking.id, false);
  });
}

function endTalk() {
  if (!core.talking) return;
  core.crowd.endTalk(core.talking.id);
  core.talking = null;
  core.talk.stop();
  core.hud?.setBusy(false);
  core.mode = "walk";
}

/** Through a door, with a fade: into the building's room, or back out to the street. */
function goThrough(run) {
  core.mode = "door";
  core.walkTo = null;
  core.hud?.setFade(true);
  later(0.38, () => {
    run();
    core.hud?.setFade(false);
    later(0.3, () => {
      if (core.mode === "door") core.mode = "walk";
    });
  });
}

function enterBuilding(door) {
  goThrough(() => {
    core.world.setDoor(door.index, false);
    const room = createInterior(door, core.seed);
    core.interior = { door, room };
    core.space = room;
    core.crowd.showRoom(door, room);
    if (core.settings.props) {
      kitModels("props", room.propNames)
        .then((models) => {
          if (core.interior?.room === room) room.addProps(models);
        })
        .catch((error) => console.warn("[wanderworld] detailed furniture failed to load", error));
    }
    core.player.removeFromParent();
    room.scene.add(core.player);
    core.player.position.set(room.entry.x, 0, room.entry.z);
    core.player.rotation.y = room.entry.angle;
    core.cameraYaw = room.entry.angle + Math.PI;
    core.camera.position.set(room.entry.x, 3, room.entry.z + 4);
    core.sound.door();
  });
}

/**
 * Going into a building, for now: the door opens and a card says who's in there. Starting a scene with
 * them (a role-play scene in the chat, with its own pictures) comes with Wanderworld's server part; the
 * walk-in rooms are still there behind a setting while that's worked out.
 */
function knock(door) {
  core.world.setDoor(door.index, true, 4);
  core.sound.door();
  const names = core.crowd.inside(door).map((person) => person.name);
  core.sceneDoor = door;
  core.hud.setScene({
    title: PLACE_NAMES[door.kind] ?? "A house",
    people: names,
  });
}

/** Back out to the street in front of the door (at once when `now`, e.g. for a new world). */
function leaveInterior(now = false) {
  const inside = core.interior;
  if (!inside) return;
  const out = () => {
    core.crowd.hideRoom();
    core.interior = null;
    core.player.removeFromParent();
    inside.room.dispose();
    if (!core.world) return;
    core.space = core.world;
    core.world.scene.add(core.player);
    const { door } = inside;
    core.player.position.set(door.x, heightAt(door.x, door.z), door.z);
    core.player.rotation.y = door.angle;
    // The camera out on the street, a little to one side, looking back at the player and the door.
    core.cameraYaw = door.angle + STREET_VIEW;
    core.world.setDoor(door.index, true, 2.5);
    core.sound.door();
  };
  if (now) out();
  else goThrough(out);
}

// ── Using things ─────────────────────────────────────────────────────────────

/** Everything near enough to use right now, each { kind, label, x, z, y, act }. */
function usable() {
  const list = [];
  const space = core.space;
  for (const seat of space?.seats ?? []) {
    if (seat.taken && seat.taken !== "player") continue;
    list.push({
      kind: "seat",
      label: "Sit",
      x: seat.approach.x,
      z: seat.approach.z,
      y: 0.9,
      mark: seat,
      act: () => sit(seat),
    });
  }
  for (const person of core.crowd.present(space)) {
    list.push({
      kind: "person",
      label: `Talk to ${person.name}`,
      x: person.position.x,
      z: person.position.z,
      y: 2.45,
      act: () => talkTo(person),
    });
  }
  if (core.interior) {
    const { exit } = core.interior.room;
    list.push({ kind: "exit", label: "Leave", x: exit.x, z: exit.z, y: 1.6, act: () => leaveInterior() });
  } else {
    for (const door of core.world?.doors ?? []) {
      const open = door.open > 0.6;
      list.push({
        kind: "door",
        label: !core.settings.interiors ? "Go in" : open ? "Go in" : "Open door",
        x: door.x,
        z: door.z,
        y: 1.8,
        mark: door.step,
        act: () => {
          if (!core.settings.interiors) return knock(door);
          if (door.open > 0.6) enterBuilding(door);
          else {
            core.world.setDoor(door.index, true, 8);
            core.sound.door();
          }
        },
      });
    }
  }
  return list;
}

/** The best thing to use from where the player stands and faces, or null. */
function pickTarget() {
  const position = core.player.position;
  const facing = core.player.rotation.y;
  let best = null;
  let bestScore = Infinity;
  for (const thing of usable()) {
    const dx = thing.x - position.x;
    const dz = thing.z - position.z;
    const distance = Math.hypot(dx, dz);
    if (distance > USE_RANGE[thing.kind]) continue;
    const turn = distance > 0.2 ? 1 - Math.cos(Math.atan2(dx, dz) - facing) : 0;
    const score = distance + turn * 0.8;
    if (score < bestScore) {
      best = thing;
      bestScore = score;
    }
  }
  return best;
}

function use() {
  if (core.mode === "sit") return standUp();
  if (core.mode !== "walk") return;
  core.target?.act();
}

/** Screen position of a world point, or null when it's behind the camera. */
function toScreen(x, y, z) {
  projected.set(x, y, z).project(core.camera);
  if (projected.z > 1) return null;
  return {
    x: ((projected.x + 1) / 2) * core.stage.clientWidth,
    y: ((1 - projected.y) / 2) * core.stage.clientHeight,
  };
}

/** A click or tap on the world: use (or walk to) what's under it, or walk to that spot on the ground. */
function tap(clientX, clientY) {
  if (core.mode === "talk" || core.mode === "door" || !core.camera) return;
  if (core.mode === "sit") return standUp();
  const rect = core.stage.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  let best = null;
  let bestDistance = TAP_RADIUS;
  for (const thing of usable()) {
    const mark = thing.mark ?? thing;
    for (const height of thing.kind === "person" ? [1, 1.6] : [thing.y * 0.6]) {
      const screen = toScreen(mark.x, height, mark.z);
      if (!screen) continue;
      const distance = Math.hypot(screen.x - x, screen.y - y);
      if (distance < bestDistance) {
        best = thing;
        bestDistance = distance;
      }
    }
  }
  const position = core.player.position;
  if (best) {
    const distance = Math.hypot(best.x - position.x, best.z - position.z);
    if (distance <= USE_RANGE[best.kind]) best.act();
    else if (distance < WALK_TO_LIMIT)
      core.walkTo = { x: best.x, z: best.z, near: USE_RANGE[best.kind] * 0.6, then: best };
    return;
  }
  tapPoint.set((x / rect.width) * 2 - 1, -(y / rect.height) * 2 + 1);
  raycaster.setFromCamera(tapPoint, core.camera);
  if (!raycaster.ray.intersectPlane(groundPlane, groundHit)) return;
  if (Math.hypot(groundHit.x - position.x, groundHit.z - position.z) > WALK_TO_LIMIT) return;
  if (core.space.blocked(groundHit.x, groundHit.z, 0.2)) return;
  core.walkTo = { x: groundHit.x, z: groundHit.z, near: 0.25, then: null };
}

// ── Camera input ─────────────────────────────────────────────────────────────

/** Multiplies the camera distance by `factor` (below 1 zooms in), within the zoom limits. */
function zoomBy(factor) {
  core.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, core.zoom * factor));
}

/** Turns the view: positive `yaw` looks left, positive `pitch` raises the camera to look down. */
function lookBy(yaw, pitch) {
  const speed = core.settings.lookSpeed;
  core.cameraYaw += yaw * speed;
  const flip = core.settings.invertLook ? -1 : 1;
  core.cameraPitch = Math.max(MIN_PITCH, Math.min(MAX_PITCH, core.cameraPitch + pitch * speed * flip));
}

/**
 * The camera on the world itself: drag (left or middle mouse button, or one finger) to look around, the
 * wheel or a two-finger pinch to zoom. A press that barely moves is a click: it uses or walks to things.
 */
function bindCamera(stage) {
  stage.style.cursor = "grab";
  stage.addEventListener(
    "wheel",
    (event) => {
      if (event.target instanceof Element && event.target.closest(UI_SELECTOR)) return;
      event.preventDefault(); // zoom the world, don't scroll the Home panel
      zoomBy(Math.exp(event.deltaY * 0.0015));
    },
    { passive: false },
  );
  const spread = () => {
    const [a, b] = [...core.pinch.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };
  stage.addEventListener("pointerdown", (event) => {
    core.sound.unlock();
    if (event.target instanceof Element && event.target.closest(UI_SELECTOR)) return;
    if (event.pointerType === "touch") {
      core.pinch.set(event.pointerId, { x: event.clientX, y: event.clientY });
      // One finger looks around (or taps); a second finger turns it into a pinch.
      core.drag =
        core.pinch.size === 1 ? { id: event.pointerId, x: event.clientX, y: event.clientY, travelled: 0 } : null;
      return;
    }
    if (event.button !== 0 && event.button !== 1) return;
    if (event.button === 1) event.preventDefault(); // no middle-click autoscroll
    core.drag = { id: event.pointerId, x: event.clientX, y: event.clientY, travelled: 0, button: event.button };
    try {
      stage.setPointerCapture(event.pointerId); // keep dragging when the pointer leaves the world
    } catch {
      // a pointer that is already gone can't be captured; the drag still works inside the world
    }
  });
  stage.addEventListener("pointermove", (event) => {
    if (core.pinch.has(event.pointerId)) {
      const before = core.pinch.size === 2 ? spread() : 0;
      core.pinch.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (core.pinch.size === 2 && before > 0) zoomBy(before / Math.max(1, spread()));
    }
    const drag = core.drag;
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    drag.x = event.clientX;
    drag.y = event.clientY;
    drag.travelled += Math.hypot(dx, dy);
    if (drag.travelled < CLICK_SLOP) return;
    stage.style.cursor = "grabbing";
    lookBy(-dx * DRAG_YAW, dy * DRAG_PITCH);
  });
  const release = (event) => {
    const drag = core.drag;
    const wasPinch = core.pinch.size > 1;
    core.pinch.delete(event.pointerId);
    if (drag?.id === event.pointerId) {
      core.drag = null;
      if (event.type === "pointerup" && drag.travelled < CLICK_SLOP && !wasPinch && (drag.button ?? 0) === 0) {
        tap(event.clientX, event.clientY);
      }
    }
    stage.style.cursor = "grab";
  };
  stage.addEventListener("pointerup", release);
  stage.addEventListener("pointercancel", release);
}

/** The Engine's fullscreen control for Home tabs (capability API 1.376); absent on older Engines. */
function fullscreenControl() {
  const control = core.props?.browserFullscreen;
  return control && typeof control.setActive === "function" ? control : null;
}

function toggleFullscreen() {
  const control = fullscreenControl();
  control?.setActive(!control.active);
}

// ── Each frame ───────────────────────────────────────────────────────────────

function stepClock(dt) {
  const mode = core.settings.time;
  if (mode === "day") core.hour = 12;
  else if (mode === "night") core.hour = 23;
  else core.hour = (core.hour + (dt * 24) / DAY_SECONDS) % 24;
  core.dark = core.world.setTime(core.hour);
  const hours = Math.floor(core.hour);
  const minutes = Math.floor((core.hour - hours) * 60);
  core.hud?.setClock(`${String(hours).padStart(2, "0")}:${String(Math.floor(minutes / 10) * 10).padStart(2, "0")}`);
}

/** Moves the player for one frame; returns how fast they really moved. */
function movePlayer(dt, input) {
  const player = core.player;
  const position = player.position;
  const startX = position.x;
  const startZ = position.z;
  const space = core.space;
  if (core.glide) {
    const glide = core.glide;
    glide.t = Math.min(1, glide.t + dt / glide.seconds);
    const ease = glide.t * glide.t * (3 - 2 * glide.t);
    position.x = glide.fromX + (glide.toX - glide.fromX) * ease;
    position.z = glide.fromZ + (glide.toZ - glide.fromZ) * ease;
    player.rotation.y = approachAngle(glide.fromAngle, glide.toAngle, ease);
    if (glide.t >= 1) {
      core.glide = null;
      glide.then?.();
    }
  } else if (core.mode === "walk") {
    const { x, y } = input;
    const keyed = x || y;
    if (keyed) core.walkTo = null;
    const walkTo = core.walkTo;
    let speedFactor = input.run ? RUN_SPEED : WALK_SPEED * input.amount;
    let moveX;
    let moveZ;
    if (keyed) {
      const sin = Math.sin(core.cameraYaw);
      const cos = Math.cos(core.cameraYaw);
      // The camera sits behind the player, so "forward" points away from it.
      moveX = -sin * y + cos * x;
      moveZ = -cos * y - sin * x;
    } else if (walkTo) {
      const dx = walkTo.x - position.x;
      const dz = walkTo.z - position.z;
      const distance = Math.hypot(dx, dz);
      if (distance <= walkTo.near) {
        core.walkTo = null;
        walkTo.then?.act();
        moveX = 0;
        moveZ = 0;
      } else {
        moveX = dx / distance;
        moveZ = dz / distance;
        speedFactor = WALK_SPEED;
      }
    }
    if (moveX || moveZ) {
      const speed = speedFactor * core.settings.walkSpeed;
      position.x += moveX * speed * dt;
      position.z += moveZ * speed * dt;
      space.resolveCollisions(position, PLAYER_RADIUS);
      core.crowd.pushOut(position, PLAYER_RADIUS, space);
      const edge = WORLD_SIZE / 2 - 2;
      position.x = Math.max(-edge, Math.min(edge, position.x));
      position.z = Math.max(-edge, Math.min(edge, position.z));
      player.rotation.y = approachAngle(player.rotation.y, Math.atan2(moveX, moveZ), 12 * dt);
      // A tap's walk gives up when something is in the way.
      if (core.walkTo) {
        const moved = Math.hypot(position.x - startX, position.z - startZ);
        core.walkTo.stuck = moved < speed * dt * 0.2 ? (core.walkTo.stuck ?? 0) + dt : 0;
        if (core.walkTo.stuck > 0.6) core.walkTo = null;
      }
    }
  } else if (core.mode === "sit" && (input.x || input.y)) {
    standUp();
  }
  position.y = core.interior ? 0 : heightAt(position.x, position.z);
  return dt > 0 ? Math.hypot(position.x - startX, position.z - startZ) / dt : 0;
}

function placeCamera(dt) {
  const position = core.player.position;
  const lookY = position.y + LOOK_HEIGHT;
  if (core.talking && core.mode === "talk") {
    // A side-on two-shot: both faces in view, the camera off to whichever side it was already nearer.
    const other = core.talking.group.position;
    const midX = (position.x + other.x) / 2;
    const midZ = (position.z + other.z) / 2;
    const dx = other.x - position.x;
    const dz = other.z - position.z;
    const length = Math.hypot(dx, dz) || 1;
    const baseX = -dz / length;
    const baseZ = dx / length;
    const talking = core.talking;
    if (!talking.side) {
      // First frame: the side the camera is already on, unless a building blocks it and the other side is clearer.
      const near = (core.camera.position.x - midX) * baseX + (core.camera.position.z - midZ) * baseZ >= 0 ? 1 : -1;
      const clear = (sign) => core.space.clearSight(midX, midZ, midX + baseX * sign * 2.7, midZ + baseZ * sign * 2.7);
      talking.side = clear(near) >= 0.95 || clear(near) >= clear(-near) ? near : -near;
    }
    const sideX = baseX * talking.side;
    const sideZ = baseZ * talking.side;
    cameraTarget.set(midX + sideX * 2.7, lookY + 0.15, midZ + sideZ * 2.7);
    lookTarget.set(midX, lookY + 0.05, midZ);
    core.camera.position.lerp(cameraTarget, 1 - Math.exp(-4 * dt));
    core.camera.lookAt(lookTarget);
    return;
  }
  // The camera orbits a point at head height: yaw around it, pitch above (or a little below) it.
  // It slides in closer when a building stands between it and the player.
  const zoom = core.interior ? Math.min(core.zoom, INSIDE_ZOOM) : core.zoom;
  const sin = Math.sin(core.cameraYaw);
  const cos = Math.cos(core.cameraYaw);
  const across = Math.cos(core.cameraPitch);
  const up = Math.sin(core.cameraPitch);
  const reach = core.space.clearSight(
    position.x,
    position.z,
    position.x + sin * zoom * across,
    position.z + cos * zoom * across,
  );
  const distance = Math.max(Math.min(MIN_CAMERA_DISTANCE, zoom), zoom * reach);
  const cameraX = position.x + sin * distance * across;
  const cameraZ = position.z + cos * distance * across;
  // Never below the ground: looking up from low down stops just above the grass.
  const ground = core.interior ? 0 : heightAt(cameraX, cameraZ);
  const cameraY = Math.max(lookY + distance * up, ground + 0.4);
  cameraTarget.set(cameraX, cameraY, cameraZ);
  core.camera.position.lerp(cameraTarget, 1 - Math.exp(-CAMERA_FOLLOW * dt));
  core.camera.lookAt(position.x, lookY, position.z);
}

function step(dt) {
  core.clock += dt;
  for (const timer of core.timers.filter((entry) => entry.at <= core.clock)) {
    core.timers.splice(core.timers.indexOf(timer), 1);
    timer.run();
  }
  const input = core.input ?? null;
  const read = input && core.mode !== "talk" ? input.read() : NO_INPUT;
  if (read.yaw || read.pitch) lookBy(read.yaw * YAW_KEY_SPEED * dt, read.pitch * PITCH_KEY_SPEED * dt);
  if (read.zoom) zoomBy(Math.exp(read.zoom * KEY_ZOOM_RATE * dt));
  if (input?.take("leave")) {
    if (core.mode === "talk") endTalk();
    else if (core.mode === "sit") standUp();
  }
  if (input?.take("use")) use();

  stepClock(dt);
  const speed = movePlayer(dt, read);
  let lookAt = null;
  if (core.talking) {
    const other = core.talking.group.position;
    const turn =
      Math.atan2(other.x - core.player.position.x, other.z - core.player.position.z) - core.player.rotation.y;
    lookAt = Math.atan2(Math.sin(turn), Math.cos(turn));
  }
  const pose = core.character?.update(dt, speed, { sit: core.mode === "sit", lookAt, talk: false });
  if (pose?.footstep) core.sound.footstep(0, pose.running);

  // The town lives on while the player is indoors: doors, people, the clock. An open door stays open
  // while the player stands at it.
  if (!core.interior) {
    for (const door of core.world.doors) {
      const near = Math.hypot(door.x - core.player.position.x, door.z - core.player.position.z) < 3;
      if (near && door.target === 1) door.closeIn = Math.max(door.closeIn, 2);
    }
  }
  core.world.update(dt);
  if (!core.interior) core.world.follow(core.player.position.x, core.player.position.z);
  // Walking away from a door closes its card.
  const card = core.sceneDoor;
  if (card && Math.hypot(card.x - core.player.position.x, card.z - core.player.position.z) > 4) {
    core.sceneDoor = null;
    core.hud.setScene(null);
  }
  viewProjection.multiplyMatrices(core.camera.projectionMatrix, core.camera.matrixWorldInverse);
  frustum.setFromProjectionMatrix(viewProjection);
  const inside = !!core.interior;
  core.crowd.update(dt, {
    player: core.player.position,
    space: core.space,
    playerSitting: core.mode === "sit",
    hour: core.hour,
    time: core.clock,
    isVisible: (position) => frustum.containsPoint(projected.set(position.x, position.y + 1, position.z)),
    onFootstep: (position, running, distance) => core.sound.footstep(distance, running),
  });
  core.talk?.update(dt);
  core.sound.tick(dt, { dark: core.dark, inside });

  placeCamera(dt);
  core.interior?.room.update(dt, core.camera);

  // The use prompt over whatever is in reach.
  core.target = core.mode === "walk" && !core.walkTo ? pickTarget() : null;
  const label = core.mode === "sit" ? "Stand up" : core.target?.label;
  const screen = core.target
    ? toScreen(core.target.mark?.x ?? core.target.x, core.target.y, core.target.mark?.z ?? core.target.z)
    : null;
  if (core.mode === "talk") core.hud?.setPrompt(null);
  else if (core.mode === "sit") {
    const head = toScreen(core.player.position.x, 1.9, core.player.position.z);
    core.hud?.setPrompt(label, head?.x, head?.y);
  } else core.hud?.setPrompt(label ?? null, screen?.x, screen?.y);
  savePlace();
}

function frame(time) {
  if (!core.element || !core.renderer) {
    core.raf = 0;
    return;
  }
  core.raf = requestAnimationFrame(frame);
  if (!core.world) return;
  const dt = core.lastTime ? Math.min(0.1, (time - core.lastTime) / 1000) : 0;
  core.lastTime = time;
  step(dt);
  core.renderer.render(core.space.scene, core.camera);

  core.statsFrames++;
  if (!core.statsSince) core.statsSince = time;
  if (time - core.statsSince >= STATS_INTERVAL_MS) {
    const { calls, triangles } = core.renderer.info.render;
    const fps = Math.round((core.statsFrames * 1000) / (time - core.statsSince));
    core.hud?.setStats({
      fps,
      calls,
      triangles,
      scale: core.renderer.getPixelRatio() / (window.devicePixelRatio || 1),
    });
    adaptResolution(fps);
    core.statsFrames = 0;
    core.statsSince = time;
  }
}

function attach(element) {
  core.element = element;
  element.style.cssText += ";display:block;position:relative;overflow:hidden;width:100%;height:100%;";
  core.stage = document.createElement("div");
  core.stage.style.cssText = "position:absolute;inset:0;background:#bfd9ee;touch-action:none;";
  element.replaceChildren(core.stage);
  core.pinch.clear();
  core.drag = null;
  bindCamera(core.stage);

  core.hud = createHud(core.stage, {
    onNewWorld: newWorld,
    onToggleFullscreen: toggleFullscreen,
    onPickPersona: (id) => void choosePersona(id),
    onToggleCharacter: toggleCharacter,
    onSetBody: setBody,
    onSetting: changeSetting,
    onUse: () => {
      core.sound.unlock();
      use();
    },
    maxPeople: MAX_PEOPLE,
  });
  core.talk = createTalk(core.hud.layer, { onSend: say, onLeave: endTalk });
  core.input = createInput();
  core.hud.layer.append(core.input.stickElement);
  core.element.addEventListener("keydown", () => core.sound.unlock());

  if (!ensureRenderer()) {
    core.hud.setStatus(core.failed);
    return;
  }
  core.stage.prepend(core.renderer.domElement);
  if (core.software && !core.softwareTold) {
    core.softwareTold = true; // once per page
    core.hud.setNotice(
      'Your browser is drawing the 3D world without your graphics card, so it will run slowly. Turn on hardware acceleration (sometimes called "graphics acceleration") in your browser\'s settings, then restart the browser.',
    );
  }
  if (!core.world) {
    const place = readPlace();
    if (place) core.hour = place.hour;
    buildWorld(place?.seed ?? core.seed, place);
  }
  if (core.personas) {
    core.hud.setPersonas(core.personas, core.personaId, core.bodies);
    core.hud.setCharacters(core.characters ?? [], core.cast, core.bodies);
  } else {
    void loadPeople();
  }
  core.resizeObserver = new ResizeObserver(resize);
  core.resizeObserver.observe(core.stage);
  applySettings();
  core.lastTime = 0;
  core.statsSince = 0;
  core.statsFrames = 0;
  if (!core.raf) core.raf = requestAnimationFrame(frame);
}

function detach(element) {
  if (element !== core.element) return;
  if (core.raf) cancelAnimationFrame(core.raf);
  core.raf = 0;
  savePlace(true);
  if (core.mode === "talk") endTalk();
  core.resizeObserver?.disconnect();
  core.resizeObserver = null;
  core.input?.dispose();
  core.input = null;
  core.talk?.destroy();
  core.talk = null;
  core.hud?.destroy();
  core.hud = null;
  core.stage = null;
  core.element = null;
  // The world stays built, so reopening the tab returns to the same spot.
}

class WanderworldElement extends HTMLElement {
  constructor() {
    super();
    this.props = null;
    this.onPropsEvent = () => this.sync();
  }
  // The host assigns capabilityProps and then dispatches marinara-capability-props; handle both orders.
  set capabilityProps(value) {
    this.props = value;
    this.sync();
  }
  get capabilityProps() {
    return this.props;
  }
  connectedCallback() {
    this.addEventListener("marinara-capability-props", this.onPropsEvent);
    this.sync();
  }
  disconnectedCallback() {
    this.removeEventListener("marinara-capability-props", this.onPropsEvent);
    detach(this);
  }
  sync() {
    try {
      if (this.getAttribute("view") !== "browser" || !this.isConnected) return;
      if (core.element !== this) {
        if (core.element) detach(core.element);
        attach(this);
      }
      core.props = this.props;
      core.hud?.setFullscreen(fullscreenControl());
    } catch (error) {
      reportError(this, error);
    }
  }
}

if (!customElements.get(TAG)) customElements.define(TAG, WanderworldElement);

// Debug handle for playtests, the same opt-in as Pixelforge's: set localStorage "wanderworld-debug" to "1".
try {
  if (globalThis.localStorage?.getItem("wanderworld-debug") === "1") globalThis.__wanderworld = core;
} catch {
  // storage can be blocked; the handle just stays off
}
