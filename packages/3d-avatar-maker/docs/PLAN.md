# 3D Avatar Maker: the plan

A Home tab app where a user builds a 3D avatar for a character or persona and uses it with the Engine's
3D Avatars agent, with no other software. Decided with ThatOneCan on 2026-11-22; the investigation behind
it is `avatar-maker-investigation.md` in the shared notes folder.

## Decisions

- A new package, `3d-avatar-maker`, named "3D Avatar Maker" for now, on its own Home tab.
- It began from Wanderworld's avatar and keeps its own copy of the code, models, Blender scripts and kit
  files. Nothing here changes Wanderworld, and Wanderworld keeps its copy until this project is proven.
- Humans only for now (male and female, the eight races). No anthro bodies yet.
- Styles: semi-real (what the kit is) and anime first.
- The user saves a file and imports it under 3D Avatars themselves. No direct upload for now.
- Two files to save: GLB and VRM.
- Parts made in Blender by ThatOneCan are released as CC0, like the MakeHuman base, so a saved avatar can
  be shared freely.
- It must work without AI. "Generate avatar" (from a description, or from a portrait with a model that can
  see pictures) is an extra the user turns on.
- Released like Wanderworld: `feat/3d-avatar-maker`, +0.0.01 a build with a two-digit last part, tested
  through the shared `quartermaster-dev-catalog`; no issue or pull request until asked.

## Built (0.1.00)

- The workspace: branch `feat/3d-avatar-maker` in its own worktree, cut from `feat/wanderworld` at 0.7.62.
- `src/`: the kit reader (`kitfiles.js`, `packed.js`), the builder (`avatar.js`, `looks.js`), poses
  (`figure.js`), the 3D view (`stage.js`), the controls (`panel.js`), saving and opening (`exporter.js`),
  and the tab itself (`main.js`).
- The maker's tabs: Start, Body, Face, Skin and eyes, Hair, Clothes, Save. Drafts kept per character or
  persona in the browser.
- GLB export with only what's drawn, standard materials, pictures inside, and the look stored in the file
  so it opens again. Opening a look file, a saved avatar, or a Wanderworld look.
- `dev/`: a test page, a check page that loads a saved file the way the Engine does, and the page that
  makes the icon, cover and banner.
- `tests/3d-avatar-maker.regression.mjs`.

Checked: a saved dwarf in plate armour (8.5 MB) loads on the check page with 22 of 22 body bones found and
poses with its arms lowered. Not yet checked in a real Engine.

## Next, in order

1. **Dev catalog.** `_planning/scripts/update-dev-catalog.mjs` rebuilds only the packages in its
   `DEV_PACKAGES` list; `3d-avatar-maker` has to be added there (that script is shared and kept by the
   Quartermaster session). Then install it in the Engine and import a saved avatar under 3D Avatars.
2. **Faces** (the largest piece). In `assets/scripts/make_avatar.py`: shape keys `blink`, `aa`, `ih`, `ou`,
   `ee`, `oh`, `happy`, `angry`, `sad`, `relaxed`, `surprised` from MakeHuman's CC0 expression targets,
   teeth and a tongue from its system assets, and a mouth interior. The lips are sealed today
   (`seal_lips`). Brows, lashes, beards and moustaches must follow the face. The kit packer must keep
   these keys live instead of the builder baking them in, and `exporter.js` must write them as morph
   targets with their names (three's exporter puts them where the Engine reads them). The packer is still
   Wanderworld's `scripts/build-wanderworld-people.mjs --avatar`; this package needs its own copy first.
3. **Eye bones** (`eye_l`, `eye_r`) so a VRM's eyes can follow the viewer, and the eyeballs weighted to them.
4. **VRM export.** Our own writer on the GLB: the `VRMC_vrm` block (bone table, details and terms, the
   face list, look-at), the T-pose (`figure.js tPose`), and spring bones for the tiefling's tail.
5. **Hair movement.** Bone chains in the hair styles, then spring bones in the VRM. Hair is rigid today.
6. **More to change:** skin texture layers (freckles, scars, tattoos, makeup), patterns and pictures on
   clothing, accessories fixed to a bone (glasses, earrings, hats, bags), more face sliders.
7. **Generate avatar.** A server part with one route that asks a chosen model for a look from the card's
   text, or from its portrait when the model can see pictures. Wanderworld's `designMenu`, `readDesign`
   and `/look-design` route are the starting point. Off by default; needs `routes` and a restart.
8. **Anime style.** A head for each body built for it, eye pictures, a hair set, flat shading with an
   outline (MToon, VRM only). The body below the neck and all clothing are shared.

## Known rough edges

- The Ranger outfit's leather armour shows gaps at the front on the male body.
- A saved file has one picture for each piece worn. Packing them into one would make it smaller.
- Drafts live in the browser only.
- `avatar.js` still carries the anthro code paths and a crowd's low-detail triangle lists.
