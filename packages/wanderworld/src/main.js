// Wanderworld: a Home screen game that draws a low-poly three.js town and walks your persona around it.
//
// The Engine mounts this element once, with view="browser", as the package's Home tab. The canvas, the
// HUD and the touch stick all live inside it. The renderer is created once per page and reused when the
// tab is closed and reopened, so switching tabs never piles up WebGL contexts.
import { Group, PerspectiveCamera, Vector3, WebGLRenderer } from "three";
import { createFigure, listCharacters, listPersonas } from "./character.js";
import { createHud } from "./hud.js";
import { createInput } from "./input.js";
import { findModel, loadModelCharacter } from "./models.js";
import { createCrowd, MAX_PEOPLE } from "./npcs.js";
import { createWorld, DENSITIES, hashString, heightAt, SPAWN, WORLD_SIZE } from "./world.js";

const PACKAGE_ID = "wanderworld";
const TAG = `marinara-capability-${PACKAGE_ID}`;
const FIRST_SEED = "wanderworld";
const MAX_PIXEL_RATIO = 1.5; // phones run at up to 3×; 1.5 keeps the fill rate affordable
const WALK_SPEED = 2.5; // metres per second: an unhurried walk
const RUN_SPEED = 5; // with Shift
const CAMERA_DISTANCE = 8; // the starting zoom
const CAMERA_HEIGHT = 4.2; // the starting height, which sets the starting tilt
const MIN_ZOOM = 2.5;
const MAX_ZOOM = 18;
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
const UI_SELECTOR = "button, select, input, label, textarea, [data-wanderworld-ui]";
const PERSONA_KEY = "wanderworld.persona"; // this package's own browser storage keys
const CAST_KEY = "wanderworld.cast";
const PLAYER_RADIUS = 0.35;
const STATS_INTERVAL_MS = 500;
const NO_INPUT = { x: 0, y: 0, amount: 0, run: false, yaw: 0, pitch: 0, zoom: 0 };

const core = {
  element: null,
  props: null,
  stage: null,
  resizeObserver: null,
  renderer: null,
  camera: null,
  world: null,
  seed: FIRST_SEED,
  player: new Group(), // position and facing; the persona's body sits inside it
  character: null,
  personas: null,
  personaId: null,
  personaLoad: 0,
  characters: null, // [{ id, name }] from the Engine
  cast: new Set(), // the character ids living in town
  crowd: createCrowd(),
  hud: null,
  input: null,
  densityIndex: 0,
  cameraYaw: 0,
  cameraPitch: START_PITCH,
  zoom: CAMERA_DISTANCE,
  pinch: new Map(), // touch pointers on the world, for pinch-to-zoom
  drag: null, // { id, x, y, travelled } while a mouse button or one finger drags the view
  raf: 0,
  lastTime: 0,
  statsFrames: 0,
  statsSince: 0,
  failed: null,
};

const cameraTarget = new Vector3();

function reportError(element, error) {
  console.error("[wanderworld]", error);
  try {
    const message = `Wanderworld: ${error?.message ?? String(error)}`;
    element?.dispatchEvent(new CustomEvent("marinara-capability-runtime-error", { detail: { message } }));
  } catch {
    // reporting must never throw
  }
}

/** One renderer for the page's lifetime. Returns false when the device has no WebGL. */
function ensureRenderer() {
  if (core.renderer) return true;
  if (core.failed) return false;
  try {
    // Antialiasing only where pixels are big; on a high-density phone it costs more than it shows.
    core.renderer = new WebGLRenderer({ antialias: window.devicePixelRatio <= 1, powerPreference: "high-performance" });
  } catch (error) {
    console.warn("[wanderworld] WebGL unavailable", error);
    core.failed = "This device can't draw the 3D world (WebGL is unavailable).";
    return false;
  }
  core.renderer.domElement.style.cssText = "position:absolute;inset:0;display:block;width:100%;height:100%;";
  core.camera = new PerspectiveCamera(60, 1, 0.1, 160);
  return true;
}

function resize() {
  if (!core.stage || !core.renderer) return;
  const width = core.stage.clientWidth;
  const height = core.stage.clientHeight;
  if (!width || !height) return;
  core.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));
  core.renderer.setSize(width, height, false);
  core.camera.aspect = width / height;
  core.camera.updateProjectionMatrix();
}

