# The base avatar: a plan

Status: in the game. The male and female bodies are the built-in person, with the Look card's
sections, presets, saving and townsfolk's seeded looks; hair styles and outfit pieces load when their
files are in the kit. The anthro wolf and dragon bodies are in too, built on the human body. What's built,
and how, is under "What's built".

The bar: these are the best-looking models in the game, because the player sees them all the time.
Proper topology with edge loops, a detailed face and hands, a 2048 px texture, up to about 30,000
vertices a body, checked in rendered close-ups against reference pictures until they look like a
professional base avatar.

Wanderworld's own person, made in Blender (`assets/scripts/make_avatar.py`), in place of the person built
in code from shapes (`src/figure.js createFigure`). It starts in plain underwear, because outfits come
later as pieces of their own. Downloaded people (Quaternius's modular people in `kit/fantasy/folk`) stay
as they are for now; only the shape-built person is replaced.

## The two bodies

- Two bodies, male and female, on the people's skeleton (`wwblend.BONES`, the Unreal mannequin names), so
  every recorded animation the people have plays on it unchanged.
- Underwear as its own material part, so an outfit can hide it or a player can tint it.
- Bald. Hair styles are separate meshes on the `Head` bone (step 3).
- Parts the game can recolour on their own: skin, underwear, eyes, eyebrows, lips, nails (hair later).
- Shape keys, exported as glTF morph targets: `weight` (or `thin` and `heavy`), `muscle`, `bust` (female)
  or `chest` (male), `hips`, `waist`, `belly`, `shoulders`, `neck`, and for the face `jaw`, `cheeks`,
  `nose`, `eyes`, `ears_pointed`.

## What a player can change (the Look card)

| Choice                | How it works in the game                                                  |
| --------------------- | ------------------------------------------------------------------------- |
| Body                  | Male, female, or an anthro body (below): which model is loaded            |
| Height                | The whole figure scaled, as `HEIGHTS` does today                          |
| Build sliders         | Morph target influences: weight, muscle, bust/chest, hips, waist, belly…  |
| Arm and leg length    | The arm and leg bones scaled along their length (0.85–1.15), not thicker  |
| Head size             | The `Head` bone scaled (0.9–1.1)                                          |
| Face sliders          | Morph targets: jaw, cheeks, nose, eyes, pointed ears                      |
| Skin, eyes, lips      | Each part's colour, from the lists in `looks.js` or a colour of one's own |
| Underwear colour      | The underwear part's colour                                               |
| Hair style and colour | One of the hair meshes on the `Head` bone, tinted                         |
| Anthro                | A wolf's or dragon's body on the human one; own sliders and colours       |
| Preset                | Start from a saved or built-in look; save the current look as one         |

Every slider works the same way (`looks.js`): its value 0 is the model's own shape; to the right is bigger,
longer, wider or more, and to the left smaller, shorter, narrower or less; and each says what its two ends
are. A pair of keys is one slider with the model's shape in the middle (thin and heavy, `muzzle_short` and
`muzzle`, `tail_short` and `tail_long`, `ears_small` and `ears_tall`, `horns_small` and `horns`,
`neck_slim` and `neck`). A slider with one key runs it backwards for its left half (the `waist` key
narrows, so its slider turns it round), and its track still has 0 in the middle (`toTrack`); a one-way
slider (pointed ears, tail thickness) has 0 at the left end. `tests/wanderworld-avatar.regression.mjs`
measures each key's direction on all six bodies.

A look keeps only what was chosen by hand, as `checkLook` does today. For townsfolk, anything left out
comes from the person's name (seeded), so a crowd differs without anyone setting it, and the card shows
where each slider is. The player starts with every slider at the model's shape (`NEUTRAL_LOOK` under
their look), and the card's Reset puts anyone's sliders back there.

### Anthro

Each anthro kind is built on the human body, male and female (`assets/scripts/make_anthro_wolf.py`,
`make_anthro_dragon.py`): the same base mesh and skeleton, so the trunk, arms and thighs keep the human
surface (the wolf's 3 mm of fur over it, the dragon's scales under 5 mm) and human clothes fit them. What's
its own is the head, the hands' claws, the legs below the hock, the tail, and the dragon's wings. The first
plan, a body modelled for its kind from head to toe, was dropped for this: one base means one set of
clothes, one set of build keys and one skeleton.

