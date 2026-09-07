# Quartermaster changelog

## 0.1.4 — 2026-09-08 [highlight]
- Added Build Wardrobe: describe a style direction and get a proposed set of new items and
  outfits to review before adding them to inventory.
- Outfits it builds can reuse your existing wearable items instead of always creating new ones.
- Generation uses the tracker agent's own configured connection, so switching that in the Agents
  menu also moves this.
- Fixed non-wearable items (a phone, a wallet) sometimes turning up in a generated outfit.

## 0.1.3 — 2026-09-07 [highlight]
- Fixed inventory silently wiping every turn: the tracker agent's resultType was misconfigured as
  a text-only result, so its JSON response never actually got parsed.
- Outfits now stay equipped when extra items get added alongside them — only swapping one of the
  outfit's own items unequips it — and the appearance macro reflects that.
- Added a "Restore Inventory" safety net and a "Refresh Images" button, both under Settings.
- Fixed a rendering bug that hid an equip slot's name/item labels behind its fallback icon.
- Stopped repeatedly re-requesting (and console-flooding) images already confirmed missing.

## 0.1.2 — 2026-09-05 [highlight]
- Added a decorated portrait frame with connector lines to each equip slot.
- Added bundled artwork for every equip slot.
- Redesigned item/outfit cards to size themselves to their own content instead of clipping or
  growing unbounded.
- Equip slots now show the item's full image.
- Outfits got a reworked save/edit flow.
- Columns can collapse to genuinely narrow the dock.
- Added delete confirmations and Escape-to-close.

## 0.1.1 — 2026-08-30
- Theme-aware dropdowns.
- Fixed a portrait-ring shift with the underwear toggle.
- Real button hover/press states.
- Consistent styling.
- Added an animated Settings section.
- Added click-outside-to-close.

## 0.1.0 — 2026-08-28 [highlight]
- Equip slots around a portrait.
- Item locations.
- Saved outfits.
- Export/import.
- The appearance macro.
- The narrator context feed.
- An agent that keeps inventory in sync automatically from the story.
