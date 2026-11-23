# 3D Avatar Maker

Build a 3D avatar for a character or persona inside Marinara Engine, with no other software. Choose a body,
shape it, pick skin, eyes, hair and clothes, and save the result as a file the **3D Avatars** agent shows
in your chats.

Alpha. In a chat the avatar blinks, moves its mouth as it talks and shows how the character feels; in a
VRM the eyes move and long hair swings too. What's built and what's next is in [the plan](docs/PLAN.md).

## Use it

1. Install **3D Avatar Maker** from **Agents → Agent Organizer**. It needs no restart.
2. Open **Home → 3D Avatar Maker**.
3. In **For**, pick the character or persona the avatar is for, or leave it on a free draft.
4. Work through the tabs: **Body**, **Face**, **Skin and eyes**, **Hair**, **Clothes**. Drag the picture to
   turn the avatar, scroll or pinch to zoom, and use **Whole body** and **Face** to jump between views. The
   **Face** list under the picture plays the face's moves: blinking and looking at you, talking, or one
   expression held. In the pose list, **Moving** turns the head now and then, to show the hair swing.
5. On the **Save** tab, select **Save as VRM** (or **Save as GLB**).
6. Open **Agents → 3D Avatars** and pick the same character or persona. Under **Avatar type**, choose
   **VRM model** and select **Import VRM** with the `.vrm` you saved. For a `.glb`, choose **GLB or FBX
   model** and select **Import GLB or FBX**.
7. Turn on **Show this avatar in chats**, and add 3D Avatars to the chat under **Chat Settings → Agents**.

The maker never writes to your characters, personas or the 3D Avatars agent. An avatar leaves it only as a
file you save, and you import that file yourself.

## What you can change

| Tab | Choices |
| --- | --- |
| Start | A ready-made look to begin from, a new male or female avatar, or a style (semi-real, or anime proportions) |
| Body | Body, age, height; a race preset (human, dwarf, halfling, gnome, elf, half-elf, half-orc, tiefling) and six race sliders to mix; eight build sliders; arms, legs, torso and hips, and her bust in detail; arm and leg length, head size |
| Face | The face's overall shape with face-outline presets; eyes, brows, nose, mouth, jaw and chin, cheeks, ears, and forehead and head in detail (66 sliders), each part with ready-made shapes; brow and lash style; accessories anyone can wear: beards, tusks, horns, a tail |
| Skin and eyes | 30 skin pictures (MakeHuman's nine in three ages, and 21 more) or a colour of your own; 24 pictured eyes or a colour; nail length and toenails; lip and nail colours |
| Hair | 14 styles in any colour, and any styles a wardrobe pack adds. Long, ponytail, braid, bob and angled bob swing as the avatar moves, and so do a pack's long styles |
| Clothes | Underwear, ready-made outfits, and 78 pieces of clothing and armour worn one to a place, each part in its own colour, plus what any wardrobe packs you install add. Glasses, a face mask, earrings, rings and socks have places of their own, which the Accessories pack fills. Horns or antlers, a necklace, the wrists, the belly, the ankles, a tail, the back (wings, a guitar on its strap), the hip and each hand have places of their own too, which the Accessories pack fills as well. Something held in a hand and horns are fixed to the hand or head, so they move with it and never bend |

Every slider's middle is the body's own shape, and each control says what it changes.

## Wardrobe packs

More clothes come as two separate packages you install from the catalog: 3D Avatar Maker: Clothes (178
garments: dresses, suits, tops, trousers, skirts, underwear, swimwear and shoes) and 3D Avatar Maker:
Accessories (95 pieces: hats, helmets, glasses, masks, jewellery, gloves and socks, horns, wings, tails and
things to hold or carry). Both are mostly CC BY. They
replace the earlier Everyday Women's, Everyday Men's, Historical and Fantasy, and Modern Casual packs, keeping
every piece's name, so a saved avatar still finds its clothes. The maker finds the installed packs when it opens (reload it after
installing one) and lists their clothes in the Clothes tab, each with a line saying which pack it's from and
who made it. A pack can add hair styles to the Hair tab the same way. It only reads a pack's files as data. A
pack made for an older body is left out. If a pack piece or hair style is credited (CC BY), a saved avatar
wearing it carries the credit. Gloves hide a ring and socks hide the toenails, as gloves and shoes hide the
nails. Gloves and bracers hide bracelets, socks and greaves hide anklets, a scarf hides a necklace, and a hat,
hood or helm hides horns.

If you uninstall a pack, a draft or look file that wore its pieces keeps them. The maker says which pieces
aren't shown and which pack to install again, and they're worn again once it's back. A saved VRM or GLB has
only what's worn.

## Keeping your work

