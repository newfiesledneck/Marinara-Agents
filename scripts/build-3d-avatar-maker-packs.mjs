// Build the 3D Avatar Maker's wardrobe packs (packages/3d-avatar-maker/assets/packs.json): asset-only packages
// of community MakeHuman clothes the maker's Clothes tab offers beside its own. For each pack it packs the
// fitted pieces (assets/models/packs/<id>/outfit-<piece>.glb, written by assets/scripts/make_mh_packs.py) into
// wardrobe/<group>.pack.png bundles in the maker's own bundle format, writes the pack's index
// avatar-pack.json, stamps the manifest, the inert agent stub and the English locale, writes a reproducible
// artifact zip, and updates the catalog family. A pack has no client and no server.
//
//   node scripts/build-3d-avatar-maker-packs.mjs            (every pack)
//   node scripts/build-3d-avatar-maker-packs.mjs <pack id>  (some)
//
// ffmpeg must be on PATH, or set FFMPEG. What the maker accepts from a pack: packages/3d-avatar-maker/src/packs.js.
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CLOTH_SLOTS,
  HAIRSTYLES,
  PIECE_BONES,
  SLOT_OF,
  UNDERWEAR_SLOTS,
} from "../packages/3d-avatar-maker/src/looks.js";
import { MESH_KINDS, writePacked } from "./3d-avatar-maker-packed.mjs";
import { bodyReach, bundler, packHairStyles, packOutfitPieces } from "./build-3d-avatar-maker-kit.mjs";
import { catalogArtworkUrl } from "./catalog-artwork.mjs";
import { readCatalogFamily, writeCatalogFamily } from "./catalog-lanes.mjs";
import { withPackageActivationGuidance } from "./catalog-package-guidance.mjs";
import { createDeterministicZip, zipSizeCheck } from "./deterministic-zip.mjs";
import { writeEnglishPackageLocale } from "./package-locales.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const makerRoot = join(repoRoot, "packages/3d-avatar-maker");
const artifactsDir = join(repoRoot, "artifacts");
const MODELS = join(makerRoot, "assets/models");

// Each pack's version (+0.0.01 for every committed rebuild, with a CHANGELOG.md entry, as the maker's).
// (Everyday Women's, Everyday Men's, Historical and Fantasy, and Modern Casual were merged into Clothes and
// Accessories, keeping every piece id; their old artifacts stay for installs that have them.)
const VERSIONS = {
  "3d-avatar-maker-wardrobe-clothes": "0.1.03",
  "3d-avatar-maker-wardrobe-accessories": "0.2.04",
};
// A piece's bundle: its slot's group (looks.js CLOTH_SLOTS), or "underwear" for an underwear slot
// (UNDERWEAR_SLOTS: a choice in the maker's Underwear lists, always the innermost layer).
const isUnderwear = (slot) => UNDERWEAR_SLOTS.some(([each]) => each === slot);
const groupOf = (slot) => (isUnderwear(slot) ? "underwear" : CLOTH_SLOTS.find(([each]) => each === slot)?.[3]);
const FAMILY = "3d-avatar-maker-wardrobe-";
// The bodies the pieces are fitted to (src/packs.js BODY_REVISION: the bodies made in 0.1.02), and the first
// maker that reads packs (a pack's own `maker` in packs.json when it needs a later one, for its slots).
const BODY_REVISION = 1;
const MAKER_VERSION = "0.1.03";
// The maker's own Capability API, Engine provenance and range: a pack is only of use beside it.
const ENGINE_MIN = "2.4.6";
const MAX_ENGINE_EXCLUSIVE = "4.0.0";
const boundary = JSON.parse(await readFile(join(makerRoot, "engine-boundary.json"), "utf8"));
const LICENCES = new Set(["CC0-1.0", "CC-BY-3.0", "CC-BY-4.0"]);
// The most a hair style's `swing` may be: how far below the eyes, in metres (src/packs.js MOST_SWING).
const MOST_SWING = 0.3;
// Where a piece's cloth may leave the body to hang: a share of the hips-to-knees distance (src/packs.js HANG_RANGE).
const HANG_RANGE = [-1, 1.5];

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
/** A CC-BY piece's attribution (title, author, source, licence and the change made), as a saved avatar carries it. */
const creditLine = (spec, licence) => {
  const version = licence.slice("CC-BY-".length);
  const item = spec.src.split("/").pop();
  return `"${item}" by ${spec.author} (${spec.source}), CC BY ${version} (https://creativecommons.org/licenses/by/${version}/), fitted to 3D Avatar Maker's bodies by ThatOneCan`;
};
const { packs } = JSON.parse(await readFile(join(makerRoot, "assets/packs.json"), "utf8"));
const only = process.argv.slice(2);
for (const id of only) if (!packs[id]) throw new Error(`No pack ${id} in packages/3d-avatar-maker/assets/packs.json`);

