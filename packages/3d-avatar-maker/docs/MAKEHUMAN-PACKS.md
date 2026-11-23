# MakeHuman asset packs: licences checked item by item

63 zips, 822 items: 421 CC0, 401 CC-BY, 0 unclear. Each item's
licence is read from the pack's own catalogue (`packs/<pack>.json`), compared with the licence line in the
item's own files where they have one (targets and skins don't), and with the zip's name.

## Used in 3D Avatar Maker so far (all CC0)

The package uses data from these items, read by `assets/scripts/make_avatar.py` (shapes and skins) and
`make_mh_clothes.py` (nails). None needs credit, but `kit/CREDITS.md` names the authors anyway.

- Shapes, as one-way sliders (`FACE_DETAIL`, `BODY_DETAIL`): cheek01_cc0 (Elvaerwyn's elvs_chipmunk_cheeks_high_1,
  elvs_chipmunk_cheeks_low_1, elvs_high_chubby_cheekbones_1, elvs_jowls_1, elvs_sunken_cheeks_1); ears01_cc0
  (elvs_flap_ears_1, elvs_ear_flap_bottom_out, rehmanpolanski_ear_flatten, mindfront_ear_details, mindfront_ear_in,
  jujube_ear_canal); nose01_cc0 (elvs_bulbous_nose_1, elvs_nose_widening_1, jujube_greek_statue_nose,
  jujube_nostril_up, jujube_nostril_shrink, habanero_nostril_alar_rounding, mindfront_nose_alar_crease,
  jujube_nose_straight_columella, jujube_nostril_rim_sharp); hands01_cc0 (jujube_knobby_knuckles,
  mindfront_hand_fingers_correction, mindfront_hand_hypothenar, mindfront_hand_thenar_eminence); arms01_cc0
  (mindfront_arm_upper_shape, mindfront_arm_lower_shape, mindfront_arm_wrist_ulna, mindfront_armpit,
  elvs_ladies_elbow_dimples).
- Skins (`COMMUNITY_SKINS`): skins01_cc0 (skalldyrssuppe_creamy_female,
  onlytheghosts_young/middle_aged/old_eurasian_female, toigo_light_skin_female_freckles / _ginger / _bronze,
  flower-angel_red_head_skin); skins02_cc0 (ken1138_caucasian_male_tattooed_skin, mindfront_aksel_skin,
  onlytheghosts_old_eurasian_male, toigo_light_skin_male_bronze / _freckles / _ginger). Beside them, MakeHuman's
  own young_caucasian_female2 (system assets, CC0 in its .mhmat; its picture and thumbnail carry no licence
  text) as the "light" skin.
- Makeup masks (`scripts/build-3d-avatar-maker-masks.mjs` MADE_UP), read as data and not shipped: skins01_cc0
  toigo_light_skin_with_natural_makeup, toigo_light_skin_with_makeup, toigo_light_skin_female_with_violet_makeup,
  toigo_light_skin_female_bronze_with_makeup, toigo_light_skin_female_ginger_with_makeup; skins02_cc0
  toigo_light_skin_male_with_eyeliner / _with_goth_makeup / _with_emo_eyes. Each is compared with the plain skin
  it was painted on, so the maker's eyeshadow, eyeliner and blush go where these paint them. The made-up
  pictures themselves left the kit: the maker paints makeup on any skin.
- Eye pictures (`COMMUNITY_EYES`): system_eye_materials01_cc0 (bobby_03_diffuse_amber/hazel/sea_breeze/blue/grey_eyes,
  mindfront_brown_eye_02, nyloseth_sapphire_blue_eyes, spamrakuen_sr_anime_eyes_navy); system_eye_materials02_cc0
  (nyloseth_blue/brown/green/sapphire/yellow cat eyes, hatshj_reptile_eyes, bobby_03_daz_dragon_eyes). Left out
  for looks, not licence: sonntag78_orcifyhead_eye (a garish yellow white) and the alien, facet, six-eyed,
  blank and zombie ones (could join a fantasy set later).
- Nails (`make_mh_clothes.py` PIECES): bodyparts04_cc0 mindfront_nails_01_short, mindfront_nails_02_medium,
  mindfront_nails_03_long, mindfront_nails_toes_01.
- Brows and lashes, baked onto MakeHuman's cards (`bake_brows.py` STYLES): eyebrows01_cc0 mindfront_eyebrows_02, _04,
  _07, _09; eyelashes01_cc0 mindfront_eyelashes_01, _05.

## In the wardrobe packs

Two packages carry the community clothes, listed with their authors in `assets/packs.json` and each pack's
README, fitted by `make_mh_packs.py`: `3d-avatar-maker-wardrobe-clothes` (every garment: dresses, suits and
bodysuits, tops, trousers, shorts, skirts, underwear, swimwear and shoes) and
`3d-avatar-maker-wardrobe-accessories` (hats and helmets, hoods, the circlet, glasses, goggles and masks,
earrings, rings, gloves and socks). CC0 and CC BY pieces share a pack; each piece carries its own licence and
credit. Until the merge (Clothes 0.1.00, Accessories 0.2.00) there were five packs, described below as they were
built; every piece kept its id when it moved.

### The merge pass (2026-11-23)

The four packs Everyday Women's, Everyday Men's, Historical and Fantasy, and Modern Casual were merged into
Clothes, except their hats, hoods, veil, headband and circlet, which moved to Accessories. Then every
clothes-type item not yet used, excluded or left out was tried: 137 items fitted, 118 kept. For each, every file
was read again for a licence line first (CC0 or CC BY only; an AGPL line anywhere excludes it), and each fitted
piece was rendered in Blender (EEVEE) on each body it's offered for, front, side and back, and the ones the
fitter flagged again on the heavy, muscular body (heavy, muscle, belly and bust or chest at 1).

- Added to Clothes (CC BY 3.0 or 4.0 as each item's files say, unless CC0):
  - dresses: dress01_cc0 toigo_dress_with_tiered_skirt, toigo_keyhole_neck_dress (CC0); dress02_cc-by
    elvs_double_handkerchief_halter_dress, elvs_frilled_party_dress, elvs_fringe_hippy_dress,
    elvs_fringe_leather_dress, elvs_goddess_dress5 (fitted with `skin: false`), elvs_halter_dress_knee_length,
    _long, _mini and _tiered, elvs_sarong_cover_up (a wrap dress, so a whole outfit), elvs_simple_60s_dress,
    elvs_simple_fashion_dress_1 and _2; dress03_cc-by mindfront_ballet_dress_the_swan, mindfront_f_dress_01,
    _02, _03, _04, _06, _07, _08 and _11, punkduck_black_cocktail_dress, punkduck_figure_skating_dress,
    punkduck_middle_length_qipao, punkduck_tube_dress;
  - suits and bodysuits: suits03_cc-by elvs_halter_style_pantsuit1, mindfront_m_suit_01,
    punkduck_short_bodysuit_female, punkduck_tennis_dress, punkduck_triathlon_suit_female;
  - tops: shirts02_ccby and shirts03_ccby elvs_male_boho_top1, janexx_old_female_sweater,
    mindfront_cardigan_long_open_front (over the shirt), mindfront_knitted_sweater_02, mindfront_lusekofta,
    punkduck_lace_up_blouse, drednicolson_short-tail_camo_tee, elvs_disco_top2, elvs_disco_top_1_butterfly,
    elvs_male_logo_tshirt1 (the print is the author's own signature), elvs_male_muscle_shirt1,
    elvs_male_tankshirt1, punkduck_sleeveless_shirt;
  - trousers and shorts: pants02_ccby and pants03_ccby elvs_disco_pants_double_ruffles, _single_ruffles and
    _skinny, elvs_gored_elephant_pants, elvs_jeans_bootcut, elvs_male_trouser, elvs_male_trouser_with_chain,
    mindfront_female_trousers_1, mindfront_male_trousers_1, elvs_male_swim_shorts1, elvs_male_trouser_short_1
    and _2, mindfront_male_swimming_trunks_01, _02 and _03; suits03_cc-by elvs_emt_uniform_pants_female and
    _male;
  - skirts: skirts02_cc-by elvs_asymmetrical_skirt, elvs_disco_mini_skirt, elvs_gored_midi_skirt,
    elvs_pleated_plaid_mini_skirt, punkduck_skirt_native_american_fashion;
  - underwear and swimwear (bras and tops in the Shirt or top slot, briefs in Legs, one-pieces as a whole
    outfit; each hides the body's own underwear it replaces): underwear01_cc0 wolgade_female_top_01 and
    wolgade_female_panties_01 (CC0); underwear02_cc0 (a zip named CC0 whose catalogue and files say CC BY)
    elvs_crude_bootyshorts, elvs_lace_panty, mindfront_bikini_01, punkduck_babydoll, punkduck_bandeau_bikini_bra
    and _slip, punkduck_bikini02_bra and _slip, punkduck_brazilian_bikini_bra and _slip,
    punkduck_french_lingerie_bra and _mini_briefs, punkduck_frill_bikini_top and _bottom, punkduck_sport_bra and
    _briefs; underwear03_cc-by elvs_bandeau_swimwear_top_1, elvs_swimwear_micro_shorts,
    elvs_vintage_swimwear1_50s_strapless, joepal_plain_bra, mindfront_f_one-piece_swimsuit_01,
    punkduck_female_strapless_bodysuit, punkduck_halterneck_romper, punkduck_one_piece_bikini01,
    punkduck_shapewear;
  - shoes: shoes01_cc0 toigo_ballet_flats_with_flowers (CC0); shoes02_ccby elvs_flatshoe_bow1, _gemmed1 and
    _plain1, elvs_male_flip_flop_sandals1 (hides nothing: the feet show), mindfront_shoes_monk_strap_female
    (fitted at `clearance: 0.001`), punkduck_cycling_shoes; shoes03_ccby madmanny_tight_leather_boots.
- Added to Accessories: hats03_cc-by and hats04_cc-by elvs_santa_hat, elvs_unisex_chef_hat_1,
  mindfront_fishing_hat_01, mindfront_patrol_cap, punkduck_sun_visor_sports_visor, punkduck_swim_cap,
  mindfront_helmet_kz45, punkduck_bicycle_helmet_time_trial_aero_helmet (its print names the author's own
  made-up brand), punkduck_riding_helmet; glasses02_ccby elvs_covid_goggles1, punkduck_goggles,
  punkduck_sport-sunglasses; masks02_ccby elvs_covid_mask (Face mask), gredal_gas_mask (Glasses slot, hides the
  hair); underwear02_cc0 punkduck_french_lingerie_stockings (Socks).
- Credited under CC BY 4.0 though their files say CC0, as their catalogue says CC-BY:
  janexx_old_female_sweater, joepal_plain_bra, gredal_gas_mask.
- Left out for licence: four more items whose `.obj` says AGPL-3 (culturalibre_heroine_boots_4,
  culturalibre_hero_mask_5, punkduck_string_2, punkduck_transparent_bra; added to the list below).
- Left out as named for a character, film or brand: green_tomato_rei_ayanami, green_tomato_yoko_tsuno,
  slayer227_spider-gwen, punkduck_deathnote_t-shirt, punkduck_kill_bill_shoes, elvs_lara_tank1 (Lara Croft),
  sonicteam998_maria_skirt (tagged Sonic). After fitting: elvs_racing_fire_suit_female1 (MakeHuman's logo and
  sponsor-style patches) and elvs_emt_uniform_jacket_female and _male (the Red Cross emblem, which is protected).
- Left out as too heavy to ship (over about 12k vertices): elvs_crochet_baby_doll (23k),
  elvs_fashion_stylized_qipoa (19k), elvs_fringe_off_shoulder_dress (14k), elvs_goddess_dress3 (32k), _4 (19k),
  _6 (14k) and _8 (33k), toigo_female_suit (14k), matcreator_mc-bodysuit-2021 (28k),
  matcreator_mc-scifi-armor_helios (71k) and _jupiter7 (13k), elvs_male_coveralls_1 (18k),
  elvs_racing_fire_suit_male1 (13k), elvs_ladies_tank1 (31k), elvs_male_athletic_tank1 (58k),
  elvs_retro_girly_shorts1 (15k), toigo_flats (29k), toigo_stiletto_booties (22k, heeled too),
  elvs_flatshoe_buckle_1 (40k), elvs_zombie_killer_sneakers (77k), elvs_knee_high_heel_boots1 (37k, heeled),
  elvs_wedge_tall_boots1 (23k, a wedge heel), elvs_all_tied_up_bikini (78k), elvs_camisole1 (13k),
  elvs_ladies_sunglass1 (19k).
- Left out as explicit lingerie, kept out of packs meant for shareable avatars (they could be added if wanted):
  the thongs punkduck_string_5, punkduck_french_lingerie_thong and punkduck_strappy_lace_thong,
  punkduck_teddy_erotic_lingerie, punkduck_french_lingerie_suspender_belt (no slot fits it either), and after
  fitting elvs_bow_front_bra and elvs_bow_bottom_panty (open cups and an open back leave the breasts and
  buttocks bare).
- Left out for the fitting, not the item (the faults come from `make_mh_clothes.py`'s push off the skin under
  every shape key and its one clearance for every layer; retry these once the fitting is reworked):
  - mindfront_f_dress_05, _09 and _10 and punkduck_evening_gown: their floor-length hems run through the flat
    feet, and pushed off them they break into spikes (refitted with `skin: false`, still spiky);
  - matcreator_mc-skinsuit_2022: spikes at the feet and skin through all over;
  - thegreatengineer_galactic_warrior_uniform: its belt and knee bands flare into flaps on a heavier body;
  - elvs_sporty_tracksuit_hoodie_dress1 and punkduck_wetsuit: their cuffs break into spikes on a heavier body;
  - mindfront_shoes_monk_strap_male: its own sock shows through the heel, still at 1 mm clearance (the female
    one is in).
- Left out for the item itself, after rendering:
  - joachip_cyborg_suit: a crude low-poly costume with skin through a gap at the back;
  - matcreator_mc-scifi-armor_guardian: only boots and bracers, two slots in one piece, and the toes break up;
  - punkduck_female_half-boots: heeled, so the toes come through the maker's flat foot;
  - donitz_monk_robe_hood_off: made to lie on the robe's collar; alone it hangs off the back as a flap.
- Left out by choice: elvs_basic_brave_feathers1, a "brave" feather headdress (a costume stereotype; it fits).
- Not tried here, for later passes: objects (equipment), jewellery needing new slots, body parts and all hair.

### The five packs before the merge

The separate packages `3d-avatar-maker-wardrobe-everyday-women`, `-everyday-men`, `-accessories`,
`-historical-fantasy` and `-modern-casual` carried community clothes. The first three are all CC0: every
one of each item's own files says CC0 too, or names no licence (spamrakuen's glasses, joachip_ring_1), where
the catalogue's CC0 stands. Their 0.1.01 took out six items whose `.obj` says AGPL-3 though their `.mhclo`
says CC0 (listed under "Excluded: a model or material file says AGPL-3"). The last two are mostly CC BY,
and every file of each item was read before it went in.

- Everyday women's: dress01_cc0 (eight toigo dresses, aethelraed_flapper_dress), shirts01_cc0 (six toigo tops,
  joepal_crude_t-shirt_female), skirts01_cc0 (four toigo skirts), pants01_cc0 toigo_harem_pants, shoes01_cc0
  (four toigo shoes).
- Everyday men's: suits01_cc0 (four toigo men's suits, toigo_female_double-breasted_suit, toigo_female_suit_2),
  shirts01_cc0 namuhekam_male_polo_shirt and elvs_crude_t-shirt_male, pants01_cc0 toigo_wool_pants,
  shoes01_cc0 toigo_ankle_boots_male.
- Accessories: glasses01_cc0 (spamrakuen_sagerfrogs_glasses_01 to _04, spamrakuen_tbm_glasses_frames_01,
  toigo_round_glasses_leopard), masks01_cc0 (joepal_medical_mouth_protection), jewelry01_cc0
  (toigo_pearl_earrings, joachip_ring_1, wolgade_diamond_ring_01), gloves01_cc0 (toigo_gloves_short, _medium
  and _long), underwear04_cc0 (all four socks), hats01_cc0 (aethelraed_unraed_cloche_hat, joepal_xmas_cap).
- Historical and fantasy: suits02_cc0 donitz_monk_robe, _hood and _hood_down (CC0); and CC BY 4.0:
  dress03_cc-by punkduck_medieval_dress, dress02_cc-by elvs_goddess_dress1, 2 and 7, shirts03_ccby
  elvs_ruffle_sleeve_peasant_blouse_1 and drednicolson_asymmetric_tunic_and_sash, hats03_cc-by
  elvs_dirty_lil_maid_bonnet, elvs_charity_veil1 and elvs_tophat1, hats04_cc-by drednicolson_pith_helmet,
  jewelry02_cc-by punkduck_brass_circlet_crown, shoes03_ccby punkduck_medieval_boots and punkduck_riding_boots,
  shoes02_ccby elvs_basic_felt_elf_shoes.
- Modern casual, CC BY 3.0 or 4.0 as each item's files say: shirts02_ccby and shirts03_ccby (seven punkduck
  tops, mindfront_knitted_sweater_01, mindfront_tank_top_01, elvs_male_shirt_untucked_bd1,
  elvs_male_shirt_tie_tucked1, elvs_hooded_sweat_jacket1), dress03_cc-by punkduck_winter_coat, pants02_ccby and
  pants03_ccby (punkduck_female_short_jeans, punkduck_male_classic_jeans, elvs_jeans_straight_leg,
  mindfront_male_trousers_2), skirts02_cc-by (punkduck_black_mini_skirt, punkduck_jeans_skirt,
  punkduck_retro_polka_dot_skirt, elvs_pencil_skirt, mtknife_pleated_mini_skirt), shoes02_ccby and shoes03_ccby
  (punkduck_running_shoes_01, punkduck_tennis_shoes, punkduck_comfortable_sneakers, punkduck_winter_boots,
  mindfront_shoes_oxford_male and _female, mindfront_shoes_biker_boots_male and _female), hats03_cc-by
  (elvs_slouchy_beanie1, elvs_male_flat_cap1, mindfront_knitted_hat_01, mindfront_sherpa_hat).
- CC BY versions: where an item's files say only "CC-BY" (Elvaerwyn's, DredNicolson's, culturalibre's), it is
  credited under 4.0, the version MakeHuman's FAQ on CC-BY assets links to. punkduck_female_knee_boots says 4.0
  in its `.mhclo` and 3.0 in its `.obj` (it was left out for fit anyway).
