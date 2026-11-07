// Reads the chat's World Maps state, read-only for M0. Returns the current location's name,
// or null when World Maps is not installed, not enabled for this chat, or the request failed.
// Never retries on its own: the next turn or host event asks again.

/** Same-origin GET; the Engine's session cookie rides along. 404 means World Maps is not installed. */
async function getSpatial(chatId) {
  const response = await fetch(`/api/chats/${encodeURIComponent(chatId)}/spatial-context`, {
    headers: { Accept: "application/json" },
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`GET spatial-context → ${response.status}`);
  return response.json();
}

export function locationName(data) {
  if (!data?.definition || !data.currentLocationId) return null;
  const breadcrumb = Array.isArray(data.breadcrumb) ? data.breadcrumb : [];
  const last = breadcrumb[breadcrumb.length - 1];
  if (typeof last?.name === "string") return last.name;
  const locations = Array.isArray(data.definition.locations) ? data.definition.locations : [];
  const current = locations.find((location) => location?.id === data.currentLocationId);
  return typeof current?.name === "string" ? current.name : null;
}

export function createSpatial(onChange) {
  let sequence = 0;
  return {
    /** Only the latest-started request may report, so a slow reply can't overwrite a newer one. */
    async refresh(chatId) {
      const mine = ++sequence;
      let name = null;
      try {
        name = locationName(await getSpatial(chatId));
      } catch (error) {
        console.warn("[wanderworld] spatial refresh failed", error);
      }
      if (mine === sequence) onChange(chatId, name);
    },
    reset() {
      sequence++;
    },
  };
}
