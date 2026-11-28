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

## Built (0.1.08)

- **Hair movement** (`src/hair.js`), worked out in the maker from each style's mesh, so no model changed.
  - **Which styles.** `SWINGING_HAIR`: long, ponytail, braid, bob and angled bob. Short cuts stay rigid
    (their hair at the nape lies on the skin).
  - **The hang line.** Hair above it stays on the head: 3 cm under the eyes, 12 cm for the braid, which
    wraps round the head from the temple first.
  - **Sides and chains.** Below the line, each point is followed back up the mesh to the line. That gives
    how far along the hair it is and which of eight sides of the head it hangs from. A side with enough hair
    gets a chain of bones (`hair_<side>_0` to the tip) down the middle of its locks, each bone about 8 cm,
    five at most.
  - **Weights.** The points ease from their old weights onto the chains over 4 cm. They blend between
    neighbouring sides and along each chain.
  - **What a chain hangs from.** The bone the hanging hair followed most: the head for a bob or a ponytail,
    the upper chest for long hair and the braid. With nothing moving, it follows the body as before.
  - **Bigger or smaller heads.** Each point rests where its old weights put it: its place is moved for the
    new weights (`rigHair`), and the regression test checks this.
- **Springs** (`src/springs.js`), VRM 1.0's: the hair and a tail (whose spring moved here from the exporter).
  - **Settings.** Hair: stiffness 0.5, gravity 0.02, drag 0.3. Tuned in Node:
    - up to 5 cm of swing on long hair and 3.5 cm on a ponytail in the Moving pose;
    - about 1.5 cm of sag at rest;
    - settled within 1.5 s.
  - **Colliders.** Fitted to the body as shaped: a ball for the head, capsules along the neck, collarbones and
    upper arms, and capsules across the hips, waist, chest and back as deep as the body is there.
    `fitColliders` makes each a little smaller where a joint rests close. Where a lock rests on one anyway (on
    the shoulder), that spring leaves it out, so nothing is pushed while the avatar stands still, as built or
    in the T-pose.
  - **The file.** A VRM writes each spring with a collider group for what it meets. three-vrm reads them in
    the regression test and holds them at rest.
- **The maker** swings them with the same rules every frame, and a **Moving** pose (`figure.js movingPose`)
  turns the head now and then to show it. Reduced motion holds them at rest; changing the pose starts them
  from rest.

## Built (0.1.09)

- **Lip colour.** The lip faces reach 4 to 7 texels past the lips the skin pictures paint, and the mask was at
  full strength to their edge (and softened past it), so a picked colour spilled onto the skin round the
  mouth. The mask (`scripts/build-3d-avatar-maker-masks.mjs`) now fades the outer lips in from their edge,
  nothing for 1.5 texels and all of it from 6 in, and keeps the colour full where the lips meet.

## Built (0.1.10): bone-fixed accessories

The code for the community items still to come (objects, jewellery, horns, wings, tails and 29 hair styles).
No item is fitted yet; the packs that fill these slots come next.

