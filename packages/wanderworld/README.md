# Wanderworld

A walkable, low-poly 3D world on its own Home tab in Marinara Engine: a world built from your characters,
persona and lorebooks that you explore, talk in, and start scenes from. It is an alpha, offered to Engine
`staging` testers only, and still changing quickly. The plan and milestones are in
[docs/CONCEPT.md](docs/CONCEPT.md).

## Using it

1. **Install** Wanderworld from **Agents → Download Agents** on an Engine `staging` build (2.4.6 or newer),
   and **restart Marinara Engine** when asked. The restart starts its server part; without it the world
   still works, with set lines instead of AI.
2. Open **Home → Wanderworld**, choose **New world**, pick your persona and the characters who live there,
   and play. Under "Setting the world up" the AI can do the rest (who lives where, who knows whom). To
   walk in your persona's own model, set one up for that persona in 3D Avatars first; anyone without a
   model gets a dressed townsperson.
3. For AI, open **Settings → AI** in Wanderworld and choose the connections: one for conversations, one
   for scenes, and an image connection for pictures. Each can stay on the Engine's default.
4. From another device, enter the Engine's Admin Secret in **Settings → Advanced → Admin Access** on that
   device, as for other packages with their own routes.

What it asks for on install, and why: `routes` and `storage` (its own `/api/wanderworld` routes, scene
contexts and recaps, and the picture gallery), `scenes` (starting Engine scenes from the world and getting
their recaps back) and `network` (calls to your own Engine on this machine for the connection list, image
generation and scene creation; nothing else leaves the machine except through your Engine connections).

Worlds are saved in this browser's storage, one save per world; they don't follow you to another browser
or device yet. Uninstalling removes the package; saved worlds stay in the browser until you delete them
from **Load world** or clear the site's data.

## What it does now (0.4.82)

### The world

- **A settlement of its own kind:** a hamlet round a green, a village with a stall market, a town with a
  fountain square, or a city; laid out as a grid, a crossroads, along one street or round the market; the
  market in the middle or off to one side, stone walls and gates (new cities have them), and cobbled streets
  with sidewalks or dirt paths (New world, or left to the seed). In a town: a town hall, a temple, a tavern
  and shops round the square with market stalls and benches; homes, a smithy and fenced gardens along cobbled
  streets with kerbed sidewalks, flowers and clutter by the doors, ivy, wagons and meadows on empty lots.
  Shops have striped awnings and hanging signs on painted boards; iron lamp posts light the streets at night,
  windows glow, and smoke rises from chimneys.
- **The land:** hills, mountain ranges along some edges, a winding river with plank bridges on piers, and
  places out in the country: hamlets of a few houses round a green (town2, town3…), farms with a barn and
  fenced fields, wayside inns and cottages at the end of their own dirt roads (never in the river), landmarks
  (ruins, a watchtower, standing stones, a graveyard, a watermill on the bank, a pond to swim in), and caves
  up on the hillsides with no road to them. Roads join neighbouring hamlets, and inns stand by the road to a
  hamlet or farm. Each world chooses its own in New world, or leaves it to the seed (`src/land.js`,
  `src/caves.js`).
- **Regions:** at the edge of the world, "Travel to <region>" takes you and your party into the next
  region, with its own land and settlement made from the world's seed. Each region keeps its own place
  names, lore and groups; characters who didn't come along wait at home. Each trip saves a travel scene
  request with the world.
- **Built to its lore:** with places linked by their keywords, a world is built with at least every numbered place
  its lorebooks mention (smithy3 makes three smithies; town2 brings a hamlet; farm2 two farms; a cave
  brings mountains for it). Past that, random.
- **Painted ground and water:** grass, dirt, forest floor, rock, snow, riverbed pebbles, cobbles, setts and
  slabs blended in one ground material, and rippling water (`world.js`).
- **Real buildings, props and nature** from Quaternius's free kits (Medieval Village, Fantasy Props,
  Stylized Nature); simple stand-ins show until they load, or if Settings turns them off.

### People

- **Play as** one of your personas, in its 3D Avatars model (VRM, GLB, FBX or MMD) or a built-in person.
- **Up to thirty characters live in each world,** in their own 3D models or dressed townsfolk (Quaternius's
  character packs, chosen from their name; a body picker sets Auto, Male or Female, per world).
- **A living town:** townsfolk visit shops and the tavern, sit on benches, find their way along the streets,
  go to work by day if they have a job, head home at night, and cross the river by a bridge or by
  swimming. Friends meet up and hold little conversations, taking turns; name tags are tinted by how each
  person sees you (red enemies, green friends, pink romance…).
