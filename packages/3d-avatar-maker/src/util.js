// Small helpers shared by the maker's modules.

/** FNV-1a: a string as a 32-bit number, for seeding. */
export function hashString(text) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32: a small deterministic random source giving numbers in [0, 1). */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const clamp = (value, least, most) => Math.max(least, Math.min(most, value));

/** 0xRRGGBB as "#rrggbb", and back (null when it isn't one). */
export const hexText = (hex) => `#${(hex >>> 0).toString(16).padStart(6, "0").slice(-6)}`;
export const hexNumber = (text) => (/^#?[0-9a-f]{6}$/iu.test(text ?? "") ? parseInt(text.replace("#", ""), 16) : null);
