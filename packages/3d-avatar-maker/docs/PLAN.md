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

At the same time, and on the same springs: each breast has a short spring bone, as VRoid models do, so the
chest sways a little as the body turns (`src/bust.js`).

- **Who gets it.** Her body always. His only when his chest stands out in front of the breastbone as far as
  her bust does at its flattest (`BUST.least`, 1.6 cm). His chest is 0.8 cm as built and 1.3 cm at the
  fullest Chest slider. The half-orc slider with a full chest reaches 1.8 cm and gets one; no other slider
  mix tried did.
- **The bones.** `breast_l` and `breast_r` under the upper chest, from 7 cm inside each breast to its front,
  each with a tip there, placed from the body as shaped.
- **Weights.** Round each front, a share of a point's upper-chest weight goes onto its side's bone: all of it
  within 3 cm, none past 8.5 cm, eased between. Only the upper chest's weight moves, as it is the bones'
  parent, so with the bust at rest the body bends exactly as before. A point with four weights already
  gives up its smallest only if that's under 0.05; dropping more made a T-shirt sink 6 mm into the skin as
  the arms moved.
- **Clothes follow.** Every piece but hair and bone-fixed pieces takes the share of the skin nearest it, so
  a top and the breast under it move together.
- **Settings** (`BUST_JOINT`). Stiffness 1.5, no gravity (it rests as shaped), drag 0.45, and no colliders,
  so the arms never push it. It sways about 2 mm in the Moving pose and settles within a second.
- **Checked** in the regression test: rest exact on the skin and the top with whole weights, a few
  millimetres of sway, settling, a T-shirt and a dress staying outside the skin as it sways (the bust adds
  under 0.1 mm), his chest with none as built or muscular, and one at the half-orc's full chest. A GLB keeps
  the bones and a VRM writes the springs.


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

## Underwear of its own (for 0.1.11, not released yet)

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
- **Underwear under clothes.** `underwear.underClothes`, off unless a look says otherwise for now (avatar.js `UNDER_CLOTHES`; to be on once the refit clears underwear), the control "Show
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
6. **More to change:** the community objects, jewellery, horns, wings, tails and hair styles fitted into
   packs for the new slots; a grip for a hand that holds something; skin texture layers (freckles, scars,
   tattoos) painted as the makeup is, patterns and pictures on clothing, more face sliders.
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
- Hanging cloth is kept out of the legs at its chains' joints only. Between them, at a lifted knee, the cloth
  can cut a little into the thigh. Two hanging pieces (a cloak over a dress) swing through each other.
- The bust sways only a couple of millimetres in the Moving pose, as nothing in it bounces the body up and
  down. A VRM app that walks or jumps shows more.
- Swinging hair can dip about 2 cm into the shoulders, where a lock resting on a shoulder leaves out that
  shoulder's collider. The colliders fit the body, not what's worn, so hair can pass into a thick cloak.
- The sides of a long style are found from the mesh, so a chain can follow an uneven path, and the two sides
  of a symmetrical style can get chains of different lengths.
- A hand that holds something stays open, as the maker has no grip pose yet. A held piece is fitted for one
  hand; the other hand needs a piece of its own.
- Slots cover slots, not regions: sandals and tall boots alike leave an anklet on, and a crop top and a
  T-shirt alike leave a belly piercing on (where the shirt is drawn over it).
- The animations know the body's bones, not what's worn: an arm can brush a bulky sleeve or armour. Long
  hair trails out as the body turns, sits or crouches, as its springs are soft. The seat, the phone and the
  cup the clips mime aren't shown, and the clips' fingers can close on nothing.
- Underwear shown under clothes pokes through many clothes until the fitting allows for it, the kit's everyday
  tee, jeans and trousers among them, so the setting starts off for now.
  The suspender belt is a Belt piece, so a skirt doesn't hide it.
- Drafts live in the browser only.
- Makeup presets match their old skins' makeup but not every skin's tone: Toigo graded each made-up skin's
  colours, the goth one much paler all over, and a preset paints only the face. An old male made-up look now
  follows its age's light skin, where the made-up picture was a young one at any age. The lipstick multiplies
  over the lips, so it can't be brighter than the lips it's on (the Classic red is a little duller).
- The eyeshadow and blush go only where Toigo painted them; there's no lower-lid smudge or contour layer.
- `avatar.js` still carries the anthro code paths and a crowd's low-detail triangle lists.
