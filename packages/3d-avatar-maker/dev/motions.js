// The motions page: one avatar drawn through the preview's animations (or its faces), frame by frame, on one
// sheet, to look over every animation for hands, clothes and faces that go wrong. Open /motions on the test
// server; the sheet is kept in dev/out/ as a PNG.
//
//   /motions?body=female&motions=idle,walk&frames=8&step=0.6&view=body&name=sheet   (body: female, male or realistic)
//
// `view`: body (the default), back, hand, legs, face, head-side, head-back, head-top, mouth, mouth-side or
// mouth-below. `faces=1` draws each
// face of the Face list in place of the animations, and `keys=aa,oh:0.5` the face's own keys, each alone.
// `outfit` names a ready-made outfit (Modern casual unless said); `look` is a look as JSON, over that;
// `packs=0` leaves the wardrobe packs out.
//
// For development only; not part of the package.
import {
  DirectionalLight,
  HemisphereLight,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from "three";
import { createAvatar } from "../src/avatar.js";
import { animateFace, FACE_MODES, setFace } from "../src/face.js";
import { relaxedPose } from "../src/figure.js";
import { setKitBase, texturesReady } from "../src/kitfiles.js";
import { checkLook, NEUTRAL_LOOK, OUTFIT_PRESETS, outfitLook } from "../src/looks.js";
import { motionPose, MOTIONS } from "../src/motions.js";
import { loadPacks } from "../src/packs.js";
import { createSprings } from "../src/springs.js";

setKitBase("/kit/");
const said = document.getElementById("said");
const asked = new URLSearchParams(location.search);
const number = (name, fallback) =>
  Number.isFinite(Number(asked.get(name))) && asked.get(name) ? Number(asked.get(name)) : fallback;

const renderer = new WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
renderer.outputColorSpace = SRGBColorSpace;
renderer.setPixelRatio(1);
renderer.setClearColor(0x30343c, 1);
const scene = new Scene();
scene.add(new HemisphereLight(0xeaf2ff, 0x70604e, 1.6));
const key = new DirectionalLight(0xfff2dc, 1.9);
key.position.set(2, 3.2, 4);
scene.add(key);
const camera = new PerspectiveCamera(30, 1, 0.01, 50);
const at = new Vector3();

/** The camera on the part `view` names, as the figure stands now. */
function aim(figure, view) {
  const n = figure.humanoid;
  if (view === "hand") {
    (n.leftMiddleProximal ?? n.leftHand).getWorldPosition(at);
    camera.position.set(at.x + 0.14, at.y + 0.08, at.z + 0.4);
  } else if (view === "face") {
    n.head.getWorldPosition(at).y += 0.05;
    camera.position.set(at.x, at.y + 0.01, at.z + 0.7);
  } else if (view === "head-side" || view === "head-back" || view === "head-top") {
    // (The head from its left front, from behind, or from above: where hair shows what's under it.)
    n.head.getWorldPosition(at).y += 0.07;
    if (view === "head-side") camera.position.set(at.x + 0.55, at.y + 0.08, at.z + 0.42);
    else if (view === "head-back") camera.position.set(at.x - 0.3, at.y + 0.12, at.z - 0.6);
    else camera.position.set(at.x + 0.12, at.y + 0.62, at.z + 0.22);
  } else if (view === "mouth" || view === "mouth-side" || view === "mouth-below") {
    // (The mouth, close: about six centimetres under the eyes. From the front, the side, or a little below.)
    (figure.bones.get("eye_l") ?? n.head).getWorldPosition(at);
    at.set(0, at.y - 0.065, at.z);
    if (view === "mouth-side") camera.position.set(at.x + 0.26, at.y, at.z + 0.12);
    else camera.position.set(at.x, at.y - (view === "mouth-below" ? 0.07 : 0), at.z + 0.28);
  } else if (view === "legs") {
    n.hips.getWorldPosition(at).y *= 0.55;
    camera.position.set(at.x + 0.5, at.y + 0.2, at.z + 2.3);
  } else {
    at.set(0, 0.92, 0);
    camera.position.set(0.9, 1.15, view === "back" ? -4.3 : 4.3);
  }
  camera.lookAt(at);
}

async function main() {
  if (asked.get("packs") !== "0") await loadPacks();
  const body = ["male", "realistic"].includes(asked.get("body")) ? asked.get("body") : "female";
  // (As the maker's own new avatar is dressed, or in the outfit named.)
  const outfit = OUTFIT_PRESETS.find((preset) => preset.name === (asked.get("outfit") ?? "Modern casual"));
  const look = checkLook({
    ...NEUTRAL_LOOK,
    body,
    ...(outfit && body !== "realistic" ? outfitLook(outfit, body) : {}),
    ...(body === "realistic" ? { realShape: { gender: 1 } } : {}),
    ...JSON.parse(asked.get("look") ?? "{}"),
  });
  const figure = await createAvatar(look, "Sheet", "auto");
  scene.add(figure.object);
  globalThis.sheetFigure = figure; // (to look at from the browser's console)
  relaxedPose(figure, 0);
  const springs = createSprings(figure); // (hair, hanging cloth, the bust and a tail, as in the preview)
  await texturesReady();
  await new Promise((resolve) => setTimeout(resolve, 500));

  // (`keys`: the face's own keys, each alone, as "aa,oh:0.5": a mouth shape a talking avatar passes through.)
  const keys =
    asked
      .get("keys")
      ?.split(",")
      .map((entry) => entry.split(":")) ?? null;
  const faces = asked.get("faces") === "1" || !!keys;
  const view = asked.get("view") ?? (faces ? "face" : "body");
  const frames = faces ? 1 : number("frames", 8);
  const step = number("step", 0.6);
  const from = number("from", 0.3);
  const rows = keys
    ? keys.map(([key, weight = "1"]) => [{ [key]: Number(weight) }, `${key} ${weight}`])
    : faces
      ? FACE_MODES.filter(([mode]) => mode !== "lively" && mode !== "talking")
      : MOTIONS.filter(([id]) => !asked.get("motions") || asked.get("motions").split(",").includes(id));
  const [width, height] = [
    number("w", view === "body" || view === "back" ? 200 : 260),
    number("h", view === "face" ? 260 : 320),
  ];
  // (Faces go across; animations go down, their frames across.)
  const across = faces ? rows.length : frames;
  const down = faces ? 1 : rows.length;
  const sheet = document.createElement("canvas");
  sheet.width = across * width;
  sheet.height = down * (height + 18);
  const context = sheet.getContext("2d");
  context.fillStyle = "#14161a";
  context.fillRect(0, 0, sheet.width, sheet.height);
  context.font = "12px system-ui, sans-serif";
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  rows.forEach(([id, label], row) => {
    let played = 0;
    if (!faces) {
      motionPose(figure, id, 0);
      springs?.reset();
    }
    for (let frame = 0; frame < frames; frame++) {
      const seconds = from + frame * step;
      if (faces) {
        relaxedPose(figure, 0);
        if (keys) setFace(figure, id);
        else animateFace(figure, id, 0, null, true);
      } else {
        // (Played through at 30 frames a second, so the springs are where the preview would have them.)
        for (; played < seconds; played += 1 / 30) {
          motionPose(figure, id, played);
          springs?.step(1 / 30);
        }
        motionPose(figure, id, seconds);
        springs?.step(1 / 30);
        animateFace(figure, "still", 0, null, true);
      }
      aim(figure, view);
      renderer.render(scene, camera);
      const [x, y] = faces ? [row * width, 0] : [frame * width, row * (height + 18)];
      context.drawImage(renderer.domElement, x, y + 18);
      context.fillStyle = "#e8eaf0";
      context.fillText(
        faces ? label : frame ? `${seconds.toFixed(1)} s` : `${id}: ${label}`.slice(0, 34),
        x + 4,
        y + 13,
      );
    }
  });
  const name = `${asked.get("name") ?? `motions-${body}-${view}`}.png`;
  const blob = await new Promise((resolve) => sheet.toBlob(resolve, "image/png"));
  await fetch(`/dev/out/${name}`, { method: "POST", body: blob });
  said.textContent = `Kept ${name} in dev/out/.`;
  document.body.append(sheet);
  window.sheetFigure = figure; // (to look into from the console)
  window.sheetDone = name;
}

main().catch((error) => {
  said.textContent = `Couldn't make the sheet: ${error?.message ?? error}`;
  window.sheetDone = `failed: ${error?.message ?? error}`;
});
