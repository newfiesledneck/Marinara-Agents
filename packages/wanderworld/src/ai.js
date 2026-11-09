// Talking to Wanderworld's server part (server.mjs) at /api/wanderworld: whether it's running, the user's
// connections, conversation replies, pictures, and scenes (their context for the Engine's planner, and
// the recaps that come back). Every call can fail (an Engine without the server part yet, no connection,
// a model error); callers fall back to what the client does on its own.

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

/** Why a request failed, in words the player can act on. */
function failure(response, body) {
  const message = body && typeof body.error === "string" ? body.error : "";
  if (response.status === 403 && /admin.secret/iu.test(message)) {
    return "The Engine blocked Wanderworld on this device: enter the Engine's Admin Secret in Settings → Advanced → Admin Access.";
  }
  if (response.status === 404 && !message) return "Wanderworld's server part isn't running: restart the Engine.";
  return message || `Request failed (${response.status})`;
}

async function request(path, { method = "GET", body, timeout = 120000 } = {}) {
  const headers = {};
  if (UNSAFE.has(method)) headers["x-marinara-csrf"] = "1";
  const secret = adminSecret();
  if (secret) headers["X-Admin-Secret"] = secret;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(`/api/wanderworld${path}`, {
      method,
      headers,
      credentials: "same-origin",
      body: body === undefined ? undefined : JSON.stringify(body),
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
    /** A world written for itself, a step at a time: { premise, places } or { people } (server.mjs `/world-write`). */
    worldWrite: (payload) => request("/world-write", { method: "POST", body: payload, timeout: 240000 }),
    /** Illustrates the moment from the user's template: { id, image, prompt, caption, at }; kept in the gallery. */
    illustrate: (payload) =>
      request("/illustrate", { method: "POST", body: { ...payload, locals: locals() }, timeout: 300000 }),
    /** The world's gallery, newest first, without the pictures themselves: [{ id, caption, prompt, at }]. */
    pictures: (worldId) => request(`/pictures/${encodeURIComponent(worldId)}`).then((body) => body?.pictures ?? []),
    /** One picture: { id, image, caption, prompt, at }. */
    picture: (id) => request(`/picture/${encodeURIComponent(id)}`),
    forgetPicture: (id) => request(`/picture/${encodeURIComponent(id)}`, { method: "DELETE" }),
    /** Forgets a recap the client has kept. */
    forgetResult: (id) => request(`/scene-results/${encodeURIComponent(id)}`, { method: "DELETE" }),
  };
}
