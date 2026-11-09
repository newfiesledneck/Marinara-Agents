# Wanderworld release notes

## 0.4.87 — 2026-11-09

- Journal → People → Relationships is back as an overview to read: how everyone sees each other and you, person by person. Changing one is done in Edit people.
- Hints in the game point to Menu → Settings now that Settings lives in the Menu.

## 0.4.86 — 2026-11-09

- The person window lets you pick a role for a relationship again (family: sister, parent, cousin…; colleague: employer, apprentice…; mentor: mentor or student), beside its kind and strength. A role a lorebook gave ("father", "wife") stays on offer.

## 0.4.85 — 2026-11-09

- Everything about a person is managed in one place: Journal → People → Edit people → Edit. Their day is edited there now (lines of hours, what they do and where, or planned by the AI), next to home and work and their relationships. The separate Schedules, Homes and work, and Relationships pages are gone from the Journal.
- The top bar is shorter: Journal, Lore, Illustrate, Chat and Menu. Menu holds who you play as, Settings, full screen and the way back to the main menu.

## 0.4.84 — 2026-11-09

- Journal → People → Edit people lists everyone with an Edit button. It opens a window with everything Wanderworld keeps about that person: body, voice, temperament and manner, home and work, their day, how they see you and you them, and how they and each other person see one another. Save or Cancel. A character with a card keeps who they are and their looks from the card; someone made for the world can have those changed too.
- Every button shows it was clicked: it dips while pressed and stays lit for a moment after.

## 0.4.83 — 2026-11-09

- A place with closing hours (ww: closed 22-6) says so on its door card while it's shut, and the AI is told too.
- Wording caught up with what the AI does now, in the door card, the Journal's lore picker and the relationships notes.

## 0.4.82 — 2026-11-09

- The Journal's map zooms and pans: scroll or use + and −, drag to move about. All the way out is the whole region; closer in names the buildings (the tavern, the smithy, then every house).
- Click the map to set a waypoint (a red flag); under the map it says how far it is and which way. Your home is marked with a little house.
- The regions to the east and west are written up the sides, like the ones along the top and bottom, so the middle of the map stays clear.

## 0.4.81 — 2026-11-09

