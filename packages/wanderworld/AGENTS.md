# Wanderworld package rules for coding agents

These rules apply to changes under `packages/wanderworld/`. They add to the repository rules in the root
`AGENTS.md`, `.github/agents/chai-workflow.md` and `CONTRIBUTING.md`; they do not replace them. What the
game does and how it's built is in `README.md` and `docs/CONCEPT.md`.

Unlike other packages' `server.mjs`, Wanderworld's is hand-written source, not a generated bundle: edit it
directly. The build only syntax-checks and copies it, and `npm run check` lints and formats it.

## Making 3D models in Blender

New creatures, characters and other models are made in Blender by a Python script, run headless from
the command line, not built out of primitive shapes in the game's code. (`src/bestiary.js` builds the
older code-made monsters; it stays as the fallback for any kind without a Blender model.)

### Where things go

| Path                                      | What                                                              | In git |
| ----------------------------------------- | ----------------------------------------------------------------- | ------ |
| `assets/scripts/make_<name>.py`           | One Blender (`bpy`) script per model                              | yes    |
| `assets/scripts/wwblend.py`               | What the scripts share: the rig, the body, the palette, export    | yes    |
| `assets/models/<name>.glb`                | The model: mesh, materials, normals, rig, weights and its actions | yes    |
| `assets/build/<name>.blend`               | A debug copy to open in Blender                                   | no     |
| `kit/fantasy/folk/folk-built-<family>.pack.png` | The models as the game loads them, with their textures, a file a family (generated) | yes |
| `kit/fantasy/folk/folk-built-index.json`  | Which file has which model (generated)                            | yes    |

### Rules for a script

1. Start from an empty scene: `bpy.ops.wm.read_factory_settings(use_empty=True)` (`wwblend.Model()`
   does it too), so no default cube, camera or light gets in.
2. Build a clean mesh with its colours, an armature with vertex weights, and actions. A two-legged
   creature uses the people's skeleton (`wwblend.BONES`, the Unreal mannequin names), so the game moves
   it with the people's recorded animations; its own `Idle`, `Walk` and `Attack` actions, each on an NLA
   track of its own, are for the model on its own. A creature with another shape (a mimic, a roper) has
   its own skeleton and its own `Idle`, `Walk`, `Run` and `Attack` actions (and `Hidden` for one that lies in
   wait); `--bestiary` packs it into `kit/creatures/rigged-<family>.pack.png` and `src/rigged.js` plays them.
3. A model has one texture, so the game draws it in one go. Colours start in a palette
   (`wwblend.Palette`: a flat colour per cell); `Model.finish(bake={...})` then bakes them with Cycles
   into a texture of the model's own, with a little mottling, darker towards the ground, and shading
   where it's tucked in (ambient occlusion).
4. 1 unit is 1 metre. The feet stand at the origin `(0, 0, 0)`; transforms are applied
   (`bpy.ops.object.transform_apply`). In Blender the model faces −Y with +Z up; the glTF export turns
   that into the game's +Z forward and +Y up. `wwblend.at(x, up, forward)` takes positions as the game's
   code gives them.
5. Keep it cheap enough for a crowd of them on a phone: the detailed model stays under about 35,000
   glTF vertices (the count the game draws, which UV seams make higher than Blender's), with one texture
   of 512 pixels and 64 palette colours. `--bestiary` gives it a distant version automatically: about
   7,000 vertices' worth of triangles over the same vertices, drawn past Settings → Display → Creature
   detail distance. A later review may trim the detailed models; if phones struggle, trim with fewer faces
   (`Model(faces=…)`, `group(faces=…)`) before cutting detail people see.
   `tests/wanderworld-bestiary.regression.mjs` holds the ceiling.
6. Export `assets/models/<name>.glb` with animations, materials and normals, and save
   `assets/build/<name>.blend` (`Model.finish()` does both).
7. Credit every model made this way to ThatOneCan, in Help's credits (`src/help.js`), the README's
   credits and `kit/CREDITS.md`, naming what it is. A script that reads another pack's files also
   follows that pack's licence and the credit rules in `docs/CONCEPT.md`.

The families are `FAMILIES` in `scripts/build-wanderworld-people.mjs`; a new model goes in `others` until
it's named there. A `.pack.png` is a packed kit file, not a picture: `src/packed.js` says what's in one.

### Running one

Set `BLENDER` to your Blender executable (Blender 5.3 is what the scripts are tested with). Keep that
path out of committed files.

```bash
"$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_goblin.py
node scripts/build-wanderworld-people.mjs --bestiary
```

The first writes the `.glb` and `.blend`; the second packs every model in `assets/models/` into the kit
(ffmpeg on `PATH`, or `FFMPEG`). Then bump the version and rebuild the package as usual
(`scripts/build-wanderworld-package.mjs`). Open a `.blend` you didn't make with `--disable-autoexec`.

### Checking it

Look at the model in the game's own renderer, not only in Blender: its own actions in a glTF viewer,
and as the game makes it (`animals.js createAnimal`), standing, walking and striking with the people's
animations. Change the script (proportions, shapes, colours, weights, keyframes) and run it again until
it looks right. `tests/wanderworld-bestiary.regression.mjs` checks that every model is in the kit, on
the people's skeleton, at its kind's height, with its texture and its three actions.
