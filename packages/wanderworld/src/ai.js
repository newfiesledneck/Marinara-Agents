// Talking to Wanderworld's server part (server.mjs) at /api/wanderworld: whether it's running, the user's
// connections, conversation replies, pictures, and scenes (their context for the Engine's planner, and
// the recaps that come back). Every call can fail (an Engine without the server part yet, no connection,
// a model error); callers fall back to what the client does on its own.

const OWN = "/api/wanderworld";
const UNSAFE = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// ponytail: package routes sit behind the Engine's privileged gate, so a session on another device needs
// the admin secret the Engine's own client keeps under this key (loopback is exempt). Same approach as
// Quartermaster, Memory Nag and Relationship Tracker; replace with a host-provided fetch if one appears.
function adminSecret() {
  try {
    return globalThis.localStorage?.getItem("marinara_admin_secret")?.trim() || "";
  } catch {
    return "";
  }
}

/**
 * Whether the Engine's Debug Mode is on (Settings → Advanced → Message Tools). ponytail: read from the
 * Engine client's own saved settings, as Quartermaster does, since a Home tab isn't handed it; if the
 * Engine renames that key this is simply off. Read at each request: it can be switched while playing.
 */
/**
 * The Engine's built-in picture styles (its shared/src/constants/image-style-profiles.ts): what each
 * looks like in words, its tags, and what it keeps out. Auto and Off add no words of their own.
 * ponytail: a copy, since the Engine has no route that returns them; a style the Engine adds later is
 * read from the player's own saved profiles (below) or adds nothing.
 */
const STYLES = {
  off: ["", "", ""],
  auto: ["", "", "text, watermark, logo, signature, low quality, blurry"],
  anime: [
    "Anime illustration with clean character design, expressive faces, crisp linework, and polished lighting",
    "anime style, illustration, best quality, detailed eyes, clean lineart",
    "photorealistic, 3d render, lowres, bad anatomy, bad hands, text, watermark, logo, signature",
  ],
  danbooru: [
    "",
    "masterpiece, best quality, absurdres, anime screencap, detailed eyes",
    "worst quality, low quality, lowres, bad anatomy, bad hands, extra digits, fewer digits, text, watermark, logo, signature",
  ],
  realistic: [
    "Realistic image with natural lighting, believable materials, lens-aware composition, and sharp detail",
    "high quality, realistic, detailed, natural lighting",
    "anime, cartoon, illustration, low quality, blurry, plastic skin, text, watermark, logo, signature",
  ],
  photorealistic: [
    "Photorealistic image with believable skin, optics, materials, camera framing, and natural scene lighting",
    "photorealistic, high quality, sharp focus, natural lighting, detailed textures",
    "anime, cartoon, illustration, painting, plastic skin, uncanny face, low quality, blurry, text, watermark, logo, signature",
  ],
  cinematic: [
    "Cinematic key art with controlled lighting, strong composition, atmospheric depth, and emotionally clear staging",
    "cinematic lighting, dramatic composition, atmospheric, high detail",
    "flat lighting, cluttered composition, text, watermark, logo, signature, low quality",
  ],
  "digital-painting": [
    "Digital painting with refined brushwork, designed lighting, strong silhouettes, and polished detail",
    "digital painting, concept art, refined brushwork, high detail, designed lighting",
    "photograph, raw photo, muddy details, flat lighting, text, watermark, logo, signature, low quality",
  ],
  painterly: [
    "Painterly fantasy illustration with soft brushwork, rich atmosphere, and storybook color harmony",
    "painterly, fantasy illustration, soft brushwork, rich atmosphere, high detail",
    "photorealistic, flat colors, muddy details, text, watermark, logo, signature, low quality",
  ],
  "z-image-turbo": ["", "", "text, watermark, logo, signature, low quality, blurry, malformed hands, distorted face"],
};

/**
 * The words of picture style `id` (Settings → AI → Pictures; "" is the player's default profile in the
 * Engine): { words (for the prompt), negative (what to keep out) }. Wanderworld sends the Engine a
 * finished prompt, and the Engine adds no style to one, so the style has to be in the words. A profile
 * the player made or changed is read from the Engine client's saved settings, as Debug Mode is.
 */
export function styleWords(id) {
  let kept;
  try {
    kept = JSON.parse(globalThis.localStorage?.getItem("marinara-engine-ui") ?? "null")?.state?.imageStyleProfiles;
  } catch {
    // unreadable: the built-in ones still work
  }
  const wanted = id || (typeof kept?.defaultProfileId === "string" ? kept.defaultProfileId : "") || "auto";
  const own = (Array.isArray(kept?.profiles) ? kept.profiles : []).find((profile) => profile?.id === wanted);
  const clip = (value, most) => (typeof value === "string" ? value.trim().slice(0, most) : "");
  // (Auto's own text is an instruction to the Engine's prompt builder, not a look: it adds nothing.)
  const [look, tags, negative] =
    own && wanted !== "auto" && wanted !== "off"
      ? [clip(own.styleText, 500), clip(own.positiveTags, 300), clip(own.negativeTags, 500)]
      : (STYLES[wanted] ?? ["", "", ""]);
  return { words: [look.replace(/[.\s]+$/u, ""), tags].filter(Boolean).join(". "), negative };
}

export function debugMode() {
  try {
    return JSON.parse(globalThis.localStorage?.getItem("marinara-engine-ui") ?? "null")?.state?.debugMode === true;
  } catch {
    return false;
  }
}