- **Talking:** walk up and press E. They greet you by how they feel about you; pick from a few things to
  say, or type your own. With AI on they answer in character; without it, from set lines.
- **Relationships** (Journal → Relationships): how each person sees the others and you (friend, family,
  partner, rival, enemy and more, each with levels), and each one's temperament (passive to aggressive)
  and manner (shy to outgoing). Friends come over to say hello, someone who dislikes you keeps away, a
  sworn enemy comes to have words. Settings decide how often people come up to you, how many at once, and
  where confrontations may happen.
- **A party:** ask someone along in a conversation, or bring everyone standing round you (Journal → Party).
  They follow you, run to keep up, sit near you, wait where you ask, and cross water the way you did.

### Lore and the world's setup

- **Journal → Places** shows the world as a tree: the whole world, its characters, the town, its streets
  and the buildings on them, the wilds, and groups of places (which can sit inside each other). A
  lorebook entry can be tied at any level: active where you are and everywhere above it, everywhere for
  the world, or while you talk to or travel with that character. The **Lore** button shows what's active.
- **Lorebooks can set it all up** (each part opt-in in New world or Journal → World), with keywords
  that start with `ww:` so ordinary trigger words never set anything: which place, group, character or
  the whole world an entry belongs to; place names and what sits inside what; a character's body, home,
  work, day, how they see you and how they stand toward others; people made from entries with no card;
  and your own entry (`ww: player`), whose lore is always active and can give you a home (you start at
  your front door). The full list is under [Lorebook keywords](#lorebook-keywords).
- **Regenerate this world** (Settings) rebuilds it from its setup with this version's land and the
  lorebooks' current needs, keeping its people, relationships, lore, groups and homes; optionally a new
  town layout, with every name and link moved to the same kind of place.

### AI (the server part)

Wanderworld has a server part (`server.mjs`), so the Engine needs a restart after installing or updating it.
With it running:

- **Conversations in character:** people answer in their own words, written by your model from their card,
  your persona, where you are, the time and weather, how they feel about you and the lore active there.
  If a call fails, set lines stand in.
- **Moments, in the "Around you" chat window:** say something out loud and whoever hears may answer,
  with a line of narration. Plain text is said to everyone nearby, `/s` shouts (heard across a square),
  `/w` whispers (only someone right beside you), `/p` talks to your party, and `/a` does something
  instead (open a chest, cast a spell). Reading the noticeboard, sitting down by people and choosing
  things on a card are moments too. The commands are listed under the box; the window moves and resizes.
  Pressing E on someone is still a direct conversation.
- **Schedules:** everyone follows a day (home, work, meals, visits, a seat somewhere), a usual one from
  their home and work until you change it in Journal → People → Schedules, or the AI plans one. What
  people agree to in moments ("meet me at noon by the fountain") goes into their day.
- **Illustrate:** a window that paints the current moment (where, when, the weather, who's with you and
  what they're doing, their looks from their cards) from a prompt template you can edit, with the world's
  gallery. It moves, resizes and stays open while you play.
- **Scenes:** "Play it as a scene" on a door's or a thing's card opens the moment as a roleplay scene in
  the Engine with everyone there (one of your characters at least), your persona and the world's lorebooks.
  Wanderworld plans it itself (point of view, tense and prompt preset from Settings → AI, and the world's
  scene instructions from Journal → World), so the Engine's scene dialog doesn't come up. When it ends,
  its recap comes back to Journal → Here.
- **Pictures:** Journal → Here → "Picture this place" paints where you are through your image connection.
- **Settings → AI:** AI conversations on or off, which connection writes conversations, which plays scenes,
  which paints pictures (each can be the Engine's default), how people talk, reply length, creativity, the
  scene point of view, tense and prompt preset, and the picture style (the Engine's built-in style
  profiles, or your default one).

Every AI call uses a connection of yours, so it costs what that connection costs. A conversation reply, a
moment, a day's schedule, a scene plan and a picture are one call each, and setting a world up is one
call for the cast, one for every 40 lorebook entries, and one each for written lore and new people; nothing calls a model while you
only walk about.

### Playing

- **Main menu and saves,** with painted art and a loading screen: Continue, New world (name, seed, your
  persona, the characters who live there from your Engine folders, the land, the settlement, walls, any
  more hamlets, farms and landmarks, the world's size from Small to Massive, the setting and lorebooks,
  with a map of the world it makes and Reroll), Load world (thumbnails, Rename, Delete) and Settings. Each
  world keeps everything in its own save in this package's browser storage: where you were, the time, the
  cast, bodies, relationships, lore, groups, homes, schedules, notes and scenes.
- **A world set up for you:** in New world, "let the AI set them up" reads your characters' cards and
  persona, and any lorebooks you choose, and makes the world ready to play: who's a man or a woman, how
  people know each other and you, where everyone lives and works, which lore belongs to which place,
  names for the places the lore names, and the places that takes built in. The loading screen says what
  it's doing, then the setup is shown for a look before the land is built: build it, ask again, or go
  back and change the settings. A call that fails is tried again; what came through is kept and only
  the missing part is asked for again. The same can be spelled out with keywords on lorebook entries
  (`ww: tavern1`, `ww: lives in home3`, `ww: sister of Mira`), or set by hand in the Journal.
- **A world written for you:** with no lorebook, or none of your characters, the AI can still make a
  whole world. "World lore" has it write the world's premise and named places with their own lore, kept
  in that world and active where you stand; "new people" has it invent up to 12 people around those
  places and your cast, each with a description, personality, looks, home, work and relationships. They
  aren't Engine characters: they live, talk and keep their days in that world only. A lorebook entry
  about someone with no card can become one of them too. The steps feed each other in order: your
  lorebooks, the world and its places, new people, then your own characters fitted in among them.
- **Use things** with E, a click or a tap: sit on benches, read and pin to the noticeboard, swim, and open a
  door, a cave or the fountain for a card of things to do (go in, knock, toss a coin…) plus your own line
  and who comes along. With AI on, what you choose plays out as a moment, or as a full scene with "Play it
  as a scene" (Settings → Walk into buildings brings back the unfinished furnished rooms).
- **The Journal** (J): Here; People (a roster by faction, and behind buttons what everyone's doing right
  now, schedules, homes and work, relationships, and each person's voice and the details of people the
  world made for itself); Party; Places (the setup tree); Map (the region from above, with names and
  where each edge leads; it zooms and pans, a closer look names the buildings, a click sets a waypoint,
  and your home is marked); and World (setting, scene instructions, lorebooks, lore linking, the season,
  the lore written for the world, and a check of your `ww:` keywords that lists any it didn't
  understand).
- **Swimming:** wade into the river and swim where it's deep (Shift swims faster).
- **Animation:** recorded clips from Quaternius's Universal Animation Library (idle, walk, jog, sprint,
  sitting, talking, swimming), or the hand-made motion (Settings → Animation).
- **Controls.** Computer: WASD walks, Shift runs, drag (left or middle mouse button) or the arrow keys look
  around, the wheel or + / − zoom, E uses, Esc stands up or leaves a conversation. Touch screen: the stick
  walks (all the way out runs), dragging elsewhere looks around, pinching zooms, and Use or a tap uses.
- **Settings:** resolution, draw distance (Tiny to Max; what costs the most is measured in
  [docs/PERFORMANCE.md](docs/PERFORMANCE.md)), trees and rocks, shadows, detail on or off, walk and run speed,
  camera speed and direction, time of day and time speed, sound, confrontations, people coming up to you,
  what the HUD shows, explanations under every option, and Regenerate this world.
- A day lasts 20 minutes at normal speed, with dawn, dusk and lamps lit at night. Weather (Settings,
  off by default): rain, snow or mist, changing every few minutes or always one.

It reads your personas, characters, character folders, lorebooks, connections, prompt presets and 3D
Avatars models from the Engine, and changes none of them. Worlds stay in this browser for now. The server
part keeps only scene contexts (until the Engine's planner reads them), scene recaps (until the world takes
them) and each world's newest 60 pictures.

### Lorebook keywords

Wanderworld acts only on lorebook keywords that start with `ww:` (`ww:man` and `ww: man` are the
same), so an entry's ordinary trigger words never set anything by accident, and an entry's title alone
links nothing. Put them in an entry's keys, next to its usual ones.

| Keyword | On | What it does |
| --- | --- | --- |
| `ww: tavern1`, `ww: home6`, `ww: forest1` | any entry | The entry is that place's lore (places are numbered by kind: Journal → Places shows each one's name). A number the world doesn't have yet is built: `ww: smithy3` makes three smithies. |
| `ww: tavern`, `ww: forest` | any entry | Lore for every place of that kind. |
| `ww: world` | any entry | Lore active everywhere. |
| `ww: Mira`, `ww: player` | any entry | The entry is about that character (their name), or about you. |
| `ww: name The Gilded Stag` | a place's entry | Names the place. |
| `ww: located in town2` | a place's entry | Puts the place inside another place or group. |
| `ww: group of home` | any entry | Makes a group of every place of that kind, with the entry as its lore. |
| `ww: man`, `ww: woman` (or male, female, boy, girl) | a character's entry | Their body. |
| `ww: lives in home6`, `ww: works at smithy1`, `ww: owner of tavern1` | a character's entry | Home and work. |
| `ww: friend`, `ww: enemy`, `ww: mentor`, `ww: sister`… | a character's entry | How they see you. |
| `ww: sister of Tam`, `ww: rival of Fen` | a character's entry | How they stand toward someone else (one way; the other's entry says theirs). |
| `ww: work 10:15-18:45`, `ww: home 22-7:15`, `ww: eat 12-13 at tavern1` | a character's entry | Their day (home, work, eat, visit, sit, walk), over the usual one; quarter hours, and over midnight. |
| `ww: shy`, `ww: quiet`, `ww: friendly`, `ww: outgoing`; `ww: passive`, `ww: gentle`, `ww: calm`, `ww: grumpy`, `ww: fierce`, `ww: aggressive` | a character's entry | Their manner and temperament. |
| `ww: voice gruff` (natural, cosy, dramatic, witty, terse, gruff, formal, cheerful, sly) | a character's entry | How they talk, instead of the setting's way. |
| `ww: member of Thieves Guild` | a character's entry | Puts them in that faction; the faction's entry is lore for each member. |
| `ww: faction Thieves Guild` | any entry | The entry is that faction's lore. |
| `ww: character Mira Saxton` | any entry | The entry is that person (with no name after it, the entry's title is the name). A card you chose for the world with exactly that name is who it means. Otherwise a person is made who lives in that world only, and one model call writes who they are, their manner and their looks from the entry: `ww: character Mira Little` beside a card called Mira Saxton gives you both. Cards you didn't choose are never pulled in. |
| `ww: closed 22-6` | a place's entry | When the place is closed. |
| `ww: owner Mira` | a building's entry | Mira owns it (the other way round from `ww: owner of tavern1` on Mira's entry). If nobody in the world is called that, a new person is made. |
| `ww: city`, `ww: town`, `ww: village`, `ww: hamlet`; `ww: walls`; `ww: size large`; `ww: season winter` | the entry keyed `ww: world` | The world's shape, wherever New world left it on "Surprise me": the main settlement (`town1`, whatever its size; `ww: town3` adds two hamlets), walls, the world's size, and the season (winter lies under snow). |
| `ww: monster Goblin`, `ww: creature Deer`, `ww: hostile` | any entry | Marks the entry as a creature (a monster, or a hostile creature, attacks). Kept with the world for later: nothing uses them yet. |
| `ww: found in forest1`, `ww: night` or `ww: day`, `ww: pack 4`, `ww: danger 2`, `ww: drops wolf pelt` | a creature's entry | Where and when it's met, how many together (1 to 10), how dangerous (1 to 10), and what it might leave. One thing per keyword: repeat `ww: drops …` for more. |

