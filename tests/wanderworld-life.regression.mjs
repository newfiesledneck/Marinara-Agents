// Wanderworld's livelier town, run without a browser: buildings dressed in their own style, the smithy's
// open forge, the spots where people work and rest, townsfolk taking them, and the clips for it all.
// Run: node tests/wanderworld-life.regression.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Vector3 } from "three";

const context = new Proxy(
  { measureText: (text) => ({ width: String(text).length * 14 }) },
  { get: (target, key) => target[key] ?? (() => ({ addColorStop() {} })), set: () => true },
);
globalThis.document = { createElement: () => ({ getContext: () => context, width: 0, height: 0 }) };
globalThis.fetch = async () => new Response("null", { status: 404 }); // nobody has a 3D model

const { buildBuilding, forgeBay, makeSpec, styleFor } = await import("../packages/wanderworld/src/buildings.js");
const { HOUSE_PIECES, housePieces, porchPosts } = await import("../packages/wanderworld/src/houses.js");
const { ACT_NAMES, createClipPlayer, LIE_SECONDS } = await import("../packages/wanderworld/src/clips.js");
const { actCall, actWords } = await import("../packages/wanderworld/src/pack.js");
const { createCrowd } = await import("../packages/wanderworld/src/npcs.js");
const { createWorld, rng } = await import("../packages/wanderworld/src/world.js");

const kit = JSON.parse(
  readFileSync(new URL("../packages/wanderworld/kit/village/index.json", import.meta.url), "utf8"),
);

// ── A building's style ───────────────────────────────────────────────────────
{
  for (const piece of HOUSE_PIECES) assert.ok(kit.models[piece], `the village kit has ${piece}`);
  const looks = new Set();
  for (let i = 0; i < 200; i++) {
    const kind = ["home", "home", "shop", "tavern", "smithy", "temple", "hall"][i % 7];
    const spec = makeSpec(rng(100 + i), kind, { width: 5 + (i % 9), depth: 5 + (i % 4) });
    const style = styleFor(spec, rng(7000 + i));
    assert.deepEqual(style, styleFor(spec, rng(7000 + i)), "the same building is dressed the same every time");
    for (const tint of [style.roofTint, style.wallTint]) {
      assert.equal(tint.length, 3);
      assert.ok(
        tint.every((value) => value > 0.05 && value <= 4),
        `a tint stays within reason (${tint})`,
      );
    }
    assert.ok(["x", "z"].includes(style.ridge) && ["round", "flat"].includes(style.windows));
    assert.ok(["none", "door", "front"].includes(style.porch));
    if (style.porch === "front") assert.equal(kind, "tavern", "only a tavern has a porch all along its front");
    if (style.porch === "door") assert.equal(kind, "home", "only a home has a lean-to over its door");
    if (kind === "temple" || kind === "hall") assert.equal(style.dormers, 0, "a landmark's roof has no dormers");
    looks.add(`${style.roofTint}|${style.wallTint}|${style.ridge}|${style.windows}|${style.dormers}|${style.porch}`);
    // Dressed, it's still made of the kit's pieces, whatever its style.
    spec.style = style;
    const built = buildBuilding(rng(i), spec);
    spec.bay = built.bay ?? null;
    const pieces = housePieces(spec, built.doorX, i);
    for (const { model, matrix, tints, skip } of pieces) {
      // An upstairs plaster wall leaves its stone course off (the timbering's plaster strip fills in);
      // timbering over a stone course leaves off its plaster.
      if (skip) {
        assert.ok(
          (skip === "brick" && /^wall-plaster-window-.*-round$/u.test(model)) ||
            ((skip === "plaster" || skip === "woodtrim") && model === "wall-plaster-woodgrid"),
          `${model} leaves off ${skip}`,
        );
      }
      assert.ok(kit.models[model], `the kit has ${model}`);
      assert.ok(matrix.elements.every(Number.isFinite), `${model} is placed somewhere real`);
      assert.equal(tints.roundtiles, style.roofTint);
      assert.equal(tints.plaster, style.wallTint);
    }
    const count = (name) => pieces.filter((piece) => piece.model === name).length;
    if (style.porch === "front") {
      const posts = porchPosts("front", spec.width, built.doorX);
      assert.equal(posts.length, spec.width / 2 + 1, "a post at every segment's end");
      assert.equal(count("balcony-simple-straight") + count("balcony-cross-straight"), 0, "a porch, so no balcony");
      assert.equal(
        count("roof-wooden-2x1-l") + count("roof-wooden-2x1-r") + count("roof-wooden-2x1-center"),
        spec.width / 2,
        "the porch's roof runs the whole front",
      );
    }
    if (style.porch === "door") assert.equal(count("roof-wooden-2x1"), 1, "one lean-to over the door");
    if (built.bay) {
      assert.ok(count("wall-arch") >= 3, "the forge is framed by arches");
      assert.equal(count("wall-unevenbrick-door-round") + count("wall-plaster-door-round"), 1, "one door, in the room");
    } else assert.equal(count("wall-arch"), 0, "arches are the forge's");
    built.geometry.dispose();
  }
  assert.ok(looks.size > 60, `buildings come in many looks (${looks.size} among 200)`);
}