// Each body's key reach and distant share, read once (followBody: a piece's keys move it only where they move the body).
const { reach, shares } = bodyReach(MODELS);
const { catalog } = await readCatalogFamily(repoRoot);
// A wardrobe pack no longer in packs.json leaves the catalog (its package folder is gone, as build-agent-catalog.mjs
// drops a package without one).
catalog.packages = catalog.packages.filter(
  (entry) => !entry.manifest.id.startsWith(FAMILY) || Object.hasOwn(packs, entry.manifest.id),
);

for (const [id, pack] of Object.entries(packs)) {
  if (only.length && !only.includes(id)) continue;
  const version = VERSIONS[id];
  const maker = pack.maker ?? MAKER_VERSION;
  if (!version) throw new Error(`${id}: add its version to VERSIONS in scripts/build-3d-avatar-maker-packs.mjs`);
  const packageRoot = join(repoRoot, "packages", id);
  const models = join(MODELS, "packs", id);

  // ── The pieces and hair styles: bundles in the maker's format, every picture named for the pack ──
  // (A pack's `hair` is optional: its styles are avatar-hair-<style>.glb beside the pieces, each its own bundle.)
  const pieceSpecs = pack.pieces ?? {};
  const hairSpecs = pack.hair ?? {};
  const listed = existsSync(models) ? await readdir(models) : [];
  const files = listed.filter((name) => /^outfit-[a-z0-9_]+\.glb$/u.test(name)).sort();
  const hairFiles = listed.filter((name) => /^avatar-hair-[a-z0-9_]+\.glb$/u.test(name)).sort();
  for (const [prefix, specs, kind] of [
    ["outfit-", pieceSpecs, "pieces"],
    ["avatar-hair-", hairSpecs, "hair"],
  ]) {
    const fitted = (kind === "hair" ? hairFiles : files).map((file) => file.slice(prefix.length, -4));
    const missing = Object.keys(specs).filter((name) => !fitted.includes(name));
    if (missing.length) throw new Error(`${id}: fit ${missing.join(", ")} first (assets/scripts/make_mh_packs.py)`);
    const stray = fitted.filter((name) => !specs[name]);
    if (stray.length) throw new Error(`${id}: ${stray.join(", ")} fitted but not in assets/packs.json's ${kind}`);
  }
  for (const folder of ["wardrobe", "hair"]) await rm(join(packageRoot, folder), { recursive: true, force: true });
  await mkdir(join(packageRoot, "wardrobe"), { recursive: true });
  if (hairFiles.length) await mkdir(join(packageRoot, "hair"), { recursive: true });
  const source = `Clothes: MakeHuman community (CC0 and as each piece says), fitted in Blender by ThatOneCan (packages/3d-avatar-maker/assets/scripts/make_mh_packs.py)`;
  const bundles = bundler(source);
  const outfits = packOutfitPieces({
    dir: models,
    files,
    reach,
    shares,
    bundler: bundles,
    slotOf: (piece, file) => {
      const slot = pieceSpecs[piece].slot;
      if (!groupOf(slot)) throw new Error(`${file}: "${slot}" isn't a CLOTH_SLOTS or UNDERWEAR_SLOTS slot`);
      return slot;
    },
    bundleOf: (slot) => {
      const name = `wardrobe/${groupOf(slot)}.pack.png`;
      return [name, join(packageRoot, name)];
    },
    // (The maker caches pictures by name, so a pack's are named for it.)
    pictureName: (piece, image) => `${id}-${piece}-${image}`,
  });
  const hairIndex = packHairStyles({
    dir: models,
    files: hairFiles,
    reach,
    shares,
    bundler: bundles,
    // (A bundle each: wearing one style fetches only that style.)
    bundleOf: (style) => {
      const name = `hair/${style}.pack.png`;
      return [name, join(packageRoot, name)];
    },
    pictureName: (style, image) => `${id}-hair-${style}-${image}`,
  });
  for (const [path, bundle] of bundles.bundles) writePacked(path, bundle, MESH_KINDS);

  // ── avatar-pack.json: what the maker reads first (src/packs.js readPack and readHair) ──
  /** An entry's licence and its credit, after checking its id, label, author and licence. */
  const licensed = (name, spec) => {
    const licence = spec.licence ?? pack.licence;
    const credit = licence === "CC0-1.0" ? null : creditLine(spec, licence);
    if (!/^[a-z0-9_]{1,64}$/u.test(name)) throw new Error(`${id}: id "${name}"`);
    if (!spec.label || spec.label.length > 60 || !spec.author || spec.author.length > 80)
      throw new Error(`${id} ${name}: a label of at most 60 characters and an author of at most 80`);
    if (!LICENCES.has(licence) || (licence !== "CC0-1.0") !== Boolean(credit))
      throw new Error(`${id} ${name}: licence ${licence} with credit ${credit} (CC-BY needs a credit, CC0 none)`);
    return { licence, credit };
  };
  const pieces = {};
  for (const piece of Object.keys(outfits).sort()) {
    const spec = pieceSpecs[piece];
    const info = outfits[piece];
    const entry = bundles.bundles.get(join(packageRoot, info.bundle)).pieces[piece];
    const { licence, credit } = licensed(piece, spec);
    if (info.variants?.length) throw new Error(`${id} ${piece}: the maker offers no pack variants yet`);
    // (The bone it's fixed to: packs.json's, else its model's. A slot for held things has its own: looks.js boneOf.)
    const bone = spec.bone ?? info.bone;
    if (bone !== undefined && !PIECE_BONES.includes(bone))
      throw new Error(
        `${id} ${piece}: bone "${bone}" isn't one of PIECE_BONES in packages/3d-avatar-maker/src/looks.js`,
      );
    if (
      spec.hang !== undefined &&
      !(Number.isFinite(spec.hang) && spec.hang >= HANG_RANGE[0] && spec.hang <= HANG_RANGE[1])
    )
      throw new Error(`${id} ${piece}: hang is a share of the hips-to-knees distance, ${HANG_RANGE.join(" to ")}`);
    if (spec.noUnderwear !== undefined && typeof spec.noUnderwear !== "boolean")
      throw new Error(`${id} ${piece}: noUnderwear is true or false`);
    // (Underwear is the innermost layer, hides no other underwear, and says whether the underwear's colour
    // dyes it: `tint`, a grey picture under its parts' colours. A piece fitted before its slot moved keeps
    // the layer and hide words it was fitted with in its model; they're read the same way.)
    const under = isUnderwear(info.slot);
    pieces[piece] = {
      label: spec.label,
      slot: info.slot,
      bodies: info.bodies,
      layer: under ? 0 : entry.layer,
      hides: under ? entry.hides.filter((word) => !word.startsWith("underwear")) : entry.hides,
      parts: info.parts,
      variants: [],
      bundle: info.bundle,
      licence,
      author: spec.author,
      source: spec.source,
      credit,
      ...(bone === undefined ? {} : { bone }),
      ...(spec.hang === undefined ? {} : { hang: spec.hang }),
      ...(spec.noUnderwear ? { noUnderwear: true } : {}),
      ...(under && spec.tex === "tint" ? { tint: true } : {}),
    };
  }
  const hair = {};
  for (const style of Object.keys(hairIndex).sort()) {
    const spec = hairSpecs[style];
    const { licence, credit } = licensed(style, spec);
    if (Object.hasOwn(SLOT_OF, style) || HAIRSTYLES.some(([name]) => name === style) || pieces[style])
      throw new Error(`${id}: hair style id "${style}" is taken by a kit style, a kit piece or a piece of this pack`);
    if (spec.swing !== undefined && !(Number.isFinite(spec.swing) && spec.swing >= 0 && spec.swing <= MOST_SWING))
      throw new Error(`${id} ${style}: swing is metres below the eyes, 0 to ${MOST_SWING}`);
    hair[style] = {
      label: spec.label,
      bodies: hairIndex[style].bodies,
      bundle: hairIndex[style].bundle,
      licence,
      author: spec.author,
      source: spec.source,
      credit,
      ...(spec.swing === undefined ? {} : { swing: spec.swing }),
    };
  }
  if (!pack.name || pack.name.length > 80) throw new Error(`${id}: a name of at most 80 characters`);
  const index = {
    format: 1,
    for: "3d-avatar-maker",
    body: BODY_REVISION,
    maker,
    name: pack.name,
    pieces,
    ...(Object.keys(hair).length ? { hair } : {}),
  };
  const indexBuffer = Buffer.from(`${JSON.stringify(index, null, 1)}\n`);
  await writeFile(join(packageRoot, "avatar-pack.json"), indexBuffer);
  const bundlePaths = [
    ...new Set([...Object.values(pieces), ...Object.values(hair)].map((entry) => entry.bundle)),
  ].sort();
  const assets = [{ path: "avatar-pack.json", buffer: indexBuffer }];
  for (const path of bundlePaths) assets.push({ path, buffer: await readFile(join(packageRoot, path)) });

  // ── Agent definition stub: satisfies the catalog loader; runtime-inert (the maker's own) ──
  const name = `3D Avatar Maker: ${pack.name}`;
  const count = Object.keys(pieces).length + Object.keys(hair).length;
  const terms = [...Object.values(pieces), ...Object.values(hair)].some((entry) => entry.credit)
    ? "free to share with credit to their makers (CC BY; a saved avatar carries the credits)"
    : "free to share (CC0)";
  const tabs = Object.keys(hair).length ? "Clothes and Hair tabs" : "Clothes tab";
  const description = withPackageActivationGuidance(
    id,
    `${count} more ${pack.things ?? "pieces of clothing"} for 3D Avatar Maker's ${tabs}, from the MakeHuman community and ${terms}. Needs 3D Avatar Maker ${maker} or later.`,
  );
  const agentDefinition = {
    id,
    name,
    description,
    author: "ThatOneCan",
    phase: "pre_generation",
    enabledByDefault: false,
    category: "misc",
    runtimeDisabled: true,
    libraryHidden: true,
    modeAllowlist: ["conversation", "roleplay", "game"],
    defaultTools: [],
    defaultSettings: {},
    defaultPromptTemplate: "",
    execution: "feature",
  };
  const agentsBuffer = Buffer.from(`${JSON.stringify([agentDefinition], null, 2)}\n`);

  const manifest = {
    schemaVersion: 2,
    capabilityApi: boundary.capabilityApi,
    builtAgainst: boundary.builtAgainst,
    id,
    name,
    version,
    description,
    engine: { min: ENGINE_MIN, maxExclusive: MAX_ENGINE_EXCLUSIVE },
    kind: ["agent"],
    entrypoints: { agents: "agents.json" },
    // Served at /api/capability-packages/<id>/assets/<path>; the maker finds a pack by its id and avatar-pack.json.
    contributions: { assets: { paths: assets.map((asset) => asset.path) } },
    files: [
      { path: "agents.json", sha256: sha256(agentsBuffer), bytes: agentsBuffer.byteLength },
      ...assets.map((asset) => ({ path: asset.path, sha256: sha256(asset.buffer), bytes: asset.buffer.byteLength })),
    ],
    // None: data files only, no client and no server. The maker reads them through the Engine's asset route.
    permissions: [],
    restartRequired: false,
  };
  const manifestBuffer = Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`);

  // ── Reproducible artifact ──
  const entries = [
    { name: "manifest.json", data: manifestBuffer },
    { name: "agents.json", data: agentsBuffer },
    ...assets.map((asset) => ({ name: asset.path, data: asset.buffer })),
  ];
  const archive = createDeterministicZip(entries);
  const MIB = 1024 * 1024;
  const size = zipSizeCheck(entries, archive.byteLength, { warn: 50 * MIB, refuse: 90 * MIB });
  if (size?.refuse) {
    console.error(`${id} ${version} wasn't built: its zip is ${size.message}`);
    process.exit(1);
  }
  if (size) console.warn(`warning: ${id} ${version}'s zip is ${size.message}`);
  await writeFile(join(packageRoot, "agents.json"), agentsBuffer);
  await writeFile(join(packageRoot, "manifest.json"), manifestBuffer);
  await writeEnglishPackageLocale(packageRoot, manifest, [agentDefinition]);
  await mkdir(artifactsDir, { recursive: true });
  const artifactName = `${id}-${version}.zip`;
  await writeFile(join(artifactsDir, artifactName), archive);

  // Listed in STAGING_ONLY_PACKAGE_IDS, like the maker: writeCatalogFamily puts it in the preview overlay.
  catalog.packages = catalog.packages.filter((entry) => entry.manifest.id !== id);
  catalog.packages.push({
    manifest,
    category: "misc",
    iconUrl: catalogArtworkUrl(id),
    artifact: {
      url: `https://raw.githubusercontent.com/Pasta-Devs/Marinara-Agents/main/artifacts/${artifactName}`,
      sha256: sha256(archive),
      bytes: archive.byteLength,
    },
    documentationUrl: `https://github.com/Pasta-Devs/Marinara-Agents/blob/main/packages/${id}/README.md`,
  });
  console.log(
    `built ${id} ${version}: ${Object.keys(pieces).length} pieces and ${Object.keys(hair).length} hair styles in ${bundlePaths.join(", ")}, artifact ${archive.byteLength} bytes`,
  );
}
catalog.packages.sort((left, right) => left.manifest.name.localeCompare(right.manifest.name));
await writeCatalogFamily(repoRoot, catalog);
