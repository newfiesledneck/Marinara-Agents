// Dev-only, quartermaster-dev-catalog-only post-processing step: repoints every OTHER
// package's artifact.url from the official Pasta-Devs/Marinara-Agents/main location to this
// fork's quartermaster-dev-catalog branch, so a local Engine pointed at THIS branch's
// catalog.json (via MARINARA_AGENT_CATALOG_URL) can install/update any agent -- not just
// Quartermaster -- without ever swapping the .env override back and forth.
//
// Why this is safe to do here and nowhere else: merging staging into
// quartermaster-dev-catalog already brings every other package's real artifact ZIP along with
// it (artifacts/ is a normal tracked directory, same as any other package's payload) -- the
// only thing wrong is that the catalog still points at the official host instead of this
// fork's copy of the exact same bytes. This script only ever rewrites a URL to point at a file
// that's already sitting right here, verified by hash, never anything else. It must never run
// as part of a real Quartermaster build -- see CONTRIBUTING.md's "canonical same-repository
// artifact URLs" requirement and this repo's own dev-catalog-leakage check (release-process.md
// §5) for why.
//
// Usage: run AFTER the normal `node scripts/build-quartermaster-package.mjs` dev build (with
// MARINARA_CATALOG_INCLUDE_INCOMPLETE=1 set), on quartermaster-dev-catalog only:
//   node scripts/dev-repoint-catalog-artifacts.mjs
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));

const OFFICIAL_OWNER_REPO = "Pasta-Devs/Marinara-Agents";
const FORK_OWNER_REPO = "newfiesledneck/Marinara-Agents";
const FORK_BRANCH = "quartermaster-dev-catalog";

const OFFICIAL_ARTIFACT_BASE = `https://raw.githubusercontent.com/${OFFICIAL_OWNER_REPO}/main/artifacts/`;
const FORK_ARTIFACT_BASE = `https://raw.githubusercontent.com/${FORK_OWNER_REPO}/${FORK_BRANCH}/artifacts/`;

const CATALOG_FILES = [
  "catalog/catalog.json",
  "catalog/v2/catalog.json",
  "catalog/v3/catalog.json",
  "catalog/preview/catalog.json",
  "catalog/preview/v2/catalog.json",
  "catalog/preview/v3/catalog.json",
];

async function sha256File(path) {
  try {
    const buffer = await readFile(path);
    return createHash("sha256").update(buffer).digest("hex");
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

let totalRewritten = 0;
let totalSkipped = 0;

for (const relativePath of CATALOG_FILES) {
  const path = join(repoRoot, relativePath);
  let raw;
  try {
    raw = await readFile(path, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") continue; // preview files don't always exist -- fine
    throw error;
  }

  const catalog = JSON.parse(raw);
  let changed = false;

  for (const entry of catalog.packages ?? []) {
    const url = entry.artifact?.url;
    if (typeof url !== "string" || !url.startsWith(OFFICIAL_ARTIFACT_BASE)) continue;

    const filename = url.slice(OFFICIAL_ARTIFACT_BASE.length);
    const localPath = join(repoRoot, "artifacts", filename);
    const localHash = await sha256File(localPath);

    if (localHash === null) {
      console.log(`skip ${entry.manifest?.id ?? "?"}: artifacts/${filename} doesn't exist locally`);
      totalSkipped += 1;
      continue;
    }
    if (localHash !== entry.artifact.sha256) {
      console.log(`skip ${entry.manifest?.id ?? "?"}: artifacts/${filename} exists but its hash doesn't match the catalog entry`);
      totalSkipped += 1;
      continue;
    }

    entry.artifact.url = `${FORK_ARTIFACT_BASE}${filename}`;
    changed = true;
    totalRewritten += 1;
  }

  if (changed) await writeFile(path, `${JSON.stringify(catalog, null, 2)}\n`);
}

console.log(`dev-repoint-catalog-artifacts: rewrote ${totalRewritten} artifact URL(s), skipped ${totalSkipped}`);