// ── The smithy's forge ───────────────────────────────────────────────────────
{
  for (const width of [6, 8, 10]) {
    for (const door of [-width / 2 + 1, 0, width / 2 - 1]) {
      const bay = forgeBay(width, door);
      assert.equal(Math.abs(bay.doorX), width / 2 - 1, "the door goes to one end of the front");
      assert.ok(Math.abs(bay.doorX - bay.roomX) <= bay.roomWidth / 2, "and is in the room's wall");
      assert.ok(bay.x1 - bay.x0 >= 4, `the forge has room to work in (${bay.x1 - bay.x0} m of ${width})`);
      assert.ok(bay.x0 >= -width / 2 && bay.x1 <= width / 2, "inside the footprint");
    }
  }
}

// ── Where people work and rest ───────────────────────────────────────────────
const world = createWorld(51, null, { smithy: 2 });
{
  assert.ok(world.spots.length > 10, `the world marks places to be (${world.spots.length})`);
  for (const spot of world.spots) {
    assert.ok(ACT_NAMES.includes(spot.act), `a spot's act is one the clips have (${spot.act})`);
    assert.ok(["work", "rest", "browse", "camp"].includes(spot.role));
    if (spot.role === "camp") assert.ok(spot.camp, "a campsite's places know their camp");
    assert.ok(Number.isFinite(spot.x) && Number.isFinite(spot.z) && Number.isFinite(spot.angle));
    assert.equal(spot.taken, null);
    assert.ok(actWords(spot.act), `the pack says what ${spot.act} is`);
    if (spot.role === "browse") assert.equal(spot.seller.act, "vend", "a stall's buyer has its seller");
  }
  const smithies = world.doors.filter((door) => door.kind === "smithy");
  assert.ok(smithies.length >= 1, "the town has a smithy");
  for (const smithy of smithies) {
    assert.ok(smithy.spec.bay, "a smithy has its forge");
    const mine = world.spots.filter((spot) => spot.door === smithy.index);
    assert.deepEqual(mine.map((spot) => spot.act).sort(), ["craft", "hammer"], "the smith's places at the forge");
    for (const spot of mine) {
      assert.ok(!world.blocked(spot.x, spot.z, 0.2), "where the smith stands is clear");
      assert.ok(!world.blocked(spot.approach.x, spot.approach.z, 0.2), "and so is the way in");
      // Straight in from the street to the spot, nothing in the way but the low things round it.
      for (let t = 0; t <= 1; t += 0.1) {
        const [x, z] = [
          spot.approach.x + (spot.x - spot.approach.x) * t,
          spot.approach.z + (spot.z - spot.approach.z) * t,
        ];
        assert.ok(!world.blocked(x, z, 0), `the way in to the ${spot.act} spot is open`);
      }
    }
  }
  for (const act of ACT_NAMES) assert.equal(typeof actCall(act, "key", { place: "town" }), "string");
}

