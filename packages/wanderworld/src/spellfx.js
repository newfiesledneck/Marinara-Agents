// What a spell looks like: a bolt of light with a trail from the caster to where it lands, a burst there,
// a ring round something held, motes rising round someone mended. All small glowing shapes that fade, a few
// at a time, drawn over the world (additive, no lights: they cost next to nothing). `createSpellFx()` gives
// { bolt, burst, ring, motes, update(dt), clear() }; each effect is added to the scene it's given.

import { AdditiveBlending, Mesh, MeshBasicMaterial, RingGeometry, SphereGeometry } from "three";

/** A colour for each kind of damage (the SRD's names), and for mending and holding. */
export const SPELL_COLOURS = {
  fire: 0xff8a2a,
  cold: 0x9fdcff,
  lightning: 0xbfd4ff,
  thunder: 0xd6c6ff,
  acid: 0x9cff5a,
  poison: 0x7bd84a,
  necrotic: 0x9a6bd6,
  radiant: 0xfff0a8,
  force: 0xd8a8ff,
  psychic: 0xff9ad8,
  heal: 0x8dffb0,
  hold: 0xc9a0ff,
  fear: 0x8a5cc0,
};
export const spellColour = (kind) => SPELL_COLOURS[kind] ?? 0xffd9a0;

const BALL = new SphereGeometry(1, 12, 8);
const RING = new RingGeometry(0.82, 1, 28);

export function createSpellFx() {
  let live = []; // { mesh, life, seconds, tick(effect, through, dt) }

  const glow = (geometry, colour, opacity = 1) =>
    new Mesh(
      geometry,
      new MeshBasicMaterial({
        color: colour,
        transparent: true,
        opacity,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    );
  const add = (scene, mesh, seconds, tick) => {
    scene.add(mesh);
    const effect = { mesh, life: 0, seconds, tick };
    live.push(effect);
    return effect;
  };

  /** An expanding, fading ball of light at (x, y, z). */
  function burst(scene, at, colour, size = 1) {
    const mesh = glow(BALL, colour, 0.9);
    mesh.position.set(at.x, at.y, at.z);
    add(scene, mesh, 0.45, (effect, through) => {
      mesh.scale.setScalar(size * (0.25 + through * 1.4));
      mesh.material.opacity = 0.9 * (1 - through);
    });
    // A flat ring spreading over the ground with it.
    const ring = glow(RING, colour, 0.8);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(at.x, at.y - 0.6, at.z);
    add(scene, ring, 0.6, (effect, through) => {
      ring.scale.setScalar(size * (0.3 + through * 2.2));
      ring.material.opacity = 0.8 * (1 - through);
    });
  }

  /**
   * A bolt from `from` to `to` (each { x, y, z }) in `seconds`, leaving a fading trail, with a burst where
   * it lands; `then` runs as it lands.
   */
  function bolt(scene, from, to, colour, { seconds = 0.26, size = 1, then = null } = {}) {
    const head = glow(BALL, colour);
    head.scale.setScalar(0.17 * size);
    head.position.set(from.x, from.y, from.z);
    let dropped = 0;
    add(scene, head, seconds, (effect, through) => {
      head.position.set(
        from.x + (to.x - from.x) * through,
        from.y + (to.y - from.y) * through + Math.sin(through * Math.PI) * 0.25,
        from.z + (to.z - from.z) * through,
      );
      // The trail: a mote left behind every few hundredths of a second.
      if (effect.life - dropped > 0.025) {
        dropped = effect.life;
        const mote = glow(BALL, colour, 0.7);
        mote.position.copy(head.position);
        add(scene, mote, 0.28, (trail, age) => {
          mote.scale.setScalar(0.12 * size * (1 - age));
          mote.material.opacity = 0.7 * (1 - age);
        });
      }
      if (through >= 1) {
        burst(scene, to, colour, size);
        then?.();
      }
    });
  }

  /** A ring turning round (x, z) at `y` for `seconds`: something held where it stands. */
  function ring(scene, at, colour, seconds, size = 1) {
    const mesh = glow(RING, colour, 0.7);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(at.x, at.y, at.z);
    add(scene, mesh, seconds, (effect, through) => {
      mesh.scale.setScalar(size * (0.9 + 0.1 * Math.sin(effect.life * 6)));
      mesh.rotation.z = effect.life * 1.6;
      mesh.material.opacity = 0.7 * Math.min(1, (1 - through) * 4);
    });
  }

  /** Motes of light rising round (x, z) from `y`: mending. */
  function motes(scene, at, colour, count = 10) {
    for (let i = 0; i < count; i++) {
      const mesh = glow(BALL, colour, 0.9);
      const angle = (i / count) * Math.PI * 2;
      const far = 0.35 + (i % 3) * 0.12;
      const delay = (i % 5) * 0.06;
      mesh.scale.setScalar(0);
      add(scene, mesh, 1 + delay, (effect) => {
        const age = Math.max(0, effect.life - delay);
        mesh.position.set(
          at.x + Math.sin(angle + age * 2) * far,
          at.y + 0.2 + age * 1.6,
          at.z + Math.cos(angle + age * 2) * far,
        );
        mesh.scale.setScalar(0.07 * Math.sin(Math.min(1, age) * Math.PI));
        mesh.material.opacity = 0.9;
      });
    }
  }

  function update(dt) {
    if (!live.length) return;
    // (An effect's tick may add others, a trail or a burst: those are in `live` already when this loop ends.)
    const now = live;
    live = [];
    for (const effect of now) {
      effect.life += dt;
      const through = Math.min(1, effect.life / effect.seconds);
      effect.tick(effect, through, dt);
      if (through < 1) live.push(effect);
      else {
        effect.mesh.removeFromParent();
        effect.mesh.material.dispose();
      }
    }
  }

  function clear() {
    for (const effect of live) {
      effect.mesh.removeFromParent();
      effect.mesh.material.dispose();
    }
    live = [];
  }

  return { bolt, burst, ring, motes, update, clear, count: () => live.length };
}
