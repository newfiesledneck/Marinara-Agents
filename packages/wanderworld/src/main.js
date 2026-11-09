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
import { createMenu } from "./menu.js";
import { createSaves } from "./saves.js";
import { createHangingSign, createNoticeboard, createSign } from "./signs.js";
import {
  buildZones,
  carrySetup,
  chainOf,
  defaultGroups,
  describe,
  groupsAt,
  nameOf,
  newGroupId,
  remapZones,
  signOf,
  WORLD_ID,
  matchLore,
  mergeLore,
  zoneAt,
} from "./zones.js";
import { landscapeWith } from "./land.js";
import { ACTIONS, describeScene, sceneRequest } from "./interactions.js";
import { choicesFor, greetingFor, labelOf, lineFor, moodOf } from "./dialogue.js";
import {
  checkTraits,
  createRelationships,
  KINDS,
  linksFromWords,
  phraseOf,
  setupFromWords,
  tierOf,
  TRAITS,
} from "./relationships.js";
import { createWorld, hashString, heightAt, NATURE_MODELS, SPAWN, TOWN_PROPS, waterAt, WORLD_SIZE } from "./world.js";

const PACKAGE_ID = "wanderworld";
const TAG = `marinara-capability-${PACKAGE_ID}`;
const FIRST_SEED = "wanderworld";
const WALK_SPEED = 1.4; // metres per second: a natural walking pace (times the walk speed setting)
const RUN_SPEED = 5; // with Shift
const GATHER_RADIUS = 6; // metres: "everyone near me" in the Party tab means this close
const SWIM_DEPTH = 1.3; // metres of water from which the player swims instead of wading
const WADE_DEPTH = 0.35; // from here up to swimming depth, wading slows them
const SWIM_SPEED = 1.5; // metres per second swimming (Shift: SWIM_SPRINT)
const SWIM_SPRINT = 2.4;
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
// This package's own browser storage: worlds live in saves.js; bodies are the same in every world.
const BODIES_KEY = "wanderworld.bodies"; // { [character or persona id]: "male" | "female" }
const PERSONA_KEY = "wanderworld.persona"; // the persona a new world starts with: the one played last
const NEARBY = 12; // metres: who counts as nearby
const ZONE_SETTLE = 0.6; // seconds in a new place before its name shows
const THUMBNAIL = { width: 192, height: 108 };
const THUMBNAIL_EVERY = 90; // seconds between thumbnail refreshes while playing
const ART = "/api/capability-packages/wanderworld/assets/kit/art/"; // the menu and loading art
const BUILD_WAIT = 10; // seconds the loading screen waits at most for the detailed kit
const PLAYER_RADIUS = 0.35;
const STATS_INTERVAL_MS = 500;
const NO_INPUT = { x: 0, y: 0, amount: 0, run: false, yaw: 0, pitch: 0, zoom: 0 };
/** "Auto" resolution aims for about this many pixels (1080p), then lowers it if frames drop. */
const AUTO_PIXELS = 1920 * 1080;
const DAY_SECONDS = 20 * 60; // a whole day in town takes 20 minutes
const START_HOUR = 9;
const USE_RANGE = { seat: 1.6, door: 1.9, person: 2.6, exit: 1.6, board: 1.9 };
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
  worldLoad: 0, // counts world loads, so a slow one that was replaced doesn't show itself
  saves: createSaves(),
  save: null, // the world being played (saves.js record)
  menu: null,
  paused: true, // the main menu is up: nothing moves or draws
  zones: null, // zones.js, for this world
  signs: [], // shop signs, one per signed building
  zoneId: null, // the place the player is in now
  zoneShown: null, // the last place whose name showed
  zoneSince: 0,
  zoneCheck: 0,
  journalAt: 0,
  thumbnailAt: 0,
  lorebooks: null, // the Engine's lorebooks with their entries, once read
  relations: createRelationships(), // how everyone in this world sees each other (relationships.js)
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
  for (const sign of core.signs) sign.dispose();
  core.signs = [];
  core.board?.dispose();
  core.board = null;
  core.world = createWorld(hashString(seed), core.save?.seed === seed ? core.save.landscape : null);
  // A world keeps the land it was first built with, even if the seed's own choices change later.
  if (core.save?.seed === seed && !core.save.landscape) core.save = { ...core.save, landscape: core.world.landscape };
  core.zones = buildZones(core.world.layout, hashString(seed));
  if (core.save?.lorePending) linkLore();
  const boardSpot = core.world.noticeboard;
  core.board = boardSpot
    ? createNoticeboard({
        x: boardSpot.x,
        y: heightAt(boardSpot.x, boardSpot.z),
        z: boardSpot.z,
        angle: boardSpot.angle,
        boardUrl: `${ART}sign-wood.webp`,
        noteUrl: `${ART}note.webp`,
      })
    : null;
  if (core.board) core.world.scene.add(core.board.group);
  core.zoneId = null;
  core.zoneShown = null;
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
  const loads = [];
  if (core.settings.nature) {
    const world = core.world;
    loads.push(
      kitModels("nature", NATURE_MODELS)
        .then((models) => {
          if (core.world === world) world.addNature(models);
        })
        .catch((error) => console.warn("[wanderworld] detailed nature failed to load", error)),
    );
  }
  if (core.settings.buildings) {
    const world = core.world;
    loads.push(
      kitModels("village", HOUSE_PIECES)
        .then((models) => {
          if (core.world !== world) return;
          world.addBuildings(models);
          placeSigns();
        })
        .catch((error) => console.warn("[wanderworld] detailed buildings failed to load", error)),
    );
  }
  // The ground's painted textures (kit/art): grass and dirt on the land, cobbled streets, stone setts on
  // the sidewalks and slabs on the square. Plain colours stand in until they load.
  const groundTexture = (name) => {
    const map = kitTexture("art", name);
    map.anisotropy = Math.min(8, core.renderer?.capabilities.getMaxAnisotropy() ?? 1);
    return map;
  };
  core.world.addGround({
    grass: groundTexture("ground-grass"),
    dirt: groundTexture("ground-dirt"),
    rock: groundTexture("ground-rock"),
    cliff: groundTexture("cliff-rock"),
    sand: groundTexture("ground-riverbed"),
    snow: groundTexture("ground-snow"),
    forest: groundTexture("ground-forest"),
    water: groundTexture("water"),
    road: groundTexture("street-cobbles"),
    paving: groundTexture("sidewalk-setts"),
    plaza: groundTexture("plaza-stone"),
    planks: groundTexture("bridge-planks"),
    beams: groundTexture("wood-beam"),
  });
  if (core.settings.props) {
    const world = core.world;
    loads.push(
      kitModels("props", TOWN_PROPS)
        .then((models) => {
          if (core.world === world) world.addProps(models);
        })
        .catch((error) => console.warn("[wanderworld] detailed props failed to load", error)),
    );
  }
  return Promise.allSettled(loads);
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

/**
 * Saves the world being played: where the player stands, the time, persona and cast (at most every two
 * seconds unless `now`). With `thumbnail`, a small picture of the view goes with it for the Load list.
 */
