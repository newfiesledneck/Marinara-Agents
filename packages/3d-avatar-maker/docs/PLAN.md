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

## Built (0.1.01)

- Nails are shells of their own on every finger and toe (`make_avatar.py` `nail_plates`), placed on each
  digit's last segment from its joints, coloured as one part. The faces MakeHuman drew nails as are skin.
- 46 face sliders in eight foldable groups (eyes, brows, nose, mouth, jaw and chin, cheeks, ears, forehead
  and head) and 15 body sliders (arms, legs, torso and hips, her bust), each a pair of MakeHuman CC0 targets
  (`FACE_DETAIL`, `BODY_DETAIL`, `BREAST_DETAIL`; looks.js the same names), with ready-made shapes for each
  group (`FACE_PRESETS`).
- Races are presets on one body: six race sliders anyone can mix, a race choice that sets them with height,
  limbs and usual extras (`racePreset`), wider height and limb ranges. Horns, tusks, a tail and beards are
  accessories for anyone. Older looks naming a race open as before.
- An "Anime proportions" style preset on the same head (`STYLES`).
- The model carries the new keys on the skin and eyes only; the maker carries them onto brows, lashes,
  beards, underwear, hair and clothes from the skin. This kept the model files near 50 MB (they reached
  85 MB with every key on every piece).
- Lip colour is painted through a mask in the skin picture (`src/skin.js`), for a clean edge.

## Built (0.1.02)

- The MakeHuman community packs the user downloaded were checked item by item (`docs/MAKEHUMAN-PACKS.md`:
  what's used, what's left out and why, every item's licence and author). The packs are read from
  `_planning/Wanderworld asset packs/MakeHuman/extracted/<pack>` (`MAKEHUMAN_PACKS` to move it); a target
  from one is named `pack:<pack>/<region>/<name>` (`wwavatar.target`).
- 29 one-way face and body sliders from community targets (cheeks, ears, nose, arms, hands), each only a
  `.hi` key. The finer anatomy ones (`detail_…`) start partly on in a new avatar (`NEUTRAL_LOOK`); presets
  and styles leave them alone.
- 23 community skins, one picture each at its own age (`COMMUNITY_SKINS`, `skinsFor(sex)`, `skinPicture`).
  A skin only one body has opens on the other as MakeHuman's light skin.
- 15 community eye pictures (realistic, cat's eyes, reptile, dragon, a trial anime one): the eye atlas is
  5 × 5 now (`EYE_GRID`). `make_avatar.py -- eyes` rebuilds the eye pictures alone.
- Nails are Mindfront's, fitted as pieces (`make_mh_clothes.py`, slots `nails` and `toenails`, `NAIL_SLOTS` in
  looks.js): short, medium, long or none, and toenails on or off, on the Skin tab; the nail colour dyes them;
  gloves hide the fingernails, shoes the toenails. They bend with the finger bones (`wwmhclo` now rigs them).
  The old nail shells are off (`NAIL_SHELLS`).
- Brow styles 13–16 and lash styles 5–6: Mindfront's strand brows and lashes baked onto MakeHuman's cards at
  build time (`bake_brows.py`, `HAIR_STYLES`); the hair texture grew to 4 × 6 squares.
- The plan for community clothes (themed asset packs the maker finds through
  `/api/capability-packages/installed`) is in the shared notes (`avatar-asset-packs-plan.md`); not built yet.

## Built (0.1.03)

- Wardrobe packs (`src/packs.js`): staging-only packages `3d-avatar-maker-wardrobe-<theme>` with an
  `avatar-pack.json` index and bundles in the kit's outfit format. The maker lists them through
  `/api/capability-packages/installed`, reads each index as untrusted data (`readPack`: only its own slots,
  parts and hide words, the body revision `BODY_REVISION`, declared bundles, CC-BY only with a credit), and
  adds the pieces to the Clothes tab (`addPieces`). Saved files carry CC-BY credits (`licenceNote`). The
  test page serves the repo's packs as if installed.
- The first two packs, all CC0: Everyday Women's Clothes (26 pieces, 8.9 MiB) and Everyday Men's Clothes and
  Suits (12 pieces, 4.2 MiB). One table (`assets/packs.json`) drives the fitting (`make_mh_packs.py`, reusing
  `make_mh_clothes.py`) and the build (`scripts/build-3d-avatar-maker-packs.mjs`, reusing the kit packer's
  `packOutfitPieces`). Left out: mindfront_kimono (fits badly), toigo_suit_with_jacket_and_bowtie (12.8k
  vertices).
- Next packs (from the plan note): accessories (needs face, ears, fingers and socks slots first),
  historical and fantasy, modern casual (both with CC-BY items, credited).

## Built (0.1.04)

- Five new slots (looks.js CLOTH_SLOTS): `face` (glasses, eye masks), `mouth` (a face mask), `ears`, `fingers`
  (rings) and `socks`. `COVERED_BY` says what a worn slot leaves off: gloves the fingernails and a ring, shoes
  and socks the toenails. A pack may hide the hair (`HIDE_WORDS`), as the kit's hats do.
- The Accessories pack, `3d-avatar-maker-wardrobe-accessories` 0.1.00, all CC0: six glasses, two eye masks, a
  medical mask, two earrings, two rings, three gloves, four socks, two hats (22 pieces, 5.0 MiB).
- Fitting options for small things (`make_mh_clothes.py`): `cut` keeps the pack's alpha as a cut-out (clear
  lenses, lace), `size` a smaller picture, `clearance` per piece (earrings and rings sit 0.5 mm off the skin;
  cloth's 2.5 mm squashed a pearl stud flat). Socks and gloves are fitted without lifting faces over the skin
  (`skin: false`): the body's separate toes and fingers threw a mitten-like sock's vertices into spikes.
- The packer keeps every triangle of glasses, earrings and rings (`WHOLE_SLOTS`), and the face's keys on what's
  worn on the face (`HEAD_SLOTS`).

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