Keywords are separated by commas in the Engine's lorebook editor, so a keyword can't hold one; `-` and
`:` are fine (`ww: work 10:15-18:45`). Each keyword says one thing.

Choose "link lorebook entries by their ww: keywords" (places) and "set up from ww: keywords"
(characters) in New world or Journal → World. With the AI setting things up instead, `ww:` keywords
still count, and come first.

### Known limits

- A scene needs at least one of your characters there: the Engine casts its own characters only, so
  people a world invented can't be in scenes.
- Only the Engine's built-in picture style profiles are listed; your own default profile is "Engine default".
- Another region has no townsfolk of its own yet: only your party travels.
- Walk-in rooms are unfinished and off by default.
- The AI's world setup reads the first 200 entries of the chosen lorebooks, 600 characters of each.
- Quartermaster works inside scenes started from Wanderworld (they are roleplay chats), not in the world.

## How it works

- `src/main.js` mounts as the package's Home tab (`home-browser-tab` slot, `view="browser"`): the canvas,
  HUD and touch stick live in one element, and the WebGL renderer is reused when the tab reopens. It ties
  the world, the townsfolk, saves, the Journal and lore together.
- `src/world.js` lays out the town and builds the scene: the ground, roads, water and bridges, buildings
  (simple ones, then the kit's), props, nature (drawn out to the draw distance) and collision (circles and
  boxes in a 2D grid, not a physics engine). `src/land.js` makes the land (hills, mountains, the river,
  places out in the country and their roads); `src/caves.js` carves cave mouths; `src/fixtures.js` builds
  lamp posts, the fountain, lit windows, chimney smoke and awnings.
