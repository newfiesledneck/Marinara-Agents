// Build the Wanderworld package: bundle its client (with three.js) into one client.js, stamp the
// manifest, agent stub and English locale, write a reproducible artifact zip, and update the catalog
// family. Wanderworld is client-only and needs no Engine checkout to build: three.js and esbuild are
// pinned in this repository's package.json.
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { catalogArtworkUrl } from "./catalog-artwork.mjs";
import { readCatalogFamily, writeCatalogFamily } from "./catalog-lanes.mjs";
import { withPackageActivationGuidance } from "./catalog-package-guidance.mjs";
import { assertClientHostGates } from "./client-host-gates.mjs";
import { createDeterministicZip } from "./deterministic-zip.mjs";
import { assertPackagePrivateImportBoundary } from "./package-engine-boundary.mjs";
import { writeEnglishPackageLocale } from "./package-locales.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageRoot = join(repoRoot, "packages/wanderworld");
const artifactsDir = join(repoRoot, "artifacts");

const VERSION = "0.1.0";
// 1.12: spatial transition commit/reject/refresh events reach the game's own package.
const CAPABILITY_API = Object.freeze({ major: 1, minor: 12 });
// The same floor as Pixelforge, which uses every host seam Wanderworld does.
const ENGINE_MIN = "2.4.5";
const MAX_ENGINE_EXCLUSIVE = "4.0.0";
const THREE_VERSION = "0.186.1"; // matches the Engine's own three.js
const BASE_DESCRIPTION =
  "A walkable low-poly 3D world for Game Mode. Early prototype: walk around a seeded landscape with WASD or the on-screen stick, and see where World Maps says your party is.";

const sha256 = (value) => createHash("sha256").update(value).digest("hex");

const boundary = await assertPackagePrivateImportBoundary({
  sourceRoot: join(packageRoot, "src"),
  boundaryPath: join(packageRoot, "engine-boundary.json"),
  displayName: "Wanderworld",
  capabilityApi: CAPABILITY_API,
});

const threeVersion = JSON.parse(await readFile(join(repoRoot, "node_modules/three/package.json"), "utf8")).version;
if (threeVersion !== THREE_VERSION) {
  throw new Error(`Wanderworld expects three ${THREE_VERSION}, found ${threeVersion}; run npm ci`);
}

// ── Client bundle ────────────────────────────────────────────────────────────
const bundled = await build({
  absWorkingDir: repoRoot,
  entryPoints: ["packages/wanderworld/src/main.js"],
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
      `// Wanderworld ${VERSION} — Marinara Engine game-surface Experience (single-file client bundle, includes three.js ${THREE_VERSION}, MIT)\n` +
      "// Built from packages/wanderworld/src by scripts/build-wanderworld-package.mjs. Do not edit; edit src/ and rebuild.",
  },
});
assertClientHostGates({
  packageId: "wanderworld",
  metafile: bundled.metafile,
  workingDir: repoRoot,
  overlayRoot: join(repoRoot, "sources/host-client-overlay"),
});
const clientBuffer = Buffer.from(bundled.outputFiles[0].contents);

// ── Agent definition stub: satisfies the catalog loader; runtime-inert ───────
const description = withPackageActivationGuidance("wanderworld", BASE_DESCRIPTION);
const agentDefinition = {
  id: "wanderworld",
  name: "Wanderworld",
  description,
  author: "Pasta Devs",
  phase: "pre_generation",
  enabledByDefault: false,
  category: "misc",
  runtimeDisabled: true,
  libraryHidden: true,
  modeAllowlist: ["game"],
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
  id: "wanderworld",
  name: "Wanderworld",
  version: VERSION,
  description,
  engine: { min: ENGINE_MIN, maxExclusive: MAX_ENGINE_EXCLUSIVE },
  kind: ["agent"],
  entrypoints: { agents: "agents.json", client: "client.js" },
  contributions: {
    slots: ["game-surface"],
    gameSurface: { surfaceClass: "wanderworld-surface" },
  },
  files: [
    { path: "agents.json", sha256: sha256(agentsBuffer), bytes: agentsBuffer.byteLength },
    { path: "client.js", sha256: sha256(clientBuffer), bytes: clientBuffer.byteLength },
  ],
  // chat-read: the client reads the chat's World Maps state. ui: it draws the Game Mode surface.
  permissions: ["chat-read", "ui"],
  restartRequired: false,
};

await writeFile(join(packageRoot, "client.js"), clientBuffer);
await writeFile(join(packageRoot, "agents.json"), agentsBuffer);
const manifestBuffer = Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`);
await writeFile(join(packageRoot, "manifest.json"), manifestBuffer);
await writeEnglishPackageLocale(packageRoot, manifest, [agentDefinition]);

// ── Reproducible artifact ────────────────────────────────────────────────────
const archive = createDeterministicZip([
  { name: "manifest.json", data: manifestBuffer },
  { name: "agents.json", data: agentsBuffer },
  { name: "client.js", data: clientBuffer },
]);
await mkdir(artifactsDir, { recursive: true });
const artifactName = `wanderworld-${VERSION}.zip`;
await writeFile(join(artifactsDir, artifactName), archive);

// ── Catalog family ───────────────────────────────────────────────────────────
// Listed in INCOMPLETE_PACKAGE_IDS, so writeCatalogFamily leaves it out of every committed catalog;
// a dev build with MARINARA_CATALOG_INCLUDE_INCOMPLETE=1 publishes it for local testing.
const { catalog } = await readCatalogFamily(repoRoot);
catalog.packages = catalog.packages.filter((entry) => entry.manifest.id !== "wanderworld");
catalog.packages.push({
  manifest,
  category: "misc",
  iconUrl: catalogArtworkUrl("wanderworld"),
  artifact: {
    url: `https://raw.githubusercontent.com/Pasta-Devs/Marinara-Agents/main/artifacts/${artifactName}`,
    sha256: sha256(archive),
    bytes: archive.byteLength,
  },
  documentationUrl: "https://github.com/Pasta-Devs/Marinara-Agents/blob/main/packages/wanderworld/README.md",
});
catalog.packages.sort((left, right) => left.manifest.name.localeCompare(right.manifest.name));
await writeCatalogFamily(repoRoot, catalog);

console.log(`built wanderworld ${VERSION}`);
console.log(`  client.js ${clientBuffer.byteLength} bytes, artifact ${archive.byteLength} bytes`);
