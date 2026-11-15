// Weather round the player: rain falling in streaks, snow drifting down, mist or fog. The particles live
// in a box that follows the player (wrapping round as they fall), so the cost is the same anywhere in the
// world. How much each kind changes the sky and the light, and how far you can see in it, is in
// `WEATHER_LOOK`; world.js applies that.
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

/**
 * Each kind of weather at full strength: how far it greys the sky (`grey`) and dims the sun (`dim`), how
 * far you can see in it (`sight`, in metres: the same at every draw distance, which only cuts it shorter),
 * where the haze starts as a share of that (`near`), what falls and how much of it (`falls`, `share`),
 * whether there's lightning (`storm`), and what it's called in a prompt (`word`).
 */
export const WEATHER_LOOK = {
  clear: { grey: 0, dim: 0 },
  mist: { grey: 0.5, dim: 0.15, sight: 130, near: 0.2, word: "mist" },
  "fog-light": { grey: 0.65, dim: 0.25, sight: 85, near: 0.15, word: "light fog" },
  fog: { grey: 0.75, dim: 0.35, sight: 45, near: 0.1, word: "fog" },
  "fog-heavy": { grey: 0.85, dim: 0.45, sight: 20, near: 0.08, word: "heavy fog" },
  "rain-light": { falls: "rain", share: 0.3, grey: 0.6, dim: 0.3, sight: 260, word: "light rain" },
  rain: { falls: "rain", share: 0.6, grey: 0.85, dim: 0.55, sight: 170, word: "rain" },
  "rain-heavy": { falls: "rain", share: 1, grey: 0.95, dim: 0.65, sight: 100, word: "heavy rain" },
  storm: { falls: "rain", share: 1, grey: 1, dim: 0.75, sight: 90, storm: true, word: "a thunderstorm" },
  "snow-light": { falls: "snow", share: 0.3, grey: 0.5, dim: 0.2, sight: 240, word: "light snow" },
  snow: { falls: "snow", share: 0.6, grey: 0.7, dim: 0.3, sight: 140, word: "snow" },
  "snow-heavy": { falls: "snow", share: 1, grey: 0.85, dim: 0.4, sight: 60, word: "heavy snow" },
};
export const WEATHER_KINDS = Object.keys(WEATHER_LOOK);

/**
 * How far the haze reaches (`far`) and where it starts (`near`), in metres: `kind` set in by `amount`
 * (0–1), with things drawn out to `distance`. Weather never lets you see further than the draw distance,
 * and the draw distance never thickens the weather.
 */
export function sightIn(kind, amount, distance) {
  const look = WEATHER_LOOK[kind] ?? WEATHER_LOOK.clear;
  const far = distance + (Math.min(distance, look.sight ?? Infinity) - distance) * amount;
  return { far, near: far * (0.4 + ((look.near ?? (look.sight ? 0.3 : 0.4)) - 0.4) * amount) };
}

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
const DROPS = 2600; // in the heaviest rain; lighter rain shows a share of them
const FLAKES = 2600;

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

  /** Moves everything on by `dt` round `at` (the player), showing `kind` set in by `amount` (0–1). */
  function update(dt, at, kind, amount) {
    time += dt;
    const look = WEATHER_LOOK[kind] ?? WEATHER_LOOK.clear;
    const share = amount * (look.share ?? 0);
    rain.visible = look.falls === "rain" && amount > 0.01;
    snow.visible = look.falls === "snow" && amount > 0.01;
    group.position.set(at.x, at.y - 4, at.z);
    // Only the share of particles that `amount` calls for falls; the rest wait above the box, out of sight.
    if (rain.visible) {
      rainMaterial.opacity = 0.75 * amount;
      const shown = Math.round(DROPS * share);
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
      const shown = Math.round(FLAKES * share);
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

/** What changing weather picks from, and how often (out of 100): mostly clear, the heavy kinds the rarest. */
const CHANGING = [
  ["clear", 55],
  ["rain-light", 7],
  ["rain", 7],
  ["rain-heavy", 4],
  ["storm", 4],
  ["mist", 5],
  ["fog-light", 3],
  ["fog", 3],
  ["fog-heavy", 2],
  ["snow-light", 4],
  ["snow", 4],
  ["snow-heavy", 2],
];

/**
 * Changing weather: what it is at `period` (each a few minutes of play) for a world's `seed`. In a world
 * whose `season` is winter, what would be rain or a storm falls as snow.
 */
export function weatherAt(seed, period, season = "") {
  let hash = (seed ^ Math.imul(period + 1, 0x9e3779b1)) >>> 0;
  hash = Math.imul(hash ^ (hash >>> 15), 0x85ebca6b) >>> 0;
  let roll = (((hash ^ (hash >>> 13)) >>> 0) / 4294967296) * 100;
  let kind = "clear";
  for (const [name, weight] of CHANGING) {
    kind = name;
    if ((roll -= weight) < 0) break;
  }
  if (season !== "winter") return kind;
  return kind === "storm" ? "snow-heavy" : kind.replace("rain", "snow");
}

/**
 * Whether a clear morning starts in mist: about one day in three, from five until eight, the same days for
 * a world each time.
 */
export function mistyMorning(seed, day, hour) {
  if (hour < 5 || hour >= 8) return false;
  const hash = Math.imul((seed ^ Math.imul(day + 7, 0x85ebca6b)) >>> 0, 0x9e3779b1) >>> 0;
  return (hash >>> 8) % 3 === 0;
}