- **Wolf** and **dragon** are in. Canine, feline, vulpine and lapine can follow the same way.
- **The skeleton** is the people's, with tail bones on `pelvis` (the wolf's `tail_01` to `tail_04`, the
  dragon's to `tail_05`) and, on the dragon, wing bones on `spine_03` (`wing_01`, `wing_02` and three
  fingers a side). The legs are digitigrade: the human leg skinned onto joints moved to the new stance,
  sculpted only below the hock, so the people's clips still play. The dragon stands a few centimetres
  taller. The game sways the tail and settles the wings itself (`avatar.js swayOf`: a small turn of each
  bone, no clip); the models' own `Idle`, `Walk` and `Attack` actions stay in the `.glb`.
- **Pieces** in the body's file: `underwear-bottom-briefs` and `-boxer_briefs`, her `underwear-top-bra`
  and `-sports_bra`, and the dragon's `wings`, which a look can hide.
- **Keys:** the human build keys (thin, heavy, muscle, chest or bust, hips, waist, belly, shoulders,
  neck) with `neck_slim`; for the face `jaw`, `cheeks`, `eyes`, `muzzle` and `muzzle_short`; the wolf's
  `ears_tall` and `ears_small`, the dragon's `horns` and `horns_small`; `tail` (thicker), `tail_long` and
  `tail_short`; and the wolf's `ruff_flat`, which lays its neck ruff flat under a piece.
