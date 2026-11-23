// Build the 3D Avatar Maker package, a Home tab app: bundle its client (with three.js) into one client.js,
// stamp the manifest, agent stub and English locale, write a reproducible artifact zip, and update the
// catalog family. It has no server part. It needs no Engine checkout to build: three.js and esbuild are
// pinned in this repository's package.json.
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { catalogArtworkUrl } from "./catalog-artwork.mjs";
import { readCatalogFamily, writeCatalogFamily } from "./catalog-lanes.mjs";
import { withPackageActivationGuidance } from "./catalog-package-guidance.mjs";
import { assertClientHostGates } from "./client-host-gates.mjs";
import { createDeterministicZip, zipSizeCheck } from "./deterministic-zip.mjs";
import { assertPackagePrivateImportBoundary } from "./package-engine-boundary.mjs";
import { writeEnglishPackageLocale } from "./package-locales.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PACKAGE_ID = "3d-avatar-maker";
const NAME = "3D Avatar Maker";
const packageRoot = join(repoRoot, "packages", PACKAGE_ID);
const artifactsDir = join(repoRoot, "artifacts");

const VERSION = "0.1.10";
// A Home tab with its own icon, serving its own asset files (the kit: bodies, hair, clothing). The
// Capability API and Engine minimum are Wanderworld's, the package this one began from, which uses the
// same two surfaces (a Home tab and package assets).
const CAPABILITY_API = Object.freeze({ major: 1, minor: 66 });
const ENGINE_MIN = "2.4.6";
const MAX_ENGINE_EXCLUSIVE = "4.0.0";
const THREE_VERSION = "0.186.1"; // matches the Engine's own three.js
const TAB_ICON = "3d-avatar-maker-icon.webp";
const BASE_DESCRIPTION =
  "Build a 3D avatar for a character or persona on its own Home tab: choose a body, shape it, pick skin, eyes, hair and clothes, then save it as a VRM or GLB file and import it under the 3D Avatars agent. No other software is needed. Alpha: the avatar blinks, talks, shows feelings and swings its hair; more is coming.";

const sha256 = (value) => createHash("sha256").update(value).digest("hex");

const boundary = await assertPackagePrivateImportBoundary({
  sourceRoot: join(packageRoot, "src"),
  boundaryPath: join(packageRoot, "engine-boundary.json"),
  displayName: NAME,
  capabilityApi: CAPABILITY_API,
});

const threeVersion = JSON.parse(await readFile(join(repoRoot, "node_modules/three/package.json"), "utf8")).version;
if (threeVersion !== THREE_VERSION) {
  throw new Error(`${NAME} expects three ${THREE_VERSION}, found ${threeVersion}; run npm ci`);
}

// ── Client bundle ────────────────────────────────────────────────────────────
const bundled = await build({
  absWorkingDir: repoRoot,
  entryPoints: [`packages/${PACKAGE_ID}/src/main.js`],
  bundle: true,
  format: "iife",
  platform: "browser",
  target: "es2022",
  minify: true,
  charset: "utf8",
  legalComments: "eof", // keeps three.js's MIT notice in the bundle
  metafile: true,
  write: false,
  logLevel: "silent",
  banner: {
    js:
      `// ${NAME} ${VERSION} — Marinara Engine Home tab app (single-file client bundle, includes three.js ${THREE_VERSION}, MIT)\n` +
      `// Built from packages/${PACKAGE_ID}/src by scripts/build-${PACKAGE_ID}-package.mjs. Do not edit; edit src/ and rebuild.`,
  },
});
assertClientHostGates({
  packageId: PACKAGE_ID,
  metafile: bundled.metafile,
  workingDir: repoRoot,
  overlayRoot: join(repoRoot, "sources/host-client-overlay"),
});
const clientBuffer = Buffer.from(bundled.outputFiles[0].contents);
const iconBuffer = await readFile(join(packageRoot, TAB_ICON));

// ── The kit: the bodies, hair, skins, eyes and clothing the maker loads when it needs them ─
// Served by the Engine at /api/capability-packages/3d-avatar-maker/assets/<path> because
// contributions.assets.paths names them. A package may list at most 256 asset files.
async function filesUnder(directory, prefix) {
  const entries = await readdir(directory, { withFileTypes: true });
  const found = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const path = `${prefix}/${entry.name}`;
    if (entry.isDirectory()) found.push(...(await filesUnder(join(directory, entry.name), path)));
    else if (/\.(?:json|webp|png)$/u.test(entry.name)) found.push(path);
  }
  return found;
}
const kitPaths = await filesUnder(join(packageRoot, "kit"), "kit");
if (kitPaths.length > 256) throw new Error(`${NAME}'s kit has ${kitPaths.length} files; a package may list 256`);
const kitPayloads = [];
for (const path of kitPaths) kitPayloads.push({ path, buffer: await readFile(join(packageRoot, path)) });

