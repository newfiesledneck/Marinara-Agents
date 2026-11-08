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

/** The painted board every sign is drawn on (kit/art/sign-wood), loaded once and shared. */
let board = null;
const waiting = new Set(); // signs to repaint once the board has loaded
function loadBoard(url) {
  if (board || !url) return;
  board = new Image();
  board.onload = () => {
    for (const redraw of waiting) redraw();
    waiting.clear();
  };
  board.src = url;
}

/**
 * The board drawn nine-slice: its framed corners and edges at their own proportions, the planks in the
 * middle stretched, so a square painting makes a long sign without squashing its frame.
 */
function drawBoard(context, width, height) {
  const source = board.naturalWidth;
  const edge = source * 0.1; // the frame in the painting
  const frame = height * 0.2; // the frame on the sign
  const cuts = [0, edge, source - edge, source];
  const xs = [0, frame, width - frame, width];
  const ys = [0, frame, height - frame, height];
  for (let row = 0; row < 3; row++) {
    for (let column = 0; column < 3; column++) {
      context.drawImage(
        board,
        cuts[column],
        cuts[row],
        cuts[column + 1] - cuts[column],
        cuts[row + 1] - cuts[row],
        xs[column],
        ys[row],
        xs[column + 1] - xs[column],
        ys[row + 1] - ys[row],
      );
    }
  }
}

/** Paints the board's face: planks, a dark frame, the words fitted to the room left, and the picture. */
function paint(canvas, words, picture) {
  const context = canvas.getContext("2d");
  const { width, height } = canvas;
  const painted = board?.complete && board.naturalWidth > 0;
  if (painted) drawBoard(context, width, height);
  const planks = context.createLinearGradient(0, 0, 0, height);
  planks.addColorStop(0, "#8a5a32");
  planks.addColorStop(1, "#6e4527");
  if (!painted) {
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
  }

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
  let size = 70;
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
 * an optional `picture` URL, on the painted board at `boardUrl` (drawn planks until it loads). Returns { mesh, setWords(words), setPicture(url), dispose() }, or null
 * without a browser canvas.
 */
export function createSign({ x, y, z, angle, words, picture = null, boardUrl = null }) {
  if (typeof document === "undefined") return null;
  loadBoard(boardUrl);
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
  if (board && !board.complete) waiting.add(redraw);
  if (picture) sign.setPicture(picture);
  return sign;
}