- **Fixed to a bone.** A piece can move with one body bone alone: its `bone`, one of looks.js
  `PIECE_BONES` (the head, neck, spine, hips, collarbones and limbs; not the fingers, toes, eyes, tail or hair
  bones).
  - **At load** (`avatar.js` `fixedPart`), every point gets its whole weight on that bone, through the piece's
    own inverse bind matrix for it (the body's, if the piece has none). It rests exactly where it was fitted
    and never bends.
  - **Head size.** A bigger head grows it as it grows the hair and eyes, through the bone's stretch.
  - **Shape keys** move it as one, by the average of how they move its points (`rigid`). It follows a higher
    brow or a bigger hand and keeps its shape.
  - **Where it's said.** A kit piece takes `bone` from its model's extras, a pack piece from its index.
- **New slots** (looks.js `CLOTH_SLOTS`): horns or antlers, necklace, on the back (wings, a backpack, a slung
  guitar), wrists, belly, at the hip, tail, ankles, and the right and left hand.
  - **Slot bones** (`boneOf`): a hand's pieces are fixed to `hand_r` or `hand_l`, horns to `Head`, unless a
    piece names another bone.
  - **What covers what** (`COVERED_BY`): gloves and bracers hide the wrists, socks and greaves the ankles, a
    scarf the necklace, a one-piece outfit, a breastplate or an apron the belly, and anything on the head the
    horns.
  - **Tails.** The race tail on the Face tab is separate from this slot and keeps its spring bones.
- **Hair from packs.** A pack's index may list `hair` styles (`packs.js` `readHair`). Each has a label, its
  bodies, a bundle of its own in the kit's hair bundle format, an author, a licence and a credit. An optional
  `swing` (metres below the eyes where its locks leave the head, at most 0.3) gives it chains (`hair.js`
  `swingOf`). The Hair tab offers the styles beside the kit's and names each one's pack and maker. A CC BY
  style's credit goes into a saved file as a piece's does (`looks.js` `packCredits`).
- **The pack contract** is still `format: 1`. `bone` and `hair` are optional, so the packs built before read
  as they did. The builder writes `bone` from `assets/packs.json` (else the model's extras) and a pack's
  `hair` from its models `avatar-hair-<style>.glb`, a bundle `hair/<style>.pack.png` for each style. The
  kit's builder and the packs' share the hair packing (`packHairStyles`).
- **Looks outlast an uninstalled pack.**
  - **Kept.** `checkLook` keeps a well-formed piece id or hair style that no installed pack has, at most one
    for each slot, with its colours. `fromPacks` records each pack piece's and style's pack and label.
  - **Said.** Such a piece isn't worn. The preview, the Clothes tab and the Hair tab say what isn't shown and
    which pack to install again, and the Clothes tab can take it out of the look. Once the pack is installed
    again, it's worn.
  - **Saved.** Drafts and look files keep it. A saved GLB or VRM has only what's worn (`wornLook`), and an AI
    design keeps only what's there.
- **Checked** in the regression test, with a test pack made from the kit's own gloves, helm and long hair:
  - pieces fixed to the hand, head and upper back keep their shape to a ten-thousandth of a millimetre as the
    arm, fingers, back and head turn, while the same gloves unfixed bend by 25 cm;
  - a fixed piece rests where it was fitted and grows with a bigger head;
  - readPack and readHair take the new slots, bones and styles and refuse bad ones;
  - a look keeps its missing pieces and wears them once the pack is back;
  - a GLB and a VRM bind each fixed piece to its one bone, and three-vrm reads the VRM.

  The kit rebuilt byte for byte the same after the hair packing moved. A trial build of the Accessories pack
  with a `bone` and a hair style was read and worn by the maker (not committed).

## Wardrobe packs merged (packs only; the maker unchanged)

- Two packs instead of five: `3d-avatar-maker-wardrobe-clothes` 0.1.00 (178 garments, 62.3 MiB) and
  `3d-avatar-maker-wardrobe-accessories` 0.2.00 (45 pieces, 13.1 MiB). Every piece kept its id. The four
  merged-away packs left the catalog the way a package leaves it: their folders, store entries, guidance,
  covers and README rows are gone, `build-3d-avatar-maker-packs.mjs` drops a wardrobe pack's catalog entry once
  it isn't in `assets/packs.json`, and their old artifacts stay for installs that have them.
- 118 new pieces (103 garments, 15 accessories) after the remaining community clothes were tried, rendered and
  judged; `docs/MAKEHUMAN-PACKS.md` "The merge pass" lists each one kept and each one left out, and why.
- Later passes add hair styles, body parts and held objects to the Accessories pack.

## Built: skirts and dresses that hang and swing

Before this, a skirt or dress was skinned to the body, so each side followed its own leg. That left a crease
between the legs and bent the cloth with them. Now hanging cloth swings on chains of its own, as hair does,
worked out in the maker from each piece's mesh (`src/hair.js` `hangPlan`, shared with the hair). No model
changed.

- **Which pieces.** The kit's `HANGING_CLOTH`: the long, short and pleated skirts, the loincloth, the apron,
  the dress, the gown, the robe, the tunic's tails, the long coat and the cloak. A pack piece hangs if its
  index has `hang` (`packs.js` `readPack`, `-1` to `1.5`). The builder writes it from `assets/packs.json`,
  where 22 skirts, dresses, robes and a coat have one now. Trousers, leggings, shorts, overalls, shoes, the
  tight MakeHuman skirt and the denim skirt follow each leg as before.
- **The hang line.** `hang` is where the cloth leaves the body, as a share of the way from the hip joints
  down to the knees: 0 at the hips, 1 at the knees, below 0 above the hips. Skirts are at 0.1 to 0.25, a
  shift dress at 0.4, the monk's robe at 0.45 (it lies on the legs above that), and the cloak at -0.6, the
  middle of the back. Each value was read off how far the cloth stands from the skin at each height.
- **Sides and chains.** Below the line, each point is followed up the mesh to the line to find how far down
  the cloth it is. Its side is where it is round the hips, one of eight. (A skirt's rows of points are far
  apart, and paths across them drifted round, so following the side up the mesh gave lopsided chains.)
  Each side gets a chain of bones down its middle, about 12 cm a bone and six at most. They're named
  `cloth_<piece>_<side>_0` to the tip.
- **Weights.** Below the line, points ease from their two legs onto the chains over 8 cm. They blend
  between neighbouring sides and along each chain, so the front between the legs is one piece on the front
  chain. Cloth that moves mostly with the arms, a sleeve's cuff, stays as it was.
- **What a chain hangs from.** The hips, or the spine bone at the line (the cloak hangs from `spine_01`).
- **Longer legs.** Each point rests where its old weights put it, as the hair does on a bigger head.
- **Colliders** (`springs.js` `bodyColliders`, `cloth`). Each chain meets its own copies of the hips' and
  back's capsules and a capsule down each thigh and calf, fitted as the hair's are. A leg's capsule may
  shrink by half where cloth rests close to it, not a quarter, so a tight robe's sides stay out of the legs.
- **Settings** (`CLOTH_JOINT`). Stiffness 1, gravity 0.01, drag 0.35, hit radius 2 cm: stiffer than hair
  (0.5) and slowed more (0.3). A stiffer, slower trial (2 and 0.6) sagged no less for its weight and swung
  less as the hips turned.
- **The Moving pose** (`figure.js movingPose`) now turns the hips with the head and lifts each knee in turn
  in a small step, so the skirt swings. Its label says so. Reduced motion holds everything still.
- **The files.** A VRM writes each chain as a spring with its colliders, and three-vrm holds them at rest in
  the regression test. A GLB keeps the chains' bones and weights. The Engine's GLB path runs no springs, so
  there the cloth follows the hips and doesn't move out of the legs' way.

Measured in Node over ten seconds of the Moving pose, for every kit piece on both bodies and for each pack
piece given a `hang`:

- Rest is exact (0.002 mm), and every point's weights add up to one.
- No collider holds a joint at rest, as built or in the T-pose.
- Sag at rest is 0.1 to 0.7 cm.
- The swing is under 1.5 cm on the shortest mini skirts and his tunic's tails, 4 to 17 cm on most pieces,
  and up to 39 cm at a floor-length hem lifted by the knee.
- Everything settles within 0.8 s.
- No joint went deeper into a leg's capsule than at rest. The female monk's robe is the exception, at
  1.2 mm.

The regression test checks the same for every kit piece on both bodies. It also checks that trousers get
no chains, that a long-legged skirt rests where it was fitted, and that a VRM's dress springs meet the four
leg capsules. Renders of a skirt, the gown, the long coat, the cloak and the robe at moments of the Moving
pose are in the hand-over note.

## Built: a bust that moves

At the same time, and on the same springs: each breast has a spring bone, as VRoid models do, so the chest
sways a little as the body turns (`src/bust.js`), and since then the arms push it.

- **Who gets it.** Her body always. His only when his chest stands out in front of the breastbone as far as
  her bust does at its flattest (`BUST.least`, 1.6 cm). His chest is 0.8 cm as built and 1.3 cm at the
  fullest Chest slider. The half-orc slider with a full chest reaches 1.8 cm and gets one; no other slider
  mix tried did.
- **The bones.** `breast_l` and `breast_r` under the middle chest (`spine_02`), placed from the body as
  shaped. Each runs from 10 cm behind the middle of its breast's ball (below) to that middle, with a tip
  there. Each bone's own y axis points along it, so the preview can squash it along its own axes.
- **Weights.** Round each front, a share of a point's middle and upper chest weight (`spine_02` and
  `spine_03`) goes onto its side's bone: all of it within 3 cm, none past 8.5 cm, eased between, and eased
  out over the last 2 cm of the 7 cm behind the front. Before the arms could push it, only the upper chest's
  weight moved, which is a quarter of the breast's weight, so a pushed bone moved the skin a quarter as far.
  The middle chest is the bones' parent and carries most of the rest. With the bust at rest the body bends
  as before, except that the upper chest's share now turns with the middle chest when the two turn apart.
- **Room for the bone.** A point with four weights already gives up its smallest if that's under 0.05.
  Dropping more made a T-shirt sink 6 mm into the skin as the arms moved. If its smallest is larger, its two
  chest weights merge into one place and the bone takes the other. Before, such a point kept its weights.
  That was a third of the points in the middle of the share, and they tore from the rest once the bust was
  pushed a few centimetres.
- **Clothes follow.** Every piece but hair and bone-fixed pieces takes the share of the skin nearest it, so
  a top and the breast under it move together.
- **Settings** (`BUST_JOINT`). Stiffness 1.5, no gravity (it rests as shaped), drag 0.45. It sways about
  2 mm in the Moving pose (1.7 mm at Chest -0.5, 2.3 mm at Chest 1) and settles within a second, as before.

### The arms push it

Before, the bust met no colliders, so folded arms went into a large bust.

- **The ball** (`bust.js` `ballIn`). Each breast's spring tip has a hit radius: the ball the arms press on.
  It is fitted to the body as shaped. Of the balls round and behind the breast's front (a 1 cm grid, then a
  3 mm one about the best), each as big as reaches the nearest skin within 14 cm, it takes the one that
  leaves least room under the breast's own skin. The ball is under the skin everywhere, touching it at its
  nearest point: 3.3 cm at Chest -0.5, 3.7 cm as built and 5.4 cm at Chest 1. A first try with a larger
  ball, fitted as a dome over the chest, stood out of the skin below the breast. A forearm under it
  then turned the breast 50 degrees.