// ── Townsfolk take them ──────────────────────────────────────────────────────
{
  const crowd = createCrowd();
  crowd.setDressed(false);
  crowd.setWorld(world);
  const smithy = world.doors.find((door) => door.kind === "smithy");
  const shop = world.doors.find((door) => door.kind === "shop");
  const cast = Array.from({ length: 16 }, (_, i) => ({ id: `c-${i}`, name: `Person ${i}` }));
  crowd.setCast(cast);
  crowd.setHousing({
    "c-0": { home: null, work: smithy.index },
    "c-1": { home: null, work: shop.index },
    "c-2": { home: null, work: shop.index },
  });
  const player = { x: 0, y: 0, z: 400 };
  let time = 0;
  const seen = new Map(); // act → who did it
  const run = (seconds, hour) => {
    for (let elapsed = 0; elapsed < seconds; elapsed += 0.1) {
      time += 0.1;
      crowd.update(0.1, {
        player,
        space: world,
        playerSitting: false,
        hour,
        time,
        isVisible: () => false,
        onFootstep() {},
      });
      world.update(0.1);
      if (Math.round(time * 10) % 20 === 0) {
        for (const person of crowd.snapshot()) {
          if (!person.doing) continue;
          assert.equal(person.state, "busy");
          if (!seen.has(person.doing)) seen.set(person.doing, new Set());
          seen.get(person.doing).add(person.id);
        }
        const holders = world.spots.filter((spot) => spot.taken).map((spot) => spot.taken);
        assert.equal(new Set(holders).size, holders.length, "nobody holds two spots");
      }
    }
  };
  run(900, 10);
  run(900, 14);
  assert.ok(
    seen.get("hammer")?.has("c-0") || seen.get("craft")?.has("c-0"),
    `the smith works at the forge (${[...seen.keys()]})`,
  );
  assert.ok(seen.get("vend")?.has("c-1") || seen.get("vend")?.has("c-2"), "someone from the shop minds a stall");
  for (const [act, who] of seen) {
    if (act === "hammer" || act === "craft") assert.deepEqual([...who], ["c-0"], "only the smith works the forge");
    if (act === "vend")
      assert.ok(
        [...who].every((id) => id === "c-1" || id === "c-2"),
        "only shop people sell",
      );
  }
  assert.ok(
    ["ground", "lie", "tend", "browse"].some((act) => seen.has(act)),
    `others rest or browse (${[...seen.keys()]})`,
  );
  run(300, 23);
  assert.equal(crowd.present(world).length, 0, "at night everyone leaves their spot for home");
  assert.equal(world.spots.filter((spot) => spot.taken).length, 0, "and no spot is left held");
  world.dispose();
}

