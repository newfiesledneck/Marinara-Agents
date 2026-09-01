# Quartermaster

A per-chat RPG character sheet and inventory manager: equip slots, item locations, saved
outfits, and a self-managed floating dock (draggable, resizable, mobile-responsive) alongside a
native-styled tracker-panel accordion. Persona-only for now.

Requires **Marinara Engine 2.4.4+**, Roleplay mode only (`modeAllowlist: ["roleplay"]` — Game
Mode's Tracker Panel and roleplay-tracker toolbar are gated to Roleplay by the Engine itself,
confirmed against source, not just undocumented). Outfit portraits can be uploaded, but not yet
generated in-app — see Planned below — and cover artwork
(`artwork/agent-covers/quartermaster.png`) is still outstanding. Visual refinement to the UI is
still needed, it is not in its final state.

## What it does

- **Equip slots** — 16 slots (head, neck, eyes, ears, armor torso/legs, clothing torso/legs,
  underwear top/bottom, back, hands, weapon left/right hand, feet, belt), grouped into a
  portrait ring in the dock.
- **Item locations** — `bag` (carried), `equipped:<slot>`, or `stored:<name>` (a named stash).
- **Saved outfits** — snapshot the current equip state under a name, equip/unequip it later in
  one step.
- **Export/import** — download the current chat's items, outfits, and settings as a JSON file, or
  replace them by importing one back — ported from the original extension. Item/outfit ids are
  reissued on import rather than kept as-is, so importing into a chat that already has data (or
  importing the same file twice) never collides with what's already there.
- **Slot-group visibility toggles** — underwear (off by default, SFW), armor, and weapons
  (both on by default) can each be hidden — disabled, not just hidden — matching the original
  extension's `SLOT_GROUPS` convention.
- **Outfit portraits** — upload an image per saved outfit; the dock's portrait ring shows it
  instead of the persona's own avatar whenever that outfit is currently equipped. Stored as real
  files under the Engine's own shared `gallery/` directory (not inside this package's own data),
  resized/compressed in the browser before upload. An opt-in, default-off, per-chat setting
  ("Also replace persona's real avatar on equip") additionally pushes the active outfit's
  portrait to the persona's actual avatar via the Engine's own persona-update API, reverting
  automatically to whatever the avatar was before whenever the chat's equip state no longer
  matches an outfit with a portrait (unequipping, or equipping one without a portrait). Turning
  this on has two real costs worth knowing before you flip it: the Engine keeps a permanent
  version-history entry on every avatar change it makes this way, with no way to suppress it; and
  other Marinara screens that show the persona's avatar (chat header, persona picker) may take a
  little while to visually catch up — a known Engine-side caching behavior, unrelated to
  Quartermaster and outside its control. Image generation itself (e.g. Illustrator's "send avatar
  as reference") is unaffected either way, and this dock's own portrait display always updates
  immediately regardless of the toggle.
- **Appearance macro** — writes the current outfit/equipped-items text into
  `chatMeta.macroVariables` per chat, so a `{{getvar::quartermaster_appearance_persona}}` token
  in the persona's appearance field resolves for Roleplay's Illustrator image generation.
- **Narrator prompt context** — `registerPromptContext` contributes a curated, read-only summary
  of what's equipped/carried/stored (`provides: {inventory: true}` suppresses the Engine's own
  built-in `[inventory:]` block). Gated on the Quartermaster agent being currently enabled for the
  chat (`chatMeta.enableAgents`/`activeAgentIds` — the same signal every built-in tracker uses to
  decide it's active), so disabling the agent stops this feed the same turn instead of continuing
  to report stale state.
- **Quartermaster agent** (`phase: post_processing`) — reads each turn's narration and returns a
  full-snapshot JSON description of the persona's current items/equip state, reconciled into
  the same store the dock UI reads and writes, through the `agent-runtime` capability's
  `finalizeResult` hook. Full-snapshot semantics match the established convention in this
  catalog (Inventory Tracker, Character Tracker, World State): an item not re-listed on a turn
  is treated as gone.

## Planned

- **Party / multi-character support** — persona-only for now, but `ownerId` is threaded through
  every function in `server.mjs` as a real parameter rather than assumed, so extending past the
  persona is a later addition, not a rewrite.
- **In-app portrait/item image generation** — outfit portraits are upload-only today; generating
  one via a configured image-gen connection (the way the original extension's
  `/characters/avatar-generation` flow worked) is later work, pending confirmation of how a
  capability package can reach image generation at all.
- **A pre-made item/portrait asset pack** — a large, curated image library (matching the
  original extension's own, ~4,500 images) distributed and stored separately from a chat's own
  uploads — likely via the Engine's `game-assets/` system. Distribution mechanism (bundled,
  separate download, in-app fetch) not yet decided.

Quality-of-life features from the original extension not covered above are intentionally out of
scope for now — the focus here is the inventory/outfit/appearance core, not full parity.

## Layout

```text
packages/quartermaster/
├── src/                # plain-JS client modules, concatenated in filename order into client.js
├── server.mjs           # hand-authored — do not generate; hashed as-is by the build script
├── agents.json           # hand-authored — carries the tracker agent's real prompt template
├── client.js             # generated — do not edit
├── manifest.json         # generated — do not edit
└── locales/en.json       # generated — do not edit
```

## Rebuilding

```sh
node scripts/build-quartermaster-package.mjs
```

Regenerates `client.js` (concatenated from `src/*.js`), stamps `manifest.json`/`locales/en.json`
from `manifest.json`'s and `agents.json`'s source strings, hashes `server.mjs`/`agents.json` as
committed, and writes the reproducible `artifacts/quartermaster-<version>.zip` plus the catalog
lanes. `INCOMPLETE_PACKAGE_IDS` (`scripts/catalog-incomplete.mjs`) keeps this package out of
every published catalog until it's ready for testers.

## Changelog

### 0.1.1

UI refinement pass: dropdown popups now match the Engine's actual theme instead of always
rendering light; the portrait ring no longer visibly shifts when the underwear toggle adds a
third sub-column on the left; every button has real hover/press/focus feedback; border-radius is
consistent across the whole dock instead of only the portrait frame following the theme variable;
the dock body has a themed scrollbar; the Settings section animates open/closed instead of
snapping; and clicking outside the open dock now closes it, matching other Marinara menus and the
original extension.

### 0.1.0

Initial capability-package port of the original "RPG Inventory" extension: equip slots arranged
in a portrait ring, item locations, saved outfits, export/import, the appearance macro, the
narrator prompt-context feed, and the `post_processing` tracker agent.
