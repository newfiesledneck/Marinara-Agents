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
  Sphere,
} from "three";
import {
  blobShadow,
  listCharacterFolders,
  listCharacters,
  listPersonas,
  setAnimationStyle,
  setHeldModels,
} from "./character.js";
import { gestureSeconds, LIE_SECONDS } from "./clips.js";
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
import { createPerson, lookChoices, setGenderShares } from "./people.js";
import { checkLook } from "./looks.js";
import { approachAngle, createCrowd, MAX_PEOPLE } from "./npcs.js";
import { afloatAt, createHerd } from "./herd.js";
import { createSocial } from "./social.js";
import { ago, createMemories, heardBy, heardLines, linesHere, MEMORY, toldShares } from "./memory.js";
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
import {
  ANIMALS,
  animalKind,
  COATS,
  coatFor,
  createAnimal,
  DOG_SIZES,
  dogBody,
  dogSizeOf,
  SORT_OF,
  SWITCHES,
} from "./animals.js";
import { checkSetting, DEVICE_SETTINGS, frameLimitOf, loadSettings, saveSettings, sharedSettings } from "./settings.js";
import { createSound } from "./sound.js";
import { createTalk } from "./talk.js";
import { HOUSE_PIECES, porchPosts } from "./houses.js";
import { PORCH_HEIGHT, PORCH_OUT } from "./buildings.js";
import { kitModels, kitTexture, kitUrl } from "./kit.js";
import { createMenu } from "./menu.js";
import { checkGenders, createSaves, LOG_KEPT } from "./saves.js";
import { createStore, SHARED_SETTINGS } from "./store.js";
import { undoOnly, withoutLeftovers } from "./undo.js";
import { editableFields, reviseEdits } from "./assistant-edits.js";
import { assistantNeeds, mentioned, PARTS, pickFor, PICKS } from "./assistant-context.js";
import { createHangingSign, createNoticeboard, createSign } from "./signs.js";
import {
  besideWords,
  bordersAt,
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
import { createAi, savesRemote, styleWords } from "./ai.js";
import { createInventory, sheetFor } from "./inventory.js";
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
import { mistyMorning, seasonOn, WEATHER_LOOK, weatherAt } from "./weather.js";
import {
  assignVendors,
  checkTrades,
  checkVendorCounts,
  haggled,
  haggleOutcome,
  offerAfter,
  offerFor,
  priceAfter,
  stockNow,
  tradeId,
  tradeKinds,
  tradeSign,
  vendorKinds,
  vendorNeeds,
} from "./vendor.js";
import { canCraft, checkRecipes, craftTakes, knownRecipes, saveRecipe, toolBonus, toolFor, TOOLS } from "./craft.js";
import {
  TURN_MOVE,
  bowOf,
  castAtWords,
  foeNerve,
  foeOf,
  foeStrike,
  foeWords,
  gearWorn,
  initiativeOrder,
  lootOf,
  offhandOf,
  personWords,
  playerStrike,
  potionIn,
  proficiency,
  rolledTwice,
  slotFor,
  slotOf,
  slotsAt,
  spellAtPlayer,
  spellCost,
  spellGrown,
  spellIn,
  spellRule,
  spellStrike,
  spellWords,
  spoilsOf,
  spoilsWords,
  strikeWords,
  sumWords,
  turnBudget,
  typedDamage,
  weaponIn,
  weaponOf,
  witOf,
} from "./combat.js";
import { createSpellFx, spellColour, spellLook } from "./spellfx.js";
import { greaterCasts, mendSpell, pickSpell, roleOf, roleStats, standoff, standSpot } from "./tactics.js";
import {
  SRD_FEATS,
  abilities,
  cardBuild,
  checkBuild,
  hitDiceOf,
  passives,
  raceBonuses,
  rested,
  skillChoices,
  skillNamed,
  skillsOf,
  stylesFor,
  wildForms,
} from "./build.js";
import {
  CONDITIONS,
  afflict,
  conditionChips,
  conditionFor,
  conditionMods,
  deathSave,
  hurtConditions,
  lift,
  tickConditions,
} from "./conditions.js";
import {
  SRD_BACKGROUNDS,
  SRD_CLASSES,
  SRD_CREATURES,
  SRD_RACES,
  SRD_SLOTS,
  SRD_SPELLS,
  SRD_STYLES,
  SRD_WEAPONS,
} from "./srd.js";
import { chopTree, gatherHere, gatherRoll, GATHER_KINDS, spotKey, spotReady, spotUsed, treesDown } from "./gather.js";
import {
  applyChanges,
  attackRoll,
  bracketed,
  changeSheet,
  checkRoll,
  checkSheet,
  entryNamed,
  entryOf,
  gainXp,
  modifier,
  rollDice,
  sheetList,
  sheetWords,
  toppedUp,
  useItem,
  valueOf,
  wornMax,
} from "./sheet.js";
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
const DAY_SECONDS = 20 * 60; // a whole day in town takes 20 minutes
const START_HOUR = 9;
const USE_RANGE = { seat: 1.6, door: 1.9, person: 2.6, exit: 1.6, board: 1.9, thing: 1.9, travel: 1 };
const WEATHER_PERIOD = 240; // seconds of play between changes of the weather
const TRAVEL_REACH = 6; // metres from the world's edge where "Travel to…" shows
const OPPOSITE = { north: "south", east: "west", south: "north", west: "east" }; // every kind of usable needs one
const CHATTER_DISTANCE = 11; // metres within which townsfolk's own chatter shows over their heads
const CHATTER_AT_ONCE = 3; // bubbles up at once, chatter included
const ARRIVE_SETTLE = 3; // seconds in a place before it's told (passing through, or a misstep, isn't arriving)
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
  /** What the persona wears and carries, kept by Quartermaster when it's installed (inventory.js). */
  inventory: createInventory({
    ai: () => core.ai,
    sheet: () => sheetFor(core.save?.id, core.personaId),
    persona: () => ({ personaId: core.personaId, name: personaName() }),
    settings: () => core.settings,
    onReady: () => {
      core.hud?.setInventory(core.inventory.ready() || core.settings.sheet);
      void readItems();
    },
  }),
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
  store: null, // where saves are kept: with the Engine, or in the browser (store.js)
  saves: null, // the saved worlds (saves.js), through it
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
const sightSphere = new Sphere();
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
    // Antialiasing ("Smooth edges") is fixed when the renderer is made. Left to itself it is on where
    // pixels are big (a picture no finer than the page) and a graphics card draws them; on a high-density
    // screen at full resolution, or on the processor, it costs more than it shows.
    const smooth = core.settings.smooth;
    const antialias =
      smooth === "on" ||
      (smooth !== "off" && pixelRatio(window.innerWidth, window.innerHeight) <= 1 && !softwareOnly());
    core.renderer = new WebGLRenderer({ antialias, powerPreference: "high-performance" });
  } catch (error) {
    console.warn("[wanderworld] WebGL unavailable", error);
    core.failed = "This device can't draw the 3D world (WebGL is unavailable).";
    return false;
  }
  core.renderer.domElement.style.cssText = "position:absolute;inset:0;display:block;width:100%;height:100%;";
  core.camera = new PerspectiveCamera(60, 1, 0.1, 160);
  core.software = drawsInSoftware(core.renderer.getContext());
  return true;
}

/** True when the browser draws WebGL on the processor instead of the graphics card (hardware acceleration
 *  off, or no usable driver): then everything is many times slower, and no setting here can fix it. */
function drawsInSoftware(gl) {
  try {
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const name = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
    return /swiftshader|llvmpipe|softpipe|software|basic render/iu.test(name);
  } catch {
    return false; // can't tell: say nothing
  }
}

/** The same, asked before there is a renderer: of a context made for the question and let go again. */
function softwareOnly() {
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    if (!gl) return false;
    const software = drawsInSoftware(gl);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return software;
  } catch {
    return false;
  }
}

/** The render resolution, as a pixel ratio: "100" is the screen's own; the rest are the picture's height in
 *  pixels (its shorter side, on a screen held upright), never more than the screen has. */
