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
3. For AI, open **Menu → Settings → AI** in Wanderworld and choose the connections: one for conversations, one
   for scenes, and an image connection for pictures. Each can stay on the Engine's default.
4. From another device, enter the Engine's Admin Secret in **Settings → Advanced → Admin Access** on that
   device, as for other packages with their own routes.

What it asks for on install, and why: `routes` and `storage` (its own `/api/wanderworld` routes, your
saved worlds, scene contexts and recaps, and the picture gallery), `scenes` (starting Engine scenes from the world and getting
their recaps back), `ui` (its tab on Home) and `network` (calls to your own Engine on this machine for the connection list, image
generation and scene creation; nothing else leaves the machine except through your Engine connections).

Worlds are saved by the Engine, one save per world, in the package's own storage there: they're the same
from any browser or device that opens your Engine, and a world can be as big as it grows. The game's and
the AI's settings (the living world, animals, memories, connections, narrators, what calls the AI) are
kept by the Engine too; graphics, controls, sound and what's shown on screen stay each device's own. If
the server part isn't running, the menu says so: restart the Engine. Delete a world from **Load world**
on the main menu.

While you play, **Menu → Save world** saves at once and sends it to the Engine at once (the game also
saves by itself, and what changed reaches the Engine within about 15 seconds), and **Menu → Load world**
opens another of your worlds; the one you're in is saved first. A browser left open reads the Engine's
saves again when you come back to it, and a world that was played somewhere else since is loaded from
there, so a phone and a computer stay in step. Each browser writes only the worlds it plays, so a world
made on one never drops out of another's list. If one world is played in two browsers at the same moment,
the browser that saved it first keeps it and the other one loads that save, so don't do that.

## What it does now (0.7.49)

### The world

- **A settlement of its own kind:** a hamlet round a green, a village with a stall market, a town with a
  fountain square, or a city; laid out as a grid, a crossroads, along one street or round the market, or
  (when you choose them) as scattered houses with no streets, round a pond with the houses along the edge,
  or in four quarters with a green between them. Ground a layout leaves open inside the settlement gets a
  pond where there's room, a few houses off the streets, gardens, meadows and trees. The
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
  region, with its own land, settlement and people made from the world's seed. Each region keeps its own
  place names, lore, groups, homes and shops; characters who didn't come along wait at home. Each trip
  saves a travel scene request with the world. Journal → Map also takes you by road or by coach to a
  region you know (see Regions and travel).
- **Built to its lore:** with places linked by their keywords, a world is built with at least every numbered place
  its lorebooks mention (smithy3 makes three smithies; town2 brings a hamlet; farm2 two farms; a cave
  brings mountains for it). Past that, random.
- **Painted ground and water:** grass, dirt, forest floor, rock, snow, riverbed pebbles, cobbles, setts and
  slabs blended in one ground material, and rippling water (`world.js`).
- **Real buildings, props and nature** from Quaternius's free kits (Medieval Village, Fantasy Props,
  Stylized Nature); simple stand-ins show until they load, or if Settings turns them off.

### People