- **The colliders** (`springs.js` `bodyColliders`, `arms`). A capsule along each upper arm, forearm and hand
  (to the middle finger's second joint), as thick as half the skin is from the bone. They are fitted as the
  others are, and also in the relaxed pose, where the arms hang closest to the bust. None holds a ball at
  rest, as built, in the T-pose or relaxed.
- **What a VRM app does.** It runs the spring as written: the ball is pushed out of a capsule and the bone
  turns to follow it. So an arm under the bust pushes it up, and one at its side pushes it in towards the
  other. A press from the front, along the bone, slides the ball off sideways however far it must turn.
- **What the preview adds** (`springs.js` `squash`). An arm's push turns the breast only across its bone;
  the part of the push along the bone is left. The turn is held to 20 degrees (`TURN_MOST`). What still
  presses into the ball after that squashes the bone along its own axes: shorter by as much as it's pressed,
  from the side it's pressed on, and wider the other ways to keep its size (to half its length at most).
  So a hand on the chest flattens the breast under it, and it bulges round the palm. `figure.js` `restPose`
  puts the size back, so a file saved mid-animation is the same as one saved at rest.
- **Limits.** One ball can't fill the sides of a large breast. A hand tucked against its outer side (the
  arms-folded clip's) still goes 12 mm in as built and 24 to 29 mm at Chest 1, from 17 and 37 to 40 mm
  unpushed. The breast's sides move only as far as the ball does. Giving each breast more joints would need
  more weight places than the body's points have free.

Measured in Node over the arms-folded clip, from the arms' skin to the breasts' skin (points at least half
on the bust):

| Bust | Forearm in | Hand in | Ball pushed |
| --- | --- | --- | --- |
| As built | 0 mm (0 unpushed) | 12 mm (17) | 1.3 cm |
| Chest 1 | 4 mm | 24 mm (37) | 3.6 cm |
| Chest 1, high, pointed | 9 mm (26) | 29 mm (40) | 6.1 cm |

The regression test checks the same two busts as before:

- rest exact on the skin and the top, with whole weights;
- a few millimetres of sway, then settling;
- a T-shirt and a dress staying outside the skin as the bust sways;
- every breast meeting both arms' and hands' capsules, and none holding its ball at rest, in the T-pose or
  relaxed;
- in the arms-folded clip, on the same body bare: the bust pushed, the forearms within a centimetre of the
  breast's skin and at most half as deep as unpushed, and the hands less deep than unpushed;
- settled and unsquashed once the arms are lowered.

His chest has no bust as built or muscular, and one at the half-orc's full chest. A GLB keeps the bones. A
VRM writes each breast's hit radius and its group of arm capsules, and three-vrm holds the bust at rest
within 0.5 mm. Renders of arms folded under the bust, the arms-folded clip and a hand on the chest, before
and after, are in the hand-over note.

## Built: animations in the preview

- **The list.** An Animation list under the picture, beside the pose and Face lists, with Pause and Stop.
  - The 20 animations: standing at ease, looking around, talking with the hands, talking on a phone,
    walking on the spot (plain and smart), turning round, waving, dancing, celebrating, nodding yes,
    shaking the head no, arms folded, surprise, crying, drinking, sitting down and getting up, sitting on the
    ground, crouching and stretching.
  - Each option names what it does, and its tooltip says more.
  - Picking a pose stops the animation.
- **Recorded clips** (`src/clips/ual.json`, 486 KB, bundled into `client.js`). 24 clips from Quaternius's
  Universal Animation Library and Universal Animation Library 2, both CC0 (each library's License.txt says
  so).
  - **The build.** `scripts/build-3d-avatar-maker-clips.mjs` (begun as a copy of Wanderworld's) stores each
    humanoid bone's turn away from the library's T-pose, in model space, and the hips' movement in leg
    lengths. Each turn is three whole numbers, and most clips keep 12 frames a second.
  - **Our rig.** It is the same Unreal mannequin, so `recordedPose` turns each bone that far from where it
    stands in this body's own T-pose (the arms levelled from the A-pose), parent first, and moves the hips by
    the clip's offset times this body's leg.
  - **The floor.** The lower foot is then put back on the floor, so any leg length stands on it.
  - **Sequences.** A motion is a loop of clips (sit down, sit, talk, stand up, stand). A different clip eases
    in over 0.3 s; a loop repeated goes straight on. A quick drop (into the crouch and out of it) plays at
    0.6 speed, so long hair on its springs follows rather than flies up.
  - **Left out.** The backflip: it read well, but long hair on its soft springs flew straight up.
- **Hand-made where no clip fits** (waving and stretching, `POSES`), and for the turn:
  - Each hand-made motion is a function of time that returns where the hips, spine, head, arms and feet go.
  - `motionPose` puts it on the A-pose rig. Each arm is aimed and turned about itself so the elbow bends the
    right way. Each leg reaches its ankle with two-bone IK. The hips come down when a foot couldn't otherwise
    reach the floor.
  - The library's own turns go a quarter round and back, so "Turning round" is the walk mixed half with the
    idle, for small steps, while the whole figure turns once in 10 s on its hips. The camera stays put.
- **Starting and stopping** (`createMotionPlayer`).
  - Starting, changing or stopping eases over 0.45 s from the pose the figure was in. Each foot moves from
    where it stood to where it's going, so it doesn't slide into the floor.
  - The springs (hair, a tail, and the skirts and bust to come) run after the pose each frame, so they
    follow without a jump.
  - A new look while a motion plays goes on with it.
- **The face.** The Face list keeps working. While it's on Lively:
  - talking and the phone call move the mouth;
  - celebrating smiles;
  - surprise and crying show their feelings.
    Any other Face choice wins.
- **Views.** While an animation plays, the Face and Hand views follow the head or the left hand, easing
  after it. Whole body and Feet stay where they are.
- **Reduced motion.** Nothing moves on its own, as before. An animation plays only when the user picks one,
  and then plays whole with the hair swinging, as they asked for it.
- **Saving.**
  - `restPose` now puts each bone back in its place as well as its turn (the motions move the hips).
  - A file saved mid-motion is therefore the same, byte for byte, as one saved at rest.
  - `stage.js` and `main.js` got small hooks only.
  - `figure.js` exports `aimBone` and `turnInWorld`.
- **Checked** in the regression test. Three bodies: a woman, a short-legged dwarf with a big head, and a tall
  long-legged woman. Every motion runs 12 seconds on each, with the springs swinging:
  - no NaNs, and no bone past a limit;
  - a foot always on the floor, and none through it;
  - the knees bending the way knees bend, and the hand-made elbows the way elbows bend;
  - the hands never inside the hips at their widest;
  - back exactly at rest when stopped;
  - a GLB, and a VRM mid-crouch, the same as one saved at rest.
    Contact sheets of posed models rendered in Blender were looked over for broken joints, hands in the body
    and feet off the floor.

## Built: makeup of your own

The skin list had made-up copies of other skins: four on the female body (Light, natural make-up; Light,
make-up; Light, violet make-up; Bronzed, make-up) and three on the male (Light, eyeliner; Light, goth make-up;
Light, dark eye make-up), all MargaretToigo's (CC0). Their makeup couldn't be changed or worn on another skin.
Now makeup is painted on any skin, on either body.

- **Layers** (looks.js `MAKEUP_LAYERS`, the look's `makeup`): eyeshadow on the upper lids, eyeliner round both
  lids along the lashes, blush on the cheeks, each `{ colour, amount }` with amount 0 (none) to 1. The lipstick
  is the lip colour as before (`colours.lips`, multiplied over the lips through the 0.1.09 mask), with a
  strength of its own, `makeup.lipstick.amount` (missing: full), which mixes it with the lips it's on.
- **Masks** (`kit/avatar/avatar-makeup-masks.png`, one for both bodies; red eyeshadow, green eyeliner, blue
  blush), made by `scripts/build-3d-avatar-maker-masks.mjs` from the made-up skins themselves:
  - **Bases.** Toigo's made-up skins are MakeHuman's young light skins with their colours graded and makeup
    painted on: the women's on `young_caucasian_female2`, the men's on `young_caucasian_male`, the ginger one
    on Toigo's plain ginger. The script fits each grade (a 3 × 3 colour matrix and offset, by least squares,
    leaving out the most changed texels three times over), so the made-up skin differs from its graded base
    only where the makeup is.
  - **Regions.** The eyeliner skin's two biggest changes are the ovals round the eyes; on the mesh an oval is
    the rim of both lids. The women's skins add a crescent on the upper lid and one on each cheek. The
    dark-eyed men's smudge goes all round the eye, so the eyeshadow is the women's alone.
  - **Each mask** is the mean, over the skins that have it, of how far each texel went from its base towards
    the makeup's colour, so it's full where they agree. Specks are dropped and the edges softened (a 1-texel
    blur for the eyes, 5 for the blush, whose edge showed on the cheek at 2). The eyeshadow stays out of the oval's middle, the blush 6 texels or
    more from the eyes and 12 from the lips.
  - **Both bodies** share the skin layout, and renders of a test picture through the masks put the colours
    in the same places on each: the eyeliner round the lash line of both lids (a little wider on his lower
    lid, as Toigo's eyeliner skin has it), the eyeshadow on the upper lid, the blush on the cheekbones.
- **Painting** (`src/skin.js` `makeupTexel`): blush, then eyeshadow, then eyeliner, each painted over (the
  picture's colour moved towards the layer's by amount × mask). Fitted against the made-up skins, painting
  over matched them better than multiplying for every layer, and it lets a pale or bright colour show on any
  skin; the masks' soft edges and amounts below full let the skin's texture through. Only the 64-texel squares
  a mask touches are repainted. In Node there's no canvas, so the builder colours by vertex without makeup.
- **Presets** (`MAKEUP_PRESETS`): Natural, Classic, Violet, Bronzed, Eyeliner, Goth, Dark eyes. Each was
  fitted to its made-up skin: the colour and amount of each layer that bring the base plus the preset
  closest to it, the lips from the lips' core. The made-up skin's colour grade was taken out first, so a
  preset has the makeup's contrast with the skin and not Toigo's tone (fitted with the grade in, Natural's
  blush came out twice as strong as it looks). Bronzed was fitted as it is, as its base is a different
  painting. A layer that made it no closer is left off: the men's blush was only Toigo's grade.
- **The skins.** The seven made-up pictures left the kit, and MakeHuman's `young_caucasian_female2` came in
  as "Light, smooth" (female), the plain skin the women's were painted on (CC0; every file of it checked). It
  was made as `make_avatar.py` makes a 2048 skin, with the body's shading taken from the kit's other 2048
  female skins and their sources, as the bodies weren't rebuilt. `make_avatar.py` now lists it and not the
  made-up ones. The kit is 1.02 MB smaller (1.21 MB of pictures out; 141 KB of skin and 54 KB of mask in).
- **Old looks** (`MADE_UP_SKINS`): a made-up skin id opens as its plain skin ("light" for the three light
  women's, "bronze" for the bronzed one, "caucasian" for the men's) with its preset's makeup and lipstick,
  unless the look has makeup or a lip colour of its own. Drafts, look files, saved avatars and the AI's design
  (`readDesign`, colours as "#rrggbb") all carry `makeup`.
- **The Skin and eyes tab.** A Makeup group with a preset list and No makeup, then each layer's colours and
  strength (None to Full). Picking a colour while a layer is at none puts it on at its usual strength. The
  nail colour has a group of its own.
- **Checked.** Side-by-side EEVEE close-ups (eye, both eyes, cheek, mouth) of the built models with each
  made-up picture beside its base painted in Node with its preset through the masks, by skin.js's own texel
  code. The regression test checks the makeup fields and their bounds, the old ids, the mask's places (none on
  the lips, no blush on the eyes) and the presets' ranges.

## Underwear of its own (0.1.11)

The maker's code waits for its 0.1.11 release; the packs that use it are Clothes 0.1.01 and Accessories 0.2.01.

- **Pack underwear.** A pack piece in the slot `underwear_top` or `underwear_bottom` (looks.js
  `UNDERWEAR_SLOTS`) goes in the Underwear group's Top or Bottom list (`addPieces`), not on the Clothes tab,
  and the look's `underwear.top` or `.bottom` names it. It's worn as a piece of its own, the innermost layer,
  in place of the body's own underwear mesh. Where its index says `tint` (a grey picture under its parts'
  colours), the Underwear colour dyes it.
- **The contract** stays `format: 1`. New and optional: the two underwear slots, `tint`, and `noUnderwear`
  (below). An older maker leaves the underwear pieces out and ignores the flags, so the Clothes pack says it
  needs 0.1.11. The builder puts underwear in its own bundle (`wardrobe/underwear.pack.png`), at layer 0,
  without underwear hide words, and writes `tint` from packs.json's `tex`.
- **Looks.** `checkLook` keeps a pack's underwear while its pack is uninstalled, as it keeps pieces, and
  `fromPacks` names its pack. It isn't drawn meanwhile; the preview note and the Underwear group say so, and the
  group can take it out of the look. `wornLook` makes it none in a saved file, as it's drawn. A saved file
  credits CC BY underwear (`packCredits`).
- **Underwear under clothes.** `underwear.underClothes`, on unless a look says otherwise (avatar.js `UNDER_CLOTHES`; off until the refit and layering landed, in 0.1.13), the control "Show
  underwear under clothes":
  - On: the body's own underwear stays drawn under every region a piece hides, and the hide words
    `underwear`, `underwear-top` and `underwear-bottom` no longer hide it; a pack's underwear is worn under
    everything. The skin is still hidden under clothes as before.
  - Off: as before. Clothes hide the underwear they cover by those words and by the regions they hide (a pack's
    top under anything that hides the torso, its bottom under anything that hides the hips).
  - Worn on bare skin: a piece that says so (`noUnderwear` in a pack; looks.js `NO_UNDERWEAR` for the kit's
    swimsuit, bikini, swim trunks and bikini armour) leaves off the underwear its hide words name either way.
    Chosen for swimwear, bodysuits, shapewear and the teddy: worn without underwear, and tight enough that it
    would show through. A romper, a babydoll and dresses are worn over underwear.
- **Clipping.** Nothing is fitted around underwear yet, so it can show through tight clothes; the fitting rework
  (each layer clearing the ones under it, underwear as layer 0) is what fixes that. Where it clips today is in
  `docs/MAKEHUMAN-PACKS.md`, "The underwear pass".
- **Pieces.** The merge pass's 19 bras, bikini tops, briefs and bikini bottoms moved to the underwear slots
  without a refit. 10 more were fitted: 8 pieces of underwear and lingerie in Clothes, a lace choker and a feather
  headdress in Accessories (`docs/MAKEHUMAN-PACKS.md`).
- **Checked** in the regression test: pack underwear reads into the lists and not the clothes; bad flags, slots
  and ids are refused; a look with an uninstalled pack's underwear survives `checkLook`, says so, and saves
  without it; the body's briefs are drawn under a skirt with the control on and hidden with it off, a swimsuit
  leaves them off, a pack's briefs show under the skirt or not the same way, and the Underwear colour dyes a
  tintable pack bra.

## Community hair (the kit and the Accessories pack; the maker's version unchanged)

- **What was tried.** The 31 community hair styles whose files don't say AGPL-3, each fitted with
  `make_mh_hair.py` to the bodies it was made for and rendered front, side, back and close at the hairline and
  ears. `docs/MAKEHUMAN-PACKS.md` "The hair pass" lists each one and why it's in or out.
- **The kit (CC0): six bobs.** MargaretToigo's blunt, curled-under and inverted bobs, each with and without a
  fringe (looks.js HAIRSTYLES `bob_blunt` to `bob_inverted_bangs`), on both bodies. They swing as the kit's bob
  does (`SWINGING_HAIR`, 0.03). They're packed in a bundle of their own, `avatar-hair-bobs.pack.png`, so wearing
  the long or short styles doesn't fetch them.
- **The Accessories pack (CC BY 4.0): 14 styles by Elvaerwyn**, 0.2.01. Eleven are for the female body, two for
  both, one for the male. The ten that hang loose have `swing: 0.03`; the two updos, the braided bun and the
  short men's cut stay rigid.
- **Fitting.** `make_mh_hair.py` now fits a pack's styles from `assets/packs.json` (`-- packs`) into
  `assets/models/packs/<pack id>/`, each to its own bodies. It drops faces a vertex twice or repeated
  (`whole_faces`, which elvs_lady_hippy_hair needed), and tucks the bobs' fringe under the main sheet at the crown
  (`tucked_fringe`), where its back edge stood up as a ridge.
- **Left out after rendering (7):** faydaen_hair_1 (flat strips standing off the head), elvs_grump_hair (cards
  standing off), elvs_inverted_curly_bob (the neck shows through at the nape), elvs_micky_afro (faceted, with a
  speckled picture), elvs_reverse_french_braid_bun (smudgy picture, covers an eye), o4saken_chinesebob01 and
  o4saken_long01 (ragged cards at the crown). Four more were too heavy (16k to 123k vertices).
- **Checked** in the regression test: every style the Hair tab offers on a body loads there from its bundle,
  the kit's and the pack's; every kit style in `SWINGING_HAIR` and every pack style with a `swing` rests exactly
  where it was made, swings as the head turns and settles, and the rest have no springs.
- **Sizes.** The bobs' bundle is 4.6 MiB, its pictures 1,024 pixels like the kit's other hair. That puts the
  maker's zip at about 57 MiB when it's next built, from 52.5 MiB (0.1.10). The Accessories pack's zip went from
  13.1 MiB to 25.2 MiB.
- **Not built yet:** the maker itself. Its manifest still lists the 0.1.10 kit, so `validate-catalog.mjs` fails
  on `avatar-hair-index.json` until the next maker build. The pack's `maker` stays 0.1.04: an older maker
  shows its pieces and leaves out the hair.

## Accessories 0.2.03: jewellery, horns, wings and things to hold (packs; two lines of the maker's text)

- **50 new pieces** in `3d-avatar-maker-wardrobe-accessories` (95 in all, 37.7 MiB). They fill the slots 0.1.10
  added, so the pack now needs maker 0.1.10. `docs/MAKEHUMAN-PACKS.md` "Jewellery, body parts and objects" lists
  each item kept and each left out, and why.
  - **Jewellery:** four bracelets and five anklets fixed to the forearm or calf they were made on, four
    necklaces and a spiked collar that bend with the neck, three pairs of earrings, piercings in the left ear,
    piercings in the face (in the Brow slot), and four pieces for the belly.
  - **Body parts:** six horns and antlers, seven pairs of wings fixed to the upper back, two tails fixed to
    the hips.
  - **Things:** a sword, a microphone and a tennis racket in the right hand, a shopping bag in the left; a
    shoulder bag and a sling purse at the hip; an electric guitar on its strap in front, fixed to the middle of
    the back; a headset in the Earrings slot, a head mirror in Brow, a stethoscope in Necklace, and a tactical
    vest for each body in Body armour.
- **Thinning** (`make_mh_packs.py` `decimate`): a piece modelled far finer than needed is fitted whole and
  then thinned to a share of its faces. Each point left takes the shape keys and weights of the fitted point
  nearest it. The bangle went from 18.7k vertices to 3.9k, the ear piercings from 61k, and wings, the purse and
  the vests by half. A piece with no picture of its own can be `tex: plain` in its own `colour`.
- **The maker's text:** the Brow slot now says it takes a band or face piercings, and On the back says a guitar
  on its strap. Both wait for the maker's next release.
- **Left out:** the scuba rig (its `.mhclo` says CC BY-NC-SA), the Care Bears gemstone and the MakeHuman medal
  (named for a brand), the chunky heart chain (23k vertices even thinned), the scruffy beard (a beard belongs on
  the Face tab) and two sets of fingernails (the nails are the Skin tab's own).
- **Checked:** the regression test wears every piece of the pack on each body it's for, and checks that a fixed
  one is bound to its bone alone and that the others bend with the body. It also checks what covers what with
  real pieces: gloves and bracers hide a bracelet, socks an anklet, a scarf the collar, a dress a belly
  piercing, a hat the antlers. Every piece was rendered on both bodies and the fixed ones in the relaxed pose,
  the T-pose and with the head and hands turned. Worn under a vest, a T-shirt, jeans, a sweater and a cap, the
  belly pieces, anklet, necklace, bangle and headset showed no gap in `COVERED_BY`, so it is unchanged.

## Built: clothes that keep their shape

The community clothes looked worse fitted than in their own pictures: a strip torn out of a tiered skirt's
back, lumpy skirts with jagged hems, leggings and socks showing through what's worn over them. What was wrong,
found by rendering each piece as MakeHuman places it beside ours (Blender, EEVEE, front, side, back and close):

- **The helpers were guessed.** Most clothes hang on MakeHuman's helper meshes (the tights, the skirt), which
  our bodies don't have. They were rebuilt from the base mesh's nearest body points, so between the legs a
  skirt's helper followed one leg or the other: the torn strip, there at rest before any pose.
- **Every point was pushed on its own.** Wherever cloth sank into the skin, that point and whole faces were
  lifted, at rest and for each shape key, which left lumps and a crease.
- **Every piece was pushed off the skin by the same 2.5 mm**, so an inner and an outer layer met in the same
  place.

What it does now:

- **Fitted as MakeHuman fits it** (`wwmhclo.py` `Fitted.carried`). A piece is fitted to MakeHuman's own version
  of our body: the same targets on hm08, its helpers moved by them, so it sits exactly where MakeHuman puts it.
  Then it's carried onto our body (stood in the A-pose and smoothed) by how the body near each point moved.
- **Weights and keys from the body near it.** Near the skin, the skin under it; hanging off, a wide, even
  average of the body round it, so a skirt's hem moves as one piece and doesn't split between the legs.
  Cloth that isn't a sleeve or a glove takes nothing from the arms or hands, and a limb's cloth nothing from
  the other limb (but within 3 cm of the middle, where a skirt crosses between the legs, it takes both). The
  moves, weights and keys are then evened out over the cloth a little: between the thighs the body under a
  point switches legs within a centimetre, which had torn a zigzag crease down a pencil skirt's front.
  Vertices split at a texture seam count as one, so no lift opens the seam.
- **Lifted in one swell** (`push_out(smooth=True)`): where cloth still sinks in, the lift spreads and fades over
  about a dozen rings and is smoothed, at rest and for each key. Faces along the skin's normal (a thick
  band's rim) and skin on the hands and feet don't call for a lift: the first were pushed again every round
  and key into flat flaps (the galactic uniform's belt), the second threw a skinsuit's feet into lumps.
- **Layers tucked when worn** (`src/layers.js`, `avatar.js`). The maker wears pieces from the outermost in and
  moves each inner layer's points to 1.5 mm under every layer over it, along the skin's normal, fading the move
  over three edges past its edge. Underwear (the body's styles and any `underwear…` slot) is under everything;
  at the same layer socks are under trousers and a top is over them. Only what's under cloth moves, so a bra
  strap still shows at an off-shoulder neckline and briefs under a skirt.
- **Checked** in the regression test: inner pieces are left nowhere over the pieces worn over them (socks under
  leggings, leggings under a crop top, jeans under a tee, a top under a jacket), and nothing on the legs or feet
  is weighted to the arms.
- **Waists.** A trouser or skirt waist sits where MakeHuman puts it on MakeHuman's version of our body, within
  2 mm, before and after; it wasn't the fitting. The Blender-made trousers, shorts, leggings and skirts sit 10
  to 15 cm higher, at the natural waist (`make_outfit.py` `region_top` of the hips).
- Every kit `mh_*` piece and every pack piece was refitted. `fit: "helpers"` in `assets/packs.json` fits a
  piece the old way.

## Built: new beards and painted hair on the skin

The beards were blotchy patches with hard ragged edges, pale skin showed through them and in a ring round
the mouth, and the dwarf's braided beard read as noise. They're remade, and the skin under any hair is now
painted in the hair's colour.

- **The styles** (looks.js `FACIAL_HAIR`; every id kept, so saved looks and the dwarf preset open as before):
  short and boxed (`beard-01`), full (`beard-02`), long (`beard-03`), the dwarf's long beard with two braids
  (`beard-04`), a goatee with a moustache (`beard-05`), a moustache (`moustache-01`), and mutton chops
  (`beard-06`, new).
- **Cards fanned along the face** (`make_avatar.py` `Beards`, `Hair.sheet`). Each card is a strip about
  3 cm wide whose roots run in a row under the skin, its strands lying down the face and lifting off it
  towards their tips.
  - **Rows.** Seen from a point inside the chin, each row is the skin at one height, so rows run along
    the jaw and round under the chin. Along a row the cards overlap by about a third; each row's tips lie
    over the next row's roots.
  - **Edges.** Three more rows follow the edges that rows at one height leave in steps: the cheek line
    and the lips' edges above and below. That closes the ring round the mouth. A card's strands are
    shorter at its ends and towards the edge of where the style grows, and the cards nearest the edge
    use the texture's sparse band, so the cheek line is soft.
  - **Long beards.** From the jaw line down, long locks lie a little way down the face, then hang, turned
    in towards the middle so the beard narrows to a point. They move with the chin.
  - **Braids.** The dwarf's braids are three solid strands plaited (each crosses over the middle in
    turn), with a tie and a tuft, lying on the beard's front.
  - **The surface hair lies on.** The skin without the mouth's inside. Under the lower lip the mouth's
    inside was nearer than the chin, and hair pushed off it went into the mouth.
- **The texture** (`wwavatar.py` `facial_hair_texture`, 1,024 px): bands the full width of the picture, each
  running on from its right edge into its left, so the cards along a row show no join. There are three bands of short hair
  (dense, thinner, sparse), one of long hair, a braid's strands and a tie. The strands are drawn in locks,
  darker at their sides and roots, so a beard shows locks rather than flecks.
- **Faces.** The beards follow the face keys as before (talking, smiling): each card's column follows the
  skin at its root, and `keep_clear` keeps hanging hair off the chest.
- **Size.** The beards have about 30,000 vertices in all, as before (27,000). The models are 72.4 MB
  (male, from 68.8) and 85.1 MB (female, from 79.0).

### The skin under hair (`src/skin.js`)

- **Masks** (`scripts/build-3d-avatar-maker-masks.mjs`). For each body, three files at 1,024 px,
  `avatar-<sex>-hair-masks-<n>.png`, with three masks each (`HAIR_MASK_FILES`, `HAIR_MASKS`):
  - **Facial hair.** One mask for each style: the skin within a few millimetres of its roots and of the
    hair lying close on it, softened, kept off the lips and the mouth's inside.
  - **The scalp.** One mask for every hair style: where at least about half of the kit's hair styles lie
    on the scalp. The styles all cover the crown and differ mostly at the hairline, so one soft mask
    pulled in from the hairline serves every style, including a pack's, and doesn't need remaking when a
    style is added.
  - **Stubble.** A softer, wider version of the short beard's mask.
- **Painting** (`hairLayers`, `hairTexel`). Under the facial hair worn, and under a hair style while
  nothing hides the hair, the skin is painted towards the hair's colour (72% under a beard, 60% under a
  hair style). This uses the makeup's blend, painting over rather than multiplying, so a dark beard on pale
  skin shows no pale gaps. These layers go on after the lips and before the makeup.
- **Stubble** (looks.js `STUBBLE`, `stubble: { shape, density, colour }`; none unless chosen). It's offered on
  the Face tab beside the beards: light or heavy stubble, a moustache or goatee shadow, or a short beard.
  - **Colour.** Its own, or the hair's (a little darker).
  - **Density.** From sparse to dense.
  - **The look of it.** Painted through the masks with a grain of fine hairs. Each hair is three texels
    down the face, fixed to its place in the skin picture, so stubble reads as short hairs.
- **Checked** in the regression test:
  - the hair masks have their channels, smaller styles inside the full beard's, none on the lips;
  - the blend paints towards the hair's colour as far as the mask says;
  - denser stubble lays more hairs;
  - every beard id still opens;
  - `stubble` is checked and bounded in `checkLook`.

  Contact sheets of every style before and after (brown on pale skin, black on dark, the dwarf, talking and
  smiling, stubble, the scalp, the female body) are in the hand-over note.

## Built: Generate avatar (0.1.14)

The user asked for an avatar made from a character's description or portrait, and then for a second
call that revises it from how it looks now.

- **No server part.** The Engine's `POST /api/generate/raw` (since Engine 2.2.0; Story Writer's client uses
  it too) takes a connection id and chat messages with `images` from the page, so the maker calls it
  directly: no `routes` permission, no restart, and the package stays client only with `ui`. Wanderworld's
  `/look-design` route was the plan; reading Story Writer showed it isn't needed.
- **src/generate.js:**
  - `cardOf(row)`: a card's appearance, description and personality, and its portrait path (only an image
    under `/api/`);
  - `textConnections`: the chat connections from `/api/connections`, names and models only;
  - `designMenu()`: the options from `avatarChoices` for both bodies, each marked when only one body has it
    (sliders, skins, hair, underwear, pieces by slot, packs included; about 16,000 characters with the
    kit alone, 34,000 with both packs). The old one, copied from Wanderworld, is gone from avatar.js;
  - `designMessages`: Generate (a whole look) or Revise (the settings now from `lookForModel`, the user's
    note, and only the fields to change);
  - `designedLook`: the answer through `readDesign`, with a new race brought in as choosing it does
    (`racePreset`), merged part by part;
  - `pictureData`: a portrait or a chosen file shrunk to 768 pixels, as a JPEG;
  - `askModel`: the raw call, with the CSRF header and the admin secret as Wanderworld sends them.
