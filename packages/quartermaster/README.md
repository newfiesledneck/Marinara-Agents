# Quartermaster

A per-chat RPG character sheet and inventory manager for Roleplay mode: equip slots around your
persona's portrait, item locations (bag / stored / equipped), and saved outfits, in a
draggable/resizable floating dock plus a native Tracker Panel view.

**Requires Marinara Engine 2.4.4+.** Roleplay only (no Game Mode support yet), persona-only (no
party/NPC support yet). Actively evolving — a personal project, not yet an official catalog
package.

## Features

- **Equip slots** — 16 slots (head, neck, eyes, ears, armor & clothing torso/legs, underwear
  top/bottom, back, hands, both hands' weapon, feet, belt) arranged around the portrait. Each slot
  shows the equipped item's own image, or built-in generated artwork if it doesn't have one.
- **Bag** — add, edit, and remove items, each with a name, description, and quantity. Store an
  item in the bag, a named stash (`stored:<name>`), or a slot (`equipped:<slot>`); search the Bag
  by name or by slot. Split into three tabs — Items, Wearables (anything with a default slot
  set), and Stored (anything in a named stash) — so a busy chat's inventory stays easy to scan.
- **Item images** — give any item its own image: auto-matched by filename from a shared image
  folder (so a pre-made image pack just works by copying its folder in), upload one directly from
  the item's card, or generate one with AI (see Generate Image below).
- **Saved outfits** — snapshot the current equip state under a name, then re-equip, edit, or
  resnapshot it later in one click; delete ones you don't need. Search outfits by name, and the
  dock shows which one (if any) is currently equipped — it stays equipped as long as its own saved
  items are still worn, even if something extra (a picked-up item, an accessory) gets equipped
  alongside it; swapping out one of the outfit's own items is what actually unequips it.
- **Outfit portraits** — give a saved outfit its own portrait (uploaded or AI-generated), shown in
  the dock in place of the persona's avatar whenever that outfit is equipped. An opt-in setting can
  also push it to the persona's *real* Marinara avatar — see below for what that involves before
  turning it on.
- **Generate Image** — an AI-generated alternative to uploading, for both item images and outfit
  portraits: click Generate on an item/outfit's image, review (and optionally edit) the filled-in
  prompt, then generate. Uses whichever `image_generation` connection is picked in Settings →
  Image generation (defaults to the Engine's own default connection if none is picked); the two
  prompt templates there are editable too, pre-filled with sensible defaults to edit from rather
  than write from scratch.
- **Export / import** — back up or transfer a chat's items and outfits as a JSON file.
- **Slot-group toggles** — hide underwear (off by default), armor, or weapons slots entirely if
  a chat doesn't need them.
- **Appearance macro** — feeds the current outfit or equipped items into a per-chat variable, so
  Illustrator picks up what's actually equipped when generating images. Requires placing
  `{{getvar::quartermaster_appearance_persona}}` in the persona's own Appearance field once —
  Quartermaster keeps that variable's value up to date, but doesn't add the token for you.
- **Narrator context** — the narrator gets a live summary of what's equipped/carried/stored each
  turn, replacing the Engine's built-in inventory block.
- **Auto-tracking agent** — an optional agent reads each turn's narration and keeps equip state
  and inventory in sync automatically, no manual updates required.
- **Restore Inventory** — a safety net for a bad agent turn: the state from just before the last
  auto-tracking update is always one click away in Settings, in case a turn wipes or badly mangles
  the inventory and there's no export file to fall back on.
- **Build Wardrobe** — describe a style direction in plain text and get back a proposed set of new
  items and saved outfits to review before anything is added; outfits it builds can reuse your
  existing wearable items instead of always inventing new ones. No images at generation time — add
  those yourself afterward (upload or Generate Image), same as any manually-added item.
- **Dock display controls** — UI Size resizes the whole dock; Thumbnail Size resizes item/portrait
  images within it; either column (Outfits / Equipped / Bag) can be collapsed to a narrow strip to
  save space.

## Before enabling "replace persona's real avatar on equip"

Two things worth knowing: every change adds a permanent entry to the persona's version history
(no way to turn that off), and other screens showing that avatar (chat header, persona picker) can
take a moment to visually catch up — a Marinara caching quirk outside Quartermaster's control. The
dock's own portrait display always updates instantly either way; this setting only affects the
persona's *real* avatar elsewhere in Marinara.

## Planned

- **Party / multi-character support** — persona-only today; the storage layer is already built to
  extend to this without a rewrite.
- **A distributable item-image pack** — matching works today; a curated pack to ship isn't decided.
- **Game Mode support** — currently Roleplay-only; being investigated as a later step, after
  Roleplay mode is feature-complete.

## Contributing

```text
packages/quartermaster/
├── src/            # plain-JS client modules — edit these; concatenated into client.js
├── icons/          # bundled slot artwork (WebP)
├── server.mjs      # hand-authored server routes
├── agents.json     # hand-authored tracker-agent definition
├── client.js       # generated — do not edit
├── manifest.json   # generated — do not edit
└── locales/en.json # generated — do not edit
```

Rebuild after any change:

```sh
node scripts/build-quartermaster-package.mjs
```

This regenerates `client.js`/`manifest.json`/`locales/en.json`, hashes `server.mjs`/`agents.json`,
and writes `artifacts/quartermaster-<version>.zip`. `INCOMPLETE_PACKAGE_IDS`
(`scripts/catalog-incomplete.mjs`) keeps this package out of every published catalog until it's
ready for testers.

## Changelog

### 0.1.8

- Confirmed fix: the 0.1.7 persona-leak fix for Generate Image resolved the reported issue --
  item images no longer show a person.
- The Bag column now splits into three tabs (Items / Wearables / Stored) instead of one flat
  list, so a chat with a lot of stuff is easier to scan. Selecting an empty equip slot's
  quick-fill shortcut also jumps to the Wearables tab now, since only a wearable item can ever
  fill a slot that way.

### 0.1.7

- **Attempted fix** for Generate Image (added in 0.1.6): a real user reported item images coming
  back showing their persona instead of a clean product shot, even for things like a pair of
  slippers. Traced to the request sent to the Engine's own image-generation endpoint not matching
  the exact shape the legacy RPG Inventory extension's own proven-working code uses — it now does,
  field-for-field (a normalized name/slug and an `avatar:<slug>` override id, matching that
  extension exactly, dropping a guessed field set copied from a different package that didn't
  actually fix it). Marked "attempted" here because this is pending the reporting user's
  confirmation that it fully resolves it.
- The package's own build script now refuses to silently overwrite an already-released version's
  artifact file under the same filename if a rebuild ever runs before a version bump.

### 0.1.6

- Added Generate Image: an AI-generated alternative to uploading, for both item images and outfit
  portraits. Ported from the legacy RPG Inventory extension's own Generate/Upload menu, including
  its editable "review prompt" step before every generation.
- New Settings section (Image generation) picks which connection Quartermaster uses (a purely
  local preference — it never changes any Engine-wide default) and lets you edit the two prompt
  templates, pre-filled with the real default text so you edit from it rather than write a prompt
  from scratch.
- The default portrait prompt now specifies a casual pose.
- Fixed the portrait prompt leaking a raw, unresolved `{{getvar::quartermaster_appearance_persona}}`
  token into the image-generation request when the persona's Appearance field uses it — stripped
  out now instead.
- Export/import now carry the two prompt templates along with everything else (the image
  connection itself is deliberately excluded — it references a connection configured on your own
  Engine installation, not portable data).

### 0.1.5

- Fixed Build Wardrobe never producing debug-log output even with Debug Mode enabled: its request
  and raw response now log correctly, matching the tracker agent's own per-turn debug logging.
- Replaced the dock/tracker panel's 5-second inventory poll with the Engine's own
  generation-complete event, so it refreshes right after a turn actually finishes instead of on a
  fixed timer, cutting needless network traffic while nothing has changed.
- The Build Wardrobe prompt sent to the model now labels its sections explicitly (the style
  direction, the persona, the existing inventory) instead of leaving the direction unlabeled above
  two headed sections.

### 0.1.4

- Added Build Wardrobe: describe a style direction and get a proposed set of new items and
  outfits to review before adding them to inventory.
- Outfits it builds can reuse your existing wearable items instead of always creating new ones.
- Generation uses the tracker agent's own configured connection (Agents menu), so switching that
  there moves this too.
- Fixed non-wearable existing items (a phone, a wallet) sometimes turning up in a generated
  outfit.

### 0.1.3

- Fixed a serious bug where the tracker agent's inventory updates were silently discarded every
  turn: its `resultType` was misconfigured as a text-only result, so the model's JSON response
  never actually got parsed, and the full-snapshot reconcile wiped the inventory to empty each
  time.
- Outfits now stay "currently equipped" as long as their own saved items are still worn, even if
  something extra gets equipped alongside them — only swapping out one of the outfit's own items
  unequips it — and the appearance-macro description now lists that extra gear alongside the
  outfit's own text.
- Added a "Restore Inventory" button (Settings) that reverts to the state from just before the
  last agent update, a safety net for a bad turn with no export file to fall back on.
- Added a "Refresh Images" button (Settings) and a missing-image cache, so an item with no
  picture no longer re-triggers a failed image request (and console 404) on every repaint.
- Fixed the equip-slot fallback icon rendering on top of its own name/slot labels when an
  equipped item had no image.

### 0.1.2

- Added a decorated portrait frame with connector lines to each equip slot.
- Added bundled artwork for every equip slot.
- Redesigned item and outfit cards (image, name, description, focused Edit modal) to size
  themselves to their own content instead of clipping or growing unbounded.
- Equip slots now show the item's full image with overlay labels.
- Reworked the Outfits section (save via modal, live equip/edit/update from the card).
- Collapsible columns that actually narrow the dock instead of just hiding content.
- Added delete confirmations; Escape closes open modals; settings reorganized with descriptions.

### 0.1.1

- Theme-aware dropdowns.
- Fixed a portrait-ring shift with the underwear toggle.
- Real button hover/press states.
- Consistent border radius and scrollbar styling.
- Added an animated Settings section.
- Added click-outside-to-close.

### 0.1.0

- Initial release: equip slots around a portrait, item locations, saved outfits, export/import,
  the appearance macro, the narrator context feed, and the auto-tracking agent.