/** Why a request failed, in words the player can act on. */
function failure(response, body) {
  const message = body && typeof body.error === "string" ? body.error : "";
  if (response.status === 403 && /admin.secret/iu.test(message)) {
    return "The Engine blocked Wanderworld on this device: enter the Engine's Admin Secret in Settings → Advanced → Admin Access.";
  }
  if (response.status === 404 && !message)
    return "Wanderworld isn't fully loaded yet: restart the Engine (needed once after installing or updating Wanderworld).";
  return message || `Request failed (${response.status})`;
}

/** One request to the server part, or with `base` to another package's routes (inventory.js: Quartermaster's). */
export async function request(path, { method = "GET", body, timeout = 120000, base = OWN } = {}) {
  const headers = {};
  if (UNSAFE.has(method)) headers["x-marinara-csrf"] = "1";
  const secret = adminSecret();
  if (secret) headers["X-Admin-Secret"] = secret;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(`${base}${path}`, {
      method,
      headers,
      credentials: "same-origin",
      // Every request says whether Debug Mode is on, so the server part can show what it sends a model.
      body: body === undefined ? undefined : JSON.stringify(base === OWN ? { ...body, debugMode: debugMode() } : body),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw Object.assign(new Error(failure(response, data)), { status: response.status });
    return data;
  } catch (error) {
    if (error?.name === "AbortError") throw new Error("The request took too long.", { cause: error });
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/** Saved worlds as the server part keeps them, for store.js: every key's text, one put, one removed. */
export const savesRemote = {
  all: () => request("/saves", { timeout: 20000 }).then((body) => body?.keys ?? {}),
  put: (key, value) => request("/save", { method: "POST", body: { key, value }, timeout: 60000 }),
  remove: (key) => request(`/save/${encodeURIComponent(key)}`, { method: "DELETE", timeout: 20000 }),
};

/** The server part, as one object. `status()` is remembered once it has answered. */
export function createAi(locals = () => []) {
  let status = null;
  let checking = null;
  return {
    /** { server, scenes, images, talk }, or null when the server part isn't there (yet). */
    async status(again = false) {
      if (status && !again) return status;
      checking ??= request("/status", { timeout: 8000 })
        .then((value) => (status = value))
        .catch(() => (status = null))
        .finally(() => (checking = null));
      return checking;
    },
    /** What `status()` found last (null until it has answered). */
    known: () => status,
    connections: () => request("/connections", { timeout: 15000 }),
    /** A character's reply: { reply }. */
    talk: (payload) => request("/talk", { method: "POST", body: { ...payload, locals: locals() } }),
    /** A picture: { image } (a data URL). */
    image: (payload) => request("/image", { method: "POST", body: payload, timeout: 300000 }),
    /** Keeps a scene's context for the Engine's planner. */
    sceneOrigin: (originId, context) => request("/scene-origin", { method: "POST", body: { originId, context } }),
    /** Recaps of this world's scenes that have ended: [{ id, summary, kind, characterIds, data, at }]. */
    sceneResults: (worldId) =>
      request(`/scene-results/${encodeURIComponent(worldId)}`).then((body) => body?.results ?? []),
    /** A moment: { narration, replies: [{ id, text }], plans: [{ id, entry }] }. */
    moment: (payload) => request("/moment", { method: "POST", body: { ...payload, locals: locals() } }),
    /** A scene's plan for the Engine (skipping its dialog): { plan, initiatorId }. */
    scenePlan: (payload) => request("/scene-plan", { method: "POST", body: payload }),
    /** Creates the planned scene in the Engine, with the chosen preset: { chatId }. */
    sceneStart: (payload) => request("/scene-start", { method: "POST", body: payload }),
    /** Someone's day from the model: { entries }. */
    plan: (payload) => request("/plan", { method: "POST", body: { ...payload, locals: locals() } }),
    /** A batch of lorebook entries read for a world's setup: { keys: [[keywords] per entry], names: { place: name } }. */
    loreSetup: (payload) => request("/lore-setup", { method: "POST", body: payload, timeout: 240000 }),
    /** What people look like, from their cards: { [id]: words }. */
    looks: (wanted) =>
      request("/looks", { method: "POST", body: { ids: wanted, locals: locals() } }).then((body) => body?.looks ?? {}),
    /** A world written for itself, a step at a time: { premise, places } or { people } (server.mjs `/world-write`). */
    worldWrite: (payload) => request("/world-write", { method: "POST", body: payload, timeout: 240000 }),
    /** One turn with the AI assistant: { reply, edits (checked, for the world), problem } (server.mjs `/assistant`). */
    assistant: (payload) => request("/assistant", { method: "POST", body: payload, timeout: 240000 }),
    /** Illustrates the moment from the user's template: { id, image, prompt, caption, at }; kept in the gallery. */
    illustrate: (payload) =>
      request("/illustrate", { method: "POST", body: { ...payload, locals: locals() }, timeout: 300000 }),
    /** The world's gallery, newest first, without the pictures themselves: [{ id, caption, prompt, at }]. */
    pictures: (worldId) => request(`/pictures/${encodeURIComponent(worldId)}`).then((body) => body?.pictures ?? []),
    /** One picture: { id, image, caption, prompt, at }. */
    picture: (id) => request(`/picture/${encodeURIComponent(id)}`),
    forgetPicture: (id) => request(`/picture/${encodeURIComponent(id)}`, { method: "DELETE" }),
    /** Quartermaster's tracker, asked what changed in what was just told: { data } (its JSON, for its own route). */
    inventoryTrack: (payload) => request("/inventory-track", { method: "POST", body: payload }),
    /** Forgets a recap the client has kept. */
    forgetResult: (id) => request(`/scene-results/${encodeURIComponent(id)}`, { method: "DELETE" }),
  };
}