- **Revise** sends `stage.snapshots()`: the whole body (512 by 768) and the face (512 square, straight on),
  drawn on a grey ground and read in the same task, then the user's view is put back.
- **The Generate tab:** off until **Let a model design avatars** is ticked (kept in this browser). It shows
  what each call sends, and offers Stop, Undo and the model's last answer. A call with pictures that fails
  is asked again with the words alone.
- `readDesign` now reads a stubble colour written `#rrggbb`.
- The test page has a stand-in connection and model (`dev/serve.mjs`), which keeps the last request in
  `dev/out/last-design-request.json`.
- Checks: `cardOf`, `textConnections`, the menu (every female piece offered, humans only, under 60,000
  characters), the messages (pictures in order, colours as `#rrggbb`, sliders as made left out), `readJson`
  and `designedLook`.

## Built: what a chat shows, nothing drawn under cloth, cloth the legs carry (0.1.16)

Asked for after trying the animations in the Engine: a creepy Happy face, fingers through the palm, skin and
underwear through clothes, a seated clip with the hands thrown up, legs missing under dresses.

- **What a chat plays.** Marinara Engine's 3D Avatars agent plays no clip. Its `computeBodyPose`
  (`packages/client/src/features/avatars/renderers/vrm/vrm-motion.ts`) turns nine bones from the T-pose: the
  upper arms 1.2 radians down, the elbows 0.25, and a few sines for breath and sway, with a head tilt, nod or
  lean for thinking, listening and talking. `src/motions.js` `chatPose` does the same sums, offered first in
  the Animation list as **In a chat** (waiting, talking, thinking, listening). The fingers stay as the file
  rests them: straight in a VRM.