- `src/buildings.js` is the parts kit (a building is a spec chosen from fixed menus) and `src/houses.js`
  assembles a building from the village kit on its 2 m grid; both versions share a footprint and door.
- `src/zones.js` names the places of a world, finds the place at a point, says where someone is in words,
  and holds the setup logic: groups, numbered names, keeping the setup through a regenerate, and reading
  lorebook keywords (`matchLore`, `structureFromLore`, `needsFromLore`).
- `src/npcs.js` runs the townsfolk: each follows their day's schedule (`src/schedules.js`) and, between
  its entries, a small plan (walk, sit, go in, chat, wait); routes along the streets in town and straight
  across country (by a bridge over the river, by the gates of a walled town), swims, follows the party,
  and acts on relationships and temperament.
- `src/relationships.js` holds relationship kinds, tiers and warmth, temperaments, and reading
  relationships from lore keywords; `src/dialogue.js` the set conversations; `src/interactions.js` the
  things you can do with doors and things, and the scene requests they make.
- `src/character.js` applies motion to any humanoid and reads the Engine's personas, characters and
  character folders; `src/clips.js` plays the recorded clips (`src/clips/ual.json`, made by
  `scripts/build-wanderworld-clips.mjs`); `src/motion.js` is the hand-made motion; `src/models.js` loads
  3D Avatars models (VRM, GLB, FBX, MMD) into three-vrm humanoids; `src/people.js` and `src/figure.js`
  build the default people.
