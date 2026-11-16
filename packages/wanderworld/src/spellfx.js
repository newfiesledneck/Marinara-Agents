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

/**
 * How a spell is seen on its way, from what it is (combat.js spellIn): a fan of fire for a cone, a beam for
 * a line or for lightning, a volley for one that can't miss, light from above for radiance that asks a
 * save, a flash at the hand for a touch, and a bolt for the rest. "motes" for one that only mends.
 */
export function spellLook(spell) {
  if (spell.heal && !spell.damage) return "motes";
  if (spell.shape === "cone") return "cone";
  if (spell.shape === "line" || spell.type === "lightning") return "beam";
  if (spell.sure && spell.damage) return "volley";
  if (spell.type === "radiant" && spell.save) return "column";
  if (spell.range <= 2.5) return "touch";
  return "bolt";
}

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

  /** Runs `run` after `seconds` (kept in step with the effects, so a pause holds it too). */
  function delayed(scene, seconds, run) {
    const mesh = glow(BALL, 0xffffff, 0);
    mesh.scale.setScalar(0.001);
    add(scene, mesh, Math.max(0.01, seconds), (effect, through) => {
      if (through >= 1) run();
    });
  }

  /** A beam: light along the whole line at once (`jagged`: lightning), then fading; `then` runs as it strikes. */
  function beam(scene, from, to, colour, { size = 1, then = null, jagged = false } = {}) {
    const far = Math.hypot(to.x - from.x, to.y - from.y, to.z - from.z);
    const count = Math.max(6, Math.min(40, Math.round(far * 2.5)));
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      const off = jagged && i > 0 && i < count ? 0.26 : 0.03;
      const mesh = glow(BALL, colour, 0.95);
      mesh.position.set(
        from.x + (to.x - from.x) * t + (Math.random() - 0.5) * off,
        from.y + (to.y - from.y) * t + (Math.random() - 0.5) * off,
        from.z + (to.z - from.z) * t + (Math.random() - 0.5) * off,
      );
      add(scene, mesh, 0.4, (effect, through) => {
        mesh.scale.setScalar(0.11 * size * (1 - through * 0.7));
        mesh.material.opacity = 0.95 * (1 - through);
      });
    }
    burst(scene, to, colour, size);
    then?.();
  }

  /** A fan of bolts from `from` toward `to` and to either side of it: a cone. `then` runs as the middle one lands. */
  function cone(scene, from, to, colour, { size = 1, then = null } = {}) {
    const angle = Math.atan2(to.x - from.x, to.z - from.z);
    const far = Math.max(2.5, Math.hypot(to.x - from.x, to.z - from.z));
    [-0.5, -0.25, 0, 0.25, 0.5].forEach((off) =>
      bolt(
        scene,
        from,
        { x: from.x + Math.sin(angle + off) * far, y: to.y, z: from.z + Math.cos(angle + off) * far },
        colour,
        { seconds: 0.22, size: size * 0.8, then: off === 0 ? then : null },
      ),
    );
  }

  /** Three small bolts one after another, each from a little apart: one that can't miss. `then` runs as the last lands. */
  function volley(scene, from, to, colour, { size = 1, then = null } = {}) {
    for (let i = 0; i < 3; i++)
      delayed(scene, i * 0.09, () =>
        bolt(scene, { x: from.x + (i - 1) * 0.28, y: from.y + (i % 2) * 0.3, z: from.z }, to, colour, {
          seconds: 0.24,
          size: size * 0.6,
          then: i === 2 ? then : null,
        }),
      );
  }

  /** Light falling on `to` from above. */
  function column(scene, to, colour, { size = 1, then = null } = {}) {
    beam(scene, { x: to.x, y: to.y + 9, z: to.z }, to, colour, { size: size * 1.5, then });
  }

  /** A flash where the hand lands, and motes off it: a touch. */
  function touch(scene, to, colour, { size = 1, then = null } = {}) {
    burst(scene, to, colour, size * 0.8);
    motes(scene, { x: to.x, y: to.y - 0.7, z: to.z }, colour, 6);
    then?.();
  }

  /** A ring thrown out over the ground from `at` to `radius` metres: a shove, a shock. */
  function wave(scene, at, colour, radius = 3) {
    for (const [delay, strength] of [
      [0, 0.9],
      [0.12, 0.5],
    ])
      delayed(scene, delay, () => {
        const mesh = glow(RING, colour, strength);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(at.x, at.y, at.z);
        add(scene, mesh, 0.5, (effect, through) => {
          mesh.scale.setScalar(0.4 + through * radius);
          mesh.material.opacity = strength * (1 - through);
        });
      });
  }

  /** Motes circling (x, z) for `seconds`: something under a spell. */
  function swirl(scene, at, colour, seconds, size = 1) {
    const lasts = Math.max(0.5, Math.min(12, seconds));
    for (let i = 0; i < 5; i++) {
      const mesh = glow(BALL, colour, 0.85);
      const start = (i / 5) * Math.PI * 2;
      add(scene, mesh, lasts, (effect, through) => {
        const angle = start + effect.life * 2.4;
        mesh.position.set(
          at.x + Math.sin(angle) * 0.6 * size,
          at.y + 0.5 + Math.sin(effect.life * 3 + i) * 0.35,
          at.z + Math.cos(angle) * 0.6 * size,
        );
        mesh.scale.setScalar(0.06);
        mesh.material.opacity = 0.85 * Math.min(1, (1 - through) * 5);
      });
    }
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

  /**
   * A thin circle of `radius` metres lying on the ground round `at`, seen through what's in front of it, until
   * its `remove()` is called: how far a turn's movement reaches.
   */
  function circle(scene, at, radius, colour) {
    const mesh = new Mesh(
      new RingGeometry(Math.max(0.1, radius - 0.12), radius, 72),
      new MeshBasicMaterial({ color: colour, transparent: true, opacity: 0.55, depthTest: false, depthWrite: false }),
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(at.x, at.y, at.z);
    mesh.renderOrder = 5;
    scene.add(mesh);
    return {
      remove() {
        mesh.removeFromParent();
        mesh.geometry.dispose();
        mesh.material.dispose();
      },
    };
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

  return {
    bolt,
    beam,
    cone,
    volley,
    column,
    touch,
    wave,
    swirl,
    burst,
    ring,
    circle,
    motes,
    update,
    clear,
    count: () => live.length,
  };
}
