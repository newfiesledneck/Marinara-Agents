# Recorded animations

`ual.json` holds animations converted from **Universal Animation Library (Standard)** by
[Quaternius](https://quaternius.com/packs/universalanimationlibrary.html), released under
[CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/) (public domain; the licence file
in the download says so). No credit is required; this note is a courtesy.

Clips used: Idle_Loop, Walk_Loop, Jog_Fwd_Loop, Sprint_Loop, Idle_Talking_Loop, Sitting_Enter,
Sitting_Idle_Loop, Sitting_Talking_Loop, Sitting_Exit.

Rebuild from the free download (its `Unreal-Godot` folder):

```bash
node scripts/build-wanderworld-clips.mjs "<path>/UAL1_Standard.glb" "<path>/UAL1_Standard_RM.glb"
```

To go back to only the hand-made motion: delete this folder and `src/clips.js`, remove the
`createClipPlayer` import and the `"recorded"` branch in `src/character.js`, and the `animation` setting.
