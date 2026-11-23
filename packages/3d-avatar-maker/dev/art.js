// Makes the package's own pictures from its own avatars: the Home tab icon, the catalog cover and the
// store banner. Open /art on the test server; each picture is kept in dev/out/ as a PNG, and
// dev/make-art.sh turns them into the files the repository keeps.
//
// For development only; not part of the package.
import { DirectionalLight, HemisphereLight, PerspectiveCamera, Scene, SRGBColorSpace, WebGLRenderer } from "three";
import { createAvatar } from "../src/avatar.js";
import { relaxedPose } from "../src/figure.js";
import { setKitBase, texturesReady } from "../src/kitfiles.js";
import { checkLook, NEUTRAL_LOOK, OUTFIT_PRESETS, outfitLook } from "../src/looks.js";

setKitBase("/kit/");
const said = document.getElementById("said");
const outfit = (name, body) => outfitLook(OUTFIT_PRESETS.find((preset) => preset.name === name), body);
const CAST = [
  { name: "Mira", look: { body: "female", hair: "long", hairTint: 0x7a4a26, skin: "caucasian", ...outfit("Modern casual", "female") } },
  {
    name: "Aldric",
    look: { body: "male", hair: "short", hairTint: 0x2b1d14, skin: "african", facialHair: "beard-01", ...outfit("Ranger", "male"), variants: {} },
  },
  {
    name: "Wren",
    look: { body: "female", race: "elf", shape: { ears: 1 }, hair: "braid", hairTint: 0xe0c890, skin: "asian", ...outfit("Mage", "female") },
  },
];

const renderer = new WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.outputColorSpace = SRGBColorSpace;

/** One figure drawn on a clear background, `width` × `height`: the camera looks at `at` from `back` away. */
function shot(figure, width, height, { at, back, side = 0.25, fov = 26 }) {
  renderer.setPixelRatio(1);
  renderer.setSize(width, height, false);
  const scene = new Scene();
  scene.add(new HemisphereLight(0xeaf2ff, 0x70604e, 1.6));
  const key = new DirectionalLight(0xfff2dc, 1.9);
  key.position.set(2, 3.2, 4);
  scene.add(key, figure.object);
  const camera = new PerspectiveCamera(fov, width / height, 0.05, 50);
  camera.position.set(side * back, at + 0.02 * back, back);
  camera.lookAt(0, at, 0);
  renderer.render(scene, camera);
  const copy = document.createElement("canvas");
  copy.width = width;
  copy.height = height;
  copy.getContext("2d").drawImage(renderer.domElement, 0, 0);
  scene.remove(figure.object);
  return copy;
}

const backdrop = (context, width, height) => {
  const glow = context.createRadialGradient(width / 2, height * 0.4, 0, width / 2, height * 0.4, Math.max(width, height) * 0.75);
  glow.addColorStop(0, "#4a5878");
  glow.addColorStop(1, "#171a22");
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);
};

async function keep(canvas, name) {
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  await fetch(`/dev/out/${name}`, { method: "POST", body: blob });
}

async function main() {
  const figures = [];
  for (const { name, look } of CAST) {
    const figure = await createAvatar(checkLook({ ...NEUTRAL_LOOK, ...look }), name, "auto");
    relaxedPose(figure, 0);
    figures.push(figure);
  }
  await texturesReady();
  await new Promise((resolve) => setTimeout(resolve, 500));
  const headOf = (figure) => figure.humanoid.head.getWorldPosition(figure.object.position.clone()).y;

  // The icon: a head and shoulders in a rounded square, 256 px.
  const icon = document.createElement("canvas");
  icon.width = icon.height = 256;
  let context = icon.getContext("2d");
  context.beginPath();
  context.roundRect(0, 0, 256, 256, 48);
  context.clip();
  backdrop(context, 256, 256);
  context.drawImage(shot(figures[0], 256, 256, { at: headOf(figures[0]) + 0.04, back: 1.05, side: 0.3 }), 0, 0);
  await keep(icon, "icon.png");

  // The cover: the same, larger and square, 512 px.
  const cover = document.createElement("canvas");
  cover.width = cover.height = 512;
  context = cover.getContext("2d");
  backdrop(context, 512, 512);
  context.drawImage(shot(figures[0], 512, 512, { at: headOf(figures[0]) - 0.12, back: 1.9, side: 0.3 }), 0, 0);
  await keep(cover, "cover.png");

  // The banner: the three of them from the knees up, with the name, 2400 × 900.
  const banner = document.createElement("canvas");
  banner.width = 2400;
  banner.height = 900;
  context = banner.getContext("2d");
  backdrop(context, 2400, 900);
  figures.forEach((figure, i) => {
    const picture = shot(figure, 700, 900, { at: headOf(figure) - 0.42, back: 3.0, side: [0.25, -0.2, 0.1][i] });
    context.drawImage(picture, 1000 + i * 380, 0);
  });
  context.fillStyle = "#f2f4f8";
  context.font = "700 118px system-ui, 'Segoe UI', sans-serif";
  context.fillText("3D Avatar Maker", 110, 430);
  context.fillStyle = "#b8c0d0";
  context.font = "400 46px system-ui, 'Segoe UI', sans-serif";
  context.fillText("Build a 3D avatar for any character or persona.", 114, 515);
  await keep(banner, "banner.png");

  said.textContent = "Kept icon.png, cover.png and banner.png in dev/out/.";
  document.body.append(icon, cover, banner);
  window.artDone = true;
}

main().catch((error) => {
  said.textContent = `Couldn't make the pictures: ${error?.message ?? error}`;
  window.artDone = String(error?.message ?? error);
});