- **Fingers.** The clips are measured from the library figure's T-pose, fingers straight. `referenceOf` took
  the body's own soft curl as that pose, so every clip curled the fingers that much further, through the
  palm. It now uses `tPose`. (Loosening the clips' fists was tried and dropped: folded arms then press the
  fingers into the chest.)
- **Sitting.** The library's seated talk throws both hands up by the face; the sitting animation leaves it out.
- **Happy and Relaxed.** `FACE_MOVES` in `make_avatar.py`: Happy is the lips drawn back and wide with the
  corners a little up and the eyes hardly narrowed (it was the corners pulled all the way up with the eyes
  half shut). A chat shows these keys at full weight. Both bodies rebuilt and repacked.
- **Nothing drawn under cloth** (`src/layers.js` `coveredBy`, `deepUnder`; `src/avatar.js`). Each layer was
  already tucked under the one over it at rest, but skin and inner layers are weighted to the bones a little
  differently and came through in motion. Now a triangle of the skin, the body's underwear or an inner piece
  isn't drawn (or saved) when all of it lies under an outer piece's cloth within 4 cm along the skin's
  normal, and it is at least two edges in from where that cover ends. Cloth with holes cut by its picture
  covers nothing, and neither does the part of a piece that hangs and swings.
- **Regions.** A cloth piece's `hides` words for the trunk and limbs (neck, torso, hips, upper arms,
  forearms, thighs, calves) no longer hide the whole region: they extend the reach to 8 cm for skin of that
  region under that piece (a robe's sleeve, wide trousers). So the legs under a skirt or dress, a chest in an
  open collar and a bare shoulder stay. Feet, hands and head still go whole, as does anything a piece that
  isn't layered cloth hides. With **Show underwear under clothes** off, the body's own underwear is left off
  whole under a piece that names it or covers the torso or hips, as a pack's already was.
- **Cloth and legs** (`src/hair.js`, `src/springs.js`). With the legs now there under a skirt, the old
  collision showed its limits: eight chains with joint-only collision let a lifted thigh pass between two of
  them. Now:
  - cloth has sixteen chains round;
  - the cloth's colliders are each half of each thigh and calf and each foot, as thick as what's worn there
    (boots, trousers), and the arms and hands;
  - in the preview each cloth joint is kept off the leg it hangs over (`carried`; 0.1.17 settled how), is
    drawn back to how it hangs from the hips, not to its own bone's line, and is tied to the joint at its
    level in the chain beside it (`rings`), so a pushed chain draws its neighbours after it. A VRM app does
    none of the three: it pushes each chain away from the colliders.
- **A motions page** (`dev/motions.js`, `/motions` on the test server): one avatar through every animation
  or face, frame by frame, on a sheet kept in `dev/out/`, with the springs run as the preview runs them.
- Checks: what's covered and how far in; jeans and a tee hide the skin under them and leave the head and
  hands; legs under a long skirt are drawn; the chat stand's arm angle; an open hand in a clip is open; the
  eight leg capsules in a VRM; a skirt still settles within two seconds.

Still rough after 0.1.16: a heavily pleated skirt crumpled when sitting and the thigh showed at the hip
when lifted high. 0.1.17 took those on.

## Built: cloth from the waist, and teeth that sit right (0.1.17)

- **Cloth hangs from the waist** (`src/avatar.js` `HANG_FROM`, `src/hair.js`). A piece's own `hang` said
  where its cloth leaves the body, often well down the thigh; the cloth above that stayed on the hips'
  weights, and a lifted thigh came through it. Every skirt, dress and coat now hangs from the waist (0.3 of
  the thigh's length over the hip joints), or from 3 cm under its own top where that is lower, on the hips'
  bone. A cloak still hangs from the spine bone at its line.
- **Cloth is placed by where it is, not followed along its mesh** (`hangPlan`). Its distance along is how
  far under the line it hangs, as its side is already where it is round the hips. A pleated or gathered
  skirt is many strips joined at few points; a path along the mesh gave neighbouring folds very different
  lengths, so they followed different bones and tore apart when the skirt bent.
- **Rows evened out** (`src/springs.js` `even`). Each joint's drift from where it hangs goes half the way to
  the mean of the joints beside it, twice a frame, before the ties and the legs. A lifted chain raises the
  ones beside it less and theirs less again, so cloth curves over a leg.
- **Clear of the leg, and nothing more.** Where a joint hangs over a thigh or calf it is kept the leg's own
  thickness and 3 cm off its line, the way that leg has turned "out" (forward at rest, up when lifted
  level), no further than it rests, and by the leg's true thickness (`full`), not the collider's, which
  `fitColliders` shrinks where cloth rests on it. 0.1.16 also had cloth near a leg follow it as if fixed to
  it; that dragged a hem 30 cm from a calf along with its kick, and is gone. Each joint answers only to the
  bone it rests beside (within 8 cm of its ends): without that, a seated thigh lifted the hem hanging under
  the knee up over itself and bared the legs.
- **What the leg moves isn't carried on.** Tied cloth carries on each frame only by the step it would have
  taken left alone, so a push by a leg or a neighbour adds no speed and the cloth doesn't fly off the leg.
- **Teeth** (`make_avatar.py` `mouth_parts`, `mouth_texture`). Measured against MakeHuman's own lips: the
  upper teeth's edge sat 1.7 mm up behind the upper lip, the lower teeth's 1.7 mm over the lower lip's, and
  the jaw's opening drops the lower lip 6.6 mm further than the lower teeth. So an open mouth showed a full
  lower row and no upper teeth. The upper teeth are lowered 3 mm, the lower 4 mm, and the lower teeth follow
  the jaw 1.3 times as far in the face's moves. The teeth's grey picture is lifted to ivory, its dark blots
  to soft shadow; the gums stay. Both bodies rebuilt and repacked.
- The motions page draws the face's keys one by one (`keys=aa,oh:0.5`) and has close views of the mouth.
- Checks: a skirt's sixteen chains hang from over the hip joints, and walking, over the thighs, no two side
  by side part by more than 16 cm (about 13 at the most).

## Built: a preview that spares the graphics card (0.1.18)

Reported: graphics card use near 90% with any outfit. Measured on the test page by counting the WebGL calls
of 60 frames, this build against 0.1.15's: the drawing itself was lighter than before (72,000 triangles a
frame against 88,000, the same 12 draws). Two things were wrong, both older than 0.1.16:

- **Drawn at the screen's rate** (`src/stage.js`). The loop drew on every animation frame, 121 a second on
  the test screen, into a 1861 by 1709 picture. It now draws 30 times a second at rest and 60 while the view
  is turned (and for 0.7 s after) or an animation plays, as the Engine draws a chat's avatar at 30.
- **Left on the card** (`src/avatar.js`). Each mesh's skeleton keeps a texture of its bones, which only
  `skeleton.dispose()` frees: six stayed for every avatar built, at each change of a slider. And the weights
  a moving bust gave the body were taken off its geometry before it was disposed of, so their two buffers
  stayed. `figure.dispose` now lets the skeletons go and leaves the bust's weights on. Measured over six
  rebuilds: textures steady at 5 (they climbed from 11 to 41), buffers steady.
- Check: letting an avatar go disposes of every mesh's skeleton, with the bust's weights still on the body.

## Built: a Realistic body beside the other two (0.1.19)

Asked for: the MakeHuman bodies read as semi-real; switch to a more realistic base, the body first, its
strand hair kept to see how it turns out, nude skin for now, and the current bodies set aside as a backup.

The base is Vitruvian for CharMorph (CC0; Sean Buckley, on Olaf Delgado-Friedrichs' Antonia Polygon), read as
data. It comes in as a third body, `realistic`, built by its own code (`src/realistic.js`), so the Male and
Female bodies and everything fitted to them are untouched: that is the backup, and it still works.

- **The model** (`assets/scripts/make_realistic.py`). One mesh of 37,436 vertices. The character's own
  game-rig weights (76 bones: five in the spine, twist bones, a palm bone a finger) are gathered onto the
  maker's bones; its joints are weighted means of vertices, so each slider's move of every joint is worked
  out and kept (`jointMoves` in the packed file), and the skeleton follows the shape. Each eyeball is whole
  on a bone of its own. The face's 13 moves are mixes of its 149 face shapes; 39 of its 150 morphs are
  sliders (`SLIDERS`), one key each, two-way where the character's own list says so.
- **Skin and eyes.** Its 4K EXR tiles become four skin parts (head, torso, arms, legs), each a light and a
  dark picture, a normal map made from its height map, and a roughness map raised from the character's (as
  it has it the skin looks wet in plain shading). The maker blends light and dark on a canvas by the tone
  slider. The eye's clear front is the alpha of its sclera picture: those faces are a part of their own,
  drawn black and 30% solid, which keeps a glint. Between the legs the pictures were blurred to plain skin (0.1.20 paints underwear there instead).
- **Hair.** Each strand style is Blender particle hair on a copy of the body. The script turns the style's
  own strands and a few of Blender's copies round each into about 4,500 flat ribbons (85,000 to 100,000
  triangles), with a cap of the scalp near the roots, fading at its edge. In the maker each strand moves
  whole with the skin under its root, so hair stays on a head the sliders reshape. Brows are Mindfront's
  strands as ribbons, tied to the skin under them for the sliders and the face's moves.
