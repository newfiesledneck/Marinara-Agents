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

What it asks for on install, and why: `routes` and `storage` (its own `/api/wanderworld` routes, scene
contexts and recaps, and the picture gallery), `scenes` (starting Engine scenes from the world and getting
their recaps back) and `network` (calls to your own Engine on this machine for the connection list, image
generation and scene creation; nothing else leaves the machine except through your Engine connections).

Worlds are saved in this browser's storage, one save per world; they don't follow you to another browser
or device yet. Uninstalling removes the package; saved worlds stay in the browser until you delete them
from **Load world** or clear the site's data.

## What it does now (0.5.65)

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
- **Choose a look:** for anyone without a 3D model, your persona included, the Look button beside the
  body choice opens a card: an outfit (townsfolk, or the ranger), or each piece of one from either (top,
  sleeves, legs, boots) or None for any of them (the body shows there, in dark underclothes: bare arms,
  a bare chest, bare feet), the ranger's hood and pauldrons on or off (on anyone), each outfit's cloth, a
  colour of your own for any piece (the square beside it), hair, hair colour and skin (from a list, or
  any colour you pick), beard and height. The colour picker has its own Use this colour, No colour and
  Cancel buttons. Changes show at once and are kept with the world; Reset forgets them. About one in
  four people is dressed as a ranger unless you choose.
