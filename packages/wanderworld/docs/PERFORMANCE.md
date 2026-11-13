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

## 0.5.84, 2026-11-13: only what the camera sees

Before this, detailed nature was drawn all round the player, behind the camera too, and it is nearly all
of the triangles: a Normal world at Medium draw distance and 1× drew about 4.6 M triangles a frame, 4.3 M
of them detailed trees (a trunk is 2,000 to 7,000 triangles). People, the player and the animals' rigs are
about 0.2 M and the buildings and ground about 0.1 M. The game's own work is under 1 ms a frame, so on a
machine drawing without a graphics card it is the triangle count that decides the frame rate, not the
resolution.

- Detailed nature is drawn only inside the camera's view sideways (plus a margin, and everything within
  30 m), and again when the camera has turned about 10°.
- Someone off screen isn't drawn (a skinned figure can't be culled by its bounds, so the game does it).
- "Detailed trees out to" (30, 70 or 180 m) and a Sparse density (0.5×) lower it further.

Readings with these are in the next table when they're taken.

## 0.5.85, 2026-11-13: readings without a graphics card

The maintainer's PC with Chrome's hardware acceleration off (drawing on the processor), a 4K screen, out
in the hills of a Normal world on 0.5.84:

| Settings                                            | Triangles | Draws | fps |
| --------------------------------------------------- | --------- | ----- | --- |
| Everything on, Max draw distance, trees Far (180 m) | 3.51 M    | 579   | 11  |
| The same, detailed trees Near (30 m)                | 1.67 M    | 488   | 14  |
| Detailed trees off                                  | 1.66 M    | 487   | 18  |
| and detailed props off                              | 1.51 M    | 451   | 18  |
| and detailed buildings off                          | 0.87 M    | 266   | 19  |
| and draw distance Tiny                              | 0.58 M    | 47    | 25  |
| and trees Sparse                                    | 0.41 M    | 47    | 27  |
| and resolution 50% (1080p)                          | 0.41 M    | 47    | 41  |

So on a big screen the pixels cost as much as the triangles: the ground was 19 texture look-ups for every
pixel of it, whatever was there. 0.5.85 looks up only the layers that are at a spot, has a Simple ground,
names the resolutions, and stops drawing the whole world's simple trees when detailed trees are off (170 k
to 340 k of the triangles above).

## 0.5.86, 2026-11-13: readings on 0.5.85, and what followed

The same PC and screen, drawing on the processor, on 0.5.85. Detailed trees Near (30 m), draw distance
Max, everything else on, unless the row says otherwise. Full is 1838 pixels high in that window.

| Settings                                  | Triangles | Draws | fps |
| ----------------------------------------- | --------- | ----- | --- |
| Full resolution, trees 1×                 | 1.33 M    | 210   | 21  |
| 1440p                                     | 1.33 M    | 210   | 26  |
| 1080p                                     | 1.33 M    | 210   | 33  |
| 720p                                      | 1.33 M    | 210   | 41  |
| 540p                                      | 1.33 M    | 210   | 45  |
| Full, draw distance Tiny                  | 1.22 M    | 162   | 23  |
| Full, trees 10×                           | 4.13 M    | 201   | 9   |
| Full, trees 0.5×                          | 1.13 M    | 193   | 30  |
| and Ground Simple                         | 1.13 M    | 193   | 32  |
| Full, trees 0.5×, detailed trees Far      | 2.14 M    | 211   | 24  |
| Full, trees 0.5×, props and buildings off | 0.39 M    | 115   | 32  |
| Everything at its lowest, 540p            | 0.28 M    | 42    | 57  |

- At full 4K the pixels set a ceiling of about 30 fps here: going from 1.13 M triangles to 0.39 M gained
  2 fps, while 1080p gained 12.
- Simple ground is worth about 2 fps: after 0.5.85 the ground is no longer what the pixels cost.
- A low resolution is fast but jagged, since nothing smoothed the edges on a high-density screen. 0.5.86
  adds "Smooth edges" for that. Its cost on the processor has not been measured.

The densities were renamed in 0.5.86: 0.5× above is Normal now, 1× is 2×, 10× is 20×, and Sparse is 0.25×.