function savePlace(now = false, thumbnail = null) {
  if (!core.world || !core.save || (!now && core.clock - core.savedAt < 2)) return;
  core.savedAt = core.clock;
  // Indoors, remember the street in front of the door: that's where the player comes back.
  const door = core.interior?.door;
  const outside = door ?? core.player.position;
  core.save = {
    ...core.save,
    playedAt: Date.now(),
    hour: core.hour,
    persona: core.personaId,
    cast: [...(core.cast ?? [])],
    party: core.crowd.party().map((member) => member.id),
    place: {
      x: outside.x,
      z: outside.z,
      angle: door ? door.angle : core.player.rotation.y,
      yaw: door ? door.angle + STREET_VIEW : core.cameraYaw,
      pitch: core.cameraPitch,
      zoom: core.zoom,
    },
  };
  core.saves.write(core.save, thumbnail);
}

/** A saved spot, kept inside the world and the camera's limits. */
function checkedPlace(place) {
  if (!place) return null;
  const edge = WORLD_SIZE / 2 - 2;
  return {
    ...place,
    x: Math.max(-edge, Math.min(edge, place.x)),
    z: Math.max(-edge, Math.min(edge, place.z)),
    pitch: Math.max(MIN_PITCH, Math.min(MAX_PITCH, place.pitch)),
    zoom: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, place.zoom)),
  };
}

