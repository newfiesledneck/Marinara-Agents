// Wanderworld M0: a Game Mode surface that draws a low-poly three.js world and walks a capsule.
//
// The Engine mounts the same element twice with view="surface" (see Pixelforge's 90-element.js):
// an underlay behind the narration (props.layer === "underlay") and a main mount above it with the
// full surface props. The canvas lives in the underlay and the HUD and touch stick in the main
// mount. Both share this module's one renderer, so a remount never creates a second WebGL context.
import { PerspectiveCamera, Vector3, WebGLRenderer } from "three";
import { createHud } from "./hud.js";
import { createInput } from "./input.js";
import { createSpatial } from "./spatial.js";
import { createWorld, DENSITIES, hashString, heightAt, WORLD_SIZE } from "./world.js";

const PACKAGE_ID = "wanderworld";
const TAG = `marinara-capability-${PACKAGE_ID}`;
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
  chatId: null,
  host: null,
  underlayEl: null,
  mainEl: null,
  resizeObserver: null,
  renderer: null,
  camera: null,
  world: null,
  hud: null,
  input: null,
  densityIndex: 0,
  cameraYaw: 0,
  raf: 0,
  lastTime: 0,
  statsFrames: 0,
  statsSince: 0,
  narrationDoneWas: true,
  location: undefined,
  eventsBound: false,
  failed: null,
};

const cameraTarget = new Vector3();

core.spatial = createSpatial((chatId, name) => {
  if (chatId !== core.chatId) return;
  core.location = name;
  core.hud?.setLocation(name);
});

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
    core.hud?.setStatus(core.failed);
    return false;
  }
  core.renderer.domElement.style.cssText = "display:block;width:100%;height:100%;";
  core.camera = new PerspectiveCamera(60, 1, 0.1, 160);
  return true;
}

function resize() {
  const element = core.underlayEl;
  if (!element || !core.renderer) return;
  const width = element.clientWidth;
  const height = element.clientHeight;
  if (!width || !height) return;
  core.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));
  core.renderer.setSize(width, height, false);
  core.camera.aspect = width / height;
  core.camera.updateProjectionMatrix();
}

function switchChat(chatId) {
  core.chatId = chatId;
  core.world?.dispose();
  core.world = createWorld(hashString(chatId));
  core.world.setDensity(DENSITIES[core.densityIndex]);
  core.cameraYaw = 0;
  core.camera?.position.set(0, CAMERA_HEIGHT, CAMERA_DISTANCE);
  core.location = undefined;
  core.hud?.setLocation(undefined);
  core.spatial.reset();
  void core.spatial.refresh(chatId);
}

function onMainProps(props) {
  if (!props || typeof props.chatId !== "string") return;
  if (props.chatId !== core.chatId) switchChat(props.chatId);
  core.host = props;
  // A finished turn may have moved the party (the GM narrated travel), so read the location again.
  const narrationDone = props.narrationDone !== false;
  if (narrationDone && !core.narrationDoneWas) void core.spatial.refresh(core.chatId);
  core.narrationDoneWas = narrationDone;
}

function bindHostEvents() {
  if (core.eventsBound) return;
  core.eventsBound = true;
  // Capability API 1.12: World Maps changes for this chat arrive addressed to the game's package.
  window.addEventListener("marinara-capability-server-event", (event) => {
    const detail = event?.detail;
    if (!detail || !core.chatId || detail.chatId !== core.chatId) return;
    const packageId = typeof core.host?.packageId === "string" ? core.host.packageId : PACKAGE_ID;
    if (detail.packageId !== packageId || typeof detail.type !== "string") return;
    if (detail.type.startsWith("spatial_")) void core.spatial.refresh(core.chatId);
  });
}

function cycleDensity() {
  core.densityIndex = (core.densityIndex + 1) % DENSITIES.length;
  core.world?.setDensity(DENSITIES[core.densityIndex]);
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
  if (!core.underlayEl || !core.renderer) {
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

function ensureLoop() {
  if (core.raf || !core.underlayEl || !core.renderer) return;
  core.lastTime = 0;
  core.statsSince = 0;
  core.statsFrames = 0;
  core.raf = requestAnimationFrame(frame);
}

function attachUnderlay(element) {
  if (core.underlayEl === element) return;
  core.underlayEl = element;
  element.style.display = "block";
  if (!ensureRenderer()) return;
  element.replaceChildren(core.renderer.domElement);
  core.resizeObserver?.disconnect();
  core.resizeObserver = new ResizeObserver(resize);
  core.resizeObserver.observe(element);
  resize();
  ensureLoop();
}

function attachMain(element, props) {
  if (core.mainEl !== element) {
    core.mainEl = element;
    element.style.display = "block";
    core.hud?.destroy();
    core.input?.dispose();
    core.hud = createHud(element, { onCycleDensity: cycleDensity });
    core.input = createInput();
    core.hud.layer.append(core.input.stickElement);
    core.hud.setLocation(core.location);
    if (core.failed) core.hud.setStatus(core.failed);
    bindHostEvents();
  }
  onMainProps(props);
  ensureLoop();
}

function detach(element) {
  if (element === core.underlayEl) {
    core.underlayEl = null;
    core.resizeObserver?.disconnect();
    core.resizeObserver = null;
  }
  if (element === core.mainEl) {
    core.mainEl = null;
    core.hud?.destroy();
    core.hud = null;
    core.input?.dispose();
    core.input = null;
  }
  if (!core.underlayEl && !core.mainEl) {
    // Both mounts gone: free the world but keep the renderer, so remounts reuse one WebGL context.
    if (core.raf) cancelAnimationFrame(core.raf);
    core.raf = 0;
    core.world?.dispose();
    core.world = null;
    core.chatId = null;
    core.spatial.reset();
  }
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
      if (this.getAttribute("view") !== "surface" || !this.props) return;
      if (this.props.layer === "underlay") attachUnderlay(this);
      else if (typeof this.props.chatId === "string") attachMain(this, this.props);
    } catch (error) {
      reportError(this, error);
    }
  }
}

if (!customElements.get(TAG)) customElements.define(TAG, WanderworldElement);
