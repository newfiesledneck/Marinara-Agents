// A top-down map of a world, drawn on a 2D canvas from what world.js `mapOf` / `previewMap` describe: the
// land shaded by height and slope, the river, roads, the settlement's blocks and the places out in the
// country, with optional names, the player and the regions beyond each edge. No WebGL, so it can draw a
// world that isn't built (New world's preview) as well as the one being played (the Journal).

const SAMPLES = 120; // ground samples along each side

/** Ground colour for a height in metres (above the water). */
function landColour(height) {
  if (height > 30) return [236, 238, 240]; // snow
  if (height > 18) return [138, 132, 124]; // rock
  if (height > 9) return [118, 128, 84]; // high grass
  return [112 - height * 1.5, 150 - height * 2, 78 - height]; // meadow, darker uphill
}

const PLACE_STYLE = {
  hamlet: { colour: "#a2552f", size: 6 },
  farm: { colour: "#d6b14a", size: 5 },
  inn: { colour: "#b23a2a", size: 4.5 },
  cottage: { colour: "#8a6a44", size: 4 },
  cave: { colour: "#3b3a3c", size: 4.5 },
  pond: { colour: "#4f86b0", size: 3 },
};

/** A square map canvas, drawn at `pixels` and shown at up to `shown` CSS pixels wide. */
export function mapCanvas(pixels = 360, shown = 300) {
  const canvas = document.createElement("canvas");
  canvas.width = pixels;
  canvas.height = pixels;
  canvas.style.cssText = `width:100%;max-width:${shown}px;aspect-ratio:1;border-radius:8px;border:1px solid rgba(107,74,43,0.6);align-self:center;`;
  return canvas;
}