- **Drafts.** The maker remembers the avatar you were making for each character or persona in this
  browser. A draft is a convenience: it is lost if the browser's site data is cleared, and it isn't on your
  other devices.
- **Save the look (.json).** A small file with every choice. **Open** reads it back.
- **Save as VRM** or **Save as GLB.** The avatar itself. Either file also holds the look, so **Open** can
  read a saved avatar and carry on editing it.

## The saved file

Both files are binary glTF with everything inside them: the skeleton, the meshes that are drawn, standard
materials and the pictures. Typical files are 5 to 10 MB. **Picture size** on the Save tab makes a smaller
file for phones. The bones use the Unreal mannequin's names.

Both carry the face's moves as shape keys named the way VRM names its expressions: `blink`, `blinkLeft` and
`blinkRight`; the mouth shapes `aa`, `ih`, `ou`, `ee` and `oh`; and `happy`, `angry`, `sad`, `relaxed` and
`surprised`. The 3D Avatars agent finds them by those names. The mouth opens on teeth and a tongue, and each
eye turns on a bone of its own (`eye_l`, `eye_r`). Hair that hangs loose has chains of bones down its locks
(`hair_back_0` to the tip, one chain for each side of the head it hangs from). Standing still, it rests as
it was made.

- **VRM** (`.vrm`, VRM 1.0) is the avatar format VRoid Studio, VSeeFace and the 3D Avatars agent's **VRM
  model** read. The avatar rests in a T-pose, and the file names its humanoid bones, so any VRM app can pose
  it. Its expressions are bound to the face's keys, and its eyes look about on their bones. Hanging hair and a
  tail swing on spring bones, and colliders fitted to the body keep them out of the head, neck, shoulders,
  arms and back. The file carries the terms you set under **The VRM's terms** on the
  Save tab: your name as the author, who may use the avatar, commercial use, sharing and changes, credit,
  and four uses VRM forbids unless allowed. They start at VRM's most careful choices, and the maker keeps
  yours in this browser for the next avatar. While the avatar wears a CC BY pack piece, the file asks for
  credit and names that piece's maker, whatever you chose.
- **GLB** (`.glb`) is a plain 3D model resting in an A-pose, for the 3D Avatars agent's **GLB or FBX model**
  or any 3D tool.

## Works without AI

Everything here runs in your browser from the package's own files. Nothing is sent to an AI model or to
any outside service. Designing an avatar from a description or a portrait with a model you choose is
planned as an optional extra, off unless you turn it on.

## Credits and licence of what you make

The body, hair, skin, eye and clothing files are public domain (CC0 1.0), so an avatar you save is yours to
use and share however you like, with no credit required:

- The bodies' base mesh and shapes, the skins, eyes, eyebrows and eyelashes, ten of the hair styles and
  the modern clothes are from [MakeHuman](http://www.makehumancommunity.org/) (CC0), used as data.
- Extra face and body shapes, 21 more skins, 15 more eye pictures, the nails and six brow and lash styles are from MakeHuman's community packs
  (CC0), by Elvaerwyn, jujube, habanero, RehmanPolanski, Mindfront, skalldyrssuppe,
  onlytheghosts, toigo, flower-angel, ken1138, bobby_03, Nyloseth, Hatshj and spamrakuen.
- The races' shapes and parts, four hair styles and the fantasy clothing and armour were made in Blender
  by ThatOneCan, who also fitted the nails and baked the new brows and lashes; all released as CC0 1.0 too.

[kit/CREDITS.md](kit/CREDITS.md) lists each file. The package's code is under the repository's licence, and
its bundle includes [three.js](https://threejs.org/) (MIT).

3D Avatar Maker began from the avatar built for Wanderworld, another package in this repository, and keeps
its own copy of those files and code. A look saved from Wanderworld's Look card opens here.

## For developers

- Source: `src/` (bundled into `client.js` by `node scripts/build-3d-avatar-maker-package.mjs`).
- Test page outside the Engine: `node packages/3d-avatar-maker/dev/serve.mjs`, then open
  `http://127.0.0.1:5197/`. `/viewer?file=/dev/out/last.glb` loads a saved file the way the Engine's 3D
  Avatars agent loads a GLB, and a `.vrm` the way it loads a VRM model.
- Test: `node tests/3d-avatar-maker.regression.mjs`.
- Wardrobe packs: fitted by `assets/scripts/make_mh_packs.py` from `assets/packs.json`, built by
  `node scripts/build-3d-avatar-maker-packs.mjs`. The test page serves the repo's `packages/3d-avatar-maker-*`
  packs as if installed.
- [AGENTS.md](AGENTS.md) has the rules for changing the models; [docs/PLAN.md](docs/PLAN.md) has what's
  built and what's next.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
