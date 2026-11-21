# Wanderworld package rules for coding agents

These rules apply to changes under `packages/wanderworld/`. They add to the repository rules in the root
`AGENTS.md`, `.github/agents/chai-workflow.md` and `CONTRIBUTING.md`; they do not replace them. What the
game does and how it's built is in `README.md` and `docs/CONCEPT.md`.

## Making 3D models in Blender

New creatures, characters and other models are made in Blender by a Python script, run headless from
the command line, not built out of primitive shapes in the game's code. (`src/bestiary.js` builds the
older code-made monsters; it stays as the fallback for any kind without a Blender model.)

### Where things go

| Path                                | What                                                              | In git |
| ----------------------------------- | ----------------------------------------------------------------- | ------ |
| `assets/scripts/make_<name>.py`     | One Blender (`bpy`) script per model                              | yes    |
| `assets/scripts/wwblend.py`         | What the scripts share: the rig, the body, the palette, export    | yes    |
| `assets/models/<name>.glb`          | The model: mesh, materials, normals, rig, weights and its actions | yes    |
| `assets/build/<name>.blend`         | A debug copy to open in Blender                                   | no     |
| `kit/fantasy/folk/folk-built.json`  | The models as the game loads them (generated)                     | yes    |
| `kit/fantasy/folk/folk-<name>.webp` | Each model's palette texture (generated)                          | yes    |

### Rules for a script

1. Start from an empty scene: `bpy.ops.wm.read_factory_settings(use_empty=True)` (`wwblend.Model()`
   does it too), so no default cube, camera or light gets in.
2. Build a clean mesh with its colours, an armature with vertex weights, and actions. A two-legged
   creature uses the people's skeleton (`wwblend.BONES`, the Unreal mannequin names), so the game moves
   it with the people's recorded animations; its own `Idle`, `Walk` and `Attack` actions, each on an NLA
   track of its own, are for the model on its own. A creature with another shape needs its own skeleton
   and actions, and the animals pipeline (`scripts/build-wanderworld-animals.mjs`) to play them.
3. Colours go in one small palette texture (`wwblend.Palette`: a flat colour per cell, each face's
   texture coordinates on its cell), so the game draws a model in one go.
4. 1 unit is 1 metre. The feet stand at the origin `(0, 0, 0)`; transforms are applied
   (`bpy.ops.object.transform_apply`). In Blender the model faces −Y with +Z up; the glTF export turns
   that into the game's +Z forward and +Y up. `wwblend.at(x, up, forward)` takes positions as the game's
   code gives them.
5. Keep it cheap: a creature stays under about 8,000 vertices (the script prints its count) and 64
   colours.
6. Export `assets/models/<name>.glb` with animations, materials and normals, and save
   `assets/build/<name>.blend` (`Model.finish()` does both).
7. A model made this way is Wanderworld's own and needs no credit. A script that reads another pack's
   files follows that pack's licence and the credit rules in `docs/CONCEPT.md`.

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