/** A fresh random seed, like a new world's. */
export function randomSeed() {
  return `world-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

const lands = new WeakMap(); // map info → its land, drawn once (the Journal redraws the map as you walk)

/** The land of `info` as a small canvas, one pixel per sample, shaded by the slope toward the north-west. */
function landImage(info) {
  if (lands.has(info)) return lands.get(info);
  const half = info.half;
  const cell = (half * 2) / SAMPLES;
  const heights = new Float32Array((SAMPLES + 1) * (SAMPLES + 1));
  for (let j = 0; j <= SAMPLES; j++) {
    for (let i = 0; i <= SAMPLES; i++)
      heights[j * (SAMPLES + 1) + i] = info.groundAt(-half + i * cell, -half + j * cell);
  }
  const land = document.createElement("canvas");
  land.width = SAMPLES;
  land.height = SAMPLES;
  const image = land.getContext("2d").createImageData(SAMPLES, SAMPLES);
  for (let j = 0; j < SAMPLES; j++) {
    for (let i = 0; i < SAMPLES; i++) {
      const at = heights[j * (SAMPLES + 1) + i];
      const east = heights[j * (SAMPLES + 1) + i + 1];
      const south = heights[(j + 1) * (SAMPLES + 1) + i];
      let colour;
      // Water only in the river (a hollow lower than it elsewhere is dry ground).
      if (at < info.waterLevel && info.toRiverBank(-half + i * cell, -half + j * cell) < 0) {
        const depth = Math.min(1, (info.waterLevel - at) / 2);
        colour = [92 - depth * 30, 150 - depth * 30, 186 - depth * 10];
      } else {
        const shade = Math.max(0.6, Math.min(1.35, 1 + (at - east + (at - south)) * 0.05));
        colour = landColour(at).map((value) => value * shade);
      }
      const k = (j * SAMPLES + i) * 4;
      image.data[k] = colour[0];
      image.data[k + 1] = colour[1];
      image.data[k + 2] = colour[2];
      image.data[k + 3] = 255;
    }
  }
  land.getContext("2d").putImageData(image, 0, 0);
  lands.set(info, land);
  return land;
}

/**
 * Draws `info` (world.js map info) on `canvas`. `options`: { labels: [{ x, z, text }], player: { x, z,
 * angle }, edges: { north, east, south, west } (names of the regions beyond) }.
 */
export function drawMap(canvas, info, options = {}) {
  const context = canvas.getContext("2d");
  if (!context || !info) return;
  const size = canvas.width;
  const half = info.half;
  const scale = size / (half * 2);
  const toPixel = (x, z) => [(x + half) * scale, (z + half) * scale];

  context.imageSmoothingEnabled = true;
  context.drawImage(landImage(info), 0, 0, size, size);

  // Roads, then the town's blocks (streets between them show as the dirt or cobble colour round them).
  context.lineCap = "round";
  context.lineJoin = "round";
  context.strokeStyle = "#b99a6a";
  context.lineWidth = Math.max(1.5, 3.2 * scale);
  for (const road of info.roads) {
    context.beginPath();
    road.points.forEach((point, i) => {
      const [x, y] = toPixel(point.x, point.z);
      if (i === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.stroke();
  }
  const { town } = info;
  const span = town.block + town.street;
  context.fillStyle = town.roads === "cobble" ? "#9b9488" : "#b99a6a";
  for (const block of town.blocks) {
    const [x, y] = toPixel(block.x - span / 2, block.z - span / 2);
    context.fillRect(x, y, span * scale, span * scale);
  }
  for (const block of town.blocks) {
    const [x, y] = toPixel(block.x - town.block / 2, block.z - town.block / 2);
    context.fillStyle = block.market ? "#d8cbb0" : "#a2552f";
    context.fillRect(x, y, town.block * scale, town.block * scale);
  }

  if (town.walls) {
    const [x, y] = toPixel(-town.walls, -town.walls);
    context.strokeStyle = "#6f6a60";
    context.lineWidth = Math.max(2, 1.6 * scale);
    context.strokeRect(x, y, town.walls * 2 * scale, town.walls * 2 * scale);
  }
  // Places out in the country.
  for (const place of info.outposts) {
    const style = PLACE_STYLE[place.kind] ?? PLACE_STYLE.cottage;
    const [x, y] = toPixel(place.x, place.z);
    const r = style.size * Math.max(1, size / 260);
    context.fillStyle = style.colour;
    context.strokeStyle = "rgba(30,20,10,0.75)";
    context.lineWidth = 1;
    context.beginPath();
    if (place.kind === "cave") {
      context.moveTo(x, y - r);
      context.lineTo(x + r, y + r * 0.8);
      context.lineTo(x - r, y + r * 0.8);
      context.closePath();
    } else if (place.kind === "farm" || place.kind === "hamlet") {
      context.rect(x - r, y - r, r * 2, r * 2);
    } else {
      context.arc(x, y, r, 0, Math.PI * 2);
    }
    context.fill();
    context.stroke();
  }

  // Names, the regions beyond each edge, and the player.
  const font = Math.max(10, Math.round(size / 30));
  const label = (text, x, y, align = "center") => {
    context.font = `600 ${font}px Georgia, serif`;
    context.textAlign = align;
    context.textBaseline = "middle";
    context.lineWidth = 3;
    context.strokeStyle = "rgba(255,248,230,0.9)";
    context.strokeText(text, x, y);
    context.fillStyle = "#3a2a1a";
    context.fillText(text, x, y);
  };
  // Each name above its place, else below it, wherever it doesn't run into a name already written (the
  // edges' region names count too); one that fits nowhere is left out rather than written over another.
  const taken = [
    [size / 2 - size * 0.2, 0, size * 0.4, font * 1.6],
    [size / 2 - size * 0.2, size - font * 1.6, size * 0.4, font * 1.6],
  ];
  const clashes = (box) =>
    taken.some(([x, y, w, h]) => box[0] < x + w && box[0] + box[2] > x && box[1] < y + h && box[1] + box[3] > y);
  context.font = `600 ${font}px Georgia, serif`;
  for (const entry of options.labels ?? []) {
    const [x, y] = toPixel(entry.x, entry.z);
    const width = context.measureText(entry.text).width + 4;
    for (const at of [y - font * 1.5, y + font * 1.5, y - font * 2.7, y + font * 2.7]) {
      const line = Math.max(font, Math.min(size - font, at));
      const left = Math.max(0, Math.min(size - width, x - width / 2));
      const box = [left, line - font * 0.6, width, font * 1.2];
      if (clashes(box)) continue;
      taken.push(box);
      label(entry.text, left + width / 2, line);
      break;
    }
  }
  const edges = options.edges ?? {};
  if (edges.north) label(`↑ ${edges.north}`, size / 2, font * 0.8);
  if (edges.south) label(`↓ ${edges.south}`, size / 2, size - font * 0.8);
  if (edges.west) label(`← ${edges.west}`, 4, size / 2, "left");
  if (edges.east) label(`${edges.east} →`, size - 4, size / 2, "right");
  if (options.player) {
    const [x, y] = toPixel(options.player.x, options.player.z);
    const r = Math.max(5, size / 60);
    context.save();
    context.translate(x, y);
    context.rotate(Math.PI - options.player.angle);
    context.beginPath();
    context.moveTo(0, -r * 1.4);
    context.lineTo(r, r);
    context.lineTo(-r, r);
    context.closePath();
    context.fillStyle = "#f4e04d";
    context.strokeStyle = "#2a1a0a";
    context.lineWidth = 2;
    context.fill();
    context.stroke();
    context.restore();
  }
}