- **In the maker.** `createAvatar` hands a `realistic` look to `createRealistic`, which gives back the same
  figure the stage, face, motions and exporter work with. A first build takes about 0.7 s, each one after
  about 30 ms. The exporter keeps a part's own normal map, roughness and see-through. The panel swaps in the
  body's own Body, Face, Skin, Hair and Clothes tabs.
- Left out for their authors' terms to be checked first: the Combover (zoro_d) and Scene hair (O4saken) styles.
- Check: the lists and the file agree on every slider and face move; a look keeps its fields within range;
  the figure has every VRM bone, stands on the floor and takes the T-pose; a male build is wider in the
  shoulders and longer legs move the joints; hair and cap stay on the head under four builds; every style
  loads; a GLB and a VRM save, the VRM read by three-vrm with every expression.

Still to do on it, in the order asked: eyelashes; eye colours; more skins and makeup; clothes and underwear
refitted to it; hair that swings; the two hair styles left out; the rest of the morphs as sliders.

## Built: painted underwear on the Realistic body, and a switch for it (0.1.20, recut in 0.1.21)

Asked for: a switch for the blurred skin, the same for the nipples on a female build; covered to start with,
as simple underwear thin enough never to clip, perhaps just painted black; the switch takes it off. Then:
make it look like actual underwear, panties for a female build and boxer briefs for a male one.

