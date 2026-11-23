// The maker's 3D view: the avatar on a floor, lit, with a camera the user turns, moves and zooms (mouse,
// touch or keys). It draws only while it's on screen and the tab is showing.
import {
  CircleGeometry,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { animateFace } from "./face.js";
import { movingPose, relaxedPose, restPose, tPose } from "./figure.js";
import { createMotionPlayer } from "./motions.js";
import { createSprings } from "./springs.js";

export const POSES = [
  ["relaxed", "Relaxed"],
  ["moving", "Moving: looks about, to show the hair swing"],
  ["a", "A-pose"],
  ["t", "T-pose"],
];

/**
 * A stage in `canvas`: { show(figure), setPose(pose), setFace(mode), setMotion(id), pauseMotion(paused),
 * view("body" | "face"), resize(), dispose(), failed }. The face plays `mode` (face.js FACE_MODES) in every
 * pose, and the hair and a tail swing on their springs (springs.js) as the body moves; with reduced motion they
 * rest. An animation (motions.js MOTIONS) plays over the pose only when the user picks one, reduced motion or
 * not, and the Face and Hand views follow the part they show while it plays.
 * `failed` is true when the browser gave no WebGL; the maker then says so in words.
 */
export function createStage(canvas) {
  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: false });
  } catch {
    const none = () => {};
    return {
      failed: true,
      show: none,
      setPose: none,
      setFace: none,
      setMotion: none,
      pauseMotion: none,
      view: none,
      resize: none,
      dispose: none,
    };
  }
  renderer.setPixelRatio(Math.min(2, globalThis.devicePixelRatio || 1));
  renderer.outputColorSpace = SRGBColorSpace;
  const scene = new Scene();
  scene.add(new HemisphereLight(0xeaf2ff, 0x70604e, 1.6));
  const key = new DirectionalLight(0xfff2dc, 1.9);
  key.position.set(2, 3.2, 4);
  const fill = new DirectionalLight(0xcfe0ff, 0.5);
  fill.position.set(-3, 1.5, -2);
  scene.add(key, fill);
  // A soft disc under the feet, so the figure stands on something.
  const floor = new Mesh(
    new CircleGeometry(0.75, 48),
    new MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.16, depthWrite: false }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0.002;
  scene.add(floor);

  const camera = new PerspectiveCamera(30, 1, 0.01, 50);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.12;
  controls.minDistance = 0.1; // (close enough to check a nail or an eyelid)
  controls.maxDistance = 9;
  controls.maxPolarAngle = Math.PI * 0.92;
  controls.listenToKeyEvents(canvas); // arrow keys move the view when the picture has focus

  let figure = null;
  let springs = null; // (the figure's hair and tail swinging)
  let last = 0;
  let pose = "relaxed";
  let face = "lively";
  let frame = 0;
  let visible = true;
  let disposed = false;
  const started = performance.now();
  const reduced = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const head = new Vector3();
  const motion = createMotionPlayer(); // (the animation the user picked, if any)
  let wasAnimated = false;
  let viewing = "body";
  const followed = new Vector3(); // (where the part the view shows was, so the camera can follow it)
  /** The part the Face or Hand view looks at, which the camera follows while an animation plays. */
  const viewedPart = () =>
    viewing === "face"
      ? figure?.humanoid.head
      : viewing === "hand"
        ? (figure?.humanoid.leftMiddleProximal ?? figure?.humanoid.leftHand)
        : null;

  function applyPose() {
    if (!figure) return;
    if (pose === "t") tPose(figure);
    else if (pose === "a") restPose(figure);
    else if (pose === "moving" && !reduced) movingPose(figure, (performance.now() - started) / 1000);
    else relaxedPose(figure, reduced ? 0 : (performance.now() - started) / 1000);
  }

  function view(which = "body") {
    viewing = which;
    viewedPart()?.getWorldPosition(followed);
    const tall = figure ? figure.humanoid.head.getWorldPosition(head).y + 0.12 : 1.75;
    if (which === "face") {
      const at = figure ? figure.humanoid.head.getWorldPosition(head).y + 0.06 : 1.62;
      controls.target.set(0, at, 0);
      camera.position.set(0.18, at + 0.02, 0.95);
    } else if (which === "hand" && figure?.humanoid.leftHand) {
      // (The left hand, from the front and a little above, close enough to see the nails; in the T-pose,
      // from above, where the backs of the fingers face.)
      const at = figure.humanoid.leftMiddleProximal ?? figure.humanoid.leftHand;
      at.getWorldPosition(head);
      controls.target.copy(head);
      if (pose === "t") camera.position.set(head.x + 0.02, head.y + 0.42, head.z + 0.12);
      else camera.position.set(head.x + 0.12, head.y + 0.1, head.z + 0.42);
    } else if (which === "feet" && figure?.humanoid.leftToes) {
      // (Both feet, from the front and above.)
      figure.humanoid.leftToes.getWorldPosition(head);
      controls.target.set(0, head.y, head.z);
      camera.position.set(0.05, head.y + 0.35, head.z + 0.45);
    } else {
      controls.target.set(0, tall * 0.52, 0);
      camera.position.set(0.5, tall * 0.6, Math.max(2.6, tall * 2.3));
    }
    controls.update();
  }

  function resize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function draw() {
    frame = 0;
    if (disposed) return;
    if (visible && document.visibilityState !== "hidden") {
      const now = performance.now();
      const dt = last ? (now - last) / 1000 : 0;
      const animated = motion.step(figure, dt, applyPose);
      if (!animated && (pose === "relaxed" || pose === "moving") && !reduced) applyPose();
      const part = viewedPart();
      if (part && animated) {
        // (The Face and Hand views keep the part in sight, easing after it as it moves.)
        const by = part
          .getWorldPosition(head)
          .sub(followed)
          .multiplyScalar(Math.min(1, dt * 6));
        controls.target.add(by);
        camera.position.add(by);
        followed.add(by);
      } else part?.getWorldPosition(followed);
      controls.update();
      const [faceMode, faceAt] = motion.face(face, (now - started) / 1000);
      if (figure) animateFace(figure, faceMode, faceAt, camera.position, reduced && !animated);
      if (springs && (!reduced || animated)) springs.step(dt);
      else if (springs && wasAnimated) springs.reset(); // (with reduced motion, the hair at rest again)
      wasAnimated = animated;
      last = now;
      renderer.render(scene, camera);
    }
    frame = requestAnimationFrame(draw);
  }

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  const seen = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
  seen.observe(canvas);
  resize();
  view("body");
  frame = requestAnimationFrame(draw);

  return {
    failed: false,
    /** Shows `next` in place of the figure there was, which is let go. The camera stays where it is. */
    show(next) {
      if (figure) {
        scene.remove(figure.object);
        figure.dispose();
      }
      figure = next;
      springs = null;
      if (figure) {
        scene.add(figure.object);
        if (!motion.adopt(figure)) applyPose(); // (an animation playing goes on with the new look)
        springs = createSprings(figure);
      }
    },
    setPose(next) {
      pose = next;
      if (motion.active) return; // (the pose an animation eases back to when it stops)
      applyPose();
      springs?.reset(); // (from rest in the new pose, rather than whipped there)
    },
    setFace(next) {
      face = next;
    },
    /** Plays animation `id` (motions.js MOTIONS), easing in from the pose shown; null eases back to the pose. */
    setMotion(id) {
      if (id) motion.play(figure, id);
      else motion.stop(figure);
    },
    pauseMotion(paused) {
      motion.pause(paused);
    },
    view,
    resize,
    dispose() {
      disposed = true;
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      seen.disconnect();
      controls.dispose();
      if (figure) {
        scene.remove(figure.object);
        figure.dispose();
        figure = null;
      }
      floor.geometry.dispose();
      floor.material.dispose();
      renderer.dispose();
    },
  };
}