function pixelRatio(width, height) {
  const native = window.devicePixelRatio || 1;
  if (core.settings.resolution === "100") return native;
  return Math.min(native, Number(core.settings.resolution) / Math.max(1, Math.min(width, height)));
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

// ── Settings ─────────────────────────────────────────────────────────────────

/**
 * The shares of men, women and the third gender among people nothing says the gender of, and its name:
 * the world's own (`save.genders`), or what Settings → People → Genders has for a world without.
 */
function gendersNow(save = core.save) {
  if (save?.genders) return save.genders;
  const { genderMale: male, genderFemale: female, genderCustom: custom, genderName } = core.settings;
  return { male, female, custom, name: genderName || "" };
}

function applySettings() {
  const { settings } = core;
  core.input?.setKeys(settings.keys ?? ""); // (the player's own keys: Settings → Controls → Keys)
  // Quartermaster's window closes at a press anywhere outside it, except on one of its own launch
  // buttons. Marked as one, the whole game is left alone, so walking and talking don't close the window.
  // ponytail: this leans on Quartermaster's "qm-launch" class (its dock's outside-press check). If that
  // changes the window just closes again; the fix then is a "pinned" option asked of Quartermaster.
  core.stage?.classList.toggle("qm-launch", settings.inventory === true && settings.inventoryPinned === true);
  setGenderShares(gendersNow());
  core.world?.setDensity(settings.density, settings.rockDensity);
  core.world?.setDrawDistance(settings.drawDistance);
  core.world?.setTreeReach?.(settings.treeDetail);
  core.world?.setGroundSimple?.(settings.ground === "simple");
  if (core.camera) {
    core.camera.far = settings.drawDistance + 20;
    core.camera.updateProjectionMatrix();
  }
  setAnimationStyle(settings.animation);
  core.hud?.setInventory(core.inventory.ready() || settings.sheet);
  core.shadow.visible = settings.shadows;
  core.crowd.setShadows(settings.shadows);
  if (core.relations) refreshNames();
  else core.crowd.setNamesVisible(settings.names !== "none");
  core.crowd.setDressed(settings.people === "kit");
  core.sound.setEnabled(settings.sound);
  core.sound.setVolume(settings.volume);
  core.hud?.setSettings(settings, gendersNow().name);
  resize();
}

function changeSetting(name, value) {
  const checked = checkSetting(name, value);
  if (checked === undefined) return;
  core.settings = { ...core.settings, [name]: checked };
  if (name === "people") void choosePersona(core.personaId); // redress the player too
  if (["nature", "props", "buildings"].includes(name) && core.world) buildWorld(core.seed, currentPlace()); // redrawn
  // How many animals, or which kinds: the world's are counted out again, once the slider has stopped.
  if (/^animal|^loreAnimals$/u.test(name) && core.world) {
    clearTimeout(core.restock);
    core.restock = setTimeout(restockHerd, 350);
  }
  saveSettings(core.settings);
  // The game's and the AI's settings are the same in every browser: the Engine keeps them.
  if (!DEVICE_SETTINGS.has(name)) core.store.setItem(SHARED_SETTINGS, JSON.stringify(sharedSettings(core.settings)));
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
  // Its vendors counted out as New world or Regenerate asked, once its places have their names.
  if (own && core.save.vendorsPending) {
    const world = core.world;
    void Promise.resolve(core.linking)
      .catch(() => null)
      .then(() => core.world === world && countVendorsOut());
  }
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
  // The tools people hold are the props pack's own (an axe, a pickaxe), with detailed props on.
  if (core.settings.props)
    loads.push(
      kitModels("tools", ["axe-bronze", "pickaxe-bronze"])
        .then((models) => setHeldModels({ axe: models.get("axe-bronze"), pick: models.get("pickaxe-bronze") }))
        .catch((error) => console.warn("[wanderworld] the tools' models failed to load", error)),
    );
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
    // The market's stalls dressed by their trade, and the painted signs for shops' doors (the kit's
    // market set): loaded with the props, so a stall is drawn once, as what it is.
    const looks = PACK.vendors.looks;
    const stallModels = core.settings.vendors && core.save ? stallLooks() : [];
    const market = [...new Set([...stallModels.filter(Boolean), ...Object.values(looks).map((look) => look.sign)])];
    loads.push(
      Promise.all([kitModels("props", world.propModels), kitModels("market", market).catch(() => new Map())])
        .then(([models, extra]) => {
          if (core.world !== world) return;
          if (stallModels.every((model) => !model || extra.has(model))) world.dressStalls(stallModels);
          world.addProps(new Map([...models, ...extra]));
          core.marketModels = extra;
          core.propModels = models;
          if (core.zones) placeSigns(); // (the painted signs, now they're here)
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
  // Not while the Engine's saves are being read again, nor over a world another browser has played since.
  if (core.syncing || core.staleWorld === core.save.id) return;
  // Nor while another world is being opened: `core.save` is already that world's, and the player, the
  // party and the place are still the one being left (playWorld).
  if (core.opening) return;
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

/**
 * Reads the Engine's saves again (store.js `pull`): this browser may have been left open while another
 * one played. A world in memory that was played elsewhere since is loaded again from what was kept
 * there (at once when it's being played; from the main menu, when it's next played).
 * ponytail: the newer save wins whole; nothing is merged. Two browsers playing one world at the same
 * moment still write over each other; that needs a revision on each save, checked by the server part.
 */
async function syncSaves() {
  if (!core.store?.ready || core.syncing) return;
  core.syncing = true;
  try {
    await core.store.pull();
    const kept = core.save ? core.saves.read(core.save.id) : null;
    if (core.world && kept && kept.playedAt > core.save.playedAt + 1000) {
      core.staleWorld = kept.id;
      if (!core.paused) {
        playWorld(kept.id);
        core.hud?.setNotice("This world was played in another browser since, so it was loaded from there.");
      }
    }
  } catch (error) {
    console.warn("[wanderworld] the Engine's saves couldn't be read again", error);
  } finally {
    core.syncing = false;
  }
}

/** The Menu's Save world: saved now, and sent to the Engine now. */
async function saveWorldNow() {
  if (!core.save || !core.world) return;
  savePlace(true, captureThumbnail());
  await core.store.flush();
  core.hud?.setNotice(
    core.store.pending
      ? "Saved in this browser, but the Engine didn't take it. It tries again with the next save: check the Engine is running."
      : `Saved: ${core.save.name}.`,
  );
}

/** The Menu's Load world: the saved worlds as the Engine has them now, last played first. */
async function worldsNow() {
  await syncSaves();
  return core.saves.list().map((world) => ({
    id: world.id,
    name: world.name,
    played: world.playedAt ? new Date(world.playedAt).toLocaleString() : "",
    current: world.id === core.save?.id,
  }));
}

/** Leaves this world (saved) for saved world `id`. */
function switchWorld(id) {
  if (!core.saves.read(id)) return void core.hud?.setNotice("That world isn't saved any more.");
  if (id === core.save?.id && core.staleWorld !== id) return void core.hud?.setNotice("You're in that world now.");
  if (core.mode === "talk") endTalk();
  if (core.save && core.world) savePlace(true, captureThumbnail());
  playWorld(id);
}

/** Plays saved world `id`: back where the player left it, with its persona and cast. */
function playWorld(id) {
  const save = core.saves.read(id);
  if (!save) return;
  core.saves.setLast(id);
  // (One another browser has played since isn't carried on with, nor saved over: it's loaded again.)
  const stale = core.staleWorld === id;
  if (core.save?.id === id && core.world && !stale) {
    resume(); // the world in memory is this one: just carry on
    return;
  }
  savePlace(true);
  core.staleWorld = null;
  // This world's bodies (an older world starts from the ones chosen before worlds kept their own).
  core.bodies = { ...(save.bodies ?? core.legacyBodies ?? {}) };
  if (!save.bodies) {
    save.bodies = { ...core.bodies };
    core.saves.write(save);
  }
  core.looks = { ...(save.looks ?? {}) };
  core.pets = { ...(save.pets ?? {}) };
  // From here till this world is built nothing is saved (savePlace): what's on screen is the last one.
  core.opening = true;
  core.paused = true;
  core.save = save;
  void core.inventory.refresh(); // what the persona wears in this world, for the AI
  setGenderShares(gendersNow()); // this world's own, before its people are made
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
    core.opening = false; // (the world, the player and the party are this world's now)
    const shown = () => {
      if (load !== core.worldLoad) return;
      core.hud?.setLoading(null);
      resume();
      void pullRecaps();
      // The chat as it was left in this world.
      core.momentLog = save.log ?? [];
      core.toldPlaces = {};
      core.looks = new Map();
      core.peopleHereKey = null;
      core.arriveZone = null;
      core.hud?.illustrate.reset();
      showChat();
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
          genders: gendersNow(save),
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
    genders = null,
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
    genders,
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
  vendorCounts = null,
  writeLore = false,
  newPeople = 0,
  ages = null,
  genders = null,
}) {
  const save = core.saves.create({ name: name || suggestName(), seed });
  if (!save) return;
  save.setting = setting;
  save.ages = ages ?? { min: null, max: null };
  save.genders = checkGenders(genders);
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
  save.vendorCounts = checkVendorCounts(vendorCounts, PACK.vendors.kinds);
  save.vendorsPending = Object.keys(save.vendorCounts).length > 0;
  save.needs = vendorNeeds(await worldNeeds(save), save.vendorCounts);
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
 * place in the new layout (zones.js `remapZones`). The player starts again at the square. `changes`: New
 * world's choices to build it with now ({ settlement: "city", farms: "two" }; what isn't named stays).
 * `vendorCounts`: how many of each trade it's to have (null: as it was told before).
 */
async function regenerateWorld(reshuffle = false, size = null, newSeed = null, changes = {}, vendorCounts = null) {
  const save = core.save;
  if (!save) return;
  if (save.region !== HOME_REGION) {
    core.hud?.setNotice(`Regenerating rebuilds the home region. Travel back to ${homeRegionName()} first.`);
    return;
  }
  savePlace(true);
  const changed = Object.keys(changes ?? {}).length > 0;
  const choices = { ...(core.save.choices ?? choicesOf(core.save.landscape)), ...changes };
  const seed = reshuffle ? (newSeed ?? `world-${Date.now().toString(36)}`) : core.save.seed;
  const counts = checkVendorCounts(vendorCounts ?? core.save.vendorCounts, trades());
  // What its lorebooks need now (they may have grown since) and its vendors, on top of its land.
  const needs = vendorNeeds(await worldNeeds(core.save), counts);
  if (core.save?.id !== save.id) return; // another world was opened meanwhile
  const worldSize = size && Object.hasOwn(WORLD_SIZES, size) ? size : core.save.worldSize;
  // (A world made with its size among its choices is built for the size it's given now: one of everything
  // needs a Massive one.)
  const sized = size || choices.size || choices.everything ? { ...choices, size: worldSize } : choices;
  const land = core.save.choices || reshuffle || changed ? landscapeWith(hashString(seed), sized) : core.save.landscape;
  const landscape = landscapeNeeds(checkLandscape(land, hashString(seed)), needs, hashString(seed));
  const next = {
    ...core.save,
    seed,
    landscape,
    choices: core.save.choices || changed ? sized : core.save.choices,
    needs,
    worldSize,
    place: null,
    vendorCounts: counts,
    vendorsPending: true,
  };
  // (More shops for its vendors, or other needs, take the place of houses: its places move then too.)
  const built = JSON.stringify(needs) !== JSON.stringify(core.save.needs ?? {});
  if ((reshuffle || changed || built) && core.zones) {
    // The setup stays: every place's name, lore and groups go to the same kind of place in the new layout.
    const made = createWorld(hashString(seed), landscape, needs, worldSize);
    const map = remapZones(core.zones, buildZones(made.layout, hashString(seed)));
    made.dispose();
    Object.assign(next, carrySetup({ ...core.save, groups: core.save.groups ?? null }, map));
    if (reshuffle) next.waitingPlacements = [];
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
function previewRegenerate(canvas, { reshuffle, size, seed, changes = {} }) {
  const save = core.save;
  if (!save) return;
  const used = reshuffle ? seed : save.seed;
  const worldSize = size ?? save.worldSize;
  const changed = Object.keys(changes).length > 0;
  const base = { ...(save.choices ?? choicesOf(save.landscape)), ...changes };
  const choices = size || base.size || base.everything ? { ...base, size: worldSize } : base;
  const land = save.choices || reshuffle || changed ? landscapeWith(hashString(used), choices) : save.landscape;
  const landscape = landscapeNeeds(checkLandscape(land, hashString(used)), save.needs, hashString(used));
  drawMap(canvas, previewMap(hashString(used), landscape, worldSize));
}

/** What Regenerate starts from: this world's choices, its size, and how many of each trade it was told to have. */
function regenerateNow() {
  const all = trades();
  return {
    choices: core.save?.choices ?? choicesOf(core.save?.landscape),
    size: core.save?.worldSize ?? "normal",
    counts: checkVendorCounts(core.save?.vendorCounts, all),
    kinds: Object.entries(all).map(([id, kind]) => ({ id, label: kind.label })),
  };
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
  core.inventory.forget(id);
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
/**
 * What a building's sign says: its own name once it has one; else, for a plain shop or anything whose
 * trades were set by hand, its trade ("Apothecary", "Smith & Tailor"); else the sign it was built with.
 * "" for a building with no sign.
 */
function signWords(zone) {
  const names = placeNames();
  if (typeof names[zone.id] === "string" && names[zone.id].trim())
    return signOf({ ...zone, sign: zone.sign ?? zone.name }, names) ?? "";
  const saved = core.save?.vendors?.[zone.id];
  if (core.settings.vendors && (zone.buildingKind === "shop" || Array.isArray(saved?.kinds))) {
    const all = trades();
    const trade = tradeSign(vendorKinds(zone, zone.name, saved, all), all);
    if (trade) return trade;
  }
  return zone.sign ?? "";
}

/**
 * The kit's painted sign for a vendor's trade (an anvil, a potion, a tankard, a loaf), hung out from the
 * wall at `spot`; null when the building isn't a vendor, its trade has none, or the kit's aren't loaded.
 */
function paintedSign(zone, spot, angle) {
  if (!core.settings.vendors || !core.marketModels) return null;
  const all = trades();
  const own = vendorKinds(zone, placeNames()[zone.id] ?? zone.name, core.save?.vendors?.[zone.id], all);
  const model = own.map((kind) => PACK.vendors.looks[kind]?.sign).find(Boolean);
  const parts = model && core.marketModels.get(model);
  if (!parts) return null;
  const mesh = new Group();
  for (const part of parts) mesh.add(new Mesh(part.geometry, part.material));
  // (The model hangs along its own +x from a bracket at its origin: turned to stand out from the wall.)
  // (On an overhang's post it's smaller, and hung so its top is under the eave.)
  const size = spot.low ? 0.6 : 0.75;
  mesh.position.set(spot.x, spot.y - (spot.low ? 0.61 * size : 0.25), spot.z);
  mesh.rotation.y = angle - Math.PI / 2;
  mesh.scale.setScalar(size);
  return { mesh, setWords() {}, dispose: () => mesh.removeFromParent() };
}

function placeSigns() {
  for (const sign of core.signs) sign.dispose();
  core.signs = [];
  for (const zone of core.zones.zones) {
    if (zone.kind !== "building" || !signWords(zone)) continue;
    const door = core.world.doors[zone.door];
    if (!door) continue;
    // Above the doorframe, flat on the wall: the step is 0.35 m out from it.
    const back = 0.29;
    const sign = createSign({
      x: door.step.x - Math.sin(door.angle) * back,
      y: heightAt(door.step.x, door.step.z) + 2.84,
      z: door.step.z - Math.cos(door.angle) * back,
      angle: door.angle,
      words: signWords(zone),
      boardUrl: `${ART}sign-wood.webp`,
    });
    if (!sign) return; // no canvas here
    sign.zone = zone;
    core.world.scene.add(sign.mesh);
    core.signs.push(sign);
    // The tavern, shops and smithy also hang a sign out over the sidewalk beside the door, on one of
    // the painted boards.
    if (!HANGING_SIGNS.has(zone.buildingKind) && !Array.isArray(core.save?.vendors?.[zone.id]?.kinds)) continue;
    const side = hashString(zone.id) % 2 ? 1 : -1;
    const along = 1.05 * side; // at the edge of the door's segment, clear of its windows and awnings
    const spot = {
      x: door.step.x - Math.sin(door.angle) * back + Math.cos(door.angle) * along,
      y: heightAt(door.step.x, door.step.z) + 3.3,
      z: door.step.z - Math.cos(door.angle) * back - Math.sin(door.angle) * along,
      low: false,
    };
    // Under an overhang the wall above the door is behind its roof: the sign hangs from one of the
    // overhang's posts instead, the nearest on that side that isn't beside the door, just under the eave.
    const porch = door.spec?.style?.porch;
    if (porch === "front" || porch === "door") {
      const [ax, az] = [Math.cos(door.angle), -Math.sin(door.angle)]; // along the front
      const doorX = (door.step.x - door.centre.x) * ax + (door.step.z - door.centre.z) * az;
      const wanted = doorX + side * 2;
      const posts = porchPosts(porch, door.spec.width, doorX).filter((x) => Math.abs(x - doorX) >= 0.9);
      if (posts.length) {
        const post = posts.reduce((best, x) => (Math.abs(x - wanted) < Math.abs(best - wanted) ? x : best));
        const out = PORCH_OUT - 0.35 + 0.08; // from the doorstep to the outer face of the posts
        spot.x = door.step.x + Math.sin(door.angle) * out + ax * (post - doorX);
        spot.z = door.step.z + Math.cos(door.angle) * out + az * (post - doorX);
        spot.y = heightAt(door.step.x, door.step.z) + PORCH_HEIGHT - 0.12;
        spot.low = true;
      }
    }
    // A vendor whose trade has a painted sign in the kit hangs that out; the rest, a board with their name.
    const painted = paintedSign(zone, spot, door.angle);
    const hanging =
      painted ??
      createHangingSign({
        ...spot,
        angle: door.angle,
        words: signWords(zone),
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
        fixed ? "(You rest. Time is standing still: Settings → World.)" : pickLine(PACK.sleep, `${core.clock}`, words),
      );
      // (A sleep restores HP and mana in full, where resting restores at all.)
      if (core.save && Object.keys(core.save.slotsUsed ?? {}).length) {
        // (A long rest: spell slots, what the class can call on, and half the hit dice.)
        core.save = {
          ...core.save,
          slotsUsed: rested(core.save.slotsUsed, "long", playerClass(), valueOf(sheetNow(), "level")),
        };
        core.saves.write(core.save);
      }
      if (core.settings.sheet && core.settings.restRestores) {
        setSheet(toppedUp(sheetNow()));
        core.hud?.refreshInventory?.();
      }
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
 * streets, not for a place told fewer than Settings → "Visits before a place is told again" visits ago,
 * and not hard on the last telling (Settings → "Wait between places told"): walking round town says
 * little, coming out of the forest into it says something. Returns false when the place is still to be
 * told (it's too soon after the last telling, or a moment is being told): the caller asks again while
 * you stay, so where you end up is told once the wait is over, and places run through aren't.
 */
function arrive(zone, names) {
  const save = core.save;
  if (!save || core.interior || (core.settings.narration ?? "lines") === "off") return;
  if (zone.kind === "street" || zone.kind === "road") return; // getting about isn't arriving
  // Not the same few places over again (going round town), and not one place hard on another.
  // (toldPlaces: each place told, with the visits to it since. A visit is counted once, however often this asks.)
  const told = (core.toldPlaces ??= {});
  if (core.visitAt !== core.zoneSince) {
    core.visitAt = core.zoneSince;
    if (zone.id in told) told[zone.id]++;
  }
  if (zone.id in told && told[zone.id] < core.settings.arriveVisits) return;
  if (core.clock - (core.toldAt ?? -99) < core.settings.arriveGap || core.momentBusy) return false;
  void tellPlace(zone, names);
}

/**
 * Tells the place (see `arrive`), and counts it as told now. Resolves once the line is in the chat.
 * `verb`: what the player is doing there, for the model ("comes into", or "looks round" when already there).
 */
async function tellPlace(zone, names, verb = "comes into") {
  const save = core.save;
  (core.toldPlaces ??= {})[zone.id] = 0;
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
  const beside = besideNow(zone)
    .filter((entry) => names[entry.id])
    .map((entry) => `, ${besideWords(entry, names[entry.id])}`)
    .join("");
  const done = await runMoment({ action: `${verb} ${names[zone.id]}${beside}, where ${company}`, source: "arrive" });
  if (!done && line) narrate(null, line, [], true);
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
      genders: gendersNow(save),
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
  for (const sign of core.signs ?? []) sign.setWords(signWords(sign.zone));
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

/**
 * Where everyone lives and works now, by id: { home, work (zone ids, or null), owner }. What was set by
 * hand (`save.housing`), and for anyone it wasn't, where the world put them (the crowd's own choice).
 */
function livedHousing() {
  const byDoor = new Map(
    (core.zones?.zones ?? [])
      .filter((zone) => zone.kind === "building" && zone.door !== null && zone.door !== undefined)
      .map((zone) => [zone.door, zone.id]),
  );
  const set = core.save?.housing ?? {};
  const out = {};
  for (const person of core.crowd?.snapshot() ?? []) {
    out[person.id] = {
      home: set[person.id]?.home ?? byDoor.get(person.home) ?? null,
      work: set[person.id]?.work ?? byDoor.get(person.work) ?? null,
      owner: set[person.id]?.owner === true,
    };
  }
  for (const [id, entry] of Object.entries(set))
    out[id] ??= { home: entry.home ?? null, work: entry.work ?? null, owner: entry.owner === true };
  return out;
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
  if (!core.ai.known()?.plans)
    return "Wanderworld isn't fully loaded yet: restart the Engine (needed once after installing or updating Wanderworld).";
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
  // (A season set by hand begins today, for seasons that turn.)
  const since = "season" in fields ? { seasonSince: core.social?.day ?? null } : {};
  core.save = { ...core.save, ...fields, ...since };
  core.saves.write(core.save);
  if ("population" in fields) restockHerd(); // this world's own numbers of animals
  if ("genders" in fields) applySettings(); // the shares, and the third gender's name where it's shown
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
/**
 * The places the player is beside without being in them (zones.js `bordersAt`), when `zone` is where they
 * stand: none indoors, for anywhere else, or with Settings → World → Places → "Places you're beside" off.
 */
function besideNow(zone) {
  const at = core.player?.position;
  if (!core.zones || !at || core.interior || !core.settings.besidePlaces) return [];
  return zoneAt(core.zones, at.x, at.z) === zone ? bordersAt(core.zones, at.x, at.z, zone) : [];
}

function loreSources(zone, names = {}) {
  const chain = core.zones ? chainOf(core.zones, zone) : [];
  const people = new Map();
  if (core.talking) people.set(core.talking.id, `${core.talking.name} (talking)`);
  for (const member of core.crowd.party())
    if (!people.has(member.id)) people.set(member.id, `${member.name} (in your party)`);
  return [
    ...[...people].map(([id, label]) => ({ id: `character:${id}`, label })),
    ...chain.map((at) => ({ id: at.id, label: names[at.id] ?? at.name })),
    // (And of the places they're beside: a river's lore on its bank, though the bank is the forest's.)
    ...besideNow(zone).map((at) => ({ id: at.id, label: `${names[at.id] ?? at.name} (beside you)` })),
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
    if (arrive(zone, names) !== false) core.arriveZone = zone.id;
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
    showFelled();
    showBeaten();
    core.hud?.setHotbar(
      "1234567890"
        .split("")
        .filter((key) => core.save?.hotkeys?.[key])
        .map((key) => ({ key, label: hotkeyLabel(core.save.hotkeys[key]) })),
    );
    {
      const spells = fighting() ? spellsNow() : [];
      core.hud?.setSpells(
        spells.map((entry) => ({
          id: entry.id,
          name: entry.name,
          cost: entry.spell.cost,
          // (Where spells take spell slots, the slot's level stands where the mana would.)
          slot: slotsShown() && entry.spell.level > 0 ? entry.spell.level : 0,
          slotted: !!slotsShown() && entry.spell.level >= 0,
          mark: entry.spell.reaction ? "" : costMark(entry.spell.bonus ? "bonus" : "action"),
        })),
        readySpell(spells)?.id ?? "",
      );
    }
    core.hud?.setActions(actionGroups());
    core.hud?.setShop(vendorHere()?.title ?? "");
    core.hud?.setGather([
      ...gatherOptions(zone).map((kind) => ({ kind, label: GATHER_KINDS[kind].label })),
      // (Something beaten at your feet can be picked up and carried: put down again with the prompt.)
      ...(core.carrying || core.interior ? [] : core.herd.bodies(core.player.position, 2.6))
        .slice(0, 1)
        .map((body) => ({
          kind: `carry:${body.id}`,
          label: `Carry the ${(PACK.animals[body.kind] ?? "the creature").replace(/^the /u, "")}`,
        })),
    ]);
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
      genders: gendersNow(),
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
  for (const sign of core.signs) if (sign.zone.id === id) sign.setWords(signWords(sign.zone));
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
          content: typeof entry.content === "string" ? entry.content : "",
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
  if (body === "male" || body === "female" || body === "custom") core.bodies[id] = body;
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

/** What Settings → Creatures says, as the herd takes it: how many of each sort, and the kinds there are none of. */
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

/** Counts the world's animals out again after a change in Settings → Creatures. */
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

/** Calls your dog or horse (`role`) to you, wherever it has got to (from home, too). */
function petCall(role) {
  const pet = petsFor(PLAYER_ID)[role];
  if (!core.save || !pet) return void core.hud?.setNotice(`You have no ${role} of your own.`);
  if (core.interior) return void core.hud?.setNotice(`Your ${role} can't come in here.`);
  if (core.mount?.id === `pet:${PLAYER_ID}:${role}`) return;
  if (pet.out === false) petOut(role, true);
  else narrate(null, `(You call ${pet.name || `your ${role}`} to you.)`);
  const { x, z } = core.player.position;
  core.herd.call(`pet:${PLAYER_ID}:${role}`, { x, z });
}

/** This world's details, for the Menu's This world: [{ label, value, copy }]. */
function worldDetails() {
  const save = core.save;
  if (!save) return [];
  const sheet = sheetFor(save.id, core.personaId);
  const cast = peopleOf(save).filter((person) => save.cast.includes(person.id));
  const books = (save.lorebooks ?? []).map((id) => core.lorebooks?.find((book) => book.id === id)?.name ?? id);
  const pets = partyAnimals()
    .filter((pet) => pet.mine)
    .map((pet) => `${pet.label} (${pet.out ? "with you" : "at home"})`);
  const day = (time) => (Number.isFinite(time) ? new Date(time).toLocaleDateString() : "");
  return [
    { label: "Name", value: save.name },
    { label: "World ID", value: save.id, copy: true },
    sheet && core.inventory.ready() && { label: "Quartermaster sheet (scope)", value: sheet.scope, copy: true },
    sheet && core.inventory.ready() && { label: "Quartermaster sheet (owner)", value: sheet.owner, copy: true },
    { label: "You play", value: personaName() },
    { label: "Map seed", value: save.seed, copy: true },
    {
      label: "Map",
      value: Object.entries(save.choices ?? {})
        .filter(([, choice]) => typeof choice === "string" || typeof choice === "number")
        .map(([what, choice]) => `${what}: ${choice}`)
        .join(", "),
    },
    {
      label: "Land",
      value: [
        save.landscape?.river?.side && `a river to the ${save.landscape.river.side}`,
        save.landscape?.mountains?.length && `mountains to the ${save.landscape.mountains.join(" and ")}`,
        ...Object.entries(
          (save.landscape?.outposts ?? []).reduce(
            (counts, outpost) => ({ ...counts, [outpost.kind]: (counts[outpost.kind] ?? 0) + 1 }),
            {},
          ),
        ).map(([kind, count]) => `${kind} × ${count}`),
      ]
        .filter(Boolean)
        .join(", "),
    },
    { label: "Region you're in", value: regionNameAt(save.region) },
    { label: `Characters (${cast.length})`, value: cast.map((person) => person.name).join(", ") },
    {
      label: "Travelling with you",
      value: core.crowd
        .party()
        .map((member) => member.name)
        .join(", "),
    },
    { label: "Your animals", value: pets.join("; ") },
    { label: `Lorebooks (${books.length})`, value: books.join(", ") },
    { label: "Setting", value: save.setting ?? "" },
    { label: "Created", value: day(save.createdAt) },
  ].filter((row) => row && row.value);
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
      body: core.bodies[id] ?? "auto",
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
  if (waterAt(x, z).depth > mount.back * 0.8) return void core.hud?.setNotice("It's too deep to get down here.");
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
      : `sits down on ${seat.what ?? "a seat"}`;
  later(0.6, () => void runMoment({ action, needListeners: true, source: "seat" }));
}

function standUp() {
  const seat = core.seat;
  if (!seat || core.downed) return; // (beaten and staying down: Respawn gets them up)
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
/** How fast a jump leaves the ground: everyone's the same, or (a setting) by Strength, the SRD's high jump of 3 feet and the modifier. */
function jumpSpeed() {
  if (!core.settings.jumpByStrength || !core.save) return JUMP_SPEED;
  const sheet = sheetNow();
  const strength = modifier(valueOf(sheet, "strength") + (wornNow(sheet).strength ?? 0));
  return Math.sqrt(2 * GRAVITY * Math.max(0.3, Math.min(3, (3 + strength) * 0.3)));
}
const MOUNT_LEAP = 1.25; // seconds a ridden animal's jump takes: its own leap, start to landing
function jump() {
  // On a horse or a donkey, it jumps: its own leap, carrying on the way it's going, the rider with it.
  if (core.mode === "ride") {
    if (core.mount && !core.air && !core.glide) core.air = { height: 0, time: 0, mount: true };
    return;
  }
  if (core.mode !== "walk" || core.swimming || core.air || core.glide || core.clock < (core.stillUntil ?? 0)) return;
  core.air = { height: 0, speed: jumpSpeed() };
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
      ? "All names are shown (Menu → Settings → People), so there are no strangers."
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
        core.hud?.setNotice("Aggressive approaches are off. Menu → Settings → People turns them back on.");
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
    genderName: gendersNow().name,
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
async function askAssistant(chat, options = {}) {
  // The last twelve turns of the chat. For a provider's prompt cache, twelve to nineteen: where they start
  // moves on only every eighth turn, so what's sent begins the same way for several messages running.
  const history = core.settings.promptCache
    ? chat.slice(Math.max(0, Math.floor((chat.length - 12) / 8) * 8))
    : chat.slice(-12);
  const save = core.save;
  if (!save || !core.zones) throw new Error("Open a world first: the assistant works on the world you're in.");
  if (!(await core.ai.status())?.assistant)
    throw new Error(
      "Wanderworld isn't fully loaded yet: restart the Engine (needed once after installing or updating Wanderworld).",
    );
  const pick = PICKS.find((entry) => entry.id === options.pick) ?? null;
  // Where people really live and work, and the text of the player's lorebooks (for the lore tied here).
  const lived = livedHousing();
  const lorebooks = new Map(((await readLorebooks().catch(() => [])) ?? []).map((book) => [book.id, book]));
  const tiedLore = (target) =>
    (save.lore[target] ?? [])
      .filter((tie) => tie.lorebookId !== "world")
      .map((tie) => {
        const book = lorebooks.get(tie.lorebookId);
        const found = book?.entries.find((entry) => entry.id === tie.entryId);
        return found?.content ? { title: found.title, book: book.name, content: found.content } : null;
      })
      .filter(Boolean);
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
  // oldest, that an edit names it by.
  const forMemories = pick?.picker === "memories";
  if (forMemories) core.assistantMemoryOf = Array.isArray(options.memoryOf) ? options.memoryOf : null;
  const lookedMemories = new Set(); // people whose memories it asked to see
  const today = core.social?.day ?? 0;
  let memoryIds = {};
  const memoriesNow = () => {
    const chosen = forMemories
      ? core.assistantMemoryOf
      : named.size || lookedMemories.size
        ? cast.filter((person) => named.has(person.name) || lookedMemories.has(person.id)).map((person) => person.id)
        : (core.assistantMemoryOf ?? null);
    const remembering = cast
      .filter((person) => !chosen || chosen.includes(person.id))
      .map((person) => ({ person, all: (core.memories?.list(person.id) ?? []).reverse() }))
      .filter(({ all }) => all.length);
    // (Whoever was ticked: all of theirs. Otherwise the newest of each, 600 in all.)
    const most = forMemories
      ? Infinity
      : Math.max(15, Math.min(150, Math.floor(600 / Math.max(1, remembering.length))));
    memoryIds = {};
    return remembering.map(({ person, all }) => {
      memoryIds[person.id] = all.map(({ day, text }) => ({ day, text }));
      return {
        name: person.name,
        lines: all
          .map(
            (memory, at) =>
              `m${at + 1} (${ago(memory.day, today)}${memory.pinned ? ", pinned" : memory.kept ? ", lasting" : ""}) ${memory.text}`,
          )
          .slice(-most),
      };
    });
  };
  if (forMemories && !memoriesNow().length) throw new Error("Nobody chosen remembers anything yet.");
  // Lore it can look up: this world's own and the lorebooks chosen for it. Titles go with every request;
  // an entry's text goes when it asks for it, by title or by words.
  const loreBooks = await chosenBooks(save).catch(() => []);
  const loreAll = loreBooks.flatMap((book) =>
    book.entries
      .filter((entry) => entry.content)
      .map((entry) => ({ key: `${book.id}/${entry.id}`, own: book.id === "world", book: book.name, ...entry })),
  );
  const loreIndex = [...new Set(loreAll.map((entry) => entry.title))].slice(0, 250);
  const plainWords = (words) =>
    String(words ?? "")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim();
  /** The entries that best match `query`: its title exactly, or most of its words (title first, then keys, then text). */
  const searchLore = (query) => {
    const asked = plainWords(query);
    const words = asked.split(" ").filter((word) => word.length > 2);
    if (!asked) return [];
    return loreAll
      .map((entry) => {
        const [title, keys, body] = [
          plainWords(entry.title),
          plainWords((entry.keys ?? []).join(" ")),
          plainWords(entry.content),
        ];
        if (title === asked) return { entry, score: 1000 };
        const hit = words.filter((word) => title.includes(word) || keys.includes(word) || body.includes(word));
        if (!words.length || hit.length < Math.ceil(words.length / 2)) return { entry, score: 0 };
        const score = hit.reduce(
          (sum, word) =>
            sum + (title.includes(word) ? 5 : 0) + (keys.includes(word) ? 3 : 0) + (body.includes(word) ? 1 : 0),
          0,
        );
        return { entry, score };
      })
      .filter(({ score }) => score > 0)
      .sort((one, other) => other.score - one.score)
      .slice(0, 3)
      .map(({ entry }) => entry);
  };
  const found = new Map(); // what it looked up, by entry
  const looked = []; // and what it asked for, to say under the answer
  const scenes = (save.events ?? []).filter((event) => event.kind === "scene" && event.summary);

  /** The request with these parts of the world (a Set of assistant-context.js PARTS) and no others. */
  const build = (needs, final) => {
    const person = (entry) => {
      const local = save.locals.find((other) => other.id === entry.id);
      const house = lived[entry.id] ?? {};
      const day = save.schedules?.[entry.id]?.entries ?? [];
      const traits = save.traits?.[entry.id];
      // In full for whoever the message names; shorter for everyone when it's about everyone; else a line.
      const full = named.has(entry.name);
      const some = full || needs.has("people");
      const about = local
        ? [local.description, local.personality, local.appearance].filter(Boolean).join(" ")
        : String(entry.description ?? "");
      // Their lore: what this world has written of them, and what the player's own lorebooks say of them.
      const lore = [
        worldNote(save, `character:${entry.id}`)?.content ?? "",
        ...tiedLore(`character:${entry.id}`).map((tied) => `${tied.title}: ${tied.content}`),
      ]
        .filter(Boolean)
        .join("\n");
      return {
        name: entry.name,
        invented: !!local,
        about: full ? about : some ? about.slice(0, 320) : "",
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
          some &&
            core.bodies[entry.id] &&
            (core.bodies[entry.id] === "custom"
              ? `gender ${gendersNow().name || "custom"}`
              : `body ${core.bodies[entry.id]}`),
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
    // (With the lore: what the player's own lorebooks say of the world, its places, groups and factions,
    // each marked as theirs, since only this world's own lore can be rewritten.)
    const entries = needs.has("lore")
      ? [
          ...save.book.entries,
          ...Object.keys(save.lore)
            .filter((key) => !key.startsWith("character:"))
            .flatMap((key) =>
              tiedLore(key).map((tied) => ({
                title: `${tied.title} (from the player's lorebook "${tied.book}", tied to ${tieLabel(key) || "a place"}; read-only)`,
                content: tied.content,
              })),
            ),
        ]
          .filter((entry, at, all) => all.findIndex((other) => other.title === entry.title) === at)
          .slice(0, 60)
      : placeNotes;
    const withPlaces = needs.has("places") || needs.has("days") || namedPlaces.size > 0;
    return {
      ...base,
      ages: needs.has("ages") ? (save.ages ?? null) : null,
      genders: needs.has("ages") ? gendersNow() : null,
      history,
      cache: core.settings.promptCache,
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
      memories: needs.has("memories") ? memoriesNow() : [],
      loreIndex,
      found: [...found.values()],
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
  // Typed, and it's one of the ready-made requests in other words: it gets what that one would.
  if (!pick) for (const part of pickFor(said.at(-1))?.needs ?? []) needs.add(part);
  // It may look things up before it answers: up to three times, and then it's told that's all there is.
  let answer;
  for (let round = 0; ; round += 1) {
    const last = round >= 3;
    answer = await core.ai.assistant(build(needs, last));
    const look = answer?.look ?? {};
    const asked = [...(answer?.need ?? []), ...(look.lore ?? []), ...(look.people ?? []), ...(look.memories ?? [])];
    if (last || !asked.length) break;
    let fresh = false;
    for (const part of answer?.need ?? []) {
      if (needs.has(part)) continue;
      needs.add(part);
      looked.push(PARTS[part]);
      fresh = true;
    }
    const personFor = (name) => cast.find((person) => mentioned([person.name], [name]).length) ?? null;
    for (const name of look.people ?? []) {
      const person = personFor(name);
      if (!person || named.has(person.name)) continue;
      named.add(person.name);
      fresh = true;
    }
    for (const name of look.memories ?? []) {
      const person = personFor(name);
      if (!person || (lookedMemories.has(person.id) && needs.has("memories"))) continue;
      lookedMemories.add(person.id);
      needs.add("memories");
      looked.push(`what ${person.name} remembers`);
      fresh = true;
    }
    for (const query of look.lore ?? []) {
      for (const entry of searchLore(query)) {
        if (found.has(entry.key) || found.size >= 24) continue;
        found.set(entry.key, {
          title: entry.own ? entry.title : `${entry.title} (from the player's lorebook "${entry.book}"; read-only)`,
          content: entry.content,
        });
        looked.push(`lore "${entry.title}"`);
        fresh = true;
      }
    }
    // Nothing new came of it: one more asking, told that this is all there is.
    if (!fresh) round = 2;
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
      looked.length ? `looked up: ${[...new Set(looked)].join(", ")}` : "",
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
  for (const sign of core.signs ?? []) sign.setWords(signWords(sign.zone));
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
  const lived = livedHousing(); // where the world put whoever has no home or work set by hand
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
      found = other ? (housing[other.id]?.home ?? lived[other.id]?.home ?? null) : null;
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
      const content = item.text.replace(/\s+/gu, " ").trim();
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
      const content = item.text.replace(/\s+/gu, " ").trim();
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
      const place = person
        ? (housing[person.id]?.home ??
          housing[person.id]?.work ??
          lived[person.id]?.home ??
          lived[person.id]?.work ??
          null)
        : null;
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
  // (Someone travelling with you isn't met: they've been beside you.)
  const setLine = () =>
    lineFor(
      what === "greet" && core.crowd.inParty(talking.id) ? "together" : what,
      moodOf(core.relations.feeling(talking.id, "player")),
      talkWords(talking.name, talking.id),
    );
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
    trackInventory([`${personaName()}: ${line}`, `${talking.name}: ${reply}`], "talk");
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
  if (person.seated) return `sitting on ${person.seatWhat ?? "a seat"}${person.with ? ` with ${person.with}` : ""}`;
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
/**
 * Quartermaster's tracker reads what was just told (`parts`, in order) and updates the persona's sheet:
 * after moments, and after a conversation's replies (`kind` "talk") only when the setting says so.
 */
/** The connection the trackers read with: their own if one is chosen (Settings → AI → Connections), else conversations'. */
const trackerConnection = () => core.settings.trackerConnection || core.settings.textConnection || null;

function trackInventory(parts, kind = "moment") {
  // The character sheet is read for at the same moments, by its own setting. Where both trackers read,
  // the sheet shares the inventory's call (one call, not two); else each asks for itself.
  const sheet = sheetToTrack(kind);
  const when = core.settings.inventoryTrack;
  // With a shop's window open, talk of buying isn't yet a purchase: the tracker would add things not paid for.
  if (core.hud?.shopOpen?.() || when === "off" || (kind === "talk" && when !== "all"))
    return void trackSheet(parts, kind);
  const saveId = core.save?.id;
  core.inventory
    .track(
      parts.filter(Boolean).join("\n"),
      trackerConnection(),
      sheet ? { sheet, take: (answer) => takeSheetAnswer(saveId, answer) } : null,
    )
    .then((changed) => {
      if (changed === null) return void trackSheet(parts, kind); // (Quartermaster wasn't asked: the sheet asks alone)
      if (!changed) return;
      core.hud?.narrate(
        null,
        changed.length ? `(Your inventory changed: ${changed.join(", ")}.)` : "(Your inventory changed.)",
        false,
      );
    })
    .catch((error) => {
      if (core.inventoryTold) return;
      core.inventoryTold = true; // once a session
      core.hud?.setNotice(`The inventory wasn't updated: ${error?.message ?? error}`);
    });
}

/** When and where a line of the chat happened, as told now: "09:10, the market square", "yesterday 21:40, the pond". */
function stampOf(line) {
  if (!line.at) return "";
  const days = (core.social?.day ?? 0) - (line.day ?? 0);
  const when = days <= 0 ? line.at : days === 1 ? `yesterday ${line.at}` : `${days} days ago ${line.at}`;
  return [when, line.where].filter(Boolean).join(", ");
}

/** The place you're in, as a line of the chat is stamped with it (without the town it's in). */
const whereNow = () => placeWords().split(", in ")[0] ?? "";

/** The chat windows as the world has them: what's been said, the assistant's chat, and open if they were left open. */
function showChat() {
  core.hud?.setChat(core.momentLog.map((line) => ({ ...line, mine: line.who === personaName() })));
  core.hud?.setAssistantChat(core.save?.assistantChat ?? []);
  core.hud?.illustrate.restore();
  core.hud?.restoreChat();
}

function narrate(who, text, heard = [], place = false) {
  // (With when and where it happened, for whoever is told of it later: stampOf.)
  // (`place`: the line describes where you are, told on arriving. Illustrate leaves other places' out.)
  const stamp = { at: clockText(), day: core.social?.day ?? 0, where: whereNow(), ...(place ? { place: true } : {}) };
  core.momentLog = [...core.momentLog, { who: who ?? "Narrator", text, heard, ...stamp }].slice(-LOG_KEPT);
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
    // (The nearest sixty, told from the whole world down to this spot: what changes least comes first.)
    const shared = entries.filter((entry) => !personal(entry)).slice(0, 60);
    const lore = shared
      .filter((entry) => entry.source !== WORLD_ID)
      .map(words)
      .reverse();
    // (The whole world's lore is the same wherever they are: told apart, before anything that changes.)
    const worldLore = shared.filter((entry) => entry.source === WORLD_ID).map(words);
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
          .map((entry) => `(lore) ${words(entry)}`)
          .slice(0, 8),
        ...person.knows.filter((memory) => !said.some((text) => text.length > 2 && memory.includes(`"${text}"`))),
        ...(chat.own[person.id] ?? []).map((entry) => `(just now, heard) ${entry.who}: ${entry.text}`),
      ],
    }));
    const result = await core.ai.moment({
      personaId: core.personaId ?? null,
      personaName: personaName(),
      worn: core.inventory.worn(),
      sheet: sheetTold(),
      action,
      line,
      voice,
      listeners: telling,
      place: placeTold(),
      time: clockText(),
      weather: weatherWord(),
      setting: core.save.setting ?? "",
      style: core.settings.talkStyle,
      lore,
      worldLore,
      recent: chat.shared.map((line) => ({ who: line.who, text: line.text, stamp: stampOf(line) })),
      places: places.map(({ id, name }) => ({ id, name })),
      connectionId: core.settings.textConnection || null,
      temperature: core.settings.aiTemperature,
      narratorId: narratorFor("moments")?.id ?? null,
      separate: core.settings.aiSeparate === true,
    });
    if (result.narration) narrate(null, result.narration, heardIds, source === "arrive");
    // (A fight's moment tells what the game has rolled and already applied: nothing for a tracker to change.)
    (source === "fight" ? () => {} : trackInventory)([
      action && `What ${personaName()} does: ${action}`,
      line && `${personaName()}: ${line}`,
      result.narration,
      ...result.replies.map(
        (reply) => `${listeners.find((person) => person.id === reply.id)?.name ?? "Someone"}: ${reply.text}`,
      ),
    ]);
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
  const command = /^\/(scene|camp|call|roll|check)\b\s*(.*)$/isu.exec(typed.trim());
  if (["roll", "check"].includes(command?.[1].toLowerCase()))
    return rollCommand(command[1].toLowerCase(), command[2].trim());
  // "/call", "/call horse", "/call dog": your own animals come to you.
  if (command?.[1].toLowerCase() === "call") {
    const which = ["dog", "horse"].filter((role) => !command[2].trim() || command[2].toLowerCase().includes(role));
    return void (which.length ? which : ["dog", "horse"])
      .filter((role) => petsFor(PLAYER_ID)[role] || which.length === 1)
      .forEach(petCall);
  }
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
  if (core.mode === "sit") return `sitting on ${core.seat?.what ?? "a seat"}`;
  if (core.talking) return `talking with ${core.talking.name}`;
  if (core.swimming) return "swimming";
  if (core.interior) return "standing inside";
  const moving = core.still === 0;
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
  if (!core.ai.known()?.illustrate)
    throw new Error(
      "Wanderworld isn't fully loaded yet: restart the Engine (needed once after installing or updating Wanderworld).",
    );
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
  // The place is told first when the chat has nothing describing it (Settings → AI → Pictures), so the
  // picture is of where you are. (Not indoors, which has no such line, and not with those lines off.)
  const here = whereNow();
  const told = (line) => line.place && line.where === here;
  if (
    core.settings.illustrateTell &&
    !core.interior &&
    (core.settings.narration ?? "lines") !== "off" &&
    !core.momentLog.some(told)
  ) {
    await tellPlace(zone, namedZones(residentsOf(core.crowd.snapshot())), "looks round");
    if (zone.id === core.zoneId) core.arriveZone = zone.id;
  }
  // The chat it's given: without what was told of other places (Settings → AI → Pictures), so the picture is of one.
  const said = core.settings.illustrateHere ? linesHere(core.momentLog, here) : core.momentLog;
  // (Its last eight lines, and what was told of this place if that was longer ago.)
  const placeLine = said.findLast(told);
  const lastSaid = said.slice(-8);
  if (placeLine && !lastSaid.includes(placeLine)) lastSaid.unshift(placeLine);
  const recent = [...said].reverse().find((line) => line.who === "Narrator")?.text ?? "";
  return (previewOnly ? (work) => work() : painting)(() =>
    core.ai.illustrate({
      worldId: core.save.id,
      template,
      personaId: core.personaId ?? null,
      worn: core.inventory.worn(),
      facts: {
        persona: personaName(),
        people,
        place: placeWords(),
        placeKind:
          (core.interior ? "indoors, " : "") +
          ({
            plaza: "a market square",
            street: "a town street",
            road: "a country road",
            forest: "the woods",
            river: "a riverbank",
            pond: "the bank of a pond",
            cave: "the mouth of a cave",
            fountain: "a fountain in a market square",
            stones: "a ring of standing stones",
            outskirts: "the edge of town",
            mountains: "the mountains",
          }[kind] ?? kind),
        time: clockText(),
        timeOfDay,
        weather: weatherWord(),
        activity: playerDoing(),
        setting: core.save.setting ?? "",
        look: core.save.look || PACK.look,
        recent,
        // The last of the chat, for the rewrite: what's being done right now is in there, not in "standing".
        chat: lastSaid.map((line) => ({ who: line.who, text: line.text })),
      },
      caption: `${placeWords()}, ${clockText()}`,
      connectionId: core.settings.imageConnection || null,
      styleProfileId: core.settings.imageStyle,
      // (The style in words, and what it keeps out: the Engine adds neither to a finished prompt.)
      style: styleWords(core.settings.imageStyle).words,
      negative: styleWords(core.settings.imageStyle).negative,
      width,
      height,
      improve,
      instruction,
      previewOnly,
      prompt,
      textConnectionId: rewriteConnection || core.settings.textConnection || null,
    }),
  );
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

/**
 * Where the player is as the AI is told it: the place, and how they stand to it, so nobody is written
 * into a pond they're walking beside. "on the bank beside the pond (on dry ground, not in the water), in
 * Whisperwood"; "inside the Gilded Stag, in Larkspur"; "on Mill Lane, in Larkspur".
 */
function placeTold() {
  if (!core.zones) return "";
  const names = namedZones(residentsOf(core.crowd.snapshot()));
  const at = core.interior ? core.interior.door : core.player.position;
  const [zone, ...around] = chainOf(core.zones, zoneAt(core.zones, at.x, at.z)).filter((entry) => names[entry.id]);
  if (!zone) return "";
  const name = `${names[zone.id]}${closedWords(zone.id)}`;
  const kind = zone.kind === "building" ? "building" : (zone.outpostKind ?? zone.kind);
  const water = kind === "pond" || kind === "river";
  const depth = core.interior ? 0 : waterAt(core.player.position.x, core.player.position.z).depth;
  // In the water, when they are: swimming, wading, or only their feet.
  const wet = core.swimming
    ? "swimming in the water"
    : core.mode === "ride" && depth > WADE_DEPTH
      ? "on horseback in the water"
      : depth > WADE_DEPTH
        ? "wading in the water"
        : depth > 0.05
          ? "standing in the shallows at the edge"
          : "";
  const dry = {
    pond: `on the bank beside ${name} (on dry ground, not in the water)`,
    river: `on the bank of ${name} (on dry ground, not in the water)`,
    fountain: `beside ${name}`,
    street: `on ${name}`,
    road: `on ${name}`,
    cave: `at the mouth of ${name}`,
    building: `outside ${name}, by its door`,
    inn: `outside ${name}`,
    cottage: `outside ${name}`,
    mill: `outside ${name}`,
    farm: `at ${name}`,
    ruins: `among ${name}`,
    stones: `among ${name}`,
    watchtower: `at the foot of ${name}`,
    outskirts: `at ${name}`,
  };
  const here = core.interior
    ? `inside ${name}`
    : wet
      ? water
        ? `${wet} of ${name}`
        : `${wet}, ${dry[kind] ?? `in ${name}`}`
      : (dry[kind] ?? `in ${name}`);
  // And what they're beside: "in Whisperwood, near the bank of the Silverrun".
  const beside = besideNow(zoneAt(core.zones, at.x, at.z))
    .filter((entry) => names[entry.id])
    .map((entry) => besideWords(entry, names[entry.id]));
  return [[here, ...beside].join(", "), ...around.map((entry) => names[entry.id])].join(", in ");
}

/** The weather now, in a word, when there is any to speak of. */
function weatherWord() {
  const weather = core.world?.weatherNow?.();
  return weather && weather.kind !== "clear" && weather.amount > 0.5 ? (WEATHER_LOOK[weather.kind]?.word ?? "") : "";
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
    worn: core.inventory.worn(),
    sheet: sheetTold(),
    place: placeTold(),
    time: clockText(),
    weather: weatherWord(),
    nearby,
    // Travelling with you: they know it, and who else is along.
    inParty: core.crowd.inParty(talking.id),
    companions: core.crowd.inParty(talking.id)
      ? core.crowd
          .party()
          .filter((member) => member.id !== talking.id)
          .map((member) => member.name)
          .slice(0, 6)
          .join(", ")
      : "",
    relationship: towardPlayer(talking.id, talking.name, names),
    setting: core.save?.setting ?? "",
    lore: zone
      ? loreAt(zone)
          .slice(0, 60)
          .reverse() // (from the whole world down to this spot: what changes least comes first)
          .map(({ lorebookId, entryId }) => ({ lorebookId, entryId }))
      : [],
    loreTexts: zone
      ? activeLore(zone, {})
          .entries.filter((entry) => entry.own && entry.content)
          .slice(0, 60)
          .reverse()
          .map((entry) => `${entry.title}: ${entry.content}`)
      : [],
    // (For caching, it starts on a multiple of 8, so the first line sent only moves every eighth line: 16 to 24 lines.)
    history: core.settings.promptCache
      ? talking.history.slice(Math.max(0, Math.floor((talking.history.length - 16) / 8) * 8))
      : talking.history.slice(-24),
    cache: core.settings.promptCache,
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
    return "A scene needs one of your characters there, or a narrator card (Menu → Settings → AI → Scenes) to tell it alone.";
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
    core.inventory.worn() ? `What ${personaName()} is wearing: ${core.inventory.worn()}` : "",
    "This scene is played out from Wanderworld, a small walkable world; keep to the place and the people there.",
    telling
      ? `${narrator.name} is the narrator of this scene: they tell what happens and give the world its voice, and are not a person standing there.`
      : "",
    // The player's stats as a block (Inventory → Sheet, what's ticked), so the scene starts from how they stand.
    sheetTold() ? `${personaName()}'s stats as the scene begins. ${sheetTold()}` : "",
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
        worn: core.inventory.worn(),
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
        await core.inventory.link(made.chatId);
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
    if (typeof started?.chatId === "string") await core.inventory.link(started.chatId);
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
    styleWords(core.settings.imageStyle).words && `${styleWords(core.settings.imageStyle).words}.`,
  ]
    .filter(Boolean)
    .join(" ");
  core.picture = { zoneId: zone.id, place, url: null, pending: true, error: null };
  core.journalAt = 0;
  try {
    const { image } = await painting(() =>
      core.ai.image({
        prompt,
        name: place || "wanderworld",
        width: 768,
        height: 512,
        connectionId: core.settings.imageConnection || null,
        styleProfileId: core.settings.imageStyle,
        negative: styleWords(core.settings.imageStyle).negative,
      }),
    );
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
  // What can be gathered here, each a prompt at the thing itself (a key, or a tap on a touch screen); not
  // where it's been used up for now. Foraging and harvesting, which have no one thing, only when stood still.
  // Carrying something beaten: the prompt puts it down.
  if (core.carrying)
    list.push({
      kind: "thing",
      label: `Put down the ${core.carrying.what}`,
      x: core.player.position.x,
      z: core.player.position.z,
      y: heightAt(core.player.position.x, core.player.position.z) + 0.35,
      reach: 3,
      quiet: true,
      body: true,
      act: putDownBody,
    });
  // The beaten, lying in reach: an animal to harvest, a person to search (once).
  for (const body of core.interior ? [] : core.herd.bodies(core.player.position, 2.6)) {
    const person = !!ANIMALS[body.kind]?.person;
    if (person && body.searched) continue;
    const what = (PACK.animals[body.kind] ?? "the creature").replace(/^the /u, "");
    list.push({
      kind: "thing",
      label: `${person ? "Search" : "Harvest"} the ${what}`,
      x: body.x,
      z: body.z,
      y: 0.9,
      reach: 2.4,
      quiet: true,
      body: true,
      act: () => void tendBody(body, person, what),
    });
  }
  // (Something beaten at your feet comes before anything to gather there.)
  const gatherable = list.some((thing) => thing.body) ? [] : gatherTargets(null, true);
  const atThing = gatherable.some((target) => target.face); // a tree, a rock or the water comes first
  for (const target of gatherable) {
    if (!target.face && (atThing || (core.still ?? 0) < 0.6)) continue;
    list.push({
      kind: "thing",
      label: GATHER_KINDS[target.kind].label,
      x: target.x,
      z: target.z,
      y: heightAt(target.x, target.z) + 0.35, // at the foot of the tree, on the rock, on the ground
      reach: 3.8,
      quiet: true, // (its own swing or cast, not a hand held out)
      act: () => void gather(target.kind),
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
  if (
    core.target &&
    core.target.kind !== "person" &&
    core.target.kind !== "seat" &&
    !core.target.mount &&
    !core.target.quiet
  )
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

// ── Aiming ──

/** How near a tap has to land to a creature or a companion to aim at them (pixels). */
const AIM_RADIUS = 46;
/** Whether a tap on a creature or a companion aims at them: in a fight by turns, or with a weapon drawn. */
const aiming = () => !!core.battle || weaponDrawn() || (core.mode === "ride" && fighting());
/** Whether the player can swing or cast: on their feet, or settled in the saddle. */
const afoot = () =>
  core.mode === "walk" || (core.mode === "ride" && !!core.mount && !core.mounting && !core.dismounting);

/**
 * A tap at (x, y) on the stage aims at the creature or the companion under it; a tap on what's aimed at
 * already, or on the player, aims at nothing. Whether the tap was taken.
 */
function aimAt(x, y) {
  const at = core.player.position;
  let best = null;
  let nearest = AIM_RADIUS;
  const consider = (entry, wx, wz, up) => {
    const screen = toScreen(wx, (core.interior ? at.y : heightAt(wx, wz)) + up, wz);
    const distance = screen ? Math.hypot(screen.x - x, screen.y - y) : Infinity;
    if (distance >= nearest) return;
    nearest = distance;
    best = entry;
  };
  for (const foe of core.interior ? [] : core.herd.foes(at, 45))
    consider({ kind: "foe", id: foe.id }, foe.x, foe.z, 0.6 * (foe.scale ?? 1));
  for (const member of core.crowd.party()) {
    const person = core.crowd.present(core.space).find((entry) => entry.id === member.id);
    if (person) consider({ kind: "ally", id: person.id }, person.position.x, person.position.z, 1.1);
  }
  consider({ kind: "self" }, at.x, at.z, 1.1);
  if (!best) return false;
  core.aim = best.kind === "self" || core.aim?.id === best.id ? null : best;
  return true;
}

/**
 * What's aimed at, as it is now: { kind: "foe" | "ally", id, x, z, room, far (metres from the player), name,
 * and the creature (`foe`) or the companion (`person`) }. null with nothing aimed at, or once it's gone.
 */
function aimed() {
  const aim = core.aim;
  if (!aim || !core.player) return null;
  const at = core.player.position;
  if (aim.kind === "foe") {
    const foe = core.interior ? null : core.herd.foes(at, 60).find((entry) => entry.id === aim.id);
    if (!foe) return null;
    const name = (PACK.animals[foe.kind] ?? "the creature").replace(/^the /u, "");
    return {
      kind: "foe",
      id: foe.id,
      foe,
      x: foe.x,
      z: foe.z,
      room: foe.room,
      far: Math.hypot(foe.x - at.x, foe.z - at.z),
      name,
    };
  }
  const person = core.crowd.present(core.space).find((entry) => entry.id === aim.id);
  if (!person) return null;
  const { x, z } = person.position;
  return {
    kind: "ally",
    id: person.id,
    person,
    x,
    z,
    room: 0.4,
    far: Math.hypot(x - at.x, z - at.z),
    name: nameFor(person.id, person.name),
  };
}

/** How far what the player fights with reaches: a bow's range if they carry one, else a swing's. */
const aimReach = () => {
  const weapon = weaponNow();
  return Math.max(swingReach(weapon), weapon.thrown ?? 0, bowOf(core.items ?? [], byDesc())?.range ?? 0);
};
/** How far a swing with `weapon` reaches: a pace and a half more for one with reach. */
const swingReach = (weapon) => SWING_REACH + (weapon?.reach ? 1.5 : 0);

/**
 * With a creature aimed at: turns the player to it if it's within `reach` metres, and says it's out of range
 * if it isn't. False only when it's out of range (nothing aimed at is true: the blow goes where they face).
 */
function aimInRange(reach, what) {
  const aim = aimed();
  if (aim?.kind !== "foe") return true;
  if (aim.far > reach + aim.room) {
    core.hud?.setNotice(
      `Out of range: the ${aim.name} is ${aim.far.toFixed(1)} m away, and ${what} reaches ${reach} m.`,
    );
    return false;
  }
  const angle = Math.atan2(aim.x - core.player.position.x, aim.z - core.player.position.z);
  core.player.rotation.y = angle;
  if (weaponDrawn()) core.cameraYaw = angle + Math.PI;
  return true;
}

/** How far the nearest creature in the fight is, for an "out of range": ", and the nearest creature is 7.2 m away"; "" with none. */
function nearestWords() {
  const at = core.player.position;
  const inFight = new Set((core.battle?.order ?? []).map((entry) => entry.id));
  const far = (core.interior ? [] : core.herd.foes(at, 60))
    .filter((foe) => !foe.fled && (foe.hostile || inFight.has(foe.id)))
    .reduce((least, foe) => Math.min(least, Math.hypot(foe.x - at.x, foe.z - at.z) - foe.room), Infinity);
  return Number.isFinite(far) ? `, and the nearest creature is ${Math.max(0, far).toFixed(1)} m away` : "";
}

/** What's aimed at in a few words, for the bar: "wolf · 4.2 m", "wolf · 12.0 m · out of range". */
function aimWords() {
  const aim = aimed();
  if (!aim) return "";
  const far = `${aim.name} · ${aim.far.toFixed(1)} m`;
  return aim.kind === "foe" && aim.far > aimReach() + aim.room ? `${far} · out of range` : far;
}

/** The ring round what's aimed at: red in range, grey out of it, green round a companion. It goes when the aim does. */
function aimTick() {
  const aim = fighting() && !core.downed ? aimed() : null;
  if (!aim) {
    core.aim = null;
    core.aimRing?.remove();
    core.aimRing = null;
    core.aimKey = "";
    return;
  }
  const colour = aim.kind === "ally" ? 0x7dff9a : aim.far <= aimReach() + aim.room ? 0xff6a5a : 0xb8b8b8;
  const key = `${aim.id}|${colour}`;
  const spot = chest(aim.x, aim.z, 0.12);
  if (core.aimKey !== key) {
    core.aimRing?.remove();
    core.aimRing = spellFx().circle(core.space.scene, spot, 0.7 + aim.room, colour);
    core.aimKey = key;
  }
  core.aimRing.move(spot.x, spot.y, spot.z);
}

/** A healing spell lands on a companion: their HP, and up again if they were down. */
function healAlly(aim, amount, spell) {
  const health = allyHp(aim.id);
  health.hp = Math.min(health.max, health.hp + amount);
  core.allyDying?.delete(aim.id);
  if (core.crowd.isOut(aim.id)) core.crowd.knockOut(aim.id, 0.3); // (on their feet again in a moment)
  spellFx().motes(core.space.scene, chest(aim.x, aim.z, 0), spellColour("heal"));
  narrate(null, `${personaName()} casts ${spell} on ${aim.name}: +${amount} HP (${health.hp} of ${health.max}).`);
}

/** What something takes of a turn, as a letter for its button where fights go by turns: "A" an action, "B" a bonus action, "" neither. */
const costMark = (cost) => (byTurns() ? (cost === "bonus" ? "B" : cost === "action" ? "A" : "") : "");
/** A button's tags after its name: " (B, 1)" for a bonus action with one use left; "" with neither. */
const tagged = (mark, left) =>
  ((tags) => (tags.length ? ` (${tags.join(", ")})` : ""))([mark, left === null ? "" : String(left)].filter(Boolean));

/** What there is to do in a fight besides Attack, Block and Dodge, by kind, for the row of buttons (hud.js setActions). */
function actionGroups() {
  if (!fighting() || core.downed || !core.save) return [];
  const moves = new Set([...MOVES.map((move) => move.id), "offhand"]);
  const all = abilitiesNow();
  const item = (ability) => ({
    id: ability.id,
    label: `${ability.name}${tagged(costMark(ability.cost), ability.left)}`,
    title: ability.about,
    ready: (ability.left === null || ability.left >= Math.max(1, ability.spend)) && !(ability.turns && !core.battle),
  });
  return [
    { id: "abilities", label: "Abilities", items: all.filter((ability) => !moves.has(ability.id)).map(item) },
    { id: "moves", label: "Moves", items: all.filter((ability) => moves.has(ability.id)).map(item) },
    {
      id: "spells",
      label: "Spells",
      items: spellsNow()
        .filter((entry) => !entry.spell.reaction)
        .map((entry) => ({
          id: `spell:${entry.id}`,
          label: `${entry.name}${tagged(costMark(entry.spell.bonus ? "bonus" : "action"), null)}`,
          title: `Cast ${entry.name}`,
          ready: true,
        })),
    },
  ];
}

/** A click or tap on the world: use (or walk to) what's under it, or walk to that spot on the ground. */
function tap(clientX, clientY) {
  // (In the saddle a tap only aims.)
  if (core.mode === "ride" && core.camera && aiming()) {
    const box = core.stage.getBoundingClientRect();
    if (aimAt(clientX - box.left, clientY - box.top)) return;
  }
  if (core.mode === "talk" || core.mode === "door" || core.mode === "ride" || !core.camera) return;
  if (core.mode === "sit") return standUp();
  const rect = core.stage.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  if (aiming() && aimAt(x, y)) return; // (in a fight, a tap on a creature or a companion aims at them)
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

/**
 * The season now: the world's own, unless Settings → World → Time and weather → Season picks one (as
 * its weather can be picked). "" is the plain green land.
 */
function seasonNow() {
  const picked = core.settings.season ?? "world";
  return picked === "world" ? (core.save?.season ?? "") : picked === "none" ? "" : picked;
}

/** Experience earned (sheet.js gainXp): kept, and a level gained is said in the chat with what it gave. */
function earnXp(amount) {
  if (!core.save || !core.settings.sheet || !(amount > 0)) return;
  const before = sheetNow();
  const grown = gainXp(before, amount);
  setSheet(grown.sheet);
  if (!grown.levels) return;
  const most = (id) => grown.sheet.entries.find((entry) => entry.id === id)?.max;
  narrate(
    null,
    `${personaName()} reaches level ${valueOf(grown.sheet, "level")}: HP is now ${most("hp")} at most and restored, mana ${most("mana")} at most.`,
  );
  core.hud?.refreshInventory?.();
}

/**
 * The year (Settings → World → Time and weather → Seasons change): once the world's season has lasted its
 * days, the next begins, and the chat says so. Counted in the world's own days, from the day the season
 * was set or the setting was first on, so nothing jumps when it's switched on.
 */
function turnSeason() {
  const save = core.save;
  const day = core.social?.day;
  if (!save || !core.settings.seasonsTurn || !Number.isFinite(day)) return;
  if (save.seasonSince === null || save.seasonSince === undefined || save.seasonSince > day) {
    core.save = { ...save, seasonSince: day };
    core.saves.write(core.save);
    return;
  }
  const next = seasonOn(save.season, save.seasonSince, day, core.settings.seasonDays);
  if (next.seasonSince === save.seasonSince) return;
  core.save = { ...save, ...next };
  core.saves.write(core.save);
  core.journalAt = 0;
  const lines = {
    spring: "The season turns. The snow is gone and the first blossom is out: it is spring.",
    summer: "The season turns. The days are long and the land is green: it is summer.",
    fall: "The season turns. The leaves have gone yellow and red: it is fall.",
    winter: "The season turns. Snow lies on the ground: it is winter.",
  };
  if ((core.settings.narration ?? "lines") !== "off") narrate(null, lines[next.season]);
}

// ── The character sheet and the things carried (sheet.js; Quartermaster keeps the items) ────────────────

const sheetKey = () => core.personaId || "persona";
/** The sheet of whoever is being played, in this world. */
function sheetNow() {
  const sheet = checkSheet(core.save?.sheets?.[sheetKey()]);
  // (Undefeatable, a setting: every resource is at its most, whatever was last written.)
  return core.settings.undefeatable ? toppedUp(sheet) : sheet;
}
function setSheet(sheet) {
  if (!core.save) return;
  if (core.settings.undefeatable) sheet = toppedUp(sheet);
  core.save = { ...core.save, sheets: { ...core.save.sheets, [sheetKey()]: sheet } };
  core.saves.write(core.save);
}
/** The sheet in words for a prompt (what's switched on in it, with what's worn counted); "" when it isn't told. */
function sheetTold() {
  if (!core.save || !core.settings.sheet || !core.settings.sheetTold) return "";
  const sheet = sheetNow();
  return [sheetWords(sheet, wornNow(sheet)), buildWords()].filter(Boolean).join(" ");
}
/** Quartermaster's items for the sheet being played, read again (kept in `core.items` for the bonuses). */
async function readItems() {
  try {
    core.items = await core.inventory.items();
    if (core.inventory.ready()) wornMaxSync();
  } catch {
    core.items = [];
  }
  return core.items;
}

/**
 * What's worn that raises the most of something ("+5 Max HP") is taken into the sheet, and taken out again
 * when it comes off: the most goes up or down by the difference, and what's in it is held to the new most.
 * Done as the items are read, so a failed read never takes anything away.
 */
function wornMaxSync() {
  if (!core.save) return;
  const sheet = sheetNow();
  const now = wornMax(wornNow(sheet));
  const had = core.save.wornMax?.[sheetKey()] ?? {};
  let next = sheet;
  for (const entry of sheet.entries) {
    const change = (now[entry.id] ?? 0) - (had[entry.id] ?? 0);
    if (change && "max" in entry)
      next = changeSheet(next, { set: entry.id, field: "max", value: Math.max(1, entry.max + change) });
  }
  if (next === sheet && JSON.stringify(now) === JSON.stringify(had)) return;
  core.save = { ...core.save, wornMax: { ...core.save.wornMax, [sheetKey()]: now } };
  core.saves.write(core.save);
  if (next !== sheet) {
    setSheet(next);
    core.hud?.refreshInventory?.();
  }
}
/**
 * The AI keeps the sheet (Settings → Inventory → "The AI updates your sheet"): it reads what was
 * just told and answers with the stats that changed and any experience earned, a short list that is
 * checked against the sheet and applied (sheet.js applyChanges). Never a rewrite of the sheet.
 */
function trackSheet(parts, kind = "moment") {
  const list = sheetToTrack(kind);
  const told = parts.filter(Boolean).join("\n");
  if (!list || !told) return;
  const saveId = core.save.id;
  core.ai
    .sheetTrack({
      personaName: personaName(),
      sheet: list,
      text: told,
      connectionId: trackerConnection(),
    })
    .then((answer) => takeSheetAnswer(saveId, answer))
    .catch((error) => {
      if (core.sheetTold) return;
      core.sheetTold = true; // once a session
      core.hud?.setNotice(`The AI couldn't update your sheet: ${error?.message ?? error}`);
    });
}
/** The sheet's lines for its tracker to read after this kind of telling, or "" when it isn't to read now. */
function sheetToTrack(kind = "moment") {
  const when = core.settings.sheetTrack ?? "off";
  if (!core.save || !core.settings.sheet || when === "off" || (kind === "talk" && when !== "all")) return "";
  return sheetList(sheetNow());
}
/** What the sheet's tracker answered ({ changes, xp }), applied to the sheet of the world it was asked for. */
function takeSheetAnswer(saveId, answer) {
  if (!core.save || core.save.id !== saveId) return; // another world since
  const before = sheetNow();
  const changed = applyChanges(before, answer?.changes);
  const xp = Math.max(0, Math.round(answer?.xp ?? 0));
  const reasons = new Map((answer?.changes ?? []).map((change) => [String(change.stat).toLowerCase(), change.reason]));
  const notes = changed.applied.map((change) => {
    const why = reasons.get(change.name.toLowerCase()) ?? reasons.get(change.id);
    return `${change.name} ${change.from} to ${change.to}${why ? ` (${why})` : ""}`;
  });
  if (xp > 0) notes.push(`+${xp} XP`);
  if (!notes.length) return;
  setSheet(changed.sheet);
  core.hud?.narrate(null, `(Your sheet changed: ${notes.join(", ")}.)`, false);
  earnXp(xp);
  core.hud?.refreshInventory?.();
}

// ── Fighting (combat.js) ────────────────────────────────────────────────────────────────────────────────

/**
 * How fights are played (Settings → Inventory → Combat), with the character sheet on: "" (not at all),
 * "realtime", "moment" (an exchange rolled at once and told) or "scene" (a scene chat).
 */
const fightMode = () =>
  core.settings.sheet && core.save && core.settings.fights !== "off" ? core.settings.fights : "";
/** Whether blows are struck and taken by the player's own hand: in real time, or by turns. */
const fighting = () => fightMode() === "realtime" || fightMode() === "turns";
/** Whether fights go by turns. */
const byTurns = () => fightMode() === "turns";
// ── Conditions on the player (conditions.js) ──

/** What the conditions on the player add up to now (nothing, with conditions switched off). */
const afflicted = () => conditionMods(core.settings.conditions ? core.afflicted : null);
/** Whether creatures use what the SRD gives them besides a plain attack. */
const extrasOn = () => !!core.settings.creatureExtras && !!core.settings.srdCreatures;

/** Lays a condition on the player for `seconds` (its own length when not given). Whether it took. */
function afflictPlayer(name, seconds = 0) {
  if (!core.settings.conditions || !CONDITIONS[name] || core.downed) return false;
  core.afflicted = afflict(core.afflicted, name, seconds);
  if (name === "prone") core.gesture = "hurt";
  // (A ring round them for a moment, as round a creature under a spell.)
  const at = core.player.position;
  spellFx().ring(
    core.space.scene,
    chest(at.x, at.z, 0.15),
    spellColour("hold"),
    Math.min(4, core.afflicted[name]),
    0.9,
  );
  return true;
}

/**
 * The player's saving throw: a d20 plus that attribute's modifier (with what they wear) against `dc`.
 * { roll, total, saved, words: "Strength save 9 against DC 11" }.
 */
function playerSave(attribute, dc) {
  const sheet = sheetNow();
  const worn = wornNow(sheet);
  const die = () => 1 + Math.floor(Math.random() * 20);
  // (A barbarian's Danger Sense: the better of two on a Dexterity save.)
  const roll = attribute === "dexterity" && kitNow().danger ? Math.max(die(), die()) : die();
  const total = roll + modifier(valueOf(sheet, attribute) + (worn[attribute] ?? 0)) + saveBonus(attribute);
  const name = `${attribute[0].toUpperCase()}${attribute.slice(1)}`;
  return { roll, total, saved: total >= dc, words: `${name} save: ${sumWords(roll, total)} against DC ${dc}` };
}
/**
 * What the player's class adds to a saving throw in `attribute`: their proficiency bonus where the class is
 * trained in it, and a paladin's Charisma modifier to all of them from level 6.
 */
function saveBonus(attribute) {
  const kit = kitNow();
  const aura = kit.aura ? Math.max(1, modifier(valueOf(sheetNow(), "charisma"))) : 0;
  return (kit.saves.includes(attribute) ? profNow() : 0) + aura + (wornNow().saves ?? 0); // (and a Ring of Protection's)
}

// ── The build (build.js): race, class, style, background, skills; what the class can call on; rests ──

/** The player's build as kept with the world, checked against their class. */
const buildNow = () => checkBuild(core.save?.build, playerClass());
/** What their class has always on at their level, with their fighting style (build.js passives). */
const kitNow = () => passives(playerClass(), valueOf(sheetNow(), "level"), buildNow().style);
/** The ability their class casts with (Intelligence with no class, or one that doesn't cast). */
const castingNow = () => SRD_CLASSES[playerClass()]?.casting ?? "intelligence";
/** What they add to a check with a skill: its ability's modifier, and their proficiency bonus if they're trained in it. */
function skillAdd(id) {
  const skill = skillNamed(id);
  if (!skill) return 0;
  const sheet = sheetNow();
  const worn = wornNow(sheet);
  const trained = skillsOf(buildNow(), playerClass()).includes(id);
  return modifier(valueOf(sheet, skill.ability) + (worn[skill.ability] ?? 0)) + (trained ? profNow() || 2 : 0);
}

/** What they've called on that lasts a while ({ [name]: seconds left }, run down like the conditions). */
const buffed = (name) => (core.buffs?.[name] ?? 0) > 0;
const buff = (name, seconds) => void (core.buffs = { ...core.buffs, [name]: seconds });
const BUFF_WORDS = {
  raging: "Raging",
  reckless: "Reckless",
  surging: "Action Surge",
  inspired: "Inspired",
  smiting: "Smite ready",
  helping: "Helping",
  readied: "Attack readied",
  stunning: "Stunning Strike ready",
  hidden: "Hidden",
  helped: "Helped",
};

/** What the player fights with, as their build makes it: a monk's bare hands, a versatile weapon in both hands with no shield. */
function weaponNow() {
  let weapon = weaponOf(core.items ?? [], byDesc());
  const kit = kitNow();
  if (!weapon.name && kit.martial) weapon = { ...weapon, damage: kit.martial, finesse: true };
  if (weapon.versatile && core.settings.srdModifiers && !wornNow().shield)
    weapon = { ...weapon, damage: weapon.versatile, twoHanded: true };
  return weapon;
}

/** What their class can call on now: build.js abilities, each with how much is left (null: as often as they like). */
function abilitiesNow() {
  if (!core.save) return [];
  const sheet = sheetNow();
  return abilities(playerClass(), valueOf(sheet, "level"), {
    charisma: modifier(valueOf(sheet, "charisma")),
    wisdom: modifier(valueOf(sheet, "wisdom")),
  })
    .map((ability) => ({ ...ability, left: ability.max ? Math.max(0, ability.max - usedOf(ability.pool)) : null }))
    .concat(movesNow());
}

/** What anyone can do in a fight besides attacking (a setting): shove, grapple, help, hide, and an off-hand blow with two light weapons. */
const MOVES = [
  {
    id: "shove",
    name: "Shove",
    about: "Your Athletics against the creature's: it's pushed back and knocked down.",
    cost: "action",
  },
  {
    id: "grapple",
    name: "Grapple",
    about: "Your Athletics against the creature's: it's held where it is until it breaks free.",
    cost: "action",
  },
  { id: "help", name: "Help", about: "A companion's next attack has advantage.", cost: "action" },
  {
    id: "ready",
    name: "Ready",
    about:
      "Hold your attack: it goes off by itself at the first creature to come within reach before your next turn (six seconds).",
    cost: "action",
  },
  {
    id: "hide",
    name: "Hide",
    about:
      "Your Stealth against what the creatures near you notice: hidden, nothing comes for you and your next attack has advantage.",
    cost: "action",
  },
];
function movesNow() {
  if (!core.settings.moves || !fighting()) return [];
  const plain = (move) => ({ ...move, pool: move.id, max: 0, per: "short", spend: 1, left: null });
  const other = offhandOf(core.items ?? [], byDesc());
  return [
    ...MOVES.map(plain),
    ...(other
      ? [
          plain({
            id: "offhand",
            name: "Off-hand attack",
            about: `A blow with the ${other.name.toLowerCase()} in your other hand.`,
            cost: "bonus",
          }),
        ]
      : []),
  ];
}

/** A readied attack goes off at the first hostile creature within reach of what the player fights with. */
function readyTick() {
  if (!buffed("readied") || core.downed || core.interior || afflicted().helpless || !afoot()) return;
  const at = core.player.position;
  const bow = core.shape ? null : bowOf(core.items ?? [], byDesc());
  const reach = bow ? Math.min(bow.range, 12) : SWING_REACH;
  const foe = core.herd
    .foes(at, reach + 3)
    .find((entry) => entry.hostile && !entry.fled && Math.hypot(entry.x - at.x, entry.z - at.z) <= reach + entry.room);
  if (!foe) return;
  core.buffs = lift(core.buffs, "readied");
  core.player.rotation.y = Math.atan2(foe.x - at.x, foe.z - at.z);
  const weapon = bow ?? weaponNow();
  core.gesture = bow ? "cast" : weapon.name ? "strike" : "punch";
  core.gestureHeld = weapon.held;
  narrate(null, `${personaName()}'s readied attack goes off.`);
  landOn(foe, weapon);
}

// ── Wild Shape ──

/** The player takes a beast's shape: its HP, AC and attack stand in for theirs, and its body for their own. */
function shapeInto(kind) {
  const stats = SRD_CREATURES[kind];
  const shape = { kind, hp: stats.hp, max: stats.hp, animal: null };
  core.shape = shape;
  const at = core.player.position;
  spellFx().burst(core.space.scene, chest(at.x, at.z, 0.6), spellColour("heal"), 1.6);
  narrate(null, `${personaName()} takes the shape of a ${stats.name.toLowerCase()}: ${stats.hp} HP, AC ${stats.ac}.`);
  void createAnimal(kind)
    .then((animal) => {
      if (core.shape !== shape) return void animal.dispose();
      shape.animal = animal;
      core.player.add(animal.object);
      if (core.character) core.character.object.visible = false;
    })
    .catch(() => {});
}

/** Back to their own shape (said with `words`, if any). */
function unshape(words) {
  const shape = core.shape;
  if (!shape) return;
  core.shape = null;
  shape.animal?.dispose();
  if (core.character) core.character.object.visible = true;
  if (core.player) {
    const at = core.player.position;
    if (core.space?.scene) spellFx().burst(core.space.scene, chest(at.x, at.z, 0.6), spellColour("heal"), 1.4);
  }
  if (words) narrate(null, words);
}

/** A blow in a beast's shape: the beast's own attack and damage, with its Pack Tactics where it has them. */
function shapeStrike(foe) {
  const mine = SRD_CREATURES[core.shape.kind];
  const stats = statsOf(foe);
  const roll = () => attackRoll({ bonus: mine.attack, ac: stats.ac, damage: mine.damage });
  const pack =
    !!mine.pack && fightingAllies().some((ally) => Math.hypot(ally.position.x - foe.x, ally.position.z - foe.z) < 2.5);
  const better = marked(foe.id) || pack;
  const worse = afflicted().attackDis;
  const rolled = better === worse ? roll() : rolledTwice(roll, better);
  const typed = typedDamage(rolled.damage, mine.type, stats);
  const result = { ...rolled, damage: typed.damage, how: typed.how, type: mine.type, ac: stats.ac };
  core.shape.animal?.act?.("strike");
  const after = Math.max(0, (foe.hp ?? stats.hp) - result.damage);
  const nerve = !foe.hostile
    ? "flee"
    : result.hit
      ? foeNerve(after, stats.hp, Math.random, extrasOn() ? stats.temperament : "")
      : "fight";
  const struck = core.herd.strike(foe.id, result.damage, stats.hp, nerve);
  if (!struck) return false;
  const what = (PACK.animals[foe.kind] ?? "the creature").replace(/^the /u, "");
  const told = strikeWords({
    who: `${personaName()}, as a ${mine.name.toLowerCase()},`,
    what,
    weapon: { name: "", range: 0 },
    result,
    left: struck.hp,
    max: struck.max,
  });
  narrate(null, struck.down ? `${told} (+${stats.xp} XP)` : told);
  if (struck.down) foeBeaten(foe, stats);
  return struck.down;
}

/** A contest of the player's Athletics against a creature's strength or nimbleness, whichever is better: { mine, theirs, won }. */
function contest(foe) {
  const stats = statsOf(foe);
  const die = () => 1 + Math.floor(Math.random() * 20);
  const mine = die() + skillAdd("athletics");
  const theirs = die() + Math.max(stats.saves?.strength ?? 0, stats.saves?.dexterity ?? 0);
  return { mine, theirs, won: mine > theirs };
}

/**
 * Shield or Counterspell (`kind`: "shield" | "counter"), where it's on the sheet and can be paid for: cast in
 * answer, its mana or slot spent, and no other such answer for six seconds. Its name, or "" when it isn't cast.
 */
function reactionSpell(kind) {
  if (!core.settings.reactions || core.clock < (core.reactAt ?? 0) || afflicted().helpless) return "";
  const found = spellsNow().find((entry) => entry.spell.reaction === kind);
  if (!found) return "";
  const slotted = byTurns() && core.settings.srdSlots;
  const slot = slotted ? slotFor(found.spell.level, slotsNow(), core.save.slotsUsed) : 0;
  if (slotted ? slot <= 0 : valueOf(sheetNow(), "mana") < found.spell.cost) return "";
  if (slotted) useOne(slot);
  else setSheet(applyChanges(sheetNow(), [{ stat: "mana", by: -found.spell.cost }]).sheet);
  core.reactAt = core.clock + 6;
  core.gesture = "cast";
  const at = core.player.position;
  spellFx().ring(core.space.scene, chest(at.x, at.z, 0.9), spellColour("force"), 0.8, 0.9);
  core.hud?.refreshInventory?.();
  return found.name;
}

/**
 * What the build adds to a blow with `weapon` at `foe`: { attack, damage, critFrom, more (dice that come with
 * a hit), advantage, and what was counted on (sneak, smite, inspired) for strikeSpent to settle }.
 * `keen`: the blow already has advantage (the target is marked).
 */
function strikeMods(weapon, foe, keen = false) {
  const kit = kitNow();
  const melee = !weapon.range;
  const mods = { attack: 0, damage: 0, critFrom: kit.critFrom, more: [], advantage: melee && buffed("reckless") };
  if (buffed("hidden") || buffed("helped")) mods.advantage = true;
  if (
    foe &&
    core.grappling?.id === foe.id &&
    core.grappling.until > core.clock &&
    buildNow().feats?.includes("grappler")
  )
    mods.advantage = true; // (the Grappler feat)
  if (!melee && !weapon.hurled) mods.attack += kit.archery;
  // (A heavy weapon in a small one's hands: the worse of two.)
  if (weapon.heavy && ["halfling", "gnome"].includes(buildNow().race)) mods.hampered = true;
  if (melee && weapon.name && !weapon.two && !weapon.twoHanded) mods.damage += kit.dueling;
  // (Great Weapon Fighting: a 1 or a 2 on the weapon's dice is rolled again.)
  if (melee && kit.greatWeapon && (weapon.two || weapon.twoHanded)) mods.reroll = 2;
  if (melee && buffed("raging")) mods.damage += kit.rage || 2;
  if (buffed("inspired")) {
    const level = valueOf(sheetNow(), "level");
    mods.inspired = 1 + Math.floor(Math.random() * (level >= 15 ? 12 : level >= 10 ? 10 : level >= 5 ? 8 : 6));
    mods.attack += mods.inspired;
  }
  if (kit.sneak && foe && !foe.person && (weapon.finesse || weapon.range) && !afflicted().attackDis) {
    const fresh = core.battle ? !core.battle.sneaked : core.clock >= (core.sneakAt ?? 0);
    const flanked = fightingAllies().some((ally) => Math.hypot(ally.position.x - foe.x, ally.position.z - foe.z) < 2.5);
    if (fresh && (keen || mods.advantage || flanked)) {
      mods.more.push(kit.sneak);
      mods.sneak = true;
    }
  }
  if (melee && buffed("smiting")) {
    const slotted = byTurns() && core.settings.srdSlots;
    const slot = slotted ? slotFor(1, slotsNow(), core.save.slotsUsed) : valueOf(sheetNow(), "mana") >= 1 ? 1 : 0;
    if (slot > 0) {
      const kin = foe && !foe.person ? statsOf(foe).kin : "";
      mods.more.push(`${Math.min(5, 1 + slot) + (kin === "undead" || kin === "fiend" ? 1 : 0)}d8`);
      mods.smite = slot;
    }
  }
  return mods;
}

/** A blow has been rolled with `mods`: what it counted on is spent, and what it did besides its damage is told. */
function strikeSpent(mods, result, foe) {
  if (mods.inspired) core.buffs = lift(core.buffs, "inspired");
  if (buffed("hidden")) core.buffs = lift(core.buffs, "hidden"); // (an attack gives them away)
  if (buffed("helped")) core.buffs = lift(core.buffs, "helped");
  if (!result.hit) return;
  const notes = [];
  if (mods.sneak) {
    core.sneakAt = core.clock + 6;
    if (core.battle) core.battle.sneaked = true;
    notes.push(`Sneak Attack (${kitNow().sneak} of that)`);
  }
  if (mods.smite) {
    if (byTurns() && core.settings.srdSlots) useOne(mods.smite);
    else setSheet(applyChanges(sheetNow(), [{ stat: "mana", by: -mods.smite }]).sheet);
    core.buffs = lift(core.buffs, "smiting");
    notes.push("Divine Smite");
  }
  if (buffed("stunning") && foe && !foe.person) {
    core.buffs = lift(core.buffs, "stunning");
    const dc = 8 + (profNow() || 2) + Math.max(0, modifier(valueOf(sheetNow(), "wisdom")));
    const total = 1 + Math.floor(Math.random() * 20) + (statsOf(foe).saves?.constitution ?? 0);
    if (total < dc) core.herd.stun(foe.id, 6);
    notes.push(
      total < dc
        ? `it's stunned (its Constitution save ${total} against DC ${dc})`
        : `it shakes off the Stunning Strike (${total} against DC ${dc})`,
    );
  }
  if (notes.length) narrate(null, `${notes.join("; ")}.`);
}

/**
 * Something their class can call on is used (`id`: build.js abilities): from the bar in a fight by turns
 * (where it takes its action or bonus action), a number key, or the Sheet tab.
 */
function useAbility(id) {
  const ability = abilitiesNow().find((entry) => entry.id === id);
  if (!ability || !core.save || core.downed) return;
  const who = personaName();
  const notice = (words) => void core.hud?.setNotice(words);
  if (afflicted().helpless) return notice("You can't act: it has to wear off first.");
  if (ability.turns && !core.battle) return notice(`${ability.name} is for a fight by turns.`);
  const spend = Math.max(1, ability.spend);
  if (ability.left !== null && ability.left < spend)
    return notice(`No ${ability.name} left: a ${ability.per} rest brings it back.`);
  const sheet = sheetNow();
  const hp = entryOf(sheet, "hp");
  const level = valueOf(sheet, "level");
  if ((id === "wind" || id === "lay") && hp && hp.value >= hp.max) return notice("You're not hurt.");
  if (id === "wild" && core.shape) return notice("You're in a beast's shape already.");
  if (id === "unwild" && !core.shape) return notice("You're in your own shape.");
  if (core.battle) {
    if (!battleMine()) return notice("It isn't your turn yet.");
    if (ability.cost !== "free" && !battleSpend(ability.cost)) return;
  } else {
    if (core.clock < (core.abilityAt ?? 0)) return;
    core.abilityAt = core.clock + 0.8;
  }
  const mend = (amount, words) => {
    setSheet(applyChanges(sheetNow(), [{ stat: "hp", by: amount }]).sheet);
    const now = entryOf(sheetNow(), "hp");
    core.hud?.refreshInventory?.();
    spellFx().motes(core.space.scene, chest(core.player.position.x, core.player.position.z, 0), spellColour("heal"));
    narrate(null, `${words}: +${amount} HP (${now?.value ?? 0} of ${now?.max ?? 0}).`);
  };
  if (id === "shove" || id === "grapple") {
    const target = blowTarget();
    if (!target || target.person) return notice("There's nothing in reach.");
    if ((target.scale ?? 1) > 2) return void narrate(null, `${who} can't get a hold on something that size.`);
    core.gesture = "punch";
    const what = (PACK.animals[target.kind] ?? "the creature").replace(/^the /u, "");
    const rolled = contest(target);
    const told = `Athletics ${rolled.mine} against its ${rolled.theirs}`;
    if (!rolled.won) return void narrate(null, `${who} tries to ${id} the ${what} (${told}): it holds its ground.`);
    const at = core.player.position;
    if (id === "shove") {
      core.herd.push(target.id, at.x, at.z, 1.5);
      core.herd.stun(target.id, 3);
      foeFx(target.id).mark = core.clock + 6;
      spellFx().wave(core.space.scene, chest(target.x, target.z, 0.15), 0xd8c8a0, 2.5);
      return void narrate(null, `${who} shoves the ${what} (${told}): it's knocked back and down.`);
    }
    core.herd.root(target.id, 30);
    core.grappling = { id: target.id, until: core.clock + 30 };
    return void narrate(null, `${who} grapples the ${what} (${told}): it's held where it is.`);
  }
  if (id === "ready") {
    buff("readied", 6);
    return void narrate(null, `${who} holds their attack, ready for whatever comes within reach.`);
  }
  if (id === "wild") {
    const forms = wildForms(level);
    const kind = forms.includes(buildNow().form) ? buildNow().form : forms[0];
    if (!kind) return notice("There's no beast you can take the shape of yet.");
    useOne("wild");
    return void shapeInto(kind);
  }
  if (id === "unwild") return void unshape(`${who} takes their own shape again.`);
  if (id === "help") {
    if (!fightingAllies().length) return notice("There's nobody with you to help.");
    buff("helping", 30);
    return void narrate(null, `${who} makes an opening: a companion's next attack has advantage.`);
  }
  if (id === "hide") {
    const near = core.interior
      ? []
      : core.herd.foes(core.player.position, 20).filter((foe) => foe.hostile && !foe.fled);
    const notices = near.reduce((most, foe) => Math.max(most, 10 + (foeOf(foe.kind, foeTable()).perception ?? 0)), 10);
    const die = () => 1 + Math.floor(Math.random() * 20);
    // (Armour that hinders Stealth: the worse of two.)
    const roll = wornNow().armour?.noisy ? Math.min(die(), die()) : die();
    const total = roll + skillAdd("stealth");
    if (total < notices)
      return void narrate(null, `${who} tries to hide (Stealth ${total} against ${notices}): still in plain sight.`);
    buff("hidden", 30);
    if (!core.battle) core.herd.calm();
    return void narrate(
      null,
      `${who} slips out of sight (Stealth ${total} against ${notices}): the next attack has advantage${core.battle ? "" : ", and nothing comes for them while they stay hidden"}.`,
    );
  }
  if (id === "offhand") {
    const other = offhandOf(core.items ?? [], byDesc());
    const target = blowTarget();
    if (!other || !target || target.person) return notice("There's nothing in reach.");
    core.gesture = "strike";
    core.gestureHeld = other.held;
    return void landOn(target, other);
  }
  if (id === "wind") {
    useOne("wind");
    return void mend(rollDice("1d10").total + level, `${who} takes a Second Wind`);
  }
  if (id === "surge") {
    useOne("surge");
    if (core.battle) core.battle.action += 1;
    else buff("surging", 6);
    return void narrate(
      null,
      core.battle ? `${who} surges: one more action this turn.` : `${who} surges: twice as fast for a moment.`,
    );
  }
  if (id === "rage") {
    useOne("rage");
    buff("raging", 60);
    return void narrate(
      null,
      `${who} rages: +${kitNow().rage || 2} damage with what they swing, and half from weapons, teeth and claws, for a minute.`,
    );
  }
  if (id === "reckless") {
    buff("reckless", 6);
    return void narrate(null, `${who} attacks recklessly: advantage on their blows, and on blows at them.`);
  }
  if (id === "flurry") {
    useOne("ki");
    core.gesture = "punch";
    const target = blowTarget();
    if (!target || target.person) return void narrate(null, `${who} lashes out twice, at nothing.`);
    narrate(null, `${who} strikes in a flurry.`);
    if (!landOn(target, weaponNow())) {
      const still = core.herd.foes(core.player.position, 6).find((entry) => entry.id === target.id);
      if (still) landOn(still, weaponNow());
    }
    return;
  }
  if (id === "patient") {
    useOne("ki");
    if (core.battle) core.battle.dodging = true;
    else core.blockUntil = core.clock + 6;
    return void narrate(
      null,
      `${who} takes the Dodge action with ki: attacks on them are rolled twice, the worse counting.`,
    );
  }
  if (id === "stun") {
    useOne("ki");
    buff("stunning", 30);
    return void narrate(null, `${who} readies a Stunning Strike for the next blow that lands.`);
  }
  if (id === "lay") {
    const amount = Math.min(ability.left, (hp?.max ?? 0) - (hp?.value ?? 0));
    useOne("lay", amount);
    return void mend(amount, `${who} lays on hands`);
  }
  if (id === "smite") {
    buff("smiting", 30);
    return void narrate(null, `${who} readies a Divine Smite for the next blow that lands.`);
  }
  if (id === "inspire") {
    useOne("inspire");
    buff("inspired", 600);
    return void narrate(null, `${who} takes heart: a die more on the next attack roll.`);
  }
  if (id === "turn") {
    useOne("turn");
    const dc = 8 + (profNow() || 2) + Math.max(0, modifier(valueOf(sheet, "wisdom")));
    const at = core.player.position;
    spellFx().wave(core.space.scene, chest(at.x, at.z, 0.15), spellColour("radiant"), 9);
    const turned = [];
    for (const foe of core.interior ? [] : core.herd.foes(at, 9)) {
      const stats = statsOf(foe);
      if (stats.kin !== "undead") continue;
      const total = 1 + Math.floor(Math.random() * 20) + (stats.saves?.wisdom ?? 0);
      if (total < dc && core.herd.strike(foe.id, 0, stats.hp, "flee")) turned.push(foe.kind);
    }
    return void narrate(
      null,
      turned.length
        ? `${who} presents their holy symbol (Wisdom saves against DC ${dc}): ${turned.length} of the undead turn and flee.`
        : `${who} presents their holy symbol: nothing undead is near enough, or none of them falters.`,
    );
  }
  if (id === "font") {
    useOne("sorcery", 2);
    if (byTurns() && core.settings.srdSlots && (core.save.slotsUsed?.[1] ?? 0) > 0) {
      core.save = { ...core.save, slotsUsed: { ...core.save.slotsUsed, 1: core.save.slotsUsed[1] - 1 } };
      core.saves.write(core.save);
    } else setSheet(applyChanges(sheetNow(), [{ stat: "mana", by: 1 }]).sheet);
    core.hud?.refreshInventory?.();
    return void narrate(null, `${who} turns sorcery points into magic: a first-level slot's worth back.`);
  }
}

/**
 * A short rest (the Sheet tab's button): hit dice are spent to heal, each a roll of the class's die plus the
 * Constitution modifier, until they're whole or the dice are gone; what comes back on a short rest does; a
 * wizard's Arcane Recovery gives back half their level in mana or slot levels, once between sleeps.
 */
function shortRest() {
  if (!core.save || core.downed) return;
  const notice = (words) => void core.hud?.setNotice(words);
  if (core.battle) return notice("Not in a fight.");
  const at = core.player.position;
  if (!core.interior && core.herd.foes(at, 24).some((foe) => foe.hostile && !foe.fled))
    return notice("Not with enemies near.");
  if (core.clock < (core.restAt ?? 0)) return notice("You've only just rested.");
  core.restAt = core.clock + 120;
  const who = personaName();
  const classId = playerClass();
  let sheet = sheetNow();
  const level = valueOf(sheet, "level");
  const dice = hitDiceOf(classId, level);
  const con = modifier(valueOf(sheet, "constitution") + (wornNow(sheet).constitution ?? 0));
  let spent = 0;
  let healed = 0;
  let hp = entryOf(sheet, "hp");
  while (hp && hp.on !== false && hp.value < hp.max && usedOf("hitDice") + spent < dice.max) {
    const gain = Math.max(1, rollDice(`1d${dice.die}`).total + con);
    sheet = applyChanges(sheet, [{ stat: "hp", by: gain }]).sheet;
    hp = entryOf(sheet, "hp");
    healed += gain;
    spent += 1;
  }
  const used = { ...core.save.slotsUsed, ...(spent ? { hitDice: usedOf("hitDice") + spent } : {}) };
  let back = "";
  if (classId === "wizard" && !used.recovery) {
    let budget = Math.ceil(level / 2);
    if (core.settings.srdSlots) {
      for (let slot = 1; slot <= 5 && budget >= slot; slot++)
        while ((used[slot] ?? 0) > 0 && budget >= slot) {
          used[slot] -= 1;
          budget -= slot;
        }
    } else sheet = applyChanges(sheet, [{ stat: "mana", by: budget }]).sheet;
    used.recovery = 1;
    back = " Arcane Recovery brings some magic back.";
  }
  core.save = { ...core.save, slotsUsed: rested(used, "short", classId, level) };
  core.saves.write(core.save);
  setSheet(sheet);
  core.hud?.refreshInventory?.();
  narrate(
    null,
    `${who} takes a short rest${spent ? `: ${spent} hit ${spent === 1 ? "die" : "dice"} for +${healed} HP (${hp?.value ?? 0} of ${hp?.max ?? 0})` : ""}. What a short rest restores is back.${back}`,
  );
}

/** The build for the Sheet tab: what's chosen, what can be, what the class can call on, and the hit dice. */
function buildInfo() {
  if (!core.save) return null;
  const classId = playerClass();
  const level = valueOf(sheetNow(), "level");
  const build = buildNow();
  const choices = skillChoices(classId, build.background, build.race);
  const dice = hitDiceOf(classId, level);
  const short = (ability) => ability.slice(0, 3);
  return {
    ...build,
    races: Object.entries(SRD_RACES).map(([id, race]) => ({
      id,
      label: `${race.name} (${Object.entries(race.add)
        .map(([ability, amount]) => `+${amount} ${short(ability)}`)
        .join(", ")})`,
    })),
    styles: stylesFor(classId, level).map((id) => ({ id, label: SRD_STYLES[id].name })),
    backgrounds: Object.entries(SRD_BACKGROUNDS).map(([id, entry]) => ({ id, label: entry.name })),
    skillCount: choices.count,
    skillList: choices.from.map((id) => ({ id, label: skillNamed(id)?.name ?? id })),
    given: choices.given.map((id) => skillNamed(id)?.name ?? id),
    abilities: abilitiesNow(),
    hitDice: { die: dice.die, max: dice.max, left: Math.max(0, dice.max - usedOf("hitDice")) },
    prof: profNow() || 2,
    // (A turn's numbers as they are now, and the spell slots: each can be changed in the Sheet tab.)
    turn: turnNow(),
    slots: Object.entries(slotsNow()).map(([slot, have]) => ({
      level: Number(slot),
      have,
      left: Math.max(0, have - (core.save.slotsUsed?.[slot] ?? 0)),
    })),
    slotsOn: !!core.settings.srdSlots && core.settings.fights === "turns",
    forms:
      classId === "druid"
        ? wildForms(level).map((kind) => ({
            id: kind,
            label: `${SRD_CREATURES[kind].name} (${SRD_CREATURES[kind].hp} HP, AC ${SRD_CREATURES[kind].ac})`,
          }))
        : [],
    featList: Object.entries(SRD_FEATS).map(([id, feat]) => ({
      id,
      name: feat.name,
      about: feat.about,
      has: !!build.feats?.includes(id),
      can: Object.entries(feat.needs).every(([ability, least]) => valueOf(sheetNow(), ability) >= least),
    })),
    card: ((card) => (card ? cardWords(card) : ""))(
      cardBuild(core.personas?.find((entry) => entry.id === core.personaId)?.sheet),
    ),
  };
}

/** One part of the build is changed in the Sheet tab (`field`: race | style | background | skills). */
function setBuild(field, value) {
  if (!core.save || !["race", "style", "background", "skills", "feats", "form"].includes(field)) return;
  core.save = { ...core.save, build: checkBuild({ ...buildNow(), [field]: value }, playerClass()) };
  core.saves.write(core.save);
  core.hud?.refreshInventory?.();
}

/** The build in a line for the model: "A Hill Dwarf fighter (Defense). Background: Acolyte. Proficient in Athletics, Insight." */
function buildWords() {
  const build = buildNow();
  const classId = playerClass();
  const parts = [];
  const race = SRD_RACES[build.race];
  if (race || classId)
    parts.push(
      `${race ? race.name : "A"}${classId ? ` ${SRD_CLASSES[classId].name.toLowerCase()}` : ""}${build.style ? ` (${SRD_STYLES[build.style].name})` : ""}${race?.dark ? ", who sees in the dark" : ""}.`.replace(
        /^A\./u,
        "",
      ),
    );
  if (build.background) parts.push(`Background: ${SRD_BACKGROUNDS[build.background].name}.`);
  const skills = skillsOf(build, classId).map((id) => skillNamed(id)?.name ?? id);
  if (skills.length) parts.push(`Proficient in ${skills.join(", ")}.`);
  return parts.filter(Boolean).join(" ");
}

/** Grappled, they strain against the hold: Strength or Dexterity, the better, against its DC. */
function tryEscape() {
  const sheet = sheetNow();
  const worn = wornNow(sheet);
  const of = (attribute) => modifier(valueOf(sheet, attribute) + (worn[attribute] ?? 0));
  const total = 1 + Math.floor(Math.random() * 20) + Math.max(skillAdd("athletics"), skillAdd("acrobatics"));
  const dc = core.grappleDc ?? 11;
  if (total >= dc) {
    core.afflicted = lift(core.afflicted, "grappled");
    narrate(null, `${personaName()} breaks free (${total} against DC ${dc}).`);
  } else narrate(null, `${personaName()} strains against the hold (${total} against DC ${dc}): still held.`);
}

/** What else shows beside the conditions: a spell being concentrated on, and dying. */
function statusChips() {
  const chips = Object.entries(core.buffs ?? {}).map(([name, left]) => ({
    id: name,
    label: BUFF_WORDS[name] ?? name,
    about: "",
    seconds: Math.ceil(left),
    good: true,
  }));
  if (core.shape)
    chips.push({
      id: "shape",
      label: `${SRD_CREATURES[core.shape.kind].name}'s shape: ${core.shape.hp} of ${core.shape.max} HP`,
      about: "",
      seconds: null,
      good: true,
    });
  if (core.conc?.until && core.conc.until <= core.clock) core.conc = null;
  if (core.conc?.until)
    chips.push({
      id: "conc",
      label: `Concentrating: ${core.conc.name}`,
      about: "Being hurt may break it; another such spell ends it.",
      seconds: Math.ceil(core.conc.until - core.clock),
    });
  if (core.dying)
    chips.push({
      id: "dying",
      label: `Dying (${core.dying.wins} saved, ${core.dying.losses} failed): next roll`,
      about: "Three successes and you hold on; three failures and you're beaten.",
      seconds: Math.max(0, Math.ceil(core.dying.at - core.clock)),
    });
  return chips;
}

// ── Concentration ──

/** The spell being concentrated on ends: what it held, slowed, calmed, hindered or marked is free of it. */
function breakConcentration(words) {
  const conc = core.conc;
  core.conc = null;
  if (!conc?.ids?.length) return;
  for (const id of conc.ids) {
    core.herd.clear(id);
    const fx = core.foeFx?.get(id);
    if (fx) fx.hinder = fx.mark = 0;
  }
  if (words) narrate(null, words);
}

/** Hurt while concentrating: a Constitution save (DC 10, or half the damage if that's more), or the spell ends. */
function concentrationHurt(damage) {
  if (!core.conc?.ids?.length || !core.settings.concentration) return;
  const thrown = playerSave("constitution", Math.max(10, Math.floor(damage / 2)));
  if (!thrown.saved)
    breakConcentration(`${personaName()}'s concentration on ${core.conc.name} breaks (${thrown.words}, failed).`);
}

// ── Cover ──

/** Half cover (+2 AC) when a tree or a boulder stands between `from` and `to` ({ x, z }), else 0. */
function coverBetween(from, to) {
  if (!core.settings.cover || core.interior || !core.world?.treeNear) return 0;
  const far = Math.hypot(to.x - from.x, to.z - from.z);
  for (let gone = 1.5; gone < far - 1.2; gone += 1) {
    const x = from.x + ((to.x - from.x) / far) * gone;
    const z = from.z + ((to.z - from.z) / far) * gone;
    if (core.world.treeNear(x, z, 0.7) >= 0 || core.world.rockNear(x, z, 0.9) >= 0) return 2;
  }
  return 0;
}

// ── Dying ──

/** At 0 HP with death saving throws on: down and dying, a roll every few seconds (dyingTick). */
function startDying() {
  core.downed = true;
  core.stayDown = false;
  core.downAt = performance.now();
  core.dying = { wins: 0, losses: 0, at: core.clock + 5 };
  core.gesture = "fall";
  core.walkTo = null;
  core.afflicted = {};
  breakConcentration("");
  core.herd.calm();
  core.angry?.clear();
  if (core.battle) battleEnd("");
  narrate(
    null,
    `${personaName()} falls, dying. A death saving throw every few seconds: three successes and they hold on, three failures and they're beaten.`,
  );
  const saveId = core.save?.id;
  later(2.3, () => {
    if (!core.dying || core.save?.id !== saveId || core.mode !== "walk") return;
    const { x, z } = core.player.position;
    core.seat = { x, z, angle: core.player.rotation.y, approach: { x, z }, ground: "lie", taken: "player" };
    core.mode = "sit";
  });
}

/** Up from dying, where they lie: with `hpTo` HP if given (else what healing gave them). */
function riseFromDying(words, hpTo = 0) {
  core.dying = null;
  core.downed = false;
  if (core.mode === "sit" && core.seat?.ground) {
    core.seat = null;
    core.mode = "walk";
    core.stillUntil = core.clock + 1;
  }
  if (hpTo) setSheet(applyChanges(sheetNow(), [{ stat: "hp", to: hpTo }]).sheet);
  narrate(null, words);
  core.hud?.refreshInventory?.();
}

/** The dying roll their death saving throws; healing gets them up at once. */
function dyingTick() {
  const dying = core.dying;
  if (!dying) return;
  if (!core.downed) return void (core.dying = null);
  const who = personaName();
  if ((entryOf(sheetNow(), "hp")?.value ?? 0) > 0) return void riseFromDying(`${who} is brought round.`);
  if (core.clock < dying.at) return;
  const thrown = deathSave(dying);
  core.dying = { wins: thrown.wins, losses: thrown.losses, at: core.clock + 5 };
  const tally = `${thrown.wins} saved, ${thrown.losses} failed`;
  if (thrown.outcome === "up") return void riseFromDying(`Death save: a 20. ${who} is up, with 1 HP.`, 1);
  if (thrown.outcome === "stable")
    return void riseFromDying(
      `Death save: ${thrown.roll}, a success (${tally}). ${who} is stable, and comes round with 1 HP.`,
      1,
    );
  const how = thrown.roll >= 10 ? "a success" : thrown.roll === 1 ? "a 1: two failures" : "a failure";
  narrate(null, `Death save: ${thrown.roll}, ${how} (${tally}).`);
  if (thrown.outcome !== "beaten") return;
  core.dying = null;
  core.downed = false;
  defeated(true);
}

/** Whom a creature goes for on its turn: the nearest, or (where the ruleset says how it picks) the most hurt, the weakest, or one who casts. */
function foeTarget(foe, targets) {
  const near = (entry) => Math.hypot(entry.x - foe.x, entry.z - foe.z);
  const nearest = targets.reduce((best, entry) => (near(entry) < near(best) ? entry : best));
  const wants = extrasOn() ? statsOf(foe).targets : "";
  const inReach = targets.filter((entry) => near(entry) <= TURN_MOVE + 3);
  if (!wants || inReach.length < 2) return nearest;
  const hp = entryOf(sheetNow(), "hp");
  const state = (entry) => (entry.id ? allyHp(entry.id) : { hp: hp?.value ?? 1, max: hp?.max ?? 1 });
  const hurt = (entry) => state(entry).hp / Math.max(1, state(entry).max);
  if (wants === "wounded") return inReach.reduce((best, entry) => (hurt(entry) < hurt(best) ? entry : best));
  if (wants === "weakest") return inReach.reduce((best, entry) => (state(entry).max < state(best).max ? entry : best));
  if (wants === "casters")
    return (
      inReach.find((entry) => (entry.id ? spellsOfPerson(entry.id).attack.length > 0 : spellsNow().length > 0)) ??
      nearest
    );
  return nearest;
}

/** The conditions run down (outside a fight by turns, where a turn counts them), hold the player, and are shown. */
function conditionsTick(dt) {
  if (core.buffs && Object.keys(core.buffs).length && !core.battle) core.buffs = tickConditions(core.buffs, dt);
  // (Hidden, outside a fight by turns: nothing comes for them.)
  if (buffed("hidden") && !core.battle) core.truceUntil = Math.max(core.truceUntil ?? 0, core.clock + 0.4);
  const others = statusChips();
  const has = core.afflicted && Object.keys(core.afflicted).length > 0;
  if (!has) {
    core.escapeAt = undefined;
    return void core.hud?.setConditions?.(others);
  }
  if (core.downed || !core.settings.conditions) core.afflicted = {};
  else if (!core.battle) core.afflicted = tickConditions(core.afflicted, dt);
  if (afflicted().still) {
    core.stillUntil = Math.max(core.stillUntil ?? 0, core.clock + 0.15);
    core.walkTo = null;
  }
  if (core.afflicted.grappled !== undefined && !core.battle) {
    core.escapeAt ??= core.clock + 3;
    if (core.clock >= core.escapeAt) {
      core.escapeAt = core.clock + 3;
      tryEscape();
    }
  }
  core.hud?.setConditions?.([...conditionChips(core.afflicted), ...others]);
}

/**
 * The conditions at the start of the player's turn in a fight by turns: a round (six seconds) comes off
 * each, a hold is strained against, and one who's prone gets up. { stood, mods }.
 */
function turnConditions() {
  if (core.buffs) core.buffs = tickConditions(core.buffs, 6);
  if (!core.afflicted || !Object.keys(core.afflicted).length) return { stood: false, mods: afflicted() };
  const stood = core.afflicted.prone !== undefined;
  core.afflicted = lift(tickConditions(core.afflicted, 6), "prone");
  if (core.afflicted.grappled !== undefined) tryEscape();
  return { stood, mods: afflicted() };
}

/**
 * What comes with a creature's blow that has landed (the SRD's): more damage of another kind, with a saving
 * throw for half where it has one (venom), and a condition, on a failed save or outright (knocked prone,
 * held). Told as it goes; the damage is taken here.
 */
function foeExtras(stats, what, event) {
  const who = personaName();
  const rider = stats.rider;
  if (rider && !core.downed) {
    const full = Math.max(1, rollDice(rider.damage).total);
    const thrown = rider.save ? playerSave(rider.save.attribute, rider.save.dc) : null;
    const dealt = !thrown || !thrown.saved ? full : rider.save.onSave === "half" ? Math.floor(full / 2) : 0;
    const hp = playerStruck({ hit: dealt > 0, damage: dealt, guarded: true }, event);
    narrate(
      null,
      thrown
        ? `The ${what}'s ${rider.type || "blow"} (${who}'s ${thrown.words}, ${thrown.saved ? "made" : "failed"}): ${dealt} more. ${who} has ${Math.max(0, hp?.value ?? 0)} of ${hp?.max ?? 0} HP.`
        : `And ${dealt} ${rider.type || "more"} with it. ${who} has ${Math.max(0, hp?.value ?? 0)} of ${hp?.max ?? 0} HP.`,
    );
    if (hp?.on !== false && (hp?.value ?? 1) <= 0) return void defeated();
  }
  const laid = stats.inflict;
  if (laid && core.settings.conditions && !core.downed && core.afflicted?.[laid.condition] === undefined) {
    const thrown = laid.save ? playerSave(laid.save.attribute, laid.save.dc) : null;
    const label = CONDITIONS[laid.condition]?.label.toLowerCase() ?? laid.condition;
    if (thrown?.saved) narrate(null, `${who} isn't ${label} (${thrown.words}).`);
    else if (afflictPlayer(laid.condition)) {
      if (laid.escape) core.grappleDc = laid.escape;
      narrate(null, `${who} is ${label}${thrown ? ` (${thrown.words}, failed)` : ""}.`);
    }
  }
}

/** Whether a creature with a breath has it ready: once used, a d6 each time it would attack brings it back on its number or more. */
function breathReady(id, breath) {
  const fx = foeFx(id);
  if (fx.breathSpent && 1 + Math.floor(Math.random() * 6) >= breath.recharge) fx.breathSpent = false;
  return !fx.breathSpent;
}

/** A creature's breath on the player: a saving throw for half, and it's spent until it comes back. */
function foeBreathes(event, what, stats) {
  const breath = stats.breath;
  foeFx(event.id).breathSpent = true;
  core.herd.act(event.id, "cast");
  const who = personaName();
  const at = core.player.position;
  const colour = spellColour(breath.type);
  spellFx().bolt(core.space.scene, chest(event.x, event.z, 1.1), chest(at.x, at.z), colour, { size: 2 });
  spellFx().burst(core.space.scene, chest(at.x, at.z, 0.5), colour, 2.2);
  if (core.clock < (core.dodgeUntil ?? 0))
    return void narrate(null, `The ${what} breathes ${breath.type} at ${who}, who rolls clear.`);
  const thrown = playerSave(breath.save.attribute, breath.save.dc);
  const full = Math.max(1, rollDice(breath.damage).total);
  const evades = kitNow().evasion && breath.save.attribute === "dexterity";
  const dealt = thrown.saved ? (evades ? 0 : Math.floor(full / 2)) : evades ? Math.floor(full / 2) : full;
  const hp = playerStruck({ hit: dealt > 0, damage: dealt }, event);
  narrate(
    null,
    `The ${what} breathes ${breath.type} over ${who} (${thrown.words}, ${thrown.saved ? "made: half" : "failed"}): ${dealt}. ${who} has ${Math.max(0, hp?.value ?? 0)} of ${hp?.max ?? 0} HP.`,
  );
  if (hp?.on !== false && (hp?.value ?? 1) <= 0) defeated();
}

/**
 * Adds something to the inventory as the game hands it over (bought, made, found, taken from a body): its
 * stats in a block at the end of its description, and the slot it's worn or held in, where it has one.
 */
function addItem(item) {
  const description = bracketed(item.description);
  const slot = slotOf({ ...item, description }, byDesc());
  return core.inventory.add({ ...item, description, ...(slot ? { defaultSlot: slot } : {}) });
}

/**
 * What's carried already, brought up to how items are written now, once in each world: a description that
 * states its stats loose has them moved into a block (so they go on counting), and anything worn or held
 * that has no slot is given one. Nothing is reworded, and what can't be changed is left as it is.
 */
async function bracketItems() {
  const saveId = core.save?.id;
  const items = await readItems().catch(() => []);
  if (!core.save || core.save.id !== saveId) return;
  for (const item of items) {
    const description = bracketed(item.description);
    const slot = item.defaultSlot ? "" : slotOf({ ...item, description }, byDesc());
    const fields = {
      ...(description !== String(item.description ?? "").trim() ? { description } : {}),
      ...(slot ? { defaultSlot: slot } : {}),
    };
    if (Object.keys(fields).length) await core.inventory.change(item.id, fields).catch(() => {});
  }
  if (!core.save || core.save.id !== saveId) return;
  core.save = { ...core.save, bracketed: true };
  core.saves.write(core.save);
  await readItems().catch(() => {});
  core.hud?.refreshInventory?.();
}

/** Whether an item's description is its stats (else its name links it to the SRD's weapon or armour). */
const byDesc = () => core.settings.gearByDescription !== false;
/** What's worn adds up to, by the gear rules that are on (combat.js gearWorn). */
const wornNow = (sheet = sheetNow()) => {
  const kit = kitNow();
  return gearWorn(sheet, core.items ?? [], {
    byDescription: byDesc(),
    rules: !!core.settings.srdModifiers,
    add: raceBonuses(buildNow().race),
    unarmored: kit.unarmored,
    defense: kit.defense,
  });
};
/** The player's proficiency bonus on an attack (none with the SRD's modifiers off), and in a spell's attack and DC. */
const profNow = () => (core.settings.srdModifiers ? proficiency(valueOf(sheetNow(), "level")) : 0);
const spellProf = () => (profNow() || 2) + (wornNow().spell ?? 0); // (and a Wand of the War Mage's)

/** How far a blow reaches from the player's middle (metres), and how wide of straight ahead (radians). */
const SWING_REACH = 1.9;
const SWING_ARC = 1.15;
/** How far through its clip a swing lands. */
const SWING_LANDS = 0.34;

/**
 * The player swings (F, or the Attack button): wherever they face, standing or on the move, with the weapon
 * they carry (combat.js weaponOf) or their hands. Nothing is aimed at: when the blow lands, whatever is in
 * front of them and in reach takes it. A swing can follow a swing a little before its clip ends. Where
 * fights are a narrated moment or a scene, the swing starts one with whatever is in reach.
 */
function swing() {
  const mode = fightMode();
  if (!mode || core.downed || core.carrying || !afoot() || core.clock < (core.strikeUntil ?? 0)) return;
  if (afflicted().helpless) return void core.hud?.setNotice("You can't act: it has to wear off first.");
  // (What's carried is read again now and then, behind the swing: the first of a session may be with bare hands.)
  if (!core.itemsAt || core.clock - core.itemsAt > 15) {
    core.itemsAt = core.clock;
    void readItems();
  }
  const weapon = weaponNow();
  // A bow, a crossbow or a sling they carry is shot when nothing is in reach of a swing: at whatever is
  // ahead within its range, or (with it equipped) at nothing at all.
  // (A weapon with reach lands a pace and a half further off.)
  const reach = swingReach(weapon);
  // (A beast shoots nothing. With no bow, a weapon that can be thrown is, at what's out of reach.)
  const shot = core.shape ? null : bowOf(core.items ?? [], byDesc());
  const bow =
    shot ?? (!core.shape && weapon.thrown ? { ...weapon, range: weapon.thrown, hurled: true, worn: false } : null);
  if (!aimInRange(Math.max(reach, bow?.range ?? 0), bow ? `the ${bow.name.toLowerCase()}` : "a swing")) return;
  if (bow && !blowTarget(reach)) faceEnemy(bow.range); // (nothing in reach of a swing: the bow turns to the nearest enemy)
  // (By turns they turn to whatever is in reach, so a creature at their side or back counts.)
  if (core.battle && !blowTarget(reach)) faceEnemy(reach);
  const near = blowTarget(reach);
  const far = bow && !near ? blowTarget(bow.range, SPELL_ARC, true) : null;
  // By turns: an Attack is a turn's action; outside a fight, a swing or a shot at something starts one.
  if (mode === "turns") {
    if (!core.battle) {
      const first = near ?? far;
      if (first && !first.person) return void battleStart(first.id);
    } else {
      // (With nothing in reach the attack isn't made, and the action is kept.)
      if (!near && !far)
        return void core.hud?.setNotice(
          `Out of range: ${bow ? `the ${bow.name.toLowerCase()} reaches ${bow.range} m` : `a swing reaches ${reach} m`}${nearestWords()}.`,
        );
      if (!battleAttack()) return;
    }
  }
  if (bow && !near && (far || bow.worn)) return void shoot(bow, mode);
  core.gesture = weapon.name ? "strike" : "punch";
  core.gestureHeld = weapon.held;
  const seconds = gestureSeconds(core.gesture) || 1;
  core.strikeUntil = core.clock + seconds * (buffed("surging") ? 0.3 : 0.6);
  const saveId = core.save?.id;
  later(seconds * SWING_LANDS, () => {
    if (core.save?.id !== saveId || fightMode() !== mode || core.downed) return;
    const foe = blowTarget(reach);
    if (!foe) return;
    if (foe.person) return void landOnPerson(foe, weapon);
    if (mode === "realtime" || mode === "turns") return void landOn(foe, weapon);
    const what = (PACK.animals[foe.kind] ?? "the creature").replace(/^the /u, "");
    encounter(foe, what, "player");
  });
}

/** What a swing would land on: the nearest animal in front of the player and in reach, or null. */
function blowTarget(reach = SWING_REACH, arc = SWING_ARC, people = true) {
  // (What's aimed at, when it's in reach, whichever way they face.)
  const aim = aimed();
  if (aim?.kind === "foe" && aim.far <= reach + aim.room) return aim.foe;
  const at = core.player.position;
  const facing = core.player.rotation.y;
  let foe = null;
  let nearest = Infinity;
  for (const entry of core.interior ? [] : core.herd.foes(at, reach + 2.5)) {
    const dx = entry.x - at.x;
    const dz = entry.z - at.z;
    const distance = Math.hypot(dx, dz);
    if (distance > reach + entry.room) continue;
    // (One right on top of them is hit whichever way they face.)
    const off = Math.abs(Math.atan2(Math.sin(Math.atan2(dx, dz) - facing), Math.cos(Math.atan2(dx, dz) - facing)));
    if (distance > entry.room + 0.5 && off > arc) continue;
    if (distance < nearest) {
      nearest = distance;
      foe = entry;
    }
  }
  // People too, where the player has allowed it (Settings → Inventory → Combat): whoever is nearer.
  if (people && core.settings.fightPeople && fighting())
    for (const person of core.crowd.present(core.space)) {
      if (core.crowd.isOut(person.id)) continue;
      const dx = person.position.x - at.x;
      const dz = person.position.z - at.z;
      const distance = Math.hypot(dx, dz);
      const off = Math.abs(Math.atan2(Math.sin(Math.atan2(dx, dz) - facing), Math.cos(Math.atan2(dx, dz) - facing)));
      if (distance > reach + 0.4 || (distance > 0.9 && off > arc) || distance >= nearest) continue;
      nearest = distance;
      foe = {
        person: true,
        id: person.id,
        name: nameFor(person.id, person.name),
        x: person.position.x,
        z: person.position.z,
      };
    }
  return foe;
}

/** A creature has gone down: its experience, and its day kept with the world so it stays gone for its days (showBeaten). */
function foeBeaten(foe, stats) {
  earnXp(stats.xp);
  const key = `${core.save.region ?? HOME_REGION}|${foe.id}`;
  core.save = { ...core.save, beaten: { ...core.save.beaten, [key]: core.social?.day ?? 0 } };
  core.saves.write(core.save);
}

// ── Spells ──

/** How wide of straight ahead a spell can be cast (radians). */
const SPELL_ARC = 0.6;

/** The spells on the sheet that do something by rule: [{ id, name, spell }] (combat.js spellIn). */
function spellsNow() {
  return sheetNow()
    .entries.filter((entry) => entry.kind === "spell" && entry.on)
    .map((entry) => ({ id: entry.id, name: entry.name, spell: spellIn(entry) }))
    .filter((entry) => entry.spell);
}
/** The spell that Z and the Cast button cast: the last one cast, else the first. */
const readySpell = (spells) => spells.find((entry) => entry.id === core.readySpell) ?? spells[0] ?? null;

/** The colour a spell is seen in: its kind of damage's, or mending's, or its effect's. */
const colourOf = (spell) =>
  spellColour(spell.damage ? spell.type : spell.heal ? "heal" : spell.effect?.kind === "flee" ? "fear" : "hold");
/** The world's spell effects (spellfx.js), made when first needed. */
const spellFx = () => (core.spellFx ??= createSpellFx());
/** A spell on its way from `from` to `to`, as that spell looks (spellfx.js spellLook); `options.then` runs as it lands. */
function castSeen(spell, scene, from, to, colour, options) {
  const fx = spellFx();
  const look = spellLook(spell);
  if (look === "cone") return void fx.cone(scene, from, to, colour, options);
  if (look === "beam") return void fx.beam(scene, from, to, colour, { ...options, jagged: spell.type === "lightning" });
  if (look === "column") return void fx.column(scene, to, colour, options);
  if (look === "volley") return void fx.volley(scene, from, to, colour, options);
  if (look === "touch") return void fx.touch(scene, to, colour, options);
  fx.bolt(scene, from, to, colour, options);
}
/** Chest height at (x, z), for where a bolt leaves and lands. */
const chest = (x, z, up = 1.2) => ({ x, y: (core.interior ? core.player.position.y : heightAt(x, z)) + up, z });

/**
 * Casts a spell (Z, the Cast button, or a spell's own button in the chat window): the one given, else the
 * one that's ready. It costs its mana whatever comes of it (a cantrip costs none). One that heals mends the
 * caster; the rest fly at the nearest creature (or person, where blows can land on people) ahead and in
 * the spell's range, which takes a spell attack or makes its saving throw as the bolt lands.
 */
function cast(id = null) {
  if (!fighting() || core.downed || core.carrying || !afoot() || core.clock < (core.castUntil ?? 0)) return;
  if (core.shape) return void core.hud?.setNotice("You can't cast in a beast's shape.");
  if (afflicted().helpless) return void core.hud?.setNotice("You can't act: it has to wear off first.");
  const spells = spellsNow();
  const chosen = (id && spells.find((entry) => entry.id === id)) || readySpell(spells);
  if (!chosen)
    return void core.hud?.setNotice(
      "You have no spell to cast. Inventory → Sheet has a list of the 5e SRD's to add from, and you can write your own.",
    );
  core.readySpell = chosen.id;
  const { name } = chosen;
  let spell = chosen.spell;
  if (spell.reaction)
    return void core.hud?.setNotice(`${name} casts itself when it's needed (Settings → Inventory → 5e rules).`);
  const sheet = sheetNow();
  // Aimed at something: it has to be in the spell's range (a creature for one that harms, a companion for one that mends).
  if (spell.heal && !spell.damage) {
    const friend = aimed();
    if (friend?.kind === "ally" && friend.far > spell.range)
      return void core.hud?.setNotice(
        `Out of range: ${friend.name} is ${friend.far.toFixed(1)} m away, and ${name} reaches ${spell.range} m.`,
      );
  } else if (!aimInRange(spell.range, name)) return;
  // Facing nothing, they turn to the nearest enemy the spell reaches, so it isn't cast at the empty air.
  if (!(spell.heal && !spell.damage)) faceEnemy(spell.range);
  // By turns: a spell is a turn's action (or its bonus action), and outside a fight one cast at something starts it.
  if (byTurns() && !core.battle && !(spell.heal && !spell.damage)) {
    const first = blowTarget(spell.range, SPELL_ARC, false);
    if (first) return void battleStart(first.id);
  }
  // What it's cast with: a spell slot (by turns, with slots on), else mana.
  const slotted = byTurns() && core.settings.srdSlots && spell.level >= 0;
  const slot = slotted ? slotFor(spell.level, slotsNow(), core.save.slotsUsed) : -1;
  if (slotted && slot === 0)
    return void core.hud?.setNotice(`No spell slot left for ${name} (level ${spell.level}). A sleep gives them back.`);
  if (!slotted && valueOf(sheet, "mana") < spell.cost)
    return void core.hud?.setNotice(`Not enough mana for ${name} (${spell.cost}). Sitting down brings it back.`);
  // By turns, a spell that harms needs something in its range: with nothing there it isn't cast, and costs nothing.
  if (core.battle && !(spell.heal && !spell.damage) && !blowTarget(spell.range, SPELL_ARC, true))
    return void core.hud?.setNotice(`Out of range: ${name} reaches ${spell.range} m${nearestWords()}.`);
  if (core.battle && !battleSpend(spell.bonus ? "bonus" : "action")) return;
  // (From a higher slot than its own it's the greater for it; a cantrip grows with the caster's level.)
  spell = spellGrown(spell, {
    slot: slotted ? slot : 0,
    level: core.settings.srdModifiers ? valueOf(sheet, "level") : 1,
  });
  if (slotted && slot > 0) {
    core.save = { ...core.save, slotsUsed: { ...core.save.slotsUsed, [slot]: (core.save.slotsUsed?.[slot] ?? 0) + 1 } };
    core.saves.write(core.save);
  } else if (!slotted && spell.cost > 0) setSheet(applyChanges(sheet, [{ stat: "mana", by: -spell.cost }]).sheet);
  core.gesture = "cast";
  core.castUntil = core.clock + 1.1;
  if (buffed("hidden")) core.buffs = lift(core.buffs, "hidden"); // (a spell gives them away)
  if (spell.conc && core.settings.concentration) {
    breakConcentration(core.conc?.ids?.length ? `${personaName()} lets ${core.conc.name} go.` : "");
    core.conc = { name, ids: [], until: 0 };
  }
  const who = personaName();
  const saveId = core.save?.id;
  const colour = colourOf(spell);
  later(0.25, () => {
    if (core.save?.id !== saveId || core.downed) return;
    const at = core.player.position;
    const scene = core.space.scene;
    const now = sheetNow();
    const wit = witOf(now, wornNow(now), castingNow());
    core.hud?.refreshInventory?.();
    if (spell.heal && !spell.damage) {
      const mended = Math.max(1, rollDice(spell.heal).total + Math.max(0, wit));
      // (On the companion aimed at, if one is; else on the caster.)
      const friend = aimed();
      if (friend?.kind === "ally" && friend.far <= spell.range) return void healAlly(friend, mended, name);
      setSheet(applyChanges(now, [{ stat: "hp", by: mended }]).sheet);
      const hp = entryOf(sheetNow(), "hp");
      spellFx().motes(scene, chest(at.x, at.z, 0), colour);
      narrate(null, `${who} casts ${name}: +${mended} HP (${hp?.value ?? 0} of ${hp?.max ?? 0}).`);
      return void core.hud?.refreshInventory?.();
    }
    const foe = blowTarget(spell.range, SPELL_ARC, true);
    const facing = core.player.rotation.y;
    const from = chest(at.x + Math.sin(facing) * 0.5, at.z + Math.cos(facing) * 0.5);
    const big = 1 + Math.min(1.5, spell.cost * 0.25); // (a greater spell is a greater light)
    if (!foe) {
      const far = Math.min(spell.range, 12);
      const to = chest(at.x + Math.sin(facing) * far, at.z + Math.cos(facing) * far);
      castSeen(spell, scene, from, to, colour, { size: big });
      return void narrate(null, `${who} casts ${name}, at nothing.`);
    }
    const to = chest(foe.x, foe.z, foe.person ? 1.2 : 0.7);
    // What it does is worked out as the bolt lands.
    castSeen(spell, scene, from, to, colour, {
      size: big,
      then: () => {
        if (core.save?.id !== saveId) return;
        if (foe.person) return void spellOnPerson(foe, name, spell, wit);
        const dealt = spellLands(foe, who, name, spell, wit, { x: at.x, z: at.z });
        // (One that drains: half of what it dealt comes back to the caster.)
        if (spell.drain && dealt > 1) {
          setSheet(applyChanges(sheetNow(), [{ stat: "hp", by: Math.floor(dealt / 2) }]).sheet);
          const hp = entryOf(sheetNow(), "hp");
          narrate(null, `${who} is mended by it: +${Math.floor(dealt / 2)} HP (${hp?.value ?? 0} of ${hp?.max ?? 0}).`);
          core.hud?.refreshInventory?.();
        }
      },
    });
  });
}

/**
 * A spell cast by `who` lands on a creature: its saving throw or the spell attack (`wit`: the caster's
 * modifier), its HP, what it does about it, an effect that holds it or sends it running, and all of it told.
 */
/** What a spell has left on a creature for a while: { hinder, mark } (each the clock time it wears off), by its id. */
function foeFx(id) {
  core.foeFx ??= new Map();
  if (!core.foeFx.has(id)) core.foeFx.set(id, {});
  return core.foeFx.get(id);
}
/**
 * With nothing ahead to aim at within `reach`, turns the player to the nearest enemy that is: a creature
 * that's hostile, already struck or in the fight (never a peaceful animal minding its own business), or
 * someone who's fighting back. With something ahead already, or no enemy near, they stay as they are.
 */
function faceEnemy(reach) {
  if (!fighting() || blowTarget(reach, SPELL_ARC, true)) return;
  const at = core.player.position;
  const inFight = new Set((core.battle?.order ?? []).map((entry) => entry.id));
  let best = null;
  let nearest = Infinity;
  const consider = (x, z, room) => {
    const distance = Math.hypot(x - at.x, z - at.z);
    if (distance - room > reach || distance >= nearest) return;
    nearest = distance;
    best = { x, z };
  };
  for (const foe of core.interior ? [] : core.herd.foes(at, reach + 2.5))
    if (!foe.fled && (foe.hostile || foe.hp !== undefined || inFight.has(foe.id))) consider(foe.x, foe.z, foe.room);
  if (core.angry?.size)
    for (const person of core.crowd.present(core.space))
      if (core.angry.has(person.id) && !core.crowd.isOut(person.id))
        consider(person.position.x, person.position.z, 0.4);
  if (!best) return;
  const angle = Math.atan2(best.x - at.x, best.z - at.z);
  core.player.rotation.y = angle;
  // (With a weapon drawn they face where the camera looks, so that turns with them.)
  if (weaponDrawn()) core.cameraYaw = angle + Math.PI;
}

/** Whether a creature is hindered (its attacks rolled twice, the worse counting) or marked (attacks on it, the better). */
const hindered = (id) => (core.foeFx?.get(id)?.hinder ?? 0) > core.clock;
const marked = (id) => (core.foeFx?.get(id)?.mark ?? 0) > core.clock;

/**
 * A spell lands on a creature, and on every other within its area of that one (each rolls for itself).
 * `from`: where it was cast from ({ x, z }; what it pushes, it pushes away from there). Returns the damage dealt in all.
 */
function spellLands(foe, who, name, spell, wit, from) {
  let dealt = spellOnFoe(foe, who, name, spell, wit, from);
  if (spell.area > 0) {
    spellFx().burst(core.space.scene, chest(foe.x, foe.z, 0.5), colourOf(spell), 1 + spell.area * 0.4);
    for (const other of core.herd.foes({ x: foe.x, z: foe.z }, spell.area + foe.room))
      if (other.id !== foe.id) dealt += spellOnFoe(other, who, name, spell, wit, from);
  }
  return dealt;
}

function spellOnFoe(foe, who, name, spell, wit, from = null) {
  const stats = statsOf(foe);
  // (A tree or a boulder in the way: +2 to its AC against a spell attack.)
  const cover = from && !spell.save && !spell.sure ? coverBetween(from, foe) : 0;
  const result = spellStrike({
    wit,
    spell,
    foe: cover ? { ...stats, ac: stats.ac + cover } : stats,
    prof: spellProf(),
  });
  const now = core.herd.foes({ x: foe.x, z: foe.z }, 40).find((entry) => entry.id === foe.id) ?? foe;
  const after = Math.max(0, (now.hp ?? stats.hp) - result.damage);
  const kind = result.effect?.kind;
  const nerve =
    !foe.hostile || kind === "flee"
      ? "flee"
      : result.damage > 0
        ? foeNerve(after, stats.hp, Math.random, extrasOn() ? stats.temperament : "")
        : "fight";
  const struck = core.herd.strike(foe.id, result.damage, stats.hp, nerve);
  if (!struck) return 0;
  if (!struck.down) {
    const seconds = result.effect?.seconds ?? 0;
    if (result.push > 0 && from) {
      spellFx().wave(core.space.scene, chest(foe.x, foe.z, 0.15), colourOf(spell), result.push + 1.5);
      core.herd.push(foe.id, from.x, from.z, result.push);
    }
    if (kind && kind !== "flee")
      spellFx().swirl(core.space.scene, chest(now.x, now.z, 0), colourOf(spell), seconds, 0.8 + foe.room);
    if (kind === "hold") core.herd.stun(foe.id, seconds);
    if (kind === "slow") core.herd.slow(foe.id, seconds);
    if (kind === "calm") core.herd.soothe(foe.id, seconds);
    if (kind === "hinder") foeFx(foe.id).hinder = core.clock + seconds;
    if (kind === "mark") foeFx(foe.id).mark = core.clock + seconds;
    if (kind && spell.conc && core.conc?.name === name && who === personaName()) {
      core.conc.ids.push(foe.id);
      core.conc.until = core.clock + seconds;
    }
    // (A ring round it for as long as it lasts, where it stands now.)
    if (kind && kind !== "flee") {
      const at = core.herd.foes({ x: now.x, z: now.z }, 12).find((entry) => entry.id === foe.id) ?? now;
      spellFx().ring(core.space.scene, chest(at.x, at.z, 0.15), colourOf(spell), seconds, 0.8 + foe.room);
    }
  }
  const what = (PACK.animals[foe.kind] ?? "the creature").replace(/^the /u, "");
  const told = spellWords({ who, name, what, spell, result, left: struck.hp, max: struck.max });
  narrate(null, struck.down ? `${told} (+${stats.xp} XP)` : told);
  if (struck.down) foeBeaten(foe, stats);
  return result.damage;
}

// ── Fights by turns ──

/** The spell slots the player has (the SRD's, for a full caster of their level). */
const slotsNow = () => {
  const ruled = slotsAt(valueOf(sheetNow(), "level"), SRD_SLOTS);
  // (Any the player has set for themselves in the Sheet tab stand in place of the table's.)
  const own = core.save?.slotsOwn?.[sheetKey()] ?? {};
  return Object.fromEntries(
    Object.entries(ruled).map(([slot, have]) => [slot, Number.isFinite(own[slot]) ? own[slot] : have]),
  );
};
/** The player sets how many spell slots of `level` they have (the Sheet tab); the table's own number puts it back to the rules. */
function setSlots(level, value) {
  if (!core.save || !(level >= 1 && level <= 9)) return;
  const ruled = slotsAt(valueOf(sheetNow(), "level"), SRD_SLOTS)[level] ?? 0;
  const many = Math.max(0, Math.min(20, Math.round(Number(value))));
  const own = { ...core.save.slotsOwn?.[sheetKey()] };
  if (!Number.isFinite(many) || many === ruled) delete own[level];
  else own[level] = many;
  core.save = { ...core.save, slotsOwn: { ...core.save.slotsOwn, [sheetKey()]: own } };
  core.saves.write(core.save);
  core.hud?.refreshInventory?.();
}
/**
 * The spell slots to show in place of mana: [{ level, left, have }] where spells are cast with them (combat
 * by turns, with "Fights by turns use spell slots" on), else null.
 */
function slotsShown() {
  if (!core.save || fightMode() !== "turns" || !core.settings.srdSlots) return null;
  return Object.entries(slotsNow())
    .filter(([, have]) => have > 0)
    .map(([level, have]) => ({
      level: Number(level),
      have,
      left: Math.max(0, have - (core.save.slotsUsed?.[level] ?? 0)),
    }));
}
/** Whether it's the player's turn in the fight going on. */
const battleMine = () => !!core.battle && core.battle.order[core.battle.at]?.kind === "player";

/** The player's own class (an SRD class's id), if they've chosen one in Inventory → Sheet; "" for none. */
function playerClass() {
  const chosen = core.save?.classes?.player;
  return chosen && SRD_CLASSES[chosen] ? chosen : "";
}

/** What each of the player's turns gives: by their class and level, or the numbers they've set (combat.js turnBudget). */
function turnNow() {
  const s = core.settings;
  return turnBudget(
    playerClass(),
    valueOf(sheetNow(), "level"),
    { actions: s.turnActions, bonus: s.turnBonus, attacks: s.turnAttacks, move: s.turnMove },
    SRD_RACES[buildNow().race]?.speed ?? TURN_MOVE, // (a dwarf, a gnome or a halfling goes 7.5 m a turn)
  );
}

/**
 * Takes one of the player's actions or bonus actions for this turn (`which`: "action" | "bonus"). False, with
 * a word why, when it isn't their turn or they have none left.
 */
function battleSpend(which) {
  const battle = core.battle;
  if (!battle) return true;
  if (!battleMine()) {
    core.hud?.setNotice("It isn't your turn yet.");
    return false;
  }
  if (!(battle[which] > 0)) {
    core.hud?.setNotice(
      which === "bonus"
        ? "You've used your bonus action this turn."
        : "You've used your action this turn. End your turn (T).",
    );
    return false;
  }
  battle[which] -= 1;
  return true;
}

/** An attack in a fight by turns: one of those an Attack action already gave, else an action (which gives its attacks). */
function battleAttack() {
  const battle = core.battle;
  if (!battle) return true;
  if (battleMine() && battle.attacks > 0) {
    battle.attacks -= 1;
    return true;
  }
  if (!battleSpend("action")) return false;
  battle.attacks = turnNow().attacks - 1;
  return true;
}

/** What's been used since the last sleep, of what a class gives so many times between rests (kept with the spell slots). */
const usedOf = (what) => core.save?.slotsUsed?.[what] ?? 0;
function useOne(what, amount = 1) {
  core.save = { ...core.save, slotsUsed: { ...core.save.slotsUsed, [what]: usedOf(what) + amount } };
  core.saves.write(core.save);
}

/** The circle that shows how far this turn's movement reaches, drawn again (a Dash widens it). */
function drawReach() {
  const battle = core.battle;
  battle?.ring?.remove();
  if (!battle?.from) return;
  battle.ring = spellFx().circle(core.space.scene, chest(battle.from.x, battle.from.z, 0.12), battle.reach, 0xffe9a8);
}

/**
 * What a turn can be spent on besides attacking and casting (the bar's buttons), each with whether it can be
 * done now: the SRD's Dash, Disengage and Dodge, and what the player's class adds.
 */
function battleActs() {
  const battle = core.battle;
  if (!battle || !battleMine()) return [];
  const action = battle.action > 0;
  const bonus = battle.bonus > 0;
  return [
    {
      id: "dash",
      label: "Dash (A)",
      title: "An action: you can go twice as far this turn",
      ready: action,
      basic: true,
    },
    {
      id: "disengage",
      label: "Disengage (A)",
      title: "An action: moving away draws no opportunity attacks this turn",
      ready: action && !battle.disengaged,
      basic: true,
    },
    {
      id: "dodge",
      label: "Dodge (A)",
      title: "An action: attacks on you are rolled twice, the worse counting, until your next turn",
      ready: action && !battle.dodging,
      basic: true,
    },
    // What their class can call on (build.js abilities), each for what it takes of the turn.
    ...abilitiesNow().map((ability) => ({
      id: ability.id,
      label: `${ability.name}${tagged(costMark(ability.cost), ability.left)}`,
      title: `${ability.cost === "free" ? "" : ability.cost === "bonus" ? "A bonus action. " : "An action. "}${ability.about}`,
      ready:
        (ability.cost === "free" || (ability.cost === "bonus" ? bonus : action)) &&
        (ability.left === null || ability.left >= Math.max(1, ability.spend)) &&
        !(ability.id === "bdisengage" && battle.disengaged),
    })),
  ];
}

/** One of the bar's buttons is pressed (`id`: battleActs). */
function battleAct(id) {
  const battle = core.battle;
  const act = battleActs().find((entry) => entry.id === id);
  if (!battle || !act?.ready) return;
  const who = personaName();
  if (id === "dodge") return void dodge();
  if (id === "dash" || id === "bdash") {
    if (!battleSpend(id === "dash" ? "action" : "bonus")) return;
    battle.reach += turnNow().move;
    drawReach();
    return void narrate(null, `${who} takes the Dash action: twice as far this turn.`);
  }
  if (id === "disengage" || id === "bdisengage") {
    if (!battleSpend(id === "disengage" ? "action" : "bonus")) return;
    battle.disengaged = true;
    return void narrate(null, `${who} takes the Disengage action: moving away draws no attacks this turn.`);
  }
  useAbility(id);
}

/** The creatures that would be in a fight begun at the creature `id`: it, and every hostile one near the player. */
function battleFoes(id) {
  const at = core.player.position;
  return core.herd
    .foes(at, 26)
    .filter((foe) => !foe.fled && (foe.id === id || (foe.hostile && Math.hypot(foe.x - at.x, foe.z - at.z) < 16)));
}

/**
 * A fight by turns begins (a creature came for the player, or they swung or cast at one): everyone in it
 * rolls initiative, those creatures wait for their turns, and the order is told. `surprised`: the player and
 * their companions didn't see it coming, and lose their first turn.
 */
function battleStart(id, surprised = false) {
  if (core.battle || !byTurns() || core.downed || core.interior) return;
  const foes = battleFoes(id);
  if (!foes.length) return;
  const sheet = sheetNow();
  const what = (foe) => (PACK.animals[foe.kind] ?? "the creature").replace(/^the /u, "");
  const sides = [
    { id: "player", kind: "player", name: personaName(), bonus: modifier(valueOf(sheet, "dexterity")) },
    ...fightingAllies().map((person) => ({
      id: person.id,
      kind: "ally",
      name: nameFor(person.id, person.name),
      bonus: 1,
    })),
    ...foes.map((foe, i) => ({
      id: foe.id,
      kind: "foe",
      name: foes.filter((other) => other.kind === foe.kind).length > 1 ? `${what(foe)} ${i + 1}` : what(foe),
      bonus: foeTable()[foe.kind]?.dex ?? Math.floor(statsOf(foe).attack / 2),
    })),
  ];
  const rolled = initiativeOrder(sides);
  const order = rolled.map((entry) => ({ ...sides.find((side) => side.id === entry.id), total: entry.total }));
  core.battle = {
    order,
    at: -1,
    round: 1,
    action: 0,
    bonus: 0,
    attacks: 0,
    from: null,
    reach: 0,
    ring: null,
    near: null,
    reacted: new Set(),
    disengaged: false,
    raging: false,
    surprised,
    wait: 0.6,
    step: "next",
    dodging: false,
  };
  core.herd.hold(foes.map((foe) => foe.id));
  core.walkTo = null;
  narrate(null, `A fight. Initiative: ${order.map((entry) => `${entry.name} ${entry.total}`).join(", ")}.`);
}

/**
 * A creature starts coming for the player while fights go by turns (herd.js's "chase"): the fight begins
 * now, before it can land anything. Whether they saw it coming is its Stealth (a d20 and its Dexterity)
 * against their passive Perception (10 and their Wisdom modifier): if not, they're surprised.
 */
function spotted(event) {
  if (core.downed || core.interior || core.mode === "talk") return;
  if (core.battle) return void battleJoin(event.id);
  const who = personaName();
  const what = (PACK.animals[event.kind] ?? "the creature").replace(/^the /u, "");
  const a = /^[aeiou]/iu.test(what) ? "An" : "A";
  const passive = 10 + skillAdd("perception");
  const stealth = 1 + Math.floor(Math.random() * 20) + (foeTable()[event.kind]?.dex ?? 0);
  const surprised = core.settings.surprise && stealth > passive;
  const rolled = `its Stealth ${stealth} against ${who}'s passive Perception ${passive}`;
  if (core.settings.surprise)
    narrate(
      null,
      surprised
        ? `${a} ${what} is nearly on ${who} before they know it (${rolled}): ${who} is surprised.`
        : `${who} sees ${a.toLowerCase()} ${what} coming (${rolled}).`,
    );
  battleStart(event.id, surprised);
  combatSay("start", { foe: event });
}

/** A creature comes at the player while fights go by turns: it starts a fight, or joins the one going on. */
function battleJoin(id) {
  if (!core.battle) return void battleStart(id);
  if (core.battle.order.some((entry) => entry.id === id)) return;
  const foe = core.herd.foes(core.player.position, 30).find((entry) => entry.id === id);
  if (!foe) return;
  const name = (PACK.animals[foe.kind] ?? "the creature").replace(/^the /u, "");
  core.battle.order.push({ id, kind: "foe", name, total: 0 });
  core.herd.hold(core.battle.order.filter((entry) => entry.kind === "foe").map((entry) => entry.id));
  narrate(null, `A ${name} joins the fight.`);
}

/** The fight is over: what waited is let go, and `words` say how it ended. */
function battleEnd(words) {
  if (!core.battle) return;
  core.battle.ring?.remove();
  core.battle = null;
  core.herd.hold([]);
  core.herd.calm();
  core.hud?.setBattle(null);
  if (words) narrate(null, words);
}

/** The player ends their turn (T, or the bar's button). */
function endTurn() {
  if (!battleMine()) return;
  core.battle.step = "next";
  core.battle.wait = 0.2;
}

/**
 * A fight by turns, each frame (`moved`: how far the player went this frame). On the player's turn it waits
 * for them: anywhere within their movement of where the turn began, their actions and bonus actions, then
 * End turn. A creature on its turn goes for whoever is nearest, as far as a turn allows, and attacks if it
 * gets there; one with a bow or spells uses them from where it stands. A companion does what their class
 * would (allyActs), from where they stand. The fight ends when no creature in it is left standing, or the
 * player goes down.
 */
function battleTick(dt, moved) {
  const battle = core.battle;
  if (!battle) return;
  if (!byTurns() || core.interior || !core.save) return void battleEnd("");
  if (core.downed) return void battleEnd("");
  const at = core.player.position;
  // Who of the creatures is still in it: on its feet, not run off, not left far behind.
  const about = new Map(core.herd.foes(at, 45).map((foe) => [foe.id, foe]));
  const before = battle.order.length;
  battle.order = battle.order.filter((entry, i) => {
    const stays = entry.kind !== "foe" || (about.has(entry.id) && !about.get(entry.id).fled);
    if (!stays && i <= battle.at) battle.at -= 1;
    return stays;
  });
  if (battle.order.length !== before)
    core.herd.hold(battle.order.filter((entry) => entry.kind === "foe").map((entry) => entry.id));
  if (!battle.order.some((entry) => entry.kind === "foe")) return void battleEnd("The fight is over.");
  const allies = new Map(fightingAllies().map((person) => [person.id, person]));
  const what = (foe) => (PACK.animals[foe.kind] ?? "the creature").replace(/^the /u, "");
  if (battleMine()) {
    // Opportunity attacks: a creature whose reach they walk out of gets one strike as they go (once a
    // round each), unless they took the Disengage action.
    const close = new Set();
    for (const entry of battle.order) {
      const foe = entry.kind === "foe" ? about.get(entry.id) : null;
      if (foe && !foe.stunned && Math.hypot(foe.x - at.x, foe.z - at.z) <= 1.7 + foe.room) close.add(foe.id);
    }
    if (core.settings.opportunity && battle.near && moved > 0.001 && !battle.disengaged)
      for (const id of battle.near) {
        const foe = about.get(id);
        if (close.has(id) || battle.reacted.has(id) || !foe || foe.stunned) continue;
        battle.reacted.add(id);
        core.herd.act(id, "strike");
        narrate(null, `The ${what(foe)} strikes as ${personaName()} moves away: an opportunity attack.`);
        foeAttacks({ id, kind: foe.kind, scale: foe.scale, x: foe.x, z: foe.z }, what(foe));
        if (core.downed) return void battleEnd("");
      }
    battle.near = close;
  } else if (battle.ring) {
    battle.ring.remove();
    battle.ring = null;
  }
  const current = battle.order[battle.at];
  battle.wait -= dt;
  if (battle.wait <= 0 && battle.step === "next") {
    // On to whoever is next (a companion who's down, or gone, is passed over).
    do {
      battle.at += 1;
      if (battle.at >= battle.order.length) {
        battle.at = 0;
        battle.round += 1;
      }
    } while (battle.order[battle.at].kind === "ally" && !allies.has(battle.order[battle.at].id));
    const next = battle.order[battle.at];
    if (battle.surprised && battle.round === 1 && next.kind !== "foe") {
      // (Surprised: no moving and no acting on the first turn.)
      narrate(null, `${next.name} is surprised, and loses the turn.`);
      battle.step = "next";
      battle.wait = 0.7;
    } else {
      battle.step = next.kind === "player" ? "mine" : "move";
      if (next.kind === "player") {
        const turn = turnNow();
        battle.action = turn.actions;
        battle.bonus = turn.bonus;
        battle.attacks = 0;
        battle.from = { x: at.x, z: at.z };
        // (In the saddle it's the mount's speed: a horse's 18 metres, a donkey's 12.)
        battle.reach = core.mode === "ride" && core.mount ? (core.mount.kind === "horse" ? 18 : 12) : turn.move;
        // (Conditions: getting up from prone takes half the turn's movement; held, they go nowhere;
        // paralyzed, stunned or asleep, the turn is lost.)
        const state = turnConditions();
        if (state.stood) battle.reach = Math.floor(battle.reach / 2);
        if (state.mods.slow) battle.reach = Math.floor(battle.reach / 2);
        if (state.mods.still) battle.reach = 0;
        if (state.mods.helpless) {
          battle.action = 0;
          battle.bonus = 0;
          narrate(null, `${personaName()} can't act this turn.`);
        }
        battle.near = null;
        battle.reacted = new Set();
        battle.disengaged = false;
        battle.dodging = false;
        battle.sneaked = false;
        drawReach();
      }
      battle.wait = 0.5;
    }
  } else if (battle.wait <= 0 && current?.kind === "foe") {
    const foe = about.get(current.id);
    // Whom it goes for: the player or a companion, whoever is nearest.
    const targets = [
      { id: null, x: at.x, z: at.z },
      ...[...allies.values()].map((person) => ({ id: person.id, x: person.position.x, z: person.position.z })),
    ];
    const target = foeTarget(foe, targets);
    const far = Math.hypot(target.x - foe.x, target.z - foe.z);
    const reach = 1.2 + foe.room;
    // (One with a bow or spells that reach from where it stands stays there and uses them.)
    const stats = statsOf(foe);
    const range =
      core.settings.rangedFoes && core.settings.srdCreatures
        ? Math.max(
            stats.ranged?.range ?? 0,
            stats.spells ? 18 : 0,
            // (One with its breath ready uses it from as far as it reaches.)
            extrasOn() && stats.breath && !core.foeFx?.get(foe.id)?.breathSpent ? stats.breath.reach : 0,
          )
        : 0;
    let shoots = far > reach + 0.9 && far <= range;
    // The AI's move for it (Settings → Inventory → Combat), asked for as its turn begins; the fight waits a
    // few seconds for it, and goes on without it after that.
    if (battle.step === "asking") {
      battle.step = "move"; // (no answer in time: it does what its sort does)
    } else if (battle.step === "move" && core.settings.combatAiMoves && !foe.stunned && battle.plan?.id !== foe.id) {
      const asked = battle;
      asked.plan = { id: foe.id, move: "" };
      asked.step = "asking";
      asked.wait = 8;
      void askMove(foe, stats, target, far, reach, range).then((answer) => {
        if (core.battle !== asked || asked.plan?.id !== foe.id || asked.step !== "asking") return;
        asked.plan.move = answer?.move ?? "";
        if (answer?.line && core.settings.combatTalk) sayInFight({ foe }, answer.line);
        asked.step = "move";
        asked.wait = 0;
      });
      return;
    }
    const plan = battle.plan?.id === foe.id ? battle.plan.move : "";
    if (plan === "close") shoots = false;
    if (plan === "shoot" || plan.startsWith("cast:") || plan === "mend") shoots = true;
    if (battle.step === "move" && plan === "flee" && !foe.stunned) {
      core.herd.strike(foe.id, 0, stats.hp, "flee");
      sayInFight({ foe }, ""); // (nothing said; the run is told)
      narrate(null, `The ${what(foe)} turns and runs.`);
      battle.step = "next";
      battle.wait = 0.8;
    } else if (battle.step === "move" && plan === "back" && !foe.stunned) {
      const way = far > 0.01 ? { x: (foe.x - target.x) / far, z: (foe.z - target.z) / far } : { x: 1, z: 0 };
      core.herd.march(foe.id, foe.x + way.x * TURN_MOVE, foe.z + way.z * TURN_MOVE, target.x, target.z);
      battle.step = "act";
      battle.wait = 2;
    } else if (battle.step === "move") {
      if (foe.stunned) {
        battle.step = "next";
        battle.wait = 0.6;
      } else {
        // One that shoots or casts moves to cover, or off from whoever is crowding it (as far as a turn
        // allows); else it stays to shoot, or closes in.
        const spot = (plan === "cover" || (!plan && tacticsOn())) && range > 0 ? coverSpot(foe, target, range) : null;
        // (Told to shoot or cast from too far: it comes as near as it must. Told to close in: it does.)
        const keep = plan === "close" ? reach : range > 0 ? range - 2 : reach;
        const go = spot || (shoots && far <= range) ? 0 : Math.max(0, Math.min(TURN_MOVE, far - keep));
        const way = far > 0.01 ? { x: (target.x - foe.x) / far, z: (target.z - foe.z) / far } : { x: 0, z: 0 };
        if (spot) core.herd.march(foe.id, spot.x, spot.z, target.x, target.z);
        else core.herd.march(foe.id, foe.x + way.x * go, foe.z + way.z * go, target.x, target.z);
        battle.step = "act";
        battle.wait = Math.min(2.4, 0.5 + (spot ? spot.walk : go) / 5);
      }
    } else {
      const event = { id: foe.id, kind: foe.kind, scale: foe.scale, x: foe.x, z: foe.z, target: target.id };
      // (What the AI chose, where it's something it can still do from here.)
      if (plan === "shoot" || plan.startsWith("cast:") || plan === "mend") event.force = plan;
      const strikes = far <= reach + 0.9 && !event.force;
      if (event.force && far > range && plan !== "mend") delete event.force;
      shoots = !!event.force || (shoots && far <= range);
      if (strikes || shoots) core.herd.act(foe.id, strikes ? "strike" : "cast");
      if (strikes) {
        if (target.id) allyAttacked(event, what(foe));
        else foeAttacks(event, what(foe));
      } else if (shoots) foeShoots(event, what(foe));
      battle.plan = null;
      battle.step = "next";
      battle.wait = shoots ? 1.3 : 0.9;
    }
  } else if (battle.wait <= 0 && current?.kind === "ally") {
    const person = allies.get(current.id);
    const foes = battle.order
      .filter((entry) => entry.kind === "foe")
      .map((entry) => about.get(entry.id))
      .filter(Boolean);
    if (battle.step === "move" && person && foes.length) {
      // (A round comes off whatever is on them.)
      if (core.allyFx?.has(person.id)) core.allyFx.set(person.id, tickConditions(allyFx(person.id), 6));
      // They close with the nearest (as far as a turn allows) or keep their distance, as their class would.
      const from = person.position;
      const foe = foes.reduce((best, entry) =>
        Math.hypot(entry.x - from.x, entry.z - from.z) < Math.hypot(best.x - from.x, best.z - from.z) ? entry : best,
      );
      const caster = allyKeepsOff(person.id);
      const far = Math.hypot(foe.x - from.x, foe.z - from.z);
      const go = caster || allyMods(person.id).still ? 0 : Math.max(0, Math.min(TURN_MOVE, far - (1.5 + foe.room)));
      if (go > 0.3)
        core.crowd.fightTo(
          person.id,
          from.x + ((foe.x - from.x) / far) * go,
          from.z + ((foe.z - from.z) / far) * go,
          2.2,
        );
      battle.step = "act";
      battle.wait = Math.min(2.2, 0.4 + go / 4);
    } else {
      const hp = entryOf(sheetNow(), "hp");
      if (person && foes.length) allyActs(person, foes, !!hp && hp.value < hp.max / 2);
      battle.step = "next";
      battle.wait = 1;
    }
  }
  // The bar along the top.
  const slots = core.settings.srdSlots ? slotsNow() : null;
  const out = battle.from ? Math.hypot(at.x - battle.from.x, at.z - battle.from.z) : 0;
  core.hud?.setBattle({
    round: battle.round,
    order: battle.order.map((entry, i) => ({ name: entry.name, kind: entry.kind, current: i === battle.at })),
    mine: battleMine(),
    out: Math.round(out * 10) / 10,
    reach: battle.reach,
    action: battle.action,
    attacks: battle.attacks,
    bonus: battle.bonus,
    acts: battleActs(),
    target: aimWords(),
    slots: slots
      ? Object.entries(slots)
          .filter(([, have]) => have > 0)
          .map(([level, have]) => `L${level} ${have - (core.save.slotsUsed?.[level] ?? 0)}/${have}`)
          .join(" ")
      : "",
  });
}

// ── Hotkeys ──

/**
 * What a number key can be set to (the Inventory window's Hotkeys tab): [{ value, label, group }]. A spell
 * of the sheet that does something by rule; something carried, to use up; something with a slot in
 * Quartermaster, to put on and take off again (nothing can be put on without a slot).
 */
function hotkeyOptions() {
  const names = [...new Set((core.items ?? []).map((item) => String(item.name ?? "").trim()).filter(Boolean))];
  const slotted = new Set(
    (core.items ?? []).filter((item) => item.defaultSlot).map((item) => String(item.name ?? "").trim()),
  );
  return [
    ...spellsNow().map((entry) => ({
      value: `spell:${entry.id}`,
      label: `${entry.name}${entry.spell.cost ? ` (${entry.spell.cost} mana)` : " (cantrip)"}`,
      group: "Cast a spell",
    })),
    ...abilitiesNow().map((ability) => ({
      value: `ability:${ability.id}`,
      label: ability.name,
      group: "Use what your class can call on",
    })),
    ...names
      .filter((name) => slotted.has(name))
      .map((name) => ({ value: `equip:${name}`, label: name, group: "Put on or take off" })),
    ...names
      .filter((name) => !slotted.has(name))
      .map((name) => ({ value: `use:${name}`, label: name, group: "Use (one is used up)" })),
  ];
}

/** What a hotkey's setting is called on its button: "Fire Bolt", "Iron axe", "Health potion". */
function hotkeyLabel(value) {
  const [kind, ...rest] = String(value).split(":");
  const what = rest.join(":");
  if (kind === "ability") return abilitiesNow().find((ability) => ability.id === what)?.name ?? "Ability";
  if (kind !== "spell") return what;
  return sheetNow().entries.find((entry) => entry.id === what)?.name ?? "Spell";
}

/**
 * A number key is pressed (or its button in the chat window): it does what the player set it to. A spell is
 * cast (where fights are in real time, as Z would the ready one); something carried is used up; something
 * with a slot is put on, or taken off if it's on.
 */
async function hotkey(key) {
  const value = core.save?.hotkeys?.[key];
  if (!value || core.downed || core.hotBusy) return;
  const [kind, ...rest] = String(value).split(":");
  const what = rest.join(":");
  if (kind === "spell") {
    if (!fighting())
      return void core.hud?.setNotice("Spells are cast in real-time combat: Settings → Inventory → Combat.");
    return void cast(what);
  }
  if (kind === "ability") return void useAbility(what);
  if (!core.inventory.ready())
    return void core.hud?.setNotice("That needs your inventory, which the Quartermaster package keeps.");
  core.hotBusy = true;
  try {
    const item = (await readItems()).find(
      (entry) =>
        String(entry.name ?? "")
          .trim()
          .toLowerCase() === what.toLowerCase(),
    );
    if (!item) return void core.hud?.setNotice(`You have no ${what}.`);
    if (kind === "use") {
      if (core.battle && !battleSpend("action")) return;
      await itemAction(item.id, "use");
    } else await itemAction(item.id, String(item.location ?? "").startsWith("equipped:") ? "unequip" : "equip");
    core.itemsAt = core.clock; // (what's in hand may have changed: the next swing reads it fresh)
    core.hud?.refreshInventory?.();
  } catch (error) {
    core.hud?.setNotice(error?.message ?? String(error));
  } finally {
    core.hotBusy = false;
  }
}

// ── Creatures' numbers ──

/** The pack's creatures with the SRD's numbers where it has them (HP, AC, attack, damage, initiative); the rest the pack's own. */
const SRD_FOES = {
  ...PACK.foes,
  ...Object.fromEntries(
    Object.entries(SRD_CREATURES).map(([kind, { name: _name, ...numbers }]) => [
      kind,
      { ...PACK.foes[kind], ...numbers },
    ]),
  ),
};
/** The same without what they resist, shrug off or can't bear, for when kinds of damage are switched off. */
const SRD_FOES_PLAIN = Object.fromEntries(
  Object.entries(SRD_FOES).map(([kind, { resist: _r, immune: _i, vulnerable: _v, ...rest }]) => [kind, rest]),
);
/** How far each kind that can shoot or cast does so from (metres), for herd.js. */
const RANGED_KINDS = Object.fromEntries(
  Object.entries(SRD_CREATURES)
    .filter(([, creature]) => creature.ranged || creature.spells)
    .map(([kind, creature]) => [kind, Math.max(creature.ranged?.range ?? 0, creature.spells ? 18 : 0)]),
);
/** A creature's spell by its name, read as a rule: { name, level, spell }, or null when it isn't one a fight can play. */
const foeSpells = new Map();
function foeSpell(name) {
  if (!foeSpells.has(name)) {
    const found = SRD_SPELLS.find((spell) => spell.name === name);
    foeSpells.set(name, found ? { name, level: found.level, spell: spellIn({ about: spellRule(found) }) } : null);
  }
  return foeSpells.get(name);
}
/** The colour of an arrow or a bolt in flight. */
const ARROW = 0xd8c8a0;

/**
 * A creature shoots or casts from where it stands (herd.js's "attack" with `ranged`), at the player or the
 * companion it chose: a spell of its own that reaches, more often than not, else its bow or what it throws.
 * What comes of it is rolled as the shot lands.
 */
function foeShoots(event, what) {
  const stats = statsOf(event);
  const ally = event.target ? fightingAllies().find((person) => person.id === event.target) : null;
  if (event.target ? !ally : core.downed || core.mode === "talk") return;
  const to = ally ? ally.position : core.player.position;
  const far = Math.hypot(to.x - event.x, to.z - event.z);
  // (A breath, from as far as it reaches.)
  if (
    !event.force &&
    extrasOn() &&
    stats.breath &&
    !ally &&
    far <= stats.breath.reach &&
    breathReady(event.id, stats.breath)
  )
    return void foeBreathes(event, what, stats);
  const known = (stats.spells ?? []).map(foeSpell).filter(Boolean);
  const shot = stats.ranged?.range >= far ? stats.ranged : null;
  const fx = foeFx(event.id);
  const who = personaName();
  let chosen = null;
  // (A move chosen for it, by turns: what it shoots or casts is that.)
  const forced = event.force ?? "";
  if (forced && forced !== "mend") {
    chosen = forced.startsWith("cast:") ? (known.find((entry) => entry.name === forced.slice(5)) ?? null) : null;
    if (chosen?.level > 0) fx.casts = (fx.casts ?? 0) + 1;
  } else if (tacticsOn() || forced) {
    // The spell for the moment (tactics.js): mending itself when it's badly hurt, an area for a huddle, a hold
    // now and then, its strongest sometimes, a cantrip mostly. Its greater spells run out for the fight.
    const leveled = (fx.casts ?? 0) < greaterCasts(stats.cr);
    const mine = core.herd.foes({ x: event.x, z: event.z }, 6).find((entry) => entry.id === event.id);
    const mend =
      forced === "mend" || (mine?.hp !== undefined && mine.hp <= stats.hp * 0.4) ? mendSpell(known, leveled) : null;
    if (mend) {
      if (mend.level > 0) fx.casts = (fx.casts ?? 0) + 1;
      const now = core.herd.mend(event.id, Math.max(1, rollDice(mend.spell.heal).total + (stats.wit ?? 0)));
      spellFx().motes(core.space.scene, chest(event.x, event.z, 0), spellColour("heal"));
      return void narrate(
        null,
        `The ${what} casts ${mend.name} on itself: ${now?.hp ?? "?"} of ${now?.max ?? "?"} HP.`,
      );
    }
    const huddle = ally
      ? 1
      : 1 + fightingAllies().filter((other) => Math.hypot(other.position.x - to.x, other.position.z - to.z) < 4).length;
    chosen = pickSpell(
      known.filter((entry) => !ally || entry.spell.damage), // (a companion only takes what harms)
      { far, clustered: huddle, afflicted: !ally && afflicted().names.length > 0, leveled },
    );
    if (chosen && shot && Math.random() < 0.3) chosen = null; // (now and then what's in its hand)
    if (chosen?.level > 0) fx.casts = (fx.casts ?? 0) + 1;
  } else {
    const spells = known.filter(
      (entry) => entry.spell.damage && entry.spell.range >= far && (entry.level === 0 || Math.random() < 0.35),
    );
    chosen = spells.length && (!shot || Math.random() < 0.7) ? spells[Math.floor(Math.random() * spells.length)] : null;
  }
  if (!chosen && !shot) return;
  const saveId = core.save?.id;
  // (A spell is seen as that spell is: a fan, a beam, light from above. A shot is an arrow.)
  const flies = (options) =>
    chosen
      ? castSeen(
          chosen.spell,
          core.space.scene,
          chest(event.x, event.z, 1.1),
          chest(to.x, to.z),
          colourOf(chosen.spell),
          options,
        )
      : spellFx().bolt(core.space.scene, chest(event.x, event.z, 1.1), chest(to.x, to.z), ARROW, options);
  flies({
    size: chosen ? 1 : 0.4,
    then: () => {
      if (core.save?.id !== saveId) return;
      if (!chosen) {
        const verb = `${/bow/iu.test(shot.name) ? "shoots" : "throws"} its ${shot.name.toLowerCase()}`;
        const with_ = {
          attack: shot.attack,
          damage: shot.damage,
          damageBonus: 0,
          verb,
          cover: ally ? 0 : coverBetween(event, to),
        };
        return void (ally ? allyAttacked(event, what, with_) : foeAttacks(event, what, with_));
      }
      if (ally)
        return void allyAttacked(event, what, {
          attack: 2 + (stats.wit ?? 0),
          damage: chosen.spell.damage,
          damageBonus: 0,
          verb: `casts ${chosen.name}`,
        });
      if (core.downed) return;
      if (core.clock < (core.dodgeUntil ?? 0))
        return void narrate(null, `The ${what} casts ${chosen.name} at ${who}, who rolls clear.`);
      const countered = chosen.level <= 3 ? reactionSpell("counter") : "";
      if (countered)
        return void narrate(
          null,
          `The ${what} casts ${chosen.name} at ${who}, who answers with ${countered}: it comes to nothing.`,
        );
      // (One that takes an area catches the companions beside them too, each rolled for by itself.)
      if (chosen.spell.area > 0 && chosen.spell.damage) {
        spellFx().burst(core.space.scene, chest(to.x, to.z, 0.5), colourOf(chosen.spell), 1 + chosen.spell.area * 0.4);
        for (const other of fightingAllies())
          if (Math.hypot(other.position.x - to.x, other.position.z - to.z) <= chosen.spell.area + 0.5)
            allyAttacked({ ...event, target: other.id }, what, {
              attack: 2 + (stats.wit ?? 0),
              damage: chosen.spell.damage,
              damageBonus: 0,
              verb: `casts ${chosen.name}`,
            });
      }
      // (One that only holds or hinders: their saving throw, and what it leaves on them if it fails.)
      if (!chosen.spell.damage) {
        const left = conditionFor(chosen.spell.effect?.name);
        const thrown = chosen.spell.save
          ? playerSave(chosen.spell.save.attribute.toLowerCase(), 10 + (stats.wit ?? 0))
          : null;
        const took = !thrown?.saved && !!left && afflictPlayer(left, chosen.spell.effect.seconds);
        return void narrate(
          null,
          `The ${what} casts ${chosen.name} at ${who}${thrown ? ` (${thrown.words})` : ""}: ${
            took
              ? `${who} is ${CONDITIONS[left].label.toLowerCase()} for ${chosen.spell.effect.seconds} seconds`
              : "nothing comes of it"
          }.`,
        );
      }
      const sheet = sheetNow();
      const result = spellAtPlayer({
        wit: stats.wit ?? 0,
        spell: chosen.spell,
        sheet,
        worn: wornNow(sheet),
        saveBonus: chosen.spell.save ? saveBonus(chosen.spell.save.attribute.toLowerCase()) : 0,
      });
      // (Evasion: a Dexterity save made takes nothing, and one failed only half.)
      if (kitNow().evasion && chosen.spell.save?.attribute.toLowerCase() === "dexterity")
        result.damage = result.saved ? 0 : Math.floor(result.damage / 2);
      const hp = playerStruck(result, event);
      narrate(
        null,
        castAtWords({
          name: `The ${what}`,
          spell: chosen.name,
          who,
          result,
          left: hp?.value ?? 0,
          max: hp?.max ?? 0,
        }),
      );
      // (What the spell leaves, it leaves on them too: a failed save or a hit.)
      const left = result.hit && !result.saved ? conditionFor(chosen.spell.effect?.name) : "";
      if (left && afflictPlayer(left, chosen.spell.effect.seconds))
        narrate(null, `${who} is ${CONDITIONS[left].label.toLowerCase()} for ${chosen.spell.effect.seconds} seconds.`);
      if (result.hit && hp?.on !== false && (hp?.value ?? 1) <= 0) defeated();
    },
  });
}

// ── Talk in fights ──

/** The last few lines told, for the AI (what just happened in the fight). */
const recentWords = (count = 6) =>
  core.momentLog
    .slice(-count)
    .map((entry) => `${entry.who && entry.who !== "Narrator" ? `${entry.who}: ` : ""}${entry.text}`)
    .join("\n");

/** What a creature is, for a prompt: "a bandit (it fights with a light crossbow)". */
function foeDescribed(foe) {
  const what = (PACK.animals[foe.kind] ?? "the creature").replace(/^the /u, "");
  const stats = statsOf(foe);
  const role = tacticsOn() ? roleOf(foe.kind, foe.id, foeOf(foe.kind, foeTable())) : "";
  const how =
    role === "caster" && stats.spells?.length
      ? `, a caster (${stats.spells.join(", ")})`
      : role === "ranged" && stats.ranged
        ? `, fighting with a ${stats.ranged.name.toLowerCase()}`
        : "";
  return `a ${what}${how}`;
}
/** Whether a creature of `kind` talks (a person, or a monster on a person's frame) rather than growls. */
const talks = (kind) => !!ANIMALS[kind]?.person || !!ANIMALS[kind]?.folk;

/**
 * Something said in a fight, now and then (Settings → Inventory → Combat → "Talk in fights"): a creature's
 * threat as it starts, a taunt when it lands a blow, a curse when it's hurt, a cry as it runs; a companion's
 * shout. `speaker`: { foe } or { person }. `moment`: start | hit | hurt | flee | win. Never more than one
 * every few seconds, nor from one speaker twice in a while. Written by the AI where that's on, else the game's
 * own lines.
 */
function combatSay(moment, speaker) {
  if (!core.settings.combatTalk || !fighting() || core.interior || core.downed) return;
  const id = speaker.foe?.id ?? speaker.person?.id;
  if (!id || core.clock < (core.talkAt ?? 0)) return;
  core.talkBy ??= new Map();
  if (core.clock < (core.talkBy.get(id) ?? 0)) return;
  if (Math.random() > ({ start: 0.8, flee: 0.7, win: 0.4 }[moment] ?? 0.3)) return;
  core.talkAt = core.clock + 6;
  core.talkBy.set(id, core.clock + 14);
  const person = speaker.person ?? null;
  const kind = speaker.foe?.kind;
  const speaks = !!person || talks(kind);
  const what = person ? nameFor(person.id, person.name) : (PACK.animals[kind] ?? "the creature").replace(/^the /u, "");
  const lines = PACK.combatTalk[person ? "ally" : speaks ? "outlaw" : "beast"];
  const written = pickLine(lines?.[moment] ?? [], `talk:${id}:${Math.floor(core.clock)}`, {
    kind: what,
    who: personaName(),
  });
  if (!core.settings.combatAiTalk) return void sayInFight(speaker, written);
  const moments = {
    start: "the fight is just starting",
    hit: `it has just landed a blow on ${personaName()}`,
    hurt: "it has just been hurt",
    flee: "it is losing, and running from the fight",
    win: "they have just beaten one of the creatures",
  };
  if (core.talkAsking) return void sayInFight(speaker, written);
  core.talkAsking = true;
  void core.ai
    .combatLine({
      worldName: core.save?.name ?? "",
      setting: core.save?.setting ?? "",
      speaker: person
        ? `${what}, ${personaName()}'s companion (a ${SRD_CLASSES[classOf(person.id)]?.name.toLowerCase() ?? "fighter"})`
        : foeDescribed(speaker.foe),
      talks: speaks,
      moment: moments[moment] ?? "the fight goes on",
      foe: person ? "the creatures attacking them" : personaName(),
      recent: recentWords(),
      connectionId: core.settings.textConnection || null,
    })
    .then((answer) => sayInFight(speaker, answer?.line || written))
    .catch(() => sayInFight(speaker, written))
    .finally(() => (core.talkAsking = false));
}

/** A line said in a fight, shown: in the chat, under who said it, and over a creature that talks. */
function sayInFight(speaker, line) {
  if (!line || !core.save) return;
  if (speaker.person) return void narrate(nameFor(speaker.person.id, speaker.person.name), line);
  const what = (PACK.animals[speaker.foe.kind] ?? "the creature").replace(/^the /u, "");
  if (!talks(speaker.foe.kind)) {
    // (An animal's is what it does: "bares its teeth", or a whole sentence of the game's own.)
    return void narrate(null, /^the /iu.test(line) ? line : `The ${what} ${line.replace(/[.!]*$/u, "")}.`);
  }
  narrate(`The ${what}`, line);
  const body = core.herd.bodyOf?.(speaker.foe.id);
  if (body) core.talk?.say(body, line.replace(/^[\u201c"]|[\u201d"]$/gu, ""), 4, `The ${what}`);
}

// ── The AI's moves, by turns ──

/**
 * What a creature can do on its turn, for the AI to choose from: [{ id, says }]. Close in (or strike where it
 * stands), shoot, each spell it knows that it can still cast, mend itself when hurt, take cover, back off, run.
 */
function moveOptions(foe, stats, far, reach, range) {
  const list = [{ id: "close", says: far <= reach + 0.9 ? "strike at them where it stands" : "close in and strike" }];
  if (stats.ranged)
    list.push({ id: "shoot", says: `shoot its ${stats.ranged.name.toLowerCase()} (${stats.ranged.range} m)` });
  const fx = foeFx(foe.id);
  const leveled = (fx.casts ?? 0) < greaterCasts(stats.cr);
  for (const entry of (stats.spells ?? []).map(foeSpell).filter(Boolean)) {
    if (entry.level > 0 && !leveled) continue;
    const spell = entry.spell;
    if (spell.heal && !spell.damage) {
      if (foe.hp !== undefined && foe.hp < stats.hp && !list.some((option) => option.id === "mend"))
        list.push({ id: "mend", says: `cast ${entry.name} on itself` });
      continue;
    }
    const does = spell.damage ? `${spell.damage} ${spell.type} damage` : (spell.effect?.name ?? "");
    list.push({
      id: `cast:${entry.name}`,
      says: `cast ${entry.name} (${does}${spell.area ? ", an area" : ""}, ${spell.range} m)`,
    });
  }
  if (range > 0) list.push({ id: "cover", says: "move behind a tree or a rock" });
  list.push({ id: "back", says: "back away from them" }, { id: "flee", says: "run from the fight" });
  return list;
}

/** Asks the AI for a creature's move this turn; resolves to { move, line } (move "" for none). Never rejects. */
async function askMove(foe, stats, target, far, reach, range) {
  const hp = entryOf(sheetNow(), "hp");
  const whom = target.id
    ? (() => {
        const person = fightingAllies().find((entry) => entry.id === target.id);
        const health = allyHp(target.id);
        return `${person ? nameFor(person.id, person.name) : "a companion"} (${health.hp} of ${health.max} HP), ${far.toFixed(1)} m away`;
      })()
    : `${personaName()} (${hp?.value ?? "?"} of ${hp?.max ?? "?"} HP), ${far.toFixed(1)} m away`;
  try {
    return await core.ai.combatMove({
      worldName: core.save?.name ?? "",
      setting: core.save?.setting ?? "",
      creature: foeDescribed(foe),
      talks: talks(foe.kind),
      state: `It has ${foe.hp ?? stats.hp} of ${stats.hp} HP.${afflicted().names.length ? ` They are ${afflicted().names.join(", ")}.` : ""}`,
      foe: whom,
      options: moveOptions(foe, stats, far, reach, range),
      recent: recentWords(),
      talk: !!core.settings.combatTalk && !!core.settings.combatAiTalk,
      connectionId: core.settings.textConnection || null,
    });
  } catch {
    return { move: "", line: "" };
  }
}

/** Whether creatures fight each by its own sort (tactics.js): roles, cover, a spell for the moment. */
const tacticsOn = () => !!core.settings.foeTactics && !!core.settings.srdCreatures;

/**
 * One creature's numbers in a fight (`foe`: anything with its kind, and its id and scale where it has them):
 * its kind's, as its own role fights with them. One that closes in has no bow to stand back with, an
 * archer no spells, and a bandit who casts has the spells of its kind's casters.
 */
function statsOf(foe) {
  const stats = foeOf(foe.kind, foeTable(), foe.scale);
  return tacticsOn() ? roleStats(stats, roleOf(foe.kind, foe.id, stats)) : stats;
}

/** How far a creature shoots or casts from, in a fight in real time (0: it closes in). */
function foeRange(foe) {
  if (!core.settings.rangedFoes || !core.settings.srdCreatures) return 0;
  const stats = statsOf(foe);
  const breath = extrasOn() && stats.breath && !core.foeFx?.get(foe.id)?.breathSpent ? stats.breath.reach : 0;
  return Math.max(stats.ranged?.range ?? 0, stats.spells?.length ? 18 : 0, breath);
}

/**
 * Where someone who shoots or casts would stand to fight `target` from `from` ({ x, z }): a spot a few
 * paces off that has a tree or a boulder between it and them, at a good distance, or (crowded) just a good
 * distance. Sixteen spots round where they are are looked at. null: stay put.
 */
function coverSpot(from, target, range) {
  // (Never further off than a few paces past where it likes to stand: else each spot found leads further away.)
  const most = Math.min(range, standoff(range) + 5);
  const far = Math.hypot(target.x - from.x, target.z - from.z);
  if (coverBetween(target, from) > 0 && far >= 4.5 && far <= most - 1) return null; // (behind something already)
  const spots = [];
  for (const walk of [3, 6])
    for (let i = 0; i < 8; i++) {
      const x = from.x + Math.sin((i * Math.PI) / 4) * walk;
      const z = from.z + Math.cos((i * Math.PI) / 4) * walk;
      if (core.space.blocked?.(x, z, 0.4) || waterAt(x, z).depth > 0.3) continue;
      const spot = { x, z, walk, far: Math.hypot(target.x - x, target.z - z) };
      spot.cover = coverBetween(target, spot) > 0;
      spots.push(spot);
    }
  return standSpot(spots, { range: most, crowded: far < 3.5 });
}

/**
 * Where each creature in the fight that shoots or casts wants to stand, looked at afresh every second or so
 * (herd.js walks them there between their shots): { [id]: { x, z } | null }.
 */
function tacticsTick() {
  if (!tacticsOn() || fightMode() !== "realtime" || core.interior || core.downed) return void (core.foeSpots = null);
  if (core.clock < (core.tacticsAt ?? 0)) return;
  core.tacticsAt = core.clock + 1.1;
  const at = core.player.position;
  const spots = new Map();
  for (const foe of core.herd.foes(at, 30)) {
    if (!foe.hostile || foe.fled) continue;
    const range = foeRange(foe);
    if (range > 0) spots.set(foe.id, coverSpot(foe, at, range));
  }
  core.foeSpots = spots;
}

/** What each creature is in a fight: the 5e SRD's numbers (Settings → Inventory → Combat), or the setting pack's own. */
function foeTable() {
  return core.settings?.srdCreatures ? (core.settings.damageTypes ? SRD_FOES : SRD_FOES_PLAIN) : PACK.foes;
}

// ── The party in a fight ──

/** Someone's class (an SRD class's id): what was chosen for them, else one of their own, always the same. */
function classOf(id) {
  const chosen = core.save?.classes?.[id];
  if (chosen && SRD_CLASSES[chosen]) return chosen;
  const carded = cardOf(id)?.classId; // (the class on their card's 5e sheet, where they have one)
  if (carded) return carded;
  const all = Object.keys(SRD_CLASSES);
  return all[hashString(`class:${id}`) % all.length];
}

/** A character's 5e sheet from their card, read (build.js cardBuild); null when they have none or cards aren't used. */
const cards = new Map();
function cardOf(id) {
  if (!core.settings.cardSheets) return null;
  if (!cards.has(id)) cards.set(id, cardBuild(core.engineCharacters?.find((entry) => entry.id === id)?.sheet));
  return cards.get(id);
}

/** What someone casts in a fight: the spells on their card's 5e sheet that a fight here can play, else their class's. */
const personSpells = new Map();
function spellsOfPerson(id) {
  const card = core.save?.classes?.[id] ? null : cardOf(id);
  if (!card?.spells.length) return spellsOfClass(classOf(id));
  if (!personSpells.has(id)) {
    const mine = card.spells
      .map((name) => SRD_SPELLS.find((spell) => spell.name.toLowerCase() === name.toLowerCase()))
      .filter((spell) => spell && spell.level <= Math.max(1, Math.ceil(card.level / 2)))
      .map((spell) => ({ name: spell.name, level: spell.level, spell: spellIn({ about: spellRule(spell) }) }));
    personSpells.set(id, {
      attack: mine.filter((entry) => entry.spell.damage || entry.spell.effect),
      heal: mine.filter((entry) => entry.spell.heal && !entry.spell.damage),
    });
  }
  const found = personSpells.get(id);
  return found.attack.length || found.heal.length ? found : spellsOfClass(classOf(id));
}

/**
 * The player's persona card's 5e sheet is taken into this world: class, level, race, background, style,
 * abilities (the race's increases taken back out, since the race adds them here), most HP, skills, and the
 * spells a fight here can play. Once for each persona in each world, unless `force` (the Sheet tab's button).
 */
function applyCard(force = false) {
  if (!core.save || !core.personaId) return false;
  const card = cardBuild(core.personas?.find((entry) => entry.id === core.personaId)?.sheet);
  if (!card) return false;
  if (!force && (!core.settings.cardSheets || core.save.cardApplied?.[sheetKey()])) return false;
  let sheet = sheetNow();
  const set = (id, field, value) => (sheet = changeSheet(sheet, { set: id, field, value }));
  const grown = raceBonuses(card.race);
  for (const [ability, score] of Object.entries(card.abilities)) set(ability, "value", score - (grown[ability] ?? 0));
  set("level", "value", card.level);
  if (card.hpMax) {
    set("hp", "max", card.hpMax);
    set("hp", "value", card.hpMax);
  }
  let learned = 0;
  for (const name of card.spells) {
    const spell = SRD_SPELLS.find((entry) => entry.name.toLowerCase() === name.toLowerCase());
    if (!spell || entryNamed(sheet, spell.name)) continue;
    sheet = changeSheet(sheet, { add: { kind: "spell", name: spell.name, about: spellRule(spell) } });
    learned += 1;
  }
  const classId = card.classId || playerClass();
  core.save = {
    ...core.save,
    classes: { ...core.save.classes, ...(card.classId ? { player: card.classId } : {}) },
    build: checkBuild(
      { race: card.race, style: card.style, background: card.background, skills: card.skills, extra: card.skills },
      classId,
    ),
    cardApplied: { ...core.save.cardApplied, [sheetKey()]: true },
  };
  core.saves.write(core.save);
  setSheet(sheet);
  core.hud?.refreshInventory?.();
  narrate(
    null,
    `${personaName()}'s 5e sheet from their persona card is in use: ${cardWords(card)}${learned ? `, with ${learned} of its spells` : ""}.`,
  );
  return true;
}
/** A card's sheet in a few words: "a level 3 Hill Dwarf fighter". */
const cardWords = (card) =>
  `a level ${card.level}${card.race ? ` ${SRD_RACES[card.race].name}` : ""}${card.classId ? ` ${SRD_CLASSES[card.classId].name.toLowerCase()}` : " character"}`;

/**
 * How a companion fights, by their class: "melee" (a barbarian, a fighter, a monk, a paladin, a rogue) closes in;
 * "ranged" (a ranger) shoots from a distance; "caster" (the rest) casts, and keeps a few paces off.
 */
function allyRole(id) {
  const classId = classOf(id);
  if (["barbarian", "fighter", "monk", "paladin", "rogue"].includes(classId)) return "melee";
  if (classId === "ranger") return "ranged";
  return spellsOfPerson(id).attack.length ? "caster" : "melee";
}
/** Whether a companion fights from a distance (and looks for cover), rather than closing in. */
const allyKeepsOff = (id) => allyRole(id) !== "melee";

/** What a class casts in a fight here: the SRD's spells of its list, cantrips and first level, read as rules. */
const classSpells = new Map();
function spellsOfClass(classId) {
  if (!classSpells.has(classId)) {
    const mine = SRD_SPELLS.filter((spell) => spell.level <= 1 && spell.classes.includes(classId)).map((spell) => ({
      name: spell.name,
      level: spell.level,
      spell: spellIn({ about: spellRule(spell) }),
    }));
    classSpells.set(classId, {
      attack: mine.filter((entry) => entry.spell.damage || entry.spell.effect),
      heal: mine.filter((entry) => entry.spell.heal && !entry.spell.damage),
    });
  }
  return classSpells.get(classId);
}

/** What a companion adds to an attack roll and to a spell (a simple +2 proficiency and +2 from their best score). */
const ALLY_ATTACK = 4;
const ALLY_WIT = 2;
const ALLY_REACH = 3.2; // metres within which a companion's weapon lands

/**
 * The party in a real-time fight (Settings → Inventory → Combat): every few seconds each companion with
 * the player does what their class would. One who can heal mends the player when they're below half their
 * HP. Else, at the nearest creature that's in the fight: a strike with their class's weapon when it's in
 * reach, a spell when it isn't (or as often as not when it is). Their rolls are told like the player's.
 * Nothing attacks them, and they have no HP of their own yet.
 */
function alliesTick(dt) {
  if (fightMode() !== "realtime" || !core.settings.partyFights || core.downed || core.interior) return;
  core.alliesAt = (core.alliesAt ?? 0) - dt;
  if (core.alliesAt > 0) return;
  core.alliesAt = 0.4;
  const at = core.player.position;
  // In the fight: hostile and already struck, or hostile and close to the player.
  const foes = core.herd
    .foes(at, 18)
    .filter((foe) => foe.hostile && (foe.hp !== undefined || Math.hypot(foe.x - at.x, foe.z - at.z) < 7));
  const hp = entryOf(sheetNow(), "hp");
  const hurt = !!hp && hp.on !== false && hp.value < hp.max / 2;
  // (A fight well over: the companions are whole again.)
  if (!foes.length && core.allyHp?.size && core.clock - (core.fightSeen ?? 0) > 30) {
    core.allyHp.clear();
    core.allyUsed?.clear();
  }
  if (!foes.length && !hurt) return;
  const party = new Set(core.crowd.party().map((member) => member.id));
  if (!party.size) return;
  core.allyNext ??= new Map();
  if (foes.length) core.fightSeen = core.clock;
  for (const person of core.crowd.present(core.space)) {
    if (!party.has(person.id) || core.crowd.isOut(person.id)) continue;
    // On the move the whole fight: toward the nearest creature in it, or round it.
    if (foes.length) {
      const from = person.position;
      const foe = foes.reduce((best, entry) =>
        Math.hypot(entry.x - from.x, entry.z - from.z) < Math.hypot(best.x - from.x, best.z - from.z) ? entry : best,
      );
      allyMoves(person, foe, allyKeepsOff(person.id));
    }
    if (core.clock < (core.allyNext.get(person.id) ?? 0)) continue;
    if (allyActs(person, foes, hurt)) core.allyNext.set(person.id, core.clock + 2.4 + Math.random() * 2.2);
  }
}

/** The companions who can be in a fight now: with the player, out of doors, on their feet. */
function fightingAllies() {
  if (!fighting() || !core.settings.partyFights || core.interior || !core.crowd) return [];
  const party = new Set(core.crowd.party().map((member) => member.id));
  if (!party.size) return [];
  return core.crowd.present(core.space).filter((person) => party.has(person.id) && !core.crowd.isOut(person.id));
}

/** A companion's HP in fights: their class's hit die and two, whole again once a fight is well over. */
function allyHp(id) {
  core.allyHp ??= new Map();
  if (!core.allyHp.has(id)) {
    // (Their card's most HP where its 5e sheet gives one; else a first-level one of their class.)
    // (Else by their class and level: the die and 2 at first level, half the die and 3 for each level after.)
    const die = SRD_CLASSES[classOf(id)].hitDie;
    const max =
      (core.save?.classes?.[id] ? 0 : cardOf(id)?.hpMax) || die + 2 + (allyLevel(id) - 1) * (Math.floor(die / 2) + 3);
    core.allyHp.set(id, { hp: max, max });
  }
  return core.allyHp.get(id);
}

/** A creature's attack on a companion (herd.js's "attack" with a `target`): rolled against their AC, and told. */
function allyAttacked(event, what, with_ = null) {
  const person = fightingAllies().find((entry) => entry.id === event.target);
  if (!person) return;
  const name = nameFor(person.id, person.name);
  // (`with_`: what it attacks with when that isn't its own teeth: a bow's or a spell's numbers, and how it's told.)
  const stats = { ...statsOf(event), ...with_ };
  const ac = foeTable().ally.ac;
  const roll = () => attackRoll({ bonus: stats.attack, ac, damage: stats.damage, damageBonus: stats.damageBonus ?? 0 });
  // (Down, held or blinded, they're easier to hit: the better of two. A hindered creature: the worse.)
  const keen = allyMods(person.id).defendAdv;
  const worse = hindered(event.id);
  const result = {
    ...(keen === worse ? roll() : rolledTwice(roll, keen)),
    ac,
    hindered: worse && !keen,
    ...(keen && !worse ? { keen: true } : {}),
  };
  if (result.hit && allyUsed(person.id).raging) {
    result.damage = Math.max(1, Math.floor(result.damage / 2)); // (Rage)
    result.detail += ", halved by Rage";
  }
  const health = allyHp(person.id);
  if (result.hit) {
    health.hp = Math.max(0, health.hp - result.damage);
    core.crowd.gesture(person.id, "hurt");
  }
  narrate(null, foeWords({ who: name, what, verb: stats.verb, result, left: health.hp, max: health.max }));
  if (result.hit && health.hp > 0 && health.hp < health.max / 2) combatSay("hurt", { person });
  if (result.hit && health.hp <= 0) allyDown(person.id, name, health);
  else if (result.hit && extrasOn() && !with_) allyExtras(person, name, stats, what, health);
  core.fightSeen = core.clock;
}

/**
 * Where a companion wants to be in a fight: one who strikes closes with the creature and works round it;
 * one who casts keeps a few paces off and moves along the edge of it. A side of their own each, changed now and then.
 */
function allyMoves(person, foe, caster) {
  if (allyMods(person.id).still) return; // (down, or held where they are)
  core.allySide ??= new Map();
  let side = core.allySide.get(person.id);
  if (!side || core.clock > side.until) {
    side = { way: Math.random() < 0.5 ? 1 : -1, until: core.clock + 3 + Math.random() * 4 };
    core.allySide.set(person.id, side);
  }
  const from = person.position;
  // (One who keeps off, with creatures that fight by their sort: behind a tree or a rock, where there's one near.)
  const hide = caster && tacticsOn() ? coverSpot(from, foe, 18) : null;
  if (hide) return void core.crowd.fightTo(person.id, hide.x, hide.z, 1.2);
  const around = Math.atan2(from.x - foe.x, from.z - foe.z) + side.way * (caster ? 0.35 : 0.6);
  const ring = caster ? 7.5 : 1.5 + foe.room;
  const spot = { x: foe.x + Math.sin(around) * ring, y: 0, z: foe.z + Math.cos(around) * ring };
  if (waterAt(spot.x, spot.z).depth > 0.3) return;
  core.crowd.fightTo(person.id, spot.x, spot.z, 1.2);
}

/** One companion's turn (alliesTick). Returns whether they did anything. */
function allyActs(person, foes, hurt) {
  const classId = classOf(person.id);
  const kind = SRD_CLASSES[classId];
  const spells = spellsOfPerson(person.id);
  const name = nameFor(person.id, person.name);
  const who = personaName();
  const from = person.position;
  const scene = core.space.scene;
  // What's on them: one who can't act loses the turn; one who's held strains against it.
  if (allyMods(person.id).helpless) return true;
  if (allyFx(person.id).grappled !== undefined && 1 + Math.floor(Math.random() * 20) + 2 >= 11) {
    core.allyFx.set(person.id, lift(allyFx(person.id), "grappled"));
    narrate(null, `${name} breaks free.`);
  }
  const own = allyHp(person.id);
  const used = allyUsed(person.id);
  // A barbarian rages as the fight begins; a fighter takes a Second Wind below half their HP, once a fight.
  if (classId === "barbarian" && foes.length && !used.raging) {
    used.raging = true;
    narrate(null, `${name} rages.`);
  }
  if (classId === "fighter" && !used.wind && own.hp < own.max / 2) {
    used.wind = true;
    const mended = rollDice("1d10").total + allyLevel(person.id);
    own.hp = Math.min(own.max, own.hp + mended);
    narrate(null, `${name} takes a Second Wind: +${mended} HP (${own.hp} of ${own.max}).`);
    return true;
  }
  // A healer gets a dying companion up before anything else.
  const fallen =
    spells.heal.length && core.allyDying?.size
      ? core.crowd
          .present(core.space)
          .find(
            (other) =>
              core.allyDying.has(other.id) && Math.hypot(other.position.x - from.x, other.position.z - from.z) < 14,
          )
      : null;
  if (fallen) {
    const chosen = spells.heal[0];
    const health = allyHp(fallen.id);
    health.hp = Math.min(health.max, Math.max(1, rollDice(chosen.spell.heal).total + ALLY_WIT));
    core.allyDying.delete(fallen.id);
    core.crowd.gesture(person.id, "cast", null, fallen.position.x, fallen.position.z);
    core.crowd.knockOut(fallen.id, 0.3); // (on their feet again in a moment)
    spellFx().motes(scene, chest(fallen.position.x, fallen.position.z, 0), colourOf(chosen.spell));
    narrate(
      null,
      `${name} casts ${chosen.name} on ${nameFor(fallen.id, fallen.name)}: up again, with ${health.hp} HP.`,
    );
    return true;
  }
  // A healer mends the player first (not more than once in a while).
  core.allyHealed ??= new Map();
  if (hurt && spells.heal.length && core.clock >= (core.allyHealed.get(person.id) ?? 0)) {
    const at = core.player.position;
    if (Math.hypot(at.x - from.x, at.z - from.z) < 14) {
      const chosen = spells.heal[Math.floor(Math.random() * spells.heal.length)];
      const mended = Math.max(1, rollDice(chosen.spell.heal).total + ALLY_WIT);
      core.allyHealed.set(person.id, core.clock + 12);
      core.crowd.gesture(person.id, "cast", null, at.x, at.z);
      setSheet(applyChanges(sheetNow(), [{ stat: "hp", by: mended }]).sheet);
      const hp = entryOf(sheetNow(), "hp");
      spellFx().motes(scene, chest(at.x, at.z, 0), colourOf(chosen.spell));
      narrate(null, `${name} casts ${chosen.name} on ${who}: +${mended} HP (${hp?.value ?? 0} of ${hp?.max ?? 0}).`);
      core.hud?.refreshInventory?.();
      return true;
    }
  }
  let foe = null;
  let distance = Infinity;
  for (const entry of foes) {
    const far = Math.hypot(entry.x - from.x, entry.z - from.z);
    if (far < distance) {
      distance = far;
      foe = entry;
    }
  }
  if (!foe) return false;
  // A spell: a cantrip mostly, now and then one of the first level; only what reaches.
  const inReach = distance <= ALLY_REACH + foe.room;
  const castable = spells.attack.filter(
    (entry) => entry.spell.range >= distance && (entry.level === 0 || Math.random() < 0.3),
  );
  // (One who closes in casts only now and then, and never with a creature in reach of their weapon.)
  const melee = allyRole(person.id) === "melee";
  if (castable.length && (melee ? !inReach && Math.random() < 0.3 : !inReach || Math.random() < 0.5)) {
    const chosen = castable[Math.floor(Math.random() * castable.length)];
    core.crowd.gesture(person.id, "cast", null, foe.x, foe.z);
    const saveId = core.save?.id;
    castSeen(chosen.spell, scene, chest(from.x, from.z), chest(foe.x, foe.z, 0.7), colourOf(chosen.spell), {
      then: () => {
        if (core.save?.id === saveId) spellLands(foe, name, chosen.name, chosen.spell, ALLY_WIT, from);
      },
    });
    return true;
  }
  // Out of reach: one whose class carries a bow or a crossbow shoots it; the rest keep by the player.
  const shot = !inReach && kind.ranged?.range >= distance ? kind.ranged : null;
  if (!inReach && !shot) return false;
  if (shot) {
    core.crowd.gesture(person.id, "cast", null, foe.x, foe.z);
    const saveId = core.save?.id;
    spellFx().bolt(scene, chest(from.x, from.z), chest(foe.x, foe.z, 0.7), ARROW, {
      size: 0.4,
      then: () => {
        if (core.save?.id !== saveId) return;
        const now = core.herd.foes({ x: foe.x, z: foe.z }, 40).find((entry) => entry.id === foe.id);
        if (now) allyStrikes(person, now, { name: shot.name, damage: shot.damage, range: shot.range });
      },
    });
    return true;
  }
  // A strike with their class's weapon.
  return allyStrikes(person, foe, { name: kind.weapon.name, damage: kind.weapon.damage });
}

/** A companion's level: their card's where its 5e sheet gives one, else the player's own. */
const allyLevel = (id) =>
  (core.save?.classes?.[id] ? 0 : cardOf(id)?.level) || Math.max(1, valueOf(sheetNow(), "level"));
/** What a companion's class has always on at their level (build.js passives). */
const allyKit = (id) => passives(classOf(id), allyLevel(id));
/** What a companion adds to an attack roll: their proficiency bonus, and +2 from their best score. */
const allyAttack = (id) => proficiency(allyLevel(id)) + 2;
/** The conditions on a companion (conditions.js's { [condition]: seconds left }), and what they add up to. */
function allyFx(id) {
  core.allyFx ??= new Map();
  if (!core.allyFx.has(id)) core.allyFx.set(id, {});
  return core.allyFx.get(id);
}
const allyMods = (id) => conditionMods(core.settings.conditions ? core.allyFx?.get(id) : null);
/** What a companion has used in this fight: { raging, wind, smite }. Forgotten once the fight is well over. */
function allyUsed(id) {
  core.allyUsed ??= new Map();
  if (!core.allyUsed.has(id)) core.allyUsed.set(id, {});
  return core.allyUsed.get(id);
}

/**
 * A companion is at 0 HP. With death saving throws on they fall, dying, and roll as the player does
 * (alliesFxTick); else they're out of the fight for a while, then up again with half. Nobody dies.
 */
function allyDown(id, name, health) {
  core.allyFx?.delete(id);
  if (core.settings.deathSaves) {
    health.hp = 0;
    core.allyDying ??= new Map();
    core.allyDying.set(id, { wins: 0, losses: 0, at: core.clock + 6, name });
    if (core.crowd.knockOut(id, 900)) narrate(null, `${name} falls, dying.`);
    return;
  }
  health.hp = Math.ceil(health.max / 2);
  if (core.crowd.knockOut(id, 45)) narrate(null, `${name} goes down, out of the fight.`);
}

/** What comes with a creature's blow that has landed on a companion: venom and the like, and a condition. */
function allyExtras(person, name, stats, what, health) {
  const save = (attribute, dc) => {
    const trained = allyKit(person.id).saves.includes(attribute) ? proficiency(allyLevel(person.id)) : 0;
    const total = 1 + Math.floor(Math.random() * 20) + 2 + trained;
    return { saved: total >= dc, words: `${attribute} save: ${total} against DC ${dc}` };
  };
  const rider = stats.rider;
  if (rider) {
    const full = Math.max(1, rollDice(rider.damage).total);
    const thrown = rider.save ? save(rider.save.attribute, rider.save.dc) : null;
    const dealt = !thrown || !thrown.saved ? full : rider.save.onSave === "half" ? Math.floor(full / 2) : 0;
    health.hp = Math.max(0, health.hp - dealt);
    narrate(
      null,
      `The ${what}'s ${rider.type || "blow"}${thrown ? ` (${name}'s ${thrown.words}, ${thrown.saved ? "made" : "failed"})` : ""}: ${dealt} more. ${name} has ${health.hp} of ${health.max} HP.`,
    );
    if (health.hp <= 0) return void allyDown(person.id, name, health);
  }
  const laid = stats.inflict;
  if (!laid || !core.settings.conditions || allyFx(person.id)[laid.condition] !== undefined) return;
  const thrown = laid.save ? save(laid.save.attribute, laid.save.dc) : null;
  if (thrown?.saved) return;
  core.allyFx.set(person.id, afflict(allyFx(person.id), laid.condition, laid.condition === "grappled" ? 12 : 0));
  const label = CONDITIONS[laid.condition]?.label.toLowerCase() ?? laid.condition;
  narrate(null, `${name} is ${label}${thrown ? ` (${thrown.words}, failed)` : ""}.`);
}

/** The companions' conditions run down (outside a fight by turns, where their turn counts them), and the dying roll their death saves. */
function alliesFxTick(dt) {
  if (core.allyFx?.size && !core.battle)
    for (const [id, state] of core.allyFx) core.allyFx.set(id, tickConditions(state, dt));
  if (!core.allyDying?.size) return;
  for (const [id, dying] of core.allyDying) {
    if (core.clock < dying.at) continue;
    const health = allyHp(id);
    const thrown = deathSave(dying);
    const tally = `${thrown.wins} saved, ${thrown.losses} failed`;
    const told = `${dying.name}'s death save: ${thrown.roll === 20 ? "a 20" : thrown.roll}`;
    if (thrown.outcome === "up" || thrown.outcome === "stable") {
      core.allyDying.delete(id);
      health.hp = 1;
      core.crowd.knockOut(id, thrown.outcome === "up" ? 0.3 : 30);
      narrate(
        null,
        thrown.outcome === "up"
          ? `${told}. They're up, with 1 HP.`
          : `${told}, a success (${tally}). They're stable, and will come round.`,
      );
    } else if (thrown.outcome === "beaten") {
      core.allyDying.delete(id);
      health.hp = Math.ceil(health.max / 2);
      core.crowd.knockOut(id, 180);
      narrate(null, `${told}, a failure (${tally}). They're out cold, and will be a good while coming round.`);
    } else {
      core.allyDying.set(id, { ...dying, wins: thrown.wins, losses: thrown.losses, at: core.clock + 6 });
      narrate(null, `${told}, ${thrown.roll >= 10 ? "a success" : "a failure"} (${tally}).`);
    }
  }
}

/**
 * A companion's weapon lands (or doesn't) on a creature: rolled, told, and the creature beaten if that's what
 * comes of it. Their class is in it: proficiency by level, a rogue's Sneak Attack with someone beside the
 * creature, a paladin's Divine Smite once a fight, a barbarian's Rage, a monk's hands, a Champion's wider
 * critical, and a second blow from level 5 for those who have Extra Attack (`again`: this is that one).
 */
function allyStrikes(person, foe, weapon, again = false) {
  const name = nameFor(person.id, person.name);
  const stats = statsOf(foe);
  const classId = classOf(person.id);
  const kit = allyKit(person.id);
  const used = allyUsed(person.id);
  const melee = !weapon.range;
  const sides = (dice) => Number(/d(\d+)/u.exec(String(dice))?.[1] ?? 0);
  const more = [];
  const beside = [
    core.player.position,
    ...fightingAllies()
      .filter((other) => other.id !== person.id)
      .map((other) => other.position),
  ];
  const sneaks = !!kit.sneak && !again && beside.some((at) => Math.hypot(at.x - foe.x, at.z - foe.z) < 2.5);
  if (sneaks) more.push(kit.sneak);
  const smites = classId === "paladin" && allyLevel(person.id) >= 2 && melee && !used.smite;
  if (smites) more.push(stats.kin === "undead" || stats.kin === "fiend" ? "3d8" : "2d8");
  const roll = () =>
    attackRoll({
      bonus: allyAttack(person.id),
      ac: stats.ac,
      damage: melee && sides(kit.martial) > sides(weapon.damage) ? kit.martial : weapon.damage,
      damageBonus: 2 + (melee && used.raging ? kit.rage : 0),
      critFrom: kit.critFrom,
      more,
    });
  // (Helped by the player: the better of two, once. Poisoned, frightened, blinded or down: the worse.)
  const better = buffed("helping");
  const worse = allyMods(person.id).attackDis;
  const rolled = better === worse ? roll() : rolledTwice(roll, better);
  if (better) core.buffs = lift(core.buffs, "helping");
  // (What it's made of matters to some, as for the player's own.)
  const type =
    Object.values(SRD_WEAPONS).find((entry) => entry.name.toLowerCase() === weapon.name.toLowerCase())?.type ?? "";
  const typed = typedDamage(rolled.damage, type, stats);
  const result = {
    ...rolled,
    damage: typed.damage,
    how: typed.how,
    type,
    ...(worse && !better ? { hampered: true } : {}),
  };
  if (smites && result.hit) used.smite = true;
  const after = Math.max(0, (foe.hp ?? stats.hp) - result.damage);
  const struck = core.herd.strike(
    foe.id,
    result.damage,
    stats.hp,
    result.hit ? foeNerve(after, stats.hp, Math.random, extrasOn() ? stats.temperament : "") : "fight",
  );
  if (!struck) return false;
  const held = weaponIn({ name: weapon.name, description: `${weapon.damage} damage` })?.held ?? "sword";
  if (melee) core.crowd.gesture(person.id, "strike", held, foe.x, foe.z);
  const what = (PACK.animals[foe.kind] ?? "the creature").replace(/^the /u, "");
  const told = strikeWords({
    who: name,
    what,
    weapon,
    result: { ...result, ac: stats.ac },
    left: struck.hp,
    max: struck.max,
  });
  const with_ = result.hit
    ? [sneaks && "a Sneak Attack", smites && "a Divine Smite"].filter(Boolean).join(" and ")
    : "";
  narrate(null, `${struck.down ? `${told} (+${stats.xp} XP)` : told}${with_ ? ` (With ${with_}.)` : ""}`);
  if (struck.down) combatSay("win", { person });
  if (struck.down) foeBeaten(foe, stats);
  // Extra Attack: one more, at the same creature if it still stands.
  else if (!again && turnBudget(classId, allyLevel(person.id)).attacks > 1) {
    const still = core.herd.foes({ x: foe.x, z: foe.z }, 6).find((entry) => entry.id === foe.id);
    if (still) allyStrikes(person, still, weapon, true);
  }
  return true;
}

/** A spell lands on a person: their saving throw or the spell attack, and what comes of attacking someone. */
function spellOnPerson(target, name, spell, wit) {
  const stats = foeOf("person", foeTable());
  const result = spellStrike({ wit, spell, foe: stats, prof: spellProf() });
  const left = personHurt(target, result.damage, stats);
  narrate(
    null,
    spellWords({ who: personaName(), name, what: target.name, spell, result, left, max: stats.hp, named: true }),
  );
  // (Held by it, they drop where they stand for as long as it lasts.)
  if (result.effect?.kind === "hold" && left > 0) {
    core.crowd.knockOut(target.id, result.effect.seconds);
    spellFx().ring(core.space.scene, chest(target.x, target.z, 0.15), colourOf(spell), result.effect.seconds, 1);
  }
  // (Charmed or calmed, they leave off fighting and take it as no attack at all.)
  if (result.effect?.kind === "calm") {
    if (core.angry?.delete(target.id)) narrate(null, `${target.name} lets it go.`);
    return;
  }
  personAttacked(target, `cast ${name} at me`, `cast ${name} at ${target.name}`, result.damage > 0, left);
}

/**
 * Resting (Settings → Inventory → Sheet): sitting or lying down, on the ground or on anything, a point of
 * mana comes back every few seconds and a point of HP a little slower, until both are full.
 */
function restTick(dt) {
  if (!core.save || !core.settings.sheet || !core.settings.restRestores || core.mode !== "sit" || core.downed)
    return void (core.rested = 0);
  const before = core.rested ?? 0;
  core.rested = before + dt;
  const mana = Math.floor(core.rested / 4) - Math.floor(before / 4);
  const hp = Math.floor(core.rested / 6) - Math.floor(before / 6);
  if (!mana && !hp) return;
  const sheet = sheetNow();
  const short = (id) => {
    const entry = entryOf(sheet, id);
    return entry?.on !== false && "max" in (entry ?? {}) && entry.value < entry.max;
  };
  const changes = [
    ...(mana && short("mana") ? [{ stat: "mana", by: mana }] : []),
    ...(hp && short("hp") ? [{ stat: "hp", by: hp }] : []),
  ];
  if (!changes.length) return;
  setSheet(applyChanges(sheet, changes).sheet);
  core.hud?.refreshInventory?.();
}

/** Looses the player's bow at whatever is ahead within its range when the arrow leaves; what comes of it is rolled as it lands. */
function shoot(bow, mode) {
  core.gesture = "cast"; // ponytail: no draw-and-loose clip in the packs; the casting arm stands in until one is added
  core.strikeUntil = core.clock + 1.1;
  const saveId = core.save?.id;
  later(0.3, () => {
    if (core.save?.id !== saveId || fightMode() !== mode || core.downed) return;
    const at = core.player.position;
    const facing = core.player.rotation.y;
    const from = chest(at.x + Math.sin(facing) * 0.5, at.z + Math.cos(facing) * 0.5);
    const foe = blowTarget(bow.range, SPELL_ARC, true);
    if (!foe) {
      const reach = Math.min(bow.range, 14);
      return void spellFx().bolt(
        core.space.scene,
        from,
        chest(at.x + Math.sin(facing) * reach, at.z + Math.cos(facing) * reach),
        ARROW,
        { size: 0.4 },
      );
    }
    spellFx().bolt(core.space.scene, from, chest(foe.x, foe.z, foe.person ? 1.2 : 0.7), ARROW, {
      size: 0.4,
      then: () => {
        if (core.save?.id !== saveId) return;
        if (foe.person) return void landOnPerson(foe, bow);
        if (mode === "realtime" || mode === "turns") return void landOn(foe, bow, coverBetween(at, foe));
        encounter(foe, (PACK.animals[foe.kind] ?? "the creature").replace(/^the /u, ""), "player");
      },
    });
  });
}

/** How long someone knocked out lies there (seconds). */
const OUT_SECONDS = 120;

/**
 * A blow lands on a person: rolled like any other, against the pack's numbers for a person. Struck at or
 * struck, they remember it for good and are the player's enemy from then on; whoever saw it remembers too.
 * At 0 HP they're out cold for a while, then up again (nobody dies). Their HP is kept for the session.
 */
function landOnPerson(target, weapon) {
  const sheet = sheetNow();
  const stats = foeOf("person", foeTable());
  const result = playerStrike({ sheet, worn: wornNow(sheet), weapon, foe: stats, prof: profNow() });
  const left = personHurt(target, result.damage, stats);
  narrate(
    null,
    strikeWords({ who: personaName(), what: target.name, weapon, result, left, max: stats.hp, named: true }),
  );
  const with_ = weapon.name ? ` with ${/^[aeiou]/iu.test(weapon.name) ? "an" : "a"} ${weapon.name.toLowerCase()}` : "";
  personAttacked(target, `attacked me${with_}`, `attacked ${target.name}${with_}`, result.hit, left);
}

/** `target` (a person) takes `damage`: what HP they have left (kept for the session; they come round with half). */
function personHurt(target, damage, stats) {
  core.peopleHp ??= new Map();
  const left = Math.max(0, (core.peopleHp.get(target.id) ?? stats.hp) - damage);
  core.peopleHp.set(target.id, left > 0 ? left : Math.ceil(stats.hp / 2));
  return left;
}

/**
 * What comes of attacking someone, hit or miss (an attack is an attack): they remember it for good
 * (`mine`: "attacked me with an axe"), whoever saw remembers (`seen`: "attacked Mira with an axe"), they
 * are the player's enemy from then on unless how they see the player is locked, and at 0 HP they're out cold.
 */
function personAttacked(target, mine, seen, hurt, left) {
  const who = personaName();
  recall([target.id], `${who} ${mine}${hurt ? " and hurt me" : ""}`, false, "saw", true);
  recall(
    inSight().filter((id) => id !== target.id),
    `${who} ${seen}`,
    false,
    "saw",
  );
  if (!core.relations.get(target.id, PLAYER_ID)?.locked)
    setRelation(target.id, PLAYER_ID, { kind: "enemy", level: hurt ? 85 : 60, role: "" });
  if (left <= 0 && core.crowd.knockOut(target.id, OUT_SECONDS))
    narrate(null, `${target.name} lies where they fell, out cold.`);
  personAngry(target, left);
}

// ── People who fight back ──

/** How long someone goes on at the player with nothing more done to them (seconds), and how far they follow (metres). */
const GRUDGE_SECONDS = 45;
const GRUDGE_REACH = 30;

/**
 * Someone the player has gone for turns on them (Settings → Inventory → Combat → "People you attack fight
 * back"; real-time combat). With a third of their HP or less, or out cold, they've had enough.
 */
function personAngry(target, left) {
  if (!core.settings.fightBack || fightMode() !== "realtime") return;
  core.angry ??= new Map();
  const had = core.angry.has(target.id);
  if (left <= foeOf("person", foeTable()).hp / 3) {
    if (core.angry.delete(target.id) && left > 0) narrate(null, `${target.name} backs off: they've had enough.`);
    return;
  }
  core.angry.set(target.id, { until: core.clock + GRUDGE_SECONDS, next: core.clock + 0.8 + Math.random() });
  if (!had) narrate(null, `${target.name} turns on ${personaName()}.`);
}

/**
 * Those fighting back, each on the move the whole while (as a companion is: `allyMoves`) and doing something
 * every few seconds. One lets it go once the player is well away, or some time after they were last gone for.
 */
function angryTick() {
  if (!core.angry?.size) return;
  if (core.downed || fightMode() !== "realtime" || !core.settings.fightBack) return void core.angry.clear();
  if (core.interior || core.mode === "talk") return;
  const at = core.player.position;
  const here = new Map(core.crowd.present(core.space).map((person) => [person.id, person]));
  for (const [id, grudge] of core.angry) {
    const person = here.get(id);
    const far = person ? Math.hypot(person.position.x - at.x, person.position.z - at.z) : Infinity;
    if (!person || far > GRUDGE_REACH || core.clock > grudge.until) {
      core.angry.delete(id);
      if (person) narrate(null, `${nameFor(id, person.name)} lets it go, for now.`);
      continue;
    }
    if (core.crowd.isOut(id)) continue;
    const spells = spellsOfPerson(id).attack.filter((entry) => entry.spell.damage);
    allyMoves(person, { x: at.x, z: at.z, room: 0.4 }, spells.length > 0);
    if (core.clock < grudge.next) continue;
    if (personActs(person, far, spells)) grudge.next = core.clock + 2.6 + Math.random() * 2.2;
  }
}

/** One go at the player by someone fighting back: a spell of their class when it reaches, else their class's weapon in reach. */
function personActs(person, far, spells) {
  const name = nameFor(person.id, person.name);
  const who = personaName();
  const at = core.player.position;
  const from = { x: person.position.x, z: person.position.z };
  const inReach = far <= ALLY_REACH + 0.4;
  const castable = spells.filter((entry) => entry.spell.range >= far && (entry.level === 0 || Math.random() < 0.3));
  if (castable.length && (!inReach || Math.random() < 0.5)) {
    const chosen = castable[Math.floor(Math.random() * castable.length)];
    core.crowd.gesture(person.id, "cast", null, at.x, at.z);
    const saveId = core.save?.id;
    spellFx().bolt(core.space.scene, chest(from.x, from.z), chest(at.x, at.z), colourOf(chosen.spell), {
      then: () => {
        if (core.save?.id !== saveId || core.downed) return;
        if (core.clock < (core.dodgeUntil ?? 0))
          return void narrate(null, `${name} casts ${chosen.name} at ${who}, who rolls clear.`);
        const sheet = sheetNow();
        const result = spellAtPlayer({
          wit: ALLY_WIT,
          spell: chosen.spell,
          sheet,
          worn: wornNow(sheet),
        });
        const hp = playerStruck(result, from);
        narrate(null, castAtWords({ name, spell: chosen.name, who, result, left: hp?.value ?? 0, max: hp?.max ?? 0 }));
        if (result.hit && hp?.on !== false && (hp?.value ?? 1) <= 0) defeated();
      },
    });
    return true;
  }
  const mine = SRD_CLASSES[classOf(person.id)];
  const shot = !inReach && mine.ranged?.range >= far ? mine.ranged : null;
  if (!inReach && !shot) return false;
  const weapon = shot ?? mine.weapon;
  /** Their weapon comes at the player: rolled against their AC (twice, the worse counting, while they block). */
  const lands = () => {
    if (core.downed) return;
    if (core.clock < (core.dodgeUntil ?? 0))
      return void narrate(null, `${name} ${shot ? "shoots" : "swings"} at ${who}, who rolls clear.`);
    const sheet = sheetNow();
    const result = foeStrike({
      foe: { attack: ALLY_ATTACK, damage: weapon.damage, damageBonus: 2 },
      sheet,
      worn: wornNow(sheet),
      guarded: core.clock < (core.blockUntil ?? 0),
    });
    const hp = playerStruck(result, from);
    narrate(
      null,
      personWords({ name, who, weapon: weapon.name, result, left: hp?.value ?? 0, max: hp?.max ?? 0, shot: !!shot }),
    );
    if (result.hit && hp?.on !== false && (hp?.value ?? 1) <= 0) defeated();
  };
  if (shot) {
    core.crowd.gesture(person.id, "cast", null, at.x, at.z);
    const saveId = core.save?.id;
    spellFx().bolt(core.space.scene, chest(from.x, from.z), chest(at.x, at.z), ARROW, {
      size: 0.4,
      then: () => core.save?.id === saveId && lands(),
    });
    return true;
  }
  const held = weaponIn({ name: weapon.name, description: `${weapon.damage} damage` })?.held ?? "sword";
  core.crowd.gesture(person.id, "strike", held, at.x, at.z);
  lands();
  return true;
}

/**
 * A roll against the player that has landed (`result`; from `from`: { x, z }): their HP taken, and a step
 * back unless they're up on something or in the middle of a move. Returns their HP as it is after.
 */
function playerStruck(result, from) {
  // (In a beast's shape the beast's HP go first; what's left over when they run out is their own to take.)
  if (core.shape && result.hit && result.damage > 0) {
    const over = result.damage - core.shape.hp;
    core.shape.hp -= result.damage;
    if (core.shape.hp > 0) return { value: core.shape.hp, max: core.shape.max, on: true };
    unshape(`${personaName()} is beaten out of the beast's shape.`);
    return over > 0 ? playerStruck({ ...result, damage: over }, from) : entryOf(sheetNow(), "hp");
  }
  if (result.hit && result.damage > 0) {
    setSheet(applyChanges(sheetNow(), [{ stat: "hp", by: -result.damage }]).sheet);
    if (core.afflicted) core.afflicted = hurtConditions(core.afflicted);
    concentrationHurt(result.damage);
    if (!result.guarded) core.gesture = "hurt";
    const at = core.player.position;
    if (core.mode === "walk" && !core.glide && !core.battle) {
      const away = Math.atan2(at.x - from.x, at.z - from.z);
      at.x += Math.sin(away) * (result.guarded ? 0.3 : 0.8);
      at.z += Math.cos(away) * (result.guarded ? 0.3 : 0.8);
      core.space.resolveCollisions(at, PLAYER_RADIUS, true);
    }
    core.hud?.refreshInventory?.();
  }
  return entryOf(sheetNow(), "hp");
}

/**
 * A blow lands on `foe` (herd.js foes): an attack roll against its AC, and what came of it told. A hostile
 * one that's struck fights back (unless it has had enough); a peaceful one runs. Returns whether it's down.
 */
function landOn(foe, weapon, cover = 0) {
  if (core.shape) return shapeStrike(foe);
  const sheet = sheetNow();
  const stats = statsOf(foe);
  const behind = cover ? { ...stats, ac: stats.ac + cover } : stats;
  const mods = strikeMods(weapon, foe, marked(foe.id));
  const swung = () => ({
    ...playerStrike({ sheet, worn: wornNow(sheet), weapon, foe: behind, prof: profNow(), mods }),
    ...(cover ? { cover } : {}),
  });
  // (Marked by a spell, or attacking recklessly: the better of two. Hampered by a condition: the worse. Both: one roll.)
  const better = marked(foe.id) || mods.advantage;
  // (Swimming: a swing is hampered, but for a dagger, a javelin, a shortsword, a spear or a trident.)
  const underwater =
    !!core.swimming &&
    !!core.settings.srdModifiers &&
    !weapon.range &&
    !["dagger", "javelin", "shortsword", "spear", "trident"].includes(weapon.srd);
  const worse = afflicted().attackDis || underwater || !!mods.hampered;
  const result = better === worse ? swung() : rolledTwice(swung, better);
  if (worse && !better) result.hampered = true;
  strikeSpent(mods, result, foe);
  const after = Math.max(0, (foe.hp ?? stats.hp) - result.damage);
  const nerve = !foe.hostile
    ? "flee"
    : result.hit
      ? foeNerve(after, stats.hp, Math.random, extrasOn() ? stats.temperament : "")
      : "fight";
  const struck = core.herd.strike(foe.id, result.damage, stats.hp, nerve);
  if (!struck) return false;
  const what = (PACK.animals[foe.kind] ?? "the creature").replace(/^the /u, "");
  const told = strikeWords({ who: personaName(), what, weapon, result, left: struck.hp, max: struck.max });
  narrate(null, struck.down ? `${told} (+${stats.xp} XP)` : told);
  if (!struck.down && foe.hostile) combatSay(nerve === "flee" ? "flee" : result.hit ? "hurt" : "hit", { foe });
  if (struck.down) foeBeaten(foe, stats);
  return struck.down;
}

/**
 * A fight met where fights aren't in real time. `foe`: the creature (a herd "attack" event, or what a swing
 * would land on); `first`: who struck first, "foe" or "player".
 * A narrated moment: the game rolls one exchange at once (both attacks, in that order, the second only if
 * whoever it is still stands), tells it as rolled, and with AI moments on the AI narrates it. The creature
 * then holds off a little. A scene: a scene chat is opened on it, and the creatures let be while it plays.
 */
function encounter(foe, what, first) {
  if (core.downed || core.mode !== "walk" || core.clock < (core.encounterAt ?? 0)) return;
  if (fightMode() === "scene") {
    core.encounterAt = core.clock + 90;
    core.truceUntil = core.clock + 600;
    core.herd.calm();
    narrate(null, `A ${what} comes at ${personaName()}.`);
    return void sceneHere(
      first === "foe" ? `A ${what} attacks me, and I have to fight it off` : `I attack a ${what}, and it's a fight`,
    );
  }
  core.encounterAt = core.clock + 6;
  const weapon = weaponNow();
  const target = core.herd.foes(core.player.position, 6).find((entry) => entry.id === foe.id);
  let down = false;
  if (first === "player" && target) down = landOn(target, weapon);
  if (!down) foeAttacks({ kind: foe.kind, scale: foe.scale ?? 1, x: foe.x, z: foe.z }, what);
  if (first === "foe" && target && !core.downed) {
    core.gesture = weapon.name ? "strike" : "punch";
    core.gestureHeld = weapon.held;
    landOn(target, weapon);
  }
  void runMoment({
    action: `is in a fight with a ${what}. The game has rolled this exchange and the lines just above say how it went: tell it as rolled, vividly, and decide nothing the dice didn't`,
    source: "fight",
  });
}

/** Has the herd keep away what was beaten and isn't yet due back (and let back what is). Cheap to call often. */
function showBeaten() {
  if (!core.save || !core.herd?.setBeaten) return;
  const day = core.social?.day ?? 0;
  const days = core.settings.beatenDays;
  const region = `${core.save.region ?? HOME_REGION}|`;
  const kept = {};
  let changed = false;
  for (const [key, when] of Object.entries(core.save.beaten ?? {})) {
    if (days > 0 && day - when < days && day >= when) kept[key] = when;
    else changed = true;
  }
  if (changed) {
    core.save = { ...core.save, beaten: kept };
    core.saves.write(core.save);
  }
  core.herd.setBeaten(
    Object.keys(kept)
      .filter((key) => key.startsWith(region))
      .map((key) => key.slice(region.length)),
  );
}

/**
 * Something beaten is seen to: an animal harvested (what it gives goes into the inventory, and the body
 * goes), a person searched (what they carried; the body stays, and can't be searched again).
 */
async function tendBody(body, person, what) {
  if (core.tending) return;
  if (!core.inventory.ready())
    return void core.hud?.setNotice(
      "What you take goes into your inventory, which the Quartermaster package keeps: install it, and turn on Settings → Inventory.",
    );
  core.tending = true;
  try {
    const at = core.player.position;
    core.player.rotation.y = Math.atan2(body.x - at.x, body.z - at.z);
    core.gesture = "pickUp";
    const spoils = spoilsOf(body.kind, PACK.spoils);
    // (What it carried, by the ruleset's treasure tier for it.)
    if (core.settings.srdLoot && core.settings.srdCreatures) {
      const carried = lootOf(SRD_CREATURES[body.kind]?.loot);
      spoils.coins += carried.coins;
      spoils.items.push(...carried.items);
    }
    const money = purse();
    for (const item of spoils.items) await addItem(item);
    if (spoils.coins > 0) await addItem({ name: money.name, description: "", quantity: spoils.coins });
    core.herd.tend(body.id, !person);
    await readItems();
    narrate(
      null,
      `${personaName()} ${person ? "searches" : "harvests"} the ${what}: ${spoilsWords(spoils, money.name)}.`,
    );
    core.hud?.refreshInventory?.();
  } catch (error) {
    core.hud?.setNotice(`It couldn't be put in your inventory: ${error?.message ?? error}`);
  } finally {
    core.tending = false;
  }
}

/** Whether the weapon is out (X, or the Combat button): only where fights are in real time, and on their feet. */
const weaponDrawn = () => !!core.drawn && fighting() && !core.downed && core.mode === "walk";

/** Draws the weapon, or puts it away. Drawn, the camera stays behind the player and turning it turns them. */
function draw() {
  if (!fighting()) return;
  core.drawn = !core.drawn;
  core.hud?.setDrawn(core.drawn);
  if (core.drawn) {
    core.walkTo = null;
    if (!core.itemsAt) {
      core.itemsAt = core.clock;
      void readItems();
    }
  }
}

/** Takes up the beaten creature `id`, lying in reach, to carry it (the chat window's Carry button). */
function carryBody(id) {
  if (core.carrying || core.downed || core.mode !== "walk" || core.interior) return;
  const body = core.herd.bodies(core.player.position, 3).find((entry) => entry.id === id);
  if (!body || !core.herd.liftBody(id)) return;
  const what = (PACK.animals[body.kind] ?? "the creature").replace(/^the /u, "");
  core.carrying = { id, what };
  core.gesture = "pickUp";
  core.drawn = false;
  core.hud?.setDrawn(false);
  narrate(null, `${personaName()} heaves the ${what} up onto a shoulder.`);
}

/** Puts down what's being carried, a step in front of the player. */
function putDownBody() {
  const load = core.carrying;
  if (!load) return;
  core.carrying = null;
  const at = core.player.position;
  const spot = {
    x: at.x + Math.sin(core.player.rotation.y) * 0.9,
    y: at.y,
    z: at.z + Math.cos(core.player.rotation.y) * 0.9,
  };
  core.space.resolveCollisions(spot, 0.4, true);
  core.herd.putDown(load.id, spot.x, spot.z);
  narrate(null, `${personaName()} sets the ${load.what} down.`);
}

/** Each frame: what's carried rides on the player's shoulder; it's put down if they stop being on their feet outdoors. */
function carryTick() {
  if (core.hud && !!core.drawn !== weaponDrawn() && !fighting()) {
    core.drawn = false; // (fights were switched off, or to another way of fighting)
    core.hud.setDrawn(false);
  }
  if (!core.carrying) return;
  const at = core.player.position;
  if (core.mode !== "walk" || core.interior || core.downed || core.swimming) return void putDownBody();
  if (!core.herd.holdBody(core.carrying.id, at.x, at.y + 1.35, at.z, core.player.rotation.y)) core.carrying = null;
}

/** How long a dodge's roll takes (seconds), how far it carries, and how long before another. */
const DODGE_SECONDS = 0.55;
const DODGE_REACH = 3.2;

/** A block (Q, or the Block button): for as long as its clip, attacks on the player are rolled twice, the worse counting. */
function block() {
  if (byTurns()) return void dodge(); // (by turns, guarding is the Dodge action)
  if (!fighting() || core.downed || core.mode !== "walk" || core.clock < (core.blockAgain ?? 0)) return;
  const seconds = gestureSeconds("block") || 1;
  core.gesture = "block";
  core.gestureHeld = weaponNow().held;
  core.blockUntil = core.clock + seconds;
  core.blockAgain = core.clock + seconds + 0.3;
  core.strikeUntil = Math.max(core.strikeUntil ?? 0, core.clock + seconds * 0.7); // (no swing from behind a guard)
}

/**
 * A dodge (R, or the Dodge button): a roll a few steps the way they're going, or back the way they came
 * if they're standing. Nothing lands on them while they roll.
 */
function dodge() {
  // By turns, Dodge is an action: until their next turn, every attack on them is rolled twice, the worse counting.
  if (byTurns()) {
    if (!core.battle || !battleSpend("action")) return;
    core.battle.dodging = true;
    core.gesture = "block";
    return void narrate(
      null,
      `${personaName()} takes the Dodge action: attacks on them are rolled twice until their next turn.`,
    );
  }
  if (!fighting() || core.downed || core.mode !== "walk" || core.glide || core.air || core.swimming) return;
  if (core.carrying || core.clock < (core.dodgeAgain ?? 0)) return;
  const at = core.player.position;
  const facing = core.player.rotation.y;
  // On the move: the way they're going (with a weapon drawn that may be sideways or back); standing: back.
  const way = (core.still ?? 1) === 0 ? (core.moveWay ?? facing) : facing + Math.PI;
  const to = { x: at.x + Math.sin(way) * DODGE_REACH, y: at.y, z: at.z + Math.cos(way) * DODGE_REACH };
  core.space.resolveCollisions(to, PLAYER_RADIUS, true);
  if (!core.interior && waterAt(to.x, to.z).depth > 0.4) return; // not into the river
  core.walkTo = null;
  core.gesture = "dodge";
  core.dodgeUntil = core.clock + DODGE_SECONDS;
  core.dodgeAgain = core.clock + DODGE_SECONDS + 0.9;
  glideTo(to.x, to.z, facing, DODGE_SECONDS);
}

/** A creature's attack on the player (herd.js's "attack"): rolled against their AC, their HP taken, and told. */
function foeAttacks(event, what, with_ = null) {
  if (core.downed || core.mode === "talk") return;
  const who = personaName();
  // Mid-roll, nothing lands.
  if (core.clock < (core.dodgeUntil ?? 0))
    return void narrate(
      null,
      `The ${what} ${(foeTable()[event.kind] ?? foeTable().default).verb} at ${who}, who rolls clear.`,
    );
  const sheet = sheetNow();
  const worn = wornNow(sheet);
  const stats = { ...statsOf(event), ...with_ };
  const extras = extrasOn() && !with_;
  // (A breath, when it has one ready, in place of its bite.)
  if (extras && stats.breath && !event.again && breathReady(event.id, stats.breath))
    return void foeBreathes(event, what, stats);
  // (Pack Tactics: the better of two rolls with another of its kind beside the player. And anyone who's
  // down, held or blinded is easier to hit.)
  const pack =
    extras &&
    stats.pack &&
    core.herd
      .foes(core.player.position, 3)
      .some((other) => other.id !== event.id && other.kind === event.kind && !other.fled);
  const result = foeStrike({
    foe: stats,
    sheet,
    // (In a beast's shape it's the beast's AC that's rolled against.)
    worn: core.shape
      ? { ac: SRD_CREATURES[core.shape.kind].ac - valueOf(sheet, "ac") + (stats.cover ?? 0) }
      : stats.cover
        ? { ...worn, ac: (worn.ac ?? 0) + stats.cover }
        : worn,
    guarded: core.clock < (core.blockUntil ?? 0) || !!core.battle?.dodging,
    hindered: hindered(event.id),
    keen: pack || afflicted().defendAdv || buffed("reckless"),
  });
  if (stats.cover) result.cover = stats.cover;
  // (Shield, where they have it: cast in answer to a blow that +5 AC turns.)
  let shielded = "";
  if (result.hit && !result.crit && result.total < result.ac + 5 && (shielded = reactionSpell("shield"))) {
    result.hit = false;
    result.damage = 0;
    result.ac += 5;
  }
  if (buffed("raging") && result.hit) {
    result.damage = Math.floor(result.damage / 2); // (Rage: half from weapons)
    result.detail += ", halved by Rage";
  }
  // (A rogue's Uncanny Dodge: half of one blow that lands, once every six seconds.)
  if (result.hit && kitNow().uncanny && core.clock >= (core.uncannyAt ?? 0) && !afflicted().helpless) {
    core.uncannyAt = core.clock + 6;
    result.damage = Math.floor(result.damage / 2);
    result.detail += ", halved by Uncanny Dodge";
  }
  const hp = playerStruck(result, event);
  narrate(null, foeWords({ who, what, verb: stats.verb, result, left: hp?.value ?? 0, max: hp?.max ?? 0 }));
  if (result.hit && result.damage > 0 && !with_) combatSay("hit", { foe: event });
  if (shielded) narrate(null, `${who} casts ${shielded} in answer: +5 AC, and the blow is turned.`);
  if (result.hit && hp?.on !== false && (hp?.value ?? 1) <= 0) return void defeated();
  if (extras && result.hit) foeExtras(stats, what, event);
  // (Multiattack: its other blows, one after another.)
  if (extras && !event.again && !core.downed)
    for (let more = 1; more < (stats.multi ?? 1) && !core.downed; more++) foeAttacks({ ...event, again: true }, what);
}

/**
 * The player's HP has run out: they go down and what was at them draws off. Then, as Settings → Inventory →
 * Combat → "When your HP runs out" says: they come to where they fell with 1 HP, wake at home with half,
 * or stay down (lying there while the chat and the narration go on) until they press Respawn.
 */
function defeated(final = false) {
  if (core.downed) return;
  if (!final && core.settings.deathSaves && core.mode === "walk") return void startDying();
  core.downed = true;
  core.stayDown = false;
  core.downAt = performance.now();
  core.gesture = "fall";
  core.walkTo = null;
  core.herd.calm();
  core.angry?.clear();
  const who = personaName();
  narrate(null, PACK.fight.down.replace("{who}", who));
  const saveId = core.save?.id;
  later(2.3, () => {
    if (!core.save || core.save.id !== saveId) return void (core.downed = false);
    if (core.settings.defeat === "stay" && core.mode === "walk") {
      // Lying where they fell (as someone lying on the ground does), until Respawn.
      const { x, z } = core.player.position;
      core.seat = { x, z, angle: core.player.rotation.y, approach: { x, z }, ground: "lie", taken: "player" };
      core.mode = "sit";
      core.stayDown = true; // (the Respawn button is shown from this, every frame: needsRespawn)
      return;
    }
    comeTo(core.settings.defeat === "home");
  });
}

/**
 * Whether the Respawn button should be up: beaten and staying down, or beaten and, well after they should
 * have come to, still down (the world was changed under them, say). Asked every frame, so the button can't
 * be lost to the screen being built again or to something else changing what the player is doing.
 */
const needsRespawn = () =>
  !!core.downed && !core.dying && (!!core.stayDown || performance.now() - (core.downAt ?? 0) > 6000);

/**
 * Up again after a defeat: at home (or by the market) with half their HP, or where they fell with 1.
 * `free`: they weren't beaten (Settings → Debug → Respawn): it costs nothing and takes no HP from them.
 */
function comeTo(home, free = false) {
  core.downed = false;
  core.stayDown = false;
  core.afflicted = {};
  core.buffs = {};
  unshape("");
  core.dying = null;
  breakConcentration("");
  core.gesture = null;
  if (core.mode === "sit" && core.seat?.ground) {
    core.seat = null;
    core.mode = "walk";
  }
  const who = personaName();
  const sheet = sheetNow();
  const most = entryOf(sheet, "hp")?.max ?? 1;
  const moved = home && !core.interior && core.mode === "walk";
  const hp = moved ? Math.max(1, Math.floor(most / 2)) : 1;
  setSheet(applyChanges(sheet, [{ stat: "hp", to: free ? Math.max(hp, valueOf(sheet, "hp")) : hp }]).sheet);
  let line = PACK.fight.here;
  if (moved) {
    const door = playerHomeDoor() !== null ? core.world.doors[playerHomeDoor()] : null;
    const spot = door
      ? { x: door.x + Math.sin(door.angle) * 1.2, z: door.z + Math.cos(door.angle) * 1.2 }
      : (core.world.spawn ?? SPAWN);
    core.player.position.set(spot.x, heightAt(spot.x, spot.z), spot.z);
    line = door ? PACK.fight.home : PACK.fight.square;
  }
  narrate(null, line.replace("{who}", who));
  if (!free) void defeatCost(who);
  core.hud?.refreshInventory?.();
}

/** What a defeat costs (Settings → Inventory → Combat): a quarter of the purse, or the experience toward the next level. */
async function defeatCost(who) {
  const cost = core.settings.defeatCost;
  if (cost === "xp") {
    const sheet = sheetNow();
    const had = valueOf(sheet, "xp");
    if (had <= 0) return;
    setSheet(applyChanges(sheet, [{ stat: "xp", to: 0 }]).sheet);
    return void narrate(null, `${who} has lost ${had} experience.`);
  }
  if (cost !== "coins" || !core.inventory.ready()) return;
  const money = purse().name.toLowerCase();
  const held = (await readItems()).find((item) => String(item.name).trim().toLowerCase() === money);
  const lost = Math.ceil((held?.quantity ?? 0) / 4);
  if (!held || lost <= 0) return;
  await core.inventory
    .change(held.id, held.quantity - lost > 0 ? { quantity: held.quantity - lost } : null)
    .catch(() => {});
  await readItems();
  narrate(null, `${who} is ${lost} ${money} the poorer.`);
  core.hud?.refreshInventory?.();
}

/**
 * The Respawn button: up from staying down, at home. Whatever else they've ended up doing while down (a
 * talk begun with them, a seat taken from under them) is ended first, so it always works. `force`
 * (Settings → Debug → Respawn): beaten or not, for when something has left them stuck.
 */
function respawn(force = false) {
  if (!core.save || !core.world || !(force || core.downed)) return;
  const beaten = !!core.downed;
  if (core.battle) battleEnd("");
  resetMode();
  comeTo(true, !beaten);
}

// ── Gathering (gather.js) and the purse ─────────────────────────────────────────────────────────────────

/**
 * What can be gathered where the player stands, each with where it is: [{ kind, x, z, face }] (`face`:
 * there's a thing to turn to: the tree, the boulder, the water). None indoors, riding, swimming, or with
 * gathering switched off. `fresh`: leave out what has been used up for now (for the prompt over the thing).
 */
function gatherTargets(zone = null, fresh = false) {
  if (!core.zones || !core.save || !core.settings.gathering || core.interior || core.mode === "ride" || core.swimming)
    return [];
  const at = core.player.position;
  const here = zone ?? zoneAt(core.zones, at.x, at.z);
  // Water within a few steps: where the player stands (to wading depth), or the nearest of the points round them.
  let water = waterAt(at.x, at.z).depth > 0.05 ? { x: at.x, z: at.z, face: false } : null;
  for (let i = 0; i < 8 && !water; i++) {
    const spot = { x: at.x + Math.cos((i * Math.PI) / 4) * 3, z: at.z + Math.sin((i * Math.PI) / 4) * 3, face: true };
    if (waterAt(spot.x, spot.z).depth > 0.15) water = spot;
  }
  const tree = core.world.treeNear(at.x, at.z);
  const rock = core.world.rockNear(at.x, at.z);
  const kinds = gatherHere({
    zone: here.kind,
    outpost: here.outpostKind ?? "",
    beside: bordersAt(core.zones, at.x, at.z, here).map((entry) => entry.outpostKind ?? entry.kind),
    water: !!water,
    tree: tree >= 0,
    rock: rock >= 0,
    season: seasonNow(),
  });
  const day = core.social?.day ?? 0;
  // What isn't a thing to stand at (foraging, harvesting, a cave's rock) is a step ahead of the player.
  const ahead = { x: at.x + Math.sin(core.player.rotation.y) * 1.6, z: at.z + Math.cos(core.player.rotation.y) * 1.6 };
  return kinds
    .map((kind) => {
      const thing =
        kind === "chop"
          ? { ...core.world.treeAt(tree), face: true }
          : kind === "mine" && rock >= 0
            ? { ...core.world.rockAt(rock), face: true, rock }
            : kind === "fish"
              ? water
              : { ...ahead, face: false };
      return { kind, ...thing };
    })
    .filter(
      (target) =>
        !fresh ||
        target.kind === "chop" ||
        spotReady(core.save.gathered, gatherKey(target), day, core.settings.regrowDays),
    );
}
/** The spot a gathering uses up: a boulder is one of its own; the rest, the patch of ground stood on. */
function gatherKey(target) {
  const at = core.player.position;
  return target.rock >= 0
    ? `mine:rock:${core.save.region ?? HOME_REGION}:${target.rock}`
    : spotKey(target.kind, at.x, at.z);
}
const gatherOptions = (zone = null) => gatherTargets(zone).map((target) => target.kind);

const treeKey = (number) => `${core.save?.region ?? HOME_REGION}|${number}`;
/** Has the world stand its felled trees down (and up again, once they've had their days). Cheap to call often. */
function showFelled() {
  if (!core.save || !core.world?.setFelled) return;
  const now = treesDown(
    core.save.trees,
    core.save.region ?? HOME_REGION,
    core.social?.day ?? 0,
    core.settings.treeDays,
  );
  if (Object.keys(now.trees).length !== Object.keys(core.save.trees ?? {}).length) {
    core.save = { ...core.save, trees: now.trees };
    core.saves.write(core.save);
  }
  core.world.setFelled(now.down);
  // And the boulders mined out for now, smaller until they've had their days.
  const day = core.social?.day ?? 0;
  const prefix = `mine:rock:${core.save.region ?? HOME_REGION}:`;
  core.world.setMined?.(
    Object.keys(core.save.gathered ?? {})
      .filter((key) => key.startsWith(prefix) && !spotReady(core.save.gathered, key, day, core.settings.regrowDays))
      .map((key) => Number(key.slice(prefix.length))),
  );
}

/**
 * Gathers `kind` here: a roll with the attribute for it, and what's found goes into Quartermaster's
 * inventory, with a line in the chat and a little experience. The spot then takes its days to give again.
 */
async function gather(kind) {
  const save = core.save;
  const target = save ? gatherTargets().find((entry) => entry.kind === kind) : null;
  if (!target) return;
  // One try at a time: the next is taken as soon as the last one's swing or cast has played out.
  if (core.clock < (core.gatherUntil ?? 0)) return;
  core.gatherUntil = core.clock + 0.4; // (till the gesture below sets its own length; also when there's none)
  if (!core.inventory.ready())
    return void core.hud?.setNotice(
      "What you gather goes into your inventory, which the Quartermaster package keeps: install it, and turn on Settings → Inventory.",
    );
  // Its tool, when it takes one (Settings → Inventory → "Gathering needs tools").
  if (core.settings.gatherTools && TOOLS[kind] && !toolFor(kind, await readItems())) {
    const first = PACK.recipes.find((recipe) => toolFor(kind, [recipe]));
    return void core.hud?.setNotice(
      `You need ${TOOLS[kind].need} for that.${first ? ` Inventory → Craft makes a ${first.name.toLowerCase()} from ${first.needs.map((need) => `${need.quantity > 1 ? `${need.quantity} × ` : ""}${need.name.toLowerCase()}`).join(", ")}, all found by foraging.` : ""}`,
    );
  }
  const who = personaName();
  const lines = PACK.gather.lines[kind];
  const at = core.player.position;
  const day = core.social?.day ?? 0;
  // A tree is chopped at until it's down (no waiting between strokes); a boulder is one spot of its own;
  // everything else uses up the patch of ground it's on.
  const tree = kind === "chop" ? core.world.treeNear(at.x, at.z) : -1;
  const key = gatherKey(target);
  if (kind === "chop" && tree < 0) return;
  if (kind !== "chop" && !spotReady(save.gathered, key, day, core.settings.regrowDays))
    return void core.hud?.setNotice(lines.spent);
  // Turned to the tree, the rock or the water, and acted out: an axe swung, a line cast.
  if (target.face) core.player.rotation.y = Math.atan2(target.x - at.x, target.z - at.z);
  core.gesture = GATHER_KINDS[kind].gesture;
  core.gatherUntil = core.clock + (gestureSeconds(core.gesture) || 1.5);
  const sheet = sheetNow();
  const attribute = GATHER_KINDS[kind].attribute;
  const score = valueOf(sheet, attribute) + (wornNow(sheet)[attribute] ?? 0);
  const got = gatherRoll(
    kind,
    score,
    PACK.gather,
    seasonNow(),
    Math.random,
    toolBonus(toolFor(kind, core.items ?? [])),
  );
  const chopped = kind === "chop" ? chopTree(save.trees, treeKey(tree), day) : null;
  core.save = chopped ? { ...save, trees: chopped.trees } : { ...save, gathered: spotUsed(save.gathered, key, day) };
  core.saves.write(core.save);
  const felled = chopped?.down ? ` ${lines.down}` : "";
  if (chopped?.down) showFelled();
  if (!got.found) return void narrate(null, `${lines.none.replace("{who}", who)}${felled}`);
  try {
    await addItem(got.found);
  } catch (error) {
    return void core.hud?.setNotice(`It couldn't be put in your inventory: ${error?.message ?? error}`);
  }
  await readItems();
  earnXp(3);
  const what = `${got.found.quantity > 1 ? `${got.found.quantity} × ` : ""}${got.found.name}`;
  narrate(null, `${lines.found.replace("{who}", who).replace("{what}", what)}${felled}`);
  core.hud?.refreshInventory?.();
}

// ── Vendors (vendor.js) ─────────────────────────────────────────────────────────────────────────────────

/** Every trade in this world: the setting's (as the player has left their guidance) and the player's own. */
const trades = () => tradeKinds(PACK.vendors.kinds, core.save?.trades);
/** The kit model each market stall is dressed as, by its first trade that has one (null: the bare stall). */
function stallLooks() {
  const all = trades();
  return stalls().map((stall) => {
    const own = vendorKinds({ kind: "stall", id: stall.id }, "", core.save.vendors?.[stall.id], all);
    return own.map((kind) => PACK.vendors.looks[kind]?.stall).find(Boolean) ?? null;
  });
}

/** Dresses the market's stalls again, after a trade has changed: the stall takes its new look at once. */
async function redressStalls() {
  const world = core.world;
  if (!core.settings.props || !world?.clearProps || !core.propModels) return;
  const wanted = core.settings.vendors && core.save ? stallLooks() : [];
  const missing = wanted.filter((model) => model && !core.marketModels?.has(model));
  let extra = core.marketModels ?? new Map();
  if (missing.length) extra = new Map([...extra, ...(await kitModels("market", missing).catch(() => new Map()))]);
  if (core.world !== world) return;
  core.marketModels = extra;
  world.clearProps();
  world.dressStalls(wanted.map((model) => (model && extra.has(model) ? model : null)));
  world.addProps(new Map([...core.propModels, ...extra]));
}

/** When the market's stalls are open (a building keeps its own hours). */
const MARKET_HOURS = { from: 7, to: 19 };
/** The market's stalls, each where its seller stands: [{ id, x, z }] (world.js stallSpots). */
function stalls() {
  return (core.world?.spots ?? [])
    .filter((spot) => spot.act === "vend")
    .map((spot, index) => ({ id: `stall:${index}`, x: spot.x, z: spot.z }));
}

/**
 * The vendor the player is at: inside its building, within a few steps of its door, or at a market stall.
 * { id, zone, name, title (what the Shop button says), kinds } or null (none near, none trading, vendors
 * off, or shut).
 */
function vendorHere() {
  if (!core.zones || !core.save || !core.settings.vendors) return null;
  const kinds = trades();
  const names = namedZones(residentsOf(core.crowd.snapshot()));
  const kindsOf = (zone, name) => vendorKinds(zone, name, core.save.vendors?.[zone.id], kinds);
  let found = null;
  if (core.interior) {
    const zone = core.zones.byId.get(`building:${core.interior.door.index}`);
    if (zone) found = { zone, name: names[zone.id] ?? zone.name };
  } else {
    const at = core.player.position;
    let least = 4;
    for (const zone of core.zones.zones) {
      if (zone.kind !== "building") continue;
      const door = core.world.doors?.[zone.door];
      if (!door) continue;
      const distance = Math.hypot(door.x - at.x, door.z - at.z);
      if (distance < least && kindsOf(zone, names[zone.id] ?? zone.name).length) {
        least = distance;
        found = { zone, name: names[zone.id] ?? zone.name };
      }
    }
    if (core.hour >= MARKET_HOURS.from && core.hour < MARKET_HOURS.to)
      for (const stall of stalls()) {
        const distance = Math.hypot(stall.x - at.x, stall.z - at.z);
        if (distance < Math.min(least, 3.4)) {
          least = distance;
          found = { zone: { kind: "stall", id: stall.id }, name: core.save.names?.[stall.id] ?? "" };
        }
      }
  }
  if (!found || (found.zone.kind === "building" && closedWords(found.zone.id))) return null;
  const own = kindsOf(found.zone, found.name);
  if (!own.length) return null;
  const trade = tradeSign(own, kinds);
  // Its own name once it has one; else its trade ("Apothecary"), and for a stall "the greengrocer's stall".
  const named = found.zone.kind === "stall" ? !!found.name : found.name !== found.zone.name;
  const name = found.zone.kind === "stall" && !named ? `the ${trade.toLowerCase()}'s stall` : found.name;
  return { id: found.zone.id, zone: found.zone, name, title: named ? found.name : trade, kinds: own };
}

const restockPeriod = () => Math.floor((core.social?.day ?? 0) / Math.max(1, core.settings.restockDays));
/** A vendor's shelves now: restocked (and kept with the world) when its days are up or its trades have changed. */
function shelves(vendor) {
  const period = restockPeriod();
  const now = stockNow(core.save.vendors?.[vendor.id], vendor.kinds, trades(), `${core.save.id}:${vendor.id}`, period);
  if (now.fresh) keepVendor(vendor.id, { stock: now.stock, period, stocked: vendor.kinds.join(",") });
  return now.stock;
}
function keepVendor(id, fields) {
  const vendors = { ...core.save.vendors, [id]: { ...core.save.vendors?.[id], ...fields } };
  core.save = { ...core.save, vendors };
  core.saves.write(core.save);
}

/**
 * With "The AI stocks shop shelves" on, a vendor due a restocking has its shelves written by the model
 * to fit the world, by its trades' guidance and its own, and kept. Anything that goes wrong leaves it to
 * the trades' own lists (`shelves`).
 */
async function aiShelves(vendor) {
  if (!core.settings.vendorAi) return;
  const save = core.save;
  const period = restockPeriod();
  const all = trades();
  const saved = save.vendors?.[vendor.id];
  if (!stockNow(saved, vendor.kinds, all, "", period).fresh) return;
  const kinds = vendor.kinds.map((kind) => all[kind]);
  try {
    const answer = await core.ai.vendorStock({
      worldName: save.name,
      setting: save.setting ?? "",
      shop: vendor.name,
      kinds: kinds.map((kind) => kind.label).join(", "),
      currency: purse().name,
      usual: (kinds.some((kind) => kind.stock.length) ? kinds : Object.values(PACK.vendors.kinds).slice(0, 2))
        .flatMap((kind) => kind.stock.slice(0, 4))
        .map((item) => `${item.name} ${item.price}`)
        .join(", "),
      guidance: [...kinds.map((kind) => kind.guidance), saved?.guidance].filter(Boolean).join(" "),
      connectionId: trackerConnection(),
    });
    if (core.save?.id === save.id && answer?.stock?.length)
      keepVendor(vendor.id, { stock: answer.stock, period, stocked: vendor.kinds.join(",") });
  } catch (error) {
    console.warn("[wanderworld] the AI couldn't stock a shop; its own shelves stand in", error);
  }
}

/** What things are worth here: the trades' prices, and whatever any shop in this world has had on its shelves. */
function vendorPack() {
  const values = { ...PACK.vendors.values };
  for (const vendor of Object.values(core.save?.vendors ?? {}))
    for (const item of vendor.stock ?? [])
      if (item?.name && Number.isFinite(item.price)) values[item.name] ??= item.price;
  return { kinds: trades(), values };
}

/**
 * Everything Settings → World → Vendors shows: every vendor (buildings and stalls) with its trades, name
 * and guidance, every trade with its guidance (and goods, for the player's own), and the empty houses
 * that could be made shops of.
 */
function vendorsNow() {
  if (!core.zones || !core.save) return { vendors: [], vacant: [], kinds: [], trades: [] };
  const all = trades();
  const snapshot = core.crowd.snapshot();
  const names = namedZones(residentsOf(snapshot));
  const mine = playerHomeDoor();
  // (With the street it's on: a town has several places called "the shop".)
  const placed = (zone) => [names[zone.id] ?? zone.name, names[zone.parent]].filter(Boolean).join(", ");
  const vendors = [];
  const row = (zone, name, extra) => {
    const saved = core.save.vendors?.[zone.id];
    const kinds = vendorKinds(zone, name, saved, all);
    const set = Array.isArray(saved?.kinds);
    if (kinds.length || set) vendors.push({ id: zone.id, kinds, set, guidance: saved?.guidance ?? "", ...extra });
  };
  for (const zone of core.zones.zones)
    if (zone.kind === "building")
      row(zone, names[zone.id] ?? zone.name, {
        name: placed(zone),
        own: core.save.names?.[zone.id] ?? "",
        canName: true,
      });
  stalls().forEach((stall, index) =>
    row({ kind: "stall", id: stall.id }, "", {
      name: `Market stall ${index + 1}`,
      own: core.save.names?.[stall.id] ?? "",
      canName: true,
    }),
  );
  const trading = new Set(vendors.map((vendor) => vendor.id));
  return {
    vendors,
    vacant: vacantHomes(core.zones.zones, snapshot)
      .filter((zone) => zone.door !== mine && !trading.has(zone.id))
      .slice(0, 30)
      .map((zone) => ({ id: zone.id, name: placed(zone) })),
    kinds: Object.entries(all).map(([id, kind]) => ({ id, label: kind.label })),
    trades: Object.entries(all).map(([id, kind]) => ({
      id,
      label: kind.label,
      guidance: kind.guidance ?? "",
      goods: kind.goods ?? "",
      custom: !!kind.custom,
      changed: !!kind.changed,
    })),
  };
}

/**
 * Sets vendors' trades so the world has as many of each as New world or Regenerate asked for
 * (`vendorCounts`; vendor.js assignVendors). Trades set by hand stand, and are counted; ones set here
 * before are worked out again.
 */
function countVendorsOut() {
  if (!core.save || !core.zones) return;
  const all = trades();
  const vendors = { ...core.save.vendors };
  for (const [id, entry] of Object.entries(vendors)) {
    if (!entry?.auto) continue;
    const { kinds: _kinds, auto: _auto, ...rest } = entry;
    vendors[id] = rest;
  }
  const listed = [
    ...core.zones.zones
      .filter((zone) => zone.kind === "building")
      .map((zone) => ({
        zone,
        name: core.save.names?.[zone.id] ?? zone.name,
        flexible: zone.buildingKind === "shop",
      })),
    ...stalls().map((stall) => ({ zone: { kind: "stall", id: stall.id }, name: "", flexible: true })),
  ]
    .map(({ zone, name, flexible }) => ({
      id: zone.id,
      flexible,
      fixed: Array.isArray(vendors[zone.id]?.kinds),
      kinds: vendorKinds(zone, name, vendors[zone.id], all),
    }))
    .filter((vendor) => vendor.kinds.length);
  const set = assignVendors(listed, checkVendorCounts(core.save.vendorCounts, all), all);
  for (const [id, kinds] of Object.entries(set)) {
    const { stock: _stock, period: _period, stocked: _stocked, ...rest } = vendors[id] ?? {};
    vendors[id] = { ...rest, kinds, auto: true };
  }
  core.save = { ...core.save, vendors, vendorsPending: false };
  core.saves.write(core.save);
  void redressStalls();
}

/** Sets a vendor's trades by hand (`kinds`: a list, empty for "doesn't trade"), or back to its own with null. */
function setVendorKinds(id, kinds) {
  if (!core.save) return;
  const { kinds: _was, auto: _auto, ...rest } = core.save.vendors?.[id] ?? {};
  const all = trades();
  const next = kinds === null ? rest : { ...rest, kinds: kinds.filter((kind) => Object.hasOwn(all, kind)) };
  core.save = { ...core.save, vendors: { ...core.save.vendors, [id]: next } };
  core.saves.write(core.save);
  core.journalAt = 0;
  placeSigns();
  void redressStalls();
}

/** A vendor's own guidance for what the AI stocks it with ("" for none). Its shelves are written again next time. */
function setVendorGuidance(id, guidance) {
  if (!core.save) return;
  keepVendor(id, {
    guidance: String(guidance ?? "")
      .replace(/\s+/gu, " ")
      .trim()
      .slice(0, 600),
    period: null,
  });
}

/**
 * A trade changed in Settings: `fields` { label, guidance, goods } for one of the player's own (a new one
 * with `id` null), { guidance } for one of the setting's; null takes one of the player's own away, or puts
 * one of the setting's back to its usual guidance.
 */
function setTrade(id, fields) {
  if (!core.save) return;
  const mine = { ...checkTrades(core.save.trades, PACK.vendors.kinds) };
  if (fields === null) delete mine[id];
  else if (id === null)
    mine[tradeId(fields.label, [...Object.keys(PACK.vendors.kinds), ...Object.keys(mine)])] = {
      ...fields,
      custom: true,
    };
  else
    mine[id] = Object.hasOwn(PACK.vendors.kinds, id)
      ? { guidance: fields.guidance }
      : { ...mine[id], ...fields, custom: true };
  core.save = { ...core.save, trades: checkTrades(mine, PACK.vendors.kinds) };
  core.saves.write(core.save);
  placeSigns();
  void redressStalls();
}

/** What haggling has done to the prices of the vendor here today: a factor on them (vendor.js haggled). */
const haggleFactor = (vendor) => haggled(core.save.vendors?.[vendor.id], core.social?.day ?? 0);

/** The shop window's contents: what's for sale, and what of the player's it would buy and for how much. */
async function shopNow() {
  const vendor = vendorHere();
  if (!vendor) return { open: false };
  const ready = core.inventory.ready();
  const items = ready ? await readItems() : [];
  const money = purse();
  await aiShelves(vendor);
  const prices = vendorPack();
  const factor = haggleFactor(vendor);
  return {
    open: true,
    ready,
    name: vendor.name,
    kinds: vendor.kinds.map((kind) => prices.kinds[kind].label),
    purse: money,
    haggle: {
      on: core.settings.haggling === true,
      done: core.save.vendors?.[vendor.id]?.haggle?.day === (core.social?.day ?? 0),
      factor,
    },
    stock: shelves(vendor)
      .filter((item) => item.quantity > 0)
      .map((item) => ({ ...item, price: priceAfter(item.price, factor) })),
    sell: items
      .filter((item) => item.name.trim().toLowerCase() !== money.name.toLowerCase())
      .map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity ?? 1,
        worn: String(item.location).startsWith("equipped:"),
        price: offerAfter(offerFor(item.name, vendor.kinds, prices), factor),
      }))
      .sort((a, b) => b.price - a.price || a.name.localeCompare(b.name)),
  };
}

/** Buys one of `name` from the vendor here: the price leaves the purse, the thing joins the inventory. */
async function buy(name) {
  const vendor = vendorHere();
  if (!vendor) throw new Error("There's no shop here now.");
  const stock = shelves(vendor);
  const item = stock.find((entry) => entry.name === name && entry.quantity > 0);
  if (!item) throw new Error("That's sold out.");
  const price = priceAfter(item.price, haggleFactor(vendor));
  const items = await readItems();
  const money = purse();
  if (money.amount < price) throw new Error(`That costs ${price} ${money.name}. You have ${money.amount}.`);
  const coins = items.find((entry) => entry.name.trim().toLowerCase() === money.name.toLowerCase());
  await core.inventory.change(coins.id, money.amount - price > 0 ? { quantity: money.amount - price } : null);
  await addItem({ name: item.name, description: item.description, quantity: 1 });
  keepVendor(vendor.id, {
    stock: stock.map((entry) => (entry === item ? { ...entry, quantity: entry.quantity - 1 } : entry)),
  });
  await readItems();
  narrate(null, `${personaName()} buys ${item.name} at ${vendor.name} for ${price} ${money.name}.`);
}

/** Sells one of the item `id` to the vendor here: it leaves the inventory, its price joins the purse. */
async function sell(id) {
  const vendor = vendorHere();
  if (!vendor) throw new Error("There's no shop here now.");
  const item = (await readItems()).find((entry) => entry.id === id);
  if (!item) return;
  const price = offerAfter(offerFor(item.name, vendor.kinds, vendorPack()), haggleFactor(vendor));
  if (price <= 0) throw new Error(`${vendor.name} has no use for that.`);
  const money = purse();
  await core.inventory.change(id, (item.quantity ?? 1) > 1 ? { quantity: item.quantity - 1 } : null);
  await addItem({ name: money.name, description: "", quantity: price });
  await readItems();
  narrate(null, `${personaName()} sells ${item.name} at ${vendor.name} for ${price} ${money.name}.`);
}

/**
 * Haggles with the vendor here, once a day: a Charisma check that may take a tenth or a fifth off its
 * prices for the rest of the day (and add as much to what it pays), leave them, or put them up. With AI
 * moments on, the haggling is narrated too.
 */
async function haggle() {
  const vendor = vendorHere();
  if (!vendor || !core.settings.haggling) throw new Error("There's nobody here to haggle with.");
  const day = core.social?.day ?? 0;
  if (core.save.vendors?.[vendor.id]?.haggle?.day === day) throw new Error("You've haggled here today already.");
  const sheet = sheetNow();
  const check = checkRoll(entryNamed(sheet, "charisma"), wornNow(sheet).charisma ?? 0);
  const outcome = haggleOutcome(check.total);
  keepVendor(vendor.id, { haggle: { day, factor: outcome.factor } });
  const who = personaName();
  narrate(null, `${who} haggles at ${vendor.name}: a Charisma check of ${check.total}. The seller ${outcome.words}.`);
  if (core.settings.aiMoments)
    void runMoment({
      action: `haggles over the prices at ${vendor.name}. The seller ${outcome.words}`,
      source: "thing",
    });
}

// ── Crafting (craft.js) ─────────────────────────────────────────────────────────────────────────────────

/** The recipes known now (the setting's by level, and the player's own), each against what's carried. */
async function recipesNow() {
  const ready = core.inventory.ready();
  const items = ready ? await readItems() : [];
  const level = core.settings.sheet ? valueOf(sheetNow(), "level") : null;
  const known = knownRecipes(PACK.recipes, checkRecipes(core.save?.recipes), level);
  const carried = new Map();
  for (const item of items) carried.set(item.name, (carried.get(item.name) ?? 0) + (Number(item.quantity) || 1));
  return {
    ready,
    locked: known.locked,
    recipes: known.recipes.map((recipe) => ({ ...recipe, ...canCraft(recipe, items) })),
    items: [...carried].map(([name, quantity]) => ({ name, quantity })).sort((a, b) => a.name.localeCompare(b.name)),
  };
}

/** Makes `recipe` once: what it needs is taken from Quartermaster's sheet and what it makes is added, and the chat says so. */
async function craftRecipe(recipe) {
  const takes = craftTakes(recipe, await readItems());
  if (!takes) throw new Error(`You don't have everything ${recipe.name} needs.`);
  for (const take of takes)
    await core.inventory.change(take.id, take.quantity > 0 ? { quantity: take.quantity } : null);
  await addItem({ name: recipe.name, description: recipe.description, quantity: recipe.makes });
  await readItems();
  earnXp(5);
  core.gesture = "interact";
  narrate(null, `${personaName()} makes ${recipe.makes > 1 ? `${recipe.makes} × ` : ""}${recipe.name}.`);
}

async function craft(id) {
  const level = core.settings.sheet ? valueOf(sheetNow(), "level") : null;
  const recipe = knownRecipes(PACK.recipes, checkRecipes(core.save?.recipes), level).recipes.find(
    (entry) => entry.id === id,
  );
  if (!recipe) throw new Error("That recipe isn't known.");
  await craftRecipe(recipe);
}

/** Saves what was put together as a recipe of the player's own (and makes it now, with `make`). */
async function keepRecipe(made, make) {
  if (!core.save) return;
  const before = checkRecipes(core.save.recipes);
  const recipes = saveRecipe(before, made);
  if (recipes === before) throw new Error("A recipe needs a name, and at least one thing put in.");
  core.save = { ...core.save, recipes };
  core.saves.write(core.save);
  if (make) await craftRecipe(recipes.at(-1));
}

/** What money is called in this world, and how much of it is carried (the quantity of the item of that name). */
function purse() {
  const name = core.save?.currency || PACK.currency;
  const held = (core.items ?? []).find((item) => String(item.name).trim().toLowerCase() === name.toLowerCase());
  return { name, amount: held?.quantity ?? 0 };
}

/**
 * "/roll 2d6+1" (a d20 with nothing after it) and "/check strength" (a d20 plus that line of the sheet):
 * rolled by the game and shown in the chat. A check with words after the stat ("/check strength to lift
 * the gate") is then narrated as a moment, with what was rolled.
 */
function rollCommand(which, rest) {
  const who = personaName();
  if (which === "roll") {
    const dice = rest || "d20";
    if (!/^\s*\d{0,2}d\d{1,3}\s*([+-]\s*\d{1,4})?\s*$/iu.test(dice))
      return void core.hud?.setNotice('Dice are written like d20, 2d6 or 1d8+2: "/roll 2d6+1".');
    const rolled = rollDice(dice);
    const each = rolled.rolls.length > 1 ? ` (${rolled.rolls.join(", ")})` : "";
    return void narrate(null, `${who} rolls ${dice.replace(/\s+/gu, "")}: ${rolled.total}${each}.`);
  }
  if (!core.settings.sheet)
    return void core.hud?.setNotice("Checks need your character sheet: turn it on in Settings → Inventory → Sheet.");
  const sheet = sheetNow();
  // The longest run of words that names a line of the sheet; whatever follows is what's being tried.
  const typed = rest.split(/\s+/u).filter(Boolean);
  let entry = null;
  let used = 0;
  for (let take = Math.min(typed.length, 4); take >= 1 && !entry; take--) {
    entry = entryNamed(sheet, typed.slice(0, take).join(" "));
    used = take;
  }
  if (!entry || !("value" in entry))
    return void core.hud?.setNotice(
      'Name one of your sheet\'s numbered lines: "/check strength", "/check fishing to land the pike".',
    );
  const check = checkRoll(entry, wornNow(sheet)[entry.id] ?? 0);
  const sum = `${check.total} (rolled ${check.roll}${check.add ? `, ${check.add > 0 ? "+" : ""}${check.add}` : ""})`;
  narrate(null, `${who} makes a ${entry.name} check: ${sum}.`);
  const trying = typed
    .slice(used)
    .join(" ")
    .replace(/^to\s+/iu, "");
  if (trying)
    void runMoment({
      action: `tries to ${trying}. Their ${entry.name} check came to ${check.total} (a d20 plus ${check.add})`,
      voice: "talk",
      audience: "nearby",
      line: "",
    });
}

/**
 * Something done with an item from the Inventory window: it's done on Quartermaster's sheet, so both
 * show the same, and said in the chat. Using something up applies what its description gives ("+10 HP").
 */
async function itemAction(id, action) {
  const item = (core.items ?? []).find((entry) => entry.id === id);
  if (!item) return;
  const who = personaName();
  if (action === "equip") {
    if (!item.defaultSlot)
      throw new Error(
        `${item.name} has no slot yet: give it one in the Quartermaster tab, then it can be equipped here.`,
      );
    await core.inventory.change(id, { location: `equipped:${item.defaultSlot}` });
    narrate(null, `${who} equips ${item.name}.`);
  } else if (action === "unequip") {
    await core.inventory.change(id, { location: "bag" });
    narrate(null, `${who} puts ${item.name} away.`);
  } else if (action === "use") {
    // (Something that heals by dice, a Potion of Healing: rolled. Anything else: what its description adds.)
    const heals = potionIn(item, byDesc());
    const used = heals
      ? applyChanges(sheetNow(), [{ stat: "hp", by: Math.max(1, rollDice(heals).total) }])
      : useItem(sheetNow(), item.description);
    if (used.applied.length) setSheet(used.sheet);
    await core.inventory.change(id, item.quantity > 1 ? { quantity: item.quantity - 1 } : null);
    const effect = used.applied.map((change) => `${change.name} ${change.from} to ${change.to}`).join(", ");
    narrate(null, `${who} uses 1 ${item.name}${effect ? ` (${effect})` : ""}.`);
  } else if (action === "drop") {
    await core.inventory.change(id, null);
    narrate(null, `${who} drops ${item.name}.`);
  }
  await readItems();
}

function stepClock(dt) {
  const mode = core.settings.time;
  if (mode === "day") core.hour = 12;
  else if (mode === "night") core.hour = 23;
  else core.hour = (core.hour + (dt * 24 * (core.settings.timeSpeed ?? 1)) / DAY_SECONDS) % 24;
  // The weather: off (clear), one kind always, or changing every few minutes (the same for a world each time).
  core.weatherTime = (core.weatherTime ?? 0) + dt;
  const setting = core.settings.weather ?? "off";
  turnSeason();
  core.world.setSeason(seasonNow(), core.settings.seasonLook);
  let kind = setting === "off" ? "clear" : setting;
  if (setting === "changing") {
    const seed = hashString(regionSeed(core.save ?? { region: HOME_REGION, seed: "" }));
    kind = weatherAt(seed, Math.floor(core.weatherTime / WEATHER_PERIOD), seasonNow());
    // A clear morning may start in mist (Settings → World).
    if (kind === "clear" && core.settings.morningMist && mistyMorning(seed, core.social?.day ?? 0, core.hour))
      kind = "mist";
  }
  core.world.setWeather(kind);
  core.world.setLightning(core.settings.lightning);
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
    // (A fight by turns: they move only on their own turn.)
    const waiting = !!core.battle && !battleMine();
    if (keyed || waiting) core.walkTo = null;
    const walkTo = core.walkTo;
    let speedFactor = input.run ? RUN_SPEED : WALK_SPEED * input.amount;
    if (core.carrying) speedFactor = Math.min(speedFactor, WALK_SPEED) * 0.7; // (under a load: a slow walk)
    if (waiting) speedFactor = 0;
    if (afflicted().slow) speedFactor *= 0.5;
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
        speedFactor = input.run ? RUN_SPEED : WALK_SPEED;
      }
    }
    if (moveX || moveZ) {
      // Walking and running each have their own speed setting (a tap's walk is a walk unless Run is on).
      const running = input.run;
      const speed = speedFactor * (running ? core.settings.runSpeed : core.settings.walkSpeed);
      position.x += moveX * speed * dt;
      position.z += moveZ * speed * dt;
      space.resolveCollisions(position, PLAYER_RADIUS, true); // the player may go into the water
      core.crowd.pushOut(position, PLAYER_RADIUS, space);
      const edge = (core.world?.size ?? WORLD_SIZE) / 2 - 2;
      position.x = Math.max(-edge, Math.min(edge, position.x));
      position.z = Math.max(-edge, Math.min(edge, position.z));
      // A fight by turns: anywhere within this turn's movement of where the turn began, and back again, but
      // not past it.
      if (core.battle?.from && battleMine()) {
        const { from, reach } = core.battle;
        const out = Math.hypot(position.x - from.x, position.z - from.z);
        if (out > reach) {
          position.x = from.x + ((position.x - from.x) / out) * reach;
          position.z = from.z + ((position.z - from.z) / out) * reach;
          core.walkTo = null;
        }
      }
      core.moveWay = Math.atan2(moveX, moveZ);
      // (With a weapon drawn they keep facing where the camera looks, stepping sideways and back: below.)
      if (!weaponDrawn()) player.rotation.y = approachAngle(player.rotation.y, core.moveWay, 12 * dt);
      // A tap's walk gives up when something is in the way.
      if (core.walkTo) {
        const moved = Math.hypot(position.x - startX, position.z - startZ);
        core.walkTo.stuck = moved < speed * dt * 0.2 ? (core.walkTo.stuck ?? 0) + dt : 0;
        if (core.walkTo.stuck > 0.6) core.walkTo = null;
      }
    }
    // A weapon drawn: the camera stays behind them, so turning it turns them.
    if (weaponDrawn() && !core.walkTo && core.clock >= (core.stillUntil ?? 0))
      player.rotation.y = approachAngle(player.rotation.y, core.cameraYaw + Math.PI, 14 * dt);
  } else if (core.mode === "ride" && core.mount) {
    // Riding: the same stick and keys, moving the animal under them. It walks, gallops with Shift (or
    // the stick right out), turns less sharply than a person, and swims where the water is deep.
    const { x, y } = input;
    const mount = core.mount;
    // Mid-jump it carries on the way it's facing, at a canter at least, whatever the stick says (which
    // still turns it), and while its back is well up it passes over fences and benches.
    const leaping = !!core.air?.mount;
    // (In a fight by turns the mount moves on its rider's turn only, and within that turn's reach.)
    if ((x || y || leaping) && !(core.battle && !battleMine())) {
      const sin = Math.sin(core.cameraYaw);
      const cos = Math.cos(core.cameraYaw);
      const wantX = -sin * y + cos * x;
      const wantZ = -cos * y - sin * x;
      const moveX = leaping ? Math.sin(player.rotation.y) : wantX;
      const moveZ = leaping ? Math.cos(player.rotation.y) : wantZ;
      const deep = waterAt(position.x, position.z).depth;
      const steered = x || y ? (input.run ? mount.gallop : mount.walk * RIDE_WALK * Math.max(0.4, input.amount)) : 0;
      // (Wading is slow, and swimming slower still, however hard it's ridden.)
      const pace =
        deep > mount.back * 0.8
          ? Math.min(steered, mount.walk * RIDE_WALK)
          : (leaping ? Math.max(steered, LEAP_PACE) : steered) * (deep > WADE_DEPTH ? 0.5 : 1);
      position.x += moveX * pace * dt;
      position.z += moveZ * pace * dt;
      space.resolveCollisions(position, RIDE_RADIUS, true, leaping && core.air.height > LEAP_CLEAR);
      core.crowd.pushOut(position, RIDE_RADIUS, space);
      const edge = (core.world?.size ?? WORLD_SIZE) / 2 - 2;
      position.x = Math.max(-edge, Math.min(edge, position.x));
      position.z = Math.max(-edge, Math.min(edge, position.z));
      if (core.battle?.from && battleMine()) {
        const { from, reach } = core.battle;
        const out = Math.hypot(position.x - from.x, position.z - from.z);
        if (out > reach) {
          position.x = from.x + ((position.x - from.x) / out) * reach;
          position.z = from.z + ((position.z - from.z) / out) * reach;
        }
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
  // (A mount stands on the ground, or floats where it's deep: herd.js afloatAt.)
  const target = core.interior
    ? 0
    : core.swimming
      ? water.level
      : core.mode === "ride" && core.mount
        ? afloatAt(position.x, position.z, core.mount.back)
        : heightAt(position.x, position.z);
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
  // Up on a mount: seated at its back's height, going up and down as its back does in its stride and
  // its leap (it has a shadow of its own).
  const riding = core.mode === "ride" && core.mount;
  const seatAt = riding ? target + core.mount.back - RIDE_SEAT + core.herd.bob(core.mount.id) : 0;
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
  if (input?.take("attack")) swing();
  if (input?.take("block")) block();
  if (input?.take("dodge")) dodge();
  if (input?.take("draw")) draw();
  if (input?.take("endTurn")) endTurn();
  if (input?.take("cast")) cast();
  for (const digit of "1234567890") if (input?.take(`hot${digit}`)) void hotkey(digit);
  if (input?.take("rest") && core.settings.restKey) rest();
  if (input?.take("journal")) core.hud?.toggleJournal();

  stepClock(dt);
  stepPlaces(dt);
  if (core.save && core.clock - core.thumbnailAt > THUMBNAIL_EVERY) {
    core.thumbnailAt = core.clock;
    savePlace(true, captureThumbnail());
  }
  const speed = movePlayer(dt, read);
  carryTick();
  battleTick(dt, speed * dt);
  core.spellFx?.update(dt);
  restTick(dt);
  alliesTick(dt);
  angryTick();
  conditionsTick(dt);
  alliesFxTick(dt);
  tacticsTick();
  aimTick();
  readyTick();
  // (What's carried is brought up to how items are written now, once in each world.)
  if (core.save && !core.save.bracketed && core.blockSeen !== core.save.id && core.inventory.ready()) {
    core.blockSeen = core.save.id;
    void bracketItems();
  }
  // (A persona whose card has a 5e sheet brings it into each world once.)
  if (core.save && core.personas && core.cardSeen !== `${core.save.id}|${core.personaId}`) {
    core.cardSeen = `${core.save.id}|${core.personaId}`;
    applyCard();
  }
  dyingTick();
  core.still = speed < 0.1 ? (core.still ?? 0) + dt : 0; // how long the player has stood still, in seconds
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
    held: core.gestureHeld ?? null,
    carry: weaponDrawn() ? weaponNow().held : null,
    // (Weapon drawn and on the move: which way they're stepping, from the way they face.)
    strafe:
      weaponDrawn() && (core.still ?? 1) === 0 && !core.glide ? (core.moveWay ?? 0) - core.player.rotation.y : null,
    air: !!core.air && !core.air.mount, // (a rider keeps their seat through the animal's jump)
    lookAt,
    talk: false,
    swim: core.swimming,
  });
  core.shape?.animal?.update(dt, still ? 0 : speed, {}); // (in a beast's shape, it's the beast that's seen)
  core.gesture = null;
  core.gestureHeld = null;
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
    core.downed ? "" : fightMode(),
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
  if (!core.interior) core.world.follow(core.player.position.x, core.player.position.z, core.camera);
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
      apart: core.settings.keepApart,
      // What a hostile animal may do about the player, and whether here (Settings: animals, and where
      // confrontations are allowed at all); and whether it's night, for the ones about only then.
      hostile: core.settings.hostileAnimals,
      combat: fighting(),
      // (Which kinds shoot or cast from a distance, and from how far: real time, with the SRD's numbers.)
      ranged:
        core.settings.rangedFoes && core.settings.srdCreatures && fightMode() === "realtime" ? RANGED_KINDS : null,
      // (With each fighting by its own sort: how far this one reaches, and where it wants to stand.)
      ...(tacticsOn() && fightMode() === "realtime"
        ? { rangeOf: foeRange, spotOf: (beast) => core.foeSpots?.get(beast.id) ?? null }
        : {}),
      // (Whom else a creature may go for: the companions in the fight.)
      allies: fightingAllies().map((person) => ({ id: person.id, x: person.position.x, z: person.position.z })),
      // (Nothing goes for someone who's down, or while a scene plays the fight out.)
      down: !!core.downed || core.clock < (core.truceUntil ?? 0),
      bodySeconds: core.settings.bodyMinutes * 60,
      safe: !aggressionAllowed(at.x, at.z),
      night: core.hour < 5.5 || core.hour >= 20.5,
    });
    for (const event of core.herd.takeEvents()) {
      const what = (PACK.animals[event.kind] ?? "the animal").replace(/^the /u, "");
      // Something starts coming for them: by turns, the fight begins there and then (it lands nothing first).
      if (event.type === "chase") {
        if (byTurns()) spotted(event);
        else combatSay("start", { foe: event });
        continue;
      }
      // With fighting on, an attack is rolled against the player's AC and told as what was rolled.
      // By turns: something coming at them starts a fight (or joins the one going on); nothing lands yet.
      if (event.type === "attack" && byTurns()) {
        battleJoin(event.id);
        continue;
      }
      if (event.type === "attack" && fighting()) {
        if (event.ranged) foeShoots(event, what);
        else if (event.target) allyAttacked(event, what);
        else foeAttacks(event, what);
        continue;
      }
      // The other ways to fight: an exchange rolled at once and told, or a scene.
      if (event.type === "attack" && fightMode()) {
        encounter(event, what, "foe");
        continue;
      }
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
    apart: core.settings.keepApart,
    playerSitting: core.mode === "sit",
    playerAngle: core.player.rotation.y,
    playerSpeed: speed,
    hour: core.hour,
    time: core.clock,
    isVisible: (position) => frustum.containsPoint(projected.set(position.x, position.y + 1, position.z)),
    // Whether any of someone standing there could be on screen (a rider, a raised arm): else they aren't drawn.
    inSight: (position) =>
      frustum.intersectsSphere(sightSphere.set(projected.set(position.x, position.y + 1, position.z), 3)),
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
  const falling = WEATHER_LOOK[weather.kind];
  core.sound.tick(dt, {
    dark: core.dark,
    inside,
    rain: falling?.falls === "rain" ? weather.amount * falling.share : 0,
  });
  const thunder = core.world.takeThunder();
  if (thunder !== null) core.sound.thunder(thunder, inside);

  placeCamera(dt);
  core.interior?.room.update(dt, core.camera);

  // The use prompt over whatever is in reach.
  core.target = core.mode === "walk" && !core.walkTo ? pickTarget() : null;
  core.hud?.setRespawn(needsRespawn());
  const label = core.downed
    ? null // (down: the Respawn button is how they get up)
    : core.mode === "sit"
      ? "Stand up"
      : core.mode === "ride"
        ? "Get down"
        : core.target?.label;
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

/** `work()`, counted as a picture being painted until it's done or fails (frameLimitOf). */
async function painting(work) {
  core.painting = (core.painting ?? 0) + 1;
  try {
    return await work();
  } finally {
    core.painting--;
  }
}

function frame(time) {
  if (!core.element || !core.renderer) {
    core.raf = 0;
    return;
  }
  core.raf = requestAnimationFrame(frame);
  if (!core.world || core.paused) return;
  // The frame rate limit (and 30 a second while a picture is painted, when that's on): a frame that's early is skipped.
  const limit = frameLimitOf(core.settings, core.painting > 0);
  if (limit) {
    if (time < (core.frameDue ?? 0) - 1) return;
    core.frameDue = Math.max((core.frameDue ?? 0) + 1000 / limit, time);
  }
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
      height: Math.min(core.renderer.domElement.width, core.renderer.domElement.height),
    });
    core.statsFrames = 0;
    core.statsSince = time;
  }
}

function attach(element) {
  core.element = element;
  if (!core.store) {
    core.store = createStore(savesRemote, {
      onProblem: (error) => console.warn("[wanderworld] a save didn't reach the Engine: it's tried again", error),
    });
    core.saves = createSaves(core.store);
    globalThis.addEventListener?.("pagehide", () => void core.store.flush());
    // Hidden (another tab, the phone locked): saved and sent now. Shown again: another browser may
    // have played meanwhile, so the Engine's saves are read again before anything is saved over them.
    globalThis.document?.addEventListener("visibilitychange", () => {
      if (!core.element) return;
      if (document.visibilityState === "hidden") {
        if (!core.paused) savePlace(true);
        void core.store.flush();
      } else void syncSaves();
    });
  }
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
    // The Inventory window: the sheet, and Quartermaster's items with something to do with each.
    onSheet: () => {
      const sheet = sheetNow();
      return { sheet, worn: wornNow(sheet), slots: slotsShown() };
    },
    onSheetChange: (change) => setSheet(changeSheet(sheetNow(), change)),
    onItems: async () => {
      const ready = core.inventory.ready();
      const items = ready ? await readItems() : [];
      return { ready, items, purse: purse() };
    },
    onCurrency: (name) =>
      setSetup({
        currency: String(name ?? "")
          .trim()
          .slice(0, 30),
      }),
    onGather: (kind) => (kind.startsWith("carry:") ? carryBody(kind.slice(6)) : void gather(kind)),
    onShop: shopNow,
    onVendors: vendorsNow,
    onVendorKinds: setVendorKinds,
    onVendorGuidance: setVendorGuidance,
    onTrade: setTrade,
    onHaggle: haggle,
    onBuy: buy,
    onSell: sell,
    onRecipes: recipesNow,
    onCraft: craft,
    onSaveRecipe: keepRecipe,
    onForgetRecipe: (id) => {
      if (!core.save) return;
      core.save = { ...core.save, recipes: checkRecipes(core.save.recipes).filter((recipe) => recipe.id !== id) };
      core.saves.write(core.save);
    },
    onItemAction: itemAction,
    // The chat window emptied: nothing of it is sent as context after this (every prompt takes its lines
    // of what was said and told from this log). What people remember is theirs and stays.
    onClearChat: () => {
      core.momentLog = [];
      if (core.save) {
        core.save.log = [];
        core.saves.write(core.save);
      }
      showChat();
    },
    onDebugLog: () => core.ai.debugLog(),
    onDebugCall: (id) => core.ai.debugCall(id),
    onDebugClear: () => core.ai.debugClear(),
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
    onInventory: () =>
      core.inventory
        .toggle()
        .catch((error) => core.hud?.setNotice(`The inventory didn't open: ${error?.message ?? error}`)),
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
    onPetCall: petCall,
    onSaveWorld: () => void saveWorldNow(),
    onWorlds: worldsNow,
    onLoadWorld: switchWorld,
    onWorldDetails: worldDetails,
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
    onRegenerateNow: regenerateNow,
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
    onAttack: swing,
    onBlock: block,
    onDodge: dodge,
    onDraw: draw,
    onEndTurn: endTurn,
    onFlee: () => battleEnd("You break off the fight."),
    onCast: cast,
    onHotkey: (key) => void hotkey(key),
    hotkeys: async () => {
      await readItems();
      return { slots: { ...core.save?.hotkeys }, options: hotkeyOptions() };
    },
    onSetHotkey: (key, value) => {
      if (!core.save || !/^\d$/u.test(key)) return;
      const next = { ...core.save.hotkeys };
      if (value) next[key] = String(value).slice(0, 120);
      else delete next[key];
      core.save = { ...core.save, hotkeys: next };
      core.saves.write(core.save);
      core.journalAt = 0;
    },
    // The SRD's spells, for the sheet's picker, and one of them put on the sheet with its rule written out.
    spellList: () =>
      SRD_SPELLS.map((spell) => ({
        name: spell.name,
        level: spell.level,
        cost: spellCost(spell.level),
        classes: spell.classes.join(", "),
        rule: spellRule(spell),
      })),
    // The party and their classes, for the sheet's "Your companions".
    companions: () =>
      core.crowd.party().map((member) => ({
        id: member.id,
        name: nameFor(member.id, member.name),
        classId: classOf(member.id),
      })),
    classList: () =>
      Object.entries(SRD_CLASSES).map(([id, entry]) => ({ id, label: `${entry.name} (${entry.weapon.name})` })),
    onSetClass: (id, classId) => {
      // (The player may have none: "" takes theirs away. A companion always has one.)
      if (!core.save || !(SRD_CLASSES[classId] || (id === "player" && !classId))) return;
      core.save = { ...core.save, classes: { ...core.save.classes, [id]: classId } };
      core.saves.write(core.save);
    },
    playerClass,
    build: buildInfo,
    onBuild: setBuild,
    onAbility: useAbility,
    onAction: (id) => (String(id).startsWith("spell:") ? cast(String(id).slice(6)) : useAbility(id)),
    onShortRest: shortRest,
    onApplyCard: () => applyCard(true),
    onSlots: setSlots,
    onBattleAct: battleAct,
    onAddSpell: (name) => {
      const spell = SRD_SPELLS.find((entry) => entry.name === name);
      if (spell)
        setSheet(changeSheet(sheetNow(), { add: { kind: "spell", name: spell.name, about: spellRule(spell) } }));
    },
    onRespawn: () => respawn(),
    onRespawnNow: () => respawn(true),
    onClearBodies: () => {
      const cleared = core.herd.clearBodies();
      core.hud?.setNotice(cleared ? `Cleared: ${cleared}.` : "There was nothing lying about.");
    },
    onRest: rest,
    onRun: (on) => core.input?.setRun(on),
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
  core.input.onRunToggle((on) => core.hud?.setRun(on)); // (Ctrl: the Run button shows it)
  core.input.setKeys(core.settings?.keys ?? "");
  core.hud.layer.prepend(core.input.stickElement); // under the windows and panels
  core.element.addEventListener("keydown", () => core.sound.unlock());

  if (!ensureRenderer()) {
    core.hud.setStatus(core.failed);
    return;
  }
  core.stage.prepend(core.renderer.domElement);
  if (core.software && !core.softwareTold) {
    core.softwareTold = true; // once per page
    core.hud.setNotice(
      'Your browser is drawing the 3D world without your graphics card, so it will run slowly. Turn on hardware acceleration (sometimes called "graphics acceleration") in your browser\'s settings, then restart the browser. If you can\'t, these are the fastest settings, in Menu → Settings → Display → Graphics: Resolution 1080p or 720p, Ground Simple, "Detailed trees out to" Near, "Trees and plants" and "Rocks and boulders" Sparse, and Draw distance Tiny.',
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
      trades: () => Object.entries(PACK.vendors.kinds).map(([id, kind]) => ({ id, label: kind.label })),
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
      // The AI's own settings, for New world's step on it: as they are, changing one, and the Engine's connections.
      settings: () => core.settings,
      onSetting: changeSetting,
      aiStatus: () => core.ai.status(true),
      connections: () => core.ai.connections(),
    },
    {
      background: `${ART}menu-bg.webp`,
      portrait: `${ART}menu-bg-portrait.webp`,
      logo: `${ART}logo.webp`,
    },
  );
  // Saved worlds are with the Engine (store.js): they're read before the menu lists them.
  const begin = () => {
    if (core.element !== element) return; // closed meanwhile
    if (core.personas) {
      core.hud.setPersonas(core.personas, core.personaId, core.bodies);
      core.hud.setCharacters(core.characters ?? [], core.cast ?? new Set(), core.bodies);
    } else {
      void loadPeople();
    }
    // Back to the tab with a world in play: carry on. Otherwise the main menu.
    // (The windows are new ones, made with this tab: the chat goes back into them.)
    if (core.world && core.save) {
      resume();
      showChat();
    } else openMenu();
    core.resizeObserver = new ResizeObserver(resize);
    core.resizeObserver.observe(core.stage);
    applySettings();
    core.lastTime = 0;
    core.statsSince = 0;
    core.statsFrames = 0;
    if (!core.raf) core.raf = requestAnimationFrame(frame);
  };
  if (core.store.ready) {
    begin();
    void syncSaves(); // (the tab was left and come back to: another browser may have played since)
  } else
    void core.store
      .connect()
      .then(() => {
        // The settings every browser shares: the Engine's, when it has them.
        const shared = core.store.getItem(SHARED_SETTINGS);
        if (!shared) return;
        core.settings = loadSettings(shared);
        saveSettings(core.settings);
      })
      .catch((error) => {
        console.warn("[wanderworld] saved worlds couldn't be read: the server part didn't answer", error);
        core.hud?.setNotice(
          "Wanderworld isn't fully loaded, so your saved worlds can't be read and nothing would be saved. Restart the Engine (needed once after installing or updating Wanderworld), then open this tab again.",
        );
      })
      .then(begin);
}

function detach(element) {
  if (element !== core.element) return;
  core.inventory.close(); // Quartermaster's dock is on the page, not in the game
  if (core.raf) cancelAnimationFrame(core.raf);
  core.raf = 0;
  if (!core.paused) savePlace(true);
  void core.store.flush(); // what's waiting to go to the Engine goes now
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