function buildWorld(seed) {
  core.seed = seed;
  // Take the player and townsfolk out first: disposing the old world frees everything still in its scene.
  core.player.removeFromParent();
  core.crowd.detach();
  core.world?.dispose();
  core.world = createWorld(hashString(seed));
  core.world.setDensity(DENSITIES[core.densityIndex]);
  core.world.scene.add(core.player);
  core.crowd.setWorld(core.world);
  core.player.position.set(SPAWN.x, heightAt(SPAWN.x, SPAWN.z), SPAWN.z);
  core.player.rotation.y = 0;
  core.cameraYaw = 0;
  core.cameraPitch = START_PITCH;
  core.camera?.position.set(SPAWN.x, CAMERA_HEIGHT, SPAWN.z + CAMERA_DISTANCE);
}

function setCharacter(character) {
  if (core.character) {
    core.player.remove(core.character.object);
    core.character.dispose();
  }
  core.character = character;
  core.player.add(character.object);
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

/** Shows the persona's own 3D model when it has one, and a low-poly figure until then or instead. */
async function choosePersona(id) {
  const persona = core.personas?.find((entry) => entry.id === id) ?? null;
  core.personaId = persona?.id ?? null;
  if (persona) store(PERSONA_KEY, persona.id);
  const load = ++core.personaLoad;
  setCharacter(createFigure(persona?.name ?? ""));
  if (!persona) return;
  const model = await findModel({ type: "persona", id: persona.id });
  if (!model || load !== core.personaLoad) return;
  core.hud?.setStatus(`Loading ${persona.name}'s model…`);
  try {
    const character = await loadModelCharacter(model);
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
  const chosen = (core.characters ?? []).filter((character) => core.cast.has(character.id));
  core.crowd.setCast(chosen);
  core.hud?.setCharacters(core.characters ?? [], core.cast);
  store(CAST_KEY, JSON.stringify([...core.cast]));
}

function toggleCharacter(id, chosen) {
  if (chosen && core.cast.size < MAX_PEOPLE) core.cast.add(id);
  else core.cast.delete(id);
  updateCast();
}

/** Reads the Engine's personas and characters once, then restores the remembered persona and cast. */
async function loadPeople() {
  if (core.personas) return;
  const [personas, characters] = await Promise.all([listPersonas(), listCharacters()]);
  core.personas = personas;
  core.characters = characters;
  let stored;
  try {
    stored = JSON.parse(readStored(CAST_KEY) ?? "[]");
  } catch {
    stored = []; // a damaged saved cast starts empty
  }
  const known = new Set(characters.map((character) => character.id));
  core.cast = new Set((Array.isArray(stored) ? stored : []).filter((id) => known.has(id)).slice(0, MAX_PEOPLE));
  updateCast();
  const remembered = readStored(PERSONA_KEY);
  const selected = personas.find((entry) => entry.id === remembered) ?? personas[0] ?? null;
  core.hud?.setPersonas(personas, selected?.id);
  await choosePersona(selected?.id ?? null);
}

function newWorld() {
  buildWorld(`world-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`);
}

/** Multiplies the camera distance by `factor` (below 1 zooms in), within the zoom limits. */
function zoomBy(factor) {
  core.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, core.zoom * factor));
}

/** Turns the view: positive `yaw` looks left, positive `pitch` raises the camera to look down. */
function lookBy(yaw, pitch) {
  core.cameraYaw += yaw;
  core.cameraPitch = Math.max(MIN_PITCH, Math.min(MAX_PITCH, core.cameraPitch + pitch));
}

/**
 * The camera on the world itself: drag (left or middle mouse button, or one finger) to look around, the
 * wheel or a two-finger pinch to zoom. A press that barely moves is a click, kept apart for "activate".
 */