- Left out for fit or size, not licence: mindfront_kimono (its scale references are helper vertices; fitted, it
  had stray vertices a metre off the body and skin through it) and toigo_suit_with_jacket_and_bowtie (12.8k
  vertices). For the Accessories pack: toigo_diamond_ring_and_wedding_band (17k vertices), toigo_pearl_necklace
  (28k), culturalibre_motorcycle_helmet (22k), mrgreaterthan_m1_helmet (35k), culturalibre_doc_ock_glasses
  (10k, and named for a film character), culturalibre_hero-heroine_gloves_2 to _5 (superhero gloves, not
  needed beside toigo's), and toigo_maga_hat (political). For the historical and modern packs:
  elvs_caesar_sandals1 (47k vertices), elvs_ladies_apron (29k), elvs_plague_doctor_mask (18k), mindfront_f_ninja
  (16k), elvs_male_trilby_hat (15k), elvs_flatshoe_pointy1 (lumpy toes once fitted),
  punkduck_female_knee_boots (heeled: the toes come through on the maker's flat foot), and
  punkduck_riding_boots on the male body (a jagged toe; the female one is in).
- Left out for licence from those two packs' first choices (their `.obj` says AGPL-3; listed under that heading):
  rehmanpolanski_viking_tunic, _pants and _boots, culturalibre_warrior_helmet and _02,
  culturalibre_cl_don_quixote_hat, culturalibre_cl_bowler_hat, punkduck_female_tight_jeans and
  culturalibre_sneakers.

## Left out though the licence allows them

- Skins painted bare (genitals in the picture), which a shareable avatar under underwear shouldn't carry: skins01_cc0
  cutoff3d_indian_female_enhanced, cutoff3d_indian_female_skin, saltycowdawg_genuine_caucasian_female_with_genitals,
  spreadcore_alana_caucasian_female_with_genitals_skin; skins02_cc0
  jartur69_middleage_slavic_male_with_genitals_and_beard, jartur69_old_slavic_male_with_genitals_and_beard,
  mindfront_skin_male_african_middleage. (Their groin could be painted over with the skin's own tone if you want
  any of them, the Indian and African ones especially, since the kit has few darker community skins.)
- Every other skin in skins01/skins02 is allowed and simply not used yet, to keep the zip small.
- The Mindfront brow and lash meshes are too heavy to ship as they are (9–28k and 11–20k vertices), so six were baked
  into light cards instead; the other Mindfront brows and lashes could be baked the same way (one line each).

## Excluded: the item's own files say AGPL-3 (83)

Older versions of MakeHuman's clothing tool wrote an AGPL-3 line into every file it exported, so this is
probably not the author's choice; the catalogue says CC0 or CC-BY. But a file that contradicts its catalogue
isn't clearly CC0 or CC-BY, so these are left out unless that's decided otherwise.

- bodyparts01_cc0.zip: freezychan_lucoa_quetzalcoatl_horns (catalogue CC0, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- bodyparts01_cc0.zip: jaldmic_houndoom_horns (catalogue CC0, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- bodyparts02_cc-by.zip: jaldmic_demon_horns (catalogue CC-BY, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- bodyparts02_cc-by.zip: jaldmic_toriel_horns (catalogue CC-BY, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- bodyparts04_cc0.zip: grinsegold_fingernails_female_natural (catalogue CC0, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- bodyparts05_cc0.zip: grinsegold_beard_sigmund_wip (catalogue CC0, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- bodyparts05_cc0.zip: wdg_scruffy_beard (catalogue CC0, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- bodyparts06_cc-by.zip: grinsegold_full_beard (catalogue CC-BY, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- bodyparts06_cc-by.zip: grinsegold_moustache (catalogue CC-BY, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- dress01_cc0.zip: wdg_mycenaean_tunic (catalogue CC0, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- equipment01_cc0.zip: o4saken_dagger (catalogue CC0, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- equipment02_cc-by.zip: jaldmic_akm_base (catalogue CC-BY, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- equipment02_cc-by.zip: jaldmic_l1a1 (catalogue CC-BY, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- equipment02_cc-by.zip: jaldmic_m1911a1 (catalogue CC-BY, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- equipment02_cc-by.zip: maciekg_hammer (catalogue CC-BY, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- equipment02_cc-by.zip: maciekg_short_bow (catalogue CC-BY, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- equipment02_cc-by.zip: punkduck_p-ivy_weapon (catalogue CC-BY, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- glasses01_cc0.zip: ews_3d_glasses (catalogue CC0, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- glasses01_cc0.zip: frankyaye_glasses_library_male (catalogue CC0, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- glasses01_cc0.zip: kwnet_at_optical_glasses (catalogue CC0, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- gloves01_cc0.zip: culturalibre_hero-heroine_gloves_1 (catalogue CC0, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- gloves01_cc0.zip: learning_mma_fighting_gloves (catalogue CC0, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- hair01_cc0.zip: culturalibre_hair_01 (catalogue CC0, files AGPL3 (see also http://www.makehuman.org/node/320))
- hair01_cc0.zip: culturalibre_hair_02 (catalogue CC0, files AGPL3 (see also http://www.makehuman.org/node/320))
- hair01_cc0.zip: elvs_double_mh_braid (catalogue CC0, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- hair01_cc0.zip: elvs_french_braid_variation (catalogue CC0, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- hair01_cc0.zip: elvs_unkempt_french_braid (catalogue CC0, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- hair01_cc0.zip: learning_anime_hair (catalogue CC0, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- hair01_cc0.zip: littleright_bobcut_hair (catalogue CC0, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- hair01_cc0.zip: rehmanpolanski_hair_bun_brown (catalogue CC0, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- hair01_cc0.zip: sonntag78_blond_with_headband (catalogue CC0, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- hair01_cc0.zip: sonntag78_junglebook_hair (catalogue CC0, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- hair02_ccby.zip: elvs_witchy_lil_bob (catalogue CC-BY, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- hair03_ccby.zip: grinsegold_wig_bow_tie (catalogue CC-BY, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- hair03_ccby.zip: grinsegold_wig_bun_blonde_braids (catalogue CC-BY, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- hair03_ccby.zip: punkduck_alpha7_curly (catalogue CC-BY, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- hair03_ccby.zip: punkduck_alpha7_curly2 (catalogue CC-BY, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- hair03_ccby.zip: punkduck_alpha7_long (catalogue CC-BY, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- hair03_ccby.zip: punkduck_alpha7_long2 (catalogue CC-BY, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- hats01_cc0.zip: grinsegold_uncle_joshis_hat (catalogue CC0, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- hats01_cc0.zip: jujube_bag_on_head (catalogue CC0, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- hats01_cc0.zip: jujube_newsboy_cap (catalogue CC0, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- hats02_cc0.zip: grinsegold_corinthian_helmet (catalogue CC0, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- hats02_cc0.zip: javherre_casco_caballero_templario_templar_knight_helmet (catalogue CC0, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- hats03_cc-by.zip: elvs_witchy_hallows_hat1 (catalogue CC-BY, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- hats03_cc-by.zip: maciekg_wizard_hat (catalogue CC-BY, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- hats04_cc-by.zip: jaldmic_m1951_72 (catalogue CC-BY, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- hats04_cc-by.zip: maciekg_horned_helmet (catalogue CC-BY, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- hats04_cc-by.zip: maciekg_leather_helmet (catalogue CC-BY, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- jewelry01_cc0.zip: ews_hoop_earrings (catalogue CC0, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- jewelry01_cc0.zip: ews_industrial_piercing_left_ear_ (catalogue CC0, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- jewelry01_cc0.zip: ews_industrial_piercing_right_ear_ (catalogue CC0, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- jewelry01_cc0.zip: ews_septum_ring (catalogue CC0, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- jewelry01_cc0.zip: learning_slave_collar_chain (catalogue CC0, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- jewelry01_cc0.zip: toigo_wedding_ring (catalogue CC0, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- jewelry02_cc-by.zip: elvs_pumpkin_hallows_earrings1 (catalogue CC-BY, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- jewelry02_cc-by.zip: jaldmic_ankh_collar (catalogue CC-BY, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- shirts01_cc0.zip: skalldyrssuppe_tube_top_funky_colors (catalogue CC0, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- shirts02_ccby.zip: ews_striped_shirt (catalogue CC-BY, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- shoes01_cc0.zip: grinsegold_female_pirate_boots (catalogue CC0, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- shoes01_cc0.zip: scailman_gogo_platform_boots (catalogue CC0, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- shoes01_cc0.zip: scailman_semitransparent_water_boots (catalogue CC0, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- shoes02_ccby.zip: callharvey3d_harvey_saddleshoes1 (catalogue CC-BY, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- shoes02_ccby.zip: dressupdoc_balletflat1 (catalogue CC-BY, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- shoes02_ccby.zip: dressupdoc_domsjeans1 (catalogue CC-BY, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- shoes02_ccby.zip: dressupdoc_maryjane1 (catalogue CC-BY, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- shoes02_ccby.zip: dressupdoc_sandals1 (catalogue CC-BY, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- shoes03_ccby.zip: maciekg_leather_boots (catalogue CC-BY, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- shoes03_ccby.zip: scailman_low-heeled_boots (catalogue CC-BY, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- skirts01_cc0.zip: frankyaye_mini_skirt_01 (catalogue CC0, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- skirts01_cc0.zip: frankyaye_mini_skirt_02 (catalogue CC0, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- skirts02_cc-by.zip: callharvey3d_harvey_pskirt01 (catalogue CC-BY, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- skirts02_cc-by.zip: scsouza_mini_denin_skirt (catalogue CC-BY, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- suits03_cc-by.zip: grinsegold_mars_suit (catalogue CC-BY, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- suits03_cc-by.zip: maciekg_wizard_robe (catalogue CC-BY, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- suits03_cc-by.zip: tiomegamanx_skintight_body_suit_female (catalogue CC-BY, files AGPL3 (see also http://www.CC0)
- underwear01_cc0.zip: kwnet_at_pantyhose01 (catalogue CC0, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- underwear01_cc0.zip: marco_105_armsleeve02 (catalogue CC0, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- underwear01_cc0.zip: marco_105_stocking01 (catalogue CC0, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- underwear01_cc0.zip: marco_105_stocking02 (catalogue CC0, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- underwear02_cc0.zip: jaldmic_stockings (catalogue CC-BY, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- underwear02_cc0.zip: punkduck_bandeau_bra (catalogue CC-BY, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))
- underwear02_cc0.zip: punkduck_string_4 (catalogue CC-BY, files AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html))

## Excluded: a model or material file says AGPL-3 though the item's other files don't (109)

The check above read each item's `.mhclo` (or `.mhmat`). On 2026-11-23 every text file of every item was read,
in all 63 zips. These items have an AGPL-3 line in another file, usually the `.obj` that holds the mesh, while
their `.mhclo` and catalogue say CC0 or CC-BY. They are left out on the same grounds as the 83 above. The
files named are the ones with the line. MakeHuman's own system assets (`makehuman_system_assets_cc0`) carry
no licence lines at all, so the kit's MakeHuman hair, clothes, eyes and skins are unaffected.

- bodyparts01_cc0.zip: culturalibre_faun_horns: faun_horns.obj
- bodyparts01_cc0.zip: culturalibre_minotaur_horns: minotaur_horns.obj
- bodyparts03_cc-by.zip: culturalibre_cl_devil_tail: cl_devil_tail.obj
- bodyparts03_cc-by.zip: culturalibre_tigra_tail: tigra_tail.obj
- bodyparts05_cc0.zip: culturalibre_faun_beard: faun_beard.obj
- bodyparts05_cc0.zip: rehmanpolanski_beard_viking: beardviking.obj
- bodyparts05_cc0.zip: rehmanpolanski_moustache_viking: moustacheviking.obj
- bodyparts06_cc-by.zip: culturalibre_dal_moustache: dali_moustache.obj
- equipment01_cc0.zip: culturalibre_hand_claws: hand_claws.obj
- equipment01_cc0.zip: culturalibre_hero_kalistick: hero_kalistick.obj
- equipment01_cc0.zip: culturalibre_hero_kalistick_lefthanded: hero_kalistick_lefthanded.obj
- equipment01_cc0.zip: culturalibre_magic_sceptre: magic_sceptre.obj
- equipment01_cc0.zip: culturalibre_war_hammer: warhammer.obj
- equipment01_cc0.zip: culturalibre_wooden_bow: wooden_bow.obj
- equipment02_cc-by.zip: culturalibre_cl_gun: cl_gun.obj
- equipment02_cc-by.zip: culturalibre_cl_gun_left_hand: cl_gun_left_hand.obj
- equipment03_cc-by.zip: culturalibre_suitcase: suitcase.obj
- glasses01_cc0.zip: culturalibre_doc_ock_glasses: doc_ock_glasses.obj
- glasses02_ccby.zip: punkduck_glasses_modern_form: glasses.obj
- gloves01_cc0.zip: culturalibre_hero-heroine_gloves_2: hero-heroine_gloves_2.obj
- gloves01_cc0.zip: culturalibre_hero-heroine_gloves_3: hero-heroine_gloves_3.obj
- gloves01_cc0.zip: culturalibre_hero-heroine_gloves_4: hero-heroine_gloves_4.obj
- gloves01_cc0.zip: culturalibre_hero-heroine_gloves_5: hero-heroine_gloves_5.obj
- hair01_cc0.zip: cortu_shaggy_green_hair: shaggy_green.obj
- hair01_cc0.zip: cortu_short_messy_hair: short_messy.obj
- hair01_cc0.zip: cortu_straight_bangs: straight_bangs.obj
- hair01_cc0.zip: cortu_strawberry_cloud_hair: strawberry_cloud.obj
- hair01_cc0.zip: culturalibre_hair_05: hair_05.obj
- hair01_cc0.zip: culturalibre_hair_06: hair_06.obj
- hair03_ccby.zip: culturalibre_hair_11: hair_01.obj
- hair03_ccby.zip: culturalibre_hair_12: hair_02.obj
- hair03_ccby.zip: culturalibre_hair_13: hair_03.obj
- hair03_ccby.zip: culturalibre_hair_14: hair_04.obj
- hair03_ccby.zip: culturalibre_hair_17: hair_07.obj
- hair03_ccby.zip: culturalibre_hair_18: hair_08.obj
- hats02_cc0.zip: culturalibre_motorcycle_helmet: motorcyclehelmet.obj
- hats02_cc0.zip: culturalibre_skull_helmet: skull_helmet.obj
- hats02_cc0.zip: culturalibre_warrior_helmet: warrior_helmet.obj
- hats03_cc-by.zip: culturalibre_cl_bowler_hat: cl_bowler_hat.obj
- hats03_cc-by.zip: culturalibre_cl_don_quixote_hat: cl_don_quixote_hat.obj
- hats04_cc-by.zip: culturalibre_warrior_helmet_02: warrior_helmet_02.obj
- jewelry01_cc0.zip: culturalibre_hero_gem: hero_gem.obj
- jewelry01_cc0.zip: culturalibre_heroine_lightning_earrings: heroine_lightning_earrings.obj (was in a wardrobe pack until its 0.1.01)
- jewelry02_cc-by.zip: culturalibre_cl_spiral_bracelets: cl_spiral_bracelets.obj
- jewelry02_cc-by.zip: culturalibre_leather_bracelet: leather_bracelet.obj
- masks01_cc0.zip: culturalibre_hero-heroine_hood_1: hero-heroine_hood_1.obj
- masks01_cc0.zip: culturalibre_hero-heroine_hood_2: hero-heroine_hood_2.obj
- masks01_cc0.zip: culturalibre_hero_mask_1: hero_mask_1.obj
- masks01_cc0.zip: culturalibre_hero_mask_2: hero_mask_2.obj
- masks01_cc0.zip: culturalibre_hero_mask_3: hero_mask_3.obj (was in a wardrobe pack until its 0.1.01)
- masks01_cc0.zip: culturalibre_hero_mask_4: hero_mask_4.obj (was in a wardrobe pack until its 0.1.01)
- masks01_cc0.zip: culturalibre_heroine_mask_1: heroine_mask_1.obj
- masks02_ccby.zip: culturalibre_bandana_mask: bandana_mask.obj
- pants01_cc0.zip: cortu_cargo_pants: cargo_pants.obj (was in a wardrobe pack until its 0.1.01)
- pants01_cc0.zip: cortu_jeans_shorts: jean_shorts.obj (was in a wardrobe pack until its 0.1.01)
- pants02_ccby.zip: punkduck_female_tight_jeans: tightjeans.obj
- shoes01_cc0.zip: cortu_floppy_overknee_shoes: floppy_overknee_shoe.obj
- shoes01_cc0.zip: cortu_t-bar: tbar.obj (was in a wardrobe pack until its 0.1.01)
- shoes01_cc0.zip: culturalibre_hero_boots_1: hero_boots_1.obj
- shoes01_cc0.zip: culturalibre_hero_boots_2: hero_boots_2.obj
- shoes01_cc0.zip: culturalibre_hero_boots_3: hero_boots_3.obj
- shoes01_cc0.zip: culturalibre_hero_boots_4: hero_boots_4.obj
- shoes01_cc0.zip: culturalibre_hero_boots_5: hero_boots_5.obj
- shoes01_cc0.zip: culturalibre_heroine_boots_1: heroine_boots_1.obj
- shoes01_cc0.zip: culturalibre_heroine_boots_2: heroine_boots_2.obj
- shoes01_cc0.zip: culturalibre_heroine_boots_3: heroine_boots_3.obj
- shoes01_cc0.zip: culturalibre_male_boots: male_boots.obj
- shoes02_ccby.zip: culturalibre_sneakers: sneakers.obj
- skins01_cc0.zip: blindsaypatten_uniform_skin_texture: blindsaypatten_uniform_skin_texture.mhmat
- skins01_cc0.zip: callharvey3d_midtoned_female: callharvey3d_midtoned_female.mhmat (was in the kit until 0.1.05)
- skins02_cc0.zip: rehmanpolanski_skin_viking_tattoos: rehmanpolanski_skin_viking_tattoos.mhmat (was in the kit until 0.1.05)
- skirts02_cc-by.zip: mtknife_low_mini_skirt: low_mini_skirt.obj
- suits02_cc0.zip: culturalibre_hero_suit_1: hero_suit_1.obj
- suits02_cc0.zip: culturalibre_hero_suit_2: hero_suit_2.obj
- suits02_cc0.zip: culturalibre_hero_suit_3: hero_suit_3.obj
- suits02_cc0.zip: culturalibre_heroine_suit_2: heroine_suit_2.obj
- suits02_cc0.zip: rehmanpolanski_viking_boots: bootsviking.obj
- suits02_cc0.zip: rehmanpolanski_viking_pants: pantsviking.obj
- suits02_cc0.zip: rehmanpolanski_viking_tunic: tunicviking.obj
- suits03_cc-by.zip: punkduck_diver_suit: diver_suit.obj
- system_clothes_materials01_cc0.zip: male_casualsuit01: toigo_male_casual_suit_01_khaki.mhmat, toigo_male_casual_suit_01_purple_shirt.mhmat, toigo_male_casual_suit_01_purple_shirt_with_black_jeans.mhmat, toigo_male_casual_suit_01_red_shirt_with_black_jeans.mhmat, toigo_male_casual_suit_01_teal_shirt_with_black_jeans.mhmat, toigo_male_casual_suit_01_white_shirt.mhmat, toigo_male_casual_suit_01_yellow_shirt.mhmat
- system_clothes_materials01_cc0.zip: male_elegantsuit01: toigo_male_elegant_suit_blue_pinstripe_with_paisley_tie.mhmat, toigo_male_elegant_suit_blue_with_red_striped_tie.mhmat, toigo_male_elegant_suit_brown.mhmat, toigo_male_elegant_suit_burgundy.mhmat, toigo_male_elegant_suit_eggplant.mhmat, toigo_male_elegant_suit_gray.mhmat, toigo_male_elegant_suit_gray_pinstripe_with_paisley_tie.mhmat, toigo_male_elegant_suit_olive.mhmat, toigo_male_elegant_suit_teal.mhmat
- system_eye_materials02_cc0.zip: gpedroso_blank_eye: gpedroso_blank_eye.mhmat
- system_eye_materials02_cc0.zip: titleknown_trans_eyes: titleknown_trans_eyes.mhmat
- system_eye_materials03_cc-by.zip: callharvey3d_harvey_eye1: callharvey3d_harvey_eye1.mhmat
- system_eye_materials03_cc-by.zip: callharvey3d_harvey_eye2: callharvey3d_harvey_eye2.mhmat
- system_eye_materials03_cc-by.zip: elvs_santa_helpers_eyes: elvs_santa_helpers_eyes.mhmat
- system_hair_materials01_cc0 (1).zip: ponytail01: dariush086_ponytail01_black.mhmat, dariush086_ponytail01_brown.mhmat, dariush086_ponytail01_gold.mhmat, dariush086_ponytail01_green.mhmat, dariush086_ponytail01_pink.mhmat, dariush086_ponytail01_platinum.mhmat, dariush086_ponytail01_red.mhmat, dariush086_ponytail01_violet.mhmat, mtknife_ponytail01_deep_red.mhmat
- system_hair_materials01_cc0 (1).zip: short02: bogdan666_short_02_brown.mhmat, bogdan666_short_02_gray.mhmat, bogdan666_short_02_red.mhmat
- system_hair_materials01_cc0 (1).zip: short04: toigo_short_04_auburn.mhmat, toigo_short_04_blonde.mhmat, toigo_short_04_blue.mhmat, toigo_short_04_brown.mhmat, toigo_short_04_ginger.mhmat, toigo_short_04_gray.mhmat
- system_hair_materials02_cc0 (1).zip: bob01: elvaerwyn_bob_01_blood_copper.mhmat
- system_hair_materials02_cc0 (1).zip: bob02: elvaerwyn_bob_02_50s_cherrybomb.mhmat, elvaerwyn_bob_02_candy_fushia.mhmat, elvaerwyn_bob_02_honey_blonde.mhmat, elvaerwyn_bob_02_platinum.mhmat, elvaerwyn_bob_02_pumpkin.mhmat, elvaerwyn_bob_02_retro_black.mhmat, elvaerwyn_bob_02_retro_grey.mhmat, elvaerwyn_bob_02_retro_oilslickster.mhmat, elvaerwyn_bob_02_tangerine.mhmat
- system_hair_materials02_cc0 (1).zip: short04: toigo_short_04_green.mhmat, toigo_short_04_violet.mhmat
- underwear01_cc0.zip: v0rt3x_armsleeves_black_fishnet_large: armsleeve_fishnet_large.obj
- underwear01_cc0.zip: v0rt3x_armsleeves_black_fishnet_medium: armsleeve_fishnet_medium.obj
- underwear01_cc0.zip: v0rt3x_armsleeves_black_fishnet_small: armsleeve_fishnet_small.obj
- underwear01_cc0.zip: v0rt3x_armsleeves_white_fishnet_large: armsleeve_white_l.obj
- underwear01_cc0.zip: v0rt3x_armsleeves_white_fishnet_medium: armsleeve_white_m.obj
- underwear01_cc0.zip: v0rt3x_armsleeves_white_fishnet_small: armsleeve_white_s.obj
- underwear01_cc0.zip: v0rt3x_stockings_black_fishnet_large: stockings_fishnet_large.obj
- underwear01_cc0.zip: v0rt3x_stockings_black_fishnet_medium: stockings_fishnet_medium.obj
- underwear01_cc0.zip: v0rt3x_stockings_black_fishnet_small: stockings_fishnet_small.obj
- underwear01_cc0.zip: v0rt3x_stockings_white_fishnet_large: stockings_white_l.obj
- underwear01_cc0.zip: v0rt3x_stockings_white_fishnet_medium: stockings_white_m.obj
- underwear01_cc0.zip: v0rt3x_stockings_white_fishnet_small: stockings_white_s.obj
- Found on the merge pass (their folders hadn't been extracted for the first full read):
  - masks01_cc0.zip: culturalibre_hero_mask_5: hero_mask_5.obj
  - shoes01_cc0.zip: culturalibre_heroine_boots_4: heroine_boots_4.obj
  - underwear02_cc0.zip: punkduck_string_2: string2.obj
  - underwear02_cc0.zip: punkduck_transparent_bra: transparent_bra.obj

## In a zip named for another licence: use the catalogue's (27)

- masks01_cc0.zip: culturalibre_hero_mask_5 (catalogue CC-BY, files CC-0)
- shoes01_cc0.zip: culturalibre_heroine_boots_4 (catalogue CC-BY, files CC-0)
- underwear02_cc0.zip: elvs_bow_bottom_panty (catalogue CC-BY, files CC_by)
- underwear02_cc0.zip: elvs_bow_front_bra (catalogue CC-BY, files CC_by)
- underwear02_cc0.zip: elvs_crude_bootyshorts (catalogue CC-BY, files CC_by)
- underwear02_cc0.zip: elvs_lace_panty (catalogue CC-BY, files CC_by)
- underwear02_cc0.zip: mindfront_bikini_01 (catalogue CC-BY, files CC BY 4.0)
- underwear02_cc0.zip: punkduck_babydoll (catalogue CC-BY, files CC BY 3.0)
- underwear02_cc0.zip: punkduck_bandeau_bikini_bra (catalogue CC-BY, files CC BY 3.0)
- underwear02_cc0.zip: punkduck_bandeau_bikini_slip (catalogue CC-BY, files CC BY 3.0)
- underwear02_cc0.zip: punkduck_bikini02_bra (catalogue CC-BY, files CC BY 3.0)
- underwear02_cc0.zip: punkduck_bikini02_slip (catalogue CC-BY, files CC BY 3.0)
- underwear02_cc0.zip: punkduck_brazilian_bikini_bra (catalogue CC-BY, files CC BY 3.0)
- underwear02_cc0.zip: punkduck_brazilian_bikini_slip (catalogue CC-BY, files CC BY 3.0)
- underwear02_cc0.zip: punkduck_french_lingerie_bra (catalogue CC-BY, files CC BY 3.0)
- underwear02_cc0.zip: punkduck_french_lingerie_mini_briefs (catalogue CC-BY, files CC BY 3.0)
- underwear02_cc0.zip: punkduck_french_lingerie_stockings (catalogue CC-BY, files CC BY 3.0)
- underwear02_cc0.zip: punkduck_french_lingerie_suspender_belt (catalogue CC-BY, files CC BY 3.0)
- underwear02_cc0.zip: punkduck_french_lingerie_thong (catalogue CC-BY, files CC BY 3.0)
- underwear02_cc0.zip: punkduck_frill_bikini_bottom (catalogue CC-BY, files CC BY 4.0)
- underwear02_cc0.zip: punkduck_frill_bikini_top (catalogue CC-BY, files CC BY 4.0)
- underwear02_cc0.zip: punkduck_sport_bra (catalogue CC-BY, files CC BY 3.0)
- underwear02_cc0.zip: punkduck_sport_briefs (catalogue CC-BY, files CC BY 3.0)
- underwear02_cc0.zip: punkduck_string_2 (catalogue CC-BY, files CC BY 3.0 (see also https://creativecommons.org/licenses/by/3.0/ ))
- underwear02_cc0.zip: punkduck_string_5 (catalogue CC-BY, files CC BY 3.0)
- underwear02_cc0.zip: punkduck_teddy_erotic_lingerie (catalogue CC-BY, files CC BY 3.0)
- underwear02_cc0.zip: punkduck_transparent_bra (catalogue CC-BY, files CC BY 3.0 (see also https://creativecommons.org/licenses/by/3.0/ ))

## Other (4)

- hair01_cc0.zip: elvs_reverse_french_braid_bun (catalogue CC0, files CC_by)
- hair01_cc0.zip: o4saken_long01 (catalogue CC0, files CC BY 4.0)
- jewelry01_cc0.zip: punkduck_lace-choker (catalogue CC0, files CC BY 3.0)
- underwear01_cc0.zip: punkduck_strappy_lace_thong (catalogue CC0, files CC BY 4.0)

## Every item (CC-BY items need the author credited)

| Pack | Item | Type | Licence | Files say | Author | Source |
| --- | --- | --- | --- | --- | --- | --- |
| animal01_cc0.zip | culturalibre_faun_face | target | CC0 |  | culturalibre | http://www.makehumancommunity.org/node/2357 |
| animal01_cc0.zip | elvs_piggy_nose1 | target | CC0 |  | Elvaerwyn | http://www.makehumancommunity.org/node/2372 |
| animal01_cc0.zip | jaldmic_donkey_head | target | CC0 |  | JALdMIC | http://www.makehumancommunity.org/node/3535 |
| animal01_cc0.zip | jaldmic_equinus_headv2 | target | CC0 |  | JALdMIC | http://www.makehumancommunity.org/node/2952 |
| animal01_cc0.zip | titleknown_catgirl_ears | target | CC0 |  | titleknown | http://www.makehumancommunity.org/node/1153 |
| animal02_ccby.zip | jaldmic_bunny_rabbit_ears_v2 | target | CC-BY |  | JALdMIC | http://www.makehumancommunity.org/node/2923 |
| animal02_ccby.zip | jaldmic_canine_ears_v2 | target | CC-BY |  | JALdMIC | http://www.makehumancommunity.org/node/2926 |
| animal02_ccby.zip | jaldmic_dropped_ears | target | CC-BY |  | JALdMIC | http://www.makehumancommunity.org/node/3127 |
| animal02_ccby.zip | jaldmic_feline_ears_v2 | target | CC-BY |  | JALdMIC | http://www.makehumancommunity.org/node/2928 |
| animal02_ccby.zip | jaldmic_furry_mouth_feline_v4 | target | CC-BY |  | JALdMIC | http://www.makehumancommunity.org/node/2929 |
| animal02_ccby.zip | jaldmic_furry_mouth_reptile | target | CC-BY |  | JALdMIC | http://www.makehumancommunity.org/node/2931 |
| animal02_ccby.zip | jaldmic_furrymouth_canine_v4 | target | CC-BY |  | JALdMIC | http://www.makehumancommunity.org/node/2927 |
| animal02_ccby.zip | jaldmic_shark_mouth | target | CC-BY |  | JALdMIC | http://www.makehumancommunity.org/node/3131 |
| animal03_ccby.zip | jaldmic_bear_head | target | CC-BY |  | JALdMIC | http://www.makehumancommunity.org/node/3487 |
| animal03_ccby.zip | jaldmic_bear_head_cartoon | target | CC-BY |  | JALdMIC | http://www.makehumancommunity.org/node/3486 |
| animal03_ccby.zip | jaldmic_care_bear_head | target | CC-BY |  | JALdMIC | http://www.makehumancommunity.org/node/3183 |
| animal03_ccby.zip | jaldmic_cat_head | target | CC-BY |  | JALdMIC | http://www.makehumancommunity.org/node/3144 |
| animal03_ccby.zip | jaldmic_fox_head_cartoon | target | CC-BY |  | JALdMIC | http://www.makehumancommunity.org/node/3488 |
| animal03_ccby.zip | jaldmic_hazel_rabbit_head | target | CC-BY |  | JALdMIC | http://www.makehumancommunity.org/node/3489 |
| animal03_ccby.zip | jaldmic_lion | target | CC-BY |  | JALdMIC | http://www.makehumancommunity.org/node/3200 |
| animal03_ccby.zip | jaldmic_mirage_head | target | CC-BY |  | JALdMIC | http://www.makehumancommunity.org/node/3342 |
| animal03_ccby.zip | jaldmic_perro_dog_head | target | CC-BY |  | JALdMIC | http://www.makehumancommunity.org/node/3540 |
| animal03_ccby.zip | jaldmic_pikachu_head | target | CC-BY |  | JALdMIC | http://www.makehumancommunity.org/node/3076 |
| animal03_ccby.zip | jaldmic_rabbit_hare_head | target | CC-BY |  | JALdMIC | http://www.makehumancommunity.org/node/3152 |
| animal03_ccby.zip | jaldmic_squirrel_head | target | CC-BY |  | JALdMIC | http://www.makehumancommunity.org/node/3209 |
| animal03_ccby.zip | jaldmic_tiger_head | target | CC-BY |  | JALdMIC | http://www.makehumancommunity.org/node/3221 |
| animal03_ccby.zip | jaldmic_vaca_cow_head | target | CC-BY |  | JALdMIC | http://www.makehumancommunity.org/node/3544 |
| animal03_ccby.zip | jaldmic_vulpix_head | target | CC-BY |  | JALdMIC | http://www.makehumancommunity.org/node/3007 |
| animal03_ccby.zip | jaldmic_wolf_headv3 | target | CC-BY |  | JALdMIC | http://www.makehumancommunity.org/node/3009 |
| animal04_ccby.zip | jaldmic_care_bear_body_experiment | target | CC-BY |  | JALdMIC | http://www.makehumancommunity.org/node/3194 |
| animal04_ccby.zip | jaldmic_donkey | target | CC-BY |  | JALdMIC | http://www.makehumancommunity.org/node/3534 |
| animal04_ccby.zip | jaldmic_horse | target | CC-BY |  | JALdMIC | http://www.makehumancommunity.org/node/3533 |
| animal04_ccby.zip | jaldmic_perro_dog | target | CC-BY |  | JALdMIC | http://www.makehumancommunity.org/node/3539 |
| animal04_ccby.zip | jaldmic_vaca_cow | target | CC-BY |  | JALdMIC | http://www.makehumancommunity.org/node/3543 |
| arms01_cc0.zip | elvs_ladies_elbow_dimples | target | CC0 |  | Elvaerwyn | http://www.makehumancommunity.org/node/3049 |
| arms01_cc0.zip | mindfront_arm_lower_shape | target | CC0 |  | Mindfront | http://www.makehumancommunity.org/node/1582 |
| arms01_cc0.zip | mindfront_arm_upper_shape | target | CC0 |  | Mindfront | http://www.makehumancommunity.org/node/1583 |
| arms01_cc0.zip | mindfront_arm_wrist_ulna | target | CC0 |  | Mindfront | http://www.makehumancommunity.org/node/1584 |
| arms01_cc0.zip | mindfront_armpit | target | CC0 |  | Mindfront | http://www.makehumancommunity.org/node/1585 |
| bodyparts01_cc0.zip | culturalibre_faun_horns | clothes | CC0 | CC-0 | culturalibre | http://www.makehumancommunity.org/node/2355 |
| bodyparts01_cc0.zip | culturalibre_minotaur_horns | clothes | CC0 | CC-0 | culturalibre | http://www.makehumancommunity.org/node/2352 |
| bodyparts01_cc0.zip | freezychan_lucoa_quetzalcoatl_horns | clothes | CC0 | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | FreezyChan | http://www.makehumancommunity.org/node/1564 |
| bodyparts01_cc0.zip | jaldmic_houndoom_horns | clothes | CC0 | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | JALdMIC | http://www.makehumancommunity.org/node/2995 |
| bodyparts02_cc-by.zip | elvs_deer_antlers_1 | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2376 |
| bodyparts02_cc-by.zip | elvs_gazelle_horns_1 | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2388 |
| bodyparts02_cc-by.zip | elvs_gazelle_horns_2 | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2389 |
| bodyparts02_cc-by.zip | elvs_longhorn_steer_horns_1 | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2379 |
| bodyparts02_cc-by.zip | elvs_moose_antlers_1 | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2375 |
| bodyparts02_cc-by.zip | elvs_unicorn_horn_1 | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2385 |
| bodyparts02_cc-by.zip | jaldmic_demon_horns | clothes | CC-BY | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | JALdMIC | http://www.makehumancommunity.org/node/2947 |
| bodyparts02_cc-by.zip | jaldmic_toriel_horns | clothes | CC-BY | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | JALdMIC | http://www.makehumancommunity.org/node/2935 |
| bodyparts03_cc-by.zip | culturalibre_cl_devil_tail | clothes | CC-BY | CC-BY | culturalibre | http://www.makehumancommunity.org/node/3248 |
| bodyparts03_cc-by.zip | culturalibre_tigra_tail | clothes | CC-BY | CC-BY | culturalibre | http://www.makehumancommunity.org/node/3265 |
| bodyparts03_cc-by.zip | elvs_cat_tail_as_clothes_1 | clothes | CC-BY | CC-by | Elvaerwyn | http://www.makehumancommunity.org/node/1269 |
| bodyparts03_cc-by.zip | elvs_childrens_costume_wings1 | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1468 |
| bodyparts03_cc-by.zip | elvs_dual_fanned_wings_collaberation | clothes | CC-BY | CC BY 4.0 | Elvaerwyn | http://www.makehumancommunity.org/node/1514 |
| bodyparts03_cc-by.zip | elvs_fluffy_tail_as_clothes_1 | clothes | CC-BY | CC-By | Elvaerwyn | http://www.makehumancommunity.org/node/1193 |
| bodyparts03_cc-by.zip | elvs_static_wings1_dragonfly | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1489 |
| bodyparts03_cc-by.zip | elvs_static_wings2_dragon1 | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1490 |
| bodyparts03_cc-by.zip | elvs_static_wings3_butterfly1 | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1491 |
| bodyparts03_cc-by.zip | elvs_static_wings4_bone_wings1 | clothes | CC-BY | Cc_by | Elvaerwyn | http://www.makehumancommunity.org/node/1493 |
| bodyparts03_cc-by.zip | elvs_static_wings5_fairy_moth1 | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1628 |
| bodyparts04_cc0.zip | grinsegold_fingernails_female_natural | clothes | CC0 | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | grinsegold | http://www.makehumancommunity.org/node/195 |
| bodyparts04_cc0.zip | mindfront_nails_01_short | clothes | CC0 | CC0 | Mindfront | http://www.makehumancommunity.org/node/1368 |
| bodyparts04_cc0.zip | mindfront_nails_02_medium | clothes | CC0 | CC0 | Mindfront | http://www.makehumancommunity.org/node/1369 |
| bodyparts04_cc0.zip | mindfront_nails_03_long | clothes | CC0 | CC0 | Mindfront | http://www.makehumancommunity.org/node/1370 |
| bodyparts04_cc0.zip | mindfront_nails_toes_01 | clothes | CC0 | CC0 | Mindfront | http://www.makehumancommunity.org/node/1371 |
| bodyparts04_cc0.zip | toigo_long_fingernails_blue_butterfly | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/976 |
| bodyparts04_cc0.zip | wolgade_female_fingernails | clothes | CC0 | CC0 | wolgade | http://www.makehumancommunity.org/node/70 |
| bodyparts05_cc0.zip | culturalibre_faun_beard | clothes | CC0 | CC-0 | culturalibre | http://www.makehumancommunity.org/node/2356 |
| bodyparts05_cc0.zip | grinsegold_beard_sigmund_wip | clothes | CC0 | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | grinsegold | http://www.makehumancommunity.org/node/877 |
| bodyparts05_cc0.zip | rehmanpolanski_beard_viking | clothes | CC0 | CC0 | RehmanPolanski | http://www.makehumancommunity.org/node/2614 |
| bodyparts05_cc0.zip | rehmanpolanski_moustache_viking | clothes | CC0 | CC0 | RehmanPolanski | http://www.makehumancommunity.org/node/2615 |
| bodyparts05_cc0.zip | wdg_scruffy_beard | clothes | CC0 | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | WDG | http://www.makehumancommunity.org/node/1769 |
| bodyparts06_cc-by.zip | culturalibre_dal_moustache | clothes | CC-BY | CC-BY | culturalibre | http://www.makehumancommunity.org/node/2872 |
| bodyparts06_cc-by.zip | elvs_scruffy_beard1 | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2611 |
| bodyparts06_cc-by.zip | grinsegold_full_beard | clothes | CC-BY | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | grinsegold | http://www.makehumancommunity.org/node/188 |
| bodyparts06_cc-by.zip | grinsegold_moustache | clothes | CC-BY | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | grinsegold | http://www.makehumancommunity.org/node/187 |
| cheek01_cc0.zip | elvs_chipmunk_cheeks_high_1 | target | CC0 |  | Elvaerwyn | http://www.makehumancommunity.org/node/2243 |
| cheek01_cc0.zip | elvs_chipmunk_cheeks_low_1 | target | CC0 |  | Elvaerwyn | http://www.makehumancommunity.org/node/2244 |
| cheek01_cc0.zip | elvs_high_chubby_cheekbones_1 | target | CC0 |  | Elvaerwyn | http://www.makehumancommunity.org/node/2253 |
| cheek01_cc0.zip | elvs_jowls_1 | target | CC0 |  | Elvaerwyn | http://www.makehumancommunity.org/node/2254 |
| cheek01_cc0.zip | elvs_sunken_cheeks_1 | target | CC0 |  | Elvaerwyn | http://www.makehumancommunity.org/node/2259 |
| dress01_cc0.zip | aethelraed_flapper_dress | clothes | CC0 | CC0 | Aethelraed_Unraed | http://www.makehumancommunity.org/node/581 |
| dress01_cc0.zip | mindfront_kimono | clothes | CC0 | CC0 | Mindfront | http://www.makehumancommunity.org/node/3171 |
| dress01_cc0.zip | toigo_bodice_dress_with_lace_ruffle_skirt | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1706 |
| dress01_cc0.zip | toigo_camisole_dress_with_full_skirt | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1730 |
| dress01_cc0.zip | toigo_cut_out_dress | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1704 |
| dress01_cc0.zip | toigo_dress_with_tiered_skirt | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1640 |
| dress01_cc0.zip | toigo_halter_dress_knee_length | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1853 |
| dress01_cc0.zip | toigo_halter_dress_midi | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1854 |
| dress01_cc0.zip | toigo_halter_dress_with_fluted_skirt | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1855 |
| dress01_cc0.zip | toigo_keyhole_neck_dress | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1613 |
| dress01_cc0.zip | toigo_shift_dress | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1724 |
| dress01_cc0.zip | toigo_strapless_ruffle_top_dress | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1705 |
| dress01_cc0.zip | wdg_mycenaean_tunic | clothes | CC0 | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | WDG | http://www.makehumancommunity.org/node/1763 |
| dress02_cc-by.zip | elvs_crochet_baby_doll | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1719 |
| dress02_cc-by.zip | elvs_double_handkerchief_halter_dress | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1920 |
| dress02_cc-by.zip | elvs_fashion_stylized_qipoa | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1526 |
| dress02_cc-by.zip | elvs_frilled_party_dress | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1559 |
| dress02_cc-by.zip | elvs_fringe_hippy_dress | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2394 |
| dress02_cc-by.zip | elvs_fringe_leather_dress | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2392 |
| dress02_cc-by.zip | elvs_fringe_off_shoulder_dress | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2395 |
| dress02_cc-by.zip | elvs_goddess_dress1 | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2558 |
| dress02_cc-by.zip | elvs_goddess_dress2 | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2559 |
| dress02_cc-by.zip | elvs_goddess_dress3 | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2560 |
| dress02_cc-by.zip | elvs_goddess_dress4 | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2561 |
| dress02_cc-by.zip | elvs_goddess_dress5 | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2562 |
| dress02_cc-by.zip | elvs_goddess_dress6 | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2563 |
| dress02_cc-by.zip | elvs_goddess_dress7 | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2564 |
| dress02_cc-by.zip | elvs_goddess_dress8 | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2575 |
| dress02_cc-by.zip | elvs_halter_dress_knee_length | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1922 |
| dress02_cc-by.zip | elvs_halter_dress_long | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1923 |
| dress02_cc-by.zip | elvs_halter_dress_mini | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1921 |
| dress02_cc-by.zip | elvs_halter_dress_tiered | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1919 |
| dress02_cc-by.zip | elvs_ladies_apron | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1446 |
| dress02_cc-by.zip | elvs_sarong_cover_up | clothes | CC-BY | CC-by | Elvaerwyn | http://www.makehumancommunity.org/node/1494 |
| dress02_cc-by.zip | elvs_simple_60s_dress | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1515 |
| dress02_cc-by.zip | elvs_simple_fashion_dress_1 | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1516 |
| dress02_cc-by.zip | elvs_simple_fashion_dress_2 | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1517 |
| dress03_cc-by.zip | mindfront_ballet_dress_the_swan | clothes | CC-BY | CC BY 4.0 | Mindfront | http://www.makehumancommunity.org/node/565 |
| dress03_cc-by.zip | mindfront_f_dress_01 | clothes | CC-BY | CC BY 4.0 | Mindfront | http://www.makehumancommunity.org/node/343 |
| dress03_cc-by.zip | mindfront_f_dress_02 | clothes | CC-BY | CC BY 4.0 | Mindfront | http://www.makehumancommunity.org/node/346 |
| dress03_cc-by.zip | mindfront_f_dress_03 | clothes | CC-BY | CC BY 4.0 | Mindfront | http://www.makehumancommunity.org/node/354 |
| dress03_cc-by.zip | mindfront_f_dress_04 | clothes | CC-BY | CC BY 4.0 | Mindfront | http://www.makehumancommunity.org/node/386 |
| dress03_cc-by.zip | mindfront_f_dress_05 | clothes | CC-BY | CC BY 4.0 | Mindfront | http://www.makehumancommunity.org/node/1234 |
| dress03_cc-by.zip | mindfront_f_dress_06 | clothes | CC-BY | CC BY 4.0 | Mindfront | http://www.makehumancommunity.org/node/1236 |
| dress03_cc-by.zip | mindfront_f_dress_07 | clothes | CC-BY | CC BY 4.0 | Mindfront | http://www.makehumancommunity.org/node/1277 |
| dress03_cc-by.zip | mindfront_f_dress_08 | clothes | CC-BY | CC BY 4.0 | Mindfront | http://www.makehumancommunity.org/node/1422 |
| dress03_cc-by.zip | mindfront_f_dress_09 | clothes | CC-BY | CC BY 4.0 | Mindfront | http://www.makehumancommunity.org/node/1424 |
| dress03_cc-by.zip | mindfront_f_dress_10 | clothes | CC-BY | CC BY 4.0 | Mindfront | http://www.makehumancommunity.org/node/1426 |
| dress03_cc-by.zip | mindfront_f_dress_11 | clothes | CC-BY | CC BY 4.0 | Mindfront | http://www.makehumancommunity.org/node/1703 |
| dress03_cc-by.zip | punkduck_black_cocktail_dress | clothes | CC-BY | CC-BY 3.0 | punkduck | http://www.makehumancommunity.org/node/379 |
| dress03_cc-by.zip | punkduck_evening_gown | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/806 |
| dress03_cc-by.zip | punkduck_figure_skating_dress | clothes | CC-BY | CC BY 4.0 | punkduck | http://www.makehumancommunity.org/node/1159 |
| dress03_cc-by.zip | punkduck_medieval_dress | clothes | CC-BY | CC BY 4.0 | punkduck | http://www.makehumancommunity.org/node/1379 |
| dress03_cc-by.zip | punkduck_middle_length_qipao | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/857 |
| dress03_cc-by.zip | punkduck_tube_dress | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/411 |
| dress03_cc-by.zip | punkduck_winter_coat | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/443 |
| ears01_cc0.zip | elvs_ear_flap_bottom_out | target | CC0 |  | Elvaerwyn | http://www.makehumancommunity.org/node/2782 |
| ears01_cc0.zip | elvs_flap_ears_1 | target | CC0 |  | Elvaerwyn | http://www.makehumancommunity.org/node/2779 |
| ears01_cc0.zip | elvs_flap_ears_2 | target | CC0 |  | Elvaerwyn | http://www.makehumancommunity.org/node/2780 |
| ears01_cc0.zip | elvs_flap_ears_3 | target | CC0 |  | Elvaerwyn | http://www.makehumancommunity.org/node/2781 |
| ears01_cc0.zip | jujube_ear_canal | target | CC0 |  | jujube | http://www.makehumancommunity.org/node/612 |
| ears01_cc0.zip | mindfront_ear_details | target | CC0 |  | Mindfront | http://www.makehumancommunity.org/node/1588 |
| ears01_cc0.zip | mindfront_ear_in | target | CC0 |  | Mindfront | http://www.makehumancommunity.org/node/1589 |
| ears01_cc0.zip | rehmanpolanski_ear_flatten | target | CC0 |  | RehmanPolanski | http://www.makehumancommunity.org/node/2624 |
| equipment01_cc0.zip | culturalibre_hand_claws | clothes | CC0 | CC-0 | culturalibre | http://www.makehumancommunity.org/node/2840 |
| equipment01_cc0.zip | culturalibre_hero_kalistick | clothes | CC0 | CC-0 | culturalibre | http://www.makehumancommunity.org/node/2119 |
| equipment01_cc0.zip | culturalibre_hero_kalistick_lefthanded | clothes | CC0 | CC-0 | culturalibre | http://www.makehumancommunity.org/node/2120 |
| equipment01_cc0.zip | culturalibre_magic_sceptre | clothes | CC0 | CC-0 | culturalibre | http://www.makehumancommunity.org/node/2358 |
| equipment01_cc0.zip | culturalibre_war_hammer | clothes | CC0 | CC-0 | culturalibre | http://www.makehumancommunity.org/node/2051 |
| equipment01_cc0.zip | culturalibre_wooden_bow | clothes | CC0 | CC-0 | culturalibre | http://www.makehumancommunity.org/node/2362 |
| equipment01_cc0.zip | joepal_crude_sword | clothes | CC0 | CC0 | Joel Palmius | http://www.makehumancommunity.org/node/428 |
| equipment01_cc0.zip | o4saken_dagger | clothes | CC0 | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | o4saken | http://www.makehumancommunity.org/node/809 |
| equipment02_cc-by.zip | culturalibre_cl_gun | clothes | CC-BY | CC-BY | culturalibre | http://www.makehumancommunity.org/node/2383 |
| equipment02_cc-by.zip | culturalibre_cl_gun_left_hand | clothes | CC-BY | CC-BY | culturalibre | http://www.makehumancommunity.org/node/3030 |
| equipment02_cc-by.zip | jaldmic_akm_base | clothes | CC-BY | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | JALdMIC | http://www.makehumancommunity.org/node/2921 |
| equipment02_cc-by.zip | jaldmic_l1a1 | clothes | CC-BY | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | JALdMIC | http://www.makehumancommunity.org/node/2986 |
| equipment02_cc-by.zip | jaldmic_m1911a1 | clothes | CC-BY | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | JALdMIC | http://www.makehumancommunity.org/node/3004 |
| equipment02_cc-by.zip | maciekg_hammer | clothes | CC-BY | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | MaciekG | http://www.makehumancommunity.org/node/1488 |
| equipment02_cc-by.zip | maciekg_short_bow | clothes | CC-BY | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | MaciekG | http://www.makehumancommunity.org/node/1465 |
| equipment02_cc-by.zip | punkduck_p-ivy_weapon | clothes | CC-BY | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | punkduck | http://www.makehumancommunity.org/node/820 |
| equipment03_cc-by.zip | culturalibre_suitcase | clothes | CC-BY | CC-BY | culturalibre | http://www.makehumancommunity.org/node/2550 |
| equipment03_cc-by.zip | elvs_sling_purse1 | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1459 |
| equipment03_cc-by.zip | mindfront_tactical_vest_female | clothes | CC-BY | CC BY 4.0 | Mindfront | http://www.makehumancommunity.org/node/847 |
| equipment03_cc-by.zip | mindfront_tactical_vest_male | clothes | CC-BY | CC BY 4.0 | Mindfront | http://www.makehumancommunity.org/node/848 |
| equipment03_cc-by.zip | punkduck_diver_scuba_rig | clothes | CC-BY |  | punkduck | http://www.makehumancommunity.org/node/1275 |
| equipment03_cc-by.zip | punkduck_electric_guitar | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/525 |
| equipment03_cc-by.zip | punkduck_handbag01 | clothes | CC-BY | CC BY 4.0 | punkduck | http://www.makehumancommunity.org/node/959 |
| equipment03_cc-by.zip | punkduck_head_mirror | clothes | CC-BY |  | punkduck | http://www.makehumancommunity.org/node/2035 |
| equipment03_cc-by.zip | punkduck_microphone | clothes | CC-BY | CC BY 4.0 | punkduck | http://www.makehumancommunity.org/node/972 |
| equipment03_cc-by.zip | punkduck_shopping_bag01 | clothes | CC-BY | CC BY 4.0 | punkduck | http://www.makehumancommunity.org/node/967 |
| equipment03_cc-by.zip | punkduck_stethoscope | clothes | CC-BY |  | punkduck | http://www.makehumancommunity.org/node/2036 |
| equipment03_cc-by.zip | punkduck_tennis_racket | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/750 |
| equipment03_cc-by.zip | punkduck_wireless_headset | clothes | CC-BY | CC BY 4.0 | punkduck | http://www.makehumancommunity.org/node/1428 |
| eyebrows01_cc0.zip | mindfront_eyebrows_01 | clothes | CC0 | CC0 | Mindfront | http://www.makehumancommunity.org/node/1964 |
| eyebrows01_cc0.zip | mindfront_eyebrows_02 | clothes | CC0 | CC0 | Mindfront | http://www.makehumancommunity.org/node/1965 |
| eyebrows01_cc0.zip | mindfront_eyebrows_03 | clothes | CC0 | CC0 | Mindfront | http://www.makehumancommunity.org/node/1966 |
| eyebrows01_cc0.zip | mindfront_eyebrows_04 | clothes | CC0 | CC0 | Mindfront | http://www.makehumancommunity.org/node/1967 |
| eyebrows01_cc0.zip | mindfront_eyebrows_05 | clothes | CC0 | CC0 | Mindfront | http://www.makehumancommunity.org/node/1968 |
| eyebrows01_cc0.zip | mindfront_eyebrows_06 | clothes | CC0 | CC0 | Mindfront | http://www.makehumancommunity.org/node/1969 |
| eyebrows01_cc0.zip | mindfront_eyebrows_07 | clothes | CC0 | CC0 | Mindfront | http://www.makehumancommunity.org/node/1970 |
| eyebrows01_cc0.zip | mindfront_eyebrows_08 | clothes | CC0 | CC0 | Mindfront | http://www.makehumancommunity.org/node/1971 |
| eyebrows01_cc0.zip | mindfront_eyebrows_09 | clothes | CC0 | CC0 | Mindfront | http://www.makehumancommunity.org/node/1972 |
| eyebrows01_cc0.zip | mindfront_eyebrows_10 | clothes | CC0 | CC0 | Mindfront | http://www.makehumancommunity.org/node/1973 |
| eyebrows01_cc0.zip | mindfront_eyebrows_11 | clothes | CC0 | CC0 | Mindfront | http://www.makehumancommunity.org/node/1974 |
| eyebrows01_cc0.zip | mindfront_eyebrows_12 | clothes | CC0 | CC0 | Mindfront | http://www.makehumancommunity.org/node/1975 |
| eyebrows01_cc0.zip | mindfront_eyebrows_13 | clothes | CC0 | CC0 | Mindfront | http://www.makehumancommunity.org/node/1976 |
| eyebrows01_cc0.zip | mindfront_eyebrows_14 | clothes | CC0 | CC0 | Mindfront | http://www.makehumancommunity.org/node/1977 |
| eyelashes01_cc0.zip | mindfront_eyelashes_01 | clothes | CC0 | CC0 | Mindfront | http://www.makehumancommunity.org/node/1978 |
| eyelashes01_cc0.zip | mindfront_eyelashes_02 | clothes | CC0 | CC0 | Mindfront | http://www.makehumancommunity.org/node/1979 |
| eyelashes01_cc0.zip | mindfront_eyelashes_03 | clothes | CC0 | CC0 | Mindfront | http://www.makehumancommunity.org/node/1980 |
| eyelashes01_cc0.zip | mindfront_eyelashes_04 | clothes | CC0 | CC0 | Mindfront | http://www.makehumancommunity.org/node/1981 |
| eyelashes01_cc0.zip | mindfront_eyelashes_05 | clothes | CC0 | CC0 | Mindfront | http://www.makehumancommunity.org/node/1982 |
| glasses01_cc0.zip | culturalibre_doc_ock_glasses | clothes | CC0 | CC-0 | culturalibre | http://www.makehumancommunity.org/node/2378 |
| glasses01_cc0.zip | ews_3d_glasses | clothes | CC0 | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | EWS | http://www.makehumancommunity.org/node/1233 |
| glasses01_cc0.zip | frankyaye_glasses_library_male | clothes | CC0 | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | frankyaye | http://www.makehumancommunity.org/node/153 |
| glasses01_cc0.zip | kwnet_at_optical_glasses | clothes | CC0 | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | kwnet_at | http://www.makehumancommunity.org/node/928 |
| glasses01_cc0.zip | spamrakuen_sagerfrogs_glasses_01 | clothes | CC0 |  | spamrakuen | http://www.makehumancommunity.org/node/3331 |
| glasses01_cc0.zip | spamrakuen_sagerfrogs_glasses_02 | clothes | CC0 |  | spamrakuen | http://www.makehumancommunity.org/node/3332 |
| glasses01_cc0.zip | spamrakuen_sagerfrogs_glasses_03 | clothes | CC0 |  | spamrakuen | http://www.makehumancommunity.org/node/3333 |
| glasses01_cc0.zip | spamrakuen_sagerfrogs_glasses_04 | clothes | CC0 |  | spamrakuen | http://www.makehumancommunity.org/node/3334 |
| glasses01_cc0.zip | spamrakuen_tbm_glasses_frames_01 | clothes | CC0 |  | spamrakuen | http://www.makehumancommunity.org/node/3330 |
| glasses01_cc0.zip | toigo_round_glasses_leopard | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1070 |
| glasses02_ccby.zip | elvs_covid_goggles1 | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2533 |
| glasses02_ccby.zip | elvs_ladies_sunglass1 | clothes | CC-BY | CC-by | Elvaerwyn | http://www.makehumancommunity.org/node/1414 |
| glasses02_ccby.zip | punkduck_glasses_modern_form | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/427 |
| glasses02_ccby.zip | punkduck_goggles | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/664 |
| glasses02_ccby.zip | punkduck_sport-sunglasses | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/695 |
| gloves01_cc0.zip | culturalibre_hero-heroine_gloves_1 | clothes | CC0 | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | culturalibre | http://www.makehumancommunity.org/node/2074 |
| gloves01_cc0.zip | culturalibre_hero-heroine_gloves_2 | clothes | CC0 | CC-0 | culturalibre | http://www.makehumancommunity.org/node/2093 |
| gloves01_cc0.zip | culturalibre_hero-heroine_gloves_3 | clothes | CC0 | CC-0 | culturalibre | http://www.makehumancommunity.org/node/2193 |
| gloves01_cc0.zip | culturalibre_hero-heroine_gloves_4 | clothes | CC0 | CC-0 | culturalibre | http://www.makehumancommunity.org/node/2333 |
| gloves01_cc0.zip | culturalibre_hero-heroine_gloves_5 | clothes | CC0 | CC-0 | culturalibre | http://www.makehumancommunity.org/node/2401 |
| gloves01_cc0.zip | learning_mma_fighting_gloves | clothes | CC0 | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | learning | http://www.makehumancommunity.org/node/95 |
| gloves01_cc0.zip | toigo_gloves_long | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1850 |
| gloves01_cc0.zip | toigo_gloves_medium | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1851 |
| gloves01_cc0.zip | toigo_gloves_short | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1852 |
| hair01_cc0.zip | cortu_shaggy_green_hair | clothes | CC0 |  | Cortu | http://www.makehumancommunity.org/node/2811 |
| hair01_cc0.zip | cortu_short_messy_hair | clothes | CC0 |  | Cortu | http://www.makehumancommunity.org/node/2809 |
| hair01_cc0.zip | cortu_straight_bangs | clothes | CC0 |  | Cortu | http://www.makehumancommunity.org/node/2810 |
| hair01_cc0.zip | cortu_strawberry_cloud_hair | clothes | CC0 |  | Cortu | http://www.makehumancommunity.org/node/2808 |
| hair01_cc0.zip | culturalibre_hair_01 | clothes | CC0 | AGPL3 (see also http://www.makehuman.org/node/320) | culturalibre | http://www.makehumancommunity.org/node/2893 |
| hair01_cc0.zip | culturalibre_hair_02 | clothes | CC0 | AGPL3 (see also http://www.makehuman.org/node/320) | culturalibre | http://www.makehumancommunity.org/node/2892 |
| hair01_cc0.zip | culturalibre_hair_05 | clothes | CC0 | CC-0 | culturalibre | http://www.makehumancommunity.org/node/2445 |
| hair01_cc0.zip | culturalibre_hair_06 | clothes | CC0 | CC-0 | culturalibre | http://www.makehumancommunity.org/node/2479 |
| hair01_cc0.zip | elvs_double_mh_braid | clothes | CC0 | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | Elvaerwyn | http://www.makehumancommunity.org/node/1336 |
| hair01_cc0.zip | elvs_french_braid_variation | clothes | CC0 | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | Elvaerwyn | http://www.makehumancommunity.org/node/1335 |
| hair01_cc0.zip | elvs_reverse_french_braid_bun | clothes | CC0 | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1337 |
| hair01_cc0.zip | elvs_unkempt_french_braid | clothes | CC0 | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | Elvaerwyn | http://www.makehumancommunity.org/node/1334 |
| hair01_cc0.zip | faydaen_hair_1 | clothes | CC0 |  | Faydaen | http://www.makehumancommunity.org/node/2667 |
| hair01_cc0.zip | learning_anime_hair | clothes | CC0 | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | learning | http://www.makehumancommunity.org/node/253 |
| hair01_cc0.zip | littleright_bobcut_hair | clothes | CC0 | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | littleright | http://www.makehumancommunity.org/node/936 |
| hair01_cc0.zip | o4saken_long01 | clothes | CC0 | CC BY 4.0 | punkduck | http://www.makehumancommunity.org/node/1471 |
| hair01_cc0.zip | rehmanpolanski_hair_bun_brown | clothes | CC0 | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | RehmanPolanski | http://www.makehumancommunity.org/node/2477 |
| hair01_cc0.zip | sonntag78_blond_with_headband | clothes | CC0 | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | sonntag78 | http://www.makehumancommunity.org/node/207 |
| hair01_cc0.zip | sonntag78_junglebook_hair | clothes | CC0 | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | sonntag78 | http://www.makehumancommunity.org/node/174 |
| hair01_cc0.zip | toigo_blunt_bob | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1669 |
| hair01_cc0.zip | toigo_blunt_bob_with_bangs | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1681 |
| hair01_cc0.zip | toigo_curled_under_bob | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1677 |
| hair01_cc0.zip | toigo_curled_under_bob_with_bangs | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1689 |
| hair01_cc0.zip | toigo_inverted_bob | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1673 |
| hair01_cc0.zip | toigo_inverted_bob_with_bangs | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1685 |
| hair02_ccby.zip | elvs_50s_updo | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/2001 |
| hair02_ccby.zip | elvs_adrienne_hair | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1862 |
| hair02_ccby.zip | elvs_ashley_may_hair | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1861 |
| hair02_ccby.zip | elvs_braid_bun | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2177 |
| hair02_ccby.zip | elvs_braided_rows | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1659 |
| hair02_ccby.zip | elvs_daisy_hair | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1859 |
| hair02_ccby.zip | elvs_grump_hair | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2796 |
| hair02_ccby.zip | elvs_hazel_hair | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2816 |
| hair02_ccby.zip | elvs_inverted_curly_bob | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2683 |
| hair02_ccby.zip | elvs_island_princess_hair | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1811 |
| hair02_ccby.zip | elvs_katherine_hair | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1863 |
| hair02_ccby.zip | elvs_keylth_hair | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2173 |
| hair02_ccby.zip | elvs_lady_hippy_hair | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1812 |
| hair02_ccby.zip | elvs_lara_hair | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2634 |
| hair02_ccby.zip | elvs_maxwell_hair | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1639 |
| hair02_ccby.zip | elvs_micky_afro | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2817 |
| hair02_ccby.zip | elvs_short_daisy_hair | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1860 |
| hair02_ccby.zip | elvs_short_side_do | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1479 |
| hair02_ccby.zip | elvs_that_80s_babe_hair | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2174 |
| hair02_ccby.zip | elvs_wavy_bob | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1551 |
| hair02_ccby.zip | elvs_witchy_lil_bob | clothes | CC-BY | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | Elvaerwyn | http://www.makehumancommunity.org/node/1710 |
| hair03_ccby.zip | culturalibre_hair_11 | clothes | CC-BY | cc-by | culturalibre | http://www.makehumancommunity.org/node/2027 |
| hair03_ccby.zip | culturalibre_hair_12 | clothes | CC-BY |  | culturalibre | http://www.makehumancommunity.org/node/2043 |
| hair03_ccby.zip | culturalibre_hair_13 | clothes | CC-BY | CC-by | culturalibre | http://www.makehumancommunity.org/node/2421 |
| hair03_ccby.zip | culturalibre_hair_14 | clothes | CC-BY | CC-by | culturalibre | http://www.makehumancommunity.org/node/2428 |
| hair03_ccby.zip | culturalibre_hair_17 | clothes | CC-BY | CC-BY | culturalibre | http://www.makehumancommunity.org/node/2481 |
| hair03_ccby.zip | culturalibre_hair_18 | clothes | CC-BY | CC-BY | culturalibre | http://www.makehumancommunity.org/node/2482 |
| hair03_ccby.zip | grinsegold_wig_bow_tie | clothes | CC-BY | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | grinsegold | http://www.makehumancommunity.org/node/173 |
| hair03_ccby.zip | grinsegold_wig_bun_blonde_braids | clothes | CC-BY | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | grinsegold | http://www.makehumancommunity.org/node/172 |
| hair03_ccby.zip | o4saken_chinesebob01 | clothes | CC-BY | CC BY 4.0 | punkduck | http://www.makehumancommunity.org/node/1474 |
| hair03_ccby.zip | o4saken_curly01 | clothes | CC-BY | CC BY 4.0 | punkduck | http://www.makehumancommunity.org/node/1466 |
| hair03_ccby.zip | punkduck_alpha7_curly | clothes | CC-BY | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | punkduck | http://www.makehumancommunity.org/node/480 |
| hair03_ccby.zip | punkduck_alpha7_curly2 | clothes | CC-BY | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | punkduck | http://www.makehumancommunity.org/node/477 |
| hair03_ccby.zip | punkduck_alpha7_long | clothes | CC-BY | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | punkduck | http://www.makehumancommunity.org/node/482 |
| hair03_ccby.zip | punkduck_alpha7_long2 | clothes | CC-BY | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | punkduck | http://www.makehumancommunity.org/node/492 |
| hands01_cc0.zip | jujube_knobby_knuckles | target | CC0 |  | jujube | http://www.makehumancommunity.org/node/170 |
| hands01_cc0.zip | mindfront_hand_fingers_correction | target | CC0 |  | Mindfront | http://www.makehumancommunity.org/node/1590 |
| hands01_cc0.zip | mindfront_hand_hypothenar | target | CC0 |  | Mindfront | http://www.makehumancommunity.org/node/1591 |
| hands01_cc0.zip | mindfront_hand_thenar_eminence | target | CC0 |  | Mindfront | http://www.makehumancommunity.org/node/1592 |
| hats01_cc0.zip | aethelraed_unraed_cloche_hat | clothes | CC0 | CC0 | Aethelraed_Unraed | http://www.makehumancommunity.org/node/582 |
| hats01_cc0.zip | grinsegold_uncle_joshis_hat | clothes | CC0 | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | grinsegold | http://www.makehumancommunity.org/node/193 |
| hats01_cc0.zip | joepal_xmas_cap | clothes | CC0 | CC0 | Joel Palmius | http://www.makehumancommunity.org/node/520 |
| hats01_cc0.zip | jujube_bag_on_head | clothes | CC0 | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | jujube | http://www.makehumancommunity.org/node/578 |
| hats01_cc0.zip | jujube_newsboy_cap | clothes | CC0 | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | jujube | http://www.makehumancommunity.org/node/78 |
| hats01_cc0.zip | toigo_maga_hat | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/652 |
| hats02_cc0.zip | culturalibre_motorcycle_helmet | clothes | CC0 | creative commons zero (public domain) | culturalibre | http://www.makehumancommunity.org/node/2025 |
| hats02_cc0.zip | culturalibre_skull_helmet | clothes | CC0 | CC-0 | culturalibre | http://www.makehumancommunity.org/node/2349 |
| hats02_cc0.zip | culturalibre_warrior_helmet | clothes | CC0 | CC-0 | culturalibre | http://www.makehumancommunity.org/node/2351 |
| hats02_cc0.zip | grinsegold_corinthian_helmet | clothes | CC0 | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | grinsegold | http://www.makehumancommunity.org/node/667 |
| hats02_cc0.zip | javherre_casco_caballero_templario_templar_knight_helmet | clothes | CC0 | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | javherre | http://www.makehumancommunity.org/node/2014 |
| hats02_cc0.zip | mrgreaterthan_m1_helmet | clothes | CC0 |  | MrGreaterThan | http://www.makehumancommunity.org/node/2697 |
| hats03_cc-by.zip | culturalibre_cl_bowler_hat | clothes | CC-BY | CC-BY | culturalibre | http://www.makehumancommunity.org/node/3089 |
| hats03_cc-by.zip | culturalibre_cl_don_quixote_hat | clothes | CC-BY | CC-BY | culturalibre | http://www.makehumancommunity.org/node/3037 |
| hats03_cc-by.zip | elvs_basic_brave_feathers1 | clothes | CC-BY | cc-by | Elvaerwyn | http://www.makehumancommunity.org/node/1312 |
| hats03_cc-by.zip | elvs_charity_veil1 | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2610 |
| hats03_cc-by.zip | elvs_dirty_lil_maid_bonnet | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1575 |
| hats03_cc-by.zip | elvs_male_flat_cap1 | clothes | CC-BY | CC BY 4.0 | Elvaerwyn | http://www.makehumancommunity.org/node/1814 |
| hats03_cc-by.zip | elvs_male_trilby_hat | clothes | CC-BY | CC-by | Elvaerwyn | http://www.makehumancommunity.org/node/1413 |
| hats03_cc-by.zip | elvs_santa_hat | clothes | CC-BY | CC-by | Elvaerwyn | http://www.makehumancommunity.org/node/1273 |
| hats03_cc-by.zip | elvs_slouchy_beanie1 | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2088 |
| hats03_cc-by.zip | elvs_tophat1 | clothes | CC-BY | CC-by | Elvaerwyn | http://www.makehumancommunity.org/node/1360 |
| hats03_cc-by.zip | elvs_unisex_chef_hat_1 | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2967 |
| hats03_cc-by.zip | elvs_witchy_hallows_hat1 | clothes | CC-BY | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | Elvaerwyn | http://www.makehumancommunity.org/node/1708 |
| hats03_cc-by.zip | maciekg_wizard_hat | clothes | CC-BY | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | MaciekG | http://www.makehumancommunity.org/node/1481 |
| hats03_cc-by.zip | mindfront_fishing_hat_01 | clothes | CC-BY | CC BY 4.0 | Mindfront | http://www.makehumancommunity.org/node/337 |
| hats03_cc-by.zip | mindfront_knitted_hat_01 | clothes | CC-BY | CC BY 4.0 | Mindfront | http://www.makehumancommunity.org/node/745 |
| hats03_cc-by.zip | mindfront_patrol_cap | clothes | CC-BY | CC BY 4.0 | Mindfront | http://www.makehumancommunity.org/node/841 |
| hats03_cc-by.zip | mindfront_sherpa_hat | clothes | CC-BY | CC BY 4.0 | Mindfront | http://www.makehumancommunity.org/node/3172 |
| hats03_cc-by.zip | punkduck_sun_visor_sports_visor | clothes | CC-BY | CC  BY 3.0 | punkduck | http://www.makehumancommunity.org/node/694 |
| hats03_cc-by.zip | punkduck_swim_cap | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/663 |
| hats04_cc-by.zip | culturalibre_warrior_helmet_02 | clothes | CC-BY | CC-BY | culturalibre | http://www.makehumancommunity.org/node/2505 |
| hats04_cc-by.zip | drednicolson_pith_helmet | clothes | CC-BY | CCBY | DredNicolson | http://www.makehumancommunity.org/node/415 |
| hats04_cc-by.zip | jaldmic_m1951_72 | clothes | CC-BY | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | JALdMIC | http://www.makehumancommunity.org/node/2942 |
| hats04_cc-by.zip | maciekg_horned_helmet | clothes | CC-BY | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | MaciekG | http://www.makehumancommunity.org/node/1487 |
| hats04_cc-by.zip | maciekg_leather_helmet | clothes | CC-BY | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | MaciekG | http://www.makehumancommunity.org/node/1457 |
| hats04_cc-by.zip | mindfront_helmet_kz45 | clothes | CC-BY | CC BY 4.0 | Mindfront | http://www.makehumancommunity.org/node/1310 |
| hats04_cc-by.zip | punkduck_bicycle_helmet_time_trial_aero_helmet | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/670 |
| hats04_cc-by.zip | punkduck_riding_helmet | clothes | CC-BY | CC BY 4.0 | punkduck | http://www.makehumancommunity.org/node/1567 |
| jewelry01_cc0.zip | culturalibre_hero_gem | clothes | CC0 | CC-0 | culturalibre | http://www.makehumancommunity.org/node/2106 |
| jewelry01_cc0.zip | culturalibre_heroine_lightning_earrings | clothes | CC0 | CC-0 | culturalibre | http://www.makehumancommunity.org/node/2857 |
| jewelry01_cc0.zip | ews_hoop_earrings | clothes | CC0 | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | EWS | http://www.makehumancommunity.org/node/1242 |
| jewelry01_cc0.zip | ews_industrial_piercing_left_ear_ | clothes | CC0 | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | EWS | http://www.makehumancommunity.org/node/1231 |
| jewelry01_cc0.zip | ews_industrial_piercing_right_ear_ | clothes | CC0 | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | EWS | http://www.makehumancommunity.org/node/1232 |
| jewelry01_cc0.zip | ews_septum_ring | clothes | CC0 | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | EWS | http://www.makehumancommunity.org/node/1230 |
| jewelry01_cc0.zip | joachip_ring_1 | clothes | CC0 |  | joachip | http://www.makehumancommunity.org/node/3119 |
| jewelry01_cc0.zip | learning_slave_collar_chain | clothes | CC0 | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | learning | http://www.makehumancommunity.org/node/55 |
| jewelry01_cc0.zip | punkduck_lace-choker | clothes | CC0 | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/792 |
| jewelry01_cc0.zip | toigo_diamond_ring_and_wedding_band | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1625 |
| jewelry01_cc0.zip | toigo_pearl_earrings | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1029 |
| jewelry01_cc0.zip | toigo_pearl_necklace | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1028 |
| jewelry01_cc0.zip | toigo_wedding_ring | clothes | CC0 | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | MargaretToigo | http://www.makehumancommunity.org/node/974 |
| jewelry01_cc0.zip | wolgade_diamond_ring_01 | clothes | CC0 | CC 0 | wolgade | http://www.makehumancommunity.org/node/558 |
| jewelry02_cc-by.zip | culturalibre_cl_spiral_bracelets | clothes | CC-BY | CC-BY | culturalibre | http://www.makehumancommunity.org/node/3022 |
| jewelry02_cc-by.zip | culturalibre_leather_bracelet | clothes | CC-BY | CC-BY | culturalibre | http://www.makehumancommunity.org/node/2552 |
| jewelry02_cc-by.zip | elvs_bangle_bracelet1 | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1432 |
| jewelry02_cc-by.zip | elvs_bracelet_pearls-l1 | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1437 |
| jewelry02_cc-by.zip | elvs_braided_anklet1 | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2586 |
| jewelry02_cc-by.zip | elvs_candy_cane_necklace | clothes | CC-BY | CC-By | Elvaerwyn | http://www.makehumancommunity.org/node/1244 |
| jewelry02_cc-by.zip | elvs_chunky_chain_anklet | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2585 |
| jewelry02_cc-by.zip | elvs_chunky_chain~heart_necklace | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1441 |
| jewelry02_cc-by.zip | elvs_circle_chain_anklet1 | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2587 |
| jewelry02_cc-by.zip | elvs_double_hoops | clothes | CC-BY | CC-by | Elvaerwyn | http://www.makehumancommunity.org/node/1460 |
| jewelry02_cc-by.zip | elvs_f_earring_array1_l | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1476 |
| jewelry02_cc-by.zip | elvs_goth_statement_necklace1 | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1918 |
| jewelry02_cc-by.zip | elvs_heart_belly_jewel | clothes | CC-BY | CC-by | Elvaerwyn | http://www.makehumancommunity.org/node/1271 |
| jewelry02_cc-by.zip | elvs_interlocking_rings_anklet1 | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2588 |
| jewelry02_cc-by.zip | elvs_m_facial_jewel_array1 | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1477 |
| jewelry02_cc-by.zip | elvs_multi_bangle_bracelet1 | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1433 |
| jewelry02_cc-by.zip | elvs_navel_ring_heartfob | clothes | CC-BY | CC-by | Elvaerwyn | http://www.makehumancommunity.org/node/1268 |
| jewelry02_cc-by.zip | elvs_pearl_anklet_1 | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2589 |
| jewelry02_cc-by.zip | elvs_pumpkin_hallows_earrings1 | clothes | CC-BY | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | Elvaerwyn | http://www.makehumancommunity.org/node/1709 |
| jewelry02_cc-by.zip | elvs_stars_belly_circlet | clothes | CC-BY | CC-by | Elvaerwyn | http://www.makehumancommunity.org/node/1272 |
| jewelry02_cc-by.zip | elvs_twisty_hoops1 | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1442 |
| jewelry02_cc-by.zip | jaldmic_ankh_collar | clothes | CC-BY | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | JALdMIC | http://www.makehumancommunity.org/node/2994 |
| jewelry02_cc-by.zip | jaldmic_no_heart_enchanted_gemstone | clothes | CC-BY |  | JALdMIC | http://www.makehumancommunity.org/node/3312 |
| jewelry02_cc-by.zip | punkduck_bracelet_infinity_love | clothes | CC-BY | CC BY 4.0 | punkduck | http://www.makehumancommunity.org/node/1440 |
| jewelry02_cc-by.zip | punkduck_brass_circlet_crown | clothes | CC-BY | CC BY 4.0 | punkduck | http://www.makehumancommunity.org/node/1383 |
| jewelry02_cc-by.zip | punkduck_makehuman_medal | clothes | CC-BY | CC  BY 3.0 | punkduck | http://www.makehumancommunity.org/node/717 |
| jewelry02_cc-by.zip | punkduck_necklace_native_american_fashion_ | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/924 |
| jewelry02_cc-by.zip | punkduck_pearl-chain_earrings | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/1314 |
| jewelry02_cc-by.zip | punkduck_spike_collar | clothes | CC-BY | CC BY 4.0 | punkduck | http://www.makehumancommunity.org/node/971 |
| jewelry02_cc-by.zip | punkduck_twisted_pearl_necklace | clothes | CC-BY | CC BY 4.0 | punkduck | http://www.makehumancommunity.org/node/1316 |
| jewelry02_cc-by.zip | wojackowl_belly_piercing | clothes | CC-BY |  | WojackOWL | http://www.makehumancommunity.org/node/3470 |
| masks01_cc0.zip | culturalibre_hero-heroine_hood_1 | clothes | CC0 | CC-0 | culturalibre | http://www.makehumancommunity.org/node/2100 |
| masks01_cc0.zip | culturalibre_hero-heroine_hood_2 | clothes | CC0 | CC-0 | culturalibre | http://www.makehumancommunity.org/node/2309 |
| masks01_cc0.zip | culturalibre_hero_mask_1 | clothes | CC0 | CC-0 | culturalibre | http://www.makehumancommunity.org/node/2055 |
| masks01_cc0.zip | culturalibre_hero_mask_2 | clothes | CC0 | CC-0 | culturalibre | http://www.makehumancommunity.org/node/2049 |
| masks01_cc0.zip | culturalibre_hero_mask_3 | clothes | CC0 | CC-0 | culturalibre | http://www.makehumancommunity.org/node/2202 |
| masks01_cc0.zip | culturalibre_hero_mask_4 | clothes | CC0 | CC-0 | culturalibre | http://www.makehumancommunity.org/node/2220 |
| masks01_cc0.zip | culturalibre_hero_mask_5 | clothes | CC-BY | CC-0 | culturalibre | http://www.makehumancommunity.org/node/2396 |
| masks01_cc0.zip | culturalibre_heroine_mask_1 | clothes | CC0 | CC-0 | culturalibre | http://www.makehumancommunity.org/node/2474 |
| masks01_cc0.zip | joepal_medical_mouth_protection | clothes | CC0 | CC0 | Joel Palmius | http://www.makehumancommunity.org/node/2369 |
| masks02_ccby.zip | culturalibre_bandana_mask | clothes | CC-BY | CC-BY | culturalibre | http://www.makehumancommunity.org/node/2483 |
| masks02_ccby.zip | elvs_covid_mask | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2523 |
| masks02_ccby.zip | elvs_plague_doctor_mask | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2371 |
| masks02_ccby.zip | gredal_gas_mask | clothes | CC-BY |  | Mathias_Gredal | http://www.makehumancommunity.org/node/2715 |
| nose01_cc0.zip | elvs_bulbous_nose_1 | target | CC0 |  | Elvaerwyn | http://www.makehumancommunity.org/node/2241 |
| nose01_cc0.zip | elvs_nose_widening_1 | target | CC0 |  | Elvaerwyn | http://www.makehumancommunity.org/node/2783 |
| nose01_cc0.zip | habanero_nostril_alar_rounding | target | CC0 |  | Habanero | http://www.makehumancommunity.org/node/315 |
| nose01_cc0.zip | jujube_greek_statue_nose | target | CC0 |  | jujube | http://www.makehumancommunity.org/node/653 |
| nose01_cc0.zip | jujube_nasiolabial_sharp_angle | target | CC0 |  | jujube | http://www.makehumancommunity.org/node/544 |
| nose01_cc0.zip | jujube_nasolabial_angle_crease | target | CC0 |  | jujube | http://www.makehumancommunity.org/node/608 |
| nose01_cc0.zip | jujube_nose_straight_columella | target | CC0 |  | jujube | http://www.makehumancommunity.org/node/65 |
| nose01_cc0.zip | jujube_nostril_bean_shape | target | CC0 |  | jujube | http://www.makehumancommunity.org/node/545 |
| nose01_cc0.zip | jujube_nostril_deepen | target | CC0 |  | jujube | http://www.makehumancommunity.org/node/609 |
| nose01_cc0.zip | jujube_nostril_rim_sharp | target | CC0 |  | jujube | http://www.makehumancommunity.org/node/617 |
| nose01_cc0.zip | jujube_nostril_shrink | target | CC0 |  | jujube | http://www.makehumancommunity.org/node/543 |
| nose01_cc0.zip | jujube_nostril_up | target | CC0 |  | jujube | http://www.makehumancommunity.org/node/546 |
| nose01_cc0.zip | mindfront_nose_alar_crease | target | CC0 |  | Mindfront | http://www.makehumancommunity.org/node/1594 |
| nose01_cc0.zip | mindfront_nose_hole_center | target | CC0 |  | Mindfront | http://www.makehumancommunity.org/node/1595 |
| nose01_cc0.zip | mindfront_nose_hole_up | target | CC0 |  | Mindfront | http://www.makehumancommunity.org/node/1596 |
| pants01_cc0.zip | cortu_cargo_pants | clothes | CC0 |  | Cortu | http://www.makehumancommunity.org/node/2798 |
| pants01_cc0.zip | cortu_jeans_shorts | clothes | CC0 |  | Cortu | http://www.makehumancommunity.org/node/2800 |
| pants01_cc0.zip | toigo_harem_pants | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1728 |
| pants01_cc0.zip | toigo_wool_pants | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1194 |
| pants02_ccby.zip | elvs_disco_pants_double_ruffles | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2578 |
| pants02_ccby.zip | elvs_disco_pants_single_ruffles | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2579 |
| pants02_ccby.zip | elvs_disco_pants_skinny | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2583 |
| pants02_ccby.zip | elvs_gored_elephant_pants | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2577 |
| pants02_ccby.zip | elvs_jeans_bootcut | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1798 |
| pants02_ccby.zip | elvs_jeans_straight_leg | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1802 |
| pants02_ccby.zip | elvs_male_trouser | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1796 |
| pants02_ccby.zip | elvs_male_trouser_with_chain | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1805 |
| pants02_ccby.zip | mindfront_female_trousers_1 | clothes | CC-BY | CC BY 4.0 | Mindfront | http://www.makehumancommunity.org/node/790 |
| pants02_ccby.zip | mindfront_male_trousers_1 | clothes | CC-BY | CC BY 4.0 | Mindfront | http://www.makehumancommunity.org/node/746 |
| pants02_ccby.zip | mindfront_male_trousers_2 | clothes | CC-BY | CC BY 4.0 | Mindfront | http://www.makehumancommunity.org/node/1497 |
| pants02_ccby.zip | punkduck_female_tight_jeans | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/391 |
| pants02_ccby.zip | punkduck_male_classic_jeans | clothes | CC-BY | CC-BY 4.0 | punkduck | http://www.makehumancommunity.org/node/1655 |
| pants03_ccby.zip | elvs_male_swim_shorts1 | clothes | CC-BY | CC-by | Elvaerwyn | http://www.makehumancommunity.org/node/1321 |
| pants03_ccby.zip | elvs_male_trouser_short_1 | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1801 |
| pants03_ccby.zip | elvs_male_trouser_short_2 | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1806 |
| pants03_ccby.zip | elvs_retro_girly_shorts1 | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1693 |
| pants03_ccby.zip | mindfront_male_swimming_trunks_01 | clothes | CC-BY | CC BY 4.0 | Mindfront | http://www.makehumancommunity.org/node/329 |
| pants03_ccby.zip | mindfront_male_swimming_trunks_02 | clothes | CC-BY | CC BY 4.0 | Mindfront | http://www.makehumancommunity.org/node/340 |
| pants03_ccby.zip | mindfront_male_swimming_trunks_03 | clothes | CC-BY | CC BY 4.0 | Mindfront | http://www.makehumancommunity.org/node/851 |
| pants03_ccby.zip | punkduck_female_short_jeans | clothes | CC-BY | CC-BY 4.0 | punkduck | http://www.makehumancommunity.org/node/392 |
| shirts01_cc0.zip | elvs_crude_t-shirt_male | clothes | CC0 | CC0 | Elvaerwyn | http://www.makehumancommunity.org/node/1416 |
| shirts01_cc0.zip | joepal_crude_t-shirt_female | clothes | CC0 | CC0 | Joel Palmius | http://www.makehumancommunity.org/node/894 |
| shirts01_cc0.zip | namuhekam_male_polo_shirt | clothes | CC0 |  | namuhekam | http://www.makehumancommunity.org/node/2909 |
| shirts01_cc0.zip | skalldyrssuppe_tube_top_funky_colors | clothes | CC0 | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | skalldyrssuppe | http://www.makehumancommunity.org/node/975 |
| shirts01_cc0.zip | toigo_basic_tucked_t-shirt | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1203 |
| shirts01_cc0.zip | toigo_bodice-style_top | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1667 |
| shirts01_cc0.zip | toigo_camisole_top | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1726 |
| shirts01_cc0.zip | toigo_fisherman_sweater | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1187 |
| shirts01_cc0.zip | toigo_keyhole_tank_top | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1606 |
| shirts01_cc0.zip | toigo_turtleneck_halter_top | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1642 |
| shirts02_ccby.zip | elvs_hooded_sweat_jacket1 | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1450 |
| shirts02_ccby.zip | elvs_male_boho_top1 | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1808 |
| shirts02_ccby.zip | elvs_male_shirt_tie_tucked1 | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1799 |
| shirts02_ccby.zip | elvs_male_shirt_untucked_bd1 | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1800 |
| shirts02_ccby.zip | ews_striped_shirt | clothes | CC-BY | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | EWS | http://www.makehumancommunity.org/node/1229 |
| shirts02_ccby.zip | janexx_old_female_sweater | clothes | CC-BY |  | janexx | http://www.makehumancommunity.org/node/2767 |
| shirts02_ccby.zip | mindfront_cardigan_long_open_front | clothes | CC-BY | CC BY 4.0 | Mindfront | http://www.makehumancommunity.org/node/1528 |
| shirts02_ccby.zip | mindfront_knitted_sweater_01 | clothes | CC-BY | CC BY 4.0 | Mindfront | http://www.makehumancommunity.org/node/660 |
| shirts02_ccby.zip | mindfront_knitted_sweater_02 | clothes | CC-BY | CC BY 4.0 | Mindfront | http://www.makehumancommunity.org/node/661 |
| shirts02_ccby.zip | mindfront_lusekofta | clothes | CC-BY | CC BY 4.0 | Mindfront | http://www.makehumancommunity.org/node/1527 |
| shirts02_ccby.zip | punkduck_deathnote_t-shirt | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/810 |
| shirts02_ccby.zip | punkduck_lace_up_blouse | clothes | CC-BY | CC BY 4.0 | punkduck | http://www.makehumancommunity.org/node/1775 |
| shirts02_ccby.zip | punkduck_off-shoulder_long-sleeve_top | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/791 |
| shirts03_ccby.zip | drednicolson_asymmetric_tunic_and_sash | clothes | CC-BY | CCBY | DredNicolson | http://www.makehumancommunity.org/node/409 |
| shirts03_ccby.zip | drednicolson_short-tail_camo_tee | clothes | CC-BY | CCBY | DredNicolson | http://www.makehumancommunity.org/node/433 |
| shirts03_ccby.zip | elvs_disco_top2 | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2580 |
| shirts03_ccby.zip | elvs_disco_top_1_butterfly | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2584 |
| shirts03_ccby.zip | elvs_ladies_tank1 | clothes | CC-BY | CC-by | Elvaerwyn | http://www.makehumancommunity.org/node/1447 |
| shirts03_ccby.zip | elvs_lara_tank1 | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2635 |
| shirts03_ccby.zip | elvs_male_athletic_tank1 | clothes | CC-BY | CC-by | Elvaerwyn | http://www.makehumancommunity.org/node/1431 |
| shirts03_ccby.zip | elvs_male_logo_tshirt1 | clothes | CC-BY | CC-BY 4.0 | Elvaerwyn | http://www.makehumancommunity.org/node/1661 |
| shirts03_ccby.zip | elvs_male_muscle_shirt1 | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1803 |
| shirts03_ccby.zip | elvs_male_tankshirt1 | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1804 |
| shirts03_ccby.zip | elvs_ruffle_sleeve_peasant_blouse_1 | clothes | CC-BY | CC-by | Elvaerwyn | http://www.makehumancommunity.org/node/1256 |
| shirts03_ccby.zip | mindfront_tank_top_01 | clothes | CC-BY | CC BY 4.0 | Mindfront | http://www.makehumancommunity.org/node/341 |
| shirts03_ccby.zip | punkduck_high_neck_crop_top | clothes | CC-BY | CC BY 4.0 | punkduck | http://www.makehumancommunity.org/node/1088 |
| shirts03_ccby.zip | punkduck_retro_top | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/781 |
| shirts03_ccby.zip | punkduck_sleeveless_crop_top | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/925 |
| shirts03_ccby.zip | punkduck_sleeveless_shirt | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/440 |
| shirts03_ccby.zip | punkduck_spaghetti_strap_tank_top | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/459 |
| shirts03_ccby.zip | punkduck_tube_top | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/420 |
| shirts03_ccby.zip | punkduck_v_neck_top | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/419 |
| shoes01_cc0.zip | cortu_floppy_overknee_shoes | clothes | CC0 |  | Cortu | http://www.makehumancommunity.org/node/2803 |
| shoes01_cc0.zip | cortu_t-bar | clothes | CC0 |  | Cortu | http://www.makehumancommunity.org/node/2801 |
| shoes01_cc0.zip | culturalibre_hero_boots_1 | clothes | CC0 | CC-0 | culturalibre | http://www.makehumancommunity.org/node/2081 |
| shoes01_cc0.zip | culturalibre_hero_boots_2 | clothes | CC0 | CC-0 | culturalibre | http://www.makehumancommunity.org/node/2132 |
| shoes01_cc0.zip | culturalibre_hero_boots_3 | clothes | CC0 | CC-0 | culturalibre | http://www.makehumancommunity.org/node/2138 |
| shoes01_cc0.zip | culturalibre_hero_boots_4 | clothes | CC0 | CC-0 | culturalibre | http://www.makehumancommunity.org/node/2167 |
| shoes01_cc0.zip | culturalibre_hero_boots_5 | clothes | CC0 | CC-0 | culturalibre | http://www.makehumancommunity.org/node/2424 |
| shoes01_cc0.zip | culturalibre_heroine_boots_1 | clothes | CC0 | CC-0 | culturalibre | http://www.makehumancommunity.org/node/2155 |
| shoes01_cc0.zip | culturalibre_heroine_boots_2 | clothes | CC0 | CC-0 | culturalibre | http://www.makehumancommunity.org/node/2181 |
| shoes01_cc0.zip | culturalibre_heroine_boots_3 | clothes | CC0 | CC-0 | culturalibre | http://www.makehumancommunity.org/node/2187 |
| shoes01_cc0.zip | culturalibre_heroine_boots_4 | clothes | CC-BY | CC-0 | culturalibre | http://www.makehumancommunity.org/node/2464 |
| shoes01_cc0.zip | culturalibre_male_boots | clothes | CC0 | CC-0 | culturalibre | http://www.makehumancommunity.org/node/2548 |
| shoes01_cc0.zip | grinsegold_female_pirate_boots | clothes | CC0 | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | grinsegold | http://www.makehumancommunity.org/node/211 |
| shoes01_cc0.zip | scailman_gogo_platform_boots | clothes | CC0 | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | scailman | http://www.makehumancommunity.org/node/1467 |
| shoes01_cc0.zip | scailman_semitransparent_water_boots | clothes | CC0 | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | scailman | http://www.makehumancommunity.org/node/1778 |
| shoes01_cc0.zip | toigo_ankle_boots_female | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1738 |
| shoes01_cc0.zip | toigo_ankle_boots_male | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1743 |
| shoes01_cc0.zip | toigo_ballet_flats | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1734 |
| shoes01_cc0.zip | toigo_ballet_flats_with_bows | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1735 |
| shoes01_cc0.zip | toigo_ballet_flats_with_flowers | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1736 |
| shoes01_cc0.zip | toigo_flats | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1117 |
| shoes01_cc0.zip | toigo_mj_cloth_shoes | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1700 |
| shoes01_cc0.zip | toigo_stiletto_booties | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1694 |
| shoes02_ccby.zip | callharvey3d_harvey_saddleshoes1 | clothes | CC-BY | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | callharvey3d | http://www.makehumancommunity.org/node/370 |
| shoes02_ccby.zip | culturalibre_sneakers | clothes | CC-BY | CC-BY | culturalibre | http://www.makehumancommunity.org/node/2555 |
| shoes02_ccby.zip | dressupdoc_balletflat1 | clothes | CC-BY | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | DressUpDoc | http://www.makehumancommunity.org/node/2651 |
| shoes02_ccby.zip | dressupdoc_domsjeans1 | clothes | CC-BY | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | DressUpDoc | http://www.makehumancommunity.org/node/2652 |
| shoes02_ccby.zip | dressupdoc_maryjane1 | clothes | CC-BY | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | DressUpDoc | http://www.makehumancommunity.org/node/2653 |
| shoes02_ccby.zip | dressupdoc_sandals1 | clothes | CC-BY | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | DressUpDoc | http://www.makehumancommunity.org/node/2654 |
| shoes02_ccby.zip | elvs_basic_felt_elf_shoes | clothes | CC-BY | CC-by | Elvaerwyn | http://www.makehumancommunity.org/node/1279 |
| shoes02_ccby.zip | elvs_caesar_sandals1 | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1915 |
| shoes02_ccby.zip | elvs_flatshoe_bow1 | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1715 |
| shoes02_ccby.zip | elvs_flatshoe_buckle_1 | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1716 |
| shoes02_ccby.zip | elvs_flatshoe_gemmed1 | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1717 |
| shoes02_ccby.zip | elvs_flatshoe_plain1 | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1713 |
| shoes02_ccby.zip | elvs_flatshoe_pointy1 | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1714 |
| shoes02_ccby.zip | elvs_male_flip_flop_sandals1 | clothes | CC-BY | CC-by | Elvaerwyn | http://www.makehumancommunity.org/node/1453 |
| shoes02_ccby.zip | elvs_zombie_killer_sneakers | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2687 |
| shoes02_ccby.zip | mindfront_shoes_monk_strap_female | clothes | CC-BY | CC BY 4.0 | Mindfront | http://www.makehumancommunity.org/node/621 |
| shoes02_ccby.zip | mindfront_shoes_monk_strap_male | clothes | CC-BY | CC BY 4.0 | Mindfront | http://www.makehumancommunity.org/node/622 |
| shoes02_ccby.zip | mindfront_shoes_oxford_female | clothes | CC-BY | CC BY 4.0 | Mindfront | http://www.makehumancommunity.org/node/619 |
| shoes02_ccby.zip | mindfront_shoes_oxford_male | clothes | CC-BY | CC BY 4.0 | Mindfront | http://www.makehumancommunity.org/node/620 |
| shoes02_ccby.zip | punkduck_comfortable_sneakers | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/438 |
| shoes02_ccby.zip | punkduck_cycling_shoes | clothes | CC-BY | CC  BY 3.0 | punkduck | http://www.makehumancommunity.org/node/669 |
| shoes02_ccby.zip | punkduck_kill_bill_shoes | clothes | CC-BY | CC  BY 3.0 | punkduck | http://www.makehumancommunity.org/node/837 |
| shoes02_ccby.zip | punkduck_running_shoes_01 | clothes | CC-BY | CC  BY 3.0 | punkduck | http://www.makehumancommunity.org/node/570 |
| shoes02_ccby.zip | punkduck_tennis_shoes | clothes | CC-BY | CC  BY 3.0 | punkduck | http://www.makehumancommunity.org/node/748 |
| shoes03_ccby.zip | elvs_knee_high_heel_boots1 | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1380 |
| shoes03_ccby.zip | elvs_wedge_tall_boots1 | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1916 |
| shoes03_ccby.zip | maciekg_leather_boots | clothes | CC-BY | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | MaciekG | http://www.makehumancommunity.org/node/1461 |
| shoes03_ccby.zip | madmanny_tight_leather_boots | clothes | CC-BY | CC-BY | madmanny | http://www.makehumancommunity.org/node/1448 |
| shoes03_ccby.zip | mindfront_shoes_biker_boots_female | clothes | CC-BY | CC BY 4.0 | Mindfront | http://www.makehumancommunity.org/node/623 |
| shoes03_ccby.zip | mindfront_shoes_biker_boots_male | clothes | CC-BY | CC BY 4.0 | Mindfront | http://www.makehumancommunity.org/node/624 |
| shoes03_ccby.zip | punkduck_female_half-boots | clothes | CC-BY | CC BY 4.0 | punkduck | http://www.makehumancommunity.org/node/958 |
| shoes03_ccby.zip | punkduck_female_knee_boots | clothes | CC-BY | CC BY 4.0 | punkduck | http://www.makehumancommunity.org/node/817 |
| shoes03_ccby.zip | punkduck_medieval_boots | clothes | CC-BY | CC BY 4.0 | punkduck | http://www.makehumancommunity.org/node/1381 |
| shoes03_ccby.zip | punkduck_riding_boots | clothes | CC-BY | CC BY 4.0 | punkduck | http://www.makehumancommunity.org/node/1566 |
| shoes03_ccby.zip | punkduck_winter_boots | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/444 |
| shoes03_ccby.zip | scailman_low-heeled_boots | clothes | CC-BY | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | scailman | http://www.makehumancommunity.org/node/853 |
| skins01_cc0.zip | blindsaypatten_uniform_skin_texture | skin | CC0 |  | blindsaypatten | http://www.makehumancommunity.org/node/743 |
| skins01_cc0.zip | bobby_03_young_female_hairless | skin | CC0 |  | bobby_03 | http://www.makehumancommunity.org/node/2346 |
| skins01_cc0.zip | callharvey3d_midtoned_female | skin | CC0 |  | callharvey3d | http://www.makehumancommunity.org/node/802 |
| skins01_cc0.zip | cutoff3d_indian_female_enhanced | skin | CC0 |  | CutOff3D | http://www.makehumancommunity.org/node/3017 |
| skins01_cc0.zip | cutoff3d_indian_female_skin | skin | CC0 |  | CutOff3D | http://www.makehumancommunity.org/node/3013 |
| skins01_cc0.zip | darthfurby_caucasian_female | skin | CC0 |  | darthfurby | http://www.makehumancommunity.org/node/1549 |
| skins01_cc0.zip | flower-angel_red_head_skin | skin | CC0 |  | flower-angel | http://www.makehumancommunity.org/node/1933 |
| skins01_cc0.zip | nyloseth_zoeyskin | skin | CC0 |  | Nyloseth | http://www.makehumancommunity.org/node/1914 |
| skins01_cc0.zip | onlytheghosts_middle_aged_eurasian_female | skin | CC0 |  | OnlyTheGhosts | http://www.makehumancommunity.org/node/1579 |
| skins01_cc0.zip | onlytheghosts_old_eurasian_female | skin | CC0 |  | OnlyTheGhosts | http://www.makehumancommunity.org/node/1580 |
| skins01_cc0.zip | onlytheghosts_young_eurasian_female | skin | CC0 |  | OnlyTheGhosts | http://www.makehumancommunity.org/node/1578 |
| skins01_cc0.zip | saltycowdawg_genuine_caucasian_female_with_genitals | skin | CC0 |  | saltycowdawg | http://www.makehumancommunity.org/node/2024 |
| skins01_cc0.zip | skalldyrssuppe_creamy_female | skin | CC0 |  | skalldyrssuppe | http://www.makehumancommunity.org/node/935 |
| skins01_cc0.zip | spreadcore_alana_caucasian_female_with_genitals_skin | skin | CC0 |  | spreadcore | http://www.makehumancommunity.org/node/3113 |
| skins01_cc0.zip | toigo_light_skin_female_bronze | skin | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/1133 |
| skins01_cc0.zip | toigo_light_skin_female_bronze_with_makeup | skin | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/1129 |
| skins01_cc0.zip | toigo_light_skin_female_freckles | skin | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/1134 |
| skins01_cc0.zip | toigo_light_skin_female_ginger | skin | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/1130 |
| skins01_cc0.zip | toigo_light_skin_female_ginger_2 | skin | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/1132 |
| skins01_cc0.zip | toigo_light_skin_female_ginger_with_makeup | skin | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/1131 |
| skins01_cc0.zip | toigo_light_skin_female_with_violet_makeup | skin | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/1126 |
| skins01_cc0.zip | toigo_light_skin_with_makeup | skin | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/1116 |
| skins01_cc0.zip | toigo_light_skin_with_natural_makeup | skin | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/1125 |
| skins02_cc0.zip | jartur69_middleage_slavic_male_with_genitals_and_beard | skin | CC0 |  | jartur69 | http://www.makehumancommunity.org/node/1508 |
| skins02_cc0.zip | jartur69_old_slavic_male_with_genitals_and_beard | skin | CC0 |  | jartur69 | http://www.makehumancommunity.org/node/1507 |
| skins02_cc0.zip | ken1138_caucasian_male_tattooed_skin | skin | CC0 |  | ken1138 | http://www.makehumancommunity.org/node/1601 |
| skins02_cc0.zip | mindfront_aksel_skin | skin | CC0 |  | Mindfront | http://www.makehumancommunity.org/node/850 |
| skins02_cc0.zip | mindfront_skin_male_african_middleage | skin | CC0 |  | Mindfront | http://www.makehumancommunity.org/node/526 |
| skins02_cc0.zip | onlytheghosts_old_eurasian_male | skin | CC0 |  | OnlyTheGhosts | http://www.makehumancommunity.org/node/1581 |
| skins02_cc0.zip | rehmanpolanski_skin_viking_tattoos | skin | CC0 |  | RehmanPolanski | http://www.makehumancommunity.org/node/2623 |
| skins02_cc0.zip | toigo_light_skin_male_bronze | skin | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/1136 |
| skins02_cc0.zip | toigo_light_skin_male_freckles | skin | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/1137 |
| skins02_cc0.zip | toigo_light_skin_male_ginger | skin | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/1135 |
| skins02_cc0.zip | toigo_light_skin_male_with_emo_eyes | skin | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/1139 |
| skins02_cc0.zip | toigo_light_skin_male_with_eyeliner | skin | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/1138 |
| skins02_cc0.zip | toigo_light_skin_male_with_goth_makeup | skin | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/1140 |
| skirts01_cc0.zip | frankyaye_mini_skirt_01 | clothes | CC0 | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | frankyaye | http://www.makehumancommunity.org/node/129 |
| skirts01_cc0.zip | frankyaye_mini_skirt_02 | clothes | CC0 | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | frankyaye | http://www.makehumancommunity.org/node/131 |
| skirts01_cc0.zip | toigo_long_full_skirt | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1727 |
| skirts01_cc0.zip | toigo_skirt_with_lace_ruffle | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1731 |
| skirts01_cc0.zip | toigo_tiered_mini_skirt | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1668 |
| skirts01_cc0.zip | toigo_tiered_skirt | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1641 |
| skirts02_cc-by.zip | callharvey3d_harvey_pskirt01 | clothes | CC-BY | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | callharvey3d | http://www.makehumancommunity.org/node/368 |
| skirts02_cc-by.zip | elvs_asymmetrical_skirt | clothes | CC-BY | CC-by | Elvaerwyn | http://www.makehumancommunity.org/node/1252 |
| skirts02_cc-by.zip | elvs_disco_mini_skirt | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2582 |
| skirts02_cc-by.zip | elvs_gored_midi_skirt | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2576 |
| skirts02_cc-by.zip | elvs_pencil_skirt | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2581 |
| skirts02_cc-by.zip | elvs_pleated_plaid_mini_skirt | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1925 |
| skirts02_cc-by.zip | mtknife_low_mini_skirt | clothes | CC-BY | CC-BY -- Creative Commons Attribution | MTKnife | http://www.makehumancommunity.org/node/142 |
| skirts02_cc-by.zip | mtknife_pleated_mini_skirt | clothes | CC-BY | CC-BY (https://creativecommons.org/licenses/by/4.0/) | MTKnife | http://www.makehumancommunity.org/node/1961 |
| skirts02_cc-by.zip | punkduck_black_mini_skirt | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/421 |
| skirts02_cc-by.zip | punkduck_jeans_skirt | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/445 |
| skirts02_cc-by.zip | punkduck_retro_polka_dot_skirt | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/780 |
| skirts02_cc-by.zip | punkduck_skirt_native_american_fashion | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/923 |
| skirts02_cc-by.zip | scsouza_mini_denin_skirt | clothes | CC-BY | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | scsouza | http://www.makehumancommunity.org/node/293 |
| skirts02_cc-by.zip | sonicteam998_maria_skirt | clothes | CC-BY | CC BY 3.0 | sonicteam998 | http://www.makehumancommunity.org/node/784 |
| suits01_cc0.zip | toigo_female_double-breasted_suit | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1742 |
| suits01_cc0.zip | toigo_female_suit | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1324 |
| suits01_cc0.zip | toigo_female_suit_2 | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1739 |
| suits01_cc0.zip | toigo_male_double-breasted_suit | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1740 |
| suits01_cc0.zip | toigo_male_suit_3 | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1733 |
| suits01_cc0.zip | toigo_male_suit_tie_and_jacket | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1265 |
| suits01_cc0.zip | toigo_suit_with_dinner_jacket | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1746 |
| suits01_cc0.zip | toigo_suit_with_jacket_and_bowtie | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1317 |
| suits02_cc0.zip | culturalibre_hero_suit_1 | clothes | CC0 | CC-0 | culturalibre | http://www.makehumancommunity.org/node/2061 |
| suits02_cc0.zip | culturalibre_hero_suit_2 | clothes | CC0 | CC-0 | culturalibre | http://www.makehumancommunity.org/node/2292 |
| suits02_cc0.zip | culturalibre_hero_suit_3 | clothes | CC0 | CC-0 | culturalibre | http://www.makehumancommunity.org/node/2308 |
| suits02_cc0.zip | culturalibre_heroine_suit_2 | clothes | CC0 | CC-0 | culturalibre | http://www.makehumancommunity.org/node/2317 |
| suits02_cc0.zip | donitz_monk_robe | clothes | CC0 |  | Donitz | http://www.makehumancommunity.org/node/3238 |
| suits02_cc0.zip | donitz_monk_robe_hood | clothes | CC0 |  | Donitz | http://www.makehumancommunity.org/node/3235 |
| suits02_cc0.zip | donitz_monk_robe_hood_down | clothes | CC0 |  | Donitz | http://www.makehumancommunity.org/node/3236 |
| suits02_cc0.zip | donitz_monk_robe_hood_off | clothes | CC0 |  | Donitz | http://www.makehumancommunity.org/node/3237 |
| suits02_cc0.zip | green_tomato_rei_ayanami | clothes | CC0 |  | green_tomato | http://www.makehumancommunity.org/node/3239 |
| suits02_cc0.zip | green_tomato_yoko_tsuno | clothes | CC0 |  | green_tomato | http://www.makehumancommunity.org/node/3228 |
| suits02_cc0.zip | joachip_cyborg_suit | clothes | CC0 |  | joachip | http://www.makehumancommunity.org/node/3204 |
| suits02_cc0.zip | matcreator_mc-bodysuit-2021 | clothes | CC0 |  | MatCreator | http://www.makehumancommunity.org/node/2879 |
| suits02_cc0.zip | matcreator_mc-scifi-armor_guardian | clothes | CC0 |  | MatCreator | http://www.makehumancommunity.org/node/2880 |
| suits02_cc0.zip | matcreator_mc-scifi-armor_helios | clothes | CC0 |  | MatCreator | http://www.makehumancommunity.org/node/2881 |
| suits02_cc0.zip | matcreator_mc-scifi-armor_jupiter7 | clothes | CC0 |  | MatCreator | http://www.makehumancommunity.org/node/2882 |
| suits02_cc0.zip | matcreator_mc-skinsuit_2022 | clothes | CC0 |  | MatCreator | http://www.makehumancommunity.org/node/2991 |
| suits02_cc0.zip | rehmanpolanski_viking_boots | clothes | CC0 | CC0 | RehmanPolanski | http://www.makehumancommunity.org/node/2619 |
| suits02_cc0.zip | rehmanpolanski_viking_pants | clothes | CC0 | CC0 | RehmanPolanski | http://www.makehumancommunity.org/node/2618 |
| suits02_cc0.zip | rehmanpolanski_viking_tunic | clothes | CC0 | CC0 | RehmanPolanski | http://www.makehumancommunity.org/node/2617 |
| suits02_cc0.zip | slayer227_spider-gwen | clothes | CC0 |  | Slayer227 | http://www.makehumancommunity.org/node/2977 |
| suits02_cc0.zip | thegreatengineer_galactic_warrior_uniform | clothes | CC0 |  | TheGreatEngineer | http://www.makehumancommunity.org/node/2884 |
| suits03_cc-by.zip | elvs_emt_uniform_jacket_female | clothes | CC-BY | CC BY 4.0 | Elvaerwyn | http://www.makehumancommunity.org/node/1960 |
| suits03_cc-by.zip | elvs_emt_uniform_jacket_male | clothes | CC-BY | CC BY 4.0 | Elvaerwyn | http://www.makehumancommunity.org/node/1953 |
| suits03_cc-by.zip | elvs_emt_uniform_pants_female | clothes | CC-BY | CC BY 4.0 | Elvaerwyn | http://www.makehumancommunity.org/node/1959 |
| suits03_cc-by.zip | elvs_emt_uniform_pants_male | clothes | CC-BY | CC BY 4.0 | Elvaerwyn | http://www.makehumancommunity.org/node/1954 |
| suits03_cc-by.zip | elvs_halter_style_pantsuit1 | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1924 |
| suits03_cc-by.zip | elvs_male_coveralls_1 | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2698 |
| suits03_cc-by.zip | elvs_racing_fire_suit_female1 | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2867 |
| suits03_cc-by.zip | elvs_racing_fire_suit_male1 | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2866 |
| suits03_cc-by.zip | elvs_sporty_tracksuit_hoodie_dress1 | clothes | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/2440 |
| suits03_cc-by.zip | grinsegold_mars_suit | clothes | CC-BY | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | grinsegold | http://www.makehumancommunity.org/node/858 |
| suits03_cc-by.zip | maciekg_wizard_robe | clothes | CC-BY | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | MaciekG | http://www.makehumancommunity.org/node/1482 |
| suits03_cc-by.zip | mindfront_f_ninja | clothes | CC-BY | CC BY 4.0 | Mindfront | http://www.makehumancommunity.org/node/896 |
| suits03_cc-by.zip | mindfront_m_suit_01 | clothes | CC-BY | CC BY 4.0 | Mindfront | http://www.makehumancommunity.org/node/390 |
| suits03_cc-by.zip | punkduck_diver_suit | clothes | CC-BY |  | punkduck | http://www.makehumancommunity.org/node/1274 |
| suits03_cc-by.zip | punkduck_short_bodysuit_female | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/855 |
| suits03_cc-by.zip | punkduck_tennis_dress | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/747 |
| suits03_cc-by.zip | punkduck_triathlon_suit_female | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/668 |
| suits03_cc-by.zip | punkduck_wetsuit | clothes | CC-BY | CC BY 3.0 (based on female_skinsuit01 of Freehunter) | punkduck | http://www.makehumancommunity.org/node/662 |
| suits03_cc-by.zip | tiomegamanx_skintight_body_suit_female | clothes | CC-BY | AGPL3 (see also http://www.CC0 | TioMegamanX | http://www.makehumancommunity.org/node/1604 |
| system_clothes_materials01_cc0.zip | toigo_male_casual_suit_01_khaki | material | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/996 |
| system_clothes_materials01_cc0.zip | toigo_male_casual_suit_01_purple_shirt | material | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/999 |
| system_clothes_materials01_cc0.zip | toigo_male_casual_suit_01_purple_shirt_with_black_jeans | material | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/998 |
| system_clothes_materials01_cc0.zip | toigo_male_casual_suit_01_red_shirt_with_black_jeans | material | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/997 |
| system_clothes_materials01_cc0.zip | toigo_male_casual_suit_01_teal_shirt_with_black_jeans | material | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/1001 |
| system_clothes_materials01_cc0.zip | toigo_male_casual_suit_01_white_shirt | material | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/1002 |
| system_clothes_materials01_cc0.zip | toigo_male_casual_suit_01_yellow_shirt | material | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/1004 |
| system_clothes_materials01_cc0.zip | toigo_male_elegant_suit_blue_pinstripe_with_paisley_tie | material | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/990 |
| system_clothes_materials01_cc0.zip | toigo_male_elegant_suit_blue_with_red_striped_tie | material | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/983 |
| system_clothes_materials01_cc0.zip | toigo_male_elegant_suit_brown | material | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/984 |
| system_clothes_materials01_cc0.zip | toigo_male_elegant_suit_burgundy | material | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/985 |
| system_clothes_materials01_cc0.zip | toigo_male_elegant_suit_eggplant | material | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/986 |
| system_clothes_materials01_cc0.zip | toigo_male_elegant_suit_gray | material | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/987 |
| system_clothes_materials01_cc0.zip | toigo_male_elegant_suit_gray_pinstripe_with_paisley_tie | material | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/989 |
| system_clothes_materials01_cc0.zip | toigo_male_elegant_suit_olive | material | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/988 |
| system_clothes_materials01_cc0.zip | toigo_male_elegant_suit_teal | material | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/991 |
| system_eye_materials01_cc0.zip | bobby_03_diffuse_amber_eyes | material | CC0 |  | bobby_03 | http://www.makehumancommunity.org/node/2340 |
| system_eye_materials01_cc0.zip | bobby_03_diffuse_blue_eyes | material | CC0 |  | bobby_03 | http://www.makehumancommunity.org/node/2341 |
| system_eye_materials01_cc0.zip | bobby_03_diffuse_grey_eyes | material | CC0 |  | bobby_03 | http://www.makehumancommunity.org/node/2342 |
| system_eye_materials01_cc0.zip | bobby_03_diffuse_hazel_eyes | material | CC0 |  | bobby_03 | http://www.makehumancommunity.org/node/2305 |
| system_eye_materials01_cc0.zip | bobby_03_diffuse_sea_breeze_eyes | material | CC0 |  | bobby_03 | http://www.makehumancommunity.org/node/2343 |
| system_eye_materials01_cc0.zip | mindfront_brown_eye_02 | material | CC0 |  | Mindfront | http://www.makehumancommunity.org/node/527 |
| system_eye_materials01_cc0.zip | nyloseth_sapphire_blue_eyes | material | CC0 |  | Nyloseth | http://www.makehumancommunity.org/node/1887 |
| system_eye_materials01_cc0.zip | spamrakuen_sr_anime_eyes_navy | material | CC0 |  | spamrakuen | http://www.makehumancommunity.org/node/3625 |
| system_eye_materials01_cc0.zip | spamrakuen_sr_anime_maid-san_blue_eyes | material | CC0 |  | spamrakuen | http://www.makehumancommunity.org/node/3346 |
| system_eye_materials01_cc0.zip | spamrakuen_sr_anime_maid-san_red_eyes | material | CC0 |  | spamrakuen | http://www.makehumancommunity.org/node/3427 |
| system_eye_materials01_cc0.zip | wojackowl_blue_eyes_toon | material | CC0 |  | WojackOWL | http://www.makehumancommunity.org/node/3481 |
| system_eye_materials01_cc0.zip | wojackowl_brown_eyes_toon | material | CC0 |  | WojackOWL | http://www.makehumancommunity.org/node/3480 |
| system_eye_materials01_cc0.zip | wojackowl_green_eyes_toon | material | CC0 |  | WojackOWL | http://www.makehumancommunity.org/node/3482 |
| system_eye_materials02_cc0.zip | bobby_03_daz_dragon_eyes | material | CC0 |  | bobby_03 | http://www.makehumancommunity.org/node/2443 |
| system_eye_materials02_cc0.zip | culturalibre_6_eyes | material | CC0 |  | culturalibre | http://www.makehumancommunity.org/node/3263 |
| system_eye_materials02_cc0.zip | culturalibre_hero_white_eyes | material | CC0 |  | culturalibre | http://www.makehumancommunity.org/node/2123 |
| system_eye_materials02_cc0.zip | culturalibre_hero_yellow_eyes | material | CC0 |  | culturalibre | http://www.makehumancommunity.org/node/3243 |
| system_eye_materials02_cc0.zip | culturalibre_zombie_eyes | material | CC0 |  | culturalibre | http://www.makehumancommunity.org/node/2531 |
| system_eye_materials02_cc0.zip | gpedroso_blank_eye | material | CC0 |  | gpedroso | http://www.makehumancommunity.org/node/1066 |
| system_eye_materials02_cc0.zip | hatshj_alien_eye_2 | material | CC0 |  | Hatshj | http://www.makehumancommunity.org/node/321 |
| system_eye_materials02_cc0.zip | hatshj_alien_eyes | material | CC0 |  | Hatshj | http://www.makehumancommunity.org/node/320 |
| system_eye_materials02_cc0.zip | hatshj_cross_eye | material | CC0 |  | Hatshj | http://www.makehumancommunity.org/node/322 |
| system_eye_materials02_cc0.zip | hatshj_facette_eye | material | CC0 |  | Hatshj | http://www.makehumancommunity.org/node/323 |
| system_eye_materials02_cc0.zip | hatshj_facette_eye_2 | material | CC0 |  | Hatshj | http://www.makehumancommunity.org/node/324 |
| system_eye_materials02_cc0.zip | hatshj_reptile_eyes | material | CC0 |  | Hatshj | http://www.makehumancommunity.org/node/325 |
| system_eye_materials02_cc0.zip | nyloseth_bluecateyes | material | CC0 |  | Nyloseth | http://www.makehumancommunity.org/node/1891 |
| system_eye_materials02_cc0.zip | nyloseth_brown_cat_eyes | material | CC0 |  | Nyloseth | http://www.makehumancommunity.org/node/1892 |
| system_eye_materials02_cc0.zip | nyloseth_green_cat_eyes | material | CC0 |  | Nyloseth | http://www.makehumancommunity.org/node/1911 |
| system_eye_materials02_cc0.zip | nyloseth_sapphire_cat_eyes | material | CC0 |  | Nyloseth | http://www.makehumancommunity.org/node/1912 |
| system_eye_materials02_cc0.zip | nyloseth_yellow_cat_eyes | material | CC0 |  | Nyloseth | http://www.makehumancommunity.org/node/1913 |
| system_eye_materials02_cc0.zip | sonntag78_orcifyhead_eye | material | CC0 |  | sonntag78 | http://www.makehumancommunity.org/node/216 |
| system_eye_materials02_cc0.zip | titleknown_trans_eyes | material | CC0 |  | titleknown | http://www.makehumancommunity.org/node/3156 |
| system_eye_materials03_cc-by.zip | callharvey3d_harvey_eye1 | material | CC-BY |  | callharvey3d | http://www.makehumancommunity.org/node/489 |
| system_eye_materials03_cc-by.zip | callharvey3d_harvey_eye2 | material | CC-BY |  | callharvey3d | http://www.makehumancommunity.org/node/490 |
| system_eye_materials03_cc-by.zip | culturalibre_snake_eyes | material | CC-BY |  | culturalibre | http://www.makehumancommunity.org/node/3021 |
| system_eye_materials03_cc-by.zip | culturalibre_target_eyes | material | CC-BY |  | culturalibre | http://www.makehumancommunity.org/node/3077 |
| system_eye_materials03_cc-by.zip | elvs_anime_eye_1 | material | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/1253 |
| system_eye_materials03_cc-by.zip | elvs_bads_hippy-cat_eye | material | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/1051 |
| system_eye_materials03_cc-by.zip | elvs_bionic_eye_red | material | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/1050 |
| system_eye_materials03_cc-by.zip | elvs_blurple_eye | material | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/1347 |
| system_eye_materials03_cc-by.zip | elvs_catyellow_rainbow_eye | material | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/1345 |
| system_eye_materials03_cc-by.zip | elvs_devilian_eye1 | material | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/1349 |
| system_eye_materials03_cc-by.zip | elvs_earth_moon_eyes | material | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/1053 |
| system_eye_materials03_cc-by.zip | elvs_fruitcake_eyes | material | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/1343 |
| system_eye_materials03_cc-by.zip | elvs_fushia_rainbow_eye | material | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/1342 |
| system_eye_materials03_cc-by.zip | elvs_midnight_rainbow_eyes | material | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/1346 |
| system_eye_materials03_cc-by.zip | elvs_rainbow_hueshift_eyes | material | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/1086 |
| system_eye_materials03_cc-by.zip | elvs_santa_helpers_eyes | material | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/1254 |
| system_eye_materials03_cc-by.zip | elvs_saphire_rainbow_eyes | material | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/1344 |
| system_eye_materials03_cc-by.zip | elvs_sunspot_eyes | material | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/1052 |
| system_eye_materials03_cc-by.zip | elvs_zfashion_eye1 | material | CC-BY |  | Elvaerwyn | http://www.makehumancommunity.org/node/1348 |
| system_eye_materials03_cc-by.zip | mtknife_violet_eyes | material | CC-BY |  | MTKnife | http://www.makehumancommunity.org/node/243 |
| system_hair_materials01_cc0 (1).zip | bogdan666_short_02_brown | material | CC0 |  | bogdan666 | http://www.makehumancommunity.org/node/1937 |
| system_hair_materials01_cc0 (1).zip | bogdan666_short_02_gray | material | CC0 |  | bogdan666 | http://www.makehumancommunity.org/node/1941 |
| system_hair_materials01_cc0 (1).zip | bogdan666_short_02_red | material | CC0 |  | bogdan666 | http://www.makehumancommunity.org/node/1939 |
| system_hair_materials01_cc0 (1).zip | culturalibre_short_02_green | material | CC0 |  | culturalibre | http://www.makehumancommunity.org/node/3193 |
| system_hair_materials01_cc0 (1).zip | dariush086_ponytail01_black | material | CC0 |  | dariush086 | http://www.makehumancommunity.org/node/2678 |
| system_hair_materials01_cc0 (1).zip | dariush086_ponytail01_brown | material | CC0 |  | dariush086 | http://www.makehumancommunity.org/node/2679 |
| system_hair_materials01_cc0 (1).zip | dariush086_ponytail01_gold | material | CC0 |  | dariush086 | http://www.makehumancommunity.org/node/2677 |
| system_hair_materials01_cc0 (1).zip | dariush086_ponytail01_green | material | CC0 |  | dariush086 | http://www.makehumancommunity.org/node/2676 |
| system_hair_materials01_cc0 (1).zip | dariush086_ponytail01_pink | material | CC0 |  | dariush086 | http://www.makehumancommunity.org/node/2675 |
| system_hair_materials01_cc0 (1).zip | dariush086_ponytail01_platinum | material | CC0 |  | dariush086 | http://www.makehumancommunity.org/node/2680 |
| system_hair_materials01_cc0 (1).zip | dariush086_ponytail01_red | material | CC0 |  | dariush086 | http://www.makehumancommunity.org/node/2681 |
| system_hair_materials01_cc0 (1).zip | dariush086_ponytail01_violet | material | CC0 |  | dariush086 | http://www.makehumancommunity.org/node/2674 |
| system_hair_materials01_cc0 (1).zip | joepal_long_01_blond | material | CC0 |  | Joel Palmius | http://www.makehumancommunity.org/node/1747 |
| system_hair_materials01_cc0 (1).zip | mtknife_ponytail01_deep_red | material | CC0 |  | MTKnife | http://www.makehumancommunity.org/node/886 |
| system_hair_materials01_cc0 (1).zip | toigo_braid01_ash | material | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/1175 |
| system_hair_materials01_cc0 (1).zip | toigo_braid01_black | material | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/1176 |
| system_hair_materials01_cc0 (1).zip | toigo_braid01_fuchsia | material | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/1177 |
| system_hair_materials01_cc0 (1).zip | toigo_braid01_ginger | material | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/1178 |
| system_hair_materials01_cc0 (1).zip | toigo_braid01_golden | material | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/1179 |
| system_hair_materials01_cc0 (1).zip | toigo_braid01_gray | material | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/1180 |
| system_hair_materials01_cc0 (1).zip | toigo_braid01_red | material | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/1181 |
| system_hair_materials01_cc0 (1).zip | toigo_braid01_strawberry | material | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/1182 |
| system_hair_materials01_cc0 (1).zip | toigo_braid01_teal | material | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/1183 |
| system_hair_materials01_cc0 (1).zip | toigo_braid01_violet | material | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/1184 |
| system_hair_materials01_cc0 (1).zip | toigo_long_01_ash | material | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/1167 |
| system_hair_materials01_cc0 (1).zip | toigo_long_01_black | material | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/1168 |
| system_hair_materials01_cc0 (1).zip | toigo_long_01_fuchsia | material | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/1169 |
| system_hair_materials01_cc0 (1).zip | toigo_long_01_ginger | material | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/1170 |
| system_hair_materials01_cc0 (1).zip | toigo_long_01_gray | material | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/1171 |
| system_hair_materials01_cc0 (1).zip | toigo_long_01_red | material | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/1172 |
| system_hair_materials01_cc0 (1).zip | toigo_long_01_teal | material | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/1173 |
| system_hair_materials01_cc0 (1).zip | toigo_long_01_violet | material | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/1174 |
| system_hair_materials01_cc0 (1).zip | toigo_short_04_auburn | material | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/1005 |
| system_hair_materials01_cc0 (1).zip | toigo_short_04_blonde | material | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/1006 |
| system_hair_materials01_cc0 (1).zip | toigo_short_04_blue | material | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/1007 |
| system_hair_materials01_cc0 (1).zip | toigo_short_04_brown | material | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/1008 |
| system_hair_materials01_cc0 (1).zip | toigo_short_04_ginger | material | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/1009 |
| system_hair_materials01_cc0 (1).zip | toigo_short_04_gray | material | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/1010 |
| system_hair_materials02_cc0 (1).zip | elvaerwyn_bob_01_blood_copper | material | CC0 |  | Elvaerwyn | http://www.makehumancommunity.org/node/1294 |
| system_hair_materials02_cc0 (1).zip | elvaerwyn_bob_01_dark_lime_gold | material | CC0 |  | Elvaerwyn | http://www.makehumancommunity.org/node/1297 |
| system_hair_materials02_cc0 (1).zip | elvaerwyn_bob_01_flat_black | material | CC0 |  | Elvaerwyn | http://www.makehumancommunity.org/node/1295 |
| system_hair_materials02_cc0 (1).zip | elvaerwyn_bob_01_gothic_brown | material | CC0 |  | Elvaerwyn | http://www.makehumancommunity.org/node/1296 |
| system_hair_materials02_cc0 (1).zip | elvaerwyn_bob_01_new_gold | material | CC0 |  | Elvaerwyn | http://www.makehumancommunity.org/node/1298 |
| system_hair_materials02_cc0 (1).zip | elvaerwyn_bob_01_old_gold | material | CC0 |  | Elvaerwyn | http://www.makehumancommunity.org/node/1299 |
| system_hair_materials02_cc0 (1).zip | elvaerwyn_bob_01_old_world_mermaid | material | CC0 |  | Elvaerwyn | http://www.makehumancommunity.org/node/1300 |
| system_hair_materials02_cc0 (1).zip | elvaerwyn_bob_01_veronika | material | CC0 |  | Elvaerwyn | http://www.makehumancommunity.org/node/1301 |
| system_hair_materials02_cc0 (1).zip | elvaerwyn_bob_02_50s_cherrybomb | material | CC0 |  | Elvaerwyn | http://www.makehumancommunity.org/node/1285 |
| system_hair_materials02_cc0 (1).zip | elvaerwyn_bob_02_candy_fushia | material | CC0 |  | Elvaerwyn | http://www.makehumancommunity.org/node/1286 |
| system_hair_materials02_cc0 (1).zip | elvaerwyn_bob_02_honey_blonde | material | CC0 |  | Elvaerwyn | http://www.makehumancommunity.org/node/1287 |
| system_hair_materials02_cc0 (1).zip | elvaerwyn_bob_02_platinum | material | CC0 |  | Elvaerwyn | http://www.makehumancommunity.org/node/1288 |
| system_hair_materials02_cc0 (1).zip | elvaerwyn_bob_02_pumpkin | material | CC0 |  | Elvaerwyn | http://www.makehumancommunity.org/node/1289 |
| system_hair_materials02_cc0 (1).zip | elvaerwyn_bob_02_retro_black | material | CC0 |  | Elvaerwyn | http://www.makehumancommunity.org/node/1290 |
| system_hair_materials02_cc0 (1).zip | elvaerwyn_bob_02_retro_grey | material | CC0 |  | Elvaerwyn | http://www.makehumancommunity.org/node/1291 |
| system_hair_materials02_cc0 (1).zip | elvaerwyn_bob_02_retro_oilslickster | material | CC0 |  | Elvaerwyn | http://www.makehumancommunity.org/node/1292 |
| system_hair_materials02_cc0 (1).zip | elvaerwyn_bob_02_tangerine | material | CC0 |  | Elvaerwyn | http://www.makehumancommunity.org/node/1293 |
| system_hair_materials02_cc0 (1).zip | jartur69_bob02_dark_blond | material | CC0 |  | jartur69 | http://www.makehumancommunity.org/node/1539 |
| system_hair_materials02_cc0 (1).zip | jartur69_bob02_dark_ginger | material | CC0 |  | jartur69 | http://www.makehumancommunity.org/node/1542 |
| system_hair_materials02_cc0 (1).zip | jartur69_bob02_ginger | material | CC0 |  | jartur69 | http://www.makehumancommunity.org/node/1541 |
| system_hair_materials02_cc0 (1).zip | jartur69_bob02_light_ginger | material | CC0 |  | jartur69 | http://www.makehumancommunity.org/node/1540 |
| system_hair_materials02_cc0 (1).zip | jartur69_short01_brown | material | CC0 |  | jartur69 | http://www.makehumancommunity.org/node/1511 |
| system_hair_materials02_cc0 (1).zip | jartur69_short01_dark_ginger | material | CC0 |  | jartur69 | http://www.makehumancommunity.org/node/1513 |
| system_hair_materials02_cc0 (1).zip | jartur69_short01_rustbrown | material | CC0 |  | jartur69 | http://www.makehumancommunity.org/node/1512 |
| system_hair_materials02_cc0 (1).zip | jartur69_short02_blond | material | CC0 |  | jartur69 | http://www.makehumancommunity.org/node/1509 |
| system_hair_materials02_cc0 (1).zip | jartur69_short02_blond_for_female | material | CC0 |  | jartur69 | http://www.makehumancommunity.org/node/1510 |
| system_hair_materials02_cc0 (1).zip | punkduck_blond_for_long01 | material | CC0 |  | punkduck | http://www.makehumancommunity.org/node/512 |
| system_hair_materials02_cc0 (1).zip | toigo_short_04_green | material | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/1011 |
| system_hair_materials02_cc0 (1).zip | toigo_short_04_violet | material | CC0 |  | MargaretToigo | http://www.makehumancommunity.org/node/1012 |
| underwear01_cc0.zip | kwnet_at_pantyhose01 | clothes | CC0 | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | kwnet_at | http://www.makehumancommunity.org/node/927 |
| underwear01_cc0.zip | marco_105_armsleeve02 | clothes | CC0 | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | Marco_105 | http://www.makehumancommunity.org/node/352 |
| underwear01_cc0.zip | marco_105_stocking01 | clothes | CC0 | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | Marco_105 | http://www.makehumancommunity.org/node/348 |
| underwear01_cc0.zip | marco_105_stocking02 | clothes | CC0 | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | Marco_105 | http://www.makehumancommunity.org/node/349 |
| underwear01_cc0.zip | punkduck_strappy_lace_thong | clothes | CC0 | CC BY 4.0 | punkduck | http://www.makehumancommunity.org/node/1166 |
| underwear01_cc0.zip | v0rt3x_armsleeves_black_fishnet_large | clothes | CC0 | CC0 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | V0rT3X | http://www.makehumancommunity.org/node/305 |
| underwear01_cc0.zip | v0rt3x_armsleeves_black_fishnet_medium | clothes | CC0 | CC0 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | V0rT3X | http://www.makehumancommunity.org/node/304 |
| underwear01_cc0.zip | v0rt3x_armsleeves_black_fishnet_small | clothes | CC0 | CC0 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | V0rT3X | http://www.makehumancommunity.org/node/303 |
| underwear01_cc0.zip | v0rt3x_armsleeves_white_fishnet_large | clothes | CC0 | CC0 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | V0rT3X | http://www.makehumancommunity.org/node/302 |
| underwear01_cc0.zip | v0rt3x_armsleeves_white_fishnet_medium | clothes | CC0 | CC0 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | V0rT3X | http://www.makehumancommunity.org/node/301 |
| underwear01_cc0.zip | v0rt3x_armsleeves_white_fishnet_small | clothes | CC0 | CC0 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | V0rT3X | http://www.makehumancommunity.org/node/300 |
| underwear01_cc0.zip | v0rt3x_stockings_black_fishnet_large | clothes | CC0 | CC0 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | V0rT3X | http://www.makehumancommunity.org/node/296 |
| underwear01_cc0.zip | v0rt3x_stockings_black_fishnet_medium | clothes | CC0 | CC0 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | V0rT3X | http://www.makehumancommunity.org/node/295 |
| underwear01_cc0.zip | v0rt3x_stockings_black_fishnet_small | clothes | CC0 | CC0 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | V0rT3X | http://www.makehumancommunity.org/node/294 |
| underwear01_cc0.zip | v0rt3x_stockings_white_fishnet_large | clothes | CC0 | CC0 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | V0rT3X | http://www.makehumancommunity.org/node/299 |
| underwear01_cc0.zip | v0rt3x_stockings_white_fishnet_medium | clothes | CC0 | CC0 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | V0rT3X | http://www.makehumancommunity.org/node/298 |
| underwear01_cc0.zip | v0rt3x_stockings_white_fishnet_small | clothes | CC0 | CC0 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | V0rT3X | http://www.makehumancommunity.org/node/297 |
| underwear01_cc0.zip | wolgade_female_panties_01 | clothes | CC0 | CC0 | wolgade | http://www.makehumancommunity.org/node/338 |
| underwear01_cc0.zip | wolgade_female_top_01 | clothes | CC0 | CC0 | wolgade | http://www.makehumancommunity.org/node/339 |
| underwear02_cc0.zip | elvs_bow_bottom_panty | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1665 |
| underwear02_cc0.zip | elvs_bow_front_bra | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1666 |
| underwear02_cc0.zip | elvs_crude_bootyshorts | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1718 |
| underwear02_cc0.zip | elvs_lace_panty | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1931 |
| underwear02_cc0.zip | jaldmic_stockings | clothes | CC-BY | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | JALdMIC | http://www.makehumancommunity.org/node/3011 |
| underwear02_cc0.zip | mindfront_bikini_01 | clothes | CC-BY | CC BY 4.0 | Mindfront | http://www.makehumancommunity.org/node/336 |
| underwear02_cc0.zip | punkduck_babydoll | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/406 |
| underwear02_cc0.zip | punkduck_bandeau_bikini_bra | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/460 |
| underwear02_cc0.zip | punkduck_bandeau_bikini_slip | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/461 |
| underwear02_cc0.zip | punkduck_bandeau_bra | clothes | CC-BY | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | punkduck | http://www.makehumancommunity.org/node/385 |
| underwear02_cc0.zip | punkduck_bikini02_bra | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/513 |
| underwear02_cc0.zip | punkduck_bikini02_slip | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/514 |
| underwear02_cc0.zip | punkduck_brazilian_bikini_bra | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/429 |
| underwear02_cc0.zip | punkduck_brazilian_bikini_slip | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/430 |
| underwear02_cc0.zip | punkduck_french_lingerie_bra | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/470 |
| underwear02_cc0.zip | punkduck_french_lingerie_mini_briefs | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/471 |
| underwear02_cc0.zip | punkduck_french_lingerie_stockings | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/932 |
| underwear02_cc0.zip | punkduck_french_lingerie_suspender_belt | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/930 |
| underwear02_cc0.zip | punkduck_french_lingerie_thong | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/1064 |
| underwear02_cc0.zip | punkduck_frill_bikini_bottom | clothes | CC-BY | CC BY 4.0 | punkduck | http://www.makehumancommunity.org/node/1504 |
| underwear02_cc0.zip | punkduck_frill_bikini_top | clothes | CC-BY | CC BY 4.0 | punkduck | http://www.makehumancommunity.org/node/1505 |
| underwear02_cc0.zip | punkduck_sport_bra | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/1225 |
| underwear02_cc0.zip | punkduck_sport_briefs | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/749 |
| underwear02_cc0.zip | punkduck_string_2 | clothes | CC-BY | CC BY 3.0 (see also https://creativecommons.org/licenses/by/3.0/ ) | punkduck | http://www.makehumancommunity.org/node/404 |
| underwear02_cc0.zip | punkduck_string_4 | clothes | CC-BY | AGPL3 (see also http://www.makehuman.org/doc/node/external_tools_license.html) | punkduck | http://www.makehumancommunity.org/node/387 |
| underwear02_cc0.zip | punkduck_string_5 | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/542 |
| underwear02_cc0.zip | punkduck_teddy_erotic_lingerie | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/424 |
| underwear02_cc0.zip | punkduck_transparent_bra | clothes | CC-BY | CC BY 3.0 (see also https://creativecommons.org/licenses/by/3.0/ ) | punkduck | http://www.makehumancommunity.org/node/405 |
| underwear03_cc-by.zip | elvs_all_tied_up_bikini | clothes | CC-BY | CC-by | Elvaerwyn | http://www.makehumancommunity.org/node/1492 |
| underwear03_cc-by.zip | elvs_bandeau_swimwear_top_1 | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1956 |
| underwear03_cc-by.zip | elvs_camisole1 | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1930 |
| underwear03_cc-by.zip | elvs_swimwear_micro_shorts | clothes | CC-BY | CC_by | Elvaerwyn | http://www.makehumancommunity.org/node/1957 |
| underwear03_cc-by.zip | elvs_vintage_swimwear1_50s_strapless | clothes | CC-BY | CC-by | Elvaerwyn | http://www.makehumancommunity.org/node/1495 |
| underwear03_cc-by.zip | joepal_plain_bra | clothes | CC-BY |  | Joel Palmius | http://www.makehumancommunity.org/node/3384 |
| underwear03_cc-by.zip | mindfront_f_one-piece_swimsuit_01 | clothes | CC-BY | CC BY 4.0 | Mindfront | http://www.makehumancommunity.org/node/331 |
| underwear03_cc-by.zip | punkduck_female_strapless_bodysuit | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/816 |
| underwear03_cc-by.zip | punkduck_halterneck_romper | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/803 |
| underwear03_cc-by.zip | punkduck_one_piece_bikini01 | clothes | CC-BY | CC BY 4.0 | punkduck | http://www.makehumancommunity.org/node/1483 |
| underwear03_cc-by.zip | punkduck_shapewear | clothes | CC-BY | CC BY 3.0 | punkduck | http://www.makehumancommunity.org/node/555 |
| underwear04_cc0.zip | joepal_crude_high_socks | clothes | CC0 | CC0 | Joel Palmius | http://www.makehumancommunity.org/node/25 |
| underwear04_cc0.zip | joepal_crude_low_socks | clothes | CC0 | CC0 | Joel Palmius | http://www.makehumancommunity.org/node/32 |
| underwear04_cc0.zip | toigo_lace_frill_socks | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1078 |
| underwear04_cc0.zip | toigo_leg_warmer_socks | clothes | CC0 | CC0 | MargaretToigo | http://www.makehumancommunity.org/node/1092 |
