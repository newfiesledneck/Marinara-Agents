// Wanderworld M0: a Home screen game that draws a low-poly three.js world and walks a capsule.
//
// The Engine mounts this element once, with view="browser", as the package's Home tab. The canvas, the
// HUD and the touch stick all live inside it. The renderer is created once per page and reused when the
// tab is closed and reopened, so switching tabs never piles up WebGL contexts.
import { PerspectiveCamera, Vector3, WebGLRenderer } from "three";
import { createHud } from "./hud.js";
import { createInput } from "./input.js";
import { createWorld, DENSITIES, hashString, heightAt, WORLD_SIZE } from "./world.js";

const PACKAGE_ID = "wanderworld";
const TAG = `marinara-capability-${PACKAGE_ID}`;
const FIRST_SEED = "wanderworld";
const MAX_PIXEL_RATIO = 1.5; // phones run at up to 3×; 1.5 keeps the fill rate affordable
const WALK_SPEED = 5; // metres per second
const RUN_SPEED = 9;
const TURN_SPEED = 1.8; // camera radians per second
const CAMERA_DISTANCE = 11;
const CAMERA_HEIGHT = 7;
const PLAYER_RADIUS = 0.35;
const STATS_INTERVAL_MS = 500;
const NO_INPUT = { x: 0, y: 0, run: false, turn: 0 };

const core = {
  element: null,
  props: null,
  stage: null,
  resizeObserver: null,
  renderer: null,
  camera: null,
  world: null,
  seed: FIRST_SEED,
  hud: null,
  input: null,
  densityIndex: 0,
  cameraYaw: 0,
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
  core.world?.dispose();
  core.world = createWorld(hashString(seed));
  core.world.setDensity(DENSITIES[core.densityIndex]);
  core.cameraYaw = 0;
  core.camera?.position.set(0, CAMERA_HEIGHT, CAMERA_DISTANCE);
}

function newWorld() {
  buildWorld(`world-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`);
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
  const { player, resolveCollisions } = core.world;
  const { x, y, run, turn } = core.input?.read() ?? NO_INPUT;
  core.cameraYaw += turn * TURN_SPEED * dt;
  const sin = Math.sin(core.cameraYaw);
  const cos = Math.cos(core.cameraYaw);
  // The camera sits behind the player, so "forward" points away from it.
  const moveX = -sin * y + cos * x;
  const moveZ = -cos * y - sin * x;
  const position = player.position;
  if (moveX || moveZ) {
    const speed = run ? RUN_SPEED : WALK_SPEED;
    position.x += moveX * speed * dt;
    position.z += moveZ * speed * dt;
    resolveCollisions(position, PLAYER_RADIUS);
    const edge = WORLD_SIZE / 2 - 2;
    position.x = Math.max(-edge, Math.min(edge, position.x));
    position.z = Math.max(-edge, Math.min(edge, position.z));
    player.rotation.y = approachAngle(player.rotation.y, Math.atan2(moveX, moveZ), 12 * dt);
  }
  position.y = heightAt(position.x, position.z);

  cameraTarget.set(position.x + sin * CAMERA_DISTANCE, position.y + CAMERA_HEIGHT, position.z + cos * CAMERA_DISTANCE);
  core.camera.position.lerp(cameraTarget, 1 - Math.exp(-8 * dt));
  core.camera.lookAt(position.x, position.y + 1.2, position.z);
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

  core.hud = createHud(core.stage, {
    onCycleDensity: cycleDensity,
    onNewWorld: newWorld,
    onToggleFullscreen: toggleFullscreen,
  });
  core.input = createInput();
  core.hud.layer.append(core.input.stickElement);

  if (!ensureRenderer()) {
    core.hud.setStatus(core.failed);
    return;
  }
  core.stage.prepend(core.renderer.domElement);
  if (!core.world) buildWorld(core.seed);
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
