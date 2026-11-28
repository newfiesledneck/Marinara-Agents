// Which parts of an avatar move on springs, and how much: the look's `physics` record.
//
//   physics: { hair: { on, amount }, bust: { on, amount }, butt: { on, amount } }
//
// Every part is optional. A part left out is on at amount 1, which is how an avatar made before this record
// behaves, so an older look opens as it was. With a part off, its bones and springs aren't made at all:
// nothing of it is in the preview or in a saved file. The amount (0 to 2) says how far the part moves; it
// changes the spring's settings and nothing else (`jointAt`), so the avatar rests in the same shape at any
// amount, and a saved VRM carries the same settings the preview swings with.
//
// The parts themselves: hair.js and realistic-physics.js (hair on chains), bust.js (a bone in each breast),
// glutes.js (a bone in each buttock); springs.js swings them all.

/** The parts that can move: [the look's field, its name, what moves]. */
export const PHYSICS_PARTS = [
  ["hair", "Hair", "Hair that hangs below the head swings as the head and body move."],
  ["bust", "Bust", "The breasts sway a little as the body moves, and the arms push them."],
  ["butt", "Buttocks", "The buttocks shake a little as the hips move."],
];
/** The amount's range, and the amount a part has unless the look says otherwise. */
export const PHYSICS_AMOUNT = [0, 2];
export const PHYSICS_USUAL = 1;
// At amount 0 a part is held all but still: its spring is this many times as stiff as made.
const STILL = 50;

/** A part's { on, amount } as the look has it (`raw`), each within what it can be; missing: on, amount 1. */
function partOf(raw) {
  const said = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  const amount = Number.isFinite(said.amount) ? said.amount : PHYSICS_USUAL;
  return {
    on: said.on !== false,
    amount: Math.round(Math.max(PHYSICS_AMOUNT[0], Math.min(PHYSICS_AMOUNT[1], amount)) * 1000) / 1000,
  };
}

/** Every part's { on, amount } for a look (checked or not): what the builders and the controls read. */
export function physicsOf(look) {
  const raw = look?.physics && typeof look.physics === "object" ? look.physics : {};
  return Object.fromEntries(PHYSICS_PARTS.map(([part]) => [part, partOf(raw[part])]));
}

/**
 * A look's `physics` made safe (looks.js checkLook): only the parts there are, each { on, amount } within its
 * range, and only those that differ from the usual (on, amount 1). Undefined when nothing differs, so a look
 * that leaves physics alone stays as it was.
 */
export function checkPhysics(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const kept = {};
  for (const [part] of PHYSICS_PARTS) {
    const { on, amount } = partOf(raw[part]);
    if (!on || amount !== PHYSICS_USUAL) kept[part] = { on, amount };
  }
  return Object.keys(kept).length ? kept : undefined;
}

/**
 * A spring joint's settings (springs.js HAIR_JOINT and the rest) at `amount`: the pull back to rest
 * (stiffness) divided by the amount, so a part swings about that many times as far and takes that much longer
 * to settle, and its weight (gravity) divided the same way, so it hangs at rest exactly as it does at
 * amount 1. Drag and the hit radius stay. At 0 the spring is STILL times as stiff: held where it rests.
 */
export function jointAt(joint, amount = PHYSICS_USUAL) {
  if (amount === PHYSICS_USUAL) return joint;
  const by = amount > 0 ? Math.max(amount, 1 / STILL) : 1 / STILL;
  return { ...joint, stiffness: joint.stiffness / by, gravityPower: joint.gravityPower / by };
}