- **Parts** (each a colour over the model's grey texture): the wolf's `fur`, `fur2`, `nose`, `eyes`,
  `claws` (and `eyelashes`, `teeth`, and the ruff's `fur_tufts` and `fur2_tufts`, blended cards that take
  the fur's colours); the dragon's `scales`, `scales2`, `horns`, `iris` (and `eye_white`, `teeth`).

### Presets

A look can be saved as a preset with a name, and any character's Look card can start from a preset
(theirs or a built-in one: a few ready-made looks per body). A preset is the same data as a look and goes
through `checkLook`. Presets are kept with the player's settings, so they're there in every world, and
can be exported and imported as a small file.

## Packing, loading and the Look card

1. **Packing.** `scripts/build-wanderworld-people.mjs` gets an `--avatar` mode that packs
   `avatar-*.glb`, its hair and its anthro parts into `kit/fantasy/folk/avatar-*.json`, keeping the morph
   targets (positions and normals, quantised like the mesh). The `--bestiary` mode skips avatar and
   non-humanoid models.
2. **Building.** A new `src/avatar.js createAvatar(look, name)` loads the body, sets each morph
   target's influence from the look, scales the limb and head bones, colours the parts, and adds the
   hair or the anthro parts. It returns what `createFigure` returns, so `main.js` and `npcs.js` take it
   unchanged.
3. **Replacing.** "Built-in person" in the Look card's Avatar choice becomes this avatar.
   `figure.js createFigure` stays only as the fallback when the kit can't be loaded, as `bestiary.js`
   does for the monsters.
4. **The Look card.** A Body section (male, female, anthro), then Build, Face, Colours and Hair, each a
   group of sliders or swatches that folds away, so it isn't a wall of controls. Each control says what it
   changes. It works on a phone: one column, big targets, the figure turning in a small preview.
5. **Saving.** The look gains `body`, `species`, `shape: { weight, muscle, … }` (each −1…1 or 0…1),
   `limbs: { arms, legs, head }`, `colours: { skin, eyes, lips, underwear, fur, fur2 }`, `hair`,
   `wings`. `checkLook` clamps each and drops anything unknown. Older looks
   still load: their height, skin, hair and colours carry over.
6. **People in town.** Anyone without a model of their own gets a seeded look within a natural range.
   Lore words can shape it ("tall", "stocky", "red hair", "elf" for pointed ears) through
   `keywords.js`, with no AI call.

## Outfits later

Outfits are separate meshes, skinned to the same skeleton, made in Blender with the same shape keys as
the body (transferred from it), so a heavier or more muscular body wears them without clipping. A piece
that covers the underwear hides that part. That's a plan of its own once the bodies are in.

## Cost

One draw per person, as now. Morph targets cost a little each frame per active key, so a crowd far
away is drawn with every influence baked in once (no live morphs) and only people close by update.
Budget: up to about 30,000 vertices for a body, 2,000 to 4,000 for a hair style.

## Build order

1. The male and female bodies with their keys (being modelled now).
2. Packing with morph targets, `createAvatar`, and the bodies in the inspect viewer with sliders.
3. Hair styles (five to start: short, parted, long, ponytail, buns), fitted to the finished head. The
   wolf and dragon bodies (being modelled now), then canine, feline, vulpine and lapine.
4. The Look card's new sections, presets, saving and loading, and older looks carried over.
5. Townsfolk with seeded looks, lore words.
6. Outfits (a plan of its own).

## What's built

- **Packing** (`node scripts/build-wanderworld-people.mjs --avatar`): `assets/models/avatar-<sex>.glb` into
  `kit/generic/avatar/avatar-<sex>.pack.png` (a file a body, about 2 to 4 MB, packed: `src/packed.js`;
  positions in an int16 box, normals int8, texture places uint16, weights bytes, each shape key only where
  it moves, its moves in 511 steps a way and int8 normal changes) with its textures as `.webp` beside it.
  `avatar-hair-<style>.glb` go into `avatar-hair-short.pack.png` and `avatar-hair-long.pack.png`, and
  `outfit-<piece>.glb` into `kit/fantasy/avatar/avatar-outfits-<group>.pack.png` by its slot's group
  (`looks.js CLOTH_SLOTS`: head, tops, body, legs, feet, hands, armour, accessories), their textures inside
  (at most 1,024 px), with `avatar-hair-index.json` and `avatar-outfits-index.json` saying which file has
  which (and a piece's bodies, parts, colours and variants, all the Look card needs). The package may list
  at most 256 asset files, so it's a file a body and a bundle a group; the game fetches a bundle the first
  time someone wears from it. Packing puts two things right in the hair's and clothes' shape keys: a key
  moves a vertex only where it moves the body on that vertex's bone (so "nose" no longer moves a boot, and
  hair keeps only what moves the head), with the move that fitting left in every key taken out of them
  all; and a key's normal that turned the wrong way round faces out again. The face keys are dropped
  from everything not worn on the head, neck or brow. An outfit piece's parts are one mesh, each vertex
  saying its part (`partOf`), so a piece is one draw.
- **What the hair and outfit files need:** each a `male` and a `female` mesh (by its object's or mesh's
  name; one with neither name goes on both), on the people's skeleton or hung on the `Head` bone (then
  bound with the body's own matrices). A texture that is near white, coloured by the game (the hair by
  the hair colour; an outfit piece by its material's base colour), alpha MASK for cut-outs. Outfit
  pieces carry the body's shape key names (they follow the body's sliders) and `hides` in the object's,
  mesh's or scene's custom properties (exported as extras): a list or comma-separated words, from
  `head`, `neck`, `torso`, `hips`, `upperarms`, `forearms`, `hands`, `thighs`, `calves`, `feet` (the
  skin, and underwear, whose vertices are mostly on those bones), and `underwear`, `underwear-top`,
  `underwear-bottom`, and `hair` (a hood or helm). An outfit piece also says its `slot` and `layer`
  (inner first), and another way of wearing it is a mesh of its own with `variant` (`male_hood_up`), shown
  in place of the usual one, never with it. Each material is a part (`cloth`, `trim`, `metal`…:
  `looks.js CLOTH_PARTS`), coloured on its own. Hair style names and pieces are `looks.js HAIRSTYLES` and
  `CLOTHES`; the packer stops at one it can't name.
- **Underwear styles:** a mesh each in the body's file, named `underwear-top-<style>` or
  `underwear-bottom-<style>` (bra, sports_bra, bralette, undershirt; briefs, boxer_briefs, boxers,
  boyshorts, bikini, thong), material `underwear` (and `underwear_trim`, a shade darker). The card offers
  only those the body has. A body with one underwear layer in its own mesh (as now) has it as the
  briefs, and her bra.
- **Building** (`src/avatar.js createAvatar(look, name, gender)`): the body's parts sharing a texture are
  drawn as one, coloured by vertex (two draws: skin and the rest, then one brow and one lash style, blended),
  plus one for the hair and each outfit piece. Shape keys are worked into each person's own positions
  and normals when they're made, so no one pays for them while drawing; the texture places, weights and
  triangles are shared by everyone with that body. Arm and leg length stretch each limb bone along
  itself in its inverse bind matrix and move the next bone out, so a limb grows longer, not thicker;
  head size scales the head from the neck. Without the kit it falls back to `figure.js createFigure`.
- **Looks** (`looks.js checkLook`): `body`, `shape`, `limbs`, `colours`, `underwear`, `clothes` (known
  pieces, one a slot; an empty list is nothing on), `clothColours` (`{ piece: { part: colour } }`),
  `variants` (`{ cloak: "hood_up" }`) and `preset`, each clamped, anything unknown dropped; `height`, `hair`, `hairColour`, `hairTint`, `skin`
  and `skinTint` are shared with the older kit's look, so older looks carry over (a tone's number or
  `skinTint` is a skin of one's own). MakeHuman's system assets (CC0) add `age` (young, middle, old: the
  `age_middle` and `age_old` shape keys), `skin` (a skin picture of that age, drawn white, or `custom`),
  `brows`, `lashes` (which style shows) and `eyePicture` (a tile of `avatar-eyes.webp`, or `tint`). Presets
  (`checkPresets`) are the Settings value `lookPresets`.
- **Townsfolk** (`avatarLook`): what isn't chosen comes from the name, within an everyday range, under
  their lore's `ww:looks:<word>` keywords and the appearance written for a person the world made
  (`keywords.js lookFromWords`). Unless their look chooses clothes, they wear everyday clothes for a
  work the name gives (`avatar.js JOBS`: townsperson, farmer, smith, guard, noble, priest), three or four
  pieces in a dye of their own; small pieces (a circlet, a belt, a scarf, bracers) aren't drawn far off.
  Settings → People → "Townsfolk use the new bodies" switches back to Quaternius's townsfolk.
- **The Look card's clothing:** Clothes and Armour, a piece a slot (or none) of those made for the body,
  each part's colour, the cloak's hood up or down, and ready-made outfits (`looks.js OUTFIT_PRESETS`)
  that change only the clothes.
- **Anthro bodies** (`looks.js SPECIES`: `species` in a look, beside `body`, so the body still follows the
  gender):
  - **Packing:** `--avatar` packs `assets/models/anthro-<kind>-<sex>.glb` into
    `kit/generic/avatar/anthro-<kind>-<sex>.pack.png`, a file a body with its pictures inside (the body's at
    2,048 px, the underwear's at 1,024; the normal maps are left out), about 2.3 to 3.1 MB each.
    `--avatar anthro` packs only those four.
  - **Sliders:** the Look card shows the sliders a body has keys for (`looks.js hasSlider`). A two-way
    slider drives a key each side of its middle (`KEY_PAIRS`: muzzle, ears, horns, tail length, and the
    neck on a body with `neck_slim`); the human neck has one key, run backwards as before.
  - **Colours:** `ANTHRO_COLOURS`, each part from its list (natural wolf coats; the SRD's ten draconic
    ancestries) or a colour of one's own; unless chosen, a coat or an ancestry from the name.
  - **Clothes:** the human outfit pieces, bound to the anthro skeleton with their own (human) inverse bind
    matrices (`people.js skeletonFor`), so the stance bends trousers as it bent the legs, and following the
    build keys the bodies share. Covered regions are hidden as on a human, claws and paw pads under gloves
    too. Nothing is offered in the head, brow and feet slots (`ANTHRO_BARE_SLOTS`), a cloak's hood stays
    down, and there's no hair. A tail and wings come through cloth worn over them; the wings can be hidden.
  - **Who has one:** townsfolk stay human unless their look or lore says otherwise
    (`ww:looks:wolfkin`, `wolf-folk`, `dragonborn`); a player whose build's race is Dragonborn has the
    dragon body unless one is chosen (`looks.js raceLook`).
- **Not yet:** anthro hair, head pieces and footwear, patterns for fur and scales, wings that open, a hole
  for the tail in what covers it, facial hair, townsfolk's clothes following where they work (it's from the
  name, so the Look card and the world agree), live shape keys while a slider is dragged in the world (the
  preview is made again instead), and a cheaper body far away (each person costs the same at any
  distance; the crowd's own spacing of animation updates applies).

## Open questions

- Which anthro kinds after canine, feline, vulpine and lapine?
- Facial hair: meshes like hair, or painted in the texture?
