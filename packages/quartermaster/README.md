# Quartermaster

A per-chat RPG character sheet and inventory manager: equip slots, item locations, saved
outfits, and a self-managed floating dock (draggable, resizable, mobile-responsive) alongside a
native-styled tracker-panel accordion. Persona-only for now.

Requires **Marinara Engine 2.4.4+**, Roleplay mode only (`modeAllowlist: ["roleplay"]` — Game
Mode's Tracker Panel and roleplay-tracker toolbar are gated to Roleplay by the Engine itself,
confirmed against source, not just undocumented). Outfit portraits can be uploaded, but not yet
generated in-app — see Planned below — and cover artwork
(`artwork/agent-covers/quartermaster.png`) is still outstanding. The dock has had a full visual
pass (portrait frame, equip-slot artwork, card/modal redesigns — see the 0.1.2 changelog entry
below), but it's still an evolving personal project, not yet proposed to the maintainers again —
expect further refinement as real use turns up rough edges.

## What it does

- **Equip slots** — 16 slots (head, neck, eyes, ears, armor torso/legs, clothing torso/legs,
  underwear top/bottom, back, hands, weapon left/right hand, feet, belt), grouped into a
  portrait ring in the dock. The equipped item's own image (or the slot's fallback pictogram)
  fills the whole slot box; the slot name and item name/"Empty" are overlay bands top and bottom,
  each with their own small translucent backing rather than one dimming layer across the box, so
  the image itself stays fully visible in the gap between the two bands.
- **Item locations** — `bag` (carried), `equipped:<slot>`, or `stored:<name>` (a named stash).
- **Saved outfits** — snapshot the current equip state under a name, equip/unequip it later in
  one step. "Save Current Outfit" sits in the Equipped column, beside "Unequip All" — both act on
  the current equip state, so both live next to it — and opens a small modal for the name,
  description, and (optionally) a portrait, rather than an always-visible inline form. Outfit
  cards are read-only summaries (image, name, description preview) with Edit, Update, and Equip
  buttons; the description fills the card from the name down to the bottom (at least 5 lines,
  more if the portrait's thumbnail size gives it the room) and scrolls instead of clipping for
  anything longer. Edit opens a modal for the name/description/portrait, Update resnapshots the
  outfit from whatever's currently equipped right from the card (it acts on live equip state, not
  a stored field, so it doesn't hide behind the editor like the others do); the currently-equipped
  outfit gets a success-colored border instead of the theme accent so it's clearly distinct from
  the rest. A search box (name only — outfits have no "slot" dimension the way items do) sits
  between the Outfits header and the list.
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
  ("Replace persona's real avatar on equip") additionally pushes the active outfit's
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
- **Item images** — matched by name, not a stored per-item reference: any image file placed in
  `gallery/quartermaster/items/` (or a subfolder — searched recursively) whose filename matches an
  item's name is shown automatically, regardless of casing or whether the name uses spaces,
  hyphens, underscores, or nothing at all as separators ("White Sneakers" matches
  `white_sneakers.jpg`, `whitesneakers.png`, `White-Sneakers.gif`, ...). This is what lets a
  pre-made image pack "just work" by dropping its own folder structure straight into `items/` —
  no per-item setup needed for any of it. Uploading an image for an item (via the item card) saves
  it directly into `items/` itself (never a subfolder, so uploads can never overwrite anything
  from a hand-placed pack), named after the item so it's found the same way; removing an uploaded
  image only removes that upload — if a pack image also happens to match the item's name, it'll
  still show afterward. Renaming an item does **not** currently rename or move its own uploaded
  image file, so a rename can cause an uploaded image to stop matching; re-uploading fixes it.
- **Slot artwork** — every equip slot shows real generated artwork (a hat, gloves, a breastplate,
  a sword, ...) instead of a bare pictogram, bundled with the package itself (`icons/*.webp`) so
  every slot looks right immediately after install — no setup step, unlike item images above. Used
  both for an empty slot and as the fallback for an equipped item with no matching item image of
  its own. Falls back to the original hand-drawn SVG pictogram if a file is ever missing.
- **Portrait frame and connector lines** — the portrait sits in a theme-colored cut-corner frame
  with hand-drawn scrollwork corner ornaments, and thin curved lines connect each equip slot to
  the portrait, brightening when that slot is selected. Positions are measured live (not fixed
  coordinates), so they stay correct across a Thumbnail Size change, a window resize, or the
  portrait image itself finishing a load with a different aspect ratio than whatever was showing
  before.
- **Bag item cards** — a read-only summary (image, name, slot, description preview, stored
  location) with only quantity directly editable on the card; the description fills the card from
  the slot line down to the bottom (at least 3 lines, more if the portrait's thumbnail size gives
  it the room) and scrolls instead of clipping for anything longer. An Edit button opens a focused
  editor for name, description, stored location, and default slot, plus uploading an item image.
  Cards carry a simpler sibling of the portrait's own frame treatment (theme-colored border, soft
  glow, small corner accents) rather than the full cut-corner/scrollwork look.
