# Quartermaster changelog

## 0.1.3 — 2026-09-07 [highlight]
Fixed inventory silently wiping every turn: the tracker agent's resultType was misconfigured as a
text-only result, so its JSON response never actually got parsed. Outfits now stay equipped when
extra items get added alongside them — only swapping one of the outfit's own items unequips it —
and the appearance macro reflects that. Added a "Restore Inventory" safety net and a "Refresh
Images" button, both under Settings. Fixed a rendering bug that hid an equip slot's name/item
labels behind its fallback icon, and stopped repeatedly re-requesting (and console-flooding)
images already confirmed missing.

## 0.1.2 — 2026-09-05 [highlight]
Major visual overhaul: a decorated portrait frame with connector lines to each equip slot, bundled
artwork for every equip slot, and redesigned item/outfit cards that size themselves to their own
content instead of clipping or growing unbounded. Equip slots now show the item's full image;
outfits got a reworked save/edit flow; columns can collapse to genuinely narrow the dock. Delete
confirmations and Escape-to-close round it out.

## 0.1.1 — 2026-08-30
UI polish pass: theme-aware dropdowns, fixed a portrait-ring shift with the underwear toggle, real
button hover/press states, consistent styling, an animated Settings section, and
click-outside-to-close.

## 0.1.0 — 2026-08-28 [highlight]
First release: equip slots around a portrait, item locations, saved outfits, export/import, the
appearance macro, the narrator context feed, and an agent that keeps inventory in sync
automatically from the story.
