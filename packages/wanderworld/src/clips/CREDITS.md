# Recorded animations

`ual.json` holds animations converted from **Universal Animation Library (Standard)** and **Universal
Animation Library 2 (Standard)** by
[Quaternius](https://quaternius.com/packs/universalanimationlibrary.html), released under
[CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/) (public domain; the licence file
in the download says so). No credit is required; this note is a courtesy.

Clips used, from the first: Idle_Loop, Walk_Loop, Jog_Fwd_Loop, Sprint_Loop, Idle_Talking_Loop,
Sitting_Enter, Sitting_Idle_Loop, Sitting_Talking_Loop, Sitting_Exit, Swim_Fwd_Loop, Swim_Idle_Loop,
Jump_Loop, Jump_Land, Fixing_Kneeling, Interact, PickUp_Table, Dance_Loop. From the second:
TreeChopping_Loop, Farm_Harvest, Farm_PlantSeed, Farm_Watering, Idle_FoldArms_Loop, Idle_Rail_Loop,
LayToIdle, Consume. (Sitting on the ground is made in `src/clips.js` from the sitting clip, its legs
folded by hand.)

Rebuild from the free downloads (each one's `Unreal-Godot` folder):

```bash
node scripts/build-wanderworld-clips.mjs "<path>/UAL1_Standard.glb" "<path>/UAL1_Standard_RM.glb" "<path>/UAL2_Standard.glb"
```

To go back to only the hand-made motion: delete this folder and `src/clips.js`, remove the
`createClipPlayer` import and the `"recorded"` branch in `src/character.js`, and the `animation` setting.