// ── Agent definition stub: satisfies the catalog loader; runtime-inert ───────
const description = withPackageActivationGuidance(PACKAGE_ID, BASE_DESCRIPTION);
const agentDefinition = {
  id: PACKAGE_ID,
  name: NAME,
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
  id: PACKAGE_ID,
  name: NAME,
  version: VERSION,
  description,
  engine: { min: ENGINE_MIN, maxExclusive: MAX_ENGINE_EXCLUSIVE },
  kind: ["agent"],
  entrypoints: { agents: "agents.json", client: "client.js" },
  contributions: {
    slots: ["home-browser-tab"],
    homeBrowserTab: { label: NAME, ariaLabel: `Open ${NAME}`, iconPaths: [TAB_ICON] },
    assets: { paths: kitPaths },
  },
  files: [
    { path: "agents.json", sha256: sha256(agentsBuffer), bytes: agentsBuffer.byteLength },
    { path: "client.js", sha256: sha256(clientBuffer), bytes: clientBuffer.byteLength },
    { path: TAB_ICON, sha256: sha256(iconBuffer), bytes: iconBuffer.byteLength },
    ...kitPayloads.map((asset) => ({ path: asset.path, sha256: sha256(asset.buffer), bytes: asset.buffer.byteLength })),
  ],
  // ui: it draws its own Home tab. It also reads your persona and character lists (names only) through the
  //   Engine's same-origin routes, to offer who an avatar is for, and the installed-package list, to find
  //   its wardrobe packs (active packages named 3d-avatar-maker-*, declaring avatar-pack.json), whose
  //   declared assets (the index and clothing bundles) it then reads and checks as data. It runs nothing
  //   from a pack. It writes nothing to the Engine: an avatar leaves as a file the user saves and imports
  //   under the 3D Avatars agent themselves. Drafts are kept in the browser under this package's own keys.
  permissions: ["ui"],
  // Client only, so it's ready as soon as it's installed.
  restartRequired: false,
};

const manifestBuffer = Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`);

// ── Reproducible artifact ────────────────────────────────────────────────────
const entries = [
  { name: "manifest.json", data: manifestBuffer },
  { name: "agents.json", data: agentsBuffer },
  { name: "client.js", data: clientBuffer },
  { name: TAB_ICON, data: iconBuffer },
  ...kitPayloads.map((asset) => ({ name: asset.path, data: asset.buffer })),
];
const archive = createDeterministicZip(entries);
// GitHub warns about a file over 50 MiB and refuses one over 100, and the Engine won't download a package
// over 100: a warning above 50, and nothing is written above 90, with the largest files named.
const MIB = 1024 * 1024;
const size = zipSizeCheck(entries, archive.byteLength, { warn: 50 * MIB, refuse: 90 * MIB });
if (size?.refuse) {
  console.error(`${PACKAGE_ID} ${VERSION} wasn't built: its zip is ${size.message}`);
  process.exit(1);
}
if (size) console.warn(`warning: ${PACKAGE_ID} ${VERSION}'s zip is ${size.message}`);

await writeFile(join(packageRoot, "client.js"), clientBuffer);
await writeFile(join(packageRoot, "agents.json"), agentsBuffer);
await writeFile(join(packageRoot, "manifest.json"), manifestBuffer);
await writeEnglishPackageLocale(packageRoot, manifest, [agentDefinition]);
await mkdir(artifactsDir, { recursive: true });
const artifactName = `${PACKAGE_ID}-${VERSION}.zip`;
await writeFile(join(artifactsDir, artifactName), archive);

// ── Catalog family ───────────────────────────────────────────────────────────
// Listed in STAGING_ONLY_PACKAGE_IDS, so writeCatalogFamily moves it to the preview overlay for Engine
// `staging` testers and keeps it out of the published lanes.
const { catalog } = await readCatalogFamily(repoRoot);
catalog.packages = catalog.packages.filter((entry) => entry.manifest.id !== PACKAGE_ID);
catalog.packages.push({
  manifest,
  category: "misc",
  iconUrl: catalogArtworkUrl(PACKAGE_ID),
  artifact: {
    url: `https://raw.githubusercontent.com/Pasta-Devs/Marinara-Agents/main/artifacts/${artifactName}`,
    sha256: sha256(archive),
    bytes: archive.byteLength,
  },
  documentationUrl: `https://github.com/Pasta-Devs/Marinara-Agents/blob/main/packages/${PACKAGE_ID}/README.md`,
});
catalog.packages.sort((left, right) => left.manifest.name.localeCompare(right.manifest.name));
await writeCatalogFamily(repoRoot, catalog);

console.log(`built ${PACKAGE_ID} ${VERSION}`);
console.log(
  `  client.js ${clientBuffer.byteLength} bytes, ${kitPayloads.length} kit files, artifact ${archive.byteLength} bytes`,
);