/** The view as a small JPEG data URL, drawn right after a render (the canvas is cleared after that). */
function captureThumbnail() {
  if (!core.renderer || !core.world || typeof document === "undefined") return null;
  try {
    core.renderer.render(core.space.scene, core.camera);
    const canvas = document.createElement("canvas");
    canvas.width = THUMBNAIL.width;
    canvas.height = THUMBNAIL.height;
    const source = core.renderer.domElement;
    const scale = Math.max(canvas.width / source.width, canvas.height / source.height);
    const w = source.width * scale;
    const h = source.height * scale;
    canvas.getContext("2d").drawImage(source, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
    return canvas.toDataURL("image/jpeg", 0.7);
  } catch {
    return null;
  }
}

// ── Worlds and the main menu ─────────────────────────────────────────────────

/** Plays saved world `id`: back where the player left it, with its persona and cast. */
function playWorld(id) {
  const save = core.saves.read(id);
  if (!save) return;
  core.saves.setLast(id);
  if (core.save?.id === id && core.world) {
    resume(); // the world in memory is this one: just carry on
    return;
  }
  savePlace(true);
  core.save = save;
  core.hour = save.hour;
  useRelations(createRelationships(save.relationships));
  const known = new Set((core.characters ?? []).map((character) => character.id));
  core.cast = new Set(save.cast.filter((id) => known.has(id)).slice(0, MAX_PEOPLE));
  const persona =
    core.personas?.find((entry) => entry.id === save.persona) ??
    core.personas?.find((entry) => entry.id === readStored(PERSONA_KEY)) ??
    core.personas?.[0] ??
    null;
  core.hud?.setPersonas(core.personas ?? [], persona?.id, core.bodies);
  void choosePersona(persona?.id ?? null);
  // The loading screen first (building blocks for a moment), then the world, shown once its detailed
  // trees, buildings and props are in (or after a while regardless).
  core.menu?.hide();
  core.hud?.setLoading(`Building ${save.name}…`);
  const load = ++core.worldLoad;
  setTimeout(() => {
    if (load !== core.worldLoad) return;
    const detail = buildWorld(save.seed, checkedPlace(save.place));
    updateCast();
    core.crowd.restoreParty(save.party, core.player.position);
    const shown = () => {
      if (load !== core.worldLoad) return;
      core.hud?.setLoading(null);
      resume();
    };
    Promise.race([detail, new Promise((done) => setTimeout(done, BUILD_WAIT * 1000))]).then(shown);
  }, 60);
}

function resume() {
  core.menu?.hide();
  core.hud?.setMenuOpen(false);
  if (core.input) core.input.stickElement.style.visibility = "";
  core.paused = false;
  core.lastTime = 0;
}

/** Saves the world (with a fresh thumbnail) and opens the main menu. */
function openMenu() {
  if (core.mode === "talk") endTalk();
  if (core.save && core.world) savePlace(true, captureThumbnail());
  core.paused = true;
  core.hud?.setMenuOpen(true);
  if (core.input) core.input.stickElement.style.visibility = "hidden"; // no walking stick over the menu
  core.menu?.show();
}

function createNewWorld({
  name,
  seed,
  choices,
  setting = "",
  lorebooks = [],
  loreLinking = "none",
  characterLinking = "none",
}) {
  const save = core.saves.create({ name: name || suggestName(), seed });
  if (!save) return;
  save.setting = setting;
  save.lorebooks = lorebooks;
  save.loreLinking = lorebooks.length ? loreLinking : "none";
  save.characterLinking = lorebooks.length ? characterLinking : "none";
  save.lorePending = lorebooks.length > 0 && (loreLinking === "keywords" || characterLinking === "keywords");
  save.landscape = landscapeWith(hashString(save.seed), choices);
  save.choices = choices ?? null;
  // A new world starts with the persona and cast of the one played last.
  save.persona = core.personaId;
  save.cast = [...(core.cast ?? [])];
  core.saves.write(save);
  playWorld(save.id);
}

/** The New world choices a landscape amounts to, for a world saved before its choices were kept. */
function choicesOf(landscape) {
  const count = landscape?.outposts?.length ?? 0;
  return {
    hills: landscape?.hills,
    mountains: ["none", "one", "two", "three"][landscape?.mountains?.length ?? 0],
    river: landscape?.river ? "yes" : "no",
    places: count === 0 ? "none" : count <= 2 ? "few" : "several",
  };
}

/**
 * Builds the world on screen afresh from its New world choices with this version's land, keeping its
 * people, relationships, party, notes, lore and names. `reshuffle` also gives it a new seed (a new town
 * layout and land); its setup still stands: each place's name, lore and groups move to the same kind of
 * place in the new layout (zones.js `remapZones`). The player starts again at the square.
 */
function regenerateWorld(reshuffle = false) {
  const save = core.save;
  if (!save) return;
  savePlace(true);
  const choices = core.save.choices ?? choicesOf(core.save.landscape);
  const seed = reshuffle ? `world-${Date.now().toString(36)}` : core.save.seed;
  const landscape = core.save.choices || reshuffle ? landscapeWith(hashString(seed), choices) : core.save.landscape;
  const next = { ...core.save, seed, landscape, choices, place: null };
  if (reshuffle && core.zones) {
    // The setup stays: every place's name, lore and groups go to the same kind of place in the new layout.
    const built = createWorld(hashString(seed), landscape);
    const map = remapZones(core.zones, buildZones(built.layout, hashString(seed)));
    built.dispose();
    Object.assign(next, carrySetup({ ...core.save, groups: core.save.groups ?? null }, map));
  }
  core.saves.write(next);
  // Drop the world in memory so playing builds it again from the save.
  core.save = null;
  core.world?.dispose();
  core.world = null;
  core.hud?.closePanels();
  playWorld(next.id);
}

function suggestName() {
  const count = core.saves.list().length;
  return count ? `World ${count + 1}` : "My first world";
}

function deleteWorld(id) {
  core.saves.remove(id);
  if (core.save?.id === id) {
    core.save = null; // the world on screen is gone: it can't be continued or saved again
    core.world?.dispose();
    core.world = null;
  }
}

// ── Places ───────────────────────────────────────────────────────────────────

/** The names this world has given its places (by hand now, by the AI later). */
const placeNames = () => core.save?.names ?? {};

/**
 * A place's name here: renamed (unless `renamed` is false), or "Mira's house" for a home someone in the
 * cast lives in, or the default.
 */
function zoneName(zone, residents = null, renamed = true) {
  if (renamed && placeNames()[zone.id]) return nameOf(zone, placeNames());
  if (zone.kind === "building" && zone.buildingKind === "home" && residents?.get(zone.door)?.length) {
    const names = residents.get(zone.door);
    return `${names.length > 2 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : names.join(" and ")}'s house`;
  }
  return zone.name;
}

/** Buildings that hang a sign out from the wall as well as the one over the door. */
const HANGING_SIGNS = new Set(["tavern", "shop", "smithy"]);

/** A sign over the door of every shop, the tavern, the temple, the hall and the smithy. */
function placeSigns() {
  for (const sign of core.signs) sign.dispose();
  core.signs = [];
  for (const zone of core.zones.zones) {
    if (zone.kind !== "building" || !zone.sign) continue;
    const door = core.world.doors[zone.door];
    if (!door) continue;
    // Above the doorframe, flat on the wall: the step is 0.35 m out from it.
    const back = 0.29;
    const sign = createSign({
      x: door.step.x - Math.sin(door.angle) * back,
      y: heightAt(door.step.x, door.step.z) + 2.84,
      z: door.step.z - Math.cos(door.angle) * back,
      angle: door.angle,
      words: signOf(zone, placeNames()),
      boardUrl: `${ART}sign-wood.webp`,
    });
    if (!sign) return; // no canvas here
    sign.zone = zone;
    core.world.scene.add(sign.mesh);
    core.signs.push(sign);
    // The tavern, shops and smithy also hang a sign out over the sidewalk beside the door, on one of
    // the painted boards.
    if (!HANGING_SIGNS.has(zone.buildingKind)) continue;
    const side = hashString(zone.id) % 2 ? 1 : -1;
    const along = 1.05 * side; // at the edge of the door's segment, clear of its windows and awnings
    const hanging = createHangingSign({
      x: door.step.x - Math.sin(door.angle) * back + Math.cos(door.angle) * along,
      y: heightAt(door.step.x, door.step.z) + 3.3,
      z: door.step.z - Math.cos(door.angle) * back - Math.sin(door.angle) * along,
      angle: door.angle,
      words: signOf(zone, placeNames()),
      boardUrl: `${ART}sign-wood${1 + (hashString(`${zone.id}:board`) % 4)}.webp`,
    });
    if (!hanging) continue;
    hanging.zone = zone;
    core.world.scene.add(hanging.mesh);
    core.signs.push(hanging);
  }
}

/** Who lives where: door index → names. */
function residentsOf(snapshot) {
  const homes = new Map();
  for (const person of snapshot) {
    if (person.home === null) continue;
    if (!homes.has(person.home)) homes.set(person.home, []);
    homes.get(person.home).push(person.name);
  }
  return homes;
}

/** A person's (or the player's) zone: the building they're inside, or the place where they stand. */
function zoneOfPerson(person) {
  if (person.inDoor !== null && person.inDoor !== undefined) {
    return core.zones.byId.get(`building:${person.inDoor}`) ?? zoneAt(core.zones, person.x, person.z);
  }
  return zoneAt(core.zones, person.x, person.z);
}

/** Zone lines with this world's names: a copy of the zones whose names say who lives where. */
function namedZones(residents) {
  const names = {};
  for (const zone of core.zones.zones) names[zone.id] = zoneName(zone, residents);
  return names;
}

/**
 * What the Lore panel shows: every entry active here, nearest place first, with the place it's tied to,
 * its lorebook and (once the lorebooks are read) its text.
 */
function activeLore(zone, names) {
  const lore = core.save?.lore ?? {};
  const books = new Map((core.lorebooks ?? []).map((book) => [book.id, book]));
  const entries = loreSources(zone, names).flatMap((source) =>
    (lore[source.id] ?? []).map((entry) => {
      const book = books.get(entry.lorebookId);
      const found = book?.entries.find((item) => item.id === entry.entryId);
      return {
        title: found?.title ?? entry.title,
        book: book?.name ?? "",
        from: source.label,
        content: found?.content ?? null,
      };
    }),
  );
  return { place: names[zone.id], entries, loading: !core.lorebooks };
}

/**
 * Links the world's lorebooks to its places by exact names and keywords (zones.js `matchLore`): an
 * entry named or keyed "Briarwood", "the smithy" or "forest" goes to that place, and so on. Adds to
 * what's there. Done once when a world is made (if chosen), and again from Journal → World.
 */
function linkLore() {
  const save = core.save;
  if (!save || !core.zones) return Promise.resolve(0);
  return readLorebooks()
    .then((books) => {
      if (core.save?.id !== save.id) return 0;
      const chosen = books.filter((book) => core.save.lorebooks.includes(book.id));
      const names = namedZones(residentsOf(core.crowd.snapshot()));
      // Places and the world, and characters, each as the setup says (by name, or left alone).
      const places = core.save.loreLinking === "keywords";
      const people = core.save.characterLinking === "keywords";
      const found = matchLore(chosen, {
        zones: places ? core.zones : { zones: [] },
        names,
        groups: places ? placeGroups() : [],
        name: places ? core.save.name : "",
        characters: people ? (core.characters ?? []).filter((character) => core.cast?.has(character.id)) : [],
      });
      if (!places) delete found[WORLD_ID]; // "world" alone always matches: only with places on
      let count = Object.values(found).reduce((sum, entries) => sum + entries.length, 0);
      core.save = { ...core.save, lore: mergeLore(core.save.lore, found), lorePending: false };
      core.saves.write(core.save);
      if (people) count += setupCharactersFromLore(chosen);
      core.placesChanged = true;
      core.journalAt = 0;
      core.zoneCheck = 0;
      return count;
    })
    .catch((error) => {
      console.warn("[wanderworld] couldn't link lore", error);
      return 0;
    });
}

/**
 * Sets up the characters in town from their lore entries' keywords (relationships.js `setupFromWords`):
 * "male" / "female" picks their body, "enemy", "mentor", "sister"… how they see the player. Only what
 * isn't set yet: a body still on Auto, no relationship with the player. Returns how many things it set.
 */
function setupCharactersFromLore(books) {
  const entries = new Map(books.flatMap((book) => book.entries.map((entry) => [`${book.id}/${entry.id}`, entry])));
  let set = 0;
  for (const character of core.characters ?? []) {
    if (!core.cast?.has(character.id)) continue;
    const name = character.name.toLowerCase().trim();
    const words = (core.save.lore[`character:${character.id}`] ?? [])
      .map((tie) => entries.get(`${tie.lorebookId}/${tie.entryId}`))
      .filter(Boolean)
      .flatMap((entry) => [entry.title, ...(entry.keys ?? [])])
      .filter((word) => word.toLowerCase().trim() !== name);
    const { body, relation } = setupFromWords(words);
    if (body && !core.bodies[character.id]) {
      setBody(character.id, body);
      set++;
    }
    if (relation && !core.relations.get(character.id, "player")) {
      setRelation(character.id, "player", relation, false);
      set++;
    }
    // "brother of Sarah", "son of Zoey": how they stand toward someone else in town, or the player.
    for (const link of linksFromWords(words)) {
      const to = whoIsNamed(link.name);
      if (!to || to === character.id || core.relations.get(character.id, to)) continue;
      setRelation(character.id, to, link.relation, false);
      set++;
    }
  }
  return set;
}

/** Who a name in a lore keyword means: a character in town, or the player ("you", "player", their persona's name). */
function whoIsNamed(name) {
  const plainName = (text) =>
    String(text ?? "")
      .toLowerCase()
      .trim()
      .replace(/^(the|a|an)\s+/u, "");
  const wanted = plainName(name);
  if (["you", "player", plainName(personaName())].includes(wanted)) return "player";
  const character = (core.characters ?? []).find(
    (entry) => core.cast?.has(entry.id) && plainName(entry.name) === wanted,
  );
  return character?.id ?? null;
}

/** Changes the world's setup from Journal → World: its setting words, lorebooks or how lore is linked. */
function setSetup(fields) {
  if (!core.save) return;
  core.save = { ...core.save, ...fields };
  core.saves.write(core.save);
  core.placesChanged = true;
  core.journalAt = 0;
}

/** Opens the Lore panel: the lore active where the player is (reading the lorebooks' text if needed). */
function openLore() {
  core.zoneCheck = 0;
  if (!core.lorebooks)
    readLorebooks()
      .then(() => (core.zoneCheck = 0))
      .catch((error) => console.warn("[wanderworld] couldn't read lorebooks", error));
}

/** Lorebook entries tied to a zone or the zones it sits in. */
function loreAt(zone) {
  const lore = core.save?.lore ?? {};
  return loreSources(zone).flatMap((source) => lore[source.id] ?? []);
}

/**
 * Everything whose lore is active here, nearest first: the people you're talking with or travelling
 * with, the place and the places it sits in, the groups those are in, and the whole world.
 * Each { id, label }.
 */
function loreSources(zone, names = {}) {
  const chain = core.zones ? chainOf(core.zones, zone) : [];
  const people = new Map();
  if (core.talking) people.set(core.talking.id, `${core.talking.name} (talking)`);
  for (const member of core.crowd.party())
    if (!people.has(member.id)) people.set(member.id, `${member.name} (in your party)`);
  return [
    ...[...people].map(([id, label]) => ({ id: `character:${id}`, label })),
    ...chain.map((at) => ({ id: at.id, label: names[at.id] ?? at.name })),
    ...groupsAt(placeGroups(), chain).map((group) => ({ id: group.id, label: `${group.name} (group)` })),
    { id: WORLD_ID, label: `${core.save?.name ?? "the world"} (the whole world)` },
  ];
}

/** This world's place groups: the saved ones, or the defaults until they're changed. */
function placeGroups() {
  if (!core.zones) return [];
  return core.save?.groups ?? defaultGroups(core.zones);
}

/** Changes the place groups with `change(groups)` → new groups, and saves them. */
function editGroups(change) {
  if (!core.save) return;
  core.save = { ...core.save, groups: change(placeGroups().map((group) => ({ ...group }))) };
  core.saves.write(core.save);
  core.placesChanged = true;
  core.journalAt = 0;
  core.zoneCheck = 0;
}

const groupHandlers = {
  onGroupCreate: (name) =>
    editGroups((groups) => [...groups, { id: newGroupId(groups, name), name: name || "New group", members: [] }]),
  onGroupRename: (id, name) =>
    editGroups((groups) => groups.map((group) => (group.id === id ? { ...group, name: name || group.name } : group))),
  onGroupDelete: (id) => {
    editGroups((groups) => groups.filter((group) => group.id !== id));
    if (core.save?.lore[id]) {
      const lore = { ...core.save.lore };
      delete lore[id];
      core.save = { ...core.save, lore };
      core.saves.write(core.save);
    }
  },
  onGroupParent: (id, parent) =>
    editGroups((groups) => groups.map((group) => (group.id === id ? { ...group, parent: parent || null } : group))),
  onGroupMember: (id, zoneId, on) =>
    editGroups((groups) =>
      groups.map((group) =>
        group.id !== id
          ? group
          : {
              ...group,
              members: on
                ? [...new Set([...group.members, zoneId])]
                : group.members.filter((member) => member !== zoneId),
            },
      ),
    ),
};

/** Keeps the place line, the big place name and (when open) the Journal up to date. */
function stepPlaces(dt) {
  if (!core.zones) return;
  core.zoneCheck -= dt;
  core.journalAt -= dt;
  if (core.zoneCheck > 0) return;
  core.zoneCheck = 0.25;
  const position = core.player.position;
  const zone = core.interior
    ? (core.zones.byId.get(`building:${core.interior.door.index}`) ?? zoneAt(core.zones, position.x, position.z))
    : zoneAt(core.zones, position.x, position.z);
  const snapshot = core.crowd.snapshot();
  const residents = residentsOf(snapshot);
  const names = namedZones(residents);
  if (zone.id !== core.zoneId) {
    core.zoneId = zone.id;
    core.zoneSince = core.clock;
  }
  if (core.zoneShown !== zone.id && core.clock - core.zoneSince >= ZONE_SETTLE) {
    // The town's own name the first time; after that the place itself.
    if (core.zoneShown !== null || zone.kind !== "town") core.hud?.showZone(names[zone.id]);
    core.zoneShown = zone.id;
  }
  const lore = loreAt(zone).map((entry) => entry.title);
  const town = names.town;
  core.hud?.setPlace(zone.id === "town" ? town : `${town} · ${names[zone.id]}`, lore);
  if (core.hud?.loreOpen()) core.hud.setLore(activeLore(zone, names));
  if (core.journalAt <= 0) {
    core.journalAt = 0.5;
    core.hud?.journal.render(journalData(zone, snapshot, residents, names));
    core.partyChanged = false;
    core.relationsChanged = false;
    core.placesChanged = false;
  }
}

/** Everything the Journal shows, in the words the AI will get later. */
function journalData(zone, snapshot, residents, names) {
  const zones = core.zones;
  const say = (who) => describe(zones, who, names);
  const playerWho = {
    name: personaName(),
    state: core.mode === "sit" ? "sit" : core.mode === "talk" ? "talk" : "idle",
    seat: core.mode === "sit",
    talkingTo: core.talking?.name ?? null,
    zone,
  };
  const position = core.player.position;
  const lines = snapshot.map((person) => ({
    person,
    distance: Math.hypot(person.x - position.x, person.z - position.z),
    line: say({
      name: person.name,
      state: person.state,
      seat: person.seated,
      zone: zoneOfPerson(person),
    }),
  }));
  const nearby = lines
    .filter((entry) => entry.person.state !== "inside" && !entry.person.inRoom && entry.distance < NEARBY)
    .sort((a, b) => a.distance - b.distance)
    .map((entry) => entry.line);
  const lore = core.save?.lore ?? {};
  return {
    here: {
      place: say(playerWho),
      chain: [
        ...chainOf(zones, zone).map((at) => names[at.id]),
        ...groupsAt(placeGroups(), chainOf(zones, zone)).map((group) => group.name),
      ].join(" · "),
      lore: loreAt(zone),
      nearby,
      scenes: (core.save?.scenes ?? []).slice(-3).reverse().map(describeScene),
    },
    people: lines.map((entry) => {
      const toYou = core.relations.get(entry.person.id, "player");
      return toYou
        ? `${entry.line}. ${core.relations.describe(entry.person.id, "player", { ...nameIds(), player: "you" })}.`
        : entry.line;
    }),
    relations: relationsData(),
    party: core.crowd.party(),
    relationsChanged: core.relationsChanged,
    partyChanged: core.partyChanged,
    worldLore: { id: WORLD_ID, name: core.save?.name ?? "This world", lore: (lore[WORLD_ID] ?? []).length },
    characters: (core.characters ?? [])
      .filter((character) => core.cast?.has(character.id))
      .map((character) => ({
        id: `character:${character.id}`,
        name: character.name,
        lore: (lore[`character:${character.id}`] ?? []).length,
      })),
    places: zones.zones.map((at) => ({
      id: at.id,
      parent: at.parent,
      kind: at.kind === "building" ? at.buildingKind : at.kind,
      name: names[at.id],
      defaultName: zoneName(at, residents, false),
      lore: (lore[at.id] ?? []).length,
    })),
    groups: placeGroups().map((group) => ({ ...group, lore: (lore[group.id] ?? []).length })),
    placesChanged: core.placesChanged,
    world: {
      setting: core.save?.setting ?? "",
      lorebooks: core.save?.lorebooks ?? [],
      loreLinking: core.save?.loreLinking ?? "none",
      characterLinking: core.save?.characterLinking ?? "none",
      allLorebooks: core.lorebooks?.map((book) => ({ id: book.id, name: book.name })) ?? null,
      name: core.save?.name ?? "",
      town: names.town,
      time: clockText(),
      people: snapshot.length,
      seed: core.seed,
    },
  };
}

/** Renames a place in this world (an empty name puts its default back); its sign changes with it. */
function renameZone(id, name) {
  if (!core.save) return;
  const names = { ...core.save.names };
  if (name) names[id] = name;
  else delete names[id];
  core.save = { ...core.save, names };
  core.saves.write(core.save);
  for (const sign of core.signs) if (sign.zone.id === id) sign.setWords(signOf(sign.zone, names));
  core.zoneShown = core.zoneId; // no big title for a rename
  core.journalAt = 0;
  core.zoneCheck = 0;
}

/** The Engine's lorebooks with their entries: [{ id, name, entries: [{ id, title }] }], read once. */
async function readLorebooks() {
  if (core.lorebooks?.length) return core.lorebooks; // none yet (or none found): ask again
  const getJson = async (path) => {
    const response = await fetch(path, { credentials: "same-origin" });
    if (!response.ok) throw new Error(`GET ${path} → ${response.status}`);
    return response.json();
  };
  const books = await getJson("/api/lorebooks");
  const list = Array.isArray(books) ? books : (books?.items ?? books?.lorebooks ?? []);
  core.lorebooks = await Promise.all(
    list.map(async (book) => {
      let entries = [];
      try {
        const raw = await getJson(`/api/lorebooks/${encodeURIComponent(book.id)}/entries`);
        entries = (Array.isArray(raw) ? raw : (raw?.items ?? raw?.entries ?? [])).map((entry) => ({
          id: String(entry.id),
          title: String(
            entry.name || entry.comment || (Array.isArray(entry.keys) ? entry.keys.join(", ") : "") || "Entry",
          ),
          content: typeof entry.content === "string" ? entry.content.slice(0, 4000) : "",
          // Its keywords, for linking it to places by name.
          keys: (Array.isArray(entry.keys) ? entry.keys : typeof entry.keys === "string" ? entry.keys.split(",") : [])
            .map((key) => String(key).trim())
            .filter(Boolean),
        }));
      } catch (error) {
        console.warn(`[wanderworld] couldn't read lorebook ${book.name}`, error);
      }
      return { id: String(book.id), name: String(book.name ?? "Lorebook"), entries };
    }),
  );
  return core.lorebooks;
}

/** Opens the lore picker for a place: tick entries to make them active there. */
function editZoneLore(id) {
  const zone = core.zones?.byId.get(id);
  const group = placeGroups().find((entry) => entry.id === id);
  const character = id.startsWith("character:")
    ? (core.characters ?? []).find((entry) => `character:${entry.id}` === id)
    : null;
  if ((!zone && !group && !character && id !== WORLD_ID) || !core.save) return;
  const title = character
    ? character.name
    : id === WORLD_ID
      ? `the whole world (${core.save.name})`
      : group
        ? group.name
        : zoneName(zone, residentsOf(core.crowd.snapshot()));
  const chosen = () => new Set((core.save.lore[id] ?? []).map((entry) => `${entry.lorebookId}/${entry.entryId}`));
  const toggle = (book, entry, on) => {
    const kept = (core.save.lore[id] ?? []).filter((at) => !(at.lorebookId === book.id && at.entryId === entry.id));
    if (on) kept.push({ lorebookId: book.id, entryId: entry.id, title: entry.title });
    const lore = { ...core.save.lore };
    if (kept.length) lore[id] = kept;
    else delete lore[id];
    core.save = { ...core.save, lore };
    core.saves.write(core.save);
    core.zoneCheck = 0;
  };
  core.hud?.journal.showLore(title, null, chosen(), toggle);
  readLorebooks()
    .then((books) => core.hud?.journal.showLore(title, books, chosen(), toggle))
    .catch((error) => {
      console.warn("[wanderworld] couldn't read lorebooks", error);
      core.hud?.journal.showLore(title, [], chosen(), toggle);
    });
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
  savePlace(true);
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
  // Someone new in town: their lore (and what it says about them) links up as the world's setup says.
  if (chosen && core.save?.characterLinking === "keywords" && core.save.lorebooks.length) void linkLore();
}

/** Reads the Engine's personas and characters once, then restores the remembered persona and cast. */
async function loadPeople() {
  if (core.personas) return;
  core.hud?.setLoading("Loading Wanderworld…");
  const [personas, characters] = await Promise.all([listPersonas(), listCharacters()]);
  core.personas = personas;
  core.characters = characters;
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
  core.cast = core.cast ?? new Set();
  core.hud?.setCharacters(characters, core.cast, core.bodies);
  const remembered = readStored(PERSONA_KEY);
  core.personaId = (personas.find((entry) => entry.id === remembered) ?? personas[0] ?? null)?.id ?? null;
  core.hud?.setPersonas(personas, core.personaId, core.bodies);
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
  core.talking = { id: person.id, name: person.name, group, said: 0, asked: [] };
  glideTo(x, z, Math.atan2(-dx, -dz), 0.5);
  core.hud?.setBusy(true);
  core.hud?.setPrompt(null);
  core.talk.start(person.name);
  core.talk.setInParty(core.crowd.inParty(person.id));
  core.talk.setChoices(choicesFor(), choose);
  later(0.6, () => answer(core.talking, "greet"));
}

/** The person you're talking to joins the party, or leaves it. */
function toggleParty() {
  const talking = core.talking;
  if (!talking) return;
  const joining = !core.crowd.inParty(talking.id);
  core.crowd.setFollowing(talking.id, joining);
  core.talk.setInParty(joining);
  core.talk.line(
    null,
    joining ? `${talking.name} comes along with you.` : `${talking.name} goes back to their day.`,
    true,
  );
  partyChanged();
}

/** This world's relationships: the crowd behaves by them and they're saved with the world. */
function useRelations(relations) {
  core.relations = relations;
  core.crowd.setRelations((from, to) => relations.feeling(from, to));
  core.crowd.setTraits((id) => checkTraits(core.save?.traits?.[id]));
}

/** Everyone who can have relationships here, id → name: the player's persona ("player") and the cast. */
function nameIds() {
  const names = { player: personaName() };
  for (const character of core.characters ?? []) if (core.cast?.has(character.id)) names[character.id] = character.name;
  return names;
}

/** What the Journal's Relationships tab shows: the kinds, everyone, and every record. */
function relationsData() {
  const names = nameIds();
  return {
    kinds: Object.entries(KINDS).map(([id, kind]) => ({ id, label: kind.label, roles: kind.roles ?? [] })),
    traitKinds: Object.entries(TRAITS).map(([id, trait]) => ({ id, ...trait })),
    traits: Object.fromEntries(
      Object.keys(names)
        .filter((id) => id !== "player")
        .map((id) => [id, checkTraits(core.save?.traits?.[id])]),
    ),
    people: Object.entries(names).map(([id, name]) => ({ id, name: id === "player" ? `${name} (you)` : name })),
    records: core.relations.all.map((record) => ({
      ...record,
      tier: tierOf(record.kind, record.level),
      words: `${names[record.from] ?? record.from} ${phraseOf(record.kind, record.level)} ${names[record.to] ?? record.to}`,
    })),
  };
}

/** Sets (or with null clears) how `from` sees `to`; `both` sets the other way too. Saved with the world. */
function setRelation(from, to, fields, both = false) {
  core.relations.set(from, to, fields);
  if (both) core.relations.set(to, from, fields ? { kind: fields.kind, level: fields.level, role: "" } : null);
  if (core.save) {
    core.save = { ...core.save, relationships: core.relations.all };
    core.saves.write(core.save);
  }
  core.relationsChanged = true;
  core.journalAt = 0;
  core.zoneCheck = 0;
}

/** Sets a character's temperament (saved with the world). */
function setTraits(id, traits) {
  if (!core.save) return;
  core.save = { ...core.save, traits: { ...core.save.traits, [id]: checkTraits(traits) } };
  core.saves.write(core.save);
  core.relationsChanged = true;
  core.journalAt = 0;
}

/**
 * Whether confronting (and, later, fighting) may happen at (x, z), by Settings: anywhere, only outside
 * towns, only outside safe places (the town and the inns and cottages out in the country), or nowhere.
 */
function aggressionAllowed(x, z) {
  const rule = core.settings.combat;
  if (rule === "anywhere") return true;
  if (rule === "off" || !core.zones) return false;
  const chain = chainOf(core.zones, zoneAt(core.zones, x, z));
  if (chain.some((zone) => zone.kind === "town")) return false;
  return rule === "outsideTowns" || !chain.some((zone) => zone.kind === "outpost");
}

/** Saves the party and redraws its Journal tab. */
function partyChanged() {
  core.partyChanged = true;
  core.journalAt = 0;
  core.zoneCheck = 0;
  savePlace(true);
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
  later(1.6, () => answer(talking, "answer"));
}

/** The words a conversation's lines can use: who's talking, the town and a few of its places. */
function talkWords(name) {
  const names = core.zones ? namedZones(residentsOf(core.crowd.snapshot())) : {};
  const find = (test) => core.zones?.zones.find(test);
  const title = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : text);
  const tavern = find((zone) => zone.buildingKind === "tavern");
  const wild = find((zone) => zone.kind === "forest") ?? find((zone) => zone.kind === "mountains");
  const street = find((zone) => zone.kind === "street");
  return {
    name,
    you: personaName(),
    town: names.town ?? "town",
    tavern: tavern ? title(names[tavern.id]) : "The tavern",
    wild: wild ? names[wild.id] : "the woods",
    street: street ? names[street.id] : "the high street",
    greeting: greetingFor(core.hour),
  };
}