// ── Friends go out together ──────────────────────────────────────────────────
{
  const town = createWorld(4242);
  const camps = town.spots.filter((spot) => spot.role === "camp");
  assert.ok(camps.length >= 5, `there's a campsite outside town (${camps.length} places round fires)`);
  for (const spot of camps) {
    assert.ok(
      Math.max(Math.abs(spot.x), Math.abs(spot.z)) > town.layout.townHalf,
      "campsites are outside the settlement",
    );
    assert.ok(!town.blocked(spot.x, spot.z, 0.2), "a place by the fire is clear");
  }
  const crowd = createCrowd();
  crowd.setDressed(false);
  crowd.setWorld(town);
  crowd.setCast(Array.from({ length: 12 }, (_, i) => ({ id: `f-${i}`, name: `Friend ${i}` })));
  crowd.setRelations(() => ({ kind: "friend", level: 80, warmth: 0.8 })); // everyone's fond of everyone
  const player = { x: 0, y: 0, z: 400 };
  let time = 0;
  const outings = new Set(); // sizes of company seen
  const where = new Set();
  for (const hour of [10, 13, 17, 19]) {
    for (let elapsed = 0; elapsed < 600; elapsed += 0.1) {
      time += 0.1;
      crowd.update(0.1, {
        player,
        space: town,
        playerSitting: false,
        hour,
        time,
        isVisible: () => false,
        onFootstep() {},
      });
      town.update(0.1);
      if (Math.round(time * 10) % 30) continue;
      const all = crowd.snapshot();
      for (const person of all) {
        if (!person.company.length) continue;
        outings.add(person.company.length + 1);
        assert.ok(!person.company.includes(person.id), "someone's company is the others");
        for (const id of person.company) {
          assert.ok(all.find((other) => other.id === id).company.includes(person.id), "company goes both ways");
        }
        if (person.doing === "ground" || person.doing === "drink") where.add("camp");
        if (person.state === "inside") where.add("indoors");
      }
    }
  }
  assert.ok(outings.size > 0, "friends go out together");
  assert.ok(
    [...outings].every((size) => size >= 2 && size <= 4),
    `in twos to fours (${[...outings]})`,
  );
  assert.ok(where.has("indoors"), `to the tavern or a house (${[...where]})`);
  for (let elapsed = 0; elapsed < 400; elapsed += 0.1) {
    time += 0.1;
    crowd.update(0.1, {
      player,
      space: town,
      playerSitting: false,
      hour: 23,
      time,
      isVisible: () => false,
      onFootstep() {},
    });
  }
  assert.equal(crowd.present(town).length, 0, "and home at night, from the fire too");
  // Campsites: seats on the logs, a bedroll in the tent, and the way in clear.
  assert.ok(town.camps.length >= 1 && town.camps.length <= 2, "a campsite or two");
  for (const camp of town.camps) {
    const logSeats = town.seats.filter((seat) => Math.hypot(seat.x - camp.x, seat.z - camp.z) < 3.5);
    assert.equal(logSeats.length, 4, "two seats on each of the two logs");
    for (const seat of logSeats) {
      assert.ok(!town.blocked(seat.approach.x, seat.approach.z, 0.1), "you can stand in front of a log seat");
      assert.ok(
        Math.hypot(seat.x - camp.mouth.x, seat.z - camp.mouth.z) > 1.6,
        "the logs are clear of the tent's mouth",
      );
    }
    assert.ok(
      Math.hypot(camp.bed.x - camp.x, camp.bed.z - camp.z) > 2.5,
      "the bedroll is in the tent, back from the fire",
    );
    assert.ok(
      town.spots.some((spot) => spot.act === "lie" && spot.camp === camp.id),
      "anyone can nap in the tent",
    );
  }
  // The player sleeps: everyone far off is where the hour has them; the party and whoever is near stay.
  for (let elapsed = 0; elapsed < 200; elapsed += 0.1) {
    time += 0.1;
    crowd.update(0.1, {
      player,
      space: town,
      playerSitting: false,
      hour: 12,
      time,
      isVisible: () => false,
      onFootstep() {},
    });
  }
  const out = crowd.present(town);
  assert.ok(out.length >= 6, "by midday they're out again");
  const [stays, follows] = [out[0], out[1]];
  crowd.setFollowing(follows.id, true);
  crowd.resettle(23, { x: stays.position.x, z: stays.position.z }, 1);
  const after = crowd.present(town).map((person) => person.id);
  assert.ok(after.includes(stays.id), "someone close by stays where they are");
  assert.ok(after.includes(follows.id), "and so does the party");
  assert.ok(after.length <= 3, `the rest are home for the night (${after.length} still out)`);
  crowd.resettle(12, { x: 0, z: 9999 }, 1);
  assert.ok(crowd.present(town).length >= 10, "and at midday they're out at their doors");
  town.dispose();
}

// ── The clips ────────────────────────────────────────────────────────────────
{
  const step = createClipPlayer({ present: () => true, offset: () => new Vector3(0, -0.42, 0), legLength: 0.85 });
  const settle = (seconds, options) => {
    let pose = null;
    for (let t = 0; t < seconds; t += 1 / 30) pose = step(1 / 30, 0, options);
    return pose;
  };
  const standing = settle(1, {}).hips[1];
  assert.ok(Math.abs(standing) < 0.12, "standing, the hips are about where they rest");
  for (const act of ACT_NAMES) {
    const pose = settle(3, { act });
    assert.ok(
      pose.hips.every(Number.isFinite) && [...pose.locals.values()].every((turn) => Number.isFinite(turn.w)),
      `${act} poses the body`,
    );
    if (act === "ground" || act === "lie") assert.ok(pose.hips[1] < -0.55, `${act} is down on the ground`);
    const up = settle(LIE_SECONDS + 1, {});
    assert.ok(Math.abs(up.hips[1] - standing) < 0.08, `back on their feet after ${act}`);
  }
  assert.ok(Number.isFinite(settle(0.5, { air: true }).hips[1]), "in the air");
  assert.ok(Number.isFinite(settle(0.3, {}).hips[1]), "and landed");
  settle(1, {});
  const reach = step(1 / 30, 0, { gesture: "interact" });
  assert.ok(reach.locals.size > 10);
  assert.ok(Math.abs(settle(1, { act: "no-such-act" }).hips[1] - standing) < 0.05, "an unknown act is no act");
}

console.log("wanderworld life regression: OK");
