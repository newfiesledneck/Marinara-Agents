# 3D Avatar Maker

Build a 3D avatar for a character or persona inside Marinara Engine, with no other software. Choose a body,
shape it, pick skin, eyes, hair and clothes, and save the result as a file the **3D Avatars** agent shows
in your chats.

Alpha. The avatar's face doesn't move yet: in a chat it stands, breathes and nods while it talks. Blinking,
mouth shapes and expressions are the next thing being built (see [the plan](docs/PLAN.md)).

## Use it

1. Install **3D Avatar Maker** from **Agents → Agent Organizer**. It needs no restart.
2. Open **Home → 3D Avatar Maker**.
3. In **For**, pick the character or persona the avatar is for, or leave it on a free draft.
4. Work through the tabs: **Body**, **Face**, **Skin and eyes**, **Hair**, **Clothes**. Drag the picture to
   turn the avatar, scroll or pinch to zoom, and use **Whole body** and **Face** to jump between views.
5. On the **Save** tab, select **Save as GLB**.
6. Open **Agents → 3D Avatars**, pick the same character or persona, choose **GLB or FBX model** under
   **Avatar type**, and select **Import GLB or FBX** with the file you saved.
7. Turn on **Show this avatar in chats**, and add 3D Avatars to the chat under **Chat Settings → Agents**.

The maker never writes to your characters, personas or the 3D Avatars agent. An avatar leaves it only as a
file you save, and you import that file yourself.

## What you can change

| Tab | Choices |
| --- | --- |
| Start | A ready-made look to begin from, a new male or female avatar, or a style (semi-real, or anime proportions) |
| Body | Body, age, height; a race preset (human, dwarf, halfling, gnome, elf, half-elf, half-orc, tiefling) and six race sliders to mix; eight build sliders; arms, legs, torso and hips, and her bust in detail; arm and leg length, head size |
| Face | The face's overall shape with face-outline presets; eyes, brows, nose, mouth, jaw and chin, cheeks, ears, and forehead and head in detail (66 sliders), each part with ready-made shapes; brow and lash style; accessories anyone can wear: beards, tusks, horns, a tail |
| Skin and eyes | 32 skin pictures (MakeHuman's nine in three ages, and 23 more) or a colour of your own; 24 pictured eyes or a colour; nail length and toenails; lip and nail colours |
| Hair | 14 styles in any colour |
| Clothes | Underwear, ready-made outfits, and 78 pieces of clothing and armour worn one to a place, each part in its own colour, plus the clothes of any wardrobe packs you install |

Every slider's middle is the body's own shape, and each control says what it changes.

## Wardrobe packs

More clothes come as separate packages you install from the catalog, such as 3D Avatar Maker: Everyday
Women's Clothes and 3D Avatar Maker: Everyday Men's Clothes and Suits. The maker finds the installed packs
when it opens (reload it after installing one) and lists their clothes in the Clothes tab, each with a line
saying which pack it's from and who made it. It only reads a pack's files as data. A pack made for an older
body is left out. If a pack piece is credited (CC BY), a saved avatar wearing it carries the credit.

## Keeping your work

- **Drafts.** The maker remembers the avatar you were making for each character or persona in this
  browser. A draft is a convenience: it is lost if the browser's site data is cleared, and it isn't on your
  other devices.
- **Save the look (.json).** A small file with every choice. **Open** reads it back.
- **Save as GLB.** The avatar itself. The file also holds the look, so **Open** can read a saved avatar
  and carry on editing it.

## The saved file

A `.glb` (binary glTF) with everything inside it: the skeleton, the meshes that are drawn, standard
materials and the pictures. Typical files are 5 to 10 MB. **Picture size** on the Save tab makes a smaller
file for phones. The bones use the Unreal mannequin's names, which the 3D Avatars agent and most 3D tools
recognise, and the avatar rests in an A-pose.

## Works without AI

Everything here runs in your browser from the package's own files. Nothing is sent to an AI model or to
any outside service. Designing an avatar from a description or a portrait with a model you choose is
planned as an optional extra, off unless you turn it on.

## Credits and licence of what you make

The body, hair, skin, eye and clothing files are public domain (CC0 1.0), so an avatar you save is yours to
use and share however you like, with no credit required:

- The bodies' base mesh and shapes, the skins, eyes, eyebrows and eyelashes, ten of the hair styles and
  the modern clothes are from [MakeHuman](http://www.makehumancommunity.org/) (CC0), used as data.
- Extra face and body shapes, 23 more skins, 15 more eye pictures, the nails and six brow and lash styles are from MakeHuman's community packs
  (CC0), by Elvaerwyn, jujube, habanero, RehmanPolanski, Mindfront, callharvey3d, skalldyrssuppe,
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
  Avatars agent loads a GLB.
- Test: `node tests/3d-avatar-maker.regression.mjs`.
- Wardrobe packs: fitted by `assets/scripts/make_mh_packs.py` from `assets/packs.json`, built by
  `node scripts/build-3d-avatar-maker-packs.mjs`. The test page serves the repo's `packages/3d-avatar-maker-*`
  packs as if installed.
- [AGENTS.md](AGENTS.md) has the rules for changing the models; [docs/PLAN.md](docs/PLAN.md) has what's
  built and what's next.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