- `server.mjs` is the server part (hand-written, syntax-checked by the build): routes under
  `/api/wanderworld` for status, the connection and preset lists, conversation replies, moments, day
  plans, world setup from cards and lorebooks, pictures and the gallery, scene plans, scene creation, and scene contexts and recaps, plus a
  scene origin for the Engine. Every request body is checked there. `src/ai.js` is the client's side of
  it, `src/map.js` draws the maps, `src/weather.js` the weather, `src/setup.js` sums the AI's setup up for the review, and `src/illustrate.js` and
  `src/floating.js` the Illustrate window and the floating windows.
- `src/saves.js` keeps the saved worlds (every field checked on the way in); `src/menu.js` is the main
  menu, `src/journal.js` the Journal, `src/hud.js` the bar, panels and cards, `src/talk.js` conversations
  and speech bubbles, `src/signs.js` signs and the noticeboard, `src/ui.js` the parchment look,
  `src/sound.js` Web Audio sounds, `src/settings.js` the settings, `src/kit.js` the kit's models.
- `src/interiors.js` builds the (unfinished) room behind a door, off by default.
- three.js 0.186.1, `@pixiv/three-vrm` 3.5.5 and `mmd-parser` 1.1.4 (the versions the Engine uses) are
  bundled into `client.js`, because the Engine does not hand its copies to packages.

Performance targets: about 30 fps on a mid-range phone and 60 on a desktop. The pixel ratio is capped at
1.5, Auto resolution steps down when frames drop, nature and real lights follow the player, and fog hides
the far edge. Readings by draw distance and tree density are in [docs/PERFORMANCE.md](docs/PERFORMANCE.md).

## Building and testing

```bash
node scripts/build-wanderworld-package.mjs
```

Edit `src/` or `server.mjs` and rebuild; never edit `client.js`, `manifest.json` or the artifact by hand.
Bump `VERSION` in the build script and add a `CHANGELOG.md` entry first. The regression suites are
`tests/wanderworld*.regression.mjs`, each run with `node`.

## Credits

The buildings, props, nature, townsfolk and recorded animations are converted from free packs by
[Quaternius](https://quaternius.com), released under
[CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/): Medieval Village MegaKit,
Fantasy Props MegaKit, Stylized Nature MegaKit, Universal Base Characters, Modular Character Outfits -
Fantasy, and the Universal Animation Library. Thank you, Quaternius. The full list, with which folder
comes from which pack and how to rebuild or remove each, is in [kit/CREDITS.md](kit/CREDITS.md) and
[src/clips/CREDITS.md](src/clips/CREDITS.md).

The menu art, logo, loading screen, store banner and ground, water and wood textures were made for
Wanderworld by its author with an image generator. three.js, `@pixiv/three-vrm` and `mmd-parser` are
bundled under their MIT licences, with their notices kept in `client.js`.
