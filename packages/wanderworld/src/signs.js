// Shop signs: a painted board over the door of every shop, the tavern, the temple, the hall and the
// smithy. The words are the place's name in this world (zones.js `signOf`: "Tavern" until it's renamed,
// by hand now and by the AI later, to "The Rusty Tankard"). A board can also carry a picture (a carved
// tankard, an anvil): an image URL, from the kit or one the AI generated later; then the words sit
// beside it. Drawn on a canvas, so signs need a browser (the tests build worlds without them).
import { BoxGeometry, CanvasTexture, Mesh, MeshLambertMaterial, SRGBColorSpace } from "three";

const WIDTH = 1.5; // metres
const HEIGHT = 0.5;
const DEPTH = 0.05;
const PIXELS = 512; // canvas width; height follows the board's shape
const WOOD = 0x6b4426;

/** Paints the board's face: planks, a dark frame, the words fitted to the room left, and the picture. */
function paint(canvas, words, picture) {
  const context = canvas.getContext("2d");
  const { width, height } = canvas;
  const planks = context.createLinearGradient(0, 0, 0, height);
  planks.addColorStop(0, "#8a5a32");
  planks.addColorStop(1, "#6e4527");
  context.fillStyle = planks;
  context.fillRect(0, 0, width, height);
  context.strokeStyle = "rgba(40, 22, 10, 0.35)";
  context.lineWidth = 2;
  for (let y = height / 3; y < height; y += height / 3) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }
  context.strokeStyle = "#3b2312";
  context.lineWidth = 12;
  context.strokeRect(6, 6, width - 12, height - 12);

  let left = 24;
  if (picture?.complete && picture.naturalWidth) {
    const size = height - 36;
    const scale = Math.min(size / picture.naturalWidth, size / picture.naturalHeight);
    const w = picture.naturalWidth * scale;
    const h = picture.naturalHeight * scale;
    context.drawImage(picture, 22 + (size - w) / 2, 18 + (size - h) / 2, w, h);
    left = size + 34;
  }
  if (!words) return;
  const room = width - left - 24;
  let size = 64;
  context.font = `700 ${size}px Georgia, "Times New Roman", serif`;
  while (size > 18 && context.measureText(words).width > room) {
    size -= 2;
    context.font = `700 ${size}px Georgia, "Times New Roman", serif`;
  }
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = "rgba(20, 10, 4, 0.55)";
  context.fillText(words, left + room / 2 + 2, height / 2 + 3);
  context.fillStyle = "#f2dfb4";
  context.fillText(words, left + room / 2, height / 2);
}

/**
 * A sign at (x, y, z) facing `angle` (its face looks along +z turned by `angle`), reading `words`, with
 * an optional `picture` URL. Returns { mesh, setWords(words), setPicture(url), dispose() }, or null
 * without a browser canvas.
 */
export function createSign({ x, y, z, angle, words, picture = null }) {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = PIXELS;
  canvas.height = Math.round((PIXELS * HEIGHT) / WIDTH);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  const wood = new MeshLambertMaterial({ color: WOOD });
  const face = new MeshLambertMaterial({ map: texture });
  // Box faces: +x, −x, +y, −y, +z (the front), −z.
  const mesh = new Mesh(new BoxGeometry(WIDTH, HEIGHT, DEPTH), [wood, wood, wood, wood, face, wood]);
  mesh.position.set(x, y, z);
  mesh.rotation.y = angle;
  let current = words;
  let image = null;
  const redraw = () => {
    paint(canvas, current, image);
    texture.needsUpdate = true;
  };
  const sign = {
    mesh,
    setWords(next) {
      if (next === current) return;
      current = next;
      redraw();
    },
    setPicture(url) {
      if (!url) {
        image = null;
        redraw();
        return;
      }
      const next = new Image();
      next.onload = () => {
        if (image === next) redraw();
      };
      image = next;
      next.src = url;
    },
    dispose() {
      mesh.removeFromParent();
      mesh.geometry.dispose();
      wood.dispose();
      face.dispose();
      texture.dispose();
    },
  };
  redraw();
  if (picture) sign.setPicture(picture);
  return sign;
}