- **Play as** one of your personas, in its 3D Avatars model (VRM, GLB, FBX or MMD) or the built-in body.
- **Up to thirty characters live in each world,** in their own 3D models or the built-in body (or
  Quaternius's dressed townsfolk, with Settings → People → Townsfolk use the new bodies off), each looking
  as their name and lore have them; a body picker sets Auto, Male or Female, per world.
- **The built-in body** (`src/avatar.js`, docs/AVATAR.md): Wanderworld's own person, male or female, made
  in Blender from MakeHuman's CC0 base mesh and shapes, in plain underwear (outfits are coming). The
  Look card shapes it, a section at a time, each folding away, with a small turning picture of them at
  the top:
  - **Presets:** start from one of your own or a ready-made one (a few for each body), save the look
    under a name, delete one, or export it as a small JSON file and import one back. Your presets are
    kept with your settings, so they're in every world and every browser.
  - **Body:** gender (how they're spoken of), the male or the female body (as their gender unless
    chosen), and age: young adult, middle-aged (about 50) or old (about 72), which shapes the face and
    build a little and picks the skin picture of that age. Anthro bodies come later.
  - **Build:** height, weight, muscle, chest (her bust), hips, waist, belly, shoulders, neck, arm length,
    leg length and head size. **Face:** jaw, cheekbones, nose, eyes and pointed ears, and a brow style
    (of 12) and a lash style (of 4), MakeHuman's, blended softly. Each slider's middle
    is an everyday person and says what it changes; dragged, the picture follows, and let go it's set.
  - **Colours:** the skin is one of MakeHuman's skin pictures (Caucasian, African or Asian, each at
    their age) or the plain skin in a colour of your own; the eyes one of nine real eye pictures or the
    plain grey eye in a colour of your own; lips, nails and brows from a list or any colour (over a skin
    picture, lips and nails are the picture's own unless coloured). **Underwear:** a top and a
    bottom of the styles that body has (or none), and its colour; an outfit covering it hides it.
    **Hair:** style and colour (the hair meshes are still being made: until then the body is bald).
  - Anything left unset comes from their name, within an everyday range, and from their lore's
    `ww:looks:` keywords (tall, stocky, red hair, elf, old, middle-aged…): most townsfolk are young
    adults, some middle-aged and a few old, each with a skin picture of their age and brows and lashes
    of their own. A look saved before keeps its height, hair and colour, and its skin colour as a colour
    of its own.
- **Choose clothes for the older townsfolk** (Look card → Older kit's clothes, for Quaternius's people): an outfit (townsfolk, or the ranger), or each piece of one from either (top,
  sleeves, legs, boots) or None for any of them (the body shows there, in dark underclothes: bare arms,
  a bare chest, bare feet), the ranger's hood and pauldrons on or off (on anyone), each outfit's cloth, a
  colour of your own for any piece (the square beside it), and a beard (hair, skin and height are the
  built-in body's, above). The colour picker has its own Use this colour, No colour and
  Cancel buttons. Changes show at once and are kept with the world; Reset forgets them. About one in
  four people is dressed as a ranger unless you choose.
- **A living town:** townsfolk visit shops and the tavern, sit on benches, find their way along the streets,
  go to work by day if they have a job (indoors, or out at the forge, a market stall or the fields: see
  Playing), rest in gardens, by ponds and in meadows, head home at night, and cross the river by a bridge
  or by swimming. Friends meet up and hold little conversations, taking turns; name tags are tinted by how each
  person sees you (red enemies, green friends, pink romance…).
- **Talking:** walk up and press E. They greet you by how they feel about you; pick from a few things to
  say, or type your own. With AI on they answer in character; without it, from set lines. Someone travelling
  with you knows it, and doesn't greet you as if you'd just met.
- **Relationships** (Journal → Relationships): how each person sees the others and you (friend, family,
  partner, rival, enemy and more, each with levels), and each one's temperament (passive to aggressive)
  and manner (shy to outgoing). Friends come over to say hello, someone who dislikes you keeps away, a
  sworn enemy comes to have words. Settings decide how often people come up to you, how many at once, and
  where confrontations may happen.
- **A party:** ask someone along in a conversation, or bring everyone standing round you (Journal → Party).
  They follow you (close, normal or loose), run to keep up, sit and lie down with you, move about a fight
  by how they fight, wait where you ask, and cross water the way you did (see "Your party" below).

### Lore and the world's setup

- **Journal → Places** shows the world as a tree: the whole world, its characters, the town, its streets
  and the buildings on them, the wilds, and groups of places (which can sit inside each other). A
  lorebook entry can be tied at any level: active where you are and everywhere above it, everywhere for
  the world, or while you talk to or travel with that character. The **Lore** button shows what's active.
- **Lorebooks can set it all up** (each part opt-in in New world or Journal → World), with keywords
  that start with `ww:` so ordinary trigger words never set anything: which place, group, character or
  the whole world an entry belongs to; place names and what sits inside what; a character's body, home,
  work, day, how they see you and how they stand toward others; people made from entries with no card;
  and your own entry (`ww:you`), whose lore is always active and can give you a home (you start at
  your front door). The full list is under [Lorebook keywords](#lorebook-keywords).
- **Regenerate this world** (Settings → World → Places) rebuilds it from its setup with this version's
  land and the lorebooks' current needs, keeping its people, relationships, lore, groups and homes. It
  asks what New world asks about the land (hills, mountains, river, settlement, layout, walls, market,
  streets, world size, more settlements, farms, landmarks, places out in the country), each starting as
  it is, so a world can be made bigger or given more places; a map shows the result before you agree.
  Optionally a new town layout too. Every name and link moves to the same kind of place.
- **How many vendors:** New world and Regenerate take an "at least" and an "at most" for each trade.
  Shops are built to reach the least; any over the most sell something else, or shut.

### AI (the server part)

Wanderworld has a server part (`server.mjs`): code the Engine loads into its own server when it starts. It
isn't a second server. Because the Engine only loads it at startup, the Engine needs a restart after
installing or updating Wanderworld; until then the game says it "isn't fully loaded".
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
- **Inventory (with Quartermaster):** when the Quartermaster package (0.1.35 or later) is installed, an
  Inventory button on the top bar opens its character sheet for the persona you play, one sheet for each
  persona in each world, titled with the persona's name and in Wanderworld's parchment colours. What the
  sheet says is worn is told to the AI with what's happening now (conversations, moments, scene plans and
  scene notes, Illustrate), with no macro to place. After a moment (or, if you choose, after each reply
  in a conversation too) one more model call runs Quartermaster's tracker on what was told, the sheet
  takes the changes by Quartermaster's own rules, and the chat says what changed ("added and put on Hat,
  took off Scarf"); nothing is said when no item changed. A scene started from the world is linked to the
  same sheet (Quartermaster 0.1.37 or later), so its chat shows and changes the one inventory. Deleting
  a world deletes its sheets. Settings → Inventory has a switch for each: the button, the worn
  text, when the tracker runs (never, after moments, after moments and replies), scenes sharing the
  sheet, and the parchment colours. Without Quartermaster nothing changes.
- **Illustrate:** a window that paints the current moment (where, when, the weather, who's with you and
  what they're doing, their looks from their cards) from a prompt template you can edit, with the world's
  gallery. It moves, resizes and stays open while you play. The picture fills the window; the gallery, the
  template (with every placeholder explained), the size and the rest are a scroll down, folded. Pick the
  picture's size (a few usual ones, or your own width and height). "Improve the prompt with AI" has a model
  rewrite the filled-in template first, on a connection of its own if you like (apart from the one
  conversations use), to an instruction you can edit (sentences or tags), and can show you the result to
  change or approve before it's painted. The usual instruction asks for one full paragraph of prose (about 200
  to 300 words): each character's name once and then their looks and what they wear, what they're doing,
  the place, the light and a camera angle, with nothing of the chat copied in. The rewrite is also given the last lines of the chat (without the lines that
  describe other places, unless you switch that off), so the
  picture shows what you're doing now (kneeling by the pond), not only where you stand. A sentence of the
  template whose placeholders all come out empty is left out. `{world_look}` says what the world looks like
  wherever you are (yours to set in Journal → World), so pictures match it; `{setting}` is only what you
  wrote in the world's Setting box. `{style}` is the picture style you chose, in its own words (a
  template that leaves it out has it added at the end), and what that style keeps out is sent with the
  prompt. `{place_kind}` says what sort of place it is (a market square, the bank of
  a pond, the mouth of a cave) and whether you're indoors. Appearances are used whole, however long.
- **The AI assistant** (Menu → Settings → AI assistant): a chat about the world you're in, which can also
  change it. Ask about its people, places and lore, or why a lore entry is or isn't active where you stand.
  Ask for a change ("make Jake and Sarah a married couple who live together", "rewrite Jason's lore to make
  him a sorcerer who prays at the shrine", "add a blacksmith's apprentice who lives with Oswin") and it
  proposes one: every change is shown in full, rewritten lore beside what it says now, and nothing happens
  until you press **Confirm**. Before you confirm you can rewrite the text it wrote (or press **Write it
  again**), change its choices (a relationship's kind and strength, a home, work, body, voice, stance) and
  untick any change to leave it out. **Undo these changes** takes back that set, and only that: what you
  changed yourself since stays, and an older set can still be undone after a newer one.
  Not sure what to ask? Buttons under the chat are ready-made requests: **Fill in the gaps**, **Check for
  problems**, **What's happened lately?**, and a list of more that says what each does (noticeboard notes,
  lore for a place or a faction, people for the region you're in, a scene to play, a scene's recap turned
  into changes, why lore isn't active, clearing the board). **Draft ww: keywords** lets you pick a lorebook
  and its entries and gives you their keys as text to copy; only those entries are sent.
  Only the parts of the world a message needs go to the model, and each answer says which went. The chat is
  kept with the world.
  It can set relationships, homes and work, days, body, voice, temperament, how someone acts toward you and
  who knows whose name; add people and remove ones the world invented; write this world's own lore about a
  person, a place or the whole world, keeping the detail that's there; rename places and set closing hours;
  make groups of places and factions and write a faction's lore; change the setting, picture look and
  ages; pin notes, take them down, give you an errand or drop it; and start a scene it suggested. It changes only that world: never your cards, personas or lorebooks in the Engine, the
  settings, the map or the buildings. An answer whose changes can't be read changes nothing and says so.
- **Told where you really are:** the AI is given how you stand to a place, not only its name: on the bank
  beside the pond (not in the water), wading or swimming when you are, inside or outside a building, at
  the mouth of a cave, on a street, among the ruins. What you and the people near you sit on is named for
  what it is: a log by the campfire, a bench, a chair, a stool.
- **Recent lines, with when and where:** in a moment, each of the last lines the AI is given says when and
  where it happened ("09:10, the market square", "yesterday 21:40, the pond"), so a minute ago here isn't
  mistaken for this morning across town.
- **Ordered for prompt caching:** some providers charge less for the start of a prompt they've just seen.
  Wanderworld sends what never changes first and what changes last. In a moment: the world, your
  narrator's card, the whole world's lore, your party's cards, the lore of the place, whoever else is
  near; then the time, what you have on, what each is doing and what was just said. In a conversation
  the changing part (the time, who's near, memories, what you have on) goes on the newest message, after
  what was said, and the lines sent back start from the same place for several turns. The AI assistant's
  chat is ordered the same way, with the world as it is now on your newest message. Settings → AI →
  Order prompts for caching turns that off. Whether anything is cached is up to the provider and the
  Engine's connection.
- **Scenes:** "Play it as a scene" on a door's or a thing's card opens the moment as a roleplay scene in
  the Engine with everyone there (one of your characters at least), your persona and the world's lorebooks.
  Wanderworld plans it itself (point of view, tense and prompt preset from Menu → Settings → AI, and the world's
  scene instructions from Journal → World), so the Engine's scene dialog doesn't come up. When it ends,
  its recap comes back to Journal → Here.
- **Pictures:** Journal → Here → "Picture this place" paints where you are through your image connection.
- **Menu → Settings → AI:** AI conversations on or off, which connection writes conversations, which plays scenes,
  which paints pictures (each can be the Engine's default), how people talk, reply length, creativity, the
  scene point of view, tense and prompt preset, and the picture style (the Engine's built-in style
  profiles, or your default one), and Order prompts for caching.

Every AI call uses a connection of yours, so it costs what that connection costs. Menu → Settings → AI
has a switch for each thing that can make one (arriving somewhere, using things, the noticeboard,
sitting down, joining someone); arrivals are off to start with. A conversation reply, a
moment, a day's schedule, a scene plan, a picture, a picture's prompt rewritten and a message to the AI
assistant are one call each, and setting a world up is one
call for the cast, one for every 40 lorebook entries, and one each for written lore and new people; nothing calls a model while you
only walk about.

### Playing

- **Main menu and saves,** with painted art and a loading screen: Continue, New world (name, seed, your
  persona, the characters who live there from your Engine folders, the land, the settlement, walls, any
  more hamlets, farms and landmarks, the world's size from Small to Massive, the setting and lorebooks,
  with a map of the world it makes and Reroll), Load world (thumbnails, Rename, Delete) and Settings. Each
  world keeps everything in its own save, kept by the Engine: where you were, the time, the
  cast, bodies, relationships, lore, groups, homes, schedules, notes, scenes and the last of the chat.
- **The Menu while you play:** who you play (and their Look), Settings, **This world** (its name, its id,
  its Quartermaster sheet, the map seed, the land, the region you're in, who lives there, who's travelling
  with you, your animals, its lorebooks and setting, with Copy buttons for the ids), **Save world**,
  **Load world** (your worlds as the Engine has them now), full screen and the main menu.
- **A world set up for you:** in New world, "let the AI set them up" reads your characters' cards and
  persona, and any lorebooks you choose, and makes the world ready to play: who's a man or a woman, how
  people know each other and you, where everyone lives and works, which lore belongs to which place,
  names for the places the lore names, and the places that takes built in. The loading screen says what
  it's doing, then the setup is shown for a look before the land is built: build it, ask again, or go
  back and change the settings. A call that fails is tried again; what came through is kept and only
  the missing part is asked for again. The same can be spelled out with keywords on lorebook entries
  (`ww:tavern1`, `ww:lives in:home3`, `ww:sister of:Mira`), or set by hand in the Journal.
- **A world written for you:** with no lorebook, or none of your characters, the AI can still make a
  whole world. "World lore" has it write the world's premise and named places with their own lore, kept
  in that world and active where you stand; "new people" has it invent up to 12 people around those
  places and your cast, each with a description, personality, looks, home, work and relationships. Family
  and close ones your persona's and characters' cards speak of (a father, a brother, an old friend) are made
  first. "Ages of the people the AI makes" sets their usual ages (21 and up unless you change it, any age
  from 1; your lore, setting and cards always win), in New world or later in Journal → World. The first map
  on New world is an idea; the review shows the map the world gets, and "Reroll the map" there changes only
  the land. They
  aren't Engine characters: they live, talk and keep their days in that world only. A lorebook entry
  about someone with no card can become one of them too. The steps feed each other in order: your
  lorebooks, the world and its places, new people, then your own characters fitted in among them.
- **More to do, with or without AI:** market stalls, wagons, barrels and crates, and out in the country
  the farm, graveyard, standing stones, mill, pond, watchtower and ruins each open a card of things to do
  (browse, haggle, read the stones, skip a stone…). With AI on, each is a moment the model narrates and
  people nearby answer; with it off, the world answers with lines of its own. The **world's voice**
  (Menu → Settings → World) adds a line on coming to a place (its lore, when it has some; quiet or busy
  by who's about; not for streets or places told lately) and now and then about who's near; with the chat window closed it shows as a caption. The noticeboard offers
  an **errand** to someone in the world: take it, it's marked on your map, and reaching them (out of doors,
  at their door when they're in, or in the room with them) finishes it.
- **People remember what mattered:** beside their everyday memories (the newest fourteen by default), each
  person keeps lasting ones (eight by default) that small talk never pushes out: a scene you played together, a night
  at your campfire, joining or leaving your party, moving house, an errand done, falling out or growing
  closer. How many of each is a setting, with
  numbers of their own for anyone (family who remember more). In Journal → Edit people a memory can be
  reworded, deleted, or pinned: a pinned one is locked and never pushed out, and you can write one too.
- **How much memory the AI is sent is yours to set:** apart from how many memories are kept, two settings
  say how many everyday and lasting ones are sent, as a count shared between whoever the AI is speaking
  for (20 between three people is 7 each, rounded up; someone with fewer than their share leaves the rest
  to the others). Each slider goes to a hundred and then **All**: keep everything until you delete it,
  send everything they keep, however much that is. Anyone can have a number of their own, or All, in Journal →
  Edit people, and a switch says whether that comes out of the shared count (5, 5 and 10) or not (7, 7 and
  10). More sent costs more tokens on every reply, so the cheap way is a low shared number and a higher
  one for the few people who matter.
- **The AI assistant looks things up:** it is sent only what a request seems to need, with the titles of
  your lore, and asks for more when it needs it: a lore entry by title or by words (this world's own lore
  and the lorebooks chosen for it), everything about a person, what someone remembers, or a part of the
  world that was left out. Up to three look-ups before it answers, each one more AI call, and the line
  under the answer says what was sent and what it looked up.
- **The AI assistant looks after memories:** five ready-made requests (check them against the lore, clear
  out what doesn't matter, find repeats, sum up old ones into one lasting memory, suggest what to pin).
  Each asks whose memories to send first, a tick for each person or everyone's, with a rough token count.
  Every rewording, deletion, pin or new memory is proposed for you to change, leave out, confirm, and undo.
  **Sum up old memories** also has a button where memories are set: in Settings → People → Memory, in
  Settings → Token use, and in each person's window in Journal → Edit people (for that person alone).
- **Settings that explain themselves:** Menu → Settings is in sections (Display, Controls, World, People,
  Creatures, AI, Token use, then AI assistant, Help and Credits), and a section with a lot in it has tabs of
  its own (Display: Graphics, On screen, Sound; World: Time and weather, Places; People: Around you,
  Relationships, Memory, Genders, Inventory; Creatures: How many, Kinds, Behaviour; AI: Writing, Scenes,
  Pictures, Connections). Each section and tab opens with a
  line on what it is for, each setting says what On and Off do, and a setting that depends on another sits
  under it and goes faint while that one is off. Someone's window in Journal → Edit people is in tabs too
  (About, Day, You, Others, Memory), as is Journal → World (This world, Setting, Creatures, Lore). **New
  world** is a walkthrough in four steps with Next and Back: you and your people, the land, the AI (its
  connections and main switches, so they're set before a world is made), lore and setup. Each step says
  what to know before you start: what the game is, that the AI is optional and spends tokens, what a moment
  and a scene are, how memory works, where worlds are saved.
- **One of everything:** a Massive world can be given at least one of every kind of place out in the
  country (inn, cottage, cave, hamlet, farm, ruins, watchtower, standing stones, graveyard, mill, pond).
  Whatever the other choices leave out is added on top, with hills for the cave and a river for the mill,
  and two places of one kind are kept well apart. A new town laid out round a pond has a bigger pond, its
  market inside by the water and a fuller green.
- **Genders, by your numbers, per world:** each world keeps its own shares and custom gender name, set on
  New world's first step and changed in Journal → World; Settings → People → Genders is what a new world
  starts from. There is a slider each for male, female and a custom
  gender you name (Non-binary, say). They are weights for the people the game or the AI makes up:
  townsfolk whose body is left on Auto, and people the AI invents or fills in. Lore comes first: a gender
  from a lorebook, a card, or set by you in Edit people is never changed. The custom gender can be chosen
  for anyone wherever a body is chosen, and its name is what is shown and what the AI is told.
- **Nothing is cut:** character cards, personas, narrator cards and lore entries are sent to the AI whole,
  however long, and as many lore entries as are active where you stand (up to 60). Lore the assistant
  rewrites, and lore or people written for a world, are kept whole too. Long cards cost more tokens on
  every call they go with.
- **Token use in one place:** Settings → Token use gathers every setting that changes how many tokens are
  spent: which things call the AI (conversations, moments, arrivals, things, the noticeboard, sitting,
  joining, a call for each speaker), how long replies are, and how many memories are sent. They are the
  same settings as in AI and People → Memory, so a change in one place shows in the other. It also says what
  else adds up (a long narrator card, lore tied to the whole world) and where to see exactly what is sent.
- **Relationships are told as they are:** the AI is given what each person is to you (brother, employer,
  good friend, bitter rival) and what people in earshot are to each other. How someone speaks is left to
  their card and lore.
- **Narrators, and scenes from anywhere:** pick one of your character cards as the narrator of the world
  as you walk it and one as the narrator of scenes (Menu → Settings → AI; the same card or two: a short
  voice for the world, a roleplay narrator for scenes). Each person knows only what they
  saw, heard or were told: the AI is given every listener's knowledge as their own block (memories with
  when and how they came by them, the chat they alone heard, lore about themselves), so nobody speaks of
  what you said to someone else elsewhere. People in sight also remember what you do, and with
  gossip switched on (off by default) those who spend time together pass it on as hearsay. For the strictest
  separation, Settings → AI → Writing → "A separate call for each person who answers" (off by default) writes each reply in
  a call of its own that holds only that person's knowledge. The chat window's **Scene** button, or
  `/scene …`, starts a scene right where you stand: with whoever's near and your party, with the narrator
  as well, or with the narrator alone when nobody else is there. What you do is narrated even with
  nobody about. `/camp` lights a campfire for you and your party, and talking to someone offers joining
  what they're doing.
- **Strangers and people you know:** someone you haven't met is a Stranger, over their head and in what's
  written, until you learn their name: they say it, a note names them, they join you, or you say you know
  them while talking. Anyone you have a relationship with is known from the start. "Look at them" in a
  conversation and "People here" in the chat window show what the people near you look like. Edit
  people can set how someone acts toward you apart from how they feel: rude, aggressive, attacks on
  sight, afraid, or avoids you. It goes both ways: someone who doesn't know your name won't use it until
  you say it, and the "i" beside a conversation's title explains and switches both. When someone comes at
  you, a card says so and offers talking, a moment or a scene (there's no fighting yet), or turning
  aggressive approaches off.
- **Use things** with E, a click or a tap: sit on benches, read and pin to the noticeboard, swim, and open a
  door, a cave or the fountain for a card of things to do (go in, knock, toss a coin…) plus your own line
  and who comes along. With AI on, what you choose plays out as a moment, or as a full scene with "Play it
  as a scene" (Menu → Settings → Walk into buildings brings back the unfinished furnished rooms).
- **The Journal** (J): Here; People (a roster by faction, what everyone's doing right now, an overview
  of every relationship, and Edit people: a window per person with everything Wanderworld keeps about them — body, voice, temperament,
  home and work, their day, and relationships both ways — to change and Save or Cancel); Party; Places (the setup tree); Map (the region from above, with names and
  where each edge leads; it zooms and pans, a closer look names the buildings, a click sets a waypoint,
  and your home is marked); and World (setting, how the world looks in pictures, the ages of people the AI makes, scene
  instructions, lorebooks, lore linking, the season,
  the lore written for the world, and a check of your `ww:` keywords that lists any it didn't
  understand).
- **Swimming:** wade into the river and swim where it's deep (Shift swims faster).
- **Buildings each their own:** every building is dressed from where it stands: tiles in terracotta, old
  dark tile, brown, slate or moss; plaster whitewashed, cream, ochre, rose, pale blue or sage; the gable
  to the street or along it; round or square windows; dormers; a lean-to over the door; more ivy or less.
  A smithy's forge stands open to the street under its roof, framed by arches (hearth, anvil, workbench,
  weapon rack), and most taverns have a porch along the front with benches under it. None of it moves a
  door or a wall, so an older world keeps its homes and workplaces (a smithy's door goes to one end of
  its front).
- **People at work and at rest:** the smith hammers at the anvil or works at the bench, someone from a
  shop minds a market stall while others look over the goods, a farm's people hoe, sow and water its
  fields, and anyone with time kneels at a garden's beds, sits by a pond or lies in a meadow's grass.
  Most shifts are spent out where you can see them when the work has such a place; the rest indoors as
  before. They say a word now and then, and the Journal, the AI and pictures are told what they're at.
  The smith holds a hammer, and anyone drinking a mug.
- **Friends out together:** after a chat, friends make an outing of it, two to four of them: a drink at
  the tavern (most often in the evening), round the fire at a campsite outside the settlement, or back
  to one of their houses. When a moment picks one of them, the rest of
  the group in earshot comes with them in the same call.
- **Animals:** cattle (now and then a bull or an alpaca), a donkey and a horse at each farm; a dog or
  two about the market; a horse by each tavern and inn; and out in the country deer in twos and threes
  with a stag, foxes, and a pack of three to five wolves well away from the houses. They wander, graze and look about, keep out
  of the river (a horse you ride swims it, and your own animals swim after you), and the wild ones bolt when you come close. Horses come in seven coats and dogs in six,
  so a world's horses are a mix. A world's animals, and their coats, come from its seed.
- **Avatar:** when a persona's or a character's card has a 3D model, their Look card has Avatar at the
  top: the card's own model (the default), another kind the card has (VRM, GLB / FBX, MMD), or the
  built-in body, shaped by the rest of the card. Kept with the world.
- **Animals of your own:** the Look card (Menu, Look beside your persona) has Dog and Horse: the kind,
  the coat, the size, a name of its own, and whether each is with you or at home. With you, it follows, swims after you, and turns up beside you if left
  far behind or kept from you by something for a few seconds; at home it keeps by your door (or the tavern's, with no home of your own), and a horse got
  down from walks back there. Someone in town whose lore mentions their dog or their horse has it at their heel (the horse is theirs,
  not yours to ride); their Look card can change it or take it away. Kept with the world. The chat window has Call dog and Call horse
  while they're with you (it turns up beside you, wherever it had got to; `/call` does the same, and brings
  one from home), and Send dog home and Send horse home (each asks once more first), and the Journal's Party tab lists
  your animals, and the dog of anyone travelling with you, with Send home and Call along.
- **A world that goes on without you** (by rules alone: no AI call, and only while Wanderworld is open).
  People who spend time together grow a little closer, slowly: a step for an evening, two a day at
  most, a tier in a few weeks. Two short-tempered people sometimes have words instead, and friends who
  never meet drift apart. Each relationship has a Lock (it never moves by itself) and an Attraction
  level with its own lock, in Journal → Edit people; one set by hand moves on from there. Journal →
  Relationships ends with Lately, the record of it, and coming back to the town or the country after
  a few hours away says what happened there. Settings → People → Relationships has a switch for each part.
- **Out in the country, more to find:** a gallows, a pillory and sometimes a cage beside a watchtower,
  crystals pushing up among the standing stones, a signpost off the corner of an inn or a cottage.
- **Market days and festivals:** once a week it's market day, once in four weeks an evening festival;
  for those hours a good share of the town gathers in the market square, and a line says so
  (`src/events.js`; rules only, with a switch in Settings → World → Places).
- **Your household (Journal → Home):** move into any house that stands empty, with whichever of the
  people you live with you choose (the rest stay); ask someone to move in, or a housemate to leave;
  have someone round for a few hours. Inside your home, the same tab furnishes it: eighteen kinds of
  piece, put down in front of you and taken away again, kept with the world. Rules only
  (`src/household.js`): no AI call.
- **Hostile people:** bandits (hooded, sword in hand), witches and wizards (pointed hat, staff), out
  in the country with the monsters and counted with them. Built from the people's own bodies and
  outfits; nobody's character, so not talked to, and no AI is used for them.
- **Monsters:** slimes, skeletons, giant spiders, giant rats, snakes, bats, giant wasps, giant frogs,
  imps and puglins (pig-goblins), goblins, hobgoblins, bugbears, orcs, gnolls, kobolds, lizardfolk,
  ghouls, and now and then an ogre, a troll, a minotaur or a dragon high overhead (everything on two
  legs walks with the people's animations), out in the
  country, alone or in twos and threes; skeletons, ghouls and bats only at night. The Monsters slider says how
  many, each kind has its switch, and they act as "Hostile animals" says. A lorebook can place them:
  `ww:monster:slime:large:pack3` on a place's entry. Nothing fights back yet.
- **People remember, each their own:** what you said to them or in their hearing, and who they spent
  time with (`src/memory.js`; rules only). The AI is given the memories of whoever it's speaking for
  and nobody else's, so it can't know what someone across town was told. Someone you said something
  to may come over within a few days to bring it up. Their window in Journal → Edit people shows and
  clears it; Settings → People → Memory switches it off.
- **How many animals:** Settings → Creatures has a slider for each sort (stray dogs, farm animals, peaceful
  wild animals, hostile ones, monsters): that many of the world's own, 0 for none. What a lorebook asks
  for and anyone's own dog or horse are still there at 0, unless that's turned off. Each kind also has
  a switch: off, there are none of it anywhere, whatever else says. "Most in the settlement" keeps the
  town from filling up (stray dogs and horses share it; the rest are put just outside). "Hostile
  animals" says what a wolf does about you where confrontations are allowed: keeps its distance, squares
  up to you, or comes for you (you're sent back a step; nothing is hurt yet). Journal → World has one
  world's own numbers. A dog has five sizes, small to massive (as tall as a horse); a huge or a massive
  one can be ridden.
- **Bigger monsters:** now and then a monster is big (a quarter to two-fifths bigger), and once in a while
  the first of a group is huge (three-fifths to four-fifths bigger), named so in the story ("a huge
  troll"). Size makes it tougher (`combat.js foeOf`: more HP, harder blows, more XP). Settings → Creatures
  → Bigger monsters: never, now and then (the default) or often (`herd.js MONSTER_SIZES`). Bats, wasps,
  dragons and people keep their size. The goblins, hobgoblins, bugbears, orcs, gnolls, kobolds,
  lizardfolk, ghouls, ogres, trolls and minotaurs each have their own switch under Kinds.
- **Where monsters live:** with Settings → Creatures → "Only where they'd be found" on (the default),
  each kind turns up only where it would be (`animals.js HABITATS`: open ground, hills, mountains, by
  water, among ruins, by caves; `herd.js habitatsAt` reads a spot from its height, the water nearby and
  the landmarks and cave mouths around it). Off, anything that's on can be anywhere out in the country.
  The Monsters number holds either way. Below ground, `deep.js DWELLERS` says who lives in each kind of
  place.
- **New monsters:** the Monsters slider is how many there are whichever kinds are on (only trolls on at
  100: 100 trolls); a rare kind is half as likely as a common one (`herd.js RARE_SHARE`). Every so often
  (Settings → Creatures → New monsters every, 10 real minutes by default, 0 never) the monsters out of
  sight are counted out again (`herd.js respawn`), kinds not about yet twice as likely, so every kind
  that's on turns up in time. Kept: anything within sight, in a fight or after someone, what a lorebook
  placed, and anyone's own.
- **Tools in hand at work:** a sickle, a seed basket and a watering can on the farm, each for its
  part of the work; a trowel in the garden; the smith's hammer and a drinker's mug as before.
- **A saddle** on any horse that's someone's own (yours, or a character's). Farm and tavern horses
  go bare.
- **Riding:** walk up to a horse or a donkey and use it. The same keys or stick move it (a brisk walk,
  Shift or the stick right out to gallop, Space or the Jump button to jump, which carries it over fences
  and benches). It turns less sharply than you do, wades, and swims where the water is deep, so a river
  with no bridge can be crossed. E, Esc or Get down gets you off beside it (not in deep water). Its saddle
  and its rider go up and down with its back. It stays where you leave it, and your party runs to keep up.
- **Campsites:** a campsite or two outside each settlement: a fire that flickers, lights the ground as
  it gets dark and smokes, two logs to sit on, and a tent. The tent's card has Lie down, Sleep and Not
  now. Lie down lies you down awake, to rest and talk as on a bench, with the time going on as usual.
  Sleep: choose how long (an hour to eight, or until morning or evening), the screen dims and the clock
  jumps on. The party and anyone close by stay as they are; everyone else is where that hour has them
  (home, work, or out at their door). With Settings → Time fixed, you rest but the hour stays. Townsfolk
  nap in the tent too.
- **Jump, sit, lie down:** Space jumps. C sits you down on the ground where you stand, C again lies you
  down, and moving (or E) gets you up; the party sits or lies down with you. The chat window has Jump and Sit buttons
  (Sit becomes Lie down, then Get up), and on a touch screen they're by your thumb as well. Settings →
  Moving has a toggle for each: the C key, the touch Jump button, the touch Sit button, and the chat
  window's buttons. You reach out a hand to what you use, pick something up or take a drink when that's
  what you chose, sitting by your campfire sits you on the ground, and a home's bed is somewhere to lie
  down (with Walk into buildings on).
- **Animation:** recorded clips from Quaternius's Universal Animation Library and Universal Animation
  Library 2 (idle, walk, jog, sprint, sitting, talking, swimming, a jump and its landing, working, farm
  work, kneeling, folded arms, lying down, reaching and picking up), or the hand-made motion (Menu →
  Settings → Animation), which has none of the new ones: there people sit for what's low and stand for
  the rest.
- **Controls.** Computer: WASD walks, Shift runs, Space jumps, C sits or lies down, drag (left or middle
  mouse button) or the arrow keys look around, the wheel or + / − zoom, E uses, Esc stands up or leaves a
  conversation. Touch screen: the stick walks (all the way out runs), dragging elsewhere looks around,
  pinching zooms, Use or a tap uses, and Jump and Sit are by your thumb.
- **Settings:** resolution, draw distance (Tiny to Max; what costs the most is measured in
  [docs/PERFORMANCE.md](docs/PERFORMANCE.md)), the creature detail distance (past it monsters and people
  are drawn in a lighter distant version: Near 20 m, Normal 35 m, Far 60 m, or always full detail), trees and rocks, shadows, a frame rate limit (and slower drawing while a picture is painted), detail on or off, walk and run speed,
  camera speed and direction, time of day and time speed, how often places are told (the wait between
  them and the visits before a place is told again), sound, confrontations, people coming up to you,
  what the HUD shows, an (i) before every option that explains it, and Regenerate this world.
- A place you're beside counts with the one you're in (Settings → World → Places): on a river's bank,
  by a pond's shore, at the foot of the mountains, at a cave's mouth, beside a road or near a place out
  in the country, its lore is active too and prompts say so ("in Whisperwood, near the bank of the
  Silverrun"). These are no zones of their own: `bordersAt` in `src/zones.js` finds them from where you
  stand, 4 to 20 metres past a place's edge by kind.
- The land wears the world's season (Journal → World → Season), with Settings → Display → Graphics →
  "Trees, plants and streets wear the season" on. It is a tint in each material's shader (`seasonOn` in
  `src/world.js`), so the trees are the same trees all year.
  - Winter: snow on the ground, the leaves, the bushes and the tops of bark and stones, and in patches
    on roads, paths, streets and the square. Grass, ferns, flowers, clover and mushrooms aren't drawn,
    and drifts lie under the trees.
  - Fall: each broadleaf tree and bush turns yellow, orange or red, the grass is dry, and the flowers
    and clover are gone. Pines stay green.
  - Spring: the cherry trees are in blossom (they're green the rest of the year), and the other
    broadleaf trees and the grass are a fresher green.
  - The birches are orange in fall, their leaves' own colour, and green otherwise.
- A character sheet for each persona in each world (`src/sheet.js`; stage 2 of the plan): level,
  experience, HP, mana, AC, six attributes and whatever the player adds, each switchable. The ticked
  lines go to the model in conversations and moments as "Their stats now: …". It also holds the dice
  (`rollDice`, `attackRoll`) and reads bonuses out of item descriptions ("+2 AC", "+10 HP"). Nothing
  outside that module touches a sheet's shape, so it can move into Quartermaster later.
  With "The AI updates your sheet" on, `/sheet-track` has the model answer with targeted changes
  (`{ changes: [{ stat, by | to, reason }], xp }`), checked on the server and again against the sheet
  before they're applied. `/roll` and `/check` in the chat roll the dice.
- The Inventory button opens Wanderworld's own window in tabs: Items (Quartermaster's items, changed
  through its routes, so both stay in step), Sheet, and Quartermaster (its dock).
- Gathering (`src/gather.js`; stage 3 of the plan): fish, chop wood, forage, mine and harvest where the
  land allows it, by a roll with one of the sheet's attributes. What's found is added to Quartermaster's
  sheet through its own routes, so there is one inventory. A patch takes a day to give again. What each
  kind yields, and the lines said, are the setting pack's (`pack.js` `gather`).
- Tools and crafting (`src/craft.js`): chopping, mining and fishing each need their tool carried, told
  by an item's name. Inventory → Craft makes things from what is carried: the setting's recipes
  (`pack.js` `recipes`, each with the level it comes at) and the player's own, saved from what they put
  together. Making takes from and adds to Quartermaster's sheet. A tool is in the hand while it is used.
- Vendors (`src/vendor.js`; stage 4 of the plan): a smithy, a shop, a tavern and an inn trade, each as
  one or more kinds of shop from the setting pack (`pack.js` `vendors`: what a kind stocks, wants and
  is named). Shelves are picked per shop and restocking period and kept with the world. Buying and
  selling move things and the purse on Quartermaster's sheet. Settings → World → Vendors sets a
  building's trades by hand and makes shops of empty houses. With "The AI stocks shop shelves" on,
  `/vendor-stock` has the model write a shop's shelves when it restocks, checked on the server.
  A trade carries a line of guidance for that prompt, which the player can rewrite, and they can make
  trades of their own (name, guidance, goods typed one to a line), kept with the world as `trades`.
  A vendor can have guidance and a name of its own. Market stalls are vendors by day. A sign says the
  vendor's name, else its trade. Haggling is a Charisma check once a day at each vendor. While a shop's
  window is open the inventory tracker is held back, so nothing is added before it is bought.
- Money is an item: the one named for the world's currency (the pack's word until the player renames it
  in Inventory → Items) is the purse.
- The year can turn (Settings → World → Time and weather → "Seasons change", off to begin with): each
  season lasts a number of the world's days that you type in, then the next begins and the chat says
  so. A world starts in the season its lore names. Setting the season in the Journal starts it from
  today. This is stage 1 of the plan in `docs/CONCEPT.md` ("The RPG plan").
- A day lasts 20 minutes at normal speed, with dawn, dusk and lamps lit at night. Weather (Settings,
  off by default): mist, fog, rain and snow, the last three light, medium or heavy, and thunderstorms
  with lightning and thunder. It changes every few minutes or stays one kind. Each kind has its own
  visibility in metres, the same at every draw distance; the draw distance only cuts it shorter.
  With changing weather some clear mornings start in mist, and a winter world gets snow for rain.

It reads your personas, characters, character folders, lorebooks, connections, prompt presets and 3D
Avatars models from the Engine, and changes none of them. The server part keeps your saved worlds, scene
contexts (until the Engine's planner reads them), scene recaps (until the world takes them) and each
world's newest 60 pictures.

### Fighting

Off to begin with: Settings → Inventory → Combat. It needs the character sheet, and nothing else.
Combat can be played four ways.

- **Real time.** F swings wherever you face, standing or on the move, and whatever is in front of
  you and in reach when the blow lands takes it. Q blocks for about a second: an attack on you
  meanwhile is rolled twice and the worse roll counts. R dodges: a roll of a few steps, and nothing
  lands on you mid-roll. X draws your weapon or puts it away; drawn, the view stays behind you and
  you step sideways and back without turning. Z casts the spell that's ready. On a touch screen a
  Combat button swaps Run, Sit and Jump for Attack, Block, Dodge and Cast.
- **Turn-based combat.** A fight stops the clock for those in it. Everyone rolls initiative and acts in that
  order. It begins when a creature starts coming for you: its Stealth against your passive
  Perception decides whether you're surprised and lose your first turn. On your turn a circle on
  the ground shows how far you can go (nine metres from where the turn began; anywhere inside it,
  and back). You have one action (Attack, Cast, Dash, Disengage, Dodge, or something by its hotkey)
  and one bonus action, then end your turn (T). Leaving a creature's reach gives it an opportunity
  attack unless you Disengaged. Creatures with bows or spells use them. An optional class of your
  own adds Second Wind, Action Surge, Cunning Action, Rage and Extra Attack by level, and the
  numbers a turn gives can be set by hand. Companions and creatures
  take turns by the same rules, and a bar along the top shows the order. With "Turn-based combat use
  spell slots" on, a spell takes a spell slot of its level or higher, as the SRD has it, and mana
  is left alone; a sleep gives the slots back.
- **A narrated moment.** When a creature gets to you, or you press Attack with one in reach, the
  game rolls one exchange of blows at once and the AI tells it as rolled.
- **A scene.** The same meeting opens a scene chat with your stats, and the creatures let you be.

The rules are the same in all four, and the game rolls them (`src/combat.js`). An attack is a d20
plus a bonus against the target's AC: under it misses, at or over it hits, a 20 on the die is a
critical hit that rolls the damage dice twice, and a 1 always misses. Your bonus is your Strength
modifier and what your weapon and anything worn add. A weapon is any item whose description gives
its damage ("Weapon: 1d8 damage, +1 to attack"): the one equipped, else the best carried, else
your fists. A creature's HP, AC, attack and damage are in `src/pack.js` (`foes`). The chat tells
every roll, and no AI call is made in a real-time fight.

- **Spells** come from the 5e SRD and from you, and from nowhere else. Inventory → Sheet lists the
  SRD's spells of level 0 to 3 that a fight here can play (40 of them, in `src/srd.js`), and each
  one added becomes a line of your sheet whose description is its rule: "Cantrip. 1d10 fire damage.
  Range 24." or "Level 1. 2 mana. 3d6 fire damage. Dexterity save for half. Range 5." You can
  rewrite it, and write your own the same way. A cantrip costs no mana; a spell costs its level in
  mana, the level of the spell slot it would take. A spell is a spell attack against AC, a saving throw against 10 plus your Intelligence
  modifier, or needs no roll. Being stunned, paralyzed, restrained or incapacitated holds a target
  where it stands; being frightened sends it running. A healing spell mends you.
- **Resting.** Mana and HP come back slowly while you sit or lie down, and fully when you sleep.
- **Your companions fight too.** Each has a class from the SRD (Inventory → Sheet → Your
  companions), which gives them a weapon and spells. They strike what comes within reach, cast at
  what doesn't, and a healer mends you below half your HP. They move about the fight by how
  they fight (see "Your party" below), creatures go for them as well as for you, and one at 0 HP is out
  of the fight for a while.
- **Running from a fight.** A creature runs only when badly hurt. The blow that first leaves it a
  quarter of its HP or less (half, for a coward) has it make a Wisdom saving throw against DC 10, and
  it runs if it fails. Undead, oozes, constructs, the mindless and anything that can't be frightened
  never run; elementals, plants and a creature by its den roll twice and keep the better. You can
  chase one that runs and strike it, and it keeps running when hit. By turns it stays in the order
  and spends its turns on the Dash action until it is 24 metres from you. After a minute it has its
  nerve back and may come for you again, and then it joins the fight once. The saving throw and the
  condition immunities are the SRD's; the quarter of its HP, DC 10, the den and the minute are
  Wanderworld's own.
- **What spells leave**: a spell's rule says what it does besides damage, taken from the SRD:
  held (paralyzed, restrained, incapacitated, asleep, prone), frightened, slowed, blinded or
  hindered (its attacks rolled twice, the worse counting), marked (your blows on it rolled twice,
  the better counting), charmed or calmed (it stops fighting until hurt), pushed back (Thunderwave),
  an area that catches everything near the target (Fireball), and healing the caster for half
  (Vampiric Touch). 53 SRD spells of level 0 to 3 can be added. With spell slots on, the sheet and
  the spell buttons show slots where mana was.
- **Aimed for you**: a spell or a bow with nothing in front of you turns you to the nearest enemy
  in range first. Bandits, witches and wizards swing and cast with their own animations; animals
  and monsters lunge when they strike.
- **Bows and crossbows**: one you carry is shot with the attack key when nothing is in reach of a
  swing, by Dexterity; the smith sells a shortbow and a light crossbow. Fighters, rangers and
  rogues among your companions shoot too, as do people fighting back. Creatures the SRD gives a
  bow or spells use them from a distance (a setting): a bandit's light crossbow, a wizard's Fire
  Bolt and Magic Missile.
- **Weapons and armour by the SRD**: a thing's description is its stats, or (a setting) its name
  is: anything called a sword, a knife, an axe or a bow is that SRD weapon, and armour likewise.
  Armour sets your AC and limits Dexterity, attacks add a proficiency bonus, and creatures resist
  or can't bear some kinds of damage. The smith sells SRD weapons and armour.
- **Special attacks and conditions**: creatures use what the SRD gives them (a wolf's knock-down and
  Pack Tactics, venom, a frog's hold, a dragon's breath), and conditions land on you (prone, poisoned,
  grappled, blinded and the rest), each shown with its seconds and wearing off.
- **Dying, concentration and cover**: death saving throws at 0 HP (a setting), spells that need
  concentration and can be broken by a blow, and half cover from trees and boulders. Creatures keep
  or lose their nerve as the ruleset says, and pick whom to go for.
- **Spells to the ninth level**: 94 of the SRD's, growing with your level or the slot they're cast
  from, each kind with a look of its own (cone, beam, volley, light from above, touch).
- **A build from the SRD**: race, class, fighting style, background and skills, with what each class
  has by level (Sneak Attack, Ki, Rage, Lay on Hands, Divine Smite and more), usable in real time
  and in turn-based combat, and short and long rests with hit dice.
- **5e sheets from cards**: a persona's or a character's card with a sheet for the Engine's 5e
  ruleset sets their class, level, abilities, HP and spells here (a setting).
- **Magic items and loot**: worn magic from the SRD works by its name, potions heal by their dice,
  and beaten creatures that carry money have the ruleset's pocket treasure.
- **More moves**: Shove, Grapple, Help, Hide and off-hand attacks; Shield and Counterspell as
  reactions that cast themselves; the Grappler feat.
- **Aiming and a row of things to do**: tap a creature or a companion to aim at them (out of range
  is said, not spent), and Abilities, Moves and Spells each open from one button in a fight.
- **Companions by the rules**: class features, level, conditions and death saving throws for the
  people who fight beside you.
- **Wild Shape, mounted fighting and Ready**: a druid takes a beast's shape, blows and spells work
  from the saddle, and a readied attack goes off by itself. Animals and monsters have attack
  animations of their own.
- **Item stats in brackets**: a description sets stats only inside `[square brackets]`; without
  them the name decides. The tracker knows the format, and added items get their equip slot.
- **Smarter fights**: each bandit, puglin or skeleton has a way of fighting of its own; archers and
  casters keep their distance and take cover; casters pick their spell. Companions fight by class.
  Things are said in a fight, and the AI can write them and choose creatures' moves in turn-based combat.
- **Monsters of its own**: goblins, hobgoblins, bugbears, orcs, gnolls, kobolds, lizardfolk, ghouls,
  ogres, trolls and minotaurs of its own, modelled in Blender by ThatOneCan (`assets/scripts/`). Each carries its SRD weapon (and a shield, armour or rags) as part of its body, moves with
  the people's animations and fights by the SRD's numbers; the ogre, troll and minotaur are met one at
  a time, now and then, and ghouls only at night.
- **Monsters with shapes of their own**: a mimic passing for a chest, an awakened shrub, a shambling
  mound, a grick, an otyugh and a roper passing for a stalagmite, modelled in Blender by ThatOneCan with
  skeletons and movements of their own (`src/rigged.js`, played by three's AnimationMixer from
  `kit/creatures/rigged-<family>.pack.png`). The mimic, the shrub and the roper lie in wait as what they
  pretend to be until they move or strike. The shambling mound, the otyugh and the roper are rare. Each
  fights by its SRD stat block.
- **Caves that go down**: "Go in" at a cave's mouth takes you and your party down into the rock, a level
  at a time: a small cave of winding passages and chambers, then a cavern with rock pillars, a pool,
  fallen rocks, glowing crystals and sometimes a ruined tower, a camp or a shrine, or a dungeon, a
  stronghold or another cave, four levels down at most. It's dark: you carry a light, and the rock
  between the camera and you isn't drawn. Creatures that suit the place live there, picked for your
  level and tougher the deeper you go, and fights work as they do outside. The same cave always leads to
  the same places. Settings → World → Places → Caves, dungeons and strongholds turns it off, sets how
  many of a world's caves lead down, and turns the creatures down there off.
- **Creatures by the SRD**: a creature's HP, AC, attack and damage are the 5e SRD's where it has
  the creature (a wolf is its wolf, a stag its elk, the dragon its red dragon wyrmling), a setting
  that's on to begin with. Off, and for cattle, the alpaca and the shiba, they're the game's own.
- **Anything can be struck**: hostile creatures fight back, peaceful ones run, and people only if
  you turn on "Blows can land on people". Someone struck remembers it for good and becomes your
  enemy, whoever saw it remembers, and at 0 HP they lie out cold for two minutes. Nobody dies.
  In real-time combat someone you attack fights back (a setting, on to begin with): they swing
  their class's weapon or cast its spells at you, rolled against your AC or your saving throw,
  until they're down to a third of their HP or you leave them alone.
- **The beaten** lie where they fell for a few minutes. An animal can be harvested (hide, meat),
  an outlaw searched (coins, what they carried), and either carried and put down. What you beat
  stays gone for two days.
- **Defeat.** At 0 HP you go down, then come to where you fell, wake at home, or stay down until
  you press Respawn, as you set it. It can cost a quarter of your money or your experience toward
  the next level. Undefeatable holds your HP and mana at their most. Staying down, what beat you
  can stay over you (see "Fight display and defeat" below).
- **Keys.** With a keyboard, Settings → Controls → Keys gives any action another key.
- **Hotkeys.** The number keys 1 to 0 each do what you set in Inventory → Hotkeys: cast one spell,
  use up something you carry, or put on and take off something that has a slot in Quartermaster.
  The ones you've set are buttons in the chat window too.

Every number of days, minutes and cost above is a setting on the same page.

### Holds and throws

Creatures can catch hold of you or a companion, and big ones can throw you (`src/grapple.js`). It works in
real time, by turns and in a narrated moment. Each part has its own switch in Settings → Inventory → 5e
rules, under "Creatures use their special attacks", and all three start on. With fights off, or that
switch off, nothing grabs or throws.

- **Holds (the 5e SRD's).** Where a creature's SRD attack grapples, a hit holds the target: a roper's
  tendril from up to 15 metres off, which then reels them in 7.5 metres at a time; an otyugh's tentacle
  (Medium or smaller); a giant frog's bite; a mimic's pseudopod; and a shambling mound that lands both its
  slams engulfs them (blinded and restrained, a DC 14 Constitution save every round or 2d8 + 4). The
  escape DCs are the SRD's, built into `src/srd.js` with the rest of each creature's numbers
  (`scripts/build-wanderworld-srd.mjs`), so the gelatinous cube, the giant octopus and the giant
  constrictor snake will hold in the same way when they're added. The held can't walk away and stay
  where they're held. A bar at the top says what holds you and its DC, with a Break free button; pushing
  hard on the move keys tries too. Each try is the better of Strength (Athletics) and Dexterity
  (Acrobatics) against the DC; by turns it's the player's action. The hold ends when the creature is
  beaten, knocked back, stunned, runs, or lets go after a minute. Switch: "Creatures grab and hold".
  Off, a frog's or a mimic's grab is the plain Grappled condition, shaken off by itself.
- **Vines (Wanderworld's own rule).** An awakened shrub's blow, and a shambling mound's slam that doesn't
  engulf, can catch someone's legs: restrained for about eight seconds (a turn by turns), escape DC 10.
  Switch: "Vines catch your legs".
- **Throws (Wanderworld's own rule).** Anything Large or bigger with a Strength of 18 or more and no hold
  of its own (an ogre, a troll, a minotaur, and giants once they're in) sometimes grabs someone Medium or
  smaller and throws them: 3 metres at Strength 18, further for a stronger or bigger one. A Strength or
  Dexterity save against 8 + its proficiency + its Strength modifier avoids it. They fly in an arc, land
  prone, take 1d6 falling damage for every full 3 metres (at least 1d6) and get up. A throw never goes
  through a wall, a tree or a rock, or into deep water, and doesn't happen where fights are kept out.
  Switch: "Giants grab and throw".

By turns, "grapple" and "throw" are among the moves the AI can choose for a creature that has them. In a
narrated moment, who is held or thrown is in the lines the AI tells, so it hears of it only when AI
narration is on.

### Fight display and defeat

What a fight shows, and what happens when you're beaten and stay down (`src/fighthud.js` for the data,
`src/plates.js` for the nameplates, `src/fightbar.js` for the bar and the cards). None of the display
changes how a fight goes. It's in Settings → Inventory → Fight display, except the last switch, which is
under Combat.

- **Nameplates.** Each creature in a fight has its name, an HP bar coloured by how hurt it is (green,
  yellow, orange, red) and a mark for each condition on it (↓ prone, ☠ poisoned, ! frightened, ✋ held,
  # restrained, ✶ stunned, ≈ slowed, ✕ down). Companions and people fighting you have the bar over their
  name tag. A bigger creature's plate floats higher (its body is measured once). Plates fade with distance,
  fade out close to the camera, and ten at most are up at once; each is one canvas sprite, drawn again only
  when what it shows changes, and disposed as soon as it's not wanted. "Name and HP over heads": Always in
  fights, Sometimes (only one that's hurt, has a condition, is aimed at, or whose turn it is) or Off.
  "Also over hostile creatures in sight" shows them before a fight begins.
- **The turn order.** By turns, the bar at the top shows a card for each fighter in initiative order: name,
  HP bar and numbers, conditions, and a gold edge for whose turn it is. Under it, the last thing that
  happened in a few words ("The wolf bites at Zoey: a hit, 4 damage · 14 vs AC 12"); Before opens the
  lines before it, and the chat keeps every roll whole. The cards wrap, and scroll past a few rows, so it
  fits a phone.
- **In real time** a smaller list at the top shows you, your companions and what you're fighting, the same
  way ("Real time: who's in the fight, at the top").
- **Foes' numbers.** With "Show foes' exact HP" off, a foe's HP is a word (Unhurt, Scratched, Wounded,
  Badly wounded, Near death) and its bar moves in quarters.
- **Info cards.** Tap or click a name on a card, or a plate, for that one's card. A creature's comes from the
  5e SRD (`srd.js`, built by `scripts/build-wanderworld-srd.mjs`): size, type and alignment, AC, HP,
  speed, senses, challenge, ability scores, damage resistances, immunities and vulnerabilities, the
  conditions it can't be put in, and its traits and actions shortened to a line each. A companion's or a
  person's shows their class, level, HP, AC and conditions. "What you know of a creature": Everything, or
  Only what you've learned (to begin with): its attacks once you've seen it attack, its AC once you've
  fought it, and how each kind of damage you've dealt it went. The first time you open a kind's card you
  roll Intelligence (Arcana for dragons, elementals and monstrosities, Nature for beasts, giants, oozes and
  plants, Religion for the undead and fiends, History for people) against DC 10 plus its challenge rating;
  pass and you know all of it. It's rolled once a kind and kept with the world.
- **After a defeat.** With "When your HP runs out" at Stay down until you choose and "Staying down: those who
  beat you stay over you" on (Combat, on to begin with), what beat you stays near you and isn't counted away
  by New monsters every (it's in `herd.js respawn`'s keep set). An outlaw stands over you and, if a defeat
  costs money, takes it there and then (not again when you get up); a beast circles you; a monster stands
  guard. A line in the chat says who stands over you, and a card offers Plead (Charisma (Persuasion), or
  Wisdom (Animal Handling) with beasts alone, against DC 10 plus the strongest one's challenge rating, 2 more
  each try; the mindless can't be pleaded with), Wait (they may lose interest and go) and Struggle
  (Constitution against DC 10: up with 1 HP, and the fight is on again). With AI moments on, the narrator is
  told in one short line who stands over you, and the plea is told too, so you can play it out in the chat.
  Respawn gets you up at home at any time. Overridden by Undefeatable (you never go down), being indoors,
  and places where "Where people may confront you" keeps fights out (there they let you be). A quest can
  later take the player captive through `core.captive` (`fighthud.js overRole`); none does yet.

### Your party

How the people travelling with you follow you, sit and lie down with you, and move in a fight. It's all
rules, with no AI call unless you turn on the AI's words for asking. Settings → People → Your party has
a switch for each part, each explained.

- **Following, closely or loosely.** "How closely they follow": Close is the tight line just behind you;
  Normal (to begin with) is a little further back and out to the sides; Loose further still. In Normal
  and Loose, when you stand still a few seconds each wanders a step or two about their place and looks
  round. They come back when you move off, and run when they fall behind (`npcs.js FOLLOW_SPREAD`).
- **Sitting and lying down with you.** When you sit or lie down (a bench, a log by a campfire, a bed, a
  tent, or the ground with C), each takes a free seat near you, or a free bed when you lie down on one.
  With none free they sit on the ground beside you, with the people's sit-on-the-ground pose, and they
  get up when you do. "They sit and lie down when you do" off: they stand by.
- **Sharing your seat.** On a log, a bench, a bed or a tent's bedroll, those on the ground can share it.
  "With no seat for them": Ask (to begin with) has the first of them ask in the chat, with Yes and No
  to answer (or type yes or no; getting up is a no); Squeeze in has them just do it; Sit on the ground
  never shares. Up to four of you fit on one, packed closer the more there are (0.62 m apart for two,
  0.52 for three, 0.44 for four, closer than two bodies' width), sitting or lying side by side. The chat
  says how tight it is, and the AI is told (a companion is "sitting on a log by the campfire, squeezed
  together with" you; you are "squeezed together with" them). "The AI words their asking" (off to begin
  with) has the AI write the line they ask with, in one short call (`/combat-line` with `calm`); off, it's
  a plain line of the game's own.
- **Lying down in a tent.** A campsite's tent has Lie down as well as Sleep: you lie down awake on its
  bedroll to rest and talk, as on a bench, and the time goes on as usual. Your party may lie down beside
  you.
- **Moving about a fight.** "They move about in a fight" (on to begin with): in real time and in
  turn-based combat each companion goes where their role has them (`tactics.js allySpot`), instead of
  keeping their place behind you. One who strikes (a barbarian, fighter, monk, paladin or rogue) closes
  in on the nearest creature and works round it; an archer (a ranger) keeps a good distance, moving round
  to where nothing is in the way of a shot; a caster stays back behind you, never so far that their
  spells fall short. With "Creatures fight by their sort" on, archers and casters take cover behind a
  tree or a rock first, as creatures do. They walk and run with the same collisions as everyone else. In
  turn-based combat they move on their own turn, as far as a turn allows, and stay there until their
  next one; when the fight ends they come back to follow you. Off: they keep their place behind you,
  and in turn-based combat one who strikes still closes in.

### Abilities of your own

Inventory → Sheet → "Add your own ability" puts something you can do on your sheet, like the other lines
you add: a name, a few words on what it does, and if you like:

- **Uses** and when they come back: per short rest (the Sheet's Short rest button), per long rest (a
  sleep, which brings back the per-day ones too), or per day (each new day of the world). Left empty,
  it's at will. Uses left show as a number you can change by hand.
- **Dice** for what it does: damage, or healing. Damage goes at what's in front of you, played as a spell
  (an attack roll, or with a save, a saving throw for half); healing heals you.
- **A saving throw**: a DC and the ability it's made with (Dexterity, Wisdom…).

Use it with its Use button, from Abilities on the fight bar (in turn-based combat it takes your action),
a number key (Inventory → Hotkeys), or by typing `/use <ability>` in the chat. Each use is counted off,
and the chat says which come back after a rest. One with damage dice needs combat on; one with no dice
is told in the chat as done. Edit writes it afresh; untick it and Delete takes it away. The AI is told
your abilities with your sheet ("Fire Breath (2d6 damage, DC 13 Dexterity save; 1 of 2 left, per short
rest): a gout of flame"), and they're kept in the world's save (`sheet.js checkAbility`).

Companions can have abilities too (Inventory → Sheet → Your companions → "Add an ability for…"), kept on
a sheet of their own in the save. In a fight they use theirs now and then while they have uses: damage
at the creature they're after, healing on you when you're hurt, or on themselves. Their uses come back
with your rests, and the AI is told of them with your sheet.

### Factions and regions

Factions come from lore: `ww:faction:Thieves Guild` on an entry makes it the faction's lore,
`ww:member of:Thieves Guild` puts someone in it, and `ww:enemy of:The Crown` on a faction's entry makes
the two enemies. All of this runs on the game's own rules. The only thing the AI gets is one sentence,
and that can be switched off.

- **Standing.** Journal → Factions shows how each faction regards you, from −100 to 100, in words:
  Hated, Hostile, Wary, Neutral, Liked, Trusted, Honoured. It moves a little with what you do. An
  errand for one of its people, monsters beaten on its land and trading at its vendors (once a day)
  raise it. A blow at one of its guards lowers it, and beating one lowers it more. It moves at most 10
  a day, and helping a faction lowers your standing with its enemies by a third as much. The slider
  sets it by hand, and Lock keeps it where it is. It's saved with the world.
- **What it changes**, each with its own switch in Settings → World → Factions:
  - Prices at the faction's vendors (in its land, or where one of its people works): up to a fifth
    more when you're Hated, a fifth less when you're Honoured, on top of haggling.
  - While you're Hostile or Hated, its people won't talk to you.
  - Its guards come for you, as hostile creatures do.
  - Nowhere in its land counts as a safe place, not even its town. Without this, its guards keep to
    the rule for towns in "Where people may confront you".
  - With AI conversations on, one short sentence tells the AI how a speaker's faction regards you.
- **Regions with a purpose.** Travelling off the map's edge makes a new region, and it can be made for
  a purpose:
  - a faction's walled town, with banners in its colour and guards on its square and its watchtower;
  - a bandit stronghold, whose gate is a cave mouth in a hillside;
  - a few outposts with watchtowers;
  - a smaller town, or several hamlets;
  - a ruin over a dungeon, or a hillside of caves.

  `ww:region:east` on a faction's entry makes the region east of home its land. On any entry,
  `ww:region:north-east:stronghold` or `ww:region:far north:ruin` give a region a purpose.
  Journal → Factions can give the next region one way a purpose by hand, and quests do the same.
  Otherwise the world's seed decides, the same for the same world, giving a faction's land only to a
  faction that has none yet. Once a region has a purpose it keeps it. Off (Settings → World → Factions
  → New regions can have a purpose), every new region is countryside and hamlets.

- **Entrances.** A stronghold's gate and the mouths of ruins and caves are cave mouths. Each one names
  the deep place it leads to (`deep`: cave, cavern, dungeon or stronghold). What's inside comes with
  the deep places.
- **The map.** On a faction's land the region map has a border in its colour. Under it, Journal → Map
  shows the regions round you that you've been to, plus any your lore or a quest told of (paler). Each
  faction's land is in its colour, and a letter marks the other purposes.

A faction's town has the region's own people (see Regions and travel), its guards, and any of its
people your lore puts there; the region's own people aren't members of the faction. The guards wear the bandits' clothes until there's a guard model, and with bandits switched off
in Settings → Creatures there are none.

### Quests

Work to take on, from the noticeboard, from asking someone "Any work going?" in a conversation, or from
a lorebook entry keyed `ww:quest:<title>`. The game makes its own quests from what your world has, with
no AI; the AI can write them too, one call a quest (Settings → Quests, off to begin with).

- **Offered.** A card shows who's asking, what they want, the first step and the reward, with Accept and
  Decline. The noticeboard posts one note at a time, and a new one only a while after you take one
  (Settings → Quests → How often work is offered). Errands from the noticeboard are one-stage quests.
- **Stages.** Each stage is one thing the game can see happen: talk to someone, go somewhere, find so many
  of something, bring it to someone, beat so many creatures near a place, go down into a cave, free a
  captive held there, travel to another region, or choose an answer. Every stage is checked against the
  world before a quest is offered, so a quest you can see can always be finished.
- **The game's own.** Hunts near a place out in the country, things to find and bring, someone to ask and
  somewhere to look, a theft to get to the bottom of, a cave to go down into, a captive to free and a
  region to scout. The quests you've had lately are remembered, so the next one is a different kind.
- **The AI's.** One call writes a quest, all its stages at once, from short lists of the people, places,
  creatures, items, caves and regions here, and the lore entry's text for a `ww:quest`. Anything it names
  that the world hasn't got is matched to something close (the mill by its kind), and if that can't be
  done the quest is turned down and the game's own is offered. A conversation waits 20 seconds at most.
- **Other regions.** A stage in another region puts your waypoint at the edge that way, and the map of
  regions marks it with "!". A region a quest sends you to is given its purpose (a bandit stronghold,
  outposts, a ruin, a hillside of caves) when you accept, and keeps it.
- **What a quest owns.** A hunt's creatures are put in the world at its spot and stay through the
  monsters' respawns until it's done. A captive sits on the first level below the quest's cave (in a
  gaol's cell when there is one), and that cave always leads down while the quest needs it.
- **When things go wrong.** If someone a quest needs is gone from the world, a place has changed, or
  time ran out, the quest repairs itself where it can (another place of the kind), takes a turn when it
  has one (someone else saw it too, their kin hears the news, you make it right with the one you wrongly
  named), or ends, and the Journal says why. With the AI's quests on, one more call can write a new stage
  for a quest with no plan for what happened. Failure branches and time limits each have a switch.
- **Journal → Quests** lists open quests first, with their stages so far, then the finished ones. Track
  puts one on the line at the top of the screen and on the map; Give up keeps it, given up. Settings →
  Debug has "Finish this stage", "Fail this stage" and "Show this quest's state".

The game sets the rewards, not the AI: coins by the quest's length and your level, put in your inventory
when Quartermaster keeps it. Whoever gave you the work thinks better of you for it, and work for one of
a faction's people raises your standing with that faction.

### Regions and travel

Every region beyond home is made the first time you go there, from the world's seed and where it lies
on the map of regions, so the same world always makes the same regions. All of it runs on the game's
own rules. The AI is only called to describe a region when you arrive, and only if you switch that on.

- **Lands.** Each region is farmland, forest, hills, marsh, snowy highlands, rocky badlands or a
  lakeside. The far north is cold, and two slow patterns (how wet, how high) decide the rest, so
  neighbouring regions tend to be alike. A land has its own:
  - hills, mountain ranges, river and places out in the country (farms and a mill in farmland,
    cottages in the forest, ponds in a marsh, a lake about 50 m across at a lakeside, caves in the hills
    and badlands);
  - trees, rocks and ground (pines under snow in the highlands, dead trees and mud in a marsh, bare
    dirt and boulders in the badlands);
  - weather: a marsh is often misty, the badlands seldom see rain, and the highlands are always in
    winter;
  - monsters, with Settings → Creatures → Only where they'd be found on: forest, marsh, snow and
    badlands kinds turn up three times as often in their own land.

  Home keeps its own land, as it always had. A region's name and its settlement's name come from its
  land: the Reed Fens and Reedwick, Frostmark and Rimestead.

- **People.** Each region's settlement has an inn and a shop, and people of its own: someone at each
  inn, shop, smithy, temple, hall and farm (a few of each at most), and the rest in its houses with the
  land's work (woodcutters, eel-catchers, trappers, miners). Each has a name, a job, a home, a temper
  and a usual day (`schedules.js usualDay`). A hamlet has six people, a village nine, a town twelve, a
  city fourteen. They're made the first time the region is built and kept with it, so they're the
  same people when you come back, and what they think of you and remember is kept with the world.
  Only the people of the region you're in are about. Someone who joins your party comes with you to
  other regions and is about wherever you are.
- **Travel.** Walking off the edge works as before. Journal → Map lists every region you know (the
  ones you've been to, and the ones your lore or a quest told you of), nearest first, with its land,
  its purpose and whether a quest has something there. The map of regions above the list shows each
  land in its colour, the roads between neighbouring regions you know, and a ! where a quest has
  something for you.
  - **Walk there** goes by road through regions you know. Each region takes five hours on foot
    (Settings: two to eight), and a journey takes 20 hours at most. You arrive at the edge you came in
    by.
  - **Coach**, at an inn or a tavern, goes to any region you've been to in half the time, for a fare
    for each region on the way (Settings: free to 40 coins), taken from your coins. You arrive at the
    inn there.
  - The hours pass on the way (not with Settings → World → Time standing still), and everyone is
    where that hour has them. Your party and their animals come along.
  - Sometimes two or three hostile creatures of the land you arrive in are waiting on the road ahead
    (Settings: off, rare or often; half as often by coach; only kinds that are on in Settings →
    Creatures).
- **Settings → World → Regions and travel** has a switch for each part: lands, the regions' own people,
  the AI describing a region you arrive in (off at first; it needs AI moments), travel by road and
  coaches. It also sets the coach fare, the hours a region takes on foot and how often something meets
  you on the road. With lands off, a new region is plain countryside as before; regions already made
  keep their land, and a region's purpose (Factions) is given either way.

### Lorebook keywords

Wanderworld acts only on lorebook keys written `ww:<what>:<value>`, so an entry's ordinary trigger words
never set anything by accident, and an entry's title alone links nothing. `ww` marks the key as
Wanderworld's, `<what>` says what it's for, `<value>` is what's given. Put them in an entry's keys, next
to its usual ones.

- Spaces round the colons and capitals don't matter: `ww : owned by : Mira` is `ww:owned by:Mira`.
- A key with no `<what>` names what the entry is about: `ww:tavern1`, `ww:Mira`, `ww:world`.
- `you`, `me`, `I`, `player` and `persona` all mean you; `them`, `they`, `him`, `her`, `char` and
  `character` all mean the person the entry is about. `ww:i know:char` is `ww:you know:them`.
- Keys are separated by commas in the Engine's lorebook editor, so a key can't hold one; `-` and `:` in
  a value are fine (`ww:work:10:15-18:45`). Each key says one thing: repeat it for more.

Menu → Settings → Help in the game has this list too, and a prompt to give an assistant (Professor Mari,
or any) along with a lorebook so it adds or corrects the keys. Journal → World → Check ww: keywords
lists any it didn't understand, and why.

**What an entry is about**

| Keyword                            | On        | What it does                                                                                                                                                                                                                                                 |
| ---------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ww:tavern1, ww:home6, ww:forest1` | any entry | The entry is that place's lore. Places are numbered by kind (Journal → Places shows each one's). A number the world doesn't have yet is built: ww:smithy3 makes three smithies.                                                                              |
| `ww:tavern, ww:forest`             | any entry | Lore for every place of that kind.                                                                                                                                                                                                                           |
| `ww:world`                         | any entry | Lore that's active everywhere.                                                                                                                                                                                                                               |
| `ww:Mira, ww:you`                  | any entry | The entry is about that character (by their name), or about you.                                                                                                                                                                                             |
| `ww:character:Mira Saxton`         | any entry | The entry is that person (with no name after it, the entry's title is the name). A card you chose for the world with exactly that name is who it means; otherwise a person is made for that world from the entry, and one model call fills in their details. |
| `ww:faction:Thieves Guild`         | any entry | The entry is that faction's lore, active for each of its members.                                                                                                                                                                                            |

**Places**

| Keyword                   | On                 | What it does                                                           |
| ------------------------- | ------------------ | ---------------------------------------------------------------------- |
| `ww:name:The Gilded Stag` | a place's entry    | Names the place.                                                       |
| `ww:located in:town2`     | a place's entry    | Puts the place inside another place or group.                          |
| `ww:group of:home`        | any entry          | Makes a group of every place of that kind, with the entry as its lore. |
| `ww:closed:22-6`          | a place's entry    | When it's closed: its door says so and the AI is told.                 |
| `ww:owned by:Mira`        | a building's entry | Mira owns it. If nobody in the world is called that, a person is made. |

**People**

| Keyword                                                                                | On                  | What it does                                                                                                                                                                                                                                                         |
| -------------------------------------------------------------------------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ww:body:woman (or man)`                                                               | a character's entry | Their body, when they have no 3D model.                                                                                                                                                                                                                              |
| `ww:looks:tall, ww:looks:red hair, ww:looks:elf`                                       | a character's entry | How their built-in body looks: height (tall, short), build (slim, stocky, muscular, heavy…), pointed ears (elf, half-elf), hair (bald, long hair, red hair, blond…), skin (pale, tanned, dark skin), eyes (blue eyes…). One word a key; their Look card comes first. |
| `ww:lives in:home6, ww:works at:smithy1, ww:owner of:tavern1`                          | a character's entry | Home and work.                                                                                                                                                                                                                                                       |
| `ww:work:10:15-18:45, ww:home:22-7:15, ww:eat:12-13 at tavern1`                        | a character's entry | Their day (home, work, eat, visit, sit, walk), in quarter hours, over midnight if need be.                                                                                                                                                                           |
| `ww:temperament:aggressive (passive, gentle, calm, grumpy, fierce, aggressive)`        | a character's entry | What they're like with anyone they're against: how readily they square up.                                                                                                                                                                                           |
| `ww:manner:shy (shy, quiet, friendly, outgoing)`                                       | a character's entry | How readily they come over and greet people.                                                                                                                                                                                                                         |
| `ww:voice:gruff (natural, cosy, dramatic, witty, terse, gruff, formal, cheerful, sly)` | a character's entry | How they talk, instead of the setting's way.                                                                                                                                                                                                                         |
| `ww:member of:Thieves Guild`                                                           | a character's entry | Puts them in that faction.                                                                                                                                                                                                                                           |

**People and you**

| Keyword                                                    | On                  | What it does                                                                                                           |
| ---------------------------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `ww:enemy of:you, ww:friend of:you, ww:sister of:you`      | a character's entry | What they are to you. Any relationship (friend, rival, enemy, mentor, family…) or role (sister, father, wife…).        |
| `ww:sister of:Tam, ww:rival of:Fen, ww:friends with:Mira`  | a character's entry | What they are to someone else (one way; the other's entry says theirs).                                                |
| `ww:acts:rude (rude, aggressive, attacks, afraid, avoids)` | a character's entry | What they do when they see you, whatever they are to you: won't greet you, comes at you, attacks on sight, keeps away. |
| `ww:i know:them`                                           | a character's entry | You know their name from the start (a Stranger otherwise).                                                             |
| `ww:knows:you`                                             | a character's entry | They know your name from the start (they won't use it otherwise).                                                      |

**The world**

| Keyword                                            | On                       | What it does                                                                                            |
| -------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------- |
| `ww:settlement:city (hamlet, village, town, city)` | the entry keyed ww:world | The main settlement's size, where New world left it on Surprise me. (ww:town3 adds two hamlets.)        |
| `ww:walls, ww:size:large, ww:season:winter`        | the entry keyed ww:world | Walls, the world's size (small, normal, large, huge, massive), and the season (winter lies under snow). |

**Factions and regions**

| Keyword                                                                           | On                | What it does                                                                                                                                                                                  |
| --------------------------------------------------------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ww:region:east, ww:region:far north, ww:region:north-east:stronghold`            | a faction's entry | That region is the faction's land (or, with a purpose after it, its stronghold or its outposts). `east` is the region east of home; `far north` or `north 2` is two away.                     |
| `ww:region:west:ruin (faction, stronghold, outposts, town, hamlets, ruin, caves)` | any entry         | What that region is made for, when you first travel there: a bandit stronghold, a few outposts, a smaller town, several hamlets, a ruin over a dungeon, a hillside of caves. Kept once given. |
| `ww:enemy of:The Crown`                                                           | a faction's entry | The two factions are enemies: helping one lowers your standing with the other a little.                                                                                                       |

**Quests**

| Keyword                                                                         | On              | What it does                                                                                                                                                                                                                                        |
| ------------------------------------------------------------------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ww:quest:The miller's missing son`                                             | any entry       | The entry is a quest, and its text is what it's about. With AI quests on, one AI call turns it into stages; without, it's a short quest from the keys below. Asking the giver "Any work going?" offers it, or the noticeboard when it has no giver. |
| `ww:quest giver:Mira, ww:quest place:the mill, ww:quest reward:a sack of flour` | a quest's entry | Who gives it (someone in this world, by name), where it takes you (a place, by name or kind), and what's said of the reward when it's done.                                                                                                         |

**Creatures**

| Keyword                                                                                           | On                                                       | What it does                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ww:monster:Goblin, ww:creature:Deer, ww:hostile`                                                 | any entry                                                | Marks the entry as a creature (a monster, or a hostile creature, attacks). One the game has a body for (wolf, deer, stag, fox, dog, horse, donkey, cow, bull, alpaca) is put in the world where its entry says it's found; the rest are kept for later.                                                                                                                                                            |
| `ww:found in:forest1, ww:active:night, ww:pack:4, ww:size:large, ww:danger:2, ww:drops:wolf pelt` | a creature's entry                                       | Where and when it's met, how many together (1 to 10), how big (tiny, small, normal, big, large, huge, massive), how dangerous (1 to 10), and what it might leave. One thing each: repeat ww:drops:… for more.                                                                                                                                                                                                      |
| `ww:monster:wolf, ww:creature:deer:small:pack4, ww:monster:wolf:large:pack5`                      | a place's entry (`ww:forest1`, `ww:world`)               | That creature lives there. After its kind, in any order: a size, how many together (`pack5`, or just `5`), `tame` or `hostile`, `night` or `day` (when it's about). With none of them, however many and whatever size. A doubled colon reads the same: `ww::monster::wolf::large::pack5`.                                                                                                                          |
| `ww:tame, ww:hostile`                                                                             | a creature's entry                                       | What every one of that kind is like in this world: `ww:creature:Wolf` with `ww:tame` makes its wolves no danger; `ww:creature:Deer` with `ww:hostile` makes its deer one. `ww:active:night` (or `day`) on the same entry says when they're about.                                                                                                                                                                  |
| `ww:animals:none`                                                                                 | a place's entry (`ww:garden1`, `ww:forest1`, `ww:world`) | None of the world's own animals there: a place with a spot keeps them off it, `ww:forest1` keeps the country's away, `ww:world` has none anywhere. Animals the lore itself puts somewhere, and anyone's own, still are.                                                                                                                                                                                            |
| `ww:pet:horse:large:brown:Shadowmere, ww:pet:dog:small:Brutus, ww:pet:dog:great dane`             | a character's entry, or the one keyed `ww:you`           | Their own horse or dog. After the kind, in any order: a size (a dog's: small, medium, large, huge, massive), a colour (a horse's: bay, white, black, grey, chestnut, palomino, brown; a dog's: grey, brown, black, red, white, cream), its name (written with a capital), and anything else is its breed. One of each. What's chosen in their Look card comes first; without either, their lore's wording decides. |

Choose "link lorebook entries by their ww: keywords" (places) and "set up from ww: keywords"
(characters) in New world or Journal → World. With the AI setting things up instead, `ww:` keywords
still count, and come first.

### Known limits

- A scene needs at least one of your character cards: someone there, or the narrator card. The Engine
  casts its own characters only, so people a world invented can't be in scenes.
- Only the Engine's built-in picture style profiles are listed; your own default profile is "Engine default".
  The built-in styles' words are a copy of the Engine's, and a profile of your own is read from this
  browser's saved Engine settings, so on a device that has never opened the Engine's settings a custom
  default adds nothing.
- A region's own people are made by rules, with a name, a job, a home, a usual day and a line of
  description; they have no lore of their own until you give them some. People you or the assistant add
  in a region still count toward the world's thirty people. Engine characters all live in the home region.
- A journey of more than one region is told in a line and takes its hours at once; nothing happens in
  the regions on the way, and it takes 20 hours at most. A coach needs the Quartermaster inventory for
  its fare, and it goes only to regions you've been to.
- A deep place's entrance asked for by a quest is only added to a region that isn't made yet; a region's
  land is made once and kept.
- Walk-in rooms are unfinished and off by default (Settings → Walk into buildings). Furnishing your home
  needs them on. The room's own furniture can't be moved or taken away, only what you add; a piece is
  put down in front of you, not dragged about.
- Your household is by rules: anyone who knows you and doesn't dislike you says yes to moving in or
  coming round. There's no buying or rent, and a visit isn't a scene: someone who comes round is simply
  there. Visits aren't kept if you close Wanderworld in the middle of one.
- Market days and festivals bring people to the square and say so; there are no stalls, music or
  dancing of the event's own yet. Days are counted only while Wanderworld is open.
- Nobody but you rides, and the AI isn't told about animals or monsters (it is told you're riding). A
  rider sits astride with hands forward; a horse that's someone's own has a saddle but no reins, and the
  pose is the same at a walk and a gallop (the rider rises and falls with its back). Where a farm or wild animal was isn't remembered after you
  leave the world: it's back where the seed has it. A hostile one threatens or lunges (by the Hostile
  animals setting) and that's told in a line: there's no fighting, health or harm.
- Bandits, witches and wizards are monsters in all but looks: they can't be talked to, no two loads
  dress them quite alike, and a dragon overhead does what any hostile flyer does.
- A look can be chosen once someone lives in the world, and there are two outfits to mix. The hood
  goes over whatever hair they have. A piece given a colour of its own is that colour all over (its
  leather and trim too), and sleeves take the hands' gloves with them. The bare body is the pack's
  broader build, so where a bare piece meets a clothed one the join can show a little. Someone with a 3D model shows
  the model; their look is kept for when it isn't there.
- Tools in hand are simple shapes made in code (hammer, mug, sickle, seed basket, watering can, trowel,
  staff, sword), and the smith's swing is a wood-chopper's. The forge's hearth doesn't glow at night. A seller and a buyer
  at a stall don't talk to each other.
- Sleeping is in a campsite's tent only (not a bed, nor your own "/camp" fire), and nothing happens
  while you sleep but the clock: no events, no dreams, no AI call.
- Your party shares only the seat you're on, never one beside it, and squeezed in they can overlap a
  little, or the end of a bench. They don't follow you into a building's room, so a bed indoors is
  shared only with whoever is in there with you. Asking is for the first sit or lie-down; those who
  arrive later sit on the ground.
- A group out together is brought into a moment as one; a conversation (E on one of them) is still with
  that one person.
- Hamlets and inns have no stalls, so a shop's people there work indoors. The player can't work a spot.
- With Settings → Animation on Built-in, none of the new animations play: people sit for what's low to
  the ground and stand for the rest, and a jump only lifts you.
- A smithy's door stands at one end of its front. In a world made before 0.5.11 it has moved a few
  metres; the building, its number and who works there are the same.
- The AI's world setup reads the first 200 entries of the chosen lorebooks, 600 characters of each.
- The inventory is Quartermaster's: without that package there is none. Only the persona you play has a
  sheet (not your party or the townsfolk), items change only by what's narrated or by your own hand in the
  sheet, and the item and outfit editors Quartermaster opens keep the Engine's look. In a scene's chat the
  sheet is updated only if the Quartermaster agent is on in that chat.
- The AI assistant's Undo buttons last until you leave the world or press Start over (the chat's words
  are kept; its proposals aren't). Undo takes back only what the assistant changed; if you've since
  changed the very same thing yourself, yours stays. Something the assistant added (a person, a lore
  entry) goes even if you've edited it since. A scene it started isn't undone.
- What goes with a message to the assistant is chosen from its words; when that falls short the model
  asks for the missing part and is asked again, which costs a second call.
- Debug Mode (the Engine's, Settings → Advanced) writes every model and picture request Wanderworld
  makes, with the answer, to the Engine's console. It is read from the Engine's saved settings in the
  browser, since a Home tab isn't told it.
- Settings → Debug shows every model and picture call in the game, with Debug Mode on or off: totals
  (requests, answers, failures, tokens sent, received, cached and reasoning) and the newest 50 calls,
  each with what was sent and what came back. It is kept in the server part's memory and is gone when
  the Engine restarts. The cost is an estimate from the connection's model list (`GET /api/connections/:id/models`, read at
  most once an hour for each model): the Engine gives a package the token counts but not what the
  provider charged. Only Wanderworld's own calls are in it.
  Anything shaped like a key in a provider's error message is hidden before it is shown.
- The scattered, pond and quarters layouts are only built when chosen; "Surprise me" picks from the first four.
- Paralyzed, stunned or asleep, you, a companion or a creature fails Strength and Dexterity saves
  without a roll, as the SRD has it. A hit on someone paralyzed or asleep (the SRD's unconscious) from
  within 1.5 m is a critical hit. Simpler than the SRD on purpose: a blow that lands always deals at
  least 1 damage.
- Two browsers playing the same world at the same moment take turns: the save that reaches the Engine
  first wins whole, the other browser loads it, and nothing is merged. From the moment the Engine
  refuses its save, the other browser saves nothing of that world until it has loaded it again: at
  once, or when the menu closes if it's open.
- Prompt caching is the provider's to do; Wanderworld only orders its prompts so that it can. The AI
  assistant, scene plans and Illustrate aren't reordered.
- A bridge is built only where a road crosses the river; a place with no road to it (a cave) has none.
  Swim, or ride across.
- A world holds 60 lore entries of its own, each as long as you like.

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
  `styleFor` dresses each building from where it stands (tints, ridge, windows, dormers, porch, ivy)
  without spending the town's own random numbers, so nothing moves; `forgeBay` opens a smithy's forge.
  A plaster ground floor stands on a stone course all round; upstairs has none.
- `src/zones.js` names the places of a world, finds the place at a point, says where someone is in words,
  and holds the setup logic: groups, numbered names, keeping the setup through a regenerate, and reading
  lorebook keywords (`matchLore`, `structureFromLore`, `needsFromLore`).
- `src/npcs.js` runs the townsfolk: each follows their day's schedule (`src/schedules.js`) and, between
  its entries, a small plan (walk, sit, go in, chat, wait); routes along the streets in town and straight
  across country (by a bridge over the river, by the gates of a walled town), swims, follows the party,
  and acts on relationships and temperament. The world marks spots to work and rest at (`world.spots`:
  the forge, stalls, fields, gardens, pond shores, meadows); someone takes one, is "busy" there doing its
  act, and leaves the way they came in.
- `src/animals.js` is the animals' bodies (a second kind beside the humanoid: each kind's own skeleton
  and clips from `kit/creatures/`, a file a group, made by `scripts/build-wanderworld-animals.mjs`; a
  horse's or a dog's coat is the same body in other colours, `COATS`), and `src/herd.js`
  which animals a world has, where they go, and handing one to a rider (`main.js ride`, `dismount`).
  Monsters are animals of the `monsters` group. Those on two legs (`folk`: the imp and the puglin from
  `kit/fantasy/folk/`, and the bandit, witch and wizard, who are default people dressed for it) are
  built by `people.js` and moved by the people's clips, with an animal's handles on them. Eleven
  (`built`: the goblin, hobgoblin, bugbear, orc, gnoll, kobold, lizardfolk, ghoul, ogre, troll and
  minotaur) are Wanderworld's own, modelled in Blender (`assets/scripts/make_*.py`, packed into
  `kit/fantasy/folk/folk-built-<family>.pack.png` by `scripts/build-wanderworld-people.mjs --bestiary`; how, in
  `AGENTS.md`), and load like the imp and the puglin. `src/bestiary.js` still builds each in code from
  shapes bound to the built-in person's skeleton (`figure.js figureFrom`), as the fallback when the kit
  has no model for it.
- `src/social.js` moves relationships on with time spent together and keeps the record of it;
  `src/memory.js` is each person's own memories; `src/household.js` the rules for the player's home
  (empty houses, moving, who's asked in and out, visits, furniture); `src/events.js` market days and
  festivals. All four are plain rules with no model call, each with its own regression suite.
- `src/relationships.js` holds relationship kinds, tiers and warmth, temperaments, and reading
  relationships from lore keywords; `src/dialogue.js` the set conversations; `src/interactions.js` the
  things you can do with doors and things, and the scene requests they make.
- `src/character.js` applies motion to any humanoid and reads the Engine's personas, characters and
  character folders; `src/clips.js` plays the recorded clips (`src/clips/ual.json`, made by
  `scripts/build-wanderworld-clips.mjs`): walking and running by speed, and what's done on the spot
  (`ACTS`: work, rest, sitting or lying on the ground), a jump and one-off gestures; `src/motion.js` is the hand-made motion; `src/models.js` loads
  3D Avatars models (VRM, GLB, FBX, MMD) into three-vrm humanoids; `src/people.js` and `src/figure.js`
  build the default people (`people.js` also the monsters on two legs); `src/avatar.js` builds the built-in
  body (docs/AVATAR.md) and `src/preview.js` the Look card's turning picture of it; `src/looks.js` is what a
  look can be, with presets.
- `server.mjs` is the server part (hand-written, syntax-checked by the build): routes under
  `/api/wanderworld` for status, the connection and preset lists, conversation replies, moments, day
  plans, world setup from cards and lorebooks, pictures and the gallery, the AI assistant, scene plans, scene creation, and scene contexts and recaps, plus a
  scene origin for the Engine. Every request body is checked there, and so is what a model answers: the
  assistant's changes are read field by field (`readAssistant`) before the client ever sees them.
  `src/assistant.js` is the assistant's chat (`src/assistant-context.js` chooses what goes with a message,
  `src/assistant-edits.js` what you may change in a proposal, `src/undo.js` takes a set of changes back); `main.js` (`applyAssistantEdits`) checks each change against
  the world, shows it, and makes it through the same setters the Journal uses. `src/ai.js` is the client's side of
  it, `src/map.js` draws the maps, `src/weather.js` the weather, `src/pack.js` the setting pack (the things to use, what's said about them
  and places when no AI answers, and the errands: every word of the setting, so another setting is
  another pack), `src/setup.js` sums the AI's setup up for the review, and `src/illustrate.js` and
  `src/floating.js` the Illustrate window and the floating windows. `src/inventory.js` is everything
  Wanderworld asks of Quartermaster.
- `src/saves.js` keeps the saved worlds (every field checked on the way in) and `src/store.js` holds
  them as the Engine has them (read once, written through, read again when the tab is shown); `src/menu.js` is the main
  menu, `src/journal.js` the Journal, `src/hud.js` the bar, panels and cards, `src/talk.js` conversations
  and speech bubbles, `src/signs.js` signs and the noticeboard, `src/ui.js` the parchment look,
  `src/sound.js` Web Audio sounds, `src/settings.js` the settings, `src/kit.js` the kit's models,
  `src/input.js` the keyboard and the touch stick, `src/person.js` the Edit people window, `src/keywords.js`
  the `ww:` keywords and their list, and `src/help.js` the in-game Help and Credits.
- `src/interiors.js` builds the (unfinished) room behind a door, off by default, with whatever the
  player has put in it (`household.js` FURNITURE).
- three.js 0.186.1, `@pixiv/three-vrm` 3.5.5 and `mmd-parser` 1.1.4 (the versions the Engine uses) are
  bundled into `client.js`, because the Engine does not hand its copies to packages.

Performance targets: about 30 fps on a mid-range phone and 60 on a desktop. The picture is drawn at
1080p unless Settings says otherwise, nature and real lights follow the player, and fog hides the far
edge. Readings by draw distance and tree density are in [docs/PERFORMANCE.md](docs/PERFORMANCE.md).

### Caves and caverns, and the levels below a cave's mouth

`src/deep.js` runs the deep places (docs/QUESTS.md section 8). Its header describes the level plan, the
plain data every kind of level is made from. One level is loaded at a time, in a scene of its own, as a
house's room is.

- `deepPlan(seed, depth, kind)` gives a level's plan: a cave or a cavern from `src/deepcave.js`, a
  dungeon or a stronghold from `src/dungeon.js`. The seed comes from the world's seed, the cave and the
  depth (`deepSeed`), so the same entrance always leads to the same place. `leadsDown` says which of a
  world's caves lead down at all.
- `deepcave.js` lays out a cave (an entry chamber, one or two chambers along winding passages, a side
  den) or a cavern (one big chamber with pillars, water, rubble, crystals and sometimes a ruined tower,
  a camp or a shrine from the kit). Passages are never narrower than 3 m. The rock's edge is the rooms
  and passages worn back by noise, which only ever widens them (`openAt`), and the colliders are the
  rock beside the floor, half a metre at a time.
- `createDeep(plan)` builds the level: for a cave or cavern, one merged mesh of floor, walls and roof
  carved from `openAt` by marching squares (2,000 to 10,000 triangles); for a dungeon or stronghold,
  `dungeon.js buildDungeon`. A shader change leaves out whatever is between the camera and the player,
  and the roof just over them. The player carries a light, and only the four of a level's own lights
  nearest the player are lit.
- Creatures down there are a herd of their own (`herd.js`, given the level as its world), from
  `creaturesFor(plan, level)`: kinds by the kind of place, no tougher than the party's level allows,
  at the plan's spawn spots. While the player is below, `main.js` keeps the world's own herd aside
  (`core.outdoors`) and the party moves into the level (`npcs.js moveParty`).
- `tests/wanderworld-deep.regression.mjs` checks every kind's plans: the same each time, every room
  reachable, passages wide enough, the way in, the way down and every spawn on the floor, and nobody
  walking about getting into the rock.

### Dungeons and strongholds

`src/dungeon.js` makes the dungeon and stronghold levels of the deep places (docs/QUESTS.md section 8).
`dungeonPlan(seed, depth, kind)` returns one level as plain data, in the level plan the deep places
share with the caves and caverns: rooms, corridors, doorways, the kit pieces to place, colliders, torch
lights, the way in, sometimes a way further down, and spawn spots tagged guard, boss, captive or wander.
The same seed, depth and kind always give the same level.

- A dungeon is a crypt (tombs and a pillared hall), a ruin (rubble, crates, sometimes a camp) or a vault
  (guardrooms and a treasure room behind a door). Its end is the room farthest from the way in, where the
  boss waits. Half the time a far wall has given way into natural rock, and that leads down to a cave.
- A stronghold is a keep: a gatehouse, the hall, barracks, a store room, a gaol with two or three barred
  cells, the leader's room behind a door, and a cellar whose trapdoor sometimes leads down to a cave.
- Rooms and corridors are laid on a 4 m grid. Each room hangs off an earlier one by a straight corridor
  one to four cells long, with an arch at each end. Walls, arches and the columns where walls meet come
  from that grid, and furniture stands against the walls, clear of the doorways.
- `buildDungeon(plan)` lays a plan out in a three.js Group: one InstancedMesh per model part, a few dozen
  draw calls a level, with doors and bars as meshes of their own so they can be opened. It returns the
  colliders as boxes for `world.js createCollider`. Lights are left to the caller.
- The pieces are Quaternius's Updated Modular Dungeon, in `kit/fantasy/dungeon/` (one `models.pack.png`,
  about 0.1 MB, flat colours and no textures). Its 2 m floor, wall and stairs are drawn at twice their
  size. Barrels, crates, beds and tables come from the props kit, and the rock where a wall has given way
  from the nature kit.
- A level stays under 650 pieces and 600,000 triangles (about 400 pieces and 500,000 triangles at most
  so far), so a phone can draw it. `tests/wanderworld-dungeon.regression.mjs` checks this, and also that
  every room, spawn and the way down can be walked to at the player's size, that doorways meet their
  corridors and nothing stands in them, and that no two pieces stand in each other.

### Quests

`src/quests.js` is the rules, as plain data in and out (docs/QUESTS.md sections 1 to 4); `src/questplay.js`
connects them to the running game, and main.js calls it from a few places marked "Quests".

- A quest is saved in `save.quests`: its stages, the one it's at, its state (offered, active, done,
  failed, given up), what it owns (a captive), its reward and its log. Each stage has one goal, a verb
  naming what it needs by id: `talk` (a person), `go` (a place), `bring` and `gather` (an item and how
  many), `defeat` (a kind of creature, how many and the spot), `deep` and `rescue` (a cave), `region` (a
  region's key) and `choose` (options, each with its own next stage). A stage's `fails` say which branch
  a failure goes to: someone `gone`, or `late`.
- `builtInQuest(key, world, { giver, recent })` makes one from the world's facts (`questplay.js facts`:
  who's here and where, named places, country places, the creatures that can be met, what can be
  gathered, caves, the regions ahead), the same for the same key. `checkQuest` checks every stage
  against the world and that every stage leads to an end; `questCheck` does it again on load, on each
  change of region and every ten seconds, repairing a stage or failing it to its branch.
- `questEvent(quest, event)` is the only way a stage moves on. The events come from the game: a
  conversation begun (`talk`), the zone check once a second (`at`, `have`), a creature beaten (`beat`),
  a level entered (`deep`), a captive freed (`free`), a choice in the Journal (`choose`).
- `questFromWords` checks what the AI wrote (server.mjs `/quest-write`, one call, 700 tokens at most),
  matching each name to an id by whole words or by a place's kind. `adaptQuest` puts in the stage the
  `/quest-adapt` call wrote. Both calls show in Settings → Debug like any other.
- What a quest puts in the world: `questSpawns` gives a hunt's creatures to `herd.js setSpawns` (as the
  lore's are), and `spawnKeep` their ids for `respawn`'s `keep`. `captivesAt` and `captiveSpot` put a
  captive on a cave's first level, and `needsCave` makes that cave lead down.
- Regions: `questplay.js questRegion` gives the region a quest targets its purpose on Accept, through
  the same rule as `factions.js purposeAhead`, and the regions it can target come from `aheadOf`. Those
  two are where richer travel between regions connects.
- `simulateQuest` plays a quest to its end by the events that finish each stage, failing the ones asked
  for. `tests/wanderworld-quests.regression.mjs` plays every built-in kind through, fails each stage
  in turn, feeds in AI-shaped quests with names the world hasn't got, round-trips the save, and checks
  that a quest's region keeps its purpose and its creatures stay through a respawn.

### Regions beyond home and the quest hook

`src/regions.js` holds the rules for regions beyond home, and `src/travel.js` the rules for journeys
between them. Both take plain data and give plain data back. `main.js` ("Regions and travel") builds the
region, moves the party, passes the time and takes the fare.

- `landAt(worldSeed, key)` gives a region's land from the seed and its place on the map: smooth value
  noise for wetness and height, plus coldness that grows to the north. `landOf(save, key)` gives the land
  a region was made with, else one a quest planned, else the seed's. `LANDS` describes each land's
  landscape, weather, monster habitat word and work. `world.js LAND_LOOK` sets its trees, rocks, plants
  and ground, and `landscape.land` carries the land into `createWorld` and onto `world.layout.land`.
- `makeRegion(worldSeed, key, { land, purpose, arrive, deep, number, name })` gives a new region's
  record. It starts from the seed's landscape (`landscapeWith`), then applies `landscapeForLand` and
  `factions.js landscapeForPurpose`, and adds the cave a quest asked for. It also sets `needs: { tavern:
1, shop: 1 }`, which `world.js` builds as extras, so every settlement has an inn and a shop. A lake is
  a pond outpost with `lake: true` (`land.js LAKE_RADIUS`, 24 m).
- `regionFolk(worldSeed, key, zones, { land, settlement, town })` makes the people from the region's
  zones. It returns `{ folk, housing }`. Their ids are `local:folk.<x>.<z>.<n>`: "local:" so the server
  takes their card from the client, with no comma, so the server's id check passes. `main.js settleRegion`
  runs once, the first time the region is built, and keeps them in `save.regions[key].folk`. Their homes
  and work go into the region's setup (`housing`), and from then on they're `peopleOf`'s like any local.
  `folkHere(save)` gives the people of the region you're in and any party members from other regions.
  They're added to the cast while you're in their region and left out of `save.cast`.
- `routeTo(save, from, to)` finds the shortest way through known regions (`knownKeys`: home, the regions
  made, purposes lore or a quest gave, and `travel.heard`). `journeyTo(save, to, how, settings, atInn)`
  gives `{ path, hours, fare }` or `{ problem }`. `chargeFare(items, currency, fare)` says what to do to
  the purse. `encounterFor(land, odds, steps, how, allowed, seed)` gives what waits on the road, if
  anything. `regionSpawns()` puts it in the herd as lore spawns until you leave the region.

**The quest hook** (`main.js`, at the end of "Regions and travel"). The functions are also on
`core.travelHook` for the console, with "wanderworld-debug" on.

- `questRegion({ side, distance, land, purpose, faction, quest, from })`: Finds or plans a region `distance` regions (1–6, default 1) `side` of `from` (default: where the player is; no side: one the quest's id picks) that fits `land` (a `LAND_KINDS` name) and `purpose` (a `factions.js PURPOSES` kind; `faction` for a faction's land). A region already made fits only if it already is what's asked; one not made yet is planned (its land in `save.travel.planned`, its purpose in `save.purposes` with `from: "quest"`) and goes on the map as heard of. It walks on up to five regions further to find one that fits. Returns `{ key, name, made }` or null.
- `questTarget({ id, quest, region, kind, name, what, near })`: Puts a target in a region. `kind` is "person" (made one of the region's people, with `what` as their description), "item" (a gold marker to pick up into the inventory), "creature" (`what` is the kind: one hostile spawn) or "deep" (a cave mouth leading to `what`: cave, cavern, dungeon or stronghold; only in a region not made yet). `near` is a kind of place to put it by ("inn", "ruins", "cave"…). The target gets its spot when its region is built, is marked ★ on the region map and ! on the map of regions, and is kept in `save.travel.targets`. Returns the target or null.
- `questTargets(quest)`: Lists the targets with `here` (it's in the player's region), `at` (its spot), `person` (the region person's id) and `beaten` (a creature target beaten: `save.beaten["<region>|lore:quest|<id>:0"]`).
- `finishTarget(id)`: Marks a target done: it leaves the map and the world. Picking up an item does this by itself.
- `journey(key, how)`: Sets off by road (`"walk"`) or coach (`"coach"`), as Journal → Map does. Returns "" or a reason it can't.

**What a save keeps** (`saves.js`, each part checked; older saves load with the defaults):

- `regions[key].landscape.land`: the land (none in regions made before lands).
- `regions[key].needs`: `{ tavern, shop }`.
- `regions[key].folk`: the people, as `[{ id, name, body, job, temper, of, about?, quest? }]`, about 100
  bytes each. Regions made before have none until their next visit.
- `regions[key].vendors` and `homeSetup.vendors`: each region's shops, swapped in and out with the rest of
  its setup. A region made before this kept home's, and home gets its own back.
- `travel`: `{ planned: { [key]: { land?, quest?, deep? } }, heard: [keys], targets: [...] }`.

A region person's relationships and memories are kept by id in `relationships` and `memories`, as
everyone's are.

## Building and testing

```bash
node scripts/build-wanderworld-package.mjs
```

Edit `src/` or `server.mjs` and rebuild; never edit `client.js`, `manifest.json` or the artifact by hand.
Bump `VERSION` in the build script and add a `CHANGELOG.md` entry first. The regression suites are
`tests/wanderworld*.regression.mjs`, each run with `node`. The kit's files are made from the downloaded
packs by `scripts/build-wanderworld-kit.mjs`, `build-wanderworld-people.mjs` (also `--folk`), `build-wanderworld-animals.mjs` and `build-wanderworld-srd.mjs` (the SRD's spells and classes, from the `ruleset-5e-2014` package); [kit/CREDITS.md](kit/CREDITS.md) says which pack each needs.

## Credits

Spells, classes, class weapons and creatures' numbers include material from the System Reference Document 5.1 by Wizards
of the Coast LLC (https://dnd.wizards.com/resources/systems-reference-document), licensed under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/legalcode), in the machine-readable form of
the [Open5e API](https://github.com/open5e/open5e-api) project, taken from this repository's
`ruleset-5e-2014` package by `scripts/build-wanderworld-srd.mjs`. It has been adapted: only names,
levels, classes, dice, damage types, saving throws and ranges are kept (and for creatures their ability
scores, speeds, senses, what they resist, and their traits and actions shortened to a line each), and what a spell costs in
mana is Wanderworld's own. Not affiliated with or endorsed by Wizards of the Coast.

The buildings, props, nature, townsfolk and recorded animations are converted from free packs by
[Quaternius](https://quaternius.com), released under
[CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/): Medieval Village MegaKit,
Fantasy Props MegaKit, Stylized Nature MegaKit, Universal Base Characters, Modular Character Outfits -
Fantasy, Ultimate Animated Animals, Monster Pack Animated, Easy Animated Enemy Pack, Farm Buildings, Updated Modular Dungeon (the dungeons and strongholds), Ultimate Modular Men, Ultimate Modular Women, and the Universal Animation Library and Universal Animation Library 2.

The gallows, pillory, cage, signposts and crystals are by iPoly3D (Medieval Torture Devices, Signs pack
and Crystal Pack on Poly Pizza), also CC0 1.0. Thank you, iPoly3D.

The imp and the puglin are from Quaternius's Bestiary - Dungeon Monsters Kit, which is under the Quaternius Asset License (QAL) v1.0 (https://quaternius.com/license.html) and not CC0: free to use in a game, not to pass on as assets.

Base mesh and shapes: MakeHuman (CC0), adapted in Blender by ThatOneCan: the built-in body
(`assets/scripts/make_avatar.py`, read by our own code from MakeHuman's hm08 mesh and morph targets),
and the giants' base body made from it (`assets/models/giant-base.glb`).

MakeHuman system assets (skins, eyes, eyebrows, eyelashes): CC0, read as data by `make_avatar.py`.

Made in Blender by ThatOneCan (`assets/scripts/make_*.py`), on the people's skeleton
(`kit/fantasy/folk`): the goblin, hobgoblin, bugbear, orc, gnoll, kobold, lizardfolk, ghoul, ogre,
troll, minotaur, skeleton, zombie, ghost, specter, earth elemental, hill giant, stone giant, frost giant
and fire giant. The giants start from one base body, `assets/models/giant-base.glb`, a copy of the
built-in body.

Made in Blender by ThatOneCan, each with a skeleton of its own (`kit/creatures`): the mimic, awakened
shrub, shambling mound, grick, otyugh, roper, gelatinous cube, basilisk, air elemental, fire elemental
and water elemental.

Credit required (CC-BY 3.0): Saddle by Poly by Google (https://poly.pizza/m/dSMm_V4sKNr), CC-BY 3.0
(https://creativecommons.org/licenses/by/3.0/), modified: converted, resized and its texture shrunk. Its
maker has not endorsed Wanderworld.

Thank you, Quaternius. The full list, with which folder comes from which pack and how to rebuild or
remove each, is in [kit/CREDITS.md](kit/CREDITS.md) and [src/clips/CREDITS.md](src/clips/CREDITS.md).

The menu art, logo, loading screen, store banner and ground, water and wood textures were made for
Wanderworld by its author with ComfyUI. three.js, `@pixiv/three-vrm` and `mmd-parser` are
bundled under their MIT licences, with their notices kept in `client.js`.