function bindCamera(stage) {
  stage.style.cursor = "grab";
  stage.addEventListener(
    "wheel",
    (event) => {
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
    if (event.target instanceof Element && event.target.closest(UI_SELECTOR)) return;
    if (event.pointerType === "touch") {
      core.pinch.set(event.pointerId, { x: event.clientX, y: event.clientY });
      // One finger looks around; a second finger turns it into a pinch.
      core.drag =
        core.pinch.size === 1 ? { id: event.pointerId, x: event.clientX, y: event.clientY, travelled: 0 } : null;
      return;
    }
    if (event.button !== 0 && event.button !== 1) return;
    if (event.button === 1) event.preventDefault(); // no middle-click autoscroll
    core.drag = { id: event.pointerId, x: event.clientX, y: event.clientY, travelled: 0 };
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
    core.pinch.delete(event.pointerId);
    if (core.drag?.id === event.pointerId) core.drag = null;
    stage.style.cursor = "grab";
  };
  stage.addEventListener("pointerup", release);
  stage.addEventListener("pointercancel", release);
}

function cycleDensity() {
  core.densityIndex = (core.densityIndex + 1) % DENSITIES.length;
  core.world?.setDensity(DENSITIES[core.densityIndex]);
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

/** Moves `current` toward `target` along the shorter way round the circle. */
function approachAngle(current, target, amount) {
  const difference = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + difference * Math.min(1, amount);
}

function step(dt) {
  const { resolveCollisions } = core.world;
  const player = core.player;
  const { x, y, amount, run, yaw, pitch, zoom } = core.input?.read() ?? NO_INPUT;
  if (yaw || pitch) lookBy(yaw * YAW_KEY_SPEED * dt, pitch * PITCH_KEY_SPEED * dt);
  if (zoom) zoomBy(Math.exp(zoom * KEY_ZOOM_RATE * dt));
  const sin = Math.sin(core.cameraYaw);
  const cos = Math.cos(core.cameraYaw);
  // The camera sits behind the player, so "forward" points away from it.
  const moveX = -sin * y + cos * x;
  const moveZ = -cos * y - sin * x;
  const position = player.position;
  const startX = position.x;
  const startZ = position.z;
  if (moveX || moveZ) {
    const speed = run ? RUN_SPEED : WALK_SPEED * amount;
    position.x += moveX * speed * dt;
    position.z += moveZ * speed * dt;
    resolveCollisions(position, PLAYER_RADIUS);
    core.crowd.pushOut(position, PLAYER_RADIUS);
    const edge = WORLD_SIZE / 2 - 2;
    position.x = Math.max(-edge, Math.min(edge, position.x));
    position.z = Math.max(-edge, Math.min(edge, position.z));
    player.rotation.y = approachAngle(player.rotation.y, Math.atan2(moveX, moveZ), 12 * dt);
  }
  position.y = heightAt(position.x, position.z);
  // Animate by how far the body really moved, so walking into a wall doesn't run on the spot.
  const speed = dt > 0 ? Math.hypot(position.x - startX, position.z - startZ) / dt : 0;
  core.character?.update(dt, speed);
  core.crowd.update(dt, position);

  // The camera orbits a point at head height: yaw around it, pitch above (or a little below) it.
  // It slides in closer when a building stands between it and the player.
  const across = Math.cos(core.cameraPitch);
  const up = Math.sin(core.cameraPitch);
  const reach = core.world.clearSight(
    position.x,
    position.z,
    position.x + sin * core.zoom * across,
    position.z + cos * core.zoom * across,
  );
  const distance = Math.max(Math.min(MIN_CAMERA_DISTANCE, core.zoom), core.zoom * reach);
  const lookY = position.y + LOOK_HEIGHT;
  const cameraX = position.x + sin * distance * across;
  const cameraZ = position.z + cos * distance * across;
  // Never below the ground: looking up from low down stops just above the grass.
  const cameraY = Math.max(lookY + distance * up, heightAt(cameraX, cameraZ) + 0.4);
  cameraTarget.set(cameraX, cameraY, cameraZ);
  core.camera.position.lerp(cameraTarget, 1 - Math.exp(-CAMERA_FOLLOW * dt));
  core.camera.lookAt(position.x, lookY, position.z);
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
  core.renderer.render(core.world.scene, core.camera);

  core.statsFrames++;
  if (!core.statsSince) core.statsSince = time;
  if (time - core.statsSince >= STATS_INTERVAL_MS) {
    const { calls, triangles } = core.renderer.info.render;
    core.hud?.setStats({
      fps: Math.round((core.statsFrames * 1000) / (time - core.statsSince)),
      calls,
      triangles,
      density: DENSITIES[core.densityIndex],
    });
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
    onCycleDensity: cycleDensity,
    onNewWorld: newWorld,
    onToggleFullscreen: toggleFullscreen,
    onPickPersona: (id) => void choosePersona(id),
    onToggleCharacter: toggleCharacter,
    maxPeople: MAX_PEOPLE,
  });
  core.input = createInput();
  core.hud.layer.append(core.input.stickElement);

  if (!ensureRenderer()) {
    core.hud.setStatus(core.failed);
    return;
  }
  core.stage.prepend(core.renderer.domElement);
  if (!core.world) buildWorld(core.seed);
  if (core.personas) {
    core.hud.setPersonas(core.personas, core.personaId);
    core.hud.setCharacters(core.characters ?? [], core.cast);
  } else {
    void loadPeople();
  }
  core.resizeObserver = new ResizeObserver(resize);
  core.resizeObserver.observe(core.stage);
  resize();
  core.lastTime = 0;
  core.statsSince = 0;
  core.statsFrames = 0;
  if (!core.raf) core.raf = requestAnimationFrame(frame);
}

function detach(element) {
  if (element !== core.element) return;
  if (core.raf) cancelAnimationFrame(core.raf);
  core.raf = 0;
  core.resizeObserver?.disconnect();
  core.resizeObserver = null;
  core.input?.dispose();
  core.input = null;
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
