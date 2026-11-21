// The Look card's preview: the person being changed, turning slowly in a small picture of their own,
// drawn by a renderer of its own so it shows them whatever the world is doing. Made when the card opens
// and let go when it closes (its pictures and the drawing context with it).
import { DirectionalLight, HemisphereLight, PerspectiveCamera, Scene, WebGLRenderer } from "three";

/** A preview: { element (a canvas to put in the card), show(character), dispose() }. */
export function createPreview() {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "width:100%;height:190px;display:block;border-radius:8px;background:rgba(0,0,0,0.12);";
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", "How they look, turning");
  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch {
    canvas.style.display = "none"; // (no WebGL for a second picture: the card works without it)
    return { element: canvas, show: (character) => character?.dispose(), dispose() {} };
  }
  renderer.setPixelRatio(Math.min(2, globalThis.devicePixelRatio || 1));
  const scene = new Scene();
  scene.add(new HemisphereLight(0xe8f4ff, 0x6a5a4a, 1.7));
  const sun = new DirectionalLight(0xfff1d6, 1.8);
  sun.position.set(2, 3, 4);
  scene.add(sun);
  const camera = new PerspectiveCamera(28, 1, 0.1, 20);
  camera.position.set(0, 1.0, 4.4);
  camera.lookAt(0, 0.92, 0);
  let figure = null;
  let angle = 0.5;
  let last = performance.now();
  let frame = requestAnimationFrame(function tick(now) {
    frame = requestAnimationFrame(tick);
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    const { clientWidth: width, clientHeight: height } = canvas;
    if (!width || !height) return; // (folded away or not in the page yet)
    if (canvas.width !== Math.round(width * renderer.getPixelRatio())) {
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    if (figure) {
      angle += dt * 0.6;
      figure.object.rotation.y = angle;
      figure.update(dt, 0);
    }
    renderer.render(scene, camera);
  });
  return {
    element: canvas,
    /** Shows `character` (a walking character, now the preview's to let go of) in place of the last. */
    show(character) {
      if (figure) {
        scene.remove(figure.object);
        figure.dispose();
      }
      figure = character;
      if (!figure) return;
      scene.add(figure.object);
    },
    dispose() {
      cancelAnimationFrame(frame);
      figure?.dispose();
      figure = null;
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