- **Add Item form and Bag search** — the add-item form now sets default slot and stored location
  at creation time too (previously only settable after adding), styled with the same card
  technique as item cards but outlined in the Add button's own success color so it reads as the
  create-new form rather than one more item. Below it, a search box filters the Bag by name or
  slot (a toggle switches which), placed between the add form and the item list so the two stay
  visually separate. Clicking an equip slot box searches the Bag by that slot automatically — a
  navigational shortcut to "what could fill this," not just a highlight.
- **Collapsible, counted section headers** — the Outfits/Equipped/Bag headers are bordered and
  clickable, and collapsing one narrows that column itself to a slim strip (its header label turns
  sideways so it's still readable and clickable to re-expand) rather than just hiding its content
  inside a column that stays full width. The dock's own window shrinks by exactly the reclaimed
  amount — the other columns keep their own width rather than stretching to fill the freed space —
  so collapsing a column actually narrows the whole UI for anyone who wants a tighter footprint,
  and expanding it again hands back precisely the same amount, whether or not collapsing more than
  one column at once briefly pushes the layout narrower than the point where columns would
  otherwise stack vertically — the stack decision itself accounts for how many columns are
  currently just narrow strips, so collapsing two columns doesn't force an unwanted stack that a
  single collapse wouldn't have. State persists per browser, like Thumbnail Size and window
  geometry. On a window narrow enough that the columns stack vertically instead of sitting side by
  side, there's no width to reclaim from a column that already spans the whole (already-narrow)
  dock, so collapsing there just hides that column's content at full width instead. Outfits and
  Bag show a live count (e.g. "Outfits (5)") since those two are the columns whose size actually
  varies session to session.
- **Appearance macro** — writes the current outfit/equipped-items text into
  `chatMeta.macroVariables` per chat, so a `{{getvar::quartermaster_appearance_persona}}` token in
  the persona's appearance field resolves for Roleplay's Illustrator image generation. The picker
  for this (Off / Outfit description / Equipped item names), with a description of what each
  option does, lives in the Settings section rather than always on screen, alongside the other
  settings — each now visually separated by a thin rule.
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
- **Distributing a pre-made item image pack** — where the images themselves live and how
  they're matched by name is built (see Item images above); how a large, curated pack (matching
  the original extension's own, ~4,500 images) actually gets onto a new user's machine — bundled,
  a separate download, an in-app fetch — is not yet decided.

Quality-of-life features from the original extension not covered above are intentionally out of
scope for now — the focus here is the inventory/outfit/appearance core, not full parity.

## Layout

```text
packages/quartermaster/
├── src/                # plain-JS client modules, concatenated in filename order into client.js
├── icons/                # bundled slot artwork (WebP) — hand-picked binary assets, hashed as-is
├── server.mjs           # hand-authored — do not generate; hashed as-is by the build script
├── agents.json           # hand-authored — carries the tracker agent's real prompt template
├── client.js             # generated — do not edit; review src/*.js instead
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

### 0.1.2

Large visual/UX build-out, all manually tested against a live Engine install before landing:

- **Portrait frame and connector lines** (new) — the cut-corner frame with hand-drawn scrollwork
  corner ornaments, and the equip-slot-to-portrait connector lines, both described under
  "Portrait frame and connector lines" above; includes fixes for a Thumbnail-Size border mismatch,
  a UI-Size-zoom coordinate bug, and a left/right mirror-symmetry bug in the connector curves.
- **Bundled slot artwork** (new) — real generated art per equip slot (`icons/*.webp`), replacing
  the bare pictogram fallback everywhere it's used (an empty slot, or an equipped item with no
  matching item image); falls back to the original SVG if a file is ever missing.
- **Item cards redesigned** — image, name, slot, description; only quantity stays directly
  editable, everything else (name/description/stored location/default slot/image) moved into a
  focused Edit modal. The Add Item form now sets default slot and stored location at creation
  time too, and a new Bag search (by name or slot) sits between the form and the list — clicking
  an equip slot box searches the Bag by that slot automatically.
- **Equip slots redesigned** — the equipped item's own image (or the slot's fallback artwork) now
  fills the whole slot box, with the slot name and item name/"Empty" as translucent overlay bands
  top and bottom instead of a small centered icon.
- **Outfits section overhaul** — "Save Current Outfit" and "Unequip All" moved into the Equipped
  column; saving opens a small modal (name, description, portrait) instead of an always-visible
  form; outfit cards were redesigned to match item cards (image, name, description, Edit/Update/
  Equip), with "Update" (resnapshot from what's currently equipped) living directly on the card;
  the currently-equipped outfit gets a success-colored border instead of the theme accent; a
  search box was added, matching the Bag's.
- **Item/outfit description previews now fill the card and scroll** — previously a small fixed
  2-line box regardless of how much room the card actually had. The card's size is driven by its
  Edit/Update/Equip (or Edit/Equip) button stack — measured live after each render, not a guessed
  constant, so it can't drift out of sync with real rendering the way three earlier attempts at a
  hand-computed pixel height each did (caught live: buttons overflowing, then the portrait
  overflowing, then long descriptions visibly growing the card past what the buttons need) — and
  the description fills and scrolls within exactly that space, never expanding the card further.
- **Collapsible, counted section headers** (new) — see "Collapsible, counted section headers"
  above; collapsing a column genuinely narrows the dock's own window instead of just hiding
  content inside a column that stays full width, with a threshold fix so collapsing more than one
  column doesn't trip an unwanted stack-to-vertical fallback.
- **Settings reorganized** — "Feed appearance" moved into the Settings section (next to the other
  settings, with a real description of what each option does); each setting is now visually
  separated by a thin rule; the real-avatar toggle's label dropped a stray "Also".
- **Delete confirmation** — deleting an item or outfit now asks first; there was previously no
  undo and no confirmation.
- **Escape closes the open modal** (item editor, outfit editor, save-outfit) — previously only a
  backdrop click or the "×" button did.
- **Dropped a build-time minification step (and its `esbuild` dependency) added earlier in this
  same release** — it was a reaction to a live "Outbound response exceeded 199790 bytes" install
  error, but that number doesn't match any real cap in the Engine's own source, and other real,
  currently-catalogued packages (Slurp, Noodle) ship 5MB+ artifacts through the identical
  install-fetch path. Confirmed empirically: a fresh install of this package's un-minified,
  ~300KB artifact — larger than the one that originally failed — installed and restarted cleanly.
  `client.js` is plain concatenated source again; the artifact is larger, but nothing in this
  package's own install path needed the smaller size after all.

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
