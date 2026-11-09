// Weather round the player: rain falling in streaks, snow drifting down, or mist. The particles live in a
// box that follows the player (wrapping round as they fall), so the cost is the same anywhere in the
// world. How much it changes the sky, the light and the fog is in `WEATHER_LOOK`; world.js applies that.
import {
  BufferGeometry,
  CanvasTexture,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  LineSegments,
  Points,
  PointsMaterial,
} from "three";

export const WEATHER_KINDS = ["clear", "rain", "snow", "mist"];

/** How strongly each kind greys the sky, dims the sun and draws the fog in (at full strength). */
export const WEATHER_LOOK = {
  clear: { grey: 0, dim: 0, fog: 0 },
  rain: { grey: 0.85, dim: 0.55, fog: 0.4 },
  snow: { grey: 0.7, dim: 0.3, fog: 0.5 },
  mist: { grey: 0.75, dim: 0.35, fog: 0.75 },
};

const BOX = { half: 26, height: 22 };

/** A soft round flake (white, fading out to the edge), so snow isn't drawn as hard little squares. */
function flakeTexture() {
  if (typeof document === "undefined") return null; // tests run without a page
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const context = canvas.getContext("2d");
  if (!context?.createRadialGradient) return null;
  const glow = context.createRadialGradient(16, 16, 0, 16, 16, 16);
  glow.addColorStop(0, "rgba(255,255,255,1)");
  glow.addColorStop(0.45, "rgba(255,255,255,0.85)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, 32, 32);
  return new CanvasTexture(canvas);
}
const DROPS = 1400;
const FLAKES = 1600;

/** The particles for rain and snow, following the player. `update(dt, at, kind, amount)` each frame. */
export function createWeather() {
  const group = new Group();
  group.name = "weather";
  // Rain: short streaks, slanting a little in the wind.
  const drops = new Float32Array(DROPS * 6);
  const dropSpots = new Float32Array(DROPS * 3);
  for (let i = 0; i < DROPS; i++) {
    dropSpots[i * 3] = (Math.random() * 2 - 1) * BOX.half;
    dropSpots[i * 3 + 1] = Math.random() * BOX.height;
    dropSpots[i * 3 + 2] = (Math.random() * 2 - 1) * BOX.half;
  }
  const rainGeometry = new BufferGeometry();
  rainGeometry.setAttribute("position", new Float32BufferAttribute(drops, 3));
  const rainMaterial = new LineBasicMaterial({ color: 0xc4d2e0, transparent: true, opacity: 0, depthWrite: false });
  const rain = new LineSegments(rainGeometry, rainMaterial);
  rain.frustumCulled = false;
  // Snow: soft white flakes drifting as they fall.
  const flakes = new Float32Array(FLAKES * 3);
  const flakePhase = new Float32Array(FLAKES);
  for (let i = 0; i < FLAKES; i++) {
    flakes[i * 3] = (Math.random() * 2 - 1) * BOX.half;
    flakes[i * 3 + 1] = Math.random() * BOX.height;
    flakes[i * 3 + 2] = (Math.random() * 2 - 1) * BOX.half;
    flakePhase[i] = Math.random() * Math.PI * 2;
  }
  const snowGeometry = new BufferGeometry();
  snowGeometry.setAttribute("position", new Float32BufferAttribute(flakes, 3));
  const flake = flakeTexture();
  const snowMaterial = new PointsMaterial({
    color: 0xffffff,
    size: 0.22,
    map: flake,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const snow = new Points(snowGeometry, snowMaterial);
  snow.frustumCulled = false;
  group.add(rain, snow);
  let time = 0;

  /** Moves everything on by `dt` round `at` (the player), showing `kind` at `amount` (0–1). */
  function update(dt, at, kind, amount) {
    time += dt;
    rain.visible = kind === "rain" && amount > 0.01;
    snow.visible = kind === "snow" && amount > 0.01;
    group.position.set(at.x, at.y - 4, at.z);
    // Only the share of particles that `amount` calls for falls; the rest wait above the box, out of sight.
    if (rain.visible) {
      rainMaterial.opacity = 0.75 * amount;
      const shown = Math.round(DROPS * amount);
      const position = rainGeometry.attributes.position.array;
      for (let i = 0; i < DROPS; i++) {
        let y = dropSpots[i * 3 + 1] - dt * 17;
        if (y < 0) y += BOX.height;
        dropSpots[i * 3 + 1] = y;
        const x = dropSpots[i * 3];
        const z = dropSpots[i * 3 + 2];
        const hidden = i >= shown ? 1000 : 0;
        position.set([x, y + hidden, z, x + 0.15, y + 1.2 + hidden, z + 0.06], i * 6);
      }
      rainGeometry.attributes.position.needsUpdate = true;
    }
    if (snow.visible) {
      snowMaterial.opacity = 0.9 * amount;
      const shown = Math.round(FLAKES * amount);
      const position = snowGeometry.attributes.position.array;
      for (let i = 0; i < FLAKES; i++) {
        let y = position[i * 3 + 1] - dt * (1.1 + (i % 5) * 0.12);
        if (y < 0 || y > BOX.height + 10) y = (y + BOX.height * 10) % BOX.height;
        position[i * 3 + 1] = i >= shown ? BOX.height + 500 : y;
        position[i * 3] = flakes[i * 3] + Math.sin(time * 0.7 + flakePhase[i]) * 0.6;
        position[i * 3 + 2] = flakes[i * 3 + 2] + Math.cos(time * 0.5 + flakePhase[i]) * 0.6;
      }
      snowGeometry.attributes.position.needsUpdate = true;
    }
  }

  function dispose() {
    rainGeometry.dispose();
    rainMaterial.dispose();
    snowGeometry.dispose();
    snowMaterial.dispose();
    flake?.dispose();
  }

  return { group, update, dispose };
}

/**
 * Changing weather: what it is at `period` (each a few minutes of play) for a world's `seed` — mostly
 * clear, sometimes rain or mist, now and then snow.
 */
export function weatherAt(seed, period) {
  let hash = (seed ^ Math.imul(period + 1, 0x9e3779b1)) >>> 0;
  hash = Math.imul(hash ^ (hash >>> 15), 0x85ebca6b) >>> 0;
  const roll = ((hash ^ (hash >>> 13)) >>> 0) / 4294967296;
  if (roll < 0.55) return "clear";
  if (roll < 0.77) return "rain";
  if (roll < 0.9) return "mist";
  return "snow";
}
