// Quartermaster — client-side fetch helpers for the package's own privileged
// routes (server.mjs). QM is the shared namespace concatenated files use to
// talk to each other, the way Beholder's src/*.js share BH.

const QM = {};

async function qmRequest(path, options) {
  // Only set Content-Type when there's actually a JSON body — Fastify's body
  // parser rejects a bodyless request (GET/DELETE) that still declares
  // application/json with "Body cannot be empty when content-type is set to
  // 'application/json'".
  const headers = options && options.body ? { "Content-Type": "application/json" } : {};
  const response = await fetch(`/api/quartermaster${path}`, { ...options, headers });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error((body && body.error) || `Request failed (${response.status})`);
  }
  return body;
}

QM.listItems = (chatId, ownerId) =>
  qmRequest(`/inventory/${encodeURIComponent(chatId)}/${encodeURIComponent(ownerId)}`, { method: "GET" });

QM.addItem = (chatId, ownerId, item) =>
  qmRequest(`/inventory/${encodeURIComponent(chatId)}/${encodeURIComponent(ownerId)}/items`, {
    method: "POST",
    body: JSON.stringify(item),
  });

QM.updateItem = (chatId, ownerId, itemId, patch) =>
  qmRequest(
    `/inventory/${encodeURIComponent(chatId)}/${encodeURIComponent(ownerId)}/items/${encodeURIComponent(itemId)}`,
    { method: "PATCH", body: JSON.stringify(patch) },
  );

QM.deleteItem = (chatId, ownerId, itemId) =>
  qmRequest(
    `/inventory/${encodeURIComponent(chatId)}/${encodeURIComponent(ownerId)}/items/${encodeURIComponent(itemId)}`,
    { method: "DELETE" },
  );

QM.createOutfit = (chatId, ownerId, outfit) =>
  qmRequest(`/inventory/${encodeURIComponent(chatId)}/${encodeURIComponent(ownerId)}/outfits`, {
    method: "POST",
    body: JSON.stringify(outfit),
  });

QM.updateOutfit = (chatId, ownerId, outfitId, patch) =>
  qmRequest(
    `/inventory/${encodeURIComponent(chatId)}/${encodeURIComponent(ownerId)}/outfits/${encodeURIComponent(outfitId)}`,
    { method: "PATCH", body: JSON.stringify(patch) },
  );

QM.equipOutfit = (chatId, ownerId, outfitId) =>
  qmRequest(
    `/inventory/${encodeURIComponent(chatId)}/${encodeURIComponent(ownerId)}/outfits/${encodeURIComponent(outfitId)}/equip`,
    { method: "POST", body: "{}" },
  );

QM.deleteOutfit = (chatId, ownerId, outfitId) =>
  qmRequest(
    `/inventory/${encodeURIComponent(chatId)}/${encodeURIComponent(ownerId)}/outfits/${encodeURIComponent(outfitId)}`,
    { method: "DELETE" },
  );

QM.updateSettings = (chatId, ownerId, settings) =>
  qmRequest(`/inventory/${encodeURIComponent(chatId)}/${encodeURIComponent(ownerId)}/settings`, {
    method: "PATCH",
    body: JSON.stringify(settings),
  });

QM.unequipAll = (chatId, ownerId) =>
  qmRequest(`/inventory/${encodeURIComponent(chatId)}/${encodeURIComponent(ownerId)}/unequip-all`, {
    method: "POST",
    body: "{}",
  });

QM.uploadItemImage = (chatId, ownerId, itemId, imageDataUrl) =>
  qmRequest(`/inventory/${encodeURIComponent(chatId)}/${encodeURIComponent(ownerId)}/items/${encodeURIComponent(itemId)}/image`, {
    method: "POST",
    body: JSON.stringify({ imageDataUrl }),
  });

QM.deleteItemImage = (chatId, ownerId, itemId) =>
  qmRequest(`/inventory/${encodeURIComponent(chatId)}/${encodeURIComponent(ownerId)}/items/${encodeURIComponent(itemId)}/image`, {
    method: "DELETE",
  });

// Not a fetch — the <img src> URL. A 404 (no matching image, uploaded or
// pack) is handled by the caller's onerror, not here.
QM.itemImageUrl = (chatId, ownerId, itemId) =>
  `/api/quartermaster/inventory/${encodeURIComponent(chatId)}/${encodeURIComponent(ownerId)}/items/${encodeURIComponent(itemId)}/image`;

QM.uploadOutfitPortrait = (chatId, ownerId, outfitId, imageDataUrl) =>
  qmRequest(
    `/inventory/${encodeURIComponent(chatId)}/${encodeURIComponent(ownerId)}/outfits/${encodeURIComponent(outfitId)}/portrait`,
    { method: "POST", body: JSON.stringify({ imageDataUrl }) },
  );

QM.deleteOutfitPortrait = (chatId, ownerId, outfitId) =>
  qmRequest(
    `/inventory/${encodeURIComponent(chatId)}/${encodeURIComponent(ownerId)}/outfits/${encodeURIComponent(outfitId)}/portrait`,
    { method: "DELETE" },
  );

// Not a fetch — just the <img src> URL. Callers append a cache-buster (the
// filename change already busts the browser cache; this is only relevant if
// callers ever hit this before the state refetch lands, which none do today,
// so plain is fine) only if they need to force a reload of the SAME filename.
QM.outfitPortraitUrl = (chatId, ownerId, outfitId) =>
  `/api/quartermaster/inventory/${encodeURIComponent(chatId)}/${encodeURIComponent(ownerId)}/outfits/${encodeURIComponent(outfitId)}/portrait`;

QM.exportInventory = (chatId, ownerId) =>
  qmRequest(`/inventory/${encodeURIComponent(chatId)}/${encodeURIComponent(ownerId)}/export`, { method: "GET" });

QM.importInventory = (chatId, ownerId, payload) =>
  qmRequest(`/inventory/${encodeURIComponent(chatId)}/${encodeURIComponent(ownerId)}/import`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