/** The one you're talking to answers (`what`: "greet", "bye", "answer" or a topic, dialogue.js). */
function answer(talking, what) {
  if (core.talking !== talking) return;
  const mood = moodOf(core.relations.feeling(talking.id, "player"));
  const reply = lineFor(what, mood, talkWords(talking.name));
  core.crowd.setSpeaking(talking.id, true);
  core.talk.say(talking.group, reply, 4.5);
  core.talk.line(talking.name, reply);
  later(2.6, () => {
    if (core.talking === talking) core.crowd.setSpeaking(talking.id, false);
  });
}

/** The player picks something to say from the choices. */
function choose(id) {
  const talking = core.talking;
  if (!talking) return;
  const text = labelOf(id);
  core.talk.line(personaName(), text);
  core.talk.say(core.player, text, 3);
  if (id === "bye") {
    core.talk.setChoices([], () => {});
    later(0.7, () => answer(talking, "bye"));
    later(2.4, () => {
      if (core.talking === talking) endTalk();
    });
    return;
  }
  talking.asked.push(id);
  core.talk.setChoices(choicesFor(talking.asked), choose);
  later(0.8, () => answer(talking, id));
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
 * A card for using a place or thing (a door, a cave's mouth, the fountain): who's there, what can be
 * done (interactions.js), the player's own line and who comes along. Choosing sets up a scene request,
 * saved with the world, for the AI part to play out (docs/CONCEPT.md, S1).
 * `thing`: { kind, zone (where it is), title, inside: [{ id, name }], empty (said when nobody's there) }.
 */
function openScene(thing) {
  const names = core.zones ? namedZones(residentsOf(core.crowd.snapshot())) : {};
  const chain =
    core.zones && thing.zone
      ? chainOf(core.zones, thing.zone)
          .slice(1)
          .map((zone) => names[zone.id])
      : [];
  const party = core.crowd
    .party()
    .filter((member) => !member.waiting)
    .map((member) => ({ id: member.id, name: member.name }));
  const title = thing.title.charAt(0).toUpperCase() + thing.title.slice(1);
  core.hud.setScene(
    {
      title,
      people: thing.inside.map((person) => person.name),
      empty: thing.empty,
      party,
      actions: (ACTIONS[thing.kind] ?? []).map(({ id, label }) => ({ id, label })),
    },
    (action, line, along) => {
      const request = sceneRequest({
        thing: { kind: thing.kind, name: thing.title, chain },
        action,
        line,
        inside: thing.inside,
        party: party.filter((member) => along.includes(member.id)),
        persona: { id: "player", name: personaName() },
        hour: core.hour,
      });
      if (!request) return null;
      if (core.save) {
        core.save = { ...core.save, scenes: [...(core.save.scenes ?? []), request].slice(-30) };
        core.saves.write(core.save);
      }
      core.journalAt = 0;
      return describeScene(request);
    },
  );
}

/** A building's door: it opens, and its card says who's inside. */
function knock(door) {
  core.world.setDoor(door.index, true, 4);
  core.sound.door();
  core.sceneDoor = door;
  const zone = core.zones?.byId.get(`building:${door.index}`);
  openScene({
    kind: "door",
    zone,
    title: zone ? zoneName(zone, residentsOf(core.crowd.snapshot())) : (PLACE_NAMES[door.kind] ?? "a house"),
    inside: core.crowd.inside(door).map((person) => ({ id: person.id, name: person.name })),
    empty: "Nobody seems to be in.",
  });
}

/** The fountain on the market square. */
function useFountain(spot) {
  core.sceneDoor = spot;
  const zone = core.zones?.zones.find((at) => at.kind === "fountain");
  const near = core.crowd
    .snapshot()
    .filter((person) => person.state !== "inside" && Math.hypot(person.x - spot.x, person.z - spot.z) < 8);
  openScene({
    kind: "fountain",
    zone,
    title: zone ? zoneName(zone) : "the fountain",
    inside: near.map((person) => ({ id: person.id, name: person.name })),
  });
}

/**
 * What's on the noticeboard: a few notes about the town (from its places' names, so they fit this world)
 * and whatever the player has pinned. Later the AI pins quests and news here (docs/CONCEPT.md, S4).
 */
function noticeboardNotes() {
  const names = namedZones(residentsOf(core.crowd.snapshot()));
  const find = (test) => core.zones.zones.find(test);
  const tavern = find((zone) => zone.buildingKind === "tavern");
  const street = find((zone) => zone.kind === "street");
  const smithy = find((zone) => zone.buildingKind === "smithy");
  const wild = find((zone) => zone.kind === "mountains") ?? find((zone) => zone.kind === "forest");
  const river = find((zone) => zone.kind === "river");
  const title = (text) => text.charAt(0).toUpperCase() + text.slice(1);
  const town = [
    { text: `Market every morning in ${names.plaza}. Fresh apples, honest scales.`, by: "the market warden" },
    tavern && { text: `${title(names[tavern.id])}: warm stew, cold ale and a bed for the night.`, by: null },
    street && {
      text: `LOST: a grey cat who answers to Pip. Last seen on ${names[street.id]}. Reward offered!`,
      by: "a worried neighbour",
    },
    smithy && {
      text: `${title(names[smithy.id])} mends pots, shoes horses and sharpens anything with an edge.`,
      by: null,
    },
    river && { text: `Keep children back from ${names.river} after rain. The banks give way.`, by: "the reeve" },
    wild && { text: `Wolves heard near ${names[wild.id]} at dusk. Travel in company.`, by: "the watch" },
  ].filter(Boolean);
  // A handful, the same ones for this world.
  const pick = town.filter((_, i) => (hashString(`${core.seed}:note`) >> i) & 1 || i < 2).slice(0, 4);
  const mine = (core.save?.notices ?? []).map((note) => ({
    id: note.id,
    text: note.text,
    by: note.by || personaName(),
    mine: true,
  }));
  return [...pick.map((note, i) => ({ id: `town:${i}`, ...note })), ...mine];
}

function openNoticeboard() {
  core.sceneDoor = core.world.noticeboard.use; // walking away closes it, like a door's card
  const town = core.zones ? namedZones(residentsOf(core.crowd.snapshot())).town : "town";
  const show = () => {
    const notes = noticeboardNotes();
    core.board?.setNotes(Math.min(5, notes.length));
    core.hud?.setNoticeboard(
      { title: `The ${town} noticeboard`, notes },
      {
        onPin: (text) => {
          if (!core.save) return;
          const note = { id: `n${Date.now().toString(36)}`, text, by: personaName(), at: Date.now() };
          core.save = { ...core.save, notices: [...core.save.notices, note] };
          core.saves.write(core.save);
          show();
        },
        onRemove: (id) => {
          if (!core.save) return;
          core.save = { ...core.save, notices: core.save.notices.filter((note) => note.id !== id) };
          core.saves.write(core.save);
          show();
        },
      },
    );
  };
  show();
}

/** A cave's mouth: a card like a door's, for starting a scene in there later. */
function enterCave(cave) {
  const zone = core.zones?.byId.get(`cave:${cave.outpost}`);
  const title = zone ? zoneName(zone) : "A cave";
  core.sceneDoor = cave;
  openScene({ kind: "cave", zone, title, inside: [], empty: "It's dark in there, and quiet." });
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
  const board = core.interior ? null : core.world?.noticeboard;
  if (board) {
    list.push({
      kind: "board",
      label: "Read the noticeboard",
      x: board.use.x,
      z: board.use.z,
      y: 2.2,
      act: openNoticeboard,
    });
  }
  const fountain = core.interior ? null : core.world?.fountain;
  if (fountain) {
    // Wherever the player is round the rim: the nearest point on it.
    const { x, z } = core.player.position;
    const away = Math.hypot(x - fountain.x, z - fountain.z) || 1;
    const spot = {
      x: fountain.x + ((x - fountain.x) / away) * (fountain.r + 0.6),
      z: fountain.z + ((z - fountain.z) / away) * (fountain.r + 0.6),
    };
    list.push({ kind: "thing", label: "Use the fountain", ...spot, y: 1.6, act: () => useFountain(spot) });
  }
  for (const cave of core.interior ? [] : (core.world?.caves ?? [])) {
    list.push({
      kind: "door",
      label: "Go in",
      x: cave.x,
      z: cave.z,
      y: 1.6,
      mark: cave.mouth,
      act: () => enterCave(cave),
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
  core.hud?.setClock(clockText());
}

/** The time in town to the ten minutes: "09:40". */
function clockText() {
  const hours = Math.floor(core.hour);
  const minutes = Math.floor((core.hour - hours) * 60);
  return `${String(hours).padStart(2, "0")}:${String(Math.floor(minutes / 10) * 10).padStart(2, "0")}`;
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
    // In the river: swimming in deep water, wading slower where it's shallower.
    const water = core.interior ? null : waterAt(position.x, position.z);
    if (water?.depth > SWIM_DEPTH) speedFactor = input.run ? SWIM_SPRINT : SWIM_SPEED * input.amount;
    else if (water?.depth > WADE_DEPTH) speedFactor *= 0.55;
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
      // Walking and running each have their own speed setting (a tap's walk is a walk).
      const running = input.run && !walkTo;
      const speed = speedFactor * (running ? core.settings.runSpeed : core.settings.walkSpeed);
      position.x += moveX * speed * dt;
      position.z += moveZ * speed * dt;
      space.resolveCollisions(position, PLAYER_RADIUS, true); // the player may go into the water
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
  // Swimming, the body floats at the surface (the swim clips hold the head just above it).
  const water = core.interior ? null : waterAt(position.x, position.z);
  core.swimming = !!water && water.depth > SWIM_DEPTH && core.mode === "walk";
  position.y = core.interior ? 0 : core.swimming ? water.level : heightAt(position.x, position.z);
  core.shadow.visible = core.settings.shadows && !core.swimming;
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
  const overWater = core.interior ? null : waterAt(cameraX, cameraZ);
  const ground = core.interior ? 0 : overWater.depth > 0 ? overWater.level : heightAt(cameraX, cameraZ);
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
  if (input?.take("journal")) core.hud?.toggleJournal();

  stepClock(dt);
  stepPlaces(dt);
  if (core.save && core.clock - core.thumbnailAt > THUMBNAIL_EVERY) {
    core.thumbnailAt = core.clock;
    savePlace(true, captureThumbnail());
  }
  const speed = movePlayer(dt, read);
  let lookAt = null;
  if (core.talking) {
    const other = core.talking.group.position;
    const turn =
      Math.atan2(other.x - core.player.position.x, other.z - core.player.position.z) - core.player.rotation.y;
    lookAt = Math.atan2(Math.sin(turn), Math.cos(turn));
  }
  const pose = core.character?.update(dt, speed, {
    sit: core.mode === "sit",
    lookAt,
    talk: false,
    swim: core.swimming,
  });
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
  for (const sign of core.signs) sign.update?.(dt);
  if (!core.interior) core.world.follow(core.player.position.x, core.player.position.z);
  // Walking away from a door closes its card.
  const card = core.sceneDoor;
  if (card && Math.hypot(card.x - core.player.position.x, card.z - core.player.position.z) > 4) {
    core.sceneDoor = null;
    core.hud.setScene(null);
    core.hud.setNoticeboard(null);
  }
  viewProjection.multiplyMatrices(core.camera.projectionMatrix, core.camera.matrixWorldInverse);
  frustum.setFromProjectionMatrix(viewProjection);
  const inside = !!core.interior;
  core.crowd.update(dt, {
    player: core.player.position,
    space: core.space,
    playerSitting: core.mode === "sit",
    playerAngle: core.player.rotation.y,
    playerSpeed: speed,
    hour: core.hour,
    time: core.clock,
    isVisible: (position) => frustum.containsPoint(projected.set(position.x, position.y + 1, position.z)),
    onFootstep: (position, running, distance) => core.sound.footstep(distance, running),
    onSay: (group, text) => core.talk?.say(group, text, 3.5),
    playerName: personaName(),
    aggressionAllowed,
    approach: core.settings.approach,
    approachMax: core.settings.approachMax,
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
  if (core.mode === "talk" || core.hud?.boardOpen) core.hud?.setPrompt(null);
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
  if (!core.world || core.paused) return;
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
    onMenu: openMenu,
    onRenameZone: renameZone,
    onPartyWait: (id, wait) => {
      core.crowd.setWaiting(id, wait);
      partyChanged();
    },
    onSetRelation: setRelation,
    onSetTraits: setTraits,
    onPartyLeave: (id) => {
      core.crowd.setFollowing(id, false);
      partyChanged();
    },
    // Everyone standing right round the player (a small circle) joins; everyone in the party leaves.
    onPartyGather: () => {
      const { x, z } = core.player.position;
      const near = core.crowd
        .present(core.space)
        .filter((person) => Math.hypot(person.position.x - x, person.position.z - z) <= GATHER_RADIUS);
      const joining = near.filter((person) => !core.crowd.inParty(person.id));
      for (const person of joining) core.crowd.setFollowing(person.id, true);
      core.hud?.setNotice(
        joining.length === 1
          ? `${joining[0].name} comes along with you.`
          : joining.length
            ? `${joining.length} people come along with you.`
            : near.length
              ? "Everyone close by is already with you."
              : "Nobody's standing close enough. Walk up to them first.",
      );
      partyChanged();
    },
    onPartyDisband: () => {
      for (const member of core.crowd.party()) core.crowd.setFollowing(member.id, false);
      partyChanged();
    },
    onZoneLore: editZoneLore,
    onSetSetup: setSetup,
    onLinkLore: () =>
      linkLore().then((count) =>
        core.hud?.setNotice(
          count
            ? `Linked ${count} lore entries and character details (body, how they see you) by name.`
            : "No entries matched a place, group or character by name.",
        ),
      ),
    onWantLorebooks: () => {
      if (core.lorebooksAsked) return; // once: the World tab redraws while they're read
      core.lorebooksAsked = true;
      readLorebooks()
        .catch((error) => {
          console.warn("[wanderworld] couldn't read lorebooks", error);
          core.lorebooks = []; // shown as none found (a later picker opens tries again)
        })
        .finally(() => {
          core.placesChanged = true;
          core.journalAt = 0;
        });
    },
    ...groupHandlers,
    onOpenLore: openLore,
    onToggleFullscreen: toggleFullscreen,
    onPickPersona: (id) => void choosePersona(id),
    onToggleCharacter: toggleCharacter,
    onSetBody: setBody,
    onSetting: changeSetting,
    onRegenerate: regenerateWorld,
    onUse: () => {
      core.sound.unlock();
      use();
    },
    maxPeople: MAX_PEOPLE,
    loadingArt: `${ART}loading-bg.webp`,
  });
  core.talk = createTalk(core.hud.layer, { onSend: say, onLeave: endTalk, onParty: toggleParty });
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
  core.menu = createMenu(
    core.hud.layer,
    {
      list: () => core.saves.list(),
      last: () => core.saves.last(),
      onPlay: playWorld,
      onCreate: createNewWorld,
      lorebooks: () => readLorebooks().then((books) => books.map((book) => ({ id: book.id, name: book.name }))),
      onRename: (id, name) => {
        core.saves.rename(id, name);
        if (core.save?.id === id) core.save = { ...core.save, name };
      },
      onDelete: deleteWorld,
      onSettings: () => core.hud?.openSettings(),
      suggestName,
    },
    {
      background: `${ART}menu-bg.webp`,
      portrait: `${ART}menu-bg-portrait.webp`,
      logo: `${ART}logo.webp`,
    },
  );
  core.saves.migrate(); // the one world from before saves becomes the first saved world
  if (core.personas) {
    core.hud.setPersonas(core.personas, core.personaId, core.bodies);
    core.hud.setCharacters(core.characters ?? [], core.cast ?? new Set(), core.bodies);
  } else {
    void loadPeople();
  }
  // Back to the tab with a world in play: carry on. Otherwise the main menu.
  if (core.world && core.save) resume();
  else openMenu();
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
  if (!core.paused) savePlace(true);
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