- **A living town:** townsfolk visit shops and the tavern, sit on benches, find their way along the streets,
  go to work by day if they have a job (indoors, or out at the forge, a market stall or the fields: see
  Playing), rest in gardens, by ponds and in meadows, head home at night, and cross the river by a bridge
  or by swimming. Friends meet up and hold little conversations, taking turns; name tags are tinted by how each
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
  and your own entry (`ww:you`), whose lore is always active and can give you a home (you start at
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
  gallery. It moves, resizes and stays open while you play. The picture fills the window; the gallery, the
  template (with every placeholder explained), the size and the rest are a scroll down, folded. Pick the
  picture's size (a few usual ones, or your own width and height). "Improve the prompt with AI" has a model
  rewrite the filled-in template first, on a connection of its own if you like (apart from the one
  conversations use), to an instruction you can edit (sentences or tags), and can show you the result to
  change or approve before it's painted. The rewrite is also given the last lines of the chat, so the
  picture shows what you're doing now (kneeling by the pond), not only where you stand. A sentence of the
  template whose placeholders all come out empty is left out. `{world_look}` says what the world looks like
  wherever you are (yours to set in Journal → World), so pictures match it; `{setting}` is only what you
  wrote in the world's Setting box. Appearances are used whole, however long.
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
- **Scenes:** "Play it as a scene" on a door's or a thing's card opens the moment as a roleplay scene in
  the Engine with everyone there (one of your characters at least), your persona and the world's lorebooks.
  Wanderworld plans it itself (point of view, tense and prompt preset from Menu → Settings → AI, and the world's
  scene instructions from Journal → World), so the Engine's scene dialog doesn't come up. When it ends,
  its recap comes back to Journal → Here.
- **Pictures:** Journal → Here → "Picture this place" paints where you are through your image connection.
- **Menu → Settings → AI:** AI conversations on or off, which connection writes conversations, which plays scenes,
  which paints pictures (each can be the Engine's default), how people talk, reply length, creativity, the
  scene point of view, tense and prompt preset, and the picture style (the Engine's built-in style
  profiles, or your default one).

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
  world keeps everything in its own save in this package's browser storage: where you were, the time, the
  cast, bodies, relationships, lore, groups, homes, schedules, notes, scenes and the last of the chat.
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
- **People remember what mattered:** beside their everyday memories (the newest fourteen), each person
  keeps up to eight lasting ones that small talk never pushes out: a scene you played together, a night
  at your campfire, joining or leaving your party, moving house, an errand done, falling out or growing
  closer. How many of each is a setting, with
  numbers of their own for anyone (family who remember more). In Journal → Edit people a memory can be
  reworded, deleted, or pinned: a pinned one is locked and never pushed out, and you can write one too.
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
  separation, Settings → AI → "A call for each person who answers" (off by default) writes each reply in
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
  of the river, and the wild ones bolt when you come close. Horses come in seven coats and dogs in four,
  so a world's horses are a mix. A world's animals, and their coats, come from its seed.
- **Avatar:** when a persona's or a character's card has a 3D model, their Look card has Avatar at the
  top: the card's own model (the default), another kind the card has (VRM, GLB / FBX, MMD), or the
  built-in person, dressed by the rest of the card. Kept with the world.
- **Animals of your own:** the Look card (Menu, Look beside your persona) has Dog and Horse: the kind,
  the coat, the size, a name of its own, and whether each is with you or at home. With you, it follows and turns up beside you if left
  far behind; at home it keeps by your door (or the tavern's, with no home of your own), and a horse got
  down from walks back there. Someone in town whose lore mentions their dog or their horse has it at their heel (the horse is theirs,
  not yours to ride); their Look card can change it or take it away. Kept with the world. The chat window has Send dog home and
  Send horse home while they're with you (each asks once more first), and the Journal's Party tab lists
  your animals, and the dog of anyone travelling with you, with Send home and Call along.
- **A world that goes on without you** (by rules alone: no AI call, and only while Wanderworld is open).
  People who spend time together grow a little closer, slowly: a step for an evening, two a day at
  most, a tier in a few weeks. Two short-tempered people sometimes have words instead, and friends who
  never meet drift apart. Each relationship has a Lock (it never moves by itself) and an Attraction
  level with its own lock, in Journal → Edit people; one set by hand moves on from there. Journal →
  Relationships ends with Lately, the record of it, and coming back to the town or the country after
  a few hours away says what happened there. Settings → Living world has a switch for each part.
- **Out in the country, more to find:** a gallows, a pillory and sometimes a cage beside a watchtower,
  crystals pushing up among the standing stones, a signpost off the corner of an inn or a cottage.
- **Market days and festivals:** once a week it's market day, once in four weeks an evening festival;
  for those hours a good share of the town gathers in the market square, and a line says so
  (`src/events.js`; rules only, with a switch in Settings → Living world).
- **Your household (Journal → Home):** move into any house that stands empty, with whichever of the
  people you live with you choose (the rest stay); ask someone to move in, or a housemate to leave;
  have someone round for a few hours. Inside your home, the same tab furnishes it: eighteen kinds of
  piece, put down in front of you and taken away again, kept with the world. Rules only
  (`src/household.js`): no AI call.
- **Costumes:** the Look card's "Dressed as" swaps the built-in person's clothes for a whole
  ready-made character (king, farmer, adventurer man or woman, witch, hooded rogue), keeping their own
  skin, hair colour and height. From Ultimate Modular Men and Women, moved by the same animations.
- **Hostile people:** bandits (hooded, sword in hand), witches and wizards (pointed hat, staff), out
  in the country with the monsters and counted with them. Built from the people's own bodies and
  outfits; nobody's character, so not talked to, and no AI is used for them.
- **Monsters:** slimes, skeletons, giant spiders, giant rats, snakes, bats, giant wasps, giant frogs,
  imps and puglins (pig-goblins; the last two walk on two legs, with the people's animations), and
  now and then a dragon high overhead, out in the
  country, alone or in twos and threes; skeletons and bats only at night. The Monsters slider says how
  many, each kind has its switch, and they act as "Hostile animals" says. A lorebook can place them:
  `ww:monster:slime:large:pack3` on a place's entry. Nothing fights back yet.
- **People remember, each their own:** what you said to them or in their hearing, and who they spent
  time with (`src/memory.js`; rules only). The AI is given the memories of whoever it's speaking for
  and nobody else's, so it can't know what someone across town was told. Someone you said something
  to may come over within a few days to bring it up. Their window in Journal → Edit people shows and
  clears it; Settings → Living world switches it off.
- **How many animals:** Settings → Animals has a slider for each sort (stray dogs, farm animals, peaceful
  wild animals, hostile ones, monsters): that many of the world's own, 0 for none. What a lorebook asks
  for and anyone's own dog or horse are still there at 0, unless that's turned off. Each kind also has
  a switch: off, there are none of it anywhere, whatever else says. "Most in the settlement" keeps the
  town from filling up (stray dogs and horses share it; the rest are put just outside). "Hostile
  animals" says what a wolf does about you where confrontations are allowed: keeps its distance, squares
  up to you, or comes for you (you're sent back a step; nothing is hurt yet). Journal → World has one
  world's own numbers. A dog has five sizes, small to massive (as tall as a horse); a huge or a massive
  one can be ridden.
- **Tools in hand at work:** a sickle, a seed basket and a watering can on the farm, each for its
  part of the work; a trowel in the garden; the smith's hammer and a drinker's mug as before.
- **A saddle** on any horse that's someone's own (yours, or a character's). Farm and tavern horses
  go bare.
- **Riding:** walk up to a horse or a donkey and use it. The same keys or stick move it (a brisk walk,
  Shift or the stick right out to gallop, Space or the Jump button to jump, which carries it over fences and benches), it turns less sharply than you do and won't go where it
  would have to swim, and E, Esc or Get down gets you off beside it. It stays where you leave it, and
  your party runs to keep up.
- **Campsites:** a campsite or two outside each settlement: a fire that flickers, lights the ground as
  it gets dark and smokes, two logs to sit on, and a tent. Use the tent to sleep: choose how long (an
  hour to eight, or until morning or evening), the screen dims and the clock jumps on. The party and
  anyone close by stay as they are; everyone else is where that hour has them (home, work, or out at
  their door). With Settings → Time fixed, you rest but the hour stays. Townsfolk nap in the tent too.
- **Jump, sit, lie down:** Space jumps. C sits you down on the ground where you stand, C again lies you
  down, and moving (or E) gets you up; the party waits with you. The chat window has Jump and Sit buttons
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

| Keyword                                                                                | On                  | What it does                                                                               |
| -------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------ |
| `ww:body:woman (or man)`                                                               | a character's entry | Their body, when they have no 3D model.                                                    |
| `ww:lives in:home6, ww:works at:smithy1, ww:owner of:tavern1`                          | a character's entry | Home and work.                                                                             |
| `ww:work:10:15-18:45, ww:home:22-7:15, ww:eat:12-13 at tavern1`                        | a character's entry | Their day (home, work, eat, visit, sit, walk), in quarter hours, over midnight if need be. |
| `ww:temperament:aggressive (passive, gentle, calm, grumpy, fierce, aggressive)`        | a character's entry | What they're like with anyone they're against: how readily they square up.                 |
| `ww:manner:shy (shy, quiet, friendly, outgoing)`                                       | a character's entry | How readily they come over and greet people.                                               |
| `ww:voice:gruff (natural, cosy, dramatic, witty, terse, gruff, formal, cheerful, sly)` | a character's entry | How they talk, instead of the setting's way.                                               |
| `ww:member of:Thieves Guild`                                                           | a character's entry | Puts them in that faction.                                                                 |

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
- Another region has no townsfolk until you ask the assistant for some there (or add them one by one);
  they count toward the world's thirty people. Engine characters all live in the home region.
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
  pose is the same at a walk and a gallop. Where a farm or wild animal was isn't remembered after you
  leave the world: it's back where the seed has it. A hostile one threatens or lunges (by the Hostile
  animals setting) and that's told in a line: there's no fighting, health or harm.
- Bandits, witches and wizards are monsters in all but looks: they can't be talked to, no two loads
  dress them quite alike, and a dragon overhead does what any hostile flyer does.
- A look can be chosen once someone lives in the world, and there are two outfits to mix, or six
  costumes (whole characters: their clothes and hairstyle can't be changed, only skin, hair colour and
  height). The hood
  goes over whatever hair they have. A piece given a colour of its own is that colour all over (its
  leather and trim too), and sleeves take the hands' gloves with them. The bare body is the pack's
  broader build, so where a bare piece meets a clothed one the join can show a little. Someone with a 3D model shows
  the model; their look is kept for when it isn't there.
- Tools in hand are simple shapes made in code (hammer, mug, sickle, seed basket, watering can, trowel,
  staff, sword), and the smith's swing is a wood-chopper's. The forge's hearth doesn't glow at night. A seller and a buyer
  at a stall don't talk to each other.
- Sleeping is in a campsite's tent only (not a bed, nor your own "/camp" fire), and nothing happens
  while you sleep but the clock: no events, no dreams, no AI call.
- A group out together is brought into a moment as one; a conversation (E on one of them) is still with
  that one person.
- Hamlets and inns have no stalls, so a shop's people there work indoors. The player can't work a spot.
- With Settings → Animation on Built-in, none of the new animations play: people sit for what's low to
  the ground and stand for the rest, and a jump only lifts you.
- A smithy's door stands at one end of its front. In a world made before 0.5.11 it has moved a few
  metres; the building, its number and who works there are the same.
- The AI's world setup reads the first 200 entries of the chosen lorebooks, 600 characters of each.
- Quartermaster works inside scenes started from Wanderworld (they are roleplay chats), not in the world.
- The AI assistant's Undo buttons last until you leave the world or press Start over (the chat's words
  are kept; its proposals aren't). Undo takes back only what the assistant changed; if you've since
  changed the very same thing yourself, yours stays. Something the assistant added (a person, a lore
  entry) goes even if you've edited it since. A scene it started isn't undone.
- What goes with a message to the assistant is chosen from its words; when that falls short the model
  asks for the missing part and is asked again, which costs a second call.
- Debug Mode (the Engine's, Settings → Advanced) writes every model and picture request Wanderworld
  makes, with the answer, to the Engine's console. It is read from the Engine's saved settings in the
  browser, since a Home tab isn't told it.
- The scattered, pond and quarters layouts are only built when chosen; "Surprise me" picks from the first four.
- A world's own lore entries hold 1,500 characters each, 60 entries a world.

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
  built by `people.js` and moved by the people's clips, with an animal's handles on them.
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
  build the default people (`people.js` also the costumes, from `kit/fantasy/costumes/`, and the
  monsters on two legs); `src/looks.js` is what a look can be.
- `server.mjs` is the server part (hand-written, syntax-checked by the build): routes under
  `/api/wanderworld` for status, the connection and preset lists, conversation replies, moments, day
  plans, world setup from cards and lorebooks, pictures and the gallery, the AI assistant, scene plans, scene creation, and scene contexts and recaps, plus a
  scene origin for the Engine. Every request body is checked there, and so is what a model answers: the
  assistant's changes are read field by field (`readAssistant`) before the client ever sees them.
  `src/assistant.js` is the assistant's chat; `main.js` (`applyAssistantEdits`) checks each change against
  the world, shows it, and makes it through the same setters the Journal uses. `src/ai.js` is the client's side of
  it, `src/map.js` draws the maps, `src/weather.js` the weather, `src/pack.js` the setting pack (the things to use, what's said about them
  and places when no AI answers, and the errands: every word of the setting, so another setting is
  another pack), `src/setup.js` sums the AI's setup up for the review, and `src/illustrate.js` and
  `src/floating.js` the Illustrate window and the floating windows.
- `src/saves.js` keeps the saved worlds (every field checked on the way in); `src/menu.js` is the main
  menu, `src/journal.js` the Journal, `src/hud.js` the bar, panels and cards, `src/talk.js` conversations
  and speech bubbles, `src/signs.js` signs and the noticeboard, `src/ui.js` the parchment look,
  `src/sound.js` Web Audio sounds, `src/settings.js` the settings, `src/kit.js` the kit's models.
- `src/interiors.js` builds the (unfinished) room behind a door, off by default, with whatever the
  player has put in it (`household.js` FURNITURE).
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
`tests/wanderworld*.regression.mjs`, each run with `node`. The kit's files are made from the downloaded
packs by `scripts/build-wanderworld-kit.mjs`, `build-wanderworld-people.mjs` (also `--folk` and
`--costumes`) and `build-wanderworld-animals.mjs`; [kit/CREDITS.md](kit/CREDITS.md) says which pack each needs.

## Credits

The buildings, props, nature, townsfolk and recorded animations are converted from free packs by
[Quaternius](https://quaternius.com), released under
[CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/): Medieval Village MegaKit,
Fantasy Props MegaKit, Stylized Nature MegaKit, Universal Base Characters, Modular Character Outfits -
Fantasy, Ultimate Animated Animals, Monster Pack Animated, Easy Animated Enemy Pack, Farm Buildings, Ultimate Modular Men, Ultimate Modular Women, and the Universal Animation Library and Universal Animation Library 2.

The gallows, pillory, cage, signposts and crystals are by iPoly3D (Medieval Torture Devices, Signs pack
and Crystal Pack on Poly Pizza), also CC0 1.0. Thank you, iPoly3D.

The imp and the puglin are from Quaternius's Bestiary - Dungeon Monsters Kit, which is under the Quaternius Asset License (QAL) v1.0 (https://quaternius.com/license.html) and not CC0: free to use in a game, not to pass on as assets.

Credit required (CC-BY 3.0): Saddle by Poly by Google (https://poly.pizza/m/dSMm_V4sKNr), CC-BY 3.0
(https://creativecommons.org/licenses/by/3.0/), modified: converted, resized and its texture shrunk. Its
maker has not endorsed Wanderworld.

Thank you, Quaternius. The full list, with which folder comes from which pack and how to rebuild or
remove each, is in [kit/CREDITS.md](kit/CREDITS.md) and [src/clips/CREDITS.md](src/clips/CREDITS.md).

The menu art, logo, loading screen, store banner and ground, water and wood textures were made for
Wanderworld by its author with ComfyUI. three.js, `@pixiv/three-vrm` and `mmd-parser` are
bundled under their MIT licences, with their notices kept in `client.js`.
