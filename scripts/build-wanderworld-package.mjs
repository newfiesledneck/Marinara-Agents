// Build the Wanderworld package, a Home screen game: bundle its client (with three.js) into one
// client.js, stamp the manifest, agent stub and English locale, write a reproducible artifact zip, and
// update the catalog family, with its hand-written server.mjs. It needs no Engine checkout to build: three.js and
// esbuild are pinned in this repository's package.json.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
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

const VERSION = "0.5.21";
// A Home tab with its own icon, serving its own asset files (the kit: people, props), and a server part for
// model calls, pictures and scenes. Capability API 1.66 is the scene origin (`scenes`); the Engine minimum
// matches Slurp 2's, the other package with scenes.
const CAPABILITY_API = Object.freeze({ major: 1, minor: 66 });
const ENGINE_MIN = "2.4.6";
const MAX_ENGINE_EXCLUSIVE = "4.0.0";
const THREE_VERSION = "0.186.1"; // matches the Engine's own three.js
const TAB_ICON = "wanderworld-icon.webp";
const BASE_DESCRIPTION =
  "A walkable low-poly 3D world on its own Home tab: towns, farms and wild land made from a seed, lived in by your characters, who keep their own days. Walk it as your persona, talk to people with AI replies, start scenes, and illustrate the moment. Alpha.";

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
const iconBuffer = await readFile(join(packageRoot, TAB_ICON));

// ── The kit: asset files the game loads when it needs them (people, props …) ─
// Made from free CC0 packs by scripts/build-wanderworld-people.mjs and friends, and served by the Engine
// at /api/capability-packages/wanderworld/assets/<path> because contributions.assets.paths names them.
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
const kitPayloads = [];
for (const path of kitPaths) kitPayloads.push({ path, buffer: await readFile(join(packageRoot, path)) });

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
  modeAllowlist: ["conversation", "roleplay", "game"],
  defaultTools: [],
  defaultSettings: {},
  defaultPromptTemplate: "",
  execution: "feature",
};
const agentsBuffer = Buffer.from(`${JSON.stringify([agentDefinition], null, 2)}\n`);

// ── Server part (hand-written server.mjs, syntax-checked like Quartermaster's) ──────────────────
const serverBuffer = Buffer.from(
  (await readFile(join(packageRoot, "server.mjs"), "utf8")).replace(/\r\n/gu, "\n"),
  "utf8",
);
const syntaxDir = await mkdtemp(join(tmpdir(), "wanderworld-server-syntax-"));
try {
  const checkPath = join(syntaxDir, "server.check.mjs");
  await writeFile(checkPath, serverBuffer);
  const checked = spawnSync(process.execPath, ["--check", checkPath], { encoding: "utf8" });
  if (checked.status !== 0)
    throw new Error(checked.stderr || checked.stdout || "Wanderworld server.mjs failed the syntax check");
} finally {
  await rm(syntaxDir, { recursive: true, force: true });
}

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
  entrypoints: { agents: "agents.json", client: "client.js", server: "server.mjs" },
  contributions: {
    slots: ["home-browser-tab"],
    homeBrowserTab: { label: "Wanderworld", ariaLabel: "Open Wanderworld", iconPaths: [TAB_ICON] },
    assets: { paths: kitPaths },
  },
  files: [
    { path: "agents.json", sha256: sha256(agentsBuffer), bytes: agentsBuffer.byteLength },
    { path: "client.js", sha256: sha256(clientBuffer), bytes: clientBuffer.byteLength },
    { path: "server.mjs", sha256: sha256(serverBuffer), bytes: serverBuffer.byteLength },
    { path: TAB_ICON, sha256: sha256(iconBuffer), bytes: iconBuffer.byteLength },
    ...kitPayloads.map((asset) => ({ path: asset.path, sha256: sha256(asset.buffer), bytes: asset.buffer.byteLength })),
  ],
  // ui: it draws its own Home tab. It also reads your persona and character lists and their 3D Avatars
  //   models through the Engine's same-origin routes, which no other permission name describes.
  // routes: server.mjs serves /api/wanderworld (status, connections, talk, image, scene contexts and recaps).
  // storage: scene contexts until the Engine's planner reads them, and scene recaps until the client keeps
  //   them (persistence.documents, kinds "scene-origin" and "scene-result").
  // network: server.mjs's loopback to the Engine's own REST API on 127.0.0.1 (GET /api/connections for the
  //   AI settings, POST /api/characters/avatar-generation for pictures), as Quartermaster and Gacha Forge
  //   do: the capability runtime has no image or connection-list method. Nothing leaves the machine except
  //   through the user's own Engine connections.
  // scenes: a scene origin (api.registerSceneOrigin), so a scene started in the world gets its cast,
  //   persona, connection, notes and lorebooks, and its recap comes back (Capability API 1.66).
  permissions: ["network", "routes", "scenes", "storage", "ui"],
  // Privileged routes only start with the Engine: the Engine refuses `routes` without a restart.
  restartRequired: true,
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
  { name: "server.mjs", data: serverBuffer },
  { name: TAB_ICON, data: iconBuffer },
  ...kitPayloads.map((asset) => ({ name: asset.path, data: asset.buffer })),
]);
await mkdir(artifactsDir, { recursive: true });
const artifactName = `wanderworld-${VERSION}.zip`;
await writeFile(join(artifactsDir, artifactName), archive);

// ── Catalog family ───────────────────────────────────────────────────────────
// Listed in STAGING_ONLY_PACKAGE_IDS, so writeCatalogFamily moves it to the preview overlay for Engine
// `staging` testers and keeps it out of the published lanes.
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
console.log(
  `  client.js ${clientBuffer.byteLength} bytes, ${kitPayloads.length} kit files, artifact ${archive.byteLength} bytes`,
);
