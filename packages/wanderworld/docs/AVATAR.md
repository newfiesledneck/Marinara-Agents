# The base avatar: a plan

Status: planned, 0.7.37. The bodies are being modelled; nothing in the game uses them yet.

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
| Anthro                | A body of its own (wolf, dragon, …); fur or scale colours and pattern     |
| Preset                | Start from a saved or built-in look; save the current look as one         |

Every slider has a middle that looks like an ordinary person, so a look that sets nothing is fine. A
look keeps only what was chosen by hand, as `checkLook` does today; anything left out comes from the
person's name (seeded), so a crowd differs without anyone setting it.

### Anthro

Each anthro kind is a body of its own, male and female, modelled for its kind from head to toe, not a
human body with a head swapped on. They share the people's skeleton (so the same animations play), the
same build and face key names where they make sense (so presets and outfits work across bodies), and
the same recolourable parts plus fur or scales.

- **Wolf** and **dragon** first (the user asked for both), then canine, feline, vulpine and lapine.
- Each has its own head (muzzle, ears or horns, teeth), hands with claws, digitigrade legs (walking on
  the toes, still played by the people's clips), and a tail on `pelvis` with a short bone chain that
  sways with a small motion of its own. The dragon adds horns, scales, a frill or spines, and wings
  folded on its back (a later option: wings that open).
- Keys of their own: `muzzle` (longer), `ears_tall` (the wolf), `horns` (the dragon), `tail` (thicker).
- Colours: a main colour, a second for the belly and muzzle, and a pattern (plain, socks, mask,
  stripes; the dragon: plain, banded, speckled).

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
5. **Saving.** The look gains `body`, `shape: { weight, muscle, … }` (each −1…1 or 0…1),
   `limbs: { arms, legs, head }`, `colours: { skin, eyes, lips, underwear, fur, fur2 }`, `hair`,
   `anthro: { head, tail, pattern }`. `checkLook` clamps each and drops anything unknown. Older looks
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

## Open questions

- Which anthro kinds after canine, feline, vulpine and lapine?
- Facial hair: meshes like hair, or painted in the texture?
