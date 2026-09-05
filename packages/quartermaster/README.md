# Quartermaster

A per-chat RPG character sheet and inventory manager for Roleplay mode: equip slots around your
persona's portrait, item locations (bag / stored / equipped), and saved outfits, in a
draggable/resizable floating dock plus a native Tracker Panel view.

**Requires Marinara Engine 2.4.4+.** Roleplay only (no Game Mode support yet), persona-only (no
party/NPC support yet), and outfit/item portraits are upload-only (no in-app generation yet).
Actively evolving — a personal project, not yet an official catalog package.

## Features

- **Equip slots** — 16 slots (head, neck, eyes, ears, armor & clothing torso/legs, underwear
  top/bottom, back, hands, both hands' weapon, feet, belt) arranged around the portrait. Each slot
  shows the equipped item's own image, or built-in generated artwork if it doesn't have one.
- **Bag** — add, edit, and remove items, each with a name, description, and quantity. Store an
  item in the bag, a named stash (`stored:<name>`), or a slot (`equipped:<slot>`); search the Bag
  by name or by slot.
- **Item images** — give any item its own image: auto-matched by filename from a shared image
  folder (so a pre-made image pack just works by copying its folder in), or upload one directly
  from the item's card.
- **Saved outfits** — snapshot the current equip state under a name, then re-equip, edit, or
  resnapshot it later in one click; delete ones you don't need. Search outfits by name, and the
  dock shows which one (if any) is currently equipped.
- **Outfit portraits** — give a saved outfit its own portrait, shown in the dock in place of the
  persona's avatar whenever that outfit is equipped. An opt-in setting can also push it to the
  persona's *real* Marinara avatar — see below for what that involves before turning it on.
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
- **In-app image generation** — outfit/item portraits are upload-only for now.
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

### 0.1.2

Large visual overhaul: a decorated portrait frame with connector lines to each equip slot;
bundled artwork for every equip slot; redesigned item and outfit cards (image, name, description,
focused Edit modal) sized to fit their own content instead of clipping or growing unbounded;
equip slots now show the item's full image with overlay labels; a reworked Outfits section (save
via modal, live equip/edit/update from the card); collapsible columns that actually narrow the
dock instead of just hiding content; delete confirmations; Escape closes open modals; settings
reorganized with descriptions.

### 0.1.1

UI polish pass: theme-aware dropdowns, fixed a portrait-ring shift with the underwear toggle,
real button hover/press states, consistent border radius and scrollbar styling, an animated
Settings section, and click-outside-to-close.

### 0.1.0

Initial release: equip slots around a portrait, item locations, saved outfits, export/import,
the appearance macro, the narrator context feed, and the auto-tracking agent.
