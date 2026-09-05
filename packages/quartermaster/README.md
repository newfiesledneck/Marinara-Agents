# Quartermaster

A per-chat RPG character sheet and inventory manager for Roleplay mode: equip slots around your
persona's portrait, item locations (bag / stored / equipped), and saved outfits, in a
draggable/resizable floating dock plus a native Tracker Panel view.

**Requires Marinara Engine 2.4.4+.** Persona-only (no party/NPC support yet), Roleplay mode only,
and outfit/item portraits are upload-only (no in-app generation yet). Actively evolving — a
personal project, not yet an official catalog package.

## Features

- **Equip slots** — 16 slots (head, neck, eyes, ears, armor & clothing torso/legs, underwear
  top/bottom, back, hands, both hands' weapon, feet, belt) arranged around the portrait. Each slot
  shows the equipped item's own image, or built-in generated artwork if it doesn't have one.
- **Item locations** — carried in the `bag`, `equipped:<slot>`, or tucked away `stored:<name>`.
- **Item images** — auto-matched by filename against `gallery/quartermaster/items/` (so a
  pre-made image pack just works by copying its folder in), or upload one per item directly from
  its card.
- **Saved outfits** — snapshot your current equip state under a name, with an optional portrait,
  then re-equip it in one click. The dock shows which outfit (if any) matches what's currently
  equipped.
- **Export / import** — back up or transfer a chat's items and outfits as a JSON file.
- **Slot-group toggles** — hide underwear (off by default), armor, or weapons slots entirely if
  a chat doesn't need them.
- **Appearance macro** — feed the current outfit or equipped items into a
  `{{getvar::quartermaster_appearance_persona}}` token, so Illustrator picks up what's actually
  equipped when generating images.
- **Narrator context** — the narrator gets a live summary of what's equipped/carried/stored each
  turn, replacing the Engine's built-in inventory block.
- **Auto-tracking agent** — an optional agent reads each turn's narration and keeps equip state
  and inventory in sync automatically, no manual updates required.
- **Search & collapsible columns** — search the Bag or Outfits list, and collapse any column
  (Outfits / Equipped / Bag) to a narrow strip to free up space.

## Outfit portraits & the real persona avatar

Outfit portraits are stored by Quartermaster and shown in its own portrait ring — this always
works and updates instantly. A separate, **opt-in, off by default** setting can also push that
portrait to the persona's actual Marinara avatar whenever a matching outfit is equipped, reverting
automatically when it's not. Two things worth knowing before enabling it: every change adds a
permanent entry to the persona's version history (no way to turn that off), and other screens
showing that avatar (chat header, persona picker) can take a moment to visually catch up — a
Marinara caching quirk outside Quartermaster's control.

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