- **Painted on the skin's pictures** (`make_realistic.py` `write_textures`). For each texel of the torso and
  legs tiles the script works out where on the body it is (`place_map`: the base shape's points across each
  UV triangle, run a few texels past each island's edge so no skin shows along a seam). Each garment is a
  region of the body in metres, given as how deep inside it a place is, with its lighter trim:
  `panties` (cheeky: under a waist line, above a leg line that starts just under where the legs meet, at
  0.828 m on the base shape, and rises to the hip, straight up the groin's crease in front and in a curve
  across the buttocks behind that leaves their lower part bare; below that line is thigh, which 0.1.20
  painted); `bra` (strapless: a cup over each breast hung on the bust's furthest point forward, dipping
  between them, a band all the way round, and one lower edge 4.4 cm under that point, close under the
  breasts; 0.1.20's had straps and sat 7 cm under); `boxer_briefs` (a wide elastic, legs a hand's width
  down the thigh, and the
  two seams that shape the front). Inside one, the colour becomes dark cloth, the relief is smoothed and
  the roughness raised. Being the skin's own picture, it moves with every slider and pose and cannot clip.
- **Three ways** for the torso and the legs (bare, `-female`, `-male`), each a light and dark colour, a
  normal map and a roughness map: 16 more pictures, about 0.7 MB.
- **In the maker** (`realistic.js` `coverOf`): covered unless the look has `realBare`; the female set on the
  female side of the first slider (0 and up), the male set below. A tick box on the body's Clothes tab. The
  bare pictures are the model's own, with nothing blurred: the blurred patch of 0.1.19 is gone.
- Check: each build takes the pictures its cover names, nothing is painted on the head or arms, and the kit
  has every one of them.

## Built: a painted scalp under the Realistic body's hair (0.1.22)

Reported, with a picture: from some angles skin shows between the strands, and a blocky patch at the temple.
The patch was the scalp cap of 0.1.19: a lifted copy of the scalp's faces near the roots, see-through at its
edge, which is as coarse as the mesh and covered only the skin near a root.

- **A picture of where each style grows** (`make_realistic.py` `scalp_paint`). For every texel of the head's
  skin picture (its place on the head from `place_map`), whether it lies within 4.5 mm of a strand's root;
  then gaps between roots up to 18 mm wide are closed (grown by 9 mm and shrunk by as much, which keeps the
  outline). A first version painted all the scalp a strand passed over, to 2 cm: that ran past the hairline
  onto the forehead and sideburns, and was reported. 512 pixels, the cover in its alpha, about 8 KB each.
  0.1.23 pulls it 9 mm in from the hairline and feathers it: along a hairline the hair is combed away from
  its roots, so the first strip inside the line showed as a painted band (reported, with a picture).
- **Painted by the maker** (`realistic.js` `skinMap`, `paintsOf`). The head's skin picture is drawn on a
  canvas: the tone's blend, then the hair's colour at 62% brightness kept only where the style's picture
  says. `skinMap` now takes a list of such paints (a mask, a colour, a strength), which makeup and the like
  can use next. The cap's mesh, material and picture are gone; a hair file is one mesh.
- Check: each style's scalp picture is in the kit. On the test page the head is drawn from the side, above
  and behind (`view=head-side`, `head-top`, `head-back` on the motions page).

## Built: Generate on the Realistic body (0.1.23)

Reported: Generate on a Realistic avatar swapped it for the old body. That was by design in 0.1.19 (a design
chose from the other bodies' lists); it now has a menu of its own.

- `generate.js` `designMenu(body)` gives `realisticMenu()` for that body: its height, every slider of
  `REALISTIC_SHAPES` with its range and ends, the skin tone, the hair styles and the hair's colour.
- `looks.js` `readRealisticDesign` reads an answer as `REALISTIC_FIELDS` alone, each through `checkLook`;
  whatever else the answer names (a body, clothes) is dropped. `designedLook` keeps the body and lays the
  sliders on part by part; `lookForModel` shows the model those fields only when revising.
- A field this body gains (eye colour, makeup) is added in three places: `REALISTIC_FIELDS`, `realisticMenu`
  and `checkLook`.
- Check: the menu lists every slider and style and no clothes; a design naming another body and clothes
  leaves the Realistic body with only its own fields set.

## Built: eyes, brows and lashes on the Realistic body (0.1.24)

Asked for: eye colours and eyelashes, as the first of the body's own customizing.

- **Eyes.** `make_realistic.py` writes the character's iris with its colour taken out (`grey_iris`,
  `realistic-iris-grey.webp`, in `assets/` only); the packer lays it beside the middles of the 24 eye pictures
  of `EYE_PICTURES` in one picture, `kit/avatar/realistic-eyes.webp` (5 by 5 tiles of 256 pixels; ffmpeg
  xstack). The iris's texture coordinates are fitted to a disc once (`discOf`, `IRIS_FIT`) and moved into the
  look's tile (`irisUvs`): `eyePicture` names a picture, else the grey tile takes `colours.eyes` as the
  material's colour (`TINT_BRIGHT` times over, as the grey is dark). The pupil's faces take the iris
  picture's coordinates too.
- **Brows.** Each of the character's 14 styles is a file of its own (`realistic-brows-<nn>`, `-- brows` in
  the script); `realBrows` picks one, the 11th unless told. `colours.brows` colours them, else the hair's
  colour a little darker.
