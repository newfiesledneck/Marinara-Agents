// Wanderworld: a Home screen game that draws a low-poly three.js town and walks your persona around it.
//
// The Engine mounts this element once, with view="browser", as the package's Home tab. The canvas, the
// HUD and the touch stick all live inside it. The renderer is created once per page and reused when the
// tab is closed and reopened, so switching tabs never piles up WebGL contexts.
//
// The player is in one of four modes: walking, sitting (on a bench or chair), talking (to a townsperson)
// or going through a door. "Space" is wherever they are: the town, or the room inside a building; both
// offer the same collision, camera and seat calls.
import {
  ConeGeometry,
  CylinderGeometry,
  Frustum,
  Group,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  PerspectiveCamera,
  Plane,
  PointLight,
  Raycaster,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { blobShadow, listCharacterFolders, listCharacters, listPersonas, setAnimationStyle } from "./character.js";
import { LIE_SECONDS } from "./clips.js";
import { createFigure } from "./figure.js";
import { createHud } from "./hud.js";
import { createInput } from "./input.js";
import { createInterior } from "./interiors.js";
import { BUILT_IN, findModel, loadModelCharacter, modelKinds } from "./models.js";
import { summariseSetup } from "./setup.js";
import { HELP, KEYWORD_PROMPT } from "./help.js";
import { actWords, arrivalLine, errandFor, PACK, pickLine, PROP_THINGS, thingLine } from "./pack.js";
import {
  ANIMAL_SIZES,
  creatureFromWords,
  petsFromLore,
  quietFromLore,
  spawnsFromLore,
  structureFromKeywords,
  knowingFromWords,
  readKeys,
  stanceFromWords,
  traitsFromWords,
  unknownKeywords,
  voiceFromWords,
  VOICES,
  worldFromLore,
} from "./keywords.js";
import { createPerson, lookChoices } from "./people.js";
import { checkLook } from "./looks.js";
import { approachAngle, createCrowd, MAX_PEOPLE } from "./npcs.js";
import { createHerd } from "./herd.js";
import { createSocial } from "./social.js";
import { ago, createMemories, heardBy, heardLines, MEMORY, toldShares } from "./memory.js";
import { eventOn, eventOpen, goesTo, standAt } from "./events.js";
import {
  FURNITURE,
  homeToLeaveFor,
  housingAfterMove,
  placeFurniture,
  vacantHomes,
  VISIT_HOURS,
  visitFrom,
  visitOver,
} from "./household.js";
import { ANIMALS, animalKind, COATS, coatFor, DOG_SIZES, dogBody, dogSizeOf, SORT_OF, SWITCHES } from "./animals.js";
import { checkSetting, loadSettings, saveSettings } from "./settings.js";
import { createSound } from "./sound.js";
import { createTalk } from "./talk.js";
import { HOUSE_PIECES } from "./houses.js";
import { kitModels, kitTexture, kitUrl } from "./kit.js";
import { createMenu } from "./menu.js";
import { createSaves } from "./saves.js";
import { undoOnly, withoutLeftovers } from "./undo.js";
import { editableFields, reviseEdits } from "./assistant-edits.js";
import { assistantNeeds, mentioned, PARTS, PICKS } from "./assistant-context.js";
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
  PLAYER_ID,
  matchLore,
  mergeLore,
  structureFromLore,
  slotsOf,
  needsFromLore,
  namesFromLore,
  loreName,
  isCreature,
  creaturesFromLore,
  placeTargets,
  plainWord,
  zoneAt,
  HOME_REGION,
  regionName,
  regionNext,
} from "./zones.js";
import { checkLandscape, landscapeNeeds, landscapeWith } from "./land.js";
import {
  partOfDay,
  ACTIONS,
  describeScene,
  OWN_LINE,
  parseSpeech,
  pickListeners,
  sceneRequest,
} from "./interactions.js";
import { drawMap } from "./map.js";
import { createAi } from "./ai.js";
import {
  ACTIVITY_WORDS,
  checkEntry,
  entryAt,
  hourText,
  inRange,
  putEntry,
  scheduleFromWords,
  usualDay,
} from "./schedules.js";
import { weatherAt } from "./weather.js";
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
import {
  createWorld,
  hashString,
  heightAt,
  NATURE_MODELS,
  previewMap,
  SPAWN,
  waterAt,
  WORLD_SIZE,
  WORLD_SIZES,
} from "./world.js";

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
// Bodies chosen before they were kept per world ({ [id]: "male" | "female" }): an older world takes them
// once, the first time it's opened; after that each world keeps its own (save.bodies).
const BODIES_KEY = "wanderworld.bodies";
const PERSONA_KEY = "wanderworld.persona"; // the persona a new world starts with: the one played last
const NEARBY = 12; // metres: who counts as nearby
const ZONE_SETTLE = 0.6; // seconds in a new place before its name shows
const THUMBNAIL = { width: 192, height: 108 };
const THUMBNAIL_EVERY = 90; // seconds between thumbnail refreshes while playing
const ART = kitUrl("art"); // the menu and loading art
const BUILD_WAIT = 10; // seconds the loading screen waits at most for the detailed kit
const PLAYER_RADIUS = 0.35;
const STATS_INTERVAL_MS = 500;
const NO_INPUT = { x: 0, y: 0, amount: 0, run: false, yaw: 0, pitch: 0, zoom: 0 };
/** "Auto" resolution aims for about this many pixels (1080p), then lowers it if frames drop. */
const AUTO_PIXELS = 1920 * 1080;
const DAY_SECONDS = 20 * 60; // a whole day in town takes 20 minutes
const START_HOUR = 9;
const USE_RANGE = { seat: 1.6, door: 1.9, person: 2.6, exit: 1.6, board: 1.9, thing: 1.9, travel: 1 };
const WEATHER_PERIOD = 240; // seconds of play between changes of the weather
const TRAVEL_REACH = 6; // metres from the world's edge where "Travel to…" shows
const OPPOSITE = { north: "south", east: "west", south: "north", west: "east" }; // every kind of usable needs one
const CHATTER_DISTANCE = 11; // metres within which townsfolk's own chatter shows over their heads
const CHATTER_AT_ONCE = 3; // bubbles up at once, chatter included
const ARRIVE_SETTLE = 3; // seconds in a place before it's told (passing through, or a misstep, isn't arriving)
const ARRIVE_GAP = 45; // seconds between one arrival's telling and the next
const SIGHT_EVERY = 140; // seconds between lines about who's near (the world's voice)
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
  /** Moments: the latest lines said and narrated, for the next one's context: [{ who, text }]. */
  momentLog: [],
  momentBusy: false,
  /** The server part (ai.js): conversations, pictures, scenes. */
  ai: createAi(() => core.save?.locals ?? []),
  /** The last picture of a place: { zoneId, place, url, pending, error }. */
  picture: null,
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
  looks: {}, // and what else was chosen for them by hand (looks.js), by id
  pets: {}, // animals of one's own, by owner id (saves.js `pets`)
  crowd: createCrowd(),
  herd: createHerd(), // the world's animals (herd.js)
  mount: null, // the animal being ridden: { id, kind, back, walk, gallop } (ride())
  dismounting: null, // getting down off it: { height (how high they sat), side } (dismount())
  mounting: null, // getting up on it: { phase: "approach" | "vault", side } (ride())
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
  if (core.relations) refreshNames();
  else core.crowd.setNamesVisible(settings.names !== "none");
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
  // How many animals, or which kinds: the world's are counted out again, once the slider has stopped.
  if (/^animal|^loreAnimals$/u.test(name) && core.world) {
    clearTimeout(core.restock);
    core.restock = setTimeout(restockHerd, 350);
  }
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
  core.mount = null;
  core.herd.detach();
  core.world?.dispose();
  for (const sign of core.signs) sign.dispose();
  core.signs = [];
  core.board?.dispose();
  core.board = null;
  const own = core.save?.seed === seed;
  // Another region of this world: its own land, as big as the home region.
  const region = Object.values(core.save?.regions ?? {}).find((entry) => entry.seed === seed);
  core.world = createWorld(
    hashString(seed),
    own ? core.save.landscape : (region?.landscape ?? null),
    own ? core.save.needs : {},
    own || region ? core.save.worldSize : "normal",
  );
  // A world keeps the land it was first built with, even if the seed's own choices change later.
  if (core.save?.seed === seed && !core.save.landscape) core.save = { ...core.save, landscape: core.world.landscape };
  core.zones = buildZones(core.world.layout, hashString(seed));
  useHousing();
  // A new world's lore links up first (it may give the player a home to start at); the loading screen waits.
  core.linking = core.save?.lorePending ? linkLore() : null;
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
  core.herd.setWorld(core.world, hashString(seed), herdOptions());
  syncPets();
  syncSpawns();
  resetMode();
  // Where to start: where they were, else at their own front door (from their lore), else the square.
  const homeDoor = playerHomeDoor() !== null ? core.world.doors[playerHomeDoor()] : null;
  const front = homeDoor
    ? { x: homeDoor.x + Math.sin(homeDoor.angle) * 1.2, z: homeDoor.z + Math.cos(homeDoor.angle) * 1.2 }
    : null;
  const spot = place && !core.world.blocked(place.x, place.z, PLAYER_RADIUS) ? place : null;
  core.freshStart = !spot; // a first visit: once lore gives them a home, they start at its door
  const start = core.world.spawn ?? SPAWN; // by the market
  const x = spot?.x ?? front?.x ?? start.x;
  const z = spot?.z ?? front?.z ?? start.z;
  core.player.position.set(x, heightAt(x, z), z);
  core.player.rotation.y = spot?.angle ?? (homeDoor ? homeDoor.angle : 0);
  core.cameraYaw = spot?.yaw ?? (homeDoor ? homeDoor.angle + Math.PI : 0);
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
  // The ground's painted textures (kit/generic/art): grass and dirt on the land, cobbled streets, stone setts on
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
      kitModels("props", world.propModels)
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
    // (What's moved by itself since: how people stand with each other, and the record of it.)
    relationships: core.relations.all,
    social: core.social?.state ?? null,
    memories: core.memories?.state ?? {},
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
  const edge = (core.world?.size ?? WORLD_SIZE) / 2 - 2;
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
  // This world's bodies (an older world starts from the ones chosen before worlds kept their own).
  core.bodies = { ...(save.bodies ?? core.legacyBodies ?? {}) };
  if (!save.bodies) {
    save.bodies = { ...core.bodies };
    core.saves.write(save);
  }
  core.looks = { ...(save.looks ?? {}) };
  core.pets = { ...(save.pets ?? {}) };
  core.save = save;
  core.hour = save.hour;
  useRelations(createRelationships(save.relationships));
  core.social = createSocial(save.social ?? {});
  core.eventDay = undefined; // which day's event has been told (tellEvents)
  core.invites = new Map(); // who's been asked round (Journal → Home): this world's, and only while it's open
  core.memories = createMemories(save.memories ?? {}, memoryLimits);
  core.away = {}; // when each part of the world was last left (socialTick)
  core.area = null;
  core.characters = peopleOf(save); // this world's own people live here only
  const known = new Set((core.characters ?? []).map((character) => character.id));
  core.cast = new Set(save.cast.filter((id) => known.has(id)).slice(0, MAX_PEOPLE));
  const persona =
    core.personas?.find((entry) => entry.id === save.persona) ??
    core.personas?.find((entry) => entry.id === readStored(PERSONA_KEY)) ??
    core.personas?.[0] ??
    null;
  core.hud?.setPersonas(core.personas ?? [], persona?.id, core.bodies);
  const figure = Promise.resolve(choosePersona(persona?.id ?? null)).catch(() => {});
  // The loading screen first (building blocks for a moment), then the world, shown once its detailed
  // trees, buildings and props are in (or after a while regardless).
  core.menu?.hide();
  core.hud?.setLoading(`Building ${save.name}…`);
  const load = ++core.worldLoad;
  setTimeout(() => {
    if (load !== core.worldLoad) return;
    const detail = buildWorld(regionSeed(save), checkedPlace(save.place));
    updateCast();
    core.crowd.restoreParty(save.party, core.player.position);
    const shown = () => {
      if (load !== core.worldLoad) return;
      core.hud?.setLoading(null);
      resume();
      void pullRecaps();
      // The chat as it was left in this world.
      core.momentLog = save.log ?? [];
      core.hud?.setChat(core.momentLog.map((line) => ({ ...line, mine: line.who === personaName() })));
      core.hud?.setAssistantChat(save.assistantChat ?? []);
      core.toldPlaces = [];
      core.looks = new Map();
      core.peopleHereKey = null;
      core.arriveZone = null;
      core.hud?.illustrate.reset();
      core.hud?.illustrate.restore();
      core.hud?.restoreChat();
    };
    // Shown once the detail is in and the lore has linked up (so they appear at their door, not jump
    // there), or after a while regardless.
    const ready = Promise.all([detail, core.linking ?? Promise.resolve(), figure]);
    Promise.race([ready, new Promise((done) => setTimeout(done, BUILD_WAIT * 1000))]).then(shown);
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

/**
 * The lorebooks a world draws on, as its linking reads them: with their own keywords (by name), the
 * keywords the AI gave their entries (`save.loreKeys`), or both when places go one way and characters
 * the other. With the AI alone an entry's own keywords are left out: in any lorebook they're words that
 * trigger the entry ("town", "forest"), not where it belongs.
 */
async function chosenBooks(save) {
  const books = [
    ...(save.lorebooks.length ? (await readLorebooks()).filter((book) => save.lorebooks.includes(book.id)) : []),
    ...worldBook(save),
  ];
  if (!books.length) return [];
  return books.map((book) => ({
    ...book,
    entries: book.entries.map((entry) => {
      const keys = [...(entry.keys ?? []), ...(save.loreKeys?.[`${book.id}/${entry.id}`] ?? [])];
      // "character": the entry is someone (a card of that name, or a person linkLore makes); it's theirs
      // by their name: "name Mira Saxton", or else the entry's title.
      if (keys.some((key) => key.toLowerCase() === "character")) keys.push(loreName({ ...entry, keys }));
      // `own`: the keywords the lorebook's writer gave it, for the Journal's check.
      return { ...entry, keys, own: entry.own ?? [] };
    }),
  }));
}

/**
 * What the AI made of the cast's cards and the persona (`save.loreKeys` under "cards/<id>"), as a
 * lorebook of its own for the structure and the world's needs: one entry each, named for the character
 * ("player" for the persona), with the keywords and no text. Empty unless characters are set up by the AI.
 */
function cardBook(save) {
  if (save.characterLinking !== "ai") return [];
  const names = new Map(peopleOf(save).map((entry) => [entry.id, entry.name]));
  const entries = Object.entries(save.loreKeys ?? {})
    .filter(([key]) => key.startsWith("cards/"))
    .map(([key, keys]) => {
      const id = key.slice("cards/".length);
      return { id, title: id === "player" ? "player" : (names.get(id) ?? ""), keys, content: "", byTitle: true };
    })
    .filter((entry) => entry.title);
  return entries.length ? [{ id: "cards", name: "", entries }] : [];
}

const LORE_BATCH = 40; // entries a call reads (server.mjs takes no more)
// ponytail: the first 200 entries of the chosen lorebooks are read, 600 characters of each; raise both
// (and summarise long entries first) if bigger lorebooks need it.
const LORE_ENTRIES = 200;

/** Everyone a world can cast: the Engine's characters, and the people it made for itself. */
function peopleOf(save) {
  return [...(core.engineCharacters ?? []), ...(save?.locals ?? [])];
}

/** The lore written for a world (`save.book`), as a lorebook of its own, under the id "world". */
function worldBook(save) {
  const entries = save?.book?.entries ?? [];
  if (!entries.length) return [];
  return [{ id: "world", name: "Written for this world", entries: entries.map((entry) => ({ ...entry, keys: [] })) }];
}

/**
 * Has the model set the world up, a part at a time, each fed by what the parts before it gave (the
 * places already numbered and named, the people already there):
 * 1. the world's lorebooks, a batch at a time (server.mjs `/lore-setup`): what each entry belongs to,
 *    and people the lore describes who have no card;
 * 2. with `write.lore`, the world's own lore (`/world-write`): its premise, and places with their lore,
 *    around what the lorebooks placed and who lives here;
 * 3. with `write.people` (a number), that many new people built around those places and the cast;
 * 4. the cast's cards and the persona (when characters are set up by the AI): bodies, homes, work and
 *    relationships, among everyone and everything above.
 * It's all kept as keywords in the plain convention (`loreKeys`: under "lorebook id/entry id",
 * "world/<entry>" and "cards/<id>"), names for places (`loreNames`), the written lore (`book`) and the
 * new people (`locals`).
 *
 * A call that fails is tried once more; a part that still fails is left as it was in `save` and named
 * in `failed`, and the rest goes on. `only` (ids from an earlier `failed`) asks for just those parts
 * again. `onProgress(text)` says what it's doing. Returns { loreKeys, loreNames, book, locals, failed:
 * [{ id, label, error }], entries (lorebook entries read) }; `save` isn't changed.
 */
async function aiLoreSetup(save, onProgress = () => {}, only = null, write = {}) {
  const people = save.characterLinking === "ai";
  const cast = (core.engineCharacters ?? []).filter((entry) => save.cast?.includes(entry.id));
  let books = [];
  let unread = "";
  if (save.lorebooks.length) {
    try {
      books = (await readLorebooks()).filter((book) => save.lorebooks.includes(book.id));
    } catch (error) {
      unread = error?.message ?? String(error);
    }
  }
  const entries = books
    .flatMap((book) => book.entries.map((entry) => ({ key: `${book.id}/${entry.id}`, title: entry.title, entry })))
    .slice(0, LORE_ENTRIES);
  const keys = { ...save.loreKeys };
  const names = { ...save.loreNames };
  let locals = [...(save.locals ?? [])];
  let book = { entries: [...(save.book?.entries ?? [])] };
  const placed = new Map(); // numbered place → what used it first
  const place = (words, title) => {
    for (const word of words)
      for (const slot of word.toLowerCase().match(/\b[a-z]+\d+\b/gu) ?? [])
        if (!placed.has(slot)) placed.set(slot, title);
  };
  for (const words of Object.values(keys)) place(words, "");
  const everyone = () => [...cast.map((entry) => entry.name), ...locals.map((entry) => entry.name)];
  const common = () => ({
    connectionId: core.settings.textConnection || null,
    worldName: save.name,
    setting: save.setting,
    persona: core.personas?.find((entry) => entry.id === save.persona)?.name ?? "",
    characters: everyone(),
    placed: [...placed].map(([slot, title]) => ({ slot, title, name: names[slot] ?? "" })),
  });
  /** Someone the world makes for itself, with their keywords; false when the world is full. */
  const addLocal = (id, person, words) => {
    if (cast.length + locals.length >= MAX_PEOPLE || !person.name) return false;
    locals = [...locals.filter((entry) => entry.id !== id), { id, ...person }];
    keys[`cards/${id}`] = [person.name, ...words];
    place(words, person.name);
    return true;
  };

  const ask = async ({ batch, extra }) => {
    const result = await core.ai.loreSetup({
      ...common(),
      places: save.loreLinking === "ai",
      people,
      locals,
      ...extra,
    });
    batch.forEach(({ key, title, card, entry }, index) => {
      // A card says who someone is, not what a place or the world is.
      let words = (result?.keys?.[index] ?? []).filter(
        (word) => !card || !/^(world$|group of|located in)/iu.test(word),
      );
      // An entry about someone with no card: they're made from it, and it stays tied to them as their lore.
      if (entry && words.some((word) => word.toLowerCase() === "character")) {
        const name = loreName({ title, keys: [...(entry.keys ?? []), ...words] });
        words = words.filter(
          (word) => !["character", name.toLowerCase(), title.toLowerCase()].includes(word.toLowerCase()),
        );
        const known = everyone().some((other) => other.toLowerCase() === name.toLowerCase());
        const id = `local:${key.replace(/[^\w-]/gu, "-")}`;
        const person = { name, description: entry.content.slice(0, 1200), personality: "", appearance: "" };
        // Someone with a card of that name is that card (linkLore brings them in); anyone else is made here.
        if (known || isCreature({ keys: [...(entry.keys ?? []), ...words] }))
          words = known ? ["character", ...words] : words;
        else if (addLocal(id, person, words)) words = [name];
      }
      if (words.length) keys[key] = words;
      else delete keys[key];
      place(words, title);
    });
    for (const [slot, name] of Object.entries(result?.names ?? {})) names[slot] ??= name;
  };

  const parts = [];
  for (let at = 0; at < entries.length; at += LORE_BATCH) {
    const batch = entries.slice(at, at + LORE_BATCH);
    const several = entries.length > LORE_BATCH;
    parts.push({
      id: `lore:${at}`,
      label: several ? `lorebook entries ${at + 1} to ${at + batch.length}` : "the lorebooks",
      doing: several ? `reading the lorebooks (${at} of ${entries.length} entries)…` : "reading the lorebooks…",
      run: () =>
        ask({
          batch,
          extra: {
            entries: batch.map(({ entry }) => ({
              title: entry.title,
              keys: [...(entry.triggers ?? []), ...entry.keys],
              content: entry.content.slice(0, 600),
            })),
          },
        }),
    });
  }
  if (write.lore) {
    parts.push({
      id: "write:places",
      label: "the world's lore",
      doing: "writing the world and its places…",
      run: async () => {
        const result = await core.ai.worldWrite({ ...common(), step: "places" });
        book = {
          entries: [
            { id: "world", title: save.name, content: result.premise },
            ...result.places.map((item) => ({ id: item.slot, title: item.name, content: item.lore })),
          ].filter((entry) => entry.content),
        };
        for (const key of Object.keys(keys)) if (key.startsWith("world/")) delete keys[key];
        if (result.premise) keys["world/world"] = ["world"];
        for (const item of result.places) {
          if (item.lore) keys[`world/${item.slot}`] = [item.slot];
          names[item.slot] ??= item.name;
          place([item.slot], item.name);
        }
      },
    });
  }
  if (write.people > 0) {
    parts.push({
      id: "write:people",
      label: "the new people",
      doing: "inventing the people who live there…",
      run: async () => {
        const made = locals.filter((entry) => entry.id.startsWith("local:new-"));
        locals = locals.filter((entry) => !made.includes(entry));
        for (const entry of made) delete keys[`cards/${entry.id}`];
        const count = Math.min(write.people, MAX_PEOPLE - cast.length - locals.length, 12);
        if (count <= 0) return;
        const result = await core.ai.worldWrite({
          ...common(),
          step: "people",
          count,
          ages: save.ages ?? null,
          // Their cards, read on the server: the family they speak of is made first.
          personaId: save.persona || null,
          characterIds: cast.map((entry) => entry.id),
          premise: book.entries.find((entry) => entry.id === "world")?.content ?? save.setting,
          places: [...placed.keys()].map((slot) => ({
            slot,
            name: names[slot] ?? slot,
            lore: book.entries.find((entry) => entry.id === slot)?.content ?? "",
          })),
        });
        result.people.forEach(({ keys: words, body, ...person }, index) =>
          addLocal(`local:new-${index + 1}`, person, [body, ...words].filter(Boolean)),
        );
      },
    });
  }
  if (people && (cast.length || save.persona)) {
    const batch = cast.map((entry) => ({ key: `cards/${entry.id}`, title: entry.name, card: true }));
    if (save.persona) batch.push({ key: "cards/player", title: "the player", card: true });
    parts.push({
      id: "cards",
      label: "the characters",
      doing: "getting to know your characters…",
      run: () =>
        ask({
          batch,
          extra: { characterIds: cast.map((entry) => entry.id), personaId: save.persona || null, entries: [] },
        }),
    });
  }

  const failed = unread ? [{ id: "books", label: "the lorebooks", error: unread }] : [];
  for (const part of parts) {
    // Asked again: only what failed (every lorebook part, when the lorebooks couldn't be read at all).
    if (only && !only.includes(part.id) && !(only.includes("books") && part.id.startsWith("lore:"))) continue;
    onProgress(part.doing);
    try {
      await part.run();
    } catch (first) {
      // Once more for a bad answer or a dropped call; not when the server part or the device is refused.
      if ([403, 404].includes(first?.status)) {
        failed.push({ id: part.id, label: part.label, error: first?.message ?? String(first) });
        continue;
      }
      onProgress(`${part.doing} (trying again)`);
      try {
        await part.run();
      } catch (error) {
        failed.push({ id: part.id, label: part.label, error: error?.message ?? String(error) });
      }
    }
  }
  return { loreKeys: keys, loreNames: names, book, locals, failed, entries: entries.length };
}

/**
 * How a world's lore is linked, as its save keeps it. Linking by name needs a lorebook; the AI doesn't:
 * it sets characters up from their cards, and ties in the lore and people it writes itself.
 */
function linkingOf(lorebooks, loreLinking, characterLinking, write = {}) {
  const lore = write.lore && loreLinking === "none" ? "ai" : loreLinking;
  const cast = write.people > 0 && characterLinking === "none" ? "ai" : characterLinking;
  return {
    loreLinking: lorebooks.length || write.lore ? lore : "none",
    characterLinking: lorebooks.length || cast === "ai" ? cast : "none",
  };
}

/**
 * New world's first step when the AI sets it up: the setup (`aiLoreSetup`), with the loading screen up
 * and saying what's going on, for the menu to show before the land is built. `previous` (an earlier
 * answer with failed parts) asks only for what failed. Returns { setup: { loreKeys, loreNames, book,
 * locals, failed }, summary (setup.js), needs: { kind: count } }.
 */
async function planNewWorld(
  {
    name,
    setting = "",
    lorebooks = [],
    loreLinking,
    characterLinking,
    cast,
    persona,
    writeLore = false,
    newPeople = 0,
    ages = null,
  },
  previous,
) {
  const write = { lore: writeLore, people: newPeople };
  const draft = {
    name: name || suggestName(),
    setting,
    lorebooks,
    ...linkingOf(lorebooks, loreLinking, characterLinking, write),
    ages,
    cast: cast ?? [],
    persona: persona ?? core.personaId,
    loreKeys: previous?.loreKeys ?? {},
    loreNames: previous?.loreNames ?? {},
    locals: previous?.locals ?? [],
    book: previous?.book ?? null,
  };
  core.hud?.setLoading("Building your world…");
  let setup;
  try {
    setup = await aiLoreSetup(
      draft,
      (doing) => core.hud?.setLoading(`Building your world: ${doing}`),
      previous?.failed?.length ? previous.failed.map((part) => part.id) : null,
      write,
    );
  } finally {
    core.hud?.setLoading(null);
  }
  const made = { ...draft, ...setup };
  const needs = await worldNeeds(made);
  return {
    setup,
    needs,
    shape: await loreShape(made),
    summary: summariseSetup(setup, {
      characters: peopleOf(made).filter((entry) => draft.cast.includes(entry.id) || entry.id.startsWith("local:")),
      persona: core.personas?.find((entry) => entry.id === draft.persona)?.name ?? "",
      entries: setup.entries,
    }),
  };
}

/**
 * What a world must have for its lorebooks (zones.js `needsFromLore`), when its places are linked:
 * every numbered place they mention. Empty otherwise, or when the lorebooks can't be read.
 */
async function worldNeeds(save) {
  try {
    // What the lorebooks name (when their places are linked), and where the AI put the cast.
    return needsFromLore([...(save.loreLinking === "none" ? [] : await chosenBooks(save)), ...cardBook(save)]);
  } catch (error) {
    console.warn("[wanderworld] couldn't read lorebooks for the world's needs", error);
    return {};
  }
}

async function createNewWorld({
  name,
  seed,
  choices,
  setting = "",
  lorebooks = [],
  loreLinking = "none",
  characterLinking = "none",
  cast = null,
  persona = null,
  setup = null, // the AI's setup, as the menu reviewed it (planNewWorld)
  writeLore = false,
  newPeople = 0,
  ages = null,
}) {
  const save = core.saves.create({ name: name || suggestName(), seed });
  if (!save) return;
  save.setting = setting;
  save.ages = ages ?? { min: null, max: null };
  save.lorebooks = lorebooks;
  Object.assign(save, linkingOf(lorebooks, loreLinking, characterLinking, { lore: writeLore, people: newPeople }));
  save.lorePending = save.loreLinking !== "none" || save.characterLinking !== "none";
  save.persona = persona ?? core.personaId;
  save.locals = setup?.locals ?? [];
  save.book = setup?.book ?? { entries: [] };
  save.cast = [...(cast ?? []), ...save.locals.map((person) => person.id)].slice(0, MAX_PEOPLE);
  save.loreKeys = setup?.loreKeys ?? {};
  save.loreNames = setup?.loreNames ?? {};
  // Built with at least what the lorebooks name (a cave brings mountains with it); random past that.
  save.needs = await worldNeeds(save);
  const shape = await loreShape(save);
  choices = withShape(choices, shape);
  save.season = shape.season ?? "";
  save.landscape = landscapeNeeds(landscapeWith(hashString(save.seed), choices), save.needs, hashString(save.seed));
  save.worldSize = sizeFor(choices?.size, save.landscape);
  save.choices = choices ?? null;
  // A new world starts with the persona and cast of the one played last.
  // Who lives there and who you play, from New world. Worlds are separate: nobody moves in from another.
  save.bodies = {}; // everyone auto until set here, by hand or by lore
  core.saves.write(save);
  playWorld(save.id);
}

/** What a world's lorebooks say of its shape (ww:world with ww:settlement:city, ww:walls, ww:size:large, ww:season:winter). */
async function loreShape(save) {
  try {
    return save.loreLinking === "none" ? {} : worldFromLore(await chosenBooks(save));
  } catch {
    return {};
  }
}

/** New world's choices with the lore's shape where a choice was left to the seed: what's chosen by hand stands. */
function withShape(choices, shape) {
  const out = { ...choices };
  const open = (key) => !out[key] || out[key] === "surprise";
  if (shape.settlement && open("settlement")) out.settlement = shape.settlement;
  if (shape.walls && open("walls")) out.walls = "yes";
  if (shape.size && open("size")) out.size = shape.size;
  return out;
}

/**
 * A world's size: the one chosen, or on Auto, Normal, unless it has more places out in the country than
 * fit comfortably (then Large).
 */
function sizeFor(chosen, landscape) {
  if (Object.hasOwn(WORLD_SIZES, chosen)) return chosen;
  return (landscape?.outposts?.length ?? 0) > 6 ? "large" : "normal";
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
async function regenerateWorld(reshuffle = false, size = null, newSeed = null) {
  const save = core.save;
  if (!save) return;
  if (save.region !== HOME_REGION) {
    core.hud?.setNotice(`Regenerating rebuilds the home region. Travel back to ${homeRegionName()} first.`);
    return;
  }
  savePlace(true);
  const choices = core.save.choices ?? choicesOf(core.save.landscape);
  const seed = reshuffle ? (newSeed ?? `world-${Date.now().toString(36)}`) : core.save.seed;
  // What its lorebooks need now (they may have grown since), on top of its land.
  const needs = await worldNeeds(core.save);
  if (core.save?.id !== save.id) return; // another world was opened meanwhile
  const land = core.save.choices || reshuffle ? landscapeWith(hashString(seed), choices) : core.save.landscape;
  const landscape = landscapeNeeds(checkLandscape(land, hashString(seed)), needs, hashString(seed));
  const worldSize = size && Object.hasOwn(WORLD_SIZES, size) ? size : core.save.worldSize;
  const next = { ...core.save, seed, landscape, choices, needs, worldSize, place: null };
  if (reshuffle && core.zones) {
    // The setup stays: every place's name, lore and groups go to the same kind of place in the new layout.
    const built = createWorld(hashString(seed), landscape, needs, worldSize);
    const map = remapZones(core.zones, buildZones(built.layout, hashString(seed)));
    built.dispose();
    Object.assign(next, carrySetup({ ...core.save, groups: core.save.groups ?? null }, map), { waitingPlacements: [] });
  }
  core.saves.write(next);
  // Drop the world in memory so playing builds it again from the save.
  core.save = null;
  core.world?.dispose();
  core.world = null;
  core.hud?.closePanels();
  playWorld(next.id);
}

// ── Maps (map.js) ────────────────────────────────────────────────────────────

/** New world's preview: the land and settlement `seed` and the `choices` make (before any lore needs). */
function previewNewWorld(canvas, seed, choices, needs = {}) {
  const landscape = landscapeNeeds(landscapeWith(hashString(seed), choices), needs, hashString(seed));
  drawMap(canvas, previewMap(hashString(seed), landscape, sizeFor(choices?.size, landscape)));
}

/** Regenerate's preview: this world rebuilt as asked (its own layout, or a new one from `seed`). */
function previewRegenerate(canvas, { reshuffle, size, seed }) {
  const save = core.save;
  if (!save) return;
  const used = reshuffle ? seed : save.seed;
  const choices = save.choices ?? choicesOf(save.landscape);
  const land = save.choices || reshuffle ? landscapeWith(hashString(used), choices) : save.landscape;
  const landscape = landscapeNeeds(checkLandscape(land, hashString(used)), save.needs, hashString(used));
  drawMap(canvas, previewMap(hashString(used), landscape, size ?? save.worldSize));
}

/** The Journal's map of the region you're in: the places by name, you, and where each edge leads. */
function drawJournalMap(canvas, view = null) {
  if (!core.world?.map || !core.zones || !core.save) return null;
  const names = namedZones(residentsOf(core.crowd.snapshot()));
  // A closer look names the buildings too: the ones with a name of their own first, then every door.
  const doors = core.world.doors ?? [];
  const buildings = core.zones.zones
    .filter((zone) => zone.kind === "building" && doors[zone.door])
    .map((zone) => ({
      x: doors[zone.door].centre?.x ?? doors[zone.door].x,
      z: doors[zone.door].centre?.z ?? doors[zone.door].z,
      text: names[zone.id] ?? zone.name,
      zoom: zone.buildingKind === "home" ? 5 : 2.5,
    }));
  const homeDoor = doors[playerHomeDoor()];
  const waypoint = core.save.waypoint?.region === core.save.region ? core.save.waypoint : null;
  const labels = core.zones.zones
    .filter(
      (zone) => zone.id === "town" || zone.kind === "cave" || zone.kind === "outpost" || zone.outpostKind === "hamlet",
    )
    .map((zone) => ({
      x: zone.shape?.circle?.x ?? 0,
      z: zone.shape?.circle?.z ?? 0,
      text: names[zone.id] ?? zone.name,
    }));
  const edges = Object.fromEntries(
    ["north", "east", "south", "west"].map((side) => [side, regionNameAt(regionNext(core.save.region, side))]),
  );
  const at = core.interior ? core.interior.door : core.player.position;
  drawMap(canvas, core.world.map, {
    labels: [...labels, ...buildings],
    edges,
    view,
    home: homeDoor ? { x: homeDoor.x, z: homeDoor.z } : null,
    waypoint,
    player: { x: at.x, z: at.z, angle: core.player.rotation.y },
  });
  // How far the waypoint is and which way, in words under the map.
  let words = "";
  if (waypoint) {
    const east = waypoint.x - at.x;
    const south = waypoint.z - at.z;
    const far = Math.round(Math.hypot(east, south));
    const way = [
      south < -far * 0.38 ? "north" : south > far * 0.38 ? "south" : "",
      east > far * 0.38 ? "east" : east < -far * 0.38 ? "west" : "",
    ]
      .filter(Boolean)
      .join("-");
    words = far < 4 ? "You're at your waypoint." : `Waypoint: ${far} m ${way}.`;
  }
  return { half: core.world.map.half, waypoint: words };
}

/** Marks (or clears, with null) the player's waypoint on this region's map. */
function setWaypoint(at) {
  if (!core.save) return;
  const half = core.world?.map?.half ?? 0;
  const inside = at && Math.abs(at.x) <= half && Math.abs(at.z) <= half;
  core.save = { ...core.save, waypoint: inside ? { region: core.save.region, x: at.x, z: at.z } : null };
  core.saves.write(core.save);
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
  // The player first, when their lore gives them a home.
  const mine = playerHomeDoor();
  if (mine !== null) homes.set(mine, [personaName()]);
  for (const person of snapshot) {
    if (person.home === null) continue;
    if (!homes.has(person.home)) homes.set(person.home, []);
    homes.get(person.home).push(person.name);
  }
  return homes;
}

/** Puts the player at their own front door, facing out (a new world whose lore gives them a home). */
function startAtHome() {
  const index = playerHomeDoor();
  const door = index !== null ? core.world?.doors[index] : null;
  if (!door) return;
  core.freshStart = false;
  const x = door.x + Math.sin(door.angle) * 1.2;
  const z = door.z + Math.cos(door.angle) * 1.2;
  core.player.position.set(x, heightAt(x, z), z);
  core.player.rotation.y = door.angle;
  core.cameraYaw = door.angle + Math.PI;
  // The party comes along to the door too.
  core.crowd.restoreParty(
    core.crowd.party().map((member) => member.id),
    core.player.position,
  );
  savePlace(true);
}

/** Whether the player is at home: inside their house, or right by its door. */
function atHome() {
  const index = playerHomeDoor();
  if (index === null || !core.world) return false;
  if (core.interior) return core.interior.door.index === index;
  const door = core.world.doors[index];
  return !!door && Math.hypot(door.x - core.player.position.x, door.z - core.player.position.z) < 4;
}

/** The door index of the player's home (from their lore), or null. */
function playerHomeDoor() {
  const id = core.save?.housing?.[PLAYER_ID]?.home;
  return id ? (core.zones?.byId.get(id)?.door ?? null) : null;
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
 * The user's narrator card for `what` (Settings → AI: one for the world, "moments", and one for
 * "scenes"), when it's set and still one of their characters: { id, name }, or null.
 */
function narratorFor(what) {
  const chosen = what === "scenes" ? core.settings.sceneNarratorCard : core.settings.narratorCard;
  const card = chosen ? (core.engineCharacters ?? []).find((entry) => entry.id === chosen) : null;
  return card ? { id: card.id, name: card.name } : null;
}

/**
 * A scene from wherever the player stands (the chat window's Scene button, or "/scene …"): the place,
 * whoever's within a few steps, the party, and what was typed as how it opens. With nobody there it's
 * the narrator card's to tell.
 */
async function sceneHere(typed, set = null) {
  if (!core.save || !core.zones || (core.interior && !set)) return;
  const at = core.player.position;
  // `set` (the assistant's suggestion): { zoneId, people: [{ id, name }] } in place of here and whoever's near.
  const zone = (set?.zoneId && core.zones.byId.get(set.zoneId)) || zoneAt(core.zones, at.x, at.z);
  const names = namedZones(residentsOf(core.crowd.snapshot()));
  const near = set
    ? set.people.map((person) => ({ id: person.id, name: person.name }))
    : core.crowd
        .snapshot()
        .filter((person) => person.state !== "inside" && Math.hypot(person.x - at.x, person.z - at.z) < 8)
        .map((person) => ({ id: person.id, name: person.name }));
  const party = core.crowd
    .party()
    .filter((member) => !member.waiting)
    .map((member) => ({ id: member.id, name: member.name }));
  const title = names[zone.id] ?? "here";
  const chain = chainOf(core.zones, zone)
    .slice(1)
    .map((entry) => names[entry.id]);
  const request = sceneRequest({
    thing: { kind: "place", name: title, chain },
    action: OWN_LINE,
    line: typed || "takes a moment here",
    inside: near,
    party,
    persona: { id: "player", name: personaName() },
    hour: core.hour,
  });
  narrate(null, "(Starting a scene here…)");
  const words = await playAsScene({ kind: "place", zone, title, inside: near }, request, party, true);
  narrate(null, `(${words})`);
}

/** How far from the sleeper people stay as they are when time jumps (metres). */
const SLEEP_NEAR = 30;

/**
 * Sleeps in a campsite's tent: lies down on its bedroll, the screen dims, the clock jumps on by `length`
 * (hours, or "morning" / "evening": till 7:00 or 19:00), and everyone not close by is where that hour has
 * them (npcs.js resettle). With Settings → Time fixed, there's rest but the hour doesn't change.
 */
function sleepIn(camp, length) {
  // (`camp`: the tent slept in, { bed, mouth }: a campsite's first, or any of its others.)
  if (core.mode !== "walk" || core.interior) return;
  const until = length === "morning" ? 7 : length === "evening" ? 19 : null;
  const hours = until === null ? Number(length) || 8 : (until - core.hour + 24) % 24 || 24;
  sit({ ...camp.bed, approach: camp.mouth, pose: "lie", lift: 0, tent: true, taken: null });
  core.input?.release();
  later(1.4, () => {
    core.hud?.setFade(true);
    later(0.9, () => {
      const fixed = core.settings.time === "day" || core.settings.time === "night";
      if (!fixed) core.hour = (core.hour + hours) % 24;
      core.dark = core.world.setTime(core.hour);
      core.crowd.resettle(core.hour, core.player.position, SLEEP_NEAR);
      savePlace(true);
      const words = {
        ...lineWords(),
        hours: hours >= 1.5 ? `${Math.round(hours)} hours` : "An hour",
        clock: clockText(),
      };
      narrate(
        null,
        fixed ? "(You rest. Time is standing still: Settings → Time.)" : pickLine(PACK.sleep, `${core.clock}`, words),
      );
      later(0.6, () => core.hud?.setFade(false));
    });
  });
}

/** A campfire where the player stands ("/camp"): a few logs, a flame and its light, to sit by with the party. */
function makeCamp() {
  if (!core.world || core.interior) return;
  dousCamp();
  const { x, z } = core.player.position;
  const ahead = { x: x + Math.sin(core.player.rotation.y) * 1.4, z: z + Math.cos(core.player.rotation.y) * 1.4 };
  const fire = new Group();
  const wood = new MeshLambertMaterial({ color: 0x5a3b22 });
  for (let i = 0; i < 4; i++) {
    const log = new Mesh(new CylinderGeometry(0.07, 0.08, 0.8, 6), wood);
    log.rotation.set(Math.PI / 2 - 0.5, (i * Math.PI) / 2, 0, "YXZ");
    log.position.y = 0.2;
    fire.add(log);
  }
  const flame = new Mesh(new ConeGeometry(0.22, 0.6, 7), new MeshBasicMaterial({ color: 0xffa531 }));
  flame.position.y = 0.45;
  const glow = new PointLight(0xffa24a, 6, 14, 1.6);
  glow.position.y = 0.9;
  fire.add(flame, glow);
  fire.position.set(ahead.x, heightAt(ahead.x, ahead.z), ahead.z);
  core.world.scene.add(fire);
  core.world.camp = { kind: "campfire", x: ahead.x, z: ahead.z, object: fire, flame };
  keep(
    core.crowd
      .party()
      .filter((member) => !member.waiting)
      .map((member) => member.id),
    `Camped with ${personaName()} by a fire${placeWords() ? `, at ${placeWords()}` : ""}.`,
  );
  void runMoment({ action: "makes camp and lights a fire", audience: "party", source: "thing" }).then(
    (done) => !done && narrate(null, pickLine(PACK.camp, `${ahead.x}`, lineWords())),
  );
}

/** Puts the campfire out, if there is one. */
function dousCamp() {
  const camp = core.world?.camp;
  if (!camp) return;
  core.world.scene.remove(camp.object);
  camp.object.traverse((node) => {
    node.geometry?.dispose();
    node.material?.dispose();
  });
  core.world.camp = null;
}

/** What joining someone is, by what they're doing (pack.js joining): { label, verb, lines }, with their name in. */
function joiningOf(person) {
  const seen = core.crowd.snapshot().find((entry) => entry.id === person.id);
  const now = core.crowd.scheduledNow(person.id, core.hour)?.activity;
  const kind = seen?.seated ? "sit" : now === "work" || now === "eat" ? now : "other";
  const entry = PACK.joining[kind];
  const named = (text) => text.replaceAll("{who}", person.name);
  return { label: entry.label, verb: named(entry.verb), lines: entry.lines.map(named) };
}

/**
 * The things standing about this world that the setting pack gives something to do with (pack.js): some
 * of the town's props (a stall, a wagon, a stack of barrels) and the places out in the country (a farm,
 * the standing stones). Worked out once for a world.
 */
function worldThings() {
  const world = core.world;
  if (!world) return [];
  if (world.things) return world.things;
  const things = [];
  for (const prop of world.props ?? []) {
    const kind = PROP_THINGS[prop.model];
    if (!kind) continue;
    // One of a kind in a spot: a stack of barrels is one thing to look into, not six.
    if (things.some((other) => other.kind === kind && Math.hypot(other.x - prop.x, other.z - prop.z) < 3)) continue;
    things.push({ kind, x: prop.x, z: prop.z });
  }
  for (const place of world.map?.outposts ?? [])
    if (PACK.things[place.kind]) things.push({ kind: place.kind, x: place.x, z: place.z, place: true });
  world.things = things;
  return things;
}

/** One of the pack's things: its card of things to do, with whoever's near. */
function useThing(thing) {
  core.sceneDoor = thing; // walking away closes its card, like a door's
  const zone = core.zones ? zoneAt(core.zones, thing.x, thing.z) : null;
  const near = core.crowd
    .snapshot()
    .filter((person) => person.state !== "inside" && Math.hypot(person.x - thing.x, person.z - thing.z) < 9);
  openScene({
    kind: thing.kind,
    zone,
    title: thing.place && zone ? zoneName(zone) : PACK.things[thing.kind].title,
    inside: near.map((person) => ({ id: person.id, name: person.name })),
  });
}

/** Words the pack's lines can use: where the player is, the part of the day, and someone near. */
function lineWords(who = "") {
  return { place: placeWords().split(", in ")[0] || "here", time: partOfDay(core.hour), who };
}

/**
 * The world speaks up on coming to a place (Settings → The world's voice): what its lore says, or else
 * the setting pack's line for that kind of place, quiet or busy by who's about; with Settings → AI
 * letting arrivals call the model, the model writes it. Only once the player has settled there, not for
 * streets, not for one of the last five places told, and not hard on the last telling: walking round
 * town says little, coming out of the forest into it says something.
 */
function arrive(zone, names) {
  const save = core.save;
  if (!save || core.interior || (core.settings.narration ?? "lines") === "off") return;
  if (zone.kind === "street" || zone.kind === "road") return; // getting about isn't arriving
  // Not the same few places over again (going round town), and not one place hard on another.
  const told = core.toldPlaces ?? [];
  if (told.includes(zone.id) || core.clock - (core.toldAt ?? -ARRIVE_GAP) < ARRIVE_GAP) return;
  core.toldPlaces = [...told, zone.id].slice(-5);
  core.toldAt = core.clock;
  const kind = zone.kind === "building" ? zone.buildingKind : (zone.outpostKind ?? zone.kind);
  // Who's about, so an empty square isn't called busy.
  const at = core.player.position;
  const about = core.crowd
    .snapshot()
    .filter((person) => person.state !== "inside" && Math.hypot(person.x - at.x, person.z - at.z) < 18).length;
  // The place's own lore (the first entry tied to it), when it has some.
  const tie = save.lore?.[zone.id]?.[0];
  const lore = tie && activeLore(zone, names).entries.find((entry) => entry.title === tie.title && entry.content);
  const line = lore
    ? `${names[zone.id]}. ${lore.content.split(/(?<=[.!?])\s/u)[0]}`
    : arrivalLine(kind, `${save.seed}:${zone.id}`, lineWords(), about > 0);
  const company = about ? `${about} ${about === 1 ? "person is" : "people are"} about` : "nobody else is about";
  void runMoment({ action: `comes into ${names[zone.id]}, where ${company}`, source: "arrive" }).then((done) => {
    if (!done && line) narrate(null, line);
  });
}

/** An errand is done on reaching its person, wherever they are: they answer, and think better of you. */
function finishErrand(atDoor = false) {
  const errand = core.save?.errand;
  if (!errand || core.mode !== "walk") return;
  const person = core.crowd.snapshot().find((entry) => entry.id === errand.person);
  if (!person) return;
  // Reached: beside them out of doors, in the room with them, or at their door with them in (atDoor).
  if (!atDoor) {
    const at = core.player.position;
    const here = core.interior ? person.inRoom : person.state !== "inside" && !person.inRoom;
    if (!here || Math.hypot(person.x - at.x, person.z - at.z) > 3.5) return;
  }
  core.save = { ...core.save, errand: null, errandsDone: (core.save.errandsDone ?? 0) + 1, waypoint: null };
  const now = core.relations.get(errand.person, "player");
  setRelation(errand.person, "player", {
    kind: now?.kind ?? "acquaintance",
    role: now?.role ?? "",
    level: Math.min(100, (now?.level ?? 30) + 8),
  });
  core.hud?.setNotice(`Errand done: ${person.name} thinks a little better of you.`);
  keep([errand.person], `${personaName()} did what your note on the noticeboard asked: "${errand.text}"`);
  void runMoment({
    action: `has come to ${person.name} as the note on the noticeboard asked: "${errand.text}"`,
    listenersExtra: [{ id: person.id, name: person.name }],
  }).then((done) => !done && narrate(null, errand.done));
}

/** Now and then, with the world's voice on, a line about someone close by and what they're at. */
function noticeSomeone() {
  if ((core.settings.narration ?? "lines") === "off" || core.mode !== "walk" || core.interior) return;
  const at = core.player.position;
  const near = core.crowd
    .snapshot()
    .filter((person) => person.state !== "inside" && person.id !== core.lastSight)
    .map((person) => ({ person, far: Math.hypot(person.x - at.x, person.z - at.z) }))
    .filter((entry) => entry.far > 3 && entry.far < 16)
    .sort((a, b) => a.far - b.far)[0];
  if (!near) return;
  core.lastSight = near.person.id;
  narrate(
    null,
    pickLine(PACK.sights, `${near.person.id}:${Math.floor(core.clock)}`, {
      who: knows(near.person.id) ? near.person.name : "a stranger",
      doing: doingWords(near.person),
    }),
  );
}

/**
 * What the Lore panel shows: every entry active here, nearest place first, with the place it's tied to,
 * its lorebook and (once the lorebooks are read) its text.
 */
function activeLore(zone, names, also = []) {
  const lore = core.save?.lore ?? {};
  const books = new Map([...(core.lorebooks ?? []), ...worldBook(core.save)].map((book) => [book.id, book]));
  const sources = loreSources(zone, names);
  // (`also`: more people whose own lore is wanted, as ids: whoever's in earshot.)
  for (const id of also)
    if (!sources.some((source) => source.id === `character:${id}`)) sources.push({ id: `character:${id}`, label: "" });
  const entries = sources.flatMap((source) =>
    (lore[source.id] ?? []).map((entry) => {
      const book = books.get(entry.lorebookId);
      const found = book?.entries.find((item) => item.id === entry.entryId);
      return {
        title: found?.title ?? entry.title,
        book: book?.name ?? "",
        from: source.label,
        source: source.id,
        own: entry.lorebookId === "world", // written for this world: its text goes to the model from here
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
  return chosenBooks(save)
    .then((chosen) => {
      if (core.save?.id !== save.id) return 0;
      // Places and the world, and characters, each as the setup says (by name, by the AI, or left alone).
      const places = core.save.loreLinking !== "none";
      const people = core.save.characterLinking !== "none";
      if (people) peopleFromLore(chosen);
      core.save = {
        ...core.save,
        creatures: creaturesFromLore(chosen).map(({ words, ...creature }) => ({
          ...creature,
          ...creatureFromWords(words),
        })),
        // What lives where, and whose animals are whose, as the lore's keywords say.
        spawns: spawnsFromLore(chosen),
        petLore: petsFromLore(chosen),
        quiet: quietFromLore(chosen),
      };
      restockHerd();
      if (places) nameFromLore(chosen);
      const names = namedZones(residentsOf(core.crowd.snapshot()));
      const found = matchLore(chosen, {
        zones: places ? core.zones : { zones: [] },
        names,
        groups: places ? placeGroups() : [],
        name: places ? core.save.name : "",
        characters: people ? (core.characters ?? []).filter((character) => core.cast?.has(character.id)) : [],
        persona: people ? personaName() : null,
      });
      if (!places) delete found[WORLD_ID]; // "world" alone always matches: only with places on
      if (!people) delete found[PLAYER_ID]; // "you" / "player" too: only with characters on
      let count = Object.values(found).reduce((sum, entries) => sum + entries.length, 0);
      core.save = { ...core.save, lore: mergeLore(core.save.lore, found), lorePending: false };
      // The structure the lorebook spells out: groups of kinds, what's located in what, who lives and works where.
      const structure = structureFromLore([...chosen, ...cardBook(core.save)], {
        zones: core.zones,
        names,
        groups: placeGroups(),
        name: core.save.name,
        characters: people ? (core.characters ?? []).filter((character) => core.cast?.has(character.id)) : [],
        persona: people ? personaName() : null,
      });
      if (places) count += applyStructure(structure, chosen);
      if (people) count += applyHousing(structure.housing);
      if (core.freshStart && !core.interior) startAtHome();
      core.saves.write(core.save);
      if (people) count += setupCharactersFromLore(chosen);
      count += applyKeywords([...chosen, ...cardBook(core.save)], people);
      core.saves.write(core.save);
      void detailLocals();
      void checkKeywords();
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
 * What the lorebooks say beyond lore and housing (keywords.js): when places are closed, who owns a place
 * by the place's own entry ("ww:owned by:Mira": someone here of that name, or else a new person of that
 * name), and factions with their members, whose entry is lore for each of them. Returns how many
 * things it set.
 */
function applyKeywords(books, people) {
  const world = {
    zones: core.zones,
    names: namedZones(residentsOf(core.crowd.snapshot())),
    groups: placeGroups(),
    name: "",
    characters: people ? peopleOf(core.save).filter((person) => core.save.cast.includes(person.id)) : [],
  };
  const { hours, owners, factions } = structureFromKeywords(books, world);
  let set = Object.keys(hours).filter((id) => !core.save.hours?.[id]).length;
  core.save = { ...core.save, hours: { ...hours, ...core.save.hours } };
  if (!people) return set;
  const find = (name) =>
    peopleOf(core.save).find(
      (person) => core.save.cast.includes(person.id) && person.name.toLowerCase() === name.toLowerCase(),
    );
  // An owner nobody here answers to becomes someone new, if there's room.
  const locals = [...(core.save.locals ?? [])];
  for (const { name } of owners) {
    if (find(name) || locals.some((person) => person.name.toLowerCase() === name.toLowerCase())) continue;
    if (core.save.cast.length + locals.length - (core.save.locals ?? []).length >= MAX_PEOPLE) break;
    locals.push({
      id: `local:owner-${name.toLowerCase().replace(/[^\w]+/gu, "-")}`,
      name: name.slice(0, 60),
      description: "",
      personality: "",
      appearance: "",
    });
  }
  if (locals.length !== (core.save.locals ?? []).length) {
    const cast = [...new Set([...core.save.cast, ...locals.map((person) => person.id)])].slice(0, MAX_PEOPLE);
    core.save = { ...core.save, locals, cast };
    core.characters = peopleOf(core.save);
    core.cast = new Set(cast);
    updateCast();
  }
  const housing = {};
  for (const { place, name } of owners) {
    const person = find(name);
    if (person && core.zones.byId.get(place)?.kind === "building")
      housing[person.id] ??= { home: null, work: place, owner: true };
  }
  set += applyHousing(housing);
  // Factions: who's in them, and their entry as lore for each member.
  const lore = {};
  const made = factions.map((faction) => {
    const members = [
      ...new Set(
        faction.members
          .map((member) => (member.startsWith("character:") ? member.slice("character:".length) : find(member)?.id))
          .filter(Boolean),
      ),
    ];
    if (faction.entryId)
      for (const id of members)
        lore[`character:${id}`] = [
          ...(lore[`character:${id}`] ?? []),
          { lorebookId: faction.lorebookId, entryId: faction.entryId, title: faction.name },
        ];
    return { ...faction, members };
  });
  set += made.length;
  core.save = { ...core.save, factions: made, lore: mergeLore(core.save.lore, lore) };
  return set;
}

/**
 * Fills in the people a world made from its lore with only a name and what the entry says (or nothing,
 * for an owner a place names): the model writes who they are, their manner and their looks (server.mjs
 * `/world-write`, step "detail"), kept as their own "card" in the save. Pictures and conversations read
 * a real card first and this one for anyone without. Quiet when the server part isn't there.
 */
async function detailLocals() {
  const save = core.save;
  const bare = (save?.locals ?? []).filter((person) => !person.personality && !person.appearance).slice(0, 12);
  if (!bare.length || core.detailing || !(await core.ai.status())?.worldWrite) return;
  core.detailing = true;
  try {
    const result = await core.ai.worldWrite({
      step: "detail",
      ages: save.ages ?? null,
      connectionId: core.settings.textConnection || null,
      worldName: save.name,
      setting: save.setting,
      people: bare.map((person) => ({ name: person.name, text: person.description })),
    });
    if (core.save?.id !== save.id) return;
    const filled = new Map(bare.map((person, at) => [person.id, result?.people?.[at]]));
    const locals = core.save.locals.map((person) => {
      const more = filled.get(person.id);
      if (!more) return person;
      if (more.body && !core.bodies[person.id]) setBody(person.id, more.body);
      return {
        ...person,
        description: more.description || person.description,
        personality: more.personality || "…",
        appearance: more.appearance || "…",
      };
    });
    core.save = { ...core.save, locals };
    core.characters = peopleOf(core.save);
    core.saves.write(core.save);
  } catch (error) {
    console.warn("[wanderworld] couldn't fill in the people made from lore", error);
  } finally {
    core.detailing = false;
  }
}

/**
 * Brings in the people a lorebook describes: an entry keyed "ww:character:Mira Saxton" is that person
 * (with no name there, its title is the name). A card of exactly that name is who it means, and
 * joins the world; with no such card (a "Mira Little" beside the card "Mira Saxton") someone is made who
 * lives in this world only (`save.locals`), with the entry's text as who they are.
 */
function peopleFromLore(books) {
  const before = core.save.locals ?? [];
  const locals = [...before];
  const cast = [...core.save.cast];
  const named = (list, name) => list.find((person) => person.name.toLowerCase() === name.toLowerCase());
  for (const book of books) {
    if (book.id === "world" || book.id === "cards") continue;
    for (const entry of book.entries) {
      if (!entry.keys.some((key) => key.toLowerCase() === "character") || isCreature(entry)) continue;
      const name = loreName(entry);
      if (!name || named(locals, name)) continue;
      const full = cast.length >= MAX_PEOPLE;
      // A card chosen for this world with exactly that name is who the entry means. A card that wasn't
      // chosen is left out of it: someone of that name is made for this world instead.
      const chosen = (core.engineCharacters ?? []).filter((card) => cast.includes(card.id));
      if (named(chosen, name) || full) continue;
      const person = {
        id: `local:${`${book.id}/${entry.id}`.replace(/[^\w-]/gu, "-")}`,
        name,
        description: entry.content.slice(0, 1200),
        personality: "",
        appearance: "",
      };
      locals.push(person);
      cast.push(person.id);
    }
  }
  if (locals.length === before.length && cast.length === core.save.cast.length) return;
  core.save = { ...core.save, locals, cast };
  core.characters = peopleOf(core.save);
  core.cast = new Set(cast);
  updateCast();
}

/** Gives the places the lore names (the AI's `loreNames`: tavern1 → "The Gilded Stag") those names, unless named already. */
function nameFromLore(books = []) {
  const slots = slotsOf(core.zones);
  const names = { ...core.save.names };
  // And the names a lorebook spells out (ww:tavern1 with ww:name:The Gilded Stag).
  const world = { zones: core.zones, names: {}, groups: [], name: "", characters: [] };
  for (const [id, name] of Object.entries(namesFromLore(books, world))) names[id] ??= name;
  for (const [slot, name] of Object.entries(core.save.loreNames ?? {})) {
    const id = slots.get(slot);
    if (id && !names[id]) names[id] = name;
  }
  core.save = { ...core.save, names };
  for (const sign of core.signs ?? []) sign.setWords(signOf(sign.zone, names));
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
      .flatMap((entry) => entry.keys ?? [])
      .concat(core.save.loreKeys?.[`cards/${character.id}`] ?? []) // what the AI read in their card
      .filter((word) => word.toLowerCase().trim() !== name);
    const traits = traitsFromWords(words);
    if (Object.keys(traits).length && !core.save.traits?.[character.id]) {
      setTraits(character.id, traits);
      set++;
    }
    const stance = stanceFromWords(words);
    if (stance && !core.save.stances?.[character.id]) {
      core.save = { ...core.save, stances: { ...core.save.stances, [character.id]: stance } };
      set++;
    }
    const knowing = knowingFromWords(words);
    if (knowing.known && !core.save.known.includes(character.id)) {
      core.save = { ...core.save, known: [...core.save.known, character.id] };
      set++;
    }
    if (knowing.knowsYou && !core.save.knowsMe.includes(character.id)) {
      core.save = { ...core.save, knowsMe: [...core.save.knowsMe, character.id] };
      set++;
    }
    const voice = voiceFromWords(words);
    if (voice && !core.save.voices?.[character.id]) {
      core.save = { ...core.save, voices: { ...core.save.voices, [character.id]: voice } };
      set++;
    }
    const { body, relation } = setupFromWords(words);
    if (body && !core.bodies[character.id]) {
      setBody(character.id, body);
      set++;
    }
    if (relation && !core.relations.get(character.id, "player")) {
      setRelation(character.id, "player", relation, false);
      set++;
    }
    // "work 10:15-18:45", "home 22-7:15", "eat 12-13 at tavern1": their day, over the usual one, unless
    // it's been set already (by hand, by the AI or by an earlier link).
    const day = scheduleFromWords(words);
    if (day.length && !core.save.schedules?.[character.id]) {
      const targets = placeTargets({
        zones: core.zones,
        names: namedZones(residentsOf(core.crowd.snapshot())),
        groups: [],
      });
      // What the lore gives hours for replaces the usual hours for it (their work is 10:15 to 18:45, not
      // that and the usual morning too); the time freed is spent about town.
      const given = new Set(day.map((entry) => entry.activity));
      let entries = scheduleOf(character.id).entries.map((entry) =>
        given.has(entry.activity) ? { ...entry, activity: "walk", place: "" } : entry,
      );
      for (const { at, ...entry } of day) {
        const place = [...(targets.get(plainWord(at)) ?? [])].find((id) => core.zones.byId.has(id)) ?? "";
        entries = putEntry(entries, { ...entry, place });
      }
      setSchedule(character.id, entries, "lore");
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
  // The player's own entry ("you", "player Zoey"): their body, and how they see the others.
  const mine = (core.save.lore[PLAYER_ID] ?? [])
    .map((tie) => entries.get(`${tie.lorebookId}/${tie.entryId}`))
    .filter(Boolean)
    .flatMap((entry) => entry.keys ?? [])
    .concat(core.save.loreKeys?.["cards/player"] ?? []);
  const { body } = setupFromWords(mine);
  if (body && core.personaId && !core.bodies[core.personaId]) {
    setBody(core.personaId, body);
    set++;
  }
  for (const link of linksFromWords(mine)) {
    const to = whoIsNamed(link.name);
    if (!to || to === PLAYER_ID || core.relations.get(PLAYER_ID, to)) continue;
    setRelation(PLAYER_ID, to, link.relation, false);
    set++;
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
  const persona = plainName(personaName());
  if (["you", "player", "persona", `player ${persona}`, `persona ${persona}`].includes(wanted)) return "player";
  // A bare name means a character in town first (one may share the persona's name), else the persona.
  const character = (core.characters ?? []).find(
    (entry) => core.cast?.has(entry.id) && plainName(entry.name) === wanted,
  );
  return character?.id ?? (wanted === persona ? "player" : null);
}

/**
 * Puts a lorebook's groups and placements into the world's setup: "group of home" groups (with their
 * entry as lore), places and groups put inside groups, groups inside groups. A place the lore puts
 * somewhere the world didn't build it waits for the world builder. Returns how many things changed.
 */
function applyStructure({ groups: made, placements }, books) {
  const groups = placeGroups().map((group) => ({ ...group }));
  let changed = 0;
  for (const group of made) {
    const at = groups.findIndex((entry) => entry.id === group.id);
    if (at >= 0) groups[at] = { ...groups[at], name: group.name, members: group.members };
    else groups.push(group);
    changed++;
  }
  // The group's own entry is its lore.
  const lore = { ...core.save.lore };
  for (const book of books) {
    for (const entry of book.entries) {
      const id = `group:lore-${book.id}-${entry.id}`;
      if (!made.some((group) => group.id === id)) continue;
      lore[id] = mergeLore(
        { [id]: lore[id] ?? [] },
        { [id]: [{ lorebookId: book.id, entryId: entry.id, title: entry.title }] },
      )[id];
    }
  }
  const waiting = [];
  for (const placement of placements) {
    const target = groups.find((group) => group.id === placement.in);
    const subjectGroup = groups.find((group) => group.id === placement.place);
    if (target && subjectGroup) subjectGroup.parent = target.id;
    else if (target) target.members = [...new Set([...target.members, placement.place])];
    else if (placement.in === WORLD_ID) continue;
    else {
      const zone = core.zones.byId.get(placement.place);
      const inside = zone && chainOf(core.zones, zone).some((at) => at.id === placement.in);
      if (!inside) waiting.push(placement);
      continue;
    }
    changed++;
  }
  core.save = { ...core.save, groups, lore, waitingPlacements: waiting };
  return changed;
}

/** Homes and workplaces from lore, for characters who have none set yet. Returns how many it set. */
function applyHousing(found) {
  const housing = { ...core.save.housing };
  let set = 0;
  for (const [id, entry] of Object.entries(found)) {
    const now = housing[id] ?? { home: null, work: null, owner: false };
    const next = {
      home: now.home ?? entry.home,
      work: now.work ?? entry.work,
      owner: now.work ? now.owner : entry.owner,
    };
    if (next.home !== now.home) set++;
    if (next.work !== now.work) set++;
    housing[id] = next;
  }
  core.save = { ...core.save, housing };
  useHousing();
  return set;
}

/** Journal → People's homes-and-work editor: everyone here, and the houses and workplaces to choose from. */
function housingData(names) {
  if (!core.zones) return { people: [], homes: [], workplaces: [] };
  const slots = new Map([...slotsOf(core.zones)].map(([slot, id]) => [id, slot]));
  const label = (zone) => {
    const name = names[zone.id] ?? zone.name;
    const slot = slots.get(zone.id) ?? slots.get(zone.parent);
    return { id: zone.id, name: slot ? `${name} (${slot})` : name };
  };
  const buildings = core.zones.zones.filter(
    (zone) => zone.kind === "building" && zone.door !== null && zone.door !== undefined,
  );
  const lived = new Set(["home", "cottage", "farm"]);
  const housing = core.save?.housing ?? {};
  return {
    people: (core.characters ?? [])
      .filter((character) => core.cast?.has(character.id))
      .map((character) => ({
        id: character.id,
        name: character.name,
        home: housing[character.id]?.home ?? null,
        work: housing[character.id]?.work ?? null,
        owner: housing[character.id]?.owner === true,
      })),
    homes: buildings.filter((zone) => lived.has(zone.buildingKind)).map(label),
    workplaces: buildings.filter((zone) => zone.buildingKind !== "home" && zone.buildingKind !== "cottage").map(label),
  };
}

/** Sets where character `id` lives and works, by hand (Journal → People); null fields are left to chance. */
function setHousingByHand(id, { home, work, owner }) {
  if (!core.save) return;
  const housing = {
    ...core.save.housing,
    [id]: { home: home ?? null, work: work ?? null, owner: !!work && owner === true },
  };
  if (!home && !work) delete housing[id];
  core.save = { ...core.save, housing };
  core.saves.write(core.save);
  useHousing();
  core.placesChanged = true;
  core.journalAt = 0;
}

// ── Your household (Journal → Home) ─────────────────────────────────────────
// Where the player lives, who with, and who's coming round. All by rules: no model is called.

/** Whether `id` would come round, or move in: they know the player and don't dislike them. */
function welcomeFrom(id) {
  return knows(id) && core.relations.feeling(id, PLAYER_ID).warmth >= 0;
}

/** Journal → Home: the player's home, who lives there, the empty houses, and who could be asked. */
function householdData(snapshot, names) {
  if (!core.zones || !core.save) return null;
  const mine = core.save.housing?.[PLAYER_ID]?.home ?? null;
  const myDoor = playerHomeDoor();
  const slots = new Map([...slotsOf(core.zones)].map(([slot, id]) => [id, slot]));
  const farFrom = (zone) => {
    const door = core.world?.doors[zone.door];
    // (Indoors, the player's place is the room's own: where they are in the world is that building's door.)
    const here = core.interior?.door ?? core.player.position;
    return door ? Math.hypot(door.x - here.x, door.z - here.z) : Infinity;
  };
  const mates = myDoor === null ? [] : snapshot.filter((person) => person.home === myDoor);
  const mateIds = new Set(mates.map((mate) => mate.id));
  return {
    home: mine && myDoor !== null ? { id: mine, name: names[mine] ?? "your home" } : null,
    mates: mates.map((mate) => ({ id: mate.id, name: mate.name })),
    // (Empty houses are all "a house": each is told apart by its numbered name, as on the map and in lore.)
    // The nearest twenty: a town has more empty houses than a list on a phone should.
    vacant: vacantHomes(core.zones.zones, snapshot, mine)
      .map((zone) => ({ zone, far: farFrom(zone) }))
      .sort((a, b) => a.far - b.far)
      .slice(0, 20)
      .map(({ zone }) => ({
        id: zone.id,
        name: `${names[zone.id] ?? zone.name}${slots.has(zone.id) ? ` (${slots.get(zone.id)})` : ""}`,
      })),
    friends: snapshot
      .filter((person) => !mateIds.has(person.id) && welcomeFrom(person.id))
      .map((person) => ({ id: person.id, name: person.name, coming: core.invites?.has(person.id) === true })),
    visitHours: VISIT_HOURS,
    walkIn: core.settings.interiors === true, // (furnishing is done indoors: rooms have to be switched on)
    // Furnishing: only inside your own home.
    furnish:
      core.interior && core.interior.door.index === myDoor
        ? {
            pieces: Object.entries(FURNITURE).map(([id, piece]) => ({ id, name: piece.label })),
            placed: (core.save.furnished?.[mine] ?? []).map((entry, index) => ({
              index,
              name: FURNITURE[entry.piece]?.label ?? entry.piece,
            })),
          }
        : null,
  };
}

/** Writes who lives where, and has everyone (and the animals kept at home) go by it. */
function commitHousing(housing) {
  core.save = { ...core.save, housing };
  core.saves.write(core.save);
  useHousing();
  syncPets();
  core.placesChanged = true;
  core.journalAt = 0;
}

/** The player moves to the empty house `zoneId`; of those they live with, `bring` (ids) come too, the rest stay. */
function moveHome(zoneId, bring = []) {
  if (!core.save || !core.zones) return;
  const snapshot = core.crowd.snapshot();
  const old = core.save.housing?.[PLAYER_ID]?.home ?? null;
  // (Only a house that still stands empty: someone may have moved in since it was listed.)
  if (!vacantHomes(core.zones.zones, snapshot, old).some((zone) => zone.id === zoneId)) return;
  const oldDoor = playerHomeDoor();
  const mates = oldDoor === null ? [] : snapshot.filter((person) => person.home === oldDoor);
  const along = mates.filter((mate) => bring.includes(mate.id));
  const housing = housingAfterMove(core.save.housing, {
    who: PLAYER_ID,
    from: old,
    to: zoneId,
    mates: mates.map((mate) => mate.id),
    bring,
  });
  commitHousing(housing);
  const names = namedZones(residentsOf(core.crowd.snapshot()));
  const withThem = along.length ? `, and ${along.map((mate) => mate.name).join(" and ")} with you` : "";
  narrate(null, `(You move into ${names[zoneId] ?? "your new home"}${withThem}.)`);
  for (const mate of along) keep([mate.id], `You moved house with ${personaName()}.`);
}

/** `id` comes to live at the player's home, if they would (welcomeFrom). */
function moveIn(id) {
  const mine = core.save?.housing?.[PLAYER_ID]?.home ?? null;
  const person = core.crowd.snapshot().find((entry) => entry.id === id);
  if (!mine || !person) return;
  if (!welcomeFrom(id)) return void narrate(null, `(${person.name} would rather not.)`);
  const now = core.save.housing?.[id] ?? { home: null, work: null, owner: false };
  commitHousing({ ...core.save.housing, [id]: { ...now, home: mine } });
  narrate(null, `(${person.name} moves in with you.)`);
  keep([id], `You moved in with ${personaName()}, at their home.`);
}

/** `id` leaves the player's home: for an empty house if there is one, or else the least crowded. */
function moveOut(id) {
  const mine = core.save?.housing?.[PLAYER_ID]?.home ?? null;
  const snapshot = core.crowd.snapshot();
  const person = snapshot.find((entry) => entry.id === id);
  if (!mine || !person) return;
  const other = homeToLeaveFor(core.zones.zones, snapshot, mine);
  const now = core.save.housing?.[id] ?? { home: null, work: null, owner: false };
  commitHousing({ ...core.save.housing, [id]: { ...now, home: other?.id ?? null } });
  const names = namedZones(residentsOf(core.crowd.snapshot()));
  narrate(null, `(${person.name} moves out${other ? `, to ${names[other.id] ?? "another house"}` : ""}.)`);
  keep([id], `${personaName()} asked you to move out of their home.`);
}

/** The room the player is in, made again with the home's pieces as they are now; the player stays put. */
function refurnish() {
  const inside = core.interior;
  if (!inside) return;
  const { door } = inside;
  const room = createInterior(door, core.seed, core.save?.furnished?.[`building:${door.index}`] ?? []);
  core.crowd.hideRoom();
  core.player.removeFromParent();
  inside.room.dispose();
  core.interior = { door, room };
  core.space = room;
  core.crowd.showRoom(door, room);
  room.scene.add(core.player);
  if (core.settings.props) {
    kitModels("props", room.propNames)
      .then((models) => {
        if (core.interior?.room === room) room.addProps(models);
      })
      .catch((error) => console.warn("[wanderworld] detailed furniture failed to load", error));
  }
}

/** Writes the home's pieces and shows the room with them. */
function setFurniture(zoneId, list) {
  const furnished = { ...core.save.furnished, [zoneId]: list };
  if (!list.length) delete furnished[zoneId];
  core.save = { ...core.save, furnished };
  core.saves.write(core.save);
  refurnish();
  core.placesChanged = true;
  core.journalAt = 0;
}

/** Puts `piece` (household.js FURNITURE) down a step in front of the player, facing them, in their own home. */
function furnish(piece) {
  const mine = core.save?.housing?.[PLAYER_ID]?.home ?? null;
  if (!mine || !core.interior || core.interior.door.index !== playerHomeDoor()) return;
  if (core.mode !== "walk") return void core.hud?.setNotice("Stand up first.");
  const facing = core.player.rotation.y;
  const at = {
    x: core.player.position.x + Math.sin(facing) * 1.1,
    z: core.player.position.z + Math.cos(facing) * 1.1,
    angle: facing + Math.PI,
  };
  const result = placeFurniture(core.save.furnished?.[mine] ?? [], piece, at, core.interior.room);
  if (result.error) return void core.hud?.setNotice(result.error);
  const put = result.list.at(-1);
  if (core.interior.room.blocked(put.x, put.z, 0.1))
    return void core.hud?.setNotice("Something's already standing there. Step to a clear bit of floor.");
  setFurniture(mine, result.list);
  // (Never left standing inside what was just put down.)
  core.space.resolveCollisions(core.player.position, PLAYER_RADIUS, true);
}

/** Takes away the `index`th piece the player put in their home. */
function unfurnish(index) {
  const mine = core.save?.housing?.[PLAYER_ID]?.home ?? null;
  const list = core.save?.furnished?.[mine] ?? [];
  if (!mine || !core.interior || core.interior.door.index !== playerHomeDoor() || !list[index]) return;
  if (core.mode !== "walk") return void core.hud?.setNotice("Stand up first.");
  setFurniture(
    mine,
    list.filter((_, at) => at !== index),
  );
}

/** Asks `id` round: they head for the player's home and stay a few hours (VISIT_HOURS), if they would. */
function inviteOver(id) {
  const person = core.crowd.snapshot().find((entry) => entry.id === id);
  if (!person || playerHomeDoor() === null) return;
  if (!welcomeFrom(id)) return void narrate(null, `(${person.name} would rather not.)`);
  core.invites ??= new Map();
  core.invites.set(id, visitFrom(core.hour, core.social?.day ?? 0));
  useSchedules();
  core.placesChanged = true;
  narrate(null, `(${person.name} says they'll come round to yours.)`);
  recall([id], `${personaName()} asked you round to their home.`);
}

/**
 * Market days and festivals (events.js): when the day turns, people's days are made again for it; a line
 * says what today is, and another when its hours begin. Each is said once.
 */
function tellEvents() {
  const day = core.social?.day ?? 0;
  const event = core.settings.worldEvents ? eventOn(day) : null;
  const key = `${day}:${event?.id ?? ""}`;
  if (core.eventDay !== key) {
    const first = core.eventDay === undefined; // (a world just opened: no "today" line in the middle of a day)
    core.eventDay = key;
    core.eventBegun = false;
    useSchedules();
    if (event && (!first || core.hour < event.from)) narrate(null, `(${eventWords(event.today)})`);
  }
  if (event && !core.eventBegun && eventOpen(event, core.hour)) {
    core.eventBegun = true;
    narrate(null, `(${eventWords(event.begins)})`);
  }
}

/** An event's line, with this world's name for the market square. */
function eventWords(text) {
  const names = namedZones(residentsOf(core.crowd.snapshot()));
  return text.replace("{plaza}", names.plaza ?? "the market square");
}

/** Ends the visits whose time is up (called with the social life, every couple of seconds). */
function endVisits() {
  if (!core.invites?.size) return;
  let ended = false;
  for (const [id, visit] of core.invites) {
    if (!visitOver(visit, core.hour, core.social?.day ?? 0)) continue;
    core.invites.delete(id);
    ended = true;
  }
  if (ended) useSchedules();
}

// ── Schedules (schedules.js) ────────────────────────────────────────────────

/** The places a schedule can name: buildings with a door, the market, places out in the country. */
function schedulePlaces() {
  if (!core.zones) return [];
  const names = namedZones(residentsOf(core.crowd.snapshot()));
  const slots = new Map([...slotsOf(core.zones)].map(([slot, id]) => [id, slot]));
  return core.zones.zones
    .filter(
      (zone) =>
        (zone.kind === "building" && zone.door !== null && zone.door !== undefined) ||
        ["plaza", "fountain", "outpost", "garden", "meadow"].includes(zone.kind) ||
        zone.outpostKind === "hamlet",
    )
    .map((zone) => ({
      id: zone.id,
      name: names[zone.id] ?? zone.name,
      kind: zone.kind === "building" ? zone.buildingKind : (zone.outpostKind ?? zone.kind),
      slot: slots.get(zone.id) ?? "",
    }));
}

/** Someone's day as the world has it: theirs if set (by the player or the AI), else a usual one. */
function scheduleOf(id) {
  const set = core.save?.schedules?.[id];
  if (set?.entries?.length) return { entries: set.entries, by: set.by };
  const tavern = core.zones?.zones.find((zone) => zone.kind === "building" && zone.buildingKind === "tavern");
  const square = core.zones?.byId.get("plaza");
  return {
    entries: usualDay(id, {
      work: !!core.save?.housing?.[id]?.work,
      tavern: tavern?.id ?? "",
      square: square?.id ?? "",
    }),
    by: "usual",
  };
}

/** Tells the townsfolk their days: each entry's place as a door to go in at, or a spot to go to. */
function useSchedules() {
  if (!core.zones) return;
  const where = (placeId) => {
    const zone = placeId ? core.zones.byId.get(placeId) : null;
    if (!zone) return { door: null, point: null };
    if (Number.isInteger(zone.door)) return { door: zone.door, point: null };
    // A place out in the country: its own building's door, if it has one.
    const building = core.zones.zones.find((entry) => entry.parent === zone.id && Number.isInteger(entry.door));
    if (building && zone.kind === "outpost") return { door: building.door, point: null };
    const circle = zone.shape?.circle;
    const box = zone.shape?.box;
    const point = circle
      ? { x: circle.x, z: circle.z }
      : box
        ? { x: (box.minX + box.maxX) / 2, z: (box.minZ + box.maxZ) / 2 }
        : null;
    return { door: null, point };
  };
  const map = {};
  for (const character of core.characters ?? []) {
    if (!core.cast?.has(character.id)) continue;
    map[character.id] = scheduleOf(character.id).entries.map((entry) => ({ ...entry, ...where(entry.place) }));
  }
  // On a market day or a festival (events.js), a share of the town is in the square for its hours: after
  // whatever a day set by hand says for then, before the rest of it.
  const event = core.settings.worldEvents ? eventOn(core.social?.day ?? 0) : null;
  const plaza = core.world?.layout?.plaza;
  if (event && plaza) {
    for (const [id, entries] of Object.entries(map)) {
      if (!goesTo(event, id, core.social.day)) continue;
      // (Not someone whose day was set by hand for those hours.)
      const during = (entry) =>
        entry.from < entry.to
          ? entry.from < event.to && entry.to > event.from
          : entry.from < event.to || entry.to > event.from;
      if (core.save?.schedules?.[id]?.entries?.length && entries.some(during)) continue;
      map[id] = [
        { from: event.from, to: event.to, activity: "visit", door: null, point: standAt(plaza, id) },
        ...entries,
      ];
    }
  }
  // Whoever's been asked round goes to the player's home first, for as long as the visit lasts.
  const mine = playerHomeDoor();
  for (const [id, visit] of core.invites ?? []) {
    if (mine === null || !core.cast?.has(id)) continue;
    map[id] = [{ from: visit.from, to: visit.to, activity: "visit", door: mine, point: null }, ...(map[id] ?? [])];
  }
  core.crowd.setSchedules(map);
}

/** Sets `id`'s schedule (null: back to a usual day). `by`: "you" or "ai". */
function setSchedule(id, entries, by = "you") {
  if (!core.save) return;
  const schedules = { ...core.save.schedules };
  if (entries?.length) schedules[id] = { entries, by };
  else delete schedules[id];
  core.save = { ...core.save, schedules };
  core.saves.write(core.save);
  useSchedules();
  core.placesChanged = true;
  core.journalAt = 0;
}

/** The AI plans `id`'s day (server.mjs /plan), with what the player asked for. Returns words for the editor. */
async function planSchedule(id, request = "") {
  if (!core.ai.known()?.plans) return "Wanderworld's server part isn't running.";
  const places = schedulePlaces();
  const names = Object.fromEntries(places.map((place) => [place.id, place.name]));
  const house = core.save?.housing?.[id] ?? {};
  try {
    const { entries } = await core.ai.plan({
      characterId: id,
      home: names[house.home] ?? "",
      work: names[house.work] ?? "",
      places: places.map(({ id: placeId, name, kind }) => ({ id: placeId, name, kind })),
      current: scheduleOf(id).entries,
      request,
      connectionId: core.settings.textConnection || null,
    });
    setSchedule(id, entries, "ai");
    return "Planned.";
  } catch (error) {
    return `Couldn't plan it: ${error?.message ?? error}`;
  }
}

/** Puts one entry the AI agreed in a moment ("meet me at the fountain at noon") into `id`'s day. */
function scheduleFromMoment(id, entry) {
  setSchedule(id, putEntry(scheduleOf(id).entries, entry), "ai");
}

/** Tells the townsfolk where they live and work (the world's housing, as door indexes). */
function useHousing() {
  if (!core.zones) return;
  const door = (id) => core.zones.byId.get(id)?.door ?? null;
  core.crowd.setHousing(
    Object.fromEntries(
      Object.entries(core.save?.housing ?? {}).map(([id, entry]) => [
        id,
        { home: door(entry.home), work: door(entry.work) },
      ]),
    ),
  );
  useSchedules();
}

/** Changes the world's setup from Journal → World: its setting words, lorebooks or how lore is linked. */
function setSetup(fields) {
  if (!core.save) return;
  core.save = { ...core.save, ...fields };
  core.saves.write(core.save);
  if ("population" in fields) restockHerd(); // this world's own numbers of animals
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
    { id: PLAYER_ID, label: `${personaName()} (you)` },
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
  // A place is told once the player has settled there (not for passing through, or stepping in by mistake).
  if (core.arriveZone !== zone.id && core.clock - core.zoneSince >= ARRIVE_SETTLE) {
    core.arriveZone = zone.id;
    arrive(zone, names);
  }
  finishErrand();
  if (core.clock - (core.peopleAt ?? -9) > 2) {
    core.peopleAt = core.clock;
    refreshPeopleHere();
  }
  core.sightAt ??= core.clock - SIGHT_EVERY + 40; // the first one a little after arriving
  if (core.clock - core.sightAt >= SIGHT_EVERY) {
    core.sightAt = core.clock;
    noticeSomeone();
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
  // Each place's numbered name ("home6"), shown in the Places tree for lorebook keywords.
  const slotNames = new Map([...slotsOf(zones)].filter(([slot]) => slot !== "wilds1").map(([slot, id]) => [id, slot]));
  const say = (who) => describe(zones, who, names);
  const playerWho = {
    name: personaName(),
    state: core.mode === "sit" ? "sit" : core.mode === "talk" ? "talk" : "idle",
    seat: core.mode === "sit" && !core.seat?.ground,
    doing: core.seat?.ground ? (core.seat.ground === "lie" ? "lying on the ground" : "sitting on the ground") : "",
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
      doing: person.doing ? actWords(person.doing) : "",
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
      // "…, at home" when standing at (or in) the player's own house.
      place: atHome() ? `${say(playerWho)}, at home` : say(playerWho),
      chain: [
        ...chainOf(zones, zone).map((at) => names[at.id]),
        ...groupsAt(placeGroups(), chainOf(zones, zone)).map((group) => group.name),
      ].join(" · "),
      lore: loreAt(zone),
      nearby,
      scenes: (core.save?.scenes ?? []).slice(-3).reverse().map(describeScene),
      // What happened in scenes played out from this world (their recaps), newest first.
      recaps: (core.save?.events ?? [])
        .filter((event) => event.kind === "scene" && event.summary)
        .slice(-3)
        .reverse()
        .map((event) => (event.place ? `At ${event.place}: ${event.summary}` : event.summary)),
      picture: core.picture?.zoneId === zone.id ? core.picture : null,
      canPicture: !!core.ai.known()?.images,
    },
    roster: rosterData(names),
    locals: core.save?.locals ?? [],
    everyone: (core.characters ?? [])
      .filter((character) => core.cast?.has(character.id))
      .map((character) => ({ id: character.id, name: character.name })),
    people: lines.map((entry) => {
      const toYou = core.relations.get(entry.person.id, "player");
      const house = core.save?.housing?.[entry.person.id];
      const where = [
        house?.home && names[house.home] ? `lives in ${names[house.home]}` : null,
        house?.work && names[house.work] ? `${house.owner ? "owns" : "works at"} ${names[house.work]}` : null,
      ].filter(Boolean);
      return [
        entry.line,
        toYou ? core.relations.describe(entry.person.id, "player", { ...nameIds(), player: "you" }) : null,
        where.length ? `${entry.person.name} ${where.join(" and ")}` : null,
      ]
        .filter(Boolean)
        .join(". ");
    }),
    relations: relationsData(),
    lately: core.settings.worldLog ? [...(core.social?.log ?? [])].slice(-20).reverse() : [],
    party: core.crowd.party(),
    household: householdData(snapshot, names),
    animals: core.save ? partyAnimals() : [],
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
      slot: slotNames.get(at.id),
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
      look: core.save?.look ?? "",
      usualLook: PACK.look,
      ages: core.save?.ages ?? { min: null, max: null },
      sceneInstructions: core.save?.sceneInstructions ?? "",
      lorebooks: core.save?.lorebooks ?? [],
      loreLinking: core.save?.loreLinking ?? "none",
      characterLinking: core.save?.characterLinking ?? "none",
      waiting: (core.save?.waitingPlacements ?? []).map((entry) => entry.title),
      season: core.save?.season ?? "",
      book: core.save?.book?.entries ?? [],
      keywords: core.keywordCheck?.id === core.save?.id ? core.keywordCheck : null,
      creatures: (core.save?.creatures ?? []).map((creature) =>
        creature.hostile ? `${creature.name} (hostile)` : creature.name,
      ),
      needs: core.save?.needs ?? {},
      allLorebooks: core.lorebooks?.map((book) => ({ id: book.id, name: book.name })) ?? null,
      name: core.save?.name ?? "",
      town: names.town,
      time: clockText(),
      people: snapshot.length,
      seed: core.seed,
      // This world's own numbers of animals (null: as Settings has them), and what Settings has.
      population: core.save?.population ?? null,
      populationUsual: herdOptions().counts,
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
          ...readKeys(entry.keys),
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
    // Its "Lore (n)" in Places is up to date as soon as you go back.
    core.placesChanged = true;
    core.journalAt = 0;
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
/** Plays as persona `id`. `redress`: the same persona with a new body or look, so no stand-in shows meanwhile. */
async function choosePersona(id, redress = false) {
  const persona = core.personas?.find((entry) => entry.id === id) ?? null;
  core.personaId = persona?.id ?? null;
  if (persona) store(PERSONA_KEY, persona.id);
  const load = ++core.personaLoad;
  if (!redress || !core.character) setCharacter(createFigure(persona?.name ?? ""));
  // (Their look may ask for one of their card's models, or for the built-in person over them all.)
  const avatar = core.looks[persona?.id]?.avatar;
  const model = persona ? await findModel({ type: "persona", id: persona.id }, avatar) : null;
  if (load !== core.personaLoad) return;
  if (!model && core.settings.people !== "kit" && avatar !== BUILT_IN) return;
  if (model) core.hud?.setStatus(`Loading ${persona.name}'s model…`);
  try {
    // Their own 3D model, or else a person dressed from the kit.
    const character = model
      ? await loadModelCharacter(model)
      : await createPerson(persona?.name ?? "", core.bodies[persona?.id] ?? "auto", core.looks[persona?.id] ?? {});
    core.personaHasModel = !!model;
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
  // Whoever lives in this region, and the party that came along (isHere).
  const chosen = (core.characters ?? [])
    .filter((character) => core.cast.has(character.id) && isHere(character))
    .map((character) => ({
      ...character,
      body: core.bodies[character.id] ?? "auto",
      look: core.looks[character.id] ?? {},
    }));
  core.crowd.setCast(chosen);
  useSchedules();
  core.crowd.setShadows(core.settings.shadows);
  refreshNames();
  core.hud?.setCharacters(core.characters ?? [], core.cast, core.bodies);
  savePlace(true);
}

/** Sets which default body `id` (a character or persona) gets: "male", "female" or "auto". */
function setBody(id, body) {
  if (body === "male" || body === "female") core.bodies[id] = body;
  else delete core.bodies[id];
  // Saved with this world only: another world keeps its own choice.
  if (core.save) {
    core.save = { ...core.save, bodies: { ...core.bodies } };
    core.saves.write(core.save);
  }
  if (id === core.personaId) {
    core.hud?.setPersonas(core.personas ?? [], core.personaId, core.bodies); // its body picker shows it too
    void choosePersona(id);
  } else updateCast();
}

/**
 * Sets what `id` (a character or the persona) looks like without a 3D model: `look` is the choices made
 * by hand (looks.js), or null to go back to what their name gives. Kept with this world.
 */
function setLook(id, look) {
  const checked = checkLook(look);
  if (Object.keys(checked).length) core.looks[id] = checked;
  else delete core.looks[id];
  if (core.save) {
    core.save = { ...core.save, looks: { ...core.looks } };
    core.saves.write(core.save);
  }
  if (id === core.personaId) void choosePersona(id, true);
  else updateCast();
}

// ── The living world ─────────────────────────────────────────────────────────

/**
 * Each of `ids` remembers `text` (memory.js): only them. `said`: the player said it to them. `how`: how
 * they came by it ("saw", "heard").
 */
function recall(ids, text, said, how = said ? "heard" : "", lasting = false) {
  if (core.settings.memories) core.memories?.remember(ids, text, core.social?.day ?? 0, said, how, "", lasting);
}

/** How many everyday and lasting memories `id` keeps: their own numbers (Edit people), else the settings'. */
function memoryLimits(id) {
  const own = core.save?.memoryLimits?.[id] ?? {};
  return { each: own.each ?? core.settings.memoryEach, kept: own.kept ?? core.settings.memoryKept };
}

/**
 * What the model is told of what each of `ids` remembers: the settings' counts shared between them, a
 * number of their own for anyone who has one (memory.js toldShares). { [id]: [lines] }.
 */
function memoriesTold(ids) {
  if (!core.settings.memories || !core.memories) return Object.fromEntries(ids.map((id) => [id, []]));
  const own = (key) => Object.fromEntries(ids.map((id) => [id, core.save?.memoryLimits?.[id]?.[key]]));
  const counted = core.settings.memoryToldCounted === true;
  // (How many each has of either kind: a share someone can't fill goes to the others.)
  const lists = Object.fromEntries(ids.map((id) => [id, core.memories.list(id).filter((memory) => !memory.pinned)]));
  const have = (lasting) =>
    Object.fromEntries(ids.map((id) => [id, lists[id].filter((memory) => memory.kept === lasting).length]));
  const each = toldShares(ids, core.settings.memoryTold, own("told"), counted, have(false));
  const kept = toldShares(ids, core.settings.memoryKeptTold, own("keptTold"), counted, have(true));
  const today = core.social?.day ?? 0;
  return Object.fromEntries(ids.map((id) => [id, core.memories.known(id, each[id], today, kept[id])]));
}

/**
 * Each of `ids` remembers `text` for good: something that mattered (a scene together, a night at the
 * fire, moving house), which everyday memories don't push out (memory.js `kept`).
 */
function keep(ids, text) {
  recall(ids, text, false, "", true);
}

/** How far off someone sees what the player does. */
const SIGHT_RANGE = 14;

/**
 * The people who can see the player now (ids): out of doors, anyone within a stone's throw; indoors,
 * nobody but those `among` (who's in the room). With "People notice what you do" off, `among` alone.
 */
function inSight(among = []) {
  if (!core.settings.memorySights || core.interior) return among;
  const { x, z } = core.player.position;
  const known = new Set((core.characters ?? []).map((character) => character.id));
  return [
    ...new Set([
      ...among,
      ...core.crowd
        .snapshot()
        .filter(
          (person) =>
            known.has(person.id) && person.state !== "inside" && Math.hypot(person.x - x, person.z - z) <= SIGHT_RANGE,
        )
        .map((person) => person.id),
    ]),
  ];
}

/**
 * Moves the world's social life on (social.js) every couple of seconds: who is together now (friends out
 * with each other, people talking, the party with the player), by the world's own hours. And on coming
 * back to the town or the country after a while away, says what happened there meanwhile.
 */
function socialTick(dt) {
  if (!core.save || !core.social || !core.zones) return;
  core.socialWait = (core.socialWait ?? 0) + dt;
  if (core.socialWait < 2) return;
  endVisits();
  tellEvents();
  const hours = (core.socialWait * 24 * (core.settings.timeSpeed ?? 1)) / DAY_SECONDS;
  core.socialWait = 0;
  const snapshot = core.crowd.snapshot();
  const zoneNames = namedZones(residentsOf(snapshot));
  const areaOf = (zone) => (chainOf(core.zones, zone).some((entry) => entry.kind === "town") ? "town" : "country");
  const idOf = new Map(snapshot.map((person) => [person.name, person.id]));
  const groups = [];
  const seen = new Set();
  for (const person of snapshot) {
    const ids = [
      person.id,
      ...person.company,
      ...(person.with && idOf.has(person.with) ? [idOf.get(person.with)] : []),
    ];
    const key = [...new Set(ids)].sort().join("|");
    if (ids.length < 2 || seen.has(key)) continue;
    seen.add(key);
    const zone =
      (person.inDoor !== null && core.zones.byId.get(`building:${person.inDoor}`)) ||
      zoneAt(core.zones, person.x, person.z);
    const where = zoneNames[zone.id] ?? "";
    groups.push({ ids, where, what: where ? `at ${where}` : "", area: areaOf(zone) });
  }
  const at = core.interior ? core.interior.door : core.player.position;
  const here = zoneAt(core.zones, at.x, at.z);
  const area = areaOf(here);
  const party = core.crowd
    .party()
    .filter((member) => !member.waiting)
    .map((member) => member.id);
  if (party.length)
    groups.push({ ids: ["player", ...party], where: zoneNames[here.id] ?? "", what: "travelling together", area });
  const names = nameIds();
  // Gossip (Settings → People pass on what they know): now and then one of two who are together tells
  // the other something they saw or heard themselves.
  if (core.settings.gossip && core.settings.memories)
    for (const group of groups) {
      const pair = [...new Set(group.ids)].filter((id) => id !== "player").sort(() => Math.random() - 0.5);
      if (pair.length >= 2 && Math.random() < hours * MEMORY.GOSSIP_PER_HOUR)
        core.memories?.pass(pair[0], pair[1], names[pair[0]] || "someone", core.social.day);
    }
  const lines = core.social.step(core.hour, hours, groups, {
    relations: core.relations,
    traits: (id) => checkTraits(core.save?.traits?.[id]),
    name: (id) => names[id] ?? "",
    random: Math.random,
    moving: core.settings.relationsMove,
    logging: core.settings.worldLog,
  });
  if (lines.length) {
    core.relationsChanged = true;
    core.journalAt = 0;
    // Whoever was part of something remembers it.
    for (const entry of lines) recall(entry.who, entry.text, false, "", entry.big === true);
  }
  // Coming back somewhere after a few hours: what happened there meanwhile (not what the player was part of).
  const now = core.social.day * 24 + core.hour;
  if (core.area && core.area !== area) {
    core.away[core.area] = now;
    const left = core.away[area];
    const missed = (core.social.log ?? []).filter(
      (entry) => entry.area === area && entry.day * 24 + entry.hour >= left && !entry.who.includes("player"),
    );
    if (core.settings.awayRecap && core.settings.worldLog && left !== undefined && now - left >= 3 && missed.length)
      narrate(
        null,
        `(While you were away: ${missed
          .slice(-3)
          .map((entry) => entry.text)
          .join(" ")})`,
      );
  }
  core.area = area;
}

// ── How many animals, and which ──────────────────────────────────────────────

/** What Settings → Animals says, as the herd takes it: how many of each sort, and the kinds there are none of. */
function herdOptions() {
  const s = core.settings;
  // Where the lore keeps the world's own animals out of (ww:animals:none): everywhere, the country, or
  // round a place that has a spot.
  const quiet = { all: false, wild: false, areas: [] };
  if (core.zones && core.save?.quiet?.length) {
    const targets = placeTargets({
      zones: core.zones,
      names: core.save.names ?? {},
      groups: [],
      name: "",
      characters: [],
    });
    for (const word of core.save.quiet) {
      if (word === "world") quiet.all = true;
      else if (/^(forest|wilds)\d*$/u.test(word)) quiet.wild = true;
      for (const id of targets.get(plainWord(word)) ?? []) {
        const shape = core.zones.byId.get(id)?.shape;
        if (shape?.circle) quiet.areas.push({ x: shape.circle.x, z: shape.circle.z, r: shape.circle.r + 3 });
        else if (shape?.box)
          quiet.areas.push({
            x: (shape.box.minX + shape.box.maxX) / 2,
            z: (shape.box.minZ + shape.box.maxZ) / 2,
            r: Math.hypot(shape.box.maxX - shape.box.minX, shape.box.maxZ - shape.box.minZ) / 2 + 2,
          });
      }
    }
  }
  return {
    quiet,
    // (This world's own numbers, when it has them: Journal → World.)
    counts: core.save?.population ?? {
      strays: s.animalsStrays,
      farm: s.animalsFarm,
      wild: s.animalsWild,
      hostile: s.animalsHostile,
      monsters: s.animalsMonsters,
      town: s.animalsTown,
    },
    off: Object.entries(SWITCHES).flatMap(([name, kinds]) =>
      s[`animal${name[0].toUpperCase()}${name.slice(1)}`] === false ? kinds : [],
    ),
  };
}

/**
 * Whether an animal the lore asks for, or someone's own, is in the world: never one of a kind switched
 * off; and with "Lore's and owned animals appear even at 0" off, not one of a sort set to 0.
 */
function animalAllowed(kind) {
  const { counts, off } = herdOptions();
  return !off.includes(kind) && (core.settings.loreAnimals || counts[SORT_OF[kind]] > 0);
}

/** Counts the world's animals out again after a change in Settings → Animals. */
function restockHerd() {
  if (!core.world) return;
  if (core.mount) {
    // (Whatever was being ridden is gone with the rest: down where they are.)
    core.mount = null;
    core.mounting = null;
    core.mode = "walk";
    core.glide = null;
    core.player.rotation.z = 0;
  }
  core.herd.setWorld(core.world, hashString(core.seed), herdOptions());
  syncPets();
  syncSpawns();
}

// ── Animals of one's own ─────────────────────────────────────────────────────
// A dog for anyone, a horse for the player: chosen in the Look card, kept with the world (`pets`), and
// alive in the herd (herd.js `setOwned`). Someone whose lore gives them a dog has one without being asked.

const petOwner = (id) => (id === core.personaId ? PLAYER_ID : id);
const dogLore = new Map(); // id → [how much was read, whether it says they've a dog]

/** What's written of `id`: their card, or what was made up for them, and their lore in this world. */
function aboutOf(id) {
  const save = core.save;
  if (!save) return "";
  const local = (save.locals ?? []).find((person) => person.id === id);
  const entry = (core.characters ?? []).find((character) => character.id === id);
  const about = local
    ? [local.description, local.personality, local.appearance].filter(Boolean).join(" ")
    : String(entry?.description ?? "");
  return `${about} ${worldNote(save, `character:${id}`)?.content ?? ""}`;
}

/** `owner`'s animals as they are now: { dog: { kind, coat, out, lore? } | null, horse: { coat, out } | null }. */
function petsFor(owner) {
  const kept = core.pets[owner] ?? {};
  // A dog as it's kept is its size, coat, name and breed; the size says which of the two bodies it has
  // and how big (animals.js dogBody). One kept from before sizes had names has a body and a scale.
  const asDog = (pet) => {
    const size = DOG_SIZES[pet.size] ? pet.size : dogSizeOf(pet.kind, pet.scale);
    const body = dogBody(size);
    return { ...pet, size, ...body, coat: COATS[body.kind][pet.coat] ? pet.coat : Object.keys(COATS[body.kind])[0] };
  };
  let dog = kept.dog && typeof kept.dog === "object" ? asDog(kept.dog) : null;
  // What their entry's keyword gives them ("ww:pet:horse:large:brown:Shadowmere"): the size, the colour
  // where that animal comes in it, the name, the breed.
  const told = (role) => {
    if (kept[role] !== undefined) return null;
    const name =
      owner === PLAYER_ID ? "you" : ((core.characters ?? []).find((person) => person.id === owner)?.name ?? "");
    const pet = (core.save?.petLore ?? []).find(
      (entry) => entry.role === role && entry.owner.toLowerCase() === name.toLowerCase(),
    );
    if (!pet) return null;
    const more = {
      out: true,
      ...(pet.name ? { name: pet.name } : {}),
      ...(pet.species ? { species: pet.species } : {}),
      lore: true,
    };
    if (role === "dog") {
      // (A dog's sizes are its own five; the words for other animals' sizes go to the nearest.)
      const size =
        {
          tiny: "small",
          small: "small",
          big: "large",
          large: "large",
          huge: "huge",
          massive: "massive",
          giant: "massive",
        }[pet.size] ?? "medium";
      const coats = Object.keys(COATS.husky);
      return asDog({
        size,
        coat: coats.includes(pet.colour) ? pet.colour : coats[hashString(`dog:${owner}`) % coats.length],
        ...more,
      });
    }
    const kind = "horse";
    const coat = COATS[kind][pet.colour] ? pet.colour : coatFor(kind, hashString(`${role}:${owner}`));
    return {
      coat,
      out: true,
      scale: ANIMAL_SIZES[pet.size] ?? 1,
      ...(pet.name ? { name: pet.name } : {}),
      ...(pet.species ? { species: pet.species } : {}),
      lore: true,
    };
  };
  dog ??= told("dog");
  // (What's written of someone is read once, till it changes: whether it gives them a dog, a horse.)
  if (owner !== PLAYER_ID && (kept.dog === undefined || kept.horse === undefined)) {
    const text = aboutOf(owner);
    if (dogLore.get(owner)?.[0] !== text.length)
      dogLore.set(owner, [text.length, PACK.dogLore.test(text), PACK.horseLore.test(text)]);
  }
  if (kept.dog === undefined && !dog && owner !== PLAYER_ID) {
    if (dogLore.get(owner)[1]) {
      const n = hashString(`dog:${owner}`);
      const coats = Object.keys(COATS.husky);
      dog = asDog({
        size: ["small", "medium", "large"][n % 3],
        coat: coats[(n >>> 4) % coats.length],
        out: true,
        lore: true,
      });
    }
  }
  let horse = COATS.horse[kept.horse?.coat] ? kept.horse : null;
  horse ??= told("horse");
  if (kept.horse === undefined && !horse && owner !== PLAYER_ID && dogLore.get(owner)[2])
    horse = { coat: coatFor("horse", hashString(`horse:${owner}`)), out: true, lore: true };
  return { dog, horse };
}

/** Puts everyone's animals in the world as they're kept: with their owner, or at their place by their door. */
function syncPets() {
  if (!core.world || !core.save) return;
  const list = [];
  const doorOf = (zone) => {
    const index = zone ? (core.zones?.byId.get(zone)?.door ?? null) : null;
    return index === null ? null : (core.world.doors[index] ?? null);
  };
  // In front of a door and off to one side of it.
  const beside = (door, side, out) => ({
    x: door.x + Math.sin(door.angle) * out + Math.cos(door.angle) * side,
    z: door.z + Math.cos(door.angle) * out - Math.sin(door.angle) * side,
  });
  const plaza = core.world.layout.plaza;
  for (const owner of [PLAYER_ID, ...core.crowd.snapshot().map((person) => person.id)]) {
    const theirs = petsFor(owner);
    // (Not a kind that's switched off, nor, with that setting off, one of a sort set to 0.)
    const dog = theirs.dog && animalAllowed(theirs.dog.kind) ? theirs.dog : null;
    const horse = theirs.horse && animalAllowed("horse") ? theirs.horse : null;
    if (!dog && !horse) continue;
    // Home is their own door; with none, the player's animals keep to the tavern's (its yard is the stable).
    const door = doorOf(core.save.housing?.[owner]?.home) ??
      (owner === PLAYER_ID ? core.world.doors.find((other) => other.kind === "tavern") : null) ?? {
        x: plaza.x,
        z: plaza.z,
        angle: 0,
      };
    if (dog)
      list.push({
        id: `pet:${owner}:dog`,
        kind: dog.kind,
        coat: dog.coat,
        scale: dog.scale ?? 1,
        owner,
        out: dog.out !== false,
        home: beside(door, 1.4, 2),
      });
    if (horse)
      list.push({
        id: `pet:${owner}:horse`,
        kind: "horse",
        coat: horse.coat,
        scale: horse.scale ?? 1,
        owner,
        out: horse.out !== false,
        home: beside(door, -3.6, 2.6),
      });
  }
  core.herd.setOwned(list);
}

/**
 * Puts in the world the animals its lore asks for: what a place's entry says lives there ("ww:monster:
 * wolf:large:pack5" beside "ww:forest1"), and a creature's own entry with where it's found. Only kinds
 * the game has a body for; the rest are the lore's alone for now.
 */
function syncSpawns() {
  if (!core.world || !core.save || !core.zones) return;
  const targets = placeTargets({
    zones: core.zones,
    names: core.save.names ?? {},
    groups: [],
    name: "",
    characters: [],
  });
  // Where a place is: its middle, or nowhere in particular for the country as a whole.
  const where = (place) => {
    if (!place) return null;
    const id = [...(targets.get(plainWord(place)) ?? [])].find((zone) => core.zones.byId.has(zone));
    const shape = core.zones.byId.get(id)?.shape;
    if (shape?.circle) return { x: shape.circle.x, z: shape.circle.z };
    if (shape?.box && core.zones.byId.get(id).kind !== "town")
      return { x: (shape.box.minX + shape.box.maxX) / 2, z: (shape.box.minZ + shape.box.maxZ) / 2 };
    return null;
  };
  const list = [];
  const add = (id, word, size, count, place, temper = "", when = "") => {
    const kind = animalKind(word);
    if (kind && animalAllowed(kind))
      list.push({ id, kind, scale: ANIMAL_SIZES[size] ?? 1, sized: !!size, count, at: where(place), temper, when });
  };
  (core.save.spawns ?? []).forEach((spawn, i) =>
    add(
      `place:${i}:${spawn.place}:${spawn.kind}`,
      spawn.kind,
      spawn.size,
      spawn.count,
      spawn.place,
      spawn.temper,
      spawn.when,
    ),
  );
  // What a creature's own entry says its kind is like here goes for every one of that kind: tame, or
  // hostile (a monster is), and when it's about.
  const tempers = {};
  for (const creature of core.save.creatures ?? []) {
    const kind = animalKind(creature.name);
    if (kind && (creature.tame || creature.hostile)) tempers[kind] = creature.tame ? "tame" : "hostile";
  }
  core.herd.setTempers(tempers);
  for (const creature of core.save.creatures ?? [])
    (creature.found?.length ? creature.found : [null]).forEach((place, i) =>
      add(
        `creature:${creature.entryId}:${i}`,
        creature.name,
        creature.size,
        creature.pack > 1 ? creature.pack : 0,
        place,
        "",
        creature.when === "night" || creature.when === "day" ? creature.when : "",
      ),
    );
  core.herd.setSpawns(list);
}

/** Chooses `id`'s dog or horse (`role`): { kind, coat, out }, or null for none. */
function setPet(id, role, value) {
  if (!core.save || (role !== "dog" && role !== "horse")) return;
  const owner = petOwner(id);
  core.pets = { ...core.pets, [owner]: { ...core.pets[owner], [role]: value } };
  core.save = { ...core.save, pets: core.pets };
  core.saves.write(core.save);
  syncPets();
  partyChanged(); // (the Party tab lists them)
}

/** Calls your dog or horse (`role`) along, or sends it home. */
function petOut(role, out) {
  const pet = petsFor(PLAYER_ID)[role];
  if (!pet) return;
  setPet(core.personaId, role, { ...pet, lore: undefined, out });
  const named = pet.name ? `your ${role}, ${pet.name},` : `your ${role}`;
  narrate(null, out ? `(You call ${named} along.)` : `(You send ${named} home.)`);
}

/** The Party tab's animals: yours, and the dog of anyone travelling with you. */
function partyAnimals() {
  const out = [];
  const coat = (pet) => PACK.coats[pet.coat] ?? pet.coat;
  const mine = petsFor(PLAYER_ID);
  // (By name, when it has one: "Shadowmere, your black horse".)
  const kindOf = (pet, what) =>
    [
      // (A dog's size is its own word; a medium one goes without saying.)
      what === "dog"
        ? pet.size === "medium"
          ? ""
          : pet.size
        : (pet.scale ?? 1) >= 1.2
          ? "large"
          : (pet.scale ?? 1) <= 0.85
            ? "small"
            : "",
      coat(pet),
      pet.species || what,
    ]
      .filter(Boolean)
      .join(" ");
  const called = (pet, what) => (pet.name ? `${pet.name}, your ${kindOf(pet, what)}` : `Your ${kindOf(pet, what)}`);
  if (mine.dog) out.push({ role: "dog", mine: true, out: mine.dog.out !== false, label: called(mine.dog, "dog") });
  if (mine.horse)
    out.push({ role: "horse", mine: true, out: mine.horse.out !== false, label: called(mine.horse, "horse") });
  for (const member of core.crowd.party()) {
    const { dog, horse } = petsFor(member.id);
    if (horse && horse.out !== false)
      out.push({
        role: "horse",
        mine: false,
        out: true,
        label: horse.name
          ? `${horse.name}, ${member.name}'s ${kindOf(horse, "horse")}`
          : `${member.name}'s ${kindOf(horse, "horse")}`,
      });
    if (dog && dog.out !== false)
      out.push({
        role: "dog",
        mine: false,
        out: true,
        label: dog.name
          ? `${dog.name}, ${member.name}'s ${kindOf(dog, "dog")}`
          : `${member.name}'s ${kindOf(dog, "dog")}`,
      });
  }
  return out;
}

/** What the Look card needs of `id`'s animals: what they have, and what there is to choose from. */
function petsOf(id) {
  const owner = petOwner(id);
  return {
    ...petsFor(owner),
    mine: owner === PLAYER_ID,
    dogCoats: Object.keys(COATS.husky).map((coat) => [coat, PACK.coats[coat] ?? coat]),
    dogSizes: Object.keys(DOG_SIZES).map((size) => [size, size[0].toUpperCase() + size.slice(1)]),
    horses: Object.keys(COATS.horse).map((coat) => [coat, PACK.coats[coat] ?? coat]),
  };
}

/** What the Look card needs for `id`: their name, how they look now, and whether a 3D model hides it. */
async function lookOf(id) {
  const persona = id === core.personaId ? core.personas?.find((entry) => entry.id === id) : null;
  const name = persona?.name ?? (core.characters ?? []).find((entry) => entry.id === id)?.name ?? "";
  const chosen = core.looks[id] ?? {};
  // Their card's 3D models, to choose between (or to set aside for the built-in person).
  const models = name ? await modelKinds({ type: persona ? "persona" : "character", id }) : { kinds: [], active: null };
  const hasModel = models.kinds.length > 0 && chosen.avatar !== BUILT_IN;
  try {
    return {
      id,
      name,
      hasModel,
      models,
      chosen,
      pets: core.save ? petsOf(id) : null,
      now: await lookChoices(name, core.bodies[id] ?? "auto", chosen),
    };
  } catch {
    return null; // the kit's people couldn't be loaded
  }
}

function toggleCharacter(id, chosen) {
  if (chosen && core.cast.size < MAX_PEOPLE) core.cast.add(id);
  else core.cast.delete(id);
  updateCast();
  // Someone new in town: their lore (and what it says about them) links up as the world's setup says.
  if (chosen && core.save?.characterLinking !== "none") void linkLore();
}

/** Reads the Engine's personas and characters once, then restores the remembered persona and cast. */
async function loadPeople() {
  if (core.personas) return;
  core.hud?.setLoading("Loading Wanderworld…");
  const [personas, characters, folders] = await Promise.all([listPersonas(), listCharacters(), listCharacterFolders()]);
  core.personas = personas;
  core.engineCharacters = characters;
  core.characters = peopleOf(core.save);
  core.characterFolders = folders;
  try {
    const bodies = JSON.parse(readStored(BODIES_KEY) ?? "{}");
    core.legacyBodies = Object.fromEntries(
      Object.entries(bodies && typeof bodies === "object" ? bodies : {}).filter(
        ([, body]) => body === "male" || body === "female",
      ),
    );
  } catch {
    core.legacyBodies = {}; // a damaged saved copy: everyone is auto
  }
  core.bodies = {}; // until a world is opened
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
  if (core.mount) core.herd.release(core.mount.id);
  core.mount = null;
  core.mounting = null;
  core.dismounting = null;
  core.player.rotation.z = 0;
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

/** How high the underside of a rider's seat is in the riding pose, above where they'd stand (metres):
 *  the hips ride about a hand above the animal's back, so nothing of the rider is inside it. */
const RIDE_SEAT = 0.39;
const RIDE_RADIUS = 0.6; // what a horse and rider take up
const RIDE_WALK = 1.5; // a ridden walk is brisker than the animal's own amble, by this much
const MOUNT_SIDE = 0.8; // getting on: how far out from its middle they stand first (metres)
const MOUNT_STEP = 0.35; // seconds stepping to its side
const MOUNT_VAULT = 0.85; // seconds up and over onto its back
const DISMOUNT = 0.7; // seconds down off it to the ground beside it
const LEAP_PACE = 5.5; // a jump carries the animal forward at least this fast (metres a second)
const LEAP_CLEAR = 0.2; // its back this far up, it's over a fence (metres)

/** What a mount is called: "the grey horse", "the donkey". */
function mountName(mount) {
  if (mount?.id === `pet:${PLAYER_ID}:horse` && core.pets[PLAYER_ID]?.horse?.name)
    return core.pets[PLAYER_ID].horse.name;
  if (mount?.id === `pet:${PLAYER_ID}:dog` && core.pets[PLAYER_ID]?.dog?.name) return core.pets[PLAYER_ID].dog.name;
  const name = PACK.animals[mount?.kind] ?? "the horse";
  const coat = mount?.kind === "horse" ? PACK.coats[mount.coat] : null;
  return coat ? name.replace(/^the /u, `the ${coat} `) : name;
}

/** Gets up on a horse or a donkey (`id`: herd.js): from here on the stick and keys move it. */
function ride(id) {
  if (core.mode !== "walk" || core.interior) return;
  const mount = core.herd.ride(id);
  if (!mount) return;
  core.mount = mount;
  core.mode = "ride";
  core.walkTo = null;
  core.air = null;
  // Getting on: a step to its side (whichever they're nearer), facing the way it faces; then up beside
  // it, a leg over, and down onto its back (the height and the lean are in movePlayer).
  const right = { x: Math.cos(mount.angle), z: -Math.sin(mount.angle) };
  const { x, z } = core.player.position;
  const side = (x - mount.x) * right.x + (z - mount.z) * right.z < 0 ? -1 : 1;
  core.mounting = { phase: "approach", side };
  glideTo(mount.x + right.x * side * MOUNT_SIDE, mount.z + right.z * side * MOUNT_SIDE, mount.angle, MOUNT_STEP, () => {
    if (core.mount !== mount) return;
    core.mounting = { phase: "vault", side };
    glideTo(mount.x, mount.z, mount.angle, MOUNT_VAULT, () => {
      core.mounting = null;
      core.player.rotation.z = 0;
    });
    core.glide.late = 0.38; // up first, then across
  });
  later(
    1.4,
    () =>
      void runMoment({
        action: `gets up on ${mountName(mount)}`,
        needListeners: true,
        source: "seat",
      }),
  );
}

/** Gets down, beside it where there's room; it stays about where it was left. */
function dismount() {
  const mount = core.mount;
  if (!mount || core.air || core.mounting) return; // not in the middle of a jump, or of getting on
  const { x, z } = core.player.position;
  const facing = core.player.rotation.y;
  // To its left, its right, or behind: the first that isn't in something or in the river.
  const spot = [Math.PI / 2, -Math.PI / 2, Math.PI]
    .map((turn) => ({ turn, x: x + Math.sin(facing + turn) * 1.2, z: z + Math.cos(facing + turn) * 1.2 }))
    .find((at) => !core.space.blocked(at.x, at.z, PLAYER_RADIUS) && waterAt(at.x, at.z).depth < WADE_DEPTH) ?? { x, z };
  // Getting down is a movement too: a leg back over, a lean, and down to the ground beside it (the height
  // and the lean are in movePlayer, from how high they sat).
  core.dismounting = {
    height: core.player.position.y - heightAt(x, z),
    side: spot.turn === Math.PI / 2 ? 1 : spot.turn === -Math.PI / 2 ? -1 : 0,
  };
  core.herd.release(mount.id);
  core.mount = null;
  core.mode = "walk";
  glideTo(spot.x, spot.z, facing, DISMOUNT);
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
  // People round about may say something to someone sitting down by them.
  const action = seat.tent
    ? "lies down in the tent to sleep"
    : seat.pose === "lie"
      ? "lies down on the bed"
      : "sits down on a bench";
  later(0.6, () => void runMoment({ action, needListeners: true, source: "seat" }));
}

function standUp() {
  const seat = core.seat;
  if (!seat) return;
  core.mode = "walk";
  core.seat = null;
  if (seat.taken === "player") seat.taken = null;
  // Up off the ground takes a moment (getting up from lying, longer): no walking till they're on their feet.
  if (seat.ground) core.stillUntil = core.clock + (seat.ground === "lie" ? LIE_SECONDS : 0.45);
  else glideTo(seat.approach.x, seat.approach.z, seat.angle, seat.pose === "lie" ? LIE_SECONDS : 0.35);
}

/**
 * Sits down on the ground where the player stands; sitting there already, lies down. A seat like any
 * other (so standing up, the party sitting too and the prompt all work), with `ground` saying which.
 */
function rest() {
  if (core.mode === "sit" && core.seat?.ground === "ground") {
    core.seat.ground = "lie";
    later(1, () => void runMoment({ action: "lies down on the ground", needListeners: true, source: "seat" }));
    return;
  }
  if (core.mode !== "walk" || core.swimming || core.air || core.glide || core.clock < (core.stillUntil ?? 0)) return;
  const { x, z } = core.player.position;
  core.walkTo = null;
  core.seat = { x, z, angle: core.player.rotation.y, approach: { x, z }, ground: "ground", taken: "player" };
  core.mode = "sit";
  later(0.8, () => void runMoment({ action: "sits down on the ground", needListeners: true, source: "seat" }));
}

/** A jump: straight up, or along with however the player is moving. */
const JUMP_SPEED = 4.6; // metres a second, upward
const GRAVITY = 13;
const MOUNT_LEAP = 1.25; // seconds a ridden animal's jump takes: its own leap, start to landing
function jump() {
  // On a horse or a donkey, it jumps: its own leap, carrying on the way it's going, the rider with it.
  if (core.mode === "ride") {
    if (core.mount && !core.air && !core.glide) core.air = { height: 0, time: 0, mount: true };
    return;
  }
  if (core.mode !== "walk" || core.swimming || core.air || core.glide || core.clock < (core.stillUntil ?? 0)) return;
  core.air = { height: 0, speed: JUMP_SPEED };
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
  core.talking = { id: person.id, name: person.name, group, said: 0, asked: [], history: [] };
  glideTo(x, z, Math.atan2(-dx, -dz), 0.5);
  core.hud?.setBusy(true);
  core.hud?.setPrompt(null);
  core.talk.start(nameFor(person.id, person.name), !!(core.settings.aiTalk && core.ai.known()?.talk));
  showKnowing();
  core.talk.setLooks("");
  void looksOf([person.id]).then((looks) => core.talking?.id === person.id && core.talk.setLooks(looks[person.id]));
  core.talk.setInParty(core.crowd.inParty(person.id));
  core.talk.setChoices(
    [{ id: "join", label: joiningOf(person).label }, ...choicesFor([], choiceContext(core.talking))],
    choose,
  );
  later(0.6, () => answer(core.talking, "greet"));
}

/** The person you're talking to joins the party, or leaves it. */
function toggleParty() {
  const talking = core.talking;
  if (!talking) return;
  const joining = !core.crowd.inParty(talking.id);
  core.crowd.setFollowing(talking.id, joining);
  if (joining) learn(talking.id); // nobody travels with a stranger
  if (joining) teach([talking.id]);
  keep(
    [talking.id],
    joining
      ? `Joined ${personaName()} to travel together${placeWords() ? `, at ${placeWords()}` : ""}.`
      : `Parted from ${personaName()} after travelling together${placeWords() ? `, at ${placeWords()}` : ""}.`,
  );
  core.talk.setInParty(joining);
  core.talk.line(
    null,
    joining ? `${talking.name} comes along with you.` : `${talking.name} goes back to their day.`,
    true,
  );
  partyChanged();
}

/**
 * How someone acts toward the player when it's set apart from how they feel (Edit people): the warmth
 * the crowd acts on (npcs.js: cold keeps away, colder comes at you) and the words the AI is told.
 */
const STANCE_WARMTH = { rude: -0.15, afraid: -0.6, avoids: -0.6, aggressive: -1, attacks: -2 };
const STANCE_WORDS = {
  rude: "is rude and short with them",
  aggressive: "is aggressive toward them, quick to square up",
  attacks: "attacks them on sight",
  afraid: "is afraid of them",
  avoids: "avoids them and wants to be elsewhere",
};

/**
 * Whether the player knows someone by name: with Settings → Names on "Show all names" everyone is known;
 * otherwise those they've been told of (`save.known`), anyone either has a relationship with, and
 * anyone travelling with them. A stranger is called "Stranger" over their head and in what's written.
 */
function knows(id) {
  if (core.settings.names === "all" || !core.save) return true;
  return (
    core.save.known.includes(id) ||
    !!core.relations.get(id, "player") ||
    !!core.relations.get("player", id) ||
    core.crowd.inParty(id)
  );
}

/** What someone is called to the player: their name, or "Stranger". */
function nameFor(id, name) {
  return knows(id) ? name : "Stranger";
}

/** The names over heads, as the setting and who's known have it now. */
function refreshNames() {
  core.crowd.setLabels(nameFor);
  core.crowd.setNamesVisible(core.settings.names !== "none");
}

/** The player learns someone's name (it came up, or they said so). */
function learn(id) {
  if (!core.save || knows(id)) return;
  core.save = { ...core.save, known: [...core.save.known, id].slice(-200) };
  core.saves.write(core.save);
  refreshNames();
  const name = (core.characters ?? []).find((person) => person.id === id)?.name;
  if (name) narrate(null, `(You know ${name} by name now.)`);
  if (core.talking?.id === id) showKnowing();
}

/** Learns the names of any of `people` ([{ id, name }]) that `text` gives away by using them. */
function learnFrom(text, people) {
  for (const person of people) {
    const first = person.name.split(/\s+/u)[0];
    if (
      first.length >= 3 &&
      new RegExp(`(^|[^\\p{L}])${first.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}([^\\p{L}]|$)`, "iu").test(text)
    )
      learn(person.id);
  }
}

/** How someone stands toward the player, in words for the AI: how they feel, how they act, and whether they've met. */
function towardPlayer(id, name, names) {
  // What they are to the player; a stance set by hand says how they act whatever they feel.
  const stance = STANCE_WORDS[core.save?.stances?.[id]];
  return [
    core.relations.get(id, "player") ? `${core.relations.describe(id, "player", names)}.` : "",
    stance ? `${name} ${stance}.` : "",
    knows(id) ? "" : `${personaName()} doesn't know ${name}'s name yet: they haven't been introduced.`,
    theyKnow(id) ? "" : `${name} doesn't know ${personaName()}'s name, and must not use it until told.`,
  ]
    .filter(Boolean)
    .join(" ");
}

/** What people look like, from their cards (asked for once each, a few at a time): { [id]: words }. */
async function looksOf(wanted) {
  core.looks ??= new Map();
  const missing = wanted.filter((id) => !core.looks.has(id)).slice(0, 12);
  if (missing.length && core.ai.known()) {
    for (const id of missing) core.looks.set(id, ""); // asked: not again while it's on its way
    try {
      for (const [id, words] of Object.entries(await core.ai.looks(missing))) core.looks.set(id, words);
    } catch {
      for (const id of missing) core.looks.delete(id);
    }
  }
  return Object.fromEntries(wanted.map((id) => [id, core.looks.get(id) ?? ""]));
}

/** The chat window's "People here": whoever's within a few steps (and whoever you're talking to), and what they look like. */
function refreshPeopleHere() {
  if (!core.world || core.interior) return;
  const at = core.player.position;
  const near = core.crowd
    .snapshot()
    .filter((person) => person.state !== "inside" && Math.hypot(person.x - at.x, person.z - at.z) < 10)
    .slice(0, 8);
  const key = near.map((person) => `${person.id}:${knows(person.id)}`).join("|");
  void looksOf(near.map((person) => person.id)).then((looks) => {
    const now = `${key}#${Object.values(looks).join("").length}`;
    if (now === core.peopleHereKey) return;
    core.peopleHereKey = now;
    core.hud?.setPeopleHere(near.map((person) => ({ name: nameFor(person.id, person.name), looks: looks[person.id] })));
  });
}

/**
 * Whether someone knows the player by name: like `knows`, the other way round (`save.knowsMe`, a
 * relationship either way, or travelling together). Someone who doesn't won't use it.
 */
function theyKnow(id) {
  if (core.settings.names === "all" || !core.save) return true;
  return (
    core.save.knowsMe.includes(id) ||
    !!core.relations.get(id, "player") ||
    !!core.relations.get("player", id) ||
    core.crowd.inParty(id)
  );
}

/** They learn the player's name (it was said in their hearing, or the player said so). */
function teach(ids) {
  const fresh = ids.filter((id) => core.save && !theyKnow(id));
  if (!fresh.length) return;
  core.save = { ...core.save, knowsMe: [...core.save.knowsMe, ...fresh].slice(-200) };
  core.saves.write(core.save);
  keep(fresh, `Met ${personaName()} and learned their name${placeWords() ? `, at ${placeWords()}` : ""}.`);
  if (core.talking && fresh.includes(core.talking.id)) showKnowing();
}

/** Teaches `ids` the player's name when `text` (something the player said) gives it. */
function teachFrom(text, ids) {
  const first = personaName().split(/\s+/u)[0];
  if (first.length >= 3 && text.toLowerCase().includes(first.toLowerCase())) teach(ids);
}

/** The conversation's [i] panel: who knows whose name, as it stands. */
function showKnowing() {
  const talking = core.talking;
  if (!talking) return;
  const explicit = core.save?.known.includes(talking.id) || core.save?.knowsMe.includes(talking.id);
  const fixed =
    core.settings.names === "all"
      ? "All names are shown (Menu → Settings → Display), so there are no strangers."
      : !explicit && knows(talking.id) && theyKnow(talking.id)
        ? "You have a history, or travel together: you know each other."
        : "";
  core.talk.setKnowing({
    name: talking.name,
    shown: nameFor(talking.id, talking.name),
    mine: knows(talking.id),
    theirs: theyKnow(talking.id),
    you: personaName(),
    fixed,
  });
}

/** The [i] panel's switches: the player knows their name ("mine"), or they know the player's ("theirs"). */
function setKnowing(which, on) {
  const talking = core.talking;
  if (!talking || !core.save) return;
  const field = which === "mine" ? "known" : "knowsMe";
  const rest = core.save[field].filter((id) => id !== talking.id);
  core.save = { ...core.save, [field]: on ? [...rest, talking.id] : rest };
  core.saves.write(core.save);
  refreshNames();
  showKnowing();
}

/**
 * Someone comes at the player (npcs.js): there's no combat yet, so a card says what's happened and what
 * can be done about it: talk, a moment in the chat, a scene, or no more of it. Not one hard on another.
 */
function confronted(id, name) {
  if (core.mode !== "walk" || core.clock - (core.confrontedAt ?? -60) < 30) return;
  core.confrontedAt = core.clock;
  const shown = nameFor(id, name);
  narrate(null, `${shown} comes at you.`);
  core.hud?.setConfront(
    { name: shown, attacks: core.save?.stances?.[id] === "attacks" },
    {
      onTalk: () => {
        const person = core.crowd.present(core.space).find((entry) => entry.id === id);
        if (person) talkTo(person);
      },
      onSay: () => core.hud?.focusChat(),
      onScene: () => void sceneHere(`${name} comes at me, spoiling for a fight`),
      onStop: () => {
        changeSetting("combat", "off");
        core.hud?.setNotice("Aggressive approaches are off. Menu → Settings → World turns them back on.");
      },
    },
  );
}

/** This world's relationships: the crowd behaves by them and they're saved with the world. */
function useRelations(relations) {
  core.relations = relations;
  core.crowd.setRelations((from, to) => {
    const feeling = relations.feeling(from, to);
    const warmth = to === "player" ? STANCE_WARMTH[core.save?.stances?.[from]] : undefined;
    return warmth === undefined ? feeling : { ...feeling, warmth };
  });
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

/**
 * The Journal's roster: everyone in this world by the groups they're in (each faction, then everyone
 * else), each with a line that stays put (where they live and work, how they see you), and the
 * creatures the lore describes.
 */
function rosterData(names) {
  const save = core.save;
  const cast = (core.characters ?? []).filter((character) => core.cast?.has(character.id));
  const member = (person) => {
    const house = save?.housing?.[person.id];
    const toYou = core.relations.get(person.id, "player");
    return {
      name: person.name,
      facts: [
        person.id.startsWith("local:") ? "of this world" : "",
        house?.home && names[house.home] ? `lives in ${names[house.home]}` : "",
        house?.work && names[house.work] ? `${house.owner ? "owns" : "works at"} ${names[house.work]}` : "",
        toYou ? `${toYou.role || toYou.kind} to you` : "",
      ]
        .filter(Boolean)
        .join(" · "),
    };
  };
  const grouped = new Set();
  const groups = (save?.factions ?? [])
    .map((faction) => {
      const members = cast.filter((person) => faction.members.includes(person.id));
      for (const person of members) grouped.add(person.id);
      return { name: faction.name, members: members.map(member) };
    })
    .filter((group) => group.members.length);
  const rest = cast.filter((person) => !grouped.has(person.id));
  if (rest.length) groups.push({ name: groups.length ? "Everyone else" : "Everyone", members: rest.map(member) });
  const creatures = (save?.creatures ?? []).map((creature) =>
    [
      creature.name,
      creature.hostile ? "hostile" : "",
      creature.found?.length ? `found in ${creature.found.join(", ")}` : "",
      creature.when !== "any" ? `by ${creature.when}` : "",
      creature.pack > 1 ? `in packs of ${creature.pack}` : "",
      `danger ${creature.danger}`,
      creature.drops?.length ? `may drop ${creature.drops.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join(" · "),
  );
  return { groups, creatures };
}

/** Everything the person editor (person.js) shows for `id`: what Wanderworld keeps about them, and the choices there are. */
function personData(id) {
  const person = (core.characters ?? []).find((entry) => entry.id === id);
  if (!person || !core.save) return null;
  const names = namedZones(residentsOf(core.crowd.snapshot()));
  const { homes, workplaces } = housingData(names);
  const house = core.save.housing?.[id] ?? {};
  const local = (core.save.locals ?? []).find((entry) => entry.id === id);
  const day = scheduleOf(id);
  const relations = relationsData();
  return {
    id,
    name: person.name,
    local: !!local,
    card: {
      description: local?.description ?? person.description ?? "",
      personality: local?.personality ?? "",
      appearance: local?.appearance ?? "",
    },
    body: core.bodies[id] ?? "auto",
    voice: core.save.voices?.[id] ?? "",
    voices: VOICES,
    traits: checkTraits(core.save.traits?.[id]),
    traitKinds: relations.traitKinds,
    home: house.home ?? null,
    work: house.work ?? null,
    owner: !!house.owner,
    homes,
    workplaces,
    kinds: relations.kinds,
    known: knows(id),
    knowsYou: theyKnow(id),
    stance: core.save.stances?.[id] ?? "",
    toPlayer: core.relations.get(id, "player") ?? null,
    fromPlayer: core.relations.get("player", id) ?? null,
    memories: core.memories?.list(id) ?? [],
    today: core.social?.day ?? 0,
    memoryLimits: core.save.memoryLimits?.[id] ?? {},
    memoryDefaults: { each: core.settings.memoryEach, kept: core.settings.memoryKept },
    others: (core.characters ?? [])
      .filter((other) => core.cast?.has(other.id) && other.id !== id)
      .map((other) => ({
        id: other.id,
        name: other.name,
        out: core.relations.get(id, other.id) ?? null,
        back: core.relations.get(other.id, id) ?? null,
      })),
    day: { entries: day.entries, by: day.by },
    places: schedulePlaces().map(({ id: placeId, name, slot }) => ({
      id: placeId,
      name: slot ? `${name} (${slot})` : name,
    })),
    canPlan: !!core.ai.known()?.plans,
  };
}

/** Saves what the person editor changed: only what's different from how things stand. */
function savePerson(id, changes) {
  if (!core.save || !(core.characters ?? []).some((entry) => entry.id === id)) return;
  if (changes.local && core.save.locals.some((entry) => entry.id === id)) {
    const locals = core.save.locals.map((entry) =>
      entry.id === id ? { ...entry, ...changes.local, id, name: entry.name } : entry,
    );
    core.save = { ...core.save, locals };
    core.characters = peopleOf(core.save);
  }
  if (changes.voice !== undefined) {
    const voices = { ...core.save.voices };
    if (VOICES.includes(changes.voice)) voices[id] = changes.voice;
    else delete voices[id];
    core.save = { ...core.save, voices };
  }
  if (changes.schedule !== undefined) setSchedule(id, changes.schedule, "you");
  if (changes.stance !== undefined) {
    const stances = { ...core.save.stances };
    if (STANCE_WARMTH[changes.stance] !== undefined) stances[id] = changes.stance;
    else delete stances[id];
    core.save = { ...core.save, stances };
  }
  if (changes.knowsYou !== undefined) {
    const knowsMe = core.save.knowsMe.filter((entry) => entry !== id);
    core.save = { ...core.save, knowsMe: changes.knowsYou ? [...knowsMe, id] : knowsMe };
  }
  if (changes.known !== undefined) {
    const known = core.save.known.filter((entry) => entry !== id);
    core.save = { ...core.save, known: changes.known ? [...known, id] : known };
  }
  if (changes.traits) setTraits(id, changes.traits);
  if (changes.forget) core.memories?.forget(id);
  else {
    // Memories set right by hand: deleted, reworded, pinned (locked) or let go; and one written by hand.
    for (const edit of changes.memoryEdits ?? []) {
      if (edit.remove) {
        core.memories?.remove(id, edit.text, edit.day);
        continue;
      }
      const text =
        (edit.newText && edit.newText !== edit.text && core.memories?.edit(id, edit.text, edit.day, edit.newText)) ||
        edit.text;
      if (typeof edit.pinned === "boolean") core.memories?.pin(id, text, edit.day, edit.pinned);
    }
    if (changes.memory) core.memories?.note(id, changes.memory, core.social?.day ?? 0);
  }
  // How many memories they keep, when it isn't the setting's number (null: the setting's again).
  if (changes.memoryLimits) {
    const own = Object.fromEntries(Object.entries(changes.memoryLimits).filter(([, value]) => Number.isFinite(value)));
    const all = { ...(core.save.memoryLimits ?? {}) };
    if (Object.keys(own).length) all[id] = own;
    else delete all[id];
    core.save = { ...core.save, memoryLimits: all };
  }
  if (changes.housing) setHousingByHand(id, changes.housing);
  const same = (a, b) =>
    (a?.kind ?? "") === (b?.kind ?? "") &&
    (!a ||
      !b ||
      (a.level === b.level &&
        (a.role ?? "") === (b.role ?? "") &&
        !!a.locked === !!b.locked &&
        (a.attraction ?? null) === (b.attraction ?? null) &&
        !!a.attractionLocked === !!b.attractionLocked));
  for (const { from, to, fields } of changes.relations ?? []) {
    const now = core.relations.get(from, to) ?? null;
    if (!same(now, fields)) setRelation(from, to, fields ? { ...now, ...fields } : null, false);
  }
  if (changes.body !== undefined && (core.bodies[id] ?? "auto") !== changes.body) setBody(id, changes.body);
  core.saves.write(core.save);
  core.placesChanged = true;
  core.relationsChanged = true;
  core.journalAt = 0;
  refreshNames();
  core.hud?.setNotice(`Saved.`);
}

// ── The AI assistant (Settings → AI assistant; assistant.js, server.mjs `/assistant`) ──────────

/**
 * One turn with the assistant. Only the parts of the world the message needs go with the chat
 * (assistant-context.js): a ready-made request names its own, anything typed is read for what it's
 * about, and the model may ask once for a part that was left out. What it wants to change comes back as a
 * proposal (nothing is changed yet): { reply, problem, proposed: [{ line, before, after, edit, kind,
 * fields }], skipped: [text], sent: [what went with it], apply(revised) → { changes, skipped, undo() } }.
 * `apply` (null with nothing to do) is the player's Confirm, and the `undo` it returns takes those
 * changes back (and nothing changed since by hand). `options`: { pick, book, entries }.
 */
async function askAssistant(history, options = {}) {
  const save = core.save;
  if (!save || !core.zones) throw new Error("Open a world first: the assistant works on the world you're in.");
  if (!(await core.ai.status())?.assistant)
    throw new Error("Wanderworld's server part isn't running (or is an older one): restart the Engine.");
  const pick = PICKS.find((entry) => entry.id === options.pick) ?? null;
  const names = namedZones(residentsOf(core.crowd.snapshot()));
  const slots = slotsOf(core.zones);
  const slotOf = new Map([...slots].map(([slot, id]) => [id, slot]));
  const placeWords = (id) => (id ? [names[id], slotOf.get(id) && `(${slotOf.get(id)})`].filter(Boolean).join(" ") : "");
  const ids = nameIds();
  const span = (entry) => `${hourText(entry.from)}-${hourText(entry.to)}`;
  const cast = (core.characters ?? []).filter((person) => core.cast?.has(person.id)).slice(0, 40);
  const groups = placeGroups();
  const groupLines = groups.map(
    (group) =>
      `${group.name}: ${group.members
        .map((id) => slotOf.get(id) ?? names[id] ?? "")
        .filter(Boolean)
        .join(", ")}`,
  );
  const factionLines = (save.factions ?? []).map(
    (faction) =>
      `${faction.name}: ${faction.members
        .map((id) => ids[id])
        .filter(Boolean)
        .join(", ")}`,
  );
  const placeList = [...slots]
    .map(([slot, id]) => ({
      slot,
      name: `${names[id] ?? ""}${save.hours?.[id] ? ` (closed ${span(save.hours[id])})` : ""}`,
    }))
    .slice(0, 160);
  const base = {
    connectionId: core.settings.textConnection || null,
    worldName: save.name,
    setting: save.setting,
    persona: personaName(),
  };

  // A keyword draft: the chosen lorebook entries and nothing else of the lorebooks.
  if (pick?.picker === "keywords") {
    const book = (await readLorebooks()).find((entry) => entry.id === options.book);
    const chosen = new Set(Array.isArray(options.entries) ? options.entries : []);
    const bookEntries = (book?.entries ?? [])
      .filter((entry) => chosen.has(entry.id))
      .slice(0, 20)
      .map((entry) => ({
        title: entry.title,
        keys: [...(entry.own ?? []), ...(entry.triggers ?? [])].join(", "),
        content: entry.content,
      }));
    if (!bookEntries.length) throw new Error("Choose a lorebook and at least one of its entries first.");
    const draft = await core.ai.assistant({
      ...base,
      task: "keywords",
      keywordPrompt: KEYWORD_PROMPT,
      bookEntries,
      people: cast.map((person) => ({ name: person.name })),
      places: placeList,
      groups: groupLines,
      factions: factionLines,
    });
    return {
      reply: draft?.reply ?? "",
      problem: "",
      proposed: [],
      skipped: [],
      apply: null,
      copy: true,
      sent: [
        `${bookEntries.length} ${bookEntries.length === 1 ? "entry" : "entries"} of "${book.name}"`,
        "the keyword guide",
        "people's names",
        "the places",
      ],
    };
  }

  // What the player's last messages are about, and who and where they name.
  const said = history.filter((turn) => turn.role === "user").map((turn) => turn.text);
  const lastReply = [...history].reverse().find((turn) => turn.role === "assistant")?.text ?? "";
  const named = new Set(
    mentioned(
      cast.map((person) => person.name),
      [...said.slice(-2), lastReply],
    ),
  );
  const namedPlaces = new Set(mentioned([...new Set(Object.values(names))], said.slice(-2)));
  // Where the player is, and the lore active there with what each entry comes from.
  const at = core.interior ? core.interior.door : core.player.position;
  const here = activeLore(zoneAt(core.zones, at.x, at.z), names);
  const tieLabel = (key) =>
    key === WORLD_ID
      ? "the whole world"
      : key === PLAYER_ID
        ? "the player"
        : key.startsWith("character:")
          ? (ids[key.slice("character:".length)] ?? "")
          : (groups.find((group) => group.id === key)?.name ?? placeWords(key));
  const noteIds = save.notices.map((note) => note.id); // the board as the model is shown it: note1, note2…
  // Whose memories go, when memories do: whoever was ticked (a ready-made request), else whoever the
  // message names, else whoever was asked about last, else everyone. Each memory has a number, m1 the
  // oldest, that an edit names it by; with many people only the newest of each go (600 in all).
  const forMemories = pick?.picker === "memories";
  if (forMemories) core.assistantMemoryOf = Array.isArray(options.memoryOf) ? options.memoryOf : null;
  const chosenMemories = forMemories
    ? core.assistantMemoryOf
    : named.size
      ? cast.filter((person) => named.has(person.name)).map((person) => person.id)
      : (core.assistantMemoryOf ?? null);
  const today = core.social?.day ?? 0;
  const memoryIds = {};
  const remembering = cast
    .filter((person) => !chosenMemories || chosenMemories.includes(person.id))
    .map((person) => ({ person, all: (core.memories?.list(person.id) ?? []).reverse() }))
    .filter(({ all }) => all.length);
  const memoryMost = Math.max(15, Math.min(150, Math.floor(600 / Math.max(1, remembering.length))));
  const memoryLines = remembering.map(({ person, all }) => {
    memoryIds[person.id] = all.map(({ day, text }) => ({ day, text }));
    return {
      name: person.name,
      lines: all
        .map(
          (memory, at) =>
            `m${at + 1} (${ago(memory.day, today)}${memory.pinned ? ", pinned" : memory.kept ? ", lasting" : ""}) ${memory.text}`,
        )
        .slice(-memoryMost),
    };
  });
  if (forMemories && !memoryLines.length) throw new Error("Nobody chosen remembers anything yet.");
  const scenes = (save.events ?? []).filter((event) => event.kind === "scene" && event.summary);

  /** The request with these parts of the world (a Set of assistant-context.js PARTS) and no others. */
  const build = (needs, final) => {
    const person = (entry) => {
      const local = save.locals.find((other) => other.id === entry.id);
      const house = save.housing?.[entry.id] ?? {};
      const day = save.schedules?.[entry.id]?.entries ?? [];
      const traits = save.traits?.[entry.id];
      // In full for whoever the message names; shorter for everyone when it's about everyone; else a line.
      const full = named.has(entry.name);
      const some = full || needs.has("people");
      const about = local
        ? [local.description, local.personality, local.appearance].filter(Boolean).join(" ")
        : String(entry.description ?? "");
      const lore = worldNote(save, `character:${entry.id}`)?.content ?? "";
      return {
        name: entry.name,
        invented: !!local,
        about: full ? about.slice(0, 3000) : some ? about.slice(0, 320) : "",
        home: placeWords(house.home),
        work: placeWords(house.work),
        owner: !!house.owner,
        relations:
          some || needs.has("relations")
            ? core.relations.all
                .filter((record) => record.from === entry.id && ids[record.to])
                .map((record) => `${record.kind}${record.role ? ` (${record.role})` : ""} of ${ids[record.to]}`)
            : [],
        lore: full ? lore : some ? lore.slice(0, 320) : "",
        more: [
          !isHere(entry) && "not in this region now",
          some && core.bodies[entry.id] && `body ${core.bodies[entry.id]}`,
          some && save.voices?.[entry.id] && `voice ${save.voices[entry.id]}`,
          some && traits && `aggression ${traits.aggression}, sociability ${traits.sociability}`,
          some && save.stances?.[entry.id] && `stance ${save.stances[entry.id]}`,
          some && save.knowsMe.includes(entry.id) && "knows the player's name",
          (full || needs.has("days")) &&
            day.length &&
            `day: ${day.map((part) => `${span(part)} ${part.activity}${part.place ? ` ${slotOf.get(part.place) ?? ""}` : ""}`).join(", ")}`,
        ]
          .filter(Boolean)
          .join("; "),
      };
    };
    // This world's lore: all of it when asked for, else what's written about the places the message names.
    const placeNotes = Object.entries(names)
      .filter(([, name]) => namedPlaces.has(name))
      .map(([id]) => worldNote(save, id))
      .filter(Boolean);
    const entries = needs.has("lore") ? save.book.entries : placeNotes;
    const withPlaces = needs.has("places") || needs.has("days") || namedPlaces.size > 0;
    return {
      ...base,
      ages: needs.has("ages") ? (save.ages ?? null) : null,
      history,
      people: cast.map(person),
      places: withPlaces ? placeList : [],
      groups: groupLines,
      factions: factionLines,
      here: needs.has("here")
        ? [
            `At: ${placeWords(zoneAt(core.zones, at.x, at.z).id) || here.place}, ${clockText()}.`,
            here.entries.length
              ? `Lore active here:\n${here.entries.map((entry) => `- ${entry.title} (from ${entry.from})`).join("\n")}`
              : "No lore is active here.",
          ].join("\n")
        : "",
      ties: needs.has("ties")
        ? Object.entries(save.lore)
            .map(([key, tied]) => [tieLabel(key), tied.map((tie) => tie.title).filter(Boolean)])
            .filter(([label, titles]) => label && titles.length)
            .map(([label, titles]) => `${label}: ${titles.join("; ")}`)
            .slice(0, 120)
        : [],
      board: needs.has("board")
        ? [
            save.errand ? `The player's errand now: ${save.errand.text}` : "The player has no errand.",
            ...save.notices.map(
              (note, index) => `note${index + 1}: ${note.text}${note.by ? ` (from ${note.by})` : ""}`,
            ),
          ].join("\n")
        : "",
      entries: entries.map((entry) => ({ title: entry.title, content: entry.content })),
      memories: needs.has("memories") ? memoryLines : [],
      chat: needs.has("chat")
        ? core.momentLog
            .slice(-20)
            .map((line) => `${line.who}: ${String(line.text).slice(0, 300)}`)
            .join("\n")
        : "",
      // The newest recap whole (it may be turned into changes), the two before it shorter.
      recaps: needs.has("recaps")
        ? scenes
            .slice(-3)
            .map((event, index, all) => {
              const words = index === all.length - 1 ? event.summary : event.summary.slice(0, 1200);
              return `${event.place ? `At ${event.place}: ` : ""}${words}`;
            })
            .join("\n\n")
        : "",
      help: needs.has("help")
        ? HELP.filter((part) => Array.isArray(part.lines))
            .map((part) => `${part.title}: ${part.lines.join(" ")}`)
            .join("\n")
            .slice(0, 9000)
        : "",
      omitted: Object.keys(PARTS).filter((part) => !needs.has(part)),
      final,
    };
  };

  let needs = assistantNeeds(said, pick);
  let answer = await core.ai.assistant(build(needs, false));
  // It asked for a part that was left out: once more, with it, and that's the last asking.
  if (answer?.need?.length) {
    needs = new Set([...needs, ...answer.need]);
    answer = await core.ai.assistant(build(needs, true));
  }
  if (core.save?.id !== save.id) throw new Error("Another world was opened meanwhile, so nothing was changed.");
  const edits = answer?.edits ?? [];
  const context = { noteIds, memoryIds };
  const proposal = applyAssistantEdits(edits, true, context);
  const inFull = cast.filter((person) => named.has(person.name)).map((person) => person.name);
  return {
    reply: answer?.reply ?? "",
    problem: answer?.problem ?? "",
    proposed: proposal.changes,
    skipped: proposal.skipped,
    sent: [
      "everyone's name, home and work",
      inFull.length ? `${inFull.join(", ")} in full` : "",
      ...Object.keys(PARTS)
        .filter((part) => needs.has(part))
        .map((part) => PARTS[part]),
    ].filter(Boolean),
    apply: proposal.changes.length
      ? (revised = null) => {
          if (core.save?.id !== save.id) throw new Error("Another world is open now, so nothing was changed.");
          // The proposal as the player left it: text they rewrote, choices they changed, changes left out.
          const chosen = revised ? reviseEdits(edits, revised) : { edits, skipped: [] };
          const before = assistantSnapshot();
          try {
            const done = applyAssistantEdits(chosen.edits, false, context);
            const after = assistantSnapshot();
            return {
              changes: done.changes,
              skipped: [...chosen.skipped, ...done.skipped],
              undo: done.changes.length ? () => undoAssistant(before, after) : null,
            };
          } catch (error) {
            // Something gave way part of the way through: back to how it was, so it's all or nothing.
            console.warn("[wanderworld] the assistant's changes failed", error);
            undoAssistant(before);
            throw new Error(
              `something went wrong part-way (${error?.message ?? error}), so the world was put back as it was`,
              { cause: error },
            );
          }
        }
      : null,
  };
}

/** Whether someone is in the region the player is in: at home everyone but people of other regions; away, the party and that region's own people. */
function isHere(person) {
  const save = core.save;
  if (!save) return true;
  if ((save.party ?? []).includes(person.id)) return true;
  const lives = save.locals.find((entry) => entry.id === person.id)?.region ?? HOME_REGION;
  return lives === save.region;
}

/** This world's own lore about `target` (a zone id, "character:<id>", the world): its entry in the save's book. */
function worldNote(save, target) {
  // A faction's lore is tied to each member too, and isn't the member's own.
  const shared = new Set(
    (save.factions ?? []).filter((faction) => faction.lorebookId === "world").map((faction) => faction.entryId),
  );
  const tied = new Set(
    (save.lore[target] ?? [])
      .filter((tie) => tie.lorebookId === "world" && !shared.has(tie.entryId))
      .map((tie) => tie.entryId),
  );
  return save.book.entries.find((entry) => tied.has(entry.id)) ?? null;
}

/** Everything of a world the assistant's edits can touch (and nothing play changes on its own account). */
const ASSISTANT_FIELDS = [
  "relationships",
  "housing",
  "book",
  "lore",
  "locals",
  "cast",
  "schedules",
  "names",
  "hours",
  "bodies",
  "voices",
  "traits",
  "stances",
  "knowsMe",
  "known",
  "groups",
  "factions",
  "setting",
  "look",
  "ages",
  "notices",
  "errand",
  "waypoint",
  "memories",
];

/** The world as it is before the assistant changes it: a copy of those fields, for Undo. */
function assistantSnapshot() {
  savePlace(true); // the cast as it is now
  const fields = Object.fromEntries(ASSISTANT_FIELDS.map((key) => [key, core.save[key]]));
  fields.relationships = core.relations.all;
  fields.memories = core.memories?.state ?? {};
  return { id: core.save.id, fields: JSON.parse(JSON.stringify(fields)) };
}

/**
 * Undo: the world's fields back as `before` (assistantSnapshot) had them, and everything that's kept from
 * them brought back in line (who's here, their homes, days and names, how they stand, the signs). Where
 * the player is, the time and the chat are left alone. With `after` (the world as the assistant's changes
 * left it) only those changes go back: whatever has changed since by hand or through play stays (undo.js).
 */
function undoAssistant(before, after = null) {
  if (!core.save || core.save.id !== before.id) throw new Error("Another world is open now, so nothing was undone.");
  if (after) {
    // An errand, a map mark, someone's day and a place's hours are each one thing: taken back whole or left.
    const whole = (path) =>
      (path.length === 1 && (path[0] === "errand" || path[0] === "waypoint")) ||
      (path.length === 2 && (path[0] === "schedules" || path[0] === "hours"));
    const fields = withoutLeftovers(undoOnly(before.fields, after.fields, assistantSnapshot().fields, whole));
    before = { id: before.id, fields };
  }
  for (const member of core.crowd.party())
    if (!before.fields.cast.includes(member.id)) core.crowd.setFollowing(member.id, false);
  core.save = { ...core.save, ...JSON.parse(JSON.stringify(before.fields)) };
  core.bodies = { ...core.save.bodies };
  useRelations(createRelationships(core.save.relationships));
  // (Memories in the order they happened, so one that's brought back is where it was.)
  core.memories = createMemories(
    Object.fromEntries(
      Object.entries(core.save.memories ?? {}).map(([id, list]) => [id, [...list].sort((a, b) => a.day - b.day)]),
    ),
    memoryLimits,
  );
  core.characters = peopleOf(core.save);
  const here = new Set(core.characters.map((character) => character.id));
  core.cast = new Set(core.save.cast.filter((id) => here.has(id)).slice(0, MAX_PEOPLE));
  updateCast(); // the townsfolk, their days and names; saves
  if (core.talking && !core.cast.has(core.talking.id)) endTalk();
  useHousing();
  const names = placeNames();
  for (const sign of core.signs ?? []) sign.setWords(signOf(sign.zone, names));
  core.placesChanged = true;
  core.relationsChanged = true;
  core.journalAt = 0;
  core.zoneCheck = 0;
  partyChanged();
}

/**
 * The assistant's edits (already checked for shape by the server) against this world, each on its own:
 * one that names nobody here, or a place that isn't one, is left out and said. With `dry` nothing is
 * changed: it's the proposal the player reads before Confirm, made by the same steps. Every change goes
 * through what the Journal uses (setRelation, setHousingByHand, savePerson, setSchedule, renameZone…), so
 * it's checked the same way. Returns { changes: [{ line, before, after, edit, fields }], skipped: [text] };
 * `before` and `after` are the old and new text of a rewrite, `edit` the index of the edit it came from,
 * and `fields` (dry only, on an edit's first change) the parts the player may rewrite before Confirm.
 */
function applyAssistantEdits(edits, dry, context = {}) {
  const changes = [];
  const skipped = [];
  if (!core.save || !core.zones) return { changes, skipped };
  const names = namedZones(residentsOf(core.crowd.snapshot()));
  const slots = slotsOf(core.zones);
  const slotOf = new Map([...slots].map(([slot, id]) => [id, slot]));
  const same = (a, b) => a.toLowerCase().trim() === b.toLowerCase().trim();
  const bare = (words) => words.toLowerCase().trim().replace(/^the /u, "");
  // Everything as these edits leave it, so a later edit sees what an earlier one did (someone just added,
  // the home an edit before gave Sarah), in a proposal as much as for real.
  const ids = { ...nameIds() };
  const housing = { ...core.save.housing };
  let book = core.save.book.entries;
  let lore = core.save.lore;
  let locals = core.save.locals;
  let factions = core.save.factions ?? [];
  let castChanged = false;
  let hasErrand = !!core.save.errand;
  let scene = null; // a scene to start once everything else is done
  const unpinned = new Set(); // notes these edits take down
  const touched = new Set(); // memories these edits reword or delete
  const pins = {}; // and how many more each person has pinned by them
  // A faction's own lore (written here) is tied to every member; it isn't any one member's.
  const factionNote = (id) => factions.some((faction) => faction.lorebookId === "world" && faction.entryId === id);
  /** Ties (or unties) a faction's lore to these people. */
  const tieFaction = (faction, people, on) => {
    if (!faction.entryId) return;
    for (const id of people) {
      const key = `character:${id}`;
      const rest = (lore[key] ?? []).filter(
        (tie) => !(tie.lorebookId === faction.lorebookId && tie.entryId === faction.entryId),
      );
      const next = on
        ? [...rest, { lorebookId: faction.lorebookId, entryId: faction.entryId, title: faction.name }]
        : rest;
      lore = Object.fromEntries(Object.entries({ ...lore, [key]: next }).filter(([, ties]) => ties.length));
    }
  };
  // The places someone can live in or work at, to choose from in the proposal.
  const lists = () => ({
    homes: homes.map((entry) => ({
      value: slotOf.get(entry.id) ?? names[entry.id] ?? entry.id,
      label: placeLabel(entry.id),
    })),
    works: workplaces.map((entry) => ({
      value: slotOf.get(entry.id) ?? names[entry.id] ?? entry.id,
      label: placeLabel(entry.id),
    })),
    voices: VOICES,
  });
  const findPerson = (name, orPlayer = false) => {
    if (orPlayer && ["player", "you", "the player"].includes(name.toLowerCase()))
      return { id: "player", name: ids.player };
    const all = Object.entries(ids)
      .filter(([id]) => orPlayer || id !== "player")
      .map(([id, known]) => ({ id, name: known }));
    const exact = all.filter((entry) => same(entry.name, name));
    if (exact.length === 1) return exact[0];
    const first = all.filter((entry) => same(entry.name.split(/\s+/u)[0], name));
    return first.length === 1 ? first[0] : null;
  };
  const findPlace = (words) => {
    const slot = /\(?\b([a-z]+\d+)\)?\s*$/iu.exec(words)?.[1]?.toLowerCase();
    if (slot && slots.has(slot)) return slots.get(slot);
    const named = Object.entries(names).filter(([, known]) => bare(known) === bare(words));
    return named.length === 1 ? named[0][0] : null;
  };
  const placeLabel = (id, fallback = "") => `${names[id] ?? fallback}${slotOf.get(id) ? ` (${slotOf.get(id)})` : ""}`;
  const nobody = (name) => `Nobody called "${name}" is in this world.`;
  const noPlace = (words) => `"${words}" isn't a place in this world.`;
  const { homes, workplaces } = housingData(names);
  const span = (from, to) => `${hourText(from)} to ${hourText(to)}`;
  /** Where `person` lives or works after this: the place's id, null for none, or undefined (said why in `skipped`). */
  const houseFor = (what, person, { place, beside, owner }) => {
    let found = null;
    if (beside) {
      const other = findPerson(beside);
      found = other ? (housing[other.id]?.home ?? null) : null;
      if (!found) {
        skipped.push(
          other
            ? `${other.name} has no home set, so ${person.name} can't move in with them. Give ${other.name} a home first.`
            : nobody(beside),
        );
        return undefined;
      }
    } else if (bare(place) !== "none") {
      found = findPlace(place);
      if (!(what === "home" ? homes : workplaces).some((entry) => entry.id === found)) {
        skipped.push(`"${place}" isn't a place someone can ${what === "home" ? "live in" : "work at"} here.`);
        return undefined;
      }
    }
    const now = housing[person.id] ?? {};
    housing[person.id] =
      what === "home"
        ? { home: found, work: now.work ?? null, owner: !!now.owner }
        : { home: now.home ?? null, work: found, owner };
    if (!dry) setHousingByHand(person.id, housing[person.id]);
    changes.push({
      line: found
        ? `${person.name} ${what === "home" ? "lives at" : owner ? "owns" : "works at"} ${placeLabel(found, place)}.`
        : `${person.name} has no ${what === "home" ? "home" : "work"} set.`,
    });
    return found;
  };
  const starts = []; // where each edit's changes begin
  for (const item of edits) {
    starts.push(changes.length);
    if (item.do === "relate") {
      const [from, to] = [findPerson(item.from, true), findPerson(item.to, true)];
      if (!from || !to || from.id === to.id) {
        skipped.push(
          !from ? nobody(item.from) : !to ? nobody(item.to) : `${from.name} can't be something to themself.`,
        );
        continue;
      }
      const set = (a, b, role) => {
        const now = core.relations.get(a.id, b.id);
        const level = item.level ?? (now?.kind === item.kind ? now.level : 70);
        if (!dry) setRelation(a.id, b.id, item.kind === "none" ? null : { kind: item.kind, role, level }, false);
        changes.push({
          level,
          line:
            item.kind === "none"
              ? `${a.name} has nothing set toward ${b.name} any more.`
              : `${a.name} toward ${b.name}: ${KINDS[item.kind]?.label ?? item.kind}${role ? `, as ${b.name}'s ${role}` : ""} (${level} of 100).`,
        });
      };
      set(from, to, item.role);
      if (item.both) set(to, from, item.backRole);
    } else if (item.do === "home" || item.do === "work") {
      const person = findPerson(item.person);
      if (!person) skipped.push(nobody(item.person));
      else houseFor(item.do, person, { place: item.place, beside: item.with, owner: item.owner });
    } else if (item.do === "set") {
      const person = findPerson(item.person);
      if (!person) {
        skipped.push(nobody(item.person));
        continue;
      }
      const traits =
        item.aggression !== undefined || item.sociability !== undefined
          ? checkTraits({
              ...core.save.traits?.[person.id],
              ...(item.aggression !== undefined ? { aggression: item.aggression } : {}),
              ...(item.sociability !== undefined ? { sociability: item.sociability } : {}),
            })
          : undefined;
      const said = [
        item.body !== undefined && `body ${item.body}`,
        item.voice !== undefined && `voice ${item.voice || "their own"}`,
        item.aggression !== undefined && `temperament ${item.aggression} of 100 (passive to aggressive)`,
        item.sociability !== undefined && `manner ${item.sociability} of 100 (shy to outgoing)`,
        item.stance !== undefined &&
          (item.stance ? `acts ${item.stance} toward you` : "no set way of acting toward you"),
        item.knowsYou !== undefined && (item.knowsYou ? "knows your name" : "doesn't know your name"),
        item.known !== undefined && (item.known ? "you know their name" : "you don't know their name"),
      ].filter(Boolean);
      if (!dry)
        savePerson(person.id, {
          body: item.body,
          voice: item.voice,
          stance: item.stance,
          knowsYou: item.knowsYou,
          known: item.known,
          traits,
        });
      changes.push({ line: `${person.name}: ${said.join("; ")}.` });
    } else if (item.do === "day") {
      const person = findPerson(item.person);
      if (!person) {
        skipped.push(nobody(item.person));
        continue;
      }
      const allowed = new Set(schedulePlaces().map((place) => place.id));
      const entries = [];
      for (const raw of item.entries) {
        const place = raw.place ? findPlace(raw.place) : "";
        if (raw.place && !allowed.has(place)) {
          skipped.push(`"${raw.place}" isn't somewhere ${person.name} can spend ${span(raw.from, raw.to)}.`);
          continue;
        }
        const entry = checkEntry({ ...raw, place: place ?? "" });
        if (entry) entries.push(entry);
      }
      if (item.entries.length && !entries.length) continue;
      if (!dry) setSchedule(person.id, entries.length ? entries : null, "ai");
      changes.push({
        line: entries.length
          ? `${person.name}'s day: ${entries.map((entry) => `${span(entry.from, entry.to)} ${ACTIVITY_WORDS[entry.activity]}${entry.place ? ` (${placeLabel(entry.place)})` : ""}`).join("; ")}.`
          : `${person.name} goes back to a usual day.`,
      });
    } else if (item.do === "add_person") {
      if (findPerson(item.name) || Object.values(ids).some((known) => same(known, item.name))) {
        skipped.push(`There's already someone called ${item.name} here.`);
        continue;
      }
      if (Object.keys(ids).length - 1 >= MAX_PEOPLE || locals.length >= 30) {
        skipped.push(`This world is full (${MAX_PEOPLE} people), so ${item.name} can't be added.`);
        continue;
      }
      const person = { id: `local:a-${Date.now().toString(36)}-${locals.length}`, name: item.name };
      ids[person.id] = person.name;
      locals = [
        ...locals,
        {
          ...person,
          description: item.description,
          personality: item.personality,
          appearance: item.appearance,
          // Added away from home, they live in that region (and are seen there, not at home).
          ...(core.save.region !== HOME_REGION ? { region: core.save.region } : {}),
        },
      ];
      if (!dry) {
        core.save = { ...core.save, locals };
        core.characters = peopleOf(core.save);
        core.cast.add(person.id);
        if (item.body) core.bodies[person.id] = item.body;
        core.save = { ...core.save, bodies: { ...core.bodies } };
        castChanged = true;
      }
      changes.push({
        line: `Add ${person.name}${item.body ? ` (${item.body})` : ""}, who lives in this world only.`,
        after: [item.description, item.personality, item.appearance].filter(Boolean).join("\n\n"),
      });
      if (item.home || item.with) houseFor("home", person, { place: item.home, beside: item.with, owner: false });
      if (item.work) houseFor("work", person, { place: item.work, beside: "", owner: item.owner });
    } else if (item.do === "remove_person") {
      const person = findPerson(item.person);
      const local = person && locals.find((entry) => entry.id === person.id);
      if (!local) {
        skipped.push(
          person
            ? `${person.name} is one of your own characters. Take them out of this world in Journal → People; their card stays yours.`
            : nobody(item.person),
        );
        continue;
      }
      const id = person.id;
      delete ids[id];
      delete housing[id];
      locals = locals.filter((entry) => entry.id !== id);
      const tied = new Set(
        (lore[`character:${id}`] ?? [])
          .filter((tie) => tie.lorebookId === "world" && !factionNote(tie.entryId))
          .map((tie) => tie.entryId),
      );
      book = book.filter((entry) => !tied.has(entry.id));
      lore = Object.fromEntries(Object.entries(lore).filter(([key]) => key !== `character:${id}`));
      factions = factions.map((faction) => ({
        ...faction,
        members: faction.members.filter((member) => member !== id),
      }));
      if (!dry) {
        if (core.crowd.inParty(id)) core.crowd.setFollowing(id, false);
        for (const record of core.relations.all.filter((entry) => entry.from === id || entry.to === id))
          setRelation(record.from, record.to, null, false);
        core.cast.delete(id);
        delete core.bodies[id];
        const without = (map) => Object.fromEntries(Object.entries(map ?? {}).filter(([key]) => key !== id));
        const loreKeys = Object.fromEntries(
          Object.entries(core.save.loreKeys ?? {}).filter(([key]) => key !== `cards/${id}`),
        );
        core.save = {
          ...core.save,
          locals,
          housing: without(core.save.housing),
          schedules: without(core.save.schedules),
          traits: without(core.save.traits),
          voices: without(core.save.voices),
          stances: without(core.save.stances),
          bodies: { ...core.bodies },
          known: core.save.known.filter((entry) => entry !== id),
          knowsMe: core.save.knowsMe.filter((entry) => entry !== id),
          errand: core.save.errand?.person === id ? null : core.save.errand,
          loreKeys,
        };
        core.characters = peopleOf(core.save);
        castChanged = true;
      }
      changes.push({
        line: `Remove ${person.name} from this world, with their home, work, day, relationships and lore.`,
        before: [local.description, local.personality, local.appearance].filter(Boolean).join("\n\n"),
        after: "(Gone. Undo brings them back.)",
      });
    } else if (item.do === "faction") {
      const old = factions.find((faction) => same(faction.name, item.name));
      if (item.delete) {
        if (!old) skipped.push(`There's no faction called "${item.name}".`);
        else {
          tieFaction(old, old.members, false);
          if (old.lorebookId === "world") book = book.filter((entry) => entry.id !== old.entryId);
          factions = factions.filter((faction) => faction !== old);
          changes.push({ line: `End the faction ${old.name}.` });
        }
        continue;
      }
      const resolve = (list) =>
        list
          .map((name) => findPerson(name) ?? (skipped.push(nobody(name)), null))
          .filter(Boolean)
          .map((person) => person.id);
      const [add, remove] = [resolve(item.add), resolve(item.remove)];
      if (!old && !add.length) {
        skipped.push(`The faction "${item.name}" would have nobody in it, so it wasn't made.`);
        continue;
      }
      if (!old && factions.length >= 40) {
        skipped.push("This world has as many factions as it can hold (40).");
        continue;
      }
      const members = [...new Set([...(old?.members ?? []), ...add])].filter((id) => !remove.includes(id)).slice(0, 40);
      const made = old
        ? { ...old, members }
        : {
            id: `faction:a-${Date.now().toString(36)}${factions.length}`,
            name: item.name,
            lorebookId: "",
            entryId: "",
            members,
          };
      factions = old ? factions.map((faction) => (faction === old ? made : faction)) : [...factions, made];
      if (old) {
        tieFaction(
          made,
          old.members.filter((id) => !members.includes(id)),
          false,
        );
        tieFaction(
          made,
          members.filter((id) => !old.members.includes(id)),
          true,
        );
      }
      changes.push({
        line: `${old ? "The faction" : "A new faction,"} ${made.name}: ${
          members
            .map((id) => ids[id])
            .filter(Boolean)
            .join(", ") || "nobody now"
        }.`,
      });
    } else if (
      item.do === "lore" &&
      !findPerson(item.about, true) &&
      factions.some(
        (faction) =>
          same(faction.name, item.about) ||
          same(`the ${faction.name}`, item.about) ||
          same(faction.name, `the ${item.about}`),
      )
    ) {
      // A faction's lore: one entry, tied to every member (and to whoever joins later).
      const faction = factions.find(
        (entry) =>
          same(entry.name, item.about) ||
          same(`the ${entry.name}`, item.about) ||
          same(entry.name, `the ${item.about}`),
      );
      if (faction.entryId && faction.lorebookId !== "world") {
        skipped.push(
          `${faction.name}'s lore comes from your lorebook, which the assistant can't change. Edit that entry in the Engine.`,
        );
        continue;
      }
      const old = faction.entryId ? (book.find((entry) => entry.id === faction.entryId) ?? null) : null;
      const content = item.text.replace(/\s+/gu, " ").trim().slice(0, 1500);
      if (!old && book.length >= 60) {
        skipped.push(`This world's own lore is full (60 entries), so nothing can be written about ${faction.name}.`);
        continue;
      }
      const id = old?.id ?? `note-${Date.now().toString(36)}${book.length}`;
      book = old
        ? book.map((entry) => (entry.id === id ? { ...entry, content } : entry))
        : [...book, { id, title: String(faction.name).slice(0, 120), content }];
      if (!old) {
        const made = { ...faction, lorebookId: "world", entryId: id };
        factions = factions.map((entry) => (entry === faction ? made : entry));
        tieFaction(made, made.members, true);
      }
      changes.push({
        line: `${old ? "Rewrite" : "Write"} the lore of the faction ${faction.name} (its members all know it).`,
        before: old?.content ?? "",
        after: content,
      });
    } else if (item.do === "lore") {
      const person = findPerson(item.about, true);
      const target =
        bare(item.about) === "world" || same(item.about, core.save.name)
          ? WORLD_ID
          : person
            ? person.id === "player"
              ? PLAYER_ID
              : `character:${person.id}`
            : findPlace(item.about);
      if (!target) {
        skipped.push(`"${item.about}" isn't a person or a place in this world.`);
        continue;
      }
      const title = target === WORLD_ID ? core.save.name : (person?.name ?? names[target] ?? item.about);
      const tied = new Set(
        (lore[target] ?? [])
          .filter((tie) => tie.lorebookId === "world" && !factionNote(tie.entryId))
          .map((tie) => tie.entryId),
      );
      const old = book.find((entry) => tied.has(entry.id)) ?? null;
      const content = item.text.replace(/\s+/gu, " ").trim().slice(0, 1500);
      if (!old && book.length >= 60) {
        skipped.push(`This world's own lore is full (60 entries), so nothing can be written about ${title}.`);
        continue;
      }
      const id = old?.id ?? `note-${Date.now().toString(36)}${book.length}`;
      book = old
        ? book.map((entry) => (entry.id === id ? { ...entry, content } : entry))
        : [...book, { id, title: String(title).slice(0, 120), content }];
      if (!old) lore = { ...lore, [target]: [...(lore[target] ?? []), { lorebookId: "world", entryId: id, title }] };
      changes.push({
        line: `${old ? "Rewrite" : "Write"} this world's lore about ${title}.`,
        before: old?.content ?? "",
        after: content,
      });
    } else if (item.do === "card") {
      const person = findPerson(item.person);
      const local = person && locals.find((entry) => entry.id === person.id);
      if (!local) {
        skipped.push(
          person
            ? `${person.name} is one of your own characters: their card is yours, in the Engine. This world's lore about them can be changed instead.`
            : nobody(item.person),
        );
        continue;
      }
      const parts = ["description", "personality", "appearance"].filter((part) => item[part]);
      const words = (from) => parts.map((part) => `${part}: ${from[part] ?? ""}`).join("\n\n");
      changes.push({ line: `Rewrite ${person.name}'s ${parts.join(", ")}.`, before: words(local), after: words(item) });
      locals = locals.map((entry) =>
        entry.id === local.id ? { ...entry, ...Object.fromEntries(parts.map((part) => [part, item[part]])) } : entry,
      );
    } else if (item.do === "rename") {
      const id = findPlace(item.place);
      if (!id) {
        skipped.push(noPlace(item.place));
        continue;
      }
      if (!dry) renameZone(id, item.name);
      changes.push({
        line: item.name
          ? `Rename ${placeLabel(id, item.place)} to "${item.name}".`
          : `${placeLabel(id, item.place)} gets its first name back.`,
      });
      if (item.name) names[id] = item.name;
    } else if (item.do === "hours") {
      const id = findPlace(item.place);
      if (!id) {
        skipped.push(noPlace(item.place));
        continue;
      }
      if (!dry) {
        const hours = Object.fromEntries(Object.entries(core.save.hours ?? {}).filter(([key]) => key !== id));
        if (!item.open) hours[id] = { from: item.from, to: item.to };
        core.save = { ...core.save, hours };
      }
      changes.push({
        line: item.open
          ? `${placeLabel(id, item.place)} is never closed.`
          : `${placeLabel(id, item.place)} is closed from ${span(item.from, item.to)}.`,
      });
    } else if (item.do === "group") {
      const groups = placeGroups();
      const old = groups.find((group) => same(group.name, item.name));
      if (item.delete) {
        if (!old) skipped.push(`There's no group of places called "${item.name}".`);
        else {
          if (!dry) groupHandlers.onGroupDelete(old.id);
          // Its lore ties go with it (here too, or the end of this would put them back).
          lore = Object.fromEntries(Object.entries(lore).filter(([key]) => key !== old.id));
          changes.push({ line: `End the group of places ${old.name} (its places stay).` });
        }
        continue;
      }
      const resolve = (list) =>
        list.map((words) => findPlace(words) ?? (skipped.push(noPlace(words)), null)).filter(Boolean);
      const [add, remove] = [resolve(item.add), resolve(item.remove)];
      if (!old && !add.length) {
        skipped.push(`The group "${item.name}" would have no places in it, so it wasn't made.`);
        continue;
      }
      if (!old && groups.length >= 60) {
        skipped.push("This world has as many groups of places as it can hold (60).");
        continue;
      }
      const members = [...new Set([...(old?.members ?? []), ...add])].filter((id) => !remove.includes(id));
      if (!dry)
        editGroups((all) =>
          old
            ? all.map((group) => (group.id === old.id ? { ...group, members } : group))
            : [...all, { id: newGroupId(all, item.name), name: item.name, members }],
        );
      changes.push({
        line: `${old ? "The group of places" : "A new group of places,"} ${old?.name ?? item.name}: ${members.map((id) => placeLabel(id)).join(", ") || "none now"}.`,
      });
    } else if (item.do === "world") {
      const ages = { ...(core.save.ages ?? { min: null, max: null }) };
      if (item.ageMin !== undefined) ages.min = item.ageMin;
      if (item.ageMax !== undefined) ages.max = item.ageMax;
      const agesChanged = item.ageMin !== undefined || item.ageMax !== undefined;
      if (!dry)
        setSetup({
          ...(item.setting !== undefined ? { setting: item.setting } : {}),
          ...(item.look !== undefined ? { look: item.look } : {}),
          ...(agesChanged ? { ages } : {}),
        });
      if (item.setting !== undefined)
        changes.push({ line: "Rewrite the world's setting.", before: core.save.setting ?? "", after: item.setting });
      if (item.look !== undefined) changes.push({ line: `How the world looks in pictures: "${item.look}".` });
      if (agesChanged)
        changes.push({
          line: `The usual ages of people the AI makes: from ${ages.min ?? "any age"} to ${ages.max ?? "any age"}.`,
        });
    } else if (item.do === "notice") {
      if ((core.save.notices ?? []).length >= 40) {
        skipped.push("The noticeboard is full (40 notes). Take some down first.");
        continue;
      }
      const note = {
        id: `n${Date.now().toString(36)}${changes.length}`,
        text: item.text,
        by: item.by || "someone in town",
        at: Date.now(),
      };
      if (!dry) core.save = { ...core.save, notices: [...core.save.notices, note] };
      changes.push({ line: `Pin a note to the noticeboard, from ${note.by}.`, after: item.text });
    } else if (item.do === "unpin") {
      // The notes by the numbers the model was shown (the board may have changed since: by id).
      const shown = context.noteIds ?? (core.save.notices ?? []).map((note) => note.id);
      const wanted = new Set(item.all ? shown : item.notes.map((number) => shown[number - 1]).filter(Boolean));
      const found = (core.save.notices ?? []).filter((note) => wanted.has(note.id) && !unpinned.has(note.id));
      if (!found.length) {
        skipped.push(
          item.all ? "There are no notes on the noticeboard." : "Those notes aren't on the noticeboard (any more).",
        );
        continue;
      }
      for (const note of found) unpinned.add(note.id);
      if (!dry) core.save = { ...core.save, notices: core.save.notices.filter((note) => !unpinned.has(note.id)) };
      changes.push({
        line: `Take ${found.length === 1 ? "a note" : `${found.length} notes`} down from the noticeboard.`,
        before: found.map((note) => `• ${note.text}${note.by ? ` (from ${note.by})` : ""}`).join("\n"),
        after: "(Taken down. Undo pins them back.)",
      });
    } else if (item.do === "memory") {
      const person = findPerson(item.person);
      if (!person || !core.memories) {
        skipped.push(nobody(item.person));
        continue;
      }
      // The memories by the numbers the model was shown (m1 the oldest); found again by day and words.
      const shown = context.memoryIds?.[person.id] ?? core.memories.list(person.id).reverse();
      const today = core.social?.day ?? 0;
      if (item.action === "add") {
        const day = shown[item.as - 1]?.day ?? today;
        if (!dry) core.memories.remember([person.id], item.text, day, false, "", "", true);
        changes.push({ line: `A new lasting memory for ${person.name} (${ago(day, today)}).`, after: item.text });
        continue;
      }
      const target = shown[item.memory - 1];
      const key = `${person.id}|${target?.day}|${target?.text}`;
      const now =
        target &&
        !touched.has(key) &&
        core.memories.list(person.id).find((memory) => memory.day === target.day && memory.text === target.text);
      if (!now) {
        skipped.push(`${person.name} has no memory m${item.memory} (any more).`);
        continue;
      }
      const when = `${ago(now.day, today)}${now.pinned ? ", pinned" : now.kept ? ", lasting" : ""}`;
      if (item.action === "reword") {
        if (item.text === now.text) continue;
        touched.add(key);
        if (!dry) core.memories.edit(person.id, now.text, now.day, item.text);
        changes.push({ line: `Reword a memory of ${person.name}'s (${when}).`, before: now.text, after: item.text });
      } else if (item.action === "remove") {
        touched.add(key);
        if (!dry) core.memories.remove(person.id, now.text, now.day);
        changes.push({
          line: `Delete a memory of ${person.name}'s (${when}).`,
          before: now.text,
          after: "(Deleted. Undo brings it back.)",
        });
      } else {
        const on = item.action === "pin";
        if (on === now.pinned) continue;
        const pinned = core.memories.list(person.id).filter((memory) => memory.pinned).length;
        if (on && pinned + (dry ? (pins[person.id] ?? 0) : 0) >= MEMORY.PINNED) {
          skipped.push(`${person.name} has ${MEMORY.PINNED} pinned memories already: unpin one first.`);
          continue;
        }
        if (on) pins[person.id] = (pins[person.id] ?? 0) + 1;
        if (!dry) core.memories.pin(person.id, now.text, now.day, on);
        changes.push({
          line: on
            ? `Pin a memory of ${person.name}'s (${when}): locked, never pushed out.`
            : `Unpin a memory of ${person.name}'s (${when}): it can be pushed out again.`,
          after: now.text,
        });
      }
    } else if (item.do === "scene") {
      const zoneId = item.place ? findPlace(item.place) : null;
      const cast = item.people
        .map((name) => findPerson(name) ?? (skipped.push(nobody(name)), null))
        .filter(Boolean)
        .filter((person, index, all) => all.findIndex((other) => other.id === person.id) === index);
      const playable = cast.filter((person) => !person.id.startsWith("local:"));
      if (scene || !playable.length || typeof core.props?.startScene !== "function") {
        skipped.push(
          scene
            ? "One scene at a time: the second was left out."
            : typeof core.props?.startScene !== "function"
              ? "This Engine can't start scenes from Wanderworld."
              : "A scene needs one of your own characters in it (people this world invented can't be in Engine scenes).",
        );
        continue;
      }
      scene = { zoneId, people: playable, premise: item.premise };
      changes.push({
        line: `Start a scene ${zoneId ? `at ${placeLabel(zoneId, item.place)}` : "where you stand"} with ${playable.map((person) => person.name).join(", ")}. It opens in the Engine when you confirm.`,
        after: item.premise,
      });
    } else if (item.do === "errand" && item.cancel) {
      if (!hasErrand) {
        skipped.push("You have no errand to drop.");
        continue;
      }
      hasErrand = false;
      changes.push({ line: "Drop the errand you have.", before: core.save.errand?.text ?? "", after: "(Dropped.)" });
      if (!dry) core.save = { ...core.save, errand: null, waypoint: null };
    } else if (item.do === "errand") {
      const person = findPerson(item.person);
      const place = person ? (housing[person.id]?.home ?? housing[person.id]?.work ?? null) : null;
      if (!person || !place || hasErrand) {
        skipped.push(
          !person
            ? nobody(item.person)
            : !place
              ? `${person.name} has no home or work to be found at, so they can't be given an errand.`
              : "You already have an errand. Finish it first (it's marked on your map).",
        );
        continue;
      }
      if (!dry) {
        const zone = core.zones.byId.get(place);
        const spot =
          (zone?.door !== undefined && zone.door !== null ? core.world.doors[zone.door] : null) ??
          zone?.shape?.circle ??
          null;
        core.save = {
          ...core.save,
          errand: {
            id: `errand-a${Date.now().toString(36)}`,
            person: person.id,
            place,
            text: item.text,
            done: item.done || `${person.name} thanks you.`,
          },
          waypoint: spot ? { region: core.save.region, x: spot.x, z: spot.z } : core.save.waypoint,
        };
      }
      hasErrand = true;
      changes.push({ line: `An errand for you, to ${person.name} (marked on your map).`, after: item.text });
    }
  }
  starts.forEach((start, at) => {
    const end = starts[at + 1] ?? changes.length;
    for (let index = start; index < end; index += 1) {
      changes[index].edit = at;
      changes[index].kind = edits[at].do;
    }
    if (dry && end > start) {
      // A relationship's strength as it would be set, when the edit gave none.
      const shown =
        edits[at].do === "relate" ? { ...edits[at], level: edits[at].level ?? changes[start].level } : edits[at];
      changes[start].fields = editableFields(shown, lists());
    }
  });
  if (!dry && changes.length) {
    core.save = {
      ...core.save,
      book: { entries: book },
      lore,
      locals,
      factions,
      memories: core.memories?.state ?? core.save.memories,
    };
    core.characters = peopleOf(core.save);
    if (castChanged) updateCast(); // whoever was added or taken away; saves
    if (core.talking && !core.cast.has(core.talking.id)) endTalk(); // the one being talked to is gone
    core.saves.write(core.save);
    core.placesChanged = true;
    core.relationsChanged = true;
    core.journalAt = 0;
    core.zoneCheck = 0;
    refreshNames();
    partyChanged();
  }
  // The scene opens last, with the world as these changes left it.
  if (!dry && scene) void sceneHere(scene.premise, scene);
  return { changes, skipped };
}

/** The Journal's keyword check: how many "ww:" keywords this world's lorebooks have, and the ones not understood. */
async function checkKeywords() {
  const save = core.save;
  if (!save || !core.zones) return;
  try {
    const books = (await chosenBooks(save)).filter((book) => book.id !== "world");
    if (core.save?.id !== save.id) return;
    const world = {
      zones: core.zones,
      names: namedZones(residentsOf(core.crowd.snapshot())),
      groups: placeGroups(),
      name: save.name,
      characters: peopleOf(save).filter((person) => save.cast.includes(person.id)),
      persona: personaName(),
    };
    core.keywordCheck = {
      id: save.id,
      found: books.reduce((sum, book) => sum + book.entries.reduce((count, entry) => count + entry.own.length, 0), 0),
      unknown: unknownKeywords(books, world).slice(0, 60),
    };
  } catch (error) {
    console.warn("[wanderworld] couldn't check the keywords", error);
  }
  core.placesChanged = true;
  core.journalAt = 0;
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
  teachFrom(text, [talking.id]);
  core.talk.line(personaName(), text);
  core.talk.say(core.player, text, 4, personaName());
  later(0.7, () => {
    if (core.talking !== talking) return;
    core.talk.say(talking.group, "…", 1.2, nameFor(talking.id, talking.name));
    core.crowd.setSpeaking(talking.id, true);
  });
  later(1.6, () => answer(talking, "answer", text));
}

/** The words a conversation's lines can use: who's talking, the town and a few of its places. */
function talkWords(name, id = null) {
  const names = core.zones ? namedZones(residentsOf(core.crowd.snapshot())) : {};
  const find = (test) => core.zones?.zones.find(test);
  const title = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : text);
  const tavern = find((zone) => zone.buildingKind === "tavern");
  const wild = find((zone) => zone.kind === "forest") ?? find((zone) => zone.kind === "mountains");
  const street = find((zone) => zone.kind === "street");
  return {
    name,
    you: !id || theyKnow(id) ? personaName() : "stranger",
    town: names.town ?? "town",
    tavern: tavern ? title(names[tavern.id]) : "The tavern",
    wild: wild ? names[wild.id] : "the woods",
    street: street ? names[street.id] : "the high street",
    greeting: greetingFor(core.hour),
  };
}

/** The one you're talking to answers (`what`: "greet", "bye", "answer" or a topic, dialogue.js). */
function answer(talking, what, line = "") {
  if (core.talking !== talking) return;
  const setLine = () =>
    lineFor(what, moodOf(core.relations.feeling(talking.id, "player")), talkWords(talking.name, talking.id));
  // (A goodbye stays a set line: the conversation closes before a model could answer.)
  const known = core.characters?.some((entry) => entry.id === talking.id);
  if (what !== "bye" && core.settings.aiTalk && core.ai.known()?.talk && known) {
    void aiAnswer(talking, line, setLine);
    return;
  }
  showReply(talking, line, setLine());
}

/** The reply on screen and in the conversation's history (with the player's line before it). */
function showReply(talking, line, reply) {
  if (line) talking.history.push({ from: "player", text: line });
  talking.history.push({ from: "character", text: reply });
  // They remember what was said to them (and nobody else does).
  if (line) recall([talking.id], `${personaName()} said to you: "${line}"`, true);
  core.crowd.setSpeaking(talking.id, true);
  core.talk.say(talking.group, reply, Math.min(12, 3 + reply.length / 22), nameFor(talking.id, talking.name));
  core.talk.line(nameFor(talking.id, talking.name), reply);
  learnFrom(reply, [talking]); // they gave their name
  later(2.6, () => {
    if (core.talking === talking) core.crowd.setSpeaking(talking.id, false);
  });
}

/**
 * A reply written by the model (the server part), while they think it over; a failed call falls back to
 * a set line, and says why once.
 */
async function aiAnswer(talking, line, setLine) {
  core.talk.say(talking.group, "…", 60, nameFor(talking.id, talking.name));
  core.crowd.setSpeaking(talking.id, true);
  try {
    const { reply } = await core.ai.talk(talkPayload(talking, line));
    if (core.talking === talking) showReply(talking, line, reply);
  } catch (error) {
    if (core.talking !== talking) return;
    showReply(talking, line, setLine());
    if (!core.aiTold) {
      core.aiTold = true; // once a session
      core.hud?.setNotice(`AI conversation didn't work, so set lines stand in: ${error?.message ?? error}`);
    }
  }
}

// ── Moments: narration and replies from whoever hears (server.mjs /moment) ─────

/** How far a voice carries, in metres. */
const VOICE_RANGE = { whisper: 2.5, talk: 9, shout: 28 };

/** What someone is doing, in a few words, for a moment's listeners and the Illustrate prompt. */
function doingWords(person) {
  if (person.seated) return person.with ? `sitting with ${person.with}` : "sitting on a bench";
  if (person.doing && actWords(person.doing)) return actWords(person.doing);
  if (person.state === "chat" || person.with) return person.with ? `chatting with ${person.with}` : "chatting";
  if (person.state === "walk") return "walking along";
  const entry = core.crowd.scheduledNow(person.id, core.hour);
  return entry && entry.activity !== "walk" ? ACTIVITY_WORDS[entry.activity] : "standing about";
}

/**
 * Who hears the player: within the voice's range (a whisper a couple of metres, a shout across a square),
 * out of doors, only the party when that's who's being spoken to. Nearest first, at most six; Engine
 * characters only (the model writes their lines from their cards).
 */
function momentListeners(voice, audience, extra = [], text = "") {
  const range = VOICE_RANGE[voice] ?? VOICE_RANGE.talk;
  const at = core.interior ? core.interior.door : core.player.position;
  const party = new Set(
    core.crowd
      .party()
      .filter((member) => !member.waiting)
      .map((member) => member.id),
  );
  const known = new Set((core.characters ?? []).map((character) => character.id));
  const inside = new Set(extra.map((person) => person.id));
  const names = { ...nameIds(), player: personaName() };
  const heard = core.crowd
    .snapshot()
    .filter((person) => known.has(person.id) && (person.state !== "inside" || inside.has(person.id)))
    .map((person) => ({
      person,
      name: person.name,
      distance: inside.has(person.id) ? 2 : Math.hypot(person.x - at.x, person.z - at.z),
    }))
    .filter(({ person, distance }) => distance <= range && (audience !== "party" || party.has(person.id)));
  // Anyone the player names ("Hey Ingrid!") is among them if they're in earshot; then the nearest. Friends
  // out together are heard as one: whoever is picked brings the rest of their company in earshot (eight
  // at most), so one call answers for the group.
  const picked = pickListeners(heard, text);
  for (const { person } of [...picked]) {
    for (const id of person.company ?? []) {
      const friend = heard.find((entry) => entry.person.id === id);
      if (friend && !picked.includes(friend) && picked.length < 8) picked.push(friend);
    }
  }
  const told = memoriesTold(picked.map(({ person }) => person.id));
  return picked.map(({ person, distance }) => ({
    id: person.id,
    name: person.name,
    distance: Math.round(distance),
    doing: inside.has(person.id) ? "inside" : doingWords(person),
    feeling: towardPlayer(person.id, person.name, names),
    // What they are to the others in earshot (two at most), so they speak to each other as they would.
    others: picked
      .filter((other) => other.person.id !== person.id && core.relations.get(person.id, other.person.id))
      .slice(0, 2)
      .map((other) => `${core.relations.describe(person.id, other.person.id, names)}.`)
      .join(" "),
    inParty: party.has(person.id),
    // Their own memories, and nobody else's, each with when and how they came by it.
    knows: told[person.id],
  }));
}

/**
 * A line in the narration box and the moment log (`who` null for the narrator). `heard`: the ids of who
 * was in earshot, so that later only they are told of it (memory.js heardLines).
 */
function narrate(who, text, heard = []) {
  core.momentLog = [...core.momentLog, { who: who ?? "Narrator", text, heard }].slice(-30);
  if (core.save) {
    core.save.log = core.momentLog;
    core.saves.write(core.save);
  }
  core.hud?.narrate(who, text, !!who && who === personaName());
}

/**
 * A moment: the player does something (`action`) and/or says something (`line`, at `voice`, to
 * `audience`: "nearby" or "party"). The model narrates it in a line and whoever heard may answer;
 * anything they agree to ("meet me at noon by the fountain") goes in their schedule. With
 * `needListeners`, nothing happens unless someone's in earshot (sitting down, reading the board).
 * Returns whether the moment ran.
 */
async function runMoment({
  action = "",
  line = "",
  voice = "talk",
  audience = "nearby",
  needListeners = false,
  listenersExtra = [],
  source = "chat",
}) {
  if (!core.save || !core.zones) return false;
  const listeners = momentListeners(voice, audience, listenersExtra, `${line} ${action}`);
  const heardIds = listeners.map((person) => person.id);
  if (line) {
    core.talk.say(core.player, line, Math.min(10, 3 + line.length / 22), personaName());
    narrate(
      personaName(),
      voice === "whisper" ? `(whispers) ${line}` : voice === "shout" ? `(shouts) ${line}` : line,
      heardIds,
    );
  }
  // Whoever heard it remembers it, and whoever saw it done (further off than a voice carries): with or
  // without a model to tell it. (After the listeners were read, so this isn't among what they knew before.)
  if (line) recall(heardIds, `${personaName()} ${voice === "whisper" ? "whispered" : "said"}: "${line}"`, true);
  if (action) recall(inSight(heardIds), `${personaName()} ${action}.`, false, "saw");
  if (!core.settings.aiTalk || !core.settings.aiMoments || !core.ai.known()?.moments || core.momentBusy) return false;
  // Settings → AI: each kind of moment can be kept from calling the model (what's typed always may).
  const allowed = { arrive: "aiArrive", thing: "aiThings", board: "aiBoard", seat: "aiSeats", join: "aiJoin" }[source];
  if (allowed && !core.settings[allowed]) return false;
  if (line)
    teachFrom(
      line,
      listeners.map((person) => person.id),
    );
  if (needListeners && !listeners.length) return false;
  core.momentBusy = true;
  try {
    const names = namedZones(residentsOf(core.crowd.snapshot()));
    const at = core.interior ? core.interior.door : core.player.position;
    const zone = zoneAt(core.zones, at.x, at.z);
    // Lore of the place, its group and the world is what anyone here knows. Lore about a person is theirs
    // alone; lore about the player is known to those who know the player.
    const entries = activeLore(zone, names, heardIds).entries.filter((entry) => entry.content);
    const words = (entry) => `${entry.title}: ${entry.content}`;
    const personal = (entry) => entry.source.startsWith("character:") || entry.source === PLAYER_ID;
    const lore = entries
      .filter((entry) => !personal(entry))
      .map(words)
      .slice(0, 6);
    const places = schedulePlaces();
    // What was just said or done goes as what's happening now, not as "just before"; something done
    // (told by whoever asked for this) was seen by those here.
    const last = core.momentLog.at(-1);
    const mine = last?.who === personaName() && (!!line || last.text === "*" + action + "*");
    if (mine && !line) last.heard = heardIds;
    // What each of them knows besides, theirs alone: their lore, their memories, and what of the chat
    // they heard that the others here didn't. (A memory of a line that's in the chat is said once.)
    const chat = heardLines(mine ? core.momentLog.slice(0, -1) : core.momentLog, listeners);
    const said = [...chat.shared, ...Object.values(chat.own).flat()].map((entry) =>
      entry.text.replace(/^\((whispers|shouts)\) /u, ""),
    );
    const telling = listeners.map((person) => ({
      ...person,
      knows: [
        ...entries
          .filter(
            (entry) =>
              entry.source === `character:${person.id}` ||
              (entry.source === PLAYER_ID && (person.inParty || !!core.relations.get(person.id, "player"))),
          )
          .map((entry) => `(lore) ${words(entry)}`.slice(0, 600))
          .slice(0, 2),
        ...person.knows.filter((memory) => !said.some((text) => text.length > 2 && memory.includes(`"${text}"`))),
        ...(chat.own[person.id] ?? []).map((entry) => `(just now, heard) ${entry.who}: ${entry.text}`),
      ],
    }));
    const result = await core.ai.moment({
      personaId: core.personaId ?? null,
      personaName: personaName(),
      action,
      line,
      voice,
      listeners: telling,
      place: placeWords(),
      time: clockText(),
      weather: weatherWord(),
      setting: core.save.setting ?? "",
      style: core.settings.talkStyle,
      lore,
      recent: chat.shared,
      places: places.map(({ id, name }) => ({ id, name })),
      connectionId: core.settings.textConnection || null,
      temperature: core.settings.aiTemperature,
      narratorId: narratorFor("moments")?.id ?? null,
      separate: core.settings.aiSeparate === true,
    });
    if (result.narration) narrate(null, result.narration, heardIds);
    result.replies.forEach((reply, i) => {
      const listener = listeners.find((person) => person.id === reply.id);
      later(0.3 + i * 1.8, () => {
        const group = core.crowd.groupOf(reply.id);
        if (group)
          core.talk.say(
            group,
            reply.text,
            Math.min(10, 3 + reply.text.length / 22),
            listener ? nameFor(listener.id, listener.name) : "",
          );
        core.crowd.setSpeaking(reply.id, true);
        later(2.6, () => core.crowd.setSpeaking(reply.id, false));
        narrate(listener ? nameFor(listener.id, listener.name) : "Someone", reply.text, heardIds);
        if (listener) learnFrom(reply.text, [listener]);
      });
    });
    const placeNames = Object.fromEntries(places.map((place) => [place.id, place.name]));
    for (const { id, entry } of result.plans) {
      scheduleFromMoment(id, entry);
      const who = listeners.find((person) => person.id === id)?.name ?? "Someone";
      const where = placeNames[entry.place] ? ` at ${placeNames[entry.place]}` : "";
      narrate(
        null,
        `(${who}: ${ACTIVITY_WORDS[entry.activity]}${where}, ${hourText(entry.from)}–${hourText(entry.to)}.)`,
        heardIds,
      );
    }
    return true;
  } catch (error) {
    narrate(null, `(No narration: ${error?.message ?? error})`);
    return false;
  } finally {
    core.momentBusy = false;
  }
}

/**
 * The player types in the Speak bar (interactions.js parseSpeech): said to everyone nearby, shouted (/s),
 * whispered (/w), said to the party (/p), or done instead of said (/a: an action the narrator and the
 * people round about answer).
 */
function speak(typed) {
  const command = /^\/(scene|camp)\b\s*(.*)$/isu.exec(typed.trim());
  if (command?.[1].toLowerCase() === "scene") return void sceneHere(command[2].trim());
  if (command?.[1].toLowerCase() === "camp") return makeCamp();
  const speech = parseSpeech(typed);
  if (!speech) return;
  if (speech.action) narrate(personaName(), `*${speech.action}*`);
  void runMoment(speech);
}

// ── Illustrate (illustrate.js, server.mjs /illustrate) ─────────────────────────

/** What the player is doing right now, in a few words. */
function playerDoing() {
  if (core.mode === "sit" && core.seat?.ground)
    return core.seat.ground === "lie" ? "lying on the ground" : "sitting on the ground";
  if (core.mode === "ride") return `riding ${mountName(core.mount).replace(/^the /u, "a ")}`;
  if (core.mode === "sit" && core.seat?.pose === "lie") return "lying on a bed";
  if (core.mode === "sit") return "sitting on a bench";
  if (core.talking) return `talking with ${core.talking.name}`;
  if (core.swimming) return "swimming";
  if (core.interior) return "standing inside";
  const moving = core.input?.moving?.() ?? false;
  return moving ? "walking" : "standing";
}

/**
 * Paints the current moment from the player's template: where and when, the weather, who's with them
 * (the party and anyone close by, and what they're doing), what the player is doing and the last line
 * of narration. Their looks come from their cards on the server. Kept in the world's gallery.
 */
async function illustrateMoment({
  template,
  width,
  height,
  improve,
  instruction,
  rewriteConnection = "",
  previewOnly = false,
  prompt = "",
}) {
  if (!core.save || !core.zones) throw new Error("Open a world first.");
  if (!core.ai.known()?.illustrate) throw new Error("Wanderworld's server part isn't running: restart the Engine.");
  const at = core.interior ? core.interior.door : core.player.position;
  const zone = zoneAt(core.zones, at.x, at.z);
  const party = new Set(core.crowd.party().map((member) => member.id));
  const known = new Set((core.characters ?? []).map((character) => character.id));
  const people = core.crowd
    .snapshot()
    .filter((person) => known.has(person.id) && person.state !== "inside")
    .map((person) => ({ person, distance: Math.hypot(person.x - at.x, person.z - at.z) }))
    .filter(({ person, distance }) => distance < 10 || (party.has(person.id) && distance < 25))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5)
    .map(({ person }) => ({ id: person.id, name: person.name, doing: doingWords(person) }));
  const hour = core.hour;
  const timeOfDay =
    hour < 5 || hour >= 22
      ? "night"
      : hour < 8
        ? "early morning"
        : hour < 12
          ? "morning"
          : hour < 14
            ? "midday"
            : hour < 18
              ? "afternoon"
              : hour < 20
                ? "dusk"
                : "evening";
  const kind = zone.kind === "building" ? zone.buildingKind : (zone.outpostKind ?? zone.kind);
  const recent = [...core.momentLog].reverse().find((line) => line.who === "Narrator")?.text ?? "";
  return core.ai.illustrate({
    worldId: core.save.id,
    template,
    personaId: core.personaId ?? null,
    facts: {
      persona: personaName(),
      people,
      place: placeWords(),
      placeKind:
        { plaza: "a market square", street: "a town street", forest: "the woods", river: "a riverbank" }[kind] ?? kind,
      time: clockText(),
      timeOfDay,
      weather: weatherWord(),
      activity: playerDoing(),
      setting: core.save.setting ?? "",
      look: core.save.look || PACK.look,
      recent,
      // The last of the chat, for the rewrite: what's being done right now is in there, not in "standing".
      chat: core.momentLog.slice(-8).map((line) => ({ who: line.who, text: line.text })),
    },
    caption: `${placeWords()}, ${clockText()}`,
    connectionId: core.settings.imageConnection || null,
    styleProfileId: core.settings.imageStyle,
    width,
    height,
    improve,
    instruction,
    previewOnly,
    prompt,
    textConnectionId: rewriteConnection || core.settings.textConnection || null,
  });
}

/** Where the player is, in words: the place and the places it's in. */
/** " (closed until 06:00)" when a place's hours (a lorebook's ww:closed:22-6) say it's shut now, else "". */
function closedWords(zoneId) {
  const hours = core.save?.hours?.[zoneId];
  return hours && inRange(core.hour, hours.from, hours.to) ? ` (closed until ${hourText(hours.to)})` : "";
}

function placeWords() {
  if (!core.zones) return "";
  const names = namedZones(residentsOf(core.crowd.snapshot()));
  const at = core.interior ? core.interior.door : core.player.position;
  const zone = zoneAt(core.zones, at.x, at.z);
  return chainOf(core.zones, zone)
    .map((entry) => names[entry.id] && `${names[entry.id]}${closedWords(entry.id)}`)
    .filter(Boolean)
    .join(", in ");
}

/** The weather now, in a word, when there is any to speak of. */
function weatherWord() {
  const weather = core.world?.weatherNow?.();
  return weather && weather.kind !== "clear" && weather.amount > 0.5 ? weather.kind : "";
}

/** What the server part needs for one reply from `talking` to the player's `line`. */
function talkPayload(talking, line) {
  const position = core.player.position;
  const zone = core.zones ? zoneAt(core.zones, position.x, position.z) : null;
  const nearby = core.crowd
    .snapshot()
    .filter((person) => person.id !== talking.id && person.state !== "inside")
    .filter((person) => Math.hypot(person.x - position.x, person.z - position.z) < 12)
    // (By name, as the one talking knows them; with a word when the player doesn't.)
    .map((person) => (knows(person.id) ? person.name : `${person.name} (a stranger to ${personaName()})`))
    .slice(0, 6)
    .join(", ");
  const names = { ...nameIds(), player: personaName() };
  return {
    characterId: talking.id,
    // Who they are, whatever their card says or doesn't; and whether each knows the other by name.
    characterName: talking.name,
    // What they themselves remember: nothing anyone else saw or was told.
    memories: memoriesTold([talking.id])[talking.id],
    knowsThem: knows(talking.id),
    knowsYou: theyKnow(talking.id),
    personaId: core.personaId,
    personaName: personaName(),
    place: placeWords(),
    time: clockText(),
    weather: weatherWord(),
    nearby,
    relationship: towardPlayer(talking.id, talking.name, names),
    setting: core.save?.setting ?? "",
    lore: zone
      ? loreAt(zone)
          .slice(0, 12)
          .map(({ lorebookId, entryId }) => ({ lorebookId, entryId }))
      : [],
    loreTexts: zone
      ? activeLore(zone, {})
          .entries.filter((entry) => entry.own && entry.content)
          .slice(0, 6)
          .map((entry) => `${entry.title}: ${entry.content}`)
      : [],
    history: talking.history.slice(-24),
    line,
    connectionId: core.settings.textConnection || null,
    style: core.save?.voices?.[talking.id] || core.settings.talkStyle, // their own voice, or the setting's
    length: core.settings.replyLength,
    temperature: core.settings.aiTemperature,
  };
}

/** Who a conversation is with, for what there is to say (dialogue.js choicesFor). */
function choiceContext(talking) {
  return {
    mood: moodOf(core.relations.feeling(talking.id, "player")),
    known: knows(talking.id),
    theyKnow: theyKnow(talking.id),
    you: personaName(),
    seed: talking.id,
  };
}

/** The player picks something to say from the choices. */
function choose(id) {
  const talking = core.talking;
  if (!talking) return;
  if (id === "join") {
    // Not something said: the talk ends, and what they do together is a moment (or the pack's line).
    const joining = joiningOf(talking);
    const person = { id: talking.id, name: talking.name };
    endTalk();
    narrate(personaName(), `*${joining.verb}*`);
    void runMoment({ action: joining.verb, listenersExtra: [person], source: "join" }).then(
      (done) =>
        !done && narrate(null, pickLine(joining.lines, `${person.id}:${Math.floor(core.clock / 30)}`, lineWords())),
    );
    return;
  }
  const text = labelOf(id, personaName());
  teachFrom(text, [talking.id]); // "I'm Zoey."
  core.talk.line(personaName(), text);
  core.talk.say(core.player, text, 3, personaName());
  if (id === "bye") {
    core.talk.setChoices([], () => {});
    later(0.7, () => answer(talking, "bye", text));
    later(2.4, () => {
      if (core.talking === talking) endTalk();
    });
    return;
  }
  talking.asked.push(id);
  core.talk.setChoices(choicesFor(talking.asked, choiceContext(talking)), choose);
  later(0.8, () => answer(talking, id, text));
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
  const into = core.zones?.byId.get(`building:${door.index}`);
  if (into)
    recall(
      inSight(),
      `${personaName()} went into ${namedZones(residentsOf(core.crowd.snapshot()))[into.id] ?? into.name}.`,
      false,
      "saw",
    );
  goThrough(() => {
    core.world.setDoor(door.index, false);
    const room = createInterior(door, core.seed, core.save?.furnished?.[`building:${door.index}`] ?? []);
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
    core.placesChanged = true; // (Journal → Home offers furnishing only indoors)
    core.journalAt = 0;
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
/**
 * Starts the moment on a scene card as a real Engine scene (the host's startScene, Capability API 1.66):
 * its context (who's there, the persona, the connection, notes, lorebooks) goes to the server part for
 * the Engine's planner, and the Engine plans and opens the scene. Returns words for the card.
 */
async function playAsScene(thing, request, along, withNarrator = false) {
  const startScene = core.props?.startScene;
  if (typeof startScene !== "function" || !core.save) return "This Engine can't start scenes from Wanderworld.";
  // The Engine casts its own characters only: a world's own people can't be in a scene.
  const known = new Set((core.engineCharacters ?? []).map((entry) => entry.id));
  const people = [...thing.inside, ...along].filter((person, i, all) => all.findIndex((p) => p.id === person.id) === i);
  const characterIds = people.map((person) => person.id).filter((id) => known.has(id));
  // The narrator card joins when asked for, and always when nobody else can be cast.
  const narrator = narratorFor("scenes");
  const telling = narrator && (withNarrator || !characterIds.length) && !characterIds.includes(narrator.id);
  if (telling) characterIds.push(narrator.id);
  if (!characterIds.length)
    return "A scene needs one of your characters there, or a narrator card (Menu → Settings → AI) to tell it alone.";
  const names = { ...nameIds(), player: personaName() };
  const feelings = characterIds
    .map((id) => (core.relations.get(id, "player") ? core.relations.describe(id, "player", names) : ""))
    .filter(Boolean);
  const weather = weatherWord();
  const notes = [
    describeScene(request),
    `Where: ${[thing.title, ...request.thing.chain].filter(Boolean).join(", in ")}. When: ${clockText()}${weather ? `, ${weather}` : ""}.`,
    core.save.setting ? `The world: ${core.save.setting}` : "",
    feelings.length ? `How they feel about ${personaName()}:\n${feelings.join("\n")}` : "",
    "This scene is played out from Wanderworld, a small walkable world; keep to the place and the people there.",
    telling
      ? `${narrator.name} is the narrator of this scene: they tell what happens and give the world its voice, and are not a person standing there.`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");
  const originId = `world:${core.save.id}/scene:${Date.now().toString(36)}`;
  const context = {
    characterIds,
    personaId: core.personaId ?? null,
    connectionId: core.settings.sceneConnection || core.settings.textConnection || null,
    transcript: [
      ...(core.talking?.history ?? []).slice(-8).map((entry) => ({
        speaker: entry.from === "character" ? core.talking.name : personaName(),
        content: entry.text,
      })),
      ...(people.some((person) => known.has(person.id))
        ? heardBy(
            core.momentLog,
            people.map((person) => person.id),
          )
        : core.momentLog.slice(-8)
      ).map((line) => ({ speaker: line.who, content: line.text })),
    ].slice(-12),
    notes,
    lorebookIds: core.save.lorebooks ?? [],
  };
  try {
    await core.ai.sceneOrigin(originId, context);
    const first = people.find((person) => known.has(person.id)) ?? (telling ? narrator : null);
    // Wanderworld plans the scene itself (its point of view, tense and this world's instructions), so
    // the Engine's dialog, with choices remembered from other chats, doesn't come up. If planning
    // fails, the Engine's own planner and dialog take over.
    let plan = null;
    let planNote = "";
    try {
      const planned = await core.ai.scenePlan({
        context,
        personaName: personaName(),
        initiatorId: first?.id ?? null,
        prompt: describeScene(request),
        title: thing.title,
        pov: core.settings.scenePov,
        tense: core.settings.sceneTense,
        instructions: core.save.sceneInstructions ?? "",
      });
      plan = planned.plan;
    } catch (error) {
      planNote = ` (Wanderworld couldn't plan it, ${error?.message ?? error}, so the Engine's planner took over.)`;
    }
    const initiator = plan ? (people.find((person) => person.id === plan.characterIds[0]) ?? first) : first;
    // A plan of its own: the scene is made through the server part, with the chosen prompt preset, and
    // opened here. (The Home tab's startScene can't pass a preset.)
    if (plan) {
      try {
        const made = await core.ai.sceneStart({
          originId,
          plan,
          initiatorId: initiator?.id ?? null,
          promptPresetId: core.settings.scenePreset || null,
          pov: core.settings.scenePov,
          tense: core.settings.sceneTense,
          data: { worldId: core.save.id, place: thing.title },
        });
        core.props?.openChat?.(made.chatId);
        return "The scene is open in the Engine. When it ends, its recap comes back here (Journal → Here).";
      } catch (error) {
        planNote = ` (It couldn't be made with your preset, ${error?.message ?? error}, so it opened without one.)`;
      }
    }
    const started = await startScene({
      originId,
      prompt: describeScene(request),
      ...(plan ? { plan } : {}),
      initiatorCharacterId: initiator?.id ?? null,
      initiatorName: initiator?.name ?? null,
      data: { worldId: core.save.id, place: thing.title },
    });
    if (started && planNote) return `The scene is open in the Engine.${planNote}`;
    if (!started) return "The scene wasn't started.";
    return "The scene is open in the Engine. When it ends, its recap comes back here (Journal → Here).";
  } catch (error) {
    return `The scene couldn't start: ${error?.message ?? error}`;
  }
}

/** Recaps of this world's scenes that have ended, from the server part, kept in the world's events. */
async function pullRecaps() {
  const save = core.save;
  if (!save || !core.ai.known()?.scenes) return;
  try {
    const results = await core.ai.sceneResults(save.id);
    if (!results.length || core.save?.id !== save.id) return;
    const events = [...(core.save.events ?? [])];
    for (const result of results) {
      if (!events.some((event) => event.id === result.id)) {
        events.push({
          id: result.id,
          kind: result.kind === "concluded" ? "scene" : "scene-dropped",
          at: Date.parse(result.at) || Date.now(),
          place: typeof result.data?.place === "string" ? result.data.place : "",
          summary: result.summary ?? "",
          characterIds: result.characterIds ?? [],
        });
        // Whoever was in it remembers it, for good: a scene is something that happened to them.
        if (result.kind === "concluded" && result.summary)
          keep(result.characterIds ?? [], `A scene with ${personaName()}: ${result.summary}`);
      }
    }
    core.save = { ...core.save, events: events.slice(-100) };
    core.saves.write(core.save);
    core.journalAt = 0;
    for (const result of results) await core.ai.forgetResult(result.id).catch(() => {});
  } catch {
    // the server part is away: the recaps wait there for next time
  }
}

/** A picture of where the player is, through the server part's image route (Journal → Here). */
async function pictureHere() {
  if (!core.zones || core.picture?.pending) return;
  const position = core.interior ? core.interior.door : core.player.position;
  const zone = zoneAt(core.zones, position.x, position.z);
  const place = placeWords();
  const hour = Math.floor(core.hour);
  const light =
    hour < 6 || hour >= 21
      ? "at night, lamplit"
      : hour < 9
        ? "in the early morning"
        : hour >= 18
          ? "at dusk"
          : "in daylight";
  const weather = weatherWord();
  const prompt = [
    `A view of ${place || "a small medieval town"}, ${light}${weather ? `, ${weather}` : ""}.`,
    core.save?.setting
      ? `The world: ${core.save.setting}.`
      : "A cosy low-fantasy world of half-timbered houses, cobbled streets and green countryside.",
    "Scenery, environment, no text.",
  ].join(" ");
  core.picture = { zoneId: zone.id, place, url: null, pending: true, error: null };
  core.journalAt = 0;
  try {
    const { image } = await core.ai.image({
      prompt,
      name: place || "wanderworld",
      width: 768,
      height: 512,
      connectionId: core.settings.imageConnection || null,
      styleProfileId: core.settings.imageStyle,
    });
    core.picture = { ...core.picture, url: image, pending: false };
  } catch (error) {
    core.picture = { ...core.picture, pending: false, error: error?.message ?? String(error) };
  }
  core.journalAt = 0;
}

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
      people: thing.inside.map((person) => nameFor(person.id, person.name)),
      empty: thing.empty,
      party,
      actions: (ACTIONS[thing.kind] ?? []).map(({ id, label }) => ({ id, label })),
      narrator: narratorFor("scenes")?.name ?? null,
      needsNarrator: ![...thing.inside, ...party].some((person) => !person.id.startsWith("local:")),
      // With the server part and an Engine that can start scenes from packages.
      playScene:
        typeof core.props?.startScene === "function" && core.ai.known()?.scenes
          ? (action, line, along, withNarrator) => {
              const request = sceneRequest({
                thing: { kind: thing.kind, name: thing.title, chain },
                action: line.trim() ? OWN_LINE : (action ?? OWN_LINE),
                line,
                inside: thing.inside,
                party: party.filter((member) => along.includes(member.id)),
                persona: { id: "player", name: personaName() },
                hour: core.hour,
              });
              if (!request) return Promise.resolve("Write what you do first, or pick one of the things to do.");
              return playAsScene(
                thing,
                request,
                party.filter((member) => along.includes(member.id)),
                withNarrator,
              );
            }
          : null,
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
      // Played out at once as a moment: a line of narration, and whoever's there may answer.
      void runMoment({
        // Nobody in: said, so the telling doesn't have someone come to the door.
        action: `${request.verb ? `${request.verb} (${thing.title})` : `is at ${thing.title}`}${
          thing.kind === "door" && thing.empty && !thing.inside.length
            ? `. ${thing.empty} Nobody answers or comes to the door`
            : ""
        }`,
        line: request.line,
        listenersExtra: thing.inside,
        source: request.line ? "chat" : "thing", // their own words are always heard
      }).then((done) => {
        // No AI answering: the setting pack's own line for it, so something still happens.
        const told = done
          ? ""
          : thingLine(thing.kind, request.action, `${thing.title}:${Math.floor(core.clock / 30)}`, lineWords());
        if (told) narrate(null, told);
      });
      if (thing.kind === "campfire" && request.action === "douse") dousCamp();
      // What's done shows: down by the fire to sit at it, a drink drunk, a hand to anything else.
      if (thing.kind === "campfire" && request.action === "sit") rest();
      else core.gesture = /drink|sip|taste/iu.test(`${request.action} ${request.verb ?? ""}`) ? "drink" : "pickUp";
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
  const home = door.index === playerHomeDoor();
  // An errand to someone here: done if they're in, and said plainly if they're not.
  const errand = core.save?.errand;
  if (errand && zone && errand.place === zone.id) {
    if (core.crowd.inside(door).some((person) => person.id === errand.person)) finishErrand(true);
    else core.hud?.setNotice("Whoever your errand is for isn't in. Come back later, or find them out and about.");
  }
  openScene({
    kind: home ? "home" : "door",
    zone,
    title: `${zone ? zoneName(zone, residentsOf(core.crowd.snapshot())) : (PLACE_NAMES[door.kind] ?? "a house")}${zone ? closedWords(zone.id) : ""}`,
    inside: core.crowd.inside(door).map((person) => ({ id: person.id, name: person.name })),
    empty: home ? "Nobody else is home." : "Nobody seems to be in.",
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
  // One note asks for something (the setting pack's errands): a new one once the last is done.
  const errand = core.save?.errand ? null : boardErrand(names);
  return [
    ...(errand ? [{ id: errand.id, text: errand.text, by: null, errand: true }] : []),
    ...pick.map((note, i) => ({ id: `town:${i}`, ...note })),
    ...mine,
  ];
}

/** The errand the noticeboard offers now: to someone who lives here, found where they work or live. */
function boardErrand(names) {
  if (!core.zones || !core.save) return null;
  const people = (core.characters ?? [])
    .filter((person) => core.cast?.has(person.id))
    .map((person) => {
      const house = core.save.housing?.[person.id];
      const place = [house?.work, house?.home, "plaza", "town"].find((id) => id && names[id]);
      return place ? { id: person.id, name: person.name, place: { id: place, name: names[place] } } : null;
    })
    .filter(Boolean);
  return errandFor(`${core.save.seed}:${core.save.region}:${core.save.errandsDone ?? 0}`, people);
}

function openNoticeboard() {
  core.sceneDoor = core.world.noticeboard.use; // walking away closes it, like a door's card
  void runMoment({ action: "stops to read the notes on the noticeboard", source: "board" });
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
        onTake: (id) => {
          const errand = boardErrand(namedZones(residentsOf(core.crowd.snapshot())));
          if (!core.save || !errand || errand.id !== id) return;
          // Marked on the map: the place's middle is where to go.
          const zone = core.zones.byId.get(errand.place);
          const door = zone?.door !== undefined ? core.world.doors[zone.door] : null;
          const spot = door ?? zone?.shape?.circle ?? null;
          core.save = {
            ...core.save,
            errand,
            waypoint: spot ? { region: core.save.region, x: spot.x, z: spot.z } : core.save.waypoint,
          };
          core.saves.write(core.save);
          narrate(null, `You take the note down: "${errand.text}"`);
          learn(errand.person);
          core.hud?.setNotice("Errand taken: it's marked on your map.");
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
    core.placesChanged = true;
    core.journalAt = 0;
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
      label: seat.pose === "lie" ? "Lie down" : "Sit",
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
      label: `Talk to ${nameFor(person.id, person.name)}`,
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
  // Your own dog, at home: call it along. (Sending it home is in your Look card: it's always at your heel.)
  for (const pet of core.interior ? [] : core.herd.snapshot()) {
    if (pet.owner !== PLAYER_ID || pet.out || pet.kind === "horse" || !pet.loaded) continue;
    list.push({
      kind: "thing",
      label: `Call ${petsFor(PLAYER_ID).dog?.name || "the dog"} along`,
      x: pet.x,
      z: pet.z,
      y: 0.9,
      reach: 2.2,
      mount: true,
      act: () => setPet(core.personaId, "dog", { ...petsFor(PLAYER_ID).dog, out: true }),
    });
  }
  // A horse or a donkey close by: something to ride.
  for (const mount of core.interior ? [] : core.herd.mounts(core.player.position, 6)) {
    if (mount.owner && mount.owner !== PLAYER_ID) continue; // someone else's horse
    list.push({
      kind: "thing",
      label: `Ride ${mountName(mount)}`,
      x: mount.x,
      z: mount.z,
      y: mount.back + 0.4,
      reach: 2.6,
      mount: true,
      act: () => ride(mount.id),
    });
  }
  // A campsite's tent: somewhere to sleep.
  for (const camp of core.interior ? [] : (core.world?.camps ?? [])) {
    for (const tent of camp.tents ?? [camp]) {
      list.push({
        kind: "thing",
        label: "Sleep in the tent",
        x: tent.mouth.x,
        z: tent.mouth.z,
        y: 1.2,
        reach: 2.2,
        act: () => core.hud?.openSleep((length) => sleepIn(tent, length)),
      });
    }
  }
  for (const thing of core.interior ? [] : [...worldThings(), ...(core.world?.camp ? [core.world.camp] : [])]) {
    list.push({
      kind: "thing",
      label: PACK.things[thing.kind].prompt,
      x: thing.x,
      z: thing.z,
      y: 1.5,
      reach: PACK.things[thing.kind].reach,
      act: () => useThing(thing),
    });
  }
  const edge = core.interior || !core.save ? null : edgeSide();
  if (edge) {
    // At the world's edge: on to the next region (right where the player stands, so it's always in reach).
    const { x, z } = core.player.position;
    list.push({
      kind: "travel",
      label: `Travel to ${regionNameAt(regionNext(core.save.region, edge))}`,
      x,
      z,
      y: 1.9,
      act: () => travel(edge),
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
        label:
          door.index === playerHomeDoor()
            ? "Your home"
            : !core.settings.interiors
              ? "Go in"
              : open
                ? "Go in"
                : "Open door",
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

// ── Regions and travel ───────────────────────────────────────────────────────

/** The seed of the region a save is in: the world's own at home. */
function regionSeed(save) {
  return save.region === HOME_REGION ? save.seed : (save.regions[save.region]?.seed ?? save.seed);
}

function homeRegionName() {
  return regionName(core.save.seed, HOME_REGION);
}

/** The name of the region at `key` (made or not yet). */
function regionNameAt(key) {
  if (key === HOME_REGION) return homeRegionName();
  return core.save.regions?.[key]?.name ?? regionName(core.save.seed, key);
}

/** Which edge of the world the player is near enough to travel across, or null. */
function edgeSide() {
  const half = (core.world?.size ?? WORLD_SIZE) / 2 - 2;
  const { x, z } = core.player.position;
  const sides = [
    ["east", x],
    ["west", -x],
    ["south", z],
    ["north", -z],
  ].filter(([, out]) => out > half - TRAVEL_REACH);
  return sides.sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

/**
 * Travels across the world's `side` edge into the next region (made the first time, from the world's seed),
 * with the party that's following. This region's setup is kept for coming back; a travel scene request is
 * saved for the AI part (encounters on the way, later). The player arrives at the facing edge.
 */
function travel(side) {
  const save = core.save;
  if (!save || core.interior || core.mode !== "walk") return;
  savePlace(true);
  const from = save.region;
  const to = regionNext(from, side);
  const party = core.crowd
    .party()
    .filter((member) => !member.waiting)
    .map((member) => ({ id: member.id, name: member.name }));
  // Anyone told to wait stays behind, out of the party.
  for (const member of core.crowd.party()) if (member.waiting) core.crowd.setFollowing(member.id, false);
  const regions = { ...save.regions };
  const setup = {
    names: save.names,
    lore: save.lore,
    groups: save.groups,
    housing: save.housing,
    furnished: save.furnished,
    place: save.place,
  };
  let homeSetup = save.homeSetup;
  if (from === HOME_REGION) homeSetup = setup;
  else regions[from] = { ...regions[from], ...setup };
  if (to !== HOME_REGION && !regions[to]) {
    const seed = `${save.seed}|${to}`;
    const landscape = landscapeWith(hashString(seed), {});
    // Arriving across the facing edge: no mountain range in the way there.
    landscape.mountains = landscape.mountains.filter((edge) => edge !== OPPOSITE[side]);
    regions[to] = { name: regionName(save.seed, to), number: Object.keys(regions).length + 2, seed, landscape };
  }
  const target = (to === HOME_REGION ? homeSetup : regions[to]) ?? {};
  const name = regionNameAt(to);
  const request = sceneRequest({
    thing: { kind: "travel", name: `the road to ${name}`, chain: [regionNameAt(from)] },
    action: "go",
    line: "",
    inside: [],
    party,
    persona: { id: "player", name: personaName() },
    hour: core.hour,
  });
  const lateral = side === "east" || side === "west" ? core.player.position.z : core.player.position.x;
  core.save = {
    ...save,
    regions,
    region: to,
    homeSetup: to === HOME_REGION ? null : homeSetup,
    names: target.names ?? {},
    lore: target.lore ?? {},
    groups: target.groups ?? null,
    housing: target.housing ?? {},
    furnished: target.furnished ?? {},
    party: party.map((member) => member.id),
    place: null,
    scenes: [...(save.scenes ?? []), request].filter(Boolean).slice(-30),
  };
  core.saves.write(core.save);
  core.hud?.closePanels();
  core.hud?.setLoading(`Travelling to ${name}…`);
  const load = ++core.worldLoad;
  setTimeout(() => {
    if (load !== core.worldLoad) return;
    const detail = buildWorld(regionSeed(core.save), null);
    arriveFrom(side, lateral);
    updateCast();
    core.crowd.restoreParty(core.save.party, core.player.position);
    core.journalAt = 0;
    Promise.race([detail, new Promise((done) => setTimeout(done, BUILD_WAIT * 1000))]).then(() => {
      if (load !== core.worldLoad) return;
      core.hud?.setLoading(null);
      resume();
    });
  }, 60);
}

/** Puts the player just inside the edge they came in by (having left across `side`), on open dry ground. */
function arriveFrom(side, lateral) {
  const half = core.world.size / 2 - 2 - TRAVEL_REACH - 2;
  const [dx, dz] = { north: [0, -1], east: [1, 0], south: [0, 1], west: [-1, 0] }[side];
  const along = Math.max(-half, Math.min(half, lateral));
  let x = dx !== 0 ? -dx * half : along;
  let z = dz !== 0 ? -dz * half : along;
  for (let step = 0; step < 60; step++) {
    if (!core.world.blocked(x, z, PLAYER_RADIUS) && heightAt(x, z) > -0.3) break;
    // Further in, and off to one side now and then, until there's room.
    x += dx * 2 + (step % 7 === 6 ? 3 : 0) * (dz !== 0 ? 1 : 0);
    z += dz * 2 + (step % 7 === 6 ? 3 : 0) * (dx !== 0 ? 1 : 0);
  }
  core.player.position.set(x, heightAt(x, z), z);
  core.player.rotation.y = Math.atan2(dx, dz);
  core.cameraYaw = core.player.rotation.y + Math.PI;
  core.freshStart = false;
  savePlace(true);
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
    if (distance > (thing.reach ?? USE_RANGE[thing.kind])) continue;
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
  if (core.mode === "ride") return dismount();
  if (core.mode !== "walk") return;
  // A hand out to whatever it is (a door, a board, a barrel); not to a person or a seat.
  if (core.target && core.target.kind !== "person" && core.target.kind !== "seat" && !core.target.mount)
    core.gesture = "interact";
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
  if (core.mode === "talk" || core.mode === "door" || core.mode === "ride" || !core.camera) return;
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
    const reach = best.reach ?? USE_RANGE[best.kind];
    if (distance <= reach) best.act();
    else if (distance < WALK_TO_LIMIT) core.walkTo = { x: best.x, z: best.z, near: reach * 0.6, then: best };
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
  // In a conversation it's the two-shot that comes closer or pulls back.
  if (core.mode === "talk") return void (core.talkZoom = Math.max(0.55, Math.min(3, (core.talkZoom ?? 1) * factor)));
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
  else core.hour = (core.hour + (dt * 24 * (core.settings.timeSpeed ?? 1)) / DAY_SECONDS) % 24;
  // The weather: off (clear), one kind always, or changing every few minutes (the same for a world each time).
  core.weatherTime = (core.weatherTime ?? 0) + dt;
  const setting = core.settings.weather ?? "off";
  core.world.setSeason(core.save?.season ?? "");
  core.world.setWeather(
    setting === "off"
      ? "clear"
      : setting === "changing"
        ? weatherAt(
            hashString(regionSeed(core.save ?? { region: HOME_REGION, seed: "" })),
            Math.floor(core.weatherTime / WEATHER_PERIOD),
          )
        : setting,
  );
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
    // (`late`: it holds where it is for that much of the time first.)
    const through = glide.late ? Math.max(0, (glide.t - glide.late) / (1 - glide.late)) : glide.t;
    const ease = through * through * (3 - 2 * through);
    position.x = glide.fromX + (glide.toX - glide.fromX) * ease;
    position.z = glide.fromZ + (glide.toZ - glide.fromZ) * ease;
    player.rotation.y = approachAngle(glide.fromAngle, glide.toAngle, ease);
    if (glide.t >= 1) {
      core.glide = null;
      glide.then?.();
    }
  } else if (core.mode === "walk") {
    // Getting up off the ground: no steps till they're on their feet.
    const { x, y } = core.clock < (core.stillUntil ?? 0) ? NO_INPUT : input;
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
      const edge = (core.world?.size ?? WORLD_SIZE) / 2 - 2;
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
  } else if (core.mode === "ride" && core.mount) {
    // Riding: the same stick and keys, moving the animal under them. It walks, gallops with Shift (or
    // the stick right out), turns less sharply than a person, and won't go where it would have to swim.
    const { x, y } = input;
    const mount = core.mount;
    // Mid-jump it carries on the way it's facing, at a canter at least, whatever the stick says (which
    // still turns it), and while its back is well up it passes over fences and benches.
    const leaping = !!core.air?.mount;
    if (x || y || leaping) {
      const sin = Math.sin(core.cameraYaw);
      const cos = Math.cos(core.cameraYaw);
      const wantX = -sin * y + cos * x;
      const wantZ = -cos * y - sin * x;
      const moveX = leaping ? Math.sin(player.rotation.y) : wantX;
      const moveZ = leaping ? Math.cos(player.rotation.y) : wantZ;
      const wading = waterAt(position.x, position.z).depth > WADE_DEPTH;
      const steered = x || y ? (input.run ? mount.gallop : mount.walk * RIDE_WALK * Math.max(0.4, input.amount)) : 0;
      const pace = (leaping ? Math.max(steered, LEAP_PACE) : steered) * (wading ? 0.5 : 1);
      const before = { x: position.x, z: position.z };
      position.x += moveX * pace * dt;
      position.z += moveZ * pace * dt;
      space.resolveCollisions(position, RIDE_RADIUS, true, leaping && core.air.height > LEAP_CLEAR);
      core.crowd.pushOut(position, RIDE_RADIUS, space);
      const edge = (core.world?.size ?? WORLD_SIZE) / 2 - 2;
      position.x = Math.max(-edge, Math.min(edge, position.x));
      position.z = Math.max(-edge, Math.min(edge, position.z));
      if (waterAt(position.x, position.z).depth > SWIM_DEPTH * 0.75) {
        position.x = before.x;
        position.z = before.z;
      }
      if (x || y)
        player.rotation.y = approachAngle(player.rotation.y, Math.atan2(wantX, wantZ), (input.run ? 4 : 6) * dt);
    }
    const speed = dt > 0 ? Math.hypot(position.x - startX, position.z - startZ) / dt : 0;
    // (In a jump: how far through its leap it is; its back's rise and fall comes back, for the rider.)
    const leap = core.air?.mount ? Math.min(1, core.air.time / MOUNT_LEAP) : null;
    const rise = core.herd.carry(mount.id, position.x, position.z, player.rotation.y, speed, leap);
    if (core.air?.mount) core.air.height = rise ?? 0;
  } else if (core.mode === "sit" && (input.x || input.y)) {
    standUp();
  }
  // Swimming, the body floats at the surface (the swim clips hold the head just above it).
  const water = core.interior ? null : waterAt(position.x, position.z);
  core.swimming = !!water && water.depth > SWIM_DEPTH && core.mode === "walk";
  // In the water the height eases between wading (feet on the bed) and floating, in step with the swim
  // pose fading in, so walking in and climbing out flow instead of jumping.
  const target = core.interior ? 0 : core.swimming ? water.level : heightAt(position.x, position.z);
  const wet = !core.interior && water && (water.depth > 0.3 || core.swimming);
  position.y = wet ? position.y + (target - position.y) * Math.min(1, dt * 6) : target;
  // Up on a bed (a seat with a `lift`), easing up onto it and back down.
  core.lift =
    (core.lift ?? 0) + ((core.mode === "sit" ? (core.seat?.lift ?? 0) : 0) - (core.lift ?? 0)) * Math.min(1, dt * 5);
  if (core.lift > 0.005) position.y += core.lift;
  // A jump: up and back down onto whatever ground is under them by then.
  if (core.air?.mount) {
    core.air.time += dt;
    if (core.air.time >= MOUNT_LEAP || core.mode !== "ride") core.air = null;
  } else if (core.air) {
    core.air.speed -= GRAVITY * dt;
    core.air.height += core.air.speed * dt;
    if (core.air.height <= 0 || core.swimming || core.mode !== "walk") core.air = null;
    else position.y = target + core.air.height;
  }
  // Up on a mount: seated at its back's height (it has a shadow of its own).
  const riding = core.mode === "ride" && core.mount;
  const seatAt = riding ? target + core.mount.back - RIDE_SEAT + (core.air?.height ?? 0) : 0;
  if (riding && core.mounting) {
    const t = core.mounting.phase === "vault" ? (core.glide?.t ?? 1) : 0;
    const up = Math.min(1, Math.max(0, (t - 0.1) / 0.5)); // a beat leaning in, then up
    // Up to its back's height and a little over, leaning in across it, then settling down astride.
    position.y = target + (seatAt - target) * up * up * (3 - 2 * up) + 0.22 * Math.sin(Math.PI * t);
    core.player.rotation.z = core.mounting.side * 0.3 * Math.sin(Math.PI * Math.min(1, t * 1.15));
  } else if (riding && !core.glide) position.y = seatAt;
  else if (riding) position.y += (seatAt - position.y) * Math.min(1, dt * 10);
  // Getting down: off its back, across and down to the ground beside it, leaning as the leg comes over.
  if (core.dismounting) {
    const t = core.glide && core.mode === "walk" ? core.glide.t : 1;
    if (t >= 1) {
      core.dismounting = null;
      core.player.rotation.z = 0;
    } else {
      const down = Math.min(1, Math.max(0, (t - 0.15) / 0.7));
      position.y = target + core.dismounting.height * (1 - down * down * (3 - 2 * down)) + 0.12 * Math.sin(Math.PI * t);
      core.player.rotation.z = -core.dismounting.side * 0.28 * Math.sin(Math.PI * t);
    }
  }
  core.shadow.visible = core.settings.shadows && !core.swimming && !riding;
  if (core.air)
    core.shadow.position.y = 0.06 - core.air.height; // the shadow stays on the ground
  else core.shadow.position.y = 0.06;
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
    const away = 2.7 * (core.talkZoom ?? 1);
    cameraTarget.set(midX + sideX * away, lookY + 0.15 + (away - 2.7) * 0.25, midZ + sideZ * away);
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
    else if (core.mode === "ride") dismount();
  }
  if (input?.take("use")) use();
  if (input?.take("jump")) jump();
  if (input?.take("rest") && core.settings.restKey) rest();
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
  const onGround = core.mode === "sit" ? (core.seat?.ground ?? core.seat?.pose ?? null) : null;
  // (Riding, it's the mount that walks: the rider sits still on it.)
  // Getting on: on foot still while stepping to the animal's side and springing up; the legs go astride
  // as they come level with its back.
  const stepping = core.mounting && (core.mounting.phase === "approach" || (core.glide?.t ?? 1) < 0.3);
  // (Getting down, they're astride till the leg is over, and their feet don't walk till they land.)
  const astride = core.dismounting && (core.glide?.t ?? 1) < 0.45;
  const still = (core.mode === "ride" && core.mounting?.phase !== "approach") || core.dismounting;
  const pose = core.character?.update(dt, still ? 0 : speed, {
    sit: core.mode === "sit" && !onGround,
    act: core.mode === "ride" ? (stepping ? null : "ride") : astride ? "ride" : onGround,
    gesture: core.gesture,
    air: !!core.air && !core.air.mount, // (a rider keeps their seat through the animal's jump)
    lookAt,
    talk: false,
    swim: core.swimming,
  });
  core.gesture = null;
  if (pose?.footstep) core.sound.footstep(0, pose.running);
  // Yours that are with you can be sent home from the chat window (not the horse you're sitting on).
  const mine = core.pets[PLAYER_ID];
  core.hud?.setPets({
    names: { dog: mine?.dog?.name ?? "", horse: mine?.horse?.name ?? "" },
    dog: !!mine?.dog && mine.dog.out !== false && !core.interior && core.mount?.id !== `pet:${PLAYER_ID}:dog`,
    horse: !!mine?.horse && mine.horse.out !== false && !core.interior && core.mount?.id !== `pet:${PLAYER_ID}:horse`,
  });
  core.hud?.setThumbs(
    onGround ?? (core.mode === "sit" ? "seat" : core.mode === "ride" ? "ride" : ""),
    core.mode === "walk" || core.mode === "sit" || core.mode === "ride",
  );

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
  if (!core.interior) {
    // Where each owner of an animal is, for it to keep up with (looked up a few times a second), and
    // now and then who has one at all (someone new in town, lore that's changed).
    if (core.clock >= (core.petsAt ?? 0)) {
      core.petsAt = core.clock + 4;
      syncPets();
    }
    if (core.clock >= (core.ownersAt ?? 0)) {
      core.ownersAt = core.clock + 0.3;
      core.owners = new Map(
        core.crowd
          .snapshot()
          .map((person) => [person.id, { x: person.x, z: person.z, inside: person.inDoor !== null || person.inRoom }]),
      );
    }
    core.owners.set(PLAYER_ID, core.player.position);
    const at = core.player.position;
    core.herd.update(dt, {
      player: at,
      owners: core.owners,
      // What a hostile animal may do about the player, and whether here (Settings: animals, and where
      // confrontations are allowed at all); and whether it's night, for the ones about only then.
      hostile: core.settings.hostileAnimals,
      safe: !aggressionAllowed(at.x, at.z),
      night: core.hour < 5.5 || core.hour >= 20.5,
    });
    for (const event of core.herd.takeEvents()) {
      const what = (PACK.animals[event.kind] ?? "the animal").replace(/^the /u, "");
      const lines = ANIMALS[event.kind]?.person ? PACK.outlaws : PACK.beasts; // (a person isn't told as a beast)
      narrate(null, pickLine(lines[event.type] ?? [], `beast:${Math.floor(core.clock)}`, { kind: what }));
      // A lunge sends them back a step (unless they're up on something, or in the middle of a move).
      if (event.type === "attack" && core.mode === "walk" && !core.glide) {
        const away = Math.atan2(at.x - event.x, at.z - event.z);
        at.x += Math.sin(away) * 1.1;
        at.z += Math.cos(away) * 1.1;
        core.space.resolveCollisions(at, PLAYER_RADIUS, true);
      }
    }
  }
  socialTick(dt);
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
    onSay: (group, text, id, name) => {
      // Only from someone near and in plain sight, and only a few at once: not a town's worth through the walls.
      const at = core.player.position;
      const far = Math.hypot(group.position.x - at.x, group.position.z - at.z);
      if (far > CHATTER_DISTANCE || core.talk.bubbleCount() >= CHATTER_AT_ONCE) return;
      if (core.space.clearSight(at.x, at.z, group.position.x, group.position.z) < 0.95) return;
      core.talk.say(group, text, 3.5, id ? nameFor(id, name) : "");
    },
    playerName: personaName(),
    playerNameFor: (id) => (theyKnow(id) ? personaName() : "you there"),
    // Someone the player said something to lately may come over about it.
    hasTopic: (id) => !!core.settings.memories && !!core.memories?.hasTopic(id, core.social?.day ?? 0),
    topicFor: (id) => (core.settings.memories ? (core.memories?.raise(id, core.social?.day ?? 0) ?? null) : null),
    onTopic: (id, name, topic) => {
      const said = /"(.+)"/u.exec(topic)?.[1];
      narrate(null, `(${nameFor(id, name)} has come over about what you said${said ? `: "${said}"` : ""}.)`);
    },
    onConfront: confronted,
    aggressionAllowed,
    playerSwimming: core.swimming,
    approach: core.settings.approach,
    approachMax: core.settings.approachMax,
  });
  core.talk?.update(dt);
  const weather = core.world.weatherNow();
  core.sound.tick(dt, { dark: core.dark, inside, rain: weather.kind === "rain" ? weather.amount : 0 });

  placeCamera(dt);
  core.interior?.room.update(dt, core.camera);

  // The use prompt over whatever is in reach.
  core.target = core.mode === "walk" && !core.walkTo ? pickTarget() : null;
  const label = core.mode === "sit" ? "Stand up" : core.mode === "ride" ? "Get down" : core.target?.label;
  const screen = core.target
    ? toScreen(core.target.mark?.x ?? core.target.x, core.target.y, core.target.mark?.z ?? core.target.z)
    : null;
  if (core.mode === "talk" || core.hud?.boardOpen) core.hud?.setPrompt(null);
  else if (core.mode === "sit" || core.mode === "ride") {
    const head = toScreen(core.player.position.x, core.player.position.y + 1.9, core.player.position.z);
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
  // Is the server part running? (Remembered; Menu → Settings → AI asks again.) Then any scene recaps waiting.
  void core.ai.status().then(() => pullRecaps());
  element.style.cssText += ";display:block;position:relative;overflow:hidden;width:100%;height:100%;";
  core.stage = document.createElement("div");
  core.stage.style.cssText = "position:absolute;inset:0;background:#bfd9ee;touch-action:none;";
  element.replaceChildren(core.stage);
  core.pinch.clear();
  core.drag = null;
  bindCamera(core.stage);

  core.hud = createHud(core.stage, {
    onMenu: openMenu,
    onAiStatus: () => core.ai.status(true),
    onSpeak: speak,
    onIllustrate: illustrateMoment,
    onAssistant: askAssistant,
    // The assistant's chat, kept with the world it's about.
    onAssistantChat: (turns) => {
      if (!core.save) return;
      core.save = { ...core.save, assistantChat: turns };
      core.saves.write(core.save);
    },
    // Who remembers anything, for the assistant's memory requests: [{ id, name, count }].
    onAssistantMemories: () =>
      (core.characters ?? [])
        .filter((person) => core.cast?.has(person.id))
        .slice(0, 40)
        .map((person) => ({ id: person.id, name: person.name, count: core.memories?.list(person.id).length ?? 0 }))
        .filter((person) => person.count),
    onAssistantBooks: () =>
      readLorebooks().then((books) =>
        books.map((book) => ({
          id: book.id,
          name: book.name,
          entries: book.entries.map((entry) => ({ id: entry.id, title: entry.title })),
        })),
      ),
    onGallery: () => (core.save ? core.ai.pictures(core.save.id) : Promise.resolve([])),
    onPictureOf: (id) => core.ai.picture(id),
    onDeletePicture: (id) => core.ai.forgetPicture(id),
    onPlanSchedule: planSchedule,
    onConnections: async () => ({
      ...(await core.ai.connections()),
      characters: (core.engineCharacters ?? []).map(({ id, name }) => ({ id, name })),
    }),
    onSceneHere: (typed) => void sceneHere(typed),
    onPicture: pictureHere,
    onRenameZone: renameZone,
    onPartyWait: (id, wait) => {
      core.crowd.setWaiting(id, wait);
      partyChanged();
    },
    onPetOut: petOut,
    onMoveHome: moveHome,
    onMoveIn: moveIn,
    onMoveOut: moveOut,
    onInviteOver: inviteOver,
    onFurnish: furnish,
    onUnfurnish: unfurnish,
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
    onLinkLore: async () => {
      const byAi = core.save?.loreLinking === "ai" || core.save?.characterLinking === "ai";
      if (byAi) {
        const save = core.save;
        const setup = await aiLoreSetup(save, (doing) =>
          core.hud?.setNotice(`The AI is setting the world up: ${doing}`),
        );
        if (core.save?.id !== save.id) return; // another world was opened meanwhile
        const cast = [...new Set([...core.save.cast, ...setup.locals.map((person) => person.id)])].slice(0, MAX_PEOPLE);
        core.save = { ...core.save, loreKeys: setup.loreKeys, loreNames: setup.loreNames, locals: setup.locals, cast };
        core.characters = peopleOf(core.save);
        core.cast = new Set(cast);
        updateCast();
        if (setup.failed.length) {
          // What came through is kept and linked; the rest stays as it was.
          await linkLore();
          core.hud?.setNotice(
            `The AI couldn't do ${setup.failed.map((part) => part.label).join(", ")} (${setup.failed[0].error}). The rest is set up; try again for what's missing.`,
          );
          return;
        }
      }
      const count = await linkLore();
      core.hud?.setNotice(
        count
          ? `Linked ${count} lore entries and character details (body, how they see you)${byAi ? ". Regenerate the world to build places the lore adds" : " by their ww: keywords"}.`
          : byAi
            ? "The AI found nothing new to set up."
            : 'No entry has a "ww:" keyword that matches a place, group or character here.',
      );
    },
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
    onSetLook: setLook,
    onSetPet: setPet,
    lookOf,
    onSetting: changeSetting,
    onRegenerate: regenerateWorld,
    onRegeneratePreview: previewRegenerate,
    onCheckKeywords: () => void checkKeywords(),
    onEditPerson: (id) => {
      const person = personData(id);
      if (person) core.hud?.editPerson(person);
    },
    onSavePerson: savePerson,
    onPersonDay: (id) => scheduleOf(id),
    onEditBook: (id, content) => {
      if (!core.save) return;
      const entries = core.save.book.entries.map((entry) => (entry.id === id ? { ...entry, content } : entry));
      core.save = { ...core.save, book: { entries } };
      core.saves.write(core.save);
    },
    onMap: drawJournalMap,
    onWaypoint: setWaypoint,
    onUse: () => {
      core.sound.unlock();
      use();
    },
    onJump: jump,
    onRest: rest,
    maxPeople: MAX_PEOPLE,
    loadingArt: `${ART}loading-bg.webp`,
  });
  core.talk = createTalk(core.hud.layer, {
    onSend: say,
    onLeave: endTalk,
    onParty: toggleParty,
    onKnowing: setKnowing,
  });
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
      onSetup: planNewWorld,
      preview: previewNewWorld,
      // Everyone New world can choose from: personas, characters, the Engine's character folders, and
      // who's chosen now (the last world's cast and persona).
      // New world starts empty: nobody from another world (each world keeps its own cast); the persona box
      // starts with the persona played last, for convenience.
      people: () => ({
        personas: core.personas ?? [],
        characters: core.engineCharacters ?? [],
        folders: core.characterFolders ?? [],
        cast: [],
        persona: core.saves.last()?.persona ?? core.personaId,
        max: MAX_PEOPLE,
      }),
      lorebooks: () => readLorebooks().then((books) => books.map((book) => ({ id: book.id, name: book.name }))),
      onRename: (id, name) => {
        core.saves.rename(id, name);
        if (core.save?.id === id) core.save = { ...core.save, name };
      },
      onDelete: deleteWorld,
      onSettings: (section) => core.hud?.openSettings(section),
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
      // Back from a scene started here: its recap may be waiting.
      if (core.props?.focusSceneOriginId) {
        void pullRecaps();
        core.props.onFocusSceneOriginHandled?.();
      }
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
