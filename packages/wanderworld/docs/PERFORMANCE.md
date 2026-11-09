# Wanderworld performance readings

Readings of what each setting costs, so the README can tell players which settings matter most. Add new
readings at the end of each table with the version and date; keep the old ones for comparison.

## How they're taken

- The Wanderworld harness in Claude's built-in browser (desktop Chromium on the maintainer's PC; the
  display caps the frame rate at 120 fps, so **triangles drawn** is the better measure, and fps only
  shows once it drops below 120).
- Noon, the camera high over the edge of town looking across it (player at (0, 70), zoom 40, pitch 0.5),
  everything else on its defaults: Resolution Auto, Shadows on, detailed trees, props and buildings on.
- Each reading is the HUD's stats line about 2.5 s after changing the setting.

## 0.4.48+ (Phase A work in progress), 2026-11-09

Detailed nature now has its own reach: small plants 70 m, rocks 160 m, detailed trees 180 m; past
that, simple trees stand in out to the draw distance.

### Massive world (960 m), no characters in town

| Draw distance    | Trees and rocks 1×                | 4×      | 10×                  |
| ---------------- | --------------------------------- | ------- | -------------------- |
| Tiny (60 m)      | 120 fps · 140 draws · 1.35 M tris | 2.75 M  | 5.54 M               |
| Near (90 m)      | 120 fps · 246 draws · 2.00 M tris | 5.11 M  | 11.26 M              |
| Medium (140 m)   | 120 fps · 286 draws · 3.62 M tris | 11.54 M | 26.63 M              |
| Far (200 m)      | 120 fps · 288 draws · 5.58 M tris | 19.23 M | **88 fps** · 45.80 M |
| Very far (300 m) | 120 fps · 304 draws · 5.64 M tris | 19.43 M | **87 fps** · 46.29 M |
| Max (450 m)      | 120 fps · 326 draws · 5.75 M tris | 19.84 M | **85 fps** · 47.31 M |

Before the nature reach limits, the same Massive world at Max with 1× drew **119 M triangles at 38 fps**.

### Normal world (320 m), four characters in town ("World 3")

| Draw distance    | Trees and rocks 1×                | 4×      | 10×                  |
| ---------------- | --------------------------------- | ------- | -------------------- |
| Tiny (60 m)      | 120 fps · 192 draws · 1.85 M tris | 3.66 M  | 6.85 M               |
| Near (90 m)      | 120 fps · 315 draws · 2.59 M tris | 6.10 M  | 12.69 M              |
| Medium (140 m)   | 120 fps · 414 draws · 3.95 M tris | 11.40 M | 25.78 M              |
| Far (200 m)      | 120 fps · 418 draws · 4.88 M tris | 15.37 M | **96 fps** · 35.86 M |
| Very far (300 m) | 120 fps · 418 draws · 4.88 M tris | 15.39 M | **96 fps** · 35.89 M |
| Max (450 m)      | 120 fps · 418 draws · 4.88 M tris | 15.39 M | **96 fps** · 35.89 M |

## What they show so far

- **Trees and rocks is the biggest cost by far.** 4× draws about three to four times the triangles of 1×,
  and 10× about seven to nine times; 10× is the only setting that dropped below 120 fps here.
- **Draw distance matters up to Far (200 m) and very little past it**, because detailed nature stops at
  180 m and the simple trees beyond are cheap. In a Normal world, Very far and Max change nothing (the
  whole world is already in view).
- **World size costs almost nothing at the same draw distance**: a Massive world draws about what a
  Normal one does from the same spot. It costs memory and build time (about 0.35 s against 0.2 s), not
  frame rate.
- **Draw calls** rise with draw distance up to Medium (more kinds of nature in view) and with characters
  and buildings in view, not with trees and rocks.

Still to measure: Resolution, Shadows, the detailed trees / props / buildings toggles, a full town of
thirty characters, a phone or a laptop's integrated graphics, and inside the town looking along a street.