- **Lashes.** The character's lash system is empty, so `lashes_of` grows them: a lid's edge is found from
  the blink (across the eye in steps, of the skin a blink brings down nearly furthest, the lowest and furthest
  forward is the upper rim's front; where that lands when shut is the lower lid's edge). 110 upper and 46
  lower an eye, each two crossed ribbons, a piece of the body's file.
- **Ties.** `strandTies` ties every point of a strand to the head's skin under the strand's root, so hair,
  brows and lashes move whole with what they grow from, under the sliders and the face's moves. In the kit a
  ribbon's `v` is 1 at the root (glTF turns Blender's over): until this release the ties and the root-to-tip
  shading read it the other way, so a lash followed the skin under its tip and didn't shut with the lid.
- New fields are in `REALISTIC_FIELDS` (`realBrows`, `eyePicture`, `colours` as `REALISTIC_COLOURS`),
  `realisticMenu` and `checkLook`.
- Check: the regression test has the lashes come down as far as the lid in a blink, every brow style over the
  eyes, a brow colour on brows and lashes, and the eye tiles. On the motions page, `view=eyes` and
  `eyes-side` draw the eyes close up.

## Next, in order

1. **Check it in a real Engine:** a VRM and a GLB imported under 3D Avatars, talking, feeling, looking, and
   the hair swinging.
2. **Smaller saved files.** three's exporter writes each face key for every vertex of the body; sparse
   accessors (only the vertices a key moves) would take a few megabytes off each file. A VRM thumbnail
   picture in the meta.
3. **Faces on what's worn.** Hair, hats, masks and other clothes don't follow the face's keys yet (a face
   mask doesn't open with the mouth); the maker could carry them from the skin as it does the sliders.
4. **More expressions.** Visemes beyond VRM's five vowels, a wink and a smirk as custom expressions.
5. **Colliders that allow for what's worn:** a cloak over a dress swings on its own chains through the
   dress's, and hair passes into a thick cloak.
6. **More to change:** a grip for a hand that holds something (the sword, microphone, racket and bag sit in an
   open hand, and the guitar's neck floats where a hand would hold it); a held piece for the other hand (each is
   fitted for one); skin texture layers (freckles, scars, tattoos) painted as the makeup is; patterns and
   pictures on clothing; more face sliders.
7. **Generate avatar, tried on real models.** Check how well a few connections (with and without sight)
   follow the menu, and tune the instructions or the menu's wording from what they get wrong.
8. **Anime style.** A head for each body built for it, eye pictures, a hair set, flat shading with an
   outline (MToon, VRM only). The body below the neck and all clothing are shared.

## Known rough edges

- The Realistic body: the lashes keep their open-eye angle on a shut lid (they move with it but don't turn); long hair passes through a body made much heavier than the one it was
  styled on; the hairline is a cap with a soft edge, which shows as a band where a style is swept back from
  it; the eye's clear front is drawn 30% solid, so the iris is a little darker than its picture.

- The Ranger outfit's leather armour shows gaps at the front on the male body.
- Seen close from below, the upper teeth's shading changes in steps (each face takes one of three copies of
  the picture). From a chat's distance it reads as the mouth's shadow.
- A saved file has one picture for each piece worn. Packing them into one would make it smaller.
- Hanging cloth is carried by the legs at its chains' joints only, and the cloth between two joints is as
  flat as its mesh makes it. The kit's own Long skirt, Dress and Tunic are made of few, large panels, so a
  lifted thigh still cuts through one however well its chains are carried; the packs' finer skirts and
  dresses don't. In a deep crouch a knee can come through a long skirt. Seated, the back of a skirt hangs
  through the seat, which isn't there. Two hanging pieces (a cloak over a dress, the kit's tunic over its
  long skirt) pass through each other.
- A saved VRM in another app swings a skirt on plain springs: the leg pushes each chain aside, and comes
  through between them. In a chat the legs don't move, so it doesn't show there.
- In a chat a VRM's fingers are straight (the Engine turns no finger bone), so the hands look stiff.
- The bust sways only a couple of millimetres in the Moving pose, as nothing in it bounces the body up and
  down. A VRM app that walks or jumps shows more.
- Swinging hair can dip about 2 cm into the shoulders, where a lock resting on a shoulder leaves out that
  shoulder's collider. The colliders fit the body, not what's worn, so hair can pass into a thick cloak.
- The sides of a long style are found from the mesh, so a chain can follow an uneven path, and the two sides
  of a symmetrical style can get chains of different lengths.
- A hand that holds something stays open, as the maker has no grip pose yet. A held piece is fitted for one
  hand; the other hand needs a piece of its own. In the relaxed pose the sword's blade and the racket's head
  cross the front of the thigh, as they were modelled pointing forward from an A-pose hand.
- A bracelet or anklet is made for the wrist or ankle its maker modelled it on (the bangle the right, the others
  the left).
- Slots cover slots, not regions: sandals and tall boots alike leave an anklet on, and a crop top and a
  T-shirt alike leave a belly piercing on (where the shirt is drawn over it).
- The animations know the body's bones, not what's worn: an arm can brush a bulky sleeve or armour. Long
  hair trails out as the body turns, sits or crouches, as its springs are soft. The seat, the phone and the
  cup the clips mime aren't shown, and the clips' fingers can close on nothing.
- Underwear shown under clothes pokes through many clothes until the fitting allows for it, the kit's everyday
  tee, jeans and trousers among them, which is why the setting started off until 0.1.13.
  The suspender belt is a Belt piece, so a skirt doesn't hide it.

- Layers are tucked as the avatar stands. Posed, each layer bends with its own weights, so near a bending
  joint an inner layer can still come through by a millimetre or two.
- A tucked layer may sink under the skin where it's under cloth. Under a see-through outer piece (lace) the
  skin would show there instead of the layer.
- The Blender-made trousers, shorts, leggings and skirts sit at the natural waist, 10 to 15 cm above where
  the MakeHuman ones do.
- On the heavy, muscular build, trouser legs still meet where the thighs press together, as the old fit did.
- Thick bands round a sleeve can still flare on the heavy build: the galactic warrior uniform's elbow bands
  do, so it stays out of the Clothes pack.
- Full skirts hang a little narrower than in MakeHuman's pictures, where the legs stand apart.
- Drafts live in the browser only.
- Makeup presets match their old skins' makeup but not every skin's tone: Toigo graded each made-up skin's
  colours, the goth one much paler all over, and a preset paints only the face. An old male made-up look now
  follows its age's light skin, where the made-up picture was a young one at any age. The lipstick multiplies
  over the lips, so it can't be brighter than the lips it's on (the Classic red is a little duller).
- The eyeshadow and blush go only where Toigo painted them; there's no lower-lid smudge or contour layer.
- `avatar.js` still carries the anthro code paths and a crowd's low-detail triangle lists.
