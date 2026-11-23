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
import { CLOTH_SLOTS } from "../packages/3d-avatar-maker/src/looks.js";
import { MESH_KINDS, writePacked } from "./3d-avatar-maker-packed.mjs";
import { bodyReach, bundler, packOutfitPieces } from "./build-3d-avatar-maker-kit.mjs";
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
  "3d-avatar-maker-wardrobe-clothes": "0.1.00",
  "3d-avatar-maker-wardrobe-accessories": "0.2.00",
};
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

  // ── The pieces: bundles in the maker's format, every picture named for the pack ──
  const files = (existsSync(models) ? await readdir(models) : [])
    .filter((name) => /^outfit-[a-z0-9_]+\.glb$/u.test(name))
    .sort();
  const fitted = files.map((file) => file.slice("outfit-".length, -4));
  const missing = Object.keys(pack.pieces).filter((piece) => !fitted.includes(piece));
  if (missing.length) throw new Error(`${id}: fit ${missing.join(", ")} first (assets/scripts/make_mh_packs.py)`);
  const stray = fitted.filter((piece) => !pack.pieces[piece]);
  if (stray.length) throw new Error(`${id}: ${stray.join(", ")} fitted but not in assets/packs.json`);
  await rm(join(packageRoot, "wardrobe"), { recursive: true, force: true });
  await mkdir(join(packageRoot, "wardrobe"), { recursive: true });
  const source = `Clothes: MakeHuman community (CC0 and as each piece says), fitted in Blender by ThatOneCan (packages/3d-avatar-maker/assets/scripts/make_mh_packs.py)`;
  const bundles = bundler(source);
  const outfits = packOutfitPieces({
    dir: models,
    files,
    reach,
    shares,
    bundler: bundles,
    slotOf: (piece, file) => {
      const slot = pack.pieces[piece].slot;
      if (!CLOTH_SLOTS.some(([each]) => each === slot)) throw new Error(`${file}: "${slot}" isn't a CLOTH_SLOTS slot`);
      return slot;
    },
    bundleOf: (slot) => {
      const name = `wardrobe/${CLOTH_SLOTS.find(([each]) => each === slot)[3]}.pack.png`;
      return [name, join(packageRoot, name)];
    },
    // (The maker caches pictures by name, so a pack's are named for it.)
    pictureName: (piece, image) => `${id}-${piece}-${image}`,
  });
  for (const [path, bundle] of bundles.bundles) writePacked(path, bundle, MESH_KINDS);

  // ── avatar-pack.json: what the maker reads first (src/packs.js readPack) ──
  const pieces = {};
  for (const piece of Object.keys(outfits).sort()) {
    const spec = pack.pieces[piece];
    const info = outfits[piece];
    const entry = bundles.bundles.get(join(packageRoot, info.bundle)).pieces[piece];
    const licence = spec.licence ?? pack.licence;
    const credit = licence === "CC0-1.0" ? null : creditLine(spec, licence);
    if (!/^[a-z0-9_]{1,64}$/u.test(piece)) throw new Error(`${id}: piece id "${piece}"`);
    if (!spec.label || spec.label.length > 60 || !spec.author || spec.author.length > 80)
      throw new Error(`${id} ${piece}: a label of at most 60 characters and an author of at most 80`);
    if (!LICENCES.has(licence) || (licence !== "CC0-1.0") !== Boolean(credit))
      throw new Error(`${id} ${piece}: licence ${licence} with credit ${credit} (CC-BY needs a credit, CC0 none)`);
    if (info.variants?.length) throw new Error(`${id} ${piece}: the maker offers no pack variants yet`);
    pieces[piece] = {
      label: spec.label,
      slot: info.slot,
      bodies: info.bodies,
      layer: entry.layer,
      hides: entry.hides,
      parts: info.parts,
      variants: [],
      bundle: info.bundle,
      licence,
      author: spec.author,
      source: spec.source,
      credit,
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
  };
  const indexBuffer = Buffer.from(`${JSON.stringify(index, null, 1)}\n`);
  await writeFile(join(packageRoot, "avatar-pack.json"), indexBuffer);
  const bundlePaths = [...new Set(Object.values(pieces).map((piece) => piece.bundle))].sort();
  const assets = [{ path: "avatar-pack.json", buffer: indexBuffer }];
  for (const path of bundlePaths) assets.push({ path, buffer: await readFile(join(packageRoot, path)) });

  // ── Agent definition stub: satisfies the catalog loader; runtime-inert (the maker's own) ──
  const name = `3D Avatar Maker: ${pack.name}`;
  const count = Object.keys(pieces).length;
  const terms = Object.values(pieces).some((piece) => piece.credit)
    ? "free to share with credit to their makers (CC BY; a saved avatar carries the credits)"
    : "free to share (CC0)";
  const description = withPackageActivationGuidance(
    id,
    `${count} more ${pack.things ?? "pieces of clothing"} for 3D Avatar Maker's Clothes tab, from the MakeHuman community and ${terms}. Needs 3D Avatar Maker ${maker} or later.`,
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
    `built ${id} ${version}: ${count} pieces in ${bundlePaths.join(", ")}, artifact ${archive.byteLength} bytes`,
  );
}
catalog.packages.sort((left, right) => left.manifest.name.localeCompare(right.manifest.name));
await writeCatalogFamily(repoRoot, catalog);