- Journal → People is a roster you can read: everyone in the world by faction, with where they live and work and how they see you, and the creatures from the lore. It no longer shifts about. Buttons along the top open what they're doing right now, schedules, homes and work, relationships (no longer a tab of its own), and voices and details.
- Voices and details: pick how each person talks, and edit the people a world made for itself. Journal → World: edit the lore written for the world, set the season, and check your ww: keywords (it lists any it didn't understand).
- Settings come a section at a time (Graphics, Moving, World, AI, Display), and choosing who lives in the world moved from the top bar into Settings → World.
- Floating windows (chat, Illustrate) stay inside the view when the browser window is made smaller.

## 0.4.80 — 2026-11-09

- More "ww:" keywords, each one short thing: the world's shape on its "ww: world" entry (ww: city, ww: walls, ww: size large, ww: season winter); a place's hours and owner (ww: closed 22-6, ww: owner Mira); temperament and voice (ww: shy, ww: grumpy, ww: voice gruff); factions (ww: faction Thieves Guild, ww: member of Thieves Guild); and a creature's details, kept for later (ww: found in forest1, ww: night, ww: pack 4, ww: danger 2, ww: drops gold).
- Seasons: winter lays snow over the land.
- Four more ways to talk (gruff, formal, cheerful, sly), and a person can have their own.
- People made from lore get their details (who they are, manner, looks) from one model call, kept as their own card in the world. An owner a place names who isn't anyone yet becomes a new person.
- "ww: character Name" only ties to a card you chose for that world; cards you left out are never pulled in.

## 0.4.79 — 2026-11-09

- "ww: character Mira Saxton": the entry is that person. A card of exactly that name is who it means and joins the world; with no such card (a "Mira Little" beside the card "Mira Saxton") a new person is made for that world. With no name after it, the entry's title is the name.
- "ww: monster Goblin", "ww: creature" and "ww: hostile" mark an entry as a creature. Nothing uses them yet: they are kept with the world (Journal → World lists them) for when the wilds have creatures.

## 0.4.78 — 2026-11-09

- Lorebook keywords for Wanderworld now need the prefix "ww:" ("ww: tavern1", "ww:woman", "ww: lives in home3"), so a lorebook's ordinary trigger words ("town", "man", "enemy") never set anything by accident, and an entry's title alone links nothing. Lorebooks keyed the old way need the prefix added.
- New keywords: a day ("ww: work 10:15-18:45", "ww: home 22-7:15", "ww: eat 12-13 at tavern1"), a place's name ("ww: name The Gilded Stag" beside "ww: tavern1"), and "ww: character" to make a person of an entry with no card. Schedules keep quarter hours.

## 0.4.77 — 2026-11-09

- New world can be written by the AI from nothing: "World lore: let the AI write this world and its places" writes a premise and named places with their own lore, kept in the world and active where you stand.
- "New people for the AI to invent": up to 12 people built around those places and your cast, with a description, personality, looks, home, work and relationships. They live in that world only (not Engine characters), talk and keep their days like anyone, and can't be cast in scenes.
- A lorebook entry about someone with no card can become a person in the world.
- The steps feed each other in order: lorebooks, the world and its places, new people, then your own characters fitted in among them. All of it shows in the review before the land is built.

## 0.4.76 — 2026-11-09

- Dirt streets in a hamlet or village are paths now: their edges fade into the grass instead of ending in a hard line.
- A Large, Huge or Massive world left to the seed gets more places out in it (landmarks, and for Huge and Massive another farm and hamlet), so there is something to walk to. What you choose by hand stays as chosen.
- Fixed: your body picker in the bar didn't show the body the AI's setup gave your persona until the world was reopened.

## 0.4.75 — 2026-11-09

- The AI's world setup has more room to answer (for models that think first), and the Journal's lore choices are worded as New world's.

## 0.4.74 — 2026-11-09

- The AI's setup of a new world is shown before the land is built: everyone's body, home, work and relationships, the places the world will get, the names and the lore tied to them, with the map and world size. From there: build it, ask the AI again, or go back to the settings (the setup is kept).
- A model call that fails is tried once more; if it still fails, what did come through is kept, the review says what's missing, and "Ask the AI again" asks only for that. Building with a partial setup works, and Journal → World can finish it later.
- The loading screen now also waits for your own figure.

## 0.4.73 — 2026-11-09

- New world can be set up by the AI, ready to play: it reads your characters' cards and persona (no lorebook needed) and any lorebooks you choose, and sets who's a man or a woman, how people know each other and you, where everyone lives and works, which lore belongs to which place, names for the places the lore names, and builds the places that takes. The loading screen says what it's doing until the world is ready. Journal → World can run it again. Lorebook keywords and setting things by hand work as before.

## 0.4.72 — 2026-11-09

- Offered to Engine staging testers from Agents → Download Agents. The README has install steps, what each permission is for, known limits, and credits for the Quaternius CC0 packs the world is built from.

## 0.4.71 — 2026-11-09

- Scenes you start in the world are planned by Wanderworld, so the Engine's scene dialog (with choices remembered from other chats) no longer comes up. Settings → AI: scene point of view, tense, and a prompt preset picked for every scene; Journal → World: scene instructions for that world. If planning fails, the Engine's own planner takes over.

## 0.4.70 — 2026-11-09

- Up to five people hear what you say or do, and anyone you name ("/s Hey Ingrid!") is one of them if they're in earshot, with the nearest others.

## 0.4.69 — 2026-11-09

- Moments: the "Around you" chat window takes what you say or do: plain text to everyone nearby, /s shouts, /w whispers, /p talks to your party, /a does something (open a chest, cast a spell). The narrator answers and whoever heard may reply. Reading the noticeboard, sitting by people and card choices are moments too. Commands are listed under the box; the window moves and resizes.
- Schedules: everyone follows a day (home, work, meals, visits, a seat), editable in Journal → People → Schedules, planned by the AI on request, and changed by what people agree to in moments.
- Illustrate: a window that paints the current moment from a prompt template you can edit, with a scrolling gallery (the newest 60): click to show, × to delete.

## 0.4.68 — 2026-11-09

- A server part (needs an Engine restart after installing or updating): people answer in their own words, written by your model from their card, your persona, where you are, the time and weather, how they feel about you and the lore active there; set lines stand in if a call fails.
- Settings → AI: AI conversations on or off, the connections for conversations, scenes and pictures, how people talk, reply length, creativity, and the picture style (the Engine's style profiles).
- "Play it as a scene" on a scene card opens it as a roleplay scene in the Engine with everyone there; its recap comes back to Journal → Here.
- Journal → Here: "Picture this place" paints where you are through your image connection.

## 0.4.67 — 2026-11-09

- The sound of rain while it rains (softer indoors), and no birdsong in it.

## 0.4.66 — 2026-11-09

- Ponds: a landmark of its own, water in a hollow deep enough to swim in the middle and shallow at its sandy shore, ringed with reeds, ferns and mossy stones, with a bench looking over it. Comes with Landmarks in New world, or by the lore's pond1.

## 0.4.65 — 2026-11-09

- Fix: a mill far along the river no longer stands in the water; it always steps straight across onto the town's bank.
- Rock on slopes blends in smoothly instead of painting whole triangles (sharp grey patches where level ground met a bank), and looks the same near and far.

## 0.4.64 — 2026-11-09

- Chimney smoke darkens at night instead of glowing white against the dark sky; town walls are a darker, weathered stone.
- Every gate in a town's walls has a clear way out: a dirt track fading into the meadow where no road leaves, with no trees or bushes in the way.

## 0.4.63 — 2026-11-09

- Hamlets, farms and landmarks keep all their ground inside the world, off the river, and clear of each other even in a crowded world: when their own side is full they find the nearest free spot elsewhere.
- A hamlet or farm goes on another side when there's no room for it beyond the river.
- Country roads wear away into the grass where they arrive instead of stopping square.

## 0.4.62 — 2026-11-09

- Places out in the country keep clear of each other: a farm's fields no longer run into a hamlet, and two farms never overlap.
- A graveyard goes on a side of town the river doesn't cut off.
- Map names no longer overlap (each goes above or below its place, wherever there's room), and neighbouring regions have different names.

## 0.4.61 — 2026-11-09

- The land goes on past the world's edge into the fog, with woods thinning out and the river running on, instead of ending in a drop to the sky.

## 0.4.60 — 2026-11-09

- Weather (Settings → Weather, off by default): rain falling in streaks, drifting snow, or mist, each greying the sky, dimming the sun and drawing the fog in. "Changing" turns every few minutes, the same for a world each time and mostly clear; or pick one kind to keep.
- Fix: unlit windows and lamp glows no longer show as pale squares in fog and mist.

## 0.4.59 — 2026-11-09

- City walls and gates: a new city is ringed by a crenellated stone wall with round corner towers and a gatehouse wherever a road leaves town and in the middle of each side. New world's "Walls" choice gives any settlement walls or none. Townsfolk and your party find their way out and in by the gates. The map shows the wall.
- Cities made before keep their open edges.

## 0.4.58 — 2026-11-09

- Landmarks out in the country: old ruins, a timber watchtower, a ring of standing stones, a fenced graveyard just outside town, and a watermill on the river bank. Chosen in New world ("Landmarks") or now and then by the seed; a lorebook naming ruins1, watchtower1, stones1, graveyard1 or mill1 brings one. Someone can work at the mill.
- Roads to places keep their "the": the road to the Wayside Inn, the road to the quiet acre.
- Fix: a bridge over a deep valley no longer drags the river banks under the water.

## 0.4.57 — 2026-11-09

- Homes and work set by hand: Journal → People → "Set homes and work…" gives each character a home (or Auto) and a workplace, with whether they own it. Places show their numbered names (home6, smithy1) to match lorebooks.

## 0.4.56 — 2026-11-09

- Maps: New world shows a map of the world your choices make, redrawn as you change them, with Reroll for another. Regenerate shows the rebuilt world's map, with Reroll for another new layout.
- Journal → Map: the region you're in from above, with you, the town, hamlets, farms, inns, cottages and caves by name, and the regions beyond each edge.

## 0.4.55 — 2026-11-09

- Regions and travel: at the edge of the world, "Travel to <region>" takes you, with the party following you, into the next region, made from the world's seed the first time with its own land and settlement. You arrive at its facing edge, and can travel on in any direction or back home.
- Each region keeps its own place names, lore and groups. Characters who stayed behind wait at home.
- Every trip saves a travel scene request for the AI part, for encounters on the way later.

## 0.4.54 — 2026-11-09

- A road network out in the country: hamlets on neighbouring sides are joined by a road curving round the town, inns stand beside the road to a hamlet or farm where their own track meets it, and inns and cottages take a track off a nearby road instead of a long one from town.
- Worlds without hamlets or farms keep their roads as they were.

## 0.4.53 — 2026-11-09

- Farms out in the country: a farmhouse and a red barn round a yard at the end of their own road, with fenced fields of wheat or greens in rows behind, crates, barrels and a wagon. Chosen in New world ("Farms") or often one by the seed.
- A lorebook naming farm1 or farm2 brings that many; "farm", "barn" and "fields" lore links there.
- Hamlets and farms stand on open ground in front of a mountain range, not up it.

## 0.4.52 — 2026-11-09

- More settlements: hamlets out in the country, each five to eight houses round a green on its own road, chosen in New world ("More settlements") or now and then by the seed.
- A lorebook naming town2 or town3 brings a hamlet for each; their houses are numbered among the homes, and "hamlet" lore links there.
- Regenerating a world now keeps all its New world choices, its settlement and layout included.

## 0.4.51 — 2026-11-09

- Settlement layouts: a grid of streets, a crossroads, a row along one street, or a cluster round the market, chosen in New world or left to the seed. Streets are laid only beside the blocks that are built, and lamps stand where streets meet.

## 0.4.50 — 2026-11-09

- Settlements: a hamlet, village, town or city, chosen in New world or left to the seed. Each has its own size and buildings: a hamlet of houses round a green, a village with stalls, a tavern and a temple, a town with its fountain square, a city with more of everything.
- The market can sit off to one side instead of in the middle, and streets can be cobbled (with kerbs and sidewalks) or dirt paths.
- Cottages and inns out in the country are their own kinds, kept apart from the town's houses and taverns: "home" lore, home numbers and the Homes group stay in town.
- A lorebook naming more homes than a settlement holds makes it bigger. Worlds made before keep their town as it was.

## 0.4.49 — 2026-11-09

- World size: Small, Normal, Large, Huge or Massive (up to three times as wide), chosen in New world (or Auto) and when regenerating. Bigger worlds spread their places further out and are just as wooded.
- Draw distance: Tiny, Near, Medium, Far, Very far or Max, with fog hiding everything past it.
- Much lighter far views: small plants are drawn nearby only and detailed trees out to 180 m, with simple trees beyond; the ground is built in pieces, finer near you.

## 0.4.48 — 2026-11-09

- Swimming sits in the water instead of floating above it, and wading in or climbing out eases smoothly between walking and swimming (for you and for townsfolk).

## 0.4.47 — 2026-11-09

- Townsfolk and followers can swim. They still go round by a bridge when there's one on the way, and your party crosses the way you did: swimming after you, or by the bridge.
- Settings → Time speed: a day in 80, 40, 20, 10, 5 or 2½ minutes.
- The clock in Journal → World keeps ticking, a place's lore count updates as soon as you go back, and deleting a group asks first.

## 0.4.46 — 2026-11-09

- Body choices are kept per world: setting someone's body in one world (by hand or by lore) doesn't change another. Older worlds start from the choices made before.
- Inns and cottages never stand in the river: they move further out until they're on dry ground.
- Caves have no road leading to them: they're found up on the hillsides.
- Followers and townsfolk cross the wilds straight to where they're going, and cross the river by the nearest bridge instead of wading in.

## 0.4.45 — 2026-11-08

- New world starts with nobody living in it: characters from your other worlds no longer come along. Each world keeps its own cast, relationships, lore, homes and party in its own save.

## 0.4.44 — 2026-11-08

- New world: each character folder has its own checkbox that picks everyone in it (as many as fit) or clears them. It shows half-ticked when only some are chosen.

## 0.4.43 — 2026-11-08

- New world's character and lorebook lists show again: they had been squeezed to nothing inside the scrolling card.

## 0.4.42 — 2026-11-08

- The main menu's card scrolls when the window is short, so all of New world can be reached; the logo shrinks to fit.

## 0.4.41 — 2026-11-08

- New world chooses who you play and who lives there. Type your persona's name (an exact match picks it) or pick from the list. Characters show in their Engine folders: open one to tick who moves in, up to 30. It starts from the world you played last.

## 0.4.40 — 2026-11-08

- "lives in inn1", "owner of inn1" and the same for cottages now mean the building there, so an innkeeper or a hermit can live and work out in the country.

## 0.4.39 — 2026-11-08

- Your own lore entry: keyed "player <your persona's name>" (for one persona) or "you" / "player" (any persona), never your bare name, so a character can share it. Its lore is active everywhere, "male"/"female" sets your body, and "mother of Hank" or "friends with Mira" sets how you see them.
- "lives in home6" on it gives you a home. The house is named for everyone in it, a new world starts you at your front door, its prompt reads "Your home", and Journal → Here says when you're at home.
- A new world's loading screen stays up until its lore has linked and you're in place.

## 0.4.38 — 2026-11-08

- With places linked by name, a world is built with at least every numbered place its lorebooks mention: "smithy3" makes three smithies, "inn2" two inns, "cave1" a cave. A cave brings mountains with it, and "river1" a river. Past that it's random. Regenerate builds what changed lorebooks need.
- Journal → World lists what the world was built to have.
- The fountain's Use prompt only shows when you're beside it.

## 0.4.37 — 2026-11-08

- Every place has a numbered name for lorebooks (town1, forest1, tavern1, home6, inn1…), shown in Journal → Places.
- Lorebooks can build the world's structure: "group of home" makes a group of every house, and "located in town1" puts a place or group inside another.
- On a character's entry, "lives in home6", "works at smithy1" and "owner of tavern1" set where they live and work. A house given by lore is theirs alone, and they spend working hours at their work.
- Journal → People says where each person lives and works.

## 0.4.36 — 2026-11-08

- Linking lore to places and setting up characters from lore are off by default on New world: choose them to opt in.

## 0.4.35 — 2026-11-08

- Lorebooks can set how characters stand toward each other: a character's entry keyed "brother of Sarah", "son of Zoey", "enemy of Mira" or "friends with Tam" sets that one way. Nothing is assumed the other way round; the other character's own entry says how they see it. "you" or your persona's name means you.

## 0.4.34 — 2026-11-08

- Party tab: "Everyone near me comes along" brings everyone standing within a few steps of you into the party, and "Everyone parts ways" sends the whole party off again.

## 0.4.33 — 2026-11-08

- Characters can be set up from their lore: an entry named or keyed after a character in town, with keywords like "enemy", "sworn enemy", "mentor", "sister", "male" or "female", sets their body and how they see you (only what isn't set yet).
- New world and Journal → World choose linking separately for places and for characters.
- Explanations under every setting, at the top of each Journal tab and on New world; Settings → Show explanations hides them.

## 0.4.32 — 2026-11-08

- People lists who's living in town first, then everyone else, under headings. The order is set when you open the panel, so rows stay put while you tick.

## 0.4.31 — 2026-11-08

- New world asks for the world's setting, which lorebooks it uses, and how their entries are linked to places: by matching names (an entry named or keyed "tavern", "the woods" or the town's name goes there), by the AI once the AI update arrives, or by hand.
- Journal → World shows and changes that setup later, with a button to link lore by name again.
- Keyword links also reach groups, characters (by name) and the whole world ("world").

## 0.4.30 — 2026-11-08

- Journal → Places shows the world's setup as a tree: the whole world, its characters, then each place inside the one it sits in (town, street, building), then groups. Lore can be tied at every level.
- Lore for the whole world is active everywhere; a character's lore is active while you talk to them or while they're with you.
- Groups can sit inside other groups and pass their lore down.
- Regenerating with a new layout keeps the setup: names, lore and groups move to the same kind of place (the tavern stays the tavern).

## 0.4.29 — 2026-11-08

- Place groups: gather places under a name, like every home in town, or the forest, mountains, cottages and river as the wilds. Lore tied to a group is active anywhere in it, along with each place's own.
- Every world starts with two groups, The wilds and Homes. Add, rename, fill or remove groups in Journal → Places; later the AI can make them too.
- The Lore panel and Journal → Here show the groups you're in.
- The "Lorebooks shown" list stays open while you tick several, until you close it.

## 0.4.28 — 2026-11-08

- Settings → Regenerate this world: builds the world again from its setup with everything new, keeping your people, relationships, party, notes and lore. Optionally a new town layout too.
- Settings: how often people come up to you (or never), and at most how many at once, so you aren't surrounded.
- The river's banks always stand above the water, so it no longer floats with gaps over low ground in hilly worlds.

## 0.4.27 — 2026-11-08

- Townsfolk hold real little conversations with each other, taking turns, warmer between friends and family and short between enemies.
- Talking to someone: they greet you by how they feel about you, and you can pick what to say (how they are, news, about them, somewhere to eat, goodbye) or type your own.
- Lit windows at night, smoke rising from chimneys, striped awnings over shops, and signs hanging out over the street on painted boards.
- Settings: walk speed and run speed are separate sliders.
- Best friends look further for each other, so they meet up more often.

## 0.4.26 — 2026-11-08

- Doors, caves and the fountain open a card of things to do (go in, knock, toss a coin…), a box for your own line, and who comes along. Choosing sets up a scene for the AI part to play out; recent ones show in the Journal.
- Iron lamp posts with glass lanterns that glow at night, pool light on the cobbles and light the streets near you.
- A stone fountain with a tiered bowl and water falling into the basin.
- Name tags are tinted by how each person sees you: red for enemies, green for friends, pink for romance, grey to yellow as acquaintances get to know you, deeper the stronger it is.
- A Lore button shows the lore active where you are, with its text. In Places, choose which lorebooks to list, each folding open to its entries.

## 0.4.25 — 2026-11-08

- Swimming: walk into the river and you wade through the shallows, then swim where it's deep, treading water when you stop (Shift swims faster). Recorded swimming animations from the Universal Animation Library.
- The river is deeper in the middle, and its water reaches the banks everywhere instead of leaving dry gaps.

## 0.4.24 — 2026-11-08

- Relationships: set how each person sees everyone else, and you, in the Journal's new Relationships tab. Friend, family, partner, rival, enemy and more, each with levels: a low-level friend is just friendly, a high one a best friend; a low-level enemy dislikes you, a high one is a sworn enemy.
- Townsfolk act on them: friends seek each other out, chat, and sit or walk together; people keep away from someone they dislike or fear; someone fond of you comes over and says hello; a sworn enemy marches up to have words.
- Temperament and manner for each character, from passive to aggressive and from shy to outgoing: how readily they confront someone, or come over to greet you and seek company.
- Settings → Confrontations and combat: anywhere, outside towns, outside safe places (towns, inns and cottages), or off.
- Bridges have plank decks on beams and piers, and reach from bank to bank.
- Dirt roads fade out of the cobbles where they leave town instead of starting in a hard line.

## 0.4.23 — 2026-11-08

- Rocks and boulders have the same painted rock texture as the mountains.
- Walking in and out of a cave's mouth is smooth: the floor eases into the ground in front instead of stepping down.

## 0.4.22 — 2026-11-08

- Leaves and needles under thick stands of trees, and painted snow on the high peaks.
- Bridges cross over the water: the river and its bed run underneath, and the dirt road stops at each end.
- Sand and mud only along the river now, not in every hollow of the hills.

## 0.4.21 — 2026-11-08

- A noticeboard on the market square: read the town's notes, and pin up your own (they're saved with the world). Quests and news from the AI will go here later.
- Parchment for the menu, conversations, building cards, the noticeboard and the Journal, with wooden buttons.
- Painted water that ripples as it flows, sandy riverbeds, rock on the mountains, and cracked rock on cave faces.
- No more grass wedges at street corners.

## 0.4.20 — 2026-11-08

- A low stone kerb runs between the streets and the sidewalks, and round the market square.
- Sidewalks fade into the lawns instead of stopping in a hard line, and every block's corners are rounded.
- At the edge of town the cobbled streets fade into the meadow.

## 0.4.19 — 2026-11-08

- Painted ground: grass across the land, dirt on the country roads, round cobbles on the streets, stone setts on the sidewalks and sandstone slabs on the market square.
- The land blends grass into rock on steep slopes and high ground, snow on the peaks and pebbles in the riverbed, with no tiling showing.
- Shop signs are painted wooden boards.

## 0.4.18 — 2026-11-08

- New art: the main menu has a painted hilltop view of the village (a tall version on phones held upright) and a carved Wanderworld logo.
- Loading a world shows a lantern-lit street while it builds, and opens once its trees, buildings and props are in.
- A new store banner.

## 0.4.17 — 2026-11-08

- Caves are one weathered rock face set into the hillside, with the entrance carved into it: no loose boulders or gaps. Inside the passage goes dark, and ferns and grass grow along the foot and over the top.
- Dirt roads are one smooth strip that fades into the grass at its edges, with no gaps at bends and no ground poking through.
- The river is one smooth surface, deeper blue in the middle, with a soft sheen.

## 0.4.16 — 2026-11-08

- The land round town has shape: hills from gentle to rugged, mountain ranges along some edges with rock and snow, and a winding river with sandy banks.
- Places out in the country: a roadside inn, cottages and caves in hillsides, each at the end of its own dirt road, with a wooden bridge where a road crosses the river.
- Every world's land is its own. New world can choose hills, mountains, a river and how much is out in the country, or let the seed surprise you. The world keeps it.
- The river, roads, mountains, inns and caves have names, and a cave can be used like a door.

## 0.4.15 — 2026-11-08

- A party: in a conversation, ask someone to come with you. They follow in a loose line, run to catch up, find their way round buildings, sit near you when you sit, and catch up if they get lost.
- Journal → Party lists who's with you: tell someone to wait here or come along, or part ways.
- The party is saved with the world, and a door's card says who's coming in with you.

## 0.4.14 — 2026-11-08

- A main menu: Continue, New world, Load world and Settings. Each world saves where you were, the time, your persona and who lives there; the Load list shows a picture of each, with Rename and Delete. Your world from before comes over as "My first world".
- Places: every town gets a name, and so does every street; there's the market square, the fountain, gardens, meadows, the edge of town and the woods. A place's name shows as you walk in, and the bar says where you are.
- Shop signs: the tavern, shops, smithy, temple and hall have their name over the door.
- The Journal (J): where you are and who's nearby, where everyone is ("Mira is walking on Chapel Row"), every place to rename (a sign changes with it) or tie lorebook entries to, and the world's details.

## 0.4.13 — 2026-11-08

- A livelier town: cobbled streets, brick sidewalks round every block and a paved plaza; patchy grass; fenced gardens with a tree, flowers and a bench; flowers, barrels, sacks and buckets by doors; ivy on walls; wagons parked in the streets; meadows on empty lots.
- Detailed trees everywhere, not just near town, and Trees and rocks adds more of them.
- Doors are the village kit's own, hung in their frames.
- Default people wear everyday clothes in seven colours.
- Fruit, vegetables, books and bottles have their colours back.
- Going through a door shows who's inside, ready for starting a scene there later. Settings → Walk into buildings brings the unfinished rooms back.

## 0.4.12 — 2026-11-08

- Real buildings: every house, shop, the tavern, temple, hall and smithy is assembled from Quaternius's free Medieval Village MegaKit (public domain): brick or stone ground floors, plaster and timber-framed storeys, arched windows with shutters, arched doors, round-tile roofs with brick gables, chimneys, balconies and towers.
- Buildings now sit on the kit's 2 m grid, so a town's layout differs a little from before; porches are gone.
- Settings → Detailed buildings turns them off on slow devices.

## 0.4.11 — 2026-11-08

- Detailed furniture and props from Quaternius's free Fantasy Props and Medieval Village kits (public domain): market stalls with crates of apples and carrots, benches, barrels and crates in town; beds, tables, chairs, stools, bookcases, chests, an anvil and workbench, candle stands, banners, and mugs and plates on tables indoors.
- Settings → Detailed furniture and props turns them off on slow devices.

## 0.4.10 — 2026-11-08

- Detailed nature around town: leafy trees, pines, twisted and dead trees, rocks, bushes, ferns, flowers, grass and pebbles from Quaternius's free Stylized Nature MegaKit (public domain). Further out, the simple trees stay, where the haze hides the difference.
- Settings → Detailed trees and plants turns them off on slow devices.

## 0.4.9 — 2026-11-08

- Choose a body for each character in People, and for your persona next to Play as: Auto, Male or Female. It decides which default person they get when they have no 3D model, and is remembered. Later the AI will set it from the character card.

## 0.4.8 — 2026-11-08

- People without a 3D model are now dressed: a peasant or ranger outfit in one of two colourways, a hairstyle (and sometimes a beard), skin and hair tones and a height, all chosen from their name, from Quaternius's free character packs (public domain). They walk and sit with the recorded animations.
- Settings → People without a model switches back to the simple built-in look, which is lighter on slow devices.

## 0.4.7 — 2026-11-08

- Recorded animations: walking, running, standing, sitting down and up, and talking now play motion from Quaternius's free Universal Animation Library (public domain), on every model. Feet stay planted at any speed, and waving and looking at people still play on top. Settings → Animation switches back to the hand-made motion.
- Walking is now 1.4 m/s, a natural pace for the recorded walk; raise it in Settings if you like.

## 0.4.6 — 2026-11-08

- Smoother walking: the body rises and falls in a gentle wave (about 2 cm) instead of dropping and popping up with each step, the swinging leg bends at the knee as it comes through, and the arms swing more freely.

## 0.4.5 — 2026-11-08

- Up to 30 characters can live in town.
- Townsfolk are inside buildings: walk into a house, the tavern or a shop and whoever is there is in the room, sitting or standing about, and you can talk to them. They come and go through the door while you're inside.
- Townsfolk visit shops, the tavern, the temple, the hall and the smithy, find their way round buildings along the streets, and no longer hop up and down from benches or pop straight back indoors.
- A more natural walk: much less bounce (about half), no more marching kick, and the back foot rolls onto its toes. Walking is now 1.8 m/s; raise it in Settings if you like it faster.
- If your browser is drawing without the graphics card, Wanderworld says so and how to turn hardware acceleration on.

## 0.4.4 — 2026-11-08

- Use things with E, a click or a tap: sit on benches and chairs, open doors and go inside (each kind of building has a furnished room), and talk to people. Click further away to walk there.
- Talking is a preview: you face each other, the camera moves to the side, and a chat box and speech bubbles open. Replies are placeholders until the AI update.
- Townsfolk sit on benches, go in and out of their houses, head home at night, look at you and wave.
- Day and night (20 minutes a day), with lamps at night, and sound: footsteps, doors, wind, birds and crickets.
- Settings: resolution (Auto keeps 4K screens smooth), draw distance, shadows, walk speed, camera, time of day, sound and the HUD.
- Feet stay planted while walking and standing, and legs no longer sway walking towards the camera.
- Remembers where you were; a loading screen; a ☰ menu on phones.

## 0.4.3 — 2026-11-07

- A more natural walk: the heel lands first and the toes push off, knees fold as each foot swings through, hips turn and sway with the steps, shoulders turn against them, and arms swing a beat behind with relaxed elbows and fingers. The standing foot stays on the ground, so the body rises and falls with each step instead of bobbing on its own. At a run, people lean in and pump their arms.
- Standing still is no longer stiff: people breathe, shift their weight from foot to foot, glance around now and then, and VRM models blink.
- People without a 3D model look like people: a face, one of several hairstyles, different builds and heights, and shirts with trousers, shorts, skirts or dresses. They walk and stand the same way 3D models do.
- Fixed: a GLB or FBX model that faces away in its file raised its arms above its head instead of lowering them, and a VRM 0.x model would have too.

## 0.4.2 — 2026-11-07

- New controls, the same on every screen size. On a computer: WASD walks, Shift runs, drag with the left or middle mouse button (or use the arrow keys) to look around, and scroll or press + and − to zoom. On a touch screen: the stick walks (push it all the way to run), drag anywhere else to look around, and pinch to zoom.
- The camera tilts: look up at towers from street level, or tilt up to nearly overhead. It never goes below the ground.
- Q and E no longer turn the camera; E is kept for using things.

## 0.4.1 — 2026-11-07

- Buildings are much more detailed, assembled from a kit of parts: timber-framed, plastered, plank, stone and brick walls; gable, hipped and flat roofs; chimneys, porches, balconies, shutters, flower boxes, shop windows, awnings and hanging signs.
- The plaza now has a town hall, a temple with a spire, a tavern and a row of shops around it, with market stalls and benches. Barrels and crates sit by shop doors, a smithy stands at the edge of town, and empty lots are fenced gardens with bushes and a tree.

## 0.4.0 — 2026-11-07

- Choose characters under People to live in town, up to twelve. Each lives in a house near the plaza, wanders nearby, stops to face you when you walk up, and has its name over its head. You can't walk through them. Your choice is remembered.
- Every 3D model format 3D Avatars uses now walks, for you and for your characters: VRM, GLB, FBX and MMD (PMX). GLB and FBX models walk on the bones 3D Avatars matched for them, as VRM models do.

## 0.3.2 — 2026-11-07

- Walking is slower and more natural: an unhurried walk, and Shift runs at what used to be the walking pace. Strides lengthen with speed, so legs no longer spin quickly at a run.
- Zoom in close to your character or out for a wide view, with the mouse wheel, a two-finger pinch, or the + and − keys.

## 0.3.1 — 2026-11-07

- VRM and GLB models now show their colours and textures instead of plain white. Models load the way 3D Avatars loads them, and only with the pictures inside the model file.

## 0.3.0 — 2026-11-07

- Walk as one of your personas: pick one under Play as. A persona with a VRM model set up in 3D Avatars walks the world in that model, with a walking animation; a GLB model is shown as it is. A persona without one gets a simple low-poly figure that walks too.
- A seeded town now stands around a plaza with a fountain: streets, lamp posts, and houses and halls of different sizes, colours and roofs, with doors and windows. You can't walk through the buildings.
- Trees are much bigger and grow only outside town.
- The camera moves in closer when a building would hide you.

## 0.2.0 — 2026-11-07

- Wanderworld is now a game on its own Home tab instead of a Game Mode Experience, so it installs from the catalog. Open it from the Wanderworld tab on Home.
- A New world button walks a different seeded world, and a Fullscreen button fills the screen on Engines that offer it.
- It no longer reads World Maps, because a Home tab has no chat to read it from.

## 0.1.0 — 2026-11-07

- First prototype. Choose Wanderworld as the Experience in a Game Mode chat to walk a capsule around a low-poly landscape with WASD, the arrow keys or an on-screen stick on touch screens. Shift runs, and Q and E turn the camera.
- The top of the screen shows where World Maps says your party is, and updates after each turn.
- A performance readout shows frames per second, draw calls and triangles. Tap it to draw four or ten times as many trees and rocks, to see how your device copes.
