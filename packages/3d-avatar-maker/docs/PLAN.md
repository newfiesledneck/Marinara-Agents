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
- 23 community skins, one picture each at its own age (`COMMUNITY_SKINS`, `skinsFor(sex)`, `skinPicture`); 21 since 0.1.05.
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

## Built (0.1.05)

- A licence fix. The first review read only each item's `.mhclo` or `.mhmat`; reading every file of every
  item found 105 more with an AGPL-3 line, mostly in the `.obj` (`docs/MAKEHUMAN-PACKS.md`). Eight were in
  use and are out: the Mid-toned and Viking tattoos skins from the kit, and from the packs (each now 0.1.01)
  Cortu's cargo trousers, denim shorts and T-bar shoes, both culturalibre eye masks and the lightning
  earrings. A new pack item must pass the same every-file check.
- Two more packs, with no maker change: Historical and Fantasy Clothes (17 pieces, CC BY 4.0 and the CC0 monk's
  robe) and Modern Casual Clothes (34, CC BY 3.0 and 4.0). The pack builder writes each CC BY piece's credit
  (title, author, source, licence and the fitting) into `avatar-pack.json`, and the maker puts the credits of
  what's worn in a saved file. `wwmhclo.py` reads MakeClothes 2's `l_shear_*` lines where an item has no
  `x_scale` (six of Elvaerwyn's). Shoes the fitter wouldn't let hide the feet got `force: ["feet"]`, as the
  everyday ankle boots did.

## Built (0.1.06)

- VRM export (`exporter.js` `exportVrm`), VRM 1.0, beside the GLB on the Save tab. The writer is ours, on
  three's GLTFExporter:
  - **T-pose bind.** The figure goes into `figure.js tPose`, and that pose becomes the meshes' own: points
    moved where three draws them (`bakePose`), skeletons bound there. A tool that reads the bind pose
    (Blender, UniVRM) sees the T-pose too.
  - **Meshes at the top of the file, with no transform of their own.** three's loader moves a skinned mesh
    by its node's transform, which glTF says to ignore, so the root's offset and a dwarf's 0.87 scale would
    otherwise put three and other readers apart.
  - **`VRMC_vrm`.** It names every humanoid bone in `HUMANOID_BONES`, and its `meta` holds the author's terms
    (`vrmTerms`, `vrmMeta`: VRM's careful defaults, chosen under the Save tab's "The VRM's terms" and kept
    in the browser) plus the CC BY credits in `thirdPartyLicenses`. A CC BY piece forces
    `creditNotation: required`.
  - **`VRMC_springBone`.** A worn tail (bones `tail_01` to `tail_05`) swings on a spring with capsules on
    the thighs. Settings came from a sweep in three-vrm: a slight droop that settles in under half a second.
- There's no `lookAt` or `expressions` block yet. Both wait for the eye bones and the faces (items 2 and 3
  below); `addVrm` is where they go.
- The check page loads a `.vrm` the way the Engine's VRM renderer does (three-vrm's loader). The regression
  test loads each saved VRM with three-vrm and checks:
  - the bones are named, the arms rest level, and the model faces +Z;
  - every point sits where the file lists it, so the bind pose is the rest pose;
  - the tail springs;
  - the figure is unchanged afterwards.

## Built (0.1.07)

- **Face movement** (`make_avatar.py` FACE_MOVES): 13 shape keys named as VRM's expression presets, each a
  mix of MakeHuman's CC0 expression units.
  - The keys: `blink`, `blinkLeft`, `blinkRight`, the vowels `aa`, `ih`, `ou`, `ee`, `oh`, and `happy`,
    `angry`, `sad`, `relaxed`, `surprised`.
  - **Tuning.** The mixes were tuned from renders of each unit alone, then of the built model: textured,
    subdivided, sealed.
  - **Lips.** A key that parts the lips undoes `seal_lips` as far as OPENS says.
  - **Where the keys go.** Only the body and what's on the face carry them: brows, lashes, beards,
    moustaches and tusks. The underwear, horns and tail don't, which saved about 3 MB of model.
  - **Beards.** `keep_clear` pushes a face key only where the skin under the hair moves; a blink had jumped
    a dwarf beard's cheek hair a centimetre.
- **Teeth and tongue**, MakeHuman's own (CC0): fitted through their .mhclo to the base mesh's helpers, so
  `mouth-open` carries the lower teeth and the tongue down. They have a picture of their own (`mouth_texture`):
  MakeHuman's teeth and tongue pictures, three copies each from bright to dark. Each face takes the copy for
  how far back in the mouth it is, as nothing lights the inside of a mouth. The tusks keep `teeth`; the mouth
  is `mouth_teeth` and `tongue`.
- **Eye bones** `eye_l` and `eye_r` under the head, at each eyeball's centre, with the eyeballs on them.
  - **Sliders.** The packer's `jointMoves` moves them with the sliders that move the eyes.
  - **Head size.** The maker moves and grows them with the head (`avatar.js`).
  - **Saved file.** `HUMANOID_BONES` names them `leftEye` and `rightEye`.
- **The maker** (`src/face.js`):
  - **Keys.** The body keeps the face keys live as morph targets.
  - **Preview.** A Face list under the picture plays them: lively (blinks, and the eyes follow the camera
    with a glance aside now and then), talking, still, or one expression held. Reduced motion holds the face.
  - **Saving.** A saved file has them at rest.
- **The files.** A GLB carries the keys by name, which is what the 3D Avatars agent's GLB path reads. A VRM
  adds:
  - `expressions.preset` bound to them, the feelings easing a blink with `overrideBlink: blend`;
  - `lookAt` of type bone on the eye bones (20° sideways, 11° up, 14° down);
  - the eyes' humanoid bones.
- **Size.** The models are 69 MB (male) and 79 MB (female), from 54 and 65. The kit's body bundles each grew
  by about 1.5 MB.

## Next, in order

1. **Check it in a real Engine:** a VRM and a GLB imported under 3D Avatars, talking, feeling and looking.
2. **Smaller saved files.** three's exporter writes each face key for every vertex of the body; sparse
   accessors (only the vertices a key moves) would take a few megabytes off each file. A VRM thumbnail
   picture in the meta.
3. **Faces on what's worn.** Hair, hats, masks and other clothes don't follow the face's keys yet (a face
   mask doesn't open with the mouth); the maker could carry them from the skin as it does the sliders.
4. **More expressions.** Visemes beyond VRM's five vowels, a wink and a smirk as custom expressions.
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
- Seen close from below, the upper teeth's shading changes in steps (each face takes one of three copies of
  the picture). From a chat's distance it reads as the mouth's shadow.
- A saved file has one picture for each piece worn. Packing them into one would make it smaller.
- Drafts live in the browser only.
- `avatar.js` still carries the anthro code paths and a crowd's low-detail triangle lists.
