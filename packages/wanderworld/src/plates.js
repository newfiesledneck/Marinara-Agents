// Nameplates over those in a fight (fighthud.js plateData): a name, an HP bar coloured by how hurt they are,
// and marks for what's on them, drawn to a small canvas, one sprite each. A plate is drawn again only when
// what it shows changes, fades with distance (and close to the camera, so it never fills the view), and is
// taken away, its texture and material disposed, as soon as it isn't wanted.
import { Box3, CanvasTexture, LinearFilter, Sprite, SpriteMaterial } from "three";
import { plateFade, plateHeight } from "./fighthud.js";

const WIDTH = 256;
const HEIGHT = 76;
const WORLD_WIDTH = 1.25; // metres across, at its nearest
const MOST = 10; // plates up at once: the nearest

/** Draws `data` (plateData) on the plate's canvas. */
function draw(context, data) {
  context.clearRect(0, 0, WIDTH, HEIGHT);
  context.fillStyle = "rgba(10,14,20,0.74)";
  context.beginPath();
  context.roundRect(2, 2, WIDTH - 4, HEIGHT - 4, 12);
  context.fill();
  if (data.current) {
    context.strokeStyle = "#ffd36b";
    context.lineWidth = 4;
    context.stroke();
  }
  let y = 10;
  if (data.name) {
    context.font = "700 24px system-ui, sans-serif";
    context.fillStyle = "#ffffff";
    context.textAlign = "center";
    context.textBaseline = "top";
    let name = data.name;
    while (name.length > 3 && context.measureText(name).width > WIDTH - 24) name = name.slice(0, -1);
    context.fillText(name === data.name ? name : `${name.trimEnd()}…`, WIDTH / 2, y);
    y += 30;
  }
  // The bar: what's left in its colour, over a dark track.
  context.fillStyle = "#30343a";
  context.fillRect(14, y, WIDTH - 28, 14);
  context.fillStyle = data.colour;
  context.fillRect(14, y, Math.round((WIDTH - 28) * data.share), 14);
  context.strokeStyle = "rgba(255,255,255,0.8)";
  context.lineWidth = 2;
  context.strokeRect(14, y, WIDTH - 28, 14);
  if (data.icons) {
    context.font = "700 18px system-ui, sans-serif";
    context.fillStyle = "#ffe9a8";
    context.textAlign = "center";
    context.textBaseline = "top";
    context.fillText(data.icons, WIDTH / 2, y + 17);
  }
}

/** How tall a body stands over its feet, measured once (metres; 0 when it can't be). */
function measure(group) {
  try {
    const box = new Box3().setFromObject(group);
    return Number.isFinite(box.max.y) ? box.max.y - group.position.y : 0;
  } catch {
    return 0;
  }
}

export function createPlates() {
  const plates = new Map(); // id → { sprite, texture, context, key, lift }
  let scene = null;

  function remove(id) {
    const plate = plates.get(id);
    if (!plate) return;
    plate.sprite.removeFromParent();
    plate.texture.dispose();
    plate.sprite.material.dispose();
    plates.delete(id);
  }
  function make(entry) {
    const canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const texture = new CanvasTexture(canvas);
    texture.minFilter = LinearFilter;
    const sprite = new Sprite(new SpriteMaterial({ map: texture, depthWrite: false, transparent: true }));
    sprite.scale.set(WORLD_WIDTH, (WORLD_WIDTH * HEIGHT) / WIDTH, 1);
    sprite.renderOrder = 15; // (over the name tags, under speech bubbles)
    const lift = entry.lift || plateHeight({ measured: measure(entry.group), size: entry.size, scale: entry.scale });
    const plate = { sprite, texture, context: canvas.getContext("2d"), key: "", lift };
    scene.add(sprite);
    plates.set(entry.id, plate);
    return plate;
  }
  const clear = () => {
    for (const id of [...plates.keys()]) remove(id);
  };

  return {
    /**
     * The plates for this frame. `list`: [{ id, group (their body), data (plateData), far (metres from the
     * player), lift (metres over their feet; 0 to measure the body), size, scale }]; `into`: the scene they
     * go in (a new one clears the old); `eye`: the camera, so one close to it fades out. Those not listed go.
     */
    update(list, into, eye = null) {
      if (into !== scene) {
        clear();
        scene = into;
      }
      if (!scene) return;
      const wanted = new Set();
      for (const entry of [...list].sort((a, b) => a.far - b.far).slice(0, MOST)) {
        if (!entry.group) continue;
        wanted.add(entry.id);
        const plate = plates.get(entry.id) ?? make(entry);
        if (plate.key !== entry.data.key) {
          draw(plate.context, entry.data);
          plate.texture.needsUpdate = true;
          plate.key = entry.data.key;
        }
        const at = entry.group.position;
        plate.sprite.position.set(at.x, at.y + plate.lift, at.z);
        const near = eye ? Math.min(1, Math.max(0, (eye.position.distanceTo(plate.sprite.position) - 2) / 2.5)) : 1;
        const shown = plateFade(entry.far) * near;
        plate.sprite.material.opacity = shown;
        plate.sprite.visible = shown > 0.02 && entry.group.visible !== false;
      }
      for (const id of [...plates.keys()]) if (!wanted.has(id)) remove(id);
    },
    /** The plate under a tap at (x, y) on the stage (`toScreen(x, y, z)` gives a point's place): its id, or null. */
    hit(x, y, toScreen) {
      let best = null;
      let nearest = 34;
      for (const [id, plate] of plates) {
        if (!plate.sprite.visible) continue;
        const { x: px, y: py, z: pz } = plate.sprite.position;
        const screen = toScreen(px, py, pz);
        if (!screen) continue;
        const off = Math.hypot((screen.x - x) / 1.8, screen.y - y);
        if (off < nearest) {
          nearest = off;
          best = id;
        }
      }
      return best;
    },
    clear,
    count: () => plates.size,
  };
}
